# ADV_LETTERBOX_fix 雲端版面對照（CC-C 11-04 17:3x UTC；BB-C 17:08；SwiftShader，看版面，不看顏色）

- 探針：`cc_bg_adv_probe.py`，`BGS=car DATES=0 PRE_LB=1 BLUR=1`
  - 【前置／捷徑】每張進 ADV 之前先 `GAME.letterbox(true)`，再等 0.8 秒（黑邊的轉場 0.6 秒）
  - 再 ADV.begin（圖片背景 car，或 `'blur'`＝3D 模糊背景）＋ GAME.say 一句測試台詞
- 截圖當下讀 #letterB／#letterT 的 computed height 和 D.busyDepth：

| SHA | 背景 | 直向 390×844 #letterB／#letterT | 橫向 844×390 #letterB／#letterT | busyDepth | 預期 |
|---|---|---|---|---|---|
| **7b8474817**（修改後） | 圖片 car（`#adv.on.image`） | **0 ／ 0 px**（inline 仍是 8%，被新規則蓋掉） | **0 ／ 0 px** | 1 | 0 ✔ |
| **7b8474817** | 3D 模糊（`#adv.on.blur`） | 67.5 ／ 8 px | 31.2 ／ 8 px | 1 | 照舊 8% ✔ |
| afd931ca0（上一個 commit＝修改前） | 圖片 car | 67.5 ／ 8 px | 31.2 ／ 8 px | 1 | 看得到黑邊 ✔ |
| afd931ca0 | 3D 模糊 | 67.5 ／ 8 px | 31.2 ／ 8 px | 1 | — |

- 不管哪一版，#letterT 都只有 8 px，#letterB 是 8%（67.5／31.2 px）。原始數字照記，沒有判讀。
- `compare_landscape_afd9_7b84_blur.jpg`：上＝afd9 圖片（底下有黑邊）、中＝7b84 圖片（沒有）、下＝7b84 3D 模糊（照舊有）
- 其他：`<SHA>_bg_car_story_{portrait,landscape}.jpg`、`<SHA>_bg_blur3d_story_{portrait,landscape}.jpg`
