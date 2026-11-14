// 公館窗卡第二次進公館整張不畫（GG-NIGHT-CARDS-1104；CC-C r8c 11-04 12:52：同一頁先讀檔 14:00 再 21:00，21:00 那次程式 LINK_STATUS＝false，
//   vertex「'uv1' : redefinition」「'vShopIdx' : redefinition」、fragment「'uShopLit' : redefinition」；BB-C 讀碼：快取的 GLB clone(true) 共用材質、mine.prev＝上一次的 mine）——不需要瀏覽器（D131）。
// 用遊戲真正的 zones3d.js（Z3.ggShopLit、Z3.glowBatch）＋ three.js 真的 MeshStandardMaterial 著色器原始碼，同一個材質建兩次、三次區域（＝進公館兩次、三次），檢查
//   1 第一次：patch 一次，uShopLit、vShopIdx、uv1 各宣告一次（原本就對）
//   2 第二次進來重新編譯（材質離開時被丟掉、程式重建）：宣告還是各一次（修改前：兩次 → 連結失敗、窗卡不畫）
//   3 第二次進來沒有重新編譯（three.js 用快取的程式、不呼叫 onBeforeCompile）：第一次綁的 uniform 就是新的 upd 寫的那一個（修改前：新的 lit 陣列沒有綁到任何程式，打烊不會暗）
//   4 別的程式之後又包一層 onBeforeCompile（像 patchSeeThrough 串在後面），ggShopLit 的 guard 接回去：編譯不會無限遞迴，兩邊的 patch 各一次
//   5 光暈網格（第二次進來新建的）和窗卡同一個 uniform 物件；材質沒有被複製
// 修改前（開發分支 ebd44c2e3）：第 2、3、4 項 FAIL。用法：node tests/gg_shoplit_reentry_unit.js
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
const E=E3; E.lampsOn=true; global.GAME={G:{day:30,hour:15,flags:{}}};
const cnt=(s,re)=>(s.match(re)||[]).length;
// three.js 真的 MeshStandardMaterial 著色器（ShaderLib.standard）：和瀏覽器裡 onBeforeCompile 拿到的是同一份原始碼（還沒展開 #include）
const LIB=THREE.ShaderLib.standard||THREE.ShaderLib.physical;
const compile=(m)=>{ const sh={uniforms:THREE.UniformsUtils.clone(LIB.uniforms),vertexShader:LIB.vertexShader,fragmentShader:LIB.fragmentShader}; m.onBeforeCompile(sh,null); return sh; };
const decl=sh=>({uShop:cnt(sh.fragmentShader,/uniform float uShopLit\[17\]/g), vIdxV:cnt(sh.vertexShader,/varying float vShopIdx/g), vIdxF:cnt(sh.fragmentShader,/varying float vShopIdx/g), uv1:cnt(sh.vertexShader,/attribute vec2 uv1/g), mul:cnt(sh.fragmentShader,/totalEmissiveRadiance\*=k/g)});
const once=d=>d.uShop===1&&d.vIdxV===1&&d.vIdxF===1&&d.uv1<=1&&d.mul===1;
const J=JSON.stringify;
// 快取的 GLB：每次進區域 c.scene.clone(true)——網格、幾何是新的，材質是同一個（MAT）
const MAT=new THREE.MeshStandardMaterial({emissive:0xffffff}); MAT.name='wz_xs_fronts';
function entry(){ const g=new THREE.Group(), root=new THREE.Group(); root.name='gongguan_shops_glb'; g.add(root);
  const pos=[], uv1=[]; for(const [s,x0,x1] of [[1,-10,-4],[6,4,10]]) for(const [x,y] of [[x0,0],[x1,0],[x1,2.6],[x0,2.6]]){ pos.push(x,y,22); uv1.push(s,0); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv1.map(()=>0),2)); geo.setAttribute('uv1',new THREE.Float32BufferAttribute(uv1,2)); geo.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);
  const lit=new THREE.Mesh(geo,MAT); lit.name='NOSHADOW_xs_fronts_lit'; lit.userData.xsShops='ggtea,ggbook,ggcvs,ggyy,ggbike,ggafar,ggcorner,ggdb'; root.add(lit);
  const o=new THREE.Object3D(); o.name='GLOW_gg_xs_in_1'; o.position.set(-7,2.2,23); o.userData={glow:'rgba(255,220,170,1)',size:1.4,day:0,night:0.9}; root.add(o);
  const gm=Z3.glowBatch(E,g,root,[o],root.name+'_glows'); const zone={update:null}; const R=Z3.ggShopLit(root,zone); return {R,zone,gm,lit}; }
