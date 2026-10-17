# Use Pocket Flashcards on iPhone

The downloaded HTML is a standalone browser file, not an iPhone installation package. iPhone Files previews do not reliably run interactive HTML apps. For dependable iPhone use and offline installation, publish the static web version to an HTTPS address first. Use your published Netlify address, such as https://symphonious-concha-e70db9.netlify.app, after uploading the latest ZIP.

## One-time publishing from a computer

1. Download `pocket-flashcards.zip` and unzip it.
2. Sign in to a static hosting provider such as Netlify. Choose a manual deployment and upload the extracted app folder (the folder containing `index.html`). Netlify Drop at https://app.netlify.com/drop supports folder uploads from a computer.
3. Wait for deployment to finish and copy the HTTPS website address supplied by the host. This address is the app link; do not use localhost.

The deployment includes the study deck, so use a private hosting arrangement if you do not want that material publicly accessible. No credentials or study progress are included in the application files.

## Install on iPhone

1. Open the published HTTPS app address in Safari.
2. Wait for the 94 cards to load and for “Ready for offline study” to appear at the bottom.
3. Tap Share (the square with an upward arrow), then **Add to Home Screen**. You may need to scroll through the actions. If shown, leave **Open as Web App** enabled.
4. Tap **Add**. Launch Pocket from its new Home Screen icon, once while connected to the Internet, and wait for the offline-ready message there too.
5. Try Airplane Mode and reopen Pocket to confirm offline study works on your iPhone.

## Study and save

Use **Flashcards** to reveal answers and mark cards for practice. Use **Learn** for ten-card multiple-choice rounds, immediate feedback, and repeat practice for missed questions. Progress saves in this app on this device and does not sync to other devices. Safari and a Home Screen web app may use separate storage; continue studying in the Home Screen app once installed.

In **Manage cards**, use **Export JSON** to save the card collection to Files. This backs up the cards, not learning progress. Clearing website data or deleting app storage may remove local progress. The PDF deck remains included in the hosted app.

## Import another PDF on iPhone

1. Save a supported Quizlet print PDF (or a PDF with Question: / Answer: pairs) to Files.
2. In Pocket, open **Manage cards**, tap **Import a questions & answers PDF**, and choose the file.
3. Wait for extraction, name the set, and review every pair. Broken characters can be corrected in the editable JSON; tap **Review cards** after editing.
4. Check **I checked the questions and answers**, tap **Use these cards**, and confirm replacement. Export your current set first if you want to keep it.

For a PDF backup, choose **Export PDF / print**, tap **Print / Save as PDF**, and use the print-preview Share menu to save to Files. JSON backups preserve card text more exactly. Scanned PDFs need OCR before import.

## Update without losing progress

Upload the latest ZIP to your **existing** Netlify project; keep the same site address. Continue using the same Safari session or Home Screen app as before. Updates preserve existing local cards and progress. If an older version opens in Flashcards, tap **Learn** to return to the saved round. Do not reimport your PDF merely to update the app, because a new set import resets progress.

After updating, open **Manage cards → Download full backup + progress**, then save the JSON to Files or iCloud Drive. This backup includes scores and your unfinished round, unlike **Export JSON** (cards only). To move to another iPhone/browser, choose the full JSON using the import file picker, check the preview, confirm review, and tap **Restore cards & progress**. The destination's current study data is replaced. You can also use **Recover previous local snapshot** after an accidental set replacement. Local recovery is not a substitute for a downloaded file.

No automatic cloud sync is enabled. Saving a backup in iCloud Drive lets you transfer it manually. Deleting website data or changing site address can make existing local progress unavailable.

## Exam and stronger feedback

Tap **Exam → Start full-set exam** to test every card once. Choose answers, use **Flag for review**, and use the navigator to revisit questions. Your selections save if you close the app. Tap **Submit exam** when ready: unanswered questions lower the total score, and answers appear only after submission. Review missed questions or start a targeted Learn round. Your existing Learn progress stays separate.

In Learn, solid green/red banners, short animations, and a correct-answer streak reinforce each result. Tap **Sound: on** for optional feedback tones; your iPhone/browser must allow sound. Reduced Motion disables the animations. Full backups now include any unfinished or completed exam.

## What “mastered” means

In Learn, each card must be answered correctly **three times in a row** across practice encounters. Wrong answers reset only that card to 0/3. A wrong card returns later in the current round; after a correct retry it stays eligible for later rounds until 3/3. The app rotates less recently practiced cards into new rounds rather than dropping a card after its first success.

Check the current card's **0/3–3/3** badge or expand **See mastery for every card** for the whole set. The across-card success streak is decorative; it does not determine mastery. Flashcard **Got it** means you marked it familiar, not verified mastered. Exam scoring stays separate.

Older learned cards receive one credited success (1/3) when you update. Scores, saved rounds, and exams remain. Full backups include mastery counters. After all cards reach 3/3, **Review mastered cards** lets you keep practicing without clearing progress. There is no required waiting period between rounds.

## Move to the next Learn question without scrolling

Choose an answer, review the feedback, then **swipe left across the card** to continue. You can swipe over the feedback or answer choices. You can also tap the **Next question** button pinned above the bottom edge; on the final correct answer it says **Finish round**. The next question automatically comes into view.

Swiping before answering does not skip the question. Vertical scrolling still works if you want to read the full explanation. Wrong answers still return for practice and the three-correct mastery rule stays the same. Swipe from inside the card rather than the phone's edge, where Safari handles its own navigation gestures.

## Past-mistake reviews and “I mastered this”

Normal Learn rounds now contain **up to 10 core cards + 3 extra past-mistake reviews**, for up to 13 unique cards. Amber badges identify the extras. They rotate through recorded earlier mistakes and do not take a bonus slot in consecutive rounds. Errors you make now still return later in the same round. A previous 3/3 card can also return for a retention check if you missed it in the past.

Tap **I mastered this** near the current card or in the pinned bottom controls to mark it mastered immediately and continue. This is recorded as **manual mastery**, separate from three correct answers; it does not change your actual scores or create correct answers. These cards stop appearing in automatic core and past-mistake slots. You can still deliberately review mastered cards.

To undo, open **See mastery for every card** and tap **Return to practice**. Full backups preserve manual marks, previous mistakes, bonus review assignments, and any unfinished round. Updating the same Netlify site keeps your saved progress; an active older round may grow from 10 to 13 cards as the extra reviews are added once.
