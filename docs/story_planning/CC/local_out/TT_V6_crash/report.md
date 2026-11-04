# TT_V6_crash：FAIL（ENVIRONMENT/browser）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_crash.py（blob 3b6d87796a69aac2e5b2f37eb1fb6605830e4dae / 3b6d87796a69aac2e5b2f37eb1fb6605830e4dae）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 瀏覽器／頁面被關掉（Target closed）：「playwright._impl._errors.TargetClosedError: Page.evaluate: Target page, context or browser has been closed」
- events.jsonl：browser_disconnected（rel 3.0s）
- 在 crash／斷線之前沒有探針的 FAIL 行

## 每一次
- 第 1 次：exit 1 ，10 秒，FAIL 0 行
- 第 2 次：exit 1 ，10 秒，FAIL 0 行

## JS／console 錯誤
- browser_disconnected 

## 遊戲狀態
- ```null```

## 檔案

- 捷徑：turbo=False，[前置／捷徑] 0 行（讀檔 0）
