/* ===== 洋洋鹹酥雞（公館 G05，原「滷味・鹹酥雞」，AA_650；內部 id 照舊 luwei）室內配置 v3（模型 v1c）：BB（帳號 A）2026-11-04 =====
   照使用者參考圖 docs/story_planning/ref_images/shops/gongguan_yangyang_int.webp（SCENE_RULES §12：參考圖就是規格）＋外觀 _ext.webp。
   門窗對齊 LAWWW2 外觀（claude/second-ai-env-art 5550948fb，docs/art-rebuild/second_ai/wip/gongguan5/DOORS.md）：
     店寬 9.2（本地 x 從騎樓往裡看左→右，和室內 x 同方向）；一樓到 3.85（室內做到 3.3 加天花板）；
     左邊開放式廚房／炸物櫃台 x −4.3～−0.25（沒有玻璃，開口頂 2.85；臨騎樓的櫃台面 0.82、上面玻璃展示櫃 0.82～1.55）；
     玻璃對開門 x 0.45～1.95（高 2.47）；右邊落地窗 x 1.95～3.5（0.3～2.47）；x 3.5～4.3 實牆；門牌 132。
   配置：炸物櫃台、炸鍋在左邊開口後面（客人在騎樓點餐）；店裡那一側也有一座炸物櫃（面向店裡、上面是菜單板，參考圖左邊那一排），店內也能點；
     廚房後面接一道白磁磚腰牆＋不鏽鋼框玻璃隔間；座位在門和窗後面、店的中後段；右牆自助區（餐具、醬料、飲用水、垃圾分類）；後牆冷飲櫃、紅色門簾、層架。
   改數字：W、D、H、OPEN、DOOR、WIN（外觀）；KZ（廚房多深）。
   格式照 shaola_layout.js：房間中心在原點，x 東、z 南、y 上；店門在 +z（z＝d/2）；yaw：人面向 (sin yaw, cos yaw)，0＝面向店門、π＝面向店裡。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 擋）。seats：kind 'eat'。 */
