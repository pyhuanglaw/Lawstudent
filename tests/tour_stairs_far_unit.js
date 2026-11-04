// 總圖新生導覽：館員在樓梯平台（第 1 層）等人、玩家還在第 0 層、就在她腳下（水平 0.67～3.5 m）＝不算「走遠」（BUG-TOUR-STAIRS-FAR-1103；BB 11-03 17:01，CC N19_tour_joy：原本不同層一律算 far，40 秒就判「你離開了『總圖新生導覽』」）。
// 第 5～7 項：AA 11-03 17:04 的兩句（館員在樓上等的旁白、走遠一半時間的提醒）。
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
/* AA 11-03 17:04 的兩句：抓出 waitFor（跟 far 同一段），假的 GM.sleep／caption 跑一遍 */
const w=src.match(/let zone0=G\.zone, farT=0[^\n]*\n[^\n]*\n[^\n]*TOUR_WARN=[^\n]*\n\s*const waitFor=[^\n]*?return true; \};/);
check('5. 找得到 waitFor 和兩句',!!w&&w[0].includes('（館員站在樓梯平台上，回頭等你們跟上來。）')&&w[0].includes('（小聲）導覽往這邊喔，還要一起走嗎？'));
(async()=>{
  const caps=[]; const GM={sleep:async()=>{}, caption:(n,t)=>caps.push(n+'|'+t)}; const G={zone:'library_hall'};
  const mk=new Function('G','GM','E','lib','far',w[0]+' return {waitFor,get farT(){return farT;},get left(){return left;}};');
  // (a) 館員在第 1 層、玩家在第 0 層正下方：旁白一次、不提醒、不判離開
  E.player.lv=0; E.player.obj.position={x:-7.29+0.67,z:-5.37}; let n=0;
  let st=mk(G,GM,E,lib,far); await st.waitFor(()=>++n>200,0);
  check('6. 館員在樓上、玩家在她腳下 60 秒：旁白一次「館員站在樓梯平台上」、沒有提醒、沒有判離開',caps.filter(c=>c.includes('樓梯平台')).length===1&&!caps.some(c=>c.includes('小聲'))&&!st.left,JSON.stringify(caps));
  // (b) 同一層走遠 30 m：20 秒提醒一次，40 秒判離開
  caps.length=0; E.player.lv=1; E.player.obj.position={x:-7.29+30,z:-5.37}; n=0; st=mk(G,GM,E,lib,far); await st.waitFor(()=>++n>300,0);
  check('7. 走遠：提醒一次（館員、小聲那句），40 秒照舊判離開',caps.filter(c=>c==='館員|（小聲）導覽往這邊喔，還要一起走嗎？').length===1&&st.left,JSON.stringify(caps)+' left='+st.left);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
