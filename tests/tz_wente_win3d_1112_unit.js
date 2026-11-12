// SHOP-WINDOW-3D-1112（LAWWW2-C；使用者 X352「汀州路那一排也是」、LAWWW-C 11-12 19:25）：汀州路溫特寶邸玻璃後面是立體店內，不是一張圖。不需要瀏覽器。
//  1 tingzhou_street.glb 有 sk_in_wente（材質 wz_in_shop、不受光），在溫特寶邸那一棟裡面（z 3.0～8.5、店面線西邊）、深 ≥ 2.5 m、有足夠的東西（三角形 ≥ 1500）
//  2 街景模型的建模腳本：XS_IN3D 有 wente、汀州路也做立體店內
//  3 src/tingzhou3d.js：SHOP_IN_PLACE 有 wente → tz_wente，接 Z3.shopInsideLit（打烊調暗，和新生南路同一個函式）
// 修改前（開發分支 cc233d8646）：1、2、3 都 FAIL（溫特寶邸玻璃後面是概念圖裁的一張卡）。用法：node tests/tz_wente_win3d_1112_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.glb')), J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8'));
const par={}; J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>par[c]=i));
const wpos=i=>{ const t=[0,0,0]; while(i!=null){ const tt=J.nodes[i].translation||[0,0,0]; t[0]+=tt[0]; t[1]+=tt[1]; t[2]+=tt[2]; i=par[i]; } return t; };
const ni=J.nodes.findIndex(n=>/^sk_in_wente/.test(n.name||'')&&n.mesh!=null);
let ok1=false, info='沒有 sk_in_wente';
if(ni>=0){ const m=J.meshes[J.nodes[ni].mesh]; const t=wpos(ni); let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9], tris=0; const mats=new Set();
  for(const p of m.primitives){ const a=J.accessors[p.attributes.POSITION]; for(let k=0;k<3;k++){ mn[k]=Math.min(mn[k],a.min[k]+t[k]); mx[k]=Math.max(mx[k],a.max[k]+t[k]); } tris+=(p.indices!=null?J.accessors[p.indices].count:a.count)/3; if(p.material!=null) mats.add(J.materials[p.material].name); }
  const L=(new Function(fs.readFileSync(path.join(ROOT,'src/data/tingzhou_layout.js'),'utf8').replace(/^const TINGZHOU_LAYOUT\s*=/m,'return ')))(); const q=L.shops.find(s=>s.id==='wente');
  const unlit=[...mats].every(n=>{ const mm=J.materials.find(x=>x.name===n); return mm&&mm.extensions&&mm.extensions.KHR_materials_unlit; });
  ok1=mn[2]>=q.z0-0.05&&mx[2]<=q.z1+0.05&&(mx[0]-mn[0])>=2.5&&tris>=1500&&mats.has('wz_in_shop')&&unlit;
  info=JSON.stringify({x:[+mn[0].toFixed(2),+mx[0].toFixed(2)],z:[+mn[2].toFixed(2),+mx[2].toFixed(2)],tris:Math.round(tris),mats:[...mats],unlit}); }
check('1 溫特寶邸玻璃後面有立體店內 sk_in_wente（在那一棟裡、深 ≥ 2.5 m、三角形 ≥ 1500、不受光）',ok1,info);
const K=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/wz_shopkit.py'),'utf8'), W=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/wz_street.py'),'utf8');
check('2 建模腳本：XS_IN3D 有 wente、汀州路也做立體店內、一間一個網格',/'wente': dict\(fn=_xs_in_wente/.test(K)&&/SET in \('xinsheng', 'tingzhou'\) and xs_inside3d/.test(K)&&/SET in \('xinsheng', 'tingzhou'\) and len\(ob\.data\.materials\)/.test(W));
const T=fs.readFileSync(path.join(ROOT,'src/tingzhou3d.js'),'utf8');
check('3 tingzhou3d.js：SHOP_IN_PLACE wente→tz_wente，接 Z3.shopInsideLit',/S\.SHOP_IN_PLACE=\{wente:'tz_wente'\}/.test(T)&&/Z3\.shopInsideLit\(tzR,zone,S\.SHOP_IN_PLACE\)/.test(T));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
