# Pocket Flashcards

A mobile-friendly flashcard app for studying online or offline, with Learn, Exam, and focused practice for difficult questions. It runs entirely in your browser: no account, API keys, or application server required.

The included **Computer Ethics Final copy** set has **94 original flashcards** and **80 consolidated Learn/Exam questions**, including **19 Select all questions**. You can also import your own study sets.

## Download and use

1. [Download pocket-flashcards.zip](https://github.com/Just1nLz/Flashcard/raw/refs/heads/main/pocket-flashcards.zip).
2. Unzip it and deploy the folder containing `index.html` to an HTTPS static host. To update an existing Netlify site, upload the latest package to that same project.
3. Open the published address in Safari on your iPhone. Wait for **Ready for offline study**, then choose **Share → Add to Home Screen**.
4. Launch the Home Screen app while online once and wait for the offline-ready message. Subsequent study works offline.

See [IPHONE.md](IPHONE.md) for installation, updates, and backup instructions. A cloud development server's localhost address is not a public phone-accessible app link.

The repository includes generated deployment files, so hosting requires no npm installation. For a Git-connected static host, use publish directory `.` with no build command. The desktop [Pocket-Flashcards.html](https://github.com/Just1nLz/Flashcard/raw/refs/heads/main/Pocket-Flashcards.html) download is self-contained; iPhone Files previews are not a reliable installation route.

## Study modes

| Mode | What it does |
| --- | --- |
| **Flashcards** | Study the 94 original PDF cards separately, with choices on individual **A)**, **B)**, **C)** rows and matching answer codes when available. Flip, shuffle, and mark each original card familiar independently. |
| **Learn** | Practice the 80 consolidated questions in rounds with immediate feedback, retries, mastery streaks, and rewards. Repeated questions with different correct answers become one Select all question. |
| **Exam** | Test the whole consolidated set once, with shuffled questions, flags, navigation, and grading after submission. |
| **Tricky** | Rank recorded Learn mistakes from most to least, review correct answers, and strengthen one question or up to 10 priorities until they reach 3/3. |

### Focused study interface

The app opens directly to the study set without a welcome banner. Activity tabs stay reachable while scrolling, and switching activities returns to the top. Learn puts round progress, a compact answer-type label, the current streak, and the question first.

Open **Study details** for XP/level progress, set recap, the mastery list, round composition, update notes, sound, restart, and learning instructions. These details stay off the active question screen. **Card options → I mastered this** holds the manual mastery action; **Check answers** and **Next question** stay pinned when needed, with one submission control for Select all questions. Rewards appear after a round, with detailed statistics under **Round breakdown**. Flashcards, Exam, and Tricky also keep instructions in expandable help sections.

### Learn and mastery

A standard round contains up to **10 core questions plus 3 labeled past-mistake reviews**. Core questions favor those least recently practiced. Bonus reviews rotate through saved mistakes and do not occupy a bonus slot in consecutive rounds. Previously verified questions with past mistakes may return for a retention check.

- **Choose ONE answer:** a green notice and round choice markers; tapping an option checks it immediately.
- **Select exactly N answers:** a blue label and square checkboxes; select options, then tap the pinned **Check answers** button. Its live counter shows how many you have selected.
- **Write your answer:** used when a single-answer question has too few distinct distractors. Grading ignores case, repeated whitespace, and trailing sentence punctuation, but does not interpret paraphrases.

Select all grading requires **every correct option and no incorrect options**. Missing a correct choice or adding an incorrect one counts as a miss. Original true/false cards keep two choices.

A wrong answer resets only that question's streak to **0/3** and returns it later in the round. In standard Learn, one correct response completes that round's encounter; the question returns in later rounds until it reaches **three consecutive correct answers**. For example, `wrong → right → right → right` reaches mastery; `right → right → wrong` resets to zero. Restarting a round keeps per-question history.

Strong green/red feedback identifies correct answers, incorrect selections, and omitted correct options. Optional sound and animations reinforce results and respect reduced-motion settings. After checking an answer, **swipe left** or use the pinned **Next question** button; vertical scrolling does not skip questions.

**Got it** in Flashcards records familiarity, not verified Learn mastery. **I mastered this** explicitly records manual mastery without inventing correct answers or increasing streaks. Manually mastered questions leave automatic core/bonus selection but can be reviewed deliberately. Use **Return to practice** in the mastery list to undo a mark. Exam scores stay separate from Learn streaks.

### Most tricky questions

