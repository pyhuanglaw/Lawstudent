# TT_V2b_probe：FAIL（TEST_BUG/assert-probe）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_assert_probe.py（blob b5cc310cc377f4c1e29180ef669727a82751b8ce / b5cc310cc377f4c1e29180ef669727a82751b8ce）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 探針斷言 FAIL 1 行，比對的是探針自己的常數（[src=probe]），和遊戲無關；第一行：探針的兩個常數相等（故意寫錯）
- 探針的值：[src=probe] 探針常數 EXPECT_N＝3、ACTUAL_N＝4

## 每一次
- 第 1 次：exit 1 ，20 秒，FAIL 1 行
  - `FAIL 探針的兩個常數相等（故意寫錯）  [src=probe] 探針常數 EXPECT_N＝3、ACTUAL_N＝4`
- 第 2 次：exit 1 ，40 秒，FAIL 1 行
  - `FAIL 探針的兩個常數相等（故意寫錯）  [src=probe] 探針常數 EXPECT_N＝3、ACTUAL_N＝4`

## JS／console 錯誤
- console [.WebGL-0x204c0724e000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
- console 星期和日期對不上，照行事曆改： 4 → 3
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console [.WebGL-0x204c0724e000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console [.WebGL-0x204c0724e000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
- console [.WebGL-0x204c0724e000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.

## 遊戲狀態
- ```{"href": "http://127.0.0.1:8800/index.html", "snapshot": {"v": 1, "zone": "dorm", "day": 1, "hour": 17.55, "dateKey": null, "pos": {"x": -40, "z": -5, "y": 0, "lv": 0, "yaw": -1.571}, "player": {"busy": true, "frozen": false, "pose": "idle", "riding": false, "seat": null, "path": false}, "paused": false, "busyDepth": 0, "dlg": false, "adv": false, "events": false, "phone": false, "entering": false, "lastTalkError": null, "goal": null, "money": 22000, "flags": {"dating_kexin": true, "KX_DEC3_MIGRATED": true, "YT_JOB_V": 1, "NAMECARD_V": 1, "deptHear": {"talk:椰": 1, "醫學:平常": 1, "電機:平常": 1, "經濟:平```

## 檔案
- trace `attempt2/trace/trace_TT_V2b_probe_1_c001_FAIL.zip`（1703364 bytes）
- 截圖 `attempt1/out/assert_probe.png`
- 截圖 `attempt2/out/assert_probe.png`

- 捷徑：turbo=False，[前置／捷徑] 2 行（讀檔 0）
