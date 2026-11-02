// 新體育館 B1（gym_b1 區域：游泳池、走廊、健身中心、大廳）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// gym3d.js 的 gym_b1 區域用 Z3.attachRoomGLB 接 gym_b1.glb，看到場景的 extras.lightmap 就接光照貼圖（和 1F、3F 一樣，不用改程式）。這支檢查：
//   ①extras.lightmap 白天、晚上兩張都在；沒有 dayEmit（地下室沒有窗）
//   ②天花板（泳池、輕鋼架、一般）、池底、池邊、馬賽克、地墊、草皮、花崗石、牆、門、木頭有第二套 UV（TEXCOORD_1）
//   ③燈面、水面、鋼件、水道繩、電視、計時器、牌子、旗子、門牌照舊即時光（沒有第二套 UV）
//   ④器材、置物櫃照舊是 GPU instancing、不烘；櫃台道具（GYM2_）不烘
//   ⑤gym_b1 區域照舊用 attachRoomGLB 接正式模型
// 用法：node tests/gym_b1_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const REL='assets/models/env/second_ai/gym_b1.glb', b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
check('① extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,220));
check('① 沒有 dayEmit（地下室沒有窗）',!!lm&&!('dayEmit' in lm));
const node=nm=>j.nodes.find(x=>x.name===nm);
const uv1=nm=>{ const nd=node(nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const BAKE=['b1_ceiling','b1_ceiling_pool','b1_ceiling_tile','b1_pool_bottom','b1_pool_deck','b1_mosaic','b1_rubber','b1_fitness_turf','b1_granite','WALL_back_back_plaster','WALL_left_left_tile_wall','b1_door','b1_wood'];
const got=BAKE.map(x=>[x,uv1(x)]);
check('② 天花板、池底、池邊、馬賽克、地墊、草皮、花崗石、牆、門、木頭有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got));
const LIVE=['b1_light','b1_water','b1_steel','b1_steel_dk','b1_rope_b','b1_tv','b1_hours','b1_notice','b1_flag','PLATE_FACE_door_b1_男更衣室'];
const live=LIVE.map(x=>[x,uv1(x)]);
check('③ 燈面、水面、鋼件、水道繩、電視、牌子、旗子、門牌沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live));
{ const inst=j.nodes.filter(x=>x.extensions&&x.extensions.EXT_mesh_gpu_instancing), baked=inst.filter(x=>uv1(x.name)!==false).map(x=>x.name);
  const props=j.nodes.filter(x=>/^GYM2?_/.test(x.name)&&x.mesh!=null), pb=props.filter(x=>uv1(x.name)!==false).map(x=>x.name);
  check('④ 器材、置物櫃照舊是 GPU instancing、不烘；櫃台道具不烘',inst.length>=13&&!baked.length&&props.length>0&&!pb.length,'instancing '+inst.length+'、道具 '+props.length+(baked.length||pb.length?'；烘了：'+baked.concat(pb).slice(0,4).join(','):'')); }
{ const src=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8'), i=src.indexOf("ASSETS.loadOne('bldg.gym_b1')"), body=i>=0?src.slice(i,i+400):'';
  check('⑤ gym_b1 區域照舊用 attachRoomGLB 接正式模型',/Z3\.attachRoomGLB\(z,g0,fb,root\)/.test(body),body?'':'找不到 gym_b1 的載入'); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
