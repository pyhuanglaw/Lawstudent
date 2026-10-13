"""VISUAL_REVIEW 第 25 節（教室門模組）。
用法：python3 docs/art-rebuild/second_ai/drafts/door_fill.py <Blender 渲染資料夾（door_*.png）> <遊戲原型截圖資料夾（g_door*.png）>"""
import json, os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
BR, GM = sys.argv[1:3]


def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert('RGB')
    if w and im.size[0] > w: im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)


info = json.load(open(R + '/assets/models/env/second_ai/furniture_study.json', encoding='utf8'))['modules']
NM = {'door_frame': '門框', 'door_leaf_open': '門片（開著、貼牆）', 'door_leaf_closed': '門片（關著）', 'door_plate': '門牌'}
rows = ['| 模組 | 三角形 | 尺寸（寬×高×深） | 說明 |', '|---|---|---|---|']
for k in NM:
    v = info[k]; rows.append(f"| {NM[k]}（`{k}`） | {v['tris']:,} | {'×'.join(f'{x:g}' for x in v['size'])} | {v.get('note', '')} |")
bl = []
LB = {'corridor': '走廊那一面：門開著（門片貼牆）、門框、門牌', 'closed': '關著的門', 'inside': '教室那一面', 'detail': '把手、觀景窗近看'}
for n in ('corridor', 'closed', 'inside', 'detail'):
    p = f'{BR}/door_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/blender_renders/door_{n}.webp', 1100); bl.append(f'**{LB[n]}**\n\n![](blender_renders/door_{n}.webp)\n')
gm = []
GL = {'door101': '博雅 101 的門（從大廳看；開著，門片貼在大廳那一面的牆上）', 'door102': '博雅 102 的門（關著）'}
for n in ('door101', 'door102'):
    p = f'{GM}/g_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/shots/door_game_{n}.webp', 1100); gm.append(f'**{GL[n]}**\n\n![](shots/door_game_{n}.webp)\n')
V = {'spec': '四個模組都在 `furniture_study.glb`（和桌椅同一個材質 `study_furn`、同一張貼圖集）：\n\n' + '\n'.join(rows), 'blender': '\n'.join(bl) or '（沒有）', 'game': '\n'.join(gm) or '（沒有）'}
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'door_review.md'), encoding='utf8').read()
for k, v in V.items(): tpl = tpl.replace('@@' + k + '@@', str(v))
assert '@@' not in tpl
vr = D + '/VISUAL_REVIEW.md'; s = open(vr, encoding='utf8').read()
assert '## 25. 教室門模組' not in s, '第 25 節已經在了'
open(vr, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + tpl)
print('ok', len(bl), len(gm))