// 1 第一次進公館
const A=entry(); const sh1=compile(MAT), d1=decl(sh1);
check('1 第一次：uShopLit、vShopIdx（vertex、fragment）、uv1 各宣告一次、打烊乘數乘一次',once(d1),J(d1));
// 2 第二次進公館、重新編譯（離開時材質被丟掉 → 程式重建 → three.js 再呼叫一次 onBeforeCompile）
const B=entry(); let sh2=null, err2=''; try{ sh2=compile(MAT); }catch(e){ err2=String(e&&e.message||e).slice(0,80); }
const d2=sh2?decl(sh2):null;
check('2 第二次進來重新編譯：宣告還是各一次（修改前兩次＝連結失敗、整張窗卡不畫）',!!d2&&once(d2),d2?J(d2):err2);
check('2 第三次進來重新編譯也一樣',(()=>{ entry(); try{ return once(decl(compile(MAT))); }catch(e){ return false; } })());
// 3 沒有重新編譯（材質還在、three.js 用快取的程式）：綁著的是第一次的 uniform → 第二次的 upd 要寫同一個陣列
GAME.G.hour=22; B.R.upd();
const afarOpen22=PLACES.isOpen('afar',22,30), exp6=afarOpen22?1:0.03;
check('3 第二次進來沒重新編譯：第一次綁的 uniform＝第二次 upd 寫的那一個 lit 陣列（修改前是兩個不同的陣列，打烊不會暗）',sh1.uniforms.uShopLit&&sh1.uniforms.uShopLit.value===B.R.lit,'');
check('3 22:00 afar（6 號）'+(afarOpen22?'開':'打烊')+'：快取的程式讀到的值＝'+exp6,sh1.uniforms.uShopLit&&sh1.uniforms.uShopLit.value[6]===exp6,sh1.uniforms.uShopLit?String(sh1.uniforms.uShopLit.value[6]):'');
check('3 重新編譯的程式也綁同一個陣列',!!sh2&&sh2.uniforms.uShopLit&&sh2.uniforms.uShopLit.value===B.R.lit);
GAME.G.hour=15; B.R.upd();
check('3 回到 15:00 又亮回來（同一個陣列）',sh1.uniforms.uShopLit&&sh1.uniforms.uShopLit.value[6]===(PLACES.isOpen('afar',15,30)?1:0.03));
// 4 別的程式之後串在後面包一層（像 engine3d.js 的 patchSeeThrough：prev.call 再改 fragment），guard 每 30 幀接回去
{ const prev=MAT.onBeforeCompile; MAT.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); sh.fragmentShader=sh.fragmentShader.replace('void main() {','// OTHER_PATCH\nvoid main() {'); };
  for(let i=0;i<31;i++) B.zone.update(0.016,E);
  let sh4=null, err4=''; try{ sh4=compile(MAT); }catch(e){ err4=String(e&&e.message||e).slice(0,80); }
  check('4 別的程式串在後面、guard 接回去以後編譯：不會無限遞迴',!!sh4,err4);
  check('4 兩邊的 patch 各一次（窗卡的宣告各一次、別的程式的修改一次）',!!sh4&&once(decl(sh4))&&cnt(sh4.fragmentShader,/OTHER_PATCH/g)===1,sh4?J(decl(sh4))+' other='+cnt(sh4.fragmentShader,/OTHER_PATCH/g):''); }
// 5 光暈、材質
{ const sh={uniforms:{},vertexShader:THREE.ShaderLib.basic.vertexShader,fragmentShader:THREE.ShaderLib.basic.fragmentShader}; B.gm.material.onBeforeCompile(sh,null);
  check('5 第二次進來新建的光暈網格：和窗卡同一個 uniform 物件',!!sh.uniforms.uShopLit&&sh.uniforms.uShopLit.value===B.R.lit);
  check('5 材質沒有被複製（夜間亮度登記在原本的材質上）',B.lit.material===MAT&&A.lit.material===MAT&&B.R.mesh===B.lit);
  check('5 除錯欄位：entries＝這個材質接過幾次（3）',!!B.zone.ggLit&&typeof B.zone.ggLit.entries==='function'&&B.zone.ggLit.entries()===3,B.zone.ggLit&&B.zone.ggLit.entries?String(B.zone.ggLit.entries()):'沒有 entries'); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
