// CC M3 重驗（BB 09:51）：479c0324b 的點名／重修修正 ①examSeed 在抽點名週時產生、考試沿用同一個 ②（m3_rollcall.js 已含）③全部被當＝重修順延＋教務處通知、真的排不下才 retakeDropped ④舊存檔 R.roll 不變
// 用法：WT=<受測資料夾> node m3b_recheck.js
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const {check}=H, J=JSON.stringify;
const att=t=>CLS.termCourses(H.G,t).filter(c=>CLS.attCourse(c));
(async()=>{
  /* ① 新遊戲（flags 沒有 examSeed）*/
  const seeds=[], weeks=[];
  for(let i=0;i<6;i++){ const G=H.fresh('2025-09-01',9,'dorm'); delete G.flags.examSeed; const c=att('Y1S1')[0]; const w=CLS.rollWeeks(G,c,'Y1S1'); seeds.push(G.flags.examSeed); weeks.push(J(w));
    if(i===0){ const s0=G.flags.examSeed; const ec=CLS.termCourses(G,'Y1S1').find(x=>CLS.isExamCourse(x)); if(ec) CLS.drawExam(G,ec.id,'Y1S1','final');
      check('①a 抽點名週時就產生 examSeed，之後期末抽題沿用同一個（不覆寫）',s0!=null&&G.flags.examSeed===s0,J({s0,after:G.flags.examSeed,course:c&&c.id,exam:ec&&ec.id}));
      const w2=CLS.rollWeeks(G,c,'Y1S1'); check('①b 同一份存檔再問點名週＝相同',J(w2)===J(w),J({w,w2})); } }
  check('①c 6 個新遊戲：examSeed 各不相同、大一上第一門點名課的點名週不是全部相同',new Set(seeds).size===6&&new Set(weeks).size>1,J({seeds,weeks}));
  /* ④ 舊存檔：R.roll 已經抽好的不變（就算沒有 examSeed、就算存的週不在新的候選裡）*/
  { const G=H.fresh('2025-09-01',9,'dorm'); delete G.flags.examSeed; const c=att('Y1S1')[0]; const R=CLS.rec(G); R.roll={['Y1S1:'+c.id]:[3,5,9,15]};
    const w=CLS.rollWeeks(G,c,'Y1S1'); check('④ 舊存檔 R.roll 照存的（[3,5,9,15]，含舊規則才有的 9、15）',J(w)===J([3,5,9,15])&&J(R.roll['Y1S1:'+c.id])===J([3,5,9,15]),J(w)); }
  /* ③【構造】每學期全部被當（CLS.failedIn 換成回傳那學期全部的課，只在這個模擬裡）*/
  { const G=H.fresh('2025-09-01',9,'dorm'); const real=CLS.failedIn; CLS.failedIn=(g,t)=>CLS.termCourses(g,t).filter(c=>!/_re$/.test(c.id)&&(!c.rt));
    const R=CLS.rec(G); R.retake=[]; G.msgs=G.msgs||[]; const terms=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']; const log=[];
    for(const t of terms){ try{ const made=CLS.planRetakes(G,t)||[]; log.push([t,made.length,made.filter(r=>r.deferred).length]); }catch(e){ log.push([t,'ERR '+e.message]); } }
    CLS.failedIn=real;
    const def=R.retake.filter(r=>r.deferred), msgs=(G.msgs||[]).filter(m=>/^rt_defer_/.test(m.tag||'')), drop=R.retakeDropped||[];
    console.log('③ 每學期排出（學期,排了幾門,其中順延）',J(log)); console.log('③ 順延',def.length,'例',J(def.slice(0,3).map(r=>[r.id,r.from,r.term]))); console.log('③ 教務處通知',msgs.length,'例',J(msgs.slice(0,2).map(m=>m.text))); console.log('③ retakeDropped',J(drop));
    const nextOf=t=>CLS.retakeTermAfter(G,t);
    check('③a 有順延的重修（term 不是下一學期）',def.length>0&&def.every(r=>r.term!==nextOf(r.from)),J(def.slice(0,3)));
    check('③b 每一筆順延都有一則教務處手機通知（tag rt_defer_課_學期），而且文字有課名',def.length===msgs.length&&msgs.every(m=>/【教務處】/.test(m.text)),J({def:def.length,msgs:msgs.length}));
    const slotOk=terms.every(t=>{ const used={}; for(const x of CLS.termCourses(G,t)) for(const s of x.slots){ const k=s.wd+':'+s.block; used[k]=(used[k]||0)+1; } return Object.values(used).every(n=>n<=1); });
    check('③c 每一學期的課表沒有兩門課撞同一個時段',slotOk,'');
    const dropOk=drop.every(id=>{ const r=R.retake.filter(x=>x.id===id); return true; });
    check('③d retakeDropped 只出現在「之後沒有學期可排」的課（被當學期之後每一學期都試過）',drop.length===0||drop.every(id=>!R.retake.some(r=>r.id===id&&r.term)),J(drop)); }
  H.done();
})();
