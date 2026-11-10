/* ===== 公館燒臘（noodle 區域：阿鳳麵店改燒臘，AA_612 A 表）室內配置 v1：BB（帳號 A）2026-11-03 =====
   照使用者參考圖 docs/story_planning/ref_images/shops/gongguan_shaola_int.webp（SCENE_RULES §12：參考圖就是規格）：窄長老店，
   左邊一欄桌凳、中間走道、右邊整排不鏽鋼櫃台（前段燒臘玻璃櫃、中段砧板檯和收銀、後段盛飯台）、最裡面是廚房門＋菜單板＋電視。
   尺寸照 LAWWW2 11-03 23:08 的回覆（選 A：照參考圖改配置；使用者 22:0x「舊存檔不要管了」）：寬 6.0、深 13.0、高 3.2；zone id 照舊 noodle。
   格式照 wz_shops_layout.js：房間中心在原點，x 東、z 南、y 上；店門在 +z（z＝d/2）；yaw：人面向 (sin yaw, cos yaw)，0＝面向店門、π＝面向店裡。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 擋）。seats：坐下的位置（kind:'eat'、table＝桌號 1～5，從店門往裡數）。
   和 LAWWW2 數字不同的一處（請確認）：桌子改成 0.8 × 0.8、凳子在桌子前後 z ±0.62——原本 1.2 長的桌子配 z ±0.85 的凳子，
   相鄰兩桌的凳子（例：3.15 和 3.05）會疊在一起。 */
const SHAOLA_LAYOUT = {
  version: 1,
  shop: {
    id: 'noodle', name: '公館燒臘', glb: 'assets/models/env/second_ai/bb_support/shaola_interior.glb', v: 1,
    w: 6.0, d: 13.0, h: 3.2, floor: 'terrazzo_old',
    front: {door: {x: 0.0, w: 1.6}, windows: [[-3.0, -0.8], [0.8, 3.0]], sill: 0.6, head: 2.6},
    tables: [4.0, 2.2, 0.4, -1.4, -3.2].map((z, i) => ({n: i + 1, x: -2.1, z, w: 0.8, d: 0.8})),
    aisle: {x0: -1.3, x1: 0.9},
    counter: {x0: 1.0, x1: 1.9, z0: -4.5, z1: 5.4, h: 0.92,
      parts: [{kind: 'roast_case', z0: 2.2, z1: 5.4, note: '燒臘玻璃櫃：面向走道，裡面吊叉燒、燒鴨、油雞，暖色燈泡，下層肉盤，價目卡'},
              {kind: 'chop', z0: -1.0, z1: 2.2, note: '圓木砧板＋菜刀、電子秤、收銀機、抹布'},
              {kind: 'rice', z0: -4.5, z1: -1.0, note: '盛飯台：大電鍋、湯桶、碗盤疊'}]},
    backShelf: {x0: 2.7, x1: 3.0, z0: -4.5, z1: 3.0, note: '櫃台後面靠右牆的層架（碗盤、調味罐、紙條）'},
    kitchenDoor: {x: 1.5, w: 1.0},
    spawn: {x: 0.0, z: 5.0, yaw: Math.PI},
    exit: {at: {x: 0.0, z: 5.6}, label: '離開公館燒臘', to: 'gongguan', note: '公館那一頭不動（zones3d 的 gongguan 店門互動點照舊）'},
    clerk: {x: 2.4, z: 0.6, yaw: -Math.PI / 2, note: '老闆站在砧板檯後面，面向走道'},
    blocks: [],   // 下面算
    seats: [],
    interact: [
      {kind: 'order', x: 0.55, z: 0.6, yaw: Math.PI / 2, label: '點餐'},
      {kind: 'menu', x: 0.0, z: -5.6, yaw: Math.PI, label: '看菜單'},
      {kind: 'case', x: 0.55, z: 3.8, yaw: Math.PI / 2, label: '看櫥窗'}
    ],
    spots: {},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  }
};
(function () {
  const S = SHAOLA_LAYOUT.shop, c = S.counter, b = S.backShelf;
  S.blocks = S.tables.map(t => [t.x, t.z, t.w, t.d])
    .concat([[(c.x0 + c.x1) / 2, (c.z0 + c.z1) / 2, c.x1 - c.x0, c.z1 - c.z0],
             [(b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, b.x1 - b.x0, b.z1 - b.z0],
             [2.4, -5.6, 1.2, 0.9]]);   // 最裡面右邊：不鏽鋼冰箱＋紅籃
  S.seats = [].concat(...S.tables.map(t => [
    {x: t.x, z: +(t.z - 0.62).toFixed(2), yaw: 0, kind: 'eat', table: t.n, label: '坐下吃飯'},
    {x: t.x, z: +(t.z + 0.62).toFixed(2), yaw: Math.PI, kind: 'eat', table: t.n, label: '坐下吃飯'}]));
  const seatOf = (n, side) => S.seats.find(s => s.table === n && (side > 0 ? s.z > S.tables[n - 1].z : s.z < S.tables[n - 1].z));
  S.spots = {
    zhe_seat: seatOf(3, -1),                                   // 阿哲：中間那一桌、面向店門
    regular_1: seatOf(4, 1), regular_2: seatOf(5, -1), regular_3: seatOf(5, 1),   // AA_110 6-3 週二、週四的固定客人
    counter: S.interact[0]
  };
})();
if (typeof module !== 'undefined') module.exports = SHAOLA_LAYOUT;
