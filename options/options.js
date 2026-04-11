/**
 * Site2Markdown - Options Script
 */

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

// ── 文字列定数 ─────────────────────────────────────────────────────────────────

const T = {
  statusSaved:      '保存済み',
  statusDirty:      '未保存の変更',
  statusSaving:     '保存中...',
  statusError:      '保存に失敗しました',
  confirmReset:     'すべての設定をデフォルトに戻しますか？',
  previewTitlePart: 'ページタイトル（最大{n}文字）',
};

// ── State ─────────────────────────────────────────────────────────────────────

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

let lastSavedSettings = { ...DEFAULT_SETTINGS };
let isSaving = false;

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
  { id: 'closeAfterCopy',        type: 'checkbox' },
  { id: 'preserveMath',          type: 'checkbox' },
];

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
  normalized.headingShift           = parseInt(normalized.headingShift) || 0;
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

  const titlePart = T.previewTitlePart.replace('{n}', maxLen);
  const preview   = datePart ? `${datePart}${sep}${titlePart}.md` : `${titlePart}.md`;

  const el = document.getElementById('filenamePreview');
  if (el) el.textContent = preview;
}

function updateSaveUI() {
  const saveBtn         = document.getElementById('saveBtn');
  const currentSettings = collectSettingsFromForm();
  const isDirty         = !settingsEqual(currentSettings, lastSavedSettings);

  saveBtn.disabled = isSaving || !isDirty;

  if (isSaving) { setSaveStatus('saving', T.statusSaving); return; }
  if (isDirty)  { setSaveStatus('dirty',  T.statusDirty);  return; }
  setSaveStatus('saved', T.statusSaved);
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

document.addEventListener('DOMContentLoaded', () => {
  initSidebarTabs();

  chrome.storage.sync.get({ ...DEFAULT_SETTINGS }, (settings) => {
    const normalized = normalizeSettings(settings);
    lastSavedSettings = normalized;
    applySettingsToForm(normalized);
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
    if (!confirm(T.confirmReset)) return;
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
        setSaveStatus('error', T.statusError);
        return;
      }
      lastSavedSettings = normalizeSettings(settings);
      updateSaveUI();
    });
  });
});
