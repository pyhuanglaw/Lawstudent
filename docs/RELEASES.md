# 正式發布紀錄（GitHub Pages）

線上網址：https://pyhuanglaw.github.io/Lawstudent/ （GitHub Pages：Deploy from a branch → `main` / root）。
規則（使用者 2026-10-10 睡眠期間授權）：只有測試通過、在實際遊戲裡驗證過的成熟成果才發布；**兩次正式發布至少相隔三小時**（以 GitHub 實際部署成功的時間為準）；
尚未經使用者確認的美術不標 ART_APPROVED；實驗中的成果（例如 Blender 人物示範）留在開發分支；每次發布前標記上一個穩定版本，出事時緊急恢復不受三小時限制。
**限制**：這個開發沙盒連不到 `*.github.io`，部署後用 GitHub Actions 的部署紀錄確認成功，並在本機對**同一個 commit**跑遊戲檢查（不是直接開正式網站）。

| 版本 | commit | 部署成功（UTC） | 回復目標（上一個穩定版） |
|---|---|---|---|
| v7 | `385e194`（之後 `ba53746` 只改文件） | 2026-10-08 20:38 | — |
| v9.3 | `0ef3a73` | 2026-10-10 05:35:59 | v7 |
| v9.3 第 25 批 | `cd52bab` | 2026-10-10 08:38:53 | `0ef3a73` |
| v9.4 | `6b9c0dc`（遊戲檔案和測試過的候選 `f10b387` 完全相同，見下面） | 2026-10-10 14:47:16 | `cd52bab` |

---

**下一次正式發布最早：2026-10-10 17:47:16 UTC**（三小時規則；緊急回復不受限制）。

**緊急回復（不用 force push）**：做一個「內容＝上一個穩定版、父節點＝目前 main」的新 commit，再快轉推上去：
```bash
git fetch origin main
C=$(git commit-tree cd52bab^{tree} -p origin/main -m "緊急回復到 v9.3 第 25 批（cd52bab）")
git push origin $C:main        # 快轉，不是強制推送；之後用 GitHub Actions 的 pages build and deployment 確認部署
```
（原本要用 tag `v9.3-25` 標記回復點：本機建立了，但這個沙盒推 tag 會被代理斷線，遠端沒有這個 tag——回復點以 commit SHA 為準。）

## v9.4（2026-10-10 14:47:16 UTC 發布 `6b9c0dc`；發布候選 `f10b387`；第一個候選 `47b2043` 沒有發布）

**玩家會看到的改變**
- **霖澤館可以走進去**：法學院廣場走上台階、穿過三層樓高的穿堂；一樓大廳、雙跑樓梯（自己走上二樓）、玻璃電梯、二樓迴廊、201 階梯教室（48 個座位都能坐、坐下起身）。室內是使用者核准的遊戲化設計（D37），不是真實霖澤館的格局；三樓以上整修中。Blender 正式模型（外觀、大廳、教室）。
- **走樓梯時腳踩在階梯上**（footIK），不再穿進台階。
- **人物載入修正**：網路慢、模型下載超過時限時，原本會一直顯示程序化備用人物（線上「人物很醜」的主因）；現在分批載入主角、主要角色、路人，載好之後自動換成正式模型。
- **人物外觀 VRoid 加工第一輪**：祐廷（瀏海、眼睛、鼻樑、上衣）、沈以安（瀏海、臉旁碎髮、高馬尾、V 領針織衫、高腰寬褲）、林芷若（側分瀏海、及肩微捲、露出耳環、細框眼鏡、反摺袖）、陳語彤（兩邊頭髮對稱、齊肩、圓領 T 恤、領口黑色蝴蝶結修好、後背包扁平背帶貼身）、高子晴（瀏海到眼睛上緣、耳下鮑伯、V 領、吉他袋雙肩背帶）。**美術待使用者驗收**（docs/art-rebuild/CHARACTER_REVIEW.md 第 4–8 節）。
- **長椅坐下不再坐在空中**（椰林大道、傅鐘、霖澤館前、醉月湖、溫州街小公園）。
- **霖澤館與 201 室內鏡頭**：進門時深色自動門、201 後門不再擋住人物（跟著牆淡出）。
- 標題畫面版本字樣「版本 v9.4（2026-10-10）」；script 版本號 9.4-1（避免新舊程式快取混用）。

