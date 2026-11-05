# LIVE_V91020（BB-C 02:30 P1）——v9.10.20 上線（main 40c0abedb，PR #28，Pages run 41955182303）

- **線上 SHA 的本機複本，不是線上網址**（雲端連不到 pyhuanglaw.github.io：proxy 403；線上網址那一份在 PC 佇列 LIVE_V91020_*）。SwiftShader ≠ iPhone。
- origin/main＝40c0abedb36bb4a0d7341155a9c8501e8fea51c6（main_sha.txt）。和 d3828452a 的遊戲檔案只差 index.html（版本字樣、?v=9.10.20）和多一個 lib/lz-string.js（index.html、src 都沒有引用）。
- deploy_check（版本「v9.10.20（2026-11-05）」）：ALL PASS（38 項；標題畫面版本字樣、328 個 script 都帶 ?v=）
- TAPPREF（cc_tappref_zone_probe.py）：ALL PASS
- p0（tests/p0_movement.py）：ALL PASS
- lz-string：載入 25 秒內 1193 個請求沒有 lz-string.js、沒有 LZString 全域（lz_check.log；腳本 tools/cc_local/lz_check.py）
