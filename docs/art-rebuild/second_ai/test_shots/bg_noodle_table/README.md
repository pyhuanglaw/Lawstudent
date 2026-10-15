# 2D 背景 noodle_table（阿鳳麵店・長桌，晚上）— LAWWW 16:00Z ①

用途：交接包 v2 C11／C21「考完的晚餐」，事件 `ev_midterm_supper_y1s2` 第一段 `{scene:'阿鳳麵店・長桌', bg:'noodle_table'}`。現在遊戲裡是深色底＋字幕。

## 交付（第一版 v1，2026-10-14 16:25Z）

- **檔案**：
  - `assets/bg/noodle_table.webp`：1920×1080，164 KB。從店門口右邊往裡看，長桌、煮麵台、紅紙菜單、價目板都在畫面裡。**建議用這張。**
  - `assets/bg/noodle_table_window.webp`：1920×1080，130 KB，備用。從右後角往店門口看，看得到門和窗外的夜景，但沒有煮麵台和價目板。
  - 畫面上沒有人：人物用 ADV 立繪疊上去。
- **接法**（LAWWW 的 `src/outings3d.js`）：`noodle_table:{label:'阿鳳麵店・長桌',image:'assets/bg/noodle_table.webp'}`。我只在本機 worktree 改過這一行來拍截圖，沒有 commit。
- **製作**：Blender 5.2＋Cycles（CPU，64 samples＋OpenImageDenoise，AgX）。
  1. `tools/blender/env_second/noodle_interior.py -- --layout longtable`：遊戲麵店室內的同一支腳本，中間和右邊兩張桌子併成 2.8×0.9 m 的長桌，配 8 張椅子，桌上每個位子一碗乾麵或餛飩湯、一杯冬瓜茶，另有滷味和燙青菜。
     - 不加 `--layout` 時和原本一樣：重建出來 437516 bytes、47 meshes、24 材質、6008 三角形，和現有的 `noodle_interior.glb` 相同。
  2. `tools/blender/env_second/bg_noodle_table.py --view main|night`：算圖。
     - 天花板六支日光燈管各放一盞面光，煮麵台上方一盞暖光。
     - 窗外用遊戲晚上的窗景 `assets/models/env/views/noodle_night.webp`。
     - 菜單和價目板的字照遊戲 `attachNoodleInterior` 的畫法：紅紙直式黑字、白底深咖啡字。
- **來源與授權**（建議 LICENSES.md 加這一列）：
  `| 2D 背景 阿鳳麵店・長桌（晚上）`assets/bg/noodle_table.webp`、`noodle_table_window.webp` | 本作 Blender 算圖（`tools/blender/env_second/noodle_interior.py --layout longtable`＋`bg_noodle_table.py`）；貼圖 Poly Haven（CC0：terrazzo_tiles、rounded_square_tiled_wall、dark_wood）；窗景是本作的 `noodle_night.webp`；菜單字型文泉驛正黑（GPL＋字型例外，只拿來把字畫進圖片） | 本作 | 交接包 v2 C11／C21「考完的晚餐」 |`
- **遊戲內截圖**（手機橫向 844×390 模擬，Playwright＋SwiftShader，不是實機）：
  - `v1_adv_event_A.webp`：實際事件的第一句「今天不講考試。誰講誰請。」。小語、阿哲還沒有 2D 立繪，所以是 compact 對話模式，背景照常顯示。
  - `v1_adv_portraits_B.webp`：立繪疊上去的樣子。這是測試，不是劇情：左邊沈以安、右邊陳語彤（現有的 campus/neutral），對話框只放「……」。
  - 腳本：`docs/art-rebuild/second_ai/drafts/bg_adv_shot.py`。讀檔時設了 met_yu，事件直接執行（標了[前置／捷徑]）。結果 ALL PASS，沒有 JS 例外。

## 自評（還沒達到的）

- **背景比立繪「乾淨、平」**：立繪是細緻的手繪風，背景是乾淨的 3D 算圖。店裡少了生活感的雜物（飲料冰箱、日曆、餐具自取區、牆上的海報），湯鍋也沒有熱氣。
- **晚上的感覺主要靠燈光**：建議用的那張看不到窗；`noodle_table_window.webp` 看得到窗外的夜景，但看不到煮麵台。
- 第二版（v2）預計加雜物、熱氣、偏暖一點的燈光，檔名不變，直接替換。

## 順便發現的遊戲問題（LAWWW 的檔案，我沒改）

- **麵店價目板的字被切掉**：`zones3d.js` 的 `attachNoodleInterior` 用 `h*0.42` 的字寫「乾麵 60 ・ 餛飩湯 70 ・ 滷蛋 15」，canvas 1024 寬放不下，「乾」和「15」被切掉。
  - 建議：用 `measureText` 縮字，或 `fillText` 加 maxWidth。
  - 背景圖裡我已經把字縮到放得下。

## 第二版 v2（2026-10-14 16:40Z）——檔名不變，已替換 `assets/bg/noodle_table.webp`（164 KB）、`noodle_table_window.webp`（144 KB）

- **加的東西**：只有背景版有，遊戲的麵店配置不變。
  - 左牆的玻璃門飲料冰箱：中空的櫃體，背板有燈，四層飲料。
  - 後牆的時鐘（七點）和月曆、角落疊起來的紅色塑膠椅。
  - 湯鍋的熱氣：三片交叉的半透明面加上雜訊。
- **燈光與色調**：日光燈偏暖一點，煮麵台上方的暖光加強，補光減弱，色調改 AgX Punchy（對比和飽和度高一點）。
- **前後比較**（同一個鏡頭）：`v1_bg_main_preview.webp` → `v2_bg_main_preview.webp`。
- **遊戲內截圖**（同一支腳本重拍，ALL PASS，沒有 JS 例外）：`v2_adv_event_A.webp`（實際事件）、`v2_adv_portraits_B.webp`（立繪疊上去的測試）。
- **還是沒做到的**：
  - 整體還是比立繪乾淨。
  - 熱氣很淡，在白牆前面不明顯。
  - 晚上的感覺主要靠燈光，要看到窗外夜景得用 `noodle_table_window.webp`。
  - 這些需要使用者看過才知道方向對不對。狀態 READY_FOR_ART_REVIEW，不是 ART_APPROVED。
