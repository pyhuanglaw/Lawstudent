// 兩個使用者回報（2026-10-30）——不需要瀏覽器，看程式字串＋假資料：
//   BADCLIP-FOLLOW-1030「羽球影片超白癡 沈以安 直接跑到我面前 沒有隔著網子打」（附 day 29 存檔：和以安約羽球、一起走過去）：
//     她是 follow（一起走過去的人），短片 place() 把她放到北半場、設 frozen，但 engine3d.js 的跟著走不看 frozen，每一格把她拉回玩家身邊。
//     修：短片期間 follow／buddy／passenger 換成 idle、演完照 keep 還原；engine 的 follow／buddy 遇 frozen 不動。
//   L118-CAFE2-STUDY-1030「慢讀咖啡為什麼不能念書」：118 巷店面的座位沒有標 study（只有標 study 的座位才有「讀書」）。修：慢讀（cafe2）的桌位標 study、吧檯高腳椅不算。
// 修改前（postrel-1030 99c7be7d5）：FAILED 5。用法：node tests/badclip_follow_cafe2_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const BAD=rd('src/badminton_clip3d.js'), ENG=rd('src/engine3d.js'), L118=rd('src/l118_shops3d.js'), LAY=rd('src/data/l118_shop_layouts.js');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
check('1. 羽球短片 keep 記下 beh',/keep\.push\(\{e,[^}]*beh:e\.beh,/.test(BAD));
check('1. place()：對手是 follow／buddy／passenger 的先換成 idle（玩家不動）',/const place=\(e,x,z,yaw\)=>\{[^}]*if\(e!==P1&&\(e\.beh==='follow'\|\|e\.beh==='buddy'\|\|e\.beh==='passenger'\)\) e\.beh='idle';/.test(BAD));
check('1. 演完（finally）照 keep 還原 beh',/if\(k\.beh!==undefined&&e!==P1\) e\.beh=k\.beh;/.test(BAD));
check('2. engine：follow／buddy 遇 frozen 不跟著走',/else if\(\(\(n\.beh==='follow'&&E\.player\)\|\|\(n\.beh==='buddy'&&n\.buddy\)\)&&!n\.frozen\)\{ if\(followStep\(n,dt\)\) moving=true; \}/.test(ENG));
check('3. 118 巷店面：慢讀（cafe2）的桌位 study:true、吧檯高腳椅（lift）不算，標籤「坐下讀書」',/const study=id==='cafe2'&&!s\.lift; IT\.push\(\{[^}]*label:s\.label\|\|\(study\?'坐下讀書':'坐下'\),study\}\)/.test(L118));
// 慢讀真的有桌位（不是全部吧檯）
{ let L=null; try{ const vm=require('vm'); const c={}; vm.createContext(c); vm.runInContext(LAY.replace(/^const L118_SHOP_LAYOUTS\s*=/m,'this.L118_SHOP_LAYOUTS='),c); L=c.L118_SHOP_LAYOUTS; }catch(e){}
  const seats=(L&&L.cafe2&&L.cafe2.seats)||[], desk=seats.filter(s=>!s.lift);
  check('3. 慢讀至少有兩個不是吧檯的座位可以讀書',desk.length>=2,JSON.stringify({all:seats.length,desk:desk.length})); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
