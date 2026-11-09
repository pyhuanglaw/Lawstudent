# PERF-XS-NPC-1108：坐著、在畫面外的 NPC 降頻（LAWWW2-B 2026-11-09）

- **派工**：LAWWW-B 2026-11-09 16:17 UTC（①只動坐著、不在畫面裡的 NPC；②不改人數、位置、站位，進畫面不能跳；③patch＋Node 單元測試（舊程式要 FAIL）＋CC-B PC PERFAB 前後）。
- **起因**：PERFAB 第 2 版（`../perf_xs_1108/README.md`）：新生南路山嵐 1F／2F、大口 2F 店裡 9～11 個人，拿掉 NPC 以後 39.7→57.9、33.2→57.8、45.1→57.2 fps。
- **狀態**：`READY_FOR_REVIEW`（LAWWW-B 審、整合；`character3d` 那一段的回歸由 LAWWW-B 負責）。效能前後**還沒量**：雲端沒有瀏覽器（D131），等 CC-B 在 PC 量。

## 改了什麼（`src/engine3d.js`，+7／−1 行）
- 原本：畫面外 16 m 內的 NPC 每一幀都跑 `CHAR.animate`（坐姿小動作、VRM 彈簧骨、表情、腳步貼合、`vrm.scene.updateWorldMatrix`）。16 m 外照舊不跑、畫面裡 28 m 外照舊隔一幀，這兩條沒改。
- 新增 `seatOff(n,o,moving)`：
  - 坐著（`sit`、`read`）；
  - 這一幀沒在走、沒有路線；
  - 不是載在你後座（`passenger`）、不是跟著你走（`follow`）；
  - 沒在揮手；
  - 離玩家（水平）`E.SEAT_OFF_NEAR`（3 m）以上。
- 符合條件而且在畫面外的人：每 `E.SEAT_OFF_EVERY`（4）幀才跑一次 `CHAR.animate`。
  - 沒跑的那幾幀，時間累加在 `n._skipDt`，下一次一起補。這和 28 m 外的降頻是同一個欄位、同一個做法，時間不會丟。
  - 用 `E.frame+n.lodPhase` 分散到不同幀：8 個人每一幀 2 個，不會 8 個擠在同一幀。
- **進畫面**：同一次 `updateNPC` 先算 `vis`、設 `o.visible`；`vis` 為 true 就不降頻，累加的時間一起補，然後才畫。所以畫出來的那一幀一定是剛更新過的姿勢，不會看到舊姿勢。
- 降頻的人最多 3 幀沒更新，骨架停在上一個坐姿，不會露出 T 字。新加進來的人、換模型的人照舊由 `prePose` 先套一次坐姿。
- **開關**：`E.SEAT_OFF_EVERY=1` 等於沒有這個 patch，同一個版本可以切換、量前後；`E.SEAT_OFF_NEAR` 是不降頻的距離。
- 人數、位置、作息站位、劇情都不碰；`character3d.js` 沒改。

## 測試
- 新測試 `tests/seat_off_throttle_unit.js`：把 engine3d.js 裡真正的 `updateNPC`、`seatOff` 拿出來，用假的鏡頭、視錐、`CHAR.animate` 跑 60 幀。
  - 畫面外坐著、離玩家 8 m：60 幀更新 15 次，每次補 4 幀的時間，總時間＝1.000000 s。
  - 畫面外 30 幀以後進畫面：第 31 幀（進畫面那一幀）就更新，那一次 `o.visible` 已經是 true、補上累加的時間；之後每一幀都更新；總時間不丟。
  - 不受影響（每一幀都更新）：畫面外走路的、畫面外站著的、畫面外坐著但離玩家 2.5 m 的、畫面裡坐著的。
  - `seatOff` 排除：後座、跟著走、揮手、有路線、躺／站／健身；2.9 m 不降、3.0 m 降；`E.SEAT_OFF_EVERY=1` 關掉。
  - 8 個人分散：每一幀 2 次。
  - 原本的規則不變：畫面外 16 m 外 0 次、畫面裡 28 m 外 30／60。
- 結果：
  - **開發分支 `f8b0e30d1` 原樣：FAILED 5**（0 沒有 seatOff、1 更新 60 次、1 每次 1 幀、4 沒有 seatOff、5 每一幀 8 次）。2、3、6 是不能改壞的部分，舊的也過。
  - **加 patch：ALL PASS**。
  - 用法：`node tests/seat_off_throttle_unit.js [engine3d.js 路徑]`。
- 回歸（和引擎有關的 Node 測試，加 patch 跑）：見下面「回歸結果」。
- **沒測**：遊戲內畫面（雲端沒有瀏覽器）；PC 的 fps 前後（等 CC-B）；手機真機。

## 效能前後（請 CC-B 量）
- `seat_off_probe.js`：接上 patch 以後，在山嵐 1F、山嵐 2F、大口 2F、好拍（對照）各跑一次。
  - 站好、鏡頭照平常玩的角度，在 console 貼上整段，大約 70 秒。
  - 同一個版本裡交錯量 `every1`（等於沒 patch）→ `every4` → `every1` → `every4`，最後量 `noNPC` 當參考。
- 欄位：
  - `fps`、`worst`；
  - `renderMs`：畫面；
  - `animMs`：`CHAR.animate` 每幀總時間；
  - `animN`：每幀呼叫次數；
  - `seatOff`：每幀有幾個人符合降頻條件；
  - `vis`：畫面裡的 NPC 數。
- **怎麼看**：
  - `animMs`（every1 → every4）會掉：降頻有作用。
  - `animMs` 掉了、fps 沒什麼變：瓶頸在畫面裡那幾個人的繪製（`renderMs`）。下一步看 (2) 坐著的人用替身遠近（`seated_figures_lod`）。
  - `seatOff` 很小（例如 1～2）：這幾間店大部分的人都在畫面裡，這個 patch 能省的本來就少。

## 回歸結果
（跑完補上）

## sha256（開發分支 f8b0e30d1 → 加 patch）
| 檔案 | 開發 | 加 patch |
|---|---|---|
| src/engine3d.js | 1f4b3e03e26e6cf35962ce270d79d49fa41349e94761ce1f0b114e67be5a18bb | 21bffefb72c7c371bc393099036e29c252c0bf0807895521b8c591333e4f9cce |
| tests/seat_off_throttle_unit.js | （新檔） | 59a2d3f95848e691257b07d16d4e6492d94969021b855a45520a637db9f2acda |
| seat_off_throttle_1109.patch | | a918a567c4faf7e10b6ef15fcb239def0ac9e5899dfd28865ad24b5213f44ae6 |

`git apply --check` 對開發分支 `f8b0e30d1` 乾淨的 checkout：OK。
