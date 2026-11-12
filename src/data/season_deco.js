/* 季節、節日的布置：代號 → 什麼時候顯示（LIFE-DETAILS-SEASONAL-1110，X317；使用者 2026-11-10「季節性的攤販、店門口的小變化、節日的布置 很棒」→ 20 項全做、含萬聖節；LAWWW2 帳號 A 11-11 第一批）。
   模型：assets/models/env/second_ai/season_<區域>.glb 的節點 SEASON_<代號>_on（tools/blender/env_second/season_deco.py；由 wz_street.py --season 產生）。
   遊戲：src/season_deco3d.js（SD3）進區域時照遊戲日期決定顯示哪幾組；那一天沒有任何一組，就不載入模型。
   第三批（11-11）：四季的水果（阿忠鮮果）、花序門口的季節花、雨天的地墊傘架、元宵燈籠、中秋文旦禮盒和騎樓烤肉架。looks＝看的互動點（hidden:true＝先不開給玩家，LAWWW 接 AA 的字時再開）；blocks＝那一組顯示的那一天才加的導航阻擋 [x0, x1, z0, z1]。
   rules：md＝[開始, 結束]（月-日，含頭尾；結束比開始小＝跨年）；lunar＝CALENDAR.LUNAR 的欄位（cny 春節、dragon 端午、moon 中秋）＋from／to（那一天往前、往後幾天）。
   mds＝好幾段月日；term＝'final'（期末考週，CALENDAR.termOf(day).exam）＋before（提前幾天開始）；unlessFlag＝{旗標: 值}（存檔的旗標是這個值就不顯示）；weather＝'rain'（進區域那一刻的天氣）；hours＝[開始, 結束)（進區域那一刻的時間）；termWeek＝[第幾週, 第幾週]（學期的週次，CALENDAR.termOf）。
   stalls＝季節攤販（A1～A6）：key、哪一組（code）、招牌的字（sign：只寫賣的東西，D147）、攤販站的位置 clerk（x、z、face＝看哪裡；null＝沒有攤販）、客人站的位置 at（x、z、r）、模型的腳印 foot。
     「看」「買」的流程和文字接夜市那一套（src/night_market3d.js），LAWWW 接、AA 寫（LAWWW 11-11 08:10）；這裡只給位置和日期，遊戲端還沒有接。
   第一批過年、聖誕；第二批端午、情人節、萬聖節、便利店海報、飲料店布條、洗衣店換季、期末考週影印店。還沒有的（季節攤販、水果行和花店的四季、雨天的傘架、元宵、中秋）之後加在這裡。 */
