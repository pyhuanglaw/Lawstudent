// INV-MEET-YIELD-1113（BB-C 11-13 P3，LAWWW-C 決定讓位）：約好的女主角在場時，互動鍵優先給她，別人的初見事件（總圖「和常在圖書館的男生說話」）不搶。
//   1  INV.meetPref：約好、當天、時間到了、人在約的那一區＝她的 id；沒約、別天、別區、時間還沒到＝null
//   2  game3d.js updateInteract 把 INV.meetPref 設成 E.prefNpc（findWho 優先）；engine3d.js 對 E.prefNpc 多算 1.5 m（原本「帶我去」的做法）
// 用法：node tests/inv_meet_yield_1113_unit.js
const H=require('./pg_harness.js'); const {check}=H; const fs=require('fs'), path=require('path'); console.warn=()=>{};
const G=H.fresh('2026-10-14',14.0,'library_hall'); H.FRIEND('kexin');
const P=INV.place('library'); const zone=(P&&P.zone)||'library_hall';
G.zone=zone; G.invites=[{id:1,who:'kexin',place:'library',zone,day:G.day,h:14,state:'accepted',label:'念書'}];
check('1. 約好、當天、14:00、人在'+zone+'＝kexin',INV.meetPref(G)==='kexin',String(INV.meetPref(G)));
G.zone='campus'; check('1. 人在別區＝null',INV.meetPref(G)===null,String(INV.meetPref(G))); G.zone=zone;
G.hour=10; check('1. 時間還沒到（10:00，約 14:00）＝null',INV.meetPref(G)===null,String(INV.meetPref(G))); G.hour=14;
G.invites[0].day=G.day+1; check('1. 約的是明天＝null',INV.meetPref(G)===null,String(INV.meetPref(G))); G.invites[0].day=G.day;
G.invites=[]; check('1. 沒約＝null',INV.meetPref(G)===null);
const g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), e3=fs.readFileSync(path.join(H.ROOT,'src/engine3d.js'),'utf8');
check('2. game3d.js updateInteract：E.prefNpc＝findWho，沒有才用 INV.meetPref',/E\.prefNpc=\(G\.flags&&G\.flags\.findWho\)\|\|\(typeof INV!=='undefined'&&INV\.meetPref\?INV\.meetPref\(G\):null\)\|\|null/.test(g3));
check('2. engine3d.js：E.prefNpc 的人多算 1.5 m',/E\.prefNpc&&\(n\.charId===E\.prefNpc\|\|n\.id===E\.prefNpc\)\?1\.5:0/.test(e3));
H.done ? H.done() : (()=>{ const f=H.fails|0; console.log(f?'FAILED: '+f:'ALL PASS'); process.exit(f?1:0); })();
