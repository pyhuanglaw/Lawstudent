# 四職位半成品與未整合交付清單（帳號 B 交班，2026-10-17）

> 用途：讓下一班（帳號 A 或 C）找得到四個 AI 做到一半的成果。使用者 2026-10-17 02:5x 要求 LAWWW-B 做最後一次交接完整性補強，只補文件與登記，不改遊戲程式。
> 機器讀的總表照舊是 `docs/handoff/tasks.json`、`docs/handoff/deliveries.json`；這份是閱讀版的半成品索引，每項都寫任務 ID、檔案、分支、最後 commit、完成程度、剩餘工作、能不能整合。
> **狀態：四個職位都已逐筆核對**（LAWWW-B 2026-10-17 02:5x～03:3x；唯讀子代理分類、LAWWW-B 登記與抽查）。拿不準的筆數與清單外可能漏登記的項目寫在各節，交給下一班複核。

## 1. LAWWW（LAWWW-B，分支 `claude/modest-rubin-2lyp7g`）——已核對

| 任務 ID | 內容 | 檔案 | 最後 commit | 完成程度 | 剩餘工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| DORM-LOFT-L | 8/29 搬進宿舍當晚，21:55 轉場後在 203 補生阿凱（R2）、柏翰（R1）、阿哲（L1）坐姿 | `src/story3d.js`（kaiMoveIn，1 行） | `b9eaacf3`（WIP） | 程式寫完、單元測試 camp_y1_unit／v0_e01／v0_e02 通過 | 瀏覽器 `tests/flow_camp_y1.py` 確認 8/29 22:00 三人在位子上；沒問題就把 commit 訊息的 WIP 視為解除 | 已在開發分支；沒測過瀏覽器前不要發布 |
| DORM-LOFT-L／ART-DORM-LOFT | 台大四人房模型整合（LAWWW2-B `a09ebf4d` 交件，使用者 01:3x「宿舍ok」） | `assets/models/env/dorm_room4.glb`、`.json`、`.layout.json`；`src/data/dorm_room_layout.js`（`tools/gen_dorm_room_layout.py`）；`src/zones3d.js` dorm 區塊 | `69e74460`～`5d66f7bb`、`22bdbc41` | 已整合；interior_glb_integration 宿舍 ALL PASS 42、flow_dorm_hall ALL PASS、flow_camp_y1 ALL PASS | 截圖給使用者看；場景美術只有使用者能標 ART_APPROVED | 已整合待測試 |
| AB65-3-Y1S2-L | 大一下口語改稿（AA_209） | `src/story3d.js`、`src/data/events.js`、`src/data/invites.js`、`src/data/activities.js`、`src/data/characters.js`、測試 | `372c6512` | 第 3 節、第 4 節第 1、2、3、5 點做完 | 第 4 節第 4、6、7、8、10、11 點；附錄逐句；階梯 y1s2 等 AA SHA（見第 2 節）；大二 312 | 已做的部分已在開發分支 |
| CAMP-FIX-614 | 宿營＋開學第一週驗收修正 | `src/data/camp_y1.js`、`src/story3d.js`、`src/data/events.js` | `259a4c4f` | 台詞 8 項、程式 1～7 做完；flow_camp_y1 ALL PASS | 程式 8 經濟系路線宿營 | 已整合待測試 |
| V0-REWRITE-L | 經濟系前傳改稿 | `src/data/ladder*`、`src/data/events.js`、`src/classes3d.js` 等 | `793e78aa` | 段 A 全部、BB JSON、E15 CG | 段 B～E、BB_179 第 4 節 1～9、AA_203 第 3 節 30 處、AA_206 E26／E37、AA_200 7-2～7-4、BB_179 第 8 節 | 已做的部分已在開發分支 |
| QA-HANDOFF-B1 | 交班沒跑完的測試 | — | — | — | 整套單元測試、萬才館／zone_transitions／總圖×2／霖澤館／法圖／重訪日 1 瀏覽器流程 | — |

LAWWW-B 沒有本機沒 push 的檔案、沒有 WIP 分支。

## 2. AA（AA-B，分支 `claude/cool-heisenberg-o8kuqx`，已交班 `ec63dd53`）——已核對（126 筆）

### 2-1. 前半 63 筆（唯讀子代理逐筆打開 diff、grep 開發分支 src/；LAWWW-B 登記）

- 63 筆都是 AA-B 的工作階段（subject 寫 BB_171 的 28cc392a 也是 AA-B 改 AA 文件）。
- **未整合要注意的**（總表任務都在）：AB65-3-Y1S2-L（AA_209 本身補登；2-1 七處、第 4 節第 4、6、7、8、10、11 點、附錄逐句沒做）、V1-INV-WORDING（AA_194 第 4 節邀約台詞，invites.js 74、78～79 行還是舊句）、HOLIDAY-SYS（AA_198 等：TERMS 仍 18 週、SCHOOL 沒有 2024-11-22／2026-11-20、Y3S2 開學仍 2028-02-14、大一跨年信義區）、VAC-X2（日本 3 月底出發；ROUTE_DATES 仍 2028-01-08；AA_201 規格 218a0dba 補登 DL-AA-AA201）、V4-E10、DATE-S8、SYS-PHONE-CHAT（AA_202，程式沒有）、V1-BB168（AA_200 第 2 節 18 項）、AB65-2-L（AA_207 定稿 DL-AA-AB652，待開工）、V0-REWRITE-L 段 B～E。
- **補建任務**：V1-AA194-L（AA_194 第 1～3 節大一上階梯與 rel_lines，總表原本沒有 LAWWW 任務）。
- **登記修正**：DL-AA-CAMPL1 的 sha 欄原本是一段文字（工具比對不到），改成 `37e34086`、整合狀態改已整合待測試。
- **拿不準、子代理自己的判斷**（9 筆，下一班可以複核）：be4e84e6（研究表，算參考用交付）、bbd6538d／43f5e1fa（使用者決定紀錄，算裁定交付）、c80c37c4（AA 裁定，算 WIP）、82488aea（互審紀錄，算一般）、b115c6d9／2bc88cb8（一半互審一半規格，算已涵蓋交付）、202dcd6c（交接紀錄夾草稿，算 WIP）、92fdf140（設定同步，算一般）。

- 分類結果（out_aa1.json）：{'DELIVERY新登記': 21, 'DELIVERY已涵蓋': 20, 'WORK': 14, 'WIP': 8, '已登記略過': 0}

**AA 前半的半成品（WIP）**

| 任務 ID | 內容 | 檔案路徑 | 分支 | 最後 commit | 完成程度 | 剩餘工作 | 能不能整合 |
|---|---|---|---|---|---|---|---|
| AB65-3（大一下 BB 人物閒聊階梯；LAWWW 匯入是 AB65-3-Y1S2-L） | 大一下 BB 人物閒聊階梯照 AA_209 寫回 JSON（交班 CHECKPOINT） | `docs/story_planning/ladder/build_ladder_bb_y1s2.py`、`docs/story_planning/ladder/ladder_bb_y1s2.json` | `claude/cool-heisenberg-o8kuqx` | `2fd0399d` | 芷若、子晴、學姊、沛珊寫回完成；--check 通過、JSON 和產生器一致；可昕 K2 沒改；AA 還沒逐句看 diff | 補可昕 K2（K2-L5 公車改開車、K2-L8、K2-L6、K2-L2、K2-L1 寒假天數）；對照 AA_209 第 2 節、2-1、附錄 B 逐句看 git diff 646490c5；build＋--check；拿掉 WIP 字樣；SHA 交 LAWWW 用 tools/ladder/import_ladder.py 匯入 | 不行：WIP，commit 訊息與 AA 交班紀錄 C 類都寫「不要匯入」 |
| NS-Y1S2（大一下以安、語彤閒聊階梯；LAWWW 匯入是 AB65-3-Y1S2-L） | 大一下以安、語彤閒聊階梯照 AA_209 寫回（產生器改到一半） | `docs/story_planning/ladder/build_ladder_aa_y1s2.py` | `claude/cool-heisenberg-o8kuqx` | `34b1d21a` | 這筆：產生器改一半、JSON 沒重新產生。AA 交班紀錄說後續 a853ef49 改完、--check 通過（a853ef49 不在本批） | 對照 AA_209、88585540 以後的版本逐句看 diff；重產 ladder_aa_y1s2.json；拿掉 WIP；SHA 交 LAWWW 匯入 | 不行：WIP，AA 註明不要匯入 |
| AB65-3（大二上） | AA_211 大二上口語改稿（AA＋BB 人物）＋群戲三場新稿＋附錄 B 審稿原文；AA_143 指到 AA_211 | `docs/story_planning/AA_211_大二上口語改稿_AA與BB人物.md`、`docs/story_planning/AA_211_附錄_審稿原文.md`、`docs/story_planning/AA_143_大二的年度群戲與模擬法庭結果.md`、`docs/story_planning/AA_交接紀錄.md` | `claude/cool-heisenberg-o8kuqx` | `8f837d93` | AA 裁定與群戲三場新稿寫完；BB-B 口氣審（BB_181 WIP）沒回 | BB-B 口氣審 → AA 裁定（照 AA_209 2-1 做法）→ ladder_aa_y2s1／ladder_bb_y2s1 寫回 JSON → 交 LAWWW-B；總表要另開 LAWWW 實作任務（目前只有 AB65-3） | 不行：等 BB-B 口氣審，還沒交 LAWWW |
| AA-103-SP | AA_交接紀錄：AA-103-SP 查證＋林教授回答的草稿一句（LEGAL_REVIEW_REQUIRED）；MSG-2 要先定生日；CAMP-L1 派驗收代理 | `docs/story_planning/AA_交接紀錄.md` | `claude/cool-heisenberg-o8kuqx` | `202dcd6c` | 草稿一句：「對。這種案子，被告自己沒有請，審判長要幫他指定一位，公設辯護人或律師。」 | BB-B 法律審查；併入 AB65-3 大三上那批一起交 LAWWW；MSG-2 先定 AA 六位生日 | 不行：還沒法律審查、還沒交 |
| HOL-VA | AA_199 4-2：AA 六位的假期活動清單第一批 VA-01～VA-12（只規劃，不寫台詞） | `docs/story_planning/AA_199_寒暑假多活動行事曆_研究企劃與分工.md` | `claude/cool-heisenberg-o8kuqx` | `599deb38` | 規劃清單 12 項完成；VA-02、VA-03（12/29 海邊）的台詞已在 AA_204 | 其餘 VA 的台詞；照 VAC-S1 定稿接活動卡；交 LAWWW | 不行：只有規劃沒有台詞，VAC-S1 還是骨架 |
| VAC-T1（兼 VAC-B2 的 AA 裁定） | AA_199 4-1：BB_173（VAC-B2）的五個 AA 決定（日本＝阿凱那團 8/24～28、KH 旅館雙床房、營隊 7/1～7/5 起、學姊交換時程同意、時段不撞 AA） | `docs/story_planning/AA_199_寒暑假多活動行事曆_研究企劃與分工.md` | `claude/cool-heisenberg-o8kuqx` | `c80c37c4` | 五個決定定案（AA 裁定） | VAC-T1 五年時間線補完；VAC-S1 定稿後和 BB_173 一起交 LAWWW（VAC-L1） | 不行：AA_199 還沒正式交 LAWWW（VAC-L1 待開工、VAC-S1 骨架） |
| VAC-T1（兼 VAC-X1、VAC-D1） | AA_199 第 4 節五年時間線初稿、5-2 研究對照的衝突、第 6 節給使用者的五個決定 Q1～Q5 | `docs/story_planning/AA_199_寒暑假多活動行事曆_研究企劃與分工.md` | `claude/cool-heisenberg-o8kuqx` | `cc55bde2` | 五年時間線初稿；Q1～Q5 已由使用者 21:49 決定 | VAC-T1 每個寒暑假的保留／改期／重寫衝突表補完；VAC-X1 交換時間差核對；等 VAC-L1 | 不行：初稿 |
| VAC-S1（兼 VAC-F1） | AA_199 第 3 節：多活動行事曆骨架 v0.1（活動卡、行事曆與衝突、推進選單、長期活動、沒錄取取消、和現有系統的接法）＋3-7 家庭補助方案 | `docs/story_planning/AA_199_寒暑假多活動行事曆_研究企劃與分工.md` | `claude/cool-heisenberg-o8kuqx` | `d6dd1f7c` | 骨架 v0.1；3-7 家庭補助初版（費用誰出已由使用者 21:49 Q1 決定） | 活動種類照 VAC-R1 定稿；等 VAC-L1 技術短評定資料結構；定稿後交 LAWWW | 不行：骨架，資料結構等 VAC-L1 |

