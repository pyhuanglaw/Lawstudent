# CC M7｜B6 準備：careerLean 加分來源基準表

- 受測版本：開發分支 head `5b40dad61`（解壓在 scratchpad `mhead/`，只讀；沒有改 src/、沒有開瀏覽器）
- 方法：讀程式＋Node 腳本 `docs/story_planning/test_tools/cc/m7_careerlean.js`（載入方式照 `tests/pg_harness.js`；`WT=<工作樹> node m7_careerlean.js`）
- 腳本結果：**8／8 PASS**（S0～S7，見第 5 節）；另外印出日曆上限、寒暑假撞期、路線擋掉的活動、靜態讀取點。
- 判定歸 BB；本文最後的「CC 初判」只是建議。

計算式在 `src/story3d.js:3943–3957`（S.careerLean），每次呼叫都重算、不存檔。

---

## 1. 加分來源基準表（16 個來源：A 5、B 6、C 5）

> 「讀取位置」都在 `src/story3d.js`；「寫入位置」是 src/ 裡所有會改變那個值的地方。

### A 幫人

| # | 來源 | 讀取位置／加多少 | 寫入位置（全部） | 觸發條件 | 上限 | 理論最大 | 備註 |
|---|---|---|---|---|---|---|---|
| A1 | `F.LAWCLUB_SAT_VISITS` 法服週六 | :3952，每次 ×1 | ① story3d.js:735 `S.fafuShift`（大二起社員值班）② story3d.js:784 `S.fafuWatch`（大一，或大二起沒加入法服的旁觀）③ y2b3d.js:131 `S.auntConsult`（2027-05-22 語彤事件 9 在場版，取代那天的值班）④ wzlines3d.js:93 `S.lineAt`（陪阿德／林太太那幾個週六） | 值班日 `S.fafuDuty`（story3d.js:665）：法律系、週六、學期第 3 週起單週、非考試週、非國定假日／颱風假；到萬才館一樓 12:00 以前。入口 story3d.js:1275–1276 | **同一個週六一次**：四處都用 `LAWCLUB_SAT_LAST!==G.day` 擋（①③經 `fafuShiftable`，②④直接判斷）。①②都是演完才給，fafuWatch 同一天可以重看但不再加 | **45**（腳本 1a：Y1S1 5、Y1S2 6、Y2S1 5、Y2S2 6、Y3S1 6、Y3S2 6、Y4S1 6、Y4S2 5）。JP 路線 Y3S2 在國外 → 39；US 路線 Y4S1 在國外 → 39 | `fafuDuty` 不看人在不在國外（只看日曆），但人到不了萬才館，所以實際拿不到。四處的去重一致，**沒有重複加分** |
| A2 | 寒暑假 C16 法扶實習 | :3952，每次 ×5（`vac('C16')`） | vac3d.js:419 `S.workDone`（最後一個上班日去了＝`reg['C16@Yn']='done'`） | 大二下第 10～12 週報名、第 14 週選上（vac_activities.js:343）；C16@Y2＝2027-06-21～07-02（10 個上班日，最後一天 07-02）；C16@Y3＝2028-06-19～06-30（最後一天 06-30） | key＝`C16@Y2`、`C16@Y3`；`done` 寫第二次也是同一個 key，**每年最多一次** | **2 次＝10** | Y2 和 C02@Y2（07-01～07-05 營隊，trip）撞 07-01、07-02；Y2、Y3 都和 C10 整段撞（腳本 2b）。報名不擋，只顯示「會撞到」；營隊 trip 會跳過 07-02，C16@Y2 應拿不到 done（**未實測**）。JP 路線擋 C16@Y3 |
| A3 | 寒暑假 C09 海外志工 | :3952，每次 ×5 | vac3d.js:454（trip 走完）、:438（repDone 最後一個關鍵事件） | 大一～大三下第 3～5 週報名，面試（need `VAC_C09_INT`，第 10 週放榜）；07-27～08-05 柬埔寨；第二次起家睿直接邀 | `C09@Y1／Y2／Y3`，每年一次 | **3 次＝15**（JP、US 路線都擋 C09@Y3 → 10） | 和 C10 撞 07-27～07-31 |
| A4 | 寒暑假 C02 隊輔 | :3952，每次 ×3 | 同 A3（vac3d.js:454、:438） | 大一～大三下第 12～13 週報名；07-01～07-05 校內營隊 | `C02@Y1／Y2／Y3`，每年一次 | **3 次＝9**；但 Y2 和 C16 撞 → 想拿最大 A 時 Y2 選 C16（5）不選 C02（3） | JP 擋 C02@Y3 |
| A5 | `F.YT_LEASE_HELP` 語彤家的租約 | :3952，+3 | data/y2b_events.js:58（`ev_yt_lease_text` 最後一行 set） | 大二下第 6 週債各課（`ev_yt_lease_class`，y2b3d.js 記 `Y2B_LEASE_DAY`）當天下課後、有語彤聯絡方式，選「（傳訊息給語彤）」 | once 事件，**一輩子一次** | **3** | — |

