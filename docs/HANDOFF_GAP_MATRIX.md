# 永久工作總表（HANDOFF_GAP_MATRIX）——閱讀版＋LAWWW 交班快照

> **資料檔**：機器讀的總表是 `docs/handoff/tasks.json`（以它為準）；這份是閱讀版＋值班 LAWWW 的交接檔（第 1 節交班快照）。怎麼用、誰改、狀態八種、欄位：`docs/rules/ROLE_LAWWW.md` 第 4 節。路徑和節名不改：`check_handoff.py` 第 9 項比對這份提到的 ID；`userwork` 讀第 11 節最上面那一則；`duty_state.py` 把它當 LAWWW 的交接檔。
> 企劃面的缺漏以企劃線 AA_140 第 3 節為準；這份管施工與測試，兩邊互指。


## 1. 交班快照（每次交班覆寫這一節；上一次的快照搬到第 11 節）

### LAWWW-C 值班中的進度快照｜2026-11-12 08:1x UTC（還沒交班；這一節平時更新，交班只補差異）

- **線上**還是 v9.10.25（main dc3d33941）。今天的東西都在開發分支 `claude/adoring-meitner-mqzst8`（08:1x 頂端 `1ec4613b04`），**沒有發布**。
- **A 本班成果（都在開發分支、Node 相關測試過、瀏覽器大多還沒驗）**：規則 D152～D157（等的時候要做事的 hook、地點關卡、店面標準 §12、電腦不能空轉、規則包同步）；地點關卡 `tests/place_gate_unit.js`（已知未過 128→61）＋現況表＋BB 第三層判定檔 `docs/handoff/place_gate_bb.json`；60 fps 上限；店員／客人／118 巷同學；夜市 13 攤＋118 巷兩間外帶顧攤的人；打烊後店員不站店裡；14 間颱風假不開；6 間進快速前往；三間飲料可送人；四間店營業時間（AA_831 第二版）；打工五間（AA_828／829，三輪）；可昕、以安改句（AA_819～834）；LAWWW2 的店外＝室內模型（新生南路 5＋南洋＋汀州路 7）、水源市場巷子、林家乾麵街景。
- **B 全部未完成（任務 ID）**：BUG-RUN-STUTTER-1112（P0，原因假設＝300 Hz 螢幕＋沒上限；使用者：筆電 60 Hz 不頓、300 Hz 一直接著；CC ST5 r2 還沒驗到）；SHOP-REAL-INSIDE-1112（第一次走近 233 ms＝BB FAIL，LAWWW2 改預載；汀州路七間等 CC／BB；東南大聯商品換模型；溫州街、公館、禮貌生財、溫特寶邸還沒接）；SHOP-STANDARD-BACKFILL-1112（剩 8：美國兩間買不到東西＋字、禮貌生財三點字＝AA；阿忠鮮果顧攤＝LAWWW2 站位；燒臘打烊窗變暗＝LAWWW2）；L118-CLOSED-LOOKS-OPEN-1112（外觀＝LAWWW2）；SHOP-INTERIOR-VIEW-1112、SHOP-WINDOW-3D-1112（LAWWW2）；SHOP-JOBS-1112（第四輪子代理在做：宋知寧山嵐線＋AA_828 第 6、7 節）；DLG-FULL-REVIEW-1110（以安後續批次＝AA 寫）；BAR-GROUP-3D-1112；DATE-CHOICES-1110；MOVIE-REMIND-LATE-1110、US-FINAL-PROF-PASS-1110（稽核改回待測試）；BRANCH-AUDIT（這台磁碟不夠，見 FACTS）。
- **下一班第一件事**：BUG-RUN-STUTTER-1112 → SHOP-REAL-INSIDE-1112 → SHOP-JOBS-1112（合併第四輪）→ SHOP-STANDARD-BACKFILL-1112 → HELP-GUIDE-1110。
- **C 正在做的**：子代理 `worktree-agent-a68ee22a0035c1ef4`（SHOP-JOBS 第四輪，基準 1ec4613b04）——回來當回合合併；容器重開先跑 `check_handoff.py loose`。
- **D 規則**：D152～D157（CLAUDE.md、ROLE_*、AI_SESSION_HANDOFF HV-34～37）；下一個 D158。node-unit-auto 改成 cancel-in-progress:false（83d9e6374e）。
- **E 跨 AI**：BB 判定走 place_gate_bb.json；CC 佇列（使用者電腦）：ST5 r2、XS_REAL_perf_old、TZ_REAL_*、L5F03_*、L2C82_ALL、L77DE_ALL（8cd94d440d）、南洋四角度；AA 待回：D16 刪節號、D18 她請確認；LAWWW2 待交：預載修頓、東南大聯商品、站位、自查溫州街／公館。
- **F 測試與問題**：**11-12 下午 GHA 全套 Node 連 7 輪被取消，a8979a56a2 那一輪 08:00 起在跑、還沒出結果——在它（或之後一輪）綠以前，開發分支「全部 Node 過」沒有證據**；iPhone 實機今天完全沒驗；`check`、`asks`、`loose` 08:0x 都 OK；`roles` 08:1x 只剩 1 項（BB 交接檔寫縮寫 SHOP-REAL-INSIDE，已請 BB 寫全名）；`userwork` 08:1x：帳號 B 11-10 快照交代的 13 條逐條對過總表——帳號 A 都已推進（MOVIE-REAL、四個 LAWWW2 模型已驗收；GIFT-HOLIDAY、HER-ASK-MORE、ATTEND-TIDY、BULLETIN-BOARD、BUG-INV-GOASK-PERSIST-1110、BUG-YEJIAN-NO-VISUAL-1110、BUG-MOKU-EXAM-SEATS-1110、SIS-STATIONERY-1110、DLG-NO-ECON-REPEAT-1110 已整合待測試＝等 BB；AA_342 svc 兩句已拿掉），**只剩 HELP-GUIDE-1110（說明頁＋第一次提示，使用者試玩回報）還在進行中、這一班沒動＝排進下一班**；`wip_backup/HER-ASK-MORE-1110_wip.patch` 任務已整合，可以刪（還沒刪）；`incr` 沒重跑。
- **G 東西放在哪**：見 `docs/handoff/FACTS.md` 最後三條（磁碟、GHA、BB 判定檔）；scratchpad 的 numpy 環境 blenv 已刪（重建：`python3 -m venv` ＋ `pip install numpy`，地點關卡 `--coplanar` 才需要）。

