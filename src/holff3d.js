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
    for(const s of S.SUMS){ const d=DK(s.date); if(d==null||d<B.from||d>B.to) continue; if(HOME.sumSkip&&HOME.sumSkip(G,d)) continue; if(abroadOn(G,d)) continue; if(s.noJP&&route(G)==='JP') continue; out.push({day:d,h:S.SUM_H,s}); }
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
    { const d=DK('2029-02-03'), r=typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null; if(d!=null&&B.key==='Y4W'&&r!=='JP'&&r!=='US'&&F.Y4_PATH==='grad'&&F.Y4_PUSH==='fail'&&!F.GRAD_EXAM_2029) out.push(T(d,8)); }   /* 2-Y4-27：台灣路線、選研究所、推甄沒上＝2/3 09:00 研究所筆試（R8 強制進考場，08:00 起）*/
    return out.filter(x=>x>now+1e-6); };

  /* ---------- H3 朋友回老家、回臺北（AA_340 6-1；照大一 VA-02：story3d.js 大一寒假那一段、vac_activities.js 的 va02_*）----------
     字照大一的原句。日子照大一（AA_197 1-4「之後各年照同樣的模式排」），有劇情的年份照該年的文件：
       以安：大二寒假 2/1～2/20、大二暑假 7/24 起在台中（AA_271 D26，大二寒假先去東京 C11、暑假 8/9 京都 C12）；大三寒假 1/24～1/28 回台中過年（AA_275 第 12 節，characters.js）；
             大三暑假在日本＝沒有；大四寒假 2/9～2/17（AA_271 D26，AA_244「過年才回台中」，2/3 筆試以後）。
       阿哲：每年寒假在海邊那天 21:00「我明天回高雄」（AA_264 第 5 節第 1 點；大二那一則在 vac3d.js nye_y2_zhe）。
     寫法同大一：寒假的以安＝FAMILIAR 以上私訊、不到（認識、在麵店團）＝群組只有第一句；暑假的以安＝FAMILIAR 以上私訊、和她交往中不傳（大一 va02 的規則）；其他＝麵店團群組。
     大三寒假阿哲回臺北、大四寒假柏翰兩則和阿哲回臺北：AA_345 H1、H2 給的日子（大三寒假阿哲 2/18 揪、2/20 回來就去麵店；大四寒假兩個人都要考國考，柏翰只回去過年）。
     柏翰的暑假那則：大二以後只說「我回新竹了。」（他週四在總圖的作息只有大一暑假；AA_345 H7）。*/
  const NT='g:noodle_team';
  S.HOME_MSGS=[
    {tag:'hol_y2w_bh_home',day:'2027-01-09',h:17,th:NT,ms:[['classmate_bohan','我今天回新竹。2/19 回來。']]},
    {tag:'hol_y2w_an_home',day:'2027-02-01',h:15,an:['回台中了。','📷（車窗外的田）']},
    {tag:'hol_y2w_bh_back',day:'2027-02-19',h:20,th:NT,ms:[['classmate_bohan','回來了。']]},
    {tag:'hol_y2w_zhe_back',day:'2027-02-20',h:19,th:NT,ms:[['zhe','我回來了！高雄帶了吃的，開學那天拿去給你們']]},
    {tag:'hol_y2w_an_back',day:'2027-02-21',h:18,an:['回臺北了。']},
    {tag:'hol_y2s_bh_home',day:'2027-06-27',h:20,th:NT,ms:[['classmate_bohan','我回新竹了。']]},
    {tag:'hol_y2s_zhe_home',day:'2027-06-30',h:22,th:NT,ms:[['zhe','明天回高雄'],['zhe','麵店團不能斷喔']]},
    {tag:'hol_y2s_an_home',day:'2027-07-24',h:15,anS:[['heroine_01','📷（高鐵窗外的田）'],['heroine_01','回台中了。8 號回去。']]},
    {tag:'hol_y2s_an_back',day:'2027-08-08',h:21,anS:[['heroine_01','回臺北了。台中好熱。']]},
    {tag:'hol_y2s_zhe_back',day:'2027-08-21',h:19,th:NT,ms:[['zhe','我回來了'],['zhe','誰要吃麵']]},
    {tag:'hol_y3w_zhe_home',c01:'Y3',h:21,th:NT,ms:[['zhe','我明天回高雄']]},
    {tag:'hol_y3w_bh_home',day:'2028-01-09',h:17,th:NT,ms:[['classmate_bohan','我今天回新竹。2/19 回來。']]},
    {tag:'hol_y3w_an_home',day:'2028-01-24',h:15,an:['回台中了。','📷（車窗外的田）']},
    {tag:'hol_y3w_an_back',day:'2028-01-29',h:18,an:['回臺北了。']},
    {tag:'hol_y3w_bh_back',day:'2028-02-19',h:20,th:NT,ms:[['classmate_bohan','回來了。']]},
    {tag:'hol_y3w_zhe_back',day:'2028-02-20',h:17.5,th:NT,ms:[['zhe','我回來了 高雄帶了吃的 等一下拿去麵店']]},   /* AA_345 H1：取代大一那句「開學那天拿去給你們」；2/18 21:00 他揪的那一頓在 S.MSGS */
    {tag:'hol_y3s_bh_home',day:'2028-06-27',h:20,th:NT,ms:[['classmate_bohan','我回新竹了。']]},
    {tag:'hol_y3s_zhe_home',day:'2028-06-30',h:22,th:NT,ms:[['zhe','明天回高雄'],['zhe','麵店團不能斷喔']]},
    {tag:'hol_y3s_zhe_back',day:'2028-08-21',h:19,th:NT,ms:[['zhe','我回來了'],['zhe','誰要吃麵']]},
    {tag:'hol_y4w_zhe_home',c01:'Y4',h:21,th:NT,ms:[['zhe','我明天回高雄']]},
    {tag:'hol_y4w_an_home',day:'2029-02-09',h:15,an:['回台中了。','📷（車窗外的田）']},
    {tag:'hol_y4w_bh_home',day:'2029-02-11',h:17,th:NT,ms:[['classmate_bohan','我明天回新竹。初三回來。']]},   /* AA_345 H2：大四寒假兩個人都要考國考，柏翰只回去過年（2029 除夕 2/12，初三＝2/15）*/
    {tag:'hol_y4w_bh_back',day:'2029-02-15',h:20,th:NT,ms:[['classmate_bohan','回來了。總圖見。']]},
    {tag:'hol_y4w_zhe_back',day:'2029-02-17',h:19,th:NT,ms:[['zhe','我回來了！高雄帶了吃的'],['zhe','禮拜一開學 拿去給你們']]},
    {tag:'hol_y4w_an_back',day:'2029-02-18',h:18,an:['回臺北了。']} ];
  S.msgDay=m=>m.c01?(typeof VAC!=='undefined'&&VAC.c01Day?VAC.c01Day(m.c01):null):DK(m.day);
  /* 日本路線人在日本（3/25～8/5，例：大三暑假 6/27 柏翰、6/30 阿哲）：臺灣傳來的訊息換成當地時間（遊戲時鐘是日本時間；AA_341 J-S13、AA_342 C6）*/
  const jpTz=(G,d)=>typeof STORY!=='undefined'&&STORY.route&&STORY.route(G)==='JP'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0;
  S.homeMsgs=function(G){ const now=T(G.day,G.hour), F=G.flags||{};
    for(const m of S.HOME_MSGS){ if(PHONE.sent(G,m.tag)) continue; const d=S.msgDay(m), h=d==null?m.h:m.h+jpTz(G,d); if(d==null||now<T(d,h)||G.day>d+(m.c01?1:3)) continue;
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

  /* ---------- 手機規則（STORY.PHONE_RULES：在家、在外面、跳過時間的時候每小時一次）----------*/
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; S.homeMsgs(G); S.msgs63(G); };

  /* ---------- 登記 ----------*/
  if(typeof HOME!=='undefined'){
    if(HOME.BREAK_PTS&&!HOME.BREAK_PTS.Y4W) HOME.BREAK_PTS.Y4W=S.Y4W;
    if(Array.isArray(HOME.STOPS)) HOME.STOPS.push((G,now)=>S.stops(G,now));
    if(Array.isArray(HOME.CARD_LINES)) HOME.CARD_LINES.push((G,t)=>S.cardLine(G,t)); }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  return S;
})();
