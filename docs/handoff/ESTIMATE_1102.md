# 接班盤點與預估時間（2026-11-02，LAWWW 帳號 A）

> 使用者 11-02 03:3x「先確定其他AI留下什麼事情還沒有做，預計還要多久每個階段每個任務」。7 個唯讀代理（四職位各一、實測速度一、合併一、反向核對一）在開發分支 `1d509efeb`、企劃線讀總表與四職位交接檔。**下面「核對修正」那一節是反向核對抓到的錯，數字以修正後為準。** 每項任務的時數在第 4 節。

## 1. 結論（修正後）

- 已整合待測試 776 項（LAWWW 692／LAWWW2 60／AA 18／BB 6），程式都在開發分支，只差 BB 在瀏覽器驗；還沒做完 195 項，一半以上等使用者的圖或決定。
- D99 三項（經濟系、寒暑假、美國交換）程式都在；經濟系 11-01 判過 GO，但之後主流程有改，下一版要用新候選重跑經濟系四種玩法。
- 瓶頸：D99 是 BB／CC 的瀏覽器驗收（實測每個情境約 12.5 分鐘）；D118 和「全部做完」是 AA 的內容（D118 30～65h）。
- BB＋CC 全部驗完約 100～230h，兩條線牆上時間約 7～15 個工作天，乘上過去的斷層約 2～4 週；前提是 BB 每批交照任務 ID 的 PASS／FAIL 清單、LAWWW 整批改總表（每 100 項約 0.5～1h），而且不再大量新增任務（過去新增是結案的 1.5～3 倍）。
- 下一版發布：約 19～36h 關鍵路徑（含新候選重跑經濟系四種），約 2～4 個工作天；25～30% 機率多一輪 rc2（+4～8h）。
- D118（讀書、考試、職涯）：機制部分 2～4 個工作天可以玩，全部內容 5～10 個工作天。

## 2. 各階段

| 階段 | 剩下的 | LAWWW | LAWWW2 | AA | BB | 關鍵路徑 | 日數 | 等使用者 |
|---|---|---|---|---|---|---|---|---|
| ① 經濟系完整流程（D99 第一，v0） | 玩家已經能從新遊戲一路玩到法律系開學。BB 11-01 02:3x 判 QA-PLAYTHROUGH-1018 GO，基準 39f68236c，紀錄在 BB_218 L6508。剩下的：<br>①經濟系已整合待測試 83 項，要先對照 BB_218 桌上結案，再補跑 20～35 項。這 83 項包括 AA 的 BUG-E30-CLERK-1018、Q-E27-WHY-1018 等 4 項，LAWWW2 的 ART-05、WZ-CAT-LIFE-1023 等 8 件。<br>②DL-04：17 個核心事件要標 keep:'must'，src 目前只有 2 處。<br>③LAWWW2 照經濟系路線巡一次場景（ART-DIRECTOR-LAWWW2）。<br>④n255 臺大校門口還是黑底（BUG-ECON-HOME-SHOTS-1018），因為還沒有 ntu_gate 這張圖。<br>⑤AA299-IMAGES-1018 要的圖都已經有檔案：第五批 10 張在 63f00030c、78ebf6582 接上，另外有 tour_bus、car_*、exam_hs_classroom、daan_park。這項可以改成已整合待測試，只剩 BB 看畫面。<br>不在 D99 的 ENGINE-FILL-SPEC-1021（2～4h）、LAKE-LAMPS-STAGGER-1101（1～2h）延後做。 | 5～11h：DL-04 1～2h、修 BB 驗出的失敗 3.5～7.9h、改狀態約 0.5h。延後的 3～6h 不算在內。 | 2～8h：經濟系巡查 2～4h、ART-ECON-3D-GAP-1021 收尾 0～1h、8 件回修 0～3h。 | 0～0.8h（只有 BB 驗出台詞問題才要改） | 2.6～7.4h：桌上對照 BB_218 寫 judgments 1～1.5h，補跑 20～35 項，ECON-ART-USERLOOK 0.3～0.6h。 | 約 6～14h：BB 結案加補跑 2.6～7.4h → LAWWW 修失敗 2～5h（DL-04 同時做）→ BB 複驗 0.5～1.5h。 | 1～2 個工作天，排在 BB 接班立即佇列之後。如果 CC 第二條線和立即佇列同時跑，約 1 天。 | 這些都不影響「能玩」：<br>- 圖：ntu_gate、經濟系中秋烤肉 CG（CG-ECON-BBQ-1018）。<br>- 場景 ART_APPROVED：ART-01、BG-ECON-B1-1018、ART-V0-DORM、V0-ART-DORM、WZ-SHOP-AA364-ART、ART-12 等，清單在 docs/handoff/USER_ART_REVIEW_1027.md。<br>- 共同教學館、女舍的參考照片（ART-PHOTO-CMP-1021）：到了以後 LAWWW2 要 2～5h。<br>- 電腦和手機上的 ?perf 數字（PERF-ZONE-ENTER-1018）：拿到以後 2～6h。 |
| ② 寒暑假系統（D99 第二） | SYS-LBREAK 已經驗收。寒暑假相關、已整合待測試約 41 項（BB 的分類；LAWWW 用關鍵字搜，跨各階段約 72 項），例如 VAC-GAP-1031、VAC-GAP2-1031、HOL-NYE-Y2／Y3／Y4、HOL-VA、AA532／533-VAC-FIX-1030、X58-REST-1027。<br>還沒跑的：BB-TEST-VAC-C16-C18-1021（法扶實習、律所暑期實習、海外見習團）。<br>其他：<br>- VAC-B1：LAWWW 要先交芷若大一暑假的衝突清單，AA 再裁定。<br>- VAC-B3：背景 train_day 有註冊，但沒有任何事件用到。<br>- BB198-VACB22：對照 7-2 的新事件。<br>- VAC-GAP-ROUTES（日本、美國路線寒暑假的空白）：AA 暫停中。 | 2.5～5.5h：VAC-B1 0.5～1h、VAC-B3 0.3～0.8h、修失敗 1.6～3.7h。VAC-GAP-ROUTES 恢復的話，實作再加 1～2h。 | 0h（機場 ART-VAC-AIRPORT-1021 算在③） | VAC-B1 裁定 0.5～1h。VAC-GAP-ROUTES 恢復的話再加 3.5～6.5h：重跑 vsweep_routes.js、缺口表、第一批稿。 | 3.4～9.5h：41 項 2～6h、C16～C18 0.5～1.5h、BB198 對照 0.2～0.5h、複驗 0.7～1.5h。 | 約 5～12h：BB 跑 41 項（2～6h）→ LAWWW 修（1.6～3.7h）→ BB 複驗。VAC-B1 這條（LAWWW 0.5h → AA 0.5～1h → LAWWW 0.5h → BB 0.3h）同時進行。VAC-GAP-ROUTES 恢復的話，AA → LAWWW → BB 要依序做，再加 6～10h。 | 排在①之後，1～2 個工作天。VAC-GAP-ROUTES 恢復的話再加 1～2 天。 | VAC-GAP-ROUTES 的恢復條件是使用者說「繼續」，或角色共創告一段落。它是補新稿、不是改既有台詞，建議用選擇題問使用者能不能和共創同時做。 |
| ③ 美國交換（D99 第三） | 場景已經整合，等使用者看：SCN-US-01／03、SCN-US-LIB、ART-US1～3、US-MS-NIGHT-1021 等 12 項。<br>系統面還沒有有效的驗收結果：BB-TEST-US-LIFE-1021 共 28 個情境（日曆、一鍵上課、快轉摘要、時差、不能約台灣朋友、回程）。n38_uslife 排過，但結果沒寫進 BB_218。場景做完不等於系統做完。<br>另外：<br>- 美國批次 22 項待 BB：AA531-US-FIX-1030、US-APT-CLOSET-1027、BUG-CAM-C208-1021、US-BLANK-1012-HINT-1027 等。<br>- 美國篇 CG 待 BB。<br>- LAWWW2 美國收尾第一、二輪（dcbd50b01、b03bedf29）待 BB。<br>- LAWWW2-REEXPORT-US-1027：71 個來源檔開發分支都有了，剩重新匯出的驗證。<br>- us_c_door 黑底（ev_sis14_day40）：LAWWW2 可以從 3D 直接拍。<br>- V4-X18：要對照大五上（calendar.js TERMS_DELAYED、src/y5s1_3d.js）核對。 | 1.5～5h：修失敗 0.9～2.8h、V4-X18 核對 0.5～1h、us_c_door 接線 0.2～0.5h。 | 1.3～7h：重新匯出驗證 1～2h、機場換匯處背光 0～1.5h、美國公寓走廊深色木板牆 0～1.5h（總表沒有這項）、拍 us_c_door 0.3～0.5h、回修 0～1.5h。 | 0～0.2h | 5.1～12.6h：US-LIFE 28 個情境 4～9h、22 項批次 0.8～3h、CG 0.3～0.6h。 | 約 7～17h：BB 跑 US-LIFE（4～9h）→ LAWWW 修（1～3h）→ BB 複驗（1～2h）。LAWWW2 的驗證同時做。 | 排在②之後，1.5～2.5 個工作天；BB 和 CC 兩條線約 1～1.5 天。三項合計（①＋②＋③）：BB 一條線 3.5～6.5 個工作天，加上 CC 約 2.5～4.5 天。 | - 12 項美國場景的 ART_APPROVED，加上 ART-VAC-AIRPORT-1021。<br>- BCG-31 送機夏天版：沒有這張圖，遊戲就不放這張 CG。<br>- us_farmers_market（目前暫借 us_chapel_steps）、us_lake_summer、us_lake_bare 三張圖。<br>- V4-X18 要用的被當延畢規則。 |
| P0 新指示 D118：讀書／考試／國考／職涯（使用者 11-02 直接交辦；和 D99 的先後要使用者確認） | 使用者 11-02 03:4x 對 BB、03:5x 對 LAWWW 直接下了 D118（f2105305b），開了三個任務，都還在第 1 步現況盤點：<br>- LAWWW：STUDY-EXAM-SYS-1102。<br>- AA：STUDY-EXAM-STORY-1102（60bff0def 新開，對應 AA_570）。<br>- BB：STUDY-EXAM-CAREER-1102（BB_222 第 0 節十六條）。<br>現況：<br>- classes3d.js 裡沒有考試的課，成績用 S.gradeOf(R.prep)，看的是讀書和出席次數。<br>- src 裡找不到「總複習」。<br>- postgrad3d.js 的六條國考、職涯路線大多沒有。<br>- 題庫 exam_bank.js 有 30 門課、483 題，要對到教材，答案要能查核。 | 10～24h：盤點 1～2h、一鍵總複習加學習進度 3～6h、成績改看答題並拿掉隱藏懲罰 1～3h、教材對到題目 1～3h、法律服務社不用刷任務 1～2h、國考六條路線加存檔旗標 3～8h。 | 0～3h（D118 寫了「必要 3D」，盤點完才知道有沒有） | 30～65h：30 門課的總複習內容 15～30h、法律正確性核對 6～12h、題目對教材 2～4h、六條結局文本 4～10h、法服改純劇情 2～5h、盤點 2～4h。 | 10～20h：基準盤點加計畫 2～4h、寫修改前會 FAIL 的探針 2～3h、修改後實測 6～13h（學習考試 9 條、法服、六條職涯路線、回歸）。 | 約 40～85h：AA 盤點（2～4h）→ AA 分批交內容（30～65h，可以用子代理分批）→ LAWWW 接最後一批和六條路線（3～8h）→ BB 修改後實測（6～13h）。LAWWW 的機制部分（總複習按鈕、成績看答題、拿掉懲罰）不用等 AA 定稿，可以先做先測。 | 機制部分 2～4 個工作天玩家就能用到。全部內容（30 門課、六條結局）要 5～10 個工作天，前提是使用者及時回答結局方向的選擇題。 | 結局方向要用選擇題問使用者（D109 的邊界）：<br>- 司法官錄取怎麼和在校成績、國考連動（使用者說過不能只看單次考試）。<br>- 落榜可以重考幾次。<br>- 有律師資格又重考司法官時，職涯怎麼走。<br>另外 D118 和 D99 三項誰先做，也要使用者確認。 |
| v1 法律系大一上 | BB 分類下已整合待測試約 181 項（LAWWW 名下 v1 有 259 項，含跨學期的）。各職位剩的：<br>- LAWWW 未結 30 項。最大的是約會 2D 系統：SYS-04 熱區與人物圖層、DATE-S6 地點台詞匯入、SYS-03 心願事件、SYS-08 學期精華日、DATE-S1。這幾項不在 D99，規格和底圖也還沒齊。<br>- LAWWW 其他：BUG-IOS-RELOAD（等 BB 量記憶體）、QA-W1-VISUAL 剩 16 項、EAT-EFFECT-1020（滷味攤菜單等 AA）、PLAN-1016-ROM（依賴 SYS-08）、PRIV-AUNT-1028 要核對、AA208-L。<br>- LAWWW2：BG-DARK-SCENES-1024 從 3D 拍 8～10 張（現在就能做）、INTERIOR-AAA-REVIEW-1028 的修正（等 BB）、CROWD-DEPTS-LOOK-1028（P3）、ART-SOY1（等決定放哪裡）、42 件回修。<br>- AA：HEROINE-LIFE-1028 重讀、USER-PLAYER-BDAY-1101、DATE-S6 要的 TASTE_WORD（src/date3d.js 第 477～479 行還是空的）。<br>- BB：181 項，加上 BB-TEST-AA355-358-1021、QA-REPRO-1020。 | 35～81h：約會 2D 系統 14.5～28.5h、修 259 項的失敗 10.4～23.3h、其他 10～29h。 | 12～48.5h：現在能做的 BG-DARK 3～6h；其餘大多等 BB、等決定，或是 P3。 | 2.6～6.7h | 8.8～31.6h | 瓶頸是 BB 依序驗 9～32h。LAWWW 最長的是約會 2D 系統：SYS-04＋DATE-S6 約 10～18h，再加 BB 直向、橫向實玩 1～2h。但這要先等 AA 已審的地點台詞白名單和底圖核准。 | BB 驗收 2～4 個工作天，BB 和 CC 一起約 1.5～2.5 天。約會 2D 系統排在 D99 和 D118 之後，再要 2～3 個工作天。 | - iPhone 實機：BUG-02、BUG-MAPBLACK、BUG-WZFLICKER、BUG-IOS-RELOAD（後三項要等發版後才能看）。<br>- BUG-DATE-0831-1018：使用者當時怎麼操作的。<br>- 芷若高解析度圍裙立繪。<br>- 約會 2D 底圖核准。<br>- PERF-CAMPUS-SHADOW-1020 的 ?perf 數字。<br>- 約 29 項場景 ART_APPROVED。 |
| v2 大一下 | BB 分類下已整合待測試約 53 項。各職位剩的：<br>- LAWWW：SYS-13 學姊研究助理 JOB_RA（遊戲裡還沒有這份打工）、EVPKG-AA227-228-KNOW 剩餘（L2 拒絕、K12 事件 ID、跨年說溜嘴、9 張場景圖、acceptsOpen）、BB152-SPORT-DATES-1031 先查和現行約會系統重疊多少（P3）。<br>- LAWWW2：ZQ-C504-LAPTOP-1101，要在公館騎樓咖啡店加座位（P3）。<br>- BB：BB-TEST-AA360-1021、BCG-46。 | 6.9～17.5h | 1.5～2.5h（P3，可以不做） | 0～1.5h。EVPKG 部分要補台詞，AA 的盤點沒列，是我依 LAWWW 寫的 needs 補上的。 | 3.1～9.4h | 約 5～14h：BB 3.1～9.4h，LAWWW 邊收報告邊修 2.9～6.5h，再複驗。 | 1～2 個工作天 | - 10 件 2D 背景和道具的 ART_APPROVED：ART-BG08、11、13～17、19、20，ART-TUTOR1。<br>- EVPKG 要的 9 張場景圖（由 BB 寫提示詞向使用者要）。 |
| v3 大二 | BB 分類下已整合待測試約 82 項，另有 R44 學姊第十二批 43 個情境一直沒有結果。各職位剩的：<br>- LAWWW：ART-CG41-45 剩下的立繪（日文班三人、邵鈞、詹靖、學姊面試服）。<br>- AA：回 AA117-CASE-NOTES-1031 的 C8「向誰」和 C5「依據」；回 XINCI-EPI-FEST-1031 的 5 題技術預設（AA-B 交接裡沒有回覆紀錄）。<br>- LAWWW2：ZQ-ARCADE-SEAT-1028 收尾，outbox 第 257 筆還寫 WIP。 | 4.3～10.6h（含照 AA 的答案改字 0～0.7h） | 0.2～2.5h | 0.5～0.9h | 3.4～11.7h | 約 5～15h，主要是 BB 依序驗；LAWWW 邊收報告邊修。 | 1～2 個工作天 | 只有場景 ART_APPROVED：ART-ROOM-MULTI-1020、ART-ROOM-LIFE-1020、ART-BG-COURT。不擋驗收。 |
| v4 大三（臺灣／日本路線；美國項目算在③） | BB 分類下已整合待測試約 76 項。剩的：<br>- V4-R-TW 要改成被取代，替代 ID 是 AA342-COVERAGE-1021。<br>- V4-R-JP 只剩 5/20 子晴發表會直播：AA 寫一兩句旁白（JP-STREAM-LINE-1101）。jp_eatery、jp_intl_office 這兩張圖已經在 78ebf6582 接上。<br>- BB-TEST-SIS-B6-1023 要重跑 9 個情境。<br>- LADDER-Y3Y4 只差 BB 驗。 | 3.5～8.5h：V4-R-JP 0.5～1.5h、修失敗 2.5～6h、結案 0.2h。 | 0～1h | 0.2～0.8h | 4.5～13.6h | 約 6～17h | 1～2 個工作天 | 沒有新的（被當延畢規則算在③） |
| v5 大四／畢業後／尾聲 | BB 分類下已整合待測試約 87 項。各職位剩的：<br>- LAWWW：BB210-Y4S2 逐項核對；AA530-PG-CONFESS-1030（畢業後「跟她們說實話」七個版本）的實作，總表 owner 寫 AA，但稿已交，剩下的是 LAWWW 子代理實作；AA267-Y5 語彤延畢那一年（等 AA 給 presence）；SYS-12 核對後結案。<br>- BB：BB-TEST-Y5-1021（AA_357 大五上）、SCN-V5-03 尾聲長桌。 | 6～13.5h（含 AA530 實作 1～1.6h） | 0～0.5h | 0.3～0.8h | 4.9～15.5h | 約 7～19h | 1～2.5 個工作天 | 被當延畢的規則（V4-X18）會影響大五上。 |
| 跨學期巡迴（戀愛線、約會地點 D01～D32、街區店家、場景座位與光照烘焙） | 已整合待測試 151 項（BB 分類）：<br>- ⑦戀愛線 25。<br>- ⑨約會地點 57。<br>- ⑪街區店家 22。<br>- ⑫場景座位與 LAWWW2 美術 41，例如 LOBBY-CEIL-1028、CAFE-WINDOW-LIVE-1030、DORM203-LM-1030。<br>- 可以直接結案的 3。<br>- 沒有學期的 3。 | 已算在 v0～v5 各學年的修失敗工時裡，不另外加。 | 已算在 v1 的 42 件回修裡，不另外加。 | 0h | 6～21h（⑫用截圖探針一次拍多處） | 6～21h（BB） | 1～2.5 個工作天，可以和各學年批次交錯排。 | 場景 ART_APPROVED（不擋驗收） |
| 下一版發布（v9.10.15 之後） | v9.10.15（main 27e6ce77e）之後有 220 個非合併 commit 都還沒上線：src 80 檔、tests 107 檔、新素材 71 檔，加上 11-02 的第五批 10 張。<br>BB 要先跑接班立即佇列：<br>- BUG-DOOR-CLASS-GO-1101 兩處（CC 已經寫好 cc_dl04b_probe 的 MODE door）。<br>- 遲到修正 444dd616e。<br>- dyn14 佇列 37 項。n45_reach 上次跑到一半，不算數。<br>- b03_probe：還沒寫出來。<br>- DL-04B。<br>- 名牌方向補拍。<br>接著看 11-02 的新背景，最後跑 RELEASE-GATE-NEXT（relsuite、save_compat、main_day12、新功能）給 GO。<br>LAWWW 要做：凍結候選版，在乾淨的 worktree 跑 TESTING.md 第五節；重跑全部 Node（上次全過是 840/840，c1b32deac）；跑 check_orphans、check_lines、題庫漏收檢查；開 PR、確認 Pages 部署；在 RELEASES.md 寫這版沒有哪些。 | 4～8h（含修 BB 回報的失敗 1～3h） | 0h | 0h | 13～26h：立即佇列 7.6～17.5h、新背景 0.5～1h、發布門檻 4.3～6.5h、發布後 deploy_check 0.3～0.5h。 | 約 15～30h：BB 立即佇列（7.6～17.5h）→ LAWWW 修失敗並凍結候選（2～4h）→ BB 發布門檻（4.3～6.5h）→ LAWWW 開 PR、確認 Pages、寫發布紀錄（1～2h）。 | 2～4 個工作天；BB 和 CC 分攤立即佇列的話約 1.5～3 天。建議這一版只要求立即佇列加①經濟系結案，不等②③全部驗完。iPhone 的三個 bug 要等這版發布後使用者才看得到。 | 不用等使用者（LAWWW 依 D85 自主決定發布）。發布後要請使用者用 iPhone 實機回報。 |
| 流程與工具（META，含角色共創） | LAWWW：<br>- 接班收尾 TAKEOVER-A-1102。LAWWW2 交接檔寫「LAWWW 未回」，要回 LAWWW2、AA、BB 並拿到 ACK；新職位 CC 目前經 BB 轉告。<br>- ROLE-CC-1102：新職位 CC 的規則和交接工具，子代理正在 worktree 裡改。<br>- incr：6f8a9786 已在 60bff0def 分類，剩 incr --advance。水位線停在 10-28 附近，這次要逐筆核約 2270 個 commit。<br>- wip.json 有 6 筆 LAWWW 的過時，要寫 closedBy。<br>- 總表約 30 項狀態過時要更正。<br>- HISTORY-AUDIT-1031：judgments_BB.jsonl 只有 74 行，待驗的有 776 項。<br>- 另有 BRANCH-AUDIT-1028、TEST-07、SYS-19、QA-LOCAL-1018（暫停）。<br>AA：<br>- DIALOGUE-DEPTH-1031 角色共創 16 位，目前 0 位定型。以安第 2 輪使用者已經答了（選 4），輪到 AA 演第 3 輪。<br>- ASK-5NAMES：企劃稿換名，決定女九、小小松要不要進換字規則。<br>- AA-BOOKKEEPING-1102。<br>LAWWW2：ART-SOP 搬檔、outbox 第 257 筆、UA-LAWWW2-1022-02 對齊。<br>BB：BACKLOG-SWEEP-BB-1021，把已 PASS、圖已到的項目列給 LAWWW 結案。 | 9～19h（原本 7～15h，加上 ROLE-CC-1102 2～4h） | 0.3～0.8h | 45.8～102.3h。角色共創 45～100h 要等使用者聊天；不算共創是 0.8～2.3h。 | 1～2h | 接班收尾和改狀態約 3～6h（LAWWW，今天做）。角色共創沒辦法估：16 位每位都要使用者說「定型了」。 | 接班收尾、通訊測試、狀態更正：今天內完成。角色共創看使用者多久聊一次；每位定型以後，AI 約 3～6h 寫規格並改全遊戲的台詞。 | - 角色共創聊天（16 位）。<br>- QA-LOCAL-1018：在使用者電腦裝測試環境。<br>- UA-BB-1102-03：Windows 電腦怎麼參與測試。Remote Control 資料夾只支援 Mac、Linux，Windows 大概只能手動實機試玩回報。 |

