/* ===== 大步球鞋的室內（新生南路新店；CC 建模子代理 2026-11-03 v2：照使用者的參考圖 dabu_int 重做；BB 分派、LAWWW2 整合） =====
   規格：SCENE_RULES 第 11、12 節（參考圖就是規格）、AA_620 第 1、2 節、3-1（企劃線 claude/story-planning）；
   參考圖：企劃線 docs/story_planning/ref_images/shops/dabu_int.webp（室內）、dabu_ext.webp（外觀：櫥窗在西、玻璃門在東）。
   這份給遊戲（LAWWW2 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/bb_support/dabu_interior.py）共用：家具的位置、大小只寫在這裡。
   座標：和 wz_shops_layout.js 一樣——房間中心在原點，x 往東、z 往南、y 往上；店門在 +z 那一面（z＝d/2）；單位公尺。
   yaw：人面向 (sin yaw, cos yaw)——0＝面向 +z（店門）、π＝面向 −z（店裡面）、π/2＝面向 +x、−π/2＝面向 −x。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（家具、櫃台、鞋牆、隔間；外牆由 room() 自己擋）。走道都 ≥ 1.2 m（SCENE_RULES 第 12 節），櫃台後面的店員通道 0.67 m。
   seats：坐下的位置（試穿長凳；label 是互動提示的文字草稿，正式文字由 AA／BB 寫）。interact：互動點（kind 給 LAWWW 判斷；label 草稿）。
   floorSit：坐地板的位置（這家店沒有）。exit、enterAt：留空，LAWWW2 填（新生南路外觀的世界座標）。
   wallsFade：會淡出的牆（模型裡的 WALL_<side>_*；dir＝往室內的法線）。鞋牆、海報、鏡子、襪子架、鞋盒牆都在那一面牆的組裡（牆淡出時一起藏）。
   refView：和參考圖同角度的鏡頭（Blender 渲染比對用；從參考圖的鞋牆隔板、層板線反推：眼高 1.38 m、水平視角 ≈ 90°（36 mm 片幅 18 mm））。 */
