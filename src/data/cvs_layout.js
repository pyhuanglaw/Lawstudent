/* ===== 日和便利店（cvs 區域：原「日日便利」，AA_647 G03）室內配置 v2（v1b）：BB（帳號 A）2026-11-04 =====
   照使用者參考圖 docs/story_planning/ref_images/shops/gongguan_cvs_int.webp（SCENE_RULES §12：參考圖就是規格）＋外觀 gongguan_cvs_ext.webp。
   v1b 對齊 LAWWW2 的外觀 v1（claude/second-ai-env-art 8de87af16，docs/art-rebuild/second_ai/wip/gongguan4/README.md）：
     店寬 11.2（本地 x 從騎樓往店裡看左→右，和室內 x 同方向）；自動門 x −0.56～1.36（門高 2.13、上面橫框到 2.73）；
     正面落地窗 x −5.3～2.93（窗高 0.08～2.73）；左段 −5.3～−1.45 是參考圖轉角那一面的內用座位區（室內放一排吧台座位）；x 2.93～5.6 是白牆。
   西牆（−x）也開一整排落地窗＋窗邊吧台（參考圖的「左側整排窗」；遊戲裡是中間的店，西牆窗外的景由 LAWWW2 決定，可以用鄰居騎樓或關掉）。
   尺寸（請 LAWWW2 決定）：寬 11.2、深 11、高 3.3（外觀一樓到 3.85，室內做到 3.3 加天花板）。舊的 cvs 是 12 × 9 × 3.2；v1 是 10 × 14（BB 退回：後段太遠）。
   舊座標要改的（LAWWW2／LAWWW）：出口 (0, 4.2) → (0.4, 5.0)；spawn (0, 3.5) → (0.4, 4.5)；結帳 (3.2, −0.6) → (3.0, 0.75)。
   格式照 shaola_layout.js：房間中心在原點，x 東、z 南、y 上；店門在 +z（z＝d/2）；yaw：人面向 (sin yaw, cos yaw)，0＝面向店門、π＝面向店裡。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（牆由 room() 擋）。seats：kind 'eat'（西窗吧台 bar 1～7、正面窗吧台 front 1～3、內用桌 table 1～2）。
   溫州街 A5 的日和便利店也進同一個 cvs 區域（同一家連鎖）；窗外景（gongguan／wenzhou）照舊由 LAWWW2 的 view 處理。 */
