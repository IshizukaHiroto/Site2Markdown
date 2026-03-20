# Site2Markdown — フィードバック収集 & フリーミアム実装ガイド

作成: 2026-03-20 / 対象: Chrome拡張機能（Manifest V3）

---

## Part 1: フィードバック収集

### 方針（結論から）

| 目的 | 手段 | 工数 |
|------|------|------|
| エラー検知 | Sentry バンドル同梱 | 中 |
| ユーザーの声 | ポップアップ内フォーム + N回使用後トリガー | 小 |
| レビュー誘導 | Chrome Web Store への直リンク | 最小 |

---

### 1-1. エラートラッキング: Sentry

**MV3での制約と対応**

MV3 では CDN からスクリプトを読み込む `<script src="...">` が CSP で禁止されている。
Sentry の JS SDK を **拡張機能に同梱（バンドル）** することで解決できる。

```bash
npm install @sentry/browser
# bundler（esbuild / Rollup）でバンドルして dist/ に含める
```

```javascript
// popup.js の先頭
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_DSN',
  release: '1.0.0',
});
```

Service Worker（background.js）・ポップアップ・コンテンツスクリプトそれぞれで
個別に `Sentry.init()` を呼ぶ必要がある（コンテキストが分離されているため）。

**料金**: 無料プランで月 10,000 イベントまで → 個人開発なら十分

**注意**: minified な bundle が「リモートコードを含む」として審査に引っかかる事例あり（2025年）。
→ ソースマップを分けて `dist/` には含めない構成にする。

---

### 1-2. ユーザーフィードバック収集

#### パターン A: ポップアップ内インラインフォーム（最もシンプル）

popup.html の action-bar 下部などに星評価 + テキストエリアを置く。
送信は `fetch()` で Google Forms の POST エンドポイントへ投げる。

```html
<!-- popup.html に追加 -->
<div id="feedback-area" hidden>
  <div class="star-rating">...</div>
  <textarea id="feedback-text" placeholder="ご意見をどうぞ"></textarea>
  <button id="send-feedback">送信</button>
</div>
```

```javascript
// Google Forms の entry ID に対して fetch POST
const FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
await fetch(FORM_URL, {
  method: 'POST',
  body: new URLSearchParams({ 'entry.12345': feedbackText }),
  mode: 'no-cors',
});
```

#### パターン B: N回使用後トリガー（推奨）

10回変換したタイミングで初めてフィードバックを促す。
ユーザーが「価値を感じた後」に聞くので回答率が上がる。

```javascript
// popup.js で変換成功のたびに呼ぶ
async function incrementUsageAndMaybeAskFeedback() {
  const { usageCount = 0 } = await chrome.storage.local.get('usageCount');
  const newCount = usageCount + 1;
  await chrome.storage.local.set({ usageCount: newCount });

  // 10回目・50回目に1度だけ表示
  if (newCount === 10 || newCount === 50) {
    showFeedbackPrompt();
  }
}
```

#### パターン C: Chrome Web Store レビュー誘導

最もコストゼロ。action-bar にリンクを置くだけ。

```javascript
const EXTENSION_ID = chrome.runtime.id;
const reviewUrl = `https://chrome.google.com/webstore/detail/${EXTENSION_ID}/reviews`;

document.getElementById('reviewBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: reviewUrl });
});
```

**タイミングのベストプラクティス**:
- 「保存しました ✓」の直後に小さく「レビューを書く？」を表示
- 「後で」ボタンを必ず置く（強制はユーザーを怒らせる）

---

### 1-3. Site2Markdown での実装方針（具体案）

フェーズ1（無料公開直後）は最小工数で始める：

1. **Sentry** をバンドル同梱してエラー収集（変換失敗のスタックトレース）
2. **10回変換後** にポップアップ下部に小さく「フィードバックを送る」リンクを表示
3. 変換成功後に「★ レビューを書く」リンクを action-bar に常設

フェーズ2（Pro リリース後）に NPS を追加でよい。

---

## Part 2: 無料 / Pro 機能の分化

### 方針（結論から）

**ExtensionPay を使う。**

理由:
- サーバー不要（自前バックエンド構築ゼロ）
- MV3 の CSP 問題を既に解決済み
- Stripe ベースで信頼性が高い
- 手数料 5% + Stripe 手数料（2.9% + $0.30）のみ、月額固定費なし

---

### 2-1. ExtensionPay のセットアップ

**Step 1: 登録**

1. [extensionpay.com](https://extensionpay.com/) でアカウント作成
2. Extension ID と Stripe アカウントを登録
3. 価格（$9 の一回払い）を設定

**Step 2: ファイル配置**

```
拡張機能/
├── ExtPay.js      ← extensionpay.com からダウンロードして同梱
├── background.js
├── popup/
│   └── popup.js
└── manifest.json
```

**Step 3: manifest.json に追記**

```json
{
  "background": {
    "service_worker": "background.js"
  },
  "permissions": ["storage"],
  "host_permissions": ["https://extensionpay.com/*"]
}
```

**Step 4: background.js**

```javascript
// background.js
const extpay = ExtPay('site2markdown'); // extensionpay.com で登録したID
extpay.startBackground();              // これだけ。決済完了の通知を受け取る
```

**Step 5: popup.js での Pro 判定**

```javascript
const extpay = ExtPay('site2markdown');

