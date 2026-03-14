/* ─── BluRead Sidebar ─────────────────────────────────────────────────────── */
(function () {
  if (document.getElementById('sv-root')) return;

  const CATEGORY_COLORS = {
    'Violence':       '#ef4444',
    'Self-Harm':      '#8b5cf6',
    'Sexual Content': '#f97316',
    'Hate Speech':    '#6b7280',
    'Harassment':     '#ec4899',
    'Custom':         '#6366f1',
  };

  const DEFAULTS = {
    enabled: true, blurTitles: true, sensitivity: 6, blurLevel: 6,
    customWords: [],
    categories: { violence: true, selfHarm: true, sexual: true, hate: true, harassment: true },
  };

  /* ── Build DOM ── */
  const root = document.createElement('div');
  root.id = 'sv-root';

  root.innerHTML = `
    <!-- Tab toggle (left of panel) -->
    <button id="sv-tab" title="Toggle BluRead">
      <span id="sv-tab-arrow">◀</span>
    </button>

    <!-- Slide-in panel -->
    <div id="sv-panel">
      <div id="sv-inner">

        <div class="sv-header">
          <div class="sv-logo-img">
            <img src="${chrome.runtime.getURL('Bluread-Thumbnail-FV.png')}" alt="" onerror="this.style.display='none'"/>
          </div>
          <div>
            <div class="sv-title">BluRead</div>
            <div class="sv-subtitle">Content Protection</div>
          </div>
        </div>

        <div class="sv-status sv-status--on" id="sv-status">
          <div class="sv-dot sv-dot--on" id="sv-dot"></div>
          <span id="sv-status-text">Protection Active</span>
        </div>

        <div class="sv-stats">
          <div class="sv-stat">
            <div class="sv-stat-val" id="sv-stat-blurred">—</div>
            <div class="sv-stat-lbl">Blurred</div>
          </div>
          <div class="sv-stat">
            <div class="sv-stat-val" id="sv-stat-detections">—</div>
            <div class="sv-stat-lbl">Detections</div>
          </div>
          <div class="sv-stat">
            <div class="sv-stat-val" id="sv-stat-filters">5</div>
            <div class="sv-stat-lbl">Active Filters</div>
          </div>
          <div class="sv-stat">
            <div class="sv-stat-val" id="sv-stat-words">0</div>
            <div class="sv-stat-lbl">Filter Words</div>
          </div>
        </div>

        <button class="sv-btn-scan" id="sv-btn-scan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span id="sv-scan-label">Scan This Page</span>
        </button>

        <div class="sv-section-title">Protection</div>
        <div class="sv-card">
          <div class="sv-toggle-row">
            <div>
              <div class="sv-toggle-lbl">Enable Protection</div>
              <div class="sv-toggle-desc">Scan and blur content</div>
            </div>
            <button class="sv-toggle on" id="sv-toggle-enabled" role="switch" aria-checked="true"></button>
          </div>
          <div class="sv-toggle-row">
            <div>
              <div class="sv-toggle-lbl">Blur Titles</div>
              <div class="sv-toggle-desc">Include headings</div>
            </div>
            <button class="sv-toggle on" id="sv-toggle-titles" role="switch" aria-checked="true"></button>
          </div>
        </div>

        <div class="sv-section-title">Content Filters</div>
        <div class="sv-card" id="sv-filter-list">
          <div class="sv-toggle-row" data-category="violence">
            <div><div class="sv-toggle-lbl">Violence &amp; Gore</div></div>
            <button class="sv-toggle on" role="switch" aria-checked="true"></button>
          </div>
          <div class="sv-toggle-row" data-category="selfHarm">
            <div><div class="sv-toggle-lbl">Self-Harm</div></div>
            <button class="sv-toggle on" role="switch" aria-checked="true"></button>
          </div>
          <div class="sv-toggle-row" data-category="sexual">
            <div><div class="sv-toggle-lbl">Sexual Content</div></div>
            <button class="sv-toggle on" role="switch" aria-checked="true"></button>
          </div>
          <div class="sv-toggle-row" data-category="hate">
            <div><div class="sv-toggle-lbl">Hate Speech</div></div>
            <button class="sv-toggle on" role="switch" aria-checked="true"></button>
          </div>
          <div class="sv-toggle-row" data-category="harassment">
            <div><div class="sv-toggle-lbl">Harassment</div></div>
            <button class="sv-toggle on" role="switch" aria-checked="true"></button>
          </div>
        </div>

        <div class="sv-section-title">Blur Level</div>
        <div class="sv-card">
          <div class="sv-slider-labels">
            <span>Low</span>
            <span id="sv-blur-disp">60%</span>
            <span>High</span>
          </div>
          <div class="sv-slider-wrap">
            <div class="sv-slider-fill" id="sv-slider-fill" style="width:60%;"></div>
            <input type="range" class="sv-slider" id="sv-blur-level" min="1" max="10" value="6" />
          </div>
        </div>

        <div class="sv-section-title">Custom Filter Words</div>
        <div class="sv-card">
          <button class="sv-btn-suggest" id="sv-btn-suggest">✨ Suggest keywords from this page</button>
          <div class="sv-suggest-chips" id="sv-suggest-chips" style="display:none;"></div>
          <div class="sv-word-row">
            <input type="text" class="sv-word-input" id="sv-word-input" placeholder="e.g. earthquake, flood…" maxlength="60" />
            <button class="sv-btn-add" id="sv-add-word" aria-label="Add word">Add</button>
          </div>
          <div class="sv-word-tags" id="sv-word-tags">
            <span class="sv-tags-empty">No custom filter words yet.</span>
          </div>
        </div>

        <div class="sv-section-title">Detected on This Page</div>
        <div class="sv-card">
          <div class="sv-detections" id="sv-detections">
            <span class="sv-det-empty">No issues detected yet.</span>
          </div>
        </div>

        <p class="sv-privacy">Page text may be sent to OpenAI for analysis. No data is stored.</p>
        <p class="sv-feedback">
          Was this filtered content accurate?
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfFjDs3HPvl0xKmq39YPdqpKeSz49Xom9GlJbNbLJoVssqB7Q/viewform?usp=publish-editor"
            target="_blank"
            rel="noopener noreferrer"
          >Share feedback</a>
        </p>
      </div>
    </div>
  `;

  /* ── FAB eye button ── */
  const fab = document.createElement('button');
  fab.id = 'sv-scan-fab';
  fab.title = 'Scan this page';
  fab.innerHTML = `
    <svg id="sv-fab-eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
    <svg id="sv-fab-eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
      <path d="m2 2 20 20"/>
    </svg>
  `;

  document.documentElement.appendChild(root);
  document.documentElement.appendChild(fab);

  /* ── DOM refs ── */
  const tab            = document.getElementById('sv-tab');
  const panelEl        = document.getElementById('sv-panel');
  const statusEl       = document.getElementById('sv-status');
  const dotEl          = document.getElementById('sv-dot');
  const statusText     = document.getElementById('sv-status-text');
  const statBlurred    = document.getElementById('sv-stat-blurred');
  const statDetections = document.getElementById('sv-stat-detections');
  const statFilters    = document.getElementById('sv-stat-filters');
  const statWords      = document.getElementById('sv-stat-words');
  const btnScan        = document.getElementById('sv-btn-scan');
  const scanLabel      = document.getElementById('sv-scan-label');
  const toggleEnabled  = document.getElementById('sv-toggle-enabled');
  const toggleTitles   = document.getElementById('sv-toggle-titles');
  const filterRows     = document.querySelectorAll('#sv-filter-list .sv-toggle-row');
  const blurInput      = document.getElementById('sv-blur-level');
  const blurDisp       = document.getElementById('sv-blur-disp');
  const sliderFill     = document.getElementById('sv-slider-fill');
  const wordInput      = document.getElementById('sv-word-input');
  const addWordBtn     = document.getElementById('sv-add-word');
  const wordTagsEl     = document.getElementById('sv-word-tags');
  const detectionsEl   = document.getElementById('sv-detections');
  const suggestBtn     = document.getElementById('sv-btn-suggest');
  const suggestChips   = document.getElementById('sv-suggest-chips');

  /* ── Open/close panel ── */
  let isOpen = false;
  function setOpen(open) {
    isOpen = open;
    root.classList.toggle('sv-open', open);
    const panelWidth = open ? Math.round(panelEl?.getBoundingClientRect().width || 0) : 0;
    // Reserve space on the right so warning labels do not render underneath the open sidebar.
    document.documentElement.style.setProperty('--tg-sidebar-offset', `${Math.max(0, panelWidth + (open ? 16 : 0))}px`);
  }
  setOpen(false);
  tab.addEventListener('click', () => setOpen(!isOpen));

  /* ── Helpers ── */
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function sendToContent(msg) {
    return new Promise(resolve => {
      const id = 'sv_' + Math.random().toString(36).slice(2);
      window.addEventListener('sv_response_' + id, e => resolve(e.detail), { once: true });
      window.dispatchEvent(new CustomEvent('sv_request', { detail: { ...msg, _id: id } }));
      setTimeout(() => resolve(null), 3000);
    });
  }

  /* ── Status ── */
  function updateStatus() {
    const on = toggleEnabled.classList.contains('on');
    statusEl.className = `sv-status ${on ? 'sv-status--on' : 'sv-status--off'}`;
    dotEl.className    = `sv-dot ${on ? 'sv-dot--on' : 'sv-dot--off'}`;
    statusText.textContent = on ? 'Protection Active' : 'Protection Off';
    // Eye FAB reflects protection state
    fab.classList.toggle('eye-closed', !on);
  }

  function updateFilterCount() {
    let count = 0;
    filterRows.forEach(row => { if (row.querySelector('.sv-toggle').classList.contains('on')) count++; });
    statFilters.textContent = count;
  }

  /* ── Settings ── */
  function readSettings() {
    const categories = {};
    filterRows.forEach(row => {
      categories[row.dataset.category] = row.querySelector('.sv-toggle').classList.contains('on');
    });
    return {
      enabled:    toggleEnabled.classList.contains('on'),
      blurTitles: toggleTitles.classList.contains('on'),
      blurLevel:  Number(blurInput.value),
      categories,
    };
  }

  function saveSettings() {
    const s = readSettings();
    chrome.storage.sync.set(s);
    updateStatus();
    updateFilterCount();
  }

  function setupToggle(btn, onChange) {
    btn.addEventListener('click', () => {
      btn.classList.toggle('on');
      btn.setAttribute('aria-checked', String(btn.classList.contains('on')));
      if (onChange) onChange();
    });
  }

  setupToggle(toggleEnabled, saveSettings);
  setupToggle(toggleTitles, saveSettings);
  filterRows.forEach(row => setupToggle(row.querySelector('.sv-toggle'), saveSettings));

  blurInput.addEventListener('input', () => {
    const pct = ((blurInput.value - 1) / 9) * 100;
    blurDisp.textContent = `${Math.round(pct)}%`;
    sliderFill.style.width = `${pct}%`;
    chrome.storage.sync.set({ blurLevel: Number(blurInput.value) });
    const px = Math.max(1, Math.min(20, Math.round(Number(blurInput.value) * 2)));
    document.documentElement.style.setProperty('--tg-blur', `${px}px`);
  });

  function applyToUI(settings) {
    toggleEnabled.classList.toggle('on', !!settings.enabled);
    toggleEnabled.setAttribute('aria-checked', String(!!settings.enabled));
    toggleTitles.classList.toggle('on', !!settings.blurTitles);
    toggleTitles.setAttribute('aria-checked', String(!!settings.blurTitles));

    filterRows.forEach(row => {
      const key = row.dataset.category;
      const on  = settings.categories?.[key] !== false; // default true
      row.querySelector('.sv-toggle').classList.toggle('on', on);
      row.querySelector('.sv-toggle').setAttribute('aria-checked', String(on));
    });

    const lvl = settings.blurLevel ?? settings.sensitivity ?? 6;
    blurInput.value = lvl;
    const pct = ((lvl - 1) / 9) * 100;
    blurDisp.textContent = `${Math.round(pct)}%`;
    sliderFill.style.width = `${pct}%`;

    renderWordTags(settings.customWords || []);
    statWords.textContent = (settings.customWords || []).length;
    updateStatus();
    updateFilterCount();
  }

  /* ── Custom words ── */
  function renderWordTags(words) {
    if (!words.length) {
      wordTagsEl.innerHTML = '<span class="sv-tags-empty">No custom filter words yet.</span>';
      return;
    }
    wordTagsEl.innerHTML = words.map((w, i) => `
      <span class="sv-word-tag">
        ${escHtml(w)}
        <button class="sv-word-tag-x" data-index="${i}" aria-label="Remove">×</button>
      </span>`).join('');
    wordTagsEl.querySelectorAll('.sv-word-tag-x').forEach(btn => {
      btn.addEventListener('click', () => removeWord(Number(btn.dataset.index)));
    });
  }

  function loadCustomWords() {
    return new Promise(resolve => {
      chrome.storage.sync.get({ customWords: [] }, s => {
        resolve(Array.isArray(s.customWords) ? s.customWords : []);
      });
    });
  }

  function saveCustomWords(words) {
    return new Promise(resolve => {
      chrome.storage.sync.set({ customWords: words }, () => {
        statWords.textContent = words.length;
        resolve();
      });
    });
  }

  async function addWordStr(raw) {
    if (!raw) return false;
    const words = await loadCustomWords();
    if (words.map(w => w.toLowerCase()).includes(raw.toLowerCase())) return false;
    const updated = [...words, raw];
    await saveCustomWords(updated);
    renderWordTags(updated);
    await doScan();
    return true;
  }

  async function addWord() {
    const raw = wordInput.value.trim();
    if (!raw) return;
    await addWordStr(raw);
    wordInput.value = '';
    wordInput.focus();
  }

  async function removeWord(index) {
    const words = await loadCustomWords();
    const updated = words.filter((_, i) => i !== index);
    await saveCustomWords(updated);
    renderWordTags(updated);
    await doScan();
  }

  addWordBtn.addEventListener('click', () => { addWord(); });
  wordInput.addEventListener('keydown', e => { if (e.key === 'Enter') addWord(); });

  /* ── AI keyword suggestions ── */
  suggestBtn.addEventListener('click', async () => {
    suggestBtn.textContent = '⏳ Analysing page…';
    suggestBtn.disabled = true;
    suggestChips.style.display = 'none';
    suggestChips.innerHTML = '';

    try {
      // Ask content.js to extract candidate terms from the page text
      const resp = await sendToContent({ type: 'EXTRACT_ASSOCIATED_TERMS', max: 10 });
      const terms = resp?.terms ?? [];

      if (!terms.length) {
        suggestBtn.textContent = '✨ No new suggestions found';
        suggestBtn.disabled = false;
        return;
      }

      // Show chips
      suggestChips.style.display = 'flex';
      loadCustomWords().then(existing => {
        const existingLower = existing.map(w => w.toLowerCase());
        suggestChips.innerHTML = terms.map(t => {
          const already = existingLower.includes(t.toLowerCase());
          return `<button class="sv-suggest-chip ${already ? 'added' : ''}" data-word="${escHtml(t)}">${escHtml(t)}${already ? ' ✓' : ' +'}</button>`;
        }).join('');

        suggestChips.querySelectorAll('.sv-suggest-chip:not(.added)').forEach(chip => {
          chip.addEventListener('click', async () => {
            await addWordStr(chip.dataset.word);
            chip.classList.add('added');
            chip.textContent = chip.dataset.word + ' ✓';
          });
        });
      });
    } catch (e) {
      suggestBtn.textContent = '✨ Suggestion failed — try again';
    }

    suggestBtn.textContent = '✨ Suggest keywords from this page';
    suggestBtn.disabled = false;
  });

  /* ── Detections ── */
  function renderDetections(detections) {
    if (!detections.length) {
      detectionsEl.innerHTML = '<span class="sv-det-empty">No issues detected yet.</span>';
      return;
    }
    detectionsEl.innerHTML = detections.map(d => {
      const color = CATEGORY_COLORS[d.category] ?? '#78716c';
      const breakdown = Array.isArray(d.wordBreakdown) ? d.wordBreakdown : [];
      const words = breakdown.length
        ? breakdown.slice(0, 3).map(item => `${escHtml(item.word)} ${Math.max(1, Number(item.percent) || 0)}%`).join(' • ')
        : (d.words?.length ? Array.from(new Set(d.words)).slice(0, 3).map(w => escHtml(w)).join(', ') : '—');
      return `<div class="sv-detection-row">
        <span class="sv-det-badge" style="background:${color};">${escHtml(d.category)}</span>
        <span class="sv-det-words">${words}</span>
        <span class="sv-det-score">${d.score}%</span>
      </div>`;
    }).join('');
  }

  /* ── Stats refresh ── */
  async function refreshStats() {
    const countResp  = await sendToContent({ type: 'GET_COUNT' });
    const detectResp = await sendToContent({ type: 'GET_DETECTIONS' });
    statBlurred.textContent    = countResp?.count ?? '0';
    const dets = detectResp?.detections ?? [];
    statDetections.textContent = dets.length;
    renderDetections(dets);
  }

  /* ── Scan ── */
  async function doScan() {
    scanLabel.textContent = 'Scanning…';
    btnScan.style.opacity = '0.6';
    btnScan.style.pointerEvents = 'none';
    fab.classList.add('sv-scanning');

    await sendToContent({ type: 'FORCE_SCAN' });
    await refreshStats();

    scanLabel.textContent = 'Scan This Page';
    btnScan.style.opacity = '';
    btnScan.style.pointerEvents = '';
    fab.classList.remove('sv-scanning');
  }

  btnScan.addEventListener('click', doScan);
  fab.addEventListener('click', doScan);

  /* ── Init ── */
  chrome.storage.sync.get(null, stored => {
    // Ensure every category defaults to true — never let missing keys become false
    const savedCats = (typeof stored.categories === 'object' && stored.categories) ? stored.categories : {};
    const categories = {};
    for (const key of Object.keys(DEFAULTS.categories)) {
      categories[key] = savedCats[key] !== false;
    }
    const settings = {
      ...DEFAULTS,
      ...stored,
      enabled:     stored.enabled    !== false,
      blurTitles:  stored.blurTitles !== false,
      categories,
      customWords: Array.isArray(stored.customWords) ? stored.customWords : [],
    };
    // Write back so content.js always reads correct defaults
    chrome.storage.sync.set({ enabled: settings.enabled, blurTitles: settings.blurTitles, categories, blurLevel: settings.blurLevel });
    // Apply blur CSS immediately
    const px = Math.max(1, Math.min(20, Math.round(settings.blurLevel * 2)));
    document.documentElement.style.setProperty('--tg-blur', `${px}px`);
    applyToUI(settings);
  });

  setTimeout(refreshStats, 900);

})();

