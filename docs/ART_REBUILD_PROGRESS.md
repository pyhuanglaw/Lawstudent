# 3D 美術重建 v1：工作日誌（ART REBUILD PROGRESS）

> 這份文件是本次「3D 美術重建 v1」的即時工作日誌，**每次 push 都會一起更新**。其他 AI 或開發者可以從這裡接手。
> 需求原文：`docs/history/specs/20_3D美術重建v1_人物與溫州街.txt`。
> **2026-10-10 09:55 更新：建築組工作階段結束（使用者指示），之後只有 `claude/confident-ritchie-8rwh7t` 一個工作階段，人物與建築都由它負責；建築組的交接清單在 v9.4 一節的「建築組交接」。** 原本的分工（留作紀錄）：**人物組** `claude/confident-ritchie-8rwh7t`（主角與五位女主角模型、臉、髮型、服裝、走／跑／坐／上下樓梯的動畫品質與腳步貼合 footIK、人物模型載入）；**建築組** `claude/friendly-brahmagupta-6bbkzc`（霖澤館／萬才館 Blender 模型、穿堂、樓梯、電梯、教室、多樓層導航、校園／公館／溫州街、場景材質與光影、碰撞、場景整合與回歸測試）。兩邊用 `send_message` 直接聯絡；改共用檔案（`src/character3d.js`、`src/assets3d.js`、`tests/playlib.py`）前先通知對方；整合前兩邊互相 merge 並跑測試；不 force push、不自己合併到 `main`。**2026-10-10 使用者要求正式發布**：PR #1 合併到 `main`（`0ef3a73`），GitHub Pages 已部署 v9.3（D32）；之後的修改照樣先在開發分支驗證，使用者要求發布時才合併到 `main`。
> 測試制度（2026-10-10 永久規範，D34）：`docs/TESTING.md`。
> 截圖：`docs/art-rebuild/screenshots/`（全部是實際執行遊戲或模型檢視頁的渲染結果；檔名規則見最後一節）。

---

## 交接（最新）——工作階段隨時可能因額度中斷（D45 緊急保存規則）

**現況（帳號 B LAWWW-B，2026-10-31 03:1x UTC；帳號 B 七天額度已到警示 allowed_warning，2026-11-06 02:00 UTC 重置——隨時可能被切斷）**
- 線上：**v9.10.14**（main `271cd2305`，PR #20，Pages 07:52:40 成功；BB-B main deploy_check ALL PASS）：快速存檔獨立一格、開新遊戲前先備份、經濟系那一年可昕不主動約。BB 對 main 補跑剩下的情境（AA_520／523／518／515_zq、R43、libhall、R44）。
- **下一版在開發分支**（`55b49aa11` 以後；全部 Node：`fe3cee955` 763／0，之後只多 AA_539 第 5 節（子代理 763／0）與 7/20 旁白）：
  - postrel-1030 全部（`b576263b6`）；改名 D115（`ba315523b`、`ea67b0cb4`、舊存檔出遊 `ca5f3381c`、開發文件 `052d589d2`）；Café 室內光照（CAFE-LM-1030）；學姊 AA_539（`fe3cee955`、`101f841c8`、`55b49aa11`）。
  - 09:1x 以後：手機「直接過去」到了人還在 8 m 外自動接「帶我去」（`05789d957`，BB-B 實測 ALL PASS）；大地圖人物清單預設收起、自由日 👥 亮點（`4da27563c`，BIGMAP-PEOPLE-1030，等 BB 測）。
  - BB-B n15（BB_218 `abd7acb40`）：phone2、bball、rooms、cafewin ALL PASS；下雨天體育館沒看到阿哲——Node 查作息與 whereIs 都在體育館走廊（-3.6, 12.6），已請 BB 下次在遊戲裡查 `GM.npc.zhe`，不存在才是遊戲問題。
  - 09:5x：LAWWW2 交件 0235c71b9 整合 `f75d60a4c`——改名美術字（RENAME-ART-1030：校門石牌、晨思鐘、博思名牌、A館公布欄、201 傳單、博思 203 海報、ntu_linze；長條名牌外框上限 patch）＋總圖前草皮第一版（X133，LIB-LAWN-PLAN-1030）。**全部 Node（乾淨 checkout f75d60a4c）766／0**。
  - BB-B 在測：v9.10.14 補驗（第二批全 PASS）→ n16（下雨阿哲、大地圖、改名美術字）→ 快速存檔重跑 → next91015；草皮 lib_lawn 排在後面。
  - 10:4x～10:5x：大地圖人名不蓋地名、HUD 目標兩行（`fc0c0ac69`）；法律學院圖書館光照烘焙（LAWLIB-LM-1030，`6e3a95623`）；LAWWW2 CG 78 張查完沒有舊名。BB 都排進 next91015_probe。
  - 11:4x～11:5x：多功能教室 v2（MULTI-ROOM-V2-1030，`95da49eab`）；**補套** 03:3x 收的總圖大廳光照＋晚上小零件變暗（LIB-HALL-LM-1028、RT-NIGHT-1028，`bbe0c9469`，v9.10.14 發布後漏套）；麵店閒聊只認 3D 真的在的人（`dd8b216c0`）。**全部 Node（乾淨 checkout bbe0c9469）768／0**。
  - 12:4x：畢業以後的中秋當 PG 停點（BUG-PG-MOON-STOP，`2ac9e3637`；BB R43 r43_moon 瀏覽器 FAIL）；畢業以後相關 221 支 Node ALL PASS；BB 重跑 r43_moon。
  - 13:3x～13:4x：以安二試、司法官放榜群組照 AA 回 B 改成到隔天 03:00（PG-AN-EX-WIN-1030，`49ba39d6d`）；BUG-PG-MOON-STOP、PG-AN-EX-WIN 都 BB 驗收通過（修正前 FAIL、修正後 PASS）。R43 其他 FAIL 是探針。
  - 14:1x～14:4x：博思教學館 v2（BOYA-LM-1030，`a63eb8072`）；麵店團先拿位子（客人先留空位，`5f8b94515`，全部 Node 770／0）；系外套已驗收。
  - 14:4x：考試週麵店團不去麵店（NDL-EXAM-1030，`1e3ffbb0e`；AA 回 A＋h504 改回頭說 AA_504 da3e72727；四支測試日期改到非考試週），全部 Node 背景跑中；BB 併進 ndlread2。
  - **15:xx 使用者 X144「麵店團很突兀」→ 選「縮小成背景」；X145「搞不清楚阿哲是誰」**：
    - AA_542（企劃線 6b33b4012）四段都實作（ca2370142 → 6d358e159）：約 55 句換字、群組「法一吃飯」每學年改名、拿掉 17:30 揪人、麵店日每週不固定兩天（S.noodleDay／ndlPair）、四人作息 ndlDay、長桌一週一則、阿姨考試週那句拿掉、阿哲民總下課約吃麵（ev_zhe_noodle_invite，classAlso）＋第一次併桌。舊稿讀進來照 tools/story/ndl542_fix.json 換字。新測試 ndl_group_unit。全部 Node 在跑；之後給 BB 照 AA_542 第 8 節測、AA 再掃一次。
    - 第一天阿哲約吃麵的舊生法只在約的那天（32dd6ae75，BB 找到考試週阿哲還在麵店）。
    - 全部 Node 771／0（6d358e159）→ NOODLE-TEAM-SHRINK-1030 已整合待測試，BB 照 AA_542 第 8 節玩；AA 第 9 節（c2e442b57）兩處：春假那則第 7～10 週、舊開局 312 z2（`3183b49c2`）。
    - X145：AA_543（企劃線 d483ecbbf＋第 5 節 f726507f7）做完：src/whois3d.js（13 人「你們」一段，條件成立才顯示；最多 8 行，①②、哥、在一起那一行不擠掉；宿營＋遊覽車、室友＋搬走、系籃＋17 號＋隊長合併）、個性改 8 人（`9597ffa34`）、Alison 個性兩段、9/2 搬進 412 記韋綸唐睿 FIRST_MET（`f4adf6cb7`、`c4fc0d4fe`、`bcec62805`）；全部 Node 771／1（v0_dorm_props 原始碼順序，已修）；tests/whois_unit.js 53 項。CHAR-WHOIS-1030 已整合待測試，BB 排在 shrink_b 後面。
  - **17:2x 芯慈的線暫停**：使用者 16:5x 直接對 AA-B 否決芯慈×以安「第一名／第二名」整條劇情（AA-B 17:14 轉）。`037f79fe2`：XCROM.ON false（DATE.HEROINES 預設不含芯慈、事件與心願事件不登記；程式留著，tests/xinci_romance_unit.js 用 setOn(true) 測）；慈 6 的 3-5／3-6 還原。AA 在列遊戲裡所有「第二名」相關的地方、問使用者新方向；**下一版（改名版）要等 AA 的清單處理完**。同一批使用者答：跟以安交往過照樣可以開（CFG.noAnEx false）、多段要先討論個性、總圖草皮等使用者的地圖或照片（UA-LAWWW-1030-26～28）。
  - 16:1x XINCI-ROMANCE-1030（X139 芯慈可以交往，AA_537 2f523e21a＋537b 508568ae5）開工：第 4 段（一）約會台詞匯入（`4c587168a`，import_date_lines.py 加 AA_537b、白名單登記）；第 1 段告白做完（`f802dcfe5`）：src/xcrom3d.js 門檻 G1～G10＋開關 XCROM.CFG（noAnEx、noOpen：使用者還沒回 AA）、termend HEART／NOPE（AA_537b 第 7 節 5ba143d2c）、她先問有沒有交往對象（有＝others）、confess_lines、DATE.HEROINES、YES_LINE 75、心願 D04 晚上場、6 次；tests/xinci_romance_unit.js ALL PASS；全部 Node 背景跑中。第 4 段（二）AA_537b 8-0、8-1（`f61e36c26`、`901cc2810`：飯桌換句、交往中期末飯提前一天 21:00 約；D04 芷若子晴照舊）；第 2 段（`b7f993806`～`ada5e3c49`）：3-1 麵店補問、3-2 G3 提醒、3-3 補演的電話、3-4 G7 當天約＋家常菜、3-5 空白的週三下午（＋大四上再問）、3-6、第 2 節分手那晚；全部 Node 背景跑中。G5 半夜訊息做完（`2c95c3a8a`，AA_537b 第 9 節十六則）；心願午夜場做完（`176291a95`：DATE.MIDNIGHT 只為這一場擴充到 02:30、DATE_WISH 登記、隔天睡到十點）；全部 Node 773／0（97cce9e14，午夜場之前）。**還沒做**：第 3 段交往以後（msg L、以安那則、她爸爸、MREL 不接受、尾聲）、節日（537b 第 5 節）。
  - 16:0x BB n19_boyaecon：預設經濟系流程不上經原（不進博思）＝D102 的設計（KEEP 29 場照 AA），不改；BB 用 &nofastecon 驗博思 101、另看法律系 B4 演講。BB 麵店兩個阿姨＝不是重複（阿姨在時店員藏），阿姨模型晚 20 秒＝NDL-AUNT-VIS-1030（P3）等讀數。
  - **18:0x～18:4x D116（遊戲裡的人不跟別人比，永久）、D117（要使用者決定的一律用可點選的選擇題）**：NO-COMPARE-1030 第一批 AA_546 全部實作——`3281a122c`（13 支測試期待句）、`a68622d52`（柏翰結構：翰 1「第三題」、翰 2 不看分數＋「我寫得很慢」、翰 3 白板只寫自己的、翰 4 念得慢記得久、阿哲、宿營破冰「從哪裡來」）、`43b7877f4`（另 7 支測試照新稿；全部 Node 773／0）；AA 照 §6 重掃已發；第二批灰色地帶等 AA；芯慈整條線等 AA_547（使用者給的新設定在 USER_WANTS X139），XCROM.ON false 不進下一版。BB 排 n23_bohan_nocmp。
  - **10-31 01:1x～02:1x**：BB-B n27 讀程式疑點修五點（`bcb788dec`，全部 Node 774／0）；**BUG-C5-AN-NOT-SPAWNED-1031**（BB n25：慈 5 總圖三樓沒有以安）——舊角色（LEGACY_IDS）照作息要 afternoonDone，進區域生人比 S.tick 補旗標早；改成法律系主線第 3 天起照作息（S.pastDay2）。LAWWW-B 用 BB 的存檔在瀏覽器重現過；AA_537b 8-4 巷口家常菜期末飯開場收尾（PLACE.l118_home）；LAWWW2 ART-ECON A 共同教學館室內正式模型（c1a2026b4）＋烘焙工具：`753df5a8c`，全部 Node 背景跑中 → BB 重跑 n25 C5、看共同教學館畫面；LAWWW2 接 B 普通教學館光照。
  - **10-31 02:1x～03:1x**：BUG-C5-AN-NOT-SPAWNED-1031 **已驗收**（BB n25_xinci_g）；期末飯疑點 1、2（心意邀約當天下午沒跑到手機改排下一晚、兩頓不同晚 TERMEND.teBusy，`b90fbfd47`）；BUG-CAFE-STAFF-LABEL-1031（認識的芷若在吧檯按鈕寫名字，`7cb058610`）；柏翰 slow 算加入小組（AA-B 回 A，`0098cbe10`）；全部 Node 775／0（0098cbe10）→ BB 跑 ZRCAFE、H2_SLOW、n27、n28 共同教學館（含經濟系上課）。LAWWW2 B 普通教學館光照 WIP。
  - **10-31 00:0x～01:0x 芯慈戀愛線打開**：使用者 00:0x 對 AA-B 點選「告白時她不問」「只要沒騙她就接受」→ AA_548 第 7 節 `b399adf57`（she 拿掉問句、交往中她不知道＝多「（先告訴她，你在跟誰交往）」、她已知＝答應時多一句、KNOWS_OK＝她知道的都是你說的、NOPE.knows 拿掉、noOpen false、交往後自己跟她講、她自己發現＝分手、5-3 以安）＋第 8 節 `254bcfb35`（她爸爸 8-1 取代「誰最強」、挽回 8-2、冷落 8-3）；**XCROM.ON true**；全部 Node 774／0；BB 排 n27_xinci_romance；USER_WANTS X139 已記。
  - 22:3x～23:5x：PERF-ZONE-ENTER-1018 第三輪（LAWWW2 95fcbf00c，進室內的兩段同步讀像素改掉）整合 `44337adcb`（模擬器量不出整體變快，README 照實寫）；**?perf 量測小面板** `1df75303c`（使用者回來時請他在自己電腦、手機各開一次 ?perf 走幾個地方、按一下複製貼回來）；全部 Node 774／0。SOCLIB-LM、BOYA-LM 已驗收（BB n22）。LAWWW2 下一件 ART-ECON-3D-GAP-1021：A 共同教學館室內正式模型 → B 普通光照 → C 總圖 3F 光照。BB n20／n19 的 FAIL 都是探針，重跑排著。
  - 21:2x～22:3x：
    - **芯慈新個性 AA_547**（使用者 19:2x 點選「照這份寫」，USER_WANTS X148，企劃線 e9504c889）：`46e36f86b`、`ccbb72422`（慈 3 凌晨的便利商店＋B1／Café 版、慈 5 分工抄筆記、慈 6 暑期實習；慈 4、Alison「吵架了」、改輔系、「我第一」、msg2「第二名也是名」拿掉；XCROM.OLD 打開）；13 支測試照新稿改；全部 Node 773／0（e04285759）；BB 排 n25_xinci547。
    - **芯慈戀愛線 AA_548**（企劃線 265cca815）：`e04285759` 程式接好（門檻 G1～G9、G6 補一次、3-1／3-3／3-5、others「我只想要一對一」、半夜訊息八則），**XCROM.ON 照舊 false：等使用者對 AA 點選 4a、4b**。
    - NO-COMPARE 第二批（AA_546 第 7 節：芷若 zr2d、Z4-L3、明軒個性）`6289e4762`；NO-COMPARE-1030 改已整合待測試（AA 那邊結了）。
    - LM-COLLAPSE 四間都整合（總圖大廳 `4470ef1a9`、四人房 `55b077210`、201 `610d74642`）；NAV-LIBHALL-ISLAND-1030 `3b74f9b24`（library_copier_unit 有 FAIL 就 exit 1）；LAWWW2 下一件 PERF-ZONE-ENTER-1018（X14 進室內卡頓，經濟系那一年的地方先）。
    - BUG-SUP497-BIND-1030（BB 讀程式找到）`890f8f3f7`：影印機、宥辰兩場電梯讀檔以後永遠不演（GMr 只有 meetIn 設）→ 改用 GAME.E。
    - BUG-WHOIS-ECONYEAR-1030、CHAR-WHOIS-1030 已驗收（BB econ6、law2）；TAKEOVER-B-1030 結案。
  - 21:0x NOODLE-LM-1030（阿鳳麵店光照：晚上日光燈白光、煮麵台湯鍋不再整片黑）＋LM-COLLAPSE-1030 第一間法律學院圖書館重烘（91.4→0 m²）整合 `2c65d66f1`（LAWWW2 ee96b798f，DL-LW2-NOODLELM-1030；全部 Node 773／0）；BB 排 n24_noodle_lm。CHAR-WHOIS-1030 已驗收（`09bb64445`）。LAWWW2 下一間：總圖大廳 → 宿舍四人房 → 201。
  - 19:1x～19:2x BUG-WHOIS-ECONYEAR-1030（BB-B n21_whois_econ3）：經濟系那一年人物頁照法律系開局寫 → `469bdde7c` 先不顯示回頭看的列 → AA_543 第 6 節（企劃線 30e7b0311）現在式四人接上 `1d4e7d897`（DL-AA-543-6）；BB 正在驗。AA_547 芯慈新稿（企劃線 cbfc7a7c7，PROPOSAL）第 1 節個性等使用者點選——**AA-B 工作階段停在 AskUserQuestion，使用者點了才會往下**；點完 AA 會說可以開工，照第 2 節逐場改（留：慈 1；改：慈 2、第一排、影印機、爸爸、事務所、寒暑假、畢業以後、個性；新寫：慈 3、慈 5、慈 6；拿掉：慈 4、Alison「吵架了」、改輔系）。
  - 19:0x 芯慈舊的「第二名」四場先關（XCROM.OLD false，`9c3b61cdb`；測試 `d313922b6`，全部 Node 773／0）：慈 3（＋B1、提示、Café 補演）、慈 4、慈 5（＋遠版）、慈 6（＋日本視訊、錯過那一則）；慈 1、慈 2、AA_497 第一排／影印機／爸爸／讀書會的表照舊，等 AA_547。TAKEOVER-B-1030 結案。
  - 18:1x SOCLIB-LM-1030（LAWWW2 b659056c6）整合 `3bc7a8800`：社科院圖書館光照＋博思 n19（講桌桌面、講台牆斜影）；新任務 LM-COLLAPSE-1030（舊房間 collapse_black 重烘：法律學院圖書館、總圖大廳、宿舍四人房、201），排在 NOODLE-LM-1030 後。BB 排 n22_soclib_lm。
  - LAWWW2 下一批（D99 經濟系優先）：BOYA-LM-1030 博思教學館 → SOCLIB-LM-1030 社科圖 → NOODLE-LM-1030 麵店；ART-ZR-PS-3D-1022 回報進度。AA_541 改名最終一致性報告（企劃線 bc3f0ad97）：約 95%，剩 BB 近拍＋使用者真機；發布條件含**使用者同意**、README 同一次換。
- **改名版（D115）發布前一定要先問使用者同意**（使用者 04:31 原話「不得未經我同意直接合併 main 或正式發布」）；發布時根目錄 README 換 AA 草稿（企劃線 f745e8ab9）。
- 總圖前草皮：三個問題（草皮形狀、台階、樟樹位置）還在等使用者，回答了 LAWWW2 再出第二版。
- AA：四年台詞實跑 48,771 句舊名 0（AA_540 e04950f3b）；SIS-LEAD-1021 已關（`680a476e7`）；改名 C 類歷史文件加註做了（`3ad101252`）；改名只剩真機（使用者）＋BB 下一版實測，AA 寫最終一致性報告。芯慈可攻略（AA_537／537b）實作排在這一版之後。
- `origin/postrel-1030` 是 05:3x 誤推的舊分支（3808792fe），內容已在開發分支＝清理候選（刪除權限受阻）。
- 接手第一步：`check_handoff.py duty find` → 讀本節 → 看 BB-B 的 BB_218（main 補跑、下一版測試結果）。

**交班（帳號 B LAWWW-B，2026-10-17 02:40 UTC，使用者正式換班）**：交出 `d11fc9d1`（之後只有交班紀錄 commit），快照 `docs/handoff/snapshots/2026-10-17T0240Z_B_LAWWW.json`；六類 A～F 在 `docs/HANDOFF_GAP_MATRIX.md` 第 1 節。沒有合併 main、沒有發布（線上 v9.9.1 `6d5c3279`）。下一班第一步：接班十四步後先做 QA-HANDOFF-B1（整套單元測試＋沒跑完的瀏覽器流程）。

值班登記：帳號 B｜LAWWW-B｜session_01DvRVNNnivf7da7qqWuGmw6｜分支 claude/modest-rubin-2lyp7g｜接班基準 origin/claude/confident-ritchie-8rwh7t 的 c8b3eab（合併 commit 450ffdb）｜2026-10-15 23:02 UTC
上一班：帳號 A｜LAWWW｜session_01Eds6msqpsuzNEw98sdw8JX｜最後 commit 78402e1（交班補記，2026-10-14 17:38 UTC；之後 c8b3eab／effb148 是使用者推的 P0 換班規則）｜正常交班

### D76（2026-10-16 00:00 UTC，使用者 P0 永久規則）

- 工作中也要主動讀使用者與其他 AI 的訊息（七個時機、P0／P1／P2、GitHub 交接板也要同步）；全文在 `CLAUDE.md` 最上面。LAWWW-B 的做法：每一批工具呼叫之間先 `ReadNotifications`；開始新任務前 fetch 企劃線 `claude/cool-heisenberg-o8kuqx`、LAWWW2-B 的 `claude/funny-albattani-iawshm` 並重讀交接板。

### 使用者試玩回報（2026-10-15 23:55 UTC，26 項；原話與分類在 `docs/USER_INSTRUCTION_LOG.md`）——處理狀態

- **已修（開發分支，單元測試過；瀏覽器只看過標 ✔ 的）**：說話鏡頭不大轉（`cine 'talk'`、轉慢）；手機轉向每幀檢查畫布；同班同學必修課在教室（`STORY.classmateClass`）、不在場的人沒有反應句；第 1 天白天的課不排；可以遲到（下課前 30 分鐘以前）；讀某科只出那一科；HUD 幾月幾號 ✔；當面約（以安、阿哲、學姊、阿凱、小語）；手機朋友頁「過去」「訊息」「約」；可昕寫「在政大」；腳踏車 8.5 m/s；載人（後座位置待調、等 LAWWW2 的坐墊）；阿哲「上學期」→「開學才三個禮拜」（**請 AA-B 確認這句**）；法服的人只在讀書會有開的週出現；博雅牆上光斑 ✔；長椅路燈 ✔；咖啡廳店員（10-14 就修了，v9.7 沒有）。
- **還在查**：偶爾全黑＋面膜臉（加了 WebGL 掉線紀錄，還沒重現）；zone_memory 貼圖還在增加（騎車路人釋放不是主因，貼圖追蹤工具在跑）；博雅 101 上課前空、下課滿、頭髮亂飛；學姊「兩個臉」。
- **等使用者**：2D 立繪——遊戲裡五位女主角的立繪是舊版（以安：黑寬褲），BB 驗收的是 06 標準圖（米色針織、淺色牛仔褲），但 06 的全身只有約 200 px 高，不能裁成立繪；`art_reference/README` 寫參考圖「不放進遊戲」。要新的單人全身立繪（透明背景、約 1000 px 高，規格 `docs/CHARACTER_ART_SPEC.md`）。
- **給 LAWWW2-B（已派，10826bd 之後）**：沛珊自己的 VRM、政大 2D 背景、博雅↔普通空橋現況、腳踏車後座載妹墊。
- **給 AA-B／BB-B（她們上線後讀這裡；LAWWW-B 不自己寫劇情）**：
  1. 可攻略角色「一層一層聊天認識彼此」：路上遇到也能聊、每天可以限制新認識多少、不要一直講同一句（現在以安走舊的 talkAn，只有三句輪流；`SMALLTALK.heroine_01` 是 0 句）。
  2. 室友（阿凱）的故事、一起打電動、看室友不爽可以吵架。
  3. 假日回家（祐廷是臺北人）。
  4. 總圖新生導覽的內容（現在開始到結束就一個按鈕）。
  5. 載妹墊：誰會坐、上車／下車／路上的一兩句。
  6. 沛珊「欠的，還了。」要的班級群組：誰在群組、什麼時候加入。
  8. **立繪大圖（使用者 2026-10-16：「跟BB要大圖他有」）**：請 BB-B 把 06 標準圖的原始大圖（或五位女主角各自的單人大圖）放進企劃分支 `docs/story_planning/art_reference/`，在交接板寫一行；LAWWW-B 裁成 `assets/portraits/<id>/campus/neutral.webp`（透明背景）。在那之前遊戲裡保留舊立繪。
  7. 校外單獨約會（AA_128／BB_128）：使用者說「AA-B/BB-B 互審交接後再做」。

### 進度（LAWWW-B，2026-10-15 約 23:50 UTC；分支 `claude/modest-rubin-2lyp7g`）

照上一班清單做（使用者 23:2x：「你繼續做沒完成的那些」）。**都沒有發布**；線上照舊 v9.7 `313d620`。
- **D75（使用者 23:1x）**：跨帳號、已交班的工作階段一律不傳訊息，只用 GitHub（`ba8b225`、`fce8324`）。LAWWW2-B 已上線（`session_01GV1WG3UeT2DhuDpxeWJsvD`，分支 `claude/funny-albattani-iawshm`），已抄進值班表（`6212adb`）。它的 `f196f84`（同一件規則）沒有合併，因為會一起帶進還沒整合的美術；已請它合併我的 `fce8324`。
- **第 1 項：AA 的 P0 課堂提問——做完**（`0feac47`）：
  - 課表匯入帶進 `ask`；`exam_bank.js`、`syllabus.js` 照企劃分支 `0d278bb` 重新匯入（69 題課堂提問，askedIn 和 syllabus 一致）。
  - `CLS.classAsk`：那堂課最後「（下課前，教授在黑板角落寫了一題。）」→ 題幹＋選項（題庫原文、不洗牌）→「答案是（X）。」＋使用者給的考點／解析 → 這學期第一次時教授「期末考，會考這樣的題目。」。不計分；第二格短片段不問。題目是使用者的，所以不看 BB 課堂內容的審查（69 題裡 4 題在還沒審查的週）。
  - 測試：`tests/class_ask_unit.js`（修改前失敗）；`aa130_exam_unit` 的 EXAM_MIX 3_2 一段因為題庫有真的課堂題，改成先暫時拿掉真的 askedIn（使用者看過這個修改，還沒說要不要還原）。
  - 瀏覽器（手機模擬）：`tools/shots/class_ask_screen.py` 直向、橫向都排得下，題目、選項、答案、教授那句都出現（[捷徑] 直接呼叫 classAsk）。
  - **給 AA（AA-B）**：課堂提問已接上，SHA `0feac47`（之後的修正在同一條分支）。跨帳號不傳訊息；AA-B 上線後請讀這一段。
- **第 5 項 LAWWW2 回報**（`b2ca5b6`、`3fbaca9`）：麵店價目板縮字；女舍門口晚上的路人改站著（原本 read＝坐姿）；長椅旁加路燈；博雅牆上方形光斑＝室內晚上的太陽（0.12）還在投影，關投影就不見（對照截圖），改成室內晚上太陽 0。整合 noodle_table v2（`dcc4cf7` 的兩張圖＋Blender 腳本，`build.py` 開始複製 `assets/bg/`，LICENSES 加一列）。
- **第 4 項 zone_memory**：騎腳踏車的路人換區域時沒有把人物還給 VRM pool（一般 NPC 有）——已補 `CHAR.release`；瀏覽器重跑中。
- **第 6 項**：B4／B5 拿掉 `legal_review`（BB 15:52、BB_105）；重訪日 1 補阿哲、以安、語彤、小語、芯慈（AA `2100018`）；W3b 不讓步的晚上（BB_96 2-4、BB `137bf31` 三篇校刊投書；每兩週 20:30 讀書會群組；手機長訊息折起來，`tests/v2_w3b_unit.js`）。
  - **沒做**：沛珊「欠的，還了。」——BB 15:59 說改用班級群組「法律系一年級」，但遊戲裡沒有班級群組（要決定誰在群組、什麼時候加入），等 BB-B 給規格。
- **第 3 項**：`flow_classes` A 段改成週四民法總則；`flow_course_choice` 改寫成大四上（現在只有大四上有選修）。
- 單元測試 109 個全過。**瀏覽器佇列在跑**（scratchpad，結果不在 GitHub）：博雅修正後重拍、女舍長椅夜景、zone_memory、flow_classes、考試真實流程（新 `tools/shots/exam_real_flow.py`）、flow_course_choice、main_day12、first_meet、playtest_fixes、evtest。

### 接班（LAWWW-B 帳號 B，2026-10-15 23:02 UTC）

- 第一次真的換到帳號 B。系統指定的分支 `claude/modest-rubin-2lyp7g` 從 `main`（`4e203e8`：v9.7 `313d620`＋使用者推的 P0 換班規則兩個 commit）開出；把 `claude/confident-ritchie-8rwh7t`（`c8b3eab`）用 merge 合進來（`450ffdb`）。衝突只有 `CLAUDE.md`、`docs/AI_SESSION_HANDOFF.md` 最上面：兩邊都有同一段「P0 緊急換班口令」，開發分支多一段「P0 使用者新訊息優先與期末考素材來源」，兩段都留（內容和開發分支相同）。
- 離開期間（10-14 17:40 → 10-15 23:02 UTC）：開發分支、`claude/second-ai-env-art`（`8e1061a`）、`claude/story-planning`（`0d278bb`）都**沒有新的工作 commit**；只有使用者推的 P0 換班規則（main `e80da49`／`4e203e8`、開發分支 `effb148`／`c8b3eab`）。沒有發布（最後一次發布 v9.7 2026-10-14 12:32 UTC，三小時規則早已過）。
- 跨帳號通訊實測（第 9 節）：帳號 B 的 `list_sessions` 只看得到 LAWWW-B 自己；對 LAWWW（`session_01Eds6msqpsuzNEw98sdw8JX`）`send_message` 回「the requested resource was not found」。**跨帳號不通，全部靠 GitHub 文件交接。**
- 接下來照上一班的「沒做、沒跑的」清單從第 1 項開始（AA 的 P0：重新匯入 `exam_official/`、syllabus，做「課堂提問」畫面）。LAWWW2-B、AA-B、BB-B 還沒上線。
- **注意**：LAWWW-B 的開發分支是 `claude/modest-rubin-2lyp7g`；`claude/confident-ritchie-8rwh7t` 這段期間不再寫入。LAWWW2-B 交付、AA-B／BB-B 的交接，請以這條分支為準。


### 交班（LAWWW 帳號 A，2026-10-14 約 17:40 UTC）——使用者：「現在換班，請依照既定交班規則完成交班。」

- **分支**：
  - 正式 `main`＝`313d620`（v9.7），這一班沒有動。
  - 開發分支 `claude/confident-ritchie-8rwh7t`：程式最後一個 commit `8c5b6ee`，再來是這個交班 commit。
  - 這一班的東西都**沒有發布**。
- **這一班做完的**（都在開發分支）：
  - `dc0e576`／`7936f0b`：作息換到同一區的另一間（roomMove）、B5 等以安坐到圓桌。瀏覽器 `flow_b4_lecture` ALL PASS（Playwright 手機模擬，不是 iPhone 實機）。
  - `bb6d2ee`：AA_130 課程調整——刪 7 門課、法學英文搬到大二下、黃陳兩位教授改在霖澤館大廳、存檔 idv 3、syllabus 重新匯入。
  - `828f2d4`：期末考抽 5 題（課堂題優先、不足 5 題不開考、絕不補題）。
  - `ff4de09`：考試畫面截圖腳本。
  - `1bb3b17`：`?dev` 除錯面板列出這學期不開考的課。
  - `d4e5629`：大一～大三交卷後不顯示法條（basis／mapBasis 是 AA、BB 標的），大四照顯示。
  - `8c5b6ee`：祐廷是臺北人（使用者直接確認）。
- **測試**：
  - Node 單元測試 107/107（`8c5b6ee`）。
  - 瀏覽器（Playwright 手機模擬，`7936f0b`）：
    - ALL PASS：`spring_trip`、`tap_stall_201`、`b4_lecture`、`deploy_check`、`zone_transitions`、`invite_phone`、`save_compat_v95`。
    - **FAILED**：`zone_memory`（見下面第 4 點）。
  - 截圖：`dev_shots_1014` 7 張（`7936f0b`，只在本機 scratchpad，沒放進 repo）。
  - 考試畫面截圖（`ff4de09`）：`docs/art-rebuild/screenshots/exam_2026-10-14/`。
    - 第 1、2 題的直向、橫向排版看得到題目和選項。
    - **交卷結果那一頁沒拍到**：截圖時文字已經關了。
    - 直向時題目框後面露出「離開教室」按鈕。截圖腳本用捷徑直接開考（沒坐下、沒進劇情模式），要在真實流程確認考試中按不按得到。
- **沒做、沒跑的**（下一班依序做）：
  1. **P0（AA 17:5x，企劃分支 `7180b53`）**：重新匯入 `exam_official/` 和 syllabus，做「課堂提問」畫面，做完回 SHA 給 AA。
     - `exam_official/`：多了 `askedIn`；大一～大三的 `basis` 改名 `mapBasis`。importer 兩種名字都已經不帶。
     - syllabus：Y1S1～Y3S1 每週多了 `ask:{qid}`，共 69 題。
     - 「課堂提問」畫面規格在 AA_130 第 3 節第 3 點（`aa57384`）：下課前教授在黑板角落寫一題，玩家作答，公布答案＋考點；這學期第一次時說「期末考，會考這樣的題目。」；不計分；沒去上課不演。
  2. 考試畫面在**真實流程**（坐下上課 → 考試週那一堂）用手機模擬重拍直向、橫向，要有交卷結果。
  3. 瀏覽器回歸，在最新的開發分支上跑：
     - 排了沒跑（執行器已停）：`evtest`、`flow_main_day12`、`flow_first_meet`、`flow_playtest_fixes`。
     - `flow_classes.py` 的 A 段、`flow_course_choice.py` 用了被刪的課，要重寫或退休。
  4. `zone_memory`：校園來回 4 次，貼圖一直增加（每次約 +110）。懷疑騎腳踏車的路人（`E.extras`）移除時沒有 dispose；和使用者回報⑤（iPhone 跳回標題）可能有關。
  5. LAWWW2 回報、在我的檔案裡的問題：
     - 麵店價目板的字被切掉（`zones3d.js` attachNoodleInterior，要用 measureText 縮字）。
     - 博雅後牆的方形光斑。
     - 大一女舍長椅附近沒有燈。
     - 女舍門口的路人坐在空中。
     - 另外要整合 LAWWW2 的 noodle_table v2（`dcc4cf7`）、看 C13 夜景截圖（`ce301b6`）。
  6. v2 待辦：
     - BB 15:52：B4 可以拿掉 `legal_review:'REQUIRED'`。
     - BB 15:59：沛珊「欠的，還了。」改用班級群組「法律系一年級」。
     - BB 16:00：W3b 三篇文章（`d21d8e1`）。
     - AA 15:30：重訪日 1 的台詞（`2100018`）。
     - 可昕第 9 節：BB 15:35 說可以恢復，但 9-1 寫「寒假祐廷在嘉義」，改成臺北人以後要等 AA、BB 重給文字。
  7. 等使用者：
     - 期末考抽法（`EXAM_MIX` 課堂優先或 3＋2）。
     - 交換延畢方案（AA 先提）。
     - 七位女主角的生日列表。
     - 法律服務改成每兩週週六早上：先記錄、不改程式，企劃在 AA_131 第 6 節。
