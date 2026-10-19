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

All 94 original records from the user-provided `quizlet.com_1223528877_print.pdf` are preserved in `source-deck.json`. The consolidated `deck.json` contains 80 study cards and loads automatically on first use. The PDF is titled **Computer Ethics Final copy**, a different set ID from the originally linked Quizlet page. Answers follow the PDF; consolidated questions include all correct selections. Source-specific changes are documented in DATA-AUDIT.md. This is a study copy, not independently fact-checked course material.

Extraction separates the PDF’s question and answer fonts and follows numbered card boundaries across page breaks, removing print headers, footers, and line-wrap hyphenation. Malformed PDF glyphs in words such as finds, griefing, WiFi, flights, identified, profile, influences, first, and fixed are restored for readability. Original spelling is otherwise preserved. Quizlet itself returned a proxy HTTP 403, so the provided PDF is the source.

In **Manage cards**, paste one card per line with a tab (or `::`) separating term and definition. Importing replaces the deck and resets progress. JSON backups use `{ "cards": [{ "term": "...", "definition": "..." }] }` and support multiline text.

Cards and progress stay in this browser's local storage, without cloud synchronization. Export backups to preserve your deck and transfer it to another device. Clearing browser storage removes local cards. Card-only JSON/PDF exports omit progress. **Download full backup + progress** includes mastery, learning scores, and unfinished rounds. App shell updates require incrementing the service-worker cache version.

## Validation

`npm test` checks TSV parsing, multiline JSON backup restoration, explicit delimiters, and invalid imports. Browser smoke checks cover importing, flipping, self-marking familiarity, mastery streaks, persistence, and offline reload.

## Learn mode

Choose **Learn** for up to 10 core cards plus up to 3 extra, labeled past-mistake reviews (13 unique cards maximum). Core cards prioritize the least recently practiced. Answer choices shuffle; true/false cards keep two choices, and “All” answers retain their listed options. Other questions use their question stem without the printed answer choices; distractors are drawn from other cards, prioritizing related wording. Correctness follows the provided PDF, rather than independent fact checking.

After each answer, feedback highlights the answer key. A missed card returns at the end of this round until answered correctly; a correct response completes this round’s encounter, not necessarily mastery. Each card requires **three consecutive correct answers to that same card**, across encounters in later rounds. Any wrong Learn answer resets only that card’s streak to zero. Other cards’ answers do not reset its streak. The scheduler keeps unmastered cards eligible and favors the least recently practiced, so all cards get coverage. The summary reports first-attempt accuracy separately from round completion and verified mastery. **Restart round** retains per-card streaks. Once all cards meet the standard, **Review mastered cards** rechecks them without resetting the collection; a wrong answer during review reopens that card for practice. Imported new sets reset progress after confirmation.

Build the self-contained hosted page, offline HTML download, and static-host ZIP with `npm run build`. This writes `Pocket-Flashcards.html` and `pocket-flashcards.zip` in the repository root. Both are included in GitHub for direct download. When replacing the downloaded HTML, use the same file location/browser to retain local progress where the browser permits file storage; export card backups separately.

For publishing and iPhone Home Screen installation, see [IPHONE.md](IPHONE.md). The HTML download alone is not a reliable installation route through iPhone Files.

## Download from GitHub

Open `pocket-flashcards.zip` in this repository and choose **Download raw file** to save the ZIP. Unzip it before uploading the folder to a static host. `Pocket-Flashcards.html` is also available as a single-file desktop browser version; use **Download raw file**, then open the saved HTML.

## Deployment troubleshooting

The generated `index.html` embeds its CSS, JavaScript, and all 80 study cards so the design and study features do not depend on separate asset requests. Edit the page layout in `templates/index.html`, styles in `style.css`, and behavior in `app.js` / `learn.js`, then run `npm run build` to regenerate the bundled PDF reader, both HTML files, and the ZIP. Do not edit generated HTML directly.

For Netlify, upload the extracted ZIP folder with `index.html` at its top level, or connect this repository with publish directory `.` (no build command needed because generated files are committed). Upload the whole folder to retain Home Screen icons, the manifest, and offline installation. If an old deployment appears after updating, close the app tabs and reopen the published site to allow the new service worker to activate; reload once more if needed. Card data and progress stay in local storage.

