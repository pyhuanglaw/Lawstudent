# 第③群幫手（claude/shop-cc0-g3）交班紀錄

任務：SHOP-REALISM-1112／SHOP-CC0-HELP-1113（D161）。派工：LAWWW-C（session_01Me1thu8Zn934H58kWKNfuF）；驗收：LAWWW2-C（session_015BuNi47yLUt5PviELapMNj）。
幫手算在 LAWWW 底下：不改 duty.json、tasks.json、CLAUDE.md、docs/rules；只推 `claude/shop-cc0-g3`。
做法、標準、工具：`docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`；這一群的重烘注意事項：`docs/art-rebuild/second_ai/cc0_help/g3/README.md`。

## 全部待辦

| 店 | 狀態 | 最後 SHA | patch | 還沒做的（P2／P3） |
|---|---|---|---|---|
| 大步球鞋 dabu | 已整合（LAWWW-C 884f09a7c3；LAWWW2 PASS） | a3a67aef7d | `docs/art-rebuild/second_ai/cc0_help/g3/dabu.patch` | P2（LAWWW2）：鞋盒牆、收銀台後的盒子牆改 `printed`（Cardboard001 上印品牌色塊、側標、尺碼標），大小顏色有變化、幾個開蓋歪放 → v2；六間交完再做 |
| 好拍運動 haopai | 已交 LAWWW2 驗收（00:5x） | 本次交件 commit | `docs/art-rebuild/second_ai/cc0_help/g3/haopai.patch` | P3：畫面變化小（球拍框、羽球筒、桌球拍換 CC0 材質組 × 顏色；地上兩箱 PH 紙箱）；patch 帶了修正過的 bake_xs.sh 好拍段 |
| 同弦樂器 tongxian | 烘焙中（排第 5） | 腳本 11dd2b9e42 | （還沒有） | 要挖樓梯間地板洞（`glb_floor_hole.py`，已對新原檔做好）；`xs_lm_unit` instancing 29→30；第一次烘的沒挖洞，已丟掉 |
| 新生運動廣場 xinsheng_sports | 烘焙中（排最後：第一次烘好 23:28，看截圖發現足球用到洩氣的舊球，改充飽的白球後重烘） | 腳本 252bc3765a | （還沒有） | 烘完：拍新版（鏡頭 cams.json＋cams2.json 近景）、並排圖、測試（xs_lm_unit instancing 56→57 已改）、patch |
| 大口漢堡一樓 dakou_1f | 退回要改（00:41 LAWWW2：LAWWW 整合時 place_gate 牆疊面 5.13→6.81）→ 已修（7b0eb8a714：直框縮 2 mm、拿掉門邊重複直框；一定會閃 10.20→7.25 m²），重烘中（好拍之後），二樓也照新腳本重烘 | 69755b5546 | `docs/art-rebuild/second_ai/cc0_help/g3/dakou.patch` | v2（LAWWW2，排在好拍、同弦、新生運動之後）：①一樓櫃檯後層架的彩色方塊改印刷包裝盒／罐子，大小顏色錯開；對照圖加「一樓櫃檯後層架近看」 |
| 大口漢堡二樓 dakou_2f | LAWWW2 PASS（同上） | 69755b5546 | 同上 | v2：②二樓長桌課本改 Poly Haven book 模型或有書脊書口的印刷書；紙袋改有提把、摺邊；筆電換掃描模型；對照圖加「二樓長桌近看」 |

五間的建模腳本都已經改好、推上去（`tools/blender/env_second/bb_support/*_interior.py`＋共用 `cc0_kit.py`）；用腳本重建、還沒烘的原檔都過了店自己的單元測試、`shop_cc0_unit` 三項（LICENSES 列加上以後）。

## 目前做到哪（2026-11-13 23:20 UTC）

- 11-14 00:04 容器又重開一次（大口二樓烘到一半），00:05 重排：大口二樓 → 好拍 → 同弦 → 新生運動。00:26 大口二樓烘好、00:4x 交件。
- 23:4x：新生運動足球修正（part 1＋recolor），重烘排在大口、好拍、同弦之後。
- 21:2x 容器重開過一次（烘焙佇列被砍掉，新生運動烘到一半）；23:17 重新排：新生運動 → 大口一樓 → 大口二樓 → 好拍（洞洞板版）→ 同弦（地板洞版），一間約 15～35 分（CPU、512 取樣）。
- 每烘完一間：補 `lightbake/<店>_lm.json`（`glb_fix_instnames.py` 對不上新 Poly Haven instancing 的名字會讓 `bake_xs.sh` 停在最後，見 cc0_help/g3/README.md）→ 拍新版（`fast_shots.py`）→ `cmp_sheet.py` 並排圖 → 店的測試 → patch（底＝當時開發分支最新）→ commit＋push → 通知 LAWWW2-C、副本 LAWWW-C → 更新這份。

## 本機有、沒推上去的（都在 scratchpad，容器重開會不見；都可以重做）

- 還沒烘的原檔：`<店>_new.glb`（用腳本重建）、`haopai_b.glb`（＋洞洞板兩步）、`tongxian_h.glb`（＋地板洞）。重做：跑腳本 `--out`，再照 cc0_help/g3/README.md 的事後步驟。
- 「改之前」截圖（五間，各 5～7 張）：重做＝用開發分支的 GLB 照同一份鏡頭拍（鏡頭 json 也在 scratchpad；格式見 HOWTO 第 4 節）。
- 好拍事後處理的工具 `glb_flip_faces.py`、`glb_split_tile.py`：在 `claude/second-ai-env-art` 的 `tools/blender/env_second/lightbake/`（開發分支沒有）。

## 下一個接手的人從哪裡開始

1. `bash tools/blender/setup_env.sh`；`/opt/blenv/bin/pip install pillow numpy`；`pip install playwright`（fast_shots 要）。
2. 看上面的表：沒有 patch 的店，從「用腳本重建原檔」開始（`/opt/blenv/bin/python tools/blender/env_second/bb_support/<店>_interior.py -- --out <tmp>.glb`；大口 `--floor 1|2`），好拍、同弦再做 README 的事後步驟。
3. 拍「改之前」（開發分支的 GLB）→ `IN=<原檔> bash tools/blender/env_second/lightbake/bake_xs.sh <店>`（好拍那一段要改成 `HIDE='glass'`、NOLM 加 `WALL_right_pegwall_alpha`）→ 拍新版 → 並排圖、測試、patch、交 LAWWW2-C。
4. 大步 v2（P2）最後做。