- **其他 AI**：
  - LAWWW2：17:22 派了三項——① 便利商店商品 ② 女舍門燈罩加大＋長椅適合加燈的位置 ③ 盤點還沒給使用者驗收的成果。DELIVERED，還沒有 ACK。
  - AA：17:5x 交班（企劃分支 `4bdf744`）。
  - BB：沒有收到交班訊息。
- **交班後收到（17:38）**：
  - LAWWW2 已交班，最後 commit `8e1061a`（`claude/second-ai-env-art`）。
    - 便利商店商品停在 WIP（腳本 `208f242`，正式 GLB 沒換，**不要整合這一版**）。
    - 女舍門燈罩、待驗收盤點還沒開始。
  - BB 已交班（企劃分支 `b79cb91`）。
    - 法學英文 25 題（使用者剛給的）還沒轉成題庫，在那之前法學英文 0 題、不開考。
    - ~~可昕 12/3 的生日事件在使用者確認新的生日表之前不要動~~（2026-10-16 作廢：生日表 10-15 已定案；12/3 改 KX_DEC3、新增 4/24 生日，照 AA_140 G01＝任務 V1-B9-6、V2-G01）。
    - 細節在企劃分支 `給開發組_交接板.md` 第 4 節最上面。
- **本機**：scratchpad 的瀏覽器佇列執行器和監看已停。`wt_next` 沒有未 commit 的修改。沒有只存在本機的成果（截圖 `dev_shots_1014` 例外，可以重拍：`tools/shots/dev_features_1014.py`）。


**2026-10-14 16:55 UTC（開發分支最新：這一筆交接的 commit；線上＝v9.7 `313d620`；沒有排發布；使用者的額度約 18:50 UTC 用完）**：
- **16:00 以後的 commit（開發分支）**：
  - `dc0e576`：`roomMove`（作息換到同一區的另一間）、B5 等以安坐到圓桌才開始。另外三個流程測試改成記整句台詞。
  - `7fcb3d0`：`flow_tap_stall_201` 改用引擎時間 `E.time`；使用者指示紀錄補 15:45 的原話（上課討論的出題＋使用者的題庫）。
  - `500b637`：截圖腳本 `dev_features_1014` 加第 7 張（男一舍前的地板）。
  - `7936f0b`：`flow_b4_lecture` 等以安、小語走到圓桌，最多 600 秒。
  - 這一筆：CLAUDE.md 加 `roomMove` 的說明、這段交接。
- **瀏覽器（Playwright 手機模擬＋SwiftShader，不是 iPhone 實機）**：
  - `flow_peishan_table` ALL PASS（`863d8ac`）。
  - `flow_spring_trip` ALL PASS（`7936f0b`，6 項）。
  - `flow_tap_stall_201` ALL PASS（`7936f0b`）：點到走不到的地方，3.03 秒（引擎時間）放掉路線、站好。
  - `flow_b4_lecture` **ALL PASS**（`7936f0b`，12 項，928 秒）。
    - 流程：以安、小語、阿哲照作息走進 101 → 自己坐下 → 聽演講 → 散場的問題 →「好。」
      → 兩個人起身，從 101 走到大廳的圓桌坐下（模擬器等了 261 秒）→ 走到以安旁邊 → B5 → 三張便利貼。
    - 第三次（`dc0e576`）沒過，是測試只等 150 秒；當時兩個人已經起身往圓桌走（約 0.65 fps）。
- **執行器 16:30 重開**（舊的到 2 小時上限前先停；可以跑到 18:30）。佇列：`flow_b4_lecture`、`deploy_check`、`zone_transitions`、`flow_invite_phone`、`save_compat_v95`、10-14 回饋截圖、`evtest`、`flow_main_day12`、`flow_first_meet`、`flow_playtest_fixes`（約 47 分鐘，可能跑不完）。
- **雙 AI**：
  - 16:20 回 AA 15:53 的再確認：兩則使用者指示寫在哪個檔、哪個 SHA。狀態 DELIVERED，不用回。
  - LAWWW2 正在做麵店長桌的 2D 背景。之後的佇列：C13 夜景截圖、便利商店商品、溫州街多幾家店、男宿交誼廳家具。
- **主要工作目錄** `/home/user/Lawstudent` 原本停在舊的 `3609378`，已快轉到開發分支最新（沒有本機修改）。
- **提案（沒做）**：玩家說「好。」之後，目標可以改成「去找以安」，地圖畫路線（用現有的 `GM.findPerson`）。現在以安、小語會自己起身走過去，玩家看得到，所以先不加。

**2026-10-14 16:00 UTC（開發分支最新：這一筆交接的 commit；線上＝v9.7 `313d620`；沒有排發布）**：
- **15:30 以後（開發分支，瀏覽器還沒看畫面；每個都有單元測試，修改前失敗）**：
  - `a409436`：C9 春假麵店團兩天一夜、選完自動傳訊息、W2b 期末、K8 照片、小語騎樓版。
  - `e94cfae`：BB_96 第 10 節 10-1 P4d「你怎麼又在這裡？」（重修經原下課的走廊；阿勳、品妤只有台詞，還沒有 3D 人物）。
  - 這一筆：C13 可玩切片的 B4／B5。
    - 活動 `B4`：博雅午後講座，第 11 週週四 19:00 博雅 101。
    - 週二以安在麵店團揪人。
    - 以安、小語、阿哲那一晚的作息在 101，散場後以安、小語在圓桌。
    - 事件：演講 `ev_b4_lecture`、散場 `ev_b4_after`、小桌子 `ev_b5_table`、中途離開以後以安一句 `ev_b4_partial_an`。
    - 沒去：小語在群組轉述。
    - B4、B5 標 `legal_review:'REQUIRED'`（比例原則的方向），等 BB 確認。
- **測試修正（不是遊戲的 bug）**：
  - `flow_playtest_fixes` C 項：小睡醒來是 12:02，之後時鐘照常走。舊寫法拿 12:00 比、差 4 秒沒過；改成和選之前的時間比，而且要還在中午。
  - `tools/dev_scratch/evtest.py` 改用預裝的 Chromium（`executable_path`）。
  - `v2_c14_unit` 不算同一天中午 B4 的揪人訊息。
  - `activities_unit`、`boya_lecture_unit` 的允許清單加上 B4。
- **16:00 以後**：
  - `9da176e`：B4／B5 本體。
  - `fd235b6`：第 12 週以安「你那天聽完就走了。你怎麼想？」。
  - `0c63b2d`：瀏覽器測試 `tests/flow_b4_lecture.py`。
  - `54e44b4`：沛珊的那張表（BB_96 3-7）＋測試等人的時間（SwiftShader 下遊戲時間約為真實時間 4 倍）。
- **16:20 瀏覽器測試（Playwright 手機模擬＋SwiftShader，不是 iPhone）**：
  - `flow_peishan_table` ALL PASS（`863d8ac`）。
  - `flow_b4_lecture`（`54e44b4`）抓到一個真的 bug：20:30 散場後以安、小語的作息換成博雅的圓桌，兩個人卻一直坐在 101。
    原因：`refreshSchedule` 只處理「走到某一點站著」（linger）和「離開」，沒有「同一區換到另一間坐下」。
  - 這一筆修正：
    - `story3d.js` 的 `roomMove`：起身、走到那一間的空位坐下；朋友已經在那一間就坐同一張桌子；沒有空位就留在原地；走不到就坐回原來的位子。
    - B5 要等以安坐到圓桌才開始（不然散場時坐在她旁邊的玩家，會在 101 就演完「小桌子」）。
    - 新測試 `tests/schedule_roommove_unit.js`（修改前 5 項失敗）；`v2_c13_unit` 加一項（修改前失敗）。
  - 測試本身的問題：
    - `flow_b4_lecture` 走向以安時，途中開始的 B5 被 `go_to` 自動點掉了。`playlib.go_to` 加 `stop`（可省略，舊的呼叫不變）。
    - `flow_spring_trip`（`2348da9`）只有「AA 的六句」沒過：出發提示、回到 4/4 17:00、天氣、走得動都通過。
      原因是對話框的打字機效果：測試記到半句「……好。行程表」，下一下就點到下一句。遊戲本身沒錯。
      改成記整句（`GAME.D.full`，和 `flow_first_meet` 一樣）；`flow_peishan_table`、`flow_b4_lecture` 也一起改。
- **C13 還沒做**：
  - 共同教學館的阿勳（10-3）、小福的還債（10-4）、SK03 週五小福午餐、SK05 販賣機。這幾項要先有阿勳的人物資料，以及小福用 2D 出遊的確認，已問 BB。
  - 期末「欠的，還了。」：遊戲裡還沒有刑總二的課程群組，已問 BB。
  - 3-2 明軒 F-M4：要先有打工系統（AA_72 第 3 節：每週最多兩個打工時段、和社團撞時間要選）。只做邀約會讓玩家答應一個不存在的打工，所以先不做。
- **期末考**：使用者 15:45（經 AA）說題目全部由使用者提供（`USER_INSTRUCTION_LOG.md`）。
  - 第 12 週憲法課的演講回想：AA 說大一下的 recall 先不匯入。
- **10-6 P4e（經原下的成績）和可昕第 9 節 9-9 綁在一起**：第 9 節恢復時一起做。
- **瀏覽器回歸**：
  - 15:40 快轉到 `a409436`，接著跑 wancai_floors、tap_stall、deploy_check、first_meet、invite_phone、zone_transitions、save_compat_v95、main_day12。
  - 執行器 15:57 重開（最晚 17:57 要再重開），先跑 `flow_b4_lecture`（修正版），再跑 tap_stall、deploy_check、first_meet、invite_phone、zone_transitions、save_compat_v95、main_day12、playtest_fixes、evtest。

**2026-10-14 15:30 UTC（開發分支最新：這一筆交接的 commit；線上＝v9.7 `313d620`；沒有排發布）**：
- **使用者 15:0x 的 P0 永久工作規則（D72、D73、D74）已寫入**：
  - `ae697fd`：`CLAUDE.md` 新一節、`AI_SESSION_HANDOFF.md` 第 0／4／7 節、`PROJECT_DECISIONS.md`、新檔 `docs/USER_INSTRUCTION_LOG.md`。
  - 使用者自己推的 `f6c836e`／`ace5d7e` 放在兩個檔最上面，`22c65ca` 用 merge 合在一起，以那一節為準。
  - **新訊息先讀先回；被糾正的方向只保存不整合；期末考只用使用者素材，AA、BB 自行出的題目在來源核對與使用者確認前不接進考試系統**。
  - 使用者重要指示的紀錄在 `docs/USER_INSTRUCTION_LOG.md`。
- **停下的工作**：可昕大一下（BB_96 第 9 節）半成品 → `wip_backup/kexin_y1s2_s9_wip_2026-10-14.patch`（`git apply --check` 通過，不在遊戲裡），等 BB 確認和 10/14 決策相容（情人節）。
- **15:00 以後的 v2（開發分支，瀏覽器還沒看畫面；每個都有單元測試，修改前失敗）**：
  - `3c1af62` C11／C21 第二個畫面：期中考完的 G1 大一下版＋19:00 阿鳳麵店長桌。
  - `eca4091` C20 重訪日 1 的麵店團併桌、單身不在麵店團（最親近的人）。
  - 這一筆：C9 春假麵店團兩天一夜（`STORY.travelOvernight`）、選完以後祐廷自動傳的一句、「宿舍變得很空。」只在 4/3 白天、W2b 期末家族群組、K8 旅行照片。
- **等使用者**：
  - 期末考的出題來源（`AA_129` 第 3 節三個做法；只有刑訴有現成題庫）。
  - AA 的五題；AA v6「不只跟一個女生交往」（2026-10-16 更正：v6 已授權開發——使用者 10-14 看過可以就直接開發、10-16 允許同時多位交往；現行規則＝企劃線 AA_140 第 0 節；這裡的「等使用者」已作廢，AA_140 0-2 X4）；10/14 新決策與校外約會由 AA、BB 互審後交接。
- **等 AA、BB、LAWWW2**：
  - AA、LAWWW2 的 P0 ACK（BB 已知新規則）。
  - BB：可昕第 9 節要不要改、Z3 的四個問題、W3b 的文章與法律審查。
  - AA：重訪日 1 以安／語彤／小語／芯慈的訊息版本（暫時跳過她們）。
- **瀏覽器回歸**：
  - 執行器 14:53 重新開始（最多到 16:53），在跑 flow_playtest_fixes。
  - 接著跑 evtest，之後快轉到最新 commit，跑 wancai_floors、tap_stall、deploy_check、first_meet、invite_phone、zone_transitions、save_compat_v95（v9.5 正式版在 port 8781）、main_day12。
- **輕量 Node 測試清單**：`scratchpad/light_js.txt`，83 個。

**2026-10-14 14:55 UTC（開發分支最新：這一筆交接的 commit；線上＝v9.7 `313d620`，下一次發布最早 15:32:31 UTC，沒有排發布）**：
- **v2 大一下，14:05 以後新增（開發分支，都還沒發布、瀏覽器還沒看畫面；每個都有單元測試，修改前失敗、修改後通過）**：
  `0867a19` C9 春假三選一（邀約、選擇、可昕 K8 開車旅行、麵店團照片；麵店團那一趟的事件等 AA）；`b6dc42e` C2 主線 2 親戚的土地資料（一）＋可昕除夕 KN；
  `af555b6` 芷若 Z4「十點的電話」改寫＋沛珊 P3b 課輔班；`4d77d05` 學姊 W2b 家族聚餐、W2c 三件事、「誰有車」；`dd8276c` 子晴 Q5 成發；
  `76a7e0f` 芷若 Z5 東京物語早場＋方奕廷 Z6；`f1d132c` 學姊 W3 調到第 5 週以後＋W3_STANCE、W5 便條；`6517acc` 大一下手機小事八則；
  `809e176` 芷若 Z3「妳自己喝什麼」＋點餐「也幫芷若點一杯」（Z3 那天 21:40 起 Café 只剩祐廷：客人起身走到門口才離開、21:40～22:00 不生成）。
- **等 BB（14:51 已問，DELIVERED）**：①W3b 手機上的爭論要真的文章內容＋法律審查（沒有就不做）②Z5 電影票根的說明文字 ③群組名「東京物語」④拒絕早場後要不要排午場；Z3 的選項字「（就這樣）」「不加」、她那杯 120 元請 BB 確認。
- **等 AA（之前已問，DELIVERED）**：C11＋C21 第二個畫面、C20 併桌／單身版、C18 騎樓調弦、法服／吉他社大一下週次、C9 麵店團那一趟（＋BB）。**等使用者**：AA 的五題（會不會被當、讀書的影響、健身房、節日邀約、節日 CG）、AA v6「不只跟一個女生交往」（D50 第③級）。
- **開發分支瀏覽器回歸**（`scratchpad/run_q.sh`，wt_dev，port 8768；結果 `scratchpad/q/Q.txt`；執行器 14:53 重新開始，最多跑到 16:53）：13e2344 上 p0_movement、main_day12、first_meet、invite_phone、zone_transitions、
  reachability_all、存檔相容 v95／v7、touch_flow_wenzhou、flow_clubs 都 ALL PASS；接著 flow_playtest_fixes、evtest，然後快轉到 `809e176` 跑 wancai_floors、tap_stall_201、deploy_check、
  first_meet、invite_phone、zone_transitions、save_compat_v95（v9.5 正式版 a4f2760 在 port 8781 產生舊存檔）、main_day12。
- **接下來**：BB_96 其他（3-2 明軒 F-M4 要家教打工系統、3-7 沛珊的桌子＝C13 的一部分）→ BB_96 第 9 節可昕（情人節、K5、K7 3/22、K6、K6b、手機小事、期末成績）→ 第 10 節經濟系朋友 → C13 可玩切片。
- **輕量 Node 測試清單**：`scratchpad/light_js.txt`（80 個，809e176 全部通過）。

**2026-10-14 14:05 UTC（開發分支最新：這一筆交接的 commit；線上＝v9.7 `313d620`，下一次發布最早 15:32:31 UTC）**：
- **v2 大一下，12:35 以後新增（開發分支，都還沒發布、瀏覽器還沒看畫面）**：`0aa1a4c` C14 以安新 7（吵架＋公法讀書會；法律台詞 `legal_review:'REQUIRED'`，BB 已查核「無誤」，見交付清單）；
  `1380f39` C21 第一個畫面（第 4 週法服讀書會結束後沛珊和柏翰；新增活動結束後的事件 `afterActivity`＝`CLS.afterActEvent`；法服讀書會大一下也有 `termWeeks`）；
  `419431f` C18 小語語 2（三個徵兆：傅鐘早餐 auto＋near、麵店日的一句旁白、社課後／騎樓的問題；吉他社大一下也開）；`753cb8a` C20 重訪日 1 可昕的版本（6/28 18:00 Café，選項只出經歷過的事）。
- **等 AA 回覆（已問，DELIVERED）**：①C11＋C21 第二個畫面（大一下期中的宵夜在麵店長桌：揪人的台詞、宵夜內容要不要和大一上一樣、G1 大一下版）；②C20 麵店團併桌／單身的版本（誰揪、最親近的人怎麼選）；
  ③C18 騎樓版小語「調弦」的動作；④法服、吉他社大一下的週次（目前 2～7、10～16／5～7、10～16）。
- **開發分支瀏覽器回歸**（`scratchpad/run_q.sh`，wt_dev，port 8768；結果 `scratchpad/q/Q.txt`）：13e2344 上 p0_movement、flow_main_day12 ALL PASS；deploy_check 的宿舍窗外景 404 已補拍（e8b8f31）；
  flow_tap_stall_201 是測試的錯（0604058 已修）。佇列接著跑 first_meet、invite_phone、zone_transitions、reachability_all、存檔相容、wenzhou、clubs、playtest_fixes、evtest，然後快轉到 1380f39 跑 wancai_floors、tap_stall、deploy_check。
- **接下來**：C9 春假三選一（BB_96 9-5 的 K8＋交接包 v2 第 3 節）→ C2 嘉義 → C13 可玩切片 → BB_96 其他（照週次）；AA 回覆後補 C11／C21 第二個畫面、C20 其他版本。
- **輕量 Node 測試清單**：`scratchpad/light_js.txt`（71 個，全部通過）；新的 v2 測試：`tests/v2_c14_unit.js`、`v2_c18_unit.js`、`v2_c20_unit.js`。

**2026-10-14 12:35 UTC：v9.7 已發布**——main 從 v9.6 `e88bda5` 快轉到 **`313d620`（候選 19 本身，沒有強制推送）**；GitHub Pages 第 16 次部署 2026-10-14 12:32:31 UTC success。發布紀錄 `docs/RELEASES.md` 的 v9.7 一節；下一次最早 15:32:31 UTC（三小時規則）。
- 候選 19 已併回開發分支（`3679126`）。flow_boya_interior 在候選 19（＝發布版）重跑 ALL PASS（LAWWW2 `d7ffa8c`，12:35），已補進 RELEASES.md——發布版的每一項發布前測試都有結果了。
- **LAWWW2 路人底模（WIP，使用者 10-14「NPC 不要都是一張臉換衣服」）12:40 交付**：8 個路人 VRM（`claude/second-ai-env-art` 的 `assets/models/char/second_ai/bl_npc_{nm1..nm4,nf1..nf4}.vrm`，各 2.4–2.7 MB）、接法 patch `docs/art-rebuild/second_ai/patches/npc_ambient_1ca527d.patch`（127d36d：assets3d.js 加 8 筆 ambient、AMB＝新 8＋舊 4）、遊戲內對照圖 `docs/art-rebuild/second_ai/shots/npc_ingame_g1305_old_vs_new.webp`（9c50fdd：共同教學館門口同一批 5 人，舊的 2 種模型、新的 5 種）。已知缺點：四個女生都是空氣瀏海、nm3 側臉有脫離的髮片、nm2 頭髮偏厚、8 個一起預載多約 20 MB。狀態 MODEL_READY 前的 WIP——下一個工作階段看完對照圖再決定要 LAWWW2 改什麼，接進開發分支前跑人物相關回歸（model_upgrade、p0、效能）。
- 開發分支 12:34 以後：`f8c5996` AA、BB 的回覆（慈 2 旁白「她列式子，你畫圖」、語彤 6 選項字、阿凱 K2 好感數字）。還沒做、企劃組已給原文的：AA_71 的 C3 寒假拜年（含 BB 7451e42 改字）、C7 杜鵑花季、C16 系籃、C17 法四畢業（180c8ff）；BB_70 3-7 便利商店飯糰（讀書會群組，35c9328）；「天文與我們」改名（AA 同意）。
- 開發分支下一步照 12:00 那一筆的「接下來」（v2 大一下：C14 以安新 7＋公法讀書會 → C21 → C18 → C20 → C9 → C2 → C13 → BB_96 照週次）；開發分支的瀏覽器回歸（flow_tap_stall_201 等）還沒跑。

**2026-10-14 12:20 UTC 補充（v9.7 發布前最後一段；開發分支最新：這一筆交接的 commit；線上還是 v9.6 `e88bda5`；v9.7 最後的候選＝候選 19 `313d620`）**：
- **候選 19 `313d620`**（本機分支 `rel/v97-rc19`，`scratchpad/wt_rc97`；bundle `wip_backup/v97-rc17.bundle`→`v97-rc18.bundle`→`v97-rc19.bundle` 依序 fetch，前置 `52f288e`）＝候選 16＋
  ①flow_clubs A 段換日子（10/13 在 v9.7 是颱風假）②flow_clubs A 段初遇台詞跟上 v1 定稿（沒聽阿凱轉述過的存檔第一句是「新人？……法律系的？」）——只改測試；
  ③**遊戲修正**：`game3d.js` 的 choose——對話框剛講完、留在畫面上時，選單墊高到對話框上面（bottom＋對話框高度），但 max-height 沒扣，**手機橫向 844×390 社團博覽會 6 個選項的選單上緣在畫面外 76 px，第一個「吉他社」看不到也捲不到**
  （flow_clubs C 抓到；量選單位置的腳本 `wip_backup/release_v96_v97/fair_menu_probe.py`）。改成 max-height 一起扣掉、太長在選單裡捲動；量過修改後上緣 26 px、第一個點得到。v9.6 線上版沒有社團博覽會（v9.7 新功能）。
- **候選 19 已過**：Node 76 項 ALL PASS。**跑中**：deploy_check → flow_clubs（我的佇列，約 12:30 跑完）；flow_boya_interior：LAWWW2 在候選 16 ALL PASS（`4985b0a`，24 項），12:18 請它在候選 19 再跑（遊戲程式只差 choose 這一處）。
- **其他所有發布前測試**都已在候選 8～16 過（遊戲程式＝候選 8；候選 19 只多 choose 這一處，見 `collect_results_v97.py` 的總表）。
- **發布步驟**（候選 19 的 flow_clubs、deploy_check 過，boya 有候選 19 或候選 16 的結果）：`git push origin 313d620:refs/heads/main`（快轉、不 force；`git merge-base --is-ancestor origin/main 313d620`）→ 確認 Pages 部署成功 →
  `python3 scratchpad/collect_results_v97.py > v97_results.txt` → `finish_release_v97.py <開發分支 worktree> 313d620 'YYYY-MM-DD HH:MM:SS' <Pages 第幾次> v97_results.txt 候選 19 "$(cat later_rc_v97.txt)"` → commit＋push 開發分支 →
  告訴使用者（`v97_user_summary.md`；main 有什麼、開發分支有什麼、iPhone 沒測）、LAWWW2、AA、BB → `rel/v97-rc19` 併回開發分支（choose 的修正要一起進開發分支）。D71：v9.7 不受三小時限制。
- **如果這個工作階段在發布前中斷**：下一個工作階段照上面做；boya 用 LAWWW2 的候選 19 結果（沒有的話自己在候選 19 跑一次）。

**2026-10-14 12:00 UTC 補充（開發分支最新：這一筆交接的 commit；線上 v9.6＝`e88bda5`；v9.7 最後的候選＝候選 17 `402f2b5`）**：
- **v9.7 候選 17 `402f2b5`**（本機分支 `rel/v97-rc17`，在 `scratchpad/wt_rc97`；bundle `wip_backup/v97-rc17.bundle`，前置 `52f288e`）＝候選 16＋`tests/flow_clubs.py` A 段換日子：
  原本讀檔到 10/13 週一，v9.7 大一上劇情把那天排成颱風假（T1），吉他社 noHoliday，遊戲照規則說「今天沒有社課」、按門沒有「參加」（候選 16 跑的 A 段 3 項 FAIL＝測試的問題）；
  改用 10/15 週三，18:40 的檢查改成要「今天 19:00 在這裡」（原本只看「19:00」，連「今天沒有社課」也算過）。只改測試，遊戲程式＝候選 8（13 起多版本字串）。
- **11:40 以後過的**：flow_playtest_fixes（候選 15）ALL PASS（2633 秒）；Node 76 項（候選 16，在 wt_rc97 跑：候選 8 的 story3d.js 改了一行，Node 上次只跑到候選 5）ALL PASS；
  LAWWW2 `bef3d7c` flow_library_floors（候選 16）ALL PASS 27 項。
- **跑中／還沒跑（發布前最後兩項）**：flow_clubs（候選 17，11:55 開始，`q/flow_clubs_v97b.log`）→ flow_boya_interior（我的佇列在 flow_clubs 之後；LAWWW2 11:52 P1 請它在候選 16 並行跑，等 ACK；誰先過算誰的）。
- **全過以後發布**：`git push origin 402f2b5:refs/heads/main`（快轉、不 force）→ 確認 Pages → `scratchpad/collect_results_v97.py`（RCS 已有候選 17）→
  `finish_release_v97.py REPO MAIN_SHA 'YYYY-MM-DD HH:MM:SS' PAGES_N 結果檔 候選 17 "$(cat later_rc_v97.txt)"`（備份在 `wip_backup/release_v96_v97/`）→ 告訴使用者、LAWWW2、AA、BB → 候選 17 併回開發分支。D71：v9.7 不受三小時限制。
- **開發分支（下一版，瀏覽器還沒看）**：`a087e9c` 子晴 Q4「比賽那天」（BB_96 4-1：公館騎樓、大一下第 8 週週六 13–16、CONTEST_DAY）；`9961929` 子晴 Q6「測試我的遊戲。現在。」
  （BB_96 4-2：前置 CONTEST_DAY 或 CLAPPED＋有點熟、第 11 週以後週一三吉他社時段、PLAYTESTED、FIRST_BUG）＋人物面板 8 種新記憶補中文名稱（原本顯示英文代號）。劇情 Node 測試 66/66。
  問 BB 中：Q4 的錢（照舊版 −120）、Q6 第三個選項的好感數字、單身版要不要散會後兩人、小遊戲要不要一句旁白。
- **接下來**：照 11:40 的順序（C14 以安新 7＋公法讀書會 → C21 → C18 → C20 → C9 → C2 → C13 → BB_96 照週次）；BB_96 4-3 阿凱 K2「工程師也是人」（Q6 之後在宿舍）可以接著做；
  4-4 子晴 Q5 成發（萬才館小舞台、演出中「拍手」）要新的畫面與互動，排在 C13 之後。

**2026-10-14 11:40 UTC 補充（開發分支最新：這一筆交接的 commit）**：
- **v9.7 發布回歸**：flow_playtest_fixes（候選 15）A～C 全過、D 跑中；之後自動換執行器（`run_q_handover.sh`）→ 候選 16 → 社團 → 博雅 → 總圖兩支 → see_through；LAWWW2 從另一頭跑 see_through、總圖兩支（11:15 的 P1，還沒回 ACK）。
- **v2（大一下）開工**（AA、BB 審完、使用者同意直接施工；照 `交接包_v2_交付清單`、`交接包_v2_大一下_草稿`、`BB_96`）：
  - 已做（開發分支，Node 84/84，瀏覽器都還沒看）：`f451e71` 第 1 批「先改的現有文字」（語彤 4 改成阿姨扭到手腕、期中第 8～9 週；語彤 5 三句；慈 2 第四個選項＋說多少經濟系）；
    `40d3fa9` C4 大一下選課結果接 v1（城市與散步、天文與我們）；`e07088d` C19 大一下期末最後一頓；`c09407f` C8 以安新 5（舍友的記點申訴，第 5 週總圖＋第 7 週結果／手機／群組聽說）；
    `8e58449` C12 語彤 6 房東來過了（選項的字「（問語彤）／（不問）」是我寫的動作描述，已請 AA 看）。
  - **接下來的順序**：C14 以安新 7（第 11～12 週吵架＋公法讀書會；要做「公法讀書會」每週四 20:00 一格的活動，照法服讀書會 lawclub_study 的做法）→ C21 沛珊和柏翰兩個畫面（第 4 週萬才館、期中宵夜；只有畫面）→
    C10 已做的慈 2 之外的 C5／C6 已完成 → C18 小語 語 2（三個徵兆，選項照 AA_40）→ C20 重訪日 1（草稿第 3 節最後，Café 窗邊雙人桌）→ C9 春假三選一（新系統：2D 背景＋compact）→ C2 嘉義老家主線 2（2D）→
    C13 可玩切片（B4 演講、B5、女舍、阿勳，照 AA_115 修正版＋BB_105、BB_106）→ BB_96 的人物（芷若 Z3～Z6、子晴 Q4～Q6、學姊 W2b～W5、沛珊 P3b、阿凱、方奕廷、明軒 F-M4、可昕 K5～K8、經濟系的朋友）照週次。
  - **缺原文的（不自己寫，要問 AA）**：C3 寒假群組拜年（AA_71 2-8 只有大綱）、C7 杜鵑花季（以安拍照那一段的實際台詞）、C16 系籃（拍手、記分、送水三種的台詞）、C17 畢業（群組的話）。
  - 「天文與我們」目前只在選課那一句；課表裡大一下的通識還叫「通識」（courses.js 的 ge_y1s2），之後 K8「山上看星星只給第 6 週天文課有去」要用到時一起改名。

**2026-10-14 11:20 UTC（段落存檔；開發分支最新：這一筆交接的 commit；線上 v9.6＝`e88bda5`；v9.7 最後的候選＝候選 16 `52f288e`）**：
- **v9.7 候選 15 `d8aca4d`、候選 16 `52f288e`**（本機分支 `rel/v97-rc15`、`rel/v97-rc16`，在 `scratchpad/wt_rc97`；bundle `wip_backup/v97-rc15.bundle`〔前置 fd46e14〕、`v97-rc16.bundle`〔前置 d8aca4d〕）：
  只改測試，遊戲程式＝候選 8 `3e5201d`（候選 13 起多 script 版本號 9.7-1，`git diff 3e5201d 52f288e -- . ':!tests'` 只有 index.html）。
  候選 15＝flow_bike 只量真的在騎的那一段（候選 14 把按下、放開搖桿的幾幀算進去，5.07 m/s；候選 15 量到 6.20 m/s＝設定值）；候選 16＝LAWWW2 的 patch `v97_tests_fd46e14`（first_meet、discuss_class、lecture_attend，判定變嚴、不是放寬）。
- **已過**：第五節核心 8 項；flow_bike（候選 15 ALL PASS：腳 0 cm、校門、公館、便利商店、下車、存讀檔）；flow_study_legal、flow_seated_spawn（候選 14）；evtest；flow_course_choice；
  LAWWW2：flow_first_meet、flow_discuss_class（候選 14＋patch，ALL PASS）、adv_cg_layout、flow_main_day12、flow_typhoon、cg_rain_shots、flow_invite_phone、teaching_buildings、soclib、campus_glb_integration。
- **跑中／還沒跑**：我這台 flow_playtest_fixes（跑中）→ 換執行器（自動：`run_q_handover.sh`，舊的 25229 跑完這一項看到佇列空＋STOP 就結束，新的把 `q/queue.hold` 接回）→
  候選 16 → flow_clubs → flow_boya_interior → flow_library_floors → flow_library_scene → see_through；LAWWW2 從另一頭：flow_lecture_attend → see_through → flow_library_scene → flow_library_floors。誰先過哪一項就算數。
- **全過以後發布**：`git push origin 52f288e:refs/heads/main`（快轉、不 force）→ 確認 Pages → `scratchpad/collect_results_v97.py`（RCS 已有候選 15、16）→ `finish_release_v97.py REPO MAIN_SHA 'YYYY-MM-DD HH:MM:SS' PAGES_N 結果檔 候選 16 later_rc_v97.txt`
  （這幾個檔在 `wip_backup/release_v96_v97/` 有備份）→ 告訴使用者（`v97_user_summary.md`）、LAWWW2、AA、BB → 候選 16 併回開發分支。D71：v9.7 不受三小時限制。
- **開發分支（下一版，瀏覽器都還沒看）**：`15fd793` BB_120 1-7c 固定的改變（子晴、沛珊照熟度的訊息，方奕廷「學弟好」三則與上山那一週的澆水，阿凱的泡麵評鑑表；`tests/bb120_fixed_unit.js`）；
  `67953ae` 一起走路的選項句走到目的地、見面前選（芷若猜電影、阿凱機車擋騎樓）；`7247f1a` 點地面點到人過不去的地方不再原地一直走（LAWWW2 回報的 201；`tests/tap_stall_unit.js`）；`d9c7c89` AA、BB 10:23～10:36 的回覆。Node 82/82。
- **問 BB 中**：方奕廷「寒流前」放哪一週（先放大一上第 13～15 週）；子晴「你為什麼換」、沛珊「大家都不遵守的法律」的玩家選項原文。
- **等使用者**：AA 的五個問題（會不會被當、讀書的影響、健身房 A/B/C、節日邀約與生日、節日 CG 七張）；v6「不只跟一個女生交往」（第③級）（2026-10-16 更正：v6 已授權開發——使用者 10-14 看過可以就直接開發、10-16 允許同時多位交往；現行規則＝企劃線 AA_140 第 0 節；這裡的「等使用者」已作廢，AA_140 0-2 X4）。

