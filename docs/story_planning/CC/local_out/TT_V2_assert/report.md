# TT_V2_assert：FAIL（UNKNOWN/assert）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_assert.py（blob 142f1b38cc48752a0cc452da2998927fd65ae6bf / 142f1b38cc48752a0cc452da2998927fd65ae6bf）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 探針斷言 FAIL 1 行（文字是「這不可能」（故意寫錯的預期）），兩次一致；沒有 JS 例外、沒有 traceback、沒有環境訊號——要看預期／實際判斷是遊戲還是探針

## 每一次
- 第 1 次：exit 1 ，16 秒，FAIL 1 行
  - `FAIL 文字是「這不可能」（故意寫錯的預期）  預期 這不可能，實際 dorm`
- 第 2 次：exit 1 ，27 秒，FAIL 1 行
  - `FAIL 文字是「這不可能」（故意寫錯的預期）  預期 這不可能，實際 dorm`

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
- trace `attempt2/trace/trace_TT_V2_assert_1_c001_FAIL.zip`（1675554 bytes）
- 截圖 `attempt1/out/assert.png`
- 截圖 `attempt2/out/assert.png`

- 捷徑：turbo=False，[前置／捷徑] 2 行（讀檔 0）
