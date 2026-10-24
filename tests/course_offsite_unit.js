// 校外上課（COURSE-PRACTICE-Y4-1024；src/classes3d.js 的 CLS.goOffsite）：大四下「法律實習或法律扶助實務」教室 OFF 沒有地點——不需要瀏覽器。
//   1 2029-03-13（二，第 4 週）早上「直接去上課」：2D 出門、時間跳到下課、記出席；那一天說 AA_342 4-2 的旁白（twfill3d.js 用 CLS.OFFSITE_LINES 接）
//   2 別的週二（2029-03-06）：一樣記出席，沒有那一句
//   3 已經快結束（missed）：不算出席；做過的不再做
//   4 手機「今天」的去上課按鈕：教室 OFF 也出現（room.offsite）
// 修改前（3acd4f3f9）：沒有 CLS.goOffsite，goPlan 回 null、「直接去上課」沒反應——FAIL。用法：node tests/course_offsite_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const L3=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
if(typeof TWFILL_LINES==='undefined'){ try{ L3('src/data/twfill_events.js'); L3('src/twfill3d.js'); }catch(e){ console.log('（載入 twfill 失敗：'+e.message+'）'); } }
const LINE='（實習的第四週。律師讓你第一次自己接一通諮詢電話。你講了十分鐘，掛掉以後，手還在抖。）';
const itemOn=key=>{ const G=H.fresh(key,8,'dorm'); G.stage='law'; const L=CLS.dayItems(G); return {G,it:L.find(q=>q.c&&q.c.id==='legal_practice')}; };
(async()=>{
  check('0. CLS.goOffsite 存在',typeof CLS.goOffsite==='function');
  { const {G,it}=itemOn('2029-03-13'); check('1. 前提：2029-03-13 有法律實習、教室是校外（offsite）',!!it&&!!(it.room&&it.room.offsite),J(it&&{room:it.room,t0:it.t0}));
    if(it){ H.said=[]; const r=await CLS.goClass(GM,it,{forced:true}); const R=CLS.rec(G);
      check('1. 直接去：記出席、時間到下課、說第 4 週那一句',r===true&&R.done[it.key]===1&&(R.attend.legal_practice|0)===1&&G.hour>=it.t1-1e-6&&H.has(LINE),J({r,h:G.hour,t1:it.t1,lines:H.lines()}));
      check('3. 做過的不再做',(await CLS.goClass(GM,it,{forced:true}))===false); } }
  { const {G,it}=itemOn('2029-03-06'); if(it){ H.said=[]; await CLS.goClass(GM,it,{forced:true}); check('2. 別的週二：記出席、沒有那一句',CLS.rec(G).done[it.key]===1&&!H.has(LINE),J(H.lines())); } else check('2. 前提：2029-03-06 有法律實習',false); }
  { const {G,it}=itemOn('2029-03-20'); if(it){ G.hour=it.t1+0.5; const r=await CLS.goClass(GM,it,{forced:true}); check('3. 已經結束：不算出席',r===false&&!CLS.rec(G).done[it.key]); } }
  const src=fs.readFileSync(path.join(H.ROOT,'src/classes3d.js'),'utf8');
  check('4. 手機「今天」的去上課按鈕：教室 OFF 也出現',src.includes("(it.room.zone||it.room.door||it.room.offsite)?"));
  H.done();
})();
