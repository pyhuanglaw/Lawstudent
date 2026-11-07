# PERF-COLD-1107 (B)：走到出口附近，先下載那一區的模型（LAWWW2-B 2026-11-07）

**派工**：LAWWW-B 08:41 選 (A)，(B) 排在後面；09:04 的順序：d）draw call → (B) → 頭髮 (b)。

**狀態**：patch `zone_prefetch_1107.patch`。對開發 `e70d19503`，`git apply --check` OK。瀏覽器沒跑（D131，交 CC）。

## 為什麼

- (A) 已經整合（`474312d38`）：第一次進一個區域，黑畫面會等模型載好才淡入，不再先露出方塊。
- 但黑畫面本身還是長。PC 冷快取下，溫州街黑 18 s，總圖大廳 12 s（CC-B PERF_COLD）。
- 這段時間有一部分是**下載**：溫州街主模型 13.6 MB，校園 23 個模型 22 MB。手機在 GitHub Pages 上只會更久。
- (B) 讓下載在玩家走過去的路上就做完。

## 做法

**只下載、不解析**：
- 用 `fetch` 把檔案讀進瀏覽器快取，邊讀邊丟，不留在記憶體；
- 不解析 GLB、不上傳 GPU，所以走路時不會卡；
- 解析一個 VRM 要 1.8 s 的主執行緒，iPhone 的記憶體也有上限（BUG-IOS-RELOAD）。
- 真的進去時，`loadOne` 的 `fetch` 直接讀快取。

**只下載「30 m 內最近的出口」那一區，不是全部出口**：
- 一個區域所有出口加起來太多：新生南路 45 MB、公館 45 MB、校園 39 MB（83 個區域、122 個正式模型、總共 178 MB）。
- 走到出口附近，多半就是要進去。
- 例如：
  - 校園走到公館那個門：13 MB；
  - 溫州街走到公館的巷口：12 MB；
  - 公館走到校門：22 MB（校園 23 個模型）。

**不下載的時候**：
- 省流量模式；2G、3G（`navigator.connection`）；
- 這次開遊戲已經下載 150 MB；
- 還有正式模型在載（這一區的人物、模型還沒載完），不搶頻寬；
- 正在下載另一個；
- 標題畫面、換區域中。
- 換區域時，排隊的清掉；正在下載的那一個照常下載完（可能就是要進去的那一區的）。
- 失敗（離線、單檔版沒有這個檔）不重試，進去時照原本的流程載。

## 改了什麼

| 檔案 | 改什麼 |
|---|---|
| `src/assets3d.js` | `A.prefetch(keys)`：一次一個、照順序、邊讀邊丟、記下大小，不重複下載。另外 `A.prefetchStop()`、`A.prefetchNear(E, zoneId)`、`A.loadingNow()`、`A.prefetchOK()`。參數：`PREFETCH_NEAR_M=30`、`PREFETCH_MAX_BYTES=150e6` |
| `src/game3d.js` | `frame()`：每 1 秒（真實時間）呼叫 `ASSETS.prefetchNear(E, G.zone)`，不在標題畫面、不在換區域時才叫。`enter()`：`reqStart` 後面呼叫 `prefetchStop()` |
| `index.html` | `game3d.js` 前面載入 `src/data/zone_assets.js` |
| `src/data/zone_assets.js`（新） | 每個區域建立時要的正式模型，照檔案大小由大到小。**自動產生** |
| `tools/gen_zone_assets.js`（新） | 在 Node 照 `index.html` 的順序載入全部 script，建每一個區域，用 `ASSETS.reqStart`／`reqTake` 記下要的 key；這和 `enter()` 等模型用的是同一份清單。`--check` 只比對 |
| `tests/zone_prefetch_unit.js`（新） | 見下面 |

**要注意（LAWWW 決定）**：
- 區域改用新的 GLB、新增區域以後，要重跑 `node tools/gen_zone_assets.js`。
- 沒重跑的話，`zone_prefetch_unit` ① 會 FAIL，提醒資料過期。
- 過期的後果不嚴重：預先下載的檔案不對或少了，進去時照原本的流程載。
- 如果不想每次都要重跑，可以拿掉 ①，改成只在發布前檢查。

## 測試（Node）

| | 開發原樣 `e70d19503` | 加 patch |
|---|---|---|
| 新 `zone_prefetch_unit` | **FAILED 5**（①、②～⑧、⑨a、⑨b、⑩） | **ALL PASS** |
| 會讀 `assets3d.js`／`game3d.js`／`index.html` 的 `*_unit.js` | — | 見下面「其他測試」 |

`zone_prefetch_unit`：
1. `zone_assets.js` 是最新的（83 個區域）；
2. 一次只下載一個、照順序；邊讀邊丟（有 `getReader` 就不呼叫 `arrayBuffer`）；記下大小；
3. 已經載好、正在載、下載過的不重複下載；
4. 失敗記 −1、不重試；
5. 省流量模式、2G／3G 不下載；
6. `prefetchStop` 清掉排隊的，正在下載的下載完；
7. 超過上限就停；
8. `prefetchNear` 要做對這幾件事：
   - 挑 30 m 內最近、模型還沒下載的出口；
   - 不排已經全部載好的、現在這一區的、太遠的；
   - 正在下載、還有模型在載時不排；載完（成功或失敗）才排。
9. `game3d.js` 的兩處呼叫；
10. `index.html` 的載入順序。

## 瀏覽器要 CC 量的

探針 `../perf_wz_day_1103/perf_cold_probe.py` 加了兩樣：
- 新的做法 **`near`**：進區域以前，先用遊戲的 `ASSETS.prefetch(ZONE_ASSETS[區域])` 下載完，再進同一區。和 `base` 比黑畫面，差的就是下載那一段。
- **`NET=4g`**：遊戲載好以後，用 CDP 限速到 20 Mbit/s、40 ms。本機伺服器下載很快，不限速看不出差別。

建議：`ZONES=wenzhou,library_hall VARIANTS=base,near NET=4g`，要遊戲已經整合這一包。

另外要 CC 在遊戲裡看：
- 走到校園往公館的校門附近，`ASSETS.prefetched` 有沒有公館的 4 個模型；
- 走路時有沒有卡：下載只在背景讀，不應該卡。

## 還沒驗、不確定的

- **兩個請求撞在一起**：玩家在下載到一半時就走進去，Chrome 會讓第二個請求等第一個下載完、再讀快取，不會下載兩次。Safari 我不確定，最壞是那一個檔下載兩次。
- **快取多久**：GitHub Pages 的快取是 10 分鐘（`max-age=600`）；過了以後瀏覽器問一次（304），不會重新下載整個檔。沒在瀏覽器裡實測。
- **人物的 VRM 不在名單裡**：那一區的人物是 `STORY.populate` 照時間放的，`gen_zone_assets.js` 只記區域本身。很多人物的 VRM 在前一區就載過了。
- **搭電梯到別的區域**（總圖）不是 `exit.to`，不會預先下載。總圖大廳往 3F 的樓梯出口照樣有。
- 手機實機沒測。
