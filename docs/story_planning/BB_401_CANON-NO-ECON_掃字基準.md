# BB_401　CANON-NO-ECON-1112 驗收點 2 的基準（D158 改寫）

- BB-C 2026-11-12（13:1x 依 D158 改寫；原本列出的字已拿掉）。
- **字表與掃法一律用 `python3 tools/handoff/canon_scan.py`**（字表用編碼存，工具本身不出現那些字；國考落榜再考已排除）。
- 基準（開發分支 762104842a，12:2x，src＋index.html，舊方法）：六個字合計約 1,350 行、分布在約 80 個檔，最多的是 events.js、story3d.js、camp_y1.js、game3d.js。
- 驗收：LAWWW 刪完後，`canon_scan.py --paths src index.html` 結束碼 0；企劃線、cc-testing 各自清自己的檔也要 0。
- 還要另外看的（不是程式字）：背景圖（外校兩張）是否還被引用、CG 總表裡舊序章的列、海報／黑板／法律頁圖裡的字（CC 開新遊戲肉眼看）。
