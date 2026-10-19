import {readFile, writeFile} from 'node:fs/promises';
import {prepareStudyCards} from '../source-upgrade.js';

const source = JSON.parse(await readFile(new URL('../source-deck.json', import.meta.url), 'utf8'));
const plan = prepareStudyCards(source.cards);
const deck = {
  ...source,
  originalCardCount:source.cards.length,
  cardCount:plan.cards.length,
  cards:plan.cards,
  sourceCardGroups:plan.groups.map((group, index) => ({
    card:index + 1,
    sourceCards:group.map(id => id + 1)
  })),
  auditedSourceUpgrades:[...plan.sourceUpgrades].sort((left, right) => left - right),
  consolidationWarnings:plan.warnings
};
await writeFile(new URL('../deck.json', import.meta.url), `${JSON.stringify(deck, null, 2)}\n`);
console.log(`Built ${deck.cards.length} cards from ${source.cards.length} original records: ${plan.mergedCount} duplicates consolidated, ${plan.upgradedCount} audited source upgrades.`);
