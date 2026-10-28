/* ===== 寒暑假的空白日：最空的三段、其他假期的五天以上空白、住家裡／留宿舍的摘要池（AA_440，AA-B 2026-10-24 定稿；企劃線 718c06a30，修訂 edae49ca6；摘要池加寫 AA_443 第 2 節 f93fa3eda；回 BB_303；第①級、D109；D99 第二優先）=====
   台詞照 AA_440 一字不改（VACFILL_LINES）；用事件系統演的段落在 VACFILL_EVENTS（在家的小場景、一鍵的出遊、7/27 走到霖澤館）。
   手機（群組、私訊、提醒）、出遊、快轉停點、摘要池、3-4 摘要的接線在 src/vacfill3d.js。
   第 1 節 經濟系那年暑假（2025，休學住家裡；AA_440 修訂 edae49ca6：8/13 放榜以前不出現錄取、考上、餞行；7/19 南下高雄／在家睡一整天的換版）：
            ev_vf_y0_0713（對發票）、ev_vf_y0_0719_sis／ev_vf_y0_0726_sis（姊姊回來）、ev_vf_y0_0719（經濟系聚餐，AA 沒寫台詞）、ev_vf_y0_0722（可昕視訊）、
            ev_vf_y0_0727（去學校走一走）＋_gate／_linze、ev_vf_y0_0808（父親節視訊）、ev_vf_y0_0810（可昕視訊）、ev_vf_y0_0810_sum（沒交往：摘要池）、ev_vf_y0_0816（錄取通知）、ev_vf_y0_0818（熱炒店餞行）
   第 2 節 大二暑假（2027）：ev_vf_y2_0729（法圖）、ev_vf_y2_0801（兩點半 Café）
   第 3 節 大三寒假（2028）：ev_vf_y3_0204（麵店的新菜單，AA_445 1-1）、ev_vf_y3_0209（元宵的燈會）、ev_vf_y3_0214（法圖開館）
   第 4 節：ev_vf_y1w_0123（住家裡：媽媽說要去迪化街）、ev_vf_y1w_0124（迪化街）、ev_vf_y1s_0828（姊姊回家住兩天）、ev_vf_y2w_0116（麵店長桌）、ev_vf_y3w_0108（參創）
   測試：node tests/aa440_vacfill_unit.js */
