# D118 法律學習、考試、畢業後職涯：現況盤點、分工與實作計畫

> 任務 STUDY-EXAM-SYS-1102（LAWWW）、STUDY-EXAM-STORY-1102（AA）、STUDY-EXAM-CAREER-1102（BB）；USER_WANTS X151；使用者 2026-11-02 03:5x（CLAUDE.md「P0 永久規則：法律學習、考試、畢業後職涯」）。

> 來源：LAWWW 唯讀盤點 workflow（六個面向各一位盤點、一位設計、兩位反向查證；開發分支 74e3c9a8b 讀碼，2026-11-02 04:4x 完成）；對照 BB_222（BB 基準）、AA_572（AA 企劃側盤點，企劃線 2d45302a）——三份結論一致。

> 驗收只看玩家在遊戲裡能不能：讀書（看得到進度）→ 一鍵總複習 → 考試（照答題）→ 畢業 → 國考 → 走到對應結局。文件寫多少不算。

## 0. 結論

D118 盤點結論：法律課的成績已經只看答對題數（CLS.scoreOf），這一塊不用重做。真正缺的有五樣：(1) 一鍵總複習；(2) 每科「觀念」的掌握進度；(3) 給沒有法律背景玩家的白話教材（約 60% 考題的答案在遊戲裡從沒出現過）；(4) 司法官錄取、司法官重考的整條路線（現在 postgrad3d.js 寫死「司法官二試：未錄取」）；(5) 有律師證照就保證有律師結局（現在由 careerLean 的累計次數決定）。
違反 D118、要拔掉的隱藏累計有：careerLean 的 B 算「自習每 10 小時 +1」、A 算法服週六次數且沒有上限；研究所筆試看總圖待滿 24 天；法服大二起每兩週一次的值班出發選單，加上「連續三次沒去，柏翰私訊」；R.prep 決定成績或旁白的例外課（日本補修 civpro_2_re、insurance_re、法律專題研究、法律實習、非法律課在考試週的假考試）。
另有一個已用 probe 確認的卡死：2030 年要考的人錯過一試，尾聲永遠不觸發。
計畫分 11 批，每批都能單獨發布，LAWWW 約 23 小時。AA 要寫 252 張觀念卡＋336 則題目解說，以及六條路線缺的結局稿。LAWWW2 這次不用派工。有 4 個問題要問使用者（應屆能否考上司法官、司法官分不分法官／檢察官、期中考算不算成績、大四下被當要不要擋當年國考）。

## 1. 逐條需求對照

