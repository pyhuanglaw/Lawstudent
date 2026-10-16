# BG-02 gongguan_luwei（公館・滷味攤）｜LAWWW2-B 2026-10-16

**事件**：期中考完的宵夜 `ev_midterm_supper`，v0 E19、E28（AA_147：大一上第 8～9 週週四 20:30，晚上騎樓下的滷味攤、一張折疊桌）。

**做法：A 類（遊戲 3D 截圖）＋補道具**，和總圖窗景相同，不請使用者生成（已回 BB-B）。

## 成品

- `assets/bg/gongguan_luwei.webp`：1920×1080。
- 畫面內容：公館店面街 G05「滷味・鹹酥雞」的騎樓，20:30。
  - 招牌、店內菜單（滷味・鹹酥雞、價目）；
  - 騎樓下的滷味攤車：玻璃櫃、一盤一盤的料、大滷鍋、兩盞吊燈、價目板；
  - 折疊桌、紅色塑膠凳 5 張，桌上有兩碗滷味、手搖飲、考卷和筆記（對答案）；
  - 隔壁是腳踏車行。

## 新的東西

1. `assets/models/env/second_ai/luwei_stall.glb`（`tools/blender/env_second/luwei_stall.py`）：
   - 10,040 個三角形、19 種材質、635 KB；
   - 價目板、考卷的貼圖是本作程式畫的（`textures/gen/luwei_*.png`）。
   - **只給拍背景用，遊戲本身不放**。
2. **修了遊戲裡的一個錯**：滷味・鹹酥雞的櫥窗原本用定食店的圖，寫「本日定食 鯖魚・豚汁」。
   - 改成新的店內圖 `luwei`：紅底菜單、不鏽鋼台加玻璃櫃、炸鍋。
   - 我的部分：`wz_street.py` 的 G05 改 `it='luwei'`，`gongguan_shops.glb` 重建（只有 extras 改了）。
   - LAWWW-B 的部分：`src/townkit3d.js` 加 `luwei` 店內圖、`src/zones3d.js` 的 G05 改 `it:'luwei'`。
     - patch：`../../patches/gongguan_luwei_interior_361a70d.patch`，基準是 LAWWW-B 開發線 `361a70d`。
3. **拍攝設定**：`tools/blender/env_second/shots/bg_gongguan_luwei.json`（fast_shots）。
   - 用 js 載入攤車 GLB，放在 (−12.6, 0, 21.4)，也就是 G05 西邊那一跨。
   - 加三盞暖色點光：兩盞在吊燈位置、一盞補光。
   - 隱藏路人和玩家。
   - 鏡頭從人行道西側往東南看。
   - 需要上面的 patch 和新的 gongguan GLB，櫥窗才會是滷味店的圖。

## 過程（同角度的比較）

| 版本 | 圖 | 問題 |
|---|---|---|
| v2 | `v2_wide2.webp` | 櫥窗是定食店的圖 |
| v3 | `v3_wide2.webp` | 菜單字疊在一起；攤車被騎樓中間的柱子擋住 |
| v4 | `v4_c.webp` | 移到西邊那一跨、換角度，採用 |

最後一張重拍時，修了價目板的方向和 UV（原本反面朝外、沒有 UV，是一片白）。

## 還不夠的地方

- 遊戲本身的畫風：店內圖是平面卡、晚上發光偏亮，騎樓地磚、柱子是遊戲的材質。
- 價目板被正前方的補光照得有點白。
- 桌子在畫面裡偏小。人物會疊在前景，桌子要大一點的話可以拉近鏡頭。

**狀態**：READY_FOR_ART_REVIEW（場景美術由使用者驗收）。
