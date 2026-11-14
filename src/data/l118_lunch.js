/* 自動產生：tools/story/import_l118_lunch.py（docs/story_planning/AA_771_l118_lunch.json@bb6c5023b）。不要手改，改企劃稿再重新匯入。
   118 巷課後午餐邀約（L118-LUNCH-INVITE-1111，使用者 X339）的台詞、選項、旁白：一字照 AA 的稿；special 的 when 是工具從 cond（文字條件）拆出來的。
   格式說明在匯入工具的檔頭；怎麼演：src/l118_lunch3d.js */
'use strict';
const L118_LUNCH_DATA={
 "src": "docs/story_planning/AA_771_l118_lunch.json@bb6c5023b",
 "_meta": {
  "by": "AA（帳號 A）",
  "date": "2026-11-11",
  "version": 3,
  "task": "L118-LUNCH-INVITE-1111（USER_WANTS X339）",
  "spec": "開發分支 docs/handoff/user_specs/L118_LUNCH_1111.md（使用者 11-11 原文）",
  "note": "第一版。只列和祐廷同班、上午在法學院同堂的八個人；學姊（高年級）、語彤（社會系、雙主修的課和大一分開）、子晴、芷若、可昕、阿凱不會發起也不同行，只可能在偶遇裡出現。{店名}＝發起人選的那間店的名字；{name}＝玩家的名字；{發起人}＝發起人的名字。對話裡 who 是 player 的是祐廷的句子、null 是旁白、其他字串（「助教」「大四的學長」）是沒有立繪的路人。",
  "rules": [
   "店：九間餐廳都可以當午餐；兩間外帶飲料店（drink_a 喝不喝咖啡、drink_b 果茶社）不當午餐，只在 L-yu-3、S-meet-ziqing 被提到。選到的店那天沒開就照權重換下一間。",
   "週一阿哲手機揪午餐（AA_280 第 4 節）照舊：那天答應了就不再當面邀；沒答應或他沒揪，照常判定。",
   "AA_280 第 3 節的熟客、AA_311 H1～H9 照舊；同一天已經演過那一位的 H 事件，偶遇就不要再抽到同一個人。",
   "柏翰和沛珊大一下交往、大二上分開：大二上那一學期不要把兩個人排進同一桌（其他學期可以）。",
   "好感：八個人都照規格 +2（熟悉度）。和玩家交往中的人（以安、沛珊）也是 +2 熟悉度，不加戀愛的數值——午餐不是約會。偶遇的人 +1；特殊對話（kind: talk）相關的人再 +1。",
   "lunch 的 shop 欄＝這一組只在那幾間店播；沒有 shop 的哪一間都可以。who 有兩三個人的組＝那幾個人都在這一桌時才抽。",
   "special 大約兩成：kind talk＝同桌的人多講一件自己的事；kind meet＝遇到別人。first:true＝第一次不能被快速略過。cond 是給程式看的條件，用文字寫。",
   "n 欄（BB_331 C5）＝含玩家在內的人數要剛好等於這個數才抽（G-zhe-yu-mx n=4、G-yu-ps n=3）。",
   "午餐邀約只在中午十二點前後下課的上午課之後觸發（BB_331 C4；柏翰的鐘點句都假設十二點多）。",
   "declineReply 每人三句，輪著用（連續婉拒不會一直看到同一句）。",
   "options.skip（LAWWW 11-11）：看過一次的普通午餐才出現，放在答應和婉拒中間；選了就不演對話，只出 skipLine。"
  ],
  "open": [
   "宥辰、阿哲、Alison 的 id 我照 characters.js／lane118_shops.js 寫（classmate_youchen、zhe、yu）；阿凱寫 kai——id 不對請直接改。",
   "每個人的句子都是第一版，BB 還沒看；你可以先接系統，字我會再補（每人的午餐對話想加到五六組）。",
   "人物只用 characters.js 和現行設定總表有的設定；沒有新增人物背景。"
  ],
  "for_LAWWW": "已照新九間店改版（v3）。提到店或菜的地方：arrive 九句；有 shop 欄的 L-an-2（omu、pasta）、L-mx-1（cafe2）、L-zhe-1（korea、tea）、L-xc-1（home 以外）；L-yu-3（巷口的手搖飲＝喝不喝咖啡）；偶遇 S-meet-sis（self）、S-meet-yt（dian）、S-meet-kai（korea）、S-meet-ziqing（drink_b）。",
  "v2": "照 BB_331 改：L-zhe-2 不提民總；S-meet-senior 限大一上；「下一堂」四處改掉；G-an-ps 重寫；婉拒回覆每人三句；加 n 欄。id 都沒變。",
  "v3": "照使用者 11-11 的九間店新規格（L118-SHOPS-REDO-1111／X338；AA_280 改版）改：prefs、有 shop 欄的組、arrive 九句（九間都算午餐）、四個偶遇的店。id 都沒變。",
  "v3b": "LAWWW 11-11 三件：補 options.skip；S-meet-ta 的考卷改成案例作業、cond 改第 10 週以後；Alison「我今天排了四件事，這是第二件。」照留（是她在排行程，不是學姊數件數）。特殊對話是加演（meet 在前、talk 在後）、發起人想去的店都沒開就換人、那堂課有課後劇情當天不邀——三個設計都同意。",
  "v4": "11-11 補組（欠 LAWWW 的）：八位邀約人各自的單人午餐對話從三組補到五～六組，新增 19 組：L-an-4～6、L-bohan-4～6、L-ps-4～5、L-mx-4～5、L-xc-4～6、L-yc-4～6、L-zhe-4～5、L-yu-4～5；都沒有 shop、n 的限制（哪一間店都可以播）。舊的 31 組 id 和內容沒動。芯慈 L-xc-6 用到她「吃飯習慣前一天約」的設定（who.classmate_xinci.note）。 BB 11-11 看過：L-bohan-6 不靠課表（原本「下午那堂停課」）、L-an-5 不講次數（原本「你每次都忘／三次」第一次一起吃就出會錯）、L-bohan-4 不講第幾個禮拜；其他 16 組照原樣。"
 },
 "window": {
  "from": 11.5,
  "to": 12.5
 },
 "who": {
  "heroine_01": {
   "name": "以安",
   "weight": 1.0,
   "prefs": {
    "omu": 3,
    "pasta": 2,
    "cafe2": 1
   },
   "note": "奈良咖哩只吃得下半份（AA_280 熟客）；大學食堂可以夾少一點。"
  },
  "classmate_bohan": {
   "name": "柏翰",
   "weight": 1.0,
   "prefs": {
    "cafe2": 4,
    "self": 2,
    "home": 1
   },
   "note": "吃很快，十二點四十要回總圖。"
  },
  "classmate_peishan": {
   "name": "沛珊",
   "weight": 1.0,
   "prefs": {
    "omu": 3,
    "pasta": 3,
    "noodle2": 2,
    "dian": 1
   },
   "note": "不看價錢、愛鬧；不評別人吃的東西。消失期不出現（照 presence）。"
  },
  "classmate_mingxuan": {
   "name": "明軒",
   "weight": 1.0,
   "prefs": {
    "cafe2": 3,
    "home": 3,
    "self": 1
   },
   "note": "一百上下；跟阿哲一起打球。"
  },
  "classmate_xinci": {
   "name": "芯慈",
   "weight": 0.7,
   "prefs": {
    "home": 3,
    "pasta": 2,
    "tea": 2
   },
   "note": "她的習慣是吃飯提前一天約，所以當面邀的機率低一點，邀的話會先說不好意思臨時問。"
  },
  "classmate_youchen": {
   "name": "宥辰",
   "weight": 0.4,
   "prefs": {
    "korea": 3,
    "dian": 2,
    "noodle2": 1
   },
   "note": "考前才出現；有來上課的日子才可能邀（照出席判定）。"
  },
  "zhe": {
   "name": "阿哲",
   "weight": 1.2,
   "prefs": {
    "korea": 3,
    "dian": 3,
    "tea": 2,
    "home": 2
   },
   "note": "本來就是揪人的那個。週一手機揪午餐照舊（AA_280 第 4 節）；那天有約就不另外當面邀。"
  },
  "yu": {
   "name": "Alison",
   "weight": 1.1,
   "prefs": {
    "tea": 4,
    "omu": 2,
    "pasta": 2,
    "noodle2": 1
   },
   "note": "怕一個人吃。"
  }
 },
 "options": {
  "accept": "「好，走。」",
  "decline": "「今天不行，下次。」",
  "skip": "「好，走。」（直接到吃完）"
 },
 "invite": {
  "heroine_01": {
   "lines": [
    "中午有約嗎？沒有的話去{店名}，我想早點吃完。",
    "我要去{店名}。你要一起嗎？",
    "剛剛那一題我還沒想完。邊吃邊講，{店名}。",
    "你早餐有吃嗎？看起來沒有。走，{店名}。"
   ],
   "declineReply": [
    "好。那筆記我吃完再傳給你。",
    "好，那你記得吃。",
    "沒關係。我本來也只是順路問。"
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
    "好。那我先走。",
    "好。",
    "知道了。下次。"
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
    "好啦，下次。我自己去當吧檯的客人。",
    "好，我記下來了，你欠我一餐的陪吃。",
    "沒關係啦。我去問別人，問不到再回來煩你。"
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
    "好，下次。",
    "好啊，沒差，改天。",
    "那我自己去，吃快一點。"
   ]
  },
  "classmate_xinci": {
   "lines": [
    "{name}，中午有空嗎？我昨天就想問了，沒問到。{店名}可以嗎？",
    "我想吃{店名}，一個人去有點怪。你要一起嗎？",
    "不好意思，臨時問你。要不要去{店名}？"
   ],
   "declineReply": [
    "沒關係。那我下次早一點問。",
    "好，沒關係。",
    "那改天。我再問你。"
   ]
  },
  "classmate_youchen": {
   "lines": [
    "我難得來上課，慶祝一下。{店名}，走。",
    "我還沒吃早餐。現在算午餐了對吧？{店名}。",
    "{店名}。我昨天弄到三點，現在需要熱的。"
   ],
   "declineReply": [
    "好。那筆記借我拍一下總可以吧。",
    "好，我自己去補眠——補飯。",
    "下次。如果我有來的話。"
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
    "好喔，下次。",
    "好啦，那我去揪別人。",
    "沒事，下次你揪。"
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
    "好吧，下次！",
    "好啦——那我去找別人，你不要後悔喔。",
    "沒關係，我邊吃邊傳訊息吵你。"
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
     "下禮拜要討論的判決，你看了嗎？"
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
   "id": "L-an-4",
   "who": [
    "heroine_01"
   ],
   "lines": [
    [
     "heroine_01",
     "你要點的那個會辣。我看過別人吃到流眼淚。"
    ],
    [
     "player",
     "妳怎麼不早說。"
    ],
    [
     "heroine_01",
     "你還沒點。我現在說。"
    ]
   ]
  },
  {
   "id": "L-an-5",
   "who": [
    "heroine_01"
   ],
   "lines": [
    [
     "heroine_01",
     "筷子給你。湯匙我也拿了。"
    ],
    [
     "player",
     "妳怎麼知道我會忘？"
    ],
    [
     "heroine_01",
     "你剛剛直接坐下來了。"
    ]
   ]
  },
  {
   "id": "L-an-6",
   "who": [
    "heroine_01"
   ],
   "lines": [
    [
     "heroine_01",
     "我今天不太想講話。你講，我聽。"
    ],
    [
     "player",
     "那我要講什麼？"
    ],
    [
     "heroine_01",
     "什麼都可以。不要講判決。"
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
   "id": "L-bohan-4",
   "who": [
    "classmate_bohan"
   ],
   "lines": [
    [
     "classmate_bohan",
     "我每天吃一樣的。不用想。"
    ],
    [
     "player",
     "不會膩嗎？"
    ],
    [
     "classmate_bohan",
     "膩了再換。目前還沒膩。"
    ]
   ]
  },
  {
   "id": "L-bohan-5",
   "who": [
    "classmate_bohan"
   ],
   "lines": [
    [
     "classmate_bohan",
     "你要湯嗎？我去盛，順便。"
    ],
    [
     "player",
     "你不是趕時間？"
    ],
    [
     "classmate_bohan",
     "盛湯三十秒。我算過。"
    ]
   ]
  },
  {
   "id": "L-bohan-6",
   "who": [
    "classmate_bohan"
   ],
   "lines": [
    [
     "classmate_bohan",
     "今天不趕。"
    ],
    [
     "player",
     "你生病了？"
    ],
    [
     "classmate_bohan",
     "該做的昨天做完了。可以多坐十分鐘。"
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
   "id": "L-ps-4",
   "who": [
    "classmate_peishan"
   ],
   "lines": [
    [
     "classmate_peishan",
     "你猜我今天帶了幾枝筆。"
    ],
    [
     "player",
     "三枝？"
    ],
    [
     "classmate_peishan",
     "零。等一下借我，我會還，大概。"
    ]
   ]
  },
  {
   "id": "L-ps-5",
   "who": [
    "classmate_peishan"
   ],
   "lines": [
    [
     "classmate_peishan",
     "我剛剛幫你占位子，跟旁邊的人說你是我保鑣。"
    ],
    [
     "player",
     "他信了嗎？"
    ],
    [
     "classmate_peishan",
     "他看了你一眼，跟我說辛苦了。"
    ]
   ]
  },
  {
   "id": "L-mx-1",
   "who": [
    "classmate_mingxuan"
   ],
   "shop": [
    "cafe2"
   ],
   "lines": [
    [
     "classmate_mingxuan",
     "秤出來九十八。"
    ],
    [
     "player",
     "你是用眼睛量的嗎？"
    ],
    [
     "classmate_mingxuan",
     "練過。"
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
   "id": "L-mx-4",
   "who": [
    "classmate_mingxuan"
   ],
   "lines": [
    [
     "classmate_mingxuan",
     "我帶了水壺。飲料錢省下來，一個月可以多吃四餐。"
    ],
    [
     "player",
     "你算過？"
    ],
    [
     "classmate_mingxuan",
     "大概。沒有很準。"
    ]
   ]
  },
  {
   "id": "L-mx-5",
   "who": [
    "classmate_mingxuan"
   ],
   "lines": [
    [
     "classmate_mingxuan",
     "昨天打球扭到，走路有點怪。不是在耍帥。"
    ],
    [
     "player",
     "要不要去看醫生？"
    ],
    [
     "classmate_mingxuan",
     "先冰敷。三天沒好再說。"
    ]
   ]
  },
  {
   "id": "L-xc-1",
   "who": [
    "classmate_xinci"
   ],
   "shop": [
    "dian",
    "self",
    "tea",
    "cafe2",
    "pasta",
    "korea",
    "omu",
    "noodle2"
   ],
   "lines": [
    [
     "classmate_xinci",
     "這間我第一次來。平常我都吃水餃。"
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
     "沒事。吃完我傳給你。"
    ]
   ]
  },
  {
   "id": "L-xc-4",
   "who": [
    "classmate_xinci"
   ],
   "lines": [
    [
     "classmate_xinci",
     "不好意思，我吃飯比較慢。你吃完可以先走。"
    ],
    [
     "player",
     "我等妳。"
    ],
    [
     "classmate_xinci",
     "那我吃快一點。不對，我一緊張會更慢。"
    ]
   ]
  },
  {
   "id": "L-xc-5",
   "who": [
    "classmate_xinci"
   ],
   "lines": [
    [
     "classmate_xinci",
     "我有帶面紙，要嗎？桌上那盒是空的。"
    ],
    [
     "player",
     "妳怎麼知道？"
    ],
    [
     "classmate_xinci",
     "我每次坐下來都會先看。"
    ]
   ]
  },
  {
   "id": "L-xc-6",
   "who": [
    "classmate_xinci"
   ],
   "lines": [
    [
     "classmate_xinci",
     "下次如果要一起吃，可以前一天跟我說嗎？我會比較安心。"
    ],
    [
     "player",
     "今天不是妳臨時問我的嗎？"
    ],
    [
     "classmate_xinci",
     "對。所以我現在有點慌。"
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
   "id": "L-yc-4",
   "who": [
    "classmate_youchen"
   ],
   "lines": [
    [
     "classmate_youchen",
     "我昨天四點睡。現在是靠意志力在吃飯。"
    ],
    [
     "player",
     "那你還來上課？"
    ],
    [
     "classmate_youchen",
     "要點名。公告我有在看。"
    ]
   ]
  },
  {
   "id": "L-yc-5",
   "who": [
    "classmate_youchen"
   ],
   "lines": [
    [
     "classmate_youchen",
     "你吃飯都配什麼歌？"
    ],
    [
     "player",
     "我沒有在聽歌。"
    ],
    [
     "classmate_youchen",
     "難怪。你吃飯沒有拍子。"
    ]
   ]
  },
  {
   "id": "L-yc-6",
   "who": [
    "classmate_youchen"
   ],
   "lines": [
    [
     "classmate_youchen",
     "這間的冷氣聲是降 B。"
    ],
    [
     "player",
     "你聽得出來？"
    ],
    [
     "classmate_youchen",
     "聽不出來的話，我晚上那份工作早就沒了。"
    ]
   ]
  },
  {
   "id": "L-zhe-1",
   "who": [
    "zhe"
   ],
   "shop": [
    "korea",
    "tea"
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
     "欸，那個報告你們組寫到哪？"
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
   "id": "L-zhe-4",
   "who": [
    "zhe"
   ],
   "lines": [
    [
     "zhe",
     "我剛剛揪了六個，只有你來。"
    ],
    [
     "player",
     "其他人呢？"
    ],
    [
     "zhe",
     "都說下次。沒關係，你一個抵六個。"
    ]
   ]
  },
  {
   "id": "L-zhe-5",
   "who": [
    "zhe"
   ],
   "lines": [
    [
     "zhe",
     "老闆記得我。剛剛沒講，他就多給一匙。"
    ],
    [
     "player",
     "因為你每天來吧。"
    ],
    [
     "zhe",
     "因為我每次都把盤子收好。這是策略。"
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
     "吃完要不要去買飲料？巷口那間手搖的。"
    ],
    [
     "player",
     "妳下午不是還有事？"
    ],
    [
     "yu",
     "買了用跑的。"
    ]
   ]
  },
  {
   "id": "L-yu-4",
   "who": [
    "yu"
   ],
   "lines": [
    [
     "yu",
     "謝謝你跟我吃。我一個人吃會一直滑手機，然後忘記吞。"
    ],
    [
     "player",
     "忘記吞？"
    ],
    [
     "yu",
     "就是嘴巴含著飯在看影片。很恐怖。"
    ]
   ]
  },
  {
   "id": "L-yu-5",
   "who": [
    "yu"
   ],
   "lines": [
    [
     "yu",
     "我跟你說一個秘密，我其實不知道這間什麼好吃。"
    ],
    [
     "player",
     "妳不是常來？"
    ],
    [
     "yu",
     "我常來，可是都點一樣的。"
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
     "我坐中間。你們兩個等一下講法律的時候，我可以當調解委員。"
    ],
    [
     "heroine_01",
     "我們沒有要吵。"
    ],
    [
     "classmate_peishan",
     "還沒。{name}，你先講一句錯的。"
    ],
    [
     "player",
     "……我吃我的。"
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
   "n": 3,
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
   "n": 4,
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
    "self"
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
     "（水上便當門口，學姊提著一個便當走出來。）"
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
     "（靠牆那桌，語彤一個人，面前一份雞排，鐵板上的黑胡椒醬她又加了辣。）"
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
    "korea"
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
     "（阿凱一個人在角落吃炸醬刀削麵，看到你們，舉了一下筷子。）"
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
   "cond": "認識子晴；她在臺北；走出巷子時經過果茶社（drink_b；任何一間店吃完都可以播）",
   "when": {
    "knows": [
     "heroine_04"
    ],
    "reachable": [
     "heroine_04"
    ],
    "at": "leave",
    "shopOpen": [
     "drink_b"
    ]
   },
   "lines": [
    [
     null,
     "（果茶社的外帶窗口，子晴在等她的飲料。）"
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
   "cond": "大一上（有民總的那一學期）；學期中",
   "when": {
    "terms": [
     "Y1S1"
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
   "cond": "學期中，第 10 週以後（第 9 週當堂寫的案例作業收回去改；法律系沒有期中考）",
   "when": {
    "inTerm": true,
    "weekFrom": 10
   },
   "lines": [
    [
     null,
     "（隔壁桌是系上的助教，面前攤著一疊案例作業，一邊吃一邊改。）"
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
  "dian": "（118牛排。鐵板的聲音從門口就聽得到。）",
  "self": "（水上便當。黃色的大招牌下面，隊伍排到門口。）",
  "tea": "（辛亥韓食。四人桌排得很密，你們側身擠進去。）",
  "home": "（五湖四海。門口那一鍋水滾著，水餃一盤一盤下。）",
  "cafe2": "（大學食堂。配菜台前面，每個人都端著餐盤在想。）",
  "pasta": "（義大麵屋。位子不多，你們坐進靠牆那一桌。）",
  "korea": "（清州刀削麵。門口的師傅在削麵，一片一片飛進鍋裡。）",
  "omu": "（奈良咖哩。一進門就是咖哩的味道。）",
  "noodle2": "（迪倫窯烤披薩。小小的窯爐前面，你們併了兩張雙人桌。）"
 },
 "leave": [
  "（結帳，各付各的。走回學校的路上，巷子還在排隊。）",
  "（吃完，走回學校。巷口的紅綠燈還是很久。）"
 ],
 "skipLine": "（和{同行}去{店名}吃了{品名}，{金額} 元。）",
 "noMoney": {
  "narr": "（你摸了一下口袋。錢不夠吃這一餐。）",
  "player": "「我今天錢不夠，下次。」",
  "reply": "沒關係，下次。"
 },
 "shopRules": {
  "noLunch": [
   "drink_a",
   "drink_b"
  ],
  "onlyFor": {}
 }
};
if(typeof module!=='undefined') module.exports=L118_LUNCH_DATA;
