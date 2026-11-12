/* 自動產生：tools/story/import_luwei_stall.py（docs/story_planning/AA_841_luwei_stall.json@1f5d6efed）。不要手改，改企劃稿再重新匯入。
   公館宵夜滷味攤的點餐（EAT-EFFECT-1020，使用者 X67）：夾法、價錢、台詞一字照 AA_841；sign、open、typhoonOff、half（幾點到幾點、半價）、spice.regular／reply 是從稿上的字讀出來的。
   怎麼演：src/luwei3d.js */
'use strict';
const LUWEI_STALL={
 "src": "docs/story_planning/AA_841_luwei_stall.json@1f5d6efed",
 "sign": "滷味",
 "who": "老闆",
 "hours": "每天 18:00～24:00；颱風天不出攤。這個時間蓋得到現有的 20:30 考完宵夜和週五 22～24。",
 "open": {
  "from": 18.0,
  "to": 24.0
 },
 "typhoonOff": true,
 "menu": [
  {
   "name": "夾一小籃",
   "price": 60,
   "half": 30
  },
  {
   "name": "夾一般的量",
   "price": 90,
   "half": 45
  },
  {
   "name": "夾滿一籃",
   "price": 120,
   "half": 60
  },
  {
   "name": "只要王子麵加青菜",
   "price": 45,
   "half": 25
  }
 ],
 "half": {
  "from": 22.0,
  "to": 24.0,
  "line": "十點以後半價，剩的不多了。",
  "when": "22:00～24:00 全部半價（四捨五入到 5 元：30／45／60／25）",
  "why": "AA_120 阿哲、AA_207 子晴都說過「公館那家滷味十點後半價」，玩家聽了去買要真的半價。這句接在 greet 後面。"
 },
 "spice": {
  "ask": "要辣嗎？",
  "options": [
   "不要辣",
   "小辣",
   "中辣"
  ],
  "regular": {
   "不要辣": "一樣不要辣？",
   "小辣": "一樣小辣？",
   "中辣": "一樣中辣？"
  },
  "reply": "好。一樣。",
  "note": "記住上一次選的。熟客句照選的換：不要辣＝現有的「一樣不要辣？」；小辣＝「一樣小辣？」；中辣＝「一樣中辣？」。回話都是現有的「好。一樣。」"
 },
 "lines": {
  "greet": "自己夾，夾好給我。",
  "take": "（你把籃子遞過去。老闆看一眼就報了價錢。）",
  "wait": "好了叫你。",
  "done": "同學，你的。小心燙。",
  "no_money": "（你數了一下口袋裡的錢，把籃子放回去。）",
  "not_open": "（攤子還沒推出來。六點以後才有。）",
  "closed": "（鍋子蓋起來了，老闆在收籃子。）",
  "typhoon": "（平常擺攤的位置是空的。）"
 },
 "after": "吃完的旁白用現有那句（eat_lines.js「宵夜（公館滷味攤）」），不加新的。",
 "rules": [
  "站著等、拿了在攤子旁邊吃或邊走邊吃，沒有座位。",
  "吃的效果照 EAT-EFFECT-1020 其他宵夜同一套，AA 不另外定數字。",
  "和人一起來（outingFirst、邀約）照現有的走，只是多了可以選份量和辣度。"
 ],
 "status": "定稿（BB_388 聽過：選項改成夾多少、十點後半價）"
};
