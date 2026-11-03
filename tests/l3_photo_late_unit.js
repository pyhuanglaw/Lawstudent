// 圓窗館前的系學會合照：從「出發」去的，到得了就要演（BUG-TOUR-PHOTO-NOEV-1103；BB 11-03 19:48，CC tap5：導覽結束 16:31 出發、16:42 到，合照一句都沒演、行程記成 done、18:00 照樣收到照片）。
// 三種：導覽結束後出發（lateTo）、按「晚一點」再出發（16:20 出發、16:30 以後到）、準時出發——到了都要演；自己走過去（沒按出發）照舊 16:30 為止。不需要瀏覽器。修改前 1、2 FAIL。用法：node tests/l3_photo_late_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/campus_l123_3d.js'),'utf8').replace(/^const CL123\s*=/m,'globalThis.CL123='),{filename:'campus_l123_3d.js'});
const ev=STORY_EVENTS.find(e=>e.id==='ev_l3_photo_1');
check('0. ev_l3_photo_1 在 STORY_EVENTS',!!ev);
const OUTS={}; global.OUT=Object.assign(global.OUT||{},{get:(G,id)=>OUTS[id]||null});
const d=40, ok=(h,q)=>{ for(const k in OUTS) delete OUTS[k]; if(q) OUTS['l123_l3_1']=Object.assign({id:'l123_l3_1',day:d,h:16,late:0.25,travelH:1/6},q); const G={day:d,hour:h,flags:{},stage:'law'};
  const inTime=h>=ev.time[0]&&h<=ev.time[1]; return inTime&&CL123.l3TimeOk(G,1); };
check('1. 導覽結束 16:31 出發（lateTo 16:31＋15 分）、16:42 到：演',ok(16+42/60,{state:'done',lateTo:d*24+16+46/60}));
check('2. 按「晚一點」、16:20 出發、16:30 到（超過原本 16:30 上限一點）：演',ok(16+31/60,{state:'done'}));
check('3. 準時 15:50 出發、16:00 到：演',ok(16,{state:'done'}));
check('4. 自己走過去（行程還是 planned、沒按出發）16:40：不演；16:20：演',!ok(16+40/60,{state:'planned'})&&ok(16+20/60,{state:'planned'}));
check('5. 按了出發但拖到很晚（17:30）：不演',!ok(17.5,{state:'done'}));
check('6. 沒有行程（經濟系、國外）16:40：不演',!ok(16+40/60,null));
H.done();
