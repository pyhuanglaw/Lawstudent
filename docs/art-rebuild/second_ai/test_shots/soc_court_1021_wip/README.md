# SOC-COURT-1021 社科院中庭：夜間光＋院系公告欄（**WIP，沒有交**；交班時停在這裡，2026-10-21 14:5x）

- 起因：巡場景第 1 區校園（`../../ART_DIRECTOR_PATROL.md` 第 1 節）：晚上中庭和柱廊一片黑；白天朝中庭的圖書館牆只有一塊招牌。
- **腳本已改（`tools/blender/env_second/campus_socsci.py` 第 ④ 段），GLB 沒換**：repo 裡的 `campus_socsci.glb`／`.json` 還是已交件的柱子版（`8e8d130e`）。要看新版就重跑腳本：
  `/opt/blenv/bin/python tools/blender/env_second/campus_socsci.py`（會重寫 GLB、json、`textures/gen/soc_wash.png`、`soc_posters.png`）。
- 加了什麼（都不動導航；json 的導航、鏡頭碰撞、門和柱子版完全一樣）：
  - 柱廊 10 盞嵌燈、圖書館門口雨遮 2 盞底下的地面光圈；
  - 圖書館朝中庭那面牆：牆腳 6 盞洗牆地燈＋牆面由下往上淡出的暖光；
  - 院系公告欄（鋁框＋軟木板＋虛構的活動海報；D77：沒有真實的社團、廠商名稱，沒有電話；日期不寫星期幾）。
  - 光用 `ck_bell_wash` 材質（傅鐘的柱面暖光同一套：遊戲改成加法混合、晚上 0.75、白天 0）。
  - 數字（交班前最後一次匯出）：三角形 14,014 → 14,144、材質 13 → 15、998 KB → 1,055 KB。
- 遊戲端一行 patch：`../../patches/soc_court_wire_wip.diff`（`zones3d.js` 的 `ck_bell_wash` 加 `mt.fog=false`：加法材質吃霧會在遠處多出一塊塊亮斑；傅鐘一起受惠）。套在開發分支 `96af1e54`。
- 截圖（Playwright 手機模擬，不是 iPhone；上：開發分支，下：這版；交班前一版，洗牆光還離牆 12 mm）：
  - 白天：`day_before_after.webp`（光圈、洗牆光白天看不到，沒有多出影子；看得到公告欄）
  - 晚上 20:00：`night_before_after.webp`（牆面一道道洗牆光、柱廊地上有光圈）

## 還沒做完（下一班從這裡接）
1. **洗牆光和牆上的招牌同一個平面**（都離牆 12 mm）→ 腳本已改成 3 cm（`zw = LZ1 + 0.03`），**還沒重新匯出、還沒跑疊面檢查**。
2. 原本就有的疊面：圖書館門洞兩側，清水混凝土門框側面和室內白牆轉角（`soc_misc` 的 `for s_ in (dx0, dx1)` 那一行）重複，0.23＋0.105 m² × 2。打算拿掉白牆那兩片（門框側面已經蓋住）；**還沒改**。
3. 重新匯出 → `check_coplanar.py` 只剩光圈互相重疊（加法、不寫深度，不會閃）→ `socsci_place_unit.js`、`nav_soclib_unit.js` → 同角度前後截圖 → 交 LAWWW-C（換 GLB＋json＋這個 patch）。
4. 可選：中庭東端的樹穴（「可以在中間種樹」）現在沒有樹；種樹要 `zones3d.js` 加一棵 `TK.tree`（世界座標約 (−10.8, −66.4)），LAWWW-C 決定。
