# SNS-VIEW-COVER-1110：照片窗景被卡通窗擋住（SUNNY SIDE、日常失速）— LAWWW2 帳號 A，2026-11-10

狀態：`MODEL_READY`，交 LAWWW 整合。程式修正，沒有新模型。遊戲截圖請 CC 拍（D131）。

## 問題
- 來源：BB X254 P3「SUNNY SIDE 窗外的樹和樓是平面卡通畫風」。
- AA 的 sunnyside.glb 裡嵌的其實是溫州街正式模型拍的照片（日和便利店、林家乾麵、東側路口，LAWWW2 a485b6722）。我把圖從 GLB 拿出來看過，是寫實的。
- 遊戲裡看到卡通畫，是因為 `zones3d.js attachRoomGLB` 會把備用模型 `room()` 的窗搬到正式模型玻璃外 0.3 m。room() 的窗用的是程序化的卡通樹和樓。
- SUNNY SIDE 的照片卡在玻璃外 2.4 m（z 7.5），那兩扇卡通窗（z 5.3）剛好擋在它前面。
- 用同一個檢查掃了 10 間有照片卡的店，**日常失速也一樣**：落地窗那一扇卡通窗擋住前窗、右窗兩張照片卡。

## 修法
`attachRoomGLB` 搬窗之後，正式模型有 `WALL_*_VIEW*` 照片卡的那一面，要是卡正好在某扇窗的正後方，就把那扇窗拿掉：
- 判斷「正後方」：往外的方向（winParts 的 dir 朝房間裡，所以取 −dir）；窗的中心落在卡的左右、上下範圍內。
- 拿掉的時候從 z.wins、winParts 一起移除。
- 只拿程序化的窗。視差窗（`userData.pview`，本身就是照片）照舊。
- 其他面照舊：阿德影印、林家乾麵沒有照片卡，窗留著。

## 待決定（沒有動）
- 小路（wz_teishoku）的視差窗 `wz_teishoku` 擋在 komichi.glb 的照片卡前面。那張卡是 WINVIEW-AUDIT-1105 換過的溫州街照片，修改前後都一樣。
- 兩張都是照片，哪一張比較好由 LAWWW／BB 決定。要換的話，把這個條件的 pview 例外拿掉就好。

## 測試
- 新測試 `tests/view_card_cover_unit.js`：Node 建出 10 間店，接上正式模型，量每一張照片卡前面有沒有擋著的窗：
  - **開發分支 be84c8680：FAILED 2**。SUNNY SIDE 被擋 3 處、日常失速 2 處。小路是視差窗，另外列出來。
  - 套上 patch：**ALL PASS**。阿德影印、林家乾麵的窗還在。
- 回歸：讀到 z.wins／winParts／VIEWPANE／attachRoomGLB／SUNNY SIDE／日常失速／viewPhoto 的 99 支，全部通過，見 `regression.log`。

## 整合
`git apply sns_view_cover_1110.patch`，以開發分支 be84c8680 為底。內容：zones3d.js、測試。
