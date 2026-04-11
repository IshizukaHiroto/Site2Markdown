/**
 * Site2Markdown - Popup Script
 */

const DEFAULT_SETTINGS = {
  removeAds:               false,
  removeHeader:            true,
  removeFooter:            true,
  removeNav:               true,
  removeSidebar:           false,
  imageHandling:           'keep',
  linkHandling:            'keep',
  collapseBlankLines:      false,
  headingShift:            0,
  extractionMode:          'readability',
  selectionOnly:           false,
  frontmatterEnabled:      true,
  frontmatterTitle:        true,
  frontmatterUrl:          true,
  frontmatterDate:         true,
  frontmatterDescription:  false,
  frontmatterAuthor:       false,
  frontmatterTags:         false,
  frontmatterTagsValue:    '',
  frontmatterCustom:       '',
  filenameDateFormat:      'YYYY-MM-DD',
  filenameSeparator:       '_',
  filenameTitleMaxLength:  50,
  autoCopy:                false,
};

// ── 文字列定数 ─────────────────────────────────────────────────────────────────

const T = {
  untitled:    '(無題)',
  autoCopied:  '自動コピーしました',
  copied:      'コピーしました',
  copyFailed:  'コピーに失敗しました',
  saved:       '保存しました',
  saveFailed:  '保存に失敗しました',
  convFailed:  '変換に失敗しました',
  restricted:  'このページでは実行できません',
};

// ── State ─────────────────────────────────────────────────────────────────────

let currentTitle = 'untitled';
let downloadUrl  = null;

// ── UI helpers ────────────────────────────────────────────────────────────────

function showStatus(msg, isError = false) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.className = isError ? 'error' : '';
  if (!isError && msg) {
    setTimeout(() => { el.textContent = ''; }, 2500);
  }
}

function setButtonsEnabled(enabled) {
  document.getElementById('copyBtn').disabled     = !enabled;
  document.getElementById('saveBtn').disabled     = !enabled;
  document.getElementById('saveMenuBtn').disabled = !enabled;
}

function updateCharCount(text) {
  const el = document.getElementById('char-count');
  if (!el) return;
  if (!text) { el.classList.remove('visible'); return; }
  const chars  = text.length;
  const tokens = Math.round(chars / 3.5);
  el.textContent = `${chars.toLocaleString()} chars · ~${tokens.toLocaleString()} tokens`;
  el.classList.add('visible');
}

function setPageInfo(tab) {
  const titleEl = document.getElementById('page-title');
  titleEl.textContent = tab.title || T.untitled;
  delete titleEl.dataset.i18nLoading;
  titleEl.dataset.loaded = '1';

  try {
    const url = new URL(tab.url);
    const domainEl = document.getElementById('page-domain');
    if (domainEl) domainEl.textContent = url.hostname;
    document.getElementById('page-url').textContent =
      url.pathname !== '/' ? url.pathname : '';
  } catch {
    const domainEl = document.getElementById('page-domain');
    if (domainEl) domainEl.textContent = '';
    document.getElementById('page-url').textContent = tab.url || '';
  }

  if (tab.favIconUrl) {
    const faviconContainer = document.getElementById('page-favicon');
    const img = document.createElement('img');
    img.src = tab.favIconUrl;
    img.alt = '';
    img.width = 14;
    img.height = 14;
    faviconContainer.replaceChildren(img);
  }
}

function applyPropertyVisibility(settings) {
  const show = settings.frontmatterEnabled;
  document.getElementById('properties-section').style.display = show ? '' : 'none';
  if (show) {
    document.getElementById('prop-title-row').classList.toggle('hidden-row', !settings.frontmatterTitle);
    document.getElementById('prop-url-row').classList.toggle('hidden-row',   !settings.frontmatterUrl);
    document.getElementById('prop-date-row').classList.toggle('hidden-row',  !settings.frontmatterDate);
  }
}

function setPropertyValues(tab) {
  document.getElementById('prop-title-value').textContent = tab.title || T.untitled;
  document.getElementById('prop-url-value').textContent   = tab.url || '';
  document.getElementById('prop-url-value').title         = tab.url || '';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('prop-date-value').textContent  = today;
}

// ── Conversion ────────────────────────────────────────────────────────────────

async function requestConversion(tabId, settings) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: [
          'vendor/Readability.js',
          'vendor/turndown.js',
          'vendor/turndown-plugin-gfm.js',
          'content/content.js',
        ],
      },
      () => {
        if (chrome.runtime.lastError) {
          resolve({ error: T.restricted });
          return;
        }
        chrome.tabs.sendMessage(tabId, { action: 'convert', settings }, (res) => {
          if (chrome.runtime.lastError) {
            resolve({ error: T.convFailed });
            return;
          }
          resolve(res || { error: T.convFailed });
        });
      }
    );
  });
}

