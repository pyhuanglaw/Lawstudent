# 劇情對話裡會變成黑底的場景（2026-10-24，LAWWW2-B）

- **怎麼找到的**：做 D99 路線巡查①（寒暑假）時，順便查臺北的家的 2D 背景。家用到的背景都在、圖都有。
- **怎麼查**：
  - 開發 `6fd1eda5f`。在遊戲裡把 `OUT.BG` 的 223 個背景逐一 `fetch`：0 張缺檔；5 個登記了但沒有圖（`car`、`wenzhou`、`hwaxin_street`、`vet_clinic`、`vf_lantern`），會顯示深色底＋地點字幕。
  - 再掃 `src/` 所有 `bg:'…'`。
- **程式的行為**：劇情台詞的 `scene` 行是用 `OUT.bg(l.bg)` 換背景（`events3d.js` 第 111 行），`OUT.bg` 查不到就回傳 `'dark'`。
- **不算的**：`vac_activities.js` 回國重逢用的 `campus`、`cafe`、`noodle`、`wancai`、`bookstore` 是走進 3D 區域，不是 2D 背景；`dark` 是故意的；`zq_testbuild3d.js` 是測試用。

## 會變黑底的 13 段

| 鍵名 | 場景字幕 | 事件 | 位置 | 建議 |
|---|---|---|---|---|
| `ntu_library_night` | 總圖・門口 | `ev_sis_nye_y3` | `src/data/sis_b10_events.js:37` | **現成的圖**：`OUT.BG` 加一個別名指到 `library_gate_night`（同一個地方、晚上） |
| `ntu_library_rain` | 總圖・門口 | `ev_sis_y3s2_rain` | `src/data/sis_b9_events.js:24` | 先用 `library_gate_night`（要看那一場是不是晚上）；要下雨的版本要新做 |
| `cafe` | 兩點半 Café | `ev_sis_course_y2` | `src/data/sis_b8_events.js:21` | 遊戲裡的 3D Café 拍成 2D 背景（白天） |
| `cafe_night` | 兩點半 Café | `ev_sis_ex_2` | `src/data/sis_b10_events.js:97` | 同上（晚上） |
| `cafe_window` | 兩點半 Café・窗邊 | `ev_an_notebook` | `src/data/r2y3b_events.js:455` | 同上（窗邊的位子） |
| `cafe_closed` | 兩點半 Café（店休） | `ev_zhiruo_twelve_slips` | `src/data/r2y3b_events.js:482` | 同上（燈關一半、椅子倒扣） |
| `law_library` | 法圖・二樓 | `ev_sis_ex_1` | `src/data/sis_b10_events.js:90` | 遊戲裡的法圖二樓拍成 2D 背景 |
| `zuiyue_night` | 醉月湖 | `ev_sis_nye_y2` | `src/data/sis_b10_events.js:26` | 遊戲裡的校園醉月湖晚上拍 |
| `alley_conv_night` | 巷口的便利商店前 | `ev_sis_nye_y4` | `src/data/sis_b10_events.js:48` | 溫州街的日日便利晚上拍（要確認是哪一家） |
| `us_shared_kitchen` | C 棟 208 | （`us_life_events.js`） | `src/data/us_life_events.js:174` | 已知（`us208_3d.js` 第 10 行）：208 的 3D 廚房拍成 2D 背景 |
| `us_club_lawn` | 會所 | （`us_life_events.js`） | `src/data/us_life_events.js:146` | 美國社區的會所前草地（3D 社區有會所外面的話就拍） |
| `community_room` | 社區活動中心・小房間 | `ev_sis_interview2` | `src/data/sis_y2y3_events.js:141` | 沒有 3D；要新做（Blender） |
| `botanical_lotus` | 植物園・荷花池 | `ev_sis_lotus` | `src/data/sis_b4_events.js:155` | 已知：BB 跟使用者要圖 |

## 誰改什麼（等 LAWWW-B 排）

- `OUT.BG` 在 `src/outings3d.js`（LAWWW）：別名、新背景的登記。
- 新的 2D 背景（1672×941 webp，和現有的一樣）：LAWWW2 可以從遊戲的 3D 拍，或用 Blender 做。
- 學姊線的背景要不要讓 BB 看過再用：照 D59，角色以外的美術是使用者驗收。
