# Site2Markdown — プランニングギャップ分析

作成: 2026-03-20 / リサーチ済み

---

## 🔴 クリティカル（公開前に対処必須）

### 1. `<all_urls>` + content_scripts の審査リスク

**現状:** `manifest.json` が全URLに対してコンテンツスクリプトを自動注入している。

```json
"content_scripts": [{ "matches": ["<all_urls>"], ... }]
"host_permissions": ["<all_urls>"]
```

**リスク:** Chrome Web Store の審査チームは `<all_urls>` を「ブラウジング履歴収集・認証情報窃取のリスク」として警戒する。
審査期間が通常の1〜3倍に延び、「パーミッション過剰要求」「説明文との不一致」でリジェクトされる事例が多数報告されている（2024〜2026年）。

**対策:**
- content_scripts の `matches` を実際に必要なスコープに限定することを検討
- どうしても `<all_urls>` が必要な場合、ストア説明文に「なぜ全URLへのアクセスが必要か」を明記する
  > 例：「ユーザーがアイコンをクリックした場合のみ現在のページを読み取ります。閲覧履歴の収集・外部送信は一切行いません。」
- `activeTab` パーミッションへの移行も検討（ユーザーがクリックしたタブのみに一時アクセス、インストール時の警告が表示されない）

---

### 2. プライバシーポリシーが存在しない

**現状:** プライバシーポリシーのページが存在しない。

**リスク:** `storage` + `<all_urls>` を持つ拡張機能はプライバシーポリシーの URL が **Chrome Web Store 提出に必須**。
Sentry などのエラートラッキングを追加した場合も即必須になる。

**最低限記載すべき内容:**

| 項目 | Site2Markdown での内容 |
|------|----------------------|
| 収集するデータ | chrome.storage.sync に保存するユーザー設定値のみ |
| 使用目的 | 変換設定の保存・復元 |
| 第三者への共有 | なし（ExtensionPay 導入後は Stripe に決済情報が渡る旨を追記） |
| データ保持期間 | ユーザーが拡張機能をアンインストールするまで |
| ユーザーの権利 | 設定画面からリセット可能 / 問い合わせ先メール |

**ホスティング方法（コストゼロ）:**
- GitHub Pages: リポジトリに `privacy-policy.md` を置いて Pages で公開 → `https://username.github.io/site2markdown/privacy-policy`
- Notion 公開ページ: ページを「Web公開」設定するだけ（URL は長いが審査で受理される実例あり）
- 日本語で問題なし（Googleの要件は「明確で理解しやすい言語」のみ）

---

### 3. ストア掲載コンテンツが未計画

**現状:** タスクに「ストア掲載素材の作成」とあるだけ。中身が未定。

空のメタデータ（説明文なし・スクリーンショットなし）は **即リジェクト**。

**作成が必要なもの:**

| 素材 | 要件 | 内容の方針 |
|------|------|----------|
| 短い説明文 | 132文字以内 | **ストア検索キーワードに直結**。"Markdown" "web clipper" "Obsidian" "Notion" を含める |
| 詳細説明文 | 最大16,384文字 | 単一目的の明示 → 主要機能の列挙 → 各パーミッションの使用理由 → 競合との差別化 |
| スクリーンショット | 1280×800 または 640×400（最大6枚） | ①ポップアップ変換画面 ②設定画面 ③フロントマター出力例 ④Obsidianへの貼り付け例 |
| プロモーション画像 | 1400×560 | ヘッダービジュアル。テキスト入れすぎない |
| カテゴリ | 選択 | "Productivity"（メモ・PKMユーザー向け）が第一候補 |

**短い説明文（案）:**
> Convert any webpage to clean Markdown in one click. Perfect for Obsidian, Notion, and AI prompts. Customizable frontmatter, image handling, and filename format.

---

## 🟡 重要（フリーミアム移行前に対処）

### 4. マーケティング・集客計画がゼロ

**現状:** 「無料公開してユーザーを集める」のみ。具体的な集客手段がない。

**ローンチ戦略（優先順）:**

#### Product Hunt
- **タイミング:** 火〜木曜の **00:01 AM PST**（日本時間 17:01）
- **目標:** 上位6位以内 = 300〜900 upvotes → 1週間で1,000インストール到達が目安
- **やること:** ローンチ当日は30分ごとにコメント返信。"upvoteしてください"はNG → "フィードバックをください"
- タグライン例：`Convert any webpage to clean Markdown — for Obsidian, Notion & AI`

#### Reddit
- **r/chrome_extensions** — 拡張機能専用。「何ができるか・何の問題を解決するか」を明記すれば歓迎される
- **r/ObsidianMD** — Obsidian連携訴求で自然に投稿可能
- **r/Notion** — Notion連携訴求
- **r/productivity** — 問題解決ストーリー形式で投稿
- **鉄則:** 新規アカウントで即宣伝投稿は BAN。まず90%を genuine な参加に使う

#### Hacker News（Show HN）
- **タイミング:** 火〜木曜 08:00〜10:00 AM PT（日本時間 0:00〜2:00）
- **タイトル例:** `Show HN: Site2Markdown – Convert any webpage to Markdown for Obsidian/AI`
- 最初の1時間は10〜15分ごとに確認してコメントに返信

#### 日本語チャネル
| チャネル | アプローチ |
|----------|-----------|
| **Zenn** | 「Chrome拡張を作った」技術記事。MV3対応・設計の詳細が刺さる |
| **Qiita** | 同上。LGTMが拡散の鍵 |
| **X（日本）** | `#個人開発` `#Chrome拡張` タグ。朝7〜9時・夜20〜23時 |
| **note** | 開発背景・課題解決ストーリー |

