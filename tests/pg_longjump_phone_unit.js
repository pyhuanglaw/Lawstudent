// 畢業以後長跳（60 天以上）也要跑每個整點的手機規則（AA 2026-10-21 盤點發現；src/postgrad3d.js S.jumpTo）。
// 原本：60 天以上每 6 小時看一次，起點不在整點（例：21:15）時每一步都不在整點，STORY.phoneRules（hourly）整段都不跑——
//   規則寫「那一天、幾點以後」（G.day===d&&G.hour>=h）的訊息會整段不見（可昕 10/10 週年邀約、10/17 第五年……）。
// 長跳每 6 小時看一次、對齊在 05／11／17／23 點（每個整點都跑太慢：83 天約 2.3 秒）——每天 23 點那一次保證「那一天幾點以後」的規則跑得到。
// 檢查：9/22 21:15 跳到 12/14 09:00，中間 10/10 20:00 以後才成立的規則有跑到、跳停在那一則訊息；22:30 以後才成立的也跑得到；5 點以後、11 點以前的也跑得到；跳的時間不會太久。
// 用法：node tests/pg_longjump_phone_unit.js
const H=require('./pg_harness.js');
const D=H.D;
H.fresh('2029-09-22',21.25,'dorm',{});
let fired=[]; const day1010=D('2029-10-10'), day1017=D('2029-10-17');
STORY.PHONE_RULES.push((G)=>{ if(G.day===day1010&&G.hour>=20&&!fired.includes('a')){ fired.push('a'); PHONE.at(G,G.day,G.hour,[{th:'p:kexin',from:'kexin',text:'測試：10/10 晚上'}],'t_pg_1010'); } });
STORY.PHONE_RULES.push((G)=>{ if(G.day===day1017&&G.hour>=22.5&&!fired.includes('b')){ fired.push('b'); } });
const day1020=D('2029-10-20'); STORY.PHONE_RULES.push((G)=>{ if(G.day===day1020&&G.hour>=5&&G.hour<11&&!fired.includes('c')){ fired.push('c'); } });
const t0=Date.now(); const r=PG.jumpTo(H.GM,D('2029-12-14')*24+9); const ms=Date.now()-t0;
H.check('長跳（83 天、起點 21:15）跑到 10/10 20:00 以後的規則：停在那一則訊息（msg）、停的那天是 10/10',fired.includes('a')&&r==='msg'&&H.G.day===day1010,JSON.stringify({r,fired,day:H.G.day,hour:H.G.hour}));
// 接著從 10/10 跳下去：10/17 22:30 以後才成立的規則也要跑到（每個整點都看）
const r2=PG.jumpTo(H.GM,D('2029-12-14')*24+9);
H.check('接著跳：10/17 22:30 以後才成立的規則也跑到（23:00 那一格）',fired.includes('b'),JSON.stringify({r2,fired,day:H.G.day,hour:H.G.hour}));
H.check('接著跳：10/20 05:00～11:00 才成立的規則也跑到（05:00 那一格）',fired.includes('c'),JSON.stringify(fired));
H.check('83 天的長跳不會太久（< 1.5 秒；每個整點都跑要 2.3 秒）',ms<1500,ms+' ms');
H.done();
