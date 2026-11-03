/* ===== 大步球鞋的室內（新生南路新店，CC 建模子代理 2026-11-03 v1；BB 分派、LAWWW2 整合） =====
   規格：AA_620 第 1、2 節、3-1（企劃線 claude/story-planning）；參考圖：使用者 11-03 生成的 dabu_int（室內）、dabu_ext（外觀：櫥窗在西、玻璃門在東）。
   這份給遊戲（LAWWW2 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/bb_support/dabu_interior.py）共用：家具的位置、大小只寫在這裡。
   座標：和 wz_shops_layout.js 一樣——房間中心在原點，x 往東、z 往南、y 往上；店門在 +z 那一面（z＝d/2）；單位公尺。
   yaw：人面向 (sin yaw, cos yaw)——0＝面向 +z（店門）、π＝面向 −z（店裡面）、π/2＝面向 +x、−π/2＝面向 −x。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（家具、櫃台、鞋牆；牆由 room() 自己擋）。走道都 ≥ 0.9 m（人半徑 0.33 m），櫃台後面的店員通道 0.8 m。
   seats：坐下的位置（軟凳＝試穿椅；label 是互動提示的文字草稿，正式文字由 AA／BB 寫）。interact：互動點（kind 給 LAWWW 判斷；label 草稿）。
   floorSit：坐地板的位置（這家店沒有）。exit、enterAt：留空，LAWWW2 填（新生南路外觀的世界座標）。
   wallsFade：會淡出的牆（模型裡的 WALL_<side>_*；dir＝往室內的法線）。鞋牆、層架、燈箱、櫥窗的展示架都在那一面牆的組裡（牆淡出時一起藏）。 */