| 需求 | 現況 | 現在 | 要改 | 誰 |
|---|---|---|---|---|
| ①-1 不強迫每天讀書：沒有知識衰退、連續天數、體力或壓力懲罰 | 已有 | LEGAL 狀態不會隨時間下降，只有答錯才變「混淆」。體力固定 100。翹課明寫「記沒去，不扣分」。讀書次數只換加分台詞（GRADES.onStudy／studyN）。<br>（src/legal3d.js:14-17；src/game3d.js:10、migrate s.energy=100；src/classes3d.js:999；src/grades3d.js:35-42） | 不改。之後做總複習、進度頁時，任何新欄位都不准衰退。補一支守護測試：21 天只約會，掌握度、筆記、關係都不下降。 | LAWWW（單元測試）／BB（瀏覽器回歸） |
| ①-2 三週都在約會，不能被隱藏累計懲罰：職涯傾向 | 違反 D118 | careerLean 的 B＝讀書會出席＋floor(法律系起的自習時數/10)；A＝LAWCLUB_SAT_VISITS×1，沒有上限。兩者決定 S.path 的結局落點。<br>（src/story3d.js:3942-3957（:3951 A、:3952 B）；src/postgrad3d.js:91-95） | careerLean v2：B 拿掉自習時數，讀書會出席封頂 3，另加「大一～大三期末平均答對≥4（R2Y4A.pushLevel==='high'）＋2」。A 改成「加入法服＋2」再加固定法服劇情場次（最多 4），不再累加值班次數。記 CAREER_LEAN_V=2。 | LAWWW |
| ①-3 三週都在約會，不能被隱藏累計懲罰：研究所筆試 | 違反 D118 | 研究所筆試照 2028-09-04～2029-02-02 在總圖、法圖待了幾天判定（≥24 天就上）。2030 年交換延畢的人也一樣看天數。<br>（src/r2y4a3d.js:254-256 libDays／gradExamPass；src/r2y4b3d.js:96 gradPass2029、:328 gradPass2030） | 改成實際作答：考 10 題，從公法題庫（const_1、const_2、admin_law、admin_remedy）用 examSeed＋'grad:'+年 抽，答對 ≥6 題錄取。考前可以做總複習。已經存下 GRAD_EXAM_2029_PASS 的存檔照舊。 | LAWWW（程式）／AA（考場台詞、確認題目範圍） |
| ①-4 能自由安排生活、旅行（考試週的限制） | 部分 | 整個考試週（第 8～9、16 週）都不能排一日遊、兩天一夜，也不能遠程自由出遊。<br>（src/date3d.js:247；src/freetrip3d.js:37-38；tests/date_examweek_unit.js） | 放寬成只擋「自己有考試的那一天和前一天」，半日約會、晚上照常。這是 AA_126 1-1 的舊規則，AA 同意後由 LAWWW 改，並同步改 date_examweek_unit、dl06_trip_unit。 | LAWWW／AA（確認） |
| ②-1 真正可玩的法律學習（不只是累積讀書天數或點數） | 部分 | 讀書＝R.prep+1、一則黑板三行的筆記；只有刑訴會跑 LEGAL.study。其他 29 門法律課沒有「學會了沒」的紀錄。<br>（src/game3d.js:290-311 studySession；src/classes3d.js:515-519、:585-589；src/legal3d.js:20） | 新增觀念卡資料層 STUDY（src/study3d.js＋src/data/study_units.js）：每科每週一張卡，對到該週的考題。上課、自習、課堂提問、考試、總複習都會更新卡片狀態。 | LAWWW（系統）／AA（觀念卡內容） |
| ②-2 讀書時顯示學習進度（掌握了哪些法律知識） | 部分 | 「法律」頁只列有出席的週次標題，外加刑訴題目的狀態數；準備次數不顯示；沒有每一科的掌握度。<br>（src/game3d.js:454-466 renderLegal；src/classes3d.js:212-217 legalCourses（只讀 R.done）） | 「法律」頁每一科顯示「考試範圍：觀念讀過 x／y、答對過 z」，點開列出每張卡。讀書、總複習結束時的字幕也加這一行。資料來源同時看出席和自習。 | LAWWW |
| ②-3 期末考前的一鍵總複習 | 沒有 | src、index.html 搜「總複習」都是 0 筆。<br>（grep 總複習：0 筆；src/classes3d.js:1103 slotCap） | 新增 STUDY.review(GM,'final')：第 15、16 週在任何讀書地點都可以叫出來。按一次就涵蓋這學期全部要期末考的課（含重修）。遊戲時間耗 3 小時，不佔 DL-03 時段次數，不用跨天。 | LAWWW（系統）／AA（入口與結束的台詞） |
| ②-4 期中考前的一鍵總複習 | 沒有 | 期中週（第 8～9 週）照樣抽五題，但沒有任何複習功能。<br>（src/classes3d.js:527、:563） | 同一個 STUDY.review(GM,'mid')，第 7～9 週開放，範圍到第 7 週。期中考要不要計分另外問使用者。 | LAWWW |
| ②-5 不需要每天反覆點、不強迫連續多天操作 | 部分 | 一小時只多一週的筆記，一次最多讀 3 小時；讀完一科 13 週至少要 5 次自習，四到六科要好幾天。<br>（src/classes3d.js:587、:1091-1108、:1125） | 總複習一次就讀完範圍內全部的卡。平常的自習照舊可用，但不再是唯一途徑。 | LAWWW |
| ②-6 沒有法律背景也能理解概念並答題 | 部分 | 399 題只有 134 題有解析，刑訴 QBANK 只有 13 題有考點；粗估約 60% 考題的答案在遊戲裡從沒出現過；大一～大三不顯示法條。<br>（src/data/exam_bank.js（explanation 134／399）；src/data/legal_qbank.js（core 13／84）；比對結果 112／399） | AA 寫 252 張觀念卡的白話解說，並補 265＋71 題的解說。題目和答案一字不改，每一題都要能在某一張卡找到依據。BB 用 coverage 工具驗證。 | AA（內容）／LAWWW（比對工具 tools/study/coverage.py）／BB（驗收） |
| ②-7 所有教室都看得到課堂內容 | 部分 | 黑板只畫在霖澤館 201 的 3D 黑板上。萬才館多功能教室、霖澤館 202、研討室 A 上的 16 門課，整堂看不到黑板。筆記也不收教授那一句。<br>（src/classes3d.js:307 if(!door&&E.zone&&E.zone.setBoard)；src/zones3d.js:1398-1404；:587 筆記只收 board[1..2]） | 沒有 setBoard 的教室，改用字幕顯示黑板三行；筆記改收黑板三行＋教授那一句。不需要 3D 工作。 | LAWWW |
| ②-8 課堂提問的答案之後可以回頭看 | 沒有 | classAsk 只在課堂上講一次，不記筆記；R.ask 只寫、沒有任何地方讀。<br>（src/classes3d.js:592-597、:595） | 課堂提問答完寫進觀念卡（題目、答案、考點）和筆記。總複習時沒去上課的人也看得到。 | LAWWW |
| ②-9 成績以實際答題為核心（法律課期中、期末） | 已有 | 答對 k 題，S.scoreOf＝0／60／70／80／90／100；R.prep、出席都不進分數。書卷獎、GRADES、pushLevel 都讀答對題數。<br>（src/classes3d.js:599、:603-616；src/honor3d.js:16-21；src/grades3d.js:29-32；src/r2y4a3d.js:248-251） | 公式不改。讀書的幫助只有兩種：讀過的卡在考題前給一行「你想起筆記上寫的……」（AA 寫的 cue，不點出選項）；教科書的再選一次（D102）照舊。補一支不變性測試：同一組答案，R.prep、stats.study、觀念卡狀態不同，分數都一樣。 | LAWWW／BB |
| ②-10 不能用讀書次數決定成績（R.prep 的例外課） | 違反 D118 | S.gradeOf(R.prep) 給「很好／不錯／過了」，用在：日本路線大四下的 civpro_2_re、insurance_re；法律專題研究、法律實習；經濟系那一年的必修。<br>（src/classes3d.js:621、:625；src/data/courses.js:123-124） | 日本那兩門補修比照重修：考原課（civpro_2、insurance，Y3S2 題庫）的五題，照答題計分。專題研究、實習改成固定「通過」；經濟系那一年改成固定「及格」，不看次數。 | LAWWW |
| ②-11 非法律課在考試週不能變成照讀書次數判定的假考試 | 違反 D118 | 國文、英文、通識、體育、經濟學原理在考試週變成不能翹、會自動帶進教室的「考試」，旁白照 R.prep，而且那幾堂不算出席。<br>（src/classes3d.js:108 dayItems、:309-310、:331） | 只有 isExamCourse（mc5）的課才標 exam；其他課在考試週照一般上課處理，算出席。 | LAWWW |
| ②-12 期中考名稱一致、地位明確 | 部分 | 起床提示和黑板寫「期中考」，考卷寫「期中練習（不算成績）」。<br>（src/classes3d.js:603-604、:662、:307） | 三處名稱統一。算不算成績照使用者的選擇（user_decisions 第 3 題）。 | LAWWW（使用者選後） |
| ②-13 玩家看不到開發用語（題目不足時） | 部分 | 大四上強制執行法、法律倫理、刑事判決研討的期中題目分別只有 3、3、4 題，玩家會看到「題庫還沒準備好（題目 3／5）」。<br>（src/classes3d.js:605-606） | AA 補 2＋2＋1 題（第 1～7 週範圍，Y4 交叉審）。台詞也改成遊戲內的說法，例如「這一科期中改成課堂討論」。 | AA（補題、台詞）／LAWWW |
| ②-14 自習與總複習的選科清單要完整 | 部分 | studyPick 用 cs.slice(0,6)，大二有 6 門課再加重修時，重修課選不到。<br>（src/classes3d.js:517） | 改成分頁、列出全部；總複習預設全選。 | LAWWW |
| ②-15 出席三堂及格規定（看出席的課） | 部分 | 一學期要出席 3 堂，第一堂課老師會講，第 12 週有提醒。不是每日要求，也不是隱藏的。<br>（src/classes3d.js:530-543；src/honor3d.js:33-37） | 保留（LAWWW 依 D110 判斷這不是每日打卡），寫進 D118 決策列並註明。 | LAWWW（紀錄） |
| ②-16 法律內容不做成 Quiz App（D12）和學習系統並存 | 部分 | D12 是永久規則。<br>（docs/PROJECT_DECISIONS.md:23） | 總複習、觀念卡放在讀書場景、書桌、「法律」頁裡，不另做獨立的刷題畫面；在 D118 決策列註明兩者的關係。 | LAWWW |
| ③-1 司法官結果和在校學習、考試表現、國考成績合理連動 | 沒有 | postgrad3d.js 不讀任何在校資料；司法官永遠落榜。<br>（src/postgrad3d.js:72、:351-353） | 司法官二試變成要作答（10 題，答對 ≥7）。在校基礎當輔助：全部法律科期末平均答對 ≥4 的人門檻降到 6。總複習讀過的範圍給 cue。在校成績永遠不單獨保證錄取。 | LAWWW／AA（題目範圍、台詞） |
| ③-2 不讓單次考試決定所有職涯 | 部分 | 只有一試 20 題要作答，作答只決定律師資格 2029 或 2030 年拿到；職涯落點由累計傾向決定。<br>（src/postgrad3d.js:72、:91-95） | 一試＋二試（司法官）＋最多兩次重考，在校基礎當輔助，最終落點以證照和錄取結果優先（S.path v2）。 | LAWWW |
| ③-3 國考前有學習、總複習內容 | 沒有 | 國考讀書會、總圖 B1 都只有台詞。<br>（src/r2y4b3d.js:84-92；src/postgrad3d.js:313-320） | 國考總複習 STUDY.review(GM,'bar')：一試前一個月起開放，範圍是修過的全部課，考錯過的卡排在前面，耗 6 小時。 | LAWWW |
| ③-4 國考題目只出修過的範圍 | 沒有 | S.pool 從全部 483 題抽，約三分之一是選修課，人在國外那一學期的課也會被抽到。<br>（src/postgrad3d.js:76-85） | 新增 S.poolFor(G)：只收 CLS.takenCourses(G)（有成績單、不在國外的學期）的題目，少於 40 題時退回全部。已經抽好、存進 PG.exam 的題目不重抽。 | LAWWW |
| ③-5 路線(a) 律師考上＋律師職涯結局 | 部分 | 有證照、傾向 A＝A_bar 法扶；但有證照、傾向 C 或 B 的人會走出版社或研究室助理。<br>（src/postgrad3d.js:91-95、:380、:458） | S.path v2：有 BAR_YEAR 就在律師家族裡選——A→A_bar、C＋子晴線→C_zq、B＋研究所錄取→B_grad，其他→新的 L_firm（事務所律師）。 | LAWWW／AA（L_firm 結局稿） |
| ③-6 路線(b) 司法官考上 | 沒有 | 不可能錄取；沒有 JUDGE_YEAR，也沒有司法官的第一份工作和尾聲。<br>（src/postgrad3d.js:351-353；src/data/postgrad_lines.js:173） | 新增司法官二試作答、三試劇情、JUDGE_YEAR、司法官學院的照片卡、J 結局。應屆能不能考上看使用者的選擇。 | LAWWW／AA |
| ③-7 路線(c) 司法官落榜 → 重考 | 沒有 | 拿到律師資格的人（BAR_YEAR 有值）不會再考。<br>（src/postgrad3d.js:70-71） | 12/14 司法官落榜後演一段選擇（AA 寫）：JUDGE_RETAKE=true／false。選重考的人 2030、2031 年各再考一次一試＋司法官二試，同時照樣當律師。 | LAWWW／AA |
| ③-8 路線(d) 有律師資格、司法官落榜 | 部分 | 有，但司法官是固定判落榜；之後不再提曾考過司法官。<br>（src/postgrad3d.js:342-354） | 落榜改照司法官二試作答判定；選擇不重考的人走律師結局，AA 寫一句提到考過司法官的話。 | LAWWW／AA |
| ③-9 路線(e) 重考 → 司法官考上 | 沒有 | 2030 年 k≥16 也照樣落榜。<br>（src/postgrad3d.js:72、:351-353） | 重考年的司法官二試照作答判定，錄取記 JUDGE_YEAR＝2030 或 2031，走 J 結局。 | LAWWW／AA |
| ③-10 路線(f) 重考落榜 → 繼續當律師 | 沒有 | 沒有司法官重考，所以這條不存在。<br>（src/postgrad3d.js:70-72） | 重考到上限仍沒上：一段旁白（AA 寫），然後照律師家族落點走，尾聲加一句「繼續當律師」。 | LAWWW／AA |
| ③-11 司法官落榜不等於人生或遊戲失敗 | 部分 | 沒有 game over，但司法官落榜只有一行系統字加一句旁白；「沒考上不是壞結局」這條原則 10-18 對祐廷劃掉了。<br>（src/data/postgrad_lines.js:173；AA_97 §0-3（企劃線）） | 恢復 AA_97 §0-3 的原則。落榜線要有完整場景和正面的律師結局，台詞照 D116：不比成績、不說教。 | AA／BB（驗收） |
| ③-12 2030 年錯過一試，尾聲不能卡死 | 部分（已確認的 bug） | 錯過 exam_2030 以後，pendingExam 永遠是 true，尾聲永遠不觸發。<br>（src/postgrad3d.js:487、:489、:493-494；scratchpad career_probe.js） | pendingExam 改成「exam_2030 沒有完成也沒有錯過」才等；錯過就當沒考，給一句旁白。 | LAWWW／AA（一句旁白） |
| ③-13 錯過報名、錯過 2029 一試要有回饋 | 部分 | reg 沒有 onMiss；報了名卻錯過一試，整件事悄悄消失，永遠拿不到證照。<br>（src/postgrad3d.js:473、:70、:130） | 錯過報名、錯過一試各給一句旁白，並可以在 2030 年報名（沿用 regScene2030）。 | LAWWW／AA |
| ③-14 大四下被當 → 延畢、取消當年國考（單次考試的影響） | 部分 | 海商法 0 題或缺考，就延畢一年、BAR_REG=false。<br>（src/faildelay3d.js:28-40） | 照使用者的選擇（user_decisions 第 4 題）。有了總複習以後，全猜也被當的情形會大幅減少。 | LAWWW（使用者選後） |
| ④-1 法服沒有反覆的值班迴圈 | 違反 D118 | 大二～大四每個單週週六 8:30 跳出發選單；FAFU_TRK 連續三次沒去，柏翰私訊；8＋8 件個案照值班次數推進。<br>（src/story3d.js:2440-2447、:735-761） | 拿掉 :2443 的自動出發選單和 :2444-2447 的沒去計數、柏翰訊息。個案改成固定日期、只演一次的劇情（AA 挑場次）。萬才館裡自己走進去的旁觀和坐圓桌照舊可以，但不計次數。 | LAWWW／AA |
| ④-2 看過公告不等於加入法服 | 部分（bug） | 看萬才館公告欄或椰林招生攤位就設 F.lawclub=true，大二起被當成社員、拉進法服群組。<br>（src/story3d.js:1287、:1738、:681） | 公告只記 LAWCLUB_NOTICE；fafuMember 改看 CLUB_lawclub_study／／SIS_CLUB_EXPO／／FAFU_SHIFT_N>0；舊存檔要遷移。 | LAWWW |
| ④-3 交換學期不能照算法服 | 部分 | 人在日本、美國的學期，柏翰「你還來嗎」照樣發，FAFU_TRK 照樣累計。<br>（src/story3d.js:681、:2442-2447；src/jp3d.js:308） | ④-1 拿掉迴圈以後這個問題一起消失。固定劇情的條件另外加 CLS.termAway 判斷。 | LAWWW |
| ④-4 法服次數不能影響職涯或尾聲 | 違反 D118 | LAWCLUB_SAT_VISITS 沒有上限，算進 careerLean A 和 footprint。<br>（src/story3d.js:3951；src/postgrad3d.js:435） | careerLean v2 改看加入與否＋固定劇情場次；footprint 的 fafu 改成 min(visits,1)。 | LAWWW |
| ④-5 保留法服的單次劇情（社博、問答攤、阿凱鍵盤、語彤阿姨、溫州街線、SQ02、畢業合照） | 已有 | 都在，而且大多不看次數。<br>（src/data/events.js:391-410、:653-665、:3945-3982；src/data/bbpack_events.js:534-563；src/y2b3d.js:126-162；src/wzlines3d.js:68-93） | 保留。阿凱鍵盤（≥1 次）、y34b 子晴合約選項改看「加入或去過一次」。 | LAWWW |
| ④-6 5/22 語彤阿姨在沒有值班選單後照樣去得了 | 部分 | 現在是借用一般值班出發選單帶玩家過去。<br>（src/y2b3d.js S.auntDue） | 補一個只排一次的出發選單，前一晚由柏翰在群組提醒（AA 寫字）。 | LAWWW／AA |
| ④-7 大一來滿 5 次才有的那一句（次數門檻） | 部分 | LAWCLUB_SAT_FIVE 要大一去滿 5 次。<br>（src/story3d.js:794） | 改成第二次旁觀就說，或改成固定日期（AA 定句子）。 | AA／LAWWW |
| ④-8 讀書會次數門檻（沛珊 P4「我接。」要 5 次，鄰近法服範圍） | 違反 D118 | plgY1Count≥5 才有「我接。」這個選項。<br>（src/data/events.js:3608；src/story3d.js:2860-2863） | 改成大一參加過公法讀書會 ≥1 次（AA 同意後改）。 | LAWWW／AA |
| ⑤-1 決策紀錄逐條寫明取代了哪些舊規則 | 部分 | D118 已登記，但取代範圍只用一句概括，舊決定也沒有標「已變更」。<br>（docs/PROJECT_DECISIONS.md:128；docs/handoff/USER_WANTS.md:294；企劃 00_現行設定總表.md:53、:82） | D118 列補上逐條取代清單（見 superseded_rules）；USER_WANTS 的 D45、J11 列更新；AA 改企劃總表；UA-AA／UA-BB-1102-01 補 wants:X151。 | LAWWW／AA／BB |
| ⑤-2 不能弄壞戀愛、時間、課表、存檔、劇情 | 部分 | 相關的 40 支單元測試基準是 ALL PASS（11 支已實跑）。<br>（regress 盤點的測試清單） | 每一批都跑對應的單元測試；R.exam 的 key、BAR_YEAR 的意思、STORY.onStudy 鏈、PHONE 去重 tag 全部不動；已發的成績單不重算。 | LAWWW／BB |
| ⑤-3 驗收：從新遊戲讀書 → 總複習 → 考試 → 畢業 → 國考 → 結局 | 沒有 | 沒有任何從期末考一路走到尾聲的瀏覽器流程測試。<br>（tests/flow_exam_terms.py 只測到學期考試） | BB 新增 flow_d118_*（大一上的總複習與考試；大四下到尾聲，每條路線各一次）。 | BB（可交 CC 執行） |

