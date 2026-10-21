> **WIP（2026-10-21 14:1x UTC，LAWWW-C 先存檔）**：子代理還在寫的玩家功能清單半成品（FEATURE-LIST-9102-1019）。唯讀整理、不是驗收；寫完會換成正式版 docs/handoff/PLAYER_FEATURES_v9.10.3.md。

# 《法條之外》玩家功能清單（v9.10.3 候選）

> LAWWW-C 派的唯讀整理（2026-10-21 14:1x UTC）。**這不是驗收**：只把「玩家會看到什麼」逐項對到程式、看板與測試檔名；沒有開瀏覽器、沒有跑測試、沒有改 repo。任務 FEATURE-LIST-9102-1019（使用者 10-19 02:0x 要的那份）的內容，改用 v9.10.3 候選當基準。

## 基準版本

| 名稱 | commit | 說明 |
|---|---|---|
| 線上 v9.10.2 | main `9335763d` | GitHub Pages 上的版本 |
| 下一版 v9.10.3 候選 | `f72a2a21` | main 之後 397 個 commit。BB-C 10-21 判定「可以發布、四項實際流程 PASS」（856cece9，登記 4cbd72d5）；LAWWW 發布前清單還在跑（RELEASE-9103）；回退目標 v9.10.2 |
| 開發分支 `claude/adoring-meitner-mqzst8` | 證據行號用 `31fcaccf`（13:29 UTC 快照）；狀態核到 `d394e72d`（14:06 UTC） | 候選之後 90 個 commit（快照之後又 37 個，影響到的列都改了狀態、證據寫 commit） |

## 六種狀態（每一列只用一種）

- **線上可玩**：main `9335763d` 的程式裡找得到（`git grep` 核過）。
- **下一版（v9.10.3 候選）**：`f72a2a21` 有、main 沒有。
- **開發分支已完成（候選之後）**：`f72a2a21` 之後才進開發分支（下下版）。
- **有企劃未實作**：使用者要過、或 AA／BB 已交規格，程式還沒有（寫負責人與下一步）。
- **等待美術／素材**：程式在等 2D 背景、CG、立繪、3D 模型（寫缺哪一個、誰負責）。
- **暫停**：tasks.json／USER_WANTS 寫暫停的（寫原因、恢復條件）。

## 證據怎麼看

- 行號：**線上可玩**的列是 main `9335763d` 的行號（多寫「main」）；**下一版**是 `f72a2a21`；**開發分支已完成、有企劃未實作、等待、暫停**是 `31fcaccf`（另外註明的除外）。
- commit 後面括號＝它在哪一版：（main）、（候選）、（候選之後）、（快照之後＝31fcaccf 以後）。
- 測試只列 `tests/` 裡存在的檔名，**這次都沒有重跑**。寫「BB ✔」的是 `docs/handoff/CANDIDATE_9103.md` 記的 BB 瀏覽器實測（Playwright 手機模擬＋SwiftShader）；**全部沒有 iPhone 實機測試**。
- 任務 ID 以 `docs/handoff/tasks.json`（d394e72d）為準；斜線後面是 `docs/handoff/USER_WANTS.md` 的列號。今天早上的稽核（scratchpad audit/out_A～D.jsonl）只當線索，和 tasks.json 現況不同時照 tasks.json，並寫 commit。
- 黑畫面（2D 對話沒有背景圖）的現況：`node tools/story/black_bg_audit.js`（不加 --md，只印出來）在 a5d4880e（14:01Z）跑的結果是 **77 段、391 句**（12:23Z 的 `docs/handoff/BLACK_BG_AUDIT.md` 是 111 段、676 句，之後又接了三組背景）。

## 0. 總覽（列數）

| 章 | 線上可玩 | 下一版（v9.10.3 候選） | 開發分支已完成（候選之後） | 有企劃未實作 | 等待美術／素材 | 暫停 | 合計 |
|---|---|---|---|---|---|---|---|
| 1. 經濟系完整流程 | 27 | 7 | 1 | 4 | 1 | 1 | 41 |
| 2. 寒暑假系統 | 14 | 3 | 4 | 3 | 0 | 0 | 24 |
| 3. 交換 | 3 | 10 | 2 | 3 | 4 | 0 | 22 |
| 4. 法律系大一～大四各學期 | 13 | 14 | 4 | 9 | 1 | 1 | 42 |
| 5. 人物與感情 | 9 | 11 | 5 | 16 | 2 | 2 | 45 |
| 6. 手機 | 12 | 2 | 1 | 2 | 0 | 0 | 17 |
| 7. 存讀檔與舊存檔相容 | 6 | 3 | 1 | 2 | 0 | 1 | 13 |
| 8. 地圖、場景、操作、效能 | 17 | 10 | 2 | 10 | 0 | 2 | 41 |
| 9. 結尾 | 0 | 10 | 1 | 0 | 0 | 2 | 13 |
| **合計** | **101** | **70** | **21** | **49** | **8** | **9** | **258** |

另外（最後兩節）：「看板寫待辦、其實已在遊戲裡」完整做好的 12 項、做了一大部分的 13 項、素材其實已經在別的分支的 3 組；「看板寫完成、其實找不到的」沒有整項不存在的，部分找不到的 4 項。

## 1. 經濟系完整流程（新遊戲 → 宿營 → 在學 → 10/17 休學與可昕交往 → 休學在家 → 重考 → 考試、放榜 → 進法律系）

> 驗收標準照企劃線 AA_269 第 6 節（15 點）；目前的版本是 AA_300／AA_303 的「30 分鐘版」：9/2 以後只停逐場確認過的場，其他用日期卡一句帶過（`src/econff3d.js`）。BB 瀏覽器實測紀錄：v9.10.1 發布時 BB-C 從新遊戲玩到 8/22 法律系宿營兩輪（QA-AA300-1018，見 `docs/RELEASES.md` v9.10.1 節）；v9.10.2 發布前 flow_v0_home 8/8（RELEASES v9.10.2 節）。下一版的改動多數只有 node 單元測試。

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 標題畫面二選一：「從經濟系開始（序章，約 30 分鐘）」或「從法律系開始」 | 線上可玩 | `index.html:185-186`；`src/game3d.js:562`（btnNewLaw）；tests/start_b_unit.js、tests/flow_v0_start.py | UX-START-CHOICE-1018、V0-A3／X24 | — |
| 2024-08-23 經濟系宿營開局：遊覽車上第一次見到可昕（二選一）、宿營 CG＋夜遊旁白、8/25 回家、21:00 第三小隊群組 | 線上可玩 | `src/story3d.js:150-176`（econCampPrologue、`F.E15_BUS`）；`src/adv3d.js:103` cg_econ_camp；tests/v0_g7_unit.js | LIFE-G7-1017、ART-CG-ECONCAMP／D02、D06 | — |
| 9/1 宿舍 412 第一晚：媽媽的訊息、室友阿勳進門、紙箱（先睡／拆完二選一）、隔天早上一句 | 線上可玩 | `src/story3d.js:180-228`（`v0Box` 412 紙箱）；tests/v0_e01_unit.js、tests/v0_dorm_props_unit.js | V0-B1、V0-ART-DORM、ART-V0-DORM | — |
| 9/2 起「事件接事件」：不用一天一天過，空下來 1.5 秒就黑幕換時間、日期卡下面一句旁白；兩堂劇情課（9/5 會計、9/9 經原）自動帶進教室坐好 | 線上可玩 | `src/econff3d.js:1-58`（S.STEPS）、`:62`（S.KEEP）、`:92`（S.CARDS）；tests/econ_ff_unit.js、tests/econ_ff2_unit.js | SYS-ECON-FF-1018、AA300-ECON30-1018／X11 | — |
| 經濟系課表、課堂內容（初等會計、經濟學原理…）；休學以後課表停 | 線上可玩 | `src/data/courses.js:34-46`（acct_y0、y0leave）；`src/classes3d.js:152`（經原劇情課）；tests/v0_a2_unit.js | V0-A2、V0-B5 | — |
| 9/2 新生座談與迎新（宿營去過的版本「宿營來過的，大部分都見過了」） | 線上可玩 | main `src/data/events.js:1912-1913`（ev_y0_e02 的 ECON_CAMP_OPEN 句）；tests/v0_e02_unit.js | V0-A6、Q-ECON-CEREMONY-1018／X10 | — |
| 9/13 保齡球第一次班聚、9/18 社團博覽會、9/19 下課後的一群人、9/20 鏈子掉了、9/21 中秋系烤、9/23 小福午餐、9/30 颱風夜泡麵、10/1 全系的秘密 | 線上可玩 | main `src/data/events.js:2724`（ev_y0_e14）、`:1944`（e05）、`:1958`（e08）；`src/econff3d.js:21-37` 排程；tests/v0_e05_unit.js、tests/v0_e08_unit.js、tests/v0_e14_unit.js、tests/v0_t0_unit.js | V0-B1～B4、AA303-KX-RECONFIRM-1018 | — |
| 中秋系烤的 CG（阿勳戴柚子帽生火、品妤拿手機拍） | 暫停 | 事件在、CG 沒有（`ev_y0_e08` 沒有 cg 那一拍）；使用者 10-18 14:3x「Cg 先記錄需要哪些 之後的帳號再補」 | CG-ECON-BBQ-1018（看板寫等待）／X43 | BB 寫提示詞向使用者要 → LAWWW 登錄、接 ev_y0_e08；恢復條件：之後的帳號接班 |
| 10/12 長頸鹿拉花（Café；吧檯只留芷若，店員那兩句用芷若立繪） | 線上可玩 | main `src/data/events.js:2965-2966`（ev_y0_l5a、hideClerks）；tests/v0_l5a_unit.js | BUG-LATTE-CLERK-1018／X44 | — |
| 10/15 經濟系的聚會（公館桌遊店）、10/16 總圖念微積分＋小福 | 線上可玩 | main `src/data/events.js:2645`（ev_y0_gather）、`:2670`（ev_y0_e10）；tests/v0_gather_unit.js、tests/v0_e10_unit.js | V0-B4 | 桌遊店背景在候選之後才接上（見本章「經濟系四張背景」） |
| 10/17 辦休學（行政大樓）→ 捷運上打給可昕（演出來的電話，不再是十則私訊）→ 車上 → 摩天輪、交往 → 便利貼 | 線上可玩 | main `src/data/events.js:2270`（ev_y0_e30）、`:2189`（ev_y0_e26）、`:2288`（e30_note）；電話 e534fcc8；tests/v0_e30_unit.js | V0-A7、AA296-KXCALL-1018、BUG-E30-PLACE-1018 | — |
| 10/17 電話講完先回臺北的家跟媽媽說（媽媽不罵、借車鑰匙），再開車去社科院門口 17:40 | 下一版（v9.10.3 候選） | f72a2a21 `src/data/events.js:2326`（AA_308 第 4 節 E30-MOM）、`src/econff3d.js:46-47`（16:10 出發）；main 沒有這段 | E30-MOM-1018／X46 | BB 驗收（清單 bb_checklists） |
| 10/29 小福「你什麼時候才要跟我們說？」、10/31 退宿搬回家（阿勳封箱） | 線上可玩 | main `src/data/events.js:2294`（ev_y0_xiaofu）、`:2312`（ev_y0_a3）；`src/home3d.js:114`（HOME.moveOut） | AA305-OTHERS-1018 | — |
| 休學在家：家裡的選單（讀書、出門、約可昕、存檔）、跳到下一件有事的時間、臺北的家 2D 背景 17 張（客廳、餐桌、房間、陽台、除夕） | 線上可玩 | main `src/home3d.js:153-160`（約可昕出門、y0Jump）、`:157`（存檔）；`assets/bg/home_*.webp` 17 張（main 有）；tests/v0_home_ff_unit.js、tests/flow_v0_home.py | V0-HOME-FF、UX-HOME-SAVE-1018、BG-HOME-1018／D04、X26、X28 | — |
| 住在家裡時出家門、轉場不再露出醉月湖或舊 3D 區域 | 線上可玩 | 2af6c40d、fa03d80d（main 的祖先）；`src/home3d.js` backdrop；tests/home_backdrop_unit.js | BUG-NYE-ORIGIN-1018、BUG-HOME-CAMPUS-BG-1018／X51 | — |
| 11/6 醉月湖當面（傍晚）、11/22～24 經濟系宿營 CG 帶過、12/31 市府站跨年、1/28 除夕電話 | 線上可玩 | main `src/data/events.js:2706`（ev_y0_e12）、`:2907`（e21a）、`:2105`（e21）；tests/v0_e12_unit.js、tests/v0_winter_unit.js | V0-B1、Q-NYE-E21A-1018、Q-E21-TOLD-1018 | — |
| 12/13 一個人回以前的補習班問重考班（30 分鐘版也會停下來演） | 下一版（v9.10.3 候選） | 事件 main 就有（`events.js:2090`），但 30 分鐘版不演；f72a2a21 `src/econff3d.js:64` 加進 S.KEEP | CRAM-DEC-SCENE-1018／X55 | BB 驗收 |
| 1/8 公館吃麵（她先透露想休學）；12/14～12/30 日期卡交代「期末考考完、寒假開始」 | 下一版（v9.10.3 候選） | f72a2a21 `src/data/events.js:2121`（ev_y0_jan8）、`src/econff3d.js:104`（期末那句）；main 沒有 | KH-RETAKE-PACING-1018、ECON-TERM-END-CUE-1018／X53、X54 | BB 驗收 |
| 1/31～2/2 高雄三天兩夜（美麗島站、蓮池潭兩張純場景背景） | 線上可玩 | main `src/data/events.js:2224`（ev_y0_kh3）；`assets/bg/kh_dome.webp`、`kh_lotus_bench.webp`（main 有）；tests/lifeline_g5_unit.js | AA303-KX-RECONFIRM-1018、CG-NOPERSON-1018／X37 | — |
| 高雄三天分七個地點演（新崛江、駁二／大港橋二選一、瑞豐、旗津、西子灣、美麗島站、蓮池潭） | 下一版（v9.10.3 候選） | 3542dd82（候選）；f72a2a21 `src/data/events.js:2257`（kh_xinjuejiang 等）；tests/lifeline_g6_unit.js | KH-TRIP-MORE-1018／X52 | 新崛江、駁二、西子灣三張背景等使用者（見下） |
| 2/12 看不懂的民法、2/13 一起重考吧、2/14 一起去問補習班 | 線上可玩 | main `src/data/events.js:2110`（e23）、`:2212`（e27）、`:2239`（e27b）；tests/v0_e22_unit.js、tests/v0_retake_unit.js | V0-A5、V0-A7 | 2/14 補習班櫃台的背景在候選之後才接上（見本章「經濟系四張背景」） |
| 2/15 起可昕住進來一起重考：每 3 天一段日常、週六長場景、書桌念書、約可昕出門、主動傳訊息給她（她在家時改「直接去講」） | 線上可玩 | main `src/data/retake_home.js:3`、`src/econff3d.js:191`（RH_EVERY）、`src/home3d.js:153`；`src/data/msg_kx_y0.js`（MSG_KX_Y0）；tests/v0_retake_r_unit.js | RT-TOGETHER-1018、UX-RT-DATE-1018、MSG-KX-Y0-1018／X27 | — |
| 衝刺班 6/9～7/9（每天 09:00～21:00）：請假演兩次（6/12、6/17）才在 6/24 笑；「後來去請假她已經不笑了」那張日期卡拿掉 | 下一版（v9.10.3 候選） | main 還有那張日期卡（`src/econff3d.js:106`）；f72a2a21 `:115` 拿掉、`S.RH_PLAY`（`:68`）有 RH-C2／C3／C4 | CRAM-LEAVE-LAUGH-1018、AA298-RETAKE-FIX-1018／X59 | BB 驗收 |
| 4/24 可昕生日（公館豆花店） | 線上可玩 | main `src/data/events.js:2324`（ev_y0_e18b）；tests/v0_e18b_unit.js | V0-B1 | — |
| 7/10 考前一晚、7/11 考場 07:40、7/12 對答案 | 線上可玩 | main `src/data/events.js:2420`（e35h）、`:2450`（exam1h）、`:2452`（exam2）；tests/v0_e35_unit.js | AA272-1017 | — |
| 7/25 成績公布：客運版（高雄客運站、早餐店）／在家版；和好是她打回來的電話 | 線上可玩 | main `src/data/events.js:2508`（kh_bus）、`:2510`（kh_home）；`assets/bg/kh_bus_day.webp` 等（main 有） | AA272-1017、ART-KH-BUS／I14 | — |
| 7/25 客運版：見面後才看到落點表（「……好。等你到了再說。」） | 下一版（v9.10.3 候選） | f72a2a21 `src/data/events.js:2522`；main 還是舊句 | KH-SCORE-TIMING-1018／X60 | BB 驗收 |
| 8/13 放榜電話＋宵夜（「只高 0.1」改可昕說） | 線上可玩 | main `src/data/events.js:2539`（ev_y0_e36）、`:2541`（e36n）；tests/v0_e36_unit.js | Q-E36-CALL-1018 | — |
| 8/29 轉進法律系：同一份存檔接著玩，帶過去的東西、經濟系經驗的句子（PLAYED_Y0） | 線上可玩 | main `PLAYED_Y0` 17 處（例 `src/data/camp_y1.js:41`）；tests/v0_tolaw_unit.js、tests/flow_v0_tolaw.py | V0-A4 | — |
| 8/30 開車載可昕搬進政大宿舍（E37，經濟系路線） | 線上可玩 | main `src/data/events.js:2546`（ev_y0_e37）；tests/v0_e37_unit.js | BUG-E37-TOLAW-1018（已驗收） | — |
| 經濟系閒聊階梯（大一上可昕 13、品妤 6、唐睿 4、阿勳 6、韋綸 7 層；大一下可昕 4 層；「搬回家以後來學校要多久」那段拿掉） | 線上可玩 | main `src/data/ladder.js` byTerm Y0S1 5 人、Y0S2 5 人（node 讀檔核對）；`src/story3d.js:480`（LAD_CUT）；tests/ladder_unit.js | AA306-KX-LADDER-1018、V0-LADDER、LAD-K0LX2-CUT-1018／X47 | — |
| 經濟系人物 3D（阿勳、品妤第六版、韋綸、唐睿、家豪、魏教授）＋品妤保溫瓶、家豪筆記本 | 線上可玩 | main `src/assets3d.js:39-44`（char.econ_*）、`:128`（prop.thermos_black）；tests/v0_econ_chars_unit.js | V0-ECON-CHARS、ART-PINYU-PROPS、ART-JIAHAO-FOODMAP／C07、C08 | — |
| 可昕的表情照台詞變（已標的句子） | 線上可玩 | v9.10.2 起重考期在家 71 句、經濟系階梯 32 句標了表情（tests/kx_expr_unit.js 檔頭）；main `src/data/retake_home.js:3` | KX-EXPR-1018／X62 | 剩下約 67 句還沒標：AA 補表情標記 → LAWWW 照標 |
| 跳日期途中收到要回的訊息就停、打開那段、按「跳過」繼續（經濟系） | 線上可玩 | main `src/econff3d.js:72`（cutMsg）、`src/home3d.js:160`（y0Jump）；RELEASES v9.10.2「跳日期途中手機跳出來 50 次都按跳過」 | SKIP-MSG-POP-1018／X58（經濟系部分） | 法律系放假的快轉見第 6 章 |
| AA_348 經濟系覆蓋盤點的程式（日期卡範圍對齊停點、四句新旁白、7/15 那句照路線） | 下一版（v9.10.3 候選） | 3a21d66b（候選）；f72a2a21 `src/econff3d.js:94-120`（S.CARDS 註「AA_348」） | AA348-ECON-1021 | BB 清單 bb_checklists/BB_AA348_1021.md |
| 經濟系四張背景：以前的補習班櫃台（2/14，24 句）、公館桌遊店（10/15）、晚上的捷運車廂（10/17 電話）、晚上路邊講電話 | 開發分支已完成（候選之後） | 1fd0d419、1796eef1（快照之後）：`assets/bg/cram_counter.webp`、`mrt_night.webp`、`boardgame_gg.webp`、`phone_street_night.webp`；`src/outings3d.js` S.BG 接上 | BG-ECON-B1-1018（已整合待測試）／X57 | BB 畫面驗收 |
| 高雄三天兩夜的新崛江、駁二／大港橋、西子灣三個地點的背景（現在深色底） | 等待美術／素材 | `src/outings3d.js` S.BG `kh_xinjuejiang`、`kh_pier2`、`kh_sizihwan` image:null；`node tools/story/black_bg_audit.js`（a5d4880e，14:01Z）仍列這三個 | KH-TRIP-MORE-1018／X52 | BB 的 BB_132 第 88 組提示詞已寫好（使用者 10-20「我現在不想弄 CG」先存著），使用者想弄時給 → LAWWW 接 |
| 經濟系那一年的錢只進不出（使用者存檔身上 $349,910） | 有企劃未實作 | 看板稽核 B2：沒做（還沒查收支）；`src/story3d.js:86`、`:146` 是開局的錢與零用錢設定 | BUG-ECON-MONEY-1020 | LAWWW：查經濟系那年的收支（allowanceMonth、花費），照 AA 的生活費規格補支出 |
| BB 判定 v9.10.3 時留下的經濟系小問題：日期卡句子比它講的日子早出（例 12/19 就出「十二月二十日，期末考考完了」）；快轉中手機自動打開但待回 0 則（約每 3 天一次）；床邊「出發」提示重複地點時間 | 有企劃未實作 | BB_218 判定（856cece9，快照之後登記 4cbd72d5）；`src/econff3d.js` S.CARDS 的日期視窗 | BB218-P3-1021（待開工，P3） | LAWWW：v9.10.3 發布後先做「手機空開」和「日期卡早出」 |
| 經濟系那一年的 3D 缺口（社科院窗戶單調；整年的方盒、黑塊、穿模盤點） | 有企劃未實作 | 蓮花柱已修；盤點沒做 | ART-ECON-3D-GAP-1021／X06 | LAWWW2 照清查 B8 列的缺口做（D99 第一優先） |
| 書店：經濟系那年賣經濟系的書、法律系每門課的教科書，買了那一科準備度多加 | 有企劃未實作 | 程式沒有書單（看板稽核 B2 沒做） | SYS-BOOKS-1018／X15 | LAWWW：照使用者 10-18 選擇題做 bookshop 書單＋F.books |

