# v9.7 候選 3（8ac75f6）— LAWWW2 的回歸紀錄

- 遊戲程式＝候選 1（5adef66）＝候選 2（06f2b64）＝候選 3（8ac75f6）（LAWWW 06:29Z、07:04Z 說明：之間只改測試）。
- worktree `/home/user/v97rc2_wt`：06f2b64＋候選 3 的 `tests/playlib.py`＋開發分支 a8f05de 的 `tests/flow_typhoon.py`；http server 8812（`/proc/<pid>/cwd` 確認），頁面版本字樣 v9.7。
- Playwright＋SwiftShader（iPhone 390×844 手機模擬、CDP 觸控），**不是 iPhone 實機**；同一時間只有一個瀏覽器。

| 測試 | 結果 | 時間（UTC） | 說明 |
|---|---|---|---|
| flow_typhoon（a8f05de 版） | FAIL（7 PASS／7 FAIL） | 07:05–07:15 | A 段（通知、麵店團、貼圖）＋B 段手機「今天放假（颱風假）」都 PASS；FAIL 是測試的兩個問題（下面 1、2） |
| phone_diag（我的診斷） | 找到原因 | 07:15 | 下面 3 |
| cg_rain_shots | portrait FAIL／landscape PASS | 07:15–07:22 | 直向被「請轉成橫向」提示擋住（下面 3） |

## 原因

1. **床的選項換了名字**：第 3 天以後晚上，床的選項是「睡到明天早上（07:30）」「睡到明天中午」…「再撐一下」（`story3d.js` 的 `S.bedOptions`），只有第 1、2 天是「睡覺」。
   測試找開頭是「睡覺」的按鈕 → 找不到、沒點 → 選單一直開著（busy）→ 300 秒後判 FAIL；之後的 `advance_dialogs` 選了第一個選項才睡著（所以「今天」分頁 PASS，07:30、颱風假）。
2. **早上的一次性事件沒點完就讀檔**：第 27 天 07:30 在宿舍醒來，`ev_course_selection`（「選課結果出來了…」，宿舍、7–12 點、once）照規則出現（測試的存檔沒有演過它）。
   C 段讀檔前的等待只等、不點 → 120 秒後照樣讀檔 → 這段對話接著演到 C 的 17:57（不是在 17:57 觸發：它的時段是 7–12 點）→ 泡麵之夜沒開始，後面 5 項連鎖 FAIL。
3. **直向的「請把手機轉成橫向（或直接點這裡繼續直向遊玩）」**（`#rotate.want`，z-index 12、整個畫面）：頁面一開就在，點一下才關（`game3d.js:419`），之後不會再出現。
   玩家在標題畫面就會點掉它；測試用 `load_state` 跳過標題畫面，它還蓋著 → 第一次點（手機按鈕、地面）被它吃掉。
   診斷：點之前按鈕中心最上面是 `#rotate.want`，事件全部打到 rotate（`pointerdown:rotate … click:rotate`）；點完它就關了，`element.click()` 直接打開手機（`phoneCls: panel`、`paused: true`）。
   `cg_rain_shots` 直向的截圖 `cg_rain_shots_01_cg_rain_portrait_1.webp` 就是這個提示蓋著整個畫面（點地面走不動，走不到總圖）。**遊戲本身照設計運作**；橫向的測試不受影響（提示只在直向顯示）。

## patch（只改測試；`docs/art-rebuild/second_ai/patches/`）

- `playlib_rotate_8ac75f6.patch`：`load_state` 讀檔時一起關掉 `#rotate`（和玩家在標題畫面點掉一樣；只影響直向）。
- `flow_typhoon_bed_course_a8f05de.patch`：床的選項找「睡到明天早上」（第 1、2 天的「睡覺」照樣找得到）；C 段讀檔前像玩家一樣把對話點完（選第 2 個：「算了，下學期再選。」不設旗標），等 3 秒×4 輪。
- 兩個都 `git apply --check` 過（RC3 的 playlib、a8f05de 的 flow_typhoon）。

## 重跑（用 patch，測試放在另一個資料夾，不動 worktree 的測試檔）

排在 flow_first_meet 後面：flow_typhoon_fix、cg_rain_shots_fix，結果補在這裡。
