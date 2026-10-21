# 美術製作 SOP（得獎遊戲標準）——LAWWW2-B 的實際做法，給所有幫忙做美術的 AI

> **強制閱讀**：AA-B、BB-B、帳號 A 的 LAWWW2、以後任何幫 LAWWW2 做美術的 AI（含子代理）。開工前讀完這份＋`SCENE_RULES.md`（規格）＋示範案例 `sop_demo/README.md`。
> **來源**：使用者 2026-10-16 約 20:2x UTC 直接要求（HANDOFF.md 最上面）：標準是「得遊戲大獎、不要像廉價拼接遊戲、不要有方塊感」；我自己怎麼精修（工具、檢測標準）要寫成 SOP，讓幫忙的 AI 和交接後的 LAWWW2 都照著做得出來。
> **規則**：新方法**加**進這份（第 9 節的登記表），**舊的不刪、舊做法照樣可以用**；但成果要過第 7 節的驗收。寫文件不等於品質提升——一律以遊戲內截圖為準。

---

## 0. 目標（一段話）

美術方向（使用者已定案）：**繪本感的半寫實環境＋日系動畫人物**，像能在 Steam 上賣的精緻生活遊戲。「繪本感」＝柔和的光、溫暖的顏色、看得出手工的細節；「半寫實」＝比例、構造、材質照真實世界（真的去查），但不追求照片級。

**三種一定退件的樣子**（使用者原話）：
1. **方塊感**：直角方塊拼的東西（桌子、櫃子、建築、招牌），邊緣銳利、沒有厚度變化。
2. **廉價拼接**：同一個模型到處複製、只換顏色（例：全街的機車、腳踏車都是同一台）；風格、密度、細緻度互相不搭的東西擺在一起。
3. **乾淨得像樣品屋**：沒有使用痕跡、沒有生活的東西、每件都對齊網格。

---

## 1. 工具鏈（全部在 repo 裡；Blender 5.2 無介面）

| 用途 | 指令／檔案 | 備註 |
|---|---|---|
| Blender 腳本 | `/opt/blenv/bin/python tools/blender/env_second/<腳本>.py [-- --out <glb>]` | Blender 自帶的 python；**沒有 scipy**（要高斯模糊自己用 FFT，見 `bg_court.py` 的 `gaussian_filter`） |
| 共用函式庫 | `tools/blender/env_second/lib2.py`（`import lib2 as L`；`from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix`） | `B`＝`tools/blender/b3lib.py` |
| 座標 | 腳本一律用**遊戲座標** (x 東, y 上, z 南)，`g2b(x,y,z)=(x,−z,y)` 轉 Blender | 匯出後遊戲座標不用再轉 |
| PBR 貼圖 | `L.pbr(名稱, 'PolyHaven id', tile=, target='#色碼', normal=, maps=('diff','nor'), res=, rough_value=)` | 第一次自動從 Poly Haven（CC0）下載到 `tools/blender/env_second/textures/<id>/`；授權寫進 `LICENSES.md` |
| 純色／頂點色 | `L.flat(名稱, '#色碼', rough=, metal=)`、`L.vc_material(名稱, rough=)`＋`CMesh` 的 `paint/cbox/crbox` | 小零件用頂點色，之後合併成一個 draw call |
| 程式畫的貼圖 | 系統 `python3`（numpy＋PIL）：`wz_road_tex.py`、`gen_street_textures.py`、`shopkit_tex.py`、`park_tex.py`、`dorm_y2_items.py` 的 `draw_atlas()` | 只用在**印刷品、路面標線、污漬、圖樣**；**不准**用隨機斑點冒充石材、磚、木頭、混凝土（D38 第 1 條）——那些用 Poly Haven |
| Blender 渲染（驗收用） | `/opt/blenv/bin/python tools/blender/env_second/render_cycles.py -- <glb[,glb…]> <輸出資料夾> <前綴> <views.json> [--res 960x600] [--samples 24] [--night] [--ground]` | views.json：`[["名稱",[眼x,y,z],[看x,y,z],焦距mm],…]`（遊戲座標）。EEVEE 在沙盒跑不動，用 Cycles |
| 遊戲內截圖 | `python3 tools/blender/env_second/shots/fast_shots.py <URL/index.html> <shots.json> [--block=檔名]` | 一個畫面大小只載入一次遊戲、連拍；JSON 欄位見檔頭（`state{zone,hour,pos}`、`cam{pos,look}` 或 `{yaw,pitch,dist}`、`w,h,dpr,mobile,hud,hideNPCs,js`）。`--block=xxx.glb` 擋掉那個檔＝「修改前」 |
| 人物截圖 | `tools/shots/char_review.py`、`tools/shots/facetest_shots.py`、`tools/shots/lookdev_ab.py` | 人物美術由 BB-B 驗收（D59） |
| 前後對照表 | `tools/shots/compare_sheet.py`、或 PIL 自己並排 | 同鏡頭、同時段、同畫面大小 |
| 整合＋效能測試 | LAWWW-B 的 `tests/wz_street_integration.py <URL>`（溫州街：36 項、draw call ≤310、三角形 ≤42 萬） | 在自己的測試工作樹跑（`git worktree add --detach <dir> <LAWWW-B 的 SHA>`，把自己的 GLB 蓋上去，開 `python3 -m http.server`） |
| 統計 | `tools/blender/env_second/shots/glbstat.py`、`kit_tris.py`、`wz_perf.py` | 三角形、材質、貼圖大小 |

