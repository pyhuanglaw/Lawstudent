# 美術裡的字：虛構校名改名清單（LAWWW2-B，2026-10-30 初版）

- **為什麼**：
  - 使用者 10-30 決定把真實校名、館名改成虛構的（AA-B 04:3x 轉達）。
  - 規範：`docs/WORLD_NAMING.md`（企劃線 `8ad5272df`，已帶進開發分支 `cd066c551`）。
  - 盤點：AA_534 第 6 節。
- **現在的狀態（10-30 更新）**：LAWWW-B 派工（D115）後**第一節、校門石牌、晨思鐘、博思教學館名牌都改好了**（`1f711447c`）；改前改後截圖在 `test_shots/rename_art_1030/`。
  - 做法：不重新匯出、不重烘光照，用 `tools/blender/env_second/glb_patch.py` 只換那一張貼圖或那個節點的 extras（其他資料原封不動）；腳本也同步改字，以後重新匯出還是新名字。
- **怎麼查的**：
  - 掃我負責的 Blender 腳本（`tools/blender/`）裡會畫進貼圖的字串（PIL 的 `d.text`）。
  - 每一筆再看它是畫進貼圖，還是只是配置裡的名字（遊戲端用程式顯示）。
  - **2D 背景、CG、企劃線 `docs/story_planning/signs_approved/` 的招牌圖還沒開圖逐張看**（見第三節）。

## 一、烘進貼圖、模型裡的字（要改字、重新匯出）

| 檔案（腳本 → 產出） | 在哪裡 | 現在的字 | 改成（AA-B 04:55 給的） | 改了沒 |
|---|---|---|---|---|
| `tools/blender/classroom_201.py` → `assets/models/env/classroom_201.glb` | 霖澤館 201 公告欄的傳單 | 「每週四 19:00／萬才館」 | 「每週四 19:00／法律系館B」 | **已改**（glb_patch 換 `cls201_print`） |
| 同上 | 同上 | 「霖澤館 3F／自備六法」 | 「法律系館A 3F／自備六法」 | **已改** |
| 同上 | 同上 | 「法律學院　敬啟」 | 照留 | 不用改 |
| `tools/blender/linze_notice_tex.py` → 霖澤館一樓公布欄的貼圖 | 霖澤館一樓公布欄 | 「椰林大道　下週三起三天」 | 「椰影大道　下週三起三天」 | **已改**（glb_patch 換 `linze_notice`） |
| 同上 | 同上 | 「每週四中午　霖澤館 201」 | 「每週四中午　法律系館A 201」 | **已改** |
| `tools/blender/env_second/aa_support/wz6_items.py` → `assets/models/env/second_ai/aa_support/wz6_items.glb` | 子晴的吉他社成發海報（`WZ6_poster`） | 「萬才館大廳｜免費入場」 | 「法律系館B大廳｜免費入場」 | **已改**（只是支援素材，遊戲沒有載入這個 GLB） |
| `tools/blender/env_second/bg_nccu.py` → 政大的 2D 背景 | 招牌 | 「政大」 | 「木柵大學」（英文 Muzha University／MZU）；檔名、背景 id 照舊 | **腳本已改；背景圖不用重算**：公車站牌在 `nccu_gate.webp` 的鏡頭外面（畫面裡沒有任何「政大」字樣），三張政大背景都沒有校名 |

- 原本以為要重新匯出、重烘光照；實際用 `glb_patch.py` 只換貼圖，光照貼圖、UV、網格都沒動。
- 另外加的兩項（派工清單上的）：
  - 博思 203 門口的小海報「博雅 203」→「博思 203」（`boya_203.glb` 的 `boya_203_print`）。
  - 牌子（遊戲照 GLB 節點的 extras 用 canvas 畫字）：校門 `PLATE_FACE_GATE_OUT`「國立臺灣大學」→「首都帝國大學」、晨思鐘 `PLATE_FACE_BELL`「傅鐘」→「晨思鐘」、博思教學館 `PLATE_FACE_BOYA`「博雅教學館」→「博思教學館」。
  - 所有 GLB 節點 extras 掃過一遍：剩下 `campus_admin.glb` 的「行政大樓」（含「政大」兩個字，但不是校名，不改）。

- 宿舍房間牆上的海報（`dorm_wz_items.py` → `dorm_wz_items.glb` 的 `ITEM_wz_poster`）：字是「成果發表會」「DEMO DAY」，沒有校名、館名，不用改。

## 二、只是配置裡的名字（遊戲端用程式顯示，交給 LAWWW-B 改程式）

這些腳本裡有館名，但只出現在配置 JSON、layout JS 的 `name`、`label`、`spawn_note`、註解裡，**沒有畫進貼圖**。貼圖上的牌子只寫「3F 討論區」「202 教室」這種：

- 霖澤館（改法律系館A）：
  - `linze_upper.py`：3F／4F／5F 的 `name`
  - `flat_classroom.py`：`linze_202` 的 `name`
  - `linze_office.py`：出口的 `label`／`spawn_note`
- 萬才館（改法律系館B）：
  - `flat_classroom.py`：`wancai_multi` 的 `name`
  - `wancai_seminar.py`、`wancai_semb.py`：研討室 A／B 的 `name`，完整寫法「法律系館B 研討室A」
- 博雅：
  - `boya_203.py`：「進入 博雅 203」「博雅 203」等 `label`
  - 規範：博雅改博思教學館。
- 不用改的：
  - `library_*.py`：總圖 2F、5F 書庫、B1、多媒體中心
  - `gongtong_3f.py`：共同教學館 301
  - `campus_socsci.py`：社會科學院、社會科學院圖書館（這兩個是畫在牌子上的字）

## 三、還沒查的（要開圖看）

- **2D 背景**（`assets/bg/*.webp`）、**CG**：有沒有烘進去的台大、政大、館名、椰林大道等字樣。
- **企劃線 `docs/story_planning/signs_approved/`**：使用者批准的招牌圖，沒有文字可以搜。
- **校徽、可識別圖形**：我做的 Blender 美術沒有用到台大、政大的校徽。上面兩項逐張看完前，狀態都是「未查」。
- 校門石牌、建築匾額：正式 GLB 的字放在節點 extras（遊戲用 canvas 畫），10-30 已經改了（見第一節）；程序化套件的預設字 LAWWW-B 已經在 `campuskit3d.js` 改了。
