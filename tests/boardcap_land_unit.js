// UX-BOARDCAP-LAND（BB 2026-11-02 16:49，CC_27 截圖 21）：對話框出現時，字幕（#caption）推到對話框上面，不重疊
// 瀏覽器量測（LAWWW 17:0x，手機模擬 844×390／390×844，tax_law 第 8 週黑板兩行＋老師一句）：橫向字幕底 264、對話框頂 272；直向 718／726
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..'); let fails=0;
const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('1. CSS：#ui:has(#dlg:not(.hide)) #caption 的 bottom＝對話框底＋--dlgH＋8px（沒有量到時用 112px）',/#ui:has\(#dlg:not\(\.hide\)\) #caption\{bottom:calc\(max\(14px,env\(safe-area-inset-bottom\)\) \+ var\(--dlgH,112px\) \+ 8px\)\}/.test(html));
check('2. #caption 在 #ui 裡面（:has 才選得到）',html.indexOf('<div id="ui">')>=0&&html.indexOf('<div id="caption"')>html.indexOf('<div id="ui">'));
check('3. game3d.js：ResizeObserver＋MutationObserver 把對話框高度寫進 --dlgH；caption() 出現時也同步一次',/new ResizeObserver\(dlgHSync\)\.observe\(dl\)/.test(g)&&/new MutationObserver\(/.test(g)&&/function caption\(who,text,ms\)\{ dlgHSync\(\);/.test(g));
check('4. 沒有對話框時字幕照舊（原本的 bottom 規則還在）',/#caption\{position:absolute;left:50%;bottom:calc\(max\(14px,env\(safe-area-inset-bottom\)\) \+ 66px\)/.test(html));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
