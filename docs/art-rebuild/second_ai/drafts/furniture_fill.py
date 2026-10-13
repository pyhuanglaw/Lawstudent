"""VISUAL_REVIEW 第 23 節（教學館家具模組）。
用法：python3 docs/art-rebuild/second_ai/drafts/furniture_fill.py <Blender 渲染資料夾（furn_*.png）> <遊戲原型截圖資料夾（g_*.png）>"""
import json, os, subprocess, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
BR, GM = sys.argv[1:3]


def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert('RGB')
    if w and im.size[0] > w: im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)


info = json.load(open(R + '/assets/models/env/second_ai/furniture_study.json', encoding='utf8'))
spec = json.loads(subprocess.check_output(['python3', R + '/tools/blender/env_second/glb_specs.py', R + '/assets/models/env/second_ai/furniture_study.glb']).decode().strip().splitlines()[-1])
NM = {'study_table2': '自習雙人桌', 'study_chair': '自習椅', 'study_chair_lod1': '自習椅（簡化版，遠處）', 'round_table': '圓桌', 'lecture_seat': '講堂椅（座面放下：有人坐）', 'lecture_seat_up': '講堂椅（座面收起：空位）',
      'lecture_seat_lod1': '講堂椅（簡化版，遠處的排）', 'lecture_standard': '排尾側板', 'lecture_desk': '前方連續桌板（一個座位一段）'}
rows = []
for k, v in info['modules'].items():
    sz = '×'.join(f'{x:g}' for x in (v['size'][0], v['size'][1], v['size'][2]))
    how = []
    if 'seat' in v: how.append(f"座位點 ({v['seat']['x']}, {v['seat']['y']}, {v['seat']['z']})")
    if 'seats' in v: how.append(f"{len(v['seats'])} 個座位點（見 .json）")
    if 'pitch' in v: how.append(f"座位間距 {v['pitch']} m")
    for key in ('note', 'offset', 'nav'):
        if v.get(key): how.append(v[key])
    rows.append(f"| {NM.get(k, k)}（`{k}`） | {v['tris']:,} | {sz} | {'；'.join(how)} |")
os.makedirs(D + '/blender_renders', exist_ok=True); os.makedirs(D + '/shots', exist_ok=True)
bl = []
LB = {'overview': '全部：講堂 4 排（排距 1.0、每排高 0.16；藍灰色座面收起的是空位）、自習雙人桌、圓桌', 'study': '自習雙人桌＋面對面兩張椅子', 'round': '圓桌＋四張椅子', 'lecture_stage': '講堂：從講台往座位看（前方連續桌板）',
      'lecture_side': '講堂：側面（側板、扶手、桌板、座面收起）', 'chair_detail': '自習椅近看（彎管、夾板的弧度與厚度）'}
for n in ('overview', 'study', 'round', 'lecture_stage', 'lecture_side', 'chair_detail'):
    p = f'{BR}/furn_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/blender_renders/furniture_{n}.webp', 1100); bl.append(f'**{LB[n]}**\n\n![](blender_renders/furniture_{n}.webp)\n')
gm = []
GL = {'lobby': '博雅大廳：兩張自習雙人桌、一張圓桌（後面是原本的單人小桌、討論桌）', 'lobby_close': '博雅大廳近看', '101_back': '博雅 101 最後一排後面的平台：新的講堂椅一排（3 張放下、3 張收起）＋桌板；前面是原本的活動椅',
      'mobile': '手機直向 390×844（跟隨鏡頭，有 HUD）'}
for n in ('lobby', 'lobby_close', '101_back', 'mobile'):
    p = f'{GM}/g_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/shots/furniture_game_{n}.webp', None if n == 'mobile' else 1100); gm.append(f'**{GL[n]}**\n\n![](shots/furniture_game_{n}.webp)\n')
V = {'spec': f"GLB **{spec['bytes'] / 1e3:.0f} KB**、三角形（9 種合計）**{spec['tris_unique']:,}**、網格 {spec['meshes']}（每種一個）、材質 {spec['materials']}、貼圖 {spec['texture_sizes']}（共 {spec['texture_KB']} KB，WebP）。",
     'rows': '\n'.join(rows), 'blender': '\n'.join(bl) or '（沒有）', 'game': '\n'.join(gm) or '（沒有）'}
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'furniture_review.md'), encoding='utf8').read()
for k, v in V.items(): tpl = tpl.replace('@@' + k + '@@', str(v))
assert '@@' not in tpl
vr = D + '/VISUAL_REVIEW.md'; s = open(vr, encoding='utf8').read()
assert '## 23. 教學館家具模組' not in s, '第 23 節已經在了（先 git checkout 再跑）'
open(vr, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + tpl)
print('ok', len(rows), len(bl), len(gm))
