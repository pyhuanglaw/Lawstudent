"""VISUAL_REVIEW 第 26 節（博雅窗外景＋北面窗建議）。用法：python3 docs/art-rebuild/second_ai/drafts/boya_views_fill.py <LAWWW commit>"""
import os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
COMMIT = sys.argv[1]
NM = {'boya_south': '一樓南面兩扇窗（入口兩旁）', 'boya_2f_south': '二樓南面窗', 'boya_2f_north': '二樓北面窗（201、202）', 'boya_north': '**建議的**一樓北面窗（大廳北牆）'}
rows = []
for k, lab in NM.items():
    cells = []
    for t in ('day', 'night'):
        src = f'{R}/assets/models/env/views/{k}_{t}.webp'
        if os.path.exists(src):
            im = Image.open(src).convert('RGB'); im = im.resize((512, 256), Image.LANCZOS); im.save(f'{D}/shots/{k}_{t}.webp', 'WEBP', quality=82, method=6)
            cells.append(f'![](shots/{k}_{t}.webp)')
        else: cells.append('—')
    rows.append(f'| `{k}` | {lab} | {cells[0]} | {cells[1]} |')
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'boya_views_review.md'), encoding='utf8').read()
tpl = tpl.replace('@@rows@@', '\n'.join(rows)).replace('@@commit@@', COMMIT)
assert '@@' not in tpl
p = D + '/VISUAL_REVIEW.md'; s = open(p, encoding='utf8').read()
assert '## 26. 博雅' not in s
open(p, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + tpl)
print('ok', len(rows))
