# LAWWW2 交接紀錄（隨時更新；工作階段中斷時從這裡接）

值班登記：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜分支 claude/second-ai-env-art｜接班基準 `1f20126`（＋合併 LAWWW `cb399ea`）｜2026-10-13 12:35 UTC（使用者：「我回來了，請同步 GitHub 最新進度，接續工作。」）
上一班：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜最後 commit `1f20126`（2026-10-11 10:14 UTC）｜正常交班；中間沒有人接班（LAWWW2-B 沒有建立，遠端沒有別的 LAWWW2 分支）
交班紀錄：2026-10-11 10:13 UTC 交班（`1f20126`）→ 2026-10-13 回到帳號 A。
使用者 2026-10-13：帳號 B 暫時沒有開，從上次停下來的地方接著做。

**2026-10-14 02:3xZ（最新）：使用者調整優先順序（原文已轉給 LAWWW，P0）**——黃金葛降為低優先（不再精修；小道具以後集中成一批）。LAWWW2 的佇列：①醉月湖、湖心亭的導航與穿模 → ②總圖 3F 閱覽區 → ③行道樹已確認的整合問題 → ④BB 驗收通過的主要角色 3D（芯慈、芷若、杜可昕）→ ⑤其他影響遊玩的場景問題。
- **⑦行道樹交付** `4c1e81b`（VISUAL_REVIEW 第 15 節；patch 在 469ae8c、3f3d56a 都 apply 得上）：公館「沒有標記的群組」修好（記號材質 visible=false、拿掉只裝記號的群組）；溫州街三角形 +3–4% 還是照實寫，選項給 LAWWW。WIP 備份 `claude/second-ai-env-art-wip-trees` `22ff594`。
- **黃金葛暫停** `2baa5ac`：`prop_pothos.glb` 2,538 三角形、Blender 渲染；遊戲內截圖沒做完。宿舍 `dorm_interior.glb` 筆筒移到書堆和筆電中間（放盆栽時一起換）。
- **芯慈 WIP** `eadec42`：開襟衫敞開＋整件白 T、髮髻往下、髮色調亮；之後：白 T 領口降到脖子根部（已改程式、還沒算圖）、瀏海改 bangA／B（已改程式、還沒算圖）。工作檔 `scratchpad/char/xinci/x_face.blend`（`--from-blend` 只重做衣服、頭髮）。
- **醉月湖實測**（進行中）：`tools/blender/env_second/shots/lake_integration_check.py`，在 LAWWW `3f3d56a`（`/home/user/lawwwtip_wt`、伺服器 8790）用 Playwright 攔截換上 `scratchpad/lake_proto/src/zones3d.js`（fallback＋亭子 2.0 m＋擋柱子＋地板高度 0.05）與 campus_lake.glb；不改任何工作目錄的 src。
- 杜可昕：art_reference README 寫「待使用者重傳完整版」，repo 裡沒有參考圖 → 到她的時候還沒有就告訴 LAWWW，不猜。

