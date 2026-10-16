// DL-02 拿掉體力（AA_160 2-8；使用者 2026-10-16「體力的設計都刪掉　根本不會去管」）——不需要瀏覽器。
// 檢查：HUD 沒有體力條、說明頁沒有體力；選單提示（座位、商店、麵店、宿舍書桌）不寫體力；GM.energy 留著但不做事、G.energy 固定 100；
//       舊存檔（體力 40）讀進來變 100；睡覺、出遊過夜不再改體力；健身的「體能」不受影響（還沒有健身，所以只查程式裡沒有誤刪）。
const fs=require('fs'), path=require('path'); const ROOT=path.join(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const html=rd('index.html');
check('HUD 沒有體力條（#energy）、右上角只剩錢',!/id="energy"/.test(html)&&/<div class="chip"><span id="money">/.test(html));
check('說明頁沒有「體力」',!/<b>體力<\/b>/.test(html));
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');   /* 註解裡提到體力不算 */
const bad=[]; for(const f of ['src/game3d.js','src/story3d.js','src/classes3d.js','src/home3d.js','src/outings3d.js','src/phone3d.js']){ if(!fs.existsSync(path.join(ROOT,f))) continue; const s=strip(rd(f)); const m=s.match(/.{0,30}(體力|累了).{0,20}/g); if(m) bad.push(f+'：'+m.join(' | ')); }
check('程式裡的選單提示、toast 不再寫體力或「你有點累了」',!bad.length,bad.join(' ／ '));
const g=rd('src/game3d.js');
check('GM.energy 留著但不做事（G.energy 固定 100）',/function energy\(d\)\{ if\(G\) G\.energy=100; \}/.test(g)&&/GM\.energy=energy/.test(g));
check('新遊戲的體力＝100（存檔欄位留著）',/hour:21\.2,energy:100,money:/.test(g));
check('舊存檔讀進來，體力一律當 100（migrate）',/function migrate\(s\)\{ const d=defaults\(s\.name\); s\.energy=100;/.test(g));
const st=strip(rd('src/story3d.js'));
check('sleepNow、travelOvernight 不再補體力；不再記 morningEnergyAdj',!/G\.energy\s*=\s*Math\.min\(100/.test(st)&&!/morningEnergyAdj\s*=/.test(st));
const cl=strip(rd('src/classes3d.js'));
check('上課、社團、小睡不再扣／補體力',!/GM\.energy\(/.test(cl));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
