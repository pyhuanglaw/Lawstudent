# 測試結果與待修清單（LAWWW-C 交班，2026-10-18 14:5x UTC）

使用者交班時說：「測試的結果都要留下來讓接班的人可以直接開始修」。這份是 LAWWW-C 這一班跑過的測試、原文輸出、重現方法、還沒驗證的地方。原始紀錄檔在 `tests/repro_1018/logs/`（scratchpad 交班後就沒了，所以抄進 repo）。

- 開發分支 `claude/adoring-meitner-mqzst8`；線上版 **v9.10.1**＝main `4c0cbefc`（遊戲檔＝開發分支 `f4b47480`）。
- v9.10.1 以後的 13 個遊戲程式 commit（v9.10.2 候選，**都還沒發布**）見第 5 節。
- 測試伺服器小技巧：雲端沙盒的 `python3 -m http.server` 放背景常常自己死掉（ERR_CONNECTION_REFUSED）。**伺服器和測試寫在同一個背景指令裡**：
  `python3 -m http.server 8766 >/dev/null 2>&1 & SV=$!; sleep 1; python3 tests/<測試>.py http://127.0.0.1:8766/index.html; kill $SV`
- 測乾淨的發布版：`git worktree add --detach <資料夾> 4c0cbefc`，在那個資料夾開伺服器。

---

## 1. ★ 第一件事：v9.10.1 發布後檢查，搖桿和觸控在測試裡完全不動（P0，REL-9101-POSTCHECK-1018）

v9.10.1 是使用者說「先發布再檢查了」，發布前清單改成發布後跑。對發布版 `4c0cbefc`（乾淨 checkout）跑 docs/TESTING.md 第五節：

| 測試 | 結果 |
|---|---|
| deploy_check | ALL PASS |
| reachability_all | ALL PASS |
| minimap_direction | **3 FAIL**：拖曳轉鏡頭、搖桿往前、往前走地圖變化；鏡頭四個方向、玩家箭頭、沒有 JS 例外都 PASS |
| touch_flow_wenzhou | **11 FAIL**：從「走到 Café 門口出現進入兩點半 Café」開始全部失敗；只有「起身後可以操作」「沒有 JS 例外」PASS |
| p0_movement | **26 FAIL**：每一個出生點的「搖桿上／右／左」「推到底跑」「點地面走過去」都沒有移動（busy=False、pose=idle、cam=follow） |
| save_compat_v7 | 沒跑完（背景時間到被停）；使用者 10-18 03:4x 說過不用舊存檔測試 |

原文（`tests/repro_1018/logs/v9.10.1_postrel.log`、`v9.10.1_minimap.log`）：
```
FAIL 手指拖曳會轉動鏡頭  -1.57 → -1.57
FAIL 搖桿往前：玩家往鏡頭前方（北）走  移動 (0.00,0.00)
FAIL 往前走：地圖上前方的出入口在上方、離中心變近  距離 74.1 → 74.1 px，y=27.9
FAIL 溫州街：搖桿上 → 位置改變  {'x': 40, 'z': -1, 'yaw': -1.57, 'pose': 'idle', 'busy': False, 'cam': 'follow'} → {...同一個位置...}
FAIL 重新整理後讀回欄位 1（溫州街、位置相同）  (-40, -5, None)
RESULT: 26 FAIL → 霖澤館前（教室出口）：搖桿右 …; 校園預設出生點：搖桿上 …; 溫州街：搖桿左 …
```

