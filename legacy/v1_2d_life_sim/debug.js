const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(__dirname+'/all.js','utf8'); const store={};
const el={innerHTML:'', textContent:'', classList:{toggle(){},add(){},remove(){}}, value:'', select(){}, remove(){}};
const ctx={ console, setInterval:()=>0, clearInterval(){}, setTimeout:()=>0, clearTimeout(){}, Math, Date, JSON, Object, Array, String, Number,
  document:{ getElementById:()=>el, querySelector:()=>null, createElement:()=>({...el}), body:{appendChild(){}} },
  localStorage:{ getItem:k=>store[k]==null?null:store[k], setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];} },
  navigator:{ clipboard:{ writeText:()=>Promise.resolve() } }, window:{}, event:{} };
ctx.window=ctx; vm.createContext(ctx); vm.runInContext(code,ctx);
const S=ctx; const ev=x=>vm.runInContext(x,ctx); const UI=ev('UI'); const COURSES=ev('COURSES'); const SUBJ_IDS=ev('SUBJ_IDS'); const G=()=>ev('G');
let steps=0;
function fillPlan(mode){
  const g=G(); const n=S.ctxSlots(); g.sched=[];
  if(g.ctx==='uni'){ const cs=g.enrolled.filter(c=>COURSES[c].exam); const plan=['read','read','notes','cases','review','rest','eat']; // deliberate
    for(let i=0;i<n;i++){ const a=plan[i%plan.length]; const c=cs[(i+steps)%cs.length]; g.sched.push({act:a,course:['rest','eat'].includes(a)?null:c}); } }
  else if(g.ctx==='bar'){ const plan=['b1','b2','bp','br','bmc','bm','brest','bsport']; for(let i=0;i<n;i++){ const a=plan[i%plan.length]; g.sched.push({act:a,course:['b1','b2','bp','br'].includes(a)?SUBJ_IDS[(i+steps)%6]:null}); } }
  else { const acts=S.ctxActs(); for(let i=0;i<n;i++){ const a=acts[(i+steps)%acts.length]; let course=null; if(g.ctx==='career'&&a.matter){ const d=g.career.docket.filter(m=>!m.done); course=d.length?d[(i+steps)%d.length].id:null; } g.sched.push({act:a.id,course}); } }
}
S.newGame({name:'測試',look:{skin:1,hair:0,hairStyle:0,top:0},bg:'academic'}); G().housing='dorm';
G().enrolled=['civ1','crim1','cons1','intro','legalEn1']; UI.enrollDone();
while(steps<3000){ steps++; const g=G(); const sc=g.screen;
  switch(sc){
    case 'plan': fillPlan(); UI.startBlock(); UI.skipResolve(); UI.afterResolve(); break;
    case 'event': { const e=S.curEvent(); if(!e){ g.pendingEvent=null; g.screen='report'; break; } UI.choose(0); UI.afterEvent(); break; }
    case 'quiz': if(g.quiz.stage==='assign') S.assignChoose('lead'); else if(g.quiz.stage==='done'){ g.screen='report'; } else S.quizAnswer(0); break;
    case 'report': UI.nextBlock(); break;
    case 'examIntro': S.examBegin(); break;
    case 'exam': { const e=g.exam; if(e.step===0) UI.examPick('C',-1); else if(e.step===1){ const idx=e.case.opts.findIndex(o=>o.k==='core'); UI.examPick('core',idx); } else UI.examPick('full',-1); break; }
    case 'examResult': { const e=g.exam; console.log('EXAM',e.bar?'BAR':COURSES[e.cid].name, e.which, 'prep',Math.round(e.prep),'score',e.result.score, e.bar?'':JSON.stringify(Object.fromEntries(Object.entries(e.result.d).map(([k,v])=>[k,Math.round(v)])))); UI.examNext(); break; }
    case 'grades': console.log('GRADES',S.timeLabel(),g.gradeRows.map(r=>r.name+':'+r.g).join(' '),'avg',g.semAvg,'energy',Math.round(g.player.energy)); UI.afterGrades(); break;
    case 'break': if(g.breakDone) UI.breakNext(); else { g.breakPicked=['restHome','preview']; UI.breakGo(); } break;
    case 'enroll': { const y=g.time.year, s=g.time.sem; g.enrolled=S.coursesFor(y,s).filter(c=>c.type==='req').map(c=>c.id); const el2=S.coursesFor(y,s).find(c=>c.type!=='req'); if(el2) g.enrolled.push(el2.id); UI.enrollDone(); break; }
    case 'exchDecide': S.exchDecideApply(['eu','jp','us']); break;
    case 'exchResult': console.log('EXCH RESULT',g.exch.result,g.exch.notes); if(g.exch.result) S.exchAccept('loan'); else S.exchDecline(); break;
    case 'exchPrep': S.exchPrepChoose(0); break;
    case 'exchDepart': S.exchStart(); break;
    case 'exchReturn': console.log('EXCH RETURN',g.exch.finalGrade,g.exch.creditRatio,g.exch.friends,g.exch.adapt,g.exch.memories); S.exchReturnDone(); break;
    case 'gradChoice': console.log('GRAD gpa',S.gpaAll(),'money',g.player.money,'skills',JSON.stringify(g.player.skills)); S.barBegin('full','both','labor'); console.log('BAR INIT',JSON.stringify(Object.fromEntries(Object.entries(g.bar.subj).map(([k,d])=>[k,Object.fromEntries(Object.entries(d).map(([a,b])=>[a,Math.round(b)]))])))); break;
    case 'barExam1': console.log('EXAM1',JSON.stringify(g.bar.exam1),'mc',g.bar.mc,'subj',JSON.stringify(Object.fromEntries(Object.entries(g.bar.subj).map(([k,d])=>[k,Object.fromEntries(Object.entries(d).map(([a,b])=>[a,Math.round(b)]))])))); S.barExam1Next(); break;
    case 'barOral': S.barOralChoose(0); break;
    case 'barResult': { const b=g.bar; console.log('BAR RESULT',b.lawyerPass,b.judgePass,b.why,b.exam2&&b.exam2.total,b.exam2&&b.exam2.judgeTotal,b.oral); if(b.judgePass) S.barAfterResult('trainJudge'); else if(b.lawyerPass) S.barAfterResult('trainLawyer'); else if(b.attempts>=3) S.barAfterResult('legal'); else S.barAfterResult('retryFull'); break; }
    case 'training': S.trainingChoose(0); break;
    case 'careerSetup': { const r=g.setupRole; if(r==='legal') S.careerBegin('legal',{company:'local'}); else if(r==='lawyer') S.careerBegin('lawyer',{firm:g.firmPick||'small'}); else S.careerBegin(r); break; }
    case 'careerReview': { console.log('REVIEW',S.timeLabel(),JSON.stringify(g.career.metrics),'money',Math.round(g.player.money),'energy',Math.round(g.player.energy),g.review.options.map(o=>o.k)); const r=g.review; const o=r.options.find(x=>x.k!=='ending'&&x.k!=='takeBar'&&x.k!=='toLegal'); if(o) S.careerChoose(o.k); else g.screen='careerOffers'; break; }
    case 'careerOffers': { const o=g.career.offersReview||[]; if(o.length) S.acceptOffer(0); else S.offersDone(); break; }
    case 'setupFirm': S.firmSetupChoose(0); break;
    case 'ending': steps=9999; break;
    default: console.log('UNKNOWN',sc); steps=9999;
  }
  if(g.careerYears>=8&&g.phase==='career'&&g.screen==='careerReview'){ S.careerChoose('ending'); }
}
console.log('END',S.timeLabel(),G().screen, G().career&&G().career.stage, S.endingKey());
