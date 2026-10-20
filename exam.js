import {makeQuestion,shuffle,isLearnAnswerCorrect,isAnswerProvided} from './learn.js';
import {flashcardLayout} from './flashcards.js';
export function examSize(cards){return Math.min(50,cards.length);}
const examCardKind=card=>card.type==='multi'?'multi':/^(t|f|true|false)$/i.test(card.definition.trim())?'boolean':'choice';
function selectExamCards(cards,random){
 const size=examSize(cards),groups=['choice','boolean','multi'].map(kind=>cards.flatMap((card,id)=>examCardKind(card)===kind?[id]:[])).filter(group=>group.length);
 // Proportional sampling keeps a representative mix, including rare formats.
 const counts=groups.map(group=>Math.floor(size*group.length/cards.length));
 const remainders=groups.map((group,id)=>({id,remainder:size*group.length/cards.length-counts[id]})).sort((a,b)=>b.remainder-a.remainder);
 for(let i=0,remaining=size-counts.reduce((sum,count)=>sum+count,0);i<remaining;i++)counts[remainders[i].id]++;
 if(size>=groups.length)counts.forEach((count,id)=>{if(!count){const donor=counts.indexOf(Math.max(...counts));counts[donor]--;counts[id]++;}});
 return shuffle(groups.flatMap((group,id)=>shuffle(group,random).slice(0,counts[id])),random);
}
function makeExamQuestion(cards,cardId,random){
 const q=makeQuestion(cards,cardId,random),card=cards[cardId];
 if(examCardKind(card)==='choice'){
  const layout=flashcardLayout(card),code=layout.answerLines[0]?.code;
  // Prefer the question's own distractors to unrelated answer keys. Positional
  // choices such as "all of the above" must retain their original interpretation.
  const positional=/\b(?:all|none|both|neither)\s+(?:of\s+)?(?:the\s+)?(?:above|below|listed|options|answers)\b|\b(?:first|second|third|last)\s+(?:listed\s+)?option\b|\b[A-D]\s+(?:and|or)\s+[A-D]\b/i;
  if(code&&layout.options.some(option=>positional.test(option)))q.prompt=card.term;
  if(code&&layout.options.length>=2&&!layout.options.some(option=>positional.test(option))){
   const correctIndex=code.charCodeAt(0)-65,normalize=text=>text.toLowerCase().replace(/[^a-z0-9]/g,'');
   const seen=new Set([normalize(q.answer)]);
   const distractors=shuffle(layout.options.filter((_,i)=>i!==correctIndex),random).filter(option=>{const key=normalize(option);if(!key||seen.has(key))return false;seen.add(key);return true;}).slice(0,3);
   if(distractors.length){q.prompt=layout.prompt;q.answer=layout.options[correctIndex];q.options=[q.answer,...distractors];}
  }
 }
 return {...q,cardId,type:q.type==='multi'?'multi':q.options.length<2?'written':'choice',options:shuffle(q.options,random)};
}
export function createExam(cards,random=Math.random,now=new Date()){
 if(!cards.length)throw new Error('Import a study set before starting an exam.');
 const questions=selectExamCards(cards,random).map(cardId=>makeExamQuestion(cards,cardId,random));
 return {questions,answers:questions.map(()=>null),flagged:[],cursor:0,startedAt:now.toISOString(),submittedAt:null};
}
export function setExamAnswer(exam,index,answer){
 if(exam.submittedAt||!Number.isInteger(index)||index<0||index>=exam.questions.length)return false;
 const q=exam.questions[index];
 if(answer!==null){
  if(q.type==='multi'){
   if(!Array.isArray(answer)||new Set(answer).size!==answer.length||answer.some(option=>!q.options.includes(option)))return false;
  }else if(typeof answer!=='string'||(q.type!=='written'&&!q.options.includes(answer)))return false;
 }
 exam.answers[index]=Array.isArray(answer)?[...answer]:answer;return true;
}
export function scoreExam(exam){
 const rows=exam.questions.map((q,i)=>({index:i,cardId:q.cardId,prompt:q.prompt,answer:q.answer,chosen:Array.isArray(exam.answers[i])?[...exam.answers[i]]:exam.answers[i],correct:isLearnAnswerCorrect(q,exam.answers[i])}));
 const correct=rows.filter(r=>r.correct).length,unanswered=exam.questions.filter((q,i)=>!isAnswerProvided(q,exam.answers[i])).length,total=rows.length;
 return {rows,total,correct,unanswered,incorrect:total-correct-unanswered,percent:total?Math.round(correct/total*100):0};
}
export function submitExam(exam,now=new Date()){
 if(!exam.submittedAt)exam.submittedAt=now.toISOString();return scoreExam(exam);
}
export function validateExam(value,cards){
 if(!value||!Array.isArray(value.questions)||![examSize(cards),cards.length].includes(value.questions.length)||!value.questions.length||!Array.isArray(value.answers)||value.answers.length!==value.questions.length)throw new Error('Invalid saved exam.');
 const e=JSON.parse(JSON.stringify(value)),ids=new Set();
 e.questions.forEach((q,i)=>{
  if(!q||!Number.isInteger(q.cardId)||q.cardId<0||q.cardId>=cards.length||ids.has(q.cardId)||typeof q.prompt!=='string'||typeof q.answer!=='string'||!['written','choice','multi'].includes(q.type)||!Array.isArray(q.options)||!q.options.length||q.options.some(o=>typeof o!=='string'||!o.trim())||new Set(q.options).size!==q.options.length)throw new Error('Invalid saved exam question or answer.');
  const card=cards[q.cardId],answer=e.answers[i];
  if(q.type==='multi'){
   if(card.type!=='multi'||!Array.isArray(q.answers)||q.answers.length<2||new Set(q.answers).size!==q.answers.length||q.answers.some(option=>typeof option!=='string'||!q.options.includes(option))||q.answer!==card.definition||q.answers.length!==card.answers.length||q.answers.some(option=>!card.answers.includes(option))||(answer!==null&&(!Array.isArray(answer)||new Set(answer).size!==answer.length||answer.some(option=>!q.options.includes(option)))))throw new Error('Invalid saved select-all exam answer.');
  }else if(card.type==='multi'||(q.type==='choice'&&(q.options.length<2||!q.options.includes(q.answer)))||(answer!==null&&(typeof answer!=='string'||(q.type==='choice'&&!q.options.includes(answer)))))throw new Error('Invalid saved exam question or answer.');
  ids.add(q.cardId);
 });
 if(!Number.isInteger(e.cursor)||e.cursor<0||e.cursor>=e.questions.length||!Array.isArray(e.flagged)||e.flagged.some(i=>!Number.isInteger(i)||i<0||i>=e.questions.length)||new Set(e.flagged).size!==e.flagged.length||!Number.isFinite(Date.parse(e.startedAt))||(e.submittedAt!==null&&(!Number.isFinite(Date.parse(e.submittedAt))||Date.parse(e.submittedAt)<Date.parse(e.startedAt))))throw new Error('Invalid saved exam progress.');
 return e;
}
