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
