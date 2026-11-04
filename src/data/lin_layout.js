/* ===== 林家乾麵（溫州街 A4，zone id 照舊 wz_lin；AA_654）室內配置 v1：BB（帳號 A）2026-11-04 =====
   照使用者參考圖 docs/story_planning/ref_images/shops/wz_lin_int.webp（SCENE_RULES §12：參考圖就是規格）＋外觀 wz_lin_ext.webp。
   從 claude/confident-ritchie-8rwh7t 的 src/data/wz_shops_layout.js 的 lin 出發（LAWWW2：門窗、房間、出口、出生點照舊不動）：
     房間 6.4 × 8 × 3，店面在 +z＝4；正面整面開著（鐵捲門捲在上面），開口 x −3～2.1：左邊是攤車，右邊 2.2 m 是入口（門 x 1、寬 2.2）。
     出口 (1, 3.55)、出生點 (1, 3.05)、enterAt／exit.spawn（溫州街的世界座標）照舊。舊的 key（id、name、front、spawn、exit、enterAt、clerk、interact 的 order／menu、
     seats 的 table 編號）保留；seats、blocks、interact 照新的室內重算，舊→新對照表在 docs/story_planning/bb_models/lin/README.md。
   室內照參考圖：左邊不鏽鋼煮麵台＋抽油煙機（上面掛「林家乾麵」招牌）；中間四張方桌（木椅＋紅色塑膠凳）；後面白磁磚矮牆、洗碗槽、不鏽鋼冰箱、碗盤架、
     玻璃磚窗；右牆紅紙菜單、時鐘、壁扇、相框、「自助調味區」；右前收銀台（上面一塊小招牌）。
   外觀（綠色雨遮、招牌、門口攤車朝街上那一面）是 LAWWW2 的 GLB；室內只做攤車店裡這一側（煮麵台的延伸）。
   格式和 wz_shops_layout.js 相同：房間中心在原點，x 東、z 南、y 上；yaw：人面向 (sin yaw, cos yaw)，0＝面向店門、π＝面向店裡。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 擋）。 */
