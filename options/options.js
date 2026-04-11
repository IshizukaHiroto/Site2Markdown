/**
 * Site2Markdown - Options Script
 */

const UPGRADE_URL = 'https://site2markdown.polarphos.com'; // v1.1 で ExtensionPay に切り替え予定

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
};

// ── i18n ──────────────────────────────────────────────────────────────────────

const I18N = {
  ja: {
    pageTitle:                'Site2Markdown — 設定',
    topbarTitle:              '設定',
    topbarSubtitle:           '変換の動作をカスタマイズします。',
    langNext:                 'English',
    sideNavAriaLabel:         '設定カテゴリ',
    sidebarCat:               'カテゴリ',
    tabCleanup:               '本文の整え方',
    tabOutput:                '出力形式',
    tabFrontmatter:           'メタ情報',
    tabFilename:              'ファイル名・動作',
    tabPreview:               '出力例',
    upgradeTitle:             '有料版にアップグレード',
    upgradeDesc:              '選択範囲変換・リンク除去・見出しシフト・カスタムフィールド・自動コピーが使えます。',
    upgradeBtn:               'アップグレード — $9',
    panelCleanupKicker:       '本文整理',
    panelCleanupTitle:        '本文の整え方',
    panelCleanupDesc:         '取得方法と除去する要素を指定します。',
    panelOutputKicker:        'Output',
    panelOutputTitle:         'Markdown の出力形式',
    panelOutputDesc:          '変換後の Markdown 構造を調整します。',
    panelFrontmatterKicker:   'Frontmatter',
    panelFrontmatterTitle:    'メタ情報',
    panelFrontmatterDesc:     '先頭に付与する YAML フロントマターを設定します。',
    panelFilenameKicker:      'File & Behavior',
    panelFilenameTitle:       'ファイル名・動作',
    panelFilenameDesc:        'ファイル名フォーマットと自動動作を設定します。',
    panelPreviewKicker:       'Preview',
    panelPreviewTitle:        '現在の出力例',
    panelPreviewDesc:         '設定を変更すると即時反映されます。',
    colItem:                  '項目',
    colDesc:                  '説明',
    colSetting:               '設定',
    colUse:                   '使用',
    settingExtractionName:    'コンテンツ抽出',
    settingExtractionDesc:    'Readability は記事本文を自動抽出、body はページ全体を変換します。',
    optExtractionReadability: 'Readability（推奨）',
    optExtractionBody:        'ページ全体（body）',
    settingSelectionName:     '選択範囲のみ変換',
    settingSelectionDesc:     '選択中のテキストのみを変換します。',
    groupRemove:              '除去オプション',
    settingRemoveAdsName:     '広告を除去',
    settingRemoveAdsDesc:     '広告ブロックを出力から除去します。',
    settingRemoveHeaderName:  'ヘッダーを除去',
    settingRemoveHeaderDesc:  'ロゴや上部ナビを除去します。',
    settingRemoveFooterName:  'フッターを除去',
    settingRemoveFooterDesc:  '末尾の補助情報を除去します。',
    settingRemoveNavName:     'ナビゲーションバーを除去',
    settingRemoveNavDesc:     'メニューやパンくずを除去します。',
    settingRemoveSidebarName: 'サイドバーを除去',
    settingRemoveSidebarDesc: '補助カラムを除去します。',
    settingImageName:         '画像の扱い',
    settingImageDesc:         '保持 / alt テキストのみ / 除去を選択します。',
    optImageKeep:             'そのまま保持',
    optImageAltOnly:          'alt テキストのみ',
    optImageRemove:           '完全に除去',
    settingLinkName:          'リンクの扱い',
    settingLinkDesc:          'リンクを保持するか、テキストのみにするかを選択します。',
    optLinkKeep:              'リンクを保持',
    optLinkTextOnly:          'テキストのみ（URL 除去）',
    settingHeadingName:       '見出しレベルのシフト',
    settingHeadingDesc:       '他の文書に組み込む際、h1 の重複を防げます。',
    optHeading0:              'シフトなし',
    optHeading1:              '1 段下げる（h1 → h2）',
    optHeading2:              '2 段下げる（h1 → h3）',
    settingCollapseName:      '空行を圧縮',
    settingCollapseDesc:      '3行以上の連続空行を2行に圧縮します。',
    settingFmEnableName:      'フロントマターを付与する',
    settingFmEnableDesc:      'ページ情報を YAML で先頭に追加します。',
    fmHint:                   'フロントマターを ON にすると、含める項目を下の表から選べます。',
    fmSubTitle:               'frontmatter に含める項目',
    fmSubDesc:                '含める項目を選択します。',
    settingFmTitleName:       'タイトル',
    settingFmTitleDesc:       'ページのタイトルを付与します。',
    settingFmUrlName:         'URL',
    settingFmUrlDesc:         '変換元ページの URL を付与します。',
    settingFmDateName:        '日付',
    settingFmDateDesc:        '保存した日付を付与します。',
    settingFmDescName:        '概要',
    settingFmDescDesc:        'meta description / og:description を付与します。',
    settingFmAuthorName:      '著者',
    settingFmAuthorDesc:      'meta author から著者名を付与します。',
    settingFmTagsName:        'タグ',
    settingFmTagsDesc:        '固定タグを全変換に付与します。',
    tagsValueLabel:           'タグの値（カンマ区切り）',
    fmCustomName:             'カスタムフィールド',
    fmCustomDesc:             'YAML 形式で入力（複数行可）。',
    fnFormatTitle:            'ファイル名のフォーマット',
    fnFormatDesc:             '出力ファイル名のルールを設定します。',
    settingFnDateName:        '日付フォーマット',
    settingFnDateDesc:        '先頭に付与する日付形式。',
    optFnDateYyyyMmDd:        'YYYY-MM-DD（例: 2026-03-19）',
    optFnDateYyyymmdd:        'YYYYMMDD（例: 20260319）',
    optFnDateNone:            'なし',
    settingFnSepName:         '区切り文字',
    settingFnSepDesc:         '日付とタイトルの区切り文字。',
    optFnSepUnderscore:       'アンダースコア（_）',
    optFnSepHyphen:           'ハイフン（-）',
    settingFnMaxlenName:      'タイトル最大文字数',
    settingFnMaxlenDesc:      'タイトル部の最大文字数（10〜200）。',
    fnBehaviorTitle:          'ポップアップの動作',
    fnBehaviorDesc:           'ポップアップを開いた際の自動動作。',
    settingAutoCopyName:      '自動コピー',
    settingAutoCopyDesc:      '変換完了時にクリップボードへ自動コピーします。',
    previewFilenameLabel:     '保存されるファイル名',
    previewTitlePart:         'ページタイトル（最大{n}文字）',
    footerSynced:             '設定はブラウザに同期保存されます。',
    btnReset:                 'デフォルトに戻す',
    btnSave:                  '変更を保存',
    confirmReset:             'すべての設定をデフォルトに戻しますか？',
    statusSaved:              '保存済み',
    statusDirty:              '未保存の変更',
    statusSaving:             '保存中...',
    statusError:              '保存に失敗しました',
  },
  en: {
    pageTitle:                'Site2Markdown — Settings',
    topbarTitle:              'Settings',
    topbarSubtitle:           'Customize conversion behavior.',
    langNext:                 '日本語',
    sideNavAriaLabel:         'Settings categories',
    sidebarCat:               'Categories',
    tabCleanup:               'Content Cleanup',
    tabOutput:                'Output Format',
    tabFrontmatter:           'Metadata',
    tabFilename:              'Filename & Behavior',
    tabPreview:               'Preview',
    upgradeTitle:             'Upgrade to Paid Plan',
    upgradeDesc:              'Unlock selection-only, link removal, heading shift, custom fields, and auto-copy.',
    upgradeBtn:               'Upgrade — $9',
    panelCleanupKicker:       'Cleanup',
    panelCleanupTitle:        'Content Cleanup',
    panelCleanupDesc:         'Specify extraction method and elements to remove.',
    panelOutputKicker:        'Output',
    panelOutputTitle:         'Markdown Output Format',
    panelOutputDesc:          'Adjust the Markdown structure after conversion.',
    panelFrontmatterKicker:   'Frontmatter',
    panelFrontmatterTitle:    'Metadata',
    panelFrontmatterDesc:     'Configure YAML frontmatter prepended to the output.',
    panelFilenameKicker:      'File & Behavior',
    panelFilenameTitle:       'Filename & Behavior',
    panelFilenameDesc:        'Configure filename format and automatic behavior.',
    panelPreviewKicker:       'Preview',
    panelPreviewTitle:        'Current Preview',
    panelPreviewDesc:         'Changes are reflected immediately.',
    colItem:                  'Setting',
    colDesc:                  'Description',
    colSetting:               'Value',
    colUse:                   'On/Off',
    settingExtractionName:    'Content Extraction',
    settingExtractionDesc:    'Readability auto-extracts article content; body converts the entire page.',
    optExtractionReadability: 'Readability (recommended)',
    optExtractionBody:        'Full page (body)',
    settingSelectionName:     'Selection Only',
    settingSelectionDesc:     'Converts only the selected text.',
    groupRemove:              'Remove Options',
    settingRemoveAdsName:     'Remove Ads',
    settingRemoveAdsDesc:     'Removes ad blocks from the output.',
    settingRemoveHeaderName:  'Remove Header',
    settingRemoveHeaderDesc:  'Removes logos and top navigation.',
    settingRemoveFooterName:  'Remove Footer',
    settingRemoveFooterDesc:  'Removes supplemental footer content.',
    settingRemoveNavName:     'Remove Navigation',
    settingRemoveNavDesc:     'Removes menus and breadcrumbs.',
    settingRemoveSidebarName: 'Remove Sidebar',
    settingRemoveSidebarDesc: 'Removes auxiliary columns.',
    settingImageName:         'Image Handling',
    settingImageDesc:         'Choose: keep / alt text only / remove.',
    optImageKeep:             'Keep as-is',
    optImageAltOnly:          'Alt text only',
    optImageRemove:           'Remove entirely',
    settingLinkName:          'Link Handling',
    settingLinkDesc:          'Choose to keep links or convert to text only.',
    optLinkKeep:              'Keep links',
    optLinkTextOnly:          'Text only (remove URLs)',
    settingHeadingName:       'Heading Level Shift',
    settingHeadingDesc:       'Prevents h1 duplication when embedding in another document.',
    optHeading0:              'No shift',
    optHeading1:              'Shift down 1 (h1 → h2)',
    optHeading2:              'Shift down 2 (h1 → h3)',
    settingCollapseName:      'Collapse Blank Lines',
    settingCollapseDesc:      'Collapses 3+ consecutive blank lines to 2.',
    settingFmEnableName:      'Enable Frontmatter',
    settingFmEnableDesc:      'Prepends page info as YAML frontmatter.',
    fmHint:                   'Enable frontmatter to select which fields to include below.',
    fmSubTitle:               'Fields to include',
    fmSubDesc:                'Select which fields to include.',
    settingFmTitleName:       'Title',
    settingFmTitleDesc:       'Adds the page title.',
    settingFmUrlName:         'URL',
    settingFmUrlDesc:         'Adds the source page URL.',
    settingFmDateName:        'Date',
    settingFmDateDesc:        'Adds the save date.',
    settingFmDescName:        'Description',
    settingFmDescDesc:        'Adds meta description / og:description.',
    settingFmAuthorName:      'Author',
    settingFmAuthorDesc:      'Adds author name from meta author.',
    settingFmTagsName:        'Tags',
    settingFmTagsDesc:        'Adds fixed tags to all conversions.',
    tagsValueLabel:           'Tag values (comma-separated)',
    fmCustomName:             'Custom Fields',
    fmCustomDesc:             'Enter in YAML format (multiple lines allowed).',
    fnFormatTitle:            'Filename Format',
    fnFormatDesc:             'Configure output filename rules.',
    settingFnDateName:        'Date Format',
    settingFnDateDesc:        'Date format prepended to the filename.',
    optFnDateYyyyMmDd:        'YYYY-MM-DD (e.g. 2026-03-19)',
    optFnDateYyyymmdd:        'YYYYMMDD (e.g. 20260319)',
    optFnDateNone:            'None',
    settingFnSepName:         'Separator',
    settingFnSepDesc:         'Separator between date and title.',
    optFnSepUnderscore:       'Underscore (_)',
    optFnSepHyphen:           'Hyphen (-)',
    settingFnMaxlenName:      'Title Max Length',
    settingFnMaxlenDesc:      'Max characters for the title part (10–200).',
    fnBehaviorTitle:          'Popup Behavior',
    fnBehaviorDesc:           'Automatic behavior when the popup is opened.',
    settingAutoCopyName:      'Auto Copy',
    settingAutoCopyDesc:      'Automatically copies to clipboard when conversion completes.',
    previewFilenameLabel:     'Saved filename',
    previewTitlePart:         'page-title (max {n} chars)',
    footerSynced:             'Settings are synced across browsers.',
    btnReset:                 'Reset to Default',
    btnSave:                  'Save Changes',
    confirmReset:             'Reset all settings to defaults?',
    statusSaved:              'Saved',
    statusDirty:              'Unsaved changes',
    statusSaving:             'Saving...',
    statusError:              'Save failed',
  },
};