## 2. 寒暑假系統（自由生活、多活動、和朋友出遊、回家、約會、旅行、快轉）

> 使用者 D99 第二優先：「不能一鍵跳過兩個月」。v9.10 起寒暑假每天都能玩（發布條件之一）。BB 瀏覽器：flow_vac_hometown ALL PASS（RELEASES v9.10.2 節）、flow_law_break 跑過（v9.10 節）；寒暑假活動卡、跨年多數只有 node 測試。

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 寒暑假每天都能玩：住宿舍或回家、宿舍不清空、沒事的日子可以選快轉（快轉選單） | 線上可玩 | main `src/home3d.js:264`（breakJump）、`:323`（ffMenu）；tests/law_break_unit.js、tests/flow_law_break.py | HOLIDAY-SYS、FLOW-LBREAK-1017／E01 | — |
| 快轉途中出現要回的訊息或當面邀約就停、打開手機（按「跳過」接著跳）；住家裡時先打開沒看過的；每個寒假除夕、初一、事件包登記的日子一定停 | 下一版（v9.10.3 候選） | 92030b76（候選）；f72a2a21 `src/holff3d.js:11`、`src/home3d.js:282`；tests/holiday_ff_unit.js | HOL-FF-AA340-1020、SKIP-MSG-POP-1018／X58（法律系部分） | BB 驗收 |
| 除夕、初一回家（家人、年夜飯背景） | 線上可玩 | main `src/data/calendar.js:40`（除夕）、`src/home3d.js:249`；`assets/bg/home_dining_cny.webp`、`home_living_cny.webp`（main 有） | HOLIDAY-SYS | — |
| 假期活動卡（手機「活動」頁的假期行事曆報名；撞期會寫出來；在國外的期間不能報）：C02 法律生活營隊輔、C03 日語課、C04／C04W 托福多益補習（第幾次照實際參加）、C05 日本五天（阿凱那一團） | 線上可玩 | main `src/data/vac_activities.js:32`（C02）、`:63`（C03）、`:78-85`（C04／C04W）、`:87`（C05）；`src/vac3d.js:10`、`:28`（blocked）；tests/vac_unit.js、tests/vac_c04_unit.js | VAC-C08-12（看板進行中）、AA241-SUMMER／E02 | — |
| 大二起每年寒假麵店團去海邊（C01；第二次、第三次以後的版本） | 線上可玩 | main `src/data/vac_activities.js:295`（const C01）、`src/vac3d.js:168`（c01Phone） | VAC-C08-12 | — |
| 自己排出國旅遊（手機活動頁「安排出國旅遊」：目的地 → 和誰 → 幾天 → 哪天出發）、每個暑假朋友揪團出國 | 線上可玩 | main `src/data/vac_activities.js:104`（朋友揪團出國）、`:298`（C13 出國旅遊）、`src/vac3d.js:248` | VAC-C08-12（C13） | — |
| 出國活動卡：C08 首爾姊妹校、C09 柬埔寨志工、C10 加州暑期課、C11 東京冬季課、C12 京都語言課（說明會、面試、錄取；出國期間的訊息與時差；出國家裡出、當地自己出） | 線上可玩 | main `src/data/vac_activities.js:136`（C08）、`:193`（C10）、`:229`（C12）、`:243`（TRIP_MSG）；tests/vac_abroad_unit.js | BB-C08-12、VAC-C08-12／E02、E03 | — |
| C16 法扶實習（大二、大三暑假，平日上班）、C17 律所暑期實習（要英檢成績、有津貼）、C18／C18W 新加坡海外見習團 | 開發分支已完成（候選之後） | ecbf3328、b57717dd（候選之後）；`src/data/vac_activities.js:290`（C16）、`:304`（C17）、`:323`（C18）、`:333`（C18W）；tests/vac_c16_c18_unit.js | VAC-C16-C18-1021 | AA 回 7 項裁定＋5 處缺字（AA-VAC-C16-C18-Q-1021）；BB 瀏覽器驗收（BB-TEST-VAC-C16-C18-1021，排在 v9.10.3 之後）；7 張背景在快照之後到齊（下一列） |
| C16～C18 的 7 張 2D 背景（法扶辦公室、律所辦公區、會議室、法院旁聽席、新加坡法院／校園／小販中心） | 開發分支已完成（候選之後） | 1796eef1、a5d4880e（快照之後）：`assets/bg/law_firm_office.webp`、`law_firm_meeting.webp`、`court_gallery.webp`、`intl_sg_court.webp`、`intl_sg_campus.webp`、`intl_sg_hawker.webp`、`legal_aid_office.webp`；tests/bg_images_unit.js 2i | BG-VAC-C16-C18-1021 | BB 畫面驗收 |
| 寒暑假去她的縣市：可昕在高雄、沛珊在台中，手機約「我去高雄找妳？」、選日子、高鐵（錢不夠變灰）、車站接人→一個地方→送上車 | 線上可玩 | main `src/hometown3d.js`、`src/data/hometown_lines.js:4`；tests/vac_hometown_unit.js、tests/flow_vac_hometown.py（v9.10.2 發布前 ALL PASS） | VAC-HOMETOWN-1017／E04、C16、C17 | — |
| 沛珊大三起學期中在台南：「我去台南找妳？」、回程高鐵、只在私下約推進她的閒聊 | 下一版（v9.10.3 候選） | f72a2a21 `src/data/hometown_lines.js:35`（classmate_peishan@台南）、`src/data/events.js:1131`（ev_hv_ps_tn）；tests/peishan_tainan_unit.js | PS-TAINAN-AA282／X01 | BB 驗收 |
| 其他人的假期：明軒回彰化、方奕廷上山／回台中、以安大三寒假回台中、阿哲海邊隔天回高雄 | 線上可玩 | main `src/data/characters.js:17`（以安）、`:65`（明軒）、`:101`（方奕廷）absentDates | RELEASES v9.10 第 9 項／E06 | — |
| 寒暑假回老家寫進作息：以安、阿哲、柏翰、明軒、芷若、阿凱回老家的日子不在臺北（約不到「已經回老家」的人）；柏翰寒暑假週四上來總圖；第二批：柏翰新竹、芷若台中／英國照日期、以安回國那天、約會撞到她回台中會擋、以安東京京都與小語營隊 | 開發分支已完成（候選之後） | 372208db、35f0fdc5（候選之後）；`src/data/characters.js:67`（阿哲）、`:78`（柏翰）、`:103`（阿凱）absentDates；第二批 d90675e1（快照之後，AA_350 S1～S8）；tests/holiday_presence_unit.js、tests/aa350_s_unit.js | HOLIDAY-PRESENCE-1021、AA350-SR-1021、VAC-B1、BB198-VACB22 | BB 驗收；AA 回 9 項裁定＋4 處缺字（AA-Q-1021-SR） |
| 寒暑假回老家的群組訊息：大三、大四不再和大二一字不差 | 開發分支已完成（候選之後） | 170a150d（候選之後，AA-C 直接推） | （AA-C 登記 c386ed9f） | BB 驗收 |
| 學期末聚餐（第 16 週最後兩天）＋寒暑假邀約（取代重訪日） | 線上可玩 | main `src/termend3d.js:13`、`src/data/termend_lines.js:9`；tests/termend_unit.js、tests/flow_termend.py（v9.10.2 發布前 12/12） | AA249-TERMEND、AA250-TERMEND-LINES／D29 | — |
| 跨年大一～大四（河堤、可昕高雄視訊、芷若視訊、語彤電話） | 線上可玩 | main `src/data/events.js:1221`（ev_nye_*）、`:1272`（ev_kx／yt_nye_*）；tests/y1_winter_aa204_unit.js | Y1-WINTER-AA204、HOL-NYE-Y2～Y4／E05 | 大一跨年芷若、子晴、明軒、方奕廷、Kevin 的訊息（BB_171）見下一列 |
| 大一跨年那晚其他人的訊息（芷若、子晴、明軒、方奕廷；Kevin 的跨年照片不點名大樓） | 有企劃未實作 | 看板稽核 B2：做了一部分 | V1-BB171 | LAWWW 照 BB_171 第 3 節在 story3d.js 大一跨年加訊息（D100 後請 AA 確認定稿） |
| 芯慈大二暑假在事務所（樓下午餐）、麵店團 2027-08-25～28 去香港 | 線上可玩 | main `src/data/vac_activities.js:329`（VA09）、`:340`（VA10） | RELEASES v9.10 第 13 項 | 事務所午餐那段是深色底（BLACK_BG_AUDIT 第 2 節 ev_va09_lunch） |
| 寒假語彤家的麵店過年店休（店休鐵門、她在裡面刷椅子腳、初四開門；店休期間約她排到 18:00 以後） | 下一版（v9.10.3 候選） | f01fd8a4；f72a2a21 `src/noodle_closed3d.js:1-9`；tests/noodle_closed_unit.js | HOL-VA（AA_333 VA-08） | BB 驗收 |
| 和朋友出遊、自由出行（捷運景點三批，可以約同行） | 線上可玩 | main `src/data/free_trips.js:3`、`src/freetrip3d.js`；tests/dl06_trip_unit.js、tests/flow_trip_date.py | DL-06、DL-06B、DL-06C、DATE-S3／B16、B17 | — |
| 寒暑假出國的旅館、日本街景、補習班 2D | 線上可玩 | main `src/outings3d.js:14`（trip_hotel_twin）、`src/data/vac_activities.js:96`（jp_street_night） | VAC-B3／E09 | `train_day` 那張還沒用上（VAC-B3） |
| 寒暑假出國、送機改走 3D 桃園機場（現在只有美國交換出發會進去） | 有企劃未實作 | `airport_dep` 只在美國出發用（`src/data/us_layouts.js`、`src/data/r2y4b_events.js:266`）；寒暑假出國是 2D／深色底 | VAC-A2（看板寫已實作待整合）／E08 | LAWWW 把寒暑假出國出發、日本送機接到 airport_dep |
| BB_198 假期空白補規劃的新事件（7-2） | 有企劃未實作 | presence 部分已做（上面 HOLIDAY-PRESENCE）；新事件程式沒有 | BB198-VACB22 | AA 寫 7-2 新事件台詞（D100）→ LAWWW 實作 |
| 暑假的手機：7/9 語彤生日、每年 7/15 宿舍抽籤群組訊息（大二 312 阿哲柏翰同房；大三 507、大四 409 阿哲在二樓）、9/6 搬新房間 | 線上可玩 | main `src/home3d.js:208-210`（放假行事曆）、`:360-377`（dorm_lottery_y2、dorm_lottery_y*_zhe） | AA208-L（AA_275 第 11 點） | — |

