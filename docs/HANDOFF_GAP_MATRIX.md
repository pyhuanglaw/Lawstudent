# 永久工作總表（HANDOFF_GAP_MATRIX）——前後帳號交接缺漏與全學年施工矩陣

> **唯一正式的跨帳號任務登記總表**（使用者 2026-10-16 正式指示；D49、D79 修訂；`CLAUDE.md`「跨帳號接班」「新增劇情先問 AA-B」兩節）。帳號 A、帳號 B、往後所有工作階段共用這一份，不另建清單。
> **有效規則來源**：見 `docs/AI_SESSION_HANDOFF.md` 第 0a 節（規則來源 ref＋SHA）。這份總表跟著規則來源那條分支走。
> **機器讀的版本（D82，以它為準）**：`docs/handoff/tasks.json`（每項任務的狀態、負責、下一步、首次出現時間 `first`）、`docs/handoff/deliveries.json`（交付登記）、`docs/handoff/snapshots/`（交班快照）。這份 MD 是閱讀版：改狀態先改 JSON；`python3 tools/handoff/check_handoff.py check` 會比對兩邊的 ID、找出消失或沒登記的任務；`… queue` 照 D81 列出下一批。
> **企劃面的缺漏以企劃線 AA_140 第 3 節為準**（AA-B 維護）；這份管施工與測試，兩邊互指。戀愛現行規則＝AA_140 第 0 節。
> **最後全面對帳**：2026-10-16 02:0x UTC，LAWWW-B（帳號 B），基準 `4d0170d4`；方法：5 個唯讀子代理逐項核對程式、觸發條件、台詞、旗標、存讀檔、測試（不是只看檔名或事件 ID），加上 LAWWW-B 自己的瀏覽器回歸。

## 0. 怎麼用（每個 AI 都要遵守）

1. **任務 ID 永久保留**。完成的移到第 9 節「已驗收（封存）」，保留來源與證據；取消或被取代的移到第 10 節，寫明授權與替代的 ID。**不能因為優先級改變就刪任務。**
2. **狀態只有八種**：`待開工`、`進行中`、`等待其他AI／素材`、`已實作待整合`、`已整合待測試`、`已驗收`、`暫停`（寫原因）、`取消／被取代`（寫授權與替代 ID）。
   - 「已寫企劃」「已提交程式」「模型已完成」都不是「已驗收」。單元測試通過也不是。`已驗收`＝瀏覽器實玩（Playwright 手機模擬）照驗收條件走過、有證據；iPhone 實機另外寫。
3. **欄位**：ID｜項目｜來源（使用者決策／企劃文件）｜負責｜授權｜企劃／程式／美術（各自 ✅ 完成、◐ 部分、✗ 沒有、— 不需要）｜整合／測試／實玩｜狀態｜分支・SHA｜阻礙／下一步｜優先（P0 嚴重 bug、P1 v2 驗收與基本功能、P2 系統與新內容、P3 美術與打磨）。
   - 表格太寬時，同一組的共同欄位寫在組標題（例：v3 全部「授權＝D79、企劃＝✅」）。
4. **誰更新**：LAWWW（-B）彙整全表；AA（-B）確認企劃交付與劇情完整性；BB（-B）確認人物事件；LAWWW2（-B）確認美術。其他職位不直接改這份檔案也可以：在自己的交接檔用任務 ID 寫狀態，LAWWW 同步時抄進來。
5. **什麼時候更新**：完成一批工作就改那幾列；交班時寫第 1 節「交班快照」；接班時照 `AI_SESSION_HANDOFF.md` 第 4 節對帳。**不用每改一行程式就重新盤點全專案**；只有狀態衝突、沒有證據、來源不明時才深入追查。
6. **新任務**：照下一個空號加在對應的組；★＝2026-10-16 對帳時才登記（原本不在任何交班清單或進度檔的待辦裡）。
7. **劇情規則（D79）**：任務需要新劇情或企劃沒寫清楚的互動，狀態寫「等待其他AI」、下一步寫「問 AA-B：…」，不要自己補台詞。
8. **排序（D81）：玩家越早遇到越先做**——P0（嚴重 Bug、大一下 v2 驗收）→ v0 → v1 → v2 → v3 → v4（臺灣／日本／美國照劇情順序）→ v5；跨學年系統在第一次可能用到的學期做；美國篇並行但不擠掉 v0～v2。每項任務在 `tasks.json` 有首次出現時間（`first`：term、week、earliest、mainline、blocks、prereq、parallel、confirmed；時間線以 AA-B 為準，`confirmed:false`＝還沒請 AA-B 核對）。階段完成＝玩家玩得完整。
9. **增量（D82）**：收到交付就在 `deliveries.json` 登記一筆，新任務直接加進 `tasks.json`；交班跑 `check_handoff.py snapshot`、接班跑 `check_handoff.py check`。工具只列異常、不改任務。
10. **平行開發的派工（D84）**：每個開發階段開工時先盤點美術、建 LAWWW2 任務；跨 AI 任務在 tasks.json 寫 `xai`（接收者、分支、規格來源、交付標準、ACK）；LAWWW2 用 `check_handoff.py queue --owner LAWWW2` 主動領工作；LAWWW 每批跑 check（第 10、11 項：欄位不齊、派工不足、交付沒 ACK）。2026-10-16 的稽核與重排：`docs/handoff/DISPATCH_AUDIT_2026-10-16.md`。
11. **四角色主動派工與協作（D86）、main 與發布（D85）**：LAWWW 的劇情需求給 AA，AA 自己做或分派 BB；沒工作時照詢問順序找事做；值班的 LAWWW 自己決定合併 main、整理分支（`docs/handoff/BRANCH_INVENTORY.md`）、發布，並對品質負責。
12. **自主連續工作（D87）**：做完一項自動接下一項，回報不是終點；卡住換一項；沒工作照 D86 問隊友；只在 CLAUDE.md D87 第 6 點的情況停。發布不再有三小時間隔（D85 修訂）。
13. **分支收斂（D88）**：有效成果都要保存、整合、驗證；美術 WIP 由 LAWWW2 逐條整合（WIP-02-*），LAWWW 複核刪除；休班帳號的交接分支保留；分支盤點 `docs/handoff/BRANCH_INVENTORY.md`。

## 1. 交班快照（每次交班覆寫這一節；上一次的快照搬到第 11 節）

### 帳號 A → 下一個帳號（看使用者對哪一邊說話）｜LAWWW（帳號 A）｜2026-10-22 15:0x UTC 交班（使用者「現在交班」「你要等其他AI都交班之後做最後檢查 才交班」）

**A｜本班成果（10-21 15:24 接班以後；細節在 tasks.json、deliveries.json、docs/RELEASES.md）**
- 發布兩版：v9.10.4（main `4a8d17f9`，PR #10，10-22 05:59）、v9.10.5（main `46dfe5c7`，PR #11，10-22 12:35，Pages run 39779226078）。
- v9.10.5 以後在開發分支（都已 push，放 v9.10.6）：遠距離路人低面數（`91c5c7ea`）、舊存檔中秋烤肉邀約期限（`522dbf6a`）、日本 3D 房間電話（`8a99f2ed`）、手機列表捲動（`6d7b8ff6`）、學姊第四批 AA_386（`52038bda`；3-3 定案 `45576fe7`）、溫州街四家店 AA_364（`7047436e`；味噌湯 `732237be`）、進場事件先劇情（`36ea78f4`）、芷若出國前最後一場 AA_387（`52dbfe6f`）、可昕週年視訊鬧鐘（`d3df1cf3`）、**約會句子救回被蓋掉的 16 處（`459ae377`，含使用者 10-18 可昕不出假設題；v9.10.3～v9.10.5 線上是舊字）**、check_lines 修好（`aa64bf7d`）、溫州街小公園路人 AA_283（`e3cdadfd`）。
- v9.10.6 還沒切候選（RELEASE-9106）。

**B｜全部未完成（照順序；全部在 tasks.json）**
1. **RELEASE-9106（P0）**：等 BB RELEASE-9106-TEST 第 1～14 項判定＋後派的三件（BB119-Y4-1017 芷若最後一場、USD_kexin 重跑、AA_283 公園第 4 節）→ 候選凍結 → TESTING 第五節 1～9 全跑（v9.10.5 沒跑的 reachability_all 等都要跑）→ HV-15 三支（check_lines 修好了，數字和以前不能比：一模一樣 38,688、可能抄錯 383 筆是提醒、沒逐句看）→ RELEASES.md。
2. **ART-ZR-PS-3D-1022 沛珊臉與頭髮（USER_WANTS C27）**：LAWWW2 第三十一版 WIP（頭頂尖刺消了、在補後腦的縫）。驗收照「對著參考圖逐項比」（第二十七版 LAWWW 04:4x 通過、使用者 11:5x 推翻；第二十九、三十版退件），過了才換三個檔（bl_classmate_peishan.vrm＋glasses_peishan.glb＋glasses_peishan.json）。
3. **AA_313 剩下的修正**（AA313-FIXES／S4／S5／S6）：逐點清單在 `docs/handoff/audit_1022/AA313_REMAINING_1022.md`（沒做 36＋27＋43 點等），(b) 九點要問 AA；先改 tools/msg/build_msg2.py 再重產 msg2_pool。
4. 等 AA：AA_387 解讀 A1～A6（14:5x 傳的；A1「我先收著」第二次邀約沒有地方、A2 和可昕交往中撞七夕視訊要不要只給單身）、以安放鴿子兩句（AA_127 原檔第 233 行）、AA_QUESTIONS_1021 還沒回的。
5. LAWWW2：ART-WZ-LIN-MENU-1022（林家菜單加貢丸湯，ACK）、ART-WZPARK-ENTRY-B-1022（公園入口 B 導航，SENT）、ART-ZR-CAFE-PORTRAIT-1022 的高解析度圍裙版（BB 向使用者要）。
6. **單元測試沒跑完**：10-22 14:33 在 `45576fe7` 全部 490 支 ALL PASS；合併 AA_387 以後（`52dbfe6f`）重跑到第 308／493 支（全過、0 失敗）時因交班停掉；之後的約會句子、公園路人只跑了相關的（37＋29＋nav 兩支 ALL PASS）。**下一班先在開發分支跑完整 Node 單元測試。**
7. 交班中才收到、登記給下一班的：
   - BUG-US-BED-ALARM-1022（P1，BB 15:02：美國上課日床的選單把鬧鐘蓋掉，可昕週年視訊還是錯過；BB 附了改法）。
   - AA387-S10-1022（AA_387 第 10 節）。
   - US-JETLAG-BED-0803-1022（要問 AA）。
   - TOOL-DUTY-HANDOFF-BRANCH-1022。
8. 其他照 `check_handoff.py queue --owner LAWWW`。

**C｜正在做的**：沒有。子代理三個都交件、合併了（AA_387、公園路人、AA_313 盤點），背景測試停了。

**D｜最新決策與規則**：本班沒有新的 HV 規則。
- 使用者 15:0x 兩則記在 user_asks（UA-LAWWW-1022-04、05）。
- AA 的定案：AA_386 3-3 `d0468be4`（學姊大四上那一頓固定 12/24＋備援私訊）、AA_387 `608b9adc`。
- 程式的通用改動：
  - 進場事件先劇情、再隨機（events3d.js X.onEnter）。
  - 女朋友版學期末約會：邀約前那天晚上有別的出遊就往後讓（termend3d.js，所有女朋友都適用）。

**E｜跨 AI 協作**
- LAWWW2：15:09 交班，最後 commit `ff339df1`（claude/second-ai-env-art），快照 `2026-10-22T1509Z_A_LAWWW2.json`，duty handoff @ `88eb607a`；全部待辦 109 個 ID。
  - WIP：沛珊第三十一版（腳本 c8a7a953、比較圖 d724b106，VRM 沒有遠端備份、用腳本重做）、林家菜單貼圖 d724b106（開發分支的 shops_tex.py 是舊版，整合用 LAWWW2 版）。
  - 入口 B 導航沒開工。
- AA：15:07 交班，最後 commit `bbbf3e26`（claude/story-planning），快照 `2026-10-22T1507Z_A_AA.json`。
  - AA_387 第 10 節 A1～A5（021ffe76）登記成 AA387-S10-1022，下一班做。
  - AA 交接檔列的「已交給 LAWWW、AA 還沒確認做到的」四件，只有第 3 件（AA_387 第 10 節）還沒做：AA_386 3-3＝45576fe7、AA_386 第 6 節＝57bab0c0、AA_364 5-5＝732237be 都做了。
  - AA_313 盤點的問題這一班沒給 AA，下一班從 audit_1022 那份檔拿去問。
- BB：15:08 交班，最後 commit `d3c7951d`（分支 4a25046b），快照 `2026-10-22T1508Z_A_BB.json`。
  - duty_BB 是手寫的（duty handoff 在企劃線跑不起來，TOOL-DUTY-HANDOFF-BRANCH-1022）。
  - RELEASE-9106-TEST：第 1～3 項 PASS、第 6 項中斷，其他沒跑；兩條線佇列 60 項沒跑（清單在 BB_00 第 3 節）。
  - 測試結果、截圖只在 BB 的 scratchpad（重點寫在 BB_218）。
- 沒有待回的訊息。三位都已交班，之後不傳訊息叫醒（D75）。

**F｜測試與問題**
- 最後檢查：`check` OK（十一項）；`incr` 83 個 commit 全部已分類（LAWWW2 交班 commit 88eb607a 補分類 handoff_record），水位線前進到 LAWWW a6bc8143、LAWWW2 ff339df1、AA／BB 4a25046b；`roles` OK（LAWWW2 109、AA 104、BB 11 個 ID 都在總表）；`asks` OK（177 筆）；`duty sync` 收了三位的交班登記。**逐職位核對沒有異常，交接完整**（未完成的都在 B 和總表）。
- 已知：
  - 公園入口 B 進不了主園區（派 LAWWW2）。
  - 公園沒有兒童、長者、狗的模型（孩子用路人縮小暫代）。
  - 二手市集（WZ-P2）還沒有。
  - 街上路人路線會走進公園前段。
  - check_lines 383 筆可能抄錯沒逐句看。
- iPhone 實機都沒測。

**沒有遠端備份的**：本機 `.claude/worktrees/` 的子代理工作樹（分支都已合併進開發分支）、scratchpad 的測試輸出（full_unit_*.txt、cl_*.txt，結果都寫在這裡）。其他都已 push。

**下一班第一步**：照 AI_SESSION_HANDOFF.md 第 4 節接班 → 跑完整 Node 單元測試（B 第 6 項）→ 收 BB 的判定 → RELEASE-9106。

## 2. 試玩 Bug 與技術問題（BUG）