### 帳號 A 沒有交班（用量到上限）→ 帳號 C 接班｜LAWWW-C（`session_01Me1thu8Zn934H58kWKNfuF`）｜2026-11-12 03:1x UTC 接班紀錄（HANDOFF-C-1112；**帳號 A 沒留交班快照**，下面是 LAWWW-C 從 commit、tasks.json 和使用者傳的帳號 A 最後對話截圖整理的）

- **帳號 A 停在哪**：線上 v9.10.25（11-11，main dc3d33941）；發布後整合一路做到 `4e248bb55e`（11-11 21:05，X324 最後一塊＝閒聊階梯選項 fx 694 個，AA_816）。沒有只在它機器上的成果（commit 都在、已快轉合併）。
- **帳號 A 沒來得及做的**（截圖）：①`4e248bb55e` 的 GHA（run 532）沒看——紅一支 peishan_leftover2 6a（逐字比對把新 fx 當差異＝測試舊期望），LAWWW-C 改在 `be1e5d7256`；綠了交 BB 抽測閒聊選項（已通知 BB-C）。②VA10 香港群組回覆選項（`28d5057e8`）、「今天的課」chip（`59a4efb68`）＋宿舍長桌椅子：CC 排好等新版本——CC-C 還沒登記，佇列待確認。③邀約回覆要不要加玩家選項：帳號 A 問了 AA，沒看到回覆——LAWWW-C 11-12 再問 AA-C。④LADDER-DATING-TIER-1111（交往中那一層閒聊）記成先不做。
- **接班對帳**：check 116 → 47 項（剩：第 4 項 25 筆已驗收沒寫 evidence、第 10 項 18 筆 xai 欄位、第 7 項 4 筆交付狀態不一致＝AUDIT_PENDING）；roles 剩 LAWWW2 10 項（待它改交接檔或補任務）；asks OK；loose OK（五條舊本機發布分支確認內容都在、已刪）；incr 195 項（166 項 LAWWW2 outbox 的 state／ack 寫法、5 個 WIP commit 沒分類、AA outbox 13 筆缺 sha／state——已通知 LAWWW2-C、AA-C；水位線沒前進）；releasegate 5 項都已驗收；userwork 68＋13 項還沒逐條排。
- **各職位**：AA-C、BB-C、LAWWW2-C 11-12 03:1x 登記（都 no-handoff），duty sync 已收；LAWWW2-C 接著做完帳號 A 的 ECON-NAV-TRAPS-1111；CC-C 還沒登記。

