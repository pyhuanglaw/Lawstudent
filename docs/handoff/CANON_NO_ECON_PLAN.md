# CANON-NO-ECON-1112 第一批（Batch A）盤點表：經濟系那一年／休學重考在家，整塊拿掉

- 使用者 2026-11-12 原話：「刪掉經濟系的所有人 刪掉重考這個劇情　刪掉政大的東西 杜可昕這個人物既然已經做好 就放在台大法律但他不是我女朋友」。選擇題：可昕＝開局不是女朋友、之後可以追；舊存檔＝「我沒有要留的舊存檔」（不做遷移）。
- 起點：`claude/adoring-meitner-mqzst8` @ 762104842a。已經做的（d6f4070fb6）：標題只留「從法律系開始」、`loadFrom` 不讀 `stage==='econ'` 的存檔。
- AA 的清單：企劃線 `docs/story_planning/AA_855_canon_no_econ_grep.json`（src 2,465 行、179 檔）、`AA_854_…受影響的稿.md`。AA：econ_people、econ、nccu 可以整場拿掉；retake、gf 等 AA 換字。
- **這一批只拿掉「只有經濟系那一年（`G.stage==='econ'`，2024-09-01～2025-08-29）才會跑到」的程式和資料**；法律系時期還會出現的（C 類）、重考／女朋友的字（D 類）不動，只列清單。
- **這一批沒有寫、沒有改任何玩家看得到的字；只有拿掉。** 沒有在瀏覽器看過（只跑 Node 單元測試）。

## 做法

1. 沒有任何入口能把 `G.stage` 設成 `'econ'`（新遊戲只有法律系；econ 存檔不讀），所以這些條件永遠是 false：`STORY.isEcon(G)`、`G.stage==='econ'`、`typeof ECONFF／RETAKE_HOME／MSG_KX_Y0!=='undefined'`（檔刪掉以後）。
2. 用語法樹（Node 內建的 acorn；工具放在 scratchpad `cne_fold.js`、`cne_defs.js`，不進 repo）把這些條件當 false，照 JS 語意把走不到的分支、整個 `if`、`stage:'econ'` 的事件物件拿掉；**留下來的程式一個字元都不動**（不重排、不改寫）。
3. 連帶變成沒有人呼叫的函式手動拿掉，再把它們的呼叫點照同一個方法收掉，一輪一輪做到沒有殘留（最後一輪：被拿掉的 150 多個名字在 src 裡 0 個引用）。
4. 測試：整支只測經濟系那一年的刪掉；只有幾項有關的，刪那幾項並在原地註明「CANON-NO-ECON-1112：經濟系那一年拿掉（…）」。沒有放寬判定。

## A 類：整個檔只給經濟系那一年／重考在家用（刪檔）

| 檔 | 讀過以後的判斷 | 這一批 |
|---|---|---|
| `src/econff3d.js`（326 行） | 經濟系在學「事件接事件」＋休學在家第二階段（D102、AA_292、AA_355）；只在 `stage econ` 開 | 刪 |
| `src/data/retake_home.js` | AA_297 重考期在家的日常（2025-02-15～07-09）；只有 econff3d.js、home3d.js 的重考在家用 | 刪 |
| `src/data/msg_kx_y0.js` | AA_301／AA_368 經濟系那一年主動傳訊息給可昕的回覆（2024-10-17～2025-08-29） | 刪 |
| `tools/story/import_retake_home.py`、`tools/msg/import_msg_kx_y0.py` | 上面兩個資料檔的匯入工具 | 刪 |

讀過、**不屬於這一批**的候選：

| 檔 | 是什麼 | 歸類 |
|---|---|---|
| `src/econfr3d.js`、`src/data/econfr_lines.js` | AA_521 經濟系的朋友在**法律系那三年**（校園日常、「走啦」群組、何俊朗、日文班） | C |
| `src/econsl3d.js`、`src/data/econfr_soclib.js` | AA_536 經濟系同學在社科院圖書館（**法律系時期**遇得到） | C |
| `src/kx_khh3d.js` | AA_401 可昕學期末約會「寒假來高雄」（法律系，交往中） | D（gf） |
| `src/kxdrift3d.js` | AA_351 可昕慢慢分手（法律系大二～大四，交往中） | D（gf）＋C（木柵） |
| `src/kxod3d.js` | AA_354 可昕「我們的日子」大二～大四 | D（gf）＋C（政大小吃街） |
| `src/kx_moot3_3d.js`、`src/data/kx_moot3_lines.js` | AA_514 可昕最後一場模擬法庭（大三上，在政大） | C（木柵／政大） |
| `src/data/camp_y1.js` | 法律系 8/22 宿營（新局會跑）；裡面「重考生」的字是 D | 留；D |

