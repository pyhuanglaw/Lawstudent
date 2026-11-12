/* ===== AA_625 語彤新版事件台詞：還沒做的兩段（任務 AA624-YT-BACKGROUND-1103；企劃線 claude/cool-heisenberg-o8kuqx 0787572c6，AA 定稿 D109，台詞一字照稿）=====
   其他段落已經在 src/ytjob3d.js（茶屋的班、第一次去她家）、y2b3d.js、r2y3a、r2y4a、r2y4b、postgrad3d.js。

   一、「語彤約一起念書」（使用者 11-03：她茶屋的班只有週末下午，平常有時間念法律；找祐廷一起念是因為他是法律系的）
     - 用現有的邀約（invites3d.js）：她的私訊＝INV.offer（手機上「答應／改天／不了」）；答應以後時間到兩個人都在就照一般的見面演（INV.meet）。
       她約的都記 iv.cat='study'（一起念書：AA_707 的「一起念書第 N 場」照演、讀書照現有的規則算時數，D118）、iv.yts（這一份的標記）。
     - 第一次（大一下第 3 週、要 YT_MET_JOB）：那一週週二排、21:40（她的傳訊時間，heroine_asks.js 的 send）私訊三句，最後一句掛「好。」／「這週不行。」（PHONE 的 ask，回覆期限週三 13:30）；
       「好。」＝當週週三 14:00 木曜日（INV.accept，by:'npc'），見面坐下以後她多一句 firstExtra；「這週不行。」＝她回「嗯。下次。」。
       第 3 週那個週三她有課、木曜日沒開、你那個時間有約＝順延到下一個週三（還在大一下）；大一下都沒認識她＝沒有第一次，之後的約照常（交 AA 確認）。
     - 之後的約（私訊，輪流）：學期中、平日下午或晚上（15:30／17:30／19:00；INV.freeAt：她的課、你的約、你的考試、店開不開）；大約兩週一次（12～16 天輪流，星期幾、時間跟著換），期末考週和前兩週（第 W−2～W 週）每週一次。
       ①「債總…」④「這週我不用排班…」＝前一天 21:40 傳、約隔天（木曜日；木曜日週二公休、沒開＝2:30 AM）；②「兩點半還有位子…」＝當天、約的時間前 30 分鐘傳（2:30 AM）；
       ③「明天考刑總…」只在期末考週、而且隔天考刑總（你的：大一下刑法總則（二），CLS.examList；她的：雙主修大三上、下修刑法總則（一）（二），characters.js 她的作息）：當天 17:00 傳、19:00 大口漢堡；一學期一次、不看間隔。
       不約的時候：寒暑假、週末、過年前後（HASK.cny）、學期末心意邀約的窗口（TERMEND.window）、人在國外、她不在臺北、分手後的冷淡期（INV.cool）、前任不主動約（V6EX.noContact）、
       那一週她已經用 heroine_asks 約過你。拒絕、改天、沒回都不扣分（改天不打開「自己選時間」），下一次照樣約。
       交往以後「也可以在她家」：遊戲裡沒有「在她家念書」的地方（她家只有一次性的出遊 ev_yt_home_first），這一項沒做（列給 LAWWW／AA）。
     - 念的時候（坐下讀書以後）：during 四則輪流（G.flags.YTSTUDY.dur）；在木曜日的那一場，讀完照木曜日的讀書（AA_618 1-3）多一句那裡的旁白（STORY.studyNarr）。
       掛在 invites3d.js 的 INV.ON_SEATED／ON_STAYED（這一份新加的兩個掛勾）；一般流程沒算到讀書時數的（還沒到第 N 場的階段＝一般句）這裡補算（G.stats.study＋STORY.onStudy，和一起念書同一套）。
     - 存檔：G.flags.YTSTUDY＝{first:'sent'|'yes'|'no'|'late'|'skip', fday, last（上一次約的那一天）, rot（輪到第幾則）, ex（用過刑總那一句的學期）, dur, plan:{k,place,day,h,sd,sh,state,iv}}；舊存檔沒有＝從頭（還沒到大一下第 3 週的照第一次）。

   二、「15 一盞茶屋十週年」（大四上十二月的週六 19:00）
     - 日子：2028-12-16（六）19:00（AA_625 只寫「十二月的週六」；12/4～12/13 的私訊、118 巷閒聊還在說要不要辦、12/21（四）事件 16 是「十週年之後的週四」＝只有 12/16 合；交 AA 確認）。
     - 已經認識她（YT_MET_JOB：在茶屋上過班）、法律系、不在國外：12/11 起排進行程（OUT 出遊「一盞茶屋十週年」，19:00，晚 45 分鐘內可以出發；不去了＝YT_TEA10 'missed'，不扣分）。
       背景 wenzhou_teahouse（一盞茶屋的 2D 圖，白天的）；CG：稿上「CG 改成茶屋」——CG_REGISTRY 的 cg_anniversary_23（標題「十週年」）現在的圖還是麵店，茶屋的圖還沒有＝不出 CG（列給 BB 跟使用者要）。
     - 台詞照 AA_625 第 15 節四句；「還有你（祐廷）」的（祐廷）寫成 {name}（玩家的名字）。接著來的朋友各一句（接線時補的第 4 點，3248430b3）：
       阿哲、Alison、以安、沛珊照這個順序，有來才說、最多三句。有來＝AA_11 事件 15「依玩家四年和他們的關係」：認識、朋友以上、那天在臺北；沛珊另外要重聚以後（沒交往的新線 2028-12-29 才重聚＝不會來）。
       散場下雨（AA_11 事件 15「天氣強制下雨」：散場那一刻把天氣改成雨，颱風照舊）：旁白「（散場下雨。語彤拿出兩把傘。）」（AA_11 交往版的那一句，三版共用）＋
       一般＝「這次我有帶兩把。」（AA_625；要看過事件 1 的雨天 SHARED_UMBRELLA，沒看過＝「下雨了。……我多帶了一把。」）；和別人交往中＝「兩把。你們自己分。」（AA_11，AA_625 那一句不出）；和她交往中＝AA_11 交往版兩句（給阿哲那一把：認識阿哲才說）。
     - 同班圈誰會來（AA_11 事件 15：阿哲、Alison、以安、柏翰、明軒依關係；學姊、芷若不在；交往中的可昕見過大家才在）：稿上沒有他們的台詞，這一場不另外演；
       和可昕交往、她沒見過大家（KX_MET_NOODLE_TEAM，和燒臘二十三週年同一個判斷）＝散場後（21:00）祐廷自動傳一張照片、可昕回三句（接線時補的第 4 點）。
     - 記憶 ANNIVERSARY_23（AA_11：id 照舊；面板名稱「一盞茶屋十週年那晚在場」，AA_627 A-377）；YT_TEA10 'there'。
     - 美國路線（12/16 人在國外）＝遠端版：臺灣 19:30（手機照當地時間）語彤私訊照片＋「這杯是你的。」（接線時補的第 4 點；茶屋的 CG 來了再掛 cg），ANNIVERSARY_23 記「聽說」，YT_TEA10 'remote'。
     - 燒臘二十三週年（y34b3d.js A23）的 CG-8、語彤的傘、ANNIVERSARY_23 拿掉（接線時補的第 3 點）：ANNIVERSARY_23 只有這一場記。
   測試：node tests/aa625_yt_study_unit.js */
