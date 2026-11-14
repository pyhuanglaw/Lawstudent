# 第③群幫手（claude/shop-cc0-g3）：bb_support 六間店 CC0 化（SHOP-REALISM-1112／SHOP-CC0-HELP-1113）

店：dabu、haopai、tongxian、xinsheng_sports、dakou_1f、dakou_2f。驗收人 LAWWW2-C；整合 LAWWW-C。
每間一份：並排圖 `<店>_cmp.jpg`、patch `<店>.patch`（底＝交件當時的開發分支）。

## 共用工具
- `tools/blender/env_second/bb_support/cc0_kit.py`：從 `tz_shops_interior.py` 抽出來的 `acg`／`printed`／`ph_put`／`Route`／`AsTex`，另外加 `vc_tex`（ambientCG 材質組 × 頂點色：一個網格很多種顏色的東西用）。`K.report()` 一定要在匯出前呼叫（拿掉 Poly Haven 原型，不然原型會被匯出在房間原點）。

## 重烘時要知道的（bake_xs.sh）
- **glb_fix_instnames.py 對不上的名字**：新加的 Poly Haven instancing 節點，原檔叫 `<根>.N`（例：大步 `dabu_interior.1`、`dabu_interior.2`），烘好的叫 `<網格>_inst`（大步 `Plane.070_inst`、`Plane.118_inst`：兩種盆栽；大口二樓原檔 `dakou_2f.23`：盆栽）。不是牆、沒有 extras，名字不影響遊戲；但這一步會 `exit 1`，`bake_xs.sh` 因為 `set -e` 停在最後——GLB、光照貼圖已經寫好，只差 `lightbake/<店>_lm.json`。我照 .sh 剩下的步驟手動補（`tmp/<店>.json` 加 `src`、`src_sha256`＝烘焙輸入檔的 sha256）。
- **好拍（haopai）**：遊戲用的 GLB 在 `haopai_interior.py` 匯出以後還要做 11-09 BACKFACE-HAOPAI 那兩步（`glb_flip_faces.py` 翻右牆洞洞板、左牆鐵網格＋洞洞板 `hp_peg` 不透明材質；`glb_split_tile.py --gain 3.0` 洞洞板自己的貼圖），烘焙時洞洞板不藏、自己也烘（`HIDE='glass'`、NOLM 加 `WALL_right_pegwall_alpha`）。步驟：LAWWW2 分支 `docs/art-rebuild/second_ai/wip/backface_haopai_1109/README.md`；工具在 `claude/second-ai-env-art`。開發分支的 `bake_xs.sh` 好拍那一段還是舊的（`HIDE='glass|alpha'`）。
- **同弦（tongxian）**：匯出以後還要挖樓梯間的地板洞（11-05 GUITAR-SHOP-ZONE-1105，不在 `tongxian_interior.py` 裡）：
  `python3 tools/blender/env_second/glb_floor_hole.py <匯出.glb> <輸出.glb> tx_floor -3.2,-1.14,1.0,5.2`，再烘（輸入用挖過的那一份）。沒挖 `tests/tongxian_unit.js` ⑨ FAIL。
- 新生運動、大口一樓／二樓：用腳本重建的（還沒烘）原檔跑過店自己的單元測試，沒有別的事後處理。
- `tests/xs_lm_unit.js` 的 instancing 個數要照新原檔改（大步 32 → 35：多了 Poly Haven 紙箱、兩種盆栽）。

## 待辦
- 大步 v2（LAWWW2-C P2）：鞋盒牆、收銀台後盒子牆的鞋盒改 `printed`（Cardboard001 上印品牌色塊、側標、尺碼標），大小、顏色有變化，幾個露出蓋子或歪一點。六間交完再做。
