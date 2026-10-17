import {parseCards} from './cards.js';
export function validateStudyState(input) {
  if(!input||typeof input!=='object')throw new Error('Backup has no study data.');
  const cards=parseCards(JSON.stringify(input.cards));
  const validId=id=>Number.isInteger(id)&&id>=0&&id<cards.length;
  function ids(value,label){if(value===undefined)return [];if(!Array.isArray(value)||value.some(id=>!validId(id))||new Set(value).size!==value.length)throw new Error(`Invalid ${label} in backup.`);return [...value];}
  const state={title:typeof input.title==='string'?input.title.slice(0,120):'My study set',cards,known:ids(input.known,'flashcard progress'),learned:ids(input.learned,'learning progress')};
  if(input.round){
    const r=JSON.parse(JSON.stringify(input.round));
    r.queue=ids(r.queue,'round queue');r.seen=ids(r.seen,'round history');
    if(!['total','completed','attempts','firstCorrect'].every(k=>Number.isInteger(r[k])&&r[k]>=0)||r.total>cards.length||r.completed>r.total||r.firstCorrect>r.seen.length||r.seen.length>r.total||r.attempts<r.seen.length||r.queue.length+r.completed!==r.total)throw new Error('Invalid round scores in backup.');
    if(r.current){const q=r.current;if(!r.queue.length||typeof q.prompt!=='string'||typeof q.answer!=='string'||!Array.isArray(q.options)||!q.options.length||q.options.some(o=>typeof o!=='string')||new Set(q.options).size!==q.options.length||!q.options.includes(q.answer))throw new Error('Invalid current question in backup.');}
    if(r.feedback&&(!r.current||typeof r.feedback.correct!=='boolean'||!r.current.options.includes(r.feedback.choice)||r.feedback.correct!==(r.feedback.choice===r.current.answer)))throw new Error('Invalid answer feedback in backup.');
    state.round=r;
  }
  if(input.lastActivity==='learn')state.lastActivity='learn';
  return state;
}
export function createStudyBackup(state, now=new Date()) {
  const clean=validateStudyState(state);
  return {format:'pocket-study-backup',version:1,exportedAt:now.toISOString(),title:clean.title,cards:clean.cards,progress:{known:clean.known,learned:clean.learned,round:clean.round||null,lastActivity:clean.lastActivity||'flash'}};
}
export function parseStudyBackup(text) {
  const data=JSON.parse(text);
  if(data.format!=='pocket-study-backup')return null;
  if(data.version!==1)throw new Error('This backup version is not supported. Update Pocket before restoring it.');
  if(!data.progress||!Array.isArray(data.progress.known)||!Array.isArray(data.progress.learned))throw new Error('Backup is missing progress. Nothing has been restored.');
  return validateStudyState({title:data.title,cards:data.cards,known:data.progress.known,learned:data.progress.learned,round:data.progress.round,lastActivity:data.progress.lastActivity});
}
