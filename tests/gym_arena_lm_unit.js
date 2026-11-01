// 新體育館 3F 主球場（gym_arena 區域）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// gym3d.js 的 gym_arena 區域用 Z3.attachRoomGLB 接 gym_arena.glb，看到場景的 extras.lightmap 就接光照貼圖（和 1F、Café 一樣，不用改程式）。這支檢查：
//   ①extras.lightmap 白天、晚上兩張都在；dayEmit 是高窗（arena_window_sky）：Z3.roomLightmap 晚上把高窗調暗（原本高窗和 LED 共用發光材質，整晚是白的）
//   ②場地、牆、看台的踏面與踢面、上層的座位帶、吸音板、屋頂板、門有第二套 UV（TEXCOORD_1）
//   ③桁架鋼管、深色鋼件、LED 的發光面、高窗、大螢幕、記分板、出口燈照舊即時光（沒有第二套 UV）
//   ④下層看台的座位照舊是 GPU instancing、不烘；布置（SET_：舞台、典禮、演講、演唱會）節點都在、不烘（照條件出現，影子不能烘進地板）
//   ⑤高窗只有一面（沒有反過來的分身）：補了反面的話，反過來那一片朝著牆，烘焙時把牆照爆（第一、二版高窗四周一圈白光暈）
//   ⑥看台上方也有 LED（gym_arena.py v8：x ±24～±36、南看台 z 29）——原本只有場地上方，看台烘出來幾乎全黑
//   ⑦gym_arena 區域照舊用 attachRoomGLB 接正式模型
// 用法：node tests/gym_arena_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const REL='assets/models/env/second_ai/gym_arena.glb', b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), BIN=20+n+8;
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
check('① extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,220));
check('① dayEmit 是高窗（晚上調暗）',!!lm&&Array.isArray(lm.dayEmit)&&lm.dayEmit.length===1&&lm.dayEmit[0]==='arena_window_sky',JSON.stringify(lm&&lm.dayEmit));
const node=nm=>j.nodes.find(x=>x.name===nm);
const uv1=nm=>{ const nd=node(nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const BAKE=['arena_floor','arena_plaster','arena_riser','arena_slab','arena_upper_seats_east','arena_upper_seats_south','arena_acoustic','arena_roof_deck','arena_door'];
const got=BAKE.map(x=>[x,uv1(x)]);
check('② 場地、牆、看台、上層座位帶、吸音板、屋頂板、門有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got));
const LIVE=['arena_steel','arena_steel_dk','arena_light','arena_sky','arena_screen','arena_score','arena_exit_sign'];
const live=LIVE.map(x=>[x,uv1(x)]);
check('③ 鋼件、LED、高窗、大螢幕、記分板、出口燈沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live));
{ const nd=node('arena_seats_lower'), inst=!!(nd&&nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing), u=uv1('arena_seats_lower');
  check('④ 下層看台的座位照舊是 GPU instancing、不烘',inst&&u===false,'instancing '+inst+'、第二套 UV '+u); }
{ const sets=['SET_STAGE','SET_CEREMONY','SET_LECTURE','SET_CONCERT'].map(s=>[s,!!node(s)]);
  const meshes=j.nodes.filter(x=>/^SET_/.test(x.name)&&x.mesh!=null), baked=meshes.filter(x=>j.meshes[x.mesh].primitives.some(p=>p.attributes.TEXCOORD_1!=null)).map(x=>x.name);
  check('④ 布置四組節點都在、沒有一個網格烘了光照貼圖',sets.every(([,v])=>v)&&meshes.length>0&&!baked.length,JSON.stringify(sets)+' 網格 '+meshes.length+(baked.length?' 烘了：'+baked.slice(0,4).join(','):'')); }
const acc=i=>{ const a=j.accessors[i], bv=j.bufferViews[a.bufferView], off=BIN+(bv.byteOffset||0)+(a.byteOffset||0), k={SCALAR:1,VEC3:3}[a.type], T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType];
  return new T(b.buffer.slice(b.byteOffset+off,b.byteOffset+off+a.count*k*T.BYTES_PER_ELEMENT)); };
{ const nd=node('arena_sky'); let ok=0, nt=0;
  if(nd&&nd.mesh!=null) for(const p of j.meshes[nd.mesh].primitives){ const P=acc(p.attributes.POSITION), I=p.indices!=null?acc(p.indices):null, cnt=(I?I.length:P.length/3)/3;
    const key=k=>{ const v=I?I[k]:k; return P[v*3].toFixed(4)+','+P[v*3+1].toFixed(4)+','+P[v*3+2].toFixed(4); }; const set=new Set(), tri=[];
    for(let t=0;t<cnt;t++){ const a=key(t*3), b2=key(t*3+1), c=key(t*3+2); tri.push([a,b2,c]); set.add([a,b2,c].join('|')); }
    for(const [a,b2,c] of tri) if([[a,c,b2],[c,b2,a],[b2,a,c]].some(r=>set.has(r.join('|')))) ok++; nt+=cnt; }
  check('⑤ 高窗只有一面（沒有反過來的分身）',nt>0&&ok===0,'反面 '+ok+'/'+nt); }
{ const nd=node('arena_light'); let xs=new Set(), zs=new Set();
  if(nd&&nd.mesh!=null) for(const p of j.meshes[nd.mesh].primitives){ const P=acc(p.attributes.POSITION), t=nd.translation||[0,0,0];
    for(let i=0;i<P.length;i+=3){ if(P[i+1]+t[1]<18) continue; xs.add(Math.round((P[i]+t[0])/6)*6); zs.add(Math.round((P[i+2]+t[2]-1)/6)*6+1); } }
  const X=[...xs].sort((a,c)=>a-c);
  check('⑥ 看台上方也有 LED（x 到 ±36）',X.includes(-36)&&X.includes(36)&&X.includes(-24)&&X.includes(24),'LED 的 x：'+X.join(',')); }
{ const src=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8'), i=src.indexOf("ASSETS.loadOne('bldg.gym_arena')"), body=i>=0?src.slice(i,i+500):'';
  check('⑦ gym_arena 區域照舊用 attachRoomGLB 接正式模型',/Z3\.attachRoomGLB\(z,g0,fb,root\)/.test(body),body?'':'找不到 gym_arena 的載入'); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
