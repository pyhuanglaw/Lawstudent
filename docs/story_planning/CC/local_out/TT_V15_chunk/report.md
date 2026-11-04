# TT_V15_chunk：FAIL（UNKNOWN/assert）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_longchunk.py（blob e65111398fbe2a8e0c9e3e503ffc1454c1b830e3 / e65111398fbe2a8e0c9e3e503ffc1454c1b830e3）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 探針斷言 FAIL 1 行（CASE C 結束），兩次一致；沒有 JS 例外、沒有 traceback、沒有環境訊號——要看預期／實際判斷是遊戲還是探針

## 每一次
- 第 1 次：exit 1 ，145 秒，FAIL 1 行
  - `FAIL CASE C 結束  自測：C 故意 FAIL`
- 第 2 次：exit 1 ，175 秒，FAIL 1 行
  - `FAIL CASE C 結束  自測：C 故意 FAIL`

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
- ```{"href": "http://127.0.0.1:8813/index.html", "snapshot": {"v": 1, "zone": "dorm", "day": -379, "hour": 7.397, "dateKey": null, "pos": {"x": -0.9, "z": 1.98, "y": 0, "lv": 0, "yaw": -1.503}, "player": {"busy": false, "frozen": false, "pose": "walk", "riding": false, "seat": null, "path": true}, "paused": false, "busyDepth": 0, "dlg": false, "adv": false, "events": false, "phone": false, "entering": false, "lastTalkError": null, "goal": "今天的課：09:10 經濟學原理（上）。上課、讀書或自由活動都可以", "money": 22000, "flags": {"dating_kexin": false, "KX_DEC3_MIGRATED": true, "YT_JOB_V": 1, "NAMECARD_V": 1, "LIFELINE_V": 1, ```

## 檔案
- trace `attempt2/trace/trace_TT_V15_chunk_1_c004.zip`（18560309 bytes）
- trace `attempt2/trace/trace_TT_V15_chunk_1_c005.zip`（19791763 bytes）
- trace `attempt2/trace/trace_TT_V15_chunk_1_c006.zip`（1666221 bytes）
- 截圖 `attempt1/out/long_A.png`
- 截圖 `attempt1/out/long_B.png`
- 截圖 `attempt1/out/long_C.png`
- 截圖 `attempt2/out/long_A.png`
- 截圖 `attempt2/out/long_B.png`
- 截圖 `attempt2/out/long_C.png`

- 捷徑：turbo=False，[前置／捷徑] 2 行（讀檔 0）
