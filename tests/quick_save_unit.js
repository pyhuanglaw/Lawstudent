// 快速存檔、匯出（QUICK-SAVE-EXPORT-1027，使用者 2026-10-27「可以有快速存檔按鍵嗎」「快速匯出」）——不需要瀏覽器。
//   右上 💾：一按打開「快速存檔」「匯出存檔檔案」。存檔＝自己的「快速存檔」一格 fatiao3d_quick（QUICK-SLOT-1030，使用者 2026-10-30 選「獨立快速存檔格」：
//   原本存在自動存檔那一格、下一次自動存檔就蓋掉；存之前上一份備份到 fatiao3d_backup；選單存檔頁「自動存檔」下面一格讀取），劇情進行中不存（存在劇情中途、讀回來會從中途重演：AN-MEAL-STUCK-1027）；
//   匯出＝和「選單 → 存檔 → 匯出 → 下載」同一個檔，任何時候都能按，劇情中還多一欄 _busy（還在跑的是哪一段）；劇情中 💾 半透明留著，其他 HUD 照舊藏起來。
// 檢查（從 src/game3d.js 抽出 quickSave、hideHUD 原樣執行，假的 DOM；index.html、匯出、讀檔看字串）：
//   1. index.html：#hudR 裡有 💾（btnQuick）和兩個按鈕的小框（quickPop，預設收著）
//   2. 劇情進行中按快速存檔：不存、說明原因
//   3. 平常按快速存檔：存到 fatiao3d_quick（不動自動存檔）、上一份備份、提示日期時間與去哪裡讀；寫不進去＝失敗提示
//   6. 選單存檔頁：自動存檔下面有「快速存檔」一格（讀 fatiao3d_quick、可讀取）
//   4. 劇情開始（hideHUD(true)）：💾 半透明、其他 HUD 藏起來、小框不動；結束全部回來
//   5. 匯出：劇情中多一欄 _busy；讀檔（parseImport）把 _busy、_stuck 拿掉；選單的下載和 💾 的匯出是同一個函式
// 修改前（3240d3802）：第 0 項 FAIL（抽不到 quickSave）。QUICK-SLOT-1030 修改前（postrel-1030 6bf203599）：第 3、6 項 FAILED 6。用法：node tests/quick_save_unit.js [game3d.js 路徑]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SRC=fs.readFileSync(process.argv[2]||path.join(ROOT,'src/game3d.js'),'utf8');
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const qs=SRC.match(/\n  function quickSave\(\)\{[\s\S]*?\n  GM\.quickSave=quickSave;\n/), hh=SRC.match(/\n  function hideHUD\(on\)\{[^\n]*\n/);
check('0. 抽得到 quickSave、hideHUD',!!qs&&!!hh);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
// 1. index.html
const hudR=(HTML.match(/<div id="hudR">[\s\S]*?<\/div><\/div>/)||[''])[0];
check('1. #hudR 裡有 💾（btnQuick）、小框 quickPop 預設收著、兩個按鈕',/id="btnQuick"/.test(hudR)&&/<div id="quickPop" class="hide">/.test(hudR)&&/id="btnQuickSave"[^>]*>快速存檔</.test(hudR)&&/id="btnQuickExport"[^>]*>匯出存檔檔案</.test(hudR),hudR.slice(0,120));
// 假的 DOM
function el(id){ const cls=new Set(); return {id,style:{},children:[],classList:{add:(...c)=>c.forEach(x=>cls.add(x)),remove:(...c)=>c.forEach(x=>cls.delete(x)),contains:c=>cls.has(c)}}; }
const els={}; const $=id=>els[id]||(els[id]=el(id));
$('hudR').children=['money','btnPhone','btnQuick','btnMenu','quickPop'].map($);
const toasts=[]; let saves=0; const store={}; let canWrite=true;
const ctx={ $, D:{busyDepth:0,busyWho:[],active:false,stale:false}, GM:{titleIdle:false}, S:{joystick:true},
  G:{day:14,hour:17.56}, E:{player:{}}, CALENDAR:{dateOf:d=>({m:9,d:d})}, autosave:()=>{ saves++; }, toast:(t)=>toasts.push(t), String,
  KEY_QUICK:'fatiao3d_quick', KEY_BACKUP:'fatiao3d_backup', KEY_AUTO:'fatiao3d_auto', menuOpen:false, renderSlots:()=>{},
  read:k=>store[k]||null, write:(k,o)=>{ if(!canWrite) return false; store[k]=o; return true; }, snapshot:()=>({day:ctx.G.day,hour:ctx.G.hour,n:++saves}) };
vm.createContext(ctx);
vm.runInContext(qs[0]+hh[0]+'\nthis.quickSave=quickSave; this.hideHUD=hideHUD;',ctx);
// 2. 劇情進行中
ctx.D.busyDepth=1; ctx.D.busyWho=['X.run (events3d.js)'];
let r=ctx.quickSave();
check('2. 劇情進行中：不存、說明原因（叫玩家按匯出）',r===false&&saves===0&&/劇情進行中/.test(toasts[toasts.length-1]||'')&&/匯出存檔檔案/.test(toasts[toasts.length-1]||''),JSON.stringify(toasts));
// 3. 平常
ctx.D.busyDepth=0; ctx.D.busyWho=[];
r=ctx.quickSave();
check('3. 平常：存到 fatiao3d_quick、不動自動存檔、提示「已快速存檔：9/14 17:33（選單 → 存檔 →「快速存檔」讀取）」',r===true&&store.fatiao3d_quick&&store.fatiao3d_quick.n===1&&!store.fatiao3d_auto&&toasts[toasts.length-1]==='已快速存檔：9/14 17:33（選單 → 存檔 →「快速存檔」讀取）',JSON.stringify({toasts,store}));
ctx.G.day=15; r=ctx.quickSave();
check('3. 再存一次：新的蓋掉快速存檔、上一份備份到 fatiao3d_backup',r===true&&(store.fatiao3d_quick||{}).day===15&&(store.fatiao3d_backup||{}).day===14,JSON.stringify(store));
canWrite=false; r=ctx.quickSave(); canWrite=true;
check('3. 寫不進去：回 false、提示存檔失敗',r===false&&/存檔失敗/.test(toasts[toasts.length-1]||''),JSON.stringify(toasts.slice(-1)));
check('3. 快速存檔不呼叫自動存檔',!/\n  function quickSave\(\)\{[\s\S]*?autosave\(\)[\s\S]*?\n  GM\.quickSave=quickSave;/.test(SRC));
// 4. hideHUD
ctx.hideHUD(true);
check('4. 劇情開始：💾 半透明、手機選單藏起來、小框不動',$('btnQuick').style.opacity===0.55&&$('btnMenu').style.opacity===0&&$('btnPhone').style.opacity===0&&$('quickPop').style.opacity===undefined,JSON.stringify({q:$('btnQuick').style.opacity,m:$('btnMenu').style.opacity,p:$('quickPop').style.opacity}));
ctx.hideHUD(false);
check('4. 劇情結束：全部回來',$('btnQuick').style.opacity===1&&$('btnMenu').style.opacity===1&&$('money').style.opacity===1);
// 5. 匯出、讀檔
check('5. 匯出：劇情中多一欄 _busy（還在跑的那幾段）',/const downloadSave=async\(\)=>\{[^\n]*if\(D\.busyDepth>0\) snap\._busy=\{depth:D\.busyDepth,by:D\.busyWho\.slice\(\)/.test(SRC));
check('5. 選單的下載和 💾 的匯出是同一個函式',/\$\('btnDownload'\)\.onclick=downloadSave;/.test(SRC)&&/\$\('btnQuickExport'\)\.onclick=ev=>\{[^\n]*downloadSave\(\);/.test(SRC));
check('5. 讀檔把 _stuck、_busy 拿掉',/if\(obj&&obj\._stuck\) delete obj\._stuck; if\(obj&&obj\._busy\) delete obj\._busy;/.test(SRC));
// 6. 選單存檔頁
check("6. KEY_QUICK＝'fatiao3d_quick'",/KEY_QUICK='fatiao3d_quick'/.test(SRC));
check('6. 存檔頁：自動存檔下面一格「快速存檔」，讀 KEY_QUICK、只有讀取（沒有存檔鈕：第一個「存檔」照舊是欄位 1）',/mk\('自動存檔',auto,null,\(\)=>loadFrom\(auto\)\); const quick=read\(KEY_QUICK\); mk\('快速存檔（右上 💾）',quick,null,\(\)=>loadFrom\(quick\)\);/.test(SRC));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