## B 類：共用檔裡一整段只在 `stage==='econ'` 才跑的（已拿掉）

| 檔 | 拿掉了什麼 | 少幾行 |
|---|---|---|
| `src/data/events.js` | `stage:'econ'` 的事件 96 個（`ev_y0_*`：E02～E36、P1b／P2／P2b、T／A／L／C／R 系列、高雄、考試兩天、放榜）、可昕交往前六段過場（trigger `econff`）、重考期 R 系列。事件數 390 → 298 | 1,222 |
| `src/story3d.js` | `S.isEcon`、`S.newGameEcon`、`S.econCampPrologue`、宿舍第一晚（`y0FirstNight`／`y0Morning`／`S.y0Tick`）、經濟系 → 法律系的銜接（`S.toLaw`／`toLawDue`／`Y0_SUMMER`、`startLawWeek1` 的 `o.econ` 分支）、`S.campCallDue`、`PHONE_RULES` 裡經濟系那一年每一段（E02～E37 的邀約與沒去版、群組 `econ_class`、社團群組 `Y0_CLUB_MSG`、休學、重考、放榜）、每日訊息 Y0 那一組（21 則）、重考期起床選單與 R 系列（`retakeOn`／`retakeWake`／`cramNight`／`rArrived`／`RS`／`RP`…）、`p2b*`、`e05*`、`e08StopAt`、`homeHold`、固定核心電話（`CORE_CALLS`／`coreCallDue`）、`t2Due`、`y0FinalEnd`、`dpTooSoon`、`lifeLineMigrate`／`zoulaMigrate`／`zoulaGather`、`LAW_START_TEST` | 680 |
| `src/home3d.js` | 休學住家裡（`baseMode`／`baseRound`／`y0Slot`／`y0DateOpen`／`Y0_FIXED`／`y0Cal*`／`y0ffOpts`／`y0Jump`…）、經濟系寒假（`winterStart*`／`winterRound`／`WINTER_*`／`jumpTo`）、退宿（`moveOut`／`a3Due`／`a3FromHome`）、`toSchool` | 141 |
| `src/data/vacfill_events.js`、`src/vacfill3d.js` | AA_440 第 1 節「經濟系那年暑假」14 個事件、`y0_07xx／08xx` 的台詞表、手機規則 8 則、7/27 去學校走一走的 `walkOn`／`walkTick` | 149 |
| `src/classes3d.js`、`src/data/courses.js` | Y0S1／Y0S2 的 14 門課（含法學緒論 `law_intro`）、E03／P1／E04 課堂劇情、`PE_Y0`、`y0leave`、「休學中」的日期行、兩個停點 | 61 |
| `src/whois3d.js` | 「_e」那幾列（經濟系當下的寫法）、`econNow`／`econF`／`zoula`／`ROOM_E2` | 23 |
| `src/zones3d.js` | 宿舍 412 的房間切換（`'412'`、`'412_first_night'`）、紙箱（`setV0Box`／`v0BoxFromFlags`）、社科院門口經濟系那一句、`FAIR_DAYS_ECON` | 25 |
| `src/game3d.js`、`index.html` | `btnNewEcon` 按鈕和處理、migrate 呼叫的兩個 econ 遷移、`bgOnly`、「休學退宿了，不回學校」 | 15 |
| `src/msg3d.js` | 經濟系那一年傳訊息給可昕（mode `y0`、`y0Pool`）、「經濟系那一年還沒有」 | 8 |
| `src/examlib3d.js`、`src/outings3d.js`、`src/shopnpc3d.js`、`src/b1story3d.js`、`src/shopenc3d.js`、`src/encounter3d.js` 和另外 15 個檔各 1 行 | 各自的 `isEcon`／`stage==='econ'`／`ECONFF`／`HOME.baseMode` 分支 | 約 45 |

