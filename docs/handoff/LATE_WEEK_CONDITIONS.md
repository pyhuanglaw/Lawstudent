# 第 15 週以後的條件（16 週制影響清單：程式部分）

> 自動產生：`node tools/handoff/late_week_scan.js`（2026-10-16 21:07 UTC）。給 AA-B 的八學期影響清單引用（AA_195 2-1）。
> 現況：每學期 18 週，期中第 8～9 週、期末第 17～18 週（`calendar.js` 的 `termOf`）。真實臺大 16 週：114-1 期末考 12/15～19、寒假 12/22 起（AA_195 1-2）。
> 只列法律系的學期（Y1S1～Y4S2）；經濟系那一年（Y0）不在這次的範圍。

## 1. 事件用週次判斷（`events.js` 的 weeks／minWeek ≥ 15）：22 件

| 事件 | 標題 | 學期 | 週次 |
|---|---|---|---|
| `ev_zhiruo_secret` | 十點的電話 | Y1S2 | 12、13、14、15、16、17、18 |
| `ev_an_report_split_late` | 民總的報告（分組那天你沒來） | Y1S1 | 6、7、8、9、10、11、12、13、14、15、16 |
| `ev_sk05_vending_y1` | 三閃，販賣機見 | Y1S2 | 17、18 |
| `ev_xmas_exchange` | 聖誕交換禮物 | Y1S1 | 17 |
| `ev_mingxuan_tutor_intro` | 家教的弟弟 | Y1S2 | 3、4、5、6、7、8、9、10、11、12、13、14、15、16、17、18 |
| `ev_yutong_landlord` | 房東來過了 | Y1S2 | 10、11、12、13、14、15、16、17、18 |
| `ev_revisit_y1_kexin` | 重訪日 | Y1S2 | 18 |
| `ev_revisit_y1_noodle` | 重訪日 | Y1S2 | 18 |
| `ev_revisit_y1_single` | 重訪日 | Y1S2 | 18 |
| `ev_sis_sticky_notes` | 她改的便條 | Y1S2 | 17 |
| `ev_sis_sticky_notes_late` | 她改的便條 | Y1S2 | 17、18 |
| `ev_peishan_tutoring` | 課輔班的下午 | Y1S2 | 5、6、7、8、9、10、11、12、13、14、15、16、17、18 |
| `ev_yu_sign_soymilk` | 剛好路過 | Y1S2 | 14、15、16 |
| `ev_yu_sign_seat` | 她每次都坐阿哲旁邊 | Y1S2 | 14、15、16 |
| `ev_yu_sign_question_club` | 阿哲是不是對每個人都這麼好 | Y1S2 | 14、15、16 |
| `ev_yu_sign_question_arcade` | 阿哲是不是對每個人都這麼好 | Y1S2 | 14、15、16 |
| `ev_grad_seniors_y1` | 學長姊畢業 | Y1S2 | 15 |
| `ev_xinci_second` | 第二名 | Y2S1 | 14、15、16、17、18 |
| `ev_bohan_scores_month` | 讀書會 | Y2S2 | 6、7、8、9、10、11、12、13、14、15、16、17、18 |
| `ev_zhiruo_film_night` | 週末看片 | Y1S2 | 12、13、14、15 |
| `ev_fangyt_hint` | 隔壁房的人記得的事 | Y1S2 | 16、17、18 |
| `ev_ziqing_secret_game` | 她在做的東西 | Y1S2 | 11、12、13、14、15、16、17、18 |

## 2. 事件裡寫死的日期，落在第 15～18 週：1 筆
改 16 週以後，第 17、18 週的日子變成寒暑假（原本的期末週）。

| 事件 | 標題 | 日期 | 學期 | 現在第幾週 |
|---|---|---|---|---|
| `ev_yu_together` | 在一起 | 2026-12-19 | Y2S1 | 15 |

