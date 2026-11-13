# 印得好／聯通 CC0（進行中，LAWWW2-C 11-13）

`wip_src_yindehao_liantong.patch`＝原始碼檢查點（底＝開發分支 ebac31a76e；建模腳本、烘焙腳本、LICENSES）。**還沒交件**，模型、光照貼圖還在烘。容器重開：套上這個 patch → `bash tools/blender/env_second/lightbake/bake_tz_shops.sh yindehao`（聯通要先用 `--ref docs/art-rebuild/second_ai/ref/gg_shops6_1110/interior` 跑一次建模，產生 tz_liantong_int_atlas）。

**11-13 14:3x 更新**：v1 試拍（`cmp_yindehao_v1_streaks.jpg`，右邊）白塑膠一條條黑紋——Plastic006 顏色貼圖幾乎全黑、校成白色把起伏放大。`acg()` 加 `vary`（起伏壓到 5%）、包裝紙紋理 0.44→0.12；東南大聯也加進來（Poly Haven 收銀機 CashRegister_01、塑膠籃 plastic_crate_01／02）。印得好、聯通、東南大聯依序重烘中。已整合的洗樂也有黑紋 → 洗樂 v3。
