# 美國交換篇 3D 場景施工計畫（LAWWW2-B，2026-10-16）

> ## ⚠ 使用者 2026-10-16 更正（P0，以這一節為準）
> 「美國宿舍不能沿用。美國宿舍我是住在自己租的社區（使用者給了社區官網）。我租單人房，有自己房間、客廳、廚房。」
> 「你跟 AA 說：如果他原本規劃的不是這樣，他也要改，可以請他問我。」
> - 美國的住處 ＝ **校外學生公寓社區的單人房（1x1：臥室＋客廳＋廚房＋衛浴＋陽台）**。不是學校宿舍，沒有公用廚房、交誼區。
> - 已轉告 AA-B（P0）、LAWWW-B（P0），兩則都送達。學姊住哪裡、US2 在誰的廚房、US1 抵達後的流程、香港朋友的段落，由 AA-B 依使用者指示改企劃（有疑問直接問使用者）。
> - 查證（只取特徵，**遊戲裡不寫真實社區名**，D77）：
>   - 布魯明頓東邊，三層樓、約 180 戶的學生公寓社區；
>   - 1x1 約 613 平方英尺（約 57 m²）；
>   - 花崗石流理台、烤箱、微波爐、洗碗機、屋內洗衣機與烘衣機、陽台、吊扇；
>   - 社區有健身房、游泳池、烤肉區、24 小時櫃台、門禁；旁邊是自然保護區步道、購物中心；搭公車去校園。
>   - 官網連不上，外觀與格局照片都沒有看到，**格局是依 1x1 的典型配置推估**。使用者如果願意提供照片（外觀、室內），照照片改。
>   - **同一天使用者給了三張照片（客廳、社區外觀、廚房吧台）→ 配置改成 v2**：大門外是戶外樓梯平台（不是室內走廊）、廚房獨立＋窗口吧台、窗和陽台門同一面牆、家具照照片。特徵整理在 `research/us_apartment_photos.md`（原圖是社區宣傳照、看得到門牌，沒放進 repo）；俯視圖 `test_shots/us_apartment/layout_v2_plan.png`。浴室從哪裡進還在問使用者。
> - 新的配置提案：`src/data/us_apartment_layout.js`（取代原本的 us_dorm_layout，已刪）。
> - **下面第 0～5 節原本寫的「交換宿舍、公用廚房、交誼區」都改成「公寓單人房」**。批次 1 改為：
>   - 1a 公寓單人房室內＋門外的戶外樓梯平台（3D，可以走；v2）；
>   - 1b 社區門口（大樓入口、停車場、公車站）：一小段 3D 或 2D，等外觀照片或 AA-B 的流程再定。
>   - 超市在購物中心那一帶（離公寓近），校園要搭公車。
> - 原本第 4 節的 Q1（學姊住哪裡）、Q2（單人或雙人房）作廢：Q2 已由使用者回答；Q1 改問「學姊住哪裡、US2 在哪裡」。

> **指令**：使用者 2026-10-16 正式指示「美國交換篇 3D 場景納入施工，不要只停在需求盤點」。要做三個場景：交換宿舍、美國校園街道、美式大型超市。
> 目標：「最後真的能在遊戲裡走進宿舍、遇到學姊、去公用廚房、走在美國校園，經歷那半年的生活。」
> 分工：
> - LAWWW-B 決定正式整合順序，負責區域程式、導航、事件。
> - LAWWW2-B 負責模型規格、製作、截圖、交付。
> - 場景用途和 AA-B 確認，人物造型和 BB-B 核對。
> - 已確定的結構先做，沒確定的事件互動區保留可調整。
>
> 企劃依據：
> - 開發分支 `docs/PROJECT_DECISIONS.md` D47；
> - `場景清單_給開發組.md` §D；
> - `BB_98_交接包v4_大三.md` §2-7（US1）、§2-8（US2）；
> - `交接包_v4_大三_骨架.md`、`交接包_v4_交付清單.md`；
> - `溫書瑀_角色企劃` §8；
> - `cg_approved/README`（BCG-14、BCG-32）；
> - `BB_117` §4b、§4e。
>
> 摘要是查詢代理整理的，出處在 `ASSET_AUDIT_2026-10-16.md` 之後的對話紀錄。實作前我會再讀一次原文。