合計（src＋index.html＋tools）：39 個檔、少 2,808 行（47 萬位元組）；刪 3 個 src 檔、2 支工具。

## 測試

- 刪 73 支只測經濟系那一年／重考在家的單元測試（`econ_ff*`、`v0_*` 49 支、`lifeline_g1／g3～g6`、`e05_*`、`aa308_batch1～3`、`aa529_econ`、`aa363_s2`、`aa726_cards`、`kx_expr`、`kxphone_short`、`retake_bg`、`camp_econ`、`adv_linger_y0`、`bug0830_emptystop`、`econ_daylabel`、`econ_jump_walk`、`v0_e37`…）和 7 支瀏覽器流程腳本（`econ_ff_probe1／2.py`、`econ_transcript_md.py`、`flow_v0_home／start／to1017／tolaw.py`）。
- 另外 100 支左右只改幾處：載入清單裡刪掉的三個檔拿掉（約 45 支）；經濟系的項目刪掉並註明（約 60 支）。
- 四支原本拿經濟系的狀態當場景、測的東西跟哪一年無關的，改用還在的同一條路：`goal_daychange_unit`（日期改成法律系大一下開學）、`home_backdrop_unit`／`onetap_unit`／`exam_lib_crowd_unit`（「住家裡」改用畢業後退宿 `HOME.pgHome`／`movedOut`）。
- 兩支「和匯入以前逐字比」的測試不得不調整（請 BB 看一眼）：`kx_triple2_1112_unit`（稿的第 0 列在拿掉的經濟系事件裡＝不查那一列；events.js 只查「舊句都不在、多出來的只有新句」；重跑匯入工具那一項拿掉——工具會照設計停在第 0 列）、`peishan_dates_1111_unit`（psresults3d.js 少了一個字串 `'econ'`）。`invites_quote_b8_unit` 演到的教授 11 位 → 10 位（黃教授唯一的課是法學緒論）。
- 前後對照見最下面。

## C 類：法律系時期還會出現的經濟系人物／木柵／政大（這一批不動）

完整清單（每一行：檔、行、類、關鍵字、那一行的字）：**`docs/handoff/CANON_NO_ECON_LEFT.json`**（照 AA_855 的關鍵字對這一批做完的 src 重新 grep，1,848 行、186 檔；AA_855 原本 2,465 行）。機器數的，有誤判。

| 類 | AA_855 原本 | 現在 | 主要在哪 |
|---|---|---|---|
| econ_people（阿勳、品妤、韋綸、唐睿、家豪、何俊朗） | 1,002 | 616 | `events.js` 147（`ev_b106d2_*` 校園日常、SK01～SK13、經濟系之夜、P4）、`story3d.js` 64（「走啦」群組法律系版、SK 系列手機、系外套）、`bbpack_events.js` 50、`us_life3d.js` 38＋`us_life_events.js` 16（何俊朗）、`econfr3d.js`／`econfr_lines.js` 45、`econsl3d.js`／`econfr_soclib.js` 23、`characters.js` 20（五個人和魏教授的人物資料）、`r3_events.js` 16、`heard_lines.js` 16、`y2r2_3d.js` 14、`r2y3b_events.js` 14、`r2y4a_*` 23、`whois3d.js` 13、`assets3d.js` 13（模型登記） |
| econ（經濟系、經原） | 610 | 423 | `events.js` 73、`story3d.js` 58、`classes3d.js` 21（法律系大一的「重修經原」`econ_principles_1／2`、P4「第二次大一」）、`game3d.js` 20、`characters.js` 18、`bbpack_events.js` 17、`whois3d.js` 14 |
| nccu（木柵、政大） | 345 | 329 | `events.js` 46（E37 載可昕去木柵搬宿舍、可昕的事件）、`story3d.js` 26、`y2r2_3d.js` 19、`zones3d.js` 16、`data/invites.js` 14、`r2y4b3d.js` 13、`y34b3d.js` 11、`outings3d.js` 10（背景圖）、`r2y4a_*` 16、`kxdrift3d.js` 7、`kx_moot3_*` 11 |

