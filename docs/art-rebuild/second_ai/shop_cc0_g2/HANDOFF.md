# 幫手 g2 交班紀錄（SHOP-REALISM-1112／SHOP-CC0-HELP-1113；LAWWW-C 派的店面 CC0 化幫手，算在 LAWWW 底下）

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的（P2／P3） |
|---|---|---|---|---|
| 青木茶室 aoki | **LAWWW2 PASS**（v2）→ 已轉 LAWWW | 077485f27e | `docs/art-rebuild/second_ai/cc0_g2/aoki_cc0.patch`（底 4556c4be0，不帶 cc0_kit.py） | 等 LAWWW 整合 |
| Daybreak | **LAWWW2 PASS**（v2）→ 已併進 LAWWW2 給 LAWWW 的合包；**v2.1（P1）烘焙排隊中**：雙孔義式機、磨豆機 | b37f2a7c4（v2.1 腳本） | v2.1 還沒出 | 烘完：拍五格、並排圖、patch（底用開發分支最新） |
| 頁間書屋 yejian | **自己退回、等重烘**（v3 小盆栽葉片卡、椅子 walnut_veneer；v4 咖啡機改雙孔義式機） | 3be30ee2d（v4 腳本） | 還沒做 | Daybreak v2.1 烘完接著烘 → 拍、交 |
| 山嵐書店 shanlan | **等重烘**（小盆栽改回葉片卡；「從裡面朝門口」鏡頭換位置，改之前那張已重拍） | a09e6811c（腳本） | 還沒做 | 唱片之後重烘 → 拍、交；7.96 萬面 |
| 慢輪單車 bike | **LAWWW2 PASS**（v1，LAWWW2 重出 patch 給 LAWWW）；**v2 排隊（LAWWW2 11-14 要）** | c180ee1f75（v1） | v1：`docs/art-rebuild/second_ai/cc0_g2/bike_cc0.patch` | v2：右牆層架方盒砍一半→印刷包裝盒（Cardboard001＋色塊、側標、大小顏色變化、歪放／開蓋）、水壺改有瓶蓋弧形瓶身、省下的面數放 1～2 件 Poly Haven（tire_pump／metal_toolbox／old_tyre）、並排圖加「近看右牆層架」；窗外照片 LAWWW2 在重拍不用管 |
| 轉角唱片 corner | **烘焙完成、拍截圖中** | 414255814 | 還沒做 | 拍完 → 並排圖、patch、交 |
| 日和便利店 cvs | **改由 LAWWW2 做**（11-13 22:31 LAWWW2 選 ①），LAWWW2 已交 LAWWW（6ecd6495c8） | — | — | 我這邊不做 |

## 目前做到哪（2026-11-14 00:4x）
- 背景烘焙（一次一間）：唱片（烘焙中）→ 山嵐 → Daybreak v2.1 → 頁間 v4。每間約 25～35 分鐘。輸入是 `/tmp/claude-0/g2/unbaked/<店>.glb`（用分支上的腳本重建得出來），輸出寫回 `assets/models/env/second_ai/{aa,bb}_support/<店>.glb`＋`_lm_day/night.webp`。
- 每間交件流程（照 `docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`）：烘完 → `fast_shots.py` 拍五格（參考鏡頭、門口、從裡面朝門口、近看吧台／櫃台、20:00）→ 自己看並排圖 → `/tmp/claude-0/g2/bin/mkpatch.py`（底＝開發分支最新；LICENSES 只加這間的列、基準表只拿掉這間、coplanar 只換這間、附 `place_gate --write` 重產的 SHOP_STANDARD_STATUS.md）→ 在乾淨副本套 patch 跑 `shop_cc0_unit`、`place_gate`、這間店相關測試 → commit＋push → 傳 LAWWW2-C（副本 LAWWW-C）。
- 學到的（下一個人照做）：Wood049 用在細木條、椅腳上太碎（青木 v1 退件）→ 細木件用 Poly Haven `walnut_veneer`；Poly Haven `potted_plant_04` 減到三百面以下變一團灰 → 小盆栽用原本的葉片卡、只有大盆栽用 `potted_plant_02`；不鏽鋼 Metal009 在遊戲裡要 metal≤0.25、vary 0.04，不然像水泥；Plastic006 當頂點色乘的紋理要 vary 0.015、法線 0.25，不然淺色包裝有灰黑刮痕。

## 本機有沒有沒推的東西
- 分支上的東西都推了（每次 commit 就 push）。
- 只在本機（容器重開就沒了，但都重建得出來）：`/tmp/claude-0/g2/`——未烘焙 GLB、截圖（改之前／新版）、並排圖草稿、`bin/`（mkpatch.py、lic_add.py、glbinfo.js、mkshots.py）、各店 LICENSES 列（`lic_<店>.json`）、鏡頭設定（`cams.json`、`pos.json`）。改之前的截圖要用開發分支原檔拍（`git show origin/claude/adoring-meitner-mqzst8:<GLB>` 暫時蓋到 assets 再拍）。

## 下一個接手的人從哪一步開始
1. `git fetch origin claude/shop-cc0-g2`，看上面的表。
2. 新容器：`bash tools/blender/setup_env.sh`；`/opt/blenv/bin/python -m pip install pillow numpy`；`pip install playwright`（fast_shots 用）。
3. 還沒交的店：用分支上的腳本重建 → 烘（`IN=<未烘焙> bash tools/blender/env_second/lightbake/bake_gg_new.sh aa_daybreak|bb_bike|corner|yejian`、`bake_xs.sh shanlan`；烘焙中不要改 .sh，先複製一份再跑）→ 照上面的交件流程。
4. 交件說明範例：`docs/art-rebuild/second_ai/cc0_g2/aoki.md`；共用檔的改動說明：`tools/blender/env_second/aa_support/README_cc0_g2.md`。