const LIN_LAYOUT = (function () {
  const W = 6.4, D = 8.0, H = 3.0;
  const X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2;
  const OPEN = [-3.0, 2.1];                 // 正面開口（鐵捲門捲在上面）
  const DOOR = {x: 1.0, w: 2.2, style: 'open'};
  const S = {
    id: 'wz_lin', name: '林家乾麵', glb: 'assets/models/env/second_ai/bb_support/lin_interior.glb', v: 1,
    w: W, d: D, h: H, floor: 'terrazzo', hours: '11:00–14:00、17:00–21:00（週一公休；places.js 照舊）',
    front: {door: DOOR, windows: [], open: OPEN, views: [OPEN], view: 'wz_lin', viewDepth: 10, viewW: 3.8, viewH: 1.9, viewY: 1.3, note: '整面開著（鐵捲門捲在上面）：左邊攤車，右邊 2.2 m 是入口（照舊）'},
    spawn: {x: 1.0, z: 3.05, yaw: Math.PI},
    exit: {at: {x: 1.0, z: 3.55}, label: '離開林家乾麵', to: 'wenzhou', spawn: {x: 35.0, z: 4.1, yaw: Math.PI}},
    enterAt: {x: 35.0, z: 4.6, label: '進去林家乾麵', note: '照舊（A4 店面中間偏西）'},
    cart: {x0: -3.0, x1: -0.4, z0: 2.95, z1: 3.65, h: 0.9, note: '攤車（店裡這一側：湯鍋、麵杓、碗疊）；朝街上的那一面是 LAWWW2 外觀'},
    staff: {x0: X0, x1: -0.4, z0: 2.2, z1: 2.95, note: '攤車後面老闆站的地方'},
    cookLine: {x0: X0, x1: X0 + 0.75, z0: -1.4, z1: 2.2, h: 0.88, note: '左牆不鏽鋼煮麵台：煮麵機、湯鍋、滷味盤、生麵、青菜籃、碗盤架；上面抽油煙機＋「林家乾麵」招牌'},
    tables: [{n: 1, x: -0.85, z: 1.2}, {n: 2, x: 1.05, z: 0.9}, {n: 3, x: -0.85, z: -1.0}, {n: 4, x: 1.05, z: -1.3}],   // 方桌 0.8 × 0.75，木椅在 z ±0.5；紅色塑膠凳在桌子靠走道那一邊
    backWall: {x0: -1.2, x1: 1.0, z0: -2.95, z1: -2.65, h: 1.1, note: '後面白磁磚矮牆（上面是檯面，後面是洗碗區，不能進去）'},
    fridge: {x0: -2.55, x1: -1.75, z0: Z0, z1: Z0 + 0.75, h: 1.95, note: '不鏽鋼冰箱'},
    dishRack: {x0: 1.25, x1: 2.55, z0: Z0, z1: Z0 + 0.5, h: 1.9, note: '碗盤架＋水槽'},
    condiments: {x0: X1 - 0.45, x1: X1, z0: -2.4, z1: 0.0, h: 0.9, note: '自助調味區：不鏽鋼架、筷子、湯匙、辣椒醬、醋、醬油、面紙、籃子'},
    cashier: {x0: X1 - 0.75, x1: X1, z0: 1.6, z1: 3.3, h: 1.0, note: '收銀台（木頭，面向走道那一面是有燈的「林家乾麵」小招牌；收銀機、叫人鈴、名片）'},
    menu: {x: X1, z0: -1.9, z1: 0.6, y0: 1.85, y1: 2.65, items: ['乾麵 60', '麻醬麵 70', '餛飩麵 85', '榨菜肉絲麵 85', '榨菜肉絲湯 55', '貢丸湯 40', '餛飩湯 50', '燙青菜 40', '滷蛋 15'], note: '紅紙菜單（照室內圖，AA_654 第 4 節）'},
    blocks: [], seats: [],
    interact: [
      {x: -0.1, z: 2.55, kind: 'order', label: '點餐（林家乾麵）', note: '照舊：攤車右邊'},
      {x: +(X1 - 1.15).toFixed(2), z: -0.1, kind: 'menu', yaw: Math.PI / 2, label: '看菜單', note: '舊 (−1.3, −0.3) 在新的桌子上，搬到右牆菜單下面'},
      {x: +(X1 - 1.15).toFixed(2), z: 2.45, kind: 'pay', yaw: Math.PI / 2, label: '結帳', note: '新增：收銀台前'},
      {x: X1 - 0.85, z: -2.0, kind: 'condiments', yaw: Math.PI / 2, label: '自助調味區'}
    ],
    clerk: {x: -1.7, z: 2.55, yaw: 0, note: '照舊：攤車後面（店裡這一側），面向街上'},
    clerk2: {x: X1 - 0.35, z: 2.45, yaw: -Math.PI / 2, note: '新增：收銀台後面（老闆娘）'},
    walkNote: '',
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  };
  const B = (o) => [+((o.x0 + o.x1) / 2).toFixed(3), +((o.z0 + o.z1) / 2).toFixed(3), +(o.x1 - o.x0).toFixed(3), +(o.z1 - o.z0).toFixed(3)];
  const r2 = (v) => +v.toFixed(2);
  const SIDE = (t) => (t.x < 0 ? -0.6 : 0.6);   // 塑膠凳：在桌子外側（中間走道留寬）
  S.blocks = [].concat(
    [B(S.cart), B(S.staff), B(S.cookLine), B(S.backWall), B({x0: X0, x1: X1, z0: Z0, z1: S.backWall.z0}), B(S.condiments), B(S.cashier),
     B({x0: S.cashier.x1 - 0.45, x1: X1, z0: S.cashier.z0, z1: S.cashier.z1})],                      // 後面整條（冰箱、洗碗區、碗盤架都在矮牆後面）
    S.tables.map(t => [t.x, t.z, 0.8, 0.75]),
    [].concat(...S.tables.map(t => [[t.x, r2(t.z - 0.5), 0.42, 0.4], [t.x, r2(t.z + 0.5), 0.42, 0.4], [r2(t.x + SIDE(t)), t.z, 0.36, 0.36]])));
  S.seats = [].concat(...S.tables.map(t => [
    {x: t.x, z: r2(t.z - 0.5), yaw: 0, table: t.n, label: '坐下'},
    {x: t.x, z: r2(t.z + 0.5), yaw: Math.PI, table: t.n, label: '坐下'},
    {x: r2(t.x + SIDE(t)), z: t.z, yaw: SIDE(t) > 0 ? -Math.PI / 2 : Math.PI / 2, table: t.n, stool: true, label: '坐下（塑膠凳）'}]));
  S.walkNote = '入口 x −0.1～2.1；中間走道 x −0.45～0.65（兩欄桌子中間 1.1 m）；煮麵台到左欄塑膠凳 0.82 m、右欄塑膠凳到調味區 0.92 m';
  return S;
})();
if (typeof module !== 'undefined') module.exports = LIN_LAYOUT;