**新登記的交付**（未整合的要排進施工）

| 交付 ID | 任務 | 整合 | 內容 |
|---|---|---|---|
| DL-AA-42b19dca | AB65-3-Y1S2-L | 已整合待測試 | AA_198 第 5 節更正：大一下成績約定的「一起看」、P4e 改在成績公布日 6/29（回 LAWWW-B 02:28 的問題） |
| DL-AA-096136d2 | AB65-3-Y1S2-L | 未整合 | AA_209 2-1：BB_180 口氣審裁定（七處採用、KAI_TAPE 照 BB 擺法、重訪日沛珊不加句）＝AB65-3-Y1S2-L 正式交付 SHA；AA_205 6-14 茶會 Kevin 定字、烤肉顧火寫回 |
| DL-AA-dc490ec7 | CAMP-FIX-614 | 已整合待測試 | AA_205 6-14：宿營＋開學第一週驗收修正（8/29 群組 17:30、揭曉前叫凱文、夜遊小隊輔帶、茶會 19:10、W1 漏的三句） |
| DL-AA-262ff7dc | AB65-3-Y1S2-L | 未整合 | AA_209 初版：大一下口語改稿（AA 人物＋BB 人物）＋重訪日 1 麵店群戲；AA_197 阿哲改住 203 |
| DL-AA-e1557b60 | START-WEEK | 已整合待測試 | AA_195 4-11：回 LAWWW-B START-WEEK 問題——8/29 書桌前、22:40 旁白、8/30 三項 447 元與完成句、W1 舊句 8 處新句、沛珊不補國文第一堂 |
| DL-AA-4516159b | HOLIDAY-SYS | 未整合 | AA_198 第 2 節改定：經濟系寒假 12/23 放假、住宿舍到 1/5、1/6 才回家；A2 留 1/5 只換成日期 |
| DL-AA-c0b8b917 | HOLIDAY-SYS | 參考用 | AA_197 1-7 每學期驗收單（七件共用＋十個學期各自要看的日期與事件＋回報格式） |
| DL-AA-2fb697b2 | VAC-X2 | 未整合 | 日本路線 3 月底出發（AA_201）同步五份企劃：AA_144 X1／X2 與路線表、AA_180 起算日與送機、AA_113 以安新 16 送機 3/25、AA_71 杜鵑花、AA_158 狀態機日期 |
| DL-AA-43f5e1fa | VAC-X2 | 未整合 | 使用者 22:2x 選甲（日本 3 月底出發），AA_201 解除暫停、可以施工；AA_199、交接紀錄同步 |
| DL-AA-6e94d8d7 | V1-INV-WORDING | 未整合 | AA_194 第 4 節定稿：BB 互審通過，採用兩處建議（以安「好啊，剛好想走走。」、語彤「我阿姨的店喔。」）＝總表 V1-INV-WORDING 的來源 SHA |
| DL-AA-24b7e147 | V1-INV-WORDING | 未整合 | AA_194 第 4 節：芯慈交換聯絡方式只留定稿（「我加你了。」「有缺講義的話跟我說，我都有拍。」） |
| DL-AA-8fbb120f | V1-INV-WORDING | 未整合 | AA_194 第 4 節主體：AA 六位邀約、一起走、交換聯絡方式改稿 23 處＋兩處改規則（以安大一散步只問第一次、語彤第一次散步週六） |
| DL-AA-21d7f681 | HOLIDAY-SYS | 未整合 | AA_154 1-1：經濟系那年照 16 週制（12/25、1/1 在寒假、E20 改寒假聚會、平行世界說明作廢、校定假日加 113～115 學年運動會停課、寒假 12/23 起） |
| DL-AA-8faab5d2 | BUG-INVITE-WEEKEND | 已整合待測試 | AA_134：當面約人的開場改「你等一下有空嗎？」／「你明天有空嗎？」（使用者試玩回報） |
| DL-AA-bbd6538d | VAC-X2 | 未整合 | 使用者 21:49 回 AA_199 第 6 節 Q1～Q5：出國機票家裡出、當地花費自己出；日本 3 月底出發；第一批活動 AA 定；機場 3D、旅館街景用使用者給的 CG；接待型交流虛構；開任務 VAC-A2、B3、X2 |
| DL-AA-f6992746 | HOLIDAY-SYS | 未整合 | AA_197 1-6：大三下開學定 2028/2/21（附理由：113～115 學年春季開學都在 2 月中下旬） |
| DL-AA-be4e84e6 |  | 參考用 | AA_199 第 2 節寒暑假活動研究表（VAC-R1）＋研究原文附錄（核心／可選／只當背景、重要事實、查不到的）。總表沒有 VAC-R1，應屬 VAC-S1 的前置 |
| DL-AA-434c4040 | V4-E10 | 未整合 | 更正 AA-B 21:08 的裁定：交換志願表時學姊還在臺灣，反應改成下一次當面、截止前沒遇到才用 BB 的手機版（8f781b12） |
| DL-AA-6812912b | HOLIDAY-SYS | 未整合 | AA_197 1-5：大一跨年改搭捷運去信義區、明軒在管制線當工作人員是掉頭的原因（BB_171 互審） |
| DL-AA-28cc392a | DATE-S8 | 未整合 | BB_171 C1／C3／C7 對齊：AA_128 大一暑假芷若 7/1～8/25、以安 7/25～8/8 在台中、子晴學姊過年改已定案；AA_197 1-6 2028/12/31 是週日 |
| DL-AA-9925f201 | ART-GYM-BG1 | 已整合待測試 | AA_195 4-4：開學典禮背景規格（新體育館內部典禮、畢業典禮共用、不放真實校徽；做好前用 ntu_avenue、不擋改預設） |


### 2-2. 後半 63 筆（AA-B 寫 43 筆、BB 分支合併進來 20 筆）

- **大一下閒聊階梯（特別確認）**：產生器重跑和 commit 裡的 JSON 一致；開發分支 ladder.js 大一下＝72ea87f5 版。**AA-B 交班說「可昕 K2 沒改」，但 2fd0399d 實際改了可昕 17 處**——要 AA 逐句看 diff。**匯入工具預設會把 AA 分支所有 ladder_*.json 一起帶進來，一定要逐檔用「檔名=ref」**。
- **AA_211（特別確認）**：`docs/story_planning/AA_211_大二上口語改稿_AA與BB人物.md`＋附錄，最後 `8f837d93`（附錄 A `65a2aab8`）；AA 的裁定、群戲三場、給 LAWWW 8 點都寫好；等 BB_181 口氣審（BB 分支 5c8e7539，交班中斷、沒傳給 AA）；y2s1 階梯寫回還沒開始；還沒交 LAWWW。
- **登記修正**：DLV-1016-397（88585540，AA 口頭禪配額）原本標已整合待測試，實際沒進開發分支（ladder.js 舊句還在）→ 改未整合。
- **總表補建**：DORM-Y34（別名 ROOM4，大三、大四房間，AA）、HOL-NYE-Y3、HOL-NYE-Y4；ART-WZ7 加別名 WZ7。HOLIDAY-SYS、AA186-FIX、V1-AA194-L、AB65-3-Y1S2-L 的 next 補上核對結果。
- **拿不準的 6 筆**（子代理判斷，下一班可複核）：125f4d1a、d7cf6e78（AA_194 大一上階梯，可能其實算交付）、c50a3f64、a5a54293（WIP 或已被後續版本吸收）、b8c036d5（經濟系部分有沒有跟 BB_179 進去沒逐句核對）、5871d068（BB_167 用「參考用」登記）。

- 分類結果（out_aa2.json）：{'DELIVERY新登記': 19, 'DELIVERY已涵蓋': 3, 'WORK': 34, 'WIP': 7, '已登記略過': 0}

