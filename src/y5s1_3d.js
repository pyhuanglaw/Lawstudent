/* ===== 大五上（交換延畢；AA_357，AA-C 2026-10-21 定稿 d07eb988）=====
   誰：日本、美國路線（延畢一學期，STORY.routeAbroadRoute）。學期 Y5S1＝CALENDAR.termOfDelayed（2029-09-03～12-23，16 週），只有延畢的玩家用；
   照原設計不開放自由時間（畢業後篇「跳到下一件事」帶過，src/postgrad3d.js），可是要有學期的樣子（AA_357 1-1）：
   - 日期標籤（CLS.dayLabel）：「大五上 第 N 週」（照其他學期的格式；沒有期中、期末考週）。12/24～1/20 照原本寫「寒假」，1/21 以後照畢業後篇。
   - 今日頁（CLS.todayLine／todayHTML）：週二「法律實習　10:00（法扶）」；美國路線週一「補修：強制執行法」、週三「補修：法律倫理」（一鍵上課，AA_327 2-Y4-52、AA_291 第 6 節：
     和學弟妹同堂、上午兩堂、課堂內容重播大四上那兩門的 syllabus）；其他日子照 9/3 的選擇（Y5_DAYS）：總圖／家教／在家讀書。課表（CLS.weekHTML）列同樣的東西。
   - 一鍵上課：今日頁的「直接去上課」（game3d.js data-y5go）→ 2D 的一堂課（字卡、教授一句：CLS.content 照大四上那一門那一週，未審查的週照一般句子）→ 時間到下課；人在哪裡就回到哪裡。
     出席不影響任何結果（只記 G.y5.cls）。
   - 1-2 9/3 選「接家教」：每週 +1,200 元（STORY.PHONE_RULES，跳日期的時候也跑）。3-3 最後一次實習（12/18 10:00，PG.STEPS）。
   - 3-1 2029 中秋（畢業後篇所有玩家、麵店團）：9/20 21:00 群組（PG.MSGS）→「去。」＝9/22 18:00 河濱（OUT、ev_pg_moon29）；沒去＝22:00 群組照片。
   台詞照 AA 稿；AA 稿沒有的字只有介面用字（按鈕、標題），見 AA_357 回報。存檔：G.y5＝{cls:{日:課:1}}（舊存檔沒有＝空）；旗標 Y5_PAY_WEEKS、MOON29_GO、MIDAUTUMN_2029、Y5_INTERN 的 4。
   測試：node tests/y5_delay_unit.js */
