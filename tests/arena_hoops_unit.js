// 3F 主球場的籃架（ART-ARENA-HOOPS-1105，LAWWW2-B 2026-11-07；使用者 11-05 07:1x「主球場一群人跑來跑去 連籃框都沒有 還有人穿裙子打籃球??」）——不需要瀏覽器，讀 gym_arena.glb。
// 以前的籃架「收在上面」：籃板吊在 17.6～18.65 m（大螢幕上方）、沒有籃框——從場上看就是沒有籃框。改成屋頂吊下來、放下來的樣子：
//   1. gym_arena.glb 有 SET_HOOPS 群組（不和別的材質合併：遊戲可以整組開關）；
//   2. 兩個籃框（gym_layout.js arena.court.hoops）：圈的上緣 3.05 m、圈的中心對準 hoops 的座標（±2 cm）、內徑約 45 cm；
//   3. 籃板 1.80×1.05 m、下緣 2.90 m、板面離籃框中心 37.5 cm（往端線那一側）；板面上有白線；
//   4. 籃網掛在圈下面（最低不低於 2.55 m）；吊桿一路到屋頂（20.5 m 以上）；
//   5. 地上沒有東西（籃架最低的地方 2.55 m 以上：導航不用改）；
//   6. 舊的「收在上面」的籃板拿掉了（17.5～18.7 m、板子的位置沒有玻璃）；
//   7. 遊戲端：典禮那天（舞台在北端）收起 SET_HOOPS；打球的路人回到籃框半場（CROWD.ARENA_HOOPS 預設 true）。
// 修改前（開發分支 c244ce20e）：1～6 FAIL（沒有 SET_HOOPS；17.6 m 的籃板還在）、7 FAIL。用法：node tests/arena_hoops_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const L=require(path.join(ROOT,'src/data/gym_layout.js')), A=L.arena, HOOPS=A.court.hoops;
const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gym_arena.glb'));
const jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8')), bin0=20+jl+8;
const nodes=J.nodes||[], mats=J.materials||[];
// 節點的世界矩陣（translation／rotation／scale；沒有 matrix）
const par={}; nodes.forEach((n,i)=>(n.children||[]).forEach(c=>par[c]=i));
const qrot=(q,v)=>{ const [x,y,z,w]=q, ix=w*v[0]+y*v[2]-z*v[1], iy=w*v[1]+z*v[0]-x*v[2], iz=w*v[2]+x*v[1]-y*v[0], iw=-x*v[0]-y*v[1]-z*v[2];
  return [ix*w+iw*-x+iy*-z-iz*-y, iy*w+iw*-y+iz*-x-ix*-z, iz*w+iw*-z+ix*-y-iy*-x]; };
