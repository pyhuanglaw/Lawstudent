"""props_wt：VISUAL_REVIEW 第 14 節（⑥法學院廣場的近景小物）：規格、測試、截圖、渲染、缺點；PNG→WebP；接在 VISUAL_REVIEW.md 最後。"""
import glob, json, os, re
from PIL import Image
R = '/home/user/props_wt'; D = R + '/docs/art-rebuild/second_ai'
n = 0
for f in sorted(glob.glob(D + '/shots/props6_*.png') + glob.glob(D + '/test_shots/props6/**/*.png', recursive=True) + glob.glob(D + '/test_shots/street_props_integration/*.png')
                + glob.glob(D + '/test_shots/campus_glb_integration/*.png')):
    Image.open(f).convert('RGB').save(f[:-4] + '.webp', 'WEBP', quality=82, method=6); os.remove(f); n += 1
print('converted', n)
L = D + '/test_logs/props6'
names = ['street_props_integration', 'campus_glb_integration', 'campus_layout_nav', 'p0_movement', 'reachability_all', 'zone_transitions', 'wancai_glb_integration', 'see_through', 'gongguan_glb_integration', 'wz_street_integration', 'nav_buildings_unit', 'nav_levels_unit', 'kit_nav_check']
res = {}
for nm in names:
    t = open(f'{L}/{nm}.log').read(); res[nm] = (len(re.findall(r'^PASS', t, re.M)), len(re.findall(r'^FAIL ', t, re.M)), 'ALL PASS' in t)
assert all(v[1] == 0 and v[2] for v in res.values()), res
info = json.load(open(R + '/assets/models/env/second_ai/street_props.json'))
tp = info['tris_per_prop']
sl = open(f'{L}/street_props_integration.log').read().split('\n')
boxes = {k: [l for l in sl if l.startswith(f'PASS ⑥{k}')][0] for k in ('花台', '公告欄', '販賣機')}
gl = open(f'{L}/campus_glb_integration.log').read().split('\n')
perf = [l for l in gl if l.startswith('PASS 效能')][0]; pj = json.loads(perf[perf.index('{'):])
LABEL = {'plaza_planters': '法學院前庭：長椅旁看花台', 'board_vending': '霖澤館西側：公告欄', 'avenue_planter': '椰林大道北側的花台', 'vending': '霖澤館西側：販賣機（正面）', 'follow': '玩家鏡頭（手機直向）：公告欄前'}
TIME = {'1100': '11:00', '1730': '17:30', '2030': '20:30'}
srows = ['| 鏡頭 | 修改前（程序化） | 修改後（Blender 正式模型） |', '|---|---|---|']
for v in json.load(open(R + '/tools/blender/env_second/shots/props6_after.json')):
    b = os.path.basename(v['out'])[:-4]; m = re.match(r'props6_after_(.+)_(\d{4})$', b); key, tm = m.group(1), m.group(2)
    assert os.path.exists(f'{D}/shots/props6_before_{key}_{tm}.webp') and os.path.exists(f'{D}/shots/props6_after_{key}_{tm}.webp'), (key, tm)
    srows.append(f'| {LABEL[key]} {TIME[tm]} | ![修改前](shots/props6_before_{key}_{tm}.webp) | ![修改後](shots/props6_after_{key}_{tm}.webp) |')
