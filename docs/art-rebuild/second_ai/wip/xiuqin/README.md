# 第二版（BB 11-03 16:32 的意見）——READY_FOR_ART_REVIEW

圖：`xiuqin_v2_lookdev_a.jpg`（臉正面、斜、側；身體正面、斜、背、走路、沒圍裙）、`xiuqin_v2_lookdev_b.jpg`（邊拉直以後的圍裙：臉、正面、斜、背面的蝴蝶結）。都是遊戲渲染器 test_charlook 的畫面，不是遊戲內截圖。

| BB 的點 | 第二版 |
|---|---|
| 1. 臉近看像國中生 | 眼睛小一點、眼尾往下、眉毛低、睫毛少、臉長一點、腮紅拿掉；眼下淡淡的陰影＋法令紋（`h01_face.py` 新參數 `AGE_K`，預設 0，其他人物不受影響）；灰髮挑染（`npc_hair_f.py` 的 `grey`，22% 的髮絲換淺灰）；老花眼鏡＋鏡鍊（`glasses_xiuqin.glb`：酒紅褐色扁圓角方框、鏡腳尾端垂下細金鍊，在脖子後面繞成 U） |
| 2. 瀏海有橫向條紋 | 原因是側分瀏海的髮片根部疊在一起。改成近中分（part −4）、不留瀏海，額頭露出來——也比較像這個年紀 |
| 3. 圍裙像硬紙板 | 不用 props3d 的圍裙了：`npc_apron.py` 從她的衣服網格挑出朝前的面做成圍裙（保留骨架權重，跟著胸口、長裙動）；胸前那片窄、腰以下寬、邊緣拉直；掛脖子的帶子、腰帶、背後的蝴蝶結（兩個圈＋兩條垂下來）；亞麻米色 #d6c9b0 一帶 |

## 接法（改了：兩個 VRM，不用配件圍裙）
```js
'char.xiuqin':       {url:'assets/models/char/second_ai/bl_xiuqin.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.58,lazy:true,sex:'f',source:'…秀琴姨',license:'CC0'},
'char.xiuqin_apron': {url:'assets/models/char/second_ai/bl_xiuqin_apron.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.58,lazy:true,sex:'f',source:'…秀琴姨（圍裙）',license:'CC0'},
// C.MODEL_PROPS（兩個都要）：老花眼鏡
'char.xiuqin':[{name:'glasses',glb:'prop.glasses_xiuqin'}], 'char.xiuqin_apron':[{name:'glasses',glb:'prop.glasses_xiuqin'}],
'prop.glasses_xiuqin':{url:'assets/models/char/second_ai/glasses_xiuqin.glb',type:'building',lazy:true,…},
```
- 事件 9（萬才館大廳法服）用 `char.xiuqin`；第一次去語彤家、事件 16b（在家／茶屋）用 `char.xiuqin_apron`（`char3d.model` 照場景換，或在那兩場 spawn 時指定）。
- 檔案：`bl_xiuqin.vrm` 2.61 MB、`bl_xiuqin_apron.vrm` 2.79 MB、`glasses_xiuqin.glb` 38 KB（1,434 三角形）。
- 還沒做／已知：臉的五官形狀還是 VRoid 的；遊戲內截圖要等接進去。

---

# 秀琴姨（語彤的阿姨、一盞茶屋老闆娘）3D——LAWWW2 11-03（LAWWW 15:53 P2，AA：中年女性路人底模＋圍裙，不用精修）

- VRM：`assets/models/char/second_ai/bl_xiuqin.vrm`（2.66 MB）。做法：`tools/blender/char_second/npc.py` 變體 `xiuqin`（VRoid CC0 樣本 Darkness_Shibu）。
  - 臉：眼睛小一點、眉毛平、臉和下巴寬一點、腮紅少。
  - 頭髮：黑灰色、到下巴、燙過的捲短髮（`JP_STYLE` side＋wave 0.016）。
  - 衣服：深靛藍針織衫、深灰長裙、棕樂福鞋。
  - 身高 1.58。
  - 重做：`NPC=xiuqin /opt/blenv/bin/python tools/blender/char_second/npc.py -- out.vrm --stages stage0,face,clothes,hair`，再 `VRM_BASE=Darkness_Shibu VRM_MALE=0 NPC_SMALL=1 python3 tools/blender/char_second/vrm_finish2.py out.vrm bl.vrm 秀琴姨 '#2a1e16'`，最後 `python3 tools/char_strip_hair_matcap.py`。
- 圖：`xiuqin_lookdev.jpg`（遊戲渲染器 test_charlook：臉、沒圍裙、有圍裙正面／斜側）、`xiuqin_blender.jpg`（Blender 算圖）。
  - 這不是遊戲內截圖；接進遊戲後請 LAWWW 拍給 BB。

## 給 LAWWW 的接法
```js
// src/assets3d.js（ASSETS.manifest；不是路人池：沒有 ambient／anon）
'char.xiuqin': {url:'assets/models/char/second_ai/bl_xiuqin.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.58,lazy:true,sex:'f',source:'LAWWW2 Blender 改作 VRoid CC0 樣本「Darkness_Shibu」（npc.py 變體 xiuqin）：秀琴姨——黑灰燙捲短髮、深靛藍針織衫、深灰長裙、棕樂福鞋',license:'CC0'},
// src/character3d.js C.MODEL_PROPS：圍裙預設藏著（props3d 的 apron hidden:true）
'char.xiuqin':[{name:'apron',color:'#a8916c'}],
// src/data/characters.js 她那一筆
char3d:{model:'char.xiuqin', height:1.58},
```
- 圍裙：在家、在一盞茶屋（第一次去語彤家、事件 16b）用 `CHAR.setProp(人物, 'apron', true)`；事件 9 陪她去法服（萬才館大廳）不穿。
- 已知缺點：
  - 臉是 VRoid 的年輕臉型，只調了比例，沒有皺紋、法令紋。遠看靠頭髮和衣服看得出是中年人，近看還是偏年輕。
  - 圍裙在淺色燈光下偏黃。
- 驗收：角色美術給 BB（D59）。

## 第三版（2026-11-03 17:3x，BB 17:19 的意見）

| BB 的意見 | 改了什麼 |
|---|---|
| 頭髮一條一條的直條紋太密、像假髮 | 白頭髮 0.22 → 0.07、混色 0.55～0.9 → 0.3～0.5；髮絲貼圖每一區沿橫向（跨髮絲）做 9 px 平均、和原圖 65% 混合（`npc_hair_f.py` 的 `P['soft']`）＝保留髮束明暗、去掉細紋；髮尾波浪 0.016 → 0.006 |
| 皮膚太白太亮 | 皮膚乘 (0.90, 0.84, 0.78)：暗一點、偏暖（`npc.py` 的 `skin_tint`，4 個材質） |
| 法令紋、眼下陰影加深一級 | `h01_face.py` 的 `AGE_K` 1.0 → 1.6 |
| 圍裙 OK、VRoid 五官不動 | 沒動 |

- 檔案、key 都和第二版一樣：`char.xiuqin`（bl_xiuqin.vrm，2.59 MB）、`char.xiuqin_apron`（bl_xiuqin_apron.vrm，2.77 MB）；眼鏡 `prop.glasses_xiuqin` 沒變。
- 截圖 `v3/look_v3.jpg`（遊戲渲染器 lookdev）：左一＝第二版臉、左二～三＝第三版臉正面／45°、右二～一＝第三版全身正面／背面（背後的蝴蝶結）。
- 沒做：實際遊戲區域（一盞茶屋／溫州街）裡的截圖；手機實機。
