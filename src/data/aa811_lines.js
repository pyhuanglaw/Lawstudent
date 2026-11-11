/* 自動產生：tools/story/import_aa811.py（docs/story_planning/AA_811_movie_talk_hehuan_voice.json@fb1256280）。不要手改，改企劃 AA_811 再重新匯入。
   學姊合歡山北峰那一趟（hehuan）、子晴之後的十則語音（zq_voice）：src/aa811_3d.js 讀；逐句對稿 tests/aa811_hehuan_voice_1111_unit.js */
'use strict';
const AA811_LINES={
 "src": "docs/story_planning/AA_811_movie_talk_hehuan_voice.json@fb1256280",
 "hehuan": {
  "id": "ev_sis_hehuan",
  "title": "合歡山北峰",
  "who": "heroine_05",
  "accept": "好。四點的客運。",
  "dialogue": [
   {
    "speaker": null,
    "text": "（凌晨四點，往埔里的第一班客運。她一上車就睡著了，計畫本夾在手裡。）"
   },
   {
    "speaker": null,
    "text": "（埔里轉接駁車。九點，你們在小風口下車。山上只有十二度。）"
   },
   {
    "speaker": "heroine_05",
    "text": "從這裡上去，兩公里。"
   },
   {
    "speaker": "heroine_05",
    "text": "走慢一點沒關係。我不趕。"
   },
   {
    "speaker": null,
    "text": "（半路休息。她從背包拿出兩個飯糰、一瓶熱水，還有一包你沒看過的巧克力。）"
   },
   {
    "speaker": "heroine_05",
    "text": "你背包裡是什麼？"
   },
   {
    "choice": [
     {
      "t": "「泡麵。」",
      "say": [
       {
        "speaker": "heroine_05",
        "text": "我說不要帶。"
       },
       {
        "speaker": null,
        "text": "（她倒了半瓶熱水進去，蓋上蓋子，等了三分鐘。）"
       },
       {
        "speaker": "heroine_05",
        "text": "……分我一半。"
       }
      ],
      "fx": {
       "love": 2
      }
     },
     {
      "t": "「水，還有一件外套。」",
      "say": [
       {
        "speaker": "heroine_05",
        "text": "外套借我。我的太薄了。"
       }
      ],
      "fx": {
       "love": 1,
       "friend": 1
      }
     },
     {
      "t": "「沒什麼。」",
      "say": [
       {
        "speaker": "heroine_05",
        "text": "那你背那麼大一個包。"
       }
      ],
      "fx": {
       "friend": 1
      }
     }
    ]
   },
   {
    "speaker": null,
    "text": "（十一點，北峰頂。三角點旁邊有人在排隊拍照。往下看，雲在你們下面。）"
   },
   {
    "speaker": "heroine_05",
    "text": "寫論文的時候，我每天都想到這裡。"
   },
   {
    "speaker": "heroine_05",
    "text": "不是想爬上來。是想站在這裡的時候，後面已經沒有東西在等我寫。"
   },
   {
    "if": "dating",
    "line": {
     "speaker": "heroine_05",
     "text": "你站過來一點。"
    }
   },
   {
    "if": "dating",
    "line": {
     "speaker": null,
     "text": "（她把手機舉高，拍了你們兩個，後面是一整片雲。）"
    }
   },
   {
    "if": "friend",
    "line": {
     "speaker": "heroine_05",
     "text": "幫我拍一張。後面要有雲。"
    }
   },
   {
    "if": "friend",
    "line": {
     "speaker": null,
     "text": "（你拍了三張。她挑了第二張。）"
    }
   },
   {
    "choice": [
     {
      "t": "「下一座要去哪？」",
      "say": [
       {
        "speaker": "heroine_05",
        "text": "不排了。"
       },
       {
        "speaker": "heroine_05",
        "text": "我想先練習一陣子，什麼都不排。"
       }
      ],
      "fx": {
       "friend": 1
      }
     },
     {
      "t": "「恭喜妳寫完。」",
      "say": [
       {
        "speaker": "heroine_05",
        "text": "嗯。口試也過了。"
       },
       {
        "speaker": "heroine_05",
        "text": "剩下的只有印。印完那天，我會請你吃飯。"
       }
      ],
      "fx": {
       "friend": 2
      }
     },
     {
      "t": "（不說話，跟她一起看雲）",
      "say": [
       {
        "speaker": "heroine_05",
        "text": "嗯。這樣就好。"
       }
      ],
      "fx": {
       "love": 2
      }
     }
    ]
   },
   {
    "speaker": null,
    "text": "（下山的時候起霧了。回到臺北，已經晚上十點。）"
   },
   {
    "if": "dating",
    "line": {
     "speaker": null,
     "text": "（回程的客運上，她又睡著了。這次是靠在你肩膀上。）"
    }
   },
   {
    "if": "dating",
    "line": {
     "speaker": "heroine_05",
     "text": "下次換我查車。"
    }
   },
   {
    "if": "friend",
    "line": {
     "speaker": null,
     "text": "（回程的客運上，她靠著窗睡著了。計畫本還是夾在手裡。）"
    }
   },
   {
    "if": "friend",
    "line": {
     "speaker": "heroine_05",
     "text": "謝謝你來。今天的照片，我會印一張夾在論文那一疊旁邊。"
    }
   },
   {
    "set": {
     "SIS_HEHUAN_WENT": true
    }
   }
  ]
 },
 "zq_voice": {
  "who": "heroine_04",
  "flag": "ZQ_VOICE_MEMO",
  "msgs": [
   "🎤 第五天。音效砍掉了。現在遊戲安靜得像圖書館，我有點喜歡",
   "🎤 第八天。測試的人說主角走路像在溜冰。他說得對",
   "🎤 第十一天。我在公司睡著，醒來身上多一件外套。不知道是誰的，我先穿著",
   "🎤 第十四天。老闆說延一週。我說好。我其實早就知道來不及",
   "🎤 第十九天。今天修了四十二個 bug，生出三個新的。算有在前進",
   "🎤 第二十三天。音效加回來一個。開門的聲音。只有那個我捨不得",
   "🎤 第二十七天。明天送審。我現在什麼都不想看，只想看天花板",
   "🎤 第三十天。審過了。下禮拜四上架",
   "🎤 第三十四天。上架了。第一則評論說「很好玩，但是太安靜」。我笑了很久",
   "🎤 不數了。之後我傳語音，就是普通的語音"
  ],
  "reply9": {
   "opts": [
    {
     "t": "（回語音）「恭喜。開門那個聲音我聽到了。」",
     "say": [
      "你下載了",
      "……你是第四十一個"
     ],
     "fx": {
      "love": 1
     }
    },
    {
     "t": "「恭喜！」",
     "say": [
      "嗯。謝謝"
     ],
     "fx": {
      "friend": 1
     }
    }
   ]
  }
 }
};
