# CAM-VIEWPANE-SIDE-1109：放大的窗景卡，鏡頭在店面左右範圍外時藏起來

狀態：`READY_FOR_REVIEW`（已交 LAWWW-B 整合；遊戲內畫面等 CC 拍、BB-B 依 D120 判）。LAWWW2-B，2026-11-09。

## 問題

- **來源**：BB-B 11-09 23:12 的疑點。溫州街阿德影印（`wz_print`）出生點鏡頭轉到 270°，有一大片窗景卡擋住畫面約三分之一。
- **查到的原因**（`cam_teayard_1109` README 第 2 節）：
  - 鏡頭碰撞本身沒問題。
  - `ggViewPanes`（`src/zones3d.js`）把店面原本的視差窗搬到正式模型的玻璃外，並放大到至少 14 m 寬，用來蓋住整面店面。
  - 原本的規則只在「鏡頭跑到前牆外」時藏窗景卡。鏡頭跑到側牆外時，卡片超出店面的那一段就擋在畫面旁邊。
- **選定做法**：LAWWW-B（tasks.json CAM-VIEWPANE-SIDE-1109）和 BB-B（23:16）都選做法 (1)：鏡頭在店面左右範圍外時藏窗景卡，所有用 ggViewPanes 的店一起改。
- **代價**：那幾個角度從側面斜看玻璃，窗外沒有街景，只有天空色。BB-B 判斷玩家不容易注意到。

## 用到 ggViewPanes 的店（Node 實際建出來看的）

| 區域 | 店 | 店寬 | 窗景卡寬 | 出生點轉一圈，鏡頭跑出店面左右範圍的角度 |
|---|---|---|---|---|
| `wz_print` | 溫州街 阿德影印 | 4.4 m | 14.0 m | 45°～135°、225°～315°（開發分支 75°～135°、225°～285° 窗景卡還在） |
| `wz_lin` | 溫州街 林家乾麵 | 6.4 m | 14.0 m | 45°～135°（開發分支 75°～135° 窗景卡還在） |
| `bikeshop` | 公館 慢輪單車 | 10.2 m | 14.0 m | 沒有（店寬，出生點轉一圈鏡頭不會出店面；走到側牆邊再轉才會） |

以下幾間沒有被 ggViewPanes 放大的卡片，所以不受影響：
- 便利商店、溫州街的 brunch、一盞、定食、日常失速：正式模型裡已經有自己的窗景卡（名字有 VIEW），或是沒有視差窗。
- `shopViewPane` 的店（燒臘、大口、新生南路的店）：窗景卡照玻璃大小放，沒有放大。

## 改了什麼（`src/zones3d.js`，3 處）

1. **`vpPart(z,w,side)`**：
   - 多一個參數 `side`。ggViewPanes 呼叫時傳 `true`。
   - 會記下店面左右的範圍。`room()` 以原點為中心、寬 w 深 d，這裡換成世界座標存（一盞那種整組往 +z 移的店也算得對）。
   - 同一片窗景以前在 `z.winParts` 裡有兩筆：attachRoomGLB 搬窗時一筆、這裡一筆，後面那筆會蓋掉前面的。現在只留一筆，行為不變。
2. **`room()` 的 `fadeWalls`**：窗零件的顯示判斷多一個條件，有 `side` 的那一筆在「鏡頭左右位置超出店面範圍」時藏起來。範圍的邊界和側牆一樣在 ±w/2，所以側牆淡出的那一刻窗景卡同時藏。
3. 註解。

`shopViewPane` 不傳 `side`，照舊。其他 `winParts` 的使用者（窗框、窗簾、門牌、Café 的街景）都沒有 `side`，判斷和原本一模一樣。

## 測試

新測試 `tests/viewpane_side_unit.js`：
- 不需要瀏覽器（D131）。在 Node 建出真正的三間店：正式模型載入、ggViewPanes 接好。
- 用區域真正的 `fadeWalls` 和引擎的 `followCam`、`hideFaded` 判斷窗景卡顯示與否。

