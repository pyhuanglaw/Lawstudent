/* ===== 阿德影印輸出（溫州街 A1，不改名）的室內（CC〔帳號 A 的建模子代理〕2026-11-04 v1：照使用者的參考圖 wz_ade_int 做，給 LAWWW2 收件〔MODEL_READY〕、BB 驗收〔ART_APPROVED〕） =====
   對應的遊戲區域：**wz_print**（src/data/wz_shops_layout.js 的 WZ_SHOPS_LAYOUT.print；區域 id、存檔 key、打工 key copy／print 都不改名，AA_654 第 1 節）。
   這份是新的室內配置；LAWWW 整合時把 WZ_SHOPS_LAYOUT.print 的 items／blocks／seats／interact／work 換成這裡的（或在 wzShop('print') 改讀 ADE_LAYOUT.print），
   front、spawn、exit、enterAt、moved 照舊（數字和 wz_shops_layout.js 的 print 相同，抄過來的，沒改）。
   規格：參考圖 wz_ade_int（從店門往裡看）就是規格（SCENE_RULES 第 12 節）；外觀 wz_ade_ext；AA_654（阿德影印：價目照室內圖、原本的打工照舊）。
   尺寸：照 LAWWW2（11-04，經 CC 轉達）：沿用現在的 print——4.4 × 9.2 × 3.0 m，店面那面牆在 +z＝4.6；門 x 0、寬 1.4；窗兩扇 x −2～−0.85、0.85～2（窗台 0.4、窗頂 2.5）；
     出口 (0, 4.15)、出生點 (0, 3.9)。店內主走道淨寬 ≥ 0.8 m（LAWWW2 的店內標準）。預算 5 萬三角形、3 MB。
   格式照 src/data/corner_layout.js：房間中心在原點，x 往東、z 往南、y 往上；店門在 +z；單位公尺；外牆 0.12 m（內面 x ±2.08、z ±4.48）。
   yaw：人面向 (sin yaw, cos yaw)——0＝面向 +z（店門）、π＝面向 −z（店裡面）、π/2＝面向 +x、−π/2＝面向 −x。
   blocks：導航阻擋 [x中心, z中心, 寬(x), 深(z)]（外牆由 room() 擋）。seats：坐下的位置。interact：互動點（kind 照舊有的 print／stationery／copier_self／staff_gate／binding；新加的 plotter 草稿）。
   平面（從店門往裡看，照參考圖由左到右）：
     左（西）：兩台自助影印機（觸控面板）、上面牆上的藍色「影印・輸出價目表」；後面一台大圖輸出機（海報）、一座矮的紙樣櫃。
     中：兩張淺木色長桌（灰色鐵腳）接成一排，三台自助電腦（螢幕、鍵盤、滑鼠）、筆筒、文件籃、隔板；深藍色椅子五張（西側四張、東側一張）。
     右（東）：前面一座灰色鐵層架（彩色資料夾、筆記本、筆、便利貼、口紅膠、A4／A3 紙箱）；牆上「裝訂樣式」「學生報告範例」兩塊展示板；
              下面一張長工作檯（雷射印表機、膠裝機、裁紙刀、紙疊、紙箱）；最裡面阿芃寫功課的小桌。
     後：木櫃台（電腦、付款的掃碼小牌、筆筒、叫人鈴）；後牆一座木格櫃（一格一格的紙）、藍色招牌「阿德影印輸出」；右後兩台大型生產用影印機（操作螢幕）。
     天花板：白色輕鋼架天花板、一條一條的 LED 平板燈、中間一台吸頂冷氣（單面，法線朝下）。 */
