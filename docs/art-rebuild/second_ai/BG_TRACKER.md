# 2D 劇情背景追蹤表（黑畫面 → 有圖）｜LAWWW2-B 維護

> 依使用者 2026-10-16 正式施工指示第二節：開發分支 `src/outings3d.js` 的 `S.BG` 有 20 個 `image:null`，事件都在用（玩家看到深色底＋地點字幕）。全部納入製作。
> 分類（使用者訂）：
> - **A** 已有遊戲 3D 場景 → 取鏡頭算圖；
> - **B** 已有可重用的背景圖 → 直接重用或做日夜版；
> - **C** 有現成模型或構件 → 組合製作；
> - **D** 必須新增 → 列缺的素材與規格。
>
> 優先順序＝劇情實際出現的順序，大一上、大一下先做。
> 劇情用途（時間、站位、視角）由 LAWWW-B 向 AA-B 確認；人物外觀由 BB-B 核對；鏡頭、光線、構圖、製作由 LAWWW2-B 決定。
> 共用總表 `docs/HANDOFF_GAP_MATRIX.md`（LAWWW-B 管理）記任務 ID、狀態、阻礙、下一步；這份記技術細節。

## 狀態

`TODO` → `WIP` → `READY_FOR_ART_REVIEW`（已交 LAWWW-B）→ `INTEGRATED`（LAWWW-B 接上、遊戲內截圖）→ `ART_APPROVED`（使用者）

