# Site2Markdown

> WebページをMarkdownに変換するChrome拡張機能。Obsidian・Notion・AI プロンプトに最適。

![バージョン](https://img.shields.io/badge/version-1.0.0-red)
![ライセンス](https://img.shields.io/badge/license-MIT-blue)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)

---

## 概要

Site2Markdown は、任意のWebページをワンクリックでクリーンな Markdown に変換する Chrome 拡張機能です。

- **Obsidian ユーザー:** フロントマター付きで知識ベースにクリップ
- **Notion ユーザー:** ページに貼り付けやすいきれいな Markdown を取得
- **AI ユーザー:** ChatGPT / Claude へ渡すために記事を整形
- **エンジニア:** コードブロック・テーブルを正確に変換してローカルに保存

---

## 主な機能

### 変換機能
- Mozilla Readability による広告・ナビゲーションを除いた本文抽出
- GitHub Flavored Markdown（GFM）対応（テーブル・コードブロック・打ち消し線）
- ページ全体 / 選択範囲のみ、切り替えて変換

### 出力のカスタマイズ
- **フロントマター:** title / url / date / description / author / tags / カスタムフィールド
- **画像処理:** そのまま保持 / alt テキストのみ / 完全に除去
- **リンク処理:** Markdown 形式で保持 / テキストのみ（URL 除去）
- **見出しシフト:** 全見出しを 1〜2 段下げる（他の文書に貼り付ける際の h1 重複を防止）
- **空行圧縮:** 3行以上の連続空行を 2行に圧縮

### ファイル名の自動生成
- 形式: `YYYY-MM-DD_タイトル.md`
- 日付形式・区切り文字・タイトル最大文字数をカスタマイズ可能

### 除去オプション
広告・ヘッダー・フッター・ナビゲーション・サイドバーを変換前に除去

### 自動コピー
ポップアップを開いた瞬間に Markdown をクリップボードへ自動コピー（Pro 機能）

---

## インストール

### Chrome Web Store から（推奨）

> [Chrome Web Store でインストール](#)（リンクは公開後に追加）

### 手動インストール（開発用）

```bash
# リポジトリをクローン
git clone https://github.com/[username]/site2markdown.git
cd site2markdown
```

1. Chrome で `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. クローンしたフォルダを選択

---

## 使い方

1. 変換したいページを開く
2. ツールバーの Site2Markdown アイコンをクリック
3. Markdown が自動生成される
4. 「コピー」または「保存」ボタンで取得

**選択範囲のみ変換する場合:**
テキストを選択してからアイコンをクリックすると、選択部分のみが変換されます（設定でオンにした場合）。

---

## 設定

ツールバーの ⚙ ボタンから設定画面を開けます。

| タブ | 設定できること |
|------|-------------|
| 本文の整え方 | 抽出モード・除去オプション（広告・ヘッダー等） |
| 出力形式 | 画像・リンク・見出し・空行の処理方法 |
| メタ情報 | フロントマターの項目選択・カスタムフィールド |
| ファイル名・動作 | ファイル名フォーマット・自動コピー |
| 出力例 | 現在の設定で生成されるファイル名のプレビュー |

---

## 技術スタック

| ライブラリ | バージョン | 用途 |
|-----------|---------|-----|
| [Turndown.js](https://github.com/mixmark-io/turndown) | 7.x | HTML → Markdown 変換 |
| [turndown-plugin-gfm](https://github.com/mixmark-io/turndown-plugin-gfm) | 1.x | GFM 拡張（テーブル等） |
| [@mozilla/readability](https://github.com/mozilla/readability) | 最新 | 本文抽出 |

- **Manifest Version:** 3（MV3）
- **最小 Chrome バージョン:** 109

---

## ライセンス

MIT License — 詳細は [LICENSE](./LICENSE) を参照

### 使用ライブラリのライセンス

- Turndown.js — MIT License
- turndown-plugin-gfm — MIT License
- @mozilla/readability — Apache 2.0 License

---

## プライバシー

すべての処理はブラウザ内でローカルに実行されます。ページの内容や閲覧履歴を外部サーバーに送信することは一切ありません。

詳細は[プライバシーポリシー](#)をご確認ください。（リンクは公開後に追加）

---

## 貢献・フィードバック

バグ報告・機能提案は [Issues](https://github.com/[username]/site2markdown/issues) までお気軽にどうぞ。

---

## 関連ドキュメント（開発者向け）

- [機能仕様](./仕様書.md)
- [ビジネス戦略・フェーズ計画](./docs/リリース計画.md)
- [機能ロードマップ](./docs/ロードマップ.md)
- [ユーザーペルソナ](./docs/ユーザーペルソナ.md)
