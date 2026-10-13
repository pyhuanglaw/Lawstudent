"""trees_wt：VISUAL_REVIEW 第 15 節（⑦行道樹）：規格、測試、效能、截圖、渲染、缺點；PNG→WebP；接在 VISUAL_REVIEW.md 最後。
用法（驗收跑完之後）：python3 docs/art-rebuild/second_ai/drafts/trees_fill.py"""
import glob, json, os, re
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
n = 0
for f in sorted(glob.glob(D + '/shots/trees_*.png') + glob.glob(D + '/test_shots/trees/**/*.png', recursive=True) + glob.glob(D + '/test_shots/street_trees_integration/*.png')):
    Image.open(f).convert('RGB').save(f[:-4] + '.webp', 'WEBP', quality=82, method=6); os.remove(f); n += 1
print('converted', n)
L = D + '/test_logs/' + (os.environ.get('TREES_LOG') or 'trees')   # 2026-10-13：在 LAWWW 469ae8c 重新驗收的 log 在 test_logs/trees_469ae8c
names = ['street_trees_unit', 'street_trees_integration', 'campus_glb_integration', 'gongguan_glb_integration', 'wz_street_integration', 'street_props_integration',
         'see_through', 'campus_layout_nav', 'p0_movement', 'reachability_all', 'zone_transitions']
res = {}
for nm in names:
    t = open(f'{L}/{nm}.log').read(); res[nm] = (len(re.findall(r'^PASS', t, re.M)), len(re.findall(r'^FAIL ', t, re.M)), 'ALL PASS' in t)
assert all(v[1] == 0 and v[2] for v in res.values()), res
info = json.load(open(R + '/assets/models/env/second_ai/street_trees.json'))
log = open(f'{L}/street_trees_integration.log').read().split('\n')
perf = {}
for zid in ('campus', 'gongguan', 'wenzhou'):
    line = [l for l in log if l.startswith(f'PASS {zid}：效能')][0]; perf[zid] = json.loads(line[line.index('{'):])
LBL = {'gate_avenue': '進校門往東看椰林大道', 'avenue_row': '大道南側人行道，沿著樹列', 'small_palms': '小椰林道', 'black_forest': '黑森林（榕樹）',
       'from_gate': '公館：校門口往南看', 'to_campus': '公館：往校門看（背景的椰林大道）', 'park': '溫州街小公園的大樹', 'street': '溫州街巷子裡的行道樹'}
ZN = {'campus': '校園', 'gongguan': '公館', 'wenzhou': '溫州街'}
rows = ['| 區域／鏡頭（17:30） | draw call：改之前 → 正式（倍數） | 三角形：改之前 → 正式（倍數） | 畫模型的樹／畫卡片的樹 |', '|---|---|---|---|']
for zid, d in perf.items():
    for k, v in d.items():
        rows.append(f"| {ZN[zid]}：{LBL[k]} | {v['calls'][0]} → {v['calls'][1]}（×{v['calls'][2]}） | {v['tris'][0]:,} → {v['tris'][1]:,}（×{v['tris'][2]}） | {v['near']}／{v['cards']} |")
LABEL = {'gate_avenue': '進校門往東看椰林大道', 'avenue_row': '大道南側人行道，沿著樹列', 'black_forest': '黑森林（榕樹）', 'wz_park': '溫州街小公園的大樹（榕樹）',
         'small_palms': '小椰林道', 'to_campus': '公館往校門看', 'follow': '玩家鏡頭（手機直向）：大道旁的大樹下'}
TIME = {'1100': '11:00', '1730': '17:30', '2030': '20:30'}
srows = ['| 鏡頭 | 修改前（程序化的葉片卡樹） | 修改後（Blender 正式模型） |', '|---|---|---|']
for v in json.load(open(R + '/tools/blender/env_second/shots/trees_after.json')):
    b = os.path.basename(v['out'])[:-4]; m = re.match(r'trees_after_(.+)_(\d{4})$', b); key, tm = m.group(1), m.group(2)
    assert os.path.exists(f'{D}/shots/trees_before_{key}_{tm}.webp') and os.path.exists(f'{D}/shots/trees_after_{key}_{tm}.webp'), (key, tm)
    srows.append(f'| {LABEL[key]} {TIME[tm]} | ![修改前](shots/trees_before_{key}_{tm}.webp) | ![修改後](shots/trees_after_{key}_{tm}.webp) |')
M = info['models']
spec = '、'.join(f"{ {'camphor_a': '樟樹 A', 'camphor_b': '樟樹 B', 'banyan_a': '榕樹', 'palm_a': '大王椰子'}[k] } {v['tris_bark'] + v['tris_leaf']:,}（樹幹枝條 {v['tris_bark']:,}＋葉 {v['tris_leaf']:,}）" for k, v in M.items())
doc = open(D + '/drafts/trees_review_draft.md').read().replace('{{SPEC}}', f"`street_trees.glb` **{info['bytes'] / 1e6:.2f} MB**；三角形：{spec}；遠景卡片 2 個三角形")
doc = doc.replace('{{TESTS}}', '、'.join(f'`{k}` {v[0]}' for k, v in res.items())).replace('{{PERF}}', '\n'.join(rows)).replace('{{SHOTS}}', '\n'.join(srows))
assert '{{' not in doc
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '## 15. 行道樹' not in v
k = v.index('\n## 16. ')   # 第 15 節放在第 14、16 節中間（照編號）
open(p, 'w').write(v[:k].rstrip('\n') + '\n' + doc.rstrip('\n') + '\n' + v[k:]); print('doc ok', res)
