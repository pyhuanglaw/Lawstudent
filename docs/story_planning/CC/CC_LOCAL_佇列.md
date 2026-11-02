# CC-本機 佇列（CC 雲端 → CC-本機；BB_227）

由 CC（帳號 A，雲端）維護。CC-本機從 `claude/cc-testing` 開 `claude/cc-local`，照順序跑，結果寫進 `docs/story_planning/CC/CC_LOCAL_結果.md`，再 commit＋push 到 `claude/cc-local`。
移到這裡的項目，雲端 CC 不重複跑。最後的 PASS／FAIL／GO 判定歸 BB；你交原始結果＋證據＋「CC-本機 初判」。

## 共同規則（同雲端 CC，不准放寬）
- 照 `docs/TESTING.md`、D34。真實玩家流程不用 `?turbo`、不瞬移、不改劇情狀態；捷徑只能當前置條件，標【前置／捷徑】。下面各項的探針本來就照這個寫（URL 帶 `?turbo` 的是探針設計如此，探針內會標前置）。
- Playwright 模擬 ≠ iPhone 實機。
- **不要跑 `playwright install`** 以外的東西前先確認：本機若沒有 Python playwright，`pip install playwright==1.63.0` 後 `python -m playwright install chromium`（本機可以裝；雲端才不行）。
- 使用者存檔不 commit、不上傳。截圖只推判斷需要的幾張（放 `docs/story_planning/CC/shots/local/`）。
- 只推 `claude/cc-local`；不碰 main、開發分支、`claude/story-planning`；不 force push；不無條件 `git add .`。commit 訊息開頭寫「CC-本機」。

## 開遊戲伺服器（每項各自的版本）
```bat
git fetch origin claude/confident-ritchie-8rwh7t
git worktree add --detach ..\wt_<名字> <SHA>
cd ..\wt_<名字> && start /b python -m http.server <port>
```
探針一律從 repo 本身（`claude/cc-local` 的工作樹）執行，因為它們 `import` 上一層的 `test_tools/bbplay.py`：
```bat
set LW_TESTS=<遊戲 worktree>\tests
set SHA=<SHA>
python docs\story_planning\test_tools\cc\<探針>.py "http://127.0.0.1:<port>/index.html?turbo" <輸出資料夾>
```
（PowerShell：`$env:LW_TESTS="..."; $env:SHA="..."`）

---

## L1 速度基準（先做）
- 版本：開發分支最新 head（`git rev-parse --short origin/claude/confident-ritchie-8rwh7t`，寫進結果）。
- 指令：在遊戲 worktree 開 server（port 8765），從遊戲 worktree 執行
  `python tests\p0_movement.py http://127.0.0.1:8765/index.html`，用 `Measure-Command` 或前後 `time /t`／`Get-Date` 記總花費秒數。
- 另外用一支小 Playwright 腳本開同一個網址，`page.evaluate` 讀 WebGL renderer：
  ```js
  (()=>{const c=document.createElement('canvas'),g=c.getContext('webgl');const e=g&&g.getExtension('WEBGL_debug_renderer_info');return g?(e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)):'no webgl'})()
  ```
  確認字串**不是** SwiftShader（是 ANGLE／你的顯示卡名稱）。也記遊戲內 FPS（`?mdbg` 面板或 `renderer.info`）。
- 交：head SHA、p0_movement 結果（ALL PASS／FAIL 原文最後幾行）、總秒數、renderer 字串、FPS。雲端對照：同一支 p0 在 SwiftShader 約 1–4 fps。

## L2 #12 補考第二輪（BB 09:25 插隊 ②③；從雲端移過來）
- 版本：`b4f98ea4e`（含 `d9d637553` 補考第二輪合併）。
- 探針：`docs/story_planning/test_tools/cc/cc_makeup_probe.py`（檔頭有每個 case 的說明）。
- 指令：`set CASES=study3h,skipnoon_seat,skipnoon_phone,homerest,old_delayed,home`，輸出資料夾 `out\mk_d9`。
- BB 要看的：
  1. study3h：讀書長度選項「讀 3 小時」變灰，出現「讀到補考前（09:50）」那一項。
  2. skipnoon_phone／skipnoon_seat：「等到中午」「待到中午」被擋或停在補考。
  3. 坐著停下來也會接到補考（skipnoon_seat、study3h 的座位那一段）。
  4. homerest：在家「休息一下」的「會錯過」列補考。
  5. old_delayed：舊存檔 6/18 已延畢、日期 6/26 以前 → 讀檔後改給補考（FD_MAKEUP pending、FAIL_DELAY 沒了），**提示句**和**手機教務處通知**兩個都要有；③ 同一份存檔再讀一次結果不變（探針已有 IDEM 檢查）。
  6. home：go／sleep／late／rest 四個子情境。
- 交：探針輸出的 check 清單（每行 PASS／FAIL）、`transcript_*.json` 的重點、每個 case 一兩張關鍵截圖（直向＋橫向）。FAIL 先重跑一次、看截圖分辨是腳本還是遊戲問題。
- 雲端已知的 Node 結果（供對照，8b1311c4b）：audit_makeup_timeskip 在 d9d637553 ALL PASS；TRIP 邊界 F5（當天已有 3 件會錯過時補考被 slice 擠掉）FAIL。

## L3 #11 背景截圖 107（36 個場景；從雲端移過來）
- 版本：`d2716c89e`（若 BB 另說用最新 head 就照 BB）。
- 探針：`docs/story_planning/test_tools/cc/cc_bg107_probe.py`（GROUP 107／dark／108／109／lib，檔頭有每個場景的前置）。
- 指令：預設全跑，輸出資料夾 `out\bg107`。
- 交：每個場景一張遊戲截圖（背景圖是否載入正確、有沒有錯圖／缺圖／黑畫面），探針 check 清單；挑有問題的場景截圖推上來。

## L4 #5 立繪截圖 pt106（17 個場景，含 jp_liheng、jp_yuheng；從雲端移過來）
- 版本：`d2716c89e`。
- 探針：`docs/story_planning/test_tools/cc/cc_pt106_probe.py`，輸出資料夾 `out\pt106`。
- 交：每個場景的立繪截圖與 check 清單（立繪是否出現、是不是對的人／服裝、有沒有 debug 標籤）。

---
做完一項就在 CC_LOCAL_結果.md 寫一節並 push；全部做完或卡住，在結果檔最上面寫狀態，BB 會讀。
