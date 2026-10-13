"""VISUAL_REVIEW 第 22 節（新社科院外觀）。
用法：python3 docs/art-rebuild/second_ai/drafts/socsci_fill.py <遊戲截圖資料夾> <Blender 渲染資料夾>
遊戲截圖資料夾裡：after.log、after2.log、after3.log（新外觀，本機接線；後面的覆蓋前面的）、before.log、before2.log（LAWWW babb8c8）"""
import json, os, re, subprocess, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
G, BR = sys.argv[1:3]


def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert('RGB')
    if w and im.size[0] > w: im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)


def posts(*paths):
    out = {}
    for path in paths:
        if not os.path.exists(path): continue
        for line in open(path, encoding='utf8'):
            m = re.match(r'post (\S+) (\{.*\})$', line.strip())
            if m: out[os.path.basename(m.group(1))[:-4]] = json.loads(m.group(2))
    return out


def errs(*paths):
    E = []
    for p in paths:
        if os.path.exists(p): E += [l.strip()[:200] for l in open(p, encoding='utf8') if l.startswith('shot') and 'errors: []' not in l]
    return E


A = posts(G + '/after.log', G + '/after2.log', G + '/after3.log', G + '/after_final.log')   # 後面的覆蓋前面的（after_final＝最後的模型全部重拍）
Bf = posts(G + '/before.log', G + '/before2.log')
E = errs(G + '/after_final.log', G + '/before.log', G + '/before2.log')
N = ['from_linze', 'plaza', 'lib_w', 'wancai_balcony', 'courtyard', 'lib_door', 'bld_west', 'aerial2', 'plaza_1730', 'plaza_2000', 'lib_w_2000', 'courtyard_2000', 'mobile2']
LB = {'from_linze': '從霖澤館門口往東看（11:00）', 'plaza': '法學院廣場往東看（11:00）', 'lib_w': '圖書館西面：小路上往東南看（11:00）', 'wancai_balcony': '萬才館陽台的高度往東南看：屋頂（11:00）',
      'courtyard': '中庭：從西邊的入口往東看（11:00）', 'lib_door': '圖書館入口：中庭往北看（11:00）', 'bld_west': '大樓西面主入口（11:00）', 'aerial2': '空拍：西邊高處（11:00）',
      'plaza_1730': '法學院廣場往東看 17:30', 'plaza_2000': '法學院廣場往東看 20:00', 'lib_w_2000': '圖書館西面 20:00', 'courtyard_2000': '中庭 20:00', 'mobile2': '手機直向 390×844：玩家在法學院廣場往東看（跟隨鏡頭）'}
os.makedirs(D + '/shots', exist_ok=True); os.makedirs(D + '/blender_renders', exist_ok=True)
rows, perf = [], []
for n in N:
    a, b = f'{G}/a_{n}.png', f'{G}/b_{n}.png'
    if not (os.path.exists(a) and os.path.exists(b)): continue
    w = None if 'mobile' in n else 1100
    webp(a, f'{D}/shots/socsci_after_{n}.webp', w); webp(b, f'{D}/shots/socsci_before_{n}.webp', w)
    rows.append(f"| {LB[n]} | ![](shots/socsci_before_{n}.webp) | ![](shots/socsci_after_{n}.webp) |")
    if ('a_' + n) in A and ('b_' + n) in Bf:
        x, y = A['a_' + n], Bf['b_' + n]
        perf.append(f"| {LB[n]} | {y['calls']}／{y['tris']:,} | {x['calls']}／{x['tris']:,} | ×{x['calls'] / y['calls']:.2f}／×{x['tris'] / y['tris']:.2f} |")
bl = []
for n in ('lib_north', 'lib_nw', 'lib_door', 'courtyard', 'bld_nw', 'aerial'):
    p = f'{BR}/soc_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/blender_renders/socsci_{n}.webp', 1100); bl.append(f'![](blender_renders/socsci_{n}.webp)')
spec = json.loads(subprocess.check_output(['python3', R + '/tools/blender/env_second/glb_specs.py', R + '/assets/models/env/second_ai/campus_socsci.glb']).decode().strip().splitlines()[-1])
info = json.load(open(R + '/assets/models/env/second_ai/campus_socsci.json', encoding='utf8'))['nav']
nav = ['   - 阻擋（中心 x, z、寬 w（x）、深 d（z））：'] + [f"     - {r['what']}：({r['x']:.2f}, {r['z']:.2f})、{r['w']:.2f}×{r['d']:.2f}" + ('（可以坐：長椅）' if r.get('seat') else '') for r in info['rects']]
nav += [f"   - 圓形：{c['what']} ({c['x']}, {c['z']}) 半徑 {c['r']}" for c in info['circles']]
nav += ['   - 舊的 `CK.modern` 社科院（`ckPlace(soc,110,-70,-π/2)`）的導航阻擋要拿掉；中庭（x 95–125、z −70～−58）、大樓一樓的柱廊（西面 x 95–97.4、北面 z −58～−55.6）走得到。']
cam = [f"   - {c['what']}：x {c['box'][0]}–{c['box'][3]}、y {c['box'][1]}–{c['box'][4]:.2f}、z {c['box'][2]}–{c['box'][5]}" for c in info['cam']]
doors = [f"   - {d['what']}：互動點建議 ({d['x']:.1f}, {d['z']:.1f})；{d['note']}" for d in info['doors']]
doors += ['   - 圖書館的門現在是 `SL3.DOOR`（舊外觀的西面 (97.9,−70)）：換成新外觀後改到南面 (101, −69.3)、出來站在 (101, −67.6) 面向南（中庭）。大樓的兩個門：室內第一階段做好之前先關著或做成看得懂的告示。']
ERR = '沒有' if not E else '有：' + '；'.join(E[:3])
V = dict(bytes=f"{spec['bytes'] / 1e6:.2f}", tris=f"{spec['tris_unique']:,}", calls=spec['draw_calls_approx'], mats=spec['materials'], tex=spec['texture_sizes'], texkb=spec['texture_KB'],
         nav='\n'.join(nav), cam='\n'.join(cam), doors='\n'.join(doors), shots='\n'.join(rows), perf='\n'.join(perf), blender='\n'.join(bl), errtxt=ERR)
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'socsci_review.md'), encoding='utf8').read()
for k, v in V.items(): tpl = tpl.replace('@@' + k + '@@', str(v))
assert '@@' not in tpl, re.findall(r'@@\w+@@', tpl)
vr = D + '/VISUAL_REVIEW.md'; s = open(vr, encoding='utf8').read()
assert '## 22. 新社科院外觀' not in s, '第 22 節已經在了（先 git checkout 再跑）'
open(vr, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + tpl)
print('ok', len(rows), 'pairs', len(perf), 'perf rows', E[:2])