**AA 後半的半成品（WIP）**

| 任務 ID | 內容 | 檔案路徑 | 分支 | 最後 commit | 完成程度 | 剩餘工作 | 能不能整合 |
|---|---|---|---|---|---|---|---|
| VAC-S1（另含 VAC-T1、VAC-X1） | AA_199 寒暑假多活動行事曆建檔：使用者 VAC 指令紀錄（第 0 節）、四份交付的位置、跨 AI 任務表第一版（VAC-R1～D1） | `docs/story_planning/AA_199_寒暑假多活動行事曆_研究企劃與分工.md`、`docs/story_planning/AA_199_附錄_寒暑假活動研究原文.md` | `claude/cool-heisenberg-o8kuqx` | `e2ab9073` | 第一版只有指令紀錄＋任務表；之後補到：研究表 VAC-R1（第 2 節）、行事曆骨架 v0.1（第 3 節，VAC-S1）、五年時間線初稿（第 4 節，VAC-T1）、AA 六位假期活動第一批（4-2）、使用者 Q1～Q5 決定（6-0）。AA_199 最後 commit 599deb38（10-16 22:25） | VAC-S1 定稿（等 LAWWW 的 VAC-L1 技術短評）；VAC-T1、VAC-X1 補完；HOL-VA 台詞；AA-B 交班列在 C 類「還沒開始」 | 不行：研究與企劃階段，程式 VAC-L1 排在 HOLIDAY-SYS（16 週制）之後 |
| None | AA_194 第 2 節：語彤大一上閒聊階梯 29 處（ladder_aa.json；Y-L1 條件補 ev_library_door_phone、傘選項只給給過傘的人、招呼不綁地點時段） | `docs/story_planning/ladder/build_ladder_aa.py`、`docs/story_planning/ladder/ladder_aa.json`、`docs/story_planning/AA_194_大一上口語改寫對照_AA人物.md` | `claude/cool-heisenberg-o8kuqx` | `125f4d1a` | JSON 已產生（ladder_aa.json 在 AA 分支最後一次修改就是這筆）；和開發分支 ladder.js 比，以安 45、語彤 45 個字串不同 | AA_194 檔頭還寫「AA-B 改完，等 BB-B 互審」，找不到第 1～2 節的互審紀錄；AA 沒有把 SHA 交 LAWWW-B；AA-B 交班紀錄沒列這項；總表沒有對應任務 | 不行（先請 AA 確認互審與交付）；匯入時要用 import_ladder.py 的「檔名=ref」單檔指定，不能直接用 AA 分支 head（會把 y1s2 WIP 一起匯入） |
| None | AA_194 第 1 節：以安大一上閒聊階梯 26 處（問法、收尾、口頭禪、招呼不看時段、週五回台中改每月、A-L8 考後版、A-L9 換成期中週次）；AA_194 建檔 | `docs/story_planning/ladder/build_ladder_aa.py`、`docs/story_planning/ladder/ladder_aa.json`、`docs/story_planning/AA_194_大一上口語改寫對照_AA人物.md` | `claude/cool-heisenberg-o8kuqx` | `d7cf6e78` | 同 125f4d1a（以安部分）；第 1 節「跟著要改」兩件（A2-L5、ev_an_dorm_appeal）後來列進 AA_209 | 同 125f4d1a；AN_L9_REASON→AN_L9_MIDTERM_WEEK 要 LAWWW 搜程式 | 不行（同 125f4d1a） |
| AB65-3（#39、#40 屬 PLAN-1016-ROM） | AA_189 照使用者審稿再修（小語火鍋、以安讀書會、語彤阿姨、柏翰聊電影、以安家庭背景移到室友申訴）——AA_189 最新版 | `docs/story_planning/AA_189_台詞改稿對照_第一批.md` | `claude/cool-heisenberg-o8kuqx` | `3a4a7608` | 41 項改稿，使用者 20:3x 審過；第一、二節（好感升級、大一上階梯）已併入 AA_194；#32 ev_b4_left_an 進 AA_209 | 第三～五節沒看到被哪個交付包接走（開發分支都還是舊句）：#31 初次見面自我介紹（talkCharacter）、#33 ev_an_report_followup、#34 AA_179 第 4 節「沒回」、#35～#36 以安手機兩則、#38 A8-L6、#39～#40 AA_187 戀愛線、#41 小福最後一天 | 不行：AA_189 自己寫「確認以前不交 LAWWW-B」，要 AA 併進各學期改稿包 |
| AB-65（另含 AA186-FIX 暫停的「AB-62 子晴那封信」） | AB-62 B：BB_166 程式台詞定稿（草稿）；學姊伴侶註記更正（顧承遠，陳助教是朋友：BB_133、BB_136、ladder_bb_y1s2／y2s1）；BB_167 附錄 SC5 | `docs/story_planning/BB_166_AB62_程式台詞定稿.md`、`docs/story_planning/BB_133_閒聊階梯_大一下_芷若子晴學姊沛珊可昕.md`、`docs/story_planning/BB_136_閒聊階梯_大二上_芷若子晴學姊沛珊可昕.md`、`docs/story_planning/BB_167_附錄/SC5_訊息邀約同行偶遇.md` | `claude/cool-heisenberg-o8kuqx` | `c50a3f64` | 定稿字寫完（子晴、沛珊、學姊、可昕、芷若 17 小節）；1-1 已進 BB_169（DL-BB-A4CC）與 AA_209 附錄 B 第 5 節，4-1 進 AA_209；zq_game、SMALLTALK、沛珊兩場分手進 AA_211（等口氣審） | BB_166 檔頭仍是「草稿，等使用者確認才交 LAWWW-B」（最後 commit 5e02f346）；學姊 3-1～3-4、可昕 4-2、芷若 5-1～5-4 沒看到被哪個交付包接走 | 不行：由 AA 各學期改稿包轉交；BB 要更新檔頭狀態 |
| AB65-3 | AA_190：以安、語彤閒聊階梯（八學期）上下文與事實問題 75 項＋AA-B 裁定五件（杜鵑花誰拍、紅紙、週五回台中、A2-L6、A3-L3） | `docs/story_planning/AA_190_以安語彤閒聊階梯_上下文與事實問題清單.md` | `claude/cool-heisenberg-o8kuqx` | `fa7d9c6c` | 清單完成；大一上（AA_194）、大一下（AA_209）已照用 | 大二上～大四下還沒逐項對（AA_211 沒引用 AA_190）；給 LAWWW-B 的系統層建議（greet.base 的「早／今天／下一堂」移到 greet.when＋time）還沒交 | 不行：是審查清單，不是改稿；要跟各學期改稿一起交 |
| AB65-3（大一上部分＝V1-BB168） | AB-62／AB-63 草稿：BB 閒聊階梯口頭禪減量（子晴「欸不是」、學姊條列、沛珊「奇怪的問題」、可昕「假設」），10 檔；commit 自己寫「LAWWW-B 先不要匯入」 | `docs/story_planning/ladder/build_ladder_bb*.py`、`docs/story_planning/ladder/ladder_bb.json`、`docs/story_planning/ladder/ladder_bb_y1s2.json`、`ladder_bb_y2s1～y3s2.json` | `claude/cool-heisenberg-o8kuqx` | `a5a54293` | 大一上已被 BB_169 再改（DL-BB-A4CC，未整合）；大一下由 AA 分支接手（WIP 2fd0399d）；大二上～大三下的改動留在 BB 分支（8421efdb 版）。開發分支 ladder.js（來源 72ea87f5，18:37）全部沒有 | 跟 AB65-3 各學期一起交：大二上照 AA_211 寫回、大二下起逐學期 | 不行：草稿，要跟各學期改稿包一起 |

**新登記的交付**（未整合的要排進施工）

