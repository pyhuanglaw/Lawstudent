# 新體育館（綜合體育館）第一階段：大廳＋1F 多功能球場——交付說明

LAWWW2-B，2026-10-16。需求：BB_151（使用者直接指示，BB-B 轉達）：「新體育館……很有代表性，很多演講演唱會都在那，應該要建立室內3D」「一定要有健身房、羽球場，演講、演唱會時改成場地」。

- **配置（遊戲＋Blender 共用）**：`src/data/gym_layout.js`（version 2）。包含：
  - 區域尺寸、出生點；
  - 出口：回校園的體育館門口；`enterAt` 取代 classes3d 原本「體育館：體育課在這裡上」的門口互動；
  - 球場、物件清單、導航阻擋 `blocks`、座位、互動點；
  - 第二會場 `sets.second_hall`。
- **模型**：`tools/blender/env_second/gym_interior.py` → `assets/models/env/second_ai/gym_interior.glb`
  - 2.4 MB、31,120 三角形（畫出來 76,568：第二會場 300 張折疊椅用 GPU instancing）、貼圖 512。
  - 貼圖：`tools/blender/env_second/gym_tex.py`。
- **工具**：Blender 5.2（bpy）。倒角方塊 `lib2.rbox_bm`、旋轉體（燈罩、網柱底座、獎盃）、圓管（桁架、欄杆、籃架吊桿）。
- **材質**：
  - Poly Haven CC0：`white_plaster_02`（牆）、`granite_tile`（大廳地板、石材牆裙）、`walnut_veneer`（木作）；
  - 本作程式畫：球場地板與球場線、開館時間、記分板、指標、樓層指引、公告欄；
  - 不寫校名、館名，沒有校徽、品牌（D77）。
- **狀態**：`MODEL_READY`（還沒有遊戲區域，所以沒有遊戲內截圖）。區域程式由 LAWWW-B 建。

## Blender 預覽（Cycles 16 spp，第二會場平常藏起來）

| 大廳（往西北） | 大廳（往北：閘門） |
|---|---|
| ![](blender_lobbyL.webp) | ![](blender_lobby.webp) |
| **1F 球場（往北：看台、記分板）** | **1F 球場（東南角）** |
| ![](blender_hall.webp) | ![](blender_corner.webp) |

第二會場（`SET_SECONDHALL` 打開：西牆大螢幕＋300 張折疊椅，面向西）：

![](blender_secondhall.webp)

## 給 LAWWW-B 的節點說明

| 節點 | 用途 |
|---|---|
| `WALL_front_*`、`WALL_back_*`、`WALL_left_*`、`WALL_right_*` | 會淡出的牆，`dir` 屬性照 `attachRoomGLB` 的慣例 |
| `SET_SECONDHALL`（子節點：`_screen`、`_frame`、300 張椅子的 instancing） | 平常 `visible=false`；畢業典禮那天打開。打開時導航加 `sets.second_hall.blocks`，座位照 `seats` 的說明產生 |
| `PLATE_FACE_gym_stairs_up`、`PLATE_FACE_gym_stairs_down` | 樓梯口 A 字架的告示（`plate:'notice'`）：「3F 主球場／今日不開放」「B1 游泳池・健身中心／今日不開放」 |
| `GLOW_highbay_*`、`GLOW_downlight_*`、`GLOW_skylight_*`、`GLOW_vending_*` | `CL.glow` 光暈（day／night 強度在屬性裡） |
| 材質 `gym_window_sky` | 東西兩面高窗：外面沒有東西，所以用發光的天空色。**建議入夜時調暗**（像柏油的 `userData.asphalt`），不然晚上窗戶還是亮的 |

## v2（這一版）改了什麼

v1 的預覽有三個問題：
- 牆是清水混凝土，水漬太髒，像停車場；
- 高窗的玻璃透出後面的牆；
- 大廳只有一面空牆。

| 項目 | v1 | v2 |
|---|---|---|
| 牆 | 清水混凝土 | 白色粉刷牆 `white_plaster_02` |
| 高窗 | 透明玻璃 | 發光的天空色 |
| 大廳那一面 | 一面空牆 | 開口上方三塊指標（← 3F 主球場／↑ 1F 多功能球場／→ B1 健身中心・游泳池）、兩段木格柵牆、軟木公告欄、樓層指引 |

配置 v2 也跟著改：
- 加了兩個互動點：`gym_notice`（看公告欄）、`gym_directory`（看樓層指引）；
- 加了兩個貼牆的導航阻擋（凸出 0.1 m）。

## 還沒做、已知問題

