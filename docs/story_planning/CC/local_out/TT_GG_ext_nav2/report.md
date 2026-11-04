# TT_GG_ext_nav2：FAIL（UNKNOWN/assert）

- SHA 23eaaa7ae，腳本 tests/gongguan_layout_nav.py（blob c89397c4655185d1931837b0c82ee6aef60ceaa3 / c89397c4655185d1931837b0c82ee6aef60ceaa3）
- 兩次條件相同：True 
- 重跑範圍：探針不支援 CASES 環境變數：整支重跑

## 判斷依據
- 探針斷言 FAIL 1 行（頁間書屋門口（-36.4, 21）站得住且走得到），兩次的 FAIL 行不同或只跑一次；沒有 JS 例外、沒有 traceback、沒有環境訊號——要看預期／實際判斷是遊戲還是探針

## 每一次
- 第 1 次：exit 1 ，104 秒，FAIL 2 行
  - `FAIL 頁間書屋門口（-36.4, 21）站得住且走得到  {"stand": false, "ok": true, "len": 5, "end": [-36.4, 21]}`
  - `FAIL 離開麵店回到公館：站在麵店前、站得住、走得到  {"zone": "noodle", "x": 0, "z": 3.9, "stand": false, "reach": false}`
- 第 2 次：exit 1 ，89 秒，FAIL 1 行
  - `FAIL 頁間書屋門口（-36.4, 21）站得住且走得到  {"stand": false, "ok": true, "len": 5, "end": [-36.4, 21]}`

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
- ```{"href": "http://127.0.0.1:8802/index.html?turbo", "zone": "gongguan", "day": 8, "hour": 11.036222000000011, "weekday": 3, "date": null, "player": {"x": -71, "z": 16.5, "y": 0, "lv": 0, "pose": "idle", "busy": false}, "dlg": {"active": false, "busyDepth": 0}, "dlgText": null, "choices": [], "event": null, "flagKeys": ["introDone", "campusIntro", "classDone", "metAn", "met_an", "afternoonDone", "lawclub", "wenzhouLine", "dating_kexin", "KX_DEC3_MIGRATED", "LIFELINE_V", "ROMANCE_HISTORY", "CLEANUP_DONE", "romance", "knowsRel_V", "knowsRel", "ytKnows", "YT_CONFESSED", "YT_PROMISED", "YT_BROKE_PRO```

## 檔案
- trace `attempt2/trace/trace_TT_GG_ext_nav2_1_c001_FAIL.zip`（12499653 bytes）
- trace `attempt2/trace/trace_TT_GG_ext_nav2_1_c002.zip`（2998014 bytes）

- 捷徑：turbo=False，[前置／捷徑] 0 行（讀檔 0）
