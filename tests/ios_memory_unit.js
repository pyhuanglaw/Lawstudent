// P0 BUG-IOS-RELOAD（使用者 2026-10-16：iPhone 一直被踢回標題）：手機貼圖上限、ADV 圖片快取上限、出遊存檔點。只檢查原始碼接法（貼圖縮小要瀏覽器：tests/texmem 量測）。
const fs=require('fs'), path=require('path'); const R=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let fails=0; const check=(n,ok)=>{ console.log((ok?'PASS ':'FAIL ')+n); if(!ok) fails++; };
const a=R('src/assets3d.js');
check('手機貼圖上限：顏色 1024、資料貼圖 512；?texfull 關、?texcap 桌機測試',/A\.texCap=/.test(a)&&/\{color:1024,data:512\}/.test(a)&&/texfull/.test(a)&&/texcap/.test(a));
check('GLB 載入完、VRM parse 完都先縮貼圖（上傳 GPU 之前）',/const done=\(gltf\)=>\{ try\{ A\.capTextures\(gltf\.scene\);/.test(a)&&/A\.parseVRM\(buf\)\.then\(x=>\{ A\.capTextures\(x\.vrm\.scene\);/.test(a));
check('CanvasTexture、DataTexture 不縮；同一張圖只縮一次',/t\.isCanvasTexture\|\|t\.isDataTexture/.test(a)&&/capDone\.has\(t\)/.test(a)&&/capImg\.get\(key\)/.test(a));
const d=R('src/adv3d.js');
check('ADV 立繪／背景／CG 快取最多 16 張，超過丟最舊的',/CACHE_MAX=16/.test(d)&&/delete A\.cache\[old\]/.test(d));
const o=R('src/outings3d.js');
check('出遊：出發前存一次、到了 autosave(true) 再存一次、整趟包在 sceneBegin／sceneEnd',/GM\.autosave\(\); running\.add\(q\.id\)/.test(o)&&/q\.arrived=true; if\(GM\.autosave\) GM\.autosave\(true\)/.test(o)&&/GM\.sceneBegin\(\); try\{/.test(o));
const e=R('src/engine3d.js'), g=R('src/game3d.js');
check('全畫面 2D（深色底、背景圖、CG）蓋住 3D 時不畫 3D；模糊、凍結底照畫',/if\(E\.renderSkip&&E\.renderSkip\(\)\)\{/.test(e)&&/E\.renderSkip=\(\)=>typeof ADV!=='undefined'&&ADV\.active&&!!ADV\.root&&\/\\b\(dark\|image\|cg\)\\b\//.test(g));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
