# Computer Ethics PDF data audit

The source is the user-supplied `quizlet.com_1223528877_print.pdf`, titled **Computer Ethics Final copy**, Quizlet set **1223528877**. `source-deck.json` preserves all **94 original extracted records**, including source spelling and the printed answer keys. It is the reproducible input for `scripts/build-deck.mjs`.

The revised `deck.json` contains **80 cards**. Fourteen pairs of repeated questions become fourteen Select-all cards. Five questions already labelled Select-all in the PDF also become genuine multiple-selection questions. Each revised card's `sourceCardGroups` entry identifies its original, **one-based** PDF card numbers.

## Repeated questions consolidated

| Original PDF cards | Shared question/source | Treatment |
| --- | --- | --- |
| 2, 3 | James Moore, “What is Computer Ethics,” most accurate statement | Merge two original correct statements; normalize the introductory video wrapper. |
| 4, 5 | Terrell Ward Bynum, “Computer Ethics: Basic Concepts and Historical Overview” | Merge two original correct statements. |
| 7, 8 | Shakib and Layton, “Interaction Between Ethics and Technology” | Merge two original correct statements; “most correct” and “most accurate” express the same prompt here. |
| 9, 10 | Jefferies, “Multimedia, Cyberspace, and Ethics” | Merge two original correct statements. |
| 14, 15 | Erik Theunissen and others, “Automated Detect and Avoid” | Merge two original correct statements; correct the stray `q` described below. |
| 21, 22 | “Ethics and Safety of Computer Systems,” no author given | Merge two original correct statements. |
| 30, 34 | Michael C. McFarland, “Ethics and Safety of Computer Systems” | Merge two original correct statements. |
| 57, 58 | Edward Gehringer, “Choosing Passwords: Security and Human Factors,” author's suggestions | Merge two original suggestions; normalize the introductory video wrapper. |
| 59, 60 | Marie Wallace, “The Ethics of Collecting Data” | Merge two original correct statements. |
| 66, 68 | “Ethic in Massively Multiplayer Online Role-Playing Games” | Merge two original correct statements. |
| 69, 70 | “An Ethical Examination of the Internet Census 2012 Dataset — A Menlo Report Case Study” | Merge two original correct statements; the missing opening quotation mark does not distinguish the prompt. |
| 72, 73 | “An Analysis of a Just Cyber Warfare” | Merge two original correct statements. |
| 84, 85 | “Ethics in Security Research. Which Lines Should Not be Crossed?” | Merge two original correct statements. |
| 86, 87 | “Research Ethics in Human-Computer Interaction” | Merge two original correct statements; normalize the introductory video wrapper. |

The answer choices printed inside the old question text do not make otherwise identical question stems different. Consolidation compares the question through its final question mark, preserving the original correct answer text as separate selection items. No extra correct claims are inferred from distractors or outside sources.

## Existing Select-all answer boundaries

These upgrades match the **exact original term and definition**, so an unrelated imported question answered “All” is not guessed to have the same answer key.

| Original PDF card | Audited correct selections | Other source choices |
| --- | --- | --- |
| 36 | How to mechanically check the correctness of mathematical proofs.; How to automate methematical proofs.; How to mathematically model formal systems and their environments. | Computer code cannot be proven correct. |
| 42 | intimacy; solitude; reserve | iron cage |
| 63 | Reduce lockouts; Modify the lifetime limits; Make password management easier for the user; Allow a user to have much longer passwords, of a universal format | All four source choices are correct, as indicated by the printed “All” key. |
| 74 | Defning good and bad behavior.; Learning a system of rules.; Practice following rules. | Developing poor social skills |
| 93 | credit card fraud; spam; viruses; botnet | All four source choices are correct, as indicated by the printed “all” key. |

Spelling such as `methematical` and `Defning` remains as printed; it is not silently rewritten during the structural upgrade.

## Conservative boundaries and correction

- Cards 21/22 and 30/34 remain separate groups because only the latter explicitly attributes the question to Michael C. McFarland.
- Card 35 has the truncated prompt `which?` in the PDF. Its intended full wording is not inferred or combined with another question.
- Cards 31, 32, and 33 are definition prompts. Sharing a concept or answer with another card does not make them duplicate questions.
- Different true/false statements, different questions about the same article, and questions with ambiguous conflicting true/false keys remain separate.
- Card 77 lists three Just War Theory elements but has no explicit Select-all instruction or printed distractors. Its original format remains unchanged.
- The answer column for card 15 ends with `accidents.q`; its corresponding correct choice in the question ends with `accidents.`. Only the extra final `q` is removed. This correction requires an exact match to that original question and answer pair.

## Rebuild and verification

Run `node scripts/build-deck.mjs` to recreate `deck.json` from the preserved source. Run `node --test source-upgrade.test.js` to check the 14 groups, exact source matching, preserved answer wording, conservative boundaries, and idempotent upgrades. `prepareStudyCards()` also supplies the same audited corrections and consolidation plan for imports and saved-collection migration.