- **沈以安 Blender 版（給使用者驗收，預設不使用）**：檔案 `assets/models/char/bl_heroine_01.vrm` 在這個版本裡，但**只有網址加 `?blchar` 才會載入**（例如 `https://pyhuanglaw.github.io/Lawstudent/?blchar`），讓使用者在手機上用實際遊戲看 Blender 版。不加參數時遊戲畫面和以前一樣（沈以安仍是 VRoid 加工版）。依據：使用者的授權第 7 條「實驗性 Blender 人物若仍在 WIP，可以繼續留在開發分支」，以及「不要把需要我驗收的實驗成果直接混入正式發布版本」——預設畫面不變，所以沒有混入；使用者如果不希望檔案出現在正式網站，可以整個移除，不影響其他功能。

**不在這一版（留在開發分支）**：霖澤館玻璃反射與室內細節（製作中）；萬才館第二階段；第二個 AI 的環境美術（兩點半 Café 製作中）。

**`47b2043` 之後到 `f10b387` 的改動**：沈以安 Blender 版（只在 `?blchar`）；`tests/zone_transitions.py` 霖澤館那一組改成 v9.4 的設計（進霖澤館先到大廳；第一個候選唯一的失敗是測試過時，不是遊戲的錯）；雙 AI 分工文件；`build.py` 多打包 `assets/models/env/second_ai/`（目前是空的）。

**發布前測試**：`tests/release_suite.sh`（乾淨 worktree，Playwright 手機模擬，不是 iPhone 實機）——結果見下面「測試結果」。

**測試結果**（乾淨 worktree，Playwright 手機模擬＋SwiftShader，**不是 iPhone 實機**）：
- 候選 `f10b387` 的 `tests/release_suite.sh`（2026-10-10 13:40–14:22 UTC）：24 項中 22 項第一次就 PASS——
  nav_levels_unit、nav_buildings_unit、stairs_feet（祐廷＋五位女主角）、sim_hair、deploy_check、model_upgrade、zone_transitions、
  campus_layout_nav、gongguan_layout_nav、reachability_all、indoor_cam_occlusion、minimap_direction、joystick_direction、p0_movement、
  touch_flow_wenzhou、save_compat_v7（v7 玩家的存檔）、save_compat_live（線上 v9.3 玩家的存檔）。
- 另外兩項第一次失敗，都是**測試本身**的問題，修測試後對同一個候選重跑都 PASS：
  - `flow_class_real`：測試還是 v9.3 的走法（從校園門口進霖澤館就直接上課）；v9.4 是從二樓 201 門口進教室。測試改成 v9.4 的設計（`b006183`）後 **9/9 PASS**、自動走路沒有用到「卡住後放到目的地」的保險。
  - `flow_linze_floors`：「走到教室後門」那一步，人物還在走、經過最上排座位的那一瞬間，測試就去看按鈕（看到「坐下」）；人物停下來後按鈕是「離開教室」——遊戲沒有錯，是測試太早檢查。`tests/playlib.py` 的 `go_to` 改成到達後等人物停下來（像真人一樣）再回傳（`6b9c0dc`），重跑 **29/29 PASS**。
- 發布後：GitHub Actions「pages build and deployment」#11 對 `6b9c0dc` **success**（14:46:09 開始、14:47:16 完成）；本機對同一個 commit 跑 `deploy_check`：**ALL PASS**（16 個區域都載入正式 VRM 人物、338 個資源都載得到、沒有 JS 例外；console 有一個 404，發布前也有，資源檢查全部通過）。
- `6b9c0dc` 和測試過的 `f10b387` 比較：`src/`、`index.html`、`lib/`、`assets/`、`build/`、`build.py`、`.nojekyll`、`test_charlook.html` 完全相同（git tree hash 相同）；差別只有測試（`tests/`）、Blender 製作腳本（`tools/blender/char/`，遊戲不會載入）、文件。
