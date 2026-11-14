/* US-NAV-TRAPS-1111（LAWWW 11-11 19:37 派給 LAWWW2：美國交換那一段場景「擋玩」巡檢，D141 只看走不到、坐不下、卡住）
   巡到的（Node，引擎真的 NavGrid＋stepEntity）：
     ① 超市街（us_market_street）停車場東邊燈桿 (27,−3.5) 的底座和兩台車的車頭中間，一條人站得住的小縫 (27.8～27.9, −4.0～−3.6)：走／跑 30 fps 推 5 次，4 次進去出不來
     ② 會所（us_clubhouse_in）門廳／自習室中間那道牆只有一格厚，在櫃台東頭 (3.1, 0.2～0.5) 被「站得住」的四點檢查跨過去：跑步斜著進去，5 次有 2 次出不來
   修法：兩個地方各補一塊導航阻擋（src/us3d.js 超市街 navFix、src/us_clubhouse3d.js buildNav），模型不動。
   這支（美國每一區：us_*、airport_*）：
     0 載入沒有錯
     1 出生點都站得住（zone.spawn、US3.SPAWN 裡屬於這一區的：含 AA_814 3-1 的 C 棟廚房 us_shared_kitchen、3-2 的社區門口 us_outside (−35,0)）
     2 每一個互動點（含座位旁邊站的地方）從出生點用 stepEntity 走得到（E.simWalk）
     3 小孤島（tools/dev_scratch/nav_islands.py 同一個掃法：canStand 0.3、每 0.1 m、和最大那一塊不相連、< 0.5 m²）：從旁邊（0.4～1.0 m）往孤島推 2 秒（走 30、跑 30、跑 10 fps），
       推進去的，16 個方向各推 3 秒都要出得來（進得去、出不來＝卡住）
     4 ①② 那兩個點站不進去
   修改前（開發分支 fe347b5e8c）：3、4 FAIL。這是模擬（D131），不是瀏覽器裡走。用法：node tests/us_nav_traps_1111_unit.js [區域 id,…] */
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
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(0,0,0)},lv:0,radius:R}; return z; }