Open **Tricky** to see questions ranked by total recorded Learn mistakes, including mistakes preserved from earlier versions of combined questions. Each entry shows its rank, miss count, current streak, accuracy, and verified/manual status. Earlier-version misses are identified separately. Ties favor lower streaks, then lower current-format accuracy. Questions with no recorded mistakes do not appear; Exam results are separate from this ranking.

To strengthen recall:

1. Expand **Review the correct answer**, explain it in your own words, then hide it.
2. Choose **Strengthen this question**, or use the bulk action for up to 10 highest-ranked questions below 3/3.
3. Recall each answer before choosing. The selected questions rotate within the same strengthening round until each reaches **three consecutive correct answers**. A miss resets only that question's streak.

Existing streaks count: a question at 2/3 needs one more success. Already verified questions can be rechecked without resetting their history; when all ranked questions reach 3/3, the bulk action offers rechecks. Manual completion is reported separately and does not claim verified strengthening.

Mistake totals remain historical while 3/3 labels show improvement. Reviewing an answer or opening the ranking awards no mastery or XP. Starting focused practice asks before replacing an unfinished Learn round. **Back to most tricky questions** and **Continue Learn** let you leave and resume the active round. Goals, choices, feedback, and progress survive reloads and full backups.

### Exam

Choose **Exam → Start full-set exam**. Every consolidated question appears once, in shuffled order. Select or change answers, flag uncertain questions, and revisit them with the navigator. There is no time limit, and grading stays hidden until submission.

Select all questions show the required answer count and use the same exact-set rule as Learn. Submitting locks the attempt, counts unanswered questions as incorrect, and reveals the overall percentage plus correct/incorrect/unanswered totals and answer review. Practice bands are **Strong recall** at 85%+, **Developing recall** at 65–84%, and **More practice will help** below 65%; these are study cues, not predictions of a real test grade.

**Practice missed cards** creates a targeted standard Learn round of up to 10 questions without unrelated bonus reviews. It confirms replacement of an unfinished Learn round. Taking a new exam replaces the saved exam; export a full backup first to retain its history.

### Rewards and set recap

Each completed assessed Learn round earns:

- **10 XP** for finishing.
- **5 XP** per distinct assessed question.
- **5 XP** per question answered correctly on its first encounter in that round.

Retries and extra strengthening passes do not add extra question XP. Rewards save once per completed round, including across reloads. Manual-only rounds receive encouragement with zero answer XP. Every **250 XP** advances the practice level; XP does not change mastery requirements.

The round summary awards a badge based on first-try performance and persistence. **Set recap** is available at any time and opens automatically at a completed-round milestone after every question has a recorded Learn answer. It shows assessed coverage, verified versus manual mastery, cumulative recorded-answer accuracy, and focus questions with mistake counts and streaks. Manually marked but untested questions do not count toward assessed coverage.

## Included PDF data and practice choices

The source is the user-provided `quizlet.com_1223528877_print.pdf`, **Computer Ethics Final copy**, Quizlet set **1223528877**. It differs from the originally linked Quizlet set. The app follows the PDF's answer key; it does not independently fact-check course material.

| File | Purpose |
| --- | --- |
| [source-deck.json](source-deck.json) | Preserves the 94 original extracted records. |
| [deck.json](deck.json) | Contains 80 consolidated questions and provenance identifying their original PDF card numbers. |
| [DATA-AUDIT.md](DATA-AUDIT.md) | Documents the 14 merged pairs, the five original Select all questions, answer boundaries, and source-specific corrections. |

Flashcards retains the individual question variants and original printed choices. Learn and Exam use the combined answer keys. Similar topics with genuinely different questions remain separate; ambiguous conflicting True/False or “All” keys are not automatically merged.

Practice distractors can be generated or added beyond the printed choices. In particular, the password-role and research-risk questions each mark all four source options correct. Learn and Exam add two incorrect choices, making the hint **select 4 out of 6** instead of giving away that every displayed choice is correct. The password distractors come from incorrect printed choices elsewhere in the same article; the research distractors describe synthetic-data or fictional-mockup activities without human participants. Correct answer keys and original Flashcards choices remain intact.

Unanswered saved questions can receive these extra choices when displayed, retaining existing selections. Already checked Learn feedback and submitted exams retain their original snapshots.

## Import and export

Open **Manage set** to name a set, import a PDF, paste text, or restore a backup. PDF reading uses bundled PDF.js and its worker locally, including offline; documents are not uploaded to an external service.

Supported inputs:

- Selectable-text Quizlet print PDFs like the original, or PDFs with explicit `Question:` / `Answer:` pairs. Limits: **25 MB, 100 pages, 2,000 cards**.
- JSON card collections or full study backups.
- TXT/TSV text with one `Term :: Definition` or tab-separated pair per line.