| 交付 ID | 任務 | 整合 | 內容 |
|---|---|---|---|
| DL-AA-c3159886 | START-WEEK | 已整合待測試 | 使用者 21:25「這一版舊存檔不用相容」：AA_198 第 3 節存檔遷移、補償表作廢，AA_197 同步；AA_195 B7b 阿哲麵店選項改「她在整理今天的筆記」→「整理筆記。嗯哼。」 |
| DL-AA-b4551331 | HOLIDAY-SYS | 未整合 | AA_197 1-5 跨年重排：大一 12/31 寒假版（12/26 群組揪、19:00 麵店→22:30 人太多→23:40 頂樓、阿哲「我們就說有看到」、NYE_Y1 四值）、AA 六位六件事表、其他四年方向；附帶 AA_199 任務表 |
| DL-AA-54fcb10b | HOLIDAY-SYS | 未整合 | AA_197 1-6：期末考週的國定假日（115 下端午、116 上 12/24 補假、116 下端午補假）、成績照公布日發 |
| DL-AA-a7f3eaee | HOLIDAY-SYS | 未整合 | AA_198 16 週制八學期影響清單（必搬／重寫／可留、存檔遷移、施工順序）＋AA 決定：聖誕留真正日期改放假聚會、成績放假後第 3 個週一、重訪日 1 6/12、階梯週次、大三下開學 2/21 |
| DL-AA-cae26a6a | HOLIDAY-SYS | 未整合 | AA_197 1-6 逐學期日期表（113 經濟系、114～117 法律系；116、117 推測；成績＝放假後第 3 個週一；換房間日、成績日；要改的五件） |
| DL-AA-d5b5d188 | START-WEEK | 已整合待測試 | AA_195 4-8 阿哲初遇 ev_zhe_w1_meet（9/1 憲法第一堂問中午吃什麼；備案 9/3 刑總、9/4 早上版；不搶 P4、迎新叫哥） |
| DL-AA-c8078993 | HOLIDAY-SYS | 未整合 | AA_197 1-1～1-4：學期運作／生活運作、假期的一天（快轉是選項、除夕回家）、宿舍寒暑假不清空、暑住一鍵、AA 六位假期所在地；AA_183 在家模式部分作廢 |
| DL-AA-ea6b2919 | START-WEEK | 已整合待測試 | AA_195 4-7 D：經濟系轉場也改 8/29、Y0_SUMMER 留兩句、字卡與回顧句 |
| DL-AA-a119fceb | HOLIDAY-SYS | 未整合 | 使用者 P0 21:08 16 週制假期生活制度：AA_197 第 0 節決定紀錄（必測九項、每學期七件）；AA_195 2-4 結案（8/29 照舊、直接有住宿資格）、民總保留週四下午、茶會分流 |
| DL-AA-6fd71f3b | START-WEEK | 已整合待測試 | AA_196 大一上時間線盤點原文、AA_195 附錄研究原文、AA_195 4-7 盤點的處理（程式 15 項、AA 改字 9 項、BB 7 項） |
| DL-AA-f2d0b952 | START-WEEK | 已整合待測試 | AA_195 4-1：民總是下午（明天下午）、23:30 以後回宿舍的短版 |
| DL-AA-7b2d057f | START-WEEK | 參考用 | AA_195 1-2 校曆（113～115 學年實際日期、116 以後推測）；2-4 祐廷是臺北人不能 8/29 住男一舍、三個方案給使用者 |
| DL-AA-a4b165e7 | START-WEEK | 已整合待測試 | AA_195 4-1：9/3 晚上宿舍旁白改稿（不再自我介紹、不寫「上週」、課綱寫會點人、案例影本、DAY1_NARR 移到 8/29）＋給 BB-B 的阿凱、可昕、家族群組時間問題 |
| DL-AA-a353a009 | START-WEEK | 未整合 | 使用者三件決定寫進 AA_195 2-0（16 週制、8/29 搬宿舍、9/27～28 迎新為虛構）＋交接紀錄；AA_194 柏翰 CLOSE 道別換句（和芯慈撞，BB-B 互審） |
| DL-AA-6e934e86 |  | 未整合 | AA_194 第 3 節：AA 六位（以安、語彤、阿哲、小語、柏翰、芯慈）好感升級與道別 rel_lines 逐句改稿（不寫死地點時刻、讀書會分版） |
| DL-AA-798da2af | START-WEEK | 已整合待測試 | AA_195 第 1～3 節：開局與大一上時間線查證（開學典禮 8/31、新生入住、迎新、16 週、民總時段）＋要使用者確認的三件＋AA 自己定的（民總週四、相機案例改第一堂暖身、校定假日） |
| DL-AA-d8042bc0 | ART-PT-SIS-FORMAL | 已整合待測試 | BB_131 §12：學姊面試西裝立繪 heroine_05/formal 三張（neutral、serious、smile）BB 驗收通過（D59 角色美術） |
| DL-AA-085d9771 | AA186-FIX | 未整合 | AB-62 C（小福）收尾：日文課 G4b 參照改活大（japanese.py→JP.json、BB_102 重新產生）；BB_144 away「在小福吃午餐」大一下以後改「在活大吃午餐」；BB_161 標新名稱 |
| DL-AA-b8c036d5 | AA186-FIX | 未整合 | AB-62 A＋C：BB_104～107、112、113、119、124、135、137、164 補錨（照片配字、「上次」說是哪次、暗號第一次自己說明）；小福 2026 春以後改活大；明軒德國出發和 AA_140 G12 對齊；可昕前任句長 |


> 唯讀核對（2026-10-17）。來源：AA 分支 git 紀錄、`AA_交接紀錄.md`「交班（AA-B 帳號 B，2026-10-17 02:4x）」與「AA-B 全部待辦」、開發分支 `claude/modest-rubin-2lyp7g` 的 `src/`、`docs/handoff/tasks.json`、`deliveries.json`。
> 「和開發分支差幾處」是把 JSON 的每個字串欄位（不含 note）逐一比對 `src/data/ladder.js` 得到的數字。

#### 2-3. 半成品

| 任務 ID | 檔案路徑 | 分支 | 最後 commit | 完成程度 | 剩餘工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| AB65-3／NS-Y1S2（大一下閒聊階梯寫回 JSON） | `docs/story_planning/ladder/build_ladder_aa_y1s2.py`、`ladder_aa_y1s2.json`、`build_ladder_bb_y1s2.py`、`ladder_bb_y1s2.json` | AA 分支 | aa 產生器 `34b1d21a`、aa JSON `a853ef49`（02:29）；bb 兩檔 `2fd0399d`（02:35，WIP） | 兩份 JSON 都和產生器的輸出一致（在 scratchpad 重跑確認）。七人都有改：以安 56／115、語彤 45／110、芷若 35、子晴 27、學姊 24、沛珊 23、可昕 19 個字串和開發分支不同。**可昕 K2 其實有改**：`2fd0399d` 的可昕比 `646490c5` 多 17 處，包括交班說「沒改」的 K2-L1（寒假天數、二十三→四十一次）、K2-L2、K2-L5（公車→開車）、K2-L6、K2-L8，另有 K2-L4、K2-L7 | AA 還沒逐句看 diff（對 `AA_209` 第 2 節、2-1、附錄 A／B）；確認可昕 K2 是否完整（commit 訊息和交班紀錄都寫「未完成」，和內容對不上）；commit 拿掉 WIP 字樣；把 SHA 給 LAWWW-B | **不行**：commit 訊息寫「不要匯入」。`tools/ladder/import_ladder.py` 預設 REF 是 AA 分支 head，而且一次匯入全部 `ladder_*.json`，現在照預設跑會把這份 WIP 一起匯入 |
| AB65-3（大二上 `AA_211`） | `docs/story_planning/AA_211_大二上口語改稿_AA與BB人物.md`（142 行）、`AA_211_附錄_審稿原文.md`（419 行） | AA 分支 | `8f837d93`（02:25；附錄 A `65a2aab8`） | AA 的裁定寫完：結論、AA 的調整 10 項、群戲三場新稿（開學第一頓、中秋、期中走出教室）、16 週／312 室友／條件、給 BB 的三問、給 LAWWW 的 8 點 | 等 BB-B 口氣審：BB 分支 `BB_181_AA211口氣審_大二上BB人物_WIP.md`（`5c8e7539`，41 行，交班時中斷，還沒傳給 AA-B）；AA 裁定 → 寫回 `ladder_aa_y2s1.json`（最後 `88585540`）、`ladder_bb_y2s1.json`（AA 分支最後 `c50a3f64`，要從 BB 分支 `8421efdb` 搬）；之後才交 LAWWW-B | **不行**：還沒過 BB 口氣審，也還沒交 LAWWW-B；總表沒有獨立任務（只寫在 AB-65 的 next） |
| （沒有任務 ID）`AA_194` 第 1～2 節：以安、語彤大一上閒聊階梯 | `docs/story_planning/ladder/build_ladder_aa.py`、`ladder_aa.json`；`AA_194_大一上口語改寫對照_AA人物.md` | AA 分支 | `125f4d1a`（10-16 20:46；以安 `d7cf6e78`） | JSON 已產生；以安 45、語彤 45 個字串和開發分支不同 | `AA_194` 檔頭還寫「等 BB-B 互審」，找不到這兩節的互審紀錄；AA 沒有交 SHA；**AA-B 交班紀錄和總表都沒有這一項** | **不行**，要先請 AA 確認；匯入時用 `import_ladder.py` 的「檔名=ref」單檔指定 |
| （沒有任務 ID）`AA_194` 第 3 節：AA 六位 rel_lines | `AA_194_大一上口語改寫對照_AA人物.md` | AA 分支 | `6e934e86`（第 3 節）；全檔最後 `6e94d8d7` | 改稿完成，各列有 BB-B 互審註記，21:3x 照 `AA_200` 再改；`AA_209` 附錄 A 寫「開發分支還是舊句，等同步」 | LAWWW 換 `src/data/rel_lines.js`；需要一個任務（`V1-INV-WORDING` 只涵蓋第 4 節 invites） | 可以（本清單登記為 DELIVERY 未整合） |
| VAC-S1、VAC-T1、VAC-X1 | `AA_199_寒暑假多活動行事曆_研究企劃與分工.md`、`AA_199_附錄_寒暑假活動研究原文.md` | AA 分支 | `599deb38`（10-16 22:25） | 研究表 VAC-R1、行事曆骨架 v0.1（第 3 節）、五年時間線初稿（第 4 節）、AA 六位假期活動第一批（4-2）、使用者 Q1～Q5 決定 | VAC-S1 定稿（等 LAWWW 的 VAC-L1 技術短評）；VAC-T1、VAC-X1 補完；HOL-VA 台詞 | 不行：研究與企劃階段；程式排在 HOLIDAY-SYS 之後 |
| HOL-NYE-Y2（大二～大四跨年） | `AA_210_大二到大四跨年_16週制.md` | AA 分支 | `b550eb29`（10-17 01:44） | 規格完成 | 跟大二上、大三上、大四上的施工包交 LAWWW-B；可昕大三、阿哲大四兩句等 AB-65 那兩學期 | 規格可以用，但 AA 還沒交 |
| AB65-3（＋PLAN-1016-ROM）：`AA_189` 剩下的改稿 | `AA_189_台詞改稿對照_第一批.md` | AA 分支 | `3a4a7608`（10-16 20:34） | 41 項使用者審過；第一、二節已併入 `AA_194`；#32 進 `AA_209` | 第三～五節沒看到被哪個交付包接走：#31 初次見面自我介紹（talkCharacter）、#33 ev_an_report_followup、#34 AA_179 第 4 節、#35～#36 以安手機兩則、#38 A8-L6、#39～#40 AA_187 戀愛線（暫停中）、#41 小福最後一天 | 不行：`AA_189` 自己寫「不交 LAWWW-B」，要併進各學期包 |
| AB65-3：`AA_190` 上下文問題清單 | `AA_190_以安語彤閒聊階梯_上下文與事實問題清單.md` | AA 分支 | `1777d471`（內容 `fa7d9c6c`） | 75 項＋AA 裁定五件；大一上、大一下已照用 | 大二上～大四下還沒逐項對（`AA_211` 沒引用）；系統層建議（greet.base 的「早／今天／下一堂」移到 greet.when＋time）還沒交 LAWWW-B | 不行：審查清單，不是改稿 |
| AB65-4、AB65-5、AB65-6 | 跟各學期包 | AA 分支 | — | 重訪日 1 完成（`AA_209` 第 3 節，已實作） | 重訪日 2～5；`BB_173` 第 3 節 A-4／A-5／A-6／A-10／A-11；`lad/y3s1:556`、`BB_170` 剩下的 | 還沒做 |
| ROOM4（**總表沒有這個 ID**） | `AA_208_宿舍四人房_室友.md` | AA 分支 | `a4529998` | 大一 203、經濟系 412、大二 312 定好（大一、經濟系的部分已由 AA208-L、DORM-LOFT-L 實作） | 大三、大四的房間；LAWWW 做完後 AA 核對 | 大三大四還沒寫 |
| ART-METHOD6（暫停） | `tools/blender/env_second/aa_support/` | AA 分支 | `92d99dee` 寫了做法 | 驗證件（土地公廟供品組）沒做 | 劇情優先，LAWWW2 正式派工時才做 | — |

