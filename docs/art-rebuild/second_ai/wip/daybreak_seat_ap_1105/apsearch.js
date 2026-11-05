const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]), ZID=process.argv[3];
const src=fs.readFileSync('/tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad/seatscan_node.js','utf8');
const head=src.split('const E=E3;')[0].replace("const ROOT=path.resolve(process.argv[2]||'.'), ONLY=(process.argv[3]||'').split(',').filter(Boolean);","");
eval(head);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const G={day:20,weekday:3,hour:14,flags:{},social:{},zone:ZID}; if(typeof GAME!=='undefined') GAME.G=G;
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES[ZID].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
const n=E.nav, stand=(x,zz)=>n.clear?n.clear(x,zz,0.3):n.free(x,zz);
const sp=z.spawn; const [sc,sr]=n.toCell(sp.x,sp.z); const seen=new Uint8Array(n.cols*n.rows), q=[[sc,sr]]; seen[n.idx(sc,sr)]=1;
while(q.length){ const [c,r]=q.shift(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nc=c+dc, nr=r+dr; if(nc<0||nr<0||nc>=n.cols||nr>=n.rows) continue; const i=n.idx(nc,nr); if(seen[i]||n.blocked(nc,nr)) continue; seen[i]=1; q.push([nc,nr]); } }
const reachable=(x,zz)=>{ const [c,r]=n.toCell(x,zz); return c>=0&&r>=0&&c<n.cols&&r<n.rows&&seen[n.idx(c,r)]; };
const want=process.argv.slice(4).map(s=>s.split(',').map(Number));
for(const it of E.interactables.filter(q=>q&&q.seat)){ const st=it.seat; if(want.length&&!want.some(([x,zz])=>Math.abs(st.x-x)<0.01&&Math.abs(st.z-zz)<0.01)) continue;
  const reach=(+process.env.R||it.radius||1.8)-0.05; let best=null;
  for(let dx=-1.8;dx<=1.8;dx+=0.05) for(let dz=-1.8;dz<=1.8;dz+=0.05){ const x=st.x+dx, zz=st.z+dz; if(!stand(x,zz)||!reachable(x,zz)) continue; const d=Math.hypot(x-it.x,zz-it.z), m=reach-d; if(process.env.LOS){ let ok=true; const L=Math.hypot(st.x-x,st.z-zz); for(let t=0;t<=L-0.35;t+=0.05){ const px=x+(st.x-x)*t/L, pz=zz+(st.z-zz)*t/L; const [c,r]=n.toCell(px,pz); if(n.blocked(c,r)){ ok=false; break; } } if(!ok) continue; } if(m<(+process.env.MINM||0.15)) continue;
    let cl=0.3; while(cl<0.8&&(n.clear?n.clear(x,zz,cl+0.05):true)) cl+=0.05; const score=process.env.LOS?(-d+Math.min(cl,0.5)*0.6):(process.env.MINM?(-d+cl*0.2):(Math.min(m,0.4)+cl*0.5)); if(!best||score>best.s) best={x:+x.toFixed(2),z:+zz.toFixed(2),d:+d.toFixed(2),m:+m.toFixed(2),cl:+cl.toFixed(2),s:score}; }
  console.log(`${it.label} seat(${st.x},${st.z}) it(${it.x.toFixed(2)},${it.z.toFixed(2)}) r ${it.radius} →`, best?JSON.stringify(best):'NONE'); }
