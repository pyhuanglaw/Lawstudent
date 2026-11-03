/* ===== 木曜日 Mokuyōbi 室內（溫州街巷中老公寓二樓；AA 子代理 2026-11-03 v1，臨時支援 LAWWW2，SCENE_RULES 第 10 節） =====
   企劃：AA_617、AA_618（企劃線 claude/story-planning）。參考圖：docs/story_planning/ref_images/wz_cafes/mokuyobi_ref_v2.webp。
   安靜念書＋兩個人約會、深談（使用者 11-03：「木曜日要很適合念書 很多人在念書」）——座位都可以讀書（canStudy）。
   這份給遊戲（LAWWW2 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/aa_support/mokuyobi_interior.py）共用。
   座標：房間中心在原點，x 往東、z 往南、y 往上（y＝0 是二樓的地板）；臨街的窗在 +z（z＝d/2）；公尺。格式照 src/data/wz_shops_layout.js 開頭的說明。
   一樓的深綠鐵門、樓梯、外觀不在這裡（LAWWW2）：樓梯上到二樓的西南角 stairWell，樓梯口有一道木框門（店門），進門是 spawn。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。exit、enterAt 留空（LAWWW2 填）。 */
const MOKUYOBI_LAYOUT = {
  version: 2,   /* v2（2026-11-03）：加了窗下矮書櫃、樓梯間前的高書櫃、北牆格子展示櫃、東牆小展示櫃、第四盆大盆栽、中間一桌（table 9，2 席；共 20 席）——blocks 跟著加；其他座位、出口、樓梯、stairWell 都沒動 */
  id: 'mokuyobi', name: '木曜日', glb: 'assets/models/env/second_ai/aa_support/mokuyobi.glb',
  w: 9.0, d: 14.0, h: 3.0, floorY: 0, floor: 'terrazzo_light_with_rugs', wallColor: '#efe6d3',
  note: '老公寓二樓 9×14×3.0 m。臨街（+z）一整排木框窗，窗外是老樹（窗景卡）。西南角是上來的樓梯間（木框店門＋門鈴）；西牆一座胡桃木大書櫃＋唱片櫃（黑膠唱片機）；北側西半是小吧檯（老闆煮咖啡），東北角是書櫃半隔開的沙發區（隱密）；東牆兩張電影海報（虛構片名）。地板磨石子＋兩塊地毯（D112 不用深色木地板），家具胡桃木。共 20 席（v2 加中間一桌 2 席）：原本 18 席：窗邊雙人桌兩組 4、西側兩張 4、中間一張 2、東牆一張 2、沙發區 4、吧檯 2。每張桌子一盞小檯燈；沒有插座。',
  front: {windows: [[-2.6, 4.2]], sill: 0.75, head: 2.55, note: '一整排木框窗（每 0.9 m 一格、上面一排小氣窗）；窗簾是奶油白的紗簾'},
  stairWell: {x0: -4.5, x1: -3.0, z0: 3.6, z1: 7.0, door: {x: -3.75, z: 3.6, w: 0.95, h: 2.1},
              note: '樓梯間（LAWWW2 的樓梯從一樓鐵門上來，到 z≈4.4 的平台）；這個 GLB 只有樓梯間兩面隔間牆（併在 WALL_front 那一組）、店門框、平台的一小塊地板 z 3.6～4.6。z 4.6～7.0 是樓梯開口，地板空著'},
  stairTop: {x: -3.75, z: 4.2, note: '樓梯頂的平台（進店前站的位置）'},
  spawn: {x: -3.75, z: 3.0, yaw: Math.PI},
  exit: null,     /* LAWWW2 填（下樓） */
  enterAt: null,  /* LAWWW2 填（一樓鐵門） */
  items: [
    {kind: 'bookcase', x: -4.28, z: 0.7, ry: Math.PI / 2, w: 3.8, d: 0.42, h: 2.45, note: '西牆的胡桃木大書櫃（6 層；書可以拿下來看）'},
    {kind: 'record_cabinet', x: -4.23, z: -2.8, ry: Math.PI / 2, w: 1.5, d: 0.5, h: 0.82, note: '唱片櫃：上面黑膠唱片機、旁邊一箱唱片'},
    {kind: 'counter', x: -2.95, z: -5.6, w: 3.1, d: 0.55, h: 1.0, note: '小吧檯（老闆在後面：手沖壺、磨豆機、蛋糕櫃）；後牆層板放杯子'},
    {kind: 'sofa_l', x: 3.0, z: -6.0, note: 'L 形沙發：長邊靠北牆 x 1.6～4.4、短邊靠東牆 z −6.25～−4.8'},
    {kind: 'coffee_table', x: 2.9, z: -5.45, w: 1.0, d: 0.6, h: 0.42},
    {kind: 'half_bookcase', x: 2.3, z: -4.05, w: 1.8, d: 0.34, h: 1.35, note: '半高書櫃，把沙發區隔開'},
    {kind: 'poster', x: 4.49, y: 1.6, z: -2.6, w: 0.7, h: 1.05, note: '《夏の残光》（虛構）'},
    {kind: 'poster', x: 4.49, y: 1.6, z: 0.6, w: 0.7, h: 1.05, note: '《雨後的車站》（虛構）'},
    {kind: 'rug', x: 0.5, z: 1.3, w: 2.6, d: 3.6}, {kind: 'rug', x: 2.9, z: -5.5, w: 2.6, d: 2.0},
    {kind: 'sideboard', x: 4.27, z: -1.0, ry: -Math.PI / 2, w: 2.0, d: 0.46, h: 0.8, note: '東牆的胡桃木矮櫃（四個抽屜；上面一疊書、一盆植物、一盞檯燈）'},
    {kind: 'coat_rack', x: -2.75, z: 3.25, note: '店門旁的衣帽架（一件外套、一把雨傘）'},
    {kind: 'plant_big', x: -4.1, z: 3.1}, {kind: 'plant_big', x: 4.05, z: 6.45}, {kind: 'plant_big', x: -0.9, z: -6.65},
    {kind: 'book_stack', x: -4.2, z: -1.62, note: '書櫃和唱片櫃之間地上的一疊書'},
    {kind: 'window_view', z: 9.5, note: '窗外的老樹（窗景卡 WALL_front_VIEW_mok_window_view，離窗 2.5 m、14 × 6.5 m；自訂屬性 windowView；v2 自己一張 2048×1024 的圖，有一點自發光）'},
    {kind: 'under_window_shelf', x: 0.8, z: 6.83, w: 6.6, d: 0.3, h: 0.6, note: 'v2：窗下的矮書櫃（兩層書）'},
    {kind: 'stair_bookcase', x: -2.73, z: 5.3, w: 2.4, d: 0.34, h: 2.4, note: 'v2：樓梯間隔間牆前的高書櫃（面向東）'},
    {kind: 'display_case', x: 0.4, z: -6.81, w: 1.8, d: 0.38, h: 2.35, note: 'v2：北牆的格子展示櫃（抽屜、時鐘、相框、植物、書）'},
    {kind: 'display_case_east', x: 4.31, z: 4.3, w: 1.4, d: 0.38, h: 2.0, note: 'v2：東牆北段的小展示櫃（杯子、書、檯燈）'},
    {kind: 'plant_big', x: 4.1, z: -3.5, note: 'v2'}, {kind: 'rug', x: 0.45, z: -1.9, w: 2.0, d: 1.8, note: 'v2'}
  ],
  blocks: [
    [-3.75, 5.3, 1.5, 3.4],
    [-4.28, 0.7, 0.44, 3.8], [-4.23, -2.8, 0.5, 1.5], [-2.95, -5.6, 3.1, 0.55], [-2.95, -6.8, 3.1, 0.4],
    [3.0, -6.62, 2.8, 0.76], [4.12, -5.5, 0.76, 1.5], [2.9, -5.45, 1.0, 0.6], [2.3, -4.05, 1.8, 0.34],
    [-0.9, 6.15, 0.7, 0.7], [2.4, 6.15, 0.7, 0.7], [-3.0, 1.3, 0.7, 0.7], [-3.0, -1.3, 0.7, 0.7], [0.5, 2.6, 0.7, 0.7], [3.6, 2.2, 0.7, 0.7],
    [4.05, 6.45, 0.6, 0.6], [4.27, -1.0, 0.46, 2.0], [-2.75, 3.25, 0.4, 0.4], [-4.1, 3.1, 0.5, 0.5], [-0.9, -6.65, 0.45, 0.45], [-4.2, -1.62, 0.3, 0.36],
    /* v2 */ [0.8, 6.83, 6.6, 0.3], [-2.73, 5.3, 0.36, 2.4], [0.4, -6.81, 1.8, 0.38], [4.31, 4.3, 0.38, 1.4], [4.1, -3.5, 0.45, 0.45], [0.45, -1.9, 0.7, 0.7]
  ],
  walkNote: '店門 (−3.75, 3.6) 進來往東、往北都有 ≥ 1 m 的走道；吧檯前 z −5.3～−4.4（老闆在 z −6.6～−5.9）；沙發區從 x 1.4 以西、z −4.6 進去（半高書櫃擋著 z −4.05 那一段）',
  seats: [
    {x: -1.45, z: 6.15, yaw: Math.PI / 2, table: 1, canStudy: true, label: '坐窗邊'}, {x: -0.35, z: 6.15, yaw: -Math.PI / 2, table: 1, canStudy: true, label: '坐窗邊'},
    {x: 1.85, z: 6.15, yaw: Math.PI / 2, table: 2, canStudy: true, label: '坐窗邊'}, {x: 2.95, z: 6.15, yaw: -Math.PI / 2, table: 2, canStudy: true, label: '坐窗邊'},
    {x: -3.0, z: 0.75, yaw: 0, table: 3, canStudy: true, label: '坐下'}, {x: -3.0, z: 1.85, yaw: Math.PI, table: 3, canStudy: true, label: '坐下'},
    {x: -3.0, z: -1.85, yaw: 0, table: 4, canStudy: true, label: '坐下'}, {x: -3.0, z: -0.75, yaw: Math.PI, table: 4, canStudy: true, label: '坐下'},
    {x: -0.05, z: 2.6, yaw: Math.PI / 2, table: 5, canStudy: true, label: '坐下'}, {x: 1.05, z: 2.6, yaw: -Math.PI / 2, table: 5, canStudy: true, label: '坐下'},
    {x: 3.6, z: 1.65, yaw: 0, table: 6, canStudy: true, label: '坐下'}, {x: 3.6, z: 2.75, yaw: Math.PI, table: 6, canStudy: true, label: '坐下'},
    {x: 2.2, z: -6.45, yaw: 0, table: 7, seatH: 0.44, canStudy: true, label: '坐沙發'}, {x: 3.2, z: -6.45, yaw: 0, table: 7, seatH: 0.44, canStudy: true, label: '坐沙發'},
    {x: 3.95, z: -5.3, yaw: -Math.PI / 2, table: 7, seatH: 0.44, canStudy: true, label: '坐沙發'}, {x: 2.9, z: -4.62, yaw: Math.PI, table: 7, seatH: 0.44, canStudy: true, label: '坐單人沙發'},
    {x: -2.45, z: -4.92, yaw: Math.PI, table: 8, seatH: 0.7, canStudy: true, label: '坐吧檯'}, {x: -1.75, z: -4.92, yaw: Math.PI, table: 8, seatH: 0.7, canStudy: true, label: '坐吧檯旁邊'},
    {x: -0.1, z: -1.9, yaw: Math.PI / 2, table: 9, canStudy: true, label: '坐下'}, {x: 1.0, z: -1.9, yaw: -Math.PI / 2, table: 9, canStudy: true, label: '坐下'}   /* v2 */
  ],
  interact: [
    {x: -3.3, z: -4.95, kind: 'order', label: '點東西（焙茶拿鐵／焦糖布丁／巴斯克乳酪蛋糕）'},
    {x: -3.6, z: 0.7, kind: 'bookcase', label: '看看書櫃'},
    {x: -3.6, z: -2.8, kind: 'record', label: '看唱片機'},
    {x: 3.9, z: -1.0, kind: 'poster', label: '看海報'}
  ],
  floorSit: [],
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = MOKUYOBI_LAYOUT;
