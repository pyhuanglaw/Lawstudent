/* ===== 寒暑假的空白日：最空的三段、其他假期的五天以上空白、住家裡／留宿舍的摘要池（AA_440，AA-B 2026-10-24 定稿；企劃線 718c06a30，修訂 edae49ca6；摘要池加寫 AA_443 第 2 節 f93fa3eda；回 BB_303；第①級、D109；D99 第二優先）=====
   台詞照 AA_440 一字不改（VACFILL_LINES）；用事件系統演的段落在 VACFILL_EVENTS（在家的小場景、一鍵的出遊、7/27 走到霖澤館）。
   手機（群組、私訊、提醒）、出遊、快轉停點、摘要池、3-4 摘要的接線在 src/vacfill3d.js。
   第 1 節 舊序章那年暑假（2025，舊序章住家裡；AA_440 修訂 edae49ca6：8/13 放榜以前不出現錄取、考上、餞行；7/19 南下高雄／在家睡一整天的換版）：
            ev_vf_y0_0713（對發票）、ev_vf_y0_0719_sis／ev_vf_y0_0726_sis（姊姊回來）、ev_vf_y0_0719（舊序章聚餐，AA 沒寫台詞）、ev_vf_y0_0722（可昕視訊）、
            ev_vf_y0_0727（去學校走一走）＋_gate／_linze、ev_vf_y0_0808（父親節視訊）、ev_vf_y0_0810（可昕視訊）、ev_vf_y0_0810_sum（沒交往：摘要池）、ev_vf_y0_0816（錄取通知）、ev_vf_y0_0818（熱炒店餞行）
   第 2 節 大二暑假（2027）：ev_vf_y2_0729（法圖）、ev_vf_y2_0801（兩點半 Café）
   第 3 節 大三寒假（2028）：ev_vf_y3_0204（麵店的新菜單，AA_445 1-1）、ev_vf_y3_0209（元宵的燈會）、ev_vf_y3_0214（法圖開館）
   第 4 節：ev_vf_y1w_0123（住家裡：媽媽說要去迪化街）、ev_vf_y1w_0124（迪化街）、ev_vf_y1s_0828（姊姊回家住兩天）、ev_vf_y2w_0116（麵店長桌）、ev_vf_y3w_0108（參創）
   AA_556（企劃線 3d7ad0024，寒暑假第二批；台詞在 VACFILL_LINES2）：ev_vf_y1s_0624（6/24 阿凱線上語音）、ev_vf_y2s_0711（溫州街的冰店）、ev_vf_y2s_0813（公館的修鞋店）、ev_vf_y2w_0212（永和的豆漿店）
   測試：node tests/aa440_vacfill_unit.js、node tests/aa556_vacgap2_unit.js */
