# TT_V4_selector：FAIL（TEST_BUG/初判）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_selector.py（blob 618417ef080e4adb5d489ac990ddf75ba58098a8 / 618417ef080e4adb5d489ac990ddf75ba58098a8）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 探針 Python traceback：playwright._impl._errors.TimeoutError: Page.wait_for_selector: Timeout 3000ms exceeded.
- 原因類型：playwright 等待逾時（TimeoutError）
- 探針出錯的位置：File "<REPO>\docs\story_planning\test_tools\cc\selftest\st_selector.py", line 13, in main
- 等待的 selector：#no-such-button
- trace 的 DOM snapshot 裡沒有這個 selector（只檢查 #id 形式）
- 遊戲頁面沒有 pageerror

## 每一次
- 第 1 次：exit 1 ，10 秒，FAIL 0 行
- 第 2 次：exit 1 ，23 秒，FAIL 0 行

## JS／console 錯誤
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
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.

## 遊戲狀態
- ```{"href": "http://127.0.0.1:8802/index.html", "snapshot": {"v": 1, "zone": "dorm", "day": 1, "hour": 17.55, "dateKey": null, "pos": {"x": -40, "z": -5, "y": 0, "lv": 0, "yaw": -1.571}, "player": {"busy": true, "frozen": false, "pose": "idle", "riding": false, "seat": null, "path": false}, "paused": false, "busyDepth": 0, "dlg": false, "adv": false, "events": false, "phone": false, "entering": false, "lastTalkError": null, "goal": null, "money": 22000, "flags": {"dating_kexin": true, "KX_DEC3_MIGRATED": true, "YT_JOB_V": 1, "NAMECARD_V": 1, "deptHear": {"talk:椰": 1, "醫學:平常": 1, "電機:平常": 1, "經濟:平```

## 檔案
- trace `attempt2/trace/trace_TT_V4_selector_1_c001.zip`（1210465 bytes）

- 捷徑：turbo=False，[前置／捷徑] 2 行（讀檔 0）