#### 2-4. 也是半成品、但在 BB 分支或由 BB 寫的（AA 分支有合併進來）

| 任務 ID | 檔案 | 最後 commit | 狀態 |
|---|---|---|---|
| AB-65（另含 AA186-FIX 暫停的「AB-62 子晴那封信」） | `BB_166_AB62_程式台詞定稿.md` | `5e02f346` | 檔頭還寫「草稿，等使用者確認才交 LAWWW-B」；1-1、4-1 已進 `BB_169`、`AA_209`；zq_game、SMALLTALK、沛珊兩場分手進 `AA_211`；學姊 3-1～3-4、可昕 4-2、芷若 5-1～5-4 沒看到被哪個交付包接走 |
| AB65-3 | BB 閒聊階梯 `ladder_bb_y2s1`～`y4s2`（BB 分支 `8421efdb` 版：口頭禪減量 `a5a54293`＋16 週週次） | `8421efdb` | 開發分支 ladder.js（來源 `72ea87f5`）都沒有；大二上照 `AA_211` 由 AA 寫回，大二下起逐學期 |
| AB65-3 | `BB_181_AA211口氣審_大二上BB人物_WIP.md`（BB 分支） | `5c8e7539` | 交班時中斷、沒傳給 AA-B；BB 下一班第一件 |

#### 2-5. AA-B 交班紀錄列的全部未完成與 WIP（照原文抄任務 ID）

- **C 類，交班當下正在做**：①大一下閒聊階梯寫回 JSON（AB65-3 的一部分；WIP `34b1d21a`、`a853ef49`、`2fd0399d`）；②大二上 `AA_211` 等 BB-B 口氣審。沒有背景代理在跑；沒有只存在本機的成果。
- **A 類，AA 自己做**：AB65-2（已交，等 LAWWW 實作後核對）、NS-Y1S2（`AA_209` 已交；閒聊階梯 WIP）、AB65-3、AB65-4（重訪日 2～5）、AB65-5、AB65-6、ROOM4（大三大四的房間）。
- **B 類，等別人、AA 要接手驗收或互審**：CAMP-L1（經濟系路線的宿營還沒做）、START-WEEK、MSG-L1（＝SYS-PHONE-CHAT）、AB-66／BB_179、ART-CG-ECONCAMP、HOLIDAY-SYS、「16 週共用系統」（沒有獨立 ID，＝HOLIDAY-SYS）、VAC-L1、VAC-X2、V4-G34、V2-SIS-BF、VAC-A2、VAC-B1、VAC-B3。
- **C 類，還沒開始**：VAC-S1、VAC-T1、VAC-X1、HOL-NYE-Y2～Y4（總表 ID 是 HOL-NYE-Y2；`AA_210` 規格已完成）、HOL-VA、DOC-18W、MSG-2（要先定 AA 六位的生日）、AA-103-SP（併大三上那批，`LEGAL_REVIEW_REQUIRED`）、Y3S1-XMAS（併大三上那批）。
- **D 類，暫停（劇情優先）**：ART-US1、ART-SOY1、WZ7（總表是 ART-WZ7）、ART-METHOD6。
- **E 類，只存在對話裡**：BB-B 口頭答應拿 `cg_econ_camp`、`BB_179` 把 E15 標 CG、E26／E37 標 AA 改；LAWWW-B 口頭答應新局從 8/22 開始先放 `?start1` 後面、舊 9/27 迎新只留防呆、宿營音響斷電不演。沒有 `send_later`。
- **跨 AI 還沒結的**：AA 答應給 LAWWW-B 的閒聊階梯 SHA **還沒給**；BB-B 對 `AA_211` 的口氣審**沒回**。
- **和總表對不上的 ID**：ROOM4（總表沒有，最接近的是 AA208-L、DORM-LOFT-L，但大三大四房間不在裡面）；WZ7（＝ART-WZ7）；HOL-NYE-Y2～Y4（＝HOL-NYE-Y2）。

#### 2-6. 順手發現（不在這一半的 63 筆裡）

- **`88585540`（AA 口頭禪配額，`DLV-1016-397` 登記為「已整合待測試」）其實不在開發分支**：`src/data/ladder.js` 的來源是 `72ea87f5`（10-16 18:37，早於 `88585540` 的 18:56），以安「……我坐最後一排。理由：第一次。」「……不要叫。理由：我會臉紅。」等舊句都還在。大一下～大四下每學期以安、語彤各有 2～17 處沒進去。
- ART-SHOP1 機車行道具組 v2 的最終交件 `d9388b2a`（BB 分支 21:23）、LAWWW2-B 驗收合併 `5d5bb8aa`，在 deliveries.json 沒有登記（不在這一半的清單裡）。

## 3. BB（BB-B，分支 `claude/elegant-brown-fcos7n`，已交班 `55717c12`）——已核對（113 筆）

- **結論：BB-B 交班說「其餘多半是紀錄」不對**。12 筆點名的交付以外，還有約 70 筆含台詞、規格、招牌圖或使用者裁定：71 筆已被既有交付涵蓋（DL-BB172、DL-BB-A4CC、DL-BB178-MSG、DL-BB171、DL-BB175、DL-AA-CAMPL1、DL-BB177 等；ignored 寫「交付（已涵蓋）」與整合狀態），**14 筆原本完全沒登記、這次補登**（下表），30 筆一般工作，1 筆 WIP（BB_181）。
- LAWWW-B 的登記腳本第一次把「covered_by＝沒有登記」誤當成已涵蓋，發現後撤回、改登記這 14 筆（AA 兩半核對過沒有這個問題）。
- **02:40 補登的 12 筆更正**：明信片 ③④＝V4-B01、⑤⑥＝V5-B08；招牌 S1～S6 已整合、S7～S17 只在 LAWWW2 WIP；BB179／AB67／BB180 是部分整合（改未整合）；trip_hotel_twin 只註冊沒有事件用。
- **未整合要注意的**：BB_172（V1-INV-WORDING）、大一上 ladder_bb／BB_169（V1-BB168）、BB_178、BB_171、BB_175、BB_179 段 B～E；Kevin「直屬學弟妹」舊句（START-WEEK next）；16 週 ladder_bb y2s1～y4s2 只在 BB 分支（HOLIDAY-SYS next）。
- **已通過、開發分支還沒有、現成事件在等的圖**：新任務 ART-BB-READY-1017。
- **清單外可能漏登記**（關鍵字沒抓到，**沒核對**，交給下一班）：ART-SHOP1 v1／v2 的 BB 原始交件 905d7a27、d9388b2a（v2 已由 DL-LW2-SHOP1V2 經 LAWWW2 登記）、3ea1eac7（日本路線三月底出發）、019bd293（大三下開學 2/21）、8f781b12、BCG-46 圖本身 e2e7cc9a（開發分支已有、blob 相同）。
- **拿不準的約 11 筆**（子代理判斷、理由在核對輸出）：b15bd19c、5aa55f62、040c9ddb、a96e787c、e5b1aac6、19d9c02d、aa1ad7bc、7b9cd06a、ad25b0f3、c24a286f、3ee58191／ab2b3e19。

**這次補登的 BB 交付**

| 交付 ID | 任務 | 整合 | 內容 |
|---|---|---|---|
| DL-BB-BG-LIBB1 | ART-17 | 已整合待測試 | 背景 ntu_lib_b1（總圖 B1 自習室） |
| DL-BB-3cdb2c60 | BCG-46 | 已整合待測試 | 期末合照 cg_class_photo_y1 使用者定稿（ART_APPROVED）紀錄；圖本身是 e2e7cc9a（不在本清單） |
| DL-BB-a15fece9 | HOLIDAY-SYS | 未整合 | 16 週制：BB_98 大三跨年（寒假版）、BB_99 大四聖誕／跨年／成績 1/8／KH 1/2～1/6／芷若 1/5 明信片、BB_119 日曆；BB_173 附錄記已改 |
| DL-BB-4d719c6f | HOLIDAY-SYS | 未整合 | 16 週制：BB_95 可昕跨年 12/24 邀、期末成績約定 12/19＋成績 1/5（BB_171 T1～T3）、BB_96 大一下成績與重訪日 1、BB_97 大二重訪日 2（6/13）、Z9（6/3）、K14、K |
| DL-BB-19d9c02d | VAC-B2 | 參考用 | BB_173 記下 AA 六位的假期活動（避開用） |
| DL-BB-aa1ad7bc | VAC-B2 | 參考用 | BB_173 第 6 節：AA-B 的五點決定（日本 8/24～28 阿凱團、KH 雙床房、法律生活營 7/1～5、學姊交換時程） |
| DL-BB-544d7475 | VAC-B2 | 參考用 | BB_173 BB 人物假期劇情清單＋附錄盤點（不寫台詞）；修 A-2、A-8、A-9 三處矛盾（BB_113 方奕廷德國獎學金、BB_40／BB_70 方奕廷「這週六爬山」、BB_99 學姊「我爸週六會過來」） |
| DL-BB-a8e8d429 | HOLIDAY-SYS | 未整合 | BB_96 16 週制日期定案：期末 6/8～6/12、重訪日 1 6/12 18:00、成績 6/29、W2b 21:30 |
| DL-BB-ac9bc2ad | HOLIDAY-SYS | 未整合 | BB_96 大一下 16 週制日期對照第一版（W5、W2b、芷若午場、方奕廷 Z6、沛珊、可昕成績、重訪日 1、SK05） |
| DL-BB-8985d243 | V0-B1 | 未整合 | BB_153 E20 經濟系聖誕交換禮物改寒假版（12/25 放寒假第三天） |
| DL-BB-ad25b0f3 | ART-METHOD6 | 參考用 | bb_support README 開頭「BB-B 的做法」（工具、流程、指令、八項紀錄）＋舊成果標「舊標準已通過」；ART-SHOP1 v2 標 LAWWW2-B 21:26 驗收通過 |
| DL-BB-8421efdb | HOLIDAY-SYS | 未整合 | 16 週制機械性修改：ladder 十檔週次 [17,18]→[16,16]、[16,18]→[15,16]、防卡關看第 16 週、K0-L8「快兩個月」；exam_official 14 題＋BB_negotiable |
| DL-BB-ffda8ed3 | START-WEEK | 已整合待測試 | AA_195 4-7 C 的 BB 七項：BB_106 SK01 第 1～6 週、ev_sk01_wave、SK04；BB_170 阿凱 kaiDormTalk 前置 MET_KAI＋introDone |
| DL-BB-99770466 | START-WEEK | 已整合待測試 | BB_170 開學改 9/1 後 BB 人物大一上的時間依賴（34 列清查＋BB 決定、LAWWW-B 程式九項、AA 兩項）；syllabus 經原 P4 移第 1 週、大一下相機回聲改「第一堂」；BB_168 讀書會 |
| DL-BB-7b9cd06a | AB-65 | 參考用 | 使用者 P0 正式決定（AA_192 六項：「……」與語助詞不是配額、代表例 11～20 再修、可昕兩句、重訪日取消統一題目、法律系開局選 B）記進 BB_167 檔頭；BB 代表例 11～20 照逐組意見改 |