'use strict';
const AA625=(function(){
  const S={}, YT='heroine_03', ZHE='zhe';
  const law=G=>!!G&&(G.stage||'law')==='law';
  const NOW=G=>G.day*24+(+G.hour||0), T=(d,h)=>d*24+h;
  const F_=G=>G.flags||(G.flags={});
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const TD=(term,w,wd)=>typeof STORY!=='undefined'&&STORY.termDayIn?STORY.termDayIn(term,w,wd):null;   /* wd：1＝週一 … 7＝週日 */
  const wdOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd%7:null;   /* 0＝週日 */
  const termOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(d):null;
  const met=G=>!!(G&&G.flags&&G.flags.YT_MET_JOB);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&!!STORY.knows(id,G);
  const remember=(id,t,n)=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(id,t,n||''); };
  const LOVE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, Rm=F.romance||{}; return F['dating_'+id]===true||!!(Rm[id]&&Rm[id].status==='dating'); };
  const partners=G=>{ const s=new Set(LOVE.filter(id=>dating(G,id))); if(typeof ROM!=='undefined'&&ROM.partners){ try{ for(const id of ROM.partners(G)) s.add(id); }catch(e){} } return [...s]; };
  S.datingYT=G=>partners(G).includes(YT);
  S.datingOther=G=>partners(G).some(p=>p!==YT);   /* 和 y34b3d.js 二十三週年同一個判斷 */

  /* ---------- 台詞（AA_625 0787572c6，一字照稿；tests/aa625_yt_study_unit.js 逐句對稿）---------- */
  const L=S.L={
    first:['……嗯。你刑總讀到哪了？','我這學期也有修你們的刑總。我想申請雙主修。','禮拜三下午我沒課。木曜日？'],   /* 3248430b3：民總 → 刑總（遊戲的民總在大一上，大一下是刑總）*/
    firstOpts:['好。','這週不行。'], firstNo:'嗯。下次。', firstBusy:['那天你有約了？','……嗯。下次。'],   /* firstBusy：回「好。」可是那個時間已經答應別人（AA-B 11-07 23:28，BUG-YTS-FIRST-CLASH-1107；稿外，AA 直接給）*/
    firstExtra:'我只是週末打工。平常其實很閒。',
    next:['債總第三章。我看不懂。……你看得懂嗎。','兩點半還有位子。你要來嗎。','明天考刑總。今天晚上大口漢堡，我會待到很晚。','這週我不用排班那麼多。……要不要一起念。'],
    during:[ [[YT,'這一條為什麼這樣寫？……立法理由在哪裡查？'],[null,'（你翻給她看。她讀完，又回去把條文念了一次。）']],
      [[null,'（她把不懂的地方用鉛筆圈起來，一頁圈了三個。念完，三個圈都擦掉了。）']],
      [[YT,'你講的比課本清楚。……不要得意。']],
      [[null,'（她的筆記一半是法條，一半是茶屋客人說過的話。她說那是另一本的。）']] ],
    tea10:[[null,'（蘇姨包場。茶屋擠滿了人：熟客、以前的員工，還有語彤找來的朋友。）'],['蘇姨','十年。我以為開不到三年。'],['蘇姨','語彤從高三暑假就在這裡了。第一天把一整壺茶倒在自己身上。'],[YT,'……蘇姨。'],['蘇姨','還有你（{name}）。第一天把杯子洗破兩個。']],
    rain:'這次我有帶兩把。', rainNo:'下雨了。……我多帶了一把。',   /* 「這次我有帶兩把。」要看過事件 1 的雨天（SHARED_UMBRELLA）；沒看過＝rainNo（接線時補的第 2 點）*/
    /* 接線時補的第 4 點：來的朋友各一句（有來才說，最多三句；照這個順序）、和可昕交往而她沒見過大家＝散場後的照片、美國路線的照片 */
    friends:[ ['zhe',[['zhe','十年欸。……我第一次來是被語彤拉來的。']]], ['yu',[['yu','蘇姨！我也要拍！'],[null,'（她拿手機擠到最前面。）']]],
      ['heroine_01',[[null,'（她把一個小紙袋放在櫃台上，是給蘇姨的茶點。）'],['heroine_01','……週年快樂。']]], ['classmate_peishan',[['classmate_peishan','好想在台南也找到一間這樣的店。找到了我就搬到樓上。']]] ],
    kxPhoto:'📷（茶屋裡擠滿了人，蘇姨站在中間舉著茶杯）', kxReply:['好多人。','……中間那個就是蘇姨？','下次帶我去。'],
    usPhoto:'📷（茶屋裡擠滿了人。蘇姨站在中間舉著茶杯。最旁邊的位子空著，桌上放了一杯茶。）', usLine:'這杯是你的。'
  };
  /* AA_11 事件 15（0787572c6；AA_625 第 15 節「同班圈誰會來照 AA_11 事件 15 的規則」）的兩個版本，一字照稿 */
  const L11=S.L11={ rainOpen:'（散場下雨。語彤拿出兩把傘。）', other:'兩把。你們自己分。', dt:['（把一把交給阿哲）這把給你們。','（撐開另一把）這把是我們的。'] };

  /* =====================================================================
     一、語彤約一起念書
     ===================================================================== */
  S.rec=G=>{ const F=F_(G); let r=F.YTSTUDY; if(!r||typeof r!=='object'||Array.isArray(r)) r=F.YTSTUDY={}; if(typeof r.rot!=='number') r.rot=0; if(typeof r.dur!=='number') r.dur=0; return r; };
  S.SEND_H=21+40/60;   /* 她傳訊息的時間（heroine_asks.js heroine_03.send）*/
  S.HS=[15.5,17.5,19];   /* 平日下午或晚上（INVITE_DATA.times 裡的下午、晚上那幾個）*/
  S.FIRST_H=14; S.FIRST_UNTIL=13.5;
  S.ROT=[0,1,3];   /* 平常輪流的三則（next 的第 0、1、3 則）；第 2 則（刑總）只在期末考週 */
  const LAW_TERMS=['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  /* 那一天在不在可以約的學期（大一下第 3 週起）*/
  S.termOk=d=>{ const t=termOf(d); if(!t||!LAW_TERMS.includes(t.id)) return null; if(t.id==='Y1S2'&&t.week<3) return null; return t; };
  const weeksOf=id=>((typeof CALENDAR!=='undefined'&&CALENDAR.TERMS||[]).find(x=>x.id===id)||{}).weeks||16;
  /* 考試前兩週和考試週（第 W−2～W 週）：每週一次 */
  S.examish=d=>{ const t=termOf(d); return !!t&&t.week>=weeksOf(t.id)-2; };
  const weekStart=d=>{ const w=wdOf(d); return d-((w+6)%7); };
  /* 那一週她已經用「她們主動約你」（heroine_asks3d.js）約過你 */
  S.haskWeek=function(G,d){ if(typeof HASK==='undefined'||!HASK.rec) return false; const R=HASK.rec(G), w=weekStart(d); return (R.sent||[]).some(x=>x&&x.id===YT&&x.state!=='dropped'&&x.day!=null&&weekStart(x.day)===w); };
  /* 這一天不約的原因（空字串＝可以）*/
  S.block=function(G,d){ if(!law(G)||!met(G)) return 'met'; if(!S.termOk(d)) return 'term'; const w=wdOf(d); if(w<1||w>5) return 'weekend';
    if(typeof HASK!=='undefined'&&HASK.cny&&HASK.cny(d)) return 'cny';
    if(typeof TERMEND!=='undefined'&&TERMEND.window&&TERMEND.window(Object.assign({},G,{day:d}))) return 'termend';
    if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}))) return 'abroad';
    { const last=typeof DATE!=='undefined'&&DATE.lastDay?DATE.lastDay():null; if(last!=null&&d>last) return 'graduated'; }
    { const pr=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(YT,Object.assign({},G,{day:d,hour:15})):{here:true}; if(pr&&!pr.here&&pr.kind!=='taipei') return 'away'; }
    if(typeof INV!=='undefined'&&INV.cool&&INV.cool(G,YT)) return 'cool';
    if(typeof V6EX!=='undefined'&&V6EX.noContact&&V6EX.noContact(G,YT)) return 'ex';
    if(S.haskWeek(G,d)) return 'hask';
    return ''; };
  const place=pid=>typeof INV!=='undefined'&&INV.place?INV.place(pid):null;
  const freeAt=(G,pid,d,h)=>{ const P=place(pid); return !!P&&typeof INV!=='undefined'&&!!INV.freeAt&&INV.freeAt(G,YT,P,d,h); };
  /* 隔天考刑總：你的刑總期末考（CLS.examList，大一下刑法總則（二））或她的（雙主修大三上、下修刑法總則（一）（二），characters.js 語彤的作息：AA_507 0-2 第 6 點、AA_508 0-2 第 7 點；考試日照那門課 CLS.examDay）*/
  S.HER_CRIM={Y3S1:'crim_gen1',Y3S2:'crim_gen2'};
  S.crimEve=function(G,d){ if(typeof CLS==='undefined') return false; const t=termOf(d+1); if(!t||!t.exam) return false;
    try{ if(CLS.examList&&CLS.examList(G,t.id).some(e=>e&&e.c&&/^crim_gen/.test(e.c.id)&&e.day===d+1)) return true;
      const cid=S.HER_CRIM[t.id], c=cid&&CLS.byId?CLS.byId(cid):null, x=c&&CLS.examDay?CLS.examDay(G,c,t.id,'final'):null; return !!x&&x.day===d+1; }catch(e){ return false; } };
  /* 第一次：大一下第 3 週起的週三 14:00 木曜日（回覆期限當天 13:30 還沒過、那一天可以約、木曜日那時候她和你都有空）*/
  S.firstWed=function(G){ const w3=TD('Y1S2',3,3); if(w3==null) return null;
    for(let d=Math.max(w3,G.day);;d++){ const t=termOf(d); if(!t||t.id!=='Y1S2') return null; if(wdOf(d)!==3) continue; if(NOW(G)>=T(d,S.FIRST_UNTIL)) continue;
      if(S.block(G,d)||!freeAt(G,'mokuyobi',d,S.FIRST_H)) continue; return d; } };
  const ytItem=t=>({th:'p:'+YT,from:YT,text:t});
  /* 她傳第一則的時候還沒有她的聯絡方式：一起在茶屋上班的前輩＝加上（INV.addContact 的系統字「加了…的聯絡方式。」；交 AA 確認）*/
  S.contact=G=>{ if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,YT)&&INV.addContact) INV.addContact(G,YT); };
  S.FIRST_TAG='yts_first';
  S.firstPhone=function(G){ const R=S.rec(G); if(R.first!=null) return;
    const t=termOf(G.day); if(t&&t.id!=='Y1S2'&&LAW_TERMS.indexOf(t.id)>0){ R.first='skip'; return; }   /* 大一下都沒認識她：沒有第一次 */
    if(!t){ const w3=TD('Y1S2',3,3), end=TD('Y2S1',1,1); if(w3!=null&&end!=null&&G.day>w3&&G.day<end){ R.first='skip'; return; } }   /* 大一下結束了（暑假）*/
    const d=S.firstWed(G); if(d==null) return;
    if(G.day<d-1) return;   /* 前一天（週二）才排 */
    if(typeof PHONE==='undefined'||PHONE.sent(G,S.FIRST_TAG)) return;
    const M=L.first.map(ytItem); M[M.length-1].ask={id:S.FIRST_TAG,until:T(d,S.FIRST_UNTIL),opts:[{t:L.firstOpts[0]},{t:L.firstOpts[1],say:[{from:YT,text:L.firstNo}]}]};
    PHONE.at(G,d-1,S.SEND_H,M,S.FIRST_TAG); R.first='sent'; R.fday=d; R.last=d; };
  /* 回了第一次那一則（PHONE.ON_ANSWER）：「好。」＝那天 14:00 木曜日 */
  S.onAsk=function(G,m,o,k){ const id=m&&m.ask&&m.ask.id; if(id!==S.FIRST_TAG||!G) return; const R=S.rec(G); if(R.first!=='sent') return;
    if(k!==0){ R.first='no'; return; }
    const d=R.fday; if(d==null||typeof INV==='undefined'||!INV.accept){ R.first='yes'; return; }
    /* 撞到的只算已經答應的（accepted／going／changed）、校外約會、考試；別人約你、你還沒回的（offered）不擋（BUG-YTS-FIRST-CLASH-1107，BB-B 11-07 23:25：
       同一晚 21:30 以安約 3/11 15:30 總圖、21:40 語彤約 14:00 木曜日，回「好。」被那則還沒回的擋掉，語彤停在「好。」、系統串多一句「那個時間你已經約了別人。」）*/
    const P=place('mokuyobi'), Gx=Object.assign({},G,{invites:(G.invites||[]).filter(iv=>iv&&iv.state!=='offered')});
    if(INV.mineAt&&P&&INV.mineAt(Gx,d,S.FIRST_H,P.stay)){ R.first='busy'; if(INV.msg) INV.msg(G,null,'那個時間你已經約了別人。');   /* 系統字照 INV.answer；真的撞到＝當成這次不行（不扣分），她回 AA-B 給的兩句（firstBusy），之後照一般的約 */
      if(typeof PHONE!=='undefined'&&PHONE.post) for(const t of L.firstBusy) PHONE.post(G,ytItem(t)); return; }
    R.first='yes'; const iv=INV.accept(G,YT,'mokuyobi',d,S.FIRST_H,{by:'npc'}); if(iv){ iv.cat='study'; iv.yts={k:'first',first:true}; } };
  /* 第一次那一則過了期限還沒回：當成這次不行（不扣分）*/
  S.firstExpire=function(G){ const R=S.rec(G); if(R.first==='sent'&&R.fday!=null&&NOW(G)>T(R.fday,S.FIRST_UNTIL)){ const m=typeof PHONE!=='undefined'&&PHONE.byAsk?PHONE.byAsk(G,S.FIRST_TAG):null; if(!m||m.ans==null) R.first='late'; } };
  /* 之後的約：排（S.plan）→ 到了傳的時間才真的傳（S.fire）*/
  S.firstDone=R=>R.first!=null&&R.first!=='sent';
  /* 刑總那一則：隔天考刑總、這學期還沒用過、19:00 大口漢堡可以（當天 17:00 傳；句子寫「今天晚上」＝heroine_asks 的寫法）*/
  S.crimPick=function(G,d){ const R=S.rec(G), t=termOf(d); if(!t||R.ex===t.id||!S.crimEve(G,d)||NOW(G)>=T(d,17.5)||!freeAt(G,'xs_dakou',d,19)) return null; return {k:2,place:'xs_dakou',day:d,h:19,sd:d,sh:17}; };
  S.hsOf=G=>{ const n=(S.rec(G).n|0)%S.HS.length; return S.HS.slice(n).concat(S.HS.slice(0,n)); };   /* 每一次從不同的時間試起（15:30 → 17:30 → 19:00 輪流），不會每次都同一個時間 */
  S.pickFor=function(G,d){ const R=S.rec(G), k=S.ROT[(R.rot|0)%S.ROT.length], HS=S.hsOf(G);
    if(k===1){ for(const h of HS) if(NOW(G)<T(d,h-0.5)&&freeAt(G,'cafe',d,h)) return {k,place:'cafe',day:d,h,sd:d,sh:h-0.5}; return null; }   /* 「兩點半還有位子」＝當天、約的時間前 30 分鐘傳（2:30 AM）*/
    for(const h of HS){ if(NOW(G)>T(d,h)-1) continue; for(const pid of ['mokuyobi','cafe']) if(freeAt(G,pid,d,h)) return {k,place:pid,day:d,h,sd:d-1,sh:S.SEND_H}; }   /* 前一天晚上 21:40 傳、約隔天（木曜日；沒開＝2:30 AM）*/
    return null; };
  S.GAPS=[14,13,15,12,16];   /* 「大約兩週一次」：12～16 天輪流（同一個星期幾不會一直重複）*/
  S.gapOf=G=>S.GAPS[(S.rec(G).n|0)%S.GAPS.length];
  /* 排下一次：今天或明天那一場（傳的時間到了才傳，S.fire）。間隔：上一次以後 12～16 天（S.GAPS 輪流）；考試前兩週和考試週 7 天；刑總那一則不看間隔（同一天不重複）*/
  S.plan=function(G){ const R=S.rec(G); if(R.plan&&R.plan.state==='planned') return null; if(!S.firstDone(R)) return null;
    const last=R.last!=null?R.last:-1e9;
    for(const d of [G.day,G.day+1]){ if(d<=last||S.block(G,d)) continue;
      let x=S.crimPick(G,d);
      if(!x&&d>=last+7&&(d>=last+S.gapOf(G)||S.examish(d))) x=S.pickFor(G,d);
      if(x){ R.plan=Object.assign({state:'planned'},x); return R.plan; } }
    return null; };
  S.fire=function(G){ const R=S.rec(G), p=R.plan; if(!p||p.state!=='planned'||NOW(G)<T(p.sd,p.sh)) return false;
    if(NOW(G)>=T(p.day,p.h)-0.25||S.block(G,p.day)||!freeAt(G,p.place,p.day,p.h)){ p.state='dropped'; R.plan=null; return false; }   /* 過了、那一天不能約了：這次不約，之後再排 */
    if(typeof INV==='undefined'||!INV.offer) return false;
    S.contact(G);
    const iv=INV.offer(G,YT,p.place,p.day,p.h,L.next[p.k],{day:p.sd,h:p.sh}); if(!iv){ p.state='dropped'; R.plan=null; return false; }
    iv.cat='study'; iv.yts={k:p.k}; p.iv=iv.id; p.state='sent'; R.last=p.day; R.n=(R.n|0)+1;
    if(p.k===2){ const t=termOf(p.day); R.ex=t?t.id:true; } else R.rot=(R.rot|0)+1;
    R.plan=null; R.lastPlan=p; return true; };
  S.phone=function(G){ if(!G||!law(G)||!met(G)||typeof PHONE==='undefined') return; S.firstExpire(G); S.firstPhone(G);
    { const R=S.rec(G); if(R.first==='sent'&&R.fday!=null&&NOW(G)>=T(R.fday-1,S.SEND_H)) S.contact(G); }   /* 第一則傳出去的那一刻 */
    S.plan(G); S.fire(G); };
  /* 回覆她的邀約（INV.ON_ANSWER）：改天＝不打開「自己選時間」（她下一次會再約）*/
  S.onInv=(G,iv,ans)=>iv&&iv.yts&&ans==='later'?{noFlow:true}:null;
  /* 見面（invites3d.js S.meet 的兩個掛勾）*/
  const play=async(GM,who,lines)=>{ for(const [w,t] of lines) await GM.say(w===YT?who:null,t); };
  S.onSeated=async function(GM,iv,who,P){ if(!iv||!iv.yts||iv.who!==YT) return; const G=GM.G, R=S.rec(G); iv.ytsSt=(G.stats&&G.stats.study)|0;
    if(iv.yts.first&&!iv.ytsX){ iv.ytsX=1; await GM.say(who,L.firstExtra); }
    const i=(R.dur|0)%L.during.length; R.dur=(R.dur|0)+1; await play(GM,who,L.during[i]); };
  S.onStayed=async function(GM,iv,who,P){ if(!iv||!iv.yts||iv.who!==YT) return; const G=GM.G, st=(G.stats&&G.stats.study)|0;
    if(iv.ytsSt!=null&&st===iv.ytsSt){ const hrs=(P&&P.stay)||1; G.stats=G.stats||{}; G.stats.study=st+Math.max(1,Math.round(hrs)); if(typeof STORY!=='undefined'&&STORY.onStudy){ try{ STORY.onStudy(GM,hrs); }catch(e){ console.warn('STORY.onStudy',e); } } }   /* 一般流程沒算到的（還沒到第 N 場的階段）補算 */
    if(G.zone==='wz_mokuyobi'&&typeof STORY!=='undefined'&&STORY.studyNarr){ const nl=STORY.studyNarr(GM); if(nl) for(const l of [].concat(nl)){ if(Array.isArray(l)) await GM.say(l[0]?{name:l[0]}:null,l[1]); else await GM.say(null,l); } }   /* 照木曜日的讀書（AA_618 1-3）：讀完那裡的一句 */
    delete iv.ytsSt; };

  /* =====================================================================
     二、一盞茶屋十週年
     ===================================================================== */
  S.TEA10_DAY='2028-12-16'; S.TEA10_H=19; S.TEA10_ID='yt_tea10'; S.TEA10_EVID='ev_yt_tea10';
  S.TEA10_CG=null;   /* 稿：CG 改成茶屋。茶屋的 CG 還沒有（cg_anniversary_23 的圖是麵店）——圖登錄到 CG_REGISTRY 以後填這裡 */
  S.tea10Day=()=>DK(S.TEA10_DAY);
  const tzH=(G,d,h)=>h+(typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,d):0);   /* 臺灣時間 → 手機的當地時間 */
  S.awayOn=(G,d)=>typeof STORY!=='undefined'&&!!STORY.abroad&&!!STORY.abroad(Object.assign({},G,{day:d}));
  /* 和可昕交往、她沒見過大家：可昕不在場；散場後祐廷自動傳照片（KX_MET_NOODLE_TEAM＝見過桌遊團那群人，AA_11 的 KX_MET_GANG）*/
  S.kxAway=G=>dating(G,'kexin')&&!(G.flags&&G.flags.KX_MET_NOODLE_TEAM);
  S.KX_H=21;
  S.kxPhone=function(G,d){ if(G.flags.YT_TEA10!=='there'||!S.kxAway(G)||NOW(G)<T(d,S.KX_H)||G.day>d+1||typeof PHONE==='undefined') return;
    PHONE.at(G,d,S.KX_H,[{th:'p:kexin',from:'player',who:null,text:L.kxPhoto}].concat(L.kxReply.map(t=>({th:'p:kexin',from:'kexin',text:t}))),'yt_tea10_kx'); };
  S.tea10Phone=function(G){ const F=F_(G), d=S.tea10Day(); if(d==null||!law(G)||!met(G)) return; S.kxPhone(G,d); if(F.YT_TEA10!=null) return;
    if(S.awayOn(G,d)){ const h=tzH(G,d,19.5); if(NOW(G)<T(d,h)) return; F.YT_TEA10='remote'; remember(YT,'ANNIVERSARY_23','聽說');   /* 遠端版：臺灣 19:30 */
      const ok=typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,YT)||S.datingYT(G);
      if(ok&&typeof PHONE!=='undefined'){ const it=ytItem(L.usPhoto); if(S.TEA10_CG&&typeof CG_REGISTRY!=='undefined'&&CG_REGISTRY[S.TEA10_CG]) it.cg=S.TEA10_CG; PHONE.at(G,d,h,[it,ytItem(L.usLine)],'yt_tea10_photo'); }
      return; }
    if(G.day<d-5||NOW(G)>=T(d,S.TEA10_H+0.75)||typeof OUT==='undefined'||OUT.get(G,S.TEA10_ID)) return;
    OUT.plan(G,{id:S.TEA10_ID,ev:S.TEA10_EVID,day:d,h:S.TEA10_H,late:0.75,place:'一盞茶屋',title:'一盞茶屋十週年',travel:'走過去約 15 分鐘',travelH:0.25}); };
  S.rainNow=function(GM){ const G=GM&&GM.G; if(!G||G.weather==='typhoon') return; G.weather='rain'; if(GM.E&&GM.E.setWeather) GM.E.setWeather('rain'); };
  const C=f=>({custom:f});
  S.umb=()=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(YT,'SHARED_UMBRELLA');   /* 看過事件 1 的雨天（events.js ev_rain_library_door）*/
  /* 來的朋友（AA_11 事件 15「同班圈依玩家四年和他們的關係」）：認識、朋友以上、那天在臺北；沛珊＝重聚以後（STORY.psPre：沒交往的新線重聚以前）、聯絡得到（presence 不是 lost／unreachable），她從台南上來 */
  const STG=()=>(typeof SOCIAL!=='undefined'&&SOCIAL.STAGES)||[];
  S.friendOk=function(G,id){ if(!knows(id,G)||typeof SOCIAL==='undefined'||!SOCIAL.stage) return false; const L0=STG(); if(L0.indexOf(SOCIAL.stage(id))<L0.indexOf('FRIEND')) return false;
    const pr=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,G):{here:true};
    if(id==='classmate_peishan'){ if(typeof STORY!=='undefined'&&STORY.psPre&&STORY.psPre(G)) return false; return !!pr&&!pr.lost&&pr.kind!=='unreachable'; }
    return !!pr&&(pr.here||pr.kind==='taipei'); };
  S.friendsIn=G=>L.friends.filter(([id])=>S.friendOk(G,id)).slice(0,3).map(([id])=>id);   /* 有來才說，最多三句 */
  S.friendLines=()=>{ const out=[]; for(const [id,lines] of L.friends){ const on=C(G=>S.friendsIn(G).includes(id)); let first=true;
      for(const [w,t] of lines){ if(first&&w===null) out.push({if:on,speaker:id,expression:'neutral'});   /* 以安那一則旁白在前：先把她的立繪叫出來（沒有字）*/ out.push({if:on,speaker:w,text:t}); first=false; } }
    return out; };
  S.TEA10_EV={ id:S.TEA10_EVID, title:'一盞茶屋十週年', participants:[YT], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    prereq:{custom:G=>G.flags.YT_TEA10==null},
    dialogue:[ {scene:'一盞茶屋',bg:'wenzhou_teahouse'} ]
      .concat(L.tea10.map(([w,t])=>({speaker:w,text:t})))
      .concat(S.friendLines())
      .concat([ {call:async(G,GM)=>S.rainNow(GM)},
        {speaker:null,text:L11.rainOpen},
        {if:C(G=>!S.datingYT(G)&&!S.datingOther(G)&&S.umb()),speaker:YT,text:L.rain},
        {if:C(G=>!S.datingYT(G)&&!S.datingOther(G)&&!S.umb()),speaker:YT,text:L.rainNo},
        {if:C(G=>!S.datingYT(G)&&S.datingOther(G)),speaker:YT,text:L11.other},
        {if:C(G=>S.datingYT(G)&&knows(ZHE,G)),speaker:YT,text:L11.dt[0]},
        {if:C(G=>S.datingYT(G)),speaker:YT,text:L11.dt[1]},
        {set:{YT_TEA10:'there'}},{mem:[{npc:YT,tag:'ANNIVERSARY_23',note:''}]} ]),
    after:G=>{ if(G.flags.YT_TEA10==null) G.flags.YT_TEA10='there'; },
    outingMissed:G=>{ if(G.flags.YT_TEA10==null) G.flags.YT_TEA10='missed'; } };

  /* ---------- 接到遊戲 ---------- */
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e&&e.id===S.TEA10_EV.id)) STORY_EVENTS.push(S.TEA10_EV);
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._aa625Phone){ STORY._aa625Phone=true; STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('AA625 study',e); } try{ S.tea10Phone(G); }catch(e){ console.warn('AA625 tea10',e); } }); }
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE._aa625){ PHONE._aa625=true; PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAsk(G,m,o,k)); }
  if(typeof INV!=='undefined'){
    if(Array.isArray(INV.ON_ANSWER)&&!INV._aa625Ans){ INV._aa625Ans=true; INV.ON_ANSWER.push((G,iv,ans)=>S.onInv(G,iv,ans)); }
    if(Array.isArray(INV.ON_SEATED)&&!INV.ON_SEATED.includes(S.onSeated)) INV.ON_SEATED.push(S.onSeated);
    if(Array.isArray(INV.ON_STAYED)&&!INV.ON_STAYED.includes(S.onStayed)) INV.ON_STAYED.push(S.onStayed); }
  return S;
})();
if(typeof window!=='undefined') window.AA625=AA625;
