// 坐下時位子有人（使用者 2026-10-16：選坐下直接坐到別人身上）：長椅坐另一半、單人椅有人不坐；椰林大道南側 x=25 的長椅移開椰子樹
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+(info||''))); if(!ok) fails++; };
const m=src.match(/  function freeSeat\(st\)\{[\s\S]*?return null; \}\n/); check('找得到 freeSeat',!!m);
if(m){ const E={npcs:[]}; const freeSeat=new Function('E','return ('+m[0].trim().replace(/^function freeSeat/,'function')+')')(E);
  const bench={x:10,z:5,yaw:0,label:'坐在長椅'}, chair={x:2,z:2,yaw:0};
  check('沒人：坐原本的位子',freeSeat(bench)===bench&&freeSeat(chair)===chair);
  E.npcs.push({seat:{x:10,z:5}}); const q=freeSeat(bench); check('長椅中間有人：坐另一半（離中間 0.45 m、同一張椅子）',q&&q!==bench&&Math.abs(Math.hypot(q.x-10,q.z-5)-0.45)<1e-6&&q.label===bench.label,JSON.stringify(q));
  E.npcs.push({seat:{x:q.x,z:q.z}}); const q2=freeSeat(bench); check('一半也有人：坐另一邊',q2&&Math.abs(q2.x-q.x)>0.8,JSON.stringify(q2));
  E.npcs.push({seat:{x:q2.x,z:q2.z}}); check('三個位置都有人：不坐（長椅坐滿了）',freeSeat(bench)===null);
  E.npcs.push({seatTarget:{x:2,z:2}}); check('單人椅有人正要坐：不坐（有人坐了）',freeSeat(chair)===null); }
check('座位選單先檢查 freeSeat（坐滿了就提示、不走過去）',/const fs=freeSeat\(it\.seat\); if\(!fs\)\{ toast\(/.test(src));
const z=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'); check('椰林大道南側 x=25 的長椅移到 x=17（離小椰林道椰子樹）',/const x=\(x0===25&&s<0\)\?17:x0;/.test(z));
{ const vm=require('vm'); global.window=global; vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/wz_park_layout.js'),'utf8').replace(/^const WZ_PARK_LAYOUT\s*=/m,'global.WZ_PARK_LAYOUT='));
  const L=global.WZ_PARK_LAYOUT; const benches=L.items.filter(i=>i.kind==='bench'); const bad=[];
  for(const st of L.seats.filter(q=>/長椅/.test(q.label))){ const b=benches.reduce((a,q)=>!a||Math.hypot(q.x-st.x,q.z-st.z)<Math.hypot(a.x-st.x,a.z-st.z)?q:a,null); const fwd=(st.x-b.x)*Math.sin(st.yaw)+(st.z-b.z)*Math.cos(st.yaw), side=Math.abs((st.x-b.x)*Math.cos(st.yaw)-(st.z-b.z)*Math.sin(st.yaw)); if(fwd<0||fwd>0.12||side>0.5) bad.push([st.label,st.x,st.z,+fwd.toFixed(2)]); }
  check('溫州街小公園：長椅的座位點在椅子中心往前 0～0.12 m（原本 0.35 m，人坐在椅子前面的空中；使用者 2026-10-16 陳語彤）',!bad.length,JSON.stringify(bad));
  const rb=L.items.find(i=>i.kind==='ring_bench'); const rr=L.seats.filter(q=>/圓椅/.test(q.label)).map(q=>Math.hypot(q.x-rb.x,q.z-rb.z)); check('老樹下的圓椅：座位點在座面上（半徑 1.07～1.45）',rr.every(r=>r>=1.07&&r<=1.45),JSON.stringify(rr)); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
