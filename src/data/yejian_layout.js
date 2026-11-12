/* ===== 頁間書屋 室內（公館店面街 G02，取代舊路書房；AA 2026-11-04 v1，使用者 11-04 01:0x 新店名、新外觀、新室內圖；AA_647） =====
   參考圖：docs/story_planning/ref_images/shops/gongguan_book_int.webp（室內）、gongguan_book_ext.webp（外觀，LAWWW2 做）。美術規則：SCENE_RULES §10～12。
   遊戲區域照舊是 `bookstore`（內部 id 不改；名字顯示「頁間書屋」）；這份給遊戲（導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/aa_support/yejian_interior.py）共用。
   座標：房間中心在原點，x 往東、z 往南、y 往上；店面（臨羅斯福路的窗和門）在 +z（z＝d/2）；公尺。格式照 src/data/wz_shops_layout.js 開頭的說明。
   參考圖的鏡頭站在店門（西端）往東看：左手邊（北、−z）整面書牆＋梯子，右手邊（南、+z）臨街的窗和窗邊長桌，正前方（東）咖啡吧和沙發角。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const YEJIAN_LAYOUT = {
  version: 3,   /* v2（2026-11-04，LAWWW2 退回 v1 七點）：閱讀桌往書牆靠（z 0.2 → −1.9）、窗邊改長吧台＋高腳椅、窗前兩座斜面書架、咖啡吧加長、沙發移到咖啡吧北邊；blocks、seats 跟著改 */
  id: 'yejian', zone: 'bookstore', name: '頁間書屋', glb: 'assets/models/env/second_ai/aa_support/yejian.glb',
  w: 12.0, d: 10.0, h: 3.8, floorY: 0, floor: 'terrazzo_light', wallColor: '#efe6d6',
  note: '店面 12 m 寬、10 m 深、3.8 m 高（騎樓一樓 4.2 m）。北牆整面頂天書牆（類別牌：文學・小說、散文・人文、法律、歷史、藝術・設計、大學生活）＋一座滑軌梯子；臨街一排木框大窗，窗下一條窗邊長桌（黃銅檯燈）；中間兩張閱讀桌；東邊咖啡吧（濃縮咖啡機、蛋糕櫃、手寫菜單黑板）＋沙發角（落地燈、茶几、地毯）；窗邊一座斜放的新書架。地板淺色磨石子（D112），家具淺色橡木，黃銅吊燈、軌道燈、外露風管。',
  front: {door: {x: -4.6, w: 1.1, h: 2.4}, windows: [[-3.6, 5.6]], sill: 0.55, head: 2.85, note: '門在西端（外觀圖：左邊木門、右邊整片窗）；窗框淺木、窗上一條小燈串和明信片（外觀圖）'},
  spawn: {x: -4.6, z: 4.1, yaw: Math.PI},
  exit: {at: {x: -4.6, z: 4.6}, label: '離開頁間書屋', to: 'gongguan', note: 'spawn 回公館照舊（zones3d.js 的 bookstore 出口；店門口互動點 LAWWW 照新門的位置調）'},
  enterAt: null,
  items: [
    {kind: 'bookwall', x: 0.0, z: -4.78, w: 12.0, d: 0.44, h: 3.3, ry: 0, note: '北牆整面書牆（下面 0.8 m 是有門的矮櫃，上面七層書）；類別牌掛在每一段的第二層'},
    {kind: 'ladder', x: -1.2, z: -4.3, rail: 3.4, note: '滑軌梯子（靠在書牆上，頂端掛在 3.4 m 的鐵軌）'},
    {kind: 'window_counter', x: 1.0, z: 4.68, w: 9.0, d: 0.55, h: 1.05, note: 'v2：窗邊長吧台（高 1.05，高腳椅；四盞黃銅檯燈、攤開的書、乾燥花）'},
    {kind: 'reading_table', x: -2.1, z: -1.9, w: 1.7, d: 0.95, h: 0.75, note: '閱讀桌一（四人；中間一盆黃金葛、兩本書、一杯咖啡）'},
    {kind: 'reading_table', x: 1.0, z: -1.9, w: 1.7, d: 0.95, h: 0.75, note: '閱讀桌二（四人；筆記、攤開的書）'},
    {kind: 'display_rack', x: -0.6, z: 2.3, w: 2.0, d: 0.55, h: 1.15, note: 'v2：窗前中段第一座斜面書架（雜誌，面向北）'}, {kind: 'display_rack', x: 2.4, z: 2.3, w: 2.0, d: 0.55, h: 1.15, note: 'v2：第二座（新書推薦，面向北）'},
    {kind: 'cafe_counter', x: 4.65, z: 0.6, w: 0.75, d: 4.2, h: 1.0, note: '咖啡吧（面向西；檯面上蛋糕玻璃櫃、濃縮咖啡機、磨豆機、手沖架、收銀機）；後牆層板放罐子、杯子；手寫菜單黑板掛在東牆'},
    {kind: 'sofa', x: 4.3, z: -4.05, w: 1.8, d: 0.85, note: 'v3b：往北 0.2 m（LAWWW2 11-04 03:34，導航格）；沙發角：雙人沙發（面向南）＋茶几＋落地燈＋圓地毯'},
    {kind: 'coffee_table', x: 4.3, z: -2.25, w: 0.9, d: 0.55, h: 0.42, note: 'v3：往南移 0.6 m，沙發前留 0.9 m（LAWWW2 11-04 03:12）'},
    {kind: 'floor_lamp', x: 3.1, z: -4.05},
    {kind: 'plant_big', x: -5.45, z: 2.0}, {kind: 'plant_big', x: 5.5, z: 4.3}, {kind: 'plant_big', x: 5.55, z: -2.2},
    {kind: 'postcards', note: '窗上一條麻繩夾著明信片（外觀圖），窗邊吊兩盞白色燈罩'}
  ],
  blocks: [
    [0.0, -4.78, 12.0, 0.46], [-1.2, -4.3, 0.5, 0.5],
    [1.0, 4.68, 9.0, 0.56],
    [-2.1, -1.9, 1.7, 0.95], [1.0, -1.9, 1.7, 0.95],
    [-0.6, 2.3, 2.0, 0.55], [2.4, 2.3, 2.0, 0.55],
    [4.65, 0.6, 0.77, 4.2], [5.85, 0.6, 0.3, 4.4],
    [4.3, -4.05, 1.8, 0.85], [4.3, -2.25, 0.9, 0.55], [3.1, -4.05, 0.4, 0.4],
    [-5.45, 2.0, 0.6, 0.6], [5.5, 4.3, 0.6, 0.6], [5.55, -2.2, 0.5, 0.5]
  ],
  walkNote: 'v2：店門 (−4.6, 4.6) 進來：中間走道 z −0.85～1.95（閱讀桌的椅子和斜面書架之間 2.8 m）往東到咖啡吧；書牆前 z −4.55～−2.95；斜面書架和高腳椅之間 z 2.6～3.8；咖啡吧前 x 3.3～4.25（店員在 x 5.05～5.7）。',
  seats: [
    {x: -2.6, z: -2.7, yaw: 0, table: 1, canStudy: true, label: '坐下'}, {x: -1.6, z: -2.7, yaw: 0, table: 1, canStudy: true, label: '坐下'},
    {x: -2.6, z: -1.1, yaw: Math.PI, table: 1, canStudy: true, label: '坐下'}, {x: -1.6, z: -1.1, yaw: Math.PI, table: 1, canStudy: true, label: '坐下'},
    {x: 0.5, z: -2.7, yaw: 0, table: 2, canStudy: true, label: '坐下'}, {x: 1.5, z: -2.7, yaw: 0, table: 2, canStudy: true, label: '坐下'},
    {x: 0.5, z: -1.1, yaw: Math.PI, table: 2, canStudy: true, label: '坐下'}, {x: 1.5, z: -1.1, yaw: Math.PI, table: 2, canStudy: true, label: '坐下'},
    {x: -2.8, z: 4.05, yaw: 0, table: 3, seatH: 0.75, canStudy: true, label: '坐窗邊'}, {x: -1.6, z: 4.05, yaw: 0, table: 3, seatH: 0.75, canStudy: true, label: '坐窗邊'},
    {x: -0.4, z: 4.05, yaw: 0, table: 3, seatH: 0.75, canStudy: true, label: '坐窗邊'}, {x: 0.8, z: 4.05, yaw: 0, table: 3, seatH: 0.75, canStudy: true, label: '坐窗邊'},
    {x: 2.0, z: 4.05, yaw: 0, table: 3, seatH: 0.75, canStudy: true, label: '坐窗邊'}, {x: 3.2, z: 4.05, yaw: 0, table: 3, seatH: 0.75, canStudy: true, label: '坐窗邊'},
    {x: 3.9, z: -3.85, yaw: 0, table: 4, seatH: 0.42, canStudy: true, label: '坐沙發'}, {x: 4.7, z: -3.85, yaw: 0, table: 4, seatH: 0.42, canStudy: true, label: '坐沙發'}
  ],
  interact: [
    {x: -4.0, z: -3.9, kind: 'shelf_law', label: '看看法律書與文具', note: '原本 bookstore 的「看看法律書與文具」（shop:\'book\'，買書照舊）'},
    {x: 0.5, z: -3.75, kind: 'shelf_browse', label: '看看書牆'},
    {x: 2.4, z: 1.75, kind: 'new_books', label: '看新書'},
    {x: 3.85, z: 0.6, kind: 'cafe_order', label: '點咖啡', note: '店員站在咖啡吧後面 x 5.0～5.7'},
    {x: 0.0, z: 1.6, kind: 'magazines', note: 'AA_853（LAWWW 11-12）：雜誌＝第一座斜面書架（display_rack x −0.6、面向北，前緣 z 2.03）前面；正前方 (−0.6, 1.55) 是路人看雜誌站的位置（crowd3d.js），所以偏東 0.6 m。按鈕的字用 AA 的（yejian_shaola_buy.js），這裡不寫 label'},
    {x: 4.5, z: 3.9, kind: 'postcards', note: 'AA_853：明信片＝窗上那條麻繩（items 的 postcards），站在窗邊長吧台東端前面——最後一張高腳椅 x 3.2 再往東、盆栽 (5.5, 4.3) 以西、吧台前緣 z 4.4 以北。字用 AA 的'},
    {x: -4.0, z: 3.6, kind: 'job_notice', label: '門上的告示', note: '打工（wz_jobs.js books.desk 原本 (1.9, 3.9)，跟著搬到門邊）'}
  ],
  floorSit: [],
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = YEJIAN_LAYOUT;