**測試工作樹**（不碰 LAWWW-B 的分支）：
```bash
git fetch origin claude/modest-rubin-2lyp7g
git worktree add --detach /tmp/<scratch>/lwwt origin/claude/modest-rubin-2lyp7g
cp assets/models/env/second_ai/<我的>.glb /tmp/<scratch>/lwwt/assets/models/env/second_ai/
cd /tmp/<scratch>/lwwt && python3 -m http.server 8853 &
```
開遊戲加速（LAWWW-B v9.9.2）以後，截人物要多等：`(!GAME.charsAllP||GAME.charsAll)`。

---

## 2. 製作順序（每一件都照這個順序；跳步驟＝退件）

### 2-1 參考與尺寸（**先查，不要猜**）
- 找真實照片或規格（品牌型錄、維基、店家照片、街景），寫下**實際尺寸**：高、寬、深、厚度、離地、零件的相對位置。
- 寫在腳本開頭的 docstring（例：`prop_pothos.py`：盆口直徑 12.8 cm、高 11 cm、托盤 14.2 cm；`wz_road_tex.py`：水溝 38 cm、1 m 一節、每 6 m 一塊鐵柵）。
- 台灣特有的辨識點要列出來（例：塑膠矮凳四面的拱形開口、騎樓的柱子和日光燈、鐵捲門、不鏽鋼水塔）。
- 真實店名、商標、品牌配色**不放**（WORK_RULES 第 0 節、D77）；車子、家電參考真實款式，但不放商標、不照抄外型。

