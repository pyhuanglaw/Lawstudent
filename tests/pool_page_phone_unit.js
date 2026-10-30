// POOL-PAGE-PHONE-1028（BB-C 2026-10-28 08:48，讀程式確認）：同學二十位的人物頁新內容（AA_498 第 2 節：人物頁一句話 cardBefore／card、朋友＝personality；
//   做過的事 POOL.addDeed：「陪他旁聽過一堂社工系的課」…）只接在舊的 renderPeople（選單「人物」頁籤已經拿掉），玩家實際看的手機人物頁 personHTML 沒有。
//   做法（src/game3d.js personHTML）：有 card／cardBefore 的 B 層人物（同學二十位）一句話照 POOL.pageDesc；後面接 POOL.deedsHTML（沒有就是空的）；其他人照舊。
//   不需要瀏覽器：personHTML 的相依太多，看原始碼＋POOL.pageDesc／deedsHTML 本身用 pool3d.js 跑（瀏覽器由 BB aafix_chengen 看畫面）。
// 修改前（7fd3c7f06，git stash 實跑）：FAILED 2（2、3）。修改後 ALL PASS。用法：node tests/pool_page_phone_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const SRC=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const a=SRC.indexOf('  function personHTML(id){'), b=SRC.indexOf('  function friendsHTML(){');
const ph=a>0&&b>a?SRC.slice(a,b):'';
check('1. game3d.js 找得到 personHTML（手機「朋友」→ 人物頁）',!!ph);
check('2. personHTML：有 card／cardBefore 的 B 層人物（同學二十位）一句話照 POOL.pageDesc（其他人照舊 facts／personality）',/poolPage=c\.social_layer==='B'&&typeof POOL!=='undefined'&&!!POOL\.pageDesc&&\(c\.card!=null\|\|c\.cardBefore!=null\)/.test(ph)&&/poolPage\?POOL\.pageDesc\(id\):/.test(ph));
check('3. personHTML：一句話後面接做過的事 POOL.deedsHTML(id,G)（在 SOCIAL.describe 前面）',/POOL\.deedsHTML\(id,G\)/.test(ph)&&/esc\(desc\)\+'<\/div>'\+deeds\+'<div>'\+SOCIAL\.describe\(id\)/.test(ph));
const rp=SRC.slice(SRC.indexOf('  function renderPeople(){'),SRC.indexOf('  function renderLegal(){'));
check('4. 舊的 renderPeople 照舊（沒動）',/POOL\.pageDesc\(id\)/.test(rp)&&/POOL\.deedsHTML\(id,G\)/.test(rp));
console.log(fails?'FAILED '+fails:'ALL PASS');
process.exit(fails?1:0);
