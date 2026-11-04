/* ===== 2:30 AM 室內（溫州街東端路口，取代兩點半 Café；AA 2026-11-04 v1；使用者 11-04 04:4x 參考圖；AA_654） =====
   參考圖：docs/story_planning/ref_images/shops/wz_230am_int.webp（室內）、wz_230am_ext.webp（外觀，LAWWW2 做）。美術規則：SCENE_RULES §10～12＋LAWWW2 11-04 04:45 的標準。
   **遊戲區域照舊是 `cafe`（zones3d.js 的 const cafe）**：房間、出口、劇情座位、吧檯、點餐點、窗邊吧台、沙發、傘桶、門鈴、班表都不動。
   座標和 tools/blender/env_second/cafe_layout.py 一樣（外觀和室內共用，LAWWW2 11-04 04:47 給的數字）：x −7～7、z −6～6、高 3.4；店面玻璃在 z＝+6，右牆 x＝+7 是轉角那一面（兩扇側窗）。
   這份只列 **2:30 AM 新加的東西**（給 LAWWW 補導航阻擋、互動），固定的東西照 cafe_layout.py、zones3d.js。
   參考圖的鏡頭站在門邊往裡面看：左邊臨街窗、右邊吧台、正前方拱門卡座。遊戲裡的對應：站在東邊（右牆側窗前）往西看——左手邊（+z）臨街玻璃＋窗邊吧台，右手邊（−z）後牆的吧檯，正前方（西牆）拱門卡座。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const CAFE230_LAYOUT = {
  version: 3,
  id: 'cafe230', zone: 'cafe', name: '2:30 AM', glb: 'assets/models/env/second_ai/aa_support/cafe230.glb',
  w: 14.0, d: 12.0, h: 3.4, floor: 'wood_light（D112：參考圖是中深色木地板，改淺色）',
  fixedFrom: 'tools/blender/env_second/cafe_layout.py（TABLES、BAR、SHELF、STOOLS＋STOOL4、FOUR_TOP、COUNTER、WC_STOOLS、SOFA、BOOKCASE、UMBRELLA、BELL、ROSTER、RIGHT_WINS、門窗）',
  added: [
    {kind: 'arch_alcove', x: -6.95, z0: -1.55, z1: 1.55, note: '西牆的木拱門（玻璃格子門框），裡面一張綠色皮卡座（沿西牆）、牆上三張舊照片、一盞吊燈'},
    {kind: 'banquette', x: -6.7, z: 0.0, w: 0.55, d: 2.6, note: '拱門裡的綠色皮卡座（直條紋靠背、兩顆抱枕）'},
    {kind: 'booth_table', x: -5.4, z: 0.0, r: 0.34, note: '卡座前的小圓桌（卡座前緣到桌邊 0.62 m）'},
    {kind: 'pastry_case', x: 0.4, z: -4.4, w: 1.1, note: '吧檯東端上的玻璃蛋糕櫃（三層）'},
    {kind: 'sign', side: 'back', along: -1.4, y: 2.9, w: 1.8, h: 0.45, note: '後牆吧檯上方的「2:30 AM」深綠金字招牌'},
    {kind: 'hours', side: 'back', along: -5.4, y: 2.55, w: 0.6, h: 0.3, note: '營業時間牌 11:00 – 02:30'},
    {kind: 'record_player', x: 4.1, z: -5.65, note: '後牆書牆中段的唱盤＋一格黑膠'},
    {kind: 'plant_moved', from: [-6.35, 0.4], to: [-6.35, 1.95], note: '原本西牆中間的大盆栽移到拱門北邊，讓出拱門'}
  ],
  blocks: [
    [-6.56, 0.0, 0.9, 2.6], [-5.4, 0.0, 0.7, 0.7],
    [6.3, 3.85, 0.8, 0.8], [6.45, 2.95, 0.55, 0.55], [6.3, -4.65, 0.8, 0.8], [6.5, -3.85, 0.55, 0.55], [6.82, 1.5, 0.36, 2.2], [6.82, -2.5, 0.36, 2.2]   // v1c 窗邊：單人沙發 A、小圓桌 A、單人沙發 B、小圓桌 B、兩條窗台桌（見 lounge）   // 卡座 LAWWW 11-04 照 cafe230.glb 實測改：原本 [−6.7, 0, 0.6, 2.6] 只擋到 x −6.4，GLB 坐墊前緣在 −6.13（人會踩進沙發）；現在 x −7.01～−6.11
  ],
  seats: [
    {x: -6.3, z: -0.55, yaw: Math.PI / 2, table: 'booth', seatH: 0.45, label: '坐卡座', ap: [-5.65, -0.95], note: '新加；從桌子南北兩側走進去（LAWWW2：卡座前 ≥ 0.6 m，最近的互動要是它自己）。LAWWW 11-04 照 cafe230.glb 實測改（CC seats_on_furniture、reachability_all）：x −6.55→−6.3（原本在靠背上、量到 1.05 m；GLB 坐墊 x −6.52～−6.13、座面 0.48）；ap＝走近點（卡座前緣到小圓桌只有 0.35 m，人站不進去，從桌子南北側走近）'},
    {x: -6.3, z: 0.55, yaw: Math.PI / 2, table: 'booth', seatH: 0.45, label: '坐卡座', ap: [-5.65, 0.95]},
    {x: -4.65, z: 0.0, yaw: -Math.PI / 2, table: 'booth', label: '坐下'},
    {x: 6.3, z: 3.85, yaw: -Math.PI / 2 - 0.35, table: 'lounge', seatH: 0.45, label: '坐沙發椅', ap: [5.5, 3.65], tag: 'sofa', note: 'v1c 新加：窗邊灰色單人沙發（北，有毛毯），斜對窗；可以「點杯咖啡慢慢讀」'},
    {x: 6.3, z: -4.65, yaw: -Math.PI / 2 + 0.35, table: 'lounge', seatH: 0.45, label: '坐沙發椅', ap: [5.5, -4.45], tag: 'sofa', note: 'v1c 新加：窗邊灰色單人沙發（南）'}
  ],
  lounge: {
    note: 'v1c（BB 11-04 07:33 遊戲內截圖第 3 點：參考圖窗邊是灰色單人沙發、桌燈、毛毯、小圓桌，是整間店的主視覺）：放在右牆側窗那一邊，固定的桌椅都不動',
    chairs: [{x: 6.3, z: 3.85, yaw: -Math.PI / 2 - 0.35, blanket: true}, {x: 6.3, z: -4.65, yaw: -Math.PI / 2 + 0.35}],
    tables: [{x: 6.45, z: 2.95, lamp: true}, {x: 6.5, z: -3.85}],
    consoles: [{z0: -3.6, z1: -1.4, note: '右牆南窗下（z −2.5 那扇）'}, {z0: 0.4, z1: 2.6, note: '右牆北窗下（z 1.5 那扇）'}]
  },
  v1c: '（BB 11-04 07:33 遊戲內截圖五項）書牆改成高書櫃＋中間矮唱片櫃＋高書櫃，書一本一本做（高低厚薄、倒著、平放、相框、小盆栽、黑膠、空位）；三盆大植物換成琴葉榕（藤籃）、虎尾蘭（黑陶盆）、大葉盆栽（赤陶盆）；窗邊兩張灰色單人沙發＋小圓桌＋檯燈＋毛毯、兩條窗台桌；天花板改外露淺色水泥（大梁、小梁、方形風管、管線、冷氣、軌道燈），吊燈改深色舊黃銅；吧檯後面層架改成隨機間距、成群擺、有空位。',
  v1b: '（LAWWW2 11-04 05:00 退回五項）下半部胡桃木護牆板 1.0 m＋木條、天花板改深色木、吧檯上方 6 盞吊燈、後牆層架多一層酒瓶、每層 30 件、三串黃金葛、四人桌下的舊地毯、牆上三個框畫。東牆兩扇側窗之間的扶手椅沒放：那裡是固定的大盆栽 (6.35,−0.5)。家具位置、block 都沒變。',
  seatPlan: {
    note: 'LAWWW 11-04 FIXED_COORDS §1、§7-4 問的，AA 定：座位位置和順序都不改（照 zones3d.js 現在的 17 個）',
    bar: '吧檯高腳椅 10～13 號開放玩家坐，可以讀書（「點杯咖啡慢慢讀」也認）：tag bar。參考圖的吧台是坐人的。',
    longTableEnds: '長桌兩端 8、9 號開放玩家坐（一般坐下，可以讀書）。',
    sofa: '沙發 14～16 號 tag sofa；店內偶遇以安「她坐在沙發那一區」請讓這一句挑沙發（偶遇挑位子不要排除 sofa 標記的那一句）。',
    door: '進門落點 (0,5) 前面不放任何地上的東西（v1b 的地毯在四人桌下面，離門 3 m 以上）。'
  },
  interact: [
    {x: 4.1, z: -5.0, kind: 'record', label: '看唱片', note: '書牆中段的唱盤'},
    {x: 1.4, z: -3.65, kind: 'pastry', label: '看蛋糕櫃', note: '吧檯東端外面（不和吧檯椅 (0.3, −3.3) 搶互動）'}
  ]
};
if (typeof module !== 'undefined') module.exports = CAFE230_LAYOUT;