| ID | 項目 | 來源 | 負責 | 程式 | 測試／實玩 | 狀態 | SHA | 阻礙／下一步 | 優先 |
|---|---|---|---|---|---|---|---|---|---|
| BUG-01 | `zone_memory` 貼圖持續增加（推測 iPhone 跳回標題的原因） | LAWWW 交班第 4 點；試玩 | LAWWW-B | ◐ | 追蹤工具在 scratchpad（tex_leak2 排隊中） | 進行中 | b2ca5b6c（騎車路人 release，不是主因） | 找出真正來源（render target、shadow map、場景外的貼圖）→ 修 → tests/zone_memory.py＋iPhone | P0 |
| BUG-02 | 偶發全黑、面膜臉（試玩第 24 項） | 使用者 10-15 | LAWWW-B | ◐ | 未重現 | 進行中 | a8f2d25b（WebGL 掉線紀錄＋恢復） | 可能和 BUG-01 同源；重現 | P0 |
| BUG-03 | NPC 披頭散髮（博雅 101，第 17 項） | 使用者 10-15 | LAWWW-B | ✗ | — | 待開工 | （54146f5c 只修了進教室時間） | 查彈簧骨／路人模型 | P1 |
| BUG-04 | 學姊「兩個臉」（週三晚上總圖外，第 25 項） | 使用者 10-15 | LAWWW-B | ✗ | — | 待開工 | — | 到現場重現 | P1 |
| BUG-05 | 沛珊穿和路人一樣的紅衣（第 26 項） | 使用者 10-15 | LAWWW-B／BB-B | ◐ | ?blchar | 等待其他AI | d54bc731 | BB-B 驗收沛珊 VRM 後改成預設 | P1 |
| BUG-06 | 跳過時間的「會錯過」警告：已遲到超過 15 分鐘的課還警告（flow_playtest_fixes C） | 瀏覽器回歸 10-16 | LAWWW-B | ✅ | 單元 ✅、瀏覽器重跑排隊 | 已整合待測試 | 4d0170d4 | run8 重跑 flow_playtest_fixes（D 項是 C 連帶） | P0 |
| BUG-07 ★ | evtest 載入時有一個資源 404 | evtest 10-16 | LAWWW-B | ✗ | — | 待開工 | — | 找出哪個檔案 | P2 |
| BUG-08 | 考試中直向畫面題目後面露出「離開教室」 | LAWWW 交班第 2 點 | LAWWW-B | ✗ | — | 待開工 | — | 確認考試中按不到、看不到 | P1 |
| BUG-09 ★ | 程式註解還寫「等 AA／還沒做」但其實已做（events.js:828、841、891；story3d.js:816、861、950） | v2 稽核 | LAWWW-B | ✗ | — | 待開工 | — | 改註解，免得之後誤判 | P3 |
| BUG-10 ★ | 法服筆記舊字「萬才館二樓研討室 A」（story3d.js:465；:1147 已是新字） | v1 稽核 | LAWWW-B | ✗ | — | 待開工 | — | 照 F7 改 | P2 |

## 3. 測試缺口（TEST）

| ID | 項目 | 來源 | 狀態 | 證據／下一步 | 優先 |
|---|---|---|---|---|---|
| TEST-01 | 考試的真實上課→交卷流程，直向、橫向截圖進 repo | LAWWW 交班第 2 點 | 進行中 | tools/shots/exam_real_flow.py 10-15 在本機跑過、通過，但截圖和結果不在 GitHub；要重跑、截圖 commit、連 BUG-08 一起看 | P1 |
| TEST-02 | 瀏覽器回歸 evtest、main_day12、first_meet、playtest_fixes | LAWWW 交班第 3 點 | 進行中 | 10-16：evtest 260 個 0 錯、flow_main_day12 ALL PASS、flow_first_meet ALL PASS、flow_playtest_fixes 2 項失敗 → BUG-06 修好、run8 重跑 | P0 |
| TEST-03 | flow_classes A 段、flow_course_choice（大四上） | LAWWW 交班第 3 點 | 已驗收 | 10-15 LAWWW-B 跑過 ALL PASS（scratchpad；改寫 3fbaca94、8166f17b） | — |
| TEST-04 | 今天新功能的瀏覽器驗證：空橋 flow_skybridge、政大背景 outing_bg_check、載妹墊上車、週末回家、閒聊階梯對話框直／橫、總圖導覽 flow_lib_tour、公館回歸 | 10-16 新功能 | 進行中 | run4～run8 排隊中 | P1 |
| TEST-05 | iPhone 實機（全部） | CLAUDE.md | 等待其他AI／素材 | 要使用者實測 | P1 |
| TEST-06 ★ | tests/romance_unit.js、ladder_unit、home_unit、kai_dorm_unit、bike_seat_unit 沒有進 tests/release_suite.sh | v6 稽核 | 待開工 | 加進發布前測試 | P2 |

## 4. 素材整合（ART，LAWWW2／LAWWW2-B 交付）

| ID | 素材 | 交付 SHA | 在樹裡 | 接進程式 | 狀態 | 下一步 | 優先 |
|---|---|---|---|---|---|---|---|
| ART-01 ★ | campus_socsci 新社科院外觀 | 2a316b76 | 是 | 否（只在 manifest） | 已實作待整合 | 照 second_ai/VISUAL_REVIEW.md:2025 接線 | P3 |
| ART-02 ★ | furniture_study 的教室門模組（door_frame／leaf／plate） | 167fc2d0 | 是 | 否 | 已實作待整合 | teach3d 換門 | P3 |
| ART-03 ★ | lane118_street.glb（118 巷） | add0720b／f570fff3 | 是 | 否（沒有 118 巷區域） | 暫停 | 等排區域（lane118_layout.js 已有） | P3 |
| ART-04 | prop_pothos.glb | 2baa5ac1 | 是 | 否 | 暫停 | 使用者降低優先 | P3 |
| ART-05 | 角色 VRM bl_zhe、xinci、bohan、kexin、peishan | 多個／78db4a6 | 是 | 只在 ?blchar | 等待其他AI／素材 | BB-B 驗收（D59）後改預設 | P2 |
| ART-06 | 8 個路人 bl_npc_* | f84bee82 等 | 是 | 只在 ?npcnew | 暫停 | 已知缺點（空氣瀏海等）、多 20 MB | P3 |
| ART-07 ★ | 便利商店商品第二版 | LAWWW2-B a41c52e7 | 是 | 是 | 已整合待測試 | 第 2 級 run13 通過；美術等使用者看截圖 | P3 |
| ART-08 ★ | 女舍門廊吸頂燈加大＋門口的光（fe8d016d） | LAWWW2-B 6f982441、fe8d016d | 是 | 是 | 已整合待測試 | 第 2 級 run13 通過（光暈＋光圈 6 樣晚上都亮）；美術等使用者看截圖 | P3 |
| ART-09 ★ | 6 張新立繪 jiahao、pinyu、tangrui、weilun、xun、yule | LAWWW2-B 8fbe1e1a | 否 | 否（沒有角色 id） | 等待其他AI／素材 | 等 V0／V2 的人物資料（BB-B） | P2 |
| ART-10 | 自強十舍（政大宿舍樓下長椅）nccu_dorm | LAWWW2-B 佇列 | — | 位置已留（outings3d S.BG） | 等待其他AI／素材 | 等使用者照片 | P2 |
| ART-11 | 政大・校園裡的路 nccu_campus | LAWWW2-B 佇列 | — | 位置已留 | 進行中 | LAWWW2-B 在算（夜晚主圖，AA_147） | P2 |
| ART-12 | 台北的家 2D：home_living、home_balcony | LAWWW2-B 佇列 | — | home3d／events 已讀這兩個 key | 進行中 | 腳本完成，算正式圖 | P2 |
| ART-13 | 明軒、小語模型（第一次出現大一上第 7 週） | ae6e4dfa、0205552d（WIP 腳本） | 否 | — | 待開工 | LAWWW2-B 接 A 的 WIP 腳本、BB-B D59（D84 稽核：原本誤標「等待」） | P2 |
| ART-14 | 約會底圖（32 處只有 9 處）、以安／語彤的約會人物圖 | BB_132；企劃線 art/ | 部分 | 否 | 等待其他AI／素材 | BB-B／使用者生成 | P2 |
| ART-15 | CG：v3 BCG-01、02、CG-2、2b；v4 CG-5、6、13、16、17、22、23、BCG-03、08、09、12、13、17；v5 CG-8、10、12；v6 CG-18～21、BCG-19～26；Q5 BCG-11 | cg_approved/、CG_正式製作清單 | 部分 | CG_REGISTRY 只有大一的 5 張 | 等待其他AI／素材 | 跟著各學期事件接；圖通過才接 | P2 |
| ART-16 | 新立繪：學姊（面試西裝、學士服、碩一、羽絨外套）、子晴爸爸、溫爸溫媽、香港朋友、芷若學士服、沛珊書店圍裙、以安冬裝 | v3／v4 稽核 | 否 | 否 | 等待其他AI／素材 | BB-B 要圖 | P2 |

**D84 稽核新增（2026-10-16；LAWWW2 的佇列順序以 `docs/handoff/DISPATCH_AUDIT_2026-10-16.md` 第 2 節為準；每項的接收者、分支、交付標準、ACK 在 tasks.json 的 xai）**

| ID | 素材 | 玩家第一次遇到 | 負責 | 狀態 | 下一步 | 優先 |
|---|---|---|---|---|---|---|
| ART-BG02 | 公館・滷味攤 gongguan_luwei | 大一上第 9 週（考完的宵夜） | LAWWW2 | 待開工 | 3D 拍 20:30 騎樓攤車 | P1 |
| ART-BG05 | 宿舍頂樓 dorm_roof | 大一上跨年 | LAWWW2 | 待開工 | Blender 頂樓 | P1 |
| ART-BG18 | 視訊（可昕那一端）video | 大一上期末起 | LAWWW2 | 待開工 | 書桌一角＋檯燈 | P1 |
| ART-BG15、BG16、BG17 | 社科院門口、霖澤館前、椰林大道（傍晚） | 大一下第 6 週 K2 | LAWWW2 | 待開工 | 遊戲 GLB 取鏡頭 | P1 |
| ART-BG13 | 溫州街・課輔班門口 | 大一下第 5 週起 | LAWWW2 | 待開工 | 溫州街 GLB | P2 |
| ART-BG08、BG11 | 車上（三版）、山上夜晚版（D09） | 大一下春假 | LAWWW2 | 待開工 | — | P2 |
| ART-BG09、BG10 | 海邊（D25）、老街（D18） | 大一下春假 | LAWWW2 | 等待其他AI／素材 | AA-B 回答白天或黃昏 | P2 |
| ART-BG12 | 海邊的小鎮（D13） | 大一下春假 | LAWWW | 待開工 | D13 有圖就接 | P2 |
| ART-BG14、BG19、BG20 | 永康街咖哩店、公館二輪戲院、豆漿店 | 大一下 | LAWWW2 | 待開工 | 查證、店名照 D77 | P2 |
| ART-CH-XUN | 阿勳 3D（VRM） | 大一下 10-3、SK05；v0 整年 | LAWWW2 | 待開工 | BB-B D59 | P1 |
| ART-CH-PINYU | 品妤 3D（VRM） | 大一下 K2；v0 整年 | LAWWW2 | 待開工 | BB-B D59 | P2 |
| V0-ARTPLAN | v0 美術盤點 → 建 v0 的美術任務 | 經濟系開學 | LAWWW＋AA-B | 待開工 | v0 程式開工前完成 | P1 |


## 5. 舊帳號留下的半成品（WIP）

| ID | 項目 | 位置 | 狀態 | 下一步 |
|---|---|---|---|---|
| WIP-01 | 可昕第 9 節（大一下）半成品 patch | `wip_backup/kexin_y1s2_s9_wip_2026-10-14.patch`（帳號 A；9-1 寫「寒假在嘉義」，和臺北人衝突） | 暫停 | 以企劃線最新 BB_96 第 9 節為準重寫（V2-B9）；patch 保留不刪 |
| WIP-02 | LAWWW2 帳號 A 的 8 條 `-wip-*` 分支 | 遠端 | 暫停 | 沒有獨有素材（稽核確認）；保留 |
| WIP-03 | 便利商店商品 WIP（帳號 A 208f242「不要整合」） | 遠端 | 取消／被取代 | 被 ART-07（LAWWW2-B a41c52e7）取代 |
| WIP-04 | 貼圖追蹤工具（tex_leak.py、tex_leak2.py） | LAWWW-B scratchpad，沒有 commit | 進行中 | BUG-01 找到原因後放進 tools/dev_scratch/ |

## 6. 學年內容

### 6.0 v0 經濟系大一（交接包_v0_經濟系大一_交付清單、BB_104／105／110／112）——授權 D79；企劃 ✅；**遊戲裡沒有可以玩的經濟系那一年**

| ID | 項目 | 程式 | 狀態 | 證據／缺什麼 | 優先 |
|---|---|---|---|---|---|
| V0-A1 | Y0 日曆 | ◐ | 進行中 | calendar.js Y0S1、Y0S2；校定活動沒有 | P2 |
| V0-A2 ★ | Y0 課表 | ✗ | 待開工 | courses 沒有 Y0；syllabus 只有資料 | P2 |
| V0-A3 ★ | 存檔分經濟系／法律系階段、開局選擇 | ✗ | 待開工 | newGame 一律從法律系第一天 | P2 |
| V0-A4 ★ | 經濟系存檔帶到法律系 | ◐ | 待開工 | 現在用預設值代替（dating_kexin、ROOM_ITEMS） | P2 |
| V0-A5 ★ | 休學後改成重考準備 | ✗ | 待開工 | — | P2 |
| V0-A6 ★ | 經濟系開學典禮、系館 | ◐ | 待開工 | 建築有、場景與事件沒有 | P2 |
| V0-A7 ★ | E22b、E23、E24b、E24c 走向法律（E24C_REASON） | ✗ | 待開工 | — | P2 |
| V0-A8 | 法律系第一天旁白＋可昕訊息 | ✅ | 已驗收 | story3d.js:480、487；v1_batch2 | — |
| V0-B1 ★ | BB_104 E01～E37 | ✗ | 待開工 | 台詞 0 筆 | P2 |
| V0-B2 ★ | BB_105 P1、B1、B2、D2 | ✗ | 待開工 | — | P2 |
| V0-B3 ★ | BB_112 阿勳 A1～A3、唐睿／品妤 T1～T3、韋綸的腳踏車、重考日常 R1～R8 | ✗ | 待開工 | 經濟系四人＋家豪學長沒有角色資料（ART-09 立繪已有） | P2 |
| V0-B4 ★ | BB_110 F1、T0a、T0b、C1、C2、L5a、L5b | ✗ | 待開工 | — | P2 |
| V0-B5 | BB_102 Y0 課堂內容 | ◐ | 待開工 | 只有資料 | P2 |
| V0-E1 ★ | 回聲 P4（經原第 3 週 full／half／none）、P4b、P4c、P4e、D1 | ✗ | 待開工 | courses.js:52 | P2 |
| V0-E2 | 回聲 P4d「你怎麼又在這裡？」 | ✅ | 已驗收 | ev_econ_hallway；v2_econ_unit | — |
| V0-E3 | ECON_PAST_SHARED 的設定與讀取 | ◐ | 進行中 | 迎新、K3、ev_xinci_double、芯慈閒聊 | P2 |
| V0-SK ★ | SK01～SK14 社科院附近的跨學年日常 | ✗ | 待開工 | 只有 SK03 一句預告 | P2 |

### 6.1 v1 法律系大一上（交接包_v1_交付清單、BB_95）——v9.7 已發布

| ID | 項目 | 狀態 | 證據／缺什麼 | 優先 |
|---|---|---|---|---|
| V1-ALL | A1～A23、B1、K1、K1b、K2、K4、9-8、B3、BB_95 第 0b 節全部 | 已驗收 | v9.7（313d620）；v1_batch1～12；抽查台詞逐字相同（10-16 稽核） | — |
| V1-A5 ★ | 考古題沒有限制第 7 週 | 待開工 | 小事 | P3 |
| V1-A6 ★ | 麵店的糾紛沒有第 15 週下限（只看 SHARED_MEAL） | 待開工 | 小事 | P3 |
| V1-A10 ★ | 語 1 傅鐘旁的早餐：吉他社入口沒接（guitar_invite、社團筆記）、BREAKFAST_YU 沒人讀 | 待開工 | 問 AA-B 吉他社入口的接法（D79） | P2 |
| V1-B9-6 | 可昕 12/3 改成「第一份期末報告交出去的晚上」（不是生日）、KX_BDAY→KX_DEC3 搬移、前一晚的訊息 | 待開工 | BB-B 10-15 交（AA_137）；照定稿做；改 v1_batch10 | P1 |
| V1-F | 法服改成每兩週週六早上（方案 A） | 進行中 | c7c991c5 做了 F1、F2、F5、F7；週六值班本身沒有活動；activities.js:35 讀書會仍是週三晚上（試玩第 25 項）→ 照 AA_131 §6 | P1 |

