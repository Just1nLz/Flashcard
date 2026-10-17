# Pocket — Computer Ethics

A mobile-first, installable flashcard app with offline study, card flipping, shuffle, a practice queue, local progress, and import/export. No account, API keys, or dependencies required.

## Run

Use Node 22+ for tests and Python 3 for the development server:

```sh
npm test
npm start
```

The development server listens on port 3000. For phone use, deploy the repository's static files to an HTTPS static host (for example GitHub Pages). Open the hosted site on your phone, then use the browser's **Add to Home Screen** option. Load it online once so the service worker can cache the app; subsequent study works offline. A localhost development server on a cloud machine is not a public phone-accessible deployment. HTTPS is required for offline caching outside localhost.

## Included study set

All 94 numbered cards from the user-provided `quizlet.com_1223528877_print.pdf` are included in `deck.json` and loaded automatically on first use. The PDF is titled **Computer Ethics Final copy**, a different set ID from the originally linked Quizlet page. Questions include their original answer choices; answers follow the PDF, including source typos. This is a study copy, not independently fact-checked course material.

Extraction separates the PDF’s question and answer fonts and follows numbered card boundaries across page breaks, removing print headers, footers, and line-wrap hyphenation. Malformed PDF glyphs in words such as finds, griefing, WiFi, flights, identified, profile, influences, first, and fixed are restored for readability. Original spelling is otherwise preserved. Quizlet itself returned a proxy HTTP 403, so the provided PDF is the source.

In **Manage cards**, paste one card per line with a tab (or `::`) separating term and definition. Importing replaces the deck and resets progress. JSON backups use `{ "cards": [{ "term": "...", "definition": "..." }] }` and support multiline text.

Cards and progress stay in this browser's local storage, without cloud synchronization. Export backups to preserve your deck and transfer it to another device. Clearing browser storage removes local cards. Backup exports include cards, not mastery progress. App shell updates require incrementing the service-worker cache version.

## Validation

`npm test` checks TSV parsing, multiline JSON backup restoration, explicit delimiters, and invalid imports. Browser smoke checks cover importing, flipping, marking mastery, persistence, and offline reload.

## Learn mode

Choose **Learn** to practice up to 10 new cards per round. Answer choices shuffle; true/false cards keep two choices, and “All” answers retain their listed options. Other questions use their question stem without the printed answer choices; distractors are drawn from other cards, prioritizing related wording. Correctness follows the provided PDF, rather than independent fact checking.

After each answer, feedback highlights the answer key. Missed cards return at the end of the queue until answered correctly. The round summary reports first-attempt accuracy separately from eventual completion. Learning progress and the in-progress round save locally, separate from flashcard mastery. Importing a new collection resets both. **Restart round** keeps already learned cards; after finishing the collection, **Practice the collection again** resets learning progress.

Build the single-file offline download and static-host ZIP with `python3 scripts/build-standalone.py`. This writes `Pocket-Flashcards.html` and `pocket-flashcards.zip` in the repository root. Both are included in GitHub for direct download. When replacing the downloaded HTML, use the same file location/browser to retain local progress where the browser permits file storage; export card backups separately.

For publishing and iPhone Home Screen installation, see [IPHONE.md](IPHONE.md). The HTML download alone is not a reliable installation route through iPhone Files.

## Download from GitHub

Open `pocket-flashcards.zip` in this repository and choose **Download raw file** to save the ZIP. Unzip it before uploading the folder to a static host. `Pocket-Flashcards.html` is also available as a single-file desktop browser version; use **Download raw file**, then open the saved HTML.

## Deployment troubleshooting

The generated `index.html` embeds its CSS, JavaScript, and all 94 cards so the design and study features do not depend on separate asset requests. Edit the page layout in `templates/index.html`, styles in `style.css`, and behavior in `app.js` / `learn.js`, then run `python3 scripts/build-standalone.py` to regenerate both HTML files and the ZIP. Do not edit generated HTML directly.

For Netlify, upload the extracted ZIP folder with `index.html` at its top level, or connect this repository with publish directory `.` (no build command needed because generated files are committed). Upload the whole folder to retain Home Screen icons, the manifest, and offline installation. If an old deployment appears after updating, close the app tabs and reopen the published site to allow the new service worker to activate; reload once more if needed. Card data and progress stay in local storage.