### 2-2 造型：去積木化（最常退件的地方）
| 東西 | 用什麼 | 例子 |
|---|---|---|
| 桌面、櫃子、檯面、門框、招牌板 | `Mesh.rbox(x0,x1,y0,y1,z0,z1, r=0.004～0.03, seg=1～3)`／`CMesh.crbox(..., hexcol, r=, seg=)` 倒角方塊 | 半徑照實物：家具 3～10 mm、檯面 2～5 mm、建築邊 1～3 cm |
| 圓的東西（盆、碗、瓶、輪胎、燈罩、桶） | `L.lathe([(r,y),…], seg=12～24)` 旋轉體 | `prop_pothos.py` 的盆（口緣往外翻、底部內縮）；近景 seg ≥ 16 |
| 管、桿、藤、電線、扶手 | `Mesh.cyl(a,b,r,seg=)`、自己的 `tube()`／`catmull()`（`prop_pothos.py`）、`sweep()`（`dorm_interior.py`） | 檯燈的兩節臂、垂下來的藤 |
| 軟的東西（坐墊、枕頭、布） | `soft_box()`（`dorm_interior.py`）、`Mesh.ell()` 橢球 | 辦公椅座墊 |
| 植物 | `tools/blender/plants.py`（模型葉子＋葉片卡）、`prop_pothos.py` 的 `leaf()`（主脈隆起、兩側往下、葉尖下垂） | 不要用球體當樹冠 |
| 建築立面 | `archkit.py`、`wz_shopkit.py`、`wz_street.py` 的組件 | 窗有窗台、鋁框、窗內房間；牆有勒腳、雨痕 |

**輪廓檢查**：從遊戲鏡頭的角度（手機直向、6 m、俯角 0.22）看剪影——如果剪影是長方形，就要加會破壞輪廓的東西：雨遮、冷氣、招牌側板、盆栽、晾的衣服、管線、欄杆。

### 2-3 材質
- **近景主要材質用 Poly Haven PBR**：`L.pbr('名稱', 'id', tile=重複公尺, target='#目標平均色', normal=0.2～0.6, maps=('diff','nor'), res=256～512)`。
  - `target` 把貼圖的平均色調到想要的顏色、保留明暗細節（例：`granular_concrete` 調成橡膠地墊的藍、軟木的 `#b8895a`）。
  - 有斑駁、太髒的貼圖用 `b3lib.img_adj(contrast=…)` 收（例：和室土牆）。
- **金屬度上限 0.45**（`b3lib.MAX_METAL`；遊戲沒有環境貼圖，金屬度太高會變黑）；不鏽鋼、鋁用 0.3～0.45＋粗糙度 0.3～0.5，底色用深一點的灰（#7d8084 左右），不然暖光下會偏白。
- **柏油維持淺灰**（D30，約 #a8a8a6）；路面的貼圖要加 `map.userData.asphalt`（入夜變暗）。
- 小零件（螺絲、把手、文具、碗盤）用頂點色 `CMesh`，最後 `vc_consolidate` 合成一個材質。
- 印刷品（菜單、票、包裝、招牌字）：程式畫成貼圖集，一個材質；**沒有真實店名、商標**。
- 發光（招牌、窗、燈）：材質名照 `SCENE_RULES.md` 第 4 節（`GLOW_*`、`ck_glass_lit`…），夜晚由遊戲設亮度；需要漸層時用自發光貼圖（`campus_socsci.py` 的 `lit_ramp()`：柱子由下往上 0.30→0.80，天花板整片）。

### 2-4 磨損與生活痕跡（環境的另一半）
| 痕跡 | 做法 | 例子（腳本） |
|---|---|---|
| 污漬、油漬、鏽水 | 程式畫在貼圖上：`R.stain(x,z,r,dL=,warm=)`（局部壓暗＋偏暖） | `wz_road_tex.py`（停車處的油漬、鐵柵旁的鏽水） |
| 雨痕 | 半透明貼圖疊在外牆：`wz_stain.png`（`gen_street_textures.py`），材質 `wz_stain`（glTF BLEND） | `wz_street.py` 每個窗台下 |
| 標線磨損 | 畫標線時用 `wear＝被磨掉的比例` | `wz_road_tex.py` 白線、紅線、斑馬線 |
| 補丁、裂縫 | 不規則邊緣、顏色只差一點、灌縫膠有斷有續（第一版「深色方塊」被退件） | `wz_road_tex.py` |
| 用舊的東西 | 掉漆、手印、油污集中在常摸的地方（把手、下緣、桌角） | BB-B `scooter_shop_props.py` 的工具牆 |
| 生活的東西 | 不是對齊的：書斜放、紙箱轉 3～7°、垂藤繞過障礙、外送箱、回收紙箱、安全帽、雨衣、晾衣 | `dorm_y2_items.py`、`wz_props.py`、`aa_support/wz7_street_props.py` |