## PDF import and export

Open **Manage cards → Import a questions & answers PDF**. Choose a selectable-text Quizlet print export like the original 94-record source, or a PDF with explicit `Question:` and `Answer:` pairs. PDF reading happens in the browser without uploading the document or calling an AI service. The reader and worker are embedded in both HTML editions, so import also works offline after the app is installed. Maximum input: 25 MB, 100 pages, 2,000 cards. Modern Safari/iOS is recommended.

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

## Exam mode

Choose **Exam → Start full-set exam**. Each card appears once, in shuffled order, with stable shuffled choices for that attempt. Original true/false cards keep two choices. Sets with too few distinct distractors use a written answer instead of showing the only answer as a choice. Written grading ignores case, extra whitespace, and trailing sentence punctuation; it does not interpret paraphrases.

Choose/change answers, clear a selection, move backward or forward, flag uncertain questions, or jump using the question navigator. There is no time limit. Answers and correctness are not shown during the attempt. Submitting confirms any unanswered questions, counts them as wrong in the overall percentage, locks the attempt, and reveals correct / incorrect / unanswered totals and a full answer review. The review defaults to missed questions; turn off the filter to see everything. Scores follow this study set's answer key and generated distractors, not an independent examination rubric.

Practice bands are **Strong recall** at 85% or above, **Developing recall** at 65–84%, and **More practice will help** below 65%. They are study cues, not predicted real exam grades. **Learn up to 10 missed cards** creates a targeted Learn round after confirming replacement of any unfinished Learn round. It keeps prior learned/mastered cards; the exam itself does not alter those counts. Taking a new exam replaces the one saved attempt/results after confirmation; export a full backup to retain a previous attempt.

Exam questions, selected answers, flags, position, and submitted results persist across reloads and offline use. Full backups and local recovery now include the exam too, and older backups without an exam remain supported. Reimporting a new set clears the old set's exam as well as its Learn progress.

Learn feedback now uses solid green/red banners, a brief green outline bloom/check pop for correct answers, and a brief red nudge/cross pop for incorrect ones. Correct-answer streaks are shown. **Sound: off/on** optionally adds a rising success tone or descending retry tone (off by default). All effects retain text/symbol cues and respect reduced motion; scoring does not depend on sound or animation.

## Per-card mastery and upgrade policy

Learn mastery is tracked for every card with a 0–3 consecutive-correct streak, recorded correct/incorrect totals, and a last-practiced sequence counter. **See mastery for every card** shows the whole set's ledger, including new/unmastered cards. The per-card badge and set-wide mastery count are distinct from the decorative correct-answer streak across different cards. Flashcard **Got it** is a self-reported familiarity marker and does not award verified mastery. The separate **I mastered this** action explicitly awards manual mastery, tracked separately from verified 3-in-a-row mastery. Exam scores remain independent and do not silently modify Learn streaks; explicitly practicing missed exam cards uses the same three-correct rule.

A standard round has up to 10 core cards plus up to 3 distinct past-mistake reviews. Incorrect answers repeat at the queue's end. After a successful retry, that card leaves this round at 1/3 and remains eligible for future rounds. For example, `wrong → right → right → right` reaches mastery; `right → right → wrong` falls to 0/3. Answer choices reshuffle on later encounters. When too few distinct distractors exist, Learn uses written recall instead of exposing the only answer as a multiple-choice option. Written answers ignore case, repeated whitespace, and trailing sentence punctuation; paraphrases are not interpreted.

Upgrading retains cards, manual familiarity, old learned IDs, scores, unfinished Learn feedback, and saved exams. Older learned IDs receive **one credited correct answer (1/3)** because those versions did not record three successful encounters. Pending old feedback is credited/reset once during migration. New per-card counters are persisted immediately on answering, so reloading before Continue never grants duplicate credit. Full backups and local recovery include all counters, and restoring an older backup performs the same evidence-based migration. Historical totals are not reconstructed beyond the one known success per learned card.