// ── Filename ──────────────────────────────────────────────────────────────────

function buildFilename(title, settings) {
  const sep    = settings.filenameSeparator || '_';
  const maxLen = Number(settings.filenameTitleMaxLength) || 50;

  const safeName = title
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, sep)
    .slice(0, maxLen)
    .replace(new RegExp(`[_\\-]+$`), '') || 'untitled';

  const fmt = settings.filenameDateFormat;
  if (!fmt || fmt === 'none') return `${safeName}.md`;

  const today    = new Date().toISOString().split('T')[0];
  const datePart = fmt === 'YYYYMMDD' ? today.replace(/-/g, '') : today;
  return `${datePart}${sep}${safeName}.md`;
}

// ── Properties toggle ─────────────────────────────────────────────────────────

function initPropertiesToggle() {
  const btn     = document.getElementById('properties-toggle');
  const body    = document.getElementById('properties-body');
  const arrow   = document.getElementById('toggle-arrow');
  let collapsed = false;

  btn.addEventListener('click', () => {
    collapsed = !collapsed;
    body.classList.toggle('hidden', collapsed);
    arrow.classList.toggle('collapsed', collapsed);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  initPropertiesToggle();
  setButtonsEnabled(false);

  const [storageResult, [tab]] = await Promise.all([
    new Promise((resolve) =>
      chrome.storage.sync.get({ ...DEFAULT_SETTINGS }, resolve)
    ),
    chrome.tabs.query({ active: true, currentWindow: true }),
  ]);

  const settings = storageResult;

  setPageInfo(tab);
  setPropertyValues(tab);
  applyPropertyVisibility(settings);

  const contentWrapper = document.getElementById('content-wrapper');
  contentWrapper.classList.add('is-loading');

  const response = await requestConversion(tab.id, settings);
  contentWrapper.classList.remove('is-loading');

  if (response.error) {
    document.getElementById('markdownOutput').placeholder = response.error;
    showStatus(response.error, true);
    return;
  }

  currentTitle = response.title || tab.title || 'untitled';
  const markdown = response.markdown;
  document.getElementById('markdownOutput').value = markdown;
  updateCharCount(markdown);
  setButtonsEnabled(true);

  // 自動コピー
  if (settings.autoCopy) {
    try {
      await navigator.clipboard.writeText(markdown);
      showStatus(T.autoCopied);
    } catch { /* silent */ }
  }

  // コピー
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const text = document.getElementById('markdownOutput').value;
    try {
      await navigator.clipboard.writeText(text);
      showStatus(T.copied);
    } catch {
      showStatus(T.copyFailed, true);
    }
  });

  // 文字数カウント更新（編集時）
  document.getElementById('markdownOutput').addEventListener('input', (e) => {
    updateCharCount(e.target.value);
  });

  // 保存
  function doSave(saveAs = false) {
    const text     = document.getElementById('markdownOutput').value;
    const filename = buildFilename(currentTitle, settings);

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    downloadUrl = URL.createObjectURL(blob);

    chrome.downloads.download({ url: downloadUrl, filename, saveAs }, (downloadId) => {
      if (chrome.runtime.lastError) {
        showStatus(T.saveFailed, true);
        return;
      }
      showStatus(T.saved);
      chrome.downloads.onChanged.addListener(function onChanged(delta) {
        if (delta.id === downloadId && delta.state?.current === 'complete') {
          URL.revokeObjectURL(downloadUrl);
          downloadUrl = null;
          chrome.downloads.onChanged.removeListener(onChanged);
        }
      });
    });
  }

  document.getElementById('saveBtn').addEventListener('click', () => doSave(false));

  // 保存メニュー
  const saveMenuBtn = document.getElementById('saveMenuBtn');
  const saveMenu    = document.getElementById('saveMenu');

  saveMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !saveMenu.hidden;
    saveMenu.hidden = isOpen;
    saveMenuBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  document.getElementById('saveAsBtn').addEventListener('click', () => {
    saveMenu.hidden = true;
    saveMenuBtn.setAttribute('aria-expanded', 'false');
    doSave(true);
  });

  document.addEventListener('click', () => {
    if (!saveMenu.hidden) {
      saveMenu.hidden = true;
      saveMenuBtn.setAttribute('aria-expanded', 'false');
    }
  });
});

// ── ヘッダーボタン ─────────────────────────────────────────────────────────────

document.getElementById('optionsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
