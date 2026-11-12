// L118-CLOSED-LOOKS-OPEN-1112（LAWWW2-C；使用者截圖：水上便當沒開的時候燈亮、沒有鐵門）：118 巷的店沒開時鐵捲門拉下來一半、店裡的燈和招牌調暗。不需要瀏覽器。
//  1 十一間店（九間走得進去＋兩間外帶飲料）各一片鐵捲門，掛在捲門箱下面：朝街、在玻璃前、底 1.25 m、頂 2.9 m、寬＝店寬 − 0.6
//  2 開店時藏起來、沒開（L118.isOpen 假）時出現；每秒更新
//  3 店裡的燈（光暈）照 shopRealGlow 分給各店（模型有光暈網格時）；照 L118.isOpen（PLACES 沒有 118 巷的營業時間）
//  4 玻璃後面的淺店內（wz_in_*，整條街一個網格）：照頂點落在哪一間調暗（著色器乘 uL118Lit），沒開 0.12
// 修改前（開發分支 6279e713c0）：沒有 Z3.l118ClosedLook＝第 1 項 FAIL。用法：node tests/l118_closed_look_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[], body:{appendChild(){},classList:{add(){},remove(){}}} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); const clog=console.log; console.warn=()=>{}; console.error=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e.message.slice(0,50)); } }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});

const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const R=0.32;
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.fitSeatRadius) E.fitSeatRadius();   /* 遊戲載入區域時做的（座位按鈕範圍碰不到站得住的地方就放大）*/ E.player={obj:{position:new THREE.Vector3(0,0,0)},lv:0,radius:R}; return z; }

