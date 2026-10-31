# D88 搬檔：被「烘進」其他模型、2D 背景的原始 GLB＋產生腳本（LAWWW2-B 2026-10-31）

- **起因**：HISTORY-AUDIT-1031 第一批（`docs/handoff/history_audit/summary_LAWWW2.md` 第 52～56 行）。
  - 這些支援 GLB 被烘進別的模型或背景，遊戲現在不受影響。
  - 但原檔只在 LAWWW2 的分支。在開發分支重匯會出事：
    - `wz_street.py:844` 是「檔案存在才擺」：溫州街會默默少掉保溫箱、安全帽、回收紙箱＋寶特瓶袋三件；
    - `bg_soymilk.py:191`、`bg_tutor.py:143`、`us_apartment.py:281/:358` 讀不到檔。
- LAWWW-B 20:22 同意，發布基準 39f68236c 凍結中，**發布後再合**。
- **只加檔案**，不改遊戲程式；遊戲不讀 `aa_support/`、`bb_support/`（只有 Blender 腳本讀）。

## 怎麼合（發布後）

- 檔案都在我的分支 `claude/funny-albattani-iawshm` 的 commit **9cc4810f2**（之後的 commit 也一樣，這些檔案不會再動）。清單：`docs/art-rebuild/second_ai/patches/D88_support_sources_1031.txt`（71 個）。
- 一行搬進來（開發分支上跑）：

```
git fetch origin claude/funny-albattani-iawshm
xargs -a docs/art-rebuild/second_ai/patches/D88_support_sources_1031.txt git checkout 9cc4810f2 --
```

## 內容

- **支援 GLB＋統計**（21 個，7.2 MB 左右）：
  - `aa_support/`：soy_props、wz7_street_props、park2_props、us_living_props、us_kitchen_props、us_bath_props（各 .glb＋.json）、wz6_items.json。
  - `bb_support/`：park3_props、tutor_props、us_bedroom_props、scooter_shop_props（各 .glb＋.json）。
- **產生它們的腳本**：
  - `tools/blender/env_second/aa_support/*.py`、`bb_support/*.py`；
  - 鏡頭清單 `*_views.json`；
  - 遊戲內擺放參考 `park2_game_place.js`、`park3_game_shots.js`、`park3_wz_park_integration.patch`。這些是當時交件的紀錄，遊戲不讀。
  - BB-B 的貼圖：Poly Haven CC0，`bb_support/textures/`。產生的圖集：`textures/gen/`。
- **和開發分支不同的 3 個**：
  - `aa_support/README.md`、`bb_support/README.md`：我分支的比較新，加了後來各件的驗收紀錄。
  - `aa_support/render_wz6.py`：路徑小修，5 行。

## LICENSES.md 要補的行（開發分支沒有；照我分支的寫法）

| 家教的客廳道具組 `assets/models/env/second_ai/bb_support/tutor_props.glb`（ART-TUTOR1） | 本作 Blender 腳本 `tools/blender/env_second/bb_support/tutor_props.py`（BB-B 做、LAWWW2-B 驗收）；頂點色材質，沒有貼圖 | 本作 | 2D 背景 BG-21 學生家的客廳 |
| 美國公寓客廳家具 `assets/models/env/second_ai/aa_support/us_living_props.glb`（ART-US1） | 本作 Blender 腳本 `tools/blender/env_second/aa_support/us_living_props.py`（AA-B 做、LAWWW2-B 驗收）；貼圖 Poly Haven CC0（`fabric_leather_02` 染黑、`walnut_veneer`）烘進貼圖集 | 本作；貼圖 CC0 | SCN-US-01 美國公寓 |
| 美國公寓廚房 `assets/models/env/second_ai/aa_support/us_kitchen_props.glb`（ART-US2） | 本作 Blender 腳本 `tools/blender/env_second/aa_support/us_kitchen_props.py`（AA-B 做、LAWWW2-B 驗收）；貼圖 Poly Haven CC0（`granite_tile_03`、`walnut_veneer`）烘進貼圖集；沒有字、品牌 | 本作；貼圖 CC0 | SCN-US-01 美國公寓 |
| 美國公寓臥室家具 `assets/models/env/second_ai/bb_support/us_bedroom_props.glb`（ART-US3） | 本作 Blender 腳本 `tools/blender/env_second/bb_support/us_bedroom_props.py`（BB-B 做、LAWWW2-B 驗收；被子是 Blender cloth 模擬）；貼圖 Poly Haven CC0：`poly_wool_herringbone`、`rough_linen`、`cotton_jersey`（colormass 攝影、Rico Cilliers 處理）、`denim_fabric`（Rob Tuytel）、`walnut_veneer`，下載在 `tools/blender/env_second/bb_support/textures/`；人字紋印花是畫的 | 本作；貼圖 CC0 | SCN-US-01 美國公寓 |
| 溫州街路邊小物（保溫箱、安全帽、回收紙箱＋寶特瓶袋）`assets/models/env/second_ai/aa_support/wz7_street_props.glb`（ART-WZ7；烘進 `wenzhou_street.glb` 的 `wz7_props`） | 本作 Blender 腳本 `tools/blender/env_second/aa_support/wz7_street_props.py`（AA-B 做、LAWWW2-B 驗收） | 本作 |
| 美國公寓衛浴＋陽台小物 `assets/models/env/second_ai/aa_support/us_bath_props.glb`（ART-US4；烘進 `us_apartment.py` 的浴室） | 本作 Blender 腳本 `tools/blender/env_second/aa_support/us_bath_props.py`（AA-B 做、LAWWW2-B 驗收） | 本作 |