**A 理論最大**（全部過關、不考慮 B／C）：TW 路線＝45＋寒暑假 31（Y1 C02＋C09＝8；Y2 C16＋C09＝10；Y3 C16＋C02＋C09＝13，2028 年 C16 06-30 結束不撞 C02）＋3＝**79**；JP＝39＋18＋3＝60；US＝39＋（Y3 C16＋C02＝8，合計 26）＋3＝68。

### B 研究

| # | 來源 | 讀取位置／加多少 | 寫入位置（全部） | 觸發條件 | 上限 | 理論最大 | 備註 |
|---|---|---|---|---|---|---|---|
| B1 | 讀書會出席 `G.acts.att['public_law_group@日']`（end 'full'；舊紀錄只有 `{h}` 也算 full） | :3945，每場 ×1 | data/activities.js:146–150 `ACTIVITIES.track`（坐著從開始前到結束＝full）、:138 `markAttended`（classes3d.js:423 `attendActivity` 選「聽演講」） | 公法讀書會：週四 20:00～21:30 萬才館研討室 A；Y1S1 第 10～15 週、Y1S2～Y4S1 照 termWeeks（data/activities.js:55）。**不必加入讀書會**（`canJoin` 不看社員） | key＝活動@日，**一天一場**；中途離開（left）、正在聽（in）不算 | **78 場**（腳本 1b：Y1S1 6、Y1S2 11、Y2S1 12、Y2S2 12、Y3S1 13、Y3S2 13、Y4S1 11）。JP 少 Y3S2 13 → 65；US 少 Y4S1 11 → 67 | — |
| B1' | 舊存檔 `lawclub_study@日` | :3945，每場 ×1 | 同 B1 | 法服讀書會已停用（data/activities.js:37 `skip:()=>true`，`ACTIVITIES.on` 永遠 false） | 新局 0 | 只有舊存檔：拿掉 skip 時排得到的場次 47（腳本 1c） | 新局寫不進來，只是相容 |
| B2 | 自習時數 `floor((stats.study − STUDY_AT_LAW)/10)` | :3946、:3953，每滿 10 小時 ×1 | ① game3d.js:299 `studySession`（3D 座位／宿舍書桌 story3d.js:3353／美國 us_life3d.js:226、us_blank3d.js:146）：+round(hrs)，最少 1 ② classes3d.js:1123 `studyUntil`（上課前「讀到○○前」）：+floor(until−h0)，最少 1 ③ study3d.js:146 `S.review`「考前總複習」：+3 ④ data/events.js:1995 可昕視訊一起讀書 afterOuting：+2 ⑤ 起點 `STUDY_AT_LAW` 只在 story3d.js:3964 `careerTick` 寫 | 自習：每個時段 1 件（classes3d.js:1147；考試週 +1、只能自習），一次 1～3 小時。總複習：期末前一週到期末考完、開始時間 21:00 以前 | ①②④受時段次數限制（一天最多 3 段、考試週 6 段）；**③總複習「可以重複做，沒有次數限制」**（study3d.js:93），不扣時段 | **沒有實質上限**：時段制約一天 9 小時、四年約 1400 天 → 約 12,000 小時＝約 1,200 分；期末窗口內總複習可以一天做 4～5 次（每次 3 小時）。正常玩家估 200～400 小時＝20～40 分 | 起點：經濟系不記；舊存檔在法律系第一次 tick 才記＝之前法律系讀的也不算（設計如此，story3d.js:3942 註解）。研究所文章三次（B4）也走 studySession，那三段的時數同時算 B2 |
| B3 | `GRAD_SCHOOL_DISCUSSION`（每人一件）×2 | :3948、:3953，每個人物 +2 | 記憶標籤 `SOCIAL.remember`：**heroine_05**——ladder.js `S-Lx3` 選項①（套用在 story3d.js:808）、data/events.js:504（退休的 ev_studygroup_wed，只舊存檔）、:4621（ev_sis_office_together，前置就要有這個標籤）、:4743（ev_grad_info_session「留下來聽完」）、:4750–4752（ev_grad_debate 三個選項都給）；**prof_xu**——data/events.js:529（大一辦公時間「老師，法研所是在做什麼的？」） | 學姊：總圖閒聊 S-Lx3（ACQUAINTANCE、第 3～15 週）／說明會（大一、週五、要 met_sis）／讀完文章後吵一次。許教授：大一週一 14:00～16:00 萬才館辦公時間 | 以 `CHARACTERS` 每個 id 算一次（`SOCIAL.has`），同一人多條只算 1；腳本確認沒有 alias 重複（CHARACTERS 沒有 sis／prof） | **2 人＝4**（目前只有學姊、許教授寫得到；npc_ta_chen 只記 FIRST_MET） | 「每人一件」成立 |
| B4 | `F.grad_read_done` 學姊給的文章 | :3953，+2 | game3d.js:293 `gradReadingSession` 第三次 | ev_grad_reading（data/events.js:4745：grad CONSIDERING 以上、大一下第 5 週起）給 `grad_reading` → 自習時選「讀學姊給的那篇文章」三次 | 一輩子一次 | **2** | 讀完才開 ev_grad_debate → 學姊的 GSD（B3）：同一條劇情線連帶 +2＋2；第 3 段之前的自習時數也算 B2。不是同一行為重複加分，但三項都來自同一條線 |
| B5 | 寒暑假 C10 海外暑期課（加州） | :3953，每次 ×4 | vac3d.js:454、:438 | 大二、大三下第 10～13 週報名、選上；06-21～07-31 | `C10@Y2／Y3`，每年一次 | **2 次＝8**（JP、US 都擋 C10@Y3 → 4） | 和 C16、C02、C08、C09 全部撞期（腳本 2b）；拿 C10 等於放棄那年暑假大部分 A 和 C08 |