程式上還留著、之後要一起處理的：

- **`PLAYED_Y0`（「玩過經濟系那一年」）33 處、9 檔**：現在沒有任何地方會設它，所以永遠走「沒玩過」那一版（例：`S.tangIntro`／`wlIntro` 的重新自我介紹、`whois3d.js` 的 `y0`／`noY0` 兩組、E37 的法律系版）。兩版的句子都在講「你經濟系那年的室友」，要 AA 決定以後才能收。
- **`(G.stage||'law')==='law'` 的判斷 226 處、126 檔**：現在永遠成立，這一批照指示先留著。`stage==='econ'` 只剩 `game3d.js` `loadFrom` 擋舊存檔那一處。
- **日曆的 Y0S1／Y0S2 兩個學期**（`calendar.js`）、`TERM_ORDER`、`termName`、各處的 `/^Y0/`：沒動（日曆是五年連續的，法律系開局的八月還在 Y0S2 之後的暑假，怕牽動天數）。
- **走不到的資料（產生檔，要改匯入工具和白名單才能拿）**：`data/ladder.js` 的 Y0S1／Y0S2 層（可昕和三位朋友）、`data/syllabus.js` 的 y0 課、`data/invite_replies.js` 可昕 `y0` 區（交往前第 1～6 階的答應句——現在 `invites3d.js` 只讀 `law` 區）、`data/examlib_lines.js` 的 `econ`、`characters.js` 每個人 `tagByPY[0]`（經濟系那一年的年級）、`data/dorm_room_layout.js` 的 412。
- `story3d.js` 的 `kaiSheetY0Fix`／`KAI_SHEET_Y0N`（舊存檔修正）、`game3d.js` 的 `NTU_ZONES`（只剩測試在讀）。
- 還在綠的測試裡有 90 幾支提到 `stage:'econ'`／`ev_y0_*`／`PLAYED_Y0`（多半是「經濟系那一年不會發生」那種一格，現在等於恆真），下一批可以清。
- `tests/save_compat_start1.py`（舊存檔相容，含經濟系 8/30 那一段）、`tests/repro_1018/econ_probe_*.py`：瀏覽器腳本，沒動。
- `tools/story/black_bg_audit.js --stage econ`、`tools/rename/apply_game.py` 的 GEN 清單還列著刪掉的兩個檔（缺檔會跳過，不會壞）。
- **白名單 `docs/handoff/story_import_allow.json` 沒動**：格式裡 `status` 只有 approved、`history` 是同一筆的舊版本，沒有「作廢」的寫法；`retake_home_v1.json`、AA_301、AA_368、AA_297 那幾筆還留著（匯入工具已刪，不會再匯入）。要怎麼標請值班 LAWWW 決定。

## D 類：重考、休學、女朋友的字（等 AA 換字；清單同上那份 JSON）

| 類 | AA_855 原本 | 現在 | 主要在哪 |
|---|---|---|---|
| retake（重考、落點、休學、分科測驗） | 451 | 311 | `postgrad3d.js` 34（多半是**國考**重考，誤判）、`events.js` 29、`story3d.js` 21、`camp_y1.js` 14（宿營「重考生」）、`heroine_arcs.js` 13、`game3d.js` 11（多半是被當**重修**，誤判）、`home3d.js` 10、`data/places.js` 10 |
| gf（我們的日子、女朋友、男朋友） | 57 | 169（這次每一行都算，AA_855 只列和可昕同一行的） | `termend3d.js` 21、`events.js` 18、`story3d.js` 13、`multirel_lines.js` 11、`termend_lines.js` 7、`kxod3d.js` 6、`pgdates3d.js` 6 |

## 要 AA 給字、給設定的（這一批都沒動）

