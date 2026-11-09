# CAM-TEAYARD-1109：一盞前院的跟隨鏡頭轉進牆裡（LAWWW2-B 2026-11-09；BB-B 23:06 疑點 3，D108 場景鏡頭）

狀態：`READY_FOR_REVIEW`（新測試開發 FAILED 2 → ALL PASS；回歸 87／0；遊戲內等 CC 照 180°、270° 重拍、BB-B 判）。

## 問題
- BB-B（cc-testing `85fb294d6a`，`CC/logs/WALLFADE_W1P_cloud_1109/wf_mont_wz_teahouse.png` 第 3、4 格）：茶屋 `wz_teahouse` 從出生點 (−3, 9) 把跟隨鏡頭轉到 180°、270°，整個畫面只剩牆面貼圖。
- BB-B 問：是 CC 探針直接放鏡頭，還是玩家正常轉也會？
- **正常轉也會**。Node 用引擎真正的 `followCam`（鏡頭碰撞）＋區域的 `fadeWalls`＋`hideFaded` 算，預設距離 6.0（探針用的 4.5 也一樣）：

| 方向 | 鏡頭 | 鏡頭碰撞 | 擋在鏡頭和頭中間的 |
|---|---|---|---|
| 180° | (−3.0, 2.5, 3.1)，在屋裡 | 沒拉近（6.0） | `WALL_engawa_yzn_wall`（緣側灰泥牆），離鏡頭 1.85 m |
| 270° | (−8.9, 2.5, 9.0)，在西邊鄰居 | 沒拉近 | `wzy_apt`（前院模型的鄰居房子），離鏡頭 1.5 m |

- 原因：
  - 這一區的鏡頭碰撞（`z.camCols`）只有屋裡兩道隔間牆（`WZ_SHOPS_LAYOUT.teahouse.camWalls`），前院的邊界都沒有。
  - 玩家在前院時，`teaYard` 的 fadeWalls 把緣側的牆強制設成不淡出（從前院看房子要看得到），所以鏡頭退到屋裡就被它擋住。

## 做法（`cam_teayard_1109.patch`，對開發 `12afed84e`；`src/zones3d.js` +6 行、`tests/teahouse_yard_cam_unit.js` 新）
- `teaYard`：
  - 前院模型載入時，收 `wzy_apt`、`wzy_apt2`、`wzy_plaster`（鄰居房子、前院兩側灰泥牆）到 `z.yardCams`。
  - fadeWalls 裡：玩家在前院時，`z.camCols = [原本的隔間牆＋yardCams＋緣側的牆（WALL_engawa_*）]`；回到屋裡換回原本的隔間牆。只在狀態變的時候換。
- 用的是引擎現成的「隔間牆」鏡頭碰撞（教學館、美國公寓、宿舍同一套）：擋到就拉近、拉得太近就抬高、`autoSwing` 轉向空的那一邊。
- 不動模型；不動屋裡的鏡頭（進屋以後和原本一樣）。

## 測試 `tests/teahouse_yard_cam_unit.js`（新）
- Node 建出真正的 wz_teahouse（正式模型 `wz_teahouse_interior.glb`＋`wz_teahouse_yard.glb`），用引擎真正的 followCam＋fadeWalls＋hideFaded：
  - ① 出生點（前院）轉四個方向，距離 6.0、4.5：鏡頭和頭之間沒有看得到的網格。
  - ② 畫面裡（橫 ±35°、直 ±22°）最近的看得到的網格 ≥ 0.3 m。
  - ③ 走進屋裡：鏡頭碰撞回到原本的兩道隔間牆。
- 開發原樣（`test_dev.txt`）：**FAILED 2**（① 180° 緣側的牆、270° 鄰居房子；② 180° 時柱子 yzn_post 0.26 m）。
- 加 patch（`test_new.txt`）：**ALL PASS**。
  - 180° 拉近到 3.68 m（6.0）／3.73 m（4.5）；270° 拉近到 2.13／2.14 m。
  - 畫面裡最近的網格：180° 是屋簷木頭 0.62 m（畫面上緣會看到一點屋簷），270° 是石台 0.92 m。
- 回歸：工作樹＝開發 `12afed84e`＋這個 patch，提到 teahouse／yizhan／teaYard／camCols／followCam／fadeWalls／autoSwing 的 86 支＋新的這支（`tests.txt`）：**87／0 全過**。

## sha256（前 16 碼：開發 `12afed84e` → 新）
| 檔案 | 開發 | 新 |
|---|---|---|
| `src/zones3d.js` | `577c8217dc0c4263` | `cd5b538a8de6e34a` |
| `tests/teahouse_yard_cam_unit.js`（新） | — | `c63d09d36ae0eba9` |
| patch `cam_teayard_1109.patch` | | `0b748de7a40e62e0`（`git apply --check` 對 `12afed84e` OK） |

## 同一則訊息的第二處：印刷店（wz_print，模型 `bb_support/ade.glb`）270°——不是同一類
- Node 同一套算法：四個方向鏡頭和頭之間都沒有東西擋（鏡頭碰撞沒問題），左牆在 270° 有照常淡出、藏起來。
- 270° 畫面右邊約三分之一（21×13 格裡 88 格）是 `VIEWPANE_wz_print`，離鏡頭 2.7 m：
  - 那是店門外的窗景卡（`ggViewPanes`，WINVIEW-AUDIT-1105）。為了在店裡斜著看窗外也有街景，卡片放大到至少 14 m（這間 18.9 m，x −9.45～9.45），掛在前牆外 z 5.2。
  - 鏡頭轉到 270° 退到左牆外（x −5.9），前牆在這個角度不淡出，窗景卡跟著前牆顯示；超出店面寬度的那一段就在鏡頭右邊，看起來像一大塊牆。
- 用 `ggViewPanes` 的店（公館、溫州街正式模型的店）鏡頭轉到側牆外都可能這樣。改法要選（還沒做，等 BB-B／LAWWW-B）：
  1. 鏡頭在店面左右範圍外時把窗景卡藏起來（`winParts` 多一個左右的判斷）：那個角度從側面看進窗戶，看到的是窗外的天空色，沒有街景。
  2. 窗景卡左右裁到店面寬度（要開 clipping plane，或依鏡頭位置每幀調卡片寬度）：側面看進窗戶還有街景，但改得比較多。
