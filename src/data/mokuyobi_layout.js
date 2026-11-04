/* ===== 木曜日 Mokuyōbi 室內（溫州街巷中老公寓二樓；AA 子代理 2026-11-03 v1，臨時支援 LAWWW2，SCENE_RULES 第 10 節） =====
   企劃：AA_617、AA_618（企劃線 claude/story-planning）。參考圖：docs/story_planning/ref_images/wz_cafes/mokuyobi_ref_v2.webp。
   安靜念書＋兩個人約會、深談（使用者 11-03：「木曜日要很適合念書 很多人在念書」）——座位都可以讀書（canStudy）。
   這份給遊戲（LAWWW2 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/aa_support/mokuyobi_interior.py）共用。
   座標：房間中心在原點，x 往東、z 往南、y 往上（y＝0 是二樓的地板）；臨街的窗在 +z（z＝d/2）；公尺。格式照 src/data/wz_shops_layout.js 開頭的說明。
   一樓的深綠鐵門、樓梯、外觀不在這裡（LAWWW2）：樓梯上到二樓的西南角 stairWell，樓梯口有一道木框門（店門），進門是 spawn。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。exit、enterAt 留空（LAWWW2 填）。 */
const MOKUYOBI_LAYOUT = {
  version: 4,   /* v3c（2026-11-03 LAWWW2，整合用）：樓梯間往北加長——溫州街老公寓一樓高 3.4 m（wz_street GH），原本開口 z 4.6～7.0 只有 2.4 m、算出來 55°，走不上去（D38 第 4 點）；
     改成二樓地板 3.2 m（老公寓的一樓常見 3.0～3.2 m）、16 階×0.2 m、踏面 0.294 m（約 34°；遊戲引擎人物半徑 0.32 m 內高度差 ≤ 0.25 m，最陡約 38°）：
     開口 z 2.54～7.0、平台 z 1.54～2.54；店門改開在東邊隔間牆（x −3.0、z 1.59～2.54，面向東）；
     西牆大書櫃縮成 z −1.9～1.4、table 3 搬到 z 0.6、table 4 搬到 z −1.6、衣帽架搬到店門南邊 (−2.7, 2.75)、地上那疊書 (−4.2, −2.15)、原本 (−4.1, 3.1) 的大盆栽拿掉（在加長的樓梯間裡；店門旁已經有 v3b 那盆矮的，AA 11-03 23:51 提醒兩盆會擠在店門口）。其他照 v3b。
     v3b（同日 LAWWW2 驗收第二輪）：中景加 table 10 方桌 (2.3, 4.2)、table 11 圓桌 (−0.45, 4.45) 各 2 席（共 24 席）＋落地植物 (−2.15, 3.75)；blocks 跟著加。v3（2026-11-03 AA，SCENE_RULES §12 照參考圖）：唱片櫃＋《夏の残光》搬到臨街那面牆窗右邊的實牆（前窗縮成 x −2.6～2.6）、東牆小展示櫃換成高書櫃、樓梯間前的高書櫃改矮櫃＋《雨後的車站》掛在隔間牆；blocks、互動點跟著改；座位沒動 */
 /* v2 註：   /* v2（2026-11-03）：加了窗下矮書櫃、樓梯間前的高書櫃、北牆格子展示櫃、東牆小展示櫃、第四盆大盆栽、中間一桌（table 9，2 席；共 20 席）——blocks 跟著加；其他座位、出口、樓梯、stairWell 都沒動 */
  id: 'mokuyobi', name: '木曜日', glb: 'assets/models/env/second_ai/aa_support/mokuyobi.glb',
  w: 9.0, d: 14.0, h: 3.0, floorY: 0, floor: 'terrazzo_light_with_rugs', wallColor: '#efe6d3',
  note: '老公寓二樓 9×14×3.0 m。臨街（+z）一整排木框窗，窗外是老樹（窗景卡）。西南角是上來的樓梯間（木框店門＋門鈴）；西牆一座胡桃木大書櫃＋唱片櫃（黑膠唱片機）；北側西半是小吧檯（老闆煮咖啡），東北角是書櫃半隔開的沙發區（隱密）；東牆兩張電影海報（虛構片名）。地板磨石子＋兩塊地毯（D112 不用深色木地板），家具胡桃木。共 20 席（v2 加中間一桌 2 席）：原本 18 席：窗邊雙人桌兩組 4、西側兩張 4、中間一張 2、東牆一張 2、沙發區 4、吧檯 2。每張桌子一盞小檯燈；沒有插座。',
  front: {windows: [[-2.6, 2.6]], sill: 0.75, head: 2.55, note: '一整排木框窗（每 0.9 m 一格、上面一排小氣窗）；窗簾是奶油白的紗簾；v3 窗縮成 x −2.6～2.6，x 2.6～4.5 是實牆（唱片櫃、檯燈、《夏の残光》照參考圖靠這面牆；LAWWW2 11-03 選甲，外觀的二樓窗照這個範圍開、實牆外面是老公寓磁磚牆）'},
  stairWell: {x0: -4.5, x1: -3.0, z0: 1.54, z1: 7.0, door: {side: 'east', x: -3.0, z: 2.065, w: 0.95, h: 2.1}, rise: 3.2, risers: 16, tread: 0.294, top: 2.54,
              note: 'v3c：樓梯從一樓（臨街 z 7.0）往北爬 16 階到平台（z 1.54～2.54，二樓地板高 3.2）；店門在東邊隔間牆。這個 GLB 只有樓梯間的隔間牆（併在 WALL_front 那一組）、店門框、平台那一塊地板；z 2.54～7.0 是樓梯開口，地板空著。一樓的樓梯、扶手、牆在 LAWWW2 的 mokuyobi_stair.py'},
  stairTop: {x: -3.75, z: 2.04, note: '樓梯頂的平台（進店前站的位置）'},
  spawn: {x: -2.35, z: 2.065, yaw: Math.PI / 2},
  exit: null,     /* LAWWW2 填（下樓） */
  enterAt: null,  /* LAWWW2 填（一樓鐵門） */
  items: [
    {kind: 'bookcase', x: -4.28, z: -0.25, ry: Math.PI / 2, w: 3.3, d: 0.42, h: 2.45, note: '西牆的胡桃木大書櫃（6 層；書可以拿下來看）'},
    {kind: 'record_cabinet', x: 3.55, z: 6.73, ry: Math.PI, w: 1.5, d: 0.5, h: 0.82, note: '唱片櫃：上面黑膠唱片機＋檯燈、旁邊一箱唱片；v3 靠臨街那面牆窗右邊的實牆（面向北）'},
    {kind: 'counter', x: -2.95, z: -5.6, w: 3.1, d: 0.55, h: 1.0, note: '小吧檯（老闆在後面：手沖壺、磨豆機、蛋糕櫃）；後牆層板放杯子'},
    {kind: 'sofa_l', x: 3.0, z: -6.0, note: 'L 形沙發：長邊靠北牆 x 1.6～4.4、短邊靠東牆 z −6.25～−4.8'},
    {kind: 'coffee_table', x: 2.6, z: -5.3, w: 0.6, d: 0.36, h: 0.42, note: 'v3c：原本 1.0×0.6 在 (2.9, −5.45)，和沙發之間只剩 0.49 m、沙發中間和轉角那兩個位子走不進去；縮小、往西移'},
    {kind: 'half_bookcase', x: 2.3, z: -4.05, w: 1.8, d: 0.34, h: 1.35, note: '半高書櫃，把沙發區隔開'},
    {kind: 'poster', wall: 'front', x: 3.55, y: 1.75, z: 6.97, w: 0.7, h: 1.05, note: '《夏の残光》（虛構）；v3 臨街那面牆的實牆段、唱片櫃上方'},
    {kind: 'poster', wall: 'stair', x: -2.97, y: 1.75, z: 5.55, w: 0.7, h: 1.05, note: '《雨後的車站》（虛構）；v3 掛在樓梯間隔間牆（面向東）、矮櫃上方'},
    {kind: 'rug', x: 0.5, z: 1.3, w: 2.6, d: 3.6}, {kind: 'rug', x: 2.9, z: -5.5, w: 2.6, d: 2.0},
    {kind: 'sideboard', x: 4.27, z: -1.0, ry: -Math.PI / 2, w: 2.0, d: 0.46, h: 0.8, note: '東牆的胡桃木矮櫃（四個抽屜；上面一疊書、一盆植物、一盞檯燈）'},
    {kind: 'coat_rack', x: -2.7, z: 2.75, note: '店門旁的衣帽架（一件外套、一把雨傘）'},
     {kind: 'plant_big', x: 4.1, z: 3.9, note: 'v3 從窗邊東角移到東牆書櫃南邊'}, {kind: 'plant_big', x: -0.9, z: -6.65},
    {kind: 'book_stack', x: -4.2, z: -2.15, note: '書櫃和唱片櫃之間地上的一疊書'},
    {kind: 'window_view', z: 9.5, note: '窗外的老樹（窗景卡 WALL_front_VIEW_mok_window_view，離窗 2.5 m、14 × 6.5 m；自訂屬性 windowView；v2 自己一張 2048×1024 的圖，有一點自發光）'},
    {kind: 'under_window_shelf', x: 0.0, z: 6.83, w: 5.0, d: 0.3, h: 0.6, note: 'v2：窗下的矮書櫃（兩層書）'},
    {kind: 'stair_bookcase', x: -2.73, z: 5.3, w: 2.4, d: 0.34, h: 0.9, note: 'v3：樓梯間隔間牆前的矮櫃（面向東；上面一疊書、海報掛在上方）；v2 是 2.4 m 高書櫃'},
    {kind: 'display_case', x: 0.4, z: -6.81, w: 1.8, d: 0.38, h: 2.35, note: 'v2：北牆的格子展示櫃（抽屜、時鐘、相框、植物、書）'},
    {kind: 'bookcase_east', x: 4.31, z: 5.65, w: 1.6, d: 0.38, h: 2.35, note: 'v3：東牆的高書櫃（參考圖左牆那座，頂上黃金葛；緊靠唱片櫃那個角落，照參考圖）；取代 v2 的小展示櫃'},
    {kind: 'plant_big', x: 4.1, z: -3.5, note: 'v2'}, {kind: 'plant_big', x: -2.15, z: 3.75, note: 'v3b：中景圓桌旁的落地植物'}, {kind: 'rug', x: 0.45, z: -1.9, w: 2.0, d: 1.8, note: 'v2'}
  ],
  blocks: [
    [-3.75, 4.77, 1.5, 4.46],   /* v3c：樓梯開口（平台 z 2.03～3.03 走得到，木曜日區域另外接樓梯的兩層導航）*/
    [-4.28, -0.25, 0.44, 3.3], [3.55, 6.73, 1.5, 0.5], [-2.95, -5.6, 3.1, 0.55], [-2.95, -6.8, 3.1, 0.4],
    [3.0, -6.62, 2.8, 0.76], [4.12, -5.5, 0.76, 1.5], [2.6, -5.3, 0.6, 0.36], [2.3, -4.05, 1.8, 0.34],
    [-0.9, 6.15, 0.7, 0.7], [2.4, 6.15, 0.7, 0.7], [-3.0, 0.6, 0.7, 0.7], [-3.0, -1.6, 0.7, 0.7], [0.5, 2.6, 0.7, 0.7], [3.6, 2.2, 0.7, 0.7],
    [4.1, 3.9, 0.6, 0.6], [4.27, -1.0, 0.46, 2.0], [-2.7, 2.75, 0.4, 0.4],  [-0.9, -6.65, 0.45, 0.45], [-4.2, -2.15, 0.3, 0.36],
    /* v2 */ [0.0, 6.83, 5.0, 0.3], [-2.73, 5.3, 0.36, 2.4], [0.4, -6.81, 1.8, 0.38], [4.31, 5.65, 0.38, 1.6], [4.1, -3.5, 0.45, 0.45], [0.45, -1.9, 0.7, 0.7],
    /* v3b */ [2.3, 4.2, 0.7, 0.7], [-0.45, 4.45, 0.7, 0.7], [-2.15, 3.75, 0.5, 0.5]
  ],
  walkNote: '店門 (−3.75, 3.6) 進來往東、往北都有 ≥ 1 m 的走道；吧檯前 z −5.3～−4.4（老闆在 z −6.6～−5.9）；沙發區從 x 1.4 以西、z −4.6 進去（半高書櫃擋著 z −4.05 那一段）',
  seats: [
    {x: -1.45, z: 6.15, yaw: Math.PI / 2, table: 1, canStudy: true, label: '坐窗邊'}, {x: -0.35, z: 6.15, yaw: -Math.PI / 2, table: 1, canStudy: true, label: '坐窗邊'},
    {x: 1.85, z: 6.15, yaw: Math.PI / 2, table: 2, canStudy: true, label: '坐窗邊'}, {x: 2.95, z: 6.15, yaw: -Math.PI / 2, table: 2, canStudy: true, label: '坐窗邊'},
    {x: -3.0, z: 0.05, yaw: 0, table: 3, canStudy: true, label: '坐下'}, {x: -3.0, z: 1.15, yaw: Math.PI, table: 3, canStudy: true, label: '坐下'},
    {x: -3.0, z: -2.15, yaw: 0, table: 4, canStudy: true, label: '坐下'}, {x: -3.0, z: -1.05, yaw: Math.PI, table: 4, canStudy: true, label: '坐下'},
    {x: -0.05, z: 2.6, yaw: Math.PI / 2, table: 5, canStudy: true, label: '坐下'}, {x: 1.05, z: 2.6, yaw: -Math.PI / 2, table: 5, canStudy: true, label: '坐下'},
    {x: 3.6, z: 1.65, yaw: 0, table: 6, canStudy: true, label: '坐下'}, {x: 3.6, z: 2.75, yaw: Math.PI, table: 6, canStudy: true, label: '坐下'},
    {x: 2.2, z: -6.45, yaw: 0, table: 7, seatH: 0.44, canStudy: true, label: '坐沙發', ap: [1.9, -5.85]}, {x: 3.2, z: -6.45, yaw: 0, table: 7, seatH: 0.44, canStudy: true, label: '坐沙發', ap: [3.2, -5.87]},
    {x: 3.95, z: -5.3, yaw: -Math.PI / 2, table: 7, seatH: 0.44, canStudy: true, label: '坐沙發', ap: [3.32, -5.3]}, {x: 2.6, z: -4.62, yaw: Math.PI, table: 7, seatH: 0.44, canStudy: true, label: '坐單人沙發'},   /* v3c：ap＝「坐下」走到的位置（GAME.seatApproach；沙發前面是矮桌）；單人沙發跟著矮桌移到 x 2.6 */
    {x: -2.45, z: -4.92, yaw: Math.PI, table: 8, seatH: 0.7, canStudy: true, label: '坐吧檯'}, {x: -1.75, z: -4.92, yaw: Math.PI, table: 8, seatH: 0.7, canStudy: true, label: '坐吧檯旁邊'},
    {x: -0.1, z: -1.9, yaw: Math.PI / 2, table: 9, canStudy: true, label: '坐下'}, {x: 1.0, z: -1.9, yaw: -Math.PI / 2, table: 9, canStudy: true, label: '坐下'},   /* v2 */
    {x: 2.3, z: 3.65, yaw: 0, table: 10, canStudy: true, label: '坐下'}, {x: 2.3, z: 4.75, yaw: Math.PI, table: 10, canStudy: true, label: '坐下'},   /* v3b：中景的方桌（LAWWW2 驗收：參考圖窗前左邊那張） */
    {x: -0.45, z: 3.9, yaw: 0, table: 11, canStudy: true, label: '坐下'}, {x: -0.45, z: 5.0, yaw: Math.PI, table: 11, canStudy: true, label: '坐下'}   /* v3b：中景的圓桌（參考圖窗前右邊那張） */
  ],
  interact: [
    {x: -3.3, z: -4.95, kind: 'order', label: '點東西（焙茶拿鐵／焦糖布丁／巴斯克乳酪蛋糕）'},
    {x: -3.6, z: -0.5, kind: 'bookcase', label: '看看書櫃'},
    {x: 3.85, z: 6.05, kind: 'record', label: '看唱片機'},
    {x: 3.35, z: 6.05, kind: 'poster', label: '看海報'}
  ],
  floorSit: [],
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = MOKUYOBI_LAYOUT;