## 3. 交換（臺灣／日本／美國三條路線：申請、出發、抵達、生活、回台、延畢大五）

> 使用者 D99 第三優先；「場景完成≠系統完成」，下面分開列。線上版（v9.10.2）只有美國的「最小可玩流程」（系統選單選路線 → 出發 → 公寓社區 → 睡覺推進）和 3D 場景；路線照交往定、美國那一學期每週的內容、日本整學期、返台都在下一版候選。只有 node 測試，BB 清單：bb_checklists/BB_US_LIFE_1021.md、BB_R2Y4_1021.md 等（還沒全部 ✔）。

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 大三上宿舍房間的「交換申請（志願表）」系統選單：自己選美國／日本／留在臺灣 | 線上可玩 | main `src/exchange3d.js:3`、`:42-45`（exchApply）；tests/exch_min_unit.js、tests/flow_exch_min.py | US-MIN-FLOW、SYS-10 | 下一版改成照交往定（下一列） |
| 交換去哪裡照填志願表那天和誰交往：2027-11-18 12:00 截止，學姊＝美國、以安＝日本、其他＝留在臺灣；兩段都在交往由第 10 週 Café 那一場逼選；系統選單拿掉 | 下一版（v9.10.3 候選） | f72a2a21 `src/story3d.js:3120`（S.routeDecide）、`src/data/events.js:3403`（ev_two_hearts_cafe）、`src/exchange3d.js:3`；tests/route_decide_unit.js、tests/two_hearts_unit.js | BB204-EXROUTE、EVPKG-1A02-1020／F10 | BB 驗中（CANDIDATE_9103 B 線：E1、E2 ✔） |
| 美國出發（2028-08-02）：字卡 → 3D 桃園機場出境大廳 →「登機」→ 飛行字卡 → 抵達美國公寓社區 | 線上可玩 | main `src/exchange3d.js:1-9`、`src/assets3d.js:135`（airport_dep）；tests/flow_us_exchange.py | US-MIN-FLOW、VAC-A2（美國出發部分）／F06 | — |
| 美國的 3D：自己的公寓（房間、客廳、廚房、睡覺選單）、公寓社區、草原超市、竹葉亞洲超市、美國校園一小段（公車站→法學院前人行道→進教室）、法學院圖書館（中庭、彩色玻璃）、四季 | 線上可玩 | main `src/us3d.js:173`（us_apartment）、`:214`（us_outside）、`:232`（us_campus）、`:244`（us_lawlib）、`:267`（us_market）、`:295`（us_asian_market）、`:92-103`（四季）；tests/nav_us_unit.js、tests/us_season_unit.js、tests/flow_us_campus.py | SCN-US-01、SCN-US-02、SCN-US-03、SCN-US-LIB、ART-US-SEASON／F02、F03、F04、F05 | — |
| 美國那一學期每週能做什麼：美國學期日曆、一鍵上課（三門課）、快轉、學姊的作息（法學院圖書館、研討課、C 棟 208、會所）、週末、感恩節、期末週、12/16 離開 | 下一版（v9.10.3 候選） | f72a2a21 `src/us_life3d.js:1-10`（S1～S12）、`:46`（S.here）、`src/data/us_life_events.js:12`；tests/us_life_unit.js | US-LIFE-AA340-1020、V4-R-US（看板待開工） | BB 照 BB_US_LIFE_1021.md 實際流程驗收；AA 回 AA_QUESTIONS_1021 第 I 節美國 8 題 |
| 美國路線的事件：交往中先去舊金山一週、US1～US3、第一場雪的台階、湖邊、秋假大峽谷、感恩節 | 下一版（v9.10.3 候選） | f72a2a21 `src/r2y4a3d.js:1-6`、`src/data/r2y4a_events.js:144`（ev_us_first_snow）、`:204`（ev_sf1）、`src/data/r2y4b_events.js:322`（大峽谷）；tests/r2y4a_events_unit.js | EVPKG-R2Y4-1020、SCN-US-EV、ROUTE-DATES-1017／F07、X35（秋假部分） | BB 驗收 |
| 美國返台：當地 12/21 23:55 起飛 → 12/23 清晨桃園入境大廳 3D | 下一版（v9.10.3 候選） | f72a2a21 `src/exchange3d.js:9`、`:38-44`（airport_arr）；tests/room_y4_unit.js | EVPKG-1A09-15-1020 | BB 驗收 |
| 回國時差（R1） | 下一版（v9.10.3 候選） | f72a2a21 `src/data/events.js:4207`（jetlag）；tests/jetlag_unit.js | EVPKG-1A06-08-1020 | BB 驗收 |
| 合租 C 棟 208（新配置）＋道具：泡麵軟袋、廚房吸頂燈、沙發上方版畫＋拍立得、B 門掛外套 | 開發分支已完成（候選之後） | fc645c8b（候選之後）；`src/data/us_shared_layout.js`（候選之後新增） | ART-US2-FIX-1018、BB_217 §7 | BB 畫面驗收（D100：LAWWW2 不自測） |
| 美國篇 CG：雪裡的台階（BCG-09）、芝加哥、結冰的湖、208 廚房、巴士站、最後一頓晚餐在事件那一拍出現 | 下一版（v9.10.3 候選） | 5e675a33（v9.10.3 候選）；CG_REGISTRY main 20 張 → 候選 76 張（`src/adv3d.js:107`）；f72a2a21 `src/data/r2y4a_events.js:157`（cg_snow_steps_heroine05）、`:23`（frozen_lake、us_kitchen、bus_station）、`:98`（chicago）、`:189`（last_dinner）；tests/cg_batch2_unit.js | CG-BATCH2-1020、SCN-US-CG（看板待開工） | BCG-31 送機（夏天版）還沒有：BB 向使用者要，或 AA 決定送機不放 CG（`cg_airport_send_heroine05` 登錄了沒有呼叫） |
| 美國篇缺的 2D 背景：會所草地（烤肉）、C 棟 208 廚房；舊金山三段照片沒有背景；舊金山霧中的橋 CG 沒登錄（會所交誼廳、自習室、湖邊、教堂台階 10-21 已接） | 等待美術／素材 | `node tools/story/black_bg_audit.js`（a5d4880e，14:01Z）：`us_club_lawn`、`us_shared_kitchen`、`false`（ev_sf_photo17／19／21）、`cg_sf_bridge_fog_heroine05`；已接的：6f52d289、1fd0d419（`us_lake`、`us_chapel_steps`、`us_club_lounge`、`us_club_study`） | SCN-US-2D、BG-3DSHOT-1021、BG-MISSING-1021、ART-15／F08、I06、X93 | BB 附遊戲截圖寫提示詞向使用者要；CG 那張：AA 回 AA_QUESTIONS_1021 E1、LAWWW 登錄 |
| 學姊羽絨外套、香港朋友何俊朗的立繪 | 等待美術／素材 | `assets/portraits/` 沒有這兩組 | SCN-US-CH、ART-16／I11 | BB 照 D97（有人物單獨一輪、附參考圖）向使用者要 |
| 美國兩家超市之間的停車場和馬路（現在「過馬路」直接換區域） | 有企劃未實作 | `src/us3d.js` 兩個超市各自是區域 | US-MARKET-STREET／X41 | LAWWW2，排在美國篇必需場景之後（使用者 10-18 選擇題） |
| 日本那一學期：出發前住臺北的家 → 3/25 出發 → 2D 據點（國際學生宿舍：一鍵上課、共用廚房、便利商店、河邊、快轉、存檔）→ 日本學期日曆 → 8/5 回程；手機是日本時間 | 下一版（v9.10.3 候選） | f72a2a21 `src/jp3d.js:1-14`、`:350`（homeRound）、`src/data/jp_events.js`；tests/jp_semester_unit.js | JP-SEM-AA341-1020、SCN-JP-SYS、VAC-X2、V4-R-JP（看板待開工） | BB 驗收 |
| 日本宿舍「你的房間」3D（睡覺、讀書、看手機；從據點選單「在房間休息一下」進、走出房門回選單） | 開發分支已完成（候選之後） | 90680fc6（候選之後）；`src/jp_dorm3d.js:1-8`、`src/data/jp_dorm_layouts.js`（候選之後新增） | JP-ROOM-3D-1021／X91 | 其他日本場景照 2D（使用者 10-21 13:0x） |
| 日本線 CG：便利商店、町公所的通知、河堤櫻花三張在事件那一拍出現 | 下一版（v9.10.3 候選） | f72a2a21 `src/data/r2y3b_events.js:162`（cg_japan_konbini_heroine01）、`:309`（cg_japan_notice_heroine01）、`:212`（cg_sakura_riverbank_heroine01） | CG-BATCH2-1020、SCN-JP-CG（看板待開工） | 臺中情人節那張（cg_valentine_taichung_heroine01）登錄了、沒有事件呼叫：等節日事件（D14-T11）；BB 在遊戲裡看實際畫面 |
| 日本缺的 2D 背景：宿舍大廳、町公所門口（便利商店、入境大廳候選就有；河堤、車站 10-21 已接） | 等待美術／素材 | `node tools/story/black_bg_audit.js`（a5d4880e）：`jp_dorm_lobby`（ev_an_town_notice_repair）、`jp_town_hall`（ev_an_town_notice）；`assets/bg/jp_konbini.webp`、`airport_arrival.webp` 在 a15ba2ea（候選）；`jp_riverbank`（6f52d289）、`jp_station`（28afd003）在快照之後 | SCN-JP-2D／F09 | BB 照 D97 向使用者要 |
| 留在臺灣的路線：大三下以後的臺灣版事件（第 2 輪、第 3 輪事件包） | 下一版（v9.10.3 候選） | f72a2a21 `src/r2y3b3d.js`、`src/r3_3d.js`；tests/r2y3b_events_unit.js、tests/r3_events_unit.js | V4-R-TW、EVPKG-R2Y3-1020、EVPKG-R3-1020 | 覆蓋缺口見下一列 |
| 臺灣路線六學期的空白週補稿（教師節群組、服務學習下象棋、母親節回家、端午媽媽寄粽子、大四下學士服拍照、畢業紀念冊…） | 有企劃未實作 | AA_342 C1、C2、C4、C5、C6 已改（f72a2a21 `AA_342` 8 處）；補稿清單沒做 | AA342-COVERAGE-1021、V4-R-TW／D15 | LAWWW 照 AA_342（c56d4241）補稿清單派子代理；C3 等 AA 給校慶海報字；驗收 T1～T7 給 BB |
| 臺灣路線想換的 2D：地方法院（現在深色底）、公館市場、修鞋店（現在借別的背景）；公館甜點店 10-21 已接 | 等待美術／素材 | black_bg_audit（a5d4880e）`dark` 組的「地方法院」；`gongguan_cake`（1fd0d419，快照之後） | SCN-V4-02、SCN-V4-03／I12 | BB 向使用者要 court_criminal、gongguan_market、gongguan_cobbler |
| 交換回來延畢的大五上（2029-09-03～12-23）：選總圖讀書／家教／在家準備、實習三件、證書、2030 研究所筆試 | 下一版（v9.10.3 候選） | f72a2a21 `src/r2y4b3d.js:294-310`（2-Y4-52、gradPass2030） | AA267-Y5（看板待開工）、EVPKG-R2Y4-1020（2-Y4-52） | 逐週內容見下一列 |
| 大五上逐週內容、行事曆 Y5S1、2030 國考前；美國路線大五上補修強制執行法、法律倫理 | 有企劃未實作 | 31fcaccf：`src/data/calendar.js` 沒有 Y5S1、`src/data/courses.js` 沒有 enforcement_re／legal_ethics_re；AA_357 規格快照之後交了（96af1e54，企劃 d07eb988），子代理實作中（631ae6cb） | Y5-DELAY-1021、SYS-12、US-20W-SPEC、V4-X18／X92、X35、D46 | 子代理先做影響畢業後篇所有玩家的三項（資料頁、退宿後「回宿舍」、延畢的人被自動報名國考），再做 Y5S1 學期 |

## 4. 法律系大一～大四各學期（課堂、期末考、16 週日曆、社團、讀書會、打工、偶遇、群組）