// ── State ─────────────────────────────────────────────────────────────────────

let currentLang = 'ja';
let currentT    = I18N.ja;

// ── Language ──────────────────────────────────────────────────────────────────

function applyLanguage(lang) {
  currentLang = lang;
  currentT    = I18N[lang];
  document.documentElement.lang = lang;
  document.title = currentT.pageTitle;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (currentT[key] !== undefined) el.textContent = currentT[key];
  });

  const langBtn = document.getElementById('langBtn');
  langBtn.textContent = lang === 'ja' ? 'EN' : 'JP';
  langBtn.title = currentT.langNext;

  const sideNav = document.querySelector('.side-nav');
  if (sideNav) sideNav.setAttribute('aria-label', currentT.sideNavAriaLabel);
}

async function initLanguage() {
  const { uiLanguage } = await new Promise((resolve) =>
    chrome.storage.sync.get({ uiLanguage: 'auto' }, resolve)
  );
  let lang = uiLanguage;
  if (lang === 'auto') {
    lang = navigator.language.startsWith('ja') ? 'ja' : 'en';
  }
  applyLanguage(lang);
  return lang;
}

// ── Form fields ───────────────────────────────────────────────────────────────

const FORM_FIELDS = [
  { id: 'removeAds',              type: 'checkbox' },
  { id: 'removeHeader',           type: 'checkbox' },
  { id: 'removeFooter',           type: 'checkbox' },
  { id: 'removeNav',              type: 'checkbox' },
  { id: 'removeSidebar',          type: 'checkbox' },
  { id: 'imageHandling',          type: 'select'   },
  { id: 'linkHandling',           type: 'select'   },
  { id: 'collapseBlankLines',     type: 'checkbox' },
  { id: 'headingShift',           type: 'select'   },
  { id: 'extractionMode',         type: 'select'   },
  { id: 'selectionOnly',          type: 'checkbox' },
  { id: 'frontmatterEnabled',     type: 'checkbox' },
  { id: 'frontmatterTitle',       type: 'checkbox' },
  { id: 'frontmatterUrl',         type: 'checkbox' },
  { id: 'frontmatterDate',        type: 'checkbox' },
  { id: 'frontmatterDescription', type: 'checkbox' },
  { id: 'frontmatterAuthor',      type: 'checkbox' },
  { id: 'frontmatterTags',        type: 'checkbox' },
  { id: 'frontmatterTagsValue',   type: 'text'     },
  { id: 'frontmatterCustom',      type: 'textarea' },
  { id: 'filenameDateFormat',     type: 'select'   },
  { id: 'filenameSeparator',      type: 'select'   },
  { id: 'filenameTitleMaxLength', type: 'number'   },
  { id: 'autoCopy',               type: 'checkbox' },
];