doc = """
---

## 14. 法學院廣場的近景小物：花台、公告欄、販賣機（⑥）

LAWWW 佇列的 ⑥（法學院廣場的花台、公告欄、販賣機等近景小物）。三樣都加進街道道具的 GLB（`street_props.glb`，開機預載），`W3.planter()`、`W3.bulletin()`、`W3.vending()` 開頭換成正式模型（和路燈、腳踏車、長椅同一套接法；`?nobldg`、載入失敗照舊是程序化版本）。用到的地方：法學院前庭的花台 4 個、椰林大道北側的花台 2 個、霖澤館西側的公告欄與販賣機；AI-1 萬才館一樓的公告欄（`wancai3d.js` 也呼叫 `W3.bulletin()`）也一起換成正式模型（尺寸相同）。

### 14.1 玩家會看到什麼不同

| | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 花台 | 一個灰色方塊＋一片綠色方塊＋幾顆彩色小球 | 水泥花槽（Poly Haven `concrete_wall_006`，壓頂外凸 2 cm、土比槽口低 8 cm）、茂密的小葉灌木（交叉的葉片卡＋頂上一層，本作程式產生的 `ivy_leaves` 葉片貼圖）、葉叢表面開著紅、黃、白、粉紅的五瓣小花 |
| 公告欄 | 兩根柱子＋一塊板＋幾張純色方塊 | 木柱、木框（Poly Haven `dark_wood`）、軟木板、往前斜的小雨遮、九張 A4／A3 公告（稍微歪著貼、紅／藍標題＋灰色字行） |
| 販賣機 | 紅色方塊＋一片淺藍色平面 | 台灣常見的飲料販賣機：紅色烤漆機身、往內 34 cm 的展示窗（背光日夜都亮、四層層板、罐裝與寶特瓶、層板前緣的按鈕條）、頂上的燈條、深灰投幣面板（會亮的金額顯示、紙鈔口、投幣口、找零口）、白底藍帶的廣告面板、取物口、底座 |

**沒有改的東西**：每樣東西的位置、方向、尺寸範圍（花台 1.2×0.5、公告欄柱距 2.2 m、販賣機 1.1×1.9×0.8）、導航阻擋、互動點。

### 14.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 花台、公告欄、販賣機（`prop.street`） | 完成 | `FUNCTIONAL_VERIFIED`（見 14.4） | `READY_FOR_ART_REVIEW` |

### 14.3 規格

- Blender 5.2 `bpy`：`tools/blender/env_second/street_props.py`（加 `planter_box()`、`bulletin_board()`、`vending_machine()`）→ `street_props.glb`：""" + f"{info['bytes'] / 1e3:.0f} KB（原本 169 KB）；三角形：花台 {tp['planter_box']}、公告欄 {tp['bulletin_board']}、販賣機 {tp['vending_machine']}" + """（腳踏車、路燈、長椅不變）。
- 材質：花槽 `planter_conc`、土 `planter_soil`、葉片 `planter_leaf`（alphaMode MASK）、花／公告紙／飲料瓶／按鈕一個頂點色材質 `prop_vc`、軟木 `board_cork`、機身 `vend_body`、展示窗背光 `vend_light`（自發光）；木頭、深色鐵件和長椅、腳踏車共用。這些道具在區域裡和其他靜態物件一起合併（`P3.mergeStatic`），材質相同的合成一個網格。
- 遊戲端：`world3d.js` 加 `formalProp(name)`，花、公告紙、飲料瓶、背光不投影。
- 截圖檢查抓到、已修：販賣機第一版在陰影裡幾乎全黑——機身用了金屬度 0.3（遊戲沒有環境貼圖，金屬的部分只剩很暗的漫射光），取物口那一區和投幣面板又整塊塗成近黑色。改成不帶金屬的紅色烤漆、下半部只有取物口是深色（上面加白底藍帶的廣告面板）、投幣面板改深灰並加會亮的金額顯示、頂上燈條改自發光（三角形 848 → 872），重拍販賣機的兩組鏡頭、重跑 `street_props_integration`。
- 中間遇到的問題：花台的葉片一開始幾乎看不見——葉片卡的 UV 層用 `new('UVMap')` 建，和其他零件的盒狀 UV 層（`verify()`）名稱不同，合併成一個網格時變成第二層，匯出的葉片 UV 全是 0（取到貼圖透明的角落）。改用 `verify()` 後正常（Blender 渲染確認）。

### 14.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/props6/`。

**這一輪是 ⑤（洞洞館、社科院）和 ⑥ 一起、合併 AI-1 開發分支 `8afdece` 之後的完整回歸**（合併 `5b21aa0` 時已經整套跑過一次、全部通過；修改前的截圖＝⑤＋AI-1 `5b21aa0` 那一版，只差 ⑥）。第一次跑 `street_props_integration` 時「花台在導航阻擋裡」**FAIL**（`street_props_integration_round1.log`：葉片卡最外到 x=0.74，比 1.2 m 的花台、導航阻擋多出 0.14 m——後排的葉片卡往右偏了 8 cm）→ 改模型（葉片卡最外到 |x|≤0.64 m）、重新匯出、重跑 PASS；其他測試第一次就通過。

""" + '、'.join(f'`{k}` {v[0]}' for k, v in res.items()) + """：**全部通過**。`street_props_integration` 新加的檢查：三樣都是正式模型、外框在導航阻擋的範圍裡、著地（""" + '；'.join(boxes[k][boxes[k].index('['):].strip() if '[' in boxes[k] else k for k in boxes) + """）；校園畫面上有它們的材質，`?nobldg`、載入失敗時沒有（照舊程序化）；導航格、互動點、座位和 `?nobldg` 完全相同。`wancai_glb_integration`（AI-1 的萬才館）照舊通過。

校園地標的效能（`campus_glb_integration`，道具在兩輪都是正式模型）：""" + '、'.join(f"{k} ×{v['calls'][2]}" for k, v in list(pj.items())[:4]) + """…（全部 ≤ 1.1、三角形都比改之前少）。

### 14.5 遊戲內截圖（修改前｜修改後；修改前＝上一版的遊戲：這三樣是程序化版本；17:30 凍結遊戲時鐘）

""" + '\n'.join(srows) + """

### 14.6 Blender 渲染圖（Cycles）

![花台、公告欄、販賣機](blender_renders/props6_sheet.webp)

### 14.7 還沒達到參考品質的地方

1. 公告紙上沒有真的字（紅／藍標題＋灰色字行）；遠看像公告，近看讀不到內容。
2. 販賣機的飲料是簡單的圓柱（沒有瓶蓋、標籤細節），展示窗前面沒有玻璃（看得到裡面）；沒有品牌標誌（不仿特定品牌）。
3. 花台的灌木是葉片卡，從正上方往下看會看到卡片的交叉。
4. 只有這三樣；法學院廣場的其他小物（垃圾桶、指標、腳踏車停車架以外的設施）還是程序化或沒有。
5. 沒有 iPhone 實機驗證。
"""
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '## 14. 法學院廣場的近景小物' not in v
open(p, 'w').write(v.rstrip('\n') + '\n' + doc); print('doc ok', res)
