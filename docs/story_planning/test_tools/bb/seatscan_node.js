/* BB-C 11-05 SEATSCAN（Node）：每個區域的每個玩家座位（有「坐下」互動點的）：
   ① 走近點候選（game3d.js seatApproach 那 8 個＋seat.ap）裡站得住的有幾個、離互動點多遠、在不在按鈕範圍裡（radius−0.05）、留給停偏的餘裕（範圍−距離）
   ② 一個站得住的都沒有＝起身會被放回站不住的地方（卡住）。用法：node seatscan_node.js <repo> [zone,...] */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]||'.'), ONLY=(process.argv[3]||'').split(',').filter(Boolean);
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
for(const f of SRCS){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){} }
console.warn=()=>{}; const out=console.log;
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const G={day:20,weekday:3,hour:14,flags:{},social:{},zone:null}; if(typeof GAME!=='undefined') GAME.G=G;
for(const id of Object.keys(Z3.ZONES)){ if(ONLY.length&&!ONLY.includes(id)) continue;
  let z; try{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; G.zone=id; z=Z3.ZONES[id].build(E); }catch(e){ continue; }
  E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(!E.nav) continue;
  const navOf=lv=>E.levels?(E.levels[lv|0]||E.levels[0]):E.nav;
  const stand=(x,zz,lv)=>{ const n=navOf(lv); return n.clear?n.clear(x,zz,0.3):n.free(x,zz); };
  const sits=(E.interactables||[]).filter(q=>q&&q.seat);
  let bad=[], tight=[];
  for(const it of sits){ const st=it.seat, yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=st.lv|0, reach=(it.radius||1.8)-0.05;
    const C=[...(st.ap?[[st.ap[0]-st.x,st.ap[1]-st.z]]:[]),[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]];
    let best=null; for(const [dx,dz] of C){ const x=st.x+dx, zz=st.z+dz; if(!stand(x,zz,lv)) continue; if(st.y!=null&&Math.abs(navOf(lv).heightAt(x,zz)-st.y)>0.2) continue; const d=Math.hypot(x-it.x,zz-it.z); const m=reach-d; if(!best||m>best.m) best={x,zz,d,m}; }
    const lab=`${it.label||'?'} (${st.x.toFixed(2)},${st.z.toFixed(2)}${lv?' L'+lv:''}) 範圍 ${reach.toFixed(2)}`;
    if(!best) bad.push(lab+' 走近點一個都站不住');
    else if(best.m<0.2) tight.push(lab+` 最好的走近點離互動點 ${best.d.toFixed(2)}，餘裕 ${best.m.toFixed(2)}`);
  }
  if(sits.length) out(`${bad.length?'BAD ':tight.length?'TIGHT':'ok   '} ${id}：座位 ${sits.length}，站不住 ${bad.length}，餘裕 <0.2 m ${tight.length}`);
  for(const b of bad.slice(0,6)) out('   × '+b); for(const t of tight.slice(0,6)) out('   △ '+t);
}
