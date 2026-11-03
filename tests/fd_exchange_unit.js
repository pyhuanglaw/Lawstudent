// 交換路線（JP、US）的延畢重修（CC_K1_exchange，BB 10:21）——不需要瀏覽器。src/faildelay3d.js＋y5s1_3d.js＋classes3d.js＋study3d.js＋r2y4b3d.js＋postgrad3d.js
//   K1-1  美國路線大四上人在美國：手機「法律」頁的「這學期」不列台灣大四上的課（STUDY.courses current＝空）；CLS.examList 也是空的；大四下照常
//   K1-2  美國路線大四下被當海商法：大五上的重修排得到（Y5.classItems 至少 3 堂），課表（FD.slots／CLS.weekHTML）列的時段＝今日頁真的排的時段，不和週一、週三補修撞
//   K1-3  被當三次的保險法（原本週二上午）：大五上的重修不和週二 10:00 的法律實習（交換版）撞；被當延畢（沒有交換）的時段照舊
//   BB 10:21  交換延畢又被當：12/24 不到三堂＝證書延到 2030-06（FAIL_DELAY_CERT）、12/26 旁白、2030-06-17 系辦領證書、1/21 證書不演、日期卡照被當延畢；
//             畢業後篇跳日期停在重修上課前（FD.clsStop）；交換延畢沒有被當的照舊
// 修改前（開發分支 c2d0c24bc）：K1-1、K1-2、K1-3、BB 10:21 的檢查都 FAIL。用法：node tests/fd_exchange_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(FD|Y5|R2Y4B|R2Y4B_EVENTS|STUDY|STUDY_UNITS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY=global.CG_REGISTRY||{};
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
const D=k=>PG.DK(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const K=s=>s.wd+':'+s.block;
const r=CALENDAR.termDays('Y5S1');
/* 大五上每一天 classItems 的重修時段（'wd:block'）、堂數 */
const realSlots=(G,id)=>{ const S=new Set(); let n=0; for(let d=r.from;d<=r.to;d++) for(const it of Y5.classItems(G,d)) if(it.fd&&it.c.id===id){ S.add(K(it.slot)); n++; } return {S,n}; };
const fdSlots=(G,id)=>new Set(FD.slots(G).filter(x=>x.c.id===id).map(x=>K(x.slot)));
const delayG=(key,h,flags)=>H.fresh(key,h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other'},flags||{}));

(async()=>{
await sec(0,()=>{ check('0. 載得到 FD、Y5、STUDY、R2Y4B',typeof FD!=='undefined'&&typeof Y5!=='undefined'&&typeof STUDY!=='undefined'&&typeof R2Y4B!=='undefined'); });

/* ---------- K1-1 ---------- */
await sec(1,()=>{ H.fresh('2028-10-09',10,'dorm',{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true});
  check('1. 前提：美國路線的大四上是人在國外的學期（CLS.termAway）',CLS.termAway(H.G,'Y4S1')===true&&(CALENDAR.termOf(H.G.day)||{}).id==='Y4S1');
  const cur=STUDY.courses(H.G).filter(e=>e.current);
  check('1. K1-1 美國路線大四上：「法律」頁的「這學期」沒有台灣的課',cur.length===0,J(cur.map(e=>e.c.id)));
  check('1. K1-1 CLS.termCourses(Y4S1)、CLS.examList(Y4S1) 是空的（同一個原因，CC INFO-4）',CLS.termCourses(H.G,'Y4S1').length===0&&CLS.examList(H.G,'Y4S1').length===0,J(CLS.examList(H.G,'Y4S1').map(x=>x.c&&x.c.id)));
  H.fresh('2028-10-09',10,'dorm',{EXCHANGE_ROUTE:'TW'}); const tw=STUDY.courses(H.G).filter(e=>e.current);
  check('1. 對照：台灣路線大四上照列（考五題的課）、examList 照排',tw.length>0&&CLS.examList(H.G,'Y4S1').length>0,tw.length+'');
  H.fresh('2029-03-12',10,'dorm',{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true,US_RETURNED:D('2028-12-23')});
  check('1. 美國路線大四下（回國以後）照常有課、有期末考',CLS.termCourses(H.G,'Y4S2').length>0&&CLS.examList(H.G,'Y4S2').length>0&&STUDY.courses(H.G).some(e=>e.current)); });

/* ---------- K1-2 ---------- */
await sec(2,()=>{ delayG('2029-09-03',8,{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true,US_RETURNED:D('2028-12-23'),FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY_V:2});
  check('2. 前提：美國路線交換延畢、大五上',Y5.us(H.G)&&!!Y5.term(H.G,D('2029-09-05')));
  const {S:real,n}=realSlots(H.G,'maritime'), fs_=fdSlots(H.G,'maritime');
  check('2. K1-2 被當海商法（原本週三上午）：大五上排得到重修，至少 3 堂',n>=3,'n='+n);
  check('2. K1-2 課表（FD.slots）列的時段＝今日頁真的排的時段',fs_.size>0&&J([...fs_].sort())===J([...real].sort()),J([...fs_])+' vs '+J([...real]));
  check('2. K1-2 重修不和補修（週一、週三上午）同一時段',![...fs_].some(k=>k==='1:am'||k==='3:am'),J([...fs_]));
  { let wed=r.from; while(CALENDAR.dateOf(wed).wd!==3||CALENDAR.holiday(wed)) wed++; const its=Y5.classItems(H.G,wed);
    check('2. 週三上午照舊是補修：法律倫理',its.some(it=>it.label==='補修：法律倫理'&&it.slot.block==='am'),J(its.map(x=>x.label))); }
  const s=FD.slots(H.G).find(x=>x.c.id==='maritime'), blk=COURSES.blocks[s.slot.block];
  let d=r.from; while(CALENDAR.dateOf(d).wd!==s.slot.wd||CALENDAR.holiday(d)) d++; H.G.day=d; H.G.hour=8;
  const wk=CLS.weekHTML(H.G), want=CLS.WD[s.slot.wd]+' '+CLS.hhmm(blk.t0)+'–'+CLS.hhmm(blk.t1);
  const row=(new RegExp('重修：'+FD.cname('maritime')+'</b><div class="muted">([^<]*)</div>').exec(wk)||[])[1]||'';
  check('2. K1-2 課表（CLS.weekHTML）上「重修：海商法與海洋法」寫的是真的那一節（'+want+'），不是週三上午',row.indexOf(want)===0,row);
  /* FD.items、FD.clsStop 讀同一份 */
  const it=FD.items(H.G,d).find(x=>x.c.id==='maritime'); check('2. FD.items 那一天有那一堂、時段一樣',!!it&&K(it.slot)===K(s.slot));
  H.G.day=d-1; H.G.hour=20; const st=FD.clsStop(H.G);
  check('2. （BB 10:21）FD.clsStop 停在那一堂上課前 45 分鐘',st===d*24+blk.t0-0.75,st==null?'null':PG.dateLabel(Math.floor(st/24),st%24));
  /* 民訴甲下（原本週一上午）一樣 */
  delayG('2029-09-03',8,{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true,US_RETURNED:D('2028-12-23'),FAIL_DELAY_COURSES:['civpro_2'],FAIL_DELAY_V:2});
  { const {S:a,n:m}=realSlots(H.G,'civpro_2'), b=fdSlots(H.G,'civpro_2'); check('2. K1-2 民訴甲下（原本週一上午）：排得到、課表＝今日頁',m>=3&&J([...a].sort())===J([...b].sort()),J([...a])+' vs '+J([...b])); } });

/* ---------- K1-3 ---------- */
await sec(3,()=>{ delayG('2029-09-03',8,{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true,US_RETURNED:D('2028-12-23'),FAIL_DELAY_COURSES:['insurance'],FAIL_DELAY_V:2});
  check('3. 前提：交換版週二實習',Y5.internOn(H.G));
  { const {S:real,n}=realSlots(H.G,'insurance'), f=fdSlots(H.G,'insurance');
    check('3. K1-3 美國路線保險法（原本週二上午）：重修不排在週二上午（法律實習 10:00）',!f.has('2:am')&&!real.has('2:am'),J([...f]));
    check('3. K1-3 排得到、課表＝今日頁',n>=3&&J([...real].sort())===J([...f].sort()),J([...real])+' vs '+J([...f])); }
  delayG('2029-09-03',8,{EXCHANGE_ROUTE:'JP',FAIL_DELAY_COURSES:['crimpro'],FAIL_DELAY_V:2});
  { const {S:real,n}=realSlots(H.G,'crimpro'), f=fdSlots(H.G,'crimpro');
    check('3. K1-3 日本路線刑事訴訟法（原本週二、週五上午）：不排在週二上午、兩堂都排得到、課表＝今日頁',Y5.internOn(H.G)&&!f.has('2:am')&&f.size===2&&J([...real].sort())===J([...f].sort())&&n>=6,J([...f])+' n='+n); }
  /* 被當延畢（沒有交換、沒有實習）：時段照舊 */
  delayG('2029-09-03',8,{FAIL_DELAY:true,FAIL_DELAY_COURSES:['insurance'],FAIL_DELAY_V:2});
  check('3. 對照：被當延畢（沒有交換）保險法照原本週二上午',!Y5.internOn(H.G)&&J([...fdSlots(H.G,'insurance')])===J(['2:am'])); });

/* ---------- BB 10:21：交換延畢又被當＝規則照被當延畢 ---------- */
await sec(4,async()=>{ const base={EXCHANGE_ROUTE:'JP',FAIL_DELAY_COURSES:['crimpro'],FAIL_DELAY_V:2};
  delayG('2029-12-25',8,base); const R=Y5.rec(H.G); R.cls[D('2029-09-07')+':crimpro']=1; R.cls[D('2029-09-14')+':crimpro']=1;
  check('4. 前提：交換延畢、沒有 FAIL_DELAY',PG.exchDelayed(H.G)&&!H.G.flags.FAIL_DELAY);
  FD.result(H.G); check('4. 交換延畢又被當、重修只上兩堂：證書延到 2030-06（FAIL_DELAY_CERT）',H.G.flags.FAIL_DELAY_PASS===false&&H.G.flags.FAIL_DELAY_CERT==='2030-06',J([H.G.flags.FAIL_DELAY_PASS,H.G.flags.FAIL_DELAY_CERT]));
  const st=n=>PG.STEPS.find(s=>s.id===n);
  check('4. 12/26 09:00 旁白（fd_late_note）、2030-06-17 系辦領證書（fd_late_cert）的條件成立',st('fd_late_note').cond(H.G)&&st('fd_late_cert').cond(H.G));
  check('4. 1/21 的證書（r2y4b_y5_cert）不演',!st('r2y4b_y5_cert').cond(H.G));
  check('4. 日期卡：1/22～3/14 證書在書桌上那三張不出；2/18 起「又一個學期」、6/18 起「你媽這次把框裝上了」',PG.cardLine(H.G,D('2030-01-21'),D('2030-01-30'))!=='（證書放在書桌上。你媽買了一個框，還沒裝進去。）'&&PG.cardLine(H.G,D('2030-02-19'),D('2030-03-01'))==='（二月。又一個學期。這次你每一堂都去了。）'&&PG.cardLine(H.G,D('2030-06-17'),D('2030-06-25'))==='（證書放在書桌上。你媽這次把框裝上了。）',J([PG.cardLine(H.G,D('2030-01-21'),D('2030-01-30')),PG.cardLine(H.G,D('2030-02-19'),D('2030-03-01')),PG.cardLine(H.G,D('2030-06-17'),D('2030-06-25'))]));
  H.said.length=0; await FD.lateNote(GM); check('4. 12/26 旁白兩句（{課名}＝刑事訴訟法）',H.has('（刑事訴訟法的重修，出席不到三堂。）')&&H.has('（證書，要等到六月。）'),J(H.lines()));
  /* 三堂都去了＝照交換延畢 1/21 領證書 */
  delayG('2029-12-25',8,base); { const R2=Y5.rec(H.G); for(const k of ['2029-09-07','2029-09-14','2029-09-21']) R2.cls[D(k)+':crimpro']=1; }
  FD.result(H.G); check('4. 出席三堂：過了、證書不延、1/21 照交換延畢',H.G.flags.FAIL_DELAY_PASS===true&&!H.G.flags.FAIL_DELAY_CERT&&st('r2y4b_y5_cert').cond(H.G)&&PG.cardLine(H.G,D('2030-01-21'),D('2030-01-30'))==='（證書放在書桌上。你媽買了一個框，還沒裝進去。）');
  /* 跳日期停在重修上課前 */
  delayG('2029-09-02',9,base); { const s=FD.slots(H.G)[0], blk=COURSES.blocks[s.slot.block]; let d=r.from; while(CALENDAR.dateOf(d).wd!==s.slot.wd||CALENDAR.holiday(d)) d++;
    check('4. FD.clsStop：交換延畢又被當也停在第一堂上課前 45 分鐘',FD.clsStop(H.G)===d*24+blk.t0-0.75,String(FD.clsStop(H.G)));
    check('4. FD.lateLikely：一堂都還沒上＝照目前出席算（排 12/26 的停點）',FD.lateLikely(H.G)===true); }
  /* 交換延畢沒有被當：照舊 */
  delayG('2029-09-02',9,{EXCHANGE_ROUTE:'JP',FAIL_DELAY_COURSES:[],FAIL_DELAY_V:2});
  check('4. 交換延畢、沒有被當：沒有重修停點、沒有重修',FD.clsStop(H.G)==null&&FD.slots(H.G).length===0&&!FD.retakeOn(H.G));
  H.G.day=D('2029-12-25'); FD.result(H.G); check('4. 交換延畢、沒有被當：12/24 以後證書不延、1/21 照演',!H.G.flags.FAIL_DELAY_CERT&&st('r2y4b_y5_cert').cond(H.G));
  /* 美國路線（有補修）又被當海商法、一堂都沒去 */
  delayG('2029-12-25',8,{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true,US_RETURNED:D('2028-12-23'),FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY_V:2}); FD.result(H.G);
  check('4. 美國路線又被當、重修沒去：證書延到 2030-06',H.G.flags.FAIL_DELAY_CERT==='2030-06'&&!st('r2y4b_y5_cert').cond(H.G)); });

H.done();
})();
