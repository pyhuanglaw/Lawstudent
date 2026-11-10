# CAMPUS-FLOOR-STRIP-1110：校園步道上浮起來的斜長條（路緣橫過別條步道）

狀態：`READY_FOR_REVIEW`
- 補丁和測試都做完、測過，交班時存在這裡，**還沒正式通知 LAWWW-B 整合**。
- 遊戲內畫面還沒拍：要 CC 拍，BB 判。
- LAWWW2-B，2026-11-10。

## 問題

- 使用者試玩截圖：`docs/handoff/user_shots/1110_campus_floor_strip.webp`（開發分支 443fb4a0b）。
- 使用者原話：「路上有奇怪的地磚? 畫面中間 人物左前方」。
- 存檔：`tests/fixtures/user_save_day51b_1110.json`。晚上 18:25，騎腳踏車在 (29.88, −54.4)，yaw 0.82。

## 原因

- `src/zones3d.js` 的 `curb()` 照整條路放路緣（0.25 × 0.14 m 的石條，#d9d3c6），碰到別條步道不會斷開。
- 截圖那一帶：x 30 南北向、z −60 東西向兩條 10 m 步道交成 T 字路口。
  - 東西向的兩條路緣從 x 30 開始，也就是從南北向步道的正中間開始，各有 5 m 壓在南北向的石磚上。
  - 南北向東側的路緣橫過東西向的路口，約 8.8 m。
- 全校園還有同樣的地方，共 7 段、約 56 m：
  - 椰林大道兩側的路緣橫過四個步道口：x 30、x −12、文學院前、x 20。
  - z 47 那條路兩側的路緣橫過 x 20 的步道。
  - 東西向步道南側橫過兩條往南的小步道。

## 改法（只改 `src/zones3d.js`）

1. `strip()` 記下每條步道的中心、方向、寬、長（`box.o`），原本的圖層判斷不動。
2. `curb()` 先只記下來。
3. 新的 `flushCurbs(g)` 在 `campus.build` 最後、整個校園的步道都鋪好以後才放路緣。
   - 每 5 cm 檢查一次：路緣的整個寬度（中線、左右 ±11 cm）都在別條步道外面才放；短於 0.3 m 的碎段不放。
   - 剩下的路緣合成一個網格，draw call 從 10 個變 1 個。
   - 材質、高度、位置和原本一樣，導航不變（路緣本來就沒有擋導航）。

## 測試

新測試 `tests/campus_curb_gap_unit.js`：
- 不需要瀏覽器（D131）。
- 不管路緣是很多個網格還是合成一個，都直接取路緣頂面的三角形來量。

| 檢查 | 開發分支 a883f36de | 加這個補丁 |
|---|---|---|
| 1. 截圖那一帶（x 22～40、z −70～−45）路緣不在步道上 | **FAIL**（4.64 m²，例如 (35.2,−55.4)） | PASS（0.00） |
| 2. 整個校園路緣不橫在步道上 | **FAIL**（13.96 m²，約 56 m 長） | PASS（0.00） |
| 3. 不是路口的地方路緣還在（9 個點） | PASS | PASS |
| 合計 | FAILED 2 | ALL PASS |

回歸：`tests.txt` 列的 38 支 Node 測試（所有建校園的、導航的、舟山路路燈），加這個補丁 **38 支全部 ALL PASS**（`regression_new.txt`）。

## 檔案（sha256 前 16 碼）

| 檔案 | 開發分支 a883f36de | 改後 |
|---|---|---|
| `src/zones3d.js` | 3ee81197aaef6e65 | e8dc00ca80c1a827 |
| `tests/campus_curb_gap_unit.js`（新） | — | c270f02643b63adb |
| `campus_curb_gap_1110.patch` | — | 831a7d6a9fc7f3e6 |

```bash
git apply --check docs/art-rebuild/second_ai/wip/campus_curb_gap_1110/campus_curb_gap_1110.patch   # 對 a883f36de 通過
git apply docs/art-rebuild/second_ai/wip/campus_curb_gap_1110/campus_curb_gap_1110.patch
node tests/campus_curb_gap_unit.js
```

## 還沒做的

- 遊戲內截圖：雲端沒有瀏覽器（D131）。請 CC 用使用者的存檔，在同一個位置、同一個角度拍改前改後，BB 判。
- 手機實機沒測。
