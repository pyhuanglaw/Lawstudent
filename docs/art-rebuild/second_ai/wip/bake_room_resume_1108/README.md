# bake_room.py：續烘（BAKE_CACHE／BAKE_STOP_AFTER）（LAWWW2-B 2026-11-08）

**狀態：交件**。只是烘焙工具，不影響遊戲、不用換任何資產。LAWWW-B 13:10 要的：只改這一段，附回歸證明預設行為不變。

## 為什麼
- 總圖 B1（512 取樣、1024 貼圖、350 盞面光源）白天、晚上各要 35～65 分鐘（看 CPU 有沒有被別的工作搶）。
- 單次跑完會超過雲端背景工作兩小時的上限：晚上那張烘到一半被停掉兩次，白天那張也跟著白烘。

## 做法：`bake_room_resume_1108.patch`
- 基準：開發 `4429bc93d` 那一版 bake_room.py（開發最新 `9f4973bfe` 也是這一份）。`git apply --check` 過，套上以後和我分支 `f67eb9963` 的 bake_room.py 一樣。
- 只改「烘白天、烘晚上」那兩行：`bake(...)` 換成 `cbake(...)`。
  - 沒設環境變數時，`cbake` 就是直接呼叫 `bake`。
- **`BAKE_CACHE=<資料夾>`**：
  - 每烘完一張，原始值存成 `<資料夾>/day.npy`、`night.npy`。
  - 旁邊的 `.sha` 是這一次的雜湊：輸入檔內容＋參數（`--in`、`--out`、`--lm` 的路徑除外）＋光照 UV。
  - 下一次跑同一個指令、雜湊一樣，就直接讀、不重烘。
  - 參數改了、UV 排得不一樣，雜湊就不一樣：印「cache 不能用」，照樣重烘。
- **`BAKE_STOP_AFTER=day`**：白天那張存好就結束（結束碼 3），下一次再跑晚上。
- 第三張「熄燈」（`--dark`）沒有走 cache，照舊每次烘。

## 用法（總圖 B1 就是這樣烘的）
```
BAKE_CACHE=<資料夾> BAKE_STOP_AFTER=day bash tools/blender/env_second/lightbake/bake_library_b1.sh 512 <輸出>   # 第一段：白天，結束碼 3
BAKE_CACHE=<資料夾> bash tools/blender/env_second/lightbake/bake_library_b1.sh 512 <輸出>                        # 第二段：白天從 cache 讀、只烘晚上
```
- 外層的 .sh 不用改：bake_room.py 本來就讀環境變數（`BAKE_THREADS` 也是這樣）。

## 回歸：`bake_room_resume_check.sh <原本的 bake_room.py> <套了 patch 的>`
- 輸入：總圖 B1 原檔（blob `87f1da5e`）。小烘焙：128 貼圖、2 取樣、單執行緒，結果固定。
- 檢查四件事：
  1. 沒設環境變數：GLB、白天、晚上的 PNG 逐位元組一樣；烘焙紀錄只差 `bake_seconds`；沒有 cache 訊息。
  2. `BAKE_STOP_AFTER=day`：結束碼 3，cache 裡只有白天。
  3. 同一個指令再跑：白天從 cache 讀、只烘晚上；輸出和一次跑完逐位元組一樣。
  4. 取樣改成 3、用同一個 cache：雜湊不一樣，照樣重烘。
- 結果（開發 `9f4973bfe` 工作樹）：
  - 套 patch：**ALL PASS**（4 分鐘）。
  - 對照組（兩邊都用原本的）：第 1 項過，2～4 **FAILED 4**。

## 補：結束碼 139（11-08 13:2x，LAWWW-B 回報）
- LAWWW-B 那台雲端，Blender（bpy 模組）烘完結束時會 segfault（139），開發原本的 bake_room.py 也一樣，輸出都寫完了。
- 原本的回歸有三項看結束碼 0／3，在那台會 FAIL。
- 改成：
  - 正常跑：0 或 139，而且三個輸出＋烘焙紀錄都要在；
  - BAKE_STOP_AFTER：3 或 139，而且沒有匯出、cache 裡只有白天。
- 其他項照舊，看逐位元組一樣、cache 訊息。
- 交件：`bake_room_resume_check_rc139.patch`（對開發 `tools/blender/env_second/lightbake/bake_room_resume_check.sh`，`8554b8ea9` apply --check 過）。我這台跑還是 ALL PASS（結束碼 0／3）。
- 實際烘焙時如果遇到 139：看 cache 資料夾裡有沒有 day.npy（第一段）、輸出資料夾裡有沒有 GLB 和兩張圖（第二段），不要只看結束碼。
  - `bake_library_b1.sh` 有 `set -e`：139 會讓外層腳本停在 bake_room 那一行，to_webp 不會跑。
  - 那台要先手動補 to_webp 那幾步，或在 .sh 裡把 bake_room 那行的 139 當成功。這部分沒改，交給你決定。