### 反向查證更正（verify）

- **③-1「postgrad3d.js 不讀任何在校資料；司法官永遠落榜」（狀態：沒有）**：後半句屬實：司法官二試不管答對幾題都判「未錄取」。前半句不對：職涯落點 S.path 會間接讀在校資料。S.lean 去讀 STORY.careerLean，裡面算了自習時數 stats.study、讀書會出席、及格的通識門數。S.gradAdmit 讀 Y4_PUSH，而推甄 S.pushPass 用的 S.pushLevel 就是大一～大三的期末答對平均，所以 B_grad 其實已經跟在校考試表現掛鉤。正確說法是：在校學習有影響研究所路線和職涯傾向，但完全不影響司法官錄取。這一條應改成「部分」，修法時要一併處理既有的連動，不能當成從零開始。（src/postgrad3d.js:48 S.lean=…STORY.careerLean；:87 S.gradAdmit 讀 F.Y4_PUSH；:91-95 S.path；src/r2y4a3d.js:248-251 S.pushLevel（讀 Y[1-3]S[12]:*:final 的 correct）、:253 S.pushPass；src/story3d.js:3945-3952 careerLean 讀 stats.study、att 的 public_law_group／lawclub_study、COURSES kind general 的成績）
- **①-1「不強迫每天讀書：沒有知識衰退、連續天數、體力或壓力懲罰」（狀態：已有）**：單看 LEGAL 知識狀態和體力是對的：L.mark、L.study 都不會隨天數下降，G.energy 固定 100，events3d.js:76 也註明體力拿掉了。但說成「已有」太強，現行程式至少有四種隱藏的讀書次數或天數累計，結果會影響玩家：①研究所筆試要在總圖待滿 24 天（libDays）；②careerLean 的 B 項算 floor(自習時數/10)；③非法律課考試週的旁白照 R.prep 給，而且那堂不算出席；④法律專題研究、法律實習、日本補修兩門、經濟系必修的成績單照 R.prep 給 S.gradeOf。計畫的 ①-2、①-3、②-10、②-11 自己也列出了這些。①-1 的整體狀態應該是「部分」，不能寫成已符合。（src/legal3d.js:20-24（沒有任何衰退）；src/r2y4a3d.js:255-256 S.libDays／gradExamPass ≥24；src/r2y4b3d.js:96 gradPass2029；src/story3d.js:3945、:3952；src/classes3d.js:309-310（考試週旁白看 R.prep）、:331（else if(!exam) 才加 attend）、:621 S.gradeOf、:625）
- **④-4「LAWCLUB_SAT_VISITS 沒有上限，算進 careerLean A 和 footprint」，一起列為違反 D118**：careerLean 那一半屬實：A 直接加 LAWCLUB_SAT_VISITS，沒有上限，而且會決定 A_bar／A_none 等結局。footprint 那一半誇大了：S.footprint 只決定尾聲桌上擺哪一樣東西（EPI.foot 裡挑次數最多的一項，平手照表的順序），跟職涯、證照、結局分支都無關。而且 cafe、library、noodle 也用同一種次數比較，算是表現玩家足跡的裝飾。footprint 改成 min(visits,1) 不是 D118 的必要修改，甚至會讓常去法服的玩家拿不到法服的物件。（src/story3d.js:3951 const A=(+F.LAWCLUB_SAT_VISITS||0)+…；src/postgrad3d.js:432-436 S.footprint（c.fafu＝LAWCLUB_SAT_VISITS，只回傳 best 的鍵）、:437-438 S.epiItems 只拿它選 EPI.foot 的物件）
- **路線 (a)「有證照、傾向 C 的人會走出版社」**：不完全對。傾向 C 又達成子晴線（S.zqLine：C 最高、子晴 FRIEND 以上、ZQ_CONTRACT 有值）的人走 C_zq，台詞是「我在做遊戲公司的法務」，不是出版社；只有傾向 C 但沒有子晴線的人才走出版社 C。另外要補一點：A、B、C 三項都是 0 的玩家（例如完全沒讀書、沒去法服），top 會變成 B，沒報考研究所時再改看 C>A，0>0 不成立，所以落到 A。有證照的話就走 A_bar（法扶）。全猜也能進律師結局，但這是平手規則碰巧造成的，不是設計出來的。（src/postgrad3d.js:90 S.zqLine、:92 B 沒報研究所改看 C>A（平手給 A）、:95 return S.zqLine(G)?'C_zq':'C'；src/data/postgrad_lines.js:252 last.C_zq『我在做遊戲公司的法務。子晴是我老闆。』、last.C『我在出版社』；src/story3d.js:3954 三項平手時的順序 ['B','A','C']）

## 2. 架構

原則：不另開題庫、不改計分公式、不改 R.exam／BAR_YEAR 的格式和意思。新增的東西只有一個模組 STUDY、一份資料檔，以及 PG 的司法官欄位。

一、觀念卡（學習進度的資料）
- 資料檔 src/data/study_units.js，由 tools/study/build_units.py 產生。來源：EXAM_BANK.questions 的 (course, scopeWeek) 加上 syllabus 的週次，另外合併 AA 企劃檔 AA_57x_觀念卡（要過劇情匯入白名單 story_import_allow.json）。
- 每張卡的欄位：{id:'<course>_w<週>', course, term, week, title:黑板第一行, plain:AA 的白話（3～6 句）, example, cue:一行提醒（不點出選項）, qids:[這一週的 EXAM_BANK 題號], askQid}。
- 刑訴 QBANK 照 category 分成約 10 張卡。
- AA 的稿還沒到時，fallback＝黑板三行＋教授一句＋題目的 core／explanation，所以第一天就能用。
- 目前算出 252 張有考題的卡（30 門 mc5 法律課）。

