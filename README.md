# Site2Markdown

> Convert any webpage to clean Markdown — for Obsidian, Notion, and AI prompts.
>
> WebページをクリーンなMarkdownに変換するChrome拡張機能 — Obsidian・Notion・AIプロンプトに最適。

![Version](https://img.shields.io/badge/version-1.0.0-red)
![License](https://img.shields.io/badge/license-MIT-blue)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)

**[English](#english) | [日本語](#japanese)**

---

<a id="english"></a>

## English

### Overview

Site2Markdown is a Chrome extension that converts any webpage into clean Markdown with a single click. Powered by Mozilla Readability and Turndown.js, it strips away ads, navigation, and clutter — leaving you with just the content.

**Great for:**
- **Obsidian users** — clip articles with YAML frontmatter directly into your vault
- **Notion users** — get clean Markdown that pastes perfectly into Notion pages
- **AI users** — format articles for ChatGPT / Claude prompts
- **Developers** — preserve code blocks and tables accurately, save locally as `.md`

---

### Features

#### Conversion
- Article extraction via Mozilla Readability (removes ads, nav, sidebars automatically)
- GitHub Flavored Markdown (GFM): tables, code blocks, strikethrough
- Full page or selection-only mode

#### Output Customization
- **Frontmatter:** title / url / date / description / author / tags / custom fields
- **Image handling:** keep / alt text only / remove
- **Link handling:** keep as Markdown / text only (strip URLs)
- **Heading shift:** shift all headings down 1–2 levels (prevents h1 conflicts when embedding)
- **Blank line collapse:** compress 3+ consecutive blank lines to 2

#### Filename Generation
- Format: `YYYY-MM-DD_page-title.md`
- Configurable: date format, separator character, title max length

#### Remove Options
Ads, header, footer, navigation, sidebar — remove any combination before conversion.

#### Auto Copy *(Pro)*
Automatically copy Markdown to clipboard the moment the popup opens.

---

### Installation

#### From Chrome Web Store *(recommended)*

> [Install from Chrome Web Store](#) — link added after launch

#### Manual Installation *(for development)*

```bash
git clone https://github.com/IshizukaHiroto/Site2Markdown.git
cd Site2Markdown
```

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the cloned folder

---

### Usage

1. Open the page you want to convert
2. Click the Site2Markdown icon in the toolbar
3. Markdown is generated automatically
4. Click **Copy** or **Save** to export

**Selection-only mode:**
Select text on the page before clicking the icon to convert only the selected portion (enable in Settings → Content Cleanup).

---

### Settings

Open settings via the sliders icon (⊟) in the popup.

| Tab | What you can configure |
|-----|----------------------|
| Content Cleanup | Extraction mode, remove ads/header/footer/nav/sidebar |
| Output Format | Image, link, heading, and blank line handling |
| Metadata | Frontmatter fields and custom YAML |
| Filename & Behavior | Filename format, auto-copy |
| Preview | Live filename preview with current settings |

---

### Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| [Turndown.js](https://github.com/mixmark-io/turndown) | 7.x | HTML → Markdown |
| [turndown-plugin-gfm](https://github.com/mixmark-io/turndown-plugin-gfm) | 1.x | GFM extension |
| [@mozilla/readability](https://github.com/mozilla/readability) | latest | Article extraction |

- **Manifest Version:** 3 (MV3)
- **Minimum Chrome Version:** 109

---

### Privacy

All processing happens locally in the browser. Page content and browsing history are never sent to external servers.

[Privacy Policy](https://site2markdown.pages.dev/privacy-policy.html)

---

### License

MIT License — see [LICENSE](./LICENSE)

**Third-party licenses:**
- Turndown.js — MIT
- turndown-plugin-gfm — MIT
- @mozilla/readability — Apache 2.0

---

### Feedback & Issues

Bug reports and feature requests are welcome via [Issues](https://github.com/IshizukaHiroto/Site2Markdown/issues).

---

<a id="japanese"></a>

## 日本語

### 概要

Site2Markdown は、任意のWebページをワンクリックでクリーンなMarkdownに変換するChrome拡張機能です。Mozilla Readability と Turndown.js を使用し、広告・ナビゲーション・余分な要素を取り除き、コンテンツだけを抽出します。

**こんな人に最適:**
- **Obsidian ユーザー** — フロントマター付きで知識ベースにクリップ
- **Notion ユーザー** — Notionページにそのまま貼り付けられるMarkdownを取得
- **AI ユーザー** — ChatGPT / Claude へ渡すために記事を整形
- **エンジニア** — コードブロック・テーブルを正確に変換してローカルに保存

---

### 主な機能

#### 変換機能
- Mozilla Readability による本文抽出（広告・ナビ・サイドバーを自動除去）
- GitHub Flavored Markdown (GFM) 対応（テーブル・コードブロック・打ち消し線）
- ページ全体 / 選択範囲のみ、切り替えて変換

#### 出力のカスタマイズ
- **フロントマター:** title / url / date / description / author / tags / カスタムフィールド
- **画像処理:** そのまま保持 / alt テキストのみ / 完全に除去
- **リンク処理:** Markdown 形式で保持 / テキストのみ（URL 除去）
- **見出しシフト:** 全見出しを 1〜2 段下げる（他の文書に貼り付ける際のh1重複を防止）
- **空行圧縮:** 3行以上の連続空行を2行に圧縮

#### ファイル名の自動生成
- 形式: `YYYY-MM-DD_タイトル.md`
- 日付形式・区切り文字・タイトル最大文字数をカスタマイズ可能

#### 除去オプション
広告・ヘッダー・フッター・ナビゲーション・サイドバーを変換前に任意で除去

#### 自動コピー *(Pro)*
ポップアップを開いた瞬間にMarkdownをクリップボードへ自動コピー

---

### インストール

#### Chrome Web Store から *(推奨)*

> [Chrome Web Store でインストール](#) — リンクは公開後に追加

#### 手動インストール *(開発用)*

```bash
git clone https://github.com/IshizukaHiroto/Site2Markdown.git
cd Site2Markdown
```

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. クローンしたフォルダを選択

---

### 使い方

1. 変換したいページを開く
2. ツールバーのSite2Markdownアイコンをクリック
3. Markdownが自動生成される
4. 「コピー」または「保存」ボタンで取得

**選択範囲のみ変換する場合:**
テキストを選択してからアイコンをクリックすると、選択部分のみが変換されます（設定 → 本文の整え方 でオン）。

---

### 設定

ポップアップ右上のスライダーアイコンから設定画面を開けます。

| タブ | 設定できること |
|------|-------------|
| 本文の整え方 | 抽出モード・除去オプション（広告・ヘッダー等） |
| 出力形式 | 画像・リンク・見出し・空行の処理方法 |
| メタ情報 | フロントマターの項目選択・カスタムフィールド |
| ファイル名・動作 | ファイル名フォーマット・自動コピー |
| 出力例 | 現在の設定で生成されるファイル名のプレビュー |

---

### 技術スタック

| ライブラリ | バージョン | 用途 |
|-----------|---------|-----|
| [Turndown.js](https://github.com/mixmark-io/turndown) | 7.x | HTML → Markdown 変換 |
| [turndown-plugin-gfm](https://github.com/mixmark-io/turndown-plugin-gfm) | 1.x | GFM 拡張（テーブル等） |
| [@mozilla/readability](https://github.com/mozilla/readability) | 最新 | 本文抽出 |

- **Manifest Version:** 3 (MV3)
- **最小 Chrome バージョン:** 109

---

### プライバシー

すべての処理はブラウザ内でローカルに実行されます。ページの内容や閲覧履歴を外部サーバーに送信することは一切ありません。

[プライバシーポリシー](https://site2markdown.pages.dev/privacy-policy.html)

---

### ライセンス

MIT License — 詳細は [LICENSE](./LICENSE) を参照

**使用ライブラリのライセンス:**
- Turndown.js — MIT
- turndown-plugin-gfm — MIT
- @mozilla/readability — Apache 2.0

---

### フィードバック・バグ報告

バグ報告・機能提案は [Issues](https://github.com/IshizukaHiroto/Site2Markdown/issues) までお気軽にどうぞ。
