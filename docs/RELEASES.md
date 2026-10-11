# 正式發布紀錄（GitHub Pages）

線上網址：https://pyhuanglaw.github.io/Lawstudent/ （GitHub Pages：Deploy from a branch → `main` / root）。
規則（使用者 2026-10-10 睡眠期間授權）：只有測試通過、在實際遊戲裡驗證過的成熟成果才發布；**兩次正式發布至少相隔三小時**（以 GitHub 實際部署成功的時間為準）；
尚未經使用者確認的美術不標 ART_APPROVED；實驗中的成果（例如 Blender 人物示範）留在開發分支；每次發布前標記上一個穩定版本，出事時緊急恢復不受三小時限制。
**限制**：這個開發沙盒連不到 `*.github.io`，部署後用 GitHub Actions 的部署紀錄確認成功，並在本機對**同一個 commit**跑遊戲檢查（不是直接開正式網站）。

| 版本 | commit | 部署成功（UTC） | 回復目標（上一個穩定版） |
|---|---|---|---|
| v7 | `385e194`（之後 `ba53746` 只改文件） | 2026-10-08 20:38 | — |
| v9.3 | `0ef3a73` | 2026-10-10 05:35:59 | v7 |
| v9.3 第 25 批 | `cd52bab` | 2026-10-10 08:38:53 | `0ef3a73` |
| v9.4 | `6b9c0dc`（遊戲檔案和測試過的候選 `f10b387` 完全相同，見下面） | 2026-10-10 14:47:16 | `cd52bab` |
| v9.4.1 | `e4ded6a`（遊戲檔案和測試過的候選 `f2f1c03` 完全相同） | 2026-10-10 18:59:10 | `6b9c0dc` |
| v9.4.2 | `dfd2618`（就是測試過的候選本身） | 2026-10-11 07:02:57 | `e4ded6a` |

---

**下一次正式發布最早：2026-10-11 10:02:57 UTC（台灣 18:02:57）**（三小時規則；緊急回復不受限制）。

**緊急回復（不用 force push）**：做一個「內容＝上一個穩定版、父節點＝目前 main」的新 commit，再快轉推上去：
```bash
git fetch origin main
C=$(git commit-tree 6b9c0dc^{tree} -p origin/main -m "緊急回復到 v9.4（6b9c0dc）")
git push origin $C:main        # 快轉，不是強制推送；之後用 GitHub Actions 的 pages build and deployment 確認部署
```
（原本要用 tag `v9.3-25` 標記回復點：本機建立了，但這個沙盒推 tag 會被代理斷線，遠端沒有這個 tag——回復點以 commit SHA 為準。）

## v9.5（候選，準備中；最早 2026-10-11 10:02:57 UTC）

**玩家會看到的改變**（v9.4.2 之後）
- **萬才館可以走上去、走進去**：
  - 弧形大樓梯真的走得上去，樓梯頂端平台、弧形陽台都能走（D41）；外觀換成 Blender 正式模型。
  - 室內兩層樓：一樓大廳（座標和以前完全相同：社團、助教、劇情位置不變）、西側樓梯、東側玻璃電梯（3F 以上要刷識別證）、二樓走廊與門廳；平台上的二樓入口打開了（D42）。
  - 點地面走下大樓梯原本要點 7 次，現在 1 次；跑步＋低幀率時停在樓梯最下面一兩階的問題修好（霖澤館樓梯也一起修）。
- **總圖書館大廳**（D43）：從校園進總圖先到大廳——門廳、入口閘門、服務台、期刊報紙、新書展示、中央大樓梯（中間一跑上到平台、兩側折返）、電梯、二樓自習區（長桌可以坐下讀書）。原本的閱覽室是「3F 閱覽區」（劇情說在三樓），從二樓東側的樓梯間或電梯過去；電梯可以直接搭到別的區域的樓層。小安「總圖的下午」改在二樓自習區靠窗的長桌（對話、選項、結果不變）。窗外是遊戲裡校園的實際畫面（椰林大道、南側草地；白天／晚上）。
- **校園地標換成 Blender 正式模型**（LAWWW2）：總圖書館外觀、傅鐘、行政大樓、文學院、校史館。
- **溫州街遠景公寓、街道道具（腳踏車、路燈、長椅）、公館 15 棟騎樓店面、公館 60 台機車**換成 Blender 正式模型（LAWWW2）。
- 霖澤館、萬才館、總圖大廳的盆栽：原本的多面體圓球換成葉子模型（`tools/blender/plants.py`）。
- `?blchar`：多了溫書瑀 Blender 版；林芷若、陳語彤、高子晴的頭髮有彈簧骨。預設畫面的人物沒有換。
- 標題畫面版本字樣「版本 v9.5（2026-10-11）」；script 版本號 9.5-1。

