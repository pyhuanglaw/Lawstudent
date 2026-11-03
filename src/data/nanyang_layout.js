/* ===== 南洋戲院（新生南路的二輪戲院，AA_615 第 3 節）室內配置：BB（帳號 A）2026-11-03 協助 LAWWW2 =====
   v3：照使用者 11-03 的參考圖（docs/story_planning/ref_images/shops/nanyang_lobby.webp、nanyang_ext.webp）。
   格式照 wz_shops_layout.js（SCENE_RULES 第 10 節）：Blender（tools/blender/env_second/bb_support/nanyang_interior.py）和遊戲共用這一份。
   座標：房間中心在原點，x 往東、z 往南、y 往上；店門在 +z（新生南路）；單位公尺。yaw：人面向 (sin yaw, cos yaw)。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 自己擋）。exit、enterAt 留空（LAWWW2 接新生南路時填）。
   外觀對齊：正面左半（x −8～−2）是售票亭（外觀 nanyang_ext 的售票窗；大廳這側只是它的背牆＋一扇小門），右半 x 0.6～4.6 是玻璃門入口。
   影廳（nanyang_hall）照 AA_615 先用 2D；右邊那組門開著，門後 2.4 m 是一張影廳一角的卡片。 */
const NANYANG_LAYOUT = {
  version: 3,
  lobby: {
    id: 'nanyang_lobby', name: '南洋戲院', glb: 'assets/models/env/second_ai/bb_support/nanyang_lobby.glb', v: 3,
    w: 16.0, d: 12.0, h: 4.5, floor: 'carpet_red',
    note: '老戲院大廳（參考圖）：紅地毯、深紅直條護牆板、米色灰泥、木樑＋Art Deco 吊燈；左牆一整排弧形爆米花櫃檯（Alison 週五、週六 18:00～23:00 在這裡）；後牆「南洋戲院」大招牌、兩組雙開門（左關、右開＝往 1 廳）、黑板架「今日放映」；右牆插畫海報、劇照板、木條長椅',
    front: {door: {x: 2.6, w: 4.0}, sill: 0, head: 2.9},
    booth: {x0: -8.0, x1: -2.6, z0: 3.2},
    concession: {x: -8.0, depth: 1.2, z0: -4.2, z1: 2.4},
    doors: {left: {x: -1.6, w: 2.0}, right: {x: 3.0, w: 2.2}, h: 2.7},
    sign: {x: 0.7, y: 3.15, w: 4.2, h: 1.1},
    chalk: {x: 1.4, z: -5.4},
    posters: {z0: -3.4, step: 1.45},
    photoBoard: {z: 1.2},
    benches: [{z0: -4.2, z1: -2.4}, {z0: -1.9, z1: -0.1}],
    bins: [[7.5, 0.4], [-2.4, 2.9]],
    pendants: [[-3.0, -3.0], [1.5, -3.0], [5.0, -3.0], [-3.0, 1.0], [1.5, 1.0], [5.0, 1.0], [1.5, 4.4]],
    projector: {x: 6.9, z: 4.6},
    spawn: {x: 2.6, z: 5.2, yaw: Math.PI},
    blocks: [[-5.3, 4.6, 5.4, 2.8], [-6.95, -0.9, 2.1, 6.6], [-7.55, 2.95, 0.9, 1.1], [1.4, -5.45, 1.0, 0.3],
             [7.45, -3.3, 1.1, 1.9], [7.45, -1.0, 1.1, 1.9], [7.5, 0.4, 0.45, 0.45], [-2.4, 2.9, 0.45, 0.45],
             [6.9, 4.6, 0.7, 1.0], [7.5, 3.3, 0.7, 1.2]],
    walkNote: '入口（x 0.6～4.6）到後牆兩組門之間是大走道；櫃檯前 x −6.4～−4.5 排隊；長椅前 x 5.5～6.9；售票亭背牆和櫃檯之間 z 2.4～3.2 留 0.8 m 是到售票亭小門的路（工作人員）',
    seats: [
      {x: 7.25, z: -3.8, yaw: -Math.PI / 2, label: '坐下等開演'}, {x: 7.25, z: -2.8, yaw: -Math.PI / 2, label: '坐下等開演'},
      {x: 7.25, z: -1.5, yaw: -Math.PI / 2, label: '坐下等開演'}, {x: 7.25, z: -0.5, yaw: -Math.PI / 2, label: '坐下等開演'}
    ],
    interact: [
      {kind: 'popcorn', x: -5.9, z: -1.4, yaw: -Math.PI / 2, label: '買爆米花'},
      {kind: 'clerk', x: -7.5, z: -1.4, yaw: Math.PI / 2, note: 'Alison 打工時站在櫃檯後面（AA_615 第 4 節）'},
      {kind: 'hall', x: 3.0, z: -5.2, yaw: Math.PI, label: '進 1 廳'},
      {kind: 'chalk', x: 1.4, z: -4.6, yaw: Math.PI, label: '看今日放映'},
      {kind: 'posters', x: 6.3, z: -2.0, yaw: Math.PI / 2, label: '看海報'}
    ],
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]},
    exit: null, enterAt: null,
    todo: 'AA_615 的場次（12:00、15:00、18:30、21:30）照外觀圖改成 10:00／13:00／16:00／19:30（README 指示），黑板架寫「今日放映 A片 13:00 B片 15:10」；AA 要跟著改 AA_615'
  }
};
if (typeof module !== 'undefined') module.exports = NANYANG_LAYOUT;
