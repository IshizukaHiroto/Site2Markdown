/**
 * Site2Markdown - Content Script
 * ページDOMにアクセスし、Markdown変換を行うコアロジック
 */

// 重複注入防止（scripting.executeScript で複数回注入されても1回だけ初期化）
if (window.__s2md_initialized) {
  // 既に初期化済み — 何もしない
} else {
window.__s2md_initialized = true;

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
  closeAfterCopy:          false,
  preserveMath:            false,
};

/**
 * 数式要素を $…$ / $$…$$ プレースホルダに変換する（KaTeX / MathJax / Wikipedia対応）
 */
function preprocessMath(doc) {
  // KaTeX: <span class="katex"> 内の <annotation encoding="application/x-tex">
  doc.querySelectorAll('.katex').forEach((el) => {
    const ann = el.querySelector('annotation[encoding="application/x-tex"]');
    if (!ann) return;
    const isDisplay = !!el.closest('.katex-display');
    const span = doc.createElement('span');
    span.textContent = isDisplay
      ? `$$${ann.textContent.trim()}$$`
      : `$${ann.textContent.trim()}$`;
    el.replaceWith(span);
  });

  // MathJax v2: <script type="math/tex">
  doc.querySelectorAll('script[type^="math/tex"]').forEach((el) => {
    const isDisplay = el.getAttribute('type').includes('display');
    const span = doc.createElement('span');
    span.textContent = isDisplay
      ? `$$${el.textContent.trim()}$$`
      : `$${el.textContent.trim()}$`;
    el.replaceWith(span);
  });

  // MathJax v3: <mjx-container>
  doc.querySelectorAll('mjx-container').forEach((el) => {
    const isDisplay = el.getAttribute('display') === 'true';
    const script = el.querySelector('script[type]');
    if (!script?.textContent.trim()) return;
    const span = doc.createElement('span');
    span.textContent = isDisplay
      ? `$$${script.textContent.trim()}$$`
      : `$${script.textContent.trim()}$`;
    el.replaceWith(span);
  });

  // Wikipedia 等: <math alttext="...">
  doc.querySelectorAll('math[alttext]').forEach((el) => {
    const isDisplay = el.getAttribute('display') === 'block';
    const span = doc.createElement('span');
    span.textContent = isDisplay
      ? `$$${el.getAttribute('alttext')}$$`
      : `$${el.getAttribute('alttext')}$`;
    el.replaceWith(span);
  });
}

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
    lines.push(`date: ${new Date().toISOString().split('T')[0]}`);
  }
  if (settings.frontmatterDescription) {
    const el =
      document.querySelector('meta[name="description"]') ||
      document.querySelector('meta[property="og:description"]');
    const desc = (el ? el.getAttribute('content') || '' : '').replace(/"/g, "'").trim();
    if (desc) lines.push(`description: "${desc}"`);
  }
  if (settings.frontmatterAuthor) {
    const el =
      document.querySelector('meta[name="author"]') ||
      document.querySelector('meta[property="article:author"]') ||
      document.querySelector('meta[name="twitter:creator"]');
    const author = (el ? el.getAttribute('content') || '' : '').replace(/"/g, "'").trim();
    if (author) lines.push(`author: "${author}"`);
  }
  if (settings.frontmatterTags && settings.frontmatterTagsValue) {
    const tags = settings.frontmatterTagsValue
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length > 0) {
      lines.push(`tags: [${tags.map((t) => `"${t}"`).join(', ')}]`);
    }
  }
  if (settings.frontmatterCustom) {
    const customLines = settings.frontmatterCustom
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    lines.push(...customLines);
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
    let contentHtml = null;
    let pageTitle = document.title;

    // 選択範囲モード: 選択があればそれを優先して使う
    if (settings.selectionOnly) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const fragment = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(fragment);
        div.querySelectorAll('script, noscript, iframe, style').forEach((el) => el.remove());
        contentHtml = div.innerHTML;
      }
    }

    // 通常抽出（selectionOnly 未適用の場合）
    if (contentHtml === null) {
      const documentClone = document.cloneNode(true);

      // 数式を先に変換（設定ONの場合）
      if (settings.preserveMath) preprocessMath(documentClone);

      // iframe を URL リンクに変換してから除去
      documentClone.querySelectorAll('iframe[src]').forEach((el) => {
        const src = el.getAttribute('src') || '';
        let link = null;
        const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&]+)/);
        if (yt) {
          link = `https://www.youtube.com/watch?v=${yt[1]}`;
        } else if (src.includes('player.vimeo.com/video/')) {
          const vm = src.match(/vimeo\.com\/video\/(\d+)/);
          link = vm ? `https://vimeo.com/${vm[1]}` : src;
        } else if (src.startsWith('http')) {
          link = src;
        }
        if (link) {
          const a = documentClone.createElement('a');
          a.href = link;
          a.textContent = link;
          el.replaceWith(a);
        }
      });

      // script・noscript・iframe（残り）・style は常に除去
      documentClone.querySelectorAll('script, noscript, iframe, style').forEach((el) => el.remove());
      removeUnwantedElements(documentClone, settings);

      if (settings.extractionMode === 'body') {
        contentHtml = documentClone.body.innerHTML;
      } else {
        const reader = new Readability(documentClone);
        const article = reader.parse();
        contentHtml = article ? article.content : documentClone.body.innerHTML;
        if (article && article.title) pageTitle = article.title;
      }
    }

    // TurndownService 初期化
    const turndownService = new TurndownService({
      headingStyle:     'atx',
      codeBlockStyle:   'fenced',
      fence:            '```',
      bulletListMarker: '-',
      emDelimiter:      '*',
      strongDelimiter:  '**',
    });

    // GFMプラグイン適用（テーブル・strikethrough等）
    turndownService.use(turndownPluginGfm.gfm);

    // ── カスタムルール（GFM適用後に追加して優先） ──────────────

    // コードブロックの言語タグ自動検出（language-xxx / lang-xxx クラスから取得）
    turndownService.addRule('fencedCodeBlockWithLang', {
      filter: (node) =>
        node.nodeName === 'PRE' && node.firstElementChild?.nodeName === 'CODE',
      replacement: (_content, node) => {
        const code = node.firstElementChild;
        const cls  = code.getAttribute('class') || '';
        const lang = (cls.match(/(?:language|lang)-(\S+)/) || [])[1] || '';
        const text = code.textContent.replace(/\n$/, '');
        return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
      },
    });

    // 画像の扱い
    if (settings.imageHandling === 'altOnly') {
      turndownService.addRule('imageAltOnly', {
        filter: 'img',
        replacement: (_content, node) => node.getAttribute('alt') || '',
      });
    } else if (settings.imageHandling === 'remove') {
      turndownService.addRule('imageRemove', {
        filter: 'img',
        replacement: () => '',
      });
    }

    // リンクの扱い
    if (settings.linkHandling === 'textOnly') {
      turndownService.addRule('linkTextOnly', {
        filter: 'a',
        replacement: (content) => content,
      });
    }

    // 見出しレベルのシフト
    const headingShift = parseInt(settings.headingShift) || 0;
    if (headingShift > 0) {
      turndownService.addRule('headingShift', {
        filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        replacement: (content, node) => {
          const level = Math.min(parseInt(node.nodeName[1]) + headingShift, 6);
          return '\n\n' + '#'.repeat(level) + ' ' + content.trim() + '\n\n';
        },
      });
    }

    // ──────────────────────────────────────────────────────────

    let markdown = turndownService.turndown(contentHtml);

    // 空行の圧縮
    if (settings.collapseBlankLines) {
      markdown = markdown.replace(/\n{3,}/g, '\n\n');
    }

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

} // end of __s2md_initialized guard
