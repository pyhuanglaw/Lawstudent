# BUG-COPLANAR-DEV 遊戲內看（BB-C 2026-10-20，LAWWW 開發分支 d4845e6d）

- `tests/wancai_glb_integration.py`：**ALL PASS**（正式模型接上、窗 instancing、夜間亮窗、擋掉 GLB 的備用、導航／鏡頭碰撞／互動點和套件相同、效能）。
- `tests/campus_glb_integration.py`：**測試本身過期**——FAIL「soc 的正式模型接上（campus_modern_glb）」、「有 ckTag 的套件建築＝…（先不放正式模型：boya, gate, male1, putong）」（這幾棟現在都接了正式模型）、後半 `Page.evaluate: TypeError: Cannot read properties of undefined (reading 'traverse')` 中斷。要 LAWWW 更新測試。紀錄 `cop_campus.log`。
- 截圖（`flicker_probe.py`，[前置／捷徑] 讀檔到校園 2025-09-10 15:00／20:30、只改站的位置）：霖澤館穿堂前後、萬才館正面和側面白天晚上——**沒看到破面**。`linze_front_*` 鏡頭方向設反、拍到椰林大道那側（不算）；穿堂那兩張人物像坐在地上，是 BB 直接把人放過去沒調高度（穿堂地板 0.9 m），不是遊戲問題。
- **閃爍沒辦法判斷**：SwiftShader 每秒幾格，放好人以後鏡頭還在跟，連拍兩張整張都在變（不是閃爍）。閃爍要真機看。
