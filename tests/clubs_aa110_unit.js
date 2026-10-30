// 社團（AA_110 第 6-8 節，AA 暫定）：吉他社、法服讀書會、社團博覽會、系籃、社課旁白——不需要瀏覽器。
// 使用者 2026-10-13 試玩：「沒事做的時間太長了」——AA：空的是下課以後；6-8 回答 LAWWW 問的四件事。
// 檢查：日期、星期、週次（考試週、放假不辦）；萬才館多功能教室、研討室 A 的門口參加（還沒開始寫幾點、參加過寫參加過、平常照舊是門鎖著）；
//   同一場社課只播一個：吉他社還沒認識子晴的第一次自動播 ev_ziqing_club 的初遇，之後播旁白；法服讀書會第一次播 ev_studygroup_wed 整段、之後旁白＋題庫兩三題（學姊問）；
//   旁白同一學期照順序、每句最多一次，用完只顯示「社課結束了。」；週三晚上兩個只能選一個；博覽會（舊局 9/30、10/1；新局 9/6，10:00–16:00，CLUBFAIR-REAL-1027）服務台的選單＝十五攤，能加入的填表就加入、已加入的寫已加入；
//   系籃在球場（醉月湖東側，2026-10-14 從體育館門口搬過去）「去練球」→ 轉暗 → 19:00 → 旁白；子晴的作息只有第 5～7、10～16 週的週一、三 19–21 在萬才館；
//   ev_ziqing_club 冷卻 7 天、「為什麼不去比賽？」整個存檔只出現一次（BB_95 2-6 改了選項文字）；ev_studygroup_wed 不會因為走進萬才館就自己開始（trigger 'activity'）。
// 用法：node tests/clubs_aa110_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES|CLUB_FAIR|CLUBFAIR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/classes3d.js','src/data/club_fair.js','src/clubfair3d.js']) load(f);   /* 博覽會的攤位（CLUBFAIR-REAL-1027）：classes3d.js 的 fairMenu 交給 clubfair3d.js */
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
/* 換掉會碰到 3D／ADV 的部分：人物事件、人物記憶、題庫只記下有沒有被叫到 */
const MEM={}, ran=[], asked=[]; let log=[];
SOCIAL.has=(id,tag)=>!!(MEM[id]&&MEM[id].includes(tag));
EVENTS.run=async ev=>{ ran.push(ev.id); log.push('〔事件 '+ev.id+'〕'); for(const p of ev.participants||[]){ (MEM[p]=MEM[p]||[]).includes('FIRST_MET')||MEM[p].push('FIRST_MET'); } G.events.done[ev.id]=(G.events.done[ev.id]||0)+1; G.events.last[ev.id]=G.day; };
global.LEGAL={ask:async(spec)=>{ asked.push(spec.by+':'+spec.context); log.push('〔題目 '+spec.by+'〕'); return true; }};
STORY.present=()=>true;
let answers=[], chose=[], caps=[];
let G;
const GM={get G(){ return G; },E:{zone:null,interactables:[],player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},
  sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push(t); },toast(){},caption:(a,t)=>{ caps.push(t); log.push('〔字幕〕'+t); },autosave(){},setGoal(){},
  choose:async o=>{ chose.push(o.map(q=>q.t)); return answers.length?answers.shift():0; },fade:async on=>{ if(on) log.push('〔轉暗〕'); },sleep:async()=>{},advance(h){ G.hour+=h; },energy(){},money(){}};