// ポップアップ起動時に Pro チェック
const user = await extpay.getUser();

if (user.paid) {
  enableProFeatures();
} else {
  disableProFeatures();
  // 鍵アイコンを表示してクリックで決済画面へ
  document.getElementById('upgradeBtn').addEventListener('click', () => {
    extpay.openPaymentPage();
  });
}
```

---

### 2-2. Pro 機能のオン/オフ制御パターン

```javascript
const PRO_FEATURES = [
  'selectionOnly',
  'headingShift',
  'frontmatterCustom',
  'autoCopy',
  'filenameSeparator',
];

function enableProFeatures() {
  document.getElementById('upgradeSection').hidden = true;
}

function disableProFeatures() {
  PRO_FEATURES.forEach(featureId => {
    const el = document.getElementById(featureId);
    if (el) {
      el.disabled = true;
      el.closest('.setting-row')?.classList.add('is-locked');
    }
  });
  document.getElementById('upgradeSection').hidden = false;
}
```

**options.css に追加するロック表示**:

```css
.setting-row.is-locked {
  opacity: 0.45;
  pointer-events: none;
  position: relative;
}
.setting-row.is-locked::after {
  content: 'Pro';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--ink-light);
}
```

---

### 2-3. セキュリティの考え方

| 攻撃手法 | ExtensionPay での対応 |
|----------|----------------------|
| `chrome.storage` を直接書き換えて `isPro: true` にする | ExtensionPay はストレージに保存せず**サーバーで検証**するため無効 |
| 開発者ツールで JS を改ざん | Service Worker ではデバッグが難しい。完全には防げないが許容範囲 |
| アカウント共有 | Stripe の購入者メールに紐づくため、拡張機能ごとに独立 |

**結論**: ExtensionPay を使えばクライアント側の改ざん耐性は十分。
個人開発規模では Lemon Squeezy や自前バックエンドは過剰。

---

### 2-4. Lemon Squeezy（代替案）

ExtensionPay が合わない場合の代替。ライセンスキー方式。

```javascript
// 購入後にユーザーがキーを入力 → API で検証
const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
  method: 'POST',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ license_key: userInputKey }),
});
const data = await res.json();

// store_id を必ず照合（他製品のキー流用攻撃を防ぐ）
if (data.valid && data.meta.store_id === YOUR_STORE_ID) {
  chrome.storage.sync.set({ isPro: true, licenseKey: userInputKey });
}
```

**手数料**: 売上の一定割合（プランによる）
**利点**: キー入力方式なのでギフト・割引コード等が作りやすい

---

## 実装ロードマップ

### フェーズ1（無料公開と同時）
- [ ] Sentry をバンドル同梱（エラートラッキング）
- [ ] 10回使用後のフィードバックトリガーを実装
- [ ] action-bar に「★ レビューを書く」リンクを追加

### フェーズ2（フリーミアム化）
- [ ] extensionpay.com でアカウント・価格設定
- [ ] ExtPay.js を同梱し background.js に `startBackground()` を追加
- [ ] popup.js / options.js に `getUser()` による Pro 判定を追加
- [ ] Pro 機能に `.is-locked` クラスの UI を実装
- [ ] ストアページの説明文に「Pro版あり」を追記

---

## 参考リンク

- [ExtensionPay 公式](https://extensionpay.com/)
- [ExtPay GitHub (Glench/ExtPay)](https://github.com/Glench/ExtPay)
- [Sentry + Chrome Extension MV3 ガイド](https://www.mikesallese.me/blog/installing-sentry-in-chrome-extension/)
- [Lemon Squeezy ライセンスキー検証 API](https://docs.lemonsqueezy.com/guides/tutorials/license-keys)
- [Lemon Squeezy を Chrome 拡張に統合する方法 (DEV)](https://dev.to/notearthian/how-to-integrate-lemon-squeezy-payments-into-a-chrome-extension-with-webhooks-3ib9)
- [Chrome Web Store ユーザーフィードバック管理](https://developer.chrome.com/docs/webstore/support-users)
- [MV3 Content Security Policy](https://developer.chrome.com/docs/extensions/mv3/manifest/content_security_policy/)
