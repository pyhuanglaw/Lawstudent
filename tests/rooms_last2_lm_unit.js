// INTERIOR-AAA 最後兩間的光照烘焙（LAWWW2-B 2026-11-07；tools/blender/env_second/lightbake/bake_rooms_last2.sh）——不需要瀏覽器。
//   205 寢室（方奕廷，dorm_205：和祐廷的房間同一型，跟上 11-03 天花板 3.4 m）、美國臥室 C（學姊，us_bed_c）。遊戲用 Z3.attachRoomGLB，GLB 有 extras.lightmap 就接。
//   1. 每間的 GLB 有 extras.lightmap，白天、晚上的貼圖檔都在
//   2. 地板、天花板、牆、木頭、布有第二套 UV（烘焙）；燈、發光、頂點色的小東西、金屬、玻璃、方奕廷的東西（Y205_）沒有（照舊即時光）
//   3. 沒有材質同時給「有第二套 UV」和「沒有」的網格用（遊戲把光照貼圖接在材質上，沒有第二套 UV 的網格會讀到錯的地方）
//   4. 淡出的牆節點都在；烘焙時才有的擋光方塊（BAKEONLY_）沒有留在 GLB 裡
//   5. 205 的天花板和玩家的房間（dorm_room4.glb）一樣高，配置的 h 也一樣（room_glb_layouts.js）
// 修改前：GLB 沒有 extras.lightmap（第 1 項失敗）；205 的天花板 3.0 m（第 5 項失敗）。用法：node tests/rooms_last2_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const exists=u=>!!u&&fs.existsSync(path.join(ROOT,u));
const glb=id=>{ const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+id+'.glb')); return JSON.parse(buf.slice(20,20+buf.readUInt32LE(12)).toString('utf8')); };
const ROOMS={
  dorm_205:{ bake:/^(dorm_floor|dorm_ceiling|dorm_wood|dorm_frame_white|WALL_(back|front|left|right)_wall)$/, live:/(dorm_tubes|dorm_led|dorm_items|dorm_metal|chrome|^Y205_)/, walls:['WALL_back_wall','WALL_front_wall','WALL_left_wall','WALL_right_wall'] },
  us_bed_c:{ bake:/^(us_bed_c_(floorm|ceiling|woodparts|fabricparts)|WALL_[NESW]_wall)$/, live:/(_bulbs|_props|_metal|_prints|glass)/, walls:['WALL_N_wall','WALL_E_wall','WALL_S_wall','WALL_W_wall'] } };
for(const [id,R] of Object.entries(ROOMS)){ const J=glb(id);
  const l=((J.scenes[0].extras||{}).lightmap)||null;
  check('1. '+id+'：extras.lightmap 白天、晚上的貼圖都在', !!l&&exists(l.day)&&exists(l.night)&&l.intensity>0, l?l.day:'沒有');
  if(!l) continue;
  const ms=J.nodes.filter(n=>n.mesh!=null).map(n=>({name:n.name, prims:J.meshes[n.mesh].primitives.map(p=>({uv1:p.attributes.TEXCOORD_1!=null, mat:p.material!=null?J.materials[p.material].name:null}))}));
  const bake=ms.filter(m=>R.bake.test(m.name)), noUV=bake.filter(m=>!m.prims.every(p=>p.uv1)).map(m=>m.name);
  check('2. '+id+'：地板、天花板、牆、木頭、布有第二套 UV（'+bake.length+' 個）', bake.length>=6&&!noUV.length, noUV.join('、'));
  const live=ms.filter(m=>R.live.test(m.name)), bad=live.filter(m=>m.prims.some(p=>p.uv1)).map(m=>m.name);
  check('2. '+id+'：燈、小東西、金屬、玻璃沒有第二套 UV（'+live.length+' 個）', live.length>=3&&!bad.length, bad.join('、'));
  const w=new Set(), wo=new Set(); for(const m of ms) for(const p of m.prims) (p.uv1?w:wo).add(p.mat); const both=[...w].filter(x=>wo.has(x));
  check('3. '+id+'：沒有材質同時給有／沒有第二套 UV 的網格', !both.length, both.join('、'));
  const names=new Set(J.nodes.map(n=>n.name)), miss=R.walls.filter(n=>!names.has(n)), bo=[...names].filter(n=>/^BAKEONLY/.test(n||''));
  check('4. '+id+'：淡出的牆節點都在、沒有 BAKEONLY_', !miss.length&&!bo.length, miss.concat(bo).join('、')); }
const ceilY=id=>{ const J=glb(id), n=J.nodes.find(n=>n.name==='dorm_ceiling'); if(!n) return null; const a=J.accessors[J.meshes[n.mesh].primitives[0].attributes.POSITION]; return +a.max[1].toFixed(3)+((n.translation||[0,0,0])[1]); };
const c205=ceilY('dorm_205'), c203=ceilY('dorm_room4');
check('5. 205 的天花板和玩家的房間一樣高', c205!=null&&c205===c203, '205 '+c205+' m／203 '+c203+' m');
global.window=global; eval(fs.readFileSync(path.join(ROOT,'src/data/room_glb_layouts.js'),'utf8')+';global.__R=ROOM_GLB_LAYOUTS;');
const L=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/dorm_205.layout.json'),'utf8'));
check('5. room_glb_layouts.js 的 dorm_205.h＝天花板＝layout.json', __R.dorm_205.h===c205&&L.h===c205, 'js '+__R.dorm_205.h+'／json '+L.h);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
