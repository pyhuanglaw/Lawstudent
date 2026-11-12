# CANON-NO-ECON-1112 第五批：交班時的研究筆記（LAWWW-C 11-12 22:1x，子代理只研究、沒有改 repo）

開發分支 4f5ad69b97 起算。AA 文件以企劃線 **96c3a668eb** 為準（5359a86fb1 → 3a9ca72976 → 56a87623c4 → 6dbfe10d7e → 96c3a668eb 依序是後代；date／ladder／syllabus 源稿在 6dbfe10d7e 和 96c3a668eb 內容相同）。
動手前 canon_scan：src 85 檔／472 處（全 repo 363 檔／1659 處）。

## 已經在開發分支（不用再做）
- AA_906／910 「src 直接換」7 列（b236632dda）、AA_916 invites.js 5 列（1cca1d9605）、AA_711 flirt 重匯＋gone（c400353851）、AA_919 第 1 節偶遇（7b0ead2629）、AA_922 兩處（4f5ad69b97 前一個 commit）、WZ 冰菓室／鮮果。

## 第 1 步：重匯（照順序）
1. **約會 D01–D33：dce2f8c08b → 6dbfe10d7e**，118 格（kexin 55、heroine_04 16、heroine_05 15、heroine_02 13、heroine_01 11、heroine_03 8；AA_917／918／921 §1§4／AA_923 D09）。逐格表：`date_ddiff_dce2f8c08b_to_6dbfe10d7e.txt`。
   - `python3 tools/date/bump_lines_sha.py 6dbfe10d7e --by … --why …` → `tests/date_src_sha.js`：ALLOW_SHA、新表 KX921_1112（PREV＝dce2f8c08b）＋unKx921，接在 un812、src248 最前面（照 4cded456b4 的 PS914 做法）；4cded456b4 改過的 13 支約會測試的 ALLOW_SHA 鏈一起改。
   - 可昕幾格新字在「。／？」後面有「……」（D01 wall、D06 frame 回覆、D15 closing、D28 alley）：匯入工具的 AA_694 規則會拿掉，表裡要寫 `game` 欄（同 PS914）。
2. **wish**：wish_bb.json 換到 6dbfe10d7e 以後 `tools/date/import_wish.py` 停在 AA_757 那一層（它找沛珊 D06.lawn 舊字，源稿已改成「準備再考的那段時間…」）；AA_770 層（可昕 23 列）大概也會撞「手機關掉的一天」。要 AA 更新 AA_757／AA_770，或匯入工具對源稿已改的格子跳過。
3. **約會短句（AA_921 §3-1／§4）**：`common_bb.json` 已標過時、沒有匯入工具讀；遊戲的 `lines.kexin` 在 `src/data/date_lines.js`（BB_128 3-6＋AA_769 覆蓋）。建議在 `tools/date/import_date_lines.py` 加 R921 路徑列層（apply767，接在 AA_812 後面，同 AA_899）：accept[0..1]、acceptDating[0]、move3[0]、flaked[0][0..1]、leaveEarly[0]；move3、leaveEarly 用 AA_694 拿掉「……」以後的字。`date3d.js` 的 `S.MORNING.kexin` 手改。common_bb 的出門那句遊戲現在是「我出門了。你不准比我晚到。」——要不要換請 AA 確認。
4. **白名單只換這幾份**（很多 AA 源稿在新 SHA 只差「把舊名換成代號 外校／舊序章」，整批換會讓代號跑進玩家看得到的字）：AA_709（可昕 AA_916 列＋芷若刪節號列）、AA_708（芷若／語彤／可昕列）、AA_733（芯慈＋可昕室友那句）、AA_745 1／3／fallback 各一格、AA_748 一格、AA_749 三格、AA_784（可昕 firstAt[2]）、AA_711（kexin/4＝712 新句）、ladder_bb*.json（含 AA_861～868 期中招呼）、AA_827（羽球 R）、AA_730、syllabus Y1S2（`grep -rln "Y1S2.json\|y1s2.py" tools/`）。每份重產以後看 git diff 只有預期的格子。
   - AA_712 heroine_arcs、AA_719 decide_rules、AA_720、AA_715：新 SHA 只差代號，**不要換**；AA_921／920 對它們的改動是 src 手改。

## 第 2～5 步（都還沒開始）
- 手改：AA_919 §2／§4、AA_920 ①～⑩、AA_921 §3 表、AA_915 芯慈 closing.first、AA_923 §2／§3／§4（96c3a668eb；y3_kx_mid 選項用 BB 的「老師上禮拜講的那個。我以為我懂了。」；y2r2 487／488 期中→期末，日期＝大二上期末考週前一週同一個星期幾，用 STORY.termDay；social3d PS2_NOT_ERASED 照留）。
- AA_919 4-2：可昕 6/9 外校畢業那一組拿掉、併進 6/2 PARTNER.kexin；cg_two_graduations 沒人用就刪（BB_446：舊設定，不接 6/2）。
- AA_893 ④：可昕 FRIEND 以上偶遇打招呼（kx_b 第一句、不一起走）。
- 外澳「手機關掉的一天」：事件中手機通知延後（BB_448）。
- 全部 Node＋canon_scan 前後數字。

腳本：`ddiff.py`（約會源稿兩版逐格比）、`jdiff.py`、`diffwl.py`（白名單上每份源稿在新 SHA 差什麼）。
