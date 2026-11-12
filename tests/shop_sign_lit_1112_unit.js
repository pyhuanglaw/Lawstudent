// SHOP-SIGN-LIT-1112（LAWWW2-C；BB 17:4x 公館燒臘 23:30 鐵門拉了招牌還亮；店面標準 §12 第 1 點）：街景模型的招牌面合成一張 wz_signs_atlas、晚上整片一起亮，
// 打烊的店招牌照樣亮。Z3.shopSignLit：每一塊板面照中心分給那一間，沒開那一塊不發光。不需要瀏覽器（D131）。
//   0 wzAtlasFaces 每一塊板面有 aItem、userData.atlas.items 有中心 c
//   1 真的公館模型（gongguan_shops.glb 的 SIGN_FACE_*／VSIGN_FACE_*）：燒臘（G00）的橫招牌、兩面直立招牌都分給 noodle；汀州路（tingzhou_street.glb）七間的招牌照名稱分到
//   2 著色器：發光乘 uSignLit（只乘 totalEmissiveRadiance，字照樣看得到）；快取 key 分開
//   3 03:00 打烊那幾塊＝0、15:00 開著的＝1；第二次叫不重複接；ggShopLit／shopRealGlow 會叫它
// 修改前：0、1 FAIL（Z3.shopSignLit 不存在）。用法：node tests/shop_sign_lit_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); console.warn=()=>{};
const T=rd('tests/nav_buildings_unit.js');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/tingzhou_layout.js','src/data/tz_shops_layout.js','src/tingzhou3d.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const log=console.log; console.log=()=>{};
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){} }
console.log=log;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; global.GAME={G:{day:30,hour:3,flags:{}}};
const src=rd('src/zones3d.js');
check('0. wzAtlasFaces 每一塊板面記 aItem、items 記中心 c',/g\.setAttribute\('aItem'/.test(src)&&/items:items\.map\(it=>\(\{name:it\.o\.name,c:\[/.test(src));
check('0. Z3.shopSignLit 存在；ggShopLit、shopRealGlow 會叫它',typeof Z3.shopSignLit==='function'&&/if\(real\) shopSignLit\(root,zone,real\)/.test(src)&&/if\(rt\) shopSignLit\(rt,zone,list\)/.test(src));
if(typeof Z3.shopSignLit!=='function'){ console.log('FAILED '+fails); process.exit(1); }
const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gongguan_shops.glb')); const jl=buf.readUInt32LE(12); const J=JSON.parse(buf.slice(20,20+jl).toString('utf8'));
const REAL=(new Function('return '+/const GG_SHOP_REAL=(\(\(\)=>\{[\s\S]*?\}\)\(\));/.exec(src)[1]))();
const items=[], pos=[], ai=[]; J.nodes.forEach(n=>{ if(!/^V?SIGN_FACE_/.test(n.name||'')||n.mesh==null) return; const pr=J.meshes[n.mesh].primitives[0], a=J.accessors[pr.attributes.POSITION], t=n.translation||[0,0,0]; const c=[0,1,2].map(i=>(a.min[i]+a.max[i])/2+t[i]); const k=items.length; items.push({name:n.name,c}); for(let q=0;q<3;q++){ pos.push(c[0]+q*0.1,c[1],c[2]); ai.push(k); } });
const g=new THREE.Group(), root=new THREE.Group(); g.add(root); const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('aItem',new THREE.Float32BufferAttribute(ai,1));
const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial()); mesh.name='wz_signs_atlas'; mesh.userData.atlas={items}; root.add(mesh);
const zone={update:null}; const R=Z3.shopSignLit(root,zone,REAL);
check('1. 讀到公館招牌板面 '+items.length+' 塊、接得上（公館街景模型只有燒臘的招牌是 SIGN_FACE 板面）',!!R&&items.length>=3);
const slotOf=pl=>R.ids.indexOf(pl)+1; const g00=items.map((it,i)=>[it,R.slot[i]]).filter(a=>/_G00(_|$)/.test(a[0].name));
check('1. 燒臘（G00）的招牌分給 noodle',g00.length>0&&g00.every(a=>a[1]===slotOf('noodle')),g00.map(a=>a[0].name+'→'+(R.ids[a[1]-1]||'無')).join('、'));
{ const b2=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.glb')); const J2=JSON.parse(b2.slice(20,20+b2.readUInt32LE(12)).toString('utf8'));
  const it2=[], p2=[], a2=[]; J2.nodes.forEach(n=>{ if(!/^V?SIGN_FACE_/.test(n.name||'')||n.mesh==null) return; const pr=J2.meshes[n.mesh].primitives[0], a=J2.accessors[pr.attributes.POSITION], t=n.translation||[0,0,0]; const c=[0,1,2].map(i=>(a.min[i]+a.max[i])/2+t[i]); const k=it2.length; it2.push({name:n.name,c}); for(let q=0;q<3;q++){ p2.push(c[0],c[1],c[2]); a2.push(k); } });
  const r2=new THREE.Group(); const g2=new THREE.BufferGeometry(); g2.setAttribute('position',new THREE.Float32BufferAttribute(p2,3)); g2.setAttribute('aItem',new THREE.Float32BufferAttribute(a2,1)); const m2=new THREE.Mesh(g2,new THREE.MeshStandardMaterial()); m2.name='wz_signs_atlas'; m2.userData.atlas={items:it2}; r2.add(m2);
  const TL=TZ3.shopReal(), R2=Z3.shopSignLit(r2,{update:null},TL); const bad=[]; it2.forEach((it,i)=>{ const pl=R2.ids[R2.slot[i]-1]; for(const q of TL) if(new RegExp('[_T]'+q.id+'(_|$)').test(it.name)&&!/(_t_[ab]|_2F)$/.test(it.name)&&pl!==q.place) bad.push(it.name+'→'+(pl||'無')); if(pl&&!TL.some(q=>q.place===pl&&new RegExp('[_T]'+q.id+'(_|$)').test(it.name))&&/^V?SIGN_FACE_T(e|w)_/.test(it.name)) bad.push(it.name+' 被分給 '+pl); if(pl&&/(_t_[ab]|_2F)$/.test(it.name)) bad.push(it.name+'（樓上住戶）被分給 '+pl); });
  check('1. 汀州路：名稱帶那一棟的招牌分給那一間；樓上住戶（_t_a／_t_b、_2F：套房出租、按摩、桌遊、鋼琴教室、美髮）和別人家的招牌不分給真的店內（'+it2.length+' 塊）',!bad.length,bad.slice(0,6).join('、')+'　'+JSON.stringify(R2.info)); }
const sh={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader}; mesh.material.onBeforeCompile(sh,null);
check('2. 發光乘 uSignLit、快取 key 分開',/totalEmissiveRadiance\*=k/.test(sh.fragmentShader)&&/attribute float aShopS/.test(sh.vertexShader)&&sh.uniforms.uSignLit.value===R.lit&&mesh.material.customProgramCacheKey()==='shopSignLit');
GAME.G.hour=3; R.upd(); const cl=REAL.filter(q=>!PLACES.isOpen(q.place,3,30)); check('3. 03:00 打烊的 '+cl.length+' 間＝0',cl.length>0&&cl.every(q=>R.lit[slotOf(q.place)]===0));
GAME.G.hour=15; R.upd(); const op=REAL.filter(q=>PLACES.isOpen(q.place,15,30)); check('3. 15:00 開著的 '+op.length+' 間＝1',op.length>0&&op.every(q=>R.lit[slotOf(q.place)]===1));
check('3. 第二次叫不重複接',Z3.shopSignLit(root,zone,REAL)===null);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
