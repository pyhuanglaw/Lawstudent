# 共同教學館室內正式模型（ART-ECON-3D-GAP-1021 A；LAWWW2-B 2026-10-31）

- **起因**：ART-ECON-3D-GAP-1021 現況清單（`docs/art-rebuild/second_ai/ECON_3D_GAP_STATUS_1030.md`）的 A。
  - 經濟系那一年在共同教學館上課，室內一直是 `teach3d.js` 的程序化備用畫面。
  - `assets3d.js` 沒有 `bldg.gongtong_interior`，`teach_interior.py` 只有普通、博雅。
  - D38：近景不能用程序化當正式美術。
- **LAWWW-B 10-30 23:2x**：清單裡判斷不用問的直接開工。配置、座位、導航都不動。
- **狀態**：`READY_FOR_ART_REVIEW`。建築、場景只有使用者能標 `ART_APPROVED`。
  - 截圖是 Playwright＋SwiftShader（電腦 1280×720），不是實機。
  - 讀檔放位置、藏玩家和 NPC 是 [捷徑]。

## 怎麼套（給 LAWWW-B）

1. **檔案（新的）**：
   - `assets/models/env/second_ai/gongtong_interior.glb`（＋`.json` 統計）；
   - `gongtong_interior_lm_day.webp`、`gongtong_interior_lm_night.webp`。
2. **patch**：`docs/art-rebuild/second_ai/patches/gongtong_interior_1030.patch`（對開發 `44337adcb`）。
   - `src/assets3d.js` 加一行 `bldg.gongtong_interior`。`teach3d.js` 本來就照 `'bldg.'+id+'_interior'` 自己接：B3.attachFormal、光照貼圖、看到 SEATPANS 藏起備用的方塊桌椅、翻椅。**遊戲程式不用改**。
   - 新測試 `tests/gongtong_interior_glb_unit.js`（照博思的那一支）：節點、40 個翻椅每個都分得到椅面、長桌高度、光照貼圖兩張、manifest。
   - `tests/room_ceiling_unit.js` 的清單加 `gongtong_interior`。
3. **工具（我的分支，遊戲不讀）**：
   - `tools/blender/env_second/teach_interior.py`：加 `--set gongtong`。
   - `tools/blender/env_second/lightbake/bake_gongtong.sh`：新的烘焙腳本。
   - **開發分支的 `lightbake/bake_room.py` 是舊版**（沒有 10-30 的 collapse_black 整面取樣修正），要重烘的話用我分支的。

## 模型

- 和博思同一支腳本：
  - 兩層的殼：磨石子地板、樓板、外牆、隔間、窗框、窗台、踢腳板；
  - 輕鋼架天花板＋T5 格柵燈具；
  - 樓梯（花崗石踏面、止滑條、扶手、二樓樓梯井的玻璃欄杆）；
  - 102、201、202 的黑板、講桌；
  - 101 階梯教室：平台、走道台階、黑板、投影幕捲軸盒、講桌、長桌、40 張翻椅（SEATPANS）；
  - 關著的房間（洗手間、203）的門。
- 配置沒寫燈位（`lightPanels`）：用 `teach3d.js` 備用模型的預設燈位（`DEFAULT_LP`，兩邊一致）。
- 69 個物件、28,990 個三角形、31 個材質；GLB （量測中）MB、光照貼圖 1024²（白天、晚上）。
- **休息區的圓桌、自習區的桌椅、教室的單人桌椅照舊是遊戲畫的**（配置的 `lounge`／`study` 是舊寫法，`furniture_study.glb` 的模組尺寸對不上），這一包沒動。普通教學館的教室也一樣。

## 光照烘焙（`bake_gongtong.sh`）

- 第一次用開發分支的 `bake_room.py` 烘：一樓地板一半（168 m²）、北牆的光照座標被壓扁。原因是舊版 collapse_black 只看面的中心，中心剛好在 101 平台底下。
  - 用我分支修好的版本重烘：朝室內被壓扁 286 → （量測中）m²。
  - 剩下的是樓梯踏步北面（被前一階擋住，只露出踢面那一條）；博思同一支腳本也有。
- **白天不能照博思的參數**：
  - 博思的參數（天光 0.5、白平衡 0.92,0.88,0.8、白天燈 0.9）在這裡，教室牆面 (248,220,176)，紅色爆掉、整間偏橘黃。
  - 原因：教室小、窗大（博思的階梯教室沒有窗）；遊戲裡白天還有即時的太陽（×0.3）和跟著玩家的三盞燈。
  - 遊戲內試了三版，改成天光 0.18、白平衡 1.0,0.98,0.95、白天燈 0.6：教室牆面白天 (214,191,158)、晚上 (168,159,139)。

## 改前改後（同角度；左＝改前程序化，右＝改後正式模型）

（量測中）

## 和改前不一樣、要你知道的

- **關著的房間的門牌不見了**：
  - 改前：洗手間、203 是 `furniture_study.glb` 的門＋門牌（ART-02，放在備用模型群組裡）。
  - 改後：正式模型載入後，那些門跟著備用群組藏起來，換成模型自己的門（木門、門框、門把），沒有門牌。
  - 博思、普通本來就是這樣。要留門牌的話是 `teach3d.js` 的事（把 doorsGLB 放到備用群組外面、模型不做關著的門），你決定。

## 測試

（量測中）
