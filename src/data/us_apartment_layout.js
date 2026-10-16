/* ===== 美國交換：校外學生公寓社區的單人房（大三下，D47）室內配置（LAWWW2-B 2026-10-16 提案 v1；還沒接進遊戲）=====
   使用者 2026-10-16 直接指示：「美國宿舍不能沿用。美國宿舍我是住在自己租的社區。我租單人房，有自己房間、客廳、廚房。」
   → 不是學校宿舍、沒有公用廚房：祐廷租校外學生公寓社區的「一房一廳一衛＋廚房＋陽台」（1x1）。
   參考（查證，只取特徵，遊戲裡不寫真實社區名，D77）：布魯明頓東邊的三層樓學生公寓社區，約 180 戶；1x1 約 613 平方英尺（約 57 m²）、一房一衛；
     花崗石流理台、烤箱、微波爐、洗碗機、屋內洗衣機與烘衣機、陽台、吊扇；社區有健身房、游泳池、烤肉區、24 小時櫃台、門禁；旁邊是自然保護區步道、購物中心；搭公車去校園。
   這份配置給遊戲（LAWWW-B 建區域：導航格、互動點、出生點；格式比照 src/data/dorm_layout.js）和 Blender（tools/blender/env_second/us_apartment.py）共用。
   必須是「const US_APARTMENT_LAYOUT=」後面接純 JSON。
   座標：x 往東、z 往南；單位公尺；y 往上；地板 y=0、天花板 2.6（三樓的單位可以是斜頂，先不做）。導航格 0.4 m，邊界放在「0.2 的奇數倍」（同 dorm_layout.js）。
   配置：公寓（x −4.6～5.0、z −3.0～3.0，約 57.6 m²）南邊是大樓的室內走廊（z 3.0～5.0，地毯、鄰居的門）；北邊是陽台（z −4.6～−3.0）。
     公寓裡：西南＝廚房（L 型流理台＋吧台、兩張高腳椅）；正南＝玄關（大門、洗衣機烘衣機的櫃子）；東南＝衛浴（從玄關進）；
     西北＝客廳（沙發、電視、吊扇、落地拉門到陽台）；東北＝臥室（床、書桌、衣櫃、北窗、吊扇）。
   **還沒確認的**（AA-B 依使用者指示改企劃中）：學姊住哪裡、US2（她煮泡麵）在誰的廚房、US1 抵達後的流程、香港朋友的段落。互動文字是暫定。 */
