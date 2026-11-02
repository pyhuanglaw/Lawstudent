# BB_234 LIB-FRONT-1102 第三版（總圖外觀＋草坪＋台階）場景驗收

- 對象：LAWWW2 交件 32961b6ab（claude/second-ai-env-art），README：docs/art-rebuild/second_ai/test_shots/lib_front_1102/README.md。
- 驗收依據：D120（場景美術由 BB 驗收）、使用者 11-02 的照片和三次糾正（草坪、台階、台階下的寬磁磚、出館先是平台再下台階）、2D 背景 ntu_library_rain（BB 判定 PASS）。
- 看過的圖：photo_vs_game、rain_angle、ba_front（改前改後同角度）、player_steps_arcade。截圖是 Playwright＋SwiftShader，不是實機。
- **判定：通過，可以整合進下一版**。下面列的差距排到 v3.1／v3.2。狀態：`READY_FOR_ART_REVIEW` → BB 場景驗收通過。

## 一、達到的
- 正面輪廓和照片一致：磚山牆、齒狀線腳、圓窗、白石中央立面、大拱窗、兩側細長拱窗、五層磚塔、白框窗、「總圖書館」小匾。改前那種套件式的門廊柱子已經換掉，差別很大。
- 使用者三次糾正都做到了：大道柏油在路口結束，接大草坪，兩側龍柏籬；台階下面是寬的石板廣場；出館先是平台，再下台階（player_steps_arcade：可以走上台階、平台、拱廊走道，兩端有白石矮牆）。
- 雨天傍晚：窗戶亮暖光，和 2D 背景的氣氛對得上。
- 功能：LAWWW2 報告 reachability_all（113 項）、flow_library_floors 在 ba125d6f3＋patch 上 ALL PASS。整合進開發分支以後，BB 會在使用者電腦再跑一次 reachability_all 確認。

## 二、還沒達到參考品質的（排 v3.1／v3.2，不擋整合）
1. **一樓拱廊的深度**：照片裡中間三拱是開放的、看得到裡面的拱廊和吊燈；遊戲的正面看起來比較像牆上有拱形框的窗。走進去是通的（截圖 3），但從草坪看過去的層次感不夠。建議拱內加暗面／吊燈，或者讓拱內的牆退後。
2. **平台上的樹和平台深度**：照片和 2D 背景，平台上兩側都有樹（LAWWW2 已經排 v3.1：兩棵尖塔形針葉樹）。
3. **白石中央立面太平**：照片的白石面有線腳、浮雕框、窗台；遊戲是大片平的淺灰，近看會像水泥牆。需要加 Normal／線腳。
4. **磚面和石面的材質**：遠看可以，近看（ba_front 下排）磚紋偏淡、石面沒有接縫的立體感。照 D38 第 6 點，近景要 PBR 的法線和粗糙度。
5. **左後方的鐘塔**：照片和 2D 背景從正面就看得到；遊戲正面幾乎看不到（雨天角度左側有一點）。可以接受，列為參考。

## 三、交接
- LAWWW：照 README 第一節整合（GLB＋patch），下一版一起出；門口互動點 (86.4,0)、(80,0)、(82,0) 要照舊走得到。整合以後的 SHA 給 BB，BB 會排使用者電腦跑 reachability_all、flow_library_floors、campus_glb_integration。
- LAWWW2：v3.1 照原排程（B1、一樓之後），把第二節的 1～4 一起考慮。
- 最終美術：建築屬於使用者驗收的範圍（CLAUDE.md 第 8 點，只有使用者實際確認才能標 ART_APPROVED）。BB 這邊只做到場景驗收通過，在使用者早上的摘要裡附 photo_vs_game 和 rain_angle 兩張給使用者看。