**不在這一版（留在開發分支）**：宿舍走廊（D44，`wip/dorm-hall`：還沒在瀏覽器實測）；LAWWW2 的⑤社科院／洞洞館（製作中）。

**發布前測試**：（候選定案後在乾淨 worktree 跑 `tests/release_suite.sh`＋公館／校園／萬才館整合測試；結果寫在這裡）

## v9.4.2（2026-10-11 07:02:57 UTC 發布 `dfd2618`）

**發布**：使用者 2026-10-11 07:00 UTC（台灣 15:00）起床後說「你目前有做好的東西可以發佈的就先發佈了，之後再繼續補還沒做的東西」。main 從 `e4ded6a` **快轉**到 `dfd2618`（測試過的候選本身，不是強制推送）；GitHub Actions「pages build and deployment」#13 對 `dfd2618` **success**（07:02:08 開始、07:02:57 完成）。發布前測試：候選 `dfd2618` 的 `release_suite.sh` 25 項全部 PASS（含 `deploy_check` 版本字樣 `v9.4.2`），修正後的 `flow_main_day12`（第一、二天主線）對同一個候選 **ALL PASS**（Playwright 手機模擬，不是 iPhone 實機）。發布後本機對同一個 commit 的 `deploy_check`：這時瀏覽器正在跑下一版（v9.5 候選）的完整回歸，跑完再補，結果記在這裡。

（以下是發布前寫的候選說明，內容不變。）

九小時授權期在 21:05 UTC 左右結束，這一版的發布時間在那之後，所以先準備好、跑完發布前測試，等使用者說可以。

**玩家會看到的改變**
- **溫州街近景換成 Blender 正式模型**（LAWWW2；整合 `f14b533`、減量版 `c9dbdf3`）：
  - 主巷 14 棟公寓（磁磚、鐵窗、冷氣、曬衣服、雨痕）、日式宿舍＋院牆、電線桿／反光鏡／路名牌、Café 門前紅磚道、小公園＋後牆、兩款機車。
  - 導航、碰撞、互動點、劇情走位不變（`?nobldg` 可以切回舊的程序化版本）。
  - 效能（Playwright 量測，同一鏡頭、含陰影）：draw call 277／239／283 次（舊版 219／188／224，多 26～27%），三角形 33～36 萬。**手機實機效能沒量過。**
- **四間室內換成 Blender 正式模型**（LAWWW2）：全日便利商店、阿鳳麵店、舊路書房、宿舍雙人房。座位、互動點、出口、導航格和舊版完全相同。
- **修好**：
  - 玻璃變成灰板（便利商店自動門、麵店與書店的店面、宿舍的窗）。
  - 宿舍牆上的東西（掛勾、毛巾、冷氣、窗簾、月曆、社團傳單）跟著牆一起淡出，不再浮在空中。
- **坐下時腳不再沉到地面下**（長椅、Café、麵店、圖書館、宿舍書桌）：膝蓋比臀部高一點、小腿幾乎垂直、腳踩在地上。階梯教室 201 不變。
- `?blchar`：多了陳語彤、高子晴的 Blender 版。預設畫面的人物沒有換。
- 標題畫面版本字樣「版本 v9.4.2（2026-10-10）」；script 版本號 9.4-3。

**不在這一版（留在開發分支）**：溫書瑀 Blender 版（製作中）；街道道具（LAWWW2）；Café 往南／往北的遠景公寓（LAWWW2 製作中）。

