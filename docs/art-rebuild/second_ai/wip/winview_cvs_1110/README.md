# 日和便利店窗景（WINVIEW-AUDIT-1105；LAWWW 11-10：「程式註解自己寫『舊店面角度，要重拍』，先做這一間」）

狀態：**已交付（拍攝位置修正＋測試）；照片要 CC 在遊戲裡重拍**（D131）。LAWWW2 帳號 A，2026-11-10。

## 查到的
- 窗景是 `W3.windowMat` 的視差窗，照片要從視差窗那一片的中心拍（2:1、水平 90°）。
- 正式模型 `cvs_interior_v2` 載入以後，視差窗中心在店內 (−1.18, 1.4, 6.1)，玻璃在店內 z 5.44。換成公館座標是 **(−27.62, 1.4, 21.41)**、朝北。
- 現在遊戲裡的照片 `assets/models/env/views/cvs_{day,night}`（還有 `_near_` 兩張）是 10-23 用 `tools/shots/shop_views_layers.py` 在遊戲裡拍的。
  - 當時鏡頭在 (−29.4, 2.1, 21.7)，是舊店面的門口。和視差窗**左右差 1.78 m、高 0.7 m**。
  - 拍出來的內容（捷運出口、GONGGUAN 花台、對面的校門）大致對，但地平線高了 0.7 m，街角也偏了。
- 11-04（GG-VIEWS-1104，530a72ff4）已經把工具的位置改成 (−27.7, 1.4, 21.7)，可是照片一直沒有在遊戲裡重拍。
  - 這個位置還差 0.29 m：z 21.7 在玻璃內側，視差窗在玻璃外 0.66 m。

## 試過、不採用：Blender 版（`render.sh`、`blender_try_before_after.jpg`）
- 照木曜日那次（345574e2d）用 Blender 公館正式模型拍：白天、晚上各一張。位置對了。
- 但 Blender 場景裡沒有遊戲的遠景：天空的雲、羅斯福路對面的城市天際線、校園後面的大樓、路人都沒有。和現在遊戲裡拍的那張比，**反而比較空、比較假**。
- 晚上地面也太亮。
- 所以這一間不換成 Blender 版，改成在遊戲裡重拍（工具會把遊戲的遠景、天空、近景兩層一起拍）。

## 交付（patch `cvs_view_cam_6355ec91b.patch`，在開發分支 6355ec91b 上做的）
- `tools/shots/shop_views_layers.py`：`VIEWS['cvs']` 的鏡頭改成 (−27.62, 1.4, 21.41)，看 (−27.62, 1.4, −40)，加註解。
- 新測試 `tests/cvs_view_cam_1110_unit.js`：在 Node 建出遊戲的 cvs 區域，正式模型從檔案讀。
  - 檢查 ① 視差窗一片、照片是 cvs；② 工具的鏡頭＝視差窗中心，換成公館座標差 ≤ 0.15 m；③ 方向朝北。
  - 開發分支 6355ec91b：② **FAIL**（差 0.30 m）。加 patch：**ALL PASS**（差 0.00 m）。

## 接下來（要別人做的）
1. LAWWW 套 patch。
2. CC 在電腦上開 http server 跑 `python3 tools/shots/shop_views_layers.py http://127.0.0.1:<port>/index.html cvs`。
   - 會換掉 `assets/models/env/views/cvs_day/night.webp`、`cvs_near_day/night.webp`。
   - 會更新 `tools/shots/shop_views_layers.json` 的景深；`src/world3d.js` 的 `VIEW_LAYERS.cvs`（現在 far 22.4、near 6.54）照新的 json 改。
3. 拍好以後把 `zones3d.js` buildCvs2 那一句「照片是舊店面的角度……要 LAWWW2 重拍」的註解拿掉。
4. BB 判：店裡往外看，和門口往外看的實景比。

## 沒有測過
- 遊戲畫面：工具要瀏覽器，D131 只能在 CC 的電腦跑。
- `cvs_wz`（從溫州街那一側進來的另一張）不在這次範圍。