const toWorld=(ni,p)=>{ let v=p.slice(); for(let i=ni;i!=null;i=par[i]){ const n=nodes[i]; if(n.matrix) throw new Error('matrix node'); const s=n.scale||[1,1,1]; v=[v[0]*s[0],v[1]*s[1],v[2]*s[2]]; if(n.rotation) v=qrot(n.rotation,v); const t=n.translation||[0,0,0]; v=[v[0]+t[0],v[1]+t[1],v[2]+t[2]]; } return v; };
const acc=ai=>{ const a=J.accessors[ai], v=J.bufferViews[a.bufferView], off=bin0+(v.byteOffset||0)+(a.byteOffset||0), st=v.byteStride||12, out=[]; for(let i=0;i<a.count;i++) out.push([buf.readFloatLE(off+i*st),buf.readFloatLE(off+i*st+4),buf.readFloatLE(off+i*st+8)]); return out; };
const vertsOf=re=>{ const out=[]; nodes.forEach((n,i)=>{ if(n.mesh==null||!re.test(n.name||'')) return; for(const p of J.meshes[n.mesh].primitives) for(const q of acc(p.attributes.POSITION)) out.push(toWorld(i,q)); }); return out; };
const near=(V,hx,hz,r)=>V.filter(p=>Math.abs(p[0]-hx)<r&&Math.abs(p[2]-hz)<r);
const mm=(V,k)=>V.length?[Math.min(...V.map(p=>p[k])),Math.max(...V.map(p=>p[k]))]:[NaN,NaN];
// 1. 群組
const hg=nodes.findIndex(n=>n.name==='SET_HOOPS'), kids=hg>=0?(nodes[hg].children||[]).map(c=>nodes[c].name):[];
check('1. gym_arena.glb 有 SET_HOOPS 群組（籃板、籃框、籃網、白線、護墊、吊架）', hg>=0&&['glass','rim','net','line','pad','mast'].every(k=>kids.some(n=>new RegExp('^SET_HOOPS_'+k).test(n))), kids.join('、'));
const RIM=vertsOf(/^SET_HOOPS_rim/), GLS=vertsOf(/^SET_HOOPS_glass/), NET=vertsOf(/^SET_HOOPS_net/), LN=vertsOf(/^SET_HOOPS_line/), ALL=vertsOf(/^SET_HOOPS_/);
for(const [hx,hz] of HOOPS){ const s=hz<0?1:-1, tag='（'+hx+', '+hz+'）';
  // 2. 籃框：圈（板面上的固定板、頸部不算：離圈中心 0.2 m 以上、0.26 m 以內）
  const ring=RIM.filter(p=>{ const d=Math.hypot(p[0]-hx,p[2]-hz); return d>0.2&&d<0.26; }), y=mm(ring,1);
  const cx=ring.reduce((a,p)=>a+p[0],0)/(ring.length||1), cz=ring.reduce((a,p)=>a+p[2],0)/(ring.length||1), rIn=Math.min(...ring.map(p=>Math.hypot(p[0]-hx,p[2]-hz)));
  check('2. 籃框'+tag+'：圈的上緣 3.05 m、中心對準、內徑約 45 cm', ring.length>40&&Math.abs(y[1]-3.05)<0.006&&y[0]>3.02&&Math.hypot(cx-hx,cz-hz)<0.02&&Math.abs(rIn*2-0.45)<0.02, '上緣 '+y[1].toFixed(3)+'、下緣 '+y[0].toFixed(3)+'、中心偏 '+Math.hypot(cx-hx,cz-hz).toFixed(3)+'、內徑 '+(rIn*2).toFixed(3));
  // 3. 籃板
  const g=near(GLS,hx,hz,1.2), gx=mm(g,0), gy=mm(g,1), gz=mm(g,2), face=s>0?gz[1]:gz[0];
  check('3. 籃板'+tag+'：1.80×1.05 m、下緣 2.90 m、板面離籃框中心 37.5 cm（端線那一側）', Math.abs(gx[1]-gx[0]-1.8)<0.01&&Math.abs(gy[0]-2.90)<0.005&&Math.abs(gy[1]-3.95)<0.005&&Math.abs((hz-face)*s-0.375)<0.01,
    '寬 '+(gx[1]-gx[0]).toFixed(3)+'、'+gy[0].toFixed(3)+'～'+gy[1].toFixed(3)+'、板面 '+face.toFixed(3));
  const l=near(LN,hx,hz,1.2); check('3. 籃板'+tag+'：白線（外框、籃框上面的小方框）在板面前面', l.length>=32&&l.every(p=>(p[2]-face)*s>0.0005&&(p[2]-face)*s<0.01), l.length+' 個頂點');
  // 4. 籃網、吊桿
  const n=near(NET,hx,hz,0.4), ny=mm(n,1); check('4. 籃網'+tag+'：掛在圈下面（最低 2.55 m 以上）', n.length>0&&ny[0]>=2.55&&ny[1]<=3.05, ny.map(v=>v.toFixed(2)).join('～'));
  const m=vertsOf(/^SET_HOOPS_mast/).filter(p=>Math.abs(p[0]-hx)<0.6&&Math.abs(p[2]-(hz-s*1.475))<0.1); check('4. 吊桿'+tag+'：從籃板後面一路到屋頂（20.5 m 以上）', m.length>0&&mm(m,1)[1]>20.5&&mm(m,1)[0]<3.1, mm(m,1).map(v=>v.toFixed(2)).join('～'));
  // 6. 舊的籃板
  const old=vertsOf(/glass/).filter(p=>p[1]>17.5&&p[1]<18.7&&Math.abs(p[0]-hx)<1&&Math.abs(p[2]-(hz-s*0.375))<0.1);
  check('6. 舊的「收在上面」的籃板'+tag+'拿掉了（17.5～18.7 m 沒有玻璃）', old.length===0, old.length+' 個頂點'); }
check('5. 地上沒有東西：籃架最低 2.55 m 以上（導航不用改）', ALL.length>0&&mm(ALL,1)[0]>=2.55, ALL.length?mm(ALL,1)[0].toFixed(3)+' m':'沒有 SET_HOOPS');
// 7. 遊戲端
const g3=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8'), cr=fs.readFileSync(path.join(ROOT,'src/crowd3d.js'),'utf8');
check('7. gym3d.js：典禮那天收起 SET_HOOPS（其他日子打開）', /getObjectByName\('SET_HOOPS'\)[^;]*;\s*if\(hp\)\s*hp\.visible=!z\.ceremonyOn/.test(g3));
check('7. crowd3d.js：籃架接上，CROWD.ARENA_HOOPS 預設 true（打球的人回到籃框半場）', /S\.ARENA_HOOPS=S\.ARENA_HOOPS!==false/.test(cr));
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
