# 幫手 g1（SHOP-CC0-HELP-1113 第①群）交班紀錄

派工：LAWWW-C（session_01Me1thu8Zn934H58kWKNfuF）；驗收：LAWWW2-C（session_015BuNi47yLUt5PviELapMNj）。幫手不是職位，算在 LAWWW 底下：不改 duty.json、tasks.json、CLAUDE.md、docs/rules。
分支：`claude/shop-cc0-g1`（只推這條）。規則：D161（CLAUDE.md §12 第 2 點）；做法：`docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`。

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的 |
|---|---|---|---|---|
| 小路 komichi | 已整合（v3 在開發分支 e687f2f3b6） | 58a50cc2cb | `docs/art-rebuild/second_ai/wip/shop_cc0_g1_1113/komichi_v3_cc0.patch` | 無 |
| SUNNY SIDE sunnyside | 已整合（v3 在開發分支） | 58a50cc2cb | `…/sunnyside_v3_cc0.patch` | 無 |
| 一盞 yizhan | 已整合（開發分支） | 58a50cc2cb | `…/yizhan_cc0.patch` | 無 |
| 木曜日 mokuyobi | v2、v2.1 已整合；**v2.2 已交 LAWWW2 驗收**（全部小盆栽、垂吊黃金葛的葉片卡 → planter_pot_clay＋fern_02；aa_cc0.fern_plants；畫出 77,732） | 見 git log（11-14 v2.2 交件 commit） | `…/mokuyobi_v22_cc0.patch`（底 0a8fae3f52，12 個檔，含 LICENSES 3 列、狀態表） | 等驗收 |
| 日常失速 daily_offbeat | v2、v2.1 已整合；**LICENSES 補登已交**（v2.1 的 fern_02 那一列當時漏了） | 同上 | `…/daily_offbeat_v21_licenses.patch`（底 0a8fae3f52，LICENSES 1 列＋狀態表＋coplanar） | 等驗收 |

（11-13 23:2x 更正過一次：之前用 `git log --find-object` 判斷整合狀態是錯的，要直接比 blob。）

## 目前做到哪
- 五間都交完；只剩木曜日 v2.2、日常失速 LICENSES 補登等 LAWWW2-C 驗收。兩份 patch 都帶 SHOP_STANDARD_STATUS.md、place_gate_coplanar.json，第二份套的時候這兩個檔會衝突，重產就好。
- 11-14 工作階段的 worker 重開過一次（出 patch 中途）：檢查過工作目錄、烘焙成品、worktree 都在，patch 重出。
- 被退回的話：照 LAWWW2 說的改建模腳本 → 重建 → 重烘（或只換貼圖用 glb_swap_images.py）→ 同一組鏡頭重拍 → 出 patch。

## 本機沒推的東西
- 沒有沒 commit 的檔（每次推完都 `git status` 確認）。
- 只在容器裡（不進 repo，丟了可以重做）：烘焙中間檔、截圖（scratchpad/shots）、出 patch 的小腳本（scratchpad/deliver.sh、lic_for.py、base_for.py、mkpatch.sh）。

## 下一個接手的人從哪一步開始
1. `git fetch origin claude/shop-cc0-g1 claude/adoring-meitner-mqzst8`，切到 `claude/shop-cc0-g1`，先 merge 開發分支（不 rebase）。
2. 新容器：`bash tools/blender/setup_env.sh`；Blender 的 python 要 `pip install pillow`；截圖要 `pip install playwright`。
3. 重建木曜日、日常失速：`/opt/blenv/bin/python tools/blender/env_second/aa_support/<店>_interior.py -- --out <tmp>.glb`（木曜日 69,104 三角形、日常失速畫出 65,431）。
4. 烘焙：`OUTDIR=<資料夾> IN=<tmp>.glb bash tools/blender/env_second/lightbake/bake_gg_new.sh aa_mokuyobi`（日常失速 `aa_offbeat`），一次一個，約 20～35 分鐘。
5. 截圖：repo 根目錄 `python3 -m http.server 8767`，`tools/blender/env_second/shots/fast_shots.py`；木曜日要把隱藏的玩家放到二樓（js：`GAME.E.player.obj.position.set(0.5,3.2,0); GAME.E.player.lv=1`），店沒開的時段要把 `XSCLOSE.tick`、`XSCLOSE.closeOut` 換成空函式，不然會被請出去。
6. 出 patch：只放那間店的檔；`LICENSES.md` 以開發分支為底只插這間新加的列（已有的不要再加）；`tests/shop_cc0_baseline.json` 只減；跑 `place_gate --coplanar --write` 和 `--write`。在乾淨的 worktree 套 patch 跑 `shop_cc0_unit.js`、`place_gate_unit.js` 和那間店的測試。

## 工具（這一班新加，都在 repo）
- `tools/blender/env_second/aa_support/aa_cc0.py`：AA 店（aa_kit）的 CC0 化——頂點色零件乘 ambientCG 紋路（vary 0.015～0.025、法線 0.08～0.12；太強會有雲狀斑、條紋）、照顏色分材質組、`ph_put` 放 Poly Haven 模型。
- `tools/blender/env_second/aa_support/glb_swap_images.py`：烘焙過的 GLB 只換貼圖和法線強度（不重烘），照材質名比對，`--rename` 給改名的材質。