- BB 分支 `origin/claude/elegant-brown-fcos7n`，最後是 `55717c12`（02:39，交班登記）。
- 開發分支：本機 HEAD `98cd34e9`（origin/claude/modest-rubin-2lyp7g `7e33aa02` 加上 1 個本機 commit）。
- 唯讀核對，沒有改 repo。圖片用 `git ls-tree` 的 blob 比對；CG 用 `src/adv3d.js` 的 `CG_REGISTRY` 比對；招牌用 LAWWW2 分支的 `signs_src` 和開發分支的 `gongguan_shops.glb` 版本比對。

#### 1. 重要半成品（WIP）與待整合成果

| 任務 ID | 檔案路徑 | 分支 | 最後 commit | 完成程度 | 剩下的工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| AB-65（AB65-3 大二上；BB-ROUTINE） | `docs/story_planning/BB_181_AA211口氣審_大二上BB人物_WIP.md` | elegant-brown | `5c8e7539` | 約 95%：附錄 B 第 2 節、AA 第 2 節、第 5 節三問都看完了；寫好 9 處建議，其中 2 處是事實錯誤：法服值班只在單數週的週六，所以「下週六」「隔週六」都要改。照用清單、對 AA 的回覆也寫好了 | 檔名去掉 `_WIP`；整理成回覆傳給 AA-B（P1，AA-B 在等）；AA 定案後才由 `AA_211` 交給 LAWWW-B | 不能直接整合：這是給 AA-B 的審稿意見。AA 定案後走 AB65-3 |
| HOLIDAY-SYS（16 週制） | `docs/story_planning/ladder/ladder_bb_y2s1～y4s2.json`（＋`build_ladder_bb_*.py`） | elegant-brown | `8421efdb` | BB 部分完成 | **AA 分支上的 y2s1～y4s2 還是舊的週次**：646490c5 只搬了 y1s2。AA-B 接手修改前，要先從 BB 分支搬過來，不然 16 週的週次會被覆蓋掉 | 可以：照「AA 分支匯入」的分工，等 AA-B 搬好再匯入 |
| HOLIDAY-SYS | `docs/story_planning/exam_official/{criminal45,civil40,civil_supp40,securities40}_2026-10-14.json`、`exam_ai/BB_negotiable.json`（＋`tools/map_*`） | elegant-brown | `8421efdb` | 完成：15 題的 scopeWeek 從 16 改成 15 | AA 分支和開發分支 `src/data/exam_bank.js`（來源 AA 分支 a9e6994c）都還是 16，例如 CRIM45_43／44。要請 AA-B 合併，或由 LAWWW 從 BB 分支匯入 | 可以；要和 16 週系統一起上線 |
| HOLIDAY-SYS（大一上～大四的日期規格） | `BB_95`、`BB_96`、`BB_97`、`BB_98`、`BB_99`、`BB_119`、`BB_153` | elegant-brown | `4d719c6f`、`a8e8d429`、`a15fece9`、`8985d243` | 規格完成 | 開發分支還沒改：可昕的成績約定還是「1/2 週五」（story3d.js 第 1580 行）；E20 還寫「期末考週的中間」（events.js 第 2188 行）；W2b 家族期末訊息 BB 改成 21:30，開發分支還是 21:00；大二重訪日 2（6/13）還沒有 | 可以；都沒有登記進 deliveries |
| START-WEEK（使用者裁定，e627d747） | `BB_95` 4-1 | elegant-brown | `e627d747` | 規格完成 | story3d.js 第 879～880 行，Kevin 第三週的家族群組訊息還寫「第三週了，**直屬**學弟妹還活著嗎？」，要改成「**家族的**學弟妹」（使用者：直屬只有學姊一個） | 可以：只改一個字串 |
| V2-SIS-BF／SIS-BF-CAMPUS | `BB_122` 2-1（BB 定案：溫州街路口；學姊說「總要有人排。」，只到大二上第 5 週） | elegant-brown | `5c8e7539` | 規格定案 | 程式還沒有學姊和男友一起出現的場面 | 可以；沒有登記 |
| ART-SHOP1 | `assets/models/env/second_ai/bb_support/scooter_shop_props.glb` 等 | elegant-brown → LAWWW2 | 交件 `d9388b2a`（不在清單）；WIP 是 `2f38aced`、`b800fbce`、`23c50135` | 完成：LAWWW2-B 21:26 驗收；5d5bb8aa 收進 LAWWW2 分支，GLB 是同一個 blob | 開發分支還沒有，等 ART-BG-AA185（機車行背景）用到 | 已在 LAWWW2 分支；deliveries 沒有登記 ART-SHOP1 |
| 等使用者生成 | `court_criminal`、芷若明信片① `pc_zr_1`、② `pc_zr_2`（第 56～58 組） | — | — | 在使用者手上，還沒回來 | 回來後 BB 檢查，放進 `props_approved`／`bg_approved` | — |

#### 2. 已通過、開發分支還沒有的素材

### 2a. 本班（2026-10-15 23:2x 以後）通過的

| 任務 ID | 檔案路徑 | 分支 | 最後 commit | 完成程度 | 剩下的工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| V4-B01（③④，大三上 Z10 `ev_zhiruo_postcard`，11/19、12/17）＋V5-B08（⑤⑥，大四 `ev_zhiruo_postcard2`，9/22、2/19） | `docs/story_planning/props_approved/pc_zr_3.webp`～`pc_zr_6.webp`；`original/pc_zr_3_uncropped.webp`、`pc_zr_5_uncropped.webp` | elegant-brown | `5c8e7539` | BB 定稿。③⑤裁掉了人物背影，放大 1.3 倍，畫面略軟 | 放進信箱物件的插畫。①②⑦還沒生成；明信片程式還沒有（`ev_zhiruo_postcard`／`postcard2` 在 src 都找不到） | 可以；DL-BB-POSTCARD-ZR 只寫了 V4-B01，⑤⑥ 應該是 V5-B08 |
| ART-GG-SIGNS（S7～S17） | `docs/story_planning/signs_approved/gg_{luwei,qingye,kafei,shuiguo,changpian,wenju,brunch,douhua,huoguo,wenli,boardgame,dental,english,rent_roof,meifa,zhongyi,math,minsu,gym,massage,billiard,piano}*_fit.webp`（22 張 `_fit`，原檔另有） | elegant-brown；LAWWW2 的 `signs_src` 有同 blob | `67a10218`…`2f5d4a3d` | BB 通過；LAWWW2-B 已經貼進 GLB，但那是 WIP `b75e50a5`（ART-GG-SIGNS-2，表外） | LAWWW2-B 交件，LAWWW 再整合。開發分支的 `gongguan_shops.glb` 還是 40b73c64 版，只有 S1～S6 | 等 LAWWW2 交件 |
| （已整合，列出來對照） | S1～S6（阿鳳、舊路、藥局、輪轉、影印、日日定食）；11 張背景；BCG-46、BCG-47 | — | — | 開發分支有，blob 相同；S1～S6 在 glb 裡 | 只剩瀏覽器實際看一次 | — |

### 2b. 較早（2026-10-14～10-16 白天）通過、開發分支到現在還沒有的；有幾項是現成事件在等它

