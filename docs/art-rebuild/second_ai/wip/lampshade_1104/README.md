# LAMPSHADE-FLIP-1104：lampshade_flip_unit FAIL 的原因和修法（LAWWW2-C，2026-11-04）

狀態：交給 LAWWW-C 整合。LAWWW-C 14:14 要的「是模型的問題還是測試過時」在發布前的結論：**兩個都有**。

## 原因
1. **測試過時（看到的「0 個三角形」）**
   - 1d64f3511（11-04 08:27，lane_east 第一次減面）把店內網格拆成一間店一個，節點名稱從 `wz_in_shop` 變成 `sk_in_<棟號>`（材質還是 `wz_in_shop`）。
   - 測試找的是 `/^wz_in_shop$/` 節點，現在一個都沒有，所以三角形數是 0 → FAIL。
2. **模型也有錯（真的裡外相反，跟節點改名無關）**
   - WZ-SECOND-1104 v2（11-04 早上）新加了兩盞店內吊燈：帝大紅茶（B5）、夏日冰菓室（B5i）。`wz2_windows.py` 第 319、362 行的車床輪廓是由上往下畫的，車出來的燈罩體積是負的＝裡外相反。
   - 用 1d64f3511 以前的 GLB（節點還叫 `wz_in_shop`）跑舊測試，也是 FAIL：`wz_in_shop @(19.49,2.43,-9.50)；wz_in_shop @(24.92,2.40,-8.88)`。
   - 10-31 修過的 3 盞照舊是對的。
   - lane_east 第二次減面（6a9aecee3）刪背面那一步，把冰菓室那盞錯的燈罩朝街那一面刪掉了 2 個三角形；重建以後刪的是真正背對街道的那 2 個。

## 改了什麼
- `tools/blender/env_second/wz2_windows.py`：兩盞吊燈的輪廓反過來，從內面的軸心往外、沿著外面往上畫（`lib2.lathe` 由下往上畫＝面朝外）。
- `assets/models/env/second_ai/wenzhou_street.glb`、`.json`：重新匯出。
  - 三角形 123,737 → 123,731。吊燈本身的三角形數沒變。差的 6 個是重匯時「刪底面」那一步本來就會差幾個（`cafe_vc_wz_matte` 第 2、3 段 −8／+2）。
  - 節點 173 個，名稱一樣；`props.json`（導航用的雜物腳印）一模一樣。
- `tools/blender/env_second/wz_window_view.py`：多一個可選的 `--lens`（鏡頭焦距，預設照舊 18 mm），拍近照用的。
- 測試（開發分支 e90636eb6 上都能 `git apply`）：
  - `lampshade_flip_unit_e90636eb6.patch`：溫州街那一項改成「`sk_in_*`／`wz_in_*` 節點裡、材質是 `wz_in_shop` 的那幾份」，名稱寫 5 盞。
  - `singleside_streets_unit_e90636eb6.patch`：溫州街三角形數 123,737 → 123,731，註解補一句這次的原因。

## 測試
- lampshade_flip_unit（新版）：
  - 重建的 GLB：ALL PASS（溫州街店內 39,947 個三角形，沒有裡外相反的零件）。
  - 修改前的 GLB：FAIL 1（`sk_in_B5 @(19.49,2.43,-9.50)`）＝測試抓得到這個錯。
  - 帝大紅茶那盞燈罩 60 個三角形：法線朝上／朝下從 10／50 變成 50／10。
- singleside_streets_unit（新版）：重建的 GLB ALL PASS；修改前的 GLB 在三角形數那一項 FAIL（123,737）。
- street_props_nav_unit（開發分支 e90636eb6 的 src＋重建的 GLB）：ALL PASS。
- 畫面：Blender 晚上從騎樓看帝大紅茶、冰菓室（鏡頭 (22.4,1.55,−3.2) → (22.4,2.35,−9.0)，24 mm），修改前和修改後差大於 24 的像素是 0。
  - 兩盞燈在店面開口上緣的牆後面，晚上冰菓室的鐵捲門也拉下來，從騎樓本來就看不到。
  - 所以這次修的是測試抓到的模型錯誤，玩家看得到的畫面沒有變。

## 沒測的
- 瀏覽器（D131）：wz_street_integration 的三個鏡頭。三角形少 6 個，draw call 不變；要量的話請 BB 排 CC。