const YANGYANG_LAYOUT = (function () {
  const W = 9.2, D = 11.0, H = 3.3;
  const X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2;
  const OPEN = {x0: -4.3, x1: -0.25, top: 2.85, counterH: 0.82, caseTop: 1.55};   // 臨騎樓的炸物櫃台開口
  const DOOR = {x0: 0.45, x1: 1.95, h: 2.47};
  const WIN = {x0: 1.95, x1: 3.5, sill: 0.3, head: 2.47};
  const KZ = -2.5;                                                                // 廚房的後牆（z）：廚房 z KZ～Z1
  const S = {
    id: 'luwei', name: '洋洋鹹酥雞', glb: 'assets/models/env/second_ai/bb_support/yangyang_interior.glb', v: 3, doorNo: '132',
    w: W, d: D, h: H, floor: 'tile_300_lightgray', hours: '17:00～01:00',
    front: {open: OPEN, door: {x: (DOOR.x0 + DOOR.x1) / 2, w: DOOR.x1 - DOOR.x0, h: DOOR.h, kind: 'double_glass'}, windows: [[WIN.x0, WIN.x1]], sill: WIN.sill, head: WIN.head,
      solid: [[X0, OPEN.x0], [OPEN.x1, DOOR.x0], [WIN.x1, X1]], note: '照 LAWWW2 外觀：x 3.5～4.3 實牆（門外回收桶），4.3～4.6 柱'},
    kitchen: {x0: X0, x1: OPEN.x1, z0: KZ, z1: Z1, note: '開放式廚房：油鍋三個（靠西牆）、抽油煙機、備料檯、調味架；老闆站在臨騎樓的櫃台後面'},
    streetCounter: {x0: OPEN.x0, x1: OPEN.x1, z0: Z1 - 0.6, z1: Z1, h: OPEN.counterH, caseTop: OPEN.caseTop, note: '臨騎樓的炸物櫃台：櫃台面 0.82＋玻璃展示櫃（生料一盤一盤），客人在騎樓夾'},
    insideCase: {x0: OPEN.x1 - 0.8, x1: OPEN.x1, z0: 1.0, z1: Z1 - 0.8, h: 1.0, note: '店內那一側的炸物櫃（斜玻璃），面向 +x；上面是招牌與菜單板'},
    partition: {x: OPEN.x1, z0: KZ, z1: 1.0, dado: 0.95, note: '廚房後段：白磁磚腰牆＋不鏽鋼框玻璃'},
    menuBoard: {x: OPEN.x1, z0: 0.9, z1: 4.3, y0: 1.95, y1: 3.2},
    tables4: [{n: 1, x: 1.2, z: 2.9}, {n: 2, x: 1.2, z: 0.6}, {n: 3, x: 1.1, z: -1.7}, {n: 4, x: -2.9, z: -4.3}],   // 四人桌 1.1 × 0.75（長邊沿 x），椅子在 z ±0.6
    tables2: [{n: 6, x: 3.5, z: -0.6}, {n: 7, x: 3.5, z: -2.4}, {n: 8, x: 3.6, z: -4.1}],   // 兩人桌 0.7 × 0.7，椅子在 z ±0.55
    selfServe: {x0: X1 - 0.6, x1: X1, z0: 1.0, z1: 2.9, h: 0.9, note: '自助區：餐具、醬料（辣椒、蒜泥、胡椒粉）、飲用水桶、垃圾分類三格'},
    fridge: {x0: 1.3, x1: 2.2, z0: Z0, z1: Z0 + 0.72, h: 2.0, label: '冷飲'},
    backCounter: {x0: -1.6, x1: 0.2, z0: Z0 + 0.95, z1: Z0 + 1.5, h: 1.0, note: '後面的木頭結帳櫃台（裝飾；結帳互動照舊併在點餐）'},
    curtainDoor: {x: -0.6, w: 0.9, note: '後牆的紅色門簾（往後面，關著）'},
    backShelf: {x0: 0.25, x1: 1.15, z0: Z0, z1: Z0 + 0.4, h: 2.4},
    spawn: {x: (DOOR.x0 + DOOR.x1) / 2, z: Z1 - 0.8, yaw: Math.PI},
    exit: {at: {x: (DOOR.x0 + DOOR.x1) / 2, z: Z1 - 0.3}, label: '離開洋洋鹹酥雞', to: 'gongguan', note: '公館那一頭：G05 店門互動點（門的中心 x 1.2，LAWWW2 交 LAWWW）'},
    clerk: {x: -2.3, z: Z1 - 1.0, yaw: 0, note: '老闆站在臨騎樓的櫃台後面，面向騎樓'},
    clerk2: {x: OPEN.x1 - 1.2, z: 2.8, yaw: Math.PI / 2, note: '第二個店員：店內炸物櫃後面，面向店裡（晚上人多時）'},
    blocks: [], seats: [],
    interact: [
      {kind: 'order_street', outside: true, x: -2.3, z: Z1 + 0.6, yaw: Math.PI, label: '點炸物（騎樓）', note: '**在店外**（騎樓那一側，公館區域的座標要換算：店門中心 x 1.2 → 這裡 x −2.3 是店門往左 3.5 m、騎樓上離店面 0.6 m）；LAWWW 接在公館區域，不在室內'},
      {kind: 'order', x: OPEN.x1 + 0.45, z: 3.4, yaw: -Math.PI / 2, label: '點炸物（店內）'},
      {kind: 'menu', x: OPEN.x1 + 0.45, z: 1.6, yaw: -Math.PI / 2, label: '看菜單'},
      {kind: 'drink', x: 1.75, z: Z0 + 1.2, yaw: Math.PI, label: '拿冷飲'},
      {kind: 'selfserve', x: +(X1 - 1.0).toFixed(2), z: 1.95, yaw: Math.PI / 2, label: '自助區（餐具、醬料、水）'}
    ],
    spots: {},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  };
  const B = (o) => [+((o.x0 + o.x1) / 2).toFixed(3), +((o.z0 + o.z1) / 2).toFixed(3), +(o.x1 - o.x0).toFixed(3), +(o.z1 - o.z0).toFixed(3)];
  const r2 = (v) => +v.toFixed(2);
  S.blocks = [].concat(
    [B({x0: X0, x1: OPEN.x1 + 0.06, z0: KZ, z1: Z1})],                     // 廚房、兩座炸物櫃、隔間整塊擋（店員在裡面）
    S.tables4.map(t => [t.x, t.z, 1.1, 0.75]), [].concat(...S.tables4.map(t => [-0.28, 0.28].map(dx => [[r2(t.x + dx), r2(t.z - 0.6), 0.42, 0.42], [r2(t.x + dx), r2(t.z + 0.6), 0.42, 0.42]]).flat())),
    S.tables2.map(t => [t.x, t.z, 0.7, 0.7]), [].concat(...S.tables2.map(t => [[t.x, r2(t.z - 0.55), 0.42, 0.42], [t.x, r2(t.z + 0.55), 0.42, 0.42]])),
    [B(S.selfServe), B(S.fridge), B(S.backShelf), B({x0: S.backCounter.x0, x1: S.backCounter.x1, z0: Z0, z1: S.backCounter.z1})]);   // 結帳木櫃＋後面（店員）
  S.seats = [].concat(
    ...S.tables4.map(t => [-0.28, 0.28].map(dx => [
      {x: r2(t.x + dx), z: r2(t.z - 0.6), yaw: 0, kind: 'eat', table: t.n, label: '坐下吃'},
      {x: r2(t.x + dx), z: r2(t.z + 0.6), yaw: Math.PI, kind: 'eat', table: t.n, label: '坐下吃'}]).flat()),
    ...S.tables2.map(t => [
      {x: t.x, z: r2(t.z - 0.55), yaw: 0, kind: 'eat', table: t.n, label: '坐下吃'},
      {x: t.x, z: r2(t.z + 0.55), yaw: Math.PI, kind: 'eat', table: t.n, label: '坐下吃'}]));
  /* BB-C 11-12（BB_255 245f1e5174）：(0.92, 2.3) 那張點地 44 次都停在 0.2 m 外、互動鍵是「看炸物櫃」——炸物櫃和四人桌之間只剩約 0.74 m。
     BB 裁定：挪桌讓出 0.9 m 或從座位拿掉（§12 第 4 點：坐不下就別擺成座位）→ 先拿掉（椅子模型和擋格照舊，只是不當座位：玩家、客人都不坐）。*/
  S.seatsDropped = [{x: 0.92, z: 2.3}];
  S.seats = S.seats.filter(q => !S.seatsDropped.some(d => Math.abs(q.x - d.x) < 0.01 && Math.abs(q.z - d.z) < 0.01));
  S.spots = {order: S.interact[1], table_1: S.seats.find(s => s.table === 1)};
  return {version: 3, shop: S};
})();
if (typeof module !== 'undefined') module.exports = YANGYANG_LAYOUT;
