"""soclib_wt：VISUAL_REVIEW 第 16 節（⑬ 社會科學院 辜先生紀念圖書館室內）：規格、配置、Blender 渲染、交給 LAWWW 的接線說明、缺點。
用法（Blender 渲染跑完之後）：python3 docs/art-rebuild/second_ai/drafts/soclib_fill.py <渲染圖資料夾>"""
import json, math, os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
src = sys.argv[1]
names = ['entrance', 'grove', 'grove1', 'tables', 'up', 'window']
for n in names:
    Image.open(os.path.join(src, f'soclib_{n}.png')).convert('RGB').save(f'{D}/blender_renders/soclib_{n}.webp', 'WEBP', quality=84, method=6)
info = json.load(open(R + '/assets/models/env/second_ai/soclib_interior.json'))
s = open(R + '/src/data/soclib_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('const SOCLIB_LAYOUT=')):s.rindex('}') + 1])
seats = J['seats']; kinds = {k: sum(1 for q in seats if q['kind'] == k) for k in ('table', 'window', 'lounge')}
top = list(info['tris_by_object'].items())[:6]
doc = f"""
---

## 16. 社會科學院 辜先生紀念圖書館：一樓開架閱覽室（⑬，Blender 正式模型＋配置）

LAWWW 佇列的 ⑬（使用者 D46：法律系學生念書會去「新社科院的辜先生紀念圖書館」）。交付**配置 `src/data/soclib_layout.js`＋Blender GLB**；區域程式、導航、校園入口的接線由 LAWWW 做，所以這一節只有 Blender 渲染，**還沒有遊戲內截圖**。

參考（公開報導；臺大圖書館的介紹頁從沙盒連不到）：一樓開架閱覽室挑高將近 6 m，屋頂由 88 支白色樹狀柱撐起，柱頂像荷葉一樣散開，中間有 130 個形狀不一的天窗；配合竹製書架與閱覽家具，白天陽光從天窗灑下，像在林蔭間閱讀（[天下雜誌](https://www.cw.com.tw/article/5140431)、[蕃薯藤旅遊](https://travel.yam.com/article/120519)、[Bella 儂儂](https://www.bella.tw/articles/design&gadget/59150/toyo-ito-architecture-landmarks-taiwan)、[中央社](https://www.cna.com.tw/news/acn/201702220326.aspx)）。**平面配置、柱子數量、書架排法是遊戲化設計（推估），不是實測。**

### 16.1 玩家會看到什麼

| | 內容 |
|---|---|
| 樹狀柱 | 白色細柱，上面一段像喇叭一樣張開成荷葉（{len(J['columns'])} 支；柱頂高度 4.75–5.25 m 錯開，一片一片像樹冠） |
| 天窗 | 荷葉之間的天花板上 {len(J['skylights'])} 個圓形光井（白色井壁＋頂上的天光面板，自發光） |
| 玻璃帷幕 | 北牆、西牆整面玻璃（白色直框每 1.5 m）；前面是窗邊長桌＋竹椅 |
| 林間書房 | 東半邊 4 組竹集成材的弧形**雙面**書架圍著一支樹狀柱，開口朝走道；其中一組外面再一道矮弧 |
| 閱覽長桌 | 4 張長桌（竹色桌面、中間一排小檯燈、板狀桌腳），每張 6 個座位 |
| 入口 | 南牆的雙開玻璃門 → 門口地墊、還書箱 → 閘門（玻璃翼板）與玻璃欄杆 → 服務台（借還書感應板、兩台螢幕）、館員區矮隔板；查詢電腦、新書展示台 |
| 其他 | 東牆 2.4 m 靠牆書架、南牆期刊架、東南角閱報區（兩組單人沙發＋圓矮桌）、招牌板面（字由遊戲畫） |

### 16.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 社科院圖書館一樓（`soclib_interior.glb`＋`soclib_layout.js`） | 完成（模型、配置） | **還沒接進遊戲**（LAWWW 接線；配置的導航格檢查：{len(seats)} 個座位都走得到） | `MODEL_READY`（使用者還沒看過） |

### 16.3 規格

- 房間 {J['W']:.0f}×{J['D']:.0f} m、天花板 {J['H']} m、牆厚 {J['wallT']} m；座標 x 往東、z 往南（+z＝南牆：入口），地板 y=0。
- `soclib_interior.glb`：**{info['bytes'] / 1e6:.2f} MB、{info['tris']:,} 個三角形、{info['materials']} 個材質、{info['objects']} 個物件**（三角形最多的：{'、'.join(f'{k} {v:,}' for k, v in top)}）。
- 貼圖：Poly Haven CC0 `terrazzo_tiles`（地板）、`walnut_veneer`（調成淺色直紋當竹集成材）；其他是純色材質。遊戲沒有環境貼圖：金屬度都在 0.45 以下。
- Blender 5.2 `bpy`：`tools/blender/env_second/soclib_interior.py`（讀配置）；配置由 `tools/blender/env_second/soclib_layout_gen.py` 產生（先排家具、再在空的地方排柱子；用 0.2 m 格子＋人物半徑 0.33 m 檢查每個座位都走得到、沒有走不到的孤島）。

### 16.4 給 LAWWW 的接線說明

- 配置 `SOCLIB_LAYOUT`：`entrance`（門在南牆 x={J['entrance']['x']}、寬 {J['entrance']['w']} m；出生點 ({J['entrance']['spawn']['x']}, {J['entrance']['spawn']['z']})、yaw π 面向館內；離開的互動點 z={J['entrance']['exitZ']}）、`gates`、`desk`、`columns`、`skylights`、`furniture`、`seats`（{len(seats)} 個：長桌 {kinds['table']}、窗邊 {kinds['window']}、閱報區沙發 {kinds['lounge']}；`yaw`＝坐下時面向的方向，和 library_layout.js 一樣）、`signs`、**`nav`**（`rects`＝[中心 x, 中心 z, 寬, 深, ry]、`circles`＝[x, z, r]：家具、書架、柱子的導航阻擋，直接 blockRect／blockCircle 就好；牆和門洞照 W×D、wallT、entrance）。
- GLB 的命名照其他室內（attachRoomGLB）：會淡出的牆 `WALL_<side>_*`（自訂屬性 `dir`＝往室內的法線；front＝南牆、back＝北牆玻璃帷幕、left＝西牆玻璃帷幕、right＝東牆）；招牌 `WALL_front_SIGN_FACE_0`（自訂屬性 `sign`＝「社會科學院圖書館」，字由遊戲畫；全名要不要寫上辜先生紀念圖書館由你決定）。
- 自發光材質：`soclib_skylight`（天窗；晚上可以調暗或換成夜空色）、`soclib_lamp`（檯燈）、`soclib_screen`（螢幕）。天花板 `soclib_ceiling` 有天窗的洞（單面朝下）。
- 北牆、西牆的玻璃帷幕外面需要窗景：可以照店家窗景的做法拍兩張（北、西），等你決定圖書館在校園裡的位置（社科院 `CK.modern` 在 (110, −70)）之後我來拍。

### 16.5 Blender 渲染圖（Cycles，曝光 −1；**不是遊戲畫面**）

| 入口往裡看 | 往上看：樹狀柱、荷葉柱頂、天窗 |
|---|---|
| ![](blender_renders/soclib_entrance.webp) | ![](blender_renders/soclib_up.webp) |
| **林間書房（弧形雙面書架圍著樹狀柱）** | **另一組林間書房** |
| ![](blender_renders/soclib_grove.webp) | ![](blender_renders/soclib_grove1.webp) |
| **閱覽長桌** | **北側玻璃帷幕前的窗邊座位** |
| ![](blender_renders/soclib_tables.webp) | ![](blender_renders/soclib_window.webp) |

平面草圖（綠＝走得到的地方、棕＝導航阻擋、深灰圓點＝柱子、淡紫圓圈＝荷葉柱頂、紅點＝長桌座位、藍點＝窗邊與沙發座位、綠圓點＝出生點）：

![](drafts/soclib_plan_draft.webp)

### 16.6 還沒達到參考品質的地方

1. **還沒接進遊戲**：沒有遊戲內截圖、沒有跑整合測試；手機上的效能（{info['tris']:,} 個三角形，一整間大多同時看得到）要接線後量。
2. 規模縮小：真的閱覽室有 88 支柱子、地下一樓到二樓；遊戲版一層、{len(J['columns'])} 支柱子。
3. 柱頂是平的圓盤；真的荷葉是很薄、邊緣起伏的殼，天窗形狀也不一樣（這裡都是圓的）。
4. 竹材是木紋貼圖調色（沒有竹節）；書是一本一本的盒子、沒有書名；期刊是色塊。
5. 玻璃帷幕外面還沒有景（Blender 渲染裡是天空色）。
6. 沒有 iPhone 實機驗證。
"""
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '## 16. 社會科學院' not in v
open(p, 'w').write(v.rstrip('\n') + '\n' + doc); print('doc ok')