let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('0. 載入區域檔沒有錯',!loadErr.length,loadErr.join('；'));
const ONLY=process.argv[2]?process.argv[2].split(','):null;
const ids=Object.keys(Z3.ZONES).filter(id=>/^us_|^airport/.test(id)&&(!ONLY||ONLY.includes(id)));
const SPAWNS=Object.assign({},(typeof US3!=='undefined'&&US3.SPAWN)||{}); const f2=v=>+(+v).toFixed(2);
const B1=[], B2=[], B3=[]; let nIt=0, nIsl=0, nEnt=0;
for(const id of ids){ let z; try{ z=build(id); }catch(e){ B1.push(id+' 建不出來 '+e.message.slice(0,40)); continue; }
  const sps=[['zone.spawn',z.spawn]]; for(const [k,v] of Object.entries(SPAWNS)){ const owner=ids.concat(Object.keys(Z3.ZONES).filter(x=>/^us_|^airport/.test(x))).filter(z2=>k===z2||k.startsWith(z2+'_')).sort((a,b)=>b.length-a.length)[0]; if(owner===id) sps.push(['US3.SPAWN.'+k,v]); }
  for(const [nm,s] of sps){ if(!s) continue; if(!E.canStand(s.x,s.z,0.3,s.lv|0)) B1.push(id+' '+nm+' ('+f2(s.x)+','+f2(s.z)+')'); }
  const base=z.spawn; if(!base) continue;
  for(const it of E.interactables){ if(it.hidden) continue; nIt++; const lv=it.lv|0; let tx=it.x, tz=it.z;
    if(it.seat){ const st=it.seat, yaw=st.yaw||0, dirs=[[Math.sin(yaw),Math.cos(yaw)],[Math.cos(yaw),-Math.sin(yaw)],[-Math.cos(yaw),Math.sin(yaw)],[-Math.sin(yaw),-Math.cos(yaw)]]; let ap=null; for(const d of [0.6,0.75,1.0,1.3]){ for(const [dx,dz] of dirs){ const nx=st.x+dx*d, nz=st.z+dz*d; if(E.canStand(nx,nz,0.3,lv)&&(st.y==null||Math.abs(E.heightAt(nx,nz,lv)-st.y)<=0.25)){ ap=[nx,nz]; break; } } if(ap) break; } if(!ap){ B2.push(id+' 座位旁邊站不住「'+it.label+'」'); continue; } tx=ap[0]; tz=ap[1]; }
    let tgt=null; if(E.canStand(tx,tz,0.3,lv)) tgt=[tx,tz]; else { const r=it.radius||1; for(let d=0.1;d<=r&&!tgt;d+=0.1) for(let k=0;k<16;k++){ const a=k*Math.PI/8, px=tx+Math.sin(a)*d, pz=tz+Math.cos(a)*d; if(E.canStand(px,pz,0.3,lv)){ tgt=[px,pz]; break; } } }
    if(!tgt){ B2.push(id+' 「'+it.label+'」範圍內站不住'); continue; }
    const r=E.simWalk(base.x,base.z,tgt[0],tgt[1],{lv0:base.lv|0,lv1:lv,dt:1/30}); if(!r.ok) B2.push(id+' 走不到「'+it.label+'」：'+r.reason); }
  const nLv=E.levels?E.levels.length:1;
  for(let lv=0;lv<nLv;lv++){ const n=E.levels?E.levels[lv]:E.nav; const a=n.toWorld(0,0), b=n.toWorld(n.cols-1,n.rows-1), minx=Math.min(a[0],b[0]), maxx=Math.max(a[0],b[0]), minz=Math.min(a[1],b[1]), maxz=Math.max(a[1],b[1]);
    const h=0.1, W=Math.floor((maxx-minx)/h)+1, H=Math.floor((maxz-minz)/h)+1; const S2=new Uint8Array(W*H); for(let j=0;j<H;j++) for(let i=0;i<W;i++) S2[j*W+i]=E.canStand(minx+i*h,minz+j*h,0.3,lv)?1:0;
    const lab=new Int32Array(W*H).fill(-1), labN=[], q=new Int32Array(W*H);
    for(let s=0;s<W*H;s++){ if(!S2[s]||lab[s]>=0) continue; const L=labN.length; let qh=0, qt=0, cnt=0; q[qt++]=s; lab[s]=L; while(qh<qt){ const c=q[qh++]; cnt++; const ci=c%W, cj=(c/W)|0; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=W||nj>=H) continue; const nn=nj*W+ni; if(S2[nn]&&lab[nn]<0){ lab[nn]=L; q[qt++]=nn; } } } labN.push(cnt); }
    let big=0; for(let L=1;L<labN.length;L++) if(labN[L]>labN[big]) big=L;
    for(let L=0;L<labN.length;L++){ if(L===big||labN[L]>=50) continue; nIsl++; let cx=0,cz=0,cn=0; for(let s=0;s<W*H;s++) if(lab[s]===L){ cx+=minx+(s%W)*h; cz+=minz+((s/W)|0)*h; cn++; } cx/=cn; cz/=cn;
      const inIsl=(x,z)=>{ const i=Math.round((x-minx)/h), j=Math.round((z-minz)/h); return i>=0&&j>=0&&i<W&&j<H&&lab[j*W+i]===L; };
      const starts=[]; for(let k=0;k<24;k++) for(const d of [0.4,0.6,0.8,1.0]){ const x=cx+Math.sin(k*Math.PI/12)*d, z=cz+Math.cos(k*Math.PI/12)*d; const i=Math.round((x-minx)/h), j=Math.round((z-minz)/h); if(i<0||j<0||i>=W||j>=H) continue; if(lab[j*W+i]===big){ starts.push([x,z]); break; } }
      for(const [sx0,sz0] of starts) for(const [sp,dt,tag] of [[E.SPD.walk,1/30,'走30'],[E.SPD.run,1/30,'跑30'],[E.SPD.run,0.1,'跑10']]){ const ent={obj:{position:new THREE.Vector3(sx0,0,sz0),rotation:{y:0}},radius:R,lv}; E.player=ent; const dx=cx-sx0, dz=cz-sz0, dd=Math.hypot(dx,dz)||1;
        for(let k=0;k<Math.ceil(2/dt);k++) E.stepEntity(ent,dx/dd,dz/dd,sp,dt); const o=ent.obj.position; if(!inIsl(o.x,o.z)) continue; nEnt++;
        let out=false; for(let a=0;a<16&&!out;a++){ const e2={obj:{position:o.clone(),rotation:{y:0}},radius:R,lv}; E.player=e2; for(let k=0;k<90;k++) E.stepEntity(e2,Math.sin(a*Math.PI/8),Math.cos(a*Math.PI/8),E.SPD.walk,1/30); if(!inIsl(e2.obj.position.x,e2.obj.position.z)&&Math.hypot(e2.obj.position.x-o.x,e2.obj.position.z-o.z)>0.3) out=true; }
        if(!out) B3.push(id+' 第'+lv+'層 ('+f2(cx)+','+f2(cz)+') '+cn+' 格：從 ('+f2(sx0)+','+f2(sz0)+') '+tag+' 推進去出不來'); } } } }
check('1. 出生點都站得住（'+ids.length+' 區；含 AA_814 3-1 C 棟廚房、3-2 社區門口）',!B1.length,B1.slice(0,4).join('｜'));
check('2. '+nIt+' 個互動點（座位看旁邊站的地方）從出生點都走得到',!B2.length,B2.slice(0,4).join('｜'));
check('3. 小孤島 '+nIsl+' 個：從旁邊推進去的 '+nEnt+' 次都出得來（沒有進得去、出不來的）',!B3.length,B3.slice(0,4).join('｜'));
{ const out=[]; for(const [id,x,z] of [['us_market_street',27.85,-3.8],['us_market_street',27.85,-3.65],['us_clubhouse_in',3.1,0.3],['us_clubhouse_in',3.1,0.45]]){ if(ONLY&&!ONLY.includes(id)) continue; build(id); if(E.canStand(x,z,0.3,0)) out.push(id+' ('+x+','+z+')'); }
  check('4. 超市街燈桿和車中間的小縫、會所櫃台東頭牆裡那一條：站不進去',!out.length,out.join('、')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
