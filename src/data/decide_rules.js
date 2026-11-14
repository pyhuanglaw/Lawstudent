/* 自動產生：tools/story/import_decide_rules.py（docs/story_planning/AA_719_decide_rules.json@963afea74）。不要手改，改企劃 AA_719 再重新匯入。
   決定拍的規則：她有自己的想法（播放 src/decide3d.js）*/
'use strict';
const DECIDE_RULES={
 "src": "docs/story_planning/AA_719_decide_rules.json@963afea74",
 "keys": [
  {
   "id": "AN-1",
   "who": "heroine_01",
   "beat": 6,
   "key": "jp_tell",
   "style": "think",
   "lean": "later",
   "default": "later",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "support"
    },
    {
     "i": 1,
     "stance": "space"
    },
    {
     "i": 2,
     "stance": "support"
    }
   ],
   "rules": [
    {
     "stance": "support",
     "trust": "hi",
     "result": "first",
     "rel": {
      "trust": 3,
      "npcRom": 3
     },
     "delay": 3,
     "say": [
      "（她把一張交換說明會的傳單推到你面前。）",
      "我要申請日本交換。……我還沒跟 Alison 說。",
      "三月十八號有說明會。你要不要坐我旁邊？",
      "不是要你去日本。我只是想有人坐旁邊。"
     ]
    },
    {
     "stance": "support",
     "trust": "lo",
     "result": "later",
     "rel": {
      "trust": 1
     },
     "delay": 0
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "later",
     "rel": {
      "trust": 1
     },
     "delay": 0
    }
   ],
   "values": {
    "first": "她先跟你說要申請日本交換，約你一起去說明會",
    "later": "你從 Alison 那裡知道"
   },
   "opens": {
    "first": [
     "event:ev_an_expo_together（2027-03-18 交換說明會）"
    ]
   },
   "closes": {},
   "keyNote": "（她低頭看著桌面。好像有一件事，要看你怎麼回答才決定說不說。）",
   "before": "2027-03-17",
   "revealAt": {
    "day": "2027-03-08",
    "h": 21.0
   }
  },
  {
   "id": "AN-2",
   "who": "heroine_01",
   "beat": 8,
   "key": "grad",
   "style": "think",
   "lean": "alone",
   "default": "alone",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "space"
    },
    {
     "i": 1,
     "stance": "space"
    },
    {
     "i": 2,
     "stance": "support"
    }
   ],
   "rules": [
    {
     "stance": "support",
     "trust": "hi",
     "result": "together",
     "rel": {
      "trust": 3,
      "npcRom": 4
     },
     "delay": 0
    },
    {
     "stance": "support",
     "trust": "lo",
     "result": "alone",
     "rel": {
      "trust": 2
     },
     "delay": 3,
     "say": [
      "我想了想，還是自己決定比較好。",
      "……可是謝謝你說要陪我。我選好了，第一個跟你說。"
     ]
    },
    {
     "stance": "space",
     "trust": "hi",
     "result": "alone",
     "rel": {
      "trust": 1
     },
     "delay": 2,
     "say": [
      "我選好了。商法組。",
      "你說選錯可以再改。……這句我記在心裡。"
     ]
    },
    {
     "stance": "space",
     "trust": "lo",
     "result": "alone",
     "rel": {},
     "delay": 5,
     "say": [
      "研究所我決定考商法組。"
     ]
    }
   ],
   "values": {
    "together": "她讓你陪她一組一組想；出國那天她讓你送機",
    "alone": "她自己決定，選好才跟你說"
   },
   "opens": {
    "together": [
     "event:ev_an_grad_think（總圖，一組一組寫在紙上刪）",
     "event:ev_an_airport（2028-03-25 送機）"
    ]
   },
   "closes": {},
   "keyNote": "（她握著筆，等你說話。這句話好像對她很重要。）",
   "before": "2028-03-24"
  },
  {
   "id": "ZR-1",
   "who": "heroine_02",
   "beat": 6,
   "key": "fund",
   "style": "reassure",
   "lean": "scholar",
   "default": "scholar",
   "keyTrue": false,
   "opts": [
    {
     "i": 0,
     "stance": "push:tell"
    },
    {
     "i": 1,
     "stance": "support"
    },
    {
     "i": 2,
     "stance": "space"
    }
   ],
   "rules": [
    {
     "stance": "push:tell",
     "trust": "hi",
     "result": "tell",
     "rel": {
      "trust": 3
     },
     "delay": 4,
     "say": [
      "我想了想，還是打了。",
      "我媽說好。然後她說，她早就在存了。",
      "……我在店後門哭了一下。不要問。"
     ]
    },
    {
     "stance": "push:tell",
     "trust": "lo",
     "result": "scholar",
     "rel": {},
     "delay": 2,
     "say": [
      "實話我還是說不出口。",
      "我先查獎學金。查到了再說。"
     ]
    },
    {
     "stance": "support",
     "trust": "any",
     "result": "scholar",
     "rel": {
      "comf": 2,
      "npcRom": 1
     },
     "delay": 0
    },
    {
     "stance": "space",
     "trust": "hi",
     "result": "both",
     "rel": {
      "trust": 4,
      "npcRom": 2
     },
     "delay": 1,
     "say": [
      "你上次說你家也是你媽一個人撐。",
      "我想了一個晚上。……我們都要學開口。我先打，你陪我。"
     ]
    },
    {
     "stance": "space",
     "trust": "lo",
     "result": "scholar",
     "rel": {
      "trust": 1
     },
     "delay": 0
    }
   ],
   "values": {
    "tell": "她跟媽媽說實話",
    "scholar": "她先申請獎學金，不跟家裡開口",
    "both": "她先聽你講你家，然後打給媽媽，也申請獎學金"
   },
   "opens": {
    "tell": [
     "event:ev_zr_call_mom（她在店後門打給媽媽，你在旁邊；delay 那天）"
    ],
    "scholar": [
     "event:ev_zr_scholar_1",
     "event:ev_zr_scholar_2（總圖一起查英文的獎學金）"
    ],
    "both": [
     "event:ev_zr_call_mom",
     "event:ev_zr_scholar_1"
    ]
   },
   "closes": {},
   "before": "2027-05-10"
  },
  {
   "id": "ZR-2",
   "who": "heroine_02",
   "beat": 8,
   "key": "distance",
   "style": "own",
   "lean": "letters",
   "default": "letters",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "push:visit"
    },
    {
     "i": 1,
     "stance": "push:call"
    },
    {
     "i": 2,
     "stance": "space"
    }
   ],
   "rules": [
    {
     "stance": "push:visit",
     "trust": "hi",
     "result": "visit",
     "rel": {
      "npcRom": 3,
      "comf": 2
     },
     "delay": 0
    },
    {
     "stance": "push:visit",
     "trust": "lo",
     "result": "letters",
     "rel": {
      "comf": 1
     },
     "delay": 2,
     "say": [
      "你不用存錢。",
      "寫信給我就好。……我會回。"
     ]
    },
    {
     "stance": "push:call",
     "trust": "hi",
     "result": "call",
     "rel": {
      "npcRom": 3
     },
     "delay": 0
    },
    {
     "stance": "push:call",
     "trust": "lo",
     "result": "letters",
     "rel": {
      "comf": 1
     },
     "delay": 2,
     "say": [
      "我想了想，還是寫信。",
      "我怕我會一直在等電話。"
     ]
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "letters",
     "rel": {
      "trust": 2,
      "npcRom": 2
     },
     "delay": 0
    }
   ],
   "values": {
    "visit": "她回臺灣那天你去接機",
    "call": "她在英國那一學期，每週固定電話",
    "letters": "她寫信寄到店裡；出發那天你去送機，她把第一封交給你"
   },
   "opens": {
    "visit": [
     "event:ev_zr_return_airport（2028-02-15 接機）"
    ],
    "call": [
     "msg:每週兩則「現在十點半了嗎？」（英國那一學期）"
    ],
    "letters": [
     "event:ev_zr_sendoff_airport（2027-09-02 送機，接 AA_390）"
    ]
   },
   "closes": {},
   "keyNote": "（她問得很輕。可是她在等你的答案。）",
   "before": "2027-08-31"
  },
  {
   "id": "YT-1",
   "who": "heroine_03",
   "beat": 4,
   "key": "mom",
   "style": "reassure",
   "lean": "found",
   "default": "found",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "support"
    },
    {
     "i": 1,
     "stance": "support"
    },
    {
     "i": 2,
     "stance": "push:tell"
    }
   ],
   "rules": [
    {
     "stance": "push:tell",
     "trust": "hi",
     "result": "tell",
     "rel": {
      "trust": 3
     },
     "delay": 5,
     "say": [
      "我想了想，還是我自己說。",
      "下週六，我請我媽來茶屋。……你不用來。我只是想讓你知道。"
     ]
    },
    {
     "stance": "push:tell",
     "trust": "lo",
     "result": "found",
     "rel": {},
     "delay": 0
    },
    {
     "stance": "support",
     "trust": "hi",
     "result": "tell",
     "rel": {
      "trust": 4,
      "npcRom": 2
     },
     "delay": 7,
     "opt": 1,
     "say": [
      "你上次說，我是在找。",
      "我想找我媽。……我要自己跟她說。"
     ]
    },
    {
     "stance": "support",
     "trust": "any",
     "result": "found",
     "rel": {
      "comf": 2
     },
     "delay": 0
    }
   ],
   "values": {
    "tell": "她自己請媽媽來茶屋說",
    "found": "媽媽臨時來臺北發現（原本）"
   },
   "opens": {
    "tell": [
     "event:ev_yt_tell_mom（取代 AA_624 事件 10' 媽媽發現）"
    ]
   },
   "closes": {},
   "keyNote": "（她看著杯子，等你說話。這件事她從來沒跟別人講過。）",
   "before": "Y1S2W9"
  },
  {
   "id": "YT-2",
   "who": "heroine_03",
   "beat": 8,
   "key": "dm",
   "style": "reassure",
   "lean": "alone",
   "default": "alone",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "support"
    },
    {
     "i": 1,
     "stance": "space"
    },
    {
     "i": 2,
     "stance": "support"
    }
   ],
   "rules": [
    {
     "stance": "support",
     "trust": "hi",
     "result": "with",
     "rel": {
      "npcRom": 4
     },
     "delay": 0,
     "opt": 2
    },
    {
     "stance": "support",
     "trust": "lo",
     "result": "alone",
     "rel": {
      "comf": 1
     },
     "delay": 2,
     "opt": 2,
     "say": [
      "你那句很犯規。",
      "……放榜那天，我想自己看。看完第一個打給你。"
     ]
    },
    {
     "stance": "support",
     "trust": "any",
     "result": "alone",
     "rel": {
      "trust": 2
     },
     "delay": 0,
     "opt": 0
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "alone",
     "rel": {
      "trust": 1
     },
     "delay": 0
    }
   ],
   "values": {
    "with": "放榜那天她約你一起看",
    "alone": "她自己看，傳訊息給你（原本）"
   },
   "opens": {
    "with": [
     "event:ev_yt_result_together（2026-07-03 總圖門口一起看網頁）"
    ]
   },
   "closes": {
    "with": [
     "msg:「上了。」「雙主修。」那則改成見面講"
    ]
   },
   "keyNote": "（她好像很在意你會怎麼說。）",
   "before": "2026-07-02"
  },
  {
   "id": "ZQ-1",
   "who": "heroine_04",
   "beat": 8,
   "key": "summer",
   "style": "contrary",
   "lean": "game",
   "default": "game",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "push:game"
    },
    {
     "i": 1,
     "stance": "space"
    },
    {
     "i": 2,
     "stance": "tease"
    }
   ],
   "rules": [
    {
     "stance": "push:game",
     "trust": "hi",
     "result": "game",
     "rel": {
      "trust": 2
     },
     "delay": 0
    },
    {
     "stance": "push:game",
     "trust": "lo",
     "result": "game",
     "rel": {
      "comf": -1
     },
     "delay": 2,
     "say": [
      "我自己決定的。",
      "不是因為你說。"
     ]
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "game",
     "rel": {
      "trust": 3,
      "npcRom": 2
     },
     "delay": 0
    },
    {
     "stance": "tease",
     "trust": "hi",
     "result": "game",
     "rel": {
      "npcRom": 3
     },
     "delay": 0
    },
    {
     "stance": "tease",
     "trust": "lo",
     "result": "intern",
     "rel": {
      "comf": -1
     },
     "delay": 4,
     "say": [
      "我想了想，還是去了我爸說的那間。",
      "……先去看看。做不到也沒關係，你說的。"
     ]
    }
   ],
   "values": {
    "game": "暑假在家做遊戲（原本），爸爸生氣那一場會出現",
    "intern": "她動搖了，暑假去爸爸介紹的公司（使用者 11-07 Q1 同意可以改結果）"
   },
   "opens": {
    "game": [
     "event:ev_zq_dad_angry（原本的爸爸生氣）"
    ],
    "intern": [
     "msg:暑假講公司（打卡、會議、午休偷寫遊戲）",
     "event:ev_zq_quit_intern（大二上她自己辭掉延長的實習）"
    ]
   },
   "closes": {
    "intern": [
     "event:ev_zq_dad_angry"
    ]
   },
   "keyNote": "（她嘴上說準備好了，可是一直在等你開口。）",
   "before": "2026-06-20"
  },
  {
   "id": "ZQ-2",
   "who": "heroine_04",
   "beat": 7,
   "key": "level",
   "style": "contrary",
   "lean": "cat",
   "default": "cat",
   "keyTrue": false,
   "opts": [
    {
     "i": 0,
     "stance": "push:shop"
    },
    {
     "i": 1,
     "stance": "push:tainan"
    },
    {
     "i": 2,
     "stance": "space"
    }
   ],
   "rules": [
    {
     "stance": "push:shop",
     "trust": "hi",
     "result": "shop",
     "rel": {
      "comf": 2,
      "npcRom": 1
     },
     "delay": 0
    },
    {
     "stance": "push:shop",
     "trust": "lo",
     "result": "cat",
     "rel": {},
     "delay": 0
    },
    {
     "stance": "push:tainan",
     "trust": "hi",
     "result": "tainan",
     "rel": {
      "comf": 2,
      "npcRom": 1
     },
     "delay": 0
    },
    {
     "stance": "push:tainan",
     "trust": "lo",
     "result": "cat",
     "rel": {},
     "delay": 0
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "cat",
     "rel": {
      "trust": 1
     },
     "delay": 0
    }
   ],
   "values": {
    "shop": "第二關的角落有一間五金行",
    "tainan": "第二關有一條台南的巷子",
    "cat": "第二關是貓找回家的路"
   },
   "opens": {},
   "closes": {},
   "before": "2028-03-07"
  },
  {
   "id": "SIS-1",
   "who": "heroine_05",
   "beat": 6,
   "key": "exam",
   "style": "own",
   "lean": "alone",
   "default": "alone",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "space"
    },
    {
     "i": 1,
     "stance": "space"
    },
    {
     "i": 2,
     "stance": "support"
    }
   ],
   "rules": [
    {
     "stance": "support",
     "trust": "hi",
     "result": "stay",
     "rel": {
      "npcRom": 4,
      "trust": 2
     },
     "delay": 0
    },
    {
     "stance": "support",
     "trust": "lo",
     "result": "alone",
     "rel": {
      "comf": 2
     },
     "delay": 1,
     "say": [
      "謝謝你的綠茶。",
      "最後一晚，我想一個人。……考完請你吃飯。"
     ]
    },
    {
     "stance": "space",
     "trust": "hi",
     "result": "stay",
     "rel": {
      "trust": 3,
      "npcRom": 2
     },
     "delay": 0
    },
    {
     "stance": "space",
     "trust": "lo",
     "result": "alone",
     "rel": {
      "trust": 1
     },
     "delay": 0
    }
   ],
   "values": {
    "stay": "考前最後一晚，她讓你坐旁邊到閉館",
    "alone": "考前她一個人，考完傳一則訊息"
   },
   "opens": {
    "stay": [
     "event:ev_sis_last_night（考前一晚她傳「今天可以坐到閉館嗎。」）"
    ]
   },
   "closes": {},
   "keyNote": "（她的聲音很小，像是怕你走掉。）",
   "before": "2026-01-31"
  },
  {
   "id": "SIS-2",
   "who": "heroine_05",
   "beat": 8,
   "key": "tell_sis",
   "style": "own",
   "lean": "wait",
   "default": "wait",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "push:guess"
    },
    {
     "i": 1,
     "stance": "tease"
    },
    {
     "i": 2,
     "stance": "space"
    }
   ],
   "rules": [
    {
     "stance": "push:guess",
     "trust": "hi",
     "result": "guess",
     "rel": {
      "comf": 2
     },
     "delay": 0
    },
    {
     "stance": "push:guess",
     "trust": "lo",
     "result": "wait",
     "rel": {},
     "delay": 0
    },
    {
     "stance": "tease",
     "trust": "hi",
     "result": "zhe",
     "rel": {
      "comf": 3,
      "npcRom": 1
     },
     "delay": 0
    },
    {
     "stance": "tease",
     "trust": "lo",
     "result": "wait",
     "rel": {
      "comf": 1
     },
     "delay": 0
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "wait",
     "rel": {
      "trust": 3,
      "npcRom": 2
     },
     "delay": 0
    }
   ],
   "values": {
    "guess": "Alison 自己猜到了",
    "zhe": "她說是阿哲（之後 Alison 去問阿哲）",
    "wait": "她準備好了才自己跟家裡說"
   },
   "opens": {
    "guess": [
     "event:ev_sis_alison_guess（讀書會群組）"
    ],
    "zhe": [
     "event:ev_sis_alison_asks_zhe（阿哲：「什麼？誰？我？」）"
    ],
    "wait": [
     "event:ev_sis_grandma_dinner（交往中才有；她自己說，奶奶家吃飯）"
    ]
   },
   "closes": {},
   "keyNote": "（她看著你，好像這件事你說了算。其實她心裡已經有答案了。）"
  },
  {
   "id": "PS-1",
   "who": "classmate_peishan",
   "beat": 5,
   "key": "future",
   "style": "reassure",
   "lean": "hide",
   "default": "hide",
   "keyTrue": false,
   "opts": [
    {
     "i": 0,
     "stance": "support"
    },
    {
     "i": 1,
     "stance": "support"
    },
    {
     "i": 2,
     "stance": "push:hide"
    }
   ],
   "rules": [
    {
     "stance": "support",
     "trust": "hi",
     "result": "seen",
     "rel": {
      "trust": 3
     },
     "delay": 0
    },
    {
     "stance": "support",
     "trust": "lo",
     "result": "hide",
     "rel": {
      "comf": 1
     },
     "delay": 0
    },
    {
     "stance": "push:hide",
     "trust": "any",
     "result": "hide",
     "rel": {},
     "delay": 0
    }
   ],
   "values": {
    "seen": "她開始想，自己是不是想教小朋友",
    "hide": "她繼續藏"
   },
   "opens": {},
   "closes": {},
   "before": "2026-12-17"
  },
  {
   "id": "PS-2",
   "who": "classmate_peishan",
   "beat": 7,
   "key": "tell",
   "style": "reassure",
   "lean": "after",
   "default": "after",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "support"
    },
    {
     "i": 1,
     "stance": "support"
    },
    {
     "i": 2,
     "stance": "space"
    }
   ],
   "rules": [
    {
     "stance": "support",
     "trust": "hi",
     "result": "before",
     "rel": {
      "trust": 4,
      "npcRom": 2
     },
     "delay": 0,
     "if": [
      "dec:classmate_peishan.future=seen",
      "dating"
     ]
    },
    {
     "stance": "support",
     "trust": "lo",
     "result": "after",
     "rel": {
      "comf": 1
     },
     "delay": 0
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "after",
     "rel": {},
     "delay": 0
    }
   ],
   "values": {
    "before": "她走以前先跟你說，你可以去車站送她",
    "after": "沒交往：照 AA_723 B（群組不知道，兩年後才出來）；交往中的 after＝她安靜走、psKeep 照舊"
   },
   "opens": {
    "before": [
     "event:ev_ps_before_leave（2026-12-17 晚上溫州街課輔班門口）",
     "event:ev_ps_station_sendoff（隔天臺北車站，可以不去）",
     "msg:2027-08-06 放榜她先傳給你"
    ]
   },
   "closes": {},
   "keyNote": "（她笑著。可是好像在等你再問一次。）",
   "before": "2026-12-17"
  },
  {
   "id": "KX-1",
   "who": "kexin",
   "beat": 7,
   "key": "after_fail",
   "style": "contrary",
   "lean": "quiet",
   "default": "quiet",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "support"
    },
    {
     "i": 1,
     "stance": "space"
    },
    {
     "i": 2,
     "stance": "tease"
    }
   ],
   "rules": [
    {
     "stance": "support",
     "trust": "hi",
     "result": "rehearse",
     "rel": {
      "trust": 3,
      "npcRom": 2
     },
     "delay": 3,
     "say": [
      "我想了想。",
      "下次面試前，你當面試官。你問得比較兇。"
     ]
    },
    {
     "stance": "support",
     "trust": "lo",
     "result": "quiet",
     "rel": {
      "trust": 1
     },
     "delay": 0
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "quiet",
     "rel": {
      "trust": 3,
      "npcRom": 3
     },
     "delay": 0
    },
    {
     "stance": "tease",
     "trust": "hi",
     "result": "eat",
     "rel": {
      "comf": 2,
      "npcRom": 1
     },
     "delay": 0
    },
    {
     "stance": "tease",
     "trust": "lo",
     "result": "quiet",
     "rel": {
      "comf": -1
     },
     "delay": 0,
     "say": [
      "我現在不想吃。",
      "……你先回去。"
     ]
    }
   ],
   "values": {
    "rehearse": "下一輪面試前，你當面試官陪她練",
    "quiet": "她自己準備，面試完才跟你說",
    "eat": "當晚你請她吃一頓"
   },
   "opens": {
    "rehearse": [
     "event:ev_kx_mock_interview"
    ],
    "eat": [
     "plan:當晚公館，祐廷請（AA_716 那種 plan）"
    ]
   },
   "closes": {},
   "keyNote": "（她不說話。你說什麼，她都會記得。）",
   "before": "2027-06-30"
  },
  {
   "id": "KX-2",
   "who": "kexin",
   "beat": 8,
   "key": "slot",
   "style": "contrary",
   "lean": "sat",
   "default": "sat",
   "keyTrue": true,
   "opts": [
    {
     "i": 0,
     "stance": "space"
    },
    {
     "i": 1,
     "stance": "support"
    },
    {
     "i": 2,
     "stance": "tease"
    }
   ],
   "rules": [
    {
     "stance": "support",
     "trust": "hi",
     "result": "wed",
     "rel": {
      "npcRom": 3
     },
     "delay": 0
    },
    {
     "stance": "support",
     "trust": "lo",
     "result": "sat",
     "rel": {
      "comf": 1
     },
     "delay": 1,
     "say": [
      "你不用換家教。",
      "……週六下午。我就是要那天。"
     ]
    },
    {
     "stance": "space",
     "trust": "any",
     "result": "sat",
     "rel": {
      "trust": 2
     },
     "delay": 0
    },
    {
     "stance": "tease",
     "trust": "hi",
     "result": "show",
     "rel": {
      "comf": 2
     },
     "delay": 0
    },
    {
     "stance": "tease",
     "trust": "lo",
     "result": "sat",
     "rel": {
      "comf": -1
     },
     "delay": 0,
     "say": [
      "你不要每次都這樣講。",
      "週六下午。不准遲到。"
     ]
    }
   ],
   "values": {
    "wed": "每週三晚上固定是你們的",
    "sat": "每週六下午固定",
    "show": "沒有固定的一格；有一次她等你、你沒出現"
   },
   "opens": {
    "wed": [
     "invite:約可昕多一格「週三晚上」"
    ],
    "sat": [
     "invite:約可昕多一格「週六下午」"
    ],
    "show": [
     "event:ev_kx_waited（那週沒約她，她在公館等了一個小時）"
    ]
   },
   "closes": {},
   "keyNote": "（她把課表推到你面前，等你看。）"
  }
 ],
 "afterQ": {
  "anExpoFirst": "說明會的資料四十頁，我讀完了。你那天坐我旁邊，第三頁的時候睡著了。",
  "anPlane": "我上飛機了。",
  "zrScholarHalf": "獎學金拿到一半。",
  "zqTbShop": "你說的五金行，我放在第二關的角落。不是因為你說的。",
  "zqTbTainan": "第二關有一條巷子。我沒去過台南，照你說的畫。"
 }
};