'use strict';
const Y5=(function(){
  const S={};
  const law=G=>!!G&&(G.stage||'law')==='law';
  S.delayed=G=>law(G)&&typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&!!STORY.routeAbroadRoute(G);
  S.us=G=>S.delayed(G)&&STORY.routeAbroadRoute(G)==='US';
  /* 延畢的玩家這一天在大五上：{id:'Y5S1',week,…}；不是＝null */
  S.term=(G,day)=>{ if(!S.delayed(G)||typeof CALENDAR==='undefined'||!CALENDAR.termOfDelayed) return null; return CALENDAR.termOfDelayed(day==null?G.day:day); };
  S.on=G=>!!S.term(G);
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>((G.hour%24)+24)%24;
  const hm=x=>typeof CLS!=='undefined'&&CLS.hhmm?CLS.hhmm(x):String(x);
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  const wdOf=d=>CALENDAR.dateOf(d).wd;   /* 1＝週一 … 7＝週日 */
  S.rec=G=>{ if(!G.y5||typeof G.y5!=='object') G.y5={}; if(!G.y5.cls||typeof G.y5.cls!=='object') G.y5.cls={}; return G.y5; };
  /* ---------- 這一天的事（AA_357 1-1）---------- */
  S.INTERN_TEXT='法律實習　10:00（法扶）';
  S.MAKEUP=[{wd:1,id:'enforcement',label:'補修：強制執行法',bg:'classroom_small'},{wd:3,id:'legal_ethics',label:'補修：法律倫理',bg:'wancai_seminar'}];   /* 美國路線：週一、週三上午（AA_291 第 6 節）*/
  S.DAYS_TEXT={study:'總圖',work:'家教',bar:'在家讀書'};
  const course=id=>typeof COURSES!=='undefined'&&COURSES.list?COURSES.list.find(c=>c.id===id)||null:null;
  const am=()=>(typeof COURSES!=='undefined'&&COURSES.blocks&&COURSES.blocks.am)||{t0:9+10/60,t1:12+10/60};
  /* 補修的那一堂：{key, c（大四上那一門）, label, t0, t1, day, week, slot, bg} */
  S.classItems=function(G,day){ const d=day==null?G.day:day, t=S.term(G,d); if(!t||!S.us(G)||typeof CALENDAR==='undefined'||CALENDAR.holiday(d)) return []; const wd=wdOf(d), B=am(), out=[];
    for(const m of S.MAKEUP){ if(m.wd!==wd) continue; const c=course(m.id); if(!c) continue; out.push({key:d+':'+m.id,c,label:m.label,t0:B.t0,t1:B.t1,day:d,week:t.week,term:'Y5S1',slot:{wd,block:'am'},bg:m.bg}); } return out; };
  /* done 上過了／open 現在去來得及（開始前 1 小時起、下課前 15 分鐘以前）／upcoming／missed（同 us_life3d.js）*/
  S.status=(G,it)=>{ const R=S.rec(G); if(R.cls[it.key]) return 'done'; if(it.day<G.day||(it.day===G.day&&G.hour>=24)) return 'missed'; if(it.day>G.day) return 'upcoming'; const h=hh(G); if(h>=it.t1-0.25) return 'missed'; return h>=it.t0-1?'open':'upcoming'; };
  /* 今日頁那一行：放假 → 補修 → 週二實習 → 9/3 的選擇（週一～週五）*/
  S.dayLine=function(G,day){ const d=day==null?G.day:day; if(!S.term(G,d)) return null; const hol=CALENDAR.holiday(d); if(hol) return '今天放假（'+hol+'），沒有課';
    const its=S.classItems(G,d); if(its.length) return '今天的課：'+its.map(it=>hm(it.t0)+' '+it.label).join('、');
    const wd=wdOf(d); if(wd===2) return '今天：'+S.INTERN_TEXT;
    const dt=S.DAYS_TEXT[G.flags&&G.flags.Y5_DAYS]; if(wd<=5&&dt) return '今天：'+dt;
    return '今天沒有課'; };
  /* ---------- 包住課表系統（只在延畢的大五上改結果）---------- */
  if(typeof CLS!=='undefined'){
    const lab0=CLS.dayLabel, line0=CLS.todayLine, today0=CLS.todayHTML, week0=CLS.weekHTML;
    if(lab0) CLS.dayLabel=function(G,day){ const d=day==null&&G?G.day:day, t=G?S.term(G,d):null; if(!t) return lab0.apply(this,arguments); const x=CALENDAR.dateOf(d), hol=CALENDAR.holiday(d);
      return x.m+'/'+x.d+' '+CLS.WD[x.wd]+(hol?'・'+hol:'')+'・'+CLS.termName(t.id)+' 第 '+t.week+' 週'; };   /* 大五上沒有期中、期末考（AA_357 第 4 節「這一次，沒有期末考」）*/
    if(line0) CLS.todayLine=function(G){ const L=G?S.dayLine(G):null; return L!=null?L:line0.apply(this,arguments); };
    if(today0) CLS.todayHTML=function(G){ const h=today0.apply(this,arguments); if(!G||!S.on(G)) return h; const its=S.classItems(G); if(!its.length) return h;
      const ST={done:'上過了',missed:'沒去',open:'現在可以去',upcoming:'還沒開始'}, home=typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G); let add='';   /* 人在家：按鈕在家裡的選單（Y5.homeOpts），手機不放（家裡的選單正在等選項）*/
      for(const it of its){ const s=S.status(G,it); add+='<div class="item phrow"><div><b>'+hm(it.t0)+'–'+hm(it.t1)+'</b> '+esc(it.label)+'<div class="muted">'+esc((it.c&&typeof CLS.roomName==='function'?CLS.roomName(it.c):'')||'')+(it.c?'・'+esc(CLS.profName(it.c)):'')+'・'+ST[s]+'</div></div>'+((s==='open'||s==='upcoming')&&!home?'<button class="btn" data-y5go="'+esc(it.key)+'">直接去上課</button>':'')+'</div>'; }
      const line='<div class="item">'+esc(CLS.todayLine(G))+'</div>', i=h.indexOf(line); return i>=0?h.slice(0,i)+add+h.slice(i+line.length):h+add; };   /* 「今天的課」那一行換成補修的那一堂＋「直接去上課」*/
    if(week0) CLS.weekHTML=function(G){ const t=G?S.term(G):null; if(!t) return week0.apply(this,arguments);
      let h='<div class="item"><b>'+esc(CLS.termName(t.id))+'</b>・第 '+t.week+' 週</div><div class="item"><b>'+esc(S.INTERN_TEXT)+'</b><div class="muted">'+esc(CLS.WD[2])+'</div></div>';
      if(S.us(G)) for(const m of S.MAKEUP){ const c=course(m.id); if(!c) continue; const B=am(); h+='<div class="item"><b>'+esc(m.label)+'</b><div class="muted">'+esc(CLS.WD[m.wd])+' '+hm(B.t0)+'–'+hm(B.t1)+(typeof CLS.roomName==='function'?'・'+esc(CLS.roomName(c)):'')+'</div></div>'; }
      return h; }; }
  /* ---------- 一鍵上課（美國路線的補修）---------- */
  S.find=(G,key)=>S.classItems(G).find(it=>it.key===key)||null;
  S.attend=async function(GM,it){ const G=GM.G, R=S.rec(G); if(!it||R.cls[it.key]) return false; const st=S.status(G,it); if(st!=='open'&&!(st==='upcoming'&&it.day===G.day)) return false;
    const home=typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G), A=typeof ADV!=='undefined'?ADV:null, wasAdv=!!(A&&A.active);
    GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard(it.label,hm(it.t0)+'–'+hm(it.t1),2200);
      const arrive=Math.max(now(G)+(home?0.5:0.25),T(it.day,it.t0)); if(arrive>now(G)) GM.advance(arrive-now(G));   /* 從家裡：捷運＋公車約 30 分鐘；早到就等到上課 */
      R.cls[it.key]=1;
      if(A&&A.begin) A.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg(it.bg):'dark'}); await GM.fade(false);
      let ct=null; try{ ct=CLS.content({c:it.c,week:it.week,day:it.day,slot:it.slot,key:it.key,t0:it.t0,t1:it.t1}); }catch(e){ console.warn('Y5 content',e); }
      if(ct&&ct.line) await GM.say(null,(ct.prof||CLS.profName(it.c))+'：'+ct.line);   /* 課堂內容重播大四上那一門那一週（CLS.content：審查過的週照 BB 的課堂、其他週照一般句子）*/
      if(ct&&ct.react) await GM.say(null,ct.react);
      await GM.fade(true); const end=T(it.day,it.t1)+(home?0.5:0); if(now(G)<end) GM.advance(end-now(G));
      if(A){ if(wasAdv&&home&&A.begin&&typeof HOME!=='undefined'&&HOME.bgNow) A.begin({background:HOME.bgNow()}); else if(!wasAdv&&A.active&&A.end) A.end(); }
      await GM.fade(false); if(GM.caption) GM.caption('','下課了。',2400); }
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  S.goClass=async function(GM,key){ const G=GM&&GM.G; if(!G) return false; const it=S.find(G,key); if(!it) return false; return S.attend(GM,it); };
  /* 家裡的選單（home3d.js 的 loop）：今天的補修還來得及＝「直接去上課：補修：…」（照在家的「直接去上課」那一行的寫法）*/
  S.homeOpts=function(G){ if(!S.on(G)) return []; return S.classItems(G).filter(it=>{ const s=S.status(G,it); return s==='open'||s==='upcoming'; }).map(it=>({t:'直接去上課：'+it.label,hint:hm(it.t0)+'–'+hm(it.t1)+'　捷運＋公車 約 30 分鐘',k:'y5cls',it})); };

  /* ======================= 1-2 9/3 的選擇的後果：接家教＝大五上每週 +1,200 元（跳日期時入帳）======================= */
  /* 兩個學生、各一堂（AA_357 1-2）。每過完一週（9/3 起算，最多 16 週）入帳一次；記 Y5_PAY_WEEKS（已經入帳的週數，舊存檔沒有＝0）。去總圖照 r2y4b3d.js 的研究所天數 +64；在家準備國考：2030 國考沒有讀書天數的門檻，只有日期卡的句子 */
  S.WAGE=1200;
  S.pay=function(G,GM){ const F=(G&&G.flags)||{}; if(!S.delayed(G)||F.Y5_DAYS!=='work'||typeof CALENDAR==='undefined'||!CALENDAR.termDays) return 0; const r=CALENDAR.termDays('Y5S1'); if(!r) return 0;
    const wk=Math.max(0,Math.min(16,Math.floor((G.day-r.from)/7))), paid=+F.Y5_PAY_WEEKS||0; if(wk<=paid) return 0; const amt=(wk-paid)*S.WAGE; F.Y5_PAY_WEEKS=wk;
    if(GM&&typeof GM.money==='function') GM.money(amt,'家教'); else G.money=(+G.money||0)+amt; return amt; };

  /* ======================= 3-3 最後一次實習（2029-12-18（二）10:00，法扶；AA_357 3-3）======================= */
  /* 律師是不具名的路人（compact），照前三件（r2y4b3d.js S.intern），不出現任何法律結論；不能錯過（時間到了直接演）；Y5_INTERN 加 4 */
  const LAWYER={name:'律師'};
  S.intern4=async function(GM){ const G=GM.G, A=typeof ADV!=='undefined'?ADV:null; GM.sceneBegin();
    try{ if(GM.titleCard&&typeof PG!=='undefined') await GM.titleCard(PG.dateLabel(G.day,G.hour),'法律實習',1800); if(A&&A.begin) A.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg('legal_aid_office'):'dark'});
      await GM.say(null,'（最後一次實習。律師把你九月影印的第一份卷宗拿出來，還放在櫃子最下面。）');
      await GM.say(LAWYER,'這份你影的。第一頁，現在讀得懂嗎？');
      const k=await GM.choose([{t:'「讀得懂。」'},{t:'「讀懂一半。」'}]);
      await GM.say(LAWYER,k===1?'一半，可以了。':'好。那你可以走了。');
      await GM.say(null,'（出去的時候，走廊的塑膠椅上坐著一個沒見過的阿伯。他在等。）'); }
    finally{ if(A&&A.active&&A.end) A.end(); GM.sceneEnd(); }
    const L=Array.isArray(G.flags.Y5_INTERN)?G.flags.Y5_INTERN:(G.flags.Y5_INTERN=[]); if(!L.includes(4)) L.push(4); return true; };

  /* ======================= 3-1 2029 中秋：還在臺北的人（畢業後篇所有玩家，AA_357 3-1）======================= */
  /* 9/20（四）21:00 麵店團群組（阿哲三則）：「去。」＝9/22（六）18:00 河濱（riverside）1.5 小時；「這次不行。」、沒回、沒去＝9/22 22:00 群組一張照片。
     旗標 MIDAUTUMN_2029：'went'｜'no'（MOON29_GO＝回了「去。」）；mem 不新增。沒見過的人那一句不出；明軒不熟（FAMILIAR 以下）：視訊那兩句改成「（阿哲對著手機講了一下話。）」。
     美國、日本路線 2029 都已經回臺灣，都可以去 */
  const DKy=k=>typeof PG!=='undefined'&&PG.DK?PG.DK(k):(STORY.dayOfKey?STORY.dayOfKey(k):null);
  const graduatedPG=G=>typeof PG!=='undefined'&&!!PG.done&&PG.done(G,'grad');
  const inNoodle=G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team');
  const knows=(id,G)=>!!STORY.knows&&STORY.knows(id,G)&&(!STORY.reachable||STORY.reachable(id,G));   /* 見過、而且人在臺北 */
  const lvAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const who=id=>({name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id,charId:id});
  const GRP=(id,t,o)=>Object.assign(id==null?{th:'g:noodle_team',who:null,text:t}:{th:'g:noodle_team',from:id,text:t},o||{});
  S.MOON_DAY='2029-09-22';
  S.moonMsg=G=>{ const d=DKy(S.MOON_DAY); return [GRP('zhe','禮拜六中秋'),GRP('zhe','河濱 六點 一樣'),GRP('zhe','明軒那邊我開視訊 讓他看月亮',{ask:{id:'pg_moon29',until:T(d,17),opts:[{t:'去。',set:{MOON29_GO:true}},{t:'這次不行。',set:{MIDAUTUMN_2029:'no'}}]}})]; };
  S.moonScene=async function(GM){ const G=GM.G, A=typeof ADV!=='undefined'?ADV:null; if(A&&A.begin) A.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg('riverside'):'dark'});
    await GM.say(null,'（河濱。烤肉架是阿哲借的，和大一那年同一個。）');
    if(knows('classmate_bohan',G)) await GM.say(who('classmate_bohan'),'（手上拿著一本書）我只待一個小時。研究所的報告。');
    if(knows('heroine_03',G)) await GM.say(who('heroine_03'),'（拿出一顆柚子）……今年蛋糕店有開。我還是買柚子。');
    if(knows('heroine_01',G)) await GM.say(who('heroine_01'),'（到了以後先看一下手機，然後收進包包）……今天不讀。');
    if(STORY.knows&&STORY.knows('classmate_mingxuan',G)&&lvAt('classmate_mingxuan','FAMILIAR')){   /* 明軒在德國（不看人在不在臺北）：認識、FAMILIAR 以上才看得到視訊 */ await GM.say(who('zhe'),'（手機舉高）明軒，看。月亮。……他說德國現在是中午。'); await GM.say(null,'（螢幕裡，明軒那邊天很亮。他揮了一下手。）'); }
    else await GM.say(null,'（阿哲對著手機講了一下話。）');
    if(knows('yu',G)){ await GM.say(who('yu'),'明年中秋，我們還湊得到這麼多人嗎？'); const k=await GM.choose([{t:'「湊得到。」'},{t:'「不知道。」'}]);
      if(k===1) await GM.say(who('yu'),'……我也不知道。所以今年要吃多一點。'); else await GM.say(who('zhe'),'你說的喔。'); }
    await GM.say(null,'（柚子皮後來被阿哲戴在頭上。這件事，每年都有人做。）');
    G.flags.MIDAUTUMN_2029='went'; };
  S.moonPlan=G=>typeof OUT!=='undefined'&&OUT.plan(G,{id:'pg_moon29',ev:'ev_pg_moon29',day:DKy(S.MOON_DAY),h:18,late:0.5,place:'河濱',title:'中秋：河濱',travel:'騎車約 15 分鐘',travelH:0.25});
  S.moonRules=function(G){ const F=(G&&G.flags)||{}; if(!G||!law(G)||typeof PHONE==='undefined') return; const d=DKy(S.MOON_DAY); if(d==null||G.day<d-3||G.day>d+2) return;
    if(F.MOON29_GO===true&&F.MIDAUTUMN_2029==null&&typeof OUT!=='undefined'&&!OUT.get(G,'pg_moon29')) S.moonPlan(G);
    if(F.MIDAUTUMN_2029==null&&F.MOON29_GO!==true&&PHONE.sent(G,'pg_moon29')&&now(G)>=T(d,18)) F.MIDAUTUMN_2029='no';   /* 沒回 */
    if(F.MIDAUTUMN_2029==='no'&&!PHONE.sent(G,'pg_moon29_photo')) PHONE.at(G,d,22,[GRP(null,'📷（河濱，烤肉架，螢幕裡的明軒在揮手）')],'pg_moon29_photo'); };   /* 誰傳的 AA 沒寫：群組裡不寫名字 */
  S.MSGS=[{tag:'pg_moon29',at:['2029-09-20',21],cond:G=>graduatedPG(G)&&inNoodle(G),items:G=>S.moonMsg(G)}];
  S.EVS=[{id:'ev_pg_moon29',title:'中秋',participants:[],location:'any',trigger:'outing',background:'dark',hours:1.5,dialogue:[],
    beforeOuting:async(G,GM,q)=>{ await S.moonScene(GM); }, outingMissed:(G,GM,q)=>{ if(G.flags.MIDAUTUMN_2029==null) G.flags.MIDAUTUMN_2029='no'; S.moonRules(G); }}];
  S.STEPS=[{id:'y5_intern4',at:G=>T(DKy('2029-12-18'),10),until:G=>T(DKy('2029-12-20'),24),cond:G=>S.delayed(G),run:GM=>S.intern4(GM)}];

  /* ======================= 掛上去 ======================= */
  if(typeof PG!=='undefined'){ if(Array.isArray(PG.MSGS)) for(const m of S.MSGS) if(!PG.MSGS.some(x=>x.tag===m.tag)) PG.MSGS.push(m); if(Array.isArray(PG.STEPS)) for(const s of S.STEPS) if(!PG.STEPS.some(x=>x.id===s.id)) PG.STEPS.push(s); }
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>{ S.pay(G,GM); S.moonRules(G); });
  return S;
})();
