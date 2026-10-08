// headless smoke test
const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(__dirname+'/all.js','utf8');
const store={};
const el={innerHTML:'', textContent:'', classList:{toggle(){},add(){},remove(){}}, value:'', select(){}, remove(){}};
const ctx={ console, setInterval:(f,t)=>0, clearInterval:()=>{}, setTimeout:(f,t)=>0, clearTimeout:()=>{}, Math, Date, JSON, Object, Array, String, Number,
  document:{ getElementById:()=>el, querySelector:()=>null, createElement:()=>({...el}), body:{appendChild(){}} },
  localStorage:{ getItem:k=>store[k]==null?null:store[k], setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];} },
  navigator:{ clipboard:{ writeText:()=>Promise.resolve() } }, window:{}, event:{} };
ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(code,ctx);
const S=ctx; const ev=x=>vm.runInContext(x,ctx); const UI=ev('UI'); const COURSES=ev('COURSES'); const SUBJ_IDS=ev('SUBJ_IDS');
function G(){ return ev('G'); }
let steps=0; const seen={};
function fillPlan(){
  const g=G(); const n=S.ctxSlots(); const acts=S.ctxActs(); g.sched=[];
  const study=acts.filter(a=>a.cat==='學習'||a.cat==='工作'); const life=acts.filter(a=>a.cat!=='學習'&&a.cat!=='工作');
  for(let i=0;i<n;i++){
    const useLife= i>=n-2; const pool=useLife?life:study; const a=pool[(steps+i)%pool.length]; if(!a) break;
    let course=null;
    if(g.ctx==='uni'&&(a.course||a.id==='lang')){ if(a.id==='lang') course='en'; else { const cs=g.enrolled.filter(c=>COURSES[c].exam); course=cs[(steps+i)%cs.length]||g.enrolled[0]; } }
    if(g.ctx==='bar'&&a.subj) course=SUBJ_IDS[(steps+i)%6];
    if(g.ctx==='career'&&a.matter){ const d=g.career.docket.filter(m=>!m.done); course=d.length?d[(steps+i)%d.length].id:null; }
    g.sched.push({act:a.id,course});
  }
}
S.newGame({name:'測試',look:{skin:1,hair:0,hairStyle:0,top:0},bg:'work'}); G().housing='dorm'; S.render();
G().enrolled=['civ1','crim1','cons1','intro','legalEn1']; UI.enrollDone(); S.render();
const log=[];
while(steps<4000){
  steps++; const g=G(); const sc=g.screen; seen[sc]=(seen[sc]||0)+1;
  try{ S.render(); }catch(e){ console.log('RENDER ERROR at',sc,e.stack); break; }
  if(steps%200===0) log.push(steps+' '+S.timeLabel()+' '+sc+' money='+Math.round(g.player.money)+' en='+Math.round(g.player.energy)+' st='+Math.round(g.player.stress));
  try{
  switch(sc){
    case 'plan': fillPlan(); UI.startBlock(); UI.skipResolve(); UI.afterResolve(); break;
    case 'event': { const e=S.curEvent(); if(!e){ g.pendingEvent=null; g.screen='report'; break; } UI.choose(0); S.render(); UI.afterEvent(); break; }
    case 'quiz': if(g.quiz.stage==='assign') S.assignChoose('lead'); else if(g.quiz.stage==='done'){ g.screen='report'; } else S.quizAnswer(0); break;
    case 'report': UI.nextBlock(); break;
    case 'examIntro': S.examBegin(); break;
    case 'exam': { const e=g.exam; if(e.step===0) UI.examPick('C',-1); else if(e.step===1){ const idx=e.case.opts.findIndex(o=>o.k==='core'); UI.examPick('core',idx); } else UI.examPick('full',-1); break; }
    case 'examResult': UI.examNext(); break;
    case 'grades': UI.afterGrades(); break;
    case 'break': if(g.breakDone) UI.breakNext(); else { g.breakPicked=['restHome','preview']; UI.breakGo(); } break;
    case 'enroll': { const y=g.time.year, s=g.time.sem; g.enrolled=S.coursesFor(y,s).filter(c=>c.type==='req').map(c=>c.id); const el2=S.coursesFor(y,s).find(c=>c.type!=='req'); if(el2) g.enrolled.push(el2.id); UI.enrollDone(); break; }
    case 'exchDecide': S.exchDecideApply(['eu','jp','us']); break;
    case 'exchResult': if(g.exch.result) S.exchAccept('loan'); else S.exchDecline(); break;
    case 'exchPrep': S.exchPrepChoose(0); break;
    case 'exchDepart': S.exchStart(); break;
    case 'exchReturn': S.exchReturnDone(); break;
    case 'gradChoice': S.barBegin('full','both','labor'); break;
    case 'barExam1': S.barExam1Next(); break;
    case 'barOral': S.barOralChoose(0); break;
    case 'barResult': { const b=g.bar; if(b.judgePass) S.barAfterResult('trainJudge'); else if(b.lawyerPass) S.barAfterResult('trainLawyer'); else if(b.attempts>=3) S.barAfterResult('legal'); else S.barAfterResult('retryFull'); break; }
    case 'training': S.trainingChoose(0); break;
    case 'careerSetup': { const r=g.setupRole; if(r==='legal') S.careerBegin('legal',{company:'local'}); else if(r==='lawyer') S.careerBegin('lawyer',{firm:g.firmPick||'small'}); else S.careerBegin(r); break; }
    case 'careerReview': { const r=g.review; const o=r.options.find(x=>x.k!=='ending'); if(o&&steps%3===0) S.careerChoose(o.k); else { g.screen='careerOffers'; } break; }
    case 'careerOffers': { const o=g.career.offersReview||[]; if(o.length) S.acceptOffer(0); else S.offersDone(); break; }
    case 'setupFirm': S.firmSetupChoose(0); break;
    case 'ending': steps=9999; break;
    default: console.log('UNKNOWN SCREEN',sc); steps=9999;
  }
  }catch(e){ console.log('LOGIC ERROR at',sc,S.timeLabel(),e.stack); break; }
  if(g.careerYears>=9&&g.phase==='career'&&sc==='careerReview'){ S.careerChoose('ending'); }
  const p=G().player; if(isNaN(p.money)||isNaN(p.energy)||isNaN(p.stress)){ console.log('NaN detected at',sc,S.timeLabel(),p); break; }
}
console.log(log.join('\n')); console.log('screens seen:',seen); console.log('final:',S.timeLabel(),G().screen,'phase',G().phase,'flags',Object.keys(G().flags).length,'diary',G().diary.length);
// save/load roundtrip
const js=S.exportJSON(); const ok=S.importJSON(js); console.log('import ok',ok, 'money',G().player.money);
if(G().career){ console.log('career',G().career.role,G().career.stage,G().career.title,'ending',S.endingKey()); }