**生活痕跡的位置要合理**：髒的地方是人和水會經過的地方（地面接牆、門口、把手、車停的地方），不是均勻撒。

### 2-5 AO（接觸陰影）——現況與做法
遊戲有即時陰影，但**沒有 SSAO**，所以接觸的地方要自己做暗：
1. **畫進貼圖**：地面貼圖在靠牆、靠路緣的地方壓暗（`wz_road_tex.py` 的 `ao_edge(dist_fn, width=0.35, dL=-26)`「靠牆的暗角」：`dist_fn()` 回傳每個像素到牆的距離（公尺），width 內由暗到原色、曲線 ^1.6）。巷口、門口不要畫。
2. **頂點色**：`CMesh.paint(faces, hexcol, k=0.85～0.95)` 讓靠地、靠牆的零件暗一點；同一個物件的下緣用比較暗的顏色。
3. **人物**：`tools/char_polish.py` 的 `neck_shadow()`、`under_chin()`（下巴投影畫進貼圖）。
4. **還沒有的**：Blender 自動烘焙 AO 到頂點色或光照貼圖的共用工具——**目前沒有**。需要的人先用 1～2；做了新工具要登記在第 9 節。

### 2-6 比例
- 和遊戲裡已有的東西比：門高 2.1 m、桌面 0.77 m、椅面 0.485 m、人物 1.75 m（祐廷）、欄杆 1.1 m、樓層 3.0～3.4 m。
- 在遊戲內截圖裡放一個人物（玩家）比大小；Blender 渲染裡放一個 1.75 m 的參考柱。

### 2-7 合併與效能（手機）
順序（`wz_street.py`、`wz_park.py` 的結尾就是這樣）：
1. `L.realize_small_instances(root)`：只用 1～3 次的 instancing 改成各自一份。
2. `L.auto_vc_groups(...)`＋`L.vc_consolidate(root, groups)`：純色材質 → 共用頂點色材質（matte／metal／gloss）。
3. `L.atlas_small(...)`（小貼圖材質合成一張）、`L.atlas_rows(...)`（沿 u 重複的條紋）、`L.atlas_tiles(...)`（磁磚、木紋這種兩個方向都重複的，**不糊**）。
4. `L.merge_by_material(root, keep=…)`：同材質合成一個網格；會淡出的牆（`WALL_*`）、招牌字面、遊戲要找名字的節點用 `keep` 保護。
5. 輪胎、碗盤這種圓的小東西降邊數（輪胎 12 邊、碗 6 邊），但近景主角不降。

預算：`SCENE_RULES.md` 第 5 節；溫州街整條 draw call ≤310、三角形 ≤42 萬（`wz_street_integration`）。**還沒量效能之前，不准拿手機效能當理由把東西做成方塊**（D38 第 9 條）。

### 2-8 匯出
- `L.export(OUT, gpu_instances=False)` → GLB（貼圖自動 WebP）；同名 `.json` 寫規格：節點、三角形、材質、尺寸、放置位置、貼圖來源（`L.write_json`）。
- 遊戲要切換顯示的東西，每件一個節點（例：`POTHOS_S1～S4`、`ITEM_film`、`ROOMMATE_KAI`），名字寫進 json 和 README。

---

## 3. 驗收（交件前自己先做；我驗收時也照這個看）

### 3-1 必附的圖
1. **Blender 渲染**（`render_cycles.py`）：正面 3/4、側面、特寫；暖光（傍晚）、白天各一。
2. **遊戲內截圖**（`fast_shots.py` 或專用腳本）：
   - 同一個鏡頭的**修改前／修改後**（`--block=新檔.glb` 拍修改前）；
   - 時段 11:00、17:30、20:30；
   - 手機 390×844、844×390（dpr 2）；
   - 至少一張「平常玩的鏡頭」（戶外 6 m／室內 3.6 m 跟隨），不是只有特寫。