### 6.2 v2 法律系大一下（交接包_v2_交付清單、BB_96）——授權 D79；企劃 ✅；**沒有全部做完**

做完、有測試的（證據見 10-16 v2 稽核）：C1～C12、C14、C16～C21、BB 2-1～2-6、3-1、3-3～3-6、4-1～4-4、5（明軒那則除外）、BB97 2-9、BB105 4-5 → `V2-DONE`（第 9 節）。

| ID | 項目 | 程式 | 狀態 | 阻礙／下一步 | 優先 |
|---|---|---|---|---|---|
| V2-C13 | 可玩切片：缺 ④共同教學館的阿勳、交往中可昕週四「演講怎樣？」、①憲法課回想（＝C15）、③「欠的，還了。」 | ◐ | 等待其他AI／素材 | 阿勳人物資料（BB-B）；「欠的，還了。」群組（V2-B37） | P1 |
| V2-C15 ★ | 演講後回到課堂（syllabus const_2 w12 的 recall） | ✗ | 等待其他AI／素材 | 帳號 A 的 AA 說大一下 recall 先不匯入 → 10-16 問 AA-B；要的話改 importer＋A 類課堂顯示 | P1 |
| V2-B32 ★ | 明軒 F-M4（JOB_TUTOR）＋手機小事明軒那則 | ✗ | 等待其他AI／素材 | 缺打工系統（AA_72 §3）→ 10-16 問 AA-B 要不要先做最小版 | P2 |
| V2-B37 | 沛珊那張表期末「欠的，還了。」＋法律系一年級班級群組 | ✗ | 等待其他AI／素材 | 10-16 問 AA-B（群組系統）、BB-B（人物與時間） | P1 |
| V2-B10 | BB 第 10 節經濟系的朋友：缺 SK03、10-3 阿勳、10-4 小福的還債、SK05、P4e（只有 10-1 P4d） | ◐ | 等待其他AI／素材 | 阿勳資料、小福 2D 出遊確認（BB-B）；P4e 和 V2-B9 綁 | P2 |
| V2-B9 | 可昕的大一下：9-1 情人節、K5、K7、K6、K6b、生日、手機小事、大一下期末成績（有 9-2 除夕、9-5 K8、9-10 重訪日） | ◐ | 待開工 | 企劃已交（交接板 10-15）；照 BB_96 第 9 節最新版直接做；WIP-01 舊 patch 不用 | P1 |
| V2-L2 | 大一下閒聊階梯（以安 A2-L1～8、語彤 Y2-L1～8，ladder_aa_y1s2.json；AA_139） | ✗ | 待開工 | 匯入工具支援多學期、進度按學期分開；`ev_an_study_group` 換成遊戲裡的事件 id；其他五位 BB-B 寫 | P1 |
| V2-K6 | 重訪日 1 可昕那句永遠走「假設題」（K6 沒做） | ◐ | 待開工 | 跟 V2-B9 一起 | P2 |

### 6.3 v3 法律系大二（交接包_v3、BB_97）——授權 D79；企劃 ✅（AA、BB 審完）；程式 ✗（全部「待開工」，除另註）

共同前置：SYS-05 每年重複的活動、SYS-06 第二個房間、SYS-07 每週訊息、SYS-08 精華日／摘要日、SYS-09 模擬法庭、ART-15 CG、ART-16 立繪、2D 背景（河堤夜景、山屋與步道、研究室門口、政大小教室、老街＋回程公車、社科院一樓、畢業典禮人潮）。

| ID | 項目 | 週 | ID | 項目 | 週 |
|---|---|---|---|---|---|
| V3-D1 ★ | 主線 3 第二個房間 | 上·開學前 | V3-D13 ★ | 過年（大二） | 寒假 |
| V3-D2 ★ | 主線 4 被需要的一年 | 整年 | V3-D14 ★ | 杜鵑花第二張、主線 8 交換說明會 | 下 3、4 |
| V3-D3 ★ | 開學第一頓／中秋／迎新（大二） | 上 2–4 | V3-D15 ★ | F-哲 3 押金、翰 3 | 下 5 |
| V3-D4 ★ | 語彤 7 法服第一次值班 | 上 4 | V3-D16 ★ | 模擬法庭 模 1～模 6 | 下 1–10 |
| V3-D5 ★ | 翰 2 考古題小組 | 上 7 | V3-D17 ★ | 語彤 8 買賣不破租賃（課堂板書已有） | 下 6 |
| V3-D6 ★ | 以安新 8 讀書會的規則 ev_plg_rules | 上 7 | V3-D18 ★ | 春假（大二） | 下 7 |
| V3-D7 ★ | G1 大二版、語彤 10 | 上 8–9 | V3-D19 ★ | G1 大二下、以安新 12 | 下 9–10 |
| V3-D8 ★ | 校慶（大二）、哲 2 | 上 10 | V3-D20 ★ | 語彤 9 迴避 | 下 12 |
| V3-D9 ★ | 以安新 10 家教（一） | 上 13 | V3-D21 ★ | 系籃、語彤 11 | 下 14 |
| V3-D10 ★ | 慈 3 第二名 | 上 14 | V3-D22 ★ | G4 學姊畢業典禮、以安新 13 | 下 15 |
| V3-D11 ★ | 系籃、語 3 在一起（yu.partner 保底寫第 13 週，和規格第 15 週不一致） | 上 15 | V3-D23 ★ | 期末最後一頓、重訪日 2 | 下 18 |
| V3-D12 ★ | 聖誕、跨年、期末最後一頓（大二） | 上 16–18 | | | |

BB_97 第 0b 節（全部「可以交」）：V3-B01 ★ 阿凱 K3 週日宵夜；V3-B02 ★ 學姊 W6 handover；V3-B03 ★ W7 prof_xu_door；V3-B04 ★ W8 ev_sis_collapse（BCG-01）；V3-B05 ★ W9 skip_interview；V3-B06 ★ M2 new_topic；V3-B07 ★ 模擬法庭的學姊台詞；V3-B08 ★ M3 results＋上榜聚餐；V3-B09 ★ W10 graduation＋重訪日 2；V3-B10 ★ 子晴 Q7 lab_letter；V3-B11 ★ Q8 dad_visit（BCG-02）；V3-B12 ★ Q9 show2；V3-B13 ★ 沛珊 P3 decision；V3-B14 ★ 沛珊和柏翰分開了；V3-B15 ★ P4 handover；V3-B16 ★ P4b study_with；V3-B17 ★ P5 spring_call；V3-B18 ★ 芷若 Z7 applied（舊版還在 events.js:1273，要照 3-4 改寫，`ev_zhiruo_bell` 的交換選項要拿掉）；V3-B19 ★ Z8 concert→admitted；V3-B20 ★ Z9 last_shift；V3-B21 ★ 方奕廷 F2 mountain；V3-B22 ★ 大二的手機小事；V3-B23 ★ 杜可昕的大二（第 9 節約 20 件）。

### 6.4 v4 法律系大三＋三條交換路線（交接包_v4、BB_98、AA_30）——授權 D79；企劃 ✅；程式 ✗（除另註）

共同前置：SYS-05、SYS-06（第三個房間）、SYS-10 交換路線狀態機、SYS-11 生病週、SYS-12 日曆延伸（大五上、颱風假、校定假日）、ART-15、ART-16、2D 背景（地方法院、行政法院、桃園機場、車內、日本、美國）。

| ID | 項目 | 週 | 路線 | ID | 項目 | 週 | 路線 |
|---|---|---|---|---|---|---|---|
| V4-E1 ★ | 主線 5 第三個房間 | 上·開學前 | 全 | V4-E13 ★ | 聖誕、語彤 13、跨年 | 上 16–17 | 全 |
| V4-E2 | 刑訴第一堂（課表、syllabus、QBANK 已有；舊 ev_class_crimpro 第一句「上週…」和第 1 週衝突） | 上 1 | 全 | V4-E14 ★ | 以安新 16 送機 | 上 18 | 全 |
| V4-E3 ★ | 語彤 13b 助教、哲 3 隊長 | 上 1 | 全 | V4-E15 ★ | 主線 7 姊姊、主線 9 土地資料（二） | 寒假 | 全 |
| V4-E4 ★ | 語彤 12 那把傘（CG-6） | 上 2 | 全 | V4-E16 ★ | 語 4、語 5、慈 6、哲 4＋冠軍賽 | 下 3–11 | 全 |
| V4-E5 ★ | 中秋、迎新（大三；芷若視訊） | 上 2–3 | 全 | V4-E17 ★ | G5 子晴、芷若畢業 | 下 16 | 全 |
| V4-E6 | 旁聽＋以安新 14＋慈 4（只有刑訴第 7 週板書） | 上 7 | 全 | V4-E18 ★ | 期末「大四要怎麼過？」 | 下 18 | 全 |
| V4-E7 ★ | 主線 6 感冒的那一週（CG-5） | 上 9 | 全 | V4-E19 ★ | T1 空出來的週四＋田野的發現 | 下 2 起、6 | TW |
| V4-E8 ★ | 翰 4、校慶（大三） | 上 10 | 全 | V4-E20 ★ | 228、杜鵑花第三張、清明 | 下 3、4、8 | TW |
| V4-E9 ★ | 阿哲的機車 | 上 11 | 全 | V4-E21 ★ | 以安新 17 町公所的通知 | 下 12 | 全（JP＝J2） |
| V4-E10 ★ | 交換志願表＝以安新 15（EXCHANGE_ROUTE） | 上 11 | 全 | V4-E22 ★ | 重訪日 3 | 下 15 | 全 |
| V4-E11 ★ | 語彤 14 續約 | 上 12 | 全 | V4-E23 ★ | J1 異鄉的便利商店 | 下 2 | JP |
| V4-E12 ★ | 慈 5 對答案 | 上 13 | 全 | V4-E24 ★ | 香港朋友 1～5、芝加哥的週末 | 下 1–10 | US |

BB_98 第 0b 節：V4-B01 ★ 芷若 Z10 明信片＋Z11／Z11b／Z12／Z13；V4-B02 ★ 學姊志願表反應、感冒週、W15c 送機、US0、US1～US4＋芝加哥、M6；V4-B03 ★ 子晴 Q8b、Q10、Q11、Q12、Q13、Q15；V4-B04 ★ 沛珊 P5b、明軒 M3、阿凱 K4、方奕廷 F3；V4-B05 ★ 大三手機小事、杜可昕的大三（第 9 節）；V4-B06 學姊伴侶期保底 Y3S1 第 9 週沒接事件（見 D14-T14）。M4、M5（助教）＝取消（BB_98：遊戲不出現助教）。
路線：V4-R-TW ★、V4-R-JP ★（日本背景、以安冬裝、時差 +1）、V4-R-US ★（3D 校外公寓社區（10-16 更正）、2D 機場等、時差 −14、香港朋友名字等使用者）。交換條件（成績、語言）企劃寫「需開發組評估」→ 問 AA-B。

### 6.5 v5 大四・畢業後・尾聲（交接包_v5、BB_99、BB_107 K21～K27）——授權 D79；企劃 ✅；程式 ✗（全部待開工）

V5-F1～F27 ★（AA；第四個房間、重訪日 4／5、R1 時差、以安讀書會＋CG-11、新 18～20、考前一晚（2030/2）、放榜、大四版節日、語彤 15b、二十三週年 CG-8、哲 5／語 6、事件 16（CG-12）、16b、大四選擇、翰 5、過年＋主線 9、杜鵑花第四張、大四春假、系籃最後一場與成發、G6 畢業典禮、主線 11 收拾、期末最後一頓與搬走、畢業後篇、尾聲 G7＋CG-10）；V5-B01～B16 ★（BB_99 2-1～9 節：學姊 M7～M9、W15、交往中三件；芷若第二輪明信片、子晴 Q14、阿凱 K5、方奕廷 F4、明軒 M4、沛珊 P6（BCG-05）、畢業典禮與尾聲的 BB 人物、可昕的大四）；V5-K21～K27 ★（可昕：約讀書真的有讀、兩個方向的讀書會、各自的路、兩個畢業典禮、讀書會最後一晚、畢業後第一個我們的日子、走向 A）。前置：SYS-12 時間軸延伸（畢業後、國考、五年後）、D14-T7 國考、v6、ART-15。

### 6.6 v6 多段感情（交接包_v6、AA_123、BB_119、AA_126 §9）——使用者 10-14 同意（v9.7 之後的版本）；授權 D79

| ID | 項目 | 程式 | 狀態 | 阻礙／下一步 | 優先 |
|---|---|---|---|---|---|
| V6-S1 | dating_* 同時最多一個 | ◐（568e1feb） | 取消／被取代 | **使用者後來允許多重交往（AA_126 §9、AA_123 開頭）；交付清單 S1 過時** → 被 V6-S1b 取代；romance3d 要改寫（目前沒有事件呼叫，不影響遊戲） | — |
| V6-S1b ★ | 交往狀態照 AA_126 §9：romance[id]（狀態、開始、她知道誰、懷疑值、歷史），允許多段同時 | ✗ | 待開工 | 先請 AA-B 對齊 v6 交付清單 S1、AA_123 2-1 表格與開頭的矛盾 | P2 |
| V6-S2 | ROMANCE_HISTORY | ◐ | 進行中 | 只在讀檔遷移；start／end 沒有事件用 | P2 |
| V6-S3 | EX_<id> | ◐ | 進行中 | 沒有分手事件、沒有前任版條件 | P2 |
| V6-S4 | 收拾的時刻＋一週自動補（CLEANUP_DONE） | ✗ | 待開工 | BB_119 2-1～2-5 的物件台詞 | P2 |
| V6-S5 | 裂縫計數 → 談話事件 | ✗ | 待開工 | — | P2 |
| V6-S6 | 戀愛 CG 開關＋CG 圖鑑 | ✗ | 待開工 | 沒有圖鑑 | P2 |
| V6-S7 | 存檔 | ✅ | 已整合待測試 | 568e1feb；romance_unit 9 項（沒進 release_suite，TEST-06） | P2 |
| V6-A1～A8 ★ | 以安、語彤：告白條件、分開路線、前任版、16b 面對面、麵店團反應、CG-18～21 | ✗ | 待開工 | 跟著 v3～v5 事件接 | P2 |
| V6-B1～B7 ★ | 沛珊戀愛線三件、芷若 BCG-25、子晴 BCG-26、分開路線、晚一點的告白窗口、前任版通則、BCG-19～26 | ✗ | 待開工 | 同上 | P2 |

## 7. 32 處校外約會＋告白（交接包_校外約會、AA_128、date_locations.json、lines/ D01～D32、BB_132）——授權 D79；台詞 32 處全部交付（企劃線 cf959b8f）；程式 ✗

| ID | 項目 | 程式 | 狀態 | 阻礙／下一步 | 優先 |
|---|---|---|---|---|---|
| DATE-S1 ★ | 三種相處的分法（計數） | ✗ | 待開工 | 依賴 D14-T8 關係階段 | P2 |
| DATE-S2 ★ | 地點資料 D01～D32 匯入（date_locations、lines、DATE_LIKES） | ✗ | 待開工 | 寫匯入工具（台詞一字不改） | P2 |
| DATE-S3 | 預約與衝突檢查（考試、錢、一天最多兩場） | ◐ | 待開工 | INV.decide 有基礎；依賴 D14-T3 考試進課表 | P2 |
| DATE-S4 | 出發地與交通（從家／宿舍、needsCar、大眾運輸、取車還車各 30 分） | ◐ | 待開工 | carWithMe 只在 home3d；OUT 固定「開車 30 分鐘」 | P2 |
| DATE-S5 | 出發時間到：改時間、FLAKED | ◐ | 待開工 | OUT.prompt 有出發／晚一點／不去了 | P2 |
| DATE-S6 ★ | 半互動約會：2D 底圖＋人物透明圖＋熱區＋結算＋Life Album | ✗ | 待開工 | BB_132 規格；ART-14 | P2 |
| DATE-S7 | 任一方有伴侶（knows、四級曝光、懷疑值） | ◐ | 待開工 | 依賴 V6-S1b | P2 |
| DATE-S8 | 四年裡約得到的時間（11-2 七位女主角的四年表） | ◐ | 待開工 | presence 機制有 | P2 |
| DATE-C1～C7 ★ | 第一批十處台詞接入、淡水示範、七位心願事件、告白條件接各人告白、節日開車約會 | ✗ | 待開工 | 依賴 SYS-02 告白框架 | P2 |
| DATE-L01～L32 ★ | 32 個地點各自可玩（有底圖才出現在清單） | ✗ | 待開工 | 9 處有底圖（D01、D02 晴雨、D03、D05、D06、D09、D13、D18、D25） | P2 |

