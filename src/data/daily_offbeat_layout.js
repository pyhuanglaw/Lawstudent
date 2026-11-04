/* ===== 日常失速 DAILY OFFBEAT 室內（溫州街靠新生南路那一頭的轉角一樓；AA 子代理 2026-11-03 v1，臨時支援 LAWWW2，SCENE_RULES 第 10 節） =====
   企劃：AA_617、AA_618（企劃線 claude/story-planning）。參考圖：docs/story_planning/ref_images/wz_cafes/daily_offbeat_ref_v2.webp。
   這裡是吃飯、聊天、玩桌遊的地方（使用者 11-03：「日常失速是吃飯打屁桌遊」）——座位不給「讀書」。
   這份給遊戲（LAWWW2 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/aa_support/daily_offbeat_interior.py）共用。
   座標：房間中心在原點，x 往東、z 往南、y 往上；店門在 +z（z＝d/2）；公尺。格式照 src/data/wz_shops_layout.js 開頭的說明。
   yaw：人面向 (sin yaw, cos yaw)——0＝面向 +z（店門）、π＝面向 −z（吧檯）、π/2＝面向 +x、−π/2＝面向 −x。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由區域自己擋）。exit、enterAt 留空（LAWWW2 填）。
   LAWWW2 11-04（WZ-OFFBEAT-1104）接進遊戲：區域 wz_offbeat（zones3d.js 的 wzShop，和林家乾麵、巷子裡定食同一套）；填了 exit、enterAt；吧檯高腳椅加 lift 0.27（座面 0.72，和 Café、定食店的吧台一樣）；
   五個座位加 ap（「坐下」走到的位置）：卡座三個（裡面是牆、前面是桌子，四周站不下人）、最西邊的吧檯高腳凳、轉角桌靠窗那一張（tests/wz_offbeat_unit.js 第 3 項）。
   出生點 z 4.3 → 3.0（離門口的「離開日常失速」1.55 m，在它的範圍 1.3 外面：tests/spawn_exit_unit.js）。
   溫州街那一端：W2（溫州街 (−37.2, −13.5)、朝 +x、寬 11）的一樓。室內 (x, z) → 溫州街 (iz − 42.2, −13.5 − x)：店門 (−3.9, 5) ＝ 溫州街 (−37.2, −9.6)。 */