const DABU_LAYOUT = {
  version: 2,
  id: 'dabu_shoes', name: '大步球鞋', glb: 'assets/models/env/second_ai/bb_support/dabu.glb',
  w: 7.4, d: 12.0, h: 3.4, wallColor: '#e8dccb', floor: 'wood_mid',
  note: '7.4×12×3.4 m（面寬＝新生南路騎樓開間，xinsheng_layout 的 dabu）。參考圖那一角：左牆（西）淺木鞋牆五格（每格五層、每層三雙、層板下暖色燈條，上面一排運動海報），' +
        '中間淺色地毯上兩張原木長凳（灰布格子座墊）；正後方的隔間牆：落地鏡、襪子掛架（上面一層小木架放黃金葛）、鐵網毛巾桶、長鞋拔；' +
        '隔間牆右邊凹進去的櫃台區：側牆鞋盒層架、後牆鞋盒層架＋木頭招牌「大步球鞋」、白色檯身原木檯面的收銀台（燈條、螢幕、刷卡機、盆栽）、白色吊燈；' +
        '櫃台前面一座白檯面的鐵網架（噴霧、毛巾、盆栽）。參考圖鏡頭後面（前半間）：右牆鞋牆三格、新品展示桌、西側整面櫥窗、東側玻璃門、門口地墊。' +
        '天花板是平頂（暖白），三條縱向軌道燈＋一條櫃台區的橫向軌道燈、一台吸頂冷氣（沒有外露管線）。',
  front: {door: {x: 2.5, w: 1.8}, windows: [[-3.6, 1.2]], sill: 0.3, head: 2.75},
  spawn: {x: 2.5, z: 5.3, yaw: Math.PI},
  exit: null,      /* LAWWW2 填：{at:{x:2.5,z:5.6}, label:'離開大步球鞋', to:'<新生南路區域>', spawn:{...}} */
  enterAt: null,   /* LAWWW2 填：新生南路上「進店」的互動點（世界座標） */
  refView: {eye: [0.99, 1.38, 0.0], look: [-2.67, 1.31, -3.40], lens: 17.9, sensor: 36},
  shoeWalls: [
    /* 鞋牆：side＝靠哪一面牆；z0～z1＝範圍；每格 1.3 m、五層（層板 y＝0.60、1.01、1.42、1.83、2.24，頂板 2.65），一層三雙；
       rows＝每一格由下往上五層的鞋型（由後往前）；posters＝每一格上面那張海報（dabu_print 圖集的 poster0～5） */
    {side: 'left', z0: -4.1, z1: 2.4, depth: 0.42, bays: 5, posters: [2, 1, 0, 4, 5],
     rows: [['retro', 'casual', 'run', 'run', 'casual'], ['casual', 'run', 'run', 'bb_mid', 'run'], ['retro', 'casual', 'run', 'bb_mid', 'bb_high'],
            ['bb_mid', 'bb_mid', 'bb_high', 'bb_high', 'bb_high'], ['casual', 'retro', 'retro', 'casual', 'run']]},
    {side: 'right', z0: -3.4, z1: 0.5, depth: 0.42, bays: 3, posters: [3, 5, 4],
     rows: [['run', 'run', 'run', 'run', 'run'], ['casual', 'retro', 'casual', 'retro', 'casual'], ['bb_mid', 'run', 'bb_mid', 'run', 'bb_high']]}
  ],
  zones: [
    {kind: 'basketball', label: '籃球鞋', side: 'left', z0: -1.5, z1: 1.1, note: '左牆中間兩格（參考圖最靠近鏡頭那一格的上兩層是高筒籃球鞋，前一格整格籃球鞋）；阿哲帶玩家走到這裡（AA_620 3-1）'},
    {kind: 'running', label: '跑鞋', side: 'left', z0: -4.1, z1: -1.5}, {kind: 'casual', label: '休閒鞋', side: 'left', z0: 1.1, z1: 2.4},
    {kind: 'running', label: '跑鞋', side: 'right', z0: -3.4, z1: -2.1}, {kind: 'retro', label: '復古低筒', side: 'right', z0: -2.1, z1: -0.8}
  ],
  partition: {z: -4.1, x0: -3.7, x1: -0.98, t: 0.15, sideZ0: -6.0, note: '隔間牆（後面是倉庫，模型裡是封起來的）；x −0.98 那一端轉 90° 往後接到後牆，就是櫃台區的左側牆'},
  items: [
    {kind: 'bench', x: -1.85, z: -1.0, w: 1.25, d: 0.45, h: 0.47, ry: Math.PI / 2, note: '長凳 A（試穿）：原木腳、下層木條、灰布格子座墊；長邊和鞋牆平行'},
    {kind: 'bench', x: -1.85, z: -2.75, w: 1.25, d: 0.45, h: 0.47, ry: Math.PI / 2, note: '長凳 B'},
    {kind: 'rug', x: -1.85, z: -1.75, w: 2.1, d: 3.6, note: '淺灰米色的編織地毯（不擋路）'},
    {kind: 'mirror', x: -2.5, z: -4.0, w: 0.8, h: 2.0, note: '落地鏡（原木框，往後靠在隔間牆上）'},
    {kind: 'sock_rack', x: -1.55, z: -4.08, w: 0.62, note: '隔間牆上的襪子掛架（白色洞洞板、兩排掛勾、牛皮紙吊卡），上面一層小木架放黃金葛'},
    {kind: 'towel_bin', x: -1.78, z: -3.86, r: 0.19, note: '鐵網桶，裡面放捲好的毛巾'},
    {kind: 'shoehorn', x: -1.22, z: -3.95, note: '長鞋拔（木座）'},
    {kind: 'box_wall', side: 'side', z0: -6.0, z1: -4.25, depth: 0.34, note: '櫃台區左側牆（x −0.98，面向 +x）：鞋盒層架到頂'},
    {kind: 'box_wall', side: 'back', x0: -0.98, x1: 2.45, depth: 0.34, top: 1.72, note: '櫃台後面的鞋盒層架（四層），上面是木頭招牌'},
    {kind: 'box_wall', side: 'right', z0: -5.55, z1: -3.6, depth: 0.34, note: '右牆後段：鞋盒層架（店員拿尺寸）'},
    {kind: 'name_board', x: 0.09, y: 2.4, z: -5.95, w: 1.4, h: 1.0, note: '木頭招牌「大步球鞋」＋橘色步紋（字畫在 dabu_print 圖集上，不是 canvas）'},
    {kind: 'counter', x: 0.5, z: -4.71, w: 2.8, d: 0.58, h: 1.0, note: '收銀台：原木檯面、白色檯身、檯面下暖色燈條；螢幕、刷卡機、筆筒、盆栽、紙提袋'},
    {kind: 'pendant', x: 0.0, y: 2.45, z: -4.71, note: '白色圓頂吊燈'},
    {kind: 'staff_door', x: 2.95, z: -5.95, w: 0.85, note: '後牆右端的員工門（關著，「員工專用」）'},
    {kind: 'island_rack', x: 0.78, z: -3.05, w: 0.5, d: 0.9, h: 1.05, note: '白色檯面＋原木框的展示架，兩側掛鐵網籃（噴霧、除臭劑、毛巾），上面一盆小盆栽（參考圖右前）'},
    {kind: 'plant_floor', x: 0.8, z: -2.42, note: '展示架前的落地盆栽（參考圖右下角）'},
    {kind: 'display_table', x: -0.6, z: 2.9, w: 1.6, d: 0.8, h: 0.78, note: '新品展示桌：六雙鞋＋疊起來的鞋盒（外觀圖門裡看得到的那張桌子）'},
    {kind: 'window_display', x: -1.2, z: 5.62, w: 4.6, d: 0.45, note: '櫥窗內側：三層玻璃層架＋白色矮台（籃球、盆栽）；從街上看得到（外觀 dabu_ext）'},
    {kind: 'box_cart', x: 3.0, z: 2.0, note: '右前：鞋盒推車（店員補貨推出來的，停在右牆邊）'},
    {kind: 'wire_rack', x: 3.3, z: 3.7, w: 0.5, d: 0.9, h: 1.4, note: '門邊的鐵網架：鞋帶、鞋墊、噴霧'},
    {kind: 'plant_big', x: -3.3, z: 3.4}, {kind: 'plant_big', x: 3.32, z: 5.4}
  ],
  blocks: [[-3.49, -0.85, 0.42, 6.5], [-2.34, -4.18, 2.72, 0.16], [-1.06, -5.1, 0.16, 1.8], [-0.81, -5.12, 0.34, 1.75], [0.73, -5.83, 3.43, 0.34], [3.53, -4.58, 0.34, 1.95],
           [3.49, -1.45, 0.42, 3.9], [0.5, -4.71, 2.8, 0.58],
           [-1.85, -1.0, 0.5, 1.3], [-1.85, -2.75, 0.5, 1.3],
           [-2.5, -4.0, 0.85, 0.22], [-1.78, -3.86, 0.42, 0.42], [-1.22, -3.95, 0.26, 0.26],
           [0.78, -3.05, 0.56, 0.96], [0.8, -2.42, 0.44, 0.44], [-0.6, 2.9, 1.7, 0.9], [-1.2, 5.62, 4.7, 0.5],
           [3.0, 2.0, 0.55, 0.9], [3.3, 3.7, 0.56, 0.96], [-3.3, 3.4, 0.6, 0.6], [3.32, 5.4, 0.55, 0.55]],
  walkNote: '門口（x 1.6～3.4）直走進店：展示桌（x −1.45～0.25）和右牆鞋牆（x 3.28）中間 3.0 m；左牆鞋牆前（x −3.28～−2.08）1.2 m；' +
            '長凳和展示架中間 2.2 m；櫃台前（z −4.42）到展示架（z −2.57）1.85 m；店員從櫃台東端（x 1.9～3.36，1.46 m）進去，櫃台後 z −5.66～−5.0',
  seats: [
    {x: -1.85, z: -0.7, yaw: -Math.PI / 2, bench: 1, label: '坐下試穿'}, {x: -1.85, z: -1.3, yaw: -Math.PI / 2, bench: 1, label: '坐下試穿'},
    {x: -1.85, z: -2.45, yaw: -Math.PI / 2, bench: 2, label: '坐下試穿'}, {x: -1.85, z: -3.05, yaw: -Math.PI / 2, bench: 2, label: '坐下試穿'}
  ],
  seatH: 0.47,
  interact: [
    {x: -2.4, z: -0.7, kind: 'try_on', label: '試穿', note: '坐上長凳 A（seats[0]，面向鞋牆）；店員蹲在 clerkKneel 按鞋頭（AA_620 第 2 節）',
     clerkKneel: {x: -2.55, z: -0.4, yaw: Math.PI / 2}},
    {x: -2.75, z: -0.2, kind: 'look_basketball', label: '看看（籃球鞋）', note: '籃球鞋那兩格的正前方（阿哲的「這雙我高中穿過」）'},
    {x: -2.75, z: -3.4, kind: 'look', label: '看看'},
    {x: 2.75, z: -1.45, kind: 'look', label: '看看'},
    {x: 0.5, z: -4.15, kind: 'cashier', label: '買東西', note: '收銀台客人那一側；店員在 staff.counter'},
    {x: -2.5, z: -3.55, kind: 'mirror', label: '照鏡子', note: '可有可無'}
  ],
  floorSit: [],
  staff: {
    counter: {x: 0.5, z: -5.3, yaw: 0, note: '店員（大學生）站在收銀台後面，面向客人'},
    wall: {x: -2.8, z: 1.6, yaw: -Math.PI / 2, note: '店員在鞋牆旁邊整理（面向鞋牆）；輪流說話的位置'},
    zhe: {x: -2.8, z: 0.3, yaw: -Math.PI / 2, note: '阿哲站在籃球鞋那一格前面（3-1）'}
  },
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = DABU_LAYOUT;