## 3. 各職位總時數

- **LAWWW（開發整合、發布）**：約 88～200h（不含 BB 的瀏覽器時間）。D99 三項＋下一版發布＋接班收尾約 17～38h；加上 D118 約 27～62h。範圍寬，主要是 692 項待測的失敗率是估的。
  - STUDY-EXAM-SYS-1102（D118 讀書、考試、國考、職涯）：10～24h
  - 修 692 項已整合待測試裡 BB 驗出的失敗：28～62h（估 10～15% 失敗、每項 0.4～0.6h，沒有實測失敗率）
  - 約會 2D 系統：SYS-04 6～10h、DATE-S6 4～8h、SYS-08 3～6h、SYS-03 1～3h（不在 D99，規格和底圖沒齊）
  - NEXT-RELEASE 下一版發布：4～8h（要等 BB 給 GO）
  - 接班收尾 TAKEOVER-A-1102 1～2h＋ROLE-CC-1102 2～4h＋HISTORY-AUDIT-1031 2～5h
  - BUG-IOS-RELOAD：2～4h（要先有 BB 的記憶體量測）
  - EVPKG-AA227-228-KNOW 2～4h、SYS-13 1.5～3h（v2）
  - DL-04 經濟系 17 個核心事件標 keep:'must'：1～2h（D99①）
- **LAWWW2（3D 美術、場景程式）**：約 17～70h。現在就能做、不用等任何人的約 6.5～13h。名下 146 件裡有 67 件只差使用者看畫面標 ART_APPROVED，這部分是 0h；使用者提修改時，每輪 1～3h。
  - BG-DARK-SCENES-1024：從 3D 拍 8～10 張黑底劇情缺的背景，先拍 us_c_door，3～6h（開工前先和 BB 的 BLACK-BG-AUDIT-1018 對清單，避免重做）
  - ART-DIRECTOR-LAWWW2：照經濟系路線巡場景，2～4h
  - LAWWW2-REEXPORT-US-1027：在開發分支驗證美國公寓、C 棟 208 能重新匯出，1～2h
  - INTERIOR-AAA-REVIEW-1028 的修正：1～8h（等 BB；三棟單人桌椅還是方塊，光這項 3～5h）
  - 60 件已整合待測試的回修：2～18h（等 BB）
  - CROWD-DEPTS-LOOK-1028 各系路人外觀：5～9h（P3，排在 D99 之後）
  - ART-SOY1 1～6h（等 LAWWW 決定放哪裡）、ZQ-C504-LAPTOP-1101 1.5～2.5h（P3）
  - ART-PHOTO-CMP-1021 照片到了以後 2～5h；PERF-ZONE-ENTER-1018 拿到使用者數字以後 2～6h
- **AA（劇情、台詞、法律內容）**：約 83～186h。不算角色共創是 38～86h，其中 D118 約 30～65h。名下 25 項裡 18 項已整合待測試，AA 只在 BB 驗出問題時才要動。
  - STUDY-EXAM-STORY-1102（AA_570，D118 劇情面：30 門課 483 題的總複習、白話解說、六條職涯結局、法服改純劇情）：30～65h
  - DIALOGUE-DEPTH-1031 角色共創 16 位：45～100h（每位都要使用者聊天並說「定型了」，這部分沒辦法用 AI 時數估）
  - VAC-GAP-ROUTES 日本、美國路線寒暑假空白：3.5～6.5h（暫停中，影響 D99②③）
  - HEROINE-LIFE-1028 在遊戲資料裡重讀：2～4h
  - LAWWW 在等 AA 的小題，合計 1.6～2.9h：DATE-S6 TASTE_WORD、AA117 C8 向誰、XINCI 5 題技術預設、AA267-Y5 語彤延畢那年、VAC-B1 芷若清單
  - ASK-5NAMES 企劃稿換名與收尾：0.5～1.5h
  - USER-PLAYER-BDAY-1101 0.3～0.6h、JP-STREAM-LINE-1101 0.2～0.4h（使用者都交給 AA 決定了，總表的暫停原因過時）
  - AA-BOOKKEEPING-1102：以安第 2 輪答案寫進紀錄、UA-AA-1102-02 改掛任務，0.3～0.8h
- **BB（＋新職位 CC；全部測試、向使用者要 CG 和 2D 背景）**：BB 自估瀏覽器加桌上作業 68～186h。我依實測速度（dyn14 每項約 12 分鐘）取 100～160h。CC 是第二條瀏覽器線，加上以後牆上時間約 50～100h；每條線一天 8h，約 6～12 個工作天。
  - 接班立即佇列：BUG-DOOR-CLASS-GO-1101（排第一，CC 已寫探針）、遲到修正 444dd616e、dyn14 37 項、b03_probe（還沒寫）、DL-04B、名牌補拍，7.6～17.5h
  - STUDY-EXAM-CAREER-1102（D118 驗收，BB_222）：10～20h，修改後的實測要等 LAWWW 和 AA
  - RELEASE-GATE-NEXT 發布門檻：每發布一次 4.3～6.5h
  - BB-TEST-US-LIFE-1021 美國交換系統 28 個情境：4～9h（D99③ 的系統驗收）
  - 經濟系 83 項：2.3～6.8h（大多已被 QA-PLAYTHROUGH-1018 GO 涵蓋，先桌上結案）
  - 寒暑假 41 項＋BB-TEST-VAC-C16-C18-1021：2.7～8h
  - v1～v5 共 479 項＋跨學期 151 項：31～103h（照 10-27 那次的做法，寫 judgments 給 LAWWW 整批結案）
  - BLACK-BG-AUDIT-1018：黑底實測 22 段 119 句，截圖加 10 組提示詞 2～4h；BACKLOG-SWEEP-BB-1021 總表清理 1～2h

修正：AA 的總時數不算角色共創（45～100h，要使用者聊天）和 VAC-GAP-ROUTES（暫停），約 34～80h；LAWWW2 加上自己排的 22 間室內光照（INTERIOR-AAA-REVIEW-1028 第 5 節，22～44h）約 40～115h，或照 D99「夠用的素材凍結」由 LAWWW 決定要不要做。

## 核對修正（反向核對，數字以這裡為準）

判定：需要修正後才能交給使用者。整體架構和大部分事實核對得上。我在 origin/claude/confident-ritchie-8rwh7t 1d509efeb 和 story-planning b3ca94cdd 上抽查了 28 個任務 ID 和三份交接檔，以下說法都成立：已整合待測試 776（LAWWW 692／LAWWW2 60／AA 18／BB 6）、還沒做完 195；AA299 要的 tour_bus、car_*、exam_hs_classroom、daan_park 檔案都在，也接上了；QA-PLAYTHROUGH-1018 在 BB_218 第 6508 行判 GO；DIALOGUE-DEPTH-1031 的 xai owner 寫成 BB；CAM-BELL-1031 和 GYM-B1-PLATES-1101 已實作待整合；V4-R-TW 是傘狀任務；dyn14 還剩 37 項；watermarks 停在 10-28；src 裡沒有「總複習」。要改的有三個大問題：(1) BB 總時數上限 160h 低於它自己的實測速度推出來的量（實測單位是情境，不是總表項目），應該改成約 100～230h、2～4 週；(2) 下一版發布漏了經濟系四種玩法的門檻，11-01 的 GO 是舊基準，之後主流程的檔案都改了，也沒有留 rc2 的時間；(3) LAWWW2 漏了自己排定的 22 間室內光照。另外有五個中等問題：3D 地點的背景一邊算給 LAWWW2、一邊列給使用者，ntu_gate 被錯當成等使用者；「瓶頸在 BB」忽略了 AA 才是 D118 和全部做完的最長路徑；AA 總時數混進了等使用者的共創時間；寒暑假、美國的修失敗工時重複算；iPhone 的 MAPBLACK、WZFLICKER 修正其實已經在線上。修完這些，再補上 missing_items，這份預估就可以用。

- 【高】BB 總時數的上限和它自己引用的實測速度對不上，換算單位也錯了。dyn14 的 261 是佇列裡的情境指令，不是總表項目（docs/story_planning/test_tools/dyn14_queue_1101.done.txt 共 261 行，像 fps12、aunt6，從 10-30 02:2x 跑到 11-01 08:5x，約 54h，每個情境約 12.5 分鐘）。照這個速度，776 項每項跑一個情境就要約 160h。還有幾塊不在這 776 項裡：D118 驗收 10～20h；兩到三週內至少要發兩次版，每次發布門檻 4.3～6.5h；寫提示詞、截圖、向使用者要圖 4.6～9.9h；BB 名下還沒開始的測試集，包括 BB-TEST-US-LIFE-1021 28 個情境、R44 43 個、R43 21 個、BB-TEST-SIS-B6-1023 9 個、Y5、AA355～358、AA360、VAC-C16～C18。這些合起來約 190～230h，所以上限 160h 太低。下限 100h 要靠 538 項「可以用流程涵蓋」的項目整批結案才成立，原文沒寫這個前提。另外 per_role 寫的牆上時間「50～100h」也不是 100～160h 除以兩條線（應該是 50～80h）。　→ **改**：BB 總時數改成約 100h（前提是 538 項用流程整批結案）到 230h（每項各跑一次再加上面的另外幾塊）。BB 加 CC 的牆上時間改成約 60～120h，等於 7～15 個工作天；乘上過去的斷層 1.2～1.5 倍，大約 2～4 週。headline 和 overall 一起改。實測單位寫成「每個情境約 12.5 分鐘（含探針出錯重跑）」，不要寫成每個總表項目。
- 【高】下一版發布漏了使用者定的經濟系發布門檻。QA-PLAYTHROUGH-1018 的標題就是「發布前照真實玩家玩法從頭玩經濟系路線到法律系開學（四種）……任何一種卡住就不發」。11-01 的 GO 是對基準 39f68236c 判的，但 main 之後開發分支改了經濟系主流程：classes3d.js +111 行、data/events.js +229 行、story3d.js +153 行、home3d.js +43 行，還有一鍵上課的 444dd616e、9aa82ecda 和 DL-04 的捷運出遊 R1。所以 GO 不能沿用到新的候選版。BB-B 自己估這一輪要 4～6h。另外發布歷史顯示 10-18～11-01 共發了 15 版，其中 v9.10.5、v9.10.11、v9.10.13 用了 rc2，v9.10.12 用了 rc3b，大約四分之一要多一輪候選版，但預估沒有留這段時間。　→ **改**：發布那一段的 BB 時數加 4～6h（新候選版重跑經濟系四種玩法），關鍵路徑從 15～30h 改成約 19～36h，另外註明約 25～30% 的機率要多一輪 rc2（再加 4～8h）。① 的「剩下的」不要寫成直接沿用 GO，改成「新候選版要重跑四種」。
- 【高】LAWWW2 自己排的下一件工作沒算進去。LAWWW2 交接檔（claude/second-ai-env-art 3112819f4，11-02 03:50）寫明下一件是 INTERIOR-AAA-REVIEW-1028 第 5 節「全部室內光照」，列了 22 間還沒烘焙光照的室內：library_carrels、library_stacks、library_media、library_b1、linze_3f／4f／5f／office、wancai_sema／semb、boya_203、gongtong_3f、dorm_interior／205／laundry、l118 三間、wz 兩間、jp_room、us_market、us_lawlib_2f。先出盤點報告、和 LAWWW 對過順序就開工。這是使用者 X125 直接要求的工作。synthesis 只寫了「INTERIOR-AAA 修正 1～8h（等 BB）」，所以「現在就能做 6.5～13h」和 LAWWW2 總計 17～70h 都偏低。　→ **改**：照「一間室內改一輪 1～2h」估，22 間約 22～44h；再加 BB 看畫面約 4～7h、LAWWW 每批整合 0.3h。LAWWW2 總時數改成約 40～115h。或者把它寫成 LAWWW 要做的決定：D99 說夠用的素材凍結，X125 是使用者要求，兩個版本都列出時數。
- 【中】有 3D 場景的地點，它們的 2D 背景在預估裡被算了兩次，說法也互相矛盾。BG-DARK-SCENES-1024（11-02 LAWWW-B）寫 X93 那批可以由 LAWWW2 直接從 3D 拍；USER_WANTS X93（10-27 重查）寫 gym_court、wancai_lobby、ntu_gate 交給 LAWWW2 拍；SIDEQ-AA397-1023 寫 ntu_library_rain 是 3D 總圖門口加雨。synthesis 一邊把 BG-DARK 的 8～10 張算進 LAWWW2 的 3～6h，一邊又把同一批（新體育館球場和門口、Café 門口夜景、法律系館B大廳、law_courtyard、boya_201、linze_201 晚上、ntu_library_rain）列成要使用者生的圖。① 也把 ntu_gate 寫成等使用者，說它擋住 n255 黑底。實際上 assets/bg 裡 ntu_gate、gym_court、wancai_lobby 都還沒有，但這些地方遊戲裡都有 3D 可以拍。　→ **改**：選定一種做法，建議 LAWWW2 從 3D 拍，每張 0.3～0.5h。ntu_gate 從 ① 的 blocked_by_user 移出，改成：LAWWW2 拍 0.3～0.5h、LAWWW 接 camp_y1.js 兩處 bg:'dark' 0.2h、BB 看畫面。waiting_on_user 刪掉這幾張，使用者只留 3D 拍不出來的那些。
- 【中】「瓶頸在 BB」只對 D99 成立。D118 的關鍵路徑 40～85h 幾乎都在 AA：先盤點，再寫 30～65h 的內容。AA 不算角色共創也要 38～86h，約 5～11 個工作天，和 BB 加 CC 的 7～15 天相當；再加上要等使用者聊天的共創 45～100h，AA 才是全部做完的最長路徑。而且 AA 同一時間只能做一件事：共創要使用者在線，D118 要寫稿，兩件會搶時間，預估沒有排這個衝突。還有一點：BB_00 寫 BB 03:4x 起的主任務是 D118（BB_222），立即佇列交給 CC；synthesis 卻排成 BB 和 CC 第一天都去跑立即佇列。　→ **改**：overall 改寫成：D99 的瓶頸是 BB／CC；D118 和全部做完的瓶頸是 AA。寫明 AA 的 D118 是不是用子代理分批做。共創和 D118 誰先做，照 D117 用可以點選的選擇題問使用者。第 1 天的排法改成 BB 做 D118 修改前盤點、CC 跑立即佇列。
- 【中】AA 的總時數把等使用者的東西算成了 AI 小時。83～186h 裡包含角色共創 45～100h（每位都要使用者聊天並說「定型了」），也包含 VAC-GAP-ROUTES 3.5～6.5h（暫停中，恢復條件是使用者說繼續或共創告一段落）。這違反了「等使用者的不能估 AI 時數」的原則。　→ **改**：AA 的總時數改成兩項都不算，約 34～80h。共創和 VAC-GAP-ROUTES 移到 waiting_on_user，各自附上恢復以後要多少 AI 時數（共創每位定型以後 3～6h；VAC-GAP-ROUTES 3.5～6.5h）。
- 【中】LAWWW 修失敗的工時重複算了，美國交換的學期也標錯了。② 的 41 項、③ 的 22 項各自另算了 LAWWW 修失敗（1.6～3.7h、0.9～2.8h），但這些項目已經在 LAWWW 各學期的計數裡。例如 VAC-GAP-1031、AA532-VAC-FIX-1030、AA533-VAC-FIX-1030、X58-REST-1027 都是 LAWWW Y1S1，算在 v1 的 259 項裡；US-LIFE-AA340-1020 是 Y4S1，算在 v5 的 91 項裡。v4 有扣掉美國項目，v5 沒扣。另外美國交換那一學期是大四上（BB-TEST-US-LIFE-1021：2028-08-02 出發、12-23 回台，first.term＝Y4S1），v4 標題寫「美國項目算在③」會讓人以為美國在大三。　→ **改**：改用 BB 的分區重算 LAWWW 修失敗：經濟系 83、寒暑假 41、美國 22、v1 181、v2 53、v3 82、v4 76、v5 87、跨學期 151，加總剛好 776。這樣 LAWWW 總時數大約少 2.5～6.5h。v5 標題註明大四上的美國項目算在③。
- 【中】②③ 寫得好像完全沒有驗收過，其實已經有一部分。BB_218 第 6508 行起的 QA-PLAYTHROUGH-1018 GO 寫明：law_break、vac_hometown、exch_min、us_exchange 都用探針複本照新行為重驗，遊戲 PASS（基準 39f68236c）。synthesis ③ 寫「系統面還沒有有效的驗收結果」不精確。　→ **改**：③ 改寫成：出發、抵達、回台的主流程已經有流程測試 PASS；US-LIFE 的 28 個情境（日曆、一鍵上課、快轉摘要、時差、不能約台灣朋友）還沒有結果。② 也一樣，寫明寒暑假主流程已經 PASS。兩者都要對新的開發分支頭重跑，理由同上一條發布門檻。
- 【中】iPhone 的三個 bug 不是都要等下一版。BUG-MAPBLACK 的修正 59facb8b、BUG-WZFLICKER 的 0f430885d（WZFLICKER-2，接重建的街景 GLB）都已經是 origin/main 的祖先，也就是 v9.10.15 線上版已經有。使用者現在就能用線上版實測。　→ **改**：waiting_on_user 和 overall 改成：MAPBLACK、WZFLICKER 現在就能用線上版測，等使用者；只有 BUG-IOS-RELOAD 要看下一版有沒有新的改動。BUG-02 照使用者 11-01 的選擇，維持暫停。
- 【中】總表有幾項未結任務，在所有階段和職位裡都沒出現。SYS-05（Y0S1、prereq:true，經濟系那一年就會用到）在 v0 完全沒提。TEST-04 是 LAWWW 名下的瀏覽器驗證，照 D100 應該轉給 BB，而且 run4～run8 的結果從來沒有寫回。BB-QUEUE-1027（P1）裡的 R43 畢業以後 21 個情境，懷疑有 BUG-PG-MOON-STOP，也沒算。ART-POLISH（LAWWW2 P1 進行中）沒有估時數，也沒說要不要併進 INTERIOR-AAA。　→ **改**：SYS-05 放進 ①（剩 AA342-COVERAGE-1021 的海報字，0.5～1h；不然就照稽核結果結案）。TEST-04 轉 BB，或標成被 BB 的後續驗收取代。R43 21 個情境約 4～5h，算進 v5 的 BB 時數。ART-POLISH 結案或併進 INTERIOR-AAA。其他小項列在 missing_items。
- 【低】有幾個「等使用者」或「可以結案」已經過時，或證據不夠。nccu_dorm 白天版已經有了：assets/bg/nccu_dorm_day.webp，006d729b7（10-17），outings3d.js 已註冊。us_club_lawn.webp 也已經有了。BG-CRAM-1018 被寫成可以結案，但 cram_class.webp 是 10-17 的 b6f471f7a，早於使用者 10-18 要的「大家隔一個位置坐、抽屜都是書」新圖；X37 只寫「cram_class 背景照舊」，任務本身的 resumeWhen 還寫等新圖。　→ **改**：waiting_on_user 刪掉 nccu_dorm 白天版。BG-CRAM-1018 二選一：照 X37 寫 cancelReason（使用者同意沿用舊圖）再結案，或者留在等使用者的清單裡。不能當成「圖已經到了」直接結案。
- 【低】判斷「BB 結果沒有回寫總表」用的檔案不對。judgments_BB.jsonl 在 docs/handoff/history_audit/，是 HISTORY-AUDIT-1031（歷史待辦複核）用的，74 行，不是 776 項待測的結果檔。BB 的實測結果寫在 BB_218（6850 行）。真正卡住的是：要把 BB_218 的結果對到總表任務、再改狀態，這一步沒人做。　→ **改**：整批結案的做法要寫清楚：BB 每批交一份照任務 ID 排的 PASS／FAIL 清單，引用 BB_218 的行號；LAWWW 照清單一次改 tasks.json。另外估這件事本身的時間：LAWWW 每 100 項約 0.5～1h。
- 【低】幾個數字和說法要更正。v9.10.15 之後的非合併 commit 現在是 228 個，不是 220。AA 名下現在 26 項，因為 STUDY-EXAM-STORY-1102 新開，進行中變 3 項；LAWWW 進行中是 23 項。LAWWW2 各階段加起來上限是 73.8h，不是 70h，D118 的 0～3h 沒算進總數。incr 寫「這次要逐筆核約 2270 個 commit」，但盤點又寫目前異常只剩 1 筆、已經分類完成，兩者矛盾；--advance 以前其實要核的是 watermarks.json 四個職位記的 30 個未結項目（LAWWW 9、LAWWW2 6、AA 8、BB 7）。　→ **改**：照現在的分支頭重寫這些數字。META 那一段改成：incr 已經分類完，--advance 前先核 30 個 open 項目在總表、交付或 WIP 都找得到，約 0.5～1h。
- 【低】USER_WANTS 有幾列和這次的盤點有關，但沒有提到。J11（畢業後職涯，暫停，恢復條件是「使用者提起」）：使用者 11-02 下 D118 就等於提起了，應該恢復並併進 STUDY-EXAM-*。A17（學生活動中心，USER_WANTS 寫「問使用者還要不要」，看板沒有任務）。AA 交接的【表外】X150 狀態字：AA 請 LAWWW 在「進行中」和「共創中」二選一，還沒回。　→ **改**：J11 改成恢復，併進 STUDY-EXAM-SYS-1102／STUDY-EXAM-STORY-1102。A17 加進給使用者的選擇題批次。X150 放進 LAWWW 的接班收尾（約 0.1h）。

