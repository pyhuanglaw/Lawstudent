// 一盞茶屋的前院走得進去（WZ-YIZHAN-1104；AA_656「庭院要能走到」，LAWWW2 11-04）——不需要瀏覽器（D131）。
// 建出遊戲真正的 wz_teahouse 區域（zones3d.js 的 wzShop＋teaYard），用引擎真正的找路與移動（E.simWalk、E.canStand）檢查：
//   1 出生點在冠木門裡面的前院（y −0.42），站得住；出口「離開一盞」在冠木門、按得到（範圍裡站得住、最近的互動就是它）
//   2 高度：前院 −0.42、玄關前的石板土間 −0.24、玄關 −0.12、室內 0；緣側前的沓脫石畫面上 −0.21（一階一階）
//   3 從前院走得到：玄關、茶席每一個座位、水屋的木凳、緣側的坐墊、和室、每一個互動點、打工的站位（me／boss）、看院子
//   4 緣側和前院之間只有沓脫石那一段上下：從緣側東端走到前院的路線，過 z 6.2 時 x 在 0.55～1.45；緣側邊上（沓脫石以外）站不住前院那一側
//   5 前院的擺設擋住：石燈籠、景石、老樟樹、門內灌木的中心站不住
//   6 前院模型 wz_teahouse_yard.glb：有 YARD_ROOF、YARD_EAVE 兩組（底下有網格）、三個以上的光暈（GLOW_*）、老樟樹的樹幹材質（tree_bark_camphor，網點透空）；三角形 ≤ 7 萬
//   7 區域程式：玩家在前院時 YARD_* 顯示、在屋裡藏起來（假的 fadeWalls 呼叫）
// 修改前（開發分支 c7eb109d4）：1（出生點在玄關、出口在玄關）、2（前院沒有高度）、3 的前院部分、4、6、7 FAIL。
// 用法：node tests/wz_teahouse_yard_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of pre){ if(fs.existsSync(path.join(ROOT,f))) try{ run(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
let yardLoaded=null; const realLoad=ASSETS.loadOne; ASSETS.loadOne=(k)=>{ if(k==='bldg.wz_teahouse_yard'&&yardLoaded) return Promise.resolve(yardLoaded); return Promise.reject(new Error('no GLB in node')); };
const G={zone:'wz_teahouse',day:30,hour:15,flags:{},money:5000,weather:'clear',visited:{}}; global.GAME={G};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return {z,its:E.interactables.slice()}; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.2) for(let dx=-r;dx<=r+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,0)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable&&E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [x,z]; } return null; }
const L=WZ_SHOPS_LAYOUT.teahouse;
const {z,its}=loadZone('wz_teahouse'); const N=E.nav, sp=z.spawn, S0=[sp.x,sp.z];

