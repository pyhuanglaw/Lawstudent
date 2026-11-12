// 118 巷新室內：五湖四海（home，水餃店）、大學食堂（cafe2，秤重自助餐）——L118-SHOPS-REDO-1111（USER_WANTS X338；LAWWW 的 Blender 子代理臨時代 LAWWW2 做，2026-11-11）
// 模型＋配置：tools/blender/env_second/l118_int_home.py、l118_int_cafe2.py → assets/models/env/second_ai/l118_<id>.glb／.layout.json → src/data/l118_shop_layouts.js
// 測什麼（不需要瀏覽器；這是模擬，不是真實玩家流程，D131）：
//   1. 配置：name／type 照舊是原本那間店的（街上招牌換字用的對照，zones3d.js ud118；街景模型換新招牌以前不能改）、按鈕的字是新店名；室內寬深、門的位置、118 巷門口（street）維持原值；
//   2. 座位數、每間至少一張坐得下四個人的四人桌（table 欄同一個值）；長條座位（離走道超過 0.7 m）寫了 r 和 ap；
//   3. 店員、點餐在界內，點餐在櫃台前面；「看東西」只有一個：AA_772 look_lines 那一句（舊的電視、湯、書架拿掉了）；
//   4. 天花板：只有朝下的單面（GLB 的天花板材質不是雙面、法線朝下；配置寫了 single_sided）；吊著的東西沒有低於 2.5 m 的燈；
//   5. GLB 大小在舊的 1.5 倍以內、三角形 6 萬以內；
//   6. 在 Node 建出遊戲真正的區域：每一張椅子都有站得住、從門口找得到路、在「坐下」範圍裡的走近點；
//   7. 站得到的每一個點都走得回「離開」的範圍（引擎真正的找路＋移動碰撞 E.simWalk；BUG-XIANGUO-TRAP-1111 的教訓）。
// 用法：node tests/l118_int_home_cafe2_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=id=>JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/l118_'+id+'.layout.json'),'utf8'));
const WANT={ home:{ name:'五湖四海', type:'水餃店', oldName:'巷口家常菜', oldType:'家常菜', W:7.6, D:8.5, doorX:-2.6, street:{x:-4.3,z:-2.0}, seats:20, look:['dumpling_pot','（老闆娘數都不數，一把下去剛好十顆。）'], old:1514648 },
  cafe2:{ name:'大學食堂', type:'秤重自助餐', oldName:'慢讀咖啡', oldType:'咖啡', W:6.6, D:9.0, doorX:2.2, street:{x:-4.3,z:-12.5}, seats:14, look:['scale','（秤旁邊貼著一張紙：「飯也算重量喔」。）'], old:1525788 } };
