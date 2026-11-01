// 主線 4「這週的訊息」可以發在群組（AA_281 第 8 節 M14；任務 PS-MSG-LESS-1018；story3d.js S.neededTh、needed_msgs.js ps_q 的 th）——不需要瀏覽器。
//   1 沛珊 ps_q：玩家在公法讀書會群組（PHONE.inGroup 'public_law'）＝發在群組 g:public_law；不在群組＝照舊私訊 p:classmate_peishan
//   2 在群組回了＝算有回（這週的 ans 有 ps_q、她的回應在群組）。沒回＝下次見面照舊帶那一句（AA-B 11-01 選 (a)：遊戲裡群組其他人不會替你回；沒回的邏輯沒改，tests/v3_needed_unit.js 照查）
//   3 其他人的訊息照舊私訊
// 修改前（開發分支 4998acecc）：needed 訊息全部寫死私訊——第 1 項 FAIL。用法：node tests/needed_group_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/data/needed_msgs.js'),'utf8').replace(/^const NEEDED_MSGS\s*=/m,'globalThis.NEEDED_MSGS='),{filename:'src/data/needed_msgs.js'});
GM.toast=()=>{}; GM.caption=()=>{};
const PS='classmate_peishan';
const sun=()=>{ const r=CALENDAR.termDays('Y2S1'); let d=r.from+7; while(CALENDAR.dateOf(d).wd%7!==0) d++; return d; };   /* 大二上第 2 週的週日 */
const keyOf=d=>CALENDAR.dateOf(d).key;
const setup=(inGroup)=>{ const d=sun(); const G=H.fresh(keyOf(d),20.9,'dorm',{}); H.FAMILIAR(PS); SOCIAL.remember(PS,'FIRST_MET',''); INV.addContact(G,PS); if(inGroup) PHONE.join(G,'public_law','公法讀書會');
  for(const h of [20.95,21.0,21.05]){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); } return G; };
const has=(G,th,t)=>(G.msgs||[]).some(m=>m.th===th&&String(m.text).includes(t));
const Q='讀書會這週的題目，你可以幫我出一題嗎？';
check('0. STORY.neededTh 存在、ps_q 有 th',typeof STORY.neededTh==='function'&&!!NEEDED_MSGS.list.find(e=>e.id==='ps_q'&&e.th));
if(typeof STORY.neededTh!=='function') H.done();
{ const G=setup(true); const a=has(G,'g:public_law',Q), b=has(G,'p:'+PS,Q);
  check('1. 在公法讀書會群組：ps_q 發在群組、不是私訊',a&&!b,J((G.msgs||[]).filter(m=>String(m.text).includes('讀書會')).map(m=>m.th)));
  const m=(G.msgs||[]).find(m=>m.th==='g:public_law'&&m.ask&&m.ask.opts&&m.ask.opts.some(o=>o.need==='ps_q'));
  const r=m?PHONE.answer(G,m.ask.id,0):null; const N=STORY.neededRec(G), bt=N.batches[N.batches.length-1];
  check('2. 在群組回了：算有回（這週的 ans 有 ps_q）、她的回應在群組',!!m&&!!r&&!!bt&&bt.ans.includes('ps_q')&&has(G,'g:public_law','謝謝！不要太難喔'),J({ask:!!m,ans:bt&&bt.ans}));
}
{ const G=setup(false); check('1. 不在群組：照舊私訊',has(G,'p:'+PS,Q)&&!has(G,'g:public_law',Q)); }
{ const e=NEEDED_MSGS.list.find(x=>x.id==='an_lib'); const G=H.fresh('2026-09-13',21,'dorm',{}); PHONE.join(G,'public_law','公法讀書會'); check('3. 其他人的訊息（以安 an_lib）照舊私訊',STORY.neededTh(G,e)==='p:heroine_01'); }
H.done();
