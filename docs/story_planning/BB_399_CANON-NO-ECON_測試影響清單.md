# BB_399　CANON-NO-ECON-1112：刪經濟系／重考／政大、可昕改法律系非女友——測試影響清單

- 來源：使用者 11-12 12:1x（LAWWW-C 轉，任務 CANON-NO-ECON-1112，P0、下一版必須）原話：「刪掉經濟系的所有人 刪掉重考這個劇情　刪掉政大的東西 杜可昕這個人物既然已經做好 就放在台大法律但他不是我女朋友」。
- 寫：BB-C，2026-11-12 12:1x UTC。開發分支 RULE_SOURCE claude/adoring-meitner-mqzst8。

## 一、立即停（不再排 CC、不判）
| 項目 | 處理 |
|---|---|
| D99 第一優先「經濟系完整流程」驗收（企劃線 AA_269 第 6 節：新遊戲→宿營→在學→10/17 休學與可昕交往→休學在家→重考→放榜→進法律系） | 取消（等 LAWWW 改 D99 規則） |
| CC 佇列 **W1R_E1E2_kxtour**（可昕 K1 導遊 ev_kexin_tour_nccu，木柵大學＋交往中） | 拿掉 |
| CC 佇列 **YUE_MEAL_72fc**（CASES=KX：可昕以女友身分在越好吃吃飯） | 拿掉；越好吃的學姊那支 YUE_SIS_* 照跑 |
| CC 佇列 **W1R_D7_friends**（朋友清單有可昕） | 暫停：等「可昕在法律系的身分」定了再改判準（她在清單上可以，但不能是女友、不能帶經濟系那年的訊息） |
| BB_222 裡經濟系那年的讀書／考試項目（v0）、「重考」劇情的考試 | 停 |
| 已判／已驗收的可昕交往線：我們的日子（kxod）、模擬法庭 moot3、高雄三天兩夜（kx_khh）、K 系列約會、MT3／MT4 的 KXCH／KXVB、X324 的 KX case、花藝課 WHO=kexin 送她 | 全部作廢重判（內容會被刪或改成同學） |

## 二、Node 單元測試（開發分支 tests/，50 支，LAWWW 刪內容時一起改／刪；不能因為紅了就關掉，D10-5「不准假修」）
經濟系：aa521_econ_friends、aa529_econ、aa644_econ_pe_ff、camp_econ、econ_daylabel、econ_ff、econ_ff2、econ_ff_e08、econ_ff_probe1/2.py、econ_jump_walk、econ_soclib_1030、econ_transcript_md.py、jacket_econ、teach_perf_econ、v0_econ_chars、v2_econ、adv_linger_y0、kai_sheet_y0、repro_1018/econ_probe_*（3）、schedule_leave（休學）。
重考：aa603_retake_word、retake、retake_bg、v0_retake、v0_retake_r、legal_page_retake。
可昕交往／政大：aa351_kx_drift、aa366_kx_postgrad、aa384_kx_friend、aa384e_kx_d6_summer、aa401_kx_khh、aa514_kx_moot3、v3_kx_moot、v3_moot、kxod、msg_kx_abroad、v0_kxphone、v2_c13_kxb4、corner_kexin_weekend、confess723_secondyes（要看）、kexin_model（3D 模型本身留）。
→ 每支：內容刪掉的測試一起刪；內容改的（可昕變同學）改成新判準。哪支怎麼處理 LAWWW 列表、BB 抽查。

## 三、要留下、不能誤刪的（「重考」只指經濟系→法律系的重考）
- **國考（司法官／律師）落榜可以重考**是 D118 的規則，和這次無關：ROUTE_E4／E6／E8（postgrad 落榜重考路線）、BB_222 三-⑥ 照舊。若 LAWWW 理解的「重考」包含國考，請先問使用者。
- 法律系大一開局（宿營 camp_y1、8/29 搬宿舍）、法律系的課、讀書、期中考照舊。

## 四、新的驗收點（BB 判；做好了排 CC）
1. 新遊戲直接從法律系大一開始（沒有經濟系那年、沒有「從經濟系開始」選項）；開局流程、宿營、搬宿舍不卡。
2. 遊戲裡找不到經濟系、重考、政大／木柵大學的內容：人物（經濟系同學）、事件、手機訊息、群組、動態牆、行事曆、地點（木柵大學、小吃街）、背景圖、CG、海報字、選單、法律頁。工具掃字（LAWWW 跑 grep＋black_bg_audit 類工具）＋CC 抽玩第一學期。
3. 可昕在法律系出現（同系同學；年級、外觀照 LAWWW 定稿），不是女朋友：沒有交往旗標、沒有「我們的日子」、沒有女友專屬台詞（例如上班時那則「我們選一天。叫它『我們的日子』。」橫幅）、別人不把她當你女友講。
4. 舊存檔讀得進來、不壞：經濟系那年的存檔、法律系已和可昕交往的存檔、使用者 day54 存檔（tests/fixtures/user_save_day54_1110.json）各讀一次——怎麼接等 LAWWW 問使用者的答案。
5. 其他女主角的線、118 巷、店面、打工、學姊、國考路線不受影響（回歸：relsuite＋SOCIAL-SMOKE＋SAVE-LZ）。

## 五、照舊跑（LAWWW：店面、打工、效能、HUD 照舊）
SSB 店面全批、SHIFT_SHOTS_18a3、SHIFT_BANNER_1f30（判「橫幅收起再補出」的機制；補出的若是可昕女友那則，內容另算第四節第 3 點）、TUTOR_BACK、YUE_SIS_*、HUD_LAND、DN_PROGRAMS、W1R 其他段（D4 的同行人用以安）、STUDY_*、ROUTE_E*、AA_SCENES_EV_ARC、SAVE_LZ（結果先只記、判準等第四節第 4 點）。

## 六、使用者選擇題答案（11-12 12:1x，LAWWW-C 轉）→ 驗收點改
- **可昕**：開局不是女朋友，**之後可以追**（法律系同學，和其他女主角一樣從認識開始）。→ 第四節第 3 點改成：開局沒有交往旗標、沒有女友台詞／訊息／「我們的日子」；她要有「認識→熟→可以交往」的正常路線（和其他女主角同一套階段），不能是一開局就很熟、也不能永遠追不到。原本暫停的 X324 KX、花藝課 WHO=kexin 等 AA 新設定後改成「同學／追求中」的判準再跑。
- **舊存檔**：使用者「我沒有要留的舊存檔」→ **不做遷移**。第四節第 4 點改成：①經濟系那年／重考中的舊存檔 → 讀到要有一句看得懂的提示請開新遊戲，**不能黑畫面、不能卡死、不能把標題畫面的其他存檔弄壞**；②已經在法律系的舊存檔（含 day54 fixture）盡量照讀：讀得進、能走能存；可昕交往紀錄怎麼落地照 AA 設定再判。SAVE_LZ 結果照這個判。
