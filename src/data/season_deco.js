/* 季節、節日的布置：代號 → 什麼時候顯示（LIFE-DETAILS-SEASONAL-1110，X317；使用者 2026-11-10「季節性的攤販、店門口的小變化、節日的布置 很棒」→ 20 項全做、含萬聖節；LAWWW2 帳號 A 11-11 第一批）。
   模型：assets/models/env/second_ai/season_<區域>.glb 的節點 SEASON_<代號>_on（tools/blender/env_second/season_deco.py；由 wz_street.py --season 產生）。
   遊戲：src/season_deco3d.js（SD3）進區域時照遊戲日期決定顯示哪幾組；那一天沒有任何一組，就不載入模型。
   rules：md＝[開始, 結束]（月-日，含頭尾；結束比開始小＝跨年）；lunar＝CALENDAR.LUNAR 的欄位（cny 春節、dragon 端午、moon 中秋）＋from／to（那一天往前、往後幾天）。
   第一批只有過年、聖誕；之後的（端午、中秋、情人節、萬聖節、季節攤販…）加在這裡。 */
const SEASON_DECO = {
  "version": 1,
  "zones": {
    "wenzhou": {"asset": "bldg.season_wenzhou", "glb": "assets/models/env/second_ai/season_wenzhou.glb", "codes": ["CNY", "XMAS"]},
    "gongguan": {"asset": "bldg.season_gongguan", "glb": "assets/models/env/second_ai/season_gongguan.glb", "codes": ["CNY", "XMAS"]}
  },
  "rules": {
    "CNY": {"name": "過年：春聯、橫批、倒貼的福、紅燈籠", "lunar": "cny", "from": -14, "to": 15, "note": "除夕前兩週～元宵（春節那一天往前 14 天、往後 15 天）；每一扇店門、住家門"},
    "XMAS": {"name": "聖誕：門上的花圈、玻璃上緣的小燈串、雪花貼紙", "md": ["12-01", "12-25"], "note": "只有咖啡、早午餐店（溫州街 SUNNY SIDE、日常失速；公館 afar、Daybreak）"}
  }
};
if (typeof window !== 'undefined') window.SEASON_DECO = SEASON_DECO;