**2026-10-14 00:5xZ**：LAWWW 00:23Z、00:38Z 兩則（P1）**在通知佇列裡，00:42Z 才讀到**（又漏讀一次：每個 checkpoint 一定要 `ReadNotifications`）；00:4xZ 已回 ACK（DELIVERED）。決定：
- **⑨ 校門不做**（算在使用者暫停的「新建築外觀」）。佇列：⑪ → ⑩ → ⑦ → 博雅官方平面圖對照（只寫差異表，不改模型）→ **角色模型（D59：角色美術改由 BB 驗收；我照 BB 通過的參考圖改 Blender／VRM；第一位芯慈（整齊低髮髻）、第二位芷若（淺色細金屬圓框眼鏡），開工前先把順序告訴 LAWWW；清單 `origin/claude/story-planning:docs/story_planning/art_reference/README.md`，用 git show 拿、不 merge）**；後備：吉他社社辦（等 AA）。
- **博雅官方平面圖 BLOCKED**：使用者給的 aca.ntu.edu.tw、ga.ntu.edu.tw 兩個網址沙盒連不到（curl 403、WebFetch ENOTFOUND），已回報 LAWWW、已請使用者加 Allowed domains 或直接上傳 PDF；**不猜**。
- **⑦**：src patch 等 v9.6 之後才接；溫州街三角形 +3–4% 照實寫。乾淨 `469ae8c` 對照（`test_logs/trees_469ae8c/base_469ae8c/`）：campus_glb（5 項）、wz_street（導航）、street_props（兩區導航）、campus_layout_nav（新系館）**乾淨版一樣沒過、數字相同→不是 ⑦**；gongguan_glb **乾淨版全過→⑦ 造成**（正式模型那一輪少一個空群組，`scratchpad/gg_groups.py` 查是哪一個）；reachability_all 乾淨版在跑。模型、腳本、貼圖、測試已搬進交付分支（`6fc622d`），src 只交 patch。
- **⑩**：石頭貼圖拉成條紋（球面 UV 接縫）→ 共用頂點＋每面投影；木棧道加寬到 2.3 m（欄杆內側 ±1.055，遊戲走得到的身體最多 ±1.03，不用改導航）；亭子的導航建議用 `shots/lake_nav_check.py`（遊戲的 canStand／simWalk）量。Blender 渲染重出了（scratchpad `lake/`）。
- 背景鏈 `scratchpad/after_base.sh`（**跑的時候不要改這個檔**）：乾淨版 reachability → ⑪ 原型 → 湖的導航量測 → ⑩ 原型 → ⑦ 前後截圖 → gg_groups。

**2026-10-14 00:1xZ**：①②③ 交付後照佇列做 ⑦⑪⑩（⑨ 要先問 LAWWW 算不算使用者暫停的「建築外觀」）。BB 23:28Z 直接要「角色 3D 對照清單」→ 照第 10 節轉給 LAWWW（P1，沒有開工），等它決定。
- **⑦行道樹**（`claude/second-ai-env-art-wip-trees` `141fe09`＝LAWWW `469ae8c`＋⑦；本機 `/home/user/trees_wt`、伺服器 8782）：重新驗收中。樹皮減面（看不出差別）；`street_trees_integration` 35 PASS／1 FAIL（**溫州街三角形 +3.3–3.7%**，draw call 通過；校園 −20～−31%、公館 −11～−14%）——**不改測試標準**，交付時照實寫、請 LAWWW／使用者選。其他回歸跑中（`scratchpad/trees_rest.sh`）：`campus_glb_integration` FAIL（共同／大一女舍外框、導航、鏡頭碰撞、效能——看起來和樹無關）、`gongguan_glb_integration` FAIL（多一個空群組：大概是 ⑦ 的 `street_trees_field`，要在遊戲裡確認）、`wz_street_integration` FAIL（導航多 6 格——樹的測試裡兩輪相同，看起來和樹無關）→ 跑完後在乾淨的 `469ae8c`（`/home/user/base_wt`、`scratchpad/base_tests.sh`、伺服器 8783）跑同樣的測試分清楚。src 的 patch：`docs/art-rebuild/second_ai/patches/street_trees_469ae8c.patch`（還沒 commit）。VISUAL_REVIEW 第 15 節的草稿與填寫腳本在 trees_wt 的 `drafts/`（會照實寫沒過的項目）。
- **⑪總圖 3F 閱覽區**：`library_3f.py`＋`lib3f_atlas.py` → `library_3f.glb`（`856467d` 是第一版；之後改了：牆的粉光貼圖（原圖像水漬，變化只留 22%：`textures/gen/l3_plaster.png`）、椅子木紋、後牆中間的壁柱拿掉（擋到「3F 閱覽區」）；還沒 commit）。Blender 渲染在跑；遊戲內原型（`scratchpad/lib3f/g/before.json`、`after.json`，在 fix2_wt `9884d29`＝閱覽室和 `469ae8c` 一樣）等回歸跑完再拍；第 30 節草稿 `drafts/lib3f_review.md`。
- **⑩醉月湖**：`campus_lake.py` → `campus_lake.glb`（1.1 MB、8,448 三角形：石砌湖岸（照 lake() 的外形、木棧道缺口）、18 顆置石、六角湖心亭（凹曲面屋頂、翼角起翹、寶頂）、木棧道＋欄杆＋木樁；湖的本地座標）；預覽場景 `shots/lake_preview.py`；渲染排在 ⑪ 之後。**還沒 commit**。

