// 舊存檔裡阿哲「週六中秋烤肉」（bbq_ask）、可昕「我們系也有烤肉」（kx_bbq_ask）沒有回覆期限（BB-C 10-21 P3；10-22 子代理用 9/25 底檔查到）——不需要瀏覽器。
//   5c471a79（10-21）以後新排的有 until＝週六 15:00；以前排進去的（佇列、已經收到的）沒有，到隔年還是「待回覆」，每個假期一開始手機自己打開。
//   1 新局：phoneRules 排的 bbq_ask 有 until（對照，修改前後都過）
//   2 舊存檔、已經收到、沒回：phoneRules 以後補上同一個 until；過了週六 15:00 不再是待回覆
//   3 舊存檔、還在佇列（kx_bbq_ask 週五 20:00 那則）：佇列裡那份也補上
//   4 已經回過的不動（ans 照舊、until 補上也不影響）
// 修改前（開發分支 e0a48b60）：第 2、3 項 FAIL。用法：node tests/bbq_until_old_save_unit.js
'use strict';
const H=require('./pg_harness.js');
const {check}=H;
const J=x=>JSON.stringify(x);
/* 1 新局：從開學第一週跑 phoneRules，拿新程式排的 until 當標準 */
let U=null, SAT=null;
{ const G=H.fresh('2025-09-01',9,'dorm',{}); STORY.phoneRules(H.GM); const q=PHONE.rec(G).q.find(q=>q.tag==='bbq_ask'); const it=q&&q.items[0];
  U=it&&it.ask&&it.ask.until; SAT=U!=null?Math.floor((U-15)/24):null;
  check('1. 新局：bbq_ask 有 until＝那個週六 15:00',U!=null&&U===SAT*24+15&&CALENDAR.dateOf(SAT).wd===6,J({U,sat:SAT!=null&&CALENDAR.dateOf(SAT).key})); }
const OLD=th=>({th,from:'zhe',text:'週六中秋烤肉。河濱，下午三點。',ask:{opts:[{t:'去。',set:{BBQ_YES:true}},{t:'這次不行。',set:{BBQ_NO:true}}]}});   /* 5c471a79 以前的樣子：ask 沒有 until */
/* 2 舊存檔、已經收到、沒回 */
{ const G=H.fresh('2025-09-25',12,'dorm',{}); const wed=SAT-3;
  PHONE.rec(G).q.push({day:wed,h:21,items:[OLD('p:zhe')],tag:'bbq_ask'}); G.day=wed; G.hour=21.5; PHONE.tick(G);
  const m=G.msgs.find(m=>m.tag==='bbq_ask'); const before=m&&m.ask&&m.ask.until;
  STORY.phoneRules(H.GM);
  check('2. 舊存檔、已經收到沒回：phoneRules 以後補上 until＝週六 15:00',!!m&&before==null&&m.ask.until===U,J({before,after:m&&m.ask.until,U}));
  G.day=SAT; G.hour=16; const pend=PHONE.pending(G).some(x=>x.tag==='bbq_ask');
  G.day=SAT+120; G.hour=12; const pend2=PHONE.pending(G).some(x=>x.tag==='bbq_ask');
  check('2. 週六 16:00、隔年一月：不再是待回覆',!pend&&!pend2,J({pend,pend2})); }
/* 3 舊存檔、還在佇列 */
{ const G=H.fresh('2025-09-25',12,'dorm',{dating_kexin:true});
  const it={th:'p:kexin',from:'kexin',text:'我們系也有烤肉。……你們的比較好玩嗎？',ask:{opts:[{t:'來我們這邊。',set:{KX_BBQ_COME:true}},{t:'妳去妳們系的。',set:{KX_BBQ_NO:true}}]}};
  PHONE.rec(G).q.push({day:SAT-1,h:20,items:[it],tag:'kx_bbq_ask'});
  STORY.phoneRules(H.GM);
  const q=PHONE.rec(G).q.find(q=>q.tag==='kx_bbq_ask');
  check('3. 舊存檔、kx_bbq_ask 還在佇列：佇列那份也補上 until',!!q&&q.items[0].ask.until===U,J(q&&q.items[0].ask)); }
/* 4 已經回過的不動 */
{ const G=H.fresh('2025-09-25',12,'dorm',{}); const wed=SAT-3;
  PHONE.rec(G).q.push({day:wed,h:21,items:[OLD('p:zhe')],tag:'bbq_ask'}); G.day=wed; G.hour=21.5; PHONE.tick(G);
  const m=G.msgs.find(m=>m.tag==='bbq_ask'); m.ans=0; G.flags.BBQ_YES=true;
  STORY.phoneRules(H.GM);
  check('4. 已經回過（去。）：答案照舊、BBQ_YES 照舊',m.ans===0&&G.flags.BBQ_YES===true,J({ans:m.ans,yes:G.flags.BBQ_YES})); }
H.done();
