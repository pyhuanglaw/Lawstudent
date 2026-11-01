/* ===== 寒暑假：快轉的停點、摘要日、返鄉訊息（AA_340 第 6 節，企劃線 171b62fb；D99 第二優先「寒暑假系統」；任務 HOL-FF-AA340-1020）=====
   home3d.js 管快轉本身（S.breakJump：要回的訊息、事件包登記的事件到了就停；S.ffMenu：停下來打開手機，按「跳過」接著跳）；這個檔放資料和登記：
   - H1：大四寒假的停點（HOME.BREAK_PTS.Y4W）。每個寒假的除夕 12:00、初一 11:00 一定停；除夕人不在家（宿舍）的 17:00 也停（媽媽「飯快好了。」回家吃年夜飯，HOME.eveDue）。
         事件包登記的「那一天要演」都會停：HOME.STOPS（原本就有）、STORY.WAKE_AT（睡著也會醒來的時間＝快轉也停，這裡登記）、
         STORY_EVENTS 只演一次、在家或任何地方演的事件（home3d.js S.mustEvs，日期寫在 prereq 裡的也算）。
   - H3：大二以後每個寒暑假，朋友回老家、回臺北的訊息（照大一 VA-02 的做法；字照大一的原句，AA_340 6-1「字照 AA_197 1-4 的所在地換，不另寫」）。
   - 6-3：兩邊都空的週，摘要日的旁白（快轉停在那一天 18:30，日期卡下面那一行）＋群組訊息（大三寒假 2/20 開學前一晚麵店是一趟出遊；AA_345 H1、H4）。
   - AA_345（2026-10-21）H1～H7：大三寒假那一頓改 2/20、大三大四寒假回來的日子、大三暑假 8/12 兩版（日本路線 jp3d.js 的 s_0812 也用這裡的 S.y3sPath）、大四寒假 1/17 補三種人、大二以後柏翰暑假只說「我回新竹了。」。
   台詞照 AA 稿，一字不改；AA 稿沒有字的不寫。存檔：G.flags.HOL_Y3W_NOODLE（'go'／'no'），訊息照 PHONE 的 tag。測試：node tests/holiday_ff_unit.js */
