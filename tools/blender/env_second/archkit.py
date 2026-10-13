"""校舍立面的共用工具（第二 AI 工作階段）：大一女舍、之後的普通／博雅教學館共用。共同教學館（campus_gongtong.py）是同一套做法的第一版，獨立保留不改。
用法：
    import archkit as K
    M = {...材質...}; accs = {}; K.setup_glass(M['glass'])
    kit = K.Kit(M, accs, prefix='fd_', place=(x, z, ry))   # 一棟一個 Kit（各自的座標換算），材質累積器共用（同材質最後合成一個網格）
    FR = K.Fr(...)；kit.wall_strip(FR, ..., holes)；kit.window(...)
    K.finish(accs, root, vc_keys)
座標：建築自己的座標（套件：中心在原點、地面 y=0、正面朝 +z）；place=(x, z, ry)＝ckPlace 的位置與朝向（ry 只支援 90° 的倍數），XF 換成校園世界座標。
"""
import math
import lib2 as L
from lib2 import Mesh, CMesh, g2b, bpy

NSEG = 6
GL_TOP, GL_BOT = (0.26, 0.31, 0.36), (0.06, 0.08, 0.10)   # 玻璃的上下顏色（線性；上面反射天空、下面暗）


def setup_glass(mat):
    """玻璃：亮燈、沒亮燈的窗同一個材質（自發光貼圖 64×64：左半黑＝沒亮燈；右半＝由上往下漸暗的室內燈光；遊戲端 ck_glass 不用 mipmap）"""
    lit = bpy.data.images.new('win_lit_grad', 64, 64, alpha=False); px = []
    for j in range(64):
        t = j / 63; k = [(0.50, 0.36, 0.22), (0.86, 0.70, 0.48), (1.0, 0.92, 0.76)]
        a, b, u = (k[0], k[1], t / 0.6) if t < 0.6 else (k[1], k[2], (t - 0.6) / 0.4)
        px += [0.0, 0.0, 0.0, 1.0] * 32 + ([a[i] + (b[i] - a[i]) * u for i in range(3)] + [1.0]) * 32
    lit.pixels.foreach_set(px); lit.pack()
    nt = mat.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = lit; tx.extension = 'EXTEND'
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Emission Color']); nt.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 1.0


def lin(h):
    """sRGB 色碼 → 線性 RGBA"""
    return [(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4) for v in (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))] + [1.0]


def newell(pts):
    n = [0.0, 0.0, 0.0]
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
    return n