**B 理論最大**：78＋自習（無上限）＋4＋2＋8 → 由自習決定；不算自習是 92（TW）。

### C 跨領域

| # | 來源 | 讀取位置／加多少 | 寫入位置（全部） | 觸發條件 | 上限 | 理論最大 | 備註 |
|---|---|---|---|---|---|---|---|
| C1 | 子晴 `PLAYTESTED`、`CONTEST_DAY` 各 +2 | :3949、:3954 | PLAYTESTED：data/events.js:4539–4542（ev_ziqing_secret_game 四個選項都給）。CONTEST_DAY：data/events.js:4573–4575（ev_ziqing_contest_day 三個選項都給） | contest_day：大一下第 8 週週六 13:30～18:00 公館，要 ARGUED_ABOUT_CAREER。secret_game：大一下第 11～15 週一、三 19～21 萬才館，FAMILIAR＋（CONTEST_DAY 或 CLAPPED） | 兩件都是 once、都只在大一下 | **4** | zq_testbuild3d.js:24 另外讀 `G.flags.PLAYTESTED`（旗標版）但沒有人寫；careerLean 只讀記憶，不影響 |
| C2 | 寒暑假 C08 首爾 ×3 | :3954 | vac3d.js:454、:438 | 大一～大三下第 6～9 週報名、要推薦（need VAC_C08_APP）；07-13～07-24 | `C08@Y1／Y2／Y3` | **3 次＝9**（JP 擋 C08@Y3 → 6） | 和 C10 撞 |
| C3 | 寒暑假 C11 東京 ×3 | :3954 | 同上 | 大二～大四上第 5～6 週報名、寫申請書；01-17～01-30 | `C11@Y2／Y3／Y4` | **3 次＝9** | 路線都不擋（JP 出發 2028-02-20 之後；US 2028-12-23 回來） |
| C4 | 寒暑假 C12 京都 ×3 | :3954 | 同上 | 大二、大三下第 3～12 週報名；08-09～08-27 | `C12@Y2／Y3` | **2 次＝6**（US 擋 C12@Y3 → 3） | 和 C10 不撞 |
| C5 | 交換回臺灣 +6 | :3950、:3954 | 不寫；照 `EXCHANGE_ROUTE`（story3d.js:3928 `routeDecide` 在志願截止 2027-11-18 12:00 定）＋日期 | JP 2028-08-05、US 2028-12-23 當天起（腳本 S3：前一天 13、當天 19） | 一次 | **6** | 路線不讓玩家選，照截止那一刻的交往狀態（和學姊＝US、以安＝JP） |
| C6 | 法律系年級的通識 `kind:'general'` 每門 ×1 | :3951、:3954 | classes3d.js:692 `showGrades` → :672 `reportFor` 寫 `R.grades[學期][課]`（成績字串）；classes3d.js:35、:50 改名／刪課遷移 | 每學期成績單發出（Y0 經濟系那年排除） | 註解說「及格的」——**程式是成績字串 truthy 就算**，見疑點 Q1；重修會以同一個 id 寫進下一學期再算一次（Q2） | 全部及格：**11 門**（Y1S1 國文／英文／體育／電影與敘事 4、Y1S2 國文／英文／體育／天文 4、Y2S1 體育／通識 2、Y2S2 通識 1）。若被當：每多重修一學期多 1，理論上界 77 | 11 門裡只有 4 門是 ge_* 通識（Q3） |

