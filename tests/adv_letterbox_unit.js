// BB-C 11-04（BB_255 P3）：2D 圖片背景、CG 的時候，劇情黑邊（GM.letterbox 的 #letterT／#letterB，8%）不要在圖片上面留一條純黑——不需要瀏覽器。
//   1. adv3d.js 的樣式：#adv.on.image、#adv.on.cg 的時候，#letterT、#letterB 高度 0（!important，蓋過 GM.letterbox 的 inline 8%）
//   2. 3D 模糊背景（blur／freeze／dark）沒有這條規則：黑邊照舊
// 修改前（35f1fff36）：1 FAIL。用法：node tests/adv_letterbox_unit.js
const fs=require('fs'), path=require('path');
const SRC=fs.readFileSync(path.join(__dirname,'..','src/adv3d.js'),'utf8');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const rule=(SRC.match(/[^\n]*\{height:0!important\}/)||[''])[0];
const sel=rule.replace(/\{.*$/,'').split(',').map(x=>x.trim());
check('1. 圖片背景：#letterT、#letterB 收起來',sel.includes('body:has(#adv.on.image) #letterT')&&sel.includes('body:has(#adv.on.image) #letterB'),J(sel));
check('1. CG：#letterT、#letterB 收起來',sel.includes('body:has(#adv.on.cg) #letterT')&&sel.includes('body:has(#adv.on.cg) #letterB'));
check('2. 3D 模糊背景（blur／freeze／dark）照舊有黑邊（規則只認 image、cg）',sel.length===4&&!sel.some(x=>/blur|freeze|dark|night/.test(x)));
check('2. GM.letterbox 本身沒改（還是 8%）',/function letterbox\(on\)\{ const h=on\?'8%':'0';/.test(fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8')));
function J(x){ return JSON.stringify(x); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
