# wip_backup：只在本機分支上的半成品，備份到開發分支（遊戲不會讀這個資料夾）

2026-10-11 使用者訂的「緊急保存規則」（D45）：工作階段可能隨時因額度中斷，所有成果都要能從 GitHub 找回來。
工作階段只能 push 自己的開發分支（`claude/confident-ritchie-8rwh7t`），所以還沒合併的本機分支用 **git bundle** 備份在這裡。
**這些都是 WORK_IN_PROGRESS：保存不等於完成、不等於可以發布。**

| 檔案 | 本機分支 | 最新 commit | 內容 | 狀態 |
|---|---|---|---|---|
| `dorm-hall.bundle` | `wip/dorm-hall` | `bf750b4` | 宿舍走廊（D44）：新區域 `dorm_hall`（src/dorm3d.js、src/data/dorm_layout.js）、Blender 正式模型（tools/blender/dorm_hall.py → assets/models/env/dorm_hall.glb）、窗景拍攝腳本（tools/shots/dorm_views.py）、測試（tests/flow_dorm_hall.py、nav_buildings_unit 宿舍段） | WIP：導航單元測試 17 項通過；**瀏覽器流程測試、窗景照片、VISUAL_REVIEW 還沒做**；不可合併進要發布的版本 |
| `wip_subagents_1021_1415.bundle`＋`wip_a49e7888_uncommitted_1021_1415.patch`、`wip_a73c8f28_uncommitted_1021_1415.patch` | `worktree-agent-a49e7888e56ebae1c`（4786dfdd：AA_357 大五，1-4、1-5 做完、1-6 WIP）、`worktree-agent-a73c8f28082f050ca`（d4ae2af9：AA 回覆小修 A 組 WIP）、`worktree-agent-ada67c9808dea4534`（91cd3186：AA_360 WIP，剛讀完規格） | 見左 | 2026-10-21 14:1x 使用者「每週使用量快要到了……先放上 GitHub」：LAWWW-C 的三個子代理半成品（前置 commit 都在 origin 的 claude/adoring-meitner-mqzst8 上；patch＝當下還沒 commit 的改動，在那個分支上 `git apply`） | WORK_IN_PROGRESS（子代理還在做，做完會正式合併；這份只是備份） |
| `subagents_1022.bundle` | `y1b`（b177b020：AA_372 §6／BB_105、106／AA_373 §6，5 個 commit）、`aa374`（bdb2100d：AA_369 §9／AA_374／AA_375，最後一個是 WIP）、`y3`（89d62218：AA_376／AA_377／畢業後，WIP）、`date2`（eedb94ca：校外約會四個 bug＋AA_359 第 5 節，最後一個是 WIP） | 見左 | 2026-10-22 01:1x 工作階段重新啟動，帳號 A LAWWW 的四個子代理被停掉（系統不讓自動接續）；前置 commit 都在 origin 的開發分支上（e11007d4 以前） | WORK_IN_PROGRESS：沒有跑完測試；LAWWW 接著做、跑完測試再合併 |

還原（在 repo 裡，開發分支已經 fetch 過）：
```bash
git fetch wip_backup/dorm-hall.bundle wip/dorm-hall:wip/dorm-hall   # 需要的前置 commit（79e1fed、3c9e02f）都在 origin 的開發分支上
git worktree add <資料夾> wip/dorm-hall
```

