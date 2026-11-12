/* 自動產生：tools/story/import_yejian_shaola.py（docs/story_planning/AA_853_yejian_shaola_buy.json@7f7394acc）。不要手改，改企劃 AA_853 再重新匯入。
   公館燒臘點餐（GG-SHAOLA-FIX-1112；演出 src/shaola_order3d.js）：menu／addon＝品名、價錢；soup＝單點的湯（配飯的第一碗不用錢）；eat＝每一樣吃的旁白；staff＝阿姨的話（tab_pay 的 {n}＝這次加上次）。
   頁間書屋買東西（GG-YEJIAN-SHOP-1112；演出 src/yejian_buy3d.js）：points＝每個互動點（kind）的「看」和賣的東西（kind eat 當場吃喝／own 進「物品」／gift 可以送人）；regular＝買過幾次起換熟客的招呼。字一字照稿。*/
'use strict';
const YEJIAN_SHAOLA_BUY={
 "src": "docs/story_planning/AA_853_yejian_shaola_buy.json@7f7394acc",
 "noodle": {
  "name": "公館燒臘",
  "staff": {
   "who": "阿鳳阿姨",
   "greet": "內用外帶？內用自己找位子，好了我叫你。",
   "order_done": "好，等一下。湯自己舀，在那邊。",
   "call": "同學，你的好了。",
   "no_money": "（阿姨看了你一眼。）先吃，下次一起算。",
   "tab_pay": "上次的一起算，總共 {n}。",
   "tab_refuse": "上次那一碗還在帳上。今天喝碗湯就好，湯不用錢。"
  },
  "menu": [
   {
    "n": "叉燒飯",
    "p": 90
   },
   {
    "n": "油雞飯",
    "p": 90
   },
   {
    "n": "燒鴨飯",
    "p": 100
   },
   {
    "n": "雙拼飯",
    "p": 110
   },
   {
    "n": "三寶飯",
    "p": 130
   },
   {
    "n": "例湯",
    "p": 20
   }
  ],
  "addon": [
   {
    "n": "加滷蛋",
    "p": 15
   }
  ],
  "soup": "例湯",
  "menu_look": "（牆上的菜單只有六樣，是手寫的。最下面一行小字：加滷蛋十五。）",
  "window_look": "（櫥窗裡掛著一排叉燒、兩隻油雞、半隻燒鴨。刀在砧板上，還沒擦。）",
  "eat": {
   "叉燒飯": "（叉燒的邊是焦的，醬汁淋在飯上。你先把焦的那幾塊吃掉。）",
   "油雞飯": "（油雞切得很整齊，皮是亮的，薑蓉給了一大匙。）",
   "燒鴨飯": "（鴨皮還是脆的。你把骨頭一根一根排在盤子邊。）",
   "雙拼飯": "（叉燒和油雞各一半。你到最後還是沒決定比較喜歡哪一邊。）",
   "三寶飯": "（三樣疊得滿到看不見飯。你吃到一半才挖到那顆鹹蛋。）",
   "例湯": "（今天的例湯是蘿蔔排骨。蘿蔔煮到透明。）"
  }
 },
 "bookstore": {
  "name": "頁間書屋",
  "staff": {
   "who": "店員",
   "greet": "慢慢看。梯子可以自己推，不要爬到最上面那一格。",
   "greet_regular": "你上次翻的那本還在，沒有人買走。",
   "closed_line": "我們今天要打烊了。",
   "not_open": "（門上掛著「十點開」的木牌。窗邊那排檯燈還沒亮。）"
  },
  "regular": 3,
  "points": [
   {
    "kind": "shelf_browse",
    "label": "書牆",
    "look": "（整面牆都是二手書，照前一個主人的習慣排，不照分類。你要找的那一本通常在梯子才搆得到的地方。）",
    "goods": [
     {
      "n": "二手小說",
      "p": 120,
      "kind": "own",
      "id": "yj_novel",
      "line": "（書口有一點黃。扉頁上有人用鉛筆寫了日期，是十年前。）"
     },
     {
      "n": "二手法律書（舊版）",
      "p": 150,
      "kind": "own",
      "id": "yj_lawbook",
      "line": "（舊版的。畫線的人很認真，前三章每一頁都有，第四章以後乾乾淨淨。）"
     },
     {
      "n": "二手詩集",
      "p": 100,
      "kind": "own",
      "id": "yj_poetry",
      "line": "（很薄。書裡夾著一張公車票根當書籤。）"
     }
    ]
   },
   {
    "kind": "new_books",
    "label": "新書推薦",
    "look": "（斜面書架上放著店員挑的書，每一本下面夾一張手寫的小卡，只寫一句話。）",
    "goods": [
     {
      "n": "店員推薦的新書",
      "p": 320,
      "kind": "gift",
      "id": "yj_newbook",
      "line": "（小卡上寫：「讀完會想打電話給一個人。」）"
     }
    ]
   },
   {
    "kind": "magazines",
    "label": "雜誌",
    "look": "（雜誌是過期的，所以便宜。封面上的年份有新有舊。）",
    "goods": [
     {
      "n": "過期雜誌",
      "p": 50,
      "kind": "own",
      "id": "yj_magazine",
      "line": "（去年冬天的。專題是「一個人吃飯」。）"
     }
    ]
   },
   {
    "kind": "postcards",
    "label": "明信片",
    "look": "（窗上一條麻繩，夾著一排明信片。有幾張背面已經寫了字，是客人留下來的。）",
    "goods": [
     {
      "n": "明信片",
      "p": 30,
      "kind": "gift",
      "id": "yj_postcard",
      "line": "（你挑了一張公館的街景。畫得比實際安靜。）"
     }
    ]
   },
   {
    "kind": "cafe_order",
    "label": "咖啡吧",
    "order": "內用嗎？坐哪裡都可以，好了我端過去。",
    "goods": [
     {
      "n": "美式",
      "p": 90,
      "kind": "eat"
     },
     {
      "n": "拿鐵",
      "p": 120,
      "kind": "eat"
     },
     {
      "n": "當日蛋糕",
      "p": 110,
      "kind": "eat"
     }
    ]
   }
  ],
  "no_money": "（你把書放回去。書牆上那個空位，剛好就是它原本的位置。）"
 }
};
if(typeof module!=='undefined') module.exports=YEJIAN_SHAOLA_BUY;