const fresh=(day,hour)=>{ G={day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:'wancai',flags:{},events:{done:{},last:{}},energy:80,goal:'',goalDest:null}; EVENTS.bind(GM); log=[]; chose=[]; caps=[]; answers=[]; return G; };
const A=id=>ACTIVITIES.list.find(a=>a.id===id);
const dOf=(w,wd)=>{ for(let d=1;d<200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===w&&CALENDAR.dateOf(d).wd===wd) return d; } return null; };
const W=[5,6,7,10,11,12,13,14,15];   /* 16 週制：第 16 週期末，社課停（AA_197 1-1）*/
(async()=>{
  /* A：資料 */
  const g=A('club_guitar'), l=A('lawclub_study'), x=A('club_expo_y1s1'), b=A('dept_basketball');
  check('四筆都在、story:false：吉他社（萬才館多功能教室，門口）、法服讀書會（研討室 A，門口）、博覽會（椰林大道）、系籃（體育館門口）',!!(g&&l&&x&&b)&&[g,l,x,b].every(a=>a.story===false)&&g.zone==='wancai'&&g.room==='multi'&&g.door&&l.room==='seminarA'&&l.door&&x.zone==='campus'&&x.spot&&b.zone==='campus'&&b.spot);
  check('時間：吉他社週一、三 19–21；法服週三 19–21；系籃週五 17:30–19:00；博覽會新局 9/6、舊局 9/30、10/1，10–16（CLUBFAIR-REAL-1027，AA_485 3-2）；社團都在第 5～7、10～15 週（16 週制：第 16 週期末考，社課停，AA_197 1-1）',JSON.stringify(g.weekdays)==='[1,3]'&&g.t0===19&&g.t1===21&&l.weekday===3&&l.t0===19&&b.weekday===5&&b.t0===17.5&&b.t1===19&&JSON.stringify(x.dates)==='["2025-09-06"]'&&JSON.stringify(x.datesOld)==='["2025-09-30","2025-10-01"]'&&x.t0===10&&x.t1===16&&[g,l,b].every(a=>JSON.stringify(a.weeks)===JSON.stringify(W)));
  check('旁白：吉他社 6、法服 5、辯論社 6、登山社 5、系籃 5 句（AA 6-8 (d) 的表），都沒有人物的名字',[[g,6],[l,5],[A('club_debate'),6],[A('club_hiking'),5],[b,5]].every(([a,n])=>(a.narr||[]).length===n)&&[g,l,b,A('club_debate'),A('club_hiking')].every(a=>a.narr.every(t=>!Object.values(CHARACTERS).some(c=>c.name&&t.includes(c.name)))));
  const mon5=dOf(5,1), wed5=dOf(5,3), tue5=dOf(5,2), mon4=dOf(4,1), mon8=dOf(8,1), fri5=dOf(5,5);
  const monOK=W.map(w=>dOf(w,1)).find(d=>d&&!CALENDAR.holiday(d)), wedOK=W.map(w=>dOf(w,3)).find(d=>d&&!CALENDAR.holiday(d)), friOK=W.map(w=>dOf(w,5)).find(d=>d&&!CALENDAR.holiday(d));
  check('吉他社：社團週的週一、三有，週二、第 4 週、第 8 週（期中考）沒有；放假的週一不辦',ACTIVITIES.on(g,monOK)&&ACTIVITIES.on(g,wedOK)&&!ACTIVITIES.on(g,tue5)&&!ACTIVITIES.on(g,mon4)&&!ACTIVITIES.on(g,mon8)&&W.map(w=>dOf(w,1)).filter(d=>d&&CALENDAR.holiday(d)).every(d=>!ACTIVITIES.on(g,d)),'放假的週一：'+W.map(w=>dOf(w,1)).filter(d=>d&&CALENDAR.holiday(d)).map(d=>CALENDAR.dateOf(d).key).join(','));
  /* B：多功能教室的門口 */
  fresh(monOK,18.5); await CLS.roomDoor(GM,'wancai','multi',{look:'多功能教室。這個時段沒有排課，門鎖著。'});
  check('週一 18:30 按多功能教室的門：「吉他社社課：今天 19:00 在這裡」，不能參加',!chose.length&&/吉他社社課：今天 19:00 在這裡/.test(caps[0]||''),caps[0]);
  /* AA 2026-10-13 P2：沒有社課的日子按多功能教室的門，寫社課的時間＋「今天沒有社課。」（原本只寫「門鎖著」，玩家不知道什麼時候來）*/
  const LOOK='多功能教室。這個時段沒有排課，門鎖著。', WHEN='吉他社社課：每週一、三 19:00–21:00，萬才館 多功能教室（第 5 週起）。';
  fresh(monOK+1,19.1); await CLS.roomDoor(GM,'wancai','multi',{look:LOOK});
  check('週二按多功能教室的門：「吉他社社課：每週一、三 19:00–21:00，萬才館 多功能教室（第 5 週起）。今天沒有社課。」',!chose.length&&caps[0]===WHEN+'今天沒有社課。',caps[0]);
  fresh(monOK,20.5); await CLS.roomDoor(GM,'wancai','multi',{look:LOOK});
  check('週一 20:30（社課過了一半、不能再參加）：不說「今天沒有社課」，說「已經過了一半」',!chose.length&&caps[0]===WHEN+'今天的社課已經過了一半，下次再來。',caps[0]);
  fresh(monOK,21.5); await CLS.roomDoor(GM,'wancai','multi',{look:LOOK});
  check('週一 21:30（結束了）：「今天的社課已經結束了。」',!chose.length&&caps[0]===WHEN+'今天的社課已經結束了。',caps[0]);
  fresh(dayOf('2026-02-10'),19.1); await CLS.roomDoor(GM,'wancai','multi',{look:LOOK});
  check('寒假（不是吉他社的學期）：照舊是門鎖著',!chose.length&&caps[0]===LOOK,caps[0]);
  fresh(monOK+1,19.1); await CLS.roomDoor(GM,'wancai','seminarA',{door:'wancai_seminar'});
  check('週二按研討室 A 的門：法服讀書會已經停用（AA_218 17-4），不寫它的時間（AA_372 第 1 項：原本「法服讀書會：每週三 19:00–21:00，法律系館B 研討室 A（第 5 週起）。今天沒有社課。」）；同一間別的讀書會（公法讀書會，週四）照寫，後面照舊是研討室的說明和今天的課',!chose.length&&/研討室 A：法律系館B二樓的小教室/.test(caps[0]||'')&&!/法服|每週三/.test(caps[0]||''),caps[0]);
  { const l0=ACTIVITIES.list.find(a=>a.id==='lawclub_study'); check('AA_372 第 1 項：博覽會選單、填表後那句的法服時間是「隔週週六上午，法律系館B一樓（法律服務）」，不是停用的週三讀書會',CLS.clubWhen(l0)==='隔週週六上午，法律系館B一樓（法律服務）'&&CLS.clubWhen(ACTIVITIES.list.find(a=>a.id==='club_guitar'))!=='隔週週六上午，法律系館B一樓（法律服務）',CLS.clubWhen(l0)); }
  { const ev=STORY_EVENTS.find(e=>e.id==='ev_kai_mentions_ziqing'), g=ev&&ev.dialogue.find(d=>d.choice).choice[0].consequences.goal;
    check('阿凱轉述子晴、問「什麼時候？」的目標：「吉他社：第 5 週起，週一、週三 19:00，萬才館一樓多功能教室」（AA P2；原本「萬才館」沒寫哪一間、沒寫第 5 週起）',g==='吉他社：第 5 週起，週一、週三 19:00，法律系館B一樓多功能教室',g);
    const i=ev.dialogue.findIndex(d=>d.label==='when'), line=ev.dialogue[i+1]&&ev.dialogue[i+1].text;   /* f99f664 只改了目標、阿凱這句沒改到（還寫「萬才館旁邊的社辦」），2026-10-14 補上 */
    check('阿凱接著說的時間地點和目標一致：「第五週開始，週一、週三晚上七點，在B館一樓的多功能教室。她說不用會彈。」（AA_110）',line==='第五週開始，週一、週三晚上七點，在B館一樓的多功能教室。她說不用會彈。'&&!/社辦/.test(JSON.stringify(ev.dialogue)),line); }
  /* C：吉他社——還沒認識子晴：第一次自動播初遇、不播旁白 */
  fresh(monOK,19.1); delete MEM.heroine_04; ran.length=0; await CLS.roomDoor(GM,'wancai','multi',{});
  check('19:06 按門：「參加：吉他社社課」→ 參加',(chose[0]||[])[0]==='參加：吉他社社課'&&ACTIVITIES.attended(G,'club_guitar',G.day),JSON.stringify(chose[0]));
  check('還沒認識子晴：社課一開始自動播 ev_ziqing_club（初遇、寫 FIRST_MET），這一場不播旁白；算出席、加入（CLUB_club_guitar）、到 21:00',ran.join()==='ev_ziqing_club'&&SOCIAL.has('heroine_04','FIRST_MET')&&!log.some(t=>g.narr.includes(t))&&G.flags.CLUB_club_guitar===true&&Math.abs(G.hour-21)<0.01,JSON.stringify(log));
  await CLS.roomDoor(GM,'wancai','multi',{}); check('同一天再按：「今天的「吉他社社課」你參加過了。」',/你參加過了/.test(caps[caps.length-1]||''),caps[caps.length-1]);
  /* D：已經認識：旁白照順序、每句一次，用完只有「社課結束了。」*/
  const clubDays=[]; for(const w of W) for(const wd of [1,3]){ const d=dOf(w,wd); if(d&&!CALENDAR.holiday(d)) clubDays.push(d); }
  G={day:clubDays[0],hour:19.1,weekday:0,zone:'wancai',flags:{},events:{done:{},last:{}}}; ran.length=0; const narrSeen=[];
  for(let k=0;k<8;k++){ G.day=clubDays[k]; G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=19.1; log=[]; caps=[]; await CLS.attendActivity(GM,g,{door:true}); narrSeen.push((log.find(t=>g.narr.includes(t))||'')+'｜'+(caps[caps.length-1]||'')); }
  check('已經認識子晴：不再自動播事件；旁白照順序 6 句、每句一次，第 7、8 次只有「社課結束了。」',!ran.length&&narrSeen.slice(0,6).every((t,i)=>t.startsWith(g.narr[i]))&&narrSeen.slice(6).every(t=>t==='｜社課結束了。'),JSON.stringify(narrSeen.map(t=>t.slice(0,10))));
  { G={day:clubDays[1],hour:19.1,weekday:3,zone:'wancai',flags:{},events:{done:{},last:{}}}; log=[]; await CLS.attendActivity(GM,g,{door:true}); const i=log.indexOf('〔轉暗〕'), j=log.indexOf(g.narr[0]); check('吉他社：轉暗 → 旁白 → 社課結束了',i>=0&&j>i,JSON.stringify(log)); }
  check('換學期旁白從頭開始（同一學期才不重複）',(()=>{ G={day:clubDays[0],hour:19.1,weekday:1,flags:{},acts:{narr:{'club_guitar@Y1S1':6}}}; const a1=CLS.clubNarr(G,g); let d2=null; for(let d=150;d<400&&!d2;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S2') d2=d; } G.day=d2; const a2=CLS.clubNarr(G,g); return a1===''&&a2===g.narr[0]; })());
  /* E：法服讀書會停用（AA_236 A1；使用者 AA_218 17-4：法服沒有讀書會也沒有社課）：週三研討室 A 的門沒有「參加：法服讀書會」，也不演、不出題 */
  fresh(wedOK,19.05); ran.length=0; asked.length=0; G.flags={}; await CLS.roomDoor(GM,'wancai','seminarA',{door:'wancai_seminar'});
  check('研討室 A 的門（週三晚上）：沒有「參加：法服讀書會」、不演事件、不出題、不記 lawclub',!ACTIVITIES.on(l,wedOK,G)&&!(chose[0]||[]).some(t=>/法服讀書會/.test(t))&&!ran.length&&!asked.length&&!G.flags.lawclub,JSON.stringify([chose[0],log.slice(0,3)]));
  /* F：週三晚上只能選一個 */
  fresh(wedOK,19.1); MEM.heroine_04=['FIRST_MET']; G.events.done.ev_studygroup_wed=1; await CLS.roomDoor(GM,'wancai','multi',{});
  check('週三：去了吉他社（到 21:00），法服讀書會就不能再參加（走進哪一間就是哪一個）',ACTIVITIES.attended(G,'club_guitar',G.day)&&!ACTIVITIES.canJoin(G,l));
  /* G：社團博覽會 */
  const e930=dayOf('2025-09-30');
  check('博覽會的集合點只在 9/30、10/1 的校園',(()=>{ fresh(e930,12); G.zone='campus'; const its=[]; CLS.addActSpots({E:{interactables:its},G},'campus'); const ok1=its.some(i=>i.actSpot==='club_expo_y1s1'&&i.label==='社團博覽會'); const its2=[]; G.day=e930+2; CLS.addActSpots({E:{interactables:its2},G},'campus'); return ok1&&!its2.some(i=>i.actSpot==='club_expo_y1s1'); })());
  /* 舊局（9/17 開始）照舊 9/30、10/1；新局 9/6（六）10:00～16:00、選單＝十五攤（CLUBFAIR-REAL-1027，AA_485 3-2、3-3；細節在 tests/clubfair_1027_unit.js）*/
  fresh(e930,9.5); await CLS.spotInteract(GM,x); check('09:30：「今天 10:00 開始」（AA_485 3-2：10:00～16:00；原本 11:00～17:00）',!chose.length&&/今天 10:00 開始/.test(caps[0]||''),caps[0]);
  fresh(e930,16.2); await CLS.spotInteract(GM,x); check('16:12：「今天的攤位收了」',/攤位收了/.test(caps[0]||''),caps[0]);
  fresh(e930,12); answers=[1,0]; await CLS.spotInteract(GM,x);
  check('12:00：服務台的選單列十五攤（能加入的五攤在前面）＋逛完了',chose[0]&&chose[0].length===16&&/法律服務社/.test(chose[0][0])&&/吉他社/.test(chose[0][1])&&/辯論社/.test(chose[0][2])&&/登山社/.test(chose[0][3])&&/系籃/.test(chose[0][4])&&chose[0][15]==='逛完了',JSON.stringify(chose[0]));
  check('選吉他社＝那一攤：顧攤的人兩句 → 填表 → 加入（CLUB_club_guitar）；出席紀錄',G.flags.CLUB_club_guitar===true&&JSON.stringify(chose[1])===JSON.stringify(['填表','先不要'])&&log.includes('會不會彈都沒關係，我們從 C 和弦教起。')&&ACTIVITIES.attendedAny(G,'club_expo_y1s1',G.day),JSON.stringify(chose));
  chose=[]; log=[]; answers=[1]; await CLS.spotInteract(GM,x); check('再看一次：吉他社寫「已加入」、再選一次說填過了',/已加入/.test(chose[0][1])&&log.some(t=>/表你已經填過了/.test(t)),JSON.stringify([chose,log]));
  chose=[]; log=[]; answers=[0]; G.zone='campus'; await CLS.spotInteract(GM,x); check('選法服＝演法服攤位那一段（AA_218 17-3：學姊、寫報名表）（ev_sis_club_expo；加入法服由那一段記，這裡的 EVENTS.run 是替身）',log.includes('〔事件 ev_sis_club_expo〕'),JSON.stringify(log));
  /* H：系籃 */
  const friDay=W.map(w=>dOf(w,5)).find(d=>d&&!CALENDAR.holiday(d)); fresh(friDay,17.6); G.zone='campus'; answers=[0]; await CLS.spotInteract(GM,b);
  { const iF=log.indexOf('〔轉暗〕'), iN=log.indexOf(b.narr[0]);
    check('系籃：球場（映月湖東側）「去練球：系籃練球」→ 沒去社博、第一次去＝「（你在場邊填了表。）」（AA_485 3-4；AA_491 C：系籃在球場、沒有門口）→ 沒有入座的句子、直接轉暗 → 19:00 → 旁白 → 社課結束了',(chose[0]||[])[0]==='去練球：系籃練球'&&log[0]==='（你在場邊填了表。）'&&iF===1&&iN>iF&&Math.abs(G.hour-19)<0.01&&caps[caps.length-1]==='社課結束了。'&&G.flags.CLUB_dept_basketball===true,JSON.stringify(log)); }
  /* I：事件的條件 */
  const ez=STORY_EVENTS.find(e=>e.id==='ev_ziqing_club'), es=STORY_EVENTS.find(e=>e.id==='ev_studygroup_wed');
  const why=ez.dialogue.find(d=>d.choice).choice.find(c=>/程式比賽/.test(c.text));
  check('ev_ziqing_club：冷卻 7 天；「上次那個程式比賽，妳怎麼沒去？」（AA_207 附錄 §2；原本「為什麼不去比賽？」）有 ARGUED_ABOUT_CAREER 就不出現（整個存檔一次）；沒有 Q1 阿凱沒說過的「系上第一名」',ez.cooldown_days===7&&!!why&&JSON.stringify(why.unless)===JSON.stringify({memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}]})&&why.text==='「上次那個程式比賽，妳怎麼沒去？」');
  check('ev_studygroup_wed：trigger activity（走進萬才館不會自己開始）、週三 19:00–21:00、台詞第一句沒改',es.trigger==='activity'&&JSON.stringify(es.time)==='[19,21]'&&es.dialogue[0].text==='來了？坐。今天讀刑訴——一年級聽不懂沒關係，先聽爭點怎麼吵。');
  /* J：子晴的作息 */
  const zq=d=>{ G={day:d,hour:19.5,weekday:CALENDAR.dateOf(d).wd%7,flags:{},events:{done:{},last:{}}}; return STORY.schedEnt(CHARACTERS.heroine_04,G); };
  const at=(d,h)=>{ G={day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7,flags:{},events:{done:{},last:{}}}; const e=STORY.schedEnt(CHARACTERS.heroine_04,G); return e?e.zone+':'+e.act:'-'; };
  check('子晴：第 5 週以後社團週的週一、三 19:30 在萬才館（吉他社）；第 4 週、第 8 週、21:10 不在',at(monOK,19.5)==='wancai:club'&&at(wedOK,19.5)==='wancai:club'&&at(mon4,19.5)!=='wancai:club'&&at(mon8,19.5)!=='wancai:club'&&at(monOK,21.17)!=='wancai:club',[at(monOK,19.5),at(wedOK,19.5),at(mon4,19.5),at(mon8,19.5),at(monOK,21.17)].join(' '));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
