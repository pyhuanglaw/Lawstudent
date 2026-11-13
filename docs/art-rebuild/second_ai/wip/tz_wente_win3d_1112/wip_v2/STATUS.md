# 溫特寶邸 v2（SHOP-WINDOW-3D-1112／SHOP-REALISM-1112 樣板）現況（LAWWW2-C 2026-11-13）

- 模型：`tz_wente_interior_v2.glb`（寬 4.96 × 深 3.6 × 高 3.1、77,998 三角形、一個材質一張 2048 烘焙貼圖、3.2 MB）。Poly Haven 掃描模型 6 件＋ambientCG 材質組，Cycles 烘焙。
- 程式：`wente_v2_wip.patch`（底 21773bf35b；裡面也帶了已經整合過的 zones3d sb、game3d／engine3d 那幾段，套之前和開發分支比對、只取溫特寶邸那幾檔）。tingzhou3d.js REAL_VIEW w=4.96。
- 測試：`tests/tz_wente_interior_1112_unit.js` ALL PASS（4.96 版）；`tests/shop_cc0_unit.js`（../../shop_cc0_1113/）溫特寶邸是唯一三樣都過的。
- 遊戲內照片：`shots/ingame_w496_*.jpg`（15:00 週四、23:00 打烊）；並排：`cmp_full.jpg`、`cmp_counter.jpg`、`cmp_rack.jpg`（左 2D 概念圖、右遊戲內）、`cmp_open_closed.jpg`。
- 修了：v2 第一版兩側白牆＝隔壁汀州聯通的店內東牆伸進來 5 cm（射線查到 WALL_E<tz_liantong_interior），店寬 5.2→4.96。

## 跟概念圖比，還不像的（照實寫）
1. **店面（街那一側）差最多**：概念圖是木框落地窗＋木門開著、門口一架衣服和盆栽、招牌下三盞壁燈、騎樓地磚和機車；遊戲裡是黑框玻璃整片關著、門口空的——這是 wz_street.py 的店面，不在店內模型裡，下一步做。
2. 衣架近照：衣服貼圖糊、顏色斑駁（2048 一張烘焙圖分給衣服的太少）——試 4096 或衣服另一張圖。
3. 盆栽葉子還是有點碎（全店 78k 三角形上限，減面減到它）。
4. 假人頭偏亮。
