// 公館燒臘室內換成 BB 的燒臘店 v7（SHAOLA-WIRE-1105，LAWWW2-C 11-05；使用者 06:4x「公館燒臘線上版本怎麼還是麵店」）——不需要瀏覽器（D131）。
// 建出遊戲真正的 noodle 區域（zones3d.js buildShaola），用引擎真正的找路、移動（E.simWalk、E.canStand、E.nearestInteractable）檢查：
//   ① index.html 在 zones3d／story3d／crowd3d／hcircle3d 前面載入 src/data/shaola_layout.js；區域用燒臘店（6 × 13）、正式模型登錄 shaola_interior.glb、檔案在、是 v7（3,905,580 B）
//   ② 導航多擋的那幾塊（SHAOLA_EXTRA）＝GLB 根節點 extras.extraBlocks（BB 寫的）
//   ③ 公館店門的落點 (0, 3.4)（劇情 OUT.plan、快速前往也是這一點）、z.spawn 站得住；出口在門內、走得到、按得到，落點不在出口範圍裡
//   ④ 五張桌子的「坐下吃飯」（eat:'noodle'）走得到、按得到；noodleScene 走去的點 (x, z+0.5) 走得到；pairSeat＝同一張桌子對面
//   ⑤ 阿哲的位子（spots.zhe_seat）＝第 3 桌北邊、和那一桌「坐下吃飯」差 < 2.5 m（noodleScene 才會演阿哲那一段）；固定客人 4 個位子不在第 3 桌、都是 z.seats；從門口走得到每一個位子旁邊
//   ⑥ 老闆的站位（spots.clerk）不在家具裡；hcircle3d 的 CLERK.noodle 照配置
//   ⑦ 沒有小孤島（每 0.1 m 一點，站得住卻走不到）
//   ⑧ crowd3d 的客人坐的位子：不在第 3 桌、都在 z.seats 裡
// 修改前（開發分支 05ddf1e08）：① 就 FAIL（noodle 是舊的 10 × 9 麵店、沒有 shaola_layout.js）。用法：node tests/shaola_wire_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const r2=v=>+(+v).toFixed(2), J=x=>JSON.stringify(x);
const ih=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), pos=f=>ih.indexOf('src="'+f);
const lp=pos('src/data/shaola_layout.js');
check('① index.html 載入 src/data/shaola_layout.js、在 zones3d／story3d／crowd3d／hcircle3d 前面', lp>0&&['src/zones3d.js','src/story3d.js','src/crowd3d.js','src/hcircle3d.js'].every(f=>pos(f)<0||pos(f)>lp), 'shaola_layout '+lp);
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/shaola_layout.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of pre){ if(fs.existsSync(path.join(ROOT,f))) try{ run(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
global.GAME={G:{zone:'noodle',day:30,hour:18,flags:{},money:5000,weather:'clear',visited:{}}};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
const z=Z3.ZONES.noodle.build(E); E.zone=z; E.levels=null; E.nav=z.nav; E.nav._cm=null; const N=E.nav, its=E.interactables.slice();
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius();
const L=typeof SHAOLA_LAYOUT!=='undefined'?SHAOLA_LAYOUT.shop:null, man=ASSETS.manifest['bldg.shaola_interior'], gp=man&&path.join(ROOT,man.url);
{ const xs=[], zs2=[]; for(let x=-4;x<=4;x+=0.1) if(E.canStand(x,0,0.32,0)) xs.push(x); for(let zz=-8;zz<=8;zz+=0.1) if(E.canStand(0,zz,0.32,0)) zs2.push(zz);   /* 走得到的範圍：寬 6 m、深 13 m 扣掉牆內 0.4＋人的半徑 */
  const w=xs.length?xs[xs.length-1]-xs[0]:0, d=zs2.length?zs2[zs2.length-1]-zs2[0]:0;
  check('① 區域是燒臘店（6 × 13）、正式模型登錄 bldg.shaola_interior', !!L&&!!z.shaola&&d>10.5&&d<12.3&&!!man, `走道（x 0）站得住的長度 ${r2(d)} m（13 m 扣掉牆內 0.4＋半徑；舊麵店 6.4）、z 0 那一排寬 ${r2(w)} m`); }
const glb=gp&&fs.existsSync(gp)?fs.readFileSync(gp):null;
/* 11-12（AA_853 菜單）：只把檔裡的印刷圖集 sl_print 換成新菜單（幾何、兩組 UV 位元組不變，光照貼圖照用）→ 3,981,292 B；原本 3,989,208 B */
check('① GLB 檔案在、是 v7＋光照烘焙＋AA_853 菜單（3,981,292 B；LAWWW2-B 11-07 在 v7 上烘，bake_gg_new.sh shaola；11-12 只換菜單貼圖）', !!glb&&glb.length===3981292, glb?glb.length+' B':'沒有檔案 '+(man&&man.url));
if(!L||!z.shaola){ console.log('FAILED '+fails); process.exit(1); }
// ② 多擋的那幾塊＝GLB extras
{ const j=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString()), ex=(j.nodes.find(n=>n.extras&&n.extras.extraBlocks)||{}).extras, eb=ex?(typeof ex.extraBlocks==='string'?JSON.parse(ex.extraBlocks):ex.extraBlocks):[];
  const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), mine=eval(src.match(/const SHAOLA_EXTRA=(\[[\s\S]*?\]\]);/)[1]);
  const same=eb.length===mine.length&&eb.every((b,i)=>b.slice(0,4).every((v,k)=>Math.abs(v-mine[i][k])<1e-6));
  check('② 導航多擋的 SHAOLA_EXTRA＝GLB 根節點 extras.extraBlocks', same, `${mine.length}／${eb.length} 塊`);
  for(const b of eb){ const [x,zz]=b; if(E.canStand(x,zz,0.1,0)){ check('② '+b[4]+' 中心站不住',false,J(b.slice(0,4))); } } }
