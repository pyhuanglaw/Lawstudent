/* ===== 法律系同學二十位（pool）：地點、樣子、一句話＋第一批五位的台詞與事件（AA_498，企劃線 33189103b；任務 NPC-STORY-1028、USER_WANTS X119）=====
   AA-C 2026-10-28 定稿（D109，第②級）。台詞、旁白、選項、手機訊息照稿一字不差；系統（地點、時段、條件、數值、手機上限）在 src/pool3d.js。
   - PEOPLE：第 3 節的表（二十位）：常在哪裡、幾點（作息 where，格式同 characters.js 的 daily_schedule）、認識前的外觀描述（desc）、人物頁一句話（card）、personality、
     固定的路人底模（model：LAWWW2 的路人底模，每人一個、二十位不重複；照第 3 節的外觀挑最接近的，LAWWW2 之後可以換）、現成的道具（props：character3d.js 的 PROPS，沒有的列給 LAWWW2）、
     ev_pool_greet 的「在〈他的地點〉看過」（place；有兩個地點的人，在那一筆作息寫 greetAt：邱家齊的總圖門口、馬佳蓉的社團博覽會）。
     地點對不到一模一樣的，用最近、走得到的位置（Node 建區域量過 E.canStand＋從出生點走得到；見各列的註解）。
   - LINES：第 4～8 節第一批五位（曾靖雯 pool_7、黃郁婷 pool_4、林采潔 pool_1、鄭元碩 pool_6、邱家齊 pool_3）：
     認識、閒聊（talk：{t,when}）、之後的招呼（greet）、秘密、順手的事、他的線、邀你、結局、錯過和不在。
     場景是 EVENTS.runLines 的格式（{speaker,text}、{choice}、{label}、{goto}、{meet}…）；手機訊息是字串。
   - 舊名（第 1 節）：RENAME；SQ16 借車名單的兩個名字在 src/sideq3d.js。
   測試：node tests/aa498_pool_unit.js（每一句都在稿裡、一字不差） */
