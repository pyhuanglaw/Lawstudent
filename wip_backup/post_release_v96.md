# v9.6 發布後的步驟（LAWWW 自己用）
1. 確認 a6c3d1a 是 origin/main（a4f2760）的後代：git merge-base --is-ancestor a4f2760 a6c3d1a
2. git push origin a6c3d1a:main（快轉，不 force）；記下時間
3. GitHub Actions「pages build and deployment」：等 success，記下完成時間（UTC）與第幾次
4. 開發分支（wt_next）：git merge origin/main（不 rebase）；衝突只會在 docs/PROJECT_DECISIONS.md（D56 那一句兩邊都改了）——留開發分支的寫法
5. RELEASES.md：表格加 v9.6 一列（回復目標 a4f2760）、「下一次正式發布最早」改成部署＋3 小時、緊急回復指令改成回到 a4f2760、v9.6 一節（草稿 wip_backup/rel_v96_entry_draft.md，填 {DEPLOY_TIME}{MAIN_SHA}{PAGES_N}{RESULTS}）
6. CLAUDE.md「目前版本」：v9.6 已部署（時間、a6c3d1a＝測試過的候選本身、主要內容、上一個穩定版 v9.5 a4f2760）
7. 交接（ART_REBUILD_PROGRESS）＋看板（DUAL_AI_BOARD AI-1 第 3 列）
8. 回報使用者：main 有什麼、只在開發分支的有什麼、還沒驗證的（iPhone）
9. 通知 LAWWW2（v9.6 含 55fbedb 共同教學館／大一女舍外觀 → 看板 ACTIONED）、AA（v9.6 不含 AA_120 第 7 節、初遇修正在開發分支）
10. 開發分支的瀏覽器測試佇列：wt_dev 快轉到合併後的開發分支 → flow_first_meet、flow_clubs、flow_discuss_class、save_firstmet_migration、flow_seated_spawn、flow_boya_interior（＋替身、窗景截圖）、campus_layout_nav、reachability_all、flow_playtest_fixes、flow_course_choice、flow_classes、flow_soclib、flow_teaching_buildings…（之後整套回歸給 v9.7）
