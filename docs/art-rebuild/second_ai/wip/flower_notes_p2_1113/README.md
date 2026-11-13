# 花序 Flower Notes 花束 P2（LAWWW2-C，2026-11-13）

任務：SHOP-REALISM-1112 的花序 P2（幫手 g4 驗收表上寫給 LAWWW2 的一項：「花束還是摺紙感的頂點色多邊形」；g4 23:19Z ACK 轉交）。

## 改了什麼（玩家會看到）
- **每團花底下的深綠圓球拿掉**（遠看像一顆綠球插在棍子上），改成下面一圈葉子。
- **外圈花瓣拆成兩段**：根部三角形（暗，k 0.78）＋尖端五邊形（亮，k 1.06～1.14），尖端中間那點往外翻，有彎度和深淺；每片寬度、長度、翹起高度、角度都亂數錯開（原本整圈一樣大）。內圈、花心不變。
- 對照圖 `fn_cmp.jpg`：左＝開發分支現在、右＝這版；三列＝櫃台展示、左牆花架、進門。同鏡頭、14:00、遊戲內（fast_shots）。

## 數字
- 三角形 72,707 → 76,795（畫出來 73,879 → 77,967；大店上限 8 萬以內）。第一版 107k 超標，已減回：外圈片數維持 seg、每片 4 面、葉子數照原公式。
- GLB 5.57 MB → 6.23 MB（多出來的是花瓣頂點）。沒有烘焙光照貼圖，不用重烘。

## 測試（在開發分支 4556c4be0c 上；patch 也 `git apply --check` 過 bf9d623e69）
- `tests/shop_cc0_unit.js` ALL PASS（花序三項照舊過）
- `tests/place_gate_unit.js --coplanar --write` 後 `place_gate_unit.js` ALL PASS（已知未過 11 項＝SHOP-WINDOW-3D，和花序無關）
- `flower_notes_unit.js`、`flower_notes_aa792_1112_unit.js`、`flower_class_aa820_1112_unit.js`、`flower_2f_tapnav_1112_unit.js` 全 ALL PASS

## 怎麼套
`git apply docs/art-rebuild/second_ai/wip/flower_notes_p2_1113/flower_notes_p2.patch`（五個檔：GLB、JSON、生成腳本、place_gate_coplanar.json、SHOP_STANDARD_STATUS.md）。`textures/gen/fn_view2f.jpg` 是建模時產生的，不用收。

## 還沒做到的（照實寫）
- 花瓣還是硬邊多邊形（頂點色做法的上限），近看仍看得出是幾何片。要再往上得換成 Poly Haven 的花／葉片掃描模型；那會吃面數，要先量。下一步列在 LAWWW2 交接檔，不擋這版。
- 共用 `bb_support/cc0kit.py` 的 ph_obj 高度快取修正（g4 181e2a27c）這版沒用到；之後放 Poly Haven 花時要一起拿。
- 瀏覽器實際畫面以 CC 在使用者電腦拍的為準；BB 判美術。
