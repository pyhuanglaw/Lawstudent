"""pav_wt：VISUAL_REVIEW 第 13 節（洞洞館、社科院）：草稿 pavsoc_review_draft.md 的 {{REST}} 填規格、測試、效能、截圖、渲染、缺點；PNG→WebP；接在 VISUAL_REVIEW.md 最後。"""
import glob, json, os, re
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
R = '/home/user/pav_wt'; D = R + '/docs/art-rebuild/second_ai'
HERE = D + '/drafts'
n = 0
for f in sorted(glob.glob(D + '/shots/pavsoc_*.png') + glob.glob(D + '/test_shots/pavsoc/**/*.png', recursive=True) + glob.glob(D + '/test_shots/campus_glb_integration/*.png')):
    Image.open(f).convert('RGB').save(f[:-4] + '.webp', 'WEBP', quality=82, method=6); os.remove(f); n += 1
print('converted', n)
info = {k: json.load(open(f'{R}/assets/models/env/second_ai/campus_{k}.json')) for k in ('pavilion', 'modern')}
L = D + '/test_logs/pavsoc'
names = ['campus_glb_integration', 'wz_street_integration', 'gongguan_glb_integration', 'campus_layout_nav', 'see_through', 'p0_movement', 'reachability_all', 'zone_transitions']   # campus_glb_integration＝第三輪
res = {}
for nm in names:
    t = open(f'{L}/{nm}.log').read(); res[nm] = (len(re.findall(r'^PASS', t, re.M)), len(re.findall(r'^FAIL ', t, re.M)), 'ALL PASS' in t)
assert all(v[1] == 0 and v[2] for v in res.values()), res
for nm in ('view_audit', 'view_audit_before'):
    t = open(f'{L}/{nm}.log').read(); assert 'errors: []' in t, nm
log = open(f'{L}/campus_glb_integration.log').read().split('\n')
perf = [l for l in log if l.startswith('PASS 效能')][0]; pj = json.loads(perf[perf.index('{'):])
bb = {k: [l for l in log if l.startswith(f'PASS {k}：位置')][0] for k in ('pavilion', 'soc')}
tri = [l for l in log if '正式模型的三角形' in l][0]; tj = json.loads(tri[tri.index('{'):])
kit = json.loads(open(f'{L}/kit_tris.log').read().strip().split('\n')[-1])
LBL = {'gate_avenue': '進校門往東看椰林大道', 'avenue': '椰林大道後段往東（總圖）', 'plaza': '總圖前廣場', 'porch': '總圖門廊近看', 'arcade': '總圖一樓拱廊裡',
       'bell_avenue': '從椰林大道看傅鐘', 'bell_close': '傅鐘近看', 'admin_front': '行政大樓正面', 'admin_arcade': '行政大樓一樓拱廊裡',
       'arts_front': '文學院正面', 'arts_arcade': '文學院一樓拱廊裡', 'hist_front': '校史館正面', 'hist_porch': '校史館門廊近看',
       'pav_front': '洞洞館：從椰林大道北側斜看', 'pav_close': '洞洞館近看鏤空牆', 'soc_front': '社科院：法學院那邊斜看正面', 'soc_lobby': '社科院玻璃大廳近看'}
rows = ['| 鏡頭（17:30） | draw call：改之前 → 正式模型（倍數） | 三角形：改之前 → 正式模型（倍數） |', '|---|---|---|']
for k, v in pj.items(): rows.append(f"| {LBL[k]} | {v['calls'][0]} → {v['calls'][1]}（×{v['calls'][2]}） | {v['tris'][0]:,} → {v['tris'][1]:,}（×{v['tris'][2]}） |")
LABEL = {'pav_avenue': '洞洞館：從椰林大道往北看', 'pav_front': '洞洞館：斜看正面', 'pav_close': '洞洞館：近看鏤空牆', 'soc_front': '社科院：斜看正面', 'soc_lobby': '社科院：玻璃大廳、雨遮', 'pav_follow': '洞洞館：玩家鏡頭（手機直向）'}
TIME = {'1100': '11:00', '1730': '17:30', '2030': '20:30'}
srows = ['| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |', '|---|---|---|']
for v in json.load(open(R + '/tools/blender/env_second/shots/pavsoc_after.json')):
    b = os.path.basename(v['out'])[:-4]; m = re.match(r'pavsoc_after_(.+)_(\d{4})$', b); key, tm = m.group(1), m.group(2)
    assert os.path.exists(f'{D}/shots/pavsoc_before_{key}_{tm}.webp') and os.path.exists(f'{D}/shots/pavsoc_after_{key}_{tm}.webp'), (key, tm)
    srows.append(f'| {LABEL[key]} {TIME[tm]} | ![修改前](shots/pavsoc_before_{key}_{tm}.webp) | ![修改後](shots/pavsoc_after_{key}_{tm}.webp) |')