'use strict';
const VACFILL_LINES={

  /* ---------- 第 2 節 大二暑假（2027）---------- */
  /* 2-1 6/18（五）21:00 桌遊團群組；6/23（三）15:00 語彤 */
  y2_0618:{ms:[['zhe','放假第一週 大家在幹嘛'],['yu','睡覺！！睡到中午！！'],['classmate_bohan','在總圖。暑假人很少。'],['zhe','……柏翰你是不是不知道什麼叫放假']],
    opts:['在家。','在宿舍。','在總圖。'],lib:[['classmate_bohan','三樓。我在窗邊。']],other:[['zhe','好喔']]},
  y2_0623:{ms:['茶屋暑假開始賣冷泡茶了。','蘇姨說你上次喝很快。'],yes:'我去喝。',no:'下次。',noSay:'嗯。'},
  /* 2-2 7/24（六）21:30 以安從台中（交往中）*/
  y2_0724:{ms:['台中好熱。','我媽在客廳看書，我在房間讀書。冷氣只開一台。','你呢？'],
    study:'在家，也在讀書。',studySay:['讀哪一科？','（你說了。）','好。我也讀那一科。明天對進度。'],
    miss:'在想妳。',missSay:['我在看書。','……看不太下去了。'],photo:'（十點半她傳了一張課本的照片，旁邊空白處畫了一個小小的箭頭。）'},
  /* 2-3 7/28（三）16:00 學姊；7/29（四）14:00 法圖 */
  y2_0728:{ms:['法圖暑假開到五點。','冷氣很強，要帶外套。'],go:'我明天去。',thanks:'謝謝學姊。',thanksSay:'嗯。',find:'我去找妳。',
    narr:'（暑假的法圖只有三個人。學姊坐在最裡面，桌上兩本書、一件外套。）',sit:'坐。……外套你沒帶。',coat:'她把自己的推過來一半。',two:'……下次我帶兩件。'},
  /* 2-4 7/31（六）20:00 子晴；8/1（日）15:00 兩點半 Café */
  y2_0731:{ms:['我在做一個新的東西','暑假只有我跟冷氣','你要不要來看 不要講話那種'],pt:'新的那個 第二關做好了',
    yes:'好。',yesSay:['明天下午','Café'],no:'我不會看。',noSay:['不用會','看就好','……算了 下次'],
    narr:'（她的筆電轉過來給你看，畫面上是一座還沒有顏色的橋。她什麼都沒說。你也沒說。一個小時以後，她說：「好，可以了。」）'},
  /* 2-5 8/4（三）21:00 桌遊團群組：香港的機票 */
  y2_0804:{ms:[['zhe','香港 機票誰還沒買'],['yu','我買了！！靠窗！！'],['classmate_bohan','我買了。行程表我做好了。'],['zhe','……柏翰你又做了']],
    bought:'買了。',boughtSay:[['zhe','好喔']],notyet:'還沒。',notyetSay:[['zhe','今天買 明天會漲']]},

  /* ---------- 第 3 節 大三寒假：過年以後到開學前（2028）---------- */
  /* 3-1 2/4（五）17:00 麵店開工（語彤）*/
  y3_0204:{ms:['蘇姨換了新的菜單。','她說字寫大一點，老客人才看得到。'],yes:'我去吃。',no:'下次。',noSay:'嗯。',   /* AA_445 1-1（企劃線 fd200c2c6）：1/29 已經開了，2/4 改成新菜單 */
    narr:'（牆上的菜單是新的，字真的很大。最下面多了一行：「學生續杯不加價」。）',yt:'（倒茶過來）……續了。',end:'（她把杯子放下，回去收下一桌。）'},
  /* 3-2 2/8（二）21:00 桌遊團群組；2/9（三）元宵 19:00 */
  y3_0209:{ms:[['yu','明天元宵！！去看燈！！'],['zhe','人會很多喔'],['yu','所以才要去！！']],yes:'去。',no:'不去。',
    place:'元宵的燈會',narr:'（人多到走不動。Alison 拿著一個發光的頭飾，一直往前擠。）',yu:'欸！！你們看那一個！！是一隻龍！！',zhe:'每年都是龍吧。',
    back:'（回程的捷運上，Alison 靠著阿哲睡著了。頭飾還在亮。）',backNoZhe:'（回程的捷運上，Alison 一直在傳照片給阿哲。）',
    ytShop:'今天店裡賣很多湯圓。',missed:'你錯過一隻龍！！'},
  /* 3-3 2/12（六）14:00 學姊；2/14（一）10:00 法圖 */
  y3_0212:{ms:['法圖下週一恢復晚上開館。','你開學以前要借書的話，那天人最少。'],   /* AA_507 0-2 第 4 點：法圖寒假平日照開（學姊寒假作息在法圖），原本「法圖寒假下週一開。」*/go:'我那天去。',
    narr:'（恢復晚上開館的第一天，借書櫃台前面只有你。學姊在後面的書架找書，看到你，點了一下頭。）'},
  /* 3-4 2/19（六）開學前（摘要；修訂：大三寒假到 2/20 才結束）*/
  y3_0219:{home:'（明天回宿舍。媽媽把你的冬天的外套洗好、摺好，放在行李箱最上面。）',dorm:'（宿舍的走廊開始有人拖著行李進來。隔壁的人回來了，在敲門借吹風機。）'},

  /* ---------- 第 4 節 其他假期連續 5 天以上的空白 ---------- */
  /* 大一寒假：1/23（五）15:00 年貨（1/24 迪化街）、1/27（二）21:00 家人群組 */
  y1w_0123:{mom:'明天陪我去迪化街。你拿東西。',go:'去',narr:'（迪化街的人擠到走不動。媽媽一攤一攤試吃，最後只買了一包烏魚子。）',fish:'你爸過年要吃這個。'},
  y1w_0127:{ms:[['dad','我 2/14 的飛機。'],['sister','爸你要記得去機場前先吃東西']],ok:'好。'},
  /* 大一暑假：6/24（三）阿凱、8/3（一）語彤、8/5 以安（交往中）、8/28（五）姊姊 */
  y1s_0624:{ms:['所以你暑假在幹嘛','我在打一款很難的遊戲 打不過'],yes:'我也來打。',yesSay:'所以今晚 線上',narr:'（那天晚上你們打到兩點。還是打不過。）'},
  y1s_0803:{ms:['蘇姨問你暑假有沒有回來喝茶。'],yes:'明天去。'},
  y1s_0805:{ms:['我媽今天問你是誰。','我說是男朋友。……她說好。']},
  y1s_0828:{narr:'（姊姊把你的房間當倉庫，堆了三箱書。）',sis:'台南的房子太小。先放你這裡。……你開學就不用了吧？'},
  /* 大二寒假：1/14（四）21:00 桌遊團群組（1/16 麵店長桌）、1/22（五）姊姊 */
  y2w_0114:{ms:[['zhe','寒假還有誰在臺北'],['heroine_03','我在。週末有班。'],['yu','我！！']],yes:'我也在。',narr:'（長桌只坐了一半。）',narr2:'（阿姨沒說話，在你盤子裡多放了一塊叉燒。）'},   /* AA_519 1-3：送小菜第七處＝第 6 句（「阿姨沒說話」：原本那一句「人少，吃多一點。」拿掉；「長桌只坐了一半。」照舊，拆成兩句）*/
  y2w_0122:{ms:['我 2/3 回去','媽說你又在睡'],no:'沒有。',noSay:'她說你會這樣講'},
  /* 大二暑假：7/8（四）家人群組（照片的字在 VACFILL_UI）*/
  y2s_0708:{ms:[['dad','颱風。'],['mom','你那邊有颱風？'],['dad','這邊叫颱風。']]},
  /* 大三寒假：1/6（四）子晴（1/8 參創）、1/15（六）學姊 */
  y3w_0106:{ms:['期末考完了 我要去參創','你要的話 下午三點'],yes:'好。',narr:'（她帶你繞了一圈試玩區，在一台前面停了很久，什麼都沒說。）'},
  y3w_0115:{ms:['美國那邊的面試，排在下禮拜。','線上的。八月去的那一梯。'],yes:'加油。',yesSay:'嗯。……上了再跟你說。'},   /* AA_507 0-2 第 2 點（e4fbd0192）：11/12 申請送出去 → 12 月等結果 → 1/15 面試（原本「我送出去了」倒回去）；結果照舊三月 */
  /* 大四寒假：1/11（四）桌遊團群組、1/20（六）以安（交往中）、1/27（六）家人群組 */
  y4w_0111:{ms:[['yu','寒假大家都在讀書嗎'],['classmate_bohan','我在讀。研究所的老師開了書單。'],['zhe','我在讀國考'],['yu','……好我也去讀']]},
  y4w_0120:{ms:['二月要考了。','這週我每天在總圖三樓。……你要來的話，坐我對面。'],yes:'我去。'},
  y4w_0127:{ms:[['dad','我 2/10 的飛機。今年待到元宵。'],['mom','真的？'],['dad','真的。']]},

  /* ---------- 第 5 節 摘要池（沒有任何一件的假期日子，早上起床放一句；一個假期內照順序、不重複，用完從頭）---------- */
  /* AA_443 第 2 節（企劃線 f93fa3eda）接在各池最後面：住家裡寒假 14、暑假 16；留宿舍寒假 12、暑假 20 */
  POOL:{
    home:{
      winter:['（你被廚房的抽油煙機吵醒。媽媽在煮你小時候愛吃的那一道，可是你已經不太愛吃了。你沒說。）','（媽媽在客廳打計算機。你在房間讀書。兩邊的聲音一整個下午都沒停。）',
        '（家裡很冷。你穿了兩件外套坐在書桌前。）','（媽媽叫你去拿掛號信。是爸爸寄回來的，裡面是一盒上海的點心。）','（你整理了國中的書櫃。最上面一層，還有一本沒寫完的作業簿。）',
        '（晚上你和媽媽一起看電視。她看到一半睡著了，你把音量調小。）','（宜蓁在家人群組傳了一張台南的晚餐。媽媽回了三個讚。）','（你去巷口的早餐店。老闆還記得你國中點什麼。）',
        /* AA_443 第 2 節加寫（企劃線 f93fa3eda）*/ '（你在陽台曬棉被。對面那棟的阿姨也在曬，跟你點了一下頭。）','（媽媽的客戶打電話來。她一邊講，一邊比手勢叫你倒茶。）','（下了一整天的雨。你沒有出門，讀完了半本書。）','（你去巷口的超市幫媽媽買醬油。買錯了一種，她說「也可以」。）','（晚上，你在房間聽到媽媽在客廳跟爸爸視訊。她講的都是你的事。）','（你用家裡的舊電腦查下學期的選課。開機開了五分鐘。）'],
      summer:['（冷氣開了一整天。媽媽把電費單貼在冰箱上。）','（你去家附近的圖書館讀書。暑假的圖書館都是國中生。）','（午後雷陣雨。陽台的衣服來不及收，你和媽媽一起收。）',
        '（媽媽要你幫她把客戶的帳本按月份排好。你排到一半，看到一張十年前的收據。）','（你在房間讀到天黑才發現沒開燈。）','（晚上去夜市買了兩份蚵仔煎。一份是媽媽的。）',
        '（家人群組裡，爸爸傳了一張辦公室窗外的夕陽。沒有寫字。）','（你把下學期的課表看了三遍。）',
        /* AA_443 第 2 節加寫（企劃線 f93fa3eda）*/ '（中午的巷子很安靜，只有蟬在叫。）','（媽媽把冰箱裡快過期的東西全部煮成一鍋。你們吃了兩天。）','（你幫隔壁的阿伯搬了一箱水。他問你念哪裡。）','（颱風警報。媽媽把陽台的盆栽全部搬進客廳。最後颱風沒有來。）','（你去理髮。理髮師剪得比你說的短。）','（晚上出門倒垃圾。垃圾車的音樂還沒到，巷口已經站了一排人。）','（媽媽的老花眼鏡又找不到了。最後在她頭上。）','（你在房間讀判決。媽媽敲門問你要不要吃西瓜，你說好。她已經切好了。）']},
    dorm:{
      winter:['（宿舍走廊的燈只開了一半。整層樓好像只剩你。）','（宿舍的熱水比平常熱。用的人少。）','（你在交誼廳看電視。舍監經過，問你過年回不回家。）',
        '（學校的餐廳只開一間。你連吃了三天同一個便當。）','（寒假的總圖人很少。你五點出來的時候，天已經黑了。）','（媽媽傳訊息：「冰箱有你愛吃的。要回來嗎？」）',
        /* AA_443 第 2 節加寫（企劃線 f93fa3eda）*/ '（隔壁房間的門上貼著一張紙：「回家了，開學見」。）','（宿舍的洗衣機只剩一台能用。你排在一個學長後面。）','（公館有幾家店拉下了鐵門，貼著「年後見」。）','（你在書桌前坐了一整天。傍晚站起來的時候，腳是冰的。）','（交誼廳的飲水機壞了。你走到隔壁棟去裝水。）','（晚上的椰影大道沒有人。路燈一盞一盞亮到總圖。）'],
      summer:['（宿舍暑假住的多是外地生。走廊上有人在講你聽不懂的方言。）','（椰影大道的樹蔭下，只有遊客在拍照。）','（你在宿舍讀書，冷氣卡要儲值了。）',
        '（午後雷陣雨。你在總圖門口等雨停，等了半個小時。）','（暑修的學弟妹在宿舍的廚房煮泡麵，問你哪一科比較好過。）','（媽媽傳訊息：「暑假也不回來？……好，那記得吃飯。」）',
        /* AA_443 第 2 節加寫（企劃線 f93fa3eda）*/ '（中午的公館，騎樓下面比較涼。你沿著騎樓走到書店。）','（宿舍的冷氣嗡嗡響了一整晚。早上起來，喉嚨有點乾。）','（映月湖邊的長椅上，有人在睡午覺。）','（你去總圖還書。暑假的總圖冷氣很強，你多待了兩個小時。）','（宿舍樓下的自動販賣機，你常喝的那一罐又賣完了。）','（晚上去操場跑步。跑了三圈，看到有人躺在操場中間看星星。）','（你把衣服拿去頂樓曬。太陽太大，一個小時就乾了。）','（公館的冰店排了一條很長的隊。你排到一半，放棄了。）','（你在宿舍讀了一整天的書。晚上出門買宵夜，才發現今天第一次開口說話。）','（傍晚的椰影大道，腳踏車比平常少。你騎得很快。）','（暑假的系館很安靜。你走過法律系館A穿堂，裡面只有一個在拖地的阿姨。）','（隔壁房搬來一個暑修的學生。半夜還聽得到他在講電話。）','（你去公館買了一支新的原子筆。舊的那支寫了一整個學期。）','（媽媽傳了一張家裡冷氣的照片：「這台修好了。回來吹？」）']}}
};
/* 稿裡只寫了「傳一張……的照片」、沒有照片說明的兩則：手機上照片那一則的字（LAWWW 寫的系統字，括號裡的字取自稿；不是台詞）*/
const VACFILL_UI={photoTyphoon:'📷（上海下大雨）',photoLantern:'📷（燈）'};
/* ===== AA_556（企劃線 3d7ad0024；VAC-GAP2-1031；AA-B 2026-10-31 定稿、D109）寒暑假第二批：台詞一字不改（AA_440 的 VACFILL_LINES 不混進來，tests/aa440_vacfill_unit.js 對 AA_440 逐句比）=====
   第 4 節 大一暑假 6/24 阿凱：回「我也來打。」＝當晚 22:00 線上語音（取代原本對話串裡那一句旁白）
   第 5 節 大二暑假：7/10 20:00 阿凱私訊 → 7/11（日）15:00 溫州街的冰店；8/12 21:00 語彤私訊 → 8/13（五）16:00 公館的修鞋店（記憶 FIELD_WITH_YT）
   第 6 節 大二寒假：2/11 21:00 芯慈私訊 → 2/12（五）10:00 永和的豆漿店（芯慈戀愛線的旗標不讀、不寫）
   私訊、出遊的接線在 src/vacfill3d.js（S.MSGS、S.OUTS）；場景在下面 VACFILL_EVENTS 最後四個 */
