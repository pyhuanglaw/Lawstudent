# US-LONG-3D-1110 舊序章人物己自己的 3D 模型（LAWWW2 帳號 A，2026-11-10）

LAWWW 11-10 15:45 派（P3）：舊序章人物己在美國教室、會所原本用路人底模（`STORY.extraSpecUS(21)` 換膚色、髮色）。企劃 AA_80 5-2、AA_145 3-5（AA_328）：
香港的大學法律系三年級、21 歲、約 176 cm、偏瘦；短髮、單眼皮、眉毛濃；圓框眼鏡；深藍色運動外套；背包上掛一個小小的奶茶杯鑰匙圈；笑的時候只笑一邊（表情，這一版不做）。
**沒有立繪、沒有通過的參考圖**：這一版照文字做。角色美術 **LAWWW 驗收（D100a，取代 D59；BB 11-10 18:14 更正）**，BB 判功能（走、坐、轉身、穿模、配件跟著動）；之後有參考圖再照圖調。

- 底：開發分支 `a8d8b9f7c`（`git apply --check` 乾淨）。patch：`us_long_3d_1110.patch`（16 個檔案）。
- 狀態：待 LAWWW 接 → `READY_FOR_ART_REVIEW`（LAWWW 看遊戲截圖判外觀，D100a）。**遊戲畫面還沒有人看過**：要 CC 在使用者電腦拍（D131）；下面的圖都是 Blender 算圖，不是遊戲截圖。

## 做了什麼

| 檔案 | 內容 |
|---|---|
| `assets/models/char/second_ai/bl_us_long.vrm`（2.64 MB） | 人物。`tools/blender/char_second/long_ho.py`：路人生產線（`npc.py` 的 stage0／face／clothes／hair）換成他自己的參數。底模 VRoid CC0 樣本 Sakurada_Fumiriya；身高 1.76（量出來 175.9 cm）；黑色耳上短髮、側分、瀏海在眉毛上 1.5～2 cm；單眼皮（眼睛扁、眼尾微微往上）、濃而平的眉毛、臉偏瘦；深藍運動外套（敞開、沒有扣子）＋白 T（`npc_layered.py`）＋深灰長褲＋白球鞋。`vrm_finish2.py`（VRM_BASE=Sakurada_Fumiriya VRM_MALE=1，虹膜 #241c18）。 |
| `assets/models/char/second_ai/glasses_long.glb`（32 KB，1,348 面） | 圓框眼鏡：`glasses_long.py`（從柏翰的眼鏡腳本複製）：正圓直徑 4.6 cm、深咖啡色細膠框（線半徑 1.2 mm）；和柏翰的細金屬方框、芷若的淺色細圓框分得出來。鼻樑的起點改在圓框上（方框版本的 0.97 在圓外面，第一次算圖鼻樑和鏡框之間有縫）。 |
| `assets/models/char/second_ai/keychain_milktea.glb`（55 KB，1,990 面） | 奶茶杯鑰匙圈：`keychain_milktea.py`：4 cm 高的珍珠奶茶杯（黑珍珠一圈、奶茶色、上緣透白、圓頂杯蓋、粉紅粗吸管）＋兩節短鍊＋銀色鑰匙環。原點＝鑰匙環最上面、往 −y 垂下。 |
| `src/assets3d.js` | `char.us_long`（lazy、sex m、沒有 ambient／anon＝不會被抽去當路人）、`prop.glasses_long`、`prop.keychain_milktea`。 |
| `src/character3d.js` | `C.MODEL_PROPS['char.us_long']=[{name:'glasses',glb:'prop.glasses_long'},'backpack','keychain_milktea']`。 |
| `src/props3d.js` | `DEF.keychain_milktea`：掛 upperChest，扣在 `backpack()` 前袋的拉鍊頭（x 0.08、y −0.066、z 0.274），往外斜 0.15 rad（直直垂下杯子下半截會插進前袋幾公釐）。背包 `drop` 改了要一起移。 |
| `src/us_life3d.js` | `specOf` 的舊序章人物己（教室 `cast3d`、會所 `clubNPC` 都走這裡）加 `s.model='char.us_long'`，路人的穿搭留著當備用。`S.longModel()`：第一次要用時下載（loadOne 一次）；下載完以前 CHAR.build 建的備用人物藏起來，到了由 `GM.upgradeModels` 換上。**下載失敗**：`S._longFail`，之後的舊序章人物己用路人的樣子；已經在場、藏起來等的人（`wantModel==='char.us_long'`）露出來（`S.longReveal`，不會一直隱形）。`S.specOf` 開給測試。 |
| `tools/blender/char/h01_clothes.py` | 換成 LAWWW2 分支的版本（`953058e75`，沛珊第十七版加的 `cotton_texture`、`BOX_W`；預設不變）：`npc_layered.py` 用到 `cotton_texture`，開發分支的版本沒有（開發分支在分岔點以後沒改過這個檔）。 |
| `tools/blender/char_second/npc_layered.py` | 從 LAWWW2 分支帶過來（敞開外套＋T 恤；開發分支的 `npc.py` 已經會 import 它，但檔案只在我的分支）。 |
| `LICENSES.md` | 一列（CC0 改作）。 |
| `tests/us_long_model_unit.js` | 新測試（下面）。 |

