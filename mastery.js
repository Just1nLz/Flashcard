import {shuffle} from './learn.js';
export const MASTERY_TARGET=3;
export function validateMastery(value,count){
 if(!value||value.version!==1||!Number.isInteger(value.clock)||value.clock<0||!Array.isArray(value.cards)||value.cards.length!==count)throw new Error('Invalid per-card mastery data.');
 const result=JSON.parse(JSON.stringify(value));
 if(result.cards.some(c=>!c||!['streak','correct','incorrect','lastSeen'].every(k=>Number.isInteger(c[k])&&c[k]>=0)||c.streak>MASTERY_TARGET||c.streak>c.correct||c.lastSeen>result.clock))throw new Error('Invalid per-card mastery counters.');
 return result;
}
export function initializeMastery(state){
 if(state.mastery)return validateMastery(state.mastery,state.cards.length);
 const learned=new Set(state.learned||[]);
 const mastery={version:1,clock:0,legacyCredit:learned.size>0||!!state.round?.feedback,cards:state.cards.map((_,id)=>({streak:learned.has(id)?1:0,correct:learned.has(id)?1:0,incorrect:0,lastSeen:0}))};
 // Older versions recorded one successful answer, not three. Credit that
 // evidence without inventing a longer streak or deleting the old history.
 const r=state.round,id=r?.queue?.[0];
 if(r?.feedback&&Number.isInteger(id)&&mastery.cards[id]){
  if(!r.feedback.correct)recordMastery(mastery,id,false);
  else if(!learned.has(id))recordMastery(mastery,id,true);
 }
 return mastery;
}
export function recordMastery(mastery,id,correct){
 const card=mastery.cards[id];if(!Number.isInteger(id)||!card||typeof correct!=='boolean')throw new Error('Invalid mastery answer.');
 const wasMastered=card.streak>=MASTERY_TARGET;
 card.lastSeen=++mastery.clock;
 if(correct){card.correct++;card.streak=Math.min(MASTERY_TARGET,card.streak+1);}else{card.incorrect++;card.streak=0;}
 return {streak:card.streak,mastered:card.streak>=MASTERY_TARGET,newlyMastered:!wasMastered&&card.streak>=MASTERY_TARGET};
}
export function masterySummary(mastery){
 const mastered=mastery.cards.filter(c=>c.streak>=MASTERY_TARGET).length;
 const developing=mastery.cards.filter(c=>c.streak>0&&c.streak<MASTERY_TARGET).length;
 return {mastered,developing,needsWork:mastery.cards.length-mastered-developing,total:mastery.cards.length};
}
export function newMasteryRound(cards,mastery,random=Math.random,onlyIds=null){
 const all=cards.map((_,id)=>id);
 let pool=onlyIds?all.filter(id=>onlyIds.includes(id)):all.filter(id=>mastery.cards[id].streak<MASTERY_TARGET);
 // Once every card meets the standard, review is explicit and never clears it.
 if(!pool.length&&!onlyIds)pool=all;
 const queue=shuffle(pool,random).sort((a,b)=>mastery.cards[a].lastSeen-mastery.cards[b].lastSeen).slice(0,10);
 return {queue,total:queue.length,completed:0,attempts:0,firstCorrect:0,seen:[],current:null,feedback:null};
}
