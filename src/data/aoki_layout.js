/* ===== 青木茶室 室內（公館店面街 G01，取代清葉茶行；AA 2026-11-04 v1，使用者 11-04 01:0x 新店名、新外觀、新室內圖；AA_647） =====
   參考圖：docs/story_planning/ref_images/shops/gongguan_tea_int.webp（室內）、gongguan_tea_ext.webp（外觀，LAWWW2 做）。美術規則：SCENE_RULES §10～12。
   遊戲區域：新的 `aoki`（清葉茶行原本只有門口「買一杯飲料」，沒有室內）；店門口外帶窗口照舊買飲料（品項照 AA_647 §6）。
   座標：房間中心在原點，x 往東、z 往南、y 往上；店面（臨羅斯福路）在 +z（z＝d/2）；公尺。格式照 src/data/wz_shops_layout.js 開頭的說明。
   參考圖的鏡頭站在東端往西看：左手邊（南、+z）臨街的大窗＋窗邊長桌、玻璃茶具櫃，右手邊（北、−z）長吧台＋高腳椅、後牆綠磁磚和茶罐層板，正前方（西）卡座、書櫃、後面那張桌子。
   v1 第一次試做 8×10（深度方向長），參考鏡頭只看得到 8 m、窗和吧台擠在畫面兩邊；改成臨街 11 m、深 7 m（和參考圖的長條空間一致）。
   v2b（LAWWW2 11-04 01:51 收 v2 以後的五點細節）：茶牆四層擺滿＋燈條、吧台淺色石材＋東端圓角、玻璃球吊燈＋一盞紙燈籠、店名改寫在牆上的大字、展示櫃放茶葉禮盒。
   v2：照 LAWWW2 外觀（8de87af16）店寬 9.2 m、門 x 1.85 寬 1.1 高 2.65、大窗 x −1.93～1.27、外帶窗口 x 2.94～4.24。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const AOKI_LAYOUT = {
  version: 3,
  id: 'aoki', zone: 'aoki', name: '青木茶室', glb: 'assets/models/env/second_ai/aa_support/aoki.glb',
  w: 9.2, d: 7.0, h: 3.6, floorY: 0, floor: 'terrazzo_light', wallColor: '#efe8da',
  note: '店面 9.2 m 寬（臨街，照 LAWWW2 外觀 8de87af16 的 GG_XS）、7 m 深、3.6 m 高。參考室內圖是站在東端往西看的長條空間：臨街木框大窗＋窗邊長桌；門在大窗東邊，門的東邊是外帶窗口（店員從裡面遞出去）。北邊一條長吧台（磨石子檯面、直木條正面）＋五張木高腳椅，吧台後面綠色磁磚牆、一整排深綠茶罐、白瓷茶壺、玻璃公道杯、秤、熱水壺。西牆綠色布面卡座＋兩張小圓桌、書櫃；中間兩張方桌（米白布面椅）；最裡面一張四人桌。天花板淺木條＋軌道燈，紙燈籠吊燈、玻璃吊燈。地板淺色磨石子（D112）。',
  front: {door: {x: 1.85, w: 1.1, h: 2.65}, windows: [[-1.93, 1.27]], sill: 0.79, head: 2.5,
          takeaway: {x0: 2.94, x1: 4.24, sill: 1.2, head: 2.45, note: '外帶窗口（外觀圖右邊那扇往上掀的小窗；裡面一張小工作檯）'},
          note: '照 LAWWW2 外觀（11-04 01:36）：大窗 x −1.93～1.27（窗台 0.79、窗頂 2.5）、木框玻璃門 x 1.3～2.4（高 2.65）、外帶窗口 x 2.94～4.24（1.2～2.45）；大窗以西 x −4.6～−1.93 是實牆'},
  spawn: {x: 1.85, z: 2.9, yaw: Math.PI},
  exit: {at: {x: 1.85, z: 3.25}, label: '離開青木茶室', to: 'gongguan', note: 'spawn 回公館（店門口；LAWWW 接）'},
  enterAt: null,
  items: [
    {kind: 'window_counter', x: -0.7, z: 3.2, w: 2.3, d: 0.5, h: 0.75, note: '窗邊長桌（三張布面椅；小花瓶、茶杯、茶壺）'},
    {kind: 'display', x: 0.88, z: 3.12, w: 0.7, d: 0.44, h: 1.15, note: '玻璃展示櫃（v2b，LAWWW2「左前景加一座玻璃展示櫃（茶葉禮盒）」）：窗邊長桌東端、窗前，兩層茶葉禮盒＋一層茶罐，櫃頂燈條'},
    {kind: 'vitrine', x: 2.7, z: 3.1, w: 0.54, d: 0.4, h: 1.3, note: '玻璃展示櫃（v2b：茶葉禮盒兩層＋茶壺一層、櫃頂燈條）；門和外帶窗口之間'},
    {kind: 'takeaway_bench', x: 3.64, z: 3.2, w: 1.1, d: 0.6, h: 1.15, note: '外帶窗口裡面的工作檯（v2d：檯面拉到窗台下 1.15 m，從街上看得到：紙杯、菜單牌、茶壺、封口機、小盆栽；BB 11-04 03:52）'},
    {kind: 'bar', x: 1.25, z: -1.85, w: 4.7, d: 0.6, h: 1.0, note: '長吧台（v2c：西端往東縮 0.5 m，最裡面那桌東邊留 1.1 m 走道（LAWWW2 11-04 03:12）；v2b：淺色石材檯面、直木條正面、東端半圓圓角（多 0.3 m）；檯面上玻璃公道杯、兩個茶盤、秤、竹茶具筒、試聞茶罐、茶葉樣品罐）'},
    {kind: 'back_bench', x: 1.0, z: -3.2, w: 5.2, d: 0.6, h: 0.9, note: '吧台後面的工作檯（熱水壺、煮水機）；上面四層木層板（v2b，層板下燈條）：玻璃茶葉罐＋禮盒、牛皮紙茶包、白瓷茶壺、深綠茶罐'},
    {kind: 'tile_wall', note: '北牆 x −1.9～4.6、0.95～2.85 m 綠色長條磁磚（直貼）'},
    {kind: 'banquette', x: -4.3, z: 1.3, w: 0.6, d: 2.6, note: '西牆的綠色布面卡座（三顆抱枕）'},
    {kind: 'bookcase', x: -4.42, z: -1.4, w: 1.3, d: 0.34, h: 2.3, ry: Math.PI / 2, note: '西牆書櫃（書、小盆栽）'},
    {kind: 'painting', x: -4.58, y: 1.8, z: -2.7, w: 0.8, h: 0.6, note: '山景小畫（淺木框，西牆）'},
    {kind: 'logo', note: '「青木茶室」字＋雙葉標誌貼在西牆卡座上方'},
    {kind: 'plant_big', x: -4.25, z: 3.1}, {kind: 'plant_big', x: -4.25, z: -0.45}, {kind: 'plant_big', x: 4.3, z: -0.6}
  ],
  tables: [
    {id: 1, kind: 'round', x: -3.6, z: 2.0, r: 0.32, note: '卡座前的小圓桌一'},
    {id: 2, kind: 'round', x: -3.6, z: 0.6, r: 0.32, note: '卡座前的小圓桌二'},
    {id: 3, kind: 'square', x: 2.3, z: 1.0, w: 0.8, d: 0.8, note: '中間方桌（四人；參考圖前景那張）'},
    {id: 4, kind: 'square', x: -0.6, z: 0.7, w: 0.8, d: 0.8, note: '中間方桌二（兩人）'},
    {id: 5, kind: 'rect', x: -2.9, z: -1.6, w: 1.4, d: 0.8, note: '最裡面的四人桌（桌上一壺茶、小花）'}
  ],
  blocks: [
    [-0.7, 3.2, 2.3, 0.5], [0.88, 3.12, 0.7, 0.44], [2.7, 3.1, 0.54, 0.4], [3.64, 3.2, 1.1, 0.6],
    [1.4, -1.85, 5.0, 0.62], [1.0, -3.2, 5.2, 0.6],
    [-4.3, 1.3, 0.6, 2.6], [-4.42, -1.4, 0.36, 1.3],
    [-3.6, 2.0, 0.66, 0.66], [-3.6, 0.6, 0.66, 0.66], [2.3, 1.0, 0.82, 0.82], [-0.6, 0.7, 0.82, 0.82], [-2.9, -1.6, 1.4, 0.8],
    [-4.25, 3.1, 0.55, 0.55], [-4.25, -0.45, 0.55, 0.55], [4.3, -0.6, 0.55, 0.55]
  ],
  walkNote: '店門 (1.85, 3.5) 進來：往東南繞過方桌一到 (3.4, 1.0)，再沿中間走道 z −0.8～0.2（高腳椅和方桌之間）往西走到最裡面；或往西沿窗邊椅子後面 z 2.0 走（0.7 m，窄）。吧台東端（圓角到 x 3.9）以東是店員進吧台的通道（0.7 m）；吧台前 z −1.5～−0.8（高腳椅在 z −1.15）；店員在吧台後面 z −2.85～−2.2；窗邊長桌的椅子在 z 2.75。',
  seats: [
    {x: -1.5, z: 2.75, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'}, {x: -0.7, z: 2.75, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'},
    {x: 0.1, z: 2.75, yaw: 0, table: 6, canStudy: true, label: '坐窗邊'},
    {x: -4.15, z: 2.0, yaw: Math.PI / 2, table: 1, seatH: 0.45, canStudy: true, label: '坐卡座'}, {x: -3.05, z: 2.0, yaw: -Math.PI / 2, table: 1, canStudy: true, label: '坐下'},
    {x: -4.15, z: 0.6, yaw: Math.PI / 2, table: 2, seatH: 0.45, canStudy: true, label: '坐卡座'}, {x: -3.05, z: 0.6, yaw: -Math.PI / 2, table: 2, canStudy: true, label: '坐下'},
    {x: 2.3, z: 0.45, yaw: 0, table: 3, canStudy: true, label: '坐下'}, {x: 2.3, z: 1.55, yaw: Math.PI, table: 3, canStudy: true, label: '坐下'},
    {x: 1.75, z: 1.0, yaw: Math.PI / 2, table: 3, canStudy: true, label: '坐下'}, {x: 2.85, z: 1.0, yaw: -Math.PI / 2, table: 3, canStudy: true, label: '坐下'},
    {x: -1.15, z: 0.7, yaw: Math.PI / 2, table: 4, canStudy: true, label: '坐下'}, {x: -0.05, z: 0.7, yaw: -Math.PI / 2, table: 4, canStudy: true, label: '坐下'},
    {x: -3.25, z: -2.15, yaw: 0, table: 5, canStudy: true, label: '坐下'}, {x: -2.55, z: -2.15, yaw: 0, table: 5, canStudy: true, label: '坐下'},
    {x: -3.25, z: -1.05, yaw: Math.PI, table: 5, canStudy: true, label: '坐下'}, {x: -2.55, z: -1.05, yaw: Math.PI, table: 5, canStudy: true, label: '坐下'},
    {x: -0.6, z: -1.15, yaw: Math.PI, table: 7, seatH: 0.72, label: '坐吧台'}, {x: 0.4, z: -1.15, yaw: Math.PI, table: 7, seatH: 0.72, label: '坐吧台'},
    {x: 1.4, z: -1.15, yaw: Math.PI, table: 7, seatH: 0.72, label: '坐吧台'}, {x: 2.4, z: -1.15, yaw: Math.PI, table: 7, seatH: 0.72, label: '坐吧台'},
    {x: 3.35, z: -1.15, yaw: Math.PI, table: 7, seatH: 0.72, label: '坐吧台'}
  ],
  interact: [
    {x: 3.9, z: -1.2, kind: 'order', label: '點茶', note: '吧台東端；店員在吧台後面'},
    {x: -3.8, z: -1.4, kind: 'bookcase', label: '看看書櫃'},
    {x: 2.7, z: 2.6, kind: 'vitrine', label: '看茶具櫃'},
    {x: 1.0, z: -1.0, kind: 'tea_tins', label: '看茶罐', note: '站在吧台前看後牆那排茶罐'}
  ],
  floorSit: [],
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = AOKI_LAYOUT;
