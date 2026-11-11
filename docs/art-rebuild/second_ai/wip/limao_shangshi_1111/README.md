# LIMAO-SHANGSHI-3D-1111 禮貌生財上師的 3D 人物 第 1 版（LAWWW2 帳號 A，2026-11-11）

LAWWW 11-10 23:15 派（X332；使用者 11-10 23:4x 的人物圖：dev `docs/handoff/user_specs/limao_ref/shangshi_character.png`）。角色美術 **LAWWW 驗**（D100a）。
- patch：`limao_shangshi_v1.patch`（9 個檔；在 dev `57181feb2` 上做的，只動 assets3d.js、character3d.js、LICENSES.md 各一兩行＋新檔，較新的開發分支用 `git apply --3way`）。
- 圖：`blender_v4_face_body.jpg`（Blender EEVEE，不是遊戲畫面；T 字姿勢；這張沒有戴眼鏡——眼鏡是遊戲裡掛的配件）。

## 做了什麼
| 檔案 | 內容 |
|---|---|
| `assets/models/char/second_ai/bl_limao_shangshi.vrm`（2.84 MB） | `tools/blender/char_second/limao_shangshi.py`：路人生產線（npc.py＋npc_layered，同何俊朗）換成他的參數。底模 Sakurada_Fumiriya；身高 1.69（含帽子量到 166.4 cm）；灰白頭髮（帽子底下的頭髮拿掉，兩側和後面露出來）、灰白眉毛、眼睛細長、微駝、有一點肚子；深咖啡外套（敞開、兩顆扣）＋墨綠毛衣＋灰褐長褲＋深咖啡皮鞋。**做在模型裡、跟著骨頭動的配件**：咖啡色鴨舌帽（帽身＋帽舌）、灰白八字鬍、山羊鬍、棕藍格紋長圍巾（脖子一圈＋兩條垂到腰下＋流蘇） |
| `assets/models/char/second_ai/glasses_shangshi.glb`（32 KB） | 圓框細金屬眼鏡（古銅色、線半徑 0.8 mm）：`glasses_shangshi.py`（從何俊朗的複製） |
| `src/assets3d.js` | `char.limao_shangshi`（lazy、sex m、不進路人池）、`prop.glasses_shangshi` |
| `src/character3d.js` | `C.MODEL_PROPS['char.limao_shangshi']=[{name:'glasses',glb:'prop.glasses_shangshi'}]` |
| `LICENSES.md` | 一列（VRoid 樣本 CC0 改作＋本作） |
| `tests/limao_shangshi_model_unit.js` | manifest、模型裡有帽子鬍子圍巾、CHAR.build 用 VRM、身高、配件只有眼鏡、眼鏡在兩眼前 6.8 cm／高差 −0.5 cm／置中——ALL PASS。修改前：1 就 FAIL |

回歸（打 patch 後）：limao_shangshi_model、us_long_model、anon_pool、zone_prefetch、badclip_bag、prop_restand ALL PASS。**沒有跑全部測試**（這一包只加新資產和兩行登記）；LAWWW 整合時如果要，我再跑。

## 給 LAWWW
- 用法：`spec.model='char.limao_shangshi'`（身高 1.69）。街上 `LM.masterSeat()`、店裡 `zone.shopClerk`，生出來以後設 `LM.masterNpc`——**NPC 我沒有放**（你的 limao3d.js 在接，我不重複做；要我放請說）。
- 模型 lazy：第一次出場前要 `ASSETS.loadOne`（何俊朗那一套 `S.longModel()` 的做法可以照用）。

## 和人物圖差在哪（第 1 版，請驗）
- **臉還是年輕人的臉**：底模是動畫風的年輕臉，沒有皺紋、法令紋、眼袋；只靠灰白髮、鬍子、帽子、眼鏡和體態表現年紀。要更像六十多歲得改臉的貼圖（畫皺紋），下一版做。
- 頭髮是直的短髮，圖上是捲的；帽子偏圓（像小圓帽），圖上的鴨舌帽比較扁、前面壓得更低。
- 外套是「敞開的深咖啡外套」，沒有西裝領、燈芯絨的直條紋；毛衣是圓領（圖是 V 領＋米色襯衫領）。
- 圍巾的格紋是簡化的；垂下來的兩條貼著身體，不會飄。
- 圖上的姿勢是雙手插口袋、微笑：姿勢和表情遊戲裡另外給，模型沒有做。
- 坐下的時候圍巾下半段和大腿、桌子會不會穿模，要看遊戲。
