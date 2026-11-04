# GG-VIEWS-1104：公館三間新室內的窗景（日和便利店、頁間書屋、青木茶室）＋溫州街 A5

- LAWWW2，2026-11-04。LAWWW 03:04 第 4 項：
  - 日和用的是舊店面角度的照片，被拉成 8.3 m 一整片；
  - 青木、頁間的窗景是模型裡的靜態圖，沒有夜景。
- 兩份 patch 都接開發分支 `cb1d84290`：
  - **A `A_shots_script.patch`**（`tools/shots/shop_views_layers.py`）：拍照的位置照新店面的窗改。
    - `cvs`：x −29.4 → −27.7，高 2.1 → 1.4（ggRoom 的 winY）。
    - 新增 `yejian`（x −42.0，高 1.7）、`aoki`（x −51.87，高 1.65）。
    - `cvs_wz` 高度也改成 1.4。
    - 位置怎麼算：世界 x＝店中心 cx－配置的窗中心 x（房間轉 180°）。日和 cx −28.8、頁間 −41.0、青木 −52.2。
  - **B `B_zones3d_after_photos.patch`**（`src/zones3d.js`）：照片進來以後才套。
    - 頁間（bookstore）、青木（aoki）的 ggRoom 加 `view`／`winXs`／`winW`／`winH`／`winY`，和日和同一套兩層窗景（W3.windowMat：視差、白天晚上兩張）；
    - `ggAAattach` 在有遊戲窗景時把模型裡的 `WALL_*_VIEW` 藏起來。
    - 照片沒進來就先套 B，窗會是空的，所以要等照片。
- 拍照（照 D131 排 PC，BB／CC）：
  - 開 http server，`python3 tools/shots/shop_views_layers.py http://127.0.0.1:8765/index.html cvs cvs_wz yejian aoki`；
  - 會寫出 `assets/models/env/views/{cvs,cvs_wz,yejian,aoki}{,_near}_{day,night}.webp` 和 `tools/shots/shop_views_layers.json` 的景深；
  - 景深要填進 `world3d.js` 的 `VIEW_LAYERS`（cvs 改數字，yejian、aoki 新增）。
- 測試：B 套上以後 gg_interiors_1104、shop_rename_1104 ALL PASS（Node）。照片和遊戲內截圖都還沒有。