**C 理論最大**（全部及格）：TW＝4＋24＋0＋11＝39；JP＝4＋21＋6＋11＝**42**；US＝4＋21＋6＋11＝**42**。

### 寒暑假活動共通說明（vac.reg）

- key 是 `活動id@Yn`（Y1＝2026 暑假／2026-12 寒假；Y2＝2027…），每個 key 只有一個狀態；`done` 再寫還是同一格，**不會重複算**；`yes`／`missed`／`rejected`／`later` 都不算（腳本 S1）。
- 每個活動一年最多一次 → 最多次數＝`years` 的長度（C02、C08、C09：3；C10、C12、C16：2；C11：3）。
- 撞期只提示、不擋報名（vac3d.js:470）；實際走 trip 會跳過時間，另一個活動的關鍵日走不到。
- 交換路線擋掉（腳本 2d，`VAC.blocked`）：JP＝C02@Y3、C08@Y3、C09@Y3、C10@Y3、C16@Y3；US＝C09@Y3、C10@Y3、C12@Y3。
- 沒有算進 careerLean 的活動：C03、C04／C04W、C17 律所實習、C18／C18W 新加坡見習、T02、T03、T13 自己排的旅遊（設計選擇，列給 BB 參考）。

---

## 2. 讀 careerLean 的地方 vs 註解「只有四處讀」

story3d.js:3934–3935 註解：「只有四處讀：主線 7 選項②、尾聲祐廷的最後一句、尾聲朋友那句、?dev」。實際（腳本 R 段靜態掃描＋人工追呼叫鏈）：

| # | 位置 | 讀什麼 | 影響 | 在註解的四處裡？ |
|---|---|---|---|---|
| 1 | data/events.js:4783 | `careerLean(G).top==='C'` | 主線 7 姊姊火鍋 選項② | 是 |
| 2 | game3d.js:69–71 `devCareer` | A／B／C／top | 只有 `?dev` 顯示 | 是 |
| 3 | postgrad3d.js:459（epilogue ⑤） | `S.path` → `pathTop` → `S.lean` | 尾聲祐廷最後一句 `E.last[path]` | 是 |
| 4 | postgrad3d.js:432 `epiAlways` | `S.lean(G).top`（**原始 top**） | 尾聲朋友那句 | 是 |
| 5 | postgrad3d.js:381 `firstDay` | `S.path` | 2030-10-01 第一份工作的群組照片文字 `Fi.me[path]` | **否** |
| 6 | postgrad3d.js:391 `ytEnd` | `S.lean(G).top==='A'`（原始 top）→ e3 | 語彤的結局 3／工作 3；被 :402（epiLine 語彤）、:421（exLines 前任語彤）、:453（尾聲語彤不在場） 用 | **否** |
| 7 | postgrad3d.js:403 epiLine 學姊 | `S.lean(G).top==='A'&&lw` | 學姊尾聲 roadA／road | **否** |
| 8 | postgrad3d.js:405 epiLine 子晴 | `zqLine` → `pathTop` | 子晴尾聲 line／apart | **否** |
| 9 | story3d.js:3965 `careerTick` | 三個總分 | 記 CAREER_Y4_BASE（內部） | （內部，不算讀者） |