### 帳號 B → 下一個帳號｜LAWWW-B（`session_01DvRVNNnivf7da7qqWuGmw6`）｜2026-11-10 04:1x UTC 交班（使用者 04:1x「現在交班」）

**本班情況：使用者 11-10 01:5x「剩下的使用量只夠你 其他AI不會工作 電腦測試繼續跑」——帳號 B 只有 LAWWW-B 值班（SOLO-LAWWW-B-1110）；使用者選擇題：電腦測試 LAWWW 排、LAWWW 代判；新台詞等 AA；先修使用者回報的；不發布（「先不要」）。開發分支 `claude/modest-rubin-2lyp7g` 最後 `e73888074`，main 沒動。**
- **A｜本班成果（11-10 01:54～04:1x，都在開發分支、都還沒發布）**：
  - 一鍵前往約會跳到約好的時間、還沒開門也能前往（INV-GO-JUMP-1110，ed75c456a）；一起過去的目標列（INV-NOW-GOAL-1110，be7ae2215＋33cdc069e）；出席一門一行（ATTEND-TIDY-1110，39b316018）；讀檔後照樣提醒直接過去（BUG-INV-GOASK-PERSIST-1110，ec38870a8）；她約改天可以選日子（HER-ASK-LATER-DAY-1110，2f4f9e58f）。
  - 她主動約：見面後 3 天、曖昧（第 5 階）以上隨時（HER-ASK-MORE-1110，9f3133b99＋8ef32cb82）；有女朋友時好朋友以上可以單獨吃飯（PARTNER-CLOSE-OK-1110）；戀愛條三段＋出去玩說明（ROM-STAGE-TEXT-1110）；可昕「操。」四句換掉（KX-NO-SWEAR-1110，tests/user_line_edits.js）；回憶不印代號（MEM-LABEL-RAW-1110）；咖啡買錯拿掉（WRONG-COFFEE-OFF-1110）；朋友名單交往中排最上面（FRIENDS-PARTNER-TOP-1110）——都在 8ef32cb82。
  - 總圖：樓層簡介只留一塊（LIB-BOARD-FLOAT-1110，7a019726d）；外拱廊柱頂不閃（LIB-ARCADE-FLICKER-1110，223a9378d：campus_library.py 換 LAWWW2 v3.2＋修疊面、重新匯出 GLB）；B1 入口改到總圖北側露天下沉中庭（LIB-B1-OUTSIDE-1110 第一階段 701aeb256＋98e81fe06＋e73888074，程序化 BLOCKOUT）；B1 洗手間東邊空房放長期寄物櫃、大廳門上字改（LIB-B1-NOOK-1110，056820edd）。
  - 測試：tests/flow_inv_go_jump.py（新）、flow_invite_phone.py 改成現在的流程；電腦佇列改短版由 LAWWW 排（cc-testing cba181cf4、46ee73788）＋探針 lawww_b1court_shot_probe.py（cc-testing 76b2c073d）。
- **B｜全部未完成**（`queue --owner LAWWW`）：
  - LIB-B1-OUTSIDE-1110 第二階段：中庭換 Blender 模型（現在是程序化方塊）；**LAWWW2 的 library_b1.py 下次重新產生配置時，stairs.up 要改 campus（不然蓋回大廳）、長期寄物櫃收進去（現在在 library_b1_3d.js）**。
  - FRIENDS-PARTNER-TOP-1110：使用者說可昕不在朋友名單——程式上在（可能在最下面），等使用者確認，還沒有就要存檔。
  - 還沒做（不用新台詞）：X285 椰影大道遠景都是補習班、X289 一盞飲料飄在半空、X294 法服徵人攤位位置、X283 校園地磚 patch（CAMPUS-FLOOR-STRIP-1110，LAWWW2 wip）、HELP-GUIDE-1110 說明頁（字要 AA）、BUG-YEJIAN-NO-VISUAL-1110、BUG-MOKU-EXAM-SEATS-1110。
  - 等 AA：SHIFT-TREAT-1110（她打工時招待、開心你來，暫停）、BULLETIN-BOARD-1110、DATE-CHOICES-1110、HER-ASK-MORE 的「有點熟」那幾則（th 2）、AA_539 句子不夠所以日常邀約還是隔 14 天；AA 回來要看：tests/user_line_edits.js 四句、PROG_HINT 新三句（UA-LAWWW-1110-63 AI 解讀未確認＝asks 1 項異常）、PARTNER 規則改了 AA 10-14 的 ②。
  - 待匯入（AA 已交）：DLG-NO-ECON-REPEAT-1110、svc 拿掉、GIFT-HOLIDAY-1110、MOVIE-REAL-1110（同上一份快照）。
