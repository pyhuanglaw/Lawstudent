# GG_int_cvs_menu_tt：FAIL（UNKNOWN/assert）

- SHA 809163ee4，腳本 docs/story_planning/test_tools/cc/cc_gg_int_probe.py（blob 048182a3ec93f0bb02417f6b4cf9a5841478adb9 / 048182a3ec93f0bb02417f6b4cf9a5841478adb9）
- 兩次條件相同：True 
- 重跑範圍：所有 CASE（cvs_menu）都有 FAIL：整支重跑

## 判斷依據
- 探針斷言 FAIL 2 行（[cvs_pasta] 走到旁邊：互動按鈕是「結帳…」），兩次一致；沒有 JS 例外、沒有 traceback、沒有環境訊號——要看預期／實際判斷是遊戲還是探針

## 每一次
- 第 1 次：exit 1 ，1458 秒，FAIL 2 行
  - `FAIL [cvs_pasta] 走到旁邊：互動按鈕是「結帳…」  {"x": -0.2, "z": -4.1, "interact": ""}`
  - `FAIL [cvs_cool_day] 走到旁邊：互動按鈕是「看冷藏櫃…」  {"x": -0.2, "z": -4.38, "interact": ""}`
- 第 2 次：exit 1 ，1604 秒，FAIL 2 行
  - `FAIL [cvs_pasta] 走到旁邊：互動按鈕是「結帳…」  {"x": -0.2, "z": -4.1, "interact": ""}`
  - `FAIL [cvs_cool_day] 走到旁邊：互動按鈕是「看冷藏櫃…」  {"x": -0.2, "z": -4.38, "interact": ""}`

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
- ```{"href": "http://127.0.0.1:8810/index.html", "zone": "cvs", "day": 7, "hour": 3.242929999999967, "weekday": 2, "date": null, "player": {"x": 1.38, "z": 4.78, "y": 0, "lv": 0, "pose": "idle", "busy": false}, "dlg": {"active": false, "busyDepth": 0}, "dlgText": null, "choices": [], "event": null, "flagKeys": ["introDone", "campusIntro", "readCase", "classDone", "afternoonDone", "metAn", "zheNoodleDone", "BIKE_TIP", "BIKE_PARK_TIP", "dating_kexin", "KX_DEC3_MIGRATED", "LIFELINE_V", "ROMANCE_HISTORY", "CLEANUP_DONE", "romance", "knowsRel_V", "knowsRel", "ytKnows", "YT_CONFESSED", "YT_PROMISED", "Y```

## 檔案
- trace `attempt2/trace/trace_GG_int_cvs_menu_tt_1.zip`（629474805 bytes，超過上限不推）
- 截圖 `attempt1/out/NOBTN_cvs_cool_day.png`
- 截圖 `attempt1/out/NOBTN_cvs_pasta.png`
- 截圖 `attempt2/out/NOBTN_cvs_cool_day.png`
- 截圖 `attempt2/out/NOBTN_cvs_pasta.png`

- 捷徑：turbo=False，[前置／捷徑] 8 行（讀檔 8）
