---
name: lawstudent-3d-art
description: Apply Lawstudent LAWWW2 3D asset and D108 scene-code workflow, reference checks, ownership boundaries and art delivery rules. Use for authorized models, scenes, collision, lighting or scene performance work.
---

# LAWWW2 — 3D 美術與場景程式

先讀 `AGENTS.md`、`$lawstudent-handoff` 及動態 RULE_SOURCE。當次尚未批准五 AI 開發，
只做唯讀設定驗證，不修改任何模型、程式或素材。

## 權責與必讀

遵守 `CLAUDE.md` D38／D100／D108／D120／D128／D136／D138／D140／D141，
讀有效美術分支的 `docs/art-rebuild/ART_DIRECTION.md` 與
`docs/art-rebuild/second_ai/RULES_2D_TO_3D.md`、最新 LAWWW2 交接紀錄。
3D 場景、人物與模型屬 LAWWW2；場景區域配置、模型接線、導航／碰撞、鏡頭碰撞、
光影與場景效能亦在 D108 範圍內。CG／2D 背景需求歸 BB，劇情內容歸 AA，
事件／存檔／一般系統由 LAWWW。改 engine3d、game3d、story3d、character3d、assets3d
前先告訴 LAWWW 並確認唯一 writer，不能同時覆蓋核心檔。

## 正式工作流程

1. 由既有任務取得場景用途、尺寸、入口、互動點、碰撞、座位、效能與交付規格；
   有劇情用途缺口問 AA。使用自己的 worktree／有效分支及精確允許路徑。
2. 使用已批准的畫風、角色設定與可合法使用素材；保持授權與來源紀錄。
   校園建築 D136「可部分相同但絕不可照抄」；重要人物外觀變動先由 LAWWW 定案。
3. 有 2D 參考時依現有疊圖流程：拆解、反推鏡頭、建模、同角度疊圖與構圖對照。
   不把錯角度比較當驗收通過；所用開源方法照現有制度記錄，不另建美術規則權威。
4. D141 新場景能走、能坐、看起來像樣就交；最多三版後按現行規則交 LAWWW 決定，
   不無限精修阻塞尚未進遊戲的場景。不得自行以新標準擋掉已授權交付。
5. 依 D108 跑必要的相關 Node 檢查；一般瀏覽器／畫面流程測試交 BB 分派。
   交實際遊戲內證據，不能只交 Blender 預覽冒充已整合遊戲畫面。

交付：任務 ID、完整 SHA、模型與場景檔案清單、座標與接線方式、測試結果、已知限制、
未完成與下一步。用原 outbox，WIP 標 `noDirectIntegrate:true`。角色美術由 LAWWW
`ART_APPROVED`，建築／場景由 BB `ART_APPROVED`；不自行標最終驗收。
