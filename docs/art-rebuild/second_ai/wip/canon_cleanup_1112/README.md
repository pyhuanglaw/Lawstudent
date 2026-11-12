# CANON 清單：舊序章、外校相關的美術素材（LAWWW2-C 2026-11-12；D158 起全部用代號）

使用者 11-12 12:1x 的指示（LAWWW-C 轉述，我沒有直接收到；原話照 D158 不留字，改寫成代號）：舊序章整段和它的人物拿掉、外校的東西拿掉；可昕留著，改成首都帝大法律系的同學，開局不是女朋友。
**這一份只是清單，沒有刪任何檔**；刪由 LAWWW 統一做。查的是開發分支 `claude/adoring-meitner-mqzst8`（9df122c442 之後），方法：檔名 grep＋每個檔在 `src/*.js`、`src/data/*.js` 被誰引用。
「誰在用」只看得出哪些程式檔引用，**看不出那一段劇情是不是也要刪**——標「共用」的要 AA／LAWWW 判斷。

## 一、人物（3D 模型、立繪、建模腳本）

| 誰 | 3D 模型 | 立繪 | 建模腳本 | 誰在用 | 判斷 |
|---|---|---|---|---|---|
| 舊序章人物戊 econ_jiahao | `assets/models/char/second_ai/bl_econ_jiahao.vrm` | `assets/portraits/econ_jiahao/campus/neutral.webp` | `tools/blender/char_second/jiahao*.py` | assets3d、character3d、story3d、characters、portrait_manifest | 只有舊序章 → 可刪 |
| 舊序章人物丁 econ_pinyu | `bl_econ_pinyu.vrm` | `portraits/econ_pinyu/` | 沒有專屬腳本（`npc_layered.py` 那一套） | 另有 econff／econfr／econsl／examlib／r3／vacfill／y2r2／bbpack／closed2 等 20 多個檔 | 只有舊序章那群人，但引用很多 → 可刪，程式要一起清 |
| 舊序章人物丙 econ_tangrui | `bl_econ_tangrui.vrm` | `portraits/econ_tangrui/` | `tangrui*.py` 四支 | 同上（18 個檔） | 同上 |
| 舊序章人物乙 econ_weilun | `bl_econ_weilun.vrm` | `portraits/econ_weilun/` | `weilun*.py` 四支 | 同上（20 個檔，含 classes3d） | 同上 |
| 舊序章人物甲 econ_zhengxun | `bl_econ_zhengxun.vrm` | `portraits/econ_zhengxun/` | 沒有專屬腳本 | 同上（24 個檔，含 postgrad3d、r2y3b、greet_classday） | 同上；**大三以後的事件也有他**，要 AA 確認 |
| 舊序章的教授 | `bl_prof_wei.vrm`、`glasses_wei.glb/.json` | 沒有 | `wei_clothes.py` | assets3d、character3d、characters | 經濟學原理老師 → 可刪 |
| 外校室友 yule | 沒有 3D | `assets/portraits/yule/campus/` 三張 | — | yule3d.js、yule_lines.js、phone3d、feed3d、social3d、kxdrift3d、y2r2_3d 等 20 個檔；`wip_backup/yule520_1028.bundle` | 外校的人 → 照指示要刪；可昕改放法律系後她還是不是室友要 AA 定 |
| **可昕 kexin** | `bl_kexin.vrm` | `assets/portraits/kexin/campus/` 11 張、`assets/cg/kexin/` 9 張、`assets/cg/epilogue/cg_reunion_kexin.webp` | `tools/blender/char_second/kexin*.py` | — | **留著**（改放法律系）。CG 9 張＋重逢 CG 多半是交往／外校的畫面，哪幾張還能用要 AA 定 |

路人底模 `bl_npc_nf1～20／nm1～20`、坐著的替身、法律系同學（bohan、peishan、xinci…）是全校共用，**不能刪**。

## 二、3D 場景

