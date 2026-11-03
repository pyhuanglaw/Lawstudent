/* AA_555（企劃線 56c11668d，AA-B 2026-10-31）× AA_118 第 3 節：AA 六位（語彤、阿哲、Alison、柏翰、芯慈、以安）每人每學期 2 則的手機小事（AA555-WALK-TALK-1031）。
   同行聊天（AA_118 第 2 節）在 src/data/invites.js 最後一段（walk）；這個檔只管手機。
   - 台詞一字不改：AA_555 第 2 節有列的照「改」，沒列的照 AA_118 原句（舊稿的名字一律換 Alison，AA_380）。稿上的舞台指示照遊戲手機的寫法：（照片：…）＝「📷（…）」、資料夾／一張表＝「📎（…）」／「📷（…）」、
     語音訊息＝「（語音，背景很吵）…（斷掉）」；「十分鐘後：」「一分鐘後：」＝隔那麼久的下一則；「隔天：」「三週後：」＝那麼多天以後同一個時間的下一則；「沒有字。」＝只有照片／檔案。
   - 接法（AA_555 第 4 節）：加進 STORY.DAILY_PHONE（story3d.js 的 dailyPhone：一天最多一則、輪流、每學期第 4 週起、大一上第 2 週起；每則一次）。
     稿上寫死日子、或第 4 週以前／寒暑假才會發生的（倒數幾天、中秋、第一次當助教前一晚、面試前一晚、放榜、畢業典禮、寒假回新竹、暑期實習）＝固定日子（S.AT，PHONE.at；照 r3_3d.js S.DP3_AT 的寫法，晚三天以內補送）。
   - 時間沒寫的是技術預設：語彤 21:20、阿哲 21:00、Alison 21:30、柏翰 22:00（九點四十離開總圖）、芯慈 21:10（「00:40 以後」的照稿：決定那天的半夜 00:40＝h 24+40/60，phone3d.js mk 換成隔天凌晨；睡著了醒來看到）、以安 21:40；人在國外照當地時間（STORY.tzOffset）。
   - 已經在遊戲裡的兩則：大三上 Alison 中秋（r3_3d.js y3_yu_moon，這次照 AA_555 改字）、大二下柏翰「祐廷接了讀書會」（story3d.js han3_chart，AA_555：照現在）。
   - AA-B 11-01 回 12 題（D109）：大三上阿哲系籃改成私訊祐廷（字照稿）；以安「研究所，我決定了：公法。」、「公法所放榜」、語彤 16b 機場照片、阿哲搬出租屋那天：拿掉；
     芯慈 2028 暑假那則換句；柏翰期末倒數二十一天每天一則（第 11 題；AA_581 改成算到第一科期末考）。 */
