/* TAPSTEAL-1105（BB-C BB_255，原本是 BB 的 docs/story_planning/test_tools/bb/tapsteal_node.js）：點座位多 0.5 m（TAP-SEAT-REACH）不能讓旁邊的非座位互動點（吧檯點餐、看班表、討論室…）更常被搶成座位——
   每個點位的「變成座位」次數，E.TAP_SEAT_REACH=0.5 時不能比 =0（加範圍以前）多。原本的說明：BB-C 11-05：點椅子範圍＋0.5（TAP-SEAT-REACH）會不會搶走旁邊的東西。
   每個非座位互動點 o：在 o 周圍 0.3 m 內取 8 個「點的位置」，玩家站在 o 的範圍 60% 處（四個方向），照 E.nearestInteractable 算；結果是座位而不是 o 的，列出來。 */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]||'.');
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
function run(){ const res={};
for(const id of Object.keys(Z3.ZONES)){
  let z; try{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; G.zone=id; z=Z3.ZONES[id].build(E); }catch(e){ continue; }
  if(z.id==null) z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  const its=(E.interactables||[]).filter(Boolean), seats=its.filter(q=>q.seat), others=its.filter(q=>!q.seat&&!q.hidden);
  const hits=[];
  for(const o of others){ const near=seats.filter(s=>Math.hypot(s.seat.x-o.x,s.seat.z-o.z)<0.8&&((s.seat.lv|0)===(o.lv|0))); if(!near.length) continue;
    const R=(o.radius||1.8)*0.6; let bad=0, n=0, ex=null;
    for(let a=0;a<8;a++){ const tx=o.x+0.3*Math.cos(a*Math.PI/4), tz=o.z+0.3*Math.sin(a*Math.PI/4);
      for(let b=0;b<4;b++){ const px=o.x+R*Math.cos(b*Math.PI/2), pz=o.z+R*Math.sin(b*Math.PI/2);
        E.player={obj:{position:new THREE.Vector3(px,0,pz),rotation:{y:0}},lv:o.lv|0,radius:0.32,seat:null,tapPref:{x:tx,z:tz,lv:o.lv|0,zone:z.id}};
        const r=E.nearestInteractable(); n++; if(r&&r!==o&&r.seat){ bad++; if(!ex) ex=r.label; } } }
    res[id+'|'+o.label+'|'+o.x.toFixed(2)+','+o.z.toFixed(2)]=bad; if(bad) hits.push(`「${o.label}」(${o.x.toFixed(2)},${o.z.toFixed(2)}) 旁邊有座位：點在它周圍 0.3 m，${bad}/${n} 次變成「${ex}」`);
  }
}
return res; }
E.TAP_SEAT_REACH=0; const base=run(); E.TAP_SEAT_REACH=0.5; const now=run();
let fails=0, n=0; for(const k of Object.keys(now)){ n++; if(now[k]>(base[k]||0)){ fails++; out('FAIL '+k+'：加範圍以前 '+(base[k]||0)+' 次、現在 '+now[k]+' 次變成座位'); } }
out((fails?'FAIL':'PASS')+' 1. 旁邊有座位的非座位互動點 '+n+' 個：點座位多 0.5 m 沒有讓任何一個更常被搶走');
if(!fails) out('ALL PASS'); process.exit(fails?1:0);
