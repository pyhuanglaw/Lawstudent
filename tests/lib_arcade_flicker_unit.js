// 總圖正面拱廊的柱頂不再一直閃（LIB-ARCADE-FLICKER-1110，使用者 2026-11-10「總圖外的柱子會閃」→ 選擇題「表面花紋一直跳動」；截圖 docs/handoff/user_shots/1110_library_arcade_flicker.webp）——不需要瀏覽器。
// 原因：tools/blender/env_second/campus_library.py 的 arcade_front，拱洞兩側的牆面從平台一路做到起拱處（SPRING），起拱處的拱墩（trim 方塊，SPRING−0.22～SPRING）
//   側面和它在同一個平面上（tools/blender/env_second/check_coplanar.py：lib_pier／lib_col × lib_trim 20 對、相差 0 mm＝一定會閃）。
// 改法：洞口兩側只做到 SPRING−0.22（上面那段被拱墩蓋住，外觀不變）。重新匯出後 check_coplanar：柱子的 0 對（「一定會閃」總數 40 → 20，剩下的是收邊之間的小面）。
// 檢查：1 腳本的洞口兩側到 SPRING − 0.22（兩面）；2 遊戲用的 campus_library.glb 是重新匯出的（json 的 out 是 repo 路徑）、配置（layout.json）沒變（導航照舊）
// 修改前 1、2 FAIL。用法：node tests/lib_arcade_flicker_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i&&!ok?'　'+i:'')); if(!ok) fails++; };
const s=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/campus_library.py'),'utf8');
check('1. arcade_front：洞口兩側的牆面只做到拱墩下緣（SPRING - 0.22，兩面）',(s.match(/\(xo \+ thick, SPRING - 0\.22, z [-+] r\), \(xo, SPRING - 0\.22, z [-+] r\)/g)||[]).length===2&&!/\(xo \+ thick, SPRING, z - r\)/.test(s));
const j=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_library.json'),'utf8')), lay=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_library.layout.json'),'utf8'));
check('2. 遊戲用的模型是重新匯出的（json out＝repo 路徑）；配置還在（平台 0.9、台階）',j.out==='assets/models/env/second_ai/campus_library.glb'&&JSON.stringify(lay).includes('0.9'),JSON.stringify({out:j.out}));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