const PRO_SETTING_IDS = new Set([
  'selectionOnly',
  'frontmatterCustom',
  'headingShift',
  'linkHandling',
  'autoCopy',
]);

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

let lastSavedSettings = { ...DEFAULT_SETTINGS };
let isSaving = false;

// ── Pro gate ──────────────────────────────────────────────────────────────────

function applyProGate(isPro) {
  const upgradeSection = document.getElementById('upgrade-section');
  if (isPro) {
    if (upgradeSection) upgradeSection.hidden = true;
    return;
  }

  PRO_SETTING_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = true;
      const row = el.closest('[data-pro]');
      if (row) row.classList.add('is-locked');
    }
  });

  const headingShiftEl = document.getElementById('headingShift');
  if (headingShiftEl) {
    Array.from(headingShiftEl.options).forEach((opt) => {
      if (opt.value !== '0') opt.disabled = true;
    });
  }

  const linkHandlingEl = document.getElementById('linkHandling');
  if (linkHandlingEl) {
    Array.from(linkHandlingEl.options).forEach((opt) => {
      if (opt.value === 'textOnly') opt.disabled = true;
    });
  }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function initSidebarTabs() {
  const tabs   = Array.from(document.querySelectorAll('.side-link[data-target]'));
  const panels = Array.from(document.querySelectorAll('.panel[role="tabpanel"]'));

  function activatePanel(targetId) {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.target === targetId;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
    panels.forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activatePanel(tab.dataset.target));
  });
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function updateFrontmatterFieldsState(enabled) {
  document.getElementById('frontmatterFields').hidden = !enabled;
  document.getElementById('frontmatterHint').hidden   = enabled;
}

