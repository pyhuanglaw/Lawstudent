// 美國 C 棟合租戶（學姊她們的 208，us_shared）室內的光照貼圖＋兩戶屋外的水泥（INTERIOR-AAA-REVIEW-1028 美國收尾，LAWWW2-B 2026-11-01）——不需要瀏覽器。
// us3d.js 的 us_shared 區域和單人戶同一個 aptZone（Z3.attachRoomGLB），看到場景的 extras.lightmap 就接光照貼圖，不用改程式。這支檢查：
//   ①extras.lightmap 白天、晚上兩張都在
//   ②地板（木地板、地毯、衛浴磁磚、陽台和平台的水泥）、天花板、牆、門、踢腳板、屋簷、家具有第二套 UV（TEXCOORD_1）
//   ③玻璃、百葉、窗外的景和停車場、燈的光暈、壁燈、鍍鉻、黑色小零件、門牌照舊即時光（沒有第二套 UV）
//   ④陽台椅、吧檯椅、臥室 A／B 的床和書桌椅照舊是 GPU instancing、不烘（同一份 UV 兩個位置，烘了光會錯）
//   ⑤窗外的景照舊在 SEASON_SNOW_on／off 底下
//   ⑥US2 的劇情道具（EVENT_US2，平常藏著）11 件都還在、而且沒有烘（影子不烘進地板：藏起來的時候地上不會留一塊暗影）
//   ⑦合租戶區域照舊是 aptZone、正式模型 bldg.us_shared
//   ⑧兩戶屋外的水泥（陽台、走廊平台、樓梯）是素面水泥 granular_concrete，不是去色以後一塊一塊白斑的 concrete_floor_painted（11-01「平台、陽台白天偏白」）
//   ⑨兩戶平台上鄰居的門（door213）自己一個節點、有烘：白天那一張只壓這扇門（11-01 第二輪「鄰居 207 的門白天偏亮」）
// 修改前：①②⑧ FAIL（合租戶沒有烘、水泥是油漆斑那一張）；第二輪修改前 ⑨ FAIL（鄰居的門合在 usa_door 裡）。用法：node tests/us_shared_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const load=rel=>{ const b=fs.readFileSync(path.join(ROOT,rel)), n=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+n).toString('utf8')); };
const j=load('assets/models/env/second_ai/us_shared.glb');
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
check('① extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,220));
const node=nm=>j.nodes.find(x=>x.name===nm);
const uv1=nm=>{ const nd=node(nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
/* 門：洗衣機櫃的門 lau_w_door。11-01 第二輪以前它和平台上鄰居的門（door213）合成 usa_door；鄰居的門拆出來以後只剩它自己，照原名（鄰居的門：us_shared_lm_unit ⑨）*/
const BAKE=['usa_wood','usa_carpet','usa_tile','usa_concrete','usa_ceil','usa_wall','WALL_N_wall','WALL_S_wall','WALL_bed_ab_wall','lau_w_door','usa_trim','usa_roof','US_SOFA.001','US_COUNTER.001','US_FRIDGE.001','US_BAR.001'];
const got=BAKE.map(x=>[x,uv1(x)]);
check('② 地板、天花板、牆、門、踢腳板、屋簷、家具有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got.filter(([,v])=>v!==true)));
const LIVE=['usa_glass','usa_blinds','usa_view_on','usa_view_off','usa_lot_on','usa_lot_off','US_CEILINGFAN_GLOW.001','usa_sconce','usa_chrome','usa_black','PLATE_FACE_door_front'];
const live=LIVE.map(x=>[x,uv1(x)]);
check('③ 玻璃、百葉、窗外的景、光暈、壁燈、鍍鉻、黑色零件、門牌沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live.filter(([,v])=>v!==false)));
{ const inst=j.nodes.filter(x=>x.extensions&&x.extensions.EXT_mesh_gpu_instancing), baked=inst.filter(x=>uv1(x.name)!==false).map(x=>x.name);
  check('④ 陽台椅、吧檯椅、臥室的床和書桌椅照舊是 GPU instancing、不烘',inst.length>=2&&!baked.length,'instancing '+inst.length+(baked.length?'；烘了：'+baked.join(','):'')); }
const kids=g=>{ const nd=node(g); return nd?(nd.children||[]).map(i=>j.nodes[i].name).sort():null; };
{ const on=(kids('SEASON_SNOW_on')||[]).join(','), off=(kids('SEASON_SNOW_off')||[]).join(',');
  check('⑤ 窗外的景、停車場照舊在 SEASON_SNOW_on／off 底下',on==='usa_lot_on,usa_view_on'&&off==='usa_lot_off,usa_view_off','on '+on+'；off '+off); }
{ const ev=kids('EVENT_US2')||[], baked=ev.filter(x=>uv1(x)!==false);
  check('⑥ EVENT_US2 的 11 件劇情道具都在、沒有烘',ev.length===11&&!baked.length,ev.length+' 件'+(baked.length?'；烘了：'+baked.join(','):'')); }
{ const src=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8');
  check('⑦ 合租戶照舊是 aptZone、正式模型 bldg.us_shared',/const us_shared=aptZone\(\{\s*id:'us_shared'[^}]*glb:'bldg\.us_shared'/.test(src)); }
for(const [u,rel] of [['合租戶','assets/models/env/second_ai/us_shared.glb'],['單人戶','assets/models/env/second_ai/us_apartment.glb']]){
  const g=u==='合租戶'?j:load(rel), mi=g.materials.findIndex(m=>m.name==='usa_concrete'), m=g.materials[mi];
  const tex=m&&m.pbrMetallicRoughness&&m.pbrMetallicRoughness.baseColorTexture, tx=tex&&g.textures[tex.index], src=tx&&(tx.source!=null?tx.source:Object.values(tx.extensions||{}).map(e=>e.source).find(v=>v!=null)), img=src!=null?g.images[src]:null;   /* 貼圖可能是 EXT_texture_webp */
  check('⑧ '+u+'屋外的水泥是素面水泥（granular_concrete），不是 concrete_floor_painted',!!img&&/granular_concrete/.test(img.name||'')&&!/painted/.test(img.name||''),img&&img.name); }
/* ⑨ 平台上鄰居的門（合租戶的 207、單人戶的 213；us_apartment.py 的 door213）自己一個節點、有烘光照：烘焙時白天那一張只壓這扇門（bake_us.sh 的 --dayscale door213=0.65）。
   原本合進屋裡的門（usa_door）一起烘、一起調，屋外屋簷下的白門白天 0.4～0.6，旁邊的外牆壓暗以後看起來是一片偏藍的亮白（11-01 LAWWW-B 派「鄰居 207 的門白天偏亮」）*/
for(const [u,rel] of [['合租戶','assets/models/env/second_ai/us_shared.glb'],['單人戶','assets/models/env/second_ai/us_apartment.glb']]){
  const g=u==='合租戶'?j:load(rel), nd=g.nodes.find(x=>x.name==='door213'), pr=nd&&nd.mesh!=null?g.meshes[nd.mesh].primitives:[];
  const mat=pr.length?g.materials[pr[0].material]:null;
  check('⑨ '+u+'平台上鄰居的門是自己一個節點（door213）、有第二套 UV、材質照舊是門的白漆',!!nd&&pr.length>0&&pr.every(p=>p.attributes.TEXCOORD_1!=null)&&!!mat&&mat.name==='usa_door',nd?('材質 '+(mat&&mat.name)):'沒有 door213 節點'); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
