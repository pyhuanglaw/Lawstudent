/* 店內偶遇（SHOP-ENCOUNTER-1103；AA_632 第一批、AA_633 第二批）＋店裡客人的路人句（SHOP-DINERS-1103；AA_640）。自動產生，不要手改：python3 tools/shop_enc/import_shop_enc.py
   來源：docs/story_planning/shop_enc/shop_enc_aa_v1.json@f6b207b30、docs/story_planning/shop_enc/shop_enc_aa_v2.json@2e0df2a67、docs/story_planning/AA_640_店裡客人的路人句.md@22c966e4a（劇情匯入白名單）。台詞照抄 AA 的 JSON。
   rows 的格式照 src/data/encounters.js（spot＝店的 zone id；巷口茶飲 wz_tea、夏日冰菓室 wz_ice 是溫州街的外帶窗口）；AA_633 的 examOK、months；學姊定食店的 weekMax、selfOnly 是匯入工具照 AA_633 表下第一點加的。
   程式：src/shopenc3d.js（SHOPENC）。*/
const SHOP_ENC={
 "src": [
  "docs/story_planning/shop_enc/shop_enc_aa_v1.json@f6b207b30",
  "docs/story_planning/shop_enc/shop_enc_aa_v2.json@2e0df2a67",
  "docs/story_planning/AA_640_店裡客人的路人句.md@22c966e4a"
 ],
 "rules": {
  "v1": {
   "values": "打招呼：熟悉 +1；併桌／一起坐：照 AA_124 1-2「一起去 Café 坐坐」（熟悉 +3、信任 +1、自在 +2），受每天上限；不打擾：沒有變化。不加戀愛，不算約會",
   "options": [
    "打招呼",
    "一起坐（join 允許時）",
    "不打擾"
   ],
   "once": "同一個人一天一次；同一家店同一時段最多一個朋友（多個符合時照固定種子挑一個）",
   "not": [
    "考試週（期中、期末那兩週）只在 cafe、cvs 出現（讀書、宵夜的人），其他店不排",
    "那天和她有約會、或她在約會中",
    "她在國外、休學、回老家（照 characters.js presence）",
    "劇情事件演出中（S.storyBusy）",
    "前任：照 ex 那一句，沒有寫的用 ENCOUNTERS.NOD",
    "可昕不在這一批（她多半不在台北）",
    "語彤不在這一批（茶屋以外的偶遇等 AA_630 接線後再排）"
   ]
  },
  "v2": {
   "inherit": "照 AA_632 第 1、3 節（打招呼／一起坐／不打擾；不會遇到的情況）",
   "examOK": "examOK:true 的列（影印店）在考試週也會遇到；其他照 AA_632 只有 cafe、cvs",
   "months": "months 有寫的列只在那幾個月（冰菓室：5、6、9 月）"
  }
 },
 "rows": [
  {
   "who": "heroine_01",
   "spot": "cafe",
   "why": "她坐在靠窗的位子，手帳攤開，旁邊一杯冷掉的拿鐵。",
   "days": [
    6,
    0
   ],
   "to": 17,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y4S1",
    "Y4S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": {
    "acq": "short",
    "friend": "no"
   },
   "join": "friend",
   "memo": "SHOP_CAFE_AN",
   "away": "在兩點半",
   "lines": {
    "acq": [
     "……你也來這裡。",
     "我在整理這週的筆記。你坐吧，我不會吵。"
    ],
    "friend": [
     "你來得剛好。這一題我想聽別人的說法。",
     "先點東西。我等你。"
    ],
    "dating": [
     "……你怎麼知道我在這。",
     "坐。這杯拿鐵冷了，等一下再點一杯。"
    ]
   },
   "ex": {
    "apart_life": [
     "……嗨。我快寫完了。"
    ]
   },
   "from": 14,
   "src": "AA_632"
  },
  {
   "who": "classmate_bohan",
   "spot": "cafe",
   "why": "他坐在最角落，耳機戴著，桌上三本書疊得很整齊。",
   "days": [
    1,
    3
   ],
   "to": 22,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2",
    "Y4S1",
    "Y4S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "no",
   "join": "friend",
   "memo": "SHOP_CAFE_BH",
   "away": "在兩點半",
   "lines": {
    "acq": [
     "……{name}。",
     "這裡比總圖晚關。我都在這讀到十點。"
    ],
    "friend": [
     "坐我旁邊。我剛好讀到你也在讀的那一章。",
     "你先讀。等一下我們互相問。"
    ]
   },
   "from": 19,
   "src": "AA_632"
  },
  {
   "who": "classmate_mingxuan",
   "spot": "bookstore",
   "why": "他蹲在二手參考書那一排，一本一本翻價錢。",
   "days": [
    6
   ],
   "to": 14,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2",
    "Y4S1",
    "Y4S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "short",
   "join": "friend",
   "memo": "SHOP_BOOK_MX",
   "away": "在舊路書房",
   "lines": {
    "acq": [
     "欸，{name}。",
     "這本學長姊的筆記版只要一百五。我在想要不要買兩本。"
    ],
    "friend": [
     "你看這本，前面的人畫了好多重點。",
     "……可是畫錯了。算了，還是買。"
    ]
   },
   "from": 11,
   "src": "AA_632"
  },
  {
   "who": "kai",
   "spot": "cvs",
   "why": "他站在微波爐前面，等一碗泡麵加熱。",
   "days": [
    0,
    1,
    2,
    3,
    4,
    5,
    6
   ],
   "to": 25,
   "terms": null,
   "stageMin": null,
   "busy": "no",
   "join": false,
   "memo": "SHOP_CVS_KAI",
   "away": "在日日便利",
   "lines": {
    "all": [
     "……室友。你也餓喔。",
     "我今天 debug 到現在。不要問。"
    ]
   },
   "from": 23,
   "src": "AA_632"
  },
  {
   "who": "heroine_04",
   "spot": "cvs",
   "why": "她在冷藏櫃前面，拿了一罐咖啡又放回去，換了一罐。",
   "days": [
    1,
    2,
    3,
    4
   ],
   "to": 25,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "short",
   "join": false,
   "memo": "SHOP_CVS_ZQ",
   "away": "在日日便利",
   "lines": {
    "acq": [
     "欸。……你這麼晚還沒睡。",
     "我也沒有。這是今天第二罐。"
    ],
    "friend": [
     "你要喝什麼？我請你。今天的程式跑過了。",
     "……只跑過一半。另一半明天再說。"
    ],
    "dating": [
     "……你怎麼在這。",
     "陪我走回去。一下就好。"
    ]
   },
   "ex": {
    "apart_drift": [
     "欸不是……好久不見。我先走了。"
    ]
   },
   "from": 22,
   "src": "AA_632"
  },
  {
   "who": "classmate_peishan",
   "spot": "wz_tea",
   "why": "她在等飲料，手上拿著一疊課輔班的講義。",
   "days": [
    3
   ],
   "to": 21.75,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "short",
   "join": false,
   "memo": "SHOP_TEA_PS",
   "away": "在巷口茶飲",
   "lines": {
    "acq": [
     "{name}！你也來買喔。",
     "我剛下課輔班。今天講了三次一元二次方程式。"
    ],
    "friend": [
     "你要喝什麼？我這杯第二杯半價，分你。",
     "……不要跟別人說我每次都點全糖。"
    ]
   },
   "from": 21,
   "src": "AA_632"
  },
  {
   "who": "yu",
   "spot": "wz_tea",
   "why": "她拿著兩杯飲料，在騎樓下回訊息。",
   "days": [
    0
   ],
   "to": 17,
   "terms": [
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2",
    "Y4S1",
    "Y4S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "short",
   "join": "friend",
   "memo": "SHOP_TEA_YU",
   "away": "在溫州街",
   "lines": {
    "acq": [
     "欸！{name}！",
     "我買兩杯，一杯是要給……算了，一杯給你。"
    ],
    "friend": [
     "你來得剛好，我買錯一杯。",
     "少冰我喝不慣，給你。……真的是買錯，不是買給你的。"
    ]
   },
   "from": 15,
   "src": "AA_632"
  },
  {
   "who": "classmate_xinci",
   "spot": "wz_brunch",
   "why": "她一個人坐雙人桌，左邊財金課本、右邊民法講義。",
   "days": [
    6
   ],
   "to": 12,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2",
    "Y4S1",
    "Y4S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": {
    "acq": "short",
    "friend": "no"
   },
   "join": "friend",
   "memo": "SHOP_BRUNCH_XC",
   "away": "在半熟",
   "lines": {
    "acq": [
     "……{name}，早。",
     "我在這裡把兩份報告排一下順序。"
    ],
    "friend": [
     "你坐。我一個人佔兩人桌，老闆一直看我。",
     "你吃什麼？這家的蛋捲很好吃。"
    ]
   },
   "from": 10,
   "src": "AA_632"
  },
  {
   "who": "zhe",
   "spot": "wz_brunch",
   "why": "他坐在吧檯，面前三個空盤子。",
   "days": [
    0
   ],
   "to": 12,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2",
    "Y4S1",
    "Y4S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "no",
   "join": true,
   "memo": "SHOP_BRUNCH_ZHE",
   "away": "在半熟",
   "lines": {
    "acq": [
     "欸！{name}！",
     "我在吃第四份。不要跟系籃的人說。"
    ],
    "friend": [
     "哥！坐，這份給你，我點太多了。",
     "……好啦，我點兩份是故意的。"
    ]
   },
   "from": 10.5,
   "src": "AA_632"
  },
  {
   "who": "zhe",
   "spot": "noodle",
   "why": "他坐在不鏽鋼桌，面前一盤叉燒飯已經吃了一半。",
   "days": [
    1,
    2,
    3,
    4,
    5
   ],
   "to": 19.5,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2",
    "Y4S1",
    "Y4S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "no",
   "join": true,
   "memo": "SHOP_SL_ZHE",
   "away": "在公館燒臘",
   "lines": {
    "acq": [
     "欸，{name}！",
     "這家燒鴨飯我一個禮拜吃三次。你坐啊。"
    ],
    "friend": [
     "哥！坐，我幫你點。燒鴨還是叉燒？",
     "……兩個都點，我們分。"
    ]
   },
   "from": 18,
   "src": "AA_633"
  },
  {
   "who": "classmate_bohan",
   "spot": "wz_print",
   "why": "他站在影印機旁邊，手上抱著一疊剛印好的講義。",
   "days": [
    0,
    1,
    2,
    3,
    4,
    5,
    6
   ],
   "to": 21.5,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2",
    "Y4S1",
    "Y4S2"
   ],
   "weeks": [
    7,
    8,
    15,
    16
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "short",
   "join": false,
   "memo": "SHOP_PRINT_BH",
   "away": "在影印店",
   "examOK": true,
   "lines": {
    "acq": [
     "……{name}。你也來印。",
     "我印了三份。一份畫重點，一份寫，一份備用。"
    ],
    "friend": [
     "你要不要我的講義？我多印了一份。",
     "……其實是故意多印的。"
    ]
   },
   "from": 19,
   "src": "AA_633"
  },
  {
   "who": "classmate_mingxuan",
   "spot": "wz_lin",
   "why": "他坐在門口那桌，吃得很快，一邊看手錶。",
   "days": [
    2,
    4
   ],
   "to": 18.75,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2",
    "Y3S1",
    "Y3S2",
    "Y4S1",
    "Y4S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "short",
   "join": false,
   "memo": "SHOP_LIN_MX",
   "away": "在林家乾麵",
   "lines": {
    "acq": [
     "欸，{name}。",
     "我七點半家教，先吃一碗。乾麵加一顆蛋，很快。"
    ],
    "friend": [
     "你要吃這家喔？推乾麵，湯不用點。",
     "我要先走了。……幫我跟老闆說謝謝，他多給我一顆蛋。"
    ]
   },
   "from": 18,
   "src": "AA_633"
  },
  {
   "who": "classmate_peishan",
   "spot": "wz_ice",
   "why": "她和芯慈坐在一起，中間一大盤芒果冰。",
   "days": [
    6
   ],
   "to": 17,
   "terms": [
    "Y1S2",
    "Y2S1",
    "Y2S2"
   ],
   "months": [
    5,
    6,
    9
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": "no",
   "join": "friend",
   "memo": "SHOP_ICE_PS",
   "away": "在冰菓室",
   "lines": {
    "acq": [
     "{name}！要不要一起吃？太大盤了。",
     "芯慈說吃不完，可是她已經吃一半了。"
    ],
    "friend": [
     "你來得剛好，幫我們解決這盤。",
     "……不要吃我這邊的芒果。"
    ]
   },
   "from": 15,
   "src": "AA_633"
  },
  {
   "who": "heroine_05",
   "spot": "wz_teishoku",
   "why": "她一個人坐在角落，定食旁邊攤著一本原文書。",
   "days": [
    1,
    2,
    3,
    4,
    5
   ],
   "to": 13.5,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2"
   ],
   "stageMin": "ACQUAINTANCE",
   "busy": {
    "acq": "short",
    "friend": "no"
   },
   "join": "friend",
   "memo": "SHOP_TEI_SIS",
   "away": "在巷子裡定食",
   "lines": {
    "acq": [
     "學弟。……你也吃這家。",
     "今天的鯖魚很好。我快吃完了。"
    ],
    "friend": [
     "坐。我剛好讀到一段想講給人聽。",
     "……你先吃，等一下再講。"
    ],
    "dating": [
     "你怎麼來了。",
     "坐我對面。今天的魚分你一半。"
    ]
   },
   "ex": {
    "apart_talk": [
     "學弟。……我先走了。"
    ]
   },
   "from": 12.5,
   "src": "AA_633",
   "weekMax": 1,
   "selfOnly": true
  }
 ],
 "newPeople": [
  {
   "id": "npc_songzn",
   "name": "知寧",
   "fullname": "宋知寧",
   "dept": "中文系・二年級",
   "intro_spot": "bookstore",
   "days": [
    6
   ],
   "to": 17,
   "terms": [
    "Y1S1",
    "Y1S2",
    "Y2S1",
    "Y2S2"
   ],
   "first": {
    "why": "你伸手拿書架上那本舊的《民法總則》，另一隻手也同時碰到它。",
    "lines": [
     "……啊，抱歉。你先。",
     "你是法律系的？我只是想看看裡面的筆記。前一個主人字很好看。"
    ],
    "choices": [
     [
      "「妳先看。」",
      [
       "謝謝。……我看完放回來，你再買。",
       "（她翻了十分鐘，把書遞給你。）「第三章的筆記最好看。」"
      ]
     ],
     [
      "「一起看？」",
      [
       "……好。",
       "（你們站在書架前面翻了二十分鐘。她說她叫知寧，中文系的。）"
      ]
     ]
    ],
    "memo": "SHOP_ZN_MET"
   },
   "later": [
    [
     "……又是你。",
     "今天沒有法律的書。我在找一本老詩集。"
    ],
    [
     "你上次買的那本，筆記看完了嗎？",
     "我覺得那個人後來一定念得很好。"
    ],
    [
     "我下禮拜要搬去另一個書店打工了。",
     "……那邊也很舊。你有空可以來。"
    ]
   ],
   "contact": {
    "after": 2,
    "line": "（她把手機遞過來。）「加一下吧。看到好書跟你說。」",
    "flag": "SHOP_ZN_CONTACT"
   },
   "note": "外系常客、朋友關係，不是可攻略對象；不接閒聊階梯；加聯絡人以後每學期最多兩則「看到一本書」的訊息（照 msg_pool 的普通訊息）。",
   "from": 14
  }
 ],
 "shopkeepers": [
  {
   "id": "shop_ade",
   "name": "阿德",
   "role": "阿德影印輸出的老闆",
   "spot": "wz_print",
   "lines": [
    [
     "又期末了喔？",
     "你們法律系每到這兩個禮拜，店裡就印不完。"
    ],
    [
     "雙面還是單面？……雙面啦，比較省。"
    ],
    [
     "你上次那份我還記得，第三頁印歪了。今天我幫你看一下。"
    ],
    [
     "（他把印好的講義對齊，用長尾夾夾好。）「拿去。考好一點。」"
    ]
   ],
   "rule": "在影印店「印東西」時隨機一句（每次最多一句；期中、期末那兩週出現的機率高）；不是偶遇系統，是店員招呼。"
  }
 ],
 "hear": {
  "dine": [
   {
    "pair": [
     [
      "A",
      "你那份報告交了沒？"
     ],
     [
      "B",
      "交了。三點五十九分。"
     ]
    ]
   },
   {
    "pair": [
     [
      "A",
      "這家的湯可以續嗎？"
     ],
     [
      "B",
      "可以，自己去舀。"
     ]
    ]
   },
   {
    "pair": [
     [
      "A",
      "週末要回家嗎？"
     ],
     [
      "B",
      "要。我媽說再不回去就不用回去了。"
     ]
    ]
   },
   {
    "pair": [
     [
      "A",
      "明天早八你起得來嗎？"
     ],
     [
      "B",
      "……我設了三個鬧鐘。"
     ]
    ]
   },
   {
    "pair": [
     [
      "A",
      "下學期要不要一起修那堂通識？"
     ],
     [
      "B",
      "好啊，聽說作業很少。"
     ]
    ]
   },
   {
    "pair": [
     [
      "A",
      "你剛剛是不是加了兩次辣？"
     ],
     [
      "B",
      "一次是不小心的。"
     ]
    ]
   },
   {
    "pair": [
     [
      "A",
      "我室友昨天半夜在煮泡麵。"
     ],
     [
      "B",
      "然後呢？"
     ],
     [
      "A",
      "我也吃了。"
     ]
    ]
   },
   {
    "pair": [
     [
      "A",
      "吃完要去哪？"
     ],
     [
      "B",
      "回去睡。下午沒課。"
     ]
    ]
   }
  ],
  "quiet": [
   "（小聲）這本我上次看到一半，被別人買走了。",
   "（小聲）我再坐一個小時就好。真的。",
   "（小聲）插座在你那邊嗎？……謝謝。",
   "（小聲）這段我看第三遍了，還是看不懂。……沒事，再一遍。",
   "（小聲）明天要交的，我現在才開始寫。",
   "（小聲）這本封面好看。……先拍起來，下次買。",
   "（小聲）咖啡涼了。算了，涼的也好喝。"
  ],
  "cvs": [
   "載具，謝謝。",
   "這個有第二件六折嗎？……喔，那我拿兩個。",
   "不用袋子，我拿著就好。",
   "幫我加熱，謝謝。……不用，我在這邊等。",
   "欸，我零錢好像不夠。……刷卡好了。",
   "還有一個，我忘了拿。等我一下。"
  ],
  "quietUse": {
   "book": [
    0,
    1,
    2,
    3,
    4,
    5
   ],
   "cafe": [
    1,
    2,
    3,
    4,
    6
   ]
  },
  "quietExam": "（小聲）考完這科就解脫了。"
 }
};
if(typeof module!=='undefined') module.exports=SHOP_ENC;
