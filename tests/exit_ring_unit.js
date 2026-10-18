// 室內出口的地上光圈（src/guide3d.js；UX-EXIT-MARK-1018，使用者 10-18：「離開店面的時候就會不知道出口到底在哪邊，出口那個點應該要有一個標示」）
// 室內的出口一定有光圈、戶外和電梯沒有；不同樓層的不顯示；換區域時移除；光圈不參加射線（點地移動要點得到地板）
// 用法：node tests/exit_ring_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const ctx2d=new Proxy({},{get:(t,k)=>k==='measureText'?(()=>({width:40})):(()=>{})});
global.window=global; global.innerHeight=800; global.performance={now:()=>0};
global.document={getElementById:()=>null,createElement:()=>({getContext:()=>ctx2d,width:0,height:0})};
class Obj{ constructor(){ this.position={x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}}; this.rotation={x:0}; this.scale={set(){}}; this.center={set(){}}; this.userData={}; this.visible=true; this.parent=null; } }
class Group extends Obj{ constructor(){ super(); this.children=[]; } add(o){ o.parent=this; this.children.push(o); } remove(o){ this.children=this.children.filter(c=>c!==o); o.parent=null; } }
global.THREE={SRGBColorSpace:1,DoubleSide:2,CanvasTexture:class{ constructor(im){ this.image=im; } dispose(){} },
  SpriteMaterial:class{ constructor(o){ Object.assign(this,o); } dispose(){} }, MeshBasicMaterial:class{ constructor(o){ Object.assign(this,o); } dispose(){ this.disposed=true; } },
  Sprite:class extends Obj{ constructor(m){ super(); this.material=m; } }, Mesh:class extends Obj{ constructor(g,m){ super(); this.geometry=g; this.material=m; this.isRing=true; } },
  RingGeometry:class{ dispose(){ this.disposed=true; } }};
for(const f of ['src/data/places.js','src/guide3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (PLACES|GUIDE)\s*=/m,'global.$1='),{filename:f});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
function world(indoor,its,levels){ const zone={group:new Group(),def:{}}; const nav={heightAt:()=>0};
  const E={zone,indoor,levels,interactables:its,player:{obj:{position:{x:0,y:0,z:0},rotation:{y:0}},busy:false,lv:0},cam:{mode:'follow',yaw:0},camera:{fov:50},h:800,nav,navOf:()=>nav,npcs:[]};
  const GM={E,G:{zone:'cvs',hour:12,day:1,flags:{},goal:''},S:{}}; return {E,GM}; }
const src=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8'); ok(/function addRing\(m\)/.test(src),'guide3d 有 addRing');
// guide3d 的 GM、E 是閉包變數；init 會綁地圖按鈕（要 DOM），這裡載一份 init 不綁按鈕的
const G2=vm.runInThisContext('(function(){ '+fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8').replace(/^const GUIDE\s*=/m,'return ').replace(/function init\(gm\)\{ GM=gm; E=gm.E; bindMap\(\); \}/,'function init(gm){ GM=gm; E=gm.E; }')+' })()');
// 1) 便利商店：出口（室內）有光圈
{ const its=[{x:3.2,z:-0.6,radius:1.4,label:'結帳',shop:'cvs'},{x:0,z:4.2,radius:1.5,label:'離開便利商店',exit:{to:'gongguan'}}]; const {E,GM}=world(true,its,null); G2.init(GM); G2.tick(0.1);
  const rings=E.zone.group.children.filter(c=>c.isRing); ok(rings.length===1,'便利商店出口有一個光圈（'+rings.length+'）');
  const r=rings[0]; ok(r&&Math.abs(r.position.x-0)<1e-6&&Math.abs(r.position.z-4.2)<1e-6&&r.position.y>0&&r.position.y<0.1,'光圈在出口的地上');
  ok(r&&r.rotation.x<-1.5,'光圈平躺在地上'); ok(r&&typeof r.raycast==='function'&&r.raycast()===undefined,'光圈不參加射線（點地移動不被擋）');
  E.player.obj.position.z=-2; G2.tick(0.1); ok(r.visible,'走到店裡面（離出口 6 m）光圈還看得到');
  E.player.obj.position.z=4.0; G2.tick(0.1); ok(r.visible,'站在出口上光圈也在（名牌這時候隱藏、換互動按鈕）');
  E.player.busy=true; E.cam.mode='cinematic'; G2.tick(0.1); ok(!r.visible,'劇情運鏡時不顯示'); E.player.busy=false; E.cam.mode='follow';
  E.zone={group:new Group(),def:{}}; G2.zoneChanged(); ok(!r.parent&&r.geometry.disposed&&r.material.disposed,'換區域時移除並釋放光圈'); }
// 2) 戶外的入口沒有光圈
{ const its=[{x:0,z:4.2,radius:1.5,label:'進入便利商店',exit:{to:'cvs'}}]; const {E,GM}=world(false,its,null); G2.init(GM); G2.tick(0.1); ok(E.zone.group.children.filter(c=>c.isRing).length===0,'戶外入口沒有光圈'); }
// 3) 電梯沒有光圈；分層室內：別層的出口不顯示
{ const its=[{x:0,z:4,radius:1.4,label:'離開總圖',exit:{to:'campus'},lv:0},{x:5,z:0,radius:1.2,label:'電梯',elevator:true,lv:0},{x:-3,z:2,radius:1.2,label:'走出去（平台）',exit:{to:'campus'},lv:1,y:4.2}];
  const {E,GM}=world(true,its,[{},{}]); GM.G.zone='library_hall'; G2.init(GM); G2.tick(0.1); const rings=E.zone.group.children.filter(c=>c.isRing);
  ok(rings.length===2,'兩個出口兩個光圈、電梯沒有（'+rings.length+'）'); const up=rings.find(r=>r.position.y>4); ok(up&&!up.visible,'二樓的出口光圈在一樓看不到'); ok(rings.find(r=>r.position.y<1).visible,'一樓的出口光圈看得到'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
