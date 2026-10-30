// 手機「朋友」的直接過去：到了以後人還不在眼前（校園裡「走走」的人沒有確切位置、落在快速地點），自動接「帶我去」（PHONE-UNIFY-1030；BB-B 10-30 實測：阿哲、明軒「走走」直接過去落在 138 m 外、畫面上沒有指向他）——不需要瀏覽器。
//   從 src/game3d.js 抽出 goFollow 原樣執行：同一區、離玩家 8 m 以上＝findPerson（設「去找…」目標、地圖路線）；8 m 以內、不在這一區、找不到人＝不做。
// 修改前（開發分支 f2bc795cc）：第 0 項 FAIL。用法：node tests/phone_fgo_follow_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const SRC=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const m=SRC.match(/\n  GM\.FGO_NEAR=8;\n  function goFollow\(id\)\{[\s\S]*?\n  GM\.goFollow=goFollow;/);
check('0. game3d.js 有 goFollow（GM.FGO_NEAR 8 m）',!!m);
check('0. 「直接過去」按下去：quickGo 走到以後接 goFollow(id)',/if\(fg&&fg\.pl\)\{ await quickGo\(fg\.pl,\{force:true\}\); goFollow\(id\); \}/.test(SRC));
if(!m){ console.log('FAILED '+fails); process.exit(1); }
const mk=(zone,npcAt,playerAt,where)=>{ const found=[]; const ctx={G:{zone},GM:{npc:npcAt?{zhe:{obj:{position:{x:npcAt[0],z:npcAt[1]}}}}:{}},E:{player:{obj:{position:{x:playerAt[0],z:playerAt[1]}}}},STORY:{whereIs:()=>where},findPerson:id=>{ found.push(id); return true; },Math};
  vm.createContext(ctx); vm.runInContext(m[0].replace(/^\n/,''),ctx); return {r:ctx.goFollow('zhe'),found}; };
let x=mk('campus',[0,138],[0,0],{zone:'campus'}); check('1. 同一區、他在 138 m 外：接「帶我去」（findPerson）',x.r===true&&x.found.join()==='zhe',JSON.stringify(x));
x=mk('campus',[3,4],[0,0],{zone:'campus'}); check('2. 他就在 5 m 內：不接（直接過去就到了）',x.r===false&&!x.found.length);
x=mk('campus',null,[0,0],{zone:'campus'}); check('3. 同一區、他的 3D 人物還沒生出來：接「帶我去」（地圖照作息指）',x.r===true&&x.found.length===1);
x=mk('cafe',[0,138],[0,0],{zone:'campus'}); check('4. 不在同一區（直接過去以後他已經走了）：不接',x.r===false&&!x.found.length);
x=mk('campus',[0,138],[0,0],null); check('5. 不知道他在哪：不接',x.r===false&&!x.found.length);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