const near=(a,b)=>Math.abs(a-b)<1e-6;
function glb(id){ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/l118_'+id+'.glb')); const n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), bin=b.slice(20+n+8); return {j,bin,bytes:b.length}; }
function acc(g,i){ const a=g.j.accessors[i], v=g.j.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0), st=v.byteStride||n*4, out=[]; for(let k=0;k<a.count;k++){ const r=[]; for(let c=0;c<n;c++) r.push(g.bin.readFloatLE(off+k*st+c*4)); out.push(r); } return out; }
for(const id of Object.keys(WANT)){ const L=J(id), W=WANT[id], B=L.bounds, inB=q=>q&&q.x>B.x0&&q.x<B.x1&&q.z>B.z0&&q.z<B.z1;
  // 1
  /* 2026-11-11 LAWWW 合併時改：配置的 name／type 也寫新店名（和 LAWWW2 的四間、另外三間一致；新街景不再留 SIGN_FACE，不需要用舊店名對招牌）。舊期望：name／type 是 oldName／oldType */
  check(id+' 1. 配置的 name／type 是新店名（'+W.name+'／'+W.type+'，不是 '+W.oldName+'）；按鈕的字也是（點餐（'+W.name+'）、離開'+W.name+'）', L.name===W.name&&L.type===W.type&&!L.name_note&&L.order.label==='點餐（'+W.name+'）'&&L.exits[0].label==='離開'+W.name, L.name+'／'+L.type+'／'+L.order.label+'／'+L.exits[0].label);
  check(id+' 1. 室內寬深、門的位置、118 巷門口維持原值', near(B.x1-B.x0,W.W)&&near(B.z1-B.z0,W.D)&&near(L.door.x,W.doorX)&&near(L.door.z,B.z1)&&near(L.street.door.x,W.street.x)&&near(L.street.door.z,W.street.z)&&L.street.side==='W'&&near(L.street.spawn_out.z,W.street.z+1.7),
    JSON.stringify([B.x1-B.x0,B.z1-B.z0,L.door.x,L.street.door]));
  // 2
  const byT={}; for(const s of L.seats){ const k=s.table.join(','); (byT[k]=byT[k]||[]).push(s); }
  const four=Object.values(byT).filter(a=>a.length>=4);
  check(id+' 2. 座位 '+W.seats+' 個、都在界內；至少一張四人桌（同一個 table 四個位子，離桌子中心 1.1 m 內）', L.seats.length===W.seats&&L.seats.every(inB)&&four.length>=1&&four.every(a=>a.every(s=>Math.hypot(s.x-s.table[0],s.z-s.table[1])<1.1)), L.seats.length+' 個；四人桌 '+four.length+' 張');
  const far=L.seats.filter(s=>s.r&&s.r>0.7);
  check(id+' 2. 靠牆離走道遠的座位（r＞0.7）都有 ap，ap 在 r 的範圍裡', far.every(s=>s.ap&&Math.hypot(s.ap[0]-(s.i?s.i[0]:s.x),s.ap[1]-(s.i?s.i[1]:s.z))<=s.r-0.05), far.length+' 個');   /* L118-IT-REACH-1111 收尾（11-12）：配置寫了按鈕位置 i 的，半徑從按鈕量（不是從椅子）*/
  // 3
  const C=L.counter, o=L.order;
  check(id+' 3. 店員、點餐在界內；點餐在櫃台前面（櫃台的南邊 1.2 m 內）；店員在櫃台後面', inB(L.clerk)&&inB(o)&&o.z>C.z1&&o.z-C.z1<1.2&&o.x>=C.x0-0.2&&o.x<=C.x1+0.2&&L.clerk.z<C.z0, JSON.stringify([L.clerk,o,C]));
  check(id+' 3. 「看東西」只有 AA_772 look_lines 那一句（'+W.look[0]+'）；舊的 tv／soup／books 拿掉了', L.interact.length===1&&L.interact[0].id===W.look[0]&&L.interact[0].note===W.look[1]&&inB(L.interact[0]), JSON.stringify(L.interact.map(q=>[q.id,q.note])));
  // 4、5
  const g=glb(id), cm=g.j.materials.findIndex(m=>m.name==='l118_'+id+'_ceiling'), cn=g.j.nodes.find(n=>n.name==='l118_'+id+'_ceiling');
  let down=false, top=0; if(cn&&cn.mesh!=null){ const p=g.j.meshes[cn.mesh].primitives[0], N=acc(g,p.attributes.NORMAL), P=acc(g,p.attributes.POSITION); down=N.every(n=>n[1]<-0.99); top=Math.max(...P.map(v=>v[1])); }
  check(id+' 4. 天花板只有朝下的單面（材質不是雙面、法線全部朝下、一片在 3.2 m）；配置寫了 ceiling.single_sided', cm>=0&&!g.j.materials[cm].doubleSided&&down&&near(Math.round(top*100)/100,3.2)&&L.ceiling&&L.ceiling.single_sided===true, JSON.stringify({cm,down,top}));
  { let low=1e9; for(const n of g.j.nodes){ if(n.mesh==null) continue; for(const p of g.j.meshes[n.mesh].primitives){ const m=g.j.materials[p.material]; if(!m||!/^GLOW_.*(tube|warm)/.test(m.name)||/^WALL_/.test(n.name)) continue; const P=acc(g,p.attributes.POSITION);
        const ys=P.map(v=>v[1]).filter(y=>y>1.7); if(ys.length) low=Math.min(low,Math.min(...ys)); } }
    check(id+' 4. 吊在天花板的燈（1.7 m 以上、不跟牆淡出的發光零件）都在 2.5 m 以上', low>=2.5, 'min y '+(low===1e9?'（沒有）':low.toFixed(2))); }
  const side=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/l118_'+id+'.json'),'utf8'));
  check(id+' 5. GLB 在舊的 1.5 倍以內（舊 '+W.old+'）、三角形 6 萬以內', g.bytes<=W.old*1.5&&side.tris_total<=60000, g.bytes+' bytes（'+(g.bytes/W.old).toFixed(2)+' 倍）、'+side.tris_total+' 三角形');
  check(id+' 5. 匯出時的導航檢查沒有問題（含 notrap）', L.navcheck&&Array.isArray(L.navcheck.problems)&&L.navcheck.problems.length===0&&!!L.navcheck.notrap, JSON.stringify(L.navcheck&&L.navcheck.problems)); }
