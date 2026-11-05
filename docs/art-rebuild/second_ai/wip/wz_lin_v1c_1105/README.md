# 林家乾麵 v1c 進遊戲＋牆的淡出方向修正（WZ-SHOPS1-1104／GLB-WALLDIR-1105，LAWWW2-C 2026-11-05）

- 照 D141 佇列第 5「溫州街第一批五間收尾」做。開發分支 `9c124e41c` 上：
  - 2:30 AM、小路、SUNNY SIDE、阿德影印：室內和來源分支最新版一模一樣。
  - 林家乾麵：還是舊的 `wz_lin_interior.glb`。BB〔帳號 A〕11-04 照使用者的參考圖做的新室內 v1c（`bb_support/lin_interior.glb`、`src/data/lin_layout.js`，READY_FOR_REVIEW，「模型收件由 LAWWW2 處理」）一直沒接。
- 這一包是**兩個 patch**，都在 `9c124e41c` 上乾淨，可以分開接：

| patch | 內容 | 為什麼 |
|---|---|---|
| `walldir_1105.patch` | `src/zones3d.js`：attachRoomGLB 的 WALL_ 網格沒有 extras.dir 時，用上層節點的（`wallDirOf`） | **擋玩、遊戲裡現在就有**：日和便利店 `cvs_interior.glb` 的前、左、右牆淡出方向錯，鏡頭從外面看會擋住人 |
| `wz_lin_v1c_wire_1105.patch` | `index.html` 載入 `lin_layout.js`；`zones3d.js` 登錄新 GLB；`LICENSES.md` 一列；8 支測試的檔案清單加上 `lin_layout.js` | 林家 v1c 接進 `wz_lin` |

## 1. 牆的淡出方向（GLB-WALLDIR-1105）

- 原因：BB 的 Blender 套件把 `extras.dir`（往房間裡的法線）寫在空節點 `WALL_back`、`WALL_left`…，底下真正的網格 `WALL_back_print`… 沒有。`attachRoomGLB` 只看網格自己，沒有就當成 `[0,0,1]`。
  - 結果：前牆、左牆、右牆在鏡頭從外面看的時候不淡出，擋住人（D141 的「擋玩」）。
  - 掃過 `assets/models/env` 全部的 GLB，這種寫法的有：日和便利店 `cvs_interior.glb`（5 塊）、林家乾麵 `lin_interior.glb`（12 塊）、南洋戲院兩顆。
  - 南洋在 `nanyang3d.js` 的 `wallDirs` 先照位置補了，不受影響。
- 改法：`wallDirOf(o,root)`：網格自己的 dir；沒有，就往上找到 GLB 根節點為止的第一個 dir；都沒有才照舊 `[0,0,1]`。網格自己有 dir 的（阿德、日常失速…）照舊。
- 測試 `tests/wall_dir_inherit_unit.js`（自己讀 GLB，照 attachRoomGLB 真的跑一次，檢查每一塊都朝房間裡）：

| | ① 日和便利店 | ① 林家 v1c | ② 阿德、日常失速（自己有 dir） |
|---|---|---|---|
| 修改前 | FAIL：5 塊裡 4 塊朝外（前 2、左 1、右 1） | FAIL：12 塊裡前、左、右的都朝外 | PASS |
| 修改後 | PASS（5 塊） | PASS（12 塊） | PASS（各 23 塊） |

## 2. 林家乾麵 v1c

- 模型、配置：BB 的 v1c，GLB 和 BB 分支 `9308d3301` 一模一樣（1.97 MB、26,029 三角形、12 材質）。
- 參考圖：使用者的 `wz_lin_int.webp`。BB 的對照圖在 `docs/story_planning/bb_models/lin/`（`lin_v1c_ref_vs_render.jpg`，ref_match ALL PASS）。
- 門、窗、出口、出生點、溫州街的「進去林家乾麵」都沒動。桌子重排成四張方桌，每桌兩張木椅加一張紅凳，共 12 個位子；桌號照舊。
- 接法：`lin_layout.js` 一載入就換掉 `WZ_SHOPS_LAYOUT.lin`。區域、作息、點餐、店員、shop_enc 都讀這一份。
  - 原本想在 zones3d.js 裡換，但有測試是先載入 zones3d.js 才載入配置，結果換不到，所以改在配置檔裡換。
  - `index.html` 要在 `wz_shops_layout.js` 後面載入。
