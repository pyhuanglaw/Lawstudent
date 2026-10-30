/* ===== 總圖書館 大廳配置（總圖第一階段：大廳＋二樓自習區，D43）=====
   遊戲（src/library3d.js：導航格、地板高度、互動點、程序化備用模型）和 Blender（tools/blender/library_interior.py：正式模型）
   讀同一份資料，兩邊的牆、樓梯、樓板、電梯、門的位置一定一致。這份檔案必須是「const LIBRARY_LAYOUT=」後面接純 JSON（Blender 端用 json 解析）。

   座標（室內）：x 往東、z 往南（+z 是正面：玻璃門、門廳）；單位公尺；y 往上。
   一樓（y=0，5.0 m 高，和外觀 CK.hall 的一樓同高）：門廳（置物櫃、還書箱、公告）→ 入口閘門 → 中庭大廳（挑高到屋頂、天窗）→ 中央大樓梯；
     東側：服務台、電梯、期刊報紙區；西側：新書展示、沙發。
   大樓梯（「帝國式」：中間一跑上到平台，兩側兩跑折返上二樓）：中間那一跑往北爬（最下面一階在南邊），平台靠北牆（大窗），兩側往南爬回到二樓的連廊。
   二樓（y=5.0）：西翼＝自習區（長桌、檯燈、西側窗），東翼＝電梯、往 3F 閱覽區的樓梯間、研究小間（關著）；南邊的連廊接兩翼、看得到一樓中庭。
   3F 閱覽區＝現有的 library 區域（劇情裡陳語彤說「我看過你在三樓」：閱覽室在三樓）。座位、出口、劇情人物位置都不動，從樓梯間或電梯過去。
   真實性：外觀是第二個 AI 的總圖正式模型（照片參考）；室內沒有照片或平面圖支持，是「遊戲化設計」，不宣稱還原真實建築。 */