## 8. 10/14 系統決策（交接包_1014決策_交付清單）＋共用系統（SYS）

| ID | 項目 | 程式 | 狀態 | 證據／下一步 | 優先 |
|---|---|---|---|---|---|
| D14-T1 | 跑步永遠不受體力限制 | ✅ | 已整合待測試 | 速度和 energy 無關（engine3d.js:286）；沒有專門測試 | P3 |
| D14-T2 | 期末考系統（五題、計分、課堂題優先、題庫不足不開考） | ✅ | 已整合待測試 | CLS.runExam；aa130_exam_unit；「強制進考場」沒查證；TEST-01 | P1 |
| D14-T3 ★ | 考試時段標在課表、行事曆；邀約自動避開 | ✗ | 待開工 | DATE-S3 前置 | P2 |
| D14-T4 | 非法律課出席三堂及格、第 12 週提醒 | ◐ | 待開工 | 成績照準備值算 | P2 |
| D14-T5 | 被當、暑修、重修、延畢 | ◐ | 等待其他AI／素材 | 暑修以後等使用者（AA_126 §12-1） | P2 |
| D14-T6 ★ | 書卷獎 | ✗ | 待開工 | — | P2 |
| D14-T7 ★ | 國考 | ✗ | 待開工 | v5 前置 | P2 |
| D14-T8 ★ | 關係六階段、各自的戀愛值、進度條、告白 | ✗ | 待開工 | SOCIAL 仍是 8 階、單一 rom；告白／約會／邀約台詞都要讀它（SYS-01） | P2 |
| D14-T9 | 邀約回覆依階段變化（BB_123 每階段 3～4 句、不連續重複） | ◐ | 待開工 | 現在只分 A／R | P2 |
| D14-T10 ★ | 健身與體態 | ✗ | 待開工 | — | P3 |
| D14-T11 | 節日（三個情人節、一天最多兩場、視訊版、禮物） | ◐ | 待開工 | 只有大一的中秋、聖誕、跨年 | P2 |
| D14-T12 | 汽車開放事件（「開遠一點了」） | ◐ | 待開工 | 週末回家取車有了（34ea3694） | P2 |
| D14-T13 | 多重交往（romance[id]、suspicion、knows、對質） | ✗ | 待開工 | ＝V6-S1b；多線被發現的結局等使用者 | P2 |
| D14-T14 | 溫學姊戀愛線（BB_122 C1～C4 條件式檢查點、SIS_HEALED、告白、保護條款） | ◐ | 待開工 | 分手固定在 Y3S1 第 9 週（characters.js:44、partner_period_unit） | P2 |
| D14-T15 | 舊存檔（學姊大三上第 9 週以後補記 C3） | ◐ | 待開工 | — | P2 |
| SYS-01 ★ | 關係階段重做（＝D14-T8） | ✗ | 待開工 | 告白、約會、邀約的前置 | P2 |
| SYS-02 ★ | 通用告白框架（第 6 階、正式約會 ≥4、去過心願地點、她的前置、她願意；「還沒」不鎖線） | ✗ | 待開工 | 依賴 SYS-01、V6-S1b | P2 |
| SYS-03 ★ | 約會核心（DATE-S2～S5） | ✗ | 待開工 | 依賴 D14-T3 | P2 |
| SYS-04 ★ | 2D 疊圖場景（DATE-S6） | ✗ | 待開工 | — | P2 |
| SYS-05 ★ | 每年重複的活動（中秋、迎新、校慶、聖誕、跨年、G1、春假、杜鵑花、畢業典禮、重訪日、期末最後一頓）的年級版本 | ✗ | 待開工 | 現在都是大一專用、只演一次 | P2 |
| SYS-06 ★ | 第二～四個房間（主線 3、5、10）：2D 背景＋物件清單（AA-B 10-16 同意），3D 房間留到美術段 | ✗ | 待開工 | — | P2 |
| SYS-07 ★ | 每週訊息介面（主線 4） | ✗ | 待開工 | 手機基礎有 | P2 |
| SYS-08 ★ | 精華日／摘要日（AA_90 第 10 節） | ✗ | 待開工 | 被略過的日子事件要順延 | P2 |
| SYS-09 ★ | 模擬法庭（模 1～6，霖澤館 201 擺成法庭） | ✗ | 待開工 | — | P2 |
| SYS-10 ★ | 交換路線狀態機（EXCHANGE_ROUTE、F.abroad、presence、停課、事件條件「路線」） | ✗ | 待開工 | — | P2 |
| SYS-11 ★ | 生病週（主線 6） | ✗ | 待開工 | — | P2 |
| SYS-12 ★ | 日曆與時間軸延伸（大五上、畢業後、國考、五年後；颱風假、校定假日） | ✗ | 待開工 | calendar 只到 Y4S2 | P2 |
| SYS-13 ★ | 打工系統（AA_72 §3；明軒 F-M4 的前置） | ✗ | 等待其他AI／素材 | 10-16 問 AA-B | P2 |
| SYS-14 ★ | 班級群組（法律系一年級） | ✗ | 等待其他AI／素材 | V2-B37 | P1 |
| SYS-15 ★ | 閒聊階梯多學期（一學期一個檔、進度按學期） | ✗ | 待開工 | V2-L2 | P1 |
| SYS-16 ★ | 帳號 A 的 AA、BB 接班時讀得到新規則：企劃線交接檔加固定區塊＋五份規則檔副本 | — | 等待其他AI／素材 | 第 13 節；10-16 請 AA-B | P1 |

## 9. 已驗收／已整合待測試（新帳號 2026-10-15～16 完成，含證據；封存區）

| ID | 項目 | 狀態 | SHA | 證據 |
|---|---|---|---|---|
| DONE-B01 | AA 的 P0：課堂提問＋重新匯入 | 已整合待測試 | 0feac473、8e7487a8 | class_ask_unit；class_ask_screen.py（捷徑截圖） |
| DONE-B02 | 試玩 26 項第一～三批（鏡頭、手機、當面約、腳踏車 8.5 m/s 等） | 已整合待測試 | a8f2d25b、d5696fd7、62b274d0 | 單元測試；瀏覽器部分（TEST-02、TEST-04） |
| DONE-B03 | 遲到規則（AA_137 §4）、教室的人陸續進來（§8） | 已整合待測試 | 93957aad、54146f5c、b53f7967 | classes_unit |
| DONE-B04 | 阿哲第二天台詞、法服方案 A F1/F2/F5/F7 | 已整合待測試 | c7c991c5 | 單元 |
| DONE-B05 | 對話立繪換成 10/14 確認圖（BB_131 P0）、芷若 cafe、表情 8 張 | 已驗收（BB-B ART_APPROVED） | 23adcc3e、d303eb6d、fc56ccde | portrait_check.py ALL PASS（直／橫／旋轉） |
| DONE-B06 | 讀書主題照科目（AA_134 §1） | 已整合待測試 | 417588fe | 單元 |
| DONE-B07 | 手機和選單整合 | 已整合待測試 | 59ad9faa | 單元；截圖待拍 |
| DONE-B08 | 總圖導覽（AA_134 §2） | 已整合待測試 | eeab8b36 | flow_lib_tour 排隊（run8） |
| DONE-B09 | 約好同行（AA_137 §7） | 已整合待測試 | cae43fb2 | invites_unit |
| DONE-B10 | 閒聊階梯大一上（七位）＋linesIf／extraIf／skipIf＋EVENTS.cond any | 已整合待測試 | 6b7b24a3、00179902、944d706a、17383f2d | ladder_unit 18 項；對話框直／橫待拍 |
| DONE-B11 | 政大背景（校門、小吃街）＋AA_137 7-1 場景對應 | 已整合待測試 | 00179902 | v1_batch7；outing_bg_check 排隊 |
| DONE-B12 | 空橋走得過去 | 已整合待測試 | 944d706a、c81ad68f | nav_teach_unit；flow_skybridge 排隊 |
| DONE-B13 | 載妹墊（D78：開局就有、學姊也坐） | 已整合待測試 | fc56ccde、305052b2 | bike_seat_unit、bike_unit；上車動畫待瀏覽器 |
| DONE-B14 | 阿凱宿舍事件 K-D1～6 | 已整合待測試 | b4a138ae | kai_dorm_unit |
| DONE-B15 | 公館腳踏車行（街景） | 已整合待測試 | 305052b2 | 公館回歸排隊（run7） |
| DONE-B16 | 週末回臺北的家 | 已整合待測試 | 34ea3694 | home_unit；瀏覽器待測；旁白與數值待 AA-B 確認（D79） |
| DONE-B17 | 多段感情地基（ROMANCE_HISTORY 等；S1 那條已被取代） | 已整合待測試 | 568e1feb | romance_unit |
| DONE-B18 | 跳過時間警告修正 | 已整合待測試 | 4d0170d4 | 單元；run8 |
| V2-DONE | v2 大一下做完的 30 多件（見 6.2） | 已整合待測試 | 帳號 A 為主 | v2_* 單元；瀏覽器部分（flow_b4_lecture 等） |
| V1-ALL | v1 大一上 | 已驗收 | v9.7 313d620 | 發布前回歸 |

## 10. 取消／被取代

| ID | 項目 | 取代／授權 |
|---|---|---|
| V6-S1 | dating_* 同時最多一個 | 使用者允許多重交往（AA_126 §9）→ V6-S1b |
| WIP-03 | 便利商店商品 WIP（A 208f242） | ART-07 |
| X-01 | 期末考抽法 EXAM_MIX 3_2 | AA_126 1-5 定案拿掉（8e7487a8） |
| X-02 | AA 的五題（會不會被當等） | 使用者 10-14 已回答（D74） |
| X-03 | 公館單車行加裝載妹墊 | D78（開局就有） |
| X-04 | v4 助教 M4、M5 | BB_98（遊戲不出現助教） |

## 11. 交班快照歷史

### 帳號 C → 下一個帳號（看使用者對哪一邊說話）｜LAWWW-C｜2026-10-21 14:5x UTC 正式交班（使用者「現在正式交班」；每週用量 98%；AA-C、BB-C、LAWWW2-C 已在 14:30 交班）

**A｜本班成果（10-19 02:0x 重新值班以後；細節在 tasks.json、deliveries.json、CANDIDATE_9103.md、PLAYER_FEATURES_v9.10.3.md）**
- v9.10.3 候選 f72a2a21：發布前清單 14 支＋reachability_all（29 區、1099 點）＋save_compat_start1（舊版 v9.9.1）ALL PASS；BB-C 判定可以發布（856cece9、145d6a74）。**沒有發布**（見 F、B 第 1 項）。
- 今天最後一段合進開發分支、都已 push：AA_362 句子（3c6b9440）、手機自動打開一次記全部（4c90c913，BUG-PHONE-REOPEN-1021）、AA-C 交班兩句（bc7c8823）、AA_360 劇情審查 13～18（2bce84da）、右上角日期跟上跳時間（cbf820a3）、經濟系手機小事也和別的訊息隔 3 天（a6441e98）、AA_357 大五上交換延畢（dd578e81：阿凱 2029-06-28 起在臺北上班、方奕廷 2028-07-01 起在嘉義的 presence 衝突兩邊都留）。
- 交班保存：65af7530（搖桿調查、子代理備份）＋本筆。

**B｜全部未完成（照順序；全部在 tasks.json）**
1. **RELEASE-9103／BUG-SMOKE-JOY-1021（P0，擋發布）**：照 `docs/handoff/release_9103/README.md` 第 5、6 節——重做候選 bcbd4b65（f72a2a21＋phonefix patch）、乾淨環境查 smoke「新遊戲搖桿」為什麼被擋、再跑 flow_v0_start（新版）、touch_flow_wenzhou、flow_exam_terms，全過才發布 v9.10.3。
2. **合併後還沒重跑的單元測試**：AA_357（dd578e81）只跑了 presence_unit；子代理列的約 60 支（y5_delay、pg_cardline、aa331_postgrad、bar_exam、epilogue、presence、holiday_ff、graduation、r2y4b_events、termend、home、move_out_y4、us_life、jp_semester、classes…）要在合併後的樹上跑。AA_360（2bce84da）跑過 16 支 ALL PASS。
3. **子代理 a73c8f28（AA 回覆小修）**：A～D 組在 wip_backup/wip_subagents_1021_1500.bundle（沒合併、沒驗）；E 組（AA_350 第 9 節）沒做（wip.json 的 AAFIX 那一筆）。
4. 等 AA 回答：AA_QUESTIONS_1021（R：AA_360 八題、S：AA-Q-1021-TE＋BUG-ECON-MONEY-1020、T：AA_357 九題，以及更早的 A～Q）。
5. 等 BB 驗收：AA_360、AA_357、C16～C18 三份清單（docs/handoff/bb_checklists/BB_AA360_1021.md、BB_Y5_1021.md；C16～C18 在任務總表）、LAWWW2 三件場景截圖判讀（GYM-GLOW-COPLANAR-1021、ART-Y1-BOX-1021、ART-US2-FIX-1018；BB 分支 test_shots/artrev_1021/）、BG-3DSHOT-1021 腳本沒跑、BB218-P3 ①②④⑤（⑥③ 已修只有單元測試）。
6. LAWWW2 的 WIP：SOC-COURT-1021（社科院中庭夜間光＋公告欄，2b4f2028，GLB 沒換）、PS-SKIRT-LEG（27618d8d）、榕樹氣根黑線（查一半）。
7. 交班中才收到、登記給下一班的：
   - BUG-US-BED-ALARM-1022（P1，BB 15:02：美國上課日床的選單把鬧鐘蓋掉，可昕週年視訊還是錯過；BB 附了改法）。
   - AA387-S10-1022（AA_387 第 10 節）。
   - US-JETLAG-BED-0803-1022（要問 AA）。
   - TOOL-DUTY-HANDOFF-BRANCH-1022。
8. 其他照 `check_handoff.py queue --owner LAWWW`。

**C｜正在做的**：沒有。背景測試、子代理都停了（rc4 第二輪在 fps 量完、flow_v0_start 剛開始時停掉）。

**D｜最新決策與規則**：本班沒有新規則；使用者 14:5x 交班口令（不調查、不測、不發布 v9.10.3）記在 user_asks UA-LAWWW-1021-05。

**E｜跨 AI 協作**：AA-C `8d32ed63`、BB-C `a71fe506`、LAWWW2-C `2b4f2028` 都在 14:30 交班（交班 commit 都已分類進 deliveries／ignored，incr OK）；LAWWW2 社科院柱子透空（8e8d130e）已整合、ACK 沒回（對方已交班，不叫醒）。AA-C 交班後傳的兩題已記 AA_QUESTIONS_1021 S 節。沒有待回的訊息。