def arc(uc, vs, r, n, a0=math.pi, a1=0.0):
    return [(uc + r * math.cos(a0 + (a1 - a0) * k / n), vs + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]


class Fr:
    """立面座標：u＝從外面看往右、v＝往上、d＝往外（法線）；原點 O（建築自己的座標）"""
    def __init__(self, O, R, N): self.O, self.R, self.N = O, R, N
    def p(self, u, v, d=0.0): return (self.O[0] + u * self.R[0] + d * self.N[0], self.O[1] + v, self.O[2] + u * self.R[2] + d * self.N[2])
    def dirv(self, du, dv, dd): return (du * self.R[0] + dd * self.N[0], dv, du * self.R[2] + dd * self.N[2])


def faces4(W, D, x0=0.0, z0=0.0):
    """長方形量體（中心 (x0,z0)、寬 W（x）、深 D（z））的四面：front（+z）、back（−z）、east（−x）、west（+x）"""
    return {'front': Fr((x0, 0, z0 + D / 2), (1, 0, 0), (0, 0, 1)), 'back': Fr((x0, 0, z0 - D / 2), (-1, 0, 0), (0, 0, -1)),
            'left': Fr((x0 - W / 2, 0, z0), (0, 0, 1), (-1, 0, 0)), 'right': Fr((x0 + W / 2, 0, z0), (0, 0, -1), (1, 0, 0))}


class Kit:
    def __init__(self, M, accs, prefix, place=(0.0, 0.0, 0.0), vc=('glass', 'misc', 'cel', 'cloth')):
        self.M, self.accs, self.prefix, self.vc = M, accs, prefix, vc
        self.px, self.pz, ry = place; self.cc, self.ss = round(math.cos(ry)), round(math.sin(ry))

    def XF(self, x, y, z): return (self.px + x * self.cc + z * self.ss, y, self.pz - x * self.ss + z * self.cc)

    def acc(self, k):
        if k not in self.accs: self.accs[k] = (CMesh if k in self.vc else Mesh)(self.prefix + k, self.M[k])
        return self.accs[k]

    def face(self, m, pts, want=None, uvs=None):
        if isinstance(m, str): m = self.acc(m)
        if want is not None:
            n = newell(pts)
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]; uvs = uvs[::-1] if uvs else uvs
        f = m.bm.faces.new([m.bm.verts.new(g2b(*self.XF(*p))) for p in pts])
        if uvs:
            lay = m.bm.loops.layers.uv.get('UVMap') or m.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, uvs): lp[lay].uv = uv
        return f

    def cface(self, m, pts, want, hexcol):
        if isinstance(m, str): m = self.acc(m)
        f = self.face(m, pts, want); m.paint([f], hexcol); return f

    def box(self, m, x0, x1, y0, y1, z0, z1, skip=(), col=None):
        """軸對齊方塊；skip：'bottom' 'top' 'back'（−z）'front'（+z）'left'（−x）'right'（+x）；col：頂點色（CMesh）"""
        if isinstance(m, str): m = self.acc(m)
        Fs = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
              'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
              'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
        for k, (pts, n) in Fs.items():
            if k in skip: continue
            f = self.face(m, pts, n)
            if col: m.paint([f], col)

    def fbox(self, m, fr, u0, u1, v0, v1, d0, d1, skip=(), col=None):
        """立面座標的方塊（u0..u1 × v0..v1 × 深度 d0..d1）；skip：'bottom' 'top' 'in'（d0 那一面）'out'（d1）'l'（u0）'r'（u1）"""
        if isinstance(m, str): m = self.acc(m)
        F_ = {'bottom': ([fr.p(u0, v0, d0), fr.p(u1, v0, d0), fr.p(u1, v0, d1), fr.p(u0, v0, d1)], (0, -1, 0)), 'top': ([fr.p(u0, v1, d0), fr.p(u1, v1, d0), fr.p(u1, v1, d1), fr.p(u0, v1, d1)], (0, 1, 0)),
              'in': ([fr.p(u0, v0, d0), fr.p(u1, v0, d0), fr.p(u1, v1, d0), fr.p(u0, v1, d0)], (0, 0, -1)), 'out': ([fr.p(u0, v0, d1), fr.p(u1, v0, d1), fr.p(u1, v1, d1), fr.p(u0, v1, d1)], (0, 0, 1)),
              'l': ([fr.p(u0, v0, d0), fr.p(u0, v0, d1), fr.p(u0, v1, d1), fr.p(u0, v1, d0)], (-1, 0, 0)), 'r': ([fr.p(u1, v0, d0), fr.p(u1, v0, d1), fr.p(u1, v1, d1), fr.p(u1, v1, d0)], (1, 0, 0))}
        for k, (pts, n) in F_.items():
            if k in skip: continue
            f = self.face(m, pts, fr.dirv(*n))
            if col: m.paint([f], col)

    def rect(self, m, fr, ua, ub, va, vb, d=0.0):
        return self.face(m, [fr.p(ua, va, d), fr.p(ub, va, d), fr.p(ub, vb, d), fr.p(ua, vb, d)], fr.N)

    def strip(self, m, fr, a, b, d0, d1, want):
        self.face(m, [fr.p(a[0], a[1], d0), fr.p(b[0], b[1], d0), fr.p(b[0], b[1], d1), fr.p(a[0], a[1], d1)], fr.dirv(*want))

    def wall_strip(self, fr, u0, u1, v0, v1, holes, mk='wall'):
        """一段牆（u0..u1 × v0..v1）挖掉開口：holes＝[{u, a（外框半寬）, vb（洞底）, vs（起拱）, arch, vt（方洞的頂）, nseg}]"""
        m = self.acc(mk); cur = u0
        for h in sorted(holes, key=lambda h: h['u']):
            hl, hr = h['u'] - h['a'], h['u'] + h['a']
            if hl > cur + 1e-4: self.rect(m, fr, cur, hl, v0, v1)
            if h['vb'] > v0 + 1e-4: self.rect(m, fr, hl, hr, v0, h['vb'])
            if h['arch']:
                P = arc(h['u'], h['vs'], h['a'], h.get('nseg', NSEG))
                for k in range(len(P) - 1):
                    (ua, va), (ub, vb) = P[k], P[k + 1]
                    self.face(m, [fr.p(ua, va), fr.p(ub, vb), fr.p(ub, v1), fr.p(ua, v1)], fr.N)
            elif v1 > h['vt'] + 1e-4: self.rect(m, fr, hl, hr, h['vt'], v1)
            cur = hr
        if u1 > cur + 1e-4: self.rect(m, fr, cur, u1, v0, v1)

    def glass_face(self, fr, pts_uv, d, lit_, vb, vt):
        uc = 0.875 if lit_ else 0.125
        uvs = [(uc, max(0.0, min(1.0, (v - vb) / max(1e-6, vt - vb)))) for u, v in pts_uv]
        m = self.acc('glass'); f = self.face(m, [fr.p(u, v, d) for u, v in pts_uv], fr.N, uvs)
        for lp in f.loops:
            t = max(0.0, min(1.0, ((lp.vert.co.z) - vb) / max(1e-6, vt - vb)))   # Blender z＝遊戲 y
            lp[m.col] = [GL_BOT[i] + (GL_TOP[i] - GL_BOT[i]) * t for i in range(3)] + [1.0]

    def sill(self, fr, x0, x1, vb, mk='trimw', out=0.2, th=0.08):
        tw = self.acc(mk)
        for (pts_, n) in (([fr.p(x0, vb, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, out), fr.p(x0, vb, out)], (0, 1, 0)),
                          ([fr.p(x0, vb - th, out), fr.p(x1, vb - th, out), fr.p(x1, vb, out), fr.p(x0, vb, out)], (0, 0, 1)),
                          ([fr.p(x0, vb - th, -0.06), fr.p(x1, vb - th, -0.06), fr.p(x1, vb - th, out), fr.p(x0, vb - th, out)], (0, -1, 0)),
                          ([fr.p(x0, vb - th, -0.06), fr.p(x0, vb, -0.06), fr.p(x0, vb, out), fr.p(x0, vb - th, out)], (-1, 0, 0)),
                          ([fr.p(x1, vb - th, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, out), fr.p(x1, vb - th, out)], (1, 0, 0))):
            self.face(tw, pts_, fr.dirv(*n))

    def window(self, fr, u, vb, ww, wh, f, lit_, rect_=True, dep=0.22, proud=0.04, door=False, has_sill=True, fmat='trimw', mull=None, transom=None):
        """一扇窗（窗洞在牆上挖、外框＝窗框外緣）：窗框（外凸 proud）＋外側面、窗洞內側（深 dep）、鋁框、直櫺（mull：位置清單，相對 u；預設中間一支）、
        橫櫺（transom：離窗台的高度）、玻璃、窗台。rect_=False：拱窗。door：門（沒有玻璃、窗台、下框、直櫺）"""
        r = ww / 2; ro = r + f; vs = vb + wh if rect_ else vb + wh - r; t = 0.05; tw = self.acc(fmat); fm = self.acc('frame')
        vt = vb + wh
        if f > 1e-4:
            self.rect(tw, fr, u - ro, u - r, vb, vs, proud); self.rect(tw, fr, u + r, u + ro, vb, vs, proud)
            if rect_: self.rect(tw, fr, u - ro, u + ro, vs, vs + f, proud)
            else:
                I, O = arc(u, vs, r, NSEG), arc(u, vs, ro, NSEG)
                for k in range(NSEG): self.face(tw, [fr.p(*I[k], proud), fr.p(*I[k + 1], proud), fr.p(*O[k + 1], proud), fr.p(*O[k], proud)], fr.N)
            if proud > 1e-4:
                self.strip(tw, fr, (u - ro, vb), (u - ro, vs), 0, proud, (-1, 0, 0)); self.strip(tw, fr, (u + ro, vb), (u + ro, vs), 0, proud, (1, 0, 0))
                if rect_: self.strip(tw, fr, (u - ro, vs + f), (u + ro, vs + f), 0, proud, (0, 1, 0))
                else:
                    for k in range(NSEG):
                        a = math.pi * (1 - (k + 0.5) / NSEG); self.strip(tw, fr, O[k], O[k + 1], 0, proud, (math.cos(a), math.sin(a), 0))
        else: I = arc(u, vs, r, NSEG)
        de = -dep - 0.01
        self.strip(tw, fr, (u - r, vb), (u - r, vs), proud, de, (1, 0, 0)); self.strip(tw, fr, (u + r, vb), (u + r, vs), proud, de, (-1, 0, 0))
        if rect_: self.strip(tw, fr, (u - r, vs), (u + r, vs), proud, de, (0, -1, 0))
        else:
            for k in range(NSEG):
                a = math.pi * (1 - (k + 0.5) / NSEG); self.strip(tw, fr, I[k], I[k + 1], proud, de, (-math.cos(a), -math.sin(a), 0))
        if not door: self.strip(tw, fr, (u - r, vb), (u + r, vb), -0.06 if has_sill else proud, de, (0, 1, 0))
        dd = -dep + 0.005
        self.rect(fm, fr, u - r, u - r + t, vb, vs, dd); self.rect(fm, fr, u + r - t, u + r, vb, vs, dd)
        if not door: self.rect(fm, fr, u - r + t, u + r - t, vb, vb + t, dd)
        if rect_: self.rect(fm, fr, u - r, u + r, vs - t, vs, dd)
        else:
            Ii, Io = arc(u, vs, r - t, NSEG), arc(u, vs, r, NSEG)
            for k in range(NSEG): self.face(fm, [fr.p(*Ii[k], dd), fr.p(*Ii[k + 1], dd), fr.p(*Io[k + 1], dd), fr.p(*Io[k], dd)], fr.N)
        if door: return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': False, 'vt': vs + f}
        top = vs if rect_ else vt - t
        for mu in (mull if mull is not None else [0.0]):
            self.rect(fm, fr, u + mu - 0.025, u + mu + 0.025, vb + t, top, -dep + 0.03)
            self.strip(fm, fr, (u + mu - 0.025, vb + t), (u + mu - 0.025, top), -dep + 0.03, -dep, (-1, 0, 0)); self.strip(fm, fr, (u + mu + 0.025, vb + t), (u + mu + 0.025, top), -dep + 0.03, -dep, (1, 0, 0))
        if transom is not None:
            ty = vb + transom
            self.rect(fm, fr, u - r + t, u + r - t, ty - 0.025, ty + 0.025, -dep + 0.03)
            self.strip(fm, fr, (u - r + t, ty + 0.025), (u + r - t, ty + 0.025), -dep + 0.03, -dep, (0, 1, 0))
        if rect_: pts = [(u - r, vb), (u + r, vb), (u + r, vs), (u - r, vs)]
        else: pts = [(u - r, vb), (u + r, vb)] + arc(u, vs, r, NSEG, 0.0, math.pi)[:]
        self.glass_face(fr, pts, -dep - 0.005, lit_, vb, vt)
        if has_sill: self.sill(fr, u - ro - 0.06, u + ro + 0.06, vb)
        return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': not rect_, 'vt': vs + f}


def lit_hash(*k):
    h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
    return h - math.floor(h) > 0.3          # 約七成的窗晚上亮


def finish(accs, root, vc_keys, smooth_keys=()):
    out = {}
    for k, m in accs.items():
        ob = m.finish(root, uv=(k not in vc_keys))
        if k in smooth_keys and ob is not None: L.smooth_mesh(ob, angle=math.pi)
        out[k] = ob
    return out
