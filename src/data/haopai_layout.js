/* ===== 好拍運動（羽球、桌球、網球用品店）的室內（新生南路那一側；CC〔帳號 A 的建模子代理〕2026-11-03 v1，給 BB 驗收、LAWWW2 整合） =====
   規格：AA_620 第 1、2 節、3-3、3-4（企劃線 claude/story-planning）；參考圖（使用者 11-03 生成）haopai_int（室內）、haopai_ext（外觀，對門的位置）。
   這份給遊戲（LAWWW2 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/bb_support/haopai_interior.py）共用：家具的位置、大小只寫在這裡。
   格式照 src/data/wz_shops_layout.js：房間中心在原點，x 往東、z 往南、y 往上；店門在 +z 那一面（z＝d/2）；單位公尺。
   yaw：人面向 (sin yaw, cos yaw)——0＝面向 +z（店門）、π＝面向 −z（店裡面）、π/2＝面向 +x、−π/2＝面向 −x。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（家具、櫃台；牆由 room() 自己擋）。
   seats：坐下的位置（h＝座面高度；label 是互動提示的草稿）。interact：互動點（kind 給 LAWWW 判斷；label 草稿）。
   exit、enterAt：留空（LAWWW2 填）。wallsFade：會淡出的牆（模型裡的 WALL_<side>_*；dir＝往室內的法線）。
   平面（從店門往裡看）：前段 z 8～−1.6 是店面——右牆（東）整面鐵網格掛球拍（一路到天花板）、右前是穿線機和工作推車、右牆中段桌球拍洞洞板；
   左牆（西）網格掛握把布、拍線、桌球，前面是玻璃展示櫃、往裡接木櫃台（老闆站在櫃台和左牆之間）；櫃台前一張高腳木凳。
   z −1.6 有一道下垂的樑掛「好拍運動」招牌（空白底板，字由遊戲畫）；後段是 1.6 m 寬的長走道，兩側貨架、紙箱（倉庫，走不進去），最裡面掛布簾、旁邊一台電風扇。 */
