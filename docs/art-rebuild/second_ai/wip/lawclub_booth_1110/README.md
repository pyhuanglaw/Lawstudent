# LAWCLUB-BOOTH-MOVE-1110：法服招生攤位搬到法學院前（X294）

- 使用者 11-10 01:5x 對 LAWWW-B：「法服徵人 到底為何不在法律系館前? 為什麼在校園中間」。截圖：`docs/handoff/user_shots/1110_lawclub_booth_campus.webp`。
- 狀態：`READY_FOR_REVIEW`。LAWWW2 帳號 A，11-10。

## 改法：只改 `src/zones3d.js` 兩行
- 攤位從晨思鐘廣場東側 (−18, 14.5)、面向椰影大道，搬到法學院廣場（法律系館A前庭的鋪面）。
- 新位置 (34.5, −90.2)，靠小椰林道走過來的那一頭，正面朝南：從校園走過來的人先看到布條。
- 互動點在攤位南邊 1 m（34.5, −89.2）。label、notice:'lawclub' 都不變，劇情（D118-B5a「看過公告」）照舊。
- 導航阻擋跟著搬，大小一樣（1.9 × 0.8）。
- 社博那幾天照舊收起來（`fairDay`），博覽會帳篷不受影響。

## 測試
新測試 `tests/lawclub_booth_unit.js`，不需要瀏覽器：
- 檢查項目：
  - 互動點在法學院廣場裡、不在椰影大道邊；
  - 互動點旁邊站得住；
  - 從校門、從法律系館A前都走得到（走路 30 fps、跑步＋低幀率）；
  - 攤位擋住；
  - 長椅前、步道、前庭中間照舊站得住。
- 開發分支原樣：FAILED 2。加補丁：ALL PASS。
- 回歸：在 bb8a32765 上跑 40 支 ALL PASS（`regression_bb8a32765.txt`，校園、導航、campus_public、d118_b5a）。
- 在新的開發分支 dcc9276f8 上 `git apply --check` 通過，lawclub_booth_unit、campus_public_unit 都 ALL PASS。

## 接法
```
git apply docs/art-rebuild/second_ai/wip/lawclub_booth_1110/lawclub_booth_1110.patch
node tests/lawclub_booth_unit.js
```
- 遊戲裡要請 CC 拍：法學院廣場從小椰林道走過來看攤位，白天一張。

## 還差的
- 攤位還是程式畫的摺疊桌加布條（原本就是這樣），這次只搬位置。
- 要換成正式模型，可以用社博的攤位（club_fair.glb）裡的法服帳篷，之後再排。