**2026-10-13 23:3xZ**：③**吉他社社辦一頁提案交付**（PROPOSAL、不建模；`research/吉他社社辦_提案.md`）：萬才館東邊整塊走不到；建議 A＝霖澤館與萬才館之間的空地（x 54.5～72、z −118.6～−102.5）北半邊放一棟 13×7 m 的一層樓社團辦公室（兩間 6×5 m＋騎廊，門朝南；北牆貼走不到的範圍、不留窄縫）；B 萬才館大廳加一扇門、C 地下室；遊戲內位置截圖（紅框，不是模型）、室內示意平面（吉他牆、圍成一圈 7 張椅子、木箱鼓、沙發、白板、長桌）。**LAWWW 22:01Z 的 ①②③ 全部交付**；接著 ⑦⑨⑩⑪（R2 還在等平面圖／照片）。

**2026-10-13 23:3xZ**：②**系籃球場交付**（位置 PROPOSAL＋`bball_court.glb` `MODEL_READY`；`research/系籃球場_位置提案.md`、VISUAL_REVIEW 第 29 節）：兩個候選都在 LAWWW `9884d29` 本機注入拍了原型（俯視、地面、17:45、手機直向）——**A 醉月湖東側 (−4, −113)**（建議：範圍內什麼都沒有、方向和真實一樣、霖澤館走 30 m）、B 男一舍與體育館之間 (48.5, 67)（場內有一棵樹要移走、夾在兩棟樓中間）；接法表（籃架柱子、長椅、活動點的世界座標）在提案第 4 節；**位置要使用者選**。`nav_map.py` 加 `--raw`／`--from-raw`（存一次導航格，之後不開遊戲再畫）、`--label`、`--fs`；方案 A 校園的格子存在 scratchpad `campus_nav_9884d29.json`（沒有 commit）。**接著**：③吉他社社辦一頁提案（霖澤館與萬才館之間的空地 x 54.5～72、z −118.6～−102.5；候選平房 13×7 m；遊戲內位置截圖在跑）→ ⑦⑨⑩⑪。

**2026-10-13 23:2xZ**：①**社團博覽會交付**（LAWWW 22:01Z ①；`club_fair.glb` `MODEL_READY`＋配置 PROPOSAL，VISUAL_REVIEW 第 28 節：9 頂 3×3 m 帳篷在 z 15.1、轉 π 面向大道；服務台換掉開發分支 `e3e5811` 的公告欄 (−13.5, 14.6)、互動點 (−13.5, 13.6) 不動；法服換掉 (−18, 14.5) 的招生攤位；z 8～13、長椅左右 1.6 m 留空；9 個網格、1 個材質、7,158 三角形、0.54 MB；原型在 `9884d29` 拍，那一版還沒有公告欄，所以只藏了招生攤位）。②LAWWW `1eabc22`（23:00Z）接的是 **167fc2d 的舊坐姿替身**（f2、m1、m2 腿沒彎）——`8187dbc` 的新檔 49 個節點名稱、材質和舊檔完全一樣，**直接換檔**就好；交付訊息裡再提一次（P1）。**接著**：②系籃球場位置提案（`research/系籃球場_位置提案.md` 草稿：A 醉月湖東側 (−4, −113)、B 男一舍與體育館之間 (48.5, 67)；導航圖、俯視截圖在 scratchpad `court/`；模型 `bball_court.glb` 已做好）→ ③吉他社社辦一頁提案（`research/吉他社社辦_提案.md` 草稿：霖澤館與萬才館之間 x 57–71、z −121～−114 的一層樓社團辦公室）→ ⑦⑨⑩⑪。

