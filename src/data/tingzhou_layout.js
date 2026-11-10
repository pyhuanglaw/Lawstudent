/* ===== 汀州路商圈（汀州路三段一段街＋夜市巷；TINGZHOU-AREA-1110，USER_WANTS X321；LAWWW2 帳號 A 2026-11-10）=====
   使用者：11-10 18:3x「公館商圈往南新增汀州路商圈」；18:4x 選第一階段＝一段街＋夜市巷、夜市攤晚上才擺、入口從公館店面街開巷子；
   19:1x（X321）泰米村食、洗樂洗衣坊、印得好放在汀州路；18:5x～19:0x 完整 3D 美術指令（原文 docs/art-rebuild/second_ai/ref/tingzhou_1110/USER_INSTRUCTION_1110.md、
   參考圖分析 REF_ANALYSIS.md）：中低樓層老街屋、一樓密集店面與騎樓、直立燈箱招牌、東南亞美食（泰、馬、印尼、緬甸）混在學生日常店裡、人文咖啡、傍晚熱鬧、水源市場附近人多；
   不要觀光夜市、不要西門町、不要高級新商圈、不要統一規格的方盒子店面。
   這份給遊戲（src/tingzhou3d.js）和 Blender（tools/blender/env_second/tingzhou_street.py）共用，必須是「const TINGZHOU_LAYOUT=」後面接純 JSON。
   座標：x 往東、z 往南、y 往上（公尺）。汀州路沿著 z。東側（+x）＝羅斯福路那一邊：巷 A 往東接公館店面街 G10 的巷口；水源市場在東側南段（羅斯福路和汀州路之間，地圖 2、3）。西側（−x）往思源街、自來水園區。
   路：雙向兩線，連路邊的機車停車格寬 10 m（x −5～5），沒有另外的人行道（台北老街：騎樓就是人行道）；騎樓在樓房一樓往裡退 3.2 m（立面 x ±5、店面 x ±8.2）。
   店面寬 2.5～12 m 不一樣（使用者：門面寬度、深度、招牌位置、燈光、裝修年代可以不同）。店名：有互動的三間照規格；五間（越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸）是使用者 11-10 19:2x 指定的正式名稱，照概念圖 docs/art-rebuild/second_ai/ref/tingzhou_1110/concept/（concept＝哪一張；街景圖從對面看左→右＝越好吃 → 溫特寶邸，西側的樓從東邊看左＝南）；其他是暫名（店的種類當招牌字，等 AA 取名再換，D77 不用真實店名）。
   era：裝修年代（old 老店：手寫字燈箱、舊磁磚、鐵捲門；mid：壓克力燈箱、鋁門窗；new：木作、黑框玻璃、吊燈）；front：店面的樣子（open 整面開著的小吃、glass 玻璃門窗、half 半開＋外帶櫃台、shutter 鐵捲門拉下）。 */