不改：劇情、台詞、座位（`castPlan`）、其他有名字的人；`ZONE_ASSETS` 不變（人物不在區域建的時候載）。

## 測試

`node tests/us_long_model_unit.js`（Node，不需要瀏覽器）：
1. manifest：VRM、檔案在、身高 1.76、lazy、不是路人池；眼鏡、鑰匙圈的 GLB 在
2. CHAR.build 用 VRM；量出來身高 175.9 cm；配件有眼鏡（`prop.glasses_long`）、後背包、鑰匙圈
3. 眼鏡 GLB 換上；在兩眼前 6.8 cm、高差 −0.5 cm、左右 0.0 cm
4. 鑰匙圈 GLB 換上；在背後、杯子不插進前袋（逐點量：0；另外用射線檢查 834 個點都在前袋外面，最近 4.5 mm）；整串在背包的高度、寬度以內
5. （子行程，pg_harness）`USL.specOf` 的舊序章人物己要 `char.us_long`、下載一次；韓國同學不受影響
6. 下載失敗：之後不再要那個模型；藏起來的人露出來

**修改前（開發分支 a8d8b9f7c）：FAILED 7**（1 就停）。修改後 ALL PASS。

回歸（`regression.log`，打 patch 後的開發分支，14 個相關測試）：us_long_model、us_classroom_story、us_clubhouse_story、us_life、aa370_us、aa450_us、aa424_us_blank、us_jp_nextclass、badclip_bag、sit_task_wire、gym_hand_props、prop_restand、anon_pool、zone_prefetch——**全部 ALL PASS**。

## 圖（Blender EEVEE 算圖，不是遊戲畫面）

- `blender_face_v3.jpg`：正面、45°、側面、後上方（頭頂沒有露出頭皮）
- `blender_body_v3.jpg`：全身正面、45°、背面（T 字姿勢）
- `blender_hair_v1_v3.jpg`：頭髮第一版（瀏海到眉毛、兩側蓋住耳朵，像蘑菇頭）→ 第三版（耳上短髮）。第三版也把嘴角改平（第一版用 MALE 預設的嘴角往下，看起來悶悶不樂）
- `props_glasses_keychain.jpg`：眼鏡、鑰匙圈（Workbench 預覽）

## 還沒做到／要看的

- **遊戲畫面**：CC 在使用者電腦拍（美國教室舊序章人物己那一格：見過＝玩家右邊、沒見過＝正前方；會所自習室靠窗那張）。要看：眼鏡在不在臉上、鑰匙圈看不看得到、坐下時背包和鑰匙圈有沒有穿進椅背（和柏翰的背包同一個問題，沒有另外處理）。後腦頭頂在 Blender 從後面平視時有一撮反光的亮線（從後上方看是黑的、沒有縫；遊戲是卡通明暗，應該沒有，請順便看）。
- 外套是「深藍敞開外套」，沒有運動外套的拉鍊、側條；有參考圖以後再改。
- 「笑的時候只笑一邊」是表情，這一版沒做（VRM 的表情是共用的 joy）。
- 第一次出場：模型約 2.6 MB，下載完以前他是藏起來的（幾秒）；同一次遊戲之後就有了。
