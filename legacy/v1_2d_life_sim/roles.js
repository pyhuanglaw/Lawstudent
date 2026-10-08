const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(__dirname+'/all.js','utf8'); const store={};
const el={innerHTML:'', textContent:'', classList:{toggle(){},add(){},remove(){}}, value:'', select(){}, remove(){}};
function mk(){ const ctx={ console, setInterval:()=>0, clearInterval(){}, setTimeout:()=>0, clearTimeout(){}, Math, Date, JSON, Object, Array, String, Number,
  document:{ getElementById:()=>el, querySelector:()=>null, createElement:()=>({...el}), body:{appendChild(){}} },
  localStorage:{ getItem:k=>store[k]==null?null:store[k], setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];} },
  navigator:{ clipboard:{ writeText:()=>Promise.resolve() } }, window:{}, event:{} }; ctx.window=ctx; vm.createContext(ctx); vm.runInContext(code,ctx); return ctx; }
for(const role of ['lawyer','judge','pros','legal','exch','bar']){
  const S=mk(); const ev=x=>vm.runInContext(x,S); const UI=ev('UI'); const G=()=>ev('G');
  UI.chapter(role); let steps=0; const seen={};
  while(steps<1500){ steps++; const g=G(); const sc=g.screen; seen[sc]=(seen[sc]||0)+1; try{ S.render(); }catch(e){ console.log(role,'RENDER ERR',sc,e.message); break; }
    try{ switch(sc){
      case 'plan': { const n=S.ctxSlots(); const acts=S.ctxActs(); g.sched=[]; const work=acts.filter(a=>a.cat==='工作'||a.cat==='學習'); const life=acts.filter(a=>a.cat!=='工作'&&a.cat!=='學習'); for(let i=0;i<n;i++){ const pool=i<n-2?work:life; const a=pool[(steps+i)%pool.length]; let course=null; if(g.ctx==='career'&&a.matter){ const d=g.career.docket.filter(m=>!m.done).sort((x,y)=>x.dl-y.dl); course=d.length?d[i%Math.min(2,d.length)].id:null; } if(g.ctx==='bar'&&a.subj) course=ev('SUBJ_IDS')[(steps+i)%6]; if(g.ctx==='uni'&&(a.course||a.id==='lang')){ course= a.id==='lang'?'en':g.enrolled[(steps+i)%g.enrolled.length]; } g.sched.push({act:a.id,course}); } UI.startBlock(); UI.skipResolve(); UI.afterResolve(); break; }
      case 'event': { const e=S.curEvent(); if(!e){ g.pendingEvent=null; g.screen='report'; break; } UI.choose(0); S.render(); UI.afterEvent(); break; }
      case 'report': UI.nextBlock(); break;
      case 'careerReview': { const r=g.review; if(g.careerYears>=6){ S.careerChoose('ending'); break; } const o=r.options.find(x=>x.k!=='ending'&&x.k!=='takeBar'&&x.k!=='toLegal'&&x.k!=='toLawyer'&&x.k!=='switchMNC'); if(o) { console.log(role,'CHOOSE',o.k,S.timeLabel()); S.careerChoose(o.k); } else g.screen='careerOffers'; break; }
      case 'careerOffers': { const o=g.career.offersReview||[]; if(o.length&&g.career.docket.filter(m=>!m.done).length<3) S.acceptOffer(0); else S.offersDone(); break; }
      case 'setupFirm': S.firmSetupChoose(0); break;
      case 'exchPrep': S.exchPrepChoose(0); break; case 'exchDepart': S.exchStart(); break; case 'exchReturn': S.exchReturnDone(); break;
      case 'enroll': { const y=g.time.year, s=g.time.sem; g.enrolled=S.coursesFor(y,s).filter(c=>c.type==='req').map(c=>c.id); UI.enrollDone(); break; }
      case 'examIntro': S.examBegin(); break;
      case 'exam': { const e=g.exam; if(e.step===0) UI.examPick('B',-1); else if(e.step===1){ UI.examPick('sec',1); } else UI.examPick('list',-1); break; }
      case 'examResult': UI.examNext(); break; case 'grades': UI.afterGrades(); break;
      case 'break': if(g.breakDone) UI.breakNext(); else { g.breakPicked=['restHome']; UI.breakGo(); } break;
      case 'quiz': if(g.quiz.stage==='assign') S.assignChoose('split'); else if(g.quiz.stage==='done'){ g.screen='report'; } else S.quizAnswer(1); break;
      case 'barExam1': S.barExam1Next(); break; case 'barOral': S.barOralChoose(1); break;
      case 'barResult': { const b=g.bar; console.log(role,'BAR',b.lawyerPass,b.judgePass,b.why); if(b.judgePass) S.barAfterResult('trainJudge'); else if(b.lawyerPass) S.barAfterResult('trainLawyer'); else S.barAfterResult('retryFull'); break; }
      case 'training': S.trainingChoose(0); break;
      case 'careerSetup': { const r=g.setupRole; if(r==='legal') S.careerBegin('legal',{company:'local'}); else if(r==='lawyer') S.careerBegin('lawyer',{firm:g.firmPick||'small'}); else S.careerBegin(r); break; }
      case 'gradChoice': S.barBegin('full','both','labor'); break;
      case 'ending': steps=9999; break;
      default: console.log(role,'UNKNOWN',sc); steps=9999; } }catch(e){ console.log(role,'LOGIC ERR',sc,S.timeLabel(),e.stack.split('\n').slice(0,3).join(' | ')); break; }
    if(g.phase==='uni'&&g.time.year>=4&&g.time.sem===2&&sc==='break'&&role==='exch'){ }
  }
  const g=G(); console.log(role,'END',S.timeLabel(),g.screen,g.career?JSON.stringify(Object.fromEntries(Object.entries(g.career.metrics).map(([k,v])=>[k,Math.round(v)]))):'', 'money',Math.round(g.player.money),'energy',Math.round(g.player.energy),'flags',Object.keys(g.flags).join(','), g.career?S.endingKey():'');
}