const DAILY_OFFBEAT_LAYOUT = {
  version: 2,   /* v2（2026-11-03 AA，LAWWW2 照 SCENE_RULES §12 退回）：前窗改落地窗（窗台 0.05、窗頂 3.15）；東牆的窗縮成 z −3.8～0.3，z 0.55～4.55 做整面社團佈告欄（corkboard_east）；互動點多一個；座位、blocks 沒動 */
  id: 'daily_offbeat', name: '日常失速', glb: 'assets/models/env/second_ai/aa_support/daily_offbeat.glb',
  w: 11.0, d: 10.0, h: 3.4, floor: 'checker_green_cream', wallColor: '#f0dfae',
  note: '轉角一樓 11×10×3.4 m。店門在 +z 西段，+z、+x 兩面大窗（轉角）。後牆西半是開放吧檯（綠磁磚吧檯正面、後面層板、咖啡機、黑板菜單），東半是桌遊櫃；中間一張八人長桌，西牆一排卡座＋軟木公告板，兩面窗邊各三張雙人桌，轉角一張雙人桌。共 32 席（長桌 8、吧檯高腳椅 4、卡座 6、前窗 6、側窗 6、轉角 2）；另有一張空椅子是貓「店長」的位置（不算席位）。',
  front: {door: {x: -3.9, w: 1.2, h: 2.3}, windows: [[-3.0, 5.2]], sill: 0.05, head: 3.15, note: 'v2 落地窗（黑鐵窗框每 1.1 m 一格、2.65 m 一道橫框）；外面一條綠色波浪邊遮雨棚（併在 WALL_front；外觀若另外做，LAWWW2 可以刪掉這一條）'},
  side: {right: {windows: [[-3.8, 0.3]], sill: 0.05, head: 3.15, note: 'v2b 東窗也改落地窗（轉角兩面臨街）'}},
  spawn: {x: -3.9, z: 3.0, yaw: Math.PI},
  exit: {at: {x: -3.9, z: 4.55}, label: '離開日常失速', to: 'wenzhou', spawn: {x: -34.8, z: -9.6, yaw: Math.PI / 2}},   /* 出來站在店門外的巷子上、面向橫巷（+x）；離「進去日常失速」1.7 m */
  enterAt: {x: -36.5, z: -9.6, label: '進去日常失速', note: '溫州街 W2 一樓的店門（西側橫巷靠主巷那一頭；人行道 x −37.0 以東走得到）'},
  items: [
    {kind: 'bar_front', x: -2.95, z: -3.25, w: 4.5, d: 0.6, h: 1.05, note: '吧檯：正面綠磁磚、淺木檯面、底部踢腳；檯面上蛋糕玻璃櫃、收銀機、杯子'},
    {kind: 'bar_back', x: -2.94, z: -4.7, w: 4.88, d: 0.6, h: 0.92, note: '後面的工作檯：咖啡機、兩台磨豆機、水槽；上方兩段層板（酒瓶、罐子、杯子）'},
    {kind: 'menu_board', x: -3.0, y: 2.45, z: -4.99, w: 2.2, h: 1.1, note: '黑板菜單（後牆）'},
    {kind: 'game_shelf', x: 2.1, z: -4.78, w: 2.6, d: 0.42, h: 1.6, note: '桌遊櫃（格子櫃，盒子橫放、直放）'},
    {kind: 'long_table', x: 0.3, z: 0.15, w: 3.4, d: 0.95, note: '八人長桌（淺木、黑鐵腳）；桌上兩盒桌遊、兩瓶小花'},
    {kind: 'banquette', x: -5.12, z: 0.25, w: 0.52, d: 4.3, note: '西牆的卡座（墨綠皮面、淺木框），上方軟木公告板'},
    {kind: 'corkboard', x: -5.49, y: 1.85, z: 0.2, w: 4.0, h: 1.0, note: '軟木公告板：社團傳單、便利貼（遊戲裡的社團名；D115 校名）'},
    {kind: 'poster', x: 4.4, y: 1.85, z: -4.99, w: 1.0, h: 1.5, note: '首都帝大海報（後牆東段）'},
    {kind: 'poster', x: 2.1, y: 2.45, z: -4.99, w: 0.9, h: 0.9, note: '虛構的唱片行海報（桌遊櫃上方）'},
    {kind: 'cat_chair', x: 2.45, z: 0.15, ry: -Math.PI / 2, note: '貓「店長」的椅子（長桌東端，空的；椅背貼紙條「店長 請勿打擾」）——3D 的貓這一版沒做，只留位置'},
    {kind: 'corkboard_east', x: 5.47, y: 1.75, z: 2.55, w: 4.0, h: 1.5, note: 'v2：東牆整面社團佈告欄（參考圖重點）：標題牌「首都帝大學生社團＆活動」、22 種傳單共 44 張互相疊、便利貼'},
    {kind: 'duct', note: '天花板下一條外露的圓風管（z=-1.6）'}
  ],
  blocks: [
    [-2.95, -3.25, 4.5, 0.6], [-2.94, -4.7, 4.88, 0.6], [2.1, -4.78, 2.6, 0.44],
    [0.3, 0.15, 3.4, 0.95], [2.45, 0.15, 0.45, 0.45],
    [-5.12, 0.25, 0.52, 4.3], [-4.45, -1.3, 0.6, 0.6], [-4.45, 0.1, 0.6, 0.6], [-4.45, 1.5, 0.6, 0.6],
    [-1.4, 4.2, 0.64, 0.64], [0.65, 4.2, 0.64, 0.64], [2.7, 4.2, 0.64, 0.64],
    [4.55, -2.9, 0.64, 0.64], [4.55, -0.95, 0.64, 0.64], [4.55, 1.0, 0.64, 0.64], [4.45, 3.65, 0.64, 0.64],
    [-5.05, 4.45, 0.55, 0.55], [4.95, -4.5, 0.55, 0.55]
  ],
  walkNote: '門口 (−3.9, 4.6) → 往北的走道 x −3.3～−2.2（前窗第一張桌子的椅子在 x −1.95）；吧檯前 z −2.95～−0.55 是 1.6 m 的走道（高腳椅在 z −2.6）；長桌兩側離窗邊桌子都 ≥ 1.2 m。員工從吧檯東端 x −0.7～0.2 進吧檯（z −4.4～−3.55 是吧檯裡面）',
  seats: [
    /* 八人長桌（table 1）：北側面向 +z、南側面向 −z */
    {x: -0.9, z: -0.57, yaw: 0, table: 1, label: '坐下'}, {x: -0.1, z: -0.57, yaw: 0, table: 1, label: '坐下'}, {x: 0.7, z: -0.57, yaw: 0, table: 1, label: '坐下'}, {x: 1.5, z: -0.57, yaw: 0, table: 1, label: '坐下'},
    {x: -0.9, z: 0.87, yaw: Math.PI, table: 1, label: '坐下'}, {x: -0.1, z: 0.87, yaw: Math.PI, table: 1, label: '坐下'}, {x: 0.7, z: 0.87, yaw: Math.PI, table: 1, label: '坐下'}, {x: 1.5, z: 0.87, yaw: Math.PI, table: 1, label: '坐下'},
    /* 吧檯高腳椅（table 2；座面 0.72 m） */
    {x: -4.6, z: -2.6, yaw: Math.PI, table: 2, seatH: 0.72, lift: 0.27, label: '坐吧檯', ap: [-4.6, -2.15]}, {x: -3.7, z: -2.6, yaw: Math.PI, table: 2, seatH: 0.72, lift: 0.27, label: '坐吧檯'},
    {x: -2.8, z: -2.6, yaw: Math.PI, table: 2, seatH: 0.72, lift: 0.27, label: '坐吧檯'}, {x: -1.9, z: -2.6, yaw: Math.PI, table: 2, seatH: 0.72, lift: 0.27, label: '坐吧檯'},
    /* 西牆卡座（table 3～5）：卡座那一邊面向 +x、椅子那一邊面向 −x */
    {x: -5.1, z: -1.3, yaw: Math.PI / 2, table: 3, label: '坐下', ap: [-4.8, -2.05]}, {x: -3.8, z: -1.3, yaw: -Math.PI / 2, table: 3, label: '坐下'},
    {x: -5.1, z: 0.1, yaw: Math.PI / 2, table: 4, label: '坐下', ap: [-4.5, 0.7]}, {x: -3.8, z: 0.1, yaw: -Math.PI / 2, table: 4, label: '坐下'},
    {x: -5.1, z: 1.5, yaw: Math.PI / 2, table: 5, label: '坐下', ap: [-4.8, 2.4]}, {x: -3.8, z: 1.5, yaw: -Math.PI / 2, table: 5, label: '坐下'},
    /* 前窗雙人桌（table 6～8） */
    {x: -1.95, z: 4.2, yaw: Math.PI / 2, table: 6, label: '坐窗邊'}, {x: -0.85, z: 4.2, yaw: -Math.PI / 2, table: 6, label: '坐窗邊'},
    {x: 0.1, z: 4.2, yaw: Math.PI / 2, table: 7, label: '坐窗邊'}, {x: 1.2, z: 4.2, yaw: -Math.PI / 2, table: 7, label: '坐窗邊'},
    {x: 2.15, z: 4.2, yaw: Math.PI / 2, table: 8, label: '坐窗邊'}, {x: 3.25, z: 4.2, yaw: -Math.PI / 2, table: 8, label: '坐窗邊'},
    /* 側窗雙人桌（table 9～11） */
    {x: 4.55, z: -3.45, yaw: 0, table: 9, label: '坐窗邊'}, {x: 4.55, z: -2.35, yaw: Math.PI, table: 9, label: '坐窗邊'},
    {x: 4.55, z: -1.5, yaw: 0, table: 10, label: '坐窗邊'}, {x: 4.55, z: -0.4, yaw: Math.PI, table: 10, label: '坐窗邊'},
    {x: 4.55, z: 0.45, yaw: 0, table: 11, label: '坐窗邊'}, {x: 4.55, z: 1.55, yaw: Math.PI, table: 11, label: '坐窗邊'},
    /* 轉角雙人桌（table 12） */
    {x: 4.45, z: 3.1, yaw: 0, table: 12, label: '坐窗邊'}, {x: 4.45, z: 4.2, yaw: Math.PI, table: 12, label: '坐窗邊', ap: [3.85, 4.05]}
  ],
  interact: [
    {x: -1.2, z: -2.55, kind: 'order', label: '點東西吃'},
    {x: -1.85, z: 0.15, kind: 'boardgame', label: '玩桌遊（長桌；有朋友在的時候）', note: '長桌西端站的位置；桌遊盒在桌上'},
    {x: 2.95, z: 0.15, kind: 'cat', label: '看看店長／摸摸店長', note: '貓的椅子在 (2.45, 0.15)'},
    {x: -3.6, z: 0.3, kind: 'flyers', label: '看公告板', note: '西牆軟木板（社團傳單）'},
    {x: 2.1, z: -4.0, kind: 'boardgame_shelf', label: '看桌遊櫃'},
    {x: 3.9, z: 2.35, kind: 'flyers', label: '看社團佈告欄', note: 'v2：東牆的大佈告欄（table 11、12 中間站的位置）'}
  ],
  floorSit: [],
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = DAILY_OFFBEAT_LAYOUT;
