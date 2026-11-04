/* ===== afar café 室內（公館店面街 G07，取代「咖啡・輕食」；AA 2026-11-04 v1；使用者 11-04 02:0x 新店名、02:2x 新版參考圖；AA_650） =====
   參考圖：docs/story_planning/ref_images/shops/gongguan_afar_int.webp（室內）、gongguan_afar_ext.webp（外觀，LAWWW2 做）。美術規則：SCENE_RULES §10～12。
   門窗照 LAWWW2 外觀（DOORS.md，ccc8996a9）：店寬 10.2、大窗 x −3.9～1.75（窗台 0.73、窗頂 2.68）、木框玻璃門 x 1.8～3.35（高 2.82）。
   座標：房間中心在原點，x 往東（從騎樓看過去左→右）、z 往南、y 往上；店面（臨羅斯福路）在 +z（z＝d/2）；公尺。格式照 src/data/wz_shops_layout.js 開頭的說明。
   參考圖的鏡頭站在東端（門邊）往西看：左手邊（+z）臨街大窗＋窗邊長桌（檯燈、灰色布椅），中間一排胡桃木方桌，右手邊（−z）後牆的靠牆小桌＋灰色扶手椅，
   正前方（西）吧台：深綠隔牆上「afar」字、層板（咖啡罐、杯子、豆袋）、咖啡機、甜點櫃、黑板菜單，左邊一座書架；吧台右邊往裡面還有一塊（卡座＋小圓桌）。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const AFAR_LAYOUT = {
  version: 1,
  id: 'afar', zone: 'afar', name: 'afar café', glb: 'assets/models/env/second_ai/aa_support/afar.glb',
  w: 10.2, d: 8.0, h: 3.7, floorY: 0, floor: 'terrazzo_grey', wallColor: '#eee6d6',
  note: '店面 10.2 m 寬（臨街）、8 m 深、3.7 m 高（騎樓天花板 3.85）。外露的天花板（管線、冷氣、軌道燈）、淺灰磨石子地板（D112）、米白牆＋深綠腰牆、胡桃木家具。西邊一道深綠隔牆，前面是吧台；隔牆後面是工作區（不開放）。',
  front: {door: {x: 2.575, w: 1.55, h: 2.82}, windows: [[-3.9, 1.75]], sill: 0.73, head: 2.68,
          note: '照 LAWWW2 外觀：大窗 x −3.9～1.75（木框分格）、木框玻璃門 x 1.8～3.35；x −5.1～−3.9 深綠牆、x 3.35～5.1 牆（外面掛黑板菜單和壁燈）'},
  spawn: {x: 2.575, z: 3.3, yaw: Math.PI},
  exit: {at: {x: 2.575, z: 3.7}, label: '離開 afar', to: 'gongguan', note: 'spawn 回公館（店門口；LAWWW 接）'},
  enterAt: null,
  items: [
    {kind: 'partition', x: -3.4, z0: -1.6, z1: 4.0, note: '深綠隔牆（到天花板），吧台後面；上面「afar」字、三層層板（咖啡罐、杯子、豆袋）；後面是工作區'},
    {kind: 'bar', x: -2.4, z: 0.3, w: 0.65, d: 3.2, h: 1.05, note: '吧台（沿 z 長 3.2 m；胡桃木直紋正面、淺色石材檯面、南端圓角）：咖啡機、磨豆機、手沖架、甜點櫃、收銀機'},
    {kind: 'menu_board', x: -3.36, y: 2.3, z: -0.9, w: 0.9, h: 0.9, note: '黑板菜單（afar COFFEE MENU）掛在隔牆南段'},
    {kind: 'bookshelf', x: -3.2, z: 3.0, w: 1.1, d: 0.35, h: 2.3, ry: Math.PI / 2, note: '吧台左邊、窗邊的書架（上面書、下面雜誌斜架），上面垂黃金葛'},
    {kind: 'window_counter', x: -0.675, z: 3.65, w: 4.45, d: 0.5, h: 0.75, note: '窗邊長桌（六張灰色布椅、四盞黃銅檯燈、插座）'},
    {kind: 'wall_desk', x: 3.6, z: -3.7, w: 1.0, d: 0.5}, {kind: 'wall_desk', x: 1.8, z: -3.7, w: 1.0, d: 0.5},
    {kind: 'wall_desk', x: 0.0, z: -3.7, w: 1.0, d: 0.5}, {kind: 'wall_desk', x: -1.8, z: -3.7, w: 1.0, d: 0.5},
    {kind: 'banquette', x: -4.85, z: -2.85, w: 0.5, d: 2.1, note: '吧台右邊裡面那一塊：西牆的灰色布面卡座'},
    {kind: 'painting', side: 'back', along: 2.7, y: 1.95, w: 0.6, h: 0.75}, {kind: 'painting', side: 'back', along: 0.9, y: 1.95, w: 0.6, h: 0.75},
    {kind: 'painting', side: 'back', along: -0.9, y: 1.95, w: 0.6, h: 0.75},
    {kind: 'plant_big', x: -2.95, z: -1.95}, {kind: 'plant_big', x: -3.0, z: -3.75}, {kind: 'plant_big', x: 4.75, z: -3.0}
  ],
  tables: [
    {id: 1, kind: 'rect', x: 2.6, z: 0.9, w: 0.8, d: 1.0, note: '中間胡桃木方桌（前景；四人）'},
    {id: 2, kind: 'rect', x: 0.9, z: 0.9, w: 0.8, d: 1.0, note: '中間方桌二（四人）'},
    {id: 3, kind: 'rect', x: -0.8, z: 0.9, w: 0.8, d: 1.0, note: '中間方桌三（四人，靠吧台）'},
    {id: 4, kind: 'round', x: -4.15, z: -2.3, r: 0.3, note: '卡座小圓桌一'},
    {id: 5, kind: 'round', x: -4.15, z: -3.4, r: 0.3, note: '卡座小圓桌二'}
  ],
  blocks: [
    [-4.25, 1.2, 1.7, 5.6],
    [-2.4, 0.3, 0.65, 3.2], [-3.2, 3.0, 0.35, 1.1], [-0.675, 3.65, 4.45, 0.5],
    [3.6, -3.7, 1.0, 0.5], [1.8, -3.7, 1.0, 0.5], [0.0, -3.7, 1.0, 0.5], [-1.8, -3.7, 1.0, 0.5],
    [-4.85, -2.85, 0.5, 2.1],
    [2.6, 0.9, 0.82, 1.02], [0.9, 0.9, 0.82, 1.02], [-0.8, 0.9, 0.82, 1.02], [-4.15, -2.3, 0.62, 0.62], [-4.15, -3.4, 0.62, 0.62],
    [-2.95, -1.95, 0.55, 0.55], [-3.0, -3.75, 0.5, 0.5], [4.75, -3.0, 0.55, 0.55]
  ],
  walkNote: '店門 (2.575, 4.0) 進來：往西沿窗邊椅子後面 z 2.0～2.8，或中間方桌和靠牆小桌之間 z −2.9～0.1（寬 3 m）；吧台前 x −2.0～−1.0；吧台南端繞過去是裡面的卡座區（x −5.1～−3.4、z −4～−1.6）。隔牆後面（x −5.1～−3.4、z −1.6～4.0）是工作區，不開放。',
  seats: [
    {x: -2.5, z: 3.1, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'}, {x: -1.7, z: 3.1, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'},
    {x: -0.9, z: 3.1, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'}, {x: -0.1, z: 3.1, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'},
    {x: 0.7, z: 3.1, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'}, {x: 1.4, z: 3.1, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'},
    {x: 3.15, z: 0.65, yaw: -Math.PI / 2, table: 1, canStudy: true, label: '坐下'}, {x: 3.15, z: 1.15, yaw: -Math.PI / 2, table: 1, canStudy: true, label: '坐下'},
    {x: 2.05, z: 0.65, yaw: Math.PI / 2, table: 1, canStudy: true, label: '坐下'}, {x: 2.05, z: 1.15, yaw: Math.PI / 2, table: 1, canStudy: true, label: '坐下'},
    {x: 1.45, z: 0.65, yaw: -Math.PI / 2, table: 2, canStudy: true, label: '坐下'}, {x: 1.45, z: 1.15, yaw: -Math.PI / 2, table: 2, canStudy: true, label: '坐下'},
    {x: 0.35, z: 0.65, yaw: Math.PI / 2, table: 2, canStudy: true, label: '坐下'}, {x: 0.35, z: 1.15, yaw: Math.PI / 2, table: 2, canStudy: true, label: '坐下'},
    {x: -0.25, z: 0.65, yaw: -Math.PI / 2, table: 3, canStudy: true, label: '坐下'}, {x: -0.25, z: 1.15, yaw: -Math.PI / 2, table: 3, canStudy: true, label: '坐下'},
    {x: -1.35, z: 0.65, yaw: Math.PI / 2, table: 3, canStudy: true, label: '坐下'}, {x: -1.35, z: 1.15, yaw: Math.PI / 2, table: 3, canStudy: true, label: '坐下'},
    {x: 3.6, z: -3.15, yaw: Math.PI, table: 7, canStudy: true, label: '坐靠牆的位子'}, {x: 1.8, z: -3.15, yaw: Math.PI, table: 8, canStudy: true, label: '坐靠牆的位子'},
    {x: 0.0, z: -3.15, yaw: Math.PI, table: 9, canStudy: true, label: '坐靠牆的位子'}, {x: -1.8, z: -3.15, yaw: Math.PI, table: 10, canStudy: true, label: '坐靠牆的位子'},
    {x: -4.65, z: -2.3, yaw: Math.PI / 2, table: 4, seatH: 0.45, canStudy: true, label: '坐卡座'}, {x: -3.6, z: -2.3, yaw: -Math.PI / 2, table: 4, canStudy: true, label: '坐下'},
    {x: -4.65, z: -3.4, yaw: Math.PI / 2, table: 5, seatH: 0.45, canStudy: true, label: '坐卡座'}, {x: -3.6, z: -3.4, yaw: -Math.PI / 2, table: 5, canStudy: true, label: '坐下'}
  ],
  interact: [
    {x: -1.75, z: 1.4, kind: 'order', label: '點咖啡', note: '吧台中段；店員在吧台後面'},
    {x: -1.7, z: -0.8, kind: 'pastry', label: '看甜點櫃'},
    {x: -2.6, z: 2.4, kind: 'bookshelf', label: '看看書架'},
    {x: -1.7, z: -0.3, kind: 'menu', label: '看菜單', note: '隔牆上的黑板'}
  ],
  floorSit: [],
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = AFAR_LAYOUT;
