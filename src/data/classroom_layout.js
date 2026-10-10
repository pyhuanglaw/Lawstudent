/* ===== 霖澤館 201 階梯教室 配置（v9.4，D36、D37、D38）=====
   遊戲（src/zones3d.js 的 classroom 區域：導航、平台高度、座位、互動點、程序化備用模型）和 Blender（tools/blender/classroom_201.py：正式模型）讀同一份。
   必須是「const CLASSROOM_LAYOUT=」後面接純 JSON（Blender 端用 json 解析）。
   座標（室內）：x 往東、z 往南（-z 是講台與黑板，+z 是教室後面、門口），y 往上，單位公尺。
   參考：使用者提供的教室照片（深色長桌＋木翻椅、灰地磚、木講桌、投影幕、白色方格天花板＋日光燈、右側窗）。
   講台在前面（地面高度）；6 排座位一排比一排高 30 cm；每排 2.1 m 深（長桌、椅子、椅子後面的走道）；兩側走道每排兩階。
   每排 2.1 m：導航格 0.4 m 量化之後，椅子後面 0.6 m（坐下前站的位置）才站得住（tests/nav_buildings_unit.js）。 */
const CLASSROOM_LAYOUT={
  "version":1,
  "W":16, "D":17.4, "H":5.6,
  "stageZ1":-4.6,
  "rows":6, "rowZ0":-4.6, "rowDepth":2.1, "rise":0.3,
  "aisleX0":6.2, "aisleX1":7.6, "aisleStepDepth":1.03,
  "cols":8, "colX0":-5.25, "colDX":1.5,
  "desk":{"w":12.0, "d":0.45, "dz":0.255, "top":0.75},
  "seat":{"dz":0.8, "approach":0.6},
  "lectern":{"x":-3.2, "z":-6.0, "w":1.3, "d":0.65, "h":1.05},
  "teacher":{"x":-1.5, "z":-6.0},
  "board":{"x":-1.5, "y":2.0, "w":6.0, "h":1.6},
  "screen":{"x":4.0, "y":3.0, "w":4.2, "h":2.5},
  "windows":{"wall":"left", "xs":[-5.5,-1.5,2.5], "y":3.3},
  "door":{"x":0.0, "exitZ":7.9, "spawnZ":7.4}
};
