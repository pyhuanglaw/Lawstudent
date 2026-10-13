"""lane_wt：VISUAL_REVIEW 第 18 節（⑭ 和平東路二段 118 巷街景）：做法、規格、Blender 渲染、給 LAWWW 的接線說明、缺點。
用法：python3 docs/art-rebuild/second_ai/drafts/lane118_fill.py <渲染圖資料夾>"""
import json, os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
src = sys.argv[1]
names = ['south_end', 'middle', 'shop_home', 'shop_omu', 'aerial']
for n in names:
    Image.open(os.path.join(src, f'lane118_{n}.png')).convert('RGB').save(f'{D}/blender_renders/lane118_{n}.webp', 'WEBP', quality=84, method=6)
info = json.load(open(R + '/assets/models/env/second_ai/lane118_street.json'))
s = open(R + '/src/data/lane118_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('const LANE118_LAYOUT=')):s.rindex('}') + 1])
shops = '、'.join(f"{q['name']}（{'西' if q['side'] == 'W' else '東'}側 z {q['z0']:g}～{q['z1']:g}）" for q in J['shops'])
doc = f"""
---

## 18. 和平東路二段 118 巷街景（⑭，Blender 正式模型；遊戲區域由 LAWWW 做）

使用者 D46：法律系學生吃飯常去台大後門（辛亥復興校門）外的 118 巷。LAWWW 先出配置 `src/data/lane118_layout.js`（巷寬、兩側店面、門、和辛亥路／和平東路的接口），我照同一份配置做兩側的街景；**遊戲區域、導航、店門互動由 LAWWW 做**，所以這一節只有 Blender 渲染。

### 18.1 做法與內容

- 工具：和溫州街、公館店面街同一支腳本 `tools/blender/env_second/wz_street.py`，加一組 `--set lane118`（讀配置）→ `assets/models/env/second_ai/lane118_street.glb`。同一套台北老公寓零件、材質、窗戶原型（長條磁磚／馬賽克／水泥漆外牆、鋁窗＋窗簾、外凸鐵窗、浪板雨遮、冷氣與排水管、陽台盆栽、頂樓水塔與加蓋）。
- 配置裡的 9 間店照 z0～z1 蓋（店門在中間）：{shops}；店名是配置裡的虛構店名，招牌配色照店的類型，有的有帆布遮雨棚。
- 店與店之間的空檔補上沒有互動的樓房：寬度不到 2.6 m 的是住家樓梯間（紅／綠鐵門、信箱、門燈），其他是住家、鐵捲門、一般小店（早餐店、影印、自助洗衣、水果行…）；兩條小巷（配置的 alleys）不蓋，靠小巷、靠和平東路／辛亥路的那一面開側窗。
- 中文字不放在 GLB：招牌 `SIGN_FACE_<棟>`、直立招牌 `VSIGN_FACE_<棟>`、店內景深卡 `INTERIOR_FACE_<棟>` 是空白板面（自訂屬性帶店名、顏色、店種），**和溫州街、公館同一套**，遊戲用 `wzAtlasFaces`（TK.signTex／TK.interiorTex）畫字——Blender 渲染裡是空白的咖啡色板子。每棟的編號：西側 `W00`…、東側 `E00`…（由北往南；字牌板面的名字帶這個編號，`lane118_street.json` 的 `buildings` 有完整清單）；牆、窗這些依材質合併成整條街一個網格（和溫州街一樣）。

### 18.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 118 巷兩側街景（`lane118_street.glb`） | 完成 | **還沒接進遊戲**（LAWWW 做區域） | `MODEL_READY` |

### 18.3 規格

- `lane118_street.glb`：**{info['bytes'] / 1e6:.2f} MB**；不重複的三角形 {info['tris']:,}、畫出來的三角形 {info['tris_drawn']:,}（鐵窗、冷氣、水塔、窗戶是 instancing）；兩側 {len(info.get('buildings', []))} 棟。
- 座標＝配置的座標（x 往東、z 往南）；西側立面在 x={J['facade']['west']}、東側 x={J['facade']['east']}；一樓高 {J['groundH']} m、樓高 {J['floorH']} m（配置的 groundH／floorH）。

### 18.4 給 LAWWW 的接線說明

- GLB 只有兩側的建築（照 wenzhou_street.glb 的接法：載入後加進區域、字牌用 `wzAtlasFaces` 畫、夜間發光照 `WZ_NIGHT`）；巷子的路面、人行道、機車格、辛亥路／和平東路與後門、背景由區域做。
- 機車：可以用溫州街的機車 InstancedMesh（`scooter.glb`），停在配置的 `scooters.zRanges`。
- 導航阻擋：兩側建築從立面往外都不能走（x &lt; {J['facade']['west']}、x &gt; {J['facade']['east']}）；小巷口要用看得懂的方式擋（例如機車、花盆），不要隱形牆。

### 18.5 Blender 渲染圖（Cycles；**不是遊戲畫面**；招牌的字是遊戲畫的，這裡是空白）

| 從辛亥路那一端往北看 | 中段往南看（小巷口、住家樓梯間） |
|---|---|
| ![](blender_renders/lane118_south_end.webp) | ![](blender_renders/lane118_middle.webp) |
| **巷口家常菜（西側）** | **蛋包飯研究所（東側）** |
| ![](blender_renders/lane118_shop_home.webp) | ![](blender_renders/lane118_shop_omu.webp) |

![從上空看整條巷子](blender_renders/lane118_aerial.webp)

### 18.6 還沒達到參考品質的地方

1. **沒有照片參考**：118 巷真實的樣子（店面寬度、騎樓有沒有、招牌密度）沒有查證，照台北巷弄的一般樣子做；店名、店家都是虛構的。
2. 還沒接進遊戲：沒有遊戲內截圖、招牌的字還沒畫上去、晚上的燈光沒看過。
3. 和溫州街、公館共用同一套公寓零件：細看會覺得像（同一種窗、鐵窗、雨遮）。
4. 小吃店的特色（菜單看板、蒸籠、冰箱、外帶窗口、桌椅擺到騎樓）還沒有做。
5. 沒有 iPhone 實機驗證。
"""
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '## 18. 和平東路二段 118 巷' not in v
open(p, 'w').write(v.rstrip('\n') + '\n' + doc); print('doc ok')
