import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCards} from './cards.js';
test('Quizlet TSV imports definitions including additional tabs',()=>assert.deepEqual(parseCards('Ethics\tMoral principles\r\nPrivacy\tControl\tof information'),[{term:'Ethics',definition:'Moral principles'},{term:'Privacy',definition:'Control\tof information'}]));
test('backup JSON round trips multiline definitions',()=>{const cards=[{term:'Ethics',definition:'Line one\nLine two'}];assert.deepEqual(parseCards(JSON.stringify({cards})),cards);});
test('plain text supports explicit separator',()=>assert.deepEqual(parseCards('Duty :: An obligation :: to act'),[{term:'Duty',definition:'An obligation :: to act'}]));
test('invalid imports fail without silently dropping cards',()=>{for(const text of ['', 'No separator', 'Term\t', '{"cards":[]}', '[{"term":123,"definition":"x"}]'])assert.throws(()=>parseCards(text));});
import {readFileSync} from 'node:fs';
test('bundled PDF deck includes all 94 complete cards and page-break continuations',()=>{const cards=parseCards(readFileSync(new URL('./deck.json',import.meta.url),'utf8'));assert.equal(cards.length,94);assert.equal(cards[0].definition,'Technology has no ethics');assert.match(cards[8].term,/Multimedia, Cyberspace, and Ethics/);assert.match(cards[17].term,/judged by the future/);assert.match(cards[73].term,/moral development/);assert.match(cards[93].term,/secret data collection/);assert(!JSON.stringify(cards).includes('\ufffd'));});
