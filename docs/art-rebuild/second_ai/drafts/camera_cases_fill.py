"""CAMERA_WALLS.md（教學館室內鏡頭穿牆：固定案例的修改前／後）。
用法：python3 docs/art-rebuild/second_ai/drafts/camera_cases_fill.py <before 資料夾> <after 資料夾> <門口 before 資料夾> <門口 after 資料夾> <門口案例.json> [<cam_probe 的 probe.json>]
（資料夾＝tools/blender/env_second/shots/cam_cases_shots.py 的輸出：cases.json、cases.log、<id>.png）"""
import json, os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
BF, AF, DBF, DAF, DCASES = sys.argv[1:6]; PR = json.load(open(sys.argv[6])) if len(sys.argv) > 6 else {}
os.makedirs(D + '/shots/cam1013', exist_ok=True)


def load(p):
    d = {}
    for l in open(p, encoding='utf8'):
        if l.startswith('case '): r = json.loads(l[5:]); d[r['id']] = r
    return d


B, A = load(BF + '/cases.log'), load(AF + '/cases.log')
cases = {c['id']: c for c in json.load(open(BF + '/cases.json'))}
json.dump(list(cases.values()), open(D + '/camera_cases_1013.json', 'w'), ensure_ascii=False, indent=1)
DB, DA = load(DBF + '/cases.log'), load(DAF + '/cases.log')
dcases = json.load(open(DCASES))
ZN = {'boya': '博雅', 'putong': '普通', 'gongtong': '共同'}


def table(B, A, cases, BF, AF, ids):
    rows, pics = [], []
    for k in ids:
        b, a = B[k], A.get(k)
        for ph, src in (('before', BF), ('after', AF)):
            im = Image.open(f'{src}/{k}.png').convert('RGB'); im = im.resize((640, round(im.size[1] * 640 / im.size[0])), Image.LANCZOS)
            im.save(f'{D}/shots/cam1013/{ph}_{k}.webp', 'WEBP', quality=80, method=6)
        zone = k.split('_')[0]; c = cases.get(k)
        where = '剛進門（出生點、預設鏡頭）' if k.endswith('_spawn') else f"{'2F' if c['lv'] else '1F'} {c.get('area', '')}（{c['x']}, {c['z']}）"
        yaw = '—' if k.endswith('_spawn') else f"{c['yaw']:.2f}"

        def st(r):
            if not r: return '沒跑'
            return ('**牆後**' if r['behindWall'] else '牆前') + f"、水平 {r['horizDist']:.2f} m、比頭高 {r['cam'][1] - r['head'][1]:.2f} m"
        note = ''
        if a and not a['behindWall'] and a['horizDist'] < 1.0: note = '鏡頭貼到頭頂上方（往下看）'
        if k in PR and PR[k].get('nearest') and PR[k]['nearest'][0]['d'] < 0.3 and not PR[k]['nearest'][0]['name'].startswith('fallback'): note += ('；' if note else '') + f"鏡頭離「{PR[k]['nearest'][0]['name'].split('<')[0]}」只有 {PR[k]['nearest'][0]['d']} m（畫面一大塊黑）"
        if b['behindWall'] is False and a and a['horizDist'] >= 4.2 and not note: note = '對照組（兩版都在牆前）'
        rows.append(f"| `{k}` | {ZN[zone]} {where} | {yaw} | {st(b)}｜{b['calls']} | {st(a)}｜{a['calls'] if a else '—'} | {note} |")
        pics.append(f"| `{k}` | ![](shots/cam1013/before_{k}.webp) | ![](shots/cam1013/after_{k}.webp) |")
    return rows, pics


order = [k for k in B if k.endswith('_spawn')] + [k for k in B if not k.endswith('_spawn')]
rows, pics = table(B, A, cases, BF, AF, order)
dc = {c['id']: c for c in dcases}
drows, dpics = table(DB, DA, dc, DBF, DAF, [k for k in DB if not k.endswith('_spawn')])
nb = sum(1 for k in B if not k.endswith('_spawn') and B[k]['behindWall']); na = sum(1 for k in A if not k.endswith('_spawn') and A[k]['behindWall'])
close = sorted([k for k in A if not k.endswith('_spawn') and A[k]['horizDist'] < 1.0])
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'camera_cases.md'), encoding='utf8').read()
V = {'rows': '\n'.join(rows), 'pics': '\n'.join(pics), 'drows': '\n'.join(drows), 'dpics': '\n'.join(dpics), 'nb': nb, 'na': na, 'n': len([k for k in B if not k.endswith('_spawn')]), 'nclose': len(close), 'close': '、'.join(f'`{k}`' for k in close),
     'dnb': sum(1 for k in DB if not k.endswith('_spawn') and DB[k]['behindWall']), 'dna': sum(1 for k in DA if not k.endswith('_spawn') and DA[k]['behindWall']), 'dn': len([k for k in DB if not k.endswith('_spawn')])}
json.dump(dcases, open(D + '/camera_cases_1013_doors.json', 'w'), ensure_ascii=False, indent=1)
for k, v in V.items(): tpl = tpl.replace('@@' + k + '@@', str(v))
assert '@@' not in tpl
open(D + '/CAMERA_WALLS.md', 'w', encoding='utf8').write(tpl)
print('ok', len(rows), nb, na, close)