**2026-10-14 10:40 UTC 補充**：v9.7 最後的候選改成**候選 14 `fd46e14`**（＝候選 13＋flow_bike 量法：一直按住搖桿量速度、車停下來再量腳和踏板、上車站在離店門遠的那邊；
只改測試；bundle `wip_backup/v97-rc14.bundle`，前置 `69a6cdc`）。候選 14 已過：deploy_check、p0；flow_bike 跑中，之後照佇列。LAWWW2（10:35 P1）修三支測試
（flow_first_meet 打字機半句＋追人、flow_discuss_class 還在走就檢查＋轉述格式、flow_lecture_attend 選「坐一下」），在候選 14 上重跑，修改併進候選 15（只改測試）。
開發分支：`f6c1ad8` 一起走路聊天、`1d5d30e` 阿凱宵夜、`7b9291e` 腳踏車停在門口旁邊、`f7c77f3` 候選 10～14 併回（script 版本號 9.7-1）。
企劃組交接板：**v2（大一下）整包可以施工**（AA、BB 都審完；照排程 v1 在瀏覽器測過再接）——下一個大工作。

**2026-10-14 10:25 UTC（段落存檔；開發分支最新：這一筆交接的 commit；線上 v9.6＝`e88bda5`；v9.7 最後的候選＝候選 13 `69a6cdc`）**：
- **v9.7 候選 12 `b223a31`、候選 13 `69a6cdc`**（本機分支 `rel/v97-rc12`、`rel/v97-rc13`，在 `scratchpad/wt_rc97`；bundle `wip_backup/v97-rc13.bundle`，前置候選 11 `836a1f6`）：
  候選 12＝flow_bike 先推一下讓車頭轉正再量速度、失敗時結束碼 1（只改測試）；**候選 13＝index.html 的 script 版本號 9.6-1 → 9.7-1**（v9.6 候選 5f66b67 有做、v9.7 漏了：
  30 個程式檔有改，版本字串不變的話手機可能拿到新頁面＋快取舊程式；拿掉版本字串後逐行相同）。遊戲程式＝候選 8 `3e5201d`。
- **09:40 以後過的**：flow_course_choice（候選 11）ALL PASS；evtest——整批那 6 個 BAD（研究所三個事件演完 busy:true）單獨跑 6/6 OK，是整批跑的順序造成的，不是遊戲問題；
  LAWWW2 `7f572c8`：flow_teaching_buildings、flow_soclib ALL PASS（候選 8）。
  **跑中／還沒跑**：flow_bike（候選 12）→ deploy_check、p0（候選 13）→ flow_study_legal → 坐姿 → 試玩修正 → 社團 → 博雅 → 總圖兩支 → see_through → 其他（`scratchpad/q/queue.txt`）。
  執行器 `bh624bnas` 10:16 換新的，12:16 到期（到期前用 queue.hold 換）。LAWWW2 還有：flow_first_meet（候選 8）、flow_lecture_attend（候選 9）、flow_discuss_class（候選 7）、campus_glb_integration。
- **開發分支（下一版，瀏覽器都還沒看）**：`ab784c3` 阿哲、語彤兩句換成 AA 定稿；芷若好朋友的紙杯旁白（BB_120 1-2，對齊 Z1）；語彤雨天之後在麵店給聯絡方式（AA_70）；
  麵店「圖書館那天之後…」條件修正（給過傘的人不會連問兩句）。`43ac7b7` **邀約的個性第一段**（`INVITE_DATA.people`，13 人被邀約時的台詞與個人規則；`tests/invite_people_unit.js` 37 項）。
  還沒做：邀約第二段（一起走路聊什麼：芷若猜電影、子晴 TOLD_HER_CHANGE）、BB_120 其他「固定的改變」（子晴／沛珊的訊息樣子、阿凱宵夜與評鑑表、方奕廷學名、澆水一週——多數要 BB 補具體台詞）。
- **等使用者**：AA 的五個問題（會不會被當、讀書的影響、健身房 A/B/C、節日邀約與生日、節日 CG 七張）；v6「不只跟一個女生交往」（第③級）（2026-10-16 更正：v6 已授權開發——使用者 10-14 看過可以就直接開發、10-16 允許同時多位交往；現行規則＝企劃線 AA_140 第 0 節；這裡的「等使用者」已作廢，AA_140 0-2 X4）。
- **如果這個工作階段在發布前中斷**：從 bundle 取出 `rel/v97-rc13`（依序 fetch rc9→rc10→rc11→rc13 的包），把「跑中／還沒跑」的跑完，全過才把 main 快轉到候選 13（不 force）；
  發布後跑 `scratchpad/finish_release_v97.py`（`wip_backup/release_v96_v97/` 有備份；LATER_RC 用 `later_rc_v97.txt`）。D71：v9.7 不受三小時限制。

**2026-10-14 09:40 UTC（段落存檔；開發分支最新：這一筆交接的 commit；線上 v9.6＝`e88bda5`；v9.7 最後的候選＝候選 11 `836a1f6`）**：
- **v9.7 候選 10 `11bdf50`、候選 11 `836a1f6`**（本機分支 `rel/v97-rc10`、`rel/v97-rc11`，在 `scratchpad/wt_rc97`；bundle `wip_backup/v97-rc10.bundle`〔rc5／rc8／rc9／rc10〕，rc11 在下一個 bundle）：只改測試，遊戲程式＝候選 8。
  候選 10：flow_bike——上車時鏡頭對著男一舍的牆，推搖桿往前撞牆只走 2.3 m（測試量到 1.15 m/s）；校門寫死 (-122.5,0) 離出口 3.5 m（範圍 3 m）→ 改成先把鏡頭轉向最空的方向、校門照遊戲裡出口的位置。
  候選 11：flow_course_choice 跟上睡覺第二版（床的選項「睡到明天早上」，同 flow_typhoon 候選 4 的改法）。騎車畫面本身這次看了：上車、腳在踏板、手在把手（≤5 cm）都通過。
- **v9.7 已過（本機）**：候選 4～8 的 deploy_check（候選 8 再過一次）、Node、reachability_all、zone_transitions、minimap、save_compat_v7／v95、p0、touch_flow_wenzhou、初遇存檔遷移、flow_class_real、campus_layout_nav、joystick、flow_classes、flow_linze_floors。
  **跑中／還沒跑**：flow_bike（候選 10）→ evtest（加 executable_path 重跑）→ flow_course_choice（候選 11）→ flow_study_legal → 坐姿 → 試玩修正 → 社團 → 博雅 → 總圖兩支 → 手機邀約 → 其他。執行器 `bxeuwcwb5` 09:18 起（11:18 前要換）。
  LAWWW2：flow_first_meet、flow_lecture_attend（候選 9）、flow_discuss_class、adv_cg_layout、flow_main_day12、flow_teaching_buildings、flow_soclib、campus_glb_integration（結果還沒回來）。
- **開發分支（下一版，瀏覽器都還沒看）**：`73baa50` 店員（Café 一般店員、總圖服務台館員）；`ce67bb7` 手機約人（約不了的原因照 AA_125 第 1 節、可昕和學姊開場就有聯絡方式、有點熟以後「交換聯絡方式」、兩個人單獨＋有伴侶不約）；
  `1b56598` 好感看得見（AA_124 1-6、BB_120 第 1 節：門檻台詞、見面結束一句、聯絡人名字、見面旁白；`src/data/rel_lines.js`）；`b187c46` Café 的學姊小場面（BB_120 1-1）。
  還沒做：BB_120「固定的改變」（芷若的點單要和 Z1 事件對齊、子晴／沛珊的訊息樣子、方奕廷學名、阿凱宵夜）、方奕廷澆水一週、學姊小交流 (2)（等 AA_124 第 2 節）。
- **等使用者**：AA 的五個問題（讀書會不會被當、讀書影響的方向、健身房 A/B/C、節日邀約、節日 CG）——已原文轉給使用者；AA_124 第 2 節；v6「大學四年不只跟一個女生交往」（D50 第③級）（2026-10-16 更正：v6 已授權開發——使用者 10-14 看過可以就直接開發、10-16 允許同時多位交往；現行規則＝企劃線 AA_140 第 0 節；這裡的「等使用者」已作廢，AA_140 0-2 X4）。
- **問 AA 中**（ce67bb7 後）：兩個人單獨只套女生、「找大家一起吧」沒有群約、學姊有伴侶算到大三上整學期。
- **如果這個工作階段在發布前中斷**：從 bundle 取出 `rel/v97-rc10`（＋候選 11 的 flow_course_choice 修改在開發分支下一個 commit 也會帶到），把「跑中／還沒跑」的跑完，全過才快轉 main 到最後的候選；D71：v9.7 不受三小時限制。

**2026-10-14 09:05 UTC（段落存檔——使用者 09:00：「如果兩小時內沒辦法把下一個版本弄出來就要做一個段落上傳到資料庫一次，因為我們的用量快要到」；開發分支最新：這一筆交接的 commit；線上 v9.6＝`e88bda5`）**：
- **v9.7 候選 8 `3e5201d`**（本機分支 `rel/v97-rc8`，bundle `wip_backup/v97-rc8.bundle`，前置 22c597c）＝候選 7＋`story3d.js` 見過以後按鈕名字更新（事件演完才定名字；Café 第一次見面後原本還是「和不認識的女生說話」）＋flow_first_meet 的 A（邊看邊追）、B2（沿遊戲路線點地面）。
  遊戲程式：候選 1＝v9.7 內容；候選 5＝Café 店員和得到話（engine3d staff 優先、story3d 沒事件就點餐）；候選 8＝按鈕名字。其他候選只改測試。
- **v9.7 已過**（本機，候選 4～7）：deploy_check、Node（候選 8 也過）、reachability_all（候選 4、5）、zone_transitions、minimap、save_compat_v7、p0、touch_flow_wenzhou、初遇存檔遷移、save_compat_v95、flow_class_real、campus_layout_nav、joystick、flow_classes。
  LAWWW2：flow_typhoon、cg_rain_shots、flow_invite_phone；flow_first_meet 候選 6 的 C（Café 修正）通過、A／B2／C 第二次 → 候選 8 重跑中。
  **還沒跑完**：本機 flow_linze_floors（跑中）→ deploy_check（候選 8）→ flow_bike → evtest → 其他回歸；LAWWW2：flow_lecture_attend（候選 6）→ adv_cg_layout → flow_main_day12 → flow_teaching_buildings → flow_soclib → campus_glb_integration → flow_first_meet（候選 8）→ flow_discuss_class（候選 7 測試）。預估 10:30 UTC 全過就發。
- **使用者 10-14 試玩 v9.6 回饋**（`docs/history/user_feedback_2026-10-14_v96.md`）在開發分支已做（下一版，瀏覽器還沒看）：男一舍前地板閃爍 `7cd6684`（`tests/ground_zfight_unit.js`）、好感提示 `e30b320`（`tests/rel_feel_unit.js`）、換區域釋放材質貼圖 `45edfa8`（`tests/zone_dispose_unit.js`；瀏覽器 `tests/zone_memory.py` 還沒跑；iPhone 跳回開始畫面的推測原因）。
  還沒做：店員（Café 芷若沒班時、總圖服務台、公館飲料店）、牽腳踏車的路人（換成 BIKE.rider、要看畫面）、男宿交誼廳（#47）、AA_124 第 1 節關係數值、考試成績系統骨架（AA_124 第 2 節等使用者確認）。LAWWW2 排了便利商店商品、交誼廳家具（v9.7 測完後）。
- **發布工具**：`scratchpad/collect_results_v97.py`、`finish_release_v97.py`（`wip_backup/release_v96_v97/` 有備份）；發布後 `v97_user_summary.md` 填好回報使用者。
- **如果這個工作階段在發布前中斷**：下一個 LAWWW 從 bundle 取出 `rel/v97-rc8`，照 TESTING.md 第五節把還沒跑的跑完（清單見上），全過才快轉 main；D71：v9.7 不受三小時限制。

**2026-10-14 08:12 UTC（開發分支最新：這一筆交接的 commit；線上 v9.6＝`e88bda5`；v9.7 候選改成候選 6 `7c5d4c2`，兩台機器跑回歸）**：
- **v9.7 回歸抓到一個 v9.6 以前就有的遊戲問題（已修，候選 5 `37a5db2`）**：兩點半 Café 吧檯後面的店員（芷若）和不到話——吧檯的點餐點永遠比較近，
  「和店員說話」從來不會出現（Node 模擬 2961 個站得住的點 0 處）；芷若在 Café 的初遇、點餐次數、集點卡都碰不到。修：`engine3d.js` nearestInteractable 標了 staff 的店員比櫃台的點餐點優先；
  `story3d.js` 店員標 staff、和店員說話先跑事件、沒有就點餐（同一份 CAFE_MENU）。`tests/cafe_barista_unit.js`（修正前的引擎 0 處、修正後 95 處）。NODE ALL PASS、reachability_all ALL PASS（候選 5）。
- **測試問題（只改測試）**：flow_first_meet（A 追人 10 次、B2 點地面沒靠近就用搖桿、走到後等自動事件 60／180 秒、C 同一天再說話＝點餐）；候選 6：flow_lecture_attend 等聽眾坐好再挑空位（演講時一半的位子有人，寫死的位子被替身坐走）。
- **分工（08:11）**：本機——zone_transitions、deploy_check（候選 5／6 重跑）、touch_flow_wenzhou、初遇存檔遷移、save_compat_v95、flow_class_real、campus_layout_nav、joystick、flow_classes、flow_linze_floors、evtest、其他；
  LAWWW2——flow_discuss_class、flow_first_meet、flow_lecture_attend、adv_cg_layout、flow_main_day12、flow_teaching_buildings、flow_soclib、campus_glb_integration。預估 10:00 UTC 兩邊跑完。
  已過（候選 4／5）：deploy_check、Node、reachability_all（候選 4、5）、zone_transitions、minimap、save_compat_v7、p0；LAWWW2：flow_typhoon、cg_rain_shots、flow_invite_phone。
- 本機分支 `rel/v97-rc5`、`rel/v97-rc6`；bundle `wip_backup/v97-rc6.bundle`（兩個 ref，前置 22c597c）。開發分支已合併候選 5、6（保留共同教學館、大一女舍的 manifest 兩行）。

**2026-10-14 07:55 UTC（開發分支最新：這一筆交接的 commit；線上 v9.6＝`e88bda5`；v9.7 候選 4 `6ad0923` 兩台機器平行跑回歸，全過就發——D71 不受三小時限制）**：
- **v9.6 已發布**：main 從 `a4f2760` 快轉到候選 15 `e88bda5`（07:45:17 推送，沒有強制推送），GitHub Pages 第 15 次部署 07:46:55 UTC success（標題「版本 v9.6（2026-10-14）」；沙盒連不到 Pages 網址，以部署紀錄的 head_sha 確認）。
  發布紀錄 `e6bce5c`（RELEASES.md 版本表、v9.6 說明、發布前測試 21 項 0 失敗含 LAWWW2 三項、緊急回復改回 v9.5、v9.7 依 D71 不受三小時限制）。已通知 LAWWW2、AA、BB（DELIVERED）。
- **v9.7 候選鏈**（本機分支 `rel/v97-rc1..rc4`，在 `scratchpad/wt_rc97`；bundle 在 `wip_backup/v97-rc*.bundle`，前置 `22c597c`）：候選 1 `5adef66`＝開發分支 `22c597c`－共同教學館／大一女舍 manifest 兩行＋版本字樣 v9.7；候選 2 `06f2b64`、候選 3 `8ac75f6`＝合併 v9.6 候選 14、15（只改測試）；
  候選 4 `6ad0923`＝LAWWW2 的兩個測試 patch（讀檔時關掉直向提示 #rotate、flow_typhoon 床的選項與醒來對話）。**候選 2～4 遊戲程式＝候選 1。**
- **v9.7 回歸**：本機（佇列 `scratchpad/q`、wt_dev 8768，執行器 `bv9tndc3b` 07:48:50 起，**09:48 前要換**，提醒 09:30）：deploy_check（v9.7 字樣）ALL PASS、Node 全部 ALL PASS；接著 reachability_all → zone_transitions → minimap → save_compat_v7 → p0 → touch_flow_wenzhou → 初遇存檔遷移 → save_compat_v95 → evtest → 選課 → 法律讀書 → 坐姿 → 試玩修正 → 社團 → 博雅 → 總圖兩項 → 腳踏車 → 手機邀約 → 其他回歸。
  LAWWW2（它的機器）：flow_typhoon、cg_rain_shots（patch 後重跑）→ flow_first_meet → flow_invite_phone → flow_lecture_attend → flow_discuss_class → adv_cg_layout → flow_main_day12 → 後半段（flow_class_real、flow_classes、flow_linze_floors、flow_teaching_buildings、flow_soclib、campus_layout_nav、joystick、campus_glb_integration）。結果抄進 `scratchpad/q/lawww2_results_v97.txt`。
  發布工具：`scratchpad/collect_results_v97.py`（結果整理）、`finish_release_v97.py`（RELEASES.md、CLAUDE.md；已乾跑）、`rel_v97_entry.md`（說明草稿）；備份在 `wip_backup/release_v96_v97/`。
- **開發分支有、v9.7 不放**：讀檔時劇情還在演就擋下（`3d7f068`，v9.5 起的已知問題，下一版放）、共同教學館與大一女舍合併材質 GLB（校門 ×1.097）、杜可昕 Blender 人物（`char.kexin`）。
- **等使用者**：AA 轉達的 v6「大學四年不只跟一個女生交往」（D50 第③級，要使用者直接確認）（2026-10-16 更正：v6 已授權開發——使用者 10-14 看過可以就直接開發、10-16 允許同時多位交往；現行規則＝企劃線 AA_140 第 0 節；這裡的「等使用者」已作廢，AA_140 0-2 X4）；iPhone 實機沒測。
- **下一步**：v9.7 全過 → 快轉 main 到候選 4（或之後的候選）→ 確認 Pages → collect_results_v97.py＋finish_release_v97.py → 回報使用者、通知三位 AI → 開發分支的瀏覽器驗證（讀檔防護、合併材質 GLB、可昕截圖給 BB）。

**2026-10-14 06:30 UTC（開發分支最新：這一筆交接的 commit；線上 v9.5＝`a4f2760`，main 沒動；v9.6 候選 13 `ba435d5` 在跑發布回歸，預估 07:45–08:15 UTC 發布；v9.7 候選 1 `5adef66` 平行測試中）**：
- **使用者 06:05**：「還有多久可以上新版本 把這些有CG劇情都加進去 還差多少東西 適量分配給LAWWW2 加快腳步」——回答：v9.6 先發（沒有新劇情），CG 劇情版＝v9.7（大一上 v1＋4 張 CG），三小時規則最早 v9.6＋3h；
  BB 通過的 41 張 CG 裡故事已經在遊戲裡的只有 4 張（CG-1、BCG-18、CG-14、CG-15，都接上了），其他要等那些劇情批准、實作。LAWWW2 分到 v9.7 的瀏覽器回歸（它的機器上平行跑）。
- **v9.6 候選 13 `ba435d5`**＝候選 12＋座位的「坐下」範圍（`engine3d.js` 的 `fitSeatRadius`：最近站得住的位置往外不到 0.3 m 的座位放大範圍；656 個座位放大 29 個，都在 v9.6 新的 5 棟）＋測試用 `E.simWalk` 步數上限看路線長度＋`tests/seat_reach_unit.js`（候選 12 失敗、候選 13 通過）。
  reachability_all 在候選 12 失敗（9 個座位）→ 候選 13 通過。已過（候選 13）：reachability_all、Node 全部、deploy_check、zone_transitions；候選 12 上過、不受影響：flow_class_real、campus_layout_nav、joystick、p0、minimap、save_compat_v7、touch_flow_wenzhou。
  剩：flow_classes（跑中）→ flow_linze_floors → flow_soclib → flow_teaching_buildings → flow_main_day12（後兩項 LAWWW2 也跑，先完成的算）。執行器 `brx885ke5` 06:10 起，08:10 前要換（提醒 07:50）。
  發布腳本 `scratchpad/finish_release.py`（第 6 個參數「候選 13」）、`collect_results.py`（已改成候選 13 為準）。
- **開發分支**：`5d50939` v1 第 12 批（K1 回應＋第二次邀約、K1b、K3、K2 旁白、A15、A19 以安第一則訊息、A12 分工表、CG-14、CG-15、LICENSES；v1_batch12_unit 37 項）；
  `22c597c` 合併候選 13（衝突：engine3d 兩邊都留——開發分支的 seat.taken＋候選 13 的 fitSeatRadius；assets3d／story3d／文件照開發分支）＋LAWWW2 的 campus_glb_integration patch（manifest 有才檢查、蒲葵用位置判斷）。NODE ALL PASS。
- **v9.7 候選 1 `5adef66`**（本機分支 `rel/v97-rc1`，備份 `wip_backup/v97-rc1.bundle`，前置 `22c597c`）＝開發分支 `22c597c`＋拿掉共同教學館、大一女舍 manifest 兩行（合併材質後 ×1.097 只剩 0.003）＋版本字樣 v9.7。
  瀏覽器回歸分工：LAWWW2——劇情流程（flow_typhoon、cg_rain_shots、flow_first_meet、flow_main_day12、flow_invite_phone、flow_lecture_attend、flow_discuss_class、adv_cg_layout）＋必跑後半段（flow_class_real、flow_classes、flow_linze_floors、flow_teaching_buildings、flow_soclib、campus_layout_nav、joystick、campus_glb_integration）；
  LAWWW——佇列在 v9.6 必跑之後自動 setff 到 `5adef66`：deploy_check（v9.7 字樣）、Node、reachability、換區域、小地圖、存檔 v7、p0、觸控＋存檔 v9.5、初遇存檔遷移、evtest、選課、法律讀書、坐姿、試玩修正、社團、博雅、總圖。
- **等別人**：LAWWW2——候選 13 的 flow_main_day12／flow_teaching_buildings 結果、v9.7 劇情流程；收到但排到 v9.7 之後：杜可昕 VRM（0171f66）、合併材質 GLB（8902c5f）、BB 的 CG-10 尾聲圖層（9 張全部通過）。
- **下一步**：v9.6 必跑全過 → 快轉 main 到 `ba435d5` → 確認 Pages → merge main 回開發分支（已含）→ finish_release.py／collect_results.py → 回報使用者 → v9.7 測完、滿三小時 → 發布 v9.7。

**2026-10-14 05:48 UTC（開發分支最新：這一筆交接的 commit；線上 v9.5＝`a4f2760`，main 沒動；v9.6 候選 12 `a9c2b69` 在跑發布回歸，預估 07:30 UTC 發布）**：
- **v9.6 發布回歸**：候選 11 `f87f71b`＝campus_layout_nav 清單（LAWWW2 的 patch）；候選 12 `a9c2b69`＝flow_soclib 閱覽長桌那一步按鈕出現就停（候選 10 上 14/15，唯一失敗是測試要求停在 0.08 m 內）。都只改測試，遊戲程式和候選 9 相同。備份 `wip_backup/v96-rc12.bundle`（含候選 4～12）。
  - 05:18 重排：TESTING.md 第五節「發布前必跑」全部在候選 12 上跑——Node 全部 → deploy_check → zone_transitions → minimap_direction → save_compat_v7 → p0_movement → touch_flow_wenzhou → reachability_all → flow_class_real → campus_layout_nav → joystick_direction → flow_classes → flow_main_day12 → flow_linze_floors → flow_teaching_buildings → flow_soclib，其他回歸排後面。
  - 已過（候選 12）：Node 全部（43 秒）、deploy_check、zone_transitions、minimap_direction、save_compat_v7；候選 10：campus_glb_integration（校門 draw call 1.097 倍）。
  - 執行器 `bguqrhkph` 04:59 起，**06:59 前要換**（提醒 06:15：趁 flow_classes 跑完換）。發布腳本：`scratchpad/finish_release.py`、`collect_results.py`（已乾跑）；merge 回開發分支已在 `scratchpad/wt_merge` 用候選 12 試過（衝突全取開發分支，單元測試全過，rerere 記住了）。
- **開發分支新增（不在 v9.6）**：
  - `28007ae`：聖誕交換禮物加明軒的三色螢光筆（BB_95 3-6b）、「又被以安沒收」只給中秋看過的玩家（AA）、明軒抽到祐廷的禮物時不寫「明軒抽到小語的玩偶」。
  - `4b6cb10`：颱風假（交付清單 B3）：大一上第 7 週週一 10/13 停課、整天下雨；T1b 前一晚張教授的信＋麵店團群組；T1a 宿舍的泡麵之夜。
  - `f231eba`：BB 的回覆——T1a 接上生活 CG BCG-18（BB ART_APPROVED；沒見過方奕廷不放）、T1b 前一晚 20:30 新聞通知、明軒的螢光筆放在房間。
  - 全部只跑了 Node 單元測試（65 個全過），瀏覽器還沒看。
- **等別人**：AA——颱風假放週一可以嗎（DELIVERED）、A20 旁白、A15「（不說話）」選項；BB——杜可昕參考圖；LAWWW2——共同教學館、大一女舍合併材質（v9.7 再上）。
- **下一步**：跑完必跑 → 快轉 main 到候選 12（或之後的候選）→ 確認 Pages 部署 → merge 回開發分支 → RELEASES.md／CLAUDE.md → 回報使用者 → 開發分支的瀏覽器回歸（`scratchpad/q_dev_after_release.txt`）＋給 BB 的截圖。

**2026-10-14 05:02 UTC（開發分支最新 `a15c636`；線上 v9.5＝`a4f2760`，main 沒動；v9.6 候選 10 `2f138a5` 在跑發布回歸——使用者 04:48 要兩小時內看到 v9.6）**：
- **v9.6 發布回歸**：候選都是本機分支，備份在 `wip_backup/v96-rc10.bundle`（含候選 4～10，前置 `5f66b67`）。
  - 候選 8 `6c2d6e9`：只改測試——flow_classes（HUD 等它出現、教授下課走到門口、C 段改成共同 102 大一英文、D 段只查 C 段、手機分頁等換過去）＋flow_soclib（看不到「坐下讀書」再往椅子走一步）。
  - 候選 9 `781e292`：共同教學館、大一女舍的正式外觀先不放（校門鏡頭 draw call 1.138 倍＞1.1 倍；src/assets3d.js 拿掉兩行）＋campus_glb_integration 外框比對修正。
  - 候選 10 `2f138a5`：flow_soclib 窗邊座位照玩家走（按鈕出現就停；候選 8 那一輪點了 91 次到時間用完，按鈕早就出現）。
  - 佇列（`scratchpad/q`，執行器 `bguqrhkph` 04:59 起，**06:59 前要換**，提醒 06:40）：campus_glb_integration → flow_soclib → flow_classes → deploy_check → save_compat_v7 → p0_movement → minimap_direction → zone_transitions → touch_flow_wenzhou → reachability_all → campus_layout_nav → flow_teaching_buildings → 其他。
  - 發布後 merge 回開發分支已在 `scratchpad/wt_merge` 試過（7 個衝突檔全取開發分支的版本；開發分支保留兩棟正式外觀；單元測試全過）。發布紀錄草稿 `scratchpad/rel_v96_entry.md`。
- **開發分支新增（不在 v9.6）**：大一上 v1 第 10 批——`aa243db` A20 聖誕交換禮物、`243fd79` 可昕 K4 視訊讀書＋12/3 生日（手機回覆期限、出遊 beforeOuting）、`c5c228f` 可昕 K2 第一次來台大；A18 確認已在討論型課堂（憲法第 11 週）。tests/v1_batch10_unit.js 55 項全過，瀏覽器沒看。已告訴 AA、BB（DELIVERED）。
- **已知問題（開發分支修）**：社科院北側長桌的站位 0.9 m（按鈕 0.8 m）、點椅子會走到別張椅子；共同教學館、大一女舍的模型材質太多（已請 LAWWW2 合併，DELIVERED，等 ACK）。

**2026-10-14 04:16 UTC（開發分支最新 `bc02c5d`；線上 v9.5＝`a4f2760`，main 沒動；v9.6 候選 7 `e2c4f10` 在跑發布回歸）**：
- **v9.6 發布回歸**：候選都是本機分支（備份 `wip_backup/v96-rc7.bundle`）。
  - 候選 4 `1c62e0a`＝7223e75 課堂法律內容閘門＋playlib 跨樓層。
  - 候選 5 `709eb53`＝playlib 點擊前捲動。
  - 候選 6 `83ff81b`＝flow_teaching_buildings 用本體判斷。
  - 候選 7 `e2c4f10`＝生活費改成企劃的遊戲數值，遊戲程式只差金額。
  - 已過：flow_class_real、flow_boya_interior、flow_course_choice、flow_teaching_buildings。佇列在 `scratchpad/q`，04:13 起 hold，flow_soclib 跑完就換新的執行器；剩 29 項。
  - campus_layout_nav、campus_glb_integration 在乾淨版就失敗（LAWWW2 查過：測試清單沒跟上大一女舍），已請 LAWWW2 做只改 tests/ 的 patch。
- **開發分支新增（不在 v9.6）**：
  - `6d6387e`：生活費改成虛構的遊戲數值（每月 30,000，AA_72 5b-1；已回 AA）。
  - 第 9 批 `74741c4`、`06e94eb`、`cd9afb8`、`456a7c4`：AA、BB 10-14 的答案，包括改字、通識群組回覆、Kevin 四支影片、麵店團「沒來才揪」、A13、A15 宵夜、A16 翰 1、A17，以及課表重新匯入（照 BB_115 一週一週開，514/706）。
  - `37427dd`：CG-1 第二版。
  - `40f1d63`：merge LAWWW2＋醉月湖／行道樹／球場博覽會備用／芷若眼鏡 patch，阿哲、芯慈 Blender VRM 只在 ?blchar。
  - `bc02c5d`：總圖 3F 正式模型。
  - 全部只跑了 Node 單元測試，瀏覽器還沒看。
- **等別人**：
  - AA：A15「（不說話）」選項、條列改成的旁白字句、A20 聖誕的內容、以安「你的聯絡方式給我」那句。
  - BB：杜可昕的參考圖、K4 視訊、生日。
  - LAWWW2：ACK、測試 patch。
- **下一步**：
  1. 重啟執行器，跑完 v9.6 回歸；全過就快轉 main（第一次發布 v9.6，離 v9.5 已超過 3 小時）。
  2. merge main 回開發分支，整理 playlib 和課表閘門的重複部分。
  3. 開發分支的瀏覽器回歸，加上給 BB 的人物與 CG 截圖。

**2026-10-14 01:15 UTC（開發分支最新 `b5b9b10`；線上 v9.5＝`a4f2760`，main 沒動；v9.6 候選 3 `a6c3d1a` 還在跑發布回歸）**：
- **v9.6 發布回歸**：`flow_class_real`、`flow_main_day12`、`flow_playtest_fixes` 的 D 段（追人 rounds=30）通過；`flow_playtest_fixes` 的 A、B、C、E 段之前已過，最後還會整個重跑一次（`flow_playtest_fixes_full`）。
  - `flow_course_choice` 失敗＝測試取樣問題：打字機效果打到一半時取樣，拿到「選課結果出來」（少了「了」），下一次取樣已經是下一句。遊戲有說那句話、也問了要不要修。`e9b6042` 改成讀整句（`GAME.D.full`），判斷標準不變；發布用的那一份在 `scratchpad/reltests/`，重跑中。
  - 佇列執行器 `bxzf27ji9` 00:00:45 起、2 小時上限：**02:00 UTC 前要照 hold 程序重啟**。
- **開發分支新增（不在 v9.6）**：`b5b9b10` 博雅大廳的自習雙人桌、圓桌、椅子換成 LAWWW2 的正式家具模組（第 23 節；InstancedMesh；椅子垂直放大 1.068，椅面對齊遊戲坐姿的 0.485 m；載入前、失敗用程序化備用；座位、導航不變）；101／102 替身面前的桌上小物（第 27 節，照姿勢配）；階梯教室長桌桌面 0.77 → 0.75 m。`tests/desk_furniture_unit.js`（修改前 B、C、D 失敗）＋相關 9 個單元測試全過。**瀏覽器畫面還沒看**（v9.6 回歸跑完再拍）。講堂椅等 R2 配置（使用者：保留 R2、不要沒測試就放大整棟；先等 LAWWW2 的官方平面圖比對）。已通知 LAWWW2（DELIVERED）。

**2026-10-14 00:40 UTC（開發分支最新 `b023dbd`；線上 v9.5＝`a4f2760`，main 沒動；v9.6 候選 3 `a6c3d1a` 還在跑發布回歸）**：
- **使用者 10-14 的十一項正式決定（D59–D67，`6e5b97a`）照做中**。這一輪在開發分支完成（都**不在 v9.6**、都還沒發布）：
  - `de2a31e`：以安三項＋祐廷第二天「為什麼念法律」照 AA 版本（D60）。`tests/day2_whylaw_unit.js` 90 項（修改前只過 13 項）。順手拿掉舊回答「家裡希望我念」的追問（已告訴 AA，等確認）。commit 訊息寫「D60、D62」是筆誤，應為 D60。
  - `eeb36f9`：阿凱轉述吉他社的台詞照 AA_110（`f99f664` 其實只改了目標，這句沒改到；已向 AA 更正）。
  - `850d941`：辜振甫圖書館開放時間（D62，週六、週日分開；門擋、閉館廣播、請離館）。`calendar_hours_unit` 加 13 項、新 `soclib_hours_unit` 10 項。
  - `2db3da2`：舊存檔女主角初遇修正照 D61 的六個條件補強（先備份到這個存檔專用的 key、備份失敗就不改；連同 met_ 旗標；資料壞掉不丟例外）。`tests/save_firstmet_unit.js` 36 項。瀏覽器版 `save_firstmet_migration.py` 已更新、還沒跑。
  - `b023dbd`：D66——開發分支的檔案不再引用舊企劃分支的 commit 編號（改成新企劃分支的路徑；課程大綱重新匯入，內容逐項比對完全相同）。**舊分支的 commit 在 GitHub 用編號仍讀得到（10-14 實測）**；歷史與舊 commit 訊息裡的編號不改寫歷史拿不掉——處理方案（請 GitHub 支援清掉沒有分支引用的 commit）已私下給使用者，repo 裡不列編號。main 現在有 6 處、候選 3 有 16 處舊編號（候選 3 是清理前做的），v9.7 會帶上清理。
- **v9.6 發布回歸**：`flow_playtest_fixes` 改用「遠的時候先滑鏡頭再點遠處」追人（SwiftShader 每秒約 1 格，原本一直用走的追不上；判斷標準不變），A 段全部通過（追到、她先開口、12:00 往出口走、走了 40.7 m 才離開），B 段跑中。佇列執行器 `bxzf27ji9` 00:00 起，**02:00 UTC 前要照 hold 程序重啟**。
- **雙 AI 通訊**（都 DELIVERED、等 ACK）：AA（commit、測試、三件待決定：走路途中存的舊檔、舊備註顯示、郭沛珊事件的「分數到了」）；LAWWW2（ACK 交付、球場採位置 A、D59 分工、博雅官方平面圖差異表、佇列）；BB（D59 已寫進規則、請給 21 位通過清單、CG 直式做法）。

