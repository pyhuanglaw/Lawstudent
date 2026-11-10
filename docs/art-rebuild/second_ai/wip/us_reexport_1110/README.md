# LAWWW2-REEXPORT-US-1027：開發分支能重新做出美國公寓、C 棟 208 的 GLB — LAWWW2 帳號 A，2026-11-10

- 狀態：`READY_FOR_REVIEW`（工具），交 LAWWW 整合。以開發分支 3f3d48325 為底。
- 遊戲不讀這些檔，沒有畫面上的改變，不用 CC 拍、BB 判。

## 原本的問題
- 任務原本寫「缺 us_apartment_layout 舊檔名的配置、aa_support／bb_support 道具組」。11-10 在乾淨的開發分支實際跑過：
  - 配置、道具組都已經在了（之前有人補過）。
  - **實際缺的是三件事**：
    1. `us_apartment.py` 是舊版：
       - 用 `concrete_floor_painted` 貼圖，開發分支沒有這張，腳本一開始就失敗；
       - 11-01 已經改成 `granular_concrete`，鄰居 213 的門也改成自己一個節點，這兩個修改只在 LAWWW2 的分支上。
    2. 部署中的 GLB 不是腳本直接匯出的，還經過烘焙（`bake_us.sh`）、切門板（`glb_split_node.py`，#204）、`glb_partition_at.py`。
       - `glb_split_node.py` 開發分支沒有；
       - 整套步驟沒有寫在一起。
    3. 就算腳本跑得出來，直接匯出的和遊戲裡的差很多：三角形 63,816 對 48,622、少了切開的門板和烘焙的材質。

## 改了什麼（全部是工具，遊戲不讀）
- `tools/blender/env_second/us_apartment.py`：換成 LAWWW2 分支上的版本。和開發分支差兩處：
  - 陽台、平台的水泥地 `granular_concrete`（開發分支有這張）；
  - `door213` 自己一個節點。
  - 另外加了切門板的註解。
- `tools/blender/env_second/lightbake/glb_split_node.py`：#204 的工具，開發分支原本沒有。
- **新** `tools/blender/env_second/lightbake/rebuild_us_rooms.sh apartment|shared [取樣] [輸出資料夾] [貼圖邊長]`：一個指令從頭做到底。
  - bake_us.sh（建模＋烘焙＋WebP＋lm_fix_hidden＋單雙面還原）；
  - 只有公寓：切門板；
  - 兩間都跑 partition。

## 驗證
- 在乾淨的開發分支（3f3d48325）套上這一包，用低取樣跑 `rebuild_us_rooms.sh apartment 8 <暫存> 128` 和 shared：
  - 公寓：節點 96、網格 93、材質 36、三角形 48,622，節點名、材質名、每個節點的 extras（dir、partition、at）**和部署中的逐一相同**；
  - 208：節點 136、網格 127、材質 65、三角形 48,864，同樣逐一相同（要跑 partition；208 有 9 個節點的 at 是 partition 寫的）。
  - 光照貼圖是低取樣，畫質當然不同。正式重做用預設的 256 取樣、1024：一間約幾分鐘到十幾分鐘，CPU。
  - 這次**沒有覆蓋**遊戲裡的 GLB。
- 新測試 `tests/us_reexport_inputs_unit.js`（不跑 Blender，只查東西在不在）：
  - ① us_apartment.py 用到的 6 種 Poly Haven 貼圖都在；
  - ② 四組家具道具組都在（衛浴那一組不在的話，腳本會悄悄換成簡單版）；
  - ③ 兩份配置在；
  - ④ 工具都在，rebuild 對公寓切門板、兩間都跑 partition；
  - ⑤ 部署中的公寓有切開的門板、door213 自己一個節點，腳本也是這樣做。
  - **開發分支 3f3d48325：FAILED 3**（①④⑤）；套上 patch：**ALL PASS**。
- 回歸：讀到 us_apartment、us_shared、glb_split_node、glb_partition_at、bake_us 的 47 支，全過，見 `regression.log`。

## 整合
- `git apply us_reexport_1110.patch`。
- 內容：us_apartment.py、glb_split_node.py、rebuild_us_rooms.sh（新）、新測試。

## 之後
- 改公寓、208（例如 US-SCENE-GAP 第 5 項的疊面閃爍、換季）：改 us_apartment.py → `bash tools/blender/env_second/lightbake/rebuild_us_rooms.sh apartment`（和 shared）→ 跑 us_reexport_inputs 和公寓的測試。
