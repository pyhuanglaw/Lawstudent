/* BB-C 11-05 TAPSCAN（Node 部分）：每個區域、每一層，地板高度和這一層基本高度（y0）差超過 0.15 m 的可走格，
   上方有沒有 zone.walkMeshes 接住（從上往下打，打到的高度和導航格差 ≤0.1 m）。沒有＝點地會退回 y0 平面、落點偏移（南洋 1 廳、體育館看台那一類）。
   注意：GLB 非同步載入的 walkMeshes 在 Node 裡建不出來，報出來的要再對程式。用法：node tapscan_node.js <repo> */
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
console.warn=()=>{}; console.log0=console.log;
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const G={day:20,weekday:3,hour:14,flags:{},social:{},zone:null}; if(typeof GAME!=='undefined') GAME.G=G;
const rows=[];
for(const id of Object.keys(Z3.ZONES)){
  let z; try{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; G.zone=id; z=Z3.ZONES[id].build(E); }catch(e){ rows.push([id,'BUILD_ERR',String(e).slice(0,80)]); continue; }
  const L=z.levels||[z.nav]; if(!L||!L[0]) continue; if(z.group) z.group.updateMatrixWorld(true);
  const wm=(z.walkMeshes||[]).filter(Boolean); for(const m of wm){ try{ m.updateWorldMatrix(true,false); }catch(e){} }   /* LAWWW2-C 11-05：可點面不一定掛在 z.group 底下，要各自更新 matrixWorld（遊戲每一幀都會更新）*/
  for(let lv=0;lv<L.length;lv++){ const n=L[lv]; if(!n||!n.surf) continue; let need=0, miss=0, worst=0, ex=null;
    const mine=wm.filter(m=>((m.userData&&m.userData.walkLv)|0)===lv);
    for(let cz=0;cz<n.rows;cz+=2) for(let cx=0;cx<n.cols;cx+=2){ if(n.blocked(cx,cz)) continue; const [x,zz]=n.toWorld(cx,cz); const h=n.heightAt(x,zz); if(Math.abs(h-n.y0)<=0.15) continue; need++;
      let ok=false; if(mine.length){ const r=new THREE.Raycaster(new THREE.Vector3(x,h+3,zz),new THREE.Vector3(0,-1,0)); const hit=r.intersectObjects(mine,false).find(q=>Math.abs(q.point.y-h)<=0.12); ok=!!hit; }
      if(!ok){ miss++; const d=Math.abs(h-n.y0); if(d>worst){ worst=d; ex=[+x.toFixed(1),+zz.toFixed(1),+h.toFixed(2)]; } } }
    if(need) rows.push([id,'lv'+lv,`有高度的格 ${need}，沒接住 ${miss}（${(100*miss/need).toFixed(0)}%），最大高差 ${worst.toFixed(2)} m${ex?' 例 '+JSON.stringify(ex):''}；walkMeshes ${mine.length}`, miss]);
  }
}
for(const r of rows) console.log0((r[3]?'MISS ':'ok   ')+r.slice(0,3).join('｜'));
