/* BUG-DLG-NEXT-OVERLAP-1110（BB 11-10，CC x295_portrait_putong_p07_overlap.png）：手機直向三行台詞最後一行被右下角「▼ 點一下繼續」（#dlgNext，絕對定位）壓住。
   查 index.html 的 CSS：#dlgNext 佔的高度（bottom＋字高 1.4 倍）要落在 #dlg 下邊距＋#dlgText 下邊距之內——文字的最後一行就不會和它重疊。修之前 #dlgText 沒有 padding-bottom → FAIL。 */
const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let fail=0; const check=(n,ok,d)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+(d||''))); if(!ok) fail++; };
const rule=sel=>{ const m=html.match(new RegExp(sel.replace('#','\\#')+'\\{([^}]*)\\}')); return m?m[1]:''; };
const px=(css,prop)=>{ const m=css.match(new RegExp('(?:^|;)\\s*'+prop+'\\s*:\\s*([0-9.]+)px')); return m?+m[1]:0; };
const pad=css=>{ const m=css.match(/(?:^|;)\s*padding\s*:\s*([0-9.]+)px(?:\s+([0-9.]+)px)?(?:\s+([0-9.]+)px)?/); if(!m) return 0; return +(m[3]||m[1]); };
const dlg=rule('#dlg'), txt=rule('#dlgText'), nxt=rule('#dlgNext');
check('找得到 #dlg、#dlgText、#dlgNext 的 CSS',dlg&&txt&&nxt);
check('#dlgNext 是絕對定位在右下角',/position:absolute/.test(nxt)&&/bottom:/.test(nxt));
const need=px(nxt,'bottom')+px(nxt,'font-size')*1.4, have=pad(dlg)+px(txt,'padding-bottom');
check('「▼ 點一下繼續」佔的高度 ≤ 對話框下邊距＋文字下邊距（文字最後一行不被壓住）',have>=need,'需要 '+need.toFixed(1)+' px，現在 '+have+' px');
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
