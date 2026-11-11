/* 自動產生：tools/story/import_l118_lunch.py（docs/story_planning/AA_771_l118_lunch.json@dd4a310f1）。不要手改，改企劃稿再重新匯入。
   118 巷課後午餐邀約（L118-LUNCH-INVITE-1111，使用者 X339）的台詞、選項、旁白：一字照 AA 的稿；special 的 when 是工具從 cond（文字條件）拆出來的。
   格式說明在匯入工具的檔頭；怎麼演：src/l118_lunch3d.js */
'use strict';
const L118_LUNCH_DATA={
 "src": "docs/story_planning/AA_771_l118_lunch.json@dd4a310f1",
 "_meta": {
  "by": "AA（帳號 A）",
  "date": "2026-11-11",
  "version": 1,
  "task": "L118-LUNCH-INVITE-1111（USER_WANTS X339）",
  "spec": "開發分支 docs/handoff/user_specs/L118_LUNCH_1111.md（使用者 11-11 原文）",
  "note": "第一版。只列和祐廷同班、上午在法學院同堂的八個人；學姊（高年級）、語彤（社會系、雙主修的課和大一分開）、子晴、芷若、可昕、阿凱不會發起也不同行，只可能在偶遇裡出現。{店名}＝發起人選的那間店的名字；{name}＝玩家的名字；{發起人}＝發起人的名字。對話裡 who 是 player 的是祐廷的句子、null 是旁白、其他字串（「助教」「大四的學長」）是沒有立繪的路人。",
  "rules": [
   "店：一一八茶飲不當午餐（只在 L-yu-3 被提到）；慢讀咖啡只有以安會選。選到的店那天沒開就照權重換下一間。",
   "週一阿哲手機揪午餐（AA_280 第 4 節）照舊：那天答應了就不再當面邀；沒答應或他沒揪，照常判定。",
   "AA_280 第 3 節的熟客、AA_311 H1～H9 照舊；同一天已經演過那一位的 H 事件，偶遇就不要再抽到同一個人。",
   "柏翰和沛珊大一下交往、大二上分開：大二上那一學期不要把兩個人排進同一桌（其他學期可以）。",
   "好感：八個人都照規格 +2（熟悉度）。和玩家交往中的人（以安、沛珊）也是 +2 熟悉度，不加戀愛的數值——午餐不是約會。偶遇的人 +1；特殊對話（kind: talk）相關的人再 +1。",
   "lunch 的 shop 欄＝這一組只在那幾間店播；沒有 shop 的哪一間都可以。who 有兩三個人的組＝那幾個人都在這一桌時才抽。",
   "special 大約兩成：kind talk＝同桌的人多講一件自己的事；kind meet＝遇到別人。first:true＝第一次不能被快速略過。cond 是給程式看的條件，用文字寫。"
  ],
  "open": [
   "宥辰、阿哲、Alison 的 id 我照 characters.js／lane118_shops.js 寫（classmate_youchen、zhe、yu）；阿凱寫 kai——id 不對請直接改。",
   "每個人的句子都是第一版，BB 還沒看；你可以先接系統，字我會再補（每人的午餐對話想加到五六組）。",
   "人物只用 characters.js 和現行設定總表有的設定；沒有新增人物背景。"
  ]
 },
 "who": {
  "heroine_01": {
   "name": "以安",
   "weight": 1.0,
   "prefs": {
    "omu": 3,
    "cafe2": 2,
    "pasta": 1
   },
   "note": "咖哩蛋包飯只吃得下半份（AA_410）；週三會去慢讀咖啡（AA_280 熟客）。慢讀咖啡只對她算午餐。"
  },
  "classmate_bohan": {
   "name": "柏翰",
   "weight": 1.0,
   "prefs": {
    "self": 4,
    "home": 2,
    "noodle2": 1
   },
   "note": "吃很快，十二點四十要回總圖（AA_311 H6）。"
  },
  "classmate_peishan": {
   "name": "沛珊",
   "weight": 1.0,
   "prefs": {
    "omu": 3,
    "pasta": 3,
    "korea": 2,
    "dian": 1
   },
   "note": "不看價錢、愛鬧；不評別人吃的東西（UA-AA-1110-17）。消失期不出現（照 presence）。"
  },
  "classmate_mingxuan": {
   "name": "明軒",
   "weight": 1.0,
   "prefs": {
    "self": 4,
    "noodle2": 2,
    "home": 2
   },
   "note": "一百以內；跟阿哲一起打球。"
  },
  "classmate_xinci": {
   "name": "芯慈",
   "weight": 0.7,
   "prefs": {
    "home": 3,
    "pasta": 2,
    "korea": 2
   },
   "note": "她的習慣是吃飯提前一天約，所以當面邀的機率低一點，邀的話會先說不好意思臨時問。"
  },
  "classmate_youchen": {
   "name": "宥辰",
   "weight": 0.4,
   "prefs": {
    "noodle2": 3,
    "dian": 2,
    "korea": 1
   },
   "note": "考前才出現；有來上課的日子才可能邀（照出席判定）。"
  },
  "zhe": {
   "name": "阿哲",
   "weight": 1.2,
   "prefs": {
    "noodle2": 3,
    "dian": 3,
    "korea": 2,
    "home": 2
   },
   "note": "本來就是揪人的那個。週一手機揪午餐照舊（AA_280 第 4 節）；那天有約就不另外當面邀。"
  },
  "yu": {
   "name": "Alison",
   "weight": 1.1,
   "prefs": {
    "korea": 4,
    "omu": 2,
    "pasta": 2,
    "dian": 1
   },
   "note": "怕一個人吃。"
  }
 },
 "options": {
  "accept": "「好，走。」",
  "decline": "「今天不行，下次。」"
 },
 "invite": {
  "heroine_01": {
   "lines": [
    "中午有約嗎？沒有的話去{店名}，我想在下一堂前回來。",
    "我要去{店名}。你要一起嗎？",
    "剛剛那一題我還沒想完。邊吃邊講，{店名}。",
    "你早餐有吃嗎？看起來沒有。走，{店名}。"
   ],
   "declineReply": [
    "好。那筆記我吃完再傳給你。"
   ]
  },
  "classmate_bohan": {
   "lines": [
    "{name}。{店名}，現在去不用排。",
    "吃飯。{店名}。我十二點四十要回總圖。",
    "我要去{店名}。一起？",
    "你有空嗎？{店名}，吃完我有一題想問你。"
   ],
   "declineReply": [
    "好。那我先走。"
   ]
  },
  "classmate_peishan": {
   "lines": [
    "欸，{店名}，走。我已經餓到在聞隔壁的便當了。",
    "我想吃{店名}，可是一個人去會被排到吧檯。你來當我的桌友。",
    "你中午一個人吃嗎？跟我去{店名}，我一個人吃會一直滑手機。",
    "剛剛那堂我有一半沒聽懂。你請我吃飯，我請你講解——不對，反了。走啦，{店名}。"
   ],
   "declineReply": [
    "好啦，下次。我自己去當吧檯的客人。"
   ]
  },
  "classmate_mingxuan": {
   "lines": [
    "欸，吃飯嗎？{店名}，我想省一點。",
    "{店名}？我算過，這禮拜還吃得起。",
    "我下午有事，先吃。{店名}，一起？",
    "走，{店名}。吃完還來得及去投兩球。"
   ],
   "declineReply": [
    "好，下次。"
   ]
  },
  "classmate_xinci": {
   "lines": [
    "{name}，中午有空嗎？我昨天就想問了，沒問到。{店名}可以嗎？",
    "我想吃{店名}，一個人去有點怪。你要一起嗎？",
    "不好意思，臨時問你。要不要去{店名}？"
   ],
   "declineReply": [
    "沒關係。那我下次早一點問。"
   ]
  },
  "classmate_youchen": {
   "lines": [
    "我難得來上課，慶祝一下。{店名}，走。",
    "我還沒吃早餐。現在算午餐了對吧？{店名}。",
    "{店名}。我昨天弄到三點，現在需要熱的。"
   ],
   "declineReply": [
    "好。那筆記借我拍一下總可以吧。"
   ]
  },
  "zhe": {
   "lines": [
    "欸，中午 118？{店名}，我揪。",
    "走走走，{店名}，晚了沒位子。",
    "你中午沒事吧？{店名}，我想換口味。",
    "吃飯。{店名}。再多找一個湊一桌。"
   ],
   "declineReply": [
    "好喔，下次。"
   ]
  },
  "yu": {
   "lines": [
    "欸，中午一起吃！{店名}，我想很久了。",
    "對了，你吃了沒？還沒的話{店名}，快，我餓了。",
    "我不想一個人吃。{店名}，走嘛。",
    "阿哲去練球了。你陪我去{店名}，不然我要一個人講話。"
   ],
   "declineReply": [
    "好吧，下次！"
   ]
  }
 },
 "lunch": [
  {
   "id": "L-an-1",
   "who": [
    "heroine_01"
   ],
   "lines": [
    [
     "heroine_01",
     "人好多。我們坐裡面，外面那桌會一直被撞。"
    ],
    [
     "player",
     "妳連這個都知道。"
    ],
    [
     "heroine_01",
     "上禮拜被撞了兩次。"
    ]
   ]
  },
  {
   "id": "L-an-2",
   "who": [
    "heroine_01"
   ],
   "shop": [
    "omu",
    "pasta"
   ],
   "lines": [
    [
     "heroine_01",
     "我吃不完。這一半給你，盤子我多要了。"
    ],
    [
     "player",
     "妳每次都只吃一半。"
    ],
    [
     "heroine_01",
     "所以每次都要找人。"
    ]
   ]
  },
  {
   "id": "L-an-3",
   "who": [
    "heroine_01"
   ],
   "lines": [
    [
     "heroine_01",
     "下一堂的判決你看了嗎？"
    ],
    [
     "player",
     "吃飯的時候不要講這個。"
    ],
    [
     "heroine_01",
     "好。吃完講。"
    ]
   ]
  },
  {
   "id": "L-bohan-1",
   "who": [
    "classmate_bohan"
   ],
   "lines": [
    [
     "classmate_bohan",
     "十二點二十。可以吃到四十。"
    ],
    [
     "player",
     "你吃飯也看時間。"
    ],
    [
     "classmate_bohan",
     "不看會吃太久。"
    ]
   ]
  },
  {
   "id": "L-bohan-2",
   "who": [
    "classmate_bohan"
   ],
   "lines": [
    [
     "classmate_bohan",
     "剛剛老師講的那個例外，我寫了三行。"
    ],
    [
     "player",
     "借我看。"
    ],
    [
     "classmate_bohan",
     "吃完。會沾到油。"
    ]
   ]
  },
  {
   "id": "L-bohan-3",
   "who": [
    "classmate_bohan"
   ],
   "lines": [
    [
     "classmate_bohan",
     "我吃飯很快。你慢慢吃，我等。"
    ],
    [
     "player",
     "你不是要回總圖？"
    ],
    [
     "classmate_bohan",
     "等你五分鐘還可以。"
    ]
   ]
  },
  {
   "id": "L-ps-1",
   "who": [
    "classmate_peishan"
   ],
   "lines": [
    [
     "classmate_peishan",
     "人也太多了吧。我們是來吃飯還是來排隊的？"
    ],
    [
     "player",
     "中午都這樣啊。"
    ],
    [
     "classmate_peishan",
     "那我明天帶板凳。"
    ]
   ]
  },
  {
   "id": "L-ps-2",
   "who": [
    "classmate_peishan"
   ],
   "lines": [
    [
     "classmate_peishan",
     "我剛剛上課有偷看你。你在畫格子。"
    ],
    [
     "player",
     "我在做筆記。"
    ],
    [
     "classmate_peishan",
     "筆記不會有三角形。"
    ]
   ]
  },
  {
   "id": "L-ps-3",
   "who": [
    "classmate_peishan"
   ],
   "lines": [
    [
     "classmate_peishan",
     "吃完陪我走回去。那個紅綠燈很久，我不要一個人等。"
    ],
    [
     "player",
     "好。"
    ],
    [
     "classmate_peishan",
     "你答應得好快。我本來準備了三個理由。"
    ]
   ]
  },
  {
   "id": "L-mx-1",
   "who": [
    "classmate_mingxuan"
   ],
   "shop": [
    "self",
    "noodle2",
    "home"
   ],
   "lines": [
    [
     "classmate_mingxuan",
     "加一顆蛋還在一百以內。"
    ],
    [
     "player",
     "你每次都算。"
    ],
    [
     "classmate_mingxuan",
     "算了比較敢加。"
    ]
   ]
  },
  {
   "id": "L-mx-2",
   "who": [
    "classmate_mingxuan"
   ],
   "lines": [
    [
     "classmate_mingxuan",
     "阿哲昨天又約打球，我說我要念書。"
    ],
    [
     "player",
     "結果呢？"
    ],
    [
     "classmate_mingxuan",
     "打到九點。"
    ]
   ]
  },
  {
   "id": "L-mx-3",
   "who": [
    "classmate_mingxuan"
   ],
   "lines": [
    [
     "classmate_mingxuan",
     "我表弟問我，法律系是不是都很會吵架。"
    ],
    [
     "player",
     "你怎麼回？"
    ],
    [
     "classmate_mingxuan",
     "我說看人。"
    ]
   ]
  },
  {
   "id": "L-xc-1",
   "who": [
    "classmate_xinci"
   ],
   "lines": [
    [
     "classmate_xinci",
     "這間我第一次來。平常我都去巷口那間。"
    ],
    [
     "player",
     "怎麼換了？"
    ],
    [
     "classmate_xinci",
     "想試試看換一間的一天。"
    ]
   ]
  },
  {
   "id": "L-xc-2",
   "who": [
    "classmate_xinci"
   ],
   "lines": [
    [
     "classmate_xinci",
     "你剛剛那題是怎麼想的？我寫的跟你不一樣。"
    ],
    [
     "player",
     "吃完給妳看。"
    ],
    [
     "classmate_xinci",
     "好，我先記著。"
    ]
   ]
  },
  {
   "id": "L-xc-3",
   "who": [
    "classmate_xinci"
   ],
   "lines": [
    [
     "classmate_xinci",
     "昨天那齣你有在追嗎？"
    ],
    [
     "player",
     "哪一齣？"
    ],
    [
     "classmate_xinci",
     "沒事。吃完我傳給你，你不要笑。"
    ]
   ]
  },
  {
   "id": "L-yc-1",
   "who": [
    "classmate_youchen"
   ],
   "lines": [
    [
     "classmate_youchen",
     "這是我今天第一餐。"
    ],
    [
     "player",
     "現在十二點了。"
    ],
    [
     "classmate_youchen",
     "所以是很豐盛的早餐。"
    ]
   ]
  },
  {
   "id": "L-yc-2",
   "who": [
    "classmate_youchen"
   ],
   "lines": [
    [
     "classmate_youchen",
     "上禮拜的筆記借我拍。我請你——不對，各付各的。我幫你拿筷子。"
    ],
    [
     "player",
     "成交。"
    ]
   ]
  },
  {
   "id": "L-yc-3",
   "who": [
    "classmate_youchen"
   ],
   "lines": [
    [
     "classmate_youchen",
     "昨天場子有人一直點同一首，點了五次。"
    ],
    [
     "player",
     "你放了嗎？"
    ],
    [
     "classmate_youchen",
     "放了四次。第五次我假裝沒聽到。"
    ]
   ]
  },
  {
   "id": "L-zhe-1",
   "who": [
    "zhe"
   ],
   "shop": [
    "noodle2",
    "dian",
    "korea"
   ],
   "lines": [
    [
     "zhe",
     "這間我給八十分。"
    ],
    [
     "player",
     "上次那間呢？"
    ],
    [
     "zhe",
     "七十。差在湯。"
    ]
   ]
  },
  {
   "id": "L-zhe-2",
   "who": [
    "zhe"
   ],
   "lines": [
    [
     "zhe",
     "欸，民總的報告你們組寫到哪？"
    ],
    [
     "player",
     "還沒開始。"
    ],
    [
     "zhe",
     "太好了，我也是。"
    ]
   ]
  },
  {
   "id": "L-zhe-3",
   "who": [
    "zhe"
   ],
   "lines": [
    [
     "zhe",
     "系籃練球，要來就來。"
    ],
    [
     "player",
     "我不會打。"
    ],
    [
     "zhe",
     "不會打可以來坐，幫我們顧水。"
    ]
   ]
  },
  {
   "id": "L-yu-1",
   "who": [
    "yu"
   ],
   "lines": [
    [
     "yu",
     "我跟你說，我今天排了四件事，這是第二件。"
    ],
    [
     "player",
     "吃飯也算一件？"
    ],
    [
     "yu",
     "算啊。不排進去我會忘記吃。"
    ]
   ]
  },
  {
   "id": "L-yu-2",
   "who": [
    "yu"
   ],
   "lines": [
    [
     "yu",
     "欸，你有沒有發現老師今天點人都點同一排？"
    ],
    [
     "player",
     "有嗎？"
    ],
    [
     "yu",
     "有！我有算。這不公平。"
    ]
   ]
  },
  {
   "id": "L-yu-3",
   "who": [
    "yu"
   ],
   "lines": [
    [
     "yu",
     "吃完要不要去買飲料？一一八那間。"
    ],
    [
     "player",
     "妳不是要趕下一堂？"
    ],
    [
     "yu",
     "買了用跑的。"
    ]
   ]
  },
  {
   "id": "G-zhe-yu",
   "who": [
    "zhe",
    "yu"
   ],
   "lines": [
    [
     "zhe",
     "她又要點一樣的。"
    ],
    [
     "yu",
     "一樣的才不會踩雷！"
    ],
    [
     "player",
     "妳點什麼？"
    ],
    [
     "yu",
     "你等一下看就知道，每次都那個。"
    ]
   ]
  },
  {
   "id": "G-bohan-mx",
   "who": [
    "classmate_bohan",
    "classmate_mingxuan"
   ],
   "lines": [
    [
     "classmate_mingxuan",
     "柏翰，你吃飯可以不要看錶嗎？"
    ],
    [
     "classmate_bohan",
     "十二點三十五。"
    ],
    [
     "classmate_mingxuan",
     "我沒有問你幾點。"
    ]
   ]
  },
  {
   "id": "G-an-xc",
   "who": [
    "heroine_01",
    "classmate_xinci"
   ],
   "lines": [
    [
     "classmate_xinci",
     "以安，妳的筆記可以借我對一下嗎？"
    ],
    [
     "heroine_01",
     "可以。妳的也借我，妳的字比較好認。"
    ],
    [
     "classmate_xinci",
     "吃完再拿出來，會沾到。"
    ]
   ]
  },
  {
   "id": "G-an-ps",
   "who": [
    "heroine_01",
    "classmate_peishan"
   ],
   "lines": [
    [
     "classmate_peishan",
     "以安吃一半，我吃一份半，我們兩個平均起來很正常。"
    ],
    [
     "heroine_01",
     "妳不要把我算進去。"
    ],
    [
     "classmate_peishan",
     "{name}，你評評理。"
    ],
    [
     "player",
     "我吃我的。"
    ]
   ]
  },
  {
   "id": "G-zhe-mx",
   "who": [
    "zhe",
    "classmate_mingxuan"
   ],
   "lines": [
    [
     "zhe",
     "明軒，球鞋你買了沒？"
    ],
    [
     "classmate_mingxuan",
     "還在等特價。"
    ],
    [
     "zhe",
     "等到球季結束。"
    ],
    [
     "classmate_mingxuan",
     "那就明年穿。"
    ]
   ]
  },
  {
   "id": "G-yu-ps",
   "who": [
    "yu",
    "classmate_peishan"
   ],
   "lines": [
    [
     "yu",
     "我們三個坐一桌好像在開會。"
    ],
    [
     "classmate_peishan",
     "那我當主席。第一案，誰去拿湯匙。"
    ],
    [
     "player",
     "我去。"
    ],
    [
     "classmate_peishan",
     "通過。"
    ]
   ]
  },
  {
   "id": "G-zhe-yu-mx",
   "who": [
    "zhe",
    "yu",
    "classmate_mingxuan"
   ],
   "lines": [
    [
     "zhe",
     "四個人剛好一桌。"
    ],
    [
     "classmate_mingxuan",
     "四個人分小菜最划算。"
    ],
    [
     "yu",
     "你們兩個可以講一點跟錢無關的嗎？"
    ]
   ]
  }
 ],
 "special": [
  {
   "id": "S-talk-an",
   "kind": "talk",
   "who": [
    "heroine_01"
   ],
   "bonus": {
    "heroine_01": 1
   },
   "first": true,
   "cond": "以安是這一餐的發起人或同行；熟悉朋友以上",
   "when": {
    "inParty": [
     "heroine_01"
    ],
    "minTier": 3
   },
   "lines": [
    [
     "heroine_01",
     "我這禮拜的計畫表，中午那一格都寫「隨便」。"
    ],
    [
     "player",
     "然後？"
    ],
    [
     "heroine_01",
     "結果每天最難決定的就是那一格。"
    ]
   ]
  },
  {
   "id": "S-talk-bohan",
   "kind": "talk",
   "who": [
    "classmate_bohan"
   ],
   "bonus": {
    "classmate_bohan": 1
   },
   "first": true,
   "cond": "柏翰在這一餐；熟悉朋友以上",
   "when": {
    "inParty": [
     "classmate_bohan"
    ],
    "minTier": 3
   },
   "lines": [
    [
     "classmate_bohan",
     "我念得很慢。這一章我看第三次了。"
    ],
    [
     "player",
     "第三次會怎樣？"
    ],
    [
     "classmate_bohan",
     "第三次以後就不會忘。"
    ]
   ]
  },
  {
   "id": "S-talk-ps",
   "kind": "talk",
   "who": [
    "classmate_peishan"
   ],
   "bonus": {
    "classmate_peishan": 1
   },
   "first": true,
   "cond": "沛珊在這一餐；熟悉朋友以上",
   "when": {
    "inParty": [
     "classmate_peishan"
    ],
    "minTier": 3
   },
   "lines": [
    [
     "classmate_peishan",
     "我媽昨天問我學校附近有沒有好吃的。我說有一條巷子，她第一句是「那店租應該很貴」。"
    ],
    [
     "player",
     "她在考察？"
    ],
    [
     "classmate_peishan",
     "她看到店就會算。我小時候以為每個媽媽進餐廳都先數桌子。"
    ]
   ]
  },
  {
   "id": "S-talk-mx",
   "kind": "talk",
   "who": [
    "classmate_mingxuan"
   ],
   "bonus": {
    "classmate_mingxuan": 1
   },
   "first": true,
   "cond": "明軒在這一餐；熟悉朋友以上",
   "when": {
    "inParty": [
     "classmate_mingxuan"
    ],
    "minTier": 3
   },
   "lines": [
    [
     "classmate_mingxuan",
     "我其實有在念。只是不在你們看得到的地方。"
    ],
    [
     "player",
     "在哪？"
    ],
    [
     "classmate_mingxuan",
     "公車站。等車的時候背得最快。"
    ]
   ]
  },
  {
   "id": "S-talk-xc",
   "kind": "talk",
   "who": [
    "classmate_xinci"
   ],
   "bonus": {
    "classmate_xinci": 1
   },
   "first": true,
   "cond": "芯慈在這一餐；熟悉朋友以上；大一下以後",
   "when": {
    "inParty": [
     "classmate_xinci"
    ],
    "minTier": 3,
    "termFrom": "Y1S2"
   },
   "lines": [
    [
     "classmate_xinci",
     "我雙主修的課表出來了。有兩天中午會被卡住。"
    ],
    [
     "player",
     "那其他天呢？"
    ],
    [
     "classmate_xinci",
     "其他天可以。我先跟你說。"
    ]
   ]
  },
  {
   "id": "S-talk-yc",
   "kind": "talk",
   "who": [
    "classmate_youchen"
   ],
   "bonus": {
    "classmate_youchen": 1
   },
   "first": true,
   "cond": "宥辰在這一餐；普通同學以上",
   "when": {
    "inParty": [
     "classmate_youchen"
    ],
    "minTier": 2
   },
   "lines": [
    [
     "classmate_youchen",
     "法條我看一次就記得。只是我都晚上看。"
    ],
    [
     "player",
     "多晚？"
    ],
    [
     "classmate_youchen",
     "上台前，在後台。"
    ]
   ]
  },
  {
   "id": "S-talk-zhe",
   "kind": "talk",
   "who": [
    "zhe"
   ],
   "bonus": {
    "zhe": 1
   },
   "first": true,
   "cond": "阿哲在這一餐；普通同學以上",
   "when": {
    "inParty": [
     "zhe"
    ],
    "minTier": 2
   },
   "lines": [
    [
     "zhe",
     "我高雄的朋友問我臺北什麼好吃。我說 118 巷。"
    ],
    [
     "player",
     "他怎麼說？"
    ],
    [
     "zhe",
     "他說那是什麼，門牌號碼嗎。"
    ]
   ]
  },
  {
   "id": "S-talk-yu",
   "kind": "talk",
   "who": [
    "yu"
   ],
   "bonus": {
    "yu": 1
   },
   "first": true,
   "cond": "Alison 在這一餐；熟悉朋友以上",
   "when": {
    "inParty": [
     "yu"
    ],
    "minTier": 3
   },
   "lines": [
    [
     "yu",
     "我今天晚上沒有排事情。很少這樣。"
    ],
    [
     "player",
     "那妳要幹嘛？"
    ],
    [
     "yu",
     "不知道。所以我有點慌。"
    ]
   ]
  },
  {
   "id": "S-meet-sis",
   "kind": "meet",
   "who": [
    "heroine_05"
   ],
   "bonus": {
    "heroine_05": 1
   },
   "first": true,
   "shop": [
    "self",
    "home"
   ],
   "cond": "認識學姊；她在臺北、在學校的學期（照 presence）；不和 AA_311 H1 同一天",
   "when": {
    "knows": [
     "heroine_05"
    ],
    "present": [
     "heroine_05"
    ],
    "notH": [
     "H1"
    ]
   },
   "lines": [
    [
     null,
     "（好家自助餐門口，學姊提著一個便當走出來。）"
    ],
    [
     "heroine_05",
     "你們班下課了？"
    ],
    [
     "player",
     "剛下課。"
    ],
    [
     "heroine_05",
     "那一堂我以前也修。考古題不要只看去年的。"
    ]
   ]
  },
  {
   "id": "S-meet-yt",
   "kind": "meet",
   "who": [
    "heroine_03"
   ],
   "bonus": {
    "heroine_03": 1
   },
   "first": true,
   "shop": [
    "dian"
   ],
   "cond": "有 YT_MET_JOB；語彤在臺北；平日；不和 AA_311 H8 同一天",
   "when": {
    "flags": [
     "YT_MET_JOB"
    ],
    "reachable": [
     "heroine_03"
    ],
    "weekday": true,
    "notH": [
     "H8"
    ]
   },
   "lines": [
    [
     null,
     "（靠牆那桌，語彤一個人，面前一碗酸辣河粉，辣椒另外一小碟。）"
    ],
    [
     "heroine_03",
     "你也來這間。"
    ],
    [
     "player",
     "妳吃這麼辣？"
    ],
    [
     "heroine_03",
     "還好。"
    ]
   ]
  },
  {
   "id": "S-meet-kai",
   "kind": "meet",
   "who": [
    "kai"
   ],
   "bonus": {
    "kai": 1
   },
   "first": true,
   "shop": [
    "noodle2"
   ],
   "cond": "大一（阿凱是室友的那一年）；阿凱在臺北",
   "when": {
    "terms": [
     "Y1S1",
     "Y1S2"
    ],
    "reachable": [
     "kai"
    ]
   },
   "lines": [
    [
     null,
     "（阿凱一個人在角落吃乾麵，看到你們，舉了一下筷子。）"
    ],
    [
     "kai",
     "你們中午都一起吃喔。"
    ],
    [
     "player",
     "你要過來嗎？"
    ],
    [
     "kai",
     "不用。我吃完要回去睡。"
    ]
   ]
  },
  {
   "id": "S-meet-ziqing",
   "kind": "meet",
   "who": [
    "heroine_04"
   ],
   "bonus": {
    "heroine_04": 1
   },
   "first": true,
   "cond": "認識子晴；她在臺北；走出巷子時經過慢讀咖啡（任何一間店吃完都可以播）",
   "when": {
    "knows": [
     "heroine_04"
    ],
    "reachable": [
     "heroine_04"
    ],
    "at": "leave",
    "shopOpen": [
     "cafe2"
    ]
   },
   "lines": [
    [
     null,
     "（慢讀咖啡的外帶窗口，子晴在等她的咖啡。）"
    ],
    [
     "heroine_04",
     "法律系集體出動。"
    ],
    [
     "player",
     "妳吃了嗎？"
    ],
    [
     "heroine_04",
     "這杯就是。"
    ]
   ]
  },
  {
   "id": "S-meet-senior",
   "kind": "meet",
   "who": [],
   "first": true,
   "cond": "大一；學期中",
   "when": {
    "terms": [
     "Y1S1",
     "Y1S2"
    ],
    "inTerm": true
   },
   "lines": [
    [
     null,
     "（店裡滿了。老闆把你們和兩個不認識的大四併成一桌。）"
    ],
    [
     "大四的學長",
     "大一的？民總誰教？"
    ],
    [
     "player",
     "（你說了老師的名字。）"
    ],
    [
     null,
     "（他講了十分鐘那位老師的考試習慣。你們把筆記都拿出來了。）"
    ]
   ]
  },
  {
   "id": "S-meet-ta",
   "kind": "meet",
   "who": [],
   "first": true,
   "cond": "學期中，第 9 週以後（期中考完）",
   "when": {
    "inTerm": true,
    "weekFrom": 9
   },
   "lines": [
    [
     null,
     "（隔壁桌是系上的助教，面前攤著一疊考卷，一邊吃一邊改。）"
    ],
    [
     "助教",
     "不要看，還沒改完。"
    ],
    [
     null,
     "（你們默默換到離他遠一點的位子。）"
    ]
   ]
  },
  {
   "id": "S-meet-prof",
   "kind": "meet",
   "who": [],
   "first": true,
   "cond": "學期中；不指名哪一位老師",
   "when": {
    "inTerm": true
   },
   "lines": [
    [
     null,
     "（門口進來一位系上的老師。全店的法律系學生同時安靜了一秒。）"
    ],
    [
     null,
     "（{發起人}把筷子放下，坐直了一點。老師點了一碗麵，外帶。）"
    ]
   ]
  }
 ],
 "arrive": {
  "dian": "（滇香小館。門一開，辣椒的味道先出來。）",
  "self": "（好家自助餐。隊伍排到門口，前進得很快。）",
  "home": "（巷口家常菜。排骨下鍋的聲音從裡面傳出來。）",
  "pasta": "（Pasta 118。位子不多，你們擠進靠牆那一桌。）",
  "korea": "（韓食小廚。小菜已經擺好了。）",
  "omu": "（蛋包飯研究所。老闆照例問蛋要全熟還是半熟。）",
  "noodle2": "（六張犁麵舖。大鍋的蒸氣把玻璃都弄霧了。）",
  "cafe2": "（慢讀咖啡。中午的人都在外帶，窗邊還有一桌。）"
 },
 "leave": [
  "（結帳，各付各的。走回學校的路上，巷子還在排隊。）",
  "（吃完，走回學校。離下午的課還有一點時間。）"
 ],
 "skipLine": "（和{同行}去{店名}吃了{品名}，{金額} 元。）",
 "noMoney": {
  "narr": "（你摸了一下口袋。錢不夠吃這一餐。）",
  "player": "「我今天錢不夠，下次。」",
  "reply": "沒關係，下次。"
 }
};
if(typeof module!=='undefined') module.exports=L118_LUNCH_DATA;
