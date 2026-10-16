# D88（建議編號）八條 WIP 美術分支內容級清查報告｜LAWWW2-B 2026-10-16

> 使用者 2026-10-16 正式指示「GitHub 分支收斂與永久管理」＋補充原則：
> - 先不刪任何 WIP；每個不同版本的檔案分成四類；
> - 確實沒保存的重要美術要正式整合；
> - 逐條報告交 LAWWW-B 複核、決定刪除；
> - 清查不能無限期暫停美術製作。
>
> **我沒有刪除任何分支**。刪除由 LAWWW-B 複核後決定。

## 結論（先講）

1. **八條 WIP 裡，沒有任何有效的美術成果只存在 WIP 分支。**
   - 模型（GLB）、Blender 腳本、貼圖、配置：都已經在正式分支，或者正式分支有更新的版本。
   - 正式分支指：LAWWW-B 開發線 `claude/modest-rubin-2lyp7g`、我的交付分支 `claude/funny-albattani-iawshm`、帳號 A 的 LAWWW2 交付分支 `claude/second-ai-env-art`、`main`。
   - **沒有需要另外整合進正式交付分支的東西。**
2. WIP 裡和正式分支不同的檔案，分成四類：
   - **已完整保留**：和正式分支的某個版本逐位元組相同。
   - **已由更新版本取代**：正式分支同一路徑有更晚、由這一版繼續做出來的版本。
   - **仍有獨立價值**：無。
   - **需要進一步判斷**：只有 LAWWW 的程式和文件快照，請 LAWWW-B 複核，見第 4 節。
3. **完整性驗證**：這些 WIP 碰過的 13 個 GLB，以正式分支（開發線）的版本為準：
   - 檔頭、長度、buffer 都正確，貼圖都內嵌；
   - **Blender 5.2 逐一匯入成功，貼圖全部載入**；
   - 產生它們的 Blender 腳本都在正式分支。
4. **額外保險**（不是取代整合）：八條 WIP 的全部 commit 打包成一個 git bundle，放在我的交付分支 `wip_backup/second_ai_wip_branches_2026-10-16.bundle`（25 MB，`git bundle verify` 通過）。WIP 分支刪掉以後，任何一條都能完整還原。
5. **建議**：八條都標「內容已保存／已取代，可刪除」，等 LAWWW-B 複核。
   - bike、lane118、lawlib 是一串，後者包含在前者裡，一起刪；
   - props6、soclib、props、pavsoc 同理；
   - trees 單獨一條。
   - 沒有受阻塞、必須保留的。

## 1. 方法

- **為什麼不用 commit 祖先關係判斷**：只看 commit 會誤判。
  - LAWWW 整合 LAWWW2 的成果多半用 patch 或複製檔案，不是 merge。
  - 所以 WIP 的 commit 不在正式分支的歷史裡（八條各有 11～203 個這樣的 commit），**內容卻已經在**。
  - 改成**逐檔比內容**。
- **四個步驟**：
  1. 每條 WIP 從它和開發線的分岔點起，列出它動過的檔案。
  2. 每個檔案，拿 WIP 的版本（git blob）去比：
     - 正式分支的最新版本；
     - 正式分支整段歷史裡的每一個版本；
     - 共 9 條非 WIP 分支，含帳號 A 的交接分支。
  3. 文字檔逐行比：WIP 新加的每一行，在不在下面五個版本裡？開發線、我的分支、帳號 A 的 LAWWW2 分支、main、帳號 A 的 LAWWW 分支。
  4. 二進位檔（GLB、截圖、渲染圖）比對同一路徑在正式分支的修改時間和 commit 說明，判斷誰是後來的版本。
- 中文檔名的路徑跳脫一開始造成誤判（9 個檔案「不見」），已用 `core.quotepath=false` 重跑更正。
- 原始輸出在 `d88/`：
  - `art_summary.txt`：每條的美術檔案；
  - `lines.txt`：文字檔逐行比對。

## 2. 總表

