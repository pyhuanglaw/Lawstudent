/* 自動產生：tools/story/import_gifts.py（docs/story_planning/AA_710_gifts.json@4be26c44d）。不要手改，改企劃 AA_710 再重新匯入。
   送早餐、飲料（GIFT-FLIRT-1107；播放 src/gift3d.js）*/
'use strict';
const GIFT_LINES={
 "src": "docs/story_planning/AA_710_gifts.json@4be26c44d",
 "items": [
  "豆漿",
  "米漿",
  "蛋餅",
  "飯糰",
  "三明治",
  "蘿蔔糕",
  "無糖綠茶",
  "青茶",
  "紅茶拿鐵",
  "美式咖啡",
  "拿鐵",
  "熱可可"
 ],
 "people": {
  "heroine_01": {
   "drink": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "……給我的？",
       "謝謝。下次我還你。",
       "（她把杯子放在手帳旁邊，沒有馬上喝。）"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "今天剛好想喝。你是怎麼知道的？",
       "（她在手帳上寫了一行字，你看到「飲料」兩個字。）"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天已經喝過了。謝謝你，留著自己喝。"
    ]
   },
   "breakfast": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "早餐？我吃過了。可是我中午吃，謝謝。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "我今天真的沒吃。",
       "（她咬了一口，才說：）",
       "謝謝。下次換我帶。"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天吃過兩次早餐了。你留著。"
    ]
   }
  },
  "heroine_02": {
   "drink": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "我在咖啡廳上班，你還送我飲料？",
       "謝謝。別人買的，喝起來比較好喝。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "你又買了。這樣我會習慣。"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天喝太多了，店裡的試喝也算。謝謝你。"
    ],
    "fav": {
     "item": "熱可可（加一份濃縮）",
     "lines": [
      "熱可可？……還加了濃縮。",
      "你記得。"
     ],
     "rel": {
      "trust": 2,
      "comf": 2,
      "npcRom": 1
     }
    }
   },
   "breakfast": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "我早上都不吃。……可是這個看起來很好吃。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "你知道我早上不吃。所以你是故意的？",
       "（她吃完了，連袋子都摺好。）"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天吃過了。真的。"
    ]
   }
  },
  "heroine_03": {
   "drink": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "嗯。謝謝。多少錢？我給你。",
       "（你說不用。她想了一下，收下了。）"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "你帶的我都喝。不用告訴我多少錢了。"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天茶屋喝了很多茶。謝謝。"
    ]
   },
   "breakfast": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "早餐。……我很少吃外面的早餐。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "秀琴姨今天休息，我本來不打算吃。",
       "（她吃得很慢，好像在記味道。）"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天吃過了。你留著。"
    ]
   }
  },
  "heroine_04": {
   "drink": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "喔，謝啦。我正好沒錢。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "你是我的飲料供應商嗎。……好，我接受。"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "我今天咖啡因已經超標了。手在抖。"
    ],
    "fav": {
     "item": "美式咖啡（冰的）",
     "lines": [
      "美式，冰的。",
      "……十二月也是冰的。你知道。"
     ],
     "rel": {
      "trust": 2,
      "comf": 2,
      "npcRom": 1
     }
    }
   },
   "breakfast": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "早餐？我通常中午才起床。這是我今天第一餐。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "你知道我昨天熬夜？……好，我不問了，我吃。"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "吃過了。我今天難得有吃早餐。"
    ]
   }
  },
  "heroine_05": {
   "drink": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "學弟，不用破費。……謝謝。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "{name}，下次不要買了，我會不好意思。",
       "（她說完，還是把吸管插好了。）"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天已經有了。謝謝你，你自己喝。"
    ],
    "fav": {
     "item": "無糖綠茶（去冰）",
     "lines": [
      "……無糖綠茶，去冰。",
      "你怎麼知道的？……算了，不要說。"
     ],
     "rel": {
      "trust": 2,
      "comf": 2,
      "npcRom": 1
     }
    }
   },
   "breakfast": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "學弟，我吃過了。可是謝謝，我帶去圖書館吃。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "我今天五點就起來寫題目，忘了吃。",
       "（她吃完才說謝謝，說得很小聲。）"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天吃過了。你自己吃。"
    ]
   }
  },
  "classmate_peishan": {
   "drink": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "哇，給我的嗎？謝謝你！"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "你又買了！我要拍照。",
       "（她拍了一張飲料的照片，說要放進她的「好事」相簿。）"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天喝兩杯了，再喝會一直跑廁所。謝謝你啦。"
    ]
   },
   "breakfast": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "早餐！我最喜歡別人幫我買早餐了。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "這個口味，我上次說過我喜歡。你有記得耶。"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "我吃飽了！你吃，你吃。"
    ]
   }
  },
  "kexin": {
   "drink": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "你買給我的？好啦，謝謝。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "你幹嘛一直買給我。……好啦，我下次請你。"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "今天喝過了。你自己喝。"
    ],
    "fav": {
     "item": "青茶（無糖）",
     "lines": [
      "青茶，無糖。",
      "……你記得。予樂都記不住。"
     ],
     "rel": {
      "trust": 2,
      "comf": 2,
      "npcRom": 1
     }
    }
   },
   "breakfast": {
    "yes": [
     {
      "need": 1,
      "lines": [
       "早餐？我在車上吃過了。可是這個比較好吃。"
      ],
      "rel": {
       "fam": 1,
       "comf": 1
      }
     },
     {
      "need": 4,
      "lines": [
       "我早上都在趕車，沒時間吃。謝謝你。",
       "（她吃得很快，吃完說：「明天換我買。」）"
      ],
      "rel": {
       "fam": 1,
       "comf": 2,
       "npcRom": 1
      }
     }
    ],
    "no": [
     "吃過了啦。你吃。"
    ]
   }
  }
 }
};
