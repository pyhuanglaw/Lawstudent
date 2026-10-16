# bb_support：BB-B 支援 LAWWW2-B 的美術

> 使用者 2026-10-16：
> - 「如果晚一點你和AA手上都沒工作了 就去支援LAWWW2美術 要跟他要他生成場景的規則 你們三個要分工 不要重複做 照LAWWW2原本的3D規則」
> - （AA-B 轉達）「你如果幫忙美術，做之前要問清楚規格要求方式，做完要給LAWWW2確認」
>
> - **規格**：LAWWW2-B 2026-10-16 08:1x 的訊息（ART-GYM-P1）＋`docs/art-rebuild/second_ai/SCENE_RULES.md`。BB-B 開工前已回「確認規格」。
> - **所有權**：仍是 LAWWW2-B 的。BB-B 只在自己的分支（`claude/elegant-brown-fcos7n`）commit；LAWWW2-B 驗收、merge 以後，照原流程交 LAWWW-B。
> - **不改**：`src/`、`zones3d`、`assets3d`、`lib2.py`、`cafe_layout.py`、LAWWW2-B 的腳本。
> - **狀態**：美術最多到 `READY_FOR_REVIEW`，LAWWW2-B 確認前不算完成。
> - **ART-GYM-P1：LAWWW2-B 2026-10-16 09:01 驗收通過、merge（`f2bebf72`）**。之後交 LAWWW-B 整合；建築、場景的 `ART_APPROVED` 只有使用者能標。

## ART-GYM-P1 新體育館 B1 健身中心的器材：`gym_b1_props.py` → `assets/models/env/second_ai/bb_support/gym_b1_props.glb`

```
/opt/blenv/bin/python tools/blender/env_second/bb_support/gym_b1_props.py
/opt/blenv/bin/python tools/blender/env_second/render_cycles.py -- assets/models/env/second_ai/bb_support/gym_b1_props.glb <輸出資料夾> gym_b1 tools/blender/env_second/bb_support/gym_views.json --res 1280x640 --samples 48 --ground --view Standard --exposure -2.5
```

- **需要** LAWWW2-B 分支的 `lib2.py`（`rbox_bm`、`CMesh.crbox`、`vc_metal`）和 `b3lib.py`。BB-B 分支上的 `lib2.py` 可能是舊版：請在 LAWWW2-B 的分支跑。BB-B 是把那兩個檔讀出來、在暫存資料夾跑的，沒有改它們。
- **工具**：Blender 5.2.2（bpy，`/opt/blenv`，照 `docs/art-rebuild/TOOLCHAIN_AUDIT.md` 裝）。
- **做法**：
  - 管件用 `cyl`（8～12 邊），圓的東西（槓片、飛輪、風扇罩、阻力旋鈕、捲起來的墊子）用 `lathe` 旋轉體；
  - 平板、坐墊、護蓋用倒角方塊（`rbox_bm`／`crbox`），沒有直角方塊；
  - 每件做完合併重疊頂點（`remove_doubles`），再 `smooth_mesh`（0.6 弧度以上保留硬邊）。
- **材質**：兩個，都是頂點色（一次 draw call 一個材質）。
  - `gymb1_metal`：`vc_metal`，金屬度 0.40（上限 0.45）、粗糙度 0.42。用在深灰烤漆的框架 `#2e3136`、淺灰的護蓋與托盤 `#4a5058`、鍍鉻的槓、導桿、套筒 `#b9bdc3`。
  - `gymb1_vc`：`vc_material`，粗糙度 0.72。用在黑橡膠（槓片、六角啞鈴頭、握把、腳墊）`#1d1d1f`、皮墊 `#2b2b2e`、塑膠罩 `#3a3e44`、跑帶 `#232325`、螢幕 `#0f1820`、阻力旋鈕 `#7a1f1f`、運動墊 `#45525c`。
  - 沒有貼圖、沒有 Poly Haven，`LICENSES.md` 不用加。
- **D77**：沒有任何字、品牌、標誌。跑步機和划船機的螢幕是沒有字的暗色面板；槓片沒有刻重量。

