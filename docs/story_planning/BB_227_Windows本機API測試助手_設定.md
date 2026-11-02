# BB_227 用使用者的 Windows 電腦＋API 額度跑測試（2026-11-02 09:1x，BB（帳號 A））

## 為什麼值得做
- 雲端的瀏覽器沒有顯示卡，遊戲只跑得到每秒 1～4 格。CC 現在排了十幾個小時的瀏覽器測試，大部分時間都在等畫面。
- 一般的 Windows 電腦有顯示卡，同一支測試大約快 5～10 倍（要實際跑過才知道；這是估計值）。
- 花的是 API 額度（每月 200 美元），不佔訂閱的額度。

## 一次性安裝（約 20 分鐘）
1. 安裝 **Git for Windows**、**Node.js LTS**、**Python 3.12**（安裝 Python 時勾選「Add to PATH」）。
2. 到 console.anthropic.com → API Keys → 建立一把金鑰。**在 Billing 設定每月上限 200 美元**，避免超支。金鑰不要貼到對話或 GitHub。
3. 打開 PowerShell，依序執行：
   ```
   setx ANTHROPIC_API_KEY "你的金鑰"
   npm install -g @anthropic-ai/claude-code
   git clone https://github.com/pyhuanglaw/Lawstudent.git
   cd Lawstudent
   pip install playwright
   python -m playwright install chromium
   ```
   第一行執行完以後，**關掉 PowerShell 再重開**，金鑰才會生效。
4. 推送權限：執行 `git config --global user.name 你的名字`，然後裝 GitHub CLI（`winget install GitHub.cli`），再跑 `gh auth login` 登入，這台電腦才能 push。
5. 在 Lawstudent 資料夾執行 `claude`。登入方式選 **API key**（不要選訂閱帳號）。輸入 `/model`，選 **Sonnet**（跑測試夠用，比 Opus 便宜很多）。

## 啟動提示詞（貼給本機的 Claude Code）
```
你是「CC-本機」，《法條之外》的測試執行助手，在使用者的 Windows 電腦上跑瀏覽器測試。上級是 BB。
1. 先讀 CLAUDE.md、docs/TESTING.md、docs/story_planning/CC/CC_00_交接紀錄.md、docs/story_planning/BB_227_Windows本機API測試助手_設定.md。
2. 只用分支 claude/cc-local（從 origin/claude/cc-testing 開出來）。不碰 main、開發分支、企劃線，也不碰其他人的分支。不發布。
3. 工作清單：docs/story_planning/CC/CC_LOCAL_佇列.md（CC 或 BB 會寫）。照順序跑，每跑完一項就把結果、截圖、log 寫進 docs/story_planning/CC/CC_LOCAL_結果.md，然後 commit＋push。
4. 測試規則照 TESTING.md：不用 ?turbo 的真實流程要標明；捷徑要標【前置／捷徑】；Playwright 不等於 iPhone 實機。你只寫「初判」，PASS／FAIL 由 BB 判定。
5. 開發分支的版本用 git worktree 開在另一個資料夾，用 python -m http.server 開 server。
6. 使用者跟你說話時先回答他；額度快用完，或使用者說「現在換班」時，先 commit＋push 再停。
```

## 溝通方式
- 本機的 Claude Code 沒有雲端工作階段之間傳訊息的工具，所以用 GitHub 檔案交接：CC 把要跑的寫進 `CC_LOCAL_佇列.md`，本機把結果寫進 `CC_LOCAL_結果.md` 並 push，BB／CC 再去讀。
- 使用者開著電腦的時候才會跑。關機就停，不影響雲端的 CC。

## 費用（粗估，以實際帳單為準）
- 用 Sonnet 跑測試，主要是看 log、寫結果，大約每小時幾美元。200 美元大概能跑幾十個小時。Billing 頁面隨時看得到用了多少。

## 還沒做的
- 「CC-本機」不是正式職位：值班表、duty.json 都還沒登記。第一次實際跑起來以後，BB 再請 LAWWW 正式登記，也可能直接把它當成 CC 的延伸。
