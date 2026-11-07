// 轉角唱片（公館 G12）室內正式模型的 MODEL_READY 檢查（CORNER-IN-1107；LAWWW2-B 2026-11-07；模型 CC v1c，LAWWW2-B 改 corner_interior.py）——不需要瀏覽器。
//   1. GLB 在；三角形（含 instancing）≤ 60,000、材質 ≤ 12、只有玻璃雙面
//   2. 四面牆的淡出節點（WALL_front／back／left／right_…）都在、每個都有 extras.dir（往室內）
//   3. 牆邊家具上的東西跟著那面牆淡出：GPU instancing 節點的每一個 instance，離右牆（x 3.88）、左牆（x −3.88）、後牆（z −5.63）0.6 m 以內、
//      而且離地 0.3 m 以上（放在鐵架、音響櫃、展示龕、吧台上，不是放在地上的沙發、高腳椅）的，節點要是那面牆的 WALL_ 節點、extras.dir 對
//      （v1c 原檔：擴大機、卡座、收音機、喇叭、唱盤的 instancing 掛在根節點，鐵架淡出時浮在空中）
//   4. 門窗照外觀 G12（wz_street.py：木門 x 0.84～2.42、櫥窗 x −3.39～0.69）：配置的 front.door 在這個範圍
// 用法：node tests/corner_glb_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const P=path.join(ROOT,'assets/models/env/second_ai/bb_support/corner.glb');
if(!fs.existsSync(P)){ check('1. corner.glb 在', false); console.log('FAILED '+fails); process.exit(1); }
const b=fs.readFileSync(P), n=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+n).toString('utf8')), BIN=b.slice(20+n+8);
const accF=i=>{ const a=J.accessors[i], bv=J.bufferViews[a.bufferView], off=(bv.byteOffset||0)+(a.byteOffset||0), nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type]; const out=[]; for(let k=0;k<a.count;k++){ const v=[]; for(let c=0;c<nc;c++) v.push(BIN.readFloatLE(off+(k*nc+c)*4)); out.push(v); } return out; };
let tris=0; for(const nd of J.nodes){ if(nd.mesh==null) continue; const inst=(nd.extensions||{}).EXT_mesh_gpu_instancing, cnt=inst?J.accessors[inst.attributes.TRANSLATION].count:1; for(const p of J.meshes[nd.mesh].primitives) if(p.indices!=null) tris+=J.accessors[p.indices].count/3*cnt; }
const ds=J.materials.filter(m=>m.doubleSided).map(m=>m.name);
check('1. 三角形（含 instancing）≤ 60,000、材質 ≤ 12、只有玻璃雙面', tris<=60000&&J.materials.length<=12&&ds.every(x=>/glass/.test(x)), tris+' 三角形、'+J.materials.length+' 材質、雙面 '+ds.join('、'));
const DIR={front:[0,0,-1],back:[0,0,1],left:[1,0,0],right:[-1,0,0]};
const walls=J.nodes.filter(nd=>/^WALL_(front|back|left|right)_/.test(nd.name||'')), sides=new Set(walls.map(nd=>nd.name.split('_')[1]));
const badDir=walls.filter(nd=>{ const d=(nd.extras||{}).dir, w=DIR[nd.name.split('_')[1]]; return !d||d.join()!==w.join(); }).map(nd=>nd.name);
check('2. 四面牆的淡出節點都在、extras.dir 都對（'+walls.length+' 個）', ['front','back','left','right'].every(s=>sides.has(s))&&!badDir.length, badDir.join('、'));
const near=t=>t[1]>0.3?(t[0]>3.88-0.6?'right':(t[0]<-3.88+0.6?'left':(t[2]<-5.63+0.6?'back':null))):null;
const bad=[]; let nOn=0;
for(const nd of J.nodes){ const inst=(nd.extensions||{}).EXT_mesh_gpu_instancing; if(!inst) continue;
  for(const t of accF(inst.attributes.TRANSLATION)){ const s=near(t); if(!s) continue; nOn++; const d=(nd.extras||{}).dir;
    if(!(nd.name||'').startsWith('WALL_'+s+'_')||!d||d.join()!==DIR[s].join()) bad.push(nd.name+'@'+t.map(v=>v.toFixed(2)).join(',')); } }
check('3. 靠牆、放在家具上的 instance（'+nOn+' 個）都在那面牆的 WALL_ 節點底下、跟著淡出', nOn>0&&!bad.length, bad.slice(0,6).join('；')+(bad.length>6?'…共 '+bad.length:''));
global.window=global; const lay=fs.readFileSync(path.join(ROOT,'src/data/corner_layout.js'),'utf8'); let C=null; try{ eval(lay+';C=CORNER_LAYOUT;'); }catch(e){}
const L=C&&(C.corner||C), d=L&&L.front&&L.front.door;
check('4. 配置的店門照外觀 G12（木門 x 0.84～2.42）', !!d&&Math.abs(d.x-d.w/2-0.84)<0.02&&Math.abs(d.x+d.w/2-2.42)<0.02, d?JSON.stringify(d):'沒有配置');
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
