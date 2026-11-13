# 店面 CC0 化：做法、驗收標準、工具（給幫忙的 AI；LAWWW2-C 2026-11-13）

使用者 2026-11-13（UA-LAWWW2-1113-01／02／03）：「三項同時成立：掃描模型、CC0 材質組，以及純色零件少於 25%……寫進規則 每家店都要通過 你做不完就請其他AI幫忙」「請其他AI幫忙的時候要跟它們說你現在的做法和驗收標準 仍然由你驗收」「講你的工具」。
相關規則：CLAUDE.md §9 第 2a 點（D159：店內道具不准是塑膠方塊）、§12 第 2 點（D160：一律用 Poly Haven／ambientCG CC0）。任務 ID：SHOP-REALISM-1112。

---

## 1. 驗收標準（LAWWW2 驗收；過了才轉 LAWWW 整合、BB 判美術）

**機器檢查（一項沒過＝不收）**
1. `node tests/shop_cc0_unit.js`：這間店的 GLB **三項同時成立**——
   - ① `LICENSES.md`「Poly Haven 模型」那一節有一列寫到這個 GLB（店裡真的放了 Poly Haven 掃描模型）
   - ② `LICENSES.md` 的 ambientCG／Poly Haven 貼圖有一列寫到它（用了 CC0 材質組）
   - ③ 沒貼圖的純色零件少於 25%（油漆牆 `…_wall` 不算）
   做好的店要從基準表拿掉：`node tests/shop_cc0_unit.js --write`（同一個 commit）。
2. 這間店原本的單元測試全部照過（例：118 巷 `tests/l118_*`、`tests/*<店名>*_unit.js`；`grep -l <店的 id> tests/*.js` 找）。
3. `node tests/place_gate_unit.js` 只能剩「狀態表過期」那一項（`SHOP_STANDARD_STATUS.md` 不要放進 patch，LAWWW 整合時 `--write` 重產）。

**看圖（我看並排圖判；BB 之後還會再判一次）**

4. **不准一樣大小的方塊排格子**（D159，BB_379 印得好 ① FAIL 的原因）：貨架上的東西要有高低、厚薄、方向、間距的變化；用得到 Poly Haven 模型的優先用模型。
5. **白色、淺色塑膠不准有黑紋**：ambientCG `Plastic006` 這類幾乎全黑的顏色貼圖，校成淺色會放大成大理石紋 → 用 `acg(..., vary=0.05)`（第 3 節）。
6. 天花板不髒：灰泥雲斑壓到 `vary=0.015`（0.04 在暖色店還看得出棕灰雲斑，BB 11-13 判客居、越好吃）；牆照舊平塗（店面測試要牆沒有貼圖）。
6a. **不准比舊版退步**（BB 11-13 判越好吃 FAIL：飲料冰箱從玻璃門看得到飲料變成灰鐵箱）：`_AsTex`／`_Route` 會把「畫成某個顏色的零件」整個換掉，換完逐一看原本有細節的東西（冰箱、燈具、招牌、玻璃櫃）還在不在。
6b. **同一種東西不准同大小同顏色排格子**——就算材質換成 CC0 也一樣（BB 11-13 判聯通 FAIL：手機殼牆、配件櫃）：要有包裝圖案（自己畫一張包裝貼圖集、每一個正面貼一塊，做法見 `tz_shops_interior.py` 東南大聯的 `pkq`）或 Poly Haven 模型，尺寸、角度、款式混搭。
6c. 燈籠、斗笠、布料這類「看得出做工」的東西不准是光滑純色球／平圓片／乾淨色塊（BB 11-13 判越好吃、客居）：用 Poly Haven 模型、或布料材質組＋骨架、流蘇、不規則染邊。
7. 互動點、座位、導航、店員位置**都不動**（只換材質和道具外觀）。要動的話先問我。
8. 面數：一間店 **≤ 6 萬面**（大店 ≤ 8 萬）；Poly Haven 模型一律 `decimate` 到每個幾百～兩千面。

**交件內容（交到你自己的分支，通知我）**
- 並排圖：最上面一列參考圖（使用者給的室內／外觀概念圖），下面每列「改之前｜新版」同鏡頭，至少 3 個鏡頭（門口、從裡面朝門口、近看貨架或櫃台）＋一張晚上（20:00）。
- patch（底＝開發分支最新 commit）：GLB、json、光照貼圖（有烘的話）、建模腳本、`LICENSES.md`、`tests/shop_cc0_baseline.json`。
- 測試結果、面數、用了哪些 CC0 素材。