漏掉的項目：
- SYS-05（LAWWW，待開工，Y0S1，prereq:true）：每年重複的活動的年級版本，經濟系那一年就會用到；v0 階段沒有列
- TEST-04（LAWWW，P1，進行中）：10-16 新功能瀏覽器驗證，run4～run8 結果從沒寫回；照 D100 應該轉給 BB
- BACKLOG-SWEEP-1021（LAWWW，P0，進行中）、BACKLOG-START-1031（LAWWW，P1，進行中）：統籌型任務，沒寫是要結案還是併進 HISTORY-AUDIT-1031
- BB-QUEUE-1027（BB，P1，待開工）：清單在 docs/handoff/BB_TEST_QUEUE_1027.md，裡面 R43 畢業以後 21 個情境（懷疑有 BUG-PG-MOON-STOP）沒算
- INTERIOR-AAA-REVIEW-1028 第 5 節：22 間室內光照烘焙，是 LAWWW2 交接寫明的下一件，約 22～44h
- ART-POLISH（LAWWW2，P1，進行中）：沒有時數、也沒寫結案或合併的建議
- ART-JIAHAO-JOY、ART-PLAYER-SEASON-OUTFIT-1024（LAWWW2，暫停，Y0S1）：沒列進「D99 人物凍結要不要解除」那一題
- SCN-US-CH（BB，等待）：學姊羽絨外套、何俊朗立繪，是③美國交換要的有人物圖，③的 blocked_by_user 沒列
- ART-BG-AA185（BB，待開工）：LAWWW2 分支上已有 video_far_us／jp、old_school_playground，現在沒有劇情用到，要結案或保留
- ANIM-BENCH-SIT、NDL-AUNT-VIS-1030、BUG-SIS-LIB-LOAD-1022（LAWWW，P3）：沒列，連「延後」也沒寫
- TEST-05（owner USER，暫停）：iPhone 實機總項
- 新候選版要重跑經濟系四種玩法（QA-PLAYTHROUGH-1018 是每次發布前的門檻）：約 4～6h
- 發布時多一輪 rc2 的備用時間：過去 15 版裡約 4 版用了 rc2 或 rc3b
- USER_WANTS J11（畢業後職涯暫停）：D118 等於使用者提起了，應該恢復
- USER_WANTS A17（學生活動中心，問使用者還要不要）
- AA 交接【表外】X150 狀態字：進行中或共創中，等 LAWWW 二選一
- 把 BB_218 的結果對到總表任務 ID 的對照工作本身的時數（LAWWW）

## 等使用者的（不能用 AI 時數估）

- 場景、建築美術的 ART_APPROVED（只有使用者能標）：LAWWW2 67 件、LAWWW 9 件（ART-01、ART-07、ART-08、DONE-B15、ART-SCOOTER2、ART-BIKES2-INT、ART-GG-SIGNS-2、BG-ECON-B1-1018 等），加上 BB 那邊的約會底圖 33 張等。全部清單在 docs/handoff/USER_ART_REVIEW_1027.md；提修改的話，每輪 LAWWW2 約 1～3h
- 要使用者生的圖：
- 臺大校門口 ntu_gate（經濟系 n255 黑底）。
- 經濟系中秋烤肉 CG（CG-ECON-BBQ-1018）。
- 芷若高解析度圍裙立繪（ART-ZR-CAFE-PORTRAIT-1022）。
- 附 3D 截圖的一批約 10 張：新體育館球場（4 個事件 34 句黑底）、兩點半 Café 門口夜景（21 句）、法律系館B大廳、新體育館門口、law_courtyard、boya_201、linze_201 晚上、putong_empty。us_c_door 可以改由 LAWWW2 從 3D 拍。
- 純文字場景缺 6 張：us_farmers_market、us_lake_summer、us_lake_bare、gongguan_market、gongguan_cobbler、court_criminal。
- ntu_library_rain、nccu_dorm 白天版。
- 第五批 10 張已經全部收到並接進遊戲，不用再生
- 有人物的那一輪圖，要使用者同意才開：Kevin 立繪、ART-16 七組立繪、BCG-31 送機夏天版（沒圖就不放這張 CG）、CG-10b、芯慈 CG、其他角色表情（BB_219）
- iPhone 實機：BUG-02（使用者 11-01 選先不要）、BUG-MAPBLACK、BUG-WZFLICKER、BUG-IOS-RELOAD。後三項要等下一版發布後才能看
- 在自己的電腦和手機開 ?perf 走幾個地方，回報數字：PERF-ZONE-ENTER-1018、PERF-CAMPUS-SHADOW-1020
- 共同教學館、女舍的參考照片（ART-PHOTO-CMP-1021）
- 要使用者決定的事（建議用選擇題問）：
- D118 和 D99 三項誰先做。
- D118 結局方向：司法官錄取和在校成績、國考怎麼連動，可以重考幾次，有律師資格再考司法官時怎麼走。
- 被當延畢的規則（V4-X18）。
- VAC-GAP-ROUTES 能不能和角色共創同時做。
- D99 人物凍結要不要解除：CHAR-TEMPLATE、明軒 ART-13、FIT-3D-BODY 第二階段、ART-PS-SKIRT-HAND。
- 電話場景要不要底圖；8 張中深色木地板的 2D 要不要重生（D112）
- BUG-DATE-0831-1018：使用者當時 8/31 到 9/1 早上是怎麼操作的
- DIALOGUE-DEPTH-1031 角色共創：16 位都要使用者一輪一輪聊，並說「定型了」。目前 0 位定型；以安第 3 輪輪到 AA
- 測試環境：QA-LOCAL-1018（在使用者電腦裝本機測試）、UA-BB-1102-03（Windows 電腦怎麼參與測試）

## 接班遺留

- 通訊測試：LAWWW2（帳號 A）03:4x 傳給 LAWWW、AA、BB 都已 DELIVERED；BB 03:39 回了 ACK，AA 已經互測。LAWWW 還沒回 LAWWW2，要回並拿到 ACK。新職位 CC（ROLE-CC-1102，使用者 03:5x 對 BB 交代）目前經 BB 轉告，CC 的工具和規則做好以前沒有直接通道。依 D75，不傳訊息給帳號 B 的休班工作階段
- incr：LAWWW2 的接班 commit 6f8a9786 已在 60bff0def 分類成 handoff_record，剩 incr --advance all＋commit＋push＋核對遠端 SHA。水位線還停在 10-28 附近，這次要逐筆核約 2270 個 commit
- 總表約 30 項狀態過時，要 LAWWW 更正：
- LAWWW 名下：ENC-B3-1017、Y1-WINTER-AA204、AA299-IMAGES-1018 改已整合待測試（AA299 要的 tour_bus、car_*、exam_hs_classroom、daan_park 和第五批 10 張都有檔案了）；EAT-MATTER-1023、ART-18 結案；V4-R-TW 改被取代（替代 ID AA342-COVERAGE-1021）；PLAN-1016-ROM 改進行中。
- LAWWW2 名下：CAM-BELL-1031（總表寫已實作待整合）、GYM-B1-PLATES-1101 已進開發分支 8628c7e14，改已整合待測試；ART-02、SCN-US-02、ART-WZ6、ART-WZ7、ART-US-SEASON、ART-GYM2-INT、WZ-SHOP-AA364-ART 的暫停原因過時；ART-13 改暫停。
- AA 名下：ASK-5NAMES、USER-PLAYER-BDAY-1101 的 pausedReason 過時；AA530-PG-CONFESS-1030 剩下的是 LAWWW 的工作；DIALOGUE-DEPTH-1031 的 xai 寫成 BB。
- BB 名下：QA-PLAYTHROUGH-1018（11-01 GO）、RELEASE-9106-TEST（10-23 GO）、BG-ZQ-STUDIO-1101、BG-LANTERN-1024、BG-CRAM-1018、BG-MISSING-1021、SCN-US-2D、SCN-JP-2D 可以結案
- wip.json 有 6 筆 LAWWW 的 WIP 已經過時（WIP-DORM-ROOM4-0829、WIP-AB65-3-Y1S2-L、WIP-V0-REWRITE-L、WIP-LAWWW-RC4-1021、WIP-LAWWW-L118R2-1027、WIP-LAWWW-AOPEN-R2-1027），要寫 closedBy
- BB-B 留下沒跑的：
- BUG-DOOR-CLASS-GO-1101（9aa82ecda，交班時要求排第一）。
- 遲到修正 444dd616e。
- dyn14 佇列 37 項；n45_reach 跑到一半，不算數。
- b03_probe：子代理交班時被停掉，檔案沒寫出來。
- BB-TEST-US-LIFE-1021 的結果沒寫進 BB_218。
- R44 學姊第十二批 43 個情境、學姊第六批重跑 b6r／b6er，都一直沒有結果。
- BB-TEST-AA355-358-1021、AA360、VAC-C16-C18、Y5 都還沒開始
- BB 跑完的結果沒有回寫總表，這是最大的效率問題：judgments_BB.jsonl 只有 74 行，待驗有 776 項。10-20～11-01 舊的待測項目，每個工作日實際結案只有約 4.4 項。要照 10-27 的做法（BB-C 盤點、一天結 151 項），由 BB 寫 judgments、LAWWW 整批改狀態
- 帳號 B 的 scratchpad 沒有遠端備份：BB-B 的截圖和 log（bbtest、dyn14、n40～n45）、AA-B 的 vsw_Y1S1／Y1S2／JP／US.json、LAWWW2-B 的截圖 PNG 和烘焙中間檔。已經判定的結果在 BB_218、judgments_BB.jsonl；vsw 可以用 docs/story_planning/tools_aa/vsweep_routes.js 重跑
- 整套 Node 最後一次全過是 840/840（c1b32deac）。之後第四、五批背景只跑了相關的幾支，發布前要在乾淨 worktree 重跑全部
- AA 的記帳：
- 以安第 2 輪答案（選 4「舍監大概會說男生頭髮短。」）只記在 user_asks_LAWWW，還沒寫進 AA_以安共創紀錄.md 和 user_asks_AA。
- UA-AA-1102-02 掛在已驗收的 HANDOFF-ABC，狀態卻寫進行中，asks 檢查會報異常。
- 9 個舊任務 ID 在總表找不到（AA397-SIDEQUEST-1023、ROM-GATE-1017 等）
- LAWWW2 的記帳：
- outbox 第 257 筆 ZQ-ARCADE 還寫 WIP／未派。
- UA-LAWWW2-1022-02（沛珊「臉啊頭髮啊 醜死了」）還是進行中，總表 ART-ZR-PS-3D-1022 已經驗收，兩邊不一致。
- 總表沒有的兩項：美國公寓門外走廊的深色木板牆；cafe_vc_wz_metal 金屬圓盤裡外相反。
- outbox 有 5 筆 task 不在總表
- 數字更正：黑底實測是 22 段 119 句（BB 04:01Z 用開發分支頭重跑），不是 LAWWW 盤點寫的 25 段 130 句；scene_bg_keys 另有 5 個執行時才登記的 PENDING 鍵
- D118 三個任務剛開（STUDY-EXAM-SYS-1102、STUDY-EXAM-STORY-1102、STUDY-EXAM-CAREER-1102），都還在現況盤點；AA_570 的盤點 workflow 正在跑

## 前提

- 資料基準是 origin/claude/confident-ritchie-8rwh7t 1d509efeb（11-02 04:01 UTC）的 tasks.json：共 1397 項。已整合待測試 776 項（LAWWW 692、LAWWW2 60、AA 18、BB 6）；還沒做完 195 項（等待 106、進行中 42、待開工 36、暫停 9、已實作待整合 2）
- 每個 AI 值班時每天約 8 個有效小時，各職位同時工作。BB 和 CC 算兩條瀏覽器線：CC 是使用者 11-02 03:5x 新增的職位，ROLE-CC-1102 的工具還在做。SwiftShader 一次只能跑一支
- 同一件任務只算一件：LAWWW 整合加 BB 驗收是兩種工時。AA530 的實作算在 LAWWW；v4 的美國項目算在③，不重複算進 v4；跨學期 151 項的 LAWWW、LAWWW2 回修已經含在各學年
- LAWWW 修失敗的工時用 692 項×10～15% 失敗×每項 0.4～0.6h 推估，沒有實測失敗率
- BB 自估每項 2～8 分鐘，依 dyn14 前 261 項推算。實測 261 項約 54 小時值班時間，每項約 12 分鐘，換算 776 項約 155h，所以我把 BB 整體取在 100～160h，偏 BB 自估的高半段
- 下面的日數成立有一個前提：BB 每批寫 judgments，LAWWW 照 10-27 的做法整批結案。照過去總表的結案速度（舊項目每個工作日約 4.4 項），776 項要 55～190 個工作天
- 新增任務照 D99「不新增不必要待辦」控制。過去每個工作日新增約 50 項，每結 1 項會冒出 1.5～3 項，未結從 764 增加到 966。如果照舊，日數不會收斂
- 日曆時間另外乘 1.2～1.5：過去 13 天只有約 11 個工作日，還有兩次 35～45 小時的斷層，原因是沒交班就換帳號
- 等使用者的部分（生圖、ART_APPROVED、iPhone 實機、選擇題、角色共創聊天）不算 AI 小時，只列出需要什麼
- D118 放在 D99 三項之後只是暫定排序。這是使用者自己交辦的，不受「不插隊」限制，誰先做要問使用者

## 實測速度（10-20～11-01）

統計範圍：2026-10-20～11-01，以 UTC 切日；每天取當天最後一個改到 tasks.json 的 commit，和前一天的狀態比對。基準是 10-19 02:11 的 d4845e6da：839 項，未結 764 項，其中等 BB 測的「已整合待測試」351 項。
共 13 天，11 天有 commit；10-26、10-29 整天 0 個 commit。有 commit 的小時合計 177 個，平均每個工作日約 16 小時。

【新增】553 項，每個工作日約 50.3 項，每個有 commit 的小時約 3.1 項。
- 依負責人：LAWWW 379、LAWWW2 109、AA 42、BB 23。
- 到 11-01 這 553 項的狀態：已整合待測試 283、已驗收 196，還沒做完 64。

【整合】轉進「已整合待測試」共 701 次，每個工作日約 63.7。
- 扣掉 10-21 的 BACKLOG-SWEEP-1021：c251ce57c 改 130 項、14da43204 改 44 項，合計 174 項。這兩筆是稽核後發現程式早就有了，改狀態而已，不是當天的產出。
- 扣掉以後是 527 次，每個工作日約 47.9，每小時約 3.0。
- 其中 292 項是當天開、當天就整合（LAWWW 每批子代理工作開一個任務）。
- 實際從舊待辦推進到已整合的，每個工作日約 21 項。

【驗收】轉進「已驗收」共 304 次，每個工作日約 27.6。
- 扣掉 10-27 的 ade027865 共 151 項：BB-C 盤點 885 項（BB_INTEGRATED_TRIAGE_1027），一次結案，附 BB_218 行號，是補記之前的測試。
- 扣掉以後是 153 次，每個工作日約 13.9，每小時約 0.86。
- 這 153 次裡有 105 項是當天開、當天結（同日修好的 bug、發布紀錄、接班紀錄）。舊的待測項目實際驗掉的只有約 48 項，每個工作日約 4.4 項。
- 注意：「已驗收」不一定是 BB 在瀏覽器測過。整個期間驗收項目的負責人：LAWWW 219、LAWWW2 42、AA 35、BB 8。很多是文件、工具、發布類任務，由 LAWWW 自己結案。

【取消】47 項，其中 11 項是 10-27 盤點時一起處理的。

【新增 ÷ 結案（驗收＋取消）】
- 含大批盤點：553 ÷ 351 ≈ 1.58。
- 不含大批盤點：553 ÷ 189 ≈ 2.9。
- 未結從 764 增加到 966，多 202 項（+26%），每個工作日約多 18 項。待辦總量在增加，沒有在減少。

【兩段分開看】
- 還沒實作的待辦（待開工、進行中、等待、暫停、已實作待整合）從 413 降到 190。其中 174 項是 10-21 改狀態掉下來的；不算那一次，大約是 413 → 364，小幅下降。LAWWW 的實作速度大致跟得上新增。
- 等 BB 測的「已整合待測試」從 351 增加到 776，多了一倍以上。瓶頸在 BB 測試。
- 依階段：v1 311、v3 106、v0 101、v5 96、v4 85、v2 73、META 4。
- 照逐項的速度（每個工作日 4～14 項），776 項要 55～190 個工作日。只有像 10-27 那樣整批盤點（約一天結 104 項，附測試紀錄），或併進發布前測試一起驗，才有可能清得掉。

【依值班班次】
- C1（10-20 13:00～10-21 15:00）：新增 119，進到已整合以上 308（含 174 項改狀態），驗收 12。
- A1（10-21 15:00～10-22 15:20，有 commit 的小時 25 個）：新增 119，整合 147，驗收 47；約每小時新增 4.8、整合 5.9。
- B1（10-23 06:40～10-25 20:00，57 小時）：新增 115，整合 177，驗收 41；約每小時新增 2.0、整合 3.1。
- C2（10-27 16:45～10-28 16:00）：新增 101，整合 91，驗收 166（含 151 項大批盤點）。
- B2（10-30 02:00～11-01 09:20，53 小時）：新增 98，整合 103，驗收 38；約每小時新增 1.8、整合 1.9。
- B3（11-01 21:15～11-02 03:20）：新增 1，整合 7，驗收 0。
- 每小時的整合量從 A1 的約 5.9 降到 B2 的約 1.9。後期多是逐句修正、圖片接線這類細碎工作。

【給預估的建議】
- 整合可以抓每個工作日 20～50 項（每小時約 2～3 項）。
- 舊項目的 BB 驗收要抓每個工作日 5～15 項，除非安排整批盤點。
- 每個工作日要預留約 50 項新增；也就是說，每做完一項，大約會再冒出 1.5～3 項。

【沒人值班的空檔】用 commit 時間判斷，空檔 6 小時以上的：
- 範圍開始前：10-19 02:11 → 10-20 13:04，約 35 小時。LAWWW-C 在 10-19 交班又回來以後就沒有 commit。
- 10-20 21:01 → 10-21 07:09，約 10 小時。
- 10-22 15:12 → 10-23 06:47，約 15.6 小時。帳號 A 在 719cca3bc 交班，帳號 B 在 c7eb7e073 接班。
- 10-23 21:00 → 10-24 03:23，約 6.4 小時。
- **10-25 19:39 → 10-27 16:51，約 45 小時。** 帳號 B 沒有交班；帳號 C 在 446b36c55 用 --user-ok 接班。
- **10-28 15:31 → 10-30 02:08，約 34.6 小時。** 帳號 C 沒有交班；帳號 B 在 b6c3b471e 接班。
- 11-01 09:12 → 21:20，約 12 小時。帳號 B 交班（7857397d3），之後以剩 5% 額度回來兩小段，11-02 03:09 交班（02898d56c），帳號 A 03:39 接班（0b17540f2）。
- 10-26、10-29 所有遠端分支都是 0 個 commit，不只開發分支。四個職位都停，不是只有 LAWWW 沒在。
- 10-20、10-27 只做半天，有 commit 的小時各 9、8 個。
- 13 天裡約有 4 天完全沒進度，大多是帳號額度用完、沒交班就換帳號。預估時要把這種空檔算進日曆時間：過去平均每 13 天只有約 11 個工作日，而且常有 1～2 天的斷層。

【計算方式與限制】
- 切日用 UTC。用台北時間切，總數相同，但每天的分配會變（例如台北的 10-22 新增 117 項）。結果在 /tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad/wf_estimate/tpe.json。
- commits_dev 是 origin/claude/confident-ritchie-8rwh7t 上依 commit 時間落在當天的全部 commit，包含合併進來的 AA、BB、LAWWW2 分支，所以算的是四個職位一起的產出。含 merge commit；不含 merge 的數字在 utc.json 的 commits_nomerge。
- 只比對每天最後的狀態，同一天開了又取消的看不到。
- 整合、驗收的次數是「從其他狀態轉進來」，包含當天新開、新開時就是那個狀態的項目（utc.json 的 verified_newly_created、integrated_newly_created）。
- 期間沒有任務從總表消失（gone＝0）。總數對得起來：839＋553＝1392；已驗收 52＋304＝356；取消 23＋47＝70。
- 10-21 的 238 項「從舊狀態轉成已整合」裡，有 174 項是 BACKLOG-SWEEP 改狀態。
- 10-27 的 162 項驗收裡，有 151 項是 BB-C 的盤點結案。
- 兩者都是一次性補記，計算平均時要扣掉，否則整合會高估約 25%、驗收高估約一倍。

【11-01 結束時沒實作完的 190 項】
- 依負責人：LAWWW2 86、LAWWW 58、BB 38、AA 7、USER 1。
- 依狀態：等待其他AI／素材 106、進行中 37、待開工 36、暫停 9、已實作待整合 2。
- 一半以上卡在「等待」，很可能是等使用者的圖或決定。這部分沒辦法用 AI 工時估。

【檔案】都在 /tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad/wf_estimate/
- 每日統計腳本 throughput.py：參數 +0000 或 +0800。
- 找大批改狀態的 commit：percommit.py。
- 值班班次與有 commit 的小時數：segments.py。
- 結果：utc.json、tpe.json。

## 4. 每個任務

### LAWWW

LAWWW（帳號 A）從 LAWWW-B 接下來的工作（以 origin/claude/confident-ritchie-8rwh7t 40de68ef2 的 tasks.json 為準）：

**數量**
- 未結任務 60 項：待開工 18、進行中 21、等待其他AI／素材 17、暫停 4。其中 1 項是新任務 STUDY-EXAM-SYS-1102，是新 LAWWW 在 03:43 登記的。
- 已整合待測試 692 項：v0 88、v1 259、v2 72、v3 99、v4 79、v5 91、META 4。
- v9.10.15（main 27e6ce77e）之後還沒發布的有 220 個非合併 commit：src 80 檔、tests 107 檔、新增素材 71 檔，含 11-02 接的 44 張背景。

