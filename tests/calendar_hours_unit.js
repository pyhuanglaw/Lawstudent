// 日曆（src/data/calendar.js）與法律學院圖書館的開放時間（D53，使用者 2026-10-13 查證台大法律圖書館官網）。不需要瀏覽器。
// 檢查：第 1 天＝2025-09-17 週三、和遊戲的星期一致；國定假日與補假（2025 年修正的新節日、春節、兒童節與清明）；學期與週次、寒暑假；
//       法圖：學期間平日 08:10–21:45、週末 09:10–17:00；寒暑假平日 09:10–17:00、週末不開；國定假日不開；閉館的說明寫下次開館與改去哪裡。
// 修改前（法圖整年每天 08:30–21:30、沒有日曆）這個測試會失敗。
// 用法：node tests/calendar_hours_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
for(const f of ['src/data/calendar.js','src/data/places.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|PLACES)\s*=/m,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const C=CALENDAR, P=PLACES;
// 日期與星期
{ const d=C.dateOf(1); check('第 1 天＝2025-09-17 週三',d.key==='2025-09-17'&&d.wd===3,JSON.stringify(d));
  let bad=[]; for(let day=1;day<=1400;day++){ const gw=(3+day-1)%7; if(C.dateOf(day).wd%7!==gw) bad.push(day); } check('每一天的星期和遊戲的 G.weekday（第 1 天 3、每睡一次 +1、週日 0）一致（1,400 天）',!bad.length,bad.slice(0,5).join(','));
  check('2026-02-28 是第 165 天、週六',C.dateOf(165).key==='2026-02-28'&&C.dateOf(165).wd===6,C.dateOf(165).key); }
// 國定假日與補假
{ const want={'2025-09-29':'教師節（補假）','2025-10-06':'中秋節','2025-10-10':'國慶日','2025-10-24':'臺灣光復節（補假）','2025-12-25':'行憲紀念日','2026-01-01':'開國紀念日',
    '2026-02-15':'除夕前一日','2026-02-16':'除夕','2026-02-17':'春節','2026-02-19':'春節','2026-02-20':'春節（補假）','2026-02-27':'和平紀念日（補假）','2026-04-03':'兒童節（補假）','2026-04-06':'民族掃墓節（補假）',
    '2026-05-01':'勞動節','2026-06-19':'端午節','2026-09-25':'中秋節','2026-09-28':'教師節','2026-10-09':'國慶日（補假）','2026-10-26':'臺灣光復節（補假）','2026-12-25':'行憲紀念日',
    '2027-02-09':'春節（補假）','2027-02-10':'春節（補假）','2027-12-31':'開國紀念日（補假）','2028-04-03':'兒童節','2028-05-29':'端午節（補假）','2029-02-16':'春節（補假）','2029-06-15':'端午節（補假）'};
  const bad=[]; for(const [k,n] of Object.entries(want)){ const got=C.holiday(dayOf(k)); if(got!==n) bad.push(k+'：'+got+'≠'+n); }
  check('國定假日與補假（2025 年新增的教師節、光復節、行憲紀念日、除夕前一日；週六提前、週日延後；春節補在連假之後；兒童節與清明同一天放前一天）',!bad.length,bad.slice(0,4).join(' | '));
  const work=['2025-09-17','2025-10-07','2025-10-20','2026-02-23','2026-04-07'];   /* 2025-10-13 是颱風假（calendar.js 的 TYPHOON，交付清單 B3），改用 10/20 */ const b2=work.filter(k=>C.holiday(dayOf(k))); check('平常的上課日不是假日',!b2.length,b2.join(',')); }
// 學期
{ const t=C.termOf(1); check('第 1 天是大一上第 3 週（9/1 開學）',t&&t.id==='Y1S1'&&t.week===3,JSON.stringify(t));
  const mid=C.termOf(dayOf('2025-10-20')), fin=C.termOf(dayOf('2025-12-15')), brk=C.termOf(dayOf('2025-12-22')); check('16 週制：第 8～9 週期中、第 16 週期末（12/15）、12/22 起寒假（AA_197 1-6）',mid&&mid.exam==='mid'&&mid.week===8&&fin&&fin.exam==='final'&&fin.week===16&&brk===null&&C.dateOf(C.gradeDay('Y1S1')).key==='2026-01-05',JSON.stringify([mid,fin,brk]));
  check('寒假（2026-01-12）不在學期裡；大一下 2026-02-23 是第 1 週',!C.termOf(dayOf('2026-01-12'))&&C.termOf(dayOf('2026-02-23')).id==='Y1S2'&&C.termOf(dayOf('2026-02-23')).week===1);
  check('kind：學期間／寒暑假／假日',C.kind(dayOf('2025-10-07'))==='term'&&C.kind(dayOf('2026-01-12'))==='break'&&C.kind(dayOf('2025-10-10'))==='holiday'&&C.kind(dayOf('2026-07-15'))==='break'); }
// 五年日曆（使用者 2026-10-13，D56：經濟系大一 2024 學年＋法律系四年，同一個世界連續運作）：2024-08 到 2029-07 每一天都算得出日期、星期、學期、假日；
// 學期依序、不重疊、每學期 1～18 週連續、學期之間有寒暑假；法律系的第 1 天不變（舊存檔不受影響）。修改前（只有法律系四年）經濟系那兩學期不存在、2024 的農曆節日沒有，這一段會失敗
{ const d0=dayOf('2024-08-01'), d1=dayOf('2029-07-31'); const seq=[], bad=[]; let prevKey=null, prevT=null, gap=true;
  for(let day=d0; day<=d1; day++){ let dt, t, h; try{ dt=C.dateOf(day); t=C.termOf(day); h=C.holiday(day); }catch(e){ bad.push(day+' 例外 '+e.message); continue; }
    if(prevKey&&Date.parse(dt.key)-Date.parse(prevKey)!==DAY) bad.push(dt.key+' 日期不連續');
    if(t){ if(!prevT||prevT.id!==t.id){ if(!gap) bad.push(dt.key+' 學期之間沒有假期'); seq.push(t.id); if(t.week!==1) bad.push(t.id+' 不是從第 1 週開始'); } else if(t.week!==prevT.week&&t.week!==prevT.week+1) bad.push(dt.key+' 週次跳號'); gap=false; } else gap=true;
    prevKey=dt.key; prevT=t; }
  check('五年日曆（2024-08～2029-07，'+(d1-d0+1)+' 天）：每一天都算得出日期、學期、假日，日期連續、週次連續、學期之間有寒暑假',!bad.length,bad.slice(0,4).join(' | '));
  check('學期的順序：經濟系大一上、下 → 法律系大一上 … 大四下（十個學期）',seq.join(',')==='Y0S1,Y0S2,Y1S1,Y1S2,Y2S1,Y2S2,Y3S1,Y3S2,Y4S1,Y4S2',seq.join(','));
  const e1=C.termOf(dayOf('2024-09-02')), e2=C.termOf(dayOf('2025-02-17')); check('經濟系大一上 2024-09-02 開學、大一下 2025-02-17 開學（AA_106，需查證）',e1&&e1.id==='Y0S1'&&e1.week===1&&e2&&e2.id==='Y0S2'&&e2.week===1,JSON.stringify([e1,e2]));
  check('經濟系大一下結束後（2025-07-15 重考的暑假）不在學期裡；法律系第 1 天照舊是 2025-09-17、大一上第 3 週',!C.termOf(dayOf('2025-07-15'))&&C.dateOf(1).key==='2025-09-17'&&C.termOf(1).id==='Y1S1'&&C.termOf(1).week===3);
  const want={'2024-09-17':'中秋節','2024-09-27':'教師節（補假）','2024-10-10':'國慶日','2024-10-25':'臺灣光復節','2024-12-25':'行憲紀念日','2025-01-01':'開國紀念日','2025-01-27':'除夕前一日','2025-01-28':'除夕','2025-01-29':'春節','2025-02-28':'和平紀念日','2025-04-03':'兒童節','2025-04-04':'民族掃墓節','2025-05-30':'端午節（補假）'};
  const b2=[]; for(const [k,n] of Object.entries(want)){ const got=C.holiday(dayOf(k)); if(got!==n) b2.push(k+'：'+got+'≠'+n); }
  check('經濟系那一年的國定假日（農曆節日 2024 的日期；放假規則照 2025 年修正後的，平行世界）',!b2.length,b2.slice(0,4).join(' | ')); }
// 法律學院圖書館的開放時間
{ const T=dayOf('2025-10-07'), SAT=dayOf('2025-10-11'), HOL=dayOf('2025-10-10'), BRK=dayOf('2026-01-13'), BRKSAT=dayOf('2026-01-17');
  const o=(day,h)=>P.isOpen('lawlib',h,day);
  check('學期間平日：08:09 沒開、08:10 開、21:44 開、21:45 關',!o(T,8.14)&&o(T,8+10/60)&&o(T,21.73)&&!o(T,21.75));
  check('學期間週六：09:09 沒開、09:10 開、16:59 開、17:00 關',!o(SAT,9.14)&&o(SAT,9+10/60)&&o(SAT,16.98)&&!o(SAT,17));
  check('學期間週日也是 09:10–17:00',o(dayOf('2025-10-12'),12)&&!o(dayOf('2025-10-12'),18));
  check('國定假日（國慶日）整天不開',[8,10,15,20].every(h=>!o(HOL,h)));
  check('寒假平日 09:10–17:00（晚上不開）',!o(BRK,8.5)&&o(BRK,9.2)&&o(BRK,16.9)&&!o(BRK,17.5)&&!o(BRK,20));
  check('寒假週末不開',[10,14].every(h=>!o(BRKSAT,h))&&!o(BRKSAT+1,12));
  check('春節連假（除夕）不開',!o(dayOf('2026-02-16'),12));
  check('不是 24 小時：學期間平日深夜、清晨都不開',!o(T,23)&&!o(T,2)&&!o(T,7.5));
  const t1=P.closedText('lawlib',22,T), t2=P.closedText('lawlib',7.5,T), t3=P.closedText('lawlib',12,HOL), t4=P.closedText('lawlib',12,BRKSAT);
  check('閉館說明（平日晚上）：寫下次開館＝明天 08:10、可以去總圖（還開著）或回宿舍',/明天 08:10/.test(t1)&&/回宿舍/.test(t1),t1);
  check('閉館說明（平日早上還沒開）：今天 08:10',/今天 08:10/.test(t2),t2);
  check('閉館說明（國慶日，週五）：寫是國定假日、下次開館是明天（週六）09:10',/國慶日/.test(t3)&&/明天 09:10/.test(t3),t3);
  check('閉館說明（寒假週六）：下次開館是下週一 09:10',/週一 09:10/.test(t4),t4);
  check('今天的開放時間一行（入口名牌、大地圖、快速前往）',P.todayText('lawlib',T)==='今天 08:10–21:45'&&P.todayText('lawlib',SAT)==='今天 09:10–17:00'&&/不開放/.test(P.todayText('lawlib',HOL)),[P.todayText('lawlib',T),P.todayText('lawlib',SAT),P.todayText('lawlib',HOL)].join(' / '));
  check('其他地點照舊（總圖 08:00–22:00、Café 跨夜）',P.isOpen('library_hall',21.9,T)&&!P.isOpen('library_hall',22.1,T)&&P.isOpen('cafe',1,T)&&!P.isOpen('cafe',3,T)); }
// 社科院 辜振甫先生紀念圖書館（D62，使用者 2026-10-14 查證館方網頁）：週六、週日的時間不一樣。修改前（沒有時間＝整天開）這一段會失敗
{ const T=dayOf('2025-10-07'), SAT=dayOf('2025-10-11'), SUN=dayOf('2025-10-12'), HOL=dayOf('2025-10-10'), BRK=dayOf('2026-01-13'), BSAT=dayOf('2026-01-17'), BSUN=dayOf('2026-01-18');
  const o=(day,h)=>P.isOpen('soclib',h,day);
  check('辜振甫 學期間平日：08:19 沒開、08:20 開、21:59 開、22:00 關',!o(T,8.3)&&o(T,8+20/60)&&o(T,21.98)&&!o(T,22));
  check('辜振甫 學期間週六 09:00–22:00',!o(SAT,8.9)&&o(SAT,9)&&o(SAT,21.9)&&!o(SAT,22));
  check('辜振甫 學期間週日 09:00–17:00（和週六不一樣）',!o(SUN,8.9)&&o(SUN,9)&&o(SUN,16.9)&&!o(SUN,17)&&!o(SUN,20));
  check('辜振甫 寒暑假平日 08:20–21:00',!o(BRK,8.3)&&o(BRK,8.34)&&o(BRK,20.9)&&!o(BRK,21));
  check('辜振甫 寒暑假週六 09:00–17:00、週日不開',o(BSAT,9)&&o(BSAT,16.9)&&!o(BSAT,17)&&[9,12,16].every(h=>!o(BSUN,h)));
  check('辜振甫 國定假日（國慶日）、春節（除夕）不開',[9,12,20].every(h=>!o(HOL,h))&&!o(dayOf('2026-02-16'),12));
  const t1=P.closedText('soclib',22.5,T), t2=P.closedText('soclib',18,dayOf('2025-10-19')),   /* 學期間週日 18:00：10/12 的隔天是颱風假，改用 10/19 */ t3=P.closedText('soclib',12,BSUN), t4=P.closedText('soclib',12,HOL);
  check('辜振甫 閉館說明（平日晚上）：明天 08:20',/社科院圖書館/.test(t1)&&/明天 08:20/.test(t1),t1);
  check('辜振甫 閉館說明（學期間週日 18:00）：明天（週一）08:20',/明天 08:20/.test(t2),t2);
  check('辜振甫 閉館說明（寒假週日）：寫「寒暑假的週日」（不是「週末」：寒假週六有開）、明天 08:20',/寒暑假的週日/.test(t3)&&/明天 08:20/.test(t3),t3);
  check('辜振甫 閉館說明（國慶日，週五）：寫國慶日、下次是明天（週六）09:00',/國慶日/.test(t4)&&/明天 09:00/.test(t4),t4);
  check('辜振甫 今天的開放時間一行',P.todayText('soclib',T)==='今天 08:20–22:00'&&P.todayText('soclib',SAT)==='今天 09:00–22:00'&&P.todayText('soclib',SUN)==='今天 09:00–17:00'&&P.todayText('soclib',BSAT)==='今天 09:00–17:00',[T,SAT,SUN,BSAT].map(d=>P.todayText('soclib',d)).join(' / '));
  const tx=(P.hours.soclib||{}).text||''; check('辜振甫 時間說明寫週六、週日各自的時間',/週六 09:00–22:00/.test(tx)&&/週日 09:00–17:00/.test(tx)&&/週日不開/.test(tx),tx);
  check('法圖照舊：寒假週末兩天都不開（沒有 sat／sun 的地點用 we）',!P.isOpen('lawlib',12,BSAT)&&!P.isOpen('lawlib',12,BSUN)&&/寒暑假的週六/.test(P.todayText('lawlib',BSAT))); }
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);
