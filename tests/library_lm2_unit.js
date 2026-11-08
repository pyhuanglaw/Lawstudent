// 總圖 B1（4.1 版）、研究小間、5F 書庫光照烘焙（lm_audit_1107 第二級；LAWWW2-B 2026-11-07；tools/blender/env_second/lightbake/bake_library_b1.sh、bake_library_upper.sh）——不需要瀏覽器。
//   遊戲走 Z3.attachRoomGLB（library_b1_3d.js、library_upper3d.js），GLB 有 extras.lightmap 就接，不用改程式。
//   1. 每間的 GLB 有 extras.lightmap，白天、晚上的貼圖檔都在
//   2. 地板、天花板、牆有第二套 UV（烘焙）；發光的（GLOW_、CARREL_SKY）、玻璃、家具、書沒有（照舊即時光）
//   3. 沒有材質同時給「有第二套 UV」和「沒有」的網格用（遊戲把光照貼圖接在材質上）
//   4. 遊戲用名字找的節點都在（研究小間的門、學姊的檯燈、便利貼、高窗；B1 的中庭天光、檯燈亮片）、牆的 extras（dir、partition）照舊
//   5. GPU instancing 照舊（B1 的桌椅檯燈 10 個、書庫的書 53 個；烘焙不展開）
// 修改前：GLB 沒有 extras.lightmap（第 1 項失敗）。用法：node tests/library_lm2_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const exists=u=>!!u&&fs.existsSync(path.join(ROOT,u));
const ROOMS={
  library_b1:{ bake:/^(library_b1_floorm|library_b1_ceiling|library_b1_columns|library_b1_woodpanels|WALL_[A-Z0-9]+_(wall|wain|woodwain))$/, live:/(GLOW|glass|frost|tubes|warm|screens|prints?$|steel|metal|court|dividers|_vc$)/,
    nodes:['GLOW_library_b1_courtsky','library_b1_warm','library_b1_tubes','WALL_W_glass','WALL_P1_frost','WALL_S_wall','WALL_N_wall'], inst:10 },
  library_carrels:{ bake:/^(library_carrels_floorm|library_carrels_ceiling|WALL_[A-Z0-9]+_(wall|wain))$/, live:/(GLOW|glass|frost|SKY|props|LAMP|lampoff|prints?|screen|STICKY|DOOR)/,
    nodes:['CARREL08_DOOR_OPEN','CARREL08_DOOR_SHUT','SIS_CARREL_LAMP','SIS_CARREL_props','STICKY_SIS','CARREL_SKY','WALL_C_tube','WALL_E_glass'],
    extras:{'WALL_PN_glass':{dir:[0,0,1],partition:1},'WALL_PS_glass':{dir:[0,0,-1],partition:1},'WALL_E_glass':{dir:[-1,0,0]},'WALL_C_tube':{dir:[0,-1,0]}}, mats:['CARREL_SKY'] },
  library_stacks:{ bake:/^(library_stacks_floorm|library_stacks_ceiling|WALL_[A-Z0-9]+_(wall|wain))$/, live:/(GLOW|glass|books|props|tube|screens|prints?)/,
    nodes:['WALL_S_glass','WALL_C_tube','WALL_C_lamp','library_stacks_books'], extras:{'WALL_S_glass':{dir:[0,0,-1]},'WALL_C_tube':{dir:[0,-1,0]}}, inst:53 },
};
/* 總圖 B1、研究小間先不接（LAWWW2-B 11-08 02:04：烘焙工具 hidden_faces 沒看 partition，隔間牆背面被壓成一個亮度；修工具重烘以後補交）＝這兩間先跳過，接回來時拿掉 PENDING */
const PENDING=new Set([]);   /* 11-08 03:5x LAWWW-B：B1、研究小間接回 LAWWW2-B 14ef1ff10（LM-PARTITION-1108 第一批：隔間牆兩面都烘）*/
for(const id of PENDING) check('0. '+id+'：光照烘焙等 LAWWW2 重烘（先用原檔，沒有 extras.lightmap）',(()=>{ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+id+'.glb')), J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8')); return !((J.scenes[0].extras||{}).lightmap); })());
for(const [id,R] of Object.entries(ROOMS)){ if(PENDING.has(id)) continue; const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+id+'.glb')), J=JSON.parse(buf.slice(20,20+buf.readUInt32LE(12)).toString('utf8'));
  const l=((J.scenes[0].extras||{}).lightmap)||null;
  check('1. '+id+'：extras.lightmap 白天、晚上的貼圖都在', !!l&&exists(l.day)&&exists(l.night)&&l.intensity>0, l?l.day:'沒有');
  if(!l) continue;
  const ms=J.nodes.filter(n=>n.mesh!=null).map(n=>({name:n.name, inst:!!(n.extensions||{}).EXT_mesh_gpu_instancing, prims:J.meshes[n.mesh].primitives.map(p=>({uv1:p.attributes.TEXCOORD_1!=null, mat:p.material!=null?J.materials[p.material].name:null}))}));
  const bake=ms.filter(m=>R.bake.test(m.name)), noUV=bake.filter(m=>!m.prims.every(p=>p.uv1)).map(m=>m.name);
  check('2. '+id+'：地板、天花板、牆有第二套 UV（'+bake.length+' 個）', bake.length>=4&&!noUV.length, noUV.join('、'));
  const live=ms.filter(m=>m.inst||R.live.test(m.name)||m.prims.some(p=>/^(GLOW_|CARREL_SKY)/.test(p.mat||''))), bad=live.filter(m=>m.prims.some(p=>p.uv1)).map(m=>m.name);
  check('2. '+id+'：發光的、玻璃、家具、書沒有第二套 UV（'+live.length+' 個）', live.length>=3&&!bad.length, bad.join('、'));
  const w=new Set(), wo=new Set(); for(const m of ms) for(const p of m.prims) (p.uv1?w:wo).add(p.mat); const both=[...w].filter(x=>wo.has(x));
  check('3. '+id+'：沒有材質同時給有／沒有第二套 UV 的網格', !both.length, both.join('、'));
  const names=new Set(J.nodes.map(n=>n.name)), miss=R.nodes.filter(n=>!names.has(n));
  check('4. '+id+'：遊戲用名字找的節點都在', !miss.length, miss.join('、'));
  if(R.extras){ const bad4=Object.entries(R.extras).filter(([n,e])=>{ const nd=J.nodes.find(x=>x.name===n); return !nd||JSON.stringify(Object.fromEntries(Object.keys(e).map(k=>[k,(nd.extras||{})[k]])))!==JSON.stringify(e); }).map(([n])=>n);
    check('4. '+id+'：牆的 extras 照舊（'+Object.keys(R.extras).length+' 個節點）', !bad4.length, bad4.join('、')); }
  if(R.mats){ const mn=new Set(J.materials.map(m=>m.name)), mm=R.mats.filter(m=>!mn.has(m)); check('4. '+id+'：遊戲用名字找的材質都在', !mm.length, mm.join('、')); }
  if(R.inst!=null){ const k=ms.filter(m=>m.inst).length; check('5. '+id+'：GPU instancing 照舊（'+k+' 個）', k===R.inst, '應為 '+R.inst); } }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