**2026-10-13 22:5xZ**：①**桌上小物交付**（`desk_props.glb` `MODEL_READY`，VISUAL_REVIEW 第 27 節：17 種單件＋講堂 lset／自習桌 tset／圓桌 rset／手上 hold 共 15 組×2 LOD；一個材質、螢幕自發光；擺放檢查含雙人桌中間的插座盒）②**坐姿替身的腿修正**（自己發現：f2、m1、m2 的腿沒有彎＝抬大腿的旋轉方向寫反；`seated_figures.py` 改成先抬膝蓋＋加檢查；第 24 節加更正說明、修正前後對照，圖全部重拍；LAWWW 22:35Z 已 merge 舊版但還沒接 → 22:4xZ P1 請它接新版）③**社團博覽會**（LAWWW 22:01Z ①）：配置圖 `shots/clubfair_plan.py`（PROPOSAL：9 頂 3×3 m 帳篷沿大道南側、服務台在原本公告欄的位置）＋攤位模型 `club_fair.py` → `club_fair.glb`（9 攤、7,158 三角形）；遊戲內原型、Blender 渲染在跑（背景）→ 第 28 節 → 交付。**之後**：②系籃球場位置提案（ntu.edu.tw、維基百科都連不到；搜尋摘要：舊體（N14）在垂葉榕道旁、操場右側，左右兩側有籃球場；新生一、二籃球場在網球場與新生車道入口旁、靠新生南路；綜合體育館在新生南路與辛亥路口）→ ③吉他社社辦一頁提案 → ⑦⑨⑩⑪。本機：`/home/user/fix2_wt`＝LAWWW `9884d29`（伺服器 8797；**assets 裡有沒 commit 的 desk_props／furniture_study／seated_figures／club_fair GLB 複本，不要 commit**）。

**2026-10-13 21:3xZ**：這一輪交付三樣（都只有新檔、`MODEL_READY` 或素材，**都還沒接**）：①坐姿替身＋門模組 `167fc2d`（VISUAL_REVIEW 第 24、25 節）②鏡頭穿牆第二輪重拍 `815fdaa`（LAWWW `068f671`＋`8234015`，在 `9884d29` 乾淨 checkout：36 例穿牆 0；貼到頭頂上方放開 3 秒後 10→0；公告欄黑塊沒了；聽眾第一個畫面站著 16→0，測試在修改前失敗、修改後通過；CAMERA_WALLS 第 6 節）③博雅窗外景 `c15a648`（`assets/models/env/views/boya_{south,2f_south,2f_north,north}_{day,night}.webp`，遊戲畫面不是照片；一樓北面窗建議等 R2 把 103 搬走；VISUAL_REVIEW 第 26 節）。21:3xZ 傳 LAWWW P2（窗景接法＋下一項），DELIVERED、等 ACK；LAWWW 在準備 v9.6（候選 `5f66b67`），我的東西進下一版。**下一步**：照使用者 U6 分工做**桌上小物**（筆記本、筆、筆電、手機、水杯、書、法典；instancing、一個材質、和 furniture_study 同一套原點約定；補坐姿替身缺的筆記本與手機）；LAWWW 排別的就照它的。R2 核對等使用者的平面圖／照片（沙盒打不開 ntu.edu.tw、wikimedia）。本機：`/home/user/fix2_wt`＝LAWWW `9884d29`（伺服器 8797）、`/home/user/fix_wt`＝`dae1da3`（8796；有沒 commit 的 GLB 複本，**不要 commit**）。

**2026-10-13 20:4xZ**：LAWWW 20:02Z ACK 分工（U6）、R2 等平面圖、坐姿替身用「預先烤配色、每種一個網格」、門模組排在坐姿替身之後；我回了 ACK＋更正（遊戲裡還有關著的 103）。這一輪做完：①**坐著的聽眾替身** `seated_figures.glb`（`MODEL_READY`，VISUAL_REVIEW 第 24 節）：只用路人底模 npc_f1/f2/m1/m2；聽講／抄筆記／滑手機×2 配色＝24 種外型×LOD0（約 1,500）／LOD1（約 350）；和講堂椅同一個原點；一個材質（2048×1024 貼圖集＋自發光 0.3）；工具 `seated_figures.py`、`uvpack.py`（自己打包 UV：背景模式的打包只用到 1–8%）、`glb_share_geometry.py`（兩種配色共用頂點）②**教室門模組**（在 `furniture_study.glb`：`door_frame`、`door_leaf_open`（貼牆）、`door_leaf_closed`、`door_plate`；第 25 節）。遊戲內都是本機注入的原型截圖（`/home/user/fix_wt` 有沒 commit 的 GLB 複本）。**注意**：20:03Z 左右容器重開過，本機伺服器都停了（8796 已重開；8793 等沒有）。**下一步**：等 LAWWW 回覆 → 博雅窗景／北面窗建議；LAWWW 修好鏡頭 A／B 後重拍；照片／平面圖拿到後做 R2 核對與外觀比對。

