/* NAV-NOTCH-TRAPS-1112（LAWWW2；原本跟著舊序章巡檢一起做的，那一筆取消以後這幾個共用場景的「擋玩」另外留下來）
   區域：校園、普通／博思／共同教學館、宿舍、Café、總圖、社科院圖書館、公館、溫州街（方法照 tests/us_nav_traps_1111_unit.js）。
   巡到的（Node，引擎真的 canStand＋stepEntity）：
     ① 小縫（進得去、出不來）：校園法學院那一帶斜的一排（13 塊）＋(91.25,−113) 兩塊、溫州街 (20.75,5.75)、社科院圖書館 (10.2,−7.0)——src/zones3d.js NAV_NOTCHES 擋那幾格
     ② 社科院圖書館二樓（東側館）兩張沙發：前面是矮桌，GAME.seatApproach 退回沙發後面，點沙發走到背後、「坐在沙發上」不出來——src/soclib2f3d.js 給沙發一個走近點（seat.ap，東側）
   這支：0 載入沒有錯／1 出生點站得住／2 每一個互動點從出生點走得到、座位照 GAME.seatApproach 走過去按鈕是那一張／3 小孤島推進去都出得來／4 ① 那幾格站不進去、② 兩張沙發的走近點在沙發東側、站得住
   這是模擬（D131）。用法：node tests/nav_notch_traps_1112_unit.js [區域 id,…] */
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
check('0. 載入區域檔沒有錯',!loadErr.length,loadErr.join('；'));
const G3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const mS=/  function seatApproach\(seat\)\{[\s\S]*?\n    return best\|\|\[seat\.x\+fx\*0\.5,seat\.z\+fz\*0\.5\]; \}\n/.exec(G3);
const seatApproach=mS?(new Function('E',mS[0]+'\nreturn seatApproach;'))(E):null;
const ZS=['campus','putong','boya','boya_203','gongtong','gongtong_3f','dorm','dorm_hall','dorm_laundry','dorm_205','cafe','library','library_hall','library_b1','library_carrels','library_stacks','library_media','soclib','soclib_2f','gongguan','wenzhou'];
const ONLY=process.argv[2]?process.argv[2].split(','):null; const ids=ZS.filter(id=>Z3.ZONES[id]&&(!ONLY||ONLY.includes(id)));
const EXTRA_SP={campus:[[-3,12],[-34.6,-97.0]],dorm:[[0,2.4]]};
const f2=v=>+(+v).toFixed(2); const B1=[], B2=[], B3=[]; let nIt=0, nSeat=0, nIsl=0, nEnt=0;
for(const id of ids){ let z; try{ z=build(id); }catch(e){ B1.push(id+' 建不出來 '+e.message.slice(0,40)); continue; }
  const base=z.spawn; if(!base){ B1.push(id+' 沒有出生點'); continue; }
  for(const [x,zz] of [[base.x,base.z]].concat(EXTRA_SP[id]||[])) if(!E.canStand(x,zz,0.3,base.lv|0)) B1.push(id+' ('+f2(x)+','+f2(zz)+')');
  const P={obj:{position:new THREE.Vector3(base.x,0,base.z),rotation:{y:0}},lv:base.lv|0,radius:R};
  for(const it of E.interactables){ if(it.hidden) continue; if(it.plain&&it.seasonLook&&id!=='gongguan') continue;   /* 花序門口那一筆只在公館：這支 build() 完才設 zone.id，別的區會被多放一次 */ nIt++; const lv=it.lv|0;
    if(it.seat){ nSeat++; E.player={obj:{position:new THREE.Vector3(base.x,0,base.z),rotation:{y:0}},lv:base.lv|0,radius:R}; const ap=seatApproach(it.seat), slv=it.seat.lv!==undefined?it.seat.lv|0:lv;
      const r=E.simWalk(base.x,base.z,ap[0],ap[1],{lv0:base.lv|0,lv1:slv}); if(!r.ok){ B2.push(id+' 走不到座位「'+it.label+'」('+f2(it.seat.x)+','+f2(it.seat.z)+')：'+r.reason); continue; }
      E.player.obj.position.set(r.x,r.y!=null?r.y:E.heightAt(r.x,r.z,slv),r.z); E.player.lv=slv; E.player.tapPref={x:it.seat.x,z:it.seat.z,lv:slv,zone:E.zone.id};
      const n=E.nearestInteractable(); if(n!==it&&!(n&&n.seat===it.seat)) B2.push(id+' 點「'+it.label+'」('+f2(it.seat.x)+','+f2(it.seat.z)+') 走到 ('+r.x+','+r.z+')：按鈕是 '+(n?n.label+(n.seat?'('+n.seat.x+','+n.seat.z+')':''):'沒有')); continue; }
    const rr=it.radius||1, cands=[]; if(E.canStand(it.x,it.z,0.3,lv)) cands.push([it.x,it.z]); for(let d=0.15;d<=rr-0.05&&cands.length<8;d+=0.15) for(let k=0;k<12&&cands.length<8;k++){ const a=k*Math.PI/6, px=it.x+Math.sin(a)*d, pz=it.z+Math.cos(a)*d; if(E.canStand(px,pz,0.3,lv)) cands.push([px,pz]); }
    if(!cands.length){ B2.push(id+' 「'+it.label+'」範圍內站不住'); continue; }
    if(!cands.some(tg=>E.simWalk(base.x,base.z,tg[0],tg[1],{lv0:base.lv|0,lv1:lv,dt:1/30}).ok)) B2.push(id+' 走不到「'+it.label+'」('+f2(it.x)+','+f2(it.z)+')'); }
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
check('1. 出生點都站得住（'+ids.length+' 區）',!B1.length,B1.slice(0,4).join('｜'));
check('2. '+nIt+' 個互動點從出生點走得到；其中 '+nSeat+' 個座位照 GAME.seatApproach 走過去、點那張椅子，按鈕是那一張',!B2.length&&!!seatApproach,(seatApproach?'':'game3d.js 找不到 seatApproach；')+B2.slice(0,4).join('｜'));
check('3. 小孤島 '+nIsl+' 個：從旁邊推進去的 '+nEnt+' 次都出得來',!B3.length,B3.slice(0,4).join('｜'));
{ const out=[]; const P4=[['campus',94.0,-78.9],['campus',91.1,-113.1],['campus',96.1,-76.6],['wenzhou',20.9,5.9],['soclib',10.0,-7.1]];
  for(const [id,x,z] of P4){ if(ONLY&&!ONLY.includes(id)) continue; build(id); if(E.canStand(x,z,0.3,0)) out.push(id+' ('+x+','+z+') 站得住'); }
  if(!ONLY||ONLY.includes('soclib_2f')){ build('soclib_2f'); for(const it of E.interactables.filter(q=>q.label==='坐在沙發上')){ const ap=it.seat.ap; if(!ap||!(ap[0]>-2.2)||!E.canStand(ap[0],ap[1],0.3,it.lv|0)) out.push('社科院二樓沙發 ('+it.seat.x+','+it.seat.z+') 走近點 '+JSON.stringify(ap)); } }
  check('4. 校園、溫州街、社科院圖書館那幾格小縫站不進去；社科院二樓兩張沙發的走近點在東側、站得住',!out.length,out.join('、')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
