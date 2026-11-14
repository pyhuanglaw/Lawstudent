/* ===== 溫州街三家店的打工系統 JOBS（DL-10；USER_WANTS B06；AA_420 第 2 節＋AA_164 第 2、3、6、7 節＋AA_165）=====
   三家店：半熟早午餐（週六／週日 07:30～11:30，上午）、阿德影印輸出（週二～四 18:00～22:00，晚上；考試週可以加班 21:00～24:00）、一盞茶屋（週六／週日 13:00～17:00，下午）。
   - 應徵（第 6 條第 2 點）：大一上第 1 週起（使用者 11-03「一開始就要有」、AA 確認；原本大一下第 1 週起；舊序章那一年照舊沒有）。早午餐、茶屋＝門上的告示（店裡的選單「應徵：…」）；或客人來過幾次以後老闆開口（吃三次／印三次／喝兩次，WZ_JOBS_DATA.ask）。
     答應時選班表；那一學期那一天、那個時段有課的不列（AA_420 第 12 條第 1 點）；一週最多兩班（所有打工加起來，家教也算；加班不算）。
     選了週六早午餐、去過法服週六值班的＝小米姐一句；選了週四影印、去過公法讀書會的＝阿德一句（AA_420 第 12 條第 3 點）。
   - 出門提醒（第 3 條）：開班前 30 分鐘（OUT.plan，goto 那一家店的室內），「出發」或「這週請假」。走進店裡、班的時間到了就開班（也可以按「開始上班」）。
     撞時段（第 12 條第 2 點）：同一天的週六早午餐＋法服值班、週四影印＋公法讀書會＝出門提醒兩個都列，選一個；另一個照各自的規則（請假／沒去），不扣分。
   - 一班（第 4 條）：第一班的那幾句 → 上週沒去的那一句 → ①開店／接單／院子 → 熟練描述 → ②尖峰的小狀況／做的時候的小狀況／泡茶 → ③收尾／交件／收席 →
     事件（S.SHIFT_EV，四條故事線在 src/wzlines3d.js）→ 薪水（時薪＝當年最低工資＋10：2025 年 200、2026 年 206、2027 年起 215；國定假日加倍，勞基法 §39）→ 下班。
     小選擇只改旁白；熟練每班 +1（0～10，不顯示數字）；一班填滿那個時段（CLS.slotFillSpan，AA_420 2-1）。
   - 沒去（第 6 條）：不扣分；下一班老闆一句（各店三句輪流）；連續三週一班都沒去＝老闆問「還要做嗎？」（有聯絡方式＝私訊；沒有＝下次走進店裡）。
   - 辭職（第 7 條）：店裡「找老闆」→「（辭職）」→「有空回來看看」→ 離開的時候（WZ-B6／C8／T6，房間物件）。
   - 寒暑假（第 13 條）：放假第一天 12:00 老闆私訊一次（第一班以後才有聯絡方式；沒有＝這個假先停）；「來。」＝照班表，那天有營隊、出遊、出國＝自動請假（不算沒去）；
     「放假先停。」＝停到開學第一週。還沒回之前不排班。
   - 出國（第 14 條）：日本路線大三下、美國路線大四上（STORY.movedOut～返台）自動暫停；回國以後第一次走進店裡老闆一句：「回來做。」（重選班表）／「先不了。」（離開的時候）。
   - 延畢（第 15 條）：交換路線（日本、美國）大五上（CALENDAR.termOfDelayed）照常做，最後一班＝離開的時候；臺灣路線照舊在大四下最後一班。
   - 第 9 條：期末考的時段不排班（考試那一格撞到＝那天自動請假）；颱風假不能打工（AA_160 3-4 D）。
   存檔：G.jobs＝{ brunch|copy|tea:{since, from, day:[週幾 1～7], shifts, skill, missedRun, quit, gone, missPend, missN, worked:[天], chk, wk:{}, brk:{假期:'go'|'stop'}, away, back, ask3, pendLeave, b5, b5next, ot:{} },
     _meta:{ n:{brunch,copy,tea,teaSat}, asked:{…} } }（AA_164 第 7 節；舊存檔沒有＝{}）。家教照舊是 JOB_TUTOR（story3d.js），JOBS.at(G,'tutor') 讀它；
     AA_289 3-3 家教補的那一件（第 6 堂以後「考卷的背面」）接在 ev_tutor_lesson 最後（S.patchTutor，旗標 TUTOR_DRAW、TUTOR_DRAW_ANS）。
   給別的檔案讀：JOBS.at(G,k)（k：brunch／copy／tea，或 wzshops3d.js 的 print／teahouse）→{lv, today, board, shiftNow, shifts, day} 或 null；JOBS.any(G)＝現在有在做的那一家；JOBS.summerPay＝暑假照班發薪（r3_3d.js）。
   測試：node tests/aa420_jobs_unit.js、node tests/aa289_jobs_ev_unit.js */
