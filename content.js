/* â”€â”€â”€ Category badge colours â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const CATEGORY_COLORS = {
  'Violence':       '#ef4444',
  'Self-Harm':      '#8b5cf6',
  'Sexual Content': '#f97316',
  'Hate Speech':    '#374151',
  'Harassment':     '#374151',
  'Custom':         '#6366f1',
};

/* â”€â”€â”€ Site-specific selectors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const SITE_SELECTORS = {
  reddit:  'div[data-testid="post-container"], .Comment, [data-testid="comment"]',
  twitter: [
    'article [data-testid="tweetText"]',
    'article [lang]',
    'article [data-testid="card.wrapper"] span',
    'article [data-testid*="title" i]',
    'article h1, article h2, article h3',
  ].join(', '),

  // CNN: covers both current React format and legacy article format
  cnn: [
    'main a',
    'section a',
    '[data-link-type*="article" i]',
    'article h1, article h2, article h3',
    'article p, article li',
    'div[data-component-name="paragraph"]',
    'div[data-component-name="headline"]',
    'div[data-component-name="subheadline"]',
    'div.article__content p',
    'div[class*="article-body"] p',
    'div[class*="ArticleBody"] p',
    '.article-content__para',
    '.zn-body__paragraph',
    '[class*="container__headline" i]',
    '[class*="container__summary" i]',
    '[class*="headline__text" i]',
    '[class*="card" i] h1, [class*="card" i] h2, [class*="card" i] h3, [class*="card" i] p',
    '[data-testid*="title" i], [data-testid*="headline" i], [data-testid*="summary" i]',
    'h1[class*="headline"]',
    'h2[class*="headline"]',
  ].join(', '),

  // Fox News + general fallback
  foxnews: [
    '.article-content p',
    '.article-body p',
    '[class*="article"] p',
    '[class*="story-body"] p',
    '.speakable p',
    'h1.headline', 'h2.headline',
    'article p',
    'main p',
  ].join(', '),

  default: [
    'h1, h2, h3, h4, h5, h6',
    'p, article p, .article-body p, main p, [role="main"] p',
    '.post-title, .entry-title, [itemprop="headline"]',
    '[class*="title" i], [class*="headline" i], [class*="heading" i]',
    '[class*="summary" i], [class*="excerpt" i], [class*="dek" i], [class*="description" i]',
    '[class*="subhead" i], [class*="subtitle" i]',
    '[id*="title" i], [id*="headline" i]',
    '[data-testid*="title" i], [data-testid*="headline" i]',
    '[data-testid*="summary" i], [data-testid*="description" i]',
    '.paragraph, .vossi-paragraph, .inline-placeholder, [data-editable="text"]',
  ].join(', '),
};

const BLOCKED_ANCESTORS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD']);
const INTERACTIVE_TAGS = new Set(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL', 'SVG']);
const REVEALED_ATTR = 'data-tg-user-revealed';
const EXTENSION_UI_SELECTOR = '#sv-root, #sv-scan-fab, .tg-modal, .tg-label';
const CONTENT_CONTAINER_SELECTOR = [
  'article',
  '[role="article"]',
  '[data-testid="tweet"]',
  '[data-testid="cellInnerDiv"]',
  '[data-testid="card.wrapper"]',
  '[class*="article" i]',
  '[class*="story" i]',
  '[class*="card" i]',
  '[class*="post" i]',
].join(', ');
const SUMMARY_SOURCE_SELECTOR = [
  'h1, h2, h3, h4',
  'p, li',
  '[itemprop="headline"]',
  '[data-testid="tweetText"]',
  '[data-testid*="title" i], [data-testid*="summary" i], [data-testid*="description" i]',
  '[class*="title" i], [class*="headline" i], [class*="summary" i], [class*="excerpt" i], [class*="description" i]',
  '[lang]',
].join(', ');
const TITLE_LIKE_SELECTOR = [
  'h1, h2, h3, h4, h5, h6',
  '.post-title, .entry-title, [itemprop="headline"]',
  '[class*="title" i], [class*="headline" i], [class*="heading" i]',
  '[id*="title" i], [id*="headline" i]',
  '[data-testid*="title" i], [data-testid*="headline" i]',
].join(', ');

const RATE_LIMIT = 80; // base cap; X/Twitter gets a higher host-specific cap below
const IMAGE_RATE_LIMIT = 60;
const VIDEO_RATE_LIMIT = 45;
const VIDEO_IFRAME_SELECTOR = [
  'iframe[src*="youtube.com" i]',
  'iframe[src*="youtu.be" i]',
  'iframe[src*="vimeo.com" i]',
  'iframe[src*="tiktok.com" i]',
  'iframe[src*="twitter.com" i]',
  'iframe[src*="x.com" i]',
].join(', ');

/* â”€â”€â”€ 1. getTextBlocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/** Returns true if any ancestor of el is in BLOCKED_ANCESTORS. */
function isInsideBlockedTag(el) {
  let node = el.parentElement;
  while (node) {
    if (BLOCKED_ANCESTORS.has(node.tagName)) return true;
    node = node.parentElement;
  }
  return false;
}

