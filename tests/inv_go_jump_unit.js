// 一鍵前往約會＝時間跳到約好的時間、人帶到那個地點（INV-GO-JUMP-1110，使用者 2026-11-10 X290「一鍵前往約會地點 時間也要到那時候
// 有時候會出現還沒開 或時間還沒到 一鍵前往就是要跳到那個時間 那個地點」）——不需要瀏覽器（D131）。
// src/invites3d.js（S.goTimes、S.goNow）、src/game3d.js（quickGo 的 o.arriveOpen、手機「今天約好的」）、src/onetap3d.js（「到下一個約會地點」的出發時間）。
//   1 S.goTimes：一直開著的地方＝到的時間是她到的時間（約好的前 15 分鐘）；18:00 才開門的小路、約 18:00＝到的時間 18:00（不是 17:45）；出發＝到的時間減路程
//   2 公休日（等她的時間裡都沒開）＝null
//   3 S.goNow：13:00 在宿舍、約 15:00 Café＝先 CLS.skipTo 到出發時間，再快速前往（force＋arriveOpen）
//   4 S.goNow：跳過時間中途停下來（課、劇情）＝不出門
//   5 S.goNow：出發時間已經到了＝不跳，直接出門
//   6 quickGo：o.arriveOpen＝現在還沒開、到的時候開了也可以出發（其他快速前往照舊看現在）
//   7 手機「今天約好的」：17:40 看小路 18:00 的約＝有「前往」，寫「按「前往」會先跳到 HH:MM 出發（18:00 開門）」；公休日照舊「現在沒有開」、沒有「前往」
//   8 一鍵「到下一個約會地點」（ONETAP.datePlan）：當面約的出發時間＝S.goTimes 的 leave；小路 18:00 的約，17:20＝先等到 17:40 出發（原本 15 分鐘內直接出發、到了還沒開）
// 修改前 1～8 FAIL（沒有 S.goTimes；goNow 不跳時間；quickGo 只看現在開不開；手機 17:40 只寫「18:00 開門」）。用法：node tests/inv_go_jump_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const fs=require('fs'), path=require('path');
if(typeof ONETAP==='undefined') require('vm').runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/onetap3d.js'),'utf8').replace(/^const ONETAP\s*=/m,'globalThis.ONETAP='),{filename:'src/onetap3d.js'});   /* [前置] pg_harness 沒載入一鍵 */
const J=JSON.stringify;
const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
const grab=(a,b)=>{ const i=g.indexOf(a), j=g.indexOf(b,i+1); return i>=0&&j>i?g.slice(i,j):''; };
const helpers=grab('  function zoneShut(','  function placeState('), today=grab('  function invTodayHTML(','  function openPhone('), ft=grab('  function fmtTime(','  GM.fmtTime=');
const mkHTML=()=>new Function('INV','PLACES','Z3','getG',ft+'let G; '+helpers+today+'; return ()=>{ G=getG(); return invTodayHTML(); };')(INV,PLACES,{ZONES:{},roomGlbOpen:()=>true},()=>H.G)();
const mkOpen=()=>new Function('PLACES','Z3','getG',ft+'let G; '+helpers+'; return (z,h)=>{ G=getG(); return openAt(z,h); };')(PLACES,{ZONES:{},roomGlbOpen:()=>true},()=>H.G);
const openAt=helpers?mkOpen():null;
const mkIv=(G,place,h)=>{ const P=INV.place(place)||{}; const iv={id:7,who:'heroine_01',place,zone:P.zone,day:G.day,h,state:'accepted'}; G.invites=[iv]; return iv; };
const near=(a,b)=>Math.abs(a-b)<1e-6;
(async()=>{
  check('0. 有 INV.goTimes；game3d.js 找得到 zoneShut、invTodayHTML、fmtTime',typeof INV.goTimes==='function'&&!!helpers&&!!today&&!!ft);
  if(typeof INV.goTimes!=='function'||!openAt){ H.done(); return; }
  /* ---- 1、2 ---- */
  { const G=H.fresh('2025-10-23',13,'dorm'); H.FRIEND('heroine_01'); const a=INV.goTimes(G,mkIv(G,'cafe',15),20,h=>openAt('cafe',h));
    check('1. 一直開著的 2:30 AM、約 15:00、路程 20 分：到 14:45（她到的時間）、出發 14:25',a&&near(a.arrive,14.75)&&near(a.leave,14.75-20/60),J(a));
    const b=INV.goTimes(G,mkIv(G,'wz_teishoku',18),15,h=>openAt('wz_teishoku',h));
    check('1. 小路 18:00 開門、約 18:00、路程 15 分：到 18:00（開門那一刻，不是 17:45）、出發 17:45',b&&near(b.arrive,18)&&near(b.leave,17.75),J(b)); }
  { const G=H.fresh('2025-10-21',13,'dorm'); H.FRIEND('heroine_01'); const c=INV.goTimes(G,mkIv(G,'wz_teishoku',18),15,h=>openAt('wz_teishoku',h));
    check('2. 週二公休約在小路：等她的時間裡都沒開＝null',G.weekday===2&&c===null,J({wd:G.weekday,c})); }
  /* ---- 3～5 ---- */
  const realSkip=CLS.skipTo, realQG=GM.quickGo, realOA=GM.openAt, realPM=GM.placeMins;
  let skips=[], went=[], stopAt=null;
  CLS.skipTo=async(gm,h1,o)=>{ skips.push(h1); const G=H.G, base=Math.floor(G.hour/24)*24; G.hour=base+(stopAt!=null?stopAt:h1); return true; };   /* [前置] 假的跳過時間：記下目標、把時間設過去（stopAt＝中途停下來）*/
  GM.quickGo=async(pl,o)=>{ went.push({pl,o}); H.G.zone=pl[0]; };
  GM.openAt=(z,h)=>openAt(z,h); GM.placeMins=()=>20;
  try{
    { const G=H.fresh('2025-10-23',13,'dorm'); H.FRIEND('heroine_01'); skips=[]; went=[]; stopAt=null; const iv=mkIv(G,'cafe',15); const ok=await INV.goNow(GM,iv);
      check('3. 13:00 在宿舍、約 15:00 Café（路程 20 分）：先跳到 14:25 出發，再快速前往到 cafe（force＋arriveOpen）',ok&&skips.length===1&&near(skips[0],14.75-20/60)&&went.length===1&&went[0].pl[0]==='cafe'&&went[0].o.force===true&&went[0].o.arriveOpen===true,J({skips,went:went.map(w=>[w.pl[0],w.o])}));
      check('3. 前往的時候 goAsked＝1（等出發的這段時間不再跳「直接過去」）',iv.goAsked===1); }
    { const G=H.fresh('2025-10-23',13,'dorm'); H.FRIEND('heroine_01'); skips=[]; went=[]; stopAt=13.5; const ok=await INV.goNow(GM,mkIv(G,'cafe',15));
      check('4. 跳過時間中途停在 13:30（課、劇情）：不出門',!ok&&skips.length===1&&!went.length,J({skips,went:went.length})); }
    { const G=H.fresh('2025-10-23',14.4,'dorm'); H.FRIEND('heroine_01'); skips=[]; went=[]; stopAt=null; const ok=await INV.goNow(GM,mkIv(G,'cafe',15));
      check('5. 14:24（出發時間 14:25 以內）：不跳，直接出門',ok&&!skips.length&&went.length===1,J({skips,went:went.length})); }
  } finally { CLS.skipTo=realSkip; GM.quickGo=realQG; GM.openAt=realOA; GM.placeMins=realPM; stopAt=null; }
  /* ---- 6 ---- */
  check('6. quickGo：o.arriveOpen＝到的時候（現在＋路程）開了也可以出發',/if\(!st\.open&&!\(o&&o\.arriveOpen&&openAt\(st\.hz,G\.hour\+st\.mins\/60\)\)\)\{ toast\(/   /* WZ-QUICKTRAVEL-1110：openAt(z → st.hz)＝營業時間照那一家（溫州街騎樓窗口、櫥窗的店；其他地點 hz＝z）*/.test(g));
  check('6. GM.openAt、GM.placeMins 有接出來（INV.goNow 用）',/GM\.openAt=openAt; GM\.placeMins=pl=>placeState\(pl\)\.mins;/.test(g));
  /* ---- 7 ---- */
  { const G=H.fresh('2025-10-23',17+40/60,'campus'); H.FRIEND('heroine_01'); mkIv(G,'wz_teishoku',18); const a=mkHTML();
    check('7. 17:40 看小路 18:00 的約：有「前往」、寫「按「前往」會先跳到 HH:MM 出發（18:00 開門）」',/data-invgo="7"/.test(a)&&/按「前往」會先跳到 \d\d:\d\d 出發（18:00 開門）/.test(a),a.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,200)); }
  { const G=H.fresh('2025-10-21',17.5,'campus'); H.FRIEND('heroine_01'); mkIv(G,'wz_teishoku',18); const a=mkHTML();
    check('7. 週二公休約在小路：照舊「現在沒有開」、沒有「前往」',/現在沒有開/.test(a)&&!/data-invgo/.test(a)); }
  /* ---- 8 ---- */
  { const G=H.fresh('2025-10-23',17+20/60,'campus'); H.FRIEND('heroine_01'); const iv=mkIv(G,'wz_teishoku',18);
    const realOA2=GM.openAt; GM.openAt=(z,h)=>openAt(z,h);
    try{ const L=ONETAP.dateList(GM), c=L.find(x=>x.kind==='inv'), T=INV.goTimes(G,iv,c?c.mins:0,h=>openAt('wz_teishoku',h)), p=ONETAP.datePlan(GM);
      check('8. 一鍵「到下一個約會地點」：當面約的出發時間＝INV.goTimes 的 leave',!!c&&!!T&&near(c.dep-G.day*24,T.leave),J({dep:c&&c.dep-G.day*24,T}));
      check('8. 小路 18:00 的約、17:20（路程 20 分）：先等到 17:40 出發、18:00 到（原本 15 分鐘內直接出發、17:40 到了還沒開門）',p.ok&&p.wait>0.02&&near(p.leave-G.day*24,T.leave),J({ok:p.ok,why:p.why,wait:p.wait,lines:p.lines}));
    } finally { GM.openAt=realOA2; } }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
