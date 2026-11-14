/* 禮貌生財門口沒開時的三句（AA_1024 第 5 節，企劃線 claude/cool-heisenberg-o8kuqx fa3d6ad5f7，AA-B 2026-11-14；BB-B 實測 LIMAO_CLOSE_r1）。
   原本 src/data/shop_hours_aa831.js 的 door 不管哪種沒開都是「今日不看」——沒有營業時間，每天正常收攤也像今天特別休息。
   一字照稿（tests/limao_door_aa1024_unit.js 對稿）；src/shop_hours831_3d.js 的 SH831.LINE_X.tz_limao 讀。LIMAO-DOOR-HOURS-TEXT-1114 */
'use strict';
const LIMAO_DOOR_AA1024={
  src:'docs/story_planning/AA_1024_店門口互動點_店名與營業時間格式.md@fa3d6ad5f7',
  notOpen:'（騎樓下那張桌子還摺著，靠在牆邊。門上貼著一張紙：「每晚七點到十一點半」。）',
  closed:'（騎樓下那張鋪紅布的桌子收起來了。門上那張紙還在：「每晚七點到十一點半」。）',
  off:'（騎樓下那張鋪紅布的桌子收起來了。門上那張紙旁邊多貼了一張：「今日不看」。）' };
