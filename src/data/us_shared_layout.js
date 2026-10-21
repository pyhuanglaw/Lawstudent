/* ===== 美國交換：學姊住的 C 棟三人合租戶（208）室內配置（LAWWW2-C 2026-10-17；BB_215：US2 9/13 唯一要玩家自己走去的必要劇情）=====
   從祐廷的單人戶（src/data/us_apartment_layout.js）轉出來：同一個社區、同一套格局的廚房（窗口吧台）、客廳、走道、陽台、門外的樓梯平台，
   東半邊改成兩間臥室 A、B（門開在客廳東牆、關著；照片三：臥室門上有 A、B），衛浴、衣物間是 B 的套房；走道旁的門是臥室 C（BB_217：三扇房門、玩家不進去）；
   冰箱門上貼輪值表和便條；生活痕跡常駐；US2 的道具是 EVENT_US2 群組（平常藏著）。規格：BB_217（a1de1b90）。
   遊戲（src/us3d.js 的 us_shared）和 Blender（tools/blender/env_second/us_apartment.py -- --layout src/data/us_shared_layout.js …）讀同一份。
   必須是「const US_SHARED_LAYOUT=」後面接純 JSON。座標、yaw、ry 的規則和 us_apartment_layout.js 一樣。門號 208、207 虛構（D77）。 */