PDF extraction produces editable JSON and a question/answer preview. Correct any extraction errors, choose **Review cards**, check the confirmation box, then import. Scans need OCR first; arbitrary layouts, separate answer keys, password-protected files, and incomplete Quizlet exports are unsupported. Failed extraction leaves the current set intact. Importing a new set replaces the current set and resets its progress after confirmation.

A multi-answer card can be represented as:

```json
{
  "cards": [
    {
      "term": "Which practices protect privacy? Select all that apply.",
      "definition": "Limit data collection.\nProtect personal data.",
      "type": "multi",
      "answers": ["Limit data collection.", "Protect personal data."],
      "options": ["Limit data collection.", "Protect personal data.", "Publish private data."]
    }
  ]
}
```

New imports preserve individual originals for Flashcards while consolidating duplicate answer keys for Learn.

| Export | Contents |
| --- | --- |
| **Export JSON** | Card collection, multi-answer keys, and individual Flashcards variants; no progress. |
| **Export PDF / print** | Consolidated questions and correct answers; no progress. Select all cards print a type marker and a separate `Answer:` for each correct selection so the format can be imported again. |
| **Download full backup + progress** | Cards, original-card familiarity, mastery/history, rewards, active round/strengthening goals, pending choices and feedback, saved exam, and update archives. |

Full backup restoration replaces the destination's current study data; it does not merge two devices' histories. Older card-only exports cannot reconstruct progress.

## Keep progress when updating

Deploy the new ZIP to the **existing Netlify project and HTTPS hostname**, then continue using the same Safari profile or Home Screen app. The local-storage key remains `pocket-ethics-v1`; deploying files does not clear it. Close and reopen the app if an older cached version appears. **Do not reimport the PDF just to update the app.**

Export a full backup to Files/iCloud Drive for transfer or recovery. Progress is local to the browser/app: Safari and a Home Screen app may have separate storage, and there is no automatic cloud sync. Clearing website data or changing the hostname can make local progress unavailable.

A local recovery snapshot is kept before upgrades, set replacement, and restoration. **Recover previous local snapshot** can recover earlier local data, but downloaded backups provide protection beyond that device's storage.

When an older set is consolidated, unchanged questions keep their mastery and XP. Combined/reformatted questions require fresh assessment because earlier single-answer results do not prove recall of the full answer set. Their earlier histories remain archived and contribute to the Tricky ranking. Affected rounds and old exams are retained in full-backup archives; unaffected active rounds retain their saved question, choices, and scores with remapped IDs.

## Develop and validate

Use **Node 22+** and **Python 3**:

```sh
npm ci
npm test
npm run build
npm start
```

`npm start` serves the static app on port **3000**. HTTPS is needed for installed offline phone use outside localhost.

`npm run build` regenerates the consolidated deck, bundled PDF reader, self-contained hosted `index.html`, desktop `Pocket-Flashcards.html`, and `pocket-flashcards.zip`. **Edit source files, not generated HTML.** The ZIP includes this README and the iPhone instructions, so rebuild it after documentation changes too. Increment the cache version in `sw.js` when changing the app shell.

| Source | Responsibility |
| --- | --- |
| `templates/index.html`, `style.css`, `app.js` | Layout, presentation, interactions, and local state. |
| `cards.js`, `flashcards.js` | Card parsing, original Flashcards views, lettered options, and familiarity. |
| `learn.js`, `mastery.js`, `tricky.js` | Question generation/grading, mastery/scheduling, mistake ranking, and strengthening rounds. |
| `exam.js`, `rewards.js` | Exam state/results, round rewards, and set recap. |
| `duplicates.js`, `source-upgrade.js`, `merge-progress.js`, `backup.js` | Consolidation, audited source transformations, progress migration, and validated backups. |
| `pdf-layout.js`, `pdf-runtime.js`, `scripts/` | PDF extraction/runtime and reproducible builds. |

`npm test` covers parsing, source preservation/consolidation, original-card familiarity, single/multiple/written grading, retries, mastery, ranking and 3/3 strengthening, rewards, exams, backup validation, migration, and swipe rules. Phone-browser checks have also exercised hosted and offline editions, original PDF import, PDF export/reimport, pending-answer restoration, and focused-practice completion without duplicate grading or XP.

PDF.js is distributed under Apache-2.0; see [vendor/pdfjs-LICENSE.txt](vendor/pdfjs-LICENSE.txt).