---

## 2. 做法（照這個順序）

1. **看參考圖**：`docs/art-rebuild/second_ai/ref/`（`gg_shops6_1110/interior/int_*.webp` 室內、`tingzhou_1110/concept/` 汀州路外觀概念圖、`gg_shops6_1110/concept/`）。列出參考圖上看得到的東西。
2. **先拍「改之前」**（換模型之前！）：`fast_shots.py`，鏡頭設定存起來，之後同一份再拍新版。
3. **改建模腳本**，三種手法：
   - **整群換材質**：原本 `vc()` 頂點色方塊照顏色分到材質組（`_Route` 轉接，第 3 節）。形狀不動、最快。
   - **換成 Poly Haven 模型**：收銀機、紙箱、盆栽、椅凳、陶鍋、書……（`ph_put`）。先用 `ph_measure.py` 量原始尺寸和面數。
   - **重做一眼就看得出是方塊的東西**：貨架上的貨（疊法、高低、方向）、螢幕（外框＋發光畫面＋頸＋底座）、印表機（機身＋上蓋＋出紙匣）……
4. **建模＋看面數**：只建模不烘焙（幾十秒），看 `tris`；超過就加大 `decimate`。
5. **先放進遊戲看形狀**（不烘焙）：把建出來的 GLB 暫時蓋到 `assets/models/env/second_ai/<店>.glb`，用 `fast_shots.py` 拍近景。比例錯、方向錯在這一步抓（例：Poly Haven `binder_notebook` 其實是平放打開的筆記本）。
6. **光照烘焙**（走得進去的店）：寫該店的 case（燈的位置照 layout），跑烘焙（約 20 分鐘；**同一台機器一次只跑一個**，**跑的時候不要改那支 .sh**——bash 邊跑邊讀，改了會讀到錯位的內容）。
7. **拍新版**、做並排圖、跑測試。
8. **做 patch**：原始碼＝「開發分支那一份＋只改這間店」。**不要從一大份 diff 裡挑片段**（我 11-13 這樣漏掉過洗樂滾筒的程式）。做完用 patch 的原始碼重建一次模型，大小要和交出去的一樣。

---

## 3. 工具（都在 repo 裡；新容器先跑 `bash tools/blender/setup_env.sh`）