const US_SHARED_LAYOUT={
 "version": 1,
 "W": 15.2,
 "D": 10.4,
 "cell": 0.4,
 "wallT": 0.2,
 "ceilY": 2.6,
 "unit": {
  "x0": -4.6,
  "x1": 5,
  "z0": -3,
  "z1": 3
 },
 "balcony": {
  "x0": -2.6,
  "x1": 0.2,
  "z0": -4.6,
  "z1": -3,
  "rail": 1.05,
  "railMat": "wood_brown",
  "note": "內凹的陽台：兩側是外牆，前面是咖啡色木欄杆（外觀照片）"
 },
 "breezeway": {
  "x0": -2.6,
  "x1": 2.2,
  "z0": 3,
  "z1": 5,
  "floor": "concrete",
  "roof": true,
  "rail": {
   "side": "S",
   "h": 1.05,
   "mat": "white_metal"
  },
  "posts": [
   [
    -2.4,
    4.85
   ],
   [
    2,
    4.85
   ]
  ],
  "stairs": {
   "x0": 2.2,
   "x1": 5,
   "z0": 3.4,
   "z1": 4.6,
   "dir": "E",
   "down": true,
   "note": "往下到停車場（畫面上看得到第一段；走到平台東端就出門）"
  },
  "note": "戶外樓梯平台：有屋頂、白柱子、欄杆；看出去是停車場、對面的公寓、樹林。牆上一盞壁燈、門牌"
 },
 "rooms": [
  {
   "id": "living",
   "x0": -4.6,
   "x1": 1.4,
   "z0": -3,
   "z1": 1,
   "floor": "wood",
   "name": "客廳"
  },
  {
   "id": "kitchen",
   "x0": -4.6,
   "x1": -1.8,
   "z0": 1,
   "z1": 3,
   "floor": "wood",
   "name": "廚房"
  },
  {
   "id": "hallway",
   "x0": -1.8,
   "x1": -0.2,
   "z0": 1,
   "z1": 3,
   "floor": "wood",
   "name": "走道"
  },
  {
   "id": "bedC",
   "x0": -0.2,
   "x1": 0.6,
   "z0": 1,
   "z1": 1.8,
   "floor": "wood",
   "name": "臥室 C（門口）",
   "walk": false,
   "note": "第三個室友的房門（門在走道；房間不做，玩家不進去：BB_217）"
  },
  {
   "id": "laundry",
   "x0": -0.2,
   "x1": 0.6,
   "z0": 1.8,
   "z1": 3,
   "floor": "wood",
   "name": "洗衣機櫃",
   "walk": false
  },
  {
   "id": "bath",
   "x0": 0.6,
   "x1": 3,
   "z0": 1,
   "z1": 3,
   "floor": "tile",
   "name": "衛浴"
  },
  {
   "id": "closet",
   "x0": 3,
   "x1": 5,
   "z0": 1,
   "z1": 3,
   "floor": "carpet",
   "name": "衣物間"
  },
  {
   "id": "bedA",
   "x0": 1.4,
   "x1": 5.0,
   "z0": -3.0,
   "z1": -1.0,
   "floor": "carpet",
   "name": "臥室 A",
   "walk": false
  },
  {
   "id": "bedB",
   "x0": 1.4,
   "x1": 5.0,
   "z0": -1.0,
   "z1": 1.0,
   "floor": "carpet",
   "name": "臥室 B",
   "walk": false
  }
 ],
 "walls": [
  {
   "note": "外牆＋隔間（遊戲依這些擋導航；Blender 照這些蓋）。open＝牆上的開口 [a,b]（沿牆的座標）；sill／head＝開口的下緣、上緣（沒寫就是落地、門高 2.05）",
   "list": [
    {
     "id": "N",
     "axis": "x",
     "at": -3,
     "from": -4.6,
     "to": 5,
     "open": [
      [
       -3.8,
       -2.6,
       "window"
      ],
      [
       -1.4,
       -0.6,
       "patioDoor"
      ],
      [
       2.6,
       3.8,
       "window"
      ]
     ],
     "fade": true,
     "dir": [
      0,
      0,
      1
     ]
    },
    {
     "id": "S",
     "axis": "x",
     "at": 3,
     "from": -4.6,
     "to": 5,
     "open": [
      [
       -1.4,
       -0.6,
       "frontDoor"
      ]
     ],
     "note": "南牆＝樓梯平台那一面：玩家在平台上時不淡出（看得到大門）；玩家在屋裡、鏡頭退到平台那一側時才淡出（us3d.js 的 fadeInside；之前一律不淡出，鏡頭會卡在壁板裡）",
     "fade": true,
     "dir": [
      0,
      0,
      -1
     ],
     "fadeInside": true
    },
    {
     "id": "W",
     "axis": "z",
     "at": -4.6,
     "from": -3,
     "to": 3,
     "fade": true,
     "dir": [
      1,
      0,
      0
     ]
    },
    {
     "id": "E",
     "axis": "z",
     "at": 5,
     "from": -3,
     "to": 3,
     "fade": true,
     "dir": [
      -1,
      0,
      0
     ]
    },
    {
     "id": "kit_n",
     "axis": "x",
     "at": 1,
     "from": -4.6,
     "to": -1.8,
     "open": [
      [
       -4.2,
       -2.2,
       "passThrough"
      ]
     ],
     "sill": 1.05,
     "head": 2.05,
     "fade": true,
     "dir": [
      0,
      0,
      1
     ],
     "note": "廚房朝客廳的牆：窗口下緣 1.05（吧台），上緣 2.05；窗口上方看得到廚房的吊櫃。隔間會淡出（partition：鏡頭和玩家在牆的不同邊才淡出——ART-US2-FIX-1018）"
    },
    {
     "id": "kit_e",
     "axis": "z",
     "at": -1.8,
     "from": 1,
     "to": 3,
     "open": [
      [
       1.4,
       2.2,
       "kitchenDoor"
      ]
     ],
     "fade": true,
     "dir": [
      -1,
      0,
      0
     ],
     "note": "廚房從走道進（沒有門板）。隔間會淡出（同 kit_n）"
    },
    {
     "id": "lau_w",
     "axis": "z",
     "at": -0.2,
     "from": 1,
     "to": 3,
     "open": [
      [
       1,
       1.8,
       "coatDoor"
      ],
      [
       1.8,
       3,
       "laundryDoors"
      ]
     ],
     "note": "走道東牆：儲藏室的門、洗衣機櫃的百葉摺門（都關著）"
    },
    {
     "id": "coat_n",
     "axis": "x",
     "at": 1,
     "from": -0.2,
     "to": 0.6,
     "note": "衣帽櫃的北牆（客廳那一面）"
    },
    {
     "id": "lau_n",
     "axis": "x",
     "at": 1.8,
     "from": -0.2,
     "to": 0.6
    },
    {
     "id": "bath_w",
     "axis": "z",
     "at": 0.6,
     "from": 1,
     "to": 3
    },
    {
     "id": "bath_n",
     "axis": "x",
     "at": 1,
     "from": 0.6,
     "to": 5,
     "open": [
      [
       1.8,
       2.6,
       "bathDoor"
      ],
      [
       3.4,
       4.2,
       "closetDoor"
      ]
     ],
     "fade": true,
     "dir": [
      0,
      0,
      -1
     ],
     "note": "衛浴＋衣物間的北牆＝臥室 B 的南牆（衛浴、衣物間從臥室 B 進：B 的套房，門關著）"
    },
    {
     "id": "bath_e",
     "axis": "z",
     "at": 3,
     "from": 1,
     "to": 3
    },
    {
     "id": "tub_e",
     "axis": "z",
     "at": 2.22,
     "from": 2.17,
     "to": 3,
     "note": "浴缸東端的短牆（美國的浴缸通常三面是牆；ART-US4 的浴簾桿東端靠這裡；AA-B 問、LAWWW2-B 13:2x 選 a）"
    },
    {
     "id": "bed_w",
     "axis": "z",
     "at": 1.4,
     "from": -3,
     "to": 1,
     "open": [
      [
       -2.6,
       -1.8,
       "bedroomDoorA"
      ],
      [
       -0.6,
       0.2,
       "bedroomDoorB"
      ]
     ],
     "fade": true,
     "dir": [
      1,
      0,
      0
     ],
     "note": "臥室 A、B 的門都開在客廳的東牆（照片三：臥室門上有 A、B），門關著"
    },
    {
     "id": "bal_w",
     "axis": "z",
     "at": -2.6,
     "from": -4.6,
     "to": -3,
     "note": "陽台兩側的外牆"
    },
    {
     "id": "bal_e",
     "axis": "z",
     "at": 0.2,
     "from": -4.6,
     "to": -3
    },
    {
     "id": "bed_ab",
     "axis": "x",
     "at": -1.0,
     "from": 1.4,
     "to": 5.0,
     "fade": true,
     "dir": [
      0,
      0,
      1
     ],
     "partition": 1,
     "note": "臥室 A｜臥室 B"
    }
   ]
  }
 ],
 "doors": [
  {
   "id": "front",
   "x": -1,
   "z": 3,
   "w": 0.9,
   "label": "大門",
   "plate": "208",
   "openDoor": true,
   "style": "sixPanelWhite",
   "note": "門號虛構；門外是 C 棟的樓梯平台"
  },
  {
   "id": "bedA",
   "x": 1.4,
   "z": -2.2,
   "w": 0.8,
   "axis": "z",
   "label": "臥室 A",
   "plate": "A",
   "closed": "臥室 A。門關著。",
   "style": "sixPanelWhite",
   "deco": "whiteboard"
  },
  {
   "id": "bedB",
   "x": 1.4,
   "z": -0.2,
   "w": 0.8,
   "axis": "z",
   "label": "臥室 B",
   "plate": "B",
   "closed": "臥室 B。門關著。",
   "style": "sixPanelWhite",
   "deco": "coat",
   "note": "門後掛勾掛著一件外套（BB_217 §1：一扇貼便條、一扇掛外套、一扇什麼都沒有；§7-4，2026-10-21 由海報改）"
  },
  {
   "id": "bath",
   "x": 2.2,
   "z": 1,
   "w": 0.8,
   "label": "衛浴",
   "closed": "衛浴。",
   "style": "sixPanelWhite",
   "note": "從臥室 B 進"
  },
  {
   "id": "bedC",
   "x": -0.2,
   "z": 1.4,
   "w": 0.8,
   "axis": "z",
   "label": "臥室 C",
   "closed": "臥室 C。門關著。",
   "style": "sixPanelWhite",
   "plate": "C",
   "deco": "sticker"
  },
  {
   "id": "closet",
   "x": 3.8,
   "z": 1,
   "w": 0.8,
   "label": "衣物間",
   "closed": "衣物間。",
   "style": "sixPanelWhite"
  },
  {
   "id": "laundry",
   "x": -0.2,
   "z": 2.4,
   "w": 1.2,
   "axis": "z",
   "label": "洗衣機",
   "closed": "洗衣機和烘衣機疊在一起。",
   "style": "louverBifold"
  },
  {
   "id": "patio",
   "x": -1,
   "z": -3,
   "w": 0.8,
   "label": "陽台",
   "glass": true,
   "note": "單扇的玻璃門（整片玻璃＋百葉），不是拉門"
  },
  {
   "id": "n207",
   "x": -2.6,
   "z": 4,
   "w": 0.9,
   "axis": "z",
   "label": "207",
   "plate": "207",
   "closed": "207。門關著。",
   "breezeway": true
  }
 ],
 "windows": [
  {
   "room": "living",
   "side": "N",
   "x0": -3.8,
   "x1": -2.6,
   "y0": 0.9,
   "y1": 2.1,
   "blinds": true,
   "curtains": "黑白圓圈圖案的落地窗簾（照片一）"
  },
  {
   "room": "living",
   "side": "N",
   "x0": -1.4,
   "x1": -0.6,
   "y0": 0,
   "y1": 2.05,
   "door": "patio",
   "blinds": true
  },
  {
   "room": "bedA",
   "side": "N",
   "x0": 2.6,
   "x1": 3.8,
   "y0": 0.9,
   "y1": 2.1,
   "blinds": true
  }
 ],
 "exit": {
  "x": 2,
  "z": 4,
  "r": 1,
  "label": "出門",
  "to": "us_outside",
  "note": "平台東端的樓梯；外面是社區（C 棟）"
 },
 "spawns": {
  "fromOutside": {
   "x": 0.4,
   "z": 4,
   "yaw": -1.5708,
   "note": "從外面回來：剛爬上樓梯，面向西（看得到大門）"
  },
  "entry": {
   "x": -1,
   "z": 2.2,
   "yaw": 3.1416,
   "note": "一進門：走道，面向北（客廳）"
  },
  "kitchen": {
   "x": -3.0,
   "z": 1.8,
   "yaw": 3.1416,
   "note": "廚房中間、面向北（窗口吧台）"
  }
 },
 "furniture": [
  {
   "type": "fridge",
   "room": "kitchen",
   "x": -4.2,
   "z": 1.8,
   "w": 0.8,
   "d": 0.75,
   "ry": 1.5708,
   "use": "fridge",
   "note": "白色"
  },
  {
   "type": "counterRun",
   "room": "kitchen",
   "x0": -4.6,
   "x1": -1.8,
   "z0": 2.4,
   "z1": 3,
   "h": 0.92,
   "note": "南牆的流理台（西南角是轉角櫃）：花崗石檯面（深色斑點）、楓木色上下櫃"
  },
  {
   "type": "range",
   "room": "kitchen",
   "x": -3.4,
   "z": 2.7,
   "ry": 3.1416,
   "use": "cook",
   "note": "爐子＋烤箱，上面微波爐（照片三）"
  },
  {
   "type": "sink",
   "room": "kitchen",
   "x": -2.7,
   "z": 2.7,
   "ry": 3.1416
  },
  {
   "type": "dishwasher",
   "room": "kitchen",
   "x": -2.1,
   "z": 2.7,
   "ry": 3.1416
  },
  {
   "type": "passShelf",
   "room": "kitchen",
   "x0": -4,
   "x1": -2.2,
   "z": 1.15,
   "h": 1.05,
   "note": "窗口內側的檯面（廚房那一邊）"
  },
  {
   "type": "breakfastBar",
   "room": "living",
   "x0": -4.1,
   "x1": -2.1,
   "z": 0.82,
   "d": 0.36,
   "h": 1.05,
   "note": "窗口外側的吧台（花崗石，客廳這一側懸出）"
  },
  {
   "type": "barStool",
   "room": "living",
   "x": -3.6,
   "z": 0.4,
   "ry": 0,
   "seat": true,
   "seatY": 0.76,
   "note": "黑色椅面、鍍鉻腳（照片三）；US2：祐廷坐這裡，坐下＝演出開始（BB_217）"
  },
  {
   "type": "barStool",
   "room": "living",
   "x": -2.6,
   "z": 0.4,
   "ry": 0,
   "seat": true,
   "seatY": 0.76,
   "note": "US2：祐廷坐這裡，坐下＝演出開始（BB_217）"
  },
  {
   "type": "sofa",
   "room": "living",
   "x": -4.15,
   "z": -1.2,
   "w": 2,
   "d": 0.9,
   "ry": 1.5708,
   "seat": true,
   "note": "黑色皮沙發，靠西牆、面向東"
  },
  {
   "type": "endTable",
   "room": "living",
   "x": -4.25,
   "z": -2.55,
   "note": "沙發旁的小桌＋桌燈（黑色底座、圖案燈罩）"
  },
  {
   "type": "armchair",
   "room": "living",
   "x": -3.2,
   "z": -2.4,
   "ry": 0.8,
   "seat": true,
   "note": "黑色皮單人沙發，窗邊的角落"
  },
  {
   "type": "coffeeTable",
   "room": "living",
   "x": -3,
   "z": -1.2,
   "w": 0.6,
   "d": 1.1,
   "note": "深色木頭"
  },
  {
   "type": "rug",
   "room": "living",
   "x": -3.1,
   "z": -1.2,
   "w": 2,
   "d": 2.6,
   "note": "橘紅色的地毯"
  },
  {
   "type": "ladderShelf",
   "room": "living",
   "x": -0.1,
   "z": -2.85,
   "note": "黑色的梯子形壁架（玻璃門和電視之間）"
  },
  {
   "type": "tvStand",
   "room": "living",
   "x": 1.12,
   "z": -1.2,
   "w": 1.1,
   "ry": -1.5708,
   "note": "東牆兩扇臥室門中間，面向沙發；黑色。第一版斜放在角落、正好在臥室 A 門口，和行李箱中間的縫比人窄，臥室 A 門口走不到（LAWWW-C 10-18 reachability_all）"
  },
  {
   "type": "ceilingFan",
   "room": "living",
   "x": -1.6,
   "z": -1,
   "note": "白色五葉＋四個燈罩（照片一、三）"
  },
  {
   "type": "thermostat",
   "room": "living",
   "x": 1.3,
   "z": 0.4,
   "y": 1.5,
   "ry": -1.5708
  },
  {
   "type": "ceilingLight",
   "room": "bedA",
   "x": 3.2,
   "z": -2.0,
   "note": "吸頂燈（照片一的臥室看得到）"
  },
  {
   "type": "tub",
   "room": "bath",
   "x0": 0.6,
   "x1": 2.16,
   "z0": 2.17,
   "z1": 3,
   "note": "浴缸淋浴兩用（南牆）"
  },
  {
   "type": "toilet",
   "room": "bath",
   "x": 0.95,
   "z": 1.45,
   "ry": 1.5708,
   "note": "靠西牆、面向東"
  },
  {
   "type": "vanity",
   "room": "bath",
   "x0": 2.45,
   "x1": 3,
   "z0": 1.4,
   "z1": 2.6,
   "note": "洗手台＋鏡子（東牆、面向西）"
  },
  {
   "type": "closetRods",
   "room": "closet",
   "note": "吊衣桿、層架"
  },
  {
   "type": "washerDryer",
   "room": "laundry",
   "x": 0.2,
   "z": 2.4,
   "note": "上下疊"
  },
  {
   "type": "balconyChairs",
   "x": -1.6,
   "z": -4.1,
   "n": 2,
   "chairs": [
    [
     -2.15,
     -4.1,
     0.2
    ],
    [
     -1.05,
     -4.1,
     -0.2
    ]
   ],
   "table": {
    "x": -1.6,
    "z": -4.15,
    "r": 0.3
   },
   "note": "ART-US4：兩張木條折疊椅面向欄杆（chairs＝x、z、轉角），中間小圓桌（直徑 0.6）"
  },
  {
   "type": "breezewaySconce",
   "x": -0.2,
   "z": 3.05,
   "y": 2
  },
  {
   "type": "doorMat",
   "x": -1,
   "z": 3.4
  },
  {
   "type": "bed",
   "room": "bedA",
   "x": 3.93,
   "z": -2.0,
   "w": 1.4,
   "d": 2.0,
   "ry": -1.5708,
   "note": "室友的床（門關著，只在剖面看得到）"
  },
  {
   "type": "nightstand",
   "room": "bedA",
   "x": 4.7,
   "z": -2.85,
   "ry": -1.5708
  },
  {
   "type": "desk",
   "room": "bedA",
   "x": 2.2,
   "z": -2.66,
   "w": 1.2,
   "d": 0.55,
   "ry": 0
  },
  {
   "type": "deskChair",
   "room": "bedA",
   "x": 2.2,
   "z": -2.15,
   "ry": 3.1416
  },
  {
   "type": "bed",
   "room": "bedB",
   "x": 3.93,
   "z": 0.0,
   "w": 1.4,
   "d": 2.0,
   "ry": -1.5708,
   "note": "學姊的床（門關著）"
  },
  {
   "type": "desk",
   "room": "bedB",
   "x": 2.2,
   "z": 0.66,
   "w": 1.2,
   "d": 0.55,
   "ry": 3.1416
  },
  {
   "type": "deskChair",
   "room": "bedB",
   "x": 2.2,
   "z": 0.15,
   "ry": 0
  },
  {
   "type": "choreChart",
   "room": "kitchen",
   "x": -3.725,
   "z": 1.8,
   "y": 1.25,
   "w": 0.24,
   "h": 0.32,
   "face": "E",
   "note": "冰箱門上的手寫輪值表（倒垃圾、洗碗；A／B／C 三格輪，BB_98 2-6、BB_217）＋旁邊兩張便條"
  },
  {
   "type": "lifeBlanket",
   "room": "living",
   "x": -4.15,
   "z": -1.6,
   "note": "沙發上的毯子（BB_217）"
  },
  {
   "type": "lifeSuitcase",
   "room": "living",
   "x": 0.9,
   "z": 0.55,
   "ry": -0.3,
   "note": "沒收完的行李箱（BB_217；室友剛搬進來）"
  },
  {
   "type": "lifePlant",
   "room": "living",
   "x": 1.16,
   "z": -2.76,
   "note": "快乾的盆栽（BB_217；電視櫃旁的角落）"
  },
  {
   "type": "lifeRice",
   "room": "kitchen",
   "x": -3.6,
   "z": 2.28,
   "note": "一袋米（地上，冰箱和流理台中間；BB_217）"
  },
  {
   "type": "lifeSoy",
   "room": "kitchen",
   "x": -2.95,
   "z": 2.75,
   "y": 0.92,
   "note": "一罐醬油（流理台上，水槽旁；BB_217）"
  },
  {
   "type": "lifeBowls",
   "room": "kitchen",
   "x": -2.4,
   "z": 2.78,
   "y": 0.92,
   "note": "瀝水架上三種不同的碗（BB_217）"
  },
  {
   "type": "ceilingLight",
   "room": "kitchen",
   "x": -3.2,
   "z": 2.0,
   "note": "廚房的吸頂燈（BB_217 §7-2：9/13 傍晚廚房開著燈；燈的位置和 us3d.js 的 PointLight (−3.2, 2.0) 一樣）"
  },
  {
   "type": "lifeWallArt",
   "room": "living",
   "x": -4.5,
   "z": -1.2,
   "y": 1.72,
   "w": 0.9,
   "h": 0.6,
   "note": "沙發上方的西牆：裱框的風景版畫（虛構、沒有字；BB_217 §7-3 客廳牆面很空）"
  },
  {
   "type": "lifePhotoString",
   "room": "living",
   "wall": "W",
   "z0": -2.86,
   "z1": -2.32,
   "y": 1.66,
   "note": "西牆北端（沙發和牆角中間、檯燈上方）：麻繩夾著四張拍立得照片（照片是色塊，沒有人臉；BB_217 §7-3）。第一版放北牆窗戶左邊，被窗簾擋住"
  },
  {
   "type": "eventUS2",
   "room": "kitchen",
   "note": "US2（9/13 18:30～19:30）的道具：EVENT_US2 群組，平常藏著、演出時打開（BB_217）：爐子上的鍋＋長筷子、紅黃兩包沒有字的泡麵（窗口內側的檯面）、三個不同的碗、紅筆圈滿的英文報告（吧台、祐廷那一側＝客廳那一邊）",
   "pot": {
    "x": -3.4,
    "z": 2.7,
    "y": 0.92
   },
   "noodles": {
    "x": -3.0,
    "z": 1.18,
    "y": 1.05
   },
   "bowls": {
    "x": -2.6,
    "z": 1.18,
    "y": 1.05
   },
   "report": {
    "x": -3.6,
    "z": 0.78,
    "y": 1.05
   }
  }
 ],
 "materials": {
  "note": "和祐廷的單人戶同一個社區、同一套裝潢（照片）",
  "wall": "暖米色（客廳偏米黃、廚房走道偏奶油白）",
  "trim": "白色踢腳板、門框；白色六格門板",
  "floor": "木紋地板（紅棕色，Poly Haven laminate_floor_02 調暖）",
  "bedroom": "米灰色地毯",
  "counter": "深色花崗石",
  "cabinet": "楓木色",
  "ceiling": "白色；走道上方有一段降板（照片三）"
 },
 "eventProps": {
  "note": "US2 的道具在 EVENT_US2 群組（平常藏著）：BB_217。學姊站爐子前；祐廷坐窗口吧台外側的高腳椅；只有兩個人"
 },
 "season": {
  "note": "窗景、陽台的積雪兩套：雪（1～3 月）、春（4～6 月）；日／夜各一張。窗外是社區的停車場、對面同樣的灰褐色壁板公寓、遠一點的樹林"
 },
 "unitName": "C 棟 208（三人合租：學姊、兩個室友）"
};
