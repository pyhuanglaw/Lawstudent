// 課表與每日上課（D52：AA_103、AA_104）——不需要瀏覽器。
// 資料：每一門課的學期、星期、時段、地點、教授都對得上（教授在 characters.js、地點在 rooms）；同一學期（選修照預設）沒有撞課；AA_103 第 4 節的課表抽查；
// 日曆：第 1 天（週三，大一上第 3 週）的課、第二天（週四）民法總則是劇情課、週末與國定假日沒有課、考試週；
// 狀態：開始前 30 分鐘可以進教室、開始後 30 分鐘還沒來＝沒來、上過的＝done；教授上課時在教室、下課後在萬才館；
// 成績單：學期結束的第一個早上發一次（文字，不是分數）；校園的門口上課點（共同教學館、體育館）站得住、從校門走得到。
// 用法：node tests/classes_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(day,hour)=>({day,hour,flags:{},weekday:CALENDAR.dateOf(day).wd%7});
// ---------- 資料 ----------
{ const L=COURSES.list, terms=['Y0S1','Y0S2','Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];   /* Y0＝經濟系那一年（AA_106、D56）*/
  const bad=[]; for(const c of L){ if(!terms.includes(c.term)) bad.push(c.id+' 學期'); if(!COURSES.rooms[c.room]) bad.push(c.id+' 地點 '+c.room); if(c.prof&&!CHARACTERS[c.prof]) bad.push(c.id+' 教授 '+c.prof); if(c.prof&&!COURSES.profs[c.prof]) bad.push(c.id+' 教授名字');
    for(const s of c.slots){ if(!(s.wd>=1&&s.wd<=5)) bad.push(c.id+' 星期'); if(!COURSES.blocks[s.block]) bad.push(c.id+' 時段'); } if(c.kind!=='service'&&(!c.topics||!c.topics.length)) bad.push(c.id+' 進度'); }   /* 服務學習沒有進度（只記次數，AA_110 6-1）*/
  check('每一門課的學期、星期、時段、地點、教授、進度都對得上（教授在 characters.js）',!bad.length,bad.slice(0,5).join(', '));
  const ids=L.map(c=>c.id); check('課程代號不重複（'+ids.length+' 門）',new Set(ids).size===ids.length&&ids.length>=45,ids.length+' 門');
  const G=mkG(1,8); const clash=[]; for(const t of terms){ const cs=CLS.termCourses(G,t); const used={}; for(const c of cs) for(const s of c.slots){ const k=s.wd+s.block; if(used[k]) clash.push(t+' '+CLS.WD[s.wd]+s.block+'：'+used[k]+'／'+c.name); used[k]=c.name; } }
  check('同一學期（選修照預設）沒有撞課',!clash.length,clash.join(' | '));
  for(const t of terms){ const n=CLS.termCourses(G,t).filter(c=>c.kind==='required').length; if(n<1) bad.push(t); } check('八個學期都有必修',terms.every(t=>CLS.termCourses(G,t).some(c=>c.kind==='required')));
  const cell=(t,wd,b)=>{ const c=CLS.termCourses(G,t).find(q=>q.slots.some(s=>s.wd===wd&&s.block===b)); return c?c.name+'｜'+(CLS.roomName(c)):'—'; };
  const want=[['Y1S1',1,'am','憲法（上）｜霖澤館 201'],['Y1S1',1,'pm2','體育｜體育館'],['Y1S1',2,'am','大一國文（上）｜博思教學館 101'],['Y1S1',4,'am','大一英文（上）｜共同教學館 102'],['Y1S1',5,'am','經濟學原理（上）｜普通教學館 101'],['Y1S1',3,'am','刑法總則（一）｜霖澤館 201'],['Y1S1',4,'pm1','民法總則｜霖澤館 201'],['Y1S1',5,'pm1','—'],
    /* X78：AA_330 搬到萬才館 */['Y2S1',2,'pm1','民法物權｜萬才館 多功能教室'],['Y3S1',1,'am','民事訴訟法甲上｜霖澤館 201'],['Y3S1',4,'am','民事訴訟法甲上｜霖澤館 201'],['Y3S1',2,'am','刑事訴訟法｜霖澤館 201'],['Y3S1',5,'am','刑事訴訟法｜霖澤館 201'],['Y4S1',2,'pm1','法律倫理｜萬才館研討室']];
  const wbad=want.filter(([t,wd,b,w])=>cell(t,wd,b)!==w).map(([t,wd,b,w])=>t+CLS.WD[wd]+b+'：'+cell(t,wd,b)+'≠'+w); check('AA_103 第 8 節的課表抽查（14 格；方案 A：國文在博思 101、經濟學原理在普通 101）',!wbad.length,wbad.join(' | '));
  const ex=CLS.termCourses(G,'Y1S2').map(c=>c.name); check('大一下：重修的經濟學原理（下）一定在課表上；法律與社會（下）沒有了（2026-10-14 課程調整刪掉，AA_130）',!ex.includes('法律與社會（下）')&&ex.includes('經濟學原理（下）'),ex.join('、'));
  G.courses={electives:{Y1S2_ls:'none'}}; const ex2=CLS.termCourses(G,'Y1S2').map(c=>c.name); check('舊的選修紀錄 Y1S2_ls 還在也不影響：課表沒有法律與社會（下），經濟學原理（下）還在',!ex2.includes('法律與社會（下）')&&ex2.includes('經濟學原理（下）'),ex2.join('、'));
  const jp=CLS.termCourses(G,'Y2S1').find(c=>c.id==='japanese_1'), jp2=CLS.termCourses(G,'Y2S2').find(c=>c.id==='japanese_2');
  check('日文上、下：大二上、下週一下午一，共同教學館（使用者 2026-10-13 遊戲安排）',jp&&jp2&&jp.slots[0].wd===1&&jp.slots[0].block==='pm1'&&CLS.roomName(jp).startsWith('共同教學館')&&CLS.roomName(jp2).startsWith('共同教學館'));
  const ep=['econ_principles_1','econ_principles_2'].map(id=>COURSES.list.find(c=>c.id===id)); check('重修經濟學原理（上下）：必修、retake、週五上午',ep.every(c=>c&&c.kind==='required'&&c.retake&&c.slots[0].wd===5&&c.slots[0].block==='am'));
  const sem=CLS.termCourses(G,'Y4S1').filter(c=>c.choice&&c.choice.group==='Y4S1_sem').map(c=>c.id); check('大四上判決研討二選一：預設刑事',sem.length===1&&sem[0]==='crim_judgment_sem',sem.join(',')); }
// ---------- 日曆上的課 ----------
{ const names=(day)=>CLS.dayItems(mkG(day,8)).map(it=>CLS.hhmm(it.t0)+' '+it.c.name).join('、');
  check('第 1 天（9/17 週三）：遊戲晚上才開始，白天的課不排、不算沒去（使用者 2026-10-15）',names(1)==='',names(1));
  check('第 2 天（週四）：遊戲 13:05 才開始，只有 13:20 民法總則（09:10 大一英文不排、不算沒去；使用者 2026-10-16）',names(2)==='13:20 民法總則',names(2));
  check('之後的週四（第 9 天）：09:10 大一英文（上）、13:20 民法總則',names(9)==='09:10 大一英文（上）、13:20 民法總則',names(9));
  const G2=mkG(2,8); check('第二天的民法總則是劇情課（story3d.js 處理），下一堂不是它',CLS.storyClass(G2,CLS.dayItems(G2)[0])&&CLS.next(mkG(2,12.5))===null,JSON.stringify(CLS.next(mkG(2,12.5))));
  check('第 3 天（週五）：09:10 經濟學原理（上）（重修）；下午一原本是法律與社會，2026-10-14 刪掉以後沒有課',names(3)==='09:10 經濟學原理（上）',names(3));
  check('週末沒有課',!CLS.dayItems(mkG(4,8)).length&&!CLS.dayItems(mkG(5,8)).length);
  check('國慶日（10/10 週五）沒有課',!CLS.dayItems(mkG(dayOf('2025-10-10'),8)).length);
  check('寒假（2026-01-14）沒有課',!CLS.dayItems(mkG(dayOf('2026-01-14'),8)).length);
  const ex=CLS.dayItems(mkG(dayOf('2025-10-22'),8)); check('第 8 週（期中考週）的課是考試',ex.length&&ex.every(it=>it.exam==='mid'),JSON.stringify(ex.map(i=>i.exam)));
  const y3=CLS.dayItems(mkG(dayOf('2027-09-09'),8)).map(it=>it.c.name).join('、'); check('大三上的週四：民訴甲上（第二格）、證券交易法',y3==='民事訴訟法甲上、證券交易法',y3); }
// ---------- 狀態、教授的位置、目標 ----------
{ const D=dayOf('2025-10-02');   /* 週四第 5 週：13:20 民法總則（原本用週五的法律與社會，2026-10-14 刪掉了）*/ const st=h=>{ const G=mkG(D,h); const it=CLS.dayItems(G).find(q=>q.c.id==='civ_general'); return CLS.status(G,it); };   /* 週四上午還有大一英文：取 13:20 那一堂 */
  check('開始前 30 分鐘以前＝還沒開始；12:50 起可以進教室；13:50 以後＝遲到（照樣可以進，使用者 2026-10-15）；下課前 30 分鐘（14:40）以後＝沒來',st(12.5)==='upcoming'&&st(12.84)==='open'&&st(13.8)==='open'&&st(13.85)==='open'&&st(14.6)==='open'&&st(14.7)==='missed'&&st(16)==='missed',[st(12.5),st(12.84),st(13.8),st(13.85),st(14.6),st(14.7)].join(','));
  { const lt=h=>{ const G=mkG(D,h); const it=CLS.dayItems(G).find(q=>q.c.id==='civ_general'); return [CLS.isLate(G,it),CLS.isLateAbsent(G,it)].map(Number).join(''); };   /* AA_137 第 4 節：1～15 分鐘＝遲到（出席）；超過 15 分鐘＝進去會記缺席 */
    check('AA_137 遲到：13:20 準時＝不算；13:25＝遲到；13:35＝遲到；13:36＝超過 15 分鐘（記缺席）',lt(13+20/60)==='00'&&lt(13+25/60)==='10'&&lt(13+35/60)==='10'&&lt(13+36.5/60)==='01',[lt(13+20/60),lt(13+25/60),lt(13+35/60),lt(13+36.5/60)].join(',')); }
  { const af=h=>{ const G=mkG(D,h); const it=CLS.dayItems(G).find(q=>q.c.id==='civ_general'); return +CLS.arriveFrac(G,it).toFixed(2); };   /* AA_137 第 8 節第 3 點：上課前 10 分鐘起陸續進來、開始時八成、開始後坐滿 */
    check('AA_137 教室的人：13:05＝0、13:10＝0.15、13:15＝約一半、13:19＝快八成、13:20 以後＝坐滿',af(13+5/60)===0&&af(13+10.01/60)>=0.15&&af(13+10.01/60)<0.16&&Math.abs(af(13+15/60)-0.475)<0.01&&af(13+19.9/60)>0.75&&af(13+20/60)===1&&af(14)===1,[af(13+5/60),af(13+10.01/60),af(13+15/60),af(13+19.9/60),af(13+20/60)].join(',')); }
  const G=mkG(D,13); const it=CLS.dayItems(G).find(q=>q.c.id==='civ_general'); CLS.rec(G).done[it.key]=1; check('上過的＝done（之後一直是 done）',CLS.status(G,it)==='done'&&CLS.status(Object.assign({},G,{hour:16}),it)==='done');
  const T=dayOf('2025-10-02');   /* 週四第 5 週：民法總則 */ const pw=h=>JSON.stringify(CLS.profWhere(mkG(T,h),'prof_zhou'));
  check('周教授：上課時（13:00～15:10）在 201、下課後 1.5 小時在萬才館、其他時間不在這兩個地方',pw(13)==='{"zone":"classroom","act":"class"}'&&pw(15.5)==='{"zone":"wancai","act":"office"}'&&pw(17)==='null'&&pw(10)==='null',[pw(10),pw(13),pw(15.5),pw(17)].join(' '));
  check('林教授（刑訴在大三）大一不會出現在教室',JSON.stringify(CLS.profWhere(mkG(dayOf('2025-09-23'),10.5),'prof_lin'))==='null');
  const g=CLS.goalFor(mkG(T,8)); check('起床時的目標：今天的課＋往下一堂教室的導航（不是「自由的一天」）',/今天的課：09:10 大一英文（上）、13:20 民法總則/.test(g.text)&&g.dest&&g.dest.zone==='gongtong'&&g.dest.label==='看看共同 102',JSON.stringify(g));
  const g2=CLS.goalFor(mkG(T,11.75)); check('英文下課前 30 分鐘以後（11:45）：目標導航改指 201（民法總則）',g2.dest&&g2.dest.zone==='classroom',JSON.stringify(g2.dest));
  const g3=CLS.goalFor(mkG(dayOf('2025-09-27'),8)); check('週六：今天沒有課、自由活動（不指路）',/今天沒有課/.test(g3.text)&&!g3.dest,JSON.stringify(g3)); }
/* 遊戲實際用的 refreshGoal（不是只測 goalFor）：週二 08:30 目標指 09:10 國文（博雅 101）；12:30 國文已經過了——目的地要換成 13:20 通識的教室（普通 101）。
   今天的課那一行整天都一樣，修改前只比文字，目的地一直停在博雅（2026-10-13 審查第 3 項） */
{ const T=dayOf('2025-10-07'); const G=Object.assign(mkG(T,8.5),{flags:{}}); const GM={G,setGoal(t,d){ G.goal=t; G.goalDest=d===undefined?null:d; }};
  CLS.setGoal(GM); const d0=G.goalDest&&G.goalDest.zone; G.hour=12.5; CLS.refreshGoal(GM); const d1=G.goalDest&&G.goalDest.zone;
  check('上完（或錯過）早上的課：導航的目的地換成下一堂的教室（博思 101 → 普通 101），目標文字照舊',d0==='boya'&&d1==='putong'&&CLS.isClsGoal(G),`${d0} → ${d1}：${JSON.stringify(G.goalDest)}`); }
/* 大四的研討課（萬才館研討室 A）：有門、導航指那扇門、上課時間門口可以上課（2026-10-13 審查第 9 項：原本沒有 wancai_seminar 這個門）*/
{ let D=null; for(let d=1;d<2000&&!D;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y4S1'&&CALENDAR.dateOf(d).wd===2&&!CALENDAR.holiday(d)&&CLS.dayItems(mkG(d,8)).some(it=>it.c.id==='legal_ethics')) D=d; }
  const G=mkG(D,13.0), g=CLS.goalFor(G), it=CLS.dayItems(G).find(q=>q.c.id==='legal_ethics');
  check('大四上週二 13:00：法律倫理在萬才館研討室 A——導航指萬才館的「研討室 A」、門口上課點存在（萬才館自己建門）',!!CLS.DOORS.wancai_seminar&&CLS.DOORS.wancai_seminar.zone==='wancai'&&g.dest&&g.dest.zone==='wancai'&&g.dest.label==='研討室 A'&&CLS.status(G,it)==='open',JSON.stringify(g.dest));
  G.hour=13.5; check('13:30：門口找得到正在上的課（liveDoor）',!!CLS.liveDoor(G,'wancai_seminar')&&CLS.liveDoor(G,'wancai_seminar').c.id==='legal_ethics'); }
/* 自學的科目清單：通識（代號 ge_*）要在清單上；國文、英文、體育不列（2026-10-13 審查第 6 項：代號從 gened 改名後通識被濾掉）*/
{ const G=Object.assign(mkG(dayOf('2025-10-07'),15),{flags:{}}); let opts=null; const GM={G,choose:async o=>{ opts=o.map(q=>q.t); return o.length-1; }};
  (async()=>{ const r=await CLS.studyPick(GM); check('自學清單有通識（電影與敘事）、沒有國文、英文、體育；最後一項「整理這週的筆記」回傳 {notes:true}',!!opts&&opts.some(t=>/通識/.test(t))&&!opts.some(t=>/國文|英文|體育/.test(t))&&r&&r.notes===true,(opts||[]).join('、'));
    let o2=null; const GM2={G,choose:async o=>{ o2=o.map(q=>q.t); return 0; }}; const r2=await CLS.studyPick(GM2,[{t:'讀學姊給的那篇文章'}]); check('選單最上面可以多放一項（研究所準備）：選了回傳 {extra:0}',!!o2&&o2[0]==='讀學姊給的那篇文章'&&r2&&r2.extra===0,JSON.stringify(r2)); })(); }
// ---------- 快速前往的時間、時間跳轉（D54 ①③）----------
{ const G=mkG(3,10); const tm=(a,b,pos,to)=>CLS.travelMinutes(G,a,b,pos,to);
  check('博雅 ⇄ 普通（隔一條路）5 分鐘、博雅 → 霖澤館比宿舍 → 霖澤館近（博雅、普通有位置，不是一律 15 分鐘）',tm('boya','putong')===5&&tm('boya','linze')<tm('dorm','linze'),[tm('boya','putong'),tm('boya','linze'),tm('dorm','linze')].join(','));
  check('九月開學前（2026-09-03，大二上 9/7 開學）寫「暑假」，不是寒假',/暑假/.test(CLS.dayLabel(mkG(dayOf('2026-09-03'),10)))&&!/寒假/.test(CLS.dayLabel(mkG(dayOf('2026-09-03'),10))),CLS.dayLabel(mkG(dayOf('2026-09-03'),10)));
  check('快速前往的時間：同一個地方 0；宿舍→霖澤館 15、宿舍→總圖 10、霖澤館→萬才館 5、霖澤館→Café 20 分鐘（照真實步行，最少 5 分鐘）',
    tm('lawlib','lawlib')===0&&tm('dorm','linze')===15&&tm('dorm','library_hall')===10&&tm('linze','wancai')===5&&tm('linze','cafe')===20,
    [tm('lawlib','lawlib'),tm('dorm','linze'),tm('dorm','library_hall'),tm('linze','wancai'),tm('linze','cafe')].join(','));
  check('校園裡的兩個地點：在附近（12 m 內）＝0、校門口→霖澤館前 ≥10 分鐘',tm('campus','campus',{x:-37,z:5},{x:-38,z:6})===0&&tm('campus','campus',{x:-112,z:0},{x:34,z:-98})>=10,
    [tm('campus','campus',{x:-37,z:5},{x:-38,z:6}),tm('campus','campus',{x:-112,z:0},{x:34,z:-98})].join(',')); }
{ const T=dayOf('2025-10-07');   /* 週二（學期間）：09:10 大一國文、13:20 通識 */
  const said=[]; const mkGM=(G,pick)=>({G,D:{active:false},E:{player:{busy:false}},toast:t=>said.push('toast:'+t),sceneBegin(){},sceneEnd(){},choose:async o=>{ said.push('choose:'+o.map(q=>q.t).join('/')); return pick; },
    fade:async()=>{},advance(hh){ G.hour+=hh; },sleep:async()=>{},caption:(w,t)=>said.push('caption:'+t),autosave(){ said.push('autosave'); },setGoal(){} });
  check('第一、二天不能跳（跟著主線）；對話中、劇情中不能跳；第三天可以',!!CLS.canSkip(mkGM(mkG(2,10)))&&!!CLS.canSkip(Object.assign(mkGM(mkG(5,10)),{D:{active:true}}))&&!!CLS.canSkip(Object.assign(mkGM(mkG(5,10)),{E:{player:{busy:true}}}))&&CLS.canSkip(mkGM(mkG(5,10)))==='');
  const at=(G,h1)=>CLS.skipStops(mkGM(G),h1).map(q=>CLS.hhmm(q.h)+' '+q.why);
  const L=Object.assign(mkG(T,20),{zone:'lawlib'}); check('人在法圖（學期間平日 21:45 閉館）從 20:00 跳到 23:00：21:35 停',at(L,23)[0]==='21:35 法律學院圖書館快關門了',at(L,23).join(' | '));
  const B=Object.assign(mkG(T,20),{zone:'library_hall'}); check('人在總圖（22:00 閉館）：21:50 停；人在 Café（02:30 才關）不停',at(B,23)[0]==='21:50 總圖書館快關門了'&&!at(Object.assign(mkG(T,20),{zone:'cafe'}),23).length,at(B,23).join(' | ')+' / '+at(Object.assign(mkG(T,20),{zone:'cafe'}),23).join(' | '));
  const I=Object.assign(mkG(T,10.5),{zone:'dorm',invites:[{day:T,h:15,accepted:true,label:'和朋友在 Café'},{day:T,h:12,accepted:false,label:'沒答應的'}]}); check('已接受的邀約前 10 分鐘停（沒答應的不算）',at(I,17)[0]==='14:50 約好的時間：和朋友在 Café'&&at(I,17).length===1,at(I,17).join(' | '));
  const c=CLS.dayItems(mkG(T,8)).find(it=>it.t0>12); const sp={w:c.week,title:'測試',content:true}; c.c.specials=(c.c.specials||[]).concat([sp]);
  check('特殊課堂（有內容的那一週）開始前 10 分鐘停；普通課堂不停',at(Object.assign(mkG(T,10.5),{zone:'dorm'}),17)[0]==='13:10 特殊課堂：'+c.c.name,at(Object.assign(mkG(T,10.5),{zone:'dorm'}),17).join(' | '));
  c.c.specials=c.c.specials.filter(q=>q!==sp);
  global.STORY_EVENTS=[{id:'t',trigger:'auto',title:'測試事件'},{id:'r',trigger:'auto',random_weight:3,title:'隨機的'}]; let GG=null; global.EVENTS={check:e=>e.id==='t'&&GG.hour%24>=16};
  GG=Object.assign(mkG(T,10.5),{zone:'dorm'}); check('會自動發生的劇情事件條件成立就停（隨機的日常不停）；檢查完時間還原',at(GG,18).some(q=>q==='16:00 測試事件')&&GG.hour===10.5,at(GG,18).join(' | '));
  delete global.STORY_EVENTS; delete global.EVENTS;
  (async()=>{ const G1=Object.assign(mkG(T,10.5),{zone:'dorm'}); said.length=0; const r1=await CLS.skipTo(mkGM(G1,1),17.5);
    check('中間會經過普通課（13:20 通識）：先問一次；選「先不要」＝時間不動',r1===false&&G1.hour===10.5&&said.some(t=>/^choose:照樣跳過\/先不要/.test(t)),said.join(' | '));
    said.length=0; const r2=await CLS.skipTo(mkGM(G1,0),17.5);
    check('選「照樣跳過」：跳到 17:30、經過的課＝沒去、存檔',r2===true&&Math.abs(G1.hour-17.5)<1e-9&&CLS.status(G1,CLS.dayItems(G1).find(it=>it.t0>12))==='missed'&&said.includes('autosave'),CLS.hhmm(G1.hour)+' '+said.join(' | '));
    const G2=Object.assign(mkG(T,18),{zone:'dorm',invites:[{day:T,h:19.5,accepted:true,label:'讀書會'}]}); said.length=0; await CLS.skipTo(mkGM(G2,0),22);
    check('跳到一半遇到邀約：停在 19:20、字幕寫原因、沒有經過課就不問',Math.abs(G2.hour-(19.5-1/6))<1e-9&&said.some(t=>/約好的時間：讀書會/.test(t))&&!said.some(t=>/^choose/.test(t)),said.join(' | '));
    const G3=Object.assign(mkG(T,23.5),{zone:'dorm'}); await CLS.skipTo(mkGM(G3,0),26); check('不跳過午夜（隔天＝睡覺）',G3.hour<24,String(G3.hour));
    /* 過了午夜還沒睡（G.hour 24.5，G.day 還是同一天；2026-10-13 審查第 1 項）：今天 09:10 的國文已經過了——不能變回「還沒開始」、HUD 不能寫「下一堂」、
       手機沒有「等到下一堂課前」、跳過時間不能跳回同一天的早上再上一次。修改前：狀態是 upcoming、跳到 G.hour 32.67 後變成 open */
    const G6=Object.assign(mkG(T,24.5),{zone:'cafe'}); const ch=CLS.dayItems(G6).find(it=>it.t0<12);
    check('00:30（還沒睡）：今天早上的課算沒去（不是「還沒開始」）、沒有「下一堂」、不在上課',CLS.status(G6,ch)==='missed'&&!CLS.next(G6)&&!CLS.live(G6,ch),CLS.status(G6,ch)+' next='+(CLS.next(G6)&&CLS.next(G6).c.name));
    const html=CLS.todayHTML(G6); said.length=0; const r6=await CLS.skipTo(mkGM(G6,0),8.67);
    check('00:30：手機沒有「跳過時間」的按鈕；硬按也不能跳（要先回宿舍睡覺），時間不動',!/data-skip=/.test(html)&&r6===false&&G6.hour===24.5&&said.some(t=>/過午夜/.test(t)),said.join(' | '));
    const G4=Object.assign(mkG(T,21+5/6),{zone:'library_hall'}); said.length=0; const r4=await CLS.skipTo(mkGM(G4,0),23);
    check('在總圖、已經在閉館前 10 分鐘以內：不能跳過閉館（先離開），時間不動',r4===false&&G4.hour===21+5/6&&said.some(t=>/總圖書館快要閉館了（22:00）/.test(t)),said.join(' | '));
    const G5=Object.assign(mkG(T,21+5/6),{zone:'library_hall'}); const r5=await CLS.skipTo(mkGM(G5,0),21.95); check('閉館前（21:57）還可以跳',r5===true&&Math.abs(G5.hour-21.95)<1e-9,String(G5.hour));
    afterSkip(); })(); }
function afterSkip(){
// ---------- 成績單、自學 ----------
{ const R={prep:{con_law1:12,crim_gen1:6,civ_general:2}}; const G=Object.assign(mkG(dayOf('2026-01-05'),7.5),{courses:R}); const rep=CLS.reportFor(G,'Y1S1');
  check('成績（文字）：法律課照準備 ≥10 很好、≥5 不錯、其他 過了；看出席的課（D43，10-14 使用者：三堂才及格）照出席寫及格／不及格；舊代號的紀錄（con_law1）自動換成新代號（const_1）',rep.const_1==='很好'&&rep.crim_gen1==='不錯'&&rep.civ_general==='過了'&&Object.keys(rep).every(id=>CLS.attCourse(CLS.byId(id))?/^不及格/.test(rep[id]):['很好','不錯','過了'].includes(rep[id]))&&rep.chinese_y1==='不及格（下學期重修）',JSON.stringify(rep));
  const said=[]; const GM={G,sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ said.push(t); },toast(t){ said.push('toast:'+t); }};
  (async()=>{ await CLS.morning(GM); const n1=said.length; await CLS.morning(GM); check('學期結束的第一個早上發成績單一次（第二次不再發）',n1>=2&&said.length===n1&&!!G.courses.grades.Y1S1,said.slice(0,2).join(' | '));
    finish(); })(); }
}
// ---------- 校園的門口上課點 ----------
function finish(){
  const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js'];
  for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
  const GM={E}; CLS.addDoors(GM,'campus'); const doors=E.interactables.filter(i=>i.door);
  check('校園有四個門口上課點（共同、普通、博思教學館、體育館）',doors.length===4,doors.map(d=>d.label).join('、'));
  for(const d of doors){ let st=null; for(let r=0;r<=1.2&&!st;r+=0.2) for(let a=0;a<12&&!st;a++){ const x=d.x+Math.cos(a/12*Math.PI*2)*r, zz=d.z+Math.sin(a/12*Math.PI*2)*r; if(E.canStand(x,zz,0.32,0)) st=[x,zz]; }
    check(d.label+'的門口（'+d.x+','+d.z+'）旁邊站得住',!!st,JSON.stringify(st)); if(!st) continue;
    const r=E.simWalk(-112,0,st[0],st[1],{lv0:0,lv1:0,dt:0.1,speed:4.8}); check(d.label+'從校門跑得到（模擬走路）',r.ok,JSON.stringify(r).slice(0,160)); }
  // ---------- 舊存檔的課程代號（2026-10-13 照 AA_103 第 8 節改代號；AA_110）----------
{ const G=mkG(30,10); G.courses={done:{'7:chinese1:am':1,'9:con_law1:am':1,'9:crim_gen1:am':1},attend:{chinese1:3,con_law1:2,anglo_law:1,legal_english:2},prep:{gened1:4},grades:{Y1S1:{con_law1:'很好',civ_general:'過了'}},
    electives:{Y1S2_elec:'econ',Y1S1_ls:'law_society'},note:{'rem_7:chinese1:am':1,'exam_Y1S1_mid':1}};
  const R=CLS.rec(G); const ok=R.done['7:chinese_y1:am']===1&&R.done['9:const_1:am']===1&&R.done['9:crim_gen1:am']===1&&!R.done['7:chinese1:am']&&R.attend.chinese_y1===3&&R.attend.const_1===2&&R.attend.legal_english===3&&R.prep.ge_film_y1s1===4&&
    R.grades.Y1S1.const_1==='很好'&&R.grades.Y1S1.civ_general==='過了'&&R.electives.Y1S2_ls===undefined&&R.electives.Y1S1_ls===undefined&&R.note['rem_7:chinese_y1:am']===1&&R.note.exam_Y1S1_mid===1&&R.idv===3;
  check('舊存檔：上課紀錄、出席、準備、成績、提醒換成新代號（英美法併進法學英文、次數相加）；法律與社會（下）的選修紀錄跟著課一起刪（idv 3，2026-10-14 課程調整）',ok,JSON.stringify(R).slice(0,300));
  const before=JSON.stringify(R); CLS.rec(G); check('轉換只做一次（再讀一次不變）',JSON.stringify(CLS.rec(G))===before); }
// 五年日曆（D56）：經濟系那一年的日期標示（畫面只寫學年、學期、日期、星期，不寫西元年份）
{ const lab=CLS.dayLabel(mkG(1,8),dayOf('2024-09-18')), lab2=CLS.dayLabel(mkG(1,8),dayOf('2025-07-15'));
  check('經濟系那一年：「9/18 週三・經濟系大一上 第 3 週」；重考的暑假寫「暑假」；都不寫西元年份',lab==='9/18 週三・經濟系大一上 第 3 週'&&lab2.endsWith('・暑假')&&!/20\d\d/.test(lab+lab2),lab+'｜'+lab2); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); }