**【22:1x LAWWW-C 回來接班後查清楚：遊戲沒有擋輸入，是測試沒處理「要回覆的訊息自動打開手機」】**
- 讀檔的狀態有一則沒回的邀約（預設交往中的可昕，第 3 天 19:30「週末來政大？我當導遊。」；測試讀的是第 8 天＝9/24，補進來就是要回的訊息）。v9.10.1 起要回的訊息會自動打開手機（D103），手機打開＝遊戲暫停（`E.paused`），之後搖桿、拖曳、小地圖全部不動。v9.10 沒有自動打開，所以過。
- 證據：失敗當下的截圖是手機畫面（那一則訊息＋兩個選項）；`tests/repro_1018/phone_pending_probe.py` 讀同一個狀態，v9.10.1 和開發分支都在讀檔後約 5 秒自動打開、`paused:true`，兩版一模一樣（不是版本差異）。
- minimap_direction 原本就有「讀檔後收起手機」，但只在第 2.5、3 秒收：手機剛好晚一點才跳就收不到（時過時不過）。
- 改測試（`2ad61c5f` 以後）：`playlib.load_state(quiet_events=True)` 一起關掉 `STORY.phoneAuto`；p0_movement、zone_transitions 讀檔前關掉（都標 [前置]）；touch_flow_wenzhou（從標題開始的真實流程）手機跳出來就像玩家一樣點「收起來」。
- 結果（22:0x～22:2x，單獨跑、沒有同時跑別的瀏覽器）：改好的測試對 v9.10.1 `4c0cbefc`：minimap_direction、p0_movement、touch_flow_wenzhou、zone_transitions、flow_class_real **ALL PASS**；對開發分支：同樣五支 ALL PASS。改之前的 p0_movement 在 v9.10.1 是 25 FAIL（同一個原因）。**REL-9101-POSTCHECK-1018 結案：v9.10.1 沒有問題**。

**比較**：v9.10 發布前（乾淨 checkout `feb2bc37`，10-18 04:1x）minimap_direction、p0_movement、touch_flow_wenzhou **ALL PASS**。所以壞掉的範圍在 `feb2bc37`～`f4b47480` 之間。

**推測（還沒驗證）**：玩家沒有被標 busy，搖桿輸入卻完全沒有效果，而且每一區都一樣。比較像是測試狀態下有東西蓋住或吃掉輸入，不一定是玩家實際玩的時候也壞掉（使用者 10-18 實玩 v9.10.1 可以走路、轉鏡頭）。候選原因：
1. 要回覆的訊息自動打開手機（UX-PHONE-AUTOOPEN-1018，D103）。測試讀檔以後手機蓋住 `#joy`。上一份交班快照就提醒過：auto-open 手機會讓舊的瀏覽器測試多一個手機畫面。
2. 新的按鈕或覆蓋層（手機「跳過」按鈕 AA_300 §6、日期卡、在家的 2D 背景 `home3d.js` backdrop）把 canvas 或 `#joy` 擋住。
3. 新遊戲預設進經濟系（ECONFF 事件接事件），測試讀檔的狀態被 ECONFF 接手。

**建議第一步（不用猜）**：
1. 對 `8c63ea53`（v9.10）和 `f4b47480`（v9.10.1）各跑一次 `python3 tests/minimap_direction.py`（最快，約 1～2 分鐘）。v9.10 過、v9.10.1 不過，就在中間二分（`git bisect`，判斷用同一支測試）。
2. 在失敗的那一刻截圖，用 `document.elementFromPoint(<#joy 中心>)` 查最上面的元素是誰；看 `#phone` 有沒有 `hide`、`E.paused`、`GAME.D.busyDepth`。
3. 如果是測試狀態造成的（例如手機自動打開），修 `tests/playlib.py` 讀檔後收手機；**如果真的是遊戲擋住輸入，就是 P0**，修好出 v9.10.2。
4. 修好以後對開發分支 HEAD 重跑：minimap_direction、p0_movement、touch_flow_wenzhou、zone_transitions、flow_class_real（第五節清單）。

---

## 2. 使用者回報、還沒修好的卡住（P0）

### 2a. BUG-MOVEOUT-STUCK-1018（P0，待開工）
- 使用者 10-18 14:3x：「他問完我剛剛那個問題之後我回到宿舍又卡住了，因為你現在會自動播放，可是我就站在那邊可以轉我的鏡頭，但沒有任何播放也沒有按鍵可以按」；「我重新開遊戲讀進去自動存檔，就直接跳劇情要陪可昕上課」。
- 情境：搬回家（8/30 開車那一段，「樓下有停車場…」）演完，畫面回到**宿舍的 3D**，沒有劇情、沒有按鈕。搬出去以後本來就不該回宿舍。
- 要查：`HOME.goOut`／`OUT.go` 演完可昕階梯（kxTail「（晚上，回到家。）」）以後 `HOME.at(G)` 有沒有回來、誰還拿著 `sceneBegin`（a0926112 以後除錯面板 `?debug` 會寫 `SCENE depth=… by=…`）。
- 已有的保底：a0926112 鎖住 10 秒、畫面上什麼都沒在演，就跳提示、選單的讀取和回標題不再被擋（v9.10.2 一定要帶）。
- 沒有使用者這一局的存檔；要的話用選擇題問使用者（D105）。

