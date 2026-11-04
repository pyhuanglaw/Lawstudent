# SITAMB 雲端證據（CC-C 11-04 17:2x UTC；BB-C 17:10 要的；**SwiftShader，看有沒有東西，不看顏色**）

## ⑧ 博思 101 的替身頭上有深色方塊：是不是 2acb34afd 帶進來的

- 探針：`docs/story_planning/test_tools/cc/cc_sitamb_probe_d8.py`
- 時間：博思 101（boya），day 7＝2025-09-23 國文上課中 09:30；主迴圈暫停、時刻固定、手動畫一幀；CC_SEED 1104
- 三個 SHA 都用同一個鏡頭：講台那一端上方 (−11.1, 4.8, 5.15) 往後排 (−11.1, 1.1, −1.85)。三張的 calls 219、tris 514,978 完全一樣。

| 檔案 | SHA | 說明 |
|---|---|---|
| `d8_d382_back.jpg` | d3828452a（含 2acb34afd） | 原樣 |
| `d8_d382_nositamb_back.jpg` | d3828452a `?nositamb` | 原樣 |
| `d8_e2ff_back.jpg` | e2ff17c40（2acb34afd 的第一個父 commit，沒有 2acb；CHAR.sitAmbFidget 不存在） | 原樣 |
| `d8_d382_back_nodesk.jpg` | d3828452a | 【捷徑】把桌上小物 `desk:*` 藏起來（診斷用，不是遊戲畫面） |
| `d8_zoom_d382_nodesk_e2ff.jpg` | — | 放大後排：上＝d3828、中＝d3828 藏桌上小物、下＝e2ff |

- **三張都有方塊**，例如第一排穿白衣的替身、最後一排右邊穿白衣的替身頭上的深色塊。
- 把 `desk:*` 藏起來方塊還在，所以它不是筆電這類桌上小物，是替身模型本身。
- 替身是什麼：
  - 模型：`prop.seated_figures`（LAWWW2 的 `assets/models/env/second_ai/seated_figures.glb`）。每種外型一個 InstancedMesh，掛在 `seated_figures:7:chinese_y1:am` 群組，群組放在那一層的 L0 群組底下（`classes3d.js` S.figPlace）。
  - 這一堂 17 個替身全部是遠處版本 `fig_npc_*_c0_lod1`：400 面，材質 `seated_fig`，白色加貼圖。近處版本 2400 面，畫面上 0 個。
  - 完整的 VRM 人物 16 人。
  - 桌上小物 `desk:lset_*_lod1`（desk_props.glb）：laptop 2、phone 6、write 5、book 2、code 2。
  - 完整清單在 `d8_d382_figures.json`。
- 有試著把玩家移到替身中間（7 m 內應該換成近處版本），但替身照舊是 `_lod1`。所以**沒有確認**近處版本有沒有方塊，也沒確認方塊是不是遠處版本的頭髮。交 LAWWW 查。

## ④ 兩點半卡座：背和靠背之間空了大約一個抱枕
- `d4_cafe_sofa_amb.jpg`（原樣）和 `d4_cafe_sofa_nositamb.jpg`（`?nositamb`）：兩張一樣，所以是座位位置的問題，不是 sitAmb 造成的。
- 來源：SITAMB 子代理雲端那一輪，048b4c898（和 d3828 的 src 相同），cafe 2025-09-20 15:00，第 20 格（換坐姿 1.5 秒）。

## ⑥ 林家乾麵 12:15 吃飯的人桌上沒有碗
- `d6_noodle_no_bowl.jpg`：2025-09-25 12:15，act＝eat2，SEATACT 的 set 是 null。桌上只有筷筒、醬料、面紙。
- 來源：SITAMB 子代理雲端那一輪（048b4c898）。

## ① 同桌聊天湊不成一組
- 備份裡只有 afar 2025-09-25 15:00 這一輪：坐著 9 人、聊天 4、互相看著 4、SEATACT pairs 2（原樣、`?nositamb` 都一樣）。
- 子代理說 afar 9/18 15:00「有一個人的 act 是 chat，但 pairs 0、互相看著 0」：那是它比較早的一輪，**那一輪的 log 不在備份裡**，數字只有它的回報。