## 3. 活動（`activities.js` 的 weeks ≥ 15）：7 個

| 活動 | 學期 | 週次 |
|---|---|---|
| `club_debate` 辯論社社課 | Y1S1 | 5、6、7、10、11、12、13、14、15、16 |
| `club_hiking` 登山社行前會 | Y1S1 | 5、6、7、10、11、12、13、14、15、16 |
| `club_guitar` 吉他社社課 | Y1S1、Y1S2、Y2S1、Y2S2 | 5、6、7、10、11、12、13、14、15、16 |
| `lawclub_study` 法服讀書會 | Y1S1、Y1S2、Y2S1、Y2S2 | 5、6、7、10、11、12、13、14、15、16 |
| `public_law_group` 公法讀書會 | Y1S2、Y2S1、Y2S2 | 12、13、14、15、16 |
| `lawclub_review_y1s2` 法服學期檢討會 | Y1S2 | 17 |
| `dept_basketball` 系籃練球 | Y1S1 | 5、6、7、10、11、12、13、14、15、16 |

## 4. 階梯聊天（`ladder.js`，BB 的）裡 week ≥ 15 的步驟：7 個

| 人物 | 步驟 | 學期 | 週次 |
|---|---|---|---|
| heroine_01 | `A-L5` |  | 4～18 |
| heroine_01 | `A-L8` |  | 8～18 |
| heroine_01 | `A-L10` |  | 14～18 |
| heroine_03 | `Y-L6` |  | 6～18 |
| kexin | `K-L4` |  | 4～18 |
| kexin | `K-L6` |  | 7～18 |
| kexin | `K-L8` |  | 14～18 |

## 5. 課綱（`syllabus.js`，BB 的）有第 15～18 週內容的課：39 門
每門課現在排到第 18 週；改 16 週要把第 15～18 週合併或刪掉（期末考週照 calendar）。

| 課 | 有內容的晚週 | 總週數 |
|---|---|---|
| `civ_general` | 15、16 | 14 |
| `crim_gen1` | 15、16 | 14 |
| `const_1` | 15、16 | 14 |
| `ge_film_y1s1` | 15、16 | 14 |
| `econ_principles_1` | 15、16 | 14 |
| `const_2` | 15、16 | 14 |
| `crim_gen2` | 15、16 | 14 |
| `oblig_gen1` | 15、16 | 14 |
| `ge_y1s2` | 15、16 | 14 |
| `econ_principles_2` | 15、16 | 14 |
| `admin_law` | 15、16 | 14 |
| `crim_spec` | 15、16 | 14 |
| `property` | 15、16 | 14 |
| `oblig_gen2` | 15、16 | 14 |
| `ge_y2s1` | 15、16 | 14 |
| `oblig_spec` | 15、16 | 14 |
| `family_law` | 15、16 | 14 |
| `admin_remedy` | 15、16 | 14 |
| `legal_english` | 15、16 | 14 |
| `ge_y2s2` | 15、16 | 14 |
| `civpro_1` | 15、16 | 14 |
| `crimpro` | 15、16 | 14 |
| `company_law` | 15、16 | 14 |
| `securities` | 15、16 | 14 |
| `civpro_2` | 15、16 | 14 |
| `insurance` | 15、16 | 14 |
| `negotiable` | 15、16 | 14 |
| `labor_law` | 15、16 | 14 |
| `enforcement` | 15、16 | 14 |
| `legal_ethics` | 15、16 | 14 |
| `ip_law` | 15、16 | 14 |
| `labor_social` | 15、16 | 14 |
| `tax_law` | 15、16 | 14 |
| `crim_judgment_sem` | 15、16 | 14 |
| `public_judgment_sem` | 15、16 | 14 |
| `legal_research` | 15、16 | 14 |
| `maritime` | 15、16 | 14 |
| `japanese_1` | 15、16 | 14 |
| `japanese_2` | 15、16 | 14 |

