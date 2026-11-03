/* ===== 南洋戲院（新生南路的二輪戲院，AA_615 第 3 節）室內配置：BB（帳號 A）2026-11-03 協助 LAWWW2 =====
   v4（11-03，LAWWW2 11:12 同意）：照參考圖改成 9 × 14 × 4.5 m 的窄長大廳；燈的位置寫在 lights（LAWWW2 烘光影用）。
   v3：照使用者 11-03 的參考圖（docs/story_planning/ref_images/shops/nanyang_lobby.webp、nanyang_ext.webp）。
   格式照 wz_shops_layout.js（SCENE_RULES 第 10 節）：Blender（tools/blender/env_second/bb_support/nanyang_interior.py）和遊戲共用這一份。
   座標：房間中心在原點，x 往東、z 往南、y 往上；店門在 +z（新生南路）；單位公尺。yaw：人面向 (sin yaw, cos yaw)。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 自己擋）。exit、enterAt 留空（LAWWW2 接新生南路時填）。
   外觀對齊：正面左邊（x −4.5～−1.5）是售票亭（外觀 nanyang_ext 的售票窗；大廳這側只是它的背牆＋一扇小門），中間 x −1.5～1.5 是玻璃門入口。
   影廳（nanyang_hall）照 AA_615 先用 2D；右邊那組門開著，門後 2.4 m 是一張影廳一角的卡片。 */
