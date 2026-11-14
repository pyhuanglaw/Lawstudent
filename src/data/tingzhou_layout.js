/* ===== 汀州路商圈（汀州路三段一段街＋夜市巷；TINGZHOU-AREA-1110，USER_WANTS X321；LAWWW2 帳號 A 2026-11-10）=====
   使用者：11-10 18:3x「公館商圈往南新增汀州路商圈」；18:4x 選第一階段＝一段街＋夜市巷、夜市攤晚上才擺、入口從公館店面街開巷子；
   19:1x（X321）泰米村食、洗樂洗衣坊、印得好放在汀州路；18:5x～19:0x 完整 3D 美術指令（原文 docs/art-rebuild/second_ai/ref/tingzhou_1110/USER_INSTRUCTION_1110.md、
   參考圖分析 REF_ANALYSIS.md）：中低樓層老街屋、一樓密集店面與騎樓、直立燈箱招牌、東南亞美食（泰、馬、印尼、緬甸）混在學生日常店裡、人文咖啡、傍晚熱鬧、水源市場附近人多；
   不要觀光夜市、不要西門町、不要高級新商圈、不要統一規格的方盒子店面。
   這份給遊戲（src/tingzhou3d.js）和 Blender（tools/blender/env_second/tingzhou_street.py）共用，必須是「const TINGZHOU_LAYOUT=」後面接純 JSON。
   座標：x 往東、z 往南、y 往上（公尺）。汀州路沿著 z。東側（+x）＝羅斯福路那一邊：巷 A 往東接公館店面街 G10 的巷口；水源市場在東側南段（羅斯福路和汀州路之間，地圖 2、3）。西側（−x）往思源街、自來水園區。
   路：雙向兩線，連路邊的機車停車格寬 10 m（x −5～5），沒有另外的人行道（台北老街：騎樓就是人行道）；騎樓在樓房一樓往裡退 3.2 m（立面 x ±5、店面 x ±8.2）。
   店面寬 2.5～12 m 不一樣（使用者：門面寬度、深度、招牌位置、燈光、裝修年代可以不同）。店名：有互動的三間照規格；五間（越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸）是使用者 11-10 19:2x 指定的正式名稱，照概念圖 docs/art-rebuild/second_ai/ref/tingzhou_1110/concept/（concept＝哪一張；街景圖從對面看左→右＝越好吃 → 溫特寶邸，西側的樓從東邊看左＝南）；其他是暫名（店的種類當招牌字，等 AA 取名再換，D77 不用真實店名）。
   arcade:false＝沒有騎樓、店面直接臨人行道（使用者 11-10 20:5x「混合」：五間照概念圖沒有騎樓，樓房整棟退到店面線 x −8.2，前面是露天的人行道；其他保留騎樓，立面有進有出）；era：裝修年代（old 老店：手寫字燈箱、舊磁磚、鐵捲門；mid：壓克力燈箱、鋁門窗；new：木作、黑框玻璃、吊燈）；front：店面的樣子（open 整面開著的小吃、glass 玻璃門窗、half 半開＋外帶櫃台、shutter 鐵捲門拉下）。 */
