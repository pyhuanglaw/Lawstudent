// 週日住家裡的 R1（AA_160 1-5 第 194 行；DL-04B）：選「今晚住家裡」以前，列那一晚宿舍會錯過的【固】【必】事件（人不在宿舍＝不演）——不需要瀏覽器。
//   1 週日 20:00 在家、那一晚 22:00 宿舍有【固】事件＝HOME.dormMiss 列「22:00 <標題>」；跨過半夜到週一 08:30
//   2 演過了、【延】（沒寫時段）、地點不在宿舍＝不列；週一 01:00 的【固】也列（跨半夜照日期、星期換）
//   3 home3d.js 兩個「今晚住家裡」都走 confirmMiss(…,{dorm:true})
// 修改前（開發分支 856099bb3）：沒有 HOME.dormMiss——FAIL。用法：node tests/dl04b_stayhome_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
check('0. HOME.dormMiss 存在',typeof HOME!=='undefined'&&typeof HOME.dormMiss==='function');
if(typeof HOME==='undefined'||typeof HOME.dormMiss!=='function') H.done();
const SUN=STORY.termDay('Y1S1',5,7)||STORY.termDay('Y1S1',6,0), keyOf=d=>CALENDAR.dateOf(d).key;
const mk=(o)=>Object.assign({id:'ev_test_dorm_r1',title:'（測試）宿舍的晚上',participants:[],location:'dorm',trigger:'auto',term:['Y1S1'],once:true,dialogue:[{speaker:null,text:'x'}]},o);
const mine=L=>L.filter(t=>t.includes('（測試）'));   /* 只看測試事件（那一天真的也有宿舍的事件，例：週一 07:15 選課結果——列出來是對的）*/
const run=(evs,f)=>{ for(const e of evs) STORY_EVENTS.unshift(e); try{ return f(); } finally { for(const e of evs){ const i=STORY_EVENTS.indexOf(e); if(i>=0) STORY_EVENTS.splice(i,1); } } };
const at=()=>{ const G=H.fresh(keyOf(SUN),20,'home',{}); G.weekday=CALENDAR.dateOf(SUN).wd%7; return G; };
{ const G=at(); const wd=G.weekday; const a=mine(run([mk({weekday:[wd],time:[22,23]})],()=>HOME.dormMiss(G,24+8.5)));
  check('1. 週日 20:00 在家、那一晚 22:00 宿舍的【固】：列「22:00 （測試）宿舍的晚上」；時間、地點放回去',J(a)===J(['22:00 （測試）宿舍的晚上'])&&G.hour===20&&G.zone==='home'&&G.day===SUN,J({a,h:G.hour,z:G.zone})); }
{ const G=at(); const wd=G.weekday, mon=(wd+1)%7;
  const b=mine(run([mk({weekday:[wd],time:[22,23]})],()=>{ G.events.done.ev_test_dorm_r1=1; const r=HOME.dormMiss(G,24+8.5); delete G.events.done.ev_test_dorm_r1; return r; }));
  const c=mine(run([mk({})],()=>HOME.dormMiss(G,24+8.5))), d=mine(run([mk({location:'campus',weekday:[wd],time:[22,23]})],()=>HOME.dormMiss(G,24+8.5))), e=mine(run([mk({weekday:[mon],time:[1,2]})],()=>HOME.dormMiss(G,24+8.5)));
  check('2. 演過了、【延】（沒寫時段）、地點不在宿舍＝不列；週一 01:00 的【固】列（跨半夜換日期、星期）',!b.length&&!c.length&&!d.length&&J(e)===J(['01:00 （測試）宿舍的晚上']),J({b,c,d,e})); }
{ const src=fs.readFileSync(path.join(H.ROOT,'src/home3d.js'),'utf8'); const n=(src.match(/confirmMiss\(GM,24\+\(wk!=null\?wk:8\.5\),\{dorm:true\}\)/g)||[]).length;
  check('3. 兩個「今晚住家裡」都走 confirmMiss(…,{dorm:true})',n===2,String(n)); }
H.done();
