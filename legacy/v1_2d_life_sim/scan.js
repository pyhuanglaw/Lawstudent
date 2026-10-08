const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(__dirname+'/all.js','utf8'); const store={};
const el={innerHTML:'', textContent:'', classList:{toggle(){},add(){},remove(){}}, value:'', select(){}, remove(){}};
const ctx={ console, setInterval:()=>0, clearInterval(){}, setTimeout:()=>0, clearTimeout(){}, Math, Date, JSON, Object, Array, String, Number,
  document:{ getElementById:()=>el, querySelector:()=>null, createElement:()=>({...el}), body:{appendChild(){}} },
  localStorage:{ getItem:k=>store[k]==null?null:store[k], setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];} },
  navigator:{ clipboard:{ writeText:()=>Promise.resolve() } }, window:{}, event:{} }; ctx.window=ctx; vm.createContext(ctx); vm.runInContext(code,ctx);
const S=ctx; const ev=x=>vm.runInContext(x,S); const UI=ev('UI'); const G=()=>ev('G');
let bad=0; const seenScreens=new Set();
function check(tag){ const html=el.innerHTML; const m=html.match(/undefined|NaN|\[object|null(?![a-zA-Z])/g); if(m){ bad++; if(bad<12){ const i=html.search(/undefined|NaN|\[object|null(?![a-zA-Z])/); console.log('LEAK',tag,':',html.slice(Math.max(0,i-120),i+60).replace(/\s+/g,' ')); } } }
S.render(); check('title');
S.newGame({name:'測試',look:{skin:1,hair:0,hairStyle:0,top:0},bg:'family'}); S.render(); check('enroll0'); G().housing='commute'; G().enrolled=['civ1','crim1','cons1','intro','film']; UI.enrollDone();
let steps=0;
while(steps<600){ steps++; const g=G(); const sc=g.screen; S.render(); if(!seenScreens.has(sc)){ seenScreens.add(sc); } check(sc+'@'+S.timeLabel());
  switch(sc){
    case 'plan': { const n=S.ctxSlots(); const acts=S.ctxActs(); g.sched=[]; for(let i=0;i<n;i++){ const a=acts[(steps*3+i)%acts.length]; let course=null; if(g.ctx==='uni'&&(a.course||a.id==='lang')) course=a.id==='lang'?'en':g.enrolled[(i)%g.enrolled.length]; if(g.ctx==='career'&&a.matter){ const d=g.career.docket.filter(m=>!m.done); course=d.length?d[0].id:null; } if(g.ctx==='bar'&&a.subj) course='civ'; g.sched.push({act:a.id,course}); } S.render(); check('planfilled'); UI.startBlock(); S.render(); check('resolve0'); UI.skipResolve(); S.render(); check('resolveall'); UI.afterResolve(); break; }
    case 'event': { const e=S.curEvent(); if(!e){ g.pendingEvent=null; g.screen='report'; break; } UI.choose(0); S.render(); check('eventresult'); UI.afterEvent(); break; }
    case 'quiz': if(g.quiz.stage==='assign') S.assignChoose('sis'); else if(g.quiz.stage==='done'){ g.screen='report'; } else S.quizAnswer(2); break;
    case 'report': UI.nextBlock(); break;
    case 'examIntro': S.examBegin(); break;
    case 'exam': { const e=g.exam; if(e.step===0) UI.examPick('A',-1); else if(e.step===1){ UI.examPick('tan',2); } else UI.examPick('concl',-1); break; }
    case 'examResult': UI.examNext(); break;
    case 'grades': UI.afterGrades(); break;
    case 'break': if(g.breakDone) UI.breakNext(); else { g.breakPicked=['work','lang']; UI.breakGo(); } break;
    case 'enroll': { const y=g.time.year, s=g.time.sem; g.enrolled=S.coursesFor(y,s).filter(c=>c.type==='req').map(c=>c.id); UI.enrollDone(); break; }
    case 'exchDecide': S.exchDecideSkip(); break;
    case 'gradChoice': S.barBegin('part','lawyer','ip'); break;
    case 'barExam1': S.barExam1Next(); break; case 'barOral': S.barOralChoose(0); break;
    case 'barResult': { const b=g.bar; if(b.lawyerPass) S.barAfterResult('trainLawyer'); else S.barAfterResult('legal'); break; }
    case 'training': S.trainingChoose(2); break;
    case 'careerSetup': { const r=g.setupRole; if(r==='legal') S.careerBegin('legal',{company:'mnc'}); else S.careerBegin('lawyer',{firm:g.firmPick||'small'}); break; }
    case 'careerReview': { g.screen='careerOffers'; break; }
    case 'careerOffers': S.offersDone(); break;
    case 'ending': steps=9999; break;
    default: steps=9999;
  }
}
for(const m of ['skills','people','memory','save','help']){ UI.openModal(m); S.render(); check('modal-'+m); UI.closeModal(); }
console.log('screens',[...seenScreens].join(','),'leaks',bad, S.timeLabel());
