# SEE-THROUGH-FAIL-1023：`tests/see_through.py` 兩項 FAIL 的原因

- **誰要的**：LAWWW-B 10-23 13:50。查「是測試過時，還是鏡頭透視真的壞了」，交件附前後數字。
- **做的人**：LAWWW2-B。
- **結論**：兩項都是**測試過時**，引擎的透視沒有壞。只改測試（`patches/see_through_test_1023.patch`），**沒有改 `engine3d.js`**。

## 原因（開發 `fb75d67ea`，加診斷輸出跑同一支測試）

| 項目 | 修改前讀到的值 | 診斷看到的 |
|---|---|---|
| 演出鏡頭時不開透視 | 117.70 | 讀檔以後 `E.paused` 是 true，`E.frame` 停在 30。等 1.5 s、5.5 s 都沒動。 |
| 室內不開透視 | 169.33 | 宿舍 `E.indoor` true，但 `zone.seeThru` 也是 true。 |

1. **遊戲是暫停的**：讀檔以後，要回覆的訊息會讓手機自動打開（`story3d.js` 的 `S.phoneAuto`，D103）。
   - `openPhone` 會設 `E.paused=true`。遊戲迴圈停了，`uSeeR` 停在讀檔前最後一格的值（117.7）。
   - 引擎的演出鏡頭分支本來就每一格把 `uSeeR` 設成 0（`engine3d.js` 的 `updateCamera`），只是那一格沒有跑。
   - 前面三組樹幹的量測用 `E.render()` 直接畫，不靠迴圈，所以照樣 PASS。
2. **宿舍本來就開透視**：宿舍區域有 `seeThru:true`（上舖床板、被子擋住鏡頭時網點透空，`zones3d.js`）。所以「宿舍不開透視」這個期待已經不對，而且它也一樣是暫停時讀到的舊值。

## 改了什麼（測試）

- 讀檔以後：
  - 收起手機、關掉選單（`GAME.closePhone`、`GAME.closeMenu`）。
  - 這支測試裡關掉自動打開手機（`STORY.phoneAuto` 換成空函式）。
- 新增一項「量測前遊戲迴圈在跑（沒有被手機、選單暫停）」：1.5 s 內 `E.frame` 有前進、`E.paused` 是 false。以後再暫停會直接看到，不會讀到舊值。
- 室內那一項改看麵店：室內、沒有開 `seeThru`。先檢查這三件事和迴圈在跑，再看 `uSeeR` 是 0。

## 前後數字

| 跑法 | 結果 |
|---|---|
| 修改前的測試，開發 `fb75d67ea` | 2 項 FAIL：演出鏡頭 117.70、室內 169.33 |
| 修改後的測試，開發 `fb75d67ea` | ALL PASS：演出鏡頭 0、麵店 0、迴圈前進 4 格 |
| 修改後的測試，**故意弄壞的引擎**（拿掉演出鏡頭分支的 `ST.uSeeR.value=0`） | FAIL「演出鏡頭時不開透視」117.70。測試抓得到真的壞掉 |

- 弄壞的引擎只在我的測試樹裡跑一次，跑完換回原本的 `engine3d.js`，`git diff` 確認沒有改到。
- 測試環境：Playwright＋SwiftShader（iPhone 390×844 模擬），**不是 iPhone 實機**。