| WIP 分支 | HEAD | 最後 commit（UTC） | 主要內容（LAWWW2 帳號 A 的工作） | 動過的檔案 | 美術檔案：和正式相同／只在正式歷史（舊版）／不在正式 | 結果 |
|---|---|---|---|---|---|---|
| `wip-bike` | `fb23c7db` | 10-13 15:14 | ⑫騎車用腳踏車、⑭118 巷街景、法律學院圖書館交付、文件 | 447 | 287／2／0 | **已完整保留**，可刪除 |
| `wip-lane118` | `0b1788b9` | 10-13 15:13 | ⑭118 巷街景、法律學院圖書館 | 439 | 280／2／0 | **已完整保留**，可刪除 |
| `wip-lawlib` | `3ba83057` | 10-13 15:11 | 法律學院圖書館（萬才館西牆門洞、窗景）、共同教學館文件 | 430 | 272／2／0 | **已完整保留**，可刪除 |
| `wip-pavsoc` | `8c6f1fe0` | 10-11 08:30 | ⑤洞洞館、社科院驗收（VISUAL_REVIEW 第 13 節） | 145 | 71／0／35 | 美術已保留；35 張舊截圖**已由更新版本取代**，可刪除 |
| `wip-props` | `fa626b9d` | 10-11 09:51 | ⑥販賣機、118 巷配置草案 v1、看板 | 204 | 99／0／35 | 同上，可刪除 |
| `wip-props6` | `49d32ed8` | 10-13 13:04 | ⑥法學院廣場花台、公告欄、販賣機驗收（第 14 節）、店家窗景 | 315 | 198／0／0 | **已完整保留**，可刪除 |
| `wip-soclib` | `af7de02e` | 10-13 13:30 | ⑬社科院辜先生紀念圖書館一樓（正式 GLB、第 16 節） | 328 | 206／2／0 | **已完整保留**，可刪除 |
| `wip-trees` | `22ff594d` | 10-14 02:14 | ⑦行道樹（樹皮減面、記號材質）、聽眾坐姿替身（seated_figures） | 356 | 259／0／17 | 美術已保留；17 個舊版**已由更新版本取代**，可刪除 |

把每條 WIP 的 commit 和「其他所有分支（含其他 WIP）」比，只有 `wip-trees` 有 58 個 commit 不在任何其他分支。其他七條的 commit 都包含在別的 WIP 裡：
- bike ⊃ lane118 ⊃ lawlib；
- props6、soclib、props、pavsoc 互相包含。

所以這幾串要一起處理，不能只刪一條就判斷。

## 3. 「不在正式分支」的美術檔案：逐項判定

| 檔案 | 在哪條 WIP | 判定 | 根據 |
|---|---|---|---|
| `assets/models/env/second_ai/seated_figures.glb`（2,295,184 bytes） | trees | **已由更新版本取代** | WIP 是 `167fc2d`（10-13 20:48，第一次 MODEL_READY）。正式分支是 2,295,212 bytes 的後一版（`257c15f`，10-14 00:09，附「坐姿的腿修正前後」渲染圖）。開發線、我的分支、main 都是這個新版 |
| `seated_figures.json`、`tools/blender/env_second/seated_figures.py` | trees | 已由更新版本取代 | 同上；腳本新版多了腳不穿地的修正 |
| `blender_renders/seated_fig_*.webp`、`seated_lod1_*.webp`（6 張）、`shots/seated_game_*.webp`（4 張） | trees | 已由更新版本取代 | 舊模型的驗收圖；正式分支有新模型的同名圖（10-14） |
| `blender_renders/trees_*.webp`（4 張） | trees | 已由更新版本取代 | WIP 是 10-11 的第一版；正式分支 10-14 00:45 重拍 |
| `test_shots/campus_glb_integration/01～35_*.webp`（35 張） | pavsoc、props | 已由更新版本取代 | 10-11 08:30 第一輪的遊戲截圖（正式模型、換之前）。⑤⑥ 合併後正式分支用同一組鏡頭、同檔名重拍（10-14），VISUAL_REVIEW 第 13、14 節用的是新的一組 |
| `tools/blender/env_second/soclib_interior.py`、`soclib_layout_gen.py`、`drafts/soclib_fill.py` | bike、lane118、lawlib、soclib | 已完整保留（舊版在正式歷史裡）＋已由更新版本取代 | WIP 的版本在正式分支的歷史裡逐位元組相同，最新版是後來繼續改的 |
| `drafts/props6_fill.py`、`trees_fill.py`、`trees_review_draft.md` | props、trees | 已由更新版本取代 | 驗收文件的產生腳本草稿；正式分支有後來的版本 |

**沒有任何 GLB、貼圖、Blender 腳本是「只在 WIP、正式分支沒有」的。**

## 4. 非美術檔案（LAWWW 的程式、測試、共用文件）：請 LAWWW-B 複核

這些 WIP 是從 LAWWW 開發線分出來的，又 merge 過 LAWWW 當時的開發分支，所以帶著 LAWWW 的程式和文件**當時的快照**。逐行比對的結果：

- `src/*.js`、`tests/*`、`index.html`：
  - WIP 新加的行，大部分已經在正式分支；
  - 不在的是後來被 LAWWW 改寫的舊寫法，例如 `teach3d.js` 的註解、`guide3d.js` 的 LINKS、`gongtong_layout` 第一版、`lawlib_layout.js` 草案 v1（正式分支是 10-13「第二版，接進遊戲」）。
  - 開發線上這些檔案的最後修改都在 10-14～10-16，比 WIP 晚。
  - 判定：**已由更新版本取代**（LAWWW 的檔案，請 LAWWW-B 確認）。
