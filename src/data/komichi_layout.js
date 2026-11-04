/* ===== 小路 室內（溫州街 B3，取代巷子裡定食；昭和懷舊居酒屋；AA 2026-11-04 v1c（v1b：照 LAWWW 的 FIXED_COORDS——窗邊座離牆 0.55、卡座座位離西牆 0.4、加 tag；v1c：LAWWW2 量到 (3.05,3.45) 走不到，改 npcOnly；牆上兩排木札、天花板椽格、三盞和紙燈籠、吧台上擺滿）；使用者 11-04 04:4x 參考圖；AA_654、AA_655） =====
   參考圖：docs/story_planning/ref_images/shops/wz_komichi_int.webp（室內）、wz_komichi_ext.webp（外觀，LAWWW2 做）。美術規則：SCENE_RULES §10～12＋LAWWW2 11-04 04:45。
   **遊戲區域照舊是 `wz_teishoku`**：這份是 WZ_SHOPS_LAYOUT.teishoku 的新版（格式一樣，LAWWW 換掉那一筆就好）。
   不動的（照舊版 teishoku 和 LAWWW2 給的門窗數字）：房間 8 × 8 × 2.9、格子拉門 x −2.0（寬 1.8）、窗 x −3.7～−3.1 和 −0.6～3.4（窗台 0.85、窗頂 2.3）、
   出生點、出口、enterAt、結帳台＋結帳點、傘桶、整排吧台（x −4～2.2）＋半門、後面的開放廚房、六張吧台高腳凳、看木札菜單的點、店員的位置。
   改的（照參考圖）：中間的四人桌和兩人桌拿掉 → 窗邊兩個用隔板分開的四人座（木頭矮牆＋波浪玻璃）、西牆的綠色皮卡座（木框凹間）、中間一張四人桌。
   參考圖的鏡頭站在門邊往裡面看：左邊隔板座位、右邊吧台和高腳凳、正前方的卡座。遊戲裡的對應：站在東邊往西看——左手邊（+z）窗邊的隔板座位，右手邊（−z）吧台，正前方（西牆）卡座。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const KOMICHI_LAYOUT = {
  version: 4,
  id: 'wz_teishoku', name: '小路', glb: 'assets/models/env/second_ai/aa_support/komichi.glb',
  w: 8.0, d: 8.0, h: 2.9, wallColor: '#e6d8b8', floor: 'wood_light（D112：參考圖是深色木地板，改淺色）',
  note: '約 8×8 m 的昭和懷舊居酒屋（B3）。格子拉門進來左手邊是結帳台；後面一整排木吧台（六張綠色皮面高腳凳），吧台後面是開放廚房：炭烤台、排油煙罩、整面酒瓶層架；吧台上方橫樑掛木札、上面一排清酒瓶、吊杯架。窗邊兩個隔板四人座，西牆綠色皮卡座，中間一張四人桌。黃銅吊燈、壁燈、懷舊電影海報、舊照片。',
  front: {door: {x: -2.0, w: 1.8, style: 'lattice'}, windows: [[-3.7, -3.1], [-0.6, 3.4]], sill: 0.85, head: 2.3, views: [[-3.7, 3.7]], view: 'wz_teishoku', viewDepth: 10, viewW: 5.5, viewH: 1.8, viewY: 1.25, note: '照舊（LAWWW2 11-04 04:47）'},
  spawn: {x: -2.0, z: 3.05, yaw: Math.PI},
  seeThru: [],
  tagNote: 'tag（LAWWW 11-04 FIXED_COORDS §7-3，店內偶遇照標記挑位子）：corner＝西牆卡座、bar＝吧台凳、door＝離門最近的窗邊座。',
  seeThruNote: '舊版的 GLOW_wz_teishoku_washi（和紙燈籠）沒有了；新版的吊燈都在吧台上方（y 2.0）和卡座上方，不會擋在鏡頭前面。',
  exit: {at: {x: -2.0, z: 3.55}, label: '離開小路', to: 'wenzhou', spawn: {x: -4.8, z: -4.1, yaw: 0}},
  enterAt: {x: -4.8, z: -4.6, label: '進去小路', note: '照舊（B3 店門）'},
  items: [
    {kind: 'genkan', x: -2.0, z: 3.45, w: 2.2, d: 1.1, note: '照舊：門口一塊花磚'},
    {kind: 'register', x: -3.4, z: 2.55, w: 0.6, d: 0.9, h: 1.0, note: '照舊：結帳台（收銀機、招財貓、火柴盒）'},
    {kind: 'umbrella', x: -0.75, z: 3.6},
    {kind: 'counter', x: -0.9, z: -2.0, w: 6.2, d: 0.55, h: 1.0, note: '照舊位置：胡桃木吧台（直木板正面、厚木檯面）；右端 x 2.2～4.0 是廚房的半門'},
    {kind: 'kitchen', x: 0.0, z: -3.15, w: 8.0, d: 1.7, note: '開放廚房：炭烤台（烤雞串）、不鏽鋼排油煙罩、爐台、碗盤架；後牆整面層架（清酒瓶、燒酎、杯子、小碟）；往後面的暖簾'},
    {kind: 'menu_beam', x: -0.9, y: 2.35, z: -2.32, w: 6.2, note: '吧台上方橫樑掛 16 枚木札（焼き鳥、揚げ出し豆腐、塩焼き鯖、だし巻き玉子…）；橫樑上面一排清酒瓶；x 1.0 一個吊杯架'},
    {kind: 'sign', x: 2.9, y: 2.45, z: -3.97, w: 0.9, h: 0.45, note: '後牆半門上方的「小路」木匾'},
    {kind: 'hours', x: -3.4, y: 1.55, z: 3.97, w: 0.5, h: 0.25, note: '門左邊的營業時間木牌 18:00～02:00'},
    {kind: 'partition', x: -0.5, z0: 2.45, z1: 4.0, h: 1.75, note: '窗邊隔板（木頭矮牆到 1.1 m，上面波浪玻璃到 1.75 m）'},
    {kind: 'partition', x: 1.45, z0: 2.45, z1: 4.0, h: 1.75},
    {kind: 'partition', x: 3.4, z0: 2.45, z1: 4.0, h: 1.75},
    {kind: 'booth', x0: -4.0, x1: -3.45, z0: -0.5, z1: 1.3, note: '西牆的綠色皮卡座（直條紋靠背），兩根木柱框成凹間，上面一層木架（收音機、書、黃金葛）'},
    {kind: 'poster', side: 'left', along: 2.7, y: 1.6, w: 0.7, h: 1.05, cell: [0, 3, 2, 3], note: '懷舊電影海報一（虛構片名「青い季節」）'},
    {kind: 'poster', side: 'left', along: -1.15, y: 1.65, w: 0.6, h: 0.96, cell: [2, 3, 2, 3], note: '懷舊電影海報二（虛構片名「夕陽の街」）'},
    {kind: 'clock', x: -3.97, y: 2.2, z: 1.75, ry: Math.PI / 2, r: 0.15},
    {kind: 'shelf_wall', x: 3.97, y: 1.65, z: 0.35, ry: -Math.PI / 2, w: 1.6, note: '照舊：右牆的層板（陶壺、清酒瓶、招財貓）'},
    {kind: 'plant_big', x: 3.7, z: 1.95}
  ],
  tables: [
    {id: 1, kind: 'rect', x: 0.475, z: 3.25, w: 0.7, d: 1.3, note: '窗邊隔板座一（四人）'},
    {id: 2, kind: 'rect', x: 2.425, z: 3.25, w: 0.7, d: 1.3, note: '窗邊隔板座二（四人：東側靠牆那張 npcOnly，玩家走不到）'},
    {id: 3, kind: 'rect', x: 0.9, z: 0.75, w: 1.2, d: 0.7, note: '中間四人桌'},
    {id: 4, kind: 'rect', x: -2.3, z: 0.4, w: 0.6, d: 1.2, note: '卡座的桌子（v4：往東 0.25，卡座前緣到桌邊 0.85 m——LAWWW 11-04 導航改 0.2 m 以後 0.6 m 站不進去）'}
  ],
  blocks: [
    [-3.4, 2.55, 0.6, 0.9], [-0.9, -2.0, 6.2, 0.55], [0.0, -3.15, 8.0, 1.7], [3.1, -2.0, 1.8, 0.55],
    [-0.5, 3.225, 0.1, 1.55], [1.45, 3.225, 0.1, 1.55], [3.4, 3.225, 0.1, 1.55],
    [0.475, 3.25, 0.72, 1.32], [2.425, 3.25, 0.72, 1.32], [0.9, 0.75, 1.22, 0.72],
    [-3.725, 0.4, 0.55, 1.8], [-2.3, 0.4, 0.62, 1.22],
    [3.7, 1.95, 0.5, 0.5], [-0.75, 3.62, 0.3, 0.3]
  ],
  walkNote: '門口 x −2.9～−1.1；主走道 x −3.0～−0.6 從門口直到吧台前（2.4 m）；吧台高腳凳後面到中間四人桌 z −1.0～−0.15（0.85 m）；中間四人桌和窗邊座位之間 z 1.65～2.7；卡座從北邊（z 1.0～1.3）走進桌子和卡座之間 0.6 m 的空檔；吧台和半門從左牆一直到右牆（後面整排是廚房，不能進去）',
  seats: [
    {x: -0.15, z: 2.9, yaw: Math.PI / 2, table: 1, label: '坐下', tag: 'door'}, {x: -0.15, z: 3.45, yaw: Math.PI / 2, table: 1, label: '坐下', npcOnly: true, note: 'v4：隔板到桌邊 0.47 m，人站不進去（LAWWW 11-04 導航 0.2 m）；留給背景客人'},
    {x: 1.1, z: 2.9, yaw: -Math.PI / 2, table: 1, label: '坐下'}, {x: 1.1, z: 3.45, yaw: -Math.PI / 2, table: 1, label: '坐下', npcOnly: true},
    {x: 1.8, z: 2.9, yaw: Math.PI / 2, table: 2, label: '坐下'}, {x: 1.8, z: 3.45, yaw: Math.PI / 2, table: 2, label: '坐下', npcOnly: true},
    {x: 3.05, z: 2.9, yaw: -Math.PI / 2, table: 2, label: '坐下'}, {x: 3.05, z: 3.45, yaw: -Math.PI / 2, table: 2, label: '坐下', npcOnly: true, note: 'LAWWW2 11-04 05:22 建議①：玩家走不到，留給背景客人'},
    {x: 0.6, z: 0.1, yaw: 0, table: 3, label: '坐下'}, {x: 1.2, z: 0.1, yaw: 0, table: 3, label: '坐下'},
    {x: 0.6, z: 1.4, yaw: Math.PI, table: 3, label: '坐下'}, {x: 1.2, z: 1.4, yaw: Math.PI, table: 3, label: '坐下'},
    {x: -3.6, z: 0.1, yaw: Math.PI / 2, table: 4, seatH: 0.45, label: '坐卡座', tag: 'corner'}, {x: -3.6, z: 0.7, yaw: Math.PI / 2, table: 4, seatH: 0.45, label: '坐卡座', tag: 'corner'},
    {x: -1.6, z: 0.1, yaw: -Math.PI / 2, table: 4, label: '坐下'}, {x: -1.6, z: 0.7, yaw: -Math.PI / 2, table: 4, label: '坐下'},
    {x: -3.0, z: -1.35, yaw: Math.PI, kind: 'stool', lift: 0.27, label: '坐吧台', tag: 'bar'}, {x: -2.05, z: -1.35, yaw: Math.PI, kind: 'stool', lift: 0.27, label: '坐吧台', tag: 'bar'},
    {x: -1.1, z: -1.35, yaw: Math.PI, kind: 'stool', lift: 0.27, label: '坐吧台', tag: 'bar'}, {x: -0.15, z: -1.35, yaw: Math.PI, kind: 'stool', lift: 0.27, label: '坐吧台', tag: 'bar'},
    {x: 0.8, z: -1.35, yaw: Math.PI, kind: 'stool', lift: 0.27, label: '坐吧台', tag: 'bar'}, {x: 1.75, z: -1.35, yaw: Math.PI, kind: 'stool', lift: 0.27, label: '坐吧台', tag: 'bar'}
  ],
  interact: [
    {x: -2.75, z: 2.55, kind: 'cashier', label: '結帳'},
    {x: -0.9, z: -1.0, kind: 'menu', label: '看木札菜單', note: '照舊'}
  ],
  clerk: {x: -0.6, z: -2.75, yaw: 0, note: '照舊：吧台後面的廚房，面向客人'},
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = KOMICHI_LAYOUT;
