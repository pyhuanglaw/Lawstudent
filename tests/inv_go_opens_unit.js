// 手機「今天約好的」：約的地方還沒開門＝不給「前往」，寫幾點開門；開門那一刻起才有按鈕（UX-QUICKGO-BEFORE-OPEN-1107；BB-B 11-07 AA_722 小路 18:00）——不需要瀏覽器（D131）。
// 起因：17:40 按「前往」只出「還沒開」，開門以後要再按一次。LAWWW-B 定 BB 的選項 2（不加「先走到門口等」）。
// 檢查：1 小路 18:00 的約，17:40 看手機＝「18:00 開門」、沒有「前往」；2 18:00 整＝「前往」；3 一直開著的地方（2:30 AM 15:00）照舊「前往」；
//       4 公休日（週二）約在小路＝「現在沒有開」、沒有「前往」；5 game3d.js 的 placeState 和 openAt 同一個判斷（zoneShut 照舊，沒給時間＝現在）。
// 修改前 1、4、5 FAIL。用法：node tests/inv_go_opens_unit.js
const H=require('./pg_harness.js');
const {check}=H; const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
const grab=(a,b)=>{ const i=src.indexOf(a), j=src.indexOf(b,i+1); return i>=0&&j>i?src.slice(i,j):''; };
const helpers=grab('  function zoneShut(','  function placeState('), today=grab('  function invTodayHTML(','  function openPhone('), ft=grab('  function fmtTime(','  GM.fmtTime=');
if(!helpers||!today||!ft){ check('0. game3d.js 找得到 zoneShut、invTodayHTML、fmtTime',false); H.done(); }
const mk=new Function('INV','PLACES','Z3','getG',ft+'let G; '+helpers+today+'; return ()=>{ G=getG(); return invTodayHTML(); };');
const html=()=>mk(INV,PLACES,{ZONES:{},roomGlbOpen:()=>true},()=>H.G)();
const iv=(G,place,h)=>{ G.invites=[{id:7,who:'heroine_01',place,day:G.day,h,state:'accepted'}]; };
const rowOf=s=>{ const m=s.match(/<div class="phrow">[\s\S]*?<\/div><(button|span)[^>]*>([^<]*)<\/(button|span)>/); return m?m[2]:(s.match(/今天約好的/)?'(沒有按鈕列)':''); };
(async()=>{
  { const G=H.fresh('2025-10-23',17+40/60,'campus'); H.FRIEND('heroine_01'); iv(G,'wz_teishoku',18); const a=html(); G.hour=18; const b=html();
    check('1. 小路 18:00 的約，17:40 看手機：「18:00 開門」、沒有「前往」',/18:00 開門/.test(a)&&!/data-invgo/.test(a),rowOf(a));
    check('2. 18:00 整：「前往」',/data-invgo="7"/.test(b)&&!/開門/.test(b),rowOf(b)); }
  { const G=H.fresh('2025-10-23',15,'campus'); H.FRIEND('heroine_01'); iv(G,'cafe',15.5); const a=html();
    check('3. 一直開著的地方（2:30 AM 15:00）照舊「前往」',/data-invgo="7"/.test(a),rowOf(a)); }
  { const G=H.fresh('2025-10-21',17.5,'campus'); H.FRIEND('heroine_01'); iv(G,'wz_teishoku',18); const a=html();
    check('4. 週二公休約在小路：「現在沒有開」、沒有「前往」',G.weekday===2&&/現在沒有開/.test(a)&&!/data-invgo/.test(a),JSON.stringify({wd:G.weekday,row:rowOf(a)})); }
  check('5. placeState 的 open 照舊（PLACES.isOpen 現在＋zoneShut(z) 沒給時間）；openAt 同一個判斷',/const shut=zoneShut\(z\); const open=\(typeof PLACES==='undefined'\|\|PLACES\.isOpen\(z,G\.hour,G\.day\)\)&&!shut;/.test(src)&&/function openAt\(z,hr\)\{ return \(typeof PLACES==='undefined'\|\|PLACES\.isOpen\(z,hr,G\.day\)\)&&!zoneShut\(z,hr\); \}/.test(src));
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
