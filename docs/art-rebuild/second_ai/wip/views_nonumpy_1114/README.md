# 窗景兩層截圖工具：沒有 numpy 也能跑（WINVIEW-NONUMPY-1114，11-14 10:1x UTC，LAWWW2-C）

- **起因**：CC-C 回報 WINVIEW_GG3_1939 在使用者電腦上跑。`tools/shots/shop_views_layers.py` 第 19 行 `import numpy` 失敗，因為電腦是 Python 3.15.2、沒有 numpy，三間都沒拍成。
- **改法**：
  - 有 numpy 時照舊。
  - 沒有 numpy 時，去背改用新加的 `_matte_pil`。算法相同：alpha＝1－(白底－黑底) 的平均，顏色＝黑底 ÷ alpha，透明的地方由近到遠填旁邊的顏色。
  - 模糊改用純 Python 的 `_box`：累加和、邊緣延伸，和 numpy 版 `mode='edge'` 一樣。
  - 1024×512 一張約 1 秒。
- **測試**：`tests/shop_views_matte_unit.py` ALL PASS。
  - 有 numpy 的環境兩版都跑、互相比較：alpha 最多差 1 階，看得到的顏色最多差 1 階，透明處填的顏色最多差 2 階，cover 一樣。
  - 把 numpy 藏起來再跑，PIL 版也 ALL PASS。
- **patch**：`views_nonumpy_on_6f4cf29026.patch`，底是開發分支 6f4cf29026，`git apply --check` 過。
- **CC 在電腦上先用的方法**（不用等整合）：`git show <這個 commit>:tools/shots/shop_views_layers.py > tools/shots/shop_views_layers.py`，然後照原樣重排。

## 附帶：bookstore_exit_unit 在開發分支 HEAD 失敗（LAWWW-C 11-14 10:06 回報）
- **原因**：這支測試沒有擋 fetch。Node 18 以後自帶 fetch，書店模型的備援路徑 `bookstore_interior.glb.json` 是相對路徑，丟 ERR_INVALID_URL，沒有被接住，整支程式停掉。和頁間那包無關。
- **改法**：只加一行，照其他單元測試（aa653_shops、ade_seats_nav…）的做法擋掉 fetch：`global.fetch=()=>Promise.reject(...)`，再加 `unhandledRejection`。檔案是 `bookstore_exit_fetchstub.patch`，底是 19314237c3。
- **結果**：改了以後 ALL PASS（8 項），exit 0。

## 第二步：電腦連 PIL 也沒有（WINVIEW-NOPIL-1114，11-14 10:4x UTC）
- **起因**：CC-C 回報 WINVIEW_GG3_1939_r2：第 23 行 `from PIL import ...` 一樣失敗，電腦的 Python 3.15 連 Pillow 也沒有。
- **改法**：拍照和去背拆成兩步。
  1. **電腦上拍**（沒有 PIL）：瀏覽器回傳的 data URL 本來就是 PNG，直接把原始三張（`<名稱>_far.png`、`_nb.png`、`_nw.png`）和景深 `depth.json` 存進 `VIEWS_RAW` 資料夾。這一步不去背、不寫 webp、不改 `shop_views_layers.json`。
  2. **在有 PIL 的機器去背**（雲端也可以）：`VIEWS_REMATTE=<那個資料夾> python3 tools/shots/shop_views_layers.py <網址> [名稱...]`。遠景轉 webp、近景去背、景深和 cover 寫進 `shop_views_layers.json`。
  - 這一步只做影像運算，不重新算圖，所以顏色就是電腦算出來的，不會變成 SwiftShader 的顏色。
- **測試**：
  - 假的原始三張＋depth.json 跑 VIEWS_REMATTE：四張 webp 和景深 json 都寫出來了。
  - 把 PIL 藏起來跑 VIEWS_REMATTE：會停下來並提示「要有 PIL 的機器」。
  - 電腦拍照那一段（沒有 PIL）要 CC 在電腦上實際跑一次才算驗過。
- **patch**：`views_nopil_on_<開發分支 SHA>.patch`，只改這一支工具。
