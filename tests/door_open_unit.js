// 人物開門（ANIM-DOOR-OPEN-1027／USER_WANTS A21 第一階段；LAWWW2-C 2026-10-27）：src/door3d.js 判斷哪些出入口是門、推門的時間、手放下；game3d.js 接線。不需要瀏覽器。
// 用法：node tests/door_open_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const f=path.join(ROOT,'src/door3d.js'); if(fs.existsSync(f)) vm.runInThisContext(fs.readFileSync(f,'utf8').replace(/^const DOOR\s*=/m,'global.DOOR='),{filename:'src/door3d.js'});
check('① DOOR 存在（kind、open、close）',typeof DOOR!=='undefined'&&typeof DOOR.open==='function'&&typeof DOOR.kind==='function');
if(typeof DOOR==='undefined'){ console.log('FAILED '+fails); process.exit(1); }
/* 遊戲裡實際的出入口（grep 'label:…,exit:' 與幾個 getter 的字）：[標籤, 去哪, 從哪, 應該是] */
const CASES=[['進入阿鳳麵店','noodle','gongguan','none'],['進入舊路書房','bookstore','gongguan','push'],['進入兩點半 Café','cafe','wenzhou','push'],['進入萬才館（二樓）','wancai','campus','push'],
  ['離開咖啡廳','wenzhou','cafe','push'],['離開麵店','gongguan','noodle','none'],['離開教室','linze','classroom','push'],['離開總圖','campus','library_hall','push'],['走出房間','dorm_hall','dorm','push'],
  ['走出霖澤館','campus','linze','push'],['離開宿舍','campus','dorm_hall','push'],['出門','us_outside','us_apartment','push'],['回公寓','us_apartment','us_outside','push'],['離開萬才館','campus','wancai','push'],
  ['進入便利商店','cvs','gongguan','auto'],['離開便利商店','gongguan','cvs','auto'],['過馬路（對面的亞洲超市）','us_asian_market','us_market','none'],
  ['往溫州街','wenzhou','gongguan','none'],['回到校園','campus','gongguan','none'],['回公館','gongguan','lane118','none'],['樓梯間：下樓（2F 自習區、1F 大廳）','library_hall','library','none'],
  ['上樓到 3F 主球場','gym_3f','gym','none'],['下樓到 B1（健身中心・游泳池）','gym_b1','gym','none'],['搭車離開（回台北）','campus','airport_arr','none'],['上 3F（考場）','x','y','none'],['走出去（大樓梯平台）','campus','wancai','push']];
{ const bad=CASES.filter(([lb,to,from,want])=>(DOOR.kind({label:lb,exit:{to}},from)||'none')!==want).map(c=>c[0]+'→'+(DOOR.kind({label:c[0],exit:{to:c[1]}},c[2])||'none'));
  check('② 哪些出入口是門：進入／離開／走出／出門＝推門；便利商店＝自動門；開放式的麵店＝不是門；樓梯、電梯、往…的路、搭車、過馬路、回到校園＝不是門（'+CASES.length+' 個）',!bad.length,bad.join('、')); }
check('② exit.door 可以蓋過判斷（none／auto／push）',DOOR.kind({label:'進入舊路書房',exit:{to:'bookstore',door:'none'}},'gongguan')===null&&DOOR.kind({label:'往某處',exit:{to:'x',door:'push'}},'y')==='push'&&DOOR.kind({label:'進入阿鳳麵店',exit:{to:'noodle',door:'auto'}})==='auto');
check('② label 是 getter 也讀得到',DOOR.kind({get label(){ return '離開書店'; },exit:{to:'gongguan'}},'bookstore')==='push');
/* 推門：0.45 秒左右演完、手伸出去、轉向門；變黑以後手放下 */
(async()=>{
  const mk=(x,z,ry,riding)=>{ const o={position:{x,z},rotation:{y:ry},userData:{}}; return {G:{zone:'gongguan'},E:{player:{obj:o,riding:!!riding}}}; };
  { const GM=mk(0,0,Math.PI); const t0=Date.now(); const p=DOOR.open(GM,{x:0,z:2,label:'進入舊路書房',exit:{to:'bookstore'}}); const k=p&&await p; const dt=Date.now()-t0, u=GM.E.player.obj.userData;
    check('③ 推門：回傳 push、約 0.45 秒（0.35～0.8）演完才換區域',k==='push'&&dt>=350&&dt<=800,dt+' ms');
    check('③ 演完的時候手伸出去（疊加姿勢 k＝1、右上臂往前）',!!u.overlay&&u.overlay.door&&Math.abs(u.overlay.k-1)<1e-6&&u.overlay.bones.RightArm[1]>1);
    check('③ 轉向門（門在 +z：朝向 0）',Math.abs(Math.atan2(Math.sin(GM.E.player.obj.rotation.y),Math.cos(GM.E.player.obj.rotation.y)))<0.02,GM.E.player.obj.rotation.y.toFixed(3));
    await new Promise(r=>setTimeout(r,300)); const still=!!u.overlay; GM.E.zone={id:'noodle'}; await new Promise(r=>setTimeout(r,80));
    check('③ 還沒換區域的時候手還伸著；換到新區域（E.zone 換了）的下一格手放下（不用計時器：換區域會卡住主執行緒，計時器會晚）',still&&u.overlay===null); }
  { const GM=mk(0,0,0); GM.E.zone={id:'gongguan'}; const p=DOOR.open(GM,{x:0,z:2,label:'進入舊路書房',exit:{to:'bookstore'}}); await p; await new Promise(r=>setTimeout(r,4300));
    check('③ 沒有換成（出入口鎖著、讀取失敗）：4 秒後手也會放下',GM.E.player.obj.userData.overlay===null); }
  { const GM=mk(0,0,0); const p=DOOR.open(GM,{x:0,z:2,label:'進入便利商店',exit:{to:'cvs'}}); const k=p&&await p; check('④ 自動門：不伸手（沒有疊加姿勢）',k==='auto'&&!GM.E.player.obj.userData.overlay); }
  { const GM=mk(0,0,0); check('④ 不是門：馬上回傳 null（照舊換區域）',DOOR.open(GM,{x:0,z:2,label:'往溫州街',exit:{to:'wenzhou'}})===null); }
  { const GM=mk(0,0,0,true); check('④ 騎腳踏車：不演',DOOR.open(GM,{x:0,z:2,label:'進入舊路書房',exit:{to:'bookstore'}})===null); }
  { const GM=mk(0,0,0); GM.E.player.obj.userData.overlay={bones:{},k:1}; DOOR.close(GM); check('④ 手放下只清自己的（羽球短片的疊加姿勢不動）',!!GM.E.player.obj.userData.overlay); }
  { const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), ch=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8');
    check('⑤ game3d.js：按出入口先 DOOR.open（演完）再 enter',/if\(it\.exit\)\{ if\(it\.exit\.locked\)\{[^}]*\} if\(typeof DOOR!=='undefined'\)\{ const dp=DOOR\.open\(GM,it\); if\(dp\) await dp; \} await enter\(it\.exit\.to,it\.exit\.spawn\);/.test(g));
    check('⑤ index.html 在 game3d.js 前面載入 src/door3d.js',ix.indexOf('src/door3d.js')>0&&ix.indexOf('src/door3d.js')<ix.indexOf('src/game3d.js'));
    check('⑤ character3d.js 有疊加姿勢的掛勾 u.overlay（羽球短片加的；開門靠它）',/if\(u\.overlay&&u\.overlay\.bones\)/.test(ch)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
