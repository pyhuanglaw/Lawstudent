# 開發分支 A 類文件的換名補丁（RENAME-1030，AA-B 2026-10-30）

- 給值班 LAWWW 用：帳號 B 額度到警示，AA 先把開發分支的 A 類文件照 `docs/WORLD_NAMING.md` 換好，做成補丁，LAWWW 只要套用、看 diff。
- 基準：開發分支 `claude/modest-rubin-2lyp7g` `6657b43f1`。

## 套用
```
git apply --3way docs/story_planning/rename_patches/devA_6657b43f1.patch   # 在開發分支的工作樹，從企劃線取這個檔
git diff --stat   # 14 個檔
```

## 內容
- **照新名換**（`tools/rename/world_names.py`，企劃線 `21dc4c3dd` 版）：
  - CLAUDE.md、docs/TESTING.md、docs/REGRESSION_CHECKLIST.md、docs/SECOND_AI_HANDOFF.md；
  - docs/art-rebuild/ART_DIRECTION.md、ASSET_INVENTORY.md；
  - docs/CHARACTER_ART_SPEC.md、MISSING_EXTERNAL_ART.md、REVIEW_README.md；
  - docs/campus/PUBLIC_BUILDINGS_DESIGN.md、SOCSCI_PLAN.md、TEACHING_BUILDINGS_PLAN.md。
  - 說明文字裡的「A館／B館」都改成正式的「法律系館A／B」（文件是寫的字）。
- **照 C 類留原文、只在檔頭加註**：
  - docs/PROJECT_DECISIONS.md（決定的原文和日期）；
  - docs/handoff/USER_WANTS.md（使用者原話）；
  - docs/DUAL_AI_BOARD.md（看板紀錄）。
  - 新的決定（例：D115 更名）照新名寫。
- **改回真名的 22 行**（講真實世界的）：
  - 「使用者提供的臺大校總區平面圖」；
  - 「不直接影射或複製真實台大教授」（CLAUDE.md 和使用者合作的規則第 2 條：講的是真的教授，不能換）；
  - 「和真實的關係」那幾段（教學館規劃拿真實位置比）；
  - 官方地圖、查證。
- 沒動：
  - docs/history、RELEASES、test_logs、research、ART_REBUILD_PROGRESS（歷程）、VISUAL_REVIEW（歷次驗收）：C 類，照 AA_534 第 3-2 節加註，LAWWW 加；
  - tasks.json、deliveries.json：JSON 整份重寫的風險大，任務標題以後新寫的照新名。
