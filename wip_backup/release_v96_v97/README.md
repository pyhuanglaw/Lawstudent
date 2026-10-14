# v9.6／v9.7 發布用的工具與紀錄（LAWWW 2026-10-14 備份；D45、使用者 07:00 UTC「手邊有的就先放 GitHub」）

遊戲不讀這個資料夾。工作階段中斷時，接手的人從這裡接著發布：
- `rel_v96_entry.md`、`rel_v97_entry.md`：寫進 `docs/RELEASES.md` 的發布紀錄草稿（`{MAIN_SHA}` 等由 `finish_release.py` 填）。
- `v96_user_summary.md`：給使用者的回報草稿。
- `collect_results.py`：從佇列紀錄（`Q_log.txt`＝執行時的 `q/Q.txt`）和 `lawww2_results.txt`（LAWWW2 機器上跑的結果）整理成發布紀錄的「發布前測試」。
- `finish_release.py`：發布後把版本寫進 `docs/RELEASES.md`、`CLAUDE.md`（用法見檔頭）。
- `run_q.sh`、`run_rc_node_q.sh`：瀏覽器測試佇列（一次一個，SwiftShader）、候選版的 Node 測試。
- `queue_now.txt`：備份當下還沒跑的佇列。

狀態（07:00 UTC）：v9.6 候選 14 `4ba8c8b`（本機分支，bundle 在 `wip_backup/v96-rc14.bundle`）剩 flow_linze_floors、flow_classes（本機）、flow_soclib（LAWWW2）；
v9.7 候選 2 `06f2b64`（bundle `wip_backup/v97-rc2.bundle`）兩台機器平行測，使用者同意測完就發、不受三小時限制（D71）。