## 0. 已經定案、要照做的（從企劃）

| 事項 | 內容 |
|---|---|
| 參考 | 印第安納大學布魯明頓校區（D47：「動工前先查 IU 布魯明頓的參考照片」）。**不寫校名、不畫校徽**（BB_98、BB_117、D77） |
| 季節 | 1 月中抵達（冬天傍晚、薄雪、「下午四點就沒太陽」）→ 2 月深夜下雪 → 3 月湖面還結冰 → 春天。**場景要有「雪」和「春」兩套** |
| 宿舍 | 自己的房間＋公用廚房＋交誼區（D47） |
| 公用廚房（US2，第 4～5 週週五晚上 23 點） | 學姊煮兩包泡麵。要有：電磁爐、鍋、紅黃兩包無字泡麵、長筷子、2～3 個碗、紅筆圈滿的英文報告、**高腳椅**、冰箱（門上貼便條）、窗外下雪（BCG-32 已通過，3D 要和 CG 一致）。交往中的版本，香港朋友會來倒水 |
| 超市（US1 後半段，第 1 週抵達那天傍晚） | 學姊教看雞蛋日期（**蛋的冷藏櫃**）、在**零食區**停很久、拿一包貴三倍的**台灣泡麵**（亞洲食品）。有時是學姊＋香港朋友＋一群人。**店名虛構**（D77：真實 → 遊戲名對照表、不畫商標、不照抄品牌配色） |
| 範圍 | 「不做完整的海外地圖」「校園一小段」「美國只有一小段 3D」。機場、巴士站、上課、中餐館、車內是 2D；湖邊、小教堂台階、送機是 CG |

查證（使用者規則：真實地方要查，不要虛構）：
- 布魯明頓校區的建築大多是**印第安納石灰岩（Salem Limestone）**，風格是 **Collegiate Gothic**：尖拱門、拱形窗、扶壁、陡的石板屋頂。少數是紅磚。
- 校門是**石灰岩的哥德式拱門**，有尖拱和扶壁，1987 年建，位在主街 Kirkwood 和 Indiana Ave 的路口。
- 主街長八個街區，連到市中心，兩旁是餐廳、小店、酒吧。
- 新的宿舍每層有**完整的公用廚房**和交誼廳，有單人房，也有雙人房。
- 遊戲裡只取這些**特徵**，不照抄任何一棟真實建築，也不放任何名字。來源見文末。

## 1. 分批施工順序與每批交付物

| 批次 | 內容 | 交付物 | 開始條件 |
|---|---|---|---|
| **0 前置（現在開始）** | 共用材質與道具：石灰岩、美式紅磚、雪、冬天的落葉樹（楓、橡，落葉＋積雪／春天新葉）、美式路燈、長椅、腳踏車架、消防栓、雪堆、暖氣片 | Poly Haven 貼圖（**已下載 12 種**：white_sandstone_bricks、large_sandstone_blocks、castle_brick_02_white、red_brick_03、laminate_floor_02、linoleum_brown、floor_tiles_06、concrete_floor_painted、asphalt_02、snow_02、grass_ground、withered_grass）；`us_props.glb`（道具）；`street_trees.py` 加楓樹、橡樹 | 無 |
| **1 ~~交換宿舍（一層樓）~~ → 公寓單人房（見最上面的更正）** | 自己的房間、走廊、**公用廚房**、交誼區、樓梯間出口；窗外雪景／春景 | ① `src/data/us_dorm_layout.js`（**配置提案**：牆、門、家具阻擋、座位、互動點、出生點。遊戲導航和 Blender 讀同一份，LAWWW-B 確認後採用）<br>② `tools/blender/env_second/us_dorm.py` → `assets/models/env/second_ai/us_dorm_interior.glb`（＋`.json`）：會淡出的牆照約定 `WALL_<side>_*`；US2 用的泡麵、鍋、碗、報告是獨立節點，事件時才顯示<br>③ 窗景圖（雪夜、雪白天、春天）<br>④ Blender 預覽圖＋規格表 | 廚房、房間的結構與家具現在就能做；**學姊住不住同一棟、單人還是雙人房**先用提案（見第 4 節），之後可改 |
| **2 美式超市** | 入口（購物車、自動門）、生鮮與**蛋的冷藏櫃**、**零食走道**、**亞洲食品貨架**（台灣泡麵）、一般貨架、冷凍櫃、收銀台；店名虛構 | `us_market_layout.js`（提案）＋`us_market.py` → `us_market_interior.glb`；商品沿用並擴充便利商店的 59 種包裝貼圖集（加蛋盒、牛奶加侖桶、穀片、大包零食） | US1 已定案；店名我先提一個虛構名，給 AA-B 看 |
| **3 校園街道（一小段）** | 主街（兩三層樓的店面）→ 石灰岩哥德式校門 → 校園裡一小段步道，兩旁兩三棟 Collegiate Gothic 石灰岩建築、落葉樹、路燈、長椅 | `us_campus_layout.js`（提案，約 120 m 長）＋`us_campus.py` → `us_campus.glb`；雪、春天兩套（積雪是獨立節點 `SNOW_*`，遊戲依日期開關） | 結構可以先做；這裡沒有寫好的事件（只有「走路、邀約」），互動點留給 AA-B |
| **4 人物（BB-B 規格後）** | 學姊冬裝（深灰長版羽絨、米白圍巾、頭髮放下）、室內（燕麥色毛衣）；祐廷冬裝（深藍羽絨）；香港朋友（深綠羽絨、深色毛帽、黑後背包——**名字與正臉還沒定**）；交換生路人 | VRM 變體（沿用現有 VRM 換衣服）；路人用 `bl_npc_*` 底模換冬裝 | 要 BB-B 的參考圖或確認（D59） |

