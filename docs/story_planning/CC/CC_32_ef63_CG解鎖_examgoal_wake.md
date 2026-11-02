# CC_32 ef63b1877：ancf2 真實流程（REAL=1）／examgoal_wake，以及「所有 ADV.cg 都不會解鎖」

雲端 Playwright 手機模擬（SwiftShader），直向，不是 iPhone。探針：`test_tools/cc/cc_next1102_ui_probe.py`（新增 CASE examgoal_wake、開關 REAL=1），lint PASS。

| 項目 | 類別 | 結果 | CC 初判 |
|---|---|---|---|
| examgoal_wake（0e11c43a3、ef63b1877） | 🟢 主要是真實流程（只有起點用讀檔） | **ALL PASS**：12/14 22:30 在宿舍，走到床 →「睡覺」→「睡到明天早上（08:10）」→ 起床劇情（ev_course_selection，照玩家點完）→ 一演完，G.goal 和 #goal 就是「09:10 期末考：憲法（上）（法律系館A 201）」 | PASS。中間沒有經過「—」，所以 CLS tick 補上的那一條路沒有實際走到；目標在睡覺或起床時就已經設好了 |
| ancf2 REAL=1（不開 turbo、不用 OUT.go） | 🟡 有好感度等前置 | 出發提示**有出現**：大一上 34.9 秒、大一下 38.3 秒（從 18:28 讀檔起算），都用觸控按「出發：學期末的飯…」。she2 的承接逐字 PASS；結果交往；CG-11 沒有出現；AN_SHOP_PAGE 這一版只記一筆 | BB 的 ② 解除：前一輪 30 秒等不到，是 turbo 加 30 秒上限造成的，不是遊戲問題 |
| **CG-27**（cg_shop_page_check_heroine01） | 🟡 | **畫面有顯示**（ADV.cg 有呼叫；背景圖 assets/cg/heroine_01/cg_shop_page_check.webp），**但 G.cg.unlocked 是空的**，相簿不會有這張 | **遊戲 bug，影響所有 ADV.cg**（見下） |

## 遊戲 bug：ADV.cg 顯示的 CG 一律不會解鎖、不會進相簿（請轉 LAWWW）
- `src/adv3d.js:103` 的 `A.cg`：圖載完以後，`if(window.GAME&&GAME.G){ … GAME.G.cg.unlocked.push(…) }`。
- `src/game3d.js:3` 是最外層的 `const GAME = (function(){…})`。classic script 最外層的 const **不會**掛到 window 上。
- **CC 在 ef63b1877 的頁面裡直接讀過**：`typeof window.GAME === 'undefined'`、`typeof GAME === 'object'`，`window.ADV` 也是 undefined。
- 所以每一張經過 ADV.cg 的 CG，畫面上都看得到，但都不會記進 G.cg.unlocked，相簿裡也不會有。只有手機照片那條（phone3d.js:38 直接寫 G.cg）會解鎖。
- 和 CC_31 的 ADV-SKIP 是**同一個根源**（adv3d.js:45 的「略過對話」也用 `window.GAME&&`）。ef63b1877 裡 src 用到 `window.GAME` 的只有這兩處（git grep 結果）。
- 建議改法：兩處都改成 `typeof GAME!=='undefined'&&`。
- 舊存檔：已經看過的 CG 都沒有記錄，修好以後要不要補，請 BB／LAWWW 判斷（例如依照劇情旗標補登）。
- Node 單元測試抓不到這個 bug：Node 的測試環境通常把 GAME 掛在 global 上，所以 window.GAME 讀得到。

## 請 BB 判斷
- CG-27 的畫面是餐桌上的手帳，旁邊有碗和筷子。但播這一拍時的背景是公館巷子（已經走出店門），地點可能對不上。

## 證據
`shots/uief63/`：
- 出發提示那一刻（大一下）
- CG-27 畫勾那一句
- 「……勾了。」
- 逐字台詞
- examgoal_wake：床、目標

完整輸出在雲端 scratchpad `out/uief63/`。
