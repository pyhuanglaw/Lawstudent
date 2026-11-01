// 溫州街三家新店（半熟、阿德影印輸出、一盞）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// zones3d.js 的 wzShop 用 attachRoomGLB 接 wz_<店>_interior.glb，看到場景的 extras.lightmap 就接光照貼圖（和 Café、麵店一樣，不用改程式）。這支檢查：
//   ①三家的 extras.lightmap 白天、晚上兩張都在
//   ②地板、天花板、牆、家具有第二套 UV（TEXCOORD_1）：沒有的話這些面吃不到光照貼圖
//   ③燈泡、燈罩、杯盤、樟樹葉子、隔壁的牆、牆上的紙不烘（--nolm／--hide）：沒有第二套 UV，照舊即時光
//   ④照條件出現的東西（支線做完的證書、貓的照片 TRACE_；貓碗 WZ_CATBOWL）節點還在（遊戲照名字開關）、不烘
//     （烘的話它的影子會烘進牆裡：10-31 第一次試烘，半熟右牆多兩塊方形的影子）
//   ⑤wzShop 照舊用 attachRoomGLB 接正式模型
// 用法：node tests/wz_shops_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const SHOPS={
  brunch:{name:'半熟',bake:['wzs_floor','wzs_ceiling','WALL_left_left_paint','WALL_right_right_paint','WALL_back_back_tile','wzs_steel','wzs_wood_lt','wzs_wood_dk'],
          live:['wzs_bulb','wzs_pendant','wzs_ceramic','wzs_black'],cond:['TRACE_SQ20_certs_WALL_E']},
  print:{name:'阿德影印輸出',bake:['wzs_floor','wzs_ceiling','WALL_left_left_paint','WALL_back_back_paint','wzs_copier','wzs_counter','wzs_card'],
         live:['wzs_tube','wzs_paper','WALL_right_price','wzs_frame_alu'],cond:[]},
  teahouse:{name:'一盞',bake:['wzs_planks','wzs_ceiling_boards','wzs_tatami','WALL_back_back_plaster','WALL_left_left_plaster','wzs_garden_moss','wzs_fusuma'],
            live:['wzs_camphor_leaf','wzs_washi','wzs_neighbor','wzs_bulb'],cond:['TRACE_SQ14_catphoto','WZ_CATBOWL_bowl']}};
for(const [k,S] of Object.entries(SHOPS)){
  const REL=`assets/models/env/second_ai/wz_${k}_interior.glb`, b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
  const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
  check(`① ${S.name}：extras.lightmap 的白天、晚上兩張都在`,!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,160));
  const uv1=nm=>{ const nd=j.nodes.find(x=>x.name===nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
  const got=S.bake.map(x=>[x,uv1(x)]);
  check(`② ${S.name}：地板、天花板、牆、家具有第二套 UV`,got.every(([,v])=>v===true),JSON.stringify(got));
  const live=S.live.map(x=>[x,uv1(x)]);
  check(`③ ${S.name}：燈、燈罩、小東西、背景沒有第二套 UV（照舊即時光）`,live.every(([,v])=>v===false),JSON.stringify(live));
  if(S.cond.length){ const c=S.cond.map(x=>[x,uv1(x)]); check(`④ ${S.name}：照條件出現的東西節點還在、不烘`,c.every(([,v])=>v===false),JSON.stringify(c)); } }
{ const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), i=src.indexOf('function wzShop('), body=i>=0?src.slice(i,src.indexOf('const wz_brunch=',i)):'';
  check('⑤ wzShop：正式模型照舊用 attachRoomGLB 接（看到 extras.lightmap 就接光照貼圖）',/attachRoomGLB\(z,g0,g,root\)/.test(body),body?'':'找不到 wzShop'); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