spec = lambda k, nm, kk: (f"`assets/models/env/second_ai/campus_{k}.glb`（{nm}）：**{info[k]['bytes'] / 1e6:.2f} MB**、{info[k]['materials']} 個網格（每個材質一個）、**三角形 {info[k]['tris']:,}**"
                          f"（套件 {kit[kk]['tris']:,}；會投影的：套件 {kit[kk]['castTris']:,}、正式模型 {tj['campus_' + k + '_glb']['castTris']:,}）")
rest = f"""### 13.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 洞洞館外觀（`bldg.campus_pavilion`） | 完成 | `FUNCTIONAL_VERIFIED`（見 13.4） | `READY_FOR_ART_REVIEW` |
| 社科院外觀（`bldg.campus_modern`） | 完成 | `FUNCTIONAL_VERIFIED`（見 13.4） | `READY_FOR_ART_REVIEW` |

### 13.3 製作方式與規格

- 參考：ART_DIRECTION、D23／D25（洞洞館在校門東北、椰林大道北側；社科院在法學院廣場東側、正面朝西）、套件 `CK.pavilion`、`CK.modern` 的參數與註解。**沒有使用者提供的洞洞館、社科院照片**；是照套件的量體做的，不是照真實建築一比一重建（真實的洞洞館是張肇康設計的陶管鏤空牆，真實的社科院不是這個樣子）。
- Blender 5.2 `bpy`：{spec('pavilion', '洞洞館', 'pavilion')}；{spec('modern', '社科院', 'soc')}；貼圖 512 px（WebP）、校園世界座標。
- 洞洞館的材質：`ck_pav_conc`（結構：柱、樓板邊、屋簷、牆、台階）、`ck_pav_screen`（鏤空牆：RGBA 貼圖 512×512＝2.4 m×2.4 m、6×6 個洞，alphaMode MASK，兩面都畫）、`ck_pav_dark`（二樓內牆、窗框、門框、屋頂防水層：自發光貼圖左半黑、右半暖光，每 2.4 m 一段照「房間」亮或不亮，約七成）、`ck_glass`（和總圖同名＝遊戲端同一套夜間設定）、匾額。社科院：`ck_soc_wall`、`ck_soc_metal`、`ck_glass`、匾額。
- 遊戲端：`ck_pav_dark` 加進 WZ_NIGHT（晚上 0.9）、WZ_NO_SHADOW、和 `ck_glass` 一樣自發光貼圖不用 mipmap；`ck_soc_metal` 不投影。
- 遊戲端（共用）：字牌合成 atlas 的 `wzAtlasFaces`（溫州街、公館的招牌、校園地標的匾額都用它）——空白處填所有字牌的平均顏色、每一格往外多畫 2 px，縮小取樣（mipmap）時不會混到黑色；最寬的字牌只比 2 的次方寬一點點（≤ 12%）時全部等比例縮小，atlas 寬度少一半。

### 13.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/pavsoc/`。

**截圖檢查發現兩個問題，改完重跑**（測試本身每一輪都通過——這兩個問題測試抓不到，是看截圖發現的；第一輪的 log 在 `test_logs/pavsoc/round1/`）：
1. 洞洞館入口正中間有一根柱子，擋住門和匾額中間兩個字（套件也有這根柱子，只是套件的匾額比較大、比較前面，只擋掉一個字）→ 入口正前方不放柱子（第二輪）。
2. 社科院的匾額在遊戲裡是一條黑帶。第二輪先以為是字牌 atlas 只有一角有字、其他是黑色空白、縮小取樣（mipmap）混成黑色 → 改了 `wzAtlasFaces`（見 13.3；這個改法本身是對的，遠看的字牌不會再混到黑色，所以留著），**但重拍還是黑的**；第三輪正面拍近照才查到真正原因：社科院的匾額用的是「門牌」樣式，外框寬度照板面「寬度」的 4% 算，6 m 寬的匾額外框粗到把整塊蓋成深色 → 改成和洞洞館、總圖一樣的石材匾額樣式（`serif`，細的內框），重新匯出 `campus_modern.glb`。

重跑：第二輪 `campus_glb_integration`、`wz_street_integration`、`gongguan_glb_integration`（atlas 是共用的）、全部前後截圖；第三輪 `campus_glb_integration`、社科院的「修改後」截圖。導航相關的（`campus_layout_nav`、`see_through`、`p0_movement`、`reachability_all`、`zone_transitions`）是第一輪的結果——三個修正都只改畫面（模型的一根柱子、字牌貼圖、匾額樣式），導航格、碰撞、互動點不變（`campus_glb_integration` 每一輪都檢查兩棟的導航、碰撞、互動點和改之前完全相同）；合併 AI-1 最新開發分支之後，和 ⑥ 一起再跑一次完整回歸（見第 14 節）。

""" + '、'.join(f'`{k}` {v[0]}' for k, v in res.items()) + """：**全部通過**。`campus_glb_integration` 新加的檢查：洞洞館鏤空牆是 alphaTest（不是半透明）、兩面都畫、會投影；鏤空牆後面的房間 20:30 透出暖光、11:00 不發光、不投影；兩棟的玻璃和總圖同一套（約七成亮燈）。外框檢查：洞洞館 """ + bb['pavilion'][bb['pavilion'].index('{'):].strip() + '；社科院 ' + bb['soc'][bb['soc'].index('{'):].strip() + """。

`tools/dev_scratch/view_audit.py`（360° 盤點：洞洞館前、洞洞館與校史館之間、社科院前）：正式模型 `shots/pavsoc_audit/`、改之前（`?nobldg`）`shots/pavsoc_audit_nobldg/`，沒有 JS 錯誤（例：洞洞館前）：

![洞洞館前 360°](shots/pavsoc_audit/洞洞館前（柱廊外）.jpg)

**效能（同一個鏡頭三角形不能比現在多、draw call ≤ 現在的 +10%；17:30 凍結時鐘、藏起路人與騎腳踏車的路人、含陰影那一輪、含玩家）**：「改之前」＝進校園前把七個地標（總圖、傅鐘、行政大樓、文學院、校史館、洞洞館、社科院）的 key 都從 manifest 拿掉。

""" + '\n'.join(rows) + """

### 13.5 遊戲內截圖（修改前｜修改後；修改前＝同一版遊戲、只擋掉 `campus_pavilion.glb`、`campus_modern.glb`；17:30 凍結遊戲時鐘）

""" + '\n'.join(srows) + """

### 13.6 Blender 渲染圖（Cycles；匾額的字是遊戲裡用 canvas 畫的，所以這裡是空白板面；亮燈的窗只有遊戲的夜間才亮，這裡關掉自發光）

洞洞館：

| 正面 | 斜看 | 近看鏤空牆 |
|---|---|---|
| ![](blender_renders/pav_front.webp) | ![](blender_renders/pav_three_q.webp) | ![](blender_renders/pav_screen.webp) |

| 一樓柱廊、入口 | 背面 |
|---|---|
| ![](blender_renders/pav_ground.webp) | ![](blender_renders/pav_back.webp) |

社科院：

| 正面 | 斜看 | 玻璃大廳、雨遮 |
|---|---|---|
| ![](blender_renders/soc_front.webp) | ![](blender_renders/soc_three_q.webp) | ![](blender_renders/soc_lobby.webp) |

| 帶狀長窗近看 | 背面 |
|---|---|
| ![](blender_renders/soc_ribbon.webp) | ![](blender_renders/soc_back.webp) |

### 13.7 還沒達到參考品質的地方

1. **不是照真實建築重建**：沒有照片。真實的洞洞館（1963，張肇康）是綠釉陶管砌成的鏤空牆、屋頂和柱子的比例也不同；真實的社科院不是這個量體。有照片可以照照片改（位置、導航不用動）。
2. 洞洞館的洞是貼圖透明度挖的（不是一根一根的陶管模型）：正面看很像，貼著牆往上看時看得出是兩片板（四面約 2,000 個洞，做成真的陶管模型會多 6 萬個三角形，超過預算）。
3. 社科院的一樓大廳裡面沒有東西（玻璃是深色反光，看不進去）；帶狀長窗裡也沒有窗簾或室內。
4. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量（見 13.4）。
"""
s = open(HERE + '/pavsoc_review_draft.md').read().replace('{{REST}}', rest)
assert '{{' not in s
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '## 13. 校園⑤' not in v
open(p, 'w').write(v.rstrip('\n') + '\n' + s); print('doc ok', res)