**2026-10-13 19:2xZ**：使用者晚上的決定（照片來源、博雅 R2＋三條件、鏡頭穿牆最優先、101 不先做 400 個人物、整合順序 ①–④、**報告與分工確認之前不開新的外觀**）→ 已轉給 LAWWW（P1，等 ACK）。這一輪做完：①**鏡頭穿牆固定案例** `CAMERA_WALLS.md`（LAWWW `babb8c8`→`dae1da3`：一般 19/24→0/24、門口 2/12→0/12；修改後新問題：貼牆時鏡頭到頭頂上方 10 例、普通門廳公告欄一大塊黑；教室沒有門片）②**檢查報告更新** `FOUR_BUILDINGS_REVIEW.md` 最上面「★ 晚上更新」U1–U6（照片來源取代「沒有照片」、**R2 修正版**：101 挑高 192 席＋102／103 背對背各 80 席＋自習區沿用 LAWWW 第二版（12 小桌＋2 圓桌）、整合狀態五欄、分工）；研究文件也更新 ③**家具模組** `furniture_study.glb` `MODEL_READY`（VISUAL_REVIEW 第 23 節）。**沙盒打不開** ntu.edu.tw、wikimedia：照片比對沒做（要使用者開網域或貼圖）。本機測試目錄：`/home/user/fix_wt`＝LAWWW `dae1da3`（伺服器 8796；**有一個沒 commit 的 furniture_study.glb 複本，不要 commit**）、`/home/user/dev_wt`＝`babb8c8`（8793）。**下一步**：等 LAWWW 回 R2 修正版與分工 → 聽眾坐姿替身（#52）→ 門的模組（如果 LAWWW 排）→ 照片拿到後做外觀比對。

**2026-10-13 18:4xZ**：**新社科院外觀交付**（VISUAL_REVIEW 第 22 節；`campus_socsci.py`；本機測試目錄 `/home/user/soc_wt`＝LAWWW `babb8c8`＋接線，伺服器 8795，**不要 commit**）。LAWWW 18:05Z 回覆檢查報告 a–d：共同＋大一女舍已接（`f3a18d6`）；鏡頭穿牆、門框、椅子 instancing、聽眾坐好才顯示由 LAWWW 修；101 先維持（R2／R1 等方案 A 驗收）；自習區照提案改配置。**我的佇列**：自習雙人桌＋椅、圓桌＋椅、講堂椅模組（`furniture_study.py` 第一版太像方塊，正在改成真的造型：彎管椅腳、有弧度的夾板、圓角）→ 聽眾坐姿替身（LAWWW 的 VRoid 人物、6–8 種）→ 博雅窗景／北面窗建議。普通、博雅新外觀等方案 A。

**2026-10-13 17:2xZ**：使用者轉來 ChatGPT 審查（重點：真實辨識度、室內比例、實際遊玩；第 1–6 點）。做了：在 LAWWW `93b93b5` 的乾淨 checkout（`/home/user/dev_wt`，伺服器 8793，**不要 commit**）實際截圖＋效能＋鏡頭穿牆掃描＋聽眾坐姿檢查＋平面比較圖 → `FOUR_BUILDINGS_REVIEW.md`（PROPOSAL）；整合狀態核對（只有 `f0bab8c` 進了開發分支；我的分支整個合進去沒有衝突）；共同、大一女舍接線 patch `patches/gongtong_freshman_wiring_93b93b5.patch`（`/home/user/patch_wt`＝93b93b5＋patch＋兩個 GLB，伺服器 8794，**不要 commit**）。已傳 LAWWW 兩則 P1（整合順序；檢查結果＋問題 a–d），等回覆。**下一步看 LAWWW 回覆**：它同意整合路徑之前不開新的外觀（使用者第 5 點：避免模型累積沒進可玩場景）；可以做的是講堂椅、自習桌椅 instancing 模組、聽眾坐姿替身（要 LAWWW 同意）。

