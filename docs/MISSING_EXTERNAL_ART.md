# MISSING_EXTERNAL_ART — 尚未提供的正式美術（2026-09-27）

原則：沒有正式圖片的人物走 **compact 對話模式**（模糊 3D 背景＋姓名＋對話框），玩家版本不顯示任何 `PLACEHOLDER_2D_PORTRAIT` 標籤；只有 `?dev` 才顯示 `MISSING_PORTRAIT` 小標籤。
圖片放到對應路徑、重新 build（`python3 build.py` 會重掃 `assets/portraits/` 產生 manifest）即生效，不必改程式。

## 已有（production）

| character_id | 檔案 | 來源 |
|---|---|---|
| heroine_01 沈以安 | assets/portraits/heroine_01/campus/neutral.webp（260×892） | 使用者提供的五人 master sheet，`tools/cut_portraits.py` 切圖去背 |
| heroine_02 林芷若 | assets/portraits/heroine_02/campus/neutral.webp（245×832） | 同上 |
| heroine_03 陳語彤 | assets/portraits/heroine_03/campus/neutral.webp（213×820） | 同上 |
| heroine_04 高子晴 | assets/portraits/heroine_04/campus/neutral.webp（256×885） | 同上 |
| heroine_05 溫書瑀 | assets/portraits/heroine_05/campus/neutral.webp（240×907） | 同上 |

注意：來源合圖 1198×1313，切出的人物約 210–260 px 寬、820–910 px 高。手機直向顯示約 190×650 CSS px（1.3×）、桌機／橫向 130% 放大時已接近 1:1，會略軟。**建議之後提供 ≥2× 的單人高解析度版本**（同一構圖即可直接替換）。

## 缺（MISSING_EXTERNAL_ART）

### TIER 3 — 五位女主角
- 表情差分（每人）：smile, laugh, serious, surprised, embarrassed, annoyed, sad, tired, thinking → `assets/portraits/<id>/campus/<expression>.webp`（同構圖、同頭部位置；目前全部 fallback 到 neutral）
- 服裝：casual、formal（每套至少 neutral）
- 高解析度單人版 master（≥ 520×1800）

### TIER 2 — recurring NPC（至少 neutral, smile, serious, annoyed／surprised；bust 或膝上）
- kai 阿凱（室友）、zhe 阿哲、yu 小語
- classmate_bohan 許柏翰、classmate_xinci 吳芯慈、classmate_mingxuan 江明軒、classmate_youchen 賴宥辰、classmate_peishan 郭沛珊
- npc_ta_chen 陳助教
- 教授（neutral, speaking, serious）：prof_zhou 周教授、prof_lin 林教授、prof_xu 許教授；其餘教授（prof_zhang, prof_wu, prof_huang, prof_tsai, prof_chen）目前只在課表出現，可先不做

### TIER 1 — minor talking NPC（1 張 bust neutral，可共用身體模板）
- npc_fangyt 方奕廷、npc_huangxh 黃筱涵
- 不熟同學 pool_1–pool_20（可用 4–6 個共用模板＋不同髮型／配色；揭露名字前用同一張也可以）

### TIER 0 — ambient
- 路人／騎士：不進 ADV，不需要 2D。

### 背景圖（bg_id，1920×1080 ＋ 1080×1920）
law_classroom_day / law_classroom_evening / library_day / library_night / cafe_day / cafe_evening / cafe_rain / dorm_night / campus_sunset / campus_rain / royal_palm_road_day / gate_night / noodle_shop_night / gongguan_night / wenzhou_alley_dusk
（目前事件用 3D freeze／blur 當背景；提供圖片後在事件把 `background` 改為 `{image:'assets/backgrounds/<bg_id>.webp'}`）

### Event CG
- cg_library_rain_heroine03、cg_cafe_dusk_heroine01（登錄在 `CG_REGISTRY`，檔案不存在時自動退回一般 ADV）

### 3D
- **玩家正式模型**：目前用 Seed-san（VirtualCast, Inc.；VRM Public License 1.0，須標示出處）改色版：黑短髮、墨綠 T-shirt、炭灰長褲；**赤腳、褲長七分、胸口有原貼圖徽章**。要一個「有球鞋、後背包」的台灣大學生男性 VRM。RPM 範例（棕西裝光頭）已降級為 `TEMP_PLAYER_DEV_MODEL`，只在 VRM 載入失敗時出現。
- 五位女主角的 3D VRM（依 Character Bible）：目前只有小安用 three-vrm 範例（白 T 黑短褲，與 2D 不一致）；其餘四位是程序化 placeholder。
- 主要 NPC（阿哲、阿凱、小語、同學、教授）的 3D：全部程序化 placeholder。
