/* ===== 同弦樂器（吉他店）的室內（CC 帳號 A 建模子代理 2026-11-03 v1；企劃 AA_619 第 1 節、2-3 節；參考圖 使用者 11-03 tongxian_int.jpg） =====
   新生南路那一排的二樓店面（一樓是手機行），樓梯從騎樓旁邊上來，店門在樓梯頂（建築的後側）；店裡的後牆是一整面大窗，看出去就是新生南路
   （外觀參考圖 tongxian_ext.webp：二樓臨街那一排窗裡看得到掛著的吉他——室內的後牆＝臨街的立面，LAWWW2 做外觀時照這個方向接）。
   這份給遊戲（LAWWW2 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/bb_support/tongxian_interior.py）共用：家具的位置、大小只寫在這裡。
   座標：和 wz_shops_layout.js 一樣——房間中心在原點，x 往東、z 往南、y 往上；店門在 +z 那一面（z＝d/2）；單位公尺。
   yaw：人面向 (sin yaw, cos yaw)——0＝面向 +z（店門）、π＝面向 −z（後窗）、π/2＝面向 +x（吉他牆）、−π/2＝面向 −x。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（家具、櫃台；牆由 room() 自己擋）。
   seats：坐下的位置（試琴椅；seatH＝座面高度，比一般椅子高）。interact：互動點（kind 給 LAWWW 判斷；label 是草稿，正式文字照 AA_619）。
   npc：站位（老闆站在櫃台後面）。exit、enterAt：留空，LAWWW2 填。
   wallsFade：會淡出的牆（模型裡的 WALL_<side>_*；dir＝往室內的法線）。
   字：店名木牌、「弦一個月換一次」、「不賣，老闆的」標籤在模型裡是空白的板面（PLATE_FACE_*，自訂屬性 text、bg、color），字由遊戲畫（D77：模型裡不放中文字、不放品牌）。 */