二、模組 src/study3d.js（全域 STUDY，classic IIFE，在 classes3d 之後載入）
- STUDY.rec(G)：讀到時才補預設 G.study={v:1,u:{},miss:[]}。
- 每張卡的狀態只會往上：未讀 → heard（上過課）→ read（自習或總複習讀過）→ got（課堂提問、考試、國考答對過這張卡的一題）。答錯只把卡片 id 推進 miss，下次總複習排在前面，不扣任何東西。
- STUDY.mark(G,unitId,state,src)。
- STUDY.units(G,course,term,kind)：範圍和 CLS.examPool 相同——期中 ≤7 週、期末 ≤15 週，重修照 rtTerm。
- STUDY.progress(G,course,kind)→{total,read,got}。
- 接點：
  - CLS.attend（:285）→ 這一週的卡 heard。
  - CLS.studyTopic（:585）→ read；筆記也改收黑板三行＋教授那一句。
  - CLS.classAsk（:592）→ 記題目、答案、考點，答對就 got，並 addNote。
  - CLS.runExam（:612 寫 R.exam 之後）→ 逐題回寫 got 或 miss。
  - PG.examDay（:334）→ 一樣回寫。
  - 刑訴的進度讀 LEGAL 狀態（learned 以上算 read、mastered 算 got），LEGAL.study 不動。

三、顯示
- renderLegal（game3d.js:454）每一科一列：「民法總則　期末範圍：讀過 9／15・答對過 6」，點開列出每張卡（標題、白話、課堂提問的答案）。資料來源改成 STUDY，同時涵蓋出席和自習。
- studySession、總複習結束時的字幕加同一行進度。
- 沒有 setBoard 的教室（classes3d.js:307 的 else 分支）用字幕顯示黑板三行。不需要 3D。

四、一鍵總複習 STUDY.review(GM,kind)
- 開放時段：
  - 'mid'：第 7～9 週，到那一科期中考結束為止。
  - 'final'：第 15～16 週。
  - 'bar'：每一場一試前 30 天起。
  - 'grad'：研究所筆試前 30 天起。
- 入口：seatMenu 的讀書座位、宿舍和家裡的書桌、Café 都加一個「考前總複習」；考試週前一週的週日 20:00 發一則系統提醒（不提醒也不扣任何東西）；semff 學期快轉在考前停下時，選單也列出來。
- 按一次的效果：
  1. 先 advance：期中、期末 3 小時，國考 6 小時。不呼叫 slotUse，所以時段次數用完也能做。G.stats.study 照加。
  2. 把這次考試範圍內、全部要考的課（含重修，不受 slice 限制）的卡設成 read。
  3. 開一個翻頁閱讀器：一科一節，每張卡顯示標題、白話、例子、課堂提問（題目、答案、考點），可以「下一張」或「跳到下一科」。跳過也算讀過——D118 要的是讓玩家「有機會」讀完，不是逼他點完。miss 的卡排最前面。
  4. 結束時顯示每科「讀過 x／y」。
- 可以重複做，沒有次數限制，不需要跨天。
- 照常觸發 STORY.onStudy 鏈（GRADES、SISG、mootTogetherCheck），地點照實際讀書的地方記。

五、計分與「準備有沒有用」
- CLS.scoreOf、HONOR.avg、GRADES.lv、pushLevel 全部不改；答對就是答對，有沒有讀過都一樣算。
- 準備的幫助只有兩種：
  - 那一題的卡是 read 以上時，題目前面多一行「（你想起筆記上寫的：<cue>）」。cue 由 AA 寫，只提醒觀念、不點出選項。
  - 教科書的再選一次（D102）照舊。
- R.prep 保留在存檔裡，但不再決定任何成績或旁白：
  - dayItems 只對 isExamCourse 的課標 exam，其他課在考試週照一般上課、算出席。
  - 日本路線的 civpro_2_re、insurance_re 在 isExamCourse／examPool 用 redo 對到原課與原學期的題庫，照答題計分。
  - 專題研究、實習固定「通過」，經濟系那一年固定「及格」。
- 大四上期中題目不足的那句改成遊戲內的說法。

六、拿掉隱藏的累計
- careerLean v2（story3d.js:3942）：
  - A＝(加入法服?2:0)＋FAFU_STORY_SEEN 場次（≤4）＋5·C16＋5·C09＋3·C02＋(YT_LEASE_HELP?3:0)。
  - B＝min(讀書會,3)＋2·gradTalk＋(grad_read_done?2:0)＋4·C10＋(pushLevel==='high'?2:0)。
  - C 不變。
  - 記 CAREER_LEAN_V=2；舊的 CAREER_Y4_BASE 不是 v2 算的，就不用它來比平手。
- 研究所筆試改成作答：gradExamPass、gradPass2029、gradPass2030 改讀 GRAD_SCORE_<年>（10 題公法，答對 ≥6；Y5_DAYS==='study' 的門檻 5；GRAD_RETRY 的台灣路線保證照舊）。已經存下 GRAD_EXAM_2029_PASS 的照舊。
- 法服：
  - 刪掉 phoneRules 的 OUT.plan('fafu_'+day)、FAFU_TRK、柏翰私訊。
  - 新增 FAFU_STORY 表：AA 挑的固定日期場次，每場「一位民眾＋之後一次回訪」，用一次性的 OUT.plan 提醒、錯過就是錯過、不扣分。內容沿用 FAFU_CASES、FAFU_BACK 的字。
  - 公告只記 LAWCLUB_NOTICE；fafuMember 改成看真的加入。
  - 5/22 單獨排一次出發選單。

七、職涯圖（PG，src/postgrad3d.js）
- 2029 年流程：報名 → 一試 20 題（題目來自 S.poolFor(G)，只收修過的課）→ S.tier 不變。
  - both 的人在二試日（10/20）加做「司法官二試」：10 題，從 Y3～Y4 的必修題庫抽，用 examSeed＋'judge:'+年，避開一試的題。
  - 判定：答對 ≥7 錄取；在校基礎好（全部法律科期末平均答對 ≥4，新函式 PG.basis 讀 R.exam 的 final）門檻降到 6。
  - 律師二試照舊一定錄取，BAR_YEAR 的意思完全不變。
- 12/14 放榜：司法官錄取 → JUDGE_PASS_<年>，三試（隔年 1 月）只演劇情、不會被刷掉 → JUDGE_YEAR=年。
- 司法官落榜、有證照：演一段選擇 JUDGE_RETAKE（true／false）。true → 2030、2031 年（JUDGE_TRIES ≤2）只考一試＋司法官二試，同時照律師職涯走。
- 需要的配套：S.Y[2031] 日期表（S.DK 已經算到 2034）、sits／retaker 分成律師和司法官兩套。
- S.path v2：
  - JUDGE_YEAR → 'J'（使用者選分法官、檢察官的話就是 'J_judge'、'J_pros'）；
  - 否則有 BAR_YEAR → A_bar、C_zq、B_grad，其他 → 新的 'L_firm'；
  - 否則照舊的六種。
- 第一份工作（2030-10-01）：已錄取司法官的人顯示司法官學院的卡。重考中的人照律師卡，加一句「司法官明年再考」。EPI.last 在 JUDGE_TRIES>0 時加 AA 寫的一句（路線 d、f）。
- pendingExam 改成看 exam_2030 是否已完成或已錯過（2031 同理）。
- 錯過報名、錯過一試給旁白，並可以在 2030 年報名。
- 國考總複習（'bar'）見第四點。

八、測試骨架
- 每一批都有一支 tests/d118_<批>_unit.js：在改動前的 HEAD 上必須 FAIL，改完 PASS。
- 共用 tests/pg_harness.js 跑國考的六條路線。
- 每一批再交 BB 一個瀏覽器情境（BB 可以交給 CC 執行）。

## 3. 六條職涯路線

| 路線 | 現在 | 計畫 |
|---|---|---|
| (a) 律師考上＋律師職涯結局 | 部分：一試 12 題以上，或 2030 年一律，律師錄取（BAR_YEAR）。但只有 careerLean 的 top 是 A 才走 A_bar（法扶）；傾向 C 走出版社，傾向 B 沒上研究所走研究室助理（postgrad3d.js:91-95）。 | S.path v2：有 BAR_YEAR 一律在律師家族裡選。A→A_bar、C＋子晴線→C_zq（法務）、B＋研究所錄取→B_grad，其他→新的 L_firm（事務所律師）。AA 寫 L_firm 的第一份工作照片卡和尾聲最後一句；B_grad 加一句提到有律師證照。測試：有 BAR_YEAR 時，S.path 一定落在 {A_bar,C_zq,B_grad,L_firm}。 |
| (b) 司法官考上 | 沒有：k≥16 也固定「司法官二試：未錄取」（postgrad_lines.js:173、postgrad3d.js:351-353）；沒有 JUDGE_YEAR，也沒有 J 結局。 | 司法官二試改成作答（10 題，答對 ≥7；在校基礎好的人 ≥6）→ 12/14 錄取 → 隔年 1 月三試只演劇情 → JUDGE_YEAR → 2030-10-01 顯示司法官學院的卡 → 尾聲 J（或照使用者的選擇分法官、檢察官）。應屆能不能考上，看 user_decisions 第 1 題。 |
| (c) 司法官落榜 → 重考 | 沒有：BAR_YEAR 有值的人 S.sits(G,2030) 是 false（postgrad3d.js:70）。 | 12/14 司法官落榜後演一段選擇（AA 寫）：JUDGE_RETAKE。選重考的人 2030、2031 年各再考一試＋司法官二試（JUDGE_TRIES ≤2），重考期間照樣當律師。重考那一年用摘要日的旁白（AA 寫 4～5 張日期卡），國考總複習照樣開放。 |
| (d) 有律師資格、司法官落榜 | 部分：k≥16 的人拿到律師、司法官被固定判落榜；之後不提曾考過司法官，也沒有重考的入口。 | 落榜改照司法官二試的作答判定。選擇不重考的人走律師家族的落點，尾聲加一句 AA 寫的話（考過司法官、現在當律師，正面語氣）。舊存檔 BAR_STAGE_2029='both' 而且已經過了 12/14 的，歸到這條，並補一次重考選擇（如果還在 2030-05 報名之前）。 |
| (e) 重考 → 司法官考上 | 沒有：2030 年 k≥16 一樣落榜。 | 重考年的司法官二試照作答判定，錄取記 JUDGE_YEAR＝2030 或 2031，三試在隔年 1 月。第一份工作那天他已經是律師（照片照律師卡），尾聲走 J。司法官學院兩年，2034 年的尾聲剛好結業，時間線對得上。 |
| (f) 重考落榜 → 繼續當律師 | 沒有：沒有司法官重考。 | JUDGE_TRIES 到上限、仍沒上：一段旁白（AA 寫，不比較、不貶低），JUDGE_RETAKE 改成 'done'，照律師家族落點走，尾聲加一句「繼續當律師」。另外修好卡死：重考那一年錯過一試，當沒考、不卡尾聲。 |