> 線上版：大一上、大一下（交接包 v1、v2）最完整，大二上有一部分（V3），大三、大四幾乎沒有劇情（events.js 標 term 的事件：main Y3S1 3 件、Y3S2～Y4S2 0 件）。大二～尾聲的事件包（AA_314 第 1 輪 52 件、第 2 輪、第 3 輪）都在下一版候選，**只有 node 測試**，BB 清單在 `docs/handoff/bb_checklists/`（BB_R2Y2_1020、BB_R2Y3A／B_1021、BB_R2Y4_1021、BB_R3_1021、BB_1B01-11_1C_CG_1020）。

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 8/22～24 法律系宿營（所有玩家都去、不用報名）：6～7 人小隊、學長姐臥底、第二晚烤肉、晚會；11 個活動各自的 2D 背景 | 線上可玩 | main `src/data/camp_y1.js:11`（CAMP_Y1）、`:198`（camp_bbq）；`assets/bg/camp_*.webp` 11 張；tests/camp_y1_unit.js、tests/flow_camp_y1.py | CAMP-L1、CAMP-FIX-614、BG-CAMP-1018／D07、D08、X30 | — |
| 宿營的 Kevin（潮流大哥型）立繪（現在台上常常沒人） | 等待美術／素材 | 程式已接（`src/data/camp_y1.js` speaker npc_kevin）；`assets/portraits/` 沒有 npc_kevin | CAMP-PORTRAITS-1018／X63 | BB 照 D97 寫提示詞向使用者要 → LAWWW 放 assets/portraits |
| 宿營遊覽車上的背景（不再借家用小客車的圖，換成使用者生成的遊覽車） | 開發分支已完成（候選之後） | 6f52d289（`src/data/camp_y1.js` 兩處 bg 改 `tour_bus`）、1796eef1（`assets/bg/tour_bus.webp`），都在快照之後或候選之後 | AA299-IMAGES-1018（看板仍寫等待） | BB 畫面驗收；其餘車內圖照 AA299-IMAGES-1018 的清單核對（白天車內 car_day 已換，28afd003） |
| 去宿營前一秒還在椰林大道（出發沒有過場） | 有企劃未實作 | `src/story3d.js` S.campY1 開頭沒有過場（看板稽核 B2：沒做） | BUG-CAMP-CUT-1018／X09 | LAWWW：校門集合／遊覽車過場，再進第一個活動；請 BB 從新遊戲看一次 |
| 8/29 搬進 203 四人房（阿凱、阿哲、柏翰；床在上、書桌在下）、8/31 開學典禮（體育館 2D）、9/1 開學、第一週就有劇情 | 線上可玩 | main `src/story3d.js:835`（ceremonyY1）、`src/outings3d.js:34`（ntu_gym_ceremony）、`src/data/dorm_room_layout.js`；tests/todo_opening_unit.js、tests/flow_main_day12.py | START-WEEK、DORM-LOFT-L、AA208-L／D09、D10、A08、C19 | — |
| 從法律系開局也有：8/29 21:30 可昕兩則訊息、8/30 開車載可昕上山搬政大宿舍 | 下一版（v9.10.3 候選） | 91fb70aa、b1be3639（候選）；f72a2a21 `src/story3d.js:56-72`（KX_FIRST_MSG）；tests/x81_law_e37_unit.js；BB ✔（CANDIDATE_9103） | BUG-E37-MOVEIN-1020、BUG-KXFIRST-0830／X81 | — |
| 法律系迎新改到開學前（8/31 上午；有宿營的局不辦） | 下一版（v9.10.3 候選） | main `src/data/activities.js:45` 還是 2025-09-27；f72a2a21 同一行改 2025-08-31 | WELCOME-DATE-1020／X80 | BB 驗收 |
| 開學第二天帶到霖澤館前的位置 | 開發分支已完成（候選之後） | e3375c94（候選之後） | （LAWWW-C 10-21） | BB 驗收 |
| 以安：錯過第二天照作息也遇得到，第一次說話用全名自我介紹「你好，我是沈以安。大家都叫我小安。」 | 下一版（v9.10.3 候選） | e319a31a（候選）；f72a2a21 `src/story3d.js:746`；tests/an_missed_day2_unit.js；BB ✔（CANDIDATE_9103 第 1 列） | BUG-MEET-HEROINES-1020（已驗收）、AA313-S4-1020（第 10 點）／X70 | — |
| 16 週學期：第 16 週期末、期末後停課、成績放假後第 3 個週一 | 線上可玩 | main `src/data/calendar.js:19`（TERMS）；tests/calendar_hours_unit.js、tests/multiweek_sim_unit.js | HOLIDAY-SYS、AA243-16W／D11 | — |
| 大四下改 15 週（AA_342 C4） | 下一版（v9.10.3 候選） | f85f5e7f（候選） | AA342-COVERAGE-1021（C4） | BB 驗收 |
| 一鍵上課（起床選單、直接去上課、選位子、下課選單）、時段次數制（上午 1、下午 2、晚上 2）、遲到規則 | 線上可玩 | main `src/classes3d.js:712`（wakeMenu）、`:792-815`（時段次數）；tests/dl01_oneclick_unit.js、tests/dl03_slots_unit.js、tests/flow_class_real.py | DL-01、DL-03、FIX-MENU-PHONE／D17 | — |
| 時段次數規則重新設計（走來走去不算，做一件事才算；三個方案） | 暫停 | 使用者 10-18 06:1x「先不要決定，給我幾個方案」 | DEC-SLOTS-1018／X19 | 使用者選方案（①做一件事算一次 ②只算時間 ③每時段一件主要的事）；恢復條件：使用者回來後 |
| 每週課堂內容（16 週版 syllabus：法律審查通過的週、第 16 週併進第 15 週） | 線上可玩 | main `src/data/syllabus.js:4`（SYLLABUS）；tests/syllabus_unit.js、tests/flow_lecture_attend.py | V3-SYL、V4-SYL | — |
| 大三上刑訴課的兩個修正：第 1 週不再演「上週我們談了刑事訴訟的目的」；第 15 週強制辯護的三句（黑板 → 小語 → 林教授） | 下一版（v9.10.3 候選） | 86beabca（候選）；f72a2a21 `src/data/events.js:420`（minWeek）；tests/crimpro_week1_unit.js；741a4a63（候選）；f72a2a21 `src/classes3d.js:229`（S.SPECIAL_PRE）；tests/aa103_sp_unit.js | V4-E2（看板寫待開工）、AA-103-SP（看板寫待開工） | BB：大三上 2027-12 刑訴第 15 週看順序 |
| 大三上刑訴作業：案例說明、第 7～11 週自己去地院旁聽（可以約以安／柏翰／阿哲）、第 12 週交答辯狀、第 13 週發回；大四那次旁聽拿掉 | 下一版（v9.10.3 候選） | f72a2a21 `src/r2y3a3d.js:75`（CR_BOARD）、`src/data/r2y3a_events.js:319-323`；tests/r2y3a_events_unit.js | CRIMPRO-HW-Y3S1、AA252-COURT（取消）／X31、D28 | 地方法院 2D（court_criminal）等使用者 |
| 法律系的課不只在霖澤館：萬才館多功能教室五門必修、霖澤館 202 八門選修；第一次在新教室一句旁白；202 上課有一般同學 | 下一版（v9.10.3 候選） | f72a2a21 `src/classes3d.js:226`（ROOM_FIRST）、`src/rooms_glb3d.js`；90973650；tests/x78_rooms_unit.js；BB ✔（CANDIDATE_9103 第 6 列，BB 分支 36faaeec） | LAW-CLASS-WANCAI-1020／X78 | — |
| 期末考：真的五題考試、抽題順序（課堂題 → 使用者題目 → AI 題補到 5 題）、全部 483 題、交卷有分數、考卷不顯示來源；選單「法律」頁只列上過的課 | 線上可玩 | main `src/classes3d.js:425`（EXAM_MIX）、`src/data/exam_bank.js:3`（399 題）、`src/data/legal_qbank.js:5`（刑訴 84）；tests/flow_exam_terms.py（LAWWW-C 第 2 層通過，RELEASES v9.10 短清單第 16 項）、tests/aa130_exam_unit.js；main `src/classes3d.js:172`、`src/game3d.js:359`（legalCourses） | EXAM-AI-1018、TEST-01（考試直向截圖還沒進 repo）／G01～G05、D41、BUG-21／G09 | 考試中直向露出「離開教室」待重現（BUG-08） |
| 成績制度：被當以後下一學期自動重修（衝堂換另一位老師、大四下沒過延畢）；非法律課出席三堂才及格、課表看得到次數、第 12 週提醒；書卷獎（法律科平均答對 4 題） | 有企劃未實作 | 現在答對 0 題＝0 分（main `src/classes3d.js:482` scoreOf），沒有重修；考試時段開學就公告已做（D14-T3），出席門檻沒做；書卷獎只有 `src/classes3d.js:520` 一句註解（看板稽核 B2：都沒做或做了一部分） | D14-T5、D14-T4、D14-T6／D42、D43、D44 | LAWWW 照使用者 10-18 02:2x 規則（「沒有暑修，下一學期再修」）、AA_126 第 1、2 節做；被當台詞 BB_120 請 AA 確認 |
| 社團：法服（隔週週六早上 9～12，大二起做紀錄）、以安的公法讀書會（大一上第 10～16 週週四）、社團博覽會 | 線上可玩 | main `src/story3d.js:341`（fafuShift）、`src/classes3d.js:271-278`（公法讀書會）；tests/clubs_aa110_unit.js、tests/flow_clubs.py、tests/v1f_fafu_sat_unit.js | FAFU-1017、AA238-1017、V1-F／D26、D27 | — |
| 偶遇：校園打招呼、一起走一段；自由出行景點三批 | 線上可玩 | main `src/data/encounters.js:9`、`src/data/enc_walk.js:2`；tests/dl07_enc_unit.js、tests/dl08_walk_unit.js、tests/enc_batch3_unit.js | DL-07、DL-08、ENC-B2-1017、ENC-B3-1017／D25 | — |
| 一直待在兩點半 Café、總圖：客人照時段進出，23:00 要走的客人會走（不再和站在門口的玩家疊在一起）；芷若在吧檯、學姊會進來 | 下一版（v9.10.3 候選） | 7e5907df、245304c6（v9.10.3 候選）；f72a2a21 `src/story3d.js:311`（S.cafeRefresh）；tests/cafe_refresh_unit.js、tests/cafe_customers_unit.js；BB ✔（CANDIDATE_9103 第 2 列，BB 5ad8a08b） | BUG-CAFE-NPC-1020（已驗收）、BUG-CAFE-REFILL-1020／X71 | — |
| 118 巷：霖澤館後面小廣場的後門出去、九間店門口點餐、常客、阿哲週一揪午餐 | 線上可玩 | main `src/lane118.js:10`（L118）；tests/lane118_unit.js、tests/flow_lane118.py（BB-C ALL PASS，RELEASES v9.10 短清單 17b） | ART-03（已驗收）／A15 | — |
| 118 巷九間店走得進去：店員在店裡、坐得下、點得了餐、晚上從店裡看出去巷子是暗的；店門口「進○○」比常客優先 | 下一版（v9.10.3 候選） | f72a2a21 `src/l118_shops3d.js:1-5`、`src/data/l118_shop_layouts.js`；tests/l118_shops_unit.js、tests/flow_l118_shops.py；BB ✔（CANDIDATE_9103 第 4 列） | LANE118-SHOPS-1020／X66 | 入口名牌不再疊成一排：只有 node |
| 118 巷遇得到熟人（照作息在店裡吃飯、在巷子走；期中期末週在霖澤館 3F／4F）、手機「地點」一開始就有 118 巷 | 下一版（v9.10.3 候選） | f72a2a21 `src/data/characters.js:21`（AA_320 作息）、`src/data/places.js:56`（lane118:1）；2be7254e（巷子路人）；tests/lane118_sched_unit.js、tests/lane118_walkers_unit.js | LANE118-ENC-1020、LANE118-PLACES-1020／X65、X68 | BB 驗收 |
| 118 巷每間店配合故事：熟客三段招呼＋考試週、H2～H9 | 有企劃未實作 | AA_311 交了（36fd57e8）；程式只接了一段（f72a2a21 `AA_311` 6 處） | LANE118-SHOP-STORY-1020（看板寫已實作待整合）／X66 | LAWWW 照 AA_311 做熟客三段招呼＋考試週、H2～H9（H2b 先不做） |
| 群組：班級群組、麵店團群組、家族群組；翹了討論課，群組照樣收得到轉述 | 線上可玩 | main `g:law_class` 11 處（例 `src/data/vac_activities.js:42`）；7fa05797（main）；tests/discuss_unit.js、tests/flow_discuss_class.py（v9.10.2 發布前 9/9） | V2-B37／H07 | — |
| 群組活動公告只寫時間地點，玩家不知道怎麼去（河濱烤肉） | 有企劃未實作 | 經濟系是事件接事件自動帶去；法律系那幾年沒有提示（看板稽核 B2：做了一部分） | UX-GROUP-NOTICE-1018 | LAWWW：公告後加一句系統提示，或當天由人私訊帶路 |
| 翹課不再跳過劇情：考試、民總劇情課不能翹（時間到帶去）、其他劇情延到下一次出席同一門課、兩處「你不在」的版本 | 開發分支已完成（候選之後） | 83f57345、1b85137e（候選之後）；tests/never_set_flags_unit.js | AA294-SKIPCLASS-1018／X23 | BB 驗收 |
| 打工：家教（第一堂柳丁、之後只有地點字幕） | 線上可玩 | main `src/data/events.js:1338-1341`（TUTOR_N） | V2-B32 | — |
| 打工系統：溫州街三家店（半熟、阿德影印、一盞茶屋）＋Café、書店、便利商店、補習班助教、事務所工讀；每週兩個班、薪水、每種 3～4 件小故事 | 有企劃未實作 | `src/wzshops3d.js` 只有預留的 JOBS.at；沒有 src/jobs3d.js（看板稽核 C：做了一部分＝接口） | DL-10、SYS-13、SYS-13-EV／B06 | LAWWW 照 AA_164／AA_165／AA_289 第 1～3 節做（先加白名單 AA_289）；先做大一下就能做的 Café、書房、便利商店 |
| 大一逐週補空白：麵店團群組五則（11/20 運動會「去／不去」、2/6 麵店…）、沒去的獎狀照片 | 下一版（v9.10.3 候選） | f72a2a21 `src/y1fill3d.js:1-4`、`src/data/y1fill_events.js:9`；tests/aa347_y1_unit.js | AA347-Y1-COVER-1021 | BB 驗收 |
| 大二上劇情（v3 已整合的 34 件，例：直屬學姊的帶法 MENTOR_STYLE） | 線上可玩 | main `src/data/events.js:3492`（MENTOR_STYLE）；tests/v3_batch1_unit.js、tests/v3_w6w7_unit.js | V3-*（34 件）／D14 | — |
| 大二第 2 輪 24 件（AA_325）、大二～大三上每位女主角的事件 1B-01～11、1C 群戲六件（春假三選一、中秋＝以安生日…） | 下一版（v9.10.3 候選） | f72a2a21 `src/y2r2_3d.js:1-4`、`src/y2b3d.js:1-4`、`src/group3d.js:1-5`；tests/y2_round2_unit.js、tests/y2b_events_unit.js、tests/group_events_unit.js | EVPKG-R2Y2-1020、EVPKG-1B01-07-1020、EVPKG-1B08-11-1020、EVPKG-1C01-06-1020／X82 | BB 照 BB_R2Y2_1020、BB_1B01-11_1C_CG_1020 實際觸發驗收 |
| 大三（含大二暑假、大三寒假）第 2 輪 54 件；大三下～大四下 1B-12～25；第 3 輪小事件 | 下一版（v9.10.3 候選） | f72a2a21 `src/r2y3a3d.js`、`src/r2y3b3d.js`、`src/y34b3d.js`、`src/r3_3d.js`；tests/r2y3a_events_unit.js、tests/r2y3b_events_unit.js、tests/y34b_events_unit.js、tests/r3_events_unit.js | EVPKG-R2Y3-1020、EVPKG-1B12-17-1020、EVPKG-1B18-25-1020、EVPKG-R3-1020／D15、X82 | BB 照 BB_R2Y3A／B_1021、BB_R3_1021 驗收 |
| 大三上主線：感冒的那一週（10/23～26）、志願表 11/17～18；搬進第三個房間 507（9/5 拆箱）、大四搬進 409（拆箱小道具、6/28 搬出）——房間模型 main 就有，搬進去的劇情在下一版 | 下一版（v9.10.3 候選） | f72a2a21 `src/story3d.js:934`（coldWeekTick，1A-04）、`:2609`（第三個房間，1A-03）；tests/cold_week_unit.js、tests/room_y3_unit.js；模型：main `src/zones3d.js:1401-1408`（dorm_room4.glb 的 Y507_／Y409_）；搬房間：f72a2a21 `src/story3d.js:2609`（1A-03 第三個房間）、409（1A-06～08）；tests/room_y3_unit.js、tests/room_y4_unit.js、tests/dorm_y3_items_unit.js | EVPKG-1A01-1020～EVPKG-1A05-1020、ART-DORM-Y34、SYS-06、DORM-Y34（看板已實作待整合）／A09 | 大三大四室友的晚上作息、AA_208 第 8 節旁白：LAWWW（DORM-Y34） |
| 大二搬進 312（9/6，阿哲、柏翰同房；拆箱、票根） | 線上可玩 | main `src/dorm3d.js:125`（homeOf ROOM_Y2）、`src/data/events.js:3648`（ROOM_Y2）；tests/v3_room2_unit.js、tests/dorm_y2_items_unit.js | DORM-Y2-312、V3-D1 | 窗外景、3D 小物件沒做（V3-D1 註） |
| 大一 203 的紙箱＋阿凱的國界膠帶（演完那一句就拿掉） | 開發分支已完成（候選之後） | 7ef4ff56（候選之後，整合 LAWWW2-C 36c07603） | ART-Y1-BOX-1021 | BB 畫面驗收 |
| 溫州街的故事：四條故事線＋單一事件（腳本、觸發、法律審查都好了）；小公園誰幾點在（平日九個時段、週末、寒暑假、下雨、大三上第 9 週貓不見） | 有企劃未實作 | `src/` 沒有這些事件（看板稽核 B2：沒做）；`src/` 沒有 AA_283（貓的四年已做） | DL-11／B05、AA283-PARK-1021、DL-13／B08 | LAWWW 照 AA_167（43ac6a69）轉事件、觸發照 BB_148 第 8b 節；故事小物 wz6、wz7、豆漿店道具一起搬進來（ART-WZ6、ART-WZ7、ART-SOY1）；公園：LAWWW 派子代理：crowd3d.js 公園時段表＋互動，接好 DL-13、B08 結案 |
| 已審好、等白名單的小事件：BB_105 女舍 D4～D9、日文班 G1～G10、博雅 B6～B13、普通教學館前的舊同學；BB_106 SK06～SK14、經濟系群組三則、品妤「你又在等人？」；BB_110 L4 文學院長椅 | 有企劃未實作 | 程式沒有（看板寫「等待其他AI／素材＝等 AA 白名單」，稽核 C：AA 已審，不必再問使用者） | V1-B105-D2、V3-B105、V3-B105-G2、V3-B105-B2、V3-B105-P5、V2-SK06、V2-SK07、V3-SK08～10、V5-SK14、V1-B106-D1D2、V1-B106-42、V3-B110-L4 | LAWWW 照 D94 第 5 點把 BB_105＠68a8479e、BB_106＠71b3e6c3、BB_110＠3a26e94a 加白名單，照 D81 在那一學期施工 |
| 大一下 S-3 阿凱的鍵盤（第 7 週週四 24:00 以前在房間；大二會讀到） | 有企劃未實作 | 只有讀 KAI_KEYBOARD 的那一句（main 起就有），沒有設它的事件 | BB154-KAI-KB、AA255-Y2S2 | LAWWW 照 BB_154 第 2 節（台詞請 AA 確認現行版） |
| 已交稿、還沒換進遊戲的台詞修正：大一上 BB 人物事件逐句改稿（AA_207）、邀約台詞定稿（AA_194 第 4 節＋BB_172）、AA_313 逐場修正（可昕四年 31 場、以安 43 場、語彤 25 場、麵店團 102 個事件、芷若子晴學姊沛珊四年） | 有企劃未實作 | 看板稽核：做了一部分；一部分做了（例 e319a31a 以安自我介紹）；看板稽核 B2：其餘逐點沒做 | AB65-2-L、AB65-2、V1-INV-WORDING、AA313-FIXES-1020、AA313-S4-1020、AA313-S5-1020、AA313-S6-1020、AA312-INTEGRATE-1020 | LAWWW 先用 check_lines 對 AA_207，扣掉 AA_303／AA_313 已改的，再換句；做完 AA 核對；LAWWW 照 AA_313 第 2～6 節逐點改＋改寫死的測試、重產 msg2_pool |

