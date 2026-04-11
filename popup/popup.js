/**
 * Site2Markdown - Popup Script
 */

const FEEDBACK_URL = 'https://forms.gle/88hU94xJCZkbjaNx5';
const UPGRADE_URL  = 'https://site2markdown.polarphos.com'; // v1.1 で ExtensionPay に切り替え予定

const FREE_DAILY_LIMIT = 5;

const FREE_OVERRIDES = {
  selectionOnly:     false,
  frontmatterCustom: '',
  headingShift:      0,
  linkHandling:      'keep',
  autoCopy:          false,
};

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

// ── i18n ──────────────────────────────────────────────────────────────────────

const I18N = {
  ja: {
    loading:        '読み込み中...',
    converting:     '変換中...',
    properties:     'プロパティ',
    preview:        'Markdown',
    copy:           'コピー',
    save:           '保存',
    saveAs:         '名前をつけて保存',
    copied:         'コピーしました',
    saved:          '保存しました',
    autoCopied:     '自動コピーしました',
    copyFailed:     'コピーに失敗しました',
    saveFailed:     '保存に失敗しました',
    convFailed:     '変換に失敗しました',
    restricted:     'このページでは実行できません',
    upgradeText:    'Pro機能でさらに便利に',
    upgradeBtn:     'アップグレード — $9',
    untitled:       '(無題)',
    feedbackLabel:  'フィードバックを送る',
    settingsLabel:  '設定を開く',
    langNext:       'English',
    limitReached:   `今日の無料枠（${FREE_DAILY_LIMIT}サイト）を使い切りました`,
    limitHint:      'Pro版を購入すると無制限に使えます',
    usageCount:     (n) => `今日 ${n}/${FREE_DAILY_LIMIT} 使用済み · `,
  },
  en: {
    loading:        'Loading...',
    converting:     'Converting...',
    properties:     'Properties',
    preview:        'Markdown',
    copy:           'Copy',
    save:           'Save',
    saveAs:         'Save As...',
    copied:         'Copied',
    saved:          'Saved',
    autoCopied:     'Auto-copied',
    copyFailed:     'Copy failed',
    saveFailed:     'Save failed',
    convFailed:     'Conversion failed',
    restricted:     'Cannot run on this page',
    upgradeText:    'Unlock Pro features',
    upgradeBtn:     'Upgrade — $9',
    untitled:       '(Untitled)',
    feedbackLabel:  'Send feedback',
    settingsLabel:  'Open settings',
    langNext:       '日本語',
    limitReached:   `You've reached today's free limit (${FREE_DAILY_LIMIT} sites)`,
    limitHint:      'Purchase Pro for unlimited conversions',
    usageCount:     (n) => `Today ${n}/${FREE_DAILY_LIMIT} used · `,
  },
};

// ── State ─────────────────────────────────────────────────────────────────────

let currentTitle = 'untitled';
let downloadUrl  = null;
let currentLang  = 'ja';
let currentT     = I18N.ja;

// ── Language ──────────────────────────────────────────────────────────────────

function applyLanguage(lang) {
  currentLang = lang;
  currentT    = I18N[lang];
  document.documentElement.lang = lang;

  document.getElementById('prop-section-title').textContent    = currentT.properties;
  document.getElementById('content-title-text').textContent    = currentT.preview;
  document.getElementById('copy-label').textContent            = currentT.copy;
  document.getElementById('save-label').textContent            = currentT.save;
  document.getElementById('saveAsBtn').textContent             = currentT.saveAs;
  document.getElementById('upgrade-text').textContent          = currentT.upgradeText;
  document.getElementById('upgradeBtn').textContent            = currentT.upgradeBtn;
  document.getElementById('langBtn').textContent               = lang === 'ja' ? 'EN' : 'JP';
  document.getElementById('langBtn').title                     = currentT.langNext;
  document.getElementById('feedbackBtn').setAttribute('aria-label', currentT.feedbackLabel);
  document.getElementById('feedbackBtn').title                 = currentT.feedbackLabel;
  document.getElementById('optionsBtn').setAttribute('aria-label', currentT.settingsLabel);
  document.getElementById('optionsBtn').title                  = currentT.settingsLabel;

  const textarea = document.getElementById('markdownOutput');
  if (!textarea.value) textarea.placeholder = currentT.converting;

  const pageTitle = document.getElementById('page-title');
  if (pageTitle.dataset.i18nLoading !== undefined && !pageTitle.dataset.loaded) {
    pageTitle.textContent = currentT.loading;
  }
}

async function initLanguage() {
  const { uiLanguage } = await new Promise(resolve =>
    chrome.storage.sync.get({ uiLanguage: 'auto' }, resolve)
  );
  let lang = uiLanguage;
  if (lang === 'auto') {
    lang = navigator.language.startsWith('ja') ? 'ja' : 'en';
  }
  applyLanguage(lang);
  return lang;
}

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
  document.getElementById('copyBtn').disabled    = !enabled;
  document.getElementById('saveBtn').disabled    = !enabled;
  document.getElementById('saveMenuBtn').disabled = !enabled;
}