**結論：「只有四處讀」已不成立**——至少多了第一份工作照片、語彤結局、學姊尾聲、子晴尾聲四處（都在畢業以後）。另外 `tests/career_lean_unit.js:69–70` 的檢查只掃 `src/` 第一層（不含 `src/data/`），所以 events.js:4783 被漏掉，測試仍寫「主線 7 接進來時才加」——註解和測試說明都過時（測試本身仍 PASS）。

---

## 3. 平手規則與 CAREER_Y4_BASE

- 平手（story3d.js:3955–3956）：取最高分；多個同分 → 若 `CAREER_Y4_BASE` 是物件，比「總分 − 基準」（大四那一年加的分），留最高；仍同分照 **B → A → C**；三項都 0＝B。腳本 S5：A5＝C5 沒有基準 → A；基準 A5 → C（大四 C 多）；兩邊大四一樣多 → A。
- `CAREER_Y4_BASE` 唯一寫入點：story3d.js:3964–3965 `careerTick`（由 `S.tick` story3d.js:1197 每格呼叫）——法律系、`CAREER_Y4_BASE==null`、`CALENDAR.termOf(day)` 是 Y4S1 第 1 週 → 記當下 `{A,B,C}`，之後不覆寫（腳本 S7）。第 2 週以後才讀檔的舊存檔不補（平手直接走 B→A→C）。
- `STUDY_AT_LAW` 同一個函式：法律系第一次 tick 記當下 `stats.study`（腳本 S6）。
- `S.tick` 第一行在 `E.player.busy`／`GM.D.active`／`S._sleeping` 時 return，careerTick 在那之後才跑——Y4S1 第 1 週整週都在忙的極端情況才會漏記（實務上不太可能）。**US 路線**：Y4S1 第 1 週人在美國，S.tick 是否照常跑**未驗證**。
- 畢業後 `pathTop`（postgrad3d.js:91）：top 是 B 但沒報考研究所（`gradApplied` 假）→ `C>A ? C : A`（再平手 A）。

---

## 4. 疑點