## 4. 批次（每批可以單獨發布；每批一支 tests/d118_<批>_unit.js，改前 FAIL、改後 PASS；BB 瀏覽器情境可交 CC 執行）

### D118-B0｜紀錄與分派：D118 逐條寫明取代範圍、拆任務、派工（LAWWW 0.5～1h）

- 工作：
- PROJECT_DECISIONS D118 列補上逐條取代清單和不取代的部分（D12 並存、D102 保留、出席三堂保留）；舊決定的列標「已變更（D118）」。
- USER_WANTS：D45 列（:294）更新；J11 改成律師、司法官部分恢復。
- tasks.json 在 STUDY-EXAM-SYS-1102 底下建 B1～B10 子任務，xai 欄位寫齊。
- 送 AA 的需求清單（aa_asks），送 BB 每一批的驗收情境。
- 用 send_message 通知同帳號值班中的 AA、BB；不叫醒休班帳號。
- 測試：
python3 tools/handoff/check_handoff.py check、asks、roles 都通過（這批沒有遊戲程式）。
- BB 驗收：不用瀏覽器。BB 只確認 BB_222 第 2 節已經對到 B1～B10 的任務 ID。

### D118-B1｜卡死與考試例外修正（不需要等 AA）（LAWWW 2h；BB 20 分鐘）

- 依賴：無；兩句旁白先用暫定字，AA 之後替換
- 工作：
1. postgrad3d.js:489 的 pendingExam 改看 exam_2030 是否已完成或已錯過；錯過的人給一句旁白。
2. dayItems（classes3d.js:108）只對 isExamCourse 的課標 exam；非法律課在考試週照一般上課、算出席。
3. civpro_2_re、insurance_re 用 redo 對到原課（Y3S2 題庫）的五題考試。
4. 專題研究、實習固定「通過」，經濟系那一年固定「及格」。
5. studyPick 拿掉 slice(0,6)，改分頁。
6. 大四上期中題目不足的提示改成遊戲內的說法。
7. 錯過 2029 報名、錯過一試給旁白，並可以在 2030 年報名。
- 測試：
新增 tests/d118_b1_unit.js：
(a) 重考者錯過 exam_2030 → epi 的 cond 變 true；
(b) 第 8 週國文那一堂不是 exam，而且算出席；
(c) 日本路線 civpro_2_re 抽到 5 題，R.prep=0 和 50 分數相同；
(d) 大二有 6 門課＋重修時，選科清單有那門重修；
(e) 大四上強制執行法期中的字串裡沒有「題庫還沒準備好」。
以上每一項在舊 HEAD 都會 FAIL。
回歸：aa130_exam、retake、epilogue、bar_exam、exam_slots、classes_unit、aa130_curriculum、faildelay、jp 系列。
- BB 驗收：1. 從 2029-08-02 的重考存檔，8/3 整天待在家不去考 → 2030-10-01 第一份工作卡、2034 尾聲照常演出。
2. 大一上第 8 週國文那一堂進教室是一般上課、出席有加。
約 20 分鐘。

### D118-B2｜觀念卡資料層＋「法律」頁的學習進度（LAWWW 3h；BB 25 分鐘）

- 依賴：無（先用 fallback 內容）；AA 的觀念卡之後用白名單匯入、逐學期替換
- 工作：
- tools/study/build_units.py 產生 src/data/study_units.js（252 張卡＋刑訴約 10 張）。
- 新增 src/study3d.js（rec、mark、units、progress、backfill），在 index.html 和 build.py 加入載入順序。
- 接點：attend、studyTopic、classAsk（答案寫進筆記和卡片）、runExam 回寫。
- renderLegal 每一科顯示「讀過 x／y、答對過 z」；studySession 的字幕加進度。
- 沒有 setBoard 的教室用字幕顯示黑板；筆記多收教授那一句。
- 另寫 tools/study/coverage.py：列出每一題對到哪一張卡、哪些題的答案在卡片裡找不到。
- 測試：
新增 tests/d118_b2_unit.js：
(a) 舊存檔（只有 notes、R.done、R.ask、R.exam）backfill 以後，progress 和這些紀錄一致；
(b) 21 天不讀書，progress 不下降；
(c) 課堂提問答完，筆記裡有那一題的答案和考點；
(d) 在 linze_202 上課，字幕會出現黑板第一行；
(e) 每一題 EXAM_BANK 都對得到一張卡。
回歸：legal_page_unit、syllabus_unit、sis_grad_unit、dl03_slots_unit。
- BB 驗收：新遊戲大一上：上兩週課，其中一堂在萬才館多功能教室，再自習一次 → 「法律」頁憲法、民總的進度數字正確；在萬才館看得到黑板內容的字幕。手機直向、橫向各截圖一張。約 25 分鐘。

### D118-B3｜一鍵總複習（期中、期末）（LAWWW 3h；BB 30 分鐘）

- 依賴：B2；入口和結束的 6 句台詞由 AA 寫（先用暫定字）
- 工作：
- STUDY.review(GM,'mid'|'final')：座位、書桌、Café、semff 考前停點都有入口；考試週前一週的週日 20:00 系統提醒。
- 耗 3 小時、不呼叫 slotUse。
- 翻頁閱讀器：重用筆記頁或 ADV 的 DOM，44px 按鈕、safe-area。
- 範圍內的卡全部設成 read，miss 排最前面。
- 照常觸發 STORY.onStudy。
- 測試：
新增 tests/d118_b3_unit.js：
(a) 沒讀過書的存檔在期末考前一晚做一次總複習 → drawExam 會抽到的 5 題，每一題對到的卡都是 read 以上；
(b) 做總複習前後，drawExam 抽到的題號完全相同；
(c) 時段次數已經用完也能做，耗時 3 小時，不跨天；
(d) 有重修課的學期，範圍包含重修課；
(e) 期中範圍只到第 7 週。
- BB 驗收：情境 S1：新遊戲 → 大一上第 1～15 週只約會、出遊、參加社團，不自習 → 第 15 週做一鍵總複習 → 三科期末作答 → 成績單照答對題數 → 成績公布後的人物反應正常 → 存檔、讀檔，進度還在。用 semff 快轉當前置條件，必須標示。約 30 分鐘。

### D118-B4｜考試裡的 cue 和考後訂正（LAWWW 1.5h；BB 15 分鐘）

- 依賴：B2、B3；AA 的 cue 欄位（先用卡片標題當暫定 cue）
- 工作：
- runExam 出題前，如果那一題的卡是 read 以上，多一行「（你想起筆記上寫的：<cue>）」。
- 交卷以後，答錯的題自動寫成一則「考後訂正」筆記，並推進 miss。
- 期中名稱三處統一（算不算成績等使用者的選擇；選「算」的話在這一批一起改 HONOR、GRADES、pushLevel）。
- 測試：
新增 tests/d118_b4_unit.js：
(a) 同一組答案，R.prep 0 和 100、stats.study 0 和 500、卡片狀態全空和全 read → score、HONOR.avg、GRADES.lv 完全相同；
(b) 讀過的卡出 cue、沒讀過的不出；
(c) 答錯的題寫進筆記和 miss。
回歸：honor、aa553_grades、books、retake、r2y4a_events。
- BB 驗收：大一上期末：先總複習再考，畫面出現 cue 行；故意答錯一題，筆記頁有那一題的訂正；分數＝答對題數對應的分數。約 15 分鐘。

### D118-B5a｜法服改純劇情（機制部分）（LAWWW 2h；BB 25 分鐘）

