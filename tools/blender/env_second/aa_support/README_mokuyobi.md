# 木曜日 Mokuyōbi 室內（AA 子代理 2026-11-03；臨時支援 LAWWW2，SCENE_RULES 第 10 節）

> **第二版 WIP（AA 子代理 2026-11-03）**：照使用者 11-03 交代，縮小和參考圖的差距（擺滿東西、暖光、窗景、降低過曝）。進行中，完成後這一段改寫成第二版說明。

狀態：**READY_FOR_REVIEW**（LAWWW2 驗收；一樓鐵門、樓梯、外觀、區域程式、導航、出入口、光照烘焙歸 LAWWW2）。

## 檔案
| | 路徑 |
|---|---|
| 腳本 | `tools/blender/env_second/aa_support/mokuyobi_interior.py`（共用 `aa_kit.py`） |
| 配置 | `src/data/mokuyobi_layout.js`（w/d/h、blocks、seats 18（都 canStudy）、interact 4、stairWell、stairTop；exit、enterAt 留空） |
| 自製貼圖 | `aa_int_tex.py mok` → `textures/gen/mok_print.png`（海報、唱片封面、菜單、窗景、地毯）、`mok_bookrows.png`（書背） |
| GLB | `assets/models/env/second_ai/aa_support/mokuyobi.glb`（＋`.json`） |
| 渲染 | `docs/story_planning/ref_images/model_renders/mokuyobi_{front,diag45,close,sofa,bookcase}.png`（views `mok_views.json`；`--sun 22,25 --sunE 4 --lamp 50 --world 0.6`） |

## 規格（glb_specs.py）
- 三角形 59,228（≤ 6 萬，接近上限）、材質 12、GLB 2.78 MB、26 個網格、貼圖 7 張。
- 金屬度最多 0.4。玻璃 `mok_glass`；天花板 `mok_ceiling` 單面朝下；燈泡和燈罩共用發光材質 `mok_milkglass`。
- 會淡出的牆 `WALL_<side>_*`。**樓梯間的兩面隔間牆、店門框、打開的門、隔間牆上的相框、窗外的老樹卡都在 `WALL_front` 組**（鏡頭在臨街那一側時一起淡出）。窗景卡單獨一個網格 `WALL_front_VIEW_mok_window_view`（自訂屬性 windowView：遊戲要讓它亮一點、或換成即時的窗景，由 LAWWW2 決定）。
- 光暈 `GLOW_*`：吊燈 9、每張桌子的小檯燈 7＋唱片櫃、矮櫃各 1、立燈 1。

## 尺寸、配置
- 9 × 14 × 3.0 m（y＝0 是二樓地板）。臨街 +z 一整排木框窗 x −2.6～4.2（窗台 0.75、窗頂 2.55、上面一排氣窗）。
- 樓梯間 x −4.5～−3.0、z 3.6～7.0（`stairWell`）：GLB 只有兩面隔間牆、店門框（x −3.75、寬 0.95、高 2.1）＋打開的胡桃木玻璃門、門鈴，平台地板 z 3.6～4.6；**z 4.6～7.0 的地板空著給 LAWWW2 的樓梯**。
- 18 席：窗邊雙人桌兩組（窗邊那桌＝table 1）、西側兩張方桌、中間一張圓桌、東牆一張、沙發區（L 形墨綠沙發 3＋單人沙發 1，半高書櫃隔開）、吧檯 2（AA_618「只剩吧檯旁邊一個位子」）。
- 西牆胡桃木大書櫃（6 層，書可以拿）＋唱片櫃（黑膠唱片機、一箱唱片、檯燈）；北側小吧檯（直條紋木作、手沖壺、蛋糕罩、菜單、「本店無插座」小卡）；東牆《夏の残光》《雨後的車站》（虛構片名，照參考圖 v2）＋矮櫃；門邊衣帽架。
- 地板：Poly Haven `terrazzo_tiles`（校成淺米色）＋兩塊地毯（D112：不用深色木地板）。家具胡桃木（`walnut_veneer` 校成 #5e3e29）。牆 `white_plaster_02`（soft_plaster 奶油白）。

## 和參考圖（mokuyobi_ref_v2.webp）比
- 有：胡桃木書櫃塞滿書、黑膠唱片機、波浪邊乳白玻璃吊燈、木框窗＋紗簾、窗外的樹、曲木椅、圓桌、虛構電影海報、暖色燈、書櫃上垂下來的黃金葛。
- 差：參考圖的房間小、東西擠；這裡 9×14 m 比較空（座位照 18 席排，空的地方補了矮櫃、衣帽架、地毯、植物，還是比參考圖鬆）。窗景是一張畫的卡（樹冠一團一團），近看不像照片。參考圖的書櫃是一格一格的展示櫃（有時鐘、抽屜），這裡只做一格擺東西。沒有烘焙 AO。
- 曲木椅的椅背是圓弧框＋兩根直條；比參考圖的椅子細。

## 9 節的驗收清單
- 造型：桌面、椅座是旋轉體＋倒角；曲木椅用彎的圓管；沙發坐墊、靠墊是大圓角方塊；燈罩是有波浪邊的旋轉體。做了。
- 材質：見上面；沒有新下載的 Poly Haven 貼圖。磨損、AO：沒做（交給 LAWWW2 烘焙）。
- 生活痕跡：窗邊那桌的布丁、巴斯克、拿鐵、小花瓶；念書的桌子攤開的書、筆記本、鉛筆、水杯；椅背的針織外套；衣帽架上的外套和雨傘；書櫃旁地上的一疊書。做了。

## 還沒做的
- 一樓鐵門、樓梯（LAWWW2）。遊戲內截圖（要接進區域）。烘焙。