const TINGZHOU_LAYOUT={
  "version": 5,
  "nav": {"x0": -18, "z0": -44, "w": 54, "d": 88, "cell": 0.5},
  "road": {"name": "汀州路三段", "x0": -5.0, "x1": 5.0, "z0": -60, "z1": 60, "lanes": 2, "parkW": 1.6, "surface": "asphalt", "note": "路邊 1.6 m 是機車停車格（白框）；路中間雙黃線；遊戲裡沒有車，玩家可以走在路上"},
  "walk": {"z0": -40, "z1": 40},
  "facade": {"west": -5.0, "east": 5.0, "arcade": 3.2, "depth": 14.0},
  "floorH": 3.1,
  "groundH": 3.9,
  "crossings": [{"z": 23.5, "w": 4.0, "note": "水源市場旁的巷口（SHUIYUAN-MARKET-LANE-1112：原本在巷 A 口 z 0）"}],
  "alleys": [{"id": "A", "side": "E", "z0": -2.5, "z1": 2.5, "len": 24, "walk": true, "night": false, "note": "原本通公館、兩側擺攤的巷子。SHUIYUAN-MARKET-LANE-1112（使用者 11-12）：通公館的路和攤位都搬到水源市場旁的巷子（下一條）；這一條留著可以走（禮貌生財在裡面），不擺攤、盡頭不通"},
             {"id": "M", "side": "E", "z0": 19.0, "z1": 28.0, "len": 24, "walk": true, "night": true, "to": "gongguan", "market": true, "note": "水源市場旁的巷子（使用者 11-12：「公館有很多攤販的地方就是水源市場那一棟的旁邊 羅斯福路跟汀州路中間」「公館走到汀州路就應該是這一條」）：南側是水源市場那一棟的北面，十攤排在兩側，東端通公館。寬 9 m（原本 e_shoes、e_cvs 兩格通用店面整個拿掉）"}],
  "shops": [
    {"id": "w_burma", "side": "W", "z0": -40.0, "z1": -34.0, "floors": 6, "name": "緬甸小吃", "type": "緬甸", "sea": true, "era": "old", "front": "open"},
    {"id": "w_bento", "side": "W", "z0": -34.0, "z1": -29.5, "floors": 4, "name": "便當", "type": "便當", "era": "old", "front": "open"},
    {"id": "w_sport", "side": "W", "z0": -29.5, "z1": -24.0, "floors": 7, "name": "運動用品", "type": "運動用品", "era": "mid", "front": "glass"},
    {"id": "w_mian", "side": "W", "z0": -24.0, "z1": -19.5, "floors": 5, "name": "麵線・小吃", "type": "小吃", "era": "old", "front": "open"},
    {"id": "w_indo", "side": "W", "z0": -19.5, "z1": -14.0, "floors": 5, "name": "印尼料理", "type": "印尼", "sea": true, "era": "mid", "front": "half"},
    {"id": "w_tea", "side": "W", "z0": -14.0, "z1": -10.0, "floors": 4, "name": "手搖飲", "type": "手搖飲", "era": "new", "front": "half"},
    {"id": "w_cafe", "side": "W", "z0": -10.0, "z1": -5.0, "floors": 4, "name": "人文咖啡", "type": "咖啡", "era": "new", "front": "glass", "note": "二手書、木作、吊燈（使用者：人文咖啡）"},
    {"id": "taimi", "side": "W", "z0": -5.0, "z1": 3.0, "floors": 5, "name": "泰米村食", "type": "泰式料理", "sea": true, "era": "mid", "front": "glass", "enter": true, "note": "巷 A 出來的正對面；平價泰式小館（GG_SHOPS3_1110.md 第三節 5：深木色、暖橘、米白招牌，米飯、香料葉片、餐盤圖示）"},
    {"id": "wente", "side": "W", "arcade": false, "z0": 3.0, "z1": 8.5, "floors": 4, "name": "溫特寶邸", "type": "古著・二手服飾", "sub": "vintage boutique", "era": "new", "front": "glass", "concept": "shop_wentebaodi", "note": "黑底米金字招牌＋三盞鵝頸燈；深色木作櫥窗（假人、皮夾克）、木門；門口衣架、木花箱"},
    {"id": "liantong", "side": "W", "arcade": false, "z0": 8.5, "z1": 13.0, "floors": 5, "name": "汀州聯通", "type": "手機通訊", "sub": "手機・通訊・維修", "era": "mid", "front": "glass", "concept": "shop_tingzhou_liantong", "note": "深藍底白字燈箱＋直立燈箱；鋁框玻璃、白光、手機殼牆、展示櫃"},
    {"id": "dongnan", "side": "W", "arcade": false, "z0": 13.0, "z1": 20.5, "floors": 4, "name": "東南大聯商行", "type": "東南亞食品雜貨", "sub": "東南亞食品・香料・零食・生活雜貨", "sea": true, "era": "old", "front": "open", "concept": "shop_dongnan_dalian", "note": "黃底紅字招牌（椰子樹、佛塔剪影）；墨綠帆布雨棚；整面開著、貨架塞滿；門口鐵網架、紅藍塑膠籃"},
    {"id": "keju", "side": "W", "arcade": false, "z0": 20.5, "z1": 26.0, "floors": 5, "name": "客居雲南", "type": "雲南料理", "sub": "雲南料理・米干・過橋米線", "sea": true, "era": "mid", "front": "half", "concept": "shop_kejuyunnan", "note": "米色底酒紅字招牌（亭子、梯田）＋直立燈箱；酒紅帆布雨棚；騎樓下木桌圓凳；照片菜單"},
    {"id": "yuehaochi", "side": "W", "arcade": false, "z0": 26.0, "z1": 32.0, "floors": 4, "name": "越好吃小館", "type": "越南料理", "sub": "越南料理・河粉・春捲", "sea": true, "era": "mid", "front": "glass", "concept": "shop_yuehaochi", "note": "酒紅底米白字招牌（河粉碗、斗笠）＋直立燈箱；深色木框玻璃、藤編吊燈；照片菜單、大盆栽"},
    {"id": "w_luwei", "side": "W", "z0": 32.0, "z1": 36.0, "floors": 5, "name": "滷味", "type": "滷味", "era": "old", "front": "open"},
    {"id": "w_brunch", "side": "W", "z0": 36.0, "z1": 40.0, "floors": 6, "name": "早午餐", "type": "早午餐", "era": "new", "front": "glass"},
    {"id": "e_glass", "side": "E", "z0": -40.0, "z1": -35.5, "floors": 5, "name": "眼鏡", "type": "眼鏡", "era": "mid", "front": "glass"},
    {"id": "e_chicken", "side": "E", "z0": -35.5, "z1": -31.0, "floors": 4, "name": "鹽水雞", "type": "小吃", "era": "old", "front": "open"},
    {"id": "e_malay", "side": "E", "z0": -31.0, "z1": -25.0, "floors": 6, "name": "馬來西亞餐", "type": "馬來西亞", "sea": true, "era": "mid", "front": "half"},
    {"id": "e_douhua", "side": "E", "z0": -25.0, "z1": -21.0, "floors": 4, "name": "豆花", "type": "甜湯", "era": "old", "front": "open"},
    {"id": "e_books", "side": "E", "z0": -21.0, "z1": -16.0, "floors": 5, "name": "二手書", "type": "二手書", "era": "old", "front": "glass"},
    {"id": "e_dump", "side": "E", "z0": -16.0, "z1": -11.0, "floors": 5, "name": "鍋貼・水餃", "type": "水餃", "era": "old", "front": "open"},
    {"id": "e_lotto", "side": "E", "z0": -11.0, "z1": -8.5, "floors": 4, "name": "彩券", "type": "彩券", "era": "old", "front": "glass"},
    {"id": "xile", "side": "E", "z0": -8.5, "z1": -2.5, "floors": 5, "name": "洗樂洗衣坊", "type": "投幣洗衣", "era": "new", "front": "glass", "enter": true, "note": "巷 A 口北邊；淺天藍燈箱、白色圓體字、滾筒洗衣機圖示、大玻璃、騎樓下木長椅（規格第三節 3）"},
    {"id": "yindehao", "side": "E", "z0": 2.5, "z1": 9.0, "floors": 4, "name": "印得好", "type": "影印・輸出", "era": "old", "front": "glass", "enter": true, "note": "巷 A 口南邊；深灰藍燈箱、白字、紙張與印表機圖示、櫥窗樣品、店外裝訂樣本架；實用樸素、經營多年（規格第三節 4）"},
    {"id": "e_bfast", "side": "E", "z0": 9.0, "z1": 13.5, "floors": 4, "name": "早餐", "type": "早餐", "era": "old", "front": "open"},
    {"id": "e_hainan", "side": "E", "z0": 13.5, "z1": 19.0, "floors": 6, "name": "海南雞飯", "type": "星馬", "sea": true, "era": "mid", "front": "half"},
    {"id": "e_market", "side": "E", "z0": 28.0, "z1": 40.0, "floors": 3, "name": "水源市場", "type": "市場", "era": "old", "front": "market", "deep": 26.0, "note": "SHUIYUAN-MARKET-LANE-1112：一整棟樓（x 5～31、z 28～40），北面臨巷子（側門、遮雨棚）。市場大樓臨汀州路的那一面：一樓攤位白天開、傍晚收一半，門口人多（使用者：水源市場附近人流較高）"}
  ],
  "fromGongguan": {"x": 27.0, "z": 23.5, "yaw": -1.5708, "note": "從公館的巷口進來站的地方（水源市場旁的巷子東端，面向西＝汀州路；SHUIYUAN-MARKET-LANE-1112：原本 z 0）"},
  "toGongguan": {"x": 28.6, "z": 23.5, "r": 1.4, "label": "往公館（羅斯福路）", "spawn": {"x": 37.1, "z": 18.0, "yaw": 3.1416}, "note": "回公館：站在店面街 G10 巷口前的人行道，面向馬路"},
  "stalls": {"from": 14, "to": 24, "block": {"w": 2.4, "d": 1.5, "back": 0.25},
   "note": "夜市十攤＋背景三攤（NIGHT-MARKET-1110，X326；使用者 11-10：配置照方案、各攤時間不一樣、背景攤只寫賣的東西；十攤照使用者的十張參考圖）。kind＝tingzhou_stalls.glb 的 STALL_<kind>_open／_closed；yaw＝客人那一面朝哪裡（0＝+z）。每一攤自己的開、收時間在 kinds——十攤照 AA_752 的 hours（LAWWW 11-10 23:49 定；甜湯夏天 5～9 月 14:00 開＝summerFrom，執行時由 night_market3d.js 照月份寫進 from）；from／to 是最早開、最晚收。days＝星期幾才擺（0＝星期日；LAWWW 接：區域的 tzStallOff[id]＝true 那一攤當天不擺）。block＝導航擋的範圍（攤體＋後面站人；甜湯含兩張折疊桌和凳子）。items＝參考圖上的品項和價錢（以圖為準，和 AA 的商品表對）。巷 A 兩側交錯擺、不面對面；有煙的三攤在汀州路西側路邊；甜湯、甘蔗汁在水源市場前。算命攤改成小店「禮貌生財」（X332），不在這裡",
   "kinds": {
    "milk": {"name": "沈三盃黑糖鮮奶", "size": "M", "w": 2.0, "d": 0.9, "block": {"w": 2.9, "d": 1.7, "back": 0.25}, "from": 17.0, "to": 24.0, "buy": true, "items": [["黑糖珍珠鮮奶（青蛙撞奶）", 65], ["黑糖鮮奶", 55], ["黑糖珍珠奶茶", 55], ["黑糖鮮奶茶", 50], ["黑糖珍珠鮮奶（熱）", 65]]},
    "pepper": {"name": "皇家高端胡椒餅", "size": "MW", "w": 2.4, "d": 0.9, "block": {"w": 3.3, "d": 1.7, "back": 0.25}, "from": 17.0, "to": 23.0, "buy": true, "items": [["胡椒餅", 60]]},
    "wheelcake": {"name": "二十元紅豆餅", "size": "S", "w": 1.5, "d": 0.7, "block": {"w": 2.4, "d": 1.5, "back": 0.25}, "from": 15.0, "to": 22.0, "buy": true, "items": [["紅豆", 20], ["奶油", 20], ["花生", 20]]},
    "ball": {"name": "一個地球", "size": "S", "w": 1.5, "d": 0.7, "block": {"w": 2.4, "d": 1.5, "back": 0.25}, "from": 17.0, "to": 24.0, "buy": true, "items": [["經典地瓜球", 50], ["雙色地瓜球", 55], ["起司地瓜球", 60]]},
    "scallion": {"name": "當蔥蔥油餅", "size": "M", "w": 2.0, "d": 0.9, "block": {"w": 2.9, "d": 1.7, "back": 0.25}, "from": 16.0, "to": 23.0, "buy": true, "items": [["原味蔥油餅", 45], ["加蛋蔥油餅", 55], ["起司蔥油餅", 65], ["雙蛋蔥油餅", 65]]},
    "stinky": {"name": "紹興炸豆腐", "size": "M", "w": 2.0, "d": 0.9, "block": {"w": 3.1, "d": 1.8, "back": 0.25}, "from": 17.5, "to": 24.0, "buy": true, "items": [["炸豆腐", 70], ["加泡菜", 10]]},
    "corn": {"name": "玉皇大帝", "size": "MW", "w": 2.4, "d": 0.9, "block": {"w": 3.3, "d": 1.7, "back": 0.25}, "from": 18.0, "to": 24.0, "buy": true, "items": [["炭烤玉米（紹興原味、蒜香厚醬、沙茶霸味、椒麻嗆辣、起司香濃、檸檬椒鹽）", 70]]},
    "eggcake": {"name": "陳家古早味雞蛋糕", "size": "S", "w": 1.5, "d": 0.75, "block": {"w": 2.5, "d": 1.5, "back": 0.25}, "from": 15.0, "to": 21.5, "buy": true, "items": [["原味", 30], ["奶香", 35], ["紅豆", 40], ["花生", 40], ["起司", 45]]},
    "cane": {"name": "節節高甘蔗汁", "size": "S", "w": 1.8, "d": 0.75, "block": {"w": 3.0, "d": 1.5, "back": 0.25}, "from": 16.0, "to": 23.0, "buy": true, "items": [["甘蔗汁 中杯 500ml", 50], ["甘蔗汁 大杯 700ml", 65]]},
    "jelly": {"name": "公館阿婆甜湯", "size": "L", "w": 2.8, "d": 1.0, "block": {"w": 6.2, "d": 2.0, "back": 0.2}, "from": 17.0, "to": 23.0, "summerFrom": 14.0, "buy": true, "items": [["粉圓冰", 50], ["燒仙草", 55]]},
    "ring": {"name": "套圈圈", "size": "BG", "w": 2.2, "d": 1.6, "block": {"w": 2.9, "d": 2.2, "back": 0.2}, "from": 18.0, "to": 22.5, "buy": false, "days": [5, 6, 0]},
    "phonecase": {"name": "手機殼", "size": "BG", "w": 1.6, "d": 0.7, "block": {"w": 2.2, "d": 1.5, "back": 0.25}, "from": 16.0, "to": 22.5, "buy": false},
    "socks": {"name": "襪子", "size": "BG", "w": 1.6, "d": 0.7, "block": {"w": 2.2, "d": 1.5, "back": 0.25}, "from": 16.0, "to": 22.0, "buy": false}
   },
   "gongguan": [
    {"id": "st_milk", "kind": "milk", "x": 29.0, "z": 11.2, "yaw": 0, "where": "gongguan"},
    {"id": "st_wheelcake", "kind": "wheelcake", "x": 53.6, "z": 11.2, "yaw": 0, "where": "gongguan"},
    {"id": "st_phonecase", "kind": "phonecase", "x": 15.0, "z": 11.2, "yaw": 0, "where": "gongguan"}
   ],
   "gongguanNote": "使用者 11-10「公館那一側也擺幾攤」：三攤擺在公館店面街騎樓外的人行道靠馬路那一側（公館區域的座標；面向騎樓＝+z），從汀州路這邊移過去、不是多做。量過（導航格）：人行道 z 8～17 可以走，z 17.5～19 是停車的機車，捷運出口 x 19～25.5；花序（x 41.6～51.6）門前、巷口（x 37）前不放。區域：tingzhou3d.js 的 hookGongguan（zone.ggStalls）",
   "list": [
    {"id": "st_eggcake", "kind": "eggcake", "x": 20.9, "z": 26.8, "yaw": 3.1416, "where": "laneM"},
    {"id": "st_scallion", "kind": "scallion", "x": 24.0, "z": 26.8, "yaw": 3.1416, "where": "laneM"},
    {"id": "st_ball", "kind": "ball", "x": 26.9, "z": 26.8, "yaw": 3.1416, "where": "laneM"},
    {"id": "st_pepper", "kind": "pepper", "x": 10.5, "z": 20.2, "yaw": 0, "where": "laneM"},
    {"id": "st_corn", "kind": "corn", "x": 14.4, "z": 20.2, "yaw": 0, "where": "laneM"},
    {"id": "st_stinky", "kind": "stinky", "x": 18.2, "z": 20.2, "yaw": 0, "where": "laneM"},
    {"id": "st_cane", "kind": "cane", "x": 17.6, "z": 26.8, "yaw": 3.1416, "where": "laneM"},
    {"id": "st_jelly", "kind": "jelly", "x": 12.2, "z": 26.8, "yaw": 3.1416, "where": "laneM"},
    {"id": "st_socks", "kind": "socks", "x": 25.2, "z": 20.2, "yaw": 0, "where": "laneM"},
    {"id": "st_ring", "kind": "ring", "x": 22.0, "z": 20.4, "yaw": 0, "where": "laneM"}
  ]},
  "limao": {"id": "limao", "name": "禮貌生財", "zone": "tz_limao", "x0": 25.5, "x1": 31.0, "z": 2.5, "dep": 3.0, "from": 19, "to": 23.5,
   "door": {"x": 27.3, "z": 4.75, "r": 0.9}, "pillars": [[25.8, 2.8], [30.7, 2.8]],
   "table": {"x": 28.9, "z": 4.3, "w": 1.5, "d": 0.9, "yaw": 3.1416, "seatMaster": {"x": 28.9, "z": 5.1, "yaw": 3.1416}, "seatGuest": {"x": 28.9, "z": 3.45, "yaw": 0.0}, "at": {"x": 27.6, "z": 3.6, "r": 1.0}},
   "plants": [[30.15, 4.95], [25.95, 5.05]],
   "v2": "第 2 版（BB 11-11 01:21）：算命桌放大到 1.5 × 0.9 m、移到窗前靠門口；左邊高的盆栽、右邊門旁的青花瓷盆（plants；模型在 LIMAO_TABLE_* 節點裡，營業、收攤都在）；門洞加寬（門的互動點 x 27.3）",
   "note": "禮貌生財（X332，使用者 11-10 23:1x「開始做，聊天免費」；外觀照使用者 11-11 的圖）：巷 A 後段南側靠公館那一端的老公寓一樓，一樓退 3 m 成騎樓（兩根柱子）。店面（z 5.5）：左邊深色木框格子窗、右邊開著的木門；招牌只寫「禮貌生財」。騎樓下的算命桌在窗前（上師坐靠窗那一側、面向巷子；客人坐靠巷子那一側），門前留 2 m 以上的通道。模型：街道 tingzhou_street.glb 的 TA_LIMAO＋攤位那一顆的 LIMAO_TABLE_open／_closed／LIMAO_SHOPLIGHT。營業 19:00～23:30（提案；AA 定哪幾天不開）。區域：zone.tzLimao＝{open, masterAway}；LAWWW 接：上師 NPC（seatMaster）、桌前的互動（at：免費算命、聊天）、zone.tzLimaoOff＝true 今天不開、zone.tzLimaoAway＝true 店開著上師不在"},
  "hours": {"night": {"from": 17, "to": 24, "note": "夜市人多的時段（路人用）；各攤自己的開收時間在 stalls.kinds"}}
};