| 任務 ID | 檔案路徑 | 分支 | 最後 commit | 完成程度 | 剩下的工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| V3-B03／SCN-V3-02 | `bg_approved/linze_prof_hall.webp` | elegant-brown | `552a0e4e` | BB 通過 | **開發分支已經有學姊 W7 `ev_sis_prof_xu_door`，用的是 `bg:'prof_door'`、`background:'dark'`（黑畫面）**。要放進 `assets/bg/` 並在 S.BG 登記 | 可以（馬上能補） |
| V0-B1（E26） | `cg_approved/cg_ferris_wheel_kexin.webp`（BCG-06） | elegant-brown | `c00647b5` | ART_APPROVED（10-14） | **開發分支的 `ev_y0_e26` 註解寫「CG 還沒有」**。CG_REGISTRY 沒有這一張 | 可以；v0 已授權 |
| V3-B13（沛珊 P3） | `cg_approved/cg_decision_peishan.webp`（BCG-16） | elegant-brown | `c7e1936e` | ART_APPROVED | **events.js 第 2782 行 `{cg:'cg_peishan_decision'}` 留了位置，但 CG_REGISTRY 沒有這個 key**，id 也和檔名不同 | 可以 |
| V3-D6（以安新 8 讀書會） | `cg_approved/cg_study_group_rules.webp`、`cg_study_group_rules_photo.webp`（CG-2／2b） | elegant-brown | `d552d45e` | ART_APPROVED | **events.js 第 2857 行 `{cg:'cg_plg_rules'}` 留了位置**；任務 next 寫「CG-2 檔案還沒有」，其實已經有了 | 可以 |
| SCN-V3-02 | `bg_approved/graduation_avenue.webp` | elegant-brown | `9ef99a54` | BB 通過 | W10 `ev_sis_graduation` 還沒做 | 跟事件一起做 |
| SCN-V3-02 | `bg_approved/cypress_trail.webp` | elegant-brown | `933ae99c` | BB 通過 | 方奕廷 F2 還沒做 | 跟事件一起做 |
| SCN-V3-02 | `bg_approved/bus_night.webp` | elegant-brown | `f89a536b` | BB 通過 | 可昕 K12b 還沒做 | 跟事件一起做 |
| （tasks.json 沒有） | `bg_approved/country_road.webp`（可昕大二春假 G4-04） | elegant-brown | `f89a536b` | BB 通過 | 總表沒有對應任務 | 跟事件一起做 |
| （tasks.json 沒有） | `bg_approved/linze_auditorium.webp`（畢業典禮 G4-13） | elegant-brown | `933ae99c` | BB 通過 | 總表沒有對應任務；SCN-V5-02 可以掛這張 | 跟事件一起做 |
| ART-15／ART-CG41-45／SCN-US-CG／SCN-JP-CG 等 | `cg_approved/` 其餘 59 張（`CG_REGISTRY` 沒有的共 63 張，扣掉上面 4 張；含 CG-10 尾聲基底＋8 個圖層，多半是大二～尾聲、戀愛線、美國／日本路線） | elegant-brown | 多半是 10-14 的 commit；BCG-36～45 在 10-16 | ART_APPROVED | 跟著各學年事件接（D81）。其中 23 張在 deliveries 和 tasks 都沒有個別登記，只靠 ART-15 的總項涵蓋，例如 BCG-03、05、06、07、08、10、12、13、15、19、20、22、24、25、26、30、33、34、38、40、42，CG-8、CG-12 | 照事件的時間 |
| DATE-L*（已登記，未整合） | `date_system/art/d01～d32_base_*.webp`（開發分支只有 d04、d06、d12、d13） | elegant-brown | 10-16 各組 | BB 通過 | 約會系統的底圖 | 已登記為 DLV-1016-25 等 |

- 溫州街的 13 張招牌（`signs_approved/laundry.webp` 等）：開發分支沒有這些檔名，但 LAWWW2 分支的 `signs_src` 有同 blob，是舊批，已經做進 GLB 貼圖。不算漏掉。
- `cg_approved/parts_cg69/`、`parts_econcamp/` 是合成用的零件，成品已經整合，不需要搬。

#### 3. 不在本次清單（關鍵字沒抓到）、但應該登記的 BB 交付

| commit | 內容 | 狀態 |
|---|---|---|
| `e2e7cc9a` | BCG-46 期末合照第三版，也就是定稿的**圖本身** | 已整合（510cd60a，同 blob）；deliveries 沒有 BCG-46 |
| `d9388b2a`、`905d7a27` | ART-SHOP1 v2、v1 交件 | LAWWW2 已收；沒有登記 |
| `2bfad5c5` | S1 阿鳳招牌原圖＋`_fit` | 已在開發分支 glb；DL-BB-GG-SIGNS-S17 的範圍有涵蓋 |
| `3ea1eac7` | BB_98 日本路線改期套回（使用者再次確認：三月底出發；AA_201） | v4 規格，未整合；沒有登記 |
| `019bd293` | 大三下開學改 2/21：民訴甲下重排；柏翰那一句搬到大四上 | syllabus 未整合（開發分支的來源是 aa318d13）；沒有登記 |
| `8f781b12` | BB_98 2-3 V4-E10：學姊的反應改成當晚私訊 | v4 規格；沒有登記 |
| `6e2af299` | BB_177 第四版（臥底＝Kevin） | 內容已併進 v5（DL-AA-CAMPL1） |


## 4. LAWWW2（LAWWW2-B，分支 `claude/funny-albattani-iawshm`）——已核對（2026-10-17 03:0x，唯讀子代理逐檔比對、LAWWW-B 登記）

- **交班狀態**：LAWWW2-B 在自己的交接檔寫了正式交班（`docs/art-rebuild/second_ai/HANDOFF.md`「交班（最新）：2026-10-17 02:4x」，成果最後 `b75e50a5`），但**沒有跑 `snapshot`、`duty handoff`**（funny 上 `duty_LAWWW2.json` 還是 on）。LAWWW-B 代做快照 `snapshots/2026-10-17T0303Z_B_LAWWW2.json`；duty.json 仍顯示 LAWWW2 on——下一班 `duty plan` 會列出來，以交接檔的正式交班紀錄為準（使用者 02:3x 對四職位都說了換班）。
- **第 6 項 16 筆**：DELIVERY 5（登記 DL-LW2-VACA1、DL-LW2-SHOP1V2、DL-LW2-FACETEST、DL-LW2-ARTSOP＋示範案例同一筆）、WORK 3（ignored 寫原因）、WIP 8（5 筆已被既有交付涵蓋、3 筆還開著：ART-GG-SIGNS-2 兩筆、ART-04＋SCN-V3-01 一筆；放 ignored 並寫「WIP 半成品、沒有交付」，任務都在總表）。
- **總表補的任務**：ART-GG-SIGNS-2、VAC-A1、ART-SOP、ART-YUTING-FACETEST（原本【表外】）；ART-BG-AA185 加別名 ART-SHOP1；LIC-GAPS-1017（LICENSES 缺漏）。DLV-1016-368 改已整合待測試（b8073a08）。

基準：`origin/claude/funny-albattani-iawshm`（LAWWW2-B，HEAD 0a49b298，成果最後 b75e50a5）對 `origin/claude/modest-rubin-2lyp7g`（開發分支，HEAD 7e33aa02）。兩條的共同祖先是 b2d498e4（10-16 00:01）：開發分支用「挑檔案」整合，所以比的是檔案內容（blob），不是 commit 祖先。
`assets`＋`tools/blender` 共 399 個路徑不同：315 個只在 funny、46 個只在開發分支、36 個兩邊版本不同、2 個改了路徑。

### 4-1. 未整合美術與 WIP

| 任務 ID | 檔案路徑（funny） | 分支 | 最後 commit | 完成程度 | 剩餘工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| **ART-GG-SIGNS-2【表外】** | `assets/models/env/second_ai/gongguan_shops.glb`＋`.json`（funny 7f781af3、3.13 MB；開發分支＝40b73c64 第一批 a1c32ed8）、`docs/art-rebuild/second_ai/patches/gg_signs2_test.patch`、`tools/blender/env_second/sign_atlas.py`、`textures/gen/gg_signs_atlas*.jpg/json`、`textures/signs_src/gg_*_fit.webp`（34 張） | funny | b75e50a5（WIP，交班保存） | 約 85%：GLB＋測試 patch 好了，LAWWW2-B 的測試工作樹 ALL PASS 34 項 | 前後截圖重拍（scratchpad 那 20 張已遺失）、README 第二批、夜間用眼睛看、交 LAWWW、通知 BB-B、**總表補任務** | 技術上可以（patch 只改 `tests/gongguan_glb_integration.py`，fbda2ce9 之後開發分支沒改過）；但還沒交付。和 scooters_v2.patch 改同一個測試檔，要排順序 |
| ART-SCOOTER2（負責 LAWWW） | `scooter.glb`／`.json`（funny 6bea6c3d；開發分支 b21ecc8f＝1e445818 舊版）、`tools/blender/env_second/scooters_v2.py`、`patches/scooters_v2.patch`、`test_shots/scooters_v2/` | funny | f5b7bdb3（已交付，DL-LW2-SCOOTER2 未整合） | 已交付 READY_FOR_ART_REVIEW | LAWWW 套 patch（基準 62cb7307；之後開發分支 zones3d／assets3d／world3d 有 9 個 commit。patch 加的 74 行在開發分支只找得到 20 行，大多是測試檔裡共同的部分）→ 溫州街／公館整合測試 | 可以，等 LAWWW |
| ART-BIKES2-INT（LAWWW）／ART-BIKES2-F（LAWWW2） | `street_props.glb`／`.json`（funny 48de915e；開發分支 e404040f＝06e94eb0 舊版）、`street_props.py`、`patches/bikes_v2.patch` | funny | 945fd4d2（DL-LW2-BIKES2 未整合） | 已交付；F 是後續 | 疊在 scooters_v2.patch 後面套；F：老鐵馬、登山車比導航阻擋長 8 cm，還有鏽、車籃、分款 | 可以，等 LAWWW |
| 祐廷 3D 臉試做【表外】 | `assets/models/char/vroid_yuting_facetest.vrm`（3.46 MB）、`patches/assets3d_facetest.patch`、`tools/char_polish.py`（funny 81beab9d；開發分支 a062494e 沒有 --facetest）、`tools/shots/facetest_shots.py`、`test_shots/facetest_yuting/` | funny | 8496bf9d（交件）；模型 23f25a0f | READY_FOR_ART_REVIEW，BB-B 驗收通過（4d3e2757） | 等使用者決定用不用；交付與任務都還沒登記 | 可以當 `?facetest` 選用整合（不換預設）。patch 的前後文在開發分支 assets3d.js 第 124～125 行還在 |
| ART-04 | `prop_pothos.glb`／`.json`（funny：S1～S4 四種大小；開發分支是 2baa5ac1 舊版）、`prop_pothos.py`、`shots/pothos_dorm_shots.py` | funny | 8a1af723（WIP） | 約 60%：模型好了 | 遊戲內截圖；宿舍已換成四人房，place（x 1.11、z −2.36）是舊房間的座標，可能要重新定位（推測，未驗證）；交付 | 還不行 |
| SCN-V3-01 | `dorm_y2_items.glb`／`.json`、`dorm_y2_items.py`、`textures/gen/dorm_y2_print.png` | funny | 8a1af723（WIP） | 物件模型好了 | 遊戲內截圖、112 窗景；照四人房對位（json 寫的是「112 號房：同一個房間模型」＝舊模型）；2D 部分 | 還不行 |
| ART-BG-AA185（別名 ART-SHOP1 的素材） | `bb_support/scooter_shop_props.glb`／`.json`、`bb_support/scooter_shop_props.py`、`render_dusk.py`、四種 Poly Haven 貼圖、LICENSES 兩筆 | funny | 5d5bb8aa | 道具驗收通過；4 張 2D 背景還沒開工 | 做公館機車行等 4 張背景 | 道具本身不進遊戲；背景做好再交 |
| SCN-US-01＋ART-US1～US4 | `us_apartment.glb`／`.json`（2.7 MB）、`us_apartment.py`、`src/data/us_apartment_layout.js`、`aa_support/us_{living,kitchen,bath}_props.*`、`bb_support/us_bedroom_props.*` | funny | 5e688f34（MODEL_READY；DLV-1016-32／44／51／238／248／249 未整合） | 室內 MODEL_READY；社區外觀還沒 | LAWWW2 接續（使用者 00:0x 派：SCN-US-01 → VAC-A2 → US-03 → US-02） | 照 D81 排到 V4 美國線時接 |
| ART-14（約會去背） | `assets/date/**`（53 個檔：7 人×7 張＋player 3＋anchors.json） | funny | f3531c61（DLV-1016-88／128 未整合） | BB-B ART_APPROVED | 等 DATE-S6 半互動約會系統 | 可以，等系統 |
| ART-09（剩下 3 位） | `assets/portraits/{jiahao,tangrui,weilun}/campus/neutral.webp` | funny | 8fbe1e1a（DLV-1016-09 未整合） | 立繪第一版 | 等 v0 人物 id（AA-REQ-06）和表情 | 可以，等 id（pinyu、xun 已經以 econ_pinyu、econ_zhengxun 接進去） |
| ART-13 | `tools/blender/char_second/mingxuan*.py`（4 支）、`yu*.py`（4 支）（帳號 A 的 WIP 腳本） | funny（也在 second-ai-env-art） | ae6e4dfa／19a96bbc（10-14） | 腳本 WIP | 跑 Blender、BB-B D59 驗收 | 還不行 |
| 規則文件（ART-SOP【表外】、VAC-A1【表外】） | `docs/art-rebuild/second_ai/ART_SOP.md`、`sop_demo/README.md`、`SCENE_RULES.md`、`VAC_A1_既有資產盤點.md` | 只在 funny | 69e4b181、644a322f、5c6a0391、4e4f4f36 | 完成 | 交付登記；建議複製一份進開發分支（D88：不要只存在一條分支） | 參考用 |
| 已整合成品的原始檔 | `dorm_room4.py`（ART-DORM-LOFT）、`bg_court.py`、`bg_car.py`、`bg_trip_mountain.py`、`vrm_crowd.py`＋`bg_gym_ceremony.py` v3、`cvs_goods.py`、`skybridge.py`、`park_tex.py`、`shopkit_tex.py`、`shops_tex.py`、aa／bb_support 的腳本與 views、約 60 張生成貼圖＋13 組 Poly Haven 貼圖；開發分支另有十多支是舊版（wz_props、wz_road_tex、cafe_exterior、cafe_layout、gym_interior、street_props…） | funny | 各自的交付 commit | GLB／webp 都已經整合 | — | 可以複製保存，不影響遊戲 |

