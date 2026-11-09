# PERF-XS-NPC-1108：坐著、在畫面外的 NPC 降頻（LAWWW2-B 2026-11-09）

- **派工**：LAWWW-B 2026-11-09 16:17 UTC（①只動坐著、不在畫面裡的 NPC；②不改人數、位置、站位，進畫面不能跳；③patch＋Node 單元測試（舊程式要 FAIL）＋CC-B PC PERFAB 前後）。
- **起因**：PERFAB 第 2 版（`../perf_xs_1108/README.md`）：新生南路山嵐 1F／2F、大口 2F 店裡 9～11 個人，拿掉 NPC 以後 39.7→57.9、33.2→57.8、45.1→57.2 fps。
- **狀態**：`READY_FOR_REVIEW`（交件）（LAWWW-B 審、整合；`character3d` 那一段的回歸由 LAWWW-B 負責）。效能前後**還沒量**：雲端沒有瀏覽器（D131），等 CC-B 在 PC 量。

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
- 回歸（和引擎有關的 Node 測試，加 patch 跑）：310 支全部通過，見下面「回歸結果」。
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
- 開發 `f8b0e30d1`＋這個 patch，`tests/` 裡提到 engine3d、E3、updateNPC 的 `*_unit.js` 共 **310 支，全部通過**（每支逾時 120 秒，0 失敗）。新測試也在這 310 支裡面。
- 沒跑：Playwright 流程測試（雲端沒有瀏覽器，D131）。整合以後建議跑：
  - `tests/flow_seated_spawn.py`：座位上的人每一幀畫之前都是坐姿；
  - `tests/flow_b4_lecture.py`：散場起身走到圓桌；
  - 大口、山嵐的 `xsshop`／`xs_lm` 流程。

## sha256（開發分支 f8b0e30d1 → 加 patch）
| 檔案 | 開發 | 加 patch |
|---|---|---|
| src/engine3d.js | 1f4b3e03e26e6cf35962ce270d79d49fa41349e94761ce1f0b114e67be5a18bb | 21bffefb72c7c371bc393099036e29c252c0bf0807895521b8c591333e4f9cce |
| tests/seat_off_throttle_unit.js | （新檔） | 59a2d3f95848e691257b07d16d4e6492d94969021b855a45520a637db9f2acda |
| seat_off_throttle_1109.patch | | a918a567c4faf7e10b6ef15fcb239def0ac9e5899dfd28865ad24b5213f44ae6 |

`git apply --check` 對開發分支 `f8b0e30d1` 乾淨的 checkout：OK。

## 11-09 17:2x：CC-B 量到的結果（SEATOFF_88c8、CPUTRACE_8172_dakou）與分析
### seatOff 前後（PC GPU RX 6600M，88c83d1be，cc-local `local_out/SEATOFF_88c8`）
| 點 | every1／every4／every1／every4 fps | animMs（每幀 CHAR.animate 總時間） | seatOff（每幀符合降頻的人數） | vis |
|---|---|---|---|---|
| 山嵐 1F | 30.3／36.1／47.8／44.5 | 18.8／15.6／10.0／9.8 | 1 | 2～4 |
| 山嵐 2F | 28.2／30.9／37.4／44.5 | 18.2／15.0／13.1／10.2 | 1 | 2～5 |
| 大口 2F | 27.2／27.0／25.1／30.6 | 11.3／9.5／11.3／10.5 | 1 | 9～10 |
| 好拍 | 57.0／57.8／56.2／57.2 | 1.3～1.7 | 0 | — |

- **seatOff 每幀只有 1 個人符合**：大部分坐著的人在畫面裡，或離你不到 3 m。所以降頻省的很少，前後差異被暖機蓋過去了（同一條件第一次、第二次就差 30.3 → 47.8）。
- **真正的大頭是 `CHAR.animate` 本身**：每幀 10～19 ms、8～11 次，**每個人 1～2 ms**。noNPC 剩 1.4～2 ms（只有玩家）。

### 大口 1F CPU 效能紀錄（20.7 秒、11 個 NPC；`cpuprof_*.py` 分析，cc-local `local_out/CPUTRACE_8172_dakou/out/cpu.cpuprofile`）
| 項目 | 時間 | 佔全部 |
|---|---|---|
| `C.animate` → `animateVRM` | 5.6 s | 27.1% |
| └ `updateVRM` | 4.96 s | 23.9% |
| 　└ 腳步貼合那一段（:1329 的回呼） | 2.50 s | 12.1% |
| 　　└ **`sitFeet`**（坐著的腳踩地） | **1.89 s** | **9.1%** |
| 　　　└ 其中 `h.updateWorldMatrix(true,true)`（整個人物、含頭髮配件的矩陣） | 1.23 s | 5.9% |
| 　　└ `footIK` | 0.58 s | 2.8% |
| 　└ 彈簧骨（three-vrm update :2296） | 1.23 s | 5.9% |
| 　└ 表情（three-vrm update :6048） | 0.63 s | 3.0% |
| 　└ `vrm.scene.updateWorldMatrix` | 0.36 s | 1.8% |
| 畫面 `setProgram` | 3.98 s | 19.2% |
| └ `getProgram`＋`getParameters` | 1.26 s＋0.73 s | 6.1%＋3.5% |
| 　（對照：好拍 `getProgram` 只有 0.27 s：大口有人物的材質每一幀都在重新判斷 shader） | | |