區域之間怎麼連（提案，LAWWW-B／AA-B 決定）：
- 宿舍出口 → 校園街道：走路，同一個區域的出口互動點。
- 校園街道 → 超市：公車或過場標題卡（「搭公車約 10 分鐘」），和台灣的出遊轉場一樣。
- 抵達那天：巴士站（2D）→ 超市 → 宿舍。

## 2. 可以重用的現有素材

| 用途 | 現有素材 | 怎麼用 |
|---|---|---|
| 房間家具 | `dorm_interior.py`（台灣宿舍：床、書桌、椅、衣櫃、檯燈）、`furniture_study.glb`、`desk_props.glb`（筆電、課本、杯子、手機） | 尺寸改成美式（Twin XL 床、比較大的書桌、暖氣片） |
| 廚房 | `noodle_interior.py`（不鏽鋼台、鍋碗）、`cvs_goods`（包裝貼圖集）、`bg_home.py`（碗、筷子、泡麵碗的旋轉體做法） | 電磁爐、流理台、上下櫃重新做；鍋碗筷沿用做法 |
| 交誼區 | `cafe_layout.py`（沙發、桌椅、植物）、`plants.py`、`prop_pothos.glb` | 換成美式休閒家具的比例與布料 |
| 超市 | `cvs_goods.py` 的 59 種包裝＋貼圖集、`cvs_interior.py` 的貨架、冷藏櫃、收銀台 | 貨架加高到 1.8～2.1 m、走道加寬；加新包裝 |
| 校園 | `campus_hall.py`（台大建築：石材基座、拱窗、屋頂）、`archkit.py`、`street_props.glb`（路燈、長椅、腳踏車、公告欄）、`street_trees.py`（樹的產生器＋遠景卡片）、`campus_lake.py`（湖） | 石灰岩材質＋尖拱；樹加美國種類 |
| 主街店面 | `wz_street.py`（街屋、招牌板面、店內景深卡） | 換成美式二三層磚造店面（不同的窗與簷口） |
| 人物 | 學姊、祐廷的 VRM、`bl_npc_*` 路人底模、`char_second/` 換衣流程 | 冬裝變體 |

## 3. 每批交付後 LAWWW-B 怎麼整合與驗收

1. **整合**：
   - 讀 `*_layout.js` 建區域：`zones3d.js` 或新檔，導航格照 layout 的 `blockRect`，互動點、出生點也照它。
   - manifest 加 `bldg.us_dorm` 等 key，用 `attachRoomGLB`（室內）或 `attachWenzhouModel`（戶外）接模型。
   - 套件備用照 D38 ③：模型載入失敗時只顯示 layout 的方塊。
