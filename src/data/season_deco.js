/* 季節、節日的布置：代號 → 什麼時候顯示（LIFE-DETAILS-SEASONAL-1110，X317；使用者 2026-11-10「季節性的攤販、店門口的小變化、節日的布置 很棒」→ 20 項全做、含萬聖節；LAWWW2 帳號 A 11-11 第一批）。
   模型：assets/models/env/second_ai/season_<區域>.glb 的節點 SEASON_<代號>_on（tools/blender/env_second/season_deco.py；由 wz_street.py --season 產生）。
   遊戲：src/season_deco3d.js（SD3）進區域時照遊戲日期決定顯示哪幾組；那一天沒有任何一組，就不載入模型。
   rules：md＝[開始, 結束]（月-日，含頭尾；結束比開始小＝跨年）；lunar＝CALENDAR.LUNAR 的欄位（cny 春節、dragon 端午、moon 中秋）＋from／to（那一天往前、往後幾天）。
   mds＝好幾段月日；term＝'final'（期末考週，CALENDAR.termOf(day).exam）＋before（提前幾天開始）；unlessFlag＝{旗標: 值}（存檔的旗標是這個值就不顯示）。
   第一批過年、聖誕；第二批端午、情人節、萬聖節、便利店海報、飲料店布條、洗衣店換季、期末考週影印店。還沒有的（季節攤販、水果行和花店的四季、雨天的傘架、元宵、中秋）之後加在這裡。 */
const SEASON_DECO = {
  "version": 1,
  "zones": {
    "wenzhou": {"asset": "bldg.season_wenzhou", "glb": "assets/models/env/second_ai/season_wenzhou.glb", "codes": ["CNY", "XMAS", "DRAGON", "VDAY", "CVSWINTER", "CVSSUMMER", "LAUNDRY", "EXAM"]},
    "gongguan": {"asset": "bldg.season_gongguan", "glb": "assets/models/env/second_ai/season_gongguan.glb", "codes": ["CNY", "XMAS", "DRAGON", "VDAY", "HALLOWEEN", "CVSWINTER", "CVSSUMMER", "DRINKSUMMER", "DRINKWINTER"]}
  },
  "rules": {
    "CNY": {"name": "過年：春聯、橫批、倒貼的福、紅燈籠", "lunar": "cny", "from": -14, "to": 15, "note": "除夕前兩週～元宵（春節那一天往前 14 天、往後 15 天）；每一扇店門、住家門"},
    "XMAS": {"name": "聖誕：門上的花圈、玻璃上緣的小燈串、雪花貼紙", "md": ["12-01", "12-25"], "note": "只有咖啡、早午餐店（溫州街 SUNNY SIDE、日常失速；公館 afar、Daybreak）"},
    "DRAGON": {"name": "端午：門邊一束艾草菖蒲、便利店的粽子海報", "lunar": "dragon", "from": -7, "to": 0, "note": "端午前一週～當天；艾草：林家乾麵、小路、青木茶室；海報：日和便利店兩間"},
    "VDAY": {"name": "情人節：咖啡店玻璃上的小愛心、花序的玫瑰花束海報", "md": ["02-07", "02-14"]},
    "HALLOWEEN": {"name": "萬聖節：玻璃上的小蝙蝠、上緣一串紙南瓜", "md": ["10-24", "10-31"], "note": "只有公館 afar、Daybreak 兩間（使用者 11-10 選：含萬聖節；提案：台灣比較少，不每間都放）"},
    "CVSWINTER": {"name": "日和便利店冬天的海報：關東煮・熱飲", "md": ["12-01", "02-28"]},
    "CVSSUMMER": {"name": "日和便利店夏天的海報：冰品・涼飲", "md": ["06-01", "09-15"]},
    "DRINKSUMMER": {"name": "青木茶室門邊的布條：冬瓜檸檬・冰", "md": ["06-01", "09-15"]},
    "DRINKWINTER": {"name": "青木茶室門邊的布條：熱飲", "md": ["12-01", "02-28"]},
    "LAUNDRY": {"name": "常在洗衣的換季告示：棉被・大衣送洗", "mds": [["04-01", "04-30"], ["10-01", "10-31"]]},
    "EXAM": {"name": "阿德影印的期末考週告示：考古題・講義影印、期末加油", "term": "final", "before": 7, "unlessFlag": {"WZ_COPY_SHOP": "moved"}, "note": "期末考週（CALENDAR.termOf(day).exam＝final）和前一週；阿德原本的店面（A1）。阿德搬到轉角以後（劇情旗標 WZ_COPY_SHOP＝moved）原本的店面拉下鐵門，不貼"}
  }
};
if (typeof window !== 'undefined') window.SEASON_DECO = SEASON_DECO;