const LIBRARY_LAYOUT={
  "version":1,
  "W":24, "D":18, "cell":0.4, "wallT":0.2,
  "floors":[ {"lv":0,"y":0.0,"name":"1F"}, {"lv":1,"y":5.0,"name":"2F"} ],
  "roofY":9.6, "slabT":0.3,
  "stair":{ "rise":0.16667, "tread":0.28,
    "center":{"x0":-1.5,"x1":1.5,"z0":-4.8,"z1":-0.6,"risers":15},
    "landing":{"x0":-3.6,"x1":3.6,"z0":-8.8,"z1":-4.8,"y":2.5},
    "sides":[ {"x0":-3.6,"x1":-1.8}, {"x0":1.8,"x1":3.6} ],
    "side":{"z0":-4.8,"z1":-0.6,"risers":15},
    "railX":3.7 },
  "core":{"x0":-5.2,"x1":5.2,"z0":-8.9,"z1":-0.6},
  "upper":{
    "band":{"x0":-5.2,"x1":5.2,"z0":-0.6,"z1":1.4},
    "wings":[ {"x0":-11.9,"x1":-3.7,"z0":-8.9,"z1":-0.6}, {"x0":-11.9,"x1":-5.2,"z0":-0.6,"z1":8.9},
              {"x0":3.7,"x1":11.9,"z0":-8.9,"z1":-0.6}, {"x0":5.2,"x1":11.9,"z0":-0.6,"z1":8.9} ] },
  "vestibule":{"x0":-5.2,"x1":5.2,"z0":5.4,"z1":8.9},
  "gates":{"z":5.4,"posts":[-4.4,-2.8,-1.2,1.2,2.8,4.4],"postW":0.3,"postD":1.0},
  "elevator":{ "x0":9.4, "x1":11.4, "z0":-2.6, "z1":-0.4, "doorX0":9.8, "doorX1":11.0, "doorZ":-2.6, "callZ":-3.6, "base":1,
    "floors":[ {"label":"1F 大廳、出口","lv":0,"open":true}, {"label":"2F 自習區","lv":1,"open":true},
      {"label":"3F 閱覽區","zone":"library","open":true},
      {"label":"4F 書庫","open":false,"why":"書庫整理中","toast":"4 樓的書庫這學期在整理，按鈕按不亮"},
      {"label":"5F 書庫（自然科學）","zone":"library_stacks","lv":0,"open":true},
      {"label":"6F 書庫","open":false,"why":"書庫整理中","toast":"6 樓的書庫這學期在整理，按鈕按不亮"} ] },
  "entrance":{ "x":0, "exitZ":8.3, "spawn":{"x":0,"z":6.6,"lv":0,"yaw":3.1416} },
  "stairDoor":{ "x":11.8, "z":-6.0, "lv":1, "label":"樓梯間：往 3F 閱覽區", "spawn":{"x":10.8,"z":-6.0,"lv":1,"yaw":-1.5708} },
  "b1Door":{ "x":-11.8, "z":-2.4, "lv":0, "w":1.1, "label":"走樓梯下 B1", "spawn":{"x":-10.1,"z":-2.4,"lv":0,"yaw":1.5708}, "note":"總圖 B1（CLOSED-SPACES-1023 第 2 項，LAWWW2-B 10-23；LAWWW-B 選 A）：一樓西牆的樓梯間門，換那一扇窗（z −2.4）；B1 是 library_b1 區域（src/library_b1_3d.js），spawn＝從 B1 走上來站的位置" },
  "reading":{ "spawnFromStairs":{"x":0,"z":7,"yaw":3.1416},
    "elevator":{ "x0":8.8, "x1":10.8, "z0":-1.0, "z1":1.2, "doorX0":9.2, "doorX1":10.4, "doorZ":-1.0, "callZ":-2.0, "base":3,
      "floors":[ {"label":"1F 大廳、出口","zone":"library_hall","lv":0,"open":true}, {"label":"2F 自習區","zone":"library_hall","lv":1,"open":true},
        {"label":"3F 閱覽區","lv":0,"open":true},
        {"label":"4F 書庫","open":false,"why":"書庫整理中","toast":"4 樓的書庫這學期在整理，按鈕按不亮"},
        {"label":"5F 書庫（自然科學）","zone":"library_stacks","lv":0,"open":true},
        {"label":"6F 書庫","open":false,"why":"書庫整理中","toast":"6 樓的書庫這學期在整理，按鈕按不亮"} ] } },
  "stacks":{ "zone":"library_stacks", "note":"5F 書庫（CLOSED-SPACES-1023 第 3 項；AA_399 3-3，LAWWW2-B 10-23）：只開 5F，4F、6F 照舊整理中；只能搭電梯（大廳、3F 閱覽區、5F 的電梯都停 5F）。區域 src/library_upper3d.js，配置 src/data/library_upper_layouts.js",
    "elevator":{ "x0":9.4, "x1":11.4, "z0":-2.6, "z1":-0.4, "doorX0":9.8, "doorX1":11.0, "doorZ":-2.6, "callZ":-3.6, "base":5,
      "floors":[ {"label":"1F 大廳、出口","zone":"library_hall","lv":0,"open":true}, {"label":"2F 自習區","zone":"library_hall","lv":1,"open":true},
        {"label":"3F 閱覽區","zone":"library","open":true},
        {"label":"4F 書庫","open":false,"why":"書庫整理中","toast":"4 樓的書庫這學期在整理，按鈕按不亮"},
        {"label":"5F 書庫（自然科學）","lv":0,"open":true},
        {"label":"6F 書庫","open":false,"why":"書庫整理中","toast":"6 樓的書庫這學期在整理，按鈕按不亮"} ] } },
  "doors":[
    {"id":"carrels","lv":1,"x":11.8,"z":5.6,"ry":-1.5708,"label":"研究小間","to":"library_carrels","back":{"x":9.6,"z":5.6,"lv":1,"yaw":-1.5708},"closed":"研究小間。門上貼著「請先上網預約，憑學生證開門」，今天的時段都被借走了。","note":"CLOSED-SPACES-1023 第 3 項（AA_399 3-1，LAWWW2-B 10-23）：門通到 library_carrels（src/library_upper3d.js）；back＝從研究小間走回來站的位置（離門的互動點 1.45 m）；closed＝研究小間的區域沒載入時的「看」"},
    {"id":"media","lv":1,"x":10.4,"z":-8.8,"ry":0,"label":"多媒體中心","closed":"多媒體中心。這學期整修，暫停開放。"},
    {"id":"staff","lv":0,"x":10.8,"z":5.7,"ry":3.1416,"label":"館員辦公室","closed":"館員辦公室。門上寫著「非請勿入」。"}
  ],
  "furniture":[
    {"type":"lockers","lv":0,"x":-4.85,"z":7.1,"w":3.2,"d":0.5,"ry":1.5708},
    {"type":"returnBox","lv":0,"x":4.75,"z":7.6,"ry":-1.5708},
    {"type":"notice","lv":0,"x":5.08,"z":6.2,"ry":-1.5708},
    {"type":"desk","lv":0,"x":7.8,"z":4.4,"w":3.6,"d":0.8},
    {"type":"copier","lv":0,"x":11.4,"z":2.6,"ry":1.5708,"nav":[11.32,2.635,0.78,1.07],"note":"影印機（NPC-STORY-1028，AA_497 芯慈 2-2；LAWWW2-C）：靠東牆、正面朝西；nav＝世界座標的擋住範圍 [中心 x, 中心 z, 寬 x, 深 z]（含正面的觸控面板、南邊的投幣盒、北邊的出紙盤）。站在影印機前：(10.35, 2.35)、(10.35, 2.95) 朝 +x"},
    {"type":"partition","lv":0,"x":5.8,"z":4.9,"w":0.1,"d":1.8},
    {"type":"partition","lv":0,"x":9.8,"z":4.9,"w":0.1,"d":1.8},
    {"type":"officeWall","lv":0,"x0":5.3,"x1":11.9,"z":5.8},
    {"type":"display","lv":0,"x":-8.4,"z":2.4,"w":2.4,"d":1.0},
    {"type":"display","lv":0,"x":-8.4,"z":-1.6,"w":2.4,"d":1.0},
    {"type":"sofa","lv":0,"x":-11.0,"z":-5.6,"w":2.2,"d":0.9,"ry":1.5708,"seat":true},
    {"type":"sofa","lv":0,"x":-11.0,"z":6.2,"w":2.2,"d":0.9,"ry":1.5708,"seat":true},
    {"type":"racks","lv":0,"x":11.45,"z":-6.6,"w":3.6,"d":0.6,"ry":-1.5708},
    {"type":"armchair","lv":0,"x":8.6,"z":-5.8,"ry":1.5708,"seat":true},
    {"type":"armchair","lv":0,"x":8.6,"z":-7.4,"ry":1.5708,"seat":true},
    {"type":"coreShelf","lv":0,"x":-5.45,"z":-4.75,"w":7.6,"ry":-1.5708},
    {"type":"coreShelf","lv":0,"x":5.45,"z":-4.75,"w":7.6,"ry":1.5708},
    {"type":"planter","lv":0,"x":-4.4,"z":0.4,"r":0.45},
    {"type":"planter","lv":0,"x":4.4,"z":0.4,"r":0.45},
    {"type":"studyTable","lv":1,"x":-8.2,"z":-6.8,"w":4.2,"seats":4},
    {"type":"studyTable","lv":1,"x":-8.2,"z":-3.8,"w":4.2,"seats":4},
    {"type":"studyTable","lv":1,"x":-8.6,"z":3.0,"w":4.2,"seats":4},
    {"type":"studyTable","lv":1,"x":-8.6,"z":6.6,"w":4.2,"seats":4},
    {"type":"shelf","lv":1,"x":7.0,"z":-8.55,"w":4.6,"ry":0},
    {"type":"shelf","lv":1,"x":11.55,"z":1.8,"w":2.4,"ry":-1.5708},
    {"type":"armchair","lv":1,"x":7.2,"z":7.6,"ry":3.1416,"seat":true},
    {"type":"armchair","lv":1,"x":9.0,"z":7.6,"ry":3.1416,"seat":true},
    {"type":"planter","lv":1,"x":-11.2,"z":0.6,"r":0.4}
  ],
  "signs":[
    { "lv":0, "text":"樓梯間　B1 自習室・討論室 ↓", "x":-11.84, "z":-2.4, "y":2.78, "ry":1.5708, "w":2.4 },
    {"lv":1,"text":"自習區　請保持安靜","x":-11.82,"z":0.0,"y":3.75,"ry":1.5708,"w":2.6},
    {"lv":1,"text":"3F 閱覽區　東側樓梯間 →","x":7.0,"z":-8.82,"y":2.9,"ry":0,"w":3.0},
    {"lv":0,"text":"總圖書館","x":0,"z":1.45,"y":4.1,"ry":0,"w":3.0}
  ]
};
