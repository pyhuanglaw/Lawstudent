# 角色美術遊戲內檢查（LAWWW 帳號 A，2026-10-22 06:3x～06:4x UTC）

D100 第 6 點：角色美術由 LAWWW 看遊戲內截圖驗收。開發分支 `6cfc73fd`（Playwright、SwiftShader、720×960 手機模擬；不是 iPhone 實機）。截圖腳本在工作階段的暫存資料夾，不進 repo。

| 圖 | 內容 |
|---|---|
| `zr_ps_front_1100.webp` | 溫州街夏日冰菓室前 11:00：芷若（左，`char.heroine_02`＝`bl_heroine_02.vrm`，頭髮第九版）、沛珊（右，`char.classmate_peishan`＝`bl_classmate_peishan.vrm`）；兩個都是 VRM，沒有退回備用人物 |
| `zr_face_1100.webp` | 芷若臉部近景：到肩下的微捲、側分、深棕，眼鏡；不再像戴頭盔（ART-ZR-HAIR-1022 第九版） |
| `ps_face_1100.webp` | 沛珊臉部近景（第二十七版）：深棕綁起來、側邊瀏海、圓框眼鏡 |
| `dusk_tone_neutral.webp`／`dusk_tone_aces.webp` | 同一個位置 17:45：色調映射 Neutral（開發分支預設，LAWWW2 fdd9b3f5）和 `?tone=aces`（v9.10.4 線上版的樣子）。差很小：Neutral 稍微暖、衣服的顏色鮮一點，路面和陰影差不多 |

結論：
- 兩個模型在遊戲裡載入正常、白天和黃昏都沒有看得出來的問題；驗收照 ART-ZR-PS-3D-1022、ART-ZR-HAIR-1022（04:4x、05:1x 已通過）。
- 色調 Neutral 可以進下一版 v9.10.5（發布時告訴使用者：全遊戲畫面風格，`?tone=aces` 回到舊的）。
- 芷若在 Café 當班的 3D 圍裙：`character3d.js` 有 `apron` 節點、`props3d.js` 寫了 `CHAR.setProp(人物,'apron',true)`，但遊戲裡沒有任何地方打開它（當班也沒有）。2D 圍裙版立繪因為太糊先關著（`ADV.CAFE_APRON=false`，使用者 10-22「林芷若太糊了吧」），所以現在 3D、2D 都沒有圍裙、前後一致；等使用者給高解析度圍裙版立繪時，兩邊一起打開。
- 沒拍到的：芷若在 Café 吧台當班的鏡頭（腳本挑的兩個日子都不是她的班：遊戲第 26、28 天是週三 15:00、週二 15:00）、吧台座位、劇情鏡頭——交給 BB 的瀏覽器測試。