**預估（LAWWW 自己的 AI 工時，不含 BB 瀏覽器時間和使用者時間）**
- 合計約 86～197 小時。
- 範圍寬的原因：
  - 692 項待測的失敗率是估的（10～15%，每項 0.4～0.6h），這一塊合計約 28～62h。
  - 約會 2D 系統（SYS-04、DATE-S6、SYS-03、SYS-08）約 14～29h，規格和底圖還沒齊。
  - 使用者 11-02 新交辦的讀書、考試、國考、職涯調整（STUDY-EXAM-SYS-1102）10～24h，要等 AA 定結局條件。
- 只算 D99 三項加新 P0 加下一版發布的關鍵路徑，約 30～65h。
- 實際花的時間由 BB 決定：SwiftShader 約 1 fps，佇列還有 37 項，發布前回歸要 4～6h。

**現在可以馬上做（都在 1h 以內）**
- 結案或改狀態：ENC-B3-1017、Y1-WINTER-AA204、EAT-MATTER-1023、ART-18、V4-R-TW、SYS-12、V4-X18、BACKLOG-SWEEP-1021。
- wip.json 裡 6 筆 LAWWW 的 WIP 已經過時。
- incr 剩 1 項，處理完 incr --advance。

**接班狀態**
- 交班時的 116 項 outbox 異常，已由 AA（e598d1d33）和 LAWWW2（42c124975）在 03:43～03:46 改好。現在 incr 只剩 1 項：LAWWW2 接班 commit 6f8a9786 沒分類。
- duty verify、check、roles、asks 都是 OK。

**等使用者的**
- iPhone 實機：BUG-02、BUG-MAPBLACK、BUG-WZFLICKER、BUG-IOS-RELOAD。
- 9 項場景要使用者標 ART_APPROVED。
- 圖：第五批 10 張背景、ntu_gate、經濟系烤肉 CG、芷若圍裙立繪。
- BUG-DATE-0831-1018 當時的操作。
- 被當延畢的規則。

| 任務 | 內容 | 狀態 | 階段 | 卡在 | 時數 | 依據 |
|---|---|---|---|---|---|---|
| ART-01 | 社科院新外觀接線（已整合）；等使用者看畫面標 ART_APPROVED | 等待其他AI／素材 | v0 經濟系（D99①） | 等使用者：建築美術只有使用者能標 ART_APPROVED 使用者看 USER_ART_REVIEW_1027.md 這一項 | 0.1～0.2h | flow_soclib、campus_layout_nav 10-16 已 PASS，列在 docs/handoff/USER_ART_REVIEW_1027.md；LAWWW 只剩改狀態，提修改轉 LAWWW2（D108） |
| ART-18 | AA_145 的 2D 背景 id 接進 S.BG（v0 背景都接了） | 等待其他AI／素材 | v0 經濟系（D99①） |  LAWWW 改狀態（或留給使用者看畫面） | 0.1～0.2h | 稽核 C 寫剩 4 張已併入 SCN-V4-02、SCN-JP-2D、本項可以結案；程式在 src/outings3d.js，main 上就有 |
| SYS-05 | 每年重複活動的年級版本，剩的缺口併 AA342-COVERAGE-1021 | 待開工 | v0 經濟系（D99①） |  BB 驗 AA342-COVERAGE-1021 | 0.2～0.5h | AA342-COVERAGE-1021 已整合待測試（BB 測大二上 12/10 麵店、大三下母親節、大四下學士服三場）；BB 測過就結案 |
| DL-04 | 劇情保護：經濟系 17 個核心事件標 keep:'must'（AA_154） | 待開工 | v0 經濟系（D99①） |  做完由 BB 驗 | 1～2h | 捷運出遊 R1／R2、週日住家裡 R1 已做（19eaa15e7、856099bb3、38752c06c）；src 現在只有 2 處 keep:'must'；改標記＋Node 測試約 1h，合併 0.3h |
| BUG-ECON-HOME-SHOTS-1018 | 經濟系縮圖總表剩 n255 臺大校門口是黑底 | 等待其他AI／素材 | v0 經濟系（D99①） | 等使用者生 ntu_gate（BB 寫提示詞、檢查） ntu_gate.webp | 0.2～0.4h | assets/bg 沒有 ntu_gate；camp_y1.js 兩處 bg:'dark'；圖到了換掉約 0.3h |
| AA299-IMAGES-1018 | 使用者生成的背景接進遊戲：第五批 10 張（gym_pool、ziqing_studio、tc_schoolroad、court_hall、radio_room、welfare_room、phil_cafe、psy_lab、jp_eatery、jp_intl_office） | 等待其他AI／素材 | v0 經濟系（D99①） | 等使用者照已給的提示詞生成 第五批 10 張圖；BB 檢查後交 LAWWW | 1～1.5h | 11-02 第四段實績：每批 10 張（轉 WebP、OUT.BG、scene_bg_keys PENDING、bg_images_unit、LICENSES、柔化品牌標記 1～3 處）約 1h |
| CG-ECON-BBQ-1018 | 經濟系中秋系烤 E08 的 CG（阿勳柚子帽、品妤拍照） | 等待其他AI／素材 | v0 經濟系（D99①） | 等使用者生 CG（使用者 10-18：CG 先記錄，之後補） cg_econ_bbq_pomelo | 0.2～0.4h | 接法三步已寫好（存 assets/cg/econ、CG_REGISTRY、ev_y0_e08 加 cg） |
| BG-ECON-B1-1018 | 經濟系黑畫面第一批四張背景（四張都已接） | 等待其他AI／素材 | v0 經濟系（D99①） | 等使用者標 ART_APPROVED（USER_ART_REVIEW_1027.md） | 0.1～0.2h | cram_counter、mrt_night、boardgame_gg、phone_street_night 都在 assets/bg、OUT.BG；只差使用者看畫面 |
| ENGINE-FILL-SPEC-1021 | 引擎補光 E.fill 讓室內亮面地板出現鏡面高光 | 待開工 | v0 經濟系（D99①） |  BB 全區前後截圖 | 2～4h | 會動到所有室內光線，要先量各區亮度、改成半球光或降低室內 fill，再請 BB 全區截圖比對；P3、不在 D99 三項裡，建議三項之後再做；改 engine3d 依 D108 可以給 LAWWW2 |
| EAT-MATTER-1023 | 吃東西、喝飲料要有差別 | 進行中 | v0 經濟系（D99①） |  | 0.1～0.2h | 10-23 子代理盤點：使用者選 C＝FOOD-FAV-1023 已做（foodfav3d.js、aa410_food_fav 71 PASS），A 不做，沒有剩下的→直接結案 |
| LAKE-LAMPS-STAGGER-1101 | 醉月湖對面的路燈一盞一盞亮 | 暫停 | v0 經濟系（D99①） | 恢復條件：D99 三項收完 | 1～2h | 要改引擎 E.setLamps；D99：不影響遊玩、只記錄（LAWWW-B 11-01） |
| BUG-02 | 偶發全黑、面膜臉（只在 iPhone） | 暫停 | v1 法律系大一上 | 等使用者：iPhone ?debug 使用者有空時用 iPhone 開 ?debug，或 BB 在模擬器重現 | 0.5～3h | 模擬器重現不了；使用者 11-01 23:1x 選先不要幫忙用 iPhone ?debug 看；有截圖或計數才有 LAWWW 的工作 |
| TEST-04 | 10-16 新功能瀏覽器驗證（空橋、政大、載妹墊、週末回家、階梯對話框、總圖導覽） | 進行中 | v1 法律系大一上 |  BB 跑完 | 0.2～1h | BB 重跑 flow_skybridge、flow_lib_tour、guide_flow 等，結果寫進 TEST_RESULTS；LAWWW 結案，並修失敗的項目 |
| ART-07 | 便利商店商品第二版 | 等待其他AI／素材 | v1 法律系大一上 | 等使用者標 ART_APPROVED | 0.1～0.2h | cvs_glb_integration ALL PASS；場景美術 |
| ART-08 | 女舍門廊吸頂燈加大 | 等待其他AI／素材 | v1 法律系大一上 | 等使用者標 ART_APPROVED | 0.1～0.2h | batch_1016_render 門廊光 6 樣都亮；場景美術 |
| DATE-S1 | 三種相處的計數：剩校園附近的 A 類相處（不計數、第 5 階以上戀愛 +1） | 進行中 | v1 法律系大一上 |  | 0.5～1.5h | DATE.historyText 已接進 src/game3d.js:625 人物頁；date_core_unit 已有；剩 A 類相處要核對做了沒，做了就改已整合待測試 |
| DATE-S6 | 半互動約會：各地點台詞 lines/Dxx.json 匯入、likes、心願事件接抵達、{lastDrink}、人物圖層素材（不含 SYS-04 熱區） | 進行中 | v1 法律系大一上 |  AA 已審的各地點 lines 白名單 commit；底圖核准（舊紀錄寫等使用者裁定） | 4～8h | 文字選單版、結算、相簿、快速約會、預約句子已做（e3c89ae8、2a6c0a30）；I08 人物去背 53 檔在 LAWWW2 分支 claude/funny-albattani-iawshm 要搬過來；子代理 2～3 輪加合併；D99 以外（v1 約會系統） |
| SYS-03 | 約會核心：心願事件白名單、arriveLine 第一次到心願地點演心願事件；剩沒規則的 D09 mon_maybe、雨天版、17:00 閉館 | 待開工 | v1 法律系大一上 |  沒有規則的三項要 AA 定 | 1～3h | 固定段落、休館、costByMode 已做（tests/date_sys03_unit.js 19 PASS） |
| SYS-04 | 2D 疊圖約會場景：讀 date_system/art/Dxx_coords.json 畫可點熱區、放人物圖層（32 處） | 待開工 | v1 法律系大一上 |  coords 白名單；LAWWW2 分支的人物圖層；BB 直橫向實玩 | 6～10h | 新的 UI 系統，要做手機直向、橫向和觸控；比照子代理一節 0.7～1h，估 3～5 輪加合併；D99 以外 |
| SYS-08 | 學期中的精華日（手機週曆標事件日、一鍵快轉到下一個精華日） | 待開工 | v1 法律系大一上 | 要 AA 給批准的規格 | 3～6h | 寒暑假摘要日已有（SYS-LBREAK 已驗收）；學期精華日只有 AA_90 第 10 節，還是 PROPOSAL、部分過時 |
| DONE-B15 | 公館腳踏車行街景 | 等待其他AI／素材 | v1 法律系大一上 | 等使用者標 ART_APPROVED | 0.1～0.2h | 場景美術，列在 USER_ART_REVIEW_1027.md |
| ENC-B3-1017 | 自由出行第三批偶遇＋「你來過一次」 | 進行中 | v1 法律系大一上 |  BB 驗：先自由出行去 D04，再約以安去 D04 | 0.1～0.2h | 11-01 已做（3c32d5166，src/data/solo_before.js、tests/solo_before_unit.js）；只剩把狀態改成已整合待測試 |
| PLAN-1016-ROM | 七位的戀愛故事補完的剩餘：PS_RED_PEN 每月照片、紅筆短版視訊版 | 待開工 | v1 法律系大一上 |  SYS-08 或改用其他呈現方式 | 1.5～3h | BB_165 3-1、5-1、5-2、9 節已進（b42bc9e7a，rom1016_unit 29）；每月照片要學期中摘要日（依賴 SYS-08）；狀態應改進行中 |
| ART-SCOOTER2 | 機車 v2（12 款＋LOD）已整合 | 等待其他AI／素材 | v1 法律系大一上 | 等使用者標 ART_APPROVED | 0.1～0.2h | wz_street_integration、reachability_all 已 PASS；street_props_integration 還沒跑（BB） |
| BUG-MAPBLACK | 按地圖後變黑、人物黑剪影（iPhone） | 等待其他AI／素材 | v1 法律系大一上 | 等使用者 iPhone 實機（要先發版） | 0.1～2h | 修正已在（b3d67056、59facb8b）；模擬器 map_canvas_leak、dorm_start_memory、zone_memory 都 PASS；真機還會出現才有 LAWWW 的工作 |
| BUG-WZFLICKER | 溫州街店面、舊路書店、總圖電梯的疊面閃爍 | 等待其他AI／素材 | v1 法律系大一上 | 等使用者用 iPhone 或電腦看 | 0.1～0.2h | 四處都修了；SwiftShader 靜態截圖看不出閃；還閃就轉 LAWWW2 修（D108） |
| ART-BIKES2-INT | 腳踏車 v2（7 款）已整合 | 等待其他AI／素材 | v1 法律系大一上 | 等使用者標 ART_APPROVED | 0.1～0.2h | 和 ART-SCOOTER2 同一批 |
| BUG-IOS-RELOAD | iPhone 記憶體不足重新載入，被踢回標題（政大出遊） | 進行中 | v1 法律系大一上 | iPhone 確認等使用者（要先發版） BB 的記憶體量測 | 2～4h | 已做：止血、手機貼圖上限、夜間材質洩漏、ADV 快取；下一步：BB 量 dorm_start_memory 來回的 renderer.info 和 JS heap，還在上升就由 LAWWW 做離開區域時釋放建築 GLB（ASSETS.cache） |
| QA-W1-VISUAL | 第一週肉眼巡檢：LAWWW 修 BB 找到的畫面問題 | 進行中 | v1 法律系大一上 |  BB 截圖結果 | 1～3h | BB 照 VISUAL_WALKTHROUGH_W1.md 走剩下的 16 項，加座位檢查第四輪；估 3～6 處、每處 0.3～0.5h |
| VAC-B1 | 假期 BB 人物部分：芷若大一暑假衝突清單交 AA、接 AA 的回覆 | 進行中 | v1 法律系大一上 |  AA 回芷若衝突清單 | 0.5～1h | AA-B 10-31 20:04：大一照 AA_432；Kevin 大二已接（aa550_nye_y2_unit）；D99② 寒暑假 |
| VAC-B3 | 寒暑假背景 train_day 只註冊、沒有事件用 | 等待其他AI／素材 | v1 法律系大一上 |  | 0.3～0.8h | src/outings3d.js 有 train_day，src 裡沒有任何事件用它；找回家、去台中或高雄的移動字卡換上，或標成未使用素材；D99② |
| AA208-L | 四人房室友剩餘：E02、T0a 句子、兩句旁白定字、v0 宿舍紙箱位置 | 進行中 | v1 法律系大一上 |  AA 定字；LAWWW2 四人房模型 | 0.5～1.5h | 11-01 補了三句（266af187e，aa208_roommates_unit）→ BB 驗；紙箱位置要等四人房模型 |
| ART-GG-SIGNS-2 | 公館招牌 34 張換進 gongguan_shops.glb | 等待其他AI／素材 | v1 法律系大一上 | 等使用者標 ART_APPROVED | 0.1～0.2h | GLB 已換；gongguan_glb_integration 要 BB 跑 |
| Y1-WINTER-AA204 | AA_204 大一寒假（含 1-4 聖誕群戲後兩人段落） | 進行中 | v1 法律系大一上 |  BB 驗 | 0.1～0.2h | 1-4 已併（d09caf0fe，aa204_xmas_after_unit）；AA-B 11-01 06:41 選 (b) 照現況、不剩待辦→改已整合待測試 |
| ANIM-BENCH-SIT | 長椅坐姿要不要調（共用坐姿動畫） | 待開工 | v1 法律系大一上 |  | 0.3～0.5h | LAWWW 是角色美術驗收（D100a），看小公園長椅截圖判定；D99：外觀問題只記錄 |
| BUG-DATE-0831-1018 | 經濟系轉法律系那天，9/1 早上畫面寫 8/31 | 暫停 | v1 法律系大一上 | 等使用者說當時怎麼操作 | 0.5～2h | LAWWW、BB-C 用 day-18 存檔走兩條路都沒重現 |
| EAT-EFFECT-1020 | 吃東西不要只是花錢：剩滷味攤點餐選單 | 進行中 | v1 法律系大一上 |  AA 給滷味攤菜單規格 | 1～2h | eat3d.js 一起吃、吃過的、熟客＋老樣子已做（eat_unit）；AA_329 沒有滷味攤菜單；便利商店打工排除要等打工系統 |
| BUG-SIS-LIB-LOAD-1022 | 直接在總圖 3F 讀檔，學姊沒出現 | 等待其他AI／素材 | v1 法律系大一上 |  BB 在 be8c1b0e 以後重現，並把存檔 JSON 和腳本 commit | 0～1h | LAWWW 在 be8c1b0e 重現不了；P3 |
| ART-ZR-CAFE-PORTRAIT-1022 | 芷若 Café 圍裙版立繪太糊 | 進行中 | v1 法律系大一上 | 等使用者生成高解析度圍裙版（BB 寫提示詞） | 0.2～0.3h | src/adv3d.js A.CAFE_APRON=false 已經關掉；圖到了換 assets/portraits/heroine_02/cafe/neutral.webp、開回 true |
| PRIV-AUNT-1028 | 麵店阿姨在不在店裡、私密選項：AA_519 第 8 節四件 | 進行中 | v1 法律系大一上 |  BB 驗：9/16 語彤一個人顧店、9/9 阿姨在、大四下 3/6 | 0.5～1.5h | 10-28 轉給 AA_519 子代理（4a0fdf2ac）；要先核對有沒有做完，做完改已整合待測試，沒做完補約 1h |
| NDL-AUNT-VIS-1030 | 麵店：阿姨說話時 3D 阿姨還沒出現 | 待開工 | v1 法律系大一上 |  BB 下次進麵店時抓讀數 | 0.3～1h | 要看 hc_ayi hidden／_hcWait 的讀數才知道怎麼改 S.together；P3、外觀問題只記錄 |
| SYS-13 | 打工系統：AA_289 3-7 學姊研究助理 JOB_RA、可昕法院旁聽那天兩則 | 進行中 | v2 大一下 |  AA 稿（AA_289 3-7、BB_99 M8 已有） | 1.5～3h | jobs3d.js 已有；JOB_RA 只出現在 src/v6ex3d.js 的註解和條件，遊戲裡沒有這份打工；子代理約 1h，合併 0.3h |
| EVPKG-AA227-228-KNOW | 知情曖昧、發現、挽回的剩餘：L2 拒絕、K12／二十三週年事件 ID、跨年頂樓說溜嘴、9 張場景圖、acceptsOpen 的值 | 進行中 | v2 大一下 |  部分要 AA 補台詞；9 張圖 BB 向使用者要 | 2～4h | multirel3d.js 四輪已做（aa422 174、aa423 129、mrel_ps_turn 63 PASS）；ACCEPTSOPEN-C-1027 已整合待測試，要核對 |
| BB152-SPORT-DATES-1031 | BB_152 運動約會（晨跑等）：先查和現行約會系統重疊多少 | 待開工 | v2 大一下 |  | 0.5～4h | 查重疊 0.5～1h；真的要做 3D 運動約會再另外估，可能要 LAWWW2 做動作；P3、不擋 D99 |
| ART-CG41-45 | BB-B 通過的 CG 和人物圖：剩日文班三人、邵鈞、詹靖、學姊面試服的立繪 | 等待其他AI／素材 | v3 大二 |  BB／LAWWW2 切立繪 | 0.3～1h | cg_three_things_heroine05、cg_no_plan_heroine05、cg_doorbell 已在 src（I10 已整合待測試）；剩的跟著 V3-B105-G2 等事件接 |
| V4-R-TW | 臺灣路線（已併入 AA342-COVERAGE-1021） | 待開工 | v4 大三（臺灣／日本／美國交換＝D99③） |  | 0.1～0.2h | 稽核 B1 寫本列併入 AA342-COVERAGE-1021（已整合待測試）→改取消／被取代，並寫替代 ID |
| V4-R-JP | 日本路線剩 5/20 子晴發表會直播畫面；jp_eatery、jp_intl_office 兩張背景 | 待開工 | v4 大三（臺灣／日本／美國交換＝D99③） |  AA 直播稿；第五批的兩張圖（等使用者）；BB 實玩日本路線 | 0.5～1.5h | 日本 2D 背景 jp_* 都在 assets/bg；jp_blank3d 已接（aa435 81 PASS）；直播沒有稿（1B-15） |
| V4-X18 | 交換延畢 X1～X8、大五上、以安研究所日期、國考新制 | 待開工 | v4 大三（臺灣／日本／美國交換＝D99③） | 被當延畢的規則等使用者 | 0.5～1h | Y5S1 已在 calendar.js（TERMS_DELAYED）和 src/y5s1_3d.js（AA_357）；對照 AA_144 第 1～3 節核對後改狀態 |
| SYS-12 | 日曆延伸（大五上、畢業後、國考、五年後） | 待開工 | v5 大四、畢業後、尾聲 |  | 0.2～0.5h | calendar.js 已有 Y5S1、LUNAR 2030；畢業後篇是摘要日（R2Y4b 結論）；核對後結案 |
| BB210-Y4S2 | BB_210 大四下清單：邀約、偶遇的口頭禪、story3d 備用句逐項核對 | 待開工 | v5 大四、畢業後、尾聲 |  | 1～2h | GRAD_DONE 已補（story3d、postgrad3d:195、270）；ladder_bb_y4s2 已匯入；子代理約 1h |
| AA267-Y5 | 畢業後篇：剩語彤延畢那一年（2029-09～2030-06）的 presence | 待開工 | v5 大四、畢業後、尾聲 |  AA 給語彤大五上在哪、作息 | 0.3～1h | 國考規則（AA_286）、HEART_FRIEND／HEART_LAST 已做 |
| SYS-19 | MISSING_EXTERNAL_ART.md 出遊背景那一段照實況重寫 | 待開工 | META 流程／工具 |  | 0.5～1h | assets/bg 現在有 263 個檔（11-02 又加 44 張）；照 OUT.BG 和 ART-17 追蹤表重寫 |
| TEST-07 | playlib.py 瀏覽器排隊鎖＋讀檔跳轉斷言共用函式＋TESTING.md 分級表 | 進行中 | META 流程／工具 |  | 1～2h | D100 起測試歸 BB；工具可以由 LAWWW 做，或轉給 BB |
| QA-LOCAL-1018 | 本機測試員（使用者電腦）的啟動說明 | 暫停 | META 流程／工具 | 之後等使用者裝本機環境 | 1～2h | 說明 LAWWW 可以先寫 |
| BACKLOG-SWEEP-1021 | 10-21 歷史遺留統籌（已由 HISTORY-AUDIT-1031 接手） | 進行中 | META 流程／工具 |  | 0.2～0.5h | first.term 寫 Y0S1，實際是流程任務；結案或改成被取代 |
| BRANCH-AUDIT-1028 | 分支定期唯讀稽核（發布前後、換班、每天） | 進行中 | META 流程／工具 |  | 1～2h | branch_audit.py 每次 0.2～0.3h；這是一週的份量；check 顯示上次是 11-02 03:46 |
| BACKLOG-START-1031 | 10-31 已規劃沒開始的派工 | 進行中 | META 流程／工具 |  | 0.3～0.5h | 10-31 盤點和派工已做；回報後結案 |
| HISTORY-AUDIT-1031 | 歷史待辦全面複核：收各職位的 judgments、重算、補派工、第二輪回報 | 進行中 | META 流程／工具 |  | 2～5h | tools/handoff/history_audit.py、ledger.json；五個舊任務已核（552fb56e1）；剩的決定：T1 2028 起日 6/27、1B-15（AA）、1B-20 3D 白紙（LAWWW2）、BCG-31 圖（BB） |
| TAKEOVER-A-1102 | 帳號 A 接班：通訊測試、盤點與預估、回報使用者 | 進行中 | META 流程／工具 |  | 1～2h | duty register、sync、verify 已做（0b17540f2、a3e96a72c、40de68ef2）；剩回 LAWWW2 的通訊測試（LAWWW2 交接檔 1b3e30244 寫「LAWWW 未回」）、incr 剩 1 項＋advance、wip.json 6 筆過時、多項狀態更正、回報使用者 |
| STUDY-EXAM-SYS-1102 | 讀書／考試／國考／職涯結局照使用者 11-02 要求調整（BB_222 第 0 節十六條） | 待開工 | P0 新指示：讀書／考試／國考／職涯（使用者 11-02） | 國考與職涯結局的條件和台詞要 AA 定稿 AA 規格；BB 修改前的基準盤點與驗收（STUDY-EXAM-CAREER-1102） | 10～24h | 現況：classes3d.js S.reportFor 考五題的課照答題分數，沒考試的課用 S.gradeOf(R.prep)（讀書、出席次數）；src 找不到「總複習」；postgrad3d.js「司法官」只出現 1 次，六條國考路線大多沒有。分項：盤點 1～2h；一鍵總複習＋學習進度 3～6h；成績改看答題、拿掉隱藏懲罰 1～3h；教材對得上題目 1～3h；法律服務社不刷任務 1～2h；國考六條路線＋存檔旗標 3～8h |
| NEXT-RELEASE | 下一版發布（v9.10.15 之後全部；tasks.json 還沒有這個 ID） | 待開工 | 發布（v9.10.15 之後） | 要 BB GO：BB 佇列 37 項（BUG-DOOR-CLASS-GO-1101 排第一）＋發布前回歸 4～6h，BB 時間沒算在這裡 BB 驗 44 張新背景在遊戲裡的樣子、11-01～11-02 的改動 | 4～8h | 27e6ce77e 以後有 220 個非合併 commit、src 80 檔、tests 107 檔、新素材 71 檔。LAWWW 要做：凍結候選、在乾淨 worktree 跑 TESTING.md 第五節九項（瀏覽器序列 2～3h）、check_orphans、check_lines、題庫漏收、PR、確認 Pages 部署、寫 RELEASES.md 和這版沒有的項目、修 BB 回報的失敗（1～3h）。比照前幾版約 3～5h |