**2026-10-13 23:58 UTC（開發分支最新 `96ff42d`；線上 v9.5＝`a4f2760`，main 沒動；v9.6 候選 3 `a6c3d1a` 還在跑發布回歸）**：
- **v9.6 發布回歸（候選 3）**：`flow_class_real`、`flow_main_day12` 通過；`flow_playtest_fixes` 的 A 段（林芷若：走近時停下、出現「說話」）失敗。
  - 原因是測試工具：林芷若出現的位置照路線隨機挑（三次分別在 15 m、69 m、98 m 外），`go_to` 在人物還在走上一條路線時不會重新點，一直走向她最早的位置；12:00 她時段結束，開始走向出口。`c772bab` 也是同樣失敗。
  - 改法：`chase` 每 15 秒看她現在在哪、直接點那裡（`58b5a6b`，判斷標準不變）。發布用的那一份在 `scratchpad/reltests/`（候選 3 的測試＋這個修正＋開發分支的 playlib），排在佇列第一（`flow_playtest_fixes_fix2`）。
  - 如果 98 m 外 14 分鐘內還是追不到，下一步：讀檔時間改早（11:30），給追人和對話足夠的遊戲時間；判斷標準不變。
  - 佇列執行器 `blfw0wgp6` 23:08 起、2 小時上限：**01:08 UTC 前要照 hold 程序重啟**（queue.txt → queue.hold，等目前這項跑完，TaskStop，新的 run_q.sh，放回）。
- **開發分支新增（不在 v9.6）**：
  - 騎腳踏車：`2f5a751`（玩家上下車、停車、換區域、存檔、rideIK）、`88c9cdc`（路人騎士改用同一套，預設仍關，?riders 才出現）、`96ff42d`（小地圖／大地圖的腳踏車綠點）。Node：`tests/bike_unit.js` 31 項、`tests/ride_pose_unit.js`（六位主要人物）全過；**瀏覽器畫面還沒看**。
  - merge LAWWW2 `8187dbc`（`451f061`）：桌上小物 desk_props.glb（還沒接）、坐姿替身腿的修正。
- **等使用者**：以安三項＋第二天「為什麼念法律」整組換新（AA 389b8d1 寫使用者批准、已交 LAWWW；主要人物設定要使用者直接確認——「不再用書記官」使用者已直接說過）。
- **使用者 10-14 早上兩則訊息開頭寫給 BB、AA，送到 LAWWW 的視窗**：角色美術驗收交給 BB（可以標 ART_APPROVED）——改 CLAUDE.md／交接文件的規則被權限系統擋下、沒有改；已請使用者在 BB 的視窗直接說。AA_120 的細節：開發分支 `96c0e73` 已經照 AA 第 7 節的修正版（大部分和使用者的細節一致），報告已給使用者。
- 企劃分支改名：`claude/story-planning`（舊的 `claude/bb-story-planning` 已不在遠端）。

**2026-10-13 22:50 UTC（開發分支最新 `775dfc6`；線上 v9.5＝`a4f2760`，main 沒動）**：
- **v9.6 候選版換成第三個 `a6c3d1a`**（在 `scratchpad/wt_rel`，備份 `wip_backup/v96-rc3.bundle`；開發分支同一個修正 `2a7c611`）。
  - 候選 2 的 `flow_class_real` 第二次失敗。用瀏覽器逐格記錄（`scratchpad/diag/diag_class_exit.py`）找到原因：
    - 第二天的劇情課期間，玩家一直在劇情裡，作息補人沒有跑。
    - 15:11 下課後一補，同學在座位上憑空出現；15:12 時段結束，起身走向唯一的後門，和玩家同時到。
  - 改法：要離開的人不擋出口按鈕；補人時，時段剩不到 15 分鐘的不補。
  - 「開始以後很久才補人＝座位上憑空出現」（v9.5 就有）留在開發分支另外修。
  - 回歸 37 項從頭跑（22:48 UTC 起，`flow_class_real` 第一）。
- **`flow_linze_floors`** 在 v9.5 和候選 `5f66b67` 都在同一步失敗：停在座位旁 0.67 m，「坐下」沒出現。原因是測試點到的地面偏了，遊戲沒錯。`5bcd40d` 修了 `playlib.go_to`（停得不夠近用搖桿推一下），候選 3 的回歸用開發分支的測試工具跑這一項。
- **整合 LAWWW2 `c15a648`**（`046dc50`）：博雅窗外景接上。坐姿替身、門模組、新社科院外觀的檔案也一起帶進來，但還沒接進遊戲。
- `449cc4a`：新瀏覽器測試 `flow_first_meet.py`（還沒跑）。`4ee94d8`：「在她附近」的開放空間（spaceAt）。
- v9.6 發布紀錄的草稿在 `scratchpad/rel_v96_entry.md`（發布後寫進 RELEASES.md）。

**2026-10-13 22:25 UTC（開發分支最新 `f99f664`；線上 v9.5＝`a4f2760`，main 沒動）**：
- **v9.6 候選版換成 `93877e9`**（＝`5f66b67`＋docs-only `f9b9017`＋互動按鈕修正）。在 `scratchpad/wt_rel`，還沒 push 到任何遠端分支；開發分支有同一個修正 `0bd4333`。
  - 起因：發布回歸 `flow_class_real` 在 `5f66b67` 失敗。下課時同學停在後門旁邊，「離開教室」被「和郭沛珊說話」蓋掉。
  - 原因：`a77f1f9` 讓走路的人在玩家走近時停下，加上 `E.nearestInteractable` 原本讓人對所有互動點先讓 0.5 m。
  - 改法：人只優先於旁邊的椅子，門口、出口照距離。新測試 `tests/interact_priority_unit.js`，改之前會失敗。
  - 在 `93877e9` 上：44 個 Node 檢查全過（`scratchpad/q/rc_node2.txt`）。
  - 瀏覽器回歸 37 項從頭重跑：`q/FF` 快轉 wt_dev，`flow_class_real` 排第一，之前在 `5f66b67` 過的 9 項排在最後。
  - `flow_linze_floors` 在舊版 `5f66b67` 失敗了一項（走到第 2 排座位時還在走、沒出現「坐下」）。那時我同時在跑 Node 測試，可能是搶 CPU；新版會重跑，結果再看。
  - 全部通過才 fast-forward 到 main。
- **AA 回報的初遇問題已修（`f99f664`，開發分支，不在 v9.6）**：
  - P1-1：還沒認識的女主角，搭話不算認識（不加熟悉度、不揭露名字）。
  - P1-2：傅鐘事件要先認識芷若。
  - P1-3：芷若週五 12:10–12:40 在普通 101 門口的走廊（新作息 `linger`，起身走過去，不瞬移）。「在她附近」的自動事件要同一層、同一空間。
  - P2：阿凱的目標寫第 5 週起、多功能教室。沒有社課的日子，門口寫社課時間。
  - 已回覆 AA（DELIVERED）。瀏覽器初遇流程排在發布回歸之後。
- 以下 22:00 的項目照舊。

**2026-10-13 22:00 UTC（開發分支最新 `5ebb19e`；線上 v9.5＝`a4f2760`，main 沒動）**：
- **v9.6 發布進行中**（使用者 10-13「有可以先玩的可以先放進遊戲發布」）：
  - 候選版 `5f66b67`＝開發分支 `1847ed5`＋標題畫面「版本 v9.6（2026-10-14）」＋script 版本號 9.6-1。
  - 不含 `1e8b90f` 以後的東西：睡覺與小睡改版、課堂討論、社團、AA_120 第 7 節。
  - 乾淨 checkout（`scratchpad/wt_dev`，port 8768）跑發布前回歸（27 項）。目前通過：
    - deploy_check、p0_movement、joystick_direction、save_compat_v7（v7 server：`scratchpad/wt_v7` port 8791）
    - save_compat_v95：`1539797` 修測試等待時間，不是遊戲的問題
    - zone_transitions
  - touch_flow_wenzhou 在跑。
  - 佇列執行器到 2 小時會被停，停了就把那一項重排、再啟動 `run_q.sh`。
  - 全部通過後：合併到 main（不 force）＋docs-only 的 `5ebb19e` 一起進去（拿掉 D56 一句不屬於遊戲設定的話）→ 確認 Pages 部署 → RELEASES.md。
- **開發分支新增（不在 v9.6；Node 測試全過、瀏覽器還沒跑）**：
  - `6ba24c2`：BB 課程大綱（企劃分支 `claude/story-planning` 的 `docs/story_planning/syllabus/`）、討論型 B 課堂（AA_119：看法、同學回應、教授收尾、記錄、回想、理解）、翹課的群組轉述（`discuss_unit`）。
  - `e3e5811`：社團（AA_110 6-8）。吉他社、法服讀書會在萬才館門口參加；社團博覽會在椰林大道的公告欄；系籃在體育館門口；社課旁白（`clubs_aa110_unit`）。
  - `96c0e73`：AA_120 第 7 節。五處改字、20 位不熟同學 60 句、年級跟著遊戲、學長姊畢業、舊存檔女主角初遇遷移（先備份）（`aa120_s7_unit`）。
  - `5ebb19e`：決策 D57（公開文件標示與隱私）、D58（以安新版，AA 轉述）。
- **等使用者**：
  - 以安三處要不要改（母親法官：ev_an_mother、第二天三句、家庭欄；D50 第③級）。
  - 舊存檔初遇遷移要不要放進正式版。
  - Git 歷史裡 D56 舊寫法的處理方式（不擅自重寫歷史）。
  - 方案 A（已預設放進 v9.6，除非使用者說不要）。
  - 其他之前的待決定事項（社科院位置、黃昏調色、博雅平面圖）。
- **等其他 AI**：AA 核對 AA_120 第 7 節、社團回報；LAWWW2 重拍鏡頭案例、坐姿替身＋門模組（`167fc2d`）等第三階段一起接。

**2026-10-13 21:05 UTC（開發分支最新 `a77f1f9`；線上 v9.5＝`a4f2760`，main 沒動；以下都是 WIP、不可發布）**：
- **第一階段（使用者經 LAWWW2 轉達：鏡頭穿牆是最優先的共用技術問題）**：
  - `068f671` 室內鏡頭：貼牆時自動轉開（autoSwing）、往前看、抬高變少；公告欄加進鏡頭碰撞。`teach_cam_walls_unit` 重現 LAWWW2 的 10 個案例（數字一樣），修改前 14 項失敗、修改後全過。瀏覽器截圖 `tools/shots/cam_swing_shots.py` 在佇列。
  - `8234015`＋`a77f1f9` 座位上的人先套好坐姿再畫（E.prePose：addNPC、sitAt、spawnNPC、換正式模型）。新瀏覽器測試 `flow_seated_spawn.py`（包住 E.render，每一幀檢查；進教室、演講開始、讀檔、跳時間）——佇列先在舊版跑（要失敗）、再在新版跑。
  - 已請 LAWWW2 在相同位置重拍（DELIVERED，等 ACK）。
- **使用者試玩修正（續）**：
  - `c772bab` 第一次見面的兩個錯（事件引擎先記 FIRST_MET；女主角沒見過時被一般自我介紹搶走）＋手機分頁橫向會捲走。
  - `0d7d7f4` 閒聊條件照 AA_120（只加條件、不改字）；不熟同學資料修正。
  - `a77f1f9` 走走的人玩家走近 2.8 m 就停下來（追著按「說話」很難）；`flow_playtest_fixes` 上一輪失敗是測試等太短（SwiftShader 0.5–1 fps），已改。
- **佇列（`scratchpad/q/queue.txt`，不在 GitHub）**：flow_seated_spawn（舊版）→ 快轉 `a77f1f9` → flow_seated_spawn → cam_swing_shots → indoor_camera_occlusion → flow_playtest_fixes → flow_invite_phone → save_compat_v95 → flow_course_choice → 其他回歸（main_day12、classes、soclib、teaching_buildings、study_legal、campus_glb、campus_layout_nav、zone_transitions、see_through、p0、touch_flow_wenzhou、minimap、class_real、reachability_all、boya_interior）。
- **接下來**：佇列結果逐項看、修；LAWWW2 重拍結果；AA_110 第 6 節（#99）、BB syllabus（#100）；v9.6 要等使用者確認方案 A＋完整回歸。
- **等待**：使用者（方案 A、社科院位置與圖書館時間、黃昏調色、博雅官方平面圖、LAWWW2 轉達的決定請使用者確認）；LAWWW2 ACK。

**2026-10-13 20:00 UTC（開發分支最新 `439de48`；線上 v9.5＝`a4f2760`，main 沒動）**：
- **使用者試玩回報的修正**（單元測試過；瀏覽器流程 `flow_playtest_fixes.py` 在佇列）：
  - `6bd4072` 閒聊看情境、不重複：高子晴三句要吉他社之後；B 層同學改旁白。
  - `2e964bb` 林芷若時段結束先走到出口才離開。
  - `c829d1d` 跟著人走時被牆擋住改找路。
  - `566f60c` 小睡。
  - `3ed2286`「帶我去」找朋友。
- **ChatGPT 審查**：
  - `cd11ae7` **選課結果**（AA_104 第 2 節原本沒做）：開學前一天早上選選修，大一下的法律與社會可以不修；`course_select_unit` 17 項。
  - `cd11ae7` 五年日曆評估第二版（`docs/TIMELINE_COMPAT_AUDIT.md`：6 處程式＋6 個事件的風險、遷移步驟；沒改程式）。
  - `6ffafc0` 連續多週模擬（173 天）、缺席條件；`docs/TESTING.md` 第九節（模擬／瀏覽器／iPhone 對照、多週瀏覽器方案）。
  - `439de48` 方案 A 驗收資料（`docs/campus/TEACHING_BUILDINGS_PLAN.md` 第 6 節：導航資料畫的俯視圖、影響範圍、路線、替代方案 A～E、舊湖邊存檔）。
  - 新的瀏覽器測試：`flow_course_choice.py`、`save_compat_v95.py`（要 v9.5 的 server：`scratchpad/wt_main` port 8769）。
  - `b5518b8` 社科院圖書館招牌寫「辜先生紀念圖書館」。
- **瀏覽器測試改成佇列**：
  - 腳本 `scratchpad/run_q.sh`；佇列 `scratchpad/q/queue.txt`，結果 `scratchpad/q/Q.txt`；`q/FF` 寫 commit＝下一個測試前快轉 `wt_dev`。這些都不在 GitHub。
  - 批次 3 停掉了（跑的是少了試玩修正的舊版）。批次 3 跑完的：flow_lecture_attend、indoor_camera_occlusion **ALL PASS**；flow_soclib 在舊版失敗（座位停止距離，`6bd4072` 已改測試）。
  - 佇列結果：flow_invite_phone 在 `cd11ae7` 失敗＝**測試按錯按鈕**（「等到晚上」的值是 `20.000`），`4806aeb` 修好、重排。
  - 還在跑：flow_boya_interior → flow_invite_phone → flow_course_choice → flow_playtest_fixes → save_compat_v95。
- **接下來**：
  1. 佇列結果。
  2. 剩下的回歸：soclib、campus_glb、see_through、campus_layout_nav、teaching_buildings、study_legal、zone_transitions、p0、touch_flow_wenzhou、reachability_all。
  3. 看板 55fbedb ACTIONED、通知 LAWWW2。
  4. 回報使用者方案 A 的驗收資料。
  5. v9.6 準備：版本號、完整回歸；方案 A 要使用者先確認。
- **等待**：
  - 使用者：方案 A、社科院斜對面、社科院圖書館開放時間。
  - AA：每週必修、閒聊條件。
  - LAWWW2：ACK。

**2026-10-13 19:05 UTC（開發分支最新 `6b0e711`；線上 v9.5＝`a4f2760`）**：
- **開發分支新增**（都是 WIP，不可發布；方案 A、社科院等使用者驗收）：
  - `b6fffb1` 手機訊息與邀約（D54 ⑥，一般系統；人物的個性、台詞等 AA、BB 的內容批准後才放）；`dae1da3` 新測試 flow_invite_phone。
  - `4e2db1f` 博雅一樓自習區第二版：雙人小桌兩列 × 六張（面對面，24 席）、圓桌兩張、南面窗下沙發（LAWWW2 審查 c5e2170 第 3 節；審查提案的 16 張要等大廳改版）；
    seatApproach 的遠備用位置（前 0.8、後 0.9）要路短 0.5 m 以上才選。
  - `cffc97e` playlib：**批次 1、2 的博雅「卡死」查明是測試誤點**——點地面時點到左上角的「下一堂課」（點了打開手機、遊戲暫停；批次 1 的截圖就是開著的手機）。
    現在點之前檢查那一點和四周 14 px 都是遊戲畫面；走路途中發現手機／選單／地圖開著就關掉並記下。瀏覽器同一條路線 700 秒沒有停住（每秒約 2.3 格）。
  - `6b0e711` 邀約：一起做過的事（一起吃過飯、散步過）算關係夠；**第一、二天劇情加的關係（舊版 G.rel）原本沒進 SOCIAL**（阿哲 +7、小安約 +16 不見了）——
    現在 GM.rel 兩邊一起加，舊存檔讀檔時補一次（`_relSync`）。新測試 social_rel_sync_unit（修改前 6 項失敗）。
  - node 單元測試 29 個全過。
- **瀏覽器批次 2**（`29c54cd`＋`d617ad1`）跑到 campus_glb_integration 就停了（剩下的改在批次 3 用最新的程式跑）：
  - campus_glb_integration：實質檢查（導航格、鏡頭碰撞、互動點、效能、陰影、窗）全過；失敗的 4 項是測試的 TAGS 沒有共同、大一女舍（`4e2db1f` 補上）。
  - flow_boya_interior：201 的「坐下」沒出現（seatApproach 選到椅子後面 0.9 m）＋誤點手機；flow_soclib、flow_lecture_attend 是已經修好的舊問題。
- **瀏覽器批次 3 正在跑**（工作樹 `scratchpad/wt_dev`，port 8768；腳本 `scratchpad/run_b3.sh`，結果 `scratchpad/b3/B3.txt`，不在 GitHub）：
  前兩項（flow_invite_phone、flow_boya_interior）是 `cffc97e`，之後的是 `6b0e711`。flow_invite_phone 在 `cffc97e` 失敗（阿哲說還不太熟）＝`6b0e711` 修的問題，批次 3 跑完要重跑。
  批次跑的時候不要改 `wt_dev`（伺服器直接讀工作樹）；要改的在 `scratchpad/wt_next`（分支 int/next）。
- **接下來**：批次 3 結果 → 重跑 flow_invite_phone → 看板 55fbedb 標 ACTIONED、通知 LAWWW2（博雅自習區第二版的桌椅位置也要告訴它：它在做桌椅模組）；
  查「聽眾剛出現時站著」（瀏覽器）；博雅大廳新舊截圖給使用者；v9.6 發布前：script 版本號、完整回歸、方案 A 與社科院要使用者先驗收。
- **等待**：使用者（方案 A／B、社科院斜對面、社科院圖書館開放時間）；LAWWW2（社科院新外觀進行中；18:0xZ 的 a–d 回覆等 ACK）。

**2026-10-13 18:25 UTC（開發分支最新 `77deeab`；線上 v9.5＝`a4f2760`）**：
- **開發分支新增**（都是 WIP，不可發布；方案 A、社科院等使用者驗收）：
  - `defd65c` AA_110 第 5 節一般系統：出席三態（聽完／中途離開／沒去，`src/game3d.js` 的 actTrack＋`ACTIVITIES.track`）、人物在場四級（npcZone／npcRoom／npcPresent／npcNear）、習慣記憶（`EVENTS.habit`、G.habits）；
    55fbedb（共同、大一女舍外觀）的接線也在這裡（c747b45、f3a18d6）。
  - `29c54cd` 一週兩格的第二格（BB second_slot_lines）與國定假日、人物作息「一個時間只有一筆」（story3d.js 的 schedEnt）、2025 年入學這一屆 presence from Y1S1、芷若大一上的週五。
  - `d617ad1` BB 的課堂內容（`docs/story_planning/syllabus/`）、經原（下）改總體經濟（AA）；`8c2fa01`、`b6fa24e` 教學館鏡頭不再跑到隔間牆後面＋入口門框淡出（LAWWW2 審查 P1）；
    `5aaa306` 教學館桌椅合併（網格數博雅 623→176）；`77deeab` 社科院天窗調暗兩次的 bug。
  - 單元測試 28 個全部通過（新的：aa110_systems_unit、teach_cam_walls_unit、teach_perf_unit）。
- **瀏覽器批次 2**（整合工作樹 `scratchpad/wt_int`＝`29c54cd`＋`d617ad1`，port 8767；腳本 `scratchpad/run_b2.sh`、結果 `scratchpad/b2/B2.txt`，不在 GitHub）：
  - flow_soclib：上一版的兩個失敗（手機清單沒滑、手機開著遊戲暫停）修好通過；新失敗是測試停的位置差 2 cm 在互動半徑外——已改用 GAME.seatApproach（`77deeab`，要重跑）。
  - flow_lecture_attend：第一次是測試本身的 Python 格式字串錯（已修，要重跑）。
  - 其他還在跑：博雅、校園 GLB（55fbedb）、see_through、campus_layout_nav、教學館、讀書、zone_transitions、p0、reachability。
  - 批次 1 的博雅流程卡在 101 門口（時間停了），在乾淨環境重現不出來；批次 2 重跑看看。
- **接下來**：批次 2 結果 → 對 `77deeab` 跑批次 3（flow_soclib、flow_lecture_attend、indoor_camera_occlusion 的教學館五個情境、看博雅畫面）→ 看板把 55fbedb 標 ACTIONED、通知 LAWWW2；
  查 LAWWW2 說的「聽眾剛出現時站著」（它的 probe 讀的是骨架，可能包含畫面外沒更新的人，要在瀏覽器確認）；之後：手機訊息與邀約（D54 ⑥）。
- **等待**：使用者（方案 A／B、社科院斜對面、社科院圖書館開放時間）；LAWWW2（社科院新外觀；18:0xZ 的 a–d 回覆等 ACK）。

**2026-10-13 17:35 UTC（開發分支最新 `4eb34ce`；線上 v9.5＝`a4f2760`）**：
- **v9.5 已發布**：
  - main 快轉到 `a4f2760`，GitHub Pages #14 在 16:54:06 UTC success。
  - 下一次發布最早 19:54:06 UTC。
  - 發布紀錄在 `docs/RELEASES.md`。
- **開發分支新增**（都是 WIP，瀏覽器回歸還沒跑完，不可發布）：
  - LAWWW2 五批合併進來：法圖正式模型、⑤⑥、⑬、⑭ 118 巷素材、⑫ 腳踏車素材。
  - 社科院第①步 `0e08733`：新區域 soclib（`src/soclib3d.js`），校園社科院正面有門。開放時間沒查證，門不擋。
  - 程式審查 16 項的修正：每項都有修改前失敗的測試。
  - 方案 A 的前後比較：VISUAL_REVIEW 第 23 節，已給使用者，**等使用者決定 A／B**。
  - BB 課表內容重新匯入、特殊課堂週次對齊、活動四個時段（`4eb34ce`）。
- **瀏覽器批次 1 跑到一半**：腳本 `scratchpad/run_b1.sh`，結果寫在 `scratchpad/b1/B1.txt`，不在 GitHub，**中斷了要重跑**。
  - 社科院窗景已拍好，在主工作樹，還沒 commit。
  - 接下來：flow_soclib、flow_study_legal、flow_boya_interior、flow_teaching_buildings、campus_glb_integration、reachability_all、campus_layout_nav、zone_transitions。
- **接下來**：
  1. 接 LAWWW2 `55fbedb`（共同、大一女舍外觀；接線照它 VISUAL_REVIEW 20.5、21.5）。
  2. AA_110 第 5 節剩下的一般系統（任務 #87）。
  3. 下次發布前：script 版本號改成 9.6-x，跑完整回歸。
- **等待**：
  - 使用者：方案 A／B；社科院斜對面可以嗎（南北對調已告訴 LAWWW2 是遊戲化）；社科院圖書館開放時間。
  - LAWWW2：社科院新外觀開工時回 ACK。
- **注意**：審查第 15 項（寫死的人物生成不看 presence）在填 presence 資料時要一起做，見 `docs/STORY_EVENT_SCHEMA.md`。


**2026-10-13 16:30 UTC 補充（最新 `a8a49e5`）**：
- **v9.5 候選 `a4f2760` 的重跑**：
  - flow_main_day12、guide_flow、flow_linze_floors 在安靜環境重跑**都通過**。
  - flow_library_scene 兩次都失敗，**原因是測試的等待時間，不是遊戲**。除錯紀錄：SwiftShader 在總圖大廳只剩約 1 fps，兩個人要 146 秒實際時間才走到座位；最後都坐在劇情座位、二樓 5.0 m，沒用到走路保險。原本等 120 秒就截止。
  - 測試已改（24e7770）：上限 10 分鐘，判斷標準不變。
  - **還要重跑**：flow_library_scene（新測試、對候選）、movement_regression（A5）。腳本 `scratchpad/run_v95_rerun3.sh`。**全部通過才發布**。
- **開發分支新增**：
  - 課表同步企劃（5fc20ee）：54 門課的代號、BB 的每週課堂內容、舊存檔遷移。
  - 事件介面五種狀況（1f21f67）：旗標的值、演講到場、上課出席、事件層次上限、出錯不重試、坐著上完課同學走出去。
  - 五年日曆＋世界觀定案 D56（24e7770）：經濟系大一 Y0S1、Y0S2。
  - 人物在不在學校的機制（a8a49e5）：資料等 AA 確認。
- **使用者 2026-10-13 世界觀定案（D56）**：現代台大；新社科院在霖澤館對面、從經濟系大一第一天就存在；取消徐州路。
  - 社科院盤點與最小方案寫在 `docs/campus/SOCSCI_PLAN.md`，截圖拍攝中；原地沿用，外觀交給 LAWWW2 做 Blender。
  - 已通知 AA、BB、LAWWW2（DELIVERED）。
- **等待**：
  - 使用者：普通、博雅的方案 A／B；社科院方案。
  - AA：人物出場條件三題、芷若週五行程、修改徐州路設定。
  - LAWWW2：社科院規劃。

**2026-10-13 15:30 UTC 補充（最新 `cb47e3d`）**：
- **v9.5 候選 `a4f2760` 回歸：37 項中 33 項通過、4 項失敗；另外 movement_regression 42 項中 41 項通過**。
  - flow_main_day12 失敗是**測試的競態**：狀態和劇情旗標分兩次讀，讀到「剛進校園、阿哲的劇情還沒開始」那一刻；截圖顯示劇情接著正常開始。已修測試（735c620）。
  - flow_linze_floors、flow_library_scene、guide_flow、movement_regression A5 看起來是 CPU 被搶的時間問題（A5 那時同時在跑 Node 測試）。
  - 在安靜環境下一項一項重跑（腳本 `scratchpad/run_v95_rerun.sh`、`run_v95_rerun2.sh`；結果只在本機）。**全部通過才發布；沒通過就照實回報、不發布**。
- **開發分支新增（單元測試都通過，瀏覽器流程還沒跑）**：
  - 共同教學館：修正牆在導航上擋不住（導航格原點；可以直接穿牆進教室）、共 101 改成階梯教室（735c620）、洗手間門口說明放錯邊（0b957de）。
  - 博雅教學館室內第一版（cb47e3d）：101、102 階梯教室、沙發區、自習小桌、討論桌、講座資訊螢幕、2F 討論教室；**校園上還沒有門**（位置等使用者決定方案 A／B）。
  - 講座人潮：活動資料有 zone、room 的演講會讓大教室坐滿聽眾（測試資料驗證；遊戲裡的活動清單是空的，等 AA、BB）。
- **等待**：使用者（普通、博雅的位置 A／B）；AA（課程地點、日文上下學期、日曆三題）；LAWWW2（共同配置變更、博雅配置的 ACK）。

**2026-10-13 14:42 UTC 補充（最新 `cdfccad`）**：
- 開發分支新增（單元測試都通過，**瀏覽器流程還沒跑**）：
  - 共同教學館室內第一版（`src/teach3d.js`＋`src/data/gongtong_layout.js`：大廳、走廊、四間教室、樓梯、休息區、自習區；課在 101 的 3D 教室上）；
  - 大一女舍（A、B＋天橋、門口長椅、男賓止步）；
  - 門口人流（`src/crowd3d.js`）；
  - 手機「朋友」分頁；
  - 事件介面（room／activity／npcHere）＋活動格式（`src/data/activities.js`，空的）；
  - 自習區、休息區的椅子擋路。
- v9.5 回歸：
  - 32 項通過。
  - **3 項看起來是機器太忙的時間問題**：flow_linze_floors 坐下、flow_library_scene 坐下等不到 120 秒、guide_flow 導航條還沒出現。都要在安靜時單獨重跑。
  - 還沒跑完：flow_main_day12、save_compat 兩項、see_through、tap_floor_levels、movement_regression。

**2026-10-13 14:15 UTC 狀態（LAWWW，帳號 A，`claude/confident-ritchie-8rwh7t`，最新 `e59c1ad` 之後）**：
- **線上**：v9.4.2（main＝`dfd2618`）。**v9.5 候選＝`a4f2760`**（只含到萬才館兩階段、總圖大廳等；**不是**開發分支最新）。回歸在本機跑（結果在 scratchpad，不在 GitHub）：
  - 已通過 29 項：單元測試、deploy_check、model_upgrade、zone_transitions、校園／公館導航、reachability_all、鏡頭遮擋、小地圖、搖桿、p0_movement、touch_flow_wenzhou、flow_class_real、stairs_cam_browser、萬才館兩項。
  - **flow_linze_floors 失敗 1 項**：201 走到第 2 排第 5 個座位旁，人物一直「走路中」、「坐下」晚出現；一分鐘只移動 0.5 m，疑似模擬被拖慢，要安靜時單獨重跑確認，**沒確認前不發布**。
  - 剩下：flow_library_floors、flow_library_scene、guide_flow、levels_no_sky、flow_main_day12、save_compat_v7、save_compat_live、see_through、tap_floor_levels、movement_regression。
- **開發分支（沒發布，WIP）**：法律學院圖書館（D46、D53 開放時間）、日曆、八學期課表（D52）、手機（今天、課表、地點）、快速前往與時間跳轉（D54）、共同教學館與大一女舍（D55，外觀 BLOCKOUT）。單元測試全部通過；**瀏覽器的玩家流程（`tests/flow_classes.py`、`tests/flow_teaching_buildings.py`）還沒跑**。
- **等待**：
  - 使用者：普通、博雅的位置（方案 A／B，`docs/campus/TEACHING_BUILDINGS_PLAN.md`）。
  - AA：課程地點衝突（法律系經濟學原理改普通教學館、日文上下在共同）、日曆三題、經濟系時間線。
  - LAWWW2：三棟＋大一女舍分派的 ACK 與法圖進度。
- **文件**：
  - `docs/campus/TEACHING_BUILDINGS_PLAN.md`：位置查證、方案。
  - `docs/campus/PUBLIC_BUILDINGS_DESIGN.md`：通用系統設計。
  - `docs/TIMELINE_COMPAT_AUDIT.md`：經濟系時間線相容性。
  - D55。


**值班登記（最新）：帳號 A｜LAWWW｜session_01Eds6msqpsuzNEw98sdw8JX｜分支 claude/confident-ritchie-8rwh7t｜接班基準 `cb399ea`｜2026-10-13 UTC｜使用者說「我回來了，請同步 GitHub 最新進度，接續工作。」；交班之後（10-11 10:16 之後）所有遠端分支都沒有新 commit，也沒有帳號 B 的分支——沒有要合併的東西。使用者隨後說明：**帳號 B 這次沒有開**，各職位從上次停下的地方接續。**
**使用者 2026-10-13 測試回報的問題與解法（LAWWW 列給使用者的清單，之後照這個做）**：
- v9.5 已修：導航與教學、入口名牌、開放時間、大地圖、朋友在哪、走路速度與快速前往、室友轉圈、假騎士拿掉、樓梯看到天空／樓板擋人、窗景、店員、吃麵後目標、生活費。
- 待做（v9.6 起）：①主要地點從第一天就能「快速前往」（總圖、霖澤館、萬才館、法圖、宿舍、公館、溫州街、Café；花遊戲時間；關門寫幾點開）＋課表「直接去上課」；②「跳過時間」（到下一堂課前／下午／晚上／明天早上，遇到課、約定、事件會停）＋普通課堂快轉＋沒事的日子一鍵跳過；③手機朋友頁＋大地圖標朋友位置與在做什麼，可觸發事件的人顯示提示（只寫地點時間）；④遊戲內手機：今天、課表、訊息（班群、麵店群、個人）、朋友（邀約：人＋地點＋時間）、地圖——先做外框＋今天＋課表（和課表系統一起），再做訊息與邀約（台詞 AA／BB）；⑤課表系統照 AA_103／AA_104（D52）；⑥人物 bug：陳語彤領口蝴蝶結（要圓領上衣模型）、Blender 新版只在 ?blchar（等使用者看）、人穿過椅子（座位區擋椅子）、店家老闆用學生模型（要中年模型）、路人重複、騎車沒踩踏板、2D 立繪只有一種。
**使用者 2026-10-13：課表交給 AA 規劃，LAWWW 寫進遊戲前先跟 AA 確認（D51）；同一天改成直接執行（D52）：AA 完成八學期課表、交接給 LAWWW，LAWWW 直接做完整課表與每日上課系統（上課／翹課／自學），不用再等使用者批准，完成後回報。**
**使用者 2026-10-13：「劇情部分還要修改，我會再跟 AA 討論，你先做好場景」**——大一上 v1 劇情實作暫緩（D50），LAWWW 先做場景：①v9.5 最終回歸＋發布；②場景（萬才館法律學院圖書館、118 巷、總圖擴充、宿舍走廊、出遊場景）。