| 做什麼 | 工具 | 用法／重點 |
|---|---|---|
| 下載 CC0 素材 | `tools/blender/env_second/cc0_fetch.py` | `cc0_fetch.acg_material('Plastic006')`（ambientCG 材質組：顏色／法線／粗糙度）、`cc0_fetch.ph_model('cardboard_box_01')`（Poly Haven 模型 glTF）。下載到 `~/.cache/lawstudent_cc0/`，不放 repo。 |
| 找 Poly Haven 模型 | Poly Haven API | `curl -s "https://api.polyhaven.com/assets?t=models" \| python3 -c "import json,sys; print([k for k in json.load(sys.stdin) if 'stool' in k])"`；ambientCG 用網站或 `cc0_fetch` 裡的查詢。 |
| 量模型尺寸、面數 | `tools/blender/env_second/ph_measure.py` | `/opt/blenv/bin/python tools/blender/env_second/ph_measure.py -- cardboard_box_01 ceramic_pot` |
| CC0 材質組 | `tz_shops_interior.py` 的 `acg(name, aid, target=, tile=, vary=)` | `target` 校成要的顏色；**`vary`**＝把顏色貼圖明暗起伏壓到平均亮度的這個比例（塑膠 0.05、灰泥 0.04；不壓會有黑紋、雲斑）。 |
| 自己畫圖案＋CC0 紋理 | `printed(name, pid, draw, weave, amp=)` | 例：影印紙包裝（底色＋標籤＋條紋）×ambientCG Paper001；`amp` 紋理強弱（包裝紙 0.12；0.44 會像髒污）。 |
| 頂點色方塊整群換材質 | `_Route(vc(), ROUTE)`、`_AsTex(mesh('steel'))` | `ROUTE = {'#eceeee': 'plastic_w', '#c4c8cb': 'steel', ...}`，然後 `vc = lambda: _Route(_vc0(), ROUTE)`；表上沒有的顏色照舊頂點色（小東西可以留）。 |
| 放 Poly Haven 模型 | `ph_put(aid, x, y, z, yaw, s, share=, height=, decimate=, recolor=, roll=)` | 遊戲座標；`height` 縮放原型（一個 aid 只有一個原型）、`s` 每一份再縮放；**植物 `share=False`**（共用網格會被烘焙合併改名，光照貼圖擠成小點）；`recolor=(深, 亮)` 改顏色保留紋理；`decimate` 減面。 |
| 單面／疊面 | `L.single_side(root, keep=, nodup=)` | 貼在一起的牆、照片要列進 `nodup`，不然 Cycles 烘成全黑。 |
| 建模 | `/opt/blenv/bin/python tools/blender/env_second/<腳本>.py -- --shop <店> --out <tmp>.glb` | 汀州路／公館三間用 `tz_shops_interior.py`；`--ref docs/art-rebuild/second_ai/ref/gg_shops6_1110/interior` 重產照片貼圖集（有些店的貼圖集沒進 repo，第一次要帶）。 |
| 光照烘焙 | `tools/blender/env_second/lightbake/bake_tz_shops.sh <店>`（內含 `bake_room.py`、`to_webp.py`、`lm_fix_hidden.py`） | 每間店一個 case：面光源（日光燈）、點光源（吊燈、補光）、`HIDE`（玻璃、發光燈條）、`NOLM`（植物、頂點色小東西）。GLB 會帶 `extras.lightmap`，遊戲 `Z3.attachRoomGLB` 自動接，不用改程式。別的腳本照這支寫一支。 |
| 遊戲內截圖 | `tools/blender/env_second/shots/fast_shots.py <url> <鏡頭.json>` | 先 `python3 -m http.server 8767` 開在 repo 根目錄；鏡頭 json：`zone`、`hour`、`pos`、`cam.pos`、`cam.look`、`hideNPCs`、`hidePlayer`（範例：第 4 節）。 |
| 並排圖 | `tools/blender/env_second/shots/cmp_sheet.py` | `python3 …/cmp_sheet.py out.jpg <參考圖> '參考圖標題' old_door.jpg new_door.jpg '門口' …` |
| 測試 | `tests/shop_cc0_unit.js`（`--write`）、`tests/place_gate_unit.js`、店自己的單元測試 | 第 1 節。 |
| 做 patch（不用切分支、不佔硬碟） | git 暫存 index | `export GIT_INDEX_FILE=/tmp/idx; git read-tree origin/<開發分支>; git update-index --add --cacheinfo 100644,$(git hash-object -w <檔>),<路徑>`（每個檔）；`git diff --cached --binary origin/<開發分支> > x.patch`；檢查：另一個 index `read-tree` 後 `git apply --cached --check x.patch`。 |

**踩過的坑**（都發生過）
- `Plastic006` 校成白色 → 黑色大理石紋：`vary=0.05`。
- 灰泥天花板深色雲斑：`vary=0.04`。
- `binder_notebook` 不是立著的資料夾（是平放打開的筆記本）；立著的一排書用 `book_encyclopedia_set_01`。
- Poly Haven 模型面數很高（書一排 2 萬、紙箱 1.7 萬、盆栽 17 萬）：先量、再 `decimate`。
- 烘焙中改 `.sh` → 下一步讀到錯位的內容失敗：先複製一份再跑。
- `>` 導向會先清空檔案：拿 git 舊版蓋模型時，`git show … > 檔` 失敗也會把檔清成 0 bytes。
- 店面測試：牆要平塗（不要給牆貼圖）、天花板網格不能叫 `S_ceil`。

---

## 4. 鏡頭 json 範例（fast_shots.py）

```json
[{"out": "old_door.jpg", "w": 1280, "h": 720, "hideNPCs": true, "hidePlayer": true,
  "state": {"zone": "tz_yindehao", "hour": 13, "pos": {"x": 0.0, "z": 3.6}},
  "cam": {"pos": [0.3, 1.7, 4.6], "look": [-0.3, 1.2, -4.5]}, "wait": 9000,
  "js": "(()=>{ try{ const b=document.querySelector('#dlg'); if(b) b.style.display='none'; }catch(e){} const z=GAME.E.zone; for(let i=0;i<60;i++) z.update(0.016,GAME.E); })()"}]
```

