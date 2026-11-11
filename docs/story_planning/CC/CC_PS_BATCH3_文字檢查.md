# 沛珊 ③a 重掃（BB 02:50；開發分支 124fe40e5d8e4cedb25c2181b2df9f608ee35cd0＝沛珊第三批＋學姊約會；2825f2e4d776e44abd528a27a9ef4fd01b01dc19 結果相同）

做法：
1. `docs/story_planning/test_tools/cc/cc_ps_text_scan.py <ref>`：程式掃，規則和第一輪（CC_PS_BATCH2）一樣。這次補了正規表示式的處理：date3d.js 的 `/^（/` 會讓引號配錯，掃出 1 筆誤判。用上次的 f5e1ef4e8 校準，一樣是 42 筆。
2. 再對 src 全部原始 grep「早餐店／蛋餅／圍裙／榜單」，一筆一筆看是誰說的。

## 結果：2 筆（程式掃 0 筆，人工複查找到 2 筆）

| 檔案 | 行 | 誰說 | 字串 | 程式為什麼漏掉 |
|---|---|---|---|---|
| src/data/bbpack_events.js | 365 | 沛珊（`say(PS,…)`，PS＝classmate_peishan，ev_b13_peishan 的 D4C 問答） | 可是我家的蛋餅比較好。（選「便利商店的飯糰。」之後她的回答；同一題還有「蛋餅。」那個選項） | 用縮寫 PS，不是 who:'classmate_peishan' |
| src/data/gift_lines.js | 1327 | 沛珊（"classmate_peishan" 區塊的 fav 米漿） | ……我家早餐店也有賣。我從小喝到大的。 | 離 classmate_peishan 那個 key 超過 400 字 |

- **第一輪 42 筆也漏了這 2 筆**：f5e1ef4e8 就有這兩句，所以第一輪實際應該是 44 筆。
- 第一輪的 42 筆在 124fe40e5 都不見了，包括 date_lines／date_wish 的 39 筆、feed_y4s1「回早餐店」、ladder「送蛋餅」、pg_dates「早餐店今天賣完了」、date3d 243、576。
- 剩下的「早餐店／蛋餅／圍裙／榜單」都不是沛珊說的，例如：
  - 秀琴姨／語彤（date3d 644）、可昕（events.js 2931、retake_home RH-C5）
  - 心慈（examlib_lines）、昱（rel_lines）、學姊（sis_b16）
  - 芷若的 Café 圍裙、媽媽（home3d、vacfill）
  - 課本例子（study_units、syllabus）、電影劇情（movie_plots）
  - 註解（invites.js 198、social3d、r2y4b、fest_events 是「原本是…」的說明，不上畫面）
- ③c（沛珊一句超過 60 字）：程式掃 0 筆。這個掃法同樣看不到 `say(PS,…)` 和深層區塊，沒有人工複查。
- 圍裙、榜單：沒有沛珊的。
