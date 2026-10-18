// 住在家裡時 3D 畫面底下鋪的圖（home3d.js HOME.backdrop）：BUG-KH-HOMEFLASH-1018（使用者 2026-10-18 15:4x：「我在高雄走了一整天，然後可昕問我客運幾點來找我 轉場中間又跑出台北的家」）。
//   7/25 客運版（ev_y0_kh_bus_h）從家裡出發、整天在高雄演完才回家，演的時候 HOME.at 還是 true：換場景、新背景載入的那一下，2D 底下露出家裡的圖。
//   1. 在家、2D 沒開：鋪家裡（3D 藏起來）；
//   2. 在家、2D 正在顯示別的圖（高雄客運站）：鋪同一張，不鋪家裡——修改前這項失敗；
//   3. 在家、2D 是深色底：鋪深色；
//   4. 在家、2D 是透明的（模糊）：鋪家裡（家裡的對話）；
//   5. 從家裡出發的 2D 出遊（OUT.fromHome、人不在家）、2D 沒開：深色，不鋪家裡——修改前這項失敗；
//   6. 從家裡出發的 2D 出遊、2D 顯示出遊的圖：鋪同一張；
//   7. 住在家裡、剛出家門還沒進新的 3D 地點：3D 藏著、深色——修改前鋪家裡；
//   8. 進了新的 3D 地點（GAME.enterN 變了）：3D 露出來，不鋪；
//   9. 不住家裡（法律系平常）、人不在家：3D 照常。
// 用法：node tests/home_backdrop_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
global.setInterval=()=>({unref(){}});   // 不要讓 home3d.js 的 0.25 秒同步在測試中間自己跑
const canvas={style:{}}, body={style:{}};
global.document={getElementById:id=>id==='c'?canvas:null, body};
global.OUT={fromHome:false, bg:k=>({label:k,image:'assets/bg/'+k+'.webp'})};
global.ADV={active:false,bgMode:null};
let G=null;
global.GAME={get G(){ return G; }, enterN:0};
{ const src=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8').replace(/^const HOME=/m,'globalThis.HOME=');
  vm.runInThisContext(src,{filename:'src/home3d.js'}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const look=()=>{ HOME.backdrop(G); const bgs=body.style.background||''; const m=bgs.match(/url\(([^)]*)\)/); return {hidden:canvas.style.visibility==='hidden', img:m?m[1]:null, raw:bgs}; };
const isHome=img=>!!img&&/\/home_/.test(img);
const econ=(at)=>{ G={stage:'econ',day:330,hour:9,flags:{Y0_MOVED_OUT:true},home:{at:!!at}}; };

econ(true); ADV.active=false; ADV.bgMode=null; OUT.fromHome=false;
let r=look(); check('1 在家、2D 沒開：3D 藏起來、鋪家裡', r.hidden&&isHome(r.img), JSON.stringify(r));

ADV.active=true; ADV.bgMode={label:'高雄・客運站出口',image:'assets/bg/kh_bus_station.webp'};
r=look(); check('2 在家（客運版從家裡出發）、2D 顯示高雄客運站：鋪同一張，不鋪家裡', r.hidden&&r.img==='assets/bg/kh_bus_station.webp', JSON.stringify(r));

ADV.bgMode='dark'; r=look(); check('3 在家、2D 深色底：鋪深色', r.hidden&&!r.img, JSON.stringify(r));

ADV.bgMode='blur'; r=look(); check('4 在家、2D 透明（模糊）：鋪家裡', r.hidden&&isHome(r.img), JSON.stringify(r));

G.home.at=false; OUT.fromHome=true; ADV.active=false; ADV.bgMode=null;
r=look(); check('5 從家裡出發的 2D 出遊、2D 沒開：深色，不鋪家裡', r.hidden&&!r.img, JSON.stringify(r));

ADV.active=true; ADV.bgMode={label:'高雄・港邊',image:'assets/bg/kh_harbor.webp'};
r=look(); check('6 從家裡出發的 2D 出遊、2D 顯示出遊的圖：鋪同一張', r.hidden&&r.img==='assets/bg/kh_harbor.webp', JSON.stringify(r));

// 7、8：住在家裡，從在家 → 出家門（還沒進新的 3D 地點）→ 進了新地點
econ(true); OUT.fromHome=false; ADV.active=false; ADV.bgMode=null; GAME.enterN=5; look();
G.home.at=false; r=look(); check('7 住在家裡、剛出家門還沒進新的 3D 地點：3D 藏著、深色（不鋪家裡）', r.hidden&&!r.img, JSON.stringify(r));
GAME.enterN=6; r=look(); check('8 進了新的 3D 地點：3D 露出來', !r.hidden&&r.raw==='', JSON.stringify(r));

G={stage:'law',day:20,hour:15,flags:{},home:{at:false}}; OUT.fromHome=false; GAME.enterN=7; ADV.active=false;
r=look(); check('9 法律系平常、人不在家：3D 照常', !r.hidden&&r.raw==='', JSON.stringify(r));

console.log(fails?`結果：${fails} 項 FAIL`:'結果：ALL PASS');
process.exit(fails?1:0);