- **我改了 BB 配置的兩處**（照 D141，擋玩的）：
  1. 左欄兩張紅凳（桌 1、桌 3 西邊，x −1.45）標 `npcOnly`。
     - 原因：它們在煮麵台旁 0.82 m 的縫裡，導航阻擋各加 0.05～0.1 m 以後剩 0.6 m，人（直徑 0.64）走不進去。遊戲 `seatApproach` 的 8 個候選點都站不住。
     - 結果：不出「坐下」。桌 1、桌 3 照舊兩張木椅可以坐，玩家可坐的位子是 10 個。
  2. 煮麵台到左欄紅凳那一條整條擋起來（x −2.45～−1.27、z −1.4～2.2）。
     - 原因：原本桌 1 紅凳北邊留下 5 個站得住、走不到的點（小孤島，滑進去出不來，v9.3 #31）。
- 測試：
  - `tests/wz_lin_v1c_unit.js`：
    - 新配置生效，門、出口、出生點不變。
    - 10 個「坐下」都走得到範圍；桌 1 在前排（明軒「門口那桌」）。
    - 4 個互動點（點餐、看菜單、結帳、自助調味區）走得到；GLB 是 v1c。
    - 修改前（舊配置）FAILED 5；修改後 ALL PASS。
  - `tests/wz_shops2_unit.js`（原本林家的測試）加上 `lin_layout.js` 以後：
    - 先 FAIL 2：桌 3 紅凳的走近點、孤島 5 點。
    - 改了上面兩處以後 ALL PASS。
  - 另外 7 支的檔案清單也加上 `lin_layout.js`，現在測的是遊戲裡那一份：`wz_aa364_shops_unit`、`shop_enc_seat_unit`、`shop_diners_unit`、`seat_reach_unit`、`wz_shops_unit`、`aa655_wz_rename_unit`、`wz_interiors_aa659_unit`。全部 ALL PASS。
    - `wz_aa364_shops_unit` 的「林家內用」現在坐到新桌 1 的 (−0.85, 1.7)；原本是舊的 (−2.2, 2.15)。
- 乾淨的 `9c124e41c`＋兩個 patch＋新檔案上的結果：
  - 本包 11 支 ALL PASS：wall_dir_inherit、wz_lin_v1c、wz_shops2、wz_aa364_shops、seat_reach、shop_enc_seat、shop_diners、wz_shops、cvs_interior_lm、nanyang、shanlan。
  - 改的過程中在同一個樹上另外跑過 32 支（和上面有重疊）ALL PASS（牆方向會影響所有用 attachRoomGLB 的區域）：rooms_glb、room_ceiling、dorm_seethru、tongxian、mokuyobi、wz_offbeat、ade_v1c、ade_seats_nav、te_komichi_stage、bike、gg_shops2_1104、gg_glow_shoplit、gg_shoplit_reentry、cafe_kit_glow、linze_lightmap、soclib2f、library_upper、gym、us_life、aa117_notes、aa347_y1、crowd、indoor_crowd、presence、shop_enc、wz_work_spots、lane118、wz_cat 等。
  - 瀏覽器沒跑（D131）。

## 3. 先將就的（D141：給使用者看的清單）

1. 左欄兩張紅凳只給 NPC 坐（玩家走不到）。
2. 一進林家，「離開林家乾麵」的按鈕就在範圍裡：出生點離出口 0.5 m、範圍 1.3 m。舊配置也是這樣，BB 照舊沿用。往裡走 0.8 m 按鈕就不見。
3. 沒有烘光照，用即時光（BB 的渲染是 Cycles 點光源）。
4. 正面開口外的街景：用舊的窗景卡 `wz_lin`。BB 的 GLB 沒有街景卡片。

## 4. 接法（LAWWW-C）

1. 拿檔案：`git checkout <SHA> -- src/data/lin_layout.js assets/models/env/second_ai/bb_support/lin_interior.glb tools/blender/env_second/bb_support/lin_interior.py tools/blender/env_second/bb_support/lin_tex.py tests/wall_dir_inherit_unit.js tests/wz_lin_v1c_unit.js`
2. 套 patch：
   - `git apply docs/art-rebuild/second_ai/wip/wz_lin_v1c_1105/walldir_1105.patch`
   - `git apply docs/art-rebuild/second_ai/wip/wz_lin_v1c_1105/wz_lin_v1c_wire_1105.patch`
   - 都在 `9c124e41c` 上乾淨，先後都可以。牆方向那一包單獨接就修好日和。
3. 舊的 `wz_lin_interior.glb`、`wz_shops_layout.js` 的 `lin` 留著：`lin_layout.js` 沒載入時照舊用。