**交班（上一次）：帳號 A｜LAWWW｜session_01Eds6msqpsuzNEw98sdw8JX｜2026-10-11 10:13 UTC｜正常交班｜最後 commit＝訊息開頭「LAWWW（帳號 A）交班」的那一個（`git log -1 --grep="LAWWW（帳號 A）交班" origin/claude/confident-ritchie-8rwh7t`）。之後帳號 A 的 LAWWW 不再寫入，直到使用者說「我回來了，請同步 GitHub 最新進度，接續工作。」**
- 交班時停掉的背景工作（結果都只在 LAWWW 的工作階段裡，**不在 GitHub，接班的人要重做**）：①v9.5 最終回歸——對最新 commit 的那一輪還沒開始；舊候選 `01145ae` 的 `release_suite.sh` 全部 PASS（含 save_compat 兩項；當時唯一失敗的 indoor_cam_occlusion 已在 `f68f97a` 修好）；②對 `01145ae..HEAD` 的修改審查（沒有結果）；③接班總入口檢查（沒有結果）；④出遊場景規劃（沒有結果）。
- **LAWWW-B 第一件事**：在最新 commit 的乾淨工作樹（`git worktree add --detach <資料夾> origin/<最新分支>`、在那裡開 `python3 -m http.server`）跑 `tests/release_suite.sh`＋`tests/see_through.py`、`tests/tap_floor_levels.py`、`tests/stairs_cam_browser.py`（新寫、還沒跑過，可能要修）、`tests/movement_regression.py`；有空就重跑修改審查；**全部通過才發布 v9.5**（三小時規則已滿足：上一次發布 07:02:57 UTC）。發布步驟見 `docs/RELEASES.md` v9.5 草稿與 `docs/TESTING.md` 第五節。
- 等待中：LAWWW2 的 ⑤⑥ 交付（它的 `-wip-props6`，合併後回歸還沒跑）；大一上 v1 劇情實作（D50，v9.5 之後）。

值班登記：帳號 A｜LAWWW｜session_01Eds6msqpsuzNEw98sdw8JX｜分支 claude/confident-ritchie-8rwh7t｜接班基準（制度建立時）`13e53b2`｜2026-10-11 09:50 UTC
上一班：還沒換過班。跨帳號接班（帳號 A ⇄ B）的總入口：`docs/AI_SESSION_HANDOFF.md`（D49）。

- **時間**：2026-10-11 10:06 UTC（**緊急保存：使用者週用量 98%**）｜**分支**：`claude/confident-ritchie-8rwh7t`｜**最新**：`git log -1 origin/claude/confident-ritchie-8rwh7t`（這次保存是 `e747724` 之後的文件 commit）。本機工作目錄乾淨，沒有未推送的檔案。
- **線上版本**：v9.4.2（main＝`dfd2618`）。**v9.5 還沒發布**（最早 10:02:57 UTC 起可以，但要先跑完下面的測試）。
- **v9.5 候選＝開發分支最新**（CHECKPOINT_SAVED，不能直接發布）：
  - 單元測試全部 PASS：`node` 跑 `tests/release_suite.sh` 前段的 *_unit（含新的 stairs_cam_slab_unit、schedule_refresh_unit、allowance_unit、guide_unit）。
  - **還沒做**：①在最新 commit 的乾淨工作樹跑完整 `tests/release_suite.sh`（瀏覽器，約 75 分鐘）＋ `tests/see_through.py`、`tests/tap_floor_levels.py`、`tests/movement_regression.py`；②`tests/stairs_cam_browser.py`（新寫，還沒跑過，可能要修）；③審查工作流程（wcxaihpvm，01145ae..HEAD 的修改）的結果——在 LAWWW 的工作階段裡，沒有寫進 GitHub，工作階段停了就要重跑審查；④通過後快轉 main、確認 Pages、更新 RELEASES.md。
  - 舊候選 `01145ae` 的回歸（只當參考）：release_suite 到 flow_main_day12 全部 PASS（indoor_cam_occlusion 失敗已修 `f68f97a`），save_compat 兩項跑到一半——結果在本機 scratchpad，不在 GitHub。
- **本機分支的半成品**（都有 git bundle 在 `wip_backup/`，還原方法見 `wip_backup/README.md`）：宿舍走廊 `wip/dorm-hall`（`bf750b4`，WIP，還沒在瀏覽器實測）；`wip/wancai-stairs`（`8b08c61`，已被開發分支取代，只是備份）。其餘 `wip/*` 本機分支都已包含在開發分支裡。
- **進行中的規劃**（在工作階段裡，沒有寫進 GitHub；停了就重跑）：出遊場景規劃工作流程 w0pqyjodd（v9.5 之後；需求：溫州街散步、公館吃飯街區、校園夜景、河堤，排名＋規格，見對話與 RELEASES 草稿）；接班總入口的檢查 wmo10jb55。
- **等使用者決定**：課表草案的 4 個問題（`docs/proposals/SCHEDULE_PROPOSAL.md`）。
- **已批准、排在 v9.5 之後**：大一上 v1 劇情實作（D50，三級修改權限）；手機＋邀約（#61）、騎腳踏車（#59，LAWWW2 ⑫）、118 巷（#65，配置 `src/data/lane118_layout.js`、LAWWW2 ⑭）、法律學院圖書館（#66，配置 `src/data/lawlib_layout.js`）＋辜先生紀念圖書館（LAWWW2 ⑬）。
- **LAWWW2**（10:05Z 緊急保存要求已送出＋看板）：遠端分支 `claude/second-ai-env-art`（`ae94b8e`）、`-wip-pavsoc`（`8c6f1fe`）、`-wip-props6`（`fa626b9`）、`-wip-trees`（`d7916da`）；進度檔 `docs/art-rebuild/second_ai/HANDOFF.md`（在它的分支）。

## CURRENTLY WORKING ON — 現在正在修改什麼

- **最近更新**：2026-10-11 07:12（UTC）：使用者 07:00 起床、授權先發布做好的東西 → **v9.4.2 已發布**（main 快轉到 `dfd2618`，Pages 07:02:57 UTC；下一次最早 10:02:57 UTC）。v9.5 候選準備中：開發分支 merge ⑧公館機車（`6ff3cbd`）、版本字樣 v9.5／script 9.5-1、release_suite 加萬才館兩個＋總圖兩個真實流程（`e6bae94`）、發布說明草稿（`3c9e02f`）；`6a1db1b` 的完整回歸到 flow_linze_floors 為止 24/24 PASS（兩天主線、存檔相容還在跑）；多代理程式審查（5 個面向＋對抗式驗證）進行中；宿舍走廊（`wip/dorm-hall`）已跟上開發分支（`bf750b4`），排在 v9.5 之後。
- **更早**：2026-10-11 06:35（UTC）：①總圖第一階段（D43，`wip/library-hall`）和 LAWWW2 的④文學院、校史館（`0123fae`）在本機合併進開發分支（`6a1db1b`），完整回歸 06:30Z 開始跑（發布前全套＋總圖、萬才館、校園整合＋movement_regression），**還沒推送**。總圖這一輪的美術修正：植物換掉多面體圓球、窗玻璃不放進牆的淡出群組（原本整片灰）、窗外換成遊戲裡校園的畫面（椰林大道／南側草地，白天晚上）；VISUAL_REVIEW 第 21 節（`14ab47f`，真實流程結果等回歸跑完再填）。②霖澤館、萬才館大廳的盆栽也換成模型葉子（共用 `tools/blender/plants.py`；GLB 已重新匯出、**還沒提交**，回歸跑完要截圖確認）。③任務 #42（室內點地面上樓要點很多次）：現行測試工具的探針量萬才館一樓→二樓門廳，修改前後都是 3 次；之前流程記錄的 14／16 次是舊版測試點法，重現不出來。
- **更早**：2026-10-11 02:55（UTC）：①萬才館第二階段（`e4d7dbb`）完整回歸：發布前全套 25/25、萬才館真實流程與外觀整合、九項環境整合、movement_regression 42/42 全部 PASS；`flow_main_day12` 失敗——**測試過時**（v9.4 起 201 在霖澤館二樓，測試還在等自動進教室），而且它雖然是 TESTING.md 第五節第 6 項，卻不在 `release_suite.sh` 裡（v9.4、v9.4.1、v9.4.2 候選都沒跑），已修正測試（萬才館室內分支 `7fa4366`，對 v9.4.2 候選重跑排隊中）。②LAWWW2 總圖書館（`470d3e8`）整合 `c712250`：校園回歸 PASS（campus_glb_integration 修了「改之前」量太早的時機問題後：校門鏡頭 draw call ×1.029、椰林大道 ×1.058、三角形 −1.1～1.4%）。③點地面修正 `1924db4`：站在萬才館平台上點廣場時落點用 3.63 m 的假平面（差 8.5 m）→ 校園加地面的點擊面；新測試 `tests/tap_floor_levels.py`（修正前 FAIL、修正後 PASS）；`flow_wancai_stairs` 走下大樓梯 7 次點擊／363 秒 → 3 次／232 秒（還有兩次停在樓梯最下面一兩階，查原因中）。④萬才館室內兩層樓（D42）在 `wip/wancai-interior` 製作中（Node 導航測試全部 PASS；Blender 模型、瀏覽器測試還沒跑）。之前：2026-10-10 21:00（UTC）：v9.4.2 發布候選 `dfd2618`（發布前測試執行中，等使用者核准）、起床報告 `docs/WAKEUP_REPORT_2026-10-10.md`、溫書瑀 Blender 製作中、坐姿第二版、LAWWW2 的溫州街減量與宿舍貼牆修正整合；之前：19:55 陳語彤、高子晴 Blender 第一版、坐姿腳修正、LAWWW2 的溫州街近景／便利商店／麵店／書店／宿舍整合；之前：16:45 林芷若 Blender 第一版、兩點半 Café（LAWWW2）整合；之前：2026-10-10（人物改用 Blender 正式製作，示範角色沈以安，見下一節）；之前：2026-10-10（台灣時間，v9.3 第二十四批：法學院區照使用者的配置圖＋萬才館新照片——萬才館正面（弧形量體、陽台、一樓入口、凸窗框、屋頂框架）、國青中心、黑森林＋水池；第二十三批：椰林大道樹冠；第二十二批：柏油路改淺灰）
- **最新已推送 commit**：`c5b9553`（第二十四批：法學院區照使用者的配置圖＋萬才館新照片，回歸測試全部 PASS）；`4b218bf`（第二十三批：椰林大道兩側樹冠加密）；`e77d607`（第二十二批：所有柏油路改淺灰、入夜變暗）；`5b1810c`（第二十一批：太陽方向、萬才館大台階、椰林大道路面，回歸測試全部 PASS；程式在 `3364a29`）；之前是 `7eae65a`（第十七～二十批的測試結果與比較圖、腳踏車減面、場景切換測試；全部 PASS，見下面「測試結果」）；第十七～二十批的程式依序在 `92d6890`、`26ea996`、`1210644`、`5a218d5`、`3b2a8f9`、`8ba30a1`、`2e3ad72`（標 WIP 的是當時還沒跑完測試的中間版本）；之前是 `f4b9149`（第十六批：傅鐘、路燈；程式 `c9cb9d8`＋`ab8daee`、比較圖 `b3125d6`、測試結果 `f4b9149`，全部 PASS）；之前是 `08ec0a0`（第十五批：室內天花板、窗、便利商店貨架、宿舍；movement_regression 第一次 41/42 的原因見 #38）、`c863e56`（第十四批：校門；程式在 `790944e`）、`1b17f42`（沈以安高馬尾標 BLOCKED）、`3c2496d`（第十三批：沈以安臉旁碎髮）、`7d9b6b8`（第十二批：捷運出口、溫書瑀馬尾）、`320c2e7`（第十、十一批：農業陳列館、公館重建）、`6db8289`（第九批）、`416afee`（第八批：黃昏調色提案，等使用者決定）、`40bb50e`（第七批）、`86deef8`（第六批）、`edb01e8`（第五批）、`0080bf5`（第四批）、`66374e2`（第三批）、`7a4eca6`（第二批）、`ad76109`（第一批）。分支 `claude/friendly-brahmagupta-6bbkzc`，PR：https://github.com/pyhuanglaw/Lawstudent/pull/1
- **畫面驗收**：[`docs/art-rebuild/VISUAL_REVIEW.md`](art-rebuild/VISUAL_REVIEW.md)。**美術規範**：[`docs/art-rebuild/ART_DIRECTION.md`](art-rebuild/ART_DIRECTION.md)（參考圖在 `docs/art-rebuild/references/`）

### 使用者睡眠期間自主施工（2026-10-10 12:05 起，約九小時無人值守；使用者授權）

**規則（使用者原文摘要）**：需要使用者判斷美醜、選圖、確認造型的步驟，一律改成「做比較圖 → 保存 → 記錄待驗收 → 繼續下一項」；不標 ART_APPROVED；兩個版本無法客觀分高下就都保留；不合併 main、不發布 Pages、不改劇情／人設／關係、不破壞存檔、不 force push、不刪已完成的模型或工作檔。每完成可測試的成果就 commit＋push，這一節持續更新。

**工作佇列（依優先順序；被擋住時跳到下一個獨立項目）**

| # | 項目 | 狀態 | 入口／說明 |
|---|---|---|---|
| 1 | 沈以安 Blender 正式模型：臉、頭髮、服裝模組 → 整合 → 匯出 VRM → 遊戲內全面驗證 → 三方比較 | 進行中（臉、頭髮模組 WIP `f41e477`；服裝模組排隊中） | `tools/blender/char/heroine_01.py --stages stage0,face,hair,clothes`；驗證 `tools/shots/char_review.py`（`CHAR_SWAP`）、`char_motion.py`、`char_compare3.py` |
| 2 | 六位主角共用的 Blender 人物生產線（把沈以安的流程整理成可重用工具）→ 依序祐廷、林芷若、陳語彤、高子晴、溫書瑀 | 尚未開工 | 每位獨立臉型；一次一位 |
| 3 | 現有遊戲真實問題：霖澤館鏡頭遮擋（#16）、201 有 17 個座位按鈕不出現（#19）、長椅與不同身高人物坐姿、新模型載入不退回程序化人物、存讀檔相容 | 尚未開工 | 修前要能重現、修後通過 |
| 4 | 霖澤館剩餘美術與效能（夜間暖色玻璃重拍、Blender 渲染圖、玻璃反射、天花板／入口／窗／門框、201 窗外景與設備、畫質分級效能、Meshopt／KTX2 評估） | 尚未開工 | 霖澤館玩家流程 29/29 已通過（`4c95eb1`） |
| 5 | 萬才館第二階段（Blender 正式模型＋可走的弧形大樓梯、二樓平台／陽台、多樓層） | **大樓梯、平台、陽台可以走＋外觀 Blender 已整合**（`e4d7dbb`，D41；完整回歸 PASS）；點地面落點修正（`1924db4`）；**室內兩層樓（D42）製作中**（`wip/wancai-interior`：一樓大廳座標不變、二樓走廊／迴廊／門廳、樓梯、電梯、二樓入口打開；Blender 模型與瀏覽器測試未完成） | 照片與配置圖：D31 |
| 6 | 其他近景資產（公館、溫州街、總圖、宿舍、便利商店、麵店、書店、Café、長椅、公告欄、販賣機、車輛、路人） | 尚未開工 | 依 ASSET_INVENTORY |
| 7 | 畫面品質與玩家體驗巡查（鏡頭、光照、比例、站位、互動距離、介面重疊、NPC 穿模、卡死、低效能載入） | 尚未開工 | 客觀 bug 修、主觀問題做候選版本 |

**待使用者驗收（醒來後看）**：沈以安四位角色 VRoid 加工第一輪（CHARACTER_REVIEW 第 4–8 節）；之後的 Blender 版本見下面各項。

**完成紀錄（時間順序，含 commit）**
- 12:05 同步：遠端與本地都在 `841be90`；WIP 快照 `f41e477`。
- 12:08 #19「201 有 17 個座位按鈕不出現」查明是**測試的錯**（測試把玩家放在 y=0，最上排座位 1.5–1.8 m 被當成別層）；遊戲裡站在最上排按鈕正常出現（3/3）。修測試後 classroom ALL PASS。
- 12:13 #16 霖澤館／201 鏡頭遮擋修好：外牆上的門與框跟著牆淡出（Blender 腳本分組、重新匯出兩個 GLB）；新測試 `tests/indoor_camera_occlusion.py` 舊版 4/5 失敗、新版 5/5 PASS。順便修 `char_review`／`char_motion` 的 `CHAR_SWAP` 攔截寫法（之前還沒用到，不影響已有結果）。
- 12:20 第二個工作流程（霖澤館美術：玻璃反射與夜間暖色玻璃、室內與 201 的 Blender 細節，各自建模 → 審查 → 修正）開始，和沈以安人物工作流程平行（檔案不重疊）；舊存檔相容測試（線上 main `cd52bab` 的存檔、v7 `ba53746` 的存檔 → 開發分支）在背景跑。
- 12:40–13:00 沈以安：側臉的下半臉往後收、嘴下面的條紋陰影消除、瀏海改細髮束、臉旁長髮加寬加波浪（`232ebdc`、`08d0841`，遊戲 look-dev 截圖確認）。使用者要求減少平行工作，霖澤館工作流程暫停（WIP patch 在暫存區）。
- 13:00–13:20 雙 AI 分工（使用者指示）：第二個工作階段「遊戲協作專案」（`session_01AC1WVgJSmoJK1uRsPK2Zn1`，分支 `claude/second-ai-env-art`）負責環境美術，第一項是兩點半 Café。交接文件 `docs/SECOND_AI_HANDOFF.md`、看板 `docs/DUAL_AI_BOARD.md`、決策 D39；`build.py` 打包 `assets/models/env/second_ai/`；`assets3d.js`、`LICENSES.md` 各開一個第二個 AI 的區段。雙方 `send_message` 已確認雙向可用。
- 13:20–14:10 **沈以安 Blender 版第一版完成並進遊戲**（`c54bbce`、驗收資料 `8f45184`）。
  - 服裝：背景代理被使用者插話中斷，改由主代理自己接手 `h01_clothes.py`，修掉四個錯：
    - 剪皮膚的座標前後顛倒；
    - 褲子膝蓋上下的權重寫反；
    - 褲頭射線打不到身體；
    - 落肩在手放下時像披肩。
  - 毛衣改成凸包直落，褲子兩管在中線接平、從臀部直落。
  - 完整模型 `stage0,face,clothes,hair` → `assets/models/char/bl_heroine_01.vrm`，Blender 工作檔 `assets/blender/heroine_01_work_v1.blend`；網址 `?blchar` 才載入。
  - 遊戲內驗收：六視角、坐長椅、霖澤館樓梯走上二樓、15 個表情；`stairs_feet_unit`、`sim_hair` 通過。
  - 三方比較見 CHARACTER_REVIEW 第 9 節。
- 14:10–14:20 v9.4 發布前測試：第一個候選唯一的失敗（`zone_transitions` 的霖澤館）查明是測試過時（v9.4 進霖澤館先到大廳），修測試（`f10b387`）；新候選 `f10b387` 的完整發布前測試在乾淨 worktree 執行中。
- 14:20– 人物生產線：`common.BodyMap`（依骨頭地標把不同身形對到沈以安的比例，衣服、臉的模組可以共用）、`h01_face` 的貼圖參數可調；祐廷的 `player.py`＋`p00_face.py`、`p00_clothes.py`（淺灰圓領毛衣、深灰直筒褲、白球鞋）、`p00_hair.py`（新的層次短髮）開始寫。
- 14:20–14:47 **v9.4 正式發布**（使用者的條件式發布授權）：候選 `f10b387` 發布前測試 24 項中 22 項第一次 PASS；另外兩項是測試本身的問題——`flow_class_real` 還是 v9.3 的走法（改測試 `b006183`）、`flow_linze_floors` 在人物還在走、經過座位時就檢查按鈕（`tests/playlib.py` 的 `go_to` 改成等人物停下來，`6b9c0dc`）——對同一個候選重跑都 PASS。main 快轉到 `6b9c0dc`（遊戲檔案和候選完全相同），GitHub Pages 14:47:16 UTC 部署成功；本機同一 commit `deploy_check` ALL PASS。紀錄在 `docs/RELEASES.md`（含不用 force push 的緊急回復方法）。下一次發布最早 17:47 UTC。
- 14:20–15:30 **祐廷 Blender 版第一版**（人物生產線第二位，`READY_FOR_ART_REVIEW`，網址 `?blchar`）：Blender 預覽＋遊戲內看了十二版，修掉的問題見 CHARACTER_REVIEW 第 10 節（褲頭在肋骨下面＝BodyMap 換算、V 領改圓領、手放下肩膀翹成墊肩＝落肩身片蓋在袖子上、太陽穴空、頭髮擋眼睛、後頸細髮、髮旋鼓包、頭髮在遊戲裡全黑）。遊戲內六視角、坐下、霖澤館樓梯、14 個表情、`stairs_feet_unit` PASS；`?blchar` 實際載入兩個 Blender 人物、沒有重複下載 VRoid 檔。新工具：`render_blend.py` 的手放下姿勢（`ARMS_DOWN`）與自訂鏡頭（`CAM`）在暫存區、`char_motion.py` 可以拍玩家本人。
- 15:00 沈以安 Blender 第二輪（髮色、褲子前中線）在遊戲裡和第一版差別很小，先不換；下一輪要連同毛衣肩膀（同樣的落肩帽沿問題）一起改。
- 15:30–15:50 **沈以安 Blender 第二版**換上（`e051461`）：毛衣肩膀不再翹成帽沿（落肩收到肩關節、權重照原本上衣）、寬鬆量收、髮色灰棕。使用者的永久規則「使用者訊息優先＋雙 AI 即時協作」寫進 CLAUDE.md（D40，`2eacc4a`）；LAWWW2 的九小時工作佇列寫進交接文件。
- 15:50–16:45 **林芷若 Blender 第一版**（人物生產線第三位，`READY_FOR_ART_REVIEW`，網址 `?blchar`）：做到第六版時準備定案，拍三方比較才發現遊戲內臉部特寫的瀏海是一排齊瀏海、臉頰有灰藍色塊（腮紅去除的副作用）、臉旁有往外飄的細線——沒有採用第六版，改到第八版：中分八字瀏海、腮紅用周圍皮膚補、正側面的髮片收進看得到髮面的那一圈。遊戲內六視角、坐下、霖澤館樓梯、15 個表情、`stairs_feet_unit` PASS；`?blchar` 三個 Blender 人物都載入。細節見 CHARACTER_REVIEW 第 11 節。
- 16:13–16:25 **整合 LAWWW2 的兩點半 Café**（外觀＋室內 Blender GLB）：merge `384c612`（沒有衝突）後跑 `cafe_glb_integration` 62/62、`reachability_all` 全遊戲（11 區、139 個互動點）、`zone_transitions` 37、`p0_movement` 34、`touch_flow_wenzhou`，全部 ALL PASS（Playwright 手機模擬）。LAWWW2 的驗收文件：`docs/art-rebuild/second_ai/VISUAL_REVIEW.md` 第 1 節。
- 16:45 LAWWW2 的街道道具共用檔提案：同意，附條件（約定不變、三角形預算、效能數字、載入失敗退回、加跑回歸）。發布計畫：溫州街近景＋便利商店 17:30Z 前交且測試過就和 Café 一起發（約 18:15–18:30Z）。
- 16:50 **雙 AI 整合示範**：17:30 祐廷＋沈以安（Blender 版，`?blchar`）沿紅磚人行道走過 LAWWW2 的 Café——實際遊戲畫面＋參考圖 07 對照（`615edd0`，VISUAL_REVIEW 第 18 節）。
- 16:55–18:45 陳語彤 Blender（Sendagaya Shibu 樣本；第五版：空氣瀏海、及肩直髮、深色 T 恤紮進高腰牛仔褲＋皮帶、白球鞋；`7e52aac`，遊戲內驗收待做）；高子晴 Blender 開工（Vita 樣本：臉頰與身上的科幻花紋、緊身褲、手套顏色用周圍皮膚補掉；淺麻灰連帽上衣＋放下的帽子＋帽繩、深色牛仔短褲、深棕鮑伯）。
- 16:58–18:56 **v9.4.1 發布前測試**（候選 `f2f1c03`）：24 項中 23 項第一次 PASS；`flow_linze_floors` 的「路人 60 秒內走樓梯 ≥ 2 m」差一點——對照線上 v9.4 同一測試只以 2.016 m 剛好過、直接觀察 3 分鐘兩個路人反覆走完 0～4.2 m，查明是觀察時間太短；標準不變、觀察時間改最多 150 秒，重跑 29/29。（中間我寫錯一個等待條件，白等約 20 分鐘。）
- 18:56–18:59 **v9.4.1 發布**：main 快轉到 `e4ded6a`（遊戲檔案＝`f2f1c03`），GitHub Pages 18:59:10 UTC 部署成功；本機同一 commit `deploy_check` ALL PASS。兩點半 Café 正式模型（LAWWW2）上線；Blender 人物仍只在 `?blchar`。下一次發布最早 21:59 UTC。
- 18:58 LAWWW2 的溫州街近景＋便利商店（`e2ae4d6`，18:19Z 交付、18:53Z 才收到）merge 進開發分支（`f14b533`），回歸測試執行中；draw call 比原本多 47～52%，請 LAWWW2 再降，降完的版本進下一版。
- 19:10 溫州街＋便利商店整合後的回歸全部通過（`dabf315`：wz_street 38、cvs 38、cafe 62、reachability_all 全遊戲、zone_transitions、see_through、p0_movement、touch_flow_wenzhou；Playwright 手機模擬）。
- 19:19 **陳語彤 Blender 版第一版**（`675a471`，`READY_FOR_ART_REVIEW`，`?blchar`）：Sendagaya Shibu 樣本；及肩直髮＋空氣瀏海、深色棉 T 紮進高腰牛仔褲＋皮帶、白球鞋、腮紅拿掉。遊戲內六視角、坐下、樓梯、15 個表情、`stairs_feet_unit` PASS。CHARACTER_REVIEW 第 12 節。
- 19:31 **高子晴 Blender 版第一版**（`3466902`，`READY_FOR_ART_REVIEW`，`?blchar`）：Vita 樣本的皮膚科幻花紋清掉、深棕鮑伯＋空氣瀏海、淺麻灰連帽上衣＋放下的帽子＋帽繩、深色牛仔短褲、白球鞋。拍坐下時發現**所有人物坐在地面高度的座位時腳沉到地面下 12～14 cm**（線上版也一樣，穿短褲時看起來小腿斷在地面），新增 `tests/sit_feet_unit.js` 量測。CHARACTER_REVIEW 第 13 節。
- 19:50 **坐姿腳修正**（`fa8a484`）：坐在地面高度的座位（長椅、Café 的椅子）時，在真實骨架上把小腿往前伸、腳掌保持原本方向，讓腳踝停在站著時的高度：六位主要人物從 −12～−14 cm 變成 −0.4～−0.5 cm；階梯教室的座位不套用（腳往前伸會從桌子下面突出來）。`sit_feet_unit` 加進發布前測試。同一個 commit：VRoid 人物 VRM 補上 POSITION 的 min/max（只改 JSON；LAWWW2 回報的 GLTFLoader 警告）。回歸：sit_feet_unit、stairs_feet_unit（六人）、sim_hair、flow_class_real 9/9、touch_flow_wenzhou、movement_regression 42/42。
- 19:50 LAWWW2 的麵店、書店、宿舍室內＋玻璃修正（`0467303`）merge 進開發分支（`3455876`）。回歸：interior_glb_integration 101、cvs_glb_integration 39、reachability_all 全遊戲、zone_transitions、movement_regression 42/42、p0_movement 34 都 ALL PASS（Playwright 手機模擬）。
- 19:54 看實際遊戲截圖發現：宿舍前牆淡出後，門邊牆上的掛勾架＋兩條毛巾浮在畫面前景（這些網格不在 `WALL_front` 群組，牆淡出時沒有一起淡出）；後牆的冷氣、冷氣管、窗簾桿、窗簾也一樣。用 GLB 節點外框掃過四間室內，只有宿舍有。已交給 LAWWW2（P1，修法：改名進牆的群組＋新增測試）。
- 20:05–20:20 **坐姿第二版**：在麵店實際坐下（像玩家一樣按「坐下吃麵」、選乾麵）看到第一版修正的問題——腳是踩到地了，但小腿斜 47°、腳伸到桌子底下 70 cm，像半躺著。改成先把大腿往上抬（膝蓋比臀部高一點、小腿方向不變），抬到上限（水平以上 17°）還不夠才讓小腿往前伸：六位主要人物小腿 6～8°、大腿 10～13°、腳底 −0.4～−0.6 cm。`tests/sit_feet_unit.js` 多檢查小腿 ≤ 25°、大腿 ≤ 20°（第一版 FAIL、第二版 PASS）。麵店、溫州街小公園長椅、Café 窗邊雙人桌截圖（CHARACTER_REVIEW 第 13 節）。CHARACTER_REVIEW 第 11–13 節的圖原本放錯資料夾（根目錄 `screenshots/`），移到 `docs/art-rebuild/screenshots/`，文件裡的圖現在都看得到。
- 20:26–20:41 **整合 LAWWW2 的溫州街第二輪減量**（`a58b517` → merge `c9dbdf3`）：同一鏡頭 draw call 322→277、286→239、329→283（目標 ≤ 310；比舊的程序化版多 26～27%），三角形 33～36 萬。回歸全部通過：touch_flow_wenzhou、see_through、wz_street_integration 42、cafe_glb_integration 62、cvs_glb_integration 39、interior_glb_integration 101、zone_transitions、reachability_all 全遊戲（Playwright 手機模擬）。
- 20:41–20:55 **整合 LAWWW2 的宿舍貼牆修正**（`6374654` → merge `1f95ca9`）：掛勾、毛巾、冷氣、窗簾、月曆、傳單跟著牆淡出；新測試修改前 FAIL、修改後 PASS。回歸全部通過：interior_glb_integration 104、movement_regression 42/42、p0_movement 34、zone_transitions、reachability_all 全遊戲。
- 2026-10-11 00:00–00:50 **萬才館第二階段：大樓梯可以走＋外觀 Blender 正式模型**（D41；需求 21「萬才館的弧形大樓梯必須能讓玩家走上去」）：`7c663a5`（大樓梯）、`e4d7dbb`（外觀、鏡頭、找路）、`62d057b`（文件）。玩家可以從法學院廣場用搖桿走上弧形大樓梯（一階一階，腳踩踏面）到樓梯頂端的平台與弧形陽台（校園第 1 層，3.63 m），在陽台上存讀檔；陽台下的一樓入口照舊；二樓入口這一版關著（告示）。外觀換成 Blender 模型（`tools/blender/wancai_exterior.py`：台階外緣用 `--check` 和遊戲導航比對到 0；踏面亮、踢面暗；窗 8 組 instancing）。**真實玩家測試抓到三件事都修了**：①往下走時鏡頭太低、平台邊緣擋住下面的台階（點地面又走回上面）→ 戶外往下走樓梯時鏡頭俯角加大；②`reachability_all`：從萬才館一樓出來走回霖澤館前卡在大樓梯底下 → 路線轉折點要等下一段直線過得去才轉向（引擎 `wpReached`，影響所有自動走路，完整回歸執行中）、兩側張開的窄台階不能走；③`reachability_all` 不會測第 1 層的互動點 → 補上。外觀第一版窗分 36 組 instancing、同一個鏡頭 draw call 多 70 → 8 組，多 25～27（`wancai_glb_integration` 預算 1.15 倍＋6：通過）。測試：Node 單元測試 5 項通過；舊版（7c663a5）的瀏覽器回歸除了上面兩項以外全部通過；新版完整回歸執行中（Playwright 手機模擬，不是實機）。美術 `READY_FOR_ART_REVIEW`（遊戲內前後比較截圖待補）。
- 23:24–23:47 **整合 LAWWW2 的公館店面街**（羅斯福路南側 15 棟騎樓店面＋往溫州街的巷口轉角換成 Blender 正式模型，`6d791a9`／`335b081` → merge `85e1b01`）：玩家在公館人行道、騎樓、校門口看到的整排店面從套件方盒變成和溫州街同一套的台北公寓（磁磚、鐵窗、冷氣、樓上住戶的直立招牌、二樓大招牌、屋頂看板、鐵捲門箱）；導航格、鏡頭碰撞、互動點和 `?nobldg` 完全相同。`wzAtlasFaces` 改成內容相同的招牌共用 atlas 的同一格（溫州街也用這個函式，加跑 wz_street_integration）。回歸全部通過：gongguan_glb_integration、gongguan_layout_nav、wz_street_integration、p0_movement、zone_transitions、see_through、touch_flow_wenzhou、movement_regression 42/42、reachability_all 全遊戲、nav_levels_unit、nav_buildings_unit（Playwright 手機模擬，不是實機）。同鏡頭 draw call 是 `?nobldg` 的 1.06～1.12 倍、三角形 39.8～40.3 萬（AI-2 量測）。美術 `READY_FOR_ART_REVIEW`（AI-2 的 VISUAL_REVIEW 第 7 節有三時段前後比較）。排在 v9.4.2 的下一版。
- 22:13–22:31 **整合 LAWWW2 的街道道具**（腳踏車、路燈、長椅換成 Blender 正式模型，`2e3b825` → merge `1918713`）：回歸全部通過（movement_regression 42/42、p0_movement、see_through、street_props_integration 26、campus_layout_nav、zone_transitions、reachability_all 全遊戲；新長椅坐姿截圖正常）。LAWWW2 提醒：校園兩個鏡頭本身就有 92～94 萬個三角形（跟道具無關）——之後量手機效能時要先處理。
- 22:05–22:40 **林芷若、陳語彤、高子晴的頭髮彈簧骨**（`hair_springs.py` 後處理、`hair_sway.js` 新檢查；CHARACTER_REVIEW 第 15 節）：耳朵以下分成 4～6 條 2 節的鏈，碰撞體只用上臂（頭、脖子、上胸的碰撞球比實際大，後頸的頭髮會被推開 3～4 cm）；跑步急停時擺 1.0～2.3 cm、停下回原位。遊戲內背面、側面、臉部特寫沒有破圖；stairs_feet_unit、sit_feet_unit、sim_hair PASS。
- 20:57–21:41 **v9.4.2 發布前測試**（候選 `dfd2618`，乾淨 worktree）：25 項第一次全部 PASS（`docs/RELEASES.md`）；等使用者核准才發布。
- 21:00–21:55 **溫書瑀 Blender 版第一版**（人物生產線第六位，`READY_FOR_ART_REVIEW`，網址 `?blchar`）：做到第四版。查出 V 領裡的洞和脖子下緣的鋸齒邊，是 Shino 樣本的身體貼圖在原本衣服蓋住的地方透明（網格還在），`fill_hidden_skin` 補上皮膚色（之前另外做的兩種皮膚片都看得到接縫）；頭髮材質的加亮 MatCap 關掉（頭頂一圈白光）；瀏海改成中分往兩旁撥。遊戲內六視角、坐長椅、走上霖澤館樓梯、15 個表情、三方比較（CHARACTER_REVIEW 第 14 節）；stairs_feet_unit、sit_feet_unit、sim_hair PASS。`?blchar` 用 Blender 版時不再另外掛遊戲的髮圈（`assets3d.js` 的 `blProps`）。**六位主要人物的 Blender 第一版都完成了**（都只在 `?blchar`）。
- 21:18–21:21 LAWWW2：溫州街遠景公寓（`beadd1b`，merge `6083076`，排在 v9.4.2 的下一版）；認領公館近景（同意，附條件）。22:02 遠景公寓＋`blProps` 的回歸全部通過：touch_flow_wenzhou、see_through、wz_street_integration 42、cafe_glb_integration 62、model_upgrade、p0_movement、zone_transitions、reachability_all 全遊戲（Playwright 手機模擬）。
- 20:56 **v9.4.2 發布候選**：版本字樣 v9.4.2、script 版本號 9.4-3；內容見 `docs/RELEASES.md`（溫州街近景、四間室內、玻璃與宿舍修正、坐姿第二版、`?blchar` 多陳語彤和高子晴）。九小時授權期之後才能發布（最早 21:59 UTC），**要使用者核准**；發布前測試在乾淨 worktree 執行。
- 20:20– 溫書瑀 Blender（人物生產線第六位）開工：`heroine_05.py`（Sendagaya Shino、頭縮 0.90）、`p05_face`（成熟的鵝蛋臉）、`p05_clothes`（白襯衫：開領＋自己做的領子網格、門襟＋扣子、捲起的袖口；卡其直筒褲、深棕皮帶、深棕樂福鞋）、`p05_hair`（從沈以安的高馬尾改成低馬尾＋中分長瀏海，馬尾有彈簧骨）。發現：Shino 樣本的身體在原本上衣下面沒有胸口（VRoid 匯出時刪掉），V 領會看到洞——補一片胸口皮膚；Shino 的頭髮材質有一張加亮的 MatCap，頭頂斜著看一圈白光——關掉（林芷若、陳語彤、高子晴的 Blender 版也有這張 MatCap，遊戲內要再確認）。