- `wancai-stairs.bundle`（2026-10-11 10:04 UTC 緊急保存）：本機分支 `wip/wancai-stairs`（`8b08c61`，萬才館第二階段早期版本；內容已用其他 commit 整合進開發分支，這裡只是備份）。還原：`git fetch wip_backup/wancai-stairs.bundle wip/wancai-stairs:wip/wancai-stairs`。
- `dorm-hall.bundle` 10:04 UTC 重新建立（同樣是 `bf750b4`，宿舍走廊 WIP，還沒在瀏覽器實測，不可合併進要發布的版本）。
- `v96-rc2.bundle`（2026-10-13 22:30 UTC）：v9.6 發布候選 2，本機分支 `rel/v96-rc2`（`93877e9`＝`5f66b67`＋`f9b9017` 只改文件＋互動按鈕修正）。前置 commit `5f66b67` 在 origin 的開發分支上。還原：`git fetch wip_backup/v96-rc2.bundle rel/v96-rc2:rel/v96-rc2`。**發布回歸跑完、全部通過以前不是可以發布的版本。**
- `v96-rc3.bundle`（2026-10-13 22:48 UTC）：v9.6 發布候選 3，本機分支 `rel/v96-rc3`（`a6c3d1a`＝候選 2 `93877e9`＋要離開的人不擋出口、補人時段剩不到 15 分鐘的不補）。前置 commit `5f66b67` 在 origin 的開發分支上。還原：`git fetch wip_backup/v96-rc3.bundle rel/v96-rc3:rel/v96-rc3`。**發布回歸跑完、全部通過以前不是可以發布的版本。**
- `v96-rc5.bundle`（2026-10-14 03:12 UTC）：v9.6 發布候選 5，本機分支 `rel/v96-rc5`（`709eb53`）＝候選 3 `a6c3d1a`＋`7223e75` 課綱法律內容閘門（AA_122：還沒審查的週只顯示主題）＋`1c62e0a` 回歸測試工具（目標在別層時先轉鏡頭）＋`709eb53` 回歸測試工具（按鈕在清單外面時先捲過去）。後兩個只改 tests/，遊戲程式和候選 4 相同。前置 commit `5f66b67` 在 origin 的開發分支上。還原：`git fetch wip_backup/v96-rc5.bundle rel/v96-rc5:rel/v96-rc5`。**發布回歸跑完、全部通過以前不是可以發布的版本。**
- `v96-rc6.bundle`（2026-10-14 03:36 UTC）：v9.6 發布候選 6，本機分支 `rel/v96-rc6`（`83ff81b`）＝候選 5 `709eb53`＋flow_teaching_buildings 的「讀檔後移到建築外面」改用牆圍起來的本體判斷（拱廊下可以）。只改 tests/，遊戲程式和候選 4 相同。前置 commit `5f66b67` 在 origin 的開發分支上。還原：`git fetch wip_backup/v96-rc6.bundle rel/v96-rc6:rel/v96-rc6`。**發布回歸跑完、全部通過以前不是可以發布的版本。**
- `v96-rc7.bundle`（2026-10-14 03:48 UTC）：v9.6 發布候選 7，本機分支 `rel/v96-rc7`（`e2c4f10`）＝候選 6 `83ff81b`＋生活費改成企劃的遊戲數值（遊戲程式只差 `monthlyFunds` 的金額）。前置 commit `5f66b67` 在 origin 的開發分支上；還原：`git fetch wip_backup/v96-rc7.bundle rel/v96-rc7:rel/v96-rc7`。候選 5、6 的 commit 都包含在這個 bundle 裡。
- `v96-rc8.bundle`（2026-10-14 04:52 UTC）：v9.6 發布候選 8，本機分支 `rel/v96-rc8`（`6c2d6e9`）＝候選 7 `e2c4f10`＋只改測試（flow_classes：HUD 等它出現、教授下課走到門口、C 段改成共同教學館 102 大一英文、D 段只查 C 段那一堂、手機分頁等換過去；flow_soclib：看不到「坐下讀書」再往椅子走一步）。遊戲程式和候選 7 相同。前置 commit `5f66b67` 在 origin 的開發分支上（這份 bundle 含候選 4～8 全部）。
- `v96-rc9.bundle`（2026-10-14 04:53 UTC）：v9.6 發布候選 9，本機分支 `rel/v96-rc9`（`781e292`）＝候選 8 `6c2d6e9`＋共同教學館、大一女舍的正式外觀先不放（校門鏡頭 draw call 1.14 倍超過 1.1 倍；src/assets3d.js 拿掉兩行）＋campus_glb_integration 外框比對修正。前置 commit `5f66b67` 在 origin 的開發分支上（含候選 4～9）。
- `v96-rc10.bundle`（2026-10-14 05:00 UTC）：v9.6 發布候選 10，本機分支 `rel/v96-rc10`（`2f138a5`）＝候選 9 `781e292`＋flow_soclib 窗邊座位照玩家的做法走（按鈕出現就停；只改測試）。前置 commit `5f66b67`（含候選 4～10）。
- `v96-rc11.bundle`（2026-10-14 05:08 UTC）：v9.6 發布候選 11，本機分支 `rel/v96-rc11`（`f87f71b`）＝候選 10 `2f138a5`＋campus_layout_nav 清單跟上大一女舍（LAWWW2 25d2aa7 的 patch；只改測試）。前置 commit `5f66b67`（含候選 4～11）。
- `v96-rc12.bundle`（2026-10-14 05:47 UTC）：v9.6 發布候選 12，本機分支 `rel/v96-rc12`（`a9c2b69`）＝候選 11 `f87f71b`＋flow_soclib 閱覽長桌那一步按鈕出現就停（只改測試；遊戲程式和候選 9～11 相同）。前置 `5f66b67`。還原：`git fetch wip_backup/v96-rc12.bundle rel/v96-rc12:rel/v96-rc12`
- `v96-rc13.bundle`（2026-10-14 06:12 UTC）：v9.6 發布候選 13，本機分支 `rel/v96-rc13`（`ba435d5`）＝候選 12 `a9c2b69`＋座位的「坐下」範圍（engine3d.js 的 fitSeatRadius：5 棟新建築 29 個座位）＋E.simWalk 步數上限看路線長度＋tests/seat_reach_unit.js。前置 `5f66b67`。還原：`git fetch wip_backup/v96-rc13.bundle rel/v96-rc13:rel/v96-rc13`
- `v97-rc1.bundle`（2026-10-14 06:30 UTC）：v9.7 發布候選 1，本機分支 `rel/v97-rc1`（`5adef66`）＝開發分支 `22c597c`＋拿掉共同教學館、大一女舍的 manifest 兩行＋版本字樣 v9.7。前置 `22c597c`（開發分支歷史裡有；第一次放的 45 MB 版本是從 5f66b67 起算，已換成這個）。還原：`git fetch wip_backup/v97-rc1.bundle rel/v97-rc1:rel/v97-rc1`
- `v96-rc14.bundle`（2026-10-14 06:40 UTC）：v9.6 發布候選 14，本機分支 `rel/v96-rc14`（`4ba8c8b`）＝候選 13＋flow_classes 按「坐下」之後等選項出現再讀（只改測試）。前置 `5f66b67`。還原：`git fetch wip_backup/v96-rc14.bundle rel/v96-rc14:rel/v96-rc14`
- `v97-rc2.bundle`（2026-10-14 06:40 UTC）：v9.7 發布候選 2，本機分支 `rel/v97-rc2`（`06f2b64`）＝v9.7 候選 1 `5adef66` 合併 v9.6 候選 14（同一個 flow_classes 測試修正；遊戲程式和候選 1 相同）。前置 `22c597c`（開發分支裡有）。還原：`git fetch wip_backup/v97-rc2.bundle rel/v97-rc2:rel/v97-rc2`
- `v96-rc15.bundle`（2026-10-14 07:08 UTC）：v9.6 發布候選 15，本機分支 `rel/v96-rc15`（`e88bda5`）＝候選 14＋測試工具 go_to 等人物真的走完（只改測試）。前置 `5f66b67`。還原：`git fetch wip_backup/v96-rc15.bundle rel/v96-rc15:rel/v96-rc15`
- `v97-rc3.bundle`（2026-10-14 07:08 UTC）：v9.7 發布候選 3，本機分支 `rel/v97-rc3`（`8ac75f6`）＝v9.7 候選 2 `06f2b64` 合併 v9.6 候選 15（遊戲程式和候選 1、2 相同）。前置 `22c597c`。還原：`git fetch wip_backup/v97-rc3.bundle rel/v97-rc3:rel/v97-rc3`
- `v97-rc4.bundle`（2026-10-14 07:30 UTC）：v9.7 發布候選 4，本機分支 `rel/v97-rc4`（`6ad0923`）＝候選 3＋測試工具讀檔時關掉直向提示、flow_typhoon 跟上（LAWWW2 的 patch；只改測試，遊戲程式和候選 1～3 相同）。前置 `22c597c`。還原：`git fetch wip_backup/v97-rc4.bundle rel/v97-rc4:rel/v97-rc4`
- `v97-rc9.bundle`／`v97-rc10.bundle`／`v97-rc11.bundle`（2026-10-14 09:06～09:38 UTC）：v9.7 發布候選 9～11（`64792d3`、`11bdf50`、`836a1f6`），只改測試（flow_lecture_attend、flow_bike、flow_course_choice）；遊戲程式＝候選 8 `3e5201d`。每一包的前置是前一個候選。
- `v97-rc13.bundle`（2026-10-14 10:21 UTC）：v9.7 發布候選 12 `b223a31`（flow_bike 先轉正再量、失敗結束碼 1）＋候選 13 `69a6cdc`（index.html 的 script 版本號 9.6-1 → 9.7-1），本機分支 `rel/v97-rc13`。前置 commit `836a1f6`（候選 11）。還原：`git fetch wip_backup/v97-rc13.bundle rel/v97-rc13:rel/v97-rc13`（先照順序 fetch 前面的包）。
- `v97-rc14.bundle`（2026-10-14 10:40 UTC）：v9.7 發布候選 14 `fd46e14`＝候選 13＋flow_bike 的量法（一直按住搖桿、車停下來再量腳、上車站離店門遠的那邊；只改測試），本機分支 `rel/v97-rc14`。前置 `69a6cdc`（候選 13）。
- `v97-rc15.bundle`（2026-10-14 10:50 UTC）：v9.7 發布候選 15 `d8aca4d`＝候選 14＋flow_bike 量速度只量真的在騎的那一段（按住 10 秒、第 3 秒開始量、放開前 1.5 秒量完；只改測試），本機分支 `rel/v97-rc15`。前置 `fd46e14`（候選 14）。還原：`git fetch wip_backup/v97-rc15.bundle rel/v97-rc15:rel/v97-rc15`
- `v97-rc16.bundle`（2026-10-14 11:10 UTC）：v9.7 發布候選 16 `52f288e`＝候選 15＋LAWWW2 的三支測試修正（patch `v97_tests_fd46e14`：flow_first_meet、flow_discuss_class、flow_lecture_attend；只改測試），本機分支 `rel/v97-rc16`。前置 `d8aca4d`（候選 15）。還原：`git fetch wip_backup/v97-rc16.bundle rel/v97-rc16:rel/v97-rc16`
- `v97-rc17.bundle`（2026-10-14 11:58 UTC）：v9.7 發布候選 17 `402f2b5`＝候選 16＋flow_clubs A 段換日子（10/13 在 v9.7 是颱風假，改用 10/15 週三；只改測試），本機分支 `rel/v97-rc17`。前置 `52f288e`（候選 16）。還原：`git fetch wip_backup/v97-rc17.bundle rel/v97-rc17:rel/v97-rc17`
- `v97-rc18.bundle`（2026-10-14 12:04 UTC）：v9.7 發布候選 18 `9c057a4`＝候選 17＋flow_clubs A 段子晴初遇的檢查跟上 v1 定稿（沒有 guitar_invite 的存檔第一句是「新人？……法律系的？」；只改測試），本機分支 `rel/v97-rc18`。前置 `402f2b5`（候選 17）。還原：`git fetch wip_backup/v97-rc18.bundle rel/v97-rc18:rel/v97-rc18`
- `v97-rc19.bundle`（2026-10-14 12:16 UTC）：v9.7 發布候選 19 `313d620`＝候選 18＋遊戲修正（game3d.js choose：選單墊高到對話框上面時 max-height 一起扣掉；手機橫向時社團博覽會 6 個選項第一個被推出畫面），本機分支 `rel/v97-rc19`。前置 `9c057a4`（候選 18）。還原：`git fetch wip_backup/v97-rc19.bundle rel/v97-rc19:rel/v97-rc19`（先依序 fetch rc17、rc18 的包）