const VACFILL_LINES2={
  y1s_0624:{yesSay:'所以今晚 線上',narr:'（耳機裡，阿凱那邊有泡麵的聲音。）',kai1:'所以第三關的王，要先打牠的尾巴。',kai2:'……我也是剛剛才知道。我已經死了四十次。',narr2:'（凌晨一點半，你們第一次打到牠剩一半的血。）',kai3:'所以我們差一半。……明天再打。',end:'（那天晚上你們打到兩點。還是打不過。）'},
  y2s_0710:{ms:['所以溫州街那家冰店開了','明天下午三點','我請 我的泡麵評鑑表滿一百家了 慶祝'],yes:'好。',narr:'（冰店的電風扇轉得很慢。阿凱點了兩碗，說一碗是評鑑用的。）',kai:'所以這家要寫進表裡嗎。它不是泡麵。',
    opts:['開一張新的表。','好吃就寫進去。'],say:['……所以我暑假有事做了。','好。那它是第一百零一家。雖然它是冰。']},   /* 阿凱的私訊不加句號（照稿）*/
  y2s_0812:{ms:['明天下午我要去訪問修鞋店的老闆。','……你要不要一起。你負責拿錄音筆就好。'],yes:'好。',narr:'（修鞋店很小，只放得下一張板凳。語彤坐板凳，你站在門口拿錄音筆。）',boss:'這雙鞋，我修過三次了。客人每次都說是最後一次。',
    narr2:'（他把鞋底翻過來給你們看，上面有三種顏色的線。）',narr3:'（回程的路上。）',yt1:'我問了十個問題，他回答了一個。',yt2:'……可是那一個很好。'},
  y2w_0211:{ms:['我爸媽的事務所今天開工。我去幫忙。','明天早上十點，永和的豆漿店。我請。'],yes:'好。',narr:'（永和的豆漿店，早上十點還是滿的。芯慈已經點好了，桌上兩碗鹹豆漿。）',xc:'我爸說開工第一天要吃熱的。我覺得他只是想吃。',
    opts:['事務所開工忙嗎？','妳寒假都在幫忙？'],say:['忙。我負責發紅包。……我發錯一包，給了我媽。','一個禮拜。剩下的時間在追劇。……第八集很好看。']}
};
const VACFILL_EVENTS=(function(){
  const X=VACFILL_LINES, X2=VACFILL_LINES2;
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const F=G=>(G&&G.flags)||{};
  const hh=G=>((G.hour%24)+24)%24;
  const on=(G,k,h)=>{ const d=D(k); return d!=null&&G.day===d&&hh(G)>=h; };   /* 那一天、那個時間以後（當天）*/
  const win=(G,k,h,k2,h2)=>{ const a=D(k), b=D(k2); if(a==null||b==null) return false; const t=G.day*24+G.hour; return t>=a*24+h&&t<b*24+h2; };
  const dat=(G,id)=>F(G)['dating_'+id]===true;
  const plan=G=>F(G).E35_PLAN, south=G=>['sea','shop'].includes(F(G).E35_PLAN);   /* 7/10 E35 約好的 7/19（econff3d.js 的字卡）：sea／shop＝7/19～7/23 在高雄；sleep＝在家睡到下午三點 */
  const here=(G,id)=>!G||typeof STORY==='undefined'||!STORY.presence||STORY.presence(id,G).here!==false;   /* 那一刻人在臺北 */
  const choice=(opts,labels)=>({choice:opts.map((t,i)=>({text:'「'+t+'」',goto:labels[i]}))});
  /* 沒有標題的小場景：EVENTS.run 會把事件 id 記進日誌（GM.memo(ev.title||ev.id)）——演完拿掉那一筆 */
  const noMemo=(id,f)=>(G,GM,n)=>{ const M=G&&G.memo; if(Array.isArray(M)&&M.length&&M[M.length-1]&&M[M.length-1].t===id) M.pop(); if(f) f(G,GM,n); };
  return [

    /* ===================== 第 2 節 大二暑假 ===================== */
    { id:'ev_vf_y2_0729', title:'法圖', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'法圖',bg:'law_library'}, {speaker:null,text:X.y2_0728.narr}, {speaker:'heroine_05',text:X.y2_0728.sit},
        {if:{custom:G=>F(G).VF_Y2_0729!=='find'},speaker:null,text:X.y2_0728.coat},
        {if:{custom:G=>F(G).VF_Y2_0729==='find'},speaker:'heroine_05',text:X.y2_0728.two} ] },   /* 和學姊交往中、回「我去找妳。」：最後一句換成「……下次我帶兩件。」*/
    /* AA_549 3-3（企劃線 AA_549 第 3 節 3-3；第①級）：原本只有一句旁白（X.y2_0731.narr）＝換成子晴的場景 */
    { id:'ev_vf_y2_0801', title:'2:30 AM', participants:['heroine_04'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'2:30 AM',bg:'cafe'},
        {speaker:null,text:'（下午的 2:30 AM。子晴坐在最裡面，筆電貼滿貼紙，桌上兩杯冰美式。）'},
        {speaker:'heroine_04',text:'一杯是你的。我猜你會遲到，所以先點了。冰塊都化了。'},
        {speaker:'heroine_04',text:'我在做一個小遊戲。你幫我玩一關。'},
        {choice:[{text:'「好。」',goto:'a'},{text:'「妳在實習耶，週末還做？」',goto:'b'}]},
        {label:'a'},{speaker:null,text:'（你玩了三分鐘，死了四次。）'},{speaker:'heroine_04',text:'很好。這就是我要的難度。'},{goto:'e'},
        {label:'b'},{speaker:'heroine_04',text:'實習是別人的遊戲。這個是我的。'},
        {label:'e'} ] },

    /* ===================== 第 3 節 大三寒假 ===================== */
    { id:'ev_vf_y3_0204', title:'一盞茶屋', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'一盞茶屋',bg:'noodle_table'}, {speaker:null,text:X.y3_0204.narr}, {speaker:'heroine_03',text:X.y3_0204.yt}, {speaker:null,text:X.y3_0204.end} ] },
    { id:'ev_vf_y3_0209', title:'元宵的燈會', participants:['yu'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
      dialogue:[ {scene:X.y3_0209.place,bg:'vf_lantern'}, {speaker:null,text:X.y3_0209.narr}, {speaker:'yu',text:X.y3_0209.yu},
        {if:{custom:G=>here(G,'zhe')},speaker:'zhe',text:X.y3_0209.zhe},
        {if:{custom:G=>here(G,'zhe')},speaker:null,text:X.y3_0209.back},
        {if:{custom:G=>!here(G,'zhe')},speaker:null,text:X.y3_0209.backNoZhe} ],   /* 阿哲大三寒假多半在高雄（BB_303 第 3 節）：2/9 他不在臺北＝他的句子拿掉、回程旁白換 */
      after:G=>{ G.flags.VF_Y3_LANTERN='went'; } },
    { id:'ev_vf_y3_0214', title:'法圖', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'法圖',bg:'law_library'}, {speaker:null,text:X.y3_0212.narr},
        {speaker:null,text:'（借完書出來，在法圖門口。）',libOut:true},   /* libOut（AA_595 1-B44；AA 11-02 22:30 定稿）*/
        /* AA_533 4-3（企劃線 cf0066ed2）*/
        {speaker:'heroine_05',text:'開學前來借的人，通常是要補上學期的。'},{speaker:'heroine_05',text:'……你是哪一種？'},
        {choice:[{text:'「補上學期的。」',goto:'aa533_a'},{text:'「預習下學期的。」',goto:'aa533_b'}]},
        {label:'aa533_a'},{speaker:'heroine_05',text:'（把一本書從書架抽出來，放在你手上）這本。'},{goto:'aa533_end'},
        {label:'aa533_b'},{speaker:'heroine_05',text:'嗯。那你比我大二的時候好。'},{label:'aa533_end'} ] },

    /* ===================== 第 4 節 ===================== */
    /* 大一寒假 1/23 15:00 住家裡：媽媽當面說（留宿舍的是私訊，src/vacfill3d.js）；說完排 1/24 的迪化街 */
    { id:'ev_vf_y1w_0123', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>win(G,'2026-01-23',15,'2026-01-24',0)&&F(G).VF_Y1W_DIHUA_MODE!=='dm'},
      dialogue:[ {scene:'家'}, {speaker:'媽媽',name:'媽媽',text:X.y1w_0123.mom} ],
      after:noMemo('ev_vf_y1w_0123',G=>{ G.flags.VF_Y1W_DIHUA_MODE='home'; G.flags.VF_Y1W_DIHUA='go'; if(typeof VACFILL!=='undefined'&&VACFILL.phone) VACFILL.phone(G); } )},
    { id:'ev_vf_y1w_0124', title:'迪化街', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
      dialogue:[ {scene:'迪化街',bg:'dihua_newyear'}, {speaker:null,text:X.y1w_0123.narr}, {speaker:'媽媽',name:'媽媽',text:X.y1w_0123.fish} ] },
    /* 大一暑假 8/28（五）～8/29：姊姊回家住兩天（在家的時候演）*/
    { id:'ev_vf_y1s_0828', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>win(G,'2026-08-28',18,'2026-08-30',0)},
      dialogue:[ {scene:'家'}, {speaker:null,text:X.y1s_0828.narr}, {speaker:'宜蓁',name:'宜蓁',text:X.y1s_0828.sis} ] , after:noMemo('ev_vf_y1s_0828') },
    { id:'ev_vf_y2w_0116', title:'公館燒臘', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'公館燒臘・長桌',bg:'noodle_table'}, {speaker:null,text:X.y2w_0114.narr},
        {speaker:null,text:'（語彤倒茶過來，順手把你的杯墊擺正。）'},{speaker:'heroine_03',text:'寒假人少。蘇姨泡得比較慢。'},{speaker:'yu',text:'慢沒關係！我餓到可以等！'},   /* AA_533 4-1：群組說會去的兩個人開口（兩句旁白中間）*/
        {speaker:null,text:X.y2w_0114.narr2} ] },
    { id:'ev_vf_y3w_0108', title:'參創', participants:['heroine_04'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'參創生活園區',bg:'d03_base_afternoon'}, {speaker:null,text:X.y3w_0106.narr},
        {speaker:'heroine_04',text:'這台是我學長做的。他去年也在這裡排隊，排到最後一個。'},{speaker:'heroine_04',text:'……明年我也要有一台。'} ] },   /* AA_533 4-2 */

    /* ===================== AA_556（企劃線 3d7ad0024；VAC-GAP2-1031）===================== */
    /* 第 4 節 大一暑假 6/24 22:00 阿凱：線上語音（回「我也來打。」才有；src/vacfill3d.js 排成電話式的出遊＝在家、在宿舍都不用出門）。
       hours 4：演完是 2:00（稿：「那天晚上你們打到兩點」）*/
    { id:'ev_vf_y1s_0624', title:'和阿凱打遊戲（線上）', participants:['kai'], location:'any', trigger:'outing', once:true, background:'dark', hours:4,
      dialogue:[ {scene:'線上',bg:'dorm_desk'}, {speaker:null,text:X2.y1s_0624.narr}, {speaker:'kai',text:X2.y1s_0624.kai1}, {speaker:'kai',text:X2.y1s_0624.kai2},
        {speaker:null,text:X2.y1s_0624.narr2}, {speaker:'kai',text:X2.y1s_0624.kai3}, {speaker:null,text:X2.y1s_0624.end} ] },
    /* 第 5-1 節 大二暑假 7/11（日）15:00 溫州街的冰店（阿凱）：背景還沒有溫州街的 2D 圖（OUT.BG.wenzhou image null）＝深色底＋地點字幕 */
    { id:'ev_vf_y2s_0711', title:'溫州街的冰店', participants:['kai'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'溫州街的冰店',bg:'wenzhou_ice'},   /* 11-02 使用者生成（BB_132 第 102 組第 4 張；原本 wenzhou 沒有圖＝深色底）*/ {speaker:null,text:X2.y2s_0710.narr}, {speaker:'kai',text:X2.y2s_0710.kai},
        choice(X2.y2s_0710.opts,['a','b']),
        {label:'a'},{speaker:'kai',text:X2.y2s_0710.say[0]},{goto:'e'},
        {label:'b'},{speaker:'kai',text:X2.y2s_0710.say[1]},
        {label:'e'} ] },
    /* 第 5-2 節 大二暑假 8/13（五）16:00 語彤的田野（公館的修鞋店；背景照公館）：演完記 FIELD_WITH_YT（記在語彤身上，大三的田野回想可以讀）*/
    { id:'ev_vf_y2s_0813', title:'公館的修鞋店', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'公館的修鞋店',bg:'gongguan'}, {speaker:null,text:X2.y2s_0812.narr}, {speaker:'老闆',name:'老闆',text:X2.y2s_0812.boss},
        {speaker:null,text:X2.y2s_0812.narr2}, {speaker:null,text:X2.y2s_0812.narr3}, {speaker:'heroine_03',text:X2.y2s_0812.yt1}, {speaker:'heroine_03',text:X2.y2s_0812.yt2} ],
      after:G=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('heroine_03','FIELD_WITH_YT','大二暑假，公館的修鞋店（語彤的田野）'); } },
    /* 第 6 節 大二寒假 2/12（五）10:00 永和的豆漿店（芯慈；背景照早餐店＝soymilk_shop）。芯慈戀愛線的旗標不讀、不寫 */
    { id:'ev_vf_y2w_0212', title:'永和的豆漿店', participants:['classmate_xinci'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'永和的豆漿店',bg:'soymilk_shop'}, {speaker:null,text:X2.y2w_0211.narr}, {speaker:'classmate_xinci',text:X2.y2w_0211.xc},
        choice(X2.y2w_0211.opts,['a','b']),
        {label:'a'},{speaker:'classmate_xinci',text:X2.y2w_0211.say[0]},{goto:'e'},
        {label:'b'},{speaker:'classmate_xinci',text:X2.y2w_0211.say[1]},
        {label:'e'} ] }
  ];
})();
/* 元宵的燈會：2D 夜景、人潮（AA_440 3-2）——還沒有圖＝深色底＋地點字幕（MISSING_EXTERNAL_ART，等 BB 跟使用者要）*/
if(typeof OUT!=='undefined'&&OUT.BG&&!OUT.BG.vf_lantern) OUT.BG.vf_lantern={label:'元宵的燈會',image:null};
if(typeof STORY_EVENTS!=='undefined') for(const e of VACFILL_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