## 5b. 程式和資料裡寫死的日期（'YYYY-MM-DD'），落在第 15～18 週：10 處

| 檔案:行 | 日期 | 學期 | 現在第幾週 |
|---|---|---|---|
| `src/story3d.js:1539` | 2026-12-18 | Y2S1 | 15 |
| `src/story3d.js:1539` | 2026-12-19 | Y2S1 | 15 |
| `src/story3d.js:1667` | 2026-12-24 | Y2S1 | 16 |
| `src/story3d.js:1668` | 2026-12-31 | Y2S1 | 17（16 週制是假期） |
| `src/story3d.js:2437` | 2028-01-07 | Y3S1 | 18（16 週制是假期） |
| `src/story3d.js:2437` | 2028-01-08 | Y3S1 | 18（16 週制是假期） |
| `src/story3d.js:2437` | 2028-01-08 | Y3S1 | 18（16 週制是假期） |
| `src/data/characters.js:16` | 2028-01-08 | Y3S1 | 18（16 週制是假期） |
| `src/data/characters.js:47` | 2028-01-05 | Y3S1 | 18（16 週制是假期） |
| `src/data/events.js:2611` | 2026-12-19 | Y2S1 | 15 |

## 6. 程式裡用第 15～18 週換算日期（`termDay(學期, 週, 星期)`）：18 處

| 檔案:行 | 學期 | 週 |
|---|---|---|
| `src/story3d.js:762` | Y2S2 | 17 |
| `src/story3d.js:1203` | Y1S1 | 18 |
| `src/story3d.js:1269` | Y1S1 | 16 |
| `src/story3d.js:1329` | Y1S1 | 16 |
| `src/story3d.js:1373` | Y1S1 | 17 |
| `src/story3d.js:1376` | Y1S1 | 17 |
| `src/story3d.js:1378` | Y1S1 | 17 |
| `src/story3d.js:1381` | Y1S1 | 18 |
| `src/story3d.js:1392` | Y1S1 | 18 |
| `src/story3d.js:1401` | Y1S2 | 18 |
| `src/story3d.js:1414` | Y1S2 | 18 |
| `src/story3d.js:1708` | Y1S2 | 16 |
| `src/story3d.js:1727` | Y1S2 | 15 |
| `src/story3d.js:1733` | Y1S2 | 17 |
| `src/story3d.js:1762` | Y1S2 | 17 |
| `src/story3d.js:1812` | Y1S2 | 18 |
| `src/story3d.js:1884` | Y1S1 | 15 |
| `src/data/events.js:1174` | Y1S2 | 17 |

## 7. 程式裡寫死的週次比較（week ≥／≤／＝ 15～18）：13 處

| 檔案:行 | 寫法 |
|---|---|
| `src/encounter3d.js:35` | `week>=17` |
| `src/encounter3d.js:35` | `week<=18` |
| `src/story3d.js:403` | `week<=15` |
| `src/story3d.js:848` | `week<=18` |
| `src/story3d.js:1492` | `week<=16` |
| `src/story3d.js:1690` | `week===17` |
| `src/story3d.js:1690` | `week===18` |
| `src/story3d.js:1735` | `week<=17` |
| `src/story3d.js:1987` | `week>=15` |
| `src/story3d.js:1987` | `week<=16` |
| `src/story3d.js:2256` | `week<=16` |
| `src/data/calendar.js:57` | `week>=17` |
| `src/data/events.js:195` | `week>=18` |

## 8. 日曆本身（`src/data/calendar.js`）
- `TERMS` 每學期 `weeks:18`；`termOf` 的期中寫死第 8～9 週、期末 `week>=17`。改 16 週：weeks 改 16、期末改第 16 週（期中留第 8～9 週，AA_195 第 3 節）。
- 存檔存絕對天數；學期、週次每次重算（遷移風險見 AA-B 對話 2026-10-16 21:05 LAWWW-B 的回答）。
