# 總圖一樓、二樓第四版（LIB-PLAN-1103）：照使用者給的樓層平面圖重排——交件（READY_FOR_REVIEW，11-03 12:2x）

- **起因**：使用者 11-03 09:0x「我還給你總圖每個樓層的位置圖 你至少弄得像一點吧」「總圖 系館最優先」（UA-LAWWW2-1103-02）。平面圖：`docs/art-rebuild/second_ai/ref/lib1102_user/0858_plan_1f.png`、`0858_plan_2f.jpg`。
- **對照圖**（平面圖／遊戲改前／遊戲改後，配置的俯視圖）：`plan_vs_game_1F.jpg`、`plan_vs_game_2F.jpg`。
- **patch**：`library_v4_1103.patch`，**接在開發分支最新版 `0527e6ebc`**（`git apply -3` 後重跑相關 33 支 Node 單元測試 ALL PASS）。不含 assets：`library_hall_v2.glb`＋`_lm_day/_night.webp`（第四版烘焙）、`library_3f_v2.glb` 從本分支 `claude/second-ai-env-art` 的 `assets/models/env/second_ai/` 拿。內容＝展演廳第三版（BB_244）＋3F 第二版（LIB-3F-1102）＋這次的一樓二樓第四版；配置由 `tools/blender/env_second/library_hall_v2_layout.py` 產生（`plan_1f_v4`、`plan_2f_v4`）。

## 一樓（照平面圖）
| 平面圖 | 改前（第三版） | 改後（第四版） |
|---|---|---|
| 總服務台：閘門北邊、主走道東側 | 門廳東邊 (7.8, 4.4) | **(3.0, 1.0)**（閘門四道往北都走得過去） |
| 辦公室：西南 | 東南 | **西南隔間**（x −11.9～−7.6、z 4.6～9），館員辦公室的門（id 照舊 `staff`）搬過去 |
| 入口東側：校友中心、視聽室 166-1～3 | 館員辦公室 | **校友中心＋視聽室 166-1～3**（關著的門，有說明） |
| B1 樓梯：入口門禁兩旁 | 大廳西牆 z −2.4 | **門廳西牆 (−5.05, 6.2)**，不用過閘門就能下 B1 24 小時自習室；從 B1 上來站在 (−3.4, 6.2) |
| 多元共享區（西）：很多桌子 | 四人桌 4 張 | 四人桌 **6 張**＋閱報區照舊 |
| 數位媒體區（東）：東牆影片櫃、中間十字形的音樂光碟（橘）／公播版影片（綠） | 電腦桌 3 排＋一小段影片櫃 | 東牆影片櫃拉長到 8.4 m、**兩組十字形影音櫃**、電腦桌照舊 |
| 台階書牆、展演廳 | ✓ | 照舊 |
| 電梯 | 東側 | **照舊在東側**（平面圖在西側；電梯井和 3F、5F 書庫、B1 共用，搬了要整棟一起動，這一版先不動） |

## 二樓（照平面圖）
| 平面圖 | 改前 | 改後 |
|---|---|---|
| 西半邊：黃色「人社中日韓文圖書」南北向一排一排 | 東西向 3 座 | **南北向 4 座**（北半邊三排＋長桌和中庭之間一排） |
| 東半邊：藍色「人社西文圖書」南北向、紫色「藝術資料」 | 東西向 2 座 | **南北向 6 座**：紫色藝術資料 2 座、藍色 4 座；中間留往 3F 樓梯間的東西向走道 |
| 靠西牆的閱覽座位 | 長桌 4 張 | 照舊（小安「總圖的下午」的座位不動，座位順序不變） |
| 討論室 225、226、展示區 | ✓ | 照舊 |

## 劇情／程式要注意的座標（給 LAWWW）
- `desk`（服務台）：(7.8,4.4) → (3.0,1.0)。館員站位讀配置（story3d.js），不用改。
- `b1Door`：(−11.8,−2.4) 西牆 → (−5.05,6.2) 門廳西牆（`wall:'vestibule'`）；spawn (−10.1,−3.1) → (−3.4,6.2)。`library_hall_v2.js`、`library3d.js`：B1 的門在門廳時外牆的窗照舊（一行）。`library_b1_unit` 改成兩種位置都接受。
- `doors.staff`：(10.8,5.7) → (−9.6,4.55)；新門 `alumni`、`av1`～`av3`（關著）。
- `story3d.js`：一樓走動的背景路人路線（舊的四個點有三個被新家具佔掉）改成新空地；舊配置照舊。
- 二樓書架改南北向：`stack` 多一個 `ry`（≈90° 是南北向），`library_hall_v2.js` 的備用模型和導航、Blender 都處理了。

## 測試（雲端；Node）
`nav_buildings`（含總圖 82 個互動點都走得到、閘門四道）、`library_hall_v2_oldsave`、`library_upper`、`library_b1`、`b1story`、`aa379_sis_lib`、`library_copier`、`library_media`、`library_hall_cam_core`、`library_hall_lightmap`、`libq_aa_1102`、`libq_out_1102`、`library_3f_v2` ALL PASS。背景路人的新路線四段模擬走路都走得到。

## 測試（雲端；Playwright 手機模擬，實機沒測）
- 瀏覽器（`3670b96eb`＋patch，一支一支跑）：flow_library_floors、flow_library_scene、seats_on_furniture（library_hall 74 座、library 44 座，有問題 0）、reachability_all（library_hall、library、library_b1）、flow_lib_tour **全部 ALL PASS**。
  - flow_lib_tour 前兩次 FAIL 的原因與修法：①導覽第 2 站「借書、還書……都在這裡問」還在第三版服務台的位置 (7.8,3.2)——**遊戲的 bug**，`classes3d.js` 改成讀配置的服務台（第四版 (3.0,−0.3)，第三版照舊 (7.8,3.2)）；②測試每 1.2 秒輪詢畫面字幕，跟著館員走的那段（20～118 秒）看不到只顯示 5 秒的話——**只改測試的觀察方式**：記下 `GAME.caption` 每一句，判定照舊（七站的話依序都出現）。第三次 ALL PASS。
  - 觀察：二樓南北向書架很高，鏡頭在後面時「點地面」常點到書架（測試改用搖桿推過去才跟上）；實際玩用搖桿沒問題，點地面的玩家可能要轉一下鏡頭。
- Node：`3670b96eb`＋patch 跑整套 180 支 ALL PASS（blackforest_unit 不在這個分支＝不適用）；`0527e6ebc`＋patch 相關 33 支 ALL PASS。
  - `aa498_pool_unit` 原本寫死 3F 第一版的窗邊座位 (5.6,−3.9)，改成第二版的窗邊座位 (10.55,1.6)（洪珮瑜「坐窗邊那一排」照舊）。

## 進度（11-03 09:5x）
- 光照烘焙完成（lm_probe 10 個點 ALL PASS）；模型、光照貼圖在本分支 `assets/models/env/second_ai/library_hall_v2*`（三角形 7.6 萬 → 10.9 萬，多的是照平面圖加的書架；檔案 6.6 → 9.8 MB）。
- 遊戲內截圖（14:00，7 個鏡頭）：`game_v4_14h_contact.jpg`。
- 總圖相關 Node 單元測試 20 支 ALL PASS（烘焙後）。

## 還沒做
- （已完成）瀏覽器測試（flow_library_floors、flow_library_scene、flow_lib_tour、reachability_all、seats_on_furniture）→ 交 LAWWW、BB。
- 3F、B1 的平面圖對照圖。
