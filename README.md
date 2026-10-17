# Pocket — Computer Ethics

A mobile-first, installable flashcard app with offline study, card flipping, shuffle, a practice queue, local progress, and import/export. No account, API keys, or server required. PDF.js and its worker are bundled locally for private, offline PDF import.

## Run

Use Node 22+ and Python 3. To rebuild from source, install pinned build dependencies first:

```sh
npm ci
npm run build
npm test
npm start
```

The development server listens on port 3000. For phone use, deploy the repository's static files to an HTTPS static host (for example GitHub Pages). Open the hosted site on your phone, then use the browser's **Add to Home Screen** option. Load it online once so the service worker can cache the app; subsequent study works offline. A localhost development server on a cloud machine is not a public phone-accessible deployment. HTTPS is required for offline caching outside localhost.

## Included study set

All 94 numbered cards from the user-provided `quizlet.com_1223528877_print.pdf` are included in `deck.json` and loaded automatically on first use. The PDF is titled **Computer Ethics Final copy**, a different set ID from the originally linked Quizlet page. Questions include their original answer choices; answers follow the PDF, including source typos. This is a study copy, not independently fact-checked course material.

Extraction separates the PDF’s question and answer fonts and follows numbered card boundaries across page breaks, removing print headers, footers, and line-wrap hyphenation. Malformed PDF glyphs in words such as finds, griefing, WiFi, flights, identified, profile, influences, first, and fixed are restored for readability. Original spelling is otherwise preserved. Quizlet itself returned a proxy HTTP 403, so the provided PDF is the source.

In **Manage cards**, paste one card per line with a tab (or `::`) separating term and definition. Importing replaces the deck and resets progress. JSON backups use `{ "cards": [{ "term": "...", "definition": "..." }] }` and support multiline text.

Cards and progress stay in this browser's local storage, without cloud synchronization. Export backups to preserve your deck and transfer it to another device. Clearing browser storage removes local cards. Card-only JSON/PDF exports omit progress. **Download full backup + progress** includes mastery, learning scores, and unfinished rounds. App shell updates require incrementing the service-worker cache version.

## Validation

`npm test` checks TSV parsing, multiline JSON backup restoration, explicit delimiters, and invalid imports. Browser smoke checks cover importing, flipping, marking mastery, persistence, and offline reload.

## Learn mode

Choose **Learn** to practice up to 10 new cards per round. Answer choices shuffle; true/false cards keep two choices, and “All” answers retain their listed options. Other questions use their question stem without the printed answer choices; distractors are drawn from other cards, prioritizing related wording. Correctness follows the provided PDF, rather than independent fact checking.

After each answer, feedback highlights the answer key. Missed cards return at the end of the queue until answered correctly. The round summary reports first-attempt accuracy separately from eventual completion. Learning progress and the in-progress round save locally, separate from flashcard mastery. Importing a new collection resets both. **Restart round** keeps already learned cards; after finishing the collection, **Practice the collection again** resets learning progress.

Build the self-contained hosted page, offline HTML download, and static-host ZIP with `npm run build`. This writes `Pocket-Flashcards.html` and `pocket-flashcards.zip` in the repository root. Both are included in GitHub for direct download. When replacing the downloaded HTML, use the same file location/browser to retain local progress where the browser permits file storage; export card backups separately.

For publishing and iPhone Home Screen installation, see [IPHONE.md](IPHONE.md). The HTML download alone is not a reliable installation route through iPhone Files.

## Download from GitHub

Open `pocket-flashcards.zip` in this repository and choose **Download raw file** to save the ZIP. Unzip it before uploading the folder to a static host. `Pocket-Flashcards.html` is also available as a single-file desktop browser version; use **Download raw file**, then open the saved HTML.

## Deployment troubleshooting

The generated `index.html` embeds its CSS, JavaScript, and all 94 cards so the design and study features do not depend on separate asset requests. Edit the page layout in `templates/index.html`, styles in `style.css`, and behavior in `app.js` / `learn.js`, then run `npm run build` to regenerate the bundled PDF reader, both HTML files, and the ZIP. Do not edit generated HTML directly.

