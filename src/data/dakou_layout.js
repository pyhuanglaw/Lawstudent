/* ===== 大口漢堡（新生南路、側門對面路口的 24 小時速食店，AA_621）室內配置：BB（帳號 A）2026-11-03 協助 LAWWW2 =====
   參考圖：docs/story_planning/ref_images/shops/dakou_2f.webp（二樓學生自習區）、dakou_ext.webp（外觀；一樓看得到點餐櫃檯）。
   格式照 wz_shops_layout.js（SCENE_RULES 第 10 節）：Blender（tools/blender/env_second/bb_support/dakou_interior.py）和遊戲共用這一份。
   座標：房間中心在原點，x 往東、z 往南、y 往上；店門在 +z（新生南路）；單位公尺。yaw：人面向 (sin yaw, cos yaw)。
   轉角店：+z（新生南路）和 −x（路口那一側）兩面是玻璃（外觀圖），+x 貼隔壁大樓、−z 是後面（一樓廚房）。
   兩層：levels[0] y 0、levels[1] y 3.6；每層一個 GLB（每層各自 6 萬三角形、12 材質、6 MB 的預算），模型都用絕對高度（二樓的 GLB 地板就在 y 3.6）。
     一樓 GLB 有樓梯本體、一樓天花板（單面朝下、樓梯那一塊開洞）；二樓 GLB 有二樓地板（樓梯那一塊開洞）、樓梯口的玻璃欄杆。玩家在一樓時遊戲把二樓 GLB 藏起來（LAWWW2 接）。
   樓梯：靠東牆的直跑樓梯，從一樓 z 4.0（樓梯底）往 −z 爬到二樓 z −1.6（樓梯頂）：21 階、每階 0.1714 m、踏面 0.28 m、寬 1.3 m（D38 第 4 點：真的走得上去）。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（每層各一份；牆由 room() 自己擋；樓梯格子由 stairs 定，不寫進 blocks）。exit、enterAt 留空（LAWWW2 接新生南路時填）。
   lights：燈的位置 {x,z,y,kind}（絕對高度；LAWWW2 烘光影用）。 */
