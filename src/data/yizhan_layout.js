/* ===== 一盞茶屋 室內（溫州街日式宿舍改的茶屋；AA 2026-11-04 v1；使用者 11-04 05:08「一盞內外部改成這樣 庭院要能走到」；AA_656、AA_657） =====
   參考圖：docs/story_planning/ref_images/shops/wz_yizhan_int.webp（室內）、wz_yizhan_ext.webp（外觀＋前院，LAWWW2 做）。
   **遊戲區域照舊 `wz_teahouse`**：這份是 WZ_SHOPS_LAYOUT.teahouse 的新版（格式一樣）。座標＝區域座標（x 往東、+z 往前院）；主屋 z −5～5、緣側 5～6.2、前院 6.2～9.6。
   **這顆室內 GLB 只做到 z 6.2（緣側邊緣）**：前院、竹籬、冠木門、樟樹、石燈籠、沓脫石、緣側外緣的柱子和簷、暖簾、壁牌是 LAWWW2 的 wz_teahouse_yard.glb（11-04 05:22）。前院地面 y −0.42。
   不能動的 16 項照 docs/handoff/WZ_YIZHAN_FIXED_COORDS.md（開發分支 12cf5022d）：出口、出生點、水屋、蘇姨、語彤上班點、木凳、standAt、長桌最東兩位、打工 a/b/c/end、和室 A／B、床之間、緣側兩個坐墊。
   前院打開以後的出生點、出口、打工 a／end 由 LAWWW＋LAWWW2 定（LAWWW 11-04 05:25 做法 A），這份照舊寫現在的值，等他們改。
   參考圖的鏡頭站在土間（玄關的石板地）往裡面看：左邊是緣側的格子玻璃拉門和院子、中間木地板大間的矮桌和坐墊、後面紙拉門裡的兩間和室、右邊水屋（木作檯、茶具層架、暖簾）。
   遊戲裡玄關在西南角（x −3），所以對應的鏡頭站在玄關往東北看：右手邊是緣側和院子（+z），正前方是茶席，後面是和室，水屋在東邊。
   yaw：人面向 (sin yaw, cos yaw)。blocks：[x中心, z中心, 寬(x), 深(z)]。 */