function updateTagsInputState(enabled) {
  const row = document.getElementById('tagsValueRow');
  if (row) row.hidden = !enabled;
}

function normalizeSettings(settings) {
  const normalized = Object.assign({}, DEFAULT_SETTINGS, settings);
  normalized.headingShift          = parseInt(normalized.headingShift) || 0;
  normalized.filenameTitleMaxLength = parseInt(normalized.filenameTitleMaxLength) || 50;
  return normalized;
}

function settingsEqual(left, right) {
  return SETTING_KEYS.every((key) => String(left[key]) === String(right[key]));
}

function setSaveStatus(state, message) {
  const el = document.getElementById('saveStatus');
  el.dataset.state = state;
  el.textContent = message;
}

function updateFilenamePreview() {
  const settings = collectSettingsFromForm();
  const sep      = settings.filenameSeparator || '_';
  const maxLen   = settings.filenameTitleMaxLength || 50;
  const fmt      = settings.filenameDateFormat;

  let datePart = '';
  if (fmt === 'YYYY-MM-DD') datePart = 'YYYY-MM-DD';
  else if (fmt === 'YYYYMMDD') datePart = 'YYYYMMDD';

  const titlePart = (currentT.previewTitlePart || 'title (max {n} chars)').replace('{n}', maxLen);
  const preview   = datePart ? `${datePart}${sep}${titlePart}.md` : `${titlePart}.md`;

  const el = document.getElementById('filenamePreview');
  if (el) el.textContent = preview;
}