- 依賴：無（BB 確認機制即可）
- 工作：
- 拿掉 phoneRules（story3d.js:2440-2447）的值班出發選單、FAFU_TRK、柏翰私訊。
- 公告只記 LAWCLUB_NOTICE；fafuMember 改看真的加入。
- 舊存檔遷移（見 save_migration）；過期的 'fafu_<day>' planned 出發選單標 cancelled（溫州街線的 silent 選單不動）。
- LAWCLUB_SAT_FIVE 改成第二次旁觀就說；阿凱鍵盤、子晴合約選項改看「加入或去過」。
- 5/22 語彤阿姨單獨排一次出發選單（訊息先用暫定字）。
- 測試：
新增 tests/d118_b5a_unit.js：
(a) 大二社員一整學期都不去 → 沒有任何 fafu_ 出發選單、沒有 fafu_bohan_ 訊息、關係值不變；
(b) 只看過公告 → 大二 fafuMember=false；
(c) 帶 FAFU_TRK、FAFU_OFF、planned fafu_ 的舊存檔讀進來不報錯、不補跳過期選單；
(d) 5/22 社員收到提醒、去得了。
改寫 v3_fafu_duty_unit 第 7 項；回歸 v1f_fafu_sat、y2b_events、bbpack_r2、aa420_wz、aa420_jobs、y34b_events。
- BB 驗收：大二上存檔：連續兩個月週六都睡覺 → 不跳法服選單、沒有柏翰訊息；5/22 收到提醒、去得了、語彤阿姨那一段照常演；日本路線大三下不會收到法服訊息。約 25 分鐘。

### D118-B5b｜法服固定日期劇情場次（LAWWW 1.5h；BB 15 分鐘）

- 依賴：B5a；AA 交 FAFU_STORY 場次表與台詞（aa_asks 第 6 項）
- 工作：
新增 FAFU_STORY 表：每場固定日期、一次性的出發提醒，演「一位民眾＋之後一次回訪」，記 FAFU_STORY_SEEN；交換學期跳過；錯過就是錯過、不扣分。用白名單匯入 AA 的稿。
- 測試：
新增 tests/d118_b5b_unit.js：每一場只演一次；錯過不補、不扣分；人在國外不排；FAFU_STORY_SEEN 正確累計（≤4）。
- BB 驗收：大二上第一場：當天赴約，看到民眾和回訪 → 第二場故意錯過，沒有任何追問訊息。約 15 分鐘。

### D118-B6｜職涯落點 v2：careerLean、律師家族保證、研究所改成作答（LAWWW 2.5h；BB 30 分鐘）

- 依賴：AA：L_firm 結局稿、研究所考場台詞；B5a（法服旗標）
- 工作：
- careerLean v2（拿掉自習時數、法服次數封頂，加 pushLevel）＋CAREER_LEAN_V。
- S.path v2：有 BAR_YEAR 就保證在律師家族，新增 L_firm 和它的 FIRST.me、EPI.last。
- 研究所 gradExamPass、gradPass2029、gradPass2030 改成 10 題公法作答（GRAD_SCORE_<年>），加 'grad' 總複習；舊存檔凍結。
- footprint 的 fafu 封頂。
- 測試：
新增 tests/d118_b6_unit.js：
(a) LAWCLUB_SAT_VISITS 30 和 3、stats.study 500 和 0 → careerLean 相同；
(b) 有 BAR_YEAR、傾向 C、沒有子晴線 → L_firm；
(c) 研究所結果只看 GRAD_SCORE，libDays 0 和 200 結果相同；
(d) 已有 GRAD_EXAM_2029_PASS 的舊存檔結果不變。
改寫 career_lean_unit、epilogue_unit、sister_hotpot_unit、pg_cardline_unit、r2y4a_events_unit、r2y4b_events_unit。
- BB 驗收：大四上存檔（傾向 C、報國考）→ 一路到 2030-10-01 → 第一份工作是律師的卡。另一份存檔報研究所，筆試照作答，答 7 題錄取、答 3 題落榜，尾聲分別正確。約 30 分鐘。

### D118-B7｜國考題目範圍＋國考總複習（LAWWW 2h；BB 20 分鐘）

- 依賴：B3
- 工作：
- 新增 CLS.takenCourses(G)、PG.poolFor(G)（只收修過的課，不在國外的學期，少於 40 題就退回全部）。
- STUDY.review(GM,'bar')：一試前 30 天起開放，耗 6 小時，miss 排最前面。
- PG.examDay 逐題回寫卡片狀態，國考題目也出 cue。
- 測試：
新增 tests/d118_b7_unit.js：
(a) 沒修過證交法的存檔，20 題裡沒有 securities 的題；
(b) 美國路線大四上那一學期的課不會被抽；
(c) 已經存下 PG.exam[2029].qs 的存檔不重抽；
(d) 總複習只有在 7/5 以後才出現。
回歸：bar_exam、aa331_postgrad、postgrad_days、aa382、aa471～473_pg。
- BB 驗收：從 2029-07-10 的存檔：做國考總複習 → 8/4 作答 → 9/7 的結果和答對題數一致。約 20 分鐘。

### D118-B8｜司法官二試、三試、重考：六條路線（LAWWW 3h；BB 2h）

- 依賴：使用者回答 user_decisions 第 1、2 題；AA 的路線稿（aa_asks 第 4 項）；B7
- 工作：
- 新增 JUDGE_SCORE2_<年>、JUDGE_PASS_<年>、JUDGE_YEAR、JUDGE_RETAKE、JUDGE_TRIES；PG.basis（在校基礎）。
- 二試日的司法官作答（10 題）→ 12/14 結果 → 錄取的人三試劇情；落榜的人演重考選擇。
- 新增 S.Y[2031]，sits 分成律師、司法官兩套；pendingExam 擴充到 2031。
- S.path 加 'J'（或 J_judge／J_pros）；第一份工作卡分司法官學院、重考中兩種；EPI 依 JUDGE_TRIES 加一句。
- 舊存檔的 BAR_STAGE='both' 遷移。
- BAR_YEAR 的意思不變。
- 測試：
新增 tests/d118_b8_unit.js：在 pg_harness 上從 2029-05 跑到尾聲，六條路線各一組——
(a) 一試 12～15 題 → L_firm 或 A_bar；
(b) 一試 16＋、二試 8 題 → JUDGE_YEAR=2029、J；
(c)+(e) 二試 4 題 → 選重考 → 2030 二試 8 題 → JUDGE_YEAR=2030；
(d) 二試 4 題 → 不重考 → 律師家族＋那一句；
(f) 2030、2031 都沒上 → 律師家族＋「繼續當律師」。
每一條都檢查：沒有卡死（epi 會觸發）、BAR_YEAR 一定有值；全對、全錯的作答結果不同；讀書天數不影響。
回歸：全部 PG 系列（bar_exam、epilogue、graduation、aa366、aa367 sixOff、pg_an_ex_win、y5_delay 等）。
- BB 驗收：情境 S2（主驗收）：大四下存檔 → 報名 → 國考總複習 → 一試作答 → 二試作答 → 放榜 → 三試或重考選擇 → 第一份工作 → 尾聲。(b)、(c→e)、(d)、(f) 四條各走一次，全程不用 turbo。每條約 30 分鐘，共約 2 小時，可以交給 CC 執行，由 BB 判定 PASS／FAIL。

### D118-B9｜發布 v9.11（D118 學習、考試、職涯）（LAWWW 1.5h；BB 2h）

- 依賴：B1～B8；AA 至少交齊大一上、大一下的觀念卡（其他學期先用 fallback，發布紀錄要寫明）
- 工作：
- 跑 docs/TESTING.md 第五節的發布前清單、check_orphans、check_lines、題目漏收檢查；用 coverage.py 列出還沒有白話卡的科目。
- 開 PR 合併 main，確認 GitHub Pages 線上版本，寫 RELEASES.md：這一版有什麼、沒有什麼（例如大三以後的觀念卡還是 fallback）。
- 回報使用者時先寫「從新遊戲實際玩到哪裡」。
- 測試：
全部 Node 單元測試；發布前清單上的 8 支 Playwright 測試；新的 flow_d118_*。
- BB 驗收：BB 完整回歸：戀愛約會、課表日曆、快轉與寒暑假、存讀檔（v9.10 舊存檔）、經濟系主線、S1＋S2。約 2 小時（BB／CC）。

## 5. 給 AA 的需求

1. 觀念卡白話稿：252 張（30 門 mc5 法律課有考題的週次）＋刑訴 QBANK 約 10 張（照 category 分）。每張寫 plain（3～6 句白話，沒有法律背景也看得懂）、example（一個生活例子）、cue（一行提醒，不點出任何選項）。大一～大三可不可以寫條號，照 AA_570 的規則（必要時問使用者）。照 D81 的順序交件：Y1S1（const_1 9、crim_gen1 8、civ_general 10＝27 張）→ Y1S2（const_2 9、crim_gen2 10、oblig_gen1 10＝29 張）→ Y2S1 → Y2S2 → Y3 → Y4。每學期一個檔，交件附 commit，由 LAWWW 加進 story_import_allow。
2. 題目解說：EXAM_BANK 缺 explanation 的 265 題、QBANK 缺 core 的 71 題，共 336 則。每則 1～3 句，說明為什麼這個答案對；題目、選項、答案一字不改（D12）。每一則都要對到第 1 項的某一張卡。
3. 大四上期中題目補 5 題（Y4_CROSS_REVIEWED，scopeWeek ≤7）：強制執行法 2 題、法律倫理 2 題、刑事判決研討 1 題。另寫一句題目仍不足時的遊戲內說法。
4. 國考與職涯路線稿：
(a) 司法官二試考場 2～3 句；
(b) 12/14 司法官錄取的系統字＋旁白 2 句；
(c) 三試劇情一場（約 8～12 句）；
(d) 司法官學院的第一份工作照片卡 1 張（分法官、檢察官的話是 2 張）；
(e) J 結局的尾聲最後一句 1 句（或 2 句）；
(f) 司法官落榜、有證照時的重考選擇場景一段（約 6～10 句，兩個選項）；
(g) 重考那一年的摘要日期卡 4～5 張；
(h) 重考錄取、重考仍落榜的結果各 2～3 句；
(i) 路線 d、f 的尾聲附加句各 1 句；
(j) 新的 L_firm（事務所律師）第一份工作照片卡 1 張＋尾聲最後一句 1 句；
(k) B_grad 有證照時的附加句 1 句；
(l) 錯過 2029 報名、錯過一試、錯過 2030 一試的旁白各 1 句（共 3 句）；
(m) 朋友在 J 結局的尾聲台詞：阿凱、沛珊各 1 句（可以參考 BB_120 3-3 已作廢的稿）。
全部照 D116：不比成績、不說教；落榜線要是正面的律師人生。
5. 研究所筆試改成作答：確認題目範圍（const_1、const_2、admin_law、admin_remedy），寫考場 2 句、放榜各 1 句。
6. 法服固定劇情：從 FAFU_CASES、FAFU_BACK 挑 4 場（建議 Y2S1、Y2S2、Y3S1、Y4S1 各一場，每場一位民眾＋之後一次回訪）並定日期。另外寫：5/22 前一晚柏翰在群組的提醒 1 則；取代 LAWCLUB_SAT_FIVE（不看次數）的 1 句；確認拿掉柏翰「你還來嗎」那則訊息。
7. 總複習的介面文字：入口標籤 1 個、開始字幕 2 句、每科標題格式、結束字幕 2 句、考試週前週日的系統提醒 1 則、cue 行的固定前綴（例如「你想起筆記上寫的」）確認。
8. 規則同意（每項回一句即可）：考試週約會限制放寬成只擋「考試當天和前一天」（取代 AA_126 1-1）；沛珊 P4「我接。」改成去過 1 次公法讀書會；日本補修兩門改考原課的五題（取代 AA_144 X4「只上課」）。
9. 更新企劃紀錄：00_現行設定總表 第 1、2 節（:53、:82）標「已變更（D118）」；AA_286 第 2 節、AA_319「JUDGE_YEAR 不寫」、AA_327 標已變更；AA_331 第 1 節 b（沒有 2031 年國考）撤回；恢復 AA_97 第 0-3 節的原則；AA_570 第 2 節填上缺口清單（對到本計畫的 B 編號）；user_asks_AA 的 UA-AA-1102-01 補 wants:X151。

