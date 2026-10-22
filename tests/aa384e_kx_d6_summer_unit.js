// AA_384 E 節（企劃線 1a4f2eb3；AA 10-22 09:45 選①）：可昕慢慢分手 D6 午餐碰到暑假——不需要瀏覽器。
//   D5 在春季學期末（分開那天＝大二下最後一天 2027-06-13），第 61 天（8/13）落在暑假、她在高雄（AA_276）。
//   1 第 61 天那一則照傳（「欸。」＋她自己的好消息）；當天晚上不約午餐（那個週六她在高雄）
//   2 午餐順延到開學以後第一個週六（大三上 9/6 開學 → 9/11），那週週四（9/9）21:00 她傳「週六中午，公館。吃個飯。」（選項「好。」「那天不行。」）
//   3 「好。」＝排在 9/11 12:30 公館；「那天不行。」＝照 D6：下一個週六（週日 21:00 再約）
//   4 對照：分開那天在 2026-12-25（第 61 天在下學期）＝照舊當天晚上約下一個週六；不在高雄另外約（午餐地點都是公館）
// 修改前（開發分支 ddeb53a0）：第 1 項後半、第 2、3 項 FAIL。用法：node tests/aa384e_kx_d6_summer_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE|KXOD|KXDRIFT|MSG|MSG_POOL|MSG2_POOL|HV|HOMETOWN_LINES)$/;
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))) return false; let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
global.CG_REGISTRY={};
/* index.html 的順序（同 tests/aa384_kx_friend_unit.js）*/
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/kxod3d.js','src/kxdrift3d.js']) load(f);
const K=typeof KXDRIFT!=='undefined'?KXDRIFT:{};
const T=(d,h)=>d*24+h, D=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; }, J=x=>JSON.stringify(x);
const setT=(G,d,h)=>{ G.day=d; G.hour=h; G.weekday=wdOf(d); };
const tick=G=>{ K.rule(G); if(typeof KXOD!=='undefined'&&KXOD.rule) KXOD.rule(G); for(const q of OUT.expire(G)) OUT.onMissed(H.GM,q); PHONE.tick(G); };
const run=(G,t0,t1)=>{ for(let t=t0;t<=t1+1e-9;t+=0.5){ const d=Math.floor(t/24+1e-9); setT(G,d,t-d*24); tick(G); } };
const fresh=(k,h)=>{ const G=H.fresh(k,h,'dorm',{dating_kexin:true,KX_OUR_DAY:{day:'sat',mode:'mid'},EXCHANGE_ROUTE:'TW'}); ROM.rec(G); return G; };
const ended=(k,h)=>{ const G=fresh(k,h); K.rule(G); K.end(G,'meet'); return G; };
const askOf=(G,id)=>(G.msgs||[]).find(m=>m.ask&&m.ask.id===id)||null;
const r6msg=G=>(G.msgs||[]).filter(m=>m.tag==='kx_drift_r6_msg').map(m=>[key(m.day),m.text]);
const outs=G=>OUT.rec(G).filter(q=>/^kx_drift_r6_/.test(String(q.id||'')));
check('0. KXDRIFT 有 S.r6Thu（AA_384 E 節）',typeof K.r6Thu==='function');
/* 1、2 */
const E0=CALENDAR.termDays('Y2S2').to, Y3=CALENDAR.termDays('Y3S1').from;
let SAT=null, THU=null;
{ const G=ended(key(E0),20); const E=G.flags.KX_ENDED_ON;
  run(G,T(E+61,20),T(E+61,23.5));
  const m=r6msg(G), a0=askOf(G,'kx_drift_r6_ask1'), satE=(()=>{ let d=E+62; while(wdOf(d)!==6) d++; return d; })();
  check('1. 分開那天＝大二下最後一天（'+key(E)+'）；第 61 天（'+key(E+61)+'）那一則照傳',E===E0&&m.length>=2&&m[0][0]===key(E+61)&&m[0][1]==='欸。',J(m));
  check('1. 第 61 天晚上不約午餐（那個週六 '+key(satE)+' 她在高雄）',!a0&&K.herHome&&K.herHome(G,satE),J({ask:a0&&a0.text,home:K.herHome&&K.herHome(G,satE)}));
  SAT=(()=>{ let d=Y3; while(wdOf(d)!==6) d++; return d; })(); THU=SAT-2;
  run(G,T(THU,20.5),T(THU,20.5)); const a1=askOf(G,'kx_drift_r6_ask1');
  run(G,T(THU,21),T(THU,21.5)); const a2=askOf(G,'kx_drift_r6_ask1');
  check('2. 開學以後第一個週六（'+key(SAT)+'）的週四（'+key(THU)+'）21:00 她傳「週六中午，公館。吃個飯。」（20:30 還沒有）',!a1&&!!a2&&a2.text==='週六中午，公館。吃個飯。'&&a2.day===THU&&Math.abs(a2.h-21)<0.01&&J(a2.ask.opts.map(o=>o.t))===J(['好。','那天不行。']),J({a1:!!a1,a2:a2&&[key(a2.day),a2.h,a2.text,a2.ask.opts.map(o=>o.t)]}));
  PHONE.answer(G,a2.ask.id,0); tick(G); const q=outs(G)[0];
  check('3. 「好。」＝排在 '+key(SAT)+' 12:30 公館',!!q&&q.day===SAT&&q.h===12.5&&q.place==='公館',J(q&&{day:key(q.day),h:q.h,place:q.place})); }
/* 3 不行 */
{ const G=ended(key(E0),20); const E=G.flags.KX_ENDED_ON; run(G,T(E+61,20),T(E+61,23.5)); run(G,T(THU,21),T(THU,21.5)); const a=askOf(G,'kx_drift_r6_ask1');
  PHONE.answer(G,a.ask.id,1); tick(G); run(G,T(SAT+1,20.5),T(SAT+1,21.5)); const b=askOf(G,'kx_drift_r6_ask2');
  check('3. 「那天不行。」＝照 D6：週日（'+key(SAT+1)+'）21:00 再約下一個週六',!!b&&b.day===SAT+1&&b.text==='週六中午，公館。吃個飯。'&&K.rec(G).r6.sat===SAT+7,J(b&&{day:key(b.day),h:b.h,sat:key(K.rec(G).r6.sat)})); }
/* 4 對照 */
{ const G=ended('2026-12-25',20); const E=G.flags.KX_ENDED_ON; run(G,T(E+61,20),T(E+61,23.5)); const a=askOf(G,'kx_drift_r6_ask1');
  check('4. 對照：分開那天 2026-12-25（第 61 天 '+key(E+61)+' 在下學期）＝照舊當天晚上約下一個週六',!!a&&a.day===E+61&&!K.rec(G).r6.post,J(a&&{day:key(a.day),h:a.h})); }
H.done();