### 2b. BUG-BOWL-STUCK-1018（P0，進行中：保底已做、根本原因沒找到）
- 使用者 10-18 12:3x：保齡球演完卡住，要讀檔又說「現在有劇情沒辦法讀檔案」。使用者存檔：`tests/repro_1018/user_save_bowl_day-368.json`（經濟系、9/20 21:50 宿舍、b1 已演）。
- 重現四次**都沒卡住**（對 v9.10.1 的乾淨 checkout，port 8792）：
  1. turbo，存檔改回 9/13 18:30、出遊 planned；
  2. 不用 turbo，同上：OUT.go 19.01→22.59，sceneBegin／sceneEnd 成對（`logs/bowl_normal2.log` 每個 B 都有 E），之後 9/18、9/20、10/12、10/16 都正常；
  3. 存檔原樣讀進去（21:50）：接到 9/20、10/12 都正常（`logs/bowl_asis.log`，結尾 `no stuck within time`）；
  4. turbo 原樣。
- 重現指令：
  ```
  python3 tests/repro_1018/repro.py http://127.0.0.1:8792/index.html tests/repro_1018/user_save_bowl_day-368.json normal 420
  python3 tests/repro_1018/repro_asis.py http://127.0.0.1:8792/index.html tests/repro_1018/user_save_bowl_day-368.json normal 240 asis
  ```
  repro.py 每秒印一行狀態（busy／D.active／EVENTS.running／ADV.active／ECONFF.busy／手機），並記下每一次 sceneBegin（B）／sceneEnd（E）是誰呼叫的；「busy 但什麼都沒在演」就印 stuck。
- 已修的懷疑方向：5a351d1b 經濟系跳日期期間（黑幕、日期卡那幾秒）原本玩家沒標 busy，點互動或別的自動劇情會和跳日期同時開演；現在包在 sceneBegin／sceneEnd 裡，跳完一定放開（`tests/econ_ff_unit.js` ⑧：新版 PASS、舊版 FAIL）。
- 下一步：使用者再遇到時，請使用者打開 `?debug`（或設定 → 顯示移動除錯資訊）截圖 `SCENE depth=… by=…` 那一行，就知道是哪一段沒放開。

### 2c. BUG-KH-HOMEFLASH-1018（P1，待開工）
- 使用者 10-18 15:4x：「我在高雄走了一整天，然後可昕問我客運幾點來找我 轉場中間又跑出台北的家」。
- 推測：人在高雄的 2D 演出期間 `HOME.at(G)` 還是「在家」，兩段之間 ADV 沒有背景，就露出 `home3d.js` backdrop 的家裡底圖。
- 修法：外地演出期間 backdrop 不用家裡的圖（改黑或用那一段的背景）。2af6c40d 修過「出家門露出醉月湖」，相同的地方。

---

## 3. 這一班新做的檢查，結果

| 檢查 | 版本 | 結果 | 檔案 |
|---|---|---|---|
| tests/stale_lock_escape.py（鎖住 10 秒放開讀檔） | 開發分支 | **PASS**（12.5 秒標成卡住、除錯面板寫出是誰開的、讀檔以後 busy=False） | `logs/stale_lock_dev.log` |
| 同上 | v9.10.1 | **FAIL**（沒有標卡住、讀檔以後還鎖著）＝測試會抓到舊 bug | `logs/stale_lock_v9.10.1.log` |
| tests/econ_ff_unit.js ⑧（跳日期期間鎖住、跳完放開） | 新／舊 | 新 PASS、舊 FAIL | — |
| 拉花店員探測 `tests/repro_1018/latte_probe.py` | 開發分支 | 一般店員 npc_nf6（-0.6,-5.25）visible true → false（藏起來了） | — |
| 直向 ADV 只顯示說話的人 `tests/repro_1018/advsolo_probe.py`（E08） | 開發分支 | 只顯示正在說話的人；旁白時加了 `narr` class，但截圖看起來沒有變暗（可能是截圖時間點），**要 BB 用眼睛再看一次** | — |
| node 單元測試 | 開發分支 f09cf0e7 以前 | 全過：econ_ff、econ_ff2、v0_home_ff（含新 3b）、lifeline_g1／g3／g6、v0_e05、v0_e12、v0_e30、v0_e36、v0_e37、v0_a3_move、v0_l5a、ladder、camp_y1、camp_econ、aa110_systems、aa120_s7、allowance、anon_dedup、bb120_fixed、bike、handoff_incremental | — |