**2026-10-13 16:5xZ**：**共同教學館外觀＋大一女舍外觀已交付**（VISUAL_REVIEW 第 20、21 節；接線說明 20.5、21.5；LAWWW 接）。新社科院（使用者 2026-10-13：現代台大平行校園）：需求原文 `requests/2026-10-13_新社科院.md`、參考資料與一頁規劃 `research/新社科院_參考資料與規劃.md`（PROPOSAL，等 LAWWW 回可不可以整合、等使用者看）。下一步：LAWWW 回覆社科院規劃 → 社科院圖書館外觀＋大樓外觀（照 LAWWW 16:19Z 的方案：圖書館 x 95–125、z −92～−70；大樓 x 99–123、z −62～−42）→ 普通、博雅外觀（LAWWW 照方案 A 放位置）→ 教學館室內（讀 LAWWW 的 gongtong／putong／boya 配置，教室排距 2.0 m）→ ⑦⑨⑩⑪。本機：`/home/user/gt_wt`（臨時工作目錄，zones3d.js 有本機接線＋大樹牆略過，**不要 commit**；伺服器 8792）。每次 checkpoint 都要 ReadNotifications。

**2026-10-13 接班後的進度（最新在這裡；下面的表是交班時的狀態）**：⑤⑥ 已交付（`451d032`）；⑬ 已交付（`f3212c0`）；**法律學院圖書館已交付**（15:1xZ，merge `a9a227a`：GLB 2.77 MB、萬才館的門、窗景、VISUAL_REVIEW 17；READY_FOR_ART_REVIEW，等 LAWWW 整合、使用者看）；四棟參考研究第一、二輪（`7129157`）。**下一步**：⑭ 118 巷（`/home/user/lane_wt`，已合併交付分支，`lane118_fill.py` 改成第 18 節）→ ⑫ 腳踏車（`/home/user/bike_wt`，第 19 節）→ **共同教學館外觀**（LAWWW 規格：中心 (2,33)、ry=π、24×14、北面正門、西側 5 m 木造迴廊；**沒有照片**，已請使用者提供）→ 大一女舍外部（A (-108,68)、B (-78,66)、各 24×12×5 層、2 樓天橋）→ 普通、博雅（等使用者選 A／B）→ ⑦⑨⑩⑪。LAWWW 的訊息會「顯示送達但沒出現在對話裡」——**每次 checkpoint 都要 `ReadNotifications`**（2026-10-13 漏讀 4 則）。

規則見 `WORK_RULES.md` 第 6 節。分工、佇列以 LAWWW 的 `docs/SECOND_AI_HANDOFF.md`、`docs/DUAL_AI_BOARD.md` 為準；跨帳號接班照 `docs/AI_SESSION_HANDOFF.md`（D49）。**LAWWW 的訊息可能「顯示送達、但沒出現在對話裡」**：每次 checkpoint、每次交付前都 `git fetch` LAWWW 的開發分支讀看板。

## 目前（2026-10-11 10:13Z，交班時）

**使用者 10:05Z：週使用量 98%，可能隨時停。下面每一條的遠端 SHA 都用 `git ls-remote origin 'refs/heads/claude/second-ai*'` 確認過；本機五個工作目錄都沒有未提交、未推送的東西。**

LAWWW 09:58Z 的佇列（看板備援）：店家窗景 → ⑤⑥ → ⑬ → ⑭ → ⑫ → ⑦（快好可以先交）→ ⑨ → ⑩ → ⑪。
LAWWW 07:30Z、07:52Z、09:21Z 的 send_message 沒有出現在我的對話裡（09:47Z 讀看板才知道）——**接手的人每次 checkpoint、交付前都要 `git fetch` LAWWW 的 `claude/confident-ritchie-8rwh7t` 讀 `docs/DUAL_AI_BOARD.md`**。

