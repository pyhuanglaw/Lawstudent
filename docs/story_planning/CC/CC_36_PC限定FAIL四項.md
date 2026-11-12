# CC_36 只在 PC FAIL 的四項：查完（2026-11-03，雲端驗證）

| 項目 | 原因 | 修法／結論 | 雲端驗證 |
|---|---|---|---|
| A2_dorm（b1b、ef63 在 PC FAIL） | **探針的問題**。舊序章系所退宿的人在外面空 3 秒，遊戲會自動回家（econff3d.js 的 `ECONFF.tick2`，D102 ③，這是設計）。PC 快，探針固定等的 3.5 秒內就已經回家；手機沒打開，讀到的是上一個案例留下的舊列表。雲端慢，所以以前剛好過。BB 懷疑的「migrate 前就畫好」不成立 | 【前置】讀檔前把 ECONFF.tick2 換成空函式（只關自動回家）。不再固定等秒數，改成輪詢 stage、zone、旗標、不在家、沒有劇情都成立以後，才打開手機。判斷沒有放寬 | b1b ALL PASS；3c6207b60（修改前）FAILED 6，符合預期 |
| A3pre（dc36b401e） | **探針的問題**：舊版 playlib 沒有 close_panels | 改成相容寫法：有 close_panels 就用，沒有就照玩家按關閉鈕，再沒有就按 Escape | dc36b401e：只有 a FAIL（預期），b、c 都 PASS |
| X_P5w（62d） | **探針的問題**：PC 量目標時已經考完試 | 照 BB 01:11 改了兩件：①在起床劇情演完、開考前量（連續 1.5 秒沒有劇情、遊戲時間走了 1.2 分鐘以上）；②期待值改成「包含 09:10 和 憲法（上）」 | 62d ALL PASS（08:11 量到「09:10 期末考：憲法（上）（法律系館A 201）」）。起床選單「先起床」那條路只有 PC 才會走到，還沒在 PC 跑過 |
| X_G6b_v95（62d、ef63 在 PC FAIL） | **LAWWW 測試的期待值過時，遊戲沒有掉欄位**。sv 是 v:2，v9.5 的 24 個欄位全都在，只少 courses。courses 要等 STORY.tick→CLS.tick 第一次跑才會建；但讀檔以後手機因為有待回覆的訊息自動打開（D103），遊戲暫停，tick 都沒跑（PC 截圖也是手機開著的畫面）。這支測試寫的時候還沒有手機自動打開 | 測試沒改。建議 LAWWW 等 courses 之前，照玩家按「收起來」；或者把 courses 那一條改成「沒有 courses 也可以」 | 診斷腳本重現了：phoneShown=true、paused=true、campus 的 STORY.tick 0 次 |

- 佇列新增：Y_P5w（c89）、Y_A2pre、Y_A3pre（RERUN=fix4）。Y_A2_dorm、Y_A3_l15（c89）原本就排了，會用新版探針跑。
- 診斷腳本和雲端紀錄在 scratchpad 的 fix4/，沒有推上遠端；結論都寫在這一頁。