const AA555=(function(){
  const S={};
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const done=(G,...ids)=>!!(G.events&&G.events.done&&ids.some(id=>G.events.done[id]));
  const lastDay=(G,id)=>G.events&&G.events.last&&typeof G.events.last[id]==='number'?G.events.last[id]:null;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const TD=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  const tz=(G,day)=>typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,day)||0):0;
  const law=G=>(G.stage||'law')==='law';
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const grp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const got=(G,id,day)=>!!(G.contacts&&G.contacts[id]!=null&&G.contacts[id]<(day==null?G.day:day));   /* 前一天以前就有聯絡方式（和 story3d.js gotBefore 一樣）*/
  const termOf=day=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(day):null;
  const mon=day=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(day).m:0;
  const classOn=(cid,day)=>{ if(typeof COURSES==='undefined'||!COURSES.list||typeof CALENDAR==='undefined') return false; const c=COURSES.list.find(x=>x.id===cid), t=termOf(day); if(!c||!t||t.id!==c.term||CALENDAR.holiday(day)) return false; const wd=CALENDAR.dateOf(day).wd; return (c.slots||[]).some(s=>s.wd===wd); };   /* 那一天有這門課（課表的星期幾、不是假日）*/
  const dpDay=(G,id)=>{ const D=G.flags&&G.flags.dpDayOf; return D&&typeof D[id]==='number'?D[id]:null; };
  const M=(who,t,dt,th)=>({th:th||('p:'+who),from:who,text:t,dt:dt||0});
  const SQ=(who,L,th)=>L.map((t,k)=>M(who,t,k/60,th));
  const HH={heroine_03:21+20/60,zhe:21,yu:21.5,classmate_bohan:22,classmate_xinci:21+10/60,heroine_01:21+40/60};
  const YT='heroine_03', ZHE='zhe', YU='yu', BH='classmate_bohan', XC='classmate_xinci', AN='heroine_01', NG='g:noodle_team';
  const wk=(id,w0,w1)=>T=>!!T&&T.id===id&&T.week>=(w0||1)&&T.week<=(w1||99);
  /* [id, 誰, 學期（週次）, 條件 (G, day), 訊息 (G)→[{th,from,text,dt}], 時刻（不寫＝那個人的預設）] */
  const R=[
    /* ---- 大一上 ---- */
    ['y1s1_yt_dish',YT,wk('Y1S1'),(G,d)=>got(G,YT,d),()=>[M(YT,'📷（一碟小菜）'),M(YT,'阿姨說是送的。',10/60)]],
    ['y1s1_yt_rain',YT,wk('Y1S1'),(G,d)=>got(G,YT,d)&&G.weather==='rain',()=>SQ(YT,['📷（麵店門口的雨）','今天沒人。'])],
    ['y1s1_zhe_group',ZHE,wk('Y1S1'),G=>grp(G,'noodle_team'),()=>SQ(ZHE,['明天燒臘店','我揪了','不用回','回了也沒用'],NG)],   /* AA_555：條件改「法一吃飯」群組（noodle_team）*/
    ['y1s1_zhe_voice',ZHE,wk('Y1S1',5,7),(G,d)=>got(G,ZHE,d),()=>[M(ZHE,'（語音，背景很吵）哥，民總第三章你抄了沒——（斷掉）'),M(ZHE,'抄了拍給我。',1/60)]],   /* 期中前：第 5～7 週 */
    ['y1s1_yu_lunch',YU,wk('Y1S1'),(G,d)=>got(G,YU,d),()=>SQ(YU,['欸','欸欸','你今天中午吃什麼','我隨便問的','我一個人在小松']),11+50/60],   /* AA_555：照用（2025 年小松還在）；問中午吃什麼＝11:50 */
    ['y1s1_yu_debate',YU,wk('Y1S1'),(G,d)=>got(G,YU,d),()=>[M(YU,'今天練習的題目是『宵夜應該被保障』。我是正方。我贏了。')]],
    ['y1s1_bh_folder',BH,wk('Y1S1'),(G,d)=>got(G,BH,d)&&done(G,'ev_bohan_score'),()=>[M(BH,'📎（一個資料夾：「民總考古題（十年）」）')]],   /* 翰 1（ev_bohan_score）之後；沒有字 */
    ['y1s1_xc_note',XC,wk('Y1S1'),(G,d)=>got(G,XC,d)&&done(G,'ev_xinci_notes'),()=>[M(XC,'筆記第三頁有一張便利貼，是我的問題。不用回答，只是想讓你知道我有問題。')]],   /* 慈 1 */
    ['y1s1_xc_late',XC,wk('Y1S1'),(G,d)=>got(G,XC,d),()=>SQ(XC,['你睡了嗎','沒睡也不用回','我在追的那部劇，這集太扯了','當我沒說']),24+40/60],
    ['y1s1_an_row',AN,wk('Y1S1'),(G,d)=>got(G,AN,d)&&classOn('civ_general',d+1),()=>[M(AN,'明天民總，我坐第二排。旁邊通常沒人。')]],   /* 隔天有民總 */
    ['y1s1_an_notice',AN,wk('Y1S1'),(G,d)=>got(G,AN,d),()=>SQ(AN,['📷（宿舍公告欄）','這張公告的第三行和第五行矛盾。我寫信問了。'])],
    /* ---- 大一下 ---- */
    ['y1s2_yt_noodle',YT,wk('Y1S2'),(G,d)=>got(G,YT,d),()=>[M(YT,'阿姨今天試做新的麵。不好吃。她自己說的。')]],
    ['y1s2_yt_azalea',YT,wk('Y1S2'),(G,d)=>got(G,YT,d)&&mon(d)===3,()=>SQ(YT,['📷（麵店門口一盆小杜鵑）','阿姨買的。她說椰影大道太遠了。'])],   /* 杜鵑花季＝3 月 */
    ['y1s2_zhe_group',ZHE,wk('Y1S2'),G=>grp(G,'noodle_team'),()=>SQ(ZHE,['今天有人要吃大碗嗎','我是說我要','有人陪就好'],NG)],
    ['y1s2_zhe_bell',ZHE,wk('Y1S2',14),(G,d)=>got(G,ZHE,d)&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(YU,G)&&!done(G,'ev_yu_together'),()=>SQ(ZHE,['哥我今天早上又剛好路過晨思鐘','好巧','Alison 也在','好巧']),9+10/60],   /* 語 2 的徵兆（大一下第 14～16 週）；AA_555〔名〕*/
    ['y1s2_yu_hotpot',YU,wk('Y1S2'),(G,d)=>got(G,YU,d),()=>SQ(YU,['欸你知道一個人吃火鍋要怎麼點嗎','我幫朋友問的','朋友是我'])],
    ['y1s2_yu_debate',YU,wk('Y1S2'),(G,d)=>got(G,YU,d),()=>[M(YU,'明天比賽，我抽到反方。我等一下要先說服我自己。')]],   /* 辯論比賽前一天：遊戲沒有辯論比賽的日子＝大一下任何一天 */
    ['y1s2_xc_coffee',XC,wk('Y1S2',8,9),(G,d)=>got(G,XC,d)&&done(G,'ev_xinci_double'),()=>[M(XC,'會計學和民總同一天。我把咖啡換成兩杯。')]],   /* AA_555〔慈〕；慈 2（雙主修）之後、期中週 */
    ['y1s2_xc_late',XC,wk('Y1S2'),(G,d)=>got(G,XC,d),()=>SQ(XC,['劇裡的男主角做的事，在民總叫『無權代理』。','我不應該在追劇的時候想民總。']),24+40/60],
    ['y1s2_an_appeal',AN,wk('Y1S2'),(G,d)=>got(G,AN,d)&&done(G,'ev_an_dorm_appeal')&&!done(G,'ev_an_dorm_appeal_result'),()=>[M(AN,'申訴書第二版。你只要看第一段。……看完說一個缺點就好。')]],   /* 新 5 申訴期間 */
    /* ---- 大二上 ---- */
    ['y2s1_zhe_quiz',ZHE,wk('Y2S1'),(G,d)=>got(G,ZHE,d)&&G.flags.ZHE2_ASKED!=null,()=>SQ(ZHE,['哥我又沒過','但我知道錯在哪','你可以假裝很驚訝'])],   /* 哲 2（story3d.js ZHE2_ASKED）之後 */
    ['y2s1_zhe_together',ZHE,wk('Y2S1'),G=>grp(G,'noodle_team')&&done(G,'ev_yu_together'),()=>[M(ZHE,'從今天開始，我跟 Alison 坐一起',0,NG),M(ZHE,'其他人照舊',1/60,NG),M(YU,'沒有人問你',2/60,NG)]],   /* 語 3 之後；AA_555〔名〕〔麵〕*/
    ['y2s1_yu_meetings',YU,wk('Y2S1'),(G,d)=>got(G,YU,d),()=>SQ(YU,['我今天開了三個會','第三個會在討論第一個會的結論','我好想睡'])],
    ['y2s1_yu_soymilk',YU,wk('Y2S1'),(G,d)=>got(G,YU,d)&&!done(G,'ev_yu_together'),()=>SQ(YU,['欸阿哲今天又剛好路過','他拿了兩杯豆漿','一杯是我的','我是說，剛好']),9+20/60],   /* 語 2 的徵兆：還沒在一起 */
    ['y2s1_bh_duty',BH,wk('Y2S1'),G=>grp(G,'lawclub_study'),()=>SQ(BH,['本週值班表','📷（一張表）','有問題私訊','沒有問題也可以私訊','……最後一句當我沒說'],'g:lawclub_study')],   /* 法服群組（lawclub_study）；柏翰大二是法服社長 */
    ['y2s1_bh_group',BH,wk('Y2S1'),(G,d)=>got(G,BH,d)&&done(G,'ev_bohan_exam_group'),()=>[M(BH,'這週第三題全組都錯。出題的人想考什麼，我也不知道。我去問老師。')]],   /* 翰 2 */
    ['y2s1_xc_cvs',XC,wk('Y2S1'),(G,d)=>got(G,XC,d)&&done(G,'ev_xinci_second'),()=>[M(XC,'便利商店那杯，下次換你請。')]],   /* AA_555〔慈〕：慈 3 新版 */
    ['y2s1_xc_mid',XC,wk('Y2S1',5,7),(G,d)=>got(G,XC,d),()=>[M(XC,'要不要一起讀債總。我讀要件，你讀例外。……我最怕例外。')]],
    ['y2s1_an_rules',AN,wk('Y2S1',4,6),(G,d)=>got(G,AN,d)&&grp(G,'public_law'),()=>[M(AN,'讀書會的規則我寫好了。第一條，每人十分鐘。第二條，不准離題。……一共十二條。')],null,{days:21,items:()=>[M(AN,'規則改成三條了。')]}],   /* 新 8（第 7 週週四）以前；「三週後」＝21 天後同一時間 */
    ['y2s1_an_tutor',AN,wk('Y2S1'),(G,d)=>{ const x=lastDay(G,'ev_an_tutor_family_1'); return got(G,AN,d)&&x!=null&&d-x>=7; },()=>[M(AN,'今天照常去家教。學生寫完了兩張考卷，比上週多一張。')]],   /* 新 10（家教學生的家）一週以後 */
    /* ---- 大二下 ---- */
    ['y2s2_yt_garlic',YT,wk('Y2S2'),(G,d)=>got(G,YT,d)&&has(YT,'RENT_CONSULTATION'),()=>[M(YT,'今天店裡很安靜。我在剝蒜頭。')]],   /* 事件 9 新版（RENT_CONSULTATION）之後 */
    ['y2s2_yt_ta_form',YT,wk('Y2S2',13),(G,d)=>got(G,YT,d),()=>SQ(YT,['📷（社會系助教的申請表）','填好了。還沒交。'])],
    ['y2s2_zhe_wall',ZHE,wk('Y2S2',4,6),(G,d)=>got(G,ZHE,d)&&!done(G,'ev_zhe_deposit'),()=>SQ(ZHE,['哥，房東說牆上有洞','那是我掛球衣的','他說那是破壞','我說那是藝術'])],   /* AA_117 C3 押金（第 5～6 週）之前 */
    ['y2s2_zhe_library',ZHE,wk('Y2S2'),(G,d)=>got(G,ZHE,d),()=>SQ(ZHE,['我今天在總圖','真的','拍給你看','📷（總圖的天花板）'])],   /* AA_555〔模〕＋「哥」一學期最多一則（押金那則留） */
    ['y2s2_yu_cry',YU,wk('Y2S2'),(G,d)=>got(G,YU,d),()=>SQ(YU,['辯論社今天有學妹哭了','我陪她坐了一下','然後我也哭了','不知道為什麼'])],   /* AA_555〔模〕〔名〕*/
    ['y2s2_yu_cook',YU,wk('Y2S2'),(G,d)=>got(G,YU,d)&&done(G,'ev_yu_together'),()=>SQ(YU,['阿哲說今天要做菜給我吃','他在問我電鍋怎麼用','我也不知道'])],
    ['y2s2_bh_board',BH,wk('Y2S2'),(G,d)=>got(G,BH,d)&&!G.flags.STUDYGROUP_LEADER&&grp(G,'public_law'),()=>SQ(BH,['白板上的題目換好了。','……這週來的人少了兩個。考試快到了吧。'])],   /* AA_555〔比〕：柏翰接了讀書會（翰 3）＝不是祐廷接（STUDYGROUP_LEADER）；祐廷接的版本是 story3d.js han3_chart */
    ['y2s2_xc_report',XC,wk('Y2S2'),(G,d)=>got(G,XC,d),()=>[M(XC,'今天財管的教授說我的報告『很像實務』。我回家跟我媽說，她問那是稱讚嗎。')]],   /* AA_555〔模〕〔慈〕*/
    ['y2s2_xc_late',XC,wk('Y2S2'),(G,d)=>got(G,XC,d),()=>SQ(XC,['這部劇十六集，我只剩一集。我不想看完。','看完就沒有了。']),24+40/60],
    ['y2s2_an_question',AN,wk('Y2S2'),(G,d)=>got(G,AN,d)&&classOn('admin_remedy',d),()=>[M(AN,'我今天在課堂上問了一個問題。老師說『好問題』。我只想要答案。')]],   /* 新 11 還沒有事件：行政救濟法有課的那一天 */
    ['y2s2_an_expo',AN,wk('Y2S2'),(G,d)=>{ const x=DK('2027-03-18'); return got(G,AN,d)&&x!=null&&d>x; },()=>[M(AN,'說明會的資料四十頁，我讀完了。有三頁是同一頁印兩次。')]],   /* 交換說明會 3/18 之後 */
    /* ---- 大三上 ---- */
    ['y3s1_yt_lease',YT,wk('Y3S1'),(G,d)=>got(G,YT,d)&&done(G,'ev_yt_lease_renew'),()=>SQ(YT,['📷（阿姨在新合約上簽名，手有點抖）','她說是因為冷。'])],
    ['y3s1_zhe_captain',ZHE,wk('Y3S1'),(G,d)=>got(G,ZHE,d)&&!!G.flags.ZHE3,()=>SQ(ZHE,['明天練球','不來的要買飲料','來的也要買','我是隊長'])],   /* 哲 3 當隊長（ZHE3）；AA-B 11-01：遊戲沒有系籃群組，改阿哲私訊祐廷 */
    ['y3s1_zhe_scooter',ZHE,wk('Y3S1'),(G,d)=>got(G,ZHE,d)&&done(G,'ev_zhe_scooter'),()=>SQ(ZHE,['修車行說兩千','對方付了','我請你吃燒臘','雙拼'])],   /* AA_117 C4 */
    ['y3s1_yu_tuesday',YU,wk('Y3S1'),(G,d)=>got(G,YU,d),()=>SQ(YU,['我現在每週二晚上沒有事','好奇怪','我在宿舍走來走去'])],
    ['y3s1_bh_exam',BH,wk('Y3S1',10,12),(G,d)=>got(G,BH,d)&&!G.flags.BH4_DONE&&!done(G,'ev_bohan_third_floor'),()=>SQ(BH,['📷（考卷，紅字很多）','不用安慰我。我只是要讓你知道，我也會考差。'])],   /* 刑訴期中之後、翰 4 之前 */
    ['y3s1_bh_handover',BH,wk('Y3S1',12),(G,d)=>got(G,BH,d),()=>[M(BH,'交接文件第一頁寫好了。你幫我看一句就好：『不要只教他們考試。』通順嗎？')]],
    ['y3s1_xc_pens',XC,wk('Y3S1'),(G,d)=>got(G,XC,d)&&done(G,'ev_xinci_an_answers','ev_xinci_an_answers_far'),()=>SQ(XC,['以安借我刑訴筆記。我借她我的五色筆。','她說她要學我的顏色。'])],   /* AA_555〔比〕〔慈〕：慈 5 之後 */
    ['y3s1_xc_late',XC,wk('Y3S1'),(G,d)=>got(G,XC,d),()=>SQ(XC,['這集的律師在法庭上大吼。我爸說他執業二十年，沒有吼過一次。','不用回答。']),24+40/60],   /* AA_555〔慈〕*/
    ['y3s1_an_court',AN,wk('Y3S1'),(G,d)=>{ const x=DK('2027-10-21'); return got(G,AN,d)&&x!=null&&d>x; },()=>[M(AN,'今天去了行政法院。旁聽席只有我和一個阿伯。他也在抄筆記。')]],   /* 新 14（10/21）之後 */
    ['y3s1_an_suitcase',AN,wk('Y3S1',14),(G,d)=>got(G,AN,d),()=>SQ(AN,['📷（行李箱，一半是書）','書比衣服多。日本的書比較貴。'])],   /* 出發前 */
    /* ---- 大三下（以安在日本；祐廷可能在國外）---- */
    ['y3s2_yt_sign',YT,wk('Y3S2'),(G,d)=>got(G,YT,d)&&route(G)==='TW',()=>SQ(YT,['📷（一家老店的招牌）','今天訪問這家。老闆說招牌是他爸寫的。'])],
    ['y3s2_yt_abroad',YT,wk('Y3S2'),(G,d)=>got(G,YT,d)&&abroad(G),()=>[M(YT,'你那邊幾點。……我這邊在下雨。麵店人很多。')]],
    ['y3s2_zhe_trophy',ZHE,wk('Y3S2'),(G,d)=>{ const x=DK('2028-04-29'); return got(G,ZHE,d)&&x!=null&&d>x; },()=>SQ(ZHE,['📷（獎盃和他爸）','我爸說醜。他一直拿著。'])],   /* 冠軍賽 4/29（哲 4）之後 */
    ['y3s2_zhe_abroad',ZHE,wk('Y3S2'),(G,d)=>got(G,ZHE,d)&&abroad(G),()=>SQ(ZHE,['哥你那邊有燒臘嗎','沒有的話我寄滷蛋過去','可以寄嗎','你法律系的你查一下'])],
    ['y3s2_yu_breakfast',YU,wk('Y3S2'),(G,d)=>{ const x=lastDay(G,'ev_yu_alone_breakfast'); return got(G,YU,d)&&x!=null&&d-x>=2; },()=>SQ(YU,['📷（豆漿和蛋餅）','一個人吃早餐，第五天。'])],   /* 語 4 之後（第五天＝隔兩天以上）*/
    ['y3s2_yu_abroad',YU,wk('Y3S2'),(G,d)=>got(G,YU,d)&&abroad(G),()=>SQ(YU,['欸你在國外會不會一個人吃飯','會的話打給我','我陪你吃','我在吃第二頓'])],
    ['y3s2_bh_plan',BH,wk('Y3S2',10),(G,d)=>got(G,BH,d),()=>[M(BH,'讀書計畫第三版。'),M(BH,'📷（一張截圖）',1/60),M(BH,'這版沒有分數了。',2/60)]],
    ['y3s2_bh_abroad',BH,wk('Y3S2'),(G,d)=>got(G,BH,d)&&abroad(G),()=>SQ(BH,['你在國外上的課，有考試嗎？','……我只是想知道。'])],
    ['y3s2_xc_tables',XC,wk('Y3S2',14),(G,d)=>got(G,XC,d),()=>SQ(XC,['併購的期末報告，我做了十二張表。','全部對起來了。'])],   /* AA_555〔慈〕*/
    ['y3s2_an_onigiri',AN,wk('Y3S2'),(G,d)=>got(G,AN,d)&&route(G)!=='JP',()=>SQ(AN,['📷（便利商店一整排飯糰）','三十種。我說每天吃一種，一個月不重複。……我已經重複了。'])],   /* 日本路線的祐廷在場景 J1 當面看到，不另傳 */
    ['y3s2_an_group',AN,wk('Y3S2'),(G,d)=>got(G,AN,d),()=>[M(AN,'Alison 今天主持讀書會。她傳照片給我。……她把我的三條規則貼在白板上。')]],   /* AA_555〔名〕*/
    /* ---- 大四上 ---- */
    ['y4s1_yt_23',YT,wk('Y4S1'),(G,d)=>{ const a=DK('2028-12-04'), b=DK('2028-12-10'); return got(G,YT,d)&&!abroad(G)&&a!=null&&d>=a&&d<=b; },()=>SQ(YT,['阿姨說二十三週年不要辦。','我們要辦。','12/14 週四晚上，你有空嗎。'])],   /* 二十三週年前（12/11 起是群組的倒數，y34b3d.js 1B-20）*/
    ['y4s1_yt_report',YT,wk('Y4S1',14),(G,d)=>got(G,YT,d),()=>[M(YT,'報告交了。最後一個是阿姨。她說她不要被寫。我寫了。')]],
    ['y4s1_zhe_book',ZHE,wk('Y4S1'),(G,d)=>got(G,ZHE,d),()=>SQ(ZHE,['哥我買了一本很厚的書','翻了三頁','我覺得三頁很多了'])],
    ['y4s1_zhe_banner',ZHE,wk('Y4S1'),(G,d)=>{ const a=DK('2028-12-12'), b=DK('2028-12-14'); return got(G,ZHE,d)&&a!=null&&d>=a&&d<=b; },()=>SQ(ZHE,['📷（燒臘店門口一條手寫的紅布條）','我寫的。字很醜。阿姨說很好。']),17],   /* 二十三週年（12/14 19:00）那幾天、開始以前 */
    ['y4s1_yu_library',YU,wk('Y4S1'),(G,d)=>got(G,YU,d),()=>SQ(YU,['今天在總圖，一個人。很好。','我只是要跟你說很好。'])],
    ['y4s1_yu_junior',YU,wk('Y4S1',4,6),(G,d)=>got(G,YU,d),()=>[M(YU,'學妹說謝謝我陪她吃飯。我差點哭出來。我在學活。很丟臉。')]],   /* 迎新之後 */
    ['y4s1_xc_intern',XC,wk('Y4S1',6),(G,d)=>got(G,XC,d),()=>SQ(XC,['實習第一天，我的工作是整理一百頁的契約。我很快樂。','這是真的。'])],
    ['y4s1_xc_six',XC,wk('Y4S1'),(G,d)=>got(G,XC,d),()=>[M(XC,'今天吃飯的有六個人。阿姨多煮了一碗。')]],   /* AA_555〔麵〕：以安回來之後 */
    ['y4s1_an_handover',AN,wk('Y4S1'),(G,d)=>{ const x=DK('2028-12-01'); return got(G,AN,d)&&x!=null&&d>=x&&!(typeof PHONE!=='undefined'&&PHONE.sent(G,'y4_plg_photo')); },()=>SQ(AN,['📷（白板上只寫一條規則：每個人講完）','交棒了。'])],   /* 新 19（11/30）之後；Alison 已經在群組傳過白板照片（r2y4a3d.js y4_plg_photo）就不再傳 */
    /* ---- 大四下 ---- */
    ['y4s2_yt_photo',YT,wk('Y4S2',10),(G,d)=>got(G,YT,d),()=>SQ(YT,['我在想畢業照要不要在麵店拍。','阿姨說要。'])],
    ['y4s2_zhe_gown',ZHE,wk('Y4S2',14,15),(G,d)=>{ const x=DK('2029-06-02'); return got(G,ZHE,d)&&x!=null&&d<x; },()=>SQ(ZHE,['哥你的學士服借我比一下','我的好像太短','還是我太長'])],
    ['y4s2_yu_dinner',YU,wk('Y4S2'),(G,d)=>got(G,YU,d),()=>SQ(YU,['今天一個人吃晚餐，很好。','阿哲說考試那天要跟我搭同一班捷運去。'])],
    ['y4s2_bh_kaogu',BH,wk('Y4S2',10),(G,d)=>got(G,BH,d),()=>SQ(BH,['四年的考古題整理好了，要送給學弟妹。','第一頁我寫：這只是別人考過的題目。'])],
    ['y4s2_xc_boxes',XC,wk('Y4S2',10),(G,d)=>got(G,XC,d),()=>[M(XC,'筆記三箱。我決定留一箱。……留了黑筆最多的那一箱。')]]   /* AA_555〔慈〕：條件改「畢業前」 */
  ];
  S.DP=R.map(([id,who,term,ok,items,h,then])=>({id:'a118_'+id,who,term,h:G=>(h!=null?h:HH[who])+tz(G),ok:(G,day)=>law(G)&&ok(G,day==null?G.day:day),items:G=>items(G),then:then||null}));
  /* 固定日子：[id, 誰, 那一天 ()→day, 臺灣的時刻, 條件 (G, day), 訊息（dd＝晚幾天、dt＝晚幾小時）]；晚三天以內補送 */
  const D2=k=>()=>DK(k);
  const CN=n=>{ const d='零一二三四五六七八九'; return n<10?d[n]:(n===10?'十':(n<20?'十'+d[n-10]:d[Math.floor(n/10)]+'十'+(n%10?d[n%10]:''))); };
  S.BH_COUNT_SP={14:'期末前十四天。進度落後半天。',7:'期末前七天。……今天念得很慢，可是記得住。',1:'明天考。我今天十點就睡。'};
  S.bhCount=()=>{ const L=[]; for(let n=21;n>=1;n--){ const t=S.BH_COUNT_SP[n]||('期末前'+CN(n)+'天。'), m=M(BH,t); if(n<21) m.dd=21-n; L.push(m); } return L; };   /* 二十一天＝第一科期末考那天往前 21 天、前一天＝考試前一天（AA_581 第 1～3 列、連1；原本算到第 8 週週一的期中考，D118 沒有期中考）*/
  /* AA_581 連1：大一上第一科期末考那天往前 21 天（CLS.examList 的第一科）；課表沒有期末考時用第 13 週週一（＝第 16 週週一往前 21 天）*/
  S.bhCountDay=G=>{ const L=G&&typeof CLS!=='undefined'&&CLS.examList?CLS.examList(G,'Y1S1'):[]; if(L.length) return L[0].day-21; return TD('Y1S1',13,1); };
  S.AT=[
    ['y1s1_bh_count',BH,G=>S.bhCountDay(G),22,(G,d)=>got(G,BH,d),()=>S.bhCount()],   /* AA-B 11-01 第 11 題：二十一天起每天一則「期末前 N 天。」（國字；AA_581 第 3 列，原本「期中前」），十四天、七天、前一天換句 */   /* 期末前三週（AA_581 連1：第一科期末考往前 21 天，S.bhCountDay）；「他每天倒數一則，到考試那天為止」只寫了兩則，其他天的字要問 AA */
    ['y1s2_bh_final30',BH,()=>{ const d=TD('Y1S2',16,1); return d==null?null:d-30; },22,(G,d)=>got(G,BH,d),()=>[M(BH,'期末前三十天。'),M(BH,'📷（一張試算表截圖：每天的進度，有一格寫著「休息（十分鐘）」）',1/60)]],
    ['y1s2_bh_platform',BH,D2('2026-02-22'),16.5,(G,d)=>got(G,BH,d),()=>SQ(BH,['📷（月台）','新竹的風。我在等車。不要問我為什麼傳這個。'])],   /* 寒假回新竹：寒假最後一天（大一下開學前一天）回臺北的月台 */
    ['y1s2_an_plg',AN,()=>TD('Y1S2',2,3),21,(G,d)=>got(G,AN,d)&&grp(G,'public_law'),()=>[M(AN,'讀書會，週四晚上，B館研討室。題目：集會遊行。Alison 說要帶零食。可以。但不准吵。')]],   /* AA_555〔時〕：大一下讀書會第一次（第 2 週週四）的前一天 */
    ['y2s1_yt_moon',YT,D2('2026-09-25'),20.5,(G,d)=>got(G,YT,d)&&!done(G,'ev_yt_moon'),()=>SQ(YT,['📷（阿姨在店門口烤肉，旁邊一隻貓）','貓也有一塊。'])],   /* 中秋 9/25（第 3 週）；那天在店裡過中秋（ev_yt_moon）的不傳 */
    ['y3s1_yt_ta',YT,D2('2027-09-13'),21+20/60,(G,d)=>got(G,YT,d)&&!!G.flags.YT_TA&&!done(G,'ev_yt_ta_news_lib'),()=>SQ(YT,['明天第一次當助教。','……沒事。只是說一下。'])],   /* 第一次上台＝大三上第 2 週週二（y2b_events.js TA_LINES）；圖書館版（「明天第一次上台」當面說過）不傳 */
    ['y3s2_xc_copier',XC,D2('2028-07-07'),21+10/60,(G,d)=>got(G,XC,d)&&done(G,'ev_xinci_first_place','ev_xinci_first_place_video'),()=>[M(XC,'實習第一週。名牌上我的名字打錯一個字。……我還沒去改。')]],   /* AA-B 11-01 第 10 題換句（原本「影印機我已經會修了」和 AA_549 VA-09 重複）*/   /* AA_555：暑期實習之後；實習開始的日子稿沒寫，技術預設 7 月第一週週五 */
    ['y4s1_bh_eve',BH,D2('2028-10-25'),22,(G,d)=>got(G,BH,d),()=>SQ(BH,['明天面試。','我準備了兩個答案。','還不知道要講哪一個。'])],   /* 推甄面試 10/26（r2y4a_events.js 2-Y4-06）前一晚 */
    ['y4s1_bh_pass',BH,D2('2028-11-23'),15+20/60,(G,d)=>got(G,BH,d),()=>[M(BH,'推甄，上了。'),M(BH,'我現在可以去燒臘店了嗎。',10/60)]],   /* 放榜 11/23 15:00 */
    ['y4s2_zhe_150',ZHE,D2('2029-03-07'),21,(G,d)=>got(G,ZHE,d),()=>SQ(ZHE,['倒數一百五十天','我每天吃燒臘店的雙拼','這是儀式'])],   /* 國考 2029-08-04 前 150 天 */
    ['y4s2_an_eve',AN,D2('2029-06-01'),21+40/60,(G,d)=>got(G,AN,d),()=>[M(AN,'明天我媽會來。你們都會在吧。')]],   /* AA_555〔麵〕；畢業典禮前一天 */
    ['y4s2_bh_grad',BH,D2('2029-06-02'),12,(G,d)=>got(G,BH,d),()=>SQ(BH,['📷（從最後一排拍的會場）','後面真的看得到全部的人。'])],
    ['y4s2_xc_grad',XC,D2('2029-06-02'),21+10/60,(G,d)=>got(G,XC,d),()=>SQ(XC,['我媽哭了。我沒有。','……有一點。'])],
    ['y4s2_yu_grad',YU,D2('2029-06-02'),22.5,(G,d)=>got(G,YU,d),()=>[M(YU,'拍了兩百張。只有一張是我一個人。我最喜歡那一張。')]] ];   /* 畢業典禮後 */
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour;
  S.atRule=function(G){ if(!law(G)||typeof PHONE==='undefined') return;
    for(const [id,who,dayFn,hTW,ok,items] of S.AT){ const d=dayFn(G); if(d==null||now(G)>=T(d+3,0)||G.day<d||PHONE.sent(G,'a118_'+id+'_0')) continue; const h=hTW+tz(G,d); if(now(G)<T(d,h)||!ok(G,d)) continue;
      items(G).forEach((it,j)=>{ const x=Object.assign({},it), dt=x.dt||0, dd=x.dd||0; delete x.dt; delete x.dd; PHONE.at(G,d+dd,h+dt,[x],'a118_'+id+'_'+j); }); } };
  /* 「三週後」那種第二則：第一則送出的那一天（dailyPhone 的 dpDayOf）＋天數，同一個時刻 */
  S.thenRule=function(G){ if(!law(G)||typeof PHONE==='undefined') return;
    for(const d of S.DP){ if(!d.then) continue; const d0=dpDay(G,d.id); if(d0==null) continue; const day=d0+d.then.days, tag='a118_then_'+d.id.slice(5); if(PHONE.sent(G,tag)||G.day<day) continue; const h=d.h(G);
      if(G.day===day&&G.hour<h) continue; d.then.items(G).forEach((it,j)=>{ const x=Object.assign({},it), dt=x.dt||0; delete x.dt; PHONE.at(G,day,h+dt,[x],j?tag+'_'+j:tag); }); } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.DAILY_PHONE)&&!STORY._aa555dp){ for(const d of S.DP) if(!STORY.DAILY_PHONE.some(x=>x.id===d.id)) STORY.DAILY_PHONE.push(d); STORY._aa555dp=true; }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._aa555pr){ STORY.PHONE_RULES.push(G=>{ try{ S.atRule(G); S.thenRule(G); }catch(e){ console.warn('AA555 phone',e); } }); STORY._aa555pr=true; }
  return S;
})();