const ADE_LAYOUT = {
  version: 1,
  print: {
    id: 'wz_print', zone: 'wz_print', layoutKey: 'print', name: '阿德影印輸出', glb: 'assets/models/env/second_ai/bb_support/ade.glb',
    w: 4.4, d: 9.2, h: 3.0, wallColor: '#eef0ee', floor: 'tile_grey',
    hours: '週一～週六 09:00–22:00（考試週開到 24:00）；週日公休（照 src/data/places.js 的 wz_print，沒改）',
    prices: [['黑白影印／列印', 'A4', '2 元／張'], ['', 'A3', '4 元／張'], ['彩色輸出', 'A4', '10 元／張'], ['', 'A3', '20 元／張'], ['雙面列印', '', '+1 元／張'], ['掃描（轉檔）', '', '5 元／張'], ['膠裝', '', '80 元起'], ['騎馬釘', '', '15 元起']],
    pricesNote: 'AA_654：價目照室內圖（外觀圖的價目表寫黑白 NT$1／頁，和室內不同；照 AA_654 用室內這一份，外觀那張 LAWWW2 跟著改或 AA 定）',
    note: '溫州街 A1（AA_654）。v1（11-04）：尺寸照現在的 wz_print（LAWWW2：不要動）。參考圖的店看起來比 4.4 m 寬：左右兩排都照圖排，中間的長桌往東靠，西側是主走道。',
    front: {door: {x: 0.0, w: 1.4, h: 2.5}, windows: [[-2.0, -0.85, 0.4, 2.5], [0.85, 2.0, 0.4, 2.5]],
      note: '照 LAWWW2（wz_shops_layout.js print）：門 x −0.7～0.7；窗 x −2～−0.85、0.85～2（窗台 0.4、窗頂 2.5）；windows：[x0, x1, 窗台, 窗頂]。門是外觀那一側的玻璃雙開門（外觀模型做），室內只做門框；門高 2.5 照窗頂（LAWWW2 沒給門高）'},
    windowKeep: [[-1.425, 4.24, 1.15, 0.48], [1.425, 4.24, 1.15, 0.48]],
    spawn: {x: 0.0, z: 3.9, yaw: Math.PI},
    exit: {at: {x: 0.0, z: 4.15}, label: '離開影印店', to: 'wenzhou', spawn: {x: -8.0, z: 4.1, yaw: Math.PI}},
    enterAt: {x: -8.0, z: 4.6, label: '進去阿德影印輸出', note: '照 wz_shops_layout.js 的 print（沒改）'},
    camRef: {eye: [-0.35, 1.65, 3.9], look: [0.3, 1.1, -4.0], lens: 18, note: '參考圖的鏡頭（Blender 渲染、ref_match 用）：站在店門內側、長桌西邊往裡看、往下約 4°。參考圖的店看起來比 4.4 m 寬、比 9.2 m 淺；18 mm 時左邊的影印機、右邊的層架照參考圖被畫面邊緣切到一部分'},
    lights: {
      panels: [[-1.0, 3.3], [1.0, 3.3], [-1.0, 1.5], [1.0, 1.5], [-1.0, -0.3], [1.0, -0.3], [-1.0, -2.1], [1.0, -2.1], [-1.0, -3.7], [1.0, -3.7]],
      note: 'LED 平板燈 [x, z]（1.2 × 0.3 m，長邊沿 z；嵌在輕鋼架天花板，y＝h）；夜間光暈 GLOW_panel_* 在同一個位置。日光燈色（約 5000K）'
    },
    items: [
      {kind: 'copier_self', x: -1.74, z: 2.65, w: 0.68, d: 0.62, h: 1.22, ry: Math.PI / 2, note: '自助影印機 1（正面朝 +x；觸控面板、紙匣四層、出紙盤）'},
      {kind: 'copier_self', x: -1.74, z: 1.88, w: 0.68, d: 0.62, h: 1.22, ry: Math.PI / 2, note: '自助影印機 2'},
      {kind: 'price_board', x: -2.07, y: 2.0, z: 1.25, w: 0.95, h: 1.45, note: '藍色「影印・輸出價目表」（左牆，影印機後面那一段的上面：參考圖在影印機的左上方）'},
      {kind: 'front_plant', x: -1.72, z: 3.62, note: '左前角的盆栽（窗旁）'},
      {kind: 'plotter', x: -1.79, z: 0.55, w: 0.58, d: 1.5, h: 1.15, note: '大圖輸出機（海報；捲筒紙、出紙籃）'},
      {kind: 'sample_cab', x: -1.86, z: -1.4, w: 0.44, d: 1.15, h: 0.9, note: '矮的紙樣櫃：上面紙樣本、膠裝封面樣本、釘書機、資源回收盒'},
      {kind: 'table', x: 0.325, z: 2.05, w: 0.65, d: 2.1, h: 0.75, divider: true, note: '前面那張長桌：自助電腦 1 台、隔板、筆筒、文件籃'},
      {kind: 'table', x: 0.325, z: 0.1, w: 0.65, d: 1.6, h: 0.75, note: '後面那張長桌：自助電腦 2 台、筆筒、紙疊'},
      {kind: 'chair', x: -0.27, z: 2.35, yaw: Math.PI / 2}, {kind: 'chair', x: -0.27, z: 1.6, yaw: Math.PI / 2},
      {kind: 'chair', x: -0.27, z: 0.45, yaw: Math.PI / 2}, {kind: 'chair', x: -0.27, z: -0.3, yaw: Math.PI / 2},
      {kind: 'chair', x: 0.93, z: 1.45, yaw: -Math.PI / 2, note: '東側一張（參考圖右前那張）'},
      {kind: 'stat_rack', x: 1.87, z: 2.2, w: 0.42, d: 1.8, h: 2.1, note: '灰色鐵層架六層：彩色資料夾、活頁本、筆記本、筆、便利貼、口紅膠、A4／A3 紙箱；上面一盆黃金葛'},
      {kind: 'board_binding', x: 2.07, y: 2.0, z: 0.35, w: 0.75, h: 1.1, note: '「裝訂樣式」展示板（黑、灰、白的線圈本）'},
      {kind: 'board_report', x: 2.07, y: 1.95, z: -0.85, w: 1.1, h: 1.4, note: '「學生報告範例」展示板（報告封面、校園照片封面）'},
      {kind: 'worktable', x: 1.78, z: -0.75, w: 0.6, d: 3.1, h: 0.9, note: '長工作檯：雷射印表機、膠裝機、裁紙刀、紙疊；下層 A4 紙箱'},
      {kind: 'kid_desk', x: 1.83, z: -2.85, w: 0.5, d: 0.75, h: 0.72, note: '阿芃寫功課的小桌（面向東牆；凳子在 x 1.38）'},
      {kind: 'kid_stool', x: 1.38, z: -2.85},
      {kind: 'counter', x: -1.25, z: -2.95, w: 1.6, d: 0.6, h: 1.0, note: '木櫃台：電腦、掃碼付款小牌、筆筒、叫人鈴、訂書機、待取件的牛皮紙袋'},
      {kind: 'office_chair', x: -1.6, z: -3.65, yaw: 0, note: '櫃台後面的辦公椅（打工的座位；面向客人）'},
      {kind: 'cubby', x: -1.0, z: -4.28, w: 2.0, d: 0.4, h: 1.85, note: '後牆木格櫃（5 × 4 格，一格一格的紙）；上面一盆盆栽'},
      {kind: 'back_sign', x: -0.8, y: 2.45, z: -4.47, w: 2.1, h: 0.34, note: '藍色招牌「阿德影印輸出」（印表機圖示、斜線）'},
      {kind: 'copier_prod', x: 0.7, z: -4.09, w: 0.9, d: 0.78, h: 1.25, note: '大型生產用影印機 A（正面朝 +z；操作螢幕）'},
      {kind: 'copier_prod', x: 1.61, z: -4.09, w: 0.9, d: 0.78, h: 1.25, note: '大型生產用影印機 B'},
      {kind: 'ac', x: 0.2, z: 0.6, w: 0.84, note: '吸頂冷氣（四面出風）'},
      {kind: 'hours_sign', note: '營業時間牌（店門內側玻璃）：週一～週六 09:00–22:00、週日公休'}
    ],
    blocks: [
      [-1.74, 2.65, 0.68, 0.66], [-1.74, 1.88, 0.68, 0.66], [-1.72, 3.62, 0.42, 0.42], [-1.79, 0.55, 0.58, 1.5], [-1.86, -1.4, 0.44, 1.15],
      [0.325, 2.05, 0.65, 2.1], [0.325, 0.1, 0.65, 1.6],
      [-0.27, 2.35, 0.46, 0.46], [-0.27, 1.6, 0.46, 0.46], [-0.27, 0.45, 0.46, 0.46], [-0.27, -0.3, 0.46, 0.46], [0.93, 1.45, 0.46, 0.46],
      [1.87, 2.2, 0.42, 1.8], [1.78, -0.75, 0.6, 3.1], [1.83, -2.85, 0.5, 0.75], [1.38, -2.85, 0.34, 0.34],
      [-1.25, -2.95, 1.6, 0.6], [-1.6, -3.65, 0.44, 0.44], [-1.0, -4.28, 2.0, 0.4], [0.7, -4.09, 0.9, 0.78], [1.61, -4.09, 0.9, 0.78]
    ],
    blocksNote: '外牆由 room() 擋。櫃台後面的辦公椅靠西端（x −1.85～−1.35）：西邊剩 0.23 m 站不住，不會變成孤島。阿芃的凳子也擋（NPC 坐）。',
    walkNote: '主走道（西側）：影印機、大圖輸出機、紙樣櫃（x −1.40～−1.63）到長桌西側的椅背（x −0.50）＝0.90～1.13 m。長桌東側：到鐵層架（x 1.66）0.36～1.01 m、到工作檯（x 1.48）0.83 m；東側那張椅子（x 0.70～1.16、z 0.97～1.43）把東側走道分成前後兩段（前段到層架、後段到工作檯，各自從前面、後面進得去）。後段：長桌後面（z −0.85）到櫃台（z −2.65）1.8 m 整條通。櫃台後面（店員）z −3.25～−4.08＝0.83 m，從東端進（x −0.05～0.12 再往東是生產用影印機前面 z −3.25～−3.70）。',
    seats: [
      {x: -0.27, z: 2.35, yaw: Math.PI / 2, h: 0.46, kind: 'chair', label: '坐下來用電腦', note: '自助電腦（前面那張長桌）'},
      {x: -0.27, z: 1.6, yaw: Math.PI / 2, h: 0.46, kind: 'chair', label: '坐一下'},
      {x: -0.27, z: 0.45, yaw: Math.PI / 2, h: 0.46, kind: 'chair', label: '坐下來用電腦', note: '自助電腦（後面那張長桌）'},
      {x: -0.27, z: -0.3, yaw: Math.PI / 2, h: 0.46, kind: 'chair', label: '坐下來用電腦'},
      {x: 0.93, z: 1.45, yaw: -Math.PI / 2, h: 0.46, kind: 'chair', label: '坐一下', note: '東側那張（面向 −x）'},
      {x: -1.6, z: -3.65, yaw: 0, h: 0.48, kind: 'office_chair', label: '坐在櫃台後面（打工時）'},
      {x: 1.38, z: -2.85, yaw: Math.PI / 2, h: 0.45, kind: 'stool', label: '（阿芃的位子）', npcOnly: true}
    ],
    interact: [
      {x: -1.25, z: -2.2, yaw: Math.PI, kind: 'print', label: '印東西', note: '櫃台前（客人）：找阿德印東西、付錢'},
      {x: -1.0, z: 3.1, yaw: -Math.PI * 0.75, kind: 'copier_self', label: '自助影印', note: '前面那台自助影印機的前面（離長桌的椅子遠一點：站在椅子旁邊時最近的是「坐下」）'},
      {x: 1.25, z: 2.55, yaw: Math.PI / 2, kind: 'stationery', label: '買文具', note: '鐵層架前面'},
      {x: 0.0, z: -3.0, yaw: -Math.PI / 2, kind: 'staff_gate', label: '進櫃台（打工時）', note: '櫃台東端（從這裡進到櫃台後面）'},
      {x: 1.05, z: -1.35, yaw: Math.PI / 2, kind: 'binding', label: '膠裝（打工時）', note: '長工作檯前（膠裝機、裁紙刀）'}
    ],
    npc: {
      staff: [
        {id: 'wz_ade', x: -0.8, z: -3.65, yaw: 0, act: 'stand', note: '阿德：櫃台後面，面向客人'},
        {id: 'wz_ade', x: 0.7, z: -3.3, yaw: Math.PI, act: 'stand', note: '阿德：生產用影印機前（卡紙、印論文）'},
        {id: 'wz_ade', x: 1.05, z: -1.35, yaw: Math.PI / 2, act: 'stand', note: '阿德：長工作檯前（膠裝）'}
      ],
      kid: {id: '阿芃', x: 1.38, z: -2.85, yaw: Math.PI / 2, act: 'sit', note: '阿芃：晚上在小桌寫功課（坐著，面向東牆）'}
    },
    /* 打工的站位（照 wz_shops_layout.js 的 print.work 的格式；a＝接單、b＝做的時候、c＝交件）。這一版櫃台東端是開的（從客人區走得進櫃台後面），下班不必再放回客人區，end 留著相容 */
    work: {a: {me: {x: -1.6, z: -3.65, yaw: 0, act: 'sit', note: '櫃台後面的辦公椅，面向客人'}, boss: {x: 1.05, z: -1.35, yaw: Math.PI / 2, act: 'stand', note: '長工作檯前'}, kid: {x: 1.38, z: -2.85, yaw: Math.PI / 2, act: 'sit', note: '阿芃的位子'}},
           b: {me: {x: 1.05, z: -1.0, yaw: Math.PI / 2, act: 'stand', note: '長工作檯前（膠裝機、裁紙刀）'}, boss: {x: 0.7, z: -3.3, yaw: Math.PI, act: 'stand', note: '生產用影印機前'}, kid: {x: 1.38, z: -2.85, yaw: Math.PI / 2, act: 'sit'}},
           c: {me: {x: -0.8, z: -3.65, yaw: 0, act: 'stand', note: '櫃台後面，交件給客人'}, boss: {x: 0.85, z: -2.35, yaw: Math.PI / 2, act: 'stand', note: '阿芃的小桌旁'}, kid: {x: 1.38, z: -2.85, yaw: Math.PI / 2, act: 'sit'}},
           end: {x: -0.55, z: 3.45, yaw: 0, note: '客人區、門口，面向店門'}},
    jobDesk: {x: 0.0, z: -3.0, label: '櫃台', note: 'src/data/wz_jobs.js 的 copy.desk 現在是 (1.05, 0.9)（舊配置的櫃台缺口）；換成這份時改成這裡（staff_gate 同一個位置）'},
    wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]}
  }
};
if (typeof module !== 'undefined') module.exports = ADE_LAYOUT;