**沒有在瀏覽器驗證過的（程式改了、只有 node 測試，派 BB 看畫面）**：
- 從家裡出發的出遊、高雄回來、出家門不再露出醉月湖（fa03d80d、2af6c40d）；
- E30 休學電話講完黑幕直接接下一段、不回咖啡店（2e28928c）；
- 快轉收到訊息就停、打開那一段按跳過繼續（b0b5d954）；
- 自動跳出來的手機對話捲到最新一則（fa03d80d）；
- 在家講電話用家裡的背景（df06fdc8）；
- 拉花店員用芷若立繪、名字「店員」（09ff80aa）；
- 可昕的表情照台詞的標記顯示（b0b5d954）；
- 宿營 Kevin 的立繪位置（f09cf0e7，圖還沒有＝照舊沒有立繪）；
- 經濟系跳日期鎖住（5a351d1b）。

---

## 4. 其他未完成（細節在 `docs/handoff/tasks.json` 各任務的 `next`）

- **LAWWW**：PHONE-LINE-UI-1018（LINE 式對話列表，捲到最新已做、列表沒做）；BG-ECON-B1-1018（四張背景等使用者生圖，程式已接）；CG-ECON-BBQ-1018（使用者說先記錄、之後帳號補）；AA290-INTAKE（白名單、交付登記）。
- **AA**：E30-MOM、CRAM-DEC-SCENE（12 月補習班沒演，可昕卻在高雄說「你十二月去補習班那天就想考了吧」）、KH-TRIP-MORE（高雄三天兩夜景點太少，要跟使用者要圖）、ECON-TERM-END-CUE（跨年前學期結束要交代）、KH-RETAKE-PACING（高雄討論休學太突然）、CRAM-LEAVE-LAUGH（衝刺班請假要好幾次才笑）、KH-SCORE-TIMING（成績簡訊當下落點還沒出、客運上不會說「我看得到表」）、KX-EXPR（可昕表情標記）、HOME-ONEFLOOR（一層樓的字已暫改，AA 確認）、AA-LAW-RECONFIRM。
- **BB**：BLACK-BG-AUDIT-1018（黑畫面清單 `docs/handoff/BLACK_BG_AUDIT_1018.md`，31 段）、CAMP-PORTRAITS-1018（Kevin 立繪提示詞，外型「潮流大哥型」）、CG-NOPERSON、第 3 節「沒有在瀏覽器驗證過的」。
- 交接核對：`incr` 異常（LAWWW2、BB 自己分支 outbox 的欄位格式），要 LAWWW2、BB 照 `docs/handoff/OUTBOX_TEMPLATE.md` 修自己的 outbox，LAWWW 才能 `incr --advance`。

## 5. v9.10.2 候選（開發分支，都還沒發布）

v9.10.1 遊戲檔 `f4b47480` 以後的遊戲程式 commit，**一定要帶 a0926112**（劇情鎖住的保底）：
a60f111e（AA_307 句子）、5ac83dbc（階梯最終版＋retake_home）、d3fdab82（美國校園、法學院圖書館、四季）、a0926112、5a351d1b、2e28928c、09ff80aa、4a03aadf、fa03d80d、2af6c40d、df06fdc8、b0b5d954、f09cf0e7。

發布前：先解決第 1 節（搖桿在測試裡不動）、跑 docs/TESTING.md 第五節、check_orphans／check_lines／題目漏收檢查（HV-15 第 5 點），告訴使用者這一版沒有的是哪些。
