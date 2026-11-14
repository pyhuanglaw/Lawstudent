# 第③群幫手（claude/shop-cc0-g3）交班紀錄

任務：SHOP-REALISM-1112／SHOP-CC0-HELP-1113（D161）。派工：LAWWW-C（session_01Me1thu8Zn934H58kWKNfuF）；驗收：LAWWW2-C（session_015BuNi47yLUt5PviELapMNj）。
幫手算在 LAWWW 底下：不改 duty.json、tasks.json、CLAUDE.md、docs/rules；只推 `claude/shop-cc0-g3`。
做法、標準、工具：`docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`；這一群的重烘注意事項：`docs/art-rebuild/second_ai/cc0_help/g3/README.md`。

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的（P2／P3） |
|---|---|---|---|---|
| 大步球鞋 dabu | 已整合（LAWWW-C 884f09a7c3；LAWWW2 PASS） | a3a67aef7d；v2 腳本 3b7c829a79（鞋盒、層架離牆；沒烘、沒交） | `docs/art-rebuild/second_ai/cc0_help/g3/dabu.patch` | P2（LAWWW2）：鞋盒牆、收銀台後的盒子牆改 `printed`（Cardboard001 上印品牌色塊、側標、尺碼標），大小顏色有變化、幾個開蓋歪放 → v2；六間交完再做 |
| 好拍運動 haopai | LAWWW2 PASS（00:55；LAWWW2 在 582eb7d807 上重出 patch 交 LAWWW b5410f8654） | 6da531c6ee；v2 腳本 bce9db7e47（沒烘、沒交） | `docs/art-rebuild/second_ai/cc0_help/g3/haopai.patch` | v2（新生運動之後）：後段鐵架上的貨箱（程式拼的方塊＋標籤）換 Poly Haven cardboard_box_01，大小、角度有變化 |
| 同弦樂器 tongxian | 已交 LAWWW2 驗收（01:5x） | 768816c33c | `docs/art-rebuild/second_ai/cc0_help/g3/tongxian.patch`（底 2da495e693） | P3：畫面變化小（硬盒架上 PH 紙箱、長椅上 PH 烏克麗麗、天花板 Plaster001、金屬零件 Metal009 × 顏色） |
| glb_coplanar instancing（工具） | 已交 LAWWW2 驗收（LAWWW-C 01:43 同意；條件：單獨一包、全部前後對照、變多逐筆列、加小測——都做了） | edb96e33ec | `docs/art-rebuild/second_ai/cc0_help/g3/coplanar_instancing.patch`（底 2da495e693） | 前後對照 `cc0_help/g3/coplanar_instancing.md`：51 個模型、變少 8、變多 0 |
| 新生運動廣場 xinsheng_sports | LAWWW2-C 接手（11-14 01:10 分工調整）；交接說明 `docs/art-rebuild/second_ai/cc0_help/g3/xs_handover/README.md` | 252bc3765a（腳本） | （沒有） | 我這邊不再做 |
| 大口漢堡一樓 dakou_1f | LAWWW2 PASS（第二次，01:34；LAWWW2 在 07bbd8564e 重驗、交 LAWWW 506e12dc9f）；**v2（層架）腳本做好、沒烘、沒交**（腳本 3b7c829a79 為止的 dakou_interior.py；烘焙交班時停掉） | 7157a25df7（已整合版）；v2 腳本 05827e1f56 | `docs/art-rebuild/second_ai/cc0_help/g3/dakou.patch`（底 98a1bddf63，帶 place_gate_coplanar.json） | v2：①一樓櫃檯後層架彩色方塊改印刷包裝盒／罐子；對照圖加「一樓櫃檯後層架近看」 |
| 大口漢堡二樓 dakou_2f | LAWWW2 PASS（同上）；**v2（課本、紙袋、筆電）腳本做好、沒烘、沒交** | 7157a25df7（已整合版）；v2 腳本 05827e1f56 | 同上 | v2：②課本 Poly Haven book 或印刷書、紙袋有提把摺邊、筆電掃描模型；對照圖加「二樓長桌近看」 |

五間的建模腳本都已經改好、推上去（`tools/blender/env_second/bb_support/*_interior.py`＋共用 `cc0_kit.py`）；用腳本重建、還沒烘的原檔都過了店自己的單元測試、`shop_cc0_unit` 三項（LICENSES 列加上以後）。

## 交班（2026-11-14 02:05 UTC，使用者「現在換班」）
- 停在：大口 v2 一樓正在烘（被我停掉、沒烘完；assets 沒有被改）。好拍 v2、大步 v2 排隊中（也停了）。**v2 三間都還沒烘、沒交。**
- 已交、等驗收／整合：同弦 tongxian（768816c33c，tongxian.patch 底 2da495e693）、glb_coplanar instancing（edb96e33ec，coplanar_instancing.patch 底 2da495e693）。兩包誰後整合，後整合的要重跑 `--coplanar`（同弦那包的基準是舊工具算的）。
- 已整合：大步（884f09a7c3）、大口一二樓（2da495e693）、好拍（LAWWW2 b5410f8654）。新生運動 LAWWW2-C 接手。
- 本機（scratchpad，容器重開會不見；都能重做）：v2 的還沒烘原檔（dakou/v2、haopai/v2/haopai_v2_b.glb、dabu/v2）、大口 v2 的「改之前」近景（dakou/old_v2）、各店改之前截圖、鏡頭 json。開發分支 worktree 已拿掉。
- 接手的人：v2 從「用腳本重建」開始（腳本在分支上：dakou_interior.py、haopai_interior.py、dabu_interior.py 都是 v2 版）；好拍要做洞洞板兩步、用修正過的 bake_xs.sh 好拍段；大口二樓烘完 glb_fix_instnames 會對不上 `dakou_2f.23`（手動補 lm.json）。交件前在開發分支 worktree 跑 place_gate（不加參數）、再 --coplanar（只准變少），patch 用 `git diff --cached --summary` 看 mode。

