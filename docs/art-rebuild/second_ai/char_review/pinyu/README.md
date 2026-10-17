# ART-CH-PINYU 曾品妤（econ_pinyu）3D 人物（LAWWW2-C 2026-10-17；第五版；狀態 READY_FOR_ART_REVIEW → 等 BB 驗收，D59）

- **參考**：BB_131 通過的標準圖 `docs/story_planning/art_reference/pinyu.webp`（企劃線）：經濟系一年級、19 歲、158 cm；面無表情、偶爾翻白眼、難得大笑；黑色高丸子頭（有點亂）＋透得到額頭的空氣瀏海＋臉旁兩撮碎髮；灰色 oversize 連帽上衣（袖子蓋到手背）＋黑色寬直筒長褲＋灰白老爹鞋；手上常拿工程計算機、黑色保溫瓶（配件之後另外做）。
- **檔案**：`assets/models/char/second_ai/bl_econ_pinyu.vrm`（3.11 MB，VRM 0.x，`vrm_finish2.py` 處理過：縮貼圖、女生眼睛）。
- **腳本**：`tools/blender/char_second/pinyu.py`＋`pinyu_face.py`、`pinyu_clothes.py`、`pinyu_hair.py`；一次建好：
  `SP=<工作資料夾> LOOK_ROOT=<伺服器> VRM_MALE=0 EXTRA=--blchar bash tools/blender/char_second/char_build.sh pinyu v5 Darkness_Shibu 曾品妤 '#2a1e1a' char.classmate_xinci 1.58 '' face`
- **生產線**：VRoid CC0 樣本 Darkness Shibu（和芯慈、沛珊同一個樣本，臉的參數、髮型、衣服都不同）；頭髮從芯慈的低髮髻改成高丸子頭。

## 遊戲渲染器（LAWWW 的 test_charlook.html；不是遊戲內截圖，Playwright＋SwiftShader，不是真機）
![](look_sheet.webp)

全部：`look_face_front／q45／side`、`look_body_front／q45／back`、走路、坐下各角度；Blender 預覽 `blender_*`。

## 版本（自己退件的，都在遊戲渲染器看過）
- 第一版（`v1_look_sheet.webp`）：瀏海是一整片齊的鋸齒（像公主切）、丸子頭像一圈一圈疊起來的頭巾、帽 T 太短、褲腳張開像喇叭褲。
- 第二、三版（`v3_look_sheet.webp`）：瀏海加長、變細、透得到額頭；丸子頭反方向繞＋鬆開的幾圈；帽 T 加長到胯下；褲管跟著腿走（直筒）。臉旁碎髮在下巴旁邊折成鉤子、Z 字。
- 第四版：領口拉高時脖子的皮膚穿出領口——改回原來的高度。
- 第五版：臉旁碎髮從太陽穴經過耳朵前面直直垂到下巴。

## 八項（ART_SOP 3-2）
| 項目 | 結果 |
|---|---|
| 輪廓 | 高丸子頭（髮殼＋15 條纏繞的髮片，三條裡一條反方向、幾圈鬆開）、空氣瀏海（12＋2 撮）、臉旁碎髮（彈簧骨 3 節）；oversize 帽 T（落肩、羅紋下擺與袖口、放下來的帽子、兩條帽繩）、寬直筒長褲 |
| 材質 | MToon；衣服貼圖程式產生（棉 T 的平針、斜紋） |
| 比例 | 158 cm |
| 動作 | 待機、走路、坐下沒有看到穿模；**還沒測**：上下樓梯、跑步、轉身 |
| 效能 | VRM 3.11 MB |
| 還沒做／已知 | 計算機、保溫瓶（配件）；帽子側面看比參考圖厚一點；正面領口上方看得到一點點樣本脖子的接縫線；表情（翻白眼、大笑）靠遊戲的表情 |
