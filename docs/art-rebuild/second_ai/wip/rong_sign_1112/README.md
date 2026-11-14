# RONG-SIGN-1112 榮恩典文具社招牌重畫（LAWWW2-C 2026-11-12；【表外】P3）

BB 的回報：榮恩典招牌近看像馬賽克。原因：招牌是從參考圖（約 800 像素寬那一塊）拉正裁出來的，邊緣本來就糊；放進公館店面大貼圖（`gg_fronts_atlas`，GLB 裡 1229×4096）以後只剩 983×182 像素。

## 做了什麼
- `tools/blender/env_second/gg_shops6_tex.py` 新 `rong_sign()`：照參考圖重畫——米白燈箱底、粗黑體「榮恩典文具社」（店名是使用者指定的，不改）、左邊交叉的鉛筆（左上→右下、筆尖朝下）和毛筆（左下→右上、筆頭在右上）線稿、字下面紅黃藍綠四條色塊。3 倍大畫再縮，邊緣是銳利的。
- `gongguan_shops.glb`：**只換 GLB 裡 `gg_fronts_atlas` 那一張貼圖招牌那一塊**（其他像素照舊、重新壓 webp q85：8,275,712 → 8,279,008 B），網格、材質、UV 都沒動——不用重建公館街景（那要跑 Blender 整條街）。
- 原始圖 `textures/src/gg_cards/ggrong_sign.jpg`、`textures/gen/gg_fronts_atlas.jpg` 同一塊也換掉（以後重建一致）。
- 前後對照：`rong_sign_before_after.webp`（上：原本、下：新的；都是 GLB 裡那 983×182）。

## 檢查
- GLB 27 張貼圖全部解得開；引用 gongguan_shops 的 12 支 Node 測試 ALL PASS；patch 在開發分支 `git apply --check` 過。
- **沒測**：瀏覽器。請 CC 公館榮恩典門口近拍（人站騎樓、鏡頭 2～3 m）。
- 先將就：解析度還是那張大貼圖決定的（983×182），只是邊緣不糊了；要更清楚得把招牌拆成獨立貼圖（要重建 GLB）。
