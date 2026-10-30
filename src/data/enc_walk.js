/* 自由出行的偶遇第三批（DL-08）：一起走一段、重訪、小支線的台詞。企劃線 claude/cool-heisenberg-o8kuqx free_trip/aa_walk_v1.json（AA_162 第 7 節）＋bb_walk_v1.json（BB_147，BB-B 8e0399ff）；AA_160 第 6 節定案。照抄，不在這裡改內容。第三批景點（spots_v3）的 AA 六位：AA_271，aa_walk_v1.json@fef59a02（AA-C 2026-10-17；第一、二批已同步成 AA_209 附錄 A 改稿版，和這裡一致）加 D26、D14、D11、D01、D02、D29 的條目。BB 五位第三批：bb_walk_v1.json@0544a147 的 batch:3（BB_213，AA-C 核對通過）；芷若 D02 生態池那句掛在散步（act walk；BB-C 0544a147 更正）。第二批景點（D09、D18、D20、D24、D25）的條目換成 aa_walk_v1／bb_walk_v1@aca122d2（AA-C 照 AA_188 口語審、BB-C 口氣審 b13052e5）。第二批景點（D09、D18、D20、D24、D25）的條目換成 aa_walk_v1／bb_walk_v1@aca122d2（AA-C 照 AA_188 口語審、BB-C 口氣審 b13052e5）。 */
const ENC_WALK={
 "source": "企劃線 claude/cool-heisenberg-o8kuqx free_trip/aa_walk_v1.json（AA_162 第 7 節）＋bb_walk_v1.json（BB_147，BB-B 8e0399ff）；AA_160 第 6 節定案。照抄，不在這裡改內容。",
 "rules": {
  "aa": {
   "values": "一起走一段照 AA_124 1-2「一起去 Café 坐坐」（熟悉 +3、信任 +1、自在 +2），受每天上限；同一個人一天一次；不加戀愛，不算約會（AA_160 第 6 節）",
   "join": {
    "heroine_01": "朋友以上；D06 不選 D06.frame（她一個人想事情的地方）",
    "heroine_03": "朋友以上；D13 要心願完成以後",
    "zhe": "不限關係（偶遇本身要「認識」以上）",
    "yu": "不限關係；只在 D04（D20 是社團點名，不一起走）",
    "classmate_bohan": "D06 朋友以上；D09 有點熟以上",
    "classmate_xinci": "不一起走（join:false）"
   },
   "ex": "前任不一起走；重訪用 afterBreakup（只有以安、語彤）",
   "revisit": "這次沒有遇到他／她才說；一個地方說一次，要再遇到、留下新紀錄才會再說",
   "rain": "D04、D06 照用；D12、D13 雨天沒有偶遇；D25 下雨時 D25.shore 灰掉；D09 下雨纜車停駛（去不了）",
   "once": "同一件事一趟只說一次"
  },
  "bb": {
   "values": "一起走一段照 AA_124 1-2「一起去 Café 坐坐」（熟悉 +3、信任 +1、自在 +2），受每天上限；同一個人一天一次；不加戀愛，不算約會（AA-B 2026-10-16）",
   "join": {
    "heroine_02": "朋友以上，19:30 以後",
    "heroine_04": "不限關係",
    "heroine_05": "朋友以上；有伴侶時只陪一件事",
    "classmate_peishan": "不限關係；D06 不選 D06.frame（心願事件的地方）",
    "kexin": "只在交往中"
   },
   "ex": "前任不一起走；重訪用 afterBreakup",
   "revisit": "這次沒有遇到她才說；一個地方說一次，要再遇到她、留下新紀錄才會再說",
   "rain": "D04、D06 的 walk 在雨天照用（改在騎樓下走）；D12、D13 雨天沒有偶遇",
   "once": "同一件事一趟只說一次"
  }
 },
 "walk": [
  {
   "who": "heroine_01",
   "spot": "D06",
   "act": "D06.gallery",
   "friend": [
    "這一張，我看了三分鐘還不懂。……好，我承認不懂。"
   ],
   "dating": [
    "你站我旁邊看就好。不用解釋。我也不解釋。"
   ]
  },
  {
   "who": "heroine_01",
   "spot": "D06",
   "act": "walk",
   "friend": [
    "十二點半以前還有四十分鐘，樓上那區也可以看。"   /* AA_209 附錄A §2 */
   ],
   "dating": [
    "坐一下。表上沒有寫，可是可以。"
   ]
  },
  {
   "who": "heroine_01",
   "spot": "D06",
   "act": "D06.cafe",
   "friend": [
    "這裡的拿鐵比 Café 貴四十塊。"   /* AA_209 附錄A §2 */
   ],
   "dating": [
    "你的那杯，我喝一口。……好，我的比較好喝。"
   ]
  },
  {
   "who": "heroine_03",
   "spot": "D12",
   "act": "walk",
   "friend": [
    "……走慢一點。我要拍。"
   ],
   "dating": [
    "你走前面。……你的背影，可以拍嗎。"
   ]
  },
  {
   "who": "heroine_03",
   "spot": "D12",
   "act": "D12.tea",
   "friend": [
    "老闆的手，我拍過。……他不知道。"
   ],
   "dating": [
    "這包，帶回去給阿姨。你付一半。"
   ]
  },
  {
   "who": "heroine_03",
   "spot": "D12",
   "act": "D12.pier",
   "friend": [
    "這裡的船，假日才比較多。"
   ],
   "dating": [
    "……坐下。不用說話。"
   ]
  },
  {
   "who": "heroine_03",
   "spot": "D13",
   "act": "walk",
   "friend": [
    "上次來，沒有注意到這些攤子。"
   ],
   "dating": [
    "這次換我帶路。"
   ]
  },
  {
   "who": "heroine_03",
   "spot": "D13",
   "act": "D13.rail",
   "friend": [
    "觀音山……今天比較近。"
   ],
   "dating": [
    "山今天很清楚。……你不要一直看我。"
   ]
  },
  {
   "who": "heroine_03",
   "spot": "D13",
   "act": "D13.bench",
   "friend": [
    "坐這裡。不拍照。"
   ],
   "dating": [
    "……今天的照片，一張都不拍。"
   ]
  },
  {
   "who": "zhe",
   "spot": "D04",
   "act": "walk",
   "friend": [
    "欸你看，那個人在噴火。這個要申請嗎？我們好像有教過……算了我忘了。"   /* AA_209 附錄A §2 */
   ],
   "dating": []
  },
  {
   "who": "zhe",
   "spot": "D04",
   "act": "D04.redhouse",
   "friend": [
    "這棟我小時候來過。我爸說這是古蹟，不能爬。我就沒爬。……我很乖吧。"
   ],
   "dating": []
  },
  {
   "who": "zhe",
   "spot": "D04",
   "act": "D04.snack",
   "friend": [
    "站著吃比較好吃。為什麼？我也不知道。很好吃就對了。"
   ],
   "dating": []
  },
  {
   "who": "yu",
   "spot": "D04",
   "act": "walk",
   "friend": [
    "欸那家店在打折！對了你要不要買一件？……你不要對不對。"
   ],
   "dating": []
  },
  {
   "who": "yu",
   "spot": "D04",
   "act": "D04.redhouse",
   "friend": [
    "這裡以前是市場耶。我上次在一個展覽看到的。……還是我記錯了？"
   ],
   "dating": []
  },
  {
   "who": "yu",
   "spot": "D04",
   "act": "D04.snack",
   "friend": [
    "好燙好燙。欸你不要笑，我舌頭很敏感。"
   ],
   "dating": []
  },
  {
   "who": "classmate_bohan",
   "spot": "D06",
   "act": "D06.gallery",
   "friend": [
    "這一區有十二件。我每一件看兩分鐘，剛好。"
   ],
   "dating": [],
   "cond": {
    "terms": [
     "Y3S1",
     "Y3S2",
     "Y4S1",
     "Y4S2"
    ]
   }
  },
  {
   "who": "classmate_bohan",
   "spot": "D06",
   "act": "walk",
   "friend": [
    "……坐在草上。褲子會髒。……算了。"
   ],
   "dating": [],
   "cond": {
    "terms": [
     "Y3S1",
     "Y3S2",
     "Y4S1",
     "Y4S2"
    ]
   }
  },
  {
   "who": "classmate_bohan",
   "spot": "D06",
   "act": "D06.cafe",
   "friend": [
    "一杯一百五。比學餐貴三倍。……好喝。"
   ],
   "dating": [],
   "cond": {
    "terms": [
     "Y3S1",
     "Y3S2",
     "Y4S1",
     "Y4S2"
    ]
   }
  },
  {
   "who": "zhe",
   "spot": "D25",
   "act": "D25.shore",
   "friend": [
    "哥你站那裡，浪來了就跳。……跳得太早了。"
   ],
   "dating": []
  },
  {
   "who": "zhe",
   "spot": "D25",
   "act": "D25.cafe",
   "friend": [
    "我要冰的。剛剛喝了太多海水。"
   ],
   "dating": []
  },
  {
   "who": "classmate_bohan",
   "spot": "D09",
   "act": "D09.tea",
   "friend": [
    "這壺茶兩百五。……算了，今天不算錢。"
   ],
   "dating": [],
   "cond": {
    "terms": [
     "Y4S1"
    ]
   }
  },
  {
   "who": "classmate_bohan",
   "spot": "D09",
   "act": "D09.gondola",
   "friend": [
    "坐纜車要二十幾分鐘。今天沒帶單字卡。"
   ],
   "dating": [],
   "cond": {
    "terms": [
     "Y4S1"
    ]
   }
  },
  {
   "who": "heroine_02",
   "spot": "D04",
   "act": "walk",
   "friend": [
    "散場的人都走得比較慢。……大家還在電影裡。"
   ],
   "dating": [
    "你走慢一點。我還在最後一幕。"
   ],
   "cond": {
    "from": 19.5
   }
  },
  {
   "who": "heroine_02",
   "spot": "D04",
   "act": "D04.redhouse",
   "friend": [
    "紅磚在晚上比較好看。白天太用力了。"
   ],
   "dating": [
    "你拍我做什麼。……拍樓。"
   ],
   "cond": {
    "from": 19.5
   }
  },
  {
   "who": "heroine_02",
   "spot": "D04",
   "act": "D04.snack",
   "friend": [
    "看完電影要吃熱的。我每次都這樣。"
   ],
   "dating": [
    "站著吃剛好。……你吃得比我快，等我。"
   ],
   "cond": {
    "from": 19.5
   }
  },
  {
   "who": "heroine_04",
   "spot": "D04",
   "act": "walk",
   "friend": [
    "你走好快。我剛打完，手還在抖。"
   ],
   "dating": [
    "左手給你。右手是我的命，要留著打歌。"
   ]
  },
  {
   "who": "heroine_04",
   "spot": "D04",
   "act": "D04.redhouse",
   "friend": [
    "這種老房子畫起來很好看。……窗戶很難畫。"
   ],
   "dating": [
    "這個角度我記起來了。回去畫。"
   ]
  },
  {
   "who": "heroine_04",
   "spot": "D04",
   "act": "D04.snack",
   "friend": [
    "好燙。欸不是，你為什麼可以直接吃。"
   ],
   "dating": [
    "你幫我吹一下。……真的很燙。"
   ]
  },
  {
   "who": "heroine_04",
   "spot": "D12",
   "act": "walk",
   "friend": [
    "每一間都很像，可是都不一樣。做場景的人會哭。"
   ],
   "dating": [
    "你走前面。我想看你走在這條街上。……參考用。"
   ]
  },
  {
   "who": "heroine_04",
   "spot": "D12",
   "act": "D12.tea",
   "friend": [
    "我不懂茶。……可是這個罐子的顏色我要記起來。"
   ],
   "dating": [
    "你先喝，跟我說苦不苦。我再決定要不要喝。"
   ]
  },
  {
   "who": "heroine_04",
   "spot": "D12",
   "act": "D12.pier",
   "friend": [
    "這邊的風剛好。程式碼想不出來的時候，就來吹。"
   ],
   "dating": [
    "你坐這邊。我的筆電借你擋風。"
   ]
  },
  {
   "who": "heroine_04",
   "spot": "D12",
   "act": "D12.sunset",
   "friend": [
    "這個光，我調了三天都調不出來。"
   ],
   "dating": [
    "不要說話。……我在記這個顏色。"
   ]
  },
  {
   "who": "heroine_05",
   "spot": "D06",
   "act": "walk",
   "friend": [
    "我排的時間還有四十分鐘。走一圈剛好。"
   ],
   "dating": [
    "今天的計畫只有一行：來美術館。剩下的，跟你走。"
   ]
  },
  {
   "who": "heroine_05",
   "spot": "D06",
   "act": "D06.gallery",
   "friend": [
    "這一間燈很暗，畫要站近一點看。"
   ],
   "dating": [
    "你看你的。看完來找我，我在最後一間。"
   ]
  },
  {
   "who": "heroine_05",
   "spot": "D06",
   "act": "D06.frame",
   "friend": [
    "站進去。……不，我不拍。我只是想看看。"
   ],
   "dating": [
    "換我站。……你看到什麼？不用說，我知道。"
   ]
  },
  {
   "who": "heroine_05",
   "spot": "D06",
   "act": "D06.cafe",
   "friend": [
    "美術館的咖啡比較貴。我把它算進門票了。"
   ],
   "dating": [
    "這杯算我的。不在計畫裡。是我想。"
   ]
  },
  {
   "who": "classmate_peishan",
   "spot": "D12",
   "act": "walk",
   "friend": [
    "這條街好像繪本的插圖。一頁一頁翻過去。"
   ],
   "dating": [
    "你幫我拿書。……我想空出一隻手。"
   ],
   "cond": {
    "terms": [
     "Y1S1",
     "Y1S2",
     "Y2S1"
    ]
   }
  },
  {
   "who": "classmate_peishan",
   "spot": "D12",
   "act": "D12.tea",
   "friend": [
    "這個味道，好像下雨前的舊書店。"
   ],
   "dating": [
    "你喝一口，告訴我是什麼味道。我想寫下來。"
   ],
   "cond": {
    "terms": [
     "Y1S1",
     "Y1S2",
     "Y2S1"
    ]
   }
  },
  {
   "who": "classmate_peishan",
   "spot": "D12",
   "act": "D12.pier",
   "friend": [
    "我小時候以為，河對面就是另一個國家。"
   ],
   "dating": [
    "我讀一頁給你聽。……只讀一頁，風太大了。"
   ],
   "cond": {
    "terms": [
     "Y1S1",
     "Y1S2",
     "Y2S1"
    ]
   }
  },
  {
   "who": "classmate_peishan",
   "spot": "D12",
   "act": "D12.sunset",
   "friend": [
    "今天的天空，可以畫成封面。"
   ],
   "dating": [
    "你不要看我。看夕陽。……好，可以看一下。"
   ],
   "cond": {
    "terms": [
     "Y1S1",
     "Y1S2",
     "Y2S1"
    ]
   }
  },
  {
   "who": "classmate_peishan",
   "spot": "D06",
   "act": "walk",
   "friend": [
    "小孩子在草地上都用跑的。大人都忘了。"
   ],
   "dating": [
    "你跑一下給我看好不好！……我想看。"
   ],
   "cond": {
    "terms": [
     "Y3S1",
     "Y3S2",
     "Y4S1",
     "Y4S2"
    ]
   }
  },
  {
   "who": "classmate_peishan",
   "spot": "D06",
   "act": "D06.gallery",
   "friend": [
    "小孩看畫，先看最大的顏色。我在學他們。"
   ],
   "dating": [
    "我們今天只看三幅。看慢一點。"
   ],
   "cond": {
    "terms": [
     "Y3S1",
     "Y3S2",
     "Y4S1",
     "Y4S2"
    ]
   }
  },
  {
   "who": "kexin",
   "spot": "D13",
   "act": "walk",
   "friend": [],
   "dating": [
    "一直走的話，會走到出海口嗎？……你算，我聽。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D13",
   "act": "D13.drink",
   "friend": [],
   "dating": [
    "一杯就好，兩根吸管。……你不要喝太大口。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D13",
   "act": "D13.rail",
   "friend": [],
   "dating": [
    "予樂說我們很吵。我們明明都沒講話。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D13",
   "act": "D13.bench",
   "friend": [],
   "dating": [
    "這張長椅看夕陽的效用最大。……我查過了。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D13",
   "act": "D13.photo",
   "friend": [],
   "dating": [
    "太陽下去的速度，每次都比我想的快。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D04",
   "act": "walk",
   "friend": [],
   "dating": [
    "予樂說她不想當電燈泡。她剛剛真的用了這個詞。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D04",
   "act": "D04.lobby",
   "friend": [],
   "dating": [
    "你選。我選的話，會選最便宜的那一場。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D04",
   "act": "D04.redhouse",
   "friend": [],
   "dating": [
    "這棟比政大所有的樓都老。……我猜的，沒查。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D04",
   "act": "D04.snack",
   "friend": [],
   "dating": [
    "你吃一口我的。……經濟學說這叫交換。"
   ]
  },
  {
   "who": "kexin",
   "spot": "D09",
   "act": "D09.gondola",
   "friend": [],
   "dating": [
    "纜車往下比較晃。你坐那邊，我坐這邊。"
   ],
   "batch": 2
  },
  {
   "who": "kexin",
   "spot": "D09",
   "act": "D09.tea",
   "friend": [],
   "dating": [
    "茶館老闆認得政大的人。他問我今天怎麼沒帶書。"
   ],
   "batch": 2
  },
  {
   "who": "kexin",
   "spot": "D09",
   "act": "D09.view",
   "friend": [],
   "dating": [
    "從這裡看得到政大。那一棟，是我每天爬的樓梯。"
   ],
   "batch": 2
  },
  {
   "who": "heroine_04",
   "spot": "D18",
   "act": "D18.snack",
   "friend": [
    "這個顏色我要記起來。……好，先吃。"
   ],
   "dating": [
    "你那碗紫色的比較多。換。"
   ],
   "batch": 2
  },
  {
   "who": "heroine_04",
   "spot": "D18",
   "act": "D18.teahouse",
   "friend": [
    "從窗戶看出去，燈籠一層一層。這叫視差。"
   ],
   "dating": [
    "坐這裡。燈籠在你後面，我想畫下來。"
   ],
   "batch": 2
  },
  {
   "who": "heroine_04",
   "spot": "D18",
   "act": "D18.shop",
   "friend": [
    "這個木頭陀螺……我小時候有一個。"
   ],
   "dating": [
    "你買那個給我。我要放在螢幕旁邊。"
   ],
   "batch": 2
  },
  {
   "who": "heroine_05",
   "spot": "D24",
   "act": "D24.footbath",
   "friend": [
    {
     "who": "wen_mother",
     "t": "學弟，坐。水很燙，慢慢放。"
    },
    "……他們很少叫人坐。你坐吧。"
   ],
   "dating": [],
   "cond": {
    "stageMin": "FRIEND",
    "notDating": true
   },
   "batch": 2
  },
  {
   "who": "classmate_peishan",
   "spot": "D20",
   "act": "D20.bridge",
   "friend": [
    "小孩子都想從橋上丟石頭。我一直在看誰手上拿著石頭。"
   ],
   "dating": [
    "你牽那一排，我牽這一排。過橋不要放手。"
   ],
   "batch": 2
  },
  {
   "who": "classmate_peishan",
   "spot": "D20",
   "act": "D20.trolley",
   "friend": [
    "台車很慢。小孩說像在坐時光機。"
   ],
   "dating": [
    "你跟我坐同一台。小孩坐前面那台，我看得到。"
   ],
   "batch": 2
  },
  {
   "who": "classmate_peishan",
   "spot": "D20",
   "act": "D20.falls",
   "friend": [
    "瀑布前面，每個小孩都安靜了。我第一次看到他們安靜。"
   ],
   "dating": [
    "水聲好大。你剛剛說什麼？我沒聽到。"
   ],
   "batch": 2
  },
  {
   "who": "heroine_02",
   "spot": "D25",
   "act": "D25.shore",
   "friend": [
    "浪到腳邊的時候不要跑。它會自己退回去。"
   ],
   "dating": [
    "你的鞋子濕了。等一下在堤防上晒一下。"
   ],
   "batch": 2
  },
  {
   "who": "heroine_02",
   "spot": "D25",
   "act": "D25.surf",
   "friend": [
    "衝浪的人一直在等浪。等很久，站起來一下。跟拍照一樣。"
   ],
   "dating": [
    "那個人摔了好幾次。夏天我想來學。"
   ],
   "batch": 2
  },
  {
   "who": "heroine_02",
   "spot": "D25",
   "act": "D25.cafe",
   "friend": [
    "海邊的咖啡比我們店裡貴。豆子是一樣的。"
   ],
   "dating": [
    "這杯的拉花歪了。我們店裡不會出這種杯。"
   ],
   "batch": 2
  },
 {
  "who": "heroine_01",
  "spot": "D26",
  "act": "D26.village",
  "friend": [
   "這間的檸檬飲料，我高中下課常常來買。"
  ],
  "dating": [
   "你喝喝看。我高中都點這一杯。"
  ]
 },
 {
  "who": "heroine_01",
  "spot": "D26",
  "act": "walk",
  "friend": [
   "從這裡走到美術館大概十五分鐘。走慢一點也來得及。"
  ],
  "dating": [
   "走這邊，樹比較多，比較不會曬。"
  ]
 },
 {
  "who": "heroine_01",
  "spot": "D26",
  "act": "D26.museum",
  "friend": [
   "國美館不用門票。我國中來這裡寫生，畫得很爛。"
  ],
  "dating": [
   "這個展我還沒看過。剛好一起看。"
  ]
 },
 {
  "who": "heroine_03",
  "spot": "D14",
  "act": "D14.ferry",
  "friend": [
   "坐後面。前面浪會打上來，相機會濕。"
  ],
  "dating": [
   "你坐裡面。我想坐靠水那邊。"
  ]
 },
 {
  "who": "heroine_03",
  "spot": "D14",
  "act": "D14.sunset",
  "friend": [
   "要拍的話就是現在。再幾分鐘就沒了。"
  ],
  "dating": [
   "你站過去一點。好，不要動。"
  ]
 },
 {
  "who": "heroine_03",
  "spot": "D14",
  "act": "walk",
  "friend": [
   "這邊的人都在釣魚。我站了十分鐘，沒看到誰釣到。"
  ],
  "dating": [
   "走慢一點。前面有一塊木板是鬆的。"
  ]
 },
 {
  "who": "classmate_bohan",
  "spot": "D11",
  "act": "walk",
  "friend": [
   "這條溪的水是熱的。我上次來，還以為哪裡失火。"
  ],
  "dating": []
 },
 {
  "who": "classmate_bohan",
  "spot": "D11",
  "act": "D11.valley",
  "friend": [
   "告示說不能碰。我本來想試試看有多燙，還好沒有。"
  ],
  "dating": []
 },
 {
  "who": "classmate_bohan",
  "spot": "D11",
  "act": "D11.museum",
  "friend": [
   "這裡以前是公共浴場。說明我看完了，你要自己看還是我講？"
  ],
  "dating": []
 },
 {
  "who": "yu",
  "spot": "D01",
  "act": "D01.market",
  "friend": [
   "欸這攤可以試吃！對了你吃辣嗎？這片好像有辣。"
  ],
  "dating": []
 },
 {
  "who": "yu",
  "spot": "D01",
  "act": "D01.wall",
  "friend": [
   "你幫我拍一張。不要拍到腳，我今天鞋子很醜。"
  ],
  "dating": []
 },
 {
  "who": "yu",
  "spot": "D01",
  "act": "walk",
  "friend": [
   "那根煙囪以前是在燒什麼？酒廠嗎？等一下我查。"
  ],
  "dating": []
 },
 {
  "who": "zhe",
  "spot": "D29",
  "act": "walk",
  "friend": [
   "那艘船我高中騎車上學每天都看到。應該不是同一艘啦。"
  ],
  "dating": []
 },
 {
  "who": "zhe",
  "spot": "D29",
  "act": "D29.sculpture",
  "friend": [
   "這個我小時候以為是外星人的船。現在看還是很像。"
  ],
  "dating": []
 },
 {
  "who": "zhe",
  "spot": "D29",
  "act": "D29.rail",
  "friend": [
   "這條鐵道以前有火車喔，我阿公說的。他說的我都沒查過。"
  ],
  "dating": []
 },
 {
  "who": "heroine_04",
  "spot": "D01",
  "act": "walk",
  "friend": [
   "市集的人都很會講自己的東西。我不行。"
  ],
  "dating": [
   "你走裡面。外面一直有人推。"
  ],
  "batch": 3
 },
 {
  "who": "heroine_04",
  "spot": "D01",
  "act": "D01.market",
  "friend": [
   "這攤的老闆是做獨立遊戲的。他說周邊比遊戲好賣。"
  ],
  "dating": [
   "那隻貓的你買。我買狗的。"
  ],
  "batch": 3
 },
 {
  "who": "heroine_04",
  "spot": "D01",
  "act": "D01.lawn",
  "friend": [
   "坐一下。我平常都坐在電腦前面，站太久腳會痠。"
  ],
  "dating": [
   "草有點濕。坐我的外套上面。"
  ],
  "batch": 3
 },
 {
  "who": "heroine_02",
  "spot": "D02",
  "act": "D02.books",
  "friend": [
   "這一區是電影書。我每次來都翻同一本，都沒買。"
  ],
  "dating": [
   "這本你幫我拿著。結帳的時候我再決定。"
  ],
  "batch": 3
 },
 {
  "who": "heroine_02",
  "spot": "D02",
  "act": "D02.corridor",
  "friend": [
   "這條長廊的光，拍起來會像老電影。"
  ],
  "dating": [
   "你站那格窗下面。不要動，我記一下光。"
  ],
  "batch": 3
 },
 {
  "who": "heroine_02",
  "spot": "D02",
  "act": "walk",
  "friend": [
   "那個阿伯每個禮拜都在。上次他也拍同一隻。"
  ],
  "dating": [
   "慢慢走。下一場四點才開始。"
  ],
  "batch": 3
 },
 {
  "who": "heroine_05",
  "spot": "D11",
  "act": "D11.library",
  "friend": [
   "這棟是木頭蓋的。屋頂有草，下雨的水會存起來用。"
  ],
  "dating": [
   "這一頁讀完我就闔起來。你等我。"
  ],
  "batch": 3
 },
 {
  "who": "heroine_05",
  "spot": "D11",
  "act": "D11.footbath",
  "friend": [
   "讀完書泡腳。每次都這樣排。"
  ],
  "dating": [
   "水很燙。你慢慢放，不要逞強。"
  ],
  "batch": 3
 },
 {
  "who": "heroine_05",
  "spot": "D11",
  "act": "D11.valley",
  "friend": [
   "地熱谷的水是酸的，不能碰。告示寫得很清楚。"
  ],
  "dating": [
   "霧好大。你站近一點。"
  ],
  "batch": 3
 },
 {
  "who": "classmate_peishan",
  "spot": "D08",
  "act": "D08.penguin",
  "friend": [
   "小孩貼在玻璃上不走。我也想貼，可是我是大人。"
  ],
  "dating": [
   "你抱那個小的。他看不到。"
  ],
  "batch": 3
 },
 {
  "who": "classmate_peishan",
  "spot": "D08",
  "act": "D08.train",
  "friend": [
   "列車上我坐最後面，才看得到全部的人。"
  ],
  "dating": [
   "你坐前面那節，我坐後面。這樣就不會有人掉。"
  ],
  "batch": 3
 },
 {
  "who": "classmate_peishan",
  "spot": "D08",
  "act": "walk",
  "friend": [
   "走到下一個休息區就好。他們的腳比較短。"
  ],
  "dating": [
   "你走慢一點。最小的那個一直跟著你。"
  ],
  "batch": 3
 },
 {
  "who": "kexin",
  "spot": "D10",
  "act": "D10.bridge",
  "friend": [],
  "dating": [
   "吊橋會晃。你不要故意晃。"
  ],
  "batch": 3
 },
 {
  "who": "kexin",
  "spot": "D10",
  "act": "D10.boat",
  "friend": [],
  "dating": [
   "天鵝船要兩個人踩。予樂踩到一半就不踩了。"
  ],
  "batch": 3
 },
 {
  "who": "kexin",
  "spot": "D10",
  "act": "D10.snack",
  "friend": [],
  "dating": [
   "這攤的玉米比剛剛那攤好吃。我今天吃過兩攤了。"
  ],
  "batch": 3
 }
 ],
 "leave": [
  {
   "who": "heroine_01",
   "spot": "D06",
   "friend": "我要去 Café 了，下午有排東西。",   /* AA_209 附錄A §2 */
   "dating": "下午我在 Café。你要來的話，坐我對面。"
  },
  {
   "who": "heroine_03",
   "spot": "D12",
   "friend": "我回去了。照片，之後傳你。",
   "dating": "到了傳訊息。……照片也傳。"
  },
  {
   "who": "heroine_03",
   "spot": "D13",
   "friend": "我搭下一班。你慢慢看。",
   "dating": "一起回去。……捷運很長。"
  },
  {
   "who": "zhe",
   "spot": "D04",
   "friend": "系籃的在叫我了。哥，下週練球，你來。不來我就一直傳訊息。",
   "dating": ""
  },
  {
   "who": "yu",
   "spot": "D04",
   "friend": "社團學姊在等我了！我們下次再一起逛。真的，這次是真的。",
   "dating": ""
  },
  {
   "who": "classmate_bohan",
   "spot": "D06",
   "friend": "十二點我要回總圖。下個月我還會來。",
   "dating": ""
  },
  {
   "who": "zhe",
   "spot": "D25",
   "friend": "系籃的要去吃海鮮了。你要一起嗎？不要的話，下週練球見。",
   "dating": ""
  },
  {
   "who": "classmate_bohan",
   "spot": "D09",
   "friend": "我搭下一班下山。明天又要開始念了。今天謝謝你。",
   "dating": ""
  },
  {
   "who": "heroine_02",
   "spot": "D04",
   "friend": "我搭車回去了。今天的片，下次在 Café 說。",
   "dating": "到家傳訊息給我。……我也會傳。"
  },
  {
   "who": "heroine_04",
   "spot": "D04",
   "friend": "我回去了。今天的分數，我截圖了。",
   "dating": "下次你來打一首。我不會讓你。"
  },
  {
   "who": "heroine_04",
   "spot": "D12",
   "friend": "我回去寫東西了。今天的光很好。",
   "dating": "你先走。我看你走到那個轉角。"
  },
  {
   "who": "heroine_05",
   "spot": "D06",
   "friend": "我四點要回去讀書。……今天，謝謝。",
   "dating": "下次你排行程。我照你的走。"
  },
  {
   "who": "classmate_peishan",
   "spot": "D12",
   "friend": "我要去搭車了。今天買的繪本，下次借你。",
   "dating": "今天買的書，第一本是繪本。……給課輔班的。"   /* AA_525 2-4 P-6：原「今天買的書，第一本我先讀給你聽。……下次。」*/
  },
  {
   "who": "classmate_peishan",
   "spot": "D06",
   "friend": "我去書店了。你慢慢看。",
   "dating": "下午見。……如果你來的話。"
  },
  {
   "who": "kexin",
   "spot": "D13",
   "friend": "",
   "dating": "我搭車回木柵了。送我到捷運站就好。……到月台也可以。"
  },
  {
   "who": "kexin",
   "spot": "D04",
   "friend": "",
   "dating": "我回木柵了。今天的電影你最喜歡哪一幕？傳給我。"
  },
  {
   "batch": 2,
   "who": "kexin",
   "spot": "D09",
   "friend": "",
   "dating": "我走下山就到宿舍了。你要搭纜車的話，我陪你到站。"
  },
  {
   "batch": 2,
   "who": "heroine_04",
   "spot": "D18",
   "friend": "我要搭客運了。燈籠畫了三十個，夠用了。",
   "dating": "下山的客運很晃。你坐靠窗，我暈車的話跟我講話。"
  },
  {
   "batch": 2,
   "who": "heroine_05",
   "spot": "D24",
   "friend": "我們要去吃飯了。下週學校見。",
   "dating": "我們要去吃飯了。晚上傳訊息給你。"
  },
  {
   "batch": 2,
   "who": "classmate_peishan",
   "spot": "D20",
   "friend": "我們要回去了。謝謝你。下次課輔班要不要來說一個故事？",
   "dating": "回程的車上，我要把今天的事寫下來！"   /* AA_525 2-4 P-6：原「……寫好給你看。」*/
  },
  {
   "batch": 2,
   "who": "heroine_02",
   "spot": "D25",
   "friend": "火車快來了。這卷底片洗出來，給你一張。",
   "dating": "火車上我想睡一下。到了叫我。"
  },
 {
  "who": "heroine_01",
  "spot": "D26",
  "friend": "我媽傳訊息了，我要回去。你回臺北的車幾點？",
  "dating": "五點了，我要回家吃飯。到臺北傳訊息給我。"
 },
 {
  "who": "heroine_03",
  "spot": "D14",
  "friend": "我搭這班回去。我媽在等我吃飯。",
  "dating": "我媽在等吃飯。你陪我到捷運站就好。"
 },
 {
  "who": "classmate_bohan",
  "spot": "D11",
  "friend": "我要回去了，還有一份考古題。下禮拜考完再說。",
  "dating": ""
 },
 {
  "who": "yu",
  "spot": "D01",
  "friend": "我要回板橋了，晚上家裡有親戚來。第六個章你看到要跟我說喔！",
  "dating": ""
 },
 {
  "who": "zhe",
  "spot": "D29",
  "friend": "我同學要去打球了。你回台北的高鐵幾點？不要錯過喔。",
  "dating": ""
 },
 {
  "batch": 3,
  "who": "heroine_04",
  "spot": "D01",
  "friend": "我要回去了。今天晚上要把那隻貓畫出來。",
  "dating": "捷運站那邊人很多。你走前面，我跟著。"
 },
 {
  "batch": 3,
  "who": "heroine_02",
  "spot": "D02",
  "friend": "我要進去了。下一場要開始了。",
  "dating": "你先走。我看完傳訊息給你，跟你說好不好看。"
 },
 {
  "batch": 3,
  "who": "heroine_05",
  "spot": "D11",
  "friend": "我要回去了。計畫本上還有兩件事。",
  "dating": "支線只有一站。坐我旁邊。"
 },
 {
  "batch": 3,
  "who": "classmate_peishan",
  "spot": "D08",
  "friend": "我們要回去吃午餐了。謝謝你幫忙數。",
  "dating": "回去的捷運上他們一定會睡著。你可以一起搭嗎？"
 },
 {
  "batch": 3,
  "who": "kexin",
  "spot": "D10",
  "friend": "",
  "dating": "我回政大了。到宿舍傳訊息給你。"
 }
 ],
 "intro": [
  {
   "who": "kexin",
   "spot": "D04",
   "speaker": "yule",
   "line": "我去買東西。……很久。"
  },
  {
   "batch": 2,
   "who": "kexin",
   "spot": "D09",
   "speaker": "yule",
   "line": "邵鈞，我們去另一邊看夕陽。"
  },
 {
  "batch": 3,
  "who": "kexin",
  "spot": "D10",
  "speaker": "yule",
  "line": "我先回去了。可昕，玉米你自己吃完。"
 }
 ],
 "revisit": [
  {
   "who": "heroine_01",
   "spot": "D06",
   "normal": "你想起上次她說的那張表。十二點半，她真的準時走了。",
   "afterBreakup": "你經過那張城市地圖。你沒有停下來。"
  },
  {
   "who": "heroine_03",
   "spot": "D12",
   "normal": "騎樓下的那位老闆娘還在包貨。你想起，她的手被拍過。",
   "afterBreakup": "你沒有往那間南北貨行看。"
  },
  {
   "who": "heroine_03",
   "spot": "D13",
   "normal": "長椅空著。你坐了一下。",
   "afterBreakup": ""
  },
  {
   "who": "zhe",
   "spot": "D04",
   "normal": "那家排隊的店，今天也排了四十分鐘。你想起阿哲說：很扯。",
   "afterBreakup": ""
  },
  {
   "who": "yu",
   "spot": "D04",
   "normal": "二手衣店的櫥窗換了。那兩件一樣的外套不見了。",
   "afterBreakup": ""
  },
  {
   "who": "classmate_bohan",
   "spot": "D06",
   "normal": "長椅上沒有人。你想起柏翰說，回去讀得比較快。",
   "afterBreakup": ""
  },
  {
   "who": "heroine_01",
   "spot": "D09",
   "normal": "茶館最裡面那一桌空著。你想起桌上那張時間表，每一格都填滿了。",
   "afterBreakup": "你沒有往茶館最裡面那一桌看。"
  },
  {
   "who": "heroine_03",
   "spot": "D18",
   "normal": "擦香爐的阿嬤還在。今天沒有人訪問她，她一樣擦得很慢。",
   "afterBreakup": "你經過那間廟，沒有進去。"
  },
  {
   "who": "zhe",
   "spot": "D25",
   "normal": "浪還是一樣大。你想起阿哲被打倒，站起來大笑的樣子。",
   "afterBreakup": ""
  },
  {
   "who": "yu",
   "spot": "D20",
   "normal": "老街口今天沒有人在點名。你想起 Alison 數到二十四。",
   "afterBreakup": ""
  },
  {
   "who": "classmate_bohan",
   "spot": "D09",
   "normal": "纜車站外面的長椅空著。你想起柏翰那天沒帶書，一個人坐在這裡。",
   "afterBreakup": ""
  },
  {
   "who": "classmate_xinci",
   "spot": "D18",
   "normal": "茶樓的窗邊坐著另一對人，也拿著手機在比對什麼。",
   "afterBreakup": ""
  },
  {
   "who": "heroine_02",
   "spot": "D04",
   "normal": "電影院門口。上次芷若一個人站在這裡，看場次表。",
   "afterBreakup": "電影院門口。上次在這裡遇到芷若。"
  },
  {
   "who": "heroine_04",
   "spot": "D04",
   "normal": "節奏遊戲機還在響。上次子晴在這台前面，打完才轉頭。",
   "afterBreakup": "節奏遊戲機還在響。"
  },
  {
   "who": "heroine_04",
   "spot": "D12",
   "normal": "碼頭邊。上次子晴坐在這裡，膝上開著筆電。",
   "afterBreakup": "碼頭邊。上次在這裡遇到子晴。"
  },
  {
   "who": "heroine_05",
   "spot": "D06",
   "normal": "上次學姊站在這幅畫前面，手上拿著展覽的說明。",
   "afterBreakup": "這一區的說明牌，你一塊也沒有讀。"
  },
  {
   "who": "classmate_peishan",
   "spot": "D12",
   "normal": "舊書店門口。上次沛珊在這裡翻繪本。",
   "afterBreakup": "舊書店門口。"
  },
  {
   "who": "classmate_peishan",
   "spot": "D06",
   "normal": "兒童區傳來笑聲。上次沛珊在這裡看小孩畫畫。",
   "afterBreakup": "兒童區傳來笑聲。"
  },
  {
   "who": "kexin",
   "spot": "D13",
   "normal": "河邊。上次可昕和予樂、邵鈞坐在這裡等夕陽。",
   "afterBreakup": "河邊的長椅。夕陽還是一樣。"
  },
  {
   "who": "kexin",
   "spot": "D04",
   "normal": "電影院門口。上次可昕和予樂在這裡排隊。",
   "afterBreakup": "電影院門口。"
  },
  {
   "batch": 2,
   "who": "kexin",
   "spot": "D09",
   "normal": "茶館的窗邊。上次可昕和予樂、邵鈞在這裡等茶涼。",
   "afterBreakup": "茶館的窗邊，現在坐著別人。"
  },
  {
   "batch": 2,
   "who": "heroine_04",
   "spot": "D18",
   "normal": "石階上。上次子晴坐在這裡畫燈籠。",
   "afterBreakup": "石階上，燈籠一盞一盞亮了。"
  },
  {
   "batch": 2,
   "who": "heroine_05",
   "spot": "D24",
   "normal": "泡腳池。上次學姊和她爸媽坐在這裡。",
   "afterBreakup": "泡腳池。水還是一樣燙。"
  },
  {
   "batch": 2,
   "who": "classmate_peishan",
   "spot": "D20",
   "normal": "老街口。上次沛珊在這裡幫小孩戴帽子。",
   "afterBreakup": "老街口。"
  },
  {
   "batch": 2,
   "who": "heroine_02",
   "spot": "D25",
   "normal": "堤防上。上次芷若坐在這裡拍浪。",
   "afterBreakup": "堤防上。"
  },
 {
  "who": "heroine_01",
  "spot": "D26",
  "normal": "審計新村那間小店門口的階梯，今天坐著別人。",
  "afterBreakup": "你沒有往審計新村那排小店走。"
 },
 {
  "who": "heroine_03",
  "spot": "D14",
  "normal": "渡輪站的長椅上沒有人。下一班船還要二十分鐘。",
  "afterBreakup": ""
 },
 {
  "who": "classmate_bohan",
  "spot": "D11",
  "normal": "圖書館靠窗的位子坐著一個高中生，桌上也攤著考古題。",
  "afterBreakup": ""
 },
 {
  "who": "yu",
  "spot": "D01",
  "normal": "展場出口的蓋章台前面排著幾個小孩。你想起 Alison 在找第六個章。",
  "afterBreakup": ""
 },
 {
  "who": "classmate_xinci",
  "spot": "D02",
  "normal": "展覽的出口換了一檔新的。門口沒有人在對收據。",
  "afterBreakup": ""
 },
 {
  "who": "zhe",
  "spot": "D29",
  "normal": "港邊的台階空著。你想起阿哲他們三個在分一包鹹酥雞。",
  "afterBreakup": ""
 },
 {
  "batch": 3,
  "who": "heroine_04",
  "spot": "D01",
  "normal": "市集那一攤。上次子晴在這裡拿著一個像素鑰匙圈。",
  "afterBreakup": "市集那一攤，今天賣的是別的東西。"
 },
 {
  "batch": 3,
  "who": "heroine_02",
  "spot": "D02",
  "normal": "書店門口的長椅。上次芷若坐在這裡，手上一本電影書。",
  "afterBreakup": "書店門口的長椅，現在沒有人。"
 },
 {
  "batch": 3,
  "who": "heroine_05",
  "spot": "D11",
  "normal": "圖書館的木頭陽台。上次學姊坐在這裡讀書。",
  "afterBreakup": "圖書館的陽台，那個位子坐著別人。"
 },
 {
  "batch": 3,
  "who": "classmate_peishan",
  "spot": "D08",
  "normal": "企鵝館門口。上次沛珊在這裡數小孩。",
  "afterBreakup": "企鵝館門口，一群小孩貼在玻璃上。"
 },
 {
  "batch": 3,
  "who": "kexin",
  "spot": "D10",
  "normal": "河邊的台階。上次可昕和予樂坐在這裡吃玉米。",
  "afterBreakup": "河邊的台階，烤玉米的味道還在。"
 }
 ],
 "side": [
  {
   "id": "side_bh_third_hour",
   "who": "classmate_bohan",
   "spot": "D06",
   "steps": [
    {
     "step": 1,
     "cond": "大三起第一次在 D06 遇到他",
     "lines": [],
     "mem": null,
     "note": "偶遇照 AA_162 第 1 節"
    },
    {
     "step": 2,
     "cond": "不同週，第二次",
     "lines": [
      "……又是你。我開始覺得這裡是我們的總圖。"
     ],
     "mem": null
    },
    {
     "step": 3,
     "cond": "不同週，第三次（朋友以上）",
     "lines": [
      "你都看哪一區？……帶我去。我想知道別人怎麼看。"
     ],
     "choices": [
      {
       "t": "「看不懂的那一區。」",
       "r": "……好。看不懂的那一區。"
      },
      {
       "t": "「有窗戶的那一區。」",
       "r": "……窗戶。好。"
      }
     ],
     "then": "D06.gallery（算一起走一段）",
     "mem": "ENC_D06_BH3",
     "after": {
      "where": "總圖的閒聊",
      "line": "我現在一週去一次。週日早上，總圖人比較多。"
     }
    }
   ],
   "note": "只寫 ENC_ 計數和那句閒聊，不碰 AA_40 柏翰的事件（AA_160 R7）"
  },
  {
   "id": "side_zr_same_row",
   "who": "heroine_02",
   "spot": "D04",
   "steps": [
    {
     "step": 1,
     "cond": "第一次在 D04 遇到她（朋友以上）",
     "lines": [],
     "mem": null,
     "note": "偶遇照 BB_144 3-1"
    },
    {
     "step": 2,
     "cond": "不同週，第二次",
     "lines": [
      "又遇到了。……我們看電影的時間好像一樣。"
     ],
     "mem": null
    },
    {
     "step": 3,
     "cond": "不同週，第三次",
     "lines": [
      "第三次了。我開始覺得，你是故意的。"
     ],
     "choices": [
      {
       "t": "「是故意的。」",
       "r": "嗯。"
      },
      {
       "t": "「是剛好。」",
       "r": "嗯。"
      }
     ],
     "mem": null
    },
    {
     "step": 4,
     "cond": "不同週，第四次",
     "lines": [
      "下次直接約。不要靠運氣。"
     ],
     "mem": "ENC_D04_ZR3",
     "after": {
      "where": "Café 的閒聊",
      "line": "那部老片下週重映。……我只是告訴你。"
     }
    }
   ],
   "note": "不開啟、不改變任何約會條件（AA_160 5-6 第 1 點）"
  },
  {
   "id": "side_zq_pier_level",
   "who": "heroine_04",
   "spot": "D12",
   "steps": [
    {
     "step": 1,
     "cond": "第一次在 D12 遇到她",
     "lines": [],
     "mem": null,
     "note": "偶遇照 BB_144 3-2"
    },
    {
     "step": 2,
     "cond": "不同週，第二次，一起走一段選 D12.pier",
     "lines": [
      "我改了第三關。你再死一次給我看。",
      "（旁白）你這次過了第三關，死在第四關。",
      "很好。第四關也太難了。"
     ],
     "mem": null
    },
    {
     "step": 3,
     "cond": "不同週，第三次，一起走一段選 D12.pier",
     "lines": [
      "我加了一關。河邊的。……還沒有名字。你先玩。",
      "（旁白）螢幕上是一條河，橋上的燈一盞一盞亮起來。"
     ],
     "mem": "ENC_D12_ZQ3",
     "after": {
      "where": "Q12 發表會的製作名單（純文字）",
      "line": "碼頭關測試：{name}"
     }
    }
   ],
   "note": "R7 精確版：只有名單那一行純文字讀 ENC_D12_ZQ3，不改 Q12 的觸發、分支、結果"
  }
 ]
};