---

## 5. 哪些店（開發分支基準表 46 間；LAWWW-C 派工）

| 群 | 建模腳本 | 店 | 誰 |
|---|---|---|---|
| 汀州路剩下的＋公館三間＋禮貌生財 | `tz_shops_interior.py` | 聯通、東南大聯、客居、越好吃（已改好，烘焙／交件中）、安泰、榮恩典、鮮果、禮貌生財 | LAWWW2-C |
| 118 巷九間 | `lane118_shops.py`（dian、korea、self、tea）；`l118_int_<店>.py`（cafe2、home、noodle2、omu、pasta：L118-SHOPS-REDO-1111 重做的，各自一支） | l118_cafe2、dian、home、korea、noodle2、omu、pasta、self、tea | AA-C（11-13 起；AA-C 抽了共用模組 `cc0_kit.py`） |
| BB 那批 | `bb_support/*_interior.py` | ade、yangyang、nanyang_lobby、xinsheng_sports、bike、corner、shaola、dakou_1f／2f、dabu、tongxian、haopai | 待派 |
| AA 那批＋溫州街 | `aa_support/*_interior.py`、`wz_*.py`、`flower_notes_interior.py`、`cvs_interior.py` | afar、aoki、daybreak、shanlan、cafe230、yejian、daily_offbeat、komichi、mokuyobi、sunnyside、yizhan、lin、wz_teahouse_yard、flower_notes、cvs | 待派 |
| 美國 | `us_market.py` | us_market、us_asian_market | LAWWW-C（子代理） |

（建模腳本是查 `LICENSES.md` 找到的；`daily_offbeat`、`komichi`、`mokuyobi`、`sunnyside`、`yizhan`、`tz_limao` 在 LICENSES 沒寫腳本，開工前 `grep -rl <檔名> tools/blender` 找。）

## 6. 別的建模腳本沒有這套輔助函式：先搬過去（11-13 補，LAWWW-C／AA-C 問的）

`acg`、`printed`、`_Route`、`_AsTex`、`ph_obj`、`ph_put` 都只在 `tz_shops_interior.py`（開發分支版本）的 `if CC0:` 區塊裡（約第 83～223 行；第 224 行起是 `M.update({...})` 材質表）。`lane118_shops.py`、`bb_support/*`、`aa_support/*` 都沒有。搬法：
1. 複製 `if CC0:` 那一整塊（`import cc0_fetch`、`STAGE`、`_stage` 到 `ph_put`），貼在你的腳本「材質表 `M` 和 `mesh()` 已經定義好」之後（它要用 `M`、`mesh(key)`、`root`、`g2b`、`L`、`B`、`np`、`Image`、`Matrix`、`math`）。`PH_PROTO`、`PH_N`、`CC0_USED` 是它自己建的。
2. 檔尾照抄 `tz_shops_interior.py` 第 1686 行起那兩段：匯出前刪掉 Poly Haven 原型（`for p_ in PH_PROTO.values(): bpy.data.objects.remove(p_)`）、印 `CC0_USED`；`L.single_side(..., nodup=...)` 把貼在一起的牆、照片列進 `nodup`。
3. 你的腳本如果用的是頂點色 `vc()` 之類的函式名稱不同，`_Route` 轉接的方法一樣：把原本「拿一個顏色畫方塊」的那個物件包起來，照顏色分到材質組網格。
4. 烘焙：沒有那條街的烘焙腳本就照 `lightbake/bake_tz_shops.sh` 複製一支（例：`bake_l118_shops.sh`），一間店一個 case（燈的位置照那間店的 layout）。也可以先不烘（`attachRoomGLB` 沒有 `extras.lightmap` 就用即時光），三項檢查一樣過得了——但烘了好看很多，能烘就烘。
5. 搬完先建一次「CC0 關掉」的版本，大小要和開發分支上的一樣（確定搬的時候沒動到原本的東西），再開 CC0。

**驗收流程**：幫手交件（自己的分支＋通知 LAWWW2）→ LAWWW2 看並排圖、跑測試，過了轉 LAWWW-C 整合（不過就寫哪裡要改退回）→ BB 判美術 → CC 拍四鏡頭、量效能。
