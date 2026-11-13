# 溫特寶邸 v4（SHOP-REALISM-1112；BB_379 v3 初判「部分」的幾點）（LAWWW2-C 2026-11-13）

## 改了什麼
- **門口立式衣架**（概念圖）：`tz_wente_interior.py --rack` 單獨烘一座木頭移動衣架＋立體衣服（ambientCG 布料、Cycles 室外光），`tools/blender/env_second/baked/tz_wente_rack.glb`（3,051 三角形、266 KB）。街景用新的 `wz_shopkit.glb_proto`＋`clutter ('glb', 檔案, x, z)` 放在窗前（x −0.55、離立面 0.62 m）。汀州路走路、店面不卡的測試都過。
- **木門扇**（`door_wood`）：兩邊直框、三道橫框、下半木板。
- **綠白磁磚柱**（`pier_tile=('mosaic', '#8fb09a')`）：玻璃兩側的柱子，外牆同一套 wall_mat。
- **蘑菇檯燈打烊會暗**（BB 問）：燈罩原本自發光烘進貼圖、不受打烊調暗——改成不自發光、靠裡面的光源照亮（12→20 W）。
- **衣服斑駁**：ambientCG 布料紋路放大（格紋 3.0→1.2、丹寧／燈芯絨／素布 → 2.5），格子約 8 cm，烘焙圖看得出來。
- **假人頭**：#a99d8a → #8a8072、粗糙度 0.85。

## 檔案
- `tz_wente_interior.glb`（→ assets/models/env/second_ai/）、`tz_wente_interior.py`（→ tools/blender/env_second/）、`tz_wente_rack.glb`（→ tools/blender/env_second/baked/）。
- `wente_front_v4.patch`：只含 v4 新增（v3 的已在開發分支）；在開發分支 26511f220d 上 `git apply --check` 通過。
- 街景：開發分支套 patch、放好 rack GLB 後重建（`wz_street.py -- --set tingzhou`；先取 textures/gen，見 v3 README）；附的 `tingzhou_street.glb` 是我這邊建的（9.2 MB → 多了衣架 6k 三角形）。
- 測試（我這邊）：tz_wente_interior、tingzhou、tz_shops、tz_shops_notrap、tingzhou_walkers、tingzhou_places、tz_shop_views、shop_window3d 全 ALL PASS；shop_cc0 溫特寶邸過。
- 並排 `cmp_wide`、`cmp_full`、`cmp_rack`、`cmp_open_closed`；照片 `shots/`。

## 還不像
- 木門是關著的（概念圖開著）；招牌下沒有三盞壁燈（街景現在是招牌上方的投射燈）。
- 店內衣架近照還是有點糊（2048 一張烘焙圖的上限）。
- 多肉放大 1.6 倍還是小。
