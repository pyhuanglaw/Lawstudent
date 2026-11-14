# glb_coplanar.py：套用 EXT_mesh_gpu_instancing（第③群幫手 2026-11-14；LAWWW-C 01:43 同意，條件：單獨一包、全部前後對照、變多逐筆列、加小測）

## 改了什麼
- `tools/glb_coplanar.py`：有 `EXT_mesh_gpu_instancing` 的節點，把每一份的 TRANSLATION／ROTATION／SCALE 套上去，一份一份算三角形（物件名 `<名字>#<第幾份>`）。
  - 以前：只拿原型放在節點的位置（通常是原點）。不同原型在原點互相比 → **假疊面**（大口二樓四疊課本、筆電原型的底面都在 y=0）；同一個原型的每一份沒有展開 → 兩份放在同一個位置的**真疊面抓不到**。
- `tests/glb_coplanar_instancing_check.py`（新，`python3` 跑，不需要 Blender）：程式產生一顆小 GLB 驗三件事——①兩個原型各一份、相距 3 m＝0 m²；②同一個原型兩份放在同一個位置＝1 m²；③沒有 instancing 的兩個節點放在同一個位置照舊＝1 m²。舊工具 ①② FAIL（1.000／0.000），新工具 ALL PASS。
- `tests/place_gate_coplanar.json`：用新工具 `node tests/place_gate_unit.js --coplanar`（**沒有** `--allow-grow`）重算；只准變少的檢查過了。

## 全部重算的前後對照（開發分支 2da495e693，51 個模型）
**變多：0 個。** 變少 8 個（其他 43 個沒有 instancing 或面積一樣）：

| 模型 | 牆 改前 | 牆 改後 | 一定會閃 改前 | 一定會閃 改後 | 改後最大的一對 |
|---|---|---|---|---|---|
| `bb_support/bike.glb` | 10.9 | 2.91 | 17.45 | 5.35 | WALL_left_wall_wall×WALL_back_wall_wall 0.432 m² @[-5.1,2.4,-1.96] |
| `bb_support/corner.glb` | 11.87 | 10.81 | 18.63 | 13.31 | WALL_left_cr_wood×WALL_left_cr_wood 4.116 m² @[-3.45,0.64,4.32] |
| `bb_support/dabu.glb` | 34.4 | 32.98 | 34.54 | 33.11 | WALL_back_back_vc×WALL_back_back_paint 5.11 m² @[0.04,0.58,-5.88] |
| `bb_support/dakou_2f.glb` | 0.34 | 0.34 | 6.3 | 2.29 | WALL_left_frame×WALL_left_frame 0.153 m² @[-5.99,3.6,5.33] |
| `bb_support/haopai.glb` | 31.7 | 7.97 | 35.44 | 11.68 | WALL_right_wall_wall×WALL_right_hp_vc 2.202 m² @[2.08,1.19,2.31] |
| `bb_support/tongxian.glb` | 32.43 | 1.8 | 38.08 | 7.45 | WALL_back_plaster×WALL_back_metal 0.364 m² @[-2.13,0.87,-5.26] |
| `bb_support/xinsheng_sports.glb` | 2.12 | 2.12 | 48.06 | 6.36 | WALL_left_L1_xs_goods×WALL_left_L1_xs_goods 1.2 m² @[-8.2,4.67,0.23] |
| `gg_xianguo_interior.glb` | 0 | 0 | 13.04 | 10.19 |  |

變少的都是 instancing 原型在原點互相比的假疊面（吉他、球拍、衣服、鞋、水果……）。改後最大的那幾對是真的（同一個網格裡的牆、木作），例如大步 `WALL_back_back_vc×WALL_back_back_paint 5.11 m²`（大步原本就有，不是這次 CC0 加的；之後可以另外修）。
