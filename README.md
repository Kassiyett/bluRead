# BluRead — AI-Powered Content Protection

A **Chrome extension** that detects and blurs potentially triggering content on the web. BluRead helps users browse news, social media, and articles with more control over what they see—reducing exposure to violence, self-harm, hate speech, harassment, and explicit content without leaving the page.

---

## Features

- **Automatic detection & blur** — Scans page content and blurs text that matches your chosen categories. Users can reveal blurred content on demand.
- **Local-first analysis** — A built-in toxicity analyzer runs entirely in the extension (no API key required). Works offline and keeps detection fast and private.
- **Optional AI moderation** — When you add an OpenAI API key, content can be double-checked with OpenAI’s Moderation API for higher accuracy.
- **Optional AI summaries** — With an Anthropic API key, users get brief, safe summaries of blurred content instead of raw text.
- **Configurable filters** — Toggle categories (Violence, Self-Harm, Sexual Content, Hate Speech, Harassment), adjust sensitivity and blur strength, and add custom filter words.
- **Site-aware** — Tailored selectors for Reddit, Twitter/X, CNN, Fox News, and a sensible default for other sites so the right elements get scanned.
- **Popup & sidebar UI** — Extension popup for settings and stats; optional slide-in sidebar for quick scan and controls without leaving the page.

---

## Tech Stack

- **Chrome Extension (Manifest V3)** — Service worker, content scripts, `chrome.storage.sync`
- **Vanilla JavaScript** — No framework; content scripts and popup/sidebar logic in plain JS
- **APIs (optional)** — OpenAI Moderation API, Anthropic Messages API for summarization
- **CSS** — Custom styling with CSS variables, glassmorphism-style UI, responsive layout

---

## Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/triggerguard.git
   cd triggerguard
   ```

2. **Load in Chrome**
   - Open `chrome://extensions`
   - Turn on **Developer mode**
   - Click **Load unpacked** and select the `triggerguard` folder

3. **Optional: API keys (for AI features)**
   - Copy `config_example.js` to `config.js`
   - Add your keys to `config.js` (do not commit this file):
     - `OPENAI_API_KEY` — for optional moderation pass ([OpenAI API keys](https://platform.openai.com/api-keys))
     - `GEMINI_API_KEY` — reserved for future use
     - `ANTHROPIC_API_KEY` — for safe summaries of blurred content ([Anthropic](https://console.anthropic.com/))
   - Without `config.js`, the extension still works using only the local analyzer.

---

## Usage

- **Popup:** Click the extension icon to open the popup. Toggle protection, change filters, blur level, and custom words. Use **Scan This Page** to run detection on the current tab.
- **Sidebar:** On supported pages, use the BluRead tab on the side to open the slide-in panel with the same controls and a **Scan This Page** button.
- **Blurred content:** Detected text is blurred by default. Users can reveal it via the UI (e.g. click-to-reveal) when they choose.

---

## Project Structure

| File / folder     | Purpose |
|-------------------|--------|
| `manifest.json`  | Extension manifest (MV3), permissions, content scripts |
| `background.js`  | Service worker: settings, local analyzer, OpenAI/Anthropic calls, message routing |
| `content.js`     | Injected into pages: DOM scanning, blur/unblur, site selectors |
| `sidebar.js`     | Slide-in sidebar UI and scan button |
| `content.css` / `sidebar.css` | Styles for content and sidebar |
| `popup/`         | Popup HTML, CSS, and JS for settings and stats |
| `config_example.js` | Template for `config.js` (copy and add API keys; keep `config.js` out of version control) |

---

## Privacy

- **Local analysis:** Runs entirely in the browser; no text is sent when using only the built-in analyzer.
- **With API keys:** When configured, page text may be sent to OpenAI (moderation) and/or Anthropic (summaries). No data is stored by the extension beyond your local settings.

---

## License

This project is open source. Feel free to fork and adapt for your own use or portfolio.

---
