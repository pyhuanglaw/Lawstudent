#!/usr/bin/env python3
"""坐下的高度要用的人物比例表（SIT-HEIGHT-1104，LAWWW2-C 2026-11-04；LAWWW-C 22:57Z 派工）。

遊戲原本坐下一律往下 0.47 m×身高比例（character3d.js，照男生骨架、Z3.chair 椅面 0.485 m 校的）。可是 VRoid 的女生腿比較短
（大腿根在身高 54%，男生 57.5%），坐下以後大腿陷進椅面 9～13 cm、桌子到胸口。改成照每個模型自己的比例算：
  往下＝身高 ×（大腿根 ul − 0.047）− 0.452   → 坐下以後大腿根離座位地面＝0.047×身高＋0.452（所有人一樣；原本只有男生 npc_m1 是這樣，這兩個常數照它校：
  它的往下 0.467 不變）。0.047×身高＝大腿根到大腿底部的平均（量到 0.036～0.072，裙子、寬褲會量太厚、頂點太少的腿量不準，所以不用每個人自己的）
比例＝在模型檔裡量的長度 ÷ 遊戲縮放用的高度（身體不含頭髮的高度＋0.03，和 character3d.js 一樣），所以和遊戲裡的身高無關：
  ul＝大腿根（J_Bip_L/R_UpperLeg，兩邊平均）離腳底多高；
  th＝站姿時大腿中段（髖到膝的 30～70%）、離腿骨 0.074×高度以內的頂點（不含頭髮；衣服算在內）往後（VRM 0.x 的 +z）最遠多少（95 百分位）——坐下大腿水平時＝大腿根到大腿底部；
  hip、knee、ank＝骨盆（J_Bip_C_Hips）、膝、腳踝的高度（參考）。

用法：
  python3 tools/anim/sit_fit_table.py --assets src/assets3d.js --root . [--json 輸出.json] [--js 輸出.js]
"""
import argparse, json, os, re, struct, sys
import numpy as np

TH, SEAT = 0.047, 0.452                                       # 往下＝身高×(ul−TH)−SEAT（character3d.js C.SIT_TH、C.SIT_SEAT）


def load(path):
    d = open(path, 'rb').read(); n = struct.unpack('<I', d[12:16])[0]; return json.loads(d[20:20 + n]), d, 20 + n + 8


def acc(J, d, bo, i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]
    comp = {5126: np.float32, 5123: np.uint16, 5121: np.uint8, 5125: np.uint32, 5122: np.int16, 5120: np.int8}[a['componentType']]
    k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; isz = np.dtype(comp).itemsize
    off = bo + bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride')
    if st and st != k * isz:
        raw = np.frombuffer(d, np.uint8, count=st * a['count'], offset=off).reshape(a['count'], st)[:, :k * isz]
        return np.frombuffer(raw.tobytes(), comp).reshape(a['count'], k).astype(float)
    return np.frombuffer(d, comp, count=k * a['count'], offset=off).reshape(a['count'], k).astype(float)


def measure(path):
    J, d, bo = load(path)
    par = {}
    for i, nd in enumerate(J['nodes']):
        for c in nd.get('children', []): par[c] = i
    byname = {nd.get('name'): i for i, nd in enumerate(J['nodes'])}
    def wpos(nm):
        i = byname[nm]; p = np.zeros(3)
        while i is not None: p = p + np.array(J['nodes'][i].get('translation', [0, 0, 0]), float); i = par.get(i)
        return p
    pts = []; ymin, ymax = 1e9, -1e9
    for me in J['meshes']:
        if 'hair' in me.get('name', '').lower(): continue
        for pr in me['primitives']:
            a = J['accessors'][pr['attributes']['POSITION']]; ymin = min(ymin, a['min'][1]); ymax = max(ymax, a['max'][1])
            pts.append(acc(J, d, bo, pr['attributes']['POSITION']))
    P = np.concatenate(pts); mh = ymax - ymin + 0.03
    th = []
    for s in ('L', 'R'):
        A, B = wpos('J_Bip_%s_UpperLeg' % s), wpos('J_Bip_%s_LowerLeg' % s); ax = B - A; L = np.linalg.norm(ax); ax = ax / L
        t = (P - A) @ ax; R = P - A - np.outer(t, ax); rr = np.linalg.norm(R, axis=1)
        m = (t > 0.3 * L) & (t < 0.7 * L) & (rr < 0.074 * mh)
        th.append(float(np.percentile(R[m][:, 2], 95)) if m.any() else 0.05 * mh)
    h = lambda nm: (wpos(nm)[1] - ymin) / mh
    return {'ul': round((h('J_Bip_L_UpperLeg') + h('J_Bip_R_UpperLeg')) / 2, 4), 'th': round(sum(th) / 2 / mh, 4),
            'hip': round(h('J_Bip_C_Hips'), 4), 'knee': round((h('J_Bip_L_LowerLeg') + h('J_Bip_R_LowerLeg')) / 2, 4),
            'ank': round((h('J_Bip_L_Foot') + h('J_Bip_R_Foot')) / 2, 4)}


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--assets', default='src/assets3d.js'); ap.add_argument('--root', default='.')
    ap.add_argument('--json'); ap.add_argument('--js'); A = ap.parse_args()
    src = open(A.assets, encoding='utf8').read()
    used = {}
    for m in re.finditer(r"'char\.([a-z0-9_]+)':\s*\{url:'([^']+\.vrm)'[^}]*?height:([0-9.]+)", src):
        used.setdefault(os.path.basename(m.group(2)), {'url': m.group(2), 'keys': [], 'heights': []})
        u = used[os.path.basename(m.group(2))]; u['keys'].append(m.group(1)); u['heights'].append(float(m.group(3)))
    table = {}
    for fn, u in sorted(used.items()):
        p = os.path.join(A.root, u['url'])
        if not os.path.exists(p): print('沒有檔案', p, file=sys.stderr); continue
        try: r = measure(p)
        except Exception as e: print('量不到', fn, e, file=sys.stderr); continue
        table[fn] = r
        H = sum(u['heights']) / len(u['heights']); old = 0.47 * H / 1.75; new = H * (r['ul'] - TH) - SEAT
        print('%-28s ul %.4f th %.4f  身高 %.2f：往下 %.3f → %.3f（高 %+.1f cm）  %s' % (fn, r['ul'], r['th'], H, old, new, (old - new) * 100, ','.join(u['keys'])[:60]))
    if A.json: json.dump(table, open(A.json, 'w'), ensure_ascii=False, indent=1)
    if A.js:
        body = ','.join("'%s':%s" % (k, v['ul']) for k, v in sorted(table.items()))
        open(A.js, 'w').write('{' + body + '}\n')
    print('共 %d 個模型' % len(table))