const HAOPAI_LAYOUT = {
  version: 1,
  haopai: {
    id: 'haopai', name: '好拍運動', glb: 'assets/models/env/second_ai/bb_support/haopai.glb',
    w: 9.0, d: 16.0, h: 3.6, wallColor: '#e9e2d2', floor: 'tile_beige',
    hours: '12:00～21:00，週日休（AA_620 第 1 節）',
    note: '小、擠：球拍掛到天花板、商品從地上堆到樑下；有效的走道只有前段中間約 4 m 寬、後段 1.6 m。前段 9 × 9.6 m、後段（倉庫走道）z −1.6～−8。',
    front: {door: {x: -0.6, w: 1.6}, windows: [[-4.2, -1.6], [0.4, 4.2]], sill: 0.45, head: 2.55, note: '外觀參考圖：雙開玻璃門在中間偏左、兩側落地玻璃（門外的球拍架由 LAWWW2 的外觀做）'},
    spawn: {x: -0.6, z: 7.2, yaw: Math.PI},
    exit: null,
    enterAt: null,
    soffit: {z: -1.6, y: 2.55, note: '下垂樑（底 2.55 m）；招牌 PLATE_FACE_HAOPAI 在樑的正面（朝 +z），x −1.6～1.6、y 2.66～3.38'},
    items: [
      {kind: 'glass_case', x: -2.75, z: 5.85, w: 0.7, d: 3.3, h: 1.0, note: '玻璃展示櫃：膠皮、桌球盒、拍線；櫃台那一側（−x）是拉門'},
      {kind: 'counter', x: -2.7, z: 2.35, w: 0.7, d: 3.5, h: 1.0, note: '木櫃台：螢幕（朝老闆）、筆筒、計算機、三疊羽球筒、桌球盒'},
      {kind: 'stool_high', x: -1.85, z: 2.0, h: 0.7, note: '高腳木凳（等穿線時坐；面向櫃台）'},
      {kind: 'wall_shelf_left', x: -4.2, z: 3.0, w: 0.35, d: 8.8, note: '左牆：網格（y 1.15～2.7）掛握把布、拍線；下面一層放籃子；上面一層木板放桌球盒、盆栽'},
      {kind: 'tv', x: -4.25, y: 2.7, z: 6.2, ry: 1.05, w: 1.1, h: 0.65, note: '左前角的電視（老闆看比賽）：畫面是抽象的綠色球場色塊'},
      {kind: 'hanging_plant', x: -4.2, y: 2.75, z: 4.9, note: '上層木板上的黃金葛，藤垂到網格前'},
      {kind: 'racket_wall', x: 4.38, z: 3.0, d: 8.8, note: '右牆整面鐵網格（z 7.4～−1.4、y 0.25～3.45），羽球拍三排、網球拍一排；穿線機、推車上方只掛高的兩排'},
      {kind: 'tt_board', x: 4.36, y: 1.65, z: -0.95, w: 1.1, h: 1.5, note: '桌球拍洞洞板（紅黑膠皮的成品拍 3 × 4 支）'},
      {kind: 'racket_bench', x: 4.15, z: 1.05, w: 0.45, d: 2.6, h: 0.5, note: '右牆下的矮櫃：球拍袋、羽球筒的紙箱'},
      {kind: 'stringer', x: 3.45, z: 5.0, ry: 0, note: '藍色穿線機（底座、立柱、轉盤、夾頭、拉線頭、線軸）；轉盤上夾著一支穿到一半的羽球拍'},
      {kind: 'cart', x: 3.95, z: 3.2, w: 0.5, d: 0.8, h: 0.9, note: '有抽屜的工作推車：剪刀、鉗子、噴瓶、毛巾'},
      {kind: 'wire_bin', x: 0.9, z: 4.2, w: 0.8, d: 0.55, h: 0.5, note: '鐵網特價桶：幾支球拍插在裡面'},
      {kind: 'stool_low', x: 1.7, z: 6.6, h: 0.32, note: '門口的小板凳（AA_620：「你坐在門口的小板凳上，看老闆把線一條一條拉緊」）'},
      {kind: 'aisle_shelves', x: 0, z: -4.6, note: '後段走道兩側的鐵架（x ±0.8～1.3、z −2.2～−7.0），背後是紙箱、再後面靠牆的鐵架'},
      {kind: 'curtain', x: -0.15, z: -7.85, w: 1.2, h: 2.1, note: '最裡面的布簾（通往後面的小房間；不開放）'},
      {kind: 'fan', x: 0.55, z: -7.45, note: '立扇'}
    ],
    blocks: [
      [-2.75, 5.85, 0.7, 3.3], [-2.7, 2.35, 0.7, 3.5], [-4.2, 3.0, 0.35, 8.8],
      [-1.85, 2.0, 0.36, 0.36], [1.7, 6.6, 0.32, 0.26],
      [3.45, 5.15, 0.9, 1.9], [3.95, 3.2, 0.6, 0.9], [4.15, 1.05, 0.5, 2.8], [0.9, 4.2, 0.8, 0.55],
      [-2.6, -4.85, 3.6, 6.3], [2.6, -4.85, 3.6, 6.3], [0.55, -7.45, 0.45, 0.45]
    ],
    walkNote: '前段：中間 x −2.0～2.9 從門口走到招牌樑下；櫃台後的老闆走道 x −3.9～−3.1（從櫃台後端 z 0.6～−1.5 進出）；穿線機和窗之間 z 5.5～7.6 可以走到小板凳。後段：走道 x −0.8～0.8、z −1.7～−7.6。',
    seats: [
      {x: 1.7, z: 6.6, yaw: 2.35, h: 0.32, kind: 'stool_low', label: '坐著等穿線', note: '面向穿線機；AA_620 2「等＝轉暗二十分鐘」'},
      {x: -1.85, z: 2.0, yaw: -Math.PI / 2, h: 0.7, kind: 'stool_high', label: '坐一下', note: '高腳凳，面向櫃台'}
    ],
    interact: [
      {x: 3.4, z: 1.05, yaw: Math.PI / 2, kind: 'browse', label: '看看', note: '球拍牆（AA_620 2「看看」）'},
      {x: -1.75, z: 2.9, yaw: -Math.PI / 2, kind: 'shop', label: '買東西', note: '櫃台'},
      {x: 2.35, z: 4.3, yaw: 0.9, kind: 'string', label: '穿線', note: '穿線機（買羽球拍以後老闆問「要穿線嗎？」）'}
    ],
    floorSit: [],
    npc: {
      owner: [
        {x: 2.6, z: 5.05, yaw: Math.PI / 2, act: 'string', note: '老闆（退休羽球教練）在穿線機前穿線，面向機器'},
        {x: -3.45, z: 2.4, yaw: Math.PI / 2, act: 'stand', note: '櫃台後面，面向客人'}
      ],
      visitor: [{x: -1.4, z: 2.6, yaw: -Math.PI / 2, act: 'stand', note: '柏翰（AA_620 3-4）來穿線、站在櫃台前'}]
    },
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  }
};
if (typeof module !== 'undefined') module.exports = HAOPAI_LAYOUT;