#### 外部掲載サイト（無料）
- extensionradar.com, chrome-stats.com, AlternativeTo への掲載申請

---

### 5. KPI と期間の目安がない

**現状:** 「レビュー100件を獲得」のみ。期間・測定方法・その他指標が未定。

**追うべき KPI:**

| KPI | 目標値 | 測定方法 |
|-----|--------|---------|
| 週次アクティブユーザー数（WAU: Weekly Active Users） | 3ヶ月で 1,000人 | Chrome Web Store ダッシュボード |
| ストア CVR（閲覧→インストール） | 3〜6% | ダッシュボード Impressions タブ |
| 初日アンインストール率 | 30%以下 | ダッシュボード Installs & Uninstalls タブ |
| レビュー平均評価 | 4.0以上を維持 | ダッシュボード |
| レビュー件数 | 3ヶ月で 50件、6ヶ月で 100件 | ダッシュボード |
| フリーミアム転換率（Phase 2〜） | 2〜3% | ExtensionPay ダッシュボード |

**重要:** Chrome Web Store の「Weekly Users」は「Chromeを起動したユーザー数」であり真の DAU ではない。
実際の機能利用状況を追うには **GA4 を拡張機能内に組み込む**必要がある（Chrome Web Store は GA4 連携をサポート済み）。

**収益目標の逆算:**
- $1,000 MRR（目標）を $9 買い切りで達成するには 約112人 の有料ユーザーが必要
- 転換率 3% なら 約3,700人 のアクティブユーザーが必要
- 転換率 2% なら 約5,600人 のアクティブユーザーが必要

---

### 6. フリーミアム移行時の既存ユーザー対応が未定

**現状:** フェーズ2でフリーミアム化した際に何も決まっていない。

**決める必要があること:**
- フェーズ1の既存ユーザーを全員 Pro にする（グランドファザリング）かどうか
  → 推奨: する。初期ユーザーへの感謝と口コミ効果を考えると価値がある
- 既存ユーザーへの通知手段（Chrome拡張はプッシュ通知が難しい）
  → 現実的な手段: ポップアップに「お知らせ」バナー / X や Product Hunt での告知 / chrome.storage でバージョンを管理してアップデート時に表示

---

### 7. バージョン管理・アップデート戦略がない

**現状:** v1.0.0 で止まっており、先の計画がない。

**Chrome Web Store のアップデート審査:**
- アップデートごとに再審査あり（通常24〜72時間）
- パーミッションを追加する変更は審査が厳しくなる

**対応策:**
- GitHub でリポジトリを公開 → Releases にタグとchangelogを記録
- セマンティックバージョニング（MAJOR.MINOR.PATCH）を採用
- パーミッション追加を伴うアップデートは事前に必要性を設計段階で洗い出す

---

## 🟢 軽微（早めに対処したほうがよい）

### 8. OSS ライセンス表示

Turndown（MIT）・@mozilla/readability（Apache 2.0）の LICENSE ファイルを `vendor/` フォルダに同梱する必要がある。
Apache 2.0 は著作権表示・ライセンス文の同梱が義務。

```
vendor/
├── Readability.js
├── Readability-LICENSE       ← Apache 2.0 の全文
├── turndown.js
├── turndown-LICENSE          ← MIT の全文
├── turndown-plugin-gfm.js
└── turndown-plugin-gfm-LICENSE
```

### 9. サポート窓口が未定

Chrome Web Store の掲載情報には「サポートサイトURL」欄がある。
推奨: GitHub リポジトリの Issues ページ（無料、透明性が高い）

### 10. SPEC.md が現状と乖離

ストレージスキーマが8フィールドと記載されているが、実装は24フィールドに拡張済み。
UI仕様図も現在のポップアップ（editorial デザイン）と別物。公開前に更新が必要。

---

## アクションプラン（優先順）

### 公開前（フェーズ1）
- [ ] プライバシーポリシーを作成 → GitHub Pages で公開
- [ ] ストア短い説明文・詳細説明文を作成（パーミッション使用理由を明記）
- [ ] スクリーンショット 4〜6枚・プロモーション画像を作成
- [ ] `<all_urls>` の必要性を再検討（`activeTab` への移行が可能か確認）
- [ ] `vendor/` に OSS ライセンスファイルを追加
- [ ] GitHub リポジトリを公開（サポート窓口として）
- [ ] SPEC.md を現状に合わせて更新

### 公開直後（フェーズ1 ローンチ）
- [ ] Product Hunt にローンチ（火〜木 17:01 JST）
- [ ] Zenn / Qiita に技術記事を投稿
- [ ] r/chrome_extensions / r/ObsidianMD / r/Notion に投稿
- [ ] Hacker News Show HN に投稿
- [ ] GA4 を拡張機能内に組み込んで実利用データ取得開始

### フリーミアム化前（フェーズ2）
- [ ] KPI をダッシュボードで定期確認（週次）
- [ ] 既存ユーザーのグランドファザリング方針を決定
- [ ] バージョン管理・changelog を整備

---

## 参考リンク

- [Chrome Web Store 審査プロセス](https://developer.chrome.com/docs/webstore/review-process)
- [よくあるリジェクト理由](https://developer.chrome.com/docs/webstore/troubleshooting)
- [プライバシーポリシー要件](https://developer.chrome.com/docs/webstore/program-policies/privacy)
- [activeTab パーミッション](https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/)
- [Chrome Web Store アナリティクス](https://developer.chrome.com/docs/webstore/metrics)
- [Product Hunt ローンチガイド](https://usewhale.io/blog/product-hunt-launch-checklist/)
- [HN ローンチガイド](https://www.markepear.dev/blog/dev-tool-hacker-news-launch)
- [フリーミアム転換率ベンチマーク - Lenny's Newsletter](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