3. 前後並排的對照表。

### 3-2 八項逐項紀錄（交件 README 必須有這張表，沒做到的寫原因）
| 項目 | 看什麼 | 怎麼量／怎麼看 |
|---|---|---|
| 輪廓與倒角 | 剪影不是長方形；邊有倒角 | 遊戲鏡頭的截圖；腳本裡用了 rbox／lathe／sweep 的地方 |
| 材質 | 近景是 PBR（Poly Haven）＋正確的粗糙度、金屬度 ≤0.45 | 列出 Poly Haven id、tile、target |
| AO | 接地、接牆的地方有暗 | 截圖上看接觸處；用了第 2-5 節哪一種 |
| 磨損 | 常摸、常碰的地方舊；不是均勻撒 | 列出磨損的位置 |
| 生活痕跡 | 有人在用的感覺；不對齊 | 列出放了什麼 |
| 比例 | 和人物、門、桌子比對得上 | 截圖裡的人物；實際尺寸表 |
| 效能 | 三角形、材質數、GLB 大小在預算內 | `glbstat.py`／json；整合測試的 draw call |
| 遊戲截圖 | 3-1 的那些都有 | 檔名列表 |

### 3-3 狀態
- 舊成果不全部推倒，但要分清楚：**「舊標準已通過」**（2026-10-16 20:2x 以前驗收的）和**「新標準已通過」**（照這份 SOP、八項都有紀錄的）。
- `READY_FOR_REVIEW`（交件）→ LAWWW2-B 驗收（`驗收通過（新標準）`／退件附具體理由）→ 整合 → 場景美術由**使用者**標 `ART_APPROVED`；人物美術由 BB-B（D59）。

### 3-4 會直接退件的（照 `SCENE_RULES.md` 9-7，再加三條）
- 同一個模型複製一整排、只換顏色（要多個款式：參考真實世界的不同品牌、年份、大小）。
- 只有 Blender 渲染、沒有遊戲內截圖。
- README 沒有第 3-2 節的八項紀錄。

---

## 4. 審查：LAWWW2-B 怎麼看支援 AI 的成果

1. 先看遊戲內的「平常玩的鏡頭」，再看特寫；**手機直向**優先。
2. 逐項對第 3-2 節；有一項沒達標就寫「要改什麼、改成什麼樣（尺寸、顏色、形狀）」，不寫「再精緻一點」這種話。
3. 小地方我可以直接改支援 AI 的腳本（使用者 20:2x 授權），改了在對方的 README 記一筆（改了什麼、為什麼、SHA）。
4. 驗收紀錄寫在 `aa_support/README.md`、`bb_support/README.md` 那件的段落裡（舊標準／新標準分開）。

---

## 5. 示範案例

`docs/art-rebuild/second_ai/sop_demo/README.md`：溫州街路面（精修第 3 批）＋小公園土地公廟去積木化——修改前後同角度遊戲截圖、腳本、材質做法、參數、驗收紀錄。照著它的格式做。

---

## 6. 給支援 AI 的交件格式（README 一節）

```
## ART-XXX 名稱（交件 SHA；狀態 READY_FOR_REVIEW）
- 參考：照片／規格的來源，實際尺寸表
- 腳本：tools/blender/env_second/<aa|bb>_support/xxx.py；指令
- 輸出：assets/models/env/second_ai/<aa|bb>_support/xxx.glb（三角形、材質、大小）
- 八項紀錄（第 3-2 節的表）
- 圖：Blender 渲染、遊戲內前後截圖（時段、畫面大小）
- 授權：Poly Haven id（LAWWW2-B 合併進 LICENSES.md）
- 沒做到的：……（原因）
```

---

## 7. 跨帳號、接班