**開發分支比較新、不要用 funny 蓋掉的**：
- `assets/models/env/dorm_hall.glb`、`tools/blender/dorm_hall.py`：開發分支 e4b6b55e（LAWWW-B 自己修宿舍大廳的疊面，10-16 23:25）。funny 還是 75082571（10-11）。
- `assets/portraits/econ_pinyu`、`econ_zhengxun`：開發分支改成正式 id。funny 還是 pinyu、xun。
- 只在開發分支的 32 張 `assets/bg`、10 張 `assets/cg`：來自 BB-B 或使用者，不是 LAWWW2 的缺漏。
- 開發分支 `textures/gen/wz_road_{main,ns,side}.*` 是舊的原始貼圖：funny 在 26134a0f 改成貼圖集以後刪了。

**疊面 BUG-COPLANAR-DEV**：交付的 7 個 GLB 和開發分支的版本**完全相同**：萬才館外觀、霖澤館外觀、霖澤館室內、201、萬才館室內、總圖大廳、法圖。
- 剩下的：萬才館室內 4 對（在西牆裡面，看不到）、總圖 27、法圖 93。大多是貼牆、貼地的接觸面，要在遊戲裡確認看不看得到。
- 宿舍大廳 LAWWW-B 已經自己修了（e4b6b55e）。HANDOFF 還寫「約 10 m² 等四人房」，要再核一次。
- 瀏覽器流程測試還沒跑完，排在 QA-HANDOFF-B1。
- BUG-WZFLICKER-2 的尾巴還沒動：溫州街三處、公館和 118 巷的鐵捲門、美國公寓、小公園。

**四人房 `dorm_room4.glb`**：`.glb` 173df01a、`.json` 1c355bf7、`.layout.json` 059fe61f。
- 開發分支、funny、a09ebf4d 三邊 **blob 完全一致**。
- 開發分支由 69e74460 整合。
- a09ebf4d 之後 LAWWW2 **沒有再改**。
- 只有 `tools/blender/env_second/dorm_room4.py` 不在開發分支。

**順便看到的**（交給值班的 LAWWW 判斷）：
- 交付紀錄沒更新：DLV-1016-368（a4c05720 小公園 v8）寫「未整合」，但開發分支的 `wz_park.glb`＝a4c05720 版（b8073a08 已收）。
- LICENSES 缺幾筆：
  - `ntu_gym_ceremony.webp`、`dorm_room4.glb` 兩條分支都沒有；
  - `gym_arena.glb` 只有 funny 有；
  - ART-SHOP1 的兩筆只有 funny 有。
- LAWWW2-B 交班沒留快照：
  - `docs/handoff/snapshots/` 兩條分支都沒有 LAWWW2 的快照；
  - funny 的 `duty_LAWWW2.json` 還是 `state:on`，看起來沒跑 `snapshot --role LAWWW2`、`duty handoff`。
- `wip_backup/second_ai_wip_branches_2026-10-16.bundle`（25 MB）只在 funny，開發分支沒有。

### 4-2. WIP 分支

`git rev-list --count funny..<分支>`：

| 分支 | HEAD | 比 funny 多幾個 commit | 內容 | 狀態 |
|---|---|---|---|---|
| `claude/second-ai-env-art` | 8e1061a9（10-14 17:38） | 0（整條在 funny 裡；比開發分支多 54） | 帳號 A LAWWW2 的交接分支 | 休班帳號的分支，保留 |
| `…-wip-bike` | fb23c7db（10-13 15:14） | 145 | ⑫騎車用的腳踏車、⑭118 巷、法圖 | 已整合、可刪、權限受阻（D88，LAWWW-B 複核 05:0x） |
| `…-wip-lane118` | 0b1788b9（10-13 15:13） | 136 | 118 巷街景、法圖 | 同上 |
| `…-wip-lawlib` | 3ba83057（10-13 15:11） | 126 | 法律學院圖書館 | 同上 |
| `…-wip-pavsoc` | 8c6f1fe0（10-11 08:30） | 11 | 洞洞館、社科院驗收 | 同上 |
| `…-wip-props` | fa626b9d（10-11 09:51） | 41 | 販賣機、118 巷配置草案 v1 | 同上 |
| `…-wip-props6` | 49d32ed8（10-13 13:04） | 72 | 道具第 6 批 | 同上 |
| `…-wip-soclib` | af7de02e（10-13 13:30） | 86 | 社科院圖書館 | 同上 |
| `…-wip-trees` | 22ff594d（10-14 02:14） | 203 | 行道樹 | 同上 |

- 「多出來的」commit 是 SHA 不同：內容早就挑進 funny、開發分支或 second-ai-env-art 了，LAWWW2-B 逐檔比對過（`BRANCH_CLEANUP_D88.md`）。
- 8 條的 HEAD 和 funny 上 bundle 的 `refs/heads/d88/*` **一一相同**：`git bundle list-heads` 已核對。所以要刪 funny 之前，得先把 bundle 搬走。
- LAWWW2-B 沒有新的 WIP 分支：它的 WIP 都直接 commit 在 funny 上。


## 5. 方法與剩餘異常

- 範圍：`check_handoff.py check` 第 6 項列出的 commit（交付分支 `scannedThrough` 以後、符合交付關鍵字、還沒登記），02:49 重新列出：AA 分支 126、BB 分支 113、LAWWW2 分支 16（比交班時的 249 多，是各職位交班 commit）。
- LAWWW-B 02:4x 曾把 BB 分支 125 筆照 BB-B 的交班說法整批放進 ignored；使用者 02:5x 要求不得整批標非交付，**已撤回**，改逐筆核對。
- 分類：DELIVERY（正式交付，登記 deliveries.json 並寫整合狀態）／WORK（一般工作紀錄，放 ignored 並寫具體原因）／WIP（半成品，登記在本檔並寫完成程度與能不能整合）。
- **最後結果（2026-10-17 03:1x）**：`roles` OK、`check` OK（十一項）、`duty verify` OK；deliveries.json 的 scannedThrough 移到 AA `ec63dd53`、BB `55717c12`、LAWWW2 `2d88db5f`。LAWWW 檢查點快照 `snapshots/2026-10-17T0314Z_B_LAWWW.json`（正式交班基準仍是 0240Z）。
- **沒做完、交給下一班（帳號 A 或 C）**：①拿不準的約 26 筆（AA 9＋6、BB 約 11，各節列了 SHA 與子代理的理由）複核；②關鍵字沒抓到的清單外 commit（BB 905d7a27、3ea1eac7、019bd293、8f781b12；AA 218a0dba 已補登）核對；③ LAWWW2 只在 funny 分支的原始檔（ART_SOP、SCENE_RULES、VAC-A1 盤點、dorm_room4.py 等腳本、wip_backup bundle）照 D88 複製一份進開發分支保存——這是檔案搬移，不是登記，這次沒做。

