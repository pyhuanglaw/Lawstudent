"""FOUR_BUILDINGS_REVIEW.md：把效能表（@@perf_table@@）和普通、共同、校園的截圖補進去。
用法：python3 docs/art-rebuild/second_ai/drafts/review1013_fill.py <scratchpad>"""
import json, os, re, sys
from PIL import Image
SP = sys.argv[1]
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
DOC = R + '/docs/art-rebuild/second_ai/FOUR_BUILDINGS_REVIEW.md'
D = R + '/docs/art-rebuild/second_ai/shots/review1013'


def posts(path):
    out = {}
    if not os.path.exists(path): return out
    for line in open(path, encoding='utf8'):
        m = re.match(r'post (\S+) (\{.*\})$', line.strip())
        if m: out[os.path.basename(m.group(1))[:-4]] = json.loads(m.group(2))
    return out


def webp(src, dst, width=960, q=82):
    im = Image.open(src).convert('RGB')
    if width and im.size[0] > width: im = im.resize((width, round(im.size[1] * width / im.size[0])), Image.LANCZOS)
    im.save(f'{D}/{dst}.webp', 'WEBP', quality=q, method=6)


P = posts(SP + '/boya_audit/audit.log'); P.update(posts(SP + '/four_audit/run.log')); P.update(posts(SP + '/four_audit/redo.log'))
ROWS = [('博雅', 'empty_b101_back', '101 最後一排往講台（空）', '1280×720'), ('博雅', 'empty_b101_stage', '101 從講台往座位（空）', '1280×720'),
        ('博雅', 'empty_b101_seat', '101 第 3 排的視線（空）', '1280×720'), ('博雅', 'lecture_b101_back', '101 最後一排往講台（16 個聽眾）', '1280×720'),
        ('博雅', 'lecture_b101_stage', '101 從講台往座位（16 個聽眾）', '1280×720'), ('博雅', 'lecture_b101_seat', '101 第 3 排的視線（16 個聽眾）', '1280×720'),
        ('博雅', 'empty_lobby_eye', '大廳入口往西北', '1280×720'), ('博雅', 'empty_lobby_top', '大廳高處', '1280×720'),
        ('博雅', 'm_lobby', '剛進門（跟隨鏡頭、有 HUD；含玩家人物）', '手機橫向 844×390'), ('博雅', 'm_study', '自習小桌旁（鏡頭在 101 裡）', '手機橫向 844×390'),
        ('普通', 'i_pt_corr', '門廳', '1280×720'), ('普通', 'i_pt_101', '101 教室', '1280×720'), ('普通', 'i_pt_lobby', '入口往北', '1280×720'),
        ('普通', 'm_pt_spawn', '剛進門（跟隨鏡頭、有 HUD；含玩家人物）', '手機橫向 844×390'),
        ('共同', 'i_gt_lobby', '大廳', '1280×720'), ('共同', 'i_gt_101', '共 101 階梯教室', '1280×720'), ('共同', 'i_gt_102', '102 教室', '1280×720'),
        ('共同', 'm_gt_spawn', '剛進門（跟隨鏡頭、有 HUD；含玩家人物）', '手機橫向 844×390')]
lines = ['| 建築 | 鏡頭 | 畫面 | draw call | 三角形 |', '|---|---|---|---|---|']
for b, k, label, vp in ROWS:
    if k in P: lines.append(f"| {b} | {label} | {vp} | {P[k]['calls']:,} | {P[k]['tris']:,} |")
lines.append('')
lines.append('對照：溫州街、公館街景的效能目標是同一個鏡頭 draw call ≤ 約 310、三角形 ≤ 42 萬（含陰影）。校園鏡頭（整個校園一起畫）：普通、博雅附近 131–230 次／70–80 萬三角形。')
doc = open(DOC, encoding='utf8').read()
doc = doc.replace('@@perf_table@@', '\n'.join(lines))
# 普通、共同、校園的截圖
SH = SP + '/four_audit/'
for s, d in [('i_pt_corr', 'pt_corr'), ('i_pt_101', 'pt_101'), ('i_pt_lobby', 'pt_lobby'), ('i_gt_101', 'gt_101'), ('i_gt_lobby', 'gt_lobby'), ('i_gt_102', 'gt_102'),
             ('c_ptby_aerial', 'c_ptby_aerial'), ('c_by_gap', 'c_by_gap'), ('c_pt_front2', 'c_pt_front'), ('c_by_lake2', 'c_by_lake'), ('c_by_sw', 'c_by_sw'),
             ('c_gt_front', 'c_gt_front'), ('c_fd_street', 'c_fd_street')]:
    if os.path.exists(SH + s + '.png'): webp(SH + s + '.png', d)
for s, d in [('m_pt_spawn', 'm_pt_spawn'), ('m_gt_spawn', 'm_gt_spawn'), ('m_pt_door', 'm_pt_door'), ('m_by_door', 'm_by_door')]:
    if os.path.exists(SH + s + '.png'): webp(SH + s + '.png', d, None)
assert '@@' not in doc, re.findall(r'@@\w+@@', doc)
open(DOC, 'w', encoding='utf8').write(doc)
print('ok', len(P), 'posts')
