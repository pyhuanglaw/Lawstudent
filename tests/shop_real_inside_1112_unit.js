/* SHOP-REAL-INSIDE-1112（LAWWW2-C）：從店外看到的店內＝走進去的那一顆室內模型（§12 第 1 點；使用者 11-12「店外面看進去牆壁是灰色，可是人在店裡面居然牆壁是木頭的」）。
   node tests/shop_real_inside_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8'); const a=src.indexOf('  function shopInsideReal('); let d=0,b=-1; for(let i=src.indexOf('{',src.indexOf(')',a));i<src.length;i++){ if(src[i]==='{') d++; else if(src[i]==='}'){ d--; if(d===0){ b=i+1; break; } } }
ok(a>0&&b>a,'① zones3d.js 有 shopInsideReal'); ok(/shopInsideReal,/.test(src.slice(src.lastIndexOf('return {B1C'))),'② Z3 匯出 shopInsideReal');
/* 假的 THREE、ASSETS：只夠這個函式用 */
class Color{ constructor(r=1,g=1,b=1){ this.r=r; this.g=g; this.b=b; } copy(c){ this.r=c.r; this.g=c.g; this.b=c.b; return this; } multiplyScalar(k){ this.r*=k; this.g*=k; this.b*=k; return this; } }
class V3{ constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; } set(x,y,z){ this.x=x; this.y=y; this.z=z; } }
class Box3{ copy(o){ this.c=o.c; return this; } applyMatrix4(){ return this; } getCenter(v){ v.x=this.c[0]; v.y=this.c[1]; v.z=this.c[2]; return v; } }
let disposed=0; class Basic{ constructor(o){ Object.assign(this,o); this.color=new Color(); this.userData={}; } dispose(){ disposed++; } }
const mesh=(name,c,mat)=>({name,isMesh:true,visible:true,geometry:{boundingBox:{c}},material:mat,matrixWorld:{},children:[],parent:null});
const mkScene=()=>{ const wood={name:'wood',map:{id:1},color:new Color(1,1,1)}, vc={name:'vc',vertexColors:true,color:new Color(1,1,1)}, led={name:'led',emissive:new Color(1,0.8,0.6),color:new Color(0,0,0)};
  const kids=[mesh('floor',[0,0,0],wood),mesh('WALL_left_wood',[-3.6,1.5,0],wood),mesh('WALL_front_front_glass',[0,1.5,6],vc),mesh('dabu_sun',[1,0.01,4],wood),mesh('nightboard',[20,2,0],wood),mesh('shelf',[2,1,-3],vc),mesh('lamp',[0,3.2,0],led)];
  const r={name:'Scene',children:kids,parent:null,userData:{},position:new V3(),rotation:{y:0,set(){ this.y=0; }},updateMatrixWorld(){},traverse(f){ f(this); kids.forEach(f); },clone(){ return mkScene(); }}; kids.forEach(k=>k.parent=r); return r; };