## 6. LAWWW2

不用派工（不需要新的 3D；黑板內容用字幕顯示）。

## 7. 被取代的舊規則（D118 優先）

- AA_286 第 2 節與開頭（使用者 10-18：「祐廷12月二試放榜只有考上律師」「應屆沒有司法官才對」，UA-AA-1018-10）：司法官改成看作答，可以錄取；應屆能不能考上，看使用者這次的選擇。
- 企劃 00_現行設定總表.md:53、:82「應屆沒有司法官」：同上，標「已變更（D118）」。
- AA_319「F.JUDGE_YEAR 不寫：祐廷沒有司法官」、AA_327「祐廷沒有司法官」：取代。
- AA_97 第 0-3 節 10-18 劃掉的「沒考上不是壞結局（只用在朋友身上）」：恢復，適用祐廷。
- AA_331 第 1 節 b（AI 解讀、沒有 2031 年國考）：撤回，司法官重考可以到 2031 年。
- AA_126 第 3 節、D74 的國考段「準備值、成績都不算」：部分取代。在校期末答題成績（在校基礎）可以當司法官二試的輔助，不保證錄取（10-14「GPA 高也不保證考上」照舊）。
- AA_185 第 0-3 節「研究所筆試看準備（總圖天數 ≥24）」：取代，改成作答。
- AA_184 第 1 節的法服值班循環（08:30「出發／這週請假」、連續三次沒去柏翰私訊、LAWCLUB_SAT_VISITS 加進落點 A）：取代，改成固定日期的劇情（V1-F、V3-D25、FAFU-1017 的循環部分）。
- AA_315 1A-01 的 careerLean 公式中「自習每 10 小時 B+1」「法服次數 A×1、沒有上限」：取代（careerLean v2）。「只讀劇情與結局、不新增數值玩法」的原則照舊。
- AA_126 第 1-1 節「考試週不能排一日遊、兩天一夜」：建議放寬成只擋考試當天和前一天（等 AA 同意）。
- AA_144 X4「日本補修只上課」與 classes3d.js:621 對這兩門用 S.gradeOf(R.prep)：取代，改考原課的五題。
- plgY1Count≥5 才有沛珊 P4「我接。」（events.js:3608）：取代，改成 ≥1 次（等 AA 同意）。
- USER_WANTS J11（10-18「職涯以後再說」，暫停）：律師、司法官部分恢復；公司法務、合夥開業照舊暫停。
- USER_WANTS.md:294 D45 列「報名就應屆考上律師，作答只決定司法官」：改成 D118 的版本。
- classes3d.js:522 註解「AI 不出題、不補題、不改寫」：已經被 10-16、10-18 的授權取代，順手更新註解（不改程式行為）。
- 不取代、在 D118 列註明並存：D12（不做成 Quiz App，總複習放在讀書場景裡）、D102／X15（教科書再選一次）、D42～D44（被當重修、出席三堂及格、書卷獎）、AA_286 第 2-1 節律師第二年保證錄取（保留，符合「沒考上司法官也能當律師」）。

## 8. 存檔遷移

全部用「讀到時才補預設」，加上 game3d.js:316 migrate 裡一次性的轉換，都不需要玩家重新開始。

1. G.study（新）：STUDY.rec 補成 {v:1,u:{},miss:[]}。第一次讀檔時 backfill 一次（記 G.study.bf=1，重複執行結果相同）：
   - G.notes 的 <course>_w<n> → read；
   - R.done → heard；
   - R.ask 有答過、答對的 → got；
   - R.exam 已答的題 → got 或 miss；
   - 刑訴照 G.legal。

2. R.prep 留在存檔裡不刪，只是不再被成績讀。已經發過的 R.grades[學期] 不重算（classes3d.js:642 照舊）。

3. 日本補修：還沒發成績單、還沒考的才改成五題考試；已經發過的照舊。

4. careerLean：加 CAREER_LEAN_V=2。舊的 CAREER_Y4_BASE 沒有 v2 標記，平手時就不用它（設成 null）；如果還在大四上第 1 週，careerTick 會用新公式重記。

5. 研究所：已經有 GRAD_EXAM_2029_PASS 布林值的照舊。已經過了考試日、但沒有這個值的，用舊規則（libDays）算一次並凍結，避免結果翻轉。還沒考的照新規則（GRAD_SCORE_<年>）。

6. 法服：
   - F.lawclub 為 true，但沒有 CLUB_lawclub_study、SIS_CLUB_EXPO，FAFU_SHIFT_N 也不是 >0 → 改成 LAWCLUB_NOTICE=true、lawclub=false（學姊的記憶改讀 LAWCLUB_NOTICE）。
   - 群組：PHONE 有 leave 就退出 'lawclub_study'；沒有就保留群組，但之後的群組訊息條件改看 fafuMember。
   - FAFU_TRK、FAFU_OFF、FAFU_ROT 保留不讀。
   - G.outings 裡 state 為 planned、id 開頭 'fafu_'、不是溫州街 silent 的未來出發選單 → cancelled。
   - LAWCLUB_SAT_VISITS 保留（只做封頂讀取）。

7. 國考：
   - BAR_YEAR 的意思不變；新增的 JUDGE_* 預設 null。
   - BAR_STAGE_2029='both'：
     - 還沒到二試，或二試還沒演（PG.done 沒有 exam2_2029）→ 照新流程作答。
     - 已經過了二試 → 司法官判落榜（等於舊行為）。如果現在在 2030-05-09 報名之前，補演一次重考選擇；之後就是路線 d。
   - EPILOGUE_DONE 的存檔不動。
   - 已經存下的 PG.exam[年].qs 不重抽（poolFor 只用在新抽題）。
   - PHONE 的去重 tag（pg_r1sys_<年>、pg_r2sys_<年>、gr_*）不換名字，新訊息用新 tag（pg_judge_<年> 等）。

8. 期中考如果改成算成績：只套用在期中還沒考的學期，已經考過的期中仍是練習。

9. 每一批的單元測試都附一份舊存檔 fixture（v9.10 結構）：讀進來不報錯，不補跳過期的選單或訊息。

## 9. 風險

- 1. 總複習把課堂題的答案攤開，期末變太簡單。緩解：本來去上課的人就看過答案（D74、AA_126 已經是「課堂題優先」）；cue 只提醒觀念不給答案；BB 量測總複習後的平均答對數，必要時由 AA 調整 cue。
- 2. AA 的工作量很大（252 張卡＋336 則解說），可能拖住發布。緩解：fallback 內容先上線；照 D81 逐學期交件；每次發布用 coverage.py 寫明哪些科目還是 fallback。
- 3. 動到 S.path、careerLean，連帶改變尾聲各人台詞與姊姊火鍋選項（events.js:4783）。緩解：BAR_YEAR 的意思不變；改寫 career_lean、epilogue、sister_hotpot、pg_cardline 測試；BB 跑六條路線。
- 4. 國考新增 2031 年的日期表：STORY.dayOfKey 只到 2031，可能和日曆、跳時間停點（CLS.STOP_FNS）、每月約會格 sixOff（aa367）衝突。緩解：照 postgrad3d.js:42-46 用 S.DK；跑 aa367_pg_dates、pg_longjump_phone；pendingExam 擴充到 2031 的測試在舊版要 FAIL。
- 5. 拿掉法服的值班選單以後，借它帶玩家過去的劇情（5/22 語彤阿姨、SQ02、pool ZJW）可能失效。緩解：B5a 逐一補一次性的出發選單；溫州街線用自己的 silent 選單、不受影響；跑 y2b_events、aa420_wz、sideq 測試。
- 6. 總複習不佔時段次數，玩家可能拿來刷時間。緩解：它本身沒有任何獎勵可以刷（只把卡片設成 read），耗 3 小時；如果 BB 發現怪現象再加「每天一次」。
- 7. 非法律課考試週改成一般上課，出席數會變多，三堂及格變得更容易。緩解：這是放寬、不是懲罰；honor_unit 的出席提醒要重跑。
- 8. 新的 STUDY 掛進 STORY.onStudy 鏈或 attend，可能打斷 GRADES、SISG、moot。緩解：STUDY 只讀、不攔截既有回呼；跑 sis_grad、aa553_grades、dl03_slots、semff_unit。
- 9. 存檔的 backfill 跑在很大的舊存檔上，讀檔可能變慢或出錯。緩解：只跑一次（bf 標記），try/catch 失敗就只用空狀態並 console.warn，不擋讀檔。
- 10. 期中考改成算成績，會牽動 HONOR、GRADES、pushLevel 和 drawExam 排除期中用過的題。緩解：先問使用者；選「算」才在 B4 一起改，測試同時涵蓋 mid 和 final。
- 11. 語氣風險：司法官落榜、重考的台詞變成比較或說教。緩解：AA 照 D116 寫；BB 驗收時逐句看。
- 12. 研究所改成作答，會讓原本因為常去總圖而錄取的存檔結果翻轉。緩解：已經過了考試日的存檔凍結舊結果，新規則只用在還沒考的人。

