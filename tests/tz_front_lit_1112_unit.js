// TZ-FRONT-LIT-1112（LAWWW2-C；SHOP-STANDARD-BACKFILL-1112，店面標準 §12 第 1 點「打烊看得出來關了」）：汀州路東南大聯、汀州聯通、客居雲南、越好吃的招牌
// 在店面板（tingzhou_street.glb 的 xs_fronts_lit，第二組 UV＝店編號）上、不是 SIGN_FACE 板面，原本整晚亮。tingzhou3d.js 接上 Z3.ggShopLit（和新生南路同一套）。不需要瀏覽器（D131）。
//   1 tingzhou3d.js 接街景模型以後叫 Z3.ggShopLit(tzR,zone,S.SHOP_LIT_PLACE,{glow:false})
//   2 SHOP_LIT_PLACE 的每一個 key 都在模型的 extras.xsShops 裡；每一個地點在 PLACES 有營業時間；四間沒有招牌板面的店都在表裡
//   3 模型的 xs_fronts_lit 有第二組 UV（店編號），店數 ≤ 16（著色器的格數）
// 修改前（開發分支 cfc0fd04bf）：1、2 FAIL。用法：node tests/tz_front_lit_1112_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..'); const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const src=rd('src/tingzhou3d.js');
check('1. 接上街景模型以後叫 Z3.ggShopLit（光暈不跟著，光暈歸 shopRealGlow）',/Z3\.attachWenzhouModel\(E,g,tzR,'tzfb','tingzhou_street_glb'\)[\s\S]{0,120}Z3\.ggShopLit\(tzR,zone,S\.SHOP_LIT_PLACE,\{glow:false\}\)/.test(src));
const m=/S\.SHOP_LIT_PLACE=(\{[^}]*\})/.exec(src); let MAP=null; try{ MAP=m&&(new Function('return '+m[1]))(); }catch(e){}
const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.glb')); const J=JSON.parse(buf.slice(20,20+buf.readUInt32LE(12)).toString('utf8'));
const lit=J.nodes.find(n=>/xs_fronts_lit/.test(n.name||'')); const xs=String(lit&&lit.extras&&lit.extras.xsShops||'').split(',').filter(Boolean);
global.window=global; let P=null; try{ const s=rd('src/data/places.js').replace(/^const (\w+)\s*=/m,'globalThis.$1='); eval(s); P=globalThis.PLACES; }catch(e){}
const bad=[]; if(MAP) for(const k in MAP){ if(!xs.includes(k)) bad.push(k+' 不在模型 xsShops'); if(!(P&&P.hours&&P.hours[MAP[k]])) bad.push(MAP[k]+' 沒有營業時間'); }
const need=['tzlian','tzdong','tzkeju','tzyue'].filter(k=>!(MAP&&MAP[k]));
check('2. 對照表的店都在模型裡、都有營業時間；聯通、東南、客居、越好吃都在表裡',!!MAP&&!bad.length&&!need.length,bad.concat(need.map(k=>k+' 不在表裡')).join('、'));
const mesh=lit&&J.meshes[lit.mesh]; const hasUv1=!!(mesh&&mesh.primitives.every(p=>p.attributes.TEXCOORD_1!=null));
check('3. xs_fronts_lit 有第二組 UV（店編號）、店數 '+xs.length+' ≤ 16',hasUv1&&xs.length>0&&xs.length<=16);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
