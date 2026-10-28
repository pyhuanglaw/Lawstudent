/* 溫州街小公園（擴大版，ART-WZ1；LAWWW2-B 2026-10-16）。AA_164 第 5 節＋使用者 10-16「公園也要擴大」（約 28×18 m）。
   座標＝溫州街區域的世界座標（x 往東、z 往北；主巷 z −5..5，A 側建築的外牆線 z=5）。
   形狀：沿主巷的「入口段」x 20.2–31.8、z 5–17（原本的小公園，兩旁是 A3 巷口書房、A4 林家乾麵，房子深 12 m）
        ＋房子後面的「主園區」x 8.4–36.0、z 17–29（西北角 x<11.8、z>21 是巷底那棟 F1，不算）。
        入口 A＝主巷（z=5）；入口 B＝北巷（roads[2]，x 3.25–8.25）旁、A3 後面那段 x=8.4、z 17–21。總面積約 470 m²。
   這份檔案給 LAWWW-B 改 zones3d.js（導航格、碰撞、互動點、座位）用；Blender 模型（tools/blender/env_second/wz_park.py）讀同一份。
   blocks：導航阻擋 [x, z, 寬(x), 深(z)] 或圓 [x, z, r]（type:'circle'）。seats：{x,z,yaw,label}（yaw＝面向的方向，atan2(dx,dz)）。
   interact：AA_164 5-4 的互動點（label 與 kind；文字由 AA-B 寫、LAWWW-B 接）。season：材質依季節切換的物件名稱前綴（模型裡的節點名稱）。 */
