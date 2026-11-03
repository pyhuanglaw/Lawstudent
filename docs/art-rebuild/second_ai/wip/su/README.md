# 蘇姨（一盞茶屋的主人，wz_su）正式 3D——XQ-SU-3D（LAWWW 11-03 17:23）

狀態：`READY_FOR_ART_REVIEW`。角色美術照 D100a，由 BB 給意見、LAWWW 決定。這次只看了遊戲渲染器的 lookdev，**還沒進一盞茶屋區域看過，也還沒在手機實機上看過**。

## 設定根據
- AA_164 第 2-3 節：一盞茶屋是整修過的日式老宿舍，委託蘇姨經營。她六十幾歲、話很少。
- LAWWW 的要求：參考秀琴姨的做法，但看得出是不同的人。

## 和秀琴姨怎麼分（`su_vs_xiuqin.jpg`：左二＝45° 臉，右二＝全身）
| | 蘇姨 | 秀琴姨 |
|---|---|---|
| 底模 | VRoid CC0 `Victoria_Rubin`（臉型、身形不同） | `Darkness_Shibu` |
| 年紀 | 六十幾：`AGE_K` 2.6（法令紋、眼下陰影較深）、眼睛細長、唇色淡 | 五十上下：`AGE_K` 1.6 |
| 頭髮 | 灰白、整頭往後梳、後頸上方低髮髻、沒有瀏海；臉旁兩綹細碎髮（芯慈的低髮髻產生器 `x_xinci_hair.py`，加了開關） | 黑灰、中分、下巴以上的短髮 |
| 眼鏡 | 沒有 | 酒紅棕老花眼鏡 |
| 衣服 | 燕麥白亞麻上衣＋炭灰寬褲＋深棕便鞋 | 深靛藍針織衫＋深灰長裙＋棕樂福鞋 |
| 圍裙 | 靛藍的腰間前掛（前掛け：只到腰，背後打結） | 米色、有胸片的亞麻圍裙 |
| 身高 | 1.61 m | 1.58 m |

## 檔案
- `assets/models/char/second_ai/bl_su.vrm`（2.71 MB，不穿前掛）
- `assets/models/char/second_ai/bl_su_apron.vrm`（2.84 MB，有前掛：在店裡用這個）
- 建議 manifest（`src/assets3d.js`，照 `char.xiuqin` 的寫法）：
  `'char.su': {url:'assets/models/char/second_ai/bl_su.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.61,lazy:true,sex:'f',source:'LAWWW2 Blender 改作 VRoid CC0 樣本（Victoria_Rubin）',license:'CC0 改作'}`
  `'char.su_apron'` 同上，url 換成 `bl_su_apron.vrm`。
  一盞茶屋的 `S.CLERK.wz_teahouse`（現在是 `char.npc_f2`＋圍裙道具）改成 `char.su_apron`，原本的圍裙道具拿掉。

## 做法（重建：`NPC=su /opt/blenv/bin/python tools/blender/char_second/npc.py -- out.vrm --stages stage0,face,clothes,hair[,apron]`，接著跑 `vrm_finish2.py`（`VRM_BASE=Victoria_Rubin`）和 `char_strip_hair_matcap.py`）
- `npc.py` 的變體 `su`：`hair_mod='bun'` 改用 `x_xinci_hair.apply`（低髮髻）。`x_xinci_hair.OPT` 的新開關：`bang`（False＝沒有瀏海）、`side_w`、`grey`／`grey_k`（白頭髮）、`soft`（髮絲細紋柔化）、`bun_k`、`name`、`tmpl`。預設值就是芯慈原本的做法，芯慈的模型不受影響。
  另外修了一個舊問題：`_strand_color` 的 `base=BASE` 原本在定義函式時就固定成芯慈的棕色，換髮色時有一項還是棕色。現在改成執行時才讀 `BASE`，芯慈的值不變。
- `npc_apron.py`：`bib=False` 改做腰間前掛（`_panel`）。寬褲兩腿中間沒有布，照衣服網格挑面會裂成兩片，所以另外做一片 18×22 格的布：上緣貼腰，腰下 45% 以下平平垂下，有幾道淺褶。權重：上緣綁 Hips，往下左右兩半各自加上同側大腿（最多 0.75），走路時前面那條腿會把那半邊往前帶。背後的腰帶結照秀琴姨的做法，沒有掛脖子的帶子。

## 截圖
- `look_v1.jpg`（遊戲渲染器 lookdev）：臉正面、45°、全身正面、背面、走路正面、走路側面。
- 第一輪（沒交）前掛太寬，下襬張開 44 cm，從背後看兩側露出來；改成 0.150＋0.035 之後才交。

## 還沒做／已知問題
- 寬褲右小腿有一條淺色的接縫（褲子本身，`npc_layered`；不是前掛造成的）。
- 坐姿（read／sit）還沒看。她在茶屋多半站著（打工的站位 `work.*.boss`）。
