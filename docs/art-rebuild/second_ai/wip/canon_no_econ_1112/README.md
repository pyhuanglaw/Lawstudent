# CANON-NO-ECON-1112：經濟系、重考的家、木柵大學（政大）相關美術清單（LAWWW2-C 2026-11-12）

使用者 11-12 12:1x（LAWWW-C 轉述，我沒有直接收到原話）：「刪掉經濟系的所有人 刪掉重考這個劇情　刪掉政大的東西 杜可昕這個人物既然已經做好 就放在台大法律但他不是我女朋友」。
**這一份只是清單，沒有刪任何檔**；刪由 LAWWW 統一做。查的是開發分支 `claude/adoring-meitner-mqzst8`（9df122c442 之後），方法：檔名 grep＋每個檔在 `src/*.js`、`src/data/*.js` 被誰引用。
「誰在用」只看得出哪些程式檔引用，**看不出那一段劇情是不是也要刪**——標「共用」的要 AA／LAWWW 判斷。

## 一、人物（3D 模型、立繪、建模腳本）

| 誰 | 3D 模型 | 立繪 | 建模腳本 | 誰在用 | 判斷 |
|---|---|---|---|---|---|
| 家豪 econ_jiahao | `assets/models/char/second_ai/bl_econ_jiahao.vrm` | `assets/portraits/econ_jiahao/campus/neutral.webp` | `tools/blender/char_second/jiahao*.py` | assets3d、character3d、story3d、characters、portrait_manifest | 只有經濟系 → 可刪 |
| 品瑜 econ_pinyu | `bl_econ_pinyu.vrm` | `portraits/econ_pinyu/` | 沒有專屬腳本（`npc_layered.py` 那一套） | 另有 econff／econfr／econsl／examlib／r3／vacfill／y2r2／bbpack／closed2 等 20 多個檔 | 只有經濟系那群，但引用很多 → 可刪，程式要一起清 |
| 唐睿 econ_tangrui | `bl_econ_tangrui.vrm` | `portraits/econ_tangrui/` | `tangrui*.py` 四支 | 同上（18 個檔） | 同上 |
| 韋綸 econ_weilun | `bl_econ_weilun.vrm` | `portraits/econ_weilun/` | `weilun*.py` 四支 | 同上（20 個檔，含 classes3d） | 同上 |
| 阿勳 econ_zhengxun | `bl_econ_zhengxun.vrm` | `portraits/econ_zhengxun/` | 沒有專屬腳本 | 同上（24 個檔，含 postgrad3d、r2y3b、greet_classday） | 同上；**大三以後的事件也有他**，要 AA 確認 |
| 魏教授 | `bl_prof_wei.vrm`、`glasses_wei.glb/.json` | 沒有 | `wei_clothes.py` | assets3d、character3d、characters | 經濟學原理老師 → 可刪 |
| 予樂 yule（可昕的政大室友） | 沒有 3D | `assets/portraits/yule/campus/` 三張 | — | yule3d.js、yule_lines.js、phone3d、feed3d、social3d、kxdrift3d、y2r2_3d 等 20 個檔；`wip_backup/yule520_1028.bundle` | 政大的人 → 照指示要刪；可昕改放法律系後她還是不是室友要 AA 定 |
| **可昕 kexin** | `bl_kexin.vrm` | `assets/portraits/kexin/campus/` 11 張、`assets/cg/kexin/` 9 張、`assets/cg/epilogue/cg_reunion_kexin.webp` | `tools/blender/char_second/kexin*.py` | — | **留著**（改放法律系）。CG 9 張＋重逢 CG 多半是交往／政大的畫面，哪幾張還能用要 AA 定 |

路人底模 `bl_npc_nf1～20／nm1～20`、坐著的替身、法律系同學（bohan、peishan、xinci…）是全校共用，**不能刪**。

## 二、3D 場景

