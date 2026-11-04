# NPC-ANIM-LOOPS-1104：坐在桌前做事的七個循環動作

LAWWW2-C 2026-11-04。狀態：**MODEL_READY**。新增兩個檔案，**遊戲要接線（LAWWW-C）**：

- 動作片段 `assets/models/char/second_ai/ual_sit_tasks.glb`（＋`.json`）
- 手上配件 `assets/models/char/second_ai/hand_props.glb`（＋`.json`）

還沒在瀏覽器看過。Node 測試用遊戲自己的換算程式，量過人物的手在哪裡。

## 派工

LAWWW-C：「打字（加觸控板版本）、寫字、滑手機、翻書頁、喝飲料（含杯子配件）、吃飯，交 GLB 片段和要動的骨頭」。

## 交什麼

| 片段（`_F_Loop`／`_M_Loop` 各一） | 做什麼 | 手上配件 | 桌上（SEATACT） |
|---|---|---|---|
| `Sit_Type` | 兩手放在筆電上打字，手指輪流敲；看螢幕 | — | `tset_laptop` |
| `Sit_TypePad` | 打字；每 5 秒右手去觸控板一次（1.6～3.4 秒） | — | `tset_laptop` |
| `Sit_Write` | 右手往右寫一行七個字，最後 0.8 秒回到行頭；左手壓著筆記本 | `hand_pen` | `tset_notes`（桌上那支筆要藏） |
| `Sit_Phone` | 右手拿手機，在桌子前緣上面；拇指每 5 秒往上滑 3 次；左手放桌上 | `hand_phone` | — |
| `Sit_Page` | 兩手放在攤開的書上；每 5 秒右手翻一頁（1.7～3.0 秒） | — | `tset_book` |
| `Sit_Drink` | 右手握杯放在桌上；每 5 秒喝一口（1.7～2.9 秒杯緣碰到嘴） | `hand_cup` | 桌上那個杯子要藏 |
| `Sit_Eat` | 右手從碗上面送到嘴前面，每 2.5 秒一口；左手放桌上 | （筷子還沒做） | （桌上還沒有碗盤） |

- 每個片段 5 秒、頭尾接得起來（UAL 坐姿循環剛好 3 圈）。
- **兩種身材各一份**：
  - `_F`：女生 VRoid 骨架（`vroid_npc_f1`；所有 `nf`、女主角）。
  - `_M`：男生（`vroid_npc_m1`；`nm`、yuting、zhe…）。
  - 怎麼分：右前臂長度（`RightHand` 的位置）0.214＝女生、0.249＝男生。
  - 為什麼要兩份：同一張 0.75 m 的桌子，女生坐下以後肩膀只比桌面高 11 cm，男生高 22 cm（VRoid 女生的身體比較短）。一份片段兩邊都對不準，手會差 5 cm。
- 格式和 `ual_sit_clips.glb` 一樣：只有骨架節點和旋轉軌道（UAL 骨架的名字），遊戲現在的 `ambClip`／`UAL_BONE` 直接讀得到。
  - 14 個片段，426 KB。
  - 每個片段的 `extras`：`desc`、`loop`、`kind`、`body`、`ref`（參考的桌子）。

## 要動的骨頭

| 骨頭 | 來源 |
|---|---|
| `spine_01`～`03`、`neck_01`、`Head` | 坐姿循環（`Sitting_Idle_Loop`：呼吸、身體前後）；`spine_02`、`spine_03` 再往前傾，`neck_01`、`Head` 再低頭（喝的時候抬頭） |
| `clavicle_l`／`_r` | 照坐姿循環（沒改） |
| `upperarm`、`lowerarm`、`hand`（兩手） | 這次擺的 |
| 手指 `thumb`／`index`／`middle`／`ring`／`pinky` 的 `01`～`03`（兩手 30 根） | 這次擺的 |
| `pelvis`、腿 | 片段裡是坐姿循環的值；遊戲本來就不吃（骨盆、腿照舊 `SIT_VRM`） |

接線時要注意：遊戲現在只有「手上沒東西」才讓手臂吃片段（`armsFree`）。這七個片段的手臂一定要吃片段，肩膀到手指（`grp 2`）全部都要。

## 怎麼做的（`tools/anim/sit_task_loops.py`，numpy，不用 Blender）

1. **在遊戲人物真正的骨架上擺**：
   - 讀 VRoid 的骨架，換成 UAL 的名字和方向，縮到遊戲的身高（女 1.62、男 1.74，`char.npc_f1`／`npc_m1` 的 height）。
   - 坐下的高度照遊戲：往下 0.47×身高/1.75。
2. **參考的桌子**：
   - 總圖自習桌：桌高 0.75 m，桌緣離座位 0.30 m（`library3d.js` 的 studyTable）。
   - 桌上的東西照 `desk_props.glb` 的尺寸：筆電中心離桌緣 0.112 m、杯子直徑 9.4 cm、高 12.3 cm…
3. **手臂**：
   - 兩段式 IK。手肘只繞真的關節彎；上臂自己的扭轉照手肘要朝哪裡決定。
   - 每個動作指定手心和手指的方向：打字手心朝下、握杯虎口朝上、滑手機手心朝上…
   - 翻手心的轉，65% 給前臂、35% 給手腕。VRoid 沒有扭轉骨，全部放在手腕會扭成麻花。
   - 手腕超過人做得到的範圍（往手心 60°、往手背 50°、往小指 30°、往拇指 20°），就把手轉回範圍內，再算一次手臂。
