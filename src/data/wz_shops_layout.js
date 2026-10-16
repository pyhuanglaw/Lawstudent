/* ===== 溫州街三家新店的室內（ART-WZ3，LAWWW2-B 2026-10-16 v1）：半熟早午餐、阿德影印輸出、一盞茶屋 =====
   規格：AA_164 第 2 節（AA-B；分支 claude/cool-heisenberg-o8kuqx）。使用者 06:4x：「三家店室內都要3D!」——走進去、選位子坐下。
   這份給遊戲（LAWWW-B 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/wz_shops_interior.py）共用：家具的位置、大小只寫在這裡。
   座標：和現有的室內區域（zones3d.js 的 room()）一樣——房間中心在原點，x 往東、z 往南、y 往上；店面（門）在 +z 那一面（z＝d/2）；單位公尺。
   yaw：人面向 (sin yaw, cos yaw)——0＝面向 +z（店門）、π＝面向 −z（店裡面）、π/2＝面向 +x、−π/2＝面向 −x。
   家具的 ry：模型正面（坐的人面向的那一面、櫃子打開的那一面）朝 +z，再轉 ry。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（家具、櫃台；牆由 room() 自己擋）。walkNote：走道的寬度（人半徑 0.33 m，走道都 ≥ 0.9 m）。
   seats：坐下的位置（坐墊、椅子；label 是互動提示的文字草稿，正式文字由 AA-B 寫）。interact：互動點（kind＝給 LAWWW-B 判斷用；label 草稿）。
   exit：離開時回到溫州街的位置（溫州街區域的世界座標）。enterAt：溫州街上「進店」的互動點（世界座標，LAWWW-B 加在 zones3d 的 wenzhou）。
   wallsFade：會淡出的牆（模型裡的 WALL_<side>_*；dir＝往室內的法線；遊戲 attachRoomGLB）。 */