// 6、7：遊戲真正的區域
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|L118_SHOP_LAYOUTS|L118S|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const STEP=0.25, R=0.32;
for(const id of Object.keys(WANT)){ const z=loadZone('l118_'+id), nav=z.nav, sp=z.spawn, ex=E.interactables.find(i=>i.exit), LJ=L118_SHOP_LAYOUTS[id];
  check(id+' 6. src/data/l118_shop_layouts.js 是新的配置（'+WANT[id].name+'、'+WANT[id].seats+' 個座位）', LJ.name===WANT[id].name&&LJ.order.label==='點餐（'+WANT[id].name+'）'&&LJ.seats.length===WANT[id].seats&&E.interactables.filter(i=>i.seat).length===WANT[id].seats);
  // 6. 每張椅子的走近點（GAME.seatApproach 的候選：ap、前、後、兩側…）：站得住、從進門的位置找得到路、在「坐下」的範圍裡
  { const bad=[]; for(const it of E.interactables.filter(i=>i.seat)){ const s=it.seat, fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0), reach=(it.radius||1.8)-0.05;
      const cand=[...(s.ap?[[s.ap[0]-s.x,s.ap[1]-s.z]]:[]),[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]];
      const ok=cand.some(([dx,dz])=>{ const x=s.x+dx, zz=s.z+dz; if(!E.canStand(x,zz,0.3,0)||Math.hypot(x-it.x,zz-it.z)>reach) return false;   /* 範圍從按鈕的位置量（和 game3d.js seatApproach 一樣）：2026-11-11 L118-IT-REACH-1111 五湖四海靠牆長椅的按鈕挪到走道上的站位，不在椅子上 */ const p=E.pathTo(sp.x,sp.z,0,x,zz,0); if(!p||!p.length) return false; const q=p[p.length-1]; return Math.hypot(q[0]-x,q[1]-zz)<=0.6; });
      if(!ok) bad.push([s.x,s.z]); }
    check(id+' 6. 每張椅子都有走近點：站得住、從門口找得到路、在「坐下」的範圍裡', !bad.length, JSON.stringify(bad)); }
  { const o=E.interactables.find(i=>i.shop118===id), lk=E.interactables.find(i=>i.look);
    const hit=q=>{ for(let a=-4;a<=4;a++) for(let b=-4;b<=4;b++){ const x=q.x+a*0.2, zz=q.z+b*0.2; if(Math.hypot(a*0.2,b*0.2)<q.radius-0.05&&E.canStand(x,zz,R,0)){ const p=E.pathTo(sp.x,sp.z,0,x,zz,0); if(p&&p.length&&Math.hypot(p[p.length-1][0]-x,p[p.length-1][1]-zz)<=0.6) return true; } } return false; };
    check(id+' 6. 點餐、「看」都走得到；「看」顯示的字是 AA_772 那一句；「點餐（'+WANT[id].name+'）」「離開'+WANT[id].name+'」', !!o&&!!lk&&hit(o)&&hit(lk)&&lk.look===WANT[id].look[1]&&o.label==='點餐（'+WANT[id].name+'）'&&!!ex&&ex.label==='離開'+WANT[id].name, JSON.stringify([o&&o.label,lk&&lk.look,ex&&ex.label])); }
  // 7. 站得到的每一個點都走得回「離開」（做法照 tests/tz_shops_notrap_1111_unit.js）
  const X0=nav.ox, Z0=nav.oz, Wd=nav.cols*nav.cell, Dp=nav.rows*nav.cell, key=(i,j)=>i+','+j;
  const ok=(i,j)=>{ const x=X0+i*STEP, zz=Z0+j*STEP; return x>X0&&zz>Z0&&x<X0+Wd&&zz<Z0+Dp&&E.canStand(x,zz,R,0); };
  const si=Math.round((sp.x-X0)/STEP), sj=Math.round((sp.z-Z0)/STEP); let start=null;
  for(let d=0;d<4&&!start;d++) for(let a=-d;a<=d&&!start;a++) for(let b=-d;b<=d&&!start;b++) if(ok(si+a,sj+b)) start=[si+a,sj+b];
  if(!start||!ex){ check(id+' 7. 進門的位置站得住、有「離開」',false,JSON.stringify([sp,ex&&ex.label])); continue; }
  const seen=new Set([key(...start)]), q=[start]; while(q.length){ const [i,j]=q.pop(); for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k=key(i+a,j+b); if(!seen.has(k)&&ok(i+a,j+b)){ seen.add(k); q.push([i+a,j+b]); } } }
  const pts=[...seen].map(k=>k.split(',').map(Number)).map(([i,j])=>[+(X0+i*STEP).toFixed(2),+(Z0+j*STEP).toFixed(2)]);
  /* 掃全部站得住的點（不只從門口連得到的）：有站得住卻不在「從門口連得到」那一組裡的＝被家具圍起來的小空地（坐下、站起來可能被放進去） */
  let iso=0; for(let i=0;i*STEP<Wd;i++) for(let j=0;j*STEP<Dp;j++) if(ok(i,j)&&!seen.has(key(i,j))) iso++;
  check(id+' 7. 沒有被家具圍起來、站得住卻和門口不相連的小空地', iso===0, iso+' 點');
  const bad=[]; for(const p of pts) for(const dt of [0.1,0.033]){ const r=E.simWalk(p[0],p[1],ex.x,ex.z,{lv0:0,lv1:0,dt,speed:1.45}); const end=r&&r.x!=null?[r.x,r.z]:(r&&r.ok?[ex.x,ex.z]:null);
    if(!end||Math.hypot(end[0]-ex.x,end[1]-ex.z)>ex.radius+1e-6){ bad.push([p[0],p[1],dt,end&&end.map(v=>+v.toFixed(2)),r&&r.reason]); break; } }
  check(id+' 7. 站得到的 '+pts.length+' 個點（每 '+STEP+' m）都走得回「'+ex.label+'」的半徑裡（走路、30 fps 和 10 fps）', pts.length>40&&!bad.length, bad.length+' 個出不來：'+JSON.stringify(bad.slice(0,6))); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