| 工作 | 狀態 | 遠端分支 | 遠端 SHA | 做完 | 還沒做／沒測 | 下一步 |
|---|---|---|---|---|---|---|
| 店家窗景（cafe、cvs、noodle、bookstore 白天／晚上） | 完成，**可整合**（交付訊息要傳給 LAWWW） | `claude/second-ai-env-art` | `f0bab8c` | 8 張 `assets/models/env/views/<名稱>_{day,night}.webp`（1024×512、fov 53.13、11:00／20:30）、`tools/shots/shop_views.py`、景深 `tools/shots/shop_views_depth.json`（中位數／平均：cafe 7.1／11、noodle 9.5／23.5、bookstore 9／16.7、cvs 9.5／24.1 m）、`fast_shots.py` 加 `post` | 景深建議值要 LAWWW 決定（中位數被近處地面拉低；窗戶看到的主要是地平線附近 30–70 m 的街景）；**cafe 方向**：room() 的窗在右牆（+z 側緊貼轉角公寓），所以拍的是店面往西看溫州街，要 LAWWW 確認 | 傳交付訊息（草稿見下）、等 ACK |
| ⑤洞洞館、社科院 | 驗收完成（VISUAL_REVIEW 13） | `claude/second-ai-env-art-wip-pavsoc` | `8c6f1fe` | 兩個 GLB、匾額修正、測試三輪 | — | 和 ⑥ 一起交 |
| ⑥花台、公告欄、販賣機 | 收尾：已合併 ⑤＋AI-1 `8afdece`；販賣機改亮；前後截圖（WebP）、`5b21aa0` 那一輪完整回歸 log（`test_logs/props6_5b21aa0/`，全部通過） | `claude/second-ai-env-art-wip-props6` | `f2fe6ae` | 模型、接法、Blender 渲染、截圖、ASSET_INVENTORY、LICENSES | **合併 `8afdece` 之後的回歸只跑了第一項**（10:07Z 開始、交班時停掉：`street_props_integration` ALL PASS、`campus_glb_integration` 中斷、其他沒跑；`test_logs/props6_8afdece_partial/README.txt`）→ 重跑全部：`bash tools/blender/env_second/run_props6_acceptance.sh docs/art-rebuild/second_ai/test_logs/props6 tests http://127.0.0.1:8781/index.html`（工作目錄開 8781 server）→ `python3 docs/art-rebuild/second_ai/drafts/props6_fill.py`（VISUAL_REVIEW 14）→ merge 進 `claude/second-ai-env-art` → 傳訊息（草稿 `msg_p56` 的內容寫在下面） | 跑回歸、填文件、交付 |
| ⑦行道樹 | `WORK_IN_PROGRESS`：已合併 ⑤⑥（`9b488e0`）、LICENSES／ASSET_INVENTORY 加好 | `claude/second-ai-env-art-wip-trees` | `d7916da` | 葉片貼圖、四款樹＋遠景卡片 GLB、記號＋TreeField（townkit3d.js）、單元測試 ALL PASS、Blender 渲染、VISUAL_REVIEW 15 草稿＋填寫腳本 | 合併交付分支最新 → `bash tools/blender/env_second/run_trees_acceptance.sh docs/art-rebuild/second_ai/test_logs/trees all http://127.0.0.1:8782/index.html`（約 1.5 小時）→ `trees_fill.py` | 驗收、交付（預告：`?nobldg` 那一行加 `prop.trees`、開機預載多 1 MB） |
| ⑬辜先生紀念圖書館室內 | `WORK_IN_PROGRESS`（草稿） | `claude/second-ai-env-art-wip-soclib` | `3b4b201` | `tools/blender/env_second/soclib_layout_gen.py`（30×22×5.6 m：樹狀柱、閱覽長桌 4 張 24 座、北／西窗邊座位 33、林間書房 4 組弧形竹書架、入口閘門、服務台、閱報區；格子檢查：65 個座位都走得到）、平面草圖 `drafts/soclib_plan_draft.webp` ；`src/data/soclib_layout.js` 已產生（20 支柱、50 個天窗、導航阻擋 rects／circles）；Blender `soclib_interior.py` 初稿寫好（**還沒執行過**：`/opt/blenv/bin/python tools/blender/env_second/soclib_interior.py -- --preview <資料夾>`，天花板挖洞用 `bmesh.ops.triangle_fill` 要確認洞有沒有挖出來） | 跑腳本修錯 → 渲染（`render_cycles.py`＋preview 的 views.json）→ 看圖調整（柱子的密度、書架的排法）→ GLB 規格 → 交給 LAWWW 接線（新區域、導航用配置的 nav、座位） | 接著做 |
| ⑭118 巷街景 | 還沒開工 | — | — | — | 照 LAWWW `src/data/lane118_layout.js`（`6011a8a`）做 Blender 街景 | ⑬ 之後 |
| ⑫騎車用的腳踏車 | 還沒開工 | — | — | — | `tools/blender/env_second/bike_ride.py` → `assets/models/env/bike_ride.glb`；節點 frame／fork／wheel_f／wheel_r／crank／pedal_l／pedal_r；**尺寸表我出**（座墊頂、把手握點左右、五通、曲柄長、踏板中心、輪徑、軸距；公尺、車朝 +z、地面 y=0）；側面／45° 渲染＋樞紐說明 | ⑭ 之後 |

