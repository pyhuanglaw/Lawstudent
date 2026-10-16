# 約會反應台詞（`DATE_LINES`／`DATE_LIKES`；BB_128 2-7、2-9 的格式）

- 每個地點一個 `<LOC>.py`（原稿）→ `python3 build_lines.py <LOC>` 產生 `<LOC>.json`（LAWWW-B 讀這個）並檢查：七位都有、每個互動點 first／normal≥3／remember／dating、每行 ≤40 字、選項 ≤20 字且最多兩個、不用的句型。
- `lines[角色][arrive|closing|hotspots]`：一套＝`{tier:'any'|'low'|'mid'|'high', lines:[{who,text}], choice?:[{t, reply:[…]}]}`；`who:'narr'` 是旁白。選台詞的順序照 BB_128 2-9（心願事件 → 第一次 → 記得上次 → 交往中 → 普通〔照階段、排除最近 3 套〕）。
- `likes[角色][互動點]`：`like`／`normal`／`dislike`（AA_128 5-3 的結算）；`dislikeLine`＝不太喜歡時她的一句。
- 互動點的時間、花費、圖上位置在 `BB_128` 第 5-2 節（D01、D09、D18）與 `AA_128`；底圖由 LAWWW-B／LAWWW2-B 安排。
- 以安（heroine_01）、語彤（heroine_03）的一般反應由 BB-B 寫、AA-B 審語氣（AA 2026-10-14 15:09 的分工）。
- 進度：**D13 淡水**（`D13.json`，由 `md_to_json_D13.py` 從 `BB_128` 2-8、5-1 轉出，台詞一字不改；淡水的第一次可以有三個選項，`afterBreakup`＝可昕分開以後，`extra:合照`＝第 6 階以上才有，`who:"note"`＝開發註記不顯示）；**D01 華山**（json）；接著 D09 貓空 → D18 九份 → D25 外澳 → D05 光典臺北 → D03 參創生活園區 → D06 北美館 → D07 景美 → D15 陽明山，之後第二批到 D32。（2026-10-16 BB-B，`AA_185` AB-57：地點名照 D77 改成光典臺北、參創生活園區；底圖座標 D01～D32 都在 `../art/D**_coords.json`）
