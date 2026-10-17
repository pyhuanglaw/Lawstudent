"""找 GLB 裡「疊在同一個平面上」的面（遊戲裡會閃爍：z-fighting）。
用法：
  一個檔：/opt/blenv/bin/python tools/blender/env_second/check_coplanar.py -- <glb> [--min-area 0.01] [--tol 0.002] [--only 名稱片段] [--json out.json]
  整個資料夾（含子資料夾的所有 .glb）：
          /opt/blenv/bin/python tools/blender/env_second/check_coplanar.py -- assets/models/env --md 清單.md [--json 全部.json] [--top 8] [--skip 片段,片段]
  資料夾模式每個檔案重開一次場景；輸出依「一定會閃的面積」排序的清單（Markdown 表格＋每個檔案前幾對的位置）。

做法：
- 每個面（世界座標）算平面：法線取到 0.02 的精度、到原點的距離取到 tol。
- 同一個平面（法線相同或相反）裡的面兩兩比：先用平面上的外接矩形篩（依 u 排序掃描，不是全部兩兩比），
  再算凸多邊形真正的交集面積（Sutherland–Hodgman），≥ min-area 平方公尺才算疊面。
- 跳過同一個物件裡共用頂點的相鄰面；跳過互斥的布置（SEASON_X_on／_off、體育館 SET_CEREMONY／LECTURE／CONCERT、宿舍 Y203_／Y412_）。
- facing：
  - same＝同一面朝外：兩個平面相差 < 0.5 mm（--exact）**一定會閃**；0.5 mm～tol（預設 2 mm）只有在遠處才閃
    （遊戲鏡頭 near 0.1、24 位元深度：20 m 外分得出約 0.24 mm、60 m 外約 2 mm），標「遠處」。
  - back-to-back＝背對背：兩個材質都是單面（背面剔除）就看不到另一面、不閃；有一個是雙面材質（glTF doubleSided）時，
    鏡頭要看得到其中一面的背面才會閃——通常是相鄰兩棟的側牆、夾在牆裡面，看不到。清單只把 same 算「一定會閃」，背對背＋雙面另外計數（ds）。
  - 注意：本專案 Blender 匯出的材質幾乎都是 doubleSided（Blender 預設不剔除背面）。
- 輸出每一對：兩個物件、材質、位置（遊戲座標）、重疊面積。依面積排序。
"""
import json, math, os, re, sys, time
import bpy
from mathutils import Vector

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
TARGET = A[0]
def opt(k, d):
    return type(d)(A[A.index(k) + 1]) if k in A else d
MIN_AREA = opt('--min-area', 0.01); TOL = opt('--tol', 0.002); EXACT = opt('--exact', 0.0005); ONLY = opt('--only', ''); OUT = opt('--json', ''); MD = opt('--md', ''); TOP = opt('--top', 8)
SKIP = [s for s in opt('--skip', '').split(',') if s]


def clip(subj, clipper):
    """凸多邊形交集（Sutherland–Hodgman；2D 點列）"""
    def inside(p, a, b): return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= -1e-9
    def inter(p, q, a, b):
        x1, y1, x2, y2, x3, y3, x4, y4 = p[0], p[1], q[0], q[1], a[0], a[1], b[0], b[1]
        den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
        if abs(den) < 1e-12: return q
        t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    out = subj
    for i in range(len(clipper)):
        a, b = clipper[i], clipper[(i + 1) % len(clipper)]; inp = out; out = []
        if not inp: break
        s_ = inp[-1]
        for e in inp:
            if inside(e, a, b):
                if not inside(s_, a, b): out.append(inter(s_, e, a, b))
                out.append(e)
            elif inside(s_, a, b): out.append(inter(s_, e, a, b))
            s_ = e
    return out


def area2(P):
    return abs(sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))) / 2


def ccw(P):
    a = sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))
    return P if a > 0 else P[::-1]


def toggle(ob):
    """互斥的布置：季節（SEASON_X_on／_off）、體育館的活動布置（SET_CEREMONY／SET_LECTURE／SET_CONCERT；SET_STAGE 共用）。
    回傳（家族, 值）；同一個家族、不同的值＝不會同時出現，疊在一起不算"""
    while ob is not None:
        m = re.match(r'(SEASON_[A-Z0-9]+)_(on|off)', ob.name)
        if m: return (m.group(1), m.group(2))
        m = re.match(r'SET_([A-Z]+)', ob.name)
        if m and m.group(1) != 'STAGE': return ('SET', m.group(1))
        if re.match(r'(Y203_|ROOMMATE_KAI)', ob.name): return ('YEAR', '203')   # 宿舍四人房（dorm_room4.py）：203 和 412 的東西不會同時出現
        if re.match(r'(Y412_|NAMETAG_)', ob.name): return ('YEAR', '412')
        m = re.match(r'Y(312|507|409)_', ob.name)                                   # 大二～大四（2026-10-17）
        if m: return ('YEAR', m.group(1))
        ob = ob.parent
    return None


