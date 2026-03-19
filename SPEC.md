# Site2Markdown 仕様書

## 概要

任意のWebページをMarkdown形式に変換し、AIへの入力や個人メモとして自由に活用できるChrome拡張機能。
Obsidian Web Clipperに近いUXを持ちつつ、特定サービスに依存しない汎用ツール。

---

## 機能仕様

### 1. 変換機能

| HTML要素 | Markdown変換形式 |
|---------|----------------|
| h1〜h6 | `#`〜`######` |
| bold (`<strong>`, `<b>`) | `**テキスト**` |
| italic (`<em>`, `<i>`) | `*テキスト*` |
| inline code (`<code>`) | `` `コード` `` |
| リンク (`<a>`) | `[テキスト](URL)` |
| 画像 (`<img>`) | `![alt属性](元URL)` |
| テーブル (`<table>`) | GFM形式 `\| col \| col \|` |
| コードブロック (`<pre><code>`) | 言語指定付き ` ``` ` |
| 順序なしリスト (`<ul>`) | `- item` |
| 順序付きリスト (`<ol>`) | `1. item` |
| 引用 (`<blockquote>`) | `> テキスト` |
| 水平線 (`<hr>`) | `---` |

### 2. フロントマター

Markdownファイル先頭に付与するメタ情報。デフォルトON、各項目個別にON/OFF可能。

```markdown
---
title: "ページタイトル"
url: https://example.com/page
date: 2026-03-19
---
```

- タイトル内のコロン（`:`）はYAML解析エラーを防ぐためクォートで囲む

### 3. 本文抽出

- `@mozilla/readability` を使用してメインコンテンツを抽出
- ナビゲーション・広告・フッター等の不要要素を事前に除去した上でReadabilityを適用
- Readabilityが本文抽出に失敗した場合（`null`返却）は `document.body.innerHTML` にフォールバック

### 4. 除去オプション

設定画面でON/OFFを切り替え可能。デフォルトはすべてOFF。

| オプション名 | 除去対象セレクタ（例） |
|------------|-------------------|
| 広告を除去 | `ins.adsbygoogle`, `[class*="ad-"]`, `[data-ad]`, `[class*="banner"]` |
| ヘッダーを除去 | `header`, `[role="banner"]`, `[class*="header"]` |
| フッターを除去 | `footer`, `[role="contentinfo"]`, `[class*="footer"]` |
| ナビゲーションを除去 | `nav`, `[role="navigation"]`, `[class*="nav"]`, `[class*="menu"]` |
| サイドバーを除去 | `aside`, `[role="complementary"]`, `[class*="sidebar"]` |

### 5. 出力機能

#### クリップボードコピー
- `navigator.clipboard.writeText()` でMarkdownテキストをコピー
- コピー成功時にUI上でフィードバック表示

#### ファイルダウンロード
- ファイル形式: `.md`（text/markdown）
- ファイル名形式: `YYYY-MM-DD_{ページタイトル}.md`
  - タイトルはファイル名不正文字（`\ / : * ? " < > |`）をアンダースコアに置換
  - タイトルは最大50文字に切り詰め

---

## UI仕様

### ポップアップ

```
┌──────────────────────────────┐
│  Site2Markdown        [⚙️]  │
│──────────────────────────────│
│  [📋 コピー]  [💾 保存]      │
│  [ステータスメッセージ]        │
│──────────────────────────────│
│  ┌────────────────────────┐  │
│  │ ---                    │  │
│  │ title: "..."           │  │
│  │ url: https://...       │  │
│  │ date: 2026-03-19       │  │
│  │ ---                    │  │
│  │                        │  │
│  │ # 見出し               │  │
│  │ 本文テキスト...         │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

- プレビューエリア: Markdownソーステキストをそのまま表示（`<textarea readonly>`）
- スクロール可能
- ポップアップサイズ: 幅400px、高さ500px

### 設定画面（⚙️ボタンから開く）

```
除去オプション
  ☐ 広告を除去
  ☐ ヘッダーを除去
  ☐ フッターを除去
  ☐ ナビゲーションバーを除去
  ☐ サイドバーを除去

フロントマター
  ☑ フロントマターを付与
    ☑ タイトル
    ☑ URL
    ☑ 日付

ファイル名形式: YYYY-MM-DD_{タイトル}.md

[保存]ボタン → 「保存しました」表示
```

---

## 技術仕様

### 拡張機能仕様

- **Manifest Version**: 3（MV3）
- **最小Chromeバージョン**: 109（MV3 + scripting API対応）

### 使用ライブラリ

| ライブラリ | バージョン | 用途 |
|-----------|---------|-----|
| Turndown.js | 7.x | HTML → Markdown変換 |
| turndown-plugin-gfm | 1.x | テーブル等GFM拡張サポート |
| @mozilla/readability | 最新 | 本文抽出 |

### パーミッション

| パーミッション | 用途 |
|-------------|-----|
| `activeTab` | 現在タブのDOM操作 |
| `storage` | 設定の永続化（chrome.storage.sync） |
| `clipboardWrite` | クリップボードへのコピー |
| `downloads` | .mdファイルのダウンロード |
| `scripting` | Content Scriptの動的インジェクト（フォールバック用） |
| `host_permissions: <all_urls>` | 全URLへのContent Script適用 |

### Content Script読み込み順序

```
Readability.js → turndown.js → turndown-plugin-gfm.js → content.js
```

### chrome.storage.sync スキーマ

```javascript
{
  removeAds:           false,  // 広告除去
  removeHeader:        false,  // ヘッダー除去
  removeFooter:        false,  // フッター除去
  removeNav:           false,  // ナビゲーション除去
  removeSidebar:       false,  // サイドバー除去
  frontmatterEnabled:  true,   // フロントマター全体
  frontmatterTitle:    true,   // タイトルフィールド
  frontmatterUrl:      true,   // URLフィールド
  frontmatterDate:     true,   // 日付フィールド
}
```

---

## 処理フロー

```
[ユーザーがポップアップを開く]
          ↓
[popup.js] chrome.storage.sync.get() で設定読み込み
          ↓
[popup.js] chrome.tabs.sendMessage({ action: "convert", settings })
          ↓
  ┌── 失敗（Content Script未注入）──┐
  │                                  ↓
  │              chrome.scripting.executeScript() で動的インジェクト
  │                                  ↓
  │              chrome.tabs.sendMessage() 再送
  └──────────────────────────────────┘
          ↓
[content.js] document.cloneNode(true) でDOMクローン
          ↓
[content.js] removeUnwantedElements() で不要要素削除
          ↓
[content.js] new Readability(clone).parse() で本文抽出
          ↓
[content.js] TurndownService + gfmプラグインでMarkdown変換
          ↓
[content.js] buildFrontmatter() でフロントマター生成・先頭付加
          ↓
[content.js] sendResponse({ markdown, title })
          ↓
[popup.js] textareaにプレビュー表示

[コピーボタン] → navigator.clipboard.writeText()
[保存ボタン]   → Blob → ObjectURL → chrome.downloads.download()
```

---

## 既知の制限事項

- Readabilityは記事・ブログ向けの設計のため、SPA・ダッシュボード系ページでは本文抽出精度が低下する場合がある
- 広告除去はクラス名・属性パターンに依存するため、サイトによって偽陽性・偽陰性が発生しうる
- MV3の制約によりインラインスクリプト・evalは使用不可
