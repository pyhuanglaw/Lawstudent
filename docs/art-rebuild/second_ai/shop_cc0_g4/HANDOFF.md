# 幫手 g4 交班紀錄（SHOP-CC0-HELP-1113／SHOP-REALISM-1112，第④群）

派工：LAWWW-C（session_01Me1thu8Zn934H58kWKNfuF）；驗收：LAWWW2-C（session_015BuNi47yLUt5PviELapMNj）。幫手算在 LAWWW 底下，不改 duty.json、tasks.json。
做法、驗收標準、工具：`docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`。共用工具：`tools/blender/env_second/bb_support/cc0kit.py`（acg／ph_put／RCMesh 照顏色分材質組）。

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的 P2／P3 |
|---|---|---|---|---|
| 林家乾麵 lin_interior | 已整合（f6449442c） | 8229212a9 | `lin_v2.patch` | 無 |
| 花序 flower_notes_interior | 已整合（f6449442c） | 62e19bd05 | `flower_v3.patch` | 無（P2 花束改 Poly Haven 花：LAWWW2-C 11-13 23:19 自己接手） |
| 公館燒臘 shaola_interior | 已整合（19399e5d3） | 37a58d3de | `shaola_v8.patch` | 無 |
| 阿德影印 ade | v2.1 LAWWW2 PASS（LAWWW2 在 626c128e54 上和南洋合成一包給 LAWWW） | 見本次 commit | `ade_v21.patch`（底 bf9d623e6，整份取代 ade_v2.patch） | 無 |
| 洋洋鹹酥雞 yangyang_interior | 已交 LAWWW2 驗收（v2b） | 見本次 commit | `yangyang_v2.patch`（底 e687f2f3b） | 無 |
| 南洋戲院 nanyang_lobby | LAWWW2 PASS（v6，LAWWW2 和阿德 v2.1 合成一包給 LAWWW） | dc93e7768 | `nanyang_v6.patch`（底 4556c4be0） | P2（LAWWW2，下一版）：①飲料櫃的瓶子是純色瓶形 ②櫃檯那疊紅杯子是一整塊 ③入口左邊黑色立式方箱純黑（參考圖沒有，換掃描或拿掉） |

## 目前做到哪（2026-11-13 23:15）
- 南洋戲院 v6：已交 LAWWW2（nanyang_v6.patch、nanyang_cmp.jpg）。
- 阿德影印 v2.1：已交 LAWWW2（ade_v21.patch、ade21_cmp.jpg）。
- 洋洋鹹酥雞 v2b：已交 LAWWW2（yangyang_v2.patch、yangyang_cmp.jpg；補寫的 lightbake/glb_add_viewcard.py 在 patch 裡）。六間都交完。
- 交件方式：每間一份 patch，在乾淨的 worktree（底＝開發分支最新＋只放這間店的檔）跑 place_gate 重產兩個檔、跑店的測試，再 `git diff --cached --binary` 出 patch。不要直接合 g4 分支（上面有其他店的 WIP）。

## 本機有沒有沒推的東西
- 六間的烘焙成品都已經在本分支的 assets、各自的 patch 裡（scratchpad 的 bake_* 只是原檔）。要重做：照 HOWTO 用本分支的建模腳本重建 GLB（`/opt/blenv/bin/python tools/blender/env_second/bb_support/<店>_interior.py -- --out <tmp>.glb`），再 `IN=<tmp>.glb OUTDIR=<資料夾> bash tools/blender/env_second/lightbake/bake_gg_new.sh <bb_ade|yangyang>` 或 `bake_xs.sh nanyang_lobby`（約 20～40 分鐘一間，一次一間）。
- 分支上的 assets GLB 是 WIP（有的沒烘），以 patch 為準。

## 下一個接手的人從哪一步開始
1. `git fetch`，切到 `claude/shop-cc0-g4`，merge 開發分支最新。新容器先 `bash tools/blender/setup_env.sh`、`/opt/blenv/bin/pip install pillow numpy`、`pip install playwright`。
2. 照上表「還沒交」的三間（南洋、阿德 v2.1、洋洋），各自重建＋烘焙（如果 scratchpad 沒了）→ 拍圖（`tools/blender/env_second/shots/fast_shots.py`；洋洋白天用 17:30）→ 並排圖（`shots/cmp_sheet.py`）→ worktree 出 patch → send_message 給 LAWWW2-C、副本 LAWWW-C。
3. 每交一間、每推一次更新這份表。
