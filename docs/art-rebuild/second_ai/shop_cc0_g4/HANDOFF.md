# 幫手 g4 交班紀錄（SHOP-CC0-HELP-1113／SHOP-REALISM-1112，第④群）

派工：LAWWW-C（session_01Me1thu8Zn934H58kWKNfuF）；驗收：LAWWW2-C（session_015BuNi47yLUt5PviELapMNj）。幫手算在 LAWWW 底下，不改 duty.json、tasks.json（D163）。
做法、驗收標準、工具：`docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`。共用工具：`tools/blender/env_second/bb_support/cc0kit.py`（acg／ph_put／RCMesh 照顏色分材質組；已進開發分支）。

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的 P2／P3 |
|---|---|---|---|---|
| 林家乾麵 lin_interior | 已整合（f6449442c） | 8229212a9 | `lin_v2.patch` | 無 |
| 花序 flower_notes_interior | 已整合（f6449442c） | 62e19bd05 | `flower_v3.patch` | 無（P2 花束：LAWWW2-C 自己接手、已交 b774ec3f17） |
| 公館燒臘 shaola_interior | 已整合（19399e5d3） | 37a58d3de | `shaola_v8.patch` | 無 |
| 阿德影印 ade | LAWWW2 PASS（v2.1；LAWWW2 在 626c128e54 上和南洋合成一包給 LAWWW） | cb8fabdd4 | `ade_v21.patch`（整份取代 ade_v2.patch） | 無 |
| 南洋戲院 nanyang_lobby | LAWWW2 PASS（v6；同上那一包） | dc93e7768 | `nanyang_v6.patch` | P2（下一版）：①飲料櫃的瓶子是純色瓶形 ②櫃檯那疊紅杯子是一整塊 ③入口左邊黑色立式方箱純黑（參考圖沒有，換掃描或拿掉） |
| 洋洋鹹酥雞 yangyang_interior | LAWWW2 PASS（v2b；LAWWW2 在 04ac5af9ed 上重出 patch 給 LAWWW） | 70a4be126 | `yangyang_v2.patch` | P2（下一版）：牆上層架的瓶罐還是純色瓶形 |

**整合狀態**：六間全部 LAWWW2 PASS；林家、花序、燒臘已進開發分支；阿德 v2.1＋南洋、洋洋由 LAWWW2 重出的 patch 交 LAWWW-C 整合（以 LAWWW2 那兩包為準，不用我的 ade_v21／nanyang_v6／yangyang_v2 patch）。
**下一版 P2 四點**（南洋三點＋洋洋一點）沒有派工，等 LAWWW-C 決定要不要再開幫手做。

## 目前做到哪（2026-11-14 00:10）
- 第④群六間都交完、都 PASS。幫手 g4 收尾：沒有進行中的工作。
- 交件方式（給下一個幫手參考）：每間一份 patch，在乾淨的 worktree（底＝開發分支最新＋只放這間店的檔）跑 `node tests/place_gate_unit.js --coplanar --write`、`--write` 重產兩個檔、跑店的測試，再 `git diff --cached --binary` 出 patch；LICENSES 以開發分支為準只插那間店的列。不要直接合 g4 分支（上面的 assets 有 WIP 的歷史）。
- 踩過的坑：①ph_obj 原型要照高度分開（181e2a27c 已修）②洋洋 17:00 才開，白天截圖拍 17:30（13:00 會被請出店外、拍到街上）③`bake_gg_new.sh` 的窗景卡要 `lightbake/glb_add_viewcard.py`（補寫在洋洋 patch 裡）④截圖前確認 `python3 -m http.server 8767` 還活著。

## 本機有沒有沒推的東西
- 沒有。全部 commit 都已 push 到 `claude/shop-cc0-g4`；scratchpad 的 bake_*、截圖只是中間檔，成品都在 patch 和分支裡。

## 下一個接手的人從哪一步開始
- 第④群沒有剩下的店。要做下一版 P2（南洋三點、洋洋一點）：`git fetch`、新分支從開發分支最新開，照 HOWTO＋上面的交件方式；改 `bb_support/nanyang_interior.py`（飲料櫃瓶子、紅杯子、入口黑方箱）、`bb_support/yangyang_interior.py`（牆上層架瓶罐），重建、重烘（`bake_xs.sh nanyang_lobby`、`bake_gg_new.sh yangyang`）、拍圖、出 patch 交 LAWWW2-C。
