// 一鍵「回去睡覺」的確認框寫自己現在住的房號（BB-B 11-07 BUG-ONETAP-DORM203-1107：src/onetap3d.js 把「宿舍 203」寫死，經濟系那一年住 412）——不需要瀏覽器。
// 用真正的 src/data/dorm_layout.js＋src/dorm3d.js（DM3.homeOf：經濟系 412、大一 203、大二 312、大三 507、大四 409）＋src/onetap3d.js 的 S.where。
// 修改前 FAIL（經濟系、大二以後都寫 203）。用法：node tests/onetap_dorm_room_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE=new Proxy(function(){},{get:()=>function(){ return {}; }}); global.Z3={ZONES:{}};   /* dorm3d.js 最後把區域登記進 Z3.ZONES */
const load=(f,names)=>{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
load('src/data/dorm_layout.js',['DORM_LAYOUT']); load('src/dorm3d.js',['DM3']); load('src/onetap3d.js',['ONETAP']);
const W=(stage,flags)=>ONETAP.where({stage,flags:flags||{},day:30,hour:22}).name;
// CANON-NO-ECON-1112：經濟系那一年拿掉（經濟系 412 那一格）
const got={y1:W('law'),y2:W('law',{ROOM_Y2:true}),y3:W('law',{ROOM_Y3:true}),y4:W('law',{ROOM_Y4:true})};
check('經濟系 412、大一 203、大二 312、大三 507、大四 409',JSON.stringify(got)===JSON.stringify({y1:'宿舍 203',y2:'宿舍 312',y3:'宿舍 507',y4:'宿舍 409'}),JSON.stringify(got));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