## 5. 人物與感情（認識、閒聊、告白、交往、多段關係、約會、期末飯、分開、畢業後）

> 戀愛現行規則：可以同時和多位交往、每段各自計算；告白只在學期末（一對一期末飯、心意邀約一定成功）。大二以後各女主角的關鍵場面多數在下一版候選（第 4 章的事件包），只有 node 測試。

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 認識以前不露名字（名字框「不認識的女生／法律系一年級的男生」），說過話才知道名字 | 線上可玩 | main `src/social3d.js:64`（displayName）、`src/phone3d.js:16`；tests/name_reveal_unit.js、tests/first_meet_unit.js | BUG-NAME-LABEL-1020（已驗收） | — |
| 以安的名字在說過話以前也不露（X70 後續） | 下一版（v9.10.3 候選） | 7e5907df（v9.10.3 候選）；f72a2a21 `src/social3d.js:64` 新版 displayName；BB ✔（CANDIDATE_9103 第 1 列） | BUG-NAME-LABEL-1020／X70 | — |
| 閒聊階梯：每個人一層一層聊，大一上～大四下每學期都有（線上 10 個學期鍵），聊過的不再重複；關係六維、到門檻的台詞、見面一句 | 線上可玩 | main `src/data/ladder.js` byTerm Y0S1～Y4S2（node 讀檔：Y1S1 7 人、Y1S2 7、Y2S1 7、Y2S2 6、Y3S1 6、Y3S2 7、Y4S1 4、Y4S2 5）；tests/ladder_unit.js、tests/ladder_y1s2_y2s1_unit.js、tests/flow_ladder_y1s2.py；main `src/data/rel_lines.js:13`（REL_LINES）；tests/rel_lines_unit.js、tests/rel_feel_unit.js | V2-L2、SYS-15、LADDER-Y3Y4／D24、D14-T7、V6-S2 | 大四上多一人（5 人）在下一版 |
| 關係看得到：人物頁六階段名稱＋進度條（不顯示數字）、正式約會次數與心願地點；邀約回覆照階段變、不連續重複同一句 | 有企劃未實作 | `src/game3d.js` renderPeople 沒有進度條（看板稽核 B2：做了一部分）；邀約回覆：看板稽核 B2：做了一部分 | D14-T8、SYS-01、DATE-S1／D36、D14-T9／D37 | LAWWW 照 AA_126 4-1 六階段做進度條；AA 先修 BB_123 學姊、沛珊消失期的句子 → LAWWW 照 DATE.stageNum 分六階 |
| 學期末一對一的飯＋心意邀約（大一上～大四上），告白只在這裡；門檻＝她的戀愛 30＋4 次正式約會含一次心願地點；保底一定有人約 | 線上可玩 | main `src/termend3d.js:13`、`:58`（S.cond）；tests/termend_unit.js、tests/confess_unit.js、tests/flow_termend.py（v9.10.2 前 12/12） | BB203-CONFESS-1017、ROM-1017、TE-HOOKS-1017／D30、D31 | — |
| 告白的最後兩場：大四下畢業那天傍晚的心意邀約、畢業後 2029-07-14 最後一次（選「讓我想想」的那一位） | 下一版（v9.10.3 候選） | f72a2a21 `src/termend3d.js:177`（AUTO_ME_GRAD）、`src/data/r2y4b_events.js:248`（ev_heart_july）；tests/r2y4b_events_unit.js | AA263-Y4S2、BB210-Y4S2（看板待開工）／D54 | BB 驗收 |
| 台詞細修（AA-C 10-21）：女朋友學期末約會的飯桌那一句每學期不一樣；人物不會知道不該知道的事（13 句改成每條路線都成立）；「你欠我一次」說了以後有下文 | 開發分支已完成（候選之後） | 634f6324、ac91ebea（候選之後）；`src/data/termend_lines.js:120`、`src/termend3d.js:160`（AA_352）；db572d57、cb3ad00d（候選之後）：encounters.js、events.js、invites.js、vac_activities.js、story3d.js 各改幾句；4ab8110f（候選之後）；`src/data/events.js:1781`（AA_356）；tests/r2y3a_events_unit.js、tests/r2y4b_events_unit.js | AA352-GF-TABLE-1021、AA356-DEBTS-1021、（db572d57 AA-C 清查） | BB：各看兩個學期、四條路線各跑一次 |
| 同時和多位交往、每段各自計算（誰知道誰、懷疑會累積） | 線上可玩 | main `src/romance3d.js:83`（S.partners）、events.js `KNOWS` 判斷 87 處；tests/romance_unit.js、tests/knows_spread_unit.js、tests/knows_gf_unit.js | V6-S1b、V6-X2、KNOWS-SPREAD-1017／D34（地基） | — |
| 分開以後不會永遠不能再交往：「收拾的時刻」一週後自動補旁白 | 下一版（v9.10.3 候選） | c2035d7f（候選）；`CLEANUP_DONE`（main 8 處 → C 14 處）；tests/cleanup_unit.js | V6-S4（看板進行中） | 一週內的三選一（紙箱、阿哲頂樓、手機筆記、BB 五位的物件）還沒做：LAWWW 和 V6-S5 一起派 |
| 畢業前選一個人：其他幾位的分開談話（七位、她知道／不知道兩版；2029 選的隔天起一晚一位；三次沒到轉電話版） | 下一版（v9.10.3 候選） | f72a2a21 `src/data/r2y4b_events.js:10`（ev_choice_apart_*）；tests/aa346_apart_unit.js | EVPKG-AA346-APART | AA_346 第 3-0 節換 15 句在候選之後（6ee9e78d，H）；BB 清單 BB_AA346_1021.md |
| 裂縫計數 → 談話事件（同一學期滿 3 次）、以安語彤 A2～A8、BB 人物 B1～B7 的修補／好好分開／前任分支 | 有企劃未實作 | `src/romance3d.js:17` 只有 KX_CRACK 計數器；沒有 ROM.crack 談話（看板稽核 B1：沒做） | V6-S5、V6-A2、V6-A3、V6-A5～A8、V6-B1、V6-B2、V6-B4～B7、AA185-V6 | LAWWW 照 AA_123 4-2、5-2、BB_119 第 2 節，和 AA351、AA354 同一批派 |
| 可昕線的兩包：「個性磨合不了，慢慢分手」（D0～D6 七段、只在學期末分手、分開後只能當朋友）；「我們的日子」大二到大四（大二每週、大三大四隔週、交換視訊、分手停） | 有企劃未實作 | 只有計數器 `src/romance3d.js:17`（KX_CRACK）；程式沒有 AA_354 | AA351-KX-DRIFT-1021／C23、AA354-KX-OURDAYS-1021／C23 | LAWWW 照 AA_351、AA_354 同一批派子代理（和 V6-S5 一起） |
| 知情的曖昧、知情後告白（只在學期末）、被發現、挽回（七位）；第一次正式約會開頭她問一次 | 有企劃未實作 | 程式沒有這幾場；她問到祐廷感情狀態時記誠實／閃避／說謊的機制在開發分支（1b85137e、7e141b81，H：`src/events3d.js:114`） | EVPKG-AA227-228-KNOW（看板待開工）、BB194-YTFLAGS（看板待開工）／D35（**USER_WANTS 寫暫停：等使用者看提案**） | 兩邊要先對齊：使用者是否已同意實作（AA_350 R1）；同意了再派子代理，先做明確曖昧和發現 |
| 芷若×子晴「從摯友到戀人」（6/5 交往；祐廷正在追其中一人時順延下學期） | 有企劃未實作 | 只有鋪陳句（`AA_232` 2 處）；三場沒做 | AA243-P02、AA290-INTAKE／C22 | LAWWW 先收 AA_232（白名單）做 4-2～4-4 |
| 學姊交往那天起叫「書瑀」（對話、選項、手機；祐廷說出口的「學姊」也換句） | 開發分支已完成（候選之後） | 候選只有大峽谷告白那一處（f72a2a21 `src/data/r2y4b_events.js:380`）；1a1b3a3f（候選之後）`src/romance3d.js:78` 交往那天就記、`src/social3d.js:113-114`；8a1a2ef8（快照之後，AA_350 R7：兩點半 Café 選一個「書瑀。」） | SIS-SHUYU-1017／C15 | BB 驗收 |
| 學姊：直屬、大四（祐廷大一）、一開始沒有男朋友；W1 祐廷先開口 | 線上可玩 | main `src/data/characters.js:49`（year:4）；`SIS_W1` 等 34 處（例 `src/classes3d.js:160`）；tests/sis_a51_unit.js、tests/sis_walkin_unit.js | SIS-GRADE-1017、SIS-W1-1017／C14、D49 | — |
| 學姊準備台大法研所的那一年（一定上榜、婉拒不扣好感、她不在群組起頭） | 下一版（v9.10.3 候選） | f72a2a21 `src/sis_grad3d.js:1-4`；tests/sis_grad_unit.js（90 項） | SIS-GRADSCHOOL-1017／D47 | BB 驗收 |
| 以安：媽媽高等法院庭長、單親、家在台中；結局：應屆司法官、法研所都放棄，去哥大 LL.M.，回台灣當律師 | 下一版（v9.10.3 候選） | 家庭設定 main 就有（`src/data/characters.js:17-22` 的庭長、單親、台中）；結局 f72a2a21 `src/data/characters.js:22`（possible_endings 改「去紐約念 LL.M.、回來當律師」）、`src/data/r2y4b_events.js:4`（ev_an_grad_pass）、`:8`（ev_an_columbia） | AN-RICH-1017、YT-ENDING-LAWYER（AA_285）／C12、C13 | BB 驗收 |
| 語彤：大二起社會系＋法律系雙主修；五種結局都建在律師上 | 下一版（v9.10.3 候選） | 雙主修 main 就有（`src/data/characters.js:34` heroine_03 tagByPY）；結局 f72a2a21 `src/postgrad3d.js:322`（S.ytEnd） | （AA_11 結局表）／C21、X34 | BB 驗收 |
| 明軒：交換錄取但經費不夠放棄、畢業後自己存錢去德國 | 下一版（v9.10.3 候選） | f72a2a21 `src/data/group_events.js:146`（SAW_HIM_TRY）、`src/r3_3d.js:337`（y3s2_mx_save，家教存德國那筆） | （看板沒有任務）／C18 | BB 驗收 |
| 沛珊：消失前什麼都不說、放榜後在台南念大學、不回台大、只能私下約；交往中每天聯絡 | 下一版（v9.10.3 候選） | 消失前的句子 main 就有（`src/data/events.js:3170`）；台南 f72a2a21 `src/data/characters.js:69`（TAINAN）、`src/data/hometown_lines.js:35`；tests/peishan_tainan_unit.js、tests/peishan_doubt_unit.js | PS-TAINAN-AA282（AA_281、AA_282）／X01 | BB 驗收；快照之後又接了台南五張背景（1fd0d419：學校、老街、美術館、運河、二手書店）、AA_350 P1／P5（放榜後第一次回覆照她那天在哪，f27df6dd） |
| BB_119 還沒做的兩場：沛珊放榜回來那天（2027-08-06：10:00 私訊、12:00 總圖外面台階、CG BCG-22）；芷若 2028-08-26 出發前最後一場可以告白（例外：我等妳回來＝遠距交往） | 有企劃未實作 | `src/` 沒有 ev_peishan_results（grep 0）；芷若：看板稽核 B2：做了一部分（沛珊、子晴那兩場不再告白）；8/26 例外沒做 | PS-RESULTS-1018、V6-B1、BB119-Y4-1017、V6-B5／D53 | LAWWW 照 BB_119 1b-3＋AA_276 6-2＋AA_282 第 1 節；芷若：LAWWW 照 BB_119 3-2（台詞請 AA 確認） |
| 芷若：2029-09-01 回 Café 上班那天在杯子上寫字（「熱拿鐵・不加糖」「一年。」） | 下一版（v9.10.3 候選） | f72a2a21 `src/data/r2y4b_events.js:252`（ev_zhiruo_back_cafe） | ZR-RING3-CUP／X36 | BB 驗收 |
| 芷若在英國照交情聯絡（認識＝社群發文、朋友＝一週一兩次私訊＋明信片、曖昧＝每月視訊、交往＝每天一則） | 開發分支已完成（候選之後） | 9e13e96b（候選之後）；`src/msg3d.js:70-72`、`src/data/msg_pool.js`；tests/msg_chat_unit.js | VAC-ZR-UK-1017（看板進行中）／E07 | 還沒做：每月每週約好的視訊、英國的生日新年句、子晴另外兩句；BB 驗 2027-10、2028-11 |
| 劇情一致性修正（快照之後 AA 交的）：可以錯過的事被說成發生過（阿哲麵店問「下午你跟小安去哪了」要看有沒有約…）；使用者 10-17 已回、漏登四天的劇情審查四題（子晴自己決定、學姊考試前後、子晴河堤乙、沛珊重考期消失） | 有企劃未實作 | AA_358 第 2 節快照之後交了（659d9d81）；AA_360（ff6f5923）快照之後交了；例：`src/y34b3d.js` S.zqGame 要一律 nine | AA358-KNOW-FIX-1021、STORY-AUDIT-1017／X95 | LAWWW 和 AA 回覆的小修同一批派；階梯四檔先改白名單再匯入；LAWWW 照 AA_360 改 |
| 吃東西不只是花錢：遇到認識的人一起吃、吃過的、店員認得你＋「老樣子」 | 下一版（v9.10.3 候選） | 105f9f76（候選）；f72a2a21 `src/eat3d.js:16`、`src/data/eat_lines.js`；tests/eat_unit.js | EAT-EFFECT-1020／X67 | BB 驗收 |
| 校外單獨約會：預約、到時間出發、交通、到了以後的互動點、約好同行 | 線上可玩 | main `src/date3d.js:11`（DATE）、`:103`（listable）；tests/date_core_unit.js、tests/date_book_unit.js、tests/date_trip_unit.js、tests/flow_trip_date.py | DATE-S2～S5、SYS-02／D32 | — |
| 約會地點：線上有底圖又有台詞的 16 處 → 開發分支匯入 32 處台詞後 23 處進清單 | 開發分支已完成（候選之後） | main 16 處（`src/data/date_lines.js` 17 個地點×OUT.BG 底圖）；7ef4ff56、634f6324、6ee9e78d（候選之後）`date_lines.js` 32 個地點 | DATE-L01～L27（L15、L16、L22、L23 以外的 23 項，已整合待測試）／D33 | BB 驗收 |
| 約會地點 D15、D16、D22、D23 沒有底圖，不出現在清單 | 等待美術／素材 | 台詞已匯入（7ef4ff56）；`src/outings3d.js` 沒有 d15／d16／d22／d23 底圖 | DATE-L15、DATE-L16、DATE-L22、DATE-L23 | USER_WANTS D33 註：其中幾張（d15_base_night 等）使用者 10-17 已核准，LAWWW 可直接接進 assets/bg＋OUT.BG（逐張進白名單） |
| 兩天一夜的約會（D26～D32：住宿 +2,500、第 6 階或交往中、沒交往兩間房一句旁白）、開車跨縣市約會（宜蘭等） | 有企劃未實作 | 31fcaccf `src/date3d.js:91` S.STAY 沒有 overnight；AA_359 住宿規格快照之後交了（c7dd0000，登記 96af1e54）；開車：只有可昕春假那一趟（SYS-18 只做了「從宿舍出發要先回家取車」） | DATE-OVERNIGHT-1021（待開工）；DATE-L28～L32（暫停，做完就解除）；SYS-18／D39 | LAWWW：發布前測試跑完派子代理，date3d.js S.STAY 加 overnight；d28a／d28b 底圖登錄進 OUT.BG |
| 約會的 2D 疊圖（底圖上可點熱區、她的人物圖層）、心願事件（以安 D07、語彤 D13、芷若 D05、子晴 D03、學姊 D15、沛珊 D06、可昕 D25） | 有企劃未實作 | 現在是文字選單；看板稽核：做了一部分 | SYS-03、SYS-04、DATE-S6、DATE-C2～C5、ART-14／I07、I08 | LAWWW 照 date_system/art/Dxx_coords.json 做疊圖；心願事件先加白名單 wish_aa.json、wish_bb.json |
| 一年三個情人節（2/14、3/14、七夕）、一天最多兩場、國外視訊版、禮物；七位各一張節日 CG | 有企劃未實作 | 只有路線專屬的幾場（可昕七夕 f72a2a21 `src/data/r2y3a_events.js:59`、日本七夕 `src/data/jp_events.js:137`）；共用的節日系統沒做；`cg_valentine_taichung_heroine01` 登錄了沒有呼叫 | D14-T11、DATE-C7／D38、I09 | LAWWW 照 AA_126 第 7 節＋BB_124 做；圖都有了 |
| 腳踏車一開始就有載妹墊、約好同行坐後座（學姊也能載） | 線上可玩 | main `src/story3d.js:663`（rideInfo）、`src/bike3d.js`；tests/bike_seat_unit.js、tests/flow_bike.py | DONE-B13、DONE-B09／D22 | — |
| 開車：可昕春假開車旅行（大一、大二、大四） | 線上可玩 | main events.js `ev_kexin_trip_spring_y1`；`cg_dont_sleep_kexin`（main 有） | V2-K8D／X02 | 背景：白天車內、海邊、老街快照之後接上（28afd003）；`car` 那一組還有 16 句深色底（black_bg_audit，a5d4880e） |
| 健身與體態（運動來源、體態影響旁白與人物反應） | 有企劃未實作 | 健身房在線上（`src/gym3d.js`）；體態沒做 | D14-T10／D40 | LAWWW 照 AA_126 第 6 節 |
| 七位都要有完整的戀愛故事（BB_165 沛珊 5-1、5-2、芷若 3-2、子晴 Q15、可昕 K7 卡片翻頁；AA_187 口氣） | 有企劃未實作 | 看板稽核 C：做了一部分；暫停條件（v9.10 發布後）已成立 | PLAN-1016-ROM、AA349-KL-1021（BB_165 5-1、5-2 沒做）／C09 | LAWWW 對 BB_165 第 8 節逐項打勾、補做 |
| 人物口氣照 10-18 的口氣表（可昕火爆、學姊包容好笑、子晴理工腦…） | 有企劃未實作 | 階梯口氣已進；其他台詞檔還沒換版本（稽核 D） | AA290-INTAKE／C11 | LAWWW 照 AA_290 第 4-1 節逐檔換白名單、重匯 |
| 人物外觀：主角與五女主（VRoid 改作）；阿哲、芯慈、柏翰、沛珊、可昕、小語、經濟系人物是 Blender 版（預設）；路人男女各 20 種、附近不撞衫、絕不退化成醜模型；2D 立繪 25 位第一版＋表情 45 張 | 線上可玩 | main `src/assets3d.js:30-31`（heroine vroid）、`:32-46`（ART-05 Blender 版是預設、bl_kexin）、`:45`（bl_yu.vrm）；`STORY.CROWD_X`；tests/anon_dedup_unit.js、tests/model_upgrade.py；main `assets/portraits/<id>/`（27 個資料夾）、`src/data/portrait_manifest.js` | ART-05、ART-YU-3D-1018、NPC-CROWD-1017、NO-UGLY／C02、C05、C06、X12、X18、ART-09、DLV-1016-09 | 人物美術沒有標 ART_APPROVED（阿勳以外）；精修暫停（下面） |
| 明軒的專屬 3D 模型 | 有企劃未實作 | `src/assets3d.js` 沒有明軒專屬 VRM（grep mingxuan 0） | ART-13（看板待開工） | LAWWW2 接帳號 A 的 WIP 腳本（ae6e4dfa）；人物凍結期間要不要做先問（D99） |
| 事件要用的新立繪（學姊西裝／學士服／碩一、芷若學士服、沛珊圍裙、以安冬裝、子晴爸爸、溫爸溫媽） | 等待美術／素材 | `assets/portraits/` 沒有這些服裝 | ART-16／I11 | BB 照 D97 寫 7 組提示詞向使用者要 |
| 沛珊走路、上樓梯時手不再穿進長裙（上臂外張、前後擺幅收小，只改她一個人） | 開發分支已完成（候選之後） | 1a76beab（快照之後，整合 LAWWW2-C cfd0e566） | ART-PS-SKIRT-HAND（已整合待測試） | LAWWW 用遊戲內截圖驗收（D100a） |
| 沛珊上樓梯時左小腿、膝蓋從長裙前面穿出來 | 有企劃未實作 | LAWWW2 停成 WIP（27618d8d：只改裙子權重兩全不了） | PS-SKIRT-LEG | LAWWW2 加前片骨頭或布料碰撞；正式 VRM 先不動 |
| 偶發全黑／面膜臉、學姊兩個臉（週三晚上總圖外） | 有企劃未實作 | 沒重現（看板稽核 B1、C） | BUG-02、BUG-04、BUG-03／C24 | BB 先在瀏覽器重現；全黑要 iPhone 實機 |
| 人物美術：主要角色做成共用模板；現有 3D 精修（人物五官、材質光影） | 暫停 | 人物凍結（D99）；使用者 10-17 05:0x「修改人物的事情暫停」 | CHAR-TEMPLATE／X39、ART-POLISH（光影部分進行中）／I05 | 使用者決定人物凍結要不要解除（光影部分 LAWWW2 照常做） |
| 法律系四年的可昕、其他人物劇情用選擇題逐場確認 | 暫停 | 使用者 10-20 說不要再問選擇題，和 10-18 的要求衝突 | AA-LAW-RECONFIRM／X33 | 使用者回來時問要繼續還是取消 |