- 帳號 A 的 LAWWW2 接班時：先 `git fetch` 這條分支（`claude/funny-albattani-iawshm`）最新的 commit，讀 HANDOFF.md 最上面→這份→`SCENE_RULES.md`→示範案例，把有效成果合併到自己的分支（不 rebase、不 force push），確認理解後才繼續美術工作。
- 不叫醒休班的帳號（D75），只用 GitHub 文件交接。

---

## 8. 版本

| 日期 | 版本 | 內容 | 誰 |
|---|---|---|---|
| 2026-10-16 20:3x | v1 | 第一版：工具鏈、製作順序（參考→造型→材質→磨損→AO→比例→合併→匯出）、八項驗收、審查方式、示範案例 | LAWWW2-B |
| 2026-10-21 12:1x | v2 | 加第 10 節：3D 美術總監的品質標準（玩家鏡頭五項、交付前自我驗收、巡場景順序、BB 驗收、要使用者決定的事） | LAWWW2-C |

## 9. 新方法登記表（新增在下面，舊的不刪）

| 日期 | 方法 | 工具／函式 | 第一次用在 | 誰 |
|---|---|---|---|---|
| 2026-10-16 | 路面整條畫成一張貼圖集＋顆粒法線（每公尺重複，KHR_texture_transform） | `wz_road_tex.py`、`wz_props.py` 的 `road_mat()` | 溫州街路面 | LAWWW2-B |
| 2026-10-16 | 2D 磁磚貼圖集（不糊） | `lib2.atlas_tiles` | 溫州街效能第四輪 | LAWWW2-B |
| 2026-10-16 | 支援素材的擺放：相對錨點節點放 | `wz_park.py` 的 `place_support(path, plan, group)` | 小公園 PARK1～3 | LAWWW2-B |
| 2026-10-16 | 自發光漸層（柱子由下往上） | `campus_socsci.py` 的 `lit_ramp()` | 社科院夜晚 | LAWWW2-B |
| 2026-10-16 | 人物臉的局部修改（眼睛連眼窩皮膚一起縮、眉毛照畫出來的線移動） | `tools/char_polish.py` 的 `eye_socket_pinch()`、`brow_natural()` | 祐廷 3D 臉試做 | LAWWW2-B |
| 2026-10-16 | 單色灰底立繪去背（投影法） | `tools/portraits/cut_reference_portraits.py` 的 `KEY` | 學姊面試西裝 | LAWWW2-B |

---

## 10. 3D 美術總監的品質標準（使用者 2026-10-21 12:0x，UA-LAWWW2-1021-02；LAWWW2 和之後的繼任者照做）

- **來源**：使用者要 LAWWW2 當《法條之外》的 3D 美術總監：
  - 自己找出遊戲裡不夠好的地方，改到自己也認為可以交付；
  - 不是只做被點名的模型；
  - **「模型成功載入」不是完成的標準**。
- 第 2、3 節照舊（怎麼做一件東西、八項紀錄）。這一節管的是「**整個場景在玩家眼裡夠不夠好**」。

### 10-1 玩家鏡頭五項（每個場景都用這五項看，判斷的依據是遊戲內截圖）
| 項目 | 問自己 | 常見的毛病 |
|---|---|---|
| 空間可信度 | 這個地方蓋得起來、用得起來嗎？ | 尺寸不對（門比人矮、桌子太深）；結構說不通（樑沒有柱、樓梯通到牆）；房間沒有出入的動線 |
| 生活真實感 | 有人在這裡生活、工作嗎？ | 樣品屋；每件都對齊網格；牆上什麼都沒有；店裡沒有庫存、價目、雜物 |
| 視覺一致性 | 和隔壁的場景是同一個遊戲嗎？ | 同一條街的細緻度落差大；光的顏色、亮度互相打架；新舊模型風格不同；室內外接起來顏色跳掉 |
| 可玩性 | 玩家走得到、看得懂、不被擋嗎？ | 模型擋住人物、對話框、按鈕；牆淡出以後東西浮在空中；互動點在家具裡面；坐下以後鏡頭看到黑的桌面或牆 |
| 效能 | 手機跑得動嗎？ | draw call、三角形比同類場景多一截；光暈、透明物件疊太多層；材質沒有合併 |

