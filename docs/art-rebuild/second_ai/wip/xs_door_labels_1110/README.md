# XS-DOOR-LABELS-1110：新生南路店門的字不要括號套括號 — LAWWW2 帳號 A，2026-11-10

- 來源：TODO_SHORTCUTS（SHORTCUTS-TODO-1105，LAWWW 11-10 派：挑玩家一定看得到的收掉）。山嵐第 5 點、大口第 5 點、運動廣場第 7 點、同弦都有。
- 改之前：xinsheng3d.js 直接拿配置的 type 組字，例如「進山嵐書店（書店（兩層））」「進同弦樂器（吉他行（二樓））」「進大口漢堡（速食（24 小時））」「進新生運動廣場（運動用品（兩層））」。
- 改之後：type 裡的括號那一段拿掉，變成「進山嵐書店（書店）」。只改 `src/xinsheng3d.js` 一行，配置不動；大步、好拍、南洋本來就沒有括號，照舊。
- 測試：新的 `tests/xs_door_labels_unit.js`。開發分支 327f64bfe 上 FAILED 2（有 4 間），套 patch 後 ALL PASS。讀到新生南路的 53 支回歸全過，見 `regression.log`。其他測試只比對「進山嵐書店」這種開頭，不受影響。
- 整合：`git apply xs_door_labels_1110.patch`。
