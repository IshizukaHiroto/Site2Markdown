/**
 * Site2Markdown - Content Script
 * ページDOMにアクセスし、Markdown変換を行うコアロジック
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

/**
 * 設定に応じて不要な要素をDOMクローンから除去する
 */
function removeUnwantedElements(doc, settings) {
  const removalMap = {
    removeAds: [
      'ins.adsbygoogle',
      '[class*="ad-"]',
      '[class*="-ad"]',
      '[class*="advertisement"]',
      '[class*="banner"]',
      '[data-ad]',
      '[data-google-query-id]',
      '[id*="sponsor"]',
      '[class*="sponsor"]',
      '[class*="promo"]',
      '[class*="affiliate"]',
    ],
    removeHeader: [
      'header',
      '[role="banner"]',
      '[id*="header"]',
      '[class*="header"]',
      '#site-header',
      '.site-header',
      '.page-header',
    ],
    removeFooter: [
      'footer',
      '[role="contentinfo"]',
      '[id*="footer"]',
      '[class*="footer"]',
      '#site-footer',
      '.site-footer',
    ],
    removeNav: [
      'nav',
      '[role="navigation"]',
      '[id*="nav"]',
      '[class*="nav"]',
      '[class*="menu"]',
      '[id*="menu"]',
      '.breadcrumb',
      '#breadcrumb',
    ],
    removeSidebar: [
      'aside',
      '[role="complementary"]',
      '[id*="sidebar"]',
      '[class*="sidebar"]',
      '[class*="side-bar"]',
      '.widget-area',
      '[id*="widget"]',
    ],
  };

  for (const [settingKey, selectors] of Object.entries(removalMap)) {
    if (!settings[settingKey]) continue;
    for (const selector of selectors) {
      try {
        doc.querySelectorAll(selector).forEach((el) => el.remove());
      } catch {
        // 無効なセレクタは無視
      }
    }
  }
}

/**
 * フロントマター文字列を生成する
 */
function buildFrontmatter(settings) {
  if (!settings.frontmatterEnabled) return '';

  const lines = ['---'];
  if (settings.frontmatterTitle) {
    const title = document.title.replace(/"/g, "'");
    lines.push(`title: "${title}"`);
  }
  if (settings.frontmatterUrl) {
    lines.push(`url: ${location.href}`);
  }
  if (settings.frontmatterDate) {
    const today = new Date().toISOString().split('T')[0];
    lines.push(`date: ${today}`);
  }
  lines.push('---');
  return lines.join('\n');
}

/**
 * メッセージハンドラ
 * popup.js から { action: "convert", settings } を受信して変換結果を返す
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action !== 'convert') return false;

  const settings = Object.assign({}, DEFAULT_SETTINGS, request.settings);

  try {
    // DOMクローン（Readabilityはparseでクローンを破壊するため必須）
    const documentClone = document.cloneNode(true);

    // 不要要素をクローン側から除去
    removeUnwantedElements(documentClone, settings);

    // Readabilityで本文抽出
    const reader = new Readability(documentClone);
    const article = reader.parse();

    // Readability失敗時はdocument.bodyをフォールバック
    const contentHtml = article ? article.content : document.body.innerHTML;
    const pageTitle = (article && article.title) ? article.title : document.title;

    // TurndownService 初期化
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      fence: '```',
      bulletListMarker: '-',
      emDelimiter: '*',
      strongDelimiter: '**',
    });

    // GFMプラグイン適用（テーブル・strikethrough等）
    turndownService.use(turndownPluginGfm.gfm);

    // Markdown変換
    let markdown = turndownService.turndown(contentHtml);

    // フロントマター付加
    const frontmatter = buildFrontmatter(settings);
    if (frontmatter) {
      markdown = frontmatter + '\n\n' + markdown;
    }

    sendResponse({ markdown, title: pageTitle });
  } catch (err) {
    sendResponse({ error: err.message || 'Conversion failed' });
  }

  return true; // 非同期レスポンスを示す必須フラグ
});
