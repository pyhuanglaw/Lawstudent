# CC_38：以安冒煙（Z_ANSMOKE）：七夕短冊挽回、行政法院 CG-29

- 探針：`docs/story_planning/test_tools/cc/cc_an_smoke_probe.py`。probe_lint 全部通過。CASES 可以選 tana_ok、tana_low、admin。
- 雲端 headless，用 ?turbo 推進前置（前置都有標示）。玩家要做的關鍵動作照玩家方式操作：用觸控按「快轉」、在手機上點「好。」、點「出發」、選選項。

## 和 BB 的說法不同：請 BB 確認
七夕短冊這一場**沒有讓玩家選的選項**。依 AA_600 第 3-2 節（企劃線 031414cad），「再一次。」是祐廷寫的那張，「好。」是以安寫的那張，兩句都是旁白。

這一場真正分岔的地方是挽回分數 `G.flags.REPAIR.heroine_01`，門檻是 3 以上（`src/data/jp_events.js:16`），所以探針照分數切成兩個情境：
- **tana_ok**：REPAIR=3，演她寫「好。」的那一支。
- **tana_low**：REPAIR=2，演「把短冊還給你」的那一支。

探針另外檢查這一場確實沒有出現選項。

## 7224af47a：ALL PASS（exit 0，262 秒）
- **tana_ok**：
  - 19:00 自己開演，沒有選項。
  - 四句照順序出現，最後一句是以安「……不准賴。」。
  - 旗標 AN_TANABATA_JP_REPAIR='again'，AN_JP_RECONCILED 有記，回到交往狀態。
  - 據點選單回得來。
- **tana_low**：旁白之後是「（她看了很久，把短冊還給你。）」，以安說「掛上去吧。」。旗標是 'hung'，沒有和好。
- **admin**：
  - 21:00 收到三則私訊，在手機上點「好。」，出遊排進行程。
  - 11/3 遊戲自己跳出「出發」。
  - 六句和 AA_601 一致。
  - CG-29（cg_admin_court_heroine01）在第二句旁白之後出現，G.cg.unlocked 有記錄。
  - 記憶 AN_ADMIN_TOGETHER 有記，熟悉 45→47、信任 30→31。
  - 結束後 busy=false，ADV 已關閉。
- 三段都沒有 JS 例外。

## c89a5f9be（對照版）：FAILED 8
- tana_ok、tana_low 各 3 項 FAIL：還是舊稿「以安拿著一張，寫了很久。」「你要看嗎？」。
- admin 2 項 FAIL：這一版還沒有 ev_an_admin_court_together。
- FAIL 都落在改稿的地方，符合「修好前 FAIL、修好後 PASS」。

## 截圖
在 `docs/story_planning/CC/shots/ansmoke/`：
- `02_tana_ok_end.png`
- `05_tana_low_end.png`
- `09_admin_cg29.png`

## 探針本身修過的地方（不是遊戲問題）
- 偶爾開頁就 Page crashed（當時同時有兩條線在跑），改成最多重開三次。
- 讀檔時直接讀 19:00，c89 等了 240 秒都沒有開演，因為讀檔和據點迴圈誰先跑不一定。改成讀 18:45，再照玩家方式按「快轉」。真正的玩家不會這樣讀檔。

## PC 佇列
- Z_ANSMOKE（7224）已經解除 HOLD。
- 另外排了 V18_ANSMOKE（6a8033f4e），逾時 45 分鐘。