// ③ 進門、出口
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
const IN=[0,3.4], sp=z.spawn;
check('③ 公館店門的落點 (0, 3.4)、z.spawn 站得住', E.canStand(IN[0],IN[1],0.32,0)&&E.canStand(sp.x,sp.z,0.32,0), J(sp));
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, zz=it.z+dz; if(E.canStand(x,zz,0.32,0)) c.push([d,x,zz]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,zz] of c){ P.obj.position.set(x,0,zz); if(E.nearestInteractable&&E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,zz]).ok) continue; return [r2(x),r2(zz)]; } return null; }
const ex=its.find(it=>it.exit&&it.exit.to==='gongguan');
check('③ 出口「離開公館燒臘」走得到、按得到、回公館 (−63, 18)', !!ex&&!!touchable(ex,IN)&&ex.exit.spawn.x===-63&&ex.exit.spawn.z===18, ex&&J({x:ex.x,z:ex.z,r:ex.radius}));
check('③ 進門的落點不在出口範圍裡', !!ex&&Math.hypot(IN[0]-ex.x,IN[1]-ex.z)>ex.radius&&Math.hypot(sp.x-ex.x,sp.z-ex.z)>ex.radius);
// ④ 坐下吃飯
const eats=its.filter(it=>it.eat==='noodle'), bad4=[];
for(const it of eats){ const t=touchable(it,IN); if(!t) bad4.push(`(${it.x},${it.z}) 按不到`); const ap=[it.seat.x,it.seat.z+0.5]; if(!walk(IN,ap).ok&&!walk(IN,[ap[0],ap[1]-0.15]).ok) bad4.push(`(${it.x},${it.z}) 椅子後面走不到`);
  if(!(it.pairSeat&&Math.abs(it.pairSeat.x-it.seat.x)<0.01&&it.pairSeat.z<it.seat.z&&Math.abs(it.seat.yaw-Math.PI)<0.01&&Math.abs(it.pairSeat.yaw)<0.01)) bad4.push(`(${it.x},${it.z}) pairSeat 不對`); }
