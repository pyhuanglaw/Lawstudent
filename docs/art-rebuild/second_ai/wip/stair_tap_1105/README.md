# 兩層樓的店：點樓梯落到樓梯上（STAIR-TAP-TILT-1105，LAWWW2-C 2026-11-05）

- 來源：照 BB-C TAPSCAN（06:4x）的清單掃我做的區域時找到的，是真的 bug。
- 影響的區域：山嵐書店 `xs_shanlan`、大口漢堡 `xs_dakou`、新生運動廣場 `xs_xsports`、木曜日 `wz_mokuyobi`。四個都在開發分支上，v9.10.20 線上已有的是木曜日、山嵐。
- 問題：四間的樓梯都有一片看不到的可點面（點在樓梯上＝走到那裡），但斜的方向寫反了。
  - 程式是 `rotation.x = −π/2 − atan2(ya − yb, z1 − z0)`。`addSurf` 的 ya 在 z0、yb 在 z1，應該寫 `yb − ya`。
  - 結果只有中間那一階點得準。從一樓樓梯口前面點樓梯下段（25%）、上段（75%），落點分別偏 3.3～4.9 m、2.3～3.1 m。
  - 手機玩家要上樓，只能點樓梯中間，或點二樓地板。
- 改法：四個檔各改一個字（`ya−yb` → `yb−ya`），加註解。宿舍、社科圖二樓、南洋的寫法本來就對，沒動。

## 測試（Node，不用瀏覽器）

`node tests/stair_tap_unit.js`：ALL PASS

| | 檢查（每一間） |
|---|---|
| ① | 樓梯有可點面、第 0 層 |
| ② | 樓梯每一格（兩層都掃）從正上方往下打：高度和導航格差 ≤ 0.12 m |
| ③ | 從一樓樓梯口前的跟隨鏡頭點樓梯 25／50／75%：落點水平差 ≤ 0.4 m（實際 0.01～0.02 m） |

- 修改前（開發分支 `d64b75c20`）：四間的 ② ③ 都 FAIL，共 8 項。② 不合格 510～892 格。
- 一起跑、ALL PASS：`shanlan_unit`、`dakou_unit`、`xsports_unit`、`xsshop_unit`、`mokuyobi_unit`、`mokuyobi_aa618_unit`、`xinsheng_unit`、`seat_reach_unit`、`nav_buildings_unit`、`nanyang_tap_unit`、`gym_arena_tap_unit`、`tongxian_unit`、`teahouse_tap_unit`。
- 瀏覽器沒跑（D131）。

## 接法（LAWWW-C）

`git apply docs/art-rebuild/second_ai/wip/stair_tap_1105/stair_tap_1105.patch`：四個 `src/*3d.js` 各 1 行，加新測試 `tests/stair_tap_unit.js`。

- 和 `../teahouse_tap_1105/` 互不相干，順序不拘。兩個都在 `d64b75c20` 上 `--check` 通過。

## 全遊戲掃一次（BB-C 清單的其他區域）

方法：每一區、每一層，高度和那一層 y0 差 0.15 m 以上、站得住的格子，從上面 0.5 m 往下打 `walkMeshes`。

- **掃之前要先 `z.group.updateMatrixWorld(true)`**：沒有更新，看不到的可點面都在原點、沒轉，幾乎全部打不到。
  - 這很可能是 BB-C 清單裡大部分「沒接住」的原因。遊戲裡每一幀畫面都會更新，所以沒有這個問題。
- 更新以後，打不到的只剩一盞（已經在 `../teahouse_tap_1105/` 補了）。
- 高度不對的：
  - 我這四間的樓梯：上面已修。
  - 階梯教室 `classroom` 29 格、`gongtong` 14 格、`boya` 45 格：每一排階梯的邊上，差 0.2～0.3 m。落點偏不到 0.5 m，照 D141 不擋，沒改。
- 其他都接得住：`campus`（兩層）、`linze`、`wancai`、`library_hall`、`dorm_hall`、`lawlib`、`soclib_2f`、`putong`、`gym_arena`、`xs_nanyang_hall`。
