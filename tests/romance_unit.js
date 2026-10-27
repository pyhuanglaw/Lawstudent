// 多段感情（v6；現行規則＝企劃線 AA_140 第 0 節、AA_126 第 9 節、AA_128 4-5；使用者 2026-10-14、10-16：可以同時和多位交往）——不需要瀏覽器。
// 每一段關係各自計算：開始不因已有伴侶擋；分開只有那一段；CLEANUP_DONE 只擋分開以後開始新的一段；舊存檔補 romance／ROMANCE_HISTORY；
// 「她知道」才擋正式單獨約會：誰知道照各人的 knowsRel（BB_191 第 1、9 節：K3 選①在場、聽朋友說、祐廷自己說；阿凱一定知道可昕）；固定名單 KEXIN_KNOWN 拿掉。
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
check('10. 可昕來過烤肉（KX_MET_NOODLE_TEAM）不等於台大的人知道：固定名單拿掉（BB_191 9-4 #1；沛珊根本不在 K3）',['heroine_01','heroine_03','classmate_peishan','heroine_02','heroine_04','heroine_05'].every(x=>ROM.knows(G3,x).length===0)&&!ROM.KEXIN_KNOWN);
ROM.learn(G3,'heroine_02','kexin','yt_told'); check('11. ROM.learn：芷若知道了（knowsRel 記來源、日子）；只有她，不會傳給子晴',ROM.knows(G3,'heroine_02')[0]==='kexin'&&ROM.knows(G3,'heroine_04').length===0&&G3.flags.knowsRel.heroine_02.kexin.source==='yt_told'&&G3.flags.knowsRel.heroine_02.kexin.state==='confirmed'&&G3.flags.knowsRel.heroine_02.kexin.day===20);
check('11. 已經知道的再 learn 一次：不覆蓋第一次的來源',ROM.learn(G3,'heroine_02','kexin','told_by:heroine_04')===false&&G3.flags.knowsRel.heroine_02.kexin.source==='yt_told');
check('11. 阿凱（室友）一定知道可昕；ytKnows 預設 false',ROM.knowsGF(G3,'kai')&&!ROM.knowsGF(G3,'heroine_01')&&!ROM.ytKnows(G3,'heroine_02','kexin'));
ROM.tellBy(G3,'heroine_01','kexin'); check('11. 祐廷自己說（tellBy）：yt_told＋ytKnows（他知道她知道）',ROM.knowsGF(G3,'heroine_01')&&G3.flags.knowsRel.heroine_01.kexin.source==='yt_told'&&ROM.ytKnows(G3,'heroine_01','kexin'));
check('11. gfNow：交往中而且她知道',ROM.gfNow(G3,'heroine_01')&&!ROM.gfNow(G3,'heroine_03'));
ROM.end(G3,'kexin','apart_talk'); check('12. 和可昕分開以後：知道的人也不擋了（knows 只算現在還在交往的人）；知道過的紀錄不刪',['heroine_01','heroine_02'].every(x=>ROM.knows(G3,x).length===0)&&ROM.knowsGF(G3,'heroine_01')&&!ROM.gfNow(G3,'heroine_01'));
// K3 選①（BB_191 9-2、9-4 #2）：在場的人才知道
global.STORY={knows:(id)=>['heroine_01','yu'].includes(id)};
let G5={day:40,flags:{dating_kexin:true,KX_INTRO:'gf'}}; ROM.rec(G5);
check('13. K3 選①（舊存檔遷移也一樣）：阿哲一定在、在場（STORY.knows）的以安、Alison 知道，他也知道他們知道；不認識的語彤、柏翰，不在 K3 的沛珊、芷若不知道',['zhe','heroine_01','yu'].every(x=>ROM.knowsGF(G5,x)&&ROM.ytKnows(G5,x,'kexin')&&G5.flags.knowsRel[x].kexin.source==='ev_mid_autumn_bbq')&&['heroine_03','classmate_bohan','classmate_peishan','heroine_02'].every(x=>!ROM.knowsGF(G5,x)));
let G6={day:40,flags:{dating_kexin:true,KX_INTRO:'quiz',KX_MET_NOODLE_TEAM:true}}; ROM.rec(G6);
check('13. K3 選②③（只說是經濟系的同學）：誰都不知道（阿凱除外）',['zhe','heroine_01','yu','classmate_peishan'].every(x=>!ROM.knowsGF(G6,x))&&ROM.knowsGF(G6,'kai'));
let G7={day:40,flags:{dating_kexin:true,dating_heroine_02:true,romance:{heroine_03:{status:'none',since:null,knows:['heroine_02'],suspicion:0,history:[]}}}}; ROM.rec(G7);
check('13. 舊欄位 romance[X].knows 第一次讀檔搬到 knowsRel（source legacy）',ROM.knows(G7,'heroine_03')[0]==='heroine_02'&&G7.flags.knowsRel.heroine_03.heroine_02.source==='legacy'&&G7.flags.knowsRel_V===1);
check('13. 懷疑值不再累積：ROM.suspect、ROM.weekly 拿掉（BB_191 第 1 節）',typeof ROM.suspect==='undefined'&&typeof ROM.weekly==='undefined');
delete global.STORY;
check('14. acceptsOpen 預設 false（七位，0-3 P2）',Object.values(ROM.PARAMS.acceptsOpen).length===7&&Object.values(ROM.PARAMS.acceptsOpen).every(v=>v===false));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