各階段小計：
- v0 經濟系（D99①）：9.5～19.5h 未結 11 項 6.0～11.6h。已整合待測試 88 項（P0 17、P1 32、P2 37、P3 2；Y0S1 80、Y0S2 8），等 BB 驗；LAWWW 修失敗的估 10～15%×0.4～0.6h＝3.5～7.9h。屬於 D99 的部分（DL-04、圖接線）3～5.6h；ENGINE-FILL、LAKE-LAMPS（3～6h）不在 D99，可以延後。四張圖都等使用者。
- v1 法律系大一上：35.2～81.2h 未結 30 項 24.8～57.9h，其中約會 2D 系統（SYS-03、SYS-04、SYS-08、DATE-S1、DATE-S6）14.5～28.5h，不在 D99、規格不齊。寒暑假（D99②）VAC-B1、VAC-B3 0.8～1.8h。已整合待測試 259 項（P0 10、P1 100、P2 128、P3 21）修失敗 10.4～23.3h。用關鍵字粗估，692 項裡和寒暑假有關的約 72 項、分散在各階段。
- v2 大一下：6.9～17.5h 未結 3 項 4～11h（BB152 範圍不確定，所以上限寬）；已整合待測試 72 項（P0 3、P1 31、P2 36、P3 2）修失敗 2.9～6.5h。
- v3 大二：4.3～9.9h 未結 1 項 0.3～1h；已整合待測試 99 項（Y2S1 66、Y2S2 33）修失敗 4.0～8.9h。
- v4 大三（臺灣／日本／美國交換＝D99③）：4.3～9.8h 未結 3 項 1.1～2.7h（多半是核對和結案）；已整合待測試 79 項（Y3S1 51、Y3S2 28）修失敗 3.2～7.1h。和美國有關的待測，關鍵字粗估 v4 約 21 項、v5 約 25 項；LAWWW2 的美國收尾一、二輪（dcbd50b01、b03bedf29）等 BB 驗。
- v5 大四、畢業後、尾聲：5.1～11.7h 未結 3 項 1.5～3.5h；已整合待測試 91 項（Y4S1 45、Y4S2 46）修失敗 3.6～8.2h。
- META 流程／工具：7.2～15.4h 未結 8 項 7.0～15.0h（含接班收尾、歷史複核、一週的分支稽核）；已整合待測試 4 項修失敗 0.2～0.4h。
- P0 新指示：讀書／考試／國考／職涯（使用者 11-02）：10～24h 使用者 11-02 03:4x 直接交給 BB（BB_222、USER_WANTS X151）；LAWWW 實作任務 STUDY-EXAM-SYS-1102 已登記。是使用者自己交辦的，不受 D99「不插隊」限制，但和三項的先後順序要回報使用者。國考與職涯六條路線要 AA 先定稿，AA 寫稿和 BB 驗收的時間都沒算在這裡。
- 發布（v9.10.15 之後）：4～8h 只算 LAWWW 的時間。實際什麼時候能發，要看 BB GO：佇列 37 項每項 5～20 分鐘、發布前回歸 4～6h（SwiftShader 約 1 fps），BB 那邊大約要 1～2 天的瀏覽器時間。11-01～11-02 的改動瀏覽器和 iPhone 都還沒驗過。

等使用者：
- iPhone 實機：BUG-02（使用者 11-01 選先不要）、BUG-MAPBLACK、BUG-WZFLICKER、BUG-IOS-RELOAD；後三項要等下一版發布才能看
- 場景美術 ART_APPROVED（docs/handoff/USER_ART_REVIEW_1027.md）：ART-01、ART-07、ART-08、DONE-B15、ART-SCOOTER2、ART-BIKES2-INT、ART-GG-SIGNS-2、BG-ECON-B1-1018；ART-18 可以由 LAWWW 直接結案
- 圖：第五批 10 張背景（AA299-IMAGES-1018，提示詞已給）、臺大校門口 ntu_gate（BUG-ECON-HOME-SHOTS-1018）、經濟系中秋烤肉 CG（CG-ECON-BBQ-1018）、芷若高解析度圍裙立繪（ART-ZR-CAFE-PORTRAIT-1022）、剩 25 段 130 句黑底中需要 3D 截圖以外的部分
- BUG-DATE-0831-1018：使用者當時 8/31～9/1 早上怎麼操作
- V4-X18：被當延畢的規則
- QA-LOCAL-1018：在使用者電腦裝本機測試環境
- 約會 2D 底圖核准（DATE-S6 舊紀錄寫等使用者裁定，要確認是否還有效）
- AA 和使用者共創以安、沛珊、子晴、Alison 的聲音（AA_559～564 暫停），定型前 LAWWW 不改相關台詞
- 照片比對 ART-PHOTO-CMP-1021：共同教學館、女舍參考照片（LAWWW2 的工作，結果影響 LAWWW 整合）

### LAWWW2

LAWWW2（3D 美術＋場景程式）盤點，2026-11-02 03:5x UTC。資料來源：origin/claude/confident-ritchie-8rwh7t 的 tasks.json（40de68ef2）、origin/claude/second-ai-env-art（42c124975）。

接班狀態：帳號 A 的 LAWWW2 已經接班。它在 03:37 快轉合併了 B 的 funny-albattani-iawshm（e16b32ad，657 個 commit），並做了 duty register。通訊測試結果：BB 有回 ACK，AA 已經互測，LAWWW 到 03:43 還沒回。check、roles、asks 三項都是 0 異常。

總表裡負責人是 LAWWW2、還沒結案的有 146 件：
- 等待其他AI／素材 70、已整合待測試 60、進行中 7、待開工 4、暫停 3、已實作待整合 2。

**這 146 件絕大多數等的是使用者看畫面，LAWWW2 自己能做的不多。**
- 67 件只差使用者在遊戲裡看過、標 ART_APPROVED（清單在 docs/handoff/USER_ART_REVIEW_1027.md）。其中 7 件的總表暫停原因已經過時（寫「v9.10 後」「等 DL-11」「等 IU 版」），其實早就整合了。
- 5 件等使用者給東西：共同教學館和女舍的照片、ntu_library_rain 下雨版圖、nccu_dorm 白天版修圖、自己電腦和手機上的 ?perf 數字。
- 5 件被 D99 人物凍結擋住。

**LAWWW2 現在就能做、不用等別人的，約 6.5～13h：**
- 照經濟系路線巡一次場景（ART-DIRECTOR）：2～4h。
- 從 3D 直接拍黑底劇情缺的 2D 背景，約 8～10 張，先拍美國 C 棟門口 us_c_door（BG-DARK-SCENES-1024）：3～6h。
- 在開發分支上驗證美國公寓、C 棟 208 能重新匯出（LAWWW2-REEXPORT-US-1027）：1～2h。
- 小事三件：outbox 第 257 筆、ART-SOP 搬檔、ZQ-ARCADE 收尾，合計約 0.5～1.3h。

**排在 D99 三項後面的 P3（LAWWW 決定才做），約 7.5～17.5h：**
- CROWD-DEPTS-LOOK-1028：5～9h。
- ZQ-C504-LAPTOP-1101：1.5～2.5h。
- ART-SOY1：1～6h。遊戲裡沒有 3D 豆漿店，要先決定放哪裡。

**等 BB 驗收以後才知道要不要修的，約 3～26h：**
- INTERIOR-AAA 的修正：1～8h。
- 60 件已整合待測試回修：2～18h。

全部合計 LAWWW2 約 17～70h，範圍很寬，因為一半以上要看 BB 驗收結果和使用者給的意見。BB 那邊另外要花瀏覽器時間：60 件已整合待測試約 10～20h（SwiftShader 每個情境 5～20 分鐘）。

指定的幾件：
- ZQ-ARCADE：B 交班留下的「跑全部 Node 再交件」，已經被 LAWWW-B 在 11-01 21:2x 直接整合取代了（相關 9 支 Node ALL PASS，另加 zq_arcade_spawn_unit）。剩 BB 看 22:31 公館騎樓，以及 outbox 第 257 筆要從 WIP 改成已整合。
- ZQ-C504-LAPTOP-1101：要先在公館騎樓咖啡店（x≈12）加一個座位，P3。
- LAKE-LAMPS-STAGGER-1101：已經改由 LAWWW 負責，D99 暫停。
- ART-NO-DARK-WOOD-1023：10-23 已驗收。只剩美國公寓門外走廊的深色木板牆，不是地板，總表沒有這一項。
- 沛珊、芷若（ART-ZR-PS-3D-1022）：已驗收。沛珊第三十二版 10-23 由 LAWWW-B 通過、整合 9b2e6efb。使用者 10-22 說的「臉啊頭髮啊 醜死了」那筆，在 user_asks 裡還是「進行中」，要對齊。
- ART-PHOTO-CMP-1021：等使用者給照片，到了以後 2～5h。
- BG-DARK-SCENES-1024：原本向使用者要的 4 張已經到 3 張，ntu_library_rain 暫借晚上那張。

outbox：A 的 42c124975 整理完後，我在 confident-ritchie 上跑了 check_handoff.py incr（唯讀），格式異常 0 項。只剩 1 項：LAWWW2 的接班 commit 6f8a9786 沒有分類，要由 LAWWW 在 deliveries.json 的 ignored 加 kind:handoff_record。

總表需要 LAWWW 改的過時狀態有 11 件：
- CAM-BELL-1031、GYM-B1-PLATES-1101 已經隨 feat-art-1031 合進開發分支（8628c7e14），應改成「已整合待測試」。
- 7 件等待任務的暫停原因過時（ART-02、SCN-US-02、ART-WZ6、ART-WZ7、ART-US-SEASON、ART-GYM2-INT、WZ-SHOP-AA364-ART）。
- ART-13 應改成暫停。
- LAWWW2-REEXPORT-US-1027 要的 71 個來源檔，開發分支已經 71/71 都有。

我只讀檔、沒有改 repo。暫存檔在 /tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad/wf_estimate/lawww2/gen/tasks_out.json。

