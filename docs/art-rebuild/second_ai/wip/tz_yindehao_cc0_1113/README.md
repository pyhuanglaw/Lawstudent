# 印得好影印店 CC0 v1（SHOP-REALISM-1112；LAWWW2-C 2026-11-13）

**改什麼**（CLAUDE.md §9 2a、§12 第 2 點：道具不准是塑膠方塊，一律用 Poly Haven／ambientCG CC0）：
- 原本整間是頂點色方塊（每樣東西一個純色）。這版**照顏色把零件分到 CC0 材質組**，形狀、擺位、互動點、導航、座位都沒動：
  - 白色影印機、櫃台抽屜、燈具、冷氣、電腦主機 → `Plastic006`（白塑膠）
  - 掃描台、操作面板、螢幕、裁紙機 → `Plastic006`（深灰）；大型影印機 → `Plastic006`（藏青）
  - 鐵層架、桌腳、刀架、圓凳腳、鋁窗框 → `Metal009`（不鏽鋼）
  - 紙箱 → `Cardboard001`；後牆布簾 → `Fabric036`；天花板、管線 → `Plaster001`
  - 層架上一包包影印紙 → 三色包裝紙（底色、白標籤、條紋自己畫，紙的紋理 `Paper001`）
  - 櫃台上、玻璃門旁兩盆植物 → Poly Haven `potted_plant_02`
- **光照烘焙**（和泰米、洗樂同一套）：天花板四支日光燈＋右側櫃台上方兩點補光，白天／晚上各一張光照貼圖（`tz_yindehao_interior_lm_day/night.webp`），遊戲的 `Z3.attachRoomGLB` 看到 GLB 的 `extras.lightmap` 自動接。

**沒改**：價目表、海報、樣品照片（照舊參考圖裁的貼圖）；小東西（筆、釘書機、標籤）照舊頂點色——太小，材質的紋理分不到。

**檔案**：`yindehao_v1.patch`（底＝開發分支 `99063ee27f`，`git apply --cached --check` 過）：GLB、json、兩張光照貼圖、`lightbake/tz_yindehao_interior_lm.json`、`tz_shops_interior.py`、`bake_tz_shops.sh`、`LICENSES.md`、`tests/shop_cc0_baseline.json`。`SHOP_STANDARD_STATUS.md` 不在 patch 裡，請 `place_gate_unit.js --write` 重產。

**截圖**：`cmp_yindehao_v1.jpg`（左＝改之前、右＝v1，同鏡頭、13:00、藏 NPC 與玩家；最後一列 20:00）。

**測試**（在開發分支＋這個 patch 的檔上）：tz_shops_unit、shop_cc0_unit（印得好已用 CC0；基準表拿掉它那一列）、tz_shops_notrap、tz_shop_views、tz_front_lit ALL PASS；place_gate 只差 `SHOP_STANDARD_STATUS.md` 要重產。

**大小**：GLB 0.6 MB → 1.6 MB（CC0 貼圖、包裝紙、盆栽）；光照貼圖兩張共 0.2 MB。手機效能還沒量。

**塑膠黑紋（v1 第一次試拍抓到、已修）**：Plastic006 的顏色貼圖幾乎全黑，校成白色時明暗起伏被放大成黑色大理石紋（`cmp_yindehao_v1_streaks.jpg`）。`acg()` 加 `vary=0.05`（起伏壓到 5%）、包裝紙紋理 0.44→0.12，重烘。`cmp_yindehao_v1.jpg` 是修好以後的。

**順便修正洗樂 v2 的原始碼**（我自己 v2 交件 patch 的錯）：v2 的 patch 只帶到印得好那 8 行、沒帶到滾筒 v2 的程式碼——開發分支上的模型是 v2（看得到內筒），但 `tz_shops_interior.py` 還是 v1 的滾筒。這個 patch 的 `tz_shops_interior.py` 是整份換，滾筒是 v2（用它建洗樂＝34,638 面，和開發分支上洗樂 v2 的 json 一樣）。塑膠的 `vary` 也會讓洗樂重建時塑膠變乾淨——洗樂 v3 會用新的塑膠重烘，在那之前開發分支上的洗樂模型照舊。

**原始碼和模型一致**：用這個 patch 的 `tz_shops_interior.py` 建印得好，和烘焙用的模型一模一樣（1,500,968 bytes）。CC0 名單只開到 taimi、xile、yindehao；聯通、東南大聯、客居、越好吃的改法也在檔案裡，但還沒開，下一批 patch 再開。
