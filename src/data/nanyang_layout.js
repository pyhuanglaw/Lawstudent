/* ===== 南洋戲院（新生南路的二輪戲院，AA_615 第 3 節）室內配置：BB（帳號 A）2026-11-03 協助 LAWWW2（使用者「lawww2在忙 你和bb cc協助建模」） =====
   格式照 wz_shops_layout.js（SCENE_RULES 第 10 節）：Blender（tools/blender/env_second/bb_support/nanyang_interior.py）和遊戲共用這一份。
   座標：房間中心在原點，x 往東、z 往南、y 往上；店門在 +z（新生南路）；單位公尺。yaw：人面向 (sin yaw, cos yaw)。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 自己擋）。exit、enterAt 留空（LAWWW2 接新生南路時填）。
   尺寸：LAWWW2 10:03 暫定 大廳 16×12×4.5 m；影廳 14×20×7 m（這一版先做大廳；影廳照 AA_615 可以先用 2D 背景，BB 傾向之後做 3D）。 */
const NANYANG_LAYOUT = {
  version: 1,
  lobby: {
    id: 'nanyang_lobby', name: '南洋戲院', glb: 'assets/models/env/second_ai/bb_support/nanyang_lobby.glb',
    w: 16.0, d: 12.0, h: 4.5, floor: 'terrazzo',
    note: '老大樓一樓的二輪戲院大廳：左邊售票口（上面場次板）、後面爆米花櫃檯（Alison 週五、週六 18:00～23:00 在這裡）、後牆右邊往 1 廳的雙開門（紅絨布、銅柱紅絨繩）、右牆海報與兩張紅色長椅',
    front: {door: {x: 0, w: 3.0}, windows: [[-6.6, -2.2], [2.2, 6.6]], sill: 0.6, head: 2.9},
    hallDoor: {x: 3.6, w: 2.2, h: 2.6},
    spawn: {x: 0, z: 5.0, yaw: Math.PI},
    booth: {x0: -8.0, x1: -5.2, z0: -2.6, z1: 1.4},
    concession: {x0: -4.8, x1: -0.6, zFront: -4.4, zBack: -6.0},
    posters: {x: 8.0, z0: -4.4, step: 1.55, n: 5},
    benches: [{z0: -3.4, z1: -1.6}, {z0: -1.2, z1: 0.9}],
    items: [
      {kind: 'standee', x: 4.1, z: 3.0, ry: -0.67, note: '電影立牌（背面有紙板支架）'},
      {kind: 'plant_big', x: -7.4, z: 5.3}, {kind: 'plant_big', x: 7.4, z: 5.3},
      {kind: 'bin', x: 0.3, z: -5.5}
    ],
    blocks: [[-6.6, -0.6, 2.8, 4.0], [-2.7, -5.2, 4.2, 1.6], [0.3, -5.5, 0.45, 0.45], [3.6, -4.65, 2.8, 0.3],
             [7.3, -2.5, 1.1, 2.0], [7.3, -0.15, 1.1, 2.3], [4.1, 3.0, 1.3, 1.0], [-7.4, 5.3, 0.6, 0.6], [7.4, 5.3, 0.6, 0.6]],
    walkNote: '大門到爆米花櫃檯 x −1～2 的大走道；售票口前 x −5.2～−3.5 排隊；長椅前 x 5～6.7；紅絨繩在影廳門前、繩兩端留 0.9 m 進出',
    seats: [
      {x: 7.15, z: -3.0, yaw: -Math.PI / 2, label: '坐下等開演'}, {x: 7.15, z: -2.0, yaw: -Math.PI / 2, label: '坐下等開演'},
      {x: 7.15, z: -0.7, yaw: -Math.PI / 2, label: '坐下等開演'}, {x: 7.15, z: 0.4, yaw: -Math.PI / 2, label: '坐下等開演'}
    ],
    interact: [
      {kind: 'ticket', x: -4.7, z: -0.6, yaw: -Math.PI / 2, label: '買票（一票兩片 150 元）'},
      {kind: 'popcorn', x: -2.7, z: -3.8, yaw: Math.PI, label: '買爆米花'},
      {kind: 'clerk', x: -2.7, z: -5.5, yaw: 0, note: 'Alison 打工時站這裡（AA_615 第 4 節）'},
      {kind: 'hall', x: 3.6, z: -5.2, yaw: Math.PI, label: '進 1 廳'},
      {kind: 'posters', x: 6.6, z: 2.4, yaw: Math.PI / 2, label: '看海報'}
    ],
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]},
    exit: null, enterAt: null
  }
};
if (typeof module !== 'undefined') module.exports = NANYANG_LAYOUT;
