# TT_V2a_game：FAIL（GAME_BUG/assert-game）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_assert_game.py（blob dfbeb1468b67f69deff1fee6bd8a99634a736c2a / dfbeb1468b67f69deff1fee6bd8a99634a736c2a）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 探針斷言 FAIL 1 行，比對的值是從遊戲狀態讀出來的（[src=game]）；第一行：GAME.G.money 是 145457（故意寫錯的預期）
- 遊戲回報／預期：[src=game] 遊戲回報 GAME.G.money＝22000，預期 145457
- 兩次一致

## 每一次
- 第 1 次：exit 1 ，37 秒，FAIL 1 行
  - `FAIL GAME.G.money 是 145457（故意寫錯的預期）  [src=game] 遊戲回報 GAME.G.money＝22000，預期 145457`
- 第 2 次：exit 1 ，35 秒，FAIL 1 行
  - `FAIL GAME.G.money 是 145457（故意寫錯的預期）  [src=game] 遊戲回報 GAME.G.money＝22000，預期 145457`

## JS／console 錯誤
- console [.WebGL-0x3c0c01d9c000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
- console 星期和日期對不上，照行事曆改： 4 → 3
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console [.WebGL-0x3c0c01d9c000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console [.WebGL-0x3c0c01d9c000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console [.WebGL-0x3c0c01d9c000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.
- console THREE.WebGLRenderer: Texture marked for update but no image data found.

## 遊戲狀態
- ```{"href": "http://127.0.0.1:8801/index.html", "snapshot": {"v": 1, "zone": "dorm", "day": 1, "hour": 17.55, "dateKey": null, "pos": {"x": -40, "z": -5, "y": 0, "lv": 0, "yaw": -1.571}, "player": {"busy": true, "frozen": false, "pose": "idle", "riding": false, "seat": null, "path": false}, "paused": false, "busyDepth": 0, "dlg": false, "adv": false, "events": false, "phone": false, "entering": false, "lastTalkError": null, "goal": null, "money": 22000, "flags": {"dating_kexin": true, "KX_DEC3_MIGRATED": true, "YT_JOB_V": 1, "NAMECARD_V": 1, "deptHear": {"talk:椰": 1, "醫學:平常": 1, "電機:平常": 1, "經濟:平```

## 檔案
- trace `attempt2/trace/trace_TT_V2a_game_1_c001_FAIL.zip`（1782292 bytes）
- 截圖 `attempt1/out/assert_game.png`
- 截圖 `attempt2/out/assert_game.png`

- 捷徑：turbo=False，[前置／捷徑] 2 行（讀檔 0）
