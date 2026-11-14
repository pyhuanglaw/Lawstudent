# CANON 模型清理 ①＋③：玩家 VRM 的舊外套網格、宿舍椅背外套節點、相關腳本與截圖（LAWWW2-C 2026-11-12）

基準：開發分支 `claude/adoring-meitner-mqzst8` @ 76d1292c88。套法三步（順序不拘）：
1. `git apply --binary docs/art-rebuild/second_ai/wip/canon_assets_1112/canon_assets_1112.patch`（只有修改和新增；在 76d1292c88 上 `git apply --check` 過）
2. 刪檔（patch 不放刪除，免得「−」行把舊內容帶進來）：下面「刪檔清單」那一段整段貼到終端機
3. `src/data/dorm_room_layout.js` 拿掉 `jacket_chair` 那一格（那一行很長、同一行別處還有字表裡的字，放進 patch 會把字帶進來，所以給指令）：
   `python3 -c "import re;p='src/data/dorm_room_layout.js';s=open(p).read();t=re.sub(r',\"jacket_chair\":\{[^{}]*\}','',s,count=1);assert t!=s;open(p,'w').write(t)"`

LAWWW-C 18:34 的交辦（D158 模型那一半第 ① 項）：玩家 VRM 裡靠 manifest hide 藏著的舊外套網格、宿舍 GLB 裡 dormSet 永遠藏的椅背外套節點，從模型拿掉。

## 改了什麼（只動模型和一支測試，不動程式）
| 檔 | 之前 | 之後 |
|---|---|---|
| `assets/models/char/vroid_yuting.vrm` | 4,123,356 B；6 網格、17 材質 | 3,866,644 B；5 網格、16 材質（舊外套網格、它的材質、貼圖、skin 資料一起拿掉；VRM 的 firstPerson meshAnnotations、materialProperties 跟著重新編號） |
| `assets/models/env/second_ai/dorm_room4.glb` | 1,720,408 B；158 節點 | 1,694,504 B；156 節點（椅背外套節點和底下的布網格、它的 extras 說明一起拿掉） |
| `tools/blender/glb_prune.py`（新） | — | 從 GLB／VRM(0.x) 拿掉指定節點，順手清掉沒人用的 mesh／skin／material／texture／image／accessor／bufferView 並重寫 buffer；要拿的節點若是骨架、人形骨、彈簧骨就報錯不寫檔 |
| `assets/models/env/second_ai/dorm_room4.layout.json`、`src/data/dorm_room_layout.js` | 有 `jacket_chair` 一格 | 拿掉（程式沒有人讀這一格） |
| `tools/blender/env_second/dorm_room4.py` | 有做椅背外套的兩個函式和呼叫 | 拿掉（以後重建宿舍不會再長回來）；烘焙時藏的名單少一個 `JACKET_` |
| `tests/fit_body_unit.js` ① | 要求玩家 VRM 有外套網格且有 fit morph | 改成「身體、衣服（含運動服）有 fit，臉、頭髮沒有；模型裡沒有 `JACKET*` 網格」 |

重做方法：`python3 tools/blender/glb_prune.py <輸入> <輸出> <節點名>`（節點名就是 zones3d.js／character3d.js 註解裡寫的那兩個）。

## 檢查
- 兩個檔的 JSON 用 `canon_scan.py` 的字表掃：0（原檔玩家 VRM 的英文縮寫 3 處 → 0）。
- 結構：每個 accessor 在 bufferView 內、對齊、所有 mesh／skin／material／texture／image 索引在範圍內；VRM materialProperties 名字和 materials 一一對上、textureProperties 索引在範圍內。
- Node：引用玩家 VRM、宿舍 GLB、宿舍 layout、dormSet、DORM_ROOM、jacket 的 **159 支測試：158 支過**；`gym_wear_unit` ④「sit、體態 0 皮膚跑出運動服 ≤ 1%」三路並行時一次 3／287（1.05%）FAIL，單獨重跑三次都 PASS（1／276～280），原模型單獨跑也 PASS——是抽樣邊緣、不是這次改的（身體和運動服網格沒動）。`fit_body_unit` 改前 FAIL 1 → 改後 ALL PASS；`gym_wear_unit` 30 PASS（舊外套那兩項現在是空集合，照樣過）。
- **沒測**：瀏覽器（玩家換運動服／脫下、宿舍 203 等房間椅背）——請 CC 排一張玩家正面＋宿舍書桌椅的截圖。

## 接下來 LAWWW 要做的
- 把 hide 那兩行拿掉：`src/character3d.js` 的玩家 manifest hide（約 210 行）、`src/zones3d.js` dormSet 永遠藏的那一行（約 2703 行）。模型裡已經沒有那兩個名字，不拿也不會出錯，只是多跑一次找不到的 traverse。
- `tests/gym_wear_unit.js` 第 33、40、42 行的 `JK` 變數可以一起拿掉（現在是空集合）。

## 先將就的
- 宿舍那張椅子的光照貼圖是有外套時烘的，椅背上外套原本的位置可能有一塊比較暗的影子（沒重烘；要重烘是 `tools/blender/env_second/dorm_room4.py` 那一套，等 ③ 處理那支腳本時一起）。

## 刪檔清單（第 2 步，整段貼）
```
git rm -q -r \
  docs/art-rebuild/second_ai/patches/jacket_econ_1030.patch \
  docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/01_idle_before_after.webp \
  docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/02_poses.webp \
  docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/03_backpack_straps.webp \
  docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/04_texture.webp \
  docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/05_chair_blender.webp \
  docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/06_ingame_campus.webp \
  docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/07_ingame_dorm.webp \
  docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/README.md \
  docs/art-rebuild/test_shots/jacket_wear_1030/01_linze_lobby.webp \
  docs/art-rebuild/test_shots/jacket_wear_1030/02_dorm_chair.webp \
  docs/art-rebuild/test_shots/jacket_wear_1030/README.md \
  tools/blender/env_second/shots/jacket_ingame.py \
  tools/blender/env_second/textures/gen/dorm_jacket_chair.png
```
這些是：舊外套的遊戲內截圖兩包、舊外套 patch、遊戲內拍照腳本、椅背外套貼圖。`docs/art-rebuild/second_ai/test_shots/cafe_window_live_1030/README.md` 有一行連到舊外套那一包，連結會斷（歷史紀錄，不改）。

## ②（五個舊序章人物的 VRM、立繪）
開發分支上程式已經沒有人用（只剩 `assets3d.js` 39～43 行 manifest、`C.SIT_FIT`、`C.MODEL_PROPS`、`portrait_manifest.js` 五格），還有 tests 裡 30 幾支提到。下一包我交：刪檔清單＋manifest／SIT_FIT／MODEL_PROPS 拿掉＋`portrait_manifest.js` 重產＋改到的測試。舊序章的教授那個 VRM `courses.js`、`characters.js` 還在用，先不動。
