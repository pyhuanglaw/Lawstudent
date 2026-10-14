"""把吉他社社辦提案的 @@where@@ 填好（圖片先轉成 WebP 放在 shots/）。
用法：python3 docs/art-rebuild/second_ai/drafts/guitar_fill.py"""
DOC = 'docs/art-rebuild/second_ai/research/吉他社社辦_提案.md'
WHERE = '''用遊戲的導航格看萬才館周圍哪裡有空地（`tools/blender/env_second/shots/nav_map.py`，LAWWW `9884d29`；白＝走得到、深灰＝擋住；紅框＝候選）：

![](../shots/guitar_nav.webp)

- 萬才館東邊（x 104～118、z −122～−110）整塊在走不到的範圍（法學院後面，D26／D31），放不了。
- **霖澤館和萬才館中間**有一塊走得到的空地：x 54.5～72、z −118.6～−102.5（約 17.5×16 m）；北邊接走不到的範圍（法學院後面），南邊是兩館前面的廣場。
- 候選：在這塊空地的北半邊放一棟一層樓的「社團辦公室」（x 56.5～69.5、z −118.5～−111.5，13×7 m，門朝南），前面留 9 m 接廣場。

遊戲內畫面（LAWWW `9884d29`，本機；**紅色半透明框是候選的平房位置與大小，不是模型**；白色小方塊是門的位置；Playwright＋SwiftShader，不是 iPhone）：

**從上面看：現況**

![](../shots/guitar_gap_aerial_empty.webp)

**從上面看：候選的平房（紅框）**

![](../shots/guitar_gap_aerial_box.webp)

**從廣場往北看：現況**

![](../shots/guitar_gap_ground_empty.webp)

**從廣場往北看：候選的平房（紅框）**

![](../shots/guitar_gap_ground_box.webp)

@@gapnotes@@'''
import os
s = open(DOC, encoding='utf-8').read()
assert '@@where@@' in s
N = 'docs/art-rebuild/second_ai/drafts/guitar_notes.md'
s = s.replace('@@where@@', WHERE.replace('@@gapnotes@@', open(N, encoding='utf-8').read().strip() if os.path.exists(N) else ''))
open(DOC, 'w', encoding='utf-8').write(s)
print('ok')