## 6. 手機（訊息、主動傳訊息、自動跳出）、快轉、行程

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 手機：今天、課表、朋友在哪、活動、約人、地點（快速前往）、跳過時間；選單和另一個重複的頁面整合 | 線上可玩 | main `src/phone3d.js:13`（PHONE）、`src/data/places.js:7`（PLACES）；tests/quick_travel_unit.js、tests/find_person_unit.js、tests/friends_list_unit.js | DONE-B07、BUG-FRIENDS-KEXIN／H01、H02、H06 | — |
| 畫面上直接寫今天幾月幾號、星期幾 | 線上可玩 | main `src/classes3d.js:106-109`（todayLine）；tests/weekday_sync_unit.js | DONE-B02（10-15 試玩第 1 項）／H04 | — |
| 手機訊息照 LINE：對話列表（立繪頭像、名字、最新一句、時間、未讀、待回覆），最新的在最上面；點進去從最新一句開始、往上滑看以前的、表頭固定；別人靠左、自己靠右 | 線上可玩 | 3b2f2618、f4a5755f、e88246af（main）；main `index.html:82`、`src/game3d.js:525`；tests/phone_line_list_unit.js；TEST_RESULTS_1018 第 0a 節 ALL PASS | PHONE-LINE-UI-1018（已驗收）／X50 | — |
| 要回覆的訊息到了，手機自己跳出來、先停在列表（「我根本不會看手機」） | 線上可玩 | main `src/story3d.js:473`、`:844`（自動打開）；tests/phone_auto_unit.js | UX-PHONE-AUTOOPEN-1018（D103）／X25 | — |
| 主動傳訊息給朋友：第一批話題（15 人）、第二批（謝謝、生日快樂、還好嗎、新年快樂）；經濟系那年傳給可昕的回覆 | 線上可玩 | main `src/data/msg_pool.js:6`、`src/data/msg2_pool.js:5`、`src/msg3d.js:11`、`src/data/msg_kx_y0.js`；tests/msg_chat_unit.js | SYS-PHONE-CHAT、MSG-2、MSG-KX-Y0-1018／H05 | — |
| 約人：手機和當面都能約、朋友清單（可昕在）、邀約的回覆、為什麼約不到會寫原因 | 線上可玩 | main `src/invites3d.js:14`（INV）；tests/invites_unit.js、tests/invite_people_unit.js、tests/invite_whynot_unit.js、tests/flow_invite_phone.py | DL-12、BUG-FRIENDS-KEXIN／H03、H06 | 照階段變的回覆見第 5 章（D14-T9） |
| 需要回的訊息（主線的私訊、沒回的那一句後果） | 線上可玩 | main `src/data/needed_msgs.js:7`；tests/v3_needed_unit.js | （主線 4 的私訊；BB_165 等） | — |
| 沛珊主動訊息減量（M5、M6 刪、出國每天一則改隔天） | 線上可玩 | e80e84e9（main）；main `src/data/vac_activities.js:260`（沛珊出國訊息 every:2）；tests/bb120_fixed_unit.js | PS-MSG-LESS-1018（看板進行中） | M14 改發公法讀書會群組還沒做：AA 定一句群組回覆規則 → LAWWW 改 ps_q |
| 中秋烤肉的揪（阿哲、可昕那一則）有回覆期限：週六 15:00 開始以後不能再回（原本到隔年一月還是「待回覆」） | 開發分支已完成（候選之後） | 5c471a79（候選之後） | （BB-C 10-21 P3） | BB 驗收 |
| 交換期間手機時差（台灣時間另外照時差算） | 線上可玩 | main `src/story3d.js:2921`（S.tzOffset） | US-MIN-FLOW | 日本時間（+1）在下一版（`src/jp3d.js:5`） |
| 睡覺：選了「睡到明天早上」被電話叫醒（例：11/17 22:00 可昕），講完床的選單自動再出來；睡覺途中不插進別的事件 | 下一版（v9.10.3 候選） | a335c23f（候選）；tests/sleep_resume_unit.js、tests/bed_nap_unit.js | BUG-BED-RESUME-1020 | BB 驗中（CANDIDATE_9103「另外修的卡住」） |
| 跳日期／快轉途中收到要回的訊息就停、打開手機，按「跳過」接著跳 | 線上可玩 | 經濟系：main `src/econff3d.js:72`、`src/home3d.js:160`（見第 1 章）；法律系寒暑假在下一版（第 2 章） | SKIP-MSG-POP-1018、HOL-FF-AA340-1020／X58 | — |
| 退宿以後手機「地點」最上面是「回臺北的家」，不再跳腳踏車停在宿舍門口的提示 | 線上可玩 | main「回臺北的家」31 處（例 `src/data/events.js:2310`）；`src/bike3d.js:55`（Y0_MOVED_OUT） | DORM-AFTER-MOVEOUT-1018、BUG-HOME-BIKE-HINT-1018、BUG-DORM-AFTER-MOVEOUT-1018 | — |
| 手機「地點」有 118 巷（一開始就知道） | 下一版（v9.10.3 候選） | f72a2a21 `src/data/places.js:56` | LANE118-PLACES-1020／X65 | BB 驗收 |
| 行程：假期行事曆（報名）、考試時段開學就公告、邀約避開考試 | 線上可玩 | main `src/vac3d.js:10`（行事曆報名）；`src/classes3d.js` 考試公告（D14-T3 已整合）；tests/exam_slots_unit.js | D14-T3、HOLIDAY-SYS／D43（公告部分） | 出席三堂見第 4 章 |
| 學期中的「精華日」：手機週曆標出有事件／有約的日子，一鍵快轉到下一個精華日（條件事件順延） | 有企劃未實作 | 寒暑假的摘要日已做（`src/story3d.js:2097` 一帶）；學期中的精華日沒做（看板稽核 B2：做了一部分） | SYS-08 | LAWWW 照 AA_90 第 10 節 |
| 法律系四年只用手機演的五件重要劇情改成當面或演出來的電話（以安美國交往版視訊、子晴 Q15 回答.exe、可昕考上律師 12/14 電話…） | 有企劃未實作 | 看板待開工 | AA296-PHONE-LIVE-1021 | LAWWW 和 AA350-ANSWERS-1021 同一批派；寫死的測試照改 |

## 7. 存讀檔與舊存檔相容

> 使用者 10-18 03:4x：「不用舊存檔測試了，我會直接從新完」——v9.10 起舊存檔相容不再列為發布條件（save_compat_v7 不跑）；只看經濟系 → 法律系同一份存檔接得上。

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 自動存檔、三格手動存檔、匯出／匯入（匯入前先備份）、標題畫面不會蓋掉進度 | 線上可玩 | main `src/game3d.js:4`（fatiao3d_auto、fatiao3d_slot_、fatiao3d_backup）、`:266`（validate）、`index.html:162`（匯出）；tests/save_compat_v95.py、tests/save_compat_start1.py | J02（D20） | — |
| 在家（休學在家、放假、週末回家）也能存檔 | 線上可玩 | main `src/home3d.js:157`、`:180`、`:345`（「存檔」） | UX-HOME-SAVE-1018／X26 | — |
| 經濟系那一年的進度：讀檔後從下一個沒做的事件接（ECONFF 紀錄），經濟系 → 法律系同一份存檔接著玩 | 線上可玩 | main `src/econff3d.js:1-9`（存檔 G.flags.ECONFF）；tests/v0_tolaw_unit.js、tests/flow_v0_tolaw.py | V0-A4、SYS-ECON-FF-1018 | — |
| 舊存檔的人物「第一次見面」紀錄補齊（不會讓熟人重新自我介紹） | 線上可玩 | main `src/game3d.js:292-293`（舊存檔的初遇改標「一般招呼」，相遇事件不會永久錯過）；tests/save_firstmet_unit.js、tests/save_firstmet_migration.py | （AA_120 7-4，v9.6） | — |
| 讀檔、過午夜、跨日出遊都照行事曆算星期（使用者 9/25 存檔星期差一天的問題） | 下一版（v9.10.3 候選） | f72a2a21 `src/game3d.js:58`（syncWeekday）；tests/weekday_sync_unit.js；BB ✔（CANDIDATE_9103 第 3 列，用使用者 9/25 存檔五個點；高雄三天兩夜沒測） | BUG-DATE-TIMETABLE-1020／X76 | — |
| 讀檔時清掉舊的交換申請選單（路線改照交往定以後） | 下一版（v9.10.3 候選） | ea4fac8c（候選） | EVPKG-1A02-1020 | — |
| 舊存檔的人物面板備註照新說法顯示（43 筆；露出開發代號的換掉、和名稱重複的清空） | 開發分支已完成（候選之後） | 382236a5（候選之後）；tests/note_n9_unit.js | AA350-ANSWERS-1021（N9） | BB 驗收 |
| 劇情鎖住 10 秒的保底（可以讀檔、回標題）＋卡住紀錄（匯出存檔帶 `_stuck`） | 線上可玩 | a0926112、d3643e46（main 的祖先）；main `src/game3d.js:395`（stuckLog）；tests/stale_lock_escape.py | BUG-BOWL-STUCK-1018 | — |
| 選單被另一段劇情的選單蓋掉時，等上面那段演完再放回來（使用者 v9.10.2 的 _stuck 8/30 床邊選單；搬回家以後卡住、保齡球卡住很可能同一個原因） | 下一版（v9.10.3 候選） | 778ca207（候選）；f72a2a21 `src/game3d.js` chooseStack；BB ✔（CANDIDATE_9103 第 1 節「另外修的卡住」，BB 分支 6ae5e693） | BUG-E37-MOVEIN-1020、BUG-MOVEOUT-STUCK-1018／X81、X48 | X48 還要 BB 用使用者 10-18 的存檔重走一次 |
| 換區域多次以後被踢回標題（iPhone 記憶體）：路人骨架貼圖釋放 | 線上可玩 | main `src/assets3d.js:265-268`（disposeClone 釋放骨架貼圖）；tests/vrm_release_unit.js、tests/zone_memory.py（Playwright，不是 iPhone） | BUG-01（已驗收；iPhone 實機沒驗） | — |
| iPhone 去政大找可昕等長出遊時被踢回標題，自動存檔在出發前要一直重來 | 有企劃未實作 | 看板稽核 C：做了一部分；tests/reload_resume_unit.js、tests/dorm_start_memory.py | BUG-IOS-RELOAD（看板進行中）、TEST-05（暫停：等使用者 iPhone） | BB 用 dorm_start_memory.py 量來回多次的貼圖數；若持續上升，LAWWW 做離開區域時釋放 GLB；iPhone 實機等使用者 |
| 經濟系進法律系：9/1 早上畫面寫 8/31、上完課才變 9/1（使用者回報） | 暫停 | 重現不出來 | BUG-DATE-0831-1018 | 等使用者說當時怎麼操作，BB 照做重現 |
| 8/30 凌晨 2:30 快轉多一個空的停點（之後真實時間 20 分鐘才到 7:30） | 有企劃未實作 | 看板稽核 B2：沒做（BB 舊版回報） | BUG-0830-EMPTYSTOP-1018 | LAWWW 在 node 重現，或請 BB 用新版 MODE=ff 再跑一次 |

