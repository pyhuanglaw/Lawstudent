"""draft"""
import math
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import common as C


def _unit(v):
    v = np.asarray(v, float); n = np.linalg.norm(v, axis=-1, keepdims=True); return v / np.maximum(n, 1e-12)


def sph(a, b):
    """方位角 a（0＝正前方 -Y、+90＝人物的左手邊 +X、180＝正後方）、仰角 b（度）→ 單位向量"""
    a = np.radians(a); b = np.radians(b)
    return np.stack([np.sin(a) * np.cos(b), -np.cos(a) * np.cos(b), np.sin(b)], -1)


def _world(o):
    mw = np.array(o.matrix_world); P = C.co(o); return P @ mw[:3, :3].T + mw[:3, 3]


class Head:
    def __init__(self, m):
        arm, face, body = m['arm'], m['face'], m['body']
        F = _world(face); B = _world(body)
        fmats = [s.material.name if s.material else '' for s in face.material_slots]
        fam = {'J_Bip_C_Head'} | set(C.descendants(arm, 'J_Bip_C_Head'))
        wB = C.vgroup_weights(body, fam)
        nF = len(F)
        fpolys = [(list(p.vertices), fmats[p.material_index]) for p in face.data.polygons]
        bpolys = [list(p.vertices) for p in body.data.polygons]
        skin = [pv for pv, mn in fpolys if 'Face_00_SKIN' in mn]
        bhead = [pv for pv in bpolys if min(wB[i] for i in pv) > 0.45]
        V = np.vstack([F, B]).tolist()
        self.bvh_scalp = BVHTree.FromPolygons(V, skin + [[i + nF for i in pv] for pv in bhead])
        self.bvh_all = BVHTree.FromPolygons(V, [pv for pv, mn in fpolys] + [[i + nF for i in pv] for pv in bpolys])
        self.bvh_body = BVHTree.FromPolygons(B.tolist(), bpolys)
        sk = np.array(sorted({i for pv in skin for i in pv})); hk = np.array(sorted({i for pv in bhead for i in pv}))
        S = np.vstack([F[sk], B[hk]])
        brow = np.array(sorted({i for pv, mn in fpolys if 'FaceBrow' in mn for i in pv}))
        self.brow_z = float(F[brow][:, 2].mean()); self.brow_top = float(F[brow][:, 2].max())
        self.z_top = float(S[:, 2].max())
        fr = F[sk]; self.y_front = float(fr[fr[:, 2] > self.brow_top][:, 1].min())
        self.y_back = float(B[hk][:, 1].max())
        hd = (self.y_back - self.y_front) / 2
        self.c = np.array([0.0, (self.y_front + self.y_back) / 2, self.z_top - hd])
        self.S = S; self.F = F; self.fsk = F[sk]

    def ray(self, bvh, o, d, maxd=0.5):
        r = bvh.ray_cast(Vector(o), Vector(d), maxd)
        return None if r[0] is None else np.array(r[0])

    def R(self, d, outside=False):
        d = _unit(d)
        if not outside:
            h = self.ray(self.bvh_scalp, self.c, d)
            if h is not None: return float(np.dot(h - self.c, d))
        h = self.ray(self.bvh_scalp, self.c + d * 0.3, -d)
        if h is not None: return float(np.dot(h - self.c, d))
        loc = self.bvh_scalp.find_nearest(Vector(self.c + d * 0.1))[0]
        return float(np.dot(np.array(loc) - self.c, d))


def apply(m):
    H = Head(m)
    print('center', H.c.round(4), 'top', H.z_top, 'front', H.y_front, 'back', H.y_back, 'brow', H.brow_z, H.brow_top)
    # ear: face skin points far to the side
    fs = H.fsk
    for side in (1, -1):
        e = fs[(fs[:, 0] * side > 0.07)]
        print('side', side, 'n', len(e), 'x', e[:, 0].min().round(3), e[:, 0].max().round(3), 'y', e[:, 1].min().round(3), e[:, 1].max().round(3), 'z', e[:, 2].min().round(3), e[:, 2].max().round(3))
        for z in np.arange(1.40, 1.56, 0.01):
            s = e[np.abs(e[:, 2] - z) < 0.005]
            if len(s): print('   z %.2f  |x|max %.3f  y %.3f..%.3f' % (z, np.abs(s[:, 0]).max(), s[:, 1].min(), s[:, 1].max()))
    A = np.arange(0, 181, 10); Bs = np.arange(-70, 91, 10)
    print('R inside (rows=beta, cols=alpha 0..180)')
    print('      ' + ' '.join('%5d' % a for a in A))
    for b in Bs[::-1]:
        print('%5d ' % b + ' '.join('%5.3f' % H.R(sph(a, b)) for a in A))
    print('R outside')
    for b in Bs[::-1]:
        print('%5d ' % b + ' '.join('%5.3f' % H.R(sph(a, b), True) for a in A))
    print('z of points (inside)')
    for b in Bs[::-1]:
        print('%5d ' % b + ' '.join('%5.3f' % (H.c + sph(a, b) * H.R(sph(a, b)))[2] for a in A))
