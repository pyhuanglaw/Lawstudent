"""lawlib_wt：VISUAL_REVIEW 第 17 節（萬才館 法律學院圖書館：Blender 正式模型＋萬才館的門＋窗景）。
用法：python3 docs/art-rebuild/second_ai/drafts/lawlib_fill.py <Blender 渲染資料夾（法圖）> <Blender 渲染資料夾（法圖補拍）> <萬才館渲染資料夾> <遊戲截圖資料夾（有 GLB）> <遊戲截圖資料夾（擋掉 GLB）> <遊戲截圖 log（有 GLB）> <log（擋掉）>"""
import json, os, re, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
bl1, bl2, wcd, g_new, g_old, log_new, log_old = sys.argv[1:8]
def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert('RGB')
    if w and im.size[0] > w: im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)
for n in ('entrance', 'reading', 'stairs', 'rooms', 'counter', 'stacks', 'stacks2', 'upper'): webp(f'{bl1}/lawlib_{n}.png', f'{D}/blender_renders/lawlib_{n}.webp')
for n in ('landing', 'well', 'disc', 'door', 'journals', 'thesis'): webp(f'{bl2}/lawlib_{n}.png', f'{D}/blender_renders/lawlib_{n}.webp')
for n in ('lldoor', 'lldoor_far'): webp(f'{wcd}/wancai_{n}.png', f'{D}/blender_renders/wancai_{n}.webp')
GN = ['g_entrance', 'g_reading', 'g_stairs', 'g_rooms', 'g_stacks', 'g_upper', 'g_follow_1f', 'g_follow_2f', 'g_follow_stairB', 'm_follow_1f', 'm_follow_2f', 'g_night_1f']
for n in GN:
    webp(f'{g_new}/{n}.png', f'{D}/shots/lawlib_after_{n}.webp', w=1100)
    if os.path.exists(f'{g_old}/{n}.png'): webp(f'{g_old}/{n}.png', f'{D}/shots/lawlib_before_{n}.webp', w=1100)
def posts(path):
    out = {}
    for line in open(path, encoding='utf8'):
        m = re.match(r'post (\S+) (\{.*\})$', line.strip())
        if m: out[os.path.basename(m.group(1))[:-4]] = json.loads(m.group(2))
    return out
PN, PO = posts(log_new), posts(log_old)
errs = [l.strip() for l in open(log_new, encoding='utf8') if l.startswith('shot') and not l.rstrip().endswith('errors: []')]
info = json.load(open(R + '/assets/models/env/lawlib_interior.json'))
s = open(R + '/src/data/lawlib_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('const LAWLIB_LAYOUT=')):s.rindex('}') + 1])
wc_bytes = os.path.getsize(R + '/assets/models/env/wancai_interior.glb')
perf_rows = '\n'.join(f"| `{n}` | {PO.get(n, {}).get('calls', '—')}／{PO.get(n, {}).get('tris', '—'):,} | {PN[n]['calls']}／{PN[n]['tris']:,} | {'是' if PN[n]['formal'] else '**否**'} |"
                      if isinstance(PO.get(n, {}).get('tris'), int) else f"| `{n}` | — | {PN[n]['calls']}／{PN[n]['tris']:,} | {'是' if PN[n]['formal'] else '**否**'} |" for n in GN if n in PN)
LABEL = {'g_entrance': '入口往館內看（一樓）', 'g_reading': '閱覽長桌、玻璃討論室', 'g_stairs': '一樓往樓梯看', 'g_rooms': '北側的討論室、影印室', 'g_stacks': '二樓書架走道',
         'g_upper': '二樓往東南閱覽區', 'g_follow_1f': '跟隨鏡頭：一樓', 'g_follow_2f': '跟隨鏡頭：二樓書架之間（書架網點透空）', 'g_follow_stairB': '跟隨鏡頭：B 跑樓梯上（南牆淡出）',
         'm_follow_1f': '手機直向 390×844：一樓', 'm_follow_2f': '手機直向 390×844：二樓書架之間', 'g_night_1f': '晚上 20:30：入口往館內看'}