This is a recall practice criterion, not a guarantee of long-term retention or exam performance. There is no required time delay or calendar-based spaced-repetition schedule. Revisit mastered cards and use the full-set exam for an independent check.

## Swipe through answered Learn cards

After choosing or checking an answer, **swipe left on the answered card** to continue. This works over the feedback or disabled answer choices. A pinned **Next question** / **Finish round** button stays above the bottom safe area, so long feedback never requires scrolling to reach Continue. Advancing aligns the next question (or round summary) with the viewport. The answered card has a small drag preview and the next card slides in; reduced-motion settings disable the animations.

Swipes are accepted only after an answer. A deliberate horizontal left movement (at least 72 CSS pixels, more horizontal than vertical, within 1.6 seconds) advances exactly once. Vertical gestures keep normal reading/scrolling, while taps, short drags, right swipes, cancelled gestures, form editing, and screen-edge gestures do not skip questions. Horizontal drags over unanswered options do not accidentally select an answer. The fixed controls hide in other modes and while the import dialog is open.

Both navigation methods use the same existing round logic. They never grade a question twice or change mastery counters; incorrect cards remain in the retry queue. State format, backups, and storage key are unchanged.

## Extra past-mistake reviews and manual mastery

A normal round reserves up to **3 extra past-mistake review cards**, then selects up to **10 different core cards**. Extras are interleaved after roughly every three core questions, with no duplicates. The round mix and an amber **PAST MISTAKE REVIEW** badge identify these additions. Available extras may be fewer than three when history is limited, cards are manually excluded, the set is small, or review slots are cooling down. Core selection still rotates least recently practiced unmastered cards.

Review candidates come from recorded Learn mistakes. The scheduler rotates cards that have gone longest without a bonus review, then least recently practiced; an extra review slot cannot include the same card in consecutive rounds. This slot cooldown does not prevent same-round error retries or normal core practice. Previously verified 3/3 cards with past mistakes can return for a retention check; an incorrect recheck resets the card to 0/3. Manually mastered cards are excluded from automatic core and extra slots. Explicit **Review mastered cards** can still recheck them. Targeted practice from an exam stays limited to the selected missed cards without unrelated bonus questions.

An active saved round from an older version receives eligible extra reviews once, without changing its current question, pending feedback, attempts, or original core order. Completed old rounds remain completed. Selected review IDs, ordering, the round counter, and review cooldowns persist through reloads and full backups. Mistake history is limited to the per-card errors the app actually recorded; older versions without those counters cannot reconstruct unknown past errors.

Use **I mastered this** near the current card or in the pinned answer controls to move it directly into **manual mastery** and continue. You can also mark cards from the per-card mastery list. This does not invent correct answers, increase streaks, add answer attempts, or alter exam scores. If a current queued card is manually completed, its slot counts as finished, and its existing correct/incorrect result remains if it was answered. Summary accuracy is measured over assessed cards only; unattempted manual completions are reported separately.

Use **Return to practice** in the mastery list to undo manual mastery. Genuine recorded streaks below 3/3 are retained; returning a verified 3/3 card to practice starts at 0/3. An incorrect answer during an explicit review also revokes a manual mark. Reaching three actual consecutive correct answers can upgrade a manually marked card to verified mastery. Global totals distinguish verified and manual mastery, and the full backup includes both.

## Round rewards and your set recap

Every completed Learn round receives a reward card: **Clean sweep**, **Strong round**, **Kept going**, or **Round complete**, depending on first-try answers and retries. XP is awarded once on completion: **10 XP for finishing an assessed round, 5 XP per distinct assessed card, and 5 XP per first-try correct card**. Retrying a missed card does not add extra card XP. Every 250 XP advances your practice level. XP and levels recognize practice; they do not change the three-consecutive-correct mastery requirement. A round completed entirely with manual marks still gets encouragement, with zero answer XP. Restarting an unfinished round gives no completion reward.

Use **Set recap** at any time to see coverage so far. After a completed round where every card has at least one recorded Learn answer, the full recap opens automatically. A manually mastered card with no recorded answer stays untested; choose **Assess untested cards** to check it explicitly. Merely finishing slots or marking cards familiar does not satisfy assessed coverage. Existing per-card answer history counts toward coverage, but unknown older mistakes are not reconstructed. Upgrading an already completed saved round awards that visible round once; the app does not invent rewards for earlier rounds it cannot reconstruct.