### 正在做（v9.4 人物：Blender 正式製作——示範角色沈以安，2026-10-10 11:00 起，使用者指示）

**使用者要求**：人物不能只靠 `tools/vroid_build.py` 改 VRoid 樣本網格（換髮型、縮眼睛、調衣服），要用 Blender 真正改善 3D 造型（臉部立體結構、眼型、鼻型、下顎、髮束、服裝輪廓），接近原始參考圖的成年角色；先做**一位**完整示範角色；保留或正確重建骨架、表情、動作、遊戲載入；交 Blender 工作檔＋遊戲用模型；參考圖／目前 VRoid 加工版／Blender 改造版同角度比較；**遊戲內驗證**；使用者確認之前不標 ART_APPROVED。

| 步驟 | 狀態 | 說明 |
|---|---|---|
| 1. VRM ↔ Blender 相容性 | 已完成、已測試（`c89fcde`） | VRM Add-on for Blender（MIT）在 bpy 5.2.2 無介面可用；往返結構完全相同、遊戲載入正常（`docs/art-rebuild/TOOLCHAIN_AUDIT.md` 17–19） |
| 2. 第 0 階段：原始樣本 HairSample_Female 拿掉頭髮衣服、頭縮 0.90（約 7.4 頭身） | 已完成、已測試（`c89fcde`） | `tools/blender/char/heroine_01.py`；遊戲 look-dev 正常、`stairs_feet_unit` PASS |
| 3. 臉（`h01_face.py`）、新髮型網格（`h01_hair.py`）、新衣服網格（`h01_clothes.py`） | 進行中（工作流程：每個部位 Blender 建模 → 對照參考圖與遊戲截圖審查 → 修正） | 骨架、表情 shape key、彈簧骨沿用並重新設定 |
| 4. 整合、匯出遊戲用 VRM、Blender 工作檔 | 尚未開工 | `tools/blender/char/vrm_finish.py` 做遊戲用整理 |
| 5. 三方比較、遊戲內驗收（正面／45 度／側面／背面／臉／走路／坐下／上下樓梯、彈簧骨） | 尚未開工 | 工具已備：`tools/shots/char_review.py`（`CHAR_SWAP` 換試作檔）、`tools/shots/char_compare3.py` |

VRoid 加工路線（`vroid_build.py`）：祐廷、沈以安、林芷若、陳語彤第一輪已完成並有遊戲內比較圖；高子晴第一輪已提交（`6ecddf6`）但遊戲內截圖未做；溫書瑀未開始——這條路線暫停，等使用者確認 Blender 示範的方向。

### 正在做（v9.4 第一階段：霖澤館多樓層示範區＋Blender 正式模型，`cd52bab` 之後；需求 `docs/history/specs/21_*`、永久美術規範 `22_*`／D38）

**玩家要能感受到的目標**：從法學院廣場走上台階、穿過霖澤館的三層樓高穿堂，進大廳、自己走樓梯上二樓，進 201 階梯教室坐下、起身，再走出建築；
霖澤館外觀、大廳、教室是 Blender 做的正式模型（照使用者的照片），不是程序化方盒。

| 項目 | 技術（A） | 功能（B） | 美術（C） | 說明 |
|---|---|---|---|---|
| 分層導航（D36 方案 A：每層一張 NavGrid＋格子高度＋樓梯／電梯連結） | 完成 | Node 驗證通過（`nav_levels_unit`、`nav_buildings_unit`）；**瀏覽器待驗證** | — | 單層時和改版前的找路完全相同（300 組×2）；存檔記 `pos.lv`、`pos.y`，舊存檔預設第 0 層 |
| 霖澤館穿堂可以走（0.9 m 地坪、前後台階） | 完成 | Node 通過；瀏覽器待驗證 | 外觀見下 | D26（不能走）作廢 |
| 霖澤館室內（大廳、雙跑樓梯、玻璃電梯、二樓迴廊、三樓以上整修中） | 完成；Blender `linze_interior.glb` | Node 通過；瀏覽器待驗證 | MODEL_READY（遊戲化設計，D37） | 室內沒有照片，遊戲化設計，不宣稱是真實格局 |
| 201 階梯教室（6 排平台、48 個座位全部能坐） | 完成；Blender `classroom_201.glb` | Node 通過（48 個座位）；瀏覽器待驗證 | MODEL_READY | 照使用者的教室照片 |
| 霖澤館外觀（十層：花崗石基座、穿堂、灰色帶窗層、紅磚窗格、頂樓開放層＋屋頂板） | 完成；Blender `linze_exterior.glb`、接進校園 | 導航沿用套件（加穿堂中柱） | MODEL_READY | 照使用者的兩張照片概略重建 |
| 走樓梯腳步貼合（footIK） | 完成 | Node 量測通過（`stairs_feet_unit`：穿進台階 30 cm → 0.6 cm 以下）；瀏覽器待驗證 | — | 平地完全不動 |
| 壓縮（Meshopt、KTX2） | 未做 | — | — | 先用 512 px WebP；窗戶、椅子用 GPU instancing |

**commit**：`76cfe72`（分層導航、霖澤館室內、穿堂、階梯教室）、`b22adec`（永久美術規範 D38）、`7dcd8a9`（教室 Blender 模型）、`3430f73`（霖澤館外觀 Blender 模型）、`c4a987d`／`5821f9a`（測試修正）、`17a28b7`（腳步貼合）。
**未解決／接下來**：瀏覽器真實流程 `flow_linze_floors`、遊戲內截圖（三個時段）與新舊比較、Blender 渲染圖、VISUAL_REVIEW；第二階段：萬才館（弧形大樓梯可以走）、總圖、其他樓層。

#### 建築組交接（2026-10-10 09:55，使用者：建築組工作階段結束，之後只有人物組那個工作階段（`claude/confident-ritchie-8rwh7t`）繼續，人物和建築都由它負責）

建築組最後的 commit：`8af3aeb`（點樓梯修正＋測試＋比較圖），合併人物組 `279bb9b` 之後是 `c0dfde1`（分支 `claude/friendly-brahmagupta-6bbkzc`，已 push）。接手時先把這個分支 merge 進 `claude/confident-ritchie-8rwh7t`。

**已完成、已驗證**
- 遊戲 bug（FIXED）：Blender 室內載入後點樓梯踏面走不上樓梯——`src/building3d.js` 的 `attachFormal` 把點地面用的透明地板搬出備用模型群組。修正前 `flow_linze_floors` 到樓梯下面之後點地面 71 次只有 1 次落在樓梯上；修正後點 4 次樓梯踏面走上二樓（Playwright 手機模擬，不是真機）。
- `flow_linze_floors` 修正後跑到：廣場 → 穿堂 → 後面小廣場 → 大廳門口 → 進大廳 → 樓梯下 → **自己走上二樓** → 201 教室門口，全部 PASS。
- Node：`nav_levels_unit`、`nav_buildings_unit`、`stairs_feet_unit`（合併人物組的祐廷新模型之後）ALL PASS。
- 畫面驗收：VISUAL_REVIEW 第 17 節（外觀 4 視角 × 3 時段新舊比較、室內備用｜Blender、腳步貼合開關、GLB 規格、未達標處）。

**還沒做完（接手的人照順序做）**
1. **重跑 `PLAYLIB_TAPLOG=1 python3 tests/flow_linze_floors.py http://127.0.0.1:8765/index.html`**：上一次在「進入 201」失敗——沒課的日子（星期六）進 201 有一句旁白（`story3d.js` 148 行），舊的 `press()` 不點對話。`press()` 已改成像玩家一樣點對話（`8af3aeb`），**還沒重跑驗證**。之後的步驟（坐下、起身、離開教室、二樓存讀檔、電梯、走出霖澤館、NPC 上下樓）在瀏覽器裡**都還沒跑過**。跑完把結果寫進 TESTING 第七節（「修好之後」欄）、VISUAL_REVIEW 17.5 的狀態（通過才能把外觀／室內／教室標 FUNCTIONAL_VERIFIED → READY_FOR_ART_REVIEW）。
2. **後台階走到一半停住**（瀏覽器才有，Node 模擬不會）：從霖澤館後面的小廣場 (34,-125.39) 點大廳門口 (28.34,-107.6)，人物走到 (33.24,-123.03)（後台階、高度約 0.2 m）就原地停住，再點一次也不動，推一次搖桿才繼續。`E.simWalk` 同一條路在 dt＝1/30、0.1、0.25 都走得到。還沒查出原因；查法：讀檔到那個位置、鏡頭 yaw≈2.75，點門口後每 0.5 秒記 `P.path`、`P.pose`、`P.busy`、`P.blockedAt`、`E.canStand`（`stepEntity` 只看導航格，不看 NPC）。
3. 201 教室的**舊版截圖**（`tools/dev_scratch/linze_interior_shots.py` 已改成舊版沒有 linze 區域時跳過；對線上版副本跑一次）→ VISUAL_REVIEW 17.2 補教室的新舊比較。
4. 夜間大廳玻璃改暖色（`zones3d.js` 的 `ext_glass_lobby`）之後**還沒重拍** 20:30。
5. Blender 渲染圖（`/opt/blenv/bin/python tools/blender/linze_exterior.py --render <資料夾>` 等三個腳本；headless EEVEE 在沙盒能不能跑還沒驗證）。
6. 第二階段：萬才館（弧形大樓梯可以走、室內樓層）、總圖、Meshopt／KTX2 壓縮。

**測試工具的變更（`tests/playlib.py`，共用）**：`tap_ground(..., verify=True)` 先用 `E.screenToFloor` 驗證落點（3D 位置）才點，回傳 dict 或 None；新增 `tap_path`（沿 `E.pathTo` 的路線點最遠、看得到、點下去真的落在那裡的點）；`go_to` 在目標位於鏡頭背後而且超過 4 m 時先滑動畫面轉鏡頭；環境變數 `PLAYLIB_TAPLOG=1` 印出每次點地面。

### 這次完成（v9.3 第二十五批：線上實玩回報的兩個 bug＋全遊戲真實玩家測試制度，`0ef3a73` 之後）

使用者在剛發布的線上版實玩：**「才進入教室就卡住沒辦法找到地方坐下」**、**「在霖澤館外面跑的方向跟地圖就相反了」**，並訂定永久測試制度（D34，`docs/TESTING.md`）。

- **小地圖方向（FIXED，v7 就有）**：`game3d.js` 的 `drawMinimap` 旋轉角原本是 `π−鏡頭角度`，正負號錯：鏡頭朝南／北時整張地圖上下顛倒（從霖澤館出來時鏡頭朝南，正好遇到）。改成照鏡頭角度旋轉（前方朝上），加「北」方標示與玩家朝向箭頭（`GAME.minimapArrow()` 給測試用）。
- **搖桿方向（FIXED，這才是「跑的方向相反」的主因）**：`engine3d.js` 把搖桿（和鍵盤）方向依鏡頭角度轉成世界方向時，旋轉方向寫反——鏡頭朝正北／正南時對，**轉 45° 偏 90°、轉到側面（90°／270°）時整個相反，推「往前」會往鏡頭這邊跑**。舊測試只在鏡頭朝正北／正南推搖桿；`touch_flow_wenzhou` 的搖桿反算照著錯的公式寫，所以一直沒發現。修正後鏡頭朝正北／正南的行為不變。新測試 `tests/joystick_direction.py`（8 個鏡頭角度 × 4 個方向＋手指拖曳轉鏡頭）在舊版失敗、修正後通過（見測試結果）。
- **教室上課卡住（FIXED）**：上課劇情用 `walkTo` 帶玩家走到第二排座位；路線貼著第三排桌子的西端走，人物半徑 0.32 m 在那一格站不住 → 原地踏步、劇情永遠等。舊測試全部用 `?turbo`，劇情走路會瞬移，所以沒抓到。修法（D35）：
  - `engine3d.js` 找路：先只走「人物站得住」的格子（`clearMask`，半徑 0.33 m），找不到才退回舊的；拉直路線用 `losR`（整條線人物過得去）。
  - `game3d.js`：劇情自動走路的保險改用**遊戲時間**（4 秒沒前進 0.25 m 才放到目的地；`GAME.walkFallbacks` 記次數，真實流程測試要求 0）；「坐下」改走到椅子前／後／左／右「站得住、走得到、最近」的點（`GAME.seatApproach`；原本固定走到椅子正前方，教室的椅子正前方是桌子）。
- **全遊戲可達性掃描找到的其他問題**（`tests/reachability_all.py`，用舊找路掃有 15 項失敗）：萬才館入口、總圖入口、椰林大道長椅、醉月湖長椅、社團攤位、公館「回到校園」、溫州街「回公館」與定食店、溫州街小公園兩張椅子（盆栽和樹之間 0.2 m 的縫）——新找路全部走得通；另外直接改：**書店**「看看法律書與文具」原本在桌子和書架之間（比人窄、走不進去、買不到教科書）→ 移到桌子靠門口那一側；**宿舍**出生點 (0,2.8) 站不住 → (0,2.4)。
- **新測試（`tests/`）**：`playlib.py`（真實玩家測試共用工具：手機觸控、點對話／選項／互動、搖桿、拖曳、截圖、`[前置／捷徑]` 標示）、`reachability_all.py`、`flow_class_real.py`、`minimap_direction.py`、`flow_main_day12.py`（從標題開新遊戲的第一、二天主線，不用 turbo）、`deploy_check.py`、`save_compat_v7.py`。
- **證明測試抓得到 bug**：`flow_class_real` 在線上版（`0ef3a73`）失敗——人物卡在 (-6.4,1.9) 原地踏步；`minimap_direction` 在線上版失敗——鏡頭朝北時前方的出入口畫在地圖下方（應 0°，實際 181°）；`reachability_all --legacy` 15 項失敗。修好之後的結果見「測試結果」。

### 這次完成（v9.3 第二十四批：法學院區照使用者的配置圖＋萬才館新照片，`99e1c5a` 之後）

使用者 2026-10-10 回覆上一份報告「缺少的照片視角」：提供法律學院配置圖（霖澤館、國青中心、萬才館、黑森林的相對位置）與萬才館正面照片（D31）。

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 萬才館正面（新照片） | 技術完成；功能完成（導航、場景切換測試）；READY_FOR_ART_REVIEW | 由西到東：弧形兩層樓量體（配置圖的半圓；混凝土板、一大片兩層的格子窗、直條窄窗＋紅褐飾條）、往下張開的大樓梯（22 階，第二十一批的石牆做法）、樓梯頂端接著往外凸出的弧形陽台（厚混凝土邊＋欄杆，後面是二樓整面玻璃＋館名）、**陽台下的一樓入口**（玻璃門、嵌燈；地面高度，玩家從這裡進出萬才館）、往前凸出的三層樓灰色量體。原本推測的西側方形低樓拿掉 |
| 萬才館上半部（新照片） | 技術完成；READY_FOR_ART_REVIEW | 紅磚改成照片偏橘的淺紅磚（照片約 RGB 183,136,107）；每格兩扇窄窗、每扇窗都有凸出的混凝土窗框；屋頂上鏤空的大混凝土框架 |
| 萬才館入口位置 | 功能完成 | 互動點從台階下 (79.5,-94.4) 移到陽台下的一樓入口 (93.8,-100.6)；從萬才館出來站在 (93.8,-98.4)；往入口的小路移到 x=92.5；原本擋在路線上的路燈移到入口東側（晚上照亮入口） |
| 國青中心（配置圖） | 技術完成；外觀推測 | 灰色現代宿舍板樓（7 層、「國青中心」招牌），放在霖澤館與萬才館中間的後方（中庭與北側圍牆之間，走不到）；從兩館之間、霖澤館前看得到。萬才館後面原本那棟沒有名字的系館拿掉 |
| 黑森林＋小水池（配置圖） | 技術完成；功能完成（導航孤島掃描） | 法學院廣場南邊到 z=-60 的路之間：11 棵深綠大樹、落葉地面、一條穿過樹林的小步道；霖澤館東南邊一個小水池（石砌池邊、水邊植物，不能走） |
| 兩館之間 | 功能完成 | 方形低樓拿掉後兩館之間變寬（x 54–73），矮灌木補到萬才館牆邊（不然北邊會有看不見的牆） |

**和真實配置刻意不同的地方（D31）**：真實的萬才館弧形量體與入口朝辛亥路，遊戲朝南邊的法學院廣場（玩家走得到的那一側）；真實的國青中心在兩館正中間，遊戲放在兩館中間的後方；辛亥路的弧度、復興南路、機車與汽車入口沒有做。

測試：見下面「測試結果」（全部是 Playwright 模擬，不是手機實機）。

### 這次完成（v9.3 第二十三批：椰林大道兩側的樹冠照照片加密，`e77d607` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 大道兩側樹冠 | 技術完成；READY_FOR_ART_REVIEW | 照片裡椰子樹後面是一整片深綠樹冠。樹冠加寬 1.45 倍（約 5–6 m）、葉片補到同樣的密度、葉色調深；在頭頂上連成一片。樹幹位置與導航完全不動（大道北側的車架就在樹牆前 1.5 m，加樹幹會造成導航孤島），地面的路口、車架、系館門口照樣看得到、走得到；公館透過校門看到的同一排樹一起改 |

### 這次完成（v9.3 第二十二批：所有柏油路改成淺灰，`27806bc` 之後）

使用者 2026-10-10：「柏油路的顏色是淺灰 你的太深」（同時重貼了校園全面改造指令）。

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 柏油路改淺灰（D30） | 技術完成；READY_FOR_ART_REVIEW | 椰林大道、舟山路、公館羅斯福路、溫州街巷子、地圖邊界外的馬路全部從深灰／黑色改成照片那種偏冷的淺灰（受光處算圖約 170，照片 157–172）；裂縫、補丁、顆粒保留；白線、黃線、人孔蓋、「慢」字照樣看得到 |
| 入夜路面變暗 | 技術完成 | 晚上路面不再整片發亮：只有柏油材質跟著入夜變暗（深夜是白天的 58%），路燈下的光圈看得出來、不過曝；白天、黃昏 17:30 不變 |

測試：見下面「測試結果」（全部是 Playwright 模擬，不是手機實機）。

### 這次完成（v9.3 第二十一批：照片再比對——太陽方向、萬才館大台階、椰林大道路面，`f772e73` 之後）

第十七～二十批做完之後，把使用者的照片和遊戲畫面再並排比一次，找出還差最多、而且照片看得清楚的地方。

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 太陽方向（D29） | FIXED；READY_FOR_ART_REVIEW | 之前戶外的太陽中午在**北邊**（換算少一個負號）：朝南的霖澤館、萬才館、文學院正面整天是平平的陰影色，椰子樹的影子往南倒；照片裡法律學院的正面是陽光直射。改成照台北的方位：中午太陽在南邊，系館正面有陽光、門廊和拱窗有影子；朝北的行政大樓、傅鐘中午變成背光，公館的店面（朝東）下午變成背光（和實際一樣）。黃昏 17:00–18:00 幾乎沒變（太陽在西邊），兩點半 Café 的黃昏畫面保留；室內沒有方位，光線不變 |
| 萬才館大台階（照片 2 再比對） | 技術完成；功能完成（導航檢查）；READY_FOR_ART_REVIEW | ①**石牆外面多出來的台階拿掉**：原本每一階都是長方形、一路延伸到平台，從側面看石牆外還有一整塊一層層的台階（最高約 1 m）；現在台階夾在兩道石牆之間。②石牆照照片加高加厚（牆頂在台階上約 0.9 m、厚 0.52 m）、圓的牆頂、盡頭是較粗的端塊（和牆頂同高）、扶手是頂管＋兩道橫管。③石牆提早結束，**最下面四階繞過牆端往外張開**、每階圓角、越下面越寬（照片右下角）。④台階、平台、石牆改成照片的淺色花崗石。導航阻擋改成從每一階的實際外緣算（8 段），原本三段估寬度，石牆旁邊有最多 2 m 看不見的牆 |
| 椰林大道路面 | 技術完成；READY_FOR_ART_REVIEW | 照照片：深色柏油 → 淺灰、有補過的深色色塊；黃色中線變細、虛線變短；拿掉白色邊線（照片沒有）；路邊一條稍深的排水溝。路面變淺之後，椰子樹的影子在路上看得很清楚（照片也是）。從公館看校門裡的那一段一起改 |

測試：見下面「測試結果」（全部是 Playwright 模擬，不是手機實機）。

### 這次完成（v9.3 第十七～二十批：校園全面改造，`6b5d1cd` 之後）

使用者 2026-10-09：「你繼續做啊還有什麼沒做完？我覺得校園內周邊還是太空」，接著提供椰林大道、霖澤館（2 張）、法律系另一棟系館（2 張，沒有標名字，推定是萬才館）的照片，要求「全面修改遊戲現有的 3D 校園環境」（建築照照片改輪廓、樓層、材質、窗、入口、台階、側面、背面、屋頂；椰林大道照照片；轉一圈都不能看到大片空白或地圖邊界；改前改後實機截圖）。

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 第十七批：室內家具、教室座位平台改平 | 技術完成；READY_FOR_ART_REVIEW | 書桌（桌板＋封邊＋圓管腳）、椅子（有厚度的椅面＋微彎靠背）、書櫃（層板、隔板、高矮不一的書）、宿舍的床（床架、床墊、被子、枕頭）、萬才館圓桌加桌腳、沙發、Café 吧檯椅；教室後兩排的階梯平台改平（原本坐著的同學下半身陷在平台裡） |
| 第十八批：校園加密 | 技術完成；READY_FOR_ART_REVIEW | 大道兩側、舟山路南側補了 7 棟沒有名字的系館（同一套校園語彙）；大道兩側椰子樹後面是整排 11–13 m 的大樹牆（照片）；停車架與淑女車（前籃、擋泥板、鋼絲輪）；路人改走人行道、騎車的走路面 |
| 第十八批：椰林大道照照片 | 技術完成；READY_FOR_ART_REVIEW | 中間 12 m 柏油路＋黃色虛線中線＋白邊線、兩側石磚人行道；大王椰子拉高到約 20 m、樹冠相對變小（照片裡又高又細）；盡頭的總圖看得清楚 |
| 第十九批：霖澤館照照片重做 | 技術完成；READY_FOR_ART_REVIEW | 灰色花崗石下三層＋紅磚方格上層＋每層灰色樓板線、四角寬花崗石、頂上石材帶＋外伸的薄屋頂板；正面中間三層樓高、**穿過整棟的穿堂**（看得到後面的中庭）、白色梁格天花板＋嵌燈、二樓天橋、金色「霖澤館」直接裝在石材上、左邊玻璃大廳、右邊退縮玻璃牆＋橘色直式「法律學院」、整排寬台階＋不鏽鋼扶手 |
| 第十九批：萬才館照照片重做 | 技術完成；READY_FOR_ART_REVIEW | 同一套語彙；正面偏西的兩層樓玻璃入口＋墊高平台、**往下張開的弧形大台階**（13 階、兩側弧形石牆＋不鏽鋼扶手、最下面兩階張開到石牆外）、西側兩層樓花崗石低樓（大片方格玻璃）、石材與紅磚之間一排橫向長窗、頂樓石材帶 |
| 第十九批：入口與導航 | 功能完成（導航測試） | 台階、平台、穿堂都不能走（D26），入口互動點在台階下；萬才館入口從 (88,-102) 移到 (79.5,-94.4)，從萬才館出來站在台階下；法學院後面（背面到圍牆）改成不能走、兩棟之間用矮灌木收邊 |
| 第二十批：地圖邊界外的背景 | 技術完成；READY_FOR_ART_REVIEW | 校門外是公館（照公館區域的實際位置：人行道、羅斯福路車道線、對面整排騎樓店面＋後面較高的大樓、捷運出口、路燈、行道樹、機車）；法學院後面是中庭、圍牆、馬路、對面兩排公寓；總圖後面樹帶＋遠景系館；宿舍後面校內道路＋宿舍＋城市；地面延伸到 820 m 見方 |
| 第二十批：腳踏車減面（效能） | 技術完成 | 360° 盤點之後量 `render_stats`：校園畫面的三角形數從改前約 50 萬變成約 118 萬，主因是第十八批的淑女車（一台約 3,000 個三角形、全部投影，校園約 100 台）。輻條、輪圈、花鼓改成一張圓形貼圖、管子 4 邊、銀色小零件不投影：一台 884 個三角形、一排 7 個車位 15,316 → 4,816；校園畫面降到約 83–85 萬。近看外觀幾乎一樣（VISUAL_REVIEW 14.9） |
| 第二十批：公館這一側 | 技術完成；READY_FOR_ART_REVIEW | 從公館往校門裡看是椰林大道（柏油、黃線、高椰子樹、樹牆）、越過圍牆看到校史館、文學院、行政大樓；羅斯福路往東西延伸；校門兩側圍牆的磚紋不再拉成條紋 |
| 第二十批：視距與遠景 bug | FIXED | 霧的距離每幀被重設成畫質預設值（區域的視距沒生效）；遠景剪影會蓋住 118 m 以外的建築（總圖下半部被剪影蓋住）——兩個都修了 |

測試：見下面「測試結果」（全部是 Playwright 模擬，不是手機實機）。

### 這次完成（v9.3 第十六批，`294a0e8` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 傅鐘 | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 原本是 LEVEL_BLOCKOUT 的小鐘亭：圓台、四根細圓柱、綠色尖頂，鐘浮在半空中。換成校園套件的鐘亭（`CK.bell`）：兩層石材台基、四根方柱、梁、四坡瓦屋頂＋寶頂，木橫梁吊著銅鐘（看得到鐘舌），正面朝大道的「傅鐘」石碑；晚上前面兩根柱子腳下的地燈亮起、柱面一道暖光（VISUAL_REVIEW 第 8 節）。不是照真實傅鐘建模 |
| 路燈 | 技術完成；READY_FOR_ART_REVIEW | 校園、公館、溫州街共用的路燈原本是方棒燈臂＋方塊燈頭。換成鑄鐵柱座、收細的燈桿、彎曲燈臂、扁平燈罩＋朝下的燈罩玻璃；燈頭位置不變，晚上的光暈與地面光圈照舊 |

測試（Playwright 模擬，程式＝這次 push 的版本）：對照截圖 20 張（改前 8、改後 8、補拍 4）沒有 JS 錯誤；`campus_layout_nav` **37/37**（新增傅鐘石碑前可以走、傅鐘台基角與石碑不能走）；`gongguan_layout_nav` **46/46**；`nav_islands`（校園、公館）ALL CLEAR；`p0_movement` **31/31**；`movement_regression` **42/42**；`touch_flow_wenzhou` **21/21**。算圖負擔：路燈一盞 2 個 draw call（舊版 4 個；校園 23 盞、公館 18 盞）。

### 這次完成（v9.3 第十五批，`8192021` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 室內天花板 | 技術完成；功能完成（導航沒有改動，測試見下）；READY_FOR_ART_REVIEW | 七個室內原本都沒有天花板：鏡頭往上就是天空和雲，天花板的燈浮在天空裡。現在每個房間都有礦纖天花板；只從下面看得到，兩指拉遠、鏡頭超過天花板高度時仍是剖面視角（VISUAL_REVIEW 第 13 節） |
| 窗 | 技術完成；READY_FOR_ART_REVIEW | 原本是會變色的平面、固定在後牆，宿舍被書架擋住、教室在黑板旁邊、麵店疊在價目表上、便利商店在貨架後面。現在有鋁窗框、直框、窗台，窗外有天空、遠方樓房、行道樹（19:24 以後換成亮燈的夜景）；教室在左側牆，便利商店／麵店／書店在店面那一面；牆淡出時窗一起隱藏 |
| 便利商店 | 技術完成；READY_FOR_ART_REVIEW | 原本用書店的書架；換成白色金屬貨架＋商品與價格條（尺寸、位置、導航不變）。商品還是色塊，近看像書 |
| 宿舍 | 技術完成；READY_FOR_ART_REVIEW | 窗移到書桌上方、米色窗簾、檯燈、月曆、床頭的法律服務社招新傳單 |

算圖負擔（`tools/dev_scratch/render_stats.py`，`VIEWSET=interior`，出生點、預設鏡頭；改前 → 改後）：draw call 宿舍 82 → 88、教室 98 → 96、便利商店 77 → 80、麵店 81 → 81、書店 62 → 63、萬才館 64 → 67、總圖 230 → 233；三角形數每間增加不到 300。

測試（Playwright 模擬，程式＝這次 push 的版本）：室內截圖 9 張沒有 JS 錯誤；`nav_islands`（8 個室內）ALL CLEAR；`p0_movement` 31/31；`touch_flow_wenzhou` 21/21；`movement_regression` 第一次 41/42——A6「斜推沿牆滑動」失敗，原因是測試的前提（A5 撞牆後已經停在書桌旁的牆角），不是這批的改動（技術問題 #38）；A6 改成往空間比較大的那一側斜推（判定不變）後重跑 **42/42**；把玩家放在失敗時的位置驗證左前那一支 3/3（從 x=0.42 往左前沿牆滑到 x −1.03～−1.22）。

### 這次完成（v9.3 第十四批，`1b17f42` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 校門（校園＋公館） | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 原本是兩根磚盒子＋飄在柱子中間的校名板（背面空白）、沒有門；公館那一側的門房在**校外**人行道上而且走得過去。換成校園套件的 `CK.gate`：面磚門柱＋石材柱基柱頭＋門燈（晚上亮）、往校內打開的鑄鐵門、兩側矮牆、校名石牌（內外各一面）、門房在校內。開口寬度與互動點不變（VISUAL_REVIEW 第 8 節） |

測試（Playwright 模擬，程式＝這次 push 的版本）：`campus_layout_nav` 34/34（新增校門開口、走出校門的位置、門柱、門房）、`gongguan_layout_nav` 46/46（新增門柱、校門裡）、`nav_islands`（校園、公館）ALL CLEAR、`p0_movement` 31/31、`movement_regression` 42/42、`see_through` ALL PASS。

### 這次完成（v9.3 第十三批，`192434c` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 沈以安臉旁碎髮加長 | 技術完成；READY_FOR_ART_REVIEW | 原本臉旁的頭髮都停在下巴（正面看像短鮑伯）。臉旁往前掃的碎髮、臉前兩側的長髮束下半段拉長到下巴下緣（停在肩膀上緣以上，不碰針織衫），走路照樣擺動。比較接近參考圖 01，但仍不是「馬尾＋幾綹長碎髮」的樣子（側面頭髮是一整層；VISUAL_REVIEW 第 3 節） |

測試：`sim_hair.js char.heroine_01` PASS（髮尾不上翹）；遊戲內轉身照（正面／側面／背面／臉／走路）沒有 JS 錯誤；`touch_flow_wenzhou`（含和沈以安說話、坐下）21/21。
**第一版的錯誤**（截圖抓到）：`lengthen_side_locks` 第一版假設所有髮束共用同一組頂點座標，結果把 `ponytail_from_twintails` 拿掉的貓耳改回來了；改成每一束用自己的 POSITION、只把改過的換給原本共用的髮束後，貓耳沒有回來。

### 這次完成（v9.3 第十二批，`07bb5e5` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 公館捷運出口 | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 原本是方塊四柱雨棚。改成台北人行道上的長條玻璃亭：花崗石矮牆、玻璃側牆＋鋼框、微弧玻璃屋頂、只有文字的站名招牌（不用捷運標誌）、裡面看得到往下的電扶梯；晚上招牌和裡面亮（VISUAL_REVIEW 第 12 節） |
| 溫書瑀低馬尾會動 | 技術完成；READY_FOR_ART_REVIEW | 原本綁點以下那一束整個綁在頭骨上，走路、轉身時形狀完全不變。現在有三節彈簧骨（只和身體碰撞）：走路、轉身時跟著身體輕微擺動。**幅度小**（Node 模擬：末端左右約 ±1.3 cm、前後約 3 cm；彈簧放鬆也差不多，因為低馬尾貼在背上），一般鏡頭距離不太看得出來；站著的樣子和原本相同、沒有穿進背（VISUAL_REVIEW 第 4 節） |

測試（Playwright 模擬）：捷運出口——`gongguan_layout_nav` 43/43、`nav_islands`（公館）ALL CLEAR、`p0_movement` 31/31（只改了公館；其他回歸測試涵蓋的系統沒有動）。溫書瑀——`sim_hair.js char.heroine_05` PASS（髮尾不上翹）；實際遊戲轉身照（正面／側面／背面／臉／走路）與背面走路連拍，沒有 JS 錯誤。

