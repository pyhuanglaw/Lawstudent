# 幫手 g2 交班紀錄（SHOP-REALISM-1112／SHOP-CC0-HELP-1113；LAWWW-C 派的店面 CC0 化幫手，算在 LAWWW 底下）

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的（P2／P3） |
|---|---|---|---|---|
| 青木茶室 aoki | **LAWWW2 PASS**（v2）→ 已轉 LAWWW | 077485f27e | `docs/art-rebuild/second_ai/cc0_g2/aoki_cc0.patch`（底 4556c4be0，不帶 cc0_kit.py） | 等 LAWWW 整合 |
| Daybreak | **LAWWW2 PASS**（v2.1b；已轉 LAWWW-C，patch 2f4ccad37a） | 58ce364c6e | `docs/art-rebuild/second_ai/cc0_g2/daybreak_cc0.patch`（底 ed792633a） | 等 LAWWW 整合；門框底部自疊 0.139 m² 先不改（LAWWW2 記著） |
| 頁間書屋 yejian | **LAWWW2 PASS**（v4；LAWWW2 重出 patch 交 LAWWW-C b57169085b） | 389adca8c0 | `docs/art-rebuild/second_ai/cc0_g2/yejian_cc0.patch` | P3：小盆栽可試 potted_plant_02 縮小重用或低面數 CC0 小盆栽 |
| 山嵐書店 shanlan | **LAWWW2 PASS（v3，已轉 LAWWW-C，底 6fe2265f29）**；shop_cc0 待做名單整合後清空 | fbb14ee0ef | `docs/art-rebuild/second_ai/cc0_g2/shanlan_cc0.patch`（底 07bf3613b） | 等 LAWWW 整合 |
| 慢輪單車 bike | **LAWWW2 PASS**（v1，已在開發分支）；**v2.1 已交 LAWWW2 驗收**（11-14；層架印刷包裝盒、tire_pump、old_tyre；零件盒互插已修，疊面和開發分支一樣） | d8ee8b27c2 | `docs/art-rebuild/second_ai/cc0_g2/bike_cc0.patch`（底 4cc26d4b8） | 等 LAWWW2 判 |
| 轉角唱片 corner | **LAWWW2 PASS（v2，已轉 LAWWW-C，底 452a96aa6c）**（11-14 10:2x；盆子 cr_vc、烘後重複材質用 glb_merge_dup_mat.py 併回，材質數 12） | 26b1f7976b | `docs/art-rebuild/second_ai/cc0_g2/corner_cc0.patch`（底 15be72634） | 等 LAWWW2 判；以後重烘唱片，烘完要跑 glb_merge_dup_mat.py |
| 日和便利店 cvs | **改由 LAWWW2 做**（11-13 22:31 LAWWW2 選 ①），LAWWW2 已交 LAWWW（6ecd6495c8） | — | — | 我這邊不做 |

## 目前做到哪（2026-11-14 11:xx）
- LAWWW-C 排的四間全部交了：唱片 v2、山嵐 v3＝LAWWW2 PASS；Daybreak v2.1b＝PASS；單車 v2.1＝等 LAWWW2 驗收（11:2x 已交 d8ee8b27c2）。背景沒有東西在跑。
- 下一步：等 LAWWW2 的驗收結果；退件就照意見修、重烘、重交；全部 PASS 就沒有派給 g2 的工作了。
- 每間交件流程（照 `docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`）：烘完 → `fast_shots.py` 拍五格（參考鏡頭、門口、從裡面朝門口、近看吧台／櫃台、20:00）→ 自己看並排圖 → `/tmp/claude-0/g2/bin/mkpatch.py`（底＝開發分支最新；LICENSES 只加這間的列、基準表只拿掉這間、coplanar 只換這間、附 `place_gate --write` 重產的 SHOP_STANDARD_STATUS.md）→ 在乾淨副本套 patch 跑 `shop_cc0_unit`、`place_gate`、這間店相關測試 → commit＋push → 傳 LAWWW2-C（副本 LAWWW-C）。
- 交件前（LAWWW2 11-14 新流程）：先 `node tests/place_gate_unit.js`（不加 --write），有「比基準多」就先修模型重烘；沒有才 `--coplanar --write`；不准 `--allow-grow`。套 patch 後跑這間店相關的全部測試，和沒套 patch 的開發分支逐支比（唱片、山嵐就是這樣抓到材質數、牆分組的問題）。
- 學到的（下一個人照做）：Wood049 用在細木條、椅腳上太碎（青木 v1 退件）→ 細木件用 Poly Haven `walnut_veneer`；Poly Haven `potted_plant_04` 減到三百面以下變一團灰 → 小盆栽用原本的葉片卡、只有大盆栽用 `potted_plant_02`；不鏽鋼 Metal009 在遊戲裡要 metal≤0.25、vary 0.04，不然像水泥；Plastic006 當頂點色乘的紋理要 vary 0.015、法線 0.25，不然淺色包裝有灰黑刮痕。

## 本機有沒有沒推的東西
- 分支上的東西都推了（每次 commit 就 push）。
- 只在本機（容器重開就沒了，但都重建得出來）：`/tmp/claude-0/g2/`——未烘焙 GLB、截圖（改之前／新版）、並排圖草稿、`bin/`（mkpatch.py、lic_add.py、glbinfo.js、mkshots.py）、各店 LICENSES 列（`lic_<店>.json`）、鏡頭設定（`cams.json`、`pos.json`）。改之前的截圖要用開發分支原檔拍（`git show origin/claude/adoring-meitner-mqzst8:<GLB>` 暫時蓋到 assets 再拍）。

## 下一個接手的人從哪一步開始
1. `git fetch origin claude/shop-cc0-g2`，看上面的表。
2. 新容器：`bash tools/blender/setup_env.sh`；`/opt/blenv/bin/python -m pip install pillow numpy`；`pip install playwright`（fast_shots 用）。
3. 還沒交的店：用分支上的腳本重建 → 烘（`IN=<未烘焙> bash tools/blender/env_second/lightbake/bake_gg_new.sh aa_daybreak|bb_bike|corner|yejian`、`bake_xs.sh shanlan`；烘焙中不要改 .sh，先複製一份再跑）→ 照上面的交件流程。
4. 交件說明範例：`docs/art-rebuild/second_ai/cc0_g2/aoki.md`；共用檔的改動說明：`tools/blender/env_second/aa_support/README_cc0_g2.md`。