check('④ 五張桌子的「坐下吃飯」走得到、按得到，椅子後面走得到，pairSeat 是對面那一張', eats.length===5&&!bad4.length, `${eats.length} 個；`+bad4.join('、'));
// ⑤ 阿哲、固定客人
const S=z.spots||{}, zs=S.zhe_seat, t3=eats.find(it=>Math.abs(it.z-1.02)<0.05);
check('⑤ 阿哲的位子＝第 3 桌北邊 (−2.1, −0.22) 面向店門；和第 3 桌「坐下吃飯」差 < 2.5 m', !!zs&&Math.abs(zs.x+2.1)<0.01&&Math.abs(zs.z+0.22)<0.01&&zs.yaw===0&&!!t3&&Math.hypot(zs.x-t3.seat.x,zs.z-t3.seat.z)<2.5, J(zs));
const ns=S.ndlSeats||[], inSeats=q=>z.seats.some(s=>Math.abs(s.x-q[0])<0.01&&Math.abs(s.z-q[1])<0.01), tab=q=>(L.seats.find(s=>Math.abs(s.x-q[0])<0.01&&Math.abs(s.z-q[1])<0.01)||{}).table;
check('⑤ 固定客人 4 個位子：不在第 3 桌、都是 z.seats', ns.length===4&&ns.every(q=>inSeats(q)&&tab(q)!==3), ns.map(q=>`第${tab(q)}桌(${q[0]},${q[1]})`).join(' '));
{ const bad=[]; const dr=S.door||[0,3.6]; if(!E.canStand(dr[0],dr[1],0.32,0)) bad.push('門口點站不住'); for(const q of ns.concat(zs?[[zs.x,zs.z]]:[])){ const near=[[q[0]+0.8,q[1]],[q[0]+0.75,q[1]+0.3],[q[0]+0.75,q[1]-0.3],[q[0],q[1]+(q[1]>0?0.3:-0.3)]].find(p=>E.canStand(p[0],p[1],0.32,0)&&walk(dr,p).ok); if(!near) bad.push(`(${q[0]},${q[1]}) 旁邊走不到`); }
  check('⑤ 從門口（spots.door）走得到固定客人、阿哲每一個位子旁邊', !bad.length, bad.join('、')); }
// ⑥ 老闆
const ck=S.clerk; check('⑥ 老闆的站位（砧板檯後面）不在家具裡', !!ck&&E.canStand(ck.x,ck.z,0.2,0), J(ck));
// ⑦ 小孤島
{ const big=new Set(), key=(x,zz)=>Math.round(x*10)+','+Math.round(zz*10), q=[[IN[0],IN[1]]]; big.add(key(IN[0],IN[1]));
  while(q.length){ const [x,zz]=q.shift(); for(const [dx,dz] of [[0.1,0],[-0.1,0],[0,0.1],[0,-0.1]]){ const nx=r2(x+dx), nz=r2(zz+dz), k=key(nx,nz); if(big.has(k)||!E.canStand(nx,nz,0.32,0)) continue; big.add(k); q.push([nx,nz]); } }
  const lone=[]; for(let x=-3;x<=3;x=r2(x+0.1)) for(let zz=-6.5;zz<=6.5;zz=r2(zz+0.1)) if(E.canStand(x,zz,0.32,0)&&!big.has(key(x,zz))) lone.push(`(${x},${zz})`);
  check('⑦ 沒有小孤島（每 0.1 m 一點：站得住的都連得到門口）', !lone.length, `走得到 ${big.size} 點，孤島 ${lone.length} 點 `+lone.slice(0,6).join(' ')); }
// ⑥ hcircle、⑧ crowd（照 index.html 的順序：配置先載入）
for(const f of ['src/hcircle3d.js','src/crowd3d.js']){ try{ run(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
check('⑥ hcircle3d 的 CLERK.noodle 照配置的老闆站位', typeof HCIRCLE!=='undefined'&&!!HCIRCLE.CLERK&&!!ck&&HCIRCLE.CLERK.noodle.x===ck.x&&HCIRCLE.CLERK.noodle.z===ck.z, typeof HCIRCLE!=='undefined'&&HCIRCLE.CLERK?J(HCIRCLE.CLERK.noodle):'沒有 HCIRCLE');
{ const defs=typeof CROWD!=='undefined'&&CROWD.shopDefs?CROWD.shopDefs():[], d=defs.find(x=>x.zone==='noodle'), seats=d?[].concat(...d.units.map(u=>u.seats||[])):[];
  check('⑧ crowd3d 燒臘店的客人：8 個位子、不在第 3 桌、都在 z.seats', !!d&&seats.length===8&&seats.every(s=>inSeats([s.x,s.z])&&tab([s.x,s.z])!==3), d?seats.map(s=>`${s.x},${s.z}`).join(' '):'沒有 noodle'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
