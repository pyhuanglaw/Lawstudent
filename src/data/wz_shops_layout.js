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
  /* brunch：照抄 src/data/sunnyside_layout.js（tools/layout/sync_wz_aa_layouts.js；不要手改這一筆，改 AA 的檔再重跑）*/
  brunch: {
    version: 3,
    id: 'wz_brunch', name: 'SUNNY SIDE', glb: 'assets/models/env/second_ai/aa_support/sunnyside.glb',
    w: 6.4, d: 10.0, h: 3.2, wallColor: '#efe6d6', floor: 'checker（黑白斜鋪小方磚）',
    note: '約 6×10 m 的歐式早午餐（B7）。後面是開放式廚房（銅鍋、不鏽鋼架、排油煙罩），前面一道胡桃木出餐檯（咖啡機、磨豆機、玻璃甜點櫃、兩張高腳凳），上方矮牆掛深綠菜單板；左牆奶油色長沙發卡座、金框鏡子、水彩畫、壁燈；中間和右邊方木桌、大理石小圓桌、曲木藤面椅；右邊中段結帳櫃台（金字木牌、檯燈、收銀機）。',
    rightWindow: {z0: -2.4, z1: 4.6, sill: 0.75, head: 2.55, mullions: 13, transom: 2.0, color: '#3f5a3c', note: 'v1d（BB_257 §11①、LAWWW2 11-04 06:58）：轉角店的右牆整面落地窗；z 4.6～5.0 是轉角柱，z −5～−2.4 留牆給廚房'},
    front: {door: {x: 0.4, w: 1.0}, windows: [[-3.0, -0.3], [1.1, 3.0]], sill: 0.75, head: 2.55, note: '照舊（FIXED_COORDS §3）'},
    spawn: {x: 0.4, z: 4.0, yaw: Math.PI},
    seeThru: ['wzs_pendant', 'wzs_bulb', 'sns_vc', 'sns_vc_metal', 'sns_vc_gloss', 'sns_walnut_rt', 'sns_print', 'sns_leaf_pothos'],   /* WZ-SEAT-CAMS-1104（LAWWW2 帳號 A 11-10；BB-C 11-04 BB_255 吧台座位鏡頭被吊架擋）：AA 12ae10d3e 加過 sns_vc_metal，v1e 配置蓋掉了；這次重加，再加家具（sns_vc）、光亮的小東西（sns_vc_gloss）、出餐檯的胡桃木框與層架（sns_walnut_rt）、出餐檯上方的菜單板（sns_print）、吊著的黃金葛（sns_leaf_pothos）；左牆（卡座那一面）、後牆當鏡頭碰撞（右牆是整面落地窗、前面是門窗，照舊淡出）。tests/wz_seat_cams_1104_unit.js */
    camWalls: [[-3.2, 0, 0.12, 10], [0, -5.0, 6.4, 0.12]],
    seeThruNote: '吊燈照舊叫 wzs_pendant（燈罩）、wzs_bulb（燈泡）的材質名稱沒有沿用；新版的吊燈是 GLOW_pendant_*，兩盞在中間桌子上方 2.3 m。LAWWW2 拍鏡頭遮擋時再定要不要透空。',
    exit: {at: {x: 0.4, z: 4.45}, label: '離開 SUNNY SIDE', to: 'wenzhou', spawn: {x: 45.0, z: -4.1, yaw: 0}},
    enterAt: {x: 45.0, z: -4.6, label: '進去 SUNNY SIDE', note: 'WZ-SUNNY-DOOR-1112：42 → 45（店外的門移到和室內的門同一個位置）'},
    items: [
      {kind: 'kitchen_line', x: -0.5, z: -4.65, w: 5.0, d: 0.7, note: '照舊位置：後牆料理台（煎台、爐子、水槽、盤子架）；上面銅鍋吊桿、不鏽鋼層架、排油煙罩'},
      {kind: 'fridge', x: 2.65, z: -4.6, w: 0.8, d: 0.75, h: 1.9},
      {kind: 'pass_counter', x: -0.7, z: -2.7, w: 4.6, d: 0.5, h: 1.05, note: '照舊位置：胡桃木出餐檯（框格面板、淺色石材檯面）：咖啡機、磨豆機、杯子、玻璃甜點櫃（右段）、蛋計時器；左段兩張高腳凳'},
      {kind: 'menu_wall', x: -0.7, z: -2.98, w: 4.6, y0: 2.2, note: '出餐檯上方的矮牆（2.2 m 到天花板），掛深綠菜單板 2.4 × 0.8（舊的黑板改到這裡）'},
      {kind: 'cashier', x: 2.6, z: -1.1, w: 0.8, d: 1.2, h: 1.0, note: '照舊位置：胡桃木結帳櫃台（朝走道那一面是金字木牌）、黃銅檯燈、收銀機、名片'},
      {kind: 'banquette', x0: -3.2, x1: -2.75, z0: -1.6, z1: 1.4, note: '左牆奶油色布面長沙發（直條紋靠背、灰色抱枕）'},
      {kind: 'mirror', side: 'left', along: -0.1, y: 1.85, w: 0.7, h: 1.0, note: '卡座上方的金框鏡子'},
      {kind: 'print', side: 'left', along: 2.4, y: 1.7, w: 0.55, h: 0.55, cell: [2, 2, 2, 2]},
      {kind: 'print', side: 'left', along: -3.7, y: 1.75, w: 0.55, h: 0.55, cell: [4, 2, 2, 2], note: 'v1d：右牆開落地窗，水彩畫二搬到左牆後段'},
      {kind: 'shelf_wall', x: -3.05, y: 2.2, z: 3.2, ry: Math.PI / 2, w: 1.0, note: '左前牆的小層架：書、黃金葛'},
      {kind: 'plant_big', x: -2.75, z: 4.45}, {kind: 'plant_big', x: 2.85, z: 4.45}
    ],
    tables: [
      {id: 1, kind: 'rect', x: -1.575, z: -0.85, w: 0.55, d: 0.6, note: '卡座桌一（卡座前緣到桌邊 0.6 m）'},
      {id: 2, kind: 'rect', x: -1.575, z: 0.65, w: 0.55, d: 0.6, note: '卡座桌二'},
      {id: 3, kind: 'rect', x: -0.3, z: 1.0, w: 0.7, d: 0.7, note: '中間方木桌（面對面兩人）'},
      {id: 4, kind: 'rect', x: 1.9, z: 0.6, w: 0.7, d: 0.7, note: '右邊方木桌（面對面兩人）'},
      {id: 5, kind: 'round', x: 2.35, z: 2.75, r: 0.34, note: '右前大理石小圓桌'},
      {id: 6, kind: 'round', x: -2.1, z: 3.3, r: 0.34, note: '左前窗邊大理石小圓桌'}
    ],
    blocks: [
      [-0.5, -4.65, 5.0, 0.7], [2.65, -4.6, 0.8, 0.8], [-0.7, -2.7, 4.6, 0.5], [2.6, -1.1, 0.8, 1.2],
      [-2.975, -0.1, 0.45, 3.0], [-1.575, -0.85, 0.57, 0.62], [-1.575, 0.65, 0.57, 0.62],
      [-0.3, 1.0, 0.72, 0.72], [1.9, 0.6, 0.72, 0.72], [2.35, 2.75, 0.5, 0.5], [-2.1, 3.3, 0.5, 0.5],
      [-2.75, 4.45, 0.5, 0.5], [2.85, 4.45, 0.5, 0.5]
    ],
    walkNote: '門口 (0.4, 4.0) 往裡面：中間走道 x 0.1～1.5 直到出餐檯前（z −2.0）；出餐檯前 z −2.45～−1.75 一條；出餐檯右端到右牆 x 1.6～3.2、z −2.45～−1.7 是進廚房的路（照舊）；卡座從北邊（z −1.9～−1.15）或南邊（z 0.95～1.4）走進卡座和桌子之間 0.6 m 的空檔。',
    seats: [
      {x: -2.75, z: -0.85, yaw: Math.PI / 2, table: 1, seatH: 0.45, label: '坐下點餐', tag: 'sofa'}, {x: -0.95, z: -0.85, yaw: -Math.PI / 2, table: 1, label: '坐下點餐'},
      {x: -2.75, z: 0.65, yaw: Math.PI / 2, table: 2, seatH: 0.45, label: '坐下點餐', tag: 'sofa'}, {x: -0.95, z: 0.65, yaw: -Math.PI / 2, table: 2, label: '坐下點餐'},
      {x: -0.3, z: 0.4, yaw: 0, table: 3, label: '坐下點餐'}, {x: -0.3, z: 1.6, yaw: Math.PI, table: 3, label: '坐下點餐'},
      {x: 1.9, z: 0.0, yaw: 0, table: 4, label: '坐下點餐', ap: [1.8, -0.5]}, {x: 1.9, z: 1.2, yaw: Math.PI, table: 4, label: '坐下點餐'},
      /* ap（LAWWW 2026-11-04，CC reachability_all dac871e25「坐下點餐」走到一半卡在 (2.4, 1.25)）：table 4 北側這張的「坐下」走近點。
         導航格 0.4 m：桌子的阻擋量成 x 1.4～2.2、z 0.0～1.2（剛好到椅子 z 0.0），結帳櫃台量成 x 2.2～3.0、z −1.6～−0.4——
         椅子後 0.6 (1.9, −0.6) 碰到櫃台那一格、兩側 0.55 碰到桌子那一格，GAME.seatApproach 的候選全站不住，退回椅子正前方 0.5 m (1.9, 0.5)＝桌子裡面，從東側窄走道走過去卡住。
         (1.8, −0.5)：椅子後面偏西 0.1、離櫃台西面 0.4、離椅子 0.51 m（按鈕範圍 0.85 內）；位置、模型都不變 */
      {x: 2.35, z: 2.1, yaw: 0, table: 5, label: '坐下點餐'}, {x: 2.35, z: 3.4, yaw: Math.PI, table: 5, label: '坐下點餐', tag: 'door'},
      {x: -2.1, z: 2.65, yaw: 0, table: 6, label: '坐下點餐'}, {x: -2.1, z: 3.95, yaw: Math.PI, table: 6, label: '坐下點餐', tag: 'window'},
      {x: -2.3, z: -2.1, yaw: Math.PI, kind: 'stool', lift: 0.27, label: '坐吧台', tag: 'bar'}, {x: -1.6, z: -2.1, yaw: Math.PI, kind: 'stool', lift: 0.27, label: '坐吧台', tag: 'bar'}
    ],
    tagNote: 'tag（LAWWW 11-04 FIXED_COORDS §7-3，店內偶遇照標記挑位子）：sofa＝左牆卡座、bar＝出餐檯的高腳凳（阿哲「坐在吧檯」）、door＝離門最近的、window＝左前窗邊。',
    interact: [
      {x: -0.7, z: -2.05, kind: 'pass', label: '出餐檯（打工：端盤）', note: '照舊'},
      {x: 1.95, z: -1.1, kind: 'cashier', label: '結帳／問打工', note: '照舊（不能動）'},
      {x: -0.7, z: -1.9, kind: 'chalkboard', label: '看今日推薦', note: '照舊位置；看的是出餐檯上方的菜單板'},
      {x: 2.2, z: -2.1, kind: 'kitchen', label: '進廚房（打工時）', note: '照舊（不能動）'}
    ],
    clerk: {x: 2.6, z: -2.05, yaw: -0.6, note: 'FIXED_COORDS §3 #4：結帳櫃台北端、廚房門口；原本寫死在 story3d.js:359，請 LAWWW 改成讀這裡'},
    work: {a: {me: {x: 0.6, z: 1.0, yaw: -Math.PI / 2, act: 'stand', note: '中間方木桌旁擺餐具（原本在四人桌旁 (1.0, 1.0)）'}, boss: {x: -2.35, z: -3.85, yaw: Math.PI, act: 'cook', note: '照舊'}, mate: {x: -0.95, z: -0.1, yaw: -Math.PI / 2, act: 'wipe', note: '小蕙擦卡座的桌子（原本 (−1.6, 0.5)）'}},
           b: {me: {x: -0.7, z: -2.05, yaw: Math.PI, act: 'serve', note: '照舊'}, boss: {x: -0.7, z: -3.45, yaw: 0, act: 'cook', note: '照舊'}, mate: {x: 2.6, z: -2.05, yaw: -0.6, act: 'stand', note: '照舊'}},
           c: {me: {x: -0.3, z: -3.85, yaw: Math.PI, act: 'wash', note: '照舊'}, boss: {x: -1.5, z: -3.6, yaw: Math.PI, act: 'stand', note: '照舊'}, mate: {x: 2.6, z: -2.05, yaw: -0.6, act: 'stand'}},
           end: {x: 0.4, z: 3.2, yaw: 0, note: '照舊'}},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  },
  /* print：照抄 src/data/ade_layout.js（tools/layout/sync_wz_aa_layouts.js；不要手改這一筆，改 AA 的檔再重跑）*/
  print: {
    version: 3,   /* src/data/ade_layout.js 外層的 version（sync 工具補的）*/
    id: 'wz_print', zone: 'wz_print', layoutKey: 'print', name: '阿德影印輸出', glb: 'assets/models/env/second_ai/bb_support/ade.glb',
    w: 4.4, d: 9.2, h: 3.0, wallColor: '#eef0ee', floor: 'tile_grey',
    hours: '週一～週六 09:00–22:00（考試週開到 24:00）；週日公休（照 src/data/places.js 的 wz_print，沒改）',
    prices: [['黑白影印／列印', 'A4', '2 元／張'], ['', 'A3', '4 元／張'], ['彩色輸出', 'A4', '10 元／張'], ['', 'A3', '20 元／張'], ['雙面列印', '', '+1 元／張'], ['掃描（轉檔）', '', '5 元／張'], ['膠裝', '', '80 元起'], ['騎馬釘', '', '15 元起']],
    pricesNote: 'AA_654：價目照室內圖（外觀圖的價目表寫黑白 NT$1／頁，和室內不同；照 AA_654 用室內這一份，外觀那張 LAWWW2 跟著改或 AA 定）',
    note: '溫州街 A1（AA_654）。v1c（11-04）：BB_257 §7 退件——印東西、買文具放回 FIXED 原座標、加 clerk、stands、出生點 3.65；前面那張長桌只留一張椅子、後面三張（一張沒推進去）；模型：資料夾一本一本、紙包紙箱多種尺寸、兩台自助／兩台生產用影印機不同機型（見 CC_49 v1c）。v1b（11-04）：LAWWW2 用遊戲的導航格驗收 v1，7／8 個互動點 NG，照 0.4 m 格重排（長桌變窄、東側那張椅子拿掉、左右兩排變淺、櫃台改短），shopchk2 NG 0。v1（11-04）：尺寸照現在的 wz_print（LAWWW2：不要動）。參考圖的店看起來比 4.4 m 寬：左右兩排都照圖排，中間的長桌往東靠，西側是主走道。',
    front: {door: {x: 0.0, w: 1.4, h: 2.5}, windows: [[-2.0, -0.85, 0.4, 2.5], [0.85, 2.0, 0.4, 2.5]],
      view: 'wz_print', viewY: 1.45, viewDepth: 10,   /* 窗外的視差窗景（WINVIEW-AUDIT-1105，LAWWW2-C）：assets/models/env/views/wz_print_{day,night}.webp，Blender 用溫州街正式模型從視差窗中心（地平線 1.45 m＝窗台 0.4 和窗頂 2.5 的中間）往外拍；景深 10＝對面 B 側立面 */
      note: '照 LAWWW2（wz_shops_layout.js print）：門 x −0.7～0.7；窗 x −2～−0.85、0.85～2（窗台 0.4、窗頂 2.5）；windows：[x0, x1, 窗台, 窗頂]。門是外觀那一側的玻璃雙開門（外觀模型做），室內只做門框；門高 2.5 照窗頂（LAWWW2 沒給門高）'},
    windowKeep: [[-1.425, 4.24, 1.15, 0.48], [1.425, 4.24, 1.15, 0.48]],
    spawn: {x: 0.0, z: 3.65, yaw: Math.PI},   /* v1c：3.9 → 3.65（WZ_SHOPS1_FIXED_COORDS §7-1：牆內 0.4 m 不能站，3.9 每次進門都要 unstick；區域自己的出生點本來就改成 3.65）*/
    exit: {at: {x: 0.0, z: 4.15}, label: '離開影印店', to: 'wenzhou', spawn: {x: -8.0, z: 4.1, yaw: Math.PI}},
    enterAt: {x: -8.0, z: 4.6, label: '進去阿德影印輸出', note: '照 wz_shops_layout.js 的 print（沒改）'},
    camRef: {eye: [-0.8, 1.62, 4.38], look: [0.4, 1.1, -4.0], lens: 18, note: '參考圖的鏡頭（Blender 渲染、ref_match 用）：站在店門內側、西側主走道上往裡看、往下約 4°（v1b：長桌變窄、椅子往桌下收，鏡頭往西挪 0.5 m 才看得到一排藍椅子）。參考圖的店看起來比 4.4 m 寬、比 9.2 m 淺；18 mm 時左邊的影印機、右邊的層架照參考圖被畫面邊緣切到一部分'},
    lights: {
      panels: [[-1.0, 3.3], [1.0, 3.3], [-1.0, 1.5], [1.0, 1.5], [-1.0, -0.3], [1.0, -0.3], [-1.0, -2.1], [1.0, -2.1], [-1.0, -3.7], [1.0, -3.7]],
      note: 'LED 平板燈 [x, z]（1.2 × 0.3 m，長邊沿 z；嵌在輕鋼架天花板，y＝h）；夜間光暈 GLOW_panel_* 在同一個位置。日光燈色（約 5000K）'
    },
    items: [
      {kind: 'copier_self', x: -1.79, z: 2.65, w: 0.58, d: 0.62, h: 1.22, ry: Math.PI / 2, note: '自助影印機 1（正面朝 +x；觸控面板、紙匣四層、出紙盤）。v1b：深 0.58（正面 x −1.50）'},
      {kind: 'copier_self', x: -1.79, z: 1.88, w: 0.58, d: 0.62, h: 1.22, ry: Math.PI / 2, note: '自助影印機 2'},
      {kind: 'price_board', x: -2.07, y: 2.05, z: 2.05, w: 0.95, h: 1.45, note: '藍色「影印・輸出價目表」（左牆，兩台自助影印機上面：參考圖在影印機的左上方）'},
      {kind: 'front_plant', x: -1.72, z: 3.62, note: '左前角的盆栽（窗旁）'},
      {kind: 'recycle_bin', x: -1.88, z: 3.18, r: 0.16, note: '影印機旁的廢紙回收桶（藍）'},
      {kind: 'plotter', x: -1.79, z: 0.55, w: 0.58, d: 1.5, h: 1.15, note: '大圖輸出機（海報；捲筒紙、出紙籃）'},
      {kind: 'sample_cab', x: -1.86, z: -1.4, w: 0.44, d: 1.15, h: 0.9, note: '矮的紙樣櫃：上面紙樣本、膠裝封面樣本、釘書機、資源回收盒'},
      {kind: 'table', x: 0.21, z: 2.05, w: 0.5, d: 1.7, h: 0.75, divider: true, note: '前面那張長桌（v1b：寬 0.5，x −0.04～0.46）：自助電腦 1 台、隔板、筆筒、文件籃'},
      {kind: 'table', x: 0.21, z: 0.25, w: 0.5, d: 1.7, h: 0.75, note: '後面那張長桌：自助電腦 2 台、筆筒、紙疊'},
      {kind: 'chair', x: -0.07, z: 2.6, yaw: Math.PI / 2 + 0.08}, {kind: 'chair', x: -0.07, z: 0.85, yaw: Math.PI / 2 - 0.1},
      {kind: 'chair', x: -0.07, z: 0.25, yaw: Math.PI / 2 + 0.05}, {kind: 'chair', x: -0.2, z: -0.45, yaw: Math.PI / 2 + 0.32, note: '沒推進去的那一張（往外拉 0.13 m、轉 18°；z −0.45：再往北會和大圖輸出機中間的走道小於 1.2 m）'},
      {kind: 'stat_rack', x: 1.87, z: 2.2, w: 0.42, d: 1.8, h: 2.1, note: '灰色鐵層架六層：彩色資料夾、活頁本、筆記本、筆、便利貼、口紅膠、A4／A3 紙箱；上面一盆黃金葛'},
      {kind: 'floor_boxes', x: 1.81, z: 3.31, w: 0.42, d: 0.3, note: '層架前面（店門那一側）地上兩箱紙'},
      {kind: 'board_binding', x: 2.07, y: 2.0, z: 0.35, w: 0.75, h: 1.1, note: '「裝訂樣式」展示板（黑、灰、白的線圈本）'},
      {kind: 'board_report', x: 2.07, y: 1.95, z: -0.85, w: 1.1, h: 1.4, note: '「學生報告範例」展示板（報告封面、校園照片封面）'},
      {kind: 'worktable', x: 1.87, z: -0.75, w: 0.42, d: 3.1, h: 0.9, note: '長工作檯（v1b：深 0.42，x 1.66～2.08）：雷射印表機、膠裝機、線圈裝訂機、裁紙刀、紙疊；下層 A4 紙箱'},
      {kind: 'kid_desk', x: 1.87, z: -2.85, w: 0.42, d: 0.75, h: 0.72, note: '阿芃寫功課的小桌（面向東牆）'},
      {kind: 'kid_stool', x: 1.5, z: -2.85, note: '阿芃的圓凳（NPC 坐；不擋導航，和舊配置一樣）'},
      {kind: 'counter', x: -1.45, z: -2.65, w: 1.2, d: 0.54, h: 1.0, note: '木櫃台（v1b：x −2.05～−0.85、z −2.38～−2.92）：電腦、掃碼付款小牌、筆筒、叫人鈴、待取件的牛皮紙袋'},
      {kind: 'office_chair', x: -1.84, z: -3.55, yaw: 0.3, note: '櫃台後面的辦公椅（打工的座位；面向客人，靠西牆）'},
      {kind: 'cubby', x: -1.0, z: -4.28, w: 2.0, d: 0.4, h: 1.85, note: '後牆木格櫃（5 × 4 格，一格一格的紙）；上面一盆盆栽'},
      {kind: 'back_sign', x: -0.8, y: 2.45, z: -4.47, w: 2.1, h: 0.34, note: '藍色招牌「阿德影印輸出」（印表機圖示、斜線）'},
      {kind: 'copier_prod', x: 0.7, z: -4.09, w: 0.9, d: 0.78, h: 1.25, note: '大型生產用影印機 A（正面朝 +z；操作螢幕）'},
      {kind: 'copier_prod', x: 1.61, z: -4.09, w: 0.9, d: 0.78, h: 1.25, note: '大型生產用影印機 B'},
      {kind: 'ac', x: 0.2, z: 0.6, w: 0.84, note: '吸頂冷氣（四面出風）'},
      {kind: 'hours_sign', note: '營業時間牌（店門內側玻璃）：週一～週六 09:00–22:00、週日公休'}
    ],
    blocks: [
      [-1.79, 2.65, 0.58, 0.66], [-1.79, 1.88, 0.58, 0.66], [-1.72, 3.62, 0.42, 0.42], [-1.88, 3.18, 0.32, 0.32], [-1.79, 0.55, 0.58, 1.5], [-1.86, -1.4, 0.44, 1.15],
      [0.21, 2.05, 0.5, 1.7], [0.21, 0.25, 0.5, 1.7],
      [-0.07, 2.6, 0.46, 0.46], [-0.07, 0.85, 0.46, 0.46], [-0.07, 0.25, 0.46, 0.46], [-0.2, -0.45, 0.48, 0.48],
      [1.87, 2.2, 0.42, 1.8], [1.81, 3.31, 0.42, 0.3], [1.87, -0.75, 0.42, 3.1], [1.87, -2.85, 0.42, 0.75],
      [-1.45, -2.65, 1.2, 0.54], [-1.84, -3.55, 0.44, 0.44], [-1.0, -4.28, 2.0, 0.4], [0.7, -4.09, 0.9, 0.78], [1.61, -4.09, 0.9, 0.78]
    ],
    blocksNote: 'v1b：照遊戲真正的導航格排（room() 0.4 m 格、牆內 0.4 m、家具 pad 0.05、人半徑 0.33；LAWWW2 的 shopchk2）。格子中心在 x …−1.4、−1.0、−0.6、−0.2、0.2、0.6、1.0、1.4…、z …3.4、3.0、2.6…；一格要站得住，它和前後左右四格都要空。所以家具的邊都對齊格子：左邊一排正面在 x −1.50（擋到 −1.8 那一欄）、椅子西緣 −0.30（擋 −0.2）、長桌東緣 0.46（擋 0.2）、右邊一排正面 1.66（擋 1.8）；中間 −1.4～−0.6、0.6～1.4 各三欄空著，−1.0、1.0 兩條站得住。前面那張長桌的前緣在 z 2.9（z 3.0 那一列要空，從出生點才走得進店裡）；櫃台 z −2.38～−2.92（−2.2、−3.0 兩列要空：前面是客人的那一列 −1.8、後面是店員的那一列 −3.4）。阿芃的凳子不擋（NPC 坐的位子，和舊配置一樣）；櫃台後面的辦公椅貼著西牆（x −2.06～−1.62），不擋 −1.4 那一欄。',
    walkNote: 'v1b（照遊戲的導航格，LAWWW2 shopchk2）：主走道淨寬（block 外緣到外緣）——西側：自助影印機、大圖輸出機正面 x −1.50 到椅子西緣 x −0.30＝1.20 m（紙樣櫃 −1.64 那一段 1.34 m）；東側：長桌東緣 x 0.46 到鐵層架、工作檯、阿芃的小桌 x 1.66＝1.20 m。四張椅子坐的那一側（西）是 1.20 m 的主走道。前面：長桌前緣 z 2.9 到店門內 0.4 m（z 4.2）＝1.3 m；長桌後面 z −0.60 到櫃台 z −2.38＝1.78 m；櫃台後面（店員）z −2.92～−4.08＝1.16 m，從櫃台東端（x −0.85）進，櫃台東端到後牆格櫃以東、生產用影印機前（z −3.70）的通道 1.1 m。遊戲格子上站得住的：x −1.0、1.0 兩條直的（整條通），z 3.4、−1.8 兩條橫的，櫃台後面 z −3.4 那一條（x −1.0～−0.2），生產用影印機前 z −3.0。',
    seats: [
      {x: -0.07, z: 2.6, yaw: Math.PI / 2, h: 0.46, kind: 'chair', label: '坐下來用電腦', note: '自助電腦（前面那張長桌）'},
      {x: -0.07, z: 0.85, yaw: Math.PI / 2, h: 0.46, kind: 'chair', label: '坐下來用電腦', note: '自助電腦（後面那張長桌）'},
      {x: -0.07, z: 0.25, yaw: Math.PI / 2, h: 0.46, kind: 'chair', label: '坐下來用電腦'},
      {x: -0.2, z: -0.45, yaw: Math.PI / 2, h: 0.46, kind: 'chair', label: '坐一下', note: '沒推進去的那一張'},
      {x: -1.84, z: -3.55, yaw: 0.3, h: 0.48, kind: 'office_chair', label: '坐在櫃台後面（打工時）', ap: [-1.1, -3.4], apNote: 'ADE-SEATS-NAV-1104（LAWWW2-C 11-05）：椅子貼著西牆，前、後、兩側的走近點都站不住（櫃台、牆、後櫃、椅子本身）；從櫃台後面那條通道的西端（−1.1, −3.4）走近'},
      {x: 1.5, z: -2.85, yaw: Math.PI / 2, h: 0.45, kind: 'stool', label: '（阿芃的位子）', npcOnly: true}
    ],
    interact: [
      {x: -0.6, z: 1.75, yaw: -Math.PI / 2, kind: 'print', label: '印東西', note: 'v1c：放回 WZ_SHOPS1_FIXED_COORDS §4 #4 的原座標 (−0.6, 1.75)（v1b 搬到櫃台前 (−1.3, −1.95)，BB_257 退件）：西側走道、兩台自助影印機前面。前面那張長桌只留一張椅子（z 2.6），不然站在椅子旁邊時最近的會是「印東西」'},
      {x: -1.0, z: 3.05, yaw: -Math.PI * 0.75, kind: 'copier_self', label: '自助影印', note: '前面那台自助影印機的北端（離長桌的椅子遠一點）'},
      {x: 1.45, z: 2.7, yaw: Math.PI / 2, kind: 'stationery', label: '買文具', note: 'v1c：放回原座標 (1.45, 2.7)（FIXED §4 #5；v1b 是 (1.0, 2.4)）：鐵層架前面'},
      {x: -0.2, z: -2.95, yaw: -Math.PI / 2, kind: 'staff_gate', label: '進櫃台（打工時）', note: '櫃台東端（從這裡進到櫃台後面）'},
      {x: 1.0, z: -1.35, yaw: Math.PI / 2, kind: 'binding', label: '膠裝（打工時）', note: '長工作檯前（膠裝機、裁紙刀）'}
    ],
    clerk: {x: -0.95, z: -3.4, yaw: 0, note: 'v1c：店員（阿德）顧櫃台的位置——櫃台後面、面向客人（站得住、從客人區經櫃台東端走得到）。FIXED §4 #6、§7-4：story3d.js:360 現在寫死 (−0.9, 0.4)，那一點在這一版是客人區走道中間；請 LAWWW 改成讀這裡（和林家、定食讀配置的 clerk 一樣）'},
    stands: [[-1.0, 2.6, -Math.PI / 2], [1.0, 3.2, Math.PI / 2], [-1.0, -1.8, Math.PI]],
    standsNote: 'v1c：站著的客人、店內偶遇的三個站點 [x, z, yaw]（crowd3d.js:371 現在寫死 (−1.55, 1.95)、(1.15, 3.25)、(0.25, 1.95)，這一版前後兩點在自助影印機、長桌裡）。①自助影印機前面（面向影印機 1；柏翰「他站在影印機旁邊」用這一點）②鐵層架前（面向層架下層的紙箱）③櫃台前（面向櫃台、等取件）。三點都在 0.4 m 格上站得住、從出生點走得到；離出口 1.38～5.95 m、離「印東西」「買文具」0.67 m 以上；前面 0.75 m 是家具（shop_diners_unit 第 6 項）',
    npc: {
      staff: [
        {id: 'wz_ade', x: -0.95, z: -3.4, yaw: 0, act: 'stand', note: '阿德：櫃台後面，面向客人'},
        {id: 'wz_ade', x: 0.6, z: -3.05, yaw: Math.PI, act: 'stand', note: '阿德：生產用影印機前（卡紙、印論文）'},
        {id: 'wz_ade', x: 1.0, z: -1.35, yaw: Math.PI / 2, act: 'stand', note: '阿德：長工作檯前（膠裝）'}
      ],
      kid: {id: '阿芃', x: 1.5, z: -2.85, yaw: Math.PI / 2, act: 'sit', note: '阿芃：晚上在小桌寫功課（坐著，面向東牆）'}
    },
    /* 打工的站位（照 wz_shops_layout.js 的 print.work 的格式；a＝接單、b＝做的時候、c＝交件）。這一版櫃台東端是開的（從客人區走得進櫃台後面），下班不必再放回客人區，end 留著相容 */
    work: {a: {me: {x: -1.84, z: -3.55, yaw: 0.3, act: 'sit', ap: [-1.1, -3.4], note: '櫃台後面的辦公椅，面向客人（ap：走近點，同 seats 的辦公椅）'}, boss: {x: 1.0, z: -1.35, yaw: Math.PI / 2, act: 'stand', note: '長工作檯前'}, kid: {x: 1.5, z: -2.85, yaw: Math.PI / 2, act: 'sit', note: '阿芃的位子'}},
           b: {me: {x: 1.0, z: -1.0, yaw: Math.PI / 2, act: 'stand', note: '長工作檯前（膠裝機、裁紙刀）'}, boss: {x: 0.6, z: -3.05, yaw: Math.PI, act: 'stand', note: '生產用影印機前'}, kid: {x: 1.5, z: -2.85, yaw: Math.PI / 2, act: 'sit'}},
           c: {me: {x: -0.95, z: -3.4, yaw: 0, act: 'stand', note: '櫃台後面，交件給客人'}, boss: {x: 1.0, z: -2.3, yaw: Math.PI / 2, act: 'stand', note: '阿芃的小桌旁'}, kid: {x: 1.5, z: -2.85, yaw: Math.PI / 2, act: 'sit'}},
           end: {x: -0.6, z: 3.4, yaw: 0, note: '客人區、門口，面向店門'}},
    jobDesk: {x: -0.2, z: -2.95, label: '櫃台', note: 'src/data/wz_jobs.js 的 copy.desk 現在是 (1.05, 0.9)（舊配置的櫃台缺口）；換成這份時改成這裡（staff_gate 同一個位置）'},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]},
    /* moved：保留 wz_shops_layout.js 原本的（src/data/ade_layout.js 沒有這一筆；sync 工具）*/
    moved: {enterAt: {x: 3.9, z: 6.5, label: '進去阿德影印輸出', note: '北巷的人行處（巷子 x 3.3～8.2），轉角店的玻璃門在 x 3.1、z 6.0～6.95'}, exitSpawn: {x: 4.0, z: 6.5, yaw: Math.PI / 2}}
  },
  /* teahouse：照抄 src/data/yizhan_layout.js（tools/layout/sync_wz_aa_layouts.js；不要手改這一筆，改 AA 的檔再重跑）*/
  teahouse: {
    version: 2,
    id: 'wz_teahouse', name: '一盞', glb: 'assets/models/env/second_ai/aa_support/yizhan.glb', yardGlb: 'wz_teahouse_yard.glb（LAWWW2）',
    w: 8.4, d: 14.6, h: 2.6, wallColor: '#e6dcc4', floor: 'wood_light（D112：參考圖是深色木地板，改淺色）',
    zCenterNote: '區域 z −5～9.6：房子 z −5～5、緣側 5～6.2、前院 6.2～9.6（前院 LAWWW2 另一顆 GLB）',
    note: '主屋約 8×10 m＋緣側。西南角是土間玄關（石板地、一階木踏台、左牆鞋櫃）；中間木地板的茶席（一張長矮桌、六個坐墊）；東邊水屋（朝店裡的木作檯：流理台、電熱水壺、茶罐、沙漏、茶巾；後面牆上茶具層架；往後面的布暖簾）；後面兩間榻榻米和室（床之間、違い棚），中間襖；前面整排格子玻璃拉門對著緣側和院子（拉開收在兩端）。深色木柱、木梁、木板天花板，方形和紙吊燈。',
    front: {door: {x: -3.0, w: 1.0, note: '玄關的格子門（從前院的踏石進來）'}, openFront: true, shoji: {z: 5.0, x0: -2.2, x1: 4.2, note: '緣側和室內之間的格子玻璃拉門：拉開收在兩端（x −2.2～−1.4、3.4～4.2）'}},
    spawn: {x: -3.0, z: 4.2, yaw: Math.PI},
    camWalls: [[0, -0.6, 8.4, 0.12], [0, -3.8, 0.12, 6.4]],
    seeThru: ['wzs_washi', 'wzs_pendant', 'tree_bark_camphor'],
    seeThruNote: '照舊名字：方形和紙吊燈的紙＝材質 wzs_washi、吊線和框＝wzs_pendant；樟樹樹幹在 LAWWW2 的前院 GLB。',
    exit: {at: {x: -3.0, z: 4.6}, label: '離開一盞', to: 'wenzhou', spawn: {x: -20.5, z: 4.1, yaw: Math.PI}, note: '照舊；前院打開以後 LAWWW 搬到冠木門旁'},
    enterAt: {x: -20.5, z: 4.6, label: '進去一盞'},
    items: [
      {kind: 'genkan', x: -3.3, z: 4.4, w: 1.8, d: 1.2, note: '土間玄關：石板地（比室內低 0.12）、一階木踏台（上框）在 z 3.8、左牆鞋櫃、木製傘架'},
      {kind: 'getabako', x: -3.95, z: 4.4, w: 0.5, d: 1.2, h: 0.9, note: '鞋櫃（上面一盞方形紙座燈、一個花器）'},
      {kind: 'engawa', x: 1.0, z: 5.6, w: 6.4, d: 1.2, note: '緣側木地板（到 z 6.2；外緣柱子和簷 LAWWW2 做）'},
      {kind: 'zabuton', x: 0.6, z: 5.55, ry: 0}, {kind: 'zabuton', x: 2.4, z: 5.55, ry: 0},
      {kind: 'low_table', x: -1.6, z: 1.7, w: 2.6, d: 0.9, h: 0.35, note: '茶席：一張長矮桌（原本長桌＋六張椅子）；座位到桌邊 0.3 m（FIXED_COORDS §3）'},
      {kind: 'zabuton', x: -2.5, z: 0.95, ry: 0}, {kind: 'zabuton', x: -1.6, z: 0.95, ry: 0}, {kind: 'zabuton', x: -0.7, z: 0.95, ry: 0},
      {kind: 'zabuton', x: -2.5, z: 2.45, ry: Math.PI}, {kind: 'zabuton', x: -1.6, z: 2.45, ry: Math.PI}, {kind: 'zabuton', x: -0.7, z: 2.45, ry: Math.PI},
      {kind: 'stool_round', x: 3.05, z: 3.35, ry: -Math.PI / 2, note: '照舊：語彤的木凳（水屋西南角旁）'},
      {kind: 'mizuya', x: 3.75, z: 1.3, w: 0.8, d: 3.4, ry: -Math.PI / 2, note: '照舊位置大小（不往西多出來，FIXED_COORDS #3／§5-2）：朝店裡的胡桃木作檯（框格門板、厚檯面）＝劇情裡「茶屋的吧檯」（AA_657 §3）；台面：流理台、電熱水壺、茶罐、沙漏、茶巾、豆花的舊照片（TRACE_SQ14_catphoto）；後面東牆上兩層茶具層架、上面竹籃'},
      {kind: 'noren', x: 3.75, z: -0.55, w: 0.8, note: '水屋北端往後面的布暖簾（米色）'},
      {kind: 'plaque', side: 'right', along: 3.1, y: 1.85, w: 0.32, h: 0.75, note: '東牆的「一盞」直的木牌（參考圖右邊）'},
      {kind: 'jar', x: -1.8, z: 4.55, note: '緣側入口西邊的大甕＋插花（新加，有阻擋）'}, {kind: 'plant_big', x: 3.85, z: 4.55, note: '東南角的盆栽（新加，有阻擋）'},
      {kind: 'tatami_room', x: -2.15, z: -2.8, w: 4.1, d: 4.4, note: '和室 A：床之間（掛軸、插花）在後牆左邊'},
      {kind: 'tatami_room', x: 2.15, z: -2.8, w: 4.1, d: 4.4, note: '和室 B：違い棚'},
      {kind: 'low_table', x: -2.15, z: -2.8, w: 1.2, d: 0.8}, {kind: 'low_table', x: 2.15, z: -2.8, w: 1.2, d: 0.8},
      {kind: 'zabuton', x: -2.15, z: -3.5, ry: 0}, {kind: 'zabuton', x: -2.15, z: -2.1, ry: Math.PI}, {kind: 'zabuton', x: -3.0, z: -2.8, ry: Math.PI / 2}, {kind: 'zabuton', x: -1.3, z: -2.8, ry: -Math.PI / 2},
      {kind: 'zabuton', x: 2.15, z: -3.5, ry: 0}, {kind: 'zabuton', x: 2.15, z: -2.1, ry: Math.PI}, {kind: 'zabuton', x: 1.3, z: -2.8, ry: Math.PI / 2}, {kind: 'zabuton', x: 3.0, z: -2.8, ry: -Math.PI / 2},
      {kind: 'zabuton_stack', x: -0.55, z: -0.95, note: 'v1b：和室 A 東南角疊起來的三個坐墊（有阻擋）'},
      {kind: 'tokonoma', x: -3.3, z: -4.65, w: 1.6, d: 0.7},
      {kind: 'fusuma', x: 0.0, z: -2.8, w: 0.12, d: 4.4, note: '兩間和室中間的襖（關著）'},
      {kind: 'shoji_wall', z: -0.6, x0: -4.2, x1: 4.2, open: [[-3.2, -1.0], [1.0, 3.2]], note: '和室前面的紙拉門：中間各拉開 2.2 m'}
    ],
    blocks: [[-1.6, 1.7, 2.6, 0.9], [3.75, 1.3, 0.8, 3.4], [-2.15, -2.8, 1.2, 0.8], [2.15, -2.8, 1.2, 0.8], [-3.3, -4.65, 1.6, 0.7], [0.0, -2.8, 0.12, 4.4],
             [-3.7, -0.6, 1.0, 0.12], [-0.05, -0.6, 2.1, 0.12], [3.7, -0.6, 1.0, 0.12], [-1.8, 4.55, 0.5, 0.5], [3.85, 4.55, 0.6, 0.6], [-0.55, -0.95, 0.6, 0.65], [-3.95, 4.4, 0.5, 1.2], [-3.2, 5.6, 2.0, 1.2], [0.0, 7.9, 8.4, 3.4]],
    blocksNote: '最後兩塊（玄關前／緣側西端、整片前院）照舊；前院打開時由 LAWWW＋LAWWW2 拿掉、改成前院擺設各自的阻擋（AA_656、FIXED_COORDS §4 做法 A）。',
    walkNote: '照舊：玄關 → 茶席 → 水屋前 → 緣側都可以走；和室從紙拉門的開口進去',
    seats: [
      {x: -2.5, z: 0.95, yaw: 0, label: '坐下喝茶', kind: 'floor'}, {x: -1.6, z: 0.95, yaw: 0, label: '坐下喝茶', kind: 'floor'}, {x: -0.7, z: 0.95, yaw: 0, label: '坐下喝茶', kind: 'floor'},
      {x: -2.5, z: 2.45, yaw: Math.PI, label: '坐下喝茶', kind: 'floor'}, {x: -1.6, z: 2.45, yaw: Math.PI, label: '坐下喝茶', kind: 'floor'}, {x: -0.7, z: 2.45, yaw: Math.PI, label: '坐下喝茶', kind: 'floor'},
      {x: 3.05, z: 3.35, yaw: -Math.PI / 2, label: '坐在水屋旁'},
      {x: 0.6, z: 5.55, yaw: 0, label: '坐在緣側', kind: 'floor'}, {x: 2.4, z: 5.55, yaw: 0, label: '坐在緣側', kind: 'floor'},
      {x: -2.15, z: -3.5, yaw: 0, label: '在和室坐下', kind: 'floor'}, {x: -2.15, z: -2.1, yaw: Math.PI, label: '在和室坐下', kind: 'floor'},
      {x: 2.15, z: -3.5, yaw: 0, label: '在和室坐下', kind: 'floor'}, {x: 2.15, z: -2.1, yaw: Math.PI, label: '在和室坐下', kind: 'floor'}
    ],
    seatNote: '茶席六個位子從椅子改坐墊（kind floor，坐墊頂 0.08，FIXED_COORDS §3），座標、朝向、順序都不變；label 照舊「坐下喝茶」。',
    interact: [
      {x: 2.95, z: 1.3, kind: 'mizuya', label: '水屋（打工：泡茶）'},
      {x: -1.6, z: 3.1, kind: 'tea', label: '喝茶'},
      {x: 1.5, z: 5.9, kind: 'garden', label: '看院子'},
      {x: -3.0, z: -1.2, kind: 'tokonoma', label: '看床之間的掛軸'}
    ],
    work: {a: {me: {x: 3.4, z: 5.5, yaw: 0, act: 'sweep', note: '照舊；前院打開以後 LAWWW 移進院子'}, boss: {x: 2.75, z: 1.5, yaw: Math.PI / 2, act: 'stand'}},
           b: {me: {x: 2.75, z: 1.0, yaw: Math.PI / 2, act: 'brew'}, boss: {x: 2.75, z: 2.15, yaw: 2.6, act: 'stand'}},
           c: {me: {x: -0.5, z: 5.5, yaw: 0, act: 'stand'}, boss: {x: -1.6, z: 3.0, yaw: Math.PI, act: 'stand'}},
           end: {x: -3.0, z: 4.2, yaw: 0}},
    wallsFade: {back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  },
  /* ===== 林家乾麵、巷子裡定食（WZ-SHOP-AA364-ART，LAWWW2 2026-10-22；AA_364：能進去內用）=====
     店名、菜單、營業時間照 AA_364 第 2 節（企劃線 2b0429cd）；點餐、店員台詞、營業時間由 LAWWW 接（AA_364 第 4 節 #2）。這裡只放空間：走得進去、坐下、離開。
     front.windows 是建築的窗洞（Blender 開窗、裝玻璃）；front.views 是窗外街景的照片平面（遊戲 room() 的窗；正式模型接上以後放到玻璃外面）：一整片蓋住店面那一面，
     viewW／viewH／viewY 是大小和中心高度（room() 預設 2.2×1.6、高 2.1）；view＝照片名稱（assets/models/env/views/<view>_day|night.webp，tools/shots/shop_views.py）。
     clerk：店員站的位置（story3d.js 的 clerk 由 LAWWW 接）。 */
  lin: {
    id: 'wz_lin', name: '林家乾麵', glb: 'assets/models/env/second_ai/wz_lin_interior.glb',
    w: 6.4, d: 8.0, h: 3.0, wallColor: '#eef0e8', floor: 'mosaic',
    note: '約 6×8 m 的老麵店（A4，一樓整面開著）。店門口左邊是煮麵攤車（湯鍋三格、玻璃櫥裡生麵和青菜、滷味盤），右邊是入口；五張方桌、紅藍塑膠凳；左牆紅紙菜單，右牆電視和壁扇；後面是不鏽鋼工作檯（水槽、碗盤）、飲料冰箱、往後面廚房的布簾。',
    front: {door: {x: 1.0, w: 2.2, style: 'open'}, windows: [], open: [-3.0, 2.1], views: [[-3.0, 2.1]], view: 'wz_lin', viewDepth: 10, viewW: 3.8, viewH: 1.9, viewY: 1.3, note: '整面開著（鐵捲門捲在上面，open＝開口的範圍）：左邊是攤車，右邊 2.2 m 是入口'},
    spawn: {x: 1.0, z: 3.05, yaw: Math.PI},
    exit: {at: {x: 1.0, z: 3.55}, label: '離開林家乾麵', to: 'wenzhou', spawn: {x: 35.0, z: 4.1, yaw: Math.PI}},
    enterAt: {x: 35.0, z: 4.6, label: '進去林家乾麵', note: 'A4 店面中間偏西（A 側建築朝 −z，室內 x＝−(世界 x − 36)；攤車在世界 x 37.6、室內 x −1.6）'},
    items: [
      {kind: 'noodle_cart', x: -1.7, z: 3.3, w: 2.6, d: 0.7, h: 0.9, note: '煮麵攤車：三格湯鍋＋麵杓、玻璃櫥（生麵、青菜、餛飩）、滷味盤、碗疊；朝街上'},
      {kind: 'back_counter', x: -1.0, z: -3.65, w: 4.2, d: 0.6, h: 0.9, note: '後牆的不鏽鋼工作檯：水槽、砧板、碗盤架、大電鍋'},
      {kind: 'fridge', x: 2.65, z: -3.6, w: 0.75, d: 0.7, h: 1.85, note: '飲料冰箱（玻璃門）'},
      {kind: 'kitchen_curtain', x: 1.65, z: -3.97, w: 0.9, h: 1.85, note: '往後面廚房的布簾（不能進去）'},
      {kind: 'condiments', x: 2.97, z: -1.9, w: 0.4, d: 0.8, h: 0.85, note: '自取：筷子、湯匙、餐巾紙、辣椒醬、醋'},
      {kind: 'table_sq', x: -2.2, z: 1.6}, {kind: 'table_sq', x: -2.2, z: -0.1}, {kind: 'table_sq', x: -2.2, z: -1.8},
      {kind: 'table_sq', x: 1.9, z: 1.0}, {kind: 'table_sq', x: 1.9, z: -0.7},
      {kind: 'menu_strips', x: -3.17, y: 2.07, z: -0.3, ry: Math.PI / 2, w: 1.6, h: 0.9, note: '紅紙菜單：乾麵（小）40／乾麵（大）55／餛飩湯 40／貢丸湯 30／燙青菜 35／滷蛋 15（AA_364 第 2 節；貢丸湯是第 5 節第 2 點加的，和 wzshops3d.js 的 wall 那一行一樣）'},
      {kind: 'tv', x: 3.12, y: 2.35, z: 1.9, ry: -Math.PI / 2},
      {kind: 'wall_fan', x: 3.12, y: 2.45, z: -0.9, ry: -Math.PI / 2},
      {kind: 'calendar', x: -3.17, y: 1.55, z: 2.15, ry: Math.PI / 2}
    ],
    blocks: [[-1.7, 3.3, 2.6, 0.7], [-1.0, -3.65, 4.2, 0.6], [2.65, -3.6, 0.75, 0.7], [2.97, -1.9, 0.4, 0.8],
             [-2.2, 1.6, 0.75, 0.75], [-2.2, -0.1, 0.75, 0.75], [-2.2, -1.8, 0.75, 0.75], [1.9, 1.0, 0.75, 0.75], [1.9, -0.7, 0.75, 0.75]],
    walkNote: '入口 x −0.1～2.1；中間走道 x −1.6～1.3 從門口直通後面；點餐在攤車右邊 (−0.1, 2.55)',
    seats: [
      {x: -2.2, z: 1.05, yaw: 0, table: 1, label: '坐下', ap: [-1.3, 1.05]}, {x: -2.2, z: 2.15, yaw: Math.PI, table: 1, label: '坐下', ap: [-1.3, 2.2]},   /* ap：從中間走道走近（第一張桌子夾在攤車和第二張桌子中間，椅子四周站不下人；AA364 j23 reachability）*/
      {x: -2.2, z: -0.65, yaw: 0, table: 2, label: '坐下'}, {x: -2.2, z: 0.45, yaw: Math.PI, table: 2, label: '坐下'},
      {x: -2.2, z: -2.35, yaw: 0, table: 3, label: '坐下'}, {x: -2.2, z: -1.25, yaw: Math.PI, table: 3, label: '坐下'},
      {x: 1.9, z: 0.45, yaw: 0, table: 4, label: '坐下'}, {x: 1.9, z: 1.55, yaw: Math.PI, table: 4, label: '坐下'},
      {x: 1.9, z: -1.25, yaw: 0, table: 5, label: '坐下'}, {x: 1.9, z: -0.15, yaw: Math.PI, table: 5, label: '坐下'}
    ],
    interact: [
      {x: -0.1, z: 2.55, kind: 'order', label: '點餐（林家乾麵）'},
      {x: -1.3, z: -0.3, kind: 'menu', label: '看菜單'}
    ],
    clerk: {x: -1.7, z: 2.55, yaw: 0, note: '攤車後面（店裡這一側），對著湯鍋、面向街上'},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  },
  /* teishoku：照抄 src/data/komichi_layout.js（tools/layout/sync_wz_aa_layouts.js；不要手改這一筆，改 AA 的檔再重跑）*/
  teishoku: {
    version: 4,
    id: 'wz_teishoku', name: '小路', glb: 'assets/models/env/second_ai/aa_support/komichi.glb',
    w: 8.0, d: 8.0, h: 2.9, wallColor: '#e6d8b8', floor: 'wood_light（D112：參考圖是深色木地板，改淺色）',
    note: '約 8×8 m 的昭和懷舊居酒屋（B3）。格子拉門進來左手邊是結帳台；後面一整排木吧台（六張綠色皮面高腳凳），吧台後面是開放廚房：炭烤台、排油煙罩、整面酒瓶層架；吧台上方橫樑掛木札、上面一排清酒瓶、吊杯架。窗邊兩個隔板四人座，西牆綠色皮卡座，中間一張四人桌。黃銅吊燈、壁燈、懷舊電影海報、舊照片。',
    front: {door: {x: -2.0, w: 1.8, style: 'lattice'}, windows: [[-3.7, -3.1], [-0.6, 3.4]], sill: 0.85, head: 2.3, views: [[-3.7, 3.7]], view: 'wz_teishoku', viewDepth: 10, viewW: 5.5, viewH: 1.8, viewY: 1.25, note: '照舊（LAWWW2 11-04 04:47）'},
    spawn: {x: -2.0, z: 3.05, yaw: Math.PI},
    seeThru: ['kmc_vc', 'kmc_vc_gloss', 'kmc_vc_metal', 'kmc_walnut_rt', 'kmc_ceiling_wood', 'kmc_print', 'kmc_leaf_pothos', 'kmc_bulb'],
    camWalls: [[4.0, 0, 0.12, 8], [0, -4.0, 8, 0.12], [-4.0, 0, 0.12, 8]],
    camNote: 'WZ-SEAT-CAMS-1104（LAWWW2 帳號 A 11-10；BB-C 11-04 BB_255「小路座位鏡頭卡在樑和酒瓶層架之間」）：AA 12ae10d3e 加過一次，v4 配置蓋掉了；這次照 komichi.glb 現在的材質名重加——家具與隔板（kmc_vc）、酒瓶（kmc_vc_gloss）、吊著的鍋具與金屬架（kmc_vc_metal）、樑與層架（kmc_walnut_rt）、天花板木條、吊著的木札菜單與海報（kmc_print）、黃金葛、燈泡網點透空；右、後、左三面牆當鏡頭碰撞（[x, z, 寬, 深]）。tests/wz_seat_cams_1104_unit.js',
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
  }
};
/* ===== 一盞的前院走得進去（WZ-YIZHAN-1104；AA_656「庭院要能走到」；LAWWW2 claude/second-ai-env-art b0bcc117c 的 yard_patch_3424d8e66；LAWWW 11-04 07:17 同意 LAWWW2 b0bcc117c） =====
   上面的 teahouse 是照抄 AA 的 yizhan_layout.js v2（不要手改那一筆）；AA 寫明「前院打開以後的出生點、出口、打工 a／end 由 LAWWW＋LAWWW2 定」「最後兩塊阻擋（玄關前／緣側西端、整片前院）前院打開時拿掉、改成前院擺設各自的阻擋」（blocksNote、AA_656 第 3 節做法 A）——
   那幾樣在這裡改（數字照 LAWWW2 的 patch，原本寫在舊的 teahouse 那一筆）：
   · 出生點 (−3.0, 4.2) → 冠木門裡面 (−3.0, 9.0)；出口「離開一盞」(−3.0, 4.6) → 冠木門 (−3.0, 9.3)；回溫州街的落點、溫州街的進門點 enterAt 照舊（街上那一側本來就是冠木門）；
   · 打工下班 work.end (−3.0, 4.2) → 冠木門前 (−3.0, 8.0)（LAWWW 同意的規格改動①：舊的點離新出口 5.1 m）；打工 a 掃院子照舊站緣側東端；
   · 阻擋：拿掉 [−3.2, 5.6, 2.0, 1.2]（玄關前）、[0, 7.9, 8.4, 3.4]（整片前院），加石燈籠、景石、老樟樹、門內灌木、簷柱、甕；
   · yard：前院 −0.42、土間 −0.24、玄關 −0.12 的高度、緣側前的沓脫石、冠木門那一段開口、在前院才顯示簷和屋頂（zones3d.js teaYard）。 */