| ID | key（字幕） | 用的事件（開發分支 events.js） | 學期 | 類別 | 做法 | 狀態 |
|---|---|---|---|---|---|---|
| BG-01 | riverside（河濱） | ev_mid_autumn_bbq 中秋烤肉（L439）、ev_nye_river 跨年（L756） | 大一上 | **C** | 河濱公園：草地、自行車道、堤防、遠處的橋與城市；樹、路燈、長椅用現有模型；中秋（傍晚）、跨年（夜）兩個時段 | TODO：要 AA-B 確認是哪一條河（新店溪？景美溪？） |
| BG-02 | gongguan_luwei（公館・滷味攤） | ev_midterm_supper 考完的宵夜（L525） | 大一上 | **C** | 公館店面街 GLB（已有的「滷味・鹹酥雞」那一間 G05）＋晚上＋攤車、塑膠椅 | TODO |
| BG-03 | nccu_campus（政大・校園裡的路） | ev_kexin_yule_pass（L418） | 大一上 | **D**（已做） | `bg_nccu.py campus` | WIP：第四版正式圖算圖中（山改成樹卡） |
| BG-04 | nccu_dorm（政大・宿舍） | ev_kexin_yule_pass（L424；字幕寫「政大・宿舍樓下」） | 大一上 | **D** | 自強十舍樓下有長椅的角度 | 等使用者照片 |
| BG-05 | dorm_roof（宿舍頂樓） | ev_nye_roof 跨年（L767） | 大一上 | **C** | 男一舍的套件建築沒有頂樓；用 Blender 做頂樓（女兒牆、水塔、冷氣主機），遠景接校園／公館的夜景 | TODO |
| BG-06 | home_living（臺北・家裡的客廳） | LAND_Y1 除夕（L46）、home3d.js 週末回家 | 大一上寒假起 | **D**（已做） | `bg_home.py living`：平常（主圖）、除夕、白天三版 | WIP：腳本完成，正式圖待算 |
| BG-07 | home_balcony（臺北・家裡的陽台） | LAND_Y1（L61） | 大一上寒假 | **D**（已做） | `bg_home.py balcony` | WIP：腳本完成，待試算 |
| BG-08 | car（車上） | ev_kexin_trip_spring_y1 春假開車旅行（L843、L866） | 大一下 | **D** | 祐廷家的車（AA_12：家裡安排的車）車內：前座、儀表板、擋風玻璃外的路（白天出發、晚上回程兩版）；新做車內模型 | TODO |
| BG-09 | trip_sea（海邊） | 同上（L848） | 大一下 | **B** | 候選：約會底圖 D25 外澳（夕陽）——要 AA-B 確認地點能用 | 待確認 |
| BG-10 | trip_oldtown（老街） | 同上（L854，「別的城市的老街」） | 大一下 | **B** | 候選：D18 九份（黃昏）——要 AA-B 確認 | 待確認 |
| BG-11 | trip_mountain（山上） | 同上（L860，「山上看星星」） | 大一下 | **B** | 候選：D09 貓空（黃昏）做夜晚＋星空版——要 AA-B 確認 | 待確認 |
| BG-12 | seaside_town（春假・海邊的小鎮） | ev_noodle_trip_spring_y1（L874，坐火車去） | 大一下 | **B** | 候選：D13 淡水（夕陽）——要 AA-B 確認 | 待確認 |
| BG-13 | wenzhou_tutoring（溫州街・課輔班門口） | ev_peishan_tutoring（L992，term Y1S2） | 大一下 | **A** | 溫州街正式 GLB：選一棟一樓改成課輔班門口（招牌虛構） | TODO |
| BG-14 | yongkang_curry（永康街・咖哩店） | ev_family_dinner 家族聚餐（L978） | 大一下 | **C** | 店名照 D77；店面＋室內用 Café／麵店的構件 | TODO：查證永康街的咖哩店（不寫真名） |
| BG-15 | ntu_soc（台大・社科院門口） | ev_kexin_visits_ntu（L1074） | 大一下 | **A** | 社科院正式 GLB 取鏡頭 | TODO |
| BG-16 | ntu_linze（台大・霖澤館前） | 同上（L1079） | 大一下 | **A** | 霖澤館正式 GLB 取鏡頭 | TODO |
| BG-17 | ntu_avenue（台大・椰林大道） | 同上（L1087） | 大一下 | **A** | 椰林大道（遊戲校園）取鏡頭 | TODO |
| BG-18 | video（視訊） | ev_kexin_video_study（L1099）、ev_kexin_grades_open（L1149） | 大一下 | **A** | 祐廷宿舍書桌＋筆電（宿舍 GLB＋desk_props）；視訊畫面本身是 UI（LAWWW-B） | TODO：問 LAWWW-B 背景要的是哪一邊 |
| BG-19 | gongguan_cinema（公館・二輪戲院） | ev_zhiruo_early_show（L1243） | 大一下 | **C** | 公館的二輪戲院（店名照 D77），門口、售票口、海報（海報不放真實電影） | TODO：查證 |
| BG-20 | soymilk_shop（豆漿店） | 同上（L1243） | 大一下 | **C** | 台式早餐店：店面用街屋構件，室內用麵店構件（不鏽鋼台、豆漿桶、燒餅爐） | TODO |

## 先做的順序

1. **大一上**：
   - BG-03、BG-06、BG-07（已在做）；
   - BG-01（河濱，兩個事件、兩個時段）；
   - BG-02（滷味攤）；
   - BG-05（宿舍頂樓）；
   - BG-04（等照片）。
2. **大一下**：
   - A 類最快：BG-15、BG-16、BG-17、BG-13、BG-18；
   - B 類等 AA-B 一句話：BG-09～12；
   - C 類：BG-19、BG-20、BG-14；
   - D 類：BG-08（車內）。

## 給 LAWWW-B／AA-B 的問題

- BG-01：河濱是哪一條河？中秋烤肉、跨年同一處嗎？
- BG-09～12：春假的海邊、老街、山上、海邊小鎮可以用約會底圖 D25、D18、D09、D13 嗎？會不會和之後同一地點的約會撞到？BB-B 也要知道。
- BG-18：「視訊」背景要的是祐廷這邊（宿舍書桌），還是可昕那邊？
- BG-04：字幕「政大・宿舍樓下」和 label「政大・宿舍」要統一。
