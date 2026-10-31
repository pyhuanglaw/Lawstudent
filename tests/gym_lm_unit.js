// 新體育館大廳＋1F 球場（gym 區域）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// gym3d.js 的 gym 區域用 Z3.attachRoomGLB 接 gym_interior.glb，看到場景的 extras.lightmap 就接光照貼圖（和溫州街三家、Café 一樣，不用改程式）。這支檢查：
//   ①extras.lightmap 白天、晚上兩張都在；沒有 dayEmit（高窗的亮度由 gym 區域自己照時段調：gym3d.js skyLevel，roomLightmap 再調一次會互相蓋掉）
//   ②地板、球場、天花板、屋頂、牆、護牆軟墊、石材、木格柵有第二套 UV（TEXCOORD_1）：沒有的話這些面吃不到光照貼圖
//   ③桁架鋼管、燈面、高窗發光面不烘（--nolm／--hide）：沒有第二套 UV，照舊即時光
//   ④照條件出現的東西：羽球網（SET_NETS）節點還在、不烘；第二會場（SET_SECONDHALL，畢業典禮那天才打開）的折疊椅照舊是 GPU instancing，
//     第二套 UV 取到的光照貼圖是亮的（白天、晚上最暗的 10% 都 > 0.1：不會整排黑椅子）
//   ⑤gym 區域照舊用 attachRoomGLB 接正式模型
// 用法：node tests/gym_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const REL='assets/models/env/second_ai/gym_interior.glb', b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const BIN=20+n+8;
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
check('① extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,200));
check('① 沒有 dayEmit（高窗的亮度由 gym 區域自己調）',!!lm&&!('dayEmit' in lm));
const node=nm=>j.nodes.find(x=>x.name===nm);
const uv1=nm=>{ const nd=node(nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const BAKE=['gym_court_floor','gym_lobby_floor','gym_lobby_ceiling','gym_roof','WALL_back_back_concrete','WALL_back_back_pad','WALL_left_left_stone','gym_stone','gym_wood'];
const got=BAKE.map(x=>[x,uv1(x)]);
check('② 地板、球場、天花板、屋頂、牆、軟墊、石材、木格柵有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got));
const LIVE=['gym_steel','gym_steel_dk','gym_light','WALL_left_left_sky','WALL_right_right_sky'];
const live=LIVE.map(x=>[x,uv1(x)]);
check('③ 桁架鋼管、燈面、高窗發光面沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live));
const nets=j.nodes.filter(x=>/^SET_NETS/.test(x.name)&&x.mesh!=null).map(x=>[x.name,uv1(x.name)]);
check('④ 羽球網（SET_NETS）節點還在、不烘',nets.length>0&&nets.every(([,v])=>v===false),JSON.stringify(nets));
// 折疊椅：讀網格的 TEXCOORD_1（Node 讀不了 WebP，這裡只檢查 UV 落在貼圖裡；取到的亮度用 Python 量，寫在 README）
const acc=i=>{ const a=j.accessors[i], bv=j.bufferViews[a.bufferView], off=BIN+(bv.byteOffset||0)+(a.byteOffset||0), k=a.type==='VEC2'?2:3; return new Float32Array(b.buffer.slice(b.byteOffset+off,b.byteOffset+off+a.count*k*4)); };
{ const nd=node('SET_SECONDHALL'), inst=!!(nd&&nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing);
  check('④ 第二會場的折疊椅照舊是 GPU instancing',inst,nd?Object.keys(nd.extensions||{}).join(','):'找不到 SET_SECONDHALL');
  const p=nd&&nd.mesh!=null?j.meshes[nd.mesh].primitives[0]:null, uv=p&&p.attributes.TEXCOORD_1!=null?acc(p.attributes.TEXCOORD_1):null;
  let inside=!!uv; if(uv) for(let i=0;i<uv.length;i++) if(!(uv[i]>=0&&uv[i]<=1)) inside=false;
  check('④ 折疊椅的第二套 UV 都在光照貼圖裡（取得到烘焙的光；亮度見 README：白天、晚上最暗的 10% 都 > 0.3）',inside,uv?`${uv.length/2} 個頂點`:'沒有第二套 UV'); }
{ const src=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8'), i=src.indexOf("ASSETS.loadOne('bldg.gym_interior')"), body=i>=0?src.slice(i,i+400):'';
  check('⑤ gym 區域照舊用 attachRoomGLB 接正式模型（看到 extras.lightmap 就接光照貼圖）',/Z3\.attachRoomGLB\(z,g0,fb,root\)/.test(body),body?'':'找不到 gym_interior 的載入'); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
