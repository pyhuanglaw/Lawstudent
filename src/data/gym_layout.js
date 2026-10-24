/* ===== 新體育館（綜合體育館）室內 第一階段：大廳＋1F 多功能球場（BB_151；LAWWW2-B 2026-10-16 v1）=====
   使用者直接指示（BB-B 轉達）：「新體育館……很有代表性，很多演講演唱會都在那，應該要建立室內3D」「一定要有健身房、羽球場，演講、演唱會時改成場地」。
   第一階段＝門口、大廳、1F 多功能球場（大一上第 1 週起，每週一下午的體育課就用得到）。3F 主球場（典禮、演講、演唱會）、B1（健身中心、游泳池）是下一階段：
   這一版的樓梯口用紅龍＋告示關起來（D38 第 4 條：看得懂的關閉，不用隱形牆）。
   這份給遊戲（LAWWW-B 建區域：導航格、座位、互動點、出入口）和 Blender（tools/blender/env_second/gym_interior.py）共用。
   座標：和現有室內區域一樣（room()：中心在原點、x 往東、z 往南、入口在 +z）；單位公尺。yaw：人面向 (sin yaw, cos yaw)。
   不放校名、館名、校徽（D77）；記分板、看板沒有品牌。 */
const GYM_LAYOUT = {
  version: 5,
  id: 'gym', name: '綜合體育館', glb: 'assets/models/env/second_ai/gym_interior.glb',
  w: 40.0, d: 38.0, h: 9.0, note: '區域 x −20～20、z −19～19；球場 z −19～11（挑高 9 m）、大廳 z 11～19（天花板 4.2 m）',
  hall: {x0: -20, x1: 20, z0: -19, z1: 11, h: 9.0},
  lobby: {x0: -20, x1: 20, z0: 11, z1: 19, h: 4.2},
  partition: {z: 11.0, openings: [[-12, -8], [-2, 2], [8, 12]], note: '大廳和球場之間的牆：三個 4 m 的開口（中間那個有閘門）'},
  front: {door: {x: 0, w: 4.0, note: '玻璃自動門'}, glass: [[-18, -2], [2, 18]]},
  spawn: {x: 0, z: 17.6, yaw: Math.PI},
  exit: {at: {x: 0, z: 18.4}, label: '離開體育館', to: 'campus', spawn: {x: 74, z: 58.0, yaw: Math.PI}, note: '校園的體育館門口（classes3d 的 gym，x 74、z 59.4）；朝向照門口實際的方向調'},
  enterAt: {x: 74, z: 59.4, label: '進體育館', note: '取代 classes3d 的「體育館：體育課在這裡上。」（門口上課改成進來上）'},
  courts: {
    badminton: [[-8.6, -11.2], [0.0, -11.2], [8.6, -11.2], [-8.6, 3.2], [0.0, 3.2], [8.6, 3.2]],
    badmintonNote: '羽球場 6 面（13.4×6.1 m，長邊沿 z，網在中心的 z）；網柱在 x＝中心 ±3.1',
    basketball: {x: 0, z: -4, len: 28, wid: 15, hoops: [[-12.43, -4], [12.43, -4]], note: '籃球場 28×15 橫放；籃架從屋頂吊下來（地上沒有東西擋路）'}
  },
  items: [
    {kind: 'bleacher', x: 0.0, z: -17.6, w: 30.0, d: 2.8, rows: 4, note: '北牆的伸縮看台（4 排）；系籃冠軍賽觀眾坐這裡'},
    {kind: 'scoreboard', x: 0.0, y: 6.2, z: -18.85, w: 4.2, h: 1.6},
    {kind: 'team_bench', x: 19.2, z: -10.0, ry: -Math.PI / 2, w: 4.0}, {kind: 'team_bench', x: 19.2, z: 2.0, ry: -Math.PI / 2, w: 4.0},
    {kind: 'info_desk', x: 11.0, z: 15.6, w: 4.2, d: 1.1, note: '服務台（學生證進場；B1 的服務櫃台在下一階段）'},
    {kind: 'turnstile', x: 0.0, z: 12.6, lanes: 3, note: '閘門三道（每道 1.2 m）'},
    {kind: 'stairs_up', x0: -19.4, x1: -16.6, z0: 12.2, z1: 18.4, note: '往 3F 主球場（下一階段開放）：第一跑上到平台 2.1 m，樓梯口紅龍＋告示'},
    {kind: 'stairs_down', x0: 16.6, x1: 19.4, z0: 12.6, z1: 17.6, note: '往 B1 游泳池、健身中心（下一階段開放）：地上的樓梯井＋欄杆，樓梯口紅龍＋告示'},
    {kind: 'vending', x: -13.4, z: 18.3, n: 2},
    {kind: 'fountain', x: -10.6, z: 18.45},
    {kind: 'bench', x: -6.0, z: 15.4, ry: 0}, {kind: 'bench', x: 6.0, z: 15.4, ry: 0},
    {kind: 'hours_board', x: -14.0, y: 1.9, z: 11.17, w: 1.4, h: 1.04, note: '開館時間（BB_151 4b）'},
    {kind: 'trophy', x: 15.0, z: 11.3, w: 2.4},
    {kind: 'wayfind', note: 'v2：大廳那一面、三個開口上方的指標（← 3F 主球場／↑ 1F 多功能球場／→ B1 健身中心・游泳池），y 3.25～3.75，貼牆'},
    {kind: 'slat_wall', note: 'v2：開口之間兩段木格柵牆（x −7.9～−2.1、2.1～7.9），凸出牆面 4 cm'},
    {kind: 'notice_board', x: -5.0, y: 1.95, z: 11.23, w: 3.2, h: 1.2, note: 'v2：軟木公告欄（系際盃籃球賽報名、羽球場借用規則、體適能檢測、游泳池冬季開放、失物招領、球場內禁止飲食）'},
    {kind: 'directory', x: 5.0, y: 1.93, z: 11.23, w: 0.9, h: 1.2, note: 'v2：樓層指引（3F 主球場、1F 多功能球場、B1 健身中心・游泳池；目前位置 1F 大廳）'}
  ],
  sets: {
    nets: {node: 'SET_NETS', note: 'v3：羽球網＋網柱（6 面）。平常顯示；第二會場（SET_SECONDHALL）打開時藏起來（BB-B：辦活動前會收網）。網柱的導航阻擋在 blocks 最後 12 個，收網時一起拿掉'},
    second_hall: {node: 'SET_SECONDHALL', note: '1F 第二會場（畢業典禮坐不下的家長、未滿 12 歲的小孩看轉播）：西牆的大螢幕＋整片折疊椅（面向西）。平常藏起來，典禮那天顯示',
      blocks: [[-6.0, -4.0, 18.0, 20.0]], seats: 'chairs: x −14.5～4.5 每 1.0 m、z −13.5～5.5 每 1.2 m，面向 −x（yaw −π/2）'}
  },
  blocks: [
    [0.0, -17.6, 30.0, 2.8], [19.2, -10.0, 0.6, 4.0], [19.2, 2.0, 0.6, 4.0],
    [-5.0, 11.25, 6.0, 0.2], [5.0, 11.25, 6.0, 0.2], [11.0, 15.6, 4.2, 1.1], [-13.4, 18.3, 2.2, 0.8], [-10.6, 18.45, 0.6, 0.5], [-6.0, 15.4, 1.8, 0.6], [6.0, 15.4, 1.8, 0.6],
    [-18.0, 15.3, 2.8, 6.2], [18.0, 15.1, 2.8, 5.0], [15.0, 11.3, 2.4, 0.5],
    [-1.4, 12.6, 0.12, 0.9], [-0.2, 12.6, 0.12, 0.9], [1.0, 12.6, 0.12, 0.9], [2.0, 12.6, 0.12, 0.9],
    [-11.7, -11.2, 0.12, 0.12], [-5.5, -11.2, 0.12, 0.12], [-3.1, -11.2, 0.12, 0.12], [3.1, -11.2, 0.12, 0.12], [5.5, -11.2, 0.12, 0.12], [11.7, -11.2, 0.12, 0.12],
    [-11.7, 3.2, 0.12, 0.12], [-5.5, 3.2, 0.12, 0.12], [-3.1, 3.2, 0.12, 0.12], [3.1, 3.2, 0.12, 0.12], [5.5, 3.2, 0.12, 0.12], [11.7, 3.2, 0.12, 0.12]
  ],
  blocksNote: '最後 12 個是羽球網柱。網本身要不要整條擋住，由 LAWWW-B 決定；建議不擋（上課時同學會穿過場地，擋住了找路會繞很遠）',
  seats: [
    // 座位點＝人坐下時屁股的位置（GAME.sitAt 直接放在這裡）：長椅＝座面中心往前 0.06 m；看台＝第一排木板座面（z −16.28～−16.57、高 0.47）中心往前 0.06 m，從地面坐、腳踩地板。
    // 原本大廳、場邊長椅在前緣外 0.05～0.2 m、看台在第一排前面 0.3 m 的空中、又加了 y 0.45（屁股在 0.9 m 高）——QA-W1 座位檢查（tests/seats_on_furniture.py）照 gym_interior.glb 的座面改
    {x: -6.0, z: 15.34, yaw: Math.PI, label: '坐在大廳的長椅'}, {x: -5.4, z: 15.34, yaw: Math.PI, label: '坐在大廳的長椅'},
    {x: 6.0, z: 15.34, yaw: Math.PI, label: '坐在大廳的長椅'}, {x: 6.6, z: 15.34, yaw: Math.PI, label: '坐在大廳的長椅'},
    {x: -6.0, z: -16.37, yaw: 0, label: '坐在看台'}, {x: -2.0, z: -16.37, yaw: 0, label: '坐在看台'}, {x: 2.0, z: -16.37, yaw: 0, label: '坐在看台'}, {x: 6.0, z: -16.37, yaw: 0, label: '坐在看台'},
    {x: 19.14, z: -10.6, yaw: -Math.PI / 2, label: '坐在場邊的長椅'}, {x: 19.14, z: -9.4, yaw: -Math.PI / 2, label: '坐在場邊的長椅'},
    {x: 19.14, z: 1.4, yaw: -Math.PI / 2, label: '坐在場邊的長椅'}, {x: 19.14, z: 2.6, yaw: -Math.PI / 2, label: '坐在場邊的長椅'}
  ],
  interact: [
    {x: 11.0, z: 14.7, kind: 'gym_desk', label: '服務台'},
    {x: -14.0, z: 11.8, kind: 'gym_hours', label: '看開館時間'},
    {x: -16.0, z: 17.4, kind: 'closed_3f', label: '往 3F 的樓梯（今天不開放）'},
    {x: 18.0, z: 18.2, kind: 'closed_b1', label: '往 B1 的樓梯（今天不開放）'},
    {x: 0.0, z: -4.0, kind: 'pe_class', label: '體育課集合（中圈）'},
    {x: 0.0, z: -2.6, kind: 'badminton', label: '打羽球'},
    {x: -13.4, z: 17.6, kind: 'vending', label: '販賣機'},
    {x: -10.6, z: 17.8, kind: 'fountain', label: '直飲台'},
    {x: -5.0, z: 11.9, kind: 'gym_notice', label: '看公告欄'},
    {x: 5.0, z: 11.9, kind: 'gym_directory', label: '看樓層指引'}
  ],
  wallsFade: {front: [0, 0, -1], back: [0, 0, 1], left: [1, 0, 0], right: [-1, 0, 0]},
  /* ===== 第二階段（v3，LAWWW2-B 2026-10-16）：3F 主球場＝另一個區域 gym_arena（tools/blender/env_second/gym_arena.py → gym_arena.glb）=====
     BB_151 第 4b 節：樓板 51×42 m、挑高約 23 m；3～5 樓看台（固定座位＋伸縮看台）；典禮、演講、演唱會都在這裡，畢業生坐在場地上、家長坐 4、5 樓。
     這一版：場地（44×39 m，北端 z −22～−17 是活動時放舞台的地方）＋東、西、南三面的下層看台（3F，12 排，走道可以走上去坐）＋上層看台（4、5F，看得到、走不到：
     樓梯口在看台後面的走廊，這一版不做走廊）。玩家從 1F 大廳西側的樓梯上來，走南邊看台中間的入口通道（vomitory）進到場地。
     座標：區域中心在原點、x 往東、z 往南；y＝場地地板 0。 */
  arena: {
    id: 'gym_arena', name: '綜合體育館 3F 主球場', glb: 'assets/models/env/second_ai/gym_arena.glb', h: 23.0,
    floor: {x0: -22, x1: 22, z0: -22, z1: 17, note: '整片場地都能走（木地板）；北端 z −22～−17 平常空著，活動時放舞台'},
    court: {basketball: {x: 0, z: -2, len: 28, wid: 15, axis: 'z'}, volleyball: {x: 0, z: -2, len: 18, wid: 9}, hoops: [[0, -14.43], [0, 10.43]], note: '籃架：從屋頂吊下來（地上沒東西擋路）'},
    stands: [
      {side: 'east', axis: 'x', dir: 1, front: 22, along: [-17, 17], yaw: -Math.PI / 2},
      {side: 'west', axis: 'x', dir: -1, front: -22, along: [-17, 17], yaw: Math.PI / 2},
      {side: 'south', axis: 'z', dir: 1, front: 17, along: [-22, 22], yaw: Math.PI, gap: [-2.0, 2.0]}
    ],
    standRows: {rows: 12, tread: 0.85, rise: 0.42, h0: 0.6, seatPitch: 0.5, seatH: 0.44,
      note: '第 r 排（0 起）：平台頂 y＝h0＋r×rise、深度 tread；座位在平台後半（離前緣 0.5 m），面向場地（yaw 見 stands）。最前面一排前緣有 1.0 m 的玻璃欄杆（擋住不能從場地爬上去）'},
    aisles: {w: 1.2, east: [-9, 0, 9], west: [-9, 0, 9], south: [-12, 12],
      note: '走道（樓梯）從場地 y 0 走到最上排 y 5.22：導航做斜面 {axis, ya:0, yb:5.22}（畫面上 20 階，tread 0.51、rise 0.26），兩側是座位、不能穿過。走道中間有扶手'},
    vomitory: {x0: -2.0, x1: 2.0, z0: 17.0, z1: 27.2, note: '南看台中間的入口通道（場地高度）；兩側是看台的側牆；盡頭 z 27.2＝看台後牆，是回 1F 的樓梯門（v6 ART-GYM2-INT：原本 z1 24.5，畫面上的通道比走得到的長 2.7 m、盡頭是一面素牆）'},
    upper: {rows: 10, tread: 0.8, rise: 0.5, h0: 7.6, front: 32.6, note: '4、5 樓看台：在下層看台後面、高 7.6～12.1 m（只有畫面，走不到；典禮時家長坐這裡）'},
    spawn: {x: 0, z: 21.0, yaw: Math.PI},   /* 從 1F 上來：在入口通道裡、面向場地（鏡頭在背後 4.8 m，還在通道裡）*/
    exit: {at: {x: 0, z: 26.6}, label: '下樓回大廳', to: 'gym', spawn: {x: -18.0, z: 17.6, yaw: 0}, note: '接 1F 大廳往 3F 的樓梯（stairs_up）；第一階段的「往 3F 的樓梯（今天不開放）」改成上樓'},
    sets: {
      stage: {node: 'SET_STAGE', x0: -10, x1: 10, z0: -21.6, z1: -15.6, h: 1.2, note: '舞台（共用）：深藍布幕背板、兩側上台的樓梯（x ±10.6）。典禮、演講、演唱會都要先打開這一組'},
      ceremony: {node: 'SET_CEREMONY', chairs: {x: [-17.4, 17.4], z: [-12.5, 13.5], pitch: [0.62, 1.05], aisles: [[-0.9, 0.9], [-9.4, -8.4], [8.4, 9.4]]},
        note: '畢業典禮：舞台上講台、花、背板上的米色長布（不寫校名）；場地上整片折疊椅（畢業生）'},
      lecture: {node: 'SET_LECTURE', chairs: {x: [-9.0, 9.0], z: [-12.5, -2.0], pitch: [0.62, 1.05], aisles: [[-0.9, 0.9]]}, note: '演講：講台＋投影幕；椅子少一點'},
      concert: {node: 'SET_CONCERT', barrier: {z: -12.6, x: [-12, 12]}, foh: {x: 0, z: 6.0, w: 4.0, d: 3.0}, note: '演唱會：兩座燈架塔＋上方桁架、喇叭、舞台前的鐵馬（隔出搖滾區）、場地中間的控台'}
    },
    interact: [
      {x: 0.0, z: 15.6, kind: 'arena_look', label: '看主球場'},
      {x: 0.0, z: -14.8, kind: 'arena_screen', label: '大螢幕'}
    ],
    note: '每一套布置打開時：導航加椅子區的阻擋（留走道）、座位照 chairs 產生（面向舞台 yaw 0 → 面向 −z）；演唱會的鐵馬、控台要擋'
  },
  /* ===== 第三階段（v4，LAWWW2-B 2026-10-16）：B1＝另一個區域 gym_b1（tools/blender/env_second/gym_b1.py → gym_b1.glb）=====
     BB_151：B1 有溫水游泳池（7 水道）、健身中心、服務櫃台（學生證進場）；每月第四個週一健身中心、游泳池休館。BB_124 7-4：第一次辦會員證。
     這一版：東邊的大廳（樓梯下來、服務櫃台、閘門）→ 中間的走廊 → 走廊南邊是健身中心（鏡牆、有氧區、自由重量區）、北邊是游泳池（25 m × 7 水道，只到池邊）。
     更衣室、壁球室、桌球室、舞蹈室：門關著、門牌寫名稱（D38 看得懂的關閉）。器材是 BB-B 的 gym_b1_props.glb（GYM-P1），在 Blender 裡照下面的 equipment 擺進 gym_b1.glb。
     v5：BB-B 的 gym_b1_entry.glb（GYM-P2／P3a，c561cbfe）服務櫃台、置物櫃、體重計、毛巾回收籃、飲水機、救生員椅、浮板架照 entryProps 擺進去；equipment、entryProps 每件加 size（擋導航用）；兩台划船機改並排（v4 重疊）。
     座標：區域中心在原點、x 往東、z 往南；y＝B1 地板 0。 */
  b1: {
    id: 'gym_b1', name: '綜合體育館 B1', glb: 'assets/models/env/second_ai/gym_b1.glb', h: 3.6, poolH: 7.0,
    lobby: {x0: 12, x1: 24, z0: 2, z1: 14, stairs: {x0: 16.6, x1: 19.4, z0: 8.0, z1: 14.0, note: '從 1F 下來的樓梯（往 +z 上去；樓梯底在 z 8.0），和 1F 的樓梯井上下對齊；只做到天花板的開口，上面看不到'}, note: '大廳：東南角是樓梯，服務櫃台在西側（人站在 x 13.6），閘門在 x 12 那條線上'},
    corridor: {x0: -24, x1: 12, z0: -0.2, z1: 3.0, note: '走廊（3.2 m 寬）：南邊是健身中心的玻璃牆、北邊是游泳池的牆＋門；東端 x 12 是閘門（三道）'},
    gates: {x: 12.0, z0: -0.2, z1: 3.0, lanes: 3, note: '閘門：用 1F 大廳的閘門樣式，三道各 0.9 m'},
    desk: {x: 21.0, z: 0.95, w: 2.4, d: 0.75, staff: {x: 21.0, z: 0.2}, node: 'GYM2_COUNTER', note: '服務櫃台＝BB-B 的 GYM2_COUNTER（GYM-P2，2.4×0.75 m，v5 擺進 gym_b1.glb）；客人站在 z 1.9 那一側、櫃台人員在 z 0.2'},
    fitness: {x0: -24, x1: 10, z0: 3.0, z1: 14, mirror: {z: 13.9, x0: -23, x1: 9}, door: {x0: 3.2, x1: 5.0, z: 3.0}, note: '健身中心 34×12 m：南牆整面鏡子；東半部有氧區、西半部自由重量區；地板黑色橡膠'},
    pool: {x0: -24, x1: 24, z0: -24, z1: -0.2, h: 7.0, basin: {x0: -12.5, x1: 12.5, z0: -21.0, z1: -3.5, depth: 1.4, lanes: 7}, door: {x0: -5.0, x1: -3.2, z: -0.2},
      note: '游泳池 25 m（沿 x）× 17.5 m（7 水道，每道 2.5 m）；池邊 3.3～11.5 m；池子不能走（導航擋住整個池子），池邊可以走'},
    closedDoors: [
      {x: -10.0, z: -0.2, face: 'south', label: '男更衣室', note: '走廊北牆（游泳池那一側），門面向走廊'},
      {x: -14.0, z: -0.2, face: 'south', label: '女更衣室'},
      {x: -24.0, z: 1.4, face: 'east', label: '壁球室・桌球室', note: '走廊西端'}
    ],
    equipment: [
      {node: 'GYM_TREADMILL', at: [[-0.5, 12.4], [1.2, 12.4], [2.9, 12.4], [4.6, 12.4], [6.3, 12.4]], ry: 0, size: [0.85, 2.0], note: '跑步機面向南邊的鏡牆'},
      {node: 'GYM_BIKE', at: [[-0.5, 9.4], [1.0, 9.4], [2.5, 9.4], [4.0, 9.4]], ry: 0, size: [0.55, 1.2]},
      {node: 'GYM_ROWER', at: [[7.4, 8.5], [7.4, 9.9]], ry: Math.PI / 2, size: [0.6, 2.4], note: 'v5：兩台並排（v4 兩台在同一條線上、頭尾重疊 0.8 m）'},
      {node: 'GYM_SQUAT_RACK', at: [[-21.5, 11.4], [-18.4, 11.4]], ry: 0, size: [1.3, 1.2]},
      {node: 'GYM_SMITH', at: [[-15.0, 11.4]], ry: 0, size: [2.1, 1.4]},
      {node: 'GYM_DB_RACK', at: [[-9.0, 13.3]], ry: Math.PI, size: [2.0, 0.7]},
      {node: 'GYM_BENCH', at: [[-10.6, 10.0], [-8.6, 10.0], [-6.6, 10.0]], ry: 0, size: [0.6, 1.35]},
      {node: 'GYM_MAT', at: [[-21.0, 5.0], [-19.6, 5.0], [-18.2, 5.0], [-16.8, 5.0]], ry: 0, size: [0.6, 1.8], walk: true, note: '平放的墊子，可以走過去（不擋導航）'}
    ],
    entryProps: [
      {node: 'GYM2_COUNTER', at: [[21.0, 0.95]], ry: 0, size: [2.4, 0.75], note: '大廳的服務櫃台（同 desk）'},
      {node: 'GYM2_LOCKERS', at: [[9.755, 4.4], [9.755, 6.3]], ry: -Math.PI / 2, size: [1.8, 0.45], note: '健身中心東牆的置物櫃（12 格×2），面向西邊場內'},
      {node: 'GYM2_SCALE', at: [[9.7, 7.85]], ry: -Math.PI / 2, size: [0.4, 0.5], note: '置物櫃旁的體重計'},
      {node: 'GYM2_TOWEL_BIN', at: [[5.6, 3.45]], ry: 0, size: [0.46, 0.46], note: '健身中心門口內側的毛巾回收籃'},
      {node: 'GYM2_WATER', at: [[6.0, 0.01]], ry: 0, size: [0.42, 0.38], note: '走廊北牆的飲水機（健身中心門口斜對面），面向走廊'},
      {node: 'GYM2_LIFEGUARD', at: [[14.2, -12.0]], ry: -Math.PI / 2, size: [0.72, 1.0], note: '池子東邊池畔的救生員高椅，面向池子'},
      {node: 'GYM2_KICKBOARD_RACK', at: [[-6.0, -0.52]], ry: Math.PI, size: [0.6, 0.3], note: '泳池門口西側、靠走廊牆的浮板架'}
    ],
    sizeNote: 'size＝[器材本身的 x 寬, z 長]（旋轉前，公尺）；遊戲端擋導航時照 ry 轉；walk: true 的不擋',
    noteFacing: '器材原點在底面中心、正面 +z（使用者面向 +z）。鏡牆在南（z 13.9）＝+z，所以面向鏡子的器材 ry＝0；啞鈴架靠著鏡牆、架子正面朝場內，ry＝π',
    spawn: {x: 18.0, z: 7.0, yaw: Math.PI},
    exit: {at: {x: 18.0, z: 7.8}, label: '上樓回大廳', to: 'gym', spawn: {x: 18.0, z: 18.2, yaw: Math.PI}, note: '接 1F 大廳往 B1 的樓梯（stairs_down）；第一階段的「往 B1 的樓梯（今天不開放）」改成下樓'},
    poolBenches: [[-21.0, -1.0], [-18.6, -1.0], [18.6, -1.0], [21.0, -1.0]],
    poolBenchNote: '池邊長椅（2.0×0.4，面向北邊的泳池 yaw π；座位點在長椅中間往南 0.1）',
    interact: [
      {x: 21.0, z: 2.0, kind: 'gym_b1_desk', label: '服務櫃台（學生證、會員同意書）'},
      {x: 4.1, z: 2.4, kind: 'gym_fitness', label: '健身中心'},
      {x: 0.0, z: -2.0, kind: 'pool_look', label: '看游泳池'},
      {x: -10.0, z: 0.8, kind: 'closed_locker_m', label: '男更衣室'}, {x: -14.0, z: 0.8, kind: 'closed_locker_f', label: '女更衣室'}
    ]
  }
};
if (typeof module !== 'undefined') module.exports = GYM_LAYOUT;