- **C｜正在做的**：沒有（交班停了）。GHA node-unit-auto 在跑 e73888074（98e81fe06 那一輪被新的 push 取消）；電腦佇列 L98E_*（98e81fe06）跑到一半（b1court PASS）。
- **D｜決策與規則（使用者 11-10 選擇題，都在 user_asks_LAWWW.json UA-LAWWW-1110-40～66）**：電腦測試 LAWWW 排、代判；新台詞等 AA；先修回報的；不發布；好朋友以上可以單獨吃飯；戀愛條三段；咖啡買錯拿掉；可昕不罵髒話；B1 入口在北側；柱子閃＝花紋跳動。
- **E｜跨 AI**：本班其他職位都休班，沒有傳訊息（D75）。要給下一班的：上面 B 的 AA、LAWWW2 項目；BB／CC：佇列被 LAWWW 改成短版（舊整份在 cc-testing 31d4ce230）、L98E 結果要判、L492 已代判（invphone＝TEST_BUG 已改）。
- **交接檢查**：check 剩 5 項＝原本就在等使用者的（BUG-02／TEST-05 iPhone 實機、BG-CRAM-1018、CINEMA-CG-1107、BG-AA720-1108）；roles OK；asks 1 項＝UA-LAWWW-1110-63（AI 解讀未確認）；incr 2 項＝AA outbox 第 392、394 筆 WIP 沒寫 remaining（AA 分支，AA 接班補）——**這一班水位線都沒前進**（上一次 b25ea971f），下一班 incr 會多看本班的 commit。
- **F｜測試與問題**：GHA 223a9378d 全過；GHA 492ef334a 抓到的 2 支已修；e73888074 那一輪等結果。電腦 L492：invgo、p0、libfloors、zone、mini、reach、classreal、main12 PASS，touch 未知；L98E_b1court PASS（白天、晚上、走進 B1）。雲端：flow_inv_go_jump、flow_invite_phone ALL PASS。

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
| V6-A1～A8 ★ | 以安、語彤：告白條件、分開路線、前任版、16b 面對面、桌遊團反應、CG-18～21 | ✗ | 待開工 | 跟著 v3～v5 事件接 | P2 |
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

## 11. 交班快照歷史（只留上一則：`check_handoff.py userwork` 讀最上面那一則；更早的看 `docs/handoff/snapshots/` 和 git 歷史）

### 帳號 B → 下一個帳號｜LAWWW-B（`session_01DvRVNNnivf7da7qqWuGmw6`）｜2026-11-10 02:1x UTC 交班（使用者 02:0x「我已經通知其他AI交班 他們交班完之後你也交班」；HANDOFF-B-1110）

**下一班第一件事：使用者 11-10 試玩回報 X268～X295 還有很多沒做（見 B）；開發分支 `claude/modest-rubin-2lyp7g` 比 main 多很多遊戲改動（都還沒發布、沒有使用者同意不合併 main）；最新含遊戲檔的 GHA 是 33ebe5eba（交班時跑中）。**
- **A｜本班成果（11-09 16:10～11-10 02:1x）**：
  - BUG-Y0-E08-MISSED-AFTER-GOING-1109（系烤，已驗收，fc879e47b）、BUG-OUT-ALARM-SKIP-1109（約好的出遊預設停，已驗收，87f52f2f3）。
  - LAWWW2 接回：牆一次畫完 6bbfca043（畫面 PASS、PC 效能持平）；#204 外牆腳第一批 a5ec91a36（四人房、萬才 ART_APPROVED；大口、茶屋撤回）、第二批 1827999fb、第三批 faf1b75a4（落地櫃子底下、一盞改補 yizhan）；CAM-TEAYARD 兩輪 b6685c824、4f888cf3c；CAM-VIEWPANE-SIDE b8cffd669。
  - 使用者 11-10 試玩回報（都在開發分支、待 BB 測）：SEAT-NO-ASK 1afc519eb（上課不問坐哪）、LUNCH-NO-ASK 42fff6105（下課吃飯不問哪家）、WAKE-STALE df4674cb2（起床選單只在醒來的地方）、BUG-GREET-NOCLASS-1110 968bd311f（週末不問有沒有課；AA_729 匯入）、BUG-INV-ACC-TIME-1110 a1c0c2bc5／bc9c1408c（答應句不寫時間；AA_731）、人物頁 BOOKSTORE_TOGETHER 補字 4cefe226b、ROM-PRIVATE-DATE d7e722c90＋6c7e3918f（可以攻略的對象一開始就能培養戀愛、約會加戀愛＋信任、戀愛條朋友以下也顯示、選完說出祐廷那一句）、SERVICE2-LEGAL a883f36de（服務學習（二）法律服務中心，AA_735）、BGN-AFTER-HOME 063592f18（出遊演完時段用完＝回宿舍睡）；舊規則的測試照新規則改 be7c2c374。