def scan(glb):
    """匯入一個 GLB，回傳（面數, 疊面清單）"""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb)
    faces = []   # (key, obj, mat, verts(ws), vidx, nn, d, n, double_sided)
    for ob in bpy.context.scene.objects:
        if ob.type != 'MESH' or (ONLY and ONLY not in ob.name): continue
        me = ob.data; M = ob.matrix_world; NM = M.to_3x3().inverted_safe().transposed(); sc = abs(M.to_3x3().determinant()) ** (2 / 3)
        vs = [M @ v.co for v in me.vertices]; tg = toggle(ob)
        for p in me.polygons:
            if p.area * sc < MIN_AREA * 0.5: continue
            n = (NM @ p.normal)
            if n.length < 1e-9: continue
            n = n.normalized()
            if n.z < -0.5 and max(v.z for v in (M @ me.vertices[i].co for i in p.vertices)) <= 0.01: continue   # 地面高度、朝下的面（底面）：在地底下，看不到
            s = 1                                        # 正規化方向（n 與 −n 視為同一個平面）
            for c in (n.x, n.y, n.z):
                if abs(c) > 1e-6: s = 1 if c > 0 else -1; break
            nn = n * s; P = [vs[i] for i in p.vertices]; d = nn.dot(P[0])
            key = (round(nn.x / 0.02), round(nn.y / 0.02), round(nn.z / 0.02), round(d / TOL))
            mt = me.materials[p.material_index] if me.materials and p.material_index < len(me.materials) else None
            faces.append((key, ob.name, mt.name if mt else '', P, set(p.vertices), nn, d, n, bool(mt and not mt.use_backface_culling), tg))
    buckets = {}
    for f in faces:
        k = f[0]
        for dk in (0, -1, 1):   # 距離剛好在格子邊界上的也要比到
            buckets.setdefault((k[0], k[1], k[2], k[3] + dk), []).append(f)
    pairs = {}
    for k, L in buckets.items():
        if len(L) < 2: continue
        n = L[0][5]; u = n.orthogonal().normalized(); v = n.cross(u)
        items = []
        for f in L:
            xs = [u.dot(p) for p in f[3]]; ys = [v.dot(p) for p in f[3]]
            items.append(((min(xs), max(xs), min(ys), max(ys)), f))
        items.sort(key=lambda t: t[0][0])
        for i in range(len(items)):
            bi, fi = items[i]
            for j in range(i + 1, len(items)):
                bj, fj = items[j]
                if bj[0] >= bi[1]: break                  # 依 u 排序：後面的都在右邊，不會再重疊
                if abs(fi[6] - fj[6]) > TOL: continue
                if fi[1] == fj[1] and fi[4] & fj[4]: continue   # 同一個物件的相鄰面
                if fi[9] and fj[9] and fi[9][0] == fj[9][0] and fi[9][1] != fj[9][1]: continue   # 互斥的布置（季節、活動），不會同時出現
                ox = min(bi[1], bj[1]) - max(bi[0], bj[0]); oy = min(bi[3], bj[3]) - max(bi[2], bj[2])
                if ox <= 0 or oy <= 0 or ox * oy < MIN_AREA: continue
                Pi = ccw([(u.dot(p), v.dot(p)) for p in fi[3]]); Pj = ccw([(u.dot(p), v.dot(p)) for p in fj[3]])
                ar = area2(clip(Pi, Pj)) if len(Pi) >= 3 and len(Pj) >= 3 else 0.0   # 真正的交集面積（面是凸的：三角形、四邊形）
                if ar < MIN_AREA: continue
                c = sum(fi[3], Vector()) / len(fi[3])
                kk = tuple(sorted([(fi[1], fi[2]), (fj[1], fj[2])])) + (round(c.x, 1), round(c.y, 1), round(c.z, 1))
                same = fi[7].dot(fj[7]) > 0
                if kk not in pairs or pairs[kk]['area'] < ar:
                    gap = abs(fi[6] - fj[6])
                    pairs[kk] = dict(a=fi[1], amat=fi[2], b=fj[1], bmat=fj[2], at=[round(c.x, 2), round(-c.y, 2), round(c.z, 2)], area=round(ar, 3),
                                     facing='same' if same else 'back-to-back', gap_mm=round(gap * 1000, 2), visible=same and gap < EXACT, ds=fi[8] or fj[8],
                                     n=[round(fi[7].x, 2), round(fi[7].z, 2), round(-fi[7].y, 2)])   # 第一個面的法線（遊戲座標 x, y, z）：室內可以看它朝不朝房間裡面
    return len(faces), sorted(pairs.values(), key=lambda r: -r['area'])