| 東西 | 檔 | 誰在用 | 判斷 |
|---|---|---|---|
| 社科院圖書館一樓 soclib | `assets/models/env/second_ai/soclib_interior.glb/.json`、`soclib_interior_lm_day/night.webp`、`assets/models/env/views/soclib_{north,west}_{day,night}.webp`、`src/soclib3d.js`、`src/data/soclib_layout.js`、`src/data/econfr_soclib.js`；腳本 `tools/blender/env_second/soclib_interior.py`、`soclib_layout_gen.py`、`lightbake/bake_soclib.sh`、`lightbake/soclib_interior_lm.json`；`wip_backup/econsoclib_1030.bundle` | 區域 soclib；econfr_soclib＝舊序章朋友在那裡的站位 | 場景本身是校園的一棟樓，不是「舊序章的人」。**建議留場景、刪 econfr_soclib.js**；法律系會不會去要 AA／LAWWW 定 |
| 社科院圖書館二樓 soclib_2f | `soclib2f_interior.glb/.json`、`soclib2f_interior_lm_day/night.webp`、`src/soclib2f3d.js`、`src/soclib2f_people3d.js`、`src/data/soclib2f_layout.js`、腳本 `soclib2f_interior.py`、`soclib2f_layout_gen.py`、`lightbake/bake_soclib2f.sh`、`wip_backup/soclib2f/*.bundle` | 區域 soclib_2f | 同上 |
| 舊序章那一段的宿舍道具 | `assets/models/env/second_ai/aa_support/v0_dorm_props.glb/.json` | zones3d.js 宿舍（`econ` 為真才放）、dorm_room_layout.js `v0_props` | 只有舊序章 → 可刪（宿舍房間模型本身是共用的，不能刪） |
| 舊序章的家 | 沒有 3D 模型（`src/home3d.js` 用 2D 背景）、`src/data/retake_home.js`、`src/data/home_lines.js` | — | 場景是 2D，見第三節 |
| 外校 | **沒有 3D 場景**，全部是 2D 背景 | — | 見第三節 |
| 博雅 101、普通教室、校園、總圖 | 各棟 GLB | 全校共用（舊序章的課在博雅 101 上） | **不能刪** |

名字裡有 home 但無關的：`l118_home.*`＝118 巷「五湖四海」餃子店，**不能刪**。

## 三、2D 背景（`assets/bg/`）

| 類別 | 檔 | 誰在用（除了 outings3d.js、events.js） | 判斷 |
|---|---|---|---|
| 外校 | `nccu_campus`、`nccu_dorm`、`nccu_dorm_day`、`nccu_food`、`nccu_gate` | kxdrift3d、postgrad3d、y2r2_3d、y34b3d、multirel3d、pgdates3d、kx_moot3_3d、r2y3a／r2y4a／r2y4b／y2b 事件、arc_invites、group_events、termend_lines | 照指示刪；**引用遍及大二到畢業後**，程式要一起清 |
| 舊序章宿營 | `econ_camp`、`econ_camp_room`、`assets/cg/econ/cg_econ_camp.webp` | camp_y1.js | 只有舊序章 → 可刪 |
| 社科院（2D） | `soc_classroom`、`soc_hall`、`soc_library`、`soc_office`、`ntu_soc` | bbpack_events、pool_story_b2、r2y3a／r2y3b／r2y4a 事件、wz_events、kxdrift3d、y2r2_3d、y34b3d | **共用**（法律系同學池、大三大四也用）→ 不能整批刪 |
| 舊序章補習班 | `cram_class`、`cram_counter`、`cram_street` | `cram_class` 另有 home3d、v6b_3d、r2y4b、rom1016、termend_lines、vac_activities、retake_home | `cram_counter`、`cram_street` 只被 outings3d／events 引用 → 多半可刪；`cram_class` 另有 7 個檔引用（是不是都是舊序章那一段我沒有逐場看），要 LAWWW／AA 看 |
| 家 | `home_*` 16 張 | home3d、story3d、holff3d（過年）、jpprep、r2y4a、r3、sis_b13、twfill、aa720 | 引用的檔很多、不只 retake_home（有過年 holff3d、jpprep、r3、sis_b13…）→ **當共用，不整批刪**；哪幾張只給舊序章用要 LAWWW／AA 逐場看 |
| 舊序章那一段（y0） | `y0_dumpling`、`y0_home_street_night`、`y0_lane_shop`、`y0_sea_blue`、`y0_sea_rain` | `y0_dumpling`（r2y3a）、`y0_lane_shop`（multirel3d）、`y0_sea_blue`（group_events、r2y4b）另有人用；`y0_home_street_night`、`y0_sea_rain` 只有 outings3d | 兩張可刪、三張**共用** |
| 高雄 | `kh_*` 18 張 | hometown_lines、y2r2_3d、r2y3a、r2y4a、fest_events | 高雄＝**可昕的縣市**（`hometown_lines.js`：寒暑假去高雄找她，要交往才有）。使用者說可昕「不是我女朋友」→ 這 18 張多半跟著不用了，但這是劇情判斷，**要 AA 定**；`kh_bus_day`、`kh_bus_station` 是舊序章 7/25 那一趟做的（ART-KH-BUS），只被 outings3d／events 引用 |

## 四、我這邊不再做的
- 舊序章、舊序章裡的家、外校相關的場景和人物模型不再做新的（任務清單裡 SOCLIB-2F-1104 的後續、v0 宿舍、舊序章人物修改都停）。
- 可昕的 3D 模型照舊維護。

