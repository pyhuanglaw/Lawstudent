# 南洋戲院大廳：長椅坐得下（NANYANG-BENCH-SIT-1105，LAWWW2-C 2026-11-05）

- 來源：BB-C 06:45（BB_255）。電腦上點 #2 (3.75, −3.8)、#3 (3.75, −2.4) 兩個位子都沒有「坐下等開演」，擋玩。
- 原因：
  - 長椅的阻擋到 x 3.4，人站得到的最近點離座位 0.65～0.8 m。
  - `GM.seatApproach`（game3d.js）的候選點只有「正前方 0.8 m」那一點站得住，剛好落在按鈕範圍 0.8（實際取 0.75）外面，所以它退回範圍外的點。
  - 人走過去停在那裡，沒有按鈕。#1 也一樣，只是電腦上剛好停偏一點。
- 改法（BB 的第一個選法）：`src/nanyang3d.js` 長椅的「坐下等開演」範圍 0.8 → 1.0，一行。
  - 從正前方 0.8 m 那一點看，自己這一張 0.8 m、隔壁那張 1.28 m 以上，最近的還是自己。
  - 大廳其他按鈕不在附近。

## 測試（Node，不用瀏覽器）

`node tests/nanyang_bench_unit.js`：ALL PASS

- ① 每一張至少一個 seatApproach 的候選點：站得住、從進門的位置走得到、在範圍內、最近的座位按鈕是這一張。
- ② 站在那一點，`E.nearestInteractable()`（畫面上的按鈕）就是這一張。
- ③ `game3d.js` 的候選點清單和測試的一樣（改了要一起改）。
- 修改前（開發分支 `05ddf1e08`，範圍 0.8）：FAIL 4。三張的 ① 失敗，連帶 ② 沒得測；第 1 張 ① 剛好過。
- 一起跑 ALL PASS：`nanyang_unit`、`nanyang_tap_unit`、`seat_reach_unit`、`xinsheng_unit`。
- 瀏覽器沒跑（D131）。

## 接法

`git apply docs/art-rebuild/second_ai/wip/nanyang_bench_1105/nanyang_bench_1105.patch`（`05ddf1e08` 上做的）：`src/nanyang3d.js` 一行，加新測試。
