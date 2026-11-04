/* ===== 日和便利店（cvs 區域：原「日日便利」，AA_647 G03）室內配置 v4（模型 v2b）：BB（帳號 A）2026-11-04 =====
   照使用者參考圖 docs/story_planning/ref_images/shops/gongguan_cvs_int.webp（SCENE_RULES §12：參考圖就是規格）＋外觀 gongguan_cvs_ext.webp。
   對齊 LAWWW2 的外觀 v1（claude/second-ai-env-art 8de87af16）：店寬 11.2；自動門 x −0.56～1.36（門高 2.13、橫框到 2.73）；
     正面落地窗 x −5.3～2.93（窗高 0.08～2.73），左段 −5.3～−1.45 是內用座位區（窗前吧台＋三盞綠色吊燈）；x 2.93～5.6 白牆。
   v2（LAWWW2 退回 v1b 後）：西牆是實牆（隔壁是頁間書屋），牆上放層架；中後段三排雙面貨架；後牆左半是微波爐、熱水瓶、餐具、咖啡、環保袋層架；
     後牆右半整排亮著的冷藏櫃（飲品冷藏／鮮食・三明治・飯糰／冷凍食品）。
   v2b（LAWWW2 接進遊戲後量的）：三排貨架 x −3.7、−1.7、0.3（寬 0.8）；西牆壁架到第一排 1.05 m、排與排 1.2 m、第三排到櫃台 1.2 m。
   尺寸（請 LAWWW2 決定）：寬 11.2、深 11、高 3.3。舊的 cvs 是 12 × 9 × 3.2。
   舊座標要改的（LAWWW2／LAWWW）：出口 (0, 4.2) → (0.4, 5.0)；spawn (0, 3.5) → (0.4, 4.5)；結帳 (3.2, −0.6) → (1.5, 0.75)。
   格式照 shaola_layout.js：房間中心在原點，x 東、z 南、y 上；店門在 +z（z＝d/2）；yaw：人面向 (sin yaw, cos yaw)，0＝面向店門、π＝面向店裡。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 擋）。seats：kind 'eat'（窗前吧台 front 1～4、內用桌 table 1～2）。
   溫州街 A5 的日和便利店也進同一個 cvs 區域（同一家連鎖）；窗外景照舊由 LAWWW2 的 view 處理。 */