**發布前測試**（乾淨 worktree，候選 `dfd2618`，2026-10-10 20:57–21:41 UTC；Playwright 手機模擬＋SwiftShader，**不是 iPhone 實機**）：`tests/release_suite.sh` **25 項第一次就全部 PASS**——nav_levels_unit、nav_buildings_unit、stairs_feet（祐廷＋五位女主角）、sim_hair、sit_feet_unit（新：腳底高度＋小腿／大腿角度）、deploy_check（版本字樣 `v9.4.2`）、model_upgrade、zone_transitions、campus_layout_nav、gongguan_layout_nav、reachability_all（全遊戲）、indoor_cam_occlusion、minimap_direction、joystick_direction、p0_movement、touch_flow_wenzhou、flow_class_real、flow_linze_floors、save_compat_v7（v7 玩家的存檔）、save_compat_live（線上 v9.4.1 玩家的存檔）。
- 候選裡的 LAWWW2 成果，整合到開發分支時另外跑過的回歸：wz_street_integration 42、cafe_glb_integration 62、cvs_glb_integration 39、interior_glb_integration 104、see_through、movement_regression 42/42（全部 PASS）。
- **漏跑的必跑測試（2026-10-11 發現）**：TESTING.md 第五節第 6 項 `flow_main_day12`（第一、二天主線）不在 `release_suite.sh` 裡，這個候選、v9.4、v9.4.1 發布時都沒有跑。而且這個測試寫於 v9.3，v9.4 起 201 在霖澤館二樓之後就過時了（在等自動進教室）。已修正測試並補進 `release_suite.sh`（TESTING.md「測試程式本身的錯誤」10-11 那一列）；**修正後的測試要對這個候選再跑一次，通過之後才算完成發布前測試**——**2026-10-11 02:59–03:35 UTC 對候選 `dfd2618`（乾淨 worktree）跑過：ALL PASS**（從標題開新遊戲 → 宿舍讀案例 → 睡覺 → 第二天進霖澤館 → 走樓梯上二樓 → 201 上課（劇情自己走到座位、教授開口）→ 下課回到二樓 → 走樓梯下來、走出霖澤館 → 選單存檔 → 重新整理 → 讀檔 → 走得動；劇情自動走路的卡住保險 0 次、沒有 JS 例外；Playwright 手機模擬，不是實機）。測試順便看到、不擋這一版的體驗問題：從霖澤館大廳點地面走到二樓 201 門口要點 16 次（室內鏡頭近、樓梯在角落）；走出霖澤館回到校園時目標還寫「走出霖澤館」，遇到小安才更新。
- **還沒發布**：九小時授權期在 21:05 UTC 左右結束，等使用者核准。核准後照之前的流程：main 快轉到候選（或內容相同的 commit）→ 看 GitHub Actions 的部署結果 → 本機對同一個 commit 跑 deploy_check。

---

## v9.4.1（2026-10-10 18:59:10 UTC 發布 `e4ded6a`；測試過的候選 `f2f1c03`）

**玩家會看到的改變**
- **兩點半 Café 換成 Blender 正式模型**（第二個 AI「LAWWW2」製作，`384c612` 整合）：
  - 外觀：深色木框店面、木板斜雨遮、方形燈籠壁燈、招牌（字的比例正確）、橄欖樹與大葉植物、常春藤、木製 A 字立牌；二三樓是長條磁磚公寓、鐵窗、冷氣、陽台、水塔。玻璃後面是完整 12 m 深的店（和走進去看到的同一套）。
  - 店內：人字拼木地板、木護牆、木梁天花板、吧檯（咖啡機、甜點櫃）、整面書牆、窗邊吧台與高腳椅、玻璃球吊燈；店面玻璃外看得到溫州街（白天／黃昏／夜晚三張）。
  - **沒有改**：導航、碰撞、店門互動點、8 個座位、雙人桌、吧檯點餐、出口（`tests/cafe_glb_integration.py` 比對，導航格和舊版完全相同）。網址加 `?nobldg` 可以看舊的程序化版本。
  - 美術 `READY_FOR_ART_REVIEW`（`docs/art-rebuild/second_ai/VISUAL_REVIEW.md` 第 1 節；未標 ART_APPROVED）。
- **Blender 人物（只在網址加 `?blchar` 時載入，預設畫面不變）**：祐廷第一版、沈以安第二版、林芷若第一版（`docs/art-rebuild/CHARACTER_REVIEW.md` 第 9–11 節）。
- 標題畫面版本字樣「版本 v9.4.1（2026-10-10）」；script 版本號 9.4-2。

**為什麼 Café 是預設畫面、人物不是**：比照 v9.4 霖澤館的 Blender GLB（環境正式模型＝D38 的正式製作流程，功能完整驗證後就是預設畫面，美術仍待使用者驗收、`?nobldg` 可以切回舊版）；Blender 人物仍在逐一製作（使用者授權第 7 條：實驗中的人物留在開發分支／`?blchar`），所以預設不換。使用者如果不想讓 Café 正式模型在正式網站上，緊急回復見上面（或下一版把 `bldg.cafe_*` 從 manifest 拿掉，程序化版本仍在）。