For Netlify, upload the extracted ZIP folder with `index.html` at its top level, or connect this repository with publish directory `.` (no build command needed because generated files are committed). Upload the whole folder to retain Home Screen icons, the manifest, and offline installation. If an old deployment appears after updating, close the app tabs and reopen the published site to allow the new service worker to activate; reload once more if needed. Card data and progress stay in local storage.

## PDF import and export

Open **Manage cards → Import a questions & answers PDF**. Choose a selectable-text Quizlet print export like the original 94-card source, or a PDF with explicit `Question:` and `Answer:` pairs. PDF reading happens in the browser without uploading the document or calling an AI service. The reader and worker are embedded in both HTML editions, so import also works offline after the app is installed. Maximum input: 25 MB, 100 pages, 2,000 cards. Modern Safari/iOS is recommended.

Extracted cards appear as editable JSON and a scrollable question/answer preview. Correct text as needed, press **Review cards** after editing, then check **I checked the questions and answers** and press **Use these cards**. Replacing the current set resets its progress after confirmation. A failed import leaves the existing set intact. Change **Study set name** before importing to name any subject.

Scanned/photo PDFs need OCR first. Arbitrary layouts, separate answer-key pages, incomplete Quizlet exports, and password-protected PDFs are not supported. Extraction does not invent missing answers or automatically correct unreadable glyphs. Review is required because PDF text can contain broken characters, headers, and ambiguous layouts.

**Export JSON** saves the named card set for exact restoration. **Export PDF / print** opens a printable Question/Answer document: press **Print / Save as PDF** and select the browser's Save as PDF option. This format can be imported again. On iPhone, expand the print preview if necessary, use Share, then Save to Files. Neither export includes study progress.

Learn feedback uses large green check / red cross banners, labeled and strongly outlined correct answers, a crossed-out wrong choice, and a repeated **Remember this answer** cue. Wrong questions still return later in the round. Animations respect reduced-motion settings, and results use text and symbols in addition to color.

PDF.js is distributed under Apache-2.0; see `vendor/pdfjs-LICENSE.txt`. Generated pages include the bundled library and worker, so deployment needs no npm installation. Run `npm ci` only when rebuilding the source.

## Preserve progress during updates and device transfers

Redeploy to the existing Netlify project and keep the same HTTPS hostname. Saved data uses the unchanged `pocket-ethics-v1` local-storage key. Deploying files or refreshing the service worker does not clear it. Keep using the same Safari tab/browser profile or installed Home Screen app: these may have separate storage. A new hostname, cleared website data, or private-browsing storage is not a migration of the old data. Importing a new set intentionally resets progress after confirmation.

Under **Manage cards**, choose **Download full backup + progress** and save the JSON to Files/iCloud Drive. It includes the cards and their order, mastery, learned IDs, scores, missed-question queue, exact answer options, and pending answer feedback. On another device, open the updated app, use **Restore full backup, or import JSON / TXT / TSV**, select the file, review the progress summary, confirm, and press **Restore cards & progress**. Restoration replaces the destination's current set and progress; it does not merge two study histories. When Learn is active at export, the restored app resumes it.

The app also stores one local recovery snapshot before its first upgrade and before replacing a set or restoring a backup. Use **Recover previous local snapshot** to recover the preceding saved set and progress. Recovery is in the same local storage, so clearing browser data removes it too. Save downloaded backups for protection beyond this device. Older card-only exports cannot reconstruct study progress.

These backups are manual transfers, not automatic cloud synchronization. iCloud Drive can store the backup file but does not automatically synchronize Pocket's local study data. No server or account was added.

Upgrade validation exercises actual earlier builds (`7c145b5` and `c5af85c`) with an unfinished Learn round, then loads the new build at the same origin and verifies scores, queue, choices, feedback, and mastery are retained. Browser checks also restore a full backup into a fresh browser and recover progress after replacing the set.
