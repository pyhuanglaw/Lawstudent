// 多段感情（v6；現行規則＝企劃線 AA_140 第 0 節、AA_126 第 9 節、AA_128 4-5；使用者 2026-10-14、10-16：可以同時和多位交往）——不需要瀏覽器。
// 每一段關係各自計算：開始不因已有伴侶擋；分開只有那一段；CLEANUP_DONE 只擋分開以後開始新的一段；舊存檔補 romance／ROMANCE_HISTORY；
// 「她知道」才擋正式單獨約會（法律系開場可昕交往中：以安、語彤、沛珊知道＝麵店團 K3 起；芷若、子晴、學姊不知道）。
// 2026-10-16 改版前（同一時間最多一段）：第 3、10、12 項失敗。用法：node tests/romance_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
for(const f of ['src/data/calendar.js','src/romance3d.js']){ const src=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|ROM)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
check('1. ROM 存在',typeof ROM!=='undefined'); if(typeof ROM==='undefined'){ console.log('FAILED'); process.exit(1); }
const day=CALENDAR.termDay?CALENDAR.termDay('Y2S1',6,3):60; let G={day,flags:{dating_kexin:true}};
const H=ROM.rec(G); check('2. 舊存檔：有 dating_kexin 補一筆歷史（從經濟系那一年 Y0）、romance.kexin＝dating、CLEANUP_DONE 預設 true',H.length===1&&H[0].id==='kexin'&&H[0].from==='Y0'&&H[0].to==null&&G.flags.CLEANUP_DONE===true&&G.flags.romance.kexin.status==='dating');
ROM.rec(G); check('2. 再讀一次不會重複補',G.flags.ROMANCE_HISTORY.length===1);
check('3. 交往中也可以開始另一段（X1：同一時間不只一段）',ROM.canStart(G,'heroine_01')&&ROM.start(G,'heroine_01')&&G.flags.dating_heroine_01===true&&G.flags.dating_kexin===true&&JSON.stringify(ROM.partners(G).sort())==='["heroine_01","kexin"]');
check('3. 已經在交往的人不能再開始一次',!ROM.canStart(G,'kexin')&&!ROM.start(G,'kexin'));
ROM.crack(G,'kexin',2); ROM.mend(G,'kexin'); check('4. 修補：裂縫歸零、歷史不變',G.flags.KX_CRACK===0&&G.flags.ROMANCE_HISTORY.length===2&&G.flags.dating_kexin===true);
check('5. 分開（只有那一段）：可昕 ex、EX_kexin、歷史填上 to／how；以安照常交往',ROM.end(G,'kexin','apart_life')&&G.flags.dating_kexin===false&&G.flags.EX_kexin===true&&G.flags.romance.kexin.status==='ex'&&G.flags.dating_heroine_01===true&&G.flags.ROMANCE_HISTORY[0].to!=null&&G.flags.ROMANCE_HISTORY[0].how==='apart_life');
check('6. 分開以後還沒收拾：不能開始新的一段（CLEANUP_DONE）',!ROM.canStart(G,'heroine_02'));
ROM.cleanup(G); check('7. 收拾以後可以開始；歷史多一筆',ROM.start(G,'heroine_02')&&G.flags.dating_heroine_02===true&&G.flags.ROMANCE_HISTORY.length===3);
check('8. 前任清單：kexin',JSON.stringify(ROM.exes(G))==='["kexin"]'&&ROM.isEx(G,'kexin'));
let G2={day:5,flags:{}}; ROM.rec(G2); check('9. 沒有交往過的存檔：歷史空的、CLEANUP_DONE true、romance 空的',G2.flags.ROMANCE_HISTORY.length===0&&G2.flags.CLEANUP_DONE===true&&Object.keys(G2.flags.romance).length===0);
// 她知道（AA_128 4-5）
let G3={day:20,flags:{dating_kexin:true}}; ROM.rec(G3);
check('10. 法律系開場可昕交往中、K3 以前：大家都還不知道',['heroine_01','heroine_03','classmate_peishan','heroine_02','heroine_04','heroine_05'].every(x=>ROM.knows(G3,x).length===0));
G3.flags.KX_MET_NOODLE_TEAM=true;
check('10. K3（中秋烤肉可昕來過）以後：以安、語彤、沛珊知道；芷若、子晴、學姊不知道',['heroine_01','heroine_03','classmate_peishan'].every(x=>ROM.knows(G3,x)[0]==='kexin')&&['heroine_02','heroine_04','heroine_05'].every(x=>ROM.knows(G3,x).length===0));
ROM.learn(G3,'heroine_02','kexin'); check('11. 祐廷親口說（ROM.learn）：芷若也知道了；只有她，不會傳給子晴',ROM.knows(G3,'heroine_02')[0]==='kexin'&&ROM.knows(G3,'heroine_04').length===0);
ROM.end(G3,'kexin','apart_talk'); check('12. 和可昕分開以後：知道的人也不擋了（knows 只算現在還在交往的人）',['heroine_01','heroine_02'].every(x=>ROM.knows(G3,x).length===0));
// 懷疑（AA_126 9-2；參數 0-3 P1）
let G4={day:30,flags:{}}; ROM.rec(G4); ROM.suspect(G4,'heroine_04',20); ROM.suspect(G4,'heroine_04',25); const s1=G4.flags.romance.heroine_04.suspicion; ROM.suspect(G4,'heroine_04',10);
check('13. 懷疑累積；已經 ≥40 再有新證據＝加倍',s1===45&&G4.flags.romance.heroine_04.suspicion===65,s1+' → '+G4.flags.romance.heroine_04.suspicion);
ROM.weekly(G4); check('13. 每週自然下降 5',G4.flags.romance.heroine_04.suspicion===60);
check('14. acceptsOpen 預設 false（七位，0-3 P2）',Object.values(ROM.PARAMS.acceptsOpen).length===7&&Object.values(ROM.PARAMS.acceptsOpen).every(v=>v===false));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