// 1 出生點、出口
check('1 出生點在冠木門裡面的前院', sp.z>8.5&&Math.abs(sp.x+3.0)<0.3, J(sp));
check('1 出生點站得住、高度 −0.42', E.canStand(sp.x,sp.z,0.32,0)&&Math.abs(N.heightAt(sp.x,sp.z)+0.42)<0.01, 'y '+r2(N.heightAt(sp.x,sp.z)));
const ex=its.find(it=>it.exit&&it.exit.to==='wenzhou');
check('1 出口「離開一盞」在冠木門', !!ex&&ex.z>9.0&&Math.abs(ex.x+3.0)<0.3, ex&&J({x:ex.x,z:ex.z,label:ex.label}));
check('1 出口按得到（從出生點走得到）', !!ex&&!!touchable(ex,S0));
// 2 高度
const H=(x,zz)=>r2(N.heightAt(x,zz)), VH=(x,zz)=>r2(N.visualHeightAt(x,zz));
check('2 前院 −0.42', H(0.5,8.0)===-0.42&&H(-3.0,7.4)===-0.42, J([H(0.5,8.0),H(-3.0,7.4)]));
check('2 玄關前的石板土間 −0.24、玄關 −0.12、室內 0', H(-3.0,5.6)===-0.24&&H(-3.0,4.4)===-0.12&&H(-1.6,3.2)===0&&H(1.0,5.5)===0, J([H(-3.0,5.6),H(-3.0,4.4),H(-1.6,3.2),H(1.0,5.5)]));
check('2 沓脫石畫面上 −0.21（一階一階）', VH(1.0,6.45)===-0.21&&VH(1.0,6.0)===0&&VH(1.0,6.9)===-0.42, J([VH(1.0,6.9),VH(1.0,6.45),VH(1.0,6.0)]));
// 3 走得到
const targets=[['玄關',[-3.0,4.2]],['茶席旁',[-1.6,3.1]],['水屋前',[2.75,1.0]],['緣側',[2.4,5.5]],['和室 A',[-2.15,-2.0]],['和室 B',[2.15,-2.0]]];
for(const [nm,t] of targets){ const w=walk(S0,t); check('3 前院 → '+nm, w.ok, w.ok?'':J(w)); }
const seats=its.filter(it=>it.seat), inter=its.filter(it=>it.wzShop==='teahouse');
let badS=[]; for(const it of seats.concat(inter)){ if(!touchable(it,S0)) badS.push((it.label||it.kind)+'@'+r2(it.x)+','+r2(it.z)); }
check('3 每個座位、互動點從前院按得到（'+(seats.length+inter.length)+' 個）', !badS.length, badS.join(' '));
let badW=[]; for(const k of ['a','b','c']) for(const who of ['me','boss']){ const p=L.work[k][who]; if(!p) continue; if(!E.canStand(p.x,p.z,0.3,0)||!walk(S0,[p.x,p.z]).ok) badW.push(k+'.'+who); }
check('3 打工的站位站得住、從前院走得到', !badW.length, badW.join(' '));
// 4 緣側和前院之間只有沓脫石
const pth=E.pathTo?E.pathTo(3.4,5.5,0,3.2,7.4,0):N.path(3.4,5.5,3.2,7.4); let cross=null;
if(pth) for(let i=1;i<pth.length;i++){ const a=pth[i-1], b=pth[i]; if((a[1]-6.2)*(b[1]-6.2)<=0&&a[1]!==b[1]){ const t=(6.2-a[1])/(b[1]-a[1]); cross=a[0]+(b[0]-a[0])*t; } }
check('4 緣側東端 → 前院：從沓脫石下去', !!pth&&cross!=null&&cross>=0.55&&cross<=1.45, 'x '+(cross==null?'-':r2(cross)));
const w4=walk([3.4,5.5],[3.2,7.4]); check('4 （真的走）緣側東端 → 前院', w4.ok, w4.ok?'':J(w4));
let edge=[]; for(let x=-1.8;x<=3.8;x+=0.2){ if(x>0.4&&x<1.6) continue; if(E.canStand(x,6.35,0.32,0)) edge.push(r2(x)); }
check('4 緣側邊上（沓脫石以外）前院那一側站不住', !edge.length, edge.join(','));
// 5 擺設
const props=[['石燈籠',-1.5,8.9],['景石',2.2,7.6],['老樟樹',3.65,9.0],['門內灌木',-3.9,9.05]];
const stood=props.filter(p=>E.canStand(p[1],p[2],0.32,0)).map(p=>p[0]); check('5 前院的擺設擋住', !stood.length, stood.join(' '));
// 6 前院模型
const gp=path.join(ROOT,'assets/models/env/second_ai/wz_teahouse_yard.glb'); let gj=null;
if(fs.existsSync(gp)){ const b=fs.readFileSync(gp); const l=b.readUInt32LE(12); gj=JSON.parse(b.slice(20,20+l).toString('utf8')); }
check('6 wz_teahouse_yard.glb 存在', !!gj);
if(gj){ const nodes=gj.nodes, byName=n=>nodes.findIndex(q=>q.name===n);
  for(const g of ['YARD_ROOF','YARD_EAVE']){ const i=byName(g); const kids=i>=0?(nodes[i].children||[]).filter(c=>nodes[c].mesh!=null):[]; check('6 '+g+' 底下有網格', kids.length>0, kids.length+' 個'); }
  const glows=nodes.filter(q=>/^GLOW_/.test(q.name||'')); check('6 光暈 ≥ 3（門燈、石燈籠、提燈）', glows.length>=3, glows.length+' 個');
  check('6 老樟樹的樹幹材質 tree_bark_camphor（區域的 seeThru）', gj.materials.some(m=>m.name==='tree_bark_camphor')&&(L.seeThru||[]).includes('tree_bark_camphor'));
  let tris=0; for(const m of gj.meshes) for(const p of m.primitives){ const a=gj.accessors[p.indices]; tris+=a?a.count/3:0; } check('6 三角形 ≤ 7 萬', tris<=70000, Math.round(tris)+''); }
// 7 在前院才顯示屋頂
{ const roof=new THREE.Group(); roof.name='YARD_ROOF'; z.yardParts=z.yardParts||[]; z.yardParts.push(roof); const cam={position:new THREE.Vector3(0,3,12)};
  const ok0=typeof z.fadeWalls==='function'; if(ok0){ z.fadeWalls(cam,new THREE.Vector3(-3,0,8.5)); var inY=roof.visible; z.fadeWalls(cam,new THREE.Vector3(-1.6,0,2.0)); var inH=roof.visible; }
  check('7 玩家在前院顯示 YARD_*、在屋裡藏起來', ok0&&inY===true&&inH===false, ok0?J({yard:inY,house:inH}):'沒有 fadeWalls'); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
