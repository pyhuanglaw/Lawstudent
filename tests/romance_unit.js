// 多段感情的系統（交接包 v6 第 1 節 S1～S3、S7；AA_123 第 2 節；使用者 2026-10-14「大學四年不只跟一個女生交往是成立的」）——不需要瀏覽器。
// 同一時間最多一段；開始要單身＋收拾過；分開：EX_、歷史填上 to／how、CLEANUP_DONE=false；修補歸零裂縫；舊存檔補 ROMANCE_HISTORY（可昕從經濟系那一年）。
// 修改前 ROM 不存在（第 1 項失敗）。用法：node tests/romance_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
for(const f of ['src/data/calendar.js','src/romance3d.js']){ const src=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|ROM)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
check('1. ROM 存在',typeof ROM!=='undefined'); if(typeof ROM==='undefined'){ console.log('FAILED'); process.exit(1); }
const day=CALENDAR.termDay?CALENDAR.termDay('Y2S1',6,3):60; let G={day,flags:{dating_kexin:true}};
const H=ROM.rec(G); check('2. 舊存檔：有 dating_kexin 補一筆歷史（從經濟系那一年 Y0）、CLEANUP_DONE 預設 true',H.length===1&&H[0].id==='kexin'&&H[0].from==='Y0'&&H[0].to==null&&G.flags.CLEANUP_DONE===true,JSON.stringify(H));
ROM.rec(G); check('2. 再讀一次不會重複補',G.flags.ROMANCE_HISTORY.length===1);
check('3. 交往中：不能開始另一段（同一時間最多一個）',!ROM.canStart(G,'heroine_01')&&!ROM.start(G,'heroine_01')&&!G.flags.dating_heroine_01);
ROM.crack(G,'kexin',2); ROM.mend(G,'kexin'); check('4. 修補：裂縫歸零、歷史不變',G.flags.KX_CRACK===0&&G.flags.ROMANCE_HISTORY.length===1&&G.flags.dating_kexin===true);
check('5. 分開：dating false、EX_kexin、歷史填上 to／how、CLEANUP_DONE false',ROM.end(G,'kexin','apart_life')&&G.flags.dating_kexin===false&&G.flags.EX_kexin===true&&G.flags.ROMANCE_HISTORY[0].to&&G.flags.ROMANCE_HISTORY[0].how==='apart_life'&&G.flags.CLEANUP_DONE===false,JSON.stringify(G.flags.ROMANCE_HISTORY));
check('6. 還沒收拾：不能開始新的一段',!ROM.canStart(G,'heroine_01'));
ROM.cleanup(G); check('7. 收拾以後可以開始；開始＝dating_heroine_01、歷史多一筆',ROM.start(G,'heroine_01')&&G.flags.dating_heroine_01===true&&G.flags.ROMANCE_HISTORY.length===2&&ROM.current(G)==='heroine_01');
check('8. 前任清單：kexin',JSON.stringify(ROM.exes(G))==='["kexin"]'&&ROM.isEx(G,'kexin'));
let G2={day:5,flags:{}}; ROM.rec(G2); check('9. 沒有交往過的存檔：歷史空的、CLEANUP_DONE true',G2.flags.ROMANCE_HISTORY.length===0&&G2.flags.CLEANUP_DONE===true);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