## 8. 地圖、場景、操作、效能（3D 場景、碰撞、鏡頭、觸控、多樓層）

> 所有瀏覽器測試都是 Playwright 手機模擬＋SwiftShader（1～4 fps），**沒有 iPhone 實機測試**（TEST-05 暫停：等使用者）。效能數字是 BB 在 SwiftShader 量的 draw call，不是實機 fps。

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 校園照臺大平面圖（大門 → 椰林大道 → 總圖、傅鐘、醉月湖、小椰林道）；天空有雲、晚霞、遠方天際線；淺灰柏油 | 線上可玩 | main `src/zones3d.js:94`（campus 區域）、`src/engine3d.js:69`、`:111`（makeSkyline 遠景）；tests/campus_layout_nav.py | A01、A19、A20（D23、D25、D24、D30） | — |
| 霖澤館（穿堂、雙跑樓梯、玻璃電梯、二樓、201 階梯教室 48 個座位都能坐）、萬才館（弧形大樓梯走得上去、室內兩層、電梯） | 線上可玩 | main `src/data/linze_layout.js:3`、`src/data/wancai_layout.js:3`；tests/nav_buildings_unit.js、tests/flow_linze_floors.py、tests/flow_wancai_floors.py、tests/flow_wancai_stairs.py | A02～A04（D36、D37、D41、D42） | — |
| 霖澤館 3F 學生討論區、4F 自習討論區（野餐桌、窗邊吧檯、電梯、樓梯；期中期末有同學在討論） | 下一版（v9.10.3 候選） | f72a2a21 `src/linze_upper3d.js:1-3`、`src/data/linze_upper_layouts.js:2`；tests/linze_upper_unit.js、tests/flow_linze_upper.py | LINZE-34F-TABLES-1020／X74 | BB 驗收 |
| 霖澤館 202、萬才館 1F 多功能教室、2F 研討室 A 走得進去（有社課時照舊在門口參加） | 下一版（v9.10.3 候選） | f72a2a21 `src/rooms_glb3d.js:1-5`、`src/data/room_glb_layouts.js`；tests/rooms_glb_unit.js、tests/flow_rooms.py | LINZE-WANCAI-FLOORS-1020／X73、X78 | — |
| 霖澤館樓層簡介不再寫 202「整修中」 | 開發分支已完成（候選之後） | 7ef8af6b（候選之後） | （稽核 D X73） | — |
| 霖澤館 5F～8F 研究室、萬才館其他樓層（現在按不亮／關著） | 有企劃未實作 | `src/linze_upper3d.js:3`「4F 往上（研究室）關著」 | LINZE-WANCAI-FLOORS-1020（剩下的）／X73 | LAWWW 決定要不要開，開的派 LAWWW2 |
| 總圖：大廳、帝國式大樓梯、二樓自習區（長桌可以坐）、3F 閱覽區、電梯；窗外是視差的景 | 線上可玩 | main `src/data/library_layout.js:3`、`src/library3d.js:70`（parallaxViews）；tests/flow_library_floors.py、tests/flow_library_scene.py | A05（D43）、ART-LIB-VIEW-1018／X21 | — |
| 總圖借還書（服務台、自助借書機）、B1 24 小時自習室與影印中心、4F～6F 書庫 | 有企劃未實作 | `src/library3d.js` 服務台、還書箱只有「看」；`src/data/library_layout.js` 4F～6F 按不亮；沒有 B1（看板沒有任務） | （無任務）／A06 | LAWWW 照 D46 原文做（先開任務）；B1 模型派 LAWWW2 |
| 男生宿舍：門廳、交誼廳、走廊、雙跑樓梯、二樓；同一層門牌照自己房號排 | 線上可玩 | main `src/data/dorm_layout.js:3`、`src/dorm3d.js`；tests/flow_dorm_hall.py | A07（D44）、BUG-DORM-PLATES-1018／X20 | 交誼廳家具（ART-DORM-LOUNGE-1021）：LAWWW2 待開工 |
| 普通／共同／博雅三棟教學館、博雅 101（照官方平面圖）、空橋走得過去 | 線上可玩 | main `src/teach3d.js`（index.html:232）、`src/assets3d.js:109`（skybridge）；tests/nav_teach_unit.js、tests/flow_teaching_buildings.py、tests/flow_boya_interior.py | A12～A14 | — |
| 博雅→普通的空橋不再經過木門；鏡頭不被空橋屋頂擋 | 下一版（v9.10.3 候選） | f72a2a21 `src/assets3d.js:113`（skybridge.glb＝LAWWW2 c77e68a2）；tests/flow_skybridge.py | SKYBRIDGE-DOOR-1020／X85 | BB 驗收 |
| 法律學院圖書館（萬才館一樓）、社科院＋辜振甫紀念圖書館（照官網開放時間、閉館要離館） | 線上可玩 | main `src/data/lawlib_layout.js:4`、`src/data/soclib_layout.js:2`；tests/nav_lawlib_unit.js、tests/nav_soclib_unit.js、tests/soclib_hours_unit.js | A10、A11（D46、D53、D56、D62） | — |
| 社科院搬到霖澤館西南（照真實位置，大樓在北、正門朝小椰林道） | 下一版（v9.10.3 候選） | 75298b73（候選）；f72a2a21 `src/zones3d.js:118-119`（X75）；tests/socsci_place_unit.js | CAMPUS-SOCSCI-POS-1020／X75 | BB ✔（CANDIDATE_9103 第 6 列 X75） |
| 新體育館 1F、B1（體育課、一個人打羽球、販賣機、健身房） | 線上可玩 | main `src/gym3d.js`、`src/data/gym_layout.js:8`；tests/gym_unit.js | A18 | — |
| 體育館 1F 往 B1 的台階方向改對、B1 上來面向大廳 | 下一版（v9.10.3 候選） | f72a2a21 `src/assets3d.js:78`（gym_interior.glb＝LAWWW2 9eba1567）、`src/gym3d.js:138` | BUG-GYM-STAIRS-1020／X64 | BB 驗收 |
| 體育館 1F／B1 的燈有光暈、疊面修正 | 開發分支已完成（候選之後） | 77e990dc（候選之後，整合 LAWWW2-C 09324bda） | （LAWWW2 清查 A1、A2） | BB 畫面驗收 |
| 新體育館 3F 主球場（8/31 開學典禮的地方；現在樓梯口紅龍「今日不開放」、典禮用 2D） | 有企劃未實作 | 模型和配置在：`src/data/gym_layout.js:78-84`（gym_arena）；沒有程式載入它，`src/gym3d.js:13` closed_3f | ART-GYM2-INT、LIC-GAPS-1017／A16 | LAWWW 把 gym_arena 接成 3F 區域、拿掉紅龍、LICENSES 補 |
| 溫州街：台北巷弄、兩點半 Café 在東端路口、三家 3D 店（半熟、阿德影印、一盞茶屋，點完找空位坐下吃）、小公園、貓 | 線上可玩 | main `index.html:208`（wz_shops）、`src/assets3d.js:75`（wz 公園）、`src/game3d.js:233`（GM.freeSeat）；tests/wz_shops_unit.js、tests/wz_park_unit.js、tests/wz_cat_unit.js、tests/touch_flow_wenzhou.py | B01～B04、DL-09／X22 | — |
| 溫州街其他新店面能進去消費、有店員（林家乾麵、定食、茶飲、冰菓室、書房） | 有企劃未實作 | 只有三家能進（看板沒有任務） | （無任務）／B09 | LAWWW 問 AA 哪幾家要能進 → LAWWW2 做室內 → LAWWW 接店員、點餐 |
| 溫州街故事小物、路邊小物（安全帽、傘桶）、豆漿店道具組（模型都驗收過） | 有企劃未實作 | 只在 LAWWW2 分支（claude/focused-cray-c9uwvw），開發分支沒有 wz6_items、wz7_street_props、soy_props | ART-WZ6、ART-WZ7、ART-SOY1／B07 | LAWWW 開工 DL-11 時搬進開發分支、登錄 assets3d、補 LICENSES（路邊小物可以先擺） |
| 溫州街舊店面翻修、Café 前黃昏做到商業水準 | 暫停 | 使用者 10-17 05:0x「溫州街修改也暫停」 | ART-WZ0、ART-VSLICE／B10、I05 | 使用者決定要不要解除（列進「必須由你決定」） |
| 公館：南側騎樓店面（每家不同的門、騎樓地磚、夜間光暈）、捷運公館站出口、校門（Blender）；招牌 34 張虛構店名；機車 12 款、腳踏車 7 款 | 線上可玩 | main `src/assets3d.js:84`（gongguan_shops）、`:85`（gongguan_mrt）、`:117`（campus_male1 等）；tests/gongguan_layout_nav.py、tests/gongguan_glb_integration.py | ART-GG-SHOPS-1018、ART-GG-SIGNS、ART-SCOOTER2、ART-BIKES2-INT、ART-EXT-M1／B12～B14、X04、X16 | — |
| 公館店面加高到 6～14 層、羅斯福路遠景、水源市場、天橋、捷運出口 GONGGUAN 花台；從校門看出去的羅斯福路換成 Blender 模型 | 下一版（v9.10.3 候選） | f72a2a21 `src/assets3d.js:84`（gongguan_far）、`:86`（campus_gongguan_bd）；1475d312、0582af9f（七樓以上不投影） | GG-STREETVIEW-1020／X86 | BB 驗收 |
| 118 巷像巷子：機車 55 台、店門口盆栽和雜物、電線桿與電線、樓上招牌、晚上店門口的光 | 下一版（v9.10.3 候選） | f72a2a21 `src/assets3d.js:85`（bldg.lane118_props）、`index.html:211`（lane118_props.js）；LAWWW2 7d61872e | ART-L118-LANE-1020 | 「118 巷街道太空」還在 LAWWW2 排程（CANDIDATE_9103 還沒做的） |
| 室內（店面）出口地上有青色光圈，站上去出現「離開…」 | 線上可玩 | main `src/guide3d.js:152`；tests/exit_ring_unit.js | UX-EXIT-MARK-1018／X17 | — |
| 走路方向和動作一致（往後、斜後方不再是往前走的動作） | 線上可玩 | main `src/engine3d.js:254-256`（flatYaw）；tests/walkdir_unit.js | BUG-WALKDIR-1018／X07 | — |
| 劇情結束後鏡頭 1.1 秒內慢慢拉回、不繞半圈 | 線上可玩 | main `src/engine3d.js:405`、`:436`（endCinematic） | BUG-CAMSNAP-1018／X08 | — |
| 跑步變快（4.8 → 6.2 m/s） | 下一版（v9.10.3 候選） | f72a2a21 `src/engine3d.js:295`（run 6.2）；main 沒有 | RUN-SPEED-1020／X72 | BB 驗收 |
| 小地圖（前方朝上、北的標示、玩家箭頭）；「北」改白字、目的地在地圖外畫往外的箭頭（南方的黃點） | 線上可玩 | main `src/game3d.js:187`（minimapArrow）；tests/minimap_direction.py；黃點修正 62947d40（候選）`src/game3d.js:202`、`src/guide3d.js:99`；tests/minimap_yellowdot_unit.js | BUG-MAP-YELLOWDOT-1020／X77 | 黃點那一半在下一版 |
| 觸控搖桿、點地移動、直向／橫向、44px 按鈕、safe-area | 線上可玩 | main `index.html:136`（#joy 搖桿）、`src/engine3d.js`（觸控輸入）；tests/p0_movement.py、tests/joystick_direction.py、tests/touch_flow_wenzhou.py（v9.10.1 發布後檢查 ALL PASS，RELEASES v9.10.1 節） | J01（D3） | iPhone 實機沒測 |
| 手機直向的 2D 對話只顯示正在說話的人（兩張立繪不再疊在一起）；換場景以後前一段的立繪不會留在舞台 | 線上可玩 | main `src/adv3d.js:42`（直向 .advSlot.off）、`:75-79`（只留說話的人）；4a03aadf（main） | BUG-ADV-OVERLAP-1018、BUG-ADV-LINGER-1018／X49 | — |
| 路人附近不會有兩個一模一樣穿搭的人 | 線上可玩 | main `src/game3d.js:162`、`src/character3d.js:260`（dedupAnon）；tests/anon_dedup_unit.js | BUG-NPC-DUP-1018／X18 | — |
| 正式模型離開再回來，窗燈照樣跟著天黑 | 線上可玩 | main `src/zones3d.js:881`（夜間材質每次接上重新登記）；RELEASES v9.10 節 night_rereg_check PASS | BUG-NIGHT-REREG-1018 | — |
| 效能：騎機車的路人在畫面外不算、晚上（19:12～05:30）太陽陰影 2 秒才重畫一次、光暈合批（BB 量 draw call：校園 −36%／−31%、公館 −18%／−8%、溫州街晚上 303→253） | 下一版（v9.10.3 候選） | 156430a2、ddfd1d5e（候選）；f72a2a21 `src/engine3d.js:146-151`；BB 7a9c4bdf（SwiftShader） | PERF-WENZHOU-1020、PERF-CAMPUS-SHADOW-1020／X69 | 實機（iPhone、使用者電腦）沒試；溫州街晚上改善有限（稽核 D X69），LAWWW2 查 |
| 建築旁的影子不再一直閃（陰影相機對齊整格、白天太陽方向 3 遊戲分鐘才換） | 下一版（v9.10.3 候選） | f72a2a21 `src/engine3d.js:146-151`；tests/shadow_snap_unit.js | PERF-CAMPUS-SHADOW-1020（看板進行中）／X79 | 實機約每 7.5 秒跳一下：等使用者用 iPhone 看要不要改 |
| 電腦換畫面（進溫州街、咖啡廳）卡一兩秒 | 有企劃未實作 | 看板稽核 B2：沒做（沒量） | PERF-ZONE-ENTER-1018／X14 | LAWWW 用 tests/perf_scenes.py 量模型／貼圖／shader 編譯時間，再決定預載或預熱 |
| 黃昏調色預設就開（使用者已選「預設就開」） | 有企劃未實作 | main／開發分支都還是 `?grade=golden` 才開（`src/engine3d.js:136-140` KEY_GOLDEN） | GRADE-GOLDEN-DEFAULT／X32、I02 | LAWWW 重拍白天、黃昏、夜間、室內對照、跑回歸，再把預設改 golden |
| 人物「開門」的動作 | 有企劃未實作 | 上下樓、轉身、坐下、站起來都有；開門沒有（看板沒有任務） | （無任務）／A21 | LAWWW；低優先 |
| 學生活動中心（社團公告、排練、遇到別系的人） | 有企劃未實作 | 沒有這個區域（看板沒有任務） | （無任務）／A17 | 先問使用者還要不要 |
| 共同教學館、女舍和參考照片比對；二樓陽台盆栽從街上看不到 | 有企劃未實作 | LAWWW2 清查 B14、溫州街效能第六輪的遺留 | ART-PHOTO-CMP-1021、ART-BALCONY-POTS | LAWWW2 先列差異清單 |
| 盆栽、杯子這類小道具集中成一批「環境細節」 | 暫停 | D70：主要工作穩定後一起做 | I16 | 三個優先項目穩定後 LAWWW 開一批給 LAWWW2 |

## 9. 結尾（大四下、畢業、國考、第一份工作、尾聲）

> 畢業典禮不另做 3D 場景：用 CG-9＋2D 演（SCN-V5-02 快照之後改成「取消／被取代」，9101413e）。線上版（v9.10.2）沒有大四下以後的主線；人物的結局（以安、語彤、明軒、芷若）見第 5 章，交換延畢的大五上見第 3 章。下面「下一版」的部分都是 AA_314 1A 主線二十件（AA_317／AA_318／AA_319）和第 2 輪大四到尾聲 61 件，**只有 node 測試**，BB 清單 bb_checklists/BB_R2Y4_1021.md 還在驗。