const WZ_PARK_LAYOUT = {
  version: 3,   // v3.1（LAWWW2-C 2026-10-28，WZ-SHRINE-TRAP-1028）：遊戲場的導航阻擋只擋有遊具的南邊 2.9 m、土地公供桌擋起來（版本號不變：wz_park_unit 第 1 項照 v3）；v2（LAWWW2-B 07:3x）：公布欄、直飲台 yaw 改 π（正面朝主巷）；v3（LAWWW2-C 2026-10-27，B08／PARK-ENTRY-B-1027）：遊戲場往北 1.5 m、入口 B 的步道改走遊戲場南邊
  area: {
    front: {x0: 20.2, x1: 31.8, z0: 5.0, z1: 17.0},
    back: {x0: 8.4, x1: 36.0, z0: 17.0, z1: 29.0, cut: {x1: 11.8, z0: 21.0}},   // cut＝扣掉 F1 的角
    entranceA: {x0: 22.6, x1: 29.4, z: 5.0},
    entranceB: {x: 8.4, z0: 17.2, z1: 20.8}
  },
  // 外圍：矮牆＋杜鵑花籬（不能穿過）；後面與東側的背景公寓背面由 wenzhou_street.glb 的 P1～P4（遠景）補上
  walls: [
    {x0: 11.8, x1: 36.0, z: 29.2, h: 0.9},          // 北側矮牆（花籬在牆前）
    {x: 36.2, z0: 17.0, z1: 29.2, h: 0.9},           // 東側矮牆
    {x: 8.2, z0: 20.8, z1: 21.0, h: 0.9}             // 入口 B 北邊接 F1 的一小段
  ],
  items: [
    // 入口段（主巷這一側）
    {id: 'notice', kind: 'notice_board', x: 22.0, z: 6.3, yaw: Math.PI, note: '社區公布欄（面向主巷，5-4「看公布欄」）'},
    {id: 'fountain', kind: 'drinking_fountain', x: 29.9, z: 6.3, yaw: Math.PI},
    {id: 'bikes', kind: 'bike_rack', x: 31.0, z: 9.6, yaw: Math.PI, note: '靠東側，可以停 4 台；四格沿南北（z）排，和導航阻擋 0.7×2.6 同方向（2026-10-16 yaw π/2 → π：BB-B 發現外觀橫的、阻擋直的）'},
    {id: 'bench_f1', kind: 'bench', x: 23.6, z: 9.0, yaw: Math.PI / 2},
    {id: 'bench_f2', kind: 'bench', x: 28.4, z: 9.0, yaw: -Math.PI / 2},
    {id: 'tree_f1', kind: 'tree_camphor', x: 21.3, z: 13.6},
    {id: 'tree_f2', kind: 'tree_camphor', x: 30.7, z: 13.4},
    // 主園區
    {id: 'oldtree', kind: 'tree_bischofia', x: 26.0, z: 21.2, note: '老茄苳（AA_164 5-1：公園的中心；入口 A 沿步道往北一眼看到）'},
    {id: 'ringbench', kind: 'ring_bench', x: 26.0, z: 21.2, r: 1.45, note: '樹圍圓形座椅，座面 0.45 m；貓常睡在上面'},
    {id: 'pavilion', kind: 'pavilion', x: 14.6, z: 25.2, w: 3.4, d: 3.4, note: '涼亭：石桌＋四張石凳（象棋）'},
    {id: 'playground', kind: 'playground', x: 15.2, z: 20.9, w: 5.2, d: 3.6, note: '共融式小遊戲場：橡膠地墊、溜滑梯、搖搖馬 ×2、小沙坑。v3 z 19.4 → 20.9：原本整塊壓在入口 B 往老樹的步道上（導航阻擋把 B 步道整段擋住，西北角 F1 和遊戲場之間只剩 0.8 m，從入口 B 走不進主園區：B08）'},
    {id: 'swings', kind: 'swings', x: 32.6, z: 24.8, yaw: Math.PI, w: 3.8, note: '鞦韆 ×2（WZ-P5 夜裡的鞦韆）'},
    {id: 'fit1', kind: 'fitness_waist', x: 34.6, z: 18.6, yaw: -Math.PI / 2},
    {id: 'fit2', kind: 'fitness_shoulder', x: 34.6, z: 20.4, yaw: -Math.PI / 2},
    {id: 'fit3', kind: 'fitness_leg', x: 34.6, z: 22.2, yaw: -Math.PI / 2},
    {id: 'shrine', kind: 'tudigong_shrine', x: 12.8, z: 28.1, yaw: Math.PI, note: '土地公小廟（角落，面向南）'},
    {id: 'sweetgum1', kind: 'tree_sweetgum', x: 20.4, z: 27.6, note: '楓香：12～1 月變紅（season:sweetgum）'},
    {id: 'sweetgum2', kind: 'tree_sweetgum', x: 31.4, z: 28.0},
    {id: 'bench_b1', kind: 'bench', x: 19.2, z: 21.4, yaw: Math.PI / 2, note: '看得到遊戲場的長椅（阿嬤坐的）'},
    {id: 'bench_b2', kind: 'bench', x: 29.6, z: 26.6, yaw: Math.PI},
    {id: 'lamp1', kind: 'park_lamp', x: 23.4, z: 23.4, light: 'warm', note: '樹下的暖燈'},
    {id: 'lamp2', kind: 'park_lamp', x: 30.6, z: 22.8, light: 'warm', note: '鞦韆旁的暖燈'},
    {id: 'azalea', kind: 'azalea_hedge', segments: [[12.0, 28.7, 36.0, 28.7], [35.7, 17.2, 35.7, 28.7], [20.4, 5.4, 22.4, 5.4], [29.6, 5.4, 31.6, 5.4]], note: '杜鵑花籬，3 月開花（season:azalea）'}
  ],
  // 步道：入口 A 往北到老樹的環狀步道；環狀步道往西接遊戲場與入口 B、往東接鞦韆
  paths: [
    {from: [26.0, 5.0], to: [26.0, 18.0], w: 2.2},
    {ring: [26.0, 21.2], r: 3.2, w: 1.6},
    {from: [24.16, 18.58], to: [8.4, 18.0], w: 1.4},   // v3：入口 B → 老樹環狀步道的西南側，從遊戲場南邊過（A3 後牆 z 17.0、遊戲場 z 19.1 之間）；原本 (22.8, 21.2)→(8.4, 19.0) 穿過遊戲場
    {from: [29.2, 21.6], to: [33.4, 23.4], w: 1.4},
    {from: [24.4, 24.0], to: [16.0, 25.2], w: 1.4}
  ],
  blocks: [
    {type: 'circle', x: 26.0, z: 21.2, r: 1.75},
    [14.6, 25.2, 3.6, 3.6], [15.2, 20.55, 5.2, 2.9], [32.6, 24.8, 4.0, 1.8],   // 遊戲場只擋有遊具的南邊 2.9 m（z 19.1～22.0；溜滑梯、搖搖馬、沙坑都在 z 21.72 以南），北邊 0.7 m 是平的橡膠地墊、走得過去
    //   （WZ-SHRINE-TRAP-1028，LAWWW2-C：v3 整塊 3.6 m 都擋，北緣 22.7 和涼亭西南柱子 23.5 之間只剩一排站得住，往涼亭西側、土地公的路斷了、涼亭西側變成死角；模型不用改）
    [34.6, 20.4, 1.0, 4.8], [12.8, 28.1, 1.2, 1.0], [12.55, 27.3, 1.3, 0.7], [22.0, 6.3, 1.6, 0.4],   // 土地公廟前的供桌（x 12.44～13.16、z 27.26～27.62：原本沒擋，人會穿過去）＋供桌和 F1 牆之間那一小塊（只站得下、走不出來） [29.9, 6.3, 0.6, 0.6], [31.0, 9.6, 0.7, 2.6],
    [23.6, 9.0, 0.7, 1.6], [28.4, 9.0, 0.7, 1.6], [19.2, 21.4, 0.7, 1.6], [29.6, 26.6, 1.6, 0.7],
    {type: 'circle', x: 21.3, z: 13.6, r: 0.5}, {type: 'circle', x: 30.7, z: 13.4, r: 0.5},
    {type: 'circle', x: 20.4, z: 27.6, r: 0.45}, {type: 'circle', x: 31.4, z: 28.0, r: 0.45},
    {type: 'circle', x: 23.4, z: 23.4, r: 0.5}, {type: 'circle', x: 30.6, z: 22.8, r: 0.5}
  ],
  seats: [   // 座位點＝人坐下時的位置（sitAt 直接放在這裡）：長椅＝椅子中心往前 0.06 m（和程序化長椅一樣）、圓椅＝半徑 1.30（座面 1.07～1.45 的中間）。原本往前 0.35 m，人坐在椅子前面的空中（使用者 2026-10-16：陳語彤沒有坐在椅子上）
    {x: 26.0, z: 19.9, yaw: Math.PI, label: '坐在老樹下的圓椅'},
    {x: 24.7, z: 21.2, yaw: -Math.PI / 2, label: '坐在老樹下的圓椅'},
    {x: 27.3, z: 21.2, yaw: Math.PI / 2, label: '坐在老樹下的圓椅'},
    {x: 23.66, z: 9.0, yaw: Math.PI / 2, label: '坐在小公園的長椅'},
    {x: 28.34, z: 9.0, yaw: -Math.PI / 2, label: '坐在小公園的長椅'},
    {x: 19.26, z: 21.4, yaw: Math.PI / 2, label: '坐在長椅上看孩子玩'},
    {x: 29.6, z: 26.54, yaw: Math.PI, label: '坐在後面的長椅'},
    {x: 31.7, z: 25.0, yaw: Math.PI, label: '盪鞦韆', kind: 'swing'},   // 鞦韆座位＝模型裡座板的中心（ART-PARK2：A 停在 z 25.0、B 停在 24.8，座面 0.48 m）；原本 z 24.2，人坐在鞦韆前面 0.6～0.8 m 的空中（QA-W1-VISUAL 座位檢查）
    {x: 33.5, z: 24.8, yaw: Math.PI, label: '盪鞦韆', kind: 'swing'},
    {x: 14.6, z: 24.25, yaw: 0, label: '坐在涼亭的石凳'},
    {x: 14.6, z: 26.15, yaw: Math.PI, label: '坐在涼亭的石凳'}
  ],
  interact: [
    {x: 22.0, z: 5.6, kind: 'notice', label: '看公布欄'},
    {x: 14.6, z: 23.4, kind: 'chess', label: '涼亭的象棋（08:00～11:00）'},
    {x: 12.8, z: 27.2, kind: 'shrine', label: '拜土地公'},
    {x: 29.9, z: 5.6, kind: 'fountain', label: '直飲台'}
  ],
  season: {sweetgum: 'SEASON_SWEETGUM_', azalea: 'SEASON_AZALEA_'},
  /* 二手市集（AA_420 12-2，wzlines3d.js 的 WZL.market：每月第一個週六 09:00～13:00；ART-WZ-MARKET-1023，LAWWW2-B 10-24）。模型 assets/models/env/second_ai/wz_market.glb（tools/blender/env_second/wz_market.py 讀這一份）：
     MARKET_CLEAR＝晴天：入口步道兩邊（長椅 z 9 和兩棵樟樹 z 13.5 中間）兩張摺疊桌（西：舊書、東：雜貨唱片＋陽傘）、西側樟樹下一塊地攤布（舊雜誌、玩具）；
     MARKET_RAIN＝下雨：老樹下的環狀步道兩張桌子，各有一個藍色雨棚、書蓋著透明塑膠布（WZL.MARKET.at 的 rain 互動點在南邊 (26, 18.3)）。
     stalls：每一攤的中心、轉向（yaw＝攤主面向客人的方向）、keeper＝攤主坐的位置（NPC，坐著；面向客人）。blocks：市集開的時候要擋住的導航格（[x 中心, z 中心, 寬, 深, 轉角(可省略)]；桌子、椅子、地攤布、雨棚的柱子）——只在市集時段（marketOn）擋 */
  market: {
    clear: {stalls: [{id: 'books', x: 23.55, z: 11.3, yaw: Math.PI / 2, keeper: {x: 22.75, z: 11.3, yaw: Math.PI / 2}, note: '舊書（桌上平放＋紙箱裡立著）'},
                     {id: 'misc', x: 28.45, z: 11.3, yaw: -Math.PI / 2, keeper: {x: 29.25, z: 11.3, yaw: -Math.PI / 2}, umbrella: {x: 29.35, z: 10.55, r: 1.15, h: 2.15}, note: '雜貨、舊唱片、杯盤（陽傘）'},
                     {id: 'mat', x: 23.6, z: 15.0, yaw: Math.PI / 2, keeper: {x: 22.65, z: 15.0, yaw: Math.PI / 2}, note: '地攤布：舊雜誌、童書、玩具'}],
            blocks: [[23.55, 11.3, 0.7, 1.9], [22.75, 11.3, 0.6, 0.6], [28.45, 11.3, 0.7, 1.9], [29.25, 11.3, 0.6, 0.6], [23.6, 15.0, 1.5, 1.3], [22.65, 15.0, 0.6, 0.6]]},   /* 導航格 0.5 m：小東西（椅子、凳子）至少 0.6 m 才蓋得到一格的中心 */
    rain: {stalls: [{id: 'books', x: 23.55, z: 19.15, yaw: 0.87, keeper: {x: 22.94, z: 18.64, yaw: 0.87}, canopy: {w: 2.0, d: 1.7, h: 2.05, oz: -0.3}, note: '老樹西南（環狀步道上）'},
                    {id: 'misc', x: 28.45, z: 19.15, yaw: -0.87, keeper: {x: 29.06, z: 18.64, yaw: -0.87}, canopy: {w: 2.0, d: 1.7, h: 2.05, oz: -0.3}, note: '老樹東南'}],
           blocks: [[23.32, 18.96, 2.3, 2.0, -0.87], [28.68, 18.96, 2.3, 2.0, 0.87]]}   /* 雨棚整個（含攤主的椅子）；第 5 個數＝轉角（NavGrid.blockRect 的 rot＝−yaw）*/
  }
};
if (typeof module !== 'undefined') module.exports = WZ_PARK_LAYOUT;