### 交班時的遠端 SHA（2026-10-11 10:1xZ，`git ls-remote origin 'refs/heads/claude/second-ai*'` 確認）

- `claude/second-ai-env-art`：這份文件所在的 commit（`git log -1 origin/claude/second-ai-env-art`）——店家窗景（可整合）、交接紀錄、看板
- `claude/second-ai-env-art-wip-pavsoc`：`8c6f1fe`（⑤，驗收完成）
- `claude/second-ai-env-art-wip-props6`：`f2fe6ae`（⑤⑥，合併 8afdece 後的回歸要重跑）
- `claude/second-ai-env-art-wip-trees`：`d7916da`（⑦，驗收沒跑）
- `claude/second-ai-env-art-wip-soclib`：`3b4b201`（⑬，配置＋Blender 腳本初稿，沒執行過）
- 本機沒有沒推送的東西；背景工作（⑤⑥ 回歸）已停掉。

**接班的人第一步**：`git fetch origin --prune` → 讀這份＋LAWWW 分支的 `docs/DUAL_AI_BOARD.md`（有沒有新的分派、ACK）＋`docs/AI_SESSION_HANDOFF.md` → 把要用的分支 `git worktree add` 出來（⑥ 用 8781、⑦ 用 8782 的 http server）→ 照順序：⑤⑥ 回歸 → 交付 → ⑬ → ⑭ → ⑫ → ⑦。店家窗景已經交給 LAWWW（10:07Z 的 P0 訊息），等它 ACK、決定景深與 cafe 方向。

`claude/second-ai-env-art-wip-props`（`fa626b9`）是推錯名字多出來的重複分支，刪除被遠端拒絕，忽略即可。
工作目錄（容器重開就不在了，從遠端分支 `git worktree add` 回來）：交付 `/home/user/Lawstudent`（server 8765）、⑤ `/home/user/pav_wt`（8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）、⑬ `/home/user/soclib_wt`。

**要傳給 LAWWW 的交付訊息重點**（如果我沒來得及傳）：
- 店家窗景：merge `f0bab8c`；8 張的路徑、景深數字（上表）、cafe 方向的說明；只動了新檔 `tools/shots/shop_views.py`、`shop_views_depth.json`、8 張 webp、我的 `fast_shots.py`（加 `post`，不影響 window_views.py）。
- ⑤⑥（回歸通過後）：洞洞館 0.14 MB／968 tris、社科院 0.17 MB／1,968 tris；`wzAtlasFaces` 改了（空白填平均色、外擴 2 px、最寬的字牌縮小）；W3.planter／bulletin／vending 開頭換正式模型（萬才館一樓的公告欄也會變）；花台葉片超出導航阻擋（已修）、販賣機太黑（已修）。

## 接手的人要知道

- 三個 WIP 分支都是從 `claude/second-ai-env-art` 分出來的；交付時 merge 回 `claude/second-ai-env-art`（merge，不 rebase），再通知 LAWWW 用那個 merge commit 整合。
- ⑤ 的驗收用工作目錄 `/home/user/pav_wt`（server 8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）；容器重開後這些目錄不在了，從 WIP 分支 `git worktree add` 回來即可。
- 截圖和整合測試的 PNG 不進 checkpoint（重拍得出來）；交付時轉成 WebP 再進 repo。