shot_rows = '\n'.join(f"| {LABEL[n]} | ![](shots/lawlib_before_{n}.webp) | ![](shots/lawlib_after_{n}.webp) |" for n in GN)
doc = f"""
---

## 17. 萬才館 法律學院圖書館（LAWWW 2026-10-13 13:16Z 分派、使用者指定；Blender 正式模型＋萬才館的門＋窗景）

使用者 2026-10-11：「萬才館一樓進去左手邊就是法律系圖書館，裡面自己有樓梯，有兩層樓；1 樓主要是櫃檯、自習區、影印室、兩間可以借用的討論室（小的）；2 樓比較多是藏書。」
LAWWW 已經做好配置 `src/data/lawlib_layout.js`、區域 `src/lawlib3d.js`（導航、互動點、程序化備用模型）；這一節是第二個 AI 做的**正式模型**：`tools/blender/lawlib_interior.py` → `assets/models/env/lawlib_interior.glb`（讀同一份配置，兩邊的牆、樓梯、家具位置一致），加上萬才館大廳那一側的門、三個方向的窗景。

### 17.1 做法與內容

- 工具：Blender 5.2 `bpy`（無介面）；共用小工具 `tools/blender/env_second/lib2.py`、植物 `tools/blender/plants.py`（只讀使用）。材質：Poly Haven CC0——一樓 `granite_tile`（調成淺色、60 cm 地磚）、二樓與討論室 `dirty_carpet`（去彩度調成灰藍地毯）、樓梯 `granite_tile_03`、木作 `walnut_veneer`、輕鋼架天花板 `ceiling_interior`；其他是純色材質；金屬度都在 0.45 以下。
- **書**：一層書架的一個開間做成一個「書模組」（一本一本的書：書背、書口、露出來的側面；寬、高、深、顏色不一，偶爾有空隙和書擋），共 {info['book_modules']} 種（法律教科書 8、外文書 3、博碩士論文 3、期刊合訂本 5），每一格放一個 → **{info['book_instances']} 個 GPU instancing**（glTF `EXT_mesh_gpu_instancing`；遊戲的 GLTFLoader 會變成 InstancedMesh）。
  書背是程式畫的圖集 `tools/blender/env_second/textures/gen/lawlib_books.png`（`lawlib_atlas.py`）：書名只寫科目（民法總則、刑事訴訟法…）、版次、圖書館的索書號標籤（中國圖書分類法 58x）；論文是深色精裝燙金、期刊合訂本同一種期刊同一個顏色＋卷號、年份；**沒有真實的作者、出版社、期刊名稱**。字用系統字型文泉驛正黑畫成點陣圖（GLB 裡沒有字型）。期刊封面、新書封面是另一張 `lawlib_covers.png`（虛構的刊名與專題）。
- **一樓**：入口（東牆，雙開玻璃門、出口標示燈、地墊；門外補一小段萬才館大廳，從館內看出去不是空的）、防盜感應門柱（半透明壓克力板）、櫃台（胡桃木面板、花崗石檯面、還書口、館員那一側的工作檯、兩台螢幕）、館員工作區（分類書架、隔板、辦公椅、書車）、兩張長閱覽桌（中間一排綠色玻璃燈罩的桌燈、插座）、靠南窗的四個閱覽隔間、參考書書架、現期期刊架、新書展示台、兩台館藏查詢機；北側玻璃隔間的討論室 A、B（拉門推開、霧面腰帶、桌子、四張會議椅、白板、牆上的螢幕）、影印室（兩台影印機、加值機、回收紙箱）、館員辦公室（木門關著）；輕鋼架天花板＋燈＋偵煙器。
- **U 形樓梯**：A 跑（往南，13 階）、平台、B 跑（往北，12 階；和二樓共用）；花崗石踏面＋止滑條、兩跑中間的牆（頂上胡桃木扶手）、B 跑東側的木格柵牆（大廳那一面；「法律學院圖書館」牌子在上面）、牆上的不鏽鋼扶手、南牆的樓梯高窗、二樓樓梯井的玻璃欄杆。台階的位置和遊戲的 `stairSurfs`（一階一階的畫面高度）完全一致。
- **二樓**：灰藍地毯；10 座雙面書架（鐵灰色鋼架、胡桃木端板＋頂板、端板上的索書號卡座）、外文書／博碩士論文／期刊合訂本三面靠牆書架、現期期刊展示架、閱覽桌 5 張、書車、踏凳、盆栽、安全梯的門（關著、出口標示燈）；北、西高窗、南面大窗；長條燈在書架之間的走道上方。
- 吊牌：遊戲用 canvas 畫字的吊牌（櫃台、樓梯口、二樓）做了深色背板＋吊線；貼牆的牌子（房間名稱、「法律學院圖書館」）不用。
- **萬才館那一側的門**（`tools/blender/wancai_interior.py`，LAWWW 授權只改門洞、門、名牌、盆栽位置；盆栽配置裡已經搬到 (−8.2, −6.2)，模型照配置）：一樓西牆南段開門洞（`lawlibDoor`：z 5.35–6.55、高 2.4 m）、鋁框、兩扇玻璃門（關著）、直把手、門上淺色木作名牌＋胡桃木框（字是遊戲畫的深咖啡色字，所以用淺色木板）、門後一小段館內（地磚、白牆、天花板、感應門柱、亮的牆）。`wancai_interior.glb` {wc_bytes / 1e6:.2f} MB（原本 2.40 MB）。
- **窗景**（`tools/shots/window_views.py` 加三筆，遊戲裡拍的實際畫面，1024×512、水平 90°、白天 11:00／晚上 20:30）：`lawlib_south`（弧形量體前面往南看法學院前的廣場與樹林）、`lawlib_north`（萬才館背面往北）、`lawlib_west`（西牆外二樓高度往西：國青中心、霖澤館）。

### 17.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 法圖室內 `lawlib_interior.glb` | 完成 | 載入、接上 `B3.attachFormal`、遊戲內截圖（17.6）；**整合測試（走路、坐下、上下樓）由 LAWWW 跑** | `READY_FOR_ART_REVIEW`（使用者還沒看過） |
| 萬才館西牆的門 | 完成 | 遊戲內還沒截圖（LAWWW 整合後） | `MODEL_READY` |
| 窗景 3 張×2 時段 | 完成 | 檔名照 `lawlib_layout.js` 的 `photo` | — |

### 17.3 規格

- `lawlib_interior.glb`：**{info['bytes'] / 1e6:.2f} MB**；靜態三角形 {info['tris_static']:,}；書 {info['book_instances']} 個 instancing（{info['book_modules']} 種模組、不重複的三角形 {info['tris_unique'] - info['tris_static']:,}），**畫出來的書 {info['book_tris_drawn']:,} 個三角形**；合計畫出來 {info['tris_drawn']:,}；材質 {info['materials']} 個。
- 節點：`L0_root`（一樓＋整座樓梯＋入口外那一小段）、`L1_root`（二樓）；書的 instancing 在 `L0_books`、`L1_books` 底下。外牆和貼在外牆上的東西名字含 `WALL_`（自訂屬性 `dir`）；玻璃不放進 `WALL_`。
- 網點透空的材質：`ll_shelf_steel`、`ll_book_atlas`、`ll_endpanel`、`ll_journal_covers`（`lawlib3d.js` 的 `/^ll_(shelf|book|endpanel|journal)/`）。天花板材質名有 `ceiling`（`attachFormal` 會加地面反光）。
- `src/assets3d.js` 的第二個 AI 區塊加了 `bldg.lawlib_interior`（lazy）。

### 17.4 遊戲內效能（Playwright＋SwiftShader，1280×800；手機直向 390×844；`renderer.info`：draw call／三角形；「擋掉 GLB」＝程序化備用模型）

| 鏡頭 | 擋掉 GLB | 正式模型 | 正式模型接上了 |
|---|---|---|---|
{perf_rows}

遊戲內 console 錯誤：{'沒有' if not errs else '; '.join(errs)}。**這是模擬，不是 iPhone 實機**；效能要 LAWWW 在手機上量。

### 17.5 Blender 渲染圖（Cycles；**不是遊戲畫面**；吊牌、房間名稱的字是遊戲畫的，這裡沒有）

| 入口往館內看 | 閱覽長桌、玻璃討論室 |
|---|---|
| ![](blender_renders/lawlib_entrance.webp) | ![](blender_renders/lawlib_reading.webp) |
| **一樓往樓梯看** | **閱覽桌的綠色桌燈、北側的房間** |
| ![](blender_renders/lawlib_stairs.webp) | ![](blender_renders/lawlib_rooms.webp) |
| **櫃台** | **二樓書架走道** |
| ![](blender_renders/lawlib_counter.webp) | ![](blender_renders/lawlib_stacks.webp) |
| **二樓：書架、東牆外文書** | **二樓往東南閱覽區** |
| ![](blender_renders/lawlib_stacks2.webp) | ![](blender_renders/lawlib_upper.webp) |
| **樓梯平台往上看 B 跑** | **二樓往下看樓梯井** |
| ![](blender_renders/lawlib_landing.webp) | ![](blender_renders/lawlib_well.webp) |
| **討論室 A（白板在西牆、螢幕在東牆）** | **入口：雙開玻璃門、感應門柱** |
| ![](blender_renders/lawlib_disc.webp) | ![](blender_renders/lawlib_door.webp) |
| **二樓：期刊合訂本、現期期刊架** | **書背（索書號標籤）** |
| ![](blender_renders/lawlib_journals.webp) | ![](blender_renders/lawlib_thesis.webp) |
| **萬才館大廳：圖書館的門** | **萬才館大廳：遠一點** |
| ![](blender_renders/wancai_lldoor.webp) | ![](blender_renders/wancai_lldoor_far.webp) |

### 17.6 遊戲內截圖（修改前＝擋掉 GLB 的程序化備用模型｜修改後＝正式模型；11:00，晚上那張 20:30）

| 鏡頭 | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
{shot_rows}

### 17.7 窗景（遊戲畫面，1024×512）

| 南（白天／晚上） | 北（白天／晚上） | 西（白天／晚上） |
|---|---|---|
| ![](../../../assets/models/env/views/lawlib_south_day.webp) | ![](../../../assets/models/env/views/lawlib_north_day.webp) | ![](../../../assets/models/env/views/lawlib_west_day.webp) |
| ![](../../../assets/models/env/views/lawlib_south_night.webp) | ![](../../../assets/models/env/views/lawlib_north_night.webp) | ![](../../../assets/models/env/views/lawlib_west_night.webp) |

### 17.8 配置的問題（已經傳給 LAWWW；配置是 LAWWW 的，我不改）

1. 兩間討論室的白板（配置在北牆）擋在北窗前面 → GLB 先放在西側的牆；建議配置改西牆＋`ry`。
2. 一樓盆栽 (2.2, 7.1) 壓在第四個閱覽隔間的桌子上 → GLB 照配置放（會看到盆子和桌子重疊）；建議改 (2.9, 7.3)。
3. 書架標示牌太寬、相鄰兩塊重疊（r1s／r2s、r4s／r5s 同一個平面會閃）。
4. 「法律學院圖書館」牌子在備用模型裡被牆蓋住（GLB 的牆面做在牌子後面，看得到）。
5. 二樓 B 跑最上面一階和樓板邊之間 22 cm 的縫（GLB 補成樓板）。
6. 同一道門兩側大小不一樣（法圖 1.6×2.5 m、萬才館 1.2×2.4 m）。
7. 二樓兩塊吊牌的 `y`（6.9、6.4）看起來是絕對高度，遊戲會再加 4.2 m（變成 11.1、10.6，在屋頂上面）→ GLB 的背板照絕對高度放；建議配置改成 2.7、2.2。

### 17.9 還沒達到參考品質的地方

1. **沒有照片參考**：室內是照使用者的描述做的遊戲化設計，不是還原真實館舍（材質、家具、書架排法、櫃台位置都是推估）。
2. 書是程式畫的書背：近看是真的書名、索書號，但每一種模組重複出現（{info['book_instances']} 格只有 {info['book_modules']} 種）；沒有斜放、平放的書。
3. 討論室的門是「推開的拉門」，不會動；入口玻璃門關著（出去是互動點）。
4. 吊牌、房間名稱的字要靠遊戲畫；標示牌重疊的問題（17.8 第 3 點）要改遊戲的程式。
5. 窗景北面那張左半邊是很近的建築牆面（萬才館背面那一帶的套件建築）。
6. 沒有 iPhone 實機驗證；整合測試（走路、坐下、上下樓、鏡頭、存讀檔）由 LAWWW 跑。
"""
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '## 17. 萬才館 法律學院圖書館' not in v
open(p, 'w').write(v.rstrip('\n') + '\n' + doc); print('doc ok')
