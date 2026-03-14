const DEFAULT_SENTIMENT_PREFS = Object.freeze({
  mode: 'balanced',
  blurNegative: true,
  negativeThreshold: 22,
  customTriggerTopics: [],
});

const BLUREAD_TRIGGER_RULES_KEY = 'bluReadTriggerRules';
const BLUREAD_SELECTED_TOPICS_KEY = 'bluReadSelectedTopicsByUrl';
const BLUREAD_GEMINI_TOPIC_STATUS_KEY = 'bluReadGeminiTopicStatus';
const SECTIONS = Object.freeze(['wellness', 'politics', 'health', 'sports', 'entertainment']);

function cleanDisplayText(value, fallback) {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return fallback;
  }
  return raw.replace(/\s+/g, ' ').trim();
}

function normalizeTopic(value) {
  return cleanDisplayText(value, '').toLowerCase();
}

function normalizeSentimentPrefs(value) {
  const merged = { ...DEFAULT_SENTIMENT_PREFS, ...(value || {}) };
  const topics = Array.isArray(merged.customTriggerTopics)
    ? merged.customTriggerTopics.map((item) => normalizeTopic(item)).filter(Boolean)
    : [];
  return {
    mode: ['balanced', 'strict', 'lenient'].includes(merged.mode) ? merged.mode : 'balanced',
    blurNegative: Boolean(merged.blurNegative),
    negativeThreshold: Math.min(80, Math.max(5, Number(merged.negativeThreshold) || 22)),
    customTriggerTopics: [...new Set(topics)],
  };
}

