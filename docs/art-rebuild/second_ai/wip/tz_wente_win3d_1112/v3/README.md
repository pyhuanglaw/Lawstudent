# 溫特寶邸 v3（SHOP-REALISM-1112；BB_379 初判「部分」那五點）（LAWWW2-C 2026-11-13）

## 改了什麼
1. **店面（街那一側）**：窗下木腰板＋窗台（`kick=0.42`）、框改成看得出木頭的深咖啡 `#4a3324`、窗前和門邊兩盆 Poly Haven 合果芋＋一盆多肉（CC0）。
   - `wz_shopkit.xs_street_front` 新增 `kick`、`clutter` 的 `ph_pot`／`ph_succ`（汀州路其他沒騎樓的店重做時也用得到）。
2. **書**：Poly Haven 舊書組減面 0.02→0.06（原本減成一片片薄板）；左邊書櫃的折衣（BB 看成書）改成圓角大、整件微鼓、每件深淺位置角度錯開。
3. **衣服貼圖**：布料、皮革的面在烘焙圖上放大兩倍再排（`uvw` 面屬性）。
4. **假人頭**：#c9bfae → #a99d8a、粗糙度 0.8。
5. **打烊鐵捲門**：LAWWW-C 09:15Z 定——保留 AA_902「拉一半」（燈關、店內暗）；不改。

## 檔案
- `tz_wente_interior.glb`（→ assets/models/env/second_ai/）：78,000 三角形、一張 2048 烘焙圖、3.2 MB；`tests/tz_wente_interior_1112_unit.js` ALL PASS、`shop_cc0` 過。
- `tz_wente_interior.py`（→ tools/blender/env_second/）。
- `wente_front.patch`：wz_shopkit.py＋wz_street.py 的改動。**街景模型請在開發分支套 patch 後重建**（`wz_street.py -- --set tingzhou`，約 1 分鐘），附的 `tingzhou_street.glb` 是在我舊的工作區（21773bf35b 為底）建的，只給對照。街景 GLB 8.65→9.20 MB（多了盆栽貼圖）。
- 汀州路測試（舊工作區）：tingzhou／tz_* 15 支 ALL PASS；`tz_front_lit_1112` FAIL 1＝tzwen（開發分支 LAWWW-C 已拿掉 SHOP_LIT_PLACE.tzwen，套到開發分支就沒事）。
- 照片 `shots/`（9/18 週四 15:00、23:00）；並排 `cmp_wide`、`cmp_full`、`cmp_rack`（左概念圖）、`cmp_open_closed`。

## 還不像、照實寫
- 衣架近照衣服還是斑駁（放大兩倍有改善，但貼圖遠近縮放後還是糊成色塊）——下一步試衣服另一張圖或 4096。
- 概念圖的木門開著、門口一架衣服、招牌下壁燈還沒做（門口衣架要做成像店內那樣的立體衣服，不能用方塊）。
- 多肉那盆太小；右邊衣架幾件被聚光燈照太亮。

## 在開發分支重建街景（LAWWW-C 11-13 問）
`tools/blender/env_second/textures/gen/`（438 張，店面紙條、雨棚、招牌圖集等）只在 LAWWW2 分支：建之前 `git checkout origin/claude/second-ai-env-art -- tools/blender/env_second/textures/gen`，**不要 commit 進開發分支**（FACTS.md 第 66 行）。`shop_notes.png` 也可以 `python3 tools/blender/env_second/shopkit_tex.py` 重產。