const WZ_SHOPS_LAYOUT = {
  version: 1,
  brunch: {
    id: 'wz_brunch', name: '半熟', glb: 'assets/models/env/second_ai/wz_brunch_interior.glb',
    w: 6.4, d: 10.0, h: 3.2, wallColor: '#f3ede2', floor: 'wood_light',
    note: '約 6×10 m（AA_164 2-1）。後面是開放式廚房＋面向客人的出餐檯；左牆三張兩人桌、右邊一張四人桌和一張兩人桌，共 12 個位子；左牆上一個大時鐘，出餐檯上是老闆娘的蛋計時器。',
    front: {door: {x: 0.4, w: 1.0}, windows: [[-3.0, -0.3], [1.1, 3.0]], sill: 0.75, head: 2.55},
    spawn: {x: 0.4, z: 4.0, yaw: Math.PI},
    exit: {at: {x: 0.4, z: 4.45}, label: '離開半熟', to: 'wenzhou', spawn: {x: 42.0, z: -4.1, yaw: 0}},
    enterAt: {x: 42.0, z: -4.6, label: '進去半熟', note: 'B7 店門（wz_shopkit SF.B7 door_x=-2.0 → 世界 x=42.0；玻璃門在 z=-5.9，門廊在建築的導航阻擋裡，互動點放在人行道上）'},
    items: [
      {kind: 'kitchen_line', x: -0.5, z: -4.65, w: 5.0, d: 0.7, note: '後牆的料理台：煎台、爐子、水槽、咖啡機、盤子架'},
      {kind: 'fridge', x: 2.65, z: -4.6, w: 0.8, d: 0.75, h: 1.9},
      {kind: 'pass_counter', x: -0.7, z: -2.7, w: 4.6, d: 0.5, h: 1.05, note: '出餐檯：上面一層出餐板、兩盞保溫燈；老闆娘的蛋計時器放在右端'},
      {kind: 'cashier', x: 2.6, z: -1.1, w: 0.8, d: 1.2, h: 1.0, note: '結帳櫃台：收銀機、蛋糕櫃'},
      {kind: 'table2', x: -2.35, z: -1.3, ry: 0}, {kind: 'table2', x: -2.35, z: 0.5, ry: 0}, {kind: 'table2', x: -2.35, z: 2.3, ry: 0},
      {kind: 'table4', x: 1.95, z: 1.0, ry: 0}, {kind: 'table2', x: 2.35, z: 3.35, ry: 0},
      {kind: 'clock', x: -3.17, y: 2.35, z: 0.5, ry: Math.PI / 2, r: 0.32},
      {kind: 'chalkboard', x: -0.7, y: 2.25, z: -4.97, w: 2.4, h: 0.8},
      {kind: 'shelf_wall', x: -3.05, y: 1.75, z: -1.3, ry: Math.PI / 2, w: 1.2},
      {kind: 'plant_big', x: -2.75, z: 4.35}, {kind: 'plant_big', x: 2.85, z: 4.35}
    ],
    blocks: [[-0.5, -4.65, 5.0, 0.7], [2.65, -4.6, 0.8, 0.8], [-0.7, -2.7, 4.6, 0.5], [2.6, -1.1, 0.8, 1.2],
             [-2.35, -1.3, 0.7, 0.7], [-2.35, 0.5, 0.7, 0.7], [-2.35, 2.3, 0.7, 0.7], [1.95, 1.0, 0.8, 1.3], [2.35, 3.35, 0.7, 0.7], [-2.75, 4.35, 0.6, 0.6], [2.85, 4.35, 0.5, 0.5]],
    walkNote: '中間走道 x −1.75～1.4（從門口走到出餐檯）；出餐檯右端到右牆 x 1.6～3.2、z −2.45～−1.7 是進廚房的路（打工時走）',
    seats: [
      {x: -2.35, z: -1.85, yaw: 0, table: 1, label: '坐下點餐'}, {x: -2.35, z: -0.75, yaw: Math.PI, table: 1, label: '坐下點餐'},
      {x: -2.35, z: -0.05, yaw: 0, table: 2, label: '坐下點餐'}, {x: -2.35, z: 1.05, yaw: Math.PI, table: 2, label: '坐下點餐'},
      {x: -2.35, z: 1.75, yaw: 0, table: 3, label: '坐下點餐'}, {x: -2.35, z: 2.85, yaw: Math.PI, table: 3, label: '坐下點餐'},
      {x: 1.3, z: 0.65, yaw: Math.PI / 2, table: 4, label: '坐下點餐'}, {x: 1.3, z: 1.35, yaw: Math.PI / 2, table: 4, label: '坐下點餐'},
      {x: 2.6, z: 0.65, yaw: -Math.PI / 2, table: 4, label: '坐下點餐'}, {x: 2.6, z: 1.35, yaw: -Math.PI / 2, table: 4, label: '坐下點餐'},
      {x: 2.35, z: 2.8, yaw: 0, table: 5, label: '坐下點餐'}, {x: 2.35, z: 3.9, yaw: Math.PI, table: 5, label: '坐下點餐'}
    ],
    interact: [
      {x: -0.7, z: -2.05, kind: 'pass', label: '出餐檯（打工：端盤）'},
      {x: 1.95, z: -1.1, kind: 'cashier', label: '結帳／問打工'},
      {x: -0.7, z: -1.9, kind: 'chalkboard', label: '看今日推薦'},
      {x: 2.2, z: -2.1, kind: 'kitchen', label: '進廚房（打工時）'}
    ],
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  },
  print: {
    id: 'wz_print', name: '阿德影印輸出', glb: 'assets/models/env/second_ai/wz_print_interior.glb',
    w: 4.4, d: 9.2, h: 3.0, wallColor: '#eef0ee', floor: 'tile_grey',
    note: '約 4×9 m（AA_164 2-2）。前段是客人的地方（自助影印機、文具架、價目表），中間一道櫃台（阿德的電腦），後段是店裡：兩台大影印機、大圖輸出機、長工作檯（膠裝機、裁紙刀）、紙箱，右後角阿德女兒寫功課的小桌。',
    front: {door: {x: 0.0, w: 1.4}, windows: [[-2.0, -0.85], [0.85, 2.0]], sill: 0.4, head: 2.5},
    spawn: {x: 0.0, z: 3.9, yaw: Math.PI},
    exit: {at: {x: 0.0, z: 4.15}, label: '離開影印店', to: 'wenzhou', spawn: {x: -8.0, z: 4.1, yaw: Math.PI}},
    enterAt: {x: -8.0, z: 4.6, label: '進去阿德影印輸出', note: 'A1 店門（中間，SF.A1 door_x=0）；A 側建築朝 −z'},
    items: [
      {kind: 'copier_self', x: -1.75, z: 2.7, ry: Math.PI / 2, note: '自助影印機（客人用，投幣）'},
      {kind: 'stationery', x: 1.97, z: 2.7, ry: -Math.PI / 2, w: 1.6, d: 0.4},
      {kind: 'price_board', x: 2.17, y: 2.05, z: 2.7, ry: -Math.PI / 2, w: 1.4, h: 0.7},
      {kind: 'counter', x: -0.8, z: 1.1, w: 2.8, d: 0.6, h: 1.0, note: '櫃台：客人那一面貼著價目；上面有阿德的電腦（螢幕朝裡面）、叫人鈴、訂書機'},
      {kind: 'counter', x: 1.85, z: 1.1, w: 0.7, d: 0.6, h: 1.0},
      {kind: 'office_chair', x: -0.9, z: 0.4, ry: 0},
      {kind: 'copier_big', x: -1.75, z: -0.5, ry: Math.PI / 2}, {kind: 'copier_big', x: -1.75, z: -2.0, ry: Math.PI / 2},
      {kind: 'plotter', x: -1.2, z: -4.2, ry: 0, w: 1.6, d: 0.6, note: '大圖輸出機（海報）'},
      {kind: 'worktable', x: 1.8, z: -1.4, ry: -Math.PI / 2, w: 3.0, d: 0.75, note: '長工作檯：膠裝機、裁紙刀、騎馬釘、紙疊'},
      {kind: 'kid_desk', x: 1.65, z: -4.0, ry: Math.PI, w: 0.9, d: 0.55, note: '阿芃寫功課的小桌（凳子在 z −3.45，面向 −z）'},
      {kind: 'paper_boxes', x: 0.2, z: -4.25},
      {kind: 'shelf_wall', x: -1.2, y: 1.9, z: -4.5, ry: 0, w: 1.6}
    ],
    blocks: [[-1.75, 2.7, 0.7, 0.8], [1.97, 2.7, 0.4, 1.6], [-0.8, 1.1, 2.8, 0.6], [1.85, 1.1, 0.7, 0.6], [-1.75, -0.5, 0.75, 0.9], [-1.75, -2.0, 0.75, 0.9],
             [-1.2, -4.2, 1.6, 0.6], [1.8, -1.4, 0.75, 3.0], [1.65, -4.0, 0.9, 0.55], [0.2, -4.25, 0.7, 0.5]],
    walkNote: '客人區 z 1.4～4.6 全部可以走；櫃台中間留 x 0.6～1.5 的缺口進店裡（打工時）；店裡走道 x −1.35～1.4',
    seats: [
      {x: -0.9, z: 0.4, yaw: 0, label: '坐在櫃台後面（打工時）'},
      {x: 1.65, z: -3.45, yaw: Math.PI, label: '（阿芃的位子）', npcOnly: true}
    ],
    interact: [
      {x: -0.6, z: 1.75, kind: 'print', label: '印東西'},
      {x: 1.45, z: 2.7, kind: 'stationery', label: '買文具'},
      {x: -1.15, z: 2.7, kind: 'copier_self', label: '自助影印'},
      {x: 1.05, z: 0.9, kind: 'staff_gate', label: '進櫃台（打工時）'},
      {x: 0.95, z: -1.4, kind: 'binding', label: '膠裝（打工時）'}
    ],
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  },
  teahouse: {
    id: 'wz_teahouse', name: '一盞', glb: 'assets/models/env/second_ai/wz_teahouse_interior.glb',
    w: 8.4, d: 14.6, h: 2.6, wallColor: '#e9dfc9', floor: 'wood_dark', zCenterNote: '區域 z −5～9.6：房子 z −5～5、緣側 5～6.2、前院 6.2～9.6（看得到、走不到）',
    note: '主屋約 8×10 m＋緣側（AA_164 2-3）。左前是玄關；前面一條緣側對著前院（樟樹、石板、竹掃把）；中間木地板的茶席（長桌、六個位子）；右邊是水屋（茶罐、電熱水壺、沙漏）；後面兩間榻榻米和室（各一張矮桌、四個坐墊），中間紙拉門關著。',
    front: {door: {x: -3.0, w: 1.0, note: '玄關（從前院的石板路進來）'}, openFront: true, shoji: {z: 5.0, x0: -2.2, x1: 4.2, note: '緣側和室內之間的紙拉門：拉開收在兩端'}},
    spawn: {x: -3.0, z: 4.2, yaw: Math.PI},
    exit: {at: {x: -3.0, z: 4.6}, label: '離開一盞', to: 'wenzhou', spawn: {x: -20.5, z: 4.1, yaw: Math.PI}},
    enterAt: {x: -20.5, z: 4.6, label: '進去一盞', note: '日式宿舍的冠木門（zones3d 的 TK.wall gateX -0.5 → 世界 x=-20.5）；原本的「看日式宿舍」改成這個（AA_164：整修後改成茶屋）'},
    items: [
      {kind: 'genkan', x: -3.3, z: 4.4, w: 1.8, d: 1.2, note: '玄關：石材地、鞋櫃（左牆）、木頭的上框（玄關比室內低 0.12）'},
      {kind: 'engawa', x: 1.0, z: 5.6, w: 6.4, d: 1.2},
      {kind: 'zabuton', x: 0.6, z: 5.55, ry: 0}, {kind: 'zabuton', x: 2.4, z: 5.55, ry: 0},
      {kind: 'long_table', x: -1.6, z: 1.7, w: 2.6, d: 0.85, ry: 0},
      {kind: 'chair_wood', x: -2.5, z: 0.95, ry: 0}, {kind: 'chair_wood', x: -1.6, z: 0.95, ry: 0}, {kind: 'chair_wood', x: -0.7, z: 0.95, ry: 0},
      {kind: 'chair_wood', x: -2.5, z: 2.45, ry: Math.PI}, {kind: 'chair_wood', x: -1.6, z: 2.45, ry: Math.PI}, {kind: 'chair_wood', x: -0.7, z: 2.45, ry: Math.PI},
      {kind: 'mizuya', x: 3.75, z: 1.3, w: 0.8, d: 3.4, ry: -Math.PI / 2, note: '水屋：流理台、電熱水壺、茶罐、計時沙漏、茶巾；上面開放層架'},
      {kind: 'tatami_room', x: -2.15, z: -2.8, w: 4.1, d: 4.4, note: '和室 A：床之間（掛軸、插花）在後牆左邊'},
      {kind: 'tatami_room', x: 2.15, z: -2.8, w: 4.1, d: 4.4, note: '和室 B：違い棚'},
      {kind: 'low_table', x: -2.15, z: -2.8, w: 1.2, d: 0.8}, {kind: 'low_table', x: 2.15, z: -2.8, w: 1.2, d: 0.8},
      {kind: 'zabuton', x: -2.15, z: -3.5, ry: 0}, {kind: 'zabuton', x: -2.15, z: -2.1, ry: Math.PI}, {kind: 'zabuton', x: -3.0, z: -2.8, ry: Math.PI / 2}, {kind: 'zabuton', x: -1.3, z: -2.8, ry: -Math.PI / 2},
      {kind: 'zabuton', x: 2.15, z: -3.5, ry: 0}, {kind: 'zabuton', x: 2.15, z: -2.1, ry: Math.PI}, {kind: 'zabuton', x: 1.3, z: -2.8, ry: Math.PI / 2}, {kind: 'zabuton', x: 3.0, z: -2.8, ry: -Math.PI / 2},
      {kind: 'tokonoma', x: -3.3, z: -4.65, w: 1.6, d: 0.7},
      {kind: 'fusuma', x: 0.0, z: -2.8, w: 0.12, d: 4.4, note: '兩間和室中間的紙拉門（關著）'},
      {kind: 'shoji_wall', z: -0.6, x0: -4.2, x1: 4.2, open: [[-3.2, -1.0], [1.0, 3.2]], note: '和室前面的紙拉門：中間各拉開 2.2 m'},
      {kind: 'garden', z0: 6.2, z1: 9.6, note: '前院（看得到、走不到）：苔、碎石、踏石、老樟樹（x 3.4, z 8.2）、石燈籠、竹掃把靠在矮牆、矮木牆在 z 9.6'}
    ],
    blocks: [[-1.6, 1.7, 2.6, 0.85], [3.75, 1.3, 0.8, 3.4], [-2.15, -2.8, 1.2, 0.8], [2.15, -2.8, 1.2, 0.8], [-3.3, -4.65, 1.6, 0.7], [0.0, -2.8, 0.12, 4.4],
             [-3.7, -0.6, 1.0, 0.12], [-0.05, -0.6, 2.1, 0.12], [3.7, -0.6, 1.0, 0.12], [0.0, 7.9, 8.4, 3.4], [-3.95, 4.4, 0.5, 1.2], [-3.2, 5.6, 2.0, 1.2]],
    walkNote: '玄關 → 茶席 → 水屋前 → 緣側都可以走；和室從紙拉門的開口進去；前院（z>6.2）擋住（緣側的邊緣 z 6.2 就是盡頭）',
    seats: [
      {x: -2.5, z: 0.95, yaw: 0, label: '坐下喝茶'}, {x: -1.6, z: 0.95, yaw: 0, label: '坐下喝茶'}, {x: -0.7, z: 0.95, yaw: 0, label: '坐下喝茶'},
      {x: -2.5, z: 2.45, yaw: Math.PI, label: '坐下喝茶'}, {x: -1.6, z: 2.45, yaw: Math.PI, label: '坐下喝茶'}, {x: -0.7, z: 2.45, yaw: Math.PI, label: '坐下喝茶'},
      {x: 0.6, z: 5.55, yaw: 0, label: '坐在緣側', kind: 'floor'}, {x: 2.4, z: 5.55, yaw: 0, label: '坐在緣側', kind: 'floor'},
      {x: -2.15, z: -3.5, yaw: 0, label: '在和室坐下', kind: 'floor'}, {x: -2.15, z: -2.1, yaw: Math.PI, label: '在和室坐下', kind: 'floor'},
      {x: 2.15, z: -3.5, yaw: 0, label: '在和室坐下', kind: 'floor'}, {x: 2.15, z: -2.1, yaw: Math.PI, label: '在和室坐下', kind: 'floor'}
    ],
    interact: [
      {x: 2.95, z: 1.3, kind: 'mizuya', label: '水屋（打工：泡茶）'},
      {x: -1.6, z: 3.1, kind: 'tea', label: '喝茶'},
      {x: 1.5, z: 5.9, kind: 'garden', label: '看院子'},
      {x: -3.0, z: -1.2, kind: 'tokonoma', label: '看床之間的掛軸'}
    ],
    wallsFade: {back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  }
};
if (typeof module !== 'undefined') module.exports = WZ_SHOPS_LAYOUT;
