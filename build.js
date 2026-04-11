/**
 * Site2Markdown - ビルドスクリプト
 * .env の値を lib/analytics.template.js に注入して lib/analytics.js を生成する。
 * 使い方: node build.js
 */

const fs = require('fs');
const path = require('path');

// .env を手動パース（npm パッケージ不要）
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('エラー: .env ファイルが見つかりません。');
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx === -1) return;
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
});

// テンプレートを読み込んでプレースホルダーを置換
const templatePath = path.join(__dirname, 'lib', 'analytics.template.js');
let content = fs.readFileSync(templatePath, 'utf8');
content = content.replace('__GA4_API_SECRET__', env.GA4_API_SECRET || '');

const outputPath = path.join(__dirname, 'lib', 'analytics.js');
fs.writeFileSync(outputPath, content);
console.log('✓ lib/analytics.js を生成しました。');