(function(T){ if(!T||T.version!==2||!/yizhan\.glb$/.test(T.glb||'')) return;
  T.spawn = {x: -3.0, z: 9.0, yaw: Math.PI};
  T.exit = Object.assign({}, T.exit, {at: {x: -3.0, z: 9.3}, note: 'WZ-YIZHAN-1104：出口在冠木門（原本在玄關 (-3.0, 4.6)）'});
  T.yard = {
    glb: 'assets/models/env/second_ai/wz_teahouse_yard.glb', manifest: 'bldg.wz_teahouse_yard',
    note: '前院走得進去（WZ-YIZHAN-1104，LAWWW2 11-04；數字在 docs/art-rebuild/second_ai/wip/wz_five_1104/DOORS.md）。地面比室內低 0.42：前院 y -0.42、玄關前的石板土間 -0.24、室內玄關 -0.12、室內 0。緣側和前院之間差 0.42（站不上去，緣側的邊就是盡頭），只有緣側前的沓脫石 (1.0, 6.4) 兩階各 0.21 上下；玄關前的土間兩階 0.18、0.12，走得進玄關。',
    surfs: [
      {x0: -4.6, x1: 4.6, z0: 6.2, z1: 9.8, y: -0.42},
      {x0: -4.2, x1: -2.2, z0: 5.0, z1: 6.2, y: -0.24},
      {x0: -4.2, x1: -2.4, z0: 3.8, z1: 5.0, y: -0.12},
      {x0: 0.55, x1: 1.45, z0: 5.75, z1: 6.65, axis: 'z', ya: 0.0, yb: -0.42, tread: 0.45, rise: 0.21, low: 'z1'}
    ],
    open: [[-3.5, 9.15, -2.5, 9.6]],   /* room() 牆內 0.4 m 不能站：冠木門那一段開出來（走到門口、按「離開一盞」）*/
    inYardZ: 6.35,   /* 玩家 z 超過這個（有 0.15 的緩衝）＝在前院：顯示簷（YARD_EAVE）、主屋的瓦屋頂（YARD_ROOF），緣側那一組牆（WALL_engawa_*）不淡出 */
    gate: {x: -3.0, z: 9.6, w: 1.2}
  };
  const drop = [[-3.2, 5.6, 2.0, 1.2], [0.0, 7.9, 8.4, 3.4]].map(b => b.join(','));
  T.blocks = T.blocks.filter(b => !drop.includes(b.join(','))).concat([[-1.5, 8.9, 0.5, 0.5], [2.2, 7.6, 1.0, 0.7], [3.65, 9.0, 0.5, 0.5], [-3.9, 9.05, 0.4, 0.9], [-2.2, 6.12, 0.14, 0.14], [-3.95, 5.35, 0.45, 0.45]]);   /* 石燈籠、景石、老樟樹、門內左邊的灌木、簷柱、甕 */
  T.walkNote = '冠木門 → 踏石 → 玄關前的石板土間 → 玄關 → 茶席 → 水屋前 → 緣側都可以走；和室從紙拉門的開口進去；前院和緣側之間只有沓脫石 (1.0, 6.4) 上下（WZ-YIZHAN-1104；原本前院擋住）';
  /* 2026-11-04 LAWWW 子代理拉開前院五個互動點（CC dac871e25 一盞探針：石燈籠↔木牌相距 0.99 m、貓碗↔樟樹 0.96 m、木牌↔離開一盞 0.92 m，走過去停下來按鈕是旁邊那個；tests/wz_interiors_aa659_unit.js A8b）：
     看院子 (0.2, 8.2)→(0.4, 7.7)、看石燈籠 (−1.5, 8.2)→(−0.85, 8.9)（石燈籠東邊）、看樟樹 (3.1, 8.4)→(2.95, 8.75)（樟樹西邊）、看貓碗 (4.05, 8.3)→(3.95, 7.9) 碗 (4.0, 8.7)→(4.05, 8.35)（樟樹南邊的地上）、看門口的木牌 (−2.1, 9.0)→(−2.0, 8.4)；互相 ≥1.25 m、離出口 (−3, 9.3) ≥1.3 m。要 AA 同步 AA_659 §3 */
  /* 前院的互動點（AA_659 第 3 節 bc021c7e1「位置（11-04 07:5x 定）」；台詞在 src/wzshops3d.js S.YARD）：看院子從緣側 (1.5, 5.9) 搬到前院中間；新加石燈籠、樟樹、貓碗（只在 WZ_CATBOWL 時：碗和按鈕一起，碗約 (4.0, 8.7)）、門口的木牌 */
  T.interact = T.interact.filter(q => q.kind !== 'garden').concat([
    {x: 0.4, z: 7.7, kind: 'garden', label: '看院子', note: '前院中間，踏石旁（原本在緣側 (1.5, 5.9)）'},
    {x: -0.85, z: 8.9, kind: 'lantern', label: '看石燈籠', note: '石燈籠（阻擋 (−1.5, 8.9)）東邊'},
    {x: 2.95, z: 8.75, kind: 'camphor', label: '看樟樹', note: '老樟樹（阻擋 (3.65, 9.0)）西邊'},
    {x: 3.95, z: 7.9, kind: 'catbowl', label: '看貓碗', bowl: {x: 4.05, z: 8.35}, cond: 'WZ_CATBOWL', note: '貓碗放在樟樹南邊的地上；找到貓以後、收養以前才有（zones3d.js catBowlOn）'},
    {x: -2.0, z: 8.4, kind: 'gatesign', label: '看門口的木牌', note: '冠木門東邊門柱（x ≈ −2.4）上的木牌'}
  ]);
  T.work = Object.assign({}, T.work, {end: {x: -3.0, z: 8.0, yaw: 0, note: '前院、冠木門前，面向門口（WZ-YIZHAN-1104：出口搬到冠木門 (-3.0, 9.3)；原本在玄關 (-3.0, 4.2)，離新出口 5.1 m）'}});
})(WZ_SHOPS_LAYOUT.teahouse);
/* ===== 阿德影印：長桌那三張椅子往後 0.2 m（ADE-SEAT-CLIP-1105，LAWWW2-C 11-05；使用者 06:5x 截圖：靠走道坐著的男生胸口、手臂卡進桌子） =====
   上面的 print 是照抄 ade_layout.js（不要手改那一筆）。v1c 的三張電腦椅中心在 x −0.07，長桌西緣在 x −0.04：座位離桌緣只有 0.03 m（椅子前緣伸進桌子底下 0.19 m），
   人坐下去，胸口、手臂就在桌子裡（SEATACT 的近桌片段最近只到桌緣 0.14 m）。這裡把那三張（座位和椅子）沿著自己面向的反方向往後挪 0.25 m（11-05 LAWWW-C 回報 0.2 m 時 M2 偶爾還有 2 點穿過桌板）：座位離桌緣 0.285 m；
   第四張「沒推進去」的（x −0.2，離桌緣 0.16）不動。模型裡的椅子是 instancing（ad_chair_0_*_inst），zones3d.js wzAAattach 照 chairShift 把那三個 instance 一起挪。
   tests/ade_seat_clip_unit.js。AA／CC 改 ade_layout.js 把椅子拉開以後，這一段要拿掉（from 對不上就不動）。 */
(function(T){ if(!T||!/\/ade\.glb$/.test(T.glb||'')) return; const D=0.25, near=(a,x,z)=>Math.abs(a.x-x)<0.01&&Math.abs(a.z-z)<0.01, FROM=[[-0.07,2.6],[-0.07,0.85],[-0.07,0.25]], moved=[];
  for(const [x,z] of FROM){ const s=(T.seats||[]).find(q=>q.kind==='chair'&&near(q,x,z)), it=(T.items||[]).find(q=>q.kind==='chair'&&near(q,x,z)); if(!s||!it) continue;
    const sx=Math.sin(s.yaw), sz=Math.cos(s.yaw), ix=Math.sin(it.yaw), iz=Math.cos(it.yaw);
    s.x=+(s.x-sx*D).toFixed(3); s.z=+(s.z-sz*D).toFixed(3); it.x=+(it.x-ix*D).toFixed(3); it.z=+(it.z-iz*D).toFixed(3); moved.push({from:[x,z],to:[it.x,it.z]}); }
  T.chairShift=moved;
})(WZ_SHOPS_LAYOUT.print);
if (typeof module !== 'undefined') module.exports = WZ_SHOPS_LAYOUT;