const YIZHAN_LAYOUT = {
  version: 2,
  id: 'wz_teahouse', name: '一盞', glb: 'assets/models/env/second_ai/aa_support/yizhan.glb', yardGlb: 'wz_teahouse_yard.glb（LAWWW2）',
  w: 8.4, d: 14.6, h: 2.9, wallColor: '#e6dcc4', floor: 'wood_light（D112：參考圖是深色木地板，改淺色）',
  zCenterNote: '區域 z −5～9.6：房子 z −5～5、緣側 5～6.2、前院 6.2～9.6（前院 LAWWW2 另一顆 GLB）',
  note: '主屋約 8×10 m＋緣側。西南角是土間玄關（石板地、一階木踏台、左牆鞋櫃）；中間木地板的茶席（一張長矮桌、六個坐墊）；東邊水屋（朝店裡的木作檯：流理台、電熱水壺、茶罐、沙漏、茶巾；後面牆上茶具層架；往後面的布暖簾）；後面兩間榻榻米和室（床之間、違い棚），中間襖；前面整排格子玻璃拉門對著緣側和院子（拉開收在兩端）。深色木柱、木梁、木板天花板，方形和紙吊燈。',
  front: {door: {x: -3.0, w: 1.0, note: '玄關的格子門（從前院的踏石進來）'}, openFront: true, shoji: {z: 5.0, x0: -2.2, x1: 4.2, note: '緣側和室內之間的格子玻璃拉門：拉開收在兩端（x −2.2～−1.4、3.4～4.2）'}},
  spawn: {x: -3.0, z: 4.2, yaw: Math.PI},
  camWalls: [[0, -0.6, 8.4, 0.12], [0, -3.8, 0.12, 6.4]],
  seeThru: ['wzs_washi', 'wzs_pendant', 'tree_bark_camphor'],
  seeThruNote: '照舊名字：方形和紙吊燈的紙＝材質 wzs_washi、吊線和框＝wzs_pendant；樟樹樹幹在 LAWWW2 的前院 GLB。',
  exit: {at: {x: -3.0, z: 4.6}, label: '離開一盞', to: 'wenzhou', spawn: {x: -20.5, z: 4.1, yaw: Math.PI}, note: '照舊；前院打開以後 LAWWW 搬到冠木門旁'},
  enterAt: {x: -20.5, z: 4.6, label: '進去一盞'},
  items: [
    {kind: 'genkan', x: -3.3, z: 4.4, w: 1.8, d: 1.2, note: '土間玄關：石板地（比室內低 0.12）、一階木踏台（上框）在 z 3.8、左牆鞋櫃、木製傘架'},
    {kind: 'getabako', x: -3.95, z: 4.4, w: 0.5, d: 1.2, h: 0.9, note: '鞋櫃（上面一盞方形紙座燈、一個花器）'},
    {kind: 'engawa', x: 1.0, z: 5.6, w: 6.4, d: 1.2, note: '緣側木地板（到 z 6.2；外緣柱子和簷 LAWWW2 做）'},
    {kind: 'zabuton', x: 0.6, z: 5.55, ry: 0}, {kind: 'zabuton', x: 2.4, z: 5.55, ry: 0},
    {kind: 'low_table', x: -1.6, z: 1.7, w: 2.6, d: 0.9, h: 0.35, note: '茶席：一張長矮桌（原本長桌＋六張椅子）；座位到桌邊 0.3 m（FIXED_COORDS §3）'},
    {kind: 'zabuton', x: -2.5, z: 0.95, ry: 0}, {kind: 'zabuton', x: -1.6, z: 0.95, ry: 0}, {kind: 'zabuton', x: -0.7, z: 0.95, ry: 0},
    {kind: 'zabuton', x: -2.5, z: 2.45, ry: Math.PI}, {kind: 'zabuton', x: -1.6, z: 2.45, ry: Math.PI}, {kind: 'zabuton', x: -0.7, z: 2.45, ry: Math.PI},
    {kind: 'stool_round', x: 3.05, z: 3.35, ry: -Math.PI / 2, note: '照舊：語彤的木凳（水屋西南角旁）'},
    {kind: 'mizuya', x: 3.75, z: 1.3, w: 0.8, d: 3.4, ry: -Math.PI / 2, note: '照舊位置大小（不往西多出來，FIXED_COORDS #3／§5-2）：朝店裡的胡桃木作檯（框格門板、厚檯面）＝劇情裡「茶屋的吧檯」（AA_657 §3）；台面：流理台、電熱水壺、茶罐、沙漏、茶巾、豆花的舊照片（TRACE_SQ14_catphoto）；後面東牆上兩層茶具層架、上面竹籃'},
    {kind: 'noren', x: 3.75, z: -0.55, w: 0.8, note: '水屋北端往後面的布暖簾（米色）'},
    {kind: 'plaque', side: 'right', along: 3.1, y: 1.85, w: 0.32, h: 0.75, note: '東牆的「一盞」直的木牌（參考圖右邊）'},
    {kind: 'jar', x: -1.8, z: 4.55, note: '緣側入口西邊的大甕＋插花（新加，有阻擋）'}, {kind: 'plant_big', x: 3.85, z: 4.55, note: '東南角的盆栽（新加，有阻擋）'},
    {kind: 'tatami_room', x: -2.15, z: -2.8, w: 4.1, d: 4.4, note: '和室 A：床之間（掛軸、插花）在後牆左邊'},
    {kind: 'tatami_room', x: 2.15, z: -2.8, w: 4.1, d: 4.4, note: '和室 B：違い棚'},
    {kind: 'low_table', x: -2.15, z: -2.8, w: 1.2, d: 0.8}, {kind: 'low_table', x: 2.15, z: -2.8, w: 1.2, d: 0.8},
    {kind: 'zabuton', x: -2.15, z: -3.5, ry: 0}, {kind: 'zabuton', x: -2.15, z: -2.1, ry: Math.PI}, {kind: 'zabuton', x: -3.0, z: -2.8, ry: Math.PI / 2}, {kind: 'zabuton', x: -1.3, z: -2.8, ry: -Math.PI / 2},
    {kind: 'zabuton', x: 2.15, z: -3.5, ry: 0}, {kind: 'zabuton', x: 2.15, z: -2.1, ry: Math.PI}, {kind: 'zabuton', x: 1.3, z: -2.8, ry: Math.PI / 2}, {kind: 'zabuton', x: 3.0, z: -2.8, ry: -Math.PI / 2},
    {kind: 'zabuton_stack', x: -0.55, z: -0.95, note: 'v1b：和室 A 東南角疊起來的三個坐墊（有阻擋）'},
    {kind: 'tokonoma', x: -3.3, z: -4.65, w: 1.6, d: 0.7},
    {kind: 'fusuma', x: 0.0, z: -2.8, w: 0.12, d: 4.4, note: '兩間和室中間的襖（關著）'},
    {kind: 'shoji_wall', z: -0.6, x0: -4.2, x1: 4.2, open: [[-3.2, -1.0], [1.0, 3.2]], note: '和室前面的紙拉門：中間各拉開 2.2 m'}
  ],
  blocks: [[-1.6, 1.7, 2.6, 0.9], [3.75, 1.3, 0.8, 3.4], [-2.15, -2.8, 1.2, 0.8], [2.15, -2.8, 1.2, 0.8], [-3.3, -4.65, 1.6, 0.7], [0.0, -2.8, 0.12, 4.4],
           [-3.7, -0.6, 1.0, 0.12], [-0.05, -0.6, 2.1, 0.12], [3.7, -0.6, 1.0, 0.12], [-1.8, 4.55, 0.5, 0.5], [3.85, 4.55, 0.6, 0.6], [-0.55, -0.95, 0.6, 0.65], [-3.95, 4.4, 0.5, 1.2], [-3.2, 5.6, 2.0, 1.2], [0.0, 7.9, 8.4, 3.4]],
  blocksNote: '最後兩塊（玄關前／緣側西端、整片前院）照舊；前院打開時由 LAWWW＋LAWWW2 拿掉、改成前院擺設各自的阻擋（AA_656、FIXED_COORDS §4 做法 A）。',
  walkNote: '照舊：玄關 → 茶席 → 水屋前 → 緣側都可以走；和室從紙拉門的開口進去',
  seats: [
    {x: -2.5, z: 0.95, yaw: 0, label: '坐下喝茶', kind: 'floor'}, {x: -1.6, z: 0.95, yaw: 0, label: '坐下喝茶', kind: 'floor'}, {x: -0.7, z: 0.95, yaw: 0, label: '坐下喝茶', kind: 'floor'},
    {x: -2.5, z: 2.45, yaw: Math.PI, label: '坐下喝茶', kind: 'floor'}, {x: -1.6, z: 2.45, yaw: Math.PI, label: '坐下喝茶', kind: 'floor'}, {x: -0.7, z: 2.45, yaw: Math.PI, label: '坐下喝茶', kind: 'floor'},
    {x: 3.05, z: 3.35, yaw: -Math.PI / 2, label: '坐在水屋旁'},
    {x: 0.6, z: 5.55, yaw: 0, label: '坐在緣側', kind: 'floor'}, {x: 2.4, z: 5.55, yaw: 0, label: '坐在緣側', kind: 'floor'},
    {x: -2.15, z: -3.5, yaw: 0, label: '在和室坐下', kind: 'floor'}, {x: -2.15, z: -2.1, yaw: Math.PI, label: '在和室坐下', kind: 'floor'},
    {x: 2.15, z: -3.5, yaw: 0, label: '在和室坐下', kind: 'floor'}, {x: 2.15, z: -2.1, yaw: Math.PI, label: '在和室坐下', kind: 'floor'}
  ],
  seatNote: '茶席六個位子從椅子改坐墊（kind floor，坐墊頂 0.08，FIXED_COORDS §3），座標、朝向、順序都不變；label 照舊「坐下喝茶」。',
  interact: [
    {x: 2.95, z: 1.3, kind: 'mizuya', label: '水屋（打工：泡茶）'},
    {x: -1.6, z: 3.1, kind: 'tea', label: '喝茶'},
    {x: 1.5, z: 5.9, kind: 'garden', label: '看院子'},
    {x: -3.0, z: -1.2, kind: 'tokonoma', label: '看床之間的掛軸'}
  ],
  work: {a: {me: {x: 3.4, z: 5.5, yaw: 0, act: 'sweep', note: '照舊；前院打開以後 LAWWW 移進院子'}, boss: {x: 2.75, z: 1.5, yaw: Math.PI / 2, act: 'stand'}},
         b: {me: {x: 2.75, z: 1.0, yaw: Math.PI / 2, act: 'brew'}, boss: {x: 2.75, z: 2.15, yaw: 2.6, act: 'stand'}},
         c: {me: {x: -0.5, z: 5.5, yaw: 0, act: 'stand'}, boss: {x: -1.6, z: 3.0, yaw: Math.PI, act: 'stand'}},
         end: {x: -3.0, z: 4.2, yaw: 0}},
  wallsFade: {back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
};
if (typeof module !== 'undefined') module.exports = YIZHAN_LAYOUT;