| 檢查 | 開發分支 2d58e8a52 | 加這個補丁 |
|---|---|---|
| ① 鏡頭在左、右側牆外 1 m：窗景卡藏 | FAIL ×3（三間左右都看得到） | PASS |
| ② 鏡頭在店裡（正中、靠左右側牆 0.3 m）：窗景卡看得到 | PASS | PASS |
| ③ 鏡頭在前牆外 2 m：窗景卡藏（原本的規則） | PASS | PASS |
| ④ 出生點轉一圈（每 15°、camDist）：範圍外都藏、店裡朝前窗（150°～210°）都看得到 | FAIL ×2（阿德、林家） | PASS |
| 合計 | **FAILED 5** | **ALL PASS** |

LAWWW-B 要求的「鏡頭在左右範圍外時藏、回到範圍內出現」由 ①②④ 涵蓋。

回歸：`tests.txt` 列的 76 支 Node 測試（碰到 winParts、窗景卡、fadeWalls、溫州街店家、慢輪單車的），加這個補丁 **76 支 0 失敗**（`regression_new.txt`）。

## 檔案（sha256 前 16 碼）

| 檔案 | 開發分支 2d58e8a52 | 改後 |
|---|---|---|
| `src/zones3d.js` | cd5b538a8de6e34a | f667cd555ae5ef99 |
| `tests/viewpane_side_unit.js`（新） | — | bc2c1ba0292a8de8 |
| `cam_viewpane_side_1109.patch` | — | e03e7be7f0a61371 |

```bash
git apply --check docs/art-rebuild/second_ai/wip/cam_viewpane_side_1109/cam_viewpane_side_1109.patch   # 對 2d58e8a52 通過
git apply docs/art-rebuild/second_ai/wip/cam_viewpane_side_1109/cam_viewpane_side_1109.patch
node tests/viewpane_side_unit.js
```

## 遊戲內要拍的（CC，BB-B 依 D120 判）

BB-B 23:16 指定的，每一張都要新舊對照：
1. 阿德影印（溫州街 → 進阿德影印，出生點不動）：鏡頭轉到 270°，再補一張 90°。
2. 公館慢輪單車：先走到側牆邊（例如 x ≈ ±4.5、z ≈ 2），再把鏡頭轉到側牆外拍一張。另外在店裡斜看前窗拍一張（例如出生點 150°、210°），確認店裡看窗外的景照舊。
3. 有空的話補林家乾麵出生點 90°。

## 還沒做的

- 遊戲內截圖還沒拍（雲端沒有瀏覽器，D131）。
- 手機實機沒測。

## 補充（11-09 23:5x）：測試的俯角修正（只改測試）

- **整合**：LAWWW-B 已把 v1 整合進開發分支（b8cffd669）。
- **錯在哪**：v1 測試 ④ 的跟隨鏡頭用了俯角 0.22（戶外）。引擎在室內區域的預設是 **0.38**（`engine3d.js`：`cam.pitch=E.indoor?0.38:0.22`），三間店都是室內區域。茶屋第二輪也是同一個錯。
- **改法**：`viewpane_test_pitch_1109.patch` 只改 `tests/viewpane_side_unit.js`。④ 改用引擎的預設俯角，再加上玩家往下拖的 0.6，兩種都轉一圈。程式碼不變。
- **結果**：開發分支原樣 FAILED 5 → 改後 ALL PASS（`test_pitch_dev.txt`、`test_pitch_new.txt`）。改用正確的俯角後，範圍外的角度仍然全部藏好。
- **檢查**：對開發分支 8fd90fc6a 執行 `git apply --check` 通過。

| 檔案 | 開發分支 8fd90fc6a | 改後 |
|---|---|---|
| `tests/viewpane_side_unit.js` | bc2c1ba0292a8de8 | 2047ae975ae7ad5b |
| `viewpane_test_pitch_1109.patch` | — | 6410cd2c90b8206f |