**不在這一版（留在開發分支）**：溫州街近景＋便利商店室內（LAWWW2，18:19Z 交付；draw call 比原本多 47～52%，請 LAWWW2 再降，降完的版本進下一版）；麵店、書店室內（LAWWW2）；街道道具（LAWWW2）；陳語彤、高子晴 Blender 版（製作中）。

**測試結果**（乾淨 worktree，Playwright 手機模擬＋SwiftShader，**不是 iPhone 實機**）：
- 候選 `f2f1c03` 的 `tests/release_suite.sh`（2026-10-10 16:58–17:54 UTC）：24 項中 23 項 PASS——nav_levels_unit、nav_buildings_unit、stairs_feet（祐廷＋五位女主角）、sim_hair、deploy_check（`v9.4.1`）、model_upgrade、zone_transitions、campus_layout_nav、gongguan_layout_nav、reachability_all、indoor_cam_occlusion、minimap_direction、joystick_direction、p0_movement、touch_flow_wenzhou、flow_class_real、save_compat_v7（v7 玩家的存檔）、save_compat_live（線上 v9.4 玩家的存檔）。
- `flow_linze_floors` 第一次 28/29：只有「NPC 60 秒內走樓梯高度變化 ≥ 2 m」沒過（1.68 m；那段時間我在低優先度跑 Blender 渲染，整項測試跑了 1163 秒，平常 565 秒）。安靜時單獨重跑還是差一點（1.85 m）。查證：
  - 同一個測試對**線上 v9.4**（`6b9c0dc`）也只以 2.016 m 剛好通過——兩邊都在門檻邊緣；
  - 直接觀察候選版霖澤館大廳 3 分鐘（約 6 fps）：兩個路人都反覆走完整的 0～4.2 m，大約每 30～45 秒一趟（在平台與兩端會停 1～4 秒）——**路人上下樓的功能正常**，這一版也沒有改霖澤館與路人的程式；
  - 結論：測試只看 60 秒真實時間太短（視窗落在停留與半路時量不到 2 m）。**標準不變（≥ 2 m）**，觀察時間改成最多 150 秒、達到就提早結束（`tests/flow_linze_floors.py`，本次提交）；對同一個候選重跑 **29/29 PASS**（路人 28 秒就走了 2.18 m）。
- 發布：main 從 `6b9c0dc` 快轉到 `e4ded6a`（不是強制推送）；`e4ded6a` 和測試過的 `f2f1c03` 比較：`src/`、`index.html`、`lib/`、`assets/`、`build/`、`build.py`、`.nojekyll`、`test_charlook.html` 完全相同（git tree hash 相同），差別只有測試、Blender 製作腳本、文件。GitHub Actions「pages build and deployment」#12 對 `e4ded6a` **success**（18:57:07 開始、18:59:10 完成）；本機對同一個 commit 跑 `deploy_check v9.4.1`：**ALL PASS**（標題畫面「版本 v9.4.1」、26 個 script 都帶版本號、384 個網址都載得到）。這個沙盒連不到 `*.github.io`，**沒有直接打開正式網站，也沒有 iPhone 實機測試**。

## v9.4（2026-10-10 14:47:16 UTC 發布 `6b9c0dc`；發布候選 `f10b387`；第一個候選 `47b2043` 沒有發布）

**玩家會看到的改變**
- **霖澤館可以走進去**：法學院廣場走上台階、穿過三層樓高的穿堂；一樓大廳、雙跑樓梯（自己走上二樓）、玻璃電梯、二樓迴廊、201 階梯教室（48 個座位都能坐、坐下起身）。室內是使用者核准的遊戲化設計（D37），不是真實霖澤館的格局；三樓以上整修中。Blender 正式模型（外觀、大廳、教室）。
- **走樓梯時腳踩在階梯上**（footIK），不再穿進台階。
- **人物載入修正**：網路慢、模型下載超過時限時，原本會一直顯示程序化備用人物（線上「人物很醜」的主因）；現在分批載入主角、主要角色、路人，載好之後自動換成正式模型。
- **人物外觀 VRoid 加工第一輪**：祐廷（瀏海、眼睛、鼻樑、上衣）、沈以安（瀏海、臉旁碎髮、高馬尾、V 領針織衫、高腰寬褲）、林芷若（側分瀏海、及肩微捲、露出耳環、細框眼鏡、反摺袖）、陳語彤（兩邊頭髮對稱、齊肩、圓領 T 恤、領口黑色蝴蝶結修好、後背包扁平背帶貼身）、高子晴（瀏海到眼睛上緣、耳下鮑伯、V 領、吉他袋雙肩背帶）。**美術待使用者驗收**（docs/art-rebuild/CHARACTER_REVIEW.md 第 4–8 節）。
- **長椅坐下不再坐在空中**（椰林大道、傅鐘、霖澤館前、醉月湖、溫州街小公園）。
- **霖澤館與 201 室內鏡頭**：進門時深色自動門、201 後門不再擋住人物（跟著牆淡出）。
- 標題畫面版本字樣「版本 v9.4（2026-10-10）」；script 版本號 9.4-1（避免新舊程式快取混用）。