function isTitleLike(el) {
  try {
    return !!el?.matches?.(TITLE_LIKE_SELECTOR);
  } catch {
    return /^H[1-6]$/.test(el?.tagName || '');
  }
}

function isLikelyContentBlock(el) {
  return !!el.closest(CONTENT_CONTAINER_SELECTOR);
}

function buildSummarySource(element) {
  const own = String(element?.innerText || '').trim();
  const root = element.closest(CONTENT_CONTAINER_SELECTOR) || element;
  const parts = [];
  const seen = new Set();

  function pushPart(text) {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t || t.length < 8) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    parts.push(t);
  }

  pushPart(own);
  const contextNodes = Array.from(root.querySelectorAll(SUMMARY_SOURCE_SELECTOR));
  for (const node of contextNodes) {
    if (parts.length >= 14) break;
    if (node.closest(EXTENSION_UI_SELECTOR)) continue;
    pushPart(node.innerText);
  }

  const source = parts.join(' ');
  return source.slice(0, 2800);
}

function urlToSignal(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  return raw
    .replace(/^https?:\/\//i, '')
    .replace(/[?#].*$/, '')
    .replace(/[_\-/.]+/g, ' ')
    .trim();
}

function addNearbyContext(element, add, maxNodes = 8) {
  const fig = element.closest?.('figure');
  add(fig?.querySelector?.('figcaption')?.innerText);

  const card = element.closest?.(CONTENT_CONTAINER_SELECTOR) || element.parentElement;
  if (!card) return;

  const nearby = card.querySelectorAll(
    'h1, h2, h3, [itemprop="headline"], [data-testid="tweetText"], figcaption, p, [class*="title" i], [class*="caption" i], [class*="summary" i]'
  );
  let count = 0;
  for (const node of nearby) {
    if (count >= maxNodes) break;
    if (node.closest?.(EXTENSION_UI_SELECTOR)) continue;
    add(node.innerText);
    count++;
  }
}

function buildImageSignalText(element) {
  const bits = [];
  const seen = new Set();

  function add(text) {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    bits.push(t);
  }

  add(element.alt);
  add(element.title);
  add(element.getAttribute?.('aria-label'));
  add(element.getAttribute?.('data-testid'));
  add(urlToSignal(element.currentSrc || element.src));
  addNearbyContext(element, add, 8);

  return bits.join(' ').slice(0, 2000);
}

function buildVideoSignalText(element) {
  const bits = [];
  const seen = new Set();

  function add(text) {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    bits.push(t);
  }

  add(element.title);
  add(element.getAttribute?.('aria-label'));
  add(element.getAttribute?.('data-testid'));
  add(element.getAttribute?.('poster'));
  add(urlToSignal(element.getAttribute?.('src')));
  add(urlToSignal(element.currentSrc));

  if (element.tagName === 'VIDEO') {
    const sources = element.querySelectorAll('source[src]');
    let count = 0;
    for (const srcEl of sources) {
      if (count >= 3) break;
      add(urlToSignal(srcEl.getAttribute('src')));
      count++;
    }
  }

  addNearbyContext(element, add, 10);
  return bits.join(' ').slice(0, 2200);
}

function getImageBlocks() {
  const host = window.location.hostname;
  const isX = host.includes('twitter.com') || host.includes('x.com');

  const blocks = Array.from(document.querySelectorAll('img'))
    .filter(img => {
      if (!img) return false;
      if (img.hasAttribute(REVEALED_ATTR)) return false;
      if (isInsideBlockedTag(img)) return false;
      if (img.closest(EXTENSION_UI_SELECTOR)) return false;
      if (img.closest('nav, header, footer, [role="navigation"], [aria-label*="navigation" i]')) return false;
      const rect = img.getBoundingClientRect?.();
      const w = Math.round(rect?.width || img.clientWidth || 0);
      const h = Math.round(rect?.height || img.clientHeight || 0);
      if (w < 56 || h < 56) return false; // skip tiny decorative images/icons
      if (!isX && (w * h) < 7000) return false;
      return true;
    })
    .map(img => ({ element: img, text: buildImageSignalText(img) }))
    .filter(block => block.text.length >= 3);

  const existingBlurred = blocks.filter(block => block.element.classList.contains('tg-blurred'));
  if (existingBlurred.length >= IMAGE_RATE_LIMIT) return existingBlurred;
  const freshBlocks = blocks.filter(block => !block.element.classList.contains('tg-blurred'));
  return [...existingBlurred, ...freshBlocks.slice(0, IMAGE_RATE_LIMIT - existingBlurred.length)];
}

function getVideoBlocks() {
  const host = window.location.hostname;
  const isX = host.includes('twitter.com') || host.includes('x.com');
  const selector = `video, ${VIDEO_IFRAME_SELECTOR}`;

  const blocks = Array.from(document.querySelectorAll(selector))
    .filter(media => {
      if (!media) return false;
      if (media.hasAttribute(REVEALED_ATTR)) return false;
      if (isInsideBlockedTag(media)) return false;
      if (media.closest(EXTENSION_UI_SELECTOR)) return false;
      if (media.closest('nav, header, footer, [role="navigation"], [aria-label*="navigation" i]')) return false;
      const rect = media.getBoundingClientRect?.();
      const w = Math.round(rect?.width || media.clientWidth || 0);
      const h = Math.round(rect?.height || media.clientHeight || 0);
      if (w < 120 || h < 68) return false;
      if (!isX && (w * h) < 12000) return false;
      return true;
    })
    .map(media => ({ element: media, text: buildVideoSignalText(media) }))
    .filter(block => block.text.length >= 3);

  const existingBlurred = blocks.filter(block => block.element.classList.contains('tg-blurred'));
  if (existingBlurred.length >= VIDEO_RATE_LIMIT) return existingBlurred;
  const freshBlocks = blocks.filter(block => !block.element.classList.contains('tg-blurred'));
  return [...existingBlurred, ...freshBlocks.slice(0, VIDEO_RATE_LIMIT - existingBlurred.length)];
}

function getTextBlocks(settings = {}) {
  const host = window.location.hostname;
  const isX = host.includes('twitter.com') || host.includes('x.com');
  const isCnn = host.includes('cnn.com');

  let selector = SITE_SELECTORS.default;
  if (host.includes('reddit.com'))   selector = SITE_SELECTORS.reddit;
  if (isCnn)                          selector = `${SITE_SELECTORS.cnn}, ${SITE_SELECTORS.default}`;
  if (host.includes('foxnews.com'))   selector = SITE_SELECTORS.foxnews;
  if (isX)                            selector = SITE_SELECTORS.twitter;

  const minTextLength = isX ? 8 : (isCnn ? 12 : 30);

  const blocks = Array.from(document.querySelectorAll(selector))
    .filter(el => {
      if (el.hasAttribute(REVEALED_ATTR)) return false;
      if (isInsideBlockedTag(el)) return false;
      if (INTERACTIVE_TAGS.has(el.tagName)) return false;
      // Never scan extension-injected UI; keep moderation budget for page content.
      if (el.closest(EXTENSION_UI_SELECTOR)) return false;

      // Skip nav, header, footer so they don't eat the rate limit cap
      if (el.closest('nav, header, footer, [role="navigation"], [aria-label*="navigation" i]')) return false;

      const textValue = el.innerText?.trim() ?? '';
      const anchorHeadline = el.tagName === 'A' && (
        textValue.length >= 24 ||
        !!el.querySelector('h1, h2, h3, h4, [class*="headline" i], [class*="title" i]')
      );
      const titleLike = isTitleLike(el) || anchorHeadline;

      // Respect title toggle for headings and title-like elements.
      if (titleLike && settings.blurTitles === false) return false;

      // Exclude interactive/button-like ancestors; allow headings even when
      // wrapped in an anchor (common for site titles and linked previews).
      const hasButtonAncestor = !!el.closest('button, [role="button"], form');
      const hasAnchorAncestor = !!el.closest('a');
      const inContentBlock = isLikelyContentBlock(el);
      if (hasButtonAncestor) return false;
      if (hasAnchorAncestor && !titleLike && !inContentBlock && !isCnn) return false;

      // Allow shorter lengths for heading/title elements so titles get scanned.
      const thresh = titleLike ? 6 : minTextLength;
      return textValue.length > thresh;
    })
    .map(el => ({ element: el, text: (el.innerText || '').trim() }))
    // Prevent nested duplicate blurs, common on X and news article markup.
    .filter((block, idx, arr) =>
      !arr.some((other, jdx) => jdx !== idx && other.element.contains(block.element))
    );

  // Prioritise elements nearer the top of the page and cap to prevent overload.
  const rateLimit = isX ? 140 : (isCnn ? 180 : RATE_LIMIT);
  const existingBlurred = blocks.filter(block => block.element.classList.contains('tg-blurred'));
  if (existingBlurred.length >= rateLimit) return existingBlurred;
  const freshBlocks = blocks.filter(block => !block.element.classList.contains('tg-blurred'));
  return [...existingBlurred, ...freshBlocks.slice(0, rateLimit - existingBlurred.length)];
}

/* â”€â”€â”€ 2. sendForModeration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function sendForModeration(textBlocks) {
  const payload = textBlocks.map((block, index) => ({ id: index, text: block.text }));

  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage({ type: 'MODERATE_BATCH', payload }, response => {
        if (chrome.runtime.lastError || !Array.isArray(response)) {
          // Network / extension error â€” resolve with all-safe results, never reject
          resolve(payload.map(item => ({ id: item.id, flagged: false })));
        } else {
          resolve(response);
        }
      });
    } catch {
      // Catches synchronous throws (e.g. extension context invalidated)
      resolve(payload.map(item => ({ id: item.id, flagged: false })));
    }
  });
}

function cleanUiText(value) {
  return String(value ?? '')
    .replace(/âš\s*ï¸?/g, 'Warning')
    .replace(/âœ•/g, 'x')
    .replace(/â€¦/g, '...')
    .replace(/â€”|â€“/g, '-')
    .replace(/â€œ|â€�/g, '"')
    .replace(/â€˜|â€™/g, "'")
    .replace(/ï¸/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* â”€â”€â”€ 3. showModal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function showModal(element, category) {
  document.querySelector('.tg-modal')?.remove();
  const safeCategory = cleanUiText(category) || 'Custom';
  const pageTitle = cleanUiText(document.title || '').slice(0, 140);

  const detectedWords = JSON.parse(element.dataset.tgDetected || '[]');
  const wordsHtml = detectedWords.length
    ? `<div class="tg-modal__detected">
         Flagged for: ${detectedWords.map(w => `<code class="tg-token">${w}</code>`).join(' ')}
       </div>`
    : '';

  const modal = document.createElement('div');
  modal.className = 'tg-modal';
  modal.innerHTML = `
    <div class="tg-modal__card">
      <div class="tg-modal__header">
        <p class="tg-modal__title">Warning: ${escapeHtml(safeCategory)} content detected</p>
        <button class="tg-modal__close" aria-label="Close">x</button>
      </div>
      <p class="tg-modal__body">
        This section was flagged as <strong>${escapeHtml(safeCategory)}</strong>${pageTitle ? ` on "${escapeHtml(pageTitle)}".` : '.'}
      </p>
      ${wordsHtml}
      <div class="tg-summary-box tg-summary-box--loading">
        <span class="tg-summary-box__label">Summary</span>Loading summary...
      </div>
      <div class="tg-modal__actions">
        <button class="tg-btn-reveal">Reveal Content</button>
        <button class="tg-btn-summary">Refresh Summary</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn   = modal.querySelector('.tg-modal__close');
  const revealBtn  = modal.querySelector('.tg-btn-reveal');
  const summaryBtn = modal.querySelector('.tg-btn-summary');
  const summaryBox = modal.querySelector('.tg-summary-box');

  function closeModal() { modal.remove(); }

  // Backdrop click closes without revealing
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  closeBtn.addEventListener('click', closeModal);

  // Reveal: animate unblur, restore original HTML, remove label
  revealBtn.addEventListener('click', () => {
    // Persist user intent: once manually revealed, do not auto-blur this element again.
    element.setAttribute(REVEALED_ATTR, '1');
    element.classList.add('tg-unblurring');
    element.addEventListener('transitionend', () => {
      const original = element.dataset.tgOriginal;
      if (original !== undefined) {
        element.innerHTML = original;
        delete element.dataset.tgOriginal;
        delete element.dataset.tgDetected;
      }
      delete element.dataset.tgSummarySource;
      element.classList.remove('tg-blurred', 'tg-unblurring');
      element.previousElementSibling?.classList.contains('tg-label') &&
        element.previousElementSibling.remove();
    }, { once: true });
    closeModal();
  });

  // Shared summary loader â€” called automatically on open and by "Refresh Summary"
  function loadSummary() {
    summaryBox.classList.add('tg-summary-box--loading');
    summaryBox.innerHTML = '<span class="tg-summary-box__label">Summary</span>Loading summary...';
    summaryBtn.disabled  = true;

    function onSummaryResponse(response) {
      summaryBox.classList.remove('tg-summary-box--loading');
      const err = chrome.runtime.lastError;
      if (err || !response?.summary) {
        const hint = err?.message?.includes('Extension context') ? ' - try refreshing the page.' : '.';
        summaryBox.innerHTML = `<span class="tg-summary-box__label">Summary</span>Could not load summary${hint}`;
      } else {
        const safeSummary = escapeHtml(cleanUiText(response.summary));
        summaryBox.innerHTML = `<span class="tg-summary-box__label">Summary</span>${safeSummary}`;
      }
      summaryBtn.disabled = false;
    }

    try {
      chrome.runtime.sendMessage(
        {
          type: 'SUMMARIZE',
          text: element.dataset.tgSummarySource || element.dataset.tgText || element.innerText,
        },
        onSummaryResponse
      );
    } catch {
      onSummaryResponse(null);
    }
  }

  summaryBtn.addEventListener('click', loadSummary);
  loadSummary(); // auto-load as soon as the modal opens
}

/* â”€â”€â”€ 4. blurElement â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/** Accumulated list of everything flagged on this page, shown in the popup. */
const detections = [];

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function prepareCustomFilterWords(customWords = []) {
  const seen = new Set();
  const prepared = [];
  for (const raw of customWords) {
    const display = String(raw || '').trim();
    const needle = display.toLowerCase();
    if (!needle || seen.has(needle)) continue;
    seen.add(needle);
    const escaped = escapeRegex(needle);
    const regex = needle.includes(' ')
      ? new RegExp(escaped, 'g')
      : new RegExp(`\\b${escaped}\\b`, 'g');
    prepared.push({ display, needle, regex });
  }
  return prepared;
}

function matchCustomFilterWords(text, preparedWords) {
  const source = String(text || '').toLowerCase();
  const wordCount = (source.match(/[a-z0-9'-]+/g) || []).length || 1;
  const matchRows = [];
  let totalHits = 0;

  for (const item of preparedWords) {
    const hits = source.match(item.regex)?.length || 0;
    if (hits > 0) {
      matchRows.push({ word: item.display, hits });
      totalHits += hits;
    }
  }

  if (!matchRows.length) return { matchedWords: [], score: 0, wordBreakdown: [] };

  const matchedWords = matchRows.map(row => row.word);
  const coveragePct = (matchedWords.length / preparedWords.length) * 100;
  const densityBoost = Math.min(15, Math.round((totalHits / wordCount) * 100));
  const score = Math.min(100, Math.max(1, Math.round(coveragePct + densityBoost)));
  const wordBreakdown = matchRows
    .map(row => ({
      word: row.word,
      hits: row.hits,
      percent: Math.max(1, Math.round((row.hits / totalHits) * 100)),
    }))
    .sort((a, b) => b.percent - a.percent || b.hits - a.hits);
  return { matchedWords, score, wordBreakdown };
}

function removeDetection(blurId) {
  const index = detections.findIndex(d => d.id === blurId);
  if (index >= 0) detections.splice(index, 1);
}

function unblurElement(element, { clearReveal = false } = {}) {
  if (!element) return;

  const blurId = element.dataset.tgBlurId;
  if (blurId) {
    document.querySelectorAll(`.tg-label[data-tg-target="${blurId}"]`).forEach(label => label.remove());
    removeDetection(blurId);
  } else if (element.previousElementSibling?.classList?.contains('tg-label')) {
    element.previousElementSibling.remove();
  }

  const original = element.dataset.tgOriginal;
  if (original !== undefined) {
    element.innerHTML = original;
  }

  delete element.dataset.tgOriginal;
  delete element.dataset.tgText;
  delete element.dataset.tgDetected;
  delete element.dataset.tgSummarySource;
  delete element.dataset.tgCategory;
  delete element.dataset.tgVideoWasPaused;
  if (clearReveal) element.removeAttribute(REVEALED_ATTR);
  element.classList.remove('tg-blurred', 'tg-unblurring');
}

function pruneBlurredElements(keepIds) {
  const blurred = Array.from(document.querySelectorAll('.tg-blurred'));
  for (const el of blurred) {
    const id = el.dataset.tgBlurId;
    if (id && keepIds.has(id)) continue;
    unblurElement(el);
  }

  document.querySelectorAll('.tg-label[data-tg-target]').forEach(label => {
    const id = label.dataset.tgTarget;
    if (!id || !keepIds.has(id)) label.remove();
  });

  for (let i = detections.length - 1; i >= 0; i--) {
    if (!keepIds.has(detections[i].id)) detections.splice(i, 1);
  }
}

function clearAllBlurred() {
  document.querySelector('.tg-modal')?.remove();
  document.querySelectorAll('.tg-blurred').forEach(el => {
    unblurElement(el, { clearReveal: true });
  });
  document.querySelectorAll('.tg-label').forEach(label => label.remove());
  detections.length = 0;
}

function getBlurTargetId(element) {
  if (!element.dataset.tgBlurId) {
    element.dataset.tgBlurId = 'tg_' + Math.random().toString(36).slice(2, 11);
  }
  return element.dataset.tgBlurId;
}

function blurElement(element, category, score, detectedWords = [], wordBreakdown = []) {
  const blurId = getBlurTargetId(element);

  const labels = Array.from(document.querySelectorAll(`.tg-label[data-tg-target="${blurId}"]`));
  let label = labels.shift() || null;
  labels.forEach(extra => extra.remove());

  if (!label && element.previousElementSibling?.classList?.contains('tg-label')) {
    label = element.previousElementSibling;
    label.dataset.tgTarget = blurId;
  }

  // Freshly flagged elements should no longer carry the revealed marker.
  element.removeAttribute(REVEALED_ATTR);

  // Snapshot original content once so repeated scans do not cause visual resets.
  if (element.dataset.tgOriginal === undefined) {
    element.dataset.tgOriginal = element.innerHTML;
  }
  element.dataset.tgText = element.innerText?.trim() ?? '';
  element.dataset.tgSummarySource = buildSummarySource(element);
  const uniqueWords = Array.from(new Set((detectedWords || []).map(w => String(w).trim()).filter(Boolean)));
  element.dataset.tgDetected = JSON.stringify(uniqueWords);
  element.dataset.tgCategory = category;

  element.classList.add('tg-blurred');
  if (element.tagName === 'VIDEO') {
    if (element.dataset.tgVideoWasPaused === undefined) {
      element.dataset.tgVideoWasPaused = element.paused ? '1' : '0';
    }
    try { element.pause(); } catch {}
  }
  const normalizedBreakdown = Array.isArray(wordBreakdown)
    ? wordBreakdown
        .map(row => ({ word: String(row.word || '').trim(), percent: Number(row.percent) || 0 }))
        .filter(row => row.word)
    : [];
  const detection = { id: blurId, category, score, words: uniqueWords, wordBreakdown: normalizedBreakdown };
  const existingIdx = detections.findIndex(d => d.id === blurId);
  if (existingIdx >= 0) detections[existingIdx] = detection;
  else detections.push(detection);

  const badgeColor = CATEGORY_COLORS[category] ?? '#2c1404';
  const wordPreview = uniqueWords.slice(0, 2).map(w => `"${w}"`).join(', ');
  const wordHint = wordPreview ? ` | ${wordPreview}` : '';

  if (!label) {
    label = document.createElement('div');
    label.className = 'tg-label';
    label.dataset.tgTarget = blurId;
  }
  if (label.nextElementSibling !== element) element.insertAdjacentElement('beforebegin', label);

  label.innerHTML = `
    <span class="tg-label__badge" style="background:${badgeColor};"></span>
    <span class="tg-label__icon">!</span>
    <span class="tg-label__category">${category}</span>
    <span class="tg-label__hint">${wordHint} (${score}% negative) - Click for details</span>
  `;
  label.onclick = () => showModal(element, category);

  if (!element.dataset.tgClickBound) {
    element.dataset.tgClickBound = '1';
    element.addEventListener('click', event => {
      if (!element.classList.contains('tg-blurred')) return;
      event.preventDefault();
      event.stopPropagation();
      showModal(element, element.dataset.tgCategory || category);
    });
  }

  return blurId;
}

/* â”€â”€â”€ 5. getSettings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function getSettings() {
  // Read directly from storage â€” avoids background.js roundtrip and
  // ensures sidebar-written defaults (all categories ON) are always used.
  return new Promise(resolve => {
    chrome.storage.sync.get(null, stored => {
      const savedCats = (stored.categories && typeof stored.categories === 'object') ? stored.categories : {};
      const categories = {
        violence: savedCats.violence !== false,
        selfHarm: savedCats.selfHarm !== false,
        sexual:   savedCats.sexual   !== false,
        hate:     savedCats.hate     !== false,
        harassment: savedCats.harassment !== false,
      };
      resolve({
        enabled:     stored.enabled    !== false,
        blurTitles:  stored.blurTitles !== false,
        blurLevel:   stored.blurLevel  ?? stored.sensitivity ?? 6,
        sensitivity: stored.sensitivity ?? 6,
        customWords: Array.isArray(stored.customWords) ? stored.customWords : [],
        categories,
      });
    });
  });
}

/* â”€â”€â”€ 6. scan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

let scanVersion = 0;

async function scan() {
  const currentScan = ++scanVersion;
  try {
    let settings;
    try {
      settings = await getSettings();
    } catch {
      return; // Extension not ready yet — fail silently
    }
    if (currentScan !== scanVersion) return;

    // Ensure page blur level is applied immediately from settings
    try {
      const lvl = Number(settings.blurLevel ?? settings.sensitivity ?? 6);
      const px = Math.max(1, Math.min(20, Math.round(lvl * 2)));
      document.documentElement.style.setProperty('--tg-blur', `${px}px`);
    } catch {}

    if (!settings?.enabled) {
      clearAllBlurred();
      return;
    }

    const preparedWords = prepareCustomFilterWords(settings.customWords || []);
    if (!preparedWords.length) {
      // Only blur when the user has provided filter words.
      clearAllBlurred();
      return;
    }

    const blocks = getTextBlocks(settings);
    const imageBlocks = getImageBlocks();
    const videoBlocks = getVideoBlocks();
    if (!blocks.length && !imageBlocks.length && !videoBlocks.length) {
      pruneBlurredElements(new Set());
      return;
    }

    const keepBlurIds = new Set();

    for (const block of blocks) {
      if (currentScan !== scanVersion) return;
      const { matchedWords, score, wordBreakdown } = matchCustomFilterWords(block.text, preparedWords);
      if (!matchedWords.length) continue;
      const blurId = blurElement(block.element, 'Custom', score, matchedWords, wordBreakdown);
      if (blurId) keepBlurIds.add(blurId);
    }

    for (const block of imageBlocks) {
      if (currentScan !== scanVersion) return;
      const { matchedWords, score, wordBreakdown } = matchCustomFilterWords(block.text, preparedWords);
      if (!matchedWords.length) continue;
      const blurId = blurElement(block.element, 'Custom', score, matchedWords, wordBreakdown);
      if (blurId) keepBlurIds.add(blurId);
    }

    for (const block of videoBlocks) {
      if (currentScan !== scanVersion) return;
      const { matchedWords, score, wordBreakdown } = matchCustomFilterWords(block.text, preparedWords);
      if (!matchedWords.length) continue;
      const blurId = blurElement(block.element, 'Custom', score, matchedWords, wordBreakdown);
      if (blurId) keepBlurIds.add(blurId);
    }

    pruneBlurredElements(keepBlurIds);
  } catch {
    // Outer catch swallows any unexpected error — never surface to console
  }
}

/* â”€â”€â”€ 7. Init + MutationObserver (debounced) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

let debounceTimer = null;

function debouncedScan() {
  clearTimeout(debounceTimer);
  // Slower debounce to reduce aggressive re-scans on dynamic pages
  debounceTimer = setTimeout(scan, 500);
}

// At document_idle the DOM is already ready â€” DOMContentLoaded has already fired,
// so we must call scan() directly here instead of listening for the event.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scan);
} else {
  scan();
}

// Also ensure we scan once the full window load event fires (captures late-inserted content)
window.addEventListener('load', scan);

/** Returns true if a node or any of its classes starts with "tg-". */
function hasTgClass(node) {
  return node.nodeType === Node.ELEMENT_NODE &&
    Array.from(node.classList).some(c => c.startsWith('tg-'));
}

/** Returns true if every added node in the list was injected by TriggerGuard. */
function isOwnMutation(addedNodes) {
  for (const node of addedNodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    // Accept this node as "ours" if it has a tg- class or contains any tg- element
    if (hasTgClass(node) || node.querySelector?.('[class*="tg-"]')) return true;
  }
  return false;
}

const observer = new MutationObserver(mutations => {
  const hasExternalNewNodes = mutations.some(
    m => m.addedNodes.length > 0 && !isOwnMutation(m.addedNodes)
  );
  if (hasExternalNewNodes) debouncedScan();
});

observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

/* â”€â”€â”€ 8. Message listener â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'APPLY_BLUR_LEVEL': {
      try {
        const level = Number(message.blurLevel) || 6;
        const px = Math.max(1, Math.min(20, Math.round(level * 2)));
        document.documentElement.style.setProperty('--tg-blur', `${px}px`);
        sendResponse({ ok: true });
      } catch (e) { sendResponse({ ok: false }); }
      return true;
    }

    case 'EXTRACT_ASSOCIATED_TERMS': {
      try {
        const seeds = Array.isArray(message.seeds) && message.seeds.length ? message.seeds : ['war','crime','death','kill','killing','murder'];
        const max = Number(message.max) || 6;
        const body = String(document.body?.innerText || '');
        const sentences = body.match(/[^.!?]+[.!?]?/g) || [];
        const seedSet = new Set(seeds.map(s => s.toLowerCase()));
        const candidateWords = new Map();
        const stop = new Set(['the','and','for','with','that','this','from','have','were','which','when','where','what','about','their','there','they','them','been','will','would','could','should','your','you','are','was','but','not','had','has','its','into','than','who','while','also','such','these','those','more','other','some','any','each','many','our','over','after','before','during','because','into']);

        for (const s of sentences) {
          const lower = s.toLowerCase();
          let hasSeed = false;
          for (const seed of seedSet) if (lower.includes(seed)) { hasSeed = true; break; }
          if (!hasSeed) continue;
          const words = lower.match(/[a-z'-]+/g) || [];
          for (const w of words) {
            if (w.length < 3) continue;
            if (stop.has(w)) continue;
            if (seedSet.has(w)) continue;
            candidateWords.set(w, (candidateWords.get(w) || 0) + 1);
          }
        }

        const terms = [...candidateWords.entries()].sort((a,b) => b[1]-a[1]).slice(0, max).map(([t]) => t);
        sendResponse({ terms });
      } catch (e) { sendResponse({ terms: [] }); }
      return true;
    }

    case 'FORCE_SCAN':
      scan().then(() => sendResponse({ ok: true }));
      return true; // async response

    case 'GET_COUNT':
      sendResponse({ count: document.querySelectorAll('.tg-blurred').length });
      return false;

    case 'GET_DETECTIONS':
      sendResponse({ detections });
      return false;
  }
});

/* â”€â”€â”€ 9. Sidebar bridge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
// sidebar.js runs in the same page context â€” communicate via window events

window.addEventListener('sv_request', async e => {
  const msg = e.detail;
  const id  = msg._id;
  let result = null;

  switch (msg.type) {
    case 'FORCE_SCAN':
      await scan();
      result = { ok: true };
      break;
    case 'GET_COUNT':
      result = { count: document.querySelectorAll('.tg-blurred').length };
      break;
    case 'GET_DETECTIONS':
      result = { detections };
      break;
  }

  window.dispatchEvent(new CustomEvent('sv_response_' + id, { detail: result }));
});



