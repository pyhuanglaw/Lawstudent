# 日常失速 DAILY OFFBEAT 室內（AA 子代理 2026-11-03；臨時支援 LAWWW2，SCENE_RULES 第 10 節）

狀態：**READY_FOR_REVIEW**（LAWWW2 驗收；外觀、區域程式、導航、出入口、光照烘焙歸 LAWWW2）。

## 檔案
| | 路徑 |
|---|---|
| 腳本 | `tools/blender/env_second/aa_support/daily_offbeat_interior.py`（共用小工具 `aa_kit.py`） |
| 配置（遊戲＋Blender 共用） | `src/data/daily_offbeat_layout.js`（w/d/h、blocks、seats 32、interact 5；exit、enterAt 留空） |
| 自製貼圖 | `tools/blender/env_second/aa_support/aa_int_tex.py dof` → `textures/gen/dof_checker.png`、`dof_print.png` |
| GLB | `assets/models/env/second_ai/aa_support/daily_offbeat.glb`（＋`.json`） |
| 渲染 | `docs/story_planning/ref_images/model_renders/daily_offbeat_{front,diag45,close,bar}.png`（`render_interior.py`，views `dof_views.json`） |

執行：`/opt/blenv/bin/python tools/blender/env_second/aa_support/daily_offbeat_interior.py`（要先有 lib2.py、cafe_layout.py、plants.py 和用到的貼圖：從 `claude/second-ai-env-art` 拿）。

## 規格（glb_specs.py）
- 三角形 52,790（≤ 6 萬）、材質 12（≤ 12）、GLB 2.31 MB（≤ 6 MB）、30 個網格（≈ draw call）、貼圖 7 張（webp）。
- 金屬度最多 0.4（vc_metal）。玻璃 `dof_glass`；天花板 `dof_ceiling` 單面朝下。
- 會淡出的牆：`WALL_front_*`、`WALL_back_*`、`WALL_left_*`、`WALL_right_*`（自訂屬性 dir）；掛在牆上的菜單、層板、海報、公告板都在同一組。
- 吊燈的光暈：`GLOW_pendant_*`（15 個；白天 0、晚上 0.6）。

## 尺寸、配置（暫定，和 SCENE_RULES 第 10 節一樣）
- 11 × 10 × 3.4 m。店門在 +z 西段（x −3.9、寬 1.2、高 2.3）；窗：+z x −3.0～5.2、+x z −3.8～4.7，窗台 0.45、窗頂 2.75（轉角兩面大窗）。**LAWWW2 的外觀要對這兩個開口**。
- 吧檯在後牆西半（綠磁磚正面、淺木檯面、黃銅腳踏桿；後面工作檯：兩孔義式咖啡機、兩台磨豆機、罐子；兩段開放層板、黑板菜單）；後牆東半是桌遊櫃（盒子用圖集）、虛構的唱片行海報、首都帝大海報。
- 中央八人長桌（桌上桌遊盒、攤開的卡牌、小花瓶、喝到一半的飲料）；西牆卡座三組＋軟木公告板（社團傳單：辯論社、攝影社、合唱團、法律服務社、吉他社、登山社、熱舞社、校內講座）；前窗、側窗各三張雙人桌＋轉角一張。
- 共 32 席。貓「店長」：長桌東端一張空的殼椅＋圓坐墊，椅背貼「店長　請勿打擾」；**3D 的貓沒做**（AA_618 的貓以後可以用 aa_support 的 wz_cat 那一套，只留位置 `interact kind:'cat'`）。
- 長桌 `interact: boardgame`；座位都不給讀書。

## 和參考圖（daily_offbeat_ref_v2.webp）比
- 有：綠白格紋地磚、奶油黃牆、橄欖綠磁磚吧檯、橘色殼椅為主＋綠、奶油、芥末黃、藍綠、紅的椅子、長桌、黑板菜單、吊燈（橄欖綠搪瓷）、外露風管、軟木板傳單、首都帝大海報、植物、吊盆黃金葛。
- 差：參考圖是窗外的視角、陽光透過樹葉灑進來——光影要靠 LAWWW2 的烘焙／遊戲光；參考圖的牆上層板放滿書，這裡是瓶罐（這家不讀書）；植物比參考圖少；磁磚是平的貼圖（沒有一片片的凹凸）；圓桌面是磨石子色的純色，沒有磨石子顆粒。
- 字：社團傳單、海報都是遊戲裡的名字（D115 首都帝大；沒有臺大、NTU）。菜單照 AA_617 的品項。

## 9 節的驗收清單
- 造型：椅子是一體成型的彎曲殼（有厚度、圓邊）＋細鋼腳；桌面、吧檯、層板都倒角；圓的東西是旋轉體（燈罩、杯子、磨豆機豆槽、花瓶）。做了。
- 材質：Poly Haven（CC0）`long_white_tiles`（校成橄欖綠）、`walnut_veneer`（校成淺木）、`white_plaster_02`（cafe_layout.soft_plaster，奶油黃）；其他是頂點色。地磚和印刷品是自製（腳本在上面）。**沒有新下載的 Poly Haven 貼圖**。
- 粗糙度：磁磚、殼椅亮（0.25～0.28）、木頭 0.45、牆 0.88。磨損：**沒做**（沒有烘焙 AO，交給 LAWWW2 的光照烘焙）。
- 生活痕跡：喝到一半的飲料、攤開的卡牌、椅背掛的帆布袋、卡座旁地上的背包、肉桂捲、厚片。做了。
- 預算：見上面。

## 還沒做的
- 3D 的貓（只有位置）。
- 遊戲內截圖（要 LAWWW2 接進區域）。
- 烘焙 AO、光照（LAWWW2）。
