# X14 第二輪：換區域（咖啡廳 → 溫州街）淡入後還是會停一下——編譯結果在黑畫面時先讀（LAWWW2-C 2026-10-27）

- **使用者 X14**（10-18）：「電腦換畫面卡一兩秒（溫州街、咖啡廳）」。第一輪（PERF-ZONE-ENTER-1018，`zone_enter_1021/`）做了 `Z3.prewarm`（黑畫面時先接上正式模型、`compileAsync`、傳貼圖）＋`Z3.prefetchNext`；X79（`perf_campus_day_1027/`，已整合 `8dfa52530`）做了淡入以後的 `Z3.warmup`。
- **這一輪對**：最新開發 `0969b1028`（`claude/adoring-meitner-mqzst8`，已含 X79）。量測當時對 `bbd6a9c7d`＋X79 patch（`zones3d.js`、`game3d.js` 在兩者之間沒變）。
- **環境**：Playwright＋SwiftShader（GPU 也是 CPU 模擬），電腦模式（1280×720、沒有觸控、一般 UA：不縮貼圖、會預先載下一個區域——使用者回報的是電腦）。絕對時間比真的電腦慢很多，只拿來比前後。**沒有在真的電腦、iPhone 量過。**

## 找到的原因

- `tools/shots/x14_prof.py`（CPU profiler 開著換區域，`data/prof_desktop.log`）：公館 → 溫州街第一次，淡入那一格 **10.3 秒**，其中 **3.9 秒**在 three.js 第一次畫到時讀編譯結果（`onFirstUse` → `getProgramInfoLog` 2.4 秒＋uniform 位置）。
- 原因：**沒有平行編譯（`KHR_parallel_shader_compile`）時，three.js 的 `isReady()` 一律回 true**，`compileAsync` 馬上就「好了」——prewarm 以為 shader 都編好，其實 GPU 還沒編完；真正的等待留到淡入第一格（畫面已經亮了、停住）。X79 在走路途中遇到的是同一件事（`warmup` 第三版的「主動讀一次」就是這個）。
- 有平行編譯的瀏覽器（多數電腦版 Chrome）`isReady()` 是真的，`compileAsync` 會等到編好，這個問題比較小。**使用者的電腦有沒有平行編譯，不知道。**

## 修法（`src/zones3d.js` 的 `prewarmRun`，5 行）

1. `compileAsync` 之後，對 `renderer.info.programs` 裡**已經好的**（`isReady()`）每一個呼叫一次 `program.getUniforms()`——就是 three.js 第一次畫到時做的那一步（讀編譯結果、uniform 位置），等 GPU 的時間發生在黑畫面。
2. 照舊在 `cap`（2 秒）之內：時間到了就停，剩下的照舊淡入第一格讀（不會比原本差），標 `timedOut`。還沒好的（有平行編譯時）不讀、不等。
3. `E.lastPrewarm.settled`、`settleMs` 記結果。網址 `?prewarmcap=毫秒` 改黑畫面最多等多久（量測用，預設不變）。
4. 手機照舊不做 prewarm（`ASSETS.texCap`，第一輪的決定沒動）。

## 改前改後（`tools/shots/zone_enter_probe.py --desktop`；原始數字 `data/zp_*.json`）

每一格「黑畫面／淡入以後最長的一格」，單位秒。A、B 各跑兩次（SwiftShader 每次差很多）。

| | 公館→溫州街（第一次） | 溫州街→咖啡廳（第一次） | **咖啡廳→溫州街（第二次）** | 溫州街→咖啡廳（第二次） |
|---|---|---|---|---|
| A 改前（`zp_A_base`） | 3.7／10.1 | 3.9／2.6 | 4.4／**5.3** | 3.9／2.2 |
| A 改前第二次（`zp_A2`） | 3.7／10.1 | 3.7／2.6 | 4.2／**5.1** | 3.3／2.2 |
| **B 改後（`zp_B_settle`）** | 3.3／9.6 | 3.2／2.3 | 5.9／**3.2** | 3.4／2.4 |
| **B 改後第二次（`zp_B2`）** | 4.3／5.4 | 3.9／2.8 | 6.1／**3.4** | 3.6／2.4 |
| 參考：B＋X79 warmup（`zp_D_warm`） | 4.2／8.1 | 4.1／2.8 | 5.2／3.2 | 3.4／2.4 |
| 參考：B、cap 4 秒（`zp_C_cap4`） | 4.2／5.3 | 5.1／2.1 | 3.1／6.3 | 3.6／1.6 |

- **使用者說的「咖啡廳 → 溫州街」（第二次，模型都在快取裡）**：淡入以後最長的一格 **5.1～5.3 → 3.2～3.4 秒**（兩次都一樣），黑畫面 4.2～4.4 → 5.9～6.1 秒——**等待從「亮著的畫面停住」挪到黑畫面**，加起來差不多（不是變快，是不在看得到的時候卡）。
- 第一次進溫州街：一次 10.1 → 9.6、一次 → 5.4，不穩定（那時候正式模型、路人 VRM 還在一個一個到，主要是模型到的時候接上、編新的，這一輪沒處理）。
- 咖啡廳：沒有明顯差別（本來就 2 秒多）。
- cap 拉到 4 秒（C）不穩定（第二次溫州街反而 6.3），**不建議改預設 cap**。

## 測試

- `tests/zone_prewarm_unit.js` 加 ⑪（3 項，假的 renderer＋假的 program）：已經好的讀一次、還沒好的不讀；讀不完時 cap 到了就停、標 timedOut；`?prewarmcap` 有效。**沒改的 `zones3d.js`：⑪ 3 FAIL；改後 ALL PASS。**
- `tests/zone_warmup_unit.js`（X79）ALL PASS（`warmup` 沒動）。
- 沒跑：瀏覽器流程測試（BB）、整套回歸、真的電腦、手機實機。

## 檔案（我的分支 `claude/focused-cray-c9uwvw`）

- patch：`docs/art-rebuild/second_ai/patches/x14_prewarm_settle_1027.patch`（`src/zones3d.js` 5 行、`tests/zone_prewarm_unit.js` ⑪），對 `0969b1028` 做的。（舊的 `x14_prewarm_settle_WIP.patch` 含 X79，已移除）
- 量測工具：`tools/shots/zone_enter_probe.py`（第一輪就有）、`tools/shots/x14_prof.py`、`tools/shots/x14_tex.py`；原始數字 `data/`。

## 還沒做

- 第一次進溫州街：正式模型、路人 VRM 到的時候在亮著的畫面上接上、編新的 shader——要等 PERF-TEX-DEDUP（重複貼圖合併）或改成「模型到了先藏著、編好再顯示」，另外討論。
- 真的電腦有沒有平行編譯、真的時間：要使用者或 BB 在真的電腦上看（主控台看 `GAME.E.lastPrewarm` 的 `settled`、`settleMs`、`timedOut`）。
