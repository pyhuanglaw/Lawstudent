/* ===== 洋洋鹹酥雞（公館 G05，原「滷味・鹹酥雞」，AA_650；內部 id 照舊 luwei）室內配置 v1：BB（帳號 A）2026-11-04 =====
   照使用者參考圖 docs/story_planning/ref_images/shops/gongguan_yangyang_int.webp（SCENE_RULES §12：參考圖就是規格）＋外觀 _ext.webp。
   台式學生宵夜店、開放式廚房：左前是炸物櫃＋開放式廚房（油鍋、抽油煙機、調味架），上面是招牌與菜單板（AA_650 第 4 節）；
   廚房後段是不鏽鋼框玻璃隔間；左前角窗邊木吧台＋圓凳；中間一排四人桌、右邊一排兩人桌；右前是自助區（餐具、醬料、飲用水、垃圾分類）；
   後面是結帳櫃台、冷飲櫃、紅色門簾（往後面）、層架與紙箱；右牆黃色、壁燈、海報。
   **店寬、門窗是暫定**：等 LAWWW2 外觀的數字（zones3d 公館店面街 G05 原本 w:8）。改 W、D、DOOR、FRONT_WIN、LEFT_WIN 這幾個數字，下面的東西跟著算。
   門牌不用 136（參考圖外觀的號碼），遊戲裡用 142。
   格式照 shaola_layout.js：房間中心在原點，x 東、z 南、y 上；店門在 +z（z＝d/2）；yaw：人面向 (sin yaw, cos yaw)，0＝面向店門、π＝面向店裡。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 擋）。seats：kind 'eat'。 */
