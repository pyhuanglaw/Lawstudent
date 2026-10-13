"""bike_wt：VISUAL_REVIEW 第 19 節（⑫ 騎車用的腳踏車）：尺寸表、節點與樞紐、規格、Blender 渲染、缺點。
用法：python3 docs/art-rebuild/second_ai/drafts/bike_fill.py <渲染圖資料夾>"""
import json, os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
src = sys.argv[1]
names = ['side', 'q45', 'front', 'top_cockpit']
for n in names:
    Image.open(os.path.join(src, f'bike_{n}.png')).convert('RGB').save(f'{D}/blender_renders/bike_ride_{n}.webp', 'WEBP', quality=84, method=6)
S = json.load(open(R + '/assets/models/env/bike_ride.json'))
f3 = lambda v: f'({v[0]:+.3f}, {v[1]:.3f}, {v[2]:+.3f})'
rows = [('座墊頂', f3(S['座墊頂']) + '（' + S['座墊頂說明'] + '）'), ('把手握點（左，+x）', f3(S['把手握點_左'])), ('把手握點（右，−x）', f3(S['把手握點_右'])),
        ('五通中心', f3(S['五通'])), ('曲柄長', f"{S['曲柄長']} m"), ('踏板中心（靜止姿勢：右曲柄朝前、左曲柄朝後）', f"右 {f3(S['踏板中心_靜止姿勢']['右'])}、左 {f3(S['踏板中心_靜止姿勢']['左'])}"),
        ('輪徑（輪胎外徑）', f"{S['輪徑']} m"), ('前輪軸／後輪軸', f"{f3(S['前輪軸'])}／{f3(S['後輪軸'])}"), ('軸距', f"{S['軸距']} m"),
        ('轉向軸', f"通過 {f3(S['轉向軸']['通過'])}、方向（往上）{f3(S['轉向軸']['方向_往上'])}、頭管角 {S['轉向軸']['頭管角_度']}°")]
tris = S['tris']
doc = f"""
---

## 19. 騎車用的腳踏車（⑫，Blender 正式模型＋尺寸表；人物騎乘由 LAWWW 做）

使用者要求「我應該要可以騎腳踏車」、路上的騎士要真的踩踏板（LAWWW 07:52Z 分派）。交付 `assets/models/env/bike_ride.glb`（**{S['bytes'] / 1e3:.0f} KB**）＋尺寸表 `assets/models/env/bike_ride.json`（**從模型量出來的**）＋腳本 `tools/blender/env_second/bike_ride.py`。
造型和街上停的淑女車（`street_props.glb` 的 `bike_city`）同一款：彎下管的低跨車架、前籃、前燈、擋泥板、後貨架、鍊條蓋、環形鎖、彈簧座墊、後掠把手、車鈴；放大成成人騎的 26 吋。車架顏色是灰綠色烤漆（材質 `ride_frame`，遊戲可以改色）。

### 19.1 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 騎車用的腳踏車（`bike_ride.glb`） | 完成（零件分開、樞紐自我檢查通過） | **還沒接進遊戲**（騎乘姿勢、IK、操作由 LAWWW 做） | `MODEL_READY` |

### 19.2 尺寸表（遊戲座標，公尺；車頭朝 +z、地面 y=0、中心線 x=0；**騎士的左手邊＝+x**、右手邊＝−x，鍊條在右邊）

| 量 | 值 |
|---|---|
""" + '\n'.join(f'| {a} | {b} |' for a, b in rows) + f"""

### 19.3 節點與怎麼動（glTF 的節點名稱固定）

| 節點 | 父節點 | 原點（樞紐） | 怎麼動 | 三角形 |
|---|---|---|---|---|
| `frame` | （根） | 地面 (0,0,0) | 不動：車架、座管＋座墊、後貨架、後擋泥板、鍊條蓋、鍊條、環形鎖、中柱（收起） | {tris.get('frame', 0):,} |
| `fork` | frame | 轉向軸和頭管下緣的交點 | **本地 +Y＝轉向軸**（往上、往後傾 20°）：轉把手＝繞本地 Y 轉；前叉、龍頭、把手、握把、煞車把、車鈴、前籃、前擋泥板、前燈一起轉 | {tris.get('fork', 0):,} |
| `wheel_f` | fork | 前輪軸心 | 繞本地 X 轉（跟著把手轉向） | {tris.get('wheel_f', 0):,} |
| `wheel_r` | frame | 後輪軸心 | 繞本地 X 轉 | {tris.get('wheel_r', 0):,} |
| `crank` | frame | 五通中心 | 繞本地 X 轉（齒盤＋兩根曲柄） | {tris.get('crank', 0):,} |
| `pedal_r`／`pedal_l` | crank | 右／左踏板軸（曲柄末端） | 繞本地 X 轉：每格轉「負的曲柄角度」，踏板保持水平 | {tris.get('pedal_r', 0):,}／{tris.get('pedal_l', 0):,} |

腳本最後有自我檢查：fork 的本地 +Z（Blender；glTF 匯出後是本地 +Y）和轉向軸一致、每個節點的世界位置等於樞紐點（誤差 < 0.1 mm），不符合就匯出失敗。
輪子往前滾 1 m 轉 1/(π×{S['輪徑']}) 圈；曲柄的轉速照遊戲的齒比自己決定（建議：輪子轉 1 圈、曲柄轉 0.4–0.5 圈）。

### 19.4 規格

- 材質：車架 `ride_frame`（灰綠烤漆）、黑色零件 `ride_dark`、輪胎與握把 `ride_rubber`、金屬 `ride_metal`（金屬度 0.45 以下）、座墊 `ride_saddle`、反光片 `ride_reflector`／`ride_reflector_amber`、前燈 `ride_lamp_lens`（自發光）、鋼絲與前籃鐵絲網 `ride_alpha`（透明貼圖 `textures/gen/bike_alpha.png`，alphaMode MASK，和停著的淑女車同一張）。
- 三角形合計 {sum(tris.values()):,}。

### 19.5 Blender 渲染圖（Cycles；**不是遊戲畫面**）

| 側面 | 45° |
|---|---|
| ![](blender_renders/bike_ride_side.webp) | ![](blender_renders/bike_ride_q45.webp) |
| **正面** | **把手區（從後上方往下看）** |
| ![](blender_renders/bike_ride_front.webp) | ![](blender_renders/bike_ride_top_cockpit.webp) |

### 19.6 還沒達到參考品質的地方

1. 還沒有人騎（騎乘姿勢、手腳貼合握把和踏板要 LAWWW 接上才看得到）；沒有遊戲內截圖。
2. 鍊條是靜態的一圈（不會跟著齒盤動）；齒盤是實心圓盤、沒有齒。
3. 煞車線、變速線沒有做；握把是直的圓柱（真的淑女車握把稍微往後彎）。
4. 輪胎沒有胎紋；鋼絲是透明貼圖（從正側面看是平的）。
5. 沒有 iPhone 實機驗證。
"""
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '## 19. 騎車用的腳踏車' not in v
open(p, 'w').write(v.rstrip('\n') + '\n' + doc); print('doc ok')
