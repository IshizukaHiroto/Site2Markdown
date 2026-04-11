# Site2Markdown

> WebページをクリーンなMarkdownに変換するChrome拡張機能

![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 概要

任意のWebページをワンクリックでクリーンなMarkdownに変換します。Mozilla Readability と Turndown.js を使用し、広告・ナビゲーション・余分な要素を取り除き、本文だけを抽出します。個人利用向けのローカル拡張機能です。

---

## 機能一覧

### 変換

- Mozilla Readability による本文抽出（広告・ナビ・サイドバーを自動除去）
- GitHub Flavored Markdown (GFM) 対応（テーブル・コードブロック・打ち消し線）
- コードブロックの言語タグ自動検出（`class="language-python"` などから取得）
- ページ全体 / 選択範囲のみ、切り替えて変換
- YouTube・Vimeo の埋め込みをURLリンクへ変換

### 数式保持

KaTeX・MathJax（v2/v3）・Wikipedia の数式を `$…$` / `$$…$$` 形式で保持（設定でオン/オフ）

### 出力カスタマイズ

- **フロントマター:** title / url / date / description / author / tags / カスタムフィールド
- **画像処理:** そのまま保持 / alt テキストのみ / 完全に除去
- **リンク処理:** Markdown 形式で保持 / テキストのみ（URL 除去）
- **見出しシフト:** 全見出しを 1〜2 段下げる
- **空行圧縮:** 3行以上の連続空行を 2行に圧縮

### ファイル名の自動生成

形式: `YYYY-MM-DD_タイトル.md`（日付形式・区切り文字・タイトル最大文字数をカスタマイズ可能）

### その他

- テキストエリアで変換結果を直接編集可能
- Markdownプレビュー切り替え（レンダリング表示）
- 変換履歴の保存と一覧表示（最大50件、クリックで再アクセス）
- 自動コピー（ポップアップを開いた瞬間にクリップボードへ）
- コピー後に自動でポップアップを閉じるオプション
- ダークモード対応（OS設定に連動）

---

## インストール

```bash
git clone https://github.com/IshizukaHiroto/Site2Markdown.git
cd Site2Markdown
```

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. クローンしたフォルダを選択

---

## 使い方

1. 変換したいページを開く
2. ツールバーのSite2Markdownアイコンをクリック
3. Markdownが自動生成される
4. テキストエリアで編集し、「コピー」または「保存」ボタンで取得

**選択範囲のみ変換する場合:**
テキストを選択してからアイコンをクリックすると、選択部分のみが変換されます（設定 → 本文の整え方 でオン）。

---

## 設定

ポップアップ右上のスライダーアイコンから設定画面を開けます。

| タブ | 設定できること |
|------|-------------|
| 本文の整え方 | 抽出モード・除去オプション（広告・ヘッダー等）・数式保持 |
| 出力形式 | 画像・リンク・見出し・空行の処理方法 |
| メタ情報 | フロントマターの項目選択・カスタムフィールド |
| ファイル名・動作 | ファイル名フォーマット・自動コピー・コピー後に閉じる |
| 出力例 | 現在の設定で生成されるファイル名のプレビュー |

---

## 技術スタック

| ライブラリ | 用途 |
|-----------|-----|
| [Mozilla Readability](https://github.com/mozilla/readability) | 本文抽出（Apache 2.0） |
| [Turndown.js](https://github.com/mixmark-io/turndown) | HTML → Markdown 変換（MIT） |
| [turndown-plugin-gfm](https://github.com/mixmark-io/turndown-plugin-gfm) | GFM 拡張（MIT） |
| [marked](https://github.com/markedjs/marked) | Markdownプレビュー（MIT） |
| [DOMPurify](https://github.com/cure53/DOMPurify) | プレビューのXSSサニタイズ（Apache 2.0） |

- **Manifest Version:** 3 (MV3)
- **最小 Chrome バージョン:** 109

---

## プライバシー

すべての処理はブラウザ内でローカルに実行されます。ページの内容や閲覧履歴を外部サーバーに送信することは一切ありません。

---

## ライセンス

MIT License — 詳細は [LICENSE](./LICENSE) を参照
