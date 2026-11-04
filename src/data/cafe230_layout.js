/* ===== 2:30 AM 室內（溫州街東端路口，取代兩點半 Café；AA 2026-11-04 v1；使用者 11-04 04:4x 參考圖；AA_654） =====
   參考圖：docs/story_planning/ref_images/shops/wz_230am_int.webp（室內）、wz_230am_ext.webp（外觀，LAWWW2 做）。美術規則：SCENE_RULES §10～12＋LAWWW2 11-04 04:45 的標準。
   **遊戲區域照舊是 `cafe`（zones3d.js 的 const cafe）**：房間、出口、劇情座位、吧檯、點餐點、窗邊吧台、沙發、傘桶、門鈴、班表都不動。
   座標和 tools/blender/env_second/cafe_layout.py 一樣（外觀和室內共用，LAWWW2 11-04 04:47 給的數字）：x −7～7、z −6～6、高 3.4；店面玻璃在 z＝+6，右牆 x＝+7 是轉角那一面（兩扇側窗）。
   這份只列 **2:30 AM 新加的東西**（給 LAWWW 補導航阻擋、互動），固定的東西照 cafe_layout.py、zones3d.js。
   參考圖的鏡頭站在門邊往裡面看：左邊臨街窗、右邊吧台、正前方拱門卡座。遊戲裡的對應：站在東邊（右牆側窗前）往西看——左手邊（+z）臨街玻璃＋窗邊吧台，右手邊（−z）後牆的吧檯，正前方（西牆）拱門卡座。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const CAFE230_LAYOUT = {
  version: 1,
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
    [-6.7, 0.0, 0.6, 2.6], [-5.4, 0.0, 0.7, 0.7]
  ],
  seats: [
    {x: -6.55, z: -0.55, yaw: Math.PI / 2, table: 'booth', seatH: 0.45, label: '坐卡座', note: '新加；從桌子南北兩側走進去（LAWWW2：卡座前 ≥ 0.6 m，最近的互動要是它自己）'},
    {x: -6.55, z: 0.55, yaw: Math.PI / 2, table: 'booth', seatH: 0.45, label: '坐卡座'},
    {x: -4.65, z: 0.0, yaw: -Math.PI / 2, table: 'booth', label: '坐下'}
  ],
  interact: [
    {x: 4.1, z: -5.0, kind: 'record', label: '看唱片', note: '書牆中段的唱盤'},
    {x: 1.4, z: -3.65, kind: 'pastry', label: '看蛋糕櫃', note: '吧檯東端外面（不和吧檯椅 (0.3, −3.3) 搶互動）'}
  ]
};
if (typeof module !== 'undefined') module.exports = CAFE230_LAYOUT;