## wip_subagents_1020_2035.bundle（LAWWW-C 2026-10-20 20:35 UTC，容器重啟以後）
子代理在 worktree 分支上的半成品（還沒合併進開發分支）：第 2 輪大三前後半（AA_326）、大四前後半（AA_327，含美國路線 US1～US4 c2ba77f3）、第 3 輪（AA_328）、CG 第二批腳本、多功能教室／202 美術、507／409 拆箱小道具。
還原：`git fetch wip_backup/wip_subagents_1020_2035.bundle 'refs/heads/*:refs/remotes/wip/*'`，再 `git log wip/worktree-agent-<id>`。這些都已經交給新的子代理接著做；合併進開發分支以後這個檔可以刪。

## wip_subagents_1021_1500.bundle（LAWWW-C 2026-10-21 14:5x UTC，使用者「現在正式交班」）
子代理 a73c8f28（AA 回覆小修 A～E）被停在 `8a9a5e5a`（分支 `worktree-agent-a73c8f28082f050ca`，最上面還有一個合併開發分支的 `bcbc0c82`）：A 組 AA_242 第 12 節 `d5d7e526`（測試先寫 `d4ae2af9`）、B 組日本宿舍「你的房間」三個「看」`16e97be8`、C 組 AA_355 第 5 節 `cb29c54f`、D 組 AA_358 第 2 節 `8a9a5e5a`；E 組（AA_350 第 9 節）沒做。**沒合併進開發分支、LAWWW 沒驗過**（WIP-LAWWW-AAFIX-1021）。
還原：`git fetch wip_backup/wip_subagents_1021_1500.bundle 'refs/heads/*:refs/remotes/wip/*'`，再 `git log wip/worktree-agent-a73c8f28082f050ca`；合併前跑它改過的那些單元測試（vac_c16_c18、aa355、aa358、jp_semester、termend 等）。合併進開發分支以後這個檔可以刪。