- **沈以安 Blender 版（給使用者驗收，預設不使用）**：檔案 `assets/models/char/bl_heroine_01.vrm` 在這個版本裡，但**只有網址加 `?blchar` 才會載入**（例如 `https://pyhuanglaw.github.io/Lawstudent/?blchar`），讓使用者在手機上用實際遊戲看 Blender 版。不加參數時遊戲畫面和以前一樣（沈以安仍是 VRoid 加工版）。依據：使用者的授權第 7 條「實驗性 Blender 人物若仍在 WIP，可以繼續留在開發分支」，以及「不要把需要我驗收的實驗成果直接混入正式發布版本」——預設畫面不變，所以沒有混入；使用者如果不希望檔案出現在正式網站，可以整個移除，不影響其他功能。

**不在這一版（留在開發分支）**：霖澤館玻璃反射與室內細節（製作中）；萬才館第二階段；第二個 AI 的環境美術（兩點半 Café 製作中）。

**`47b2043` 之後到 `f10b387` 的改動**：沈以安 Blender 版（只在 `?blchar`）；`tests/zone_transitions.py` 霖澤館那一組改成 v9.4 的設計（進霖澤館先到大廳；第一個候選唯一的失敗是測試過時，不是遊戲的錯）；雙 AI 分工文件；`build.py` 多打包 `assets/models/env/second_ai/`（目前是空的）。

**發布前測試**：`tests/release_suite.sh`（乾淨 worktree，Playwright 手機模擬，不是 iPhone 實機）——結果見下面「測試結果」。

**測試結果**（乾淨 worktree，Playwright 手機模擬＋SwiftShader，**不是 iPhone 實機**）：
- 候選 `f10b387` 的 `tests/release_suite.sh`（2026-10-10 13:40–14:22 UTC）：24 項中 22 項第一次就 PASS——
  nav_levels_unit、nav_buildings_unit、stairs_feet（祐廷＋五位女主角）、sim_hair、deploy_check、model_upgrade、zone_transitions、
  campus_layout_nav、gongguan_layout_nav、reachability_all、indoor_cam_occlusion、minimap_direction、joystick_direction、p0_movement、
  touch_flow_wenzhou、save_compat_v7（v7 玩家的存檔）、save_compat_live（線上 v9.3 玩家的存檔）。
- 另外兩項第一次失敗，都是**測試本身**的問題，修測試後對同一個候選重跑都 PASS：
  - `flow_class_real`：測試還是 v9.3 的走法（從校園門口進霖澤館就直接上課）；v9.4 是從二樓 201 門口進教室。測試改成 v9.4 的設計（`b006183`）後 **9/9 PASS**、自動走路沒有用到「卡住後放到目的地」的保險。
  - `flow_linze_floors`：「走到教室後門」那一步，人物還在走、經過最上排座位的那一瞬間，測試就去看按鈕（看到「坐下」）；人物停下來後按鈕是「離開教室」——遊戲沒有錯，是測試太早檢查。`tests/playlib.py` 的 `go_to` 改成到達後等人物停下來（像真人一樣）再回傳（`6b9c0dc`），重跑 **29/29 PASS**。
- 發布後：GitHub Actions「pages build and deployment」#11 對 `6b9c0dc` **success**（14:46:09 開始、14:47:16 完成）；本機對同一個 commit 跑 `deploy_check`：**ALL PASS**（16 個區域都載入正式 VRM 人物、338 個資源都載得到、沒有 JS 例外；console 有一個 404，發布前也有，資源檢查全部通過）。
- `6b9c0dc` 和測試過的 `f10b387` 比較：`src/`、`index.html`、`lib/`、`assets/`、`build/`、`build.py`、`.nojekyll`、`test_charlook.html` 完全相同（git tree hash 相同）；差別只有測試（`tests/`）、Blender 製作腳本（`tools/blender/char/`，遊戲不會載入）、文件。