const NANYANG_LAYOUT = {
  version: 4,
  lobby: {
    id: 'nanyang_lobby', name: '南洋戲院', glb: 'assets/models/env/second_ai/bb_support/nanyang_lobby.glb', v: 4,
    w: 9.0, d: 14.0, h: 4.5, floor: 'carpet_red',
    note: '老戲院大廳（參考圖）：紅地毯、深紅直條護牆板、米色灰泥、木樑＋Art Deco 吊燈；左牆一整排弧形爆米花櫃檯（Alison 週五、週六 18:00～23:00 在這裡）；後牆「南洋戲院」大招牌、兩組雙開門（左關、右開＝往 1 廳）、黑板架「今日放映」；右牆插畫海報、劇照板、木條長椅',
    front: {door: {x: 0.0, w: 3.0}, sill: 0, head: 2.9},
    booth: {x0: -4.5, x1: -1.5, z0: 4.8},
    concession: {x: -4.5, depth: 1.1, z0: -5.6, z1: 3.6},
    doors: {left: {x: -1.75, w: 1.8}, right: {x: 2.2, w: 2.0}, h: 2.7},
    sign: {x: 0.2, y: 3.15, w: 3.8, h: 1.0},
    chalk: {x: 0.35, z: -6.6},
    posters: {z0: -4.8, step: 1.45},
    photoBoard: {z: -0.3},
    benches: [{z0: -5.2, z1: -3.4}, {z0: -2.8, z1: -1.0}],
    bins: [[4.0, -0.4], [-1.1, 4.4]],
    pendants: [[0.4, -4.6], [0.4, -1.4], [0.4, 1.8], [0.4, 5.0]],
    projector: {x: 3.6, z: 6.1},
    spawn: {x: 0.0, z: 6.4, yaw: Math.PI},
    blocks: [[-3.0, 5.9, 3.0, 2.2], [-3.9, -1.0, 1.4, 9.2], [0.35, -6.65, 1.0, 0.3],
             [3.95, -4.3, 1.1, 1.9], [3.95, -1.9, 1.1, 1.9], [4.0, -0.4, 0.45, 0.45], [-1.1, 4.4, 0.45, 0.45],
             [3.6, 6.1, 0.7, 1.0], [4.0, 4.8, 0.7, 1.2]],
    walkNote: '9 m 寬的窄長大廳（LAWWW2 11:12 同意，照參考圖）：入口（x −1.5～1.5）一路到後牆兩組門是中間走道 x −3.0～3.3；櫃檯前 x −3.2～−2.0 排隊；長椅前 x 2.2～3.3；售票亭背牆和櫃檯之間 z 3.6～4.8 是到售票亭小門的路（工作人員）',
    seats: [
      {x: 3.75, z: -4.8, yaw: -Math.PI / 2, label: '坐下等開演'}, {x: 3.75, z: -3.8, yaw: -Math.PI / 2, label: '坐下等開演'},
      {x: 3.75, z: -2.4, yaw: -Math.PI / 2, label: '坐下等開演'}, {x: 3.75, z: -1.4, yaw: -Math.PI / 2, label: '坐下等開演'}
    ],
    interact: [
      {kind: 'popcorn', x: -2.6, z: -2.8, yaw: -Math.PI / 2, label: '買爆米花'},
      {kind: 'clerk', x: -4.1, z: -2.8, yaw: Math.PI / 2, note: 'Alison 打工時站在櫃檯後面（AA_615 第 4 節）'},
      {kind: 'hall', x: 2.2, z: -6.4, yaw: Math.PI, label: '進 1 廳'},
      {kind: 'chalk', x: 0.35, z: -5.8, yaw: Math.PI, label: '看今日放映'},
      {kind: 'posters', x: 3.0, z: -3.4, yaw: Math.PI / 2, label: '看海報'}
    ],
    lights: [{x: 0.4, z: -4.6, y: 3.18, kind: 'pendant'}, {x: 0.4, z: -1.4, y: 3.18, kind: 'pendant'}, {x: 0.4, z: 1.8, y: 3.18, kind: 'pendant'}, {x: 0.4, z: 5.0, y: 3.18, kind: 'pendant'},
             {x: -1.7, z: -6.9, y: 2.9, kind: 'sconce'}, {x: 2.1, z: -6.9, y: 2.9, kind: 'sconce'},
             {x: -3.2, z: -4.4, y: 2.2, kind: 'gooseneck'}, {x: -3.2, z: -2.4, y: 2.2, kind: 'gooseneck'},
             {x: 4.0, z: -4.8, y: 3.12, kind: 'poster_spot'}, {x: 4.0, z: -3.35, y: 3.12, kind: 'poster_spot'}, {x: 4.0, z: -1.9, y: 3.12, kind: 'poster_spot'}, {x: 4.0, z: -0.3, y: 3.12, kind: 'poster_spot'},
             {x: -3.4, z: -1.0, y: 2.8, kind: 'counter_band'}, {x: -4.0, z: 0.0, y: 1.9, kind: 'fridge'}],
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]},
    exit: null, enterAt: null,
    todo: 'AA_615 的場次（12:00、15:00、18:30、21:30）照外觀圖改成 10:00／13:00／16:00／19:30（README 指示），黑板架寫「今日放映 A片 13:00 B片 15:10」；AA 要跟著改 AA_615'
  },
  /* ===== 1 廳（nanyang_hall）v1：BB 2026-11-03（使用者：「盡量接近我給你的圖 復古風」）=====
     照大廳參考圖門後看得到的那一角：紅地毯、亮紅高背座椅一排一排、右邊一條直走道、走道邊的小地燈、白銀幕。
     其他照大廳的復古語彙：深紅直條護牆板＋米色灰泥、Art Deco 層層燈罩的壁燈、紅絨布幕＋金流蘇、米色拱框（台口）、綠色「太平門」燈箱、後牆放映窗。
     座標：房間中心在原點；+z 是後牆（往大廳的門，接大廳右邊那組開著的門），−z 是銀幕。地板是平的（老戲院多半有坡，這一版先平的，導航簡單）。
     座椅一整排是導航阻擋；可以坐的是靠右走道的那一張（從走道走過去坐）。 */
  hall: {
    id: 'nanyang_hall', name: '南洋戲院 1 廳', glb: 'assets/models/env/second_ai/bb_support/nanyang_hall.glb', v: 1,
    w: 11.0, d: 16.0, h: 5.6, floor: 'carpet_red',
    door: {x: 3.5, w: 2.0, h: 2.7},
    aisleR: {x0: 2.7, x1: 4.6}, aisleL: {x0: -5.5, x1: -4.7},
    seatBlock: {x0: -4.55, x1: 2.55, n: 12, pitch: 0.58},
    rows: {z0: 4.3, n: 9, pitch: 0.98},
    stage: {z0: -8.0, z1: -6.6, h: 0.6},
    screen: {x: 0.0, y: 1.4, w: 7.4, h: 3.3, z: -7.75},
    proscenium: {x0: -4.6, x1: 4.6, top: 5.0},
    booth: {y: 3.8, xs: [-0.8, 0.8]},
    spawn: {x: 3.5, z: 7.3, yaw: Math.PI},
    blocks: [],   // 下面的 HALL_BLOCKS() 依 rows 算出來
    seats: [],    // HALL_SEATS()
    interact: [
      {kind: 'lobby', x: 3.5, z: 7.6, yaw: 0, label: '回大廳'},
      {kind: 'screen', x: 0.0, z: -5.8, yaw: Math.PI, label: '看銀幕'}
    ],
    lights: [],   // HALL_LIGHTS()
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]},
    exit: null, enterAt: null,
    note: '暗的影廳：開演時燈全暗、只剩銀幕和走道地燈（LAWWW2 烘光影：lights 的 kind 分 house（場燈）／aisle（地燈）／exit（太平門）／screen）'
  }
};
(function () {
  const H = NANYANG_LAYOUT.hall, sb = H.seatBlock, rw = H.rows;
  const rowZ = r => rw.z0 - r * rw.pitch;
  H.rowZ = Array.from({length: rw.n}, (_, r) => +rowZ(r).toFixed(3));
  H.blocks = H.rowZ.map(z => [+((sb.x0 + sb.x1) / 2).toFixed(3), +(z + 0.05).toFixed(3), +(sb.x1 - sb.x0).toFixed(3), 0.72])
    .concat([[0, (H.stage.z0 + H.stage.z1) / 2, H.w, H.stage.z1 - H.stage.z0]]);
  // 可以坐的：每一排靠右走道那一張（x＝最右邊的座位），面向銀幕（yaw π＝面向 −z）
  const xR = sb.x1 - sb.pitch / 2;
  H.seats = H.rowZ.map((z, r) => ({x: +xR.toFixed(3), z: +z.toFixed(3), yaw: Math.PI, row: r + 1, label: '坐下看電影', approach: {x: H.aisleR.x0 + 0.5, z: +z.toFixed(3)}}));
  H.lights = [].concat(
    [-5.3, 5.3].flatMap(x => [3.0, -0.5, -4.0].map(z => ({x: x, y: 2.9, z: z, kind: 'house'}))),
    H.rowZ.map(z => ({x: H.aisleR.x0 + 0.08, y: 0.18, z: z + 0.3, kind: 'aisle'})),
    [{x: H.door.x, y: 3.0, z: H.d / 2 - 0.1, kind: 'exit'}, {x: -5.4, y: 2.6, z: -6.0, kind: 'exit'}],
    [{x: 0, y: H.screen.y + H.screen.h / 2, z: H.screen.z + 0.3, kind: 'screen'}]);
})();
if (typeof module !== 'undefined') module.exports = NANYANG_LAYOUT;
