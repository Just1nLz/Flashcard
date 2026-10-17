import {makeQuestion,shuffle} from './learn.js';
export function createExam(cards,random=Math.random,now=new Date()){
 if(!cards.length)throw new Error('Import a study set before starting an exam.');
 return {questions:shuffle(cards.map((_,id)=>id),random).map(cardId=>{const q=makeQuestion(cards,cardId,random);return {...q,cardId,type:q.options.length<2?'written':'choice'};}),answers:cards.map(()=>null),flagged:[],cursor:0,startedAt:now.toISOString(),submittedAt:null};
}
export function setExamAnswer(exam,index,answer){
 if(exam.submittedAt||!Number.isInteger(index)||index<0||index>=exam.questions.length)return false;
 const q=exam.questions[index];if(answer!==null&&(typeof answer!=='string'||(q.type!=='written'&&!q.options.includes(answer))))return false;
 exam.answers[index]=answer;return true;
}
const normalizeWritten=text=>text.trim().toLowerCase().replace(/\s+/g,' ').replace(/[.!?]+$/,'');
export function scoreExam(exam){
 const rows=exam.questions.map((q,i)=>({index:i,cardId:q.cardId,prompt:q.prompt,answer:q.answer,chosen:exam.answers[i],correct:typeof exam.answers[i]==='string'&&(q.type==='written'?normalizeWritten(exam.answers[i])===normalizeWritten(q.answer):exam.answers[i]===q.answer)}));
 const correct=rows.filter(r=>r.correct).length,unanswered=rows.filter(r=>r.chosen===null||!r.chosen.trim()).length,total=rows.length;
 return {rows,total,correct,unanswered,incorrect:total-correct-unanswered,percent:total?Math.round(correct/total*100):0};
}
export function submitExam(exam,now=new Date()){
 if(!exam.submittedAt)exam.submittedAt=now.toISOString();return scoreExam(exam);
}
export function validateExam(value,cards){
 if(!value||!Array.isArray(value.questions)||value.questions.length!==cards.length||!Array.isArray(value.answers)||value.answers.length!==value.questions.length)throw new Error('Invalid saved exam.');
 const e=JSON.parse(JSON.stringify(value)),ids=new Set();
 e.questions.forEach((q,i)=>{if(!Number.isInteger(q.cardId)||q.cardId<0||q.cardId>=cards.length||ids.has(q.cardId)||typeof q.prompt!=='string'||typeof q.answer!=='string'||!['written','choice'].includes(q.type)||!Array.isArray(q.options)||q.options.some(o=>typeof o!=='string')||(q.type==='choice'&&(q.options.length<2||new Set(q.options).size!==q.options.length||!q.options.includes(q.answer)))||(e.answers[i]!==null&&(typeof e.answers[i]!=='string'||(q.type==='choice'&&!q.options.includes(e.answers[i])))))throw new Error('Invalid saved exam question or answer.');ids.add(q.cardId);});
 if(!Number.isInteger(e.cursor)||e.cursor<0||e.cursor>=cards.length||!Array.isArray(e.flagged)||e.flagged.some(i=>!Number.isInteger(i)||i<0||i>=cards.length)||new Set(e.flagged).size!==e.flagged.length||!Number.isFinite(Date.parse(e.startedAt))||(e.submittedAt!==null&&(!Number.isFinite(Date.parse(e.submittedAt))||Date.parse(e.submittedAt)<Date.parse(e.startedAt))))throw new Error('Invalid saved exam progress.');
 return e;
}
