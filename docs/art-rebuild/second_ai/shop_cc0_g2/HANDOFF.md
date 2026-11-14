# 幫手 g2 交班紀錄（SHOP-REALISM-1112／SHOP-CC0-HELP-1113；LAWWW-C 派的店面 CC0 化幫手，算在 LAWWW 底下）

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的（P2／P3） |
|---|---|---|---|---|
| 青木茶室 aoki | **LAWWW2 PASS**（v2）→ 已轉 LAWWW | 077485f27e | `docs/art-rebuild/second_ai/cc0_g2/aoki_cc0.patch`（底 4556c4be0，不帶 cc0_kit.py） | 等 LAWWW 整合 |
| Daybreak | **LAWWW2 PASS**（v2，已在開發分支）；**v2.1b**（P1）雙孔義式機、只留一台磨豆機；疊面已修（義式機抬 3 mm，always 1.44→1.40 ≤ 基準 1.42），還沒烘 | 6f3f069af（v2.1b 腳本） | 還沒出 | 單車之後重建未烘焙 → `bake_gg_new.sh aa_daybreak` → 先跑 place_gate（不加 --write）確認沒「比基準多」→ 拍五格、patch、交 |
| 頁間書屋 yejian | **v4 已交 LAWWW2 驗收**（11-14；小盆栽葉片卡、椅子 walnut_veneer、雙孔義式機、CashRegister_01） | 389adca8c0 | `docs/art-rebuild/second_ai/cc0_g2/yejian_cc0.patch`（底 2da495e69） | 等 LAWWW2 判 |
| 山嵐書店 shanlan | **自己退回、等重烘**（v2 小盆栽葉片卡、鏡頭換位置；v3 門把改黑鐵：店面牆分組回到 10 個，tests/xs_lm_unit.js 第 4 項） | 16dd002f4（v3 腳本） | 還沒做 | 唱片之後：`bake_xs.sh shanlan` → 拍、patch、交；7.96 萬面 |
| 慢輪單車 bike | **LAWWW2 PASS**（v1，LAWWW2 重出 patch 給 LAWWW）；**v2 已建模、還沒烘** | a26a2b34d（v2 腳本） | v2 還沒出 | v2 層架：方盒減半→印刷包裝盒（自製圖集×Cardboard001，有傾斜、開蓋）、車燈 4→2、水壺有瓶蓋、鎖最多 3 組、Poly Haven tire_pump＋old_tyre；59,746 面。山嵐之後烘 → 拍（並排圖加「近看右牆層架」）、patch、交 |
| 轉角唱片 corner | **自己退回、等重烘**（v2 大盆栽的盆子改 cr_vc：材質數回到 12，tests/corner_glb_unit.js 第 1 項）；交班時烘到一半中斷 | 5ebe2f46c（v2 腳本） | 還沒做 | 整間重烘（`IN=<未烘焙> bake_gg_new.sh corner`）→ 拍、patch、交；tests/corner_shop_unit.js 第 1 項寫死的 GLB 大小要跟著更新（說明裡寫清楚） |
| 日和便利店 cvs | **改由 LAWWW2 做**（11-13 22:31 LAWWW2 選 ①），LAWWW2 已交 LAWWW（6ecd6495c8） | — | — | 我這邊不做 |

## 目前做到哪（2026-11-14 09:5x，使用者「g2 恢復開工」）
- 使用者用量只剩約 10%：LAWWW-C 排的順序＝唱片 v2 → 山嵐 v3（開發分支 shop_cc0 還沒過的兩間，最優先）→ Daybreak v2.1b、單車 v2（做不到就算了）。每間做完馬上出 patch（底＝開發分支最新）、push、通知 LAWWW-C。
- 背景：`/tmp/claude-0/g2/bakeq8.sh` 依序烘唱片 → 山嵐（09:5x 開始）。中斷的話：用分支上的腳本重建未烘焙 GLB、再烘。
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
