# CC_22 US-Y4S1-SELECT 重現（BB 11:21 派工 4）

- 腳本：`docs/story_planning/test_tools/cc/n22_us_y4s1_select.js`，只用 Node、不改 src，和 k1_exchange 用同一套假 GM／fresh()。
- 【前置／捷徑】日期直接設到大四上開學前 3 天，一路跑到第 2 週，每天 08:00 呼叫真的 CLS.morning；出國旗標照 k1 的 routeFlags 補上。

## 結果
| 版本 | TW 大四上選課 | JP 大四上選課 | JP 大三下（對照） | **US 大四上** | INFO：US 有 DEPARTED、沒有 ARRIVED |
|---|---|---|---|---|---|
| b32e6db69（int/next1102 預跑） | 選（9/3） | 選 | 不選 | **不選、不跳「開學了」→ PASS** | **選課跳出來**（9/3） |
| b1b249873（v9.10.16 候選） | 選 | 選 | 不選 | **不選 → PASS** | （沒測） |
| 突變：拿掉 us_life3d.js:124 的 CLS.morning 包裝 | 選 | 選 | 不選 | **選課＋「大四上開學了」→ FAIL** | 選 |

## 為什麼 classes3d.js:722 只認日本，US 卻沒有跳
- `us_life3d.js:124` 包住了 CLS.morning：人在美國時（`S.here(G)`＝`usDay`：isUS、有 US_ARRIVED、還沒 US_RETURNED、日期在 8/2～12/23 之間），先呼叫 `markTW` 把 sel_Y4S1、exam_Y4S1_mid／final、termStart 標掉，然後直接 return。classes3d 本體的選課根本沒有執行到。
- `us_life3d.js:386`（S.phone）也會 markTW。
- 所以 BB 讀到的 skipT 只認日本是真的，但美國那條另有一層擋著。照正常玩法（8/2 強制出發 → 一小時後自動登機 → fly() 設 US_ARRIVED），在 b1b 和 b32e 上都**重現不到**。

## 會漏掉的邊界（INFO）
- US_DEPARTED 有、US_ARRIVED 沒有、日期已經是 9/3：跳出選課。termAway 這時是 true，兩個判斷不一致。
- 真實玩法什麼時候會這樣：出發後卡在機場出境大廳沒登機（自動登機依賴 S.tick 的 US_AIRPORT_AT）；或是舊存檔在這個狀態下睡過 9/3。我沒有找到走得到這種狀態的真實流程，所以算低機率。

## CC 初判（判定歸 BB）
- 主情境「美國大四上跳台灣選課」：b32e6db69 和 b1b249873 都 **PASS**（沒有重現）。突變測試證明這支腳本抓得到 bug（拿掉包裝就 FAIL）。
- 修改建議（給 LAWWW 參考）：classes3d.js:722 的 skipT 改用 `S.termAway`（第 76 行已經同時認日本和美國），這樣就不必依賴 us_life 的包裝和 US_ARRIVED，也能補上 INFO 那個邊界。
