/* ===== Daybreak 室內（公館店面街 G14，取代「早午餐」；AA 2026-11-04 v1；使用者 11-04 02:0x 新店名、02:2x 參考圖；AA_650） =====
   參考圖：docs/story_planning/ref_images/shops/gongguan_daybreak_int.webp（室內）、gongguan_daybreak_ext.webp（外觀，LAWWW2 做）。美術規則：SCENE_RULES §10～12。
   門窗照 LAWWW2 外觀（DOORS.md，ccc8996a9）：店寬 9.0、大窗 x −3.31～1.48（窗台 0.76、窗頂 2.53，灰綠框）、灰綠框玻璃門 x 1.6～2.73（高 2.43）、側窗 x 2.73～3.07。
   座標：房間中心在原點，x 往東（從騎樓看過去左→右）、z 往南、y 往上；店面（臨羅斯福路）在 +z（z＝d/2）；公尺。格式照 src/data/wz_shops_layout.js 開頭的說明。
   參考圖的鏡頭站在東端（門邊）往西看：左手邊（+z）臨街大窗＋窗邊兩人桌，中間淺木四人桌，正前方偏右是沿後牆的長吧台（綠磁磚牆、層板、咖啡機、甜點櫃、Pick Up 牌、黑板），
   右手邊（−z）後牆前面綠色卡座＋兩張小桌、牆上「Daybreak」字和黃色山丘；最裡面（西）一張長桌、牆上三張早午餐插畫。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const DAYBREAK_LAYOUT = {
  version: 2,
  id: 'daybreak', zone: 'daybreak', name: 'Daybreak', glb: 'assets/models/env/second_ai/aa_support/daybreak.glb',
  w: 9.0, d: 8.0, h: 3.7, floorY: 0, floor: 'terrazzo_light', wallColor: '#f3ede2',
  note: '店面 9 m 寬（臨街）、8 m 深、3.7 m 高（騎樓天花板 3.85）。白色天花板＋梁＋嵌燈、淺色磨石子地板（D112）、米白牆、淺色橡木家具、灰綠窗框、綠磁磚、木編吊燈。',
  front: {door: {x: 2.165, w: 1.13, h: 2.43}, windows: [[-3.31, 1.48], [2.73, 3.07]], sill: 0.76, head: 2.53,
          note: '照 LAWWW2 外觀：大窗 x −3.31～1.48（窗台下黃色小方磚腰牆在外面）、門 x 1.6～2.73、側窗 x 2.73～3.07；x 3.07～4.5 牆（外面掛菜單板）'},
  spawn: {x: 2.165, z: 3.3, yaw: Math.PI},
  exit: {at: {x: 2.165, z: 3.7}, label: '離開 Daybreak', to: 'gongguan', note: 'spawn 回公館（店門口；LAWWW 接）'},
  enterAt: null,
  items: [
    {kind: 'counter', x: -2.4, z: -2.85, w: 4.0, d: 0.7, h: 1.0, note: '沿後牆的長吧台（淺色橡木直紋、淺色石材檯面、檯面下燈條）：咖啡機、磨豆機、甜點櫃、收銀機、Pick Up 牌'},
    {kind: 'tile_wall', x0: -4.5, x1: -1.2, note: '吧台後面的綠磁磚牆（0.9～2.9 m）、兩層木層板（碗盤、杯子、罐子）、不鏽鋼抽油煙機'},
    {kind: 'menu_board', side: 'back', along: -0.75, y: 2.15, w: 0.8, h: 0.95, note: '黑板（Daybreak：Brunch、Plates、Sandwiches、Salads、Drinks、Sweets）'},
    {kind: 'banquette', x: 1.3, z: -3.72, w: 2.9, d: 0.55, note: '後牆前面的綠色卡座（直條紋靠背、黃色抱枕）'},
    {kind: 'mural', side: 'back', along: 1.3, y: 2.25, w: 3.2, h: 1.6, note: '牆上「Daybreak BRUNCH & COFFEE」字＋太陽＋黃色山丘'},
    {kind: 'art', side: 'left', along: 2.1, y: 1.9, w: 0.6, h: 0.6}, {kind: 'art', side: 'left', along: 1.2, y: 1.9, w: 0.6, h: 0.6},
    {kind: 'art', side: 'left', along: 0.3, y: 1.9, w: 0.6, h: 0.6},
    {kind: 'mat', x: 2.165, z: 2.9, w: 1.4, d: 0.9, note: '門口的草編腳踏墊'},
    {kind: 'plant_big', x: -4.15, z: 3.55}, {kind: 'plant_big', x: -4.15, z: -1.5}, {kind: 'plant_big', x: 3.55, z: -3.55}
  ],
  tables: [
    {id: 1, kind: 'small', x: -2.6, z: 3.45, w: 0.6, d: 0.6, note: '窗邊兩人桌一'},
    {id: 2, kind: 'small', x: -1.05, z: 3.45, w: 0.6, d: 0.6, note: '窗邊兩人桌二'},
    {id: 3, kind: 'small', x: 0.5, z: 3.45, w: 0.6, d: 0.6, note: '窗邊兩人桌三'},
    {id: 4, kind: 'rect', x: 1.6, z: 1.0, w: 1.2, d: 0.8, note: '中間四人桌（前景）'},
    {id: 5, kind: 'rect', x: -1.1, z: 0.9, w: 1.2, d: 0.8, note: '中間四人桌二'},
    {id: 6, kind: 'long', x: -3.75, z: 0.9, w: 0.8, d: 1.9, note: '最裡面的長桌（v2：西側中間那張拿掉，五人；西牆到桌子只有 0.34 m，LAWWW2 11-04 04:16）'},
    {id: 7, kind: 'pedestal', x: 0.6, z: -3.05, w: 0.65, d: 0.6, note: '卡座小桌一（灰綠桌腳）'},
    {id: 8, kind: 'pedestal', x: 2.05, z: -3.05, w: 0.65, d: 0.6, note: '卡座小桌二'}
  ],
  blocks: [
    [-2.4, -2.85, 4.0, 0.7], [-2.45, -3.7, 4.1, 0.6],
    [1.3, -3.72, 2.9, 0.55],
    [-2.6, 3.45, 0.62, 0.62], [-1.05, 3.45, 0.62, 0.62], [0.5, 3.45, 0.62, 0.62],
    [1.6, 1.0, 1.22, 0.82], [-1.1, 0.9, 1.22, 0.82], [-3.75, 0.9, 0.82, 1.92],
    [0.6, -3.05, 0.67, 0.62], [2.05, -3.05, 0.67, 0.62],
    [-4.15, 3.55, 0.55, 0.55], [-4.15, -1.5, 0.55, 0.55], [3.55, -3.55, 0.55, 0.55]
  ],
  walkNote: '店門 (2.165, 4.0) 進來：中間走道 z −1.9～0.2（吧台前、卡座小桌前面），窗邊兩人桌和中間四人桌之間 z 1.6～2.9；吧台後面 z −3.5～−3.2 是店員（不開放，第二個 block）。',
  seats: [
    {x: -3.05, z: 3.45, yaw: Math.PI / 2, table: 1, canStudy: true, label: '坐窗邊'}, {x: -2.15, z: 3.45, yaw: -Math.PI / 2, table: 1, canStudy: true, label: '坐窗邊'},
    {x: -1.5, z: 3.45, yaw: Math.PI / 2, table: 2, canStudy: true, label: '坐窗邊'}, {x: -0.6, z: 3.45, yaw: -Math.PI / 2, table: 2, canStudy: true, label: '坐窗邊'},
    {x: 0.05, z: 3.45, yaw: Math.PI / 2, table: 3, canStudy: true, label: '坐窗邊'}, {x: 0.95, z: 3.45, yaw: -Math.PI / 2, table: 3, canStudy: true, label: '坐窗邊'},
    {x: 1.3, z: 1.55, yaw: Math.PI, table: 4, canStudy: true, label: '坐下'}, {x: 1.9, z: 1.55, yaw: Math.PI, table: 4, canStudy: true, label: '坐下'},
    {x: 1.3, z: 0.45, yaw: 0, table: 4, canStudy: true, label: '坐下'}, {x: 1.9, z: 0.45, yaw: 0, table: 4, canStudy: true, label: '坐下'},
    {x: -1.4, z: 1.45, yaw: Math.PI, table: 5, canStudy: true, label: '坐下'}, {x: -0.8, z: 1.45, yaw: Math.PI, table: 5, canStudy: true, label: '坐下'},
    {x: -1.4, z: 0.35, yaw: 0, table: 5, canStudy: true, label: '坐下'}, {x: -0.8, z: 0.35, yaw: 0, table: 5, canStudy: true, label: '坐下'},
    {x: -4.2, z: 0.3, yaw: Math.PI / 2, table: 6, canStudy: true, label: '坐長桌'},
    {x: -4.2, z: 1.5, yaw: Math.PI / 2, table: 6, canStudy: true, label: '坐長桌'}, {x: -3.3, z: 0.3, yaw: -Math.PI / 2, table: 6, canStudy: true, label: '坐長桌'},
    {x: -3.3, z: 0.9, yaw: -Math.PI / 2, table: 6, canStudy: true, label: '坐長桌'}, {x: -3.3, z: 1.5, yaw: -Math.PI / 2, table: 6, canStudy: true, label: '坐長桌'},
    {x: 0.6, z: -3.5, yaw: 0, table: 7, seatH: 0.45, canStudy: true, label: '坐卡座'}, {x: 0.6, z: -2.5, yaw: Math.PI, table: 7, canStudy: true, label: '坐下'},
    {x: 2.05, z: -3.5, yaw: 0, table: 8, seatH: 0.45, canStudy: true, label: '坐卡座'}, {x: 2.05, z: -2.5, yaw: Math.PI, table: 8, canStudy: true, label: '坐下'}
  ],
  interact: [
    {x: -0.9, z: -2.1, kind: 'order', label: '點餐', note: '吧台東段；收銀機旁邊'},
    {x: -2.9, z: -2.1, kind: 'pastry', label: '看甜點櫃'},
    {x: -1.75, z: -2.1, kind: 'menu', label: '看菜單', note: '後牆的黑板'}
  ],
  floorSit: [],
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = DAYBREAK_LAYOUT;