4. **寫回 UAL 骨架**：每根骨頭的「世界旋轉差」寫回 UAL 骨架的片段。遊戲換算回來，就是第 1 步擺好的樣子（下面的測試證明了）。

### 關節範圍（套到 VRoid 骨架上量）

- 手肘彎 66°～117°。
- 前臂扭最多 56°，手腕扭最多 29°。
- 手腕往手心最多 55°、往手背最多 24°；往小指最多 30°。

## 手上配件 `hand_props.glb`

- 三個網格，共 350 面、81 KB：
  - `hand_cup`：紙杯，和桌上的 `item_cup` 一樣。
  - `hand_phone`：`item_phone_on`。
  - `hand_pen`：`item_pen`。
  - 貼圖用 `desk_props` 同一張，遊戲的貼圖去重會共用。
- **已經擺在右手骨頭的座標裡**（VRoid `J_Bip_R_Hand`；PROPS 的 `bone:'rightHand'`）：
  - 掛上去位置 0、不轉。
  - 照 `boneGlb` 的做法，用名字挑節點：`c.scene.getObjectByName('hand_cup').clone(true)`。
- 一次只開一個：喝飲料開 `hand_cup`、滑手機開 `hand_phone`、寫字開 `hand_pen`。其他時候藏起來。
- 照女生的手算。男生的手大 4%，配件離手心差 2～3 mm，沒有另外做。
- 喝的那一下（2.35 秒），靠嘴那一邊的杯緣離嘴：女生 1.0 cm、男生 0.5 cm（`ual_sit_tasks.json` 的 `expect.sip`）。

## 預覽

Blender Workbench 拍的，不是遊戲畫面：VRoid 人物照遊戲的坐法，配參考的桌子，配件掛在右手骨頭上。

頭髮在 Blender 裡沒有彈簧骨，所以往後翹；遊戲裡會垂下來。

![女生（vroid_npc_f1）](npc_anim_loops_F.jpg)

![男生（vroid_npc_m1）](npc_anim_loops_M.jpg)

工具：`tools/anim/preview_vrm_clip.py`（`--props` 掛配件）、`tools/anim/sit_task_props.py`（產生配件）。

## 測試

`tests/sit_task_loops_unit.js`（Node，不是瀏覽器）在開發分支 `effb5d9b3` 加上這兩個檔案跑：**ALL PASS**。

- 做法：把 `char.ual_sit_clips` 換成這個檔，用遊戲自己的 `ambClip`／`sitAmbient` 讓 `char.npc_f1`、`char.npc_m1` 坐著播。測試時把每個人自己的坐姿偏移和小動作關掉。
- ① 14 個片段都載得到。
- ② 打字、喝飲料、寫字在 0、1、2.35 秒：兩手手腕、右手中指根和 Python 算的位置差 **≤ 0.1 cm**（門檻 2.5 cm）。
- ③ 打字時手腕在桌面上 5.0～5.3 cm。喝飲料時手腕抬高 12.5 cm（女）、21.8 cm（男），杯緣碰到嘴。

## 給 LAWWW-C（接線）

拿檔案：

```
git checkout 2962616ac -- assets/models/char/second_ai/ual_sit_tasks.glb assets/models/char/second_ai/ual_sit_tasks.json assets/models/char/second_ai/hand_props.glb assets/models/char/second_ai/hand_props.json tests/sit_task_loops_unit.js
```

1. `ASSETS.manifest` 加 `char.ual_sit_tasks`（lazy）、`prop.hand_props`。
2. SEATACT 決定好要做 laptop／notes／textbook／phone 的路人：
   - 片段名字＝`Sit_` + 動作 + `_F`／`_M` + `_Loop`。
   - 速度 1。坐姿循環的 `baseRate` 0.5 是給 1.7 秒那個循環的，這裡已經是 5 秒。
   - 手臂吃片段（見上面「要動的骨頭」）。
3. 配件：開關跟著片段走。桌上同一件東西（杯子、筆）這時候要藏起來。
4. **桌子不是參考值的座位**：桌子高或低多少，手就跟著差多少。
   - 建議：桌高差超過 3 cm 的位子（吧台、矮桌）先不用這些片段，照舊。
   - 要的話我可以照那幾種桌子再出一份。只要改 `REF` 一行重跑，約 1 分鐘。

## 還沒做／已知的不足

- **女生坐在 0.75 m 的桌子前，桌子在胸口**：肩膀只比桌面高 11 cm，手要往上抬，看起來像坐在太低的椅子上。
  - 原因是遊戲的坐姿高度（−0.47×身高/1.75）配上 VRoid 女生比較短的身體。片段已經照這個高度擺手了。
  - 要改是改坐姿高度（LAWWW-C 的程式）。改了以後，`REF`／坐下的高度改一下、片段重跑就好。
- **吃飯**：沒有筷子、碗，桌上也還沒有吃的（SEATACT 的 `S.FOOD`）。手是握筷子的手形，送到嘴前面約 10 cm。
- 打字、寫字的手指只是彎曲的節奏，不是真的按到某個鍵、寫出字。
- 預覽只看了 `vroid_npc_f1`、`vroid_npc_m1`。`bl_npc_*` 的骨架長度一樣，但沒有一個一個看。
- 還沒在瀏覽器看過（D131）。美術要 BB 判（D120／D128），我不標 ART_APPROVED。
