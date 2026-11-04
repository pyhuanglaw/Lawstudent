# TT_V7_timeout：TIMEOUT（TIMEOUT/UNKNOWN）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_timeout.py（blob 524f8b4fdc97c91b2d70d593c14f3fb975bcc4f3 / None）
- 兩次條件相同：False 
- 重跑範圍：沒有重跑

## 判斷依據
- 逾時被 runner 中止（timeout 1 min）；沒有環境訊號、沒有 traceback 可以判斷——只憑逾時不判 GAME_BUG
- 逾時不重跑（預設；要重跑：ENV CC_RETRY_TIMEOUT=1，而且逾時 ≤ CC_RETRY_MAX_MIN=20 分）

## 每一次
- 第 1 次：exit 1 timeout 1 min，60 秒，FAIL 0 行

## JS／console 錯誤

## 遊戲狀態

## 檔案

- 捷徑：turbo=False，[前置／捷徑] 0 行（讀檔 0）
