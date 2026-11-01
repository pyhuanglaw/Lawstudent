// 美國公寓（祐廷的單人戶 us_apartment）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028 美國那一批，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// us3d.js 的公寓區域（aptZone）用 Z3.attachRoomGLB 接 us_apartment.glb，看到場景的 extras.lightmap 就接光照貼圖（和台灣那幾間一樣，不用改程式）。這支檢查：
//   ①extras.lightmap 白天、晚上兩張都在
//   ②地板（木地板、地毯、衛浴磁磚、陽台和平台的水泥）、天花板、牆（含會淡出的 WALL_ 牆）、門、踢腳板、屋簷、家具有第二套 UV（TEXCOORD_1）
//   ③玻璃、百葉、窗外的景和停車場、燈的光暈、壁燈、鍍鉻、黑色小零件、門牌照舊即時光（沒有第二套 UV）
//   ④陽台椅、吧檯椅照舊是 GPU instancing、不烘
//   ⑤窗外的景照舊在 SEASON_SNOW_on／off 底下（aptSeason 換雪景、aptSouthView 複製到南、東、西三面要用）
//   ⑥公寓區域照舊用 attachRoomGLB 接正式模型，接完照舊 aptSouthView、aptSeason
// 用法：node tests/us_apartment_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const REL='assets/models/env/second_ai/us_apartment.glb', b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
check('① extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,220));
const node=nm=>j.nodes.find(x=>x.name===nm);
const uv1=nm=>{ const nd=node(nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const BAKE=['usa_wood','usa_carpet','usa_tile','usa_concrete','usa_ceil','usa_wall','WALL_N_wall','WALL_S_wall','WALL_bed_w_wall','usa_door','usa_trim','usa_roof','US_SOFA.001','US_BED.001','US_COUNTER.001','US_DESK.001'];
const got=BAKE.map(x=>[x,uv1(x)]);
check('② 地板、天花板、牆、門、踢腳板、屋簷、家具有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got.filter(([,v])=>v!==true)));
const LIVE=['usa_glass','usa_blinds','usa_view_on','usa_view_off','usa_lot_on','usa_lot_off','US_CEILINGFAN_GLOW.001','usa_sconce','usa_chrome','usa_black','PLATE_FACE_door_front'];
const live=LIVE.map(x=>[x,uv1(x)]);
check('③ 玻璃、百葉、窗外的景、光暈、壁燈、鍍鉻、黑色零件、門牌沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live.filter(([,v])=>v!==false)));
{ const inst=j.nodes.filter(x=>x.extensions&&x.extensions.EXT_mesh_gpu_instancing), baked=inst.filter(x=>uv1(x.name)!==false).map(x=>x.name);
  check('④ 陽台椅、吧檯椅照舊是 GPU instancing、不烘',inst.length>=2&&!baked.length,'instancing '+inst.length+(baked.length?'；烘了：'+baked.join(','):'')); }
{ const kids=g=>{ const nd=node(g); return nd?(nd.children||[]).map(i=>j.nodes[i].name).sort().join(','):null; };
  const on=kids('SEASON_SNOW_on'), off=kids('SEASON_SNOW_off');
  check('⑤ 窗外的景、停車場照舊在 SEASON_SNOW_on／off 底下',on==='usa_lot_on,usa_view_on'&&off==='usa_lot_off,usa_view_off','on '+on+'；off '+off); }
{ const src=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8'), i=src.indexOf('function aptZone('), body=i>=0?src.slice(i,i+12000):'';
  check('⑥ 公寓區域照舊用 attachRoomGLB 接正式模型，接完照舊 aptSouthView、aptSeason',/Z3\.attachRoomGLB\(z,g0,fb,root\);\s*aptSouthView\(root\);\s*aptSeason\(root\);/.test(body),body?'':'找不到 aptZone'); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
