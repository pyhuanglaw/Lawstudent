// 遊戲中被重新載入（使用者 2026-10-14 iPhone 試玩 v9.6：「有時候換地點或按到什麼，會跳出跑到進入遊戲的畫面，顯示請把手機轉為橫向，還好可以按讀取存檔繼續玩，但有點煩」）。
// 不需要瀏覽器：
//   1. 玩的時候（每次進一個區域）在 sessionStorage 記 fatiao3d_live＝1；回標題時拿掉；
//   2. 開機時有標記＋有自動存檔：拿掉「請把手機轉成橫向」、標題寫「按『繼續』從自動存檔接著玩」、「繼續」變成主要按鈕，然後拿掉標記（在標題再重新整理＝一般的標題）；
//   3. 不自動跳進遊戲；sessionStorage 不能用（隱私模式丟例外）時不會壞。修正前（沒有 GM.liveMark／reloadedMidGame）這個測試會失敗。
// 用法：node tests/reload_resume_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const a=src.indexOf("const LIVE='fatiao3d_live'"), b=src.indexOf('GM.boot=async function',a);
check('GM.liveMark、GM.reloadedMidGame 存在',a>0&&b>a&&/GM\.liveMark=function/.test(src)&&/GM\.reloadedMidGame=function/.test(src));
if(!(a>0&&b>a)){ console.log('FAILED: '+fails); process.exit(1); }
const mk=(store)=>{ const GM={}; const window={ get sessionStorage(){ if(store===null) throw new Error('SecurityError'); return store; } }; new Function('GM','window',src.slice(a,b))(GM,window); return GM; };
const mem=()=>{ const m={}; return {m,getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{ m[k]=String(v); },removeItem:k=>{ delete m[k]; }}; };
let S=mem(), GM=mk(S);
check('1. 一開始沒有標記',GM.reloadedMidGame()===false);
GM.liveMark(true); check('1. 玩的時候記標記（fatiao3d_live＝1），重新整理後讀得到',S.m.fatiao3d_live==='1'&&GM.reloadedMidGame()===true,JSON.stringify(S.m));
GM.liveMark(false); check('1. 回標題拿掉標記',!('fatiao3d_live' in S.m)&&GM.reloadedMidGame()===false);
GM=mk(null); let ok=true; try{ GM.liveMark(true); ok=GM.reloadedMidGame()===false; }catch(e){ ok=false; } check('3. sessionStorage 不能用（丟例外）：不會壞、當作沒有標記',ok);
const enterSrc=src.slice(src.indexOf('async function enter(zoneId,spawn,opts)'),src.indexOf('async function enter(zoneId,spawn,opts)')+400);   // 400：開頭多了 GM.enterN 和註解（2ad61c5f 高雄閃家裡），標記還是在 enter 一開始
check('1. 進區域（enter）一開始就記標記',/GM\.liveMark\(true\)/.test(enterSrc));
const titleSrc=src.slice(src.indexOf("$('btnTitle').onclick"),src.indexOf("$('btnTitle').onclick")+600);
check('1. 回標題（選單「回到標題」）拿掉標記',/GM\.liveMark\(false\)/.test(titleSrc));
const bootSrc=src.slice(src.indexOf('const hasAuto=!!read(KEY_AUTO)'),src.indexOf('const hasAuto=!!read(KEY_AUTO)')+700);
check('2. 開機：有自動存檔＋剛剛在玩 → 拿掉轉橫向的遮罩、寫「按『繼續』從自動存檔接著玩」、「繼續」變主要按鈕、拿掉標記',/hasAuto&&GM\.reloadedMidGame\(\)/.test(bootSrc)&&/\$\('rotate'\)\.classList\.remove\('want'\)/.test(bootSrc)&&/從自動存檔接著玩/.test(bootSrc)&&/btnContinue'\)\.classList\.add\('pri'\)/.test(bootSrc)&&/GM\.liveMark\(false\)/.test(bootSrc));
check('3. 不自動跳進遊戲（開機那段沒有 loadFrom）',!/loadFrom\(/.test(bootSrc));
check('2. index.html 標題有 #resumeNote（在「繼續」上面，平常隱藏）',/<div id="resumeNote" class="hide"[^>]*><\/div><button class="btn" id="btnContinue">/.test(html));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
