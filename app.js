import {makeQuestion, newRound, answerQuestion, advanceRound} from './learn.js';
import {parseCards} from './cards.js';
const $ = id => document.getElementById(id);
const storageKey = 'pocket-ethics-v1';
let state = {cards:[], known:[]}, mode = 'all', order = [], index = 0, flipped = false;
try { const saved = JSON.parse(localStorage.getItem(storageKey)); if(saved){state.cards=parseCards(JSON.stringify(saved.cards));state.known=Array.isArray(saved.known)?saved.known.filter(n=>Number.isInteger(n)&&n>=0&&n<state.cards.length):[];state.learned=saved.learned;const r=saved.round;if(r&&Array.isArray(r.queue)&&r.queue.every(id=>Number.isInteger(id)&&id>=0&&id<state.cards.length)&&Array.isArray(r.seen)&&['total','completed','attempts','firstCorrect'].every(k=>Number.isInteger(r[k])&&r[k]>=0)&&(!r.current||(typeof r.current.prompt==='string'&&typeof r.current.answer==='string'&&Array.isArray(r.current.options))))state.round=r;} } catch { /* Empty or unavailable storage: start clean. */ }
let activity = 'flash';
state.learned = Array.isArray(state.learned) ? state.learned.filter(id=>Number.isInteger(id)&&id>=0&&id<state.cards.length) : [];
function toast(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',3500);}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{toast('Storage unavailable. Export a backup to keep your cards.');}}
function rebuild(){order=state.cards.map((_,i)=>i).filter(i=>mode==='all'||!state.known.includes(i));index=0;flipped=false;render();}
function render(){
 const id=order[index], card=state.cards[id], count=state.known.length;
 $('total').textContent=state.cards.length;$('remaining').textContent=state.cards.length-count;
 $('mastery').textContent=`${count} mastered`;$('progress').style.width=`${state.cards.length?count/state.cards.length*100:0}%`;
 $('position').textContent=card?`CARD ${index+1} OF ${order.length}`:state.cards.length?'All caught up':'Ready when you are';
 $('side').textContent=card?(flipped?'DEFINITION':'TERM'):state.cards.length?'WELL DONE':'LET’S GET STARTED';
 $('card-text').textContent=card?(flipped?card.definition:card.term):state.cards.length?'A little practice goes a long way.':'Your next study session\nstarts here.';
 $('flip-hint').textContent=card?(flipped?'How well did you remember?':'Tap anywhere to reveal'):state.cards.length?'Switch to All cards to study again':'Import your cards to begin';
 $('card').classList.toggle('answer',flipped);$('card').classList.toggle('long',!!card&&(flipped?card.definition:card.term).length>220);$('answer-actions').hidden=!card||!flipped;
 $('card').setAttribute('aria-label',card?`${flipped?'Definition':'Term'}: ${flipped?card.definition:card.term}. Tap to flip.`:'Import cards to begin');
 $('prev').disabled=order.length<2;$('next').disabled=order.length<2;$('shuffle').disabled=order.length<2;
 $('all').classList.toggle('active',mode==='all');$('review').classList.toggle('active',mode==='review');
 $('all').setAttribute('aria-pressed',mode==='all');$('review').setAttribute('aria-pressed',mode==='review');
}
function move(step){if(!order.length)return;index=(index+step+order.length)%order.length;flipped=false;render();}
$('card').onclick=()=>{if(order.length){flipped=!flipped;render();}else if(!state.cards.length)$('import-dialog').showModal();};
$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);
$('all').onclick=()=>{mode='all';rebuild();};$('review').onclick=()=>{mode='review';rebuild();};
$('shuffle').onclick=()=>{for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}index=0;flipped=false;render();toast('Cards shuffled');};
$('known').onclick=()=>{const id=order[index];if(!state.known.includes(id))state.known.push(id);save();if(mode==='review'){order.splice(index,1);if(index>=order.length)index=0;flipped=false;render();}else move(1);};
$('again').onclick=()=>{state.known=state.known.filter(n=>n!==order[index]);save();move(1);};
$('manage').onclick=()=>$('import-dialog').showModal();
$('import').onclick=()=>{try{const cards=parseCards($('import-text').value);if(state.cards.length&&!confirm('Replace your current cards and reset study progress? Export a backup first if needed.'))return;state={cards,known:[],learned:[]};activity='flash';setActivity('flash');save();mode='all';rebuild();$('import-dialog').close();$('import-status').textContent='';toast(`${cards.length} cards imported`);}catch(e){$('import-status').textContent=e.message;}};
$('import-file').onchange=async event=>{const file=event.target.files[0];if(file){$('import-text').value=await file.text();$('import-status').textContent='File loaded. Press Import cards to continue.';}};
$('export').onclick=()=>{if(!state.cards.length){$('import-status').textContent='Import cards before exporting a backup.';return;}const url=URL.createObjectURL(new Blob([JSON.stringify({title:'Computer Ethics Final',cards:state.cards},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='computer-ethics-cards.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
document.addEventListener('keydown',e=>{if(activity==='learn'||$('import-dialog').open||['INPUT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();$('card').click();}if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1);});
if(!state.cards.length){try{const response=await fetch('./deck.json');if(!response.ok)throw new Error('Deck unavailable');state.cards=parseCards(await response.text());save();}catch{toast('Could not load the included deck. Use Manage cards to import a backup.');}}
rebuild();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{$('offline-status').textContent='Ready for offline study';}).catch(()=>{$('offline-status').textContent='Offline cache unavailable · export a backup';});}

function setActivity(value){
 activity=value;
 $('flash-panel').hidden=value!=='flash';$('learn-panel').hidden=value!=='learn';
 for(const [id,active] of [['flash-mode',value==='flash'],['learn-mode',value==='learn']]){ $(id).classList.toggle('active',active);$(id).setAttribute('aria-pressed',active); }
 if(value==='learn'){if(!state.round)state.round=newRound(state.cards,state.learned);renderLearn();}
}
function renderLearn(){
 const round=state.round;
 if(!round)return;
 const finished=!round.queue.length;
 $('learn-question-panel').hidden=finished;$('learn-summary').hidden=!finished;
 $('learn-count').textContent=`${round.completed} / ${round.total} cards learned`;
 $('learn-score').textContent=`${state.learned.length} / ${state.cards.length} overall`;
 $('learn-progress').style.width=`${round.total?round.completed/round.total*100:0}%`;
 if(finished){
  const allDone=state.learned.length===state.cards.length;
  $('summary-title').textContent=!state.cards.length?'Import cards to start learning':allDone?'You’ve practiced the whole collection!':'Round complete. Nicely done.';
  $('summary-detail').textContent=round.total?`${round.firstCorrect} of ${round.total} correct on the first try (${Math.round(round.firstCorrect/round.total*100)}%). ${round.attempts} total attempts. Every card in this round is now answered correctly.`:'Your next study session is ready when you are.';
  $('next-round').textContent=allDone?'Practice the collection again':'Next round →';$('next-round').disabled=!state.cards.length;
  return;
 }
 if(!round.current)round.current=makeQuestion(state.cards,round.queue[0]);
 const q=round.current, feedback=round.feedback;
 $('learn-kind').textContent=q.options.length===2?'TRUE OR FALSE':'CHOOSE ONE ANSWER';
 $('learn-question').textContent=q.prompt;
 $('learn-options').replaceChildren();
 q.options.forEach((option,i)=>{
  const button=document.createElement('button');button.className='learn-option';
  const letter=document.createElement('span');letter.className='option-letter';letter.textContent=String.fromCharCode(65+i);
  const text=document.createElement('span');text.textContent=option;button.append(letter,text);
  button.disabled=!!feedback;
  if(feedback){if(option===q.answer){button.classList.add('correct');button.append(document.createTextNode(' ✓ Correct'));}else if(option===feedback.choice){button.classList.add('incorrect');button.append(document.createTextNode(' ✕ Your answer'));}}
  button.onclick=()=>{if(answerQuestion(round,option)){save();renderLearn();$('learn-next').focus({preventScroll:true});}};
  $('learn-options').append(button);
 });
 $('learn-feedback').textContent=feedback?(feedback.correct?'Correct! You’re making progress.':`Not quite. Correct answer: ${q.answer}. You’ll see this card again.`):'';
 $('learn-feedback').className=feedback?(feedback.correct?'feedback-correct':'feedback-incorrect'):'';
 $('learn-next').hidden=!feedback;
 save();
}
$('flash-mode').onclick=()=>setActivity('flash');$('learn-mode').onclick=()=>setActivity('learn');
$('learn-next').onclick=()=>{const learned=advanceRound(state.round);if(learned!==null&&!state.learned.includes(learned))state.learned.push(learned);save();renderLearn();$('learn-question').focus({preventScroll:true});};
$('learn-question').tabIndex=-1;
$('restart-learn').onclick=()=>{if(confirm('Restart this round? Your previously learned cards will stay saved.')){state.round=newRound(state.cards,state.learned);save();renderLearn();}};
$('next-round').onclick=()=>{if(state.learned.length===state.cards.length)state.learned=[];state.round=newRound(state.cards,state.learned);save();renderLearn();};
