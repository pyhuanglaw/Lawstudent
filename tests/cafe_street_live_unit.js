// X132 CAFE-WINDOW-LIVE-1030（LAWWW2-B 2026-10-30）：兩點半 Café 店面玻璃外的 3D 溫州街。node tests/cafe_street_live_unit.js
//   1. attachCafeInterior 叫 cafeStreetLive；溫州街 → Café 的換算（溫州街 (x,z) → Café (z, 61−x)）和溫州街實際的 Café 位置一致：
//      溫州街「進入兩點半 Café」的互動點換到 Café 是玻璃外一點點（店面玻璃在 Café 的 z=+6，房間深 12 m）；裁切平面在玻璃和互動點中間
//   2. 畫的街景（view）在 3D 街接上以後從 winParts 拿掉（winParts 每一幀照鏡頭重設顯示，不拿掉會蓋在 3D 街前面）
//   3. 路人的路線全部在玻璃外（裁切平面外）
//   4. 複製材質（不動到溫州街本身共用的材質）、晚上 TK.setNight、白天補亮、晚上壓暗
// 畫面：tools/blender/env_second/shots/cafe_window_shots.py（瀏覽器，白天／黃昏／晚上同角度改前改後）
const fs=require('fs'), path=require('path'); const Z=fs.readFileSync(path.join(__dirname,'..','src','zones3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'  '+info:'')); if(!ok) fails++; };
const num=re=>{ const m=re.exec(Z); return m?+m[1]:NaN; };
check('1. attachCafeInterior 叫 cafeStreetLive', /cafeStreetLive\(z,g0,view\);\n  \}/.test(Z));
const OFF=num(/CAFE_ST_OFF=([\d.]+)/), CLIP=num(/CAFE_ST_CLIP=([\d.]+)/);
const doorX=num(/E\.interactables\.push\(\{x:([\d.]+),z:0,radius:[\d.]+,label:'進入兩點半 Café'/);
const roomD=num(/const cafe=\{ id:'cafe'[^\n]*?room\(E,\{view:'cafe',viewDepth:\d+,w:\d+,d:(\d+)/);
const glass=roomD/2, doorC=OFF-doorX;
check('1. 溫州街的 Café 入口換到 Café 是玻璃外 0.3～1.5 m', glass+0.3<doorC&&doorC<glass+1.5, '入口 x='+doorX+' → Café z='+doorC.toFixed(2)+'；玻璃 z='+glass);
check('1. 裁切平面在玻璃和入口之間', glass<CLIP&&CLIP<doorC, 'CLIP='+CLIP);
check('1. 街景的群組照這個換算擺（rotation.y=π/2、position (0,0,OFF)）', /st\.rotation\.y=Math\.PI\/2; st\.position\.set\(0,0,CAFE_ST_OFF\)/.test(Z));
check('2. 3D 街接上以後畫的街景從 winParts 拿掉', /const vi=z\.winParts\.findIndex\(p=>p\.obj===view\); if\(vi>=0\) z\.winParts\.splice\(vi,1\); view\.visible=false;/.test(Z));
check('2. 3D 街本身在 winParts（鏡頭到前牆外時藏起來）', /z\.winParts\.push\(\{obj:st,/.test(Z));
const W=/const CAFE_WALK=(\[\[\[.*?\]\]\]);/.exec(Z); let routes=[]; try{ routes=JSON.parse(W[1]); }catch(e){}
const pts=routes.flat(); const bad=pts.filter(p=>OFF-p[0]<=CLIP+0.3);
check('3. 路人路線都在玻璃外（裁切平面外 0.3 m 以上）', pts.length>=8&&bad.length===0, pts.length+' 個點'+(bad.length?'；不行：'+JSON.stringify(bad):''));
check('4. 材質複製一份再改（裁切、補亮、壓暗不動到溫州街共用的材質）', /const c=m\.clone\(\); c\.userData=Object\.assign\(\{\},m\.userData\); delete c\.userData\.wzReg; c\.clippingPlanes=clip;/.test(Z));
check('4. 晚上照溫州街的時段公式 TK.setNight', /function cafeStreetNight\(h\)\{ const k=h>=19\.2\|\|h<5\.6\?1:\(h>=17\.4\?\(h-17\.4\)\/1\.8:\(h<6\.3\?\(6\.3-h\)\/0\.7:0\)\);/.test(Z)&&/TK\.setNight\(k\);/.test(Z));
check('4. 載入失敗時照舊用畫的街景（catch 不藏 view）', /\.catch\(e=>console\.warn\('Café 窗外的溫州街載入失敗，照舊用畫的街景',e\)\)/.test(Z));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