const DABU_LAYOUT = {
  version: 1,
  id: 'dabu_shoes', name: '大步球鞋', glb: 'assets/models/env/second_ai/bb_support/dabu.glb',
  w: 9.0, d: 16.0, h: 3.6, wallColor: '#eee6da', floor: 'wood_mid_light',
  note: '9×16×3.6 m（SCENE_RULES 第 10 節暫定尺寸）。左牆（西）鞋牆（四格，每格六層、每層暖色燈條，上面一排抽象運動色塊燈箱；前段一面大燈箱）；' +
        '最後面兩格是籃球鞋（高筒、中筒），燈箱是橘色球場的線條，好認。中間淺色地毯上兩張原木腳灰布軟凳（試穿）。後牆：落地鏡、襪子掛架、鐵網毛巾桶、長鞋拔。' +
        '右後：鞋盒牆（白、灰）、原木＋白色收銀台（螢幕、刷卡機）、白色吊燈、店名木板（字由遊戲畫）。右前：鐵網架（噴霧、毛巾）。右牆中段兩格跑鞋／復古低筒（五層）。' +
        '前面：西側整面櫥窗（玻璃層架擺鞋），東側玻璃門。天花板外露風管、管線、三條軌道投射燈、兩台吸頂冷氣。',
  front: {door: {x: 2.8, w: 2.0}, windows: [[-4.2, 1.4]], sill: 0.45, head: 2.75},
  spawn: {x: 2.8, z: 7.1, yaw: Math.PI},
  exit: null,      /* LAWWW2 填：{at:{x:2.8,z:7.55}, label:'離開大步球鞋', to:'<新生南路區域>', spawn:{...}} */
  enterAt: null,   /* LAWWW2 填：新生南路上「進店」的互動點（世界座標） */
  shoeWalls: [
    /* 鞋牆：side＝靠哪一面牆；z0～z1＝範圍；每格 2.0 m、rows 層（由下往上 y＝0.6、0.91、1.22、1.53、1.84、2.15），一層 4 隻；cats＝每一格的分類（由後往前）。
       左牆前段 z 1.6～3.4 是一面大燈箱（抽象色塊）＋大盆栽，不放鞋（三角形預算：鞋子約 160 隻） */
    {side: 'left', x: -4.275, z0: -6.6, z1: 1.4, depth: 0.45, bays: 4, rows: 6, cats: ['basketball_high', 'basketball_mid', 'running', 'casual']},
    {side: 'right', x: 4.275, z0: -3.4, z1: 0.6, depth: 0.45, bays: 2, rows: 5, cats: ['running', 'retro']}
  ],
  zones: [
    {kind: 'basketball', label: '籃球鞋', side: 'left', z0: -6.6, z1: -2.6, note: '阿哲帶玩家走到這裡（AA_620 3-1）：左牆最後面兩格（靠落地鏡那一頭），上方兩個燈箱是橘色球場線條；高筒一格、中筒一格'},
    {kind: 'running', label: '跑鞋', side: 'left', z0: -2.6, z1: -0.6}, {kind: 'casual', label: '休閒鞋', side: 'left', z0: -0.6, z1: 1.4},
    {kind: 'running', label: '跑鞋', side: 'right', z0: -3.4, z1: -1.4}, {kind: 'retro', label: '復古低筒', side: 'right', z0: -1.4, z1: 0.6}
  ],
  items: [
    {kind: 'window_display', x: -1.4, z: 7.5, w: 5.4, d: 0.6, note: '櫥窗內側：三層玻璃層架＋白色矮台（一顆籃球、一盆植物）；從街上看得到（外觀 dabu_ext）'},
    {kind: 'bench', x: -1.9, z: -0.7, w: 1.25, d: 0.45, h: 0.47, ry: 0, note: '試穿椅 A：原木腳、下層木條、灰布軟墊（格子縫線）'},
    {kind: 'bench', x: -1.3, z: -2.5, w: 1.25, d: 0.45, h: 0.47, ry: 0, note: '試穿椅 B'},
    {kind: 'rug', x: -1.6, z: -1.6, w: 2.8, d: 3.4, note: '淺色編織地毯（不擋路）'},
    {kind: 'mirror', x: -2.55, z: -7.84, w: 0.75, h: 1.95, note: '落地鏡，靠後牆、木框'},
    {kind: 'sock_rack', x: -1.3, z: -7.92, w: 0.9, note: '後牆的襪子掛架（白色洞洞板、三排掛勾，上面一層小木架放植物）'},
    {kind: 'towel_bin', x: -1.3, z: -7.55, r: 0.2, note: '鐵網垃圾桶，裡面放捲好的毛巾'},
    {kind: 'shoehorn', x: -0.55, z: -7.75, note: '長鞋拔（木座）'},
    {kind: 'box_wall', side: 'back', x0: 0.4, x1: 4.5, depth: 0.4, note: '後牆右段：鞋盒層架（白、灰、牛皮色盒子）；上方原木板牆＋店名木板'},
    {kind: 'box_wall', side: 'right', z0: -7.6, z1: -4.4, depth: 0.4, note: '右牆後段：鞋盒牆（店員拿尺寸）'},
    {kind: 'name_board', x: 2.45, y: 2.88, z: -7.55, w: 2.2, h: 0.62, note: '店名木板：GLB 只有木板（PLATE_FACE_dabu_name），「大步球鞋」由遊戲畫；沒有勾勾線條'},
    {kind: 'counter', x: 2.2, z: -5.2, w: 2.2, d: 0.65, h: 1.0, note: '收銀台：原木檯面、白色檯身、檯面下暖色燈條；螢幕、刷卡機（客人那一面）、筆筒、小盆栽'},
    {kind: 'pendant', x: 2.2, y: 2.55, z: -5.2, note: '白色圓頂吊燈'},
    {kind: 'display_table', x: 0.3, z: 4.4, w: 1.8, d: 0.8, h: 0.78, note: '新品展示桌：六隻鞋＋疊起來的鞋盒（外觀圖門裡看得到的那張桌子）'},
    {kind: 'wire_rack', x: 4.2, z: 4.2, w: 0.5, d: 1.0, h: 1.5, note: '右前的鐵網架：三層鐵網籃（噴霧、除臭劑、毛巾）'},
    {kind: 'lightbox_big', side: 'left', z0: 1.6, z1: 3.4, y0: 0.7, y1: 2.6, note: '左牆前段的大燈箱（抽象的夕陽弧線，沒有人物）'},
    {kind: 'plant_big', x: -4.0, z: 5.0}, {kind: 'plant_big', x: -4.0, z: -7.35}, {kind: 'plant_big', x: 4.12, z: 7.1}
  ],
  blocks: [[-4.275, -2.6, 0.45, 8.0], [-4.33, 2.5, 0.34, 1.8], [4.275, -1.4, 0.45, 4.0], [-1.4, 7.5, 5.6, 0.7],
           [-1.9, -0.7, 1.3, 0.5], [-1.3, -2.5, 1.3, 0.5],
           [-2.55, -7.75, 0.85, 0.32], [-1.3, -7.7, 0.95, 0.6], [-0.55, -7.75, 0.3, 0.3], [-4.0, -7.35, 0.6, 0.6],
           [2.45, -7.8, 4.1, 0.4], [4.3, -6.0, 0.4, 3.2], [2.2, -5.2, 2.2, 0.7],
           [0.3, 4.4, 1.9, 0.9], [4.2, 4.2, 0.6, 1.1], [-4.0, 5.0, 0.6, 0.6], [4.12, 7.1, 0.55, 0.55]],
  walkNote: '從門口（x 1.8～3.8）直走進店：展示桌（x −0.65～1.25）和鐵網架（x 3.9～）中間 2.6 m；鞋牆前（x −4.05～−2.53）1.5 m；' +
            '收銀台後面店員從東端（x 3.3～4.1，0.8 m）或西端（x 0.4～1.1）進去；櫃台後 z −7.6～−5.53 站得下兩個人',
  seats: [
    {x: -2.25, z: -0.7, yaw: 0, bench: 1, label: '坐下試穿'}, {x: -1.55, z: -0.7, yaw: 0, bench: 1, label: '坐下試穿'},
    {x: -1.65, z: -2.5, yaw: 0, bench: 2, label: '坐下試穿'}, {x: -0.95, z: -2.5, yaw: 0, bench: 2, label: '坐下試穿'}
  ],
  seatH: 0.47,
  interact: [
    {x: -1.9, z: -0.05, kind: 'try_on', label: '試穿', note: '坐上試穿椅 A（seats[0]）；店員蹲在 clerkKneel 按鞋頭（AA_620 第 2 節）',
     clerkKneel: {x: -2.25, z: -0.12, yaw: Math.PI}},
    {x: -3.55, z: -4.6, kind: 'look_basketball', label: '看看（籃球鞋）', note: '籃球鞋那兩格的正前方（阿哲的「這雙我高中穿過」）'},
    {x: -3.55, z: 0.4, kind: 'look', label: '看看'},
    {x: 3.55, z: -1.4, kind: 'look', label: '看看'},
    {x: 2.2, z: -4.4, kind: 'cashier', label: '買東西', note: '收銀台客人那一側；店員在 staff.counter'},
    {x: -2.55, z: -7.05, kind: 'mirror', label: '照鏡子', note: '可有可無'}
  ],
  floorSit: [],
  staff: {
    counter: {x: 2.2, z: -6.0, yaw: 0, note: '店員（大學生）站在收銀台後面，面向客人'},
    wall: {x: -3.4, z: 0.9, yaw: -Math.PI / 2, note: '店員在鞋牆旁邊整理（面向鞋牆）；輪流說話的位置'},
    zhe: {x: -3.45, z: -4.2, yaw: -Math.PI / 2, note: '阿哲站在籃球鞋那一格前面（3-1）'}
  },
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = DABU_LAYOUT;
