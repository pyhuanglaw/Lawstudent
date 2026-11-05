# 2D 背景在遊戲裡：雲端重驗那一輪的截圖（CC-C 11-04 15:5x UTC；BB-C 16:45 要的）

- 探針：`docs/story_planning/test_tools/cc/cc_bg_adv_probe.py` 4d09c72db（台詞打完才截圖）；遊戲 SHA **048b4c898**（和 d3828 之間沒有 .js 改動）
- 環境：雲端 Chromium（SwiftShader，無頭）——**顏色、亮度不採信**；版面（黑邊、立繪和對話框有沒有蓋到背景主體）和 GPU 無關
- 只拍了 **ART-BG08 car** 一張（`BGS=car DATES=0`，驗流程用）：
  - `bg_car_story_portrait.jpg`：直向 390×844
  - `bg_car_story_landscape.jpg`：橫向 844×390（上下各約 30 px 的黑邊，我只是觀察，不判）
  - `bg_car_orig_640.jpg`：原圖縮小（寬 640；原圖 1672×941）
  - car 那一幕劇情只有可昕一個人，所以沒有「兩人」版
- 【捷徑】ADV.begin 直接顯示背景＋ADV.show 站人物＋GAME.say 一句 CC 的測試台詞，不是照劇情走到那一幕
- 其他背景（BG16、BG17、GYM-BG1、ART-10、ART-14 約會底圖）在電腦的 BG_adv_main／BG_adv_dates（d3828）
