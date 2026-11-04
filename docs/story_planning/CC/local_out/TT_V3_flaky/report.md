# TT_V3_flaky：FLAKY（FLAKY/首次失敗、重跑通過）

- SHA d2e36f6eb，腳本 docs/story_planning/test_tools/cc/selftest/st_flaky.py（blob 5ff0a95d314e07cd849ba7ad98597b8b0e076a1a / 5ff0a95d314e07cd849ba7ad98597b8b0e076a1a）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 第一次 exit 1，重跑 exit 0；兩次的遊戲 SHA、腳本 blob、輸入雜湊都相同（見 conditions）

## 每一次
- 第 1 次：exit 1 ，16 秒，FAIL 1 行
  - `FAIL 第一次（故意 FAIL）  記號檔不存在＝第一次`
- 第 2 次：exit 0 ，26 秒，FAIL 0 行

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
- 截圖 `attempt1/out/flaky.png`
- 截圖 `attempt2/out/flaky.png`

- 捷徑：turbo=False，[前置／捷徑] 2 行（讀檔 0）