function updateSaveUI() {
  const saveBtn         = document.getElementById('saveBtn');
  const currentSettings = collectSettingsFromForm();
  const isDirty         = !settingsEqual(currentSettings, lastSavedSettings);

  saveBtn.disabled = isSaving || !isDirty;

  if (isSaving) { setSaveStatus('saving', currentT.statusSaving); return; }
  if (isDirty)  { setSaveStatus('dirty',  currentT.statusDirty);  return; }
  setSaveStatus('saved', currentT.statusSaved);
}

// ── Form read / write ─────────────────────────────────────────────────────────

function applySettingsToForm(settings) {
  for (const field of FORM_FIELDS) {
    const el = document.getElementById(field.id);
    if (!el) continue;
    if (field.type === 'checkbox') {
      el.checked = !!settings[field.id];
    } else {
      el.value = settings[field.id] ?? DEFAULT_SETTINGS[field.id];
    }
  }
  updateFrontmatterFieldsState(settings.frontmatterEnabled);
  updateTagsInputState(settings.frontmatterTags);
  updateFilenamePreview();
}

function collectSettingsFromForm() {
  const result = {};
  for (const field of FORM_FIELDS) {
    const el = document.getElementById(field.id);
    if (!el) {
      result[field.id] = DEFAULT_SETTINGS[field.id];
      continue;
    }
    if (field.type === 'checkbox') {
      result[field.id] = el.checked;
    } else if (field.type === 'number') {
      result[field.id] = parseInt(el.value, 10) || DEFAULT_SETTINGS[field.id];
    } else {
      result[field.id] = el.value;
    }
  }
  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  initSidebarTabs();

  // 言語を先に適用してからフォーム初期化
  await initLanguage();

  chrome.storage.sync.get({ ...DEFAULT_SETTINGS, isPro: false }, (settings) => {
    const normalized = normalizeSettings(settings);
    lastSavedSettings = normalized;
    applySettingsToForm(normalized);
    applyProGate(settings.isPro);
    updateSaveUI();
  });

  // 設定変更の検知
  const handler = (e) => {
    if (e.target.id === 'frontmatterEnabled') {
      updateFrontmatterFieldsState(e.target.checked);
    }
    if (e.target.id === 'frontmatterTags') {
      updateTagsInputState(e.target.checked);
    }
    if (['filenameDateFormat', 'filenameSeparator', 'filenameTitleMaxLength'].includes(e.target.id)) {
      updateFilenamePreview();
    }
    updateSaveUI();
  };

  document.querySelectorAll(
    '.setting-checkbox, .setting-select, .setting-input-number, .setting-input-text, .setting-textarea'
  ).forEach((input) => {
    input.addEventListener('change', handler);
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      input.addEventListener('input', handler);
    }
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm(currentT.confirmReset)) return;
    applySettingsToForm(DEFAULT_SETTINGS);
    updateSaveUI();
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const settings = collectSettingsFromForm();
    isSaving = true;
    updateSaveUI();

    chrome.storage.sync.set(settings, () => {
      isSaving = false;
      if (chrome.runtime.lastError) {
        document.getElementById('saveBtn').disabled = false;
        setSaveStatus('error', currentT.statusError);
        return;
      }
      lastSavedSettings = normalizeSettings(settings);
      updateSaveUI();
    });
  });

  const upgradeBtn = document.getElementById('upgradeBtn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      trackEvent('upgrade_clicked', { source: 'options' });
      chrome.tabs.create({ url: UPGRADE_URL });
    });
  }
});

// ── 言語切り替え ──────────────────────────────────────────────────────────────

document.getElementById('langBtn').addEventListener('click', async () => {
  const newLang = currentLang === 'ja' ? 'en' : 'ja';
  await new Promise((resolve) => chrome.storage.sync.set({ uiLanguage: newLang }, resolve));
  applyLanguage(newLang);
  updateFilenamePreview();
  updateSaveUI();
});