function updateCharCount(text) {
  const el = document.getElementById('char-count');
  if (!el) return;
  if (!text) { el.classList.remove('visible'); return; }
  const chars = text.length;
  const tokens = Math.round(chars / 3.5);
  el.textContent = `${chars.toLocaleString()} chars · ~${tokens.toLocaleString()} tokens`;
  el.classList.add('visible');
}

function setPageInfo(tab) {
  const titleEl = document.getElementById('page-title');
  titleEl.textContent = tab.title || currentT.untitled;
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
  document.getElementById('prop-title-value').textContent = tab.title || currentT.untitled;
  document.getElementById('prop-url-value').textContent   = tab.url || '';
  document.getElementById('prop-url-value').title         = tab.url || '';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('prop-date-value').textContent  = today;
}

// ── Daily usage（無料プランの1日5回制限） ─────────────────────────────────────

function _today() {
  return new Date().toISOString().slice(0, 10);
}

async function getDailyCount() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ dailyUsage: { date: '', count: 0 } }, (result) => {
      resolve(result.dailyUsage.date === _today() ? result.dailyUsage.count : 0);
    });
  });
}

async function incrementDailyCount() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ dailyUsage: { date: '', count: 0 } }, (result) => {
      const current = result.dailyUsage.date === _today() ? result.dailyUsage.count : 0;
      chrome.storage.local.set({ dailyUsage: { date: _today(), count: current + 1 } }, resolve);
    });
  });
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
          resolve({ error: currentT.restricted });
          return;
        }
        chrome.tabs.sendMessage(tabId, { action: 'convert', settings }, (res) => {
          if (chrome.runtime.lastError) {
            resolve({ error: currentT.convFailed });
            return;
          }
          resolve(res || { error: currentT.convFailed });
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
  const btn    = document.getElementById('properties-toggle');
  const body   = document.getElementById('properties-body');
  const arrow  = document.getElementById('toggle-arrow');
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

  // 言語 + 設定 + タブを並列取得
  const [lang, storageResult, [tab]] = await Promise.all([
    initLanguage(),
    new Promise((resolve) =>
      chrome.storage.sync.get({ ...DEFAULT_SETTINGS, isPro: false, uiLanguage: 'auto' }, resolve)
    ),
    chrome.tabs.query({ active: true, currentWindow: true }),
  ]);

  const isPro = storageResult.isPro;
  let settings = storageResult;

  if (!isPro) {
    settings = Object.assign({}, settings, FREE_OVERRIDES);
    document.getElementById('upgrade-bar').hidden = false;
    trackEvent('pro_gate_shown');
  }

  setPageInfo(tab);
  setPropertyValues(tab);
  applyPropertyVisibility(settings);

  // 無料プランの日次上限チェック
  if (!isPro) {
    const dailyCount = await getDailyCount();
    if (dailyCount >= FREE_DAILY_LIMIT) {
      const textarea = document.getElementById('markdownOutput');
      textarea.placeholder = `${currentT.limitReached}\n${currentT.limitHint}`;
      document.getElementById('upgrade-text').textContent = currentT.limitReached;
      showStatus(currentT.limitReached, true);
      trackEvent('daily_limit_reached');
      return;
    }
    // カウントをアップグレードバーに表示
    if (dailyCount > 0) {
      const upgradeTextEl = document.getElementById('upgrade-text');
      upgradeTextEl.textContent = currentT.usageCount(dailyCount) + currentT.upgradeText;
    }
  }

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
  trackEvent('popup_open');
  trackEvent('convert', { is_pro: isPro });

  // 変換成功後にカウントをインクリメント
  if (!isPro) await incrementDailyCount();

  // 自動コピー（Pro のみ）
  if (settings.autoCopy) {
    try {
      await navigator.clipboard.writeText(markdown);
      showStatus(currentT.autoCopied);
    } catch { /* silent */ }
  }

  // コピー
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const text = document.getElementById('markdownOutput').value;
    try {
      await navigator.clipboard.writeText(text);
      showStatus(currentT.copied);
      trackEvent('copy');
    } catch {
      showStatus(currentT.copyFailed, true);
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
        showStatus(currentT.saveFailed, true);
        return;
      }
      showStatus(currentT.saved);
      trackEvent('save', { save_as: saveAs });
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

// ── 言語切り替え ──────────────────────────────────────────────────────────────

document.getElementById('langBtn').addEventListener('click', async () => {
  const newLang = currentLang === 'ja' ? 'en' : 'ja';
  await new Promise(resolve => chrome.storage.sync.set({ uiLanguage: newLang }, resolve));
  applyLanguage(newLang);
});

// ── ヘッダーボタン ─────────────────────────────────────────────────────────────

document.getElementById('optionsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById('feedbackBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: FEEDBACK_URL });
});

document.getElementById('upgradeBtn').addEventListener('click', () => {
  trackEvent('upgrade_clicked', { source: 'popup' });
  chrome.tabs.create({ url: UPGRADE_URL });
});
