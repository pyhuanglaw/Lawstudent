# 頁間書屋 室內（公館 G02，取代舊路書房；AA 2026-11-04 v1，READY_FOR_REVIEW）
- 使用者 11-04 01:0x：新店名、新外觀、新室內圖（AA_647；分工：外觀 LAWWW2、室內 AA、MODEL_READY LAWWW2、功能 BB／CC、ART_APPROVED BB）。
- 參考圖：`docs/story_planning/ref_images/shops/gongguan_book_int.webp`（室內）、`gongguan_book_ext.webp`（外觀，LAWWW2）。
- 配置：`src/data/yejian_layout.js`（遊戲區域照舊 `bookstore`；12 × 10 × 3.8 m；15 席）。腳本：`yejian_interior.py`；貼圖 `aa_int_tex.py yej`（yej_print.png）；書背用木曜日的 `mok_bookrows.png`（深色底，書格比較暗，對得上參考圖）、窗景用 `mok_view.png`。
- 匯出：`/opt/blenv/bin/python tools/blender/env_second/aa_support/yejian_interior.py -- --out assets/models/env/second_ai/aa_support/yejian.glb`（要用 origin/claude/second-ai-env-art 的 lib2.py、cafe_layout.py、plants.py）。

## 規格（glb_specs.py）
- 三角形 **36,728**（≤ 6 萬）、材質 **12**、GLB 約 2.4 MB。

## 拆圖清單（參考圖 → 模型）
| 參考圖 | 模型 |
|---|---|
| 左邊整面頂天書牆（下面有門的矮櫃）、類別牌（文學・小說、散文・人文、法律、歷史、藝術・設計、大學生活） | `bookwall`：北牆 12 m、12 格、七層，類別牌掛在第二層 |
| 滑軌梯子 | `ladder`：黃銅軌道 3.4 m、木梯 |
| 中間兩張閱讀桌、橡木椅＋灰色布坐墊、桌上的黃金葛、書、咖啡杯 | `reading_table` ×2、chair()（四腳、坐墊、後柱、頂板、橫檔） |
| 右邊臨街大窗、窗邊長桌、黃銅檯燈、窗上的明信片 | `front` 窗、`window_counter`、三盞檯燈、麻繩明信片 10 張 |
| 斜放的新書架 | `display_rack`（三層、21 本書封） |
| 正對門的咖啡吧：濃縮咖啡機、蛋糕櫃、手寫菜單黑板、層板上的罐子、店名「頁間書屋」 | `cafe_counter`、東牆層板兩層＋上層植物、黑板（咖啡・茶飲）、店名牌 |
| 沙發角、落地燈、茶几、地毯 | `sofa`、`coffee_table`、`floor_lamp`、圓地毯 |
| 黃銅吊燈、軌道燈、外露風管、冷氣 | 吊燈 7 盞、兩條軌道各 7 盞、兩條風管、冷氣 |
| 植物、垂吊黃金葛 | 大盆栽 3＋3、書牆頂黃金葛 5 處 |

## 鏡頭對參考圖（§12-2）
- `[["refcam",[-5.55,1.55,-1.7],[5.5,1.05,-0.2],22]]`：站在書牆前（西端），往東看：左邊書牆、右邊臨街的窗、正前方咖啡吧。
- 渲染：`--res 800x450 --samples 16 --sun 30,20 --sunE 14 --sunC 1.0,0.85,0.65 --lamp 45 --lampC 1.0,0.78,0.5 --world 0.03 --exposure -0.2`

## ref_match（§12-4）：ALL PASS
- 亮度 0.458／0.421、對比 0.609／0.496、冷暖 +0.285／+0.306、色票、九宮格 0.043。圖 `docs/story_planning/ref_images/model_renders/yejian_v1_refcam{.png,_cmp.jpg,_report.json}`。

## 醜點清單
1. 參考圖前景緊貼著閱讀桌和椅子；我們的鏡頭比較遠，中間地板和天花板露得多。
2. 大盆栽像細竹子（葉子少）。
3. 咖啡吧上的東西（咖啡機、蛋糕櫃）從遠處看太小。
4. 地板的磨石子點不明顯；參考圖的碎石點比較大、比較深。
5. 窗外是畫的樹（木曜日那張窗景）。

## 和參考圖不同的地方（§12-5）
- **配合配置調尺寸**：店面照公館 G02 的寬 12 m、深 10 m；參考圖的店比較深長。
- **遊戲需要**：走道 ≥ 1.2 m；門在西端（外觀圖左邊的木門），出口互動點 (−4.6, 4.6)。
- **拿掉品牌**：沒有。
