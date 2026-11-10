#!/usr/bin/env python3
"""階梯教室長桌下面的置物架往上移（SIT-HEIGHT-1104，LAWWW2-C 2026-11-04；BB-C 22:55「階梯教室大腿陷進扶手和椅面」）——直接改 GLB，不用重烘光照貼圖。
坐下的高度照每個模型的大腿厚度算以後（character3d.js 的 C.SIT_FIT），每個人都坐在椅面上（原本女生陷 10～15 cm、男生 5 cm），膝蓋也跟著高了：
階梯教室（sitFeet 關著：腳不往前伸）膝蓋關節在平台上 0.48～0.55 m、膝蓋前緣在座位點前面 0.40～0.56 m；男生的膝蓋（npc_m1 前緣 0.54、頂 0.56）
會穿過桌下置物架（平台上 0.515～0.525、前緣擋片到 0.55，座位點前面 0.44～0.75）。置物架、前緣擋片整個往上 0.115：架子 0.63～0.64、擋片到 0.665
（桌板底 0.72，書放得進去；膝蓋頂最高 0.61，空 2 cm 以上）。
改的網格（都沒有光照貼圖：TEXCOORD_1 沒有，鋼的部分是即時光，移動不用重烘）：
  assets/models/env/classroom_201.glb         desks_steel（法律系館A 201，tools/blender/classroom_201.py）
  assets/models/env/second_ai/boya_interior.glb      LECT_101_steel、LECT_102_steel（博思 101、102，tools/blender/env_second/teach_interior.py --set boya）
  assets/models/env/second_ai/gongtong_interior.glb  LECT_101_steel（共同 101，--set gongtong）
只移「y＝那一排平台＋0.515／0.525／0.55、z 在那一排置物架範圍裡」的頂點（每排 48 個：架子、擋片兩個方塊，各 24 個頂點）；腳本裡的置物架也改成同一個高度（重跑 Blender 一樣）。
用法：python3 tools/blender/env_second/lecture_shelf_raise.py [--check]   （--check：只數，不寫）
"""
import json, os, struct, sys
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DY = 0.115
YS = (0.515, 0.525, 0.55)          # 桌面下 0.235、0.225、0.2（平台以上）


def js_layout(path, var):
    s = open(os.path.join(ROOT, path), encoding='utf-8').read(); i = s.index(var); s = s[s.index('{', i):]
    return json.JSONDecoder().raw_decode(s)[0]


def rows_201():
    C = js_layout('src/data/classroom_layout.js', 'CLASSROOM_LAYOUT'); dk = C['desk']; out = []
    for r in range(C['rows']):
        h = C['rise'] * (r + 1); zA = C['rowZ0'] + r * C['rowDepth'] + dk['dz'] - dk['d'] / 2
        out.append((h, zA + 0.03 - 0.002, zA + 0.335 + 0.002, -dk['w'] / 2, dk['w'] / 2))
    return out


def rows_teach(layout, var, rid):
    J = js_layout(layout, var); out = []
    for r in J['rooms']:
        if r.get('kind') != 'lecture' or str(r['id']) != str(rid): continue
        Y = J['floors'][r['lv'] | 0]['y']; fwd = 1 if r.get('stage') == 'S' else -1
        for q in r['rowsData']:
            zF = q['deskZ'] + fwd * r['deskD'] / 2; za, zb = sorted([zF - fwd * 0.335, zF - fwd * 0.03])
            out.append((Y + q['y'], za - 0.002, zb + 0.002, r['seatX0'], r['seatX1']))
    return out


JOBS = [('assets/models/env/classroom_201.glb', [('desks_steel', rows_201)]),
        ('assets/models/env/second_ai/boya_interior.glb', [('LECT_101_steel', lambda: rows_teach('src/data/boya_layout.js', 'BOYA_LAYOUT', 101)),
                                                           ('LECT_102_steel', lambda: rows_teach('src/data/boya_layout.js', 'BOYA_LAYOUT', 102))]),
        ('assets/models/env/second_ai/gongtong_interior.glb', [('LECT_101_steel', lambda: rows_teach('src/data/gongtong_layout.js', 'GONGTONG_LAYOUT', 101))])]


def main(check):
    for path, meshes in JOBS:
        p = os.path.join(ROOT, path); d = bytearray(open(p, 'rb').read())
        jl = struct.unpack('<I', d[12:16])[0]; J = json.loads(bytes(d[20:20 + jl])); bo = 20 + jl + 8
        changed = False
        for name, rowsf in meshes:
            rows = rowsf(); mi = next(i for i, m in enumerate(J['meshes']) if m.get('name') == name)
            for pr in J['meshes'][mi]['primitives']:
                ai = pr['attributes']['POSITION']; a = J['accessors'][ai]; bv = J['bufferViews'][a['bufferView']]
                assert a['componentType'] == 5126 and a['type'] == 'VEC3', (name, a['componentType'])
                st = bv.get('byteStride') or 12; off = bo + bv.get('byteOffset', 0) + a.get('byteOffset', 0); n = a['count']
                P = np.array([struct.unpack_from('<3f', d, off + k * st) for k in range(n)], dtype=np.float64)
                mv = np.zeros(n, bool); per = []
                for (h, z0, z1, x0, x1) in rows:
                    sel = np.zeros(n, bool)
                    for y in YS: sel |= np.abs(P[:, 1] - (h + y)) < 0.0015
                    sel &= (P[:, 2] >= z0) & (P[:, 2] <= z1) & (P[:, 0] >= x0 - 0.01) & (P[:, 0] <= x1 + 0.01)
                    per.append(int(sel.sum())); mv |= sel
                print('%s %s：每排 %s 個頂點（共 %d）' % (os.path.basename(path), name, per, int(mv.sum())))
                if not mv.any(): print('   沒有找到置物架（已經移過？）'); continue
                if check: continue
                for k in np.nonzero(mv)[0]:
                    x, y, z = P[k]; struct.pack_into('<3f', d, off + k * st, x, y + DY, z)
                P[mv, 1] += DY
                a['min'] = [float(v) for v in P.min(0).astype(np.float32)]; a['max'] = [float(v) for v in P.max(0).astype(np.float32)]; changed = True
        if changed and not check:
            jb = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
            while len(jb) % 4: jb += b' '
            binc = bytes(d[bo - 8:])   # BIN 區塊（長度、型別、內容）
            total = 12 + 8 + len(jb) + len(binc)
            out = struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(jb), 0x4E4F534A) + jb + binc
            open(p, 'wb').write(out); print('   寫回', path, len(out), 'bytes')


if __name__ == '__main__':
    main('--check' in sys.argv)