### 這次完成（v9.3 第十、十一批，`c48f022` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 農業陳列館（洞洞館） | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 校門進來左手邊第一棟：從貼圖方盒（正面再貼一塊圓點格柵板）換成二樓四面圓洞鏤空外牆（晚上圓洞透出暖光）、一樓內退玻璃＋方柱、平屋頂寬屋簷、正面門＋台階＋館名（新的 `CK.pavilion`）。佔地不變。校園從此沒有 `W3.building` 方盒，所有建築的導航阻擋與鏡頭碰撞都來自套件（VISUAL_REVIEW 第 8 節） |
| 公館店面街 | 技術完成；功能完成（導航＋互動測試）；READY_FOR_ART_REVIEW | 原本是 8 個貼圖方盒＋另外搭的柱子、色塊招牌（LEVEL_BLOCKOUT）。改成和溫州街同一套的台北街屋：一整排 15 間 4–7 樓公寓（磁磚、鐵窗、冷氣、陽台、水塔），一樓是 3 m 深、**整排連續可以走的騎樓**（柱子落在店與店的分界），每間店有橫招牌、看得到店內的櫥窗，部分有直立招牌；騎樓天花板日光燈、招牌和店內傍晚漸亮。原本街到一半就結束，現在一路接到街尾（第 12 節） |
| 公館：店面和馬路之間的 30 m 空廣場 | FIXED | 整個南側往馬路搬 30 m：人行道剩約 15 m（路燈、機車、捷運入口、圓環花台都在人行道上），從校門走到店門口少走 30 m。麵店、茶行、書店、便利商店的 x 位置不變，互動點、從店裡出來站的位置、路人路線一起搬；舊存檔站在舊位置時讀檔後移到可走的地方（測試涵蓋） |
| 公館：往溫州街的巷口 | 技術完成；功能完成（實際按互動來回）；READY_FOR_ART_REVIEW | 原本「往溫州街」只是區域邊上地面的互動點。現在麵店西邊有 6 m 寬的巷口、轉角公寓（豆花・甜湯）、綠色「溫州街」路名牌、反光鏡；從溫州街回來站在巷口 |
| 公館：校門那一側 | FIXED | 舊版在校門圍牆**裡面**放了兩間「台大書局／公館小吃」方盒（等於蓋在校園裡），拿掉；改成從公館看回校門看得到校園：大王椰子、洞洞館的側面、校園的樹（和校園區域的配置一致） |
| 公館小東西 | 技術完成 | 車道線改到真的在路面上（原本有一條畫在人行道上）、加黃色雙中線、改成受光材質；北側路燈從車道上移到人行道邊；機車換成溫州街那套（三台一排，校門正前方只停一台）；麵店、茶行、書店門口外有立牌；從便利商店出來站在便利商店門口（原本站在藥局前面） |
| 騎樓柱子透視 | 技術完成 | 騎樓柱子（公館、溫州街茶飲店）也加入樹幹透視：擋在鏡頭和祐廷之間時變成網點透空 |
| 換區域途中讀檔只讀一半（#37） | FIXED（Playwright 重現＋修正後同順序重跑） | 換區域淡出淡入還沒結束就讀檔時，存檔內容被換掉、人卻沒移動（下次自動存檔可能把一區的座標記在另一區名下）。現在讀檔會先等換區域結束；換區域時出錯也不會讓之後再也換不了區域 |

測試（Playwright 模擬，程式＝這次 push 的版本；測試期間沒有同時跑其他瀏覽器工作）：`gongguan_layout_nav`（新）43/43、`campus_layout_nav` 29/29、`nav_islands`（校園、公館、溫州街）ALL CLEAR、`p0_movement` 31/31、`movement_regression` 42/42、`touch_flow_wenzhou` 21/21、`see_through` ALL PASS；`node tools/dev_scratch/spring_sim/sim_hair.js char.heroine_05` PASS。第十批（洞洞館）單獨跑過 `campus_layout_nav` 29/29、`nav_islands`（校園）ALL CLEAR；其餘回歸是第十＋十一批合起來跑的。

算圖負擔（`render_stats`，一幀、參考用）：公館店面街 draw call 122 → 135、三角形 11.9 萬 → 26.9 萬；公館出生點往店面 draw call 187 → 165、三角形 15.2 萬 → 33.0 萬（和校園鏡頭的 43–46 萬同一級）。校園、溫州街鏡頭不變（路人隨機，數字差 ±15%）。手機實機效能未測。

### 這次完成（v9.3 第九批，`ef11bb4` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 男一舍（宿舍外觀） | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 每天出門第一眼看到的建築：從貼圖方盒換成淺灰米色面磚、方窗、平屋頂、石材小門廊（男一舍招牌）。宿舍沒有拱廊，套件多了「一樓正面有窗、中間是大門」的版本。佔地、門口位置不變；「回宿舍」的互動範圍涵蓋門廊到門口 |
| 社會科學院 | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 從貼圖方盒換成現代白色系館：白色粉光牆、每層橫向長窗、樓板白線、一樓玻璃大廳＋雨遮（新的 `CK.modern`）；門前的白色樹狀柱保留；晚上長窗分段亮 |

測試（Playwright 模擬，程式＝這次 push 的版本）：`campus_layout_nav` 29/29、`nav_islands`（校園）ALL CLEAR、`p0_movement` 31/31、`movement_regression` 42/42、`touch_flow_wenzhou` 21/21、`see_through` ALL PASS（測試期間沒有同時跑其他瀏覽器工作）。

### 這次完成（v9.3 第八批，`6e6c76d` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 黃昏調色提案 | **預設不開；等使用者決定** | 網址加 `?grade=golden` 才會用：17:00–18:00 的陽光更橘更亮、陰影裡偏暖杏色、空氣有暖橘的霧、天空下緣金黃。校園開闊處差別明顯；溫州街窄巷在建築陰影裡只稍微變暖，參考圖 07「整條街被夕陽照亮」做不到（太陽在西邊被公寓擋住）。比較圖與選項 A／B／C 見 VISUAL_REVIEW 第 10 節 |
| 霖澤館顏色 | 技術完成；READY_FOR_ART_REVIEW | 從紅磚改成淺褐面磚：第七批和隔壁萬才館都是紅磚，並排看起來像同一棟 |
| 晚上窗戶不全亮 | 技術完成；READY_FOR_ART_REVIEW | 校園建築傍晚、晚上大約三成窗戶不亮（每扇窗固定，不會閃）。原本每一扇都亮，像每間教室都開燈 |
| 陳語彤領口的黑色小蝴蝶結 | **NOT FIXED；BLOCKED_BY_ART_ASSET** | 原因找到了（#34：連帽上衣改的領口離胸口 5–6 cm，近景看得到衣服裡面）。把領口往脖子收可以讓它消失，但三種收法都讓領口變成一大塊深色，比原本更醜，沒有採用；要真正修好需要一件真的圓領 T 恤模型 |
| 沈以安細手錶 | 不做 | 試做之後發現她的針織衫袖子蓋到手背，手錶在遊戲裡看不到 |
| 觸控流程測試的走法 | FIXED（#36） | 測試走到沈以安旁邊時，偶爾停在剛好超過對話距離的地方；改成不夠近就再走近一點，判定標準不變 |

測試（Playwright 模擬，程式＝這次 push 的版本）：`see_through` ALL PASS、`campus_layout_nav` 29/29、`p0_movement` 31/31、`movement_regression` 42/42；`touch_flow_wenzhou` 第一次 19/21（#36，測試走法），修正測試走法後單獨重跑兩次都 21/21。黃昏提案（`?grade=golden`）只截圖、沒有跑回歸測試（預設不開，程式路徑只在網址有參數時才不同）。

### 這次完成（v9.3 第七批，`d59390c` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 樹幹不再擋住祐廷 | FIXED（Playwright 量測＋截圖） | 走在椰林大道、溫州街時，鏡頭和祐廷之間的大王椰子、行道樹樹幹、電線桿，會在祐廷周圍變成網點透空，看得到人；鏡頭位置、碰撞都沒改。離鏡頭很近的樹幹也會透空（原本會整片擋住畫面）。演出鏡頭、室內不受影響（#35） |
| 霖澤館、萬才館 | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 原本是貼圖方盒。現在和其他台大建築同一套語彙，但做成戰後新系館的樣子：面磚、方窗、平屋頂、一樓拱廊、平頂門廊（館名在門廊上）。佔地、門口位置不變 |
| 拱廊走得進去 | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 行政大樓、文學院、校史館、總圖、霖澤館、萬才館的一樓拱廊可以走進去，柱子有碰撞；門口互動範圍從門廊前緣涵蓋到拱廊裡的門（原本互動點在門廊外，走到門前反而按鈕消失）。拱廊裡鏡頭不會被拉到臉前面、也不會穿到樓上 |
| 門廊和拱廊對齊 | 技術完成 | 門廊兩側的牆剛好落在拱廊的柱子上（原本行政大樓、校史館、總圖、萬才館差半個開間，從門廊看進去拱的正中間有一根柱子） |
| 林芷若袖口 | 技術完成；READY_FOR_ART_REVIEW | 袖口的荷葉邊（手腕收口之後再張開、把手蓋住的喇叭狀布）剪掉，留收口當袖口，手完整露出（參考圖是一般袖口）。荷葉邊綁在袖口專用的次要骨頭上，原本的剪袖子工具看不到它，另外處理；剪掉後袖口邊緣的手腕皮膚原本會被當成「被衣服蓋住」刪掉，也一併修正 |
| 陳語彤領口中間的小蝴蝶結 | **NOT FIXED**（第二次修錯） | #34：胸口貼圖畫的 V 形陰影用下方素面布料蓋掉——貼圖乾淨了，遊戲裡還在。放大看，黑色形狀在領口邊緣上方、蓋在皮膚前面；下一個推測是卡通描邊，先在遊戲裡關掉 T 恤描邊驗證 |

測試（Playwright 模擬）：`see_through` ALL PASS（關掉透視時祐廷只有 3.7–4.2% 看得到，打開後 85–100%）、`campus_layout_nav` 29/29、`nav_islands`（校園、溫州街）ALL CLEAR、`p0_movement` 31/31、`movement_regression` 42/42、`touch_flow_wenzhou` 21/21；林芷若、陳語彤新模型 `sim_hair` PASS。效能：同樣的校園鏡頭，三角形數比改版前多 13–17%（比第六批少約 5 萬），draw call 不變（VISUAL_REVIEW 第 8 節的表）。

### 這次完成（v9.3 第六批，`b467007` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 校園四棟主要建築（行政大樓、文學院、校史館、總圖） | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 原本是貼圖方盒＋幾根柱子。現在是面磚／紅磚牆、立體的半圓拱窗（石材窗框、窗台、窗櫺）、一樓往內退的連續拱廊、往前突出的石材門廊（文學院、校史館、總圖有三角山牆，行政大樓是陽台欄杆）、四坡屋頂；總圖是五連拱的高門廊＋中央塔樓。依台大老建築的共同特徵做成一套程式化的建築套件（`src/campuskit3d.js`），**不是照真實立面逐棟建模**。前後對照見 VISUAL_REVIEW 第 8 節 |
| 沈以安的托特包 | 技術完成；READY_FOR_ART_REVIEW | 上緣在兩條提帶之間往下垂、底部比較鼓、下方兩角是圓的、布面有幾道淺皺褶（原本是硬的長方形，像紙板）。改變不大，近看才看得出來（VISUAL_REVIEW 第 3 節） |
| 陳語彤領口中間的小蝴蝶結 | **NOT FIXED** | 第一次判斷錯（#34）：改了領口上緣一圈窄布的貼圖座標，遊戲內臉部近景確認蝴蝶結還在。真正原因已找到（胸口貼圖畫的 V 形陰影），第七批修 |
| 校園建築閃爍的白線 | FIXED | 拱廊和門廊頂端不再有一條閃爍的白色虛線（#33） |

測試（Playwright 模擬）：校園建築：`campus_layout_nav` 29/29、`nav_islands`（校園）ALL CLEAR、`p0_movement` 31/31、`movement_regression` 42/42、`touch_flow_wenzhou` 21/21，全部 PASS。之後又修了 #33 的白線（只改天花板和門廊柱子的幾何，導航不變），最終版再跑一次 `campus_layout_nav`：見下方。陳語彤新模型只改了 14 個三角形的貼圖座標（沒有改幾何、骨架、頭髮），`sim_hair` PASS；遊戲內臉部近景確認蝴蝶結**還在**（#34，第七批修）。

### 這次完成（v9.3 第五批，`5bfac96` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 路口往北的街景 | 技術完成；READY_FOR_ART_REVIEW | Café 北側公寓前停一排機車（車頭朝建築）、西側一根電線桿和電線（參考圖 07 的街景）。機車和電線桿有碰撞 |
| 高子晴的帽子 | 技術完成；READY_FOR_ART_REVIEW | 臉部近景時，臉頰兩側頭髮縫隙裡的白色毛邊不見了（#32） |

測試（最終版，Playwright 模擬）：街景：`campus_layout_nav` 29/29、`p0_movement` 31/31、`movement_regression` 42/42、`touch_flow_wenzhou` 21/21、`nav_islands`（溫州街）ALL CLEAR；高子晴新模型：`sim_hair` PASS、`p0_movement` 31/31、`movement_regression` 42/42、`touch_flow_wenzhou` 21/21。全部 PASS。

### 這次完成（v9.3 第四批，`27f900d` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| Café 門前的紅磚人行道、路名牌 | 技術完成；READY_FOR_ART_REVIEW | 兩點半 Café 門前從柏油路面變成紅磚人行道（外緣一條低路緣，參考圖 07）；路口有綠色的「溫州街 Wenzhou St.」路名牌。人行道是平的，不改導航；路名牌的柱子有 0.15 m 的碰撞 |
| 黃昏調整套用到其他區域 | 已截圖確認 | 校園 17:30 鋪面偏暖橘、椰子樹影子拉長，沒有過曝；公館仍是方盒 placeholder（依規則先不打磨） |

測試（最終版，Playwright 模擬）：`campus_layout_nav` 29/29、`p0_movement` 31/31、`movement_regression` 42/42、`touch_flow_wenzhou` 21/21、`nav_islands`（溫州街）ALL CLEAR，全部 PASS。

### 這次完成（v9.3 第三批，`e094b32` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 黃昏人物輪廓光 | 技術完成；READY_FOR_ART_REVIEW | 17:00–18:40 在室外，人物的頭髮邊緣有暖金色的光（像參考圖 07 被夕陽從後面照到），上衣邊緣淡淡一層；白天、晚上、室內不會出現。褲子、鞋子、皮膚、臉不加：試過全身都加，深色褲子會變成偏棕的塑膠光澤，所以拿掉 |
| 陳語彤領口 | 技術完成；READY_FOR_ART_REVIEW | 圓領兩側原本留著兩片帽口的尖角（臉部近景看起來是脖子旁邊的深色尖片），現在領口是平順的圓領（#30） |
| 移動：窄縫卡住 | FIXED（Playwright＋直接重現） | 宿舍書桌後面、床頭旁，以及溫州街兩處比人窄的縫，不會再把人卡住；被卡在窄處往前推時，會往左右偏一點找路出來（#31） |

測試（最終版，Playwright 模擬）：`campus_layout_nav` 29/29、`p0_movement` 31/31、`movement_regression` 42/42（A 組宿舍另外多跑 3 次都 7/7）、`touch_flow_wenzhou` 21/21、`sim_hair` PASS、`nav_islands` 11 個區域 ALL CLEAR，全部 PASS。

### 這次完成（v9.3 第二批，`ad76109` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 頭髮被甩起來（所有 VRM 角色，林芷若最明顯） | FIXED（遊戲內走路照＋Node 模擬驗證） | 走路、轉身、讀檔瞬移、手機卡頓時，長髮不再在耳朵高度往兩側翹。上一批以為是手臂碰撞體，改了沒用；真正原因見技術問題 #25 |
| 林芷若：眼鏡 | FIXED | 側面看不再有兩根細線從臉前面伸出去（鏡腳方向反了，#26） |
| 林芷若：領口 | 技術完成；READY_FOR_ART_REVIEW | 荷葉邊高領剪成圓領，看得到脖子和鎖骨（參考圖是開領上衣） |
| 溫書瑀：低馬尾 | 技術完成；READY_FOR_ART_REVIEW | 頭髮沿著頭收到後頸、深色髮圈、一束馬尾沿背垂下，臉旁前髮剪到下巴。原本從側面看是一片往後翹的長直髮 |
| 溫書瑀：長袖 | 技術完成；READY_FOR_ART_REVIEW | 白襯衫袖子接長到前臂、反摺袖口（參考圖）。VRoid 樣本只有短袖，袖管是程式接上去的 |
| 黃昏光線 | 技術完成；**效果很小，需要使用者看過** | 17:00–18:00 的陽光與天空略調亮、偏暖，雲的陰影不再偏紫。實際畫面平均亮度只多約 3%，Café 前的街道大部分在建築陰影裡，修改前後幾乎看不出差別。要接近參考圖的金色光，需要人物輪廓光與整體色調等較大的改動（下一步，做之前先給使用者看） |
| 晚上的 Café 門口 | 技術完成；READY_FOR_ART_REVIEW | Café 櫥窗的暖光灑到騎樓和路面；路口往北的路多一盞路燈。原本 Café 前的路面晚上是一片均勻的暗色 |
| 路口往北延伸 | 技術完成；READY_FOR_ART_REVIEW | 從 Café 前往北看，是延伸的路、兩側公寓、行道樹和天空。原本是一棟 6 樓公寓的牆；可走範圍用道路施工護欄與三角錐擋住，不是隱形牆 |
| 日式老屋屋頂 | 技術完成 | 寄棟（四坡）屋頂。原本是金字塔形屋頂，上面還浮著一根屋脊 |
| 校園長距離點地移動 | FIXED | 從霖澤館點地到校門走得到（#24） |
| 舊存檔安全（預防） | 技術完成 | 讀舊存檔被移位時，如果移到的空地走不到區域出生點，改放到出生點（#27）。目前的三個測試位置用舊程式也走得到，這是預防 |
| Café 三時段照片 | 重拍 | 第一批拍的照片鏡頭在南側建築裡面，右邊三分之一是一片灰牆（#28）；換到路口重拍 |

### v9.3 第一批（`ad76109`）


| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 校園依台大校總區平面圖重排（使用者 2026-10-09） | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 走椰林大道往東，盡頭就是總圖（有三角山牆的門廊）；傅鐘在大道南側、後面是行政大樓，文學院在正對面；校史館、農業陳列館靠大門；文學院北邊有醉月湖（湖心亭走得上去、睡蓮、湖畔長椅）；小椰林道兩排椰子樹通到法學院。決策 D23、D25 |
| 大王椰子、闊葉樹 | 技術完成；READY_FOR_ART_REVIEW | 椰林大道和小椰林道換成筆直灰白樹幹、綠色葉鞘、拱形羽狀葉的大王椰子（原本是彎曲的椰子樹）；校園和公館的方塊葉樹、針葉樹換成闊葉樹；大道中間不像台大的花圃分隔島拿掉，兩側改成杜鵑綠叢 |
| 舊存檔安全 | 技術完成 | 霖澤館、宿舍、校門座標沒動；舊存檔如果站在改版後的新建築或湖裡，讀檔會被移到最近的空地（再不行回到區域出生點） |
| 溫書瑀 | PARTIAL | 背心的 V 領線和描邊拿掉、髮色真的變深棕（原本材質乘了深藍色）、拿掉 X 髮夾、褲子改直筒。仍是短袖（參考圖是長袖反摺），低馬尾不明顯 |
| 高子晴 | 技術完成；READY_FOR_ART_REVIEW | 拿掉頭頂呆毛、臉頰科幻花紋、手上手套殘影、短褲中間垂下的布片；黑色短褲（參考圖）；眉毛眼線從淺藍灰改深棕 |
| 林芷若 | PARTIAL | 頭頂翹起的側馬尾殘段拿掉、眼睛的青色反光換成白色、眉毛改深色；頭髮仍是直的（微捲 BLOCKED_BY_ART_ASSET） |
| 陳語彤 | 技術完成；READY_FOR_ART_REVIEW | T 恤改成圓領（原本是帽子剪掉後的漏斗領）、下擺和袖口平整、黑髮不再偏藍、眉毛改深色、拿掉髮夾、頭髮拉長接近齊肩 |
| 沈以安 | 技術完成；READY_FOR_ART_REVIEW | 針織衫領口改成圓領（原本像襯衫領片） |
| 人物配件顏色 | 技術完成 | 吉他袋、後背包不再是全黑剪影（看得到布紋、拉鍊） |
| 中午淺色衣服過曝 | 技術完成；**亮度需要使用者看過** | 米白針織衫、淺灰上衣在中午不再曝成全白 |
| 日式老屋 | 技術完成；READY_FOR_ART_REVIEW | 圍牆降到 1.15 m、門開著；從巷子看得到木造外觀、有窗框的格子窗、玄關（小屋頂、木格拉門、門燈）、踏石、石燈籠、矮籬 |
| 小公園 | 技術完成；READY_FOR_ART_REVIEW | 鋪面步道＋圓形小廣場、大樹＋可以坐的樹圍座椅、兩側灌木、單槓、公園路燈（晚上照亮地面）、長椅上睡覺的橘貓 |


### 測試結果

**第二十四批（萬才館照新照片、國青中心、黑森林＋水池）**——Playwright（Chromium SwiftShader、iPhone 390×844 模擬、CDP 觸控）的模擬，**不是手機實機**＋ Node；一次只跑一個瀏覽器工作。

| 測試 | 結果 |
|---|---|
| `node tools/dev_scratch/kit_nav_check.js`（建築正面外 2.2 m 以下的頂點都要在導航阻擋裡；陽台底下可以走） | **ALL PASS**（霖澤館 0、萬才館 0；同一個工具對第二十一批以前的套件仍然抓得到 73 個） |
| `tests/campus_layout_nav.py` | **67/67 ALL PASS**（新增：萬才館一樓入口走得到、方形低樓原本的位置走得到；新樓梯、樓梯頂端平台、凸出量體、弧形量體（舊台階與平台的位置）不能走；站在最早門口的舊存檔讀檔後被移到走得到的地方） |
| `tools/dev_scratch/nav_islands.py campus` | **ALL CLEAR**（1 個連通區、0 個小孤島：新樹林、水池、樓梯、花台沒有造成窄縫） |
| `tests/zone_transitions.py` | **37/37 PASS＋4 INFO**（既有）；萬才館：從陽台下的一樓入口 (93.8,-100.6) 進去，出來站在 (93.8,-98.4)（距預期 0.00 m），不會又跳出進門按鈕，走得回霖澤館前 |
| `tests/gongguan_layout_nav.py` | **46/46 ALL PASS** |
| `tests/p0_movement.py` | **34/34 ALL PASS** |
| `tests/movement_regression.py` | **42/42 PASS** |
| `tests/touch_flow_wenzhou.py` | **21/21 ALL PASS** |
| `tests/see_through.py` | **ALL PASS** |
| `tools/dev_scratch/render_stats.py`（參考） | 校園三個鏡頭 83.3–94.2 萬個三角形、214–271 draw call（萬才館 1.29 萬 → 2.97 萬個三角形：凸窗框；路人數量隨機，draw call 本來就差 ±25） |

**第二十三批（椰林大道兩側樹冠）**——Playwright 模擬（不是手機實機）＋ Node。樹幹、導航沒動，只跑和校園、樹有關的測試。

| 測試 | 結果 |
|---|---|
| Node：`TK.tree` 不加選項時改前改後頂點完全一樣；加寬的樹後面再建的樹也完全一樣（共用亂數沒被打亂） | PASS |
| `tests/campus_layout_nav.py` | **63/63 ALL PASS** |
| `tests/gongguan_layout_nav.py` | **46/46 ALL PASS** |
| `tests/see_through.py`（樹幹透視） | **ALL PASS** |
| `tests/p0_movement.py` | **34/34 ALL PASS** |
| `tools/dev_scratch/render_stats.py`（參考） | 校園三個鏡頭 85.2–89.5 萬個三角形（第二十一批 83.5–84.8 萬，多 2–5%）、223–261 draw call（路人數量隨機，公館沒改也差 ±25） |

**第二十二批（柏油路改淺灰、入夜變暗）**——全部是 Playwright（Chromium SwiftShader、iPhone 390×844 模擬、CDP 觸控）的模擬，**不是手機實機**；一次只跑一個瀏覽器工作。

| 測試 | 結果 |
|---|---|
| 同鏡頭量測路面亮度（11:00 受光處；照片 157–172） | 椰林大道 136 → **170**、舟山路 122 → **170**、公館 129 → **173**、溫州街巷子（陰影裡）48 → 111；20:30 溫州街路面中位數 58（原本）→ 81、路燈下過曝 0% |
| `tests/campus_layout_nav.py` | **63/63 ALL PASS** |
| `tests/gongguan_layout_nav.py` | **46/46 ALL PASS** |
| `tests/zone_transitions.py` | **37/37 PASS＋4 INFO**（既有） |
| `tests/p0_movement.py` | **34/34 ALL PASS** |
| `tests/movement_regression.py` | **42/42 PASS** |
| `tests/touch_flow_wenzhou.py` | **21/21 ALL PASS** |
| `tests/see_through.py` | **ALL PASS** |

**第二十一批（太陽方向、萬才館大台階、椰林大道路面）**——全部是 Playwright（Chromium SwiftShader、iPhone 390×844 模擬、CDP 觸控）的模擬，**不是手機實機**；一次只跑一個瀏覽器工作。

| 測試 | 結果 |
|---|---|
| `tools/dev_scratch/kit_nav_check.js`（**新**，Node：霖澤館、萬才館正面外每個高於地面的頂點都要在導航阻擋裡） | 改前（`f772e73`）萬才館 73 個在阻擋外（石牆外側的台階）→ 改後兩棟都是 **0 個，ALL PASS** |
| `tests/campus_layout_nav.py` | **63/63 ALL PASS**（萬才館台階、平台不能走；台階下的門口、台階旁的舊門口走得到；站在舊門廊的舊存檔讀檔後移到台階旁、走得到） |
| `tests/gongguan_layout_nav.py` | **46/46 ALL PASS** |
| `tools/dev_scratch/nav_islands.py`（校園、公館） | **ALL CLEAR**（兩區都是 1 個連通區、0 個小孤島） |
| `tests/zone_transitions.py` | **37/37 PASS＋4 INFO**（INFO 是既有的「室內出生點在離開按鈕範圍裡」）；從萬才館出來站在 (79.5,-92.2)，距預期 0.00 m |
| `tests/p0_movement.py` | **34/34 ALL PASS** |
| `tests/movement_regression.py` | **42/42 PASS**（沒有 console 錯誤） |
| `tests/touch_flow_wenzhou.py` | **21/21 ALL PASS** |
| `tests/see_through.py` | **ALL PASS** |
| `tools/dev_scratch/render_stats.py`（參考，不判定） | 校園三個鏡頭 83.5–84.8 萬個三角形、223–236 draw call（第二十批 83.4–85.2 萬、222–236：台階多約 2,800 個三角形，幾乎沒變）；溫州街 24 萬、155；公館 32–41 萬、151–201 |
| 改前改後截圖（太陽 16 個鏡頭、台階 6 個、路面 3 個） | 見 VISUAL_REVIEW 第 15 節；和使用者照片的並排直接傳給使用者 |

**第十七～二十批（校園全面改造）**——全部是 Playwright（Chromium SwiftShader、iPhone 390×844 模擬、CDP 觸控）的模擬，**不是手機實機**；一次只跑一個瀏覽器工作。

| 測試 | 結果 |
|---|---|
| `tests/campus_layout_nav.py`（地點站得住、從霖澤館前走得到；萬才館新門口；湖面、建築內、**台階、平台、穿堂、萬才館低樓、法學院後面**不能走；舊存檔站在舊門廊、平台、建築背面窄縫時讀檔會被移到走得到的地方；沒有 JS 例外） | **63/63 ALL PASS**（拿掉造成孤島的那棵樹前後各跑一次） |
| `tests/gongguan_layout_nav.py` | **46/46 ALL PASS** |
| `tools/dev_scratch/nav_islands.py`（校園、公館、萬才館、教室、宿舍、總圖） | 第一次：校園 1 個 SUSPECT（(48.6,-16.6)，0.04 m²：大道北側樹牆的一棵樹和停車架東端之間的窄縫，第十八批造成）→ 拿掉那棵樹 → **ALL CLEAR** |
| `tests/p0_movement.py`（霖澤館台階下、舊存檔站在舊門口、宿舍、公館店門口、校門外、溫州街：觸控搖桿上下左右、跑、點地、事件鎖定、讀檔後移動） | **34/34 ALL PASS** |
| `tests/movement_regression.py`（A 宿舍走跑撞牆滑牆／B 坐下起身／C ADV 後移動／D 存讀檔後移動／E 各區域出生、走跑轉身、互動、進出） | **42/42 PASS** |
| `tests/touch_flow_wenzhou.py`（只用觸控：溫州街 → Café 進出 → 存檔 → 重新整理讀回 → 再走） | **21/21 ALL PASS** |
| `tests/see_through.py`（樹幹透視） | **ALL PASS** |
| `tests/zone_transitions.py`（**新**：校園 ↔ 霖澤館教室、萬才館、總圖、宿舍、公館，進出各一次） | **37/37 PASS＋4 INFO**。前兩次失敗是測試本身的問題，判定標準沒有放寬：第一次沒有像玩家一樣點掉「今天沒有民法總則」的旁白（對話框一直開著，後面的互動都被擋住）；第二次在換區域後 0.5 秒的淡入還沒結束就按下一個入口（遊戲在淡入時不接受換區域，真人也按不到）。4 個 INFO：進入室內時出生點就在「離開」按鈕的範圍裡（教室、萬才館、總圖、宿舍都是，既有設計，不是這次的改動） |
| `tools/dev_scratch/view_audit.py`（360° 盤點，人工看圖） | 改前（`6b5d1cd`）33 個位置裡校園邊緣、校門外、公館往校門裡都看得到地面盡頭或空白帶；**改後 33 個位置都沒有**（VISUAL_REVIEW 第 14 節） |
| `tools/dev_scratch/render_stats.py`（參考，不判定；畫一幀的三角形數含陰影） | 校園三個鏡頭：改前（`6b5d1cd`）47–53 萬個三角形、160–204 draw call；第十八～二十批（第一版腳踏車）118–119 萬、223–236；**腳踏車減面之後 83–85 萬、222–236**（溫州街、公館和改前差不多）。減面之後重跑 `p0_movement` 34/34 ALL PASS |

先前批次的結果（保留）：

| 測試 | 對象 | 結果 |
|---|---|---|
| `tests/campus_layout_nav.py`（17 個地點走得到、8 個點不能走、3 個舊存檔位置讀檔後站得住**而且走得到霖澤館前**、沒有 JS 例外） | 最終版 | **29/29 ALL PASS** |
| `tests/p0_movement.py`（iPhone 模擬、CDP 觸控搖桿，各區域上下左右） | 最終版 | **31/31 ALL PASS** |
| `tests/movement_regression.py`（A 宿舍／B 坐下起身／C ADV／D 存讀檔／E 各區域） | 最終版 | **42/42 PASS** |
| `tests/touch_flow_wenzhou.py`（只用觸控：溫州街 → Café 進出 → 存到欄位 → 重新整理讀回 → 再走） | 最終版 | **21/21 ALL PASS** |
| 同上四項 | A* 修正後、頭髮修正前 | 29/29、31/31、42/42、21/21，全部 PASS |
| Node 模擬（three.js＋three-vrm＋遊戲的 `CHAR`，不算圖）：0.3 秒一幀、人物移動時的髮尾高度 | 頭髮修正 | 修正前林芷若髮尾平均比站著高 12–16 cm（翹起來）；修正後六位角色走路與站著相差 ≤ 6 mm |

「最終版」＝這次 push 的程式與模型（含頭髮修正、林芷若與溫書瑀新模型、黃昏光線微調、路燈）。全部是 Playwright（Chromium SwiftShader）模擬，**不是手機實機**。

### 正在做／接下來

1. **等使用者看**：第 14、15 節的照片比較（霖澤館、萬才館、椰林大道）與 360° 盤點；使用者若能補照片（背面、側面、整棟正面、萬才館入口位置），照片看不到的推測部分可以再修（清單在 VISUAL_REVIEW 14.7）。
   第二十一批改了戶外太陽方向（D29）：中午的畫面全部有變（朝南的牆變亮、朝北的牆變背光），使用者如果覺得某個場景太暗，再個別調（不改回北邊的太陽）。
2. **等使用者決定**：黃昏調色提案 A／B／C（VISUAL_REVIEW 第 10 節）；洞洞館夜間發光。
3. 效能：校園畫面三角形數仍比改前多（主要是第十八批的系館、樹牆、背景）；如果手機實測卡，先降遠景（背景樹的數量、第二排大樓）、不降主要人物。
4. 進入室內時出生點就在「離開」按鈕範圍裡（教室、萬才館、總圖、宿舍；`zone_transitions` 的 INFO）：要不要把出生點往房間裡移一點，屬於小的操作手感調整，還沒改。
5. 還是方塊造型的小東西：公告欄、花台、自動販賣機；背景馬路上沒有車。
6. 椰林大道兩側：第二十三批把樹冠加寬加密（樹幹不動）；文學院、校史館、傅鐘廣場前面刻意留的空隙還是看得到建築。如果要更像照片（樹更多、更低、底下有灌木），要在不擋入口與車架的地方補樹幹，補完跑 `nav_islands.py`。
7. 人物：林芷若微捲髮、沈以安高馬尾、臉（BLOCKED_BY_ART_ASSET）；室內第二輪（家具細節、教室設備、窗外景）。

## 進度總表

