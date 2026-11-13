# 幫手 g4 交班紀錄（SHOP-CC0-HELP-1113／SHOP-REALISM-1112，第④群）

派工：LAWWW-C（session_01Me1thu8Zn934H58kWKNfuF）；驗收：LAWWW2-C（session_015BuNi47yLUt5PviELapMNj）。幫手算在 LAWWW 底下，不改 duty.json、tasks.json。
做法、驗收標準、工具：`docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`。共用工具：`tools/blender/env_second/bb_support/cc0kit.py`（acg／ph_put／RCMesh 照顏色分材質組）。

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的 P2／P3 |
|---|---|---|---|---|
| 林家乾麵 lin_interior | 已整合（f6449442c） | 8229212a9 | `lin_v2.patch` | 無 |
| 花序 flower_notes_interior | 已整合（f6449442c） | 62e19bd05 | `flower_v3.patch` | 無（P2 花束改 Poly Haven 花：LAWWW2-C 11-13 23:19 自己接手） |
| 公館燒臘 shaola_interior | 已整合（19399e5d3） | 37a58d3de | `shaola_v8.patch` | 無 |
| 阿德影印 ade | LAWWW2 PASS（v2，轉 LAWWW 整合） | 17538fd36 | `ade_v2.patch` | P2（LAWWW2）：鐵層架便利貼大小一樣 → v2.1 已改、已烘（scratchpad bake_ade21），還沒拍圖、還沒交 |
| 洋洋鹹酥雞 yangyang_interior | 烘焙中（v2b） | 181e2a27c（腳本） | 還沒出 | 交件前：17:30 拍圖（店 17:00 才開，13:00 拍會被請出去拍到街上） |
| 南洋戲院 nanyang_lobby | 已烘完、還沒拍圖、還沒交 | 8229212a9（腳本） | 還沒出 | 無 |

## 目前做到哪（2026-11-13 23:15）
- 南洋戲院 v6：烘焙完（scratchpad `bake_ny/`），下一步：拍改之前／新版同鏡頭＋近景、跑 xs_lm、nanyang 那批測試、出 patch（底＝開發分支最新、附 `node tests/place_gate_unit.js --coplanar --write`、`--write` 重產的 place_gate_coplanar.json、SHOP_STANDARD_STATUS.md）。
- 阿德影印 v2.1：便利貼改好、烘焙完（scratchpad `bake_ade21/`），下一步同上。
- 洋洋鹹酥雞 v2b：cc0kit 的盆栽高度 bug 修好（181e2a27c）後重建、重烘中（scratchpad `bake_yy2/`）。`bake_gg_new.sh` 呼叫的 `lightbake/glb_add_viewcard.py` 開發分支上沒有，我補寫了一支（在本分支，照原本洋洋那張窗景卡的格式），要一起進 patch。
- 交件方式：每間一份 patch，在乾淨的 worktree（底＝開發分支最新＋只放這間店的檔）跑 place_gate 重產兩個檔、跑店的測試，再 `git diff --cached --binary` 出 patch。不要直接合 g4 分支（上面有其他店的 WIP）。

## 本機有沒有沒推的東西
- 烘焙成品在 scratchpad（容器重開會不見）：`bake_ny/`、`bake_ade21/`、`bake_yy2/`。沒推。要重做：照 HOWTO 用本分支的建模腳本重建 GLB（`/opt/blenv/bin/python tools/blender/env_second/bb_support/<店>_interior.py -- --out <tmp>.glb`），再 `IN=<tmp>.glb OUTDIR=<資料夾> bash tools/blender/env_second/lightbake/bake_gg_new.sh <bb_ade|yangyang>` 或 `bake_xs.sh nanyang_lobby`（約 20～40 分鐘一間，一次一間）。
- 分支上的 assets GLB 是 WIP（有的沒烘），以 patch 為準。

## 下一個接手的人從哪一步開始
1. `git fetch`，切到 `claude/shop-cc0-g4`，merge 開發分支最新。新容器先 `bash tools/blender/setup_env.sh`、`/opt/blenv/bin/pip install pillow numpy`、`pip install playwright`。
2. 照上表「還沒交」的三間（南洋、阿德 v2.1、洋洋），各自重建＋烘焙（如果 scratchpad 沒了）→ 拍圖（`tools/blender/env_second/shots/fast_shots.py`；洋洋白天用 17:30）→ 並排圖（`shots/cmp_sheet.py`）→ worktree 出 patch → send_message 給 LAWWW2-C、副本 LAWWW-C。
3. 每交一間、每推一次更新這份表。
