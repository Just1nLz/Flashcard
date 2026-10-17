import {MASTERY_TARGET,initializeMastery,recordMastery,masterySummary,newMasteryRound} from './mastery.js';
import {createExam,setExamAnswer,scoreExam,submitExam,validateExam} from './exam.js';
import {createStudyBackup, parseStudyBackup, validateStudyState} from './backup.js';
import {parsePdfPages} from './pdf-layout.js';
import {makeQuestion, answerQuestion, advanceRound} from './learn.js';
import {parseCards} from './cards.js';
const $ = id => document.getElementById(id);
const storageKey = 'pocket-ethics-v1';
const recoveryKey=storageKey+'-recovery';
let recoveryAvailable=false;
function keepRecovery(reason,onlyIfMissing=false){try{const data=localStorage.getItem(storageKey);if(data&&(!onlyIfMissing||!localStorage.getItem(recoveryKey))){localStorage.setItem(recoveryKey,JSON.stringify({createdAt:new Date().toISOString(),reason,data}));}recoveryAvailable=!!localStorage.getItem(recoveryKey);}catch{}}
keepRecovery('Before app update',true);
let toastLater='';
let state = {cards:[], known:[]}, mode = 'all', order = [], index = 0, flipped = false;
try { const saved = JSON.parse(localStorage.getItem(storageKey)); if(saved){state.cards=parseCards(JSON.stringify(saved.cards));state.known=Array.isArray(saved.known)?saved.known.filter(n=>Number.isInteger(n)&&n>=0&&n<state.cards.length):[];state.lastActivity=saved.lastActivity;state.soundEnabled=saved.soundEnabled===true;state.feedbackStreak=Number.isInteger(saved.feedbackStreak)?saved.feedbackStreak:0;if(saved.exam){try{state.exam=validateExam(saved.exam,state.cards);}catch{toastLater='Saved exam could not be loaded; your other study progress is intact.';}}state.title=typeof saved.title==='string'?saved.title:'Computer Ethics';state.learned=saved.learned;state.mastery=saved.mastery;const r=saved.round;if(r&&Array.isArray(r.queue)&&r.queue.every(id=>Number.isInteger(id)&&id>=0&&id<state.cards.length)&&Array.isArray(r.seen)&&['total','completed','attempts','firstCorrect'].every(k=>Number.isInteger(r[k])&&r[k]>=0)&&(!r.current||(typeof r.current.prompt==='string'&&typeof r.current.answer==='string'&&Array.isArray(r.current.options))))state.round=r;} } catch { /* Empty or unavailable storage: start clean. */ }
state.title ||= 'Computer Ethics';
let activity = 'flash';
state.learned = Array.isArray(state.learned) ? state.learned.filter(id=>Number.isInteger(id)&&id>=0&&id<state.cards.length) : [];
try{state.mastery=initializeMastery(state);}catch{state.mastery=initializeMastery({...state,mastery:null});toastLater='Mastery counters could not be read; your previous study history is kept.';}
if(state.cards.length)save();
function toast(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',3500);}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{toast('Storage unavailable. Export a backup to keep your cards.');}}
function rebuild(){order=state.cards.map((_,i)=>i).filter(i=>mode==='all'||!state.known.includes(i));index=0;flipped=false;render();}
function render(){
 $('deck-title').textContent=state.title;document.title=`Pocket • ${state.title}`;
 const id=order[index], card=state.cards[id], count=state.known.length;
 $('card-mastery').textContent=card?`Learn mastery: ${state.mastery.cards[id].streak}/${MASTERY_TARGET}${state.mastery.cards[id].streak>=MASTERY_TARGET?' · mastered':''}`:'';
 $('total').textContent=state.cards.length;$('remaining').textContent=state.cards.length-count;
 $('mastery').textContent=`${count} marked familiar`;$('progress').style.width=`${state.cards.length?count/state.cards.length*100:0}%`;
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
let importGeneration=0, reviewedText='', reviewedBackup=null;
function invalidatePreview(){reviewedText='';reviewedBackup=null;$('backup-preview').hidden=true;$('import').textContent='Use these cards';$('import-preview').hidden=true;$('confirm-review').checked=false;$('import').disabled=true;}
function reviewImport(){
 let backup=null;try{backup=parseStudyBackup($('import-text').value);}catch(e){if($('import-text').value.trim().startsWith('{'))throw e;}
 const cards=backup?backup.cards:parseCards($('import-text').value);if(cards.length>2000)throw new Error('Import up to 2,000 cards at a time.');
 reviewedBackup=backup;$('import').textContent=backup?'Restore cards & progress':'Use these cards';$('backup-preview').hidden=!backup;$('backup-preview').textContent=backup?`Full backup: ${backup.known.length} marked familiar, ${backup.learned.length} previously learned${backup.mastery?`, ${masterySummary(backup.mastery).mastered} verified mastered`:''}${backup.round?`, round ${backup.round.completed}/${backup.round.total} cards complete (${backup.round.attempts} attempts)`:''}${backup.exam?`, saved exam (${backup.exam.submittedAt?'submitted':backup.exam.answers.filter(a=>typeof a==='string'&&a.trim()).length+' answered'})`:''}. Your cards and progress will be restored together.`:'';
 reviewedText=$('import-text').value;$('preview-count').textContent=`Review all ${cards.length} cards`;$('preview-cards').replaceChildren();
 cards.forEach((card,i)=>{const item=document.createElement('article');const question=document.createElement('strong');question.textContent=`${i+1}. ${card.term}`;const answer=document.createElement('p');answer.textContent=card.definition;item.append(question,answer);$('preview-cards').append(item);});
 $('import-preview').hidden=false;$('confirm-review').checked=false;$('import').disabled=true;
 return cards;
}
$('manage').onclick=()=>{$('set-title').value=state.title;$('restore-recovery').hidden=!recoveryAvailable;$('import-dialog').showModal();};
$('import-text').oninput=()=>{importGeneration++;invalidatePreview();};
$('preview-import').onclick=()=>{try{const cards=reviewImport();$('import-status').textContent=`${cards.length} pairs found. Review below, then check the confirmation box.`;}catch(e){invalidatePreview();$('import-status').textContent=e.message;}};
$('confirm-review').onchange=()=>{$('import').disabled=!$('confirm-review').checked||reviewedText!==$('import-text').value;};
$('import').onclick=()=>{try{
 if(!$('confirm-review').checked||reviewedText!==$('import-text').value)throw new Error('Review the cards and confirm the question / answer pairs first.');
 const cards=parseCards(reviewedText), backup=reviewedBackup;if(state.cards.length&&!confirm(backup?'Restore this backup, replacing this device’s current cards and progress?':'Replace your current cards and reset study progress? Export a full backup first if needed.'))return;
 keepRecovery('Before restoring backup or replacing set');state=backup||{title:$('set-title').value.trim()||'My study set',cards,known:[],learned:[]};if(backup)state.title=$('set-title').value.trim()||state.title;state.mastery=initializeMastery(state);mode='all';rebuild();setActivity(['learn','exam'].includes(backup?.lastActivity)?backup.lastActivity:'flash');save();$('import-dialog').close();$('import-status').textContent='';invalidatePreview();toast(backup?'Cards and study progress restored':`${cards.length} cards imported`);
 }catch(e){$('import-status').textContent=e.message;}};
$('import-file').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;const generation=++importGeneration;invalidatePreview();
 try{if(file.size>10*1024*1024)throw new Error('Choose a text / JSON file smaller than 10 MB.');const text=await file.text();if(generation!==importGeneration)return;$('import-text').value=text;let title=file.name.replace(/\.[^.]+$/,'');try{const data=JSON.parse(text);if(typeof data.title==='string')title=data.title;}catch{}$('set-title').value=title.slice(0,120);const cards=reviewImport();$('import-status').textContent=reviewedBackup?'Full study backup loaded. Review and confirm to restore cards and progress.':`${cards.length} pairs loaded. Review and confirm before importing.`;}catch(e){if(generation===importGeneration)$('import-status').textContent=e.message;}finally{event.target.value='';}
};
$('pdf-file').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;const generation=++importGeneration;invalidatePreview();$('pdf-file').disabled=true;$('import-status').textContent='Reading PDF on your device…';
 try{
  const pages=await PocketPDF.readPdf(file,message=>{if(generation===importGeneration)$('import-status').textContent=message;});
  if(generation!==importGeneration)return;
  const result=parsePdfPages(pages);const title=file.name.replace(/\.pdf$/i,'').slice(0,120);
  $('set-title').value=title;$('import-text').value=JSON.stringify({title,cards:result.cards},null,2);reviewImport();
  $('import-status').textContent=`${result.cards.length} pairs extracted (${result.format}). Review every question and answer before importing. ${result.warnings.join(' ')}`;
 }catch(e){if(generation===importGeneration){invalidatePreview();$('import-status').textContent=`PDF not imported: ${e.message}`;}}
 finally{$('pdf-file').disabled=false;event.target.value='';}
};
function exportCards(){if(!state.cards.length){$('import-status').textContent='Import cards before exporting a backup.';return false;}return true;}
$('export').onclick=()=>{if(!exportCards())return;const url=URL.createObjectURL(new Blob([JSON.stringify({title:state.title,cards:state.cards},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=(state.title.replace(/[^a-z0-9_-]+/gi,'-')||'study-set')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('export-progress').onclick=()=>{
 try{const backup=createStudyBackup(state);const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pocket-full-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('import-status').textContent='Full backup downloaded: cards, mastery, learned cards, unfinished Learn round, and saved exam. Save it to Files or iCloud Drive.';}catch(e){$('import-status').textContent=`Could not export backup: ${e.message}`;}
};
$('restore-recovery').onclick=()=>{
 try{const saved=JSON.parse(localStorage.getItem(recoveryKey));if(!saved)throw new Error('No local recovery snapshot is available.');const restored=validateStudyState(JSON.parse(saved.data));if(!confirm(`Restore the local snapshot from ${new Date(saved.createdAt).toLocaleString()}? This replaces your current cards and progress.`))return;keepRecovery('Before local recovery');state=restored;state.mastery=initializeMastery(state);mode='all';rebuild();setActivity(['learn','exam'].includes(state.lastActivity)?state.lastActivity:'flash');save();invalidatePreview();$('import-dialog').close();toast('Local cards and progress recovered');}catch(e){$('import-status').textContent=`Recovery failed: ${e.message}`;}
};
$('export-pdf').onclick=()=>{
 if(!exportCards())return;const popup=window.open('','_blank');if(!popup){$('import-status').textContent='Allow pop-ups for this site to open the printable PDF view.';return;}
 const doc=popup.document;doc.title=state.title;const style=doc.createElement('style');style.textContent='body{font:14px/1.6 system-ui,sans-serif;margin:32px;color:#111}h1{font-size:24px}article{margin-bottom:24px;border-bottom:1px solid #bbb;padding-bottom:15px;white-space:pre-wrap;overflow-wrap:anywhere}p{margin:6px 0}@media print{button,.print-help{display:none}article{break-inside:avoid}body{margin:12mm}}';doc.head.append(style);
 const heading=doc.createElement('h1');heading.textContent=state.title;doc.body.append(heading);const help=doc.createElement('p');help.className='print-help';help.textContent='Choose Print, then Save as PDF. On iPhone, use the print preview Share menu to Save to Files. This Question: / Answer: format can be imported again.';doc.body.append(help);const print=doc.createElement('button');print.textContent='Print / Save as PDF';print.onclick=()=>popup.print();doc.body.append(print);
 state.cards.forEach((card,i)=>{const article=doc.createElement('article');const q=doc.createElement('p');q.textContent=`Question: ${card.term}`;const a=doc.createElement('p');a.textContent=`Answer: ${card.definition}`;article.append(q,a);doc.body.append(article);});popup.focus();
};
document.addEventListener('keydown',e=>{if(activity!=='flash'||$('import-dialog').open||['INPUT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();$('card').click();}if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1);});
if(!state.cards.length){try{const response=await fetch('./deck.json');if(!response.ok)throw new Error('Deck unavailable');state.cards=parseCards(await response.text());state.mastery=initializeMastery({...state,mastery:null});save();}catch{toast('Could not load the included deck. Use Manage cards to import a backup.');}}
rebuild();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{$('offline-status').textContent='Ready for offline study';}).catch(()=>{$('offline-status').textContent='Offline cache unavailable · export a backup';});}

function setActivity(value){
 activity=value;state.lastActivity=value;save();
 $('flash-panel').hidden=value!=='flash';$('learn-panel').hidden=value!=='learn';$('exam-panel').hidden=value!=='exam';
 for(const [id,active] of [['flash-mode',value==='flash'],['learn-mode',value==='learn'],['exam-mode',value==='exam']]){ $(id).classList.toggle('active',active);$(id).setAttribute('aria-pressed',active); }
 if(value==='learn'){if(!state.round)state.round=newMasteryRound(state.cards,state.mastery);renderLearn();}
 if(value==='exam')renderExam();
}
function renderLearn(){
 const round=state.round;
 $('sound-toggle').textContent=state.soundEnabled?'Sound: on':'Sound: off';$('sound-toggle').setAttribute('aria-pressed',!!state.soundEnabled);$('learn-streak').textContent=state.feedbackStreak>1?`${state.feedbackStreak} correct across cards`:'';
 if(!round)return;
 const finished=!round.queue.length;
 $('learn-question-panel').hidden=finished;$('learn-summary').hidden=!finished;
 renderMasteryOverview();
 $('learn-count').textContent=`${round.completed} / ${round.total} practiced this round`;
 $('learn-score').textContent=`${masterySummary(state.mastery).mastered} / ${state.cards.length} mastered`;
 $('learn-progress').style.width=`${round.total?round.completed/round.total*100:0}%`;
 if(finished){
  const allDone=masterySummary(state.mastery).mastered===state.cards.length;
  $('summary-title').textContent=!state.cards.length?'Import cards to start learning':allDone?'Every card meets the mastery standard!':'Round complete. Keep building mastery.';
  $('summary-detail').textContent=round.total?`${round.firstCorrect} of ${round.total} correct on the first try (${Math.round(round.firstCorrect/round.total*100)}%). ${round.attempts} total attempts. ${round.seen.filter(id=>state.mastery.cards[id].streak>=MASTERY_TARGET).length} of this round’s cards now meet the 3-in-a-row mastery standard. Other cards will return in later rounds.`:'Your next study session is ready when you are.';
  $('next-round').textContent=allDone?'Review mastered cards':'Next mastery round →';$('next-round').disabled=!state.cards.length;
  return;
 }
 if(!round.current)round.current=makeQuestion(state.cards,round.queue[0]);
 const q=round.current, feedback=round.feedback;
 const cardProgress=state.mastery.cards[round.queue[0]];$('learn-card-mastery').textContent=`THIS CARD: ${cardProgress.streak}/${MASTERY_TARGET} consecutive correct${cardProgress.streak>=MASTERY_TARGET?' · MASTERED':''}`;
 if(!feedback)$('learn-question-panel').classList.remove('celebrate-answer','retry-answer');
 const written=q.type==='written'||q.options.length<2;
 $('learn-written-label').hidden=!written||!!feedback;$('learn-check').hidden=!written||!!feedback;
 $('learn-kind').textContent=written?'WRITE YOUR ANSWER':q.options.length===2&&q.options.includes('True')&&q.options.includes('False')?'TRUE OR FALSE':'CHOOSE ONE ANSWER';
 $('learn-question').textContent=q.prompt;
 $('learn-options').replaceChildren();
 if(!written)q.options.forEach((option,i)=>{
  const button=document.createElement('button');button.className='learn-option';
  const letter=document.createElement('span');letter.className='option-letter';letter.textContent=String.fromCharCode(65+i);
  const text=document.createElement('span');text.textContent=option;button.append(letter,text);
  button.disabled=!!feedback;
  if(feedback){if(option===q.answer){button.classList.add('correct');const badge=document.createElement('strong');badge.className='answer-badge';badge.textContent='✓ CORRECT ANSWER';button.append(badge);}else if(option===feedback.choice){button.classList.add('incorrect');const badge=document.createElement('strong');badge.className='answer-badge';badge.textContent='✕ YOUR ANSWER';button.append(badge);}}
  button.onclick=()=>submitLearnChoice(option);
  $('learn-options').append(button);
 });
 $('learn-question-panel').classList.toggle('result-correct',!!feedback?.correct);
 $('learn-question-panel').classList.toggle('result-incorrect',!!feedback&&!feedback.correct);
 $('learn-feedback').replaceChildren();
 if(feedback){
  const icon=document.createElement('span');icon.className='result-icon';icon.textContent=feedback.correct?'✓':'✕';icon.setAttribute('aria-hidden','true');
  const content=document.createElement('div');const heading=document.createElement('strong');heading.className='result-heading';heading.textContent=feedback.correct?'Correct — you’ve got it!':'Not quite — let’s make it stick.';
  const label=document.createElement('p');label.className='result-label';label.textContent='REMEMBER THIS ANSWER';
  const answer=document.createElement('p');answer.className='memory-answer';answer.textContent=q.answer;
  const cue=document.createElement('p');cue.className='memory-cue';cue.textContent=feedback.correct?(cardProgress.streak>=MASTERY_TARGET?'3 correct in a row for this card — mastery reached. You can still review it.':`${cardProgress.streak}/3 correct in a row for this card. It will return in a later round until you reach 3/3.`):'This card’s streak reset to 0/3. Read the answer aloud; it will return later in this round, then in future rounds until mastered.';
  content.append(heading,label,answer,cue);$('learn-feedback').append(icon,content);
 }
 $('learn-feedback').className=feedback?(feedback.correct?'feedback-correct':'feedback-incorrect'):'';
 $('learn-next').hidden=!feedback;
 save();
}
$('flash-mode').onclick=()=>setActivity('flash');$('learn-mode').onclick=()=>setActivity('learn');
$('learn-next').onclick=()=>{$('learn-written').value='';const learned=advanceRound(state.round);if(learned!==null&&!state.learned.includes(learned))state.learned.push(learned);save();renderLearn();$('learn-question').focus({preventScroll:true});};
$('learn-question').tabIndex=-1;
$('restart-learn').onclick=()=>{if(confirm('Restart this round? Per-card mastery streaks and previous progress will stay saved.')){state.round=newMasteryRound(state.cards,state.mastery);save();renderLearn();}};
$('next-round').onclick=()=>{state.round=newMasteryRound(state.cards,state.mastery);save();renderLearn();};

if(['learn','exam'].includes(state.lastActivity))setActivity(state.lastActivity);
if(toastLater)toast(toastLater);

let answerAudio;
function playAnswerSound(correct){
 if(!state.soundEnabled)return;
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;answerAudio ||= new Audio();answerAudio.resume().catch(()=>{});const start=answerAudio.currentTime;const tones=correct?[523,659,784]:[220,165];tones.forEach((frequency,i)=>{const oscillator=answerAudio.createOscillator(),gain=answerAudio.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start+i*.09);gain.gain.linearRampToValueAtTime(.09,start+i*.09+.015);gain.gain.exponentialRampToValueAtTime(.001,start+i*.09+.16);oscillator.connect(gain);gain.connect(answerAudio.destination);oscillator.start(start+i*.09);oscillator.stop(start+i*.09+.18);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});}catch{/* Visual feedback stays available when audio is unsupported. */}
}
function animateLearnResult(correct){
 const panel=$('learn-question-panel');panel.classList.remove('celebrate-answer','retry-answer');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 void panel.offsetWidth;panel.classList.add(correct?'celebrate-answer':'retry-answer');
 clearTimeout(animateLearnResult.timer);animateLearnResult.timer=setTimeout(()=>panel.classList.remove('celebrate-answer','retry-answer'),900);
}
$('sound-toggle').onclick=()=>{state.soundEnabled=!state.soundEnabled;save();renderLearn();if(state.soundEnabled)playAnswerSound(true);};
$('exam-mode').onclick=()=>setActivity('exam');
function beginExam(){
 if(state.exam&&!confirm('Start a fresh full-set exam? This replaces the saved exam only. Your Learn and flashcard progress will stay.'))return;
 try{state.exam=createExam(state.cards);save();renderExam();$('exam-question').focus({preventScroll:true});}catch(e){toast(e.message);}
}
$('start-exam').onclick=beginExam;$('retake-exam').onclick=beginExam;$('discard-exam').onclick=beginExam;
function renderExam(){
 const exam=state.exam;
 $('exam-set-size').textContent=`${state.cards.length} questions · no time limit · answers revealed after submission`;
 $('start-exam').disabled=!state.cards.length;
 $('exam-start').hidden=!!exam;$('exam-taking').hidden=!exam||!!exam.submittedAt;$('exam-results').hidden=!exam?.submittedAt;
 if(!exam)return;
 if(exam.submittedAt){renderExamResults();return;}
 const i=exam.cursor,q=exam.questions[i],selected=exam.answers[i];
 const answered=exam.answers.filter(a=>typeof a==='string'&&a.trim()).length;
 $('exam-position').textContent=`QUESTION ${i+1} OF ${exam.questions.length}`;
 $('exam-count').textContent=`${answered} answered · ${exam.flagged.length} flagged`;
 $('exam-progress').style.width=`${answered/exam.questions.length*100}%`;
 $('exam-kind').textContent=q.type==='written'?'WRITE YOUR ANSWER':q.options.length===2&&q.options.includes('True')&&q.options.includes('False')?'TRUE OR FALSE':'CHOOSE ONE ANSWER';
 $('exam-question').textContent=q.prompt;$('exam-options').replaceChildren();
 $('exam-written-label').hidden=q.type!=='written';$('exam-written').value=selected||'';
 if(q.type==='choice')q.options.forEach((option,n)=>{const button=document.createElement('button');button.type='button';button.className='learn-option exam-option';button.classList.toggle('selected',option===selected);button.setAttribute('aria-pressed',option===selected);const letter=document.createElement('span');letter.className='option-letter';letter.textContent=String.fromCharCode(65+n);const label=document.createElement('span');label.textContent=option;button.append(letter,label);if(option===selected){const badge=document.createElement('strong');badge.className='answer-badge';badge.textContent='● SELECTED';button.append(badge);}button.onclick=()=>{if(setExamAnswer(exam,i,option)){save();renderExam();}};$('exam-options').append(button);});
 $('exam-prev').disabled=i===0;$('exam-next').disabled=i===exam.questions.length-1;
 $('exam-clear').disabled=selected===null;
 const flagged=exam.flagged.includes(i);$('exam-flag').textContent=flagged?'⚑ Flagged':'Flag for review';$('exam-flag').setAttribute('aria-pressed',flagged);
 $('exam-map-summary').textContent=`Question navigator · ${answered}/${exam.questions.length} answered`;
 renderExamGrid();
}
function renderExamGrid(){
 const exam=state.exam;$('exam-grid').replaceChildren();
 exam.questions.forEach((q,i)=>{const button=document.createElement('button');const answered=typeof exam.answers[i]==='string'&&!!exam.answers[i].trim(),flagged=exam.flagged.includes(i);button.textContent=`${i+1}${flagged?' ⚑':answered?' ✓':''}`;button.className=answered?'map-answered':'';button.classList.toggle('map-current',exam.cursor===i);button.classList.toggle('map-flagged',flagged);button.setAttribute('aria-label',`Question ${i+1}, ${answered?'answered':'unanswered'}${flagged?', flagged':''}`);if(exam.cursor===i)button.setAttribute('aria-current','step');button.onclick=()=>{exam.cursor=i;save();renderExam();$('exam-question').focus({preventScroll:true});};$('exam-grid').append(button);});
}
$('exam-written').oninput=()=>{const exam=state.exam;if(!exam)return;setExamAnswer(exam,exam.cursor,$('exam-written').value||null);save();const answered=exam.answers.filter(a=>typeof a==='string'&&a.trim()).length;$('exam-count').textContent=`${answered} answered · ${exam.flagged.length} flagged`;$('exam-progress').style.width=`${answered/exam.questions.length*100}%`;$('exam-clear').disabled=!$('exam-written').value;$('exam-map-summary').textContent=`Question navigator · ${answered}/${exam.questions.length} answered`;renderExamGrid();};
function moveExam(step){if(!state.exam||state.exam.submittedAt)return;state.exam.cursor=Math.max(0,Math.min(state.exam.questions.length-1,state.exam.cursor+step));save();renderExam();$('exam-question').focus({preventScroll:true});}
$('exam-prev').onclick=()=>moveExam(-1);$('exam-next').onclick=()=>moveExam(1);
$('exam-clear').onclick=()=>{if(state.exam&&setExamAnswer(state.exam,state.exam.cursor,null)){save();renderExam();}};
$('exam-flag').onclick=()=>{const exam=state.exam;if(!exam||exam.submittedAt)return;exam.flagged=exam.flagged.includes(exam.cursor)?exam.flagged.filter(i=>i!==exam.cursor):[...exam.flagged,exam.cursor];save();renderExam();};
$('submit-exam').onclick=()=>{const exam=state.exam;if(!exam||exam.submittedAt)return;const unanswered=exam.answers.filter(a=>a===null||!a.trim()).length;if(!confirm(unanswered?`Submit with ${unanswered} unanswered question${unanswered===1?'':'s'}? Unanswered questions count as incorrect.`:'Submit your exam? You will see the score and answers, and this attempt will be locked.'))return;submitExam(exam);save();renderExam();$('exam-percent').focus({preventScroll:true});};
function renderExamResults(){
 const result=scoreExam(state.exam),percent=result.percent;
 $('exam-percent').textContent=`${percent}%`;$('exam-percent').tabIndex=-1;
 $('exam-level').textContent=percent>=85?'Strong recall':percent>=65?'Developing recall':'More practice will help';
 $('exam-score-detail').textContent=`${result.correct} correct · ${result.incorrect} incorrect · ${result.unanswered} unanswered · ${result.total} total`;
 $('exam-result-note').textContent=`${percent>=85?'Revisit the questions you missed to strengthen the gaps.':percent>=65?'Review the missed cards, then try a new exam.':'Use Learn to build recall, then test yourself again.'} These are study-set practice bands (85% / 65%), not a prediction of your real test grade. Scores follow the set’s answer key.`;
 const missed=result.rows.filter(r=>!r.correct);$('practice-exam-missed').disabled=!missed.length;$('practice-exam-missed').textContent=missed.length?`Learn ${Math.min(10,missed.length)} missed card${missed.length===1?'':'s'}`:'No missed cards';
 const rows=$('exam-missed-only').checked?missed:result.rows;$('exam-review-count').textContent=rows.length?`Showing ${rows.length} ${$('exam-missed-only').checked?'incorrect / unanswered':'total'} questions`:'All questions answered correctly. Turn off the filter to review the full exam.';$('exam-review').replaceChildren();
 rows.forEach(row=>{const article=document.createElement('article');article.className=`exam-review-item ${row.correct?'review-correct':'review-incorrect'}`;const badge=document.createElement('strong');badge.className='review-result-label';badge.textContent=`${row.correct?'✓ CORRECT':row.chosen?.trim()?'✕ INCORRECT':'— UNANSWERED'} · QUESTION ${row.index+1}`;const question=document.createElement('h4');question.textContent=row.prompt;const chosen=document.createElement('p');chosen.className=row.correct?'review-chosen':'review-wrong';chosen.textContent=`Your answer: ${row.chosen?.trim()?row.chosen:'Not answered'}`;const correct=document.createElement('p');correct.className='review-answer';correct.textContent=`Correct answer: ${row.answer}`;article.append(badge,question,chosen,correct);$('exam-review').append(article);});
}
$('exam-missed-only').onchange=renderExamResults;
$('practice-exam-missed').onclick=()=>{
 if(!state.exam?.submittedAt)return;const ids=scoreExam(state.exam).rows.filter(r=>!r.correct).map(r=>r.cardId);if(!ids.length)return;
 if(state.round?.queue.length&&!confirm('Replace your unfinished Learn round with up to 10 missed exam cards? Your learned-card progress will stay.'))return;
 keepRecovery('Before practicing missed exam cards');state.round=newMasteryRound(state.cards,state.mastery,Math.random,ids);save();setActivity('learn');
};
function renderMasteryOverview(){
 const summary=masterySummary(state.mastery);$('mastery-migration-note').hidden=!state.mastery.legacyCredit;
 $('mastery-overview-text').textContent=`${summary.mastered} mastered · ${summary.developing} building mastery · ${summary.needsWork} at 0/3 · ${summary.total} total`;
 $('set-mastery-progress').style.width=`${summary.total?summary.mastered/summary.total*100:0}%`;
 if($('mastery-details').open)renderMasteryList();
}
function renderMasteryList(){
 $('mastery-list').replaceChildren();
 state.cards.forEach((card,id)=>{const progress=state.mastery.cards[id];const item=document.createElement('article');const badge=document.createElement('strong');badge.textContent=`${progress.streak>=MASTERY_TARGET?'✓ MASTERED':'IN PRACTICE'} · ${progress.streak}/3 consecutive correct`;const question=document.createElement('p');question.textContent=`${id+1}. ${card.term}`;const counts=document.createElement('small');counts.textContent=`${progress.correct} correct · ${progress.incorrect} incorrect recorded (older history has at most one credited success)`;item.append(badge,question,counts);$('mastery-list').append(item);});
}
$('mastery-details').ontoggle=()=>{if($('mastery-details').open)renderMasteryList();};

function submitLearnChoice(choice){
 const round=state.round;if(!round)return;
 if(answerQuestion(round,choice)){
  recordMastery(state.mastery,round.queue[0],round.feedback.correct);
  state.feedbackStreak=round.feedback.correct?(state.feedbackStreak||0)+1:0;
  playAnswerSound(round.feedback.correct);save();renderLearn();animateLearnResult(round.feedback.correct);
  $('learn-feedback').focus({preventScroll:true});$('learn-feedback').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
}
$('learn-check').onclick=()=>{if(!$('learn-written').value.trim()){toast('Type your answer before checking.');return;}submitLearnChoice($('learn-written').value);};

$('dismiss-mastery-note').onclick=()=>{state.mastery.legacyCredit=false;save();renderMasteryOverview();};
