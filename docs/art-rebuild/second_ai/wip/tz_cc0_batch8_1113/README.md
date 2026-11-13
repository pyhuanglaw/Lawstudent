# 第八批：2:30 AM（cafe230）、afar CC0 化（D161 三項；SHOP-REALISM-1112）

底：開發分支 `origin/claude/adoring-meitner-mqzst8` b0f0d0b59f。`git apply --check` 乾淨。

## 改了哪些

- 模型：`cafe230.glb`（兩個，aa_support 原始＋烘好的）、`afar.glb`、兩間的光照貼圖。
- 腳本：`cafe230_interior.py`、`afar_interior.py`、新的 `cc0_aakit.py`、`bake_cafe230.sh`。
- 程式：`src/zones3d.js` 一行（見測試）。
- `LICENSES.md`、`tests/shop_cc0_baseline.json`、`tests/place_gate_coplanar.json`、`SHOP_STANDARD_STATUS.md`。

## 兩間的結果（`tests/shop_cc0_unit.js`）

| 店 | Poly Haven 掃描 | CC0 材質組 | 純色零件 | 三角形 |
|---|---|---|---|---|
| 2:30 AM `cafe230.glb` | potted_plant_01、02 | Fabric036、Leather037、Leather026、Metal009、Plastic006、PaintedPlaster017、Carpet015（＋原本的胡桃木） | 33% → **16%** | 49,926 → 53,830 |
| afar `aa_support/afar.glb` | potted_plant_02 | Fabric036、PaintedPlaster017、Metal009、Plastic006（＋原本的胡桃木） | 42% → **16%** | 48,378 → 52,730 |

## 做法（新工具 `tools/blender/env_second/cc0_aakit.py`，HOWTO 第 7 節）

- aa_kit 的腳本把頂點色零件累積在 VMesh 裡。新工具的 `split_vc` 會在匯出前，照顏色把面搬到 CC0 材質組的網格（`VC_ROUTE` 表：顏色 → 材質）。AA 畫東西的函式一行都沒動。
- 表上沒有的顏色照舊用頂點色：植物葉子、書背、蠟燭、燈泡。
- 大盆栽換成 Poly Haven 掃描（`share=False`）。cafe230 的地毯原本是三層頂點色，改成一張 Carpet015。
- 加了 `--nocc0` 參數，可以建原版做對照。用它建出來的 cafe230 和開發分支上的原檔一模一樣（3,045,168 bytes）。
- 和 `cc0_kit.py`（AA 給 lane118 用的那支）不同檔，互不影響。
- 烘焙：
  - cafe230 照舊用 `bake_cafe230.sh`。`NOLM` 加上新分出來的小零件材質，所以它們照舊走即時光，不擠光照貼圖。
  - afar 照舊用 `bake_gg_new.sh aa_afar`（256 取樣），只烘地板、天花板、牆。

## 測試（套用後）

- `shop_cc0`：兩間 PASS；基準表用 `--write` 重產（拿掉這兩間）。
- `place_gate`：ALL PASS（已知未過 11 項）。`--coplanar`、`--write` 都已經含在 patch 裡。
- 相關單元測試 83 支（提到 afar、cafe230 的，以及 `shop_*`、`gg_*`、`cafe*`、`place_gate`）全部通過。
- 跑的時候抓到一個：`cafe_bar_cam_1111_unit` 第 3 項 FAIL（兩個座位的鏡頭被 `a23_c_brass` 吊燈、`a23_c_leather` 沙發背擋住）——原因是這些零件以前在 `a23_vc` 裡（`CAFE230_SEETHRU` 有它，會透空），搬到 CC0 材質組以後名字變了。
  修法：`src/zones3d.js` 加 `CAFE230_SEETHRU_RE=/^a23_(c_(?!rug)|ph_)/`，新材質照舊透空（地毯在地上不擋，不加）。修改前 FAILED 2 → ALL PASS；`cafe_seethru_unit` ALL PASS。afar 沒有透空清單，不用改。
- 全部 Node 測試以 GHA `node-unit-auto` 為準。

## 圖

- `cmp_cafe230_cc0.jpg`：參考圖；同鏡頭改之前／改之後四組（參考圖鏡頭、拱門卡座、吧台、沙發角）。
- `cmp_afar_cc0.jpg`：參考圖；三組（門口、吧台、座位區）。

## 還沒做

- wz_teahouse_yard（一盞前院，戶外）：下一批。
- BB 看圖、CC 四鏡頭。
