// 關係有前進時的畫面提示（2026-10-14 使用者試玩 v9.6：「約了朋友例如在溫州街散步 是不是沒有增加好感？在咖啡廳遇到溫學姊跟他講話好像也沒有增進什麼感情」——
// 數值有加（見面 fam+2、閒聊新句 fam+1），畫面上什麼都沒有）。不需要瀏覽器：載入 social3d.js＋人物資料，檢查：
//   1. 對話中（feelOn）加的才記；對話外（讀檔遷移、換算）加的不記；
//   2. 每人一句，照信任＞自在＞印象＞看重＞熟悉挑一句；一次最多兩人，加最多的先；
//   3. 戀愛（rom）不顯示；還沒正式見過的女主角不顯示；減少的不顯示；
//   4. game3d.js：sceneBegin（第一層）開始記、sceneEnd（最後一層）顯示（toast）；GM.rel 自己有「❤」提示的不重複。
// 用法：node tests/rel_feel_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8').replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS)\s*=/mg,'globalThis.$1='),{filename:'characters.js'});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8').replace(/^const SOCIAL\s*=/m,'global.SOCIAL='),{filename:'src/social3d.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const G={rel:{},flags:{},social:null}; SOCIAL.bind(G);
const meet=id=>{ SOCIAL.remember(id,'FIRST_MET','test'); };
meet('heroine_05'); meet('heroine_01'); meet('heroine_03');
// 1
SOCIAL.feelOn=false; SOCIAL.feel={}; SOCIAL.adjust('heroine_05',{fam:5});
check('1. 對話外加的不記（讀檔、換算）',SOCIAL.takeFeel().length===0);
SOCIAL.feelOn=true; SOCIAL.feel={}; SOCIAL.adjust('heroine_05',{fam:1});
let L=SOCIAL.takeFeel(); check('1. 對話中加熟悉度：「和…熟了一點。」',L.length===1&&/^和.+熟了一點。$/.test(L[0]),JSON.stringify(L));
check('1. 女主角用平常的稱呼（溫學姊）',/溫學姊/.test(L[0]||''),L[0]);
check('1. 拿走以後清空',SOCIAL.takeFeel().length===0);
// 2
SOCIAL.feel={}; SOCIAL.adjust('heroine_05',{fam:2,trust:1});
L=SOCIAL.takeFeel(); check('2. 熟悉＋信任：只說一句，信任優先「…好像比較信任你了。」',L.length===1&&/好像比較信任你了。$/.test(L[0]),JSON.stringify(L));
SOCIAL.feel={}; SOCIAL.adjust('heroine_05',{fam:1}); SOCIAL.adjust('heroine_01',{fam:4,comf:2}); SOCIAL.adjust('heroine_03',{fam:2});
L=SOCIAL.takeFeel(2); check('2. 三個人：最多兩句，加最多的先（以安「相處更自在了」第一）',L.length===2&&/相處更自在了。$/.test(L[0]),JSON.stringify(L));
// 3
SOCIAL.feel={}; SOCIAL.adjust('heroine_05',{rom:5}); check('3. 戀愛（rom）不顯示',SOCIAL.takeFeel().length===0);
SOCIAL.feel={}; SOCIAL.adjust('heroine_02',{fam:3}); check('3. 還沒正式見過的女主角（芷若）不顯示',SOCIAL.takeFeel().length===0);
SOCIAL.feel={}; SOCIAL.adjust('heroine_05',{fam:-2}); check('3. 減少的不顯示',SOCIAL.takeFeel().length===0);
SOCIAL.feel={}; SOCIAL.rel('heroine_05').fam=100; SOCIAL.adjust('heroine_05',{fam:3}); check('3. 已經滿了（100）沒有真的增加：不顯示',SOCIAL.takeFeel().length===0);
// 4
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('4. sceneBegin 第一層開始記（清空、feelOn）',/function sceneBegin\(opts\)\{ if\(D\.busyDepth===0&&typeof SOCIAL!=='undefined'&&SOCIAL\.feel\)\{ SOCIAL\.feel=\{\}; SOCIAL\.feelOn=true; \}/.test(g3));
check('4. sceneEnd 最後一層顯示（feelOn 關掉、takeFeel(2)、toast）',/function sceneEnd\(\)\{ D\.busyDepth=Math\.max\(0,D\.busyDepth-1\); if\(D\.busyDepth===0\)\{ if\(typeof SOCIAL!=='undefined'&&SOCIAL\.takeFeel\)\{ SOCIAL\.feelOn=false; const L=SOCIAL\.takeFeel\(2\); if\(L\.length\) setTimeout\(\(\)=>toast\(/.test(g3));
check('4. GM.rel 自己有「❤」提示：同一個人不重複',/SOCIAL\.adjust\(CID\[id\]\|\|id,\{fam:d,trust:Math\.round\(d\*0\.6\)\}\); if\(SOCIAL\.feel\) delete SOCIAL\.feel\[CID\[id\]\|\|id\];/.test(g3));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
