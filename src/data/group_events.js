/* ===== 1C 群戲的事件（AA_324，AA-C 2026-10-20 定稿 c41f4305；AA_314 第 1 輪的最後一組）：台詞照 AA_324 不改字 =====
   邀約、出發（OUT）、沒去的群組照片、春假三選一的選單、旗標在 src/group3d.js。群戲共通：只有認識的人在場、不熟的人的句子跳過（AA_324 開頭）。
   1C-01 ev_spring_y2_noodle（4/4 麵店團：車上 → 小鎮的市場 → 海邊 → 回程）、ev_kexin_trip_spring_y2（和可昕：BB_97 9-12，沒有假設題）、ev_spring_dorm_empty_y2（留宿舍）；
   1C-02 ev_midautumn_y3（9/15 河濱，以安的生日）；1C-03 ev_xmas_y3_box（12/26 麵店，寄到英國的那一箱）；
   1C-04 ev_zhe_said_it（4/28 23:00 哲 4：宿舍樓下的便利商店外（在宿舍＝十分鐘後；在臺北的外面＝二十分鐘回宿舍，AA_336 C10）／視訊）、ev_final_game_y3（4/29 冠軍賽＋賽後麵店）、ev_mx_egg_y3（隔週在麵店遇到明軒，補一顆滷蛋）；
   1C-05 ev_zq_zr_graduation（6/3 上午椰林大道）、ev_zhiruo_graduation_cafe（6/3 14:00 以後第一次進 Café，Z12）；1C-06 ev_last_term_first_dinner（2029-02-22 19:00 麵店）。
   測試：node tests/group_events_unit.js */
