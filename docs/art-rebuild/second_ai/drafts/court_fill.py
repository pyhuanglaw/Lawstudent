"""把系籃球場位置提案的 @@where@@、@@spec@@ 填好（圖片先轉成 WebP 放在 shots/、blender_renders/）。
用法：python3 docs/art-rebuild/second_ai/drafts/court_fill.py"""
import os
DOC = 'docs/art-rebuild/second_ai/research/系籃球場_位置提案.md'
WHERE = '''用遊戲的導航格找放得下 17×16 m（場地 15×14 m＋四周 1 m）、又不用拆東西的空地（`tools/blender/env_second/shots/nav_map.py`，在 LAWWW `9884d29`＝方案 A 的校園；白＝走得到、深灰＝擋住、紅框＝候選）：

![](../shots/court_nav.webp)

| 選項 | 場地中心（鋪面範圍） | 朝向 | 現在那裡 | 好處 | 要注意 |
|---|---|---|---|---|---|
| **A（建議）醉月湖東側** | (−4, −113)（x −12.5～4.5、z −121～−105） | 籃框在北（−z），中線朝南 | 草地，鋪面範圍內導航格 0% 擋住 | **方向和真實一樣**：真實的戶外球場在椰林大道北側、舊體育館與醉月湖一帶；離霖澤館（法律系）約 30 m，下課走過去就到；湖、湖心亭、博雅當背景 | 北邊走得到的範圍到 z −124（籃架柱子在 z −120.85，後面還有 3 m）；博雅二樓北面窗的窗景（`boya_2f_north`）可能看得到球場一角——接了以後我重拍 |
| B 男一舍與體育館之間 | (48.5, 67)（x 40～57、z 59～75） | 籃框在南（+z），中線朝北（舟山路） | 草地，1% 擋住（場內一棵樹的樹幹） | 離現在的活動點（體育館門口西側 (69.8, 59.0)）約 22 m；體育課、宿舍都在旁邊 | 真實的球場不在舟山路這一側；場內一棵樹要移走；夾在兩棟樓中間；離舟山路南緣 7.5 m |

（另外看過舟山路上的兩塊空地 B1 (40～57, 40～56)、B2 (58～75, 38～54)：在舟山路上，不合用。萬才館東邊 (104～118, −122～−110) 整塊走不到。）

### A：醉月湖東側（建議）

遊戲內原型（**本機注入、不是整合**：LAWWW `9884d29` 的校園，用遊戲的 GLTFLoader 載入 `bball_court.glb` 放在 (−4, −113)；Playwright＋SwiftShader，**不是 iPhone**）：

**從上面看（13:00）**：球場在醉月湖（左）和霖澤館（右）之間的草地上

![](../shots/court_a_aerial.webp)

**從東南邊（腳踏車架旁）看（13:00）**

![](../shots/court_a_ground.webp)

**同一個位置，練球時間 17:45（週五 17:30–19:00）**

![](../shots/court_a_evening.webp)

**從醉月湖這邊看過去（13:00）**

![](../shots/court_a_lake.webp)

**手機直向 390×844（跟隨鏡頭，有 HUD；站在兩張長椅中間、面向場內＝建議的活動點 (3.3, −112.7)）**

![](../shots/court_a_mobile.webp)

### B：男一舍與體育館之間

**從上面看（13:00，鏡頭朝南）**：下面是舟山路，右邊是男一舍，左邊是體育館門口那一棟；場中間有一棵樹

![](../shots/court_b_aerial.webp)

**從舟山路南側的草地往東南看（13:00）**：樹幹在場內

![](../shots/court_b_ground.webp)

**練球時間 17:45**

![](../shots/court_b_evening.webp)

**手機直向（站在兩張長椅中間、面向場內＝建議的活動點 (41.2, 66.7)）**：對面就是體育館門口那一棟的牆

![](../shots/court_b_mobile.webp)

@@notes@@'''
SPEC = '''規格：GLB **66 KB**（貼圖 512×512 純色格＋128×128 粗糙度／金屬度）、網格 3、材質 1、三角形 948（court 218、hoop 464、bench 266）。

Blender 渲染（Cycles；**不是遊戲畫面**；地面是預覽用的示意）：

**整個半場**

![](../blender_renders/court_overview.webp)

**籃架、籃板、籃框、籃網**

![](../blender_renders/court_hoop.webp)

**場邊長椅、籃球、水壺**

![](../blender_renders/court_bench.webp)

**正上方（場線）**

![](../blender_renders/court_top.webp)

驗收狀態：位置 **PROPOSAL**（等使用者選 A／B 或別的地方）；`bball_court.glb` **`MODEL_READY`**（還沒接）。

還沒達到參考品質的地方（自評）：
1. **沒有照片可以核對**臺大系隊練球的球場（鋪面顏色、籃架款式是一般戶外壓克力球場的樣子）；沙盒打不開臺大網站。
2. 鋪面是純色加細顆粒，沒有磨損、球印、修補過的痕跡；場線很新。
3. 籃網是線框（白色細條），近看比較硬；沒有隨風擺動。
4. 只有半場一個籃架；真實的戶外球場多半是全場或好幾面並排——這裡照分派做半場，要全場可以用同一個模型鏡射一份（另一個籃架＋另外半邊場線，三角形大約加倍）。
5. 球場四周沒有圍網、路燈：晚上練球要亮的話，建議在四角加路燈（`W3.lampPost()`）。'''
s = open(DOC, encoding='utf-8').read()
assert '@@where@@' in s and '@@spec@@' in s
s = s.replace('@@where@@', WHERE).replace('@@spec@@', SPEC)
NOTES = open('docs/art-rebuild/second_ai/drafts/court_notes.md', encoding='utf-8').read().strip() if os.path.exists('docs/art-rebuild/second_ai/drafts/court_notes.md') else ''
s = s.replace('@@notes@@', NOTES)
open(DOC, 'w', encoding='utf-8').write(s)
print('ok')
