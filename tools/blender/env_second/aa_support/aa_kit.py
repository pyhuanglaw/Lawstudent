"""日常失速、木曜日、山嵐書店室內共用的小工具（AA 子代理 2026-11-03；臨時支援 LAWWW2，SCENE_RULES 第 10 節）。
建在 env_second/lib2.py（L）、cafe_layout.py（CL）、tools/blender/plants.py（PL）之上（只讀、不改它們）。
座標＝遊戲區域座標（房間中心在原點、x 往東、z 往南、y 往上、店門在 +z）。家具「自己的座標」：正面（坐的人面向、打開的那一面）朝 +z，轉 ry。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir＝往室內的法線）；掛在牆上的東西進同一組。
材質一律加店的前綴（dof_／mok_／shl_）；純色零件放頂點色（vc 霧面、vcm 金屬、vcg 亮面），一個材質一次 draw call。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ENV2 = os.path.dirname(HERE)
sys.path.insert(0, ENV2)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import plants as PL   # noqa: E402（cafe_layout 已經把 tools/blender 加進 sys.path）

GEN = os.path.join(ENV2, 'textures', 'gen')
AUTO_SEG = False   # 第二版（木曜日、山嵐 v2）設 True：小、薄的倒角方塊只倒一段（看不出差別，三角形少六成）
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
ROUTE = {}   # SHOP-CC0-HELP-1113：Shop.route() 設定；頂點色零件（Xf 的 col=）照顏色改放到 CC0 材質組的網格（表上沒有的顏色照舊頂點色）


def _rt(m, col):
    """col 在 ROUTE 表上、而且 m 是頂點色網格 → (那個材質組的網格, None)；否則照舊"""
    if col is None or not ROUTE or not isinstance(m, VMesh): return m, col
    f = ROUTE.get(col.lower())
    return (f(m), None) if f else (m, col)


def args():
    A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    return lambda name, default=None: A[A.index(name) + 1] if name in A else default


def layout(path, var):
    return json.loads(subprocess.check_output(['node', '-e', f"process.stdout.write(JSON.stringify(require('./{path}')))"], cwd=L.ROOT))


def img_mat(name, fn, rough=0.6, emit=0.0, clip=False, tile=1.0, cull=False):
    """自製貼圖的材質（textures/gen/<fn>）；clip＝葉子、紙這種要挖空的（Alpha 經過 ROUND → glTF MASK）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], r.inputs[0]); nt.links.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m.use_backface_culling = cull; m['tile'] = tile; return m


def cell_uv(c, r, cw=1, ch=1, n=8, inset=0.004):
    """1024 圖集 8×8 格（aa_int_tex.py 的 box）→ UV (u0, v0, u1, v1)；圖的第 0 列在上面、UV 的 v 往上"""
    u0, u1 = c / n + inset, (c + cw) / n - inset; v1, v0 = 1 - r / n - inset, 1 - (r + ch) / n + inset
    return (u0, v0, u1, v1)


class Xf:
    """物件自己的座標（x 右、z 前、y 上；正面朝 +z）→ 區域座標：中心 (px,pz)、轉 ry（人面向 (sin ry, cos ry)）"""
    def __init__(self, px, pz, ry=0.0, py=0.0): self.px, self.pz, self.py, self.c, self.s, self.ry = px, pz, py, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, self.py + y, self.pz - x * self.s + z * self.c)
    def M(self, x, y, z, extra=None):
        m = Matrix.Translation(g2b(*self.p(x, y, z))) @ Matrix.Rotation(self.ry, 4, 'Z'); return m @ extra if extra is not None else m
    def rbox(self, m, x0, x1, y0, y1, z0, z1, r=0.02, seg=None, col=None):
        m, col = _rt(m, col)
        if seg is None: seg = 1 if AUTO_SEG and (min(abs(x1 - x0), abs(y1 - y0), abs(z1 - z0)) < 0.06 or r <= 0.008) else 2
        bm = L.rbox_bm(x1 - x0, y1 - y0, z1 - z0, r, seg)
        if col is not None: paint_bm(bm, col)
        m.add_bm(bm, self.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); bm.free(); return m
    def cyl(self, m, a, b, r, col=None, **kw):
        m, col = _rt(m, col)
        if col is None: m.cyl(self.p(*a), self.p(*b), r, **kw); return m
        t = Mesh('_t', None, tile=1.0); t.cyl(self.p(*a), self.p(*b), r, **kw); paint_bm(t.bm, col); m.add_bm(t.bm); t.bm.free(); return m
    def lathe(self, m, prof, x, y, z, seg=16, col=None):
        m, col = _rt(m, col)
        bm = L.lathe(prof, seg=seg)
        if col is not None: paint_bm(bm, col)
        m.add_bm(bm, self.M(x, y, z)); bm.free(); return m
    def quad(self, m, pts, uv=None):
        """一個面（物件座標的點，逆時針＝正面）；uv＝(u0,v0,u1,v1) 照點的順序 (u0,v0)(u1,v0)(u1,v1)(u0,v1)"""
        bm = m.bm; f = bm.faces.new([bm.verts.new(g2b(*self.p(*q))) for q in pts])
        if uv:
            ul = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = uv
            for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[ul].uv = t
        return f