**F｜測試與問題**
- f72a2a21：smoke_release_v2 FAIL（新遊戲搖桿 0.33 m）、flow_v0_start_v2 FAIL（測試還在等 AA_300 短版不演的 9/2 開學典禮——測試已改成 9/13 保齡球，開發分支 8861aed8）；其餘見 A。
- bcbd4b65：probe 兩版手機自己開 1 次；乾淨環境待機 4.2 fps、推搖桿 6 格只走 0.36 m、前方 (0.07,2.77) stuck；smoke_release 一樣 0.33 m。
- **逐職位核對：roles 異常 36 項未處理**（AA 交接檔的表外項目，清單 `docs/handoff/release_9103/roles_anomalies_1021_1456.txt`）；**asks 異常 5 項**（AI 解讀還沒問使用者：UA-LAWWW-1020-85、UA-AA-1020-31／33／34／35，清單 asks_anomalies_1021_1456.txt）。**因此這次交接不算完整**，下一班接班第 9 步先處理。check OK、incr OK。

**沒有遠端備份的**：LAWWW-C 暫存區的測試工作樹（wt_rc3＝f72a2a21、wt_rc4＝bcbd4b65、wt_rel9102、wt_v991、wt_main9102，都能從 GitHub 重建）、probe 的截圖原檔。子代理分支已打包進 wip_backup；其他程式、文件都已 push。

**下一班第一步**：照 AI_SESSION_HANDOFF.md 第 4 節接班（處理 F 的 roles 36 項、asks 5 項）→ BUG-SMOKE-JOY-1021（release_9103/README.md 第 6 節，一次只跑一支瀏覽器）→ 補跑 B 第 2 項的單元測試。

### 帳號 C → 下一個帳號（看使用者對哪一邊說話）｜LAWWW-C｜2026-10-19 01:5x UTC 第四次正式交班（發布 v9.10.2 以後）

使用者 01:4x：「你可以先發佈最新版嗎既然你的大部分測試都過了，中間沒有其他人值班，所以你可以直接從剛剛的地方開始，你先發佈然後剩下的測試留在等一下的交班，你現在先值班」→ 01:4x 同一個工作階段重新值班、發布 v9.10.2、交班。AA-C、BB-C、LAWWW2-C 一直是交班狀態（使用者 21:4x）。分支 `claude/adoring-meitner-mqzst8`（RULE_SOURCE）；最後 SHA 以 `duty.json` 和 `snapshots/` 最新的 LAWWW-C 交班快照為準。**詳細：docs/RELEASES.md v9.10.2、docs/handoff/TEST_RESULTS_1018.md 第 0、0a 節。**

**A｜本班成果**
- **v9.10.2 上線**（REL-9102-1019 已驗收）：main `9335763d`（PR #8，檔案和測過的 `f6351696` 逐檔相同），GitHub Pages run 39187157610 01:52:21 成功。發布前：乾淨 checkout deploy_check ALL PASS（版本字樣 v9.10.2、96 支 script ?v=9.10.2、33 區域、5387 個網址、JS 例外 0）；題目漏收檢查（和 AA 分支最新版逐題相同，483 題）；check_lines（v9.10.1 以後改的 12 筆提醒都不是手抄錯字）；check_orphans。
- USER_WANTS「在開發分支」74 列改成「在遊戲裡（v9.10.2 起）」，對應的 20 筆 asks 跟著改（asks OK）。
- 上一班（01:3x 交班）的成果見第 11 節第一則：手機訊息照 LINE 做完、用到手機的流程測試六支 ALL PASS、翹課群組轉述修好。

**B｜全部未完成**：第一件事＝**REL-9102-POSTCHECK-1019**（使用者說剩下的測試留到交班）：對 main 跑 TESTING 第五節其他幾支（reachability_all、flow_class_real、minimap_direction、zone_transitions、touch_flow_wenzhou、p0_movement、save_compat_v7）、deploy_check 沒走的 us_campus／us_lawlib、TEST_RESULTS 第 3 節還沒在瀏覽器看過的；有壞的修、重發 v9.10.3。其他照第 11 節第一則的 B（卡住等使用者上傳 `_stuck` 存檔、給 AA／BB 的、等使用者的圖）；USER_WANTS 第 1 節改成在遊戲裡的列還沒搬到第 3 節。

**C｜正在做的**：沒有。

**D｜本班新的使用者決策**：01:4x 先發布、剩下的測試留到交班、先值班（UA-LAWWW-1019-47，已完成）。

**E｜跨 AI**：沒有（沒有傳訊息給任何工作階段）。

**F｜測試**：發布前的見 A；發布後檢查還沒跑（B 第一件事）。

- **（2026-10-19 01:5x C 帳號第四次交班前的第 1 節原文：01:3x 第三次交班）**
  ### 帳號 C → 下一個帳號（看使用者對哪一邊說話）｜LAWWW-C｜2026-10-19 01:3x UTC 第三次正式交班

  使用者 22:4x：「訊息這邊做好 就可以交班」→ 22:5x 交班；使用者 23:0x：「但我的意思是你把它做完才交班」→ **23:0x 重新值班**（duty seq 13），把訊息做完、用到手機的流程測試全部跑過才交班。AA-C、BB-C、LAWWW2-C 一直是交班狀態（使用者 21:4x「其他帳號先不用回來，你先自己修」）。分支 `claude/adoring-meitner-mqzst8`（RULE_SOURCE）；最後 SHA 以 `duty.json` 的 `roles.LAWWW.lastCommit` 和 `snapshots/` 最新的 LAWWW-C 交班快照為準。**詳細結果與下一班第一件事：`docs/handoff/TEST_RESULTS_1018.md` 第 0、0a 節。**

  **A｜本班成果（都在開發分支、都還沒發布；v9.10.2 候選）**
  - **手機訊息照 LINE 做完**（PHONE-LINE-UI-1018，USER_WANTS X50）：自動跳出來先停在列表（使用者選 B）；每列頭像（那個人的立繪裁臉，群組、通知、沒有立繪的用字）、名字、最新一句、時間、未讀、「待回覆」；點進去從最新一句開始、往上滑看舊的、表頭固定；別人說的靠左、自己說的靠右；列表上方沒有待回覆區塊（使用者選 A）。`e88246af`（第二班 `3b2f2618`、`f4a5755f`）；直向橫向截圖 `shots/phone_line_*.png`。
  - **用到手機的流程測試全部跟上、跑過**（遊戲沒改，測試照手機自動跳出來 D103 和 LINE 列表改）：flow_termend 12/12、flow_v0_home 8/8（新遊戲到 8/29 進法律系，跳日期途中手機跳出來 50 次都按「跳過」繼續）、flow_typhoon、flow_invite_phone ALL PASS；flow_discuss_class 9/9 ALL PASS（第一次跑抓到翹課轉述的 bug、修好；第二次是測試抓到打字中的半句、改成記整句）；flow_vac_hometown ALL PASS。
  - **翹課的群組轉述又收得到**（BUG-SKIPNOTE-SCENE-1019，`7fa05797`）：flow_discuss_class 抓到——10/16 加的「同學要真的在教室才有反應句」也擋到下課後的群組轉述（說的人不在玩家身邊就不發）；轉述改成不看，課堂上的反應句照舊；discuss_unit 加一項（修改前 FAIL）。
  - node 單元測試 302 支：300 過；rel_feel、reload_resume 比對原始碼的寫法跟上前兩班的程式後過（`c6fd22fe`）；bg_images 第 1 項＝經濟系四張背景等使用者生圖（BG-ECON-B1-1018，預期）。
  - 第二班的成果照舊（v9.10.1 發布後檢查結案、高雄閃家裡、卡住紀錄、duty verify 修好），見第 11 節第一則。

  **B｜全部未完成**：TEST_RESULTS_1018.md 第 0 節「下一班第一件事」、第 2、4 節；USER_WANTS 第 1 節；`check_handoff.py queue --owner LAWWW`。重點：①v9.10.2 候選在瀏覽器走 TEST_RESULTS 第 3 節剩下的（7/25 客運版從家裡出發、出家門不露醉月湖、E30 講完直接接下一段、在家電話背景、拉花店員、可昕表情、Kevin 立繪），再照 TESTING 第五節發 v9.10.2 ②保齡球、搬家卡住：等使用者在 v9.10.2 上傳有 `_stuck` 的存檔 ③給 AA、BB 的照舊（E30-MOM、CRAM-DEC-SCENE、KH-TRIP-MORE…；BLACK-BG-AUDIT、CAMP-PORTRAITS）④等使用者的圖（經濟系四張背景、系烤 CG）。

  **C｜正在做的**：沒有（背景測試都跑完）。

  **D｜本班新的使用者決策**：22:5x 選 A：訊息列表上方不要「待回覆」區塊（UA-LAWWW-1018-45）；23:0x「但我的意思是你把它做完才交班」（UA-LAWWW-1018-46）。

  **E｜跨 AI**：沒有（其他三個職位都交班；本班沒有傳訊息給任何工作階段）。

  **F｜測試**：TEST_RESULTS 第 0a 節表格；紀錄 `tests/repro_1018/logs/phone_line_*.log`。turn_check：回合 406 個、超過上限 66 個；本班超過的一個是 10-19 00:4x 接續摘要後那一回合（7 分鐘、68 次工具：改測試、查其他碰到手機的測試、跑單元測試一起做）——改法：背景測試一開跑就結束回合，查別的放下一回合。

- **（2026-10-19 C 帳號第三次交班前的第 1 節原文：22:5x 第二次交班）**
  ### 帳號 C → 下一個帳號（看使用者對哪一邊說話）｜LAWWW-C｜2026-10-18 22:5x UTC 第二次正式交班

  使用者 22:4x：「訊息這邊做好 就可以交班」。這一班是 21:3x 回來接班（上一任＝LAWWW-C 自己 14:51 交班，中間沒有人值班）；使用者 21:4x：「其他帳號先不用回來，你先自己修」——**AA-C、BB-C、LAWWW2-C 一直是交班狀態**（`duty verify` 異常 2 的三項就是這個）。分支 `claude/adoring-meitner-mqzst8`（RULE_SOURCE）；最後 SHA 以 `duty.json` 的 `roles.LAWWW.lastCommit` 和 `snapshots/` 最新的 LAWWW-C 交班快照為準。**詳細結果與下一班第一件事：`docs/handoff/TEST_RESULTS_1018.md` 第 0 節。**

  **A｜本班成果（都在開發分支、都還沒發布；v9.10.2 候選）**
  - **v9.10.1 發布後檢查結案**（REL-9101-POSTCHECK-1018）：失敗是測試沒處理要回覆的訊息自動打開手機（遊戲暫停），兩版一模一樣；改測試後 minimap_direction、p0_movement、touch_flow_wenzhou、zone_transitions、flow_class_real 對 v9.10.1 `4c0cbefc` 和開發分支 ALL PASS（docs/RELEASES.md v9.10.1）。
  - **從高雄回來閃出臺北的家修好**（BUG-KH-HOMEFLASH-1018，`2ad61c5f`）：住家裡時 3D 底下鋪的圖跟著 2D 的背景（tests/home_backdrop_unit.js，舊程式 5 FAIL）。
  - **手機訊息照 LINE＋使用者選 B**（PHONE-LINE-UI-1018，`3b2f2618`、`f4a5755f`）：自動跳出來先停在列表；每列頭像字、名字、最新一句、時間、未讀、待回覆；點進去從最新一句開始、往上滑看舊的、表頭固定；直向橫向截圖 `shots/phone_line_*.png`。
  - **卡住紀錄**（`d3643e46`）：卡住 10 秒時存「哪一段沒結束」到瀏覽器 `fatiao3d_stuck`，匯出存檔帶 `_stuck`；stale_lock_escape PASS。搬家卡住在 v9.10.1 重現兩次沒卡住（加速＋一般速度照使用者選擇），腳本在 tests/repro_1018/。
  - duty verify 同帳號回來誤報修好（`7c7363b3`，handoff_duty_sim 20/20）；USER_WANTS J10 補負責人。

  **B｜全部未完成**：TEST_RESULTS_1018.md 第 0、2、4 節；USER_WANTS 第 1 節；`check_handoff.py queue --owner LAWWW`。重點：①~~問使用者要不要保留訊息列表上方的待回覆區塊~~（使用者 22:5x 選 A：不要、照現在，UA-LAWWW-1018-45）②v9.10.2 候選在瀏覽器走一次（含 7/25 客運版）再照 TESTING 第五節發布 ③保齡球、搬家卡住等使用者上傳有 `_stuck` 的存檔 ④給 AA、BB 的照舊（第一班列的 E30-MOM、CRAM-DEC-SCENE、KH-TRIP-MORE…；BLACK-BG-AUDIT、CAMP-PORTRAITS）⑤等使用者的圖（經濟系四張背景、系烤 CG）。

  **C｜正在做的**：沒有（背景工作都跑完了）。

  **D｜本班新的使用者決策**：21:4x 其他帳號先不用回來、LAWWW 自己修（UA-LAWWW-1018-41）；22:4x 手機自動跳出來選 B＋LINE 的預覽與捲動（UA-LAWWW-1018-42）；22:4x 訊息做好就交班（UA-LAWWW-1018-44）。

  **E｜跨 AI**：沒有（其他三個職位都交班；本班沒有傳訊息給任何工作階段）。

  **F｜測試**：見 TEST_RESULTS 第 0 節表格；node 單元測試：home_backdrop、phone_line_list、phone_auto（改成開列表）、v0_kxphone、v3_phone_small、econ_ff、econ_ff2、v0_home_ff、home_unit 全過。

