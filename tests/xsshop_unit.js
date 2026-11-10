/* 新生南路的一層小店：大步球鞋（xs_dabu）、好拍運動（xs_haopai）（XS-SHOPS-REST-1105 ②③，LAWWW2-C 11-05）——不需要瀏覽器，
   在 Node 裡建出遊戲真正的區域，用引擎真正的找路＋移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步）走。每一間：
   ① 區域有登記、正式模型（CC 的 v2b）在 ASSETS
   ② 進來的位置站得住、在「離開…」的範圍外面；店門走得到
   ③ 座位（大步：兩張試穿長凳 4 個位子；好拍：高腳凳、圓凳）的走近點走得到；高腳凳照座面抬高
   ④ 互動點（試穿、看看、買東西、照鏡子、穿線…）走得到
   ⑤ 沒有小孤島：每 0.1 m 站得住的點，從進來的位置都走得到（v9.3 #31）
   ⑥ 新生南路：「進大步球鞋」「進好拍運動」→ 區域；從店裡出來的點站得住、在店門互動點的範圍外面、走得回店門
   ⑦ 正式模型：WALL_* 都有 dir（自己的或上層節點的）、GLOW_ 光暈節點有 glow；家具不在走道上（配置的 blocks 和 GLB 對得上：抽樣幾件）
   ⑧ 營業時間（AA_620：大步 11:00～22:00；好拍 12:00～21:00、週日休）、店門擋：接線 patch 套上以後才有，沒套就略過
   這是模擬（證明路走得通），不是真實玩家流程（瀏覽器測試照 D131）。用法：node tests/xsshop_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dabu_layout.js','src/data/haopai_layout.js','src/xsshop3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
/* 座位的走近點：GAME.seatApproach 的候選（前 0.5、後 0.6、左右 0.55、後 0.7、0.75、前 0.8），站得住、在「坐下」的範圍（0.8 m）裡 */
const seatAps=(s,n)=>{ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw);
  return [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8]].map(([dx,dz])=>[s.x+dx,s.z+dz]).filter(a=>n.clear(a[0],a[1],0.3)); };