const CVS_LAYOUT = {
  version: 4,
  shop: {
    id: 'cvs', name: '日和便利店', glb: 'assets/models/env/second_ai/bb_support/cvs_interior.glb', v: 4,
    w: 11.2, d: 11.0, h: 3.3, floor: 'tile_600_light',
    front: {door: {x: 0.4, w: 1.92, h: 2.13, transom: 2.73, kind: 'auto_slide'}, windows: [[-5.3, -0.66], [1.46, 2.93]], sill: 0.08, head: 2.73,
      corner: [-5.6, -5.3], wall: [2.93, 5.6], note: '照 LAWWW2 外觀 v1：−5.6～−5.3 轉角柱、2.93～5.6 白牆'},
    left: {windows: [], note: '西牆實牆（隔壁是頁間書屋）'},
    westShelf: {x0: -5.6, x1: -5.15, z0: -4.2, z1: 1.8, h: 1.8, note: '西牆壁架（日用品、零食、飲料），面向 +x'},
    frontBar: {x0: -5.2, x1: -1.6, z0: 4.98, z1: 5.5, h: 1.05, stools: [-4.75, -3.85, -2.95, -2.05], stoolZ: 4.52, note: '正面左段落地窗前的吧台（外觀的內用座位區）'},
    pendants: [[-4.45, 5.05], [-3.4, 5.05], [-2.35, 5.05]],
    tables: [{n: 1, x: -4.3, z: 2.55, w: 0.72, d: 0.72}, {n: 2, x: -2.7, z: 3.0, w: 0.72, d: 0.72}],
    gondolas: [
      {n: 1, x: -3.7, z0: -3.8, z1: 0.6, w: 0.8, h: 1.65, sign: '日用品', note: '日用品：清潔、衛生紙、洗髮精'},
      {n: 2, x: -1.7, z0: -3.8, z1: 0.6, w: 0.8, h: 1.65, endcap: {z0: 0.6, z1: 1.25, h: 1.85, w: 1.2}, sign: '零食・泡麵', note: '零食；靠門那一頭是端架（日和便利店綠色頂牌、零食、泡麵碗）'},
      {n: 3, x: 0.3, z0: -3.8, z1: 0.6, w: 0.8, h: 1.65, sign: '文具・生活', note: '泡麵、沖泡飲品、文具'}
    ],
    signZ: -0.4,
    backStation: {x0: -5.5, x1: -0.45, z0: -5.5, z1: -4.95, h: 0.95, shelves: [1.45, 1.95], note: '後牆左半：微波爐、熱水瓶、餐具、咖啡、環保袋'},
    bins: {x0: -5.4, x1: -4.05, z0: -4.94, z1: -4.52, note: '三色回收桶：資源回收、一般垃圾、廚餘'},
    coolers: {x0: -0.25, x1: 5.6, z0: -5.5, z1: -4.8, h: 2.2, note: '後牆右半整排冷藏櫃，面向店門（+z），裡面亮', parts: [
      {kind: 'drink', x0: -0.25, x1: 3.26, doors: 3, label: '飲品冷藏'},
      {kind: 'fresh', x0: 3.26, x1: 4.43, doors: 1, label: '鮮食・三明治・飯糰'},
      {kind: 'frozen', x0: 4.43, x1: 5.6, doors: 1, label: '冷凍食品'}]},
    wallShelf: {x0: 5.15, x1: 5.6, z0: -4.75, z1: -1.2, h: 1.8, note: '右牆壁架（飲料、零食），面向 −x'},
    chestFreezer: {x0: 3.0, x1: 3.9, z0: -3.2, z1: -2.2, h: 0.85},
    counter: {x0: 1.9, x1: 2.65, z0: -0.9, z1: 3.3, h: 0.95, flap: {z0: 3.3, z1: 3.85},
      parts: [{kind: 'coffee_side', z0: -0.9, z1: 0.2}, {kind: 'register', z0: 0.2, z1: 1.3}, {kind: 'display', z0: 1.3, z1: 2.0}, {kind: 'hot_case', z0: 2.0, z1: 3.2}]},
    backCounter: {x0: 3.15, x1: 3.75, z0: -0.9, z1: 1.4, h: 0.95, note: '櫃台後面：咖啡機兩台、杯子'},
    counterWall: {x0: 3.75, x1: 3.87, z0: -1.05, z1: 3.85, note: '櫃台後面的標誌牆（太陽＋日和便利店、日和咖啡價目黑板）；牆後 x 3.87～5.6 是倉庫（關著）；店員走道 x 2.65～3.15'},
    endPanel: {x0: 2.65, x1: 3.75, z0: -1.05, z1: -0.9, note: '員工區北邊的隔板'},
    lockers: {x0: 3.2, x1: 3.75, z0: 1.45, z1: 2.6, h: 2.0, label: '包裹暫取區', note: '在櫃台後面、黑板下面；店員幫客人拿（外觀的置物櫃在店外白牆前）'},
    frontRack: {x0: 5.15, x1: 5.6, z0: 4.0, z1: 5.4, h: 1.6, note: '右前角的壁架（雨具、雜誌、生活用品），面向 −x'},
    doormat: {x0: -0.45, x1: 1.25, z0: 2.95, z1: 4.15},
    umbrella: {x0: 1.6, x1: 2.1, z0: 5.15, z1: 5.45},
    spawn: {x: 0.4, z: 4.5, yaw: Math.PI},
    exit: {at: {x: 0.4, z: 5.0}, label: '離開日和便利店', to: 'gongguan', note: '外觀的門中心就是公館的店門互動點（LAWWW2 外觀 v1）；從溫州街進來的（CVS_FROM wenzhou）回溫州街'},
    clerk: {x: 2.9, z: 0.75, yaw: -Math.PI / 2, note: '店員站在收銀機後面，面向客人'},
    blocks: [],   // 下面算
    seats: [],
    interact: [
      {kind: 'checkout', x: 1.5, z: 0.75, yaw: Math.PI / 2, label: '結帳：飯糰／咖啡／飲料'},
      {kind: 'hotfood', x: 1.5, z: 2.6, yaw: Math.PI / 2, label: '看熱食櫃'},
      {kind: 'coffee', x: 1.5, z: -0.4, yaw: Math.PI / 2, label: '點日和咖啡'},
      {kind: 'parcel', x: 1.5, z: 1.95, yaw: Math.PI / 2, label: '包裹暫取（請店員拿）'},
      {kind: 'microwave', x: -3.0, z: -4.5, yaw: Math.PI, label: '微波加熱'},
      {kind: 'cooler', x: 1.5, z: -4.4, yaw: Math.PI, label: '看冷藏櫃'}
    ],
    spots: {},
    lights: {note: '天花板 LED 燈條（沿 z，高 3.25）：x −4.0、−2.24、−0.48、1.28、3.04、4.8；前段兩條橫的 z 4.4／2.0；窗前吧台三盞綠色吊燈 x −4.45／−3.4／−2.35、z 5.05（燈罩底 2.35）；冷藏櫃、熱食櫃自己發光'},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  }
};
(function () {
  const S = CVS_LAYOUT.shop, B = (o) => [+((o.x0 + o.x1) / 2).toFixed(3), +((o.z0 + o.z1) / 2).toFixed(3), +(o.x1 - o.x0).toFixed(3), +(o.z1 - o.z0).toFixed(3)];
  const g = S.gondolas.map(q => B({x0: q.x - q.w / 2, x1: q.x + q.w / 2, z0: q.z0 - 0.27, z1: q.endcap ? q.z1 : q.z1 + 0.27}))   // 兩頭的端面商品各 0.27 m
    .concat(S.gondolas.filter(q => q.endcap).map(q => B({x0: q.x - q.endcap.w / 2, x1: q.x + q.endcap.w / 2, z0: q.endcap.z0, z1: q.endcap.z1})));
  const fb = S.frontBar;
  S.blocks = [].concat(
    [B(fb), B(S.westShelf)],
    fb.stools.map(x => [x, fb.stoolZ, 0.36, 0.36]),
    S.tables.map(t => [t.x, t.z, t.w, t.d]),
    S.tables.map(t => [t.x, +(t.z - 0.55).toFixed(2), 0.42, 0.42]), S.tables.map(t => [t.x, +(t.z + 0.55).toFixed(2), 0.42, 0.42]),
    g,
    [B(S.backStation), B(S.bins), B(S.coolers), B(S.wallShelf), B(S.chestFreezer),
     B(S.counter), B({x0: S.counter.x0, x1: S.counter.x1, z0: S.counter.flap.z0, z1: S.counter.flap.z1}),
     B({x0: S.counter.x1, x1: S.w / 2, z0: S.endPanel.z0, z1: S.counterWall.z1}),   // 員工區（櫃台後面）和標誌牆後面的倉庫整塊擋
     B({x0: S.counterWall.x0, x1: S.w / 2, z0: S.counterWall.z1, z1: S.counterWall.z1 + 0.15}),   // 倉庫南牆與門
     B(S.frontRack), B(S.umbrella)]);
  S.seats = [].concat(
    fb.stools.map((x, i) => ({x, z: fb.stoolZ, yaw: 0, kind: 'eat', front: i + 1, label: '坐在窗邊吧台'})),
    ...S.tables.map(t => [
      {x: t.x, z: +(t.z - 0.55).toFixed(2), yaw: 0, kind: 'eat', table: t.n, label: '坐下吃東西'},
      {x: t.x, z: +(t.z + 0.55).toFixed(2), yaw: Math.PI, kind: 'eat', table: t.n, label: '坐下吃東西'}]));
  S.spots = {counter: S.interact[0], front_1: S.seats[0], front_2: S.seats[1], table_1: S.seats[4]};
})();
if (typeof module !== 'undefined') module.exports = CVS_LAYOUT;
