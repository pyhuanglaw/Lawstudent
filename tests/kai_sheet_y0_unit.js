// BUG-KAI-SHEET-Y0-1031（BB-B 歷史複核第 1 批 ECON-FRIENDS，BB_218 b3bf2bd74）：經濟系那一年（Y0S1／Y0S2）還不認識的阿凱傳了四次「泡麵評鑑表」（dp_kai_sheet）。
// 原因：story3d.js DAILY 的 kai_sheet term 只排除 /^Y1/（大一同房時是房間物件），把經濟系那年的 Y0 也算進去。不需要瀏覽器。
//   1 term：Y0S1、Y0S2、Y1S1、Y1S2 不出；Y2S1 起照舊  2 經濟系那一年每天跑手機小事 70 天：一則 dp_kai_sheet 都沒有  3 對照：大二上照舊收得到
//   4 舊存檔（經濟系那年已經收過三次＝dpN 3）：大二上從第 1 種開始，四種都收得到；法律系以後收的照算（只退 2025-09-01 以前的）
// 修改前（開發分支 23f790ab2）：1、2 FAIL。用法：node tests/kai_sheet_y0_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM,E}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const dp=(STORY.DAILY_PHONE||[]).find(x=>x.id==='kai_sheet');
check('0. kai_sheet 在 DAILY_PHONE',!!dp);
const T=k=>CALENDAR.termOf(D(k));
const cases=[['2024-10-01',false],['2025-03-10',false],['2025-10-01',false],['2026-03-10',false],['2026-10-01',true],['2027-10-01',true]];
check('1. term：經濟系 Y0S1／Y0S2、法律系大一 Y1S1／Y1S2 不出；大二起照舊',!!dp&&cases.every(([k,want])=>!!dp.term(T(k))===want),J(cases.map(([k])=>[k,T(k)&&T(k).id,!!(dp&&dp.term(T(k)))])));
const sim=(k0,days,econ)=>{ const G=H.fresh(k0,8,'dorm',{}); if(econ) G.stage='econ'; G.outings=[]; G.acts={att:{}}; H.FAMILIAR('kai'); E.player.busy=false; E.paused=false;
  const d0=G.day; for(let d=d0;d<d0+days;d++){ G.day=d; G.weekday=wdOf(d); for(const h of [8,12,18,21,21.9,22.5,23.5]){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); } }
  return (G.msgs||[]).filter(m=>/^dp_kai_sheet/.test(m.tag||'')).map(m=>keyOf(m.day)+' '+m.text); };
const y0=sim('2024-09-23',70,true);
check('2. 經濟系那一年（2024-09-23 起 70 天、阿凱設成有點熟）：沒有泡麵評鑑表',y0.length===0,J(y0));
const y2=sim('2026-09-21',70,false);
check('3. 對照：大二上 70 天照舊收得到（至少一次）',y2.length>=1,J(y2));
const old=(()=>{ const G=H.fresh('2026-09-21',8,'dorm',{}); G.outings=[]; G.acts={att:{}}; H.FAMILIAR('kai'); E.player.busy=false; E.paused=false;
  const F=G.flags; F.dpN={kai_sheet:3}; F.dpDayOf={kai_sheet:D('2024-11-19')};
  G.msgs=G.msgs||[]; for(const [n,k] of [[0,'2024-09-24'],[1,'2024-10-22'],[2,'2024-11-19']]) for(const j of [0,1]) G.msgs.push({th:'p:kai',from:'kai',text:'x',day:D(k),h:21.8,tag:'dp_kai_sheet_'+n+'_'+j});
  const d0=G.day, got=[], seen=new Set(); for(let d=d0;d<d0+130;d++){ G.day=d; G.weekday=wdOf(d); for(const h of [8,12,18,21,21.9,22.5,23.5]){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); }
    for(const m of (G.msgs||[])) if(/^dp_kai_sheet/.test(m.tag||'')&&m.day>=d0&&!seen.has(m.tag)){ seen.add(m.tag); got.push(m.text); } }   /* 手機有 200 則上限，每天收一次 */
  return {got, n:F.dpN.kai_sheet, fix:F.KAI_SHEET_Y0FIX, y0n:F.KAI_SHEET_Y0N}; })();
check('4. 舊存檔（經濟系那年收過三次）：大二上起從第 1 種開始、四種八則都收到（dpN 照舊往上數 3→7、tag 不撞經濟系那年的）；只修一次',old.got[0]==='表更新了'&&old.got[6]==='這款我給負分 你不要買'&&old.got.length===8&&old.n===7&&old.fix===1,J(old));
H.done();
