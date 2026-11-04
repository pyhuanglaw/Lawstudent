# TT_V5_jserror：FAIL（GAME_BUG/初判）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_jserror.py（blob aa0457d53ccd8b4a474e1b08d6da8ac29b9e18c1 / aa0457d53ccd8b4a474e1b08d6da8ac29b9e18c1）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 探針斷言 FAIL 1 行（第一行：頁面沒有 JS 例外）
- 遊戲頁面 pageerror 1 筆，第一筆：TypeError GAME.ccSelftestMissingFn is not a function
- stack 第一行：at ccSelftestBoom (<anonymous>:1:80)

## 每一次
- 第 1 次：exit 1 ，15 秒，FAIL 1 行
  - `FAIL 頁面沒有 JS 例外  實際：['GAME.ccSelftestMissingFn is not a function']`
- 第 2 次：exit 1 ，26 秒，FAIL 1 行
  - `FAIL 頁面沒有 JS 例外  實際：['GAME.ccSelftestMissingFn is not a function']`

## JS／console 錯誤
- console 自測：呼叫不存在的 GAME 函式
- pageerror GAME.ccSelftestMissingFn is not a function
- console 星期和日期對不上，照行事曆改： 4 → 3
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.

## 遊戲狀態
- ```{"href": "http://127.0.0.1:8802/index.html", "snapshot": {"v": 1, "zone": "dorm", "day": 1, "hour": 17.55, "dateKey": null, "pos": {"x": -40, "z": -5, "y": 0, "lv": 0, "yaw": -1.571}, "player": {"busy": true, "frozen": false, "pose": "idle", "riding": false, "seat": null, "path": false}, "paused": false, "busyDepth": 0, "dlg": false, "adv": false, "events": false, "phone": false, "entering": false, "lastTalkError": null, "goal": null, "money": 22000, "flags": {"dating_kexin": true, "KX_DEC3_MIGRATED": true, "YT_JOB_V": 1, "NAMECARD_V": 1, "deptHear": {"talk:椰": 1, "醫學:平常": 1, "電機:平常": 1, "經濟:平```

## 檔案
- trace `attempt2/trace/trace_TT_V5_jserror_1_c001_FAIL.zip`（1347940 bytes）
- 截圖 `attempt1/out/jserror_after.png`
- 截圖 `attempt1/out/jserror_before.png`
- 截圖 `attempt2/out/jserror_after.png`
- 截圖 `attempt2/out/jserror_before.png`

- 捷徑：turbo=False，[前置／捷徑] 2 行（讀檔 0）
