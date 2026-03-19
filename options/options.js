/**
 * Site2Markdown - Options Script
 * 設定画面のUI制御と chrome.storage.sync への読み書き
 */

const DEFAULT_SETTINGS = {
  removeAds:          false,
  removeHeader:       false,
  removeFooter:       false,
  removeNav:          false,
  removeSidebar:      false,
  frontmatterEnabled: true,
  frontmatterTitle:   true,
  frontmatterUrl:     true,
  frontmatterDate:    true,
};

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

let lastSavedSettings = { ...DEFAULT_SETTINGS };
let isSaving = false;

function initSidebarTabs() {
  const tabs = Array.from(document.querySelectorAll('.side-link[data-target]'));
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

function updateFrontmatterFieldsState(enabled) {
  const fields = document.getElementById('frontmatterFields');
  const hint = document.getElementById('frontmatterHint');

  fields.hidden = !enabled;
  hint.hidden = enabled;
}

function normalizeSettings(settings) {
  return Object.assign({}, DEFAULT_SETTINGS, settings);
}

function settingsEqual(left, right) {
  return SETTING_KEYS.every((key) => left[key] === right[key]);
}

function setSaveStatus(state, message) {
  const el = document.getElementById('saveStatus');
  el.dataset.state = state;
  el.textContent = message;
}

function updateSaveUI() {
  const saveBtn = document.getElementById('saveBtn');
  const currentSettings = collectSettingsFromForm();
  const isDirty = !settingsEqual(currentSettings, lastSavedSettings);

  saveBtn.disabled = isSaving || !isDirty;

  if (isSaving) {
    setSaveStatus('saving', '保存中...');
    return;
  }

  if (isDirty) {
    setSaveStatus('dirty', '未保存の変更');
    return;
  }

  setSaveStatus('saved', '保存済み');
}

/**
 * 設定値をフォームに反映する
 */
function applySettingsToForm(settings) {
  document.getElementById('removeAds').checked = settings.removeAds;
  document.getElementById('removeHeader').checked = settings.removeHeader;
  document.getElementById('removeFooter').checked = settings.removeFooter;
  document.getElementById('removeNav').checked = settings.removeNav;
  document.getElementById('removeSidebar').checked = settings.removeSidebar;
  document.getElementById('frontmatterEnabled').checked = settings.frontmatterEnabled;
  document.getElementById('frontmatterTitle').checked = settings.frontmatterTitle;
  document.getElementById('frontmatterUrl').checked = settings.frontmatterUrl;
  document.getElementById('frontmatterDate').checked = settings.frontmatterDate;

  updateFrontmatterFieldsState(settings.frontmatterEnabled);
}

/**
 * フォームから設定値を収集する
 */
function collectSettingsFromForm() {
  return {
    removeAds: document.getElementById('removeAds').checked,
    removeHeader: document.getElementById('removeHeader').checked,
    removeFooter: document.getElementById('removeFooter').checked,
    removeNav: document.getElementById('removeNav').checked,
    removeSidebar: document.getElementById('removeSidebar').checked,
    frontmatterEnabled: document.getElementById('frontmatterEnabled').checked,
    frontmatterTitle: document.getElementById('frontmatterTitle').checked,
    frontmatterUrl: document.getElementById('frontmatterUrl').checked,
    frontmatterDate: document.getElementById('frontmatterDate').checked,
  };
}

/**
 * メイン処理
 */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarTabs();

  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    const normalized = normalizeSettings(settings);
    lastSavedSettings = normalized;
    applySettingsToForm(normalized);
    updateSaveUI();
  });

  document.querySelectorAll('.setting-checkbox').forEach((input) => {
    input.addEventListener('change', (event) => {
      if (event.target.id === 'frontmatterEnabled') {
        updateFrontmatterFieldsState(event.target.checked);
      }

      updateSaveUI();
    });
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const settings = collectSettingsFromForm();
    isSaving = true;
    updateSaveUI();

    chrome.storage.sync.set(settings, () => {
      isSaving = false;

      if (chrome.runtime.lastError) {
        document.getElementById('saveBtn').disabled = false;
        setSaveStatus('error', '保存に失敗しました');
        return;
      }

      lastSavedSettings = normalizeSettings(settings);
      updateSaveUI();
    });
  });
});
