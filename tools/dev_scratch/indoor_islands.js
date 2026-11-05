/* 室內區域的小孤島總掃（ISLAND-SWEEP-1105，LAWWW2-C 11-05）——不需要瀏覽器：照 index.html 載入到 game3d.js 以前的區域檔，建出每一個 indoor 區域，
   每 0.1 m 一點、人物半徑 0.32 m 站得住（nav.clear）的點，從出生點（z.spawn）四方向連通（多樓層：同一個位置高度差 ≤ 0.3 m 可以換層）；
   連不到的點分群印出來：位置、點數、離最近能走到的點多遠（gap）、範圍裡有沒有互動點。
   gap ≤ 0.45 m 要注意：引擎移動只檢查目的地（stepEntity），跑步＋低幀率一步約 0.4 m，跳得進去（v9.3 #31）；更遠的通常是封起來的房間（走不進去，不影響）。
   用法：node tools/dev_scratch/indoor_islands.js <repo 根目錄> [區域 id 的正規式] */
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=process.argv[2];
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); console.warn=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]); const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; if(/game3d\.js$/.test(f)) break; files.push(f); }
for(const f of ['src/data/gym_layout.js','src/gym3d.js','src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/wzshops3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){} }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const only=process.argv[3]?new RegExp(process.argv[3]):null; const res=[];
for(const id of Object.keys(Z3.ZONES)){ const def=Z3.ZONES[id]; if(!def.indoor) continue; if(only&&!only.test(id)) continue; let z;
  try{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; z=def.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; }catch(e){ res.push(id+' BUILD_ERR '+e.message.slice(0,60)); continue; }
  const navs=z.levels||[z.nav]; if(!navs[0]) continue; const n0=navs[0]; const x0=n0.ox, z0=n0.oz, x1=n0.ox+n0.w, z1=n0.oz+n0.h, st=0.1;
  const sp=z.spawn||{x:0,z:0}; const spLv=sp.lv|0;
  const key=(l,x,zz)=>l+':'+(Math.round(x*10)||0)+','+(Math.round(zz*10)||0); const set=new Map();
  navs.forEach((n,l)=>{ n._cm=null; for(let x=Math.ceil(x0/st)*st;x<=x1;x+=st) for(let zz=Math.ceil(z0/st)*st;zz<=z1;zz+=st){ if(n.clear(x,zz,0.32)) set.set(key(l,x,zz),[l,+x.toFixed(1),+zz.toFixed(1)]); } });
  if(!set.size){ res.push(id+' NO_STANDABLE'); continue; }
  // start: nearest standable to spawn on spawn level
  let start=null, bd=1e9; for(const p of set.values()){ if(p[0]!==spLv) continue; const d=Math.hypot(p[1]-sp.x,p[2]-sp.z); if(d<bd){ bd=d; start=p; } }
  const seen=new Set([key(...start)]), q=[start];
  while(q.length){ const [l,x,zz]=q.pop(); const nb=[[l,x+st,zz],[l,x-st,zz],[l,x,zz+st],[l,x,zz-st]]; for(let o=0;o<navs.length;o++) if(o!==l) nb.push([o,x,zz]);
    for(const [a,b,c] of nb){ const k=key(a,b,c); if(set.has(k)&&!seen.has(k)){ if(a!==l){ const ha=navs[a].heightAt(b,c), hl=navs[l].heightAt(x,zz); if(Math.abs(ha-hl)>0.3) continue; } seen.add(k); q.push(set.get(k)); } } }
  const isl=[...set.values()].filter(p=>!seen.has(key(...p)));
  if(isl.length){ // cluster
    const ks=new Set(isl.map(p=>key(...p))), done=new Set(), cl=[]; for(const p of isl){ const k0=key(...p); if(done.has(k0)) continue; const c=[p], qq=[p]; done.add(k0); while(qq.length){ const [l,x,zz]=qq.pop(); for(const [a,b,cc] of [[l,x+st,zz],[l,x-st,zz],[l,x,zz+st],[l,x,zz-st]]){ const k=key(a,b,cc); if(ks.has(k)&&!done.has(k)){ done.add(k); const pp=set.get(k); c.push(pp); qq.push(pp); } } } cl.push(c); }
    const its=E.interactables.map(it=>({it,lv:it.lv|0})); const near=c=>{ const hits=[]; for(const {it,lv} of its){ if(c.some(p=>p[0]===lv&&Math.hypot(p[1]-it.x,p[2]-it.z)<=(it.radius||1)+0.05)) hits.push((it.label||'?').slice(0,10)); } return [...new Set(hits)].slice(0,4).join('/'); };
    const reachPts=[...seen].map(k=>set.get(k)); const gap=c=>{ let best=1e9; for(const p of c){ for(const r of reachPts){ if(r[0]!==p[0]) continue; const d=Math.hypot(r[1]-p[1],r[2]-p[2]); if(d<best) best=d; } } return best; };
    res.push(id+' GAPS '+cl.sort((a,b)=>b.length-a.length).slice(0,8).map(c=>'L'+c[0][0]+'('+(c.reduce((s,p)=>s+p[1],0)/c.length).toFixed(1)+','+(c.reduce((s,p)=>s+p[2],0)/c.length).toFixed(1)+')×'+c.length+' gap '+gap(c).toFixed(2)).join(' '));
    res.push(id+' spawn('+sp.x+','+sp.z+',lv'+spLv+')'+(bd>0.5?' SPAWN_FAR '+bd.toFixed(2):'')+' reach '+seen.size+' | '+cl.sort((a,b)=>b.length-a.length).slice(0,4).map(c=>'['+near(c)+']').join(' '));
    res.push(id+' ISLANDS '+cl.length+' pts '+isl.length+' | '+cl.sort((a,b)=>b.length-a.length).slice(0,6).map(c=>`L${c[0][0]}(${(c.reduce((s,p)=>s+p[1],0)/c.length).toFixed(1)},${(c.reduce((s,p)=>s+p[2],0)/c.length).toFixed(1)})×${c.length}`).join(' ')); }
  else res.push(id+' ok '+set.size);
}
console.log(res.join('\n'));
