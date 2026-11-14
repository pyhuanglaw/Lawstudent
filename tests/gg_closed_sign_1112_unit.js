// GG-CLOSED-SIGN-1112（LAWWW2-C；店面標準 §12 第 1 點「打烊看得出來關了」）：公館十三間店的櫥窗改成真的店內以後沒有窗卡，
// 招牌、店內、門口的光暈找不到是哪一間 → 打烊了招牌還亮。Z3.ggShopLit(root,zone,真的店內清單)：那幾間各佔一格，光暈照那一棟的寬分。不需要瀏覽器（D131）。
//   1 真的公館模型（gongguan_shops.glb 的 GLOW_ 節點位置）：每一間真的店內至少分到一個自己的光暈（招牌或店內或門口）
//   2 騎樓燈一個都不分（不熄）
//   3 打烊那一格 < 0.99、開著的 1；不傳清單＝照舊（只有窗卡那幾間）
// 修改前：1 FAIL（只有還有窗卡的五間分得到）。用法：node tests/gg_closed_sign_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); console.warn=()=>{};
const T=rd('tests/nav_buildings_unit.js');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const log=console.log; console.log=()=>{};
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){} }
console.log=log;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.lampsOn=true; global.GAME={G:{day:30,hour:3,flags:{}}};
const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gongguan_shops.glb')); const jl=buf.readUInt32LE(12); const J=JSON.parse(buf.slice(20,20+jl).toString('utf8'));
const src=rd('src/zones3d.js'); const REAL=(new Function('return '+/const GG_SHOP_REAL=(\(\(\)=>\{[\s\S]*?\}\)\(\));/.exec(src)[1]))();
check('0. 讀得到真的店內清單、模型裡有光暈節點',REAL.length>=13&&J.nodes.some(n=>/^GLOW_/.test(n.name||'')),REAL.length+' 間');
const mk=(real)=>{ const g=new THREE.Group(), root=new THREE.Group(); root.name='gongguan_shops_glb'; g.add(root);
  const pos=[], uv1=[]; for(const [s,x0,x1] of [[1,-33,-25]]) for(const [x,y] of [[x0,4],[x1,4],[x1,6],[x0,6]]){ pos.push(x,y,19); uv1.push(s,0); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv1.map(()=>0),2)); geo.setAttribute('uv1',new THREE.Float32BufferAttribute(uv1,2)); geo.setIndex([0,1,2,0,2,3]);
  const lit=new THREE.Mesh(geo,new THREE.MeshStandardMaterial()); lit.name='NOSHADOW_xs_fronts_lit'; lit.userData.xsShops='ggcvs'; root.add(lit);
  const glows=[]; for(const n of J.nodes){ if(!/^GLOW_/.test(n.name||'')||!n.translation) continue; const o=new THREE.Object3D(); o.name=n.name; o.position.set(n.translation[0],n.translation[1],n.translation[2]); o.userData={glow:'rgba(255,220,170,1)',size:1.4,day:0,night:0.9}; root.add(o); glows.push(o); }
  const gm=Z3.glowBatch(E,g,root,glows,root.name+'_glows'); const R=Z3.ggShopLit(root,{update:null},real); return {gm,R,glows}; };
const A=mk(REAL), items=A.gm.userData.glowBatch.items, aS=A.gm.geometry.attributes.aShop;
const slotOf=q=>{ const k=A.R.ids.findIndex(id=>id==='real:'+q.place||(id==='ggcvs'&&q.place==='cvs')); return k+1; };
const cnt={}; items.forEach((it,i)=>{ const s=aS.getX(i*4); if(s) cnt[s]=(cnt[s]||0)+1; });
const none=REAL.filter(q=>!cnt[slotOf(q)]).map(q=>q.place);
check('1. 每一間真的店內都分到自己的光暈（招牌／店內／門口）',none.length===0,none.length?'沒有的：'+none.join('、'):REAL.map(q=>q.place+' '+cnt[slotOf(q)]).join('、'));
const arc=items.map((it,i)=>[it,aS.getX(i*4)]).filter(a=>/^GLOW_arcadelamp/.test(a[0].n||'')); check('2. 騎樓燈不分給哪一間（'+arc.length+' 盞）',arc.length>0&&arc.every(a=>a[1]===0));
check('2. 格數沒有超過著色器的 16 格',A.R.ids.length<=16,A.R.ids.length+' 格');
GAME.G.hour=3; A.R.upd(); const closed=REAL.filter(q=>!PLACES.isOpen(q.place,3,30)); check('3. 03:00 打烊的店那一格 < 0.99（'+closed.length+' 間）',closed.length>0&&closed.every(q=>A.R.lit[slotOf(q)]<0.99));
GAME.G.hour=15; A.R.upd(); const op=REAL.filter(q=>PLACES.isOpen(q.place,15,30)); check('3. 15:00 開著的店那一格＝1（'+op.length+' 間）',op.length>0&&op.every(q=>A.R.lit[slotOf(q)]===1));
const B=mk(); check('3. 不傳清單＝照舊：只有窗卡那幾間',B.R.ids.length===1);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