2. **驗收**（D34、D38）：
   - `node tests/nav_buildings_unit.js`、`tests/reachability_all.py`（新區域的互動點都走得到）、`tests/zone_transitions.py`。
   - 新寫 `tests/us_dorm_glb_integration.py`，比照 `gongguan_glb_integration`：導航格、互動點和備用版完全相同，draw call、三角形預算。
   - 手機直向、橫向截圖；US2 在廚房的演出截圖，和 BCG-32 比對。
3. **我這邊**：每批交付附
   - Blender 預覽、規格表（三角形、材質、檔案大小）；
   - 截圖設定 JSON；
   - LAWWW-B 接上後，我用 `fast_shots.py` 拍遊戲內截圖，做 VISUAL_REVIEW 比較。
4. **狀態**：
   - 我負責：`MODEL_READY`（交付）、`READY_FOR_ART_REVIEW`（遊戲內截圖後）。
   - LAWWW-B 負責：`INTEGRATED`、`FUNCTIONAL_VERIFIED`。
   - 使用者負責：`ART_APPROVED`。
   - 全部記在共用總表 `docs/HANDOFF_GAP_MATRIX.md`，任務 ID 用 `US-*`。

## 4. 要 AA-B／BB-B 補充的資訊（我先用提案開工，確認後再改）

| # | 問題 | 我的提案（可改） | 問誰 |
|---|---|---|---|
| Q1 | 學姊住哪裡？US2 寫「她的研究生宿舍公用廚房」，BB_98 寫「3D 交換宿舍的公用廚房」 | 同一棟國際學生宿舍，學姊在別的樓層；遊戲只做一層樓（祐廷那層），US2 的廚房就用這一層（「她下來煮麵」）；或者這一層就是她那層，祐廷是去找她 | AA-B |
| Q2 | 單人房還是雙人房？有沒有室友？ | 單人房（Twin XL 床、書桌、衣櫃、暖氣片），沒有室友 | AA-B |
| Q3 | 交誼區、校園街道要有哪些事件或互動？ | 交誼區：沙發可以坐、公告欄、自動販賣機；街道：長椅可以坐、校門口可以拍照（之後的事件用） | AA-B |
| Q4 | 季節怎麼切？ | 1～3 月雪景、4～6 月春景，同一套模型開關積雪節點；US4「最後一週下雪」要確認是哪一週 | AA-B |
| Q5 | 宿舍、校園、超市怎麼連？ | 宿舍到校園走路；校園到超市用過場卡 | AA-B／LAWWW-B |
| Q6 | 超市的店名 | 虛構英文店名，招牌配色不照任何真實連鎖店；對照表寫在交付文件 | AA-B 看一眼 |
| Q7 | 香港朋友的名字、正臉、立繪或 3D | 等 BB-B 設計參考圖；3D 先用路人底模＋深綠羽絨外套（背影和 BCG-17 一致） | BB-B |
| Q8 | 學姊、祐廷的冬裝 3D | 照 BB_117 §4b、§4e 和 `art_reference/heroine05_winter.webp` 改 VRM 衣服 | BB-B（驗收） |

## 5. 第一個能開始的部分（現在就做）

~~批次 1 的公用廚房＋自己的房間~~ → **公寓單人房的室內**（臥室、客廳、廚房、衛浴、陽台、門外走廊）：使用者已經說明格局，不受 AA-B 改企劃的影響。US2 的道具（泡麵、鍋、碗、報告）做成獨立節點，等 AA-B 決定放在哪個廚房。同時做批次 0 的雪、石灰岩材質。

## 來源（查證）

- [IU Bloomington campus limestone guide（Visit Bloomington, PDF）](https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/bloomington/campuslimestone_2019_96598574-9a58-4402-854f-eb4d548bede5.pdf)
- [IUB campus walking tour（IU Visitor Center, PDF）](https://visitorcenter.indiana.edu/doc/iub_campus_walking_tour.pdf)
- [History of IU's Sample Gates（Indiana Daily Student）](https://idsnews.com/article/2025/04/history-iu-famous-sample-gates)
- [How to spend a day on Kirkwood Avenue（Visit Bloomington）](https://www.visitbloomington.com/blog/stories/post/how-to-spend-a-day-on-kirkwood-avenue/)
- [Walnut Grove residence center（IU Housing）](https://housing.indiana.edu/residence-centers/walnut-grove.html)
- [Spruce Hall（IU）](https://inspire.indiana.edu/about/spruce.html)
