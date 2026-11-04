// 公館打烊調暗：光暈也要一起熄（LAWWW 11-04 06:58 P1；CC GG_night：青木、afar、Daybreak、單車打烊只暗 5～8%，亮的主要是窗卡前面的光暈）——不需要瀏覽器（D131）。
// 用遊戲真正的 zones3d.js（Z3.glowBatch＝wzGlowBatch、Z3.ggShopLit）：做一個假的公館店面模型（窗卡網格 uv1.x＝店編號、幾個 GLOW_* 光暈），檢查
//   1 光暈網格有 aShop：店內／招牌／店門口的燈分到所在那一間（窗卡範圍 x ±0.8、z ±5）；騎樓燈 GLOW_arcadelamp、範圍外的是 0（不熄）
//   2 光暈的著色器乘 uShopLit（和窗卡同一個 uniform 物件），打烊（< 0.99）＝0
//   3 照營業時間：打烊的店那一格 < 0.99、開著的 1
// 修改前（開發分支 d432de8ba）：光暈網格沒有 aShop、著色器沒有 uShopLit——第 1、2 項 FAIL。用法：node tests/gg_glow_shoplit_unit.js
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
const E=E3; E.lampsOn=true; global.GAME={G:{day:30,hour:22,flags:{}}};
// 假的店面模型：兩間店的窗卡（1 號 x −10～−4、2 號 x 4～10，z 22），一間店一個店內光暈、一個招牌光暈；一盞騎樓燈；一個不在任何店前面的招牌
const g=new THREE.Group(), root=new THREE.Group(); root.name='gongguan_shops_glb'; g.add(root);
const pos=[], uv1=[]; for(const [s,x0,x1] of [[1,-10,-4],[2,4,10]]) for(const [x,y] of [[x0,0],[x1,0],[x1,2.6],[x0,2.6]]){ pos.push(x,y,22); uv1.push(s,0); }
const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv1.map(()=>0),2)); geo.setAttribute('uv1',new THREE.Float32BufferAttribute(uv1,2)); geo.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);
const lit=new THREE.Mesh(geo,new THREE.MeshStandardMaterial()); lit.name='NOSHADOW_xs_fronts_lit'; lit.userData.xsShops='ggtea,ggafar'; root.add(lit);
const glows=[]; const G_=(name,x,y,z)=>{ const o=new THREE.Object3D(); o.name=name; o.position.set(x,y,z); o.userData={glow:'rgba(255,220,170,1)',size:1.4,day:0,night:0.9}; root.add(o); glows.push(o); };
G_('GLOW_gg_xs_in_1',-7,2.2,23); G_('GLOW_signbox_2',-6.5,3.6,19.5); G_('GLOW_shopin_3',7,2.2,23); G_('GLOW_vsign_4',9.9,5,19); G_('GLOW_arcadelamp_5',-7,3.8,20.5); G_('GLOW_signbox_6',40,3.6,19.5);
G_('GLOW_gg_xs_lamp_7',3.4,3.2,21.6); G_('GLOW_vsign_8',3.5,5.8,18.4);   /* 門口的燈在窗卡外 0.6 m（算 2 號）；直立招牌在 2 號窗卡外 0.5 m＝隔壁店的（不算）*/
const gm=Z3.glowBatch(E,g,root,glows,root.name+'_glows');
// 青木（aoki）22:00 打烊、afar 22:00：看 places.js；這裡直接把兩間的營業時間照 places 算，不寫死
const R=Z3.ggShopLit(root,{update:null});
const A=gm.geometry.attributes.aShop; const at=i=>A?A.getX(i*4):undefined;
check('1. 光暈網格有每頂點的店編號 aShop',!!A,A?'':'沒有 aShop（修改前）');
check('1. 店內、招牌光暈分到所在那一間：GLOW_gg_xs_in_1／signbox_2＝1、shopin_3／vsign_4＝2',at(0)===1&&at(1)===1&&at(2)===2&&at(3)===2,[0,1,2,3].map(at).join(','));
check('1. 騎樓燈、不在任何店前面的招牌＝0（不熄）',at(4)===0&&at(5)===0,[4,5].map(at).join(','));
check('1. 門口的燈在窗卡外 0.8 m 內算那一間；招牌在窗卡外面＝隔壁店的，不算',at(6)===2&&at(7)===0,[6,7].map(at).join(','));
// 2. 著色器：照 three.js 的 MeshBasicMaterial 原始碼走一次 onBeforeCompile
const sh={uniforms:{},vertexShader:THREE.ShaderLib.basic.vertexShader,fragmentShader:THREE.ShaderLib.basic.fragmentShader}; gm.material.onBeforeCompile(sh,null);
check('2. 光暈著色器乘 uShopLit（和窗卡同一個 uniform 物件）',/ggShopK\( aShop \) \* mix\( aOp\.x, aOp\.y, uNightK \)/.test(sh.vertexShader)&&!!sh.uniforms.uShopLit&&R&&sh.uniforms.uShopLit.value===R.lit,'');
check('2. 原本的光暈做法照舊（面向鏡頭、夜間程度、太暗不畫）',/mvPosition\.xy \+= aCorner \* aSize/.test(sh.vertexShader)&&/vGlowOp <= 0\.02/.test(sh.fragmentShader));
check('2. 程式快取 key 和沒有店編號的光暈網格分開',gm.material.customProgramCacheKey()==='wzGlowBatch1_ggShop');
// 3. 照營業時間
const open=(zk,h)=>PLACES.isOpen(zk,h,30); const exp=(zk,h)=>open(zk,h)?1:0.03;
for(const h of [15,22]){ GAME.G.hour=h; R.upd(); check('3. '+h+':00 青木 '+(open('aoki',h)?'開':'打烊')+'、afar '+(open('afar',h)?'開':'打烊')+'：uShopLit 照營業時間',R.lit[1]===exp('aoki',h)&&R.lit[2]===exp('afar',h),R.lit.slice(1,3).join(',')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