'use strict';
const POOL_STORY=(function(){
  const N=t=>({speaker:null,text:t});            /* 旁白 */
  const by=id=>t=>({speaker:id,text:t});          /* 某個人說 */
  const L=label=>({label}), GO=label=>({goto:label}), MEET=id=>({meet:id});
  const Z='pool_7', Y='pool_4', C='pool_1', YS='pool_6', Q='pool_3';
  const z=by(Z), y=by(Y), c=by(C), ys=by(YS), q=by(Q);
  const P=Math.PI;
  /* 作息的共用條件（EVENTS.cond 的 custom）：晴天（G.weather 'clear'；陰天 cloudy、雨天、颱風都不算）、法服值班的週六（STORY.fafuDuty） */
  const SUNNY={custom:G=>!G.weather||G.weather==='clear'};
  const FAFU={custom:G=>typeof STORY!=='undefined'&&!!STORY.fafuDuty&&STORY.fafuDuty(G)};
  const WD=[1,2,3,4,5], ALL=[0,1,2,3,4,5,6];
  /* 吉他社今天有社課（activities.js club_guitar；AA_528 1-3：晨希那一段在吉他社，萬才館旁邊那一格只在沒課的時候）*/
  const NO_GUITAR={custom:G=>{ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.list||!ACTIVITIES.on) return true; const a=ACTIVITIES.list.find(x=>x.id==='club_guitar'); return !(a&&ACTIVITIES.on(a,G.day,G)); }};

  /* ---------- 第 1 節 改名（撞到主要人物）：讀檔時換字（src/pool3d.js 的 POOL.migrate）---------- */
  /* 舊名寫成 \u 跳脫（舊名在 src/ 裡只剩這張換字表；tests/aa498_pool_unit.js 用 grep 查沒有殘留）：邱○○→邱家齊、鄭○○→鄭元碩、施○○→施孟儒、詹○○→詹立群、嚴○○→嚴守誠、杜○○→蘇維倫 */
  const RENAME={pool_3:['\u90b1\u67cf\u52f3','邱家齊'],pool_6:['\u912d\u51f1\u6587','鄭元碩'],pool_12:['\u65bd\u51a0\u5b87','施孟儒'],pool_16:['\u8a79\u54f2\u744b','詹立群'],pool_18:['\u56b4\u5b50\u5b89','嚴守誠'],pool_19:['\u675c\u5b87\u6046','蘇維倫']};
  /* AA_527 1-7（企劃線 bfede0a62）：pool_19 又從「蘇\u627f\u6069」改「蘇維倫」（撞到使用者刪掉的直屬學弟，口氣表 0-3）——舊存檔裡存下的這個名字也換（寫成 \u 跳脫；邀約那一句只寫名字的「陪○○」一起換）*/
  const RENAME_MORE=[['\u8607\u627f\u6069','蘇維倫'],['\u966a\u627f\u6069','陪維倫']];

  /* ---------- 第 3 節 二十位的地點、樣子、一句話 ----------
     where 的每一筆：days、from、to、zone、act（sit／read／linger／wander）、at／seat／seatAt／near、noHoliday（上課期間、國定假日不算）、desc（在這裡的外觀描述）、label（人物線索的字）。
     cls：必修課（story3d.js 的 S.classmateClass，和以安、阿哲同一套：祐廷那一堂必修正在上＝人在那間教室）——seat 第幾排第幾個（霖澤館 201 有排；其他教室沒有排＝一般座位）、door＝上課前 10 分鐘在門口。
     model：路人底模（ASSETS 的 char.npc_nf*／nm*，第 3 節的外觀挑最接近的）；props：現成的道具（props3d.js；沒有的列在回報「給 LAWWW2」）。*/
  const PEOPLE={
    pool_1:{ card:'在寫一篇兇手是律師的推理小說', before:'常在舊路書房看推理小說的同學', personality:'嘴上說「你不要猜」，其實很想有人看她寫的東西', place:'舊路書房',
      model:'char.npc_nf17', props:['tote','novel'],   /* 布書袋＝tote；封面朝內的推理小說＝novel（NPC-POOL-ART-1028）；鯊魚夾沒有（髮型配件，D99）*/
      where:[ {days:WD,from:13,to:17,zone:'bookstore',act:'linger',at:[-3.2,0.5,-P/2,0],noHoliday:true,desc:'蹲在書架前找書的女生',label:'舊路書房，找書'} ],   /* 稿寫「溫州街舊路書房」：遊戲裡舊路書房在公館（zones3d.js gongguan 的店面街 → bookstore）。西側兩排書架中間，面向牆邊的書架（蹲下的動作沒有，站著找）*/
      cls:{seat:[2,1],desc:'坐第三排的人'} },
    pool_2:{ card:'雙主修財金，在學日文', personality:'修太多學分的人', place:'總圖',
      model:'char.npc_nm11', props:['calc','handouts'],   /* 計算機＝calc（左手）；一疊財金的講義＝handouts（右手，NPC-POOL-ART-1028）*/
      where:[ {days:WD,from:10,to:17,zone:'library_hall',act:'read',noHoliday:true,desc:'常在圖書館的男生',label:'總圖二樓自習區'} ] },
    pool_3:{ card:'台南人，媽媽常寄虱目魚丸', personality:'什麼都拿來跟台南比，其實很想家', place:'宿舍的交誼廳',
      model:'char.npc_nm7', props:['cooler_bag'],   /* 保冷袋＝cooler_bag（NPC-POOL-ART-1028；坐下時藏）；藍白拖沒有（鞋子＝衣服，D99）*/
      where:[ {days:[0,2,4],from:21,to:23,zone:'dorm_hall',act:'linger',at:[6.9,6.3,0,0],noHoliday:true,desc:'把冰箱塞滿的學長',label:'男一舍交誼廳'},   /* 週日最多：週日、週二、週四（8-3 的開口在週四晚上）。交誼廳沒有冰箱：站在販賣機、飲水機那一角（冰箱的實體物件列給 LAWWW2）*/
        {days:WD,from:12,to:13,zone:'campus',act:'linger',at:[79,-4.5,P/2,0],noHoliday:true,desc:'在總圖門口講電話的男生',label:'總圖門口，講電話',greetAt:'總圖門口'} ] },   /* 校園的總圖門口（「進入總圖書館」(86.4,0) 西南邊）*/
    pool_4:{ card:'班代，系學會活動組', personality:'什麼都要數一遍，數完才放心', place:'教室門口',
      model:'char.npc_nf15', props:['folder'],   /* 夾板＝folder（手上的資料夾）；系學會外套沒有 */
      where:[ {days:[3],from:12+10/60,to:12+40/60,zone:'classroom',act:'linger',at:[1.2,6.9,-1.2,0],terms:['Y1S1'],weeks:[7],noHoliday:true,pri:true,door:true,desc:'總是最後進教室的人',label:'教室門口'},   /* 5-3：期中考前一週的週三下課（大一上第 7 週週三，刑總 9:10～12:10 在霖澤館 201）在教室門口 */
        {days:[1],from:8,to:18,zone:'linze',act:'linger',at:[4.4,1.6,P/2,0],terms:['Y2S1'],weeks:[1],noHoliday:true,desc:'拿著點名板的女生',label:'法律系館A一樓，迎新'} ],   /* 5-5：大二上第 1 週週一在霖澤館一樓（沒有聯絡方式的當面問）*/
      cls:{door:true,seat:[5,0],desc:'總是最後進教室的人'} },   /* 上課前 10 分鐘在教室門口（霖澤館 201 的後門口；其他教室沒有門口的站位＝直接坐）、上課時坐最後一排（表上只寫門口：她是同班同學，上課照樣在）*/
    pool_5:{ card:'吉他社，怕蟑螂', personality:'', place:'兩點半 Café',
      model:'char.npc_nf9', props:['folder'],   /* 抱著一疊講義＝folder；撥片鑰匙圈沒有 */
      where:[ {days:ALL,from:11,to:17,zone:'cafe',act:'read',noHoliday:true,desc:'抱著一疊講義的女生',label:'兩點半 Café'} ] },
    pool_6:{ card:'系上活動的照片都是他拍的', personality:'照片裡從來沒有他自己', place:'椰影大道',
      model:'char.npc_nm9', props:['camera_film'],   /* 底片相機＝camera_film（背帶照這個底模量過，換底模要重量；NPC-POOL-ART-1028）；格子襯衫沒有（衣服，D99）*/
      where:[ {days:[1,2,3],from:12,to:13,zone:'campus',act:'linger',at:[33,-112,0,0],terms:['Y2S2'],weeks:[15],noHoliday:true,pri:true,desc:'脖子上掛相機的學長',label:'法律系館A穿堂，展覽'},   /* 7-4 展覽那三天 12～13 點在霖澤館一樓穿堂（校園的穿堂，地坪 0.9 m）*/
        {days:ALL,from:16,to:17.5,zone:'campus',act:'linger',at:[-10,0.8,P/2,0],noHoliday:true,if:SUNNY,desc:'脖子上掛相機的學長',label:'椰影大道，拍照'} ] },   /* 椰林大道中間的黃色虛線旁邊 */
    pool_7:{ card:'每天六點在晨思鐘旁邊吃早餐的同學', personality:'想當律師，還不知道要幫誰', place:'晨思鐘旁邊',
      model:'char.npc_nf2', props:['tote','thermos_silver','thermos_bench'],   /* 短髮＝黑色鮑伯頭的底模；帆布包＝tote（右肩）；銀色保溫瓶＝thermos_silver（左手，坐下時藏）；坐在傅鐘長椅時放在身旁＝thermos_bench（pool3d.js afterSpawn 開，NPC-POOL-ART-1028）*/
      where:[ {days:ALL,from:6,to:7.5,zone:'campus',act:'sit',seat:'bell',dates:[['2029-06-02','2029-06-02']],pri:true,desc:'晨思鐘旁邊吃早餐的人',label:'晨思鐘旁邊，最後一次'},   /* 4-4、4-6：畢業典禮當天 06:00～07:30 */
        {days:WD,from:6.5,to:7+40/60,zone:'campus',act:'sit',seat:'bell',noHoliday:true,desc:'晨思鐘旁邊吃早餐的人',label:'晨思鐘旁邊，吃早餐'},   /* 傅鐘旁的長椅（和 Alison 9:30 以後坐的同一張，時間不重疊）*/
        {days:[6],from:9,to:12,zone:'wancai',act:'linger',at:[-2.0,1.8,P/2,0],terms:['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'],if:FAFU,desc:'坐第一排正中間的女生',label:'法律系館B一樓，法服值班'} ],   /* 4-4：大二起隔週六 9～12 法服值班（和馬佳蓉；STORY.fafuDuty 的週六），圓桌旁 */
      cls:{seat:[0,4],desc:'坐第一排正中間的女生'} },
    pool_8:{ card:'辯論社，永遠當計時', personality:'', place:'椰影大道',
      model:'char.npc_nm13', props:['backpack'],   /* 計時器掛在背包上：背包有，計時器沒有 */
      where:[ {days:WD,from:12,to:13,zone:'campus',act:'wander',near:[-40,0],noHoliday:true,desc:'走路很快的男生',label:'椰影大道'} ] },
    pool_9:{ card:'喜歡聽 podcast', personality:'', place:'總圖',
      model:'char.npc_nf7', props:[],   /* 耳機一邊戴一邊不戴沒有 */
      where:[ {days:WD,from:13,to:17,zone:'library',act:'read',seatAt:[5.6,-3.9],noHoliday:true,desc:'坐窗邊的人',label:'總圖三樓，窗邊'} ] },   /* 閱覽室（3F）的窗在後牆（z −8）：最靠窗那一排的位子 */
    pool_10:{ card:'助教的學弟，想做研究', before:'常在總圖問助教問題的同學', personality:'', place:'總圖',
      model:'char.npc_nm1', props:['notebook_q'],   /* 寫滿問題的筆記本＝notebook_q（NPC-POOL-ART-1028）*/
      where:[ {days:WD,from:14,to:16,zone:'library',act:'read',noHoliday:true,desc:'常跟助教說話的男生',label:'總圖，陳助教旁邊那一桌'} ] },   /* 陳助教平日 14～18 在閱覽室（npc_ta_chen 的作息）；SOCIAL_GRAPH pool_10—npc_ta_chen＝坐她旁邊的位子（story3d.js 的 friendSeat）*/
    pool_11:{ card:'吉他社，和弦換不過去', before:'背吉他袋的學姊', personality:'', place:'法律系館B旁邊',
      model:'char.npc_nf8', props:['guitar'],   /* 吉他袋＝guitar（掛法是子晴模型以外的預設值，還沒看畫面）*/
      where:[ {days:[1,3],from:19,to:21,zone:'wancai',act:'club',activity:'club_guitar',desc:'背吉他袋的女生',label:'法律系館B，吉他社社課'},   /* AA_528 1-3（企劃線 7ad5fee84）：吉他社有課的時間她在吉他社（同一個時段原本也站在萬才館旁邊）*/
        {days:[1,3],from:19,to:21,zone:'campus',act:'linger',at:[97.5,-95,P,0],noHoliday:true,if:NO_GUITAR,desc:'背吉他袋的女生',label:'法律系館B旁邊'} ] },   /* 萬才館旁邊那一格只在吉他社沒課的時候 */
    pool_12:{ card:'系籃經理', personality:'', place:'籃球場',
      model:'char.npc_nm5', props:['sports_drink'],   /* 運動飲料＝sports_drink（坐下時藏，NPC-POOL-ART-1028）；系服沒有（衣服，D99）*/
      where:[ {days:[5],from:17,to:19,zone:'campus',act:'linger',at:[2.6,-114.5,-P/2,0],noHoliday:true,desc:'總是穿系服的人',label:'映月湖東側的籃球場'} ] },   /* 系籃球場 (−4,−113) 東邊的長椅旁，面向場內 */
    pool_13:{ card:'廣播社', personality:'', place:'椰影大道',
      model:'char.npc_nf10', props:['recorder'],   /* 錄音筆＝recorder（NPC-POOL-ART-1028）*/
      where:[ {days:WD,from:12,to:13,zone:'campus',act:'wander',near:[-60,0],noHoliday:true,desc:'聲音很好聽的女生',label:'椰影大道，找人訪問'} ] },
    pool_14:{ card:'腳踏車社', personality:'', place:'校園',
      model:'char.npc_nm17', props:['backpack','helmet'],   /* 安全帽＝helmet（掛在後背包右側：沒有後背包時會浮在背後，NPC-POOL-ART-1028 補 backpack）；公路車（騎士）沒有接：遊戲裡騎車的路人（GM.extras 的騎士）不能說話，先站在總圖東側的停車架旁 */
      where:[ {days:WD,from:8,to:18,zone:'campus',act:'linger',at:[47.5,-14.4,0,0],noHoliday:true,desc:'騎腳踏車超快的男生',label:'校園，停車架旁'} ] },   /* 表上沒寫時間：照上課時間 */
    pool_15:{ card:'在哲學系旁聽，和沛珊同一堂', personality:'', place:'文學院',
      model:'char.npc_nf16', props:['folder'],   /* 哲學系的講義＝folder */
      where:[ {days:WD,from:13,to:16,zone:'campus',act:'sit',seatAt:[-25,-12.94],noHoliday:true,desc:'很會問問題的女生',label:'文學院前的長椅'} ] },   /* 文學院（大道北側 −38,−34）前面、大道上的長椅 */
    pool_16:{ card:'宥辰的朋友，背法條用唱的', before:'常幫人搬音響的同學', personality:'', place:'公館',
      model:'char.npc_nm14', props:['audio_cable'],   /* 音源線＝audio_cable（坐下時藏，NPC-POOL-ART-1028）*/
      where:[ {days:[5],from:20,to:24,zone:'gongguan',act:'linger',at:[55.6,20.5,P,0],noHoliday:true,desc:'幫人搬音響的男生',label:'公館，二手唱片行的騎樓'} ] },   /* 宥辰放歌的那間 bar 遊戲裡沒有：店面街「二手唱片」的騎樓 */
    pool_17:{ card:'筆記王', personality:'', place:'總圖',
      model:'char.npc_nf5', props:['folder'],   /* 一疊用迴紋針夾好的筆記＝folder */
      where:[ {days:WD,from:19,to:22,zone:'library_b1',act:'read',noHoliday:true,desc:'筆記借人看的人',label:'總圖 B1'} ] },
    pool_18:{ card:'夜貓，刑法很強', personality:'', place:'總圖',
      model:'char.npc_nm10', props:[],   /* 外套蓋在頭上（趴著睡）的動作沒有：坐著讀書 */
      where:[ {days:WD,from:13,to:15,zone:'library',act:'read',noHoliday:true,desc:'愛睡覺的男生',label:'總圖三樓'} ] },
    pool_19:{ card:'去社工系旁聽，週末當志工', personality:'', place:'社科院',
      model:'char.npc_nm8', props:['folder'],   /* 社工系的講義＝folder */
      where:[ {days:WD,from:10,to:12,zone:'soclib',act:'read',noHoliday:true,desc:'講話很小聲的男生',label:'社科院'} ] },   /* 社會科學院一樓遊戲裡沒有室內：社科院圖書館（社科院裡面的區域）*/
    pool_20:{ card:'法服幹部，管器材', personality:'', place:'法律系館B一樓',
      model:'char.npc_nf18', props:['lanyard_tag'],   /* 法服的名牌＝lanyard_tag（掛繩照這個底模量過，NPC-POOL-ART-1028）；延長線沒有 */
      where:[ {days:ALL,from:0,to:24,zone:'campus',act:'linger',at:[-50,11.25,P,0],activity:'club_expo_y1s1',actHours:true,pri:true,desc:'法服攤位那個人',label:'社團博覽會，法服的攤位',greetAt:'社團博覽會'},   /* 法服帳篷（−47.5,13.5）前，學姊的西邊 */
        {days:[6],from:9,to:12,zone:'wancai',act:'linger',at:[1.9,1.6,-P/2,0],if:FAFU,fafuDuty:true,desc:'法服攤位那個人',label:'法律系館B一樓，法服值班'} ] }   /* fafuDuty：認識的入口（AA_528 1-2，src/pool_more3d.js MEETV 的 meetDuty）*/   /* 隔週六 9～12（STORY.fafuDuty）：圓桌旁 */
  };

  /* ---------- 第 4～8 節 第一批五位 ---------- */
  const LINES={
    /* ===== 第 4 節 曾靖雯 ===== */
    [Z]:{
      meetBell:[ N('（長椅上一個女生，膝蓋上攤著飯糰的包裝紙，旁邊一個銀色的保溫瓶。）'), z('早安。'), z('……你也是法律系的吧？民總，你坐我後面幾排。'), MEET(Z), z('我叫曾靖雯。你這麼早起來做什麼？'),
        {choice:[{text:'「睡不著。」',goto:'a'},{text:'「想看看早上的校園。」',goto:'b'},{text:'「……剛好路過。」',goto:'c'}]},
        L('a'), z('那你明天也睡不著的話，這張長椅分你一半。'), GO('e'), L('b'), z('對吧。六點半以前，椰影大道上只有掃地的阿伯跟我。'), GO('e'), L('c'), z('六點半剛好路過晨思鐘？……好，我不問。'), L('e') ],
      meetClass:[ N('（第一排正中間的女生回過頭。）'), z('早安。……對，下午了。我習慣這樣說。'), MEET(Z), z('我叫曾靖雯。你坐哪裡？'), N('（你指了一下後面。）'), z('那邊聽得到老師嗎？這間的麥克風，後面幾排會有回音。') ],
      talk:[ {t:'「我六點就到晨思鐘旁邊吃早餐了。那時候的校園很安靜，你應該來看一次。」',when:'met'}, {t:'「早起的祕訣是早睡。……好，我知道這不算祕訣。」',when:'met'},
        {t:'「以安每次都比我早到一點點。我開始懷疑她住在教室裡。」',when:'metAn'}, {t:'「民總講到意思表示那天，我寫了三頁。回去看，只看得懂第一頁。」',when:'Y1S1'},
        {t:'「我上禮拜自己去地方法院旁聽了。坐最後一排，沒有人趕我。」',when:'Y1S2noCourt'}, {t:'「法服值班的時候，佳蓉負責倒水，我負責記。我寫字很快，這件事終於有用了。」',when:'Y2+'},
        {t:'「實習要填志願了。我把法扶寫第一個，寫完看了很久。」',when:'Y3S1'}, {t:'「晨思鐘旁邊那家飯糰，四年漲了兩次。我都有發現。」',when:'Y4'} ],
      greet:['「早安。」','「今天的飯糰是鮪魚的。不好吃。」','（她舉了一下保溫瓶，算是打招呼。）'],
      /* 4-3 順手的事：陪她去旁聽 */
      ask:[ z('我想去地方法院旁聽。網站上說誰都可以進去，可是我一個人……有點不敢走進去。'), z('你哪天下午沒課？') ],   /* AA_498「實作時定的」第 3 點（56ed354e9）：大一下平日每天早上都有課，改下午 */
      askOpts:['「我跟妳去。」','「我那幾天都有事。」'], askYes:[ z('好。那我們加一下好友。') ], askNo:[ z('沒關係，我再找找看。') ],
      courtEve:'明天兩點，法院門口。早安先說了，我明天會很緊張。',
      court:[ {scene:'臺北地方法院',bg:'court_hall'}, N('（法院的走廊很長，椅子上坐著等開庭的人。有個人拿著一疊資料，一直在看錶。）'), z('（小聲）我們進這一間。公告上寫的是竊盜。'),
        N('（法庭比你想的小。被告坐在左邊，旁邊沒有律師。）'), N('（法官問他還有沒有要說的。他想了很久，說：「我以後不會了。」）'), N('（走出法庭。）'), z('他旁邊沒有人。'),
        {unless:{custom:G=>!!(G.flags&&G.flags.ZJW_HELP)},goto:'ask'}, GO('end'),   /* 已經說過秘密（舊存檔「沒選」、或沒去旁聽那條路說過）：不重問（2-10）*/
        L('ask'), z('……其實我想當律師。可是我還不知道要幫誰。'), z('如果是你，你會想幫他嗎？'),
        {choice:[{text:'「會。」',set:{ZJW_HELP:'yes'},goto:'a'},{text:'「要看他做了什麼。」',set:{ZJW_HELP:'depends'},goto:'b'},{text:'「我不知道。」',set:{ZJW_HELP:'unknown'},goto:'c'}]},
        L('a'), z('嗯。我也會。……可是我剛剛只是坐在那裡。'), GO('end'), L('b'), z('你講話好像法官。……可是你說得對，我們連他做了什麼都還沒聽完。'), GO('end'), L('c'), z('我也是。……走吧，我請你喝豆漿。法院旁邊應該有一家。'), L('end') ],
      deedCourt:'陪她去過地方法院旁聽',
      /* 沒去旁聽的：大一下第 12 週起，在傅鐘說秘密 */
      secret:[ z('其實……我想當律師。可是我還不知道要幫誰。你呢？'),
        {choice:[{text:'「幫需要的人。」',set:{ZJW_HELP:'yes'},goto:'a'},{text:'「先幫自己吧。」',set:{ZJW_HELP:'self'},goto:'b'},{text:'「我不知道。」',set:{ZJW_HELP:'unknown'},goto:'c'}]},
        L('a'), z('需要的人很多。……好，那我先從法服那邊開始找。'), GO('e'), L('b'), z('你很誠實。大部分的人大概都是這樣開始的。'), GO('e'), L('c'), z('那我們兩個一起不知道。比一個人不知道好一點。'), L('e') ],
      /* 4-4 她的線 */
      fafuJoin:'早安。我加入法服了。佳蓉說新人第一個月只能倒水。',
      dutyList:'（值班表上，她的名字排在你下面那一週。）',
      y3q:'實習志願我第一個寫法扶，第二個是律所。你覺得我會後悔嗎？',
      y3Opts:[['不會。','好。那我不改了。'],['後悔也來得及改。','……那我先不改，後悔再說。'],['妳自己覺得呢？','我覺得不會。我只是想聽別人說一次。']],
      gradEve:'早安。明天畢業典禮。我六點會在晨思鐘，最後一次。',
      gradMiss:['（照片：空的長椅）','早安。'],
      /* 4-5 邀你 */
      invite:[ z('法服週六缺一個記錄的人。你要不要來看一次？') ], inviteOpts:['「好。」','「我再想想。」'], inviteNo:[ z('好。我們每兩個禮拜都在，想來就來。') ],
      /* 4-6 最後一場 */
      last:[ N('（她坐在長椅上，旁邊放著兩個飯糰。）'), z('早安。……我多買了一個，猜你會來。'),
        {if:{custom:G=>(G.flags||{}).ZJW_HELP==='yes'},speaker:Z,text:'畢業以後先考試。考上的話，我想去法扶。先說好，你不要笑。'},
        {if:{custom:G=>(G.flags||{}).ZJW_HELP==='depends'},speaker:Z,text:'你說要看他做了什麼。我後來每一次旁聽，都先把那個人做了什麼聽完。……考上以後，我想去法扶。'},
        {if:{custom:G=>(G.flags||{}).ZJW_HELP==='self'},speaker:Z,text:'我投了兩間事務所的實習。先讓自己站穩，之後再說幫誰。……是你說的。'},
        {unless:{custom:G=>['yes','depends','self'].includes((G.flags||{}).ZJW_HELP)},speaker:Z,text:'我還是不知道要幫誰。可是我會一直找下去。'},
        z('好了。……再見。這次不說早安了。') ],
      /* 4-7 錯過、不在 */
      abroad:'早安。你那邊幾點？我這邊六點。晨思鐘的長椅換新的了。',
      y5:'早安。你今年還在學校，幫我看一下那張長椅還在不在。' },

    /* ===== 第 5 節 黃郁婷 ===== */
    [Y]:{
      meet:[ N('（教室門口，一個綁馬尾的女生拿著夾板，邊看邊點頭。）'), y('等一下——你也是我們班的？我數一下。……好，到齊了。'), MEET(Y), y('我是黃郁婷，班代。下禮拜要收班費，一學期兩百。'),
        {choice:[{text:'「現在給妳。」',goto:'a'},{text:'「班費要做什麼？」',goto:'b'},{text:'「下禮拜給。」',set:{YT_FEE_LATER:true},goto:'c'}]},
        L('a'), y('（在夾板上打了一個勾）好，你不用被我追了。'), GO('e'), L('b'), y('期末的飲料、印講義、有人生病的時候買水果。……還有我的點名板。這個是我自己買的，不算。'), GO('e'),
        L('c'), y('大家都說下禮拜。我會再提醒你一次，就一次。'), L('e') ],
      fee:'班費。', feeOpt:'（轉帳）', feeReply:'收到。',
      talk:[ {t:'「系學會又要辦活動了。你有什麼想玩的，可以跟我說。」',when:'Y1S2+'}, {t:'「活動組就是：大家在玩的時候，我在數人數。」',when:'Y1S2'},
        {t:'「阿哲揪人很快。我發一則公告沒人回，他在群組喊一聲，馬上就滿了。」',when:'metZhe'}, {t:'「點名的時候老師念錯三個人的名字。我一直很想舉手幫他改。」',when:'Y1S1'},
        {t:'「我升活動組長了。……意思是以後出錯都是我的錯。」',when:'Y2S1'}, {t:'「期末宵夜我訂多了。剩下的我帶回宿舍，吃到第二天。」',when:'Y2S2'},
        {t:'「我禮拜四晚上都在總圖 B1。書記官的書比民法還厚。」',when:'Y3secret'}, {t:'「采潔問我書記官每天在做什麼，說要寫進小說。我叫她不要把我寫成兇手。」',when:'Y4metCJ'} ],
      greet:['「我數一下。……好，你在。」','（她在夾板上打了一個勾，對你點頭。）','「明天的課改教室了，群組有說。」'],
      /* 5-3 順手的事：考前補給包 */
      ask1:[ y('明天系學會要在A館一樓發考前補給包。今天晚上要包八十包，人不夠。'), y('七點到九點，B館一樓。你有空嗎？') ],
      ask1Opts:['「我去幫忙。」','「我今天晚上有事。」'], ask1No:[ y('好，我去問阿哲。他一定會說好，然後帶三個人來。') ],
      pack:[ N('（長桌上一箱餅乾、一箱巧克力、一疊寫好的小卡。你負責放卡片。）'), y('卡片上寫的是學長姊的考前提醒。……不要偷看，看了會更緊張。'), N('（包到最後，她把每一包又數了一次。）'),
        y('我數一下。……八十。好，都在。'), y('謝啦。我們加一下好友，以後缺人我直接找你。') ],
      tableYes:'（郁婷從桌子後面抽出一包，塞到你手上。這包的卡片是她自己寫的：「第三題不會就先寫第四題。」）',
      tableNo:'（補給的桌子後面，阿哲在發餅乾，一邊發一邊說「一人一包，不要搶」。）',
      card:'「第三題不會就先寫第四題。」',   /* 房間物品「考前補給包的小卡」：稿沒有另外寫「看」的句子，用小卡上的字（tableYes 那一句裡的）*/
      /* 5-4 秘密 */
      secret:[ y('其實……書記官的考試科目，我偷偷查過了。你不要說出去。'),
        {choice:[{text:'「為什麼想當書記官？」',set:{YT_WHY:true},goto:'a'},{text:'「不考司法官嗎？」',set:{YT_JUDGE:true},goto:'b'},{text:'「我不會說。」',set:{YT_QUIET:true},goto:'c'}]},
        L('a'), y('法庭裡每一句話，都要有人記下來。我覺得那個人很重要。'), GO('e'), L('b'), y('大家都會這樣問。……我就是想坐在旁邊那個位子。'), GO('e'), L('c'), y('嗯。……那我就開始念了。'), L('e') ],
      /* 5-5 順手的事 2：迎新報到桌 */
      ask2:'禮拜三早上迎新的報到桌缺一個人。八點半到十點，坐著幫我對名單就好。', ask2Opts:['好。','那天早上我有課。'], ask2No:'好。我自己來。',
      desk:[ {scene:'法律系館A一樓'}, N('（報到桌前排了一長串新生。你負責找名字、打勾。）'), N('（一個新生小聲問：「學長，法律系是不是要背很多東西？」）'),
        {choice:[{text:'「要背。背完還要會用。」',goto:'a'},{text:'「不用怕，大家都背不完。」',goto:'a'},{text:'「問旁邊那個班代。」',goto:'b'}]},
        L('a'), N('（那個新生點點頭，拿了名牌走了。）'), GO('e'), L('b'), y('（頭也沒抬）要背。我數過，比高中多。'), L('e'),
        {if:{custom:G=>typeof POOL!=='undefined'&&POOL.met(G,Z)},speaker:null,text:'（七點半，靖雯提著一袋早餐來，放在報到桌上：「早安。給工作人員的。」）'},
        {if:{flags:['KV_HANDOVER']},speaker:null,text:'（排在隊伍中間的，是佳穎。她看到你，比你還緊張。）'},   /* AA_497 5-2 的 KV_HANDOVER（Kevin 交棒）：旁白，佳穎不說話（AA_497 第 8 節第 5 點：學妹改名，原本叫宜蓁）*/
        y('我數一下。……少一個。我去打電話。') ],
      /* 5-4 她的線 */
      y3:'我把活動組交出去了。從下禮拜開始，週四晚上我都在總圖 B1。',
      /* 5-6 結局（司法特考）*/
      pass:['上了。四等書記官。','榜單我數了三次。'],
      passJudge:'你大一問我為什麼不考司法官。現在可以回答你了：我想坐的就是這個位子。',
      passWhy:'你問過我為什麼。現在換我每天記下來了。',
      passQuiet:'這件事我只跟幾個人說過。你一直都沒說出去。',
      passOpts:[['恭喜。','收到。'],['書記官每天在做什麼？','打字。很多很多字。']] },

    /* ===== 第 6 節 林采潔 ===== */
    [C]:{
      meetTour:[ N('（導覽的學姊介紹完書庫，大家往下一區走。只有一個女生還站在推理小說那一排，手上拿著一本。）'), c('……這本的兇手，我猜到了。可是我還是要借。'),
        c('你也是法律系的吧？民總坐第三排的那個……不對，坐第三排的是我。'), MEET(C), c('我叫林采潔。你看推理小說嗎？'), {goto:'q'} ],
      meetBook:[ N('（書架前一個女生蹲著，在最下面一排找書。）'), c('你腳旁邊那本，可以遞給我嗎？'), N('（你遞給她。）'), MEET(C), c('謝謝。……你是我們班的。我叫林采潔，坐第三排。') ],
      meetClass:[ MEET(C), c('你是我們班的吧。我叫林采潔，坐第三排。你看推理小說嗎？'), {goto:'q'} ],   /* 6-6：大一上第 6 週起，必修課第三排 */
      meetQ:[ L('q'), {choice:[{text:'「看。」',goto:'a'},{text:'「很少。」',goto:'b'},{text:'「法律系的課本算嗎？」',goto:'c'}]},
        L('a'), c('那我們之後可以交換。先說好，借你的時候我不會告訴你兇手。'), GO('e'), L('b'), c('沒關係。念法律的人，遲早會看的。'), GO('e'), L('c'), c('算。兇手都寫在條文裡，只是要自己找。'), L('e') ],
      talk:[ {t:'「我在看一本推理小說，兇手是律師。……我還沒看完，你不要猜。」',when:'met'}, {t:'「總圖那一區的推理小說，我大概看完一半了。剩下那一半都被借走。」',when:'met'},
        {t:'「刑法老師舉例的時候，我都在想那個人後來怎麼了。老師都不說。」',when:'Y1S1'}, {t:'「舊路書房的老闆說，推理小說的二手書最好賣。大家看完就不想留，因為已經知道兇手了。」',when:'Y1S2'},
        {t:'「我寫的那篇卡在第三章：兇手的動機，連我自己都不信。……法律系的課，會教怎麼判斷動機嗎？」',when:'secret'}, {t:'「文學獎的截稿日是下個月。我現在每天晚上寫到兩點，早上的課都在補眠。」',when:'Y2S2'},
        {t:'「我把小說放到網路上了。看的人不多，有一個人每一章都留言。……是你嗎？」',when:'Y3'}, {t:'「第二本的兇手，我想寫成書記官。郁婷說不行，書記官很忙，沒時間殺人。」',when:'Y4metYT'} ],
      greet:['「你不要猜。」','（她把手上那本書的封面轉過去，不讓你看到書名。）','「今天那堂課，老師舉的例子可以寫成一篇。」'],
      secret:[ c('其實……我在寫一篇推理小說。') ],   /* 這裡不加選項，接上表「我寫的那篇卡在第三章」那句，再接 6-3 */
      /* 6-3 順手的事：第三章 */
      ask:[ c('我的第三章卡住了。兇手被抓到以後，在警察局自白。可是我不確定那個自白在法庭上能不能用。'), c('你可以幫我看一下嗎？只要看那一段。') ],
      askOpts:['「好，我看看。」','「我最近有點忙。」'], askYes:[ c('檔案傳給你。只看第三章，你不要往後翻……後面還沒寫，翻了也沒有。') ], askNo:[ c('好。那我去問刑訴老師。……她大概會叫我去看書。') ],
      /* 讀完（LEGAL_REVIEW_REQUIRED：刑事訴訟法第 156 條第 1 項，疲勞訊問取得的自白不得作為證據；台詞沒有寫條號）*/
      read:[ N('（你讀完那一段。警察整晚沒讓兇手睡，凌晨四點，他說出了一切。）'), c('怎麼樣？'),
        {choice:[{text:'「整晚不讓他睡，這個自白大概不能用。」',set:{CJ_ADVICE:'law'},goto:'a'},{text:'「動機那邊我不太信。」',set:{CJ_ADVICE:'motive'},goto:'b'},{text:'「寫得很好看，我想知道後面。」',set:{CJ_ADVICE:'praise'},goto:'c'}]},
        L('a'), c('……真的？'), N('（她從包包裡拿出法典，翻了很久。）'), c('「疲勞訊問」。上課聽過這四個字，寫的時候完全沒想到。'), c('那我要重寫。兇手要怎麼被定罪……我再想。'), GO('e'),
        L('b'), c('你也這麼覺得？……好，那我先改動機。自白的事我自己查。'), GO('e'), L('c'), c('後面還沒寫。……你這樣說，我今天晚上會寫到很晚。'), L('e') ],
      deedRead:'讀過她的第三章',
      /* 6-4 她的線 */
      night:['你睡了嗎。不用回。','我只是想跟一個醒著的人說，我寫完了。'],
      award:{law:['文學獎沒上。評審說「法律細節很紮實，可惜結局倉促」。','紮實的那一半，有你的份。'],motive:['文學獎沒上。評審說動機寫得很好，結局太快。','動機那裡，是你說不信，我才改的。'],other:['文學獎沒上。評審說結局太快。……我自己也知道。']},
      awardOpts:[['下一篇會更好。','下一篇的兇手我已經想好了。'],['結局要寫多久？','寫到我自己相信為止。']],
      abroad:'你那邊有推理小說的書店嗎？幫我看一下有沒有我們這邊沒翻譯的。拍封面就好。', abroadOpt:'（拍一張書架）', abroadJP:'這本！……算了，我看不懂日文。', abroadUS:'這本！……我看得懂英文，可是看很慢。',
      /* 6-5 印好的書 */
      book:[ N('（她從布書袋裡拿出一本很薄的書，封面寫著《第三章》。）'),
        {if:{custom:G=>typeof POOL!=='undefined'&&POOL.met(G,Y)},speaker:C,text:'印了五本。我媽、書房老闆、郁婷、你，最後一本我自己留著。'},
        {unless:{custom:G=>typeof POOL!=='undefined'&&POOL.met(G,Y)},speaker:C,text:'印了五本。'+'我媽、書房老闆、你，還有兩本我自己留著。'},   /* 沒認識郁婷：「那句換成」＝列名字的那一句（「印了五本。」留著：媽、老闆、你＋兩本自己的＝五本）*/
        c('第一頁先不要看結局。') ],
      bookLook:'（你翻到最後一頁，又翻回來。）', bookLookLaw:'（第三章裡，警察讓兇手睡了一晚。）' },

    /* ===== 第 7 節 鄭元碩 ===== */
    [YS]:{
      meet:[ N('（一個男生蹲在路中間的虛線旁邊，相機舉著，一動也不動。）'), ys('等一下——光。……好了。'), ys('抱歉，你剛好走進來。你是大一的吧？這張你在裡面，背影。'), MEET(YS),
        ys('我是鄭元碩，大三，法律系。系上活動的照片，十張裡有八張是我拍的。所以照片裡都沒有我。'),
        {choice:[{text:'「可以給我看嗎？」',set:{YS_PHOTO:true},goto:'a'},{text:'「下次我會繞開。」',goto:'b'}]},
        L('a'), ys('洗出來再給你。底片的，要等。'), GO('e'), L('b'), ys('不用繞。路上有人，照片才不會像明信片。'), L('e') ],
      talk:[ {t:'「椰影大道下午四點的光最好看。你下次經過可以看一下。」',when:'met'}, {t:'「家齊每次打電話回家都講台語。我聽不懂，可是聽得出來他很想回去。」',when:'metQJQ'},
        {t:'「底片一卷三十六張。我拍完一卷要一個月，一直捨不得按。」',when:'Y1S1'}, {t:'「映月湖那張，我拿去投比賽了。」',when:'Y1S2'},
        {t:'「上次那張映月湖的照片，我拿去投比賽。沒得獎，可是我很開心。」',when:'secret'}, {t:'「這學期是我最後一年。我還是一張自己在系上的照片都沒有。」',when:'Y2S1'},
        {t:'「家齊的箱子是我領的。冰箱開了一整晚才塞得進去。」',when:'qjqNo'} ],   /* 8-3 祐廷說「我週六不在。」以後多一句 */
      greet:['「等一下——光。……好，你可以走了。」','（他舉起相機對著你，沒有按，又放下來。）','「今天的雲很好。可惜我沒帶底片。」'],
      secret:[ ys('其實……我想當攝影師。'),
        {choice:[{text:'「那就去當啊。」',set:{YS_GO:true},goto:'a'},{text:'「先考完國考再說？」',set:{YS_SAFE:true},goto:'b'},{text:'「你拍的那張背影，我記得。」',if:{flags:['YS_PHOTO']},set:{YS_REMEMBER:true},goto:'c'}]},
        L('a'), ys('你講得好簡單。……可是被你這樣講，好像真的沒那麼難。'), GO('e'), L('b'), ys('我爸也這樣說。……你們講的都對，所以我才煩。'), GO('e'),
        L('c'), ys('……那張洗出來了。我一直忘了給你。'), N('（他從背包裡拿出一張照片：椰影大道，下午四點，一個人的背影。）'), L('e') ],
      photoLook:'椰影大道，下午四點，一個人的背影。',   /* 房間物品「元碩拍的背影」：稿沒有另外寫「看」的句子，用秘密那一場照片的內容（7-2 那句旁白冒號後面的字，一字不差；房間物品的旁白不一定加括號，例：舊《民法》）*/
      /* 7-3 順手的事：法律系的一天 */
      ask:[ ys('畢業前我想在A館的穿堂辦一個小展覽，主題是「法律系的一天」。'), ys('缺一個人當主角。從早上到晚上，不用看鏡頭。你哪個週六比較閒？') ],
      askOpts:['「我可以。」','「那陣子我很忙。」'], askNo:[ ys('好。那我找家齊。他很閒，可是一直看鏡頭。') ],
      day:[ {scene:'晨思鐘'}, N('（早上七點，晨思鐘。你坐在長椅的一頭，他蹲在遠遠的地方。）'),
        {if:{custom:G=>typeof POOL!=='undefined'&&POOL.met(G,Z)},speaker:null,text:'（長椅另一頭有人說了一聲「早安」——是靖雯。）'},
        {scene:'法律系館A・穿堂'}, N('（中午，法律系館A的穿堂。光從另一頭照進來。你什麼都不用做，走過去就好。）'),
        {scene:'阿鳳麵店'}, {if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:null,text:'（傍晚，麵店。阿哲在你對面吃第二碗。）'},   /* 麵店團的（PHONE 的 noodle_team 群組）*/
        ys('不要看鏡頭，繼續吃。'),
        {scene:'總圖門口'}, N('（晚上，總圖門口。他把相機放下來。）'), ys('最後一張了。謝啦。'), {set:{YS_MODEL:true}} ],
      /* 7-4 展覽（霖澤館一樓穿堂：只有旁白，不用新美術）*/
      expo:[ N('（穿堂的牆上貼了一排黑白照片，標題寫著「法律系的一天」。）'),
        {if:{flags:['YS_MODEL']},speaker:null,text:'（照片裡的人是你：晨思鐘的早上、穿堂的中午、麵店的傍晚、總圖的晚上。每一張都只拍到你的背影或側臉。）'},
        {unless:{flags:['YS_MODEL']},speaker:null,text:'（照片裡的人是邱家齊。每一張，他都在看鏡頭。）'},
        {if:{flags:['YS_PHOTO']},speaker:null,text:'（最後一張是大一那年，椰影大道下午四點，一個走進鏡頭的背影。）'},
        {if:{custom:(G,GM)=>typeof POOL!=='undefined'&&POOL.here(YS)},speaker:YS,text:'展覽的照片，還是沒有我。……這樣剛好。'} ],
      /* 畢業以後（各一則）*/
      y3:{go:['我在一間攝影工作室當助理。每天幫別人拍最重要的那一天。國考明年再說。'],safe:['補習班。國考還有半年。相機放在書桌上，每天都看得到。'],none:['（照片：一張書桌，桌上一台相機和一疊考古題）']},
      y4:['（照片：椰影大道，下午四點）','路過。光還是一樣。'] },

    /* ===== 第 8 節 邱家齊 ===== */
    [Q]:{
      meet:[ N('（交誼廳的桌上放著一個保冷袋，一個男生正把一包一包冷凍的東西塞進冰箱。冰箱已經滿了。）'), q('學弟，你那層的冰箱還有位子嗎？……我媽又寄了。'), MEET(Q), q('我是邱家齊，大三，法律系，台南人。'),
        {choice:[{text:'「我那層應該有。」',set:{QJQ_FISH:true},goto:'a'},{text:'「這是什麼？」',set:{QJQ_FISH:true},goto:'b'}]},
        L('a'), q('好人。三包放你們那層，一包給你。'), GO('e'), L('b'), q('虱目魚丸。我們台南的。……你沒吃過？那你今天先拿一包。'), L('e') ],
      fish:'（虱目魚丸。袋子上用麥克筆寫著「家齊」。）',
      talk:[ {t:'「台北的豆花太甜了。……好啦，是台南的太甜，台北的剛好。」',when:'met'}, {t:'「我媽又寄了一箱虱目魚丸上來。冰箱塞不下，你要不要分一點？」',when:'met'},
        {t:'「阿凱說虱目魚丸要配泡麵。我們台南人聽到會哭。」',when:'metKai'}, {t:'「元碩拍照不准我看鏡頭。可是他一舉相機，我就會看過去。」',when:'metYS'},
        {t:'「公館那家麵店的乾麵不錯。……我們台南的比較甜。」',when:'Y1S1'}, {t:'「每次搭高鐵回台南，過了嘉義就開始想吃早餐。」',when:'secret'},
        {t:'「我阿公住院了。這學期每個週末我都回去。」',when:'Y1S2'}, {t:'「畢業以後我要回台南。我媽說，台南也有法院。」',when:'Y2S2'} ],
      greet:['「學弟。冰箱還有魚丸，自己拿。」','（他在講電話，用台語。看到你，舉手揮了一下。）','「我們台南今天三十二度。……我就問一下台北幾度。」'],
      secret:[ q('其實……我很想家。'),
        {choice:[{text:'「那就常回去啊。」',goto:'a'},{text:'「我也會想家。」',goto:'b'},{text:'「下次魚丸分我一點，我幫你吃。」',goto:'c'}]},
        L('a'), q('已經兩個禮拜回去一次了。……還是想。'), GO('e'), L('b'), q('你家在台北，也會想？……也是，想家跟遠近沒關係。'), GO('e'), L('c'), q('（笑出來）你這是在幫我想家嗎。'), L('e') ],
      /* 8-3 順手的事：代收媽媽的箱子 */
      ask:[ q('這禮拜六我媽寄的箱子會到，可是我要回台南看阿公。'), q('你可以幫我去門廳領，丟進冰箱嗎？不領的話會退回去。') ],
      askOpts:['「我幫你領。」','「我週六不在。」'], askNo:[ q('好，我問元碩。') ],
      sat:'領到了嗎？我媽問是誰幫忙領的，我說一個學弟。她說下次要多寄一包給你。',
      note:'（「魚丸分你兩包。阿公好多了。——家齊」）',
      back:'箱子退回去了。沒關係，我媽說下禮拜再寄。',
      deedBox:'幫他領過媽媽寄的箱子',
      /* 8-5 文旦（大二上 2026-09-27，週日 21:30）*/
      pomeloEve:'明天晚上交誼廳。我媽寄了文旦。你跟阿凱來吃。', pomeloEveNoKai:'明天晚上交誼廳。我媽寄了文旦。你來吃。',   /* 阿凱大二不住男一舍：「跟阿凱」拿掉 */
      pomelo:[ {if:{custom:G=>typeof POOL!=='undefined'&&POOL.kaiHere(G)},speaker:null,text:'（文旦剝了一整桌。阿凱把文旦皮戴在頭上。）'},
        {unless:{custom:G=>typeof POOL!=='undefined'&&POOL.kaiHere(G)},speaker:null,text:'（文旦剝了一整桌。）'},   /* 阿凱大二不住男一舍：「阿凱把文旦皮戴在頭上」那一句拿掉 */
        q('我們台南的文旦……其實是麻豆的。麻豆也算台南。'), q('明年中秋我就不在這裡了。你們要自己剝。'),
        {choice:[{text:'「我們會剝。」',goto:'a'},{text:'「明年寄過來。」',goto:'b'},{text:'（幫他剝一顆）',goto:'c'}]},
        L('a'), q('剝完要傳照片給我。'), GO('e'), L('b'), q('好。寄到這裡，地址我背起來了。'), GO('e'), L('c'), N('（他接過去，吃了一瓣，沒有說話。）'), L('e') ],
      /* 8-6 畢業那一週的冰箱 */
      fridge:['（交誼廳的冰箱門上貼了一張紙：「裡面的魚丸都留給你們。——家齊」）','（紙的最下面又多寫一行：「阿凱，不准配泡麵。」）'],
      bye:[ q('學弟，我要回台南了。之後來台南，早餐我帶你去吃。'),
        {choice:[{text:'「一定去。」',goto:'a'},{text:'「台南有法院嗎？」',goto:'b'}]},
        L('a'), q('牛肉湯，五點半就開了。你起得來的話。'), GO('e'), L('b'), q('有啦！我媽說的。'), L('e') ],
      tainan:'你在台南？早餐去吃牛肉湯，報我的名字沒有用，可是很好吃。',
      moon:['（照片：台南的月亮）','跟台北的一樣。……好啦，比較圓。'] }
  };
  /* 林采潔：三個認識的版本共用「你看推理小說嗎？」以後的三個選項（導覽版、教室版）*/
  LINES[C].meetTour=LINES[C].meetTour.concat(LINES[C].meetQ); LINES[C].meetClass=LINES[C].meetClass.concat(LINES[C].meetQ);
  return {SRC:'AA_498@33189103b',RENAME,RENAME_MORE,PEOPLE,LINES,BATCH1:[Z,Y,C,YS,Q]};
})();
