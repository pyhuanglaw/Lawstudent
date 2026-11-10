# GYM-FIT-PROPS-1103 第二包：器材會動的零件 — LAWWW2 帳號 A，2026-11-10

狀態：`MODEL_READY`，交 LAWWW 整合。遊戲截圖請 CC 在 PC 拍（D131）。

## 玩家會看到的差別
- 以前（第一包之後）：
  - 飛輪：人在踩，曲柄、踏板不動，腳在踏板旁邊的空中畫圓。
  - 划船機：人前後滑，座椅不動，坐在空中。
- 現在：
  - 飛輪：曲柄跟著腳轉，踏板跟著曲柄末端走、保持水平，腳踝一直在踏板上（測試量的誤差 1.0／2.3 cm）。
  - 划船機：座椅、滑車跟著臀部前後滑（34～37 cm），臀部一直在座椅上。手上有拉把時（第一包），掛在前面的那支藏起來；人起來就回來。
  - 沒人用的器材：零件停在原本的位置，或停在最後一次的角度，和原本模型一樣。

## 做法（不用 Blender、不重烘）
- `tools/blender/env_second/gym_moving_parts.py`（純 Python＋numpy）：
  - 從 gym_b1.glb 的器材原型網格（GPU instancing：gymb1_gym_bike_*、gymb1_gym_rower_*）找出曲柄、踏板、座椅＋滑車、拉把的三角形，共 540 個。範圍照 BB-B 的 gym_b1_props.py 的 bike()、rower()。
  - 在 gym_b1.glb 裡把這些三角形改成退化三角形：緩衝區大小不變、不用重烘。器材本來就是 --nolm。
  - 同樣的三角形（位置、法線、頂點色）寫成 `assets/models/env/second_ai/gym_moving_parts.glb`（29 KB），有五個零件，原點設在轉軸或末端。
  - gym_b1.glb 的 `asset.extras.gymMovingStripped` 會記下拆了幾個三角形；重複跑會拒絕。
  - `bake_gym.sh b1` 最後會自動跑這支（以後重烘 B1 不會忘）。
- `src/gym3d.js` 的 `gymMoving`／`gymMovingStep`：
  - 照配置 `fitness.equip`，每台飛輪（4）、划船機（2）各放一份零件。
  - 材質換成 gym_b1.glb 同名的那一個（gymb1_metal、gymb1_vc），看起來和原本一樣。
  - 每一格（接在 `z.update`）：
    - 找使用者：人物原點在器材原點 0.3 m 內、pose 是 gym_bike／gym_row。
    - 飛輪：曲柄角度＝gymIK 的 `g.ph`，和 C.GYM.bike 的 axle、crank 同一組數字。VRM 以外的人物沒有 g.ph，照 C.GYM.bike.T 自己轉。
    - 划船機：座椅中心＝臀部骨頭在器材座標的 z 往後 3 cm，限制在滑軌上。
  - 人起來、走了、換動作，當格就放開。
- `src/assets3d.js`：`'prop.gym_moving'`（lazy）。

## 測試
新測試 `tests/gym_moving_parts_unit.js`，不需要瀏覽器。路人 VRM 用 npc_nm1、npc_nf1，跑真的 CHAR.animate＋gymIK：
1. gym_b1.glb 裡沒有會動零件的三角形，其他照舊。
2. 零件 GLB 有五個零件，三角形數＝拿掉的 540。
3. 遊戲每台器材一份零件，材質是 gym_b1 同名的那一個，沒人用時在原位。
4. 飛輪：曲柄跟著轉；腳踝在踏板該踩的點 ≤ 4 cm。實測 1.0 cm、2.3 cm。
5. 划船機：座椅滑 ≥ 25 cm、在臀部底下；拉把有藏、有回來。

- **開發分支 0ec32e6f6：FAILED 3**（1、2、3 失敗，沒有零件就停）；套上 patch：**ALL PASS**。
- 健身房相關回歸 37 支（含新測試，沒有截斷）全過，見 `regression.log`。重新產生 GLB 以後，又跑了 gym_moving_parts、singleside_gym、gym_b1_lm、gym_b1_fitness，都過。
- 沒測：瀏覽器畫面、手機效能。多 6 組零件，每組 2～3 個網格，共 18 個 draw call，只在 B1 健身中心。

## 整合
`git apply --binary gym_fit_props2_1110.patch`，以開發分支 0ec32e6f6 為底。內容：
- 新增 gym_moving_parts.glb／.json、工具、測試；
- gym_b1.glb 改了（只動索引）；
- src/gym3d.js、src/assets3d.js、bake_gym.sh。