| 節點 | 物件 | 尺寸（約） | 三角形 | 說明 |
|---|---|---|---|---|
| `GYM_TREADMILL` | 跑步機 | 長 2.0（z）× 寬 0.85 × 高 1.45 m | 1,456 | 使用的人面向 +z；馬達罩、立柱、側扶手（橡膠握把）、傾斜的儀表板和螢幕、放手機的托盤；跑帶兩側是防滑踏台 |
| `GYM_BIKE` | 飛輪 | 1.2 × 0.55 × 1.25 m | 1,992 | 「λ」形車架：主樑從後腳到把手，座管從主樑中段往後傾；前叉夾住飛輪（鍍鉻）和一側護蓋；阻力旋鈕（暗紅）、曲柄、踏板、可調的座管和把手立管 |
| `GYM_ROWER` | 划船機 | 2.4 × 0.6 × 0.9 m | 1,820 | 風扇罩和腳踏板在 +z；鋁色單軌、座椅和滑車、前後腳、拉把、螢幕支臂和沒有字的小螢幕 |
| `GYM_SQUAT_RACK` | 深蹲架＋槓 | 1.3（x）× 1.2（z）× 2.3 m | 2,044 | 四根 75 mm 方管立柱、頂底樑、地上橡膠墊；前排立柱內側 J 鉤（1.4 m）、安全槓（0.65 m）；2.2 m 奧林匹克槓掛在 J 鉤上，兩邊各兩片 45 cm 黑色槓片 |
| `GYM_SMITH` | 史密斯機 | 2.1 × 1.4 × 2.2 m | 2,152 | 外框＋中間上下橫樑；兩根鍍鉻導桿、滑套、槓（1.25 m）兩邊各一片槓片；後排立柱外側的掛片桿，各掛一片 |
| `GYM_DB_RACK` | 啞鈴架＋一組啞鈴 | 2.0 × 0.7 × 0.85 m | 2,236 | 兩層斜托盤、三組梯形側框；10 對六角啞鈴：上層 2、4、6、8、10 kg，下層 12、14、16、18、20 kg，頭的大小照重量變 |
| `GYM_BENCH` | 可調式臥推椅 | 1.35 × 0.6 m，座面 0.45 m | 1,792 | 椅背在 −z、立 30°；座墊、主樑、前後腳架、椅背撐桿、調整梯（5 格）、前面勾腳的滾筒 |
| `GYM_MAT` | 運動墊（平放） | 1.8 × 0.6 × 0.012 m | 108 | 倒角的薄墊 |
| `GYM_MAT_ROLL` | 運動墊（捲起來，**備用**） | 長 0.6 m、直徑 0.16 m | 144 | LAWWW2-B 不要可以直接刪這個節點 |

- **合計**：13,744 三角形（上限 15k）；每件都在 3k 以下；2 個材質；16 個網格（每件 metal、vc 各一個；兩張墊子只有 vc）；GLB 約 0.7 MB。
- **原點**：每件的底面中心，y=0 是地面，正面朝 +z（遊戲端用 yaw 轉）。
- GLB 裡的物件位置只是排開給人看（`SPREAD`，x 從 −7.2 到 +7.2），遊戲端用每件的網格本身擺。
- **渲染**（`render_cycles.py`）：
  - Cycles CPU 48 spp、OIDN、Nishita 天空＋太陽、地面；
  - 色彩轉換用 **Standard、曝光 −2.5**（和 AA-B 的 aa_support 同一個理由：預設 AgX 在這個光下會把深灰框架、黑橡膠洗成淺灰，看不出真正的顏色）；
  - 圖在 `docs/art-rebuild/second_ai/blender_renders/bb_support/`（webp）：總覽（1600×640）、有氧器材 45°、飛輪近景、兩座架子、啞鈴架＋臥推椅＋墊子（1280×640）。鏡頭在 `gym_views.json`；總覽是 1600×640，其他 1280×640。

### 還沒做、要注意的

- **沒有遊戲內截圖**：GLB 還沒接進 manifest（那是 LAWWW2-B 驗收、LAWWW-B 整合的事），只有 Blender 渲染（D38 第 8 點：Blender 渲染≠遊戲驗收）。
- 沒有 `_lod1`：每件都在 2.3k 以下，健身中心是近景；要的話可以補。
- 立柱沒有打孔（真的深蹲架、史密斯機有一排調整孔）：用貼圖或法線比較省，幾何做孔會超過預算。
- 跑步機、划船機的螢幕是純色面板，沒有發光；要晚上亮的話可以改成 `emit`，或加 `GLOW_` 空節點。
- 數量：真的健身中心有氧機 40 台、深蹲架 3 組、史密斯機 2 組（`BB_151` 4b），這裡每種一件，擺放時用 instancing 重複。

## ART-GYM-P2／P3a：B1 健身中心與泳池邊還缺的道具：`gym_b1_entry.py` → `assets/models/env/second_ai/bb_support/gym_b1_entry.glb`

