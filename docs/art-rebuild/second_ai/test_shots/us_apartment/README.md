# SCN-US-01 美國公寓（大三下交換，祐廷租的校外學生公寓 1x1）

狀態：**MODEL_READY**（LAWWW2-B 2026-10-16 13:0x UTC；13:2x 加了 ART-US4 衛浴＋陽台小物、浴缸短牆和磁磚）。目前只有 Blender 預覽，還沒有遊戲內截圖：LAWWW-B 接上區域後，我再用 `fast_shots.py` 拍，拍完標 `READY_FOR_ART_REVIEW`。

## 檔案

| 檔案 | 說明 |
|---|---|
| `src/data/us_apartment_layout.js` | 配置 v2：房間、牆、開口、門、窗、家具、出生點、座位。**遊戲導航和 Blender 讀同一份**。13:0x 修正了臥室家具位置，見下面「這一版改了什麼」 |
| `tools/blender/env_second/us_apartment.py` | 重建：`/opt/blenv/bin/python tools/blender/env_second/us_apartment.py` |
| `assets/models/env/second_ai/us_apartment.glb`（＋`.json`） | 約 2.5 MB；38,074 個三角形；33 個材質；家具 32 件 |
| 家具四組 | 客廳 `aa_support/us_living_props.glb`（ART-US1，AA-B）、廚房 `aa_support/us_kitchen_props.glb`（ART-US2，AA-B）、臥室 `bb_support/us_bedroom_props.glb`（ART-US3，BB-B）、衛浴＋陽台 `aa_support/us_bath_props.glb`（ART-US4，AA-B）。都已經擺進 `us_apartment.glb`，遊戲不用另外載入 |
| 預覽 | `apt_living_kitchen.webp`、`apt_kitchen.webp`、`apt_bedroom.webp`、`apt_bed_desk.webp`、`apt_bath_tub.webp`、`apt_bath_vanity.webp`、`apt_balcony.webp`（Blender Cycles，**不是遊戲畫面**） |

## 節點（遊戲用名字做事的）

- **會淡出的牆**：`WALL_<id>_*`。
  - props `dir`＝layout 牆的 `dir`：鏡頭在 `dir` 那一側時不透明。
  - 隔間牆另外加 `partition:1`，照溫州街、體育館 B1 的做法：鏡頭和玩家在牆的兩邊時才淡出。
- **天花板**：朝下的單面，鏡頭在天花板上面時看不到。
- **窗外季節**：`SEASON_SNOW_on`／`SEASON_SNOW_off` 兩個群組。
  - on＝1～3 月的雪景，off＝4～6 月的春天。
  - 開關做法和小公園的 `wzParkSeason` 一樣，用名字的 regex。
- **門牌**：`PLATE_FACE_door_*`，props `plate:'door'`、`text`。
  - 自己的門 214、隔壁 213 是虛構的號碼。
  - 字請用遊戲的 canvas 畫。
- **家具**：都在 `furniture` 群組底下，節點名照家具組，例如 `US_SOFA`、`US_COUNTER`、`US_BED`，Blender 複製時會多 `.001` 這種尾巴。
  - 每件的位置、方向照 layout 的 `furniture`。
- **發光材質 `US_glow`**：亮度要遊戲調，晚上開燈、白天關燈。用在：
  - 客廳吊扇的四個燈罩；
  - 臥室吸頂燈的玻璃罩（`US_CEILINGLIGHT_GLOW`）；
  - 書桌檯燈燈罩的內面（`US_DESK_GLOW`）。
- **吊扇葉片**：和馬達是同一個網格，靜態。要轉的話跟我說，我拆成子節點。

## 這一版改了什麼（layout v2，13:0x）

