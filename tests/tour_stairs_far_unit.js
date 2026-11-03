// 總圖新生導覽：館員在樓梯平台（第 1 層）等人、玩家還在第 0 層、就在她腳下（水平 0.67～3.5 m）＝不算「走遠」（BUG-TOUR-STAIRS-FAR-1103；BB 11-03 17:01，CC N19_tour_joy：原本不同層一律算 far，40 秒就判「你離開了『總圖新生導覽』」）。
// 不需要瀏覽器：從 src/classes3d.js 抓出 runLibTour 裡的 far()，用假的玩家／館員位置跑。修改前 1、2 FAIL。用法：node tests/tour_stairs_far_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
const m=src.match(/const far=\(\)=>\{[^\n]*?\};/); check('0. 找得到 far()',!!m);
const E={player:{lv:0,obj:{position:{x:0,z:0}}}}, lib={lv:1,obj:{position:{x:-7.29,z:-5.37}}};
const far=new Function('E','lib','Math',m[0]+' return far;')(E,lib,Math);
const at=(lv,x,z)=>{ E.player.lv=lv; E.player.obj.position={x,z}; return far(); };
check('1. 第 0 層、館員正下方 0.67 m：不算走遠',!at(0,-7.29+0.67,-5.37));
check('2. 第 0 層、水平 3.5 m（樓梯口）：不算走遠',!at(0,-7.29+3.5,-5.37));
check('3. 第 0 層、水平 12 m（大廳另一頭）：算走遠',at(0,-7.29+12,-5.37));
check('4. 同一層 20 m：不算；30 m：算（照舊 25 m）',!at(1,-7.29+20,-5.37)&&at(1,-7.29+30,-5.37));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