| 功能（玩家看到什麼） | 狀態 | 證據 | 任務／USER_WANTS | 負責人與下一步 |
|---|---|---|---|---|
| 大三寒假～大四：姊姊的火鍋、土地資料（二）、「大四要怎麼過？」（Y4_PATH）、第四個房間 409、6/1 收拾、6/28 搬出宿舍 | 下一版（v9.10.3 候選） | f7b1473e（候選）；f72a2a21 `src/data/events.js:4206`（sister hotpot）、`:4208`（land data）、`:3460`（Y4_PATH）；tests/sister_hotpot_unit.js、tests/land_data2_unit.js、tests/y4_path_unit.js、tests/move_out_y4_unit.js、tests/room_y4_unit.js | EVPKG-1A06-08-1020、EVPKG-1A09-15-1020／D16 | BB 驗中（CANDIDATE_9103 B 線） |
| 大四下的事件包（國考讀書會、法律專題研究第 15 週的日誌、大四下的手機） | 下一版（v9.10.3 候選） | f72a2a21 `src/r2y4b3d.js:1-6`、`src/data/r2y4b_events.js:3`（act_bar_study）；tests/r2y4b_events_unit.js | EVPKG-R2Y4-1020、AA263-Y4S2、BB210-Y4S2（看板待開工） | BB 照 BB_R2Y4_1021.md 驗收 |
| 畢業那天（2029-06-02）：家人、撥穗、12:00 傅鐘拍照（CG-9 畢業典禮與媽媽）、午餐、子晴私訊、傍晚一對一的飯或 Café 併桌、大伯的信封 | 下一版（v9.10.3 候選） | f72a2a21 `src/postgrad3d.js:1-15`、`:28`（S.gradDay）、`ev_grad_family`（`src/postgrad3d.js:10`）；CG `cg_graduation_mother_heroine01`；tests/graduation_unit.js、tests/grad_family_unit.js | EVPKG-1A13-20-1020／D16 | BB 驗收 |
| 學姊的生日 6/2 20:30 研究室 | 下一版（v9.10.3 候選） | f72a2a21 `src/postgrad3d.js:161`、`:488`（ev_pg_sis_bday）；tests/graduation_unit.js | V5-G02／D52 | BB 驗收 |
| 6/9 可昕的畢業典禮（BCG-07 兩張畢業照）、子晴芷若同一天畢業、學士帽歪了（BCG-26） | 下一版（v9.10.3 候選） | f72a2a21 CG_REGISTRY `cg_two_graduations_kexin`、`cg_crooked_cap_heroine04`；`src/group3d.js`（1C 子晴芷若同一天畢業） | EVPKG-1A13-20-1020、EVPKG-1C01-06-1020 | BB 驗收 |
| 國考：2029-05-10 報名提醒 → 7/12 總圖 B1 → 8/4 一試 20 題（照期末考題庫＋刑訴 QBANK 抽、答對題數 9/7 放榜才看得到）→ 10/20～21 二試 → 12/14 二試放榜（18:00 麵店、21:00 以安的電話）；報名就應屆考上律師，作答只決定司法官 | 下一版（v9.10.3 候選） | f72a2a21 `src/postgrad3d.js:2-11`（一條線）、`src/data/postgrad_lines.js:135`；tests/bar_exam_unit.js | EVPKG-1A13-20-1020、D14-T7（AA_286）／D45 | BB 驗收 |
| 2029 一試不到 12 題、或交換延畢：2030 再考一輪（8/3、9/6、10/19～20、12/13 麵店） | 下一版（v9.10.3 候選） | f72a2a21 `src/postgrad3d.js:4`；tests/postgrad_days_unit.js、tests/aa331_postgrad_unit.js | EVPKG-1A13-20-1020 | BB 驗收 |
| 2030-10-01 第一份工作 | 下一版（v9.10.3 候選） | f72a2a21 `src/data/postgrad_lines.js:170`、`src/postgrad3d.js:4` | EVPKG-1A13-20-1020 | BB 驗收 |
| 2034-06-03 尾聲：窗邊長桌（照伴侶換八種合成 CG；沒有人坐時用共通圖）、空著的座位、何俊朗，演完回標題 | 下一版（v9.10.3 候選） | f72a2a21 `src/data/postgrad_lines.js:176`、`src/postgrad3d.js:358`（S.epiCg）、`src/r2y4b3d.js:485`（EPI_SEAT_EMPTY）；CG `cg_reunion_window_table_*` 8 張；tests/epilogue_unit.js | EVPKG-1A13-20-1020、EVPKG-R2Y4-1020 | BB 驗收；CANDIDATE_9103 寫 CG-10（尾聲窗邊長桌共通圖）、BCG-39「還沒有，照背景演」 |
| 畢業後篇：站著不動 2 秒或睡覺就跳到下一件事（場景、訊息、出遊），途中收到訊息就停 | 下一版（v9.10.3 候選） | f72a2a21 `src/postgrad3d.js:5-6`（S.on、S.STEPS） | EVPKG-1A13-20-1020 | — |
| 畢業後跳日期時日期卡下面那一句（PG 版，2029 年 10 句、2030 年 5 句，一句只出一次） | 開發分支已完成（候選之後） | f27df6dd（快照之後，子代理 3d1105e2）：`src/postgrad3d.js` S.CARDS_2029／S.CARDS_2030、S.cardLine；tests/pg_cardline_unit.js（13 項） | AA353-PG-CARD-1021（已整合待測試） | AA 回的「一跳一句吃掉中間句」等 7 項（AA-Q-1021-PG）照改；BB 驗收 |
| 早期 2D 版的畢業後職涯（律師、法官、檢察官、公司法務、合夥開業） | 暫停 | 使用者 10-18 02:3x「職涯以後再說」：沒有取消，也還不做 | ／J11 | 使用者提起時 |
| 音樂、音效 | 暫停 | 使用者 10-18：不急 | D100a 第 6 點／J10 | 稽核 D：v9.10.3 發布前問使用者一次要不要開始做 |

## 10. 看板寫待辦、其實已在遊戲裡

> 對照的是 `docs/handoff/tasks.json`（d394e72d）的 status。很多是今天早上稽核（BACKLOG-SWEEP-1021）之後才做完、看板沒跟著改；**AA-103-SP 是稽核套用把狀態改回去**：3433818b 先改「已整合待測試」，c251ce57（稽核 B2 套用）又改回「待開工」，因為稽核的快照比實作 741a4a63 早。

### 10-1 完整做好了（看板應該改成已整合待測試，或結案）

| 任務 | 看板寫 | 實際 | 證據 |
|---|---|---|---|
| AA-103-SP 刑訴第 15 週強制辯護三句 | 待開工 | 下一版（v9.10.3 候選） | 741a4a63（候選）；f72a2a21 `src/classes3d.js:229`（S.SPECIAL_PRE）；tests/aa103_sp_unit.js |
| V4-E2 刑訴第 1 週不再演「上週我們談了…」 | 待開工 | 下一版（v9.10.3 候選） | 86beabca（候選）；f72a2a21 `src/data/events.js:420`（minWeek:{term:'Y3S1',week:2}）；tests/crimpro_week1_unit.js |
| CG-NOPERSON-1018 高雄兩張改純場景、衝刺班那張 | 待開工 | 線上可玩 | main `src/data/events.js:2224-2228`（ev_y0_kh3 背景 kh_dome、kh_lotus_bench，純場景）；衝刺班那張使用者取消、cram_class 背景照舊（USER_WANTS X37） |
| ART-18 經濟系等 2D 背景 id 接進 S.BG | 進行中 | 線上可玩（程式部分） | main `src/outings3d.js:16`（riverside）、`:30`（soc_hall）等 v0 背景都接了；看板自己寫「本項可結案」，剩 4 張由 SCN-V4-02、SCN-JP-2D 追 |
| DATE-C1 約會地點 D01、D09、D18、D25、D05、D03、D07、D15 的台詞 | 待開工 | 開發分支已完成（候選之後） | 7ef4ff56：`src/data/date_lines.js` 32 個地點全部匯入；D15 只差底圖（見 10-3） |
| ART-BG09 春假開車的「海邊」 | 待開工 | 開發分支已完成（候選之後） | 28afd003（快照之後）：`assets/bg/trip_sea.webp`、`src/outings3d.js` trip_sea 有圖 |
| ART-BG10 春假開車的「老街」 | 待開工 | 開發分支已完成（候選之後） | 28afd003：`assets/bg/trip_oldtown.webp` |
| VAC-C08-12 寒暑假活動卡 C01～C13 | 進行中 | 線上可玩 | main `src/data/vac_activities.js:32`（C02）、`:63`（C03）、`:78`（C04）、`:87`（C05）、`:104`（朋友揪團）、`:136`（C08）、`:193`（C10）、`:229`（C12）、`:295`（C01）、`:298`（C13）；只剩 T03（芷若×子晴那條線，等 AA）→ 建議拆出 T03 後結案 |
| VAC-B3 寒暑假 5 張背景 | 已實作待整合 | 線上可玩 | main `src/outings3d.js:14`（trip_hotel_twin）、`src/data/vac_activities.js:96`（jp_street_night）、cram_class 等都有事件在用；只剩 `train_day` 登錄了沒有事件用 |
| SCN-US-CG 美國篇 CG | 待開工 | 下一版（BCG-31 以外） | f72a2a21 `src/data/r2y4a_events.js:23`（frozen_lake、us_kitchen、bus_station）、`:98`（chicago）、`:157`（snow_steps＝BCG-09）、`:189`（last_dinner）；剩 BCG-31 送機夏天版 |
| SCN-JP-CG 日本線 CG | 待開工 | 下一版（4 張中 3 張） | f72a2a21 `src/data/r2y3b_events.js:162`、`:212`、`:309`；臺中情人節那張（cg_valentine_taichung_heroine01）等節日事件 |
| ART-15「v3～v6 CG（CG_REGISTRY 只有大一的 5 張）」 | 等待其他AI／素材 | 下一版（大部分） | 標題已過時：CG_REGISTRY main 20 張、候選 76 張（5e675a33：第二批 48 張＋尾聲 8 張合成）；剩 BCG-31 夏天版、CG-10b 傘圖層 |

### 10-2 看板寫待開工／等待，其實已經做了一大部分（狀態該改成進行中，或把剩下的拆成新任務）

| 任務 | 看板寫 | 已經在遊戲裡的 | 還缺 |
|---|---|---|---|
| BB194-YTFLAGS 她問到祐廷的感情狀態時記誠實／閃避／說謊 | 待開工 | 機制 ROM.ytAnswer、選項標 yt（1b85137e、7e141b81，候選之後；`src/events3d.js:114`） | AA_227／AA_228 那幾場（EVPKG-AA227-228-KNOW） |
| BB210-Y4S2 大四下口語審程式清單 | 待開工 | GRAD_DONE 修好（56a8f4cf，候選）；畢業傍晚、7/14 心意邀約在候選 | 口頭禪、備用句逐項核對 |
| AA267-Y5、SYS-12、US-20W-SPEC、V4-X18 交換延畢與大五 | 待開工 | 大五上實習三件、證書、2030 筆試（f72a2a21 `src/r2y4b3d.js:294-310`）；秋假大峽谷（`src/data/r2y4b_events.js:322`） | calendar.js Y5S1、補修兩門、逐週內容（AA_357 子代理做中，Y5-DELAY-1021） |
| V4-R-US 美國路線 | 待開工 | 美國那一學期整套（f72a2a21 `src/us_life3d.js`、`src/r2y4a3d.js`）、返台 | BB 照 BB_US_LIFE_1021 驗收；AA_QUESTIONS_1021 I 節 8 題 |
| V4-R-JP 日本路線 | 待開工 | 日本那一學期（f72a2a21 `src/jp3d.js`）；jp_konbini、airport_arrival 圖在候選（a15ba2ea），jp_riverbank、jp_station 在候選之後 | jp_dorm_lobby、jp_town_hall；看板 next 還寫「assets/bg 沒有 jp_konbini…」已過時 |
| V4-R-TW、AA342-COVERAGE-1021 臺灣路線覆蓋 | 待開工 | C1、C2、C4（大四下 15 週，f85f5e7f）、C5、C6 已改 | 補稿清單、C3 校慶海報字 |
| SCN-V4-02 地方法院、桃園機場入境 | 等待其他AI／素材 | airport_arrival 圖在候選（a15ba2ea） | court_criminal；next 還寫要 airport_arrival（過時） |
| SCN-JP-2D 日本 2D | 等待其他AI／素材 | jp_konbini（候選）、jp_riverbank、jp_station（候選之後） | jp_dorm_lobby、jp_town_hall |
| AA313-S4-1020 以安、語彤逐場修正 | 待開工 | 第 10 點以安全名自我介紹（e319a31a，候選；BB ✔） | 其餘逐點 |
| ART-13 明軒、小語模型 | 待開工 | 小語 Blender 版 main 就有（`src/assets3d.js:45` bl_yu.vrm） | 明軒 |
| VAC-B1 假期 BB 人物 | 已實作待整合 | 以安、阿哲、柏翰、明軒、芷若、阿凱回老家（372208db、d90675e1，候選之後） | Kevin（不在 CHARACTERS 裡，沒有作息可放） |
| DORM-Y34 大三、大四房間 | 已實作待整合 | 507、409 搬房間劇情（候選，1A-03、1A-06～08） | 室友旁白（AA_208 第 8 節）、柏翰晚上作息 |
| VAC-A2 3D 機場 | 已實作待整合 | 美國出發（main）、返台入境（候選） | 寒暑假出國、日本送機 |

### 10-3 看板寫「等待素材」，其實素材已經在別的分支（LAWWW 可以直接接）

| 任務 | 看板寫 | 素材在哪 |
|---|---|---|
| DATE-L15、DATE-L16、DATE-L22、DATE-L23（＋ART-14 的 D32） | 等待其他AI／素材 | `d15_base_night`、`d16_base_afternoon`、`d22_base_afternoon`、`d23_base_sunset`、`d32_base_afternoon` 五張在企劃線 `origin/claude/magical-albattani-bk7b4n:docs/story_planning/date_system/art/`（BB 分支也有）；使用者 10-17 已核准（USER_WANTS D33） |
| ART-WZ6、ART-WZ7、ART-SOY1 溫州街故事小物、路邊小物、豆漿店道具 | 待開工 | `origin/claude/focused-cray-c9uwvw:assets/models/env/second_ai/aa_support/`（wz6_items、wz7_street_props、soy_props 的 .glb／.json），都驗收過 |
| ART-GYM2-INT 新體育館 3F 主球場 | 待開工 | `assets/models/env/second_ai/gym_arena.glb` 和配置 `src/data/gym_layout.js:78-84` 已在開發分支，只差程式載入、拿掉紅龍 |

## 11. 看板寫完成、其實找不到的

> 用腳本把 status＝已整合待測試／已驗收的 690 多項的 title、evidence 裡提到的事件 id、檔案路徑對開發分支（31fcaccf）核對，**沒有找到整項不存在的**（3 個命中都是寫法不同的誤報：V0-SK 的 ev_sk01 實際叫 ev_sk03_lunch 等、AA272-1017 的測試檔縮寫、repro 存檔檔名）。下面是「狀態寫完成，但任務自己的範圍裡有一段程式找不到」，已逐項核對：

| 任務 | 看板寫 | 找不到的那一段 | 證據 |
|---|---|---|---|
| US-LIFE-AA340-1020 美國那一學期 S1～S12 | 已整合待測試 | S7：美國路線大五上補修強制執行法、法律倫理 | `src/data/courses.js` 沒有 enforcement_re／legal_ethics_re（grep 0）；任務自己的 next 也寫 S7 沒做 |
| EVPKG-1B18-25-1020 學姊出發（8/2）等 | 已整合待測試 | 1B-18 送機的 CG BCG-31（夏天版） | `cg_airport_send_heroine05` 在 `src/adv3d.js` CG_REGISTRY 有，但整個 src 沒有呼叫；夏天版的圖還沒有 |
| EAT-EFFECT-1020 吃東西不只是花錢 | 已整合待測試 | 宵夜滷味攤沒有點餐選單（只有第一次那句） | `src/eat3d.js:12` 註解 |
| ART-US2-FIX-1018 C 棟 208 美術修正 | 已整合待測試 | 標題列了「9/13 傍晚燈光、手寫輪值表、臥室兩張床」；整合 commit fc645c8b 只寫泡麵軟袋、廚房吸頂燈、版畫＋拍立得、B 門掛外套 | fc645c8b 的訊息；GLB 內容沒拆開看（拿不準，請 BB 畫面驗收時對這三項） |

另外，**USER_WANTS 寫「在遊戲裡（v9.10.2 起）」、其實有一部分要下一版才有**：
- X58（跳過途中收到訊息就停）：經濟系那一段 main 有；法律系寒暑假的快轉是 92030b76（候選）才停。
- A09（大二～大四的房間 312、507、409）：房間模型 main 有（`src/zones3d.js:1401-1408`），但搬進 507、409 的劇情在候選（1A-03、1A-06～08），線上版玩家走不到那兩間。
