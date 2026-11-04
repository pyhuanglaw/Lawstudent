# TT_cases：FAIL（UNKNOWN/assert）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_cases.py（blob 689c08f6d9fdd88cbe2d93a0c7b74faaec2692c1 / 689c08f6d9fdd88cbe2d93a0c7b74faaec2692c1）
- 兩次條件相同：True 
- 重跑範圍：只重跑 FAIL 的 CASE B（第一次跑了 A,B；前置操作照探針原樣做）

## 判斷依據
- 探針斷言 FAIL 1 行（B 文字是「錯的預期」），兩次一致；沒有 JS 例外、沒有 traceback、沒有環境訊號——要看預期／實際判斷是遊戲還是探針

## 每一次
- 第 1 次：exit 1 ，4 秒，FAIL 1 行
  - `FAIL B 文字是「錯的預期」  實際 按過了：祐廷`
- 第 2 次：exit 1 ，4 秒，FAIL 1 行
  - `FAIL B 文字是「錯的預期」  實際 按過了：祐廷`

## JS／console 錯誤

## 遊戲狀態
- ```{"href": "about:blank", "game": null}```

## 檔案
- trace `attempt2/trace/trace_TT_cases_1_c001_FAIL.zip`（31149 bytes）

- 捷徑：turbo=False，[前置／捷徑] 2 行（讀檔 0）