let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const LJ=(new Function(fs.readFileSync(path.join(ROOT,'src/data/lane118_layout.js'),'utf8').replace(/^const LANE118_LAYOUT\s*=/m,'return ')))();
check('0 有 Z3.l118ClosedLook',typeof Z3.l118ClosedLook==='function');
if(typeof Z3.l118ClosedLook==='function'){
  let open={}; global.L118={isOpen:(id)=>open[id]!==false}; global.GAME={G:{day:10,hour:14}};
  const g=new THREE.Group(), zone={update:null};
  const r=Z3.l118ClosedLook({},g,zone,LJ,LJ.facade.west,LJ.facade.east);
  const sh=(r&&r.shutters)||[];
  const ok1=sh.length===LJ.shops.length&&LJ.shops.every((q,i)=>{ const m=sh[i]; const p=m.geometry.parameters, W=q.z1-q.z0, sx=q.side==='W'?-1:1, n=new THREE.Vector3(0,0,1).applyEuler(m.rotation);
    const yb=m.position.y-p.height/2, yt=m.position.y+p.height/2, glass=(q.side==='W'?LJ.facade.west:LJ.facade.east)+sx*(/^drink/.test(q.id)?0.3:0.9);
    return Math.abs(p.width-(W-0.6))<1e-6&&Math.abs(m.position.z-(q.z0+q.z1)/2)<1e-6&&Math.abs(yb-1.25)<1e-6&&Math.abs(yt-2.9)<1e-6&&Math.sign(n.x)===-sx&&Math.abs(m.position.x)<Math.abs(glass); });
  check('1 每一間一片鐵捲門，朝街、在玻璃前、底 1.25 頂 2.9、寬＝店寬 − 0.6（'+sh.length+' 片／'+LJ.shops.length+' 間）',ok1);
  const allHidden=sh.every(m=>!m.visible); open.self=false; open.dian=false; zone.update(1.2,{}); const vis=sh.filter(m=>m.visible).map(m=>m.name.replace('l118_shutter_',''));
  open={}; zone.update(1.2,{}); const after=sh.filter(m=>m.visible).length;
  check('2 營業中全部藏著；水上便當、118牛排沒開＝那兩片出現；又開了＝藏回去',allHidden&&vis.sort().join()==='dian,self'&&after===0,JSON.stringify(vis));
  check('3 沒有光暈網格時不出錯（glow＝null）',r.glow===null);
  { const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/lane118_street.glb')), J=JSON.parse(buf.slice(20,20+buf.readUInt32LE(12)).toString('utf8'));
    const g2=new THREE.Group(), root=new THREE.Group(); root.name='lane118_street_glb'; g2.add(root); const glows=[];
    for(const n of J.nodes){ if(!/^GLOW_/.test(n.name||'')||!n.translation) continue; const o=new THREE.Object3D(); o.name=n.name; o.position.set(...n.translation); o.userData={glow:'rgba(255,220,170,1)',size:1.4,day:0,night:0.9}; root.add(o); glows.push(o); }
    const gm=Z3.glowBatch(E,g2,root,glows,'lane118_street_glb_glows'); const z2={update:null}; open={}; const r2=Z3.l118ClosedLook({},g2,z2,LJ,LJ.facade.west,LJ.facade.east); const G=r2&&r2.glow;
    const per=G?G.info:{}; const all=LJ.shops.every(q=>(per['l118_'+q.id]||0)>=3);
    check('3b 真的 118 巷模型：店裡的燈、店招燈分給十一間（每間 ≥ 3 個）',!!G&&all,JSON.stringify(per));
    open.self=false; for(let i=0;i<40;i++) z2.update(0.05,{}); const k=G?G.ids.indexOf('l118_self'):-1, kd=G?G.ids.indexOf('l118_dian'):-1;
    { const g3=new THREE.Group(), rt=new THREE.Group(); rt.name='lane118_street_glb'; g3.add(rt); const mat=new THREE.MeshBasicMaterial({vertexColors:true}); mat.name='wz_in_shop'; const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat); rt.add(mesh);
      const other=new THREE.MeshBasicMaterial(); other.name='wz_wall_tile'; rt.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),other));
      const z3={update:null}; open={dian:false}; const r3=Z3.l118ClosedLook({},g3,z3,LJ,LJ.facade.west,LJ.facade.east); const U=mat.userData.l118In, di=LJ.shops.findIndex(q=>q.id==='dian'), q=LJ.shops[di];
      const sh={vertexShader:'void main(){\n#include <begin_vertex>\n}',fragmentShader:'void main(){\n#include <color_fragment>\n}',uniforms:{}}; if(mat.onBeforeCompile) mat.onBeforeCompile(sh,{});
      const ok4=!!U&&!other.userData.l118In&&r3.inMats.length===1&&U.lit.value[di]===0.12&&U.lit.value.filter(v=>v===1).length===LJ.shops.length-1&&U.box.value[di].x<LJ.facade.west-5&&U.box.value[di].y>LJ.facade.west&&U.box.value[di].z===q.z0&&U.box.value[di].w===q.z1
        &&/uL118Lit\[11\]/.test(sh.vertexShader)&&/diffuseColor\.rgb\*=vL118K/.test(sh.fragmentShader)&&sh.uniforms.uL118Lit===U.lit&&/l118In/.test(mat.customProgramCacheKey());
      open={}; for(let i=0;i<25;i++) z3.update(0.05,{}); const back=U.lit.value.every(v=>v===1);
      const r4=Z3.l118ClosedLook({},g3,{update:null},LJ,LJ.facade.west,LJ.facade.east);   /* 再進來一次：同一個材質不重複接 */
      check('4 店內那一層（wz_in_*）照位置分店調暗：118牛排沒開 0.12、其他 1；又開了回到 1；別的材質不動；再進來一次不重複接',ok4&&back&&mat.userData.l118In===U,JSON.stringify(U&&U.lit.value)); }
    check('3c 水上便當沒開＝它那一組光暈 0.03（關燈）、118牛排開著＝1；照 L118.isOpen（PLACES 沒有 118 巷的營業時間）',k>=0&&G.lit[k+1]===0.03&&G.lit[kd+1]===1,k>=0?G.lit[k+1]+'／'+G.lit[kd+1]:'沒有'); }
}
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
