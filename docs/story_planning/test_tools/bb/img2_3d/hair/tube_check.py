"""每一束頭髮：法線朝內（朝頭的中心）的面積比例。單面的髮片≈0；圓管（麵條）≈0.3～0.5。也量每束沿長度的寬度變化（尖端收不收）。"""
import sys, numpy as np
sys.path.insert(0, sys.argv[1]); from vrm_hair_probe import load_glb, acc, components
for p in sys.argv[2:]:
    js, binc = load_glb(p); mats = js['materials']; hm = [i for i, m in enumerate(mats) if 'HAIR' in m['name'].upper()]
    allP = []
    prims = []
    for mesh in js['meshes']:
        for pr in mesh['primitives']:
            if pr.get('material') in hm:
                P = acc(js, binc, pr['attributes']['POSITION']).astype(float); I = acc(js, binc, pr['indices']).reshape(-1, 3).astype(int)
                prims.append((mats[pr['material']]['name'], P, I)); allP.append(P[np.unique(I)])
    A = np.concatenate(allP); hc = np.array([np.median(A[:, 0]), A[:, 1].max() - 0.12, np.median(A[:, 2])])  # 頭頂往下 12 cm ≈ 頭的中心
    for nm, P, I in prims:
        v0, v1, v2 = P[I[:, 0]], P[I[:, 1]], P[I[:, 2]]; fn = np.cross(v1 - v0, v2 - v0); ar = np.linalg.norm(fn, axis=1) / 2
        cen = (v0 + v1 + v2) / 3; inward = ((fn * (cen - hc)).sum(1) < 0)
        print(f"{p.split('/')[-1]:24s} {nm[-14:]:14s} tris {len(I):6d}  inward-facing area {ar[inward].sum() / ar.sum():.2f}")