const US_APARTMENT_LAYOUT={
  "version":1,
  "W":15.2, "D":10.4, "cell":0.4, "wallT":0.2, "ceilY":2.6,
  "unit":{"x0":-4.6,"x1":5.0,"z0":-3.0,"z1":3.0},
  "balcony":{"x0":-3.4,"x1":-0.2,"z0":-4.6,"z1":-3.0,"rail":1.05},
  "hall":{"x0":-7.0,"x1":7.4,"z0":3.0,"z1":5.0,"floor":"carpet","note":"大樓的室內走廊（門禁、地毯）"},
  "rooms":[
    {"id":"kitchen","x0":-4.6,"x1":-1.4,"z0":0.6,"z1":3.0,"floor":"wood","name":"廚房"},
    {"id":"entry","x0":-1.4,"x1":1.0,"z0":0.6,"z1":3.0,"floor":"wood","name":"玄關"},
    {"id":"bath","x0":1.0,"x1":5.0,"z0":1.0,"z1":3.0,"floor":"tile","name":"衛浴"},
    {"id":"living","x0":-4.6,"x1":1.0,"z0":-3.0,"z1":0.6,"floor":"wood","name":"客廳"},
    {"id":"bedroom","x0":1.0,"x1":5.0,"z0":-3.0,"z1":1.0,"floor":"carpet","name":"臥室"}
  ],
  "walls":[
    {"note":"外牆＋隔間（遊戲依這些擋導航；Blender 照這些蓋）。open＝牆上的開口 [a,b]（沿牆的座標）","list":[
      {"id":"N","axis":"x","at":-3.0,"from":-4.6,"to":5.0,"open":[[-3.0,-1.0,"balconyDoor"],[2.2,3.8,"window"]],"fade":true,"dir":[0,0,1]},
      {"id":"S","axis":"x","at":3.0,"from":-4.6,"to":5.0,"open":[[-1.05,-0.15,"frontDoor"]],"note":"南牆＝走廊那一面（不淡出：鏡頭在走廊時才看得到門）"},
      {"id":"W","axis":"z","at":-4.6,"from":-3.0,"to":3.0,"open":[[-2.2,-0.6,"window"]],"fade":true,"dir":[1,0,0]},
      {"id":"E","axis":"z","at":5.0,"from":-3.0,"to":3.0,"fade":true,"dir":[-1,0,0]},
      {"id":"bed_w","axis":"z","at":1.0,"from":-3.0,"to":1.0,"open":[[-0.2,0.6,"bedroomDoor"]],"fade":true,"dir":[1,0,0],"note":"臥室西牆（客廳那一面）"},
      {"id":"bath_n","axis":"x","at":1.0,"from":1.0,"to":5.0,"fade":true,"dir":[0,0,1]},
      {"id":"bath_w","axis":"z","at":1.0,"from":1.0,"to":3.0,"open":[[1.4,2.2,"bathDoor"]]},
      {"id":"wd_closet","axis":"x","at":1.8,"from":0.2,"to":1.0,"note":"洗衣機烘衣機的櫃子（玄關東側，百葉門）"}
    ]}
  ],
  "doors":[
    {"id":"front","x":-0.6,"z":3.0,"w":0.9,"label":"大門","plate":"214","openDoor":true,"note":"門號虛構"},
    {"id":"bedroom","x":1.0,"z":0.2,"w":0.8,"axis":"z","label":"臥室","openDoor":true},
    {"id":"bath","x":1.0,"z":1.8,"w":0.8,"axis":"z","label":"衛浴","closed":"衛浴。"},
    {"id":"balcony","x":-2.0,"z":-3.0,"w":2.0,"label":"陽台","slider":true},
    {"id":"n212","x":-5.6,"z":3.0,"w":0.9,"label":"212","plate":"212","closed":"212。門關著。","hall":true},
    {"id":"n216","x":3.4,"z":3.0,"w":0.9,"label":"216","plate":"216","closed":"216。門關著。","hall":true},
    {"id":"n213","x":-3.0,"z":5.0,"w":0.9,"label":"213","plate":"213","closed":"213。門關著。","hall":true},
    {"id":"n215","x":2.6,"z":5.0,"w":0.9,"label":"215","plate":"215","closed":"215。門關著。","hall":true}
  ],
  "windows":[
    {"room":"living","side":"N","x0":-3.0,"x1":-1.0,"y0":0.0,"y1":2.15,"slider":true,"note":"落地拉門（陽台）"},
    {"room":"bedroom","side":"N","x0":2.2,"x1":3.8,"y0":0.9,"y1":2.1},
    {"room":"living","side":"W","z0":-2.2,"z1":-0.6,"y0":0.9,"y1":2.1}
  ],
  "exit":{"x":7.0,"z":4.0,"r":1.2,"label":"出門（下樓）","to":"us_outside","note":"走廊東端的樓梯間；外面是社區門口／公車站（之後的區域）"},
  "spawns":{
    "fromOutside":{"x":6.4,"z":4.0,"yaw":1.5708,"note":"從外面回來：走廊東端，面向西"},
    "entry":{"x":-0.6,"z":2.2,"yaw":3.1416,"note":"一進門"},
    "bedroom":{"x":2.6,"z":-1.0,"yaw":3.1416,"note":"早上醒來"}
  },
  "furniture":[
    {"type":"counterL","room":"kitchen","note":"L 型：西牆 x −4.6～−3.95（z 0.6～3.0）＋南牆 z 2.35～3.0（x −4.6～−2.2）；花崗石檯面、上下櫃","h":0.92},
    {"type":"range","room":"kitchen","x":-4.27,"z":1.5,"ry":1.5708,"use":"cook","note":"爐子＋烤箱，上面微波爐（over-the-range）"},
    {"type":"sink","room":"kitchen","x":-3.4,"z":2.67,"ry":3.1416,"note":"水槽＋旁邊洗碗機"},
    {"type":"dishwasher","room":"kitchen","x":-2.8,"z":2.67,"ry":3.1416},
    {"type":"fridge","room":"kitchen","x":-1.8,"z":2.6,"w":0.8,"d":0.75,"ry":3.1416,"use":"fridge"},
    {"type":"breakfastBar","room":"kitchen","x0":-3.95,"x1":-1.8,"z":0.8,"d":0.5,"h":0.92,"note":"吧台（朝客廳那一側懸出，坐高腳椅）"},
    {"type":"stool","room":"kitchen","x":-3.3,"z":0.2,"ry":3.1416,"seat":true,"seatY":0.75},
    {"type":"stool","room":"kitchen","x":-2.5,"z":0.2,"ry":3.1416,"seat":true,"seatY":0.75},
    {"type":"washerDryer","room":"entry","x":0.6,"z":2.4,"note":"上下疊的洗衣機烘衣機，百葉門櫃子"},
    {"type":"sofa","room":"living","x":-1.6,"z":-1.4,"w":2.0,"d":0.9,"ry":1.5708,"seat":true,"note":"面向西牆的電視"},
    {"type":"coffeeTable","room":"living","x":-2.9,"z":-1.4,"w":0.6,"d":1.1},
    {"type":"tvStand","room":"living","x":-4.35,"z":-1.4,"w":1.4,"ry":1.5708,"note":"窗在電視上方偏北：電視放在窗下的矮櫃"},
    {"type":"floorLamp","room":"living","x":-0.5,"z":-2.6},
    {"type":"ceilingFan","room":"living","x":-2.0,"z":-1.2},
    {"type":"bed","room":"bedroom","x":3.95,"z":-1.6,"w":1.4,"d":2.0,"ry":-1.5708,"use":"sleep","note":"Full；床頭靠東牆"},
    {"type":"nightstand","room":"bedroom","x":4.7,"z":-2.75},
    {"type":"desk","room":"bedroom","x":3.0,"z":-2.7,"w":1.2,"d":0.55,"ry":0,"use":"study","note":"北窗下"},
    {"type":"deskChair","room":"bedroom","x":3.0,"z":-2.1,"ry":3.1416,"seat":true},
    {"type":"closet","room":"bedroom","x0":2.8,"x1":5.0,"z":0.7,"d":0.6,"note":"拉門衣櫃（南牆）"},
    {"type":"suitcase","room":"bedroom","x":1.5,"z":-0.6,"w":0.45,"d":0.7,"ry":0.4,"note":"還沒拆完的行李箱"},
    {"type":"ceilingFan","room":"bedroom","x":3.0,"z":-1.0},
    {"type":"vanity","room":"bath","x0":1.2,"x1":2.4,"z":1.3,"note":"洗手台＋鏡子"},
    {"type":"toilet","room":"bath","x":2.8,"z":1.3},
    {"type":"tub","room":"bath","x0":3.4,"x1":5.0,"z0":1.2,"z1":2.95,"note":"浴缸淋浴兩用"},
    {"type":"balconyChairs","x":-2.4,"z":-3.9,"n":2},
    {"type":"hallSconce","n":4,"note":"走廊壁燈"},
    {"type":"exitSign","x":7.0,"z":3.1}
  ],
  "eventProps":{"note":"US2（學姊煮泡麵）在誰的廚房要等 AA-B 改企劃；如果在這裡，泡麵、鍋、碗、報告做成獨立節點 US2_*，事件時才顯示（和原本的規格相同）"},
  "season":{"note":"窗景、陽台的積雪兩套：雪（1～3 月）、春（4～6 月）；日／夜各一張。窗外是社區的停車場、另一棟公寓、遠一點的樹林（自然保護區）"}
};