const YANGYANG_LAYOUT = (function () {
  const W = 8.0, D = 12.0, H = 3.2;                       // ← 外觀數字到了改這裡
  const X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2;
  const DOOR = {x: 2.1, w: 1.8, h: 2.2};                  // ← 正面店門（外觀圖：門在右邊）
  const FRONT_WIN = [[X0 + 0.3, 0.9]];                    // ← 正面窗（外觀圖：左半是廚房、炸物櫃）
  const LEFT_WIN = [3.2, Z1 - 0.2];                       // ← 西牆前段的窗（參考圖左前景的窗邊吧台）；外觀說沒有就改成 null
  const KX = X0 + 2.5;                                    // 廚房和店裡的分界（炸物櫃的前緣）
  const S = {
    id: 'luwei', name: '洋洋鹹酥雞', glb: 'assets/models/env/second_ai/bb_support/yangyang_interior.glb', v: 1, doorNo: '142',
    w: W, d: D, h: H, floor: 'tile_300_lightgray',
    front: {door: DOOR, windows: FRONT_WIN, sill: 0.6, head: 2.6},
    left: {window: LEFT_WIN, sill: 0.9, head: 2.6},
    kitchen: {x0: X0, x1: KX, z0: -2.2, z1: 3.0, note: '開放式廚房：油鍋三個、抽油煙機、調味架、備料檯；店員在裡面'},
    showcase: {x0: KX - 0.6, x1: KX, z0: -0.3, z1: 2.9, h: 1.0, note: '炸物櫃（斜玻璃、一盤一盤的生料：鹹酥雞、甜不辣、豆干、米血、杏鮑菇、四季豆…），面向 +x'},
    partition: {x: KX, z0: Z0 + 0.6, z1: -0.3, dado: 0.95, note: '廚房後段：白磁磚腰牆＋不鏽鋼框玻璃'},
    menuBoard: {x: KX, z0: -0.4, z1: 3.0, y0: 1.95, y1: 3.1},
    windowBar: LEFT_WIN ? {x0: X0, x1: X0 + 0.45, z0: LEFT_WIN[0] + 0.2, z1: LEFT_WIN[1] - 0.15, h: 1.0} : null,
    barStools: LEFT_WIN ? [Z1 - 0.7, Z1 - 1.5, Z1 - 2.3] : [],
    tables4: [{n: 1, x: 0.2, z: 3.0}, {n: 2, x: 0.2, z: 0.6}, {n: 3, x: 0.2, z: -1.8}],   // 四人桌 1.1 × 0.75（長邊沿 x），椅子在 z ±0.6
    tables2: [{n: 4, x: X1 - 1.0, z: 1.2}, {n: 5, x: X1 - 1.0, z: -0.6}, {n: 6, x: X1 - 1.0, z: -2.4}],   // 兩人桌 0.7 × 0.7，椅子在 z ±0.55
    selfServe: {x0: X1 - 0.6, x1: X1, z0: 3.1, z1: 5.0, h: 0.9, note: '自助區：餐具、醬料（胡椒粉、辣椒、蒜）、飲用水桶、垃圾分類三格'},
    backCounter: {x0: -1.0, x1: 1.4, z0: Z0 + 1.3, z1: Z0 + 1.9, h: 1.0, note: '後面的結帳櫃台（收銀機、外帶袋）'},
    fridge: {x0: 1.9, x1: 2.75, z0: Z0, z1: Z0 + 0.7, h: 2.0, label: '冷飲'},
    curtainDoor: {x: 0.2, w: 0.9, note: '後牆的紅色門簾（往後面，關著）'},
    backShelf: {x0: -1.4, x1: -0.2, z0: Z0, z1: Z0 + 0.4, h: 2.4},
    spawn: {x: DOOR.x, z: Z1 - 0.8, yaw: Math.PI},
    exit: {at: {x: DOOR.x, z: Z1 - 0.3}, label: '離開洋洋鹹酥雞', to: 'gongguan', note: '公館那一頭：G05 店門互動點（LAWWW 把 type 從 none 改成可進入）'},
    clerk: {x: KX - 1.1, z: 1.2, yaw: Math.PI / 2, note: '老闆在炸物櫃後面，面向客人'},
    clerk2: {x: 0.2, z: Z0 + 0.8, yaw: 0, note: '結帳櫃台後面'},
    hours: '17:00～01:00',
    blocks: [], seats: [],
    interact: [
      {kind: 'order', x: KX + 0.5, z: 1.3, yaw: -Math.PI / 2, label: '點炸物（夾到籃子裡）'},
      {kind: 'menu', x: KX + 0.6, z: 2.6, yaw: -Math.PI / 2, label: '看菜單'},
      {kind: 'pay', x: 0.2, z: Z0 + 2.4, yaw: Math.PI, label: '結帳'},
      {kind: 'drink', x: 2.3, z: Z0 + 1.2, yaw: Math.PI, label: '拿冷飲'},
      {kind: 'selfserve', x: X1 - 1.0, z: 4.0, yaw: Math.PI / 2, label: '自助區（餐具、醬料、水）'}
    ],
    spots: {},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  };
  const B = (o) => [+((o.x0 + o.x1) / 2).toFixed(3), +((o.z0 + o.z1) / 2).toFixed(3), +(o.x1 - o.x0).toFixed(3), +(o.z1 - o.z0).toFixed(3)];
  const k = S.kitchen;
  S.blocks = [].concat(
    [B({x0: k.x0, x1: k.x1, z0: k.z0, z1: k.z1})],                         // 廚房＋炸物櫃整塊（店員在裡面）
    [B({x0: X0, x1: KX + 0.06, z0: Z0, z1: k.z0})],                        // 廚房後段（玻璃隔間後面）
    S.windowBar ? [B(S.windowBar)] : [], S.barStools.map(z => [X0 + 0.75, +z.toFixed(2), 0.36, 0.36]),
    S.tables4.map(t => [t.x, t.z, 1.1, 0.75]), [].concat(...S.tables4.map(t => [-0.28, 0.28].map(dx => [[+(t.x + dx).toFixed(2), +(t.z - 0.6).toFixed(2), 0.42, 0.42], [+(t.x + dx).toFixed(2), +(t.z + 0.6).toFixed(2), 0.42, 0.42]]).flat())),
    S.tables2.map(t => [t.x, t.z, 0.7, 0.7]), [].concat(...S.tables2.map(t => [[t.x, +(t.z - 0.55).toFixed(2), 0.42, 0.42], [t.x, +(t.z + 0.55).toFixed(2), 0.42, 0.42]])),
    [B(S.selfServe), B(S.backCounter), B({x0: S.backCounter.x0, x1: S.backCounter.x1, z0: Z0, z1: S.backCounter.z0}), B(S.fridge), B(S.backShelf)]);
  S.seats = [].concat(
    S.barStools.map((z, i) => ({x: X0 + 0.75, z: +z.toFixed(2), yaw: -Math.PI / 2, kind: 'eat', bar: i + 1, label: '坐在窗邊'})),
    ...S.tables4.map(t => [-0.28, 0.28].map(dx => [
      {x: +(t.x + dx).toFixed(2), z: +(t.z - 0.6).toFixed(2), yaw: 0, kind: 'eat', table: t.n, label: '坐下吃'},
      {x: +(t.x + dx).toFixed(2), z: +(t.z + 0.6).toFixed(2), yaw: Math.PI, kind: 'eat', table: t.n, label: '坐下吃'}]).flat()),
    ...S.tables2.map(t => [
      {x: t.x, z: +(t.z - 0.55).toFixed(2), yaw: 0, kind: 'eat', table: t.n, label: '坐下吃'},
      {x: t.x, z: +(t.z + 0.55).toFixed(2), yaw: Math.PI, kind: 'eat', table: t.n, label: '坐下吃'}]));
  S.spots = {order: S.interact[0], table_1: S.seats.find(s => s.table === 1)};
  return {version: 1, shop: S};
})();
if (typeof module !== 'undefined') module.exports = YANGYANG_LAYOUT;
