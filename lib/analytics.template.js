/**
 * Site2Markdown - Analytics (GA4 Measurement Protocol)
 * SDK不要。fetch で直接 GA4 に送信する。
 * このファイルはテンプレート。build.js を実行すると lib/analytics.js が生成される。
 */

const GA4_MEASUREMENT_ID = 'G-EEE9P8LC6L';
const GA4_API_SECRET      = '__GA4_API_SECRET__';

async function _getClientId() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ gaClientId: null }, (result) => {
      if (result.gaClientId) { resolve(result.gaClientId); return; }
      const id = crypto.randomUUID();
      chrome.storage.local.set({ gaClientId: id }, () => resolve(id));
    });
  });
}

async function trackEvent(name, params = {}) {
  if (GA4_API_SECRET === '__GA4_API_SECRET__') return; // 未ビルド時はスキップ
  try {
    const client_id = await _getClientId();
    fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({ client_id, events: [{ name, params }] }),
      }
    );
  } catch { /* サイレント失敗 */ }
}