'use strict';
const HOLFF=(function(){
  const S={};
  const T=(d,h)=>d*24+h;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const met=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const atLeast=(id,st)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!met(id)) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(st); };
  const abroadOn=(G,d)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}));   /* 交換在國外（日本 3/25～8/5、美國 8/2～12/23）*/
  const brk=G=>law(G)&&typeof HOME!=='undefined'&&HOME.lawBreak?HOME.lawBreak(G):null;

  /* ---------- H1 大四寒假（2028-12-25～2029-02-18；開學 2/19）：AA_327 2-Y4-23～29、AA_340 6-2／6-3 ----------
     表上只放固定的：除夕 2/12 12:00、初一 2/13 11:00、2/18 17:00 開學前一天。其他用現有的動態停點：12/25 可昕聖誕、1/6 KH、2/14 視訊（出遊）、
     1/8 成績（成績公布日）、1/2、1/8、2/2、2/12 那幾則有選項的訊息（H2）；1/17、1/24 摘要日在下面 6-3；2/3 筆試在 S.stops。*/
  S.Y4W=[['2029-02-12',12,'eve'],['2029-02-13',11,'cny'],['2029-02-18',17,'back']];

  /* ---------- 6-3 兩邊都空的週：摘要日（AA_340 6-3，第①級）----------
     快轉停在那一天 18:30（同表上的摘要日），日期卡下面那一行是旁白。那天人在國外（假期的出國活動、交換）、那天有報名的活動＝不停、不出（同 HOME.sumSkip）。
     line 是函式的：回傳 null＝那一種玩家沒有字（照樣停，日期卡寫地點）*/
  const Y4P={bar:'（寒假。你每天八點到總圖，坐同一個位子。）',grad:'（筆試前兩週。你把考古題做到第五年。）',undecided:'（寒假。你還沒決定，每天還是去總圖坐一下。）',
    gradPass:'（寒假。推甄上了，你還是每天去總圖，先讀研究所要修的書。）',other:'（寒假。你不用考試。事務所寄來一份實習前要先讀的資料。）',exch:'（寒假。你的考試還要再一年。每天還是到總圖坐一下。）'};   /* AA_345 H5 補的三種（新寫）*/
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  /* 大三暑假 8/12（AA_340 6-3；AA_345 H3 換句：這時候 Y4_PATH 已經選好了）：選好了（國考、研究所、實習）／還沒決定兩版。
     台灣路線照下面的摘要日（日期卡下面那一行）；日本路線 8/5 回來以後住家裡（jp3d.js 的 s_0812）也用這一個；美國路線 8/2 起在國外，沒有 */
  S.y3sPath=G=>{ const p=G&&G.flags&&G.flags.Y4_PATH; return p&&p!=='undecided'?'（八月。你把大四要走的那條路寫在紙上，下面列了要讀的書。列到第三頁。）':'（八月。你把大四可以走的路寫在紙上：國考、研究所。兩個都畫了問號。）'; };
  S.SUMS=[
    {date:'2026-01-14',line:'（寒假第四週。你把上學期的筆記重新整理了一次。民總那本比刑總厚。）'},   /* 大一寒假 1/12～1/18 */
    {date:'2026-08-12',line:'（暑假過了一半。你把大二上的課表排了三次。）'},   /* 大一暑假 8/10～8/16 */
    {date:'2027-02-16',line:'（開學前一週。你先把下學期的一本課本買了。）'},   /* 大二寒假 2/15～2/21 */
    {date:'2027-08-15',line:'（八月中。你把大三的課表印出來，貼在書桌前面。）'},   /* 大二暑假 8/9～8/22 */
    {date:'2028-01-19',line:'（寒假第四週。你回國中的學校走了一圈。圍牆換了顏色。）'},   /* 大三寒假 1/17～1/23 */
    {date:'2028-02-02',line:'（初八。公館的店一間一間開了。）'},   /* 大三寒假 1/31～2/13 */
    {date:'2028-07-18',line:G=>typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)?'（你在家裡的書桌讀書。媽媽每兩個小時進來問一次要不要吃水果。）':'（暑假的宿舍很安靜。走廊只聽得到冷氣的聲音。）'},   /* 大三暑假 7/10～7/23：回家住／續住（照人在哪）*/
    {date:'2028-08-12',line:G=>S.y3sPath(G),noJP:true},   /* 大三暑假 8/6～8/20（AA_345 H3）：日本路線住家裡那幾週是 jp3d.js 的快轉（s_0812），這裡不重複 */
    {date:'2029-01-17',line:G=>{ const F=G.flags||{}, r=route(G); if(r==='JP'||r==='US') return Y4P.exch; if(F.Y4_PATH==='grad'&&F.Y4_PUSH==='pass') return Y4P.gradPass; return Y4P[F.Y4_PATH]||null; }},   /* 大四寒假：照 Y4_PATH（AA_340 6-3 三版＋AA_345 H5 推甄上了、實習（先不考））；日本、美國路線（交換延畢，2030 才考）蓋過上面 */
    {date:'2029-01-24',line:'（寒假第五週。總圖的人比期末考的時候還多。）'} ];
  S.SUM_H=18.5;
  S.sums=function(G,B){ B=B||brk(G); if(!B) return []; const out=[];
    for(const s of S.SUMS){ const d=DK(s.date); if(d==null||d<B.from||d>B.to) continue; if(HOME.sumSkip&&HOME.sumSkip(G,d)) continue; if(abroadOn(G,d)) continue; if(s.noJP&&route(G)==='JP') continue; if(s.homeOnly&&!(HOME.at&&HOME.at(G))) continue; out.push({day:d,h:S.SUM_H,s}); }   /* homeOnly：只有人在家的停（AA_532 2-5 元宵）*/
    return out; };
  /* 日期卡下面那一行（HOME.CARD_LINES）：快轉剛好停在摘要日的 18:30 */
  S.cardLine=function(G,t){ const x=S.sums(G).find(q=>Math.abs(T(q.day,q.h)-t)<1e-6); if(!x) return null; const l=typeof x.s.line==='function'?x.s.line(G):x.s.line; return l||null; };

  /* ---------- 停點（HOME.STOPS；fn(G,now) 回傳時間的陣列，只算 now 以後的）----------*/
  S.stops=function(G,now){ const B=brk(G); if(!B) return null; const out=[], F=G.flags||{};
    /* 除夕、初一一定停（每個寒假；表上有的同一個時間）；除夕人不在家＝17:00 也停（宿舍的玩家照 HOME.eveDue 回家吃年夜飯，快轉不會直接跳到初一）*/
    const e=HOME.eveDay?HOME.eveDay(B):null; if(e!=null){ out.push(T(e,12)); if(!HOME.at(G)) out.push(T(e,17)); if(e+1<=B.to) out.push(T(e+1,11)); }
    /* 事件包登記的「睡著也會醒來」（STORY.WAKE_AT、STORY.lawWakeAt）＝快轉也停：今天還沒到的那個時間（breakJump 每小時問一次，G 就是那個時間）*/
    if(typeof STORY!=='undefined'&&STORY.lawWakeAt&&Math.abs(T(G.day,G.hour)-now)<1e-6){ let w=null; try{ w=STORY.lawWakeAt(G); }catch(err){ w=null; } if(w!=null) out.push(T(G.day,w)); }
    for(const x of S.sums(G,B)) out.push(T(x.day,x.h));   /* 6-3 摘要日 */
    for(const x of S.eveStops(G)) out.push(x);   /* AA_532 2-1：除夕 18:30 年夜飯（還沒演的那兩年）：睡覺、快轉都停在那裡 */
    { const d=DK('2029-02-03'), r=typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null; if(d!=null&&B.key==='Y4W'&&r!=='JP'&&r!=='US'&&F.Y4_PATH==='grad'&&F.Y4_PUSH==='fail'&&!F.GRAD_EXAM_2029) out.push(T(d,8)); }   /* 2-Y4-27：台灣路線、選研究所、推甄沒上＝2/3 09:00 研究所筆試（R8 強制進考場，08:00 起）*/
    return out.filter(x=>x>now+1e-6); };

  /* ---------- H3 朋友回老家、回臺北（AA_340 6-1；照大一 VA-02：story3d.js 大一寒假那一段、vac_activities.js 的 va02_*）----------
     字照大一的原句。日子照大一（AA_197 1-4「之後各年照同樣的模式排」），有劇情的年份照該年的文件：
       以安：大二寒假 2/1～2/20、大二暑假 7/24 起在台中（AA_271 D26，大二寒假先去東京 C11、暑假 8/9 京都 C12）；大三寒假 1/24～1/28 回台中過年（AA_275 第 12 節，characters.js）；
             大三暑假在日本＝沒有；大四寒假 2/9～2/17（AA_271 D26，AA_244「過年才回台中」，2/3 筆試以後）。
       阿哲：每年寒假在海邊那天 21:00「我明天回高雄」（AA_264 第 5 節第 1 點；大二那一則在 vac3d.js nye_y2_zhe）；大二～大四的字照年份換（AA_456 1-4）。
     寫法同大一：寒假的以安＝FAMILIAR 以上私訊、不到（認識、在麵店團）＝群組只有第一句；暑假的以安＝FAMILIAR 以上私訊、和她交往中不傳（大一 va02 的規則）；其他＝麵店團群組。
     大三寒假阿哲回臺北、大四寒假柏翰兩則和阿哲回臺北：AA_345 H1、H2 給的日子（大三寒假阿哲 2/18 揪、2/20 回來就去麵店；大四寒假兩個人都要考國考，柏翰只回去過年）。
     柏翰的暑假那則：大二以後只說「我回新竹了。」（他週四在總圖的作息只有大一暑假；AA_345 H7）。
     AA_350 S1、S2（2026-10-21）：大三寒假只回去過年（1/24 17:00、1/28 20:00 兩則）；大三暑假七月要補習（6/27 20:00、7/2 20:00 兩則）。在新竹的日子在 characters.js 的 presence */
  const NT='g:noodle_team';
  S.HOME_MSGS=[
    {tag:'hol_y2w_bh_home',day:'2027-01-09',h:17,th:NT,ms:[['classmate_bohan','我今天回新竹。債總帶回去了，2/19 回來。']]},   /* AA_446 第 1、2 節（企劃線 443360cc0）：大二寒暑假十則換字（和大一一字不差）*/
    {tag:'hol_y2w_an_home',day:'2027-02-01',h:15,an:['回台中了。','我媽來車站接我。她說我瘦了。……沒有。']},
    {tag:'hol_y2w_bh_back',day:'2027-02-19',h:20,th:NT,ms:[['classmate_bohan','回來了。開學前我先去總圖占位子。']]},
    {tag:'hol_y2w_zhe_back',day:'2027-02-20',h:19,th:NT,ms:[['zhe','我回來了！這次帶了烏魚子 我阿嬤做的'],['zhe','開學那天拿去麵店']]},
    {tag:'hol_y2w_an_back',day:'2027-02-21',h:18,an:['回臺北了。我媽在行李箱塞了一袋橘子。']},
    {tag:'hol_y2s_bh_home',day:'2027-06-27',h:20,th:NT,ms:[['classmate_bohan','我回新竹了。家裡的冷氣比宿舍的好。']]},
    {tag:'hol_y2s_zhe_home',day:'2027-06-30',h:22,th:NT,ms:[['zhe','明天回高雄'],['zhe','你們吃麵 我遠端參加']]},
    {tag:'hol_y2s_an_home',day:'2027-07-24',h:15,anS:[['heroine_01','📷（台中家裡的書桌，疊著一疊書）'],['heroine_01','回台中了。這次帶了六本。8 號回去。']]},
    {tag:'hol_y2s_an_back',day:'2027-08-08',h:21,anS:[['heroine_01','回臺北了。六本讀完四本。']]},
    {tag:'hol_y2s_zhe_back',day:'2027-08-21',h:19,th:NT,ms:[['zhe','我回來了'],['zhe','遠端吃麵 一次都沒成功'],['zhe','誰要吃麵']]},
    {tag:'hol_y3w_zhe_home',c01:'Y3',h:21,th:NT,ms:[['zhe','明天回高雄 我阿嬤問你們今年要不要來']]},   /* AA_456 1-4（企劃線 71f260ecc）：大二～大四原本都是「我明天回高雄」，照年份換字；tag 不變 */
    {tag:'hol_y3w_an_home',day:'2028-01-24',h:15,an:['回台中了。','這次只住五天。']},
    {tag:'hol_y3w_bh_home',day:'2028-01-24',h:17,th:NT,ms:[['classmate_bohan','我明天回新竹過年。初三回來。']]},   /* AA_350 S2：大三寒假只回去過年（期末飯「寒假我每天都去總圖」；2028 除夕 1/25）；蓋掉 AA 170a150d 那兩句（1/9「寒假要把民訴讀完」、2/19「民訴沒讀完」）*/
    {tag:'hol_y3w_bh_back',day:'2028-01-28',h:20,th:NT,ms:[['classmate_bohan','回來了。民法讀到物權了。']]},
    {tag:'hol_y3w_an_back',day:'2028-01-29',h:18,an:['回臺北了。','行李箱我先拿出來了。']},
    {tag:'hol_y3w_zhe_back',day:'2028-02-20',h:17.5,th:NT,ms:[['zhe','我回來了 高雄帶了吃的 等一下拿去麵店']]},   /* AA_345 H1：取代大一那句「開學那天拿去給你們」；2/18 21:00 他揪的那一頓在 S.MSGS */
    {tag:'hol_y3s_bh_home',day:'2028-06-27',h:20,th:NT,ms:[['classmate_bohan','我回新竹幾天。七月三號補習班開課就回來。']]},   /* AA_350 S1：七月要補習（7/08 公館補習班），6/27 原本的「我回新竹了。」和期末飯矛盾 */
    {tag:'hol_y3s_zhe_home',day:'2028-06-30',h:22,th:NT,ms:[['zhe','明天回高雄'],['zhe','最後一個暑假了 麵店交給你們']]},
    {tag:'hol_y3s_bh_back',day:'2028-07-02',h:20,th:NT,ms:[['classmate_bohan','回來了。明天開課。']]},
    {tag:'hol_y3s_zhe_back',day:'2028-08-21',h:19,th:NT,ms:[['zhe','我回來了'],['zhe','大四了欸'],['zhe','誰要吃麵']]},
    {tag:'hol_y4w_zhe_home',c01:'Y4',h:21,th:NT,ms:[['zhe','明天回高雄 畢業前最後一個寒假了']]},   /* AA_456 1-4 */
    {tag:'hol_y4w_an_home',day:'2029-02-09',h:15,an:['回台中了。','考完了。這次在家什麼都不讀。']},
    {tag:'hol_y4w_bh_home',day:'2029-02-11',h:17,th:NT,ms:[['classmate_bohan','我明天回新竹。初三回來。']]},   /* AA_345 H2：大四寒假兩個人都要考國考，柏翰只回去過年（2029 除夕 2/12，初三＝2/15）*/
    {tag:'hol_y4w_bh_back',day:'2029-02-15',h:20,th:NT,ms:[['classmate_bohan','回來了。總圖見。']]},
    {tag:'hol_y4w_zhe_back',day:'2029-02-17',h:19,th:NT,ms:[['zhe','我回來了！高雄帶了吃的'],['zhe','禮拜一開學 拿去給你們']]},
    {tag:'hol_y4w_an_back',day:'2029-02-18',h:18,an:['回臺北了。','放榜前，我不想一直看信箱。']} ];
  S.msgDay=m=>m.c01?(typeof VAC!=='undefined'&&VAC.c01Day?VAC.c01Day(m.c01):null):DK(m.day);
  /* 人在國外（日本路線 3/25～8/5，例：大三暑假 6/27 柏翰、6/30 阿哲；美國路線 8/2～12/23，例：8/21 阿哲「我回來了」）：臺灣傳來的訊息換成當地時間
     （遊戲時鐘是當地時間；AA_341 J-S13、AA_342 C6；美國路線 AA_370 L2——原本只換日本路線，美國當地 19:00 才收到＝臺灣隔天 07:00）。不在國外＝0 */
  const abTz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0;
  S.homeMsgs=function(G){ const now=T(G.day,G.hour), F=G.flags||{};
    for(const m of S.HOME_MSGS){ if(PHONE.sent(G,m.tag)) continue; const d=S.msgDay(m), h=d==null?m.h:m.h+abTz(G,d); if(d==null||now<T(d,h)||G.day>d+(m.c01?1:3)) continue;
      if(m.an){ const th='p:heroine_01'; if(atLeast('heroine_01','FAMILIAR')) PHONE.at(G,d,h,m.an.map(t=>({th,from:'heroine_01',text:t})),m.tag); else if(inGrp(G,'noodle_team')&&met('heroine_01')) PHONE.at(G,d,h,[{th:NT,from:'heroine_01',text:m.an[0]}],m.tag); continue; }   /* 大一寒假的寫法（story3d.js an_home_y1）*/
      if(m.anS){ if(!atLeast('heroine_01','FAMILIAR')||F.dating_heroine_01) continue; PHONE.at(G,d,h,m.anS.map(([w,t])=>({th:'p:heroine_01',from:w,text:t})),m.tag); continue; }   /* 大一暑假的寫法（va02_3、va02_4：交往中的另外補）*/
      if(!inGrp(G,m.th.slice(2))) continue; PHONE.at(G,d,h,m.ms.map(([w,t])=>({th:m.th,from:w,text:t})),m.tag); } };

  /* ---------- 6-3 群組訊息（AA_340 6-3）：私訊 21:00；有選項的回覆開到隔天 18:00（R7）----------*/
  S.MSGS=[
    {tag:'hol63_y1w_zhe',day:'2026-01-15',h:21,th:NT,ms:[['zhe','高雄今天二十六度'],['zhe','台北的人在幹嘛']],ask:[{t:'讀書。',say:[['zhe','騙人']]},{t:'睡覺。',say:[['zhe','這才對']]}]},   /* 阿哲在高雄 */
    {tag:'hol63_y2w_pl',day:'2027-02-19',h:21,th:'g:public_law',ms:[['heroine_01','下禮拜開學。讀書會第二週開始。'],['classmate_bohan','收到。']],if:()=>atLeast('heroine_01','FAMILIAR')},   /* 和以安 FAMILIAR 以上、在讀書會群組 */
    {tag:'hol63_y3w_zhe',day:'2028-02-18',h:21,th:NT,ms:[['zhe','禮拜天回台北'],['zhe','開學前最後一頓 禮拜天六點 麵店']],ask:[{t:'去。',set:{HOL_Y3W_NOODLE:'go'}},{t:'不去。',set:{HOL_Y3W_NOODLE:'no'},say:[['zhe','好喔']]}]},   /* AA_345 H1、H4：阿哲 2/20 才從高雄回來；「去。」＝2/20（日）18:00 麵店，開學前一晚（S.EVENTS）*/
    {tag:'hol63_y4w_yu',day:'2029-01-31',h:21,th:NT,ms:[['yu','考試的人 加油'],['yu','沒考試的人 不要吵他們']]} ];
  S.msgs63=function(G){ const now=T(G.day,G.hour);
    for(const m of S.MSGS){ if(PHONE.sent(G,m.tag)) continue; const d=DK(m.day); if(d==null||now<T(d,m.h)||G.day>d+1) continue; if(!inGrp(G,m.th.slice(2))||(m.if&&!m.if(G))) continue;
      const M=m.ms.map(([w,t])=>({th:m.th,from:w,text:t})); if(m.ask) M[M.length-1].ask={id:m.tag,until:T(d+1,18),opts:m.ask.map(o=>Object.assign({t:o.t},o.set?{set:o.set}:{},{say:(o.say||[]).map(([w,t])=>({th:m.th,from:w,text:t}))}))};
      PHONE.at(G,d,m.h,M,m.tag); }
    /* 大三寒假 2/20（日）18:00 麵店（開學前一晚）：回了「去。」＝排出遊（從宿舍走過去；住家裡的照出遊系統從家裡出發；日本路線 2/20 14:00 退宿、人還在臺北，一樣去得了）*/
    const d20=DK('2028-02-20'), F=G.flags||{}; if(F.HOL_Y3W_NOODLE==='go'&&d20!=null&&G.day<=d20&&typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,'hol63_y3w_noodle'))
      OUT.plan(G,{id:'hol63_y3w_noodle',ev:'ev_hol63_y3w_noodle',day:d20,h:18,place:'公館',title:'阿鳳麵店',travel:'走過去約 10 分鐘',travelH:1/6}); };
  S.EVENTS=[
    { id:'ev_hol63_y3w_noodle', title:'阿鳳麵店', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark',
      dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
        {speaker:null,text:'（開學前一晚。長桌坐了一半，阿哲的行李箱還靠在牆邊。大家都在講下學期要修什麼。）'},   /* AA_345 H1（取代「寒假最後一個週六……」）*/
        {speaker:'zhe',text:'大三下了。……時間過得好快，我先講，你們不要笑。'} ] } ];   /* AA_340 6-3（第①級）；2028 年麵店店休 1/19～1/28（AA_333），2/20 開著 */

  /* ================= AA_532 寒暑假（一）（企劃線 ade80d22f；任務 AA532-VAC-FIX-1030；D99 第二優先）=================
     2-1 2027、2029 除夕的年夜飯（在家、18:30 以後；原本那一站停了什麼都沒演）；2-2 四年初一 08:00 家人群組（不用回）；2-3 麵店團初一 2028、2029（2026、2027 在 story3d.js）；
     2-4 和以安交往中、除夕 22:00 她的私訊（大一～大三）；2-5 2027 元宵（回家住＝日期卡下面一句、留宿舍＝20:00 家人群組）；
     第 4 節 父親節 8/8 三年（爸爸在上海；2028 人在國外照時差收）、端午 2026-06-19 12:00（「你回來自己挑」：人不在家才傳）；
     第 7 節 以安的假期計畫（AA_244 第 1 節）：第 15 週週五 21:00 短版——熟（FAMILIAR 以上）私訊、不熟群組；交往中多問一句「你這個假期要做什麼？」。
     台詞照 AA 稿一字不改；手機照家人群組的寫法（媽媽、姊姊不加句號）。存檔：G.flags.AN_PLAN_<假期>（'join'）、AA532_NO（人在家、不傳的 tag）。測試：node tests/aa532_vac_unit.js */
  const tzAt=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0;
  const homeNow=G=>typeof HOME!=='undefined'&&!!((HOME.at&&HOME.at(G))||(HOME.livesHome&&HOME.livesHome(G)));
  const datingAn=G=>!!(G.flags&&G.flags.dating_heroine_01===true);
  const FAMN={dad:'爸爸',mom:'媽媽',sister:'姊姊'};
  const famMsg=([w,t])=>({th:'g:home',from:w,name:FAMN[w],text:t});
  const noSend=(G,tag)=>{ const F=G.flags||(G.flags={}), L=Array.isArray(F.AA532_NO)?F.AA532_NO:(F.AA532_NO=[]); if(!L.includes(tag)) L.push(tag); };
  const noSent=(G,tag)=>Array.isArray(G.flags&&G.flags.AA532_NO)&&G.flags.AA532_NO.includes(tag);
  /* 2-1 除夕的年夜飯：在家（HOME.at）、18:30 以後演一次（trigger:'home'：放假在家的選單每一輪檢查；快轉、睡覺也停在 18:30，S.stops）。日本、美國路線那兩年人在臺灣（照演），人在國外的不演 */
  S.EVE_DINNER={y2:'2027-02-05',y4:'2029-02-12'};
  const eveOn=(G,k)=>law(G)&&G.day===DK(k)&&typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G)&&!abroadOn(G,G.day);
  S.EVENTS.push(
    { id:'ev_aa532_eve_y2', title:'除夕', participants:[], location:'any', trigger:'home', priority:9, time:[18.5,24], once:true, background:'dark', prereq:{custom:G=>eveOn(G,S.EVE_DINNER.y2)},
      dialogue:[ {scene:'臺北・家裡的客廳',bg:'home_living_cny'},
        {speaker:null,text:'（除夕。爸爸昨天從上海回來，行李箱還攤在客廳。）'},
        {speaker:'爸爸',text:'法律系第二年，讀得怎麼樣？'},
        {choice:[{text:'「還可以。」',goto:'a'},{text:'「比第一年難。」',goto:'b'}]},
        {label:'a'},{speaker:'爸爸',text:'還可以就好。……你姊當年也說還可以。'},{speaker:'姊姊',text:'我是真的還可以。'},{goto:'m'},
        {label:'b'},{speaker:'爸爸',text:'難是正常的。（他夾了一塊魚到你碗裡）吃。'},
        {label:'m'},{speaker:'媽媽',text:'魚不要吃完，留一點。'},
        {speaker:null,text:'（電視開著，沒有人在看。十二點的時候，樓下有人在放鞭炮。）'} ], consequences:{advance:1.5} },
    { id:'ev_aa532_eve_y4', title:'除夕', participants:[], location:'any', trigger:'home', priority:9, time:[18.5,24], once:true, background:'dark', prereq:{custom:G=>eveOn(G,S.EVE_DINNER.y4)},
      dialogue:[ {scene:'臺北・家裡的客廳',bg:'home_living_cny'},
        {speaker:null,text:'（除夕。今年爸爸回來得比較晚，昨天半夜才到。）'},
        {speaker:'媽媽',text:'吃完再去讀。今天不准讀。'},
        {speaker:'姊姊',text:'（小聲）她上禮拜也這樣跟我說。我還是加班了。'},
        {speaker:'爸爸',text:'明年這個時候，你在做什麼？'},
        {choice:[{text:'「上班吧。」',goto:'w'},{text:'「還在讀書。」',goto:'s'},{text:'「不知道。」',goto:'n'}]},
        {label:'w'},{speaker:'爸爸',text:'上班就沒有寒假了。……今年多吃一點。'},{goto:'m'},
        {label:'s'},{speaker:'爸爸',text:'讀書好。讀到什麼時候，跟家裡講一聲就好。'},{goto:'m'},
        {label:'n'},{speaker:'爸爸',text:'（點了一下頭）我在你這個年紀也不知道。'},
        {label:'m'},{speaker:null,text:'（吃完飯，媽媽拿出四個紅包。最後一個是給爸爸的。爸爸說他不要，媽媽還是塞給他了。）'} ], consequences:{advance:1.5} } );
  S.eveStops=function(G){ const out=[], done=(G.events&&G.events.done)||{}; for(const k of ['y2','y4']){ const d=DK(S.EVE_DINNER[k]); if(d!=null&&!done['ev_aa532_eve_'+k]&&!abroadOn(G,d)) out.push(T(d,18.5)); } return out; };
  /* 2-2 初一 08:00 家人群組（四年；不用回）*/
  S.CNY_FAM={2026:[['dad','（長輩圖：一匹金色的馬，寫著「馬到成功」）'],['sister','爸 我們都在客廳']],
    2027:[['dad','（長輩圖：一隻羊，寫著「三陽開泰」）'],['mom','你昨天傳過了']],
    2028:[['dad','（長輩圖：一隻猴子拿著桃子，寫著「新春快樂」）'],['sister','爸 你在房間 我們在客廳'],['dad','（讚）']],
    2029:[['dad','（長輩圖：一隻公雞，寫著「大吉大利」）'],['mom','吃早餐了'],['sister','他在廁所傳的']]};
  S.CNY1={2026:'2026-02-17',2027:'2027-02-06',2028:'2028-01-26',2029:'2029-02-13'};
  /* 2-3 麵店團初一 11:00（2028、2029；祐廷三選一，不回就只是沒回）。照片、貼圖那兩個選項傳出去的是照片／貼圖（post），沒有對方回的＝沒有 */
  S.CNY_NOODLE={
    2028:{ms:[['zhe','📷（高雄老家門口，一整排機車）'],['zhe','新年快樂 今年我家來了二十個人'],['zhe','我被分配洗碗'],['heroine_01','📷（台中阿嬤家的客廳，桌上一盤橘子）'],['heroine_01','新年快樂。阿嬤今年問的是，什麼時候要考試。'],['yu','📷（自拍，戴一頂紅色的毛帽）'],['yu','新年快樂！！我媽說這頂帽子很喜氣 我覺得很醜']],
      opts:[{t:'（傳年夜飯的照片）',post:'📷（年夜飯的照片）',say:[['zhe','你家的魚好大']]},{t:'洗碗加油。',say:[['zhe','你也要洗吧']]},{t:'（貼圖）',post:'（貼圖：新年快樂）',say:[]}]},
    2029:{ms:[['zhe','📷（書桌上的考古題，旁邊一盤年糕）'],['zhe','新年快樂 年糕配考古題'],['zhe','最後一個寒假了欸'],['heroine_01','新年快樂。今年阿嬤沒有問。……她直接買了一本六法全書給我。'],['yu','新年快樂！！明年這時候大家都在上班了吧'],['yu','好可怕']],
      opts:[{t:'最後一個寒假。',say:[['zhe','你不要講出來啦']]},{t:'（傳書桌的照片）',post:'📷（書桌的照片）',say:[['heroine_01','你的書桌比我的亂。']]},{t:'（貼圖）',post:'（貼圖：新年快樂）',say:[]}]} };
  /* 2-4 以安：交往中，除夕 22:00 的私訊（大一～大三；不用回）*/
  S.AN_EVE={2026:['除夕。阿嬤家很吵。','我在樓梯間傳的。新年快樂。'],2027:['今年的春聯也是我寫的。','寫到第三張，手就不抖了。……新年快樂。'],2028:['阿嬤問我什麼時候帶人回來給她看。','……我說還早。新年快樂。']};
  /* 2-5 2027-02-20 元宵 */
  S.LANTERN={day:'2027-02-20',card:'（元宵。媽媽煮了湯圓，芝麻的。你吃了三顆，她說太少。）',dorm:[['mom','今天元宵'],['mom','📷（一碗芝麻湯圓）'],['mom','留了一碗 回來吃']]};
  S.SUMS.push({date:S.LANTERN.day,line:G=>homeNow(G)?S.LANTERN.card:null,homeOnly:true});   /* 回家住的：快轉停在那一天 18:30，日期卡下面那一行（留宿舍的不停，20:00 的群組照 X58 會停）*/
  /* 第 4 節 父親節、端午 */
  S.FATHER={2026:{ms:[['sister','爸 父親節快樂'],['dad','（讚）'],['mom','你們兩個記得打電話給他']],opt:{t:'（傳一句「父親節快樂」）',post:'父親節快樂',say:[['dad','（讚）']]}},
    2027:{ms:[['sister','📷（一盒蛋捲）寄去上海了'],['dad','收到 很好吃'],['mom','他已經吃半盒了']]},
    2028:{ms:[['mom','父親節 你們爸說不用打電話 他要加班'],['sister','他每年都這樣說']]}};
  S.DRAGON={day:'2026-06-19',h:12,ms:[['mom','📷（廚房掛著一串粽子）'],['mom','南部粽北部粽都有 你回來自己挑']]};
  /* 第 7 節 以安的假期計畫（AA_244 第 1 節，AA-C 2d3a0735d）：學期第 15 週週五 21:00。①（換字的那幾個假期照表）→ 記 AN_PLAN_<假期>＝join；②不記；③只有熟以上（私訊）。大三暑假她在日本、大四暑假畢業了＝沒有 */
  S.AN_PLAN={
    Y1S1:{key:'Y1W',short:'寒假先在總圖，1/20 回台中',o1:'我也會去總圖。',r1:'三樓。我通常坐靠窗那排。'},
    Y1S2:{key:'Y1S',short:'暑假我上日語課 公館 週二四晚上',r1:'報名到這個禮拜五。第一堂要自我介紹，用日文。',r3:'好。……你要先把五十音背完。'},
    Y2S1:{key:'Y2W',short:'我報了東京的冬季短期課 兩週',r1:'國際處下週五截止。要寫一段報名動機，不用很長。',r3:'好。……那邊很冷，你要帶厚外套。'},
    Y2S2:{key:'Y2S',short:'七月日檢 八月去京都上語言課',r1:'分班考試很難。你是初級的話，我們不會同班。……下課可以一起吃飯。',r3:'好。你到了跟我說。'},
    Y3S1:{key:'Y3W',short:'寒假在臺北準備出國 3/25 出發',o1:'需要幫忙的話叫我。',r1:'……那行李清單你幫我看一次。我怕漏。'},
    Y4S1:{key:'Y4W',short:'寒假留臺北讀書 過年回台中',o1:'我也會在總圖。',r1:'好。……不要坐我旁邊，我會一直想講話。'} };
  S.AN_ASK='你這個假期要做什麼？'; S.AN_ASK_OK='好。'; S.AN_ASK_NONE='還沒想'; S.AN_ASK_LATER='那我們再排。';
  S.anPlanDay=tid=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(tid):null; return r?r.from+14*7+4:null; };   /* 第 15 週週五 */
  /* 那個假期報了的活動（行事曆上的）：交往中那一問的「照行事曆回答」＝活動的名字 */
  S.breakRegs=function(G,tid){ if(typeof VAC==='undefined'||!VAC.rec||!VAC.inst||typeof CALENDAR==='undefined') return []; const r=CALENDAR.termDays(tid), B=r&&typeof HOME!=='undefined'&&HOME.breakOf?HOME.breakOf(r.to+1):null; if(!B) return [];
    const R=VAC.rec(G).reg, out=[]; for(const k in R){ if(R[k]!=='yes') continue; const [id,yk]=k.split('@'), I=VAC.inst(id,yk); if(I&&I.from>=B.from&&I.from<=B.to&&I.A&&I.A.title&&!out.includes(I.A.title)) out.push(I.A.title); } return out; };
  S.anPlan=function(G){ const now=T(G.day,G.hour), AN='heroine_01';
    for(const tid in S.AN_PLAN){ const X=S.AN_PLAN[tid], d=S.anPlanDay(tid), tag='aa532_an_plan_'+tid; if(d==null||now<T(d,21)||G.day>d+1||PHONE.sent(G,tag)) continue;
      if(!met(AN)||abroadOn(G,d)) continue;
      const fam=atLeast(AN,'FAMILIAR'), th=fam?'p:'+AN:NT; if(!fam&&!inGrp(G,'noodle_team')) continue;
      const say=t=>[{th,from:AN,text:t}], set={['AN_PLAN_'+X.key]:'join'};
      const opts=[{t:X.o1||'我也想報。',set,say:say(X.r1)},{t:'好，加油。',say:[]}]; if(fam&&X.r3) opts.push({t:'那我們那邊見？',set,say:say(X.r3)});
      const M=[{th,from:AN,text:X.short,ask:{id:tag,until:T(d+7,21),opts}}];
      if(fam&&datingAn(G)){ const regs=S.breakRegs(G,tid), O=regs.length?[{t:regs.join('、'),say:say(S.AN_ASK_OK)}]:[]; O.push({t:S.AN_ASK_NONE,say:say(S.AN_ASK_LATER)}); M.push({th,from:AN,text:S.AN_ASK,ask:{id:tag+'_q',until:T(d+7,21),opts:O}}); }
      PHONE.at(G,d,21,M,tag); } };
  S.aa532=function(G){ const now=T(G.day,G.hour);
    /* 2-2、2-3、2-4 */
    for(const y in S.CNY1){ const ny=DK(S.CNY1[y]); if(ny==null) continue;
      { const tag='aa532_cny_fam_'+y; if(now>=T(ny,8)&&G.day<=ny+1&&!PHONE.sent(G,tag)&&!abroadOn(G,ny)){ PHONE.join(G,'home','家人'); PHONE.at(G,ny,8,S.CNY_FAM[y].map(famMsg),tag); } }
      { const C=S.CNY_NOODLE[y], tag='aa532_cny_noodle_'+y; if(C&&now>=T(ny,11)&&G.day<=ny+4&&inGrp(G,'noodle_team')&&!PHONE.sent(G,tag)){ const M=C.ms.map(([w,t])=>({th:NT,from:w,text:t}));
          M[M.length-1].ask={id:tag+'_reply',opts:C.opts.map(o=>Object.assign({t:o.t},o.post?{post:o.post}:{},{say:o.say.map(([w,t])=>({from:w,text:t}))}))}; PHONE.at(G,ny,11,M,tag); } }
      { const L=S.AN_EVE[y], e=ny-1, tag='aa532_an_eve_'+y; if(L&&now>=T(e,22)&&G.day<=e+1&&datingAn(G)&&!PHONE.sent(G,tag)) PHONE.at(G,e,22,L.map(t=>({th:'p:heroine_01',from:'heroine_01',text:t})),tag); } }
    /* 2-5 元宵：留宿舍的 20:00 家人群組（那時候人在家＝不傳，記 AA532_NO）*/
    { const d=DK(S.LANTERN.day), tag='aa532_lantern_dorm'; if(d!=null&&now>=T(d,20)&&G.day<=d+1&&!PHONE.sent(G,tag)&&!noSent(G,tag)){ if(homeNow(G)) noSend(G,tag); else { PHONE.join(G,'home','家人'); PHONE.at(G,d,20,S.LANTERN.dorm.map(famMsg),tag); } } }
    /* 第 4 節 父親節 8/8 20:00（台灣時間；人在國外照當地時間）*/
    for(const y in S.FATHER){ const d=DK(y+'-08-08'), X=S.FATHER[y], tag='aa532_father_'+y; if(d==null) continue; const h=20+tzAt(G,d), dd=d+Math.floor(h/24), hh=h-Math.floor(h/24)*24;
      if(now<T(dd,hh)||G.day>dd+1||PHONE.sent(G,tag)) continue; PHONE.join(G,'home','家人'); const M=X.ms.map(famMsg);
      if(X.opt) M[M.length-1].ask={id:tag+'_reply',until:T(dd+1,hh),opts:[{t:X.opt.t,post:X.opt.post,say:X.opt.say.map(famMsg)}]}; PHONE.at(G,dd,hh,M,tag); }
    /* 第 4 節 端午 2026-06-19 12:00（人不在家才傳）*/
    { const d=DK(S.DRAGON.day), tag='aa532_dragon_2026'; if(d!=null&&now>=T(d,S.DRAGON.h)&&G.day<=d+1&&!PHONE.sent(G,tag)&&!noSent(G,tag)&&!abroadOn(G,d)){ if(homeNow(G)) noSend(G,tag); else { PHONE.join(G,'home','家人'); PHONE.at(G,d,S.DRAGON.h,S.DRAGON.ms.map(famMsg),tag); } } }
    S.anPlan(G); };

  /* ---------- 手機規則（STORY.PHONE_RULES：在家、在外面、跳過時間的時候每小時一次）----------*/
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; S.homeMsgs(G); S.msgs63(G); try{ S.aa532(G); }catch(e){ console.warn('HOLFF.aa532',e); } };

  /* ---------- 登記 ----------*/
  if(typeof HOME!=='undefined'){
    if(HOME.BREAK_PTS&&!HOME.BREAK_PTS.Y4W) HOME.BREAK_PTS.Y4W=S.Y4W;
    if(Array.isArray(HOME.STOPS)) HOME.STOPS.push((G,now)=>S.stops(G,now));
    if(Array.isArray(HOME.CARD_LINES)) HOME.CARD_LINES.push((G,t)=>S.cardLine(G,t)); }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  return S;
})();