def _lin(h): return [(lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)(int(h[i:i + 2], 16) / 255) for i in (1, 3, 5)] + [1.0]


def paint_bm(bm, hexcol, k=1.0):
    """bmesh 的所有角塗頂點色 Col（sRGB 色碼；k 乘亮度）"""
    lay = bm.loops.layers.float_color.get('Col') or bm.loops.layers.float_color.new('Col')
    c = _lin(hexcol); c = [min(1.0, v * k) for v in c[:3]] + [1.0]
    for f in bm.faces:
        for lp in f.loops: lp[lay] = c
    return bm


class VMesh(Mesh):
    """頂點色網格：add_bm 進來的 bmesh 要先 paint_bm（Xf 的 col= 參數）；finish 時 UV 不用"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.bm.loops.layers.float_color.new('Col')

    def add_bm(self, other, matrix=None):
        """逐面複製（連頂點色一起；from_mesh 合進非空的 bmesh 時顏色層對不上）"""
        if not other.loops.layers.float_color.get('Col'): paint_bm(other, '#ff00ff')   # 忘了塗色：洋紅，渲染一看就知道
        src = other.loops.layers.float_color['Col']; dst = self.bm.loops.layers.float_color['Col']
        vmap = {v: self.bm.verts.new((matrix @ v.co) if matrix is not None else v.co.copy()) for v in other.verts}
        for f in other.faces:
            try: nf = self.bm.faces.new([vmap[v] for v in f.verts])
            except ValueError: continue
            for l0, l1 in zip(f.loops, nf.loops): l1[dst] = l0[src]
        return self


class Shop:
    """一間室內：材質表、累積網格（每個材質一個）、四面牆的組、頂點色零件、收尾（合併、匯出）"""
    def __init__(s, prefix, kind, W, D, H, texres=512, props=None, seed=1):
        random.seed(seed); B.reset(texres=texres)
        s.P, s.kind, s.W, s.D, s.H = prefix, kind, W, D, H
        s.X0, s.X1, s.Z0, s.Z1 = -W / 2, W / 2, -D / 2, D / 2
        s.root = B.group(kind, props=dict({'kind': kind, 'w': W, 'd': D, 'h': H}, **(props or {})))
        s.M = {}; s._acc = {}; s.walls = {k: {} for k in DIRS}; s.extra_keep = []; s.signs = []
        s.M['vc'] = L.vc_material(prefix + 'vc', rough=0.7)
        s.M['vcm'] = L.vc_metal(prefix + 'vc_metal', rough=0.42, metal=0.4)
        s.M['vcg'] = L.vc_material(prefix + 'vc_gloss', rough=0.28)
        s._PLM = None; s.level_key = None

    # ---- 累積網格
    def a(s, key, lvl=''):
        """材質 key 的累積網格（lvl：分樓層合併的 key，例如 'L2'）"""
        k = (key, lvl)
        if k not in s._acc:
            mat = s.M[key]; nm = (lvl + '_' if lvl else '') + s.P + key
            s._acc[k] = VMesh(nm, mat) if key in ('vc', 'vcm', 'vcg') else Mesh(nm, mat)
            s._acc[k].lvl = lvl; s._acc[k].uv_auto = key not in s.imgkeys()
        return s._acc[k]

    def w(s, side, key):
        if key not in s.walls[side]:
            mat = s.M[key]; s.walls[side][key] = VMesh(f'{side}_{key}', mat) if key in ('vc', 'vcm', 'vcg') else Mesh(f'{side}_{key}', mat)
            s.walls[side][key].side = side
        return s.walls[side][key]

    def route(s, table):
        """SHOP-CC0-HELP-1113：{色碼: 材質 key}——之後 Xf 的 col= 是這些顏色的零件改放到 s.M[key] 的網格（同一層樓、同一面牆的組）"""
        global ROUTE
        def mk(key): return lambda m: s.w(m.side, key) if getattr(m, 'side', None) else s.a(key, getattr(m, 'lvl', ''))
        ROUTE = {h.lower(): mk(k) for h, k in table.items()}

    def wall_box(s, side, key, a0, a1, y0, y1, t0=0.0, t1=0.14):
        """牆（沿著牆 a0～a1、高 y0～y1、厚度從內面 t0 到 t1——往外量）"""
        m = s.w(side, key); X0, X1, Z0, Z1 = s.X0, s.X1, s.Z0, s.Z1
        if side == 'back': m.box(a0, a1, y0, y1, Z0 - t1, Z0 - t0)
        elif side == 'front': m.box(a0, a1, y0, y1, Z1 + t0, Z1 + t1)
        elif side == 'left': m.box(X0 - t1, X0 - t0, y0, y1, a0, a1)
        else: m.box(X1 + t0, X1 + t1, y0, y1, a0, a1)

    def wall_xf(s, side, along, off=0.0, py=0.0):
        """貼著牆內面的物件座標：along＝沿著牆的位置（back/front 是 x、left/right 是 z），off＝離牆內面多遠；正面朝室內"""
        if side == 'back': return Xf(along, s.Z0 + off, 0.0, py)
        if side == 'front': return Xf(along, s.Z1 - off, math.pi, py)
        if side == 'left': return Xf(s.X0 + off, along, math.pi / 2, py)
        return Xf(s.X1 - off, along, -math.pi / 2, py)

    def wall_with_openings(s, side, opens, lower, upper, wains, frame, glass='glass', H=None, y0=0.0, frame_col=None, mull=1.1):
        """一面牆，開口 opens＝[(a0, a1, 底, 頂, 'win'|'door')]（沿著牆的座標）；窗台以下 lower、wains 以上 upper；開口裝框（frame 材質）和玻璃。
        y0＝這面牆的底（樓層的高度），H＝牆頂"""
        H = H or s.H; a_lo, a_hi = (s.X0, s.X1) if side in ('back', 'front') else (s.Z0, s.Z1)
        ops = sorted(opens); xs = [a_lo]
        for o in ops: xs += [o[0], o[1]]
        xs.append(a_hi)
        for i in range(0, len(xs), 2):
            a, b = xs[i], xs[i + 1]
            if b - a < 1e-3: continue
            if wains > 0: s.wall_box(side, lower, a, b, y0, y0 + wains)
            s.wall_box(side, upper, a, b, y0 + wains, H)
        for (a, b, lo, hi, k) in ops:
            if hi < H - 1e-3: s.wall_box(side, upper, a, b, y0 + hi, H)
            if lo > 1e-3: s.wall_box(side, lower if lo <= wains + 1e-3 else upper, a, b, y0, y0 + lo)
            fm = s.w(side, frame); xf = s.wall_xf(side, 0.0)
            def fb(u0, u1, v0, v1, d0, d1):   # 框：沿牆 u、高 v、離內面 d（負＝往牆裡）
                p0 = s._wp(side, u0, d0); p1 = s._wp(side, u1, d1)
                fm.box(min(p0[0], p1[0]), max(p0[0], p1[0]), y0 + v0, y0 + v1, min(p0[1], p1[1]), max(p0[1], p1[1]))
            fb(a, b, hi - 0.06, hi, -0.14, 0.02); fb(a, b, lo, lo + 0.05, -0.14, 0.04)
            fb(a, a + 0.06, lo, hi, -0.14, 0.02); fb(b - 0.06, b, lo, hi, -0.14, 0.02)
            n = max(1, round((b - a) / mull))
            for j in range(1, n): u = a + j * (b - a) / n; fb(u - 0.025, u + 0.025, lo, hi, -0.12, 0.0)
            if k == 'win' and hi - lo > 2.2: fb(a, b, lo + 2.1, lo + 2.15, -0.12, 0.0)    # 高窗的橫櫺
            g = s.w(side, glass); q0 = s._wp(side, a, -0.07); q1 = s._wp(side, b, -0.07)
            pts = [(q1[0], y0 + lo + 0.02, q1[1]), (q0[0], y0 + lo + 0.02, q0[1]), (q0[0], y0 + hi - 0.03, q0[1]), (q1[0], y0 + hi - 0.03, q1[1])]
            g.quad(pts if side in ('back', 'left') else pts[::-1])

    def _wp(s, side, along, d):
        """牆上一點（沿著牆 along、離內面 d，正＝往室內）→ (x, z)"""
        if side == 'back': return (along, s.Z0 + d)
        if side == 'front': return (along, s.Z1 - d)
        if side == 'left': return (s.X0 + d, along)
        return (s.X1 - d, along)

    def wall_img(s, side, mat_key, along, cy, w, h, uv, off=0.012, name='img'):
        """牆上的圖（海報、菜單）：貼在牆內面前 off"""
        m = s.w(side, mat_key); xf = s.wall_xf(side, along, off)
        xf.quad(m, [(-w / 2, cy - h / 2, 0), (w / 2, cy - h / 2, 0), (w / 2, cy + h / 2, 0), (-w / 2, cy + h / 2, 0)], uv=uv)

    def img_quad(s, m, xf, x, y, z, w, h, uv, tilt=0.0):
        """物件座標裡一張直立的圖（正面朝 +z；tilt＝往後仰的角度）"""
        ct, st = math.cos(tilt), math.sin(tilt)
        pts = [(x - w / 2, y, z), (x + w / 2, y, z), (x + w / 2, y + h * ct, z - h * st), (x - w / 2, y + h * ct, z - h * st)]
        return xf.quad(m, pts, uv=uv)

    # ---- 植物
    def plant(s, x, z, h=1.0, r=0.2, pot_col='#b0653e', y0=0.0, lvl='', seed=0):
        """大葉盆栽（plants.py 的模型葉子）＋旋轉體花盆（頂點色）"""
        if s._PLM is None: s._PLM = PL.materials(s.P + 'pl_')
        bm = L.lathe([(r * 0.72, 0), (r * 0.78, 0.02), (r, r * 1.5 * 0.92), (r * 1.06, r * 1.5 * 0.94), (r * 1.06, r * 1.5), (r * 0.96, r * 1.5)], seg=18)
        paint_bm(bm, pot_col); s.a('vcg', lvl).add_bm(bm, Matrix.Translation(g2b(x, y0, z))); bm.free()
        sd = seed or int(abs(x * 31 + z * 17)) + 3; pre = f'{lvl + "_" if lvl else ""}{s.P}plant_{x:.1f}_{z:.1f}'
        if h < 0.7 and 'pothos' in s.M:   # 小盆栽：黃金葛的葉片卡堆成一叢（模型葉子縮小以後只剩幾根莖，看起來像竹籤）
            bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=r * 0.92, radius2=r * 0.92, depth=0.02)
            bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(x, y0 + r * 1.5 - 0.03, z)); bm.normal_update(); B.mesh_obj(pre + '_soil', bm, s._PLM['soil'], s.root)
            rs = random.getstate(); random.seed(sd)
            CL.bush(s.a('pothos', lvl), x, y0 + r * 1.5 + h * 0.35, z, max(r * 1.6, h * 0.45), n=9, span=0.5, flat_y=0.9)
            for k in range(4):
                a = k * 1.7 + 0.3; CL.card(s.a('pothos', lvl), x + math.cos(a) * r * 1.1, y0 + r * 1.2, z + math.sin(a) * r * 1.1, 0.16, 0.16, ry=a, rx=0.9, uv=CL.rand_uv(0.5))
            random.setstate(rs); return
        PL.potted(B.mesh_obj, s._PLM, pre, s.root, x, y0 + r * 1.5, z, r, seed=sd, h=h * 1.15)
        if h >= (1.4 if AUTO_SEG else 1.0): PL.broad_plant(B.mesh_obj, s._PLM, pre + 'b', s.root, x, y0 + r * 1.48, z, h * 1.2, max(0.45, h * 0.45), seed=sd + 6, stems=4)

    def hanging_pothos(s, leaf_mat_key, x, y, z, n=9, drop=0.6, lvl='', size=0.16):
        """垂下來的黃金葛：幾條往下垂的葉片卡串"""
        m = s.a(leaf_mat_key, lvl); rnd = random.Random(int(abs(x * 100 + z * 37 + y * 11))); st = s.a('vc', lvl); xf = Xf(0.0, 0.0)
        for k in range(n):
            a = rnd.uniform(0, 2 * math.pi); rr = rnd.uniform(0.05, 0.22); L_ = rnd.uniform(0.3, drop)
            prev = (x + math.cos(a) * 0.02, y + 0.02, z + math.sin(a) * 0.02)          # v（BB_257 §11：葉子不能懸空）：每一條從盆口拉一根藤，葉子掛在藤上
            for j in range(7):
                t = j / 6; px = x + math.cos(a) * (rr * min(1.0, t * 2.5) + t * 0.08); pz = z + math.sin(a) * (rr * min(1.0, t * 2.5) + t * 0.08)
                py = y - t * L_ + (0.04 * math.sin(t * math.pi) if j else 0.0)
                xf.cyl(st, prev, (px, py, pz), 0.0035, col=('#4a6a2a', '#5a7a32')[k % 2], seg=4, caps=False); prev = (px, py, pz)
                if j: CL.card(m, px + rnd.uniform(-0.02, 0.02), py - size * 0.35, pz + rnd.uniform(-0.02, 0.02), size, size, ry=rnd.uniform(0, math.pi), rx=rnd.uniform(-0.6, 0.6), uv=CL.rand_uv(0.5))

    # ---- 收尾
    def finish(s, out, keep=lambda ob: False, extra_info=None):
        for k, m in s._acc.items():
            if m.mat.name.endswith(('vc', 'vc_metal', 'vc_gloss')): ob = m.finish(s.root, uv=False)
            else: ob = m.finish(s.root, uv=getattr(m, 'uv_auto', True))
            if ob is not None:
                L.smooth_mesh(ob, angle=0.6)
                if m.lvl: ob['level'] = 1
        for side, ms in s.walls.items():
            for key, m in ms.items():
                m.name = f'WALL_{side}_{s.P}{key}'
                ob = m.finish(s.root, uv=not isinstance(m, VMesh) and key not in s.imgkeys(), props={'dir': DIRS[side]})
        for ob in list(s.root.children):   # 模型葉子平滑著色；植物的純色材質 → 頂點色（少四個材質）
            if ob.type == 'MESH' and ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
        if s._PLM:
            g = {}
            for k_, m in s._PLM.items():
                if L.flat_info(m): g[m.name] = s.M['vc']
            L.vc_consolidate(s.root, g)
        def key(ob):
            if ob.name.startswith('WALL_'): return 'WALL_' + ob.name.split('_')[1]
            return 'L2' if (ob.name.startswith('L2_') or ob.get('level') == 1) else ''
        L.merge_by_material(s.root, keep=lambda ob: 'FACE' in ob.name or keep(ob), key=key)
        for ob in s.root.children:
            if ob.type == 'MESH' and ob.name.startswith('L2_'): ob['level'] = 1
        info = L.export(out, gpu_instances=True)
        if extra_info: info.update(extra_info)
        L.write_json(out[:-4] + '.json', info); return info

    def imgkeys(s): return getattr(s, '_imgkeys', set())

    def tally(s, label):
        """開發用：印出到目前為止累積的三角形（和上一次 tally 的差）——找出哪一段最花三角形"""
        def tris(bm): return sum(len(f.verts) - 2 for f in bm.faces)
        t = sum(tris(m.bm) for m in s._acc.values()) + sum(tris(m.bm) for ms in s.walls.values() for m in ms.values())
        t += sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in s.root.children_recursive if ob.type == 'MESH')
        print(f'TALLY {label:24s} {t - getattr(s, "_tally", 0):7d}  total {t:7d}', flush=True); s._tally = t


# ======================================================================== 家具
def shell_chair(sh, x, z, ry, col, leg='#2c2c2c', lvl='', y0=0.0, wood_leg=None):
    """一體成型的塑膠殼椅（日常失速：橘、綠、奶油色…）：座面＋椅背連成一片彎曲的殼（有厚度、邊緣圓），四支細鋼腳。約 400 三角形"""
    xf = Xf(x, z, ry, y0); m = sh.a('vcg', lvl)
    prof = [(0.21, 0.455), (0.16, 0.445), (0.0, 0.44), (-0.15, 0.465), (-0.205, 0.54), (-0.23, 0.7), (-0.24, 0.86)]
    widths = [0.40, 0.43, 0.44, 0.43, 0.41, 0.43, 0.43]
    nu = 7; bm = bmesh.new(); t = 0.012; rows_o, rows_i = [], []
    for (pz, py), w in zip(prof, widths):
        ro, ri = [], []
        for i in range(nu):
            u = -1 + 2 * i / (nu - 1); px = u * w / 2
            dish = 0.025 * (u * u) if py < 0.5 else 0.0
            curve = 0.03 * (u * u) if py > 0.5 else 0.0     # 椅背左右往前包
            ro.append(bm.verts.new(g2b(*xf.p(px, py + dish, pz + curve))))
            ri.append(bm.verts.new(g2b(*xf.p(px * 0.985, py + dish - t, pz + curve - (t if py > 0.5 else 0)))))
        rows_o.append(ro); rows_i.append(ri)
    for R in (rows_o, rows_i):
        for a_, b_ in zip(R, R[1:]):
            for i in range(nu - 1):
                f = (a_[i], a_[i + 1], b_[i + 1], b_[i]) if R is rows_o else (a_[i], b_[i], b_[i + 1], a_[i + 1])
                bm.faces.new(f)
    for j in range(len(prof) - 1):   # 兩側的邊
        for i in (0, nu - 1):
            vs = (rows_o[j][i], rows_o[j + 1][i], rows_i[j + 1][i], rows_i[j][i])
            bm.faces.new(vs if i == 0 else vs[::-1])
    for R0, R1, flip in ((rows_o[0], rows_i[0], True), (rows_o[-1], rows_i[-1], False)):   # 前緣、上緣
        for i in range(nu - 1):
            vs = (R0[i], R0[i + 1], R1[i + 1], R1[i]); bm.faces.new(vs[::-1] if flip else vs)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); paint_bm(bm, col); m.add_bm(bm); bm.free()
    lm = sh.a('vcm', lvl) if wood_leg is None else sh.a('vc', lvl); lc = leg if wood_leg is None else wood_leg
    for sx in (-0.17, 0.17):
        for sz in (-0.15, 0.17): xf.cyl(lm, (sx * 1.12, 0.0, sz * 1.15), (sx * 0.95, 0.435, sz * 0.9), 0.011 if wood_leg is None else 0.016, col=lc, seg=7)
    xf.cyl(lm, (-0.17, 0.2, 0.15), (0.17, 0.2, 0.15), 0.006, col=lc, seg=5)


def bentwood_chair(sh, x, z, ry, key='vc', col='#5b3b27', lvl='', y0=0.0, seat_col=None):
    """曲木椅（木曜日：胡桃木）：圓座面（倒角）、四支微外八的腳、腳踏環、彎的椅背框＋兩根直條。約 500 三角形"""
    xf = Xf(x, z, ry, y0); m = sh.a(key, lvl); c = col if key in ('vc', 'vcg', 'vcm') else None
    lite = AUTO_SEG   # 第二版：輪廓上看得到的（座面、椅背弧）邊數照舊夠圓，看不到輪廓的細管少幾邊、不封口
    xf.lathe(m, [(0.0, 0.42), (0.19, 0.42), (0.205, 0.43), (0.205, 0.45), (0.19, 0.465), (0.0, 0.465)], 0, 0, 0, seg=16 if lite else 18, col=seat_col or c)
    for a in range(4):
        t = a * math.pi / 2 + math.pi / 4; xf.cyl(m, (math.cos(t) * 0.17, 0.0, math.sin(t) * 0.17), (math.cos(t) * 0.14, 0.43, math.sin(t) * 0.14), 0.014, col=c, seg=6 if lite else 7, **({'caps': False} if lite else {}))
    ring = 0.155; nr = 8 if lite else 10
    for k in range(nr):
        a0, a1 = 2 * math.pi * k / nr, 2 * math.pi * (k + 1) / nr; xf.cyl(m, (math.cos(a0) * ring, 0.2, math.sin(a0) * ring), (math.cos(a1) * ring, 0.2, math.sin(a1) * ring), 0.008, col=c, seg=4 if lite else 5, **({'caps': False} if lite else {}))
    pts = []; na = 10 if lite else 12
    for k in range(na + 1):
        a = math.pi * (0.08 + 0.84 * k / na); pts.append((math.cos(a) * 0.19, 0.44 + 0.42 * math.sin(a) ** 0.6, -0.17 - 0.03 * math.sin(a)))
    for p, q in zip(pts, pts[1:]): xf.cyl(m, p, q, 0.013, col=c, seg=6, **({'caps': False} if lite else {}))
    for sx in (-0.06, 0.06): xf.cyl(m, (sx, 0.465, -0.16), (sx, 0.8, -0.2), 0.009, col=c, seg=5)
    xf.cyl(m, (-0.17, 0.62, -0.18), (0.17, 0.62, -0.18), 0.009, col=c, seg=5)


def stool(sh, x, z, h=0.72, seat='#e08a4a', metal='#bfc2c4', lvl='', y0=0.0):
    """高腳椅：圓座墊（倒角）、單柱、腳踏環、圓底座"""
    xf = Xf(x, z, 0.0, y0)
    xf.lathe(sh.a('vcg', lvl), [(0.0, h - 0.06), (0.17, h - 0.06), (0.185, h - 0.04), (0.185, h - 0.01), (0.17, h), (0.0, h + 0.005)], 0, 0, 0, seg=18, col=seat)
    xf.cyl(sh.a('vcm', lvl), (0, 0.02, 0), (0, h - 0.06, 0), 0.025, col=metal, seg=10)
    xf.lathe(sh.a('vcm', lvl), [(0.0, 0.0), (0.2, 0.0), (0.2, 0.015), (0.06, 0.03), (0.0, 0.035)], 0, 0, 0, seg=18, col=metal)
    xf.lathe(sh.a('vcm', lvl), [(0.15, h * 0.38), (0.16, h * 0.38), (0.16, h * 0.4), (0.15, h * 0.4)], 0, 0, 0, seg=18, col=metal)
    for a in range(3): t = a * 2 * math.pi / 3; xf.cyl(sh.a('vcm', lvl), (0, h * 0.39, 0), (math.cos(t) * 0.155, h * 0.39, math.sin(t) * 0.155), 0.008, col=metal, seg=5)


def round_table(sh, x, z, r=0.33, h=0.74, top_key='wood', top_col=None, base_col='#2c2c2c', lvl='', y0=0.0, base='disc'):
    """圓桌：倒角圓桌面＋單柱＋圓底座（或四爪）"""
    xf = Xf(x, z, 0.0, y0); tm = sh.a(top_key, lvl); c = top_col if top_key in ('vc', 'vcg', 'vcm') else None
    xf.lathe(tm, [(0.0, h - 0.035), (r - 0.012, h - 0.035), (r, h - 0.025), (r, h - 0.008), (r - 0.01, h), (0.0, h)], 0, 0, 0, seg=22 if AUTO_SEG else 28, col=c)
    mm = sh.a('vcm', lvl)
    xf.cyl(mm, (0, 0.02, 0), (0, h - 0.035, 0), 0.03, col=base_col, seg=10)
    xf.lathe(mm, [(0.06, h - 0.035), (0.09, h - 0.05), (0.03, h - 0.08)], 0, 0, 0, seg=12, col=base_col)
    if base == 'disc': xf.lathe(mm, [(0.0, 0.0), (0.22, 0.0), (0.22, 0.012), (0.12, 0.03), (0.04, 0.05), (0.0, 0.05)], 0, 0, 0, seg=20, col=base_col)
    else:
        for a in range(4): t = a * math.pi / 2 + math.pi / 4; xf.cyl(mm, (0, 0.06, 0), (math.cos(t) * 0.26, 0.01, math.sin(t) * 0.26), 0.016, col=base_col, seg=6)


def rect_table(sh, x, z, ry, w, d, h=0.75, top_key='wood', top_col=None, leg_key='vcm', leg_col='#2c2c2c', lvl='', y0=0.0, leg='steel', r=0.012):
    """方桌、長桌：倒角桌面（厚 4 cm）、牙板、四支腳（steel 方管或 wood 圓腳收細）"""
    xf = Xf(x, z, ry, y0); c = top_col if top_key in ('vc', 'vcg', 'vcm') else None
    xf.rbox(sh.a(top_key, lvl), -w / 2, w / 2, h - 0.04, h, -d / 2, d / 2, r=r, seg=2, col=c)
    lm = sh.a(leg_key, lvl); lc = leg_col if leg_key in ('vc', 'vcg', 'vcm') else None; ix, iz = w / 2 - 0.07, d / 2 - 0.07
    for sx in (-ix, ix):
        for sz in (-iz, iz):
            if leg == 'steel': xf.rbox(lm, sx - 0.02, sx + 0.02, 0.0, h - 0.04, sz - 0.02, sz + 0.02, r=0.006, col=lc)
            else: xf.cyl(lm, (sx, 0.0, sz), (sx, h - 0.04, sz), 0.022, col=lc, seg=8, r2=0.03)
    xf.rbox(lm, -ix, ix, h - 0.12, h - 0.045, -iz - 0.01, -iz + 0.01, r=0.004, col=lc); xf.rbox(lm, -ix, ix, h - 0.12, h - 0.045, iz - 0.01, iz + 0.01, r=0.004, col=lc)
    xf.rbox(lm, -ix - 0.01, -ix + 0.01, h - 0.12, h - 0.045, -iz, iz, r=0.004, col=lc); xf.rbox(lm, ix - 0.01, ix + 0.01, h - 0.12, h - 0.045, -iz, iz, r=0.004, col=lc)


def dome_pendant(sh, x, z, y, r=0.2, col='#6f8a5e', inner='#f4ecd8', cord_top=None, lvl='', kind='dome', glow=True, glow_size=0.6):
    """吊燈：dome＝搪瓷半球燈罩、scallop＝木曜日的波浪邊乳白玻璃燈罩、cone＝細長錐形；燈泡發光；GLOW_ 節點"""
    top = cord_top if cord_top is not None else sh.H
    Xf(x, z).cyl(sh.a('vcm', lvl), (0, top, 0), (0, y + 0.02, 0), 0.004, col='#2a2a2a', seg=4)
    xf = Xf(x, z)
    if kind == 'dome':
        prof = [(0.025, 0.0), (0.04, -0.01), (r * 0.5, -r * 0.12), (r * 0.82, -r * 0.42), (r * 0.97, -r * 0.78), (r, -r * 0.9), (r * 0.98, -r * 0.92)]
        xf.lathe(sh.a('vcg', lvl), [(a_, y + b_) for a_, b_ in prof], 0, 0, 0, seg=24, col=col)
        xf.lathe(sh.a('vcg', lvl), [(r * 0.96, y - r * 0.9), (r * 0.8, y - r * 0.45), (r * 0.45, y - r * 0.14), (0.03, y - 0.03)], 0, 0, 0, seg=24, col=inner)
        sh.a('bulb', lvl).sphere((x, y - r * 0.55, z), 0.045, seg=10, rings=6)
    elif kind == 'scallop':
        bm = bmesh.new(); seg = 30 if AUTO_SEG else 40; rows = []
        prof = [(0.03, 0.0), (r * 0.42, -0.02), (r * 0.72, -r * 0.22), (r * 0.9, -r * 0.48), (r * 1.0, -r * 0.7), (r * 1.04, -r * 0.8)]
        for j, (rr, hh) in enumerate(prof):
            ring = []
            for i in range(seg):
                a = 2 * math.pi * i / seg; wav = 1 + (0.025 * math.cos(a * 10) if j >= 3 else 0.0); hy = hh - (0.012 * (1 + math.cos(a * 10)) if j == len(prof) - 1 else 0)
                ring.append(bm.verts.new(g2b(x + math.cos(a) * rr * wav, y + hy, z + math.sin(a) * rr * wav)))
            rows.append(ring)
        for A_, B_ in zip(rows, rows[1:]):
            for i in range(seg): bm.faces.new((A_[i], A_[(i + 1) % seg], B_[(i + 1) % seg], B_[i]))
        bm.normal_update(); sh.a('shade', lvl).add_bm(bm); bm.free()
        Xf(x, z).lathe(sh.a('vcm', lvl), [(0.0, y + 0.06), (0.035, y + 0.06), (0.04, y), (0.0, y)], 0, 0, 0, seg=12, col='#8a6a3a')
        sh.a('bulb', lvl).sphere((x, y - r * 0.35, z), 0.05, seg=10, rings=6)
    else:
        xf.lathe(sh.a('vcg', lvl), [(0.03, y + 0.18), (0.05, y + 0.16), (r, y + 0.01), (r * 1.02, y)], 0, 0, 0, seg=20, col=col)
        sh.a('bulb', lvl).sphere((x, y + 0.04, z), 0.045, seg=10, rings=6)
    if glow: CL.glow(sh.root, 'pendant', x, y - r * 0.6, z, color='rgba(255,206,150,1)', size=glow_size, day=0.0, night=0.6)


def table_lamp(sh, x, z, y=0.75, r=0.1, base_col='#8a6a3a', lvl=''):
    """小檯燈（木曜日每張桌子一盞）：黃銅細座＋乳白玻璃蘑菇燈罩"""
    xf = Xf(x, z, 0.0, y)
    xf.lathe(sh.a('vcm', lvl), [(0.0, 0.0), (0.055, 0.0), (0.06, 0.008), (0.03, 0.02), (0.012, 0.03), (0.012, 0.2), (0.0, 0.2)], 0, 0, 0, seg=10 if AUTO_SEG else 14, col=base_col)
    xf.lathe(sh.a('shade', lvl), [(0.015, 0.17), (r * 0.6, 0.175), (r * 0.95, 0.21), (r, 0.25), (r * 0.8, 0.29), (r * 0.4, 0.31), (0.0, 0.315)], 0, 0, 0, seg=16 if AUTO_SEG else 18)
    CL.glow(sh.root, 'tablelamp', x, y + 0.24, z, color='rgba(255,200,130,1)', size=0.45, day=0.0, night=0.8)


def mug(sh, x, z, y, col='#f2efe8', lvl='', r=0.04, h=0.09, handle=True):
    xf = Xf(x, z, 0.0, y)
    xf.lathe(sh.a('vcg', lvl), [(0.0, 0.0), (r * 0.8, 0.0), (r, 0.01), (r, h), (r * 0.9, h), (r * 0.88, 0.012), (0.0, 0.012)], 0, 0, 0, seg=12 if AUTO_SEG else 14, col=col)
    if handle:
        nh = 4 if AUTO_SEG else 5
        for k in range(nh):
            a0, a1 = math.pi * (-0.5 + k / nh), math.pi * (-0.5 + (k + 1) / nh)
            xf.cyl(sh.a('vcg', lvl), (r + 0.025 * math.cos(a0), h * 0.5 + 0.025 * math.sin(a0), 0), (r + 0.025 * math.cos(a1), h * 0.5 + 0.025 * math.sin(a1), 0), 0.006, col=col, seg=4 if AUTO_SEG else 5, **({'caps': False} if AUTO_SEG else {}))


def glass_cup(sh, x, z, y, h=0.13, r=0.035, fill='#b07a4a', lvl=''):
    """冰飲的玻璃杯（杯子玻璃＋裡面的飲料）"""
    Xf(x, z, 0.0, y).lathe(sh.a('vcg', lvl), [(0.0, 0.002), (r * 0.82, 0.002), (r * 0.95, h * 0.78)], 0, 0, 0, seg=14, col=fill)
    Xf(x, z, 0.0, y).lathe(sh.a('glass', lvl), [(r * 0.85, 0.0), (r, h), (r * 0.97, h)], 0, 0, 0, seg=14)


def plate(sh, x, z, y, r=0.1, col='#f2efe8', lvl=''):
    Xf(x, z, 0.0, y).lathe(sh.a('vcg', lvl), [(0.0, 0.0), (r * 0.6, 0.0), (r * 0.65, 0.006), (r, 0.018), (r * 0.97, 0.02), (r * 0.6, 0.01), (0.0, 0.01)], 0, 0, 0, seg=14 if AUTO_SEG else 18, col=col)


def bottle(sh, x, z, y, h=0.28, r=0.035, col='#5a6a3a', lvl=''):
    Xf(x, z, 0.0, y).lathe(sh.a('vcg', lvl), [(0.0, 0.0), (r, 0.0), (r, h * 0.62), (r * 0.4, h * 0.8), (r * 0.32, h), (0.0, h)], 0, 0, 0, seg=10, col=col)


def jar(sh, x, z, y, h=0.16, r=0.05, col='#c9a26a', lid='#3a3a3a', lvl=''):
    sg = 10 if AUTO_SEG else 12
    Xf(x, z, 0.0, y).lathe(sh.a('vcg', lvl), [(0.0, 0.0), (r, 0.0), (r, h * 0.85), (r * 0.8, h * 0.9)], 0, 0, 0, seg=sg, col=col)
    Xf(x, z, 0.0, y).lathe(sh.a('vcg', lvl), [(r * 0.82, h * 0.88), (r * 0.82, h), (0.0, h)], 0, 0, 0, seg=sg, col=lid)


def book_rows(sh, mat_key, xf, u0, u1, y, v, hgt=0.3, depth=0.2, lvl='', rows=7, rng=None, top_row=7, gap=0.0):
    """一層書（書背圖集的「一排書」：一個四邊形＋書頂一條；aa_int_tex.py 的 *_bookrows.png，每列 0.9 m × 0.3 m）。
    xf：書架的物件座標（x 沿書架、z＝往正面）；u0～u1＝這一層的範圍；v＝書背離背板的位置；回傳三角形數"""
    rng = rng or random; m = sh.a(mat_key, lvl); n = 0; u = u0
    while u < u1 - 0.05:
        seg = min(u1 - u, rng.uniform(0.45, 0.9)); r_ = rng.choice(rows) if isinstance(rows, (list, tuple)) else rng.randrange(rows); off = rng.uniform(0, max(0.0, 1 - seg / 0.9))
        a0, a1 = off, off + seg / 0.9; vv0, vv1 = 1 - (r_ + 1) / 8 + 0.002, 1 - r_ / 8 - 0.002
        zz = v - rng.uniform(0, 0.02)
        xf.quad(m, [(u, y, zz), (u + seg, y, zz), (u + seg, y + hgt, zz), (u, y + hgt, zz)], uv=(a0, vv0, a1, vv1))
        tv0, tv1 = 1 - (top_row + 1) / 8 + 0.01, 1 - top_row / 8 - 0.01   # 書頂（紙色）
        xf.quad(m, [(u, y + hgt * 0.86, zz), (u + seg, y + hgt * 0.86, zz), (u + seg, y + hgt * 0.86, zz - depth), (u, y + hgt * 0.86, zz - depth)], uv=(a0, tv0, a1, tv1))
        u += seg + gap; n += 4
    return n