### 10-2 玩家鏡頭要特別看的地方
- **街景**：走在路上的高度往前看自不自然；店門口到座位的路線順不順。
- **教室**：坐下以後窗外的景合不合理（樓層高度、方向）。
- **夜晚**：燈有沒有亮在該亮的地方；有沒有一片死黑或一片過曝。
  - 光暈在白天花板、低天花板上特別容易過曝（2026-10-21 體育館 B1 就是這樣）。
- **牆淡出**：牆淡出以後，東西有沒有浮在空中。
- **遮擋**：模型有沒有擋住人物、對話、UI。
- **時段**：白天、黃昏、夜晚三個時段；直向、橫向；至少兩個鏡頭角度。

### 10-3 交付前自己驗收（沒做的要寫「沒做」）
1. 載入：沒有 JS 例外；GLB 的三角形、材質、大小記下來。
2. 導航、碰撞、互動：
   - 跑 `tests/reachability_all.py --zones <區域>`，加上那個場景的流程測試；
   - 改過座位的跑 `seatcheck`。
3. 時段：白天、黃昏、夜晚的截圖。
4. 多角度：沒有穿模、遮擋、浮空。
5. 效能：
   - 修改前後同一個鏡頭的 draw call、三角形；
   - 變多就寫原因，說明值不值得。
6. 修改前後同角度的截圖，放進交件 README。
7. 測試環境照實寫：
   - Playwright＋SwiftShader 手機模擬、單元測試、瀏覽器流程測試分開寫；
   - **iPhone 實機沒測就寫沒測**。
- 技術問題（導航、碰撞、效能、程式接線）我自己解決，不丟給使用者。

### 10-4 驗收與退件
- 場景美術交件以後請 **BB 做獨立的畫面驗收**；BB 退件，我直接修，不經過使用者。
- 整合、測試、發布照舊：LAWWW 整合；LAWWW2 交 patch 或 GLB，不碰 `main`、不發布。
- 狀態照舊：
  - BB 驗收通過以後寫「BB 畫面驗收通過」；
  - 場景美術的 `ART_APPROVED` 照 D59，只有使用者實際確認才能標；
  - 角色美術由 BB 驗收。

### 10-5 不自己決定、要使用者決定的事
- 遇到下面三種情況：
  - 重大的風格改變（整體色調、畫風、光的方向性）；
  - 替換使用者確認過的設計；
  - 一定要用使用者提供的素材（照片、指定的圖）。
- 處理方式：
  - **保留原設計**；
  - 在 `HANDOFF.md` 寫一筆待決事項（現況、提案、比較圖）；
  - 不假定使用者已經批准；
  - **不因為這件事停下其他場景**。
- 使用者暫停的範圍照舊：
  - 溫州街修改暫停（10-17）；
  - 人物凍結（D99）；
  - 日本場景全 2D（10-18）。

### 10-6 巡場景的順序（照玩家接觸的先後）
- 依序是：
  1. 校園；
  2. 法律系館（霖澤館、萬才館）；
  3. 宿舍；
  4. 公館；
  5. 溫州街（暫停中，只記錄、不改）；
  6. 118 巷；
  7. 室內教室；
  8. 日夜變化；
  9. 交換學期場景（美國）。
- 每一區：
  - 先確認現在開發分支整合的是哪一版（不要重做已經接好的東西）；
  - 用 10-1 的五項拍玩家鏡頭；
  - 列出毛病，排優先順序：卡關、穿模 ＞ 第一印象 ＞ 細節；
  - 改、交件。
- 巡查紀錄寫在 `ART_DIRECTOR_PATROL.md`：區域、日期、開發分支的 SHA、找到的毛病、處理狀態。