const nearOk=(q,from,n)=>{ for(let r=0;r<=0.9;r+=0.1) for(let a=0;a<6.28;a+=0.39){ const x=q.x+Math.cos(a)*r, zz=q.z+Math.sin(a)*r; if(n.clear(x,zz,0.3)&&walk(from,[x,zz]).ok) return true; } return false; };
function readGLB(url){ const b=fs.readFileSync(path.join(ROOT,url)), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()); const par={}; J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>par[c]=i)); return {J,par}; }
const top=(typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.45;

const WANT={dabu:{seats:4,inter:6,label:'大步球鞋',hours:[11,22],sunday:true},haopai:{seats:2,inter:3,label:'好拍運動',hours:[12,21],sunday:false}};
for(const id of Object.keys(WANT)){ const W=WANT[id], C=XSS.SHOPS[id], L=C.lay(), T=W.label+'：';
  // ①
  check(`${T}① Z3.ZONES 有 ${C.zone}；ASSETS 有正式模型 ${C.glbKey}（CC v2b）`,!!Z3.ZONES[C.zone]&&!!ASSETS.manifest[C.glbKey]&&fs.existsSync(path.join(ROOT,ASSETS.manifest[C.glbKey].url)));
  // ②
  const z=loadZone(C.zone), n=z.nav, IN=[z.spawn.x,z.spawn.z]; const ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng');
  check(`${T}② 進來的位置站得住、在「離開${W.label}」的範圍外面；店門走得到`,n.clear(IN[0],IN[1],0.3)&&!!ex&&Math.hypot(IN[0]-ex.x,IN[1]-ex.z)>ex.radius+0.1&&nearOk(ex,IN,n),`(${IN[0]}, ${IN[1]})，離出口 ${ex?Math.hypot(IN[0]-ex.x,IN[1]-ex.z).toFixed(2):'—'} m`);
  // ③
  { const bad=[]; for(const s of L.seats) if(!seatAps(s,n).some(a=>walk(IN,a).ok)) bad.push(`${s.label}(${s.x},${s.z})`);
    const its=E.interactables.filter(q=>q.seat), hi=L.seats.filter(s=>(s.h!=null?s.h:L.seatH)>0.6), liftOk=its.every(q=>{ const s=L.seats.find(t=>t.x===q.x&&t.z===q.z), h=s.h!=null?s.h:L.seatH; return h>0.6?Math.abs(q.seat.lift-(h-top))<0.002:!q.seat.lift; });
    check(`${T}③ ${L.seats.length} 個座位的走近點都走得到；「坐下」按鈕 ${its.length} 個；高腳凳 ${hi.length} 張照座面抬高`,L.seats.length===W.seats&&its.length===W.seats&&!bad.length&&liftOk,bad.join(' ')); }
  // ④
  { const it=XSS.INTERACT(id), bad=it.filter(q=>!nearOk(q,IN,n)).map(q=>q.kind+`(${q.x},${q.z})`);
    check(`${T}④ ${it.length} 個互動點（${it.map(q=>q.kind).join('、')}）都走得到`,it.length===W.inter&&!bad.length,bad.join(' ')); }
  // ⑤
  { const pts=[]; for(let x=-L.w/2+0.3;x<=L.w/2-0.3+1e-6;x+=0.1) for(let zz=-L.d/2+0.3;zz<=L.d/2-0.3+1e-6;zz+=0.1) if(n.clear(x,zz,0.32)) pts.push([+x.toFixed(1),+zz.toFixed(1)]);
    const key=p=>p[0].toFixed(1)+','+p[1].toFixed(1), set=new Map(pts.map(p=>[key(p),p])), seen=new Set(), start=pts.reduce((b,p)=>Math.hypot(p[0]-IN[0],p[1]-IN[1])<Math.hypot(b[0]-IN[0],b[1]-IN[1])?p:b,pts[0]);
    const q=[start]; seen.add(key(start)); while(q.length){ const p=q.pop(); for(const [dx,dz] of [[0.1,0],[-0.1,0],[0,0.1],[0,-0.1]]){ const k=(p[0]+dx).toFixed(1)+','+(p[1]+dz).toFixed(1); if(set.has(k)&&!seen.has(k)){ seen.add(k); q.push(set.get(k)); } } }
    const isl=pts.filter(p=>!seen.has(key(p))).map(p=>`(${p[0]},${p[1]})`);
    check(`${T}⑤ 沒有小孤島：${pts.length} 個站得住的點都從進來的位置連得到`,!isl.length,isl.slice(0,12).join(' ')+(isl.length>12?` …共 ${isl.length}`:'')); }
  // ⑥
  { const out=ex.exit.spawn, zs=loadZone('xinsheng'), door=E.interactables.find(q=>q.exit&&q.exit.to===C.zone);
    check(`${T}⑥ 新生南路：「進${W.label}」→ ${C.zone}`,!!door&&door.label.startsWith('進'+W.label),door?door.label:'沒有');
    const ok=!!door&&zs.nav.clear(out.x,out.z,0.3)&&Math.hypot(out.x-door.x,out.z-door.z)>door.radius+0.1&&walk([out.x,out.z],[door.x+0.5,door.z]).ok;
    check(`${T}⑥ 從店裡出來站在騎樓：站得住、在店門互動點的範圍外面、走得回店門`,ok,`(${out.x}, ${out.z})${door?'，離店門 '+Math.hypot(out.x-door.x,out.z-door.z).toFixed(2)+' m':''}`); }
  // ⑦
  { const {J,par}=readGLB(L.glb); const dirOf=i=>{ for(let k=i;k!=null;k=par[k]){ const e=J.nodes[k].extras; if(e&&Array.isArray(e.dir)) return e.dir; } return null; };
    const walls=J.nodes.map((nd,i)=>[nd,i]).filter(([nd])=>nd.mesh!=null&&/WALL_/.test(nd.name||'')), badW=walls.filter(([nd,i])=>!dirOf(i)).map(([nd])=>nd.name);
    const glows=J.nodes.filter(nd=>/^GLOW_/.test(nd.name||'')), badG=glows.filter(nd=>!(nd.extras&&nd.extras.glow)).map(nd=>nd.name);
    check(`${T}⑦ 正式模型：WALL_ 網格 ${walls.length} 塊都有 dir；GLOW_ ${glows.length} 個都有 glow（合成光暈）`,walls.length>=8&&!badW.length&&!badG.length,[badW.join(' '),badG.join(' ')].filter(Boolean).join('｜')); }
  // ⑧
  if(PLACES.hours&&PLACES.hours[C.zone]){ const o=(h,d)=>PLACES.isOpen(C.zone,h,d); const wd=d=>CALENDAR.dateOf(d).wd; let thu=1, sun=1; while(wd(thu)!==4) thu++; while(wd(sun)!==7) sun++;   /* calendar.js：1＝週一 … 7＝週日 */
    const [h0,h1]=W.hours; const ok=!o(h0-0.1,thu)&&o(h0,thu)&&o(h1-0.1,thu)&&!o(h1+0.1,thu)&&(W.sunday?o(h0+1,sun):!o(h0+1,sun))&&PLACES.names[C.zone]===W.label;
    const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), gate=new RegExp("it\\.exit\\.to==='"+C.zone+"'&&!PLACES\\.isOpen\\('"+C.zone+"'").test(st);
    check(`${T}⑧ 營業時間 ${h0}:00～${h1}:00${W.sunday?'':'、週日休'}；名字；story3d.js 店門照開放時間擋`,ok&&gate,PLACES.closedText(C.zone,h0-1,thu)+(gate?'':'｜story3d.js 沒有店門擋')); }
  else console.log(`略過 ${T}⑧ 營業時間：places.js 還沒有 ${C.zone}（接線 patch 沒套）`);
}
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