'use strict';
const VACFILL_LINES={
  /* ---------- 第 1 節 經濟系那年暑假（2025-07-12～08-12）---------- */
  /* 1-1 7/13（日）10:00 考完的第二天（家裡）*/
  y0_0713:{narr:'（考完的第二天，你睡到十點。客廳的桌上攤著一疊發票，媽媽在打計算機。）',mom:['起來了。','……考完了，今天幫我對發票。'],
    opts:['好。','我想再睡一下。'],yes:['這一疊是五金行那個客人的，對到月底就好。','（你對到中午。她一次都沒有問你考得怎樣。）'],no:['睡吧。','（中午你出來的時候，那疊發票已經對完了。）']},
  /* 1-2 7/16（三）21:00 經濟系那一群的群組（econ_friends）；7/19 南下高雄的（E35_PLAN sea／shop）第一個選項換 */
  y0_0716:{ms:[['econ_pinyu','欸考完的人出來一下'],['econ_tangrui','誰考完'],['econ_pinyu','他啊'],['econ_zhengxun','考完的話，週末吃飯。品妤請。'],['econ_pinyu','？？？']],
    yes:'週末可以。',yesSay:[['econ_pinyu','好 那就週六 我訂公館那家']],no:'放榜以後再說。',noSay:[['econ_tangrui','也對'],['econ_zhengxun','那放榜以後']],
    away:'這週末不在臺北。',awaySay:[['econ_pinyu','好啦 那放榜以後']]},
  /* 1-3 7/19（六）12:00 姊姊回來（家裡）；sleep＝15:30、第一句換；sea／shop＝7/26（六）12:00 成績出來了的版本 */
  y0_0719:{narr:'（中午，門開了。姊姊提著一個保冷袋，從台南坐高鐵回來。）',ask:'考得怎樣？',wait:'（你還沒回答。）',rice:'……不想講就不要講。我帶了肉燥，晚上吃。',
    opts:['還不知道。','妳專程回來？'],reply:['那就是還好。真的很爛你會直接說。','我週一放假。……媽叫我回來的，她說你考完一直在睡。'],
    dinner:'（晚上你出門的時候，姊姊在客廳說：「回來幫我帶一杯飲料。」）',
    sleepNarr:'（下午三點半，你剛醒。門開了，姊姊提著一個保冷袋，從台南坐高鐵回來。）'},
  y0_0726:{ask:'成績出來了？',opts:['還可以。','妳專程回來？'],reply:['那就是不錯。真的很爛你會直接說。','我週一放假。……媽叫我回來的，她說你從高雄回來以後一直在睡。']},   /* 旁白、「（你還沒回答。）」「……不想講就不要講。…」同 y0_0719 */
  /* 1-4 7/22（二）21:30 出成績前：交往中＝可昕視訊（sea／shop 不發）；沒交往＝姊姊私訊 */
  y0_0722:{kx:['禮拜五出成績。','……你不要一直刷新。刷了也不會比較快。','那天我不想一個人查。到時候再說。'],opts:['好。','妳自己也在等。'],
    yes:['嗯。睡覺。','（視訊結束。）'],no:'我等我的，你等你的。……一起等比較不無聊。',
    sis:['禮拜五出成績？','我那天上班 看到分數傳給我'],sisOpt:'好。',sisSay:'嗯'},
  /* 1-5 7/27（日）10:00 在家醒來：去學校走一走（15:00 一鍵到校門口）*/
  y0_0727:{wake:'（成績出來了。分數夠不夠，要等八月十三號。）',go:'（去學校走一走）',no:'（在家）',
    gate:'（同一個校門。你念經濟系的時候，每天從這裡進來。）',linze:'（你走到霖澤館前面。以前只從外面經過這一棟。）'},
  /* 1-5b 7/31（四）10:00 在家醒來：成績單寄到（AA_440 ca16c073d 補；BB_303 第 6 節 7/28～8/03 連 7 天沒有事）*/
  y0_0731:{narr:['（你去拿信。最上面一封是分科測驗的成績單，和網路上看到的一樣。）','（你把它夾進桌上那本書裡。放榜還有兩個禮拜。）']},
  /* 1-6 8/4（一）21:00 經濟系群組：等放榜（不用回）*/
  y0_0804:{ms:[['econ_pinyu','十三號放榜對吧'],['econ_zhengxun','對。不要問他，他會緊張。'],['econ_pinyu','我沒有問他啊 我問你'],['econ_tangrui','（貼圖：一隻在等的貓）']]},
  /* 1-7 8/8（五）20:00 父親節（視訊；家裡）*/
  y0_0808:{narr:'（家人群組的視訊。爸爸那邊是辦公室的白牆，媽媽坐在你旁邊，姊姊在台南。）',lines:[['爸爸','你媽說你考完了。'],['爸爸','……十三號？'],['宜蓁','爸，今天是父親節。是你要被祝的。'],['爸爸','喔。對。']],
    opts:['父親節快樂。','你什麼時候回來？'],reply:['好。……你媽說你這陣子都在睡。開學以後早點起床。','過年。……會早一點，我跟公司說了。'],end:'（媽媽把手機收起來，說：「他講話就是這樣。」）'},
  /* 1-8 8/10（日）21:00 交往中：可昕視訊（沒交往＝摘要池）*/
  y0_0810:{kx:['我在看政大的宿舍照片。……還沒放榜，先看。','床好小。你們的呢？'],opts:['我還不知道住哪一間。','應該一樣小。'],reply:['抽到再傳給我。我要比較。','那我們都睡不好。……公平。']},
  /* 1-9 8/13（三）20:30 家人群組（放榜演完以後；不用回）；8/16（六）10:00 在家醒來：錄取通知 */
  y0_0813:{ms:[['mom','（照片：電腦螢幕上的榜單，你的名字用紅筆圈起來）'],['dad','看到了。'],['dad','……好。法律好。'],['sister','恭喜']]},
  y0_0816:['（法律系的錄取通知寄到了。媽媽把信封放在你的桌上，沒有拆。）','（你拆開。和網路上看到的一樣，只是多了一張新生入學須知。）'],
  /* 1-10 8/17（日）21:00 群組；8/18（一）19:00 熱炒店（餞行）*/
  y0_0818:{ms:[['econ_zhengxun','明天晚上 公館 那家熱炒'],['econ_zhengxun','給要轉走的人餞行'],['econ_weilun','好']],yes:'好。',no:'我那天不行。',noSay:[['econ_pinyu','那下次 你來我們系上找我們']],
    narr:'（熱炒店的圓桌，啤酒杯碰在一起。）',lines:[['品妤','你真的要走喔。'],['阿勳','法律系離我們系館很近。……走路五分鐘。'],['韋綸','那以後午餐還一起吃嗎。']],
    opts:['一起吃。','看課表。'],reply:[['唐睿','說好了喔。'],['品妤','法律系的課表很可怕，我聽說的。']]},

  /* ---------- 第 2 節 大二暑假（2027）---------- */
  /* 2-1 6/18（五）21:00 麵店團群組；6/23（三）15:00 語彤 */
  y2_0618:{ms:[['zhe','放假第一週 大家在幹嘛'],['yu','睡覺！！睡到中午！！'],['classmate_bohan','在總圖。暑假開到五點。'],['zhe','……柏翰你是不是不知道什麼叫放假']],
    opts:['在家。','在宿舍。','在總圖。'],lib:[['classmate_bohan','三樓。我在窗邊。']],other:[['zhe','好喔']]},
  y2_0623:{ms:['麵店暑假開始賣涼麵了。','阿姨說你上次吃很快。'],yes:'我去吃。',no:'下次。',noSay:'嗯。'},
  /* 2-2 7/24（六）21:30 以安從台中（交往中）*/
  y2_0724:{ms:['台中好熱。','我媽在客廳看書，我在房間讀書。冷氣只開一台。','……你呢？'],
    study:'在家，也在讀書。',studySay:['讀哪一科？','（你說了。）','好。我也讀那一科。明天對進度。'],
    miss:'在想妳。',missSay:['……嗯。','我要讀書了。十點半再傳。'],photo:'（十點半她傳了一張課本的照片，旁邊空白處畫了一個小小的箭頭。）'},
  /* 2-3 7/28（三）16:00 學姊；7/29（四）14:00 法圖 */
  y2_0728:{ms:['法圖暑假開到五點。','冷氣很強，要帶外套。'],go:'我明天去。',thanks:'謝謝學姊。',thanksSay:'嗯。',find:'我去找妳。',
    narr:'（暑假的法圖只有三個人。學姊坐在最裡面，桌上兩本書、一件外套。）',sit:'坐。……外套你沒帶。',coat:'她把自己的推過來一半。',two:'……下次我帶兩件。'},
  /* 2-4 7/31（六）20:00 子晴；8/1（日）15:00 兩點半 Café */
  y2_0731:{ms:['我在做一個新的東西','暑假只有我跟冷氣','你要不要來看 不要講話那種'],pt:'新的那個 第二關做好了',
    yes:'好。',yesSay:['明天下午','Café'],no:'我不會看。',noSay:['不用會','看就好','……算了 下次'],
    narr:'（她的筆電轉過來給你看，畫面上是一座還沒有顏色的橋。她什麼都沒說。你也沒說。一個小時以後，她說：「好，可以了。」）'},
  /* 2-5 8/4（三）21:00 麵店團群組：香港的機票 */
  y2_0804:{ms:[['zhe','香港 機票誰還沒買'],['yu','我買了！！靠窗！！'],['classmate_bohan','我買了。行程表我做好了。'],['zhe','……柏翰你又做了']],
    bought:'買了。',boughtSay:[['zhe','好喔']],notyet:'還沒。',notyetSay:[['zhe','今天買 明天會漲']]},

  /* ---------- 第 3 節 大三寒假：過年以後到開學前（2028）---------- */
  /* 3-1 2/4（五）17:00 麵店開工（語彤）*/
  y3_0204:{ms:['阿姨換了新的菜單。','她說字寫大一點，老客人才看得到。'],yes:'我去吃。',no:'下次。',noSay:'嗯。',   /* AA_445 1-1（企劃線 fd200c2c6）：1/29 已經開了，2/4 改成新菜單 */
    narr:'（牆上的菜單是新的，字真的很大。最下面多了一行：「學生加麵不加價」。）',yt:'（端麵過來）……加了。',end:'（她把碗放下，回去收下一桌。）'},
  /* 3-2 2/8（二）21:00 麵店團群組；2/9（三）元宵 19:00 */
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
  y1s_0803:{ms:['阿姨問你暑假有沒有回來吃麵。'],yes:'明天去。'},
  y1s_0805:{ms:['我媽今天問你是誰。','我說是一起讀書的人。……她說好。']},
  y1s_0828:{narr:'（姊姊把你的房間當倉庫，堆了三箱書。）',sis:'台南的房子太小。先放你這裡。……你開學就不用了吧？'},
  /* 大二寒假：1/14（四）21:00 麵店團群組（1/16 麵店長桌）、1/22（五）姊姊 */
  y2w_0114:{ms:[['zhe','寒假還有誰在臺北'],['heroine_03','我在。店裡'],['yu','我！！']],yes:'我也在。',narr:'（長桌只坐了一半。阿姨多送了一盤小菜：「人少，吃多一點。」）'},
  y2w_0122:{ms:['我 2/3 回去','媽說你又在睡'],no:'沒有。',noSay:'她說你會這樣講'},
  /* 大二暑假：7/8（四）家人群組（照片的字在 VACFILL_UI）*/
  y2s_0708:{ms:[['dad','颱風。'],['mom','你那邊有颱風？'],['dad','這邊叫颱風。']]},
  /* 大三寒假：1/6（四）子晴（1/8 參創）、1/15（六）學姊 */
  y3w_0106:{ms:['期末考完了 我要去參創','你要的話 下午三點'],yes:'好。',narr:'（她帶你繞了一圈試玩區，在一台前面停了很久，什麼都沒說。）'},
  y3w_0115:{ms:['美國那邊的面試，排在下禮拜。','線上的。八月去的那一梯。'],yes:'加油。',yesSay:'嗯。……上了再跟你說。'},   /* AA_507 0-2 第 2 點（e4fbd0192）：11/12 申請送出去 → 12 月等結果 → 1/15 面試（原本「我送出去了」倒回去）；結果照舊三月 */
  /* 大四寒假：1/11（四）麵店團群組、1/20（六）以安（交往中）、1/27（六）家人群組 */
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
        '（學校的餐廳只開一間。你連吃了三天同一個便當。）','（總圖寒假開到五點。你五點出來的時候，天已經黑了。）','（媽媽傳訊息：「冰箱有你愛吃的。要回來嗎？」）',
        /* AA_443 第 2 節加寫（企劃線 f93fa3eda）*/ '（隔壁房間的門上貼著一張紙：「回家了，開學見」。）','（宿舍的洗衣機只剩一台能用。你排在一個學長後面。）','（公館有幾家店拉下了鐵門，貼著「年後見」。）','（你在書桌前坐了一整天。傍晚站起來的時候，腳是冰的。）','（交誼廳的飲水機壞了。你走到隔壁棟去裝水。）','（晚上的椰林大道沒有人。路燈一盞一盞亮到總圖。）'],
      summer:['（宿舍暑假住的多是外地生。走廊上有人在講你聽不懂的方言。）','（椰林大道的樹蔭下，只有遊客在拍照。）','（你在宿舍讀書，冷氣卡要儲值了。）',
        '（午後雷陣雨。你在總圖門口等雨停，等了半個小時。）','（暑修的學弟妹在宿舍的廚房煮泡麵，問你哪一科比較好過。）','（媽媽傳訊息：「暑假也不回來？……好，那記得吃飯。」）',
        /* AA_443 第 2 節加寫（企劃線 f93fa3eda）*/ '（中午的公館，騎樓下面比較涼。你沿著騎樓走到書店。）','（宿舍的冷氣嗡嗡響了一整晚。早上起來，喉嚨有點乾。）','（醉月湖邊的長椅上，有人在睡午覺。）','（你去總圖還書。暑假的總圖冷氣很強，你多待了兩個小時。）','（宿舍樓下的自動販賣機，你常喝的那一罐又賣完了。）','（晚上去操場跑步。跑了三圈，看到有人躺在操場中間看星星。）','（你把衣服拿去頂樓曬。太陽太大，一個小時就乾了。）','（公館的冰店排了一條很長的隊。你排到一半，放棄了。）','（你在宿舍讀了一整天的書。晚上出門買宵夜，才發現今天第一次開口說話。）','（傍晚的椰林大道，腳踏車比平常少。你騎得很快。）','（暑假的系館很安靜。你走過霖澤館穿堂，裡面只有一個在拖地的阿姨。）','（隔壁房搬來一個暑修的學生。半夜還聽得到他在講電話。）','（你去公館買了一支新的原子筆。舊的那支寫了一整個學期。）','（媽媽傳了一張家裡冷氣的照片：「這台修好了。回來吹？」）']}}
};
/* 稿裡只寫了「傳一張……的照片」、沒有照片說明的兩則：手機上照片那一則的字（LAWWW 寫的系統字，括號裡的字取自稿；不是台詞）*/
const VACFILL_UI={photoTyphoon:'📷（上海下大雨）',photoLantern:'📷（燈）'};
const VACFILL_EVENTS=(function(){
  const X=VACFILL_LINES;
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
    /* ===================== 第 1 節 經濟系那年暑假（stage econ；休學住家裡，ECONFF 第二階段：在家的事件 trigger home 到了就演，快轉停在那裡）===================== */
    { id:'ev_vf_y0_0713', stage:'econ', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>on(G,'2025-07-13',10)},
      dialogue:[ {scene:'臺北的家'}, {speaker:null,text:X.y0_0713.narr}, {speaker:'媽媽',name:'媽媽',text:X.y0_0713.mom[0]}, {speaker:'媽媽',name:'媽媽',text:X.y0_0713.mom[1]},
        choice(X.y0_0713.opts,['y','n']),
        {label:'y'},{speaker:'媽媽',name:'媽媽',text:X.y0_0713.yes[0]},{speaker:null,text:X.y0_0713.yes[1]},{goto:'e'},
        {label:'n'},{speaker:'媽媽',name:'媽媽',text:X.y0_0713.no[0]},{speaker:null,text:X.y0_0713.no[1]},
        {label:'e'} ] , after:noMemo('ev_vf_y0_0713') },
    /* 1-3 姊姊回來：7/19 12:00；E35_PLAN sleep（在家睡到下午三點）＝15:30、第一句換；sea／shop（7/19～7/23 在高雄）＝不演，改 7/26（ev_vf_y0_0726_sis）*/
    { id:'ev_vf_y0_0719_sis', stage:'econ', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>!south(G)&&on(G,'2025-07-19',plan(G)==='sleep'?15.5:12)},
      dialogue:[ {scene:'臺北的家'}, {if:{custom:G=>plan(G)!=='sleep'},speaker:null,text:X.y0_0719.narr}, {if:{custom:G=>plan(G)==='sleep'},speaker:null,text:X.y0_0719.sleepNarr},
        {speaker:'宜蓁',name:'宜蓁',text:X.y0_0719.ask}, {speaker:null,text:X.y0_0719.wait}, {speaker:'宜蓁',name:'宜蓁',text:X.y0_0719.rice},
        choice(X.y0_0719.opts,['a','b']),
        {label:'a'},{speaker:'宜蓁',name:'宜蓁',text:X.y0_0719.reply[0]},{goto:'e'},
        {label:'b'},{speaker:'宜蓁',name:'宜蓁',text:X.y0_0719.reply[1]},
        {label:'e'},{if:{custom:G=>F(G).VF_Y0_0719==='go'},speaker:null,text:X.y0_0719.dinner} ] , after:noMemo('ev_vf_y0_0719_sis') },   /* 那一晚：7/16 回了「週末可以。」的（7/19 晚上經濟系聚餐）*/
    { id:'ev_vf_y0_0726_sis', stage:'econ', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>south(G)&&on(G,'2025-07-26',12)},   /* 7/26 人不在臺北的家＝不演（trigger home）*/
      dialogue:[ {scene:'臺北的家'}, {speaker:null,text:X.y0_0719.narr}, {speaker:'宜蓁',name:'宜蓁',text:X.y0_0726.ask}, {speaker:null,text:X.y0_0719.wait}, {speaker:'宜蓁',name:'宜蓁',text:X.y0_0719.rice},
        choice(X.y0_0726.opts,['a','b']),
        {label:'a'},{speaker:'宜蓁',name:'宜蓁',text:X.y0_0726.reply[0]},{goto:'e'},
        {label:'b'},{speaker:'宜蓁',name:'宜蓁',text:X.y0_0726.reply[1]},
        {label:'e'} ] , after:noMemo('ev_vf_y0_0726_sis') },
    /* 7/19 晚上的出遊（1-2「週末可以。」；AA_440 沒有寫這一場的台詞：地點字幕＋時間往後）*/
    { id:'ev_vf_y0_0719', stage:'econ', title:'經濟系聚餐', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'公館',bg:'gongguan'} ] },
    { id:'ev_vf_y0_0722', stage:'econ', title:'視訊', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>on(G,'2025-07-22',21.5)&&dat(G,'kexin')&&!south(G)},   /* sea／shop：7/22 你們在一起（高雄），不發 */
      dialogue:[ {scene:'視訊',bg:'video'}, ...X.y0_0722.kx.map(t=>({speaker:'kexin',text:t})),
        choice(X.y0_0722.opts,['y','n']),
        {label:'y'},{speaker:'kexin',text:X.y0_0722.yes[0]},{speaker:null,text:X.y0_0722.yes[1]},{goto:'e'},
        {label:'n'},{speaker:'kexin',text:X.y0_0722.no},
        {label:'e'} ] },
    /* 1-5 7/27 10:00 在家醒來（人在臺北的家才出）：「（去學校走一走）」＝15:00 一鍵到校門口（src/vacfill3d.js 排出遊）*/
    { id:'ev_vf_y0_0727', stage:'econ', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>win(G,'2025-07-27',10,'2025-07-27',14)},
      dialogue:[ {scene:'臺北的家'}, {speaker:null,text:X.y0_0727.wake},
        {choice:[{text:X.y0_0727.go,set:{VF_Y0_0727:'go'}},{text:X.y0_0727.no,set:{VF_Y0_0727:'no'}}]} ],
      after:noMemo('ev_vf_y0_0727',G=>{ if(typeof VACFILL!=='undefined'&&VACFILL.phone) VACFILL.phone(G); }) },
    /* 1-5b 7/31 10:00 在家醒來（人在臺北的家才出；交往中、沒交往都一樣，不用選、不加數值）*/
    { id:'ev_vf_y0_0731', stage:'econ', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>win(G,'2025-07-31',10,'2025-07-31',14)},
      dialogue:[ {scene:'臺北的家'}, ...X.y0_0731.narr.map(t=>({speaker:null,text:t})) ],
      after:noMemo('ev_vf_y0_0731') },
    { id:'ev_vf_y0_0727_gate', stage:'econ', title:'', participants:[], location:'campus', trigger:'auto', once:true, background:'blur',
      prereq:{custom:G=>{ const d=D('2025-07-27'); if(d==null||G.day!==d||F(G).VF_Y0_0727!=='go') return false; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'vf_y0_0727'):null; return !!q&&q.state==='done'; }},
      dialogue:[ {speaker:null,text:X.y0_0727.gate} ],
      after:noMemo('ev_vf_y0_0727_gate',G=>{ G.flags.VF_Y0_0727='walk'; } )},
    { id:'ev_vf_y0_0727_linze', stage:'econ', title:'', participants:[], location:'campus', near:{x:34,z:-98,r:7}, trigger:'auto', once:true, background:'blur',
      prereq:{custom:G=>{ const d=D('2025-07-27'); return d!=null&&G.day===d&&F(G).VF_Y0_0727==='walk'; }},
      dialogue:[ {speaker:null,text:X.y0_0727.linze} ],
      after:noMemo('ev_vf_y0_0727_linze',G=>{ G.flags.VF_Y0_0727='front'; } )},
    { id:'ev_vf_y0_0808', stage:'econ', title:'父親節', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>on(G,'2025-08-08',20)},
      dialogue:[ {scene:'臺北的家'}, {speaker:null,text:X.y0_0808.narr}, ...X.y0_0808.lines.map(([s,t])=>({speaker:s,name:s,text:t})),
        choice(X.y0_0808.opts,['a','b']),
        {label:'a'},{speaker:'爸爸',name:'爸爸',text:X.y0_0808.reply[0]},{goto:'e'},
        {label:'b'},{speaker:'爸爸',name:'爸爸',text:X.y0_0808.reply[1]},
        {label:'e'},{speaker:null,text:X.y0_0808.end} ] },
    { id:'ev_vf_y0_0810', stage:'econ', title:'視訊', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>on(G,'2025-08-10',21)&&dat(G,'kexin')},
      dialogue:[ {scene:'視訊',bg:'video'}, ...X.y0_0810.kx.map(t=>({speaker:'kexin',text:t})),
        choice(X.y0_0810.opts,['a','b']),
        {label:'a'},{speaker:'kexin',text:X.y0_0810.reply[0]},{goto:'e'},
        {label:'b'},{speaker:'kexin',text:X.y0_0810.reply[1]},
        {label:'e'} ] },
    /* 1-8 沒交往：8/10 早上起床放摘要池的一句（第 5 節住家裡・暑假，照順序）*/
    { id:'ev_vf_y0_0810_sum', stage:'econ', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>on(G,'2025-08-10',8.5)&&!dat(G,'kexin')},
      dialogue:[ {scene:'臺北的家'}, {call:async(G,GM)=>{ if(typeof VACFILL!=='undefined'&&VACFILL.poolSay) await VACFILL.poolSay(GM,'Y0S','home','summer'); }} ] , after:noMemo('ev_vf_y0_0810_sum') },
    /* 1-9 8/16（六）10:00 在家醒來：錄取通知（放榜 8/13 以後）*/
    { id:'ev_vf_y0_0816', stage:'econ', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>on(G,'2025-08-16',10)},
      dialogue:[ {scene:'臺北的家'}, ...X.y0_0816.map(t=>({speaker:null,text:t})) ] , after:noMemo('ev_vf_y0_0816') },
    /* 1-10 8/18（一）19:00 熱炒店（餞行；8/17 群組回「好。」）*/
    { id:'ev_vf_y0_0818', stage:'econ', title:'和經濟系那一群吃飯', participants:['econ_pinyu','econ_zhengxun'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'公館・熱炒店',bg:'gongguan'}, {speaker:null,text:X.y0_0818.narr}, ...X.y0_0818.lines.map(([s,t])=>({speaker:s,text:t})),
        choice(X.y0_0818.opts,['a','b']),
        {label:'a'},{speaker:X.y0_0818.reply[0][0],text:X.y0_0818.reply[0][1]},{goto:'e'},
        {label:'b'},{speaker:X.y0_0818.reply[1][0],text:X.y0_0818.reply[1][1]},
        {label:'e'} ] },

    /* ===================== 第 2 節 大二暑假 ===================== */
    { id:'ev_vf_y2_0729', title:'法圖', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'法圖'}, {speaker:null,text:X.y2_0728.narr}, {speaker:'heroine_05',text:X.y2_0728.sit},
        {if:{custom:G=>F(G).VF_Y2_0729!=='find'},speaker:null,text:X.y2_0728.coat},
        {if:{custom:G=>F(G).VF_Y2_0729==='find'},speaker:'heroine_05',text:X.y2_0728.two} ] },   /* 和學姊交往中、回「我去找妳。」：最後一句換成「……下次我帶兩件。」*/
    { id:'ev_vf_y2_0801', title:'兩點半 Café', participants:['heroine_04'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'兩點半 Café'}, {speaker:null,text:X.y2_0731.narr} ] },

    /* ===================== 第 3 節 大三寒假 ===================== */
    { id:'ev_vf_y3_0204', title:'阿鳳麵店', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'阿鳳麵店',bg:'noodle_table'}, {speaker:null,text:X.y3_0204.narr}, {speaker:'heroine_03',text:X.y3_0204.yt}, {speaker:null,text:X.y3_0204.end} ] },
    { id:'ev_vf_y3_0209', title:'元宵的燈會', participants:['yu'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
      dialogue:[ {scene:X.y3_0209.place,bg:'vf_lantern'}, {speaker:null,text:X.y3_0209.narr}, {speaker:'yu',text:X.y3_0209.yu},
        {if:{custom:G=>here(G,'zhe')},speaker:'zhe',text:X.y3_0209.zhe},
        {if:{custom:G=>here(G,'zhe')},speaker:null,text:X.y3_0209.back},
        {if:{custom:G=>!here(G,'zhe')},speaker:null,text:X.y3_0209.backNoZhe} ],   /* 阿哲大三寒假多半在高雄（BB_303 第 3 節）：2/9 他不在臺北＝他的句子拿掉、回程旁白換 */
      after:G=>{ G.flags.VF_Y3_LANTERN='went'; } },
    { id:'ev_vf_y3_0214', title:'法圖', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'法圖'}, {speaker:null,text:X.y3_0212.narr} ] },

    /* ===================== 第 4 節 ===================== */
    /* 大一寒假 1/23 15:00 住家裡：媽媽當面說（留宿舍的是私訊，src/vacfill3d.js）；說完排 1/24 的迪化街 */
    { id:'ev_vf_y1w_0123', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>win(G,'2026-01-23',15,'2026-01-24',0)&&F(G).VF_Y1W_DIHUA_MODE!=='dm'},
      dialogue:[ {scene:'臺北的家'}, {speaker:'媽媽',name:'媽媽',text:X.y1w_0123.mom} ],
      after:noMemo('ev_vf_y1w_0123',G=>{ G.flags.VF_Y1W_DIHUA_MODE='home'; G.flags.VF_Y1W_DIHUA='go'; if(typeof VACFILL!=='undefined'&&VACFILL.phone) VACFILL.phone(G); } )},
    { id:'ev_vf_y1w_0124', title:'迪化街', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
      dialogue:[ {scene:'迪化街'}, {speaker:null,text:X.y1w_0123.narr}, {speaker:'媽媽',name:'媽媽',text:X.y1w_0123.fish} ] },
    /* 大一暑假 8/28（五）～8/29：姊姊回家住兩天（在家的時候演）*/
    { id:'ev_vf_y1s_0828', title:'', participants:[], location:'any', trigger:'home', once:true, background:'dark',
      prereq:{custom:G=>win(G,'2026-08-28',18,'2026-08-30',0)},
      dialogue:[ {scene:'臺北的家'}, {speaker:null,text:X.y1s_0828.narr}, {speaker:'宜蓁',name:'宜蓁',text:X.y1s_0828.sis} ] , after:noMemo('ev_vf_y1s_0828') },
    { id:'ev_vf_y2w_0116', title:'阿鳳麵店', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'}, {speaker:null,text:X.y2w_0114.narr} ] },
    { id:'ev_vf_y3w_0108', title:'參創', participants:['heroine_04'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'參創生活園區',bg:'d03_base_afternoon'}, {speaker:null,text:X.y3w_0106.narr} ] }
  ];
})();
/* 元宵的燈會：2D 夜景、人潮（AA_440 3-2）——還沒有圖＝深色底＋地點字幕（MISSING_EXTERNAL_ART，等 BB 跟使用者要）*/
if(typeof OUT!=='undefined'&&OUT.BG&&!OUT.BG.vf_lantern) OUT.BG.vf_lantern={label:'元宵的燈會',image:null};
if(typeof STORY_EVENTS!=='undefined') for(const e of VACFILL_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
