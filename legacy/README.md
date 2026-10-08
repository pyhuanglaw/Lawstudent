# legacy — 已被取代的早期版本

保留作對照與回溯，**目前的遊戲不載入這裡的任何檔案**。歷程說明見 `docs/history/DEVELOPMENT_HISTORY.md`。

| 資料夾 | 時期 | 內容 |
|---|---|---|
| `v1_2d_life_sim/` | 2026-09-27 06:00–06:54 | 2D 回合制法律人生養成（大學、交換、國考、律師／法官／檢察官／法務、合夥與開業）。`index.html` 就是當時發佈的 claude.ai artifact「法條之外」（2D 版），逐字相同。 |
| `v1_5_2d_art_tests/` | 07:10–07:21 | 轉向「直接操控的校園」時做的 2D canvas 美術測試（角色四方向、走路、坐下讀書、頭像表情、貓），以及第一次 WebGL 測試。之後改走 3D。 |

另外兩個已淘汰的東西還留在原位，因為 review 文件引用它們：
- `src/chars3d.js`、`test_char.html`：Q 版 3D 人物（07:30，被 spec 10 淘汰）。
- `src/people3d.js`：程序化成人比例人物，目前仍是多數 NPC 的 PLACEHOLDER_CHARACTER。
