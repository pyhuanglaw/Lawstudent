/* 自動產生：tools/gift/import_gift_holiday.py（docs/story_planning/AA_792_flower_notes.json@4021747069）。不要手改，改企劃 AA_792 再重新匯入。
   花序 Flower Notes（FLOWER-NOTES-1110，USER_WANTS X325；播放 src/flower_notes_sys3d.js）：staff＝花藝師的句子（greet 進買花清單、buy 買了那一樣、closed 打烊以後門口、notOpen 開門以前門口、closeLine 打烊人還在店裡＝AA_700、hours 營業時間、typhoonOff 颱風天休息）、looks＝店裡每一區的「看」（key＝配置的 kind；plinth_center＝配置的 display）、lookButtons＝每一個「看」的按鈕字。
   商品（十樣）在 src/data/gift_holiday.js 的 shops.gg_flower、items。 */
'use strict';
const FLOWER_NOTES_TEXT={
 "src": "docs/story_planning/AA_792_flower_notes.json@4021747069",
 "shop": "gg_flower",
 "staff": {
  "who": "花藝師",
  "greet": [
   "歡迎。要送人的話，跟我說一下是什麼樣的人。",
   "鮮花在左邊，永生花在前面那一櫃。",
   "今天的花剛進，冷藏櫃裡的比較多。"
  ],
  "closed": "（玻璃門裡面的燈關了一半，花桶都收進冷藏櫃。門上掛著「今日已打烊」。）",
  "hours": "10:00～21:00",
  "buy": {
   "g_bouquet": [
    "（花藝師問你要送給什麼樣的人，你講了兩句，她就開始抽花。）",
    "這樣配，她拿著不會太重。"
   ],
   "g_sunflower": [
    "（她從花桶裡挑了一朵最正面的。）",
    "一朵就很好看了。"
   ],
   "g_fn_rose": [
    "（她把玫瑰的刺剪掉，花莖套上一小截水管。）",
    "回去先剪一點再插水。"
   ],
   "g_fn_carnation": [
    "（她多包了一張霧面紙。）"
   ],
   "g_fn_season": [
    "（她從冷藏櫃裡一桶一桶挑，包好的時候比你的肩膀還寬。）",
    "今天的花，三天內最好看。"
   ],
   "g_fn_dried": [
    "（乾燥花不用水。她用麻繩綁好，裝進紙袋。）"
   ],
   "g_fn_preserved_box": [
    "（她把盒子放進提袋，上面放一張小卡。）",
    "永生花不要碰水，放在陰涼的地方就好。"
   ],
   "g_fn_dome": [
    "（她用兩隻手拿下來，先包一層泡泡紙。）",
    "玻璃很重，提的時候從下面托著。"
   ],
   "g_fn_giftbox": [
    "（她在盒子邊上補了兩枝小花，蓋上透明蓋。）",
    "小卡要寫嗎？筆在這裡。"
   ],
   "g_fn_pot": [
    "（她把盆底擦乾淨，放進一個小紙盒。）",
    "兩三天澆一次水，不用多。"
   ]
  },
  "closeLine": "我們今天要打烊了。",
  "notOpen": "（玻璃門還鎖著。裡面有人在換花桶的水，冷藏櫃的燈先亮了。門上的牌子寫十點開。）",
  "typhoonOff": true
 },
 "looks": {
  "preserved_shelf": "（香檳金的層架，一格一格放著永生花，玻璃罩、方盒、圓盒。牌子寫「永生花藝」。）",
  "plinth_dome": "（白色的展示台上，一個玻璃罩，裡面一朵紅玫瑰，罩子擦得看不到指紋。）",
  "plinth_giftbox": "（矮一點的展示台，放著一個打開的花禮盒，花插得滿滿的，蓋子立在旁邊。）",
  "bouquet_stand": "（兩階的花台，一束一束包好的花排著，每束前面一張小卡寫著花名和價錢。）",
  "cold_case": "（整面的冷藏花櫃，玻璃門上有一點霧。裡面一層一層的花桶，玫瑰、桔梗、繡球。）",
  "counter": "（長長的包裝櫃檯，石材的檯面。花藝師在後面剪花莖，剪下來的一截一截掉進桶子裡。）",
  "wrap_shelf": "（櫃檯後面整面牆的包裝紙捲和緞帶，顏色從白排到深綠。）",
  "stair_sign": "（樓梯口的牌子：「二樓 花藝課程」。）",
  "demo_table": "（二樓的示範長桌，桌上一大瓶插好的花，旁邊散著花材和剪刀，像是剛下課。）",
  "blackboard": "（黑板寫著這個月的課：基礎花束、花型設計、季節花藝。名額旁邊畫了幾個圈。）",
  "vase_shelf": "（一排白瓷花器，大小不一樣，最小的只有拳頭大。）",
  "low_cabinet": "（落地窗前的矮櫃，擺著兩瓶花，陽光照進來的時候花的影子落在地上。）",
  "plant_big": "（一盆比人還高的綠色植物，葉子很大，擦得很亮。）",
  "plinth_center": "（店中央的展示台上是這個禮拜的主花，一大瓶，比人的肩膀還高。旁邊的小卡寫著花名，字很小。）"
 },
 "lookButtons": {
  "preserved_shelf": "看永生花",
  "plinth_dome": "看玻璃罩",
  "plinth_giftbox": "看花禮盒",
  "bouquet_stand": "看包好的花束",
  "cold_case": "看冷藏花櫃",
  "counter": "看包裝櫃檯",
  "wrap_shelf": "看包裝紙",
  "stair_sign": "看樓梯口的牌子",
  "demo_table": "看示範長桌",
  "blackboard": "看黑板",
  "vase_shelf": "看花器",
  "low_cabinet": "看窗邊的花",
  "plant_big": "看大盆栽",
  "plinth_center": "看中央展示台"
 }
};
if(typeof module!=='undefined') module.exports=FLOWER_NOTES_TEXT;