let loads=0; const g={children:[],add(o){ this.children.push(o); o.parent=this; },remove(o){ this.children=this.children.filter(q=>q!==o); o.parent=null; }};
const zone={update:null,shopInLit:{items:[{id:'dabu',mesh:{visible:true}}]}}; const E={zone,player:{obj:{position:new V3(-12,0,60)}}};
const ctx={THREE:{Box3,Vector3:V3,Color,MeshBasicMaterial:Basic},ASSETS:{manifest:{'bldg.xs_dabu':{}},loadOne(){ loads++; return {then(f){ f({scene:mkScene()}); return {catch(){}}; }}; }},GAME:{G:{hour:14,day:3}},PLACES:{isOpen:(z,h)=>h>=11&&h<22,typhoonClosed:()=>false},console};
vm.createContext(ctx); vm.runInContext(src.slice(a,b)+'; this.fn=shopInsideReal;',ctx);
const Rr=ctx.fn(E,g,zone,[{id:'dabu',place:'xs_dabu',key:'bldg.xs_dabu',w:7.4,d:12,h:3.4,x:-22.52,z:-16.7,ry:Math.PI/2,cx:-16.5,cz:-16.7,ex:0,ez:3.7}]);
const s=Rr.shops[0]; const step=n=>{ for(let i=0;i<n;i++) zone.update(0.016,E); };
ok(!s.on&&loads===0,'③ 玩家在 75 m 外：不載入（整條街全接手機吃不消）');
E.player.obj.position.z=-10; step(21);
ok(s.on&&loads===1&&g.children.length===1,'④ 走到 26 m 內：載入那一間的室內模型、接上');
const grp=g.children[0]; const vis=n=>grp.children.find(q=>q.name===n).visible;
ok(grp.position.x===-22.52&&grp.position.z===-16.7&&grp.rotation.y===Math.PI/2,'⑤ 放在店面玻璃後面（室內的正面 z＝d/2 轉到朝街）');
ok(vis('floor')&&vis('WALL_left_wood')&&vis('shelf')&&vis('lamp'),'⑥ 地板、側牆、貨架、燈都在');
ok(!vis('WALL_front_front_glass')&&!vis('dabu_sun')&&!vis('nightboard'),'⑦ 室內自己的正面牆、陽光斑、範圍外的板子不放');
const fl=grp.children.find(q=>q.name==='floor'), wl=grp.children.find(q=>q.name==='WALL_left_wood'), sh=grp.children.find(q=>q.name==='shelf'), lp=grp.children.find(q=>q.name==='lamp');
ok(fl.material instanceof Basic&&fl.material.map&&fl.material.map.id===1&&fl.material===wl.material,'⑧ 材質換成不受場景光的，貼圖是室內那一張（同一個來源材質共用一份）');
ok(sh.material.vertexColors===true&&Math.abs(lp.material.color.g-0.8*0.86)<1e-6,'⑨ 頂點色照舊；發光的燈用發光色');
ok(Math.abs(fl.material.color.r-0.86)<1e-6,'⑩ 營業中亮度 0.86'); ok(zone.shopInLit.items[0].mesh.visible===false,'⑪ 街景模型裡簡化的店內（sk_in_dabu）藏起來');
ctx.GAME.G.hour=23; step(21); ok(Math.abs(fl.material.color.r-0.07)<1e-6,'⑫ 打烊：整間調到 0.07');
ctx.GAME.G.hour=12; step(21); ok(Math.abs(fl.material.color.r-0.86)<1e-6,'⑬ 開門：調回來');
E.player.obj.position.z=24; step(21); ok(s.on,'⑭ 走到離店面 37 m：還沒超過 far（40），留著（near 26、far 40：不會在邊界上一直接上又拿掉）');
E.player.obj.position.z=40; step(21); ok(!s.on&&g.children.length===0&&disposed===3&&zone.shopInLit.items[0].mesh.visible===true,'⑮ 走遠：拿掉、材質釋放（'+disposed+' 個）、簡化的店內放回來');
E.player.obj.position.z=-16; step(21); ok(s.on&&loads===2,'⑯ 再走回來：重新接上');
/* 新生南路的設定 */
const xs=fs.readFileSync(path.join(R,'src/xinsheng3d.js'),'utf8'); ok(/Z3\.shopInsideReal\(E,g,zone,S\.SHOP_REAL\)/.test(xs),'⑰ xinsheng3d.js 接上');
const lay={dabu:['DABU_LAYOUT','dabu_layout.js',q=>q],haopai:['HAOPAI_LAYOUT','haopai_layout.js',q=>q.haopai],xsports:['XINSHENG_SPORTS_LAYOUT','xinsheng_sports_layout.js',q=>q],shanlan:['SHANLAN_LAYOUT','shanlan_layout.js',q=>q],dakou:['DAKOU_LAYOUT','dakou_layout.js',q=>q.shop]};
const c2={Math}; vm.createContext(c2); for(const k in lay) vm.runInContext(fs.readFileSync(path.join(R,'src/data',lay[k][1]),'utf8').replace(/^const /mg,'var '),c2);
const m=/S\.SHOP_REAL=\(\(\)=>\{([\s\S]*?)\}\)\(\);/.exec(xs); const REAL=vm.runInContext('(()=>{'+m[1]+'})()',c2);
const XL=JSON.parse((t=>t.slice(t.indexOf('{'),t.lastIndexOf('}')+1))(fs.readFileSync(path.join(R,'src/data/xinsheng_layout.js'),'utf8')));
for(const q of REAL){ const L=lay[q.id][2](c2[lay[q.id][0]]), sp=XL.shops.find(z=>z.id===q.id);
  ok(L&&q.w===L.w&&q.d===L.d,'⑱ '+q.id+'：寬、深和室內配置一樣（'+q.w+'×'+q.d+'）');
  ok(sp&&Math.abs(q.cz-(sp.z0+sp.z1)/2)<0.06&&Math.abs((q.x+q.d/2)-(XL.arcade.x0-0.02))<1e-6,'⑲ '+q.id+'：中心對著街上那一間、正面貼在店面玻璃（x '+XL.arcade.x0+'）後面'); }
/* 街景模型：牆挖得夠深（不然室內被一樓牆體切掉） */
const ws=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_street.py'),'utf8');
for(const q of REAL){ const mm=new RegExp("'"+q.id+"': dict\\(int='[a-z_]+', back=([0-9.]+)").exec(ws); ok(mm&&+mm[1]>=Math.min(q.d,16)+0.1-1e-9,'⑳ wz_street.py '+q.id+' 的牆往裡挖 '+(mm&&mm[1])+' m（室內深 '+q.d+'）'); }
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