## 10. 要使用者決定的

- Q1 應屆（2029 年第一次考）能不能考上司法官？(A) 可以：一試 16 題以上，再看司法官二試作答、在校成績輔助；沒上可以重考（建議）。(B) 不行：維持 10-18「應屆沒有司法官」，只有重考那一年能考上。(C) 可以，但要很高的門檻（例如二試 10 題答對 9 題以上）。
- Q2 司法官結局要分法官、檢察官嗎？(A) 一種「司法官」結局。(B) 分法官、檢察官兩種，司法官學院結業前由玩家選。(C) 分兩種，照在校傾向自動決定。
- Q3 期中考要不要算成績？(A) 維持「期中練習、不算成績」，但開放總複習、名稱統一成「期中考（不算成績）」（建議）。(B) 算成績：期中 40%、期末 60%。(C) 不算學期成績，但算進書卷獎平均。
- Q4 大四下有一科被當（例如海商法答對 0 題）要怎麼處理？(A) 維持延畢、當年國考取消、隔年再考（有總複習以後很少發生）。(B) 加一次 6 月底的補考，考過就照常畢業、照常考國考（建議）。(C) 延畢，但當年國考照樣可以報考。

**使用者回答（2026-11-02 05:0x，選擇題）**：
- Q3 → 自己填「**沒有期中考**」：拿掉期中考——第 8～9 週照一般上課、不抽題、不顯示期中；總複習只在期末前（'mid' 範圍取消）；期末抽題不再排除期中用過的題；舊存檔的 R.exam[*:mid] 保留但不讀。B3 拿掉 mid、B4 的「期中名稱統一」改成「拿掉期中」（併進 B1）。
- Q4 → **6 月底補考一次**：大四下被當的科目，6 月底補考同科五題，過了照常畢業、照常考當年國考；沒過才延畢（加進 B8 之前的 B6，或獨立一小批）。

分工：Q1、Q2 屬結局大方向（D109），由 AA 問使用者；Q3、Q4 屬系統機制，由 LAWWW 問。答案回填本節。


## 11. 總監定案（LAWWW，2026-11-02 05:1x；BB 轉述使用者 05:0x「不要再由我決定」→ 遊戲設計由 LAWWW＋AA 定，只有推翻使用者舊決定的才問使用者）

對 BB_222 F-3（BB 要 LAWWW 回答的九題）：
1. 範圍與存檔：新增 `G.study`（讀到時補預設，不改舊欄位格式）；R.exam、BAR_YEAR 的格式和意思不變；遷移照第 8 節。
2. 總複習：照常呼叫 STORY.onStudy（地點照實際讀書的地方記）；**不占時段次數**；耗 3 小時、不跨天；可以重複做。
3. N1、N2 卡死的舊存檔：pendingExam 改成執行時判斷（exam_2030 已完成或已錯過），舊存檔讀進來自動解開，不另外補救（B1）。
4. 研究所判定：兩套都拿掉，改成作答（10 題公法，B6）；已經存下 GRAD_EXAM_2029_PASS 的舊存檔照舊。
5. LAWCLUB_SAT_VISITS：careerLean 不再累加（v2，B6）；footprint 照舊（只決定尾聲桌上的物件，是足跡裝飾、不是懲罰）；其他讀取點照 B5a 改看「加入或去過」。
6. ev_peishan_handover 的週次：交 AA 確認（以 AA 稿為準）。
7. civpro_2_re、insurance_re 不在題庫對照表：原本是 AA_144 X4「只上課」刻意的；D118 取代，改考原課五題（B1）。
8. release_suite.sh:7：LAWWW 修（B1 一起）。

對 BB_222 F-1（設計判斷）：
1. 學姊週三法圖邀約一週沒去就停：**改成不停**（沒去不會讓之後的邀約消失；台詞交 AA）。
2. 沛珊「我接。」5 次、學姊文章讀 3 次：**門檻拿掉**，改成去過 1 次／讀過 1 次（交 AA 確認台詞）。
3. 7 門課照 prep 寫等第：**改**（B1：日本補修兩門考原課五題；專題、實習固定通過；經濟系那一年固定及格）。
4. 看出席的課每學期 3 堂：**保留**（看得到、老師會講、第 12 週有提醒，不是每日打卡）。
5. D102 教科書再選一次：**和總複習並存**（買東西的效果，不是讀書次數）。
6. 全用猜每科約 24% 被當：**接受**（有一鍵總複習；大四下被當有 6 月底補考，使用者 05:0x 選）。
7. 應屆能不能考上司法官：推翻使用者 10-18「應屆沒有司法官」→ **問使用者**（AA 和結局方向一起問；第 10 節 Q1）。
8. 第 2 天民總「沒讀案例」寫進教授紀錄影響推甄：**切斷對推甄的影響**（台詞保留）；B6 一起改。

第 10 節 Q2（司法官分不分法官／檢察官）：屬結局細節，交 AA 自己定（D109），定了告訴 LAWWW。

## 12. 使用者回答國考批次 A（AA 問，2026-11-02 05:0x；企劃線 689cfae1 AA_572 第 5 節末）

- A1：**只有重考才考得上司法官，應屆不能**（取代第 10 節 Q1 的建議 (A)；維持 10-18「應屆沒有司法官」）。→ B8：2029 應屆的司法官二試照考、照作答，但一律不錄取，落榜後進重考選擇；2030、2031 重考年才可能錄取。
- A2：**司法官二試＝司法官爭點題＋四年在校平均**。→ B8：二試作答（爭點題，AA 出、要可靠來源）＋PG.basis（四年法律科期末平均答對）一起判定，門檻由 LAWWW 定、寫進測試。
- A5：**考上以後寫成遠距（分發外縣市）**。→ AA 寫司法官學院／分發後的劇情與尾聲；感情線照遠距處理。
- A6：**讓玩家選法官或檢察官**（取代第 10 節 Q2 交 AA 自定）。→ B8：結業前選擇，S.path 'J_judge'／'J_pros'。
- A3、A4、B、C：AA 還沒問。使用者現在恢復以安角色共創，AA 的法律案暫停；LAWWW 的 B1～B6 不受影響照做。

## 13. BB 驗收規格更正（BB 987cdace，2026-11-02 05:5x；BB 判定）

- **B1-1 年份**：重考那一年的一試是 **2030-08-03 08:00**（時間窗到 8/4 06:00；2029 一試是 8/4）。遊戲沒有「選擇不去考」，錯過＝時間過了 8/4 06:00。驗收改成：【前置】讀檔在 2030-08-04 07:00（已錯過，等同原本卡住的舊存檔）→ 一路到 2030-10-01 第一份工作、2034 尾聲照常；另一段照玩家在家過那兩天，記錄考試會不會自己開始。不新增「不去考」選項。
- **B1 還沒做的兩件**（LAWWW 記下）：①錯過一試的人一句旁白（字等 AA，D118_PLAN 第 5 節 4(l)）；②錯過一試的人照樣收到 2030 放榜的群組訊息——LAWWW 查過：pg_r1g_2030／pg_r2g_2030（群組三行，阿哲、Alison 自己的放榜）、pg_zhe_2030_r2（S.zhe2030：報了名＝both 那一版）的條件是 S.sits（報了名）不是「有去考」。群組那幾行是朋友自己的事，錯過的人在群組裡看到也合理；S.zhe2030 的 both 版本要不要給錯過的人，交 AA 定（D118-MIDTERM-STORY-1102 一起）。
- **B2 萬才館**：大一上沒有課在萬才館多功能教室（最早是大二上週二民法物權）。驗收改成大二上第 2 週週二民法物權（2026-09-15，【前置】）；大一上博思 101 國文、普通 101 通識、共同 102 英文也沒有 setBoard，逐堂記錄黑板字幕。

## 14. 使用者改出席規則（AA 轉述，2026-11-02 06:0x；AA_574 @5964f6be5 末節）

- 使用者：「教授通常是隨機點名 一年只點名幾次」，選「改成隨機點名日」「非上課簽到只留補習班」。**取代第 11 節 F-1 第 4 點「出席三堂保留」和 D74。**
- 規格：非法律課每門每學期 4 次點名日（第 2～16 週隨機、避開期中期末週、存檔、玩家看不到）；點名缺 3 次以上不及格；只有點名日記出席；舊存檔過去週次照 attend≥3、剩下週次補抽；第 12 週提醒改「這學期點過 n 次名，你缺了 m 次」。
- 任務 ATTEND-ROLLCALL-1102（LAWWW；等 B2 合併後做，兩個都改 classes3d.js）。
