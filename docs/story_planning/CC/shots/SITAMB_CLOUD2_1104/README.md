# SITAMB 雲端版（d3828，SwiftShader；BB-C 20:11 同意減成 5 項、不跑對照組）

- 設定：VIEW=844x390、REC_FPS=10、CTL=0（每段 12 秒、動作種類全部）。fps 不量。
- 結果：cafe（一般網址那一段）、libA0、libB0、eat、class0、player 流程 ALL PASS，都沒有 JS 例外。
- 縮圖：sheet_*.jpg（每張 36 格，檔名＝段落＿格數）。
- CC-C 看縮圖：大部分沒有看到明顯的穿模、浮空。
  - **class0 疑似**：博雅 101、霖澤 201 的階梯座位，坐著的人大腿和椅面交疊——椅面前緣畫在大腿前面，看起來大腿陷進椅面。
  - 腳（寬褲）照樣碰到地板。
  - 放大圖：feet_boya_crop.jpg、feet_201_crop.jpg；原圖 boya_feet_f0050_top.jpg、classroom_feet_f0082_top.jpg。
  - 照 BB-C 的條件，只在 class 補跑 ?nositamb（SITAMB_class1，chain4 開頭），看是不是 2acb 造成的。判定歸 BB。
- eat（林家乾麵 12:15）只有 2 位坐著，沒有滑手機的人（eat_phone 那一段沒拍）。
- libA0 的 3F 閱覽區 sync 那幾張：鏡頭下半被矮牆擋住（探針的鏡頭位置，不是遊戲）。
- 停掉的：cafe 的對照組（?nositamb）停在一半，沒有 JSON。worker 重新啟動中斷一次 class0，已重跑。

## SITAMB_class1（?nositamb 對照組，BB-C 22:26 P1 插隊）——ALL PASS（22:31～22:51，d3828）
- 跑的時候 `CHAR.sitAmb=false`，`sitAmbFidget` 0/0 叫得動。霖澤 201 坐著 25 人，博思 101 坐著 16 人。沒有 JS 例外。
- 並排圖（同一個 feet 鏡頭；放大區域同 feet_boya_crop／feet_201_crop）：
  - `sitamb_class_cmp_boya.jpg`：左邊 class0（一般網址，坐著會動）f0050，右邊 class1（舊的靜態坐姿）f0032。
  - `sitamb_class_cmp_classroom.jpg`：左邊 class0 f0082，右邊 class1 f0043。
- CC-C 看圖（只記錄，判定歸 BB）：
  - 博雅 101、霖澤 201 兩處，**class1 也一樣**：椅面前緣畫在大腿前面，大腿看起來陷進椅面。形狀、位置和 class0 幾乎一樣。
  - 所以這個不像是坐著會動（2acb）造成的，比較像椅子的高度或深度和坐姿本來就有。
  - class1 博雅那一位的右手垂在扶手外面、扶手下方，class0 是放在身上。這是兩種坐姿本來就不一樣。
