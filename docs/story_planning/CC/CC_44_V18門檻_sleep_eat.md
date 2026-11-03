# CC_44：v9.10.18 發布門檻：睡覺過場、下課吃飯（雲端 headless）

候選版本：ffeec06e0（發布樹 0776cafc8 是 ffee 再加上版本字樣）。截圖放在 `docs/story_planning/CC/shots/v18gate/`。

## cc_sleep_cine_probe.py（f5cd65cdf）
| 版本 | 結果 |
|---|---|
| **ffeec06e0** | **ALL PASS（18 項）** |
| e79973830 | ALL PASS（18 項） |
| d231、6a80（之前跑的） | ALL PASS |
| 對照 0f66c4215 | FAILED 6：都在「上床」那幾項——還會走到梯子（walkTo）、出現爬梯 pose、人沿著梯子移動、直接黑幕而不是熄燈慢慢變暗、躺好時燈沒熄也沒閉眼 |

ffee 上：walkTo 是空的，climb_frames 是 0，roomDark 一次到 1，躺好時 dark=1、有閉眼。醒來從床上爬下來的那段照舊通過。

## cc_eat_after_class_probe.py（07e766f95；CASES 包括 noodle、cvs_day、cvs_night）
| 版本 | 結果 |
|---|---|
| **ffeec06e0** | **ALL PASS（53 項）** |
| e79973830 | ALL PASS（53 項） |
| 6a80 | ALL PASS |
| 對照 0f66c4215 | FAILED 22／PASS 31：ADV 背景只有 blur，沒有店的圖，沒有店名旁白，時間直接跳到下一堂，吃飯途中區域換成 campus；cvs_night 連 ADV 都沒開 |

- **d231 那份 FAILED 2 是探針的問題，不是遊戲的問題。**
  - 失敗的兩項都是「旁白是那家店的那一句」。當時的探針讀的是畫面上對話框的字，而對話框是一個字一個字打出來的（game3d.js dlgTick）。雲端只有 1～4 fps，讀到的時候只印出「阿鳳麵」「便利商」三個字。
  - 同一段的扣錢、背景、店名字幕、40 分鐘這幾項都 PASS。
  - 探針已經改成判斷 GAME.say 的參數、比對開頭（第 198～199 行）。6a80、e799、ffee 都是用改過的版本跑的。
- 之前那份 eat_pre0f66.log 是 Playwright driver 出 EPIPE 中途掛掉，不算數。上表的對照結果是重跑的完整結果。

## X161（BB 接手，我這邊沒跑）：給 BB 參考的發現
- 舊的 `target_ge.log` 其實跑的是 6a8033f4e（wt_x161 當時被切到那一版），不是 84c5。
- **對照版不能用 9a1c037a6^**：9a1c037a6^＝09a1b02af，那就是修正本身。正確的對照版是 **e8589020f**，探針的 docstring 也這樣寫。
- 「對話框字一樣」那兩項 FAIL 是探針的問題：讀到的是打字打到一半的字（「看了前」、空字串）。
  - GAME.say 本身和 AA_495 GE3／GE8 完全一樣；說話的人在前一排或同一排、距離 3.2 m 以內；說話時沒有轉暗。
  - 修法建議：等到 `#dlgText` 等於 `GAME.D.full` 再記錄。
- 「6 個人憑空出現」是遊戲的問題：這 6 個人在 13:20 轉暗結束的那一刻第一次被看到時，就已經坐在位子上了。e799 的 BUG-SEATTALK-FADE 可能修的就是這個。
  - 要注意探針的邊界：fps 低的時候，新加入的 NPC 沒有前一筆 fade 紀錄，會被誤判成 popped。

## PC
已經排了 V18G_sleep、V18G_eat（ffeec06e0，headed），在 V18R 之後跑。