The recap shows verified mastery, manual mastery, cumulative recorded-answer accuracy (including retries), and every focus card’s question, answer, mistake count, and current 0–3 streak. Unmastered cards with more recorded mistakes come first, followed by lower streaks and untested cards. **Practice focus cards** starts a targeted round of up to 10 priorities, without unrelated bonus questions. **Review all cards** includes mastered cards with past mistakes and manually mastered cards. **Check recall in Exam** opens the separate full-set exam mode. Starting targeted practice confirms replacement of an unfinished round and preserves its recorded answers, mastery, and rewards.

XP, completed-round totals, the current round’s reward receipt, and the recap milestone save with the existing study state and are included in full backups and local recovery. Refreshing or switching modes does not award the same round twice. Replacing the study set resets that set’s rewards with its study progress; older backups without rewards remain supported.


## Consolidated questions and Select all

The original PDF’s 94 records now form **80 study cards**: 14 repeated question pairs share a single question with both correct answers. Five existing Select-all questions are also interactive, giving **19 Select all cards**. The original records remain in `source-deck.json`; [DATA-AUDIT.md](DATA-AUDIT.md) lists the original PDF card numbers and answer boundaries. Run `npm run build` to reproduce the consolidated deck and deployment files.

In Learn, select every correct option, then use **Check selected answers** or the pinned **Check answers** button. Toggling a choice does not grade it. The whole answer is correct only when all correct options and no incorrect options are selected. Feedback identifies omitted correct answers and extra incorrect selections. Misses return in the same round and reset that card’s streak; verified mastery still requires three consecutive fully correct answers. Exam uses the same exact-set rule but keeps grading hidden until submission. Selections survive refreshes and full backups.

Existing saved sets and newly imported PDFs are consolidated automatically using matching question stems. Different questions about the same topic remain separate, and ambiguous conflicting True/False or “All” answer keys are kept separate. Explicit source-specific answer boundaries are applied only to exact matches from the original PDF. JSON exports and full backups retain answer arrays. PDF export prints a `Type: Select all that apply` line and a separate `Answer:` for each correct option so the exported format can be imported again.

On upgrade, unaffected questions keep their mastery and familiarity, and XP stays intact. The full-set recap milestone reopens after the new answer sets have been assessed. Combined or reformatted questions require a fresh assessment: old single-answer results do not prove recall of the complete answer set. Their original cards and counters are archived under per-card `previousVersions` in full backups. A round containing changed questions starts fresh, with its original queue, feedback, and scores archived; an unaffected round keeps its saved question and scores with remapped IDs. Old exams are archived alongside their original deck because the new set has different questions. A notice explains the change in Learn. A local pre-update recovery snapshot is also retained.


## Flashcards layout and question formats

**Flashcards** shows all 94 original PDF cards separately, including repeated prompts with different answers and different printed choices. Every available choice appears on its own row, labelled **A)**, **B)**, **C)**, and so on. The answer side repeats the matching letter where the source answer can be matched to a printed choice. Original multi-answer cards show each correct answer on a separate row. Source questions without printed choices remain recall cards. True/False cards show two labelled choices.

**Learn** and **Exam** continue to use the 80 consolidated questions. Learn displays a green **Choose ONE answer** notice with round letter markers for a single-answer question, a blue **Select ALL correct answers** notice with square checkboxes for multiple answers, or a separate written-answer notice. The instructions explain whether tapping one choice submits immediately or whether the learner must select all choices and press Check. Existing mastery, round grading, and XP rules stay the same.

Each original flashcard has independent **Got it / Keep practicing** familiarity. Older grouped familiarity initially carries over to its original cards, after which they can be marked separately. These self-reported marks do not award Learn mastery. Full backups include the original cards, their references to Learn questions, and individual familiarity. Card-only JSON exports also retain original question/choice variants; PDF export continues to use the consolidated question/answer set. New PDF/text imports preserve individual originals for Flashcards while combining duplicate answer keys for Learn.