- **B｜全部未完成**（`queue --owner LAWWW`；本班新的）：
  - 使用者試玩回報待做：HELP-GUIDE-1110（說明頁＋第一次提示）、BUG-YEJIAN-NO-VISUAL-1110（頁間書屋人物動作）、BUG-MOKU-EXAM-SEATS-1110（木曜日考試週座位，存檔 tests/fixtures/user_save_day47_1110.json）、INV-GO-JUMP-1110（一鍵前往要跳到約好的時間）、INV-NOW-GOAL-1110（現在一起過去寫在目標列）、HER-ASK-LATER-DAY-1110（改天選日子）、HER-ASK-MORE-1110（她主動約太少；**WIP 沒驗證：wip_backup/HER-ASK-MORE-1110_wip.patch**，資料每則 th 3／5 要請 AA 改幾則成 2）、ATTEND-TIDY-1110（出席紀錄）、BULLETIN-BOARD-1110（公告欄，等 AA 的公告字）、DATE-CHOICES-1110（約會選項對話，等 AA；晚上約會完直接睡）。
  - AA 已交、待 LAWWW 匯入：DLG-NO-ECON-REPEAT（企劃線 256bcdc42，重跑 import_arcs、import_arc_invites、import_activity_scenes，白名單更新）；AA_342 svc 兩句拿掉（4470f4908：src/twfill3d.js 的 S.SVC 刪掉、Y2_SVC_CHESS 不記）；GIFT-HOLIDAY-1110 三批（AA_732 fc9ff6d3d、AA_733 1edb14888、AA_734 246ef6735；含物品欄 X291、她送你的禮物、山嵐文具區學姊四場）；MOVIE-REAL-1110（片單 AA_730 8a246c40f＋AA_708 一句；BB-B 海報第一批 10 張 claude/elegant-brown-fcos7n e4eea1c780 docs/story_planning/bg_approved/posters/，圖上沒字、片名要遊戲寫；進 1 廳坐下關燈再演）。
  - BB-B 找的：BUG-INV-GOASK-PERSIST-1110（P2，讀檔後約好的見面 missed：goAsked 跟著存檔）。
  - LAWWW2 手上：CAMPUS-FLOOR-STRIP-1110、AVENUE-FAR-SIGNS-1110、YIZHAN-FLOAT-CUPS-1110、LAWCLUB-BOOTH-MOVE-1110、SIS-STATIONERY-1110（WIP）、SERVICE2 接待桌模型（P3）。
  - 其餘照總表（v0～v5、D99）。
- **C｜正在做**：沒有（HER-ASK-MORE 那一份存成 patch，沒進遊戲）。沒有只在本機的東西。
- **D｜規則**：本班沒有新的 D／HV。使用者決定（USER_WANTS X268～X295）：說明頁＋第一次提示；上課直接坐、占位子之後再加；送禮只給可以攻略的對象、節日（聖誕、七夕、2/14、生日）不扣時段、同一節最多兩人、好感夠她也回送；學姊很喜歡文具（人物設定）；單獨約會、選項一開始就能培養戀愛（LAWWW 依使用者「你要先決定哪些活動」定）；服務學習只有兩學期（圖書館、法律服務）；公法讀書會照現在（大一上第 10 週起，使用者沒選改）。
- **E｜各職位**：BB-B、CC-B、AA-B 已交班（duty_*.json handed-off）；LAWWW2-B 交班中（duty sync 收）。
- **F｜測試**：本機全套 1164 支（ROM 改完以後）8 支舊規則已改；GHA 33ebe5eba 跑中（之前 4f888cf3c、1827999fb、a5ec91a36、fc879e47b success）。使用者 PC（cc-local）20:07Z 以後沒推，功能類改在 CC 雲端跑；**沒測 iPhone 實機**。



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
