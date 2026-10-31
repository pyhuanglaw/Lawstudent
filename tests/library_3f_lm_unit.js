// 總圖 3F 閱覽區正式模型的光照貼圖（ART-ECON-3D-GAP-1021 C，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// zones3d.js 的 library 區域用 attachRoomGLB 接 library_3f.glb，看到場景的 extras.lightmap 就接光照貼圖（Z3.roomLightmap）。這支檢查：
//   ①extras.lightmap 的白天、晚上兩張都在
//   ②地板、天花板、四面牆、長桌、書櫃有第二套 UV（TEXCOORD_1）：沒有的話這些面吃不到光照貼圖
//   ③燈框發光面、桌燈燈泡、燈罩、輕鋼架、椅子不烘（--nolm）：沒有第二套 UV，照舊即時光
// 書照舊是 EXT_mesh_gpu_instancing：tests/lm_instancing_unit.js
// 用法：node tests/library_3f_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), REL='assets/models/env/second_ai/library_3f.glb';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap;
const files=lm?['day','night'].map(k=>lm[k]):[];
check('① 光照貼圖：extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,160));
const uv1=nm=>{ const nd=j.nodes.find(x=>x.name===nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const want=['l3_floor','l3_ceil','l3_top','l3_walnut','l3_bc0','WALL_back_plaster','WALL_front_plaster','WALL_left_plaster','WALL_right_plaster'], got=want.map(k=>[k,uv1(k)]);
check('② 地板、天花板、四面牆、長桌、書櫃有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got));
const live=['l3_light','l3_glow','l3_shade','WALL_ceil_tbar','l3_chairwood','l3_seat'].map(k=>[k,uv1(k)]);
check('③ 燈框發光面、桌燈、燈罩、輕鋼架、椅子沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live));
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