| 東西 | 檔 | 誰在用 | 判斷 |
|---|---|---|---|
| 社科院圖書館一樓 soclib | `assets/models/env/second_ai/soclib_interior.glb/.json`、`soclib_interior_lm_day/night.webp`、`assets/models/env/views/soclib_{north,west}_{day,night}.webp`、`src/soclib3d.js`、`src/data/soclib_layout.js`、`src/data/econfr_soclib.js`；腳本 `tools/blender/env_second/soclib_interior.py`、`soclib_layout_gen.py`、`lightbake/bake_soclib.sh`、`lightbake/soclib_interior_lm.json`；`wip_backup/econsoclib_1030.bundle` | 區域 soclib；econfr_soclib＝經濟系朋友在那裡的站位 | 場景本身是校園的一棟樓，不是「經濟系的人」。**建議留場景、刪 econfr_soclib.js**；法律系會不會去要 AA／LAWWW 定 |
| 社科院圖書館二樓 soclib_2f | `soclib2f_interior.glb/.json`、`soclib2f_interior_lm_day/night.webp`、`src/soclib2f3d.js`、`src/soclib2f_people3d.js`、`src/data/soclib2f_layout.js`、腳本 `soclib2f_interior.py`、`soclib2f_layout_gen.py`、`lightbake/bake_soclib2f.sh`、`wip_backup/soclib2f/*.bundle` | 區域 soclib_2f | 同上 |
| 經濟系那一年的宿舍道具 | `assets/models/env/second_ai/aa_support/v0_dorm_props.glb/.json` | zones3d.js 宿舍（`econ` 為真才放）、dorm_room_layout.js `v0_props` | 只有經濟系 → 可刪（宿舍房間模型本身是共用的，不能刪） |
| 重考的家 | 沒有 3D 模型（`src/home3d.js` 用 2D 背景）、`src/data/retake_home.js`、`src/data/home_lines.js` | — | 場景是 2D，見第三節 |
| 木柵大學（政大） | **沒有 3D 場景**，全部是 2D 背景 | — | 見第三節 |
| 博雅 101、普通教室、校園、總圖 | 各棟 GLB | 全校共用（經濟系的課在博雅 101 上） | **不能刪** |

名字裡有 home 但無關的：`l118_home.*`＝118 巷「五湖四海」餃子店，**不能刪**。

## 三、2D 背景（`assets/bg/`）

| 類別 | 檔 | 誰在用（除了 outings3d.js、events.js） | 判斷 |
|---|---|---|---|
| 政大 | `nccu_campus`、`nccu_dorm`、`nccu_dorm_day`、`nccu_food`、`nccu_gate` | kxdrift3d、postgrad3d、y2r2_3d、y34b3d、multirel3d、pgdates3d、kx_moot3_3d、r2y3a／r2y4a／r2y4b／y2b 事件、arc_invites、group_events、termend_lines | 照指示刪；**引用遍及大二到畢業後**，程式要一起清 |
| 經濟系宿營 | `econ_camp`、`econ_camp_room`、`assets/cg/econ/cg_econ_camp.webp` | camp_y1.js | 只有經濟系 → 可刪 |
| 社科院（2D） | `soc_classroom`、`soc_hall`、`soc_library`、`soc_office`、`ntu_soc` | bbpack_events、pool_story_b2、r2y3a／r2y3b／r2y4a 事件、wz_events、kxdrift3d、y2r2_3d、y34b3d | **共用**（法律系同學池、大三大四也用）→ 不能整批刪 |
| 重考補習班 | `cram_class`、`cram_counter`、`cram_street` | `cram_class` 另有 home3d、v6b_3d、r2y4b、rom1016、termend_lines、vac_activities、retake_home | `cram_counter`、`cram_street` 只被 outings3d／events 引用 → 多半可刪；`cram_class` 另有 7 個檔引用（是不是都是重考那一段我沒有逐場看），要 LAWWW／AA 看 |
| 家 | `home_*` 16 張 | home3d、story3d、holff3d（過年）、jpprep、r2y4a、r3、sis_b13、twfill、aa720 | 引用的檔很多、不只 retake_home（有過年 holff3d、jpprep、r3、sis_b13…）→ **當共用，不整批刪**；哪幾張只給重考用要 LAWWW／AA 逐場看 |
| 經濟系那年（y0） | `y0_dumpling`、`y0_home_street_night`、`y0_lane_shop`、`y0_sea_blue`、`y0_sea_rain` | `y0_dumpling`（r2y3a）、`y0_lane_shop`（multirel3d）、`y0_sea_blue`（group_events、r2y4b）另有人用；`y0_home_street_night`、`y0_sea_rain` 只有 outings3d | 兩張可刪、三張**共用** |
| 高雄 | `kh_*` 18 張 | hometown_lines、y2r2_3d、r2y3a、r2y4a、fest_events | 高雄＝**可昕的縣市**（`hometown_lines.js`：寒暑假去高雄找她，要交往才有）。使用者說可昕「不是我女朋友」→ 這 18 張多半跟著不用了，但這是劇情判斷，**要 AA 定**；`kh_bus_day`、`kh_bus_station` 是經濟系 7/25 那一趟做的（ART-KH-BUS），只被 outings3d／events 引用 |

## 四、我這邊不再做的
- 經濟系、重考的家、木柵大學相關的場景和人物模型不再做新的（任務清單裡 SOCLIB-2F-1104 的後續、v0 宿舍、經濟系人物修改都停）。
- 可昕的 3D 模型照舊維護。

## 五、沒查到／不確定
- 企劃線（`claude/story-planning`）上的參考圖、AA 的建模素材沒有列（不在開發分支）。
- `tests/` 裡針對這些人和場景的測試沒有列（刪檔時會一起紅，LAWWW 清）。
- 「誰在用」是字串比對，檔名相近的可能有漏（例如用變數拼出來的路徑）。
