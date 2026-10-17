import {isLearnAnswerCorrect} from './learn.js';
import {validateMastery} from './mastery.js';
import {validateExam} from './exam.js';
import {parseCards} from './cards.js';
import {validateRewards,validateRoundReward} from './rewards.js';
export function validateStudyState(input) {
  if(!input||typeof input!=='object')throw new Error('Backup has no study data.');
  const cards=parseCards(JSON.stringify(input.cards));
  const validId=id=>Number.isInteger(id)&&id>=0&&id<cards.length;
  function ids(value,label){if(value===undefined)return [];if(!Array.isArray(value)||value.some(id=>!validId(id))||new Set(value).size!==value.length)throw new Error(`Invalid ${label} in backup.`);return [...value];}
  const state={title:typeof input.title==='string'?input.title.slice(0,120):'My study set',cards,known:ids(input.known,'flashcard progress'),learned:ids(input.learned,'learning progress')};
  if(input.round){
    const r=JSON.parse(JSON.stringify(input.round));
    r.queue=ids(r.queue,'round queue');r.seen=ids(r.seen,'round history');
    if(r.baseIds!==undefined){r.baseIds=ids(r.baseIds,'core card IDs');r.reviewIds=ids(r.reviewIds,'past-mistake review IDs');r.manualIds=ids(r.manualIds,'manually completed IDs');const selected=[...r.baseIds,...r.reviewIds];if(new Set(selected).size!==selected.length||selected.length!==r.total||r.baseIds.length>10||r.reviewIds.length>3||r.queue.some(id=>!selected.includes(id))||r.seen.some(id=>!selected.includes(id))||r.manualIds.some(id=>!selected.includes(id)||r.queue.includes(id))||(r.roundNumber!==undefined&&(!Number.isInteger(r.roundNumber)||r.roundNumber<0)))throw new Error('Invalid round review mix in backup.');}
    if(!['total','completed','attempts','firstCorrect'].every(k=>Number.isInteger(r[k])&&r[k]>=0)||r.total>cards.length||r.completed>r.total||r.firstCorrect>r.seen.length||r.seen.length>r.total||r.attempts<r.seen.length||r.queue.length+r.completed!==r.total)throw new Error('Invalid round scores in backup.');
    if(r.current){const q=r.current;if(!r.queue.length||typeof q.prompt!=='string'||typeof q.answer!=='string'||!Array.isArray(q.options)||!q.options.length||q.options.some(o=>typeof o!=='string')||new Set(q.options).size!==q.options.length||!q.options.includes(q.answer))throw new Error('Invalid current question in backup.');}
    if(r.feedback&&(!r.current||typeof r.feedback.correct!=='boolean'||typeof r.feedback.choice!=='string'||(!(r.current.type==='written'||r.current.options.length<2)&&!r.current.options.includes(r.feedback.choice))||r.feedback.correct!==isLearnAnswerCorrect(r.current,r.feedback.choice)))throw new Error('Invalid answer feedback in backup.');
    if(r.reward){if(r.queue.length||r.completed!==r.total)throw new Error('Unfinished round cannot have a completion reward.');r.reward=validateRoundReward(r.reward);if(r.reward.total!==r.total||r.reward.assessed!==r.seen.length||r.reward.firstCorrect!==r.firstCorrect||r.reward.attempts!==r.attempts)throw new Error('Round reward does not match the saved answers.');}
    state.round=r;
  }
  if(input.mastery)state.mastery=validateMastery(input.mastery,cards.length);
  if(input.rewards)state.rewards=validateRewards(input.rewards);
  if(input.exam)state.exam=validateExam(input.exam,cards);
  if(['learn','exam'].includes(input.lastActivity))state.lastActivity=input.lastActivity;
  if(input.soundEnabled===true)state.soundEnabled=true;
  if(Number.isInteger(input.feedbackStreak)&&input.feedbackStreak>0)state.feedbackStreak=input.feedbackStreak;
  return state;
}
export function createStudyBackup(state, now=new Date()) {
  const clean=validateStudyState(state);
  return {format:'pocket-study-backup',version:1,exportedAt:now.toISOString(),title:clean.title,cards:clean.cards,progress:{known:clean.known,learned:clean.learned,round:clean.round||null,lastActivity:clean.lastActivity||'flash',exam:clean.exam||null,soundEnabled:clean.soundEnabled||false,feedbackStreak:clean.feedbackStreak||0,mastery:clean.mastery||null,rewards:clean.rewards||null}};
}
export function parseStudyBackup(text) {
  const data=JSON.parse(text);
  if(data.format!=='pocket-study-backup')return null;
  if(data.version!==1)throw new Error('This backup version is not supported. Update Pocket before restoring it.');
  if(!data.progress||!Array.isArray(data.progress.known)||!Array.isArray(data.progress.learned))throw new Error('Backup is missing progress. Nothing has been restored.');
  return validateStudyState({title:data.title,cards:data.cards,known:data.progress.known,learned:data.progress.learned,round:data.progress.round,lastActivity:data.progress.lastActivity,exam:data.progress.exam,soundEnabled:data.progress.soundEnabled,feedbackStreak:data.progress.feedbackStreak,mastery:data.progress.mastery,rewards:data.progress.rewards});
}
