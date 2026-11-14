// 日常失速從街上看的立體店內第二版（#167，LAWWW2-B 2026-11-07；BB-B 11-07 判「換新版」後的兩點）——不需要瀏覽器，只讀 GLB 的 JSON。
// ① 「店內整片偏黃綠、單調」：第一版烘焙工具的 bug——AA 室內的頂點色材質沒寫層名，合成一個網格後讀不到顏色，珊瑚色椅子、陶土盆栽、吊燈烘成灰色；
//    燈色也是 2700K 的琥珀光。第二版修好、燈色往白光拉（offbeat_storefront.py --warm 0.45）。檢查：烘好的圖裡珊瑚色 ≥ 5%、綠色 ≥ 1%（工具寫在 extras.storefront.color；第一版量起來 2.3%、0.1%）
// ② 「店前那一格三角形多 4.4 萬」：店內 2.2 萬三角形在陰影那一輪又畫一次。第二版節點叫 NOSHADOW_…（zones3d.js 的 wzCastsShadow 不投影）；
//    街上看不到的面不放進模型（只在烘焙時擋光）。檢查：兩個節點都是 NOSHADOW_ 開頭、wzCastsShadow 認得這個前綴、店內 ≤ 19,500 三角形（第一版 21,808）
// ③ 葉子和店內一樣「店裡開著燈」：自發光＝葉子貼圖、底色壓暗（第一版照街上的光，在大樓裡偏黑）
// 修改前（開發 0f4b0394a）：①②③ FAIL。用法：node tests/offbeat_storefront_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const glb=f=>{ const b=fs.readFileSync(path.join(ROOT,f)), jl=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+jl).toString('utf8')); };
const J=glb('assets/models/env/second_ai/wenzhou_street.glb');
const nodes=J.nodes.filter(n=>/offbeat_storefront/.test(n.name||'')&&n.mesh!=null);
const tris=n=>J.meshes[n.mesh].primitives.reduce((s,p)=>s+(J.accessors[p.indices].count/3),0);
const store=nodes.find(n=>!/leaf/.test(n.name)), leaf=nodes.find(n=>/leaf/.test(n.name));
/* SHOP-REAL-INSIDE 溫州街（LAWWW2-C 11-12）：這一份烘光的店內顏色偏粉、和走進去的不一樣（自查 shop_out_in_audit_1112）→ 街景模型不再嵌它，
   改由遊戲在玻璃後面放走進去的那一顆室內模型（zones3d.js wzShopReal 的 W2）。沒有嵌的時候只檢查這件事，下面 ①②③ 不適用。 */
if(!store&&!leaf){ const z3=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('（取代）溫州街模型不再嵌日常失速烘光的店內；遊戲改放室內模型（wzShopReal：W2 → bldg.wz_offbeat_interior，位置 (−42.2,−13.5)、ry π/2）',/\{id:'W2',place:'wz_offbeat',key:'bldg\.wz_offbeat_interior',w:11,d:10,h:3\.4,x:-42\.2,z:-13\.5,ry:Math\.PI\/2/.test(z3)&&(/shopInsideReal\(E,g,zone,wzShopReal\(\)\)/.test(z3)||/const wr=wzShopReal\(\); shopInsideReal\(E,g,zone,wr\)/.test(z3))   /* 11-12 招牌燈那包改成先存 wr 再叫（shopRealGlow 也要用同一張）*/);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); }
check('（前提）溫州街模型裡有日常失速的店內、葉子兩個網格',!!store&&!!leaf,nodes.map(n=>n.name).join('、'));
if(!store||!leaf){ console.log('FAILED '+fails); process.exit(1); }
// ①
const ex=(store.extras||{}).storefront||{}, col=ex.color||{};
check('① 店內是第二版（extras.storefront.version ≥ 2）',(ex.version|0)>=2,JSON.stringify({version:ex.version,warm:ex.warm}));
check('① 珊瑚色（椅子、陶土盆栽）≥ 5%、綠色（植物、吧檯）≥ 1%',col.coral>=0.05&&col.green>=0.01,'珊瑚色 '+((col.coral||0)*100).toFixed(1)+'%、綠色 '+((col.green||0)*100).toFixed(1)+'%（第一版 2.3%、0.1%）');
// ②
check('② 店內、葉子不投影：節點 NOSHADOW_ 開頭',/^NOSHADOW_/.test(store.name)&&/^NOSHADOW_/.test(leaf.name),store.name+'、'+leaf.name);
const z=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
check('② zones3d.js 的 wzCastsShadow 認得 NOSHADOW_ 前綴',/function wzCastsShadow\(o\)\{[^\n]*\/\^NOSHADOW_\/\.test\(o\.name\)\)\s*return false/.test(z));
const t=tris(store);
check('② 店內 ≤ 19,500 三角形（街上看不到的面拿掉了）',t<=19500,t+'（第一版 21,808）');
if(ex.cull) check('② 可見性：從街上看不到的面有分出去',ex.cull.hidden>0&&ex.cull.viewpoints>=50,JSON.stringify(ex.cull));
// ③
const lm=J.materials[J.meshes[leaf.mesh].primitives[0].material], pb=lm.pbrMetallicRoughness||{}, bc=pb.baseColorFactor||[1,1,1,1];
check('③ 葉子自己亮（emissiveTexture）、底色壓暗（≤ 0.2）',!!lm.emissiveTexture&&Math.max(bc[0],bc[1],bc[2])<=0.2,lm.name+' emissive '+JSON.stringify(lm.emissiveFactor)+' base '+JSON.stringify(bc.slice(0,3).map(v=>+v.toFixed(2))));
const sm=J.materials[J.meshes[store.mesh].primitives[0].material], sp=sm.pbrMetallicRoughness||{}, sb=sp.baseColorFactor||[1,1,1,1];
check('③ 店內照舊只有自發光（底色黑、emissiveTexture）',!!sm.emissiveTexture&&Math.max(sb[0],sb[1],sb[2])<=0.01,sm.name);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