- **（2026-10-18 22:5x C 帳號第二次交班前的第 1 節原文：14:5x 第一次交班）**
  ### 帳號 C → 下一個帳號（看使用者對哪一邊說話）｜LAWWW-C｜2026-10-18 14:5x UTC 正式交班

  使用者 14:4x：「還沒沒有做完的事情就登記好之後 交班 測試的結果都要留下來讓接班的人可以直接開始修」。分支 `claude/adoring-meitner-mqzst8`（RULE_SOURCE）；最後 SHA 以 `duty.json` 的 `roles.LAWWW.lastCommit` 和 `snapshots/` 最新的 LAWWW-C 交班快照為準。**AA-C、BB-C、LAWWW2-C 已先交班**。細目一律看 `docs/handoff/tasks.json` 各任務的 `next`。

  **★ 下一班 LAWWW 第一件事：`docs/handoff/TEST_RESULTS_1018.md`**（測試結果原文、重現腳本 `tests/repro_1018/`、建議第一步）：
  1. **REL-9101-POSTCHECK-1018（P0）**：v9.10.1 發布後檢查，minimap_direction 3 FAIL、touch_flow_wenzhou 11 FAIL、p0_movement 26 FAIL（搖桿、拖曳、點地面在測試裡完全不動；v9.10 發布前 feb2bc37 ALL PASS）。先二分（8c63ea53 ↔ f4b47480），查是測試狀態（自動打開的手機？）還是遊戲真的擋輸入。
  2. **BUG-MOVEOUT-STUCK-1018（P0）**：搬回家那段問完以後回到宿舍 3D 卡住、沒有劇情也沒有按鈕。
  3. **BUG-BOWL-STUCK-1018（P0）**：保底 a0926112 已做；四次重現都沒卡住；使用者存檔在 tests/repro_1018/。
  4. 修好以後出 v9.10.2（候選清單見 TEST_RESULTS 第 5 節，一定要帶 a0926112）；發布前跑 docs/TESTING.md 第五節＋HV-15 第 5 點。

  **A｜本班成果（v9.10.1 發布 12:1x 以後，全部在開發分支、都還沒發布）**
  - 劇情鎖住的保底（a0926112）：除錯面板寫出是誰開的那一段；鎖住 10 秒、畫面上什麼都沒在演，選單的讀取／回標題不再被擋（使用者「卡住要讀檔說現在有劇情不能讀」）。經濟系跳日期期間鎖住、跳完放開（5a351d1b）。
  - 經濟系：拉花那段吧檯只留芷若、店員用芷若立繪（2e28928c、09ff80aa）；休學電話講完不回咖啡店（2e28928c，E30 接下一段）；可昕階梯 K0-Lx2 拿掉；跨年／高雄回來／出家門不再露出醉月湖（fa03d80d、2af6c40d）；一層樓的家「下樓」改字；在家講電話用家裡背景、四張新背景代號先接好（df06fdc8）；快轉收到訊息就停、按跳過繼續（b0b5d954）；可昕表情照台詞標記；衝刺班「她已經不笑了」拿掉。
  - 手機直向 ADV 只顯示說話的人、旁白變暗（4a03aadf）；自動跳出的手機對話捲到最新（fa03d80d）。
  - 宿營 Kevin 立繪位置接好（f09cf0e7，圖還沒有）。美國校園、法學院圖書館、四季（d3fdab82）。AA_307 句子、階梯最終版＋retake_home（a60f111e、5ac83dbc）。
  - 交接制度 HV-18（使用者「交接規則到底要怎麼寫他們才不會還有東西沒寫」，選「三個都做」）：每個職位的使用者要求當下寫進 `docs/handoff/user_asks_<職位>.json`、`.claude/settings.json` 的 UserPromptSubmit 提醒、`check_handoff.py asks`；D105（使用者的決定用選擇題問）、D106。
  - 黑畫面盤點 `docs/handoff/BLACK_BG_AUDIT_1018.md`（31 段，`node tools/story/black_bg_audit.js --md` 重產）。

  **B｜全部未完成**：見 TEST_RESULTS_1018.md 第 1、2、4 節；USER_WANTS.md X31～X63；`check_handoff.py queue --owner LAWWW`。給 AA 的（E30-MOM、CRAM-DEC-SCENE、KH-TRIP-MORE、ECON-TERM-END-CUE、KH-RETAKE-PACING、CRAM-LEAVE-LAUGH、KH-SCORE-TIMING、KX-EXPR、HOME-ONEFLOOR 確認、AA-LAW-RECONFIRM）、給 BB 的（BLACK-BG-AUDIT、CAMP-PORTRAITS：Kevin「潮流大哥型」提示詞、CG-NOPERSON、TEST_RESULTS 第 3 節的瀏覽器驗證）都在總表。等使用者的圖：BG-ECON-B1-1018（四張背景）、CG-ECON-BBQ-1018（使用者說先記錄、之後帳號補）。

  **C｜正在做的**：沒有在跑的背景工作。保齡球根本原因、搬家卡住、高雄閃家裡、發布後測試失敗都停在「待開工／查到一半」，狀態在 TEST_RESULTS。

  **D｜本班新的使用者決策**：HV-18、D105、D106；K0-Lx2 整段拿掉；E30 講完回臺北的家跟媽媽說；Kevin 外型潮流大哥型；CG 只有那三張、日本全 2D、美國市場做停車場和馬路；烤肉 CG 生一張新的（先記錄、之後補）。

  **E｜跨 AI**：AA-C、BB-C、LAWWW2-C 都已交班；本班沒有傳訊息給休班帳號（D75）。給 AA、BB 的工作都寫在總表與 USER_WANTS。

  **F｜測試**：TEST_RESULTS_1018.md 第 1、3 節（v9.10.1 發布後檢查、stale_lock_escape 新 PASS 舊 FAIL、econ_ff ⑧、node 單元測試全過、還沒瀏覽器驗證的清單）。

- **（2026-10-18 14:5x C 帳號正式交班前的第 1 節原文：C 帳號 07:4x 預寫）**
  ### 帳號 C → 下一個帳號（看使用者對哪一邊說話）｜LAWWW-C｜2026-10-18 07:4x UTC 預先寫好（使用者 07:1x：「中間應該會換帳號做……我這個帳號每週使用量到 85%，大概兩小時」）

  使用者說「現在換班」時照 AI_SESSION_HANDOFF.md 第 5 節：更新本節最後 SHA、跑 `check_handoff.py snapshot --role LAWWW --account C`、`duty handoff`。分支 `claude/adoring-meitner-mqzst8`（RULE_SOURCE）；細目一律看 `docs/handoff/tasks.json` 各任務的 `next`。

  **A｜本班成果（10-18 05:1x 發布 v9.10 以後，全部在開發分支、都還沒發布）**
  - 使用者 10-18 實玩 v9.10 抓到的：可昕 3D 是路人男生（BUG-KX-MALE-1018）、經濟系睡覺一路睡到休學（BUG-ECON-SLEEPSKIP-1018：事件模式睡覺／快轉＝跳到下一個事件）、可昕顯示在政大（BUG-KX-NCCU-1018）、退宿後還能去宿舍／去台大（BUG-DORM-AFTER-MOVEOUT-1018、UX-Y0-NO-NTU-1018）、捷運直達花蓮（UX-MRT-FAR-1018）、換場景前一段的立繪留著（BUG-ADV-LINGER-1018）、在家轉場露出椰林大道（BUG-HOME-CAMPUS-BG-1018）、在家不能存檔（UX-HOME-SAVE-1018）、約可昕出門一直跳「會錯過十點」（重考期在家選單）、要回覆的訊息自動打開手機（UX-PHONE-AUTOOPEN-1018，D103）、開局二選一經濟系前傳／直接法律系（UX-START-CHOICE-1018，X24）。
  - 經濟系事件接事件：第一階段延到 10/19 退宿（瀏覽器 9/2→10/17 走完、18 個事件、沒有錯誤）；**第二階段休學在家 10/19→8/29**（ECON-FF-PHASE2-1018：在家選單收起來、出遊自動出發、校園事件帶過去演完回家）；**重考期可昕住在家裡的日常**（RT-TOGETHER-1018：AA_297 retake_home 30 短＋12 長）。
  - AA 交付整合：AA_293（可昕交往前 T1～T6、劇社拿掉、系烤伏筆、聚會後她留下來、E10 23:45、保齡球搬 9/13、醉月湖說破）、E27 當面講休學原因、跨年改市府站、除夕選項、比誰早起；階梯白名單換 9fecc202（Y0S1 等 AA 補 KX0_EGG／KX0_SHOP 記憶名稱表）。
  - 07:3x 以後：「略過對話」按得到而且真的略過（BUG-ADV-SKIP-1018）、祐廷說話時台上立繪全暗（BUG-ADV-SPEAKER-DIM-1018）、臺北的家換成使用者生的三房兩廳 11 張並照時段換（BG-HOME-1018）、在家藏起 3D 畫面（BUG-HOME-CAMPUS-BG-1018）。
  - 其他：路人旁邊不再一模一樣（BUG-NPC-DUP-1018）、室內出口地上光圈（UX-EXIT-MARK-1018）、博雅 101 門口不再疊成一團（BUG-CLASS-CLUMP-1018）、坐著的替身禿頭／臉白（ART-SEATFIG-1018，LAWWW2 e315997b）、除夕背景換使用者生的手繪版（BG-HOME-1018 第 1 張）。
  - 永久規則：D103 重要劇情不能只用手機交代（使用者「我根本不會看手機」）；QA 發布條件（X29：BB 四種玩家玩法從頭玩＋劇本給 AA 讀，兩關都過才發 v9.10.1）。

  **B｜全部未完成（要先看的）**
  - **★ 下一班第一件事（使用者 10-18 12:5x P0）USER-WANTS-AUDIT-1018**：把 AA、BB、LAWWW2 紀錄裡「使用者說過要改、還沒做完」的事全部補進 USER_WANTS.md／tasks.json（LAWWW-C 子代理在查；結果沒寫進來就重做）。另外：HV-17 帳號 D 已加（4ad87fc0）。
  （2026-10-18 12:3x 更新；開發分支最新 `ec2d80a1`，node 單元測試 299 支全過）
  - **12:3x 發布以後（v9.10.2 候選，還沒發布）**：AA_307 句子 a60f111e、階梯最終版＋retake_home（RH-M0）5ac83dbc 已接；LAWWW2 US-CAMPUS-WIRE（4cee25c8，先套 us_season.diff）等接。v9.10.1 發布後檢查：deploy_check、reachability_all ALL PASS，其餘六支跑中（scratchpad post/summary.txt；交班時沒跑完就下一班重跑 TESTING 第五節）。BB-C 已收尾（b38b2b81）、AA-C 已交班（8c816da4，duty sync ad6b9a73）。**交接核對**：`check` OK、`roles` OK（18d52389 處理完 12 項子項編號）；`incr` 異常 223 項、水位線不前進——幾乎都是 LAWWW2、BB 自己分支 outbox 的欄位格式（state 寫成自由文字「已交付（等 BB-C 驗收）」、缺 sha／ack／receiver、任務 ID 寫成說明文字），LAWWW 不能改別人的分支；下一班 LAWWW2、BB 照 OUTBOX_TEMPLATE 修自己的 outbox，LAWWW 再跑 incr --advance。
  - **12:1x v9.10.1 已發布**（使用者 11:5x「先發布再檢查了」）：main `4c0cbefc`（PR #7，Pages 部署 run 39126382240）；發布後檢查（TESTING 第五節）在 scratchpad post/ 跑，結果補 docs/RELEASES.md v9.10.1 一節；BB 三種玩法改在 4c0cbefc 跑＝發布後檢查。有問題修完出 v9.10.2。
  - **11:4x**：階梯 y0s1 換 6b01c841（經濟系大一上五個人問完：可昕 13、品妤 6、唐睿 4、阿勳 6、韋綸 7）；BUG-E12-ARRIVE-LATE-1018 已修（f483c2a9，BB 重看中）；BB QA-AA300 第一輪 5e634610 全程 14.5 分鐘、卡住 0、例外 0，接著跑 KH_GO=home；LAWWW2 交 ART-US-SEASON（407ec3f5）、SCN-US-IU-1018 完成，現在做 BUG-COPLANAR-DEV → ART-CH-PINYU。
  - **11:3x**：AA306-KX-LADDER-1018 已整合待測試（ded5da04：可昕經濟系階梯 13／4 層；重考期讀書在你房間的書桌——R1、R5、R2、同一張桌子、在家背景）；retake_home 讀書那 8 處等 AA 下一班改。
  - **11:1x 最新**：AA305-OTHERS-1018 進行中（第 5～7、10 節＋階梯 bd64f560 已做：休學只告訴可昕、10/29 小福 ev_y0_xiaofu、退宿 10/31、便利貼在最後一箱；第 1～4、8、9 節台詞 419b1298 已合併（c5e8695a）；4 處小地方問 AA：12/31 兩句同開頭、旁白括號、法律系兩句像冷笑話、Y0S2 阿勳冷笑話招呼）。
  - **10:4x 最新**：AA303-KX-RECONFIRM-1018 進行中（停點 27 場、日期卡 18 句、高雄三天兩夜＋BB 兩張背景、第 2 節十場台詞 85eea326 都已接；等 AA 的 retake_home C0／C4／L6＋RH-M0、E27 遲到電話新句、換完還對不上的 6 處）；AA304-QA2-1018 進行中（12 列裡 10 列已做：5bf15ccb、4e5d4bec；第 11 列等 retake_home、第 8、9 列等使用者）；階梯 Y0S1 已重匯（白名單 8fcc2c7e）；LAWWW2 SCN-US-02 v3（90c2896e）已登記、v9.10.1 發布後接。node 單元測試 299 支全過（4e5d4bec）。
  - **第一項（使用者最在意）AA300-ECON30-1018 已整合待測試**（52bf3f16、c5e312fe）：經濟系只停 29 場、日期卡 22 句、重考期短場景關、手機「跳過」、新遊戲按鈕。**BB 瀏覽器實測 QA-AA300-1018 進行中**；Q-AA300-INVITES-1018（不在 29 場的邀約私訊還會問）等 AA 回表。
  - 本班已整合待測試（等 BB）：AA298-RETAKE-FIX-1018、Q-E36-CALL-1018（含 AA_298 第 10 節 d781b840）、KX-INVITE-LAW-1018、MSG-KX-Y0-1018（AA_301）、AA296-KXCALL-1018、BG-CAMP-1018、BUG-HOME-BIKE-HINT-1018、BUG-ECON-FRIENDS-1018、DORM-AFTER-MOVEOUT-1018。
  - **AA295-KX-NOHYPO-1018 已整合待測試**（faf3a8ea，子代理 4bc3fab5 併入；全部 node 單元測試過）；表外兩句（K7 票根禮物的反應）等 AA 寫。AA_302 劇本審閱 11 列已做（cb968a74），第 10 列等 AA 的 KX0_EGG／KX0_SHOP 名稱。
  - P0：QA-PLAYTHROUGH-1018（BB 四種玩法）、QA-TRANSCRIPT-1018（新 HEAD 探測在背景：scratchpad ff6/，跑完轉 docs/qa/econ_transcript_*.md 給 AA；scratchpad 交班不會留，下一班重跑 `tests/econ_ff_probe1.py`、`econ_ff_probe2.py`）。
  - 待開工：BUG-DATE-0831-1018（BB 重現中；已知部分見 tasks.json）、BUG-NO-CLERK-1018、AA294-SKIPCLASS-1018、Y0S1 階梯（等 AA 名稱表）、AA299 圖。
  - **使用者 09:0x：v9.10.1 也要包含** AA295-KX-NOHYPO-1018、BUG-DATE-0831-1018、BUG-NO-CLERK-1018（已整合 0f492509）、LAWWW2 三樣 ART-YU-3D-1018／ART-EXT-TEACH／ART-LIB-VIEW-1018（已整合 72287f55）。
  - v9.10.1 其他：SYS-BOOKS-1018、PERF-ZONE-ENTER-1018、BUG-CAMP-CUT-1018、DEC-SLOTS-1018（等使用者）、BUG-ECON-HOME-SHOTS-1018、BUG-KXFIRST-0830。**發布條件**：BB 四種玩法＋AA 讀劇本兩關都過、跑 docs/TESTING.md 第五節。

  **C｜正在做的**：背景瀏覽器探測（scratchpad qa3/，2fb3e5a5，AA_305 以前的版本）；等 BB 的 QA-AA300-1018（5e634610 開跑）；等 AA 句子（retake_home、6 處矛盾、K7 兩句、AA_305 的 4 處）。

  **D｜本班新的使用者決策**：D102（經濟系事件接事件、書店）、D103（不能只用手機交代）、X24 開局二選一、X25～X29（USER_WANTS）。時段制（DEC-SLOTS-1018）使用者說先不要決定、要方案。

  **E｜跨 AI**：AA-C：AA_305、AA_306 已交並整合；待交 retake_home（C0／C4／L6、RH-M0、6/24「她」、讀書在書桌 8 處）、E27 遲到電話、6 處矛盾句、K7 兩句、AA_305 4 處、10/16 日期卡「隔天晚上」；BB-C：QA-AA300 第一輪過、重看 11/6＋KH_GO=home；LAWWW2-C：BUG-COPLANAR-DEV → ART-CH-PINYU（美國篇四季、IU 校園都交了，v9.10.1 後接）。

  **F｜測試**：本班改的都有 node 單元測試（econ_ff、econ_ff2、exit_ring、anon_dedup、kexin_model、phone_auto、各 v0／lifeline 換字）；瀏覽器只跑過經濟系第一階段全程和第二階段探測。**沒有跑發布前清單**（docs/TESTING.md 第五節），v9.10.1 發布前要跑；auto-open 手機可能讓舊的瀏覽器流程測試遇到要回訊息時多一個手機畫面，要確認。

