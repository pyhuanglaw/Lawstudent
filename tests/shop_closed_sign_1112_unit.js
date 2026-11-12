// SHOP-CLOSED-SIGN-1112（LAWWW2-C；店面標準 §12 第 1 點）：溫州街、汀州路、新生南路打烊的店，招牌、店內、門口的光暈一起熄（Z3.shopRealGlow）。不需要瀏覽器（D131）。
//   1 真的街景模型的光暈位置：分得到店的光暈個數、每一個分到的光暈都在那一間店面 12 m 內；路燈、騎樓燈、住家門燈、壁燈一個都不分
//   2 著色器乘 uShopLit、快取 key 分開
//   3 打烊那一格 < 0.99、開著的 1；同一個網格叫第二次不重複接
// 修改前：Z3.shopRealGlow 不存在。用法：node tests/shop_closed_sign_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); console.warn=()=>{};
const T=rd('tests/nav_buildings_unit.js');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_shops_layout.js','src/data/tingzhou_layout.js','src/data/tz_shops_layout.js','src/data/xinsheng_layout.js','src/tingzhou3d.js','src/xinsheng3d.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const log=console.log; console.log=()=>{};
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){} }
console.log=log;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.lampsOn=true; global.GAME={G:{day:30,hour:3,flags:{}}};
const glb=f=>{ const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+f)); const jl=buf.readUInt32LE(12); return JSON.parse(buf.slice(20,20+jl).toString('utf8')); };
check('0. Z3.shopRealGlow、三條街的清單都在',typeof Z3.shopRealGlow==='function'&&typeof Z3.wzShopReal==='function'&&typeof TZ3!=='undefined'&&typeof XS3!=='undefined');
if(typeof Z3.shopRealGlow!=='function'){ console.log('FAILED '+fails); process.exit(1); }
const mk=(f,name,list)=>{ const J=glb(f), g=new THREE.Group(), root=new THREE.Group(); root.name=name; g.add(root); const glows=[];
  for(const n of J.nodes){ if(!/^GLOW_/.test(n.name||'')||!n.translation) continue; const o=new THREE.Object3D(); o.name=n.name; o.position.set(n.translation[0],n.translation[1],n.translation[2]); o.userData={glow:'rgba(255,220,170,1)',size:1.4,day:0,night:0.9}; root.add(o); glows.push(o); }
  const gm=Z3.glowBatch(E,g,root,glows,name+'_glows'); const zone={update:null}; const R=Z3.shopRealGlow(g,name,zone,list); return {g,gm,R,zone,list}; };
for(const [label,f,name,list,min] of [['溫州街','wenzhou_street.glb','wenzhou_street_glb',Z3.wzShopReal(),10],['汀州路','tingzhou_street.glb','tingzhou_street_glb',TZ3.shopReal(),10],['新生南路','xinsheng_street.glb','xinsheng_street_glb',XS3.SHOP_REAL,0]]){
  const A=mk(f,name,list); if(!A.R){ check('1. '+label+'：接得上',false,'回傳 null（清單 '+(list&&list.length)+' 間）'); continue; }
  const items=A.gm.userData.glowBatch.items, aS=A.gm.geometry.attributes.aShop; let far=[], bad=[];
  items.forEach((it,i)=>{ const s=aS.getX(i*4); if(!s) return; if(/^GLOW_(arcadelamp|doorlamp|sconce|goose|lantern|.*stairlamp)/.test(it.n)) bad.push(it.n); const pl=A.R.ids[s-1]; const d=Math.min(...list.filter(q=>q.place===pl).map(q=>Math.hypot(it.x-q.cx,it.z-q.cz))); if(d>12) far.push(it.n+'→'+pl+' '+d.toFixed(1)); });
  check('1. '+label+'：'+A.R.n+' 個光暈分到 '+Object.keys(A.R.info).length+' 間店（清單 '+A.R.ids.length+' 間）',A.R.n>=min&&A.R.ids.length<=32,JSON.stringify(A.R.info));
  check('1. '+label+'：分到的光暈都在那一間店面 12 m 內；路燈、騎樓燈、住家的燈不分',!far.length&&!bad.length,far.concat(bad).slice(0,6).join('、'));
  const sh={uniforms:{},vertexShader:THREE.ShaderLib.basic.vertexShader,fragmentShader:THREE.ShaderLib.basic.fragmentShader}; A.gm.material.onBeforeCompile(sh,null);
  check('2. '+label+'：著色器乘 uShopLit、快取 key 分開',/ggShopK\( aShop \) \* mix\( aOp\.x, aOp\.y, uNightK \)/.test(sh.vertexShader)&&sh.uniforms.uShopLit.value===A.R.lit&&A.gm.material.customProgramCacheKey()==='wzGlowBatch1_shopReal');
  let ok=true, nC=0, nO=0; for(const h of [3,15]){ GAME.G.hour=h; A.R.upd(); A.R.ids.forEach((pl,k)=>{ const o=PLACES.isOpen(pl,h,30); if(o) nO++; else nC++; if(o?A.R.lit[k+1]!==1:!(A.R.lit[k+1]<0.99)) ok=false; }); }
  check('3. '+label+'：03:00、15:00 照營業時間（打烊 '+nC+' 格次、開 '+nO+' 格次）',ok&&nC>0);
  check('3. '+label+'：第二次叫不重複接',Z3.shopRealGlow(A.g,name,A.zone,list)===null); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
