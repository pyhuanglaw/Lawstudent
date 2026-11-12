# BB_401　CANON-NO-ECON-1112 驗收點 2 的基準：開發分支還有多少經濟系／重考／政大字

- BB-C 2026-11-12 12:3x UTC。掃 `origin/claude/adoring-meitner-mqzst8 @ 762104842a` 的 `src/`＋`index.html`（`git grep`，含註解；註解不是玩家看得到的，但用來追還沒刪的程式最快）。
- 用途：LAWWW 刪完以後同一個指令再掃一次，玩家看得到的字（事件台詞、訊息、地點名、選單、旁白）要是 0；剩下的只能是註解、舊存檔轉換清單、或國考相關。

| 字 | 行數 | 檔數 | 最多的檔 |
|---|---|---|---|
| 經濟系 | 542 | 83 | story3d.js 123、events.js 88、game3d.js 23、classes3d.js 23、whois3d.js 21、bbpack_events.js 17、home3d.js 16、characters.js 16、zones3d.js 12、y2r2_3d.js 12、econff3d.js 11、examlib3d.js 10 |
| 重考 | 249 | 56 | events.js 46、postgrad3d.js 27、story3d.js 26、camp_y1.js 14、home3d.js 10、postgrad_lines.js 8、heroine_arcs.js 8、msg2_pool.js 7… |
| 木柵 | 222 | 60 | events.js 37、story3d.js 16、y2r2_3d.js 15、invites.js 11、r2y4b3d.js 10、y34b3d.js 7、arc_invites.js 7… |
| 政大 | 132 | 39 | （多半是註解裡的舊名） |
| 休學 | 181 | 40 | |
| NCCU | 25 | 9 | 旗標 NCCU_VISITED、背景 nccu_food／nccu_gate |

**注意**：「重考」有 41 行和國考（司法官、律師、一試二試）在同一行——那是 D118 的國考落榜重考，**要留**（postgrad3d.js、postgrad_lines.js 大部分是這種）。刪的時候請分開，不要一個字一起換掉。

## 重掃指令
```
R=origin/<RULE_SOURCE>; for w in 經濟系 重考 木柵 政大 休學 NCCU; do git grep -n "$w" $R -- src index.html | grep -v -E '^\S+:\s*(//|/\*|\*)' ; done
```
（先排除整行註解；剩下的逐行看是不是玩家看得到。）

## 還要另外掃的（不是 src 的字）
- `assets/bg/`：nccu_food、nccu_gate、經濟系教室等背景圖還在不在被引用（black_bg_audit 類工具）。
- CG 總表（企劃線 AA_597）：經濟系宿營、可昕交往的 CG 列。
- 海報、黑板、法律頁上的字（圖裡的字 grep 不到，CC 開新遊戲玩第一學期時看）。