| 項目 | 目前狀態 | 正在修改什麼 | 已完成什麼 | 下一步 | 相關檔案 |
|---|---|---|---|---|---|
| 男性角色 | PARTIAL | — | 祐廷：VRoid CC0「HairSample_Male」改作（自然黑短髮、拿掉呆毛、淺灰圓領上衣、深灰直筒褲、白球鞋、黑色後背包配件）；阿哲：「Sakurada Fumiriya」＋移植連帽上衣；男性路人底模 2 種 | 男性臉型只有 2 種（樣本限制）；祐廷頭髮更厚、更柔需要新的髮型素材（BLOCKED_BY_ART_ASSET） | `tools/vroid_build.py`、`assets/models/char/vroid_yuting.vrm`、`vroid_zhe.vrm`、`vroid_npc_m1.vrm`、`vroid_npc_m2.vrm`、`src/props3d.js` |
| 女性角色 | PARTIAL | 細修（陳語彤領口、林芷若髮型） | 五位女主角各有自己的模型與服裝（不是路人換色）：沈以安（單一高馬尾、米白針織衫、藍灰寬褲、樂福鞋、托特包）；林芷若（黑直髮、細框眼鏡、米色亞麻上衣改圓領、米灰寬褲、銀色小耳環、工作時圍裙）；陳語彤（黑髮接近齊肩、深灰圓領 T 恤、牛仔褲、後背包）；高子晴（深棕短髮、淺灰連帽外套、黑短褲、白球鞋、吉他袋）；溫書瑀（深棕低馬尾＋髮圈、白襯衫反摺長袖、卡其直筒褲、判決節錄資料夾）。轉身照見 VISUAL_REVIEW 第 2–5 節 | 臉是 VRoid 動畫臉（BLOCKED_BY_ART_ASSET）；林芷若微捲髮（BLOCKED_BY_ART_ASSET）；陳語彤領口兩側的深色內層；高子晴帽口白色髮尾 | `tools/vroid_build.py`、`assets/models/char/vroid_heroine_0[1-5].vrm`、`src/props3d.js`、`src/character3d.js`（`MODEL_PROPS`） |
| VRM 系統 | 技術完成 | — | parse 一次＋骨架 clone 共用 GPU 資源；VRM 0.x 朝向與姿勢軸向；身高計算；換色（材質顏色相乘）；路人不投即時陰影改圓影；NPC frustum culling；載入失敗在 `?dev` 顯示；彈簧骨在人物座標系、固定小步長，更新前先更新 world matrix（#25）；配件掛在骨頭上（`src/props3d.js`） | 動畫仍是 Mixamo（授權疑慮，見 REVIEW_NOTES）；clone 沒有彈簧骨與表情（路人頭髮不會晃）；手機實機效能未測 | `src/assets3d.js`、`src/character3d.js`、`src/engine3d.js`、`src/props3d.js` |
| 溫州街 | PARTIAL | 三時段光影 | 10 m 巷道、20+ 棟台北公寓（磁磚、鐵窗、冷氣、陽台、雨遮、水塔、加蓋）、店面（含兩點半 Café：有深度的室內、木窗框、壁燈、爬藤）、日式老屋（圍牆降低、玄關、寄棟屋頂、石燈籠）、小公園（鋪面、大樹＋樹圍座椅、路燈、睡覺的貓）、騎樓、死巷、電線桿＋電線＋路燈、反光鏡、機車、盆栽、行道樹；Café 在東端路口，路口往北延伸到天空；白天／黃昏／夜晚光線；NavGrid 與鏡頭碰撞同步 | 騎腳踏車的 NPC 很粗糙（W3.bike）；雨天地面反光未做；只有 Café 能進，其他店是「看櫥窗」；日式老屋側面與背面是平的雨淋板 | `src/townkit3d.js`、`src/zones3d.js`（`buildWenzhou`） |
| 校園 | PARTIAL | 第十七～二十一批：照使用者照片改椰林大道、霖澤館、萬才館（第二十一批再比對：萬才館大台階、路面、太陽方向）；補空地；邊界外的背景 | 依臺大校總區平面圖配置（D23、D25）；大王椰子（約 20 m）、大樹牆、闊葉樹、醉月湖（湖心亭走得上去）；行政大樓、文學院、校史館、總圖換成台大風格的外觀；**椰林大道柏油路＋黃色虛線（照片）**；**霖澤館穿堂、萬才館弧形大台階（照片，`CK.lawhall`）**；大道兩側與舟山路補 8 棟沒有名字的系館、停車架與淑女車；**地圖邊界外是走不到的背景**（D27：校門外的公館、北側馬路與公寓、東南的遠景系館與樹林）；360° 盤點 33 個位置改後沒有空白（VISUAL_REVIEW 第 14 節） | 照片沒拍到的部分是推測（D28）；遠景是方盒＋貼圖；馬路上沒有車；公告欄、花台、販賣機仍是方塊造型 | `src/zones3d.js`（校園）、`src/campuskit3d.js`（`lawhall`）、`src/townkit3d.js`（`bgCity`）、`tests/campus_layout_nav.py`、`tests/zone_transitions.py`、`tools/dev_scratch/view_audit.py` |
| 公館 | PARTIAL | 第二十批：從公館看校園那一側、街道往東西延伸 | 15 間台北公寓、整排連續騎樓、招牌與櫥窗、騎樓日光燈、人行道 15 m（路燈、機車、捷運入口、圓環花台）、巷口（轉角公寓、路名牌、反光鏡）；**從校門往裡看是椰林大道、越過圍牆看到校園建築（照校園位置換算）、羅斯福路往東西延伸（後面一排較高的大樓）**；導航與互動測試 `tests/gongguan_layout_nav.py` | 店名虛構、不是照真實街景建模；只有麵店、書店、便利商店進得去；馬路上沒有車 | `src/zones3d.js`（公館）、`src/townkit3d.js`、`src/story3d.js`（路人路線）、`tests/gongguan_layout_nav.py` |
| NPC 動畫 | PARTIAL | — | VRM 0.x 坐／讀書／揮手／說話軸向修正；教室同學坐下面向黑板 | 騎腳踏車沒有踩踏動畫（VRM 沒有 P3 的 parts）；路人 clone 沒有表情 | `src/character3d.js`、`src/story3d.js` |
| 室內 | PARTIAL | 第十七批：家具 | 七個室內都有天花板、有窗框和窗外景的窗；便利商店貨架；宿舍窗簾、檯燈、月曆、社團傳單；**書桌、椅子、書櫃、床、沙發、吧檯椅改成有結構的家具；教室座位平台改平（D26）** | 家具仍是程式產生的簡單形狀、商品色塊、窗外景共用一張圖、沒有窗光照明 | `src/zones3d.js`（`room`、`goodsWall`、`desk`、`chair`、`shelfWall`、各室內） |
| 互動與存檔 | 技術完成；功能完成（Playwright） | — | 標題畫面不再自動存檔覆蓋進度；Café 裡有人坐的位子不擋說話；觸控存檔到欄位、重新整理後讀回、讀檔後可以走；互動按鈕不蓋搖桿；校園改版後舊存檔移位（含「走得到」檢查）——全部 PASS | 手機實機未測 | `src/game3d.js`、`src/engine3d.js`、`index.html`、`tests/touch_flow_wenzhou.py`、`tests/campus_layout_nav.py` |

---

## 技術問題紀錄（不會因為做下一項就刪掉）

| # | 問題 | 原因 | 狀態 | 相關檔案 | 測試 | 還有什麼問題 |
|---|---|---|---|---|---|---|
| 1 | 霖澤館教室裡同學方向錯誤（使用者回報） | `story3d.js` 把路人同學放到座位上時只設位置、沒設 `rotation.y = seat.yaw`，所以 yaw=0 朝教室後方 | FIXED | `src/story3d.js`（populate 的 classroom 兩段） | Playwright：教室所有坐著的 NPC yaw=π（面向黑板）；截圖 `classroom_students_face_board_fixed.png` | 只修了教室；其他區域的座位都有設 yaw（已逐一檢查 `isExtra` 的建立處） |
| 2 | VRM 0.x 模型 180° 朝向 | three-vrm 用 `rotateVRM0` 把整個 scene 轉 180°，但 `buildVRM` 之後做了 `model.rotation.set(0,0,0)` 把它轉回去，VRoid 模型會背對前進方向 | FIXED | `src/character3d.js`（外層 `vrmWrap`） | 渲染截圖：人物正面朝前進方向 | 骨架 clone 也要轉（`assets3d.js` 的 `cloneVRM` 已處理） |
| 3 | VRM 坐下與讀書的旋轉軸 | VRM 0.x 的 normalized rig 在模型空間朝 -Z，直接寫骨頭 Euler 時 x、z 方向相反（腿往後坐） | FIXED | `src/character3d.js`（`setBonesV`、`sx`） | 截圖 `WIP_hairfix_pending_char_an_sit.png`（坐在長椅）、`flow_05_sit.png` | 坐下高度用固定值 0.47×身高比例，部分角色可能略浮或略沉 |
| 4 | VRM instance 重複載入浪費 GPU 記憶體 | 舊的 VRM pool 每個實例重新 parse 一次檔案，貼圖在 GPU 重複 | FIXED | `src/assets3d.js`（`cloneVRM`、`acquireVRM`） | 溫州街／教室實測：所有 NPC driver=vrm，沒有 clone 錯誤 | clone 沒有彈簧骨與表情（設計取捨） |
| 5 | VRoid 頭髮 primitive 太多（draw call） | VRoid 匯出時頭髮拆成 40–80 個同材質 primitive | FIXED | `tools/vroid_build.py`（`merge_prims`） | 溫州街整體約 275 draw call（含人物與陰影 pass） | 手機實機 FPS 尚未測 |
| 6 | 衣物移植後手臂消失 | VRoid 同一個 mesh 的 primitive 共用整個頂點緩衝，移植時把整個身體的頂點都帶過來，遮蔽測試把手臂附近的皮膚全刪了 | FIXED | `tools/vroid_build.py`（`transplant` 只取用到的頂點；`hide_covered` 加切線距離限制） | 模型檢視截圖：手臂正常 | — |
| 7 | 女性 NPC（npc_f2）臉部深色條紋 | 調查中：低解析的檢視截圖裡看起來像瀏海染深色後蓋住眼睛；近距離檢視時臉部正常 | NEEDS RECHECK | `tools/vroid_build.py`（`build_npc_f2`） | 近距離模型檢視：正常；遊戲中遠距離尚未專門檢查 | 需要在遊戲裡近距離截圖確認 |
| 8 | Café 座位互動擋住沈以安 | 沈以安坐的位置正好是桌子「坐在這一桌」互動點，互動按鈕只取最近的一個 | FIXED | `src/engine3d.js`（`nearestInteractable`：有人坐的座位不顯示、人優先 0.5m） | 觸控測試 PASS：「靠近沈以安出現對話按鈕」「和沈以安的對話有內容並結束」 | — |
| 9 | 存檔欄位點擊失敗 | (a) 測試腳本點錯按鈕（點到自動存檔那列的「讀取」）→ 已修測試；(b) **真正的 bug**：標題畫面開啟的存檔選單被標題畫面蓋住（兩個 `.panel` 同為 z-index 8，標題在 DOM 後面） | FIXED（`#menu{z-index:9}`、`#toast{z-index:10}`，commit 7f38a46）；**已測試通過** | `tests/touch_flow_wenzhou.py`、`index.html` | 觸控測試：存到欄位 1、重新整理後讀回欄位 1、讀檔後可以走，全部 PASS | — |
| 10 | 溫州街 `townkit3d.js` 場景製作 | 原本的溫州街是 38m 寬的空柏油地＋一棟方盒 | PARTIAL | `src/townkit3d.js`、`src/zones3d.js` | 白天／黃昏／夜晚截圖；觸控測試走完整條街 | 見總表「溫州街」的下一步 |
| 11 | （新發現）自動存檔被空白第一天覆蓋 | 45 秒自動存檔計時在標題畫面也會跑，載入慢或停在標題 45 秒就會把真正的進度蓋掉 | FIXED | `src/game3d.js`（`autosave` 在 `titleIdle` 時不存） | 觸控測試：從標題點「繼續」讀到正確的溫州街存檔 PASS | — |
| 12 | （新發現）直向時小地圖蓋住 ☰ 選單按鈕 | `#minimap` 的基本 CSS 寫在 portrait media query 後面，把直向位置蓋掉 | FIXED | `index.html` | 截圖：直向時 ☰ 可見 | 橫向未重新截圖 |
| 13 | （新發現）沈以安的頭髮是「貓耳＋雙馬尾」 | HairSample_Female 是 VRoid 的髮型示範樣本 | FIXED（模型與遊戲內轉身照） | `tools/vroid_build.py`（`ponytail_from_twintails`、`add_ponytail_chain`） | 遊戲內正面／側面／背面：單一高馬尾 | v9.2 加了三節彈簧骨，走路時馬尾會擺動 |
| 14 | （新發現）胸部穿出上衣 | 原模型上衣領口開很低、身體比衣服大 | FIXED | `tools/vroid_build.py`（`paint_skin`、對模型自己的上衣做 `hide_covered`） | 模型檢視：上衣正常 | — |
| 15 | （新發現）互動按鈕蓋住搖桿 | `#interact` 沒有最大寬度，長標籤讓按鈕延伸到左下角搖桿上方（DOM 在後面，會吃掉觸控） | FIXED；**已測試通過** | `index.html`、`src/zones3d.js`、`tests/touch_flow_wenzhou.py` | 觸控測試「互動按鈕不會蓋住搖桿」PASS | 其他長標籤（例如「和法律系一年級的女生說話」）會換成兩行 |
| 16 | movement_regression B3 失敗 | 測試挑到有 NPC 坐著的座位（v9 起不能坐），且測試放玩家的點半徑 0.3 站不下 | FIXED（只改測試的挑座位與放置方式，判定標準不變）；**B 組已測試通過 4/4** | `tests/movement_regression.py` | `python3 tests/movement_regression.py URL B` → 4/4 PASS | 完整 A–E 下一輪程式改動後再整套重跑 |
| 17 | 沿著家具邊直走會卡住（v9.2） | `stepEntity` 的「沿牆滑動」分支在位移為 0 時也算成功，玩家原地不動 | FIXED | `src/engine3d.js` | movement_regression 42/42 | — |
| 18 | 吉他袋、後背包在遊戲裡是全黑剪影（看不到拉鍊、背帶） | 配件材質的顏色＝布紋貼圖的顏色，兩者相乘變成顏色平方（深色 → 接近黑） | FIXED（有貼圖時材質用白色） | `src/props3d.js` | 遊戲內轉身照 | — |
| 19 | 中午的淺色衣服（米白針織衫、淺灰上衣、白襯衫）曝成一片白 | MToon 卡通明暗：受光面拿到整個太陽亮度（不乘入射角），建築牆面卻有乘；淺色衣服在 ACES 色調映射後變白 | FIXED（衣服材質 ×0.8，皮膚臉頭髮不動）；**亮度需要使用者看過** | `src/character3d.js`（`C.CLOTH_K`） | 遊戲內轉身照 11:00 | 黃昏／夜晚衣服會略暗 |
| 20 | 頭髮、眉毛顏色改不過來（溫書瑀染棕還是黑、高子晴眉毛淺藍、林芷若眉毛淺米） | VRoid 樣本的頭髮／眉毛材質有顏色乘數（Shino 深藍、Vita 淺藍灰、Victoria 金髮米色），貼圖再怎麼改都會被乘 | FIXED | `tools/vroid_build.py`（`hair_factor_reset`、`face_line_colors`） | 模型檢視＋遊戲內臉部近景 | — |
| 21 | 剪短的衣褲邊緣是鋸齒；短褲大腿中間垂下一片布 | 以三角形為單位剪裁會留下跨線三角形；移植的長褲兩腿之間有連接面（寬褲看不出來） | FIXED | `tools/vroid_build.py`（`flatten_hem`、`remove_center_curtain`、`cut_sleeves(clean)`、`crew_neck`） | 模型檢視 | — |
| 22 | 總圖門口有一塊黑色三角形擋住館名 | 門廊山牆用了 3 邊的圓錐（尖錐），正面看是黑色三角形 | FIXED（改成三角柱山牆＋屋面，館名往上移） | `src/zones3d.js` | 校園截圖 | — |
| 23 | 校園改版後，舊存檔可能站在新建築或湖裡 | 原本只在 8 m 內找空地 | FIXED（擴大到 45 m，再不行回到區域出生點） | `src/engine3d.js` loadZone | `tests/campus_layout_nav.py` | — |
| 24 | 校園改版後，從霖澤館前點地移動到校門走不到（`tests/campus_layout_nav.py` 抓到；舊版走得到） | A* 搜尋上限 6 萬步；新增醉月湖、樹列後，長路徑展開的格子超過上限，回傳「沒有路」 | FIXED（上限 20 萬步、啟發函數 ×1.1；長路徑 27 ms） | `src/engine3d.js`（`NavGrid.path`） | campus_layout_nav、p0、回歸、觸控流程（重跑） | 路徑最多比最短路徑長 10%（之後還會直線平滑） |
| 25 | 林芷若走路時，長髮在耳朵高度往兩側翹（所有 VRM 角色都會，長髮最明顯；站著剛生成時也會） | **第一次判斷錯了**：以為是手臂碰撞體把頭髮往外推，改成頭髮只和頭、脖子、胸、脊椎碰撞之後重拍，還是翹。用 Node 載入遊戲的 three.js＋three-vrm＋`CHAR` 逐步模擬才找到真正原因：three-vrm 用「子骨頭的 matrixWorld」算每一節頭髮的骨長，但子骨頭的 matrixWorld 還停在上一幀；人物移動、瞬移或動畫之後，低幀率時一幀差幾十公分，骨長算錯，頭髮被當成甩出去。和碰撞體無關（拿掉所有碰撞體一樣會翹） | FIXED（彈簧骨更新前先更新整個 VRM 的 world matrix） | `src/character3d.js`（`updateVRM`） | Node 模擬：0.3 秒一幀、人物移動時，林芷若髮尾平均比站著高 12–16 cm → 修正後六位角色走路和站著相差 ≤ 6 mm；遊戲內轉身照：站著、走路的頭髮都自然下垂 | 30 fps 手機上誤差較小（一幀約 4–5 cm），原本髮尾會抖；實機未測。上一批加的「頭髮不和手臂碰撞」保留（不影響結果） |
| 26 | 林芷若的眼鏡從側面看，有兩根細線從臉前面伸出去 | 眼鏡整組轉 180°（模型檔空間的前方是 -z），鏡腳卻還是往 +z 畫，轉完就變成往前伸 | FIXED | `src/props3d.js`（`glasses`） | Node：鏡腳從鏡框往後約 10 cm（到眼睛後方）；遊戲內側面照 | — |
| 27 | 讀舊存檔被移位時，可能被移到新建築後面的封閉空地（走不出來） | 只找最近的空地，沒有檢查走不走得到 | 預防（目前三個測試位置用舊程式也走得到） | `src/engine3d.js`（`loadZone`） | `campus_layout_nav`：三個舊存檔位置讀檔後都走得到霖澤館前 | — |
| 28 | v9.3 第一批的 Café 三時段照片，右邊三分之一是一片灰牆 | 拍照鏡頭放在 Café 南側那棟建築的範圍裡，拍到的是建築內側（遊戲本身沒有問題，玩家走不進去） | FIXED（換鏡頭重拍；有問題的照片沒有 commit） | 拍照設定 | 重拍照片 | — |
| 29 | 林芷若領口剪低後，脖子有一個洞 | `hide_covered` 把領口附近的脖子皮膚當成「被衣服蓋住」刪掉 | FIXED（`hide_covered` 加 `y_keep`：領口線以上的皮膚不刪；要在剪領口之後、刪皮膚之前） | `tools/vroid_build.py` | bind pose 簡易算圖：脖子、鎖骨完整；遊戲內臉部近景 | — |
| 30 | 陳語彤臉部近景，脖子兩側有深色的尖片 | 連帽上衣改圓領時，領口剪裁線往兩側沿肩線升高（每公分 1.2 公分），在脖子兩側比脖子根部高 2 公分以上，帽口的布留成兩個尖角；從正面看到的是尖角的內側（深色） | FIXED（`crew_neck` 加 `cap`：領口線往兩側最多升高 4 mm） | `tools/vroid_build.py`、`assets/models/char/vroid_heroine_03.vrm` | bind pose 簡易算圖：背面尖角消失、正面圓領平順；遊戲內臉部近景 | — |
| 31 | 宿舍：沿牆斜推滑進書桌後面的窄縫之後，往哪個方向推都出不來（`movement_regression` A7 在一次測試失敗；重跑兩次通過，但把玩家直接放到那個位置可以穩定重現，所以不是偶發） | 書桌後面和後牆之間只有約 0.5 m（比人窄），導航格 0.4 m＋半徑 0.3 m 的「站得住」檢查在那裡留下只有一個點站得住的小孤島；測試模式（?turbo）一步最多 1.2 m，會跳進去；孤島四周都站不住，所以出不來 | FIXED：(1) 宿舍書桌後面、床頭與書架之間、溫州街 A 字立牌與盆栽之間、電線桿與郵筒之間，四個比人窄的縫標成不可走（沒有刪任何碰撞）；(2) 前進、沿牆滑、繞角都過不去時，再往左右偏 30°／50°／70° 試一步（只移到站得住的位置、不穿牆；目前位置本身站不住時不用，交給原本的脫困邏輯）；(3) 新增 `tools/dev_scratch/nav_islands.py` 掃描所有區域的小孤島 | `src/zones3d.js`、`src/engine3d.js`（`stepEntity`）、`tools/dev_scratch/nav_islands.py` | 把玩家直接放在卡住的位置推搖桿：修正前不動，修正後走出來；nav_islands：11 個區域 ALL CLEAR；campus_layout_nav 29/29、p0 31/31、movement_regression 42/42、touch_flow 21/21；A 組多跑 3 次都 7/7 | 手機實機一步約 7 cm（60 fps），本來就比較難跳進孤島；修正後孤島已不存在 |
| 32 | 高子晴臉部近景，臉頰兩側頭髮縫隙裡有白色毛邊（之前記成「帽口兩側的白色髮尾」） | **一開始判斷錯**：先以為是頭髮貼圖的淺色髮尾（檢查貼圖：全部是深色，最亮只有 63/255），再以為是臉旁的帽緣（壓低之後還在）。實際是 HairSample_Male 的帽子穿在比較小的身體上，立在後腦勺、比頭寬（±0.12 m，頭約 ±0.085 m），從正面透過兩側頭髮的縫隙看得到後面的淺灰色帽子 | FIXED（`lower_hood`：帽子高於脖子的部分往中間收窄 32%、稍微壓低；臉旁的帽緣壓低） | `tools/vroid_build.py`、`assets/models/char/vroid_heroine_04.vrm` | bind pose 簡易算圖（正面、側面、背面）；遊戲內臉部近景修改前後 | 第一次試「整個帽子壓低」，側面看帽子在脖子後面變成往後凸的平台，所以改成只收窄 |
| 33 | 校園新建築：迴廊頂端（拱圈上緣下方）一條閃爍的白色虛線；總圖等門廊頂端同樣的位置也會 | 拱廊天花板（淺色）一路延伸到拱圈牆的正面，兩個面在同一個平面上，深度衝突（z-fighting）；門廊兩端的柱子和側牆的正面也重疊 | FIXED（天花板只做到拱圈牆背面；門廊兩端的柱子拿掉，由側牆代替） | `src/campuskit3d.js` | 校史館近景重拍：白色虛線消失 | — |
| 34 | 陳語彤臉部近景，領口正中間有一個黑色的小蝴蝶結 | 第一次（第六批）以為是領口窄布的 UV、第二次（第七批）以為是胸口貼圖的 V 形陰影——兩次都沒改善。第八批改成在遊戲裡「一次只改一樣東西」截圖（`tools/dev_scratch/outline_probe.py`）：關描邊、拿掉頭髮、拿掉後背包都還在；材質乘綠色（T 恤）不變，乘洋紅色（身體）時蝴蝶結像素的綠色值變 0 → 是**身體**，而且很暗。原因：T 恤是連帽上衣改的，領口離胸口 5–6 cm，近景從上往下看得到衣服裡面，那裡的身體一部分被刪掉（避免穿模），看進去是黑的。把領口往脖子收（`hug_neckline` 實驗）蝴蝶結就消失，證實原因；但三種收法（0.8 cm、2 cm、只收正面）都讓領口變成一大塊深色，比原本更醜，沒有採用。上胸口不塗深灰也沒有改善 | NOT FIXED；BLOCKED_BY_ART_ASSET（需要真的圓領 T 恤模型，或重做領口幾何）。模型維持第七批；實驗用的程式沒有留在建置工具裡，實驗腳本留在 `tools/dev_scratch/outline_probe.py` | `tools/dev_scratch/outline_probe.py` | 遊戲內臉部近景（實驗照見 VISUAL_REVIEW 第 4 節） | 祐廷的上衣也是同一件改的，領口中間有一樣的 V 形，但衣服淺灰，看起來像摺痕 |
| 35 | 鏡頭被樹幹擋住：回歸測試截圖 `T_E_campus.png`（椰林大道、校門附近）連續兩次整個畫面右半邊是大王椰子樹幹，祐廷完全看不到 | 跟隨鏡頭只對建築做碰撞（把鏡頭拉近），樹幹、電線桿沒有碰撞；鏡頭剛好在樹幹後面時，樹幹擋在鏡頭和人物之間。椰林大道兩排椰子樹每 7.5 m 一棵，走在樹列旁邊很常發生 | FIXED（樹幹透視：擋在鏡頭和玩家之間的樹幹、電線桿，在玩家周圍的直立橢圓範圍內變成網點透空；離鏡頭 1.7 m 內的部分也透空。用 shader 判斷，區域合併過的靜態網格也適用；鏡頭位置、碰撞都沒改；演出鏡頭、室內不開） | `src/engine3d.js`（樹幹透視）、`src/townkit3d.js`（大王椰子、行道樹、電線桿的材質標記）、`tests/see_through.py` | `tests/see_through.py`：同一幀畫正常畫面、拿掉樹幹的畫面、只畫玩家的剪影，比較玩家範圍內看得到的比例（判定先定好：關掉時 < 40% 才算情境有效，打開時 ≥ 60%） | 網點在低解析度（`?lowres`）時比較粗；樹冠不會透空（樹冠在 3 m 以上，正常鏡頭擋不到人） |
| 36 | `touch_flow_wenzhou` 第八批有 2 項失敗：「靠近沈以安出現對話按鈕」「和沈以安的對話有內容並結束」（之前每次都 21/21） | 測試用點地移動走到沈以安旁邊（目標點離她約 1.3 m、容許誤差 1.2 m），這次祐廷停在離她 2.22 m 的地方，剛好超過 2.2 m 的對話距離，所以沒有按鈕、也沒有對話。遊戲本身正常（再走近一點就有按鈕）。這一輪我同時在另一個伺服器跑瀏覽器實驗，搶 CPU 可能讓走路停的位置不同，但這不是藉口：測試的走法本來就可能停在範圍外 | FIXED（只改測試的走法：走完如果離她超過 1.8 m，再走近一點；判定標準不變：靠近時要出現對話按鈕、對話要有內容） | `tests/touch_flow_wenzhou.py` | 單獨重跑 touch_flow（沒有其他瀏覽器同時跑），見第八批測試結果 | 以後跑回歸測試時不要同時跑別的瀏覽器工作 |
| 37 | 寫公館測試時發現：從麵店出來的淡入還沒結束就讀檔，讀檔「成功」但人沒有移動（測試：站在巷口卻沒有「往溫州街」按鈕） | `enter()` 換區域時，上一次換區域還在淡出淡入（`entering`）就直接略過；`applySave()` 先把存檔內容換掉、再呼叫 `enter()`，結果遊戲狀態是新存檔、人卻還在原地，下次自動存檔會把這一區的座標記在另一區名下。另外 `enter()` 裡如果建立區域出錯，`entering` 會永遠是 true，之後再也換不了區域 | FIXED（`applySave` 先等換區域結束（最多 10 秒，還沒結束就回報「正在切換場景，請稍後再讀取」，不會只讀一半）；`enter()` 用 try/finally 一定把 `entering` 清掉，錯誤照樣丟出去）。用同一個順序（進麵店 → 出來 → 馬上讀檔）重跑：人正確移到巷口、出現「往溫州街」。公館測試另外加上「先等淡入結束、讀檔後確認人真的在巷口」的前置檢查（判定不變） | `src/game3d.js`（`enter`、`applySave`）、`tests/gongguan_layout_nav.py` | gongguan_layout_nav、movement_regression D（存讀檔）、touch_flow（讀檔） | Playwright 模擬；手機實機未測 |
| 38 | 第十五批第一次 `movement_regression`：A6「斜推 → 沿牆滑動」失敗（x 只變 0.04 m） | 這批沒有改導航格（diff 裡沒有任何導航呼叫；宿舍只加了窗、窗簾、檯燈、月曆、傳單這些不擋路的東西）。失敗是 A5（往前牆推 3.2 秒）停的位置造成的：這次停在 x=0.42，已經是前牆可以貼著走的範圍（約 x −1.2～0.7）的右端、書桌旁的牆角，A6 再往右前推就是推進牆角，本來就滑不動。A5 停在哪裡會隨幀率改變：正面推牆時，#31 加的「往左右偏 30°／50°／70° 試一步」在玩家和牆之間還有空隙時也會成功，於是一邊貼近牆一邊橫移；測試模式（?turbo）一步最多 1.2 m，這次橫移了約 1.7 m（之前的紀錄 A5 停在 x −1.57～−0.39） | FIXED（測試的前提）：A6 改成往這面牆上空間比較大的那一側斜推（停在 x>−0.3 往左前，否則往右前），**標準不變**（要沿牆滑 0.3 m 以上）。遊戲裡「正面推牆會沿牆橫移一點」**沒有改**：手機 30～60 fps 一步 0.07～0.14 m，估計最多橫移 0.2～0.4 m，而且會幫玩家繞過家具的角；改成先貼到牆再試偏移，玩家會更常卡在家具前，要改需要另外評估 | `tests/movement_regression.py` | 重跑 `movement_regression` 42/42；把玩家放在失敗時的位置（0.42, −2.56）驗證左前那一支（結果見第十五批） | 手機實機的橫移量沒有量過 |
| 39 | 校園設定的視距（`viewFar`、`fogNear`，第十八批加的）實際上沒有生效：椰林大道盡頭 150 m 的總圖整個被霧蓋白 | `engine3d.js` 的 `applyTime`（每幀都會跑）最後一行 `scene.fog.far=E.q.far`，把 `applyViewFar` 設好的區域視距蓋回畫質預設值（中畫質 130 m）。用遊戲裡實際讀 `scene.fog` 才發現（`near 90, far 130`） | FIXED | `src/engine3d.js`（`applyViewFar` 記到 `E.fogFar`，`applyTime` 用它） | 截圖：同一個鏡頭總圖從一片白變成看得到面磚與塔樓；`render_stats`；只有校園有 viewFar，其他區域不變 | 下雨、陰天時霧距離是 `E.fogFar×0.7`（和原本一樣的比例） |
| 40 | 椰林大道盡頭的總圖下半部被一排灰藍色的城市剪影蓋住 | 天空的城市剪影（`makeSkyline`，半徑 118 m 的圓筒，`depthWrite:false`）是半透明材質，排在所有不透明物件**之後**才畫；比 118 m 遠的建築深度比它遠，剪影就畫在建築上面。第二十批把校園視距拉遠之後才看得出來 | FIXED | `src/engine3d.js`（剪影改成不透明＋`alphaTest`、`renderOrder` 排在天空之後、所有建築之前；山 -9.5、市區 -9、夜間窗 -8） | 截圖（總圖、公館 5 個位置的 360° 盤點和改前一樣） | — |
| 41 | 校門兩側的紅磚圍牆是一條條暗紋 | `W3.brickTex` 沒設重複次數，70 m 的牆只貼一張貼圖，磚紋被拉長 | FIXED | `src/zones3d.js`（校園、公館的圍牆改用 `campusWallMat()` 面磚＋依尺寸算 UV） | 360° 盤點截圖 | — |
| 42 | 360° 盤點：轉鏡頭會看到地圖邊界（地面盡頭＋淡藍色空白帶）；公館往校門裡看是一片空白 | 校園地面只到 x=±130、z=-128／+85，公館地面只到 z=-55；兩邊都沒有對方的背景 | FIXED（第二十批，D27） | `src/zones3d.js`（campusBackdrop、公館的校園背景）、`src/townkit3d.js`（`bgCity`） | `view_audit.py` 33 個位置改前改後 | 背景是方盒＋貼圖，近看看得出簡化；馬路上沒有車 |
| 43 | 戶外的太陽中午在北邊：朝南的系館正面整天背光、椰子樹影子往南倒（和使用者照片裡陽光直射的正面差很多） | `engine3d.js` applyTime 用 `z=+cos(azimuth)`，但時段表的 azimuth 是羅盤方位、世界座標 -z 是北（D25），少一個負號；公館的區域座標和校園差 90°（+x 南、+z 西），用同一個公式也不對 | FIXED（D29：戶外 `z=-cos`、區域加 `sunYaw`（公館 π/2）、室內維持原方向） | `src/engine3d.js`、`src/zones3d.js`（gongguan 的 `sunYaw`） | Node 換算：校園、公館 7／9／12／15／17 點的羅盤方位都和時段表一致；校園、溫州街、公館 16 個鏡頭改前改後（VISUAL_REVIEW 第 15 節） | 朝北的行政大樓、傅鐘中午變背光；溫州街小公園（鏡頭朝南）中午變逆光——都和實際一樣，使用者可能會覺得比較暗 |
| 44 | 萬才館大台階：石牆外面還有一層層的台階（最高約 1 m），導航寬度是估的 | 每一階都是長方形、寬度取這一階前緣的寬度、一路延伸到平台；台階越下面越寬，所以上半段的石牆外側全是台階。導航用三段估寬度：上半段石牆外有最多 2 m 看不見的牆，最下面張開的台階有一部分沒擋到（Node 檢查：台階區 73 個頂點在導航阻擋外） | FIXED（台階外形夾在兩道石牆之間、最下面四階繞過牆端；導航從每一階的實際外緣算 8 段） | `src/campuskit3d.js`（`stepOutline`、`stepFromOutline`、lawhall stairs） | Node：台階區 0 個頂點在導航阻擋外；`campus_layout_nav`、`nav_islands`、`zone_transitions`（見測試結果） | 沒有地形高度（D26），台階還是不能走 |
| 45 | 柏油路改淺灰之後，20:30 的巷子整條路均勻發亮、像傍晚，路燈下 1% 像素過曝 | 遊戲的夜間環境光（半球光＋城市夜光 cityLight）對朝上的大片表面很強；深色路面時看不出來 | FIXED（柏油貼圖加 `userData.asphalt`，`loadZone` 收集這些材質，`applyTime` 依入夜程度把顏色乘 1−0.42×nk；不動全域光線） | `src/engine3d.js`、`src/world3d.js`、`src/townkit3d.js`、`src/zones3d.js` | 同鏡頭量測：20:30 溫州街路面中位數 115 → 81（原本深色路面 58）、過曝 1.15% → 0%；11:00、17:30 數值不變 | 新增的柏油貼圖要記得加 `userData.asphalt`，不然晚上會太亮 |

---

## 已知限制與誠實說明

- **真機未測**：所有測試都是 Playwright（Chromium SwiftShader、iPhone 390×844 模擬、CDP 觸控事件）。SwiftShader 只有 1–4 fps，不能代表手機效能。
- **人物風格**：VRoid 是日系動畫風（MToon 卡通著色），與使用者提供的 2D 立繪同一類風格，但臉型、眼睛仍偏動畫；已用 blendshape 把女性眼睛收細一點，無法再大幅修改臉型（需要 VRoid Studio）。
- **合法素材的數量限制**：沙盒網路只能連 GitHub／npm／PyPI。找到的 CC0 VRoid 樣本只有 2 位男性、6 位女性（其中 Vivi 比例像小孩、Vita 是奇幻造型，未使用）。
- **動畫**：沿用既有 Mixamo 動畫（three.js 範例），REVIEW_NOTES 已記載再散布疑慮，尚未替換。
- **`build/` 單檔版**：`python3 build.py` 可以正常建置，但輸出這次不 commit（還是 v8 的檔案），等模型定案的里程碑再提交；GitHub Pages 用根目錄 `index.html`，不受影響。

## 截圖檔名規則（`docs/art-rebuild/screenshots/`）

- `before_v8_*`：重建前（v8）的實際遊戲畫面。
- 無前綴（例如 `wenzhou_day_1100.png`）：目前版本的實際遊戲畫面。
- `flow_*`：`tests/touch_flow_wenzhou.py` 觸控整合測試過程中的實際畫面。
- `WIP_*`：工作中、還要修改的畫面（例如 `WIP_hairfix_pending_*` 是沈以安改成單一馬尾之前拍的）。
- `BUG_*`：問題畫面（檔名註明是否已修）。
- `MODEL_VIEWER_*`：用同一套 three.js＋three-vrm 在模型檢視頁渲染的模型本身（不是遊戲畫面）。
