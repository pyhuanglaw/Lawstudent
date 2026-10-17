# 四職位半成品與未整合交付清單（帳號 B 交班，2026-10-17）

> 用途：讓下一班（帳號 A 或 C）找得到四個 AI 做到一半的成果。使用者 2026-10-17 02:5x 要求 LAWWW-B 做最後一次交接完整性補強，只補文件與登記，不改遊戲程式。
> 機器讀的總表照舊是 `docs/handoff/tasks.json`、`docs/handoff/deliveries.json`；這份是閱讀版的半成品索引，每項都寫任務 ID、檔案、分支、最後 commit、完成程度、剩餘工作、能不能整合。
> **狀態：核對進行中**（LAWWW-B 02:5x 開始；各節標「已核對」才算完成，沒標的交給下一班照第 5 節方法做完）。

## 1. LAWWW（LAWWW-B，分支 `claude/modest-rubin-2lyp7g`）——已核對

| 任務 ID | 內容 | 檔案 | 最後 commit | 完成程度 | 剩餘工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| DORM-LOFT-L | 8/29 搬進宿舍當晚，21:55 轉場後在 203 補生阿凱（R2）、柏翰（R1）、阿哲（L1）坐姿 | `src/story3d.js`（kaiMoveIn，1 行） | `b9eaacf3`（WIP） | 程式寫完、單元測試 camp_y1_unit／v0_e01／v0_e02 通過 | 瀏覽器 `tests/flow_camp_y1.py` 確認 8/29 22:00 三人在位子上；沒問題就把 commit 訊息的 WIP 視為解除 | 已在開發分支；沒測過瀏覽器前不要發布 |
| DORM-LOFT-L／ART-DORM-LOFT | 台大四人房模型整合（LAWWW2-B `a09ebf4d` 交件，使用者 01:3x「宿舍ok」） | `assets/models/env/dorm_room4.glb`、`.json`、`.layout.json`；`src/data/dorm_room_layout.js`（`tools/gen_dorm_room_layout.py`）；`src/zones3d.js` dorm 區塊 | `69e74460`～`5d66f7bb`、`22bdbc41` | 已整合；interior_glb_integration 宿舍 ALL PASS 42、flow_dorm_hall ALL PASS、flow_camp_y1 ALL PASS | 截圖給使用者看；場景美術只有使用者能標 ART_APPROVED | 已整合待測試 |
| AB65-3-Y1S2-L | 大一下口語改稿（AA_209） | `src/story3d.js`、`src/data/events.js`、`src/data/invites.js`、`src/data/activities.js`、`src/data/characters.js`、測試 | `372c6512` | 第 3 節、第 4 節第 1、2、3、5 點做完 | 第 4 節第 4、6、7、8、10、11 點；附錄逐句；階梯 y1s2 等 AA SHA（見第 2 節）；大二 312 | 已做的部分已在開發分支 |
| CAMP-FIX-614 | 宿營＋開學第一週驗收修正 | `src/data/camp_y1.js`、`src/story3d.js`、`src/data/events.js` | `259a4c4f` | 台詞 8 項、程式 1～7 做完；flow_camp_y1 ALL PASS | 程式 8 經濟系路線宿營 | 已整合待測試 |
| V0-REWRITE-L | 經濟系前傳改稿 | `src/data/ladder*`、`src/data/events.js`、`src/classes3d.js` 等 | `793e78aa` | 段 A 全部、BB JSON、E15 CG | 段 B～E、BB_179 第 4 節 1～9、AA_203 第 3 節 30 處、AA_206 E26／E37、AA_200 7-2～7-4、BB_179 第 8 節 | 已做的部分已在開發分支 |
| QA-HANDOFF-B1 | 交班沒跑完的測試 | — | — | — | 整套單元測試、萬才館／zone_transitions／總圖×2／霖澤館／法圖／重訪日 1 瀏覽器流程 | — |

LAWWW-B 沒有本機沒 push 的檔案、沒有 WIP 分支。

## 2. AA（AA-B，分支 `claude/cool-heisenberg-o8kuqx`，已交班 `ec63dd53`）——核對中

## 3. BB（BB-B，分支 `claude/elegant-brown-fcos7n`，已交班 `55717c12`）——核對中

## 4. LAWWW2（LAWWW2-B，分支 `claude/funny-albattani-iawshm`；交班時還沒送交班通知）——核對中

## 5. 方法與剩餘異常

- 範圍：`check_handoff.py check` 第 6 項列出的 commit（交付分支 `scannedThrough` 以後、符合交付關鍵字、還沒登記），02:49 重新列出：AA 分支 126、BB 分支 113、LAWWW2 分支 16（比交班時的 249 多，是各職位交班 commit）。
- LAWWW-B 02:4x 曾把 BB 分支 125 筆照 BB-B 的交班說法整批放進 ignored；使用者 02:5x 要求不得整批標非交付，**已撤回**，改逐筆核對。
- 分類：DELIVERY（正式交付，登記 deliveries.json 並寫整合狀態）／WORK（一般工作紀錄，放 ignored 並寫具體原因）／WIP（半成品，登記在本檔並寫完成程度與能不能整合）。
