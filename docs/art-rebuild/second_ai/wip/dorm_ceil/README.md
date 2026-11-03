# 宿舍天花板 3.0 → 3.4 m（DORM-CEIL-1103）——交件（READY_FOR_REVIEW）

- **起因**：使用者 11-03 11:2x「宿舍天花板太低了 走上去都撞到頭 不合理」「至少微微彎腰不要整個頭卡進去天花板」。房間高 3.0 m：梯子最上面一階 1.60 m＋身高約 1.75 m＝頭頂 3.35 m；上床那一點（床墊 1.86 m）站直約 3.6 m——整顆頭在天花板裡。
- **改了什麼（房間，LAWWW2）**：`tools/blender/env_second/dorm_room4.py` 天花板 H 3.0 → 3.4 m（牆、隔間、床架上的欄杆柱跟著）、冷氣管頂 H−0.03、吸頂燈（烘焙燈）2.95 → 3.35；重烘光照（day／night／dark）。每組床的 `sleep_scene` 多三個欄位：`ceil_y: 3.4`、`head_max: 3.32`、`bed_entry_pose: 'kneel'`。
- **動作（LAWWW，DORM-LADDER-STOOP-1103，另外做）**：最上面一兩階頭頂不超過 head_max（微微彎腰）、上床那一步跪著爬進去、起床反過來。
- **檔案**：本分支 `assets/models/env/second_ai/dorm_room4.glb`、`dorm_room4_lm_day/night/dark.webp`、`dorm_room4.layout.json`；遊戲的 `src/data/dorm_room_layout.js` 用 `python3 tools/gen_dorm_room_layout.py` 重產＝`dorm_ceil_1103.patch`（接在開發分支 `0f16f98a3`；只有 h 和三個欄位不同）。
- **測試（雲端）**：開發分支 0f16f98a3＋新 GLB／配置：宿舍、房間、座位相關 45 支 Node 單元測試 ALL PASS（`node_units_45.txt`）。瀏覽器 flow 測試沒跑（房間導航、座位沒變；只改高度）。實機沒測。
- **截圖**（`before_after_step_bed.jpg`，左＝改前 3.0 m、右＝改後 3.4 m；人物站直、還沒有 LAWWW 的彎腰／跪姿）：上排＝最上面一階（改前頭在天花板裡；改後整個頭在天花板下）；下排＝站在床墊上（改前頭和背包穿出天花板；改後頭頂約碰到天花板——上床這一步要靠 LAWWW 的跪姿）。