- **（2026-10-18 C 帳號預寫快照前的第 1 節原文：B→C 2026-10-17 02:4x）**
  ### 帳號 B → 下一個帳號（A 或 C，看使用者對哪一邊說話）｜LAWWW-B｜2026-10-17 02:4x UTC 交班

  使用者 02:3x 正式換班（D45、D49、D92／HV-10、D93）。分支 `claude/modest-rubin-2lyp7g`（RULE_SOURCE）；最後 SHA 以 `duty.json` 的 `roles.LAWWW.lastCommit` 和快照 `snapshots/2026-10-17T*_B_LAWWW.json` 為準；交班前最後一個程式 commit `b9eaacf3`（WIP）。**沒有為交班合併 main、沒有發布**；線上仍是 v9.9.1（main `6d5c3279`）。

  **A｜本班成果**（帳號 B 2026-10-15 23:02 接班到現在；細目看 `tasks.json` 各任務的 `next`、`deliveries.json`、`docs/RELEASES.md`）
  - 已發布：v9.8、v9.9（`19b97eff`）、v9.9.1（`6d5c3279`）；v9.9.2 開遊戲加速「測試中」沒發。
  - 10-17 00:00 以後（這一段的 commit 都在開發分支，**都沒發布**）：
    - **8/22～24 法律系迎新宿營＋兩條入學路線**（CAMP-L1、CAMP-FIX-614）：宿營 12 段、AA_205 6-14 台詞 8 項＋程式 1～7（dbb4d86e、038c0d0e、884d47d6、e39749d9、259a4c4f）；瀏覽器 `flow_camp_y1` ALL PASS（02:27，截圖 fbda2ce9）。**經濟系路線的宿營（程式 8）沒做**；`?start1` 還不是預設。
    - **8/29～9/2 開學第一週**（START-WEEK、AA208-L）：W1_AUDIT 21 項的 1～17、19、21 完成（18 不做、20＝16 週制另做）；8/29 四人房 203（祐廷、阿凱、阿哲、柏翰：f642fddc、a943ea1d）、9/1 阿哲宿舍早上版（05fb5af2）、颱風夜兩句（9d92f88e）、9/2 茶會／國文沛珊／通識明軒／Kevin 群組（14747a8d、d46f1e47）、8/30 新手三目標（3500326e）、8/31 開學典禮背景（0c5a9acc）、經濟系 412（277c67dc）。**人物旗標**：ZHE_CALLS_GE（宿營年次）、MX_CAMP_PAIR、CAMP_Y1、FIRST_MET.kevin＝camp、阿哲 fam+1。
    - **宿舍四人房**（DORM-LOFT-L＋ART-DORM-LOFT，使用者 01:3x「宿舍ok」）：dorm_room4.glb＋配置資料檔 → zones3d.js 改讀 DORM_ROOM（69e74460～5d66f7bb）；瀏覽器 interior_glb_integration 宿舍 ALL PASS 42、flow_dorm_hall ALL PASS。**b9eaacf3（WIP）8/29 當晚 203 補生三位室友：瀏覽器沒測**。場景美術**沒有** ART_APPROVED（要使用者看）。
    - **3D 場景疊面修正**（BUG-COPLANAR-DEV）：整合 LAWWW2-B 201、萬才館室內（3d4d1969）、總圖大廳、法圖（b6f471f7）、霖澤館室內（d6ce40cf）；**萬才館／總圖／法圖／霖澤館／201 的瀏覽器流程交班時沒跑完**（QA-HANDOFF-B1）。
    - **大一下口語改稿 AB65-3-Y1S2-L**（AA_209）：重訪日 1 改 6/12 麵店群戲、日期條件（02dc4fda～372c6512）；剩項見 B。
    - **經濟系前傳改稿**（V0-REWRITE-L）：BB JSON、段 A 全部、E15 CG（bdfdb9d3、3f050385、a41bfca0、793e78aa、f93ba38a）；剩段 B～E 等。
    - 背景圖接上（BB-B 生成、已通過）：nccu_dorm（晚／白天）、yongkang_curry、gongguan_cinema、ntu_lib_b1、trip_hotel_twin；備用註冊 cram_class、jp_street_night、camp_school、train_day；CG：cg_econ_camp、cg_class_photo_y1。
    - 規則：D90／HV-9（使用者訊息優先、短回合）、D93／HV-11（逐職位待辦核對、`check_handoff.py roles`）寫進五份規則檔。

  **B｜全部未完成**（`tasks.json` 未結 555 項；`python3 tools/handoff/check_handoff.py queue` 照 D81 排）。本班相關、要先看的：
  - P0：QA-HANDOFF-B1（交班沒跑完的測試，下面 F）、DORM-LOFT-L（已整合待測試：室友 WIP 瀏覽器測、給使用者看）、CAMP-FIX-614（程式 8 經濟系路線宿營）、BUG-IOS-RELOAD（iPhone Safari 記憶體不足重新載入，止血已做、③④沒做）、BUG-MAPBLACK（地圖黑畫面，canvas 釋放已改、待瀏覽器＋iPhone）、BUG-02（偶發全黑）、BUG-OUTING-STUCK（出遊卡住，已整合待測試）、BUG-20（萬才館房門按鈕）。
  - P1：AB65-3-Y1S2-L（AA_209 第 4 節第 4、6、7、8、10、11 點；附錄逐句沒核對完；階梯 y1s2 從 AA 分支重新匯入、等 AA-B 寫回 SHA；大二 312 室友）、V0-REWRITE-L（段 B～E、BB_179 第 4 節 1～9、AA_203 第 3 節 30 處、AA_206 E26／E37、AA_200 7-2／7-3／7-4、BB_179 第 8 節）、CAMP-L1、START-WEEK（瀏覽器走 9/2 茶會、8/30 目標）、AA208-L（返鄉旁白跟 HOLIDAY-SYS 等）、HOLIDAY-SYS（16 週制，**CALENDAR 大一下仍是 18 週**，日期改動是照 AA_198 先搬到第 15、16 週）、REL-NEXT（v9.10 沒發布）。
  - 工作階段待辦清單（TaskList #1～#53）已在 00:2x 補進總表（使用者「待辦全部都要交接」）；#53＝DORM-LOFT-L。

  **C｜正在做的（交班時停下）**
  - AB65-3-Y1S2-L：做完第 3 節、第 4 節第 1～3、5 點；下一步第 4 節第 4 點（期中宵夜旁白、K-D5、KAI_TAPE）。
  - DORM-LOFT-L：b9eaacf3 WIP 寫完、單元測試過，**下一步跑 `tests/flow_camp_y1.py` 看 8/29 22:00 室友在位子上**。
  - 背景 flow_wancai_floors（02:32 開始）交班中斷，結果不算。

  **D｜本班新增或修訂的永久規則與使用者決策**（全文 CLAUDE.md；紀錄 USER_INSTRUCTION_LOG.md、AI_SESSION_HANDOFF.md 第 13 節）
  - D90／HV-9 使用者訊息優先協定（短回合 10 分鐘／30 次工具、長工作背景、`tools/handoff/turn_check.py`）；D92／HV-10 A／B／C 任意輪值（duty.json）；D93／HV-11 所有職位持續登記待辦、交接逐職位核對（`roles`）。
  - 使用者決策：宿舍改台大四人房（01:0x，經 LAWWW2-B；01:3x「宿舍ok」）；室友用現有人物（00:5x，AA_208）；法律系開局照真實校曆、新局 8/22 宿營（START-WEEK 選 1）；「不用小更新」等正式版（22:5x）。

  **E｜跨 AI 協作**（帳號 B 四職位都在值班、都收到使用者換班）
  - 交付：DL-LW2-COPLANAR-LINZE／201／WANCAI／LIB → 交班時在交付紀錄回 ACK（已整合待測試）；DL-LW2-DORM-LOFT ACK、已整合；BB-B 背景圖與 CG 交付已登記（DL-BB-*）。
  - 等別人：AA-B 寫回 ladder_aa_y1s2／ladder_bb_y1s2 的 SHA（BB-B 02:1x：y1s2～y4s2 改由 AA 分支維護）；AA 照 AA_197 1-7 驗收大一下、宿營；使用者看四人房、cg 已定稿。
  - **同班其他職位交班（02:39～02:4x 收到通知）**：AA-B 已交班（`claude/cool-heisenberg-o8kuqx` 遠端 `ec63dd53`，登記 `c54ee4df`，快照 `2026-10-17T0238Z_B_AA.json`，roles AA OK）——**大一下閒聊階梯 ladder_*_y1s2.json 還是 WIP（2fd0399d），不要匯入**，等下一班 AA 給 SHA；AA_211 大二上等 BB-B 口氣審。BB-B 已交班（`claude/elegant-brown-fcos7n` `55717c12`，duty_BB handed-off）；BB 快照由 LAWWW-B 代做 `2026-10-17T0244Z_B_BB.json`；BB 的交付 12 筆補登（DL-BB-BG-*、DL-BB-GG-SIGNS-S17、DL-BB-POSTCARD-ZR 明信片③～⑥、DL-BB-BB179、DL-BB-AB67、DL-BB-BB180），其餘 125 個 BB commit 照 BB-B 分類放進 ignored（沒逐筆打開）；BB 下一班第一件：BB_181 大二上口氣審回 AA-B。LAWWW2-B 在交接檔寫了交班，之後自己跑了 duty handoff（03:1x duty sync 後四職位都是 handed-off）；LAWWW-B 另代做一份 LAWWW2 快照 0303Z。
  - 沒有傳訊息給休班的帳號 A、C（D75）。

  **F｜測試與問題**
  - 單元測試：最後一次整套是 01:57 前後（253 項、5 項失敗，之後逐一修好、個別重跑通過）；**之後改過 story3d／events／camp_y1／zones3d，整套沒有再全跑**。相關的 camp_y1_unit、v0_e01、v0_e02 在 b9eaacf3 重跑通過。
  - 瀏覽器通過：flow_camp_y1、interior_glb_integration（宿舍）、flow_dorm_hall。**沒跑或沒跑完**：flow_wancai_floors、zone_transitions、flow_library_floors、flow_library_scene、flow_linze_floors、法圖、大一下重訪日 1。
  - iPhone 實機：本班沒有任何實機確認；BUG-IOS-RELOAD、BUG-MAPBLACK、BUG-02 需要使用者實機。
  - 交接工具：02:4x 交班時 `check` 有 249 項第 6 類異常沒處理。**使用者 02:5x 要求做最後一次交接補強（只補文件與登記）**：四個唯讀子代理逐筆打開 AA 126、BB 113、LAWWW2 16 筆 commit 分成「正式交付／一般工作／半成品」，LAWWW-B 登記並抽查——補登交付 AA 40＋1（DL-AA-*、DL-AA-AA201）、BB 14（DL-BB-*）、LAWWW2 4；已被既有交付涵蓋的放 ignored 並寫是哪一筆；一般工作寫具體原因；**半成品全部列在 `docs/handoff/WIP_INVENTORY_2026-10-17.md`**（任務 ID、路徑、分支、最後 commit、完成程度、剩餘、能不能整合）。修正錯的登記：DLV-1016-397、DL-BB-BB179／AB67／BB180（改未整合）、DLV-1016-368、DL-AA-CAMPL1（改已整合待測試）。補建任務 ART-GG-SIGNS-2、VAC-A1、ART-SOP、ART-YUTING-FACETEST、LIC-GAPS-1017、V1-AA194-L、DORM-Y34（別名 ROOM4）、HOL-NYE-Y3、HOL-NYE-Y4、ART-BB-READY-1017。**結果（03:1x）：`roles` OK、`check` OK（十一項）、`duty verify` OK（四職位都已交班）**；scannedThrough 移到三條分支現在的 HEAD。**通過不等於全部確定**：子代理拿不準的約 26 筆、關鍵字沒抓到的清單外 commit（BB 905d7a27、3ea1eac7、019bd293、8f781b12 等）沒核對，寫在 WIP_INVENTORY 各節，交給下一班複核。

  **下一班第一步**：先讀 `docs/handoff/WIP_INVENTORY_2026-10-17.md`（四職位半成品與未整合交付），再照 `AI_SESSION_HANDOFF.md` 第 4 節接班十四步（`duty find` → `duty plan` → `check` → `roles` → `duty verify`），然後先做 **QA-HANDOFF-B1**（整套單元測試＋沒跑完的瀏覽器流程），再接 DORM-LOFT-L 室友瀏覽器測、AB65-3-Y1S2-L 第 4 節剩項、CAMP-FIX-614 程式 8。

- **（2026-10-17 B 交班前的第 1 節原文）**：**目前沒有交班**（帳號 B 值班中；帳號 A 休班；帳號 C 未啟用——以 `docs/handoff/duty.json` 為準，D92）。帳號 B 的對帳基準快照：`docs/handoff/snapshots/` 最新一份；帳號 A 2026-10-14 的交班快照重建在 `snapshots/2026-10-14T1740Z_A_LAWWW.json`。下一次交班（交給 A 或 C 都一樣）的人照 `AI_SESSION_HANDOFF.md` 第 5 節，在這裡寫六類 A～F：A 本班完成的 ID（SHA、測試、整合與發布狀態）、B 未完成的全部 ID（含狀態：做到一半、待整合、待測試、等其他 AI、等素材或使用者、暫停）、C 交班當下正在做的、D 本班新增或修訂的決策與規則（編號＋SHA）、E 跨 AI 協作狀態（SENT／DELIVERED／ACK／ACTIONED）、F 未完成的測試與已知問題；再跑 `check_handoff.py snapshot --role LAWWW --account <A|B|C>` 和 `duty handoff`。**逐職位核對（D93／HV-11）**：存快照前、接班第 9 步都跑 `check_handoff.py roles`——LAWWW2、AA、BB 各自交接檔「全部待辦」的每一項都要在 `tasks.json`；不能只對上一任 LAWWW 的清單，結果 OK（或每項異常都處理過）才能寫「交接完整」。 **三帳號交接模擬（HANDOFF-ABC，D92／HV-10）**：19／19 PASS，結果表 `docs/handoff/HANDOFF_SIM_HV10.md`（六個方向、A→B→C→A、A→C→B→A、帳號休很久、沒交班、職位資料缺漏、WIP 未整合、交付沒 ACK、規則來源不一致、登記和 commit 時間衝突、同職位兩帳號寫入、快照不見或壞掉）。

- **A→B（2026-10-14 17:40 LAWWW 交班；2026-10-15 23:02 LAWWW-B 接班）**：原快照在 `claude/confident-ritchie-8rwh7t` 的 `docs/ART_REBUILD_PROGRESS.md`「交班（LAWWW 帳號 A，2026-10-14 約 17:40 UTC）」——只列了 LAWWW 自己的待辦（約 20 項），**沒有列已授權未開工的 v0、v3、v4、v5、v6、約會**。2026-10-16 對帳把原清單每一項都對到上面的 ID（第 12 節），並補登記 ★ 項。

## 12. 2026-10-16 A→B 對帳結果（制度修補的實際驗證）

- 原 LAWWW 交班清單的每一項都有對應：課堂提問→DONE-B01；考試真實流程→TEST-01＋BUG-08；瀏覽器回歸→TEST-02；flow_classes／course_choice→TEST-03；zone_memory→BUG-01；LAWWW2 四項→已完成（b2ca5b6c、3fbaca94）；B4／W3b／重訪日 1→已完成；「欠的，還了。」→V2-B37＋SYS-14；可昕第 9 節→V2-B9＋WIP-01；EXAM_MIX→X-01；交換／延畢→V4-R-*＋SYS-10＋SYS-12；生日表→等使用者（D14 相關，只有學姊 6/2 定了）；法服週六→V1-F；AA 的五題→X-02；v6→V6-*；約會→DATE-*；阿勳等→V2-C13、V2-B10；F-M4→V2-B32＋SYS-13；LAWWW2 佇列→ART-07、ART-08；「好。」之後的目標提案→LAWWW 自己決定先不加（暫停，P3，記為 X-05 候選，不刪）。
- **沒有任何一項消失**；有 1 項過時的「等使用者」（v6）其實使用者早已同意。
- **這次才登記的工作（★）**：★ 標記 86 處；把分組（V5-F1～F27、V5-B01～B16、V5-K21～K27、V6-A1～A8、V6-B1～B7、DATE-C1～C7、DATE-L01～L32）展開後，**約 180 個任務 ID 原本不在任何交班清單或待辦裡**——大多是 10-14 就「整包可以施工」的交接包 v0、v3～v6 與 32 處約會，其次是已交付沒接進遊戲的素材（ART-01、02、03、07、08、09）、v1／v2 的小缺口（V1-A5、A6、A10、V2-C15、V2-B32）。
- 待確認（AUDIT_PENDING）：沒有。但 TEST-02、TEST-04 的瀏覽器結果還在跑，結果出來更新那兩列。
- **D82 工具驗證（HV-4）**：用重建的 A 交班快照跑 `check_handoff.py check` → 94 個 ID 都在、沒有消失；第一次跑抓到 6 個真的異常：X-01 的替代寫成 SHA（→ DONE-B01）、X-04／X-05 取消沒寫替代（→ NONE＋授權）、企劃線 41e70b71 沒登記（→ ignored：被 e11d3807 取代）、閱讀版封存區 v1 那一列的 ID 和任務表不同（→ V1-ALL）、V4-R-* 寫法；加寬交付關鍵字後又找到 5 個沒登記的 commit（BB_134 清查、AA_140 裁定、規則副本），都登記了。處理完結束碼 0。

