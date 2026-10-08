# dev_scratch — 開發時的除錯與驗證腳本

開發過程中臨時寫的 Playwright 腳本與測試輸出，保留下來供追查。正式的回歸測試在 `tests/`。

- 都假設開發伺服器在 repo 根目錄：`python3 -m http.server 8765`，並開 `http://127.0.0.1:8765/...`。
- 多數腳本共用 `flowtest.py` 裡的 `DRIVER`（在頁面裡驅動劇情的 JS）。

| 檔案 | 用途 |
|---|---|
| `flowtest.py`（＋`flowtest.log`） | 第一、二天劇情從頭跑到尾 |
| `evtest.py`（＋`evtest2.log`） | 52 個事件逐一觸發、鎖定／解鎖檢查（104 項） |
| `schedtest.py`（＋`schedtest.log`） | NPC 日程生成 |
| `navcheck.py`、`navprobe.py`、`navprobe2.py` | 掃描所有出生點／互動點是否落在導航格阻擋格（v7 P0 的診斷） |
| `stucktest.py`、`tapdbg.py`、`tapdbg2.py` | 「原地走」與點地移動的重現 |
| `moveregr.log`、`moveregr2.log` | `tests/movement_regression.py` 的輸出 |
| `advshots.py` | ADV 截圖（直向／橫向） |
| `vrmtest.py`、`vrmpose.py`、`cafe_vrm.py`、`heroshot.py`、`retarget_test.py` | VRM／GLB 人物、姿勢、重定向檢查 |
| `gradtest.py`、`gradtest2.py`、`gradshot.py` | 研究所志向流程 |
| `pairtest.py`、`pairshot.py`、`intshot.py`、`meetan_dbg.py` | NPC 配對、室內光線、小安追上來 |
| `fps_dbg.py`、`perf_dbg.py`、`prof_dbg.py` | 效能 |
| `shots_final.py` | 交付截圖批次（呼叫根目錄 `play.py`） |
| `ghsmoke.py` | GitHub Pages 子路徑載入檢查 |