| 任務 | 內容 | 狀態 | 階段 | 卡在 | 時數 | 依據 |
|---|---|---|---|---|---|---|
| ART-DIRECTOR-LAWWW2 | LAWWW2 當 3D 美術總監：照玩家路線巡場景、自我驗收（長期） | 進行中（長期工作方式） | v0 經濟系（D99①） |  LAWWW 同意這一輪範圍（經濟系優先） | 2～4h | 每一輪巡場景＋README 過去約 2～4h（ART_DIRECTOR_PATROL.md 第 1～4 區）；這次建議先巡一次經濟系路線找剩下的缺口 |
| ART-POLISH | 現有 3D 美術品質修復與精修（人物、材質光影、場景） | 進行中（實質上被取代／凍結） | v1 大一上 | D99 人物凍結 LAWWW 決定拆分或結案 | 0～2h | 人物部分被 D99 人物凍結擋住；場景光影已由 INTERIOR-AAA 光照烘焙涵蓋；沒有具體下一批 |
| INTERIOR-AAA-REVIEW-1028 | 校內室內美術全面提升（光照烘焙、擺設、材質） | 進行中（計畫內房間都烘完，美國是最後一批） | v1 大一上 | 等 BB 畫面驗收；201 示範等使用者 ART_APPROVED BB 每間 10～20 分鐘看光照；使用者看 201 | 1～8h | 美國收尾第二輪已整合 b03bedf29；剩 BB 看完的修正：普通一樓樓梯井暗、101 門邊牆偏奶油、三棟單人桌椅還是方塊（單這項 3～5h）、體育館 B1 樓梯／3F 上層看台暗、合租戶客廳東邊 0.28 |
| PERF-CAMPUS-SHADOW-1020 | 校園地圖卡；建築旁影子閃 | 進行中（等使用者實機） | v1 大一上 | 等使用者 使用者開 ?perf 走校園回報數字；iPhone 看影子 | 0～4h | 影子閃已修（shadowSnap）；卡的部分已做腳踏車合併、路人 LOD、貼圖合併；SwiftShader 量不準，要實機數字才知道還要不要合併網格、關小物件投影 |
| ART-13 | 明軒、小語模型 | 進行中（實質暫停） | v1 大一上 | D99 人物凍結 LAWWW 改成暫停（五欄）；使用者決定是否解凍 | 0～0h | 小語已接（55b67ccf9）；只剩明軒，D99 素材凍結不排；解凍後明軒 VRM 約 3～6h |
| ART-ECON-3D-GAP-1021 | 經濟系那一年的 3D 缺口 | 進行中（LAWWW2 那一半已交完） | v0 經濟系（D99①） | 等 BB（campus_layout_nav、reachability_all、E12 11/6 17:45 畫面） BB 看醉月湖晚上；LAWWW 決定 LAWWW2 這一半結案 | 0～1h | A 共同、B 普通、C 總圖 3F、D 醉月湖晚上都已整合（b03bedf29）；F 已 retired；E 四季服裝另案、G X14 是 LAWWW、H 是使用者 |
| PERF-ZONE-ENTER-1018 | 電腦換畫面卡一兩秒（X14） | 進行中（等使用者實機數字） | v0 經濟系（D99①） | 等使用者 使用者在自己電腦、手機開 ?perf 走幾個地方、按「複製」貼回來 | 0～0h | ?perf 小框 BB-B n26_perfpanel_e ALL PASS；模擬器量不出整體變快；拿到數字後 LAWWW2 約 2～6h |
| ART-SOP | 美術製作 SOP（ART_SOP.md、SCENE_RULES.md、sop_demo） | 待開工（只剩搬檔） | v1 大一上 |  LAWWW 搬進開發分支後結案（D88） | 0.2～0.5h | 三份已在 LAWWW2 交付分支 second-ai-env-art，開發分支還沒有；主要是 LAWWW checkout 0.2～0.3h |
| ART-SOY1 | 豆漿店道具組＋寶特瓶袋 v2 | 待開工（等 LAWWW 決定放哪裡） | v1 大一上 | 沒有 3D 地點 LAWWW（問 AA）決定取消、放路邊、或做小店；排在 D99 後 | 1～6h | soy_props.glb 已在開發分支 aa_support/，src 沒有地方用；遊戲沒有 3D 豆漿店（只有 2D ART-BG20）。放溫州街路邊 1～2h；做可進去的小店 3～6h；原恢復條件 DL-11 已實作 |
| LAWWW2-REEXPORT-US-1027 | 開發分支能重新匯出美國公寓、C 棟 208 GLB | 待開工（來源檔已全在開發分支，剩驗證） | 美國交換（D99③） |  LAWWW2 跑驗證，通過後 LAWWW 結案 | 1～2h | D88 搬檔清單 71 個檔在 confident-ritchie 已 71/71 存在；剩在開發分支 checkout 跑匯出並和現有 GLB 比對（--check） |
| CROWD-DEPTS-LOOK-1028 | 各系路人外觀（測量腳架、實驗衣、工讀證書車、系服、推車、共撐傘）＋201 門口等候點 | 待開工（P3，排在 D99 之後） | v1 大一上 |  LAWWW 排程；系服字樣照 D77 | 5～9h | 約 6 種道具每種 0.5～1h Blender＋CHAR.setProp 接法、兩個等候點、Node 測試、遊戲內截圖 |
| CAM-BELL-1031 | 行政大樓門廊旁鏡頭落進傅鐘鐘亭 | 已整合（總表狀態過時） | v0 經濟系（D99①） |  LAWWW 改「已整合待測試」；BB 10～15 分鐘看門廊鏡頭 | 0～0h | 8119766b1 隨 feat-art-1031 合進開發分支 8628c7e14；開發分支有 tests/campus_bell_seethru_unit.js |
| GYM-B1-PLATES-1101 | 體育館 B1 三塊門牌畫字 | 已整合（總表狀態過時） | v1 大一上 |  LAWWW 改「已整合待測試」；BB 10～15 分鐘看門牌 | 0～0h | 095518e3f 已整合 82107f8b5，隨 8628c7e14 進開發分支；有 tests/gym_b1_plates_unit.js |
| ART-JIAHAO-JOY | 家豪晚上近照嘴邊暗影 | 暫停 | v0 經濟系（D99①） | D99 人物凍結 使用者解凍人物美術 | 0～0h | D99 人物凍結；BB-C 說遊戲距離看不出來；解凍後 0.5～1h |
| CHAR-TEMPLATE | 主要角色做成模板 | 暫停（等使用者） | v0 經濟系（D99①） | 等使用者 使用者回答人物凍結要不要解除（含模板、明軒、品妤） | 0～0h | 使用者同意後才做；模板估 6～12h，不改現有人物外觀 |
| ART-PLAYER-SEASON-OUTFIT-1024 | 玩家四季服裝 | 暫停 | v0 經濟系（D99①） | D99 素材凍結 D99 三項驗收完或使用者提出 | 0～0h | D99 三項驗收完才做；四季 VRM 6～10h（LAWWW2）＋換衣時機與存檔 2～3h（LAWWW） |
| BG-DARK-SCENES-1024 | 劇情對話黑底：從 3D 拍 2D 背景＋向使用者要的圖 | 等待（一張等使用者；從 3D 拍的那批 LAWWW2 現在就能做） | v1 大一上 | ntu_library_rain 要使用者生成 先和 BB 對清單（BLACK-BG-AUDIT-1018 同一批）避免重做 | 3～6h | 原本要的 4 張：community_room、us_club_lawn、botanical_lotus 已接，ntu_library_rain 暫借 library_gate_night。LAWWW-B 11-02：X93 有 3D 的可由 LAWWW2 直接拍——us_c_door（D99③ 先拍）、law_courtyard、boya_201、linze_201、putong_empty、Café 門口夜景、法律系館B大廳、新體育館球場／門口，約 8～10 張每張 0.3～0.5h；LAWWW 接 OUT.BG、拿掉 PENDING 0.5～1h |
| ZQ-C504-LAPTOP-1101 | 子晴 c504_4_3（2026 暑假公館騎樓咖啡店）坐下開筆電 | 等待（實際上等 LAWWW2 自己加座位；P3） | v2 大一下 | LAWWW-B 判斷不在 D99 三項 LAWWW 決定要不要排 | 1.5～2.5h | 照 ZQ-ARCADE 凳子做法在 gongguan_shops 咖啡店 x≈12 加座位（Blender＋zones3d＋Node 測試）；之後 LAWWW 改 c504_4_3 約 0.3～0.5h；LAWWW-B 判斷現在不做 |
| ART-PHOTO-CMP-1021 | 共同教學館、女舍和參考照片比對 | 等使用者（參考照片） | v0 經濟系（D99①） | 等使用者 使用者提供共同教學館、女舍照片（11-01 說之後給） | 0～0h | 差異清單已交 880104746；照片抓不到（wikimedia 403）；照片到了以後南面庭園、西側樓梯 2～5h |
| ART-10 | 自強十舍 nccu_dorm | 等使用者（修圖＋ART_APPROVED） | v1 大一上 | 等使用者 使用者交白天版、看畫面標 ART_APPROVED | 0～0h | 晚上版已換上；白天版 nccu_dorm_day 使用者修圖中 |
| ART-02 | furniture_study 教室門模組 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面標 ART_APPROVED；LAWWW 改 pausedReason | 0～0h | 已整合；總表暫停原因「v9.10 發布後」過時 |
| SCN-US-02 | 美國校園街道 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面；LAWWW 改 pausedReason | 0～0h | 等的 IU 版已接成 us_campus（d3fdab82）；暫停原因過時 |
| ART-WZ6 | 故事小物件 wz6_items.glb | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 BB 截圖對照；使用者看畫面；LAWWW 改 pausedReason | 0～0h | 已整合；暫停原因「等 DL-11」過時（DL-11 已實作） |
| ART-WZ7 | 溫州街路邊小物 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面；LAWWW 改 pausedReason | 0～0h | 三件已在 wenzhou_street.glb（ART-WZ0 59dfa3a8）；暫停原因過時 |
| ART-US-SEASON | 美國篇場景改季節 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 BB 看四季；使用者看畫面；LAWWW 改 pausedReason | 0～0h | 已整合 d3fdab82；暫停原因「不在 v9.10」過時 |
| ART-GYM2-INT | 新體育館 3F 主球場區域 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面；LAWWW 改 pausedReason | 0～0h | 查證開發分支 gym3d.js 已有 ceremonyDay→z.ceremonyOn＋ceremonyNav，LAWWW2 下一步已做；暫停原因過時 |
| WZ-SHOP-AA364-ART | 溫州街林家乾麵、巷子裡定食內用場景 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面；LAWWW 改 pausedReason | 0～0h | 已整合 f2336295；暫停原因「v9.10.3 發布後」過時 |
| ART-VAC-AIRPORT-1021 | 3D 機場第二版（交換出發、寒暑假出國共用） | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面；LAWWW 決定要不要先修換匯處 | 0～1.5h | 已整合；殘留 19 換匯處背光偏暗＝LAWWW2 下一輪 |
| ART-WZ1 | 溫州街小公園擴大版 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～2h | 已整合；殘留公寓背面 A3、A4、S1、P1、P2（溫州街照使用者 10-21「直接收尾」） |
| ART-WZ5 | 溫州街的貓正式模型 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～1h | 已整合；殘留 v2 小修（走路的腿、趴著前腳），可能已被 WZ-CAT-LIFE-1023 骨架版取代，要查 |
| ART-11 | 政大校園裡的路 nccu_campus | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面標 ART_APPROVED 或提修改 | 0～0h | 已整合；場景 ART_APPROVED 只有使用者能標 |
| ART-12 | 台北的家 2D home_living、home_balcony | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| SCN-US-01 | 美國公寓社區＋單人戶 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面 | 0～0h | 已整合；功能面已住過一整學期 |
| SCN-US-03 | 美式大型超市 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG02 | 2D 背景 公館滷味攤 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG05 | 2D 背景 宿舍頂樓 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG18 | 2D 背景 視訊（可昕那一端） | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG15 | 2D 背景 台大社科院門口 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG16 | 2D 背景 霖澤館前 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG17 | 2D 背景 椰林大道 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG13 | 2D 背景 溫州街課輔班門口 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG08 | 2D 背景 車上 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG11 | 2D 背景 山上看星星 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG14 | 2D 背景 永康街咖哩店 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG19 | 2D 背景 公館二輪戲院 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG20 | 2D 背景 豆漿店 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-TUTOR1 | 家教客廳道具組 | 等使用者（ART_APPROVED） | v2 大一下 | 等使用者 使用者看畫面 | 0～0h | 已整合（BG-21 用這組） |
| ART-V0-DORM | 經濟系那年祐廷的宿舍房間 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| V0-ART-DORM | v0 宿舍 412 房間道具 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-WZ4 | 兩點半 Café GLB 換新 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合；WZ4b 已交（b7a091b8） |
| ART-WZ3 | 溫州街 wenzhou_street.glb v5 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合；v6c 已交 |
| ART-US1 | 美國公寓客廳家具組 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-US2 | 美國公寓廚房 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-US3 | 美國公寓臥室家具 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BG-COURT | 2D 背景 戶外籃球場晚上 | 等使用者（ART_APPROVED） | v3 大二 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-GYM-BG1 | 2D 背景 新體育館典禮 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合（8/31 開學典禮） |
| ART-GG-SIGNS | 公館店面招牌重新設計 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合（ART-GG-SIGNS-2 以後版本在開發分支） |
| ART-CAFE-FLOOR | 兩點半 Café 地板改自流坪水泥灰 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-WZ0 | 溫州街舊店面翻修 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合（12fc2b23） |
| BUG-WZFLICKER-2 | 溫州街疊面閃爍尾巴 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-BIKES2-F | 腳踏車 v2 後續 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-DORM-LOFT | 宿舍改台大四人房 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| SCN-US-LIB | 美國法學院圖書館 3D 區域 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-EXT-M1 | 男一舍外觀 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-EXT-GATE | 臺大校門外觀 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-EXT-TEACH | 普通、博雅教學館外觀＋室內 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-EXT-MRT | 捷運公館站出口外觀 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| SCN-US-IU-1018 | 美國校園照 Indiana 校區 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面 | 0～0h | 已整合（d3fdab82） |
| ART-GG-SHOPS-1018 | 公館店面外觀重做 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-LIB-VIEW-1018 | 總圖窗景 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| GRADE-GOLDEN-DEFAULT | 黃昏調色預設就開 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合（40a8ddc3） |
| GG-STREETVIEW-1020 | 從學校看出去的公館街景 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-L118-LANE-1020 | 118 巷街道像巷 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-ROOM-MULTI-1020 | 萬才館多功能教室和 202 區分 | 等使用者（ART_APPROVED） | v3 大二 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-ROOM-LIFE-1020 | 202、多功能教室生活感 | 等使用者（ART_APPROVED） | v3 大二 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-DORM-LOUNGE-1021 | 男宿交誼廳家具 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| BUG-CAFE-FLOOR-MIRROR-1021 | Café 地板鏡面反光 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合（e8c4ce7a） |
| US-MS-NIGHT-1021 | 美國街道路燈地面光圈 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-TONE-NEUTRAL-1022 | 色調映射 ACES→Neutral | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-L118-FACADE-3D-1023 | 118 巷九間店面外觀立體化 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-GG-FACADE-3D-1023 | 公館店面外觀 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-SHOP-VIEWS-1023 | 店裡往外看的景 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合（兩批） |
| ART-GG-STREETLIFE-1023 | 公館騎樓前機車、單車架、路人 | 等使用者（ART_APPROVED） | v0 經濟系（D99①） | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-WZ-MARKET-1023 | 溫州街二手市集攤位 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 已整合 |
| ART-US-ROUTE-1024 | 美國交換路線巡查補件 | 等使用者（ART_APPROVED） | 美國交換（D99③） | 等使用者 BB 看社區傍晚、法圖 21:00；使用者看畫面 | 0～0h | 已整合 |
| ART-HALL-WINDOW-DUSK-1025 | 臺灣大廳窗景黃昏比屋外亮 | 等使用者（ART_APPROVED） | v1 大一上 | 等使用者 使用者看畫面 | 0～0h | 修正已交（c234ccadf）並整合 |
| ZQ-ARCADE-SEAT-1028 | 子晴公館騎樓坐凳＋插座＋腿上筆電 | 已整合待測試（LAWWW-B 已代為整合） | v3 大二 |  BB：gongguan_layout_nav、reachability_all（公館）、22:31 看子晴坐著有筆電（20～40 分鐘） | 0.2～0.5h | LAWWW-B 11-01 21:2x 已整合 e16b32ad0 的 GLB、laptop_lap、patch，並改 heroine_circle（相關 9 支 Node ALL PASS、加 zq_arcade_spawn_unit）；B 交班的「跑全部 Node 再交件」已被取代。剩 outbox 第 257 筆從 WIP／未派改成已整合／ACTIONED，可選在開發分支最新版跑一次全部 Node（約 0.3h） |
| ART-NO-DARK-WOOD-1023 | D112 全遊戲不要深色木地板 | 已驗收（10-23 BB 兩批都 PASS） | 美國交換（D99③） |  LAWWW 把走廊木板牆開成任務或明確不做 | 0～1.5h | 九間室內＋程式備用地板已驗收；殘留（總表沒有）：美國公寓門外走廊深色木板牆（非地板）約 0.5～1.5h；2D 背景也不要深色木地板（UA-LAWWW-1102-02）是 BB、LAWWW 接圖的事 |
| ART-ZR-PS-3D-1022 | 芷若、沛珊 3D 看起來憨（臉、頭髮） | 已驗收（LAWWW 角色美術驗收，D100） | v0 經濟系（D99①） |  LAWWW2 對齊那筆使用者要求的狀態（或請使用者看第三十二版） | 0～0h | 芷若臉 10-22 04:4x 通過、頭髮 ART-ZR-HAIR-1022 通過；沛珊第三十二版（1056a5c7）LAWWW-B 10-23 17:5x 通過、整合 9b2e6efb、BB 第 66 項看遊戲裡。凍結的差異（兩側髮綹、瀏海落在鏡框上緣、髮片階梯、鞋子）要另開任務。user_asks 的 UA-LAWWW2-1022-02 還是「進行中」，和總表不一致 |
| LAKE-LAMPS-STAGGER-1101 | 醉月湖路燈一盞一盞亮（負責人已是 LAWWW） | 暫停（負責人 LAWWW） | v0 經濟系（D99①） | D99 D99 三項收完 | 0～0h | LAWWW2-B 交班的表外項，已補進總表；恢復時引擎 E.setLamps（LAWWW）＋北岸路燈順序（LAWWW2）約 1～2h |
| OUTBOX-LAWWW2-1102 | outbox_LAWWW2.json 格式與增量核對 | 格式已修好；剩 1 項 incr 異常（不是格式問題） | META 流程／工具 |  LAWWW 在 deliveries.json ignored 加 6f8a9786 kind:handoff_record 後 incr --advance；LAWWW2 更新第 257 筆 | 0.1～0.3h | 42c124975 整理 state 34 筆、ack 39 筆、task 66 筆；我唯讀跑 check_handoff.py incr（ref confident-ritchie）：outbox 格式 0 項。唯一異常：LAWWW2 接班 commit 6f8a9786（動了 tools/handoff）沒有分類。語意過時但不擋 incr：第 257 筆 ZQ-ARCADE；5 筆 task 不在總表（BB218-Y1-TAPE-BOX、BB218-GYM-HAZE、ART-02-GONGTONG-1021、WZ-SHRINE-TRAP-1028、LIB-LAWN-1030）；7 筆改掛 ART-DIRECTOR-LAWWW2 |
| GROUP-已整合待測試-v0 | 已整合待測試 8 件：ART-05、ART-09、ART-YT1、ART-NPC-HAIR-STREAK、WZ-CAT-LIFE-1023、PERF-SINGLESIDE-GLB-1025、PERF-CAMPUS-DAY-1027、PERF-TEX-DEDUP-1027 | 已整合待測試（只剩 BB 瀏覽器驗證） | v0 經濟系（D99①） |  BB 照各任務 next 跑 | 0～3h | 程式都在開發分支；LAWWW2 只在 BB 找到問題時修（估一到兩成回修、每件 0.5～2h）；BB 另需約 1.5～3h |
| GROUP-已整合待測試-v1 | 已整合待測試 42 件：ART-04、ART-GYM1、BUG-COPLANAR-DEV、ART-NPC-40、ART-HAIR-MATCAP、ART-PS-SKIRT-HAND、ART-YU-3D-1018、ART-SEATFIG-1018、LANE118-SHOPS-1020、BUG-GYM-STAIRS-1020、LINZE-WANCAI-FLOORS-1020、LINZE-34F-TABLES-1020、SKYBRIDGE-DOOR-1020、BUG-CAM-203-R2-1021、ART-Y1-BOX-MIRROR-1021、BACKLOG-A7-WZPARK-COPLANAR、SET-CEREMONY-1023、PARK-ENTRY-B-1027、FIT-3D-BODY-1027、ANIM-DOOR-OPEN-1027、ART-LAMPSHADE-FLIP-1027、BADMINTON-CLIP-1027、FAIR-STAFF-LOD-1027、HEROINE-LIFE-NPC3D-1028、NPC-POOL-ART-1028、LIGHTBAKE-UV-FIX-1028、INTERIOR-202-1028、LOBBY-CEIL-1028、LOBBY-VC-1028、WANCAI-LM-1028、DORM-HALL-LM-1028、LIB-HALL-LM-1028、LM-SEAM-1028、RT-NIGHT-1028、DORM-SLEEP-VISUAL-1030、DORM203-LM-1030、CAFE-WINDOW-LIVE-1030、CAFE-LM-1030、LIB-LAWN-PLAN-1030、RENAME-ART-1030、LAWLIB-LM-1030、MULTI-ROOM-V2-1030 | 已整合待測試（只剩 BB 瀏覽器驗證） | v1 大一上 |  BB 照各任務 next 跑；場景 ART_APPROVED 之後還要使用者 | 2～10h | 程式都在開發分支；回修估同上；BB 另需約 7～14h。ART-PS-SKIRT-HAND 膝蓋穿裙、FIT-3D-BODY 第二階段（要使用者回答 D40 選擇題）被 D99 人物凍結擋住 |
| GROUP-已整合待測試-v3 | 已整合待測試 4 件：SCN-V3-01、ART-PT-SIS-FORMAL、SQ-TRACES-1023、ZQ-ARCADE-SEAT-1028 | 已整合待測試（只剩 BB 瀏覽器驗證） | v3 大二 |  BB 跑 | 0～2h | BB 另需約 1～1.5h |
| GROUP-已整合待測試-v4 | 已整合待測試 3 件：SCN-V4-01、ART-DORM-Y34、JP-ROOM-3D-1021 | 已整合待測試（只剩 BB 瀏覽器驗證） | v4 大三 |  BB 跑 | 0～1h | BB 另需約 0.5～1h |
| GROUP-已整合待測試-美國交換 | 已整合待測試 2 件：BUG-CAM-C208-1021、US-APT-CLOSET-1027 | 已整合待測試（只剩 BB 瀏覽器驗證） | 美國交換（D99③） |  BB 跑 | 0～1.5h | BB 另需約 0.5～1h |
| GROUP-已整合待測試-v5 | 已整合待測試 1 件：SCN-V5-01 | 已整合待測試（只剩 BB 瀏覽器驗證） | v5 大四以後 |  BB 跑 | 0～0.5h | BB 另需約 0.2～0.3h |

各階段小計：
- v0 經濟系（D99①）：2～8h 24 項，14 項等使用者（ART_APPROVED 或照片），4 項被 D99 凍結或暫停。LAWWW2 現在能做的是經濟系路線巡查 2～4h；其餘是 ECON-GAP 小修 0～1h、8 件已整合待測試回修 0～3h。不算進去：PERF-ZONE-ENTER 拿到使用者數字後 2～6h、ART-PHOTO-CMP 拿到照片後 2～5h。BB 瀏覽器另需 1.5～3h。
- 寒暑假（D99②）：0～0h LAWWW2 沒有掛在寒暑假的未結任務。機場 ART-VAC-AIRPORT-1021（交換、寒暑假出國共用）歸在美國交換，等使用者；ZQ-C504-LAPTOP-1101 是 2026 暑假的場景，歸在 v2。
- 美國交換（D99③）：1～6.5h 15 項，12 項等使用者 ART_APPROVED。能做的：重新匯出驗證 1～2h、機場換匯處背光 0～1.5h、公寓門外走廊深色木板牆 0～1.5h（表外）、2 件回修 0～1.5h。us_c_door 的 2D 背景算在 BG-DARK（v1）裡，建議先拍。
- v1 大一上：12.2～48.5h 39 項，29 項等使用者。大項：CROWD-DEPTS-LOOK 5～9h（P3）、INTERIOR-AAA 修正 1～8h（等 BB）、BG-DARK 從 3D 拍背景 3～6h（現在能做）、ART-SOY1 1～6h（等 LAWWW 決定）、PERF-CAMPUS-SHADOW 0～4h（等使用者實機）、42 件已整合待測試回修 2～10h（BB 另需 7～14h）。
- v2 大一下：1.5～2.5h 只有 ZQ-C504-LAPTOP-1101（P3）要做；另外 10 件 2D 背景、道具等使用者 ART_APPROVED。
- v3 大二：0.2～2.5h ZQ-ARCADE 收尾 0.2～0.5h、4 件回修 0～2h；3 件等使用者。
- v4 大三：0～1h 只有 3 件已整合待測試的回修備用時間。
- v5 大四以後：0～0.5h 只有 SCN-V5-01 回修備用時間。
- META 流程／工具：0.1～0.3h outbox 第 257 筆更新；incr 唯一異常 6f8a9786 由 LAWWW 分類（0.1h）。

等使用者：
- 67 項場景／建築美術只差使用者在遊戲裡看過、標 ART_APPROVED 或提修改（清單 docs/handoff/USER_ART_REVIEW_1027.md，含 INTERIOR-AAA 的 201 示範）；提修改時 LAWWW2 一輪約 1～3h
- 共同教學館、女舍的參考照片（ART-PHOTO-CMP-1021；使用者 11-01 23:1x 說之後給），到了以後 LAWWW2 2～5h
- ntu_library_rain（總圖門口下雨）要使用者照 3D 截圖生成（BB 的 X93 批），現在暫借晚上那張；nccu_dorm 白天版使用者修圖中（ART-10）
- 使用者在自己的電腦、手機開 ?perf 走幾個地方、按「複製」貼回來（PERF-ZONE-ENTER-1018、PERF-CAMPUS-SHADOW-1020）；iPhone 實機看影子閃、卡不卡
- D99 人物凍結要不要解除：CHAR-TEMPLATE（6～12h）、ART-13 明軒（3～6h）、ART-JIAHAO-JOY、沛珊／芷若第三十二版凍結的差異、ART-PS-SKIRT-HAND 膝蓋穿裙、FIT-3D-BODY 第二階段選擇題（D40_第二階段_給使用者的選擇題.md）
- ART-PLAYER-SEASON-OUTFIT-1024 玩家四季服裝：D99 三項驗收完，或使用者提出才做

### AA

AA（劇情與台詞）盤點，依據：企劃線 origin/claude/cool-heisenberg-o8kuqx（AA-B 11-01 08:55 交班，c989cc066）、帳號 A 的 AA 分支 origin/claude/story-planning（11-02 03:36 接班，接著 e598d1d33 修好 outbox，734026659 寫了 AA_570），以及開發分支 origin/claude/confident-ritchie-8rwh7t 的 tasks.json。

一、總表裡 owner=AA、還沒結案的有 25 項。其中 18 項狀態是「已整合待測試」：AA 的稿已經在開發分支，只差 BB 在瀏覽器裡驗。真正要 AA 動手的是下面這幾件：
- DIALOGUE-DEPTH-1031：角色個性共創，共 16 位。以安的第 2 輪使用者 11-01 23:1x 已經答了，選 4「舍監大概會說男生頭髮短。」（UA-LAWWW-1101-04），現在輪到 AA 演第 3 輪。但這個答案還沒寫進 AA_以安共創紀錄.md，也還沒寫進 user_asks_AA。其他 15 位還沒開始。
- HEROINE-LIFE-1028：postrel-1030 已經合進開發分支，AA 可以開始重讀。
- ASK-5NAMES：五個名稱使用者都定了。AA 剩企劃稿換名、決定「女九→女生宿舍」「小小福→小小松」要不要進換字規則，以及「紐約的法學院上了」這句要不要換說法。
- USER-PLAYER-BDAY-1101：使用者選了「交給 AA 挑」，可以直接定。
- JP-STREAM-LINE-1101：寫一兩句日本直播旁白。
- VAC-GAP-ROUTES：暫停中。

二、新的 P0：使用者 11-02 指派 AA 當讀書、考試、國考、職涯劇情的總監（AA_570，UA-AA-1102-01；USER_WANTS 記為 X151）。目前在第 1 步盤點。總表裡沒有 AA 自己的任務，user_asks 掛在 LAWWW 的 STUDY-EXAM-SYS-1102 上。這件我估 AA 30～65 小時，是除了台詞共創以外最大的一件。

三、LAWWW 在等 AA 的小問題，都在半小時左右：
- DATE-S6：src/date3d.js 的 S.TASTE_WORD 還是空的。
- AA117-CASE-NOTES-1031：C8 的「向誰」還沒定。
- XINCI-EPI-FEST-1031：問了 5 題技術預設，交接紀錄裡沒有回覆。
- AA267-Y5：語彤延畢那一年的 presence。
- VAC-B1：芷若大一暑假的衝突清單，要等 LAWWW 交過來。

四、AA313_REMAINING_1022 的 (b) 九點，AA-B 10-23 在 AA_389 全部回了，程式也接了（AA389-L-1023、AA389-REST-L-1023、ZR-SENDOFF-L-1023），AA 這邊 0 項待辦。

五、outbox 異常：第 285～290 筆、AOPEN-1027、PGF10-AN-EX-LATE，帳號 A 的 AA 已經在 e598d1d33 修好。另外有 9 個舊的任務 ID 在總表和交付紀錄裡都找不到（10-17～10-23 的紀錄），工具沒有報。

六、X150 的狀態字已經對齊：兩邊都寫「進行中」，備註「共創中」。

時數：AA 自己約 83～186 小時，其中台詞共創 45～100 小時，而且每位都要等使用者聊天、說「定型了」才能往下做；不算共創是 38～86 小時。每項需要的 BB、LAWWW 時間寫在 needs 欄，沒有算進 AA 的時數，避免和他們的盤點重複計算。