'use strict';
const GROUP_EVENTS=(function(){
  const kn=(...ids)=>({custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&ids.every(id=>STORY.knows(id,G))});
  const nkn=(...ids)=>({custom:G=>!(typeof STORY!=='undefined'&&!!STORY.knows&&ids.every(id=>STORY.knows(id,G)))});
  const stAt=(G,id,st)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const fam=(id,st)=>({custom:G=>stAt(G,id,st||'FAMILIAR')}), nfam=(id,st)=>({custom:G=>!stAt(G,id,st||'FAMILIAR')});
  const dating=id=>G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const isDown={flagIs:{ZHE4_REPLY:['down','out']}}, notJP={custom:G=>(G.flags||{}).ZHE4_REPLY!=='jp'}, isJP={flagIs:{ZHE4_REPLY:'jp'}}, jpNow=G=>(G.flags||{}).ZHE4_REPLY==='jp';   /* down＝在宿舍下樓、out＝在臺北的外面、二十分鐘回宿舍（當面版）；home、away（不在臺北）、jp＝視訊版（AA_336 C10）*/
  /* 1C-01 和可昕那一趟：還沒去過的目的地（KX_TRIP 的每一個假期；大一春假 Y1S2）＋「山上看星星」一定在（去過的也可以再選，AA_336 C7）。三個都去過＝「迷路到的地方」（BB_97 9-12）*/
  const kxSeen=G=>{ const T=(G.flags.KX_TRIP&&typeof G.flags.KX_TRIP==='object')?G.flags.KX_TRIP:{}; return Object.keys(T).filter(k=>k!=='Y2S2').map(k=>T[k]); };
  const kxNot=d=>({custom:G=>!kxSeen(G).includes(d)}), kxAll={custom:G=>['sea','oldtown','stars'].every(d=>kxSeen(G).includes(d))};
  const kxStarsBefore={custom:G=>((G.flags.KX_TRIP&&G.flags.KX_TRIP.Y1S2)||G.flags.KX_TRIP_Y1S2)==='stars'};
  const G1=()=>typeof GROUP!=='undefined'?GROUP:null;
  const inCar=(G,id)=>{ const g=G1(); return !!g&&!!g.springInCar&&g.springInCar(G,id); }, car=id=>({custom:G=>inCar(G,id)});   /* 春假麵店團那一趟車上的三個人（group3d.js S.springInCar；AA_375 第 5 項）*/
  return [
  /* ---------- 1C-01 春假（大二版）：麵店團 4/4（日）一天來回，祐廷開家裡的車載三個人（AA_324 第 2 節）。沛珊在消失期，不出現；和沛珊 FAMILIAR 以上多 Alison 那一段 ---------- */
  { id:'ev_spring_y2_noodle', title:'春假・市場和海邊', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:11,
    beforeOuting:G=>{ const g=G1(); if(g&&g.springSeat) g.springSeat(G); },   /* 車上的三個人（AA_375 第 5 項，照熟悉度）*/
    dialogue:[ {scene:'車上',bg:'car_morning'},{speaker:null,text:'（你回家把車開出來。後座擠了三個人。）'},
      {if:{custom:G=>{ const g=G1(); return !!g&&g.springTrain(G); }},speaker:null,text:'（車子坐不下。剩下的人搭火車，下午在那邊會合。）'},   /* AA_375 第 5 項：認識的超過三個＝其他人搭火車；會合以後（海邊）照樣有他們的句子 */
      {scene:'小鎮的市場',bg:'dark'},   /* 小鎮的傳統市場背景沒有（AA_143，底圖等使用者）→ dark＋字幕 */
      {speaker:null,text:'（市場在小鎮車站的後面。早上九點，攤販已經在收第一輪了。）'},
      {if:car('heroine_03'),speaker:'heroine_03',text:'這個市場，我田野課看過資料。……想自己來看一次。'},   /* 市場（早上）＝車上的人；搭火車的下午才到（AA_375 第 5 項）*/
      {if:car('zhe'),speaker:'zhe',text:'（手上拿著一袋剛炸好的東西）這個好吃。我不知道是什麼。'},
      {if:car('heroine_01'),speaker:'heroine_01',text:'第一站選得很有理由。'},
      {if:{custom:G=>stAt(G,'classmate_peishan','FAMILIAR')&&typeof STORY!=='undefined'&&STORY.knows('yu',G)&&inCar(G,'yu')},speaker:'yu',text:'（看著賣菜的阿姨）……以前這種行程都是沛珊排的。'},
      {if:{custom:G=>stAt(G,'classmate_peishan','FAMILIAR')&&typeof STORY!=='undefined'&&STORY.knows('yu',G)&&inCar(G,'yu')&&inCar(G,'heroine_03')},speaker:null,text:'（沒有人接話。語彤把一袋芭樂遞給 Alison。）'},
      {scene:'海邊',bg:'y0_sea_blue'},{speaker:null,text:'（第二站是海邊。四月的風還有點冷。）'},
      {if:kn('yu'),speaker:'yu',text:'我說要去海邊，真的來了。'},
      {if:kn('classmate_bohan'),speaker:'classmate_bohan',text:'（把鞋子脫了，又穿回去）水太冷。'},
      {if:kn('classmate_xinci'),speaker:'classmate_xinci',text:'我們拍一張。……阿哲你站後面，你太高。'},
      {if:kn('classmate_xinci','zhe'),speaker:'zhe',text:'我哪有。'},
      {choice:[{text:'（下去踩水）',goto:'w'},{text:'（坐在堤防上）',goto:'s'}]},
      {label:'w'},{if:kn('yu'),speaker:null,text:'（水真的很冷。Alison 在後面笑到蹲下。）'},{goto:'back'},
      {label:'s'},{if:kn('heroine_03'),speaker:null,text:'（你坐到語彤旁邊。她看著海，筆記本放在膝蓋上，一個字都沒寫。）'},
      {label:'back'},{scene:'車上',bg:'car_night'},{speaker:null,text:'（回程，後座三個人都睡著了。你一個人開到臺北，收音機開得很小聲。）'} ],
    consequences:{memo:'大二的春假：開車載麵店團去小鎮的市場和海邊'},
    outingMissed:G=>{ const g=G1(); if(g) g.springPhoto(G); } },
  /* 和可昕的那一趟（BB_97 9-12；AA_324 第 2 節：到了的假設題拿掉，換成她到了以後的一句）。出發、回程照大一那一趟（BB_96 9-5 的流程）。記 KX_TRIP.Y2S2 */
  { id:'ev_kexin_trip_spring_y2', title:'春假：開車旅行（大二）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:13.5,
    dialogue:[ {scene:'木柵大學・校門口',bg:'nccu_gate'},{scene:'車上',bg:'car'},
      {if:kxAll,goto:'lost'},
      {speaker:'kexin',expression:'smile',text:'我管音樂。你管方向。'},   /* 車上開場、回程：大二版（AA_336 C8），不沿用大一 */
      {speaker:'kexin',expression:'teasing',text:'……目的地，現在決定。'},
      {choice:[{text:'海邊',if:kxNot('sea'),set:{KX_TRIP_Y2S2:'sea'},goto:'d_sea'},{text:'別的城市的老街',if:kxNot('oldtown'),set:{KX_TRIP_Y2S2:'oldtown'},goto:'d_old'},{text:'山上看星星',set:{KX_TRIP_Y2S2:'stars'},goto:'d_star'}]},
      {label:'d_sea'},{scene:'海邊',bg:'y0_sea_blue'},{speaker:'kexin',expression:'teasing',text:'水比我想的冷。……你先下去。'},{goto:'back'},
      {label:'d_old'},{scene:'老街',bg:'trip_oldtown'},{speaker:'kexin',expression:'embarrassed',text:'第三家了。我們只是來看看的。'},{goto:'back'},
      {label:'d_star'},{scene:'山上',bg:'trip_mountain'},{if:kxStarsBefore,speaker:'kexin',expression:'smile',text:'今天看得到。……上次那顆，真的是星星。'},{unless:kxStarsBefore,speaker:'kexin',expression:'smile',text:'好安靜。手機收不到訊號，剛好。'},
      {label:'back'},{scene:'車上',bg:'car'},{speaker:'kexin',expression:'smile',text:'今年我真的不睡。'},{speaker:null,text:'（過了收費站，她又睡著了。音樂還是她選的。）'},{goto:'fin'},
      /* 三個都去過：迷路到的地方（BB_97 9-12，BB-C 10-17 已拿掉假設題；2D 鄉間小路）*/
      {label:'lost'},{set:{KX_TRIP_Y2S2:'lost'}},
      {speaker:'kexin',expression:'teasing',text:'這次我不出行程表。你帶路，不要看地圖。'},{speaker:'kexin',expression:'embarrassed',text:'……我會忍住不看。大概。'},
      {scene:'迷路到的地方',bg:'country_road'},
      {speaker:null,text:'（開了一個多小時，轉錯三次彎。路的盡頭是一片田，一間沒有招牌的雜貨店，門口一台舊的投幣販賣機。）'},
      {speaker:'kexin',expression:'surprised',text:'這間店沒有招牌欸。'},{speaker:'kexin',expression:'thinking',text:'……我們到底在哪。'},
      {choice:[{text:'「買兩罐汽水。」',goto:'l1'},{text:'「下次再來？」',goto:'l2'},{text:'（坐在店門口的長椅）',goto:'l3'}]},
      {label:'l1'},{speaker:null,text:'（販賣機吃了你的硬幣。）'},{speaker:'kexin',expression:'laugh',text:'……十塊。我要記在行程表上。'},{goto:'lb'},
      {label:'l2'},{speaker:'kexin',expression:'laugh',text:'你記得路嗎？我完全不知道我們在哪。'},{goto:'lb'},
      {label:'l3'},{speaker:null,text:'（田裡的風吹過來。她拍了一張照片，照片裡只有路。）'},
      {label:'lb'},{scene:'車上',bg:'car'},{speaker:'kexin',expression:'smile',text:'行程表我回去再補。寫『迷路』，一行就好。'},
      {label:'fin'} ],
    after:G=>{ const k=G.flags.KX_TRIP_Y2S2; if(k){ const T=(G.flags.KX_TRIP&&typeof G.flags.KX_TRIP==='object')?G.flags.KX_TRIP:{}; T.Y2S2=k; G.flags.KX_TRIP=T; } } },
  /* 留在宿舍：照大一的 ev_spring_dorm_empty_y1，旁白換成 AA_324 那一句（春假第一天 4/3 白天走進宿舍時一次）*/
  { id:'ev_spring_dorm_empty_y2', title:'春假', participants:[], location:['dorm','dorm_hall'], trigger:'enter', once:true, background:'freeze',
    prereq:{custom:G=>{ const g=G1(); return !!g&&G.flags.SPRING_Y2==='dorm'&&G.day===g.springDays().d0&&G.hour>=6&&G.hour<18; }},
    dialogue:[ {speaker:null,text:'（宿舍的走廊很安靜。這次你知道，四天很快就過了。）'} ] },
  /* ---------- 1C-02 中秋＝以安的生日（2027-09-15 18:00 公館的河濱；AA_71 2-2 大三版）。知道她生日的玩家，第一句在開頭；不知道的，在語彤拿出柚子的時候 ---------- */
  { id:'ev_midautumn_y3', title:'中秋（大三）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {if:{custom:G=>{ const g=G1(); return !!g&&g.knowsAnBday(G); }},speaker:null,text:'（九月十五日。中秋，也是以安的生日。）'},
      {if:kn('heroine_03'),speaker:'heroine_03',text:'（拿出一顆柚子，上面插了一根蠟燭）蛋糕店關了。……柚子可以。'},
      {if:{custom:G=>{ const g=G1(); return !!g&&!g.knowsAnBday(G)&&typeof STORY!=='undefined'&&STORY.knows('heroine_01',G); }},speaker:null,text:'（九月十五日。中秋，也是以安的生日。）'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'上一次生日碰到中秋，我十歲。'},
      {if:kn('zhe'),speaker:'zhe',text:'那許願。快，風很大。'},
      {if:nkn('heroine_01'),goto:'end'},
      {choice:[{text:'「生日快樂。」',goto:'a'},{text:'「許什麼願？」',goto:'b'},{text:'（幫她擋風）',goto:'c'}]},
      {label:'a'},{speaker:'heroine_01',text:'……謝謝。柚子也可以。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_01',text:'說出來就不準。我媽說的。'},{goto:'end'},
      {label:'c'},{speaker:'heroine_01',text:'（吹熄了）……謝謝。風是你擋的，願望是我的。'},
      {label:'end'},{speaker:null,text:'（柚子後來被阿哲剝了。蠟燭插過的那一瓣，沒有人吃。）'} ],
    consequences:{flags:{MIDAUTUMN_Y3:true},memo:'大三的中秋（河濱）：以安的生日'},
    after:G=>{ if(typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)&&typeof SOCIAL!=='undefined') SOCIAL.remember('heroine_01','AN_BDAY_POMELO',''); },   /* 在場的玩家（AA_324 1C-02 第 4 節；大三上閒聊階梯 A5-L2 讀它）*/
    outingMissed:G=>{ const g=G1(); if(g) g.midautumnPhoto(G); } },
  /* ---------- 1C-03 聖誕「寄到英國的那一箱」（2027-12-26 18:30 麵店；AA_180 Y3S1-XMAS 原文）。和芷若 FAMILIAR 以上才有放東西的選項；交往中多一個 ---------- */
  { id:'ev_xmas_y3_box', title:'寄到英國的那一箱', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（麵店的長桌上放著一個紙箱。阿哲在上面用麥克筆寫倫敦的地址，寫錯一個字母，又塗掉。）'},
      {if:kn('yu'),speaker:'yu',text:'每個人放一樣東西。不能超過手掌大。'},
      {if:nfam('heroine_02'),set:{XMAS_Y3_BOX:'snack'}},
      {if:nfam('heroine_02'),speaker:null,text:'（Alison 說這是要寄給一個在英國的朋友。你不認識她，還是放了一包乖乖。）'},
      {if:nfam('heroine_02'),goto:'next'},
      {choice:[{text:'「Café 的杯墊。」',set:{XMAS_Y3_BOX:'coaster'},goto:'c1'},{text:'「一包乖乖。」',set:{XMAS_Y3_BOX:'snack'},goto:'c2'},{text:'「一張寫了字的便條。」',set:{XMAS_Y3_BOX:'note'},goto:'c3'},
        {text:'（放一張只有你看得懂的便條）',if:{custom:dating('heroine_02')},set:{XMAS_Y3_BOX:'note'},goto:'c4'}]},
      {label:'c1'},{if:kn('heroine_01'),speaker:'heroine_01',text:'她會知道是哪一家。'},{goto:'next'},
      {label:'c2'},{if:kn('zhe'),speaker:'zhe',text:'好，這個英國買不到。'},{goto:'next'},
      {label:'c3'},{if:kn('yu'),speaker:'yu',text:'寫什麼？……好，不給看。'},{goto:'next'},
      {label:'c4'},{if:kn('yu'),speaker:'yu',text:'……好，我們都不看。'},
      {label:'next'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'郵局說寄到英國要十天。我查過了。'},
      {if:kn('classmate_bohan'),speaker:'classmate_bohan',text:'郵局禮拜一才開，她收到要一月了。'},
      {if:kn('classmate_xinci'),speaker:null,text:'（芯慈已經在填海關的單子。）'},
      {if:kn('heroine_03'),speaker:null,text:'（語彤從廚房拿來一卷膠帶，把箱子封了三圈。）'},
      {if:kn('heroine_03'),speaker:'heroine_03',text:'阿姨說，箱子不夠大的話，店裡有。'} ],
    consequences:{memo:'寄到英國的那一箱（麵店）'},
    after:G=>{ const g=G1(); if(g) g.xmasBoxAfter(G); },
    outingMissed:G=>{ const g=G1(); if(g) g.xmasBoxPhoto(G); } },
  /* ---------- 1C-04 哲 4「有事」（2028-04-28 23:00；AA_40 哲 4）：在宿舍＝十分鐘後宿舍樓下的便利商店外；在家、日本路線＝視訊（同一段話）。記憶 ZHE_SAID_IT ---------- */
  { id:'ev_zhe_said_it', title:'阿哲', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.01,
    dialogue:[ {if:isDown,scene:'宿舍樓下的便利商店外',bg:'dark'},{unless:isDown,scene:'視訊',bg:'video'},
      {unless:isDown,speaker:null,text:'（視訊裡，他坐在宿舍的樓梯間，手上一瓶鋁箔包紅茶。）'},   /* 視訊版開頭的舞台指示（AA_336 C10）*/
      {if:isDown,speaker:'zhe',text:'（兩瓶鋁箔包紅茶，一瓶推過來）我爸明天要上來看。'},{unless:isDown,speaker:'zhe',text:'我爸明天要上來看。'},
      {speaker:'zhe',text:'他從來沒有來看過我打球。他是體育老師，他都說：輸了就去跑步，不要哭。'},
      {speaker:'zhe',text:'我剛剛跟 Alison 說「沒事啦」。'},
      {speaker:'zhe',text:'她說：「你看，你又說沒事。」'},
      {speaker:'zhe',text:'（很久）……'},
      {speaker:'zhe',text:'有事。我很緊張。'},
      {mem:[{npc:'zhe',tag:'ZHE_SAID_IT',note:''}]},
      {choice:[{text:'「嗯。我在。」',set:{ZHE4_FINAL:'here'},goto:'a'},{text:'「你要不要跟你爸說你很緊張？」',set:{ZHE4_FINAL:'dad'},goto:'b'},{text:'（什麼都不說，坐著）',set:{ZHE4_FINAL:'sit'},goto:'c'}]},   /* ZHE4_FINAL＝哲 4 選了哪一個（AA_496 第 9 節第 1 點；當面、視訊版都記）：尾聲照現在讀的值（有值＝「冠軍賽那晚欠你們的」那一句，postgrad3d.js）*/
      {label:'a'},{if:isDown,speaker:null,text:'（他點頭，把紅茶喝完，再去買兩瓶。兩個人坐到十二點半。他講了很多，大部分是高雄、他爸、高中的球隊。）'},
      {unless:isDown,if:notJP,speaker:null,text:'（他把紅茶喝完。你們講到十二點半。他講了很多，大部分是高雄、他爸、高中的球隊。）'},   /* 視訊版選項①（AA_336 C10）*/
      {if:isJP,speaker:null,text:'（他把紅茶喝完。你們講到臺灣十二點半。你這邊已經一點半。他講了很多，大部分是高雄、他爸、高中的球隊。）'},   /* AA_377 第 2 項：日本版照當地時間（臺灣 4/28 23:00＝日本 4/29 0:00）*/
      {speaker:'zhe',text:'我第一次講這麼多我自己的事。……講完好像沒那麼緊張了。'},{advance:G=>jpNow(G)?Math.max(0.25,(G.hour>=12?25.5:1.5)-G.hour):24.5-G.hour},{goto:'end'},   /* 講一個半小時：臺灣到 0:30；日本版 G.hour 是當地 0 點＝到當地 1:30（原本 24.5-G.hour 一口氣跳到 4/30，冠軍賽直播演不到）；沒換日的 24.x 也是到 25.5（BUG-JP-SLEEP-MIDNIGHT-1022：原本只過 15 分鐘）*/
      {label:'b'},{speaker:'zhe',text:'……跟我爸？'},
      {speaker:null,text:'（他想了很久，拿出手機，打了一行字，刪掉，又打。按出去。三十秒後手機震了：「我也是。」他盯著螢幕看了很久，然後笑出來。）'},
      {speaker:'zhe',text:'……他也是。'},{advance:0.25},{goto:'end'},
      {label:'c'},{unless:isJP,speaker:null,text:'（他也沒說話。十二點的時候他站起來。）'},{if:isJP,speaker:null,text:'（他也沒說話。臺灣十二點，你這邊一點。他把手機拿起來。）'},   /* AA_377 第 2 項：日本版「十二點」是臺灣時間 */
      {if:notJP,speaker:'zhe',text:'走啦。謝了。明天你要來喔。坐我爸旁邊，他不認識別人。'},{if:isJP,speaker:'zhe',text:'走啦。謝了。明天記得看直播。'},{advance:G=>jpNow(G)?Math.max(0.25,1-G.hour):24-G.hour},   /* 一個小時：日本版到當地 1:00（AA_377 第 2 項）*/   /* 日本路線選項③（AA_336 C10）；在家的視訊版照原句（人在臺灣，隔天會來）*/
      {label:'end'} ],
    consequences:{memo:'冠軍賽前一晚，阿哲說「有事」'},
    after:G=>{ const g=G1(); if(g) g.zhe4After(G); },
    /* 在臺北的外面、二十分鐘回宿舍（out）：講完是在宿舍樓下，回到房間（OUT.go 接著轉場、寫「回到房間。」）*/
    afterOuting:async(G,GM)=>{ if((G.flags||{}).ZHE4_REPLY!=='out'||['dorm','dorm_hall'].includes(G.zone)||!GM.enter) return; if(GM.fade) await GM.fade(true); await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI},{noFade:true,deferStory:true}); } },
  /* 冠軍賽（2028-04-29 19:00 新體育館；AA_40 哲 4、BB_98 5-2 明軒 M3）→ 20:40 全隊去麵店。和明軒 FAMILIAR 以上：他經過你旁邊、三選一 */
  { id:'ev_final_game_y3', title:'系籃冠軍賽', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'新體育館・球場',bg:'dark'},{speaker:null,text:'（新體育館一樓的球場。看台坐滿了。）'},
      {if:{custom:G=>!!(G.flags||{}).ZHE_SCOOTER||(typeof SOCIAL!=='undefined'&&SOCIAL.has('zhe','ZHE_SCOOTER'))},speaker:null,text:'（球場外面，阿哲的機車停得特別整齊。）'},
      {speaker:null,text:'（最後一顆，阿哲傳給明軒。他們贏了。）'},
      {speaker:'zhe',text:'（把獎盃塞給明軒）你拿。最後那顆是你的。'},
      {speaker:'classmate_mingxuan',text:'……好重。'},
      {speaker:'classmate_mingxuan',text:'我九點家教。我先走。冠軍明天還是冠軍！學生下週段考！'},
      {unless:fam('classmate_mingxuan'),goto:'dad'},
      {speaker:'classmate_mingxuan',text:'你看到了喔。我今天很用力。'},
      {choice:[{text:'「我陪你走到公車站。」',goto:'m1'},{text:'「冠軍耶，明天請客。」',consequences:{stamp:['MX_EGG_DAY']},goto:'m2'},{text:'「那出國呢？」',mem:[{npc:'classmate_mingxuan',tag:'SAW_HIM_TRY',note:''}],goto:'m3'}]},
      {label:'m1'},{speaker:null,text:'（路上他爸傳來一則：「那顆傳得好」。他看了很久，沒有回。）'},{goto:'dad'},
      {label:'m2'},{speaker:'classmate_mingxuan',text:'好。請你吃一碗大的。'},{goto:'dad'},
      {label:'m3'},{speaker:'classmate_mingxuan',text:'……交換那個，我放棄了。畢業以後自己存錢去。'},
      {label:'dad'},{speaker:null,text:'（阿哲的爸爸在場邊沒有說話，只拍了五十張照片。）'},
      {advance:G=>Math.max(0,20+40/60-G.hour)},
      {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（晚上全隊去麵店。阿哲的爸爸吃了三碗。）'},
      {speaker:'阿姨',text:'你很會吃喔。'},
      {speaker:'阿哲爸爸',text:'我兒子都在這裡吃喔？……難怪。'},
      {speaker:null,text:'（那天，阿姨晚了一個小時才拉下鐵門。）'} ],
    consequences:{flags:{FINAL_GAME_Y3:'went'},memo:'系籃冠軍賽（新體育館）'},
    outingMissed:G=>{ const g=G1(); if(g) g.finalMissed(G); } },
  /* 選「冠軍耶，明天請客。」：隔週第一次在麵店遇到明軒（npcNear，BB_98 5-2）；日本路線看直播回「恭喜！」的：回國後第一次在麵店遇到才補。沒遇到就不補 */
  { id:'ev_mx_egg_y3', title:'冠軍那天欠的', participants:['classmate_mingxuan'], location:'noodle', trigger:'auto', once:true, background:'blur', npcNear:'classmate_mingxuan',
    prereq:{custom:G=>{ const g=G1(); return !!g&&g.eggDue(G); }},
    dialogue:[ {speaker:null,text:'（他把一碗大碗的乾麵推到你面前。）'},{speaker:'classmate_mingxuan',text:'冠軍那天欠的。大碗。'} ],
    consequences:{flags:{MX_EGG_PAID:true}} },
  /* ---------- 1C-05 G5 子晴、芷若同一天畢業（2028-06-03；高子晴_角色企劃 Q13＋AA_13 G5）。上午椰林大道（6/2 21:00 子晴邀約回了「去。」）；和子晴交往中先演 BB_119 1c-2 ---------- */
  { id:'ev_zq_zr_graduation', title:'子晴、芷若的畢業典禮', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'畢業典禮的椰影大道',bg:'graduation_avenue'},
      {if:{custom:dating('heroine_04')},speaker:'heroine_04',text:'欸不是，你站過來一點。'},
      {if:{custom:G=>dating('heroine_04')(G)&&typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY.cg_crooked_cap_heroine04},cg:'cg_crooked_cap_heroine04'},   /* BCG-26（cg_approved/ README：放在「我們兩個。」，CG 就是那張自拍）*/
      {if:{custom:dating('heroine_04')},speaker:'heroine_04',text:'我們兩個。'},   /* BB_119 1c-2 */
      {speaker:null,text:'（子晴穿著學士服，學士帽歪的，吉他袋還是背著。她在幫芷若拍照，拍了二十張。）'},
      {speaker:'heroine_04',text:'妳閉眼了啦。再一張。'},
      {if:kn('heroine_02'),speaker:'heroine_02',text:'妳拍歪了。'},
      {speaker:'heroine_04',text:'（把手機塞給你）你拍我們兩個。'} ],
    consequences:{memo:'子晴、芷若的畢業典禮（椰影大道）'},
    after:G=>{ const F=G.flags; F.GRAD_ZQ_ZR=F.GRAD_ZQ_ZR==='zr'||F.GRAD_ZQ_ZR==='both'?'both':'zq'; } },
  /* 下午：芷若 Z12（6/3 14:00 以後第一次進 Café；和她 FAMILIAR 以上）。記 IMPORTANT_CONVERSATION（她的志向，放電影）*/
  { id:'ev_zhiruo_graduation_cafe', title:'芷若的畢業', participants:['heroine_02'], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>{ const g=G1(); return !!g&&g.zrCafeDue(G); }},
    dialogue:[ {speaker:'heroine_02',text:'我七月先回台中，去影印店幫忙一個月。'},   /* AA_377 第 11 項：她 7/1～8/1 在台中 */
      {speaker:'heroine_02',text:'九月，我去英國念電影研究。一年。'},
      {speaker:'heroine_02',text:'回來以後，我想在台灣放電影。不是拍，是放。像二輪戲院那種，小小的就好。'},
      {speaker:'heroine_02',text:'我想讓我媽知道，我走之前有回去。'},
      {mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她的志向，放電影'}]},
      {choice:[{text:'「台中的影印店，我可以去印東西嗎？」',goto:'a'},{text:'「妳媽一定很開心。」',goto:'b'},{text:'「明信片還要寄嗎？」',goto:'c'}]},
      {label:'a'},{speaker:'heroine_02',text:'很遠耶。……好啊，算你便宜。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',text:'……嗯。她說她要學著用視訊。'},{goto:'end'},
      {label:'c'},{speaker:'heroine_02',text:'要。這次換你先寄。'},
      {label:'end'} ],
    after:G=>{ const F=G.flags; F.GRAD_ZQ_ZR=F.GRAD_ZQ_ZR==='zq'||F.GRAD_ZQ_ZR==='both'?'both':'zr'; } },
  /* ---------- 1C-06 大四下開學第一頓（2029-02-22 19:00 麵店；AA_181 第 4 節）：17:00 阿哲把群組改名「最後一學期」並揪；2/25 21:00 改回來 ---------- */
  { id:'ev_last_term_first_dinner', title:'最後一學期的開學第一頓', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（長桌。阿姨看到你們，說了一句「又一年」，就轉身去煮了。）'},
      {if:kn('yu'),speaker:'yu',text:'群組名字是誰改的。'},
      {if:kn('yu'),speaker:'zhe',text:'我。'},
      {if:kn('yu'),speaker:'yu',text:'改回來啦。很難過耶。'},
      {if:kn('yu'),speaker:'zhe',text:'……過幾天再改。'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'（看著菜單）最後一學期，還是點一樣的。'},
      {choice:[{text:'「一樣的。」',goto:'a'},{text:'「今天換一個。」',goto:'b'}]},
      {label:'a'},{speaker:null,text:'（阿姨沒有問，已經在煮了。）'},{goto:'end'},
      {label:'b'},{speaker:'阿姨',text:'換什麼換。'},{speaker:null,text:'（她還是煮了你平常那一碗。）'},
      {label:'end'},{speaker:null,text:'（大家吃完，沒有人先站起來。）'} ],
    consequences:{flags:{LAST_TERM_DINNER:'went'},memo:'最後一學期的開學第一頓（麵店）'},
    outingMissed:G=>{ const g=G1(); if(g) g.lastTermPhoto(G); } }
  ];
})();
Array.prototype.push.apply(STORY_EVENTS,GROUP_EVENTS);
