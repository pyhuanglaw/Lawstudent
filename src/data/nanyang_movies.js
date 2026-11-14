/* 自動產生：tools/movie/import_nanyang_movies.py（docs/story_planning/AA_730_nanyang_movies.json@a9465983f0）。不要手改，改企劃 AA_730 再重新匯入。
   南洋戲院片單（MOVIE-REAL-1110）：periods＝每兩個月一段、一段兩部（slot 1 第一部、2 第二部；id＝海報檔名 assets/posters/<id>.webp）；
   sceneFilm＝AA_708 電影第幾場要挑哪一種片；nowBoard＝大廳黑板、dimTitle＝燈暗那一句、solo＝一個人看的三句。選片、播放在 src/movies3d.js */
'use strict';
const NANYANG_MOVIES={
 "src": "docs/story_planning/AA_730_nanyang_movies.json@a9465983f0",
 "nowBoard": "今日放映　①《{big}》②《{small}》　一張票兩部 150 元",
 "dimTitle": "（燈暗下來，《{title}》開始了。）",
 "solo": [
  "（第一部是《{big}》，一年前很紅的那部。你這次才看懂結局。）",
  "（第二部《{small}》看到一半，前面有人睡著了。）",
  "（散場的時候已經很晚，新生南路上的車少了。）"
 ],
 "sceneFilm": {
  "heroine_01": {
   "1": {
    "want": [
     "court",
     "mystery"
    ],
    "why": "mid「那個證人剛剛說的，跟前面矛盾吧？」"
   },
   "2": {
    "want": [
     "court"
    ],
    "why": "seat「這次我選的。是法庭片。」"
   },
   "3": {
    "not": [
     "court"
    ],
    "why": "seat「今天不看法庭片。看你想看的。」"
   },
   "rot.1": {
    "not": [
     "court"
    ],
    "billHas": [
     "court"
    ],
    "why": "seat「今天有新的法庭片。……我們看別的。」"
   }
  },
  "heroine_03": {
   "2": {
    "want": [
     "doc"
    ],
    "why": "seat「是紀錄片。」（mid 這次改成不指定哪一間店）"
   },
   "rot.1": {
    "want": [
     "doc"
    ],
    "why": "seat「今天也有紀錄片。」"
   }
  },
  "heroine_04": {
   "1": {
    "want": [
     "action"
    ],
    "why": "seat「我只看動作片。」"
   },
   "3": {
    "want": [
     "romance"
    ],
    "why": "mid「是一部愛情片。」"
   },
   "rot.0": {
    "want": [
     "action"
    ],
    "why": "seat「動作片。大桶的。」"
   },
   "rot.1": {
    "want": [
     "cat"
    ],
    "why": "seat「今天這部有貓。我查過了。」"
   }
  },
  "heroine_05": {
   "2": {
    "want": [
     "library"
    ],
    "why": "mid「有一幕主角在圖書館讀到閉館。」"
   },
   "3": {
    "want": [
     "long"
    ],
    "why": "mid「三個小時的電影」"
   },
   "rot.1": {
    "want": [
     "bookstore"
    ],
    "not": [
     "library"
    ],
    "why": "seat「今天這部沒有圖書館。」mid「電影裡有一間書店。」"
   }
  },
  "classmate_peishan": {
   "1": {
    "want": [
     "anime"
    ],
    "why": "seat「我要看動畫電影！」"
   },
   "rot.1": {
    "want": [
     "comedy"
    ],
    "why": "seat「今天這部是喜劇，不會哭。」"
   }
  }
 },
 "periods": [
  {
   "from": "2024-09",
   "to": "2024-10",
   "term": "舊序章那一年（一）",
   "bill": [
    {
     "id": "m2409a",
     "slot": 1,
     "title": "深海七號站",
     "genre": "科幻驚悚",
     "line": "海底研究站斷了通訊，只剩七個人。",
     "tags": [
      "action",
      "scifi"
     ],
     "fits": [
      "heroine_04",
      "kexin"
     ]
    },
    {
     "id": "m2409b",
     "slot": 2,
     "title": "第三個證人",
     "genre": "法庭推理",
     "line": "三個證人說的都不一樣，只有一個人沒說謊。",
     "tags": [
      "court",
      "mystery"
     ],
     "fits": [
      "heroine_01",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2024-11",
   "to": "2024-12",
   "term": "舊序章那一年（二）",
   "bill": [
    {
     "id": "m2411a",
     "slot": 1,
     "title": "高速公路最後一夜",
     "genre": "動作",
     "line": "一個貨車司機載著一箱不能打開的東西，要在天亮以前開到墾丁。",
     "tags": [
      "action"
     ],
     "fits": [
      "heroine_04",
      "kexin"
     ]
    },
    {
     "id": "m2411b",
     "slot": 2,
     "title": "夜班店員",
     "genre": "日常劇情",
     "line": "便利商店的夜班店員，和每天凌晨兩點來的同一隻貓。",
     "tags": [
      "drama",
      "cat"
     ],
     "fits": [
      "heroine_03",
      "heroine_02",
      "heroine_04"
     ]
    }
   ]
  },
  {
   "from": "2025-01",
   "to": "2025-02",
   "term": "舊序章那一年（三）",
   "bill": [
    {
     "id": "m2501a",
     "slot": 1,
     "title": "雪地上的腳印",
     "genre": "動畫冒險",
     "line": "一隻小狐狸跟著雪地上的腳印，走過一整個冬天。",
     "tags": [
      "anime"
     ],
     "fits": [
      "classmate_peishan",
      "heroine_04"
     ]
    },
    {
     "id": "m2501b",
     "slot": 2,
     "title": "年夜飯的位子",
     "genre": "家庭喜劇",
     "line": "大年夜，一家人吵著誰要坐哪裡。",
     "tags": [
      "comedy",
      "family"
     ],
     "fits": [
      "classmate_peishan",
      "kexin"
     ]
    }
   ]
  },
  {
   "from": "2025-03",
   "to": "2025-04",
   "term": "舊序章那一年（四）",
   "bill": [
    {
     "id": "m2503a",
     "slot": 1,
     "title": "第一次進火場",
     "genre": "動作",
     "line": "消防隊最年輕的隊員，第一次進火場。",
     "tags": [
      "action"
     ],
     "fits": [
      "kexin",
      "heroine_04"
     ]
    },
    {
     "id": "m2503b",
     "slot": 2,
     "title": "春天的轉學生",
     "genre": "青春愛情",
     "line": "學期中轉來的女生，坐到了靠窗的最後一個位子。",
     "tags": [
      "romance"
     ],
     "fits": [
      "classmate_peishan",
      "heroine_02"
     ]
    }
   ]
  },
  {
   "from": "2025-05",
   "to": "2025-06",
   "term": "舊序章那一年（五）",
   "bill": [
    {
     "id": "m2505a",
     "slot": 1,
     "title": "存檔點",
     "genre": "遊戲改編動畫",
     "line": "一個掉進老遊戲裡的工程師，要找到下一個存檔點才回得來。",
     "tags": [
      "anime",
      "action",
      "comedy"
     ],
     "fits": [
      "heroine_04",
      "classmate_peishan"
     ]
    },
    {
     "id": "m2505b",
     "slot": 2,
     "title": "最後一題",
     "genre": "青春",
     "line": "第二次考試的考生每天在圖書館讀到閉館。考試那天寫到最後一題，筆沒水了。",
     "tags": [
      "drama",
      "library"
     ],
     "fits": [
      "kexin"
     ]
    }
   ]
  },
  {
   "from": "2025-07",
   "to": "2025-08",
   "term": "放榜・暑假",
   "bill": [
    {
     "id": "m2507a",
     "slot": 1,
     "title": "颱風來以前",
     "genre": "動作喜劇",
     "line": "一群救生員要在颱風來以前，找回一個走失的小孩。",
     "tags": [
      "action",
      "comedy"
     ],
     "fits": [
      "kexin",
      "classmate_peishan"
     ]
    },
    {
     "id": "m2507b",
     "slot": 2,
     "title": "海邊的修車廠",
     "genre": "公路劇情",
     "line": "一台壞掉的車，讓一個人在海邊小鎮多待了一個夏天。",
     "tags": [
      "drama"
     ],
     "fits": [
      "heroine_02",
      "heroine_03"
     ]
    }
   ]
  },
  {
   "from": "2025-09",
   "to": "2025-10",
   "term": "法律系大一上",
   "bill": [
    {
     "id": "m2509a",
     "slot": 1,
     "title": "第十三號月台",
     "genre": "動作懸疑",
     "line": "捷運停在兩站中間，車廂裡有一個人不該在那裡。",
     "tags": [
      "action",
      "mystery"
     ],
     "fits": [
      "heroine_04",
      "heroine_01"
     ]
    },
    {
     "id": "m2509b",
     "slot": 2,
     "title": "三份證詞",
     "genre": "法庭懸疑",
     "line": "一場車禍，三份證詞，時間都差了五分鐘。",
     "tags": [
      "court",
      "mystery"
     ],
     "fits": [
      "heroine_01",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2025-11",
   "to": "2025-12",
   "term": "大一上",
   "bill": [
    {
     "id": "m2511a",
     "slot": 1,
     "title": "聖誕快遞",
     "genre": "動畫愛情喜劇",
     "line": "聖誕夜的最後一件包裹，地址寫錯了。",
     "tags": [
      "anime",
      "romance",
      "comedy"
     ],
     "fits": [
      "classmate_peishan",
      "heroine_02"
     ]
    },
    {
     "id": "m2511b",
     "slot": 2,
     "title": "黑白的城市",
     "genre": "經典重映（黑白片）",
     "line": "一個攝影師在找一張拍壞的照片，每天在圖書館翻舊報紙翻到閉館。",
     "tags": [
      "art",
      "library"
     ],
     "fits": [
      "heroine_02"
     ]
    }
   ]
  },
  {
   "from": "2026-01",
   "to": "2026-02",
   "term": "大一寒假",
   "bill": [
    {
     "id": "m2601a",
     "slot": 1,
     "title": "紅包去哪了",
     "genre": "賀歲喜劇",
     "line": "四個表兄弟姊妹為了一個紅包，從除夕找到初五。",
     "tags": [
      "comedy",
      "family"
     ],
     "fits": [
      "classmate_peishan",
      "kexin"
     ]
    },
    {
     "id": "m2601b",
     "slot": 2,
     "title": "去看極光的那年",
     "genre": "愛情",
     "line": "十年前說好要一起去看極光，只剩一個人去了。片長三小時。",
     "tags": [
      "romance",
      "long"
     ],
     "fits": [
      "heroine_02",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2026-03",
   "to": "2026-04",
   "term": "大一下",
   "bill": [
    {
     "id": "m2603a",
     "slot": 1,
     "title": "斷橋以後",
     "genre": "災難動作",
     "line": "地震把一條山路切成兩半，兩邊的人要在一天之內會合。",
     "tags": [
      "action"
     ],
     "fits": [
      "heroine_04",
      "kexin"
     ]
    },
    {
     "id": "m2603b",
     "slot": 2,
     "title": "沉默的書記官",
     "genre": "法庭懸疑",
     "line": "開庭的時候，只有書記官發現證人改了一個字。",
     "tags": [
      "court",
      "mystery"
     ],
     "fits": [
      "heroine_01",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2026-05",
   "to": "2026-06",
   "term": "大一下",
   "bill": [
    {
     "id": "m2605a",
     "slot": 1,
     "title": "鋼鐵快遞",
     "genre": "科幻動作動畫",
     "line": "一台送貨機器人在城市裡被追了一整晚。",
     "tags": [
      "action",
      "scifi",
      "anime"
     ],
     "fits": [
      "heroine_04",
      "classmate_peishan"
     ]
    },
    {
     "id": "m2605b",
     "slot": 2,
     "title": "老茶行",
     "genre": "紀錄片",
     "line": "一間開了四十年的老茶行，最後一個月。",
     "tags": [
      "doc"
     ],
     "fits": [
      "heroine_03"
     ]
    }
   ]
  },
  {
   "from": "2026-07",
   "to": "2026-08",
   "term": "大一升大二暑假",
   "bill": [
    {
     "id": "m2607a",
     "slot": 1,
     "title": "地圖上沒有的路",
     "genre": "動畫",
     "line": "三個小學生為了寫一份暑假作業，跑遍了整座城市。",
     "tags": [
      "anime",
      "comedy"
     ],
     "fits": [
      "classmate_peishan"
     ]
    },
    {
     "id": "m2607b",
     "slot": 2,
     "title": "八月的冰店",
     "genre": "青春愛情",
     "line": "一間只開暑假的冰店，和每年夏天回來打工的三個人。",
     "tags": [
      "romance",
      "drama"
     ],
     "fits": [
      "heroine_03",
      "classmate_peishan"
     ]
    }
   ]
  },
  {
   "from": "2026-09",
   "to": "2026-10",
   "term": "大二上",
   "bill": [
    {
     "id": "m2609a",
     "slot": 1,
     "title": "颱風夜的貨船",
     "genre": "動作",
     "line": "一艘貨船在颱風夜被困在海上，船長只剩三個船員。",
     "tags": [
      "action"
     ],
     "fits": [
      "kexin",
      "heroine_04"
     ]
    },
    {
     "id": "m2609b",
     "slot": 2,
     "title": "律師的早餐",
     "genre": "法律職人喜劇",
     "line": "一個新律師每天早上都在早餐店接案子。",
     "tags": [
      "court",
      "comedy"
     ],
     "fits": [
      "heroine_05",
      "kexin"
     ]
    }
   ]
  },
  {
   "from": "2026-11",
   "to": "2026-12",
   "term": "大二上",
   "bill": [
    {
     "id": "m2611a",
     "slot": 1,
     "title": "雪人信差",
     "genre": "動畫",
     "line": "一個雪人和一隻貓，要在春天來以前把信送到。",
     "tags": [
      "anime",
      "cat"
     ],
     "fits": [
      "classmate_peishan",
      "heroine_04"
     ]
    },
    {
     "id": "m2611b",
     "slot": 2,
     "title": "老街照相館",
     "genre": "紀錄片",
     "line": "一間照相館的老闆，幫整條街的人拍了五十年的證件照。",
     "tags": [
      "doc"
     ],
     "fits": [
      "heroine_03",
      "heroine_02"
     ]
    }
   ]
  },
  {
   "from": "2027-01",
   "to": "2027-02",
   "term": "大二寒假",
   "bill": [
    {
     "id": "m2701a",
     "slot": 1,
     "title": "太空站的年夜飯",
     "genre": "科幻喜劇",
     "line": "太空站上的三個人，要用剩下的材料煮一頓年夜飯。",
     "tags": [
      "scifi",
      "comedy"
     ],
     "fits": [
      "heroine_04",
      "classmate_peishan"
     ]
    },
    {
     "id": "m2701b",
     "slot": 2,
     "title": "回家的高鐵",
     "genre": "家庭劇情",
     "line": "除夕的最後一班高鐵，一節車廂裡的七個人。片長三小時。",
     "tags": [
      "drama",
      "family",
      "long"
     ],
     "fits": [
      "heroine_03",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2027-03",
   "to": "2027-04",
   "term": "大二下",
   "bill": [
    {
     "id": "m2703a",
     "slot": 1,
     "title": "黑貓特工",
     "genre": "動作喜劇",
     "line": "一隻黑貓被當成特工，跟著真的特工出了一次任務。",
     "tags": [
      "action",
      "comedy",
      "cat"
     ],
     "fits": [
      "heroine_04",
      "classmate_peishan"
     ]
    },
    {
     "id": "m2703b",
     "slot": 2,
     "title": "一句台詞的三天",
     "genre": "劇情",
     "line": "一個字幕翻譯每天在圖書館待到閉館，為了一句台詞想了三天。",
     "tags": [
      "drama",
      "library"
     ],
     "fits": [
      "heroine_02"
     ]
    }
   ]
  },
  {
   "from": "2027-05",
   "to": "2027-06",
   "term": "大二下",
   "bill": [
    {
     "id": "m2705a",
     "slot": 1,
     "title": "放學後的球場",
     "genre": "運動青春",
     "line": "一支只剩五個人的籃球隊，最後一場比賽。",
     "tags": [
      "sports"
     ],
     "fits": [
      "kexin",
      "heroine_04"
     ]
    },
    {
     "id": "m2705b",
     "slot": 2,
     "title": "密室的第五個人",
     "genre": "推理",
     "line": "四個人被關在一個房間，可是桌上有五杯茶。",
     "tags": [
      "mystery"
     ],
     "fits": [
      "heroine_01"
     ]
    }
   ]
  },
  {
   "from": "2027-07",
   "to": "2027-08",
   "term": "大二升大三暑假",
   "bill": [
    {
     "id": "m2707a",
     "slot": 1,
     "title": "四十分鐘的晴天",
     "genre": "災難動作",
     "line": "颱風眼經過的四十分鐘，一架直升機要把人救出來。",
     "tags": [
      "action"
     ],
     "fits": [
      "heroine_04",
      "kexin"
     ]
    },
    {
     "id": "m2707b",
     "slot": 2,
     "title": "最後一晚的放映",
     "genre": "劇情",
     "line": "小鎮唯一的二輪戲院，要在最後一晚放完一百部片。片長三小時。",
     "tags": [
      "drama",
      "long"
     ],
     "fits": [
      "heroine_02",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2027-09",
   "to": "2027-10",
   "term": "大三上",
   "bill": [
    {
     "id": "m2709a",
     "slot": 1,
     "title": "星河快遞",
     "genre": "科幻動畫",
     "line": "一艘送貨的小太空船，接到一張要送去銀河另一頭的單。",
     "tags": [
      "anime",
      "scifi",
      "action"
     ],
     "fits": [
      "heroine_04",
      "classmate_peishan"
     ]
    },
    {
     "id": "m2709b",
     "slot": 2,
     "title": "借據",
     "genre": "法律懸疑",
     "line": "一張三十年前的借據。一個法律系學生在圖書館翻了一整個學期的舊報紙。",
     "tags": [
      "court",
      "mystery",
      "library"
     ],
     "fits": [
      "heroine_01",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2027-11",
   "to": "2027-12",
   "term": "大三上",
   "bill": [
    {
     "id": "m2711a",
     "slot": 1,
     "title": "最後一班捷運",
     "genre": "愛情",
     "line": "末班車上的兩個陌生人，坐過了站，在便利商店等到第一班車。",
     "tags": [
      "romance"
     ],
     "fits": [
      "classmate_peishan",
      "heroine_03"
     ]
    },
    {
     "id": "m2711b",
     "slot": 2,
     "title": "騎樓下的修鞋攤",
     "genre": "紀錄片",
     "line": "一個在騎樓下修了五十年鞋的阿伯，和他記得的每一雙鞋。",
     "tags": [
      "doc"
     ],
     "fits": [
      "heroine_03"
     ]
    }
   ]
  },
  {
   "from": "2028-01",
   "to": "2028-02",
   "term": "大三寒假",
   "bill": [
    {
     "id": "m2801a",
     "slot": 1,
     "title": "新年快樂，陌生人",
     "genre": "愛情喜劇",
     "line": "跨年夜在同一張長椅上倒數的兩個人。",
     "tags": [
      "romance",
      "comedy"
     ],
     "fits": [
      "classmate_peishan",
      "heroine_05"
     ]
    },
    {
     "id": "m2801b",
     "slot": 2,
     "title": "貓咪咖啡館的星期三",
     "genre": "溫馨",
     "line": "只有星期三開的咖啡館，和一隻不讓人摸的貓。",
     "tags": [
      "drama",
      "cat"
     ],
     "fits": [
      "heroine_04",
      "heroine_03"
     ]
    }
   ]
  },
  {
   "from": "2028-03",
   "to": "2028-04",
   "term": "大三下（交換路線在國外）",
   "bill": [
    {
     "id": "m2803a",
     "slot": 1,
     "title": "往下開的火車",
     "genre": "科幻動作",
     "line": "一列往地底下開的火車，車上只有一張回程票。",
     "tags": [
      "action",
      "scifi"
     ],
     "fits": [
      "heroine_04"
     ]
    },
    {
     "id": "m2803b",
     "slot": 2,
     "title": "檢察官的雨傘",
     "genre": "法律劇情",
     "line": "一個檢察官每天下雨都忘了帶傘，直到他接到那個案子。",
     "tags": [
      "court"
     ],
     "fits": [
      "heroine_01",
      "kexin"
     ]
    }
   ]
  },
  {
   "from": "2028-05",
   "to": "2028-06",
   "term": "大三下",
   "bill": [
    {
     "id": "m2805a",
     "slot": 1,
     "title": "畢業旅行沒有我",
     "genre": "青春喜劇",
     "line": "全班去畢業旅行，只有一個人留在學校。",
     "tags": [
      "comedy"
     ],
     "fits": [
      "classmate_peishan",
      "kexin"
     ]
    },
    {
     "id": "m2805b",
     "slot": 2,
     "title": "第八關",
     "genre": "遊戲劇情",
     "line": "一款沒有人破得了的遊戲，第八關藏著做遊戲的人留的話。",
     "tags": [
      "drama"
     ],
     "fits": [
      "heroine_04"
     ]
    }
   ]
  },
  {
   "from": "2028-07",
   "to": "2028-08",
   "term": "大三升大四暑假",
   "bill": [
    {
     "id": "m2807a",
     "slot": 1,
     "title": "沙漠的救援",
     "genre": "動作",
     "line": "一支救援隊在沙漠裡找一架失聯的小飛機。",
     "tags": [
      "action"
     ],
     "fits": [
      "kexin",
      "heroine_04"
     ]
    },
    {
     "id": "m2807b",
     "slot": 2,
     "title": "鯨魚唱歌的地方",
     "genre": "動畫",
     "line": "一個小女孩坐船去找會唱歌的鯨魚。",
     "tags": [
      "anime"
     ],
     "fits": [
      "classmate_peishan"
     ]
    }
   ]
  },
  {
   "from": "2028-09",
   "to": "2028-10",
   "term": "大四上",
   "bill": [
    {
     "id": "m2809a",
     "slot": 1,
     "title": "時間的抽屜",
     "genre": "奇幻愛情",
     "line": "老鐘錶行有一個抽屜，打開就回到昨天，可是只能回去一次。",
     "tags": [
      "romance"
     ],
     "fits": [
      "heroine_02",
      "classmate_peishan"
     ]
    },
    {
     "id": "m2809b",
     "slot": 2,
     "title": "律師不在",
     "genre": "法律喜劇",
     "line": "事務所的律師全部出差，只剩一個實習生和三個客戶。",
     "tags": [
      "court",
      "comedy"
     ],
     "fits": [
      "heroine_05",
      "kexin"
     ]
    }
   ]
  },
  {
   "from": "2028-11",
   "to": "2028-12",
   "term": "大四上",
   "bill": [
    {
     "id": "m2811a",
     "slot": 1,
     "title": "一個人的舉重社",
     "genre": "運動熱血",
     "line": "學校只有一個人的舉重社，要拿到全國賽的資格。",
     "tags": [
      "sports",
      "action"
     ],
     "fits": [
      "kexin",
      "heroine_04"
     ]
    },
    {
     "id": "m2811b",
     "slot": 2,
     "title": "教室裡的第十三個人",
     "genre": "校園懸疑",
     "line": "點名的時候是十二個人，教室裡坐了十三個。",
     "tags": [
      "mystery"
     ],
     "fits": [
      "heroine_01"
     ]
    }
   ]
  },
  {
   "from": "2029-01",
   "to": "2029-02",
   "term": "大四寒假",
   "bill": [
    {
     "id": "m2901a",
     "slot": 1,
     "title": "過年的麻將桌",
     "genre": "賀歲喜劇",
     "line": "過年的麻將桌上，一家人打了四天，誰都不肯先下桌。",
     "tags": [
      "comedy",
      "family"
     ],
     "fits": [
      "classmate_peishan",
      "kexin"
     ]
    },
    {
     "id": "m2901b",
     "slot": 2,
     "title": "一個人的山",
     "genre": "登山劇情",
     "line": "一個人走完中央山脈，走了四十天。片長三小時。",
     "tags": [
      "drama",
      "long"
     ],
     "fits": [
      "heroine_05",
      "heroine_03"
     ]
    }
   ]
  },
  {
   "from": "2029-03",
   "to": "2029-04",
   "term": "大四下",
   "bill": [
    {
     "id": "m2903a",
     "slot": 1,
     "title": "鋼鐵颶風",
     "genre": "科幻動作",
     "line": "一場颶風裡，一台救災機器人第一次自己做決定。",
     "tags": [
      "action",
      "scifi"
     ],
     "fits": [
      "heroine_04",
      "kexin"
     ]
    },
    {
     "id": "m2903b",
     "slot": 2,
     "title": "證據之外",
     "genre": "法庭劇",
     "line": "所有證據都指向他，只有他的律師不信。",
     "tags": [
      "court"
     ],
     "fits": [
      "heroine_01",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2029-05",
   "to": "2029-06",
   "term": "大四下・畢業",
   "bill": [
    {
     "id": "m2905a",
     "slot": 1,
     "title": "地下室的樂團",
     "genre": "音樂青春",
     "line": "一個只在地下室練團的樂團，第一次上台。",
     "tags": [
      "music",
      "comedy"
     ],
     "fits": [
      "heroine_04",
      "classmate_peishan"
     ]
    },
    {
     "id": "m2905b",
     "slot": 2,
     "title": "期末最後一堂",
     "genre": "校園劇情",
     "line": "一個老師退休前的最後一堂課，全班沒有人缺席。前一天晚上，她在圖書館留到閉館。",
     "tags": [
      "drama",
      "library"
     ],
     "fits": [
      "heroine_03",
      "heroine_01"
     ]
    }
   ]
  },
  {
   "from": "2029-07",
   "to": "2029-08",
   "term": "畢業以後（國考那年暑假）",
   "bill": [
    {
     "id": "m2907a",
     "slot": 1,
     "title": "國考前一夜",
     "genre": "喜劇",
     "line": "三個國考生在考前一晚，同時發現准考證不見了。",
     "tags": [
      "comedy"
     ],
     "fits": [
      "kexin",
      "heroine_05"
     ]
    },
    {
     "id": "m2907b",
     "slot": 2,
     "title": "九月的海風",
     "genre": "愛情",
     "line": "她回海邊的老家賣房子，隔壁修船的是高中同學。",
     "tags": [
      "romance"
     ],
     "fits": [
      "heroine_02",
      "classmate_peishan"
     ]
    }
   ]
  },
  {
   "from": "2029-09",
   "to": "2029-10",
   "term": "畢業以後／大五",
   "bill": [
    {
     "id": "m2909a",
     "slot": 1,
     "title": "行星備忘錄",
     "genre": "科幻",
     "line": "一個人留在快沒有人的行星上，每天寫一則備忘錄。片長三小時。",
     "tags": [
      "scifi",
      "long"
     ],
     "fits": [
      "heroine_04",
      "heroine_05"
     ]
    },
    {
     "id": "m2909b",
     "slot": 2,
     "title": "巷口的燒臘店",
     "genre": "紀錄片",
     "line": "一間開了四十年的燒臘店，最後一個月。",
     "tags": [
      "doc"
     ],
     "fits": [
      "heroine_03"
     ]
    }
   ]
  },
  {
   "from": "2029-11",
   "to": "2029-12",
   "term": "畢業以後／大五",
   "bill": [
    {
     "id": "m2911a",
     "slot": 1,
     "title": "南極十天",
     "genre": "動作",
     "line": "南極的研究站失火，最近的船要開十天。",
     "tags": [
      "action"
     ],
     "fits": [
      "heroine_04",
      "kexin"
     ]
    },
    {
     "id": "m2911b",
     "slot": 2,
     "title": "冬至湯圓",
     "genre": "家庭溫馨",
     "line": "奶奶每年冬至都多煮一碗湯圓，給一個還沒回來的人。",
     "tags": [
      "family",
      "drama"
     ],
     "fits": [
      "classmate_peishan",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2030-01",
   "to": "2030-02",
   "term": "畢業以後／大五",
   "bill": [
    {
     "id": "m3001a",
     "slot": 1,
     "title": "貓的新年",
     "genre": "動畫喜劇",
     "line": "一隻家貓在過年的時候走丟了，跟著鞭炮聲走回家。",
     "tags": [
      "anime",
      "cat",
      "comedy"
     ],
     "fits": [
      "classmate_peishan",
      "heroine_04"
     ]
    },
    {
     "id": "m3001b",
     "slot": 2,
     "title": "地方法院的星期一",
     "genre": "法庭劇",
     "line": "一個法官的星期一，從早上九點開到晚上九點。",
     "tags": [
      "court"
     ],
     "fits": [
      "heroine_01",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2030-03",
   "to": "2030-04",
   "term": "畢業以後／大五",
   "bill": [
    {
     "id": "m3003a",
     "slot": 1,
     "title": "機器人不哭",
     "genre": "科幻劇情",
     "line": "一個照顧老人的機器人，學會了說謊。",
     "tags": [
      "scifi",
      "drama"
     ],
     "fits": [
      "heroine_04",
      "heroine_03"
     ]
    },
    {
     "id": "m3003b",
     "slot": 2,
     "title": "書店打烊以後",
     "genre": "愛情",
     "line": "二手書店打烊以後，店員發現每本書裡都夾著同一個人的書籤。",
     "tags": [
      "romance",
      "bookstore"
     ],
     "fits": [
      "heroine_02",
      "heroine_05"
     ]
    }
   ]
  },
  {
   "from": "2030-05",
   "to": "2030-06",
   "term": "畢業以後／大五",
   "bill": [
    {
     "id": "m3005a",
     "slot": 1,
     "title": "一百樓外面",
     "genre": "動作",
     "line": "一個擦窗工人吊在一百樓外面，看到了不該看的東西。",
     "tags": [
      "action"
     ],
     "fits": [
      "heroine_04",
      "kexin"
     ]
    },
    {
     "id": "m3005b",
     "slot": 2,
     "title": "迷宮裡的偵探",
     "genre": "推理喜劇",
     "line": "一棟像迷宮的老公寓，偵探在第三層迷路了。",
     "tags": [
      "mystery",
      "comedy"
     ],
     "fits": [
      "heroine_01",
      "classmate_peishan"
     ]
    }
   ]
  },
  {
   "from": "2030-07",
   "to": "2030-08",
   "term": "畢業以後",
   "bill": [
    {
     "id": "m3007a",
     "slot": 1,
     "title": "逆風的起跑線",
     "genre": "運動熱血",
     "line": "一個受傷的短跑選手，最後一次站上起跑線。",
     "tags": [
      "sports",
      "action"
     ],
     "fits": [
      "kexin"
     ]
    },
    {
     "id": "m3007b",
     "slot": 2,
     "title": "起霧的城",
     "genre": "經典重映（黑白片）",
     "line": "一座常年起霧的城市，一個找不到回家路的人。",
     "tags": [
      "art"
     ],
     "fits": [
      "heroine_02"
     ]
    }
   ]
  }
 ]
};
if(typeof module!=='undefined') module.exports=NANYANG_MOVIES;