- **下一階段**：3F 主球場（典禮、演講、演唱會）、B1 健身中心與游泳池。BB-B 支援 B1 健身器材（ART-GYM-P1，交我驗收）。
- 公告欄、樓層指引的文字是氣氛用的一般公告，沒有日期，不牽涉劇情。要放劇情公告（例如期末成發）時再加一張貼紙。
- 羽球網是半透明平面（`gym_net`），近看沒有網格。
- 實機手機效能沒有量過：三角形 31k／畫出來 77k，和萬才館室內同一級。

---

# 第二階段：3F 主球場（`gym_arena` 區域）——交付說明（LAWWW2-B 2026-10-16）

- **配置**：`src/data/gym_layout.js` 的 `arena` 段（version 3），給遊戲和 Blender 共用。內容有：
  - 場地、球場；
  - 三面下層看台：12 排，排高 0.42、排深 0.85；
  - 走道（樓梯）、入口通道、上層看台；
  - 出生點 (0, 23.6)，面向北；
  - 出口：回 1F 大廳西側樓梯口 (−18, 17.6)；
  - 四組布置。
- **模型**：`tools/blender/env_second/gym_arena.py` → `assets/models/env/second_ai/gym_arena.glb`
  - 3.4 MB、52k 三角形。
  - 平常（布置都藏起來）畫出約 13 萬個三角形：下層看台 2,256 張座位，GPU instancing，每張 36 個三角形。
  - 典禮那天：再加 1,250 張折疊椅，每張 48 個三角形。
- **貼圖**：
  - `gym_tex.py` 程式畫：`arena_floor.jpg`（44×39 m：籃球＋排球的線、深色外圍色帶、藍色禁區）、`arena_screen.png`（大螢幕待機畫面）、`arena_banner.png`（典禮的米色長布，金邊，沒有字、沒有校徽）。
  - Poly Haven CC0：`concrete_floor_painted`、`white_plaster_02`、`dark_planks`、`walnut_veneer`。
- **狀態**：`MODEL_READY`，只有 Blender 預覽，還沒有遊戲區域。

| 從入口通道走出來（往北：大螢幕、布旗、吸音板） | 看台（東、南兩面；上層是 4、5F） |
|---|---|
| ![](arena_entry.webp) | ![](arena_stands.webp) |
| **畢業典禮（SET_STAGE＋SET_CEREMONY）** | **演唱會（SET_STAGE＋SET_CONCERT）** |
| ![](arena_ceremony.webp) | ![](arena_concert.webp) |

演講（SET_STAGE＋SET_LECTURE）：

![](arena_lecture.webp)

## 給 LAWWW-B 的節點說明

| 節點 | 用途 |
|---|---|
| `SET_STAGE` | 舞台、兩側上台的樓梯、深藍布幕。典禮、演講、演唱會都要先打開這一組 |
| `SET_CEREMONY` | 講台、花、盆栽、來賓桌椅、背板上的米色長布；場地上 1,250 張折疊椅（instancing），面向舞台 |
| `SET_LECTURE` | 講台、投影幕、308 張椅子 |
| `SET_CONCERT` | 兩座燈架塔＋上方桁架、20 盞搖頭燈（光暈 `GLOW_movinghead_*`）、吊掛喇叭、地上喇叭、鐵馬（z −12.6）、控台帳篷 |
| `arena_seats_lower` | 下層看台的座位（instancing）。座位點照 `standRows` 的說明算（第 r 排：平台頂 y＝0.6＋0.42r，座位在離前緣 0.5 m 的地方） |
| `GLOW_led_*`、`GLOW_screen_*`、`GLOW_vomitory_*` | 燈的光暈 |

- **導航建議**：
  - 場地整片可以走。
  - 看台只開走道。東、西各 3 條，南 2 條，寬 1.2 m。
    - 斜面從場地 y 0 到最上排 5.22（`addSurf` 的 `{axis, ya, yb}`）。
    - 畫面上是每排兩階（踏面 0.425、級高 0.21），最前面多一階 0.3。
  - 座位從走道進去。
  - 入口通道 x −2～2、z 17～24.5 是平地。
- 1F 大廳的「往 3F 的樓梯（今天不開放）」改成上樓：走到樓梯平台（2.1 m）就換區域，到 `gym_arena` 的出生點。
- **已知、還沒做**：
  - 看台後面的走廊：走道頂端的門關著。
  - 上層看台走不到：只有畫面，座位是貼圖畫的座位帶，近看是平的。
  - 東西看台和南看台之間的四個角落是兩面白牆圍起來的空間（看不到裡面）。
  - 籃架吊在大螢幕上面（收起來的樣子）。
