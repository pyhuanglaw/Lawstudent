/* 新生南路側門搬到映月湖和博思中間（XS-GATE-MOVE-1105，LAWWW2-C 11-05；使用者 07:5x「新生南路側門有，但怎麼跟公館同側。我希望它在映月湖和博思中間」）
   ① 側門出口在 (−64.4, −99)、從新生南路回來的落點站得住；落點走得到側門出口、映月湖南岸、博思門口、校門內側、校園出生點
   ② 斜牆外（原本 z −80～−94 那塊草地、舊側門那條小路）一格都走不到；x −66 那一段牆外也走不到；牆內貼著斜牆的草地照舊站得住
   ③ 舊存檔存在舊側門附近 (−120, −83)：引擎 unstick 一次就放到 3 m 內站得住、而且走得到校園出生點的地方
   ④ 牆外有新生南路的路面（柏油、人行道）
   ⑤ 舊的出口、舊的停車架不在了
   用法：node tests/xs_gate_move_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 校園的正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=eval(T.match(/const files=(\[[^\]]+\])/)[1]);
for(const f of ['src/townkit3d.js','src/campuskit3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const warn=console.warn; console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=XINSHENG_LAYOUT, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const cz=Z3.ZONES.campus.build(E), cn=cz.nav;
const cOf=(x,zz)=>[Math.floor((x-cn.ox)/cn.cell),Math.floor((zz-cn.oz)/cn.cell)];
const free=(x,zz)=>{ const [c,r]=cOf(x,zz); return c>=0&&r>=0&&c<cn.cols&&r<cn.rows&&!cn.b[cn.idx(c,r)]; };
function reach(a,b){ const [sx,sz]=cOf(...a), [tx,tz]=cOf(...b); const seen=new Uint8Array(cn.cols*cn.rows), q=[[sx,sz]]; seen[cn.idx(sx,sz)]=1;
  while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=cn.cols||ny>=cn.rows) continue; const i=cn.idx(nx,ny); if(seen[i]||cn.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
// ①
const ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng'), cs=L.sideGate.campusSpawn;
check('①a 側門出口在 (−64.4, −99)',!!ex&&Math.abs(ex.x+64.4)<0.01&&Math.abs(ex.z+99)<0.01,ex?ex.x+','+ex.z:'沒有出口');
check('①b 從新生南路回來的落點站得住、不在出口範圍裡',free(cs.x,cs.z)&&!!ex&&Math.hypot(cs.x-ex.x,cs.z-ex.z)>ex.radius,cs.x+','+cs.z);
const boya=E.interactables.find(q=>q.exit&&/博思/.test(q.label||''));
const goals={'側門出口':ex&&[ex.x,ex.z],'映月湖南岸步道 (−36, −98)':[-36,-98],'博思北側步道 (−38, −95)':boya?[boya.x,boya.z]:[-38,-95],'校門內側 (−110, 0)':[-110,0],'校園出生點':[cz.spawn.x,cz.spawn.z]};
const miss=Object.entries(goals).filter(([k,p])=>!p||!reach([cs.x,cs.z],p)).map(([k])=>k);
check('①c 落點走得到側門出口、映月湖、博思、校門、校園出生點',!miss.length,miss.join(' ')||Object.keys(goals).length+' 處');
// ②
const [ax,az]=[-124,-80], [bx,bz]=[-66,-94], Ld=Math.hypot(bx-ax,bz-az);
const side=(x,zz)=>((bx-ax)*(zz-az)-(bz-az)*(x-ax))/Ld;   /* >0：牆內（東南邊） */
let out=0; const outPts=[]; for(let x=-123.75;x<-60;x+=0.5) for(let zz=-140.75;zz<-79;zz+=0.5){ const outside=(x<-66.3&&zz<-94)||(x<=bx&&side(x,zz)<-0.3); if(outside&&free(x,zz)){ out++; if(outPts.length<4) outPts.push(x+','+zz); } }
check('②a 斜牆外、x −66 牆外一格都走不到',out===0,out+' 格 '+outPts.join(' '));
check('②b 舊側門那條小路 (−110, −83.2)、草地中間 (−95, −88) 走不到',!free(-110,-83.2)&&!free(-95,-88));
const inside=[[-115,-80.5],[-100,-83],[-80,-83]].filter(p=>!free(...p)).map(p=>p.join(','));
check('②c 牆內貼著斜牆的草地照舊站得住（−115,−80.5／−100,−83／−80,−83；z −84 以北本來就是樹林）',!inside.length,inside.join(' '));
// ③
E.player={lv:0,obj:new THREE.Object3D()}; E.nav=cn; E.levels=cz.levels; E.zone=cz;
E.player.obj.position.set(-120,0,-83); const moved=E.unstick(E.player,16), p=E.player.obj.position;
check('③ 舊存檔 (−120, −83)：unstick 放到 3.5 m 內、走得到校園出生點',moved&&Math.hypot(p.x+120,p.z+83)<=3.5&&reach([p.x,p.z],[cz.spawn.x,cz.spawn.z]),moved?p.x.toFixed(2)+','+p.z.toFixed(2):'沒有移動');
// ④
E.scene.add(cz.group); E.scene.updateMatrixWorld(true);
const meshes=[]; E.scene.traverse(o=>{ if(o.isMesh) meshes.push(o); });
const rc=new THREE.Raycaster(); const hitMat=(x,zz)=>{ rc.set(new THREE.Vector3(x,30,zz),new THREE.Vector3(0,-1,0)); const h=rc.intersectObjects(meshes,false).filter(h=>h.point.y<0.2); return h.length?h[0].object.material:null; };
const asph=hitMat(-95,-120), walk=hitMat(-68.5,-120);
check('④a 牆外 (−95, −120) 是柏油路面',!!asph&&!!asph.map&&!!asph.map.userData&&asph.map.userData.asphalt===true);
check('④b 牆外 (−68.5, −120) 是人行道（不是柏油）',!!walk&&walk!==asph&&!(walk.map&&walk.map.userData&&walk.map.userData.asphalt));
// ⑤
check('⑤a 舊的出口（西牆 (−122.6, −84) 那一帶）不在了',!E.interactables.some(q=>q.exit&&q.exit.to==='xinsheng'&&q.x<-100));
const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
check('⑤b 舊側門的停車架 [−113.5, −82.5] 搬走了、側門往東的步道邊有一座 (−55, −101.6)',!/\[-113\.5,-82\.5/.test(src)&&/\[-55,-101\.6,0\]/.test(src));
console.warn=warn;
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