## v2（02:2x 起；烘焙佇列：大口一樓 → 大口二樓 → 好拍 → 大步）
- 大口 v2（83cf92994c＋2d…）：一樓層架紙杯／PH 紙箱／餐巾紙；二樓課本（封面板、書背、書口）、紙袋（提把、摺邊）、筆電（鍵、觸控板）；課本不疊、書名離書背 1.5 mm。新工具算：一樓 3.67、二樓 2.12（都比整合版少）。對照圖要加「一樓櫃檯後層架近看」「二樓長桌近看」（改之前已拍：scratchpad dakou/old_v2）。
- 好拍 v2（bce9db7e47）：後段鐵架紙箱換 PH cardboard_box_01（大小照格子、角度偏一點）；做完照 README 洞洞板兩步；疊面 11.68→11.62。
- 大步 v2（3b7c829a79）：鞋盒盒身＋盒蓋（Cardboard001 每色一組、六色、大小錯開、15% 蓋子推開）；層架離牆 2 mm，疊面 33.11→18.22；50,938 面。
- 交件前：在開發分支 worktree 跑 place_gate（不加參數）→ --coplanar（若 coplanar_instancing 那包還沒整合，基準數字是舊工具算的）。

## 目前做到哪（2026-11-13 23:20 UTC）

- 11-14 00:04 容器又重開一次（大口二樓烘到一半），00:05 重排：大口二樓 → 好拍 → 同弦 → 新生運動。00:26 大口二樓烘好、00:4x 交件。
- 23:4x：新生運動足球修正（part 1＋recolor），重烘排在大口、好拍、同弦之後。
- 21:2x 容器重開過一次（烘焙佇列被砍掉，新生運動烘到一半）；23:17 重新排：新生運動 → 大口一樓 → 大口二樓 → 好拍（洞洞板版）→ 同弦（地板洞版），一間約 15～35 分（CPU、512 取樣）。
- 每烘完一間：補 `lightbake/<店>_lm.json`（`glb_fix_instnames.py` 對不上新 Poly Haven instancing 的名字會讓 `bake_xs.sh` 停在最後，見 cc0_help/g3/README.md）→ 拍新版（`fast_shots.py`）→ `cmp_sheet.py` 並排圖 → 店的測試 → patch（底＝當時開發分支最新）→ commit＋push → 通知 LAWWW2-C、副本 LAWWW-C → 更新這份。

## 本機有、沒推上去的（都在 scratchpad，容器重開會不見；都可以重做）

- 還沒烘的原檔：`<店>_new.glb`（用腳本重建）、`haopai_b.glb`（＋洞洞板兩步）、`tongxian_h.glb`（＋地板洞）。重做：跑腳本 `--out`，再照 cc0_help/g3/README.md 的事後步驟。
- 「改之前」截圖（五間，各 5～7 張）：重做＝用開發分支的 GLB 照同一份鏡頭拍（鏡頭 json 也在 scratchpad；格式見 HOWTO 第 4 節）。
- 好拍事後處理的工具 `glb_flip_faces.py`、`glb_split_tile.py`：在 `claude/second-ai-env-art` 的 `tools/blender/env_second/lightbake/`（開發分支沒有）。

## 出 patch 要注意
- `git diff --cached --summary` 看有沒有 mode change（11-14 好拍 patch 把 bake_xs.sh 755 改成 644，LAWWW2 抓到；make_patch 已改成照底的 mode）。
- 疊面：交件前在開發分支的 worktree 跑 `node tests/place_gate_unit.js`（不加參數）確認沒有新問題，再 `--coplanar`（只准變少）；patch 帶 `tests/place_gate_coplanar.json`。

## 下一個接手的人從哪裡開始

1. `bash tools/blender/setup_env.sh`；`/opt/blenv/bin/pip install pillow numpy`；`pip install playwright`（fast_shots 要）。
2. 看上面的表：沒有 patch 的店，從「用腳本重建原檔」開始（`/opt/blenv/bin/python tools/blender/env_second/bb_support/<店>_interior.py -- --out <tmp>.glb`；大口 `--floor 1|2`），好拍、同弦再做 README 的事後步驟。
3. 拍「改之前」（開發分支的 GLB）→ `IN=<原檔> bash tools/blender/env_second/lightbake/bake_xs.sh <店>`（好拍那一段要改成 `HIDE='glass'`、NOLM 加 `WALL_right_pegwall_alpha`）→ 拍新版 → 並排圖、測試、patch、交 LAWWW2-C。
4. 大步 v2（P2）最後做。
