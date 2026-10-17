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
