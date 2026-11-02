# CC_31 BB_245 複核三支：ADV-SKIP／DORM-AFTER-MOVEOUT／LATE15（目標 b1b249873）

雲端 Playwright 手機模擬（SwiftShader），不是 iPhone 實機。三支都是 🟡：用捷徑讀檔進情境，驗證的動作（按按鈕、開手機、點等待）都照玩家的方式做。lint ALL PASS。
探針：`test_tools/cc/cc_advskip_probe.py`、`cc_dorm_moveout_probe.py`、`cc_late15_probe.py`。

| 探針 | b1b249873 | 修改前對照 | CC 初判 |
|---|---|---|---|
| ADV-SKIP | **FAILED 2**：b「按一下就一路略過到選項」在 typing、full 兩輪都 FAIL；a、c、d、e PASS | be3c6324e^＝03b2721af：FAILED 5（b×2、c、d×2） | **遊戲 bug，修正只修好一半**（見下） |
| DORM-AFTER-MOVEOUT | **ALL PASS** | 86dd272df^＝3c6207b60：FAILED 6 | PASS；對照 FAIL＝探針抓得到 |
| LATE15 | **ALL PASS**（a、c；b 邊界有記錄） | 4d0170d4c^＝dc36b401e：FAILED 1（a） | PASS；對照 FAIL＝探針抓得到 |

## 1. ADV-SKIP：遊戲 bug（請轉 LAWWW）
- 情境：ev_rain_library_door，四句對話接四個選項。【前置／捷徑】讀檔到第 8 天 18:30 總圖門口下雨，用 `void EVENTS.run` 開演。跑兩輪：第一句還在打字時按（typing），以及整句顯示以後才按（full）。
- b1b 的結果：
  - a PASS：按鈕的中心點最上層就是按鈕本身（#advTop 在 body 底下，z-index 7）。
  - **b FAIL**：按下去以後等了 45 秒，ADV.skip=true，但 ADV.history 沒有增加，畫面停在同一句（typing 停在 1、full 停在 9）。玩家要**再點一下對話框**，才會一路自動翻到選項。
  - c PASS：停在選項 6 秒不會自動選，ADV.skip 變回 false。
  - d PASS：選完以後一句一句正常前進。
  - e PASS：ADV 結束，busy=false。
  - 沒有 JS 例外。
- **原因**（CC 在 b1b 和 ef63b1877 都核對過）：`src/adv3d.js` 的按鈕 onclick 是 `A.skip=true; if(window.GAME&&GAME.dlgAdvance) GAME.dlgAdvance();`。但 `src/game3d.js:3` 用最外層的 `const GAME = (function(){…})` 宣告，最外層的 const **不會**變成 window 的屬性，而且整個 src 都沒有 `window.GAME=`，所以 `window.GAME` 永遠是 undefined，dlgAdvance 永遠不會被呼叫。say() 要等「下一句」出現才會讀 ADV.skip，所以畫面停在目前這一句。
- **ef63b1877（下一版）還是一樣**（adv3d.js 那一行沒改）。
- 建議改法：把 `window.GAME&&` 改成 `typeof GAME!=='undefined'&&`。
- 重現：任何 ADV 事件開始以後按「略過對話」，之後不要再點 → 畫面停在原本那一句，ADV.skip=true、ADV.history 沒有增加。
- 對照版（修改前）：b 一樣 FAIL；c 的 ADV.skip 停在 true；d 選完以後每點一下前進 2 句（選完還在自動略過）。修正有效的部分是「按得到」和「停在選項」，「按一下就開始略過」沒修好。

## 2. DORM-AFTER-MOVEOUT
- 情境：
  - 【前置／捷徑】讀檔，條件事件關掉。econ＝2024-10-19 19:00 在公館，flags.Y0_MOVED_OUT。law＝第 8 天在校園，flags.MOVED_OUT=8（日期是人造的）。
  - 舊存檔：在欄位 1 寫一份 v:1 的存檔 → 重新整理 → 照玩家點「讀取」（會經過 migrate）。
- 驗證：觸控點手機 →「地點」分頁，讀 `.phrow` 的 data-place 和 data-gohome。
- b1b 的結果：
  - econ／law 退宿以後都沒有宿舍。
  - econ 第一列是「回臺北的家」。law 也有，因為 HOME.canGo 成立。
  - 舊存檔 migrate 成 v2 以後也沒有宿舍。
  - 沒退宿的對照組有宿舍。
- 對照版：退宿以後宿舍還在，也沒有「回臺北的家」。
- **請 BB 判斷**：b1b 的 econ 退宿以後，列表濾掉了台大其他地點，卻還留著「新體育館（大廳）」（gym 不在 NTU_ZONES 裡）。

## 3. LATE15（BUG-06）
- 情境：第 7 天（週二），大一國文 09:10–12:10，t0=9.1667。【前置】讀檔到目標時間前 1 分鐘；手機開著時，遊戲時鐘是停的，所以在手機開著時把 G.hour 校準到目標值。然後照玩家點「等到中午（12:00）」。用包一層 CLS.skipTo 的方式，記下按的那一刻的 h0（只記錄）。
- b1b 的結果：
  - a：+16 分（h0=9.4333），**沒有警告**，跳到 12:00，那堂課記 missed：PASS。
  - c：+10 分，有警告「照樣跳過｜會錯過：09:10 大一國文（上）」，選「先不要」時間沒有動：PASS。
  - b：正好 +15 分（h0=9.41667，和 t0+WIN1 的浮點值相同），**照樣警告**。照程式 `!(h0>t0+WIN1)` 是對的，只記錄。
- 對照版：a 有警告（就是這個 bug）。

## 證據
`shots/p1new/`：
- ADV 按下去以後卡在同一句（b1b）
- 退宿以後的地點清單（b1b、對照版各一張）
- LATE15 +16 分（b1b）

完整輸出在雲端 scratchpad 的 `out/p1new/`。