const DAKOU_LAYOUT = {
  version: 1,
  shop: {
    id: 'dakou', name: '大口漢堡', w: 12.0, d: 16.0, h: 3.6, open24h: true,
    note: 'AA_621：24 小時速食店，考試那兩週是大家念書的地方。一樓點餐、取餐、高腳桌；二樓學生自習區（長桌、雙人桌、靠牆插座吧台）。',
    levels: [
      {y: 0.0, h: 3.6, glb: 'assets/models/env/second_ai/bb_support/dakou_1f.glb', name: '1F'},
      {y: 3.6, h: 3.6, glb: 'assets/models/env/second_ai/bb_support/dakou_2f.glb', name: '2F 學生自習區'}
    ],
    stairs: {x: 5.25, z: 1.2, w: 1.3, len: 5.6, axis: 'z', ya: 3.6, yb: 0.0, za: -1.6, zb: 4.0, n: 21, rise: 0.1714, tread: 0.28,
             note: 'x 4.6～5.9；z 4.0 是樓梯底（y 0）、z −1.6 是樓梯頂（y 3.6，接二樓的樓梯口平台 z −1.6～−2.8）；ya 是 −z 那一端（za）的高度、yb 是 +z 那一端（zb）'},
    stairHole: {x0: 4.55, x1: 6.0, z0: -1.6, z1: 4.0},
    floor1: {
      floor: 'tile_light', ceilingY: 3.4,
      front: {door: {x: -1.5, w: 1.8}, glass: true, sill: 0.1, head: 3.2},
      westGlass: {z0: -4.4, z1: 8.0},
      counter: {x0: -4.8, x1: 3.0, z0: -4.4, z1: -3.6, h: 1.05, order: {x0: -4.8, x1: 1.4}, pickup: {x0: 1.6, x1: 3.0}},
      kitchen: {x0: -6.0, x1: 3.4, z0: -8.0, z1: -4.4},
      staff: {x0: 3.4, x1: 4.55, z0: -8.0, z1: -3.6, note: '員工通道（往後面的倉庫、廁所；這一版關著）；後面 x 4.55～6、z −8～−1.6 整塊關著'},
      menuScreens: {z: -4.5, y0: 2.3, y1: 2.95, xs: [-3.6, -2.4, -1.2, 0.0]},
      kiosks: [{x: 1.4, z: 1.6}, {x: 2.6, z: 1.6}],
      westBar: {x0: -6.0, x1: -5.55, z0: -2.6, z1: 6.6, h: 1.05},
      westStools: [-2.0, -0.8, 0.4, 1.6, 2.8, 4.0, 5.2],
      frontBar: {x0: 0.3, x1: 4.3, z0: 7.55, z1: 8.0, h: 1.05},
      frontStools: [0.8, 1.8, 2.8, 3.8],
      tables2: [{x: -3.3, z: -0.6}, {x: -3.3, z: 1.9}, {x: -3.3, z: 4.4}],
      highTables: [{x: 0.6, z: 4.8}, {x: 2.6, z: 4.8}],
      tray: {x: 3.95, z: -3.15},
      underStair: {x0: 4.55, x1: 6.0, z0: -1.6, z1: 0.9, note: '樓梯下面高度不到 2 m 的那一段是儲藏室（關著）'},
      spawn: {x: -1.5, z: 7.0, yaw: Math.PI},
      blocks: [[-1.4, -6.2, 9.2, 3.6], [-0.9, -4.0, 7.8, 0.8], [4.7, -5.8, 2.6, 4.4], [5.28, -2.6, 1.45, 2.0], [-5.78, 2.0, 0.45, 9.2], [2.3, 7.78, 4.0, 0.45],
               [1.4, 1.6, 0.5, 0.45], [2.6, 1.6, 0.5, 0.45], [-3.3, -0.6, 0.7, 0.7], [-3.3, 1.9, 0.7, 0.7], [-3.3, 4.4, 0.7, 0.7],
               [0.6, 4.8, 0.6, 0.6], [2.6, 4.8, 0.6, 0.6], [3.95, -3.15, 0.9, 0.5], [5.28, -0.35, 1.45, 2.5]],
      walkNote: '店門（x −2.4～−0.6）進來，正前方是點餐櫃檯（z −3.6）、排隊在 x −4～1、z −3.5～−2.2；點餐機在右手邊 z 1.6；取餐在櫃檯右端；樓梯在右後方，從 z 4.0 往後爬；左邊沿窗一排高腳吧台、三張雙人桌；正面窗邊一排高腳吧台；走道都 ≥ 0.9 m',
      seats: [
        {x: -5.2, z: -2.0, yaw: -Math.PI / 2, label: '坐下', high: true}, {x: -5.2, z: -0.8, yaw: -Math.PI / 2, label: '坐下', high: true}, {x: -5.2, z: 0.4, yaw: -Math.PI / 2, label: '坐下', high: true},
        {x: -5.2, z: 1.6, yaw: -Math.PI / 2, label: '坐下', high: true}, {x: -5.2, z: 2.8, yaw: -Math.PI / 2, label: '坐下', high: true}, {x: -5.2, z: 4.0, yaw: -Math.PI / 2, label: '坐下', high: true},
        {x: -5.2, z: 5.2, yaw: -Math.PI / 2, label: '坐下', high: true},
        {x: 0.8, z: 7.2, yaw: 0, label: '坐下', high: true}, {x: 1.8, z: 7.2, yaw: 0, label: '坐下', high: true}, {x: 2.8, z: 7.2, yaw: 0, label: '坐下', high: true}, {x: 3.8, z: 7.2, yaw: 0, label: '坐下', high: true},
        {x: -3.3, z: -1.15, yaw: 0, label: '坐下'}, {x: -3.3, z: -0.05, yaw: Math.PI, label: '坐下'}, {x: -3.3, z: 1.35, yaw: 0, label: '坐下'}, {x: -3.3, z: 2.45, yaw: Math.PI, label: '坐下'},
        {x: -3.3, z: 3.85, yaw: 0, label: '坐下'}, {x: -3.3, z: 4.95, yaw: Math.PI, label: '坐下'}
      ],
      interact: [
        {kind: 'order', x: -1.5, z: -3.0, yaw: Math.PI, label: '點餐', note: '菜單（AA_621 第 1 節）：雙層牛肉堡套餐 159、勁辣雞腿堡套餐 149、雞塊 6 塊 69、薯條（大）59、可樂 35、熱咖啡 45、蘋果派 35、早餐 05:00～10:30 豬肉滿福堡 59'},
        {kind: 'kiosk', x: 2.0, z: 2.25, yaw: Math.PI, label: '自助點餐'},
        {kind: 'pickup', x: 2.3, z: -3.0, yaw: Math.PI, label: '取餐'},
        {kind: 'clerk', x: -1.5, z: -4.9, yaw: 0, note: '店員站在櫃檯後面'},
        {kind: 'tray', x: 3.95, z: -2.6, yaw: Math.PI, label: '回收餐盤'},
        {kind: 'stairs_up', x: 5.25, z: 4.6, yaw: Math.PI, label: '上二樓'}
      ],
      lights: [{x: -3.6, z: -2.4, y: 3.38, kind: 'panel'}, {x: -0.6, z: -2.4, y: 3.38, kind: 'panel'}, {x: 2.4, z: -2.4, y: 3.38, kind: 'panel'},
               {x: -3.6, z: 1.2, y: 3.38, kind: 'panel'}, {x: -0.6, z: 1.2, y: 3.38, kind: 'panel'}, {x: 2.4, z: 1.2, y: 3.38, kind: 'panel'},
               {x: -3.6, z: 4.8, y: 3.38, kind: 'panel'}, {x: -0.6, z: 4.8, y: 3.38, kind: 'panel'}, {x: 2.4, z: 4.8, y: 3.38, kind: 'panel'},
               {x: -2.6, z: -3.9, y: 2.6, kind: 'pendant_counter'}, {x: 0.2, z: -3.9, y: 2.6, kind: 'pendant_counter'}, {x: 2.3, z: -3.9, y: 2.6, kind: 'pendant_counter'},
               {x: -1.4, z: -6.2, y: 3.38, kind: 'kitchen'}, {x: 5.25, z: 3.0, y: 3.38, kind: 'stair_downlight'}],
      wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
    },
    floor2: {
      floor: 'tile_light', ceilingY: 7.2,
      front: {glass: true, sill: 3.7, head: 6.95},
      westGlass: {z0: -8.0, z1: 8.0},
      eastBar: {x0: 5.5, x1: 6.0, z0: -7.5, z1: -2.8, h: 4.35, outlets: true},
      backBar: {x0: -4.2, x1: 5.5, z0: -8.0, z1: -7.5, h: 4.35, outlets: true},
      eastStools: [-3.3, -4.2, -5.1, -6.0, -6.9],
      backStools: [-3.7, -2.75, -1.8, -0.85, 0.1, 1.05, 2.0, 2.95, 3.9],
      bookcase: {x0: -5.9, x1: -4.4, z0: -8.0, z1: -7.62, h: 2.2},
      longTables: [{x: -1.0, z: -4.6}, {x: -1.0, z: -1.0}, {x: -1.0, z: 2.6}], longW: 3.0, longD: 1.0,
      tables4: [{x: 2.7, z: -4.6}, {x: 2.7, z: -1.0}, {x: 2.7, z: 2.6}],
      westTables2: [-5.4, -3.0, -0.6, 1.8, 4.2],
      frontTables2: [-3.6, -1.6, 0.4, 2.4],
      plants: [[-5.6, 7.5], [5.5, 7.4], [-5.15, -7.6], [4.2, 5.2]],
      pendants: [[-1.8, -4.6], [-0.2, -4.6], [-1.8, -1.0], [-0.2, -1.0], [-1.8, 2.6], [-0.2, 2.6], [2.7, -4.6], [2.7, -1.0], [2.7, 2.6]],
      signStudy: {x: 5.98, z0: 0.2, z1: 2.6, y0: 4.4, y1: 6.7, note: '「2F 學生自習區／長時間學習／全區插座／免費 Wi-Fi」——上樓梯時右手邊東牆（參考圖左邊的直幅）'},
      mural: {x: 5.98, z0: -7.3, z1: -2.9, y0: 5.2, y1: 6.7, note: '東牆靠牆吧台上方的「大口漢堡 24h」藍色大牆面（參考圖右邊）'},
      spawn: {x: 5.25, z: -2.3, yaw: Math.PI, note: '從樓梯上來站的地方（樓梯頂 z −1.6 往 −z 一步）'},
      blocks: [[5.75, -5.15, 0.5, 4.7], [0.65, -7.75, 9.7, 0.5], [-5.15, -7.81, 1.5, 0.38],
               [-1.0, -4.6, 3.0, 1.0], [-1.0, -1.0, 3.0, 1.0], [-1.0, 2.6, 3.0, 1.0],
               [2.7, -4.6, 1.2, 0.8], [2.7, -1.0, 1.2, 0.8], [2.7, 2.6, 1.2, 0.8],
               [-5.1, -5.4, 0.7, 0.7], [-5.1, -3.0, 0.7, 0.7], [-5.1, -0.6, 0.7, 0.7], [-5.1, 1.8, 0.7, 0.7], [-5.1, 4.2, 0.7, 0.7],
               [-3.6, 7.1, 0.7, 0.7], [-1.6, 7.1, 0.7, 0.7], [0.4, 7.1, 0.7, 0.7], [2.4, 7.1, 0.7, 0.7],
               [-5.6, 7.5, 0.6, 0.6], [5.5, 7.4, 0.6, 0.6], [4.2, 5.2, 0.5, 0.5],
               [4.52, 1.2, 0.08, 5.6], [5.28, 4.02, 1.45, 0.08]],
      walkNote: '樓梯上來在東邊 z −1.6，往 −z 走是靠牆插座吧台（東牆 z −2.8～−7.5、後牆 x −4.2～5.5）；中間三張長桌（6 人）、右邊三張四人桌；左邊沿窗五張雙人桌、正面沿窗四張雙人桌；樓梯口 x 4.55 那一邊和 z 4.0 那一邊是玻璃欄杆',
      seats: [],
      seatsNote: '座位由 Blender 腳本照上面的桌子算（每張長桌 6、四人桌 4、雙人桌 2、吧台每張高腳椅 1）；遊戲用 DAKOU_SEATS2() 取得一樣的清單',
      interact: [
        {kind: 'study', x: -1.0, z: -1.0, label: '坐下讀書', note: 'AA_621：照兩點半的 studySession，可以待到天亮；所有 seats 都可以讀書'},
        {kind: 'outlet', x: 5.0, z: -5.1, label: '插座（手機、筆電充電）'},
        {kind: 'stairs_down', x: 5.25, z: -2.3, yaw: 0, label: '下一樓'},
        {kind: 'books', x: -5.15, z: -7.2, yaw: Math.PI, label: '看書架'}
      ],
      lights: [{x: -1.8, z: -4.6, y: 6.45, kind: 'pendant'}, {x: -0.2, z: -4.6, y: 6.45, kind: 'pendant'}, {x: -1.8, z: -1.0, y: 6.45, kind: 'pendant'}, {x: -0.2, z: -1.0, y: 6.45, kind: 'pendant'},
               {x: -1.8, z: 2.6, y: 6.45, kind: 'pendant'}, {x: -0.2, z: 2.6, y: 6.45, kind: 'pendant'}, {x: 2.7, z: -4.6, y: 6.45, kind: 'pendant'}, {x: 2.7, z: -1.0, y: 6.45, kind: 'pendant'}, {x: 2.7, z: 2.6, y: 6.45, kind: 'pendant'},
               {x: -4.2, z: -6.0, y: 7.18, kind: 'panel'}, {x: -4.2, z: 0.0, y: 7.18, kind: 'panel'}, {x: -4.2, z: 6.0, y: 7.18, kind: 'panel'},
               {x: 1.0, z: -6.0, y: 7.18, kind: 'panel'}, {x: 1.0, z: 0.0, y: 7.18, kind: 'panel'}, {x: 1.0, z: 6.0, y: 7.18, kind: 'panel'},
               {x: 5.7, z: -5.1, y: 4.9, kind: 'bar_strip'}, {x: 0.6, z: -7.7, y: 4.9, kind: 'bar_strip'}],
      wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
    },
    exit: null, enterAt: null
  }
};
/* 二樓的座位（Blender 腳本和遊戲共用一樣的算法；y 是二樓地板 3.6） */
function DAKOU_SEATS2() {
  const f = DAKOU_LAYOUT.shop.floor2, out = [];
  for (const t of f.longTables) for (const dx of [-1.0, 0.0, 1.0]) { out.push({x: t.x + dx, z: t.z - 0.75, yaw: 0, label: '坐下讀書'}); out.push({x: t.x + dx, z: t.z + 0.75, yaw: Math.PI, label: '坐下讀書'}); }
  for (const t of f.tables4) for (const dx of [-0.3, 0.3]) { out.push({x: t.x + dx, z: t.z - 0.6, yaw: 0, label: '坐下讀書'}); out.push({x: t.x + dx, z: t.z + 0.6, yaw: Math.PI, label: '坐下讀書'}); }
  for (const z of f.westTables2) { out.push({x: -5.1, z: z - 0.55, yaw: 0, label: '坐下讀書'}); out.push({x: -5.1, z: z + 0.55, yaw: Math.PI, label: '坐下讀書'}); }
  for (const x of f.frontTables2) { out.push({x: x - 0.55, z: 7.1, yaw: Math.PI / 2, label: '坐下讀書'}); out.push({x: x + 0.55, z: 7.1, yaw: -Math.PI / 2, label: '坐下讀書'}); }
  for (const z of f.eastStools) out.push({x: 5.05, z, yaw: Math.PI / 2, label: '坐下讀書（有插座）'});
  for (const x of f.backStools) out.push({x, z: -7.05, yaw: Math.PI, label: '坐下讀書（有插座）'});
  return out.map(s => Object.assign(s, {y: 3.6}));
}
DAKOU_LAYOUT.shop.floor2.seats = DAKOU_SEATS2();
if (typeof module !== 'undefined') module.exports = DAKOU_LAYOUT;