| 任務 | 內容 | 狀態 | 階段 | 卡在 | 時數 | 依據 |
|---|---|---|---|---|---|---|
| DIALOGUE-DEPTH-1031 | 角色個性共創（X150，UA-AA-1101-01）：16 位逐一和使用者用選擇題角色扮演，使用者說「這個角色定型了」才寫聲音規格（AA_565～569 起，3～5 段共同確認的範例對話），再改那個角色全遊戲的台詞。以安停在第 3 輪：使用者 11-01 23:1x 第 2 輪選 4「舍監大概會說男生頭髮短。」（UA-LAWWW-1101-04），還沒寫進 AA_以安共創紀錄.md。其他 15 位沒開始。AA_559～564 草稿暫停匯入。定型後要一起改的三處：以安 FRIEND 門檻台詞的暑假版（BB-B n40）、沛珊／子晴 BB_119 v6 的當面台詞、Alison yu_exam 兩句（8190b88ed） | 進行中 | META | 等使用者：每位角色都要使用者聊天，並明確說「定型了」。共創本身的時數無法用 AI 時數估 使用者聊天時間；LAWWW 每批匯入 0.5～1 小時（合計約 8～20 小時）；BB 三種抽樣測試 3～6 小時（目前先不排） | 45～100h | AA-B 10-31 寫大一上第一批（AA_558～563，閒聊階梯 928 行等）約 3 小時。全遊戲約 12 個學期或區段 × 3～4 小時，逐人做效率較差再乘 1.3，加上每人規格 0.5～1 小時 × 16。範圍大，所以區間寬 |
| AA570（總表沒有 AA 任務；對應 STUDY-EXAM-SYS-1102／STUDY-EXAM-CAREER-1102） | 讀書、考試、國考、職涯劇情調整（UA-AA-1102-01，X151，AA_570）。包括：各科的核心概念與爭點、給非法律背景玩家的白話解說、一鍵總複習的內容、題目對到教學內容並可查核答案（只用可查來源，AI 題要標明）、在校考試和國考的敘事連結、六條職涯結局（律師、司法官、落榜重考、有律師資格但司法官沒上、重考考上、重考沒上照樣當律師）、法律服務社改成純劇情、人物不說教也不比成績。也一併處理 D14-T5 被當、D14-T6 書卷獎的 BB_120 台詞定稿 | 進行中（第 1 步盤點，workflow 跑中） | X151 讀書／考試／國考／職涯（11-02 新 P0，跨 v1～v5） | 「重要結局方向」的新決策（例如司法官錄取怎麼和在校成績連動、可以重考幾次）照 D109 要用選擇題問使用者。題目要等盤點完才知道 LAWWW 實作 STUDY-EXAM-SYS-1102（由 LAWWW 估）；BB 照 BB_222 驗收；總表要給 AA 開一個任務（帶 xai），或把 AA 加進現有任務的 xai | 30～65h | exam_bank.js 有 30 門課的題目（共 483 題）。每門課的總複習包含概念、白話、考點對照，用子代理約 0.5～1 小時，30 門＝15～30 小時；法律正確性核對每門 0.2～0.4 小時＝6～12 小時；題目對教材的對照 2～4 小時；國考與六條結局文本 4～10 小時（postgrad3d.js 已有 AA_286 的規則可以沿用）；法服改純劇情 2～5 小時；盤點與缺口表 2～4 小時；交付 0.5～1 小時 |
| ASK-5NAMES | 五個名稱使用者都定了：哥大→紐約的法學院、杜鵑花節→松鼠節（UA-LAWWW-1101-04）；許志遠不變、小小福→小小松、女九→女生宿舍（UA-LAWWW-1101-05，狀態還是「還沒做」）。LAWWW-B 已經把前兩個放進換字規則，遊戲裡改了 6 處。AA 剩：用 world_names.py 換企劃稿、決定女九和小小松要不要進換字規則、「紐約的法學院上了。八月去紐約。」要不要換說法 | 待開工（使用者已答，AA 可以做；pausedReason「等使用者回答」已過時） | META |  如果女九、小小松要改進遊戲：LAWWW 0.3～0.5 小時跑 apply_game 和單元測試 | 0.5～1.5h | 換名工具已有；剩跑工具、核對、寫幾句 |
| USER-PLAYER-BDAY-1101 | 祐廷的生日（MM-DD）：使用者 11-01 23:1x 選「交給 AA 挑」，要挑一個不撞現有劇情和節日的日子，寫進 FEST_DATA.PLAYER_BDAY 的稿，附上理由 | 待開工（AA 可以做；pausedReason「使用者的人物設定，AA 不定」已過時） | v1 法律系大一上 |  LAWWW 接 FEST_DATA 約 0.3 小時（芯慈交往中 00:00 那則訊息才會發）；BB 約 10 分鐘 | 0.3～0.6h | 要掃 calendar、各角色的生日和節日表避免撞期 |
| JP-STREAM-LINE-1101 | 日本路線 1B-15「直播畫面（2D 手機）」：寫一兩句直播旁白（AA_322 只寫了「直播畫面」，沒有台詞） | 待開工 | v4 大三（日本路線） |  LAWWW 接進日本路線 0.3 小時；BB 約 10 分鐘 | 0.2～0.4h | 一兩句 |
| VAC-GAP-ROUTES | 日本／美國路線的寒暑假、出發前、回國後的空白缺口表＋第一批稿。掃描輸出 vsw_JP.json、vsw_US.json 只在 AA-B 的 scratchpad，要用 tools_aa/vsweep_routes.js 重跑 | 暫停 | 寒暑假（D99 第二；也影響第三的美國交換） | 使用者 11-01 改成先做角色共創；恢復條件是使用者說繼續，或共創告一段落。這是補新稿、不是重寫台詞，可以請 LAWWW 用選擇題問使用者能不能和共創平行做 LAWWW 實作第一批 1～2 小時；BB 測 | 3.5～6.5h | 重跑掃描 0.5 小時＋缺口表 1～2 小時＋第一批稿 2～4 小時 |
| HEROINE-LIFE-1028 | 女主角有自己的生活：AA 稿已交，剩 AA 在遊戲資料裡重讀。學姊照 AA_539 讀三種玩家 × 八學期，加上美日路線，對照 AA_470 A～H；女主角的生活要等 postrel-1030 合進開發分支（已確認合了） | 進行中 | v1 法律系大一上（跨四年） |  讀出的問題由 LAWWW 修 1～3 小時（看缺口數）；BB 測 | 2～4h | 用子代理和 term_sweep6／pg_read 讀資料；以往這類讀稿每份 AA_4xx 約 1～2 小時 |
| AA530-PG-CONFESS-1030 | 畢業以後（2030-05-25）選「跟她們說實話。」七位各一版。AA_530 已經交了（企劃線 0125b97a5），剩 LAWWW 派子代理實作。owner 寫 AA 不對，剩下的工作是 LAWWW 的 | 待開工 | v5 大四以後（畢業以後篇） |  LAWWW 子代理實作＋合併 1.0～1.6 小時；BB 15～20 分鐘 | 0～0.3h | AA 只需要回答子代理實作時的問題 |
| LADDER-Y3Y4 | BB 五位的閒聊階梯（大三上～大四下）。AA 稿在開發分支，只差 BB 驗收。這列還帶著過時的 pausedReason／resumeWhen，xai.ack 也還寫「未派」 | 已整合待測試 | v4 大三 |  BB 15～30 分鐘；LAWWW 清掉過時欄位 | 0～0.2h | AA 只在 BB 驗出問題時處理 |
| HOL-NYE-Y2 | 大二跨年台詞（AA_210 第 5 節）已接（5b7aecaf／5cb76551） | 已整合待測試 | 寒暑假（D99 第二） |  BB 10～20 分鐘 | 0～0.2h | 只差 BB |
| HOL-NYE-Y3 | 大三跨年台詞（da8f12f8／1553837c） | 已整合待測試 | 寒暑假（D99 第二） |  BB 10～20 分鐘 | 0～0.2h | 只差 BB |
| HOL-NYE-Y4 | 大四跨年台詞（f6515c69） | 已整合待測試 | 寒暑假（D99 第二） |  BB 10～20 分鐘 | 0～0.2h | 只差 BB |
| HOL-VA | AA 六位人物的假期台詞 VA-01～VA-12（AA_247、AA_204、AA_241／242、AA_256／264、AA_333 的麵店過年店休） | 已整合待測試 | 寒暑假（D99 第二） |  BB 15～30 分鐘 | 0～0.2h | 只差 BB |
| ROM-1017 | 戀愛規則改版：告白要第 6 階＋4 次正式約會（含心願地點）＋willing（AA_215） | 已整合待測試 | v1 法律系大一上 |  BB 20～40 分鐘（告白條件好幾種組合） | 0～0.2h | 只差 BB |
| SIS-GRADSCHOOL-1017 | 學姊大四準備法研所那一年的生活系統（sis_grad3d.js，f6915575）。這列還帶著過時的 pausedReason；next 裡「上線前要核對招生簡章日期」在改成虛構大學名以後可能不用做了 | 已整合待測試 | v1 法律系大一上（first.term；內容是學姊大四那一年） |  BB 20～40 分鐘；LAWWW 清掉過時欄位 | 0～0.2h | 只差 BB |
| BUG-E30-CLERK-1018 | 經濟系 E30 休學承辦人只說「好了。」（AA-C 62561d73） | 已整合待測試 | v0 經濟系（D99 第一） |  BB 5～10 分鐘 | 0～0.2h | 只差 BB |
| Q-NYE-E21A-1018 | 經濟系跨年 E21a：不在總圖念書，拿掉「書會等我」 | 已整合待測試 | v0 經濟系（D99 第一） |  BB 10～15 分鐘 | 0～0.2h | 只差 BB |
| Q-E21-TOLD-1018 | 除夕電話選項改成看得出是在問她休學的事有沒有跟家裡說 | 已整合待測試 | v0 經濟系（D99 第一） |  BB 5～10 分鐘 | 0～0.2h | 只差 BB |
| Q-E27-WHY-1018 | 水餃店 E27 可昕當面說出休學原因（P0） | 已整合待測試 | v0 經濟系（D99 第一） |  BB 10～15 分鐘（P0，經濟系主線要先測） | 0～0.2h | 只差 BB |
| WELCOME-DATE-1020 | 法律系迎新改到 8/31（日）09:30（AA_310 第 1、2、7 節） | 已整合待測試 | v1 法律系大一上 |  BB 10～20 分鐘 | 0～0.2h | 只差 BB |
| US-BLANK-1012-HINT-1027 | 美國挽回中 10/12 19:30 的停點旁白「會所自習室的燈還亮著」（AA_483 第 3 節，ef936bc59） | 已整合待測試 | 美國交換（D99 第三） |  BB 10～20 分鐘 | 0～0.2h | 只差 BB（BB_TEST_QUEUE_1027 第 5g 節） |
| CLUBFAIR-REAL-1027 | 社團博覽會十五攤＋AA_491 的句子（5b227d3aa） | 已整合待測試 | v1 法律系大一上 |  BB 15～25 分鐘 | 0～0.2h | 只差 BB（5k） |
| MSG-SIS-EARLY-1027 | 加了好友就能傳事務話題給學姊（AA_485 第 4 節） | 已整合待測試 | v1 法律系大一上 |  BB 約 10 分鐘 | 0～0.2h | 只差 BB（5k 第 4 項） |
| NOODLE-TEAM-WHY-1027 | 麵店團：群組建好時阿哲兩則＋長桌閒聊（AA_486／487／491） | 已整合待測試 | v1 法律系大一上 |  BB 10～15 分鐘 | 0～0.2h | 只差 BB（5k 第 5 項） |
| YT-BBQ-WHY-1027 | 語彤出現在中秋烤肉的交代（ev_mid_autumn_bbq 三行） | 已整合待測試 | v1 法律系大一上 |  BB 5～10 分鐘 | 0～0.2h | 只差 BB（5k 第 7 項） |
| NPC-STORY-1028 | 法律系 20 位有名字的同學，每人的個性、小故事、主動訊息（AA_496～501） | 已整合待測試 | v1 法律系大一上 |  BB 30～60 分鐘（二十位） | 0～0.2h | 只差 BB；xai.ack 還停在 SENT |
| DATE-S6（LAWWW 任務，等 AA 的部分） | 約會 {lastDrink} 要的 TASTE_WORD 說法：src/date3d.js 第 477～479 行 S.TASTE_WORD={} 還是空的，註解寫「AA 還沒給」。28 處地點台詞已經在 32 地點口語審（57de1709）一起交了 | 進行中（LAWWW） | v1 法律系大一上 |  LAWWW 填表 0.2 小時 | 0.3～0.5h | 一張口味→說法的對照表 |
| AA117-CASE-NOTES-1031（LAWWW 任務，等 AA 的部分） | 朋友的案子手機筆記：C8 的「向誰」要選工作室還是發行商，C5 的「依據」暫用 BB_98 的句子要 AA 確認。LAWWW-B 11-01 05:2x 問的，AA-B 交接裡沒有回覆紀錄（AA_117 最後一次修改是 10-30） | 已整合待測試（LAWWW） | v3 大二 |  LAWWW 改字 0.2 小時 | 0.2～0.4h | 兩格字＋法律核對（LEGAL_REVIEW_REQUIRED），可以和 AA_570 的法服盤點一起做 |
| XINCI-EPI-FEST-1031（LAWWW 任務，等 AA 的部分） | 芯慈交往中五個節日：LAWWW-B 11-01 04:5x 說「5 題技術預設已問 AA-B」，AA-B 交接紀錄和 11-01 06:25 的回覆清單都沒有這 5 題 | 已整合待測試（LAWWW） | v3 大二 |  LAWWW 照答案調整 0～0.5 小時 | 0.3～0.5h | 5 題技術預設的確認，有可能已經口頭回過，要先查 |
| AA267-Y5（LAWWW 任務，等 AA 的部分） | 語彤延畢那一年（2029-09～2030-06）在哪、作息怎麼排；也可以確認照現在一直在臺北、沒有課表 | 待開工（LAWWW） | v5 大四以後 |  LAWWW 0.3～0.7 小時 | 0.3～0.5h | 一份 presence＋作息規格 |
| VAC-B1（LAWWW 任務，等 AA 的部分） | 芷若大一暑假的衝突清單（LAWWW 子代理掃完以後交 AA 裁定）。另外兩題（大一跨年照 AA_432、Kevin 大二那則）AA-B 10-31 20:04 已經回了 | 進行中（LAWWW） | 寒暑假（D99 第二） | LAWWW 還沒交清單 LAWWW 交清單，之後照裁定改 | 0.5～1h | 看清單逐條裁定 |
| V4-R-TW／SYS-05（LAWWW 任務） | 兩列的 next 還寫「C3 2028 校慶海報字等 AA」（10-21）。AA342-COVERAGE-1021 已經是「已整合待測試」，這個說法多半過時，要確認後清掉 | 待開工（LAWWW） | v4 大三（SYS-05 首次出現在 Y0S1） |  LAWWW 改 next 或關單 | 0～0.2h | 查一次海報字有沒有交 |
| AA313-REMAINING-(b) | docs/handoff/audit_1022/AA313_REMAINING_1022.md 的 (b)「要 AA 定的」九點：AA-B 10-23 在 AA_389 全部回了。程式部分 AA389-L-1023、AA389-REST-L-1023、ZR-SENDOFF-L-1023 都已整合；AA_390、AA_400～403 對應的 AA 任務都已驗收 | 已答完（AA 這邊 0 項） | v1～v5（跨學年） |  只剩 BB 測那幾個 LAWWW 任務；AA313-S6 的 6-3 等使用者，不是 AA 的事 | 0～0h | 逐點對過 AA_389 和 tasks.json |
| AA-BOOKKEEPING-1102 | AA 帳號 A 的交接記帳收尾：以安第 2 輪答案寫進共創紀錄和 user_asks_AA；UA-AA-1102-02 現在掛在 HANDOFF-ABC（已驗收），和 status「進行中」對不上，asks 會報異常，要改掛 TAKEOVER-A-1102；UA-AA-1102-01 要等總表開 AA 任務以後改掛 | 待開工 | META |  LAWWW 開 AA570 任務、核對 asks | 0.3～0.8h | 文件和 JSON 小改，跑 asks／roles |

各階段小計：
- v0 經濟系（D99 第一）：0～0.8h 4 項 AA 都已交、已整合（E30、E21a、E21 除夕、E27），AA 0 小時，只在 BB 驗出問題時處理。BB 瀏覽器約 0.5～0.8 小時
- 寒暑假（D99 第二）：4～8.3h VAC-GAP-ROUTES 3.5～6.5 小時（暫停，等使用者或共創告一段落）；VAC-B1 芷若清單 0.5～1 小時（等 LAWWW 交清單）；HOL-VA、HOL-NYE-Y2／Y3／Y4 只差 BB（BB 約 0.75～1.5 小時）
- 美國交換（D99 第三）：0～0.2h US-BLANK-1012-HINT-1027 只差 BB（10～20 分鐘）。美國路線寒暑假的空白算在 VAC-GAP-ROUTES
- X151 讀書／考試／國考／職涯（11-02 新 P0，跨 v1～v5）：30～65h AA_570：盤點中。總表沒有 AA 任務；D14-T5、D14-T6 的 BB_120 台詞定稿、AA117 的法律核對都併在這裡。LAWWW 的 STUDY-EXAM-SYS-1102 和 BB 的 BB_222 驗收另計。重要結局方向要用選擇題問使用者
- v1 法律系大一上：2.6～6.7h HEROINE-LIFE-1028 重讀 2～4 小時、生日 0.3～0.6 小時、TASTE_WORD 0.3～0.5 小時；另外 8 項已整合，只差 BB（BB 約 2～4 小時）
- v3 大二：0.5～0.9h AA117 C8 向誰、芯慈五個節日的 5 題技術預設，都是 LAWWW 在等的小問題
- v4 大三：0.2～0.8h 日本直播旁白 0.2～0.4 小時；LADDER-Y3Y4 只差 BB；V4-R-TW／SYS-05 的「等 AA 海報字」多半過時
- v5 大四以後：0.3～0.8h 語彤延畢那年的 presence 0.3～0.5 小時；AA530 稿已交，剩 LAWWW 實作 1.0～1.6 小時（不算在這裡）
- META：45.8～102.3h DIALOGUE-DEPTH-1031 角色共創 45～100 小時（16 位，每位都要使用者聊天、說「定型了」，共創本身無法估）；ASK-5NAMES 收尾 0.5～1.5 小時；記帳收尾 0.3～0.8 小時

等使用者：
- DIALOGUE-DEPTH-1031：16 位角色都要使用者用選擇題一輪一輪聊，並明確說「這個角色定型了」，AA 才能寫規格、大改那個角色。以安第 2 輪使用者已經答了（選 4），第 3 輪輪到 AA，還沒有任何一位定型
- AA_570（X151）：盤點完以後，涉及重要結局方向的新決策要用選擇題問使用者（D109 的邊界）。例如司法官錄取怎麼和在校學習、國考成績連動（使用者說不能單次考試決定一切）、落榜可以重考幾次、有律師資格又重考司法官時職涯怎麼走。題目要等盤點完才定
- VAC-GAP-ROUTES：恢復條件是使用者說「繼續」，或角色共創告一段落。建議 LAWWW 用選擇題問能不能和共創平行做（這是補新稿、不是重寫台詞）
- 已經不用等使用者、但總表還寫等的：ASK-5NAMES（五個名稱 11-01 23:1x 都答了）、USER-PLAYER-BDAY-1101（使用者交給 AA 挑）、JP-STREAM-LINE-1101（使用者選請 AA 寫）

### BB

BB（測試總監，兼向使用者要 CG／2D 背景）盤點，資料抓到 2026-11-02 04:0x UTC。來源：elegant-brown 的 BB_00（BB-B 交班 22ddbea54）、企劃線 story-planning（BB 帳號 A 03:3x 接班、BB_222、CC 分支 cc-testing 05ded2fb5）、開發分支 confident-ritchie 的 tasks.json、BB_TEST_QUEUE_1027、history_audit/bb_batches.md。另外在 scratch 用開發分支頭重跑了 tools/story/black_bg_audit.js。

重點：
① 總表 BB 名下沒結的有 45 項（進行中 9、待開工 11、已整合待測試 6、等待 19）。其中至少 10 項其實已經做完或圖已經到，總表沒更新：
- QA-PLAYTHROUGH-1018：11-01 02:3x 判 GO，BB_218 L6508。
- RELEASE-9106-TEST：10-23 判 GO，L1895。
- BG-ZQ-STUDIO-1101：ziqing_studio 已到。
- BG-LANTERN-1024：vf_lantern 已到。
- BG-CRAM-1018：cram_class 已到。
- SCN-US-2D／SCN-JP-2D：底圖都在 OUT.BG。
- BG-MISSING-1021：純文字那批交齊。
- PRIV-AUNT：aunt6b／aunt6xb ALL PASS。

② 任務說明裡的前提有一項過時：AA299-IMAGES-1018 第五批 10 張已經全部到了。LAWWW（帳號 A）03:5x 接了 5 張、04:0x 接了另外 5 張，現在只剩 BB 在遊戲裡看畫面。

③ 黑底實際量測：開發分支頭現在是 22 段、119 句，不是 25 段／130 句。另外 scene_bg_keys 的 PENDING 還有 5 個執行時才登記的鍵。

④ 全總表「已整合待測試」776 項，套 BB-C 10-27 的盤點分類：B 類（跑整段流程就能涵蓋）538、C 類（要單獨測）91、10-27 以後新增 144、可以直接結的 3。
- 照 D99／版本分：經濟系 83、寒暑假 41、美國 22、v1 181、v2 53、v3 82、v4 76、v5 87、跨學期 151。
- 經濟系那 62 項大多已經被 QA-PLAYTHROUGH GO 涵蓋，可以先對 BB_218 結案（桌上作業）。

⑤ 估算依據：dyn14 前 261 項（10-30 02:2x～11-01 08:4x）平均約 12～13 分鐘一個情境。低估＝一個情境涵蓋 4～5 項、8 分鐘，約每項 2 分鐘；高估＝一個情境 2.5 項、20 分鐘，加 20% 重跑，約每項 8 分鐘。

⑥ BB／CC 合計還要約 68～185 小時（瀏覽器串行時間＋桌上作業）。分段：
- 接班立即佇列：7.6～17.5h。
- P0 讀書考試職涯驗收：10～20h，有一半要等 LAWWW 的 STUDY-EXAM-SYS-1102 和 AA_570。
- D99 三項：經濟系 2.3～6.8h、寒暑假 2.7～8h、美國 5.1～12.6h。
- 其他學年＋跨學期：34～102h。
- 要圖：4.5～9h，之後等使用者。
- 發布門檻：4.3～6.5h／次。
- CC 在自己的容器跑 SwiftShader，等於多一條線，牆上時間大約可以減半到 40～100h。
- 等使用者的部分（生圖、場景 ART_APPROVED、選擇題）不算 AI 小時。