| # | 疑點 | 依據 | 影響 |
|---|---|---|---|
| Q1 | **不及格／缺考的通識也算分**：careerLean 用 `g[cid]` truthy，但成績單存的是字串（「及格」「不及格（下學期重修）」「缺考」「32 分（不及格）」都是 truthy），註解寫「及格的通識」 | story3d.js:3951 vs classes3d.js:672–675；腳本 S4（含不及格國文、缺考通識都算） | 被當反而不扣分 |
| Q2 | **重修又算一次**：重修課以同一個 course id 寫進下一學期 `R.grades[下一學期][id]`，careerLean 逐學期逐門數 | classes3d.js:65（termCourses 併入 rtCourse）、:83–88 planRetakes、:672 reportFor；腳本 S4（Y1S1 不及格＋Y1S2 重修＝2） | 被當一次 C +2（原本 1）；每多被當一學期再 +1，上界 77 |
| Q3 | `kind:'general'` 包含大一國文、英文、體育（11 門裡 7 門不是 ge_* 通識）；註解「及格的通識」和 B6 計畫裡的「通識」可能指 ge_* 4 門 | data/courses.js 列表（腳本內列出） | 每個玩家都 +7 的 C 底分，讓 C 在中段玩家比較容易贏 |
| Q4 | 自習（B2）沒有實質上限，期末前「考前總複習」可無限重複（每次 +3 小時、不扣時段） | study3d.js:93、:146 | 刷 B 的手段；也讓 B 對「認真讀書」的玩家幾乎必然最高（是否就是設計意圖，需 BB 判斷） |
| Q5 | 註解「只有四處讀」過時；`career_lean_unit.js` 第 4 項檢查漏掃 `src/data/` | 第 2 節 | 文件／測試說明不準 |
| Q6 | 畢業後讀法不一致：`zqLine`、`S.path` 用調整過的 `pathTop`（B 沒考研究所改 A／C），但 `epiAlways`（朋友那句）、`ytEnd`（語彤 e3 要 top A）、學姊 roadA 用**原始** `S.lean(G).top`。原始 B、調整成 A 的玩家：祐廷最後一句走 A，朋友那句卻是 B，語彤 e3、學姊 roadA 拿不到 | postgrad3d.js:91–96 vs :391、:403、:432 | 同一個玩家尾聲 A／B 混用（BB 09:02 ② 只修了 zqLine） |
| Q7 | Y4 平手比較對兩條交換路線不對稱：JP 2028-08-05 回來，+6 已在 Y4 基準裡；US 2028-12-23 回來，+6 落在「大四那一年」，平手時 C 佔便宜 | story3d.js:3950、:3965 | 只影響平手 |
| Q8 | C16@Y2 和 C02@Y2 撞 07-01、07-02，報名不擋；營隊 trip 會跳過 C16 最後一個上班日 → C16@Y2 拿不到 done（只靠讀程式推，未實測） | vac3d.js:84–89、:419、:452–454；腳本 2b、2c | 玩家可能以為兩個都算 |
| Q9 | `fafuDuty` 不看人在不在國外；值班入口要人在萬才館，所以實際拿不到 | story3d.js:665 | 無實際影響，只影響理論上限的寫法 |

**沒有發現**同一行為被兩處重複加 LAWCLUB_SAT_VISITS（四個寫入點去重一致）；寒暑假同一年同一活動也不會重複。

---

## 5. 腳本情境（全部 PASS）

| 情境 | 設定 | 結果 |
|---|---|---|
| S0 | 空存檔 | A0 B0 C0 → B |
| S1 | VISITS 7、C16@Y2／C09@Y1／C02@Y1 done、YT_LEASE_HELP；另有 yes／missed／rejected | A＝23（後三種不算） |
| S2 | 讀書會 full 1＋舊 `{h}` 1＋left 1＋in 1＋lawclub_study full 1＋B4 演講；study 125、起點 20；GSD 學姊兩條＋許教授；文章；C10@Y2 | B＝3＋10＋4＋2＋4＝23 |
| S3 | 子晴兩件；C08@Y1、C11@Y2、C12@Y3；JP 路線 | 08-05 當天 C＝19，前一天 13 |
| S4 | Y0 兩門＋Y1S1 四門（含不及格國文）＋Y1S2 重修國文＋缺考通識 | C＝6（Q1、Q2 重現；照註解應是 4） |
| S5 | A5＝C5、B2；有／無 Y4 基準 | A／C／A |
| S6 | careerTick：經濟系 → 法律系 | 經濟系不記；STUDY_AT_LAW＝33 |
| S7 | Y4S1 第 1 週 careerTick 兩次 | 記一次、不覆寫 |

---

## CC 初判（判定歸 BB）

- 基準表：16 個來源，公式和註解大致一致；A1、B1、寒暑假活動的上限與去重**沒有問題**。
- **建議 BB 判定為需修正**：Q1＋Q2（通識不分及格、重修重算）——程式和註解「及格的通識」不符，且會讓被當的玩家多拿分。修法很小（只算及格字串、同一門只算一次），但屬於數值規則，要 BB／AA 定。
- **建議 BB 釐清設計**：Q3（國文／英文／體育算不算「通識」）、Q4（自習無上限、總複習可刷）、Q6（畢業後原始 top 和調整 top 混用）。
- **文件層級**：Q5（「只有四處讀」改成實際讀者清單；career_lean_unit 掃描加 `src/data/`）。
- Q7、Q8、Q9：記錄即可，影響小。
- 沒測：瀏覽器真實流程；US 路線 Y4S1 第 1 週 CAREER_Y4_BASE 是否記得到；C16×C02 撞期的實際結果。
