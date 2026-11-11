// 校外約會的源稿（企劃線 claude/story-planning）現在白名單認哪一版——約會的逐字對稿測試只認這一處。
// AA 因為審稿再給新 SHA 時：
//   1. python3 tools/date/bump_lines_sha.py <新 SHA> --by '…' --why '…' --rec zq   （白名單 D01～D33 的 33 筆；AA_773～AA_776 換版就改白名單那幾筆的 sha）
//   2. 改下面的常數
//   3. python3 tools/date/import_date_lines.py；python3 tools/date/import_wish.py
//   4. node tests/zq_dates_1111_unit.js（和 zr／yt／kx／sis／peishan_dates_1111、date_overnight、date_wish、date_lines_* 這幾支）
// 工具（import_date_lines.py）裡的 *_PREV 是各輪「重寫以前的那一版」，不用跟著換。
module.exports={
  ALLOW_SHA:'02078efc0',       // date_system/lines/D01～D33.json：白名單現在的版本（2026-11-11 子晴重寫；同一版帶芷若 D10 一句）
  ZR_PREV:'f9c1a2b80',         // 芷若重寫以前的那一版（＝可昕重寫的那一版）
  ZR_SHA:'a29a8aba0',          // 芷若重寫的那一版（＝子晴重寫以前的那一版；之後只多芷若 D10 一句，見 ALSO_ZQ）
  ZR_COMMON_SHA:'e8a33995c',   // AA_773_zr_date_common.json（芷若不分地點的短句）
  ZR_WISH_SHA:'841c1810e',     // AA_774_zr_wish.json（芷若 D05 心願事件）
  ZQ_PREV:'a29a8aba0',         // 子晴重寫以前的那一版（＝芷若重寫的那一版）
  ZQ_COMMON_SHA:'02078efc0',   // AA_775_zq_date_common.json（子晴不分地點的短句 9 列：date_lines.js 五列、date3d.js 四列）
  ZQ_WISH_SHA:'26e72fd51',     // AA_776_zq_wish.json（子晴 D03 心願事件 30 列）
  ZQ_BASE:'f247bc77f',         // 子晴重寫匯入以前的開發分支（src/data/date_lines.js、date_wish.js、date3d.js 拿來比「別人零差異」；這個不用跟著換）
  /* 2026-11-11 a29a8aba0 那一版除了芷若的格子，另外改的四句（AA 回 LAWWW 的五題；路徑是 Dxx.json 裡的位置、old＝上一版 f9c1a2b80 的字）*/
  ALSO:[
    {loc:'D15',who:'heroine_03',path:'lines/hotspots/D15.rail/normal/2/lines/0/text',old:'期中考在那一片裡面。從這裡看，小小的。',new:'要交的報告都在那一片裡面。從這裡看，小小的。'},
    {loc:'D09',who:'kexin',path:'lines/arrive/normal/0/lines/0/text',old:'這座山我比你熟。走錯路的話是你帶錯，不是我。',new:'這座山我來過。跟著我走，走錯了算我的。'},
    {loc:'D17',who:'kexin',path:'lines/hotspots/D17.queen/remember/lines/0/text',old:'上次拍的那張，女王頭比你上鏡。我還是留著。',new:'上次拍的那張，你眼睛閉著。我還是留著。'},
    {loc:'D33',who:'kexin',path:'lines/hotspots/D33.lobby/remember/lines/0/text',old:'上次那部，我後來查了影評。影評跟我一樣，你輸了。',new:'上次那部，我後來查了影評。影評跟我想的一樣，我安心了。'}],
  /* 2026-11-11 02078efc0 那一版除了子晴的格子，另外改的一句（芷若 D10 小吃攤第一次、選「下次我做給妳。」的回覆；old＝上一版 a29a8aba0 的字）*/
  ALSO_ZQ:[
    {loc:'D10',who:'heroine_02',path:'lines/hotspots/D10.snack/first/choice/1/reply/0/text',old:'真的？我記下來了，我記性很好喔。',new:'你會做什麼？泡麵不算。心意我先收下。'}],
};
