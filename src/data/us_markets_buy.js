/* 自動產生：tools/story/import_us_markets.py（docs/story_planning/AA_850_us_markets_buy.json@f6aa917593）。不要手改，改企劃 AA_850 再重新匯入。
   美國兩間超市買東西（US-MARKETS-BUY-1112；演出 src/us_markets3d.js）：goods＝貨架上的東西（n 品名、usd 標價、p 實際扣的錢＝usd × rate 四捨五入、
   kind eat 帶回去吃掉／own 進「物品」／gift 可以送人、at 哪一個互動點、show＝畫面上用的短名（稿 lawww_1112.b 指名的那幾樣才有））；lines＝店員的話和旁白
   （竹葉 no_money_other＝推車裡沒有水餃的時候錢不夠的那一句，稿 lawww_1112.c）。字一字照稿。*/
'use strict';
const US_MARKETS_BUY={
 "src": "docs/story_planning/AA_850_us_markets_buy.json@f6aa917593",
 "rate": 32,
 "shops": {
  "us_market": {
   "name": "草原超市",
   "goods": [
    {
     "id": "usm_apple",
     "n": "蘋果（一袋）",
     "usd": 4.99,
     "p": 160,
     "kind": "eat",
     "at": "produce"
    },
    {
     "id": "usm_banana",
     "n": "香蕉（一串）",
     "usd": 1.49,
     "p": 48,
     "kind": "eat",
     "at": "produce"
    },
    {
     "id": "usm_milk",
     "n": "牛奶（一加侖）",
     "usd": 3.79,
     "p": 121,
     "kind": "eat",
     "at": "dairy"
    },
    {
     "id": "usm_eggs",
     "n": "蛋（十八顆）",
     "usd": 4.29,
     "p": 137,
     "kind": "eat",
     "at": "dairy"
    },
    {
     "id": "usm_chicken",
     "n": "烤雞（半隻）",
     "usd": 5.99,
     "p": 192,
     "kind": "eat",
     "at": "deli"
    },
    {
     "id": "usm_turkey",
     "n": "火雞胸（一小塊，十一月才有）",
     "usd": 6.49,
     "p": 208,
     "kind": "eat",
     "at": "deli",
     "show": "火雞胸"
    },
    {
     "id": "usm_pizza",
     "n": "冷凍披薩",
     "usd": 6.99,
     "p": 224,
     "kind": "eat",
     "at": "frozen"
    },
    {
     "id": "usm_icecream",
     "n": "冰淇淋（一桶）",
     "usd": 5.49,
     "p": 176,
     "kind": "eat",
     "at": "frozen"
    },
    {
     "id": "usm_cereal",
     "n": "早餐穀片（家庭號）",
     "usd": 4.59,
     "p": 147,
     "kind": "eat",
     "at": "aisle_cereal"
    },
    {
     "id": "usm_chips",
     "n": "洋芋片（大包）",
     "usd": 3.99,
     "p": 128,
     "kind": "eat",
     "at": "aisle_snacks"
    },
    {
     "id": "usm_pasta",
     "n": "義大利麵＋紅醬",
     "usd": 4.48,
     "p": 143,
     "kind": "eat",
     "at": "aisle_pasta"
    },
    {
     "id": "usm_toast",
     "n": "吐司",
     "usd": 2.99,
     "p": 96,
     "kind": "eat",
     "at": "aisle_pasta"
    },
    {
     "id": "usm_tp",
     "n": "衛生紙（二十四捲）",
     "usd": 18.99,
     "p": 608,
     "kind": "own",
     "at": "aisle_household"
    },
    {
     "id": "usm_postcard",
     "n": "明信片和郵票（寄回臺灣）",
     "usd": 2.65,
     "p": 85,
     "kind": "own",
     "at": "service"
    }
   ],
   "lines": {
    "deli_number": "（你抽了號碼牌。前面還有三個人。）",
    "deli_staff": "Half or whole?（半隻還是一隻？）",
    "checkout_greet": "嗨，今天過得怎麼樣？找到你要的東西了嗎？",
    "checkout_bag": "要袋子嗎？一個十分錢。",
    "checkout_done": "祝你有美好的一天。",
    "self_checkout": "（機器：「請將商品放入袋中。」你放了。機器：「請將商品放入袋中。」）",
    "self_checkout_help": "（紅燈亮了。店員走過來，刷了一下她的卡，什麼都沒說就走了。）",
    "no_money": "（卡刷不過。你把最貴的那一樣拿給收銀員，請她先拿掉。）",
    "cart_empty": "（推車是空的。）",
    "tp_roommate": "（衛生紙二十四捲。冰箱門上的輪值表，這個月輪到你買。）"
   }
  },
  "us_asian_market": {
   "name": "竹葉亞洲超市",
   "goods": [
    {
     "id": "usa_noodle5",
     "n": "臺灣的泡麵（五包）",
     "usd": 6.99,
     "p": 224,
     "kind": "eat",
     "at": "asia_noodles"
    },
    {
     "id": "usa_soy",
     "n": "醬油",
     "usd": 4.49,
     "p": 144,
     "kind": "own",
     "at": "asia_sauce"
    },
    {
     "id": "usa_satay",
     "n": "沙茶醬（最後一罐）",
     "usd": 5.99,
     "p": 192,
     "kind": "own",
     "at": "asia_sauce",
     "show": "沙茶醬"
    },
    {
     "id": "usa_mantou",
     "n": "小饅頭餅乾",
     "usd": 2.49,
     "p": 80,
     "kind": "eat",
     "at": "asia_snacks"
    },
    {
     "id": "usa_pineapple",
     "n": "鳳梨酥（一盒）",
     "usd": 8.99,
     "p": 288,
     "kind": "gift",
     "at": "asia_snacks"
    },
    {
     "id": "usa_oolong",
     "n": "臺灣烏龍茶",
     "usd": 9.99,
     "p": 320,
     "kind": "gift",
     "at": "asia_dry"
    },
    {
     "id": "usa_shiitake",
     "n": "乾香菇",
     "usd": 7.49,
     "p": 240,
     "kind": "own",
     "at": "asia_dry"
    },
    {
     "id": "usa_rice",
     "n": "米（五磅的小袋）",
     "usd": 8.99,
     "p": 288,
     "kind": "own",
     "at": "asia_rice"
    },
    {
     "id": "usa_bokchoy",
     "n": "青江菜",
     "usd": 2.29,
     "p": 73,
     "kind": "eat",
     "at": "asia_produce"
    },
    {
     "id": "usa_tofu",
     "n": "豆腐",
     "usd": 1.99,
     "p": 64,
     "kind": "eat",
     "at": "asia_produce"
    },
    {
     "id": "usa_dumpling",
     "n": "水餃（五十顆）",
     "usd": 9.99,
     "p": 320,
     "kind": "eat",
     "at": "asia_frozen"
    },
    {
     "id": "usa_milktea",
     "n": "鋁箔包奶茶",
     "usd": 1.29,
     "p": 41,
     "kind": "eat",
     "at": "asia_drinks"
    },
    {
     "id": "usa_wintermelon",
     "n": "冬瓜茶",
     "usd": 1.29,
     "p": 41,
     "kind": "eat",
     "at": "asia_drinks"
    },
    {
     "id": "usa_mooncake",
     "n": "月餅（一顆，九月中到中秋）",
     "usd": 5.0,
     "p": 160,
     "kind": "gift",
     "at": "asia_checkout",
     "show": "月餅"
    }
   ],
   "lines": {
    "greet": "（櫃台後面的阿姨抬頭看了你一眼。）臺灣來的？",
    "greet_regular": "又來了。水餃今天有進貨。",
    "checkout_done": "袋子要不要？不用錢。",
    "satay_last": "（你拿了最後一罐沙茶醬。架子上那一格空了。）",
    "satay_gone": "（沙茶醬那一格還是空的。標籤旁邊多了一張紙條：下週到。）",
    "mooncake": "（櫃台上放著一盤月餅，一顆一顆用小紙盒裝。阿姨：「一顆五塊。再不買就沒了。」）",
    "no_money": "（阿姨看了看你手上的錢。）先拿水餃，其他下次。",
    "closed_sunday": "（門上的手寫告示：週日公休。）",
    "mooncake_give": "我也買了一顆。……現在有兩顆。",
    "no_money_other": "（阿姨看了看你手上的錢。）先拿便宜的，其他下次。"
   }
  }
 }
};
if(typeof module!=='undefined') module.exports=US_MARKETS_BUY;