1. **新遊戲一開場的回顧十句**（`story3d.js` `S.LAW_START_RECAP`／`LAW_START_RECAP_W1`，每一局都會播）：「第一次考試，社會考壞了…你去念了首都帝大經濟…十月，你辦了休學…摩天輪上，你們說好要在一起…一起重考吧…她考上木柵大學法律…換了一個系。」整段就是被拿掉的設定。`S.LAW_WEEK12` 的四句（「你又排了一次新生的隊」「經濟學原理…你閉著眼睛也找得到」）、8/29 搬宿舍前後的旁白也是。
2. **法律系開局預設 `dating_kexin:true`**（`game3d.js` `defaults()`）沒動。所以新局照舊：8/29 21:30 可昕傳訊息、8/30 開車載她去木柵大學搬宿舍（`ev_y0_e37`，`stage:'any'`）、宿營三天她傳「山上冷嗎」、之後所有交往中的內容。等可昕在首都帝大法律、不是女朋友的新設定。
3. 宿舍房間的五樣東西（`ROOM_ITEMS`：經濟學原理課本、重考那段時間的筆記、摩天輪的票根、河堤那張照片）和法律系大一「重修經原」（`econ_principles_1／2`、P4「第二次大一」「這間教室，你一年前坐過」）。
4. `PLAYED_Y0` 兩版台詞留哪一版（或都拿掉）。
5. 可昕交往前第 1～6 階的答應句（`invite_replies.js` 的 `y0` 區，原本只在經濟系那一年用）：她在法律系不是女朋友以後要不要沿用。`ladder.js` Y0S1／Y0S2 的可昕階梯同樣。
6. 黃教授（`prof_huang`）唯一的課法學緒論拿掉了，現在沒有課；魏教授（`prof_wei`）也是。人物資料還在。
7. 經濟系的四位朋友、何俊朗、木柵大學的場景和背景在法律系時期的所有內容（C 類）要整場拿掉還是換人，照 AA_854 的表。

## 這一批之後沒有任何程式引用的素材（沒刪檔）

- 2D 背景（`outings3d.js` 的表還登記著，但沒有事件用了）：`cram_counter`、`cram_street`、`mrt_night`、`kh_dome`、`kh_lotus_bench`、`kh_xinjuejiang`、`kh_pier2`、`kh_ruifeng`、`kh_bus_day`、`kh_bus_station`、`kh_store_night`、`admin_office`、`hotpot_door`、`home_entry_night`、`gongguan_douhua`、`bowling`、`zuiyue_day`、`mango_ice`（都在 `assets/bg/<名字>.webp`）。`y0_sea_blue`、`y0_lane_shop` 還有法律系的事件在借用，`y0_dumpling`、`y0_home_street_night`、`y0_sea_rain` 要再對一次。
- CG：`cg_econ_camp`、`cg_ferris_wheel_kexin`（`adv3d.js` 還登記著）。
- 3D：`assets/models/env/second_ai/aa_support/v0_dorm_props.glb`（412 的紙箱、阿勳的書桌、保齡球袋；`assets3d.js` 還登記著 `bldg.v0_dorm_props`）；宿舍房間 GLB 裡 `Y412_*` 的節點（同一個檔，別的年份還在用）。
- 經濟系四位、魏教授、家豪的人物模型和立繪：法律系時期還在用（C 類），不算。

## 做完的結果

- 分支 `worktree-agent-a7c4d967d66f4354e`（沒有 push）。commit：盤點表 → A 類 → B 類之一（story3d／events）→ B 類之二（home／classes／courses／msg／whois／vacfill／game）→ 測試之一～之三＋收尾。
- 單元測試（`tests/*_unit.js`，每支 `timeout 200`，看結束碼）：
  - 修改前（762104842a）：1,352 支，結束碼不是 0 的 3 支——`bulletin_board_1110_unit`（已知）、`sis_no_three_unit`、`v0_a3_unit`。
  - 修改後：1,279 支（刪 73 支），結束碼不是 0 的 2 支——`bulletin_board_1110_unit`、`sis_no_three_unit`，都是修改前就紅的、原因和這一批無關（`sis_no_three` 紅在 `club_later_terms.js` 的一句；它另一項因為這一批多出來的 8 筆過期豁免已經從表上拿掉）。`v0_a3_unit` 拿掉經濟系開局那幾項以後變綠。**新紅 0 支。**
- 沒做的驗證：瀏覽器（新遊戲 → 回顧 → 宿營 → 8/29 搬宿舍 → 開學）沒有實際點過；`index.html` 少三個 script 標籤、少一顆藏著的按鈕，載入順序只靠 Node 的整包載入測試（`pg_harness` 那一類）確認。