'use strict';
const JOBS=(function(){
  const S={};
  /* ---------- 新店打工第一批（AA_828，企劃線 be3b9c9e4；任務 SHOP-JOBS-1112，USER_WANTS X356）：山嵐書店（shanlan，區域 xs_shanlan）、南洋戲院（cinema，區域 xs_nanyang）----------
     字（告示、應徵、班表、薪水、三段工作、最後一句、員工票）在 src/data/shop_jobs_aa828.js（tools/story/import_shop_jobs_aa828.py 產生）；這裡的 S.X3 只有系統字和位置。第一次讀資料時併進 WZ_JOBS_DATA（shops／notice／apply3／x），
     之後整套照 AA_433 那一批（一週最多兩班合計、出門提醒、沒去、請假、辭職「有空回來看看」、寒暑假先停、薪水 toast、S.runShiftX）。和那一批不一樣的只有：
     - 應徵（S.apply3）：告示＝店裡的按鈕「看告示」（山嵐：一樓櫃檯北端旁邊；南洋：大廳售票亭背牆旁邊，不動模型）→ 告示的字 →「問店員。／問售票口。」「再想想。」→ 店長／經理 → 選班表。
       山嵐「下禮拜可以開始嗎？」＝從下週一起（nextWeek）；來過山嵐書店 3 次以上換一句（走進店裡的次數記在 G.jobs._meta.n.shanlan）。
     - 什麼時候起：山嵐＝大一上第 4 週（fromWeek）；南洋＝大一下（from）。
     - 最後一句旁白（X.end：{週幾:[輪流]}｜{all:[輪流]}；輪到第幾句記在那一份工作的 endN）。
     - 山嵐晚班做到 22:00＝打烊（closeOut）：下班那一句演完直接站到店門口外面（XSCLOSE.outOf），不演 AA_700 那一句（XSCLOSE.staffToday 本來就不說）。
     - 南洋：滿 3 班以後買票的選單多「拿員工票（站著看）」（S.staffTicket*；src/nanyang_sys3d.js、src/aa614_3d.js）；週五晚場那一天的桌遊夜照沒空（S.bgnBusy；src/bgnight3d.js 的 BGN.busy）；
       Alison 上班遇到他改說一句（S.alisonCo；src/shopnpc3d.js）。
     存檔：照舊 G.jobs.<shanlan|cinema>（多 endN、tkWk、tkN、aliCo，沒有＝0／沒拿過／沒說過）、G.jobs._meta.n.shanlan、G.flags.NY_TICKET_STAFF（拿員工票那一天）；舊存檔沒有這些＝沒應徵過。
     測試：node tests/shop_jobs_aa828_1112_unit.js
     AA_828 第 4 節（AA 回七問，企劃線 b84e779563；2026-11-12）：①桌遊夜沒空＝不用玩家回（src/bgnight3d.js：那一晚明軒照樣約、沒有可以回的選項、不排出遊）②所有打工的班蓋到桌遊夜都算沒空（S.bgnBusy：便利商店週五夜班也是）
       ③南洋也從下週一起（nextWeek）④寒暑假兩間都不排班、開學自動恢復（照舊：D().brk 沒有這兩間＝這個假先停；S.scheduled 開學就照班表）⑤辭職以後隔一個學期可以再應徵（S.canReapply：下一個學期開學起告示又看得到；reapply）
       ⑥拿員工票多一句（S.staffTicketTakeLine；src/nanyang_sys3d.js）⑦山嵐上班遇到宋知寧（S.znCo：第一次在山嵐上班、她也在的那一班，上架那一段後面，一次；有／沒有 SHOP_ZN_MET 兩種；她只到大二下）。
       存檔多：G.jobs._meta.znCo（宋知寧那一句說過的那一天）、G.jobs.<k>.re（第幾次再應徵）；沒有＝沒說過／沒有再應徵過。
     AA_828 第 5 節（AA 回第二輪，企劃線 d8afcca6ed；2026-11-12）：①宋知寧在山嵐的班＝週日 14:00～18:00（和祐廷的假日班同一班）、到大二下；週三晚班她不在（S.znCoOn 看資料 co.wd——原本暫定「祐廷的班她都在」）
       ②有 SHOP_ZN_MET 分兩種：她傳過第 5 則訊息（G.flags.SHOP_ZN_BK.sent 有第 5 則，src/shopenc3d.js）＝照第 4 節那一版；還沒傳＝co.metEarly（不說「我上次說的另一家」）③顯示名照舊
       ④桌遊夜有班：祐廷自動回一句、明軒照舊回（資料 bgnBusy；src/bgnight3d.js）⑤辭職後再應徵全部打工比照（資料 reapply.all：舊的那幾間、補習班、事務所也是隔一個學期）、熟練度保留（reapply.keepSkill：S.apply 把 skill 和做過的事帶到新的一份；
       第一班那一段 D().first 再應徵不重演）⑥越好吃上班時同學來吃飯不用 meal_hello，改資料 yueMeal 那一組（S.yueMeal；照人各記一次，第二次只有旁白；阿哲、可昕各自一句）。
 第 6、7 節（企劃線 1d6055568c；2026-11-12）：第 6 節＝宋知寧第 5 則訊息以後才在山嵐（認識過的）／大一下起（完全沒認識過的），只有兩版、「還沒傳第 5 則」那一版作廢（S.znCoOn、S.znCoLines；她搬過去、補發第 5 則在 src/shopenc3d.js）。
       第 7 節：①私訊約的桌遊夜也自動回（src/bgnight3d.js，原本就比照）②可昕交往中才排進越好吃晚餐、一學期最多兩次（src/shoplife3d.js S.yueDate；S.mealHere 改成看這一班裡）③女主角用通用句、學姊自己一句（S.YUE_ALIAS）
       ④家教也比照再應徵（S.tutorReAsk：下一個學期開學明軒再問一次）⑤員工票再應徵不用重新滿 3 班（j.shiftsPrev）。存檔多：G.jobs.<k>.shiftsPrev、G.flags.TUTOR_RE／TUTOR_RE_ANS、G.flags.SHOP_YUE_DATE；沒有＝0／沒有再接過／還沒來過。
     第 8 節（企劃線 1e539b8eb9；2026-11-12 第五輪）：①②沒認識過宋知寧的玩家她不出現在山嵐、「新來的？」那一版不演（S.znCoOn／znCoLines；資料不再有 co.new／newFrom）③④照原本的做法 ⑤家教回「不了」以後不再問（S.tutorSaidNo、G.flags.TUTOR_RE_NO）。
     同一輪 BB 判的 P1（使用者電腦實測 d4daa6326c）：來吃飯的人真的進店裡才演（S.mealBring → SHOPLIFE.bringIn）、新店上班站櫃台後＋藏書包（S.workOn／workOff／workHeal；沒有圍裙模型）、
       上班時「排進行程」的提示留到下班（src/outings3d.js S.planFlush）。測試 tests/shop_jobs_round5_1112_unit.js
     第 9 節（企劃線 3e9cd7d9d4；2026-11-12 第六輪）：①學姊來越好吃不走晚餐名單的亂數——每學期第一次符合的那一天、交往中兩次隔三週（規則在資料 yueMeal.sis；src/shoplife3d.js S.yueDatePlan；這裡 S.yueMetOnly：認識她就算，不用到朋友）
       ②家教回「不了」以後，下一個學期開學起明軒那一串多一個回覆選項（資料 reapply.tutorBack；S.tutorBack）③再問的那一則沒回過期也算問過（S.tutorReAsked；開學那一則過期 S.tutorLimbo）④帶不進店裡不演不記：照舊。
       存檔：沒有新旗標（選項掛在那一則訊息的 ask；放假時回的先留在 TUTOR_RE_ANS）。測試 tests/shop_jobs_round6_1112_unit.js
       存檔：沒有新欄位（照舊 G.jobs.<k>.re、skill、G.jobs.yue.mealHi）；舊規則下已經再應徵過的＝熟練度已經從 0 算，沒有東西可以補，照現在的數字走。
     第 10 節（企劃線 33e9522155；2026-11-12 第七輪；AA 回第六輪六題，改兩點、其餘四點照原本）：①學姊那一組每學期說一次（S.yueMealRun／S.yueHiT；存檔多 G.jobs.yue.mealHiT，沒有＝{}）
       ⑤家教那個選項一律掛在明軒那一串最新一則底下、之後跟著移（S.tutorBackSpot／S.tutorBack；ask.was）。②③④⑥（次數用完不照名單亂數來、在臺灣用當天判斷、開學那一則過期也給選項、「先停」不算回「不了」）不動。
       測試 tests/shop_jobs_round7_1112_unit.js */
  /* ---------- 新店打工第二批（AA_829，企劃線 ea5e8f5ae；SHOP-JOBS-1112）：花序 Flower Notes（flower，區域 flower_notes）、越好吃小館（yue，區域 tz_yuehaochi）、大口漢堡（dakou，區域 xs_dakou）----------
     字在 src/data/shop_jobs_aa829.js（tools/story/import_shop_jobs_aa829.py 產生）；整套照第一批（S.apply3、S.runShiftX）。多的：
     - 告示那個按鈕的字照稿（X.look：「看小卡」「看告示」「看立牌」）。位置：花序＝二樓示範長桌西端旁邊；越好吃＝櫃檯西端旁邊；大口漢堡＝一樓櫃檯西端旁邊（都不動模型）。
     - 什麼時候起：花序＝上過任何一門花藝課以後（need：G.flags.FC 的 cnt／last，src/flower_class3d.js）；越好吃、大口漢堡＝大一下（from）。
     - 班表：花序 週六 09:00～13:00（10:00 才開店：有班的人那個時候進得去、不會被請出去，S.early；src/flower_notes_sys3d.js、src/xs_close3d.js）、週日 13:00～17:00；
       越好吃 週二、週四 17:30～21:00（686 元；下午第二堂課到 17:20＝不算撞課：exact＝照實際的時間比，不照上午／下午／晚上的時段比）；
       大口漢堡 週一、週四 18:00～22:00、週六 22:00～隔天 02:00（大夜班 880 元＝payWd；下班照便利商店夜班 S.nightSleep、隔天 10:00 以前的班自動請假）——三選二（S.pickDays 兩步的那一種，和阿德影印一樣）。
     - 班表衝突（AA_829 第 4 節；所有打工都一樣，家教也算）：選班表的時候，和已經排的班時間重疊的那一班灰掉（S.busyWith；選了灰的＝再選一次，稿沒有寫說明的字）。
     - 最後一句旁白：同一個名字的班（大口漢堡週一、週四的晚班）輪同一組（endKey）。越好吃做到 21:00＝打烊：照「那天在這間店打工的人不說打烊那句」（XSCLOSE.staffToday；src/gg3shops3d.js 的 S.gen）。
     - 越好吃上班那兩天同學來吃飯（AA_829 第 2 節＋第 5 節第 7 點）：「點餐」那一段後面，SHOPLIFE 這時候排進店裡吃飯、朋友以上的同學（SHOPMEET.helloDue）照平常的 meal_hello 一句，後面多一句旁白 mealExtra；每人一次（G.jobs.yue.mealHi＝[人物]）。
       2026-11-12 AA_828 第 5 節第 6 點改：不用 meal_hello，改 SHOP_JOBS_AA828.yueMeal 那一組（S.yueMeal）；上面那一種只在沒有 yueMeal 資料的時候當備用。
     AA_829 第 5 節（AA 回七點，企劃線 34f35eb15a；2026-11-12）：①選到灰掉的班＝一句旁白（資料 busyLine）再回選單 ②大口漢堡最多兩班、可以只選一班（照舊）③值班經理男、花藝師和老闆娘女（資料 gender）
       ④大夜班下班回祐廷現在住的地方睡到 10:00、不寫地點（S.nightSleep；便利商店夜班一樣）⑤家教算已排的班（S.busyWith 照舊）⑥大夜班隔天 10:00 以前的班選班的時候就灰掉（S.busyWith；兩邊都擋：先有大夜班再選早班、先有早班再選大夜班）。
       舊存檔已經兩個都排了的：照舊那天自動請假（S.excused 的 night）。
     存檔：照舊 G.jobs.<flower|yue|dakou>（yue 多 mealHi）；舊存檔沒有＝沒應徵過。測試：node tests/shop_jobs_aa829_1112_unit.js */
  let A3c; const A3=()=>{ if(A3c!==undefined) return A3c; const a=typeof SHOP_JOBS_AA828!=='undefined'&&SHOP_JOBS_AA828&&SHOP_JOBS_AA828.jobs, b=typeof SHOP_JOBS_AA829!=='undefined'&&SHOP_JOBS_AA829&&SHOP_JOBS_AA829.jobs; return (A3c=a||b?Object.assign({},a||{},b||{}):null); };
  S.X3={ shanlan:{name:'山嵐書店',short:'山嵐書店',zone:'xs_shanlan',bossId:'shanlan_boss',contact:'山嵐書店的店長',title:'山嵐書店的班',travel:'走過去約 15 分鐘',place:'新生南路・山嵐書店',
      desk:{x:3.9,z:0.4,lv:0,label:'櫃檯旁邊的告示'},fromWeek:['Y1S1',4],nextWeek:true,reapply:true},
    cinema:{name:'南洋戲院',short:'南洋戲院',zone:'xs_nanyang',bossId:'cinema_boss',contact:'南洋戲院的經理',title:'南洋戲院的班',travel:'走過去約 15 分鐘',place:'新生南路・南洋戲院',
      desk:{x:-2.0,z:4.2,lv:0,label:'售票口旁邊的告示'},from:'Y1S2',nextWeek:true,reapply:true},   /* nextWeek、reapply：AA_828 第 4 節第 3、5 點 */
    flower:{name:'花序 Flower Notes',short:'花序',zone:'flower_notes',bossId:'flower_boss',contact:'花序的花藝師',title:'花序的班',travel:'走過去約 15 分鐘',place:'公館・花序 Flower Notes',   /* 男女在資料（gender；AA_829 第 5 節第 3 點）*/
      desk:{x:-3.2,z:-5.2,lv:1,r:0.8},exact:true,need:G=>{ const r=G&&G.flags&&G.flags.FC; return !!r&&typeof r==='object'&&((r.cnt|0)>0||r.last!=null); }},
    yue:{name:'越好吃小館',short:'越好吃小館',zone:'tz_yuehaochi',bossId:'yue_boss',contact:'越好吃小館的老闆娘',title:'越好吃小館的班',travel:'走過去約 15 分鐘',place:'汀州路・越好吃小館',
      desk:{x:-1.2,z:-2.3,lv:0,r:0.7},from:'Y1S2',exact:true},
    dakou:{name:'大口漢堡',short:'大口漢堡',zone:'xs_dakou',bossId:'dakou_boss',contact:'大口漢堡的值班經理',title:'大口漢堡的班',travel:'走過去約 15 分鐘',place:'新生南路・大口漢堡',
      desk:{x:-4.2,z:-3.0,lv:0,r:0.9},from:'Y1S2',exact:true} };
  S.mergeX3=function(W){ const A=A3(); if(!W||!A||W._x3) return W; W._x3=true; W.apply3=W.apply3||{};
    for(const k in S.X3){ const a=A[k]; if(!a) continue; const hours={}, payWd={}, endKey={}, first={}; for(const q of a.sched){ hours[q.wd]=[q.t0,q.t1]; if(q.pay!=null) payWd[q.wd]=q.pay;
        if(q.name){ if(first[q.name]==null) first[q.name]=String(q.wd); endKey[q.wd]=first[q.name]; } }   /* payWd：那一班的薪水不一樣（大夜班）；endKey：同一個名字的班輪同一組最後一句 */
      W.shops[k]=Object.assign({boss:a.boss,days:a.sched.map(q=>q.wd),hours,pay:a.pay,payWd,payToast:S.X3[k].short+' 薪水 '+a.pay+' 元',x:true,closeOut:a.sched.filter(q=>q.close).map(q=>q.wd)},a.gender?{gender:a.gender}:{},S.X3[k]);
      W.notice[k]=a.notice; W.apply3[k]=a; W.x[k]={segs:a.segs.map(g=>({nov:g.nov,exp:g.exp,ch:g.ch.map(c=>c.slice())})),ev:[],end:a.end,endKey}; }
    return W; };
  const D=()=>typeof WZ_JOBS_DATA!=='undefined'?S.mergeX3(WZ_JOBS_DATA):null;
  S.KEYS=['brunch','copy','tea','cafe','books','cvs','cram','office'].concat(A3()?Object.keys(S.X3).filter(k=>A3()[k]):[]);   /* cafe、books：兩點半 Café 外場、舊路書房（AA_431 第 2 節）；cvs、cram、office：便利商店夜班、補習班助教、事務所工讀（AA_433）——一班照 S.runShiftX */
  const ALIAS={brunch:'brunch',copy:'copy',print:'copy',tea:'tea',teahouse:'tea',cafe:'cafe',books:'books',bookstore:'books',cvs:'cvs',cram:'cram',office:'office'};
  S.key=k=>ALIAS[k]||null;
  S.ZONE_KEY={wz_brunch:'brunch',wz_print:'copy',wz_teahouse:'tea',cafe:'cafe',bookstore:'books',cvs:'cvs'}; for(const k of S.KEYS) if(S.X3[k]){ ALIAS[k]=k; S.ZONE_KEY[S.X3[k].zone]=k; }   /* 山嵐書店、南洋戲院（AA_828）；花序、越好吃小館、大口漢堡（AA_829）*/   /* 補習班、事務所沒有 3D（2D 的出遊）*/
  const T=(d,h)=>d*24+h;
  const now=G=>T(G.day,G.hour);
  const hasCal=()=>typeof CALENDAR!=='undefined';
  const wdOf=d=>CALENDAR.dateOf(d).wd;   /* 1＝週一 … 7＝週日 */
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const shop=k=>D().shops[k];
  const whoOf=(G,who)=>who==='player'?{name:G.name}:(!who?null:(typeof CHARACTERS!=='undefined'&&CHARACTERS[who]&&typeof SOCIAL!=='undefined'&&SOCIAL.displayName?{name:SOCIAL.displayName(who),charId:who}:{name:who}));   /* 人物 id（芷若、沛珊）＝她的名字 */
  const say=async(GM,who,t)=>{ const G=GM.G; await GM.say(whoOf(G,who),String(t).replace(/\{name\}/g,G.name)); };
  /* 一串台詞：[說話的人, 字]（null＝旁白）、{choice:[{t,say}]} */
  S.play=async function(GM,L){ for(const x of (L||[])){ if(!x) continue; if(Array.isArray(x)) await say(GM,x[0],x[1]); else if(x.choice){ const k=await GM.choose(x.choice.map(c=>({t:c.t}))); const c=x.choice[k]||x.choice[0]; await S.play(GM,c.say); } } };

  // ---------- 存檔 ----------
  S.rec=function(G){ if(!G.jobs||typeof G.jobs!=='object'||Array.isArray(G.jobs)) G.jobs={}; const J=G.jobs; if(!J._meta||typeof J._meta!=='object') J._meta={}; const M=J._meta; if(!M.n||typeof M.n!=='object') M.n={}; if(!M.asked||typeof M.asked!=='object') M.asked={}; return J; };
  S.job=(G,k)=>{ k=S.key(k); if(!k||!G) return null; const j=S.rec(G)[k]; return j&&typeof j==='object'?j:null; };
  S.active=(G,k)=>{ const j=S.job(G,k); return !!j&&!j.gone; };
  const fix=j=>{ if(!Array.isArray(j.day)) j.day=[]; if(!Array.isArray(j.worked)) j.worked=[]; if(!j.wk||typeof j.wk!=='object') j.wk={}; if(!j.brk||typeof j.brk!=='object') j.brk={}; if(!j.ot||typeof j.ot!=='object') j.ot={}; return j; };

  // ---------- 日曆 ----------
  S.route=G=>typeof STORY!=='undefined'&&STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null;   /* 交換延畢（日本、美國路線）*/
  S.finalTerm=G=>S.route(G)?'Y5S1':'Y4S2';   /* AA_420 第 15 條 */
  S.endDay=G=>{ const r=hasCal()&&CALENDAR.termDays?CALENDAR.termDays(S.finalTerm(G)):null; return r?r.to:1e9; };
  S.startDay=()=>{ const r=hasCal()&&CALENDAR.termDays?CALENDAR.termDays('Y1S1'):null; return r?r.from:1e9; };   /* 大一上第 1 週起（使用者 11-03「一開始就要有」；原本 AA_164 第 2 節大一下第 1 週起）；舊序章那一年看 law(G) */
  S.termAt=(G,d)=>{ if(!hasCal()) return null; const t=CALENDAR.termOf(d); if(t) return t; if(S.route(G)&&CALENDAR.termOfDelayed) return CALENDAR.termOfDelayed(d); return null; };
  /* 寒暑假：HOME.breakOf（大一～大四）；延畢的玩家大四下到大五上中間的暑假另外算（key 'Y4S'）*/
  S.breakAt=function(G,d){ if(!hasCal()||CALENDAR.termOf(d)) return null; if(typeof HOME!=='undefined'&&HOME.breakOf){ const b=HOME.breakOf(d); if(b) return b; }
    if(S.route(G)&&CALENDAR.termDays){ const a=CALENDAR.termDays('Y4S2'), b=CALENDAR.termDays('Y5S1'); if(a&&b&&d>a.to&&d<b.from) return {key:'Y4S',kind:'summer',year:'Y4',from:a.to+1,to:b.from-1,next:'Y5S1'}; }
    return null; };
  S.away=(G,d)=>{ if(typeof STORY==='undefined') return false; const g=Object.assign({},G,{day:d}); return !!((STORY.movedOut&&STORY.movedOut(g))||(STORY.abroad&&STORY.abroad(g))); };   /* 出國那一學期（X1 退宿～返台）*/
  S.year=(G,d)=>{ if(d==null) d=G.day; let t=S.termAt(G,d); for(let x=d-1;!t&&x>d-200;x--) t=S.termAt(G,x); const m=t?/^Y(\d)/.exec(t.id):null; return m?+m[1]:1; };   /* 寒暑假照前一個學期 */
  S.natHoliday=d=>{ if(!hasCal()) return false; const h=CALENDAR.holiday(d); if(!h) return false; const k=CALENDAR.dateOf(d).key; if(CALENDAR.SCHOOL&&CALENDAR.SCHOOL[k]) return false; if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) return false; return true; };   /* 勞基法 §37 的休假日（校定假日、颱風假不算）*/
  S.wage=d=>{ const y=hasCal()?CALENDAR.dateOf(d).y:2025; return y<=2025?200:(y===2026?206:215); };   /* 當年最低工資＋10（BB_115 L439；2028 以後公告前先用 215）*/
  S.period=t=>t<12?'am':(t<18?'pm':'ev');
  /* 那一天的上班時間：Café、書店每一天不同（shops[k].hours：週幾→[開始, 結束]），溫州街三家照 t0、t1 */
  S.hrsWd=(k,wd)=>{ const s=shop(k); return (s.hours&&s.hours[wd])||[s.t0,s.t1]; };
  S.hrs=(k,d)=>S.hrsWd(k,hasCal()?wdOf(d):6);
  const weekOf=d=>d-(wdOf(d)-1);   /* 那一週的週一 */

  // ---------- 這一天有沒有班 ----------
  S.EXCUSE=[];   /* 事件包登記的「那天自動請假」：fn(G,k,d)→原因或 null（例：線一、線三的法服週六，早午餐自動請假；src/wzlines3d.js）*/
  S.overlap=(a0,a1,b0,b1)=>a0<b1-1e-6&&b0<a1-1e-6;
  /* 寒暑假的「來。」：那一天有營隊、活動、出遊、出國＝自動請假（AA_420 第 13 條）*/
  S.vacBusy=function(G,d,k){ if(typeof VAC!=='undefined'){ try{ if(VAC.abroadOn&&VAC.abroadOn(G,d)) return 'trip'; const R=VAC.rec?VAC.rec(G).reg:{}; if(VAC.all) for(const I of VAC.all()){ if(!['yes','done'].includes(R[I.key])) continue; if(d>=I.from&&d<=I.to) return 'vac'; } }catch(e){} }
    if(typeof OUT!=='undefined'&&OUT.rec){ const s=shop(k); const H0=S.hrs(k,d); for(const q of OUT.rec(G)){ if(q.day!==d||/^job_/.test(q.id||'')||q.state==='missed'||q.state==='cancelled') continue; const a=(q.h||0)-(q.travelH||0.5), b=(q.h||0)+(q.hours||2); if(S.overlap(a,b,H0[0],H0[1])) return 'out'; } }
    return null; };
  S.excused=function(G,k,d){ const H0=S.hrs(k,d); if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) return 'typhoon';
    if(H0[0]<10) for(const o of S.KEYS){ if(o!==k&&S.active(G,o)&&S.scheduled(G,o,d-1)&&S.hrs(o,d-1)[1]>24) return 'night'; }   /* 前一晚便利商店夜班（AA_433 第 1 節）、大口漢堡大夜班（AA_829）：隔天 10:00 以前在睡覺 */
    if(typeof CLS!=='undefined'&&CLS.dayItems){ const cok=!!shop(k).classOk; try{ for(const it of CLS.dayItems(G,d)) if((it.exam||!cok)&&S.overlap(it.t0,it.t1,H0[0],H0[1])) return it.exam?'exam':'class'; }catch(e){} }   /* 第 9 條：期末考的時段（classOk 的工作也一樣請假，BUG-JOBS-OFFICE-EXAM-1102）；第 12 條：有課的時段（classOk＝事務所可以排在有課的日子，只略過一般課）*/
    if(!S.termAt(G,d)&&S.vacBusy(G,d,k)) return 'busy';
    for(const f of S.EXCUSE){ try{ const r=f(G,k,d); if(r) return r; }catch(e){ console.warn('JOBS.EXCUSE',e); } }
    return null; };
  /* 照班表、這一天該上班嗎（還沒算請假的理由）*/
  S.scheduled=function(G,k,d){ const j=S.job(G,k); if(!j||j.gone||!hasCal()||!law(G)) return false; fix(j); const s=shop(k);
    if(d<(j.since|0)||d>S.endDay(G)) return false; if(d===j.since&&j.from!=null&&T(d,S.hrs(k,d)[0])<=j.from) return false;
    if(!j.day.includes(wdOf(d))) return false; if(j.back||S.away(G,d)) return false;
    if(S.termAt(G,d)) return true;
    const b=S.breakAt(G,d); return !!b&&j.brk[b.key]==='go'; };
  S.due=(G,k,d)=>S.scheduled(G,k,d)&&!S.excused(G,k,d);
  S.worked=(G,k,d)=>{ const j=S.job(G,k); return !!j&&Array.isArray(j.worked)&&j.worked.includes(d); };
  /* 開店以前就要上班的班（花序週六 09:00，10:00 開店）：現在是不是「有班的人可以進店」的時候（上班前半小時到下班）——店門、打烊請人出去那兩處問這裡 */
  S.early=function(G,zone){ const k=S.ZONE_KEY[zone]; if(!k||!G||!hasCal()||!S.active(G,k)) return false; try{ if(!S.due(G,k,G.day)) return false; const h=S.hrs(k,G.day); return G.hour>=h[0]-0.5&&G.hour<h[1]; }catch(e){ return false; } };
  S.shiftNow=function(G,k){ k=S.key(k); if(!S.active(G,k)) return false; const t0=S.hrs(k,G.day)[0], h=G.hour; return S.due(G,k,G.day)&&!S.worked(G,k,G.day)&&h>=t0-0.5&&h<=t0+0.75; };

  // ---------- 給別的檔案讀 ----------
  S.at=function(G,k){ if(!G) return null; if(k==='tutor'){ const F=G.flags||{}; if(!F.JOB_TUTOR||S.tutorEnded(G)) return null; const wd=F.TUTOR_WD===4?4:2;
      return {lv:F.TUTOR_N|0,shifts:F.TUTOR_N|0,since:F.tutorFromDay,day:[wd],today:G.weekday===wd&&S.tutorDayOk(G,G.day),board:null,shiftNow:false}; }   /* 家教（AA_164 第 7 節：tutor）：照舊 JOB_TUTOR；停了、會考以後＝null（AA_163 第 2 節）*/
    const kk=S.key(k); if(!kk||!S.active(G,kk)) return null; const j=fix(S.job(G,kk)), d=G.day, worked=S.worked(G,kk,d);
    let board=null; if(kk==='brunch'&&worked&&typeof WZS!=='undefined'&&WZS.BOARD){ const L=WZS.BOARD[wdOf(d)]||WZS.BOARD[2]; board=L&&L[0]||null; }   /* 有班那天的黑板：今天早上寫的那一句（今日推薦）*/
    return {lv:j.skill|0,skill:j.skill|0,shifts:j.shifts|0,day:j.day.slice(),today:S.due(G,kk,d),worked,board,shiftNow:S.shiftNow(G,kk)}; };
  S.paused=(G,k)=>{ const j=S.job(G,k); if(!j||j.gone) return true; if(G.day>S.endDay(G)||j.back||S.away(G,G.day)) return true; if(!S.termAt(G,G.day)){ const b=S.breakAt(G,G.day); if(b&&fix(j).brk[b.key]!=='go') return true; } return false; };
  S.any=G=>{ if(!G||!law(G)) return null; for(const k of S.KEYS) if(S.active(G,k)&&!S.paused(G,k)) return k; return null; };   /* 現在有在做的那一家（家教另外看 JOB_TUTOR）*/
  S.summerPay=true;   /* 暑假的班照班發薪（r3_3d.js 的 22000 不再另外給）*/

  // ---------- 一週最多兩班 ----------
  S.tutorWeekly=G=>S.tutorOn(G)?1:0;   /* 家教那一週算一班（大一上～大二下有在上的學期，AA_163 第 2 節；11-03 起大一上第 6 週可以接）*/
  S.used=(G,except)=>{ let n=S.tutorWeekly(G); for(const k of S.KEYS){ if(k===except||!S.active(G,k)) continue; n+=fix(S.job(G,k)).day.length; } return n; };
  S.cap=(G,k)=>Math.max(0,2-S.used(G,k));
  /* 那一學期那一天、那個時段有課（AA_420 第 12 條第 1 點）*/
  S.classOn=function(G,k,wd){ if(typeof CLS==='undefined'||!CLS.termCourses||typeof COURSES==='undefined') return false; const t=S.termAt(G,G.day)||(()=>{ const b=S.breakAt(G,G.day); return b&&b.next?{id:b.next}:null; })(); if(!t) return false;
    const p=shop(k).hours?S.period(S.hrsWd(k,wd)[0]):shop(k).period, ex=shop(k).exact?S.hrsWd(k,wd):null;   /* exact（AA_829）：照實際的時間比（越好吃 17:30 開始，下午第二堂課到 17:20＝沒有撞）*/
    try{ for(const c of CLS.termCourses(G,t.id)) for(const s of (c.slots||[])){ if(s.wd!==wd) continue; const b=COURSES.blocks[s.block]; if(b&&(ex?S.overlap(b.t0,b.t1,ex[0],ex[1]):S.period(b.t0)===p)) return true; } }catch(e){} return false; };
  S.eligible=(G,k)=>{ if(!(law(G)&&hasCal()&&G.day>=S.startDay()&&G.day<=S.endDay(G))) return false; const nd=k&&shop(k)&&shop(k).need; if(typeof nd==='function'&&!nd(G)) return false;   /* need：花序＝上過一次花藝課以後才有小卡（AA_829）*/ const fw=k&&shop(k)&&shop(k).fromWeek; if(fw){ const d0=typeof STORY!=='undefined'&&STORY.termDayIn?STORY.termDayIn(fw[0],fw[1],1):null; return d0==null||G.day>=d0; }   /* fromWeek：山嵐書店大一上第 4 週起（AA_828）*/
    const f=k&&shop(k)&&shop(k).from; if(!f) return true; const r=CALENDAR.termDays&&CALENDAR.termDays(f); return !r||G.day>=r.from; };   /* from：補習班大二起、事務所大三起（AA_433）*/
  const WD=['','週一','週二','週三','週四','週五','週六','週日'];
  S.schedText=(k,days)=>{ const s=shop(k); if(!s.hours) return days.map(d=>WD[d]).join('、')+' '+hm(s.t0)+'～'+hm(s.t1); return days.map(d=>{ const h=S.hrsWd(k,d); return WD[d]+' '+hm(h[0])+'～'+hm(h[1]); }).join('、'); };   /* 班表的字（Café、書店每天時間不同）*/
  const hm=h=>{ const H=Math.floor(h), mm=Math.round((h-H)*60), hh=H%24; return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; };   /* 26＝隔天 02:00 */
  /* 班表衝突（AA_829 第 4 節）：這一班（k 的週 wd）和已經排的班時間重疊嗎——別的打工同一天的班、前一天過了午夜的班、家教（19:00～21:00）。回傳撞到的那一份工作或 null */
  S.busyWith=function(G,k,wd){ const a=S.hrsWd(k,wd), prev=(wd+5)%7+1, next=wd%7+1;
    for(const o of S.KEYS){ if(o===k||!S.active(G,o)) continue; const D0=fix(S.job(G,o)).day;
      if(D0.includes(wd)){ const b=S.hrsWd(o,wd); if(S.overlap(a[0],a[1],b[0],b[1])) return o; }
      if(D0.includes(prev)){ const b=S.hrsWd(o,prev); if(b[1]>24&&S.overlap(a[0],a[1],b[0]-24,b[1]-24)) return o; }
      if(a[1]>24&&D0.includes(next)){ const b=S.hrsWd(o,next); if(S.overlap(a[0]-24,a[1]-24,b[0],b[1])) return o; }
      if(a[0]<10&&D0.includes(prev)&&S.hrsWd(o,prev)[1]>24) return o;   /* AA_829 第 5 節第 6 點：前一晚有過了午夜的班（大夜班、便利商店夜班）＝隔天 10:00 以前的班選的時候就灰掉 */
      if(a[1]>24&&D0.includes(next)&&S.hrsWd(o,next)[0]<10) return o; }   /* 反過來：隔天早上已經有 10:00 以前的班＝這個大夜班灰掉 */
    if(S.tutorOn(G)&&((G.flags||{}).TUTOR_WD===4?4:2)===wd&&S.overlap(a[0],a[1],19,21)) return 'tutor';
    return null; };
  S.busyLine=()=>(typeof SHOP_JOBS_AA829!=='undefined'&&SHOP_JOBS_AA829&&SHOP_JOBS_AA829.busyLine)||null;   /* 「（這個時段你已經有班了。）」（字在資料）*/
  /* 選班表：兩天以內的店＝各一天／兩天一起；三天的店（阿德影印週二～四、大口漢堡三選二）＝先挑一天，還有名額可以再加一天。和已經排的班重疊的那一班灰掉（選了＝再選一次）*/
  S.pickDays=async function(GM,k){ const G=GM.G, s=shop(k), cap=S.cap(G,k); if(cap<=0){ if(GM.toast) GM.toast('一週最多兩班（所有打工加起來）',3200); return null; }
    const ok=s.days.filter(wd=>s.classOk||!S.classOn(G,k,wd));   /* 事務所：撞到必修課照樣可以選（AA_433 第 3 節）*/ if(!ok.length){ if(GM.toast) GM.toast('那個時段都有課',3000); return null; }
    const hintOf=wd=>{ const h=S.hrsWd(k,wd); return hm(h[0])+'～'+hm(h[1]); }, clash=wd=>!!S.busyWith(G,k,wd);
    const ask=async O=>{ for(let g=0;g<12;g++){ const i=await GM.choose(O.map(o=>Object.assign({t:o.t,hint:o.hint},o.dim?{dim:true}:{}))); const o=O[i]; if(o&&o.dim){ const bl=S.busyLine(); if(bl) await say(GM,null,bl); continue; }   /* AA_829 第 5 節第 1 點：一句旁白、再回選單 */ return o||null; } return null; };
    if(k!=='copy'&&ok.length<=2){ const O=ok.map(wd=>({t:WD[wd],hint:hintOf(wd),days:[wd],dim:clash(wd)})); if(cap>=2&&ok.length===2) O.push({t:WD[ok[0]]+'和'+WD[ok[1]],hint:'一週兩班',days:ok.slice(),dim:clash(ok[0])||clash(ok[1])}); O.push({t:'先不要'});
      const o=await ask(O); return o&&o.days?o.days:null; }
    const O=ok.map(wd=>({t:WD[wd],hint:hintOf(wd),days:[wd],dim:clash(wd)})).concat([{t:'先不要'}]); const o=await ask(O); if(!o||!o.days) return null; const first=o.days[0];
    if(cap<2) return [first]; const O2=ok.filter(wd=>wd!==first).map(wd=>({t:'再加一天：'+WD[wd],hint:hintOf(wd),days:[first,wd],dim:clash(wd)})).concat([{t:'就'+WD[first]+'一天',days:[first]}]);
    const o2=await ask(O2); return (o2||O2[O2.length-1]).days.sort((a,b)=>a-b); };
  /* 撞時段的提醒（AA_420 第 12 條第 3 點：只有撞到的玩家）*/
  S.clashLine=(G,k,days)=>{ const F=G.flags||{}; if(k==='brunch'&&days.includes(6)&&(typeof STORY!=='undefined'&&STORY.fafuBeen?STORY.fafuBeen(G):(F.LAWCLUB_SAT_VISITS|0)>0)) return D().clash.brunch;   /* D118-B5a：加入法服或去過一次（原本只看去過的次數）*/
    if(k==='copy'&&days.includes(4)&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'public_law_group')) return D().clash.copy; return null; };
  /* 應徵（或出國回來重選班表）：選班表 → 撞時段那一句 → 記下來 */
  S.apply=async function(GM,k,o){ o=o||{}; const G=GM.G, J=S.rec(G); const days=await S.pickDays(GM,k); if(!days) return false;
    let j=J[k]; if(!j||j.gone){ const old=j; j=J[k]={since:G.day,from:now(G),day:[],shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:G.day-1,wk:{},brk:{},ot:{}};
      if(old){ j.re=(old.re|0)+1; j.shiftsPrev=(old.shiftsPrev|0)+(old.shifts|0);   /* 以前做過幾班（員工票：AA_828 第 7 節第 5 點）*/ for(const f of ['aliCo','endN','mealHi','mealHiT'].concat(S.keepSkill()?S.KEEP:[])) if(old[f]!=null) j[f]=old[f]; } }   /* 辭職以後再應徵（AA_828 第 4 節第 5 點）：重新算班數；只說一次的那幾樣（Alison 那一句、同學來吃飯那一句）、最後一句輪到哪裡照舊記著。
        第 5 節第 5 點：熟練度保留（「做過的事不會忘」）——skill 和班上演過的小事件、輪到哪一句一起帶過來（S.KEEP）；舊規則下已經再應徵過的存檔＝skill 已經重算，沒有可以補的 */
    fix(j); j.day=days; j.since=o.since!=null?o.since:G.day; j.from=o.since!=null?T(o.since,0):now(G);   /* o.since：「下週開始」（補習班、事務所的面試）*/ j.back=false; j.away=false; j.chk=Math.max(j.chk|0,G.day-1); j.missedRun=0; j.missPend=false;
    const c=S.clashLine(G,k,days); if(c) await say(GM,c[0],c[1]);
    if(GM.toast) GM.toast('班表：'+shop(k).short+'　'+S.schedText(k,days),3600);
    if(GM.autosave) GM.autosave(); return true; };

  S.RA=()=>(typeof SHOP_JOBS_AA828!=='undefined'&&SHOP_JOBS_AA828&&SHOP_JOBS_AA828.reapply)||null;   /* AA_828 第 5 節第 5 點（字和規則在資料）*/
  S.keepSkill=()=>!!(S.RA()&&S.RA().keepSkill);
  S.KEEP=['skill','xev','withN','nightN','psSeen','psGone','b5','otN','missN'];   /* 再應徵帶過來的：熟練度、演過的小事件、輪流的句子輪到哪裡、只演一次的那幾樣 */

  // ---------- 離開的時候（第 7 條；AA_420 第 15 條）----------
  S.ITEM_FLAG={timer:'WZ_ITEM_TIMER',notebook:'WZ_ITEM_NOTEBOOK',tea:'WZ_ITEM_TEA'};
  S.leave=async function(GM,k,why,pre){ const G=GM.G, j=S.job(G,k); if(!j) return false; const L=D().leave[k];   /* Café、書店沒有「離開的時候」（AA_431 沒寫）：只有辭職那一句 */
    if(pre) await S.play(GM,[pre]); if(L){ await say(GM,L.line[0],L.line[1]);
      G.flags[S.ITEM_FLAG[L.item]]=G.day; if(GM.toast){ const r=D().room[L.item]; if(r) GM.toast('（'+r[0]+'）',2800); } }
    j.gone=why||'quit'; j.quit=G.day; j.pendLeave=false; j.left=G.day; if(GM.autosave) GM.autosave(); return true; };
  S.quitLine=k=>(D().quitLines&&D().quitLines[k])||D().quitLine;   /* Café 的離職那一句（AA_519 3-2）*/
  S.quit=async function(GM,k){ await S.leave(GM,k,'quit',[shop(k).boss,S.quitLine(k)]); };

  // ---------- 一班 ----------
  S.MID_EV=[];       /* 一班的中間：async fn(GM,k,n,ctx)（src/ytjob3d.js）*/
  S.SHIFT_EV=[];      /* 事件：async fn(GM,k,n,ctx)（三段工作之後、薪水之前；四條故事線，src/wzlines3d.js）*/
  S.SHIFT_LINES=[];   /* 多的一句旁白：fn(G,k,n,seg)→[一句…] 或 null（seg：'mid'＝第二段之後、'close'＝收尾之後）*/
  S.AFTER_SHIFT=[];   /* 下班以後：async fn(GM,k,n,ctx) */
  S.season=G=>{ const m=hasCal()?CALENDAR.dateOf(G.day).m:6; return m>=3&&m<=5?'spring':(m>=6&&m<=8?'summer':(m>=9&&m<=11?'autumn':'winter')); };
  S.skillLine=(k,v)=>{ let t=null; for(const [lv,s] of D()[k].skill) if(v>=lv) t=s; return t; };
  const pick=(L,n)=>L[((n-1)%L.length+L.length)%L.length];
  S.missLines=(k,j)=>{ const L=D()[k].miss, x=L[(j.missN|0)%L.length]; return x; };
  S.segs=function(G,k,n){ const P=D()[k]; if(k==='tea') return {a:P.yard[S.season(G)]||P.yard.spring,b:pick(P.mid,n),c:pick(P.close,n)};
    let b=pick(P.mid,n); if(b==='wall'){ const done=!!(G.events&&G.events.done&&G.events.done.ev_wz_c2); b=done?P.wall:pick(P.mid,n+1); }   /* 第 5 格：WZ-C2 那一次以後才有 */
    return {a:pick(P.open,n),b,c:pick(P.close,n)}; };
  const extra=(G,k,n,seg)=>{ const out=[]; for(const f of S.SHIFT_LINES){ try{ const r=f(G,k,n,seg); if(r) out.push(...r); }catch(e){ console.warn('JOBS.SHIFT_LINES',e); } } return out; };
  S.running=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['jobs3d:running']=()=>{ S.running=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  /* 打工的站位（ADE-SEATS-NAV-1104，LAWWW2-C 11-05 提案）：WZ_SHOPS_LAYOUT 的 work.{a,b,c}.me＝一班三段（接單／做的時候／交件）玩家在店裡的位置。
     原本沒有程式讀它：整班人都站在走進來的地方（CC ADE_int_job：三個站位最近 1.94／2.04／1.1 m）。每一段開始前走過去；坐的那一段照座位的走近點（ap）坐下。
     人不在那一間店裡（G.zone）、配置沒有這一段就不動。先只開阿德影印（S.STATION_SHOPS）：早午餐、茶屋的 work 還沒對過新室內 */
  S.STATION_SHOPS={copy:'print'};
  S.station=async function(GM,k,seg){ const key=S.STATION_SHOPS[k], E=GM&&GM.E, G=GM&&GM.G; if(!key||!E||!E.player||!G||G.zone!==shop(k).zone) return false;
    const L=typeof WZ_SHOPS_LAYOUT!=='undefined'?WZ_SHOPS_LAYOUT[key]:null, w=L&&L.work&&L.work[seg], m=w&&w.me; if(!m) return false;
    const P=E.player; if(P.seat&&GM.standUp) GM.standUp(P);
    if(m.act==='sit'){ const st=Object.assign({x:m.x,z:m.z,yaw:m.yaw||0},m.ap?{ap:m.ap}:{}), ap=GM.seatApproach?GM.seatApproach(st):[m.x,m.z];
      if(GM.walkTo) await GM.walkTo(P,ap[0],ap[1]); if(GM.sitAt) GM.sitAt(P,st); }
    else { if(GM.walkTo) await GM.walkTo(P,m.x,m.z); if(P.obj&&m.yaw!=null) P.obj.rotation.y=m.yaw; }
    return true; };
  S.runShift=async function(GM,k){ if(shop(k).x) return S.runShiftX(GM,k); const G=GM.G, j=fix(S.job(G,k)); if(!j||S.running) return false; const s=shop(k), d=G.day, n=(j.shifts|0)+1, ctx={day:d,n};
    S.running=true; GM.sceneBegin();
    try{
      const P=GM.E&&GM.E.player; if(P&&P.seat&&GM.standUp) GM.standUp(P);
      if(G.hour<s.t0){ if(GM.fade) await GM.fade(true); GM.advance(s.t0-G.hour); if(GM.fade) await GM.fade(false); }
      const end=T(d,s.t1), seg=Math.max(0,(end-now(G))/3);
      if(n===1&&!j.re) await S.play(GM,D().first[k]);   /* WZ-B1／C1／T1（再應徵的第一班不重演：AA_828 第 5 節第 5 點）*/
      if(k==='tea'&&!j.re&&typeof YTJOB!=='undefined'&&YTJOB.firstShift) await YTJOB.firstShift(GM,ctx);   /* AA_610 第 2 節：茶屋的班第一次遇到語彤（接在蘇姨「水不要滾太久……」之後；收店那兩句在 SHIFT_EV）*/
      if(j.missPend){ await S.play(GM,S.missLines(k,j)); j.missN=(j.missN|0)+1; }   /* 上週沒去（第 6 條）*/
      const sg=S.segs(G,k,n);
      await S.station(GM,k,'a'); await S.play(GM,sg.a); GM.advance(seg);   /* 站位（ADE-SEATS-NAV-1104）：接單 */
      { const sl=S.skillLine(k,j.skill|0); if(sl) await say(GM,null,sl); }   /* 熟練描述（AA_165 1-4／2-5／3-4）*/
      await S.station(GM,k,'b'); await S.play(GM,sg.b); await S.play(GM,extra(G,k,n,'mid'));   /* 做的時候 */
      for(const f of S.MID_EV){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.MID_EV',e); } }   /* 一班的中間（第二段工作之後）：語彤 AA_625 10' 媽媽來、茶屋平常的班那一句（src/ytjob3d.js）*/
      GM.advance(seg);
      if(k==='brunch'&&S.natHoliday(d)&&!j.b5) await S.b5(GM,j);   /* WZ-B5 國定假日的班（一次）*/
      await S.station(GM,k,'c'); await S.play(GM,sg.c);   /* 交件 */
      if(k==='brunch'&&j.b5next&&j.b5!==d){ await say(GM,null,D().b5.next); j.b5next=false; }   /* WZ-B5 的下一班 */
      await S.play(GM,extra(G,k,n,'close'));
      for(const f of S.SHIFT_EV){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.SHIFT_EV',e); } }
      const rest=end-now(G); if(rest>0) GM.advance(rest);
      const pay=S.wage(d)*(s.t1-s.t0)*(S.natHoliday(d)?2:1); if(GM.money) GM.money(pay); else G.money=(G.money|0)+pay; if(GM.toast) GM.toast(s.short+'的薪水 +'+pay+' 元',2800);
      if(typeof CLS!=='undefined'&&CLS.slotFillSpan) CLS.slotFillSpan(G,s.t0,s.t1);   /* 一班＝那個時段的一件主要的事（AA_420 2-1）*/
      j.shifts=n; j.skill=Math.min(10,(j.skill|0)+1); j.worked.push(d); if(j.worked.length>80) j.worked.splice(0,j.worked.length-80); j.missPend=false; j.missedRun=0; j.lastShift=d;
      if(n===1&&typeof INV!=='undefined'&&INV.addContact){ try{ INV.addContact(G,s.bossId); }catch(e){} }   /* 第一班以後有老闆的聯絡方式（AA_166 第 5 節）*/
      for(const f of S.AFTER_SHIFT){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.AFTER_SHIFT',e); } }
      if(S.lastShift(G,k,d)) await S.leave(GM,k,'grad');   /* 大四下（延畢：大五上）最後一班＝離開的時候 */
    } finally { GM.sceneEnd(); S.running=false; }
    if(GM.autosave) GM.autosave(); return true; };
  /* 最後一學期、之後這學期已經沒有班了 */
  S.lastShift=function(G,k,d){ const t=S.termAt(G,d); if(!t||t.id!==S.finalTerm(G)) return false; const r=CALENDAR.termDays(t.id); if(!r) return false; for(let x=d+1;x<=r.to;x++) if(S.due(G,k,x)) return false; return true; };
  S.b5=async function(GM,j){ const G=GM.G, B=D().b5; await say(GM,B.ask[0],B.ask[1]); await say(GM,'player',S.year(G)>=3?B.y3:B.y12); await say(GM,B.boss[0],B.boss[1]);
    if(GM.addNote) GM.addNote('NOTE_HOLIDAY_WAGE','國定假日的班',''); j.b5=G.day; j.b5next=true; };
  /* 考試週加班（影印店，21:00～24:00；加班不算在每週兩班裡；那天晚上已經做了別的主要活動就不問）*/
  S.otWeek=(G,d)=>{ const t=S.termAt(G,d); return t&&t.exam?t.id+':'+t.week:null; };
  S.otDay=function(G,d){ if(!S.active(G,'copy')) return false; const j=fix(S.job(G,'copy')), wk=S.otWeek(G,d); if(!wk||j.ot[wk]||j.back||S.away(G,d)) return false; const wd=wdOf(d); if(wd===7) return false;   /* 週日公休 */
    if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) return false; return true; };
  S.runOT=async function(GM){ const G=GM.G, j=fix(S.job(G,'copy')), s=shop('copy'), wk=S.otWeek(G,G.day); if(!j||S.running) return false; S.running=true; GM.sceneBegin();
    try{ j.ot[wk]='done'; if(G.hour<s.ot.t0) GM.advance(s.ot.t0-G.hour); const n=(j.otN|0)+1; j.otN=n; await S.play(GM,pick(D().copy.ot,n)); const rest=T(G.day,s.ot.t1)-now(G); if(rest>0) GM.advance(rest);
      const pay=S.wage(G.day)*3*(S.natHoliday(G.day)?2:1); if(GM.money) GM.money(pay); else G.money=(G.money|0)+pay; if(GM.toast) GM.toast('加班的薪水 +'+pay+' 元',2800);
      if(typeof CLS!=='undefined'&&CLS.slotFillSpan) CLS.slotFillSpan(G,s.ot.t0,s.ot.t1); }
    finally { GM.sceneEnd(); S.running=false; } if(GM.autosave) GM.autosave(); return true; };

  // ---------- 兩點半 Café 外場、舊路書房的一班（AA_431 第 2 節，企劃線 f00b9e9f1；小事件 AA_289 3-1、3-2）----------
  /* 開始（2026-12-17 以後第一個週六的書店班：老闆「那個女生這學期沒來排班。」；第 1 件小事件 at:'start'）→ 三段工作：每段 熟練 0～4 新手／5 以上熟練 一句旁白 → 小選擇 → 那一句
     → 她在班上的一句（Café 打烊之後＝芷若、書店整理書架之後＝沛珊，輪流）→ 小事件（at:'end'）→ 書店「（你借了一本書回去。）」→ 薪水 784（toast）。
     小事件：第一班演第一件，之後每上兩班演下一件（j.xev＝{done:[id], at:第幾班}）；那一件要的人不在＝等下一個她在的班（沛珊 2026-12-16 以後不會再來：藍色的書跳過）。
     誰在班上：芷若＝Café 兩個班都在，2027-06-04～2028-02（她最後一個班到英國回來，AA_369、AA_431 2-1）、2028-09 以後不在；沛珊＝書店週六的班，到 2026-12-16。
     沒寫的照沒有：上週沒去那一句、放假的私訊、出國回來那一段、離開的時候（辭職照 AA_289「有空回來看看」）。國定假日不加倍（AA_431：四小時 784 元）。
     AA_519 3-2（企劃線 d75cd0228）：Café 補上第一班（D().first.cafe，第一班開始）、沒去（x.cafe.miss，下一班開始）、放假（D().brk.cafe.dm：放假第一天 12:00 一則私訊，這個假照舊先停）、
     出國回來（D().back.cafe；「先不了。」＝離職那一句）、離職（D().quitLines.cafe）；打工第 4 班以後打烊時一次的拉花（src/sup519_3d.js，S.SHIFT_EV，CAFE_LATTE_TRY）*/
  S.withOn=function(G,k,d){ const X=D().x&&D().x[k]; if(!X||!X.with) return false;
    if(X.with==='zr'){ const a=DK('2027-06-04'), b=DK('2028-02-29'), c=DK('2028-09-01'); if(a!=null&&d>=a&&d<=b) return false; if(c!=null&&d>=c) return false; return true; }
    if(X.with==='ps'){ const e=DK('2026-12-16'); return wdOf(d)===6&&(e==null||d<=e); } return false; };
  /* 小事件要的條件：zr／ps＝她在班上（S.withOn）；night＝夜班（過了午夜的班）；tyEve＝颱風假的前一天 */
  S.needOk=(G,k,d,need)=>{ if(!need) return true; if(need==='night') return S.hrs(k,d)[1]>24; if(need==='tyEve') return !!(CALENDAR.typhoon&&CALENDAR.typhoon(d+1)); return S.withOn(G,k,d); };
  S.xEvent=function(G,k,j,n,d){ const X=D().x[k], E=j.xev||(j.xev={done:[],at:0}); if(!Array.isArray(E.done)) E.done=[];
    if(E.done.length&&n-(E.at|0)<2) return null;   /* 每上兩班一件 */
    const e1=DK('2026-12-16'); for(const e of X.ev){ if(E.done.includes(e.id)) continue;
      if(e.need==='ps'&&e1!=null&&d>e1){ E.done.push(e.id); continue; }   /* 沛珊不會再來：跳過 */
      if(!S.needOk(G,k,d,e.need)) continue; return e; }
    return null; };
  /* 2026-11-12 第五輪（BB：越好吃上班時祐廷背著書包站在用餐區中間、不在櫃台後）：新店那幾間（S.ap3：山嵐、南洋、花序、越好吃、大口漢堡）上班期間——
     ①身上帶的東西先拿下來（CHAR.carryOff：後背包；打羽球藏包的同一個做法）②人站到櫃台後、店員旁邊（S.workSpot）。下班（S.workOff）照原樣還原、站回原本的位置。
     站哪裡不另外寫座標：店裡的店員（E.npcs 的 clerk；沒有就 SHOPLIFE.clerkSpot 的配置）旁邊 0.9 m（沿著櫃台，先右後左）、和店員同一個方向：
       沒有別人站著的那一邊；店員那一格本來就站得上去（E.canStand）的店，旁邊那一格也要站得上去——兩邊都不行＝不動（只藏包）。找不到店員＝不動。
     **沒有圍裙模型**：現成的圍裙（PROPS apron）只掛在芷若（char.heroine_02）身上，祐廷的模型（char.yuting）沒有＝這裡不做圍裙（不用方塊拼）。
     存檔：什麼都不記（狀態掛在 E.player.jobWork，不進存檔）。班中途讀檔＝舊的那一班凍住走不到 finally：S.tick 每一次先看（S.workHeal）——沒有班在跑、玩家身上還掛著＝把包還原（位置照讀檔的，不搬）。*/
  /* 2026-11-12 BB FAIL（SHIFT_SHOTS_72fc／_18a3）：南洋戲院「店員旁邊 0.9 m」剛好在爆米花機、紙桶後面，跟隨鏡頭只看得到頭頂（或卡進護牆板）。
     這一間改用指定站位（S.WORK_FIX；座標 LAWWW2-C 11-12 照 nanyang_interior.py、nanyang_layout.js 給）：on＝飲料櫃北邊的空檯面後面、沿著櫃台看向店員那一頭；
     櫃台後面在導航上整條是擋住的（店員也站在裡面）＝直接放、不看 E.canStand。off＝下班站回中間走道、面向櫃台（原位背後是紅龍柱，鏡頭會被擋）；站不住就照原本的位置。*/
  /* 2026-11-12 BB 再判 FAIL（BB_255 6fab23bca7）：站位對了，但跟隨鏡頭從高處往下拍，上三分之一是櫃台頂、祐廷背對只露頭頂 → 上班期間人面向客人（yaw +x）、鏡頭釘在客人那側和頭同高（cam：LAWWW2-C 11-12 用 nanyang_lobby.glb 全部三角形做射線檢查，鏡頭到頭／胸／腰／左右肩都沒被擋；A 正面 2.8 m）。
     劇情一段演完（endCinematic 拉回跟隨鏡頭）以後 S.tick 再釘回去（S.workCam）；下班（workOff）放開。*/
  S.WORK_FIX={cinema:{on:{x:-4.0,z:0.8,yaw:Math.PI/2,lv:0},off:{x:0,z:-1.5,yaw:-Math.PI/2,lv:0},cam:{pos:[-1.2,1.6,0.8],look:[-4.0,1.45,0.8]}}};
  S.workCam=function(GM){ const E=GM&&GM.E, P=E&&E.player, W=P&&P.jobWork, FX=W&&S.WORK_FIX[W.k], C=FX&&FX.cam; if(!C||!E.cinematic||typeof THREE==='undefined'||!THREE.Vector3) return false;
    if(E.cam&&E.cam.mode==='cinematic') return false;   /* 劇情鏡頭正在用（或已經釘著）＝不搶 */
    try{ E.cinematic(new THREE.Vector3(C.pos[0],C.pos[1],C.pos[2]),new THREE.Vector3(C.look[0],C.look[1],C.look[2])); W.cam=true; return true; }catch(e){ console.warn('JOBS.workCam',e); return false; } };
  S.workSpot=function(GM,k){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G) return null; const FX=S.WORK_FIX[k]; if(FX&&FX.on&&G.zone===shop(k).zone) return Object.assign({},FX.on); let c=null; const cl=(E.npcs||[]).find(n=>n&&n.clerk&&n.obj&&n.obj.visible!==false);
    if(cl) c={x:cl.obj.position.x,z:cl.obj.position.z,yaw:cl.obj.rotation.y||0,lv:cl.lv|0}; else if(typeof SHOPLIFE!=='undefined'&&SHOPLIFE.clerkSpot){ try{ c=SHOPLIFE.clerkSpot(G.zone,E); }catch(e){ c=null; } }
    if(!c) return null; const rx=Math.cos(c.yaw), rz=-Math.sin(c.yaw), can=(x,z)=>!E.canStand||E.canStand(x,z,0.32,c.lv|0), solid=can(c.x,c.z);
    for(const s of [0.9,-0.9]){ const x=+(c.x+rx*s).toFixed(2), z=+(c.z+rz*s).toFixed(2);
      if((E.npcs||[]).some(n=>n&&n.obj&&(n.lv|0)===(c.lv|0)&&Math.hypot(n.obj.position.x-x,n.obj.position.z-z)<0.6)) continue; if(solid&&!can(x,z)) continue; return {x,z,yaw:c.yaw,lv:c.lv|0}; }
    return null; };
  S.workOn=function(GM,k){ const E=GM&&GM.E, G=GM&&GM.G, P=E&&E.player; if(!P||!P.obj||!G||!S.ap3(k)||G.zone!==shop(k).zone||P.jobWork) return false;
    const W=P.jobWork={k,carry:null,from:null};
    if(typeof CHAR!=='undefined'&&CHAR.carryOff){ try{ W.carry=CHAR.carryOff(P.obj); }catch(e){ console.warn('JOBS.workOn',e); } }
    let sp=null; try{ sp=S.workSpot(GM,k); }catch(e){ sp=null; }
    if(sp&&E.placeAt){ W.from={x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0}; E.placeAt(P,sp.x,sp.z,sp.lv|0); P.obj.rotation.y=sp.yaw; }
    S.workCam(GM);
    return true; };
  S.workOff=function(GM,stay){ const E=GM&&GM.E, P=E&&E.player, W=P&&P.jobWork; if(!W) return false; P.jobWork=null;
    if(W.cam&&E.endCinematic&&E.cam&&E.cam.mode==='cinematic'){ try{ E.endCinematic(); }catch(e){ console.warn('JOBS.workOff cam',e); } }
    if(W.carry){ try{ W.carry(P.obj); }catch(e){ console.warn('JOBS.workOff',e); } }
    if(!stay&&W.from&&E.placeAt&&P.obj){ const FX=S.WORK_FIX[W.k], o=FX&&FX.off&&(!E.canStand||E.canStand(FX.off.x,FX.off.z,0.32,FX.off.lv|0))?FX.off:W.from; E.placeAt(P,o.x,o.z,o.lv|0); P.obj.rotation.y=o.yaw; }
    return true; };
  S.workHeal=function(GM){ const P=GM&&GM.E&&GM.E.player; if(S.running||!P||!P.jobWork) return false; return S.workOff(GM,true); };
  S.runShiftX=async function(GM,k){ const G=GM.G, j=fix(S.job(G,k)); if(!j||S.running) return false; const s=shop(k), X=D().x[k], d=G.day, n=(j.shifts|0)+1, ctx={day:d,n}, H0=S.hrs(k,d), wth=S.withOn(G,k,d);
    S.running=true; GM.sceneBegin();
    try{
      const P=GM.E&&GM.E.player; if(P&&P.seat&&GM.standUp) GM.standUp(P);
      if(G.hour<H0[0]){ if(GM.fade) await GM.fade(true); GM.advance(H0[0]-G.hour); if(GM.fade) await GM.fade(false); }
      try{ S.workOn(GM,k); }catch(e){ console.warn('JOBS.workOn',e); }   /* 新店：藏書包、站到櫃台後（下面 finally 還原）*/
      const end=T(d,H0[1]), seg=Math.max(0,(end-now(G))/3);
      if(k==='books'){ const e1=DK('2026-12-16'); if(wdOf(d)===6&&wth) j.psSeen=d; else if(wdOf(d)===6&&e1!=null&&d>e1&&j.psSeen!=null&&!j.psGone){ j.psGone=d; await say(GM,X.gone[0],X.gone[1]); } }
      if(n===1&&!j.re&&D().first&&D().first[k]) await S.play(GM,D().first[k]);   /* 第一班（Café：AA_519 3-2；再應徵不重演）*/
      if(j.missPend&&X.miss){ await S.play(GM,X.miss[(j.missN|0)%X.miss.length]); j.missN=(j.missN|0)+1; }   /* 上次沒去（Café：AA_519 3-2）*/
      const ev=S.xEvent(G,k,j,n,d), E=j.xev; const playEv=async()=>{ E.done.push(ev.id); E.at=n; await S.play(GM,ev.lines); };
      if(ev&&ev.at==='start') await playEv();
      for(let i=0;i<X.segs.length;i++){ const sg=X.segs[i]; await say(GM,null,(j.skill|0)>=5?sg.exp:sg.nov);
        const c=await GM.choose(sg.ch.map(o=>({t:o[0]}))), o=sg.ch[c]||sg.ch[0]; const alt=o[2]&&k==='cafe'&&E.done.includes('cafe3'); await say(GM,null,alt?o[2]:o[1]);   /* Café 掃地：「忘記的筆」演過以後換一句 */
        if(wth&&i===X.withAfter){ await say(GM,null,X.withLines[(j.withN|0)%X.withLines.length]); j.withN=(j.withN|0)+1; }
        try{ await S.segAfter(GM,k,j,i,d); }catch(e){ console.warn('JOBS.segAfter',e); }   /* 山嵐：宋知寧（AA_828 第 4 節第 7 點）；越好吃：同學來吃飯（AA_829 第 5 節第 7 點）*/
        if(i<X.segs.length-1) GM.advance(seg); }
      if(ev&&ev.at!=='start') await playEv();
      if(ev&&ev.id==='cvs2') G.flags.JOB_CVS=d;   /* 颱風天店長留了兩碗：大四颱風夜（T4a）的回聲讀它 */
      if(X.night&&H0[1]>24){ await say(GM,null,X.night[(j.nightN|0)%X.night.length]); j.nightN=(j.nightN|0)+1; }   /* 夜班的最後一句（輪流）*/
      if(X.end){ const wk=X.end.all?'all':String(wdOf(d)), EL=X.end[wk], nk=(X.endKey&&X.endKey[wk])||wk; if(EL&&EL.length){ const N=j.endN&&typeof j.endN==='object'?j.endN:(j.endN={}); await say(GM,null,EL[(N[nk]|0)%EL.length]); N[nk]=(N[nk]|0)+1; } }   /* 最後一句旁白（輪流；AA_828：山嵐晚班／假日班各自輪、南洋一組）*/
      await S.play(GM,extra(G,k,n,'close'));
      for(const f of S.SHIFT_EV){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.SHIFT_EV',e); } }
      if(X.borrow) await say(GM,null,X.borrow);
      const rest=end-now(G); if(rest>0) GM.advance(rest);
      { const pw=s.payWd&&s.payWd[wdOf(d)], pay=pw||s.pay; if(GM.money) GM.money(pay); else G.money=(G.money|0)+pay; if(GM.toast) GM.toast(pw?s.short+' 薪水 '+pw+' 元':s.payToast,2800); }   /* payWd：大口漢堡大夜班 880（AA_829）*/
      if(typeof CLS!=='undefined'&&CLS.slotFillSpan) CLS.slotFillSpan(G,H0[0],H0[1]);
      j.shifts=n; j.skill=Math.min(10,(j.skill|0)+1); j.worked.push(d); if(j.worked.length>80) j.worked.splice(0,j.worked.length-80); j.missPend=false; j.missedRun=0; j.lastShift=d;
      if(n===1&&typeof INV!=='undefined'&&INV.addContact){ try{ INV.addContact(G,s.bossId); }catch(e){} }
      for(const f of S.AFTER_SHIFT){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.AFTER_SHIFT',e); } }
      if(S.lastShift(G,k,d)) await S.leave(GM,k,'grad');
    } finally { try{ S.workOff(GM); }catch(e){ console.warn('JOBS.workOff',e); } GM.sceneEnd(); S.running=false; }
    if(H0[1]>24) await S.nightSleep(GM,d);
    if(Array.isArray(s.closeOut)&&s.closeOut.includes(wdOf(d))) await S.closeOut(GM,k);
    if(GM.autosave) GM.autosave(); return true; };
  /* 一班裡某一段工作後面多的（字都在資料）：
     山嵐書店（AA_828 第 4 節第 7 點）：祐廷第一次在山嵐上班、宋知寧也在的那一班，「上架」那一段後面（一次；G.jobs._meta.znCo＝那一天，辭職再應徵也不再說）——有 SHOP_ZN_MET＝三句（中間一句旁白）、沒有＝一句。
       她在不在（S.znCoOn）：AA_828 第 5 節第 1 點——她在山嵐的班＝週日 14:00～18:00（資料 co.wd／t0／t1，和祐廷的假日班同一班）、到大二下學期結束；週三晚班她不在（原本暫定「祐廷的班她都在」）。
       只有兩版（AA_828 第 6 節第 3 點）：有 SHOP_ZN_MET、她已經傳過第 5 則訊息（「換到另一家」；SHOPENC 記在 G.flags.SHOP_ZN_BK.sent＝[第幾則，0 起]）＝第 4 節那一版（co.met）；
         完全沒認識過她＝co.new（她從大一下起就在山嵐）。認識過但第 5 則還沒發＝她還不在山嵐，不演（第 5 節第 2 點的那一版作廢，資料也不再匯）。
       名字：認識過＝照遊戲原本顯示的（SHOPENC 的「知寧」）；不認識＝照稿「宋知寧」。
     越好吃小館（AA_829 第 2 節＋第 5 節第 7 點）：「點餐」那一段後面，這時候排進店裡吃飯的同學（SHOPMEET.helloDue：朋友以上、今天這一餐還沒說過）照平常的 meal_hello 一句＋旁白 mealExtra；每人一次（j.mealHi）*/
  const TERM_ZH={'大一上':'Y1S1','大一下':'Y1S2','大二上':'Y2S1','大二下':'Y2S2','大三上':'Y3S1','大三下':'Y3S2','大四上':'Y4S1','大四下':'Y4S2'};
  S.znCo=()=>{ const A=S.ap3('shanlan'); return (A&&A.co)||null; };
  /* AA_828 第 6 節（企劃線 1d6055568c；取代第 5 節第 1、2 點）：她在不在山嵐看玩家認不認識她——
       認識過（有 SHOP_ZN_MET）＝第 5 則訊息發了以後才在（S.znMsgSent：發的隔天起，和 SHOPENC.znMoved 同一把尺）；第 5 則以前她不在山嵐＝那一句不演（原本「還沒傳第 5 則」的那一版作廢）；
       完全沒認識過＝（第 6 節原本寫「她從大一下起就在」——第 8 節第 1 點作廢）她不出現在山嵐、不演。只到大二下、只在祐廷的週日班（co.wd／t0／t1）。*/
  S.znCoOn=function(G,d){ const C=S.znCo(); if(!C||!hasCal()||!CALENDAR.termDays) return false; const r=CALENDAR.termDays(TERM_ZH[C.until]); if(!r||d>r.to||!S.termAt(G,d)) return false;
    if(C.wd!=null){ if(wdOf(d)!==C.wd) return false; const h=S.hrs('shanlan',d); if(!S.overlap(h[0],h[1],C.t0,C.t1)) return false; }   /* 她的那一班（週日 14:00～18:00）*/
    /* AA_828 第 8 節第 1、2 點（企劃線 1e539b8eb9；第 6 節第 3 點後半作廢）：沒認識過她的玩家＝她不出現在山嵐（初次見面只在頁間書屋），「新來的？」那一版不演、資料也不再匯（co.new／co.newFrom）。
       只剩一版：認識過（SHOP_ZN_MET）、她傳過第 5 則。SHOP_ZN_MET 這裡不動。*/
    if(!(G.flags&&G.flags[C.flag])) return false; return C.msgN==null||S.znMsgSent(G,d); };
  S.znMsgSent=function(G,d){ const C=S.znCo(), R=G&&G.flags&&G.flags.SHOP_ZN_BK; if(!C||C.msgN==null||!R||typeof R!=='object') return false; if(!((Array.isArray(R.sent)&&R.sent.includes(C.msgN-1))||R.moved!=null)) return false; return d==null||R.moved==null||d>R.moved; };   /* 她傳過第 5 則了沒（舊存檔沒有 SHOP_ZN_BK＝還沒）；d＝那一天她搬過去了沒（發的隔天起）*/
  S.znCoDue=function(G,d){ return !!S.znCo()&&S.rec(G)._meta.znCo==null&&S.znCoOn(G,d); };
  S.znCoLines=function(G){ const C=S.znCo(); if(!C) return []; const met=!!(G.flags&&G.flags[C.flag]); let nm=C.who;
    if(met&&typeof SHOPENC!=='undefined'&&SHOPENC.npOf&&SHOPENC.ZN){ try{ const P=SHOPENC.npOf(G,SHOPENC.ZN); if(P&&P.name) nm=P.name; }catch(e){} }
    if(!met) return [];   /* 沒認識過＝不演（AA_828 第 8 節第 2 點）*/
    return (C.met||[]).map(x=>[x[0]==null?null:nm,x[1]]); };
  S.mealIds=()=>typeof SHOP_MEET_LINES!=='undefined'&&SHOP_MEET_LINES&&SHOP_MEET_LINES.mealHello?Object.keys(SHOP_MEET_LINES.mealHello):[];
  /* 越好吃上班時同學來吃飯（AA_828 第 5 節第 6 點；字在 SHOP_JOBS_AA828.yueMeal）：不用 meal_hello（那是祐廷當客人的句子）。
     誰算「來吃飯」：SHOPLIFE 這時候排進這間店吃飯（SHOPMEET.mealSlot）、朋友以上（SHOPMEET.friendUp）、不是分手後的前任（SHOPLIFE.exBlock）——和原本一樣的那一群人，加上有自己句子的兩個人（阿哲、可昕）。
     照人各記一次（G.jobs.yue.mealHi）：第一次＝旁白 → 對方一句（阿哲、可昕各自的；其他人共用）→ 祐廷 → 「（你幫他／她點了餐。）」（照對方性別）；同一個人之後再來＝只有最後那一句旁白。
     那一餐算打過招呼（G.flags.SHOP_MEAL_HI 記那一天那一餐、不動輪到第幾句）：下班以後不會再對同一個人說一次 meal_hello。 */
  S.yueMeal=()=>(typeof SHOP_JOBS_AA828!=='undefined'&&SHOP_JOBS_AA828&&SHOP_JOBS_AA828.yueMeal)||null;
  S.YUE_ALIAS={heroine_05:'學姊'};   /* 稿寫「學姊」（AA_828 第 7 節第 3 點）＝溫學姊；其他女主角用通用句 */
  S.yueOwn=function(c){ const Y=S.yueMeal(); if(!Y||!Y.own||!c) return null; for(const n of [c.name,c.nickname,c.phoneName,S.YUE_ALIAS[c.id]]) if(n&&Object.prototype.hasOwnProperty.call(Y.own,n)) return Y.own[n]; return null; };   /* 稿寫的是大家叫的名字（阿哲、可昕；可昕的 name 是全名）*/
  S.yueMealIds=function(){ const Y=S.yueMeal(), out=S.mealIds().slice(); if(Y&&Y.own&&typeof CHARACTERS!=='undefined') for(const id in CHARACTERS){ if(S.yueOwn(CHARACTERS[id])&&!out.includes(id)) out.push(id); } return out; };
  /* 2026-11-12：上班那一整段的時間停在開始那一刻（越好吃 17:30），吃飯的名單晚餐 17:45 才開始——只問「現在」的話真的名單下永遠沒有人來。
     所以這一刻沒有的時候，往後看這一班（S.hrs，每 15 分鐘）：這一班裡排進這間店吃飯的＝算來吃飯。只有玩家在這間店、今天這裡有班的時候才往後看。*/
  /* 學姊（AA_828 第 9 節第 1 點；資料 yueMeal.sis.met）：照她自己的規則來的，只要認識她（規則在 SHOPLIFE.yueDatePlan 看），不用到朋友 */
  S.yueMetOnly=id=>{ try{ const r=typeof SHOPLIFE!=='undefined'&&SHOPLIFE.yueRule?SHOPLIFE.yueRule(id):null; return !!(r&&r.met); }catch(e){ return false; } };
  S.mealAt=function(G,id){ if(typeof SHOPMEET==='undefined'||!SHOPMEET.mealSlot||!SHOPMEET.friendUp) return null; try{ if(typeof SHOPLIFE!=='undefined'&&SHOPLIFE.exBlock&&SHOPLIFE.exBlock(G,id)) return null; if(!SHOPMEET.friendUp(id)&&!S.yueMetOnly(id)) return null;
      let slot=SHOPMEET.mealSlot(G,id); if(slot) return {slot,hour:G.hour}; const k=S.ZONE_KEY[G.zone]; if(!k||!S.active(G,k)||!hasCal()||!S.due(G,k,G.day)) return null; const h=S.hrs(k,G.day);
      for(let t=Math.max(h[0],G.hour)+0.25;t<h[1]-1e-6;t+=0.25){ slot=SHOPMEET.mealSlot(Object.assign({},G,{hour:t}),id); if(slot) return {slot,hour:t}; } return null; }catch(e){ return null; } };
  S.mealHere=function(G,id){ const m=S.mealAt(G,id); return m?m.slot:null; };
  /* 2026-11-12 第五輪（BB：可昕來吃飯只有旁白、店裡 3D 沒有她）：那一段演以前，來吃飯的那個人要真的在店裡。
     做法＝照作息那一套（不另外生假人）：把他「這一班裡來吃飯的那一筆作息」（S.mealAt 找到的那個時刻的 STORY.schedEnt）交給 SHOPLIFE.bringIn——
     那一筆從現在起就算數（SHOPLIFE.schedHold，STORY.SCHED_X），再照平常「待在店裡補人」（STORY.refreshSchedule）＝他從門口走進來、走到位子坐下吃，時段結束照平常起身走出去。
     回傳：true＝他在店裡了（或這個環境沒有 3D 可以查＝照舊演）；false＝3D 在、可是帶不進來（沒有空位…）＝這一次不演他的那一段、也不記（下一次再說），不演「只有台詞」。*/
  S.mealBring=function(GM,id,at){ const G=GM.G, E=GM.E; if(!E||!Array.isArray(E.npcs)||typeof SHOPLIFE==='undefined'||!SHOPLIFE.bringIn||typeof STORY==='undefined'||!STORY.schedEnt||!STORY.refreshSchedule) return true;
    const here=()=>E.npcs.some(n=>n&&n.charId===id)||!!(GM.npc&&GM.npc[id]); if(here()) return true;
    let ent=null; try{ ent=STORY.schedEnt(CHARACTERS[id],Object.assign({},G,{hour:at.hour})); }catch(e){ ent=null; } if(!ent||ent.zone!==G.zone) return false;
    try{ SHOPLIFE.bringIn(GM,id,ent); }catch(e){ console.warn('JOBS.mealBring',e); } return here(); };
  /* 2026-11-12（BB 在使用者電腦判 FAIL：YUE_SIS、SHIFT7_425 四次都一樣——學姊說「你在這裡。幾點下班？」那一刻她在 (−1.1, 2.05)、走路姿勢、obj.visible=false，講完、下班以後才看得到她坐著；朋友版、交往版都一樣）。
     原因（兩件，都不是學姊那條規則自己的問題，可昕、同學走的是同一段）：
       ① S.mealBring 帶進來的人從門口「走」到位子，那一句出來的時候還在半路；
       ② 祐廷站在櫃台後，跟隨鏡頭對著櫃台——門口、靠窗那幾桌在鏡頭後面，引擎每一格照鏡頭的視錐算 obj.visible（engine3d.js updateNPC），在鏡頭外＝false。
     改法（只改這一段的走位，台詞一個字不動）：
       S.mealWalkIn：進門以後先走到祐廷面前（櫃台外面：點餐那一點，或祐廷正前方站得住的地方），不是直接去位子；位子照舊留著（n.seatTarget）。
       S.mealStand ：她那一句以前——還沒走到就等她走到（最多 2.5 秒），再不然直接站好；面向祐廷、n.hidden=false。人就在祐廷面前＝在鏡頭裡。
                     萬一還是不在鏡頭裡（已經坐在遠處的位子、鏡頭被玩家轉到別的方向）＝切過肩鏡頭（GM.cine 'ots'）對著她。
       S.mealSeat  ：「（你幫她點了餐。）」以後才走去位子坐下（原本那一段 populateSchedule 的 onArrive），切過的鏡頭收回來。
     已經坐在店裡的人（照作息早就到了）＝不搬，只確認看得到。沒有 3D（Node 測試的替身沒有 moveTo 的路）＝直接站好／坐好，不等。*/
  S.mealNpc=function(GM,id){ const E=GM&&GM.E; if(!E) return null; return (E.npcs||[]).find(n=>n&&n.charId===id)||(GM.npc&&GM.npc[id])||null; };
  S.MEAL_WAIT=2.5;
  S.mealSpot=function(GM,n){ const E=GM&&GM.E, P=E&&E.player; if(!P||!P.obj) return null; const o=P.obj.position, yaw=P.obj.rotation.y||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=P.lv|0;
    const ok=(x,z)=>{ const d=Math.hypot(x-o.x,z-o.z); if(d<1||d>3.6) return false; if(E.canStand&&!E.canStand(x,z,0.32,lv)) return false;
      return !(E.npcs||[]).some(m=>m&&m!==n&&m.obj&&!m.hidden&&(m.lv|0)===lv&&Math.hypot(m.obj.position.x-x,m.obj.position.z-z)<0.6); };
    const C=[], L=E.zone&&E.zone.shopLayout, op=L&&Array.isArray(L.points)?L.points.find(p=>p&&p.id==='order'):null; if(op&&typeof op.x==='number') C.push([op.x,op.z]);
    for(const d of [1.7,2,2.3,2.6,1.4]) C.push([+(o.x+fx*d).toFixed(2),+(o.z+fz*d).toFixed(2)]);
    for(const c of C) if(ok(c[0],c[1])) return {x:c[0],z:c[1],lv,yaw:Math.atan2(o.x-c[0],o.z-c[1])}; return null; };
  S.mealInView=function(GM,n){ try{ const E=GM&&GM.E, cam=E&&E.camera; if(!cam||!n||!n.obj||typeof THREE==='undefined'||typeof THREE.Vector3!=='function') return null;
      const p=n.obj.position, v=new THREE.Vector3(p.x,(p.y||0)+1.2,p.z); if(!v||typeof v.project!=='function') return null; v.project(cam);
      if(!(typeof v.x==='number'&&isFinite(v.x)&&isFinite(v.y)&&isFinite(v.z))) return null; return v.z>-1&&v.z<1&&Math.abs(v.x)<0.92&&Math.abs(v.y)<0.92; }catch(e){ return null; } };
  S.mealWalkIn=function(GM,id){ const E=GM&&GM.E, n=S.mealNpc(GM,id); if(!E||!n||!n.obj) return null; const st={n,sp:null,sit:null,seat:null,arrived:false,cine:false}; n.hidden=false;
    if(n.seat||!n.seatTarget||typeof n.onArrive!=='function') return st;   /* 已經坐著（或不是走去坐的）＝不搬 */
    const sit=n.onArrive, sp=S.mealSpot(GM,n); if(!sp){ n.path=null; n.onArrive=null; try{ sit(n); }catch(e){ console.warn('JOBS.mealWalkIn',e); } return st; }   /* 祐廷面前站不了人＝直接坐好 */
    st.sp=sp; st.sit=sit; st.seat=n.seatTarget; n.onArrive=null; const arrive=()=>{ st.arrived=true; n.faceYaw=sp.yaw; };
    if(!(E.moveTo&&E.moveTo(n,sp.x,sp.z,arrive,sp.lv))){ n.path=null; if(E.placeAt) E.placeAt(n,sp.x,sp.z,sp.lv); else { n.obj.position.x=sp.x; n.obj.position.z=sp.z; } n.obj.rotation.y=sp.yaw; arrive(); }
    return st; };
  S.mealStand=async function(GM,st){ const E=GM&&GM.E, n=st&&st.n; if(!E||!n||!n.obj) return false;
    if(st.sp&&!st.arrived){ const wait=typeof setTimeout==='function'&&n.path?S.MEAL_WAIT:0; for(let t=0;t<wait&&!st.arrived&&n.path;t+=0.1) await new Promise(r=>setTimeout(r,100));
      if(!st.arrived){ n.path=null; n.onArrive=null; if(E.placeAt) E.placeAt(n,st.sp.x,st.sp.z,st.sp.lv); else { n.obj.position.x=st.sp.x; n.obj.position.z=st.sp.z; } st.arrived=true; } }
    if(st.sp){ n.obj.rotation.y=st.sp.yaw; n.faceYaw=st.sp.yaw; n.speed=0; n.pose=n.idlePose='idle'; }
    n.hidden=false; n.obj.visible=true;   /* n.hidden：引擎每一格照它算顯示（只設 obj.visible 會被蓋回去）*/
    if(E.player&&E.player.obj&&!n.seat){ n.lookAt=E.player.obj.position; n._sayLook=true; }   /* 看著祐廷；整段結束（game3d.js sceneEnd）放開 */
    if(S.mealInView(GM,n)===false&&GM.cine&&E.player&&E.player.obj){ try{ GM.cine('ots',E.player.obj,n.obj,{snap:true}); st.cine=true; }catch(e){ console.warn('JOBS.mealStand',e); } }
    return true; };
  S.mealSeat=function(GM,st){ const E=GM&&GM.E, n=st&&st.n; if(!E||!n) return false; if(st.cine&&E.endCinematic){ try{ E.endCinematic(); }catch(e){} st.cine=false; }
    if(!st.sp||!st.sit) return false; const sit=st.sit, seat=st.seat; st.sit=null; if(!(E.npcs||[]).includes(n)||n.seat) return false;   /* 這中間被別的系統帶走、已經坐下＝不管 */
    n.faceYaw=null; let ap=null; try{ ap=seat?((GM.seatApproach&&GM.seatApproach(seat))||[seat.x,seat.z]):null; }catch(e){ ap=seat?[seat.x,seat.z]:null; }
    if(!(ap&&E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,seat.lv|0))){ try{ sit(n); }catch(e){ console.warn('JOBS.mealSeat',e); } }
    return true; };
  /* AA_828 第 10 節第 1 點（企劃線 33e9522155；2026-11-12 第七輪）：「學姊『你在這裡。幾點下班？』每學期說一次（每學期她第一次來那天）；同學期第二次來（交往中）只有進店坐下＋旁白。」
     只改照自己的規則來的人（S.yueMetOnly：資料 yueMeal.sis 那一條——學姊）：那一組說過沒有照學期記（G.jobs.yue.mealHiT＝{人物: 上一次說的那個學期}）；這個學期還沒說過＝整組演一次，說過＝只有最後那一句旁白。
     其他人（阿哲、可昕、共用句的同學）照舊每人一生一次（mealHi）。原本（第六輪）：學姊也是一生一次。
     存檔：mealHiT 舊存檔沒有＝{}。舊存檔 mealHi 裡已經有她（第六輪存的，不知道是哪一個學期說的）＝當作讀進來那時候的學期說過（S.yueHiT；寒暑假＝前一個學期）——S.phone 每次都看，所以讀檔以後第一次跑手機規則就定下來，不會拖到她下一次來才算。
     再應徵：mealHiT 和 mealHi 一樣帶到新的一份（S.apply）。*/
  S.termNear=function(G,d){ if(!hasCal()) return null; let t=S.termAt(G,d); for(let x=d-1;!t&&x>d-200;x--) t=S.termAt(G,x); return t?t.id:null; };   /* 這一天的學期；寒暑假＝前一個學期（同 S.year）*/
  S.yueHiT=function(G,j){ if(!j||typeof j!=='object') return {}; if(!j.mealHiT||typeof j.mealHiT!=='object'||Array.isArray(j.mealHiT)) j.mealHiT={}; const MT=j.mealHiT;
    if(Array.isArray(j.mealHi)) for(const id of j.mealHi){ if(MT[id]!=null||!S.yueMetOnly(id)) continue; const t=S.termNear(G,G.day); if(t) MT[id]=t; }   /* 舊存檔：說過、沒記學期 */
    return MT; };
  S.yueMealRun=async function(GM,j){ const G=GM.G, Y=S.yueMeal(); if(!Y) return false; const M=Array.isArray(j.mealHi)?j.mealHi:(j.mealHi=[]), MT=S.yueHiT(G,j), T=S.termNear(G,G.day); let any=false;
    for(const id of S.yueMealIds()){ const slot=S.mealHere(G,id); if(!slot) continue; const at=S.mealAt(G,id)||{slot,hour:G.hour}; const c=typeof CHARACTERS!=='undefined'?CHARACTERS[id]:null, done=Y.done[c&&c.gender==='f'?'f':'m'];
      if(!S.mealBring(GM,id,at)) continue;   /* 人帶不進店裡＝不演只有台詞的那一段 */
      const perTerm=!!T&&S.yueMetOnly(id), first=perTerm?MT[id]!==T:!M.includes(id);   /* 學姊：這個學期還沒說過；其他人：一生一次 */
      let st=null; try{ st=S.mealWalkIn(GM,id); }catch(e){ console.warn('JOBS.mealWalkIn',e); }   /* 進門先走到祐廷面前（上面那一段）*/
      const stand=async()=>{ if(!st) return; try{ await S.mealStand(GM,st); }catch(e){ console.warn('JOBS.mealStand',e); } };
      try{
        if(first){ await say(GM,null,Y.narr); await stand(); await say(GM,id,S.yueOwn(c)||Y.ask); await say(GM,'player',Y.me); await say(GM,null,done); if(!M.includes(id)) M.push(id); if(perTerm) MT[id]=T; }
        else { await stand(); await say(GM,null,done); }
      } finally { if(st){ try{ S.mealSeat(GM,st); }catch(e){ console.warn('JOBS.mealSeat',e); } } }
      { const F=G.flags||(G.flags={}), r=F.SHOP_MEAL_HI&&typeof F.SHOP_MEAL_HI==='object'?F.SHOP_MEAL_HI:(F.SHOP_MEAL_HI={}), v=r[id]; r[id]=[G.day,slot,Array.isArray(v)?(v[2]|0):0]; }
      if(typeof SHOPLIFE!=='undefined'&&SHOPLIFE.yueDateMark){ try{ SHOPLIFE.yueDateMark(G,id); }catch(e){} }   /* 可昕（交往中才來，一學期最多兩次；AA_828 第 7 節第 2 點）、學姊（每學期一次、交往中兩次；第 9 節第 1 點）：這一次算來過 */
      any=true; }
    return any; };
  S.segAfter=async function(GM,k,j,i,d){ const G=GM.G, A=S.ap3(k), sg=A&&A.segs&&A.segs[i]; if(!sg) return false; let any=false;
    if(k==='shanlan'&&A.co&&sg.name===A.co.seg&&S.znCoDue(G,d)){ S.rec(G)._meta.znCo=d; await S.play(GM,S.znCoLines(G)); any=true; }
    if(A.mealAfter&&sg.name===A.mealAfter&&S.yueMeal()&&G.zone===shop(k).zone){ if(await S.yueMealRun(GM,j)) any=true; }
    else if(A.mealExtra&&A.mealAfter&&sg.name===A.mealAfter&&typeof SHOPMEET!=='undefined'&&SHOPMEET.helloDue&&SHOPMEET.mealHello&&G.zone===shop(k).zone){ const M=Array.isArray(j.mealHi)?j.mealHi:(j.mealHi=[]);
      for(const id of S.mealIds()){ if(M.includes(id)||!SHOPMEET.helloDue(G,id)) continue; if(await SHOPMEET.mealHello(GM,whoOf(G,id),id)){ await say(GM,null,A.mealExtra); M.push(id); any=true; } } }
    return any; };
  /* 做到打烊的班（AA_828 第 3 節：山嵐書店晚班 22:00）：下班那一句演完，人直接站在店門口外面（位置照 XSCLOSE.outOf＝打烊走出去的那一點）；人不在店裡、店還開著就不動 */
  S.closeOut=async function(GM,k){ const G=GM.G, z=shop(k).zone; if(!z||G.zone!==z||typeof XSCLOSE==='undefined'||!XSCLOSE.outOf||!GM.enter) return false;
    if(XSCLOSE.placeOpen&&XSCLOSE.placeOpen(z,G)) return false; const o=XSCLOSE.outOf(GM,z); await GM.enter(o.to,o.spawn); return true; };
  /* 夜班（週五 22:00～02:00）：下班回宿舍睡到隔天 10:00（AA_433 第 1 節「隔天 10:00 以前祐廷在宿舍睡覺，不排別的」；隔天早上的班 S.excused 自動請假）*/
  /* AA_829 第 5 節第 4 點：回祐廷現在住的地方（看當時住哪）睡到 10:00，旁白不寫地點；便利商店夜班比照。住哪照 STORY.forceHome 那一套分：
     住家裡（放假回家住、畢業後退宿住家裡：HOME.breakMode／baseMode／pgHome）＝回家（HOME.go，家裡的那一套接手，不另外睡）；公館的套房（HOME.suite，沒有 3D）＝直接睡，STORY.sleepNow 醒來就在套房（公館）；其他＝宿舍 */
  S.liveAt=function(G){ const H=typeof HOME!=='undefined'?HOME:null; try{ if(H&&((H.breakMode&&H.breakMode(G))||(H.pgHome&&H.pgHome(G)))) return 'home'; if(H&&H.suite&&H.suite(G)) return 'suite'; }catch(e){} return 'dorm'; };
  S.nightSleep=async function(GM,d){ const G=GM.G; G.flags.JOB_NIGHT=d; if(typeof STORY==='undefined'||!STORY.sleepNow) return false; if(GM.E&&GM.E.player&&GM.E.player.busy) return false;
    G.flags.companion=null; const at=S.liveAt(G);
    if(at==='home'&&HOME.go){ if(!(HOME.at&&HOME.at(G))) await HOME.go(GM); return true; }
    if(at==='dorm'&&G.zone!=='dorm'&&GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await STORY.sleepNow(GM,10); return true; };
  /* 客人：Café 點過第 3 次、書店來過第 2 次以後，結帳時老闆開口（AA_431；次數照 EAT 的「店員認得你」那個計數：src/eat3d.js 的 G.eat.n）*/
  S.EAT_KEY={'兩點半 Café':'cafe','舊路書房':'books','公館的便利商店':'cvs'};
  S.zrHere=G=>{ try{ return typeof STORY!=='undefined'&&!!STORY.ladWorking&&STORY.ladWorking(G,'heroine_02')&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_02'))>=SOCIAL.STAGES.indexOf('FAMILIAR'); }catch(e){ return false; } };
  S.visitX=async function(GM,k,key){ const G=GM.G, M=S.rec(G)._meta, A=D().ask[k]; if(!A||S.job(G,k)||M.asked[k]||!S.eligible(G,k)) return false;
    let n=typeof EAT!=='undefined'&&EAT.rec?(EAT.rec(G).n[key]|0):0;
    if(A.late){ const h=G.hour; if(!(h>=22||h<5)) return false; const Lt=M.late||(M.late={}); Lt[k]=(Lt[k]|0)+1; n=Lt[k]; }   /* 便利商店：22:00 以後買東西的次數（AA_433 第 1 節）*/
    if(n<A.n) return false; M.asked[k]=G.day; let c=1;
    GM.sceneBegin(); try{ await say(GM,A.line[0],A.line[1]); if(A.zr&&S.zrHere(G)) await say(GM,A.zr[0],A.zr[1]); c=await GM.choose([{t:A.yes},{t:A.no}]);
      if(c===0) await S.apply(GM,k); else await say(GM,A.noLine[0],A.noLine[1]); } finally { GM.sceneEnd(); }
    return true; };
  if(typeof EAT!=='undefined'&&typeof EAT.ordered==='function'&&!EAT._jobs){ const o0=EAT.ordered; EAT.ordered=async function(GM,key,item){ const r=await o0.apply(this,arguments);
      try{ const k=S.EAT_KEY[key]; if(k&&GM&&GM.G&&law(GM.G)) await S.visitX(GM,k,key); }catch(e){ console.warn('JOBS.visitX',e); } return r; }; EAT._jobs=true; }

  // ---------- 補習班、事務所（AA_433 第 2、3 節）：霖澤館一樓公布欄的徵才單 → 打電話／寄履歷 → 面試 → 選班表；上班是 2D 的出遊 ----------
  /* 公布欄（霖澤館 1F，lv 0，入口玻璃門內側的東牆邊（7.2, 1.2）：樓層簡介的「看」在 (−0.6, −5.85)，不要疊在一起；按鈕的字「看系上的公布欄」是系統字）：補習班大二上第 1 週起、事務所大三上第 1 週起貼；已經在做、面試排好的不列。
     補習班：「打電話問。」→ 班主任（電話）→ 下週一 18:00 面試（出遊，2D）→「改一張考卷給我看。……好，下週開始。」→ 選班表（從下週一起）。
     事務所：「寄履歷。」→ 一週後 14:00 助理私訊 →「可以。」＝下週二、「那天有課，週四可以嗎？」＝下週四 14:00 面談（2D）→ 律師三選一都錄取 →「好。下週開始。」→ 選班表。
     面試沒去（出遊 missed）＝可以重新從公布欄來。存檔：G.jobs._meta.ap2＝{cram|office:{st:'call'|'cv'|'iv', day, iv}}；事務所私訊的回覆 G.flags.JOB_OFFICE_DM（'tue'|'thu'）*/
  S.AP2=['cram','office'];
  S.board2=G=>{ if(!G||!law(G)) return []; const A=S.rec(G)._meta.ap2||{}; return S.AP2.filter(k=>S.eligible(G,k)&&!S.active(G,k)&&(!A[k]||(A[k].st==='done'&&S.canReapply(G,k)))); };   /* 辭職隔一個學期：徵才單又貼出來（AA_828 第 5 節第 5 點）*/
  /* 公布欄上的兩張徵才單（LAWWW2-B 10-24 fc86f7507：linze_interior.glb 的 L0_WALL_notice_job_cram／_office）：公布欄上有這一家（S.board2）才看得到。
     節點名稱有 WALL_＝會跟著東面淡出（engine3d.js 的 hideFaded 每一格改 Object3D.visible），所以開關用材質的 visible（attachFormal 已經每一片各自複製材質）*/
  S.POSTER={cram:'L0_WALL_notice_job_cram',office:'L0_WALL_notice_job_office'};
  S.posterSync=function(GM){ const E=GM&&GM.E, G=GM&&GM.G, z=E&&E.zone; if(!G||G.zone!=='linze'||!z||!z.formal) return;
    if(!z._jobPosters){ const m={}; const root=z.group||(E.scene); root.traverse(o=>{ for(const k in S.POSTER) if(o.name===S.POSTER[k]) (m[k]=m[k]||[]).push(o); }); z._jobPosters=m; }
    const b=S.board2(G); for(const k in S.POSTER) for(const n of (z._jobPosters[k]||[])) n.traverse(o=>{ if(o.isMesh&&o.material&&!Array.isArray(o.material)) o.material.visible=b.includes(k); }); };
  S.addBoard=function(GM){ const E=GM&&GM.E; if(!E||!Array.isArray(E.interactables)) return null; const Gf=()=>GM.G;
    const it={x:7.2,z:1.2,lv:0,radius:1.0,label:'看系上的公布欄',jobBoard:true,get hidden(){ return !S.board2(Gf()).length; }}; E.interactables.push(it); return it; };
  const monNext=d=>d-(wdOf(d)-1)+7;   /* 下週一 */
  S.board=async function(GM){ const G=GM.G, L=S.board2(G); if(!L.length) return false; const M=S.rec(G)._meta, A=M.ap2||(M.ap2={}); GM.sceneBegin();
    try{ const i=await GM.choose(L.map(k=>({t:D().notice[k]})).concat([{t:'不看了'}])); const k=L[i]; if(!k) return false; const P=D().apply2[k];
      const c=await GM.choose([{t:P.opt},{t:'（不用了）'}]); if(c!==0) return false;
      if(k==='cram'){ await say(GM,P.call[0],P.call[1]); const iv=monNext(G.day); A.cram={st:'iv',day:G.day,iv}; S.planIv(G,'cram',iv,18); }
      else { A.office={st:'cv',day:G.day}; if(typeof PHONE!=='undefined'){ const tag='job_office_dm_'+G.day, th='p:'+shop('office').bossId;
          PHONE.at(G,G.day+7,14,[{th,from:shop('office').bossId,text:P.dm,ask:{id:tag,opts:[{t:P.dmOpts[0],set:{JOB_OFFICE_DM:'tue'}},{t:P.dmOpts[1],set:{JOB_OFFICE_DM:'thu'}}]}}],tag); } }
      return true; } finally { GM.sceneEnd(); } };
  S.planIv=function(G,k,day,h){ if(typeof OUT==='undefined') return; const s=shop(k), P=D().apply2[k]; OUT.plan(G,{id:'job_iv_'+k+'_'+day,ev:'ev_job2d_'+k+'_iv',day,h,late:0.75,place:s.place,title:P.ivTitle,travel:s.travel,travelH:0.25,silent:false}); };
  S.ap2Phone=function(G){ const M=S.rec(G)._meta, A=M.ap2||{}, F=G.flags;
    if(A.office&&A.office.st==='cv'&&F.JOB_OFFICE_DM){ const dm=A.office.day+7, iv=monNext(dm)+(F.JOB_OFFICE_DM==='thu'?3:1); F.JOB_OFFICE_DM=null; A.office={st:'iv',day:A.office.day,iv}; S.planIv(G,'office',iv,14); }
    if(typeof OUT!=='undefined') for(const k of S.AP2){ const a=A[k]; if(!a||a.st!=='iv') continue; const q=OUT.get(G,'job_iv_'+k+'_'+a.iv); if(q&&(q.state==='missed'||q.state==='cancelled')) delete A[k]; } };   /* 面試沒去：可以重新來 */
  /* 面試（2D 事件裡）*/
  S.interview=async function(GM,k){ const G=GM.G, P=D().apply2[k], A=S.rec(G)._meta.ap2||{}; const a=A[k]; if(!a) return false;
    if(k==='cram') await say(GM,P.iv[0],P.iv[1]);
    else { await say(GM,P.q[0],P.q[1]); const c=await GM.choose(P.qOpts.map(t=>({t}))); G.flags.JOB_OFFICE_WHY=(c|0)+1; await say(GM,P.ok[0],P.ok[1]); }
    a.st='done'; const ok=await S.apply(GM,k,{since:monNext(G.day)}); if(!ok) delete A[k]; return ok; };   /* 選班表沒選（名額滿了、先不要）＝可以再從公布欄來 */
  /* 2D 的事件（出遊）：上班、面試。時間：上班照班表（S.runShiftX 走到下班），事件的 hours＝回程 15 分鐘；面試 30 分鐘 */
  S.EV2D=function(){ if(typeof STORY_EVENTS==='undefined') return; for(const k of S.AP2){ const sc=D().x[k].scene;
      if(!STORY_EVENTS.some(e=>e.id==='ev_job2d_'+k)) STORY_EVENTS.push({id:'ev_job2d_'+k,title:shop(k).title,participants:[],location:'any',trigger:'outing',once:false,background:'dark',hours:0.25,dialogue:[{scene:sc},{call:async(G,GM)=>{ await S.runShiftX(GM,k); }}]});
      if(!STORY_EVENTS.some(e=>e.id==='ev_job2d_'+k+'_iv')) STORY_EVENTS.push({id:'ev_job2d_'+k+'_iv',title:D().apply2[k].ivTitle,participants:[],location:'any',trigger:'outing',once:false,background:'dark',hours:0.5,dialogue:[{scene:sc},{call:async(G,GM)=>{ await S.interview(GM,k); }}]}); } };
  S.EV2D();

  // ---------- 南洋戲院（AA_828 第 2、3 節）：員工票、週五晚場和桌遊夜、Alison 改說的那一句 ----------
  /* 員工票：打工滿 3 班（還在做）以後，買票的選單多「拿員工票（站著看）」——不用錢、一週一次（週一～週日；記在 G.jobs.cinema.tkWk＝那一週的週一）、不能帶人（旁邊有同行的人就沒有這一項）。
     拿了＝今天有票（G.flags.NY_TICKET）＋記 G.flags.NY_TICKET_STAFF＝那一天：1 廳照平常那一場演（一個人看＝兩部都記看過，MOVIES.soloPlay），看完多一句（S.staffTicketLine）。
     約會看電影照買票（NYS.paidTicket：員工票不算；src/invites3d.js）*/
  S.staffTicket=()=>{ const A=S.ap3('cinema'); return (A&&A.ticket)||null; };
  /* 再應徵以後不用重新滿 3 班（AA_828 第 7 節第 5 點「做過的保留」；資料 ticket.keep）：以前那幾份做過的班（j.shiftsPrev，S.apply 再應徵時記）一起算。
     這一條以前就再應徵過的存檔沒有 shiftsPrev：以前拿過員工票（tkN，再應徵沒有帶過來）也查不到——只能從再應徵以後的班數算起（沒有可以補的）*/
  S.shiftsBefore=j=>(j&&j.shiftsPrev)|0;
  S.staffTicketOk=function(G){ const T=S.staffTicket(), j=S.job(G,'cinema'); if(!T||!j||j.gone||!law(G)||!hasCal()||(j.shifts|0)+(T.keep?S.shiftsBefore(j):0)<T.after) return false;
    if(G.flags&&G.flags.companion) return false; return j.tkWk!==weekOf(G.day); };
  S.staffTicketTake=function(G){ const j=S.job(G,'cinema'); if(!j) return false; G.flags=G.flags||{}; j.tkWk=weekOf(G.day); j.tkN=(j.tkN|0)+1; G.flags.NY_TICKET=G.day|0; G.flags.NY_TICKET_STAFF=G.day|0; return true; };
  S.staffTicketToday=G=>!!G&&!!G.flags&&G.flags.NY_TICKET_STAFF===(G.day|0)&&G.flags.NY_TICKET===(G.day|0);
  S.staffTicketLine=G=>{ const T=S.staffTicket(); return T&&S.staffTicketToday(G)?T.line:null; };
  S.staffTicketTakeLine=()=>{ const T=S.staffTicket(); return T&&Array.isArray(T.take)&&T.take[1]?{who:{name:T.take[0]},text:T.take[1]}:null; };   /* AA_828 第 4 節第 6 點：拿員工票那一下售票員多一句（買票照舊沒有台詞）*/
  /* 桌遊夜（隔週五 20:00～23:30，AA_623）那一晚有打工的班＝沒空（AA_828 第 3 節＋第 4 節第 2 點「所有打工的班都一樣」）：那一天排了班（S.due：沒有被考試、颱風請掉）、班的時間和桌遊夜重疊——
     南洋戲院週五晚場 18:00～22:00、便利商店週五夜班 22:00～02:00 都算。原本只看戲院、班蓋到 20:00 */
  S.bgnBusy=function(G,d){ if(!G||!hasCal()||!law(G)) return false; const B=typeof BGN!=='undefined'?BGN:null, h0=B&&B.H0!=null?B.H0:20, h1=B&&B.H1!=null?B.H1:23.5;
    for(const k of S.KEYS){ if(!S.active(G,k)||!S.due(G,k,d)) continue; const h=S.hrs(k,d); if(S.overlap(h[0],h[1],h0,h1)) return true; } return false; };
  /* AA_615 的同學（Alison）上班遇到自己也在這裡打工的祐廷：改說一句（一次；G.jobs.cinema.aliCo＝那一天）*/
  S.alisonCo=G=>{ const A=S.ap3('cinema'), j=S.job(G,'cinema'); return A&&A.alison&&j&&!j.gone&&j.aliCo==null?A.alison:null; };
  S.alisonCoDone=G=>{ const j=S.job(G,'cinema'); if(j) j.aliCo=G.day|0; };

  // ---------- 沒去：每一天算過去（不靠出門提醒；睡過去的班也算）----------
  S.track=function(G){ if(!hasCal()) return; for(const k of S.KEYS){ const j=S.job(G,k); if(!j||j.gone) continue; fix(j);
      let d=j.chk==null?(j.since|0)-1:j.chk; const last=G.hour>=S.hrs(k,G.day)[0]+0.75?G.day:G.day-1; let guard=0;
      while(d<last&&guard++<800){ d++; const w=weekOf(d), W=j.wk[w]||(j.wk[w]={s:0,w:0});
        if(S.due(G,k,d)){ W.s++; if(j.worked.includes(d)) W.w++; else j.missPend=true; }
        if(wdOf(d)===7){ if(W.s>0){ if(W.w>0) j.missedRun=0; else j.missedRun=(j.missedRun|0)+1; } delete j.wk[w]; if((j.missedRun|0)>=3){ j.ask3=true; j.missedRun=0; } } }
      j.chk=d; } };

  // ---------- 出門提醒 ----------
  S.GOTO_X={cafe:{x:0,z:4.4,yaw:Math.PI},books:{x:0,z:4.0,yaw:Math.PI},cvs:{x:0,z:3.6,yaw:Math.PI}};
  { const SI=typeof Z3!=='undefined'&&Z3.SHOP_IN?Z3.SHOP_IN:null; for(const [k,z] of [['books','bookstore'],['cvs','cvs']]) if(SI&&SI[z]&&SI[z].gg) S.GOTO_X[k]={x:SI[z].x,z:SI[z].z,yaw:SI[z].yaw}; }   /* 公館兩間新室內（GG-SHOPS-REDO-1104）：進門站的地方照 zones3d.js SHOP_IN */   /* Café、書店：門口進去的地方（zones3d.js 的出口內側）*/
  S.GOTO_LAY={shanlan:()=>typeof SHANLAN_LAYOUT!=='undefined'?SHANLAN_LAYOUT.enterAt:null,cinema:()=>typeof NANYANG_LAYOUT!=='undefined'&&NANYANG_LAYOUT.lobby?NANYANG_LAYOUT.lobby.enterAt:null,
    flower:()=>typeof FLOWER_NOTES_LAYOUT!=='undefined'?FLOWER_NOTES_LAYOUT.spawn:null,yue:()=>typeof TZ_SHOPS_LAYOUT!=='undefined'&&TZ_SHOPS_LAYOUT.yuehaochi?TZ_SHOPS_LAYOUT.yuehaochi.spawn:null,dakou:()=>typeof DK3!=='undefined'&&DK3.ENTER?DK3.ENTER:{x:0,z:6.4,yaw:Math.PI}};   /* 花序、越好吃小館、大口漢堡（AA_829）：進門站的地方照各自的配置 */   /* 山嵐書店、南洋戲院：進門站的地方照配置的 enterAt（配置比這個檔晚載入，用的時候才讀）*/
  S.goto=k=>{ const s=shop(k); if(S.GOTO_LAY[k]){ const a=S.GOTO_LAY[k]()||{x:0,z:5,yaw:Math.PI}; return {zone:s.zone,x:a.x,z:a.z,yaw:a.yaw==null?Math.PI:a.yaw}; } if(S.GOTO_X[k]) return Object.assign({zone:s.zone},S.GOTO_X[k]); const L=typeof WZ_SHOPS_LAYOUT!=='undefined'?WZ_SHOPS_LAYOUT[k==='copy'?'print':(k==='tea'?'teahouse':'brunch')]:null, sp=L&&L.spawn?L.spawn:{x:0,z:3.5,yaw:Math.PI}; return {zone:s.zone,x:sp.x,z:k==='copy'?Math.min(sp.z,3.3):sp.z,yaw:sp.yaw||Math.PI}; };
  S.plan=function(G){ if(typeof OUT==='undefined'||!hasCal()||!law(G)) return; const d=G.day;
    for(const k of S.KEYS){ if(!S.active(G,k)) continue; const s=shop(k), id='job_'+k+'_'+d, H0=S.hrs(k,d), title=s.hours?s.title+'（'+hm(H0[0])+'～'+hm(H0[1])+'）':s.title;
      if(!OUT.get(G,id)&&S.due(G,k,d)&&!S.worked(G,k,d)&&G.hour<=H0[0]+0.5) OUT.plan(G,Object.assign({id,day:d,h:H0[0],late:0.75,place:s.place,title,travel:s.travel,travelH:0.25,no:'這週請假',job:k,silent:true},s.d2?{ev:'ev_job2d_'+k}:{goto:S.goto(k)})); }   /* 補習班、事務所：2D 的出遊（S.EV2D）*/
    if(S.otDay(G,d)){ const s=shop('copy'), id='job_copyot_'+d; if(!OUT.get(G,id)&&G.hour<s.ot.t0-0.25) OUT.plan(G,{id,day:d,h:s.ot.t0,late:0.5,place:s.place,title:s.ot.title,travel:s.travel,travelH:0.25,no:'不加班',goto:S.goto('copy'),job:'copy',jobOt:true,silent:true}); } };
  /* 撞時段的另一個：週六早午餐＋法服值班（兩個出門提醒）、週四影印＋公法讀書會（讀書會沒有出門提醒，列在影印那一個）*/
  S.plgOn=(G,d)=>{ const F=G.flags||{}; if(!(F.PUBLIC_LAW_GROUP||F.CLUB_public_law_group)||typeof ACTIVITIES==='undefined') return false; const a=ACTIVITIES.list.find(x=>x.id==='public_law_group'); return !!a&&!!ACTIVITIES.on&&ACTIVITIES.on(a,d,G)&&!(ACTIVITIES.attended&&ACTIVITIES.attended(G,'public_law_group',d)); };
  S.partner=function(G,q){ if(!q||q.state!=='planned'||typeof OUT==='undefined') return null; const L=OUT.rec(G);
    if((q.job==='brunch'||q.job==='books')&&!q.jobOt){ const f=L.find(x=>x.id==='fafu_'+q.day&&x.state==='planned'); return f?{q:f}:null; }   /* 書店週六 10:00～14:00 也撞法服值班（9:00～12:00）*/
    if(/^fafu_/.test(q.id||'')){ const b=L.find(x=>(x.id==='job_brunch_'+q.day||x.id==='job_books_'+q.day)&&x.state==='planned'); return b?{q:b}:null; }
    if((q.job==='copy'||q.job==='cafe')&&!q.jobOt&&wdOf(q.day)===4&&S.plgOn(G,q.day)) return {plg:true};   /* Café 週四 18:00～22:00 也撞公法讀書會（AA_431 2-1）*/
    return null; };
  const tt=t=>typeof OUT!=='undefined'&&OUT.tt?OUT.tt(t):t;
  S.prompt2=async function(GM,q,pr){ const G=GM.G, a=q.job?q:pr.q, b=q.job?pr.q:q; let k=3;
    const hint=x=>[x.place,hm(x.h),x.travel].filter(Boolean).join('　');
    GM.sceneBegin(); try{ const O=[{t:'出發：'+tt(a.title),hint:hint(a)}, pr.plg?{t:'去公法讀書會',hint:'法律系館B 研討室 A　20:00'}:{t:'出發：'+tt(b.title),hint:hint(b)}, {t:'晚一點（20 分鐘後再提醒）'}, {t:'這週都請假'}]; k=await GM.choose(O); } finally { GM.sceneEnd(); }
    const miss=x=>{ if(!x||x.state!=='planned') return; x.state='missed'; if(OUT.onMissed) OUT.onMissed(GM,x); };
    if(k===2){ const t0=now(G)+1/3; a.ask=t0; if(b) b.ask=t0; return 'later'; }
    if(k===0){ if(b) miss(b); await OUT.go(GM,a); return 'go'; }
    if(k===1){ miss(a); if(b) await OUT.go(GM,b); else if(GM.toast) GM.toast('今晚去公法讀書會（20:00，法律系館B 研討室 A）',3600); return pr.plg?'no':'go'; }
    miss(a); if(b) miss(b); return 'no'; };

  // ---------- 寒暑假、三週沒去、出國回來（手機）----------
  S.phone=function(G){ if(typeof PHONE==='undefined'||!hasCal()||!law(G)) return; const F=G.flags; S.track(G); S.tutorPhone(G); S.ap2Phone(G);
    { const jy=S.job(G,'yue'); if(jy&&Array.isArray(jy.mealHi)) S.yueHiT(G,jy); }   /* 舊存檔：學姊那一組說過、沒記學期的補上（AA_828 第 10 節第 1 點）*/
    for(const k of S.KEYS){ const j=S.job(G,k); if(!j||j.gone) continue; fix(j); const s=shop(k), id=s.bossId, th='p:'+id;
      /* 私訊的回覆（PHONE.answer 只能設旗標）：搬進 G.jobs */
      { const v=F['WZJOB_BRK_'+k]; if(typeof v==='string'){ const [bk,a]=v.split(':'); if(bk&&a) j.brk[bk]=a; F['WZJOB_BRK_'+k]=null; } }
      if(F['WZJOB_QUIT_'+k]!=null){ F['WZJOB_QUIT_'+k]=null; j.gone='quit'; j.quit=G.day; j.pendLeave=true; }   /* 私訊說不做了：下次走進店裡演離開的時候 */
      if(G.day>S.endDay(G)){ j.gone='grad'; j.quit=G.day; continue; }   /* 最後一班沒來：畢業以後就結束（沒有離開的那一段）*/
      if(S.away(G,G.day)) j.away=true; else if(j.away){ j.away=false; j.back=!!D().back[k]; }   /* Café、書店沒有「回來做」那一段：照原本的班表 */   /* 出國回來：等第一次走進店裡（第 14 條）*/
      const contact=(j.shifts|0)>=1;
      const b=S.breakAt(G,G.day); if(b&&!j.back&&!S.away(G,G.day)&&j.brk[b.key]==null){
        if(!contact) j.brk[b.key]='stop';   /* 還沒有聯絡方式：這個假先停 */
        else if(!D().brk[k]) j.brk[b.key]='stop';   /* 書店、便利商店：放假的私訊沒有寫（AA_431）＝這個假先停 */
        else if(D().brk[k].dm){ j.brk[b.key]='stop'; const tag='jobbrk_'+k+'_'+b.key; if(!PHONE.sent(G,tag)) PHONE.at(G,b.from,12,[{th,from:id,text:D().brk[k].dm}],tag); }   /* Café（AA_519 3-2）：老闆只有一句、不問來不來＝這個假照舊先停 */
        else { const tag='jobbrk_'+k+'_'+b.key, B=D().brk[k]; if(!PHONE.sent(G,tag)) PHONE.at(G,b.from,12,[{th,from:id,text:B.ask,ask:{id:tag,until:T(b.to+1,0),opts:[{t:'來。',say:[{th,from:id,text:B.go}],set:{['WZJOB_BRK_'+k]:b.key+':go'}},{t:'放假先停。',say:[{th,from:id,text:B.stop}],set:{['WZJOB_BRK_'+k]:b.key+':stop'}}]}}],tag); } }
      if(j.ask3&&contact&&!j.back){ j.ask3=false; const tag='job3_'+k+'_'+G.day; PHONE.at(G,G.day,Math.max(G.hour,12),[{th,from:id,text:D().stillAsk,ask:{id:tag,opts:[{t:'（繼續做）',post:false},{t:'（辭職）',post:false,say:[{th,from:id,text:S.quitLine(k)}],set:{['WZJOB_QUIT_'+k]:G.day}}]}}],tag); } } };

  // ---------- 走進店裡：出國回來那一句、當面問「還要做嗎？」、私訊辭職的離開 ----------
  S.ENTER=[];   /* 事件包：{due(G,k)→true＝要演, run:async (GM,k)}（例：線一 1-5 結果、線二 2-6 搬走以後蘇姨那一句）*/
  S.enterDue=function(G,k){ const j=S.job(G,k); if(j&&j.pendLeave) return true; if(j&&!j.gone&&(j.back||(j.ask3&&(j.shifts|0)===0))) return true;
    for(const e of S.ENTER){ try{ if(e.due(G,k)) return true; }catch(err){ console.warn('JOBS.ENTER',err); } } return false; };
  S.onEnter=async function(GM,k){ const G=GM.G, j=S.job(G,k);
    if(j&&j.pendLeave){ await S.leave(GM,k,j.gone||'quit'); return true; }
    if(j&&!j.gone&&j.back&&!D().back[k]){ j.back=false; return false; }   /* Café、書店：出國回來沒有寫那一段＝照原本的班表 */
    if(j&&!j.gone&&j.back){ const B=D().back[k]; let c=1; GM.sceneBegin(); try{ await S.play(GM,B.lines); c=await GM.choose([{t:'「回來做。」'},{t:'「先不了。」'}]); } finally { GM.sceneEnd(); }
      if(c===0){ j.back=false; GM.sceneBegin(); try{ if(!await S.apply(GM,k)){ j.day=[]; } } finally { GM.sceneEnd(); } }
      else { j.back=false; GM.sceneBegin(); try{ await S.leave(GM,k,'quit',B.no||[shop(k).boss,S.quitLine(k)]); } finally { GM.sceneEnd(); } }   /* Café 沒有另外的一句：離職那一句（AA_519 3-2）*/
      return true; }
    if(j&&!j.gone&&j.ask3&&(j.shifts|0)===0){ j.ask3=false; let c=0; GM.sceneBegin(); try{ await say(GM,shop(k).boss,D().stillAsk); c=await GM.choose([{t:'（繼續做）'},{t:'（辭職）'}]); if(c===1) await S.quit(GM,k); } finally { GM.sceneEnd(); } return true; }
    for(const e of S.ENTER){ try{ if(e.due(G,k)){ await e.run(GM,k); return true; } }catch(err){ console.warn('JOBS.ENTER',err); } }
    return false; };

  // ---------- 客人：來過幾次、老闆開口 ----------
  S.AFTER_VISIT=[];   /* 客人買完：async fn(GM,k,o)→true＝演了（o.bought、o.kind）（線二：週六下午來喝茶的玩家也遇得到呂老師）*/
  S.visit=async function(GM,k,kind,bought){ const G=GM.G, M=S.rec(G)._meta; if(bought){ M.n[k]=(M.n[k]|0)+1; if(k==='tea'&&wdOf(G.day)===6&&G.hour>=12&&G.hour<18) M.n.teaSat=(M.n.teaSat|0)+1; }
    for(const f of S.AFTER_VISIT){ try{ if(await f(GM,k,{bought,kind})) return true; }catch(e){ console.warn('JOBS.AFTER_VISIT',e); } }
    if(bought&&!S.job(G,k)&&!M.asked[k]&&S.eligible(G)&&(M.n[k]|0)>=D().ask[k].n){ M.asked[k]=G.day; const A=D().ask[k]; let c=1;
      GM.sceneBegin(); try{ await say(GM,A.line[0],A.line[1]); c=await GM.choose([{t:'（應徵）'},{t:'（先不要）'}]); if(c===0) await S.apply(GM,k); } finally { GM.sceneEnd(); } return true; }
    return false; };

  // ---------- 店裡的按鈕（STORY.populate）----------
  S.deskLabel=(G,k)=>{ if(!S.job(G,k)||S.canReapply(G,k)){ if(k==='copy') return '跟阿德說想打工'; if(S.ap3(k)) return S.ap3(k).look||'看告示'; return '應徵：'+D().notice[k]; } if(S.shiftNow(G,k)) return '開始上班'; return '找'+shop(k).boss; };
  /* 辭職以後可以再應徵（AA_828 第 4 節第 5 點：隔一個學期＝下一個學期開學起告示又看得到；山嵐書店、南洋戲院 reapply）：辭職（不是畢業）那一天以後的第一個開學日起。
     第 5 節第 5 點：全部打工比照（資料 reapply.all：花序、越好吃、大口漢堡、早午餐、阿德影印、茶屋、Café、舊路書房、便利商店；補習班、事務所從公布欄 S.board2 再來一次）。家教是 JOB_TUTOR 另外一套（沒有告示）：AA_828 第 7 節第 4 點「舊打工全部比照（六間店＋補習班、事務所、家教）」＝S.tutorReAsk */
  S.reapplyDay=function(G,j){ if(!j||j.gone!=='quit'||j.quit==null||!hasCal()||!CALENDAR.termDays) return null; let best=null; for(const id of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2','Y5S1']){ const r=CALENDAR.termDays(id); if(r&&r.from>j.quit&&(best==null||r.from<best)) best=r.from; } return best; };
  S.canReapply=function(G,k){ if(!G||!S.KEYS.includes(k)) return false; if(!(S.RA()&&S.RA().all)&&!(S.ap3(k)&&shop(k).reapply)) return false; const j=S.job(G,k); if(!j||j.pendLeave) return false; const d=S.reapplyDay(G,j); return d!=null&&G.day>=d&&S.eligible(G,k); };
  S.deskHidden=(G,k)=>{ if(!G||!law(G)) return true; const j=S.job(G,k); if(j&&S.canReapply(G,k)) return false; if(!j) return !S.eligible(G,k)||(k==='copy'&&!S.rec(G)._meta.asked.copy); return !!j.gone&&!j.pendLeave; };
  S.addDesk=function(GM,zoneId){ const k=S.ZONE_KEY[zoneId], E=GM&&GM.E; if(!k||!E||!Array.isArray(E.interactables)) return null; const s=shop(k), Gf=()=>GM.G;
    const SI=typeof Z3!=='undefined'&&Z3.SHOP_IN&&Z3.SHOP_IN[zoneId], dk=(SI&&SI.gg&&SI.job)||s.desk;   /* 頁間書屋、日和便利店的新室內（GG-SHOPS-REDO-1104）：告示的位置照 SHOP_IN.job */
    const it={x:dk.x,z:dk.z,lv:dk.lv|0,radius:dk.r||1.0,wzJob:k,get label(){ return S.deskLabel(Gf(),k); },get hidden(){ return S.deskHidden(Gf(),k); }}; E.interactables.push(it); return it; };
  S.ap3=k=>{ const W=D(); return (W&&W.apply3&&W.apply3[k])||null; };
  /* 山嵐書店、南洋戲院的應徵（AA_828）：告示的字 →「問店員。」／「再想想。」→ 店長（經理）開口 →（山嵐：來過 3 次以上／不到）→ 選班表；「再想想。」＝店長一句，下次再來 */
  S.apply3=async function(GM,k){ const G=GM.G, A=S.ap3(k), M=S.rec(G)._meta; if(!A) return false;
    await say(GM,null,A.notice); const c=await GM.choose([{t:A.askOpt},{t:A.laterOpt}]);
    if(c!==0){ await say(GM,A.boss,A.later); return false; }
    await say(GM,A.boss,A.ask); if(A.visitN!=null) await say(GM,A.boss,(M.n[k]|0)>=A.visitN?A.many:A.few);
    return S.apply(GM,k,shop(k).nextWeek?{since:monNext(G.day)}:null); };
  S.desk=async function(GM,k){ const G=GM.G, j=S.job(G,k);
    if((!j||S.canReapply(G,k))&&S.ap3(k)){ GM.sceneBegin(); try{ await S.apply3(GM,k); } finally { GM.sceneEnd(); } return true; }
    if(!j||S.canReapply(G,k)){ GM.sceneBegin(); try{ await S.apply(GM,k); } finally { GM.sceneEnd(); } return true; }   /* 舊的那幾間再應徵：照第一次應徵（直接選班表）*/
    if(j.pendLeave){ GM.sceneBegin(); try{ await S.leave(GM,k,j.gone||'quit'); } finally { GM.sceneEnd(); } return true; }
    if(j.gone) return true;
    if(S.shiftNow(G,k)) return S.runShift(GM,k);
    if(!fix(j).day.length){ GM.sceneBegin(); try{ await S.apply(GM,k); } finally { GM.sceneEnd(); } return true; }   /* 出國回來選了「回來做。」卻沒選班表 */
    let c=1; GM.sceneBegin(); try{ c=await GM.choose([{t:'（算了）'},{t:'（辭職）',hint:'班表：'+S.schedText(k,fix(j).day)}]); if(c===1) await S.quit(GM,k); }   /* 2026-11-11（BB CHOOSE_SCAN ②）：「（算了）」放在互動鍵那個高度（倒數第二個）——按互動鍵連點兩下不會變成辭職；原本「（辭職）」在前 */ finally { GM.sceneEnd(); }
    return true; };

  // ---------- 每一格（STORY.TICKS）----------
  let lastZone=null, planT=-1;
  S.busy=GM=>{ const E=GM.E; return S.running||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)||!!(E&&E.player&&E.player.busy)||(typeof EVENTS!=='undefined'&&!!EVENTS.running); };
  S.tick=function(GM){ const G=GM&&GM.G; try{ S.workHeal(GM); }catch(e){ console.warn('JOBS.workHeal',e); } if(S.running&&GM&&GM.E&&GM.E.player&&GM.E.player.jobWork&&!(typeof ADV!=='undefined'&&ADV.active)){ try{ S.workCam(GM); }catch(e){} } if(G&&G.zone==='linze'){ try{ S.posterSync(GM); }catch(e){ console.warn('JOBS.poster',e); } } if(!G||!law(G)||!hasCal()) return false;
    const t=Math.floor(now(G)*4); if(t!==planT){ planT=t; try{ S.track(G); S.plan(G); }catch(e){ console.warn('JOBS.plan',e); } }
    const k=S.ZONE_KEY[G.zone]; const entered=G.zone!==lastZone; lastZone=G.zone;
    if(entered&&k&&S.ap3(k)&&S.ap3(k).visitN!=null){ const N=S.rec(G)._meta.n; N[k]=(N[k]|0)+1; }   /* 來過山嵐書店幾次（AA_828：3 次以上店長換一句）*/
    if(!k||S.busy(GM)) return false;
    if((entered||S._enterPend)&&S.enterDue(G,k)){ S._enterPend=false; S.running=true; S.onEnter(GM,k).catch(e=>console.warn('JOBS.onEnter',e)).finally(()=>{ S.running=false; }); return true; }
    S._enterPend=false;
    if(S.shiftNow(G,k)){ S.runShift(GM,k).catch(e=>console.warn('JOBS.runShift',e)); return true; }   /* 走進店裡、班的時間到了就開班 */
    if(k==='copy'&&S.otNow(G)){ S.runOT(GM).catch(e=>console.warn('JOBS.runOT',e)); return true; }
    return false; };
  S.otNow=G=>{ if(typeof OUT==='undefined') return false; const q=OUT.get(G,'job_copyot_'+G.day); if(!q||q.state!=='done') return false; const j=S.job(G,'copy'), wk=S.otWeek(G,G.day); return !!j&&!!wk&&j.ot[wk]!=='done'&&G.hour>=20.5&&G.hour<22; };

  // ---------- 房間物件（AA_420 第 9 節；STORY.ROOM_EXTRA）----------
  /* 房間裡現在有哪幾件（key 照 WZ_JOBS_DATA.room）：文字（S.room）和 3D 模型（zones3d.js 的 dorm_wz_items.glb，節點 ITEM_wz_<key>）都照這一份 */
  S.roomKeys=function(G){ const F=(G&&G.flags)||{}, K=[]; if(F.WZ_ITEM_TIMER) K.push('timer'); if(F.WZ_ITEM_NOTEBOOK) K.push('notebook'); if(F.WZ_ITEM_TEA&&!F.WZ_TEA_GIVEN) K.push('tea');
    if(F.WZ_CARD) K.push('card'); if(F.WZ_YE_DONE) K.push('board'); if(F.WZ_POSTER_ITEM) K.push('poster'); return K; };
  S.room=function(G,L){ const R=D().room; for(const k of S.roomKeys(G)) L.push(R[k].slice()); };

  // ---------- 家教（AA_163 第 2 節，企劃線 a06d3f545；V2-B32）＋補一件（AA_289 3-3「考卷的背面」）----------
  /* 家教的事件還是 data/events.js 的 ev_tutor_lesson（第 1～3 堂的內容、TUTOR_N＝上過幾堂）；排課、規則、多的台詞在這裡（story3d.js 原本只排大一下的最小版：有 JOBS 就讓給這裡，JOBS.TUTOR_PLAN）。
     ①週二或週四（TUTOR_WD）19:00～21:00，學生家在溫州街；出門提醒「出發」／「這週請假」。
     ②答應的那一學期（從答應那天以後；11-03 起大一上第 6 週就可以接，原本大一下）、之後到大二下：寒暑假停；答應那一學期以後的每一學期（大一上答應的＝大一下也問）開學第一天 12:00 明軒私訊「家長問你這學期還來嗎」——「來」＝這學期照排、「不了」＝停（明軒回 AA_163 停的那一句）；
       期末考週停（AA_163 a06d3f545「第 16 週」，CALENDAR exam 'final'），前一週（第 15 週）那一堂結尾學生的媽媽一句；國定假日、颱風假不排；
       會考（2027-05-15、16；AA_163「2027 年 5 月中旬，照當年公告的會考日期」）前的那一堂是最後一堂（學生一句），5/16 21:00 學生的訊息，家教結束（TUTOR_DONE）。
     ③沒去（「這週請假」或過了時間）：不扣分、不改關係；下一堂開場一句（三句輪流；換學期就不說）；連續三週沒去＝明軒私訊「還要做」／「先停」（一段連續只問一次）。
     ④第 4 堂（TUTOR_N 3）「為什麼要念法律」：三選一＝TUTOR_WHY 1～3、筆記「我認識的人：家教的學生」。⑤每堂結束 +1,200 元（toast「家教費 1,200 元」）。
     ⑥第 6 堂以後第一次（TUTOR_N≥5）：AA_289 3-3 考卷背面的貓法官＋那天晚上滷味攤明軒一句（TUTOR_DRAW、TUTOR_DRAW_ANS）。
     沒做：AA_163「玩家隨時可以不做：手機傳訊息給明軒，選『家教我想先停』」——手機沒有讓玩家主動選這一句的地方（傳訊息的話題在 msg3d.js）；停只有三週沒去、開學問的那兩個時候。
     存檔（G.flags）：TUTOR_TERM_Y2S1／TUTOR_TERM_Y2S2（'go'｜'stop'）、TUTOR_MISS_RUN、TUTOR_MISS_N、TUTOR_MISS_PEND（沒去那一堂的學期）、TUTOR_ASK3（回覆）、TUTOR_ASK3_SENT、
       TUTOR_STOP（停的那一天）、TUTOR_DONE（會考後學生傳訊息那一天）、TUTOR_WHY；出遊 tutor_<天> 的 tutorSeen＝算過有沒有去。舊存檔沒有＝照大一下開始的狀態 */
  S.TUTOR_PLAN=true;
  S.TUTOR_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2'];   /* 11-03：加大一上（明軒大一上第 6 週起問）*/
  S.ASK_TERMS=['Y1S2','Y2S1','Y2S2'];   /* 開學第一天問「這學期還來嗎」的學期（答應的那一學期不問）*/
  const TU=()=>D()&&D().tutor;
  const dayKey=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const MX='classmate_mingxuan', mxMsg=t=>({th:'p:'+MX,from:MX,text:t});
  S.tutorKK=()=>TU()?dayKey(TU().kaokao):null;
  S.tutorStopped=G=>{ const F=(G&&G.flags)||{}; return F.TUTOR_STOP!=null||F.TUTOR_DONE!=null; };
  S.tutorEnded=G=>{ if(S.tutorStopped(G)) return true; const kk=S.tutorKK(); return kk!=null&&!!G&&G.day>=kk; };   /* 停了、會考以後（大三起一律沒有家教：home3d.js、r2y3b3d.js 讀 JOBS.at）*/
  /* 答應的那一學期：tutorFromDay 那天的學期（答應那天在寒假＝下一個學期）；舊存檔沒有 tutorFromDay＝大一下（原本只有大一下能接）*/
  S.tutorStartTerm=G=>{ const F=(G&&G.flags)||{}; if(!hasCal()) return null; if(F.tutorFromDay==null) return 'Y1S2'; for(let d=F.tutorFromDay;d<F.tutorFromDay+120;d++){ const t=CALENDAR.termOf(d); if(t) return t.id; } return null; };
  S.tutorTermOk=(G,tid)=>{ const F=G.flags||{}; if(!S.TUTOR_TERMS.includes(tid)) return false; const st=S.tutorStartTerm(G); return tid===st||(S.TUTOR_TERMS.indexOf(tid)>S.TUTOR_TERMS.indexOf(st)&&F['TUTOR_TERM_'+tid]==='go'); };   /* 答應的那一學期照排；之後的學期要回「來」*/
  S.tutorOn=(G,d)=>{ const F=(G&&G.flags)||{}; if(!F.JOB_TUTOR||S.tutorEnded(G)||!hasCal()) return false; if(d==null) d=G.day; const t=CALENDAR.termOf(d); if(!t||!S.tutorTermOk(G,t.id)) return false; const kk=S.tutorKK(); return kk==null||d<kk; };
  /* 這一天能不能上課：有在上的學期、不是期末考週、不是國定假日或颱風假、會考以前、答應那天以後 */
  S.tutorDayOk=(G,d)=>{ if(!S.tutorOn(G,d)) return false; const t=CALENDAR.termOf(d); if(t.exam==='final') return false; if(CALENDAR.holiday(d)||(CALENDAR.typhoon&&CALENDAR.typhoon(d))) return false; return !(G.flags.tutorFromDay!=null&&d<=G.flags.tutorFromDay); };   /* 答應那天以後（原本只看大一下；11-03 起大一上也可以接）*/
  S.tutorPlan=function(G){ const F=G.flags; if(!F.JOB_TUTOR||typeof OUT==='undefined'||!hasCal()) return; const U=TU(); if(!U) return;
    for(const q of OUT.rec(G)) if(/^tutor_/.test(q.id)&&q.state==='planned'&&!S.tutorDayOk(G,q.day)) q.state=S.tutorEnded(G)?'cancelled':'skipped';   /* 停了、期末考週、學期以後（舊存檔排的）*/
    const T=CALENDAR.termOf(G.day); if(!T||!S.tutorOn(G)||typeof STORY==='undefined'||!STORY.termDayIn) return; const wd=F.TUTOR_WD===4?4:2, LW=STORY.termWeeks?STORY.termWeeks(T.id):16;
    for(let w=T.week;w<=LW;w++){ const d=STORY.termDayIn(T.id,w,wd); if(d==null||d*24+19<G.day*24+G.hour||!S.tutorDayOk(G,d)) continue; const id='tutor_'+d, q0=OUT.get(G,id); if(q0){ if(q0.state==='planned') break; continue; }   /* 這週的已經上過／沒去＝看下一週 */
      OUT.plan(G,{id,ev:'ev_tutor_lesson',day:d,h:19,place:U.place,title:'家教',travel:U.travel,travelH:1/6,no:U.no,back:'家教結束。',tutor:true}); break; } };
  /* 出遊的結果（去了／沒去）照日子算一次：沒去＝下一堂的開場一句、連續三週＝明軒私訊 */
  S.tutorTrack=function(G){ const F=G.flags; if(typeof OUT==='undefined') return; const U=TU(); if(!U) return;
    if(F.TUTOR_ASK3==='stop'){ F.TUTOR_ASK3=null; if(F.TUTOR_STOP==null) F.TUTOR_STOP=G.day; }
    else if(F.TUTOR_ASK3==='go'){ F.TUTOR_ASK3=null; F.TUTOR_MISS_RUN=0; F.TUTOR_ASK3_SENT=false; }
    for(const tid of S.ASK_TERMS) if(F['TUTOR_TERM_'+tid]==='stop'&&F.TUTOR_STOP==null) F.TUTOR_STOP=G.day;
    const L=OUT.rec(G).filter(q=>/^tutor_/.test(q.id)&&!q.tutorSeen&&(q.state==='missed'||q.state==='done')).sort((a,b)=>a.day-b.day);
    for(const q of L){ q.tutorSeen=true; if(q.state==='done'){ F.TUTOR_MISS_RUN=0; F.TUTOR_ASK3_SENT=false; continue; }
      F.TUTOR_MISS_RUN=(F.TUTOR_MISS_RUN|0)+1; const t=CALENDAR.termOf(q.day); F.TUTOR_MISS_PEND=t?t.id:null; }
    if((F.TUTOR_MISS_RUN|0)>=3&&!F.TUTOR_ASK3_SENT&&!S.tutorEnded(G)&&typeof PHONE!=='undefined'){ F.TUTOR_ASK3_SENT=true; const tag='tutor_ask3_'+G.day;
      PHONE.at(G,G.day,Math.max(G.hour,21),[Object.assign(mxMsg(U.ask3),{ask:{id:tag,opts:[{t:U.ask3Opts[0],set:{TUTOR_ASK3:'go'}},{t:U.ask3Opts[1],say:[mxMsg(U.stopReply)],set:{TUTOR_ASK3:'stop'}}]}})],tag); } };
  /* 答應那一學期以後的每一學期（大一下、大二上、大二下）開學第一天 12:00：「家長問你這學期還來嗎」（上一個學期還在上的才問；11-03 起大一上答應的，大一下也問——跟大二上一樣）*/
  S.tutorTermAsk=function(G){ const F=G.flags, U=TU(); if(!U||!F.JOB_TUTOR||S.tutorEnded(G)||typeof PHONE==='undefined') return; const T=CALENDAR.termOf(G.day); if(!T||!S.ASK_TERMS.includes(T.id)||T.id===S.tutorStartTerm(G)) return;
    if(F['TUTOR_TERM_'+T.id]!=null) return; const prev=S.TUTOR_TERMS[S.TUTOR_TERMS.indexOf(T.id)-1]; if(!S.tutorTermOk(G,prev)) return;   /* 原本：大二下要大二上回「來」；大二上不看（只能大一下接）*/ const kk=S.tutorKK(); if(kk!=null&&G.day>=kk) return;
    const R=CALENDAR.termDays(T.id), tag='tutor_term_'+T.id; if(!R||PHONE.sent(G,tag)) return; const late=G.day>R.from;
    PHONE.at(G,late?G.day:R.from,late?Math.max(G.hour,12):12,[Object.assign(mxMsg(U.termAsk),{ask:{id:tag,until:(R.to+1)*24,opts:[{t:U.termOpts[0],set:{['TUTOR_TERM_'+T.id]:'go'}},{t:U.termOpts[1],say:[mxMsg(U.stopReply)],set:{['TUTOR_TERM_'+T.id]:'stop'}}]}})],tag); };
  /* 會考以後：學生的訊息，家教結束（大二下還在上的）*/
  S.tutorEnd=function(G){ const F=G.flags, U=TU(), kk=S.tutorKK(); if(!U||kk==null||!F.JOB_TUTOR||S.tutorStopped(G)||G.day<kk||F.TUTOR_TERM_Y2S2!=='go'||typeof PHONE==='undefined') return;
    F.TUTOR_DONE=kk+1; if(!PHONE.sent(G,'tutor_done')) PHONE.at(G,kk+1,21,[{th:'p:'+U.kid.id,from:U.kid.id,text:U.doneMsg}],'tutor_done'); };
  /* 家教停了以後隔一個學期可以再做（AA_828 第 7 節第 4 點：舊打工全部比照再應徵；資料 reapply.tutor）：家教沒有告示、沒有玩家自己開口的地方（見上面「沒做」），
     所以照開學問的那一則——停的那一天以後的每一個學期開學（大一下、大二上、大二下；會考以前）12:00 明軒再問一次「家長問你這學期還來嗎」（原本的字 termAsk／termOpts／stopReply，沒有新的句子）。
     回「來」（TUTOR_RE_ANS 'go'，S.tutorTrack 收）＝TUTOR_STOP 清掉、這個學期記 'go'、以前回「不了」的那幾個學期改記 'stopped'（不然 tutorTrack 會馬上又當成停）、沒去的次數歸零、TUTOR_RE 加一；
     堂數（TUTOR_N）、演過的事照舊留著（熟練度保留，同第 5 節第 5 點）。回「不了」或沒回＝照舊停著，下一個學期開學再問。會考後結束的（TUTOR_DONE）不問。
     存檔多 G.flags.TUTOR_RE（再接了幾次）、TUTOR_RE_ANS（回覆，收了就清掉）；舊存檔沒有＝沒有再接過。*/
  /* AA_828 第 8 節第 5 點（企劃線 1e539b8eb9；資料 reapply.tutorAskOnce）：「家教：回『不了』以後不再問（只問一次）。之後想做，照再應徵那一套自己去問。」
     ＝回過「不了」（S.tutorSaidNo：開學那一則回「不了」停的——TUTOR_TERM_<學期>==='stop'；或再問的那一則回「不了」——S.tutorReTake 記 G.flags.TUTOR_RE_NO＝那一天）以後，明軒不再傳「這學期還來嗎」。
     不是回「不了」停的（連續沒去、明軒問了以後停）照上面：下一個學期開學問一次；那一次回「不了」＝之後也不問。
     「自己去問」：AA_828 第 9 節第 2 點給了地方和字（S.tutorBack，見下面）。
     存檔多 G.flags.TUTOR_RE_NO（舊存檔沒有＝再問的那一則還沒回過「不了」）。*/
  S.tutorSaidNo=function(G){ const F=(G&&G.flags)||{}; if(F.TUTOR_RE_NO!=null) return true; for(const tid of S.ASK_TERMS) if(F['TUTOR_TERM_'+tid]==='stop') return true; return false; };
  /* AA_828 第 9 節第 2、3 點（企劃線 3e9cd7d9d4；資料 reapply.tutorBack＝{opt, re, expired}）：
     第 2 點「家教回『不了』以後怎麼再接：下一個學期開學起，手機『訊息』那一則家教的對話底下多一個回覆選項『我現在可以接家教了。』；對方回：『好，剛好還有一個學生。時間我傳給你。』之後照原本答應的流程。」
     第 3 點「家教那一則沒回、過期：也算問過，不再問；一樣用第 2 點的回覆選項自己回去找。」
     做法（照手機現有「可以回的訊息」ask；掛在已經收到的訊息上＝src/msgreply3d.js S.attach 那一種）：
       S.tutorReAsked(G,tid)：這一次停了以後，前面的學期已經再問過一次（tutor_re_<學期> 傳過、那個學期過了還停著＝沒回）＝算問過，S.tutorReAsk 不再問（原本：下一個學期又問）。
       S.tutorLimbo(G,tid)：開學那一則「這學期還來嗎」沒回、過期（TUTOR_TERM_<學期> 一直是空的；原本＝之後不排課、也不再問，沒有路回去）——同第 3 點，一樣給回覆選項。
       S.tutorBackDue(G)：現在是可以上家教的學期（大一下～大二下、會考以前、答應的那個學期以後），而且 回過「不了」（那一則在這個學期開學以前）／再問的那一則過期／開學那一則過期。
       S.tutorBack(G)：符合的時候，把選項掛在明軒那一串底下（第六輪：掛在「那一則家教的對話」——他回的 stopReply、或問的那一則；**第 10 節第 5 點改成一律掛他最新的一則、之後跟著移**，見 S.tutorBackSpot 上面）。
         掛著的那一則之後被刪（訊息超過 200 則刪最舊的）＝下一次再掛（S.tutorPhone 每次都看）。開到會考前一天；一次只掛一個。
       回了＝祐廷那一句貼上去、明軒回那一句、TUTOR_RE_ANS 'go'——就是再問回「來」的那條路（S.tutorReTake：TUTOR_STOP 清掉、這個學期記 'go'、TUTOR_RE 加一；堂數照舊留著），S.tutorPlan 排下一堂。
       放假的時候回＝先留著（TUTOR_RE_ANS 不清），開學那天才算（原本：放假回「來」＝白回）。
     存檔不多旗標（掛的選項在那一則訊息的 ask 上，id tutor_back_<哪一天>）；舊存檔讀進來，符合的下一次 S.tutorPhone 就掛上。*/
  S.tutorBackCfg=()=>{ const RA=S.RA(), B=RA&&RA.tutor&&RA.tutorBack; return B&&B.opt&&B.re?B:null; };
  const termIdx=tid=>S.TUTOR_TERMS.indexOf(tid);
  S.tutorReAsked=function(G,tid){ const F=G.flags, B=S.tutorBackCfg(); if(!B||!B.expired||F.TUTOR_STOP==null||typeof PHONE==='undefined'||!hasCal()) return false;
    for(const x of S.ASK_TERMS){ if(termIdx(x)>=termIdx(tid)) continue; const R=CALENDAR.termDays(x); if(R&&R.from>F.TUTOR_STOP&&PHONE.sent(G,'tutor_re_'+x)) return true; } return false; };
  S.tutorLimbo=function(G,tid){ const F=G.flags, B=S.tutorBackCfg(); if(!B||!B.expired||F.TUTOR_STOP!=null||F['TUTOR_TERM_'+tid]!=null||typeof PHONE==='undefined'||PHONE.sent(G,'tutor_term_'+tid)) return false; const st=S.tutorStartTerm(G); if(!st) return false;
    for(const x of S.ASK_TERMS){ if(termIdx(x)>=termIdx(tid)||termIdx(x)<=termIdx(st)) continue; if(F['TUTOR_TERM_'+x]==null&&PHONE.sent(G,'tutor_term_'+x)) return true; } return false; };
  S.tutorAskOpen=G=>typeof PHONE!=='undefined'&&!!PHONE.askOpen&&Array.isArray(G.msgs)&&G.msgs.some(m=>m&&m.ask&&/^tutor_(re|term|ask3)_/.test(String(m.ask.id))&&PHONE.askOpen(G,m));   /* 明軒問的那一則還開著（還回得了）＝先回那一則 */
  S.tutorBackDue=function(G){ const F=(G&&G.flags)||{}; if(!S.tutorBackCfg()||!F.JOB_TUTOR||F.TUTOR_DONE!=null||F.TUTOR_RE_ANS!=null||F.TUTOR_ASK3!=null||!hasCal()||S.tutorAskOpen(G)) return false; const kk=S.tutorKK(); if(kk!=null&&G.day>=kk) return false;
    const T=CALENDAR.termOf(G.day); if(!T||!S.ASK_TERMS.includes(T.id)) return false; const st=S.tutorStartTerm(G); if(!st||termIdx(T.id)<=termIdx(st)) return false; const R=CALENDAR.termDays(T.id); if(!R) return false;
    if(F.TUTOR_STOP==null) return S.tutorLimbo(G,T.id); if(R.from<=F.TUTOR_STOP) return false;
    if(F.TUTOR_RE_NO!=null&&F.TUTOR_RE_NO<R.from) return true; for(const x of S.ASK_TERMS) if(F['TUTOR_TERM_'+x]==='stop'&&termIdx(x)<termIdx(T.id)) return true;
    return S.tutorReAsked(G,T.id); };
  /* AA_828 第 10 節第 5 點（企劃線 33e9522155；2026-11-12 第七輪）：「那個選項一律掛在明軒那一串最新一則底下，不用往回捲。」
     原本（第六輪）：先找「那一則家教的對話」（他回的 stopReply、或問的那一則）掛，找不到才掛最新的一則；掛上去以後不動——之後明軒又傳別的，選項就留在上面，要往回捲。
     現在：S.tutorBackSpot＝明軒那一串裡他傳的最新一則（不算置頂、旁白、約你的那一則）。那一則本來有別的選項：
       還開著（還回得了）、或已經回過的＝不蓋掉，往前找他最新的一則「沒有選項、或選項過期沒回」的（過期沒回的那一組換成這一個——同原本的後備做法；原本那一組收在 ask.was，選項移走的時候放回去）。一則都找不到＝先不掛，等他有訊息。
     明軒之後又傳新訊息＝選項跟著移到新的最新一則（舊那一則的拿掉、原本過期的那一組放回去；ask 的 id、期限照舊）；一次只掛一個（多的拿掉）。S.tutorPhone 每次都看。
     存檔：沒有新旗標（照舊在那一則訊息的 ask 上；多 ask.was＝被換掉的那一組過期的選項，沒有＝原本沒有選項）。舊存檔（第六輪掛在上面的）讀進來，下一次 S.tutorPhone 就移到最新一則。
     AA_828 第 11 節第 1、2 點（企劃線 f6aa917593；2026-11-12 第七輪合併後）：「掛在明軒那一串**最底下**（不管最後一則是誰的泡泡）」——S.tutorBackSpot 不再只看明軒傳的：
       那一串最底下的那一則泡泡（明軒的、祐廷自己傳的都算；照舊不算置頂、旁白、約你的那一則——那一則有自己的按鈕）。最底下那一則有別的還開著的選項、或已經回過的選項＝不蓋，
       往上找最近一則「沒有選項、或選項過期沒回」的（第 2 點：「選項留在更前面那一則，到下一則普通訊息再移」）。明軒或祐廷之後又有新訊息＝跟著移到新的最底（S.tutorPhone 每次都看）。
       原本（第 10 節第 5 點的做法）：祐廷自己的泡泡不掛，最後一則是祐廷傳的時候選項在他上面那一則明軒的訊息上。*/
  const backMine=(G,m)=>!!(m&&m.ask&&/^tutor_back_/.test(String(m.ask.id))&&PHONE.askOpen(G,m));
  const backOff=m=>{ const w=m.ask&&m.ask.was; if(m.ask) delete m.ask.was; if(w) m.ask=w; else delete m.ask; };
  S.tutorBackOpen=G=>typeof PHONE!=='undefined'&&Array.isArray(G.msgs)&&G.msgs.some(m=>backMine(G,m));
  S.tutorBackSpot=function(G,cur){ const th='p:'+MX; for(let i=G.msgs.length-1;i>=0;i--){ const m=G.msgs[i]; if(!m||PHONE.th(m)!==th||m.pin||m.narr||m.iv) continue;   /* 誰的泡泡都算（第 11 節第 1 點；原本多一個條件 m.from!==MX＝只看明軒傳的）；iv＝約你的那一則（有自己的按鈕）*/
      if(m===cur||!m.ask||(m.ans==null&&!PHONE.askOpen(G,m))) return m; } return null; };
  S.tutorBack=function(G){ const B=S.tutorBackCfg(), U=TU(); if(!B||!U||typeof PHONE==='undefined'||!PHONE.askOpen||!Array.isArray(G.msgs)||!S.tutorBackDue(G)) return false;
    const O=G.msgs.filter(m=>backMine(G,m)), cur=O[0]||null; for(const m of O.slice(1)) backOff(m);   /* 一次只掛一個 */
    const a=S.tutorBackSpot(G,cur); if(!a||a===cur) return false;
    let ask; if(cur){ ask=cur.ask; backOff(cur); } else { const kk=S.tutorKK(); ask={id:'tutor_back_'+G.day,opts:[{t:B.opt,say:[mxMsg(B.re)],set:{TUTOR_RE_ANS:'go'}}]}; if(kk!=null) ask.until=kk*24; }
    if(a.ask) ask.was=a.ask; a.ask=ask; return true; };
  S.tutorReAsk=function(G){ const F=G.flags, U=TU(), RA=S.RA(); if(!U||!RA||!RA.tutor||!F.JOB_TUTOR||F.TUTOR_STOP==null||F.TUTOR_DONE!=null||typeof PHONE==='undefined'||!hasCal()) return false;
    if(RA.tutorAskOnce&&S.tutorSaidNo(G)) return false;
    const T=CALENDAR.termOf(G.day); if(!T||!S.ASK_TERMS.includes(T.id)) return false; const st=S.tutorStartTerm(G); if(!st||S.TUTOR_TERMS.indexOf(T.id)<=S.TUTOR_TERMS.indexOf(st)) return false;
    if(S.tutorReAsked(G,T.id)) return false;   /* 第 9 節第 3 點：再問的那一則沒回、過期＝也算問過 */
    const kk=S.tutorKK(); if(kk!=null&&G.day>=kk) return false; const R=CALENDAR.termDays(T.id), tag='tutor_re_'+T.id; if(!R||R.from<=F.TUTOR_STOP||PHONE.sent(G,tag)) return false; const late=G.day>R.from;
    return !!PHONE.at(G,late?G.day:R.from,late?Math.max(G.hour,12):12,[Object.assign(mxMsg(U.termAsk),{ask:{id:tag,until:(R.to+1)*24,opts:[{t:U.termOpts[0],set:{TUTOR_RE_ANS:'go'}},{t:U.termOpts[1],say:[mxMsg(U.stopReply)],set:{TUTOR_RE_ANS:'stop'}}]}})],tag); };
  S.tutorReTake=function(G){ const F=G.flags, a=F.TUTOR_RE_ANS; if(a==null) return false;
    if(a!=='go'){ F.TUTOR_RE_ANS=null; if(a==='stop'&&F.TUTOR_RE_NO==null) F.TUTOR_RE_NO=G.day; return false; }
    const kk=S.tutorKK(); if(F.TUTOR_DONE!=null||!hasCal()||(kk!=null&&G.day>=kk)){ F.TUTOR_RE_ANS=null; return false; }
    const T=CALENDAR.termOf(G.day); if(!T) return false;   /* 放假的時候回的：留著，開學那天才算 */
    F.TUTOR_RE_ANS=null; if(!S.TUTOR_TERMS.includes(T.id)) return false;
    if(F.TUTOR_STOP==null){ const st=S.tutorStartTerm(G); if(F['TUTOR_TERM_'+T.id]!=null||!S.ASK_TERMS.includes(T.id)||!st||termIdx(T.id)<=termIdx(st)) return false; }   /* 沒停、開學那一則過期的（S.tutorLimbo）：這個學期記 'go' 就接回來 */
    for(const tid of S.ASK_TERMS) if(F['TUTOR_TERM_'+tid]==='stop') F['TUTOR_TERM_'+tid]='stopped'; F['TUTOR_TERM_'+T.id]='go'; F.TUTOR_STOP=null; F.TUTOR_MISS_RUN=0; F.TUTOR_ASK3_SENT=false; F.TUTOR_MISS_PEND=null; F.TUTOR_RE=(F.TUTOR_RE|0)+1; return true; };
  S.tutorPhone=function(G){ if(!G||!G.flags||!G.flags.JOB_TUTOR) return; S.tutorReTake(G); S.tutorTrack(G); S.tutorTermAsk(G); S.tutorEnd(G); S.tutorReAsk(G); S.tutorBack(G); S.tutorPlan(G); };
  S.tutorDrawDue=G=>{ const F=(G&&G.flags)||{}, T=TU(); return !!T&&!!F.JOB_TUTOR&&F.TUTOR_DRAW==null&&(F.TUTOR_N|0)>=T.drawAfter; };
  const sayAs=(GM,w,t)=>GM.say(w?{name:w}:null,t);
  /* 一堂的開頭（場景字幕之後）：上週沒去的那一句 */
  S.tutorOpen=async function(G,GM){ const F=G.flags, U=TU(); if(!U||!F.TUTOR_MISS_PEND) return; const t=CALENDAR.termOf(G.day), same=!!t&&t.id===F.TUTOR_MISS_PEND; F.TUTOR_MISS_PEND=null; if(!same) return;
    const L=U.miss[(F.TUTOR_MISS_N|0)%U.miss.length]; F.TUTOR_MISS_N=(F.TUTOR_MISS_N|0)+1; await sayAs(GM,L[0],L[1]); };
  /* 一堂的結尾：第 4 堂的問題 → 會考前最後一堂 → 期末考週前一堂 → 第 6 堂以後的考卷背面 → 家教費 */
  S.tutorClose=async function(G,GM,e){ const F=G.flags, U=TU(); if(!U) return; const n=F.TUTOR_N|0, t=CALENDAR.termOf(G.day), kk=S.tutorKK();
    if(n===3&&F.TUTOR_WHY==null){ await sayAs(GM,'國中生',U.why.ask); const k=await GM.choose(U.why.opts.map(o=>({t:'「'+o+'」'}))); const i=Math.max(0,Math.min(2,k|0)); F.TUTOR_WHY=i+1;
      await sayAs(GM,'國中生',U.why.reply); if(GM.addNote) GM.addNote(U.why.note.id,U.why.note.title,U.why.note.pre+U.why.opts[i]+U.why.note.post); }
    if(t&&kk!=null&&G.day<kk&&G.day+7>=kk) await sayAs(GM,'國中生',U.lastLesson);
    if(t&&typeof STORY!=='undefined'&&STORY.termWeeks&&t.week===STORY.termWeeks(t.id)-1) await sayAs(GM,U.examStop[0],U.examStop[1]);
    if(S.tutorDrawDue(G)&&typeof EVENTS!=='undefined'&&EVENTS.runLines){ F.TUTOR_DRAW=G.day; await EVENTS.runLines(U.draw,e); }
    if(GM.money) GM.money(U.pay); else G.money=(G.money|0)+U.pay; if(GM.toast) GM.toast(U.payToast,2800); };
  S.patchTutor=function(){ if(typeof STORY_EVENTS==='undefined') return false; const ev=STORY_EVENTS.find(e=>e.id==='ev_tutor_lesson'); if(!ev||!Array.isArray(ev.dialogue)||ev._aa289) return false; ev._aa289=true;
    const i=ev.dialogue.findIndex(l=>l.scene!==undefined); ev.dialogue.splice(i+1,0,{call:async(G,GM)=>{ await S.tutorOpen(G,GM); }});
    ev.dialogue.push({call:async(G,GM,e)=>{ await S.tutorClose(G,GM,e||ev); }}); return true; };
  S.patchTutor();

  // ---------- 接線 ----------
  if(typeof PORTRAIT_ONLY!=='undefined'){ for(const k of S.KEYS){ const s=D()&&shop(k); if(s&&!PORTRAIT_ONLY[s.bossId]) PORTRAIT_ONLY[s.bossId]={id:s.bossId,name:s.contact||s.boss,alias:[],gender:s.gender||(k==='brunch'||k==='tea'?'f':'m')}; } const K=D()&&D().tutor&&D().tutor.kid; if(K&&!PORTRAIT_ONLY[K.id]) PORTRAIT_ONLY[K.id]={id:K.id,name:K.name,alias:[],gender:'m'}; }   /* 手機聯絡人的名字（只登錄名字，同 sideq3d.js）*/
  if(typeof OUT!=='undefined'&&OUT.prompt&&!OUT._jobs){ const p0=OUT.prompt; OUT.prompt=async function(GM,q){ const G=GM&&GM.G;
      if(G&&q&&q.jobOt){ const R=typeof CLS!=='undefined'&&CLS.slotRec?CLS.slotRec(G):null; if(R&&(R.used.ev|0)>0){ q.state='cancelled'; return 'no'; } }   /* 那天晚上已經做了別的主要活動：阿德不問（AA_420 2-1）*/
      const pr=G?S.partner(G,q):null; let r;
      if(pr) r=await S.prompt2(GM,q,pr); else r=await p0.apply(this,arguments);
      if(G&&q&&q.jobOt&&r==='no'){ const j=S.job(G,'copy'), wk=S.otWeek(G,q.day); if(j&&wk) fix(j).ot[wk]='no'; }
      if(G&&q&&q.job&&r==='go') S._enterPend=true;
      return r; }; OUT._jobs=true; }
  if(typeof STORY!=='undefined'){
    if(STORY.TICKS) STORY.TICKS.push(S.tick);
    if(STORY.PHONE_RULES) STORY.PHONE_RULES.push(S.phone);
    if(STORY.ROOM_EXTRA) STORY.ROOM_EXTRA.push(S.room);
    if(STORY.populate&&!STORY._jobsPop){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(S.ZONE_KEY[zoneId]) S.addDesk(GM,zoneId); if(zoneId==='linze') S.addBoard(GM); }catch(e){ console.warn('JOBS.populate',e); } return r; }; STORY._jobsPop=true; }
    if(STORY.interact&&!STORY._jobsInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.wzJob&&G) return S.desk(GM,it.wzJob);
        if(it&&it.jobBoard&&G) return S.board(GM);   /* 霖澤館一樓公布欄（補習班、事務所）*/
        const cust=it&&G&&it.wzShop&&((it.wzShop==='brunch'&&it.kind==='cashier')||(it.wzShop==='print'&&it.kind==='print')||(it.wzShop==='teahouse'&&it.kind==='tea'));
        const m0=G?G.money|0:0; const r=await o0.apply(this,arguments);
        if(cust){ try{ await S.visit(GM,S.key(it.wzShop),it.kind,(G.money|0)<m0); }catch(e){ console.warn('JOBS.visit',e); } }
        return r; }; STORY._jobsInteract=true; } }
  return S;
})();
if(typeof window!=='undefined') window.JOBS=JOBS;