- **派工**：LAWWW2-B 2026-10-16 HANDOFF（`d58dfec5`）「BB-B：GYM-P2／P3a 合併，B1 服務櫃台、置物櫃、鏡牆、地墊、泳池邊」。
- **對照 LAWWW2-B 的 B1**（`f3180c69`）：
  - B1 已經有鏡牆（南牆整面）、橡膠地坪（貼圖）、閘門三道、水道繩、仰泳旗、出發台、扶梯、大時鐘。
  - 他寫還缺、等 BB-B 交的是：**服務櫃台、置物櫃、飲水機、救生員椅**。這四件是主件。
  - 鏡牆、地墊、體重計、毛巾籃、浮板架是備用，不要可以直接刪。
  - 泳池邊的出發台、扶梯、水道繩、旗繩，B1 已經有了，BB-B 不做（避免重複）。
- 櫃台照 B1 配置 `(21, 0.95)`、客人站 z 1.9：櫃台的客人面朝 +z，擺進去不用轉。

```
/opt/blenv/bin/python tools/blender/env_second/bb_support/gym_b1_entry.py
/opt/blenv/bin/python tools/blender/env_second/render_cycles.py -- assets/models/env/second_ai/bb_support/gym_b1_entry.glb <輸出資料夾> gym_b1e tools/blender/env_second/bb_support/gym_entry_views.json --res 1280x640 --samples 48 --ground --view Standard --exposure -2.5
```

- 工具、做法、兩個頂點色材質（`gymb2_metal`、`gymb2_vc`）的規則都和 P1 一樣；沒有貼圖、沒有 Poly Haven，`LICENSES.md` 不用加。
- **D77**：沒有字、品牌、標誌。刷卡機、平板、螢幕、體重計的顯示都是沒有字的暗色面板；置物櫃的號碼牌是空白的；救生員椅沒有字。

| 節點 | 物件 | 尺寸（約） | 三角形 | 說明 |
|---|---|---|---|---|
| `GYM2_COUNTER` | 服務櫃台 | 2.4（x）× 0.75（z）× 1.05 m | 2,860 | 客人站 +z、櫃台人員在 −z。客人那面是淺色美耐板加 15 根木條，有深色踢腳；檯面深灰，往客人那邊多出 3 cm。檯面上有刷卡機、報到用平板（立架）、筆筒、五條摺好的毛巾。櫃台人員那邊有坐著高度的工作檯，螢幕背對客人 |
| `GYM2_LOCKERS` | 置物櫃 | 1.8 × 0.45 × 1.05 m | 1,800 | 上下兩層 × 6 格＝12 格；淺灰本體、藍灰門、不鏽鋼把手、空白號碼牌；0.1 m 深色底座 |
| `GYM2_WATER` | 飲水機 | 0.42 × 0.38 × 1.1 m | 568 | 不鏽鋼；上面的水槽、出水口、正面按鈕、後擋板 |
| `GYM2_LIFEGUARD` | 救生員高椅 | 0.72 × 1.0 m，座面離地 1.6 m | 768 | 白色烤漆鋼管、前面五階梯子、橘色座墊和椅背 |
| `GYM2_SCALE` | 體重計（備用） | 0.4 × 0.5 × 1.45 m | 468 | 立柱式 |
| `GYM2_TOWEL_BIN` | 毛巾回收籃（備用） | 直徑 0.46、高 0.62 m | 456 | 裡面露出兩條毛巾 |
| `GYM2_KICKBOARD_RACK` | 浮板架＋五塊浮板（備用） | 0.6 × 0.3 × 0.75 m | 820 | 池邊用；藍、黃浮板 |
| `GYM2_MIRROR` | 鏡牆（備用） | 3.0 × 2.0 m，離地 0.3 m | 308 | B1 已經有整面鏡牆；鏡面是獨立的網格 `gymb2_mirror_pane` |
| `GYM2_FLOOR` | 橡膠地墊拼塊（備用） | 2 × 2 m（16 塊 0.5 m） | 704 | B1 已經用橡膠地坪貼圖 |

- **合計**：8,752 三角形（上限 15k）；每件都在 3k 以下；2 個材質；GLB 約 0.5 MB。
- **原點**：每件的底面中心，y=0 是地面，正面朝 +z。GLB 裡的位置只是排開給人看（`SPREAD`）。
- **渲染**（Cycles 48 spp、Standard、曝光 −2.5，和 P1 相同）：總覽、櫃台（客人那面、櫃台人員那面）、置物櫃＋飲水機、救生員椅＋備用三件，在 `docs/art-rebuild/second_ai/blender_renders/bb_support/gym_b1e_*.webp`。
- **狀態**：`READY_FOR_REVIEW`，等 LAWWW2-B 驗收；沒有遊戲內截圖（B1 區域還沒建）。

### 還沒做、要注意的

- 櫃台後面的開館時間牌、健身中心的規定告示沒有做：B1 沿用 1F 的開館時間、公告欄。
- 置物櫃只有一組 12 格；真的有好幾排，用 instancing 重複。
