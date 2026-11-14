// 新生南路走得進去的店：光照烘焙（光照第二級最後一組，lm_audit_1107；LAWWW2-B 2026-11-08；tools/blender/env_second/lightbake/bake_xs.sh）——不需要瀏覽器（D131）。
//   大步球鞋、好拍運動、同弦樂器、新生運動用品、南洋戲院大廳／1 廳、大口漢堡一樓／二樓（BB，bb_support/）、山嵐書店（AA，aa_support/）
// 一、GLB（九顆）：
//   1. 有 extras.lightmap，白天、晚上的貼圖檔都在；南洋 1 廳多一張「開演」（dark），開演時跟著暗的自發光材質是 nh_warm（darkOff）
//   2. 地板、天花板、牆面有第二套 UV（烘焙）；發光的（GLOW_）、玻璃、家具、商品沒有（照舊即時光）
//   3. 沒有材質同時給「有第二套 UV」和「沒有」的網格用（遊戲把光照貼圖接在材質上）
//   4. 淡出的牆節點、GPU instancing 的個數和原檔一樣（烘焙不改節點）
// 二、大口（dakou3d.js）：兩顆 GLB 放在同一個 Group 給 attachRoomGLB，Group 本身沒有 extras.lightmap——
//   5. 一樓、二樓的地板、天花板都接上光照貼圖，而且各自是自己那一顆的（兩層不是同一張）；天花板不再另外加自發光（TK.bounce）
// 三、南洋 1 廳（nanyang3d.js）：
//   6. 有「開演」那一張（z.lightsOff）；開演（NY3.houseLights(false)）→ 換到那一張（lightsOffK 1）、場燈 0、銀幕那盞 1.4 倍；演完 → 換回來、場燈照舊
// 修改前：GLB 沒有 extras.lightmap（第 1 項失敗）；大口沒接（第 5 項失敗）；開演不換貼圖（第 6 項失敗）。用法：node tests/xs_lm_unit.js
const {ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ if(/LOD|Missing|載入失敗/.test(String(a[0]))) return; w0(...a); };
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const exists=u=>!!u&&fs.existsSync(path.join(ROOT,u));
const A='assets/models/env/second_ai/';
/* bake：要烘的網格（名字）；live：照舊即時光的；walls、inst：原檔的淡出牆個數、instancing 個數 */
const SHOPS={
  'bb_support/dabu':{ bake:/^(dabu_floor|dabu_ceiling|WALL_[a-z]+_[a-z]+_paint)$/, live:/^(GLOW|WALL_front_front_glass|dabu_shoe|dabu_vc_parts|dabu_wood|dabu_sun$)/, walls:23, inst:35 },   /* SHOP-CC0-HELP-1113：原檔多了 3 組 Poly Haven instancing（紙箱、兩種盆栽），32 → 35 */
  'bb_support/haopai':{ bake:/^(hp_floor_floor|hp_ceiling|hp_soffit_wall|WALL_[a-z]+_wall_wall|WALL_front_front_wall)$/, live:/^(GLOW|hp_goods|hp_vc|hp_glasscase_glass|WALL_front_front_glass)/, walls:22, inst:65 },   /* SHOP-CC0-HELP-1113：原檔多了 1 組 Poly Haven instancing（地上兩箱紙箱），64 → 65 */
  'bb_support/tongxian':{ bake:/^(tx_floor|tx_ceiling|WALL_[a-z]+_plaster)$/, live:/^(GLOW|tx_emit|tx_guitars|tx_glass|WALL_back_glass|tx_vc)/, walls:23, inst:29 },
  'bb_support/xinsheng_sports':{ bake:/^(L0_floor_floor|L0_ceiling_ceil|L1_slab_floor|L1_ceiling_ceil|L[01]_xs_plaster|L0_xs_stone|WALL_[a-z]+_L[01]_wall_wall)$/, live:/^(GLOW|L0_xs_goods|L0_xs_glass|L0_xs_vc$)/, walls:34, inst:58 },   /* 新生運動 v4（SHOP-REALISM-1112，g3＋LAWWW2-C）：原檔多了 2 組 Poly Haven instancing（球架上的足球、貨架頂上的紙箱），56 → 58 */
  'aa_support/shanlan':{ bake:/^(shl_floor|shl_ceiling1|L2_shl_floor2|L2_shl_ceiling2|shl_wall|WALL_[a-z]+_shl_(wall|wood))$/, live:/^(GLOW|shl_books|shl_bulb|shl_glass|L2_shl_books|WALL_front_shl_glass)/, walls:10, inst:0 },
  'bb_support/dakou_1f':{ bake:/^(FLOOR|CEILING|WALL_[a-z]+_(plaster|base|solid))$/, live:/^(NIGHT_|dk_glass|dk_warm|dk_lightpanel|dk_vc_matte)/, walls:13, inst:0 },
  'bb_support/dakou_2f':{ bake:/^(FLOOR|CEILING|WALL_[a-z]+_(plaster|base|solid))$/, live:/^(NIGHT_|dk_glass|dk_warm|CEIL_LIGHTS|PENDANTS)/, walls:12, inst:24 },   /* SHOP-CC0-HELP-1113：原檔多了 1 組 Poly Haven instancing（盆栽），23 → 24 */
  'bb_support/nanyang_lobby':{ bake:/^(ny_carpet|CEILING|WALL_[a-z]+_plaster)$/, live:/^(ny_glass|ny_warm|ny_vc_matte|WALL_[a-z]+_wains)/, walls:13, inst:0 },
  'bb_support/nanyang_hall':{ bake:/^(nh_carpet|CEILING|WALL_[a-z]+_plaster)$/, live:/^(SCONCE_GLASS|AISLE_LIGHTS|SCREEN|nh_velvet|WALL_[a-z]+_wains)/, walls:22, inst:0, dark:'nh_warm' },
};
function readGLB(p){ const b=fs.readFileSync(p), n=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+n).toString('utf8')); }
for(const [k,S] of Object.entries(SHOPS)){
  const J=readGLB(path.join(ROOT,A+k+'.glb')), LM=((J.scenes[J.scene||0]||{}).extras||{}).lightmap;
  const files=LM?[LM.day,LM.night].concat(S.dark?[LM.dark]:[]):[];
  check(`1. ${k}：extras.lightmap、白天／晚上${S.dark?'／開演':''}貼圖都在`+(S.dark?`、開演時 ${S.dark} 跟著暗`:''), !!LM&&files.every(exists)&&(!S.dark||LM.darkOff===S.dark), LM?files.join('、')+(S.dark?' darkOff='+LM.darkOff:''):'沒有 extras.lightmap');
  if(!LM) continue;
  const uv1=m=>J.meshes[m].primitives.every(p=>'TEXCOORD_1' in p.attributes), meshNodes=J.nodes.filter(n=>n.mesh!=null&&!(n.extensions&&n.extensions.EXT_mesh_gpu_instancing));
  const baked=meshNodes.filter(n=>S.bake.test(n.name||'')), noUV=baked.filter(n=>!uv1(n.mesh)).map(n=>n.name), liveUV=meshNodes.filter(n=>S.live.test(n.name||'')&&J.meshes[n.mesh].primitives.some(p=>'TEXCOORD_1' in p.attributes)).map(n=>n.name);
  check(`2. ${k}：要烘的 ${baked.length} 個有第二套 UV、照舊即時光的沒有`, baked.length>=3&&!noUV.length&&!liveUV.length, (noUV.length?'沒有：'+noUV.join('、'):'')+(liveUV.length?' 不該有：'+liveUV.join('、'):''));
  const use={}; for(const n of meshNodes) for(const p of J.meshes[n.mesh].primitives){ if(p.material==null) continue; const u='TEXCOORD_1' in p.attributes; (use[p.material]=use[p.material]||new Set()).add(u); }
  const both=Object.entries(use).filter(([,s])=>s.size>1).map(([m])=>J.materials[m].name);
  check(`3. ${k}：沒有材質同時給有／沒有第二套 UV 的網格`, !both.length, both.join('、'));
  const walls=J.nodes.filter(n=>/^WALL_/.test(n.name||'')&&!(n.extensions&&n.extensions.EXT_mesh_gpu_instancing)).length, inst=J.nodes.filter(n=>n.extensions&&n.extensions.EXT_mesh_gpu_instancing).length;
  check(`4. ${k}：淡出的牆 ${S.walls} 個、instancing ${S.inst} 個照舊`, walls===S.walls&&inst===S.inst, `牆 ${walls}、instancing ${inst}`);
}
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/zones3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dakou_layout.js','src/dakou3d.js','src/data/nanyang_layout.js','src/nanyang3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const build=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group); E.player={obj:{position:new THREE.Vector3(0,0,6),rotation:{y:0}},radius:0.32,lv:0}; return z; };
const preload=re=>{ window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of Object.keys(ASSETS.manifest)) if(re.test(k)){ const m=ASSETS.manifest[k]; if(exists(m.url)) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); } };
(async()=>{
  global.GAME={G:{zone:'xs_dakou',day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
  // 二、大口
  preload(/^bldg\.xs_dakou_/);
  { const z=build('xs_dakou'); let s1=null, s2=null;
    for(let i=0;i<150&&!(s1&&s2);i++){ await sleep(100); z.group.traverse(o=>{ if(/^NIGHT_/.test(o.name||'')){ for(let p=o;p;p=p.parent){ if(/dakou_1f/.test(p.name||'')) s1=p; if(/dakou_2f/.test(p.name||'')) s2=p; } } }); }
    await sleep(300);
    const lm=(root,re)=>{ const r=[]; if(root) root.traverse(o=>{ if(o.isMesh&&re.test(o.name||'')) for(const m of [].concat(o.material)) r.push({n:o.name,map:m.lightMap||null,b:!!(m.userData&&m.userData.bounce)}); }); return r; };
    const f1=lm(s1,/^(FLOOR|CEILING)$/), f2=lm(s2,/^(FLOOR|CEILING)$/), map1=f1.map(x=>x.map), map2=f2.map(x=>x.map);
    check('5. 大口：兩層的模型都載到了', !!s1&&!!s2, `一樓 ${s1&&s1.name}、二樓 ${s2&&s2.name}`);
    check('5. 大口：一樓、二樓的地板、天花板都接上光照貼圖', f1.length>=2&&f2.length>=2&&map1.every(Boolean)&&map2.every(Boolean), f1.concat(f2).map(x=>x.n+(x.map?'✓':'✗')).join('、'));
    check('5. 大口：兩層各自是自己那一顆的光照貼圖（不是同一張）', map1.length&&map2.length&&map1.every(a=>a&&map2.every(b=>b&&a!==b)), '');
    check('5. 大口：天花板不再另外加自發光（有光照貼圖時）', f1.concat(f2).filter(x=>x.n==='CEILING').every(x=>!x.b), f1.concat(f2).filter(x=>x.n==='CEILING').map(x=>x.b?'加了':'沒加').join('、')); }
  // 三、南洋 1 廳
  preload(/^bldg\.xs_nanyang_hall$/); GAME.G.zone='xs_nanyang_hall'; GAME.G.hour=20;
  { const z=build('xs_nanyang_hall'); for(let i=0;i<150&&typeof z.lightsOff!=='function';i++) await sleep(100); await sleep(200);
    check('6. 南洋 1 廳：有「開演」那一張（z.lightsOff）', typeof z.lightsOff==='function', '');
    const H=z.house||[], Sc=z.screenLight||[], on0=H.map(l=>l.userData.on), sc0=Sc.map(l=>l.userData.on);
    const a=NY3.houseLights(false), kA=z.lightsOffK, hA=H.map(l=>l.intensity), sA=Sc.map(l=>l.intensity);
    check('6. 開演：換到「開演」那一張、場燈 0、銀幕那盞 1.4 倍', a===true&&kA===1&&hA.every(v=>v===0)&&sA.every((v,i)=>Math.abs(v-sc0[i]*1.4)<1e-9), `lightsOffK ${kA}、場燈 ${hA.join('/')}、銀幕 ${sA.map(v=>+v.toFixed(3)).join('/')}`);
    const b=NY3.houseLights(true), kB=z.lightsOffK, hB=H.map(l=>l.intensity);
    check('6. 演完：換回晚上那一張、場燈照舊', b===true&&kB===0&&hB.every((v,i)=>v===on0[i]), `lightsOffK ${kB}、場燈 ${hB.join('/')}`); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