- `docs/*.md`：
  - HANDOFF、VISUAL_REVIEW、DUAL_AI_BOARD、ASSET_INVENTORY、PROJECT_DECISIONS、RELEASES、ART_REBUILD_PROGRESS、AI_SESSION_HANDOFF。
  - 不在正式分支的行，都是當時的狀態列或舊標題，例如「⑬ WORK_IN_PROGRESS（草稿）」，以及辜振甫的名稱後來改成「辜先生」。
  - 正式分支有後來的版本，例如 VISUAL_REVIEW 的社科院圖書館一節在正式分支提到 16 處、WIP 只有 10 處。
- `LICENSES.md`：soclib 那一列在正式分支（第 157 列，名稱改成「辜先生」），沒有遺失。
- 完整清單：`d88/lines.txt`（「TEXT MISS」那幾行，附缺少的行的開頭）。

## 5. 資產完整性驗證（以開發線 `modest-rubin` 的版本為準）

| GLB | 網格 | 三角形 | 貼圖（載入／全部） | 產生腳本 |
|---|---|---|---|---|
| bike_ride | 8 | 4,938 | 1／1 | `bike_ride.py` |
| campus_modern | 4 | 1,968 | 3／3 | ✓ |
| campus_pavilion | 5 | 968 | 5／5 | ✓ |
| campus_socsci | 15 | 14,014 | 6／6 | ✓ |
| furniture_study | 13 | 5,752 | 3／3 | ✓ |
| lane118_street | 860 | 110,155 | 18／18 | `wz_street.py --set lane118` |
| lawlib_interior | 768 | 124,788 | 16／16 | ✓ |
| library_interior | 85 | 48,576 | 28／28 | ✓ |
| seated_figures | 48 | 44,388 | 1／1 | ✓ |
| soclib_interior | 29 | 85,540 | 4／4 | ✓ |
| street_props | 7 | 3,994 | 4／4 | ✓ |
| street_trees | 9 | 5,962 | 8／8 | ✓ |
| wancai_interior | 75 | 7,130 | 25／25 | ✓ |

- 檢查方式：glTF 2.0 檔頭、檔案長度、buffer 長度都正確；貼圖全部內嵌（沒有外部檔案路徑）；**Blender 5.2 無介面逐一匯入成功**。
- 本專案不存 `.blend`：模型都由 `tools/blender/` 的腳本產生，原始工程就是腳本加上 Poly Haven 貼圖。

## 6. 備份 bundle（額外保險）

- 檔案：`wip_backup/second_ai_wip_branches_2026-10-16.bundle`，在 `claude/funny-albattani-iawshm`，25,273,455 bytes。
- 內容：八條 WIP 的全部 commit 和檔案（只打包正式分支沒有的物件）。
  - ref 名稱：`refs/heads/d88/second-ai-env-art-wip-<名字>`；
  - HEAD 和上表相同。
- 前置 commit：`f131c67`、`5f66b67`。兩個都在我的交付分支、開發線、帳號 A 的 LAWWW 分支裡；`5f66b67` 也在 main。
- 還原單一條：
  ```bash
  git fetch wip_backup/second_ai_wip_branches_2026-10-16.bundle 'refs/heads/d88/second-ai-env-art-wip-trees:refs/heads/restore/wip-trees'
  ```
- 還原全部：
  ```bash
  git fetch wip_backup/second_ai_wip_branches_2026-10-16.bundle 'refs/heads/d88/*:refs/heads/restore/*'
  ```

## 7. 使用者要的六項回報（LAWWW2-B 這部分）

| 項目 | 結果 |
|---|---|
| 整理前、後的分支數量 | 遠端 17 條：main、8 條 Claude 工作分支（含 A 帳號交接分支、企劃線、開發線、我的交付分支）、8 條 WIP。**我沒有刪除**，整理後的數量由 LAWWW-B 刪除後回報（最多減 8 條 → 9 條） |
| 八條 WIP 每條的結果 | 見第 2 節：八條都是「內容已保存或已取代」，沒有要保留的 |
| 實際刪除的分支與原 HEAD | 無（由 LAWWW-B 決定）。原 HEAD 見第 2 節 |
| 沒刪的分支與原因 | 八條都還在：照使用者補充原則，等 LAWWW-B 複核 |
| 是否還有只存在 WIP 的有效資產 | **沒有**（第 3 節逐項） |
| A／B 下次接班是否受影響 | **不受影響**：帳號 A 的交接分支（`confident-ritchie-8rwh7t`、`second-ai-env-art`、`story-planning`）我沒有動；WIP 刪掉以後，帳號 A 的 LAWWW2 要用到的東西都在 `second-ai-env-art` 和開發線，舊的 WIP 可以從 bundle 還原 |

## 8. 給以後（D88 第四節：WIP 分支的生命週期）

LAWWW2（兩個帳號）以後的做法：
- **交付**：交付時在交接紀錄寫「交付 SHA＋所在分支」。
- **WIP 分支**：工作環境強制開的 WIP 分支，交付被整合以後，在 HANDOFF 標「已整合，可刪除」，並附上判斷依據（這份報告的做法：逐檔比內容，不只看 commit）。
- **換班前**：自己的 WIP 都 push；不把 WIP 當唯一備份，要整合進交付分支。