function normalizeRules(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const out = [];
  const seen = new Set();
  for (const item of value) {
    const word = normalizeTopic(item?.word);
    const categories = Array.isArray(item?.categories)
      ? [...new Set(item.categories.map((entry) => normalizeTopic(entry)).filter((entry) => SECTIONS.includes(entry)))]
      : [];
    if (!word || !categories.length) {
      continue;
    }
    const key = `${word}|${categories.join(',')}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push({ word, categories });
  }
  return out;
}

function normalizeTopicsByUrl(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const out = {};
  for (const [url, topics] of Object.entries(value)) {
    if (!url || !Array.isArray(topics)) {
      continue;
    }
    out[url] = [...new Set(topics.map((item) => normalizeTopic(item)).filter(Boolean))];
  }
  return out;
}

function collectElements() {
  return {
    protectionToggle: document.getElementById('protectionToggle'),
    protectionStateText: document.getElementById('protectionStateText'),
    triggerWordInput: document.getElementById('triggerWordInput'),
    addTriggerWordBtn: document.getElementById('addTriggerWordBtn'),
    triggerRuleList: document.getElementById('triggerRuleList'),
    topicCheckboxList: document.getElementById('topicCheckboxList'),
    sourceKindText: document.getElementById('sourceKindText'),
    triggerSignalText: document.getElementById('triggerSignalText'),
    triggerTermsList: document.getElementById('triggerTermsList'),
    triggerTermSectionList: document.getElementById('triggerTermSectionList'),
    summaryTopic: document.getElementById('summaryTopic'),
    summarySourceText: document.getElementById('summarySourceText'),
    summaryText: document.getElementById('summaryText'),
    updatedAt: document.getElementById('updatedAt'),
    assignChecks: Array.from(document.querySelectorAll('[data-assign-category]')),
  };
}

function renderChips(containerEl, values, className = 'term-chip') {
  containerEl.innerHTML = '';
  for (const value of values) {
    const chip = document.createElement('span');
    chip.className = className;
    chip.textContent = value;
    containerEl.appendChild(chip);
  }
}

function initPanel() {
  const refs = collectElements();
  const required = [
    'protectionToggle',
    'protectionStateText',
    'triggerWordInput',
    'addTriggerWordBtn',
    'triggerRuleList',
    'topicCheckboxList',
    'sourceKindText',
    'triggerSignalText',
    'triggerTermsList',
    'triggerTermSectionList',
    'summaryTopic',
    'summarySourceText',
    'summaryText',
    'updatedAt',
  ];
  const missing = required.filter((key) => !refs[key]);
  if (missing.length) {
    console.warn('bluRead init skipped due to missing elements:', missing);
    return;
  }

  const {
    protectionToggle: protectionToggleEl,
    protectionStateText: protectionStateTextEl,
    triggerWordInput: triggerWordInputEl,
    addTriggerWordBtn: addTriggerWordBtnEl,
    triggerRuleList: triggerRuleListEl,
    topicCheckboxList: topicCheckboxListEl,
    sourceKindText: sourceKindTextEl,
    triggerSignalText: triggerSignalTextEl,
    triggerTermsList: triggerTermsListEl,
    triggerTermSectionList: triggerTermSectionListEl,
    summaryTopic: summaryTopicEl,
    summarySourceText: summarySourceTextEl,
    summaryText: summaryTextEl,
    updatedAt: updatedAtEl,
    assignChecks,
  } = refs;

  let triggerRules = [];
  let selectedTopicsByUrl = {};
  let geminiTopicStatus = null;

  function getSelectedAssignmentCategories() {
    return assignChecks
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => normalizeTopic(checkbox.dataset.assignCategory))
      .filter((entry) => SECTIONS.includes(entry));
  }

  function setProtectionUI(enabled) {
    const isEnabled = Boolean(enabled);
    protectionToggleEl.checked = isEnabled;
    protectionStateTextEl.textContent = isEnabled ? 'Protection is ON' : 'Protection is OFF';
  }

  function renderRules() {
    triggerRuleListEl.innerHTML = '';
    if (!triggerRules.length) {
      const empty = document.createElement('p');
      empty.className = 'summary-text';
      empty.textContent = 'No trigger word/category rules yet.';
      triggerRuleListEl.appendChild(empty);
      return;
    }
    for (const rule of triggerRules) {
      const chip = document.createElement('span');
      chip.className = 'term-chip editable-chip';
      chip.textContent = `${rule.word} - ${rule.categories.join(', ')}`;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'chip-remove-btn';
      removeBtn.textContent = 'x';
      removeBtn.setAttribute('aria-label', `Remove ${rule.word}`);
      removeBtn.addEventListener('click', async () => {
        triggerRules = triggerRules.filter((entry) => entry !== rule);
        renderRules();
        await persistRules();
        await refreshTopicSuggestions();
      });

      chip.appendChild(removeBtn);
      triggerRuleListEl.appendChild(chip);
    }
  }

  function getSelectedTopicsForUrl(url) {
    const topics = selectedTopicsByUrl[url];
    return Array.isArray(topics) ? topics : [];
  }

  async function persistSelectedTopics(url, topics) {
    if (!url) {
      return;
    }
    selectedTopicsByUrl = {
      ...selectedTopicsByUrl,
      [url]: [...new Set(topics.map((item) => normalizeTopic(item)).filter(Boolean))],
    };
    await chrome.storage.local.set({ [BLUREAD_SELECTED_TOPICS_KEY]: selectedTopicsByUrl });
  }

  function renderTopicCheckboxes(lastPageSummary) {
    topicCheckboxListEl.innerHTML = '';
    const pageUrl = String(lastPageSummary?.url || '');
    const suggestedTopics = Array.isArray(lastPageSummary?.suggestedTopics)
      ? [...new Set(lastPageSummary.suggestedTopics.map((item) => normalizeTopic(item)).filter(Boolean))]
      : [];

    if (!suggestedTopics.length) {
      if (triggerRules.length) {
        const hint = document.createElement('p');
        hint.className = 'summary-text';
        const reason = String(geminiTopicStatus?.reason || '').trim();
        hint.textContent = reason
          ? `No AI topics returned. Reason: ${reason}`
          : 'No AI topics returned. Check proxy server, API key, model access, and reload the page.';
        topicCheckboxListEl.appendChild(hint);
      }
      return;
    }

    const selected = new Set(getSelectedTopicsForUrl(pageUrl));
    for (const topic of suggestedTopics) {
      const label = document.createElement('label');
      label.className = 'check-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = selected.has(topic);
      checkbox.addEventListener('change', async () => {
        const next = new Set(getSelectedTopicsForUrl(pageUrl));
        if (checkbox.checked) {
          next.add(topic);
        } else {
          next.delete(topic);
        }
        await persistSelectedTopics(pageUrl, [...next]);
      });
      const text = document.createElement('span');
      text.textContent = topic;
      label.appendChild(checkbox);
      label.appendChild(text);
      topicCheckboxListEl.appendChild(label);
    }
  }

  function renderTriggerSignals(lastPageTextUpdate) {
    const sourceKind = cleanDisplayText(lastPageTextUpdate?.sourceKind, 'generic-web');
    const count = Number(lastPageTextUpdate?.triggerSignalCount || 0);
    const terms = Array.isArray(lastPageTextUpdate?.triggerTerms)
      ? lastPageTextUpdate.triggerTerms.map((item) => cleanDisplayText(item, '')).filter(Boolean).slice(0, 10)
      : [];
    const matchedPairs = Array.isArray(lastPageTextUpdate?.triggerTermCategoryMatches)
      ? lastPageTextUpdate.triggerTermCategoryMatches
          .map((item) => cleanDisplayText(item, '').replace(':', ' - '))
          .filter(Boolean)
      : [];

    sourceKindTextEl.textContent = `Source: ${sourceKind}`;
    triggerSignalTextEl.textContent = `${count} trigger matches`;
    renderChips(triggerTermsListEl, terms);
    renderChips(triggerTermSectionListEl, matchedPairs);
  }

  function renderSummary(lastPageSummary) {
    if (!lastPageSummary) {
      summaryTopicEl.textContent = 'Topic: N/A';
      summarySourceTextEl.textContent = 'Summary source: local';
      summaryTextEl.textContent = 'No summary available yet.';
      return;
    }
    const topic = cleanDisplayText(lastPageSummary.topic, 'General webpage content');
    const source = cleanDisplayText(lastPageSummary.summarySource, 'local');
    const summary = cleanDisplayText(lastPageSummary.summary, 'No summary available yet.');
    summaryTopicEl.textContent = `Topic: ${topic}`;
    summarySourceTextEl.textContent = `Summary source: ${source}`;
    summaryTextEl.textContent = summary;
  }

  async function persistRules() {
    const current = await chrome.storage.local.get(['sentimentPreferences']);
    const sentimentPreferences = normalizeSentimentPrefs(current.sentimentPreferences);
    const words = [...new Set(triggerRules.map((rule) => rule.word))];
    await chrome.storage.local.set({
      [BLUREAD_TRIGGER_RULES_KEY]: triggerRules,
      sentimentPreferences: {
        ...sentimentPreferences,
        customTriggerTopics: words,
      },
    });
  }

  async function refreshTopicSuggestions() {
    try {
      await chrome.runtime.sendMessage({ type: 'REFRESH_TOPIC_SUGGESTIONS' });
    } catch (error) {
      console.error('[bluRead][Popup] Failed to request topic refresh:', error);
    }
  }

  function addRuleFromInput() {
    const word = normalizeTopic(triggerWordInputEl.value);
    const categories = [...new Set(getSelectedAssignmentCategories())];
    if (!word || !categories.length) {
      return;
    }
    const existing = triggerRules.find((rule) => rule.word === word);
    if (existing) {
      existing.categories = [...new Set([...existing.categories, ...categories])];
    } else {
      triggerRules.push({ word, categories });
    }
    renderRules();
    persistRules()
      .then(() => refreshTopicSuggestions())
      .catch((error) => {
        console.error('[bluRead][Popup] Failed to persist trigger rules:', error);
        console.warn('Failed to persist trigger rules:', error);
      });
    triggerWordInputEl.value = '';
  }

  async function renderPanel() {
    const {
      protectionEnabled = true,
      lastPageSummary = null,
      lastPageTextUpdate = null,
      [BLUREAD_TRIGGER_RULES_KEY]: storedRules = [],
      [BLUREAD_SELECTED_TOPICS_KEY]: storedSelectedTopics = {},
      [BLUREAD_GEMINI_TOPIC_STATUS_KEY]: storedGeminiStatus = null,
    } = await chrome.storage.local.get([
      'protectionEnabled',
      'lastPageSummary',
      'lastPageTextUpdate',
      BLUREAD_TRIGGER_RULES_KEY,
      BLUREAD_SELECTED_TOPICS_KEY,
      BLUREAD_GEMINI_TOPIC_STATUS_KEY,
    ]);

    triggerRules = normalizeRules(storedRules);
    selectedTopicsByUrl = normalizeTopicsByUrl(storedSelectedTopics);
    geminiTopicStatus = storedGeminiStatus;
    setProtectionUI(protectionEnabled);
    renderRules();
    renderTopicCheckboxes(lastPageSummary);
    renderTriggerSignals(lastPageTextUpdate);
    renderSummary(lastPageSummary);

    if (lastPageSummary?.capturedAt) {
      updatedAtEl.textContent = `Updated ${new Date(lastPageSummary.capturedAt).toLocaleTimeString()}`;
    } else {
      updatedAtEl.textContent = 'No data yet.';
    }
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }
    if (
      changes.lastPageSummary ||
      changes.lastPageTextUpdate ||
      changes.protectionEnabled ||
      changes[BLUREAD_TRIGGER_RULES_KEY] ||
      changes[BLUREAD_SELECTED_TOPICS_KEY] ||
      changes[BLUREAD_GEMINI_TOPIC_STATUS_KEY]
    ) {
      renderPanel().catch((error) => {
        console.error('[bluRead][Popup] Failed to refresh panel:', error);
        console.warn('Failed to refresh panel:', error);
      });
    }
  });

  protectionToggleEl.addEventListener('change', () => {
    chrome.storage.local.set({ protectionEnabled: protectionToggleEl.checked });
  });
  addTriggerWordBtnEl.addEventListener('click', addRuleFromInput);
  triggerWordInputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addRuleFromInput();
    }
  });

  renderPanel().catch((error) => {
    console.error('[bluRead][Popup] Failed to initialize panel:', error);
    console.warn('Failed to initialize panel:', error);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPanel, { once: true });
} else {
  initPanel();
}