const TONGXIAN_LAYOUT = {
  version: 1,
  shop: {
    id: 'tongxian', name: '同弦樂器', glb: 'assets/models/env/second_ai/bb_support/tongxian.glb',
    w: 7.0, d: 14.0, h: 3.4, wallColor: '#efe7d8', floor: 'wood_light',
    note: '7×14×3.4 m 的二樓店面。右牆（+x）整面橫條溝槽板掛滿吉他（上排電吉他、下排木吉他）；前段一座 L 形玻璃櫃台，老闆站在櫃台後面；後窗前面是試琴角（兩張試琴椅、小音箱、譜架、波斯風地毯；CG「同弦的試琴椅」的場景）；左牆是書架、軟木板、盆栽。',
    hours: {open: 12.0, close: 21.5, closedWeekday: 1, note: 'AA_619：12:00～21:30，週一休；颱風天關（LAWWW 接）'},
    front: {door: {x: -2.75, w: 0.95, h: 2.1, glass: 'frosted', swing: 'in_left', note: '壓花玻璃木門；門鉸在 x −3.22，開門時門片往內貼著左牆（開著的樣子是模型的預設）'}},
    back: {window: {x0: -3.15, x1: 0.35, sill: 0.85, head: 2.55, note: '鋁框大窗（兩扇橫拉），窗外是新生南路（貼圖是程式畫的，LAWWW2 可換成遊戲裡拍的新生南路）'}},
    spawn: {x: -2.75, z: 6.2, yaw: Math.PI},
    exit: null,
    enterAt: null,
    items: [
      {kind: 'guitar_wall', x: 3.5, z0: -6.95, z1: 6.95, y0: 0.08, y1: 3.25, note: '橫條溝槽板；上排電吉他 24 把（琴頭掛勾 y 3.02）、下排木吉他 23 把（掛勾 y 1.98），z −6.25～4.6'},
      {kind: 'counter_long', x: 1.0, z: 3.3, w: 0.6, d: 3.2, h: 1.0, note: 'L 形玻璃櫃台的長邊：木頭下櫃（0～0.42）＋玻璃展示櫃（兩層玻璃層板）；裡面是弦的紙盒、Pick 盒、移調夾、調音器、背帶'},
      {kind: 'counter_short', x: 1.725, z: 5.2, w: 2.05, d: 0.6, h: 1.0, note: 'L 形的短邊（靠店門那一端轉向吉他牆）'},
      {kind: 'owner_guitar', x: 2.35, y: 1.6, z: -6.86, note: '最貴的那一把「不賣，老闆的」：後牆的木頭展示板＋專用的投射燈，從店門一進來沿著走道就看得到'},
      {kind: 'trial_stool', x: -2.35, z: -5.05}, {kind: 'trial_stool', x: -0.75, z: -5.05},
      {kind: 'amp', x: -1.55, z: -6.62, w: 0.48, d: 0.26, h: 0.44},
      {kind: 'music_stand', x: -0.35, z: -5.95},
      {kind: 'rug', x: -1.55, z: -5.25, w: 2.7, d: 1.7},
      {kind: 'guitar_on_stand', x: -3.05, z: -6.05, note: '試琴椅旁邊的 A 字琴架，上面一把木吉他'},
      {kind: 'plant_stand', x: 0.3, z: -6.62},
      {kind: 'bookshelf', x: -3.34, z: 4.3, w: 0.32, d: 2.8, h: 1.25},
      {kind: 'side_cabinet', x: -3.3, z: -3.8, w: 0.4, d: 1.0, h: 0.85},
      {kind: 'cork_board', x: -3.48, y: 1.6, z: -0.9, w: 1.3, h: 0.85},
      {kind: 'gig_bag', x: -3.3, z: 0.75},
      {kind: 'pendant', x: -1.55, y: 2.4, z: -5.1}, {kind: 'track', x: 2.35, z0: -6.4, z1: 5.4}, {kind: 'track', x: -0.9, z0: -2.6, z1: 4.2},
      {kind: 'aircon', x: -1.4, y: 2.83, z: -6.86}
    ],
    blocks: [[3.325, 0.0, 0.35, 14.0], [1.0, 3.3, 0.6, 3.2], [1.725, 5.2, 2.05, 0.6],
             [-3.34, 4.3, 0.32, 2.8], [-3.3, -3.8, 0.4, 1.0], [-1.55, -6.62, 0.5, 0.3], [-0.35, -5.95, 0.5, 0.4], [0.3, -6.62, 0.36, 0.36],
             [-3.05, -6.05, 0.45, 0.5], [-3.15, 6.5, 0.12, 0.95], [-3.27, 0.75, 0.46, 0.5]],
    walkNote: '店門進來的走道 x −3.18～0.7（約 3.9 m 寬）；櫃台後面（老闆的位置）從長邊的北端進去：x 1.3～3.15、z 1.0～1.7；吉他牆前面 x 0.7～3.15、z −6.3～1.7 都可以走',
    seats: [
      {x: -2.35, z: -5.05, yaw: 0, seatH: 0.6, label: '試彈', note: '試琴椅（木面鐵腳圓凳，座面 0.6 m）；CG「同弦的試琴椅」：祐廷坐這張，子晴站在 (−1.6, −4.4) 看'},
      {x: -0.75, z: -5.05, yaw: 0, seatH: 0.6, label: '試彈'}
    ],
    interact: [
      {x: 2.5, z: -2.3, yaw: Math.PI / 2, kind: 'look_guitars', label: '看看（吉他牆）'},
      {x: 2.5, z: 0.6, yaw: Math.PI / 2, kind: 'look_guitars', label: '看看（吉他牆）'},
      {x: 2.35, z: -6.05, yaw: Math.PI, kind: 'owner_guitar', label: '看看（老闆的那把）'},
      {x: -1.55, z: -4.3, yaw: Math.PI, kind: 'try', label: '試彈（試琴椅）'},
      {x: 0.2, z: 3.3, yaw: Math.PI / 2, kind: 'buy', label: '買東西（櫃台）'}
    ],
    npc: {owner: {x: 2.05, z: 3.3, yaw: -Math.PI / 2, note: '老闆站在櫃台長邊的後面，面向走道（櫃台上有他的帳本和一杯茶）'},
          ziqing_cg: {x: -1.6, z: -4.4, yaw: Math.PI, note: '2-3 的 CG：子晴站在試琴椅旁邊'}},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  }
};
if (typeof module !== 'undefined') module.exports = TONGXIAN_LAYOUT;
