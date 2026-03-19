/**
 * Site2Markdown - Popup Script
 */

const DEFAULT_SETTINGS = {
  removeAds:          false,
  removeHeader:       false,
  removeFooter:       false,
  removeNav:          false,
  removeSidebar:      false,
  frontmatterEnabled: true,
  frontmatterTitle:   true,
  frontmatterUrl:     true,
  frontmatterDate:    true,
};

let currentTitle = 'untitled';
let downloadUrl = null;

function showStatus(msg, isError = false) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.className = isError ? 'error' : '';
  if (!isError && msg) {
    setTimeout(() => { el.textContent = ''; }, 2500);
  }
}

function setButtonsEnabled(enabled) {
  document.getElementById('copyBtn').disabled = !enabled;
  document.getElementById('saveBtn').disabled = !enabled;
}

/**
 * ページ情報エリアにタイトル・URLを表示する
 */
function setPageInfo(tab) {
  document.getElementById('page-title').textContent = tab.title || '(無題)';
  try {
    const url = new URL(tab.url);
    document.getElementById('page-url').textContent = url.hostname + url.pathname;
  } catch {
    document.getElementById('page-url').textContent = tab.url || '';
  }

  // ファビコン（DOM操作で安全に挿入）
  if (tab.favIconUrl) {
    const faviconContainer = document.getElementById('page-favicon');
    const img = document.createElement('img');
    img.src = tab.favIconUrl;
    img.alt = '';
    img.width = 16;
    img.height = 16;
    faviconContainer.replaceChildren(img);
  }
}

/**
 * プロパティ行を設定値に応じて表示/非表示切り替え
 */
function applyPropertyVisibility(settings) {
  const show = settings.frontmatterEnabled;
  document.getElementById('properties-section').style.display = show ? '' : 'none';

  if (show) {
    document.getElementById('prop-title-row').classList.toggle('hidden-row', !settings.frontmatterTitle);
    document.getElementById('prop-url-row').classList.toggle('hidden-row', !settings.frontmatterUrl);
    document.getElementById('prop-date-row').classList.toggle('hidden-row', !settings.frontmatterDate);
  }
}

/**
 * プロパティ値をセットする
 */
function setPropertyValues(tab) {
  document.getElementById('prop-title-value').textContent = tab.title || '(無題)';
  document.getElementById('prop-url-value').textContent = tab.url || '';
  document.getElementById('prop-url-value').title = tab.url || '';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('prop-date-value').textContent = today;
}

/**
 * Content Scriptに変換リクエストを送信（未注入時はインジェクト後にリトライ）
 */
async function requestConversion(tabId, settings) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'convert', settings }, (response) => {
      if (chrome.runtime.lastError) {
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
              resolve({ error: 'このページでは実行できません（chrome:// などの制限されたページ）' });
              return;
            }
            chrome.tabs.sendMessage(tabId, { action: 'convert', settings }, (res) => {
              resolve(res || { error: '変換に失敗しました' });
            });
          }
        );
        return;
      }
      resolve(response || { error: '変換に失敗しました' });
    });
  });
}

function buildFilename(title) {
  const date = new Date().toISOString().split('T')[0];
  const safeName = title
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 50)
    .replace(/_+$/, '') || 'untitled';
  return `${date}_${safeName}.md`;
}

/** プロパティセクションの折りたたみ */
function initPropertiesToggle() {
  const btn = document.getElementById('properties-toggle');
  const body = document.getElementById('properties-body');
  const arrow = document.getElementById('toggle-arrow');
  let collapsed = false;

  btn.addEventListener('click', () => {
    collapsed = !collapsed;
    body.classList.toggle('hidden', collapsed);
    arrow.classList.toggle('collapsed', collapsed);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initPropertiesToggle();
  setButtonsEnabled(false);

  const settings = await new Promise((resolve) =>
    chrome.storage.sync.get(DEFAULT_SETTINGS, resolve)
  );

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  setPageInfo(tab);
  setPropertyValues(tab);
  applyPropertyVisibility(settings);

  const response = await requestConversion(tab.id, settings);

  if (response.error) {
    document.getElementById('markdownOutput').placeholder = response.error;
    showStatus(response.error, true);
    return;
  }

  currentTitle = response.title || tab.title || 'untitled';
  document.getElementById('markdownOutput').value = response.markdown;
  setButtonsEnabled(true);

  // コピー
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const text = document.getElementById('markdownOutput').value;
    try {
      await navigator.clipboard.writeText(text);
      showStatus('コピーしました ✓');
    } catch {
      showStatus('コピーに失敗しました', true);
    }
  });

  // 保存
  document.getElementById('saveBtn').addEventListener('click', () => {
    const text = document.getElementById('markdownOutput').value;
    const filename = buildFilename(currentTitle);

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    downloadUrl = URL.createObjectURL(blob);

    chrome.downloads.download({ url: downloadUrl, filename, saveAs: false }, (downloadId) => {
      if (chrome.runtime.lastError) {
        showStatus('保存に失敗しました', true);
        return;
      }
      showStatus('保存しました');
      chrome.downloads.onChanged.addListener(function onChanged(delta) {
        if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
          URL.revokeObjectURL(downloadUrl);
          downloadUrl = null;
          chrome.downloads.onChanged.removeListener(onChanged);
        }
      });
    });
  });
});

document.getElementById('optionsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