const CVS_LAYOUT = {
  version: 2,
  shop: {
    id: 'cvs', name: '日和便利店', glb: 'assets/models/env/second_ai/bb_support/cvs_interior.glb', v: 2,
    w: 11.2, d: 11.0, h: 3.3, floor: 'tile_600_light',
    front: {door: {x: 0.4, w: 1.92, h: 2.13, transom: 2.73, kind: 'auto_slide'}, windows: [[-5.3, -0.66], [1.46, 2.93]], sill: 0.08, head: 2.73,
      corner: [-5.6, -5.3], wall: [2.93, 5.6], note: '照 LAWWW2 外觀 v1：−5.6～−5.3 轉角柱、2.93～5.6 白牆'},
    left: {windows: [[-2.0, 5.5]], sill: 0.08, head: 2.73, note: '西牆前段整排落地窗；z −2.15 以北是員工室'},
    bar: {x0: -5.6, x1: -5.08, z0: -1.1, z1: 4.4, h: 1.05, note: '西窗木吧台（淺色橡木）'},
    stools: [3.9, 3.1, 2.3, 1.5, 0.7, -0.1, -0.85],
    stoolX: -4.62,
    frontBar: {x0: -4.4, x1: -1.6, z0: 4.98, z1: 5.5, h: 1.05, stools: [-3.9, -3.0, -2.1], stoolZ: 4.52, note: '正面左段落地窗前的吧台（外觀的內用座位區）'},
    tables: [{n: 1, x: -2.55, z: 3.0, w: 0.72, d: 0.72}, {n: 2, x: -2.55, z: 1.0, w: 0.72, d: 0.72}],
    gondolas: [
      {n: 1, x: -1.2, z0: -3.6, z1: 0.0, w: 0.7, h: 1.65, sign: '日用品', note: '日用品：清潔、衛生紙、洗髮精'},
      {n: 2, x: 0.4, z0: -3.6, z1: 0.9, w: 0.7, h: 1.65, endcap: {z0: 0.9, z1: 1.55, h: 1.85, w: 1.2}, sign: '零食・泡麵', note: '零食、泡麵；正對店門的端架（日和便利店綠色頂牌、零食、泡麵碗）'},
      {n: 3, x: 2.0, z0: -3.6, z1: -1.0, w: 0.7, h: 1.65, sign: '文具・生活', note: '文具、雨具、生活用品'}
    ],
    signZ: -0.7,
    backShelf: {x0: -2.9, x1: 4.85, z0: -5.5, z1: -5.0, h: 2.1},
    staffRoom: {x0: -5.6, x1: -3.0, z0: -5.5, z1: -2.15, door: {z: -3.5, w: 0.9}, note: '左後員工室（關著、走不進去）'},
    microwave: {x0: -5.5, x1: -3.15, z0: -2.09, z1: -1.63, h: 0.95, note: '微波爐、熱水瓶、袋子層架（貼在員工室的牆上，面向店裡）'},
    bins: {x0: -4.75, x1: -3.4, z0: -1.62, z1: -1.2, note: '三色回收桶：資源回收、一般垃圾、廚餘'},
    coolers: {x0: 4.9, x1: 5.6, z0: -5.0, z1: -1.25, h: 2.15, parts: [
      {kind: 'drink', z0: -5.0, z1: -3.3, doors: 2, label: '飲品冷藏'},
      {kind: 'fresh', z0: -3.3, z1: -2.2, doors: 1, label: '鮮食・三明治・飯糰'},
      {kind: 'frozen', z0: -2.2, z1: -1.25, doors: 1, label: '冷凍食品'}]},
    chestFreezer: {x0: 3.2, x1: 4.0, z0: -2.95, z1: -2.0, h: 0.85},
    counter: {x0: 3.4, x1: 4.15, z0: -0.9, z1: 3.3, h: 0.95, flap: {z0: 3.3, z1: 3.85},
      parts: [{kind: 'coffee_side', z0: -0.9, z1: 0.2}, {kind: 'register', z0: 0.2, z1: 1.3}, {kind: 'display', z0: 1.3, z1: 2.0}, {kind: 'hot_case', z0: 2.0, z1: 3.2}]},
    impulseRack: {x0: 3.1, x1: 3.4, z0: -0.85, z1: 0.05, h: 1.15, note: '櫃台靠冷藏櫃那一頭的小貨架（零食、口香糖），朝走道'},
    backCounter: {x0: 5.05, x1: 5.6, z0: -0.9, z1: 3.75, h: 0.95, note: '櫃台後面：咖啡機兩台、杯子、吸管架（不放菸）'},
    endPanel: {x0: 4.15, x1: 5.6, z0: -1.05, z1: -0.9, note: '員工區北邊的隔板（客人走不進櫃台後面）'},
    lockers: {x0: 5.05, x1: 5.6, z0: 4.05, z1: 5.45, h: 2.0, label: '包裹暫取區'},
    doormat: {x0: -0.45, x1: 1.25, z0: 4.2, z1: 5.4},
    umbrella: {x0: -0.55, x1: -0.05, z0: 5.15, z1: 5.45},
    spawn: {x: 0.4, z: 4.5, yaw: Math.PI},
    exit: {at: {x: 0.4, z: 5.0}, label: '離開日和便利店', to: 'gongguan', note: '外觀的門中心就是公館的店門互動點（LAWWW2 外觀 v1）；從溫州街進來的（CVS_FROM wenzhou）回溫州街'},
    clerk: {x: 4.6, z: 0.75, yaw: -Math.PI / 2, note: '店員站在收銀機後面，面向客人'},
    blocks: [],   // 下面算
    seats: [],
    interact: [
      {kind: 'checkout', x: 3.0, z: 0.75, yaw: Math.PI / 2, label: '結帳：飯糰／咖啡／飲料'},
      {kind: 'hotfood', x: 3.0, z: 2.6, yaw: Math.PI / 2, label: '看熱食櫃'},
      {kind: 'coffee', x: 2.75, z: -0.4, yaw: Math.PI / 2, label: '點日和咖啡'},
      {kind: 'parcel', x: 4.45, z: 4.75, yaw: Math.PI / 2, label: '包裹暫取'},
      {kind: 'microwave', x: -3.9, z: -0.7, yaw: Math.PI, label: '微波加熱'},
      {kind: 'cooler', x: 4.35, z: -3.6, yaw: Math.PI / 2, label: '看冷藏櫃'}
    ],
    spots: {},
    lights: {note: '天花板 LED 燈條（沿 z，高 3.25）：x −4.0、−2.32、−0.64、1.04、2.72、4.4；前段兩條橫的 z 4.4／2.0；窗邊綠色吊燈 x −5.15、z 3.6／2.0／0.4／−0.9，正面吧台上 x −3.45／−2.55、z 5.05（燈罩底 2.35）；冷藏櫃、熱食櫃自己發光'},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  }
};
(function () {
  const S = CVS_LAYOUT.shop, B = (o) => [+((o.x0 + o.x1) / 2).toFixed(3), +((o.z0 + o.z1) / 2).toFixed(3), +(o.x1 - o.x0).toFixed(3), +(o.z1 - o.z0).toFixed(3)];
  const g = S.gondolas.map(q => B({x0: q.x - q.w / 2, x1: q.x + q.w / 2, z0: q.z0 - 0.27, z1: q.endcap ? q.z1 : q.z1 + 0.27}))   // 兩頭的端面商品各 0.27 m
    .concat(S.gondolas.filter(q => q.endcap).map(q => B({x0: q.x - q.endcap.w / 2, x1: q.x + q.endcap.w / 2, z0: q.endcap.z0, z1: q.endcap.z1})));   // 端架比貨架寬（1.2 m）
  const st = S.staffRoom, fb = S.frontBar;
  S.blocks = [].concat(
    [B(S.bar), B(fb)],
    S.stools.map(z => [S.stoolX, z, 0.36, 0.36]),
    fb.stools.map(x => [x, fb.stoolZ, 0.36, 0.36]),
    S.tables.map(t => [t.x, t.z, t.w, t.d]),
    S.tables.map(t => [t.x, +(t.z - 0.55).toFixed(2), 0.42, 0.42]), S.tables.map(t => [t.x, +(t.z + 0.55).toFixed(2), 0.42, 0.42]),
    g,
    [B(S.backShelf), B({x0: st.x0, x1: st.x1 + 0.06, z0: st.z0, z1: st.z1 + 0.06}), B(S.microwave), B(S.bins), B(S.coolers), B(S.chestFreezer),
     B(S.counter), B(S.impulseRack), B({x0: S.counter.x0, x1: S.counter.x1, z0: S.counter.flap.z0, z1: S.counter.flap.z1}),
     B({x0: S.counter.x1, x1: S.w / 2, z0: S.endPanel.z0, z1: S.lockers.z0 - 0.2}),   // 員工區（櫃台後面）整塊擋：店員走在裡面
     B(S.lockers), B(S.umbrella)]);
  S.seats = [].concat(
    S.stools.map((z, i) => ({x: S.stoolX, z, yaw: -Math.PI / 2, kind: 'eat', bar: i + 1, label: '坐在窗邊吧台'})),
    fb.stools.map((x, i) => ({x, z: fb.stoolZ, yaw: 0, kind: 'eat', front: i + 1, label: '坐在窗邊吧台'})),
    ...S.tables.map(t => [
      {x: t.x, z: +(t.z - 0.55).toFixed(2), yaw: 0, kind: 'eat', table: t.n, label: '坐下吃東西'},
      {x: t.x, z: +(t.z + 0.55).toFixed(2), yaw: Math.PI, kind: 'eat', table: t.n, label: '坐下吃東西'}]));
  S.spots = {counter: S.interact[0], window_1: S.seats[2], window_2: S.seats[3], front_1: S.seats[7], table_1: S.seats[10]};
})();
if (typeof module !== 'undefined') module.exports = CVS_LAYOUT;
