# v9.7 候選 16（52f288e）— LAWWW2 並行跑的發布測試（LAWWW 11:13Z P1）

- **基準**：候選 16 `52f288e`，等於候選 15 `d8aca4d` 加上我的測試 patch。遊戲程式和候選 8／14 相同。
- **取得方式**：開發分支 `wip_backup/` 的 `v97-rc15.bundle` → `v97-rc16.bundle`，取出 `rel/v97-rc16`。
- **worktree**：`/home/user/v97rc16_wt`（detached，乾淨 checkout）。
- **伺服器**：http server 8816，用 `/proc/<pid>/cwd` 確認過目錄。
- **環境**：Playwright＋SwiftShader，模擬 iPhone 390×844 並用 CDP 觸控。**不是 iPhone 實機。** 同一時間只開一個瀏覽器。
- **順序**：我從 see_through 開始往下跑；LAWWW 從清單的另一頭往中間跑，誰先過哪一項就算數。

| 項目 | rc | 秒數 | 結果 |
|---|---|---|---|
| see_through | 0 | 58 | **ALL PASS**（12 項，0 FAIL）。樹幹在鏡頭前 1.0／1.5／2.6 m：關掉透視時玩家看得到 2.6%／9.8%／5.1%，打開後 100%／86.2%／85.5%；演出鏡頭和室內不開透視 |
| flow_library_scene | | | （跑完補） |
| flow_library_floors | | | （跑完補） |

- see_through 用 `?turbo`，這是測試本身的設定。
- 截圖：`see_through_ST_*_on.webp`。測試會把截圖寫進 worktree 的 `screenshots/`，我把它複製過來；worktree 不 commit。