## 五、沒查到／不確定
- 企劃線（`claude/story-planning`）上的參考圖、AA 的建模素材沒有列（不在開發分支）。
- `tests/` 裡針對這些人和場景的測試沒有列（刪檔時會一起紅，LAWWW 清）。
- 「誰在用」是字串比對，檔名相近的可能有漏（例如用變數拼出來的路徑）。

## 六、D158 清字紀錄（11-12 13:1x）
- 這一份和 `docs/art-rebuild/second_ai/` 底下 170 個文字檔、`docs/handoff/outbox_LAWWW2.json`、`user_asks_LAWWW2.json` 已經用批次替換改成代號（`tools/handoff/canon_scan.py` 對這幾個路徑＝0 檔 0 處）。
- 代號：舊序章人物甲～己＝字表裡那六個人（照字表順序；本表第一節各列的英文檔名看得出是哪一個模型）、外校室友、舊序章的教授。
- 副作用，先記著：
  - `wip/` 裡 58 個舊的 `.patch` 檔內文也被替換了——這些都是已經整合過的歷史 patch，**不能再拿來套**（上下文對不上）；今天還沒收的三包（l118_it_reach_v2、tz_shutter_pos_v1、moku_stair_void_v1）沒有被動到。
  - `user_asks_LAWWW2.json` 裡使用者原話欄位有那些字的也換成代號了（照 D158 不留字；原話以 Git 歷史為準）。
- 還沒清的：檔名和英文識別字（`--latin`）、`tools/blender/char_second/` 裡舊序章人物的建模腳本（等 LAWWW 通知後和模型一起刪）。

## 七、開發分支上歸美術的檔（11-12 14:3x 更新）
- LAWWW 已經在開發分支跑完（docs、LICENSES.md、tools/blender、tools/lane118、assets/models：133 個檔，這幾個路徑掃描 0）。
- 工具用規則包裡的 `tools/handoff/canon_clean.py <路徑…> [--dry]`（LAWWW 改寫的：照字本身對代號，不算的寫法和 `canon_scan.py` 同一套）。**我原本放在這個資料夾的那一支已經刪掉**——它照字表的位置對代號，字表前面加了兩個寫法以後會對錯，不要從 Git 歷史撿回來用。
- 不交 patch 的原因照舊：patch 的「−」行會帶著那些字。

## 八、檔名帶英文縮寫的美術檔（開發分支，41 個）：刪／改名對照（11-12 13:4x）

查法：開發分支 `git ls-files` 裡路徑含那四個英文縮寫、而且在 `assets/`、`docs/art-rebuild/`、`tools/blender/`、`tools/shots/`、`wip_backup/` 的。

| 檔 | 建議 | 說明 |
|---|---|---|
| `assets/bg/` 外校五張（校園、宿舍、宿舍白天、餐廳、校門） | 刪 | 等程式引用拿掉 |
| `assets/bg/` 宿營兩張、`assets/cg/` 宿營 CG 一張 | **先不刪，請 AA／LAWWW 定** | D158 寫「遊戲從大一開學前的迎新宿營開始」——這三張畫的就是宿營（營地、房間、合照）。新的迎新宿營如果沿用，改名成 `camp_y1.webp`、`camp_y1_room.webp`、`assets/cg/camp/cg_camp_y1.webp`（程式 `camp_y1.js`、`outings3d.js` 的 id 一起改）；不沿用就刪 |
| `assets/models/char/second_ai/` 舊序章人物甲～戊五個 VRM、`assets/portraits/` 對應五個資料夾 | 刪 | 等程式引用拿掉；LICENSES.md、assets3d.js manifest 對應列一起 |
| `docs/art-rebuild/second_ai/test_shots/` 舊序章系外套那一包（8 個檔）、`patches/` 同名 patch、`tools/` 根目錄同名腳本 | 刪 | 舊序章那個系的系外套；法律系系外套如果要做是另一支。遊戲的 `C.setJacket` 本身是共用的，不動 |
| `docs/art-rebuild/ingame_review/` 2026-10-17 那一包（8 個檔） | 刪 | 舊序章人物的遊戲內檢查截圖 |
| `tools/shots/` 舊序章人物拍照腳本一支 | 刪 | |
| `tools/blender/env_second/` 外校背景腳本一支 | 刪 | 產外校那五張 2D 背景的 |
| `wip_backup/` 兩個 bundle（1028、1030） | 刪 | 舊序章的 WIP 備份；內容早已整合 |
| `docs/handoff/user_shots/` 11-10 那一張 | 請 LAWWW 定 | 使用者傳的截圖，不是美術產的 |

不帶那些縮寫、所以不用改名的共用素材：家裡的背景 16 張、補習班教室、社科院 2D 背景、高雄 18 張、y0 開頭五張（「y0」是舊序章那一年的代號，要不要也改名請 LAWWW 定）。
另外：`v0_dorm_props.glb/.json`（舊序章那一年的宿舍道具，`v0` 也是代號）＝刪。