def line(r):
    return '%(a)s[%(amat)s] × %(b)s[%(bmat)s]  遊戲座標≈(%(x)s)  %(area)s m²  %(facing)s%(vis)s' % dict(r, x='%.2f, %.2f, %.2f' % (r['at'][0], r['at'][2], r['at'][1]), vis=('（一定會閃）' if r['visible'] else '（相差 %s mm：遠處才閃）' % r['gap_mm']) if r['facing'] == 'same' else ('（雙面材質：看得到背面才會閃）' if r['ds'] else '（單面：不閃）'))


if os.path.isdir(TARGET):
    files = sorted(os.path.join(dp, f) for dp, _, fs in os.walk(TARGET) for f in fs if f.endswith('.glb') and not any(s in os.path.join(dp, f) for s in SKIP))
    report = []
    for g in files:
        t0 = time.time()
        try: nf, res = scan(g)
        except Exception as e:
            print('FAIL', g, e); report.append(dict(file=g, error=str(e))); continue
        vis = [r for r in res if r['visible']]
        report.append(dict(file=g, faces=nf, pairs=len(res), visible=len(vis), visible_area=round(sum(r['area'] for r in vis), 2),
                           far=sum(1 for r in res if r['facing'] == 'same' and not r['visible']),
                           ds=sum(1 for r in res if r['facing'] != 'same' and r['ds']), top=vis[:TOP]))
        print('%-70s faces %6d  疊面 %5d  一定會閃 %4d（%.1f m²）  遠處才閃 %4d  背對背雙面 %5d  %.0fs' % (g, nf, len(res), len(vis), report[-1]['visible_area'], report[-1]['far'], report[-1]['ds'], time.time() - t0), flush=True)
    report.sort(key=lambda r: -r.get('visible_area', 1e9))
    if OUT: json.dump(report, open(OUT, 'w'), ensure_ascii=False, indent=1)
    if MD:
        with open(MD, 'w') as f:
            f.write('# 共平面（z-fighting）掃描：%s\n\n- 工具：`tools/blender/env_second/check_coplanar.py`（min-area %s m²、tol %s m）\n'
                    '- 「一定會閃」＝兩個面同一面朝外、疊在同一個平面：從哪裡看都會閃。依它的面積排序。\n'
                    '- 「背對背雙面」＝背對背、有一個是雙面材質：鏡頭看得到背面才會閃（通常夾在牆裡，看不到），只計數。\n\n'
                    '- 「遠處才閃」＝同一面朝外、兩個平面相差 0.5 mm～%s m：60 m 外才會閃，只計數。\n\n'
                    '| 檔案 | 面數 | 疊面（全部） | 一定會閃 | 面積 m² | 遠處才閃 | 背對背雙面 |\n|---|---:|---:|---:|---:|---:|---:|\n' % (TARGET, MIN_AREA, TOL, TOL))
            for r in report:
                if 'error' in r: f.write('| `%s` | 讀取失敗：%s | | | | | |\n' % (r['file'], r['error'])); continue
                f.write('| `%s` | %d | %d | %d | %.2f | %d | %d |\n' % (r['file'], r['faces'], r['pairs'], r['visible'], r['visible_area'], r['far'], r['ds']))
            for r in report:
                if r.get('top'):
                    f.write('\n## `%s`（一定會閃的前 %d 對）\n' % (r['file'], len(r['top'])))
                    for x in r['top']: f.write('- ' + line(x) + '\n')
    print('files', len(files))
else:
    nf, res = scan(TARGET)
    vis = [r for r in res if r['visible']]
    print('faces', nf, 'overlap pairs', len(res), '一定會閃', len(vis), '遠處才閃', sum(1 for r in res if r['facing'] == 'same' and not r['visible']), '背對背雙面', sum(1 for r in res if r['facing'] != 'same' and r['ds']))
    for r in (vis + [r for r in res if not r['visible']])[:60]: print('  ' + line(r))
    if OUT: json.dump(vis + [r for r in res if not r['visible'] and r['facing'] == 'same'] + [r for r in res if r['facing'] != 'same'][:200], open(OUT, 'w'), ensure_ascii=False, indent=1)   # 一定會閃、遠處才閃的全部列出＋背對背的前 200 對
