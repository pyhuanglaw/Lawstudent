/* ===== 日和便利店（cvs 區域：原「日日便利」，AA_647 G03）室內配置 v1：BB（帳號 A）2026-11-04 =====
   照使用者參考圖 docs/story_planning/ref_images/shops/gongguan_cvs_int.webp（SCENE_RULES §12：參考圖就是規格）＋外觀 gongguan_cvs_ext.webp：
   轉角店。左邊（西牆 −x）整排落地窗＋窗邊木吧台與高腳椅；前面（+z）店門是自動門，門左邊是窗；靠窗的前段兩張內用小方桌；
   中間三排雙面貨架（零食泡麵、日用品、文具，吊牌）；右後（東牆 +x 後段）冷藏櫃（飲品冷藏／鮮食三明治飯糰／冷凍食品，綠色頂框）；
   右邊櫃台（收銀、熱食櫃、咖啡機、日和咖啡價目黑板、學生套餐與晚間優惠海報）；右前角包裹暫取區櫃；左後是微波爐熱水瓶層架＋三色回收桶；後牆整排壁架。
   尺寸（請 LAWWW2 決定）：寬 10、深 14、高 3.3——舊的 cvs 是 12 × 9 × 3.2；參考圖看起來窄而深（左窗吧台到右邊櫃台約 9～10 m，貨架三排、後面還有壁架），所以改窄 2 m、加深 5 m。
   舊座標要改的（LAWWW2／LAWWW）：出口 (0, 4.2) → (1.6, 6.3)；spawn (0, 3.5) → (1.6, 5.8)；結帳 (3.2, −0.6) → (2.7, 1.05)。
   格式照 shaola_layout.js：房間中心在原點，x 東、z 南、y 上；店門在 +z（z＝d/2）；yaw：人面向 (sin yaw, cos yaw)，0＝面向店門、π＝面向店裡。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 擋）。seats：kind 'eat'（窗邊高腳椅 bar 1～9、內用桌 table 1～2）。
   溫州街 A5 的日和便利店也進同一個 cvs 區域（同一家連鎖）；窗外景（gongguan／wenzhou）照舊由 LAWWW2 的 view 處理。 */