- **卡頓（>100 ms）5 次**：
  - 10708 ms、10874 ms：`projectObject` → `SkinnedMesh.computeBoundingSphere` → `applyBoneTransform` 60～68 ms。這是某個 **frustumCulled 開著的蓋皮網格**第一次被畫時，three.js 用每根骨頭算每個頂點的包圍球。
    - character3d.js、props3d.js、遠距離版本都設了 `frustumCulled=false`，原始碼裡找不到是誰。請 CC 跑 `skinned_probe.js`（列出來＋記錄誰被算、花幾 ms）。
  - 2375、4358、13191 ms：那一幀 70～82 ms 是 idle，主執行緒在等 GPU，不是 JavaScript。

### 建議（給 LAWWW-B，人物系統）
1. **`sitFeet`（9.1%）**：坐著不動的人，腿的解每一幀都一樣。可以：
   - 解一次就記下大腿、小腿、腳的 raw 四元數，之後直接套（座位、模型、坐姿沒變就不重算）；
   - 或至少把 `h.updateWorldMatrix(true,true)` 換成只更新腿那一條鏈（髖 → 腳）。
2. 坐著、在畫面裡的人：彈簧骨（5.9%）半速。坐著的時候頭髮幾乎不動。
3. `getProgram`／`getParameters`（9.6%）：查哪個材質每幀換 program。可能是同一個材質給 morph、skinning 狀態不同的網格用（近的 VRM 和遠距離版本、有沒有表情 morph）。
4. 卡頓：等 `skinned_probe.js` 的結果。找到以後把那個網格設 `frustumCulled=false`，或先給它一個 boundingSphere。

## 11-09 17:3x：(A) sitFeet 只更新兩條腿的矩陣（交件，READY_FOR_REVIEW）
LAWWW-B 17:21 定的順序是 D → C → A。D、C 要等 CC 的探針結果（RPROBE_DC_fefd 已排 PC），所以 A 先做完先交。

- **做法**（`sit_feet_fast_1109.patch`，對開發 `88c83d1be`，`git apply --check` OK；`src/character3d.js` +18／−9）：
  - LAWWW-B 原本提的「腿的解記下來」行不通：坐姿小動作（sitAmbient）每一幀都會轉髖部（Hips 在片段裡），腿的解每一幀都不一樣。
  - 改成**算法照舊、少做沒用到的矩陣更新**：
    - 原本先 `h.updateWorldMatrix(true,true)` 更新整個人物（頭髮彈簧骨、手指、配件、網格都算），每根腿骨再 `getWorldPosition`（每次都往上走到根）；
    - 新的只更新「髖部往上那一條鏈＋兩條腿的子樹」，位置、旋轉直接從剛更新過的 `matrixWorld` 讀。
  - 站著量腳踝高度那一段也一樣處理。
  - 後面的 `readIK`、`headFit`、`lookAt` 都自己更新矩陣；`updateVRM` 在畫之前也會把整個人物再更新一次，不靠 sitFeet 那一次。
  - `CHAR.sitFeetFast=false`＝原本的做法，同一個版本可以量前後。
- **測試** `tests/sit_feet_fast_unit.js`（新）：
  - 同一個模型建兩個人物，放在同一個位置，一個舊做法、一個新做法，同步跑：站 → 坐（座位 1）→ 換座位（二樓、轉向、椅子矮 7 cm）→ 站起來 → 再坐下讀書。
  - 主角、四位女主角、兩個路人底模，坐姿小動作的亂數換成固定值。
  - 結果：
    - ① 每一幀兩條腿 9 根骨頭的位置差 0（< 1e-6 m）；
    - ② 換座位照新的座位重算：大腿上下差 8.3 → 1.3 cm 這類，和舊做法一樣；
    - ③ 同一個人物坐著，每幀 `updateWorldMatrix` 呼叫數 678 → 325（**少 52%**，這是整個 `CHAR.animate` 的總數）；
    - ④ 開關存在；
    - ⑤ 確認測試真的有用到 sitFeet：關掉 sitFeet，腳的位置差 12～17 cm。
  - 開發原樣 **FAILED 2**（④、③）→ 加 patch **ALL PASS**。
- **回歸**：提到 character3d／CHAR.animate／CHAR.build 的 102 支 `*_unit.js`（含 sit_feet、sit_floor、sit_height、seat_ambient、stairs_feet、skirt_sit_morph）**全部通過**。
- **效能前後**：還沒量，等整合後請 CC 跑 `sit_feet_probe.js`。點和上一步一樣：山嵐 1F／2F、大口 1F／2F、好拍；slow／fast 交錯各兩次＋noNPC。
  - 預期 animMs 下降：大口 1F 的 sitFeet 佔整幀 9.1%，其中整個人物的矩陣更新 5.9%、getWorldPosition 往上走 1.6%。
- sha256（開發 → 新）：
  - `src/character3d.js` `9baa633a…` → `6c8f2548bb20946a80fe93adf26446c7019ac9c2188af83835fed8220200c2ec`
  - `tests/sit_feet_fast_unit.js`（新）`142fe51b66c2fba684f55bd088611167978fa38b31c296e40a8985e335bf6aa1`
  - patch `35b9d2593d5a6a86944f5b7b76fa1d3e2b804276dc2e5c355968a0730ad795c3`
