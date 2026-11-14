/* ===== SUNNY SIDE 室內（溫州街 B7，取代半熟；歐式街角早午餐；AA 2026-11-04 v1b（LAWWW2 05:57：卡座兩個位子站不進去——沙發 block 深 0.45、卡座桌和對面椅子往東 0.15）；使用者 11-04 04:4x 參考圖；AA_654、AA_655） =====
   參考圖：docs/story_planning/ref_images/shops/wz_sunnyside_int.webp（室內）、wz_sunnyside_ext.webp（外觀，LAWWW2 做）。美術規則：SCENE_RULES §10～12＋LAWWW2 11-04 04:45。
   **遊戲區域照舊是 `wz_brunch`**：這份是 WZ_SHOPS_LAYOUT.brunch 的新版（格式一樣，LAWWW 換掉那一筆就好）。
   不動的（docs/handoff/WZ_SHOPS1_FIXED_COORDS.md §3）：房間 6.4 × 10 × 3.2、門 x 0.4（寬 1.0）、窗 x −3～−0.3 和 1.1～3（窗台 0.75、窗頂 2.55）、
   出口 (0.4, 4.45)、出生點 (0.4, 4.0)、點餐 (1.95, −1.1)、店員 (2.6, −2.05, yaw −0.6)、打工告示 (2.2, −2.1)；後牆料理台、冰箱、出餐檯、結帳櫃台的位置；出餐檯右端到右牆是進廚房的路。
   改的（照參考圖）：左牆三張兩人桌 → 奶油色布面長沙發卡座（兩張桌子＋對面椅子）；中間、右邊方木桌＋大理石小圓桌、曲木藤面椅；出餐檯左段加兩張高腳凳（店內偶遇「阿哲坐在吧檯」）；
   出餐檯上方一道矮牆掛深綠菜單板（SUNNY SIDE BRUNCH）；黑白斜鋪小方磚地板；左牆金框鏡子、水彩畫、壁燈。
   參考圖的鏡頭站在門邊往裡面看：左邊結帳櫃台＋卡座、正前方菜單板和開放廚房、右邊窗邊的大理石圓桌。遊戲裡的門在店面中間偏右，窗在門的兩邊，結帳櫃台在右邊中段（不能動），所以左右和參考圖不完全一樣。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const SUNNYSIDE_LAYOUT = {
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
};
if (typeof module !== 'undefined') module.exports = SUNNYSIDE_LAYOUT;
