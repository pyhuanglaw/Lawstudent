// AA／BB／CC 新做的店內（aa_support／bb_support）光照烘焙（INTERIOR-AAA lm_audit_1107 第一級；LAWWW2-B 2026-11-07；tools/blender/env_second/lightbake/bake_gg_new.sh）——不需要瀏覽器。
//   日和便利店（BB，bb_support/cvs_interior.glb）、洋洋鹹酥雞（BB，bb_support/yangyang_interior.glb）、轉角唱片（CC，bb_support/corner.glb）——LAWWW-B 15:35 插隊
//   第二批（11-07 18:xx）：公館燒臘（BB，bb_support/shaola_interior.glb，noodle 區域）、頁間書屋（AA，aa_support/yejian.glb，bookstore 區域）
//   遊戲走 Z3.attachRoomGLB（zones3d.js 的 ggRoom／wzShop），GLB 有 extras.lightmap 就接，不用改程式。
//   1. 每間的 GLB 有 extras.lightmap，白天、晚上的貼圖檔都在
//   2. 地板、天花板、牆有第二套 UV（烘焙）；發光的（GLOW_）、玻璃沒有（照舊即時光）
//   3. 沒有材質同時給「有第二套 UV」和「沒有」的網格用（遊戲把光照貼圖接在材質上）
//   4. 淡出的牆節點都在（烘焙不改節點名字）
//   5. 原檔有的節點 extras 照舊（窗景卡的 windowView、牆的 dir：遊戲的窗景切換、牆淡出看這些）
// 修改前：GLB 沒有 extras.lightmap（第 1 項失敗）。用法：node tests/gg_new_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const exists=u=>!!u&&fs.existsSync(path.join(ROOT,u));
const SHOPS={
  'bb_support/cvs_interior':{ bake:/^(FLOOR|CEILING|WALL_(back|left|right)_vc)$/, live:/(GLOW|glass|GLASS_|cvs_vc$|cvs_goods)/, walls:['WALL_back_vc','WALL_front_vc','WALL_left_vc','WALL_right_vc'] },
  'bb_support/corner':{ bake:/^(cr_floor_floor|cr_ceiling_ceil|CEIL_beams_ceil|WALL_(back|left|right)_wall_wall|WALL_front_front_wall)$/, live:/(GLOW|glass|_goods|_vc$|_inst$|VIEW|_wood)/, walls:['WALL_back_wall_wall','WALL_front_front_wall','WALL_left_wall_wall','WALL_right_wall_wall','WALL_left_TOP_logo_sign'] },
  'bb_support/yangyang_interior':{ bake:/^(FLOOR|CEILING|WALL_(back|left|right)_wall|WALL_(back|front|left|right)_vc|yy_wood)$/, live:/(GLOW|glass|GLASS_|yy_food|^yy_vc$|VIEW)/, walls:['WALL_back','WALL_front','WALL_left','WALL_right','WALL_front_vc','WALL_front_vm'] },
  'bb_support/shaola_interior':{ bake:/^(FLOOR|CEILING|WALL_(back|front|left|right)_wall)$/, live:/(GLOW|glass|_vc$|gloss|steel|tube|warm|print)/,
    walls:['WALL_back_wall','WALL_front_wall','WALL_left_wall','WALL_right_wall','WALL_back_vc','WALL_front_vc','WALL_left_vc','WALL_right_vc','WALL_front_glass','WALL_back_tube','WALL_left_warm'] },
  'aa_support/yejian':{ bake:/^(yej_floor|yej_ceiling|WALL_(back|front|left|right)_yej_wall|WALL_(front|left|right)_yej_wood)$/, live:/(GLOW|glass|yej_bulb|VIEW|^yej_wood$|books|pothos|_vc$|vcg|vcm|print)/,
    walls:['WALL_back_yej_wall','WALL_front_yej_wall','WALL_left_yej_wall','WALL_right_yej_wall','WALL_front_yej_wood','WALL_left_yej_wood','WALL_right_yej_wood','WALL_front_yej_glass','WALL_front_VIEW_yej_window_view'],
    extras:{'WALL_front_VIEW_yej_window_view':{dir:[0,0,-1],windowView:true},'WALL_back_yej_wall':{dir:[0,0,1]},'WALL_left_yej_wood':{dir:[1,0,0]},'WALL_right_yej_wall':{dir:[-1,0,0]}} },
};
for(const [id,R] of Object.entries(SHOPS)){ const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+id+'.glb')), J=JSON.parse(buf.slice(20,20+buf.readUInt32LE(12)).toString('utf8'));
  const l=((J.scenes[0].extras||{}).lightmap)||null;
  check('1. '+id+'：extras.lightmap 白天、晚上的貼圖都在', !!l&&exists(l.day)&&exists(l.night)&&l.intensity>0, l?l.day:'沒有');
  if(!l) continue;
  const ms=J.nodes.filter(n=>n.mesh!=null).map(n=>({name:n.name, prims:J.meshes[n.mesh].primitives.map(p=>({uv1:p.attributes.TEXCOORD_1!=null, mat:p.material!=null?J.materials[p.material].name:null}))}));
  const bake=ms.filter(m=>R.bake.test(m.name)), noUV=bake.filter(m=>!m.prims.every(p=>p.uv1)).map(m=>m.name);
  check('2. '+id+'：地板、天花板、牆有第二套 UV（'+bake.length+' 個）', bake.length>=4&&!noUV.length, noUV.join('、'));
  const live=ms.filter(m=>R.live.test(m.name)||m.prims.some(p=>/^GLOW_/.test(p.mat||''))), bad=live.filter(m=>m.prims.some(p=>p.uv1)).map(m=>m.name);
  check('2. '+id+'：發光的、玻璃、商品沒有第二套 UV（'+live.length+' 個）', live.length>=3&&!bad.length, bad.join('、'));
  const w=new Set(), wo=new Set(); for(const m of ms) for(const p of m.prims) (p.uv1?w:wo).add(p.mat); const both=[...w].filter(x=>wo.has(x));
  check('3. '+id+'：沒有材質同時給有／沒有第二套 UV 的網格', !both.length, both.join('、'));
  const names=new Set(J.nodes.map(n=>n.name)), miss=R.walls.filter(n=>!names.has(n));
  check('4. '+id+'：淡出的牆節點都在', !miss.length, miss.join('、'));
  if(R.extras){ const bad5=Object.entries(R.extras).filter(([n,e])=>{ const nd=J.nodes.find(x=>x.name===n); return !nd||JSON.stringify(Object.fromEntries(Object.keys(e).map(k=>[k,(nd.extras||{})[k]])))!==JSON.stringify(e); }).map(([n])=>n);
    check('5. '+id+'：窗景卡、牆的 extras 照舊（'+Object.keys(R.extras).length+' 個節點）', !bad5.length, bad5.join('、')); } }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