const TINGZHOU_LAYOUT={
  "version": 3,
  "nav": {"x0": -18, "z0": -44, "w": 54, "d": 88, "cell": 0.5},
  "road": {"name": "汀州路三段", "x0": -5.0, "x1": 5.0, "z0": -60, "z1": 60, "lanes": 2, "parkW": 1.6, "surface": "asphalt", "note": "路邊 1.6 m 是機車停車格（白框）；路中間雙黃線；遊戲裡沒有車，玩家可以走在路上"},
  "walk": {"z0": -40, "z1": 40},
  "facade": {"west": -5.0, "east": 5.0, "arcade": 3.2, "depth": 14.0},
  "floorH": 3.1,
  "groundH": 3.9,
  "crossings": [{"z": 0.0, "w": 4.0, "note": "巷 A 口"}],
  "alleys": [{"id": "A", "side": "E", "z0": -2.5, "z1": 2.5, "len": 24, "walk": true, "night": true, "to": "gongguan", "note": "從公館店面街 G10 的巷口過來（羅斯福路和汀州路之間的南北向小巷，地圖 1 的夜市巷）；晚上兩側擺攤"}],
  "shops": [
    {"id": "w_burma", "side": "W", "z0": -40.0, "z1": -34.0, "floors": 6, "name": "緬甸小吃", "type": "緬甸", "sea": true, "era": "old", "front": "open"},
    {"id": "w_bento", "side": "W", "z0": -34.0, "z1": -29.5, "floors": 4, "name": "便當", "type": "便當", "era": "old", "front": "open"},
    {"id": "w_sport", "side": "W", "z0": -29.5, "z1": -24.0, "floors": 7, "name": "運動用品", "type": "運動用品", "era": "mid", "front": "glass"},
    {"id": "w_mian", "side": "W", "z0": -24.0, "z1": -19.5, "floors": 5, "name": "麵線・小吃", "type": "小吃", "era": "old", "front": "open"},
    {"id": "w_indo", "side": "W", "z0": -19.5, "z1": -14.0, "floors": 5, "name": "印尼料理", "type": "印尼", "sea": true, "era": "mid", "front": "half"},
    {"id": "w_tea", "side": "W", "z0": -14.0, "z1": -10.0, "floors": 4, "name": "手搖飲", "type": "手搖飲", "era": "new", "front": "half"},
    {"id": "w_cafe", "side": "W", "z0": -10.0, "z1": -5.0, "floors": 4, "name": "人文咖啡", "type": "咖啡", "era": "new", "front": "glass", "note": "二手書、木作、吊燈（使用者：人文咖啡）"},
    {"id": "taimi", "side": "W", "z0": -5.0, "z1": 3.0, "floors": 5, "name": "泰米村食", "type": "泰式料理", "sea": true, "era": "mid", "front": "glass", "enter": true, "note": "巷 A 出來的正對面；平價泰式小館（GG_SHOPS3_1110.md 第三節 5：深木色、暖橘、米白招牌，米飯、香料葉片、餐盤圖示）"},
    {"id": "wente", "side": "W", "z0": 3.0, "z1": 8.5, "floors": 4, "name": "溫特寶邸", "type": "古著・二手服飾", "sub": "vintage boutique", "era": "new", "front": "glass", "concept": "shop_wentebaodi", "note": "黑底米金字招牌＋三盞鵝頸燈；深色木作櫥窗（假人、皮夾克）、木門；門口衣架、木花箱"},
    {"id": "liantong", "side": "W", "z0": 8.5, "z1": 13.0, "floors": 5, "name": "汀州聯通", "type": "手機通訊", "sub": "手機・通訊・維修", "era": "mid", "front": "glass", "concept": "shop_tingzhou_liantong", "note": "深藍底白字燈箱＋直立燈箱；鋁框玻璃、白光、手機殼牆、展示櫃"},
    {"id": "dongnan", "side": "W", "z0": 13.0, "z1": 20.5, "floors": 4, "name": "東南大聯商行", "type": "東南亞食品雜貨", "sub": "東南亞食品・香料・零食・生活雜貨", "sea": true, "era": "old", "front": "open", "concept": "shop_dongnan_dalian", "note": "黃底紅字招牌（椰子樹、佛塔剪影）；墨綠帆布雨棚；整面開著、貨架塞滿；門口鐵網架、紅藍塑膠籃"},
    {"id": "keju", "side": "W", "z0": 20.5, "z1": 26.0, "floors": 5, "name": "客居雲南", "type": "雲南料理", "sub": "雲南料理・米干・過橋米線", "sea": true, "era": "mid", "front": "half", "concept": "shop_kejuyunnan", "note": "米色底酒紅字招牌（亭子、梯田）＋直立燈箱；酒紅帆布雨棚；騎樓下木桌圓凳；照片菜單"},
    {"id": "yuehaochi", "side": "W", "z0": 26.0, "z1": 32.0, "floors": 4, "name": "越好吃小館", "type": "越南料理", "sub": "越南料理・河粉・春捲", "sea": true, "era": "mid", "front": "glass", "concept": "shop_yuehaochi", "note": "酒紅底米白字招牌（河粉碗、斗笠）＋直立燈箱；深色木框玻璃、藤編吊燈；照片菜單、大盆栽"},
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
    {"id": "e_shoes", "side": "E", "z0": 19.0, "z1": 23.5, "floors": 5, "name": "鞋店", "type": "鞋店", "era": "mid", "front": "glass"},
    {"id": "e_cvs", "side": "E", "z0": 23.5, "z1": 28.0, "floors": 5, "name": "便利商店", "type": "便利商店", "era": "new", "front": "glass", "note": "沒有牌子的便利商店（D77）"},
    {"id": "e_market", "side": "E", "z0": 28.0, "z1": 40.0, "floors": 3, "name": "水源市場", "type": "市場", "era": "old", "front": "market", "note": "市場大樓臨汀州路的那一面：一樓攤位白天開、傍晚收一半，門口人多（使用者：水源市場附近人流較高）"}
  ],
  "fromGongguan": {"x": 27.0, "z": 0.0, "yaw": -1.5708, "note": "從公館的巷口進來站的地方（巷 A 東端，面向西＝汀州路）"},
  "toGongguan": {"x": 28.6, "z": 0.0, "r": 1.4, "label": "往公館（羅斯福路）", "spawn": {"x": 37.1, "z": 18.0, "yaw": 3.1416}, "note": "回公館：站在店面街 G10 巷口前的人行道，面向馬路"},
  "hours": {"night": {"from": 17, "to": 24, "note": "夜市攤（巷 A、水源市場門口）17:00 開始擺、24:00 收；白天是一般店面街"}}
};
