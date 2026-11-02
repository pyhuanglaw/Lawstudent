# PERF-CAMPUS-GLB-1102 ①：campus_glb_integration 的量測雜訊（WIP，還沒交件；LAWWW2〔帳號 A〕11-02 20:2x）

- **雜訊**：同一個鏡頭有時多出約 26 次 draw call、7.26 萬三角形，剛好是一個完整人物加他的影子（`test_logs/campus_glb_integration_1102/README.md`）。
- **原因**（讀程式找到的，瀏覽器還沒驗證）：
  - 測試量 draw call 時把路人移出場景（`DRAW`：`hid.forEach(a=>a[1].remove(a[0]))`）。
  - 遊戲每 1.5 秒叫一次 `GM.upgradeModels()`、`GM.dedupAnon(false)`（`src/game3d.js` 主迴圈），把晚到的正式人物模型換上去。
  - `CHAR.upgrade`（`src/character3d.js`）：`const p=h.parent; if(p){ p.add(nh); p.remove(h); } C.release(h);`——舊模型不在場景裡時，新模型不會放進任何地方。
  - 量完測試把**舊的**放回場景；這個舊模型已經放掉（release）、也不在 `E.npcs` 裡，之後每個鏡頭量的時候都不會被移走——多一個完整人物加影子。
  - 換模型的時機看下載快慢，所以兩輪、兩次都可能出現或不出現。
- **修法（只改 tests）**：`campus_glb_integration_noise_1102.patch`
  - 量的那幾格暫停 `GAME.upgradeModels`、`GAME.dedupAnon`，量完（`finally`）放回路人、恢復。
  - 每個鏡頭多記 `chars`：量的那一刻場景裡除了玩家還有幾個人物；多一項檢查「兩輪、每個鏡頭都是 0」。效能門檻不改。
  - 在 `0e11c43a3` 上 `git apply --check` 乾淨。
- **還沒做**：瀏覽器實跑（排在 `scratchpad/lib1102/run_q4b.sh` 最後）；② 校門、男一舍、普通、博雅減 draw call。
- 遊戲本身：玩家正常玩不會把路人移出場景，這個情況只發生在測試裡；`CHAR.upgrade` 沒改。
