// 日本交換那一學期的宿舍房間（jp_room）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028，LAWWW2 帳號 A 2026-11-02；D99 第二項寒暑假日本）——不需要瀏覽器。
// src/jp_dorm3d.js 用 Z3.attachRoomGLB 接 jp_room.glb，看到場景的 extras.lightmap 就接光照貼圖（和其他室內一樣，不用改程式）。這支檢查：
//   ①extras.lightmap 白天、晚上兩張都在
//   ②地板、玄關、地毯、天花板、四面牆（會淡出的 WALL_*_wall）、門、衣櫃、書桌和床（木作）、窗簾有第二套 UV（TEXCOORD_1）
//   ③玻璃、燈的發光面、筆電螢幕、頂點色的小東西、金屬（窗框、陽台欄杆）、書、踢腳板、海報、冷氣、掛著的外套、被子和枕頭照舊即時光（沒有第二套 UV；
//     被子 11-02 第六版試烘烘成灰色、一塊一塊的）
//   ④牆上的東西照舊在各自那一面牆的群組（WALL_<面>_*）：牆淡出時一起淡出（75ef4ae3）——烘焙沒有改名字、沒有合併
//   ⑤jp_dorm3d.js 照舊用 attachRoomGLB 接正式模型
//   ⑥只在烘焙時有的窗外景物（BAKEONLY_）沒有留在 GLB 裡
// 用法：node tests/jp_room_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const REL='assets/models/env/second_ai/jp_room.glb', b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
check('① extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,220));
const node=nm=>j.nodes.find(x=>x.name===nm);
const uv1=nm=>{ const nd=node(nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const BAKE=['jp_room_floorm','jp_room_genkanm','jp_room_rugm','jp_room_ceiling','WALL_N_wall','WALL_S_wall','WALL_E_wall','WALL_W_wall','WALL_S_door','WALL_S_closet','WALL_S_closet_wood','jp_room_woodparts','WALL_W_shelf_wood','WALL_N_curtain'];
const got=BAKE.map(x=>[x,uv1(x)]);
check('② 地板、玄關、地毯、天花板、牆、門、衣櫃、木作、窗簾有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got.filter(([,v])=>v!==true)));
const LIVE=['WALL_N_glass','jp_room_tubes','jp_room_warm','jp_room_screens','jp_room_props','jp_room_metal','WALL_N_frame','WALL_N_rail','WALL_W_books','WALL_W_trim','WALL_E_trim','WALL_N_trim','WALL_S_trim','WALL_E_print','WALL_W_print','WALL_S_print','WALL_E_ac','WALL_E_cloth','jp_room_cloth'];
const live=LIVE.map(x=>[x,uv1(x)]);
check('③ 玻璃、發光面、螢幕、小東西、金屬、書、踢腳板、海報、冷氣、外套、被子沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live.filter(([,v])=>v!==false)));
{ const W=j.nodes.filter(x=>/^WALL_[NSEW]_/.test(x.name||'')&&x.mesh!=null).map(x=>x.name).sort();
  const want=['WALL_E_ac','WALL_E_cloth','WALL_E_print','WALL_E_trim','WALL_E_wall','WALL_N_curtain','WALL_N_frame','WALL_N_glass','WALL_N_rail','WALL_N_trim','WALL_N_wall','WALL_S_closet','WALL_S_closet_wood','WALL_S_door','WALL_S_print','WALL_S_trim','WALL_S_wall','WALL_W_books','WALL_W_print','WALL_W_shelf_wood','WALL_W_trim','WALL_W_wall','WALL_W_wood'];
  const miss=want.filter(k=>!W.includes(k));
  check('④ 牆上的東西照舊是 WALL_<面>_* 的 23 個網格（牆淡出時一起淡出）',!miss.length,miss.length?'少了 '+miss.join(','):W.length+' 個'); }
{ const src=fs.readFileSync(path.join(ROOT,'src/jp_dorm3d.js'),'utf8');
  check('⑤ jp_dorm3d.js 照舊用 attachRoomGLB 接正式模型',/Z3\.attachRoomGLB\(z,g0,fb,root\)/.test(src)); }
{ const bo=j.nodes.filter(x=>/BAKEONLY/.test(x.name||'')).map(x=>x.name).concat((j.materials||[]).filter(m=>/BAKEONLY/.test(m.name||'')).map(m=>m.name));
  check('⑥ 只在烘焙時有的窗外景物（BAKEONLY_）沒有留在 GLB 裡',!bo.length,bo.join(',')); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