## 13. 制度靜態驗證（2026-10-16，HV-3；沒有喚醒帳號 A，跨帳號沒有傳任何訊息）

| 情境 | 會讀到什麼、從哪個 ref | 結果 | 風險／處理 |
|---|---|---|---|
| 原 LAWWW（A）聽到「我回來了…」 | 它分支 `claude/confident-ritchie-8rwh7t`（c8b3eab）上的 CLAUDE.md 有 D49 舊步驟「`git log --all -1 -- <檔案>` 找最新總入口」→ 找到 RULE_SOURCE `claude/modest-rubin-2lyp7g` 上最新的 `AI_SESSION_HANDOFF.md` → 第 0a、4 節（HV-3）→ D76、D79、D80、總表 | ✅ 讀得到 | 它啟動時載入的 CLAUDE.md 是舊版；新版第 0a 節明寫以 RULE_SOURCE 為準。接班第 7 步把 RULE_SOURCE 合併進它的分支後，CLAUDE.md 就是新的 |
| 原 LAWWW2（A） | `claude/second-ai-env-art`（8e1061a）上的 CLAUDE.md 也有 D49 舊步驟 → 同上；美術任務在總表第 4 節 ART-*、場景施工表 | ✅ 讀得到 | LAWWW2-B 的分支也帶著舊版總入口（b2d498e4）；`git log --all -1` 取最新時間，只要沒有人在別的分支改這份檔就不會選錯；第 0a 節要求核對「找到的 commit 在 RULE_SOURCE 上」 |
| 原 AA、BB（A） | `claude/story-planning`（0d278bb）上的 CLAUDE.md **沒有** D49 接班規則 | ⚠️ 風險 | 只能靠它們的對話記憶（10-11、10-13 做過接班）去找最新的 AA_交接紀錄／BB_00（在企劃線 `claude/cool-heisenberg-o8kuqx`）。**處理**：請 AA-B 在企劃線的 `AA_交接紀錄.md`、`BB_00`、`給開發組_交接板.md` 最上面加「接班先讀 RULE_SOURCE（AI_SESSION_HANDOFF.md 第 0a、4 節）＋永久總表」的固定區塊，並把五份規則檔的副本放進企劃線（來源 ref＋SHA，以來源為準）。狀態：DELIVERED，等 ACK（任務 SYS-16） |
| 四個職位讀同一份總表 | 都從 RULE_SOURCE 讀 `docs/HANDOFF_GAP_MATRIX.md` | ✅ | 只有值班 LAWWW 改；其他職位在自己的交接檔用 ID 寫，LAWWW 抄進來 |
| 舊分支、舊提示詞覆蓋新規則 | 舊的 7.1～7.4 提示詞寫死 `claude/confident-ritchie-8rwh7t` | 已處理 | 新提示詞改成「找最新改總表的 commit → 讀第 0a 節」；舊提示詞只存在 git 歷史裡 |
| B 交班 → A 接班 → A 交班 → B 接班 | 每次交班寫總表第 1 節快照（舊的搬第 11 節）；接班照快照對帳；任務 ID 永久 | ✅（靜態） | **沒有實測**；下一次真的換班時照做並在第 12 節記結果 |
| 不需要使用者複製長篇說明 | 換班：「現在換班」；接班：「我回來了，請同步 GitHub 最新進度，接續工作。」；新開工作階段才貼第 7 節提示詞 | ✅ | — |
| 跨帳號訊息 | 第 0a 節、第 9 節、D75：只用 GitHub | ✅ | — |
| 規則修改不碰 main | 規則檔在開發分支；main 只在正式發布時更新 | ✅ | — |

## 14. v0～v5 全學年場景施工表（SCN；使用者 2026-10-16 P1 正式指示「美國交換篇與各學年場景立即排入施工」）

分工：3D 場景＝LAWWW2-B 建模（Blender → GLB），LAWWW-B 先出配置檔（`src/data/*_layout.js`，產生器 `tools/layout/*_gen.py`；Blender 讀同一份）與可以走的備用區域，交付就接、就測（直向／橫向截圖），不等全部完成。2D 底圖、CG、立繪＝AA-B 確認劇情用途 → BB-B 整理「待使用者生成圖片清單」→ 使用者生成 → LAWWW2-B 去背／整理（需要時）→ LAWWW-B 接進 2D 場景（BB_132 疊圖）。場景清單是 LAWWW-B 依稽核整理的初稿，**AA-B 確認中**（10-16 DELIVERED）。
狀態欄同第 0 節；「下一個可驗收成果」＝下一次能實際看到、能測的東西。

施工順序（D81，2026-10-16 起）：**P0**（BUG-01、BUG-02、大一下 v2 補完＋驗收）→ **v0**（SCN-V0-*）→ v1 → v2 → **v3**（SCN-V3-*）→ **v4**（臺灣、日本、美國照劇情順序：SCN-V4-*、14.3、14.4）→ **v5**（SCN-V5-*）。跨學年系統照第一次可能用到：v6 每一段關係各自計算（V6-S1b、V6-X2）法律系開局就用得到、和 v2 同一批；關係階段與約會共用系統（SYS-01～04）在第一次正式約會那一學期（AA-B 時間線）做。**美國篇照正式排程並行**：3D 由 LAWWW2-B 做、LAWWW-B 只在空檔出配置與可以走的區域，不擠掉 v0～v2 的人力；已經做的美國宿舍配置（SCN-US-01 批次 1，`4e13d63f`）保留。

### 14.1 v0、v3（玩家先遇到的學年）

| ID | 場景 | 學年／事件 | 類型 | 負責 | 依賴 | 優先 | 下一個可驗收成果 | 狀態 |
|---|---|---|---|---|---|---|---|---|
| SCN-V0-01 | 經濟系系館（社科院；3D 已有社科院外觀與社科圖） | v0 開學、SK 日常 | 3D（現有＋ART-01 新外觀） | LAWWW-B 整合；AA-B 確認用途 | ART-01、V0-A3 | P2 | 新外觀接線（ART-01） | 待開工 |
| SCN-V0-02 | 經濟系開學典禮、小福、重考生活（補習班／家）、摩天輪、保齡球 | v0 E 事件、BB_112 | 2D（待 AA-B 確認，可能部分 3D） | AA-B／BB-B／使用者 | V0-A3 | P2 | AA-B 的場景清單 | 等待其他AI／素材 |
| SCN-V3-01 | 第二個房間（主線 3） | v3 D1 | 2D＋物件清單（AA-B 同意） | LAWWW-B；圖 BB-B／使用者 | SYS-06 | P2 | 物件清單＋2D 房間場景流程 | 待開工 |
| SCN-V3-02 | 河堤夜景、山屋與步道、研究室門口、政大小教室、老街＋回程公車、畢業典禮人潮 | v3 各事件 | 2D | AA-B／BB-B／使用者 | — | P2 | BB-B 清單 | 等待其他AI／素材 |
| SCN-V3-03 | 模擬法庭（霖澤館 201 擺成法庭） | v3 D16 模 1～6 | 3D 改佈置 | 配置 LAWWW-B；道具 LAWWW2-B | SYS-09 | P2 | 201 法庭佈置的配置 | 待開工 |

### 14.2 v4、v5（臺灣路線、大三其他場景、大四、畢業後）

| ID | 場景 | 學年／事件 | 類型 | 負責 | 依賴 | 優先 | 下一個可驗收成果 | 狀態 |
|---|---|---|---|---|---|---|---|---|
| SCN-V4-01 | 第三個房間（主線 5） | v4 E1 | 2D＋物件 | LAWWW-B | SYS-06 | P2 | 同 SCN-V3-01 | 待開工 |
| SCN-V4-02 | 地方法院、行政法院（E6 旁聽 CG-16）、桃園機場（E14、W15c）、車內 | v4 | 2D（機場 3D 與否待 AA-B） | AA-B／BB-B／使用者 | — | P2 | BB-B 清單 | 等待其他AI／素材 |
| SCN-V4-03 | 臺灣路線：田野（T1）等 | v4 R-TW | 現有 3D＋2D | LAWWW-B；AA-B 確認 | SYS-10 | P2 | AA-B 清單 | 等待其他AI／素材 |
| SCN-V5-01 | 第四個房間（主線 10）、最後一次拆箱 | v5 F1 | 2D＋物件 | LAWWW-B | SYS-06 | P2 | — | 待開工 |
| SCN-V5-02 | 畢業典禮（G6） | v5 | 3D 校園現有＋2D 人潮 | LAWWW-B／BB-B | SYS-12 | P2 | — | 待開工 |
| SCN-V5-03 | 尾聲長桌（G7，麵店現有 3D＋CG-10） | v5 尾聲 | 3D 現有＋CG | LAWWW-B；CG BB-B | ART-15 | P2 | — | 等待其他AI／素材 |
| SCN-V5-04 | 國考考場、畢業後、五年後 | v5 畢業後篇 | 2D | AA-B／BB-B／使用者 | SYS-12、D14-T7 | P2 | AA-B 清單 | 等待其他AI／素材 |

### 14.3 美國交換篇（v4 R-US，**並行**；D47＋BB_98 2-6～2-9；10-14 改：結冰湖邊、送機 CG 拿掉）

| ID | 場景 | 劇情用途 | 類型 | 負責 | 依賴 | 優先 | 批次 | 交付標準 | 下一個可驗收成果 | 狀態 |
|---|---|---|---|---|---|---|---|---|---|---|
| SCN-US-01 | **公寓社區**（使用者 10-16 更正：不是學校宿舍）：祐廷單人戶（臥室＋客廳＋廚房＋衛浴＋陽台）＋社區外觀；學姊同社區合租（US2 在她那戶的共用廚房，BCG-32）；交誼區＝社區會所自習室 | US1 搬進公寓；US2；學期中睡覺、讀書 | 3D 可走 | 配置 LAWWW2-B 提案（`us_apartment_layout.js` 2b79dfc，以它為準）；區域、整合 LAWWW-B；建模 LAWWW2-B | — | P2（並行） | **1** | 走得進每個開放空間、床／書桌／餐桌／沙發可以互動、鏡頭不穿牆、手機效能 | LAWWW-B：可以走的區域＋導航測試；LAWWW2-B：查證＋家具組（舊的 us_dorm 配置 4e13d63f 作廢） | 進行中 |
| SCN-US-03 | 美式大型超市（店名虛構 D77） | US1 學姊帶去超市：看日期、零食區台灣泡麵（「這是鄉愁」） | 3D 可走 | 配置 LAWWW-B；建模 LAWWW2-B | US1 事件（V4-B02）、SYS-10 | P1 | 2 | 貨架走道、結帳區、零食區互動點；商品用 cvs v2 的做法 | LAWWW-B 配置＋備用區域 | 待開工 |
| SCN-US-02 | 校園街道：石灰岩系館、校門、主街（Kirkwood 一類，不寫校名） | 宿舍、超市、上課之間的移動；US3／US4 的外景 | 3D 可走（戶外） | 配置 LAWWW-B；建模 LAWWW2-B | SCN-US-01、03 | P1 | 3 | 走得到宿舍門口、超市門口、上課的系館門口；太陽方位（sunYaw） | 配置＋備用區域 | 待開工 |
| SCN-US-2D | 2D 底圖：長途巴士站（US1）、機場抵達／出發、上課那一場、中餐館、US3 春假背景；芝加哥三張照片 | US1、出發／返台、上課、香港朋友、US3、芝加哥週末 | 2D | 用途 AA-B；清單 BB-B；生成 使用者 | — | P1 | 1（清單）、2～3（接） | 1920×1080 無人物；店名 D77 | BB-B 的待生成清單 | 等待其他AI／素材 |
| SCN-US-CG | CG：BCG-32（廚房）、BCG-17（芝加哥）、US4 雪裡的台階、BCG-09（待確認） | US2、芝加哥、US4 | CG | 同上；角色 BB-B 驗收 | — | P2 | 3～4 | cg_approved 規格 | BB-B 清單 | 等待其他AI／素材 |
| SCN-US-CH | 立繪：學姊羽絨外套、香港朋友 | US1～US4、芝加哥 | 立繪 | BB-B（香港朋友名字等使用者） | — | P2 | 2～3 | BB_131 規格 | BB-B 清單 | 等待其他AI／素材 |
| SYS-10 | 交換路線狀態機（EXCHANGE_ROUTE、出國期間的地圖切換、presence、停課、事件條件「路線」）＋出發／返台轉場 | 三條路線共用 | 系統 | LAWWW-B | AA-B 回覆（交換條件、返台銜接） | P1 | 2 | 存讀檔、舊存檔、三條路線各走一次 | 最小版：路線旗標＋測試入口＋機場轉場 | 待開工 |
| SCN-US-EV | US0～US4、芝加哥週末、W15c、交換志願表（E10）事件實作 | — | 劇情 | LAWWW-B（照 BB_98／AA 定稿） | SCN-US-01／03、SYS-10、AA-B 確認 | P1 | 2～4 | 各分支、存讀檔、瀏覽器實玩 | US1＋超市（批次 2） | 待開工 |

**美國篇施工批次**：
1. **批次 1（現在）**：SCN-US-01 配置＋可以走的備用區域（LAWWW-B）；IU 宿舍查證＋家具組（LAWWW2-B）；2D／CG／立繪待生成清單（BB-B）；規格確認（AA-B）。
2. 批次 2：SYS-10 最小版、SCN-US-03 超市配置＋建模、SCN-US-01 正式模型接入、US0／US1（巴士站 2D → 超市 3D）可以玩。
3. 批次 3：SCN-US-02 校園街道、US2（公用廚房＋BCG-32）、芝加哥週末（照片＋BCG-17）。
4. 批次 4：US3、US4（雪裡的台階）、朋友版晚餐、返台銜接、W15c。

### 14.4 日本交換篇（v4 R-JP；D47：全部 2D）

| ID | 場景 | 劇情用途 | 類型 | 負責 | 依賴 | 優先 | 批次 | 下一個可驗收成果 | 狀態 |
|---|---|---|---|---|---|---|---|---|---|
| SCN-JP-2D | 日本線 2D 底圖（町公所、宿舍、街道、便利商店…；AA-B 確認清單） | J1、J2、新 17、日常 | 2D | 用途 AA-B；清單 BB-B；生成使用者 | — | P2 | 2 | AA-B 的場景清單 | 等待其他AI／素材 |
| SCN-JP-CG | CG-13（J1 異鄉的便利商店）、CG-17（J2）、CG-22 登機口、CG-23 河堤（交往中） | J1、J2、出發 | CG | 同上 | — | P2 | 3 | BB-B 清單 | 等待其他AI／素材 |
| SCN-JP-CH | 以安冬裝立繪 | 日本線 | 立繪 | BB-B | — | P2 | 2 | — | 等待其他AI／素材 |
| SCN-JP-SYS | 2D 生活區流程（時差 +1、日本的一週）——沿用 outings／home 的 2D 場景做法 | 日本線 | 系統 | LAWWW-B | SYS-10 | P2 | 3 | 一週流程可以走完 | 待開工 |