const CVS_LAYOUT = {
  version: 1,
  shop: {
    id: 'cvs', name: '日和便利店', glb: 'assets/models/env/second_ai/bb_support/cvs_interior.glb', v: 1,
    w: 10.0, d: 14.0, h: 3.3, floor: 'tile_600_light',
    front: {door: {x: 1.6, w: 2.0, kind: 'auto_slide'}, windows: [[-5.0, 0.45], [2.75, 3.6]], sill: 0.12, head: 2.9},
    left: {windows: [[-2.75, 7.0]], sill: 0.12, head: 2.9, note: '西牆前段整排落地窗（轉角店的側面）；z −2.9 以北是員工室'},
    bar: {x0: -5.0, x1: -4.48, z0: -1.85, z1: 6.35, h: 1.05, note: '窗邊木吧台（淺色橡木）'},
    stools: [5.6, 4.7, 3.8, 2.9, 2.0, 1.1, 0.2, -0.7, -1.5],
    stoolX: -4.02,
    tables: [{n: 1, x: -2.5, z: 4.6, w: 0.72, d: 0.72}, {n: 2, x: -2.5, z: 2.4, w: 0.72, d: 0.72}],
    gondolas: [
      {n: 1, x: -1.05, z0: -5.3, z1: -0.8, w: 0.7, h: 1.55, sign: '日用品', note: '日用品：清潔、衛生紙、洗髮精'},
      {n: 2, x: 0.45, z0: -5.3, z1: 0.35, w: 0.7, h: 1.55, endcap: {z0: 0.35, z1: 0.95, h: 1.7}, sign: '零食・泡麵', note: '零食、泡麵；靠門那一頭是端架（日和便利店招牌、泡麵碗、零食）'},
      {n: 3, x: 1.95, z0: -5.3, z1: -2.4, w: 0.7, h: 1.55, sign: '文具・生活', note: '文具、雨具、生活用品'}
    ],
    backShelf: {x0: -2.5, x1: 4.25, z0: -7.0, z1: -6.5, h: 2.1},
    staffRoom: {x0: -5.0, x1: -2.6, z0: -7.0, z1: -2.9, door: {z: -4.2, w: 0.9}, note: '左後員工室（關著、走不進去）'},
    microwave: {x0: -4.9, x1: -2.75, z0: -2.84, z1: -2.38, h: 0.95, note: '微波爐、熱水瓶、袋子層架（貼在員工室的牆上，面向店裡）'},
    bins: {x0: -4.15, x1: -2.8, z0: -2.37, z1: -1.95, note: '三色回收桶：資源回收、一般垃圾、廚餘'},
    coolers: {x0: 4.3, x1: 5.0, z0: -6.5, z1: -1.4, h: 2.15, parts: [
      {kind: 'drink', z0: -6.5, z1: -4.46, doors: 2, label: '飲品冷藏'},
      {kind: 'fresh', z0: -4.46, z1: -2.42, doors: 2, label: '鮮食・三明治・飯糰'},
      {kind: 'frozen', z0: -2.42, z1: -1.4, doors: 1, label: '冷凍食品'}]},
    chestFreezer: {x0: 2.6, x1: 3.5, z0: -2.0, z1: -0.9, h: 0.85},
    counter: {x0: 3.1, x1: 3.85, z0: -0.6, z1: 4.0, h: 0.95, flap: {z0: 4.0, z1: 4.7},
      parts: [{kind: 'coffee_side', z0: -0.6, z1: 0.5}, {kind: 'register', z0: 0.5, z1: 1.6}, {kind: 'display', z0: 1.6, z1: 2.4}, {kind: 'hot_case', z0: 2.4, z1: 3.6}]},
    backCounter: {x0: 4.45, x1: 5.0, z0: -0.6, z1: 4.6, h: 0.95, note: '櫃台後面：咖啡機、杯子、菸櫃位置改成紙杯／吸管架（不放菸）'},
    endPanel: {x0: 3.85, x1: 5.0, z0: -0.75, z1: -0.6, note: '員工區北邊的隔板（客人走不進櫃台後面）'},
    lockers: {x0: 4.45, x1: 5.0, z0: 4.9, z1: 6.7, h: 2.0, label: '包裹暫取區'},
    doormat: {x0: 0.75, x1: 2.45, z0: 5.6, z1: 6.85},
    spawn: {x: 1.6, z: 5.8, yaw: Math.PI},
    exit: {at: {x: 1.6, z: 6.3}, label: '離開日和便利店', to: 'gongguan', note: '公館那一頭不動（zones3d 的 gongguan 店門互動點照舊）；從溫州街進來的（CVS_FROM wenzhou）回溫州街'},
    clerk: {x: 4.15, z: 1.05, yaw: -Math.PI / 2, note: '店員站在收銀機後面，面向客人'},
    blocks: [],   // 下面算
    seats: [],
    interact: [
      {kind: 'checkout', x: 2.7, z: 1.05, yaw: Math.PI / 2, label: '結帳：飯糰／咖啡／飲料'},
      {kind: 'hotfood', x: 2.7, z: 3.0, yaw: Math.PI / 2, label: '看熱食櫃'},
      {kind: 'coffee', x: 2.7, z: -0.1, yaw: Math.PI / 2, label: '點日和咖啡'},
      {kind: 'parcel', x: 3.85, z: 5.8, yaw: Math.PI / 2, label: '包裹暫取'},
      {kind: 'microwave', x: -3.8, z: -1.55, yaw: Math.PI, label: '微波加熱'},
      {kind: 'cooler', x: 3.75, z: -4.0, yaw: Math.PI / 2, label: '看冷藏櫃'}
    ],
    spots: {},
    lights: {note: '天花板 LED 燈條（沿 z，高 3.25）：x −3.4、−1.92、−0.44、1.04、2.52、4.0；窗邊綠色吊燈 x −4.55、z 5.2／3.4／1.6／−0.2（燈罩底 2.35）；冷藏櫃背光；熱食櫃燈'},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  }
};
(function () {
  const S = CVS_LAYOUT.shop, B = (o) => [+((o.x0 + o.x1) / 2).toFixed(3), +((o.z0 + o.z1) / 2).toFixed(3), +(o.x1 - o.x0).toFixed(3), +(o.z1 - o.z0).toFixed(3)];
  const g = S.gondolas.map(q => B({x0: q.x - q.w / 2, x1: q.x + q.w / 2, z0: q.z0 - 0.27, z1: q.endcap ? q.endcap.z1 : q.z1 + 0.27}));   // 兩頭的端面商品各 0.27 m
  const st = S.staffRoom;
  S.blocks = [].concat(
    [B(S.bar)],
    S.stools.map(z => [S.stoolX, z, 0.36, 0.36]),
    S.tables.map(t => [t.x, t.z, t.w, t.d]),
    S.tables.map(t => [t.x, +(t.z - 0.55).toFixed(2), 0.42, 0.42]), S.tables.map(t => [t.x, +(t.z + 0.55).toFixed(2), 0.42, 0.42]),
    g,
    [B(S.backShelf), B({x0: st.x0, x1: st.x1 + 0.06, z0: st.z0, z1: st.z1 + 0.06}), B(S.microwave), B(S.bins), B(S.coolers), B(S.chestFreezer),
     B(S.counter), B({x0: S.counter.x0, x1: S.counter.x1, z0: S.counter.flap.z0, z1: S.counter.flap.z1}),
     B({x0: S.counter.x1, x1: S.w / 2, z0: S.endPanel.z0, z1: S.lockers.z0 - 0.2}),   // 員工區（櫃台後面）整塊擋：店員走在裡面
     B(S.lockers)]);
  S.seats = [].concat(
    S.stools.map((z, i) => ({x: S.stoolX, z, yaw: -Math.PI / 2, kind: 'eat', bar: i + 1, label: '坐在窗邊吧台'})),
    ...S.tables.map(t => [
      {x: t.x, z: +(t.z - 0.55).toFixed(2), yaw: 0, kind: 'eat', table: t.n, label: '坐下吃東西'},
      {x: t.x, z: +(t.z + 0.55).toFixed(2), yaw: Math.PI, kind: 'eat', table: t.n, label: '坐下吃東西'}]));
  S.spots = {counter: S.interact[0], window_1: S.seats[2], window_2: S.seats[3], table_1: S.seats[9]};
})();
if (typeof module !== 'undefined') module.exports = CVS_LAYOUT;