- **廚房**：擺 AA-B 的 ART-US2。
  - 流理台一組（下櫃、爐子＋微波爐、水槽、洗碗機、吊櫃）共用一個原點 (−3.2, 0, 2.64)，ry=π。
  - 靠牆那一面貼南牆的室內面。
  - 冰箱背面貼西牆、門朝東。
  - 窗口內側的檯面在廚房那一邊；吧台在客廳那一邊，ry=π。
- **臥室**：擺 BB-B 的 ART-US3。layout 的位置改了：
  - 床 x 4.0 → 3.93：床頭板原本穿進東牆 7 cm。
  - 床頭櫃加 ry −π/2：開口朝西。
  - 書桌 z −2.7 → −2.66：背面原本穿進北牆。
  - 書桌椅 z −2.1 → −2.15：原本和被子只差 7 mm。
  - 行李箱 (1.8, −2.55) ry 0.4 → (2.12, −2.45) ry 0。原本攤開的蓋子穿過西牆。
    - 佔地 0.95×0.99，中心相對原點偏 `cx` −0.21、`cz` +0.065。
    - **導航阻擋請用 `x+cx`、`z+cz`**。
- **臥室出生點**：x 2.6 → 2.4。床尾的被子垂到 x 2.73，原本人一出生就貼著床。
- **地毯**：彩度降到 0.1。原貼圖的黃色斜紋在米灰地毯上太明顯。

## LAWWW-B 接的時候

1. 照 `US_EXCHANGE_PLAN.md` 第 3 節：
   - 讀 layout 建區域：導航格用牆和家具的阻擋，互動點、出生點、座位也照 layout。
   - 用 `attachRoomGLB` 接模型。
   - 載入失敗時顯示 layout 的方塊（D38 ③）。
2. **座位**：layout 的 `seat:true` 有三組：
   - 客廳的沙發、單人沙發；
   - 吧台的兩張高腳椅（`seatY` 0.76）；
   - 臥室的書桌椅（`use:'study'`）。
3. **可以互動的家具**：
   - 冰箱（`use:'fridge'`）、爐子（`use:'cook'`）；
   - 床（`use:'sleep'`）、書桌（`use:'study'`）。
4. **衛浴（13:2x）**：AA-B 的 ART-US4 已經換上。
   - 節點 `US_TUB`、`US_TOILET`、`US_VANITY`（鏡子在裡面）、`US_TOWELBAR`、`US_BATHMAT`、`US_BALCONY_CHAIR`×2、`US_BALCONY_TABLE`。
   - layout 加了浴缸東端的短牆 `tub_e`（x 2.22，z 2.17～3.0），浴缸改成 x 0.6～2.16。**導航請加這道牆**。
   - 浴缸三面牆貼白磁磚（0.45～1.95 m）。
   - 陽台：兩張椅子 (−2.15, −4.1)、(−1.05, −4.1) 面向欄杆，小圓桌 (−1.6, −4.15)，直徑 0.6。
   - layout 的 `balconyChairs` 加了 `chairs`（x、z、轉角）和 `table`，導航照這兩個欄位。
5. **測試**：照計畫寫 `tests/us_apartment_glb_integration.py`，比照 `gongguan_glb_integration`：
   - 導航格、互動點和備用版完全相同；
   - 量 draw call 和三角形。

## 已知、還沒達到的

- 只有 Blender 預覽，沒有遊戲內截圖；手機效能沒量過。整間 33k 三角形、30 個材質，室內一次看到的大概一半。
- 牆是 Poly Haven 灰泥，近看有一點斑駁，和照片的平滑漆牆比起來偏舊。
- 窗外是貼圖（停車場、對面的壁板公寓、樹林），不是 3D。
  - 13:2x 把景的下緣放到地面（公寓在二樓，地面 y −3.0），中間鋪一片地（`SEASON_SNOW_on`／`off` 各一片：柏油色／雪）。
  - 從陽台往下看不會看到景懸空；但車子還是畫的、平的。
- 陽台地面的油漆貼圖改成無彩度：原本一塊一塊藍色。
