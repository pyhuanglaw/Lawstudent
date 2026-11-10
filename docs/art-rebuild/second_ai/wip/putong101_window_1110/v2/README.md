# PUTONG101-WINDOW-1102 第 2 版（WIP：等 LAWWW 決定）— LAWWW2 帳號 A，2026-11-10

狀態：`WORK_IN_PROGRESS`，**不要整合**。

## 背景
BB 11-10 回報 PARTIAL：第 1 版把帷幕的頂點色調亮了，可是遊戲裡白天的 RGB 只從 [35,31,22] 變成 [42,38,28]，肉眼看還是黑洞。原因是玻璃退在樓板下面，照不到光。

## 做法
玻璃外 5 mm 加一片「反射天空」by_skyref（材質 `ck_glass_skyref`），由 zones3d 的 attachWenzhouModel 設定：
- 加法混合、底色黑、自發光 #4f5f73；
- 白天亮度 1、晚上 0.001。

## 檔案
- `tools/blender/env_second/campus_teach.py`、`assets/models/env/second_ai/campus_boya.glb`/`.json`：已改，在分支上。
- `zones3d_wip.patch`：zones3d 的修改。
- `putong101_window_unit.js`：測試，第 3、4 項是新加的。

## 測試
- putong101_window：ALL PASS（開發分支 6e00d9103 上第 3、4 項 FAIL）。
- 其他回歸 24 支全過，見 `regression.log`。
- **teach_east_drawcall ②博雅 FAIL**：主畫面網格 5，上限是 4。多的一個就是這一片四邊形。

## 待決定（已問 LAWWW）
- (A) LAWWW 放寬預算；
- (B) 改成 patch ck_glass shader，用頂點標記，不多一個網格。
