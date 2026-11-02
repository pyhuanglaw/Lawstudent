// BB_229 第 7 條（BB 2026-11-02 17:52）：測試用掛勾 CLS.curExam——runExam 開始時設 {cid,kind,term,i,qid}，每題更新 i、qid，考完（含中途出錯）＝null
const H=require('./pg_harness.js'); const {check}=H, J=JSON.stringify, GM=H.GM;
(async()=>{
  let day=null, it=null;
  for(let d=-200; d<400 && !it; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1') continue; const G=H.fresh('2025-09-01',7,'dorm'); G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; const x=CLS.dayItems(G).find(q=>q.exam==='final'); if(x){ day=d; it=x; } }
  check('0. 開考前 CLS.curExam＝null',CLS.curExam===null);
  const G=H.fresh('2025-09-01',9,'classroom'); G.day=day; G.weekday=CALENDAR.dateOf(day).wd%7;
  const seen=[]; const choose0=GM.choose; GM.choose=async o=>{ if(CLS.curExam) seen.push(Object.assign({},CLS.curExam)); return 0; };
  try{ await CLS.runExam(GM,it); } finally { GM.choose=choose0; }
  check('1. 考試中 curExam＝{cid,kind:final,term}、i 依序 1～5、qid 是那一題',seen.length>=5&&seen.every(x=>x.cid===it.c.id&&x.kind==='final'&&x.term===it.term)&&J(seen.map(x=>x.i).filter((v,i,a)=>a.indexOf(v)===i))===J([1,2,3,4,5])&&seen.every(x=>typeof x.qid==='string'&&x.qid.length>0),J(seen.map(x=>[x.i,x.qid])));
  const rec=CLS.rec(G).exam; const key=Object.keys(rec).find(k=>k.indexOf(it.c.id)>=0); const qs=rec[key]&&rec[key].qs;
  check('2. qid 和存檔裡那一場的題目一樣、順序一樣',!!qs&&J(seen.map(x=>x.qid).filter((v,i,a)=>a.indexOf(v)===i))===J(qs),J({qs}));
  check('3. 考完＝null',CLS.curExam===null);
  const G2=H.fresh('2025-09-01',9,'classroom'); G2.day=day; G2.weekday=CALENDAR.dateOf(day).wd%7; CLS.rec(G2).exam={};
  GM.choose=async()=>{ throw new Error('boom'); }; let threw=false; try{ await CLS.runExam(GM,it); }catch(e){ threw=true; } finally{ GM.choose=choose0; }
  check('4. 考到一半出錯也清掉（finally）',threw&&CLS.curExam===null);
  H.done();
})();
