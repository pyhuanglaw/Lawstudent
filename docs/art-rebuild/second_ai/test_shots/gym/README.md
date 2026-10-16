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