const SEASON_DECO = {
  "version": 1,
  "zones": {
    "wenzhou": {"asset": "bldg.season_wenzhou", "glb": "assets/models/env/second_ai/season_wenzhou.glb", "codes": ["CNY", "XMAS", "DRAGON", "VDAY", "CVSWINTER", "CVSSUMMER", "LAUNDRY", "EXAM", "FRUITSPRING", "FRUITSUMMER", "FRUITAUTUMN", "FRUITWINTER", "MOON", "LANTERN", "RAIN", "AIYU", "TEXTBOOK"],
      "blocks": {"AIYU": [[29.5, 31.5, 3.5, 5.0]]},
      "stalls": [{"key": "sea_aiyu", "code": "AIYU", "sign": "愛玉・仙草", "clerk": {"x": 30.62, "z": 4.72, "face": [30.62, 2.6]}, "at": {"x": 30.62, "z": 3.05, "r": 1.0}, "foot": [30.05, 31.15, 3.95, 4.55], "note": "溫州街小公園入口東邊、杜鵑花籬外面的路邊（推車在籬笆和路中間）；客人站在路上"}, {"key": "sea_textbook", "code": "TEXTBOOK", "sign": "二手教科書 特價", "clerk": null, "at": {"x": 14.9, "z": 4.2, "r": 1.0}, "foot": [14.3, 15.5, 5.12, 5.5], "note": "溫州書屋門廊、門的右邊（門廊本來就擋住，不加阻擋）；沒有攤販（書店的人在店裡）"}],
      "looks": {"FRUITSPRING": [{"id": "sea_fruit", "x": 33.2, "z": -4.3, "r": 1.0, "label": "看當季的水果", "hidden": true}], "FRUITSUMMER": [{"id": "sea_fruit", "x": 33.2, "z": -4.3, "r": 1.0, "label": "看當季的水果", "hidden": true}], "FRUITAUTUMN": [{"id": "sea_fruit", "x": 33.2, "z": -4.3, "r": 1.0, "label": "看當季的水果", "hidden": true}], "FRUITWINTER": [{"id": "sea_fruit", "x": 33.2, "z": -4.3, "r": 1.0, "label": "看當季的水果", "hidden": true}],
        "MOON": [{"id": "sea_moon_pomelo", "x": 37.0, "z": -4.3, "r": 1.0, "label": "看文旦禮盒", "hidden": true}], "LANTERN": [{"id": "sea_lantern", "x": 26.0, "z": 12.4, "r": 1.6, "label": "看燈籠", "hidden": true}]}},
    "gongguan": {"asset": "bldg.season_gongguan", "glb": "assets/models/env/second_ai/season_gongguan.glb", "codes": ["CNY", "XMAS", "DRAGON", "VDAY", "HALLOWEEN", "CVSWINTER", "CVSSUMMER", "DRINKSUMMER", "DRINKWINTER", "FNSPRING", "FNMAY", "FNJUNE", "FNXMAS", "MOONBBQ", "RAIN", "YAM", "MOONCAKE", "COUPLET", "BOUQUET"],
      "blocks": {"MOONBBQ": [[25.5, 27.5, 20.5, 21.5]], "YAM": [[-61.4, -59.4, 17.0, 19.0]], "MOONCAKE": [[-34.2, -31.7, 17.5, 19.5]], "COUPLET": [[-39.0, -36.0, 15.5, 17.0]], "BOUQUET": [[7.5, 9.5, -45.0, -42.5]]},
      "stalls": [{"key": "sea_yam", "code": "YAM", "sign": "烤地瓜", "clerk": {"x": -60.4, "z": 18.62, "face": [-60.4, 16.0]}, "at": {"x": -60.4, "z": 16.4, "r": 1.0}, "foot": [-61.0, -59.8, 17.65, 18.3], "note": "公館燒臘前面偏東、騎樓柱子外的人行廣場（MOONCAKE-EXIT-1112：原本在 x −63，擋格正好蓋住公館燒臘出來的落點 (−63, 18)；往東挪 2.6 m）"}, {"key": "sea_mooncake", "code": "MOONCAKE", "sign": "中秋禮盒", "clerk": {"x": -32.9, "z": 19.1, "face": [-32.9, 16.5]}, "at": {"x": -32.9, "z": 17.0, "r": 1.0}, "foot": [-33.6, -32.2, 18.15, 18.75], "note": "日和便利店（G03）前面偏西、騎樓外的人行廣場：臨時的桌子（MOONCAKE-EXIT-1112：原本在 x −31.4～−30.0，擋格離便利店出口落點 (−29.4, 18) 只有 0.1 m，BB／CC reachability gongguan FAIL；往西挪 2.2 m）"}, {"key": "sea_couplet", "code": "COUPLET", "sign": "春聯・年貨", "clerk": {"x": -37.5, "z": 15.85, "face": [-37.5, 18.0]}, "at": {"x": -37.5, "z": 17.45, "r": 1.0}, "foot": [-38.6, -36.4, 16.2, 16.72], "note": "頁間書屋（G02）前面的人行廣場：一排掛著的春聯＋一張桌子；攤販站在廣場那一邊、面向騎樓"}, {"key": "sea_bouquet", "code": "BOUQUET", "sign": "畢業花束", "clerk": {"x": 8.25, "z": -44.45, "face": [8.25, -42.0]}, "at": {"x": 8.25, "z": -42.05, "r": 1.0}, "foot": [7.85, 9.15, -43.95, -43.3], "note": "校門東邊的出入口旁、靠校園圍牆（公館這一側）"}],
      "looks": {"FNSPRING": [{"id": "flower_notes_season", "x": 44.0, "z": 20.8, "r": 1.2, "label": "看門口的花", "hidden": true}], "FNMAY": [{"id": "flower_notes_season", "x": 44.0, "z": 20.8, "r": 1.2, "label": "看門口的花", "hidden": true}], "FNJUNE": [{"id": "flower_notes_season", "x": 44.0, "z": 20.8, "r": 1.2, "label": "看門口的花", "hidden": true}], "FNXMAS": [{"id": "flower_notes_season", "x": 44.0, "z": 20.8, "r": 1.2, "label": "看門口的花", "hidden": true}],
        "MOONBBQ": [{"id": "sea_moon_bbq", "x": 26.5, "z": 20.3, "r": 1.2, "label": "看騎樓的烤肉", "hidden": true}]}}
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
    "FRUITSPRING": {"name": "阿忠鮮果門口的當季水果：枇杷", "md": ["04-01", "05-15"], "note": "第三批（11-11）：門廊裡鳳梨香蕉箱和前檯之間的空位（x 32.95～33.45），兩個木箱疊起來＋手寫卡；原本就擋住的地方，不動導航"},
    "FRUITSUMMER": {"name": "阿忠鮮果門口的當季水果：芒果", "md": ["06-01", "07-31"]},
    "FRUITAUTUMN": {"name": "阿忠鮮果門口的當季水果：文旦", "md": ["08-15", "09-30"]},
    "FRUITWINTER": {"name": "阿忠鮮果門口的當季水果：椪柑、草莓", "md": ["12-15", "02-15"]},
    "MOON": {"name": "中秋：阿忠鮮果門口的文旦禮盒", "lunar": "moon", "from": -10, "to": 0, "note": "中秋前 10 天～當天；門廊另一個空位（磅秤桌旁，x 36.82～37.25）"},
    "MOONBBQ": {"name": "中秋：公館騎樓的小烤肉架（晚上）", "lunar": "moon", "from": -1, "to": 0, "hours": [17, 23], "note": "中秋前一天、當天的 17:00～23:00（進區域那一刻判斷）；G09 鐵捲門前、貼著店面（烤肉架、凳子、木炭在 x 26～27、z 21～21.5）；導航阻擋 x 25.5～27.5、z 20.5～21.5——比東西大一圈 0.5 m：引擎的「站得住」只看人的前後左右四個點，阻擋只和東西一樣大的話，人可以斜站到離烤肉架 7 cm（tests/season_deco_nav_unit.js 第 1 項第一次跑抓到的）；騎樓剩約 1.3 m 寬、走得過"},
    "LANTERN": {"name": "元宵：溫州街小公園入口步道上方一串小燈籠", "lunar": "cny", "from": 10, "to": 15, "note": "春節後第 10～15 天（元宵＝初一後 14 天）；掛在兩棵樟樹之間（高 3 m 以上，不落地）"},
    "RAIN": {"name": "下雨天：店門口的地墊、傘架", "weather": "rain", "note": "照進區域那一刻的天氣（E.weather＝rain），不是日期；傘架只放在門邊沒有東西、原本就擋住的地方（匯出時往下打點檢查），地墊是平的"},
    "FNSPRING": {"name": "花序門口花台的季節花：鬱金香", "md": ["02-20", "03-10"], "note": "花序 Flower Notes（G11）門兩邊的花台上一排盆花（不落地、不動導航）"},
    "FNMAY": {"name": "花序門口花台的季節花：康乃馨（母親節前）", "md": ["05-01", "05-14"]},
    "FNJUNE": {"name": "花序門口花台的季節花：向日葵（畢業季）", "md": ["06-01", "06-20"]},
    "FNXMAS": {"name": "花序門口花台的季節花：聖誕紅", "md": ["12-01", "12-25"]},
    "YAM": {"name": "季節攤販：烤地瓜推車（公館）", "md": ["12-01", "02-29"], "hours": [15, 22], "note": "A1；12～2 月的 15:00～22:00（進區域那一刻判斷）"},
    "AIYU": {"name": "季節攤販：愛玉、仙草冰推車（溫州街小公園門口）", "md": ["06-01", "08-31"], "hours": [13, 18], "note": "A2；6～8 月的下午"},
    "MOONCAKE": {"name": "季節攤販：中秋禮盒的臨時桌（公館日和便利店前）", "lunar": "moon", "from": -14, "to": 0, "hours": [10, 21], "note": "A3；中秋前兩週～當天"},
    "COUPLET": {"name": "季節攤販：春聯、年貨的臨時攤（公館頁間書屋前）", "lunar": "cny", "from": -20, "to": -1, "hours": [10, 21], "note": "A4；尾牙前後～除夕（春節前 20 天～前一天）"},
    "BOUQUET": {"name": "季節攤販：畢業花束（校門東邊）", "md": ["06-01", "06-20"], "hours": [10, 18], "note": "A5；畢業季（晨露花舖已經拿掉，改放校門口：提案寫的另一個位置）"},
    "TEXTBOOK": {"name": "季節攤販：二手教科書特價架（溫州書屋門廊）", "termWeek": [1, 2], "hours": [10, 21], "note": "A6；開學第一、二週（CALENDAR.termOf 的 week；上下學期都算）。頁間書屋門口的那一條沒有空位（門兩邊已經有書箱、立牌），先只放溫州書屋"},
    "EXAM": {"name": "阿德影印的期末考週告示：考古題・講義影印、期末加油", "term": "final", "before": 7, "unlessFlag": {"WZ_COPY_SHOP": "moved"}, "note": "期末考週（CALENDAR.termOf(day).exam＝final）和前一週；阿德原本的店面（A1）。阿德搬到轉角以後（劇情旗標 WZ_COPY_SHOP＝moved）原本的店面拉下鐵門，不貼"}
  }
};
if (typeof window !== 'undefined') window.SEASON_DECO = SEASON_DECO;