| 任務 | 內容 | 狀態 | 階段 | 卡在 | 時數 | 依據 |
|---|---|---|---|---|---|---|
| BUG-DOOR-CLASS-GO-1101 | 瀏覽器驗兩處「直接去上課」走到門口會報到（9aa82ecda）：大一上第 4 週週三 13:20 服務學習（一）、大四上週二 13:20 法律倫理 | 已整合待測試（BB-B 交班時排第一；CC 正在做） | 0 接班立即佇列 |  CC 跑完交原始結果，BB 判定後回報 LAWWW | 0.3～0.7h | CC 已寫 test_tools/cc/cc_dl04b_probe.py 的 MODE door（cc-testing 05ded2fb5）；兩個情境各 10～20 分鐘 |
| DL-04B-LATEFIX-444dd616e | 複驗「遲到永遠不會記錄」的修正（classes3d.js:330，LAWWW-B 444dd616e） | 已整合待測試 | 0 接班立即佇列 |  | 0.2～0.5h | CC 探針 MODE latefix；一個情境 |
| DYN14-QUEUE-1101 | BB-B 留下的佇列 37 項：n45_reach（reachability_all 重跑，上次跑到一半不算數）、n44_dl_plain／skipwarn／econ（DL-04B）、n41 十二項（fairwalk、grades_zr、toast_econ、aa208l、dormy34、encb3、y3sumbg、heroine_q、xmas_an／yt、v6b、usfinal）、n42 九項（cbe0429：vac2×4、grades、sisbooks2、walkchat、libdesk、y2end）、n43 十二項（fb1101：BUG-04 sisface、BUG-03 boya101×2、anyt、cg20、y1show、xclove、sisnewyear、usmsg、casenotes、zrqx、l123） | WIP（docs/story_planning/test_tools/dyn14_queue_1101.txt；已跑過的在 .done.txt） | 0 接班立即佇列 |  CC 照 BB 分派跑；BB 判定、回報 LAWWW | 5～12h | 前 261 項平均約 12～13 分鐘一個情境；37 項的 timeout 加總 33 小時是上限；探針都在 test_tools，路徑要改成新的 scratchpad、SHA 改用開發分支頭 |
| B03-PROBE | 補寫 b03_probe 並跑：latefix、AA255（大二下閒聊階梯）、沛珊群組題目、醉月湖夜景、美國第二輪（LAWWW-B 11-01 08:4x 交代） | 沒寫（子代理交班時被停掉，檔案沒寫出來） | 0 接班立即佇列 |  | 1.3～2.7h | 寫探針 0.5～1 小時＋5 個情境各 10～20 分鐘 |
| DL-04B | DL-04B 劇情保護：R2 快速前往（dl04b 第 9 項）、R1 週日住家裡 HOME.dormMiss（dl04b_stayhome）在瀏覽器驗；佇列 n44 以外另外要跑的部分 | 已整合待測試 | 0 接班立即佇列 |  | 0.5～1h | 2～3 個情境 |
| NAMEPLATE-DIR | 共同教學館／社科院名牌方向：走到現場補拍（n40_visuals 的探針找不到名牌） | 未驗證 | 0 接班立即佇列 |  | 0.3～0.6h | 一個走位截圖探針 |
| STUDY-EXAM-CAREER-1102 | 讀書／法律考試／國考／職涯結局驗收（BB_222，使用者 11-02 03:4x 直接派）：①修改前基準盤點 ②驗收計畫（16 條＋D118＋AA_570 多出的要求）③修改前應該 FAIL 的探針 ④修改後實測：9 條學習考試（三週不讀書、一鍵總複習、成績看答題…）、法律服務社不用刷任務、6 條國考職涯路線、回歸（戀愛、課表日曆、快轉寒暑假、存讀檔、其他學年） | 進行中（第 1 步盤點中） | P0 讀書考試國考職涯 | 修改後的實測要等 LAWWW 的 STUDY-EXAM-SYS-1102（進行中，還在現況盤點）和 AA_570 的內容 LAWWW 給候選 SHA；AA 給結局條件與教材 | 10～20h | 盤點 1.5～3h＋計畫 0.5～1h＋寫探針 2～3h＋學習考試 2～4h＋法服 0.5～1h＋六條職涯路線（畢業以後的存檔前置）2～4h＋回歸 3～5h |
| QA-PLAYTHROUGH-1018 | 經濟系四種玩法從頭玩到法律系開學 | 總表寫進行中；實際 11-01 02:3x 判 GO（基準 39f68236c，BB_218 L6508） | D99-1 經濟系 |  LAWWW 結案 | 0～0.2h | 只差 LAWWW 改總表；outbox_BB 已登記 |
| HA-BB-ECON | 已整合待測試的經濟系批次 83 項：② 62、新② 5（AA529-ECON-FIX-1030、CLASS-TEACHER-1027、CROWD-CLASS-ARRIVE-1027、WORLD-RENAME-1030…）、②＋大一上 5、C 類 Y0S1 11 | 已整合待測試 | D99-1 經濟系 |  LAWWW 照 judgments 改總表 | 2～6h | 62 項大多被 QA-PLAYTHROUGH GO、v0start／v0home 涵蓋：先對 BB_218 寫 judgments_BB.jsonl（1～1.5h），剩約 20～35 項要補跑（每項 2～8 分鐘） |
| ART-CG-ECONCAMP | 經濟系宿營 CG 在遊戲裡實際看一次 | 已整合待測試 | D99-1 經濟系 |  | 0.1～0.3h | 併進經濟系那一批 |
| ECON-ART-USERLOOK | BG-HOME-1018、BG-CAMP-1018、CG-NOPERSON-1018、ART-KH-BUS、BG-CRAM-1018：圖都已經進 OUT.BG（home_*、camp_* 13 張、kh_*、cram_class），BB 在遊戲裡各看一次，列給使用者看 | 等待其他AI／素材（實際：圖已到，等使用者標 ART_APPROVED） | D99-1 經濟系 | 場景 ART_APPROVED 只有使用者能標（docs/handoff/USER_ART_REVIEW_1027.md） 使用者看圖 | 0.3～0.6h | 截圖探針 |
| HA-BB-VAC | 寒暑假批次 41 項（③ 29＋新③ 12：VAC-GAP-1031、VAC-GAP2-1031、AA532／533-VAC-FIX-1030、X58-REST-1027…） | 已整合待測試 | D99-2 寒暑假 |  | 2～6h | 每項 2～8 分鐘＋桌上作業 0.5h；VAC-GAP 第一批五項 BB-B 已經 PASS |
| BB-TEST-VAC-C16-C18-1021 | 瀏覽器驗 C16 法扶實習、C17 律所暑期實習、C18／C18W 海外見習團 | 待開工 | D99-2 寒暑假 |  | 0.5～1.5h | 3～4 個情境 |
| BB198-VACB22 | BB_198 假期空白補規劃：對照 7-2 的新事件哪些已經被 VAC-GAP 實作 | 進行中（台詞歸 AA、實作歸 LAWWW） | D99-2 寒暑假 | 7-2 新事件要 AA 寫台詞、LAWWW 實作 | 0.2～0.5h | 桌上對照 |
| BB-TEST-US-LIFE-1021 | 美國交換那一學期的系統驗收（BB_US_LIFE_1021 US-A～US-J＋R2Y4 美國段，共 28 情境：日曆、一鍵上課、快轉摘要、時差、不能約台灣朋友、回程） | 待開工（n38_uslife 排過，結果沒寫進 BB_218；後來讓位給 P1） | D99-3 美國交換 |  | 4～9h | 28 個情境，每個 8～20 分鐘 |
| HA-BB-US | 美國批次 22 項（④ 8＋新④ 14：AA531-US-FIX-1030、AA479-US-FIX-1027、SIS-B14、US-APT-CLOSET-1027…）跑完 US-LIFE 以後剩下的 | 已整合待測試 | D99-3 美國交換 |  | 0.8～3h | 大部分和 US-LIFE 重疊 |
| SCN-US-CG | 美國篇 CG（frozen_lake、us_kitchen、bus_station、chicago、snow_steps、last_dinner）在遊戲裡實際看 | 已整合待測試 | D99-3 美國交換 | BCG-31 送機夏天版沒圖（y34b3d.js S.BCG31 沒登錄就不放） 使用者生 BCG-31 夏天版（有人物） | 0.3～0.6h | CG 截圖探針 |
| HA-BB-V1 | 大一上 181 項：① 35、⑩Y1S1 31、新⑩Y1S1 57（HEROINE-ASKS-1028、PHONE-UNIFY-1030、DORM203-MATES-1028、CROWD-DEPTS-1028、BUG-03、BUG-04…）、C 類 38、⑧ 上課考試 20 | 已整合待測試 | v1 大一上 |  | 6.5～26h | 每項 2～8 分鐘，其中約 20% 可以用 BB-C／BB-B 舊 PASS 結案；⑧ 和 STUDY-EXAM 重疊 |
| BB-TEST-AA355-358-1021 | 可以錯過的事不被說成發生過（有走到、沒走到兩種玩法） | 待開工 | v1 大一上 |  | 1～2.5h | 兩種玩法，每種約 10 個檢查點 |
| QA-REPRO-1020 | 使用者 10-20 回報 X64～X81 的逐項狀態表（補兩項 NOT TESTED） | 進行中 | v1 大一上 |  | 0.5～1.5h | 大多已被後續版本涵蓋，主要是桌上作業＋1～2 個重跑 |
| BB-QUEUE-1027 | BB_TEST_QUEUE_1027（第 1～6a 節）：BB-C／BB-B 已經跑掉大部分（5p、5k、5h、5q、A21、R43、aunt6…），對照後把剩下的併進各學年批次 | 待開工（實際大部分已跑） | v1 大一上 |  | 0.5～1h | 桌上對照；R44 學姊第十二批 43 情境沒有結果，算在 v3 |
| RELEASE-9106-TEST | v9.10.6 驗收 | 總表寫進行中；實際 10-23 判 GO（9f9e13cc，BB_218 L1895），v9.10.6 已發布 | v1 大一上 |  LAWWW 結案 | 0～0h | 只差 LAWWW 結案 |
| ART-15 | v3～v6 CG 在遊戲裡的實際畫面 | 已整合待測試 | v1 大一上 | CG-10b 傘圖層、BCG-31 夏天版沒圖 使用者生圖 | 0.3～0.6h | CG 截圖探針 |
| HA-BB-V2 | 大一下 53 項（⑩Y1S2 38＋新 5＋C 類 10） | 已整合待測試 | v2 大一下 |  | 2.3～7.6h | 每項 2～8 分鐘 |
| BB-TEST-AA360-1021 | 子晴 Q12《九點以後》、學姊路過總圖與計畫本、芷若 Z7 家裡版、子晴 Q4 錯過版 | 待開工 | v2 大一下 |  | 0.7～1.5h | 4 個情境 |
| BCG-46 | 班級合照 CG 在 ev_term_last_meal 實際看一次 | 已整合待測試 | v2 大一下 |  | 0.1～0.3h | 1 個情境 |
| HA-BB-V3 | 大二 82 項（⑩Y2S1 46、⑩Y2S2 23、C 類 13；含 SIS-B13、AA255-Y2S2、DORM-Y24、KX-MOOT3）＋R44 學姊第十二批 43 情境（BB-C 寫好沒有結果） | 已整合待測試 | v3 大二 |  | 3.4～11.7h | 每項 2～8 分鐘 |
| HA-BB-V4 | 大三 76 項（⑩Y3S1 39、⑩Y3S2 16、⑤ 日本路線 13、C 類 8；含 JP-AIR-RESUME-1027、VAC-A2） | 已整合待測試 | v4 大三 |  | 3.2～10.9h | 每項 2～8 分鐘 |
| BB-TEST-SIS-B6-1023 | 學姊第六批：10-23 線 5 跑過（B6_SEND_CAR／NO、LIB_HINT、DAD_MET PASS），腳本問題的 b6r／b6er 重跑沒有結果 | 待開工（實際部分 PASS） | v4 大三 |  | 1～2h | 9 個重跑情境；community_room、botanical_lotus 底圖已到 |
| SCN-JP-CG | 日本線 CG-13、17、22 在遊戲裡看；BG-LANTERN（vf_lantern 已到）一起看 | 已整合待測試 | v4 大三 | 臺中情人節那張 CG 等節日事件 | 0.3～0.7h | 截圖探針 |
| HA-BB-V5 | 大四以後 87 項（⑩Y4S1 29、⑩Y4S2 26、⑥ 畢業以後 21、C 類 11；含 SIS-B16、AA121-CG20、CIRCLE3D-Y4） | 已整合待測試 | v5 大四／畢業以後 |  | 3.7～12.5h | 每項 2～8 分鐘；⑥ 有一部分 R43 已經跑過 |
| BB-TEST-Y5-1021 | AA_357 大五上：退宿後的家、年級、美國補修、跳日期、2029 中秋、可昕第五年、2030 報名、期末約會 | 待開工 | v5 大四／畢業以後 |  | 1～2.5h | 8 個檢查點，有一部分和 R43／PG-FIX 重疊 |
| SCN-V5-03 | 尾聲長桌（兩點半 Café＋CG-10） | 已整合待測試 | v5 大四／畢業以後 |  | 0.2～0.5h | 1～2 個情境（要尾聲存檔） |
| HA-BB-CROSS | 跨學期 151 項：⑦ 戀愛線 25、⑨ 約會地點 D01～D32 共 57、⑪ 街區店家 22、⑫＋新⑫ 場景座位與 LAWWW2 美術 41（光照烘焙、LOBBY-CEIL、CAFE-WINDOW-LIVE、DORM203-LM…）、可以直接結的 3、沒有學期的 3 | 已整合待測試 | 跨學期巡迴 |  | 6～21h | 每項 2～8 分鐘＋桌上作業 1h；⑫ 用截圖探針一次拍多處 |
| AA299-IMAGES-1018 | 第五批 10 張在遊戲裡看畫面：gym_pool、ziqing_studio、tc_schoolroad、court_hall、radio_room、welfare_room、phil_cafe、psy_lab、jp_eatery、jp_intl_office | 圖已全部到、LAWWW 已接（帳號 A 03:5x、04:0x）；只剩 BB 看畫面（總表負責人是 LAWWW） | 向使用者要圖 |  | 0.5～1h | 一支探針觸發 10 個事件的 ADV 背景、截圖 |
| BG-ZQ-STUDIO-1101 | 子晴工作室深夜的 2D 背景 | 總表寫待開工；實際 ziqing_studio 已到、已接（第五批第 2 張） | 向使用者要圖 |  LAWWW 結案 | 0.1～0.1h | 併進上面的畫面檢查 |
| BLACK-BG-AUDIT-1018 | 黑底剩 22 段、119 句（開發分支頭 04:01Z 重跑結果）。要使用者附 3D 截圖生的約 10～11 張：新體育館球場（4 個事件共 34 句）、兩點半 Café 門口夜景（21 句）、法律系館B大廳、新體育館門口、us_c_door、law_courtyard、boya_201、linze_201（晚上）、putong_empty、ntu_gate。LAWWW 用現有圖改代號就能補的：臺北的家（ev_jpp_* 13 句）、日本便利商店（7 句）、海之日、麵店情人節、旅館門口、考場 | 待開工 | 向使用者要圖 | 生圖要等使用者 使用者生圖；電話場景要不要圖用選擇題問 | 2～4h | bg3d_probe 截 10 處（1 fps，1～2h）＋寫 10 組提示詞（0.5～1h）＋給 LAWWW 的改代號清單（0.3～0.5h） |
| BG-3DSHOT-1021 | 有 3D 的地方附遊戲截圖重出提示詞（加 ntu_gate、wancai_lobby） | 進行中（bg3d_probe 寫好沒跑） | 向使用者要圖 |  | 0～0.3h | 併進 BLACK-BG-AUDIT 那批 3D 截圖 |
| BG-US-SEASON-1024+SCN-V4 | 純文字場景還缺的：us_farmers_market（現在暫借 us_chapel_steps）、us_lake_summer、us_lake_bare（BG-US-SEASON-1024）、gongguan_market、gongguan_cobbler（SCN-V4-03）、court_criminal（SCN-V4-02，或改用已到的 court_hall） | 等待其他AI／素材 | 向使用者要圖 | 等使用者生圖；court_criminal 要不要另外畫要 AA／LAWWW 決定 使用者生圖 | 0.5～1h | 一批純文字提示詞（D97 一次 10 組） |
| CHAR-IMG-ROUND | 有人物的那一輪（X94 緩緩）：Kevin 立繪（CAMP-PORTRAITS-1018）、ART-16 七組立繪、何俊朗與學姊羽絨外套（SCN-US-CH）、BCG-31 夏天版、CG-10b、芯慈 CG（第 101 組）、其他角色表情（BB_219） | 待開工／等待 | 向使用者要圖 | 使用者說有人物的緩緩，要使用者同意開這一輪 使用者決定時機並生圖 | 1～2h | 寫提示詞＋傳參考圖檔（SendUserFile attach） |
| IMG-ARRIVAL-CHECK | 使用者生的圖到了以後逐批檢查（品牌標誌、深色木地板、構圖）交給 LAWWW 接 | 持續 | 向使用者要圖 | 等圖 | 0.5～1h | 每批 10 張約 0.3～0.5h |
| USER-ART-REVIEW | ART-14 約會底圖、ART-BG09／10／12、BB-C08-12、BG-VAC-C16-C18-1021、ART-KH-BUS 等：圖都在，只差使用者標場景 ART_APPROVED | 等待其他AI／素材 | 向使用者要圖 | 只有使用者能標 使用者看圖 | 0～0.3h | 清單已經在 docs/handoff/USER_ART_REVIEW_1027.md |
| ART-BG-AA185 | 老國小操場、視訊的國外住處、日本教室（LAWWW2 分支上有三張） | 待開工 | 向使用者要圖 |  | 0～0.2h | 現在沒有戲用到，不用要圖；有戲要用時再看 |
| RELEASE-GATE-NEXT | 下一版（v9.10.16 起）發布門檻：relsuite＋save_compat＋main_day12＋這一版的新功能，給 GO／NO-GO；發布後 main 跑 deploy_check | 還沒派（等 LAWWW 給候選 SHA） | 發布門檻 | LAWWW 給候選 | 4.3～6.5h | 過去的發布前清單（f54a35ec4 663 項、da50fbdc1 750 項）約 4～6 小時串行；deploy_check 0.3～0.5h |
| BACKLOG-SWEEP-BB-1021 | BB 自主驗收總項（上面各學年批次的總稱）＋總表清理：把已經 PASS、圖已到的 BB 項目列給 LAWWW 結案（QA-PLAYTHROUGH、RELEASE-9106、BG-ZQ-STUDIO、BG-LANTERN、BG-CRAM、BG-MISSING、SCN-US-2D、SCN-JP-2D、可以直接結的 3 項） | 進行中 | 總表清理 |  LAWWW 改 tasks.json | 1～2h | 桌上對照 BB_218、OUT.BG |

各階段小計：
- 0 接班立即佇列：7.6～17.5h BUG-DOOR-CLASS-GO-1101 兩處（CC 已寫探針）、遲到修正、dyn14 佇列 37 項、b03_probe、DL-04B 其餘、名牌補拍
- P0 讀書考試國考職涯：10～20h BB_222；修改前盤點和計畫現在就能做，修改後的實測要等 LAWWW 的 STUDY-EXAM-SYS-1102 和 AA_570
- D99-1 經濟系：2.3～6.8h 83 項，大多被 QA-PLAYTHROUGH GO（11-01）涵蓋，先桌上結案；場景圖只差使用者標 ART_APPROVED
- D99-2 寒暑假：2.7～8h 41 項＋C16～C18 實習與見習團
- D99-3 美國交換：5.1～12.6h BB-TEST-US-LIFE-1021 的 28 情境是大宗，再加 22 項批次和 CG；BCG-31 夏天版等使用者
- v1 大一上：8.8～31.6h 181 項，最大的一批；含 10-27 以後的大型系統（她們主動約、手機統一、室友、路人分科系）
- v2 大一下：3.1～9.4h 53 項＋AA360、班級合照 CG
- v3 大二：3.4～11.7h 82 項＋R44 學姊第十二批 43 情境
- v4 大三（臺灣／日本）：4.5～13.6h 76 項＋學姊第六批重跑＋日本 CG
- v5 大四／畢業以後：4.9～15.5h 87 項＋大五上 AA_357＋尾聲長桌
- 跨學期巡迴：6～21h 戀愛線、約會地點 32 處、街區店家、場景座位與 LAWWW2 光照烘焙，共 151 項
- 向使用者要圖：4.6～9.9h BB 寫提示詞、截圖、檢查的時間；生圖和 ART_APPROVED 等使用者，不算在內。第五批 10 張已到
- 發布門檻：4.3～6.5h 每發布一次一輪
- 總表清理：1～2h 已 PASS 或圖已到的 BB 項目列給 LAWWW 結案

等使用者：
- 附 3D 截圖的那批（X93）約 10～11 張要使用者生：新體育館球場（ev_zhe_game_y2、ev_final_game_y3、ev_last_game_y4、ev_b106_42_game，共 34 句黑底）、兩點半 Café 門口夜景（ev_sis_xmas_y2，21 句）、法律系館B大廳（ev_concert_y4）、新體育館門口（ev_sis16_swim）、us_c_door（ev_sis14_day40）、law_courtyard、boya_201、linze_201（晚上）、putong_empty、ntu_gate；BB 先截圖、寫提示詞
- 純文字場景還缺：us_farmers_market（現在暫借 us_chapel_steps）、us_lake_summer、us_lake_bare（BG-US-SEASON-1024）、gongguan_market、gongguan_cobbler（SCN-V4-03）、court_criminal（SCN-V4-02；或改用已到的 court_hall）
- 有人物的圖（使用者說「有人物的緩緩」，要使用者同意才開這一輪）：Kevin 立繪（CAMP-PORTRAITS-1018）、ART-16 七組立繪（學姊西裝／學士服／碩一／羽絨外套、子晴爸爸、溫爸溫媽、何俊朗、芷若學士服、沛珊圍裙、以安冬裝）、BCG-31 送機夏天版（沒圖遊戲就不放這張 CG）、CG-10b 傘圖層、芯慈 CG（第 101 組）、其他角色表情（BB_219）
- 場景 ART_APPROVED 只有使用者能標：docs/handoff/USER_ART_REVIEW_1027.md（ART-14 約會底圖 33 張、ART-BG09／10／12、ART-KH-BUS、BG-HOME-1018、BG-CAMP-1018、CG-NOPERSON-1018、BG-VAC-C16-C18-1021、BB-C08-12）
- 選擇題要問：電話場景（例如 ev_sis14_call0803，8 句）要不要底圖；已經通過、但地板是中深色木頭的 8 張 2D（gongguan_cake、sf_bookstore、boardgame_gg、us_club_lounge、home_room_day／night、home_guest_night、jp_kitchen）要不要重生（D112）
- UA-BB-1102-03（暫停）：使用者問能不能用自己的 Windows 電腦幫忙測，要決定怎麼參與。照工具說明，Remote Control 資料夾只支援 Mac／Linux，Windows 可能只能用手動實機試玩回報的方式

