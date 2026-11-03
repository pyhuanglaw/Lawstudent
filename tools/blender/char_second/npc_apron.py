"""穿在衣服外面、貼著身體的圍裙（LAWWW2 2026-11-03；秀琴姨，BB 16:32「圍裙像一塊硬紙板」：要貼著身體的布——胸前那片沿著胸口的弧度、
裙片跟著長裙垂下來、腰帶在背後打結看得到、淺的亞麻米色）。npc.py 的 stage 'apron'（VARIANTS 有 apron=dict(...) 的人才有）。

做法：
  1. 從衣服網格（Clothes_<TAG>，已經綁好骨架權重）挑出朝前的面：胸前（脖子下 7 cm～腰）窄、腰以下（到膝蓋上面一點）寬；
     複製成新物件 Apron_<TAG>，往外推（胸前 6 mm、裙片 11 mm），保留原本的骨架權重＝跟著胸口、長裙一起動；
  2. 掛脖子的帶子（繞到後頸，綁在上胸骨頭）、腰帶（從裙片兩邊繞到後腰）＋背後的蝴蝶結（兩個圈＋兩條垂下來的帶子，綁在脊椎骨頭）；
  3. 材質：亞麻（h01_clothes.linen_texture）調成 cfg['rgb']。
座標：全部在世界座標算，最後換成衣服物件的本地座標（和衣服同一個父物件、同一個 armature modifier）。"""
import math
import numpy as np
import bpy, bmesh
from mathutils import Vector
import common as C
import h01_clothes as K


def _body_section(body, z, dz=0.012):
    """身體在高度 z 的橫切面：中心 x、y 與半寬（左右、前後）"""
    Mw = body.matrix_world; P = np.array([tuple(Mw @ v.co) for v in body.data.vertices])
    s = P[np.abs(P[:, 2] - z) < dz]
    if len(s) < 8: s = P[np.abs(P[:, 2] - z) < dz * 3]
    return float((s[:, 0].max() + s[:, 0].min()) / 2), float((s[:, 1].max() + s[:, 1].min()) / 2), float((s[:, 0].max() - s[:, 0].min()) / 2), float((s[:, 1].max() - s[:, 1].min()) / 2)


def _has(ob, z, dz=0.012):
    Mw = ob.matrix_world; return sum(1 for v in ob.data.vertices if abs((Mw @ v.co).z - z) < dz) >= 8


def _tube(bm, pts, r, sides=6, flat=1.0):
    """沿折線的管子（世界座標）；flat＜1＝壓扁成帶子（寬 r、厚 r*flat）"""
    P = [Vector(p) for p in pts]; n = len(P); rings = []
    for i in range(n):
        a = P[max(0, i - 1)]; b = P[min(n - 1, i + 1)]; d = (b - a).normalized()
        u = d.cross(Vector((0, 0, 1))); u = u.normalized() if u.length > 1e-6 else d.orthogonal().normalized(); v = d.cross(u).normalized()
        rings.append([bm.verts.new(P[i] + (u * math.cos(2 * math.pi * k / sides) * flat + v * math.sin(2 * math.pi * k / sides)) * r) for k in range(sides)])
    for i in range(n - 1):
        A, Bn = rings[i], rings[i + 1]
        for k in range(sides): bm.faces.new((A[k], A[(k + 1) % sides], Bn[(k + 1) % sides], Bn[k]))
    for R_, rev in ((rings[0], True), (rings[-1], False)): bm.faces.new(list(reversed(R_)) if rev else R_)


def _panel(clo, arm, tag, fs, z_w, z_hem, sw, cfg):
    """腰間的前掛（前掛け；蘇姨，穿寬褲）：從腰垂下來的一片布（不是從衣服網格挑面：褲子兩腿中間是空的，挑出來會裂成兩片）。
    上緣貼著腰（每一欄量衣服在那個高度最前面的 y），往下慢慢變成平平垂下（整段最前面的那一點再往前一點）；
    權重：上緣綁腰（Hips），往下左右兩半各自加上同側大腿（走路時前面那條腿把那半邊往前帶，不會穿出來）"""
    Mw = clo.matrix_world; P = np.array([tuple(Mw @ v.co) for v in clo.data.vertices])
    NU, NV = 18, 22; off = cfg.get('off_skirt', 0.012)
    zs = np.linspace(z_w, z_hem, NV + 1)
    band = P[(P[:, 2] < z_w + 0.01) & (P[:, 2] > z_hem - 0.01) & (np.abs(P[:, 0]) < sw(z_hem))]
    y_hang = (band[:, 1].min() if fs < 0 else band[:, 1].max()) + fs * (off + cfg.get('hang', 0.010))

    def front_y(x, z):
        s_ = P[(np.abs(P[:, 2] - z) < 0.012) & (np.abs(P[:, 0] - x) < 0.018)]
        if len(s_) == 0: return None
        return float(s_[:, 1].min() if fs < 0 else s_[:, 1].max())
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); G = []; rows = []
    for j, z in enumerate(zs):
        t = j / NV; w_ = sw(z); row = []
        k = float(np.clip(t / 0.45, 0, 1)); k = k * k * (3 - 2 * k)                  # 腰下 45% 的地方換成平平垂下
        for i in range(NU + 1):
            u = -1 + 2 * i / NU; x = u * w_
            yf = front_y(x, z); yw = (yf + fs * off) if yf is not None else y_hang
            yh = y_hang if fs * (y_hang - yw) > 0 else yw
            y = yw * (1 - k) + yh * k + fs * 0.004 * math.sin(math.pi * (i / NU) * 6) * t   # 布垂下來的幾道淺淺的褶
            row.append(bm.verts.new((x, y, z))); G.append((u, t))
        rows.append(row)
    for j in range(1, len(rows)):
        a_, b_ = rows[j - 1], rows[j]
        for i in range(NU):
            q = (a_[i + 1], a_[i], b_[i], b_[i + 1]) if fs < 0 else (a_[i], a_[i + 1], b_[i + 1], b_[i])   # 法線朝前
            uvq = {a_[i]: (i, j - 1), a_[i + 1]: (i + 1, j - 1), b_[i]: (i, j), b_[i + 1]: (i + 1, j)}
            f = bm.faces.new(q)
            for lp in f.loops: ii, jj = uvq[lp.vert]; lp[uvl].uv = (ii / NU * 0.5, 1 - jj / NV * 0.6)
    Mi = Mw.inverted()
    for v in bm.verts: v.co = Mi @ v.co
    me = bpy.data.meshes.new('Apron_' + tag); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('Apron_' + tag, me); clo.users_collection[0].objects.link(ob)
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    G = np.array(G); u, t = G[:, 0], G[:, 1]
    leg = 0.75 * np.clip((t - 0.10) / 0.90, 0, 1) ** 1.2
    wl = leg * np.clip(0.5 + 0.9 * u, 0, 1); wr = leg * np.clip(0.5 - 0.9 * u, 0, 1)   # +x＝人物的左手邊（J_Bip_L_*）
    C.bind(ob, arm, {'J_Bip_C_Hips': 1 - wl - wr, 'J_Bip_L_UpperLeg': wl, 'J_Bip_R_UpperLeg': wr})
    print('  apron(panel): %d faces, hang y %.3f' % (len(me.polygons), y_hang))
    return ob


def run(m, tag, cfg):
    arm, body, clo = m['arm'], m['body'], m['clothes']
    Lm = C.landmarks(arm)
    toe, foot = C.bone_head(arm, 'J_Bip_L_ToeBase'), C.bone_head(arm, 'J_Bip_L_Foot')
    fs = -1.0 if float(toe[1] - foot[1]) < 0 else 1.0           # 正面是 y 的哪一邊（VRoid＝−y）
    z_top = Lm['neck'] - cfg.get('bib_drop', 0.07); z_w = Lm['spine'] + cfg.get('waist_up', 0.03); z_hem = Lm['knee'] + cfg.get('hem_up', 0.08)
    bw = cfg.get('bib_w', 0.085)
    sw = lambda z: cfg.get('skirt_w', 0.165) + (z_w - z) * cfg.get('skirt_flare', 0.10)
    Mw = clo.matrix_world; N3 = Mw.to_3x3(); Mi = Mw.inverted()
    bib = cfg.get('bib', True); kind = {}; nsnap = 0
    if not bib: ap = _panel(clo, arm, tag, fs, z_w, z_hem, sw, cfg)
    else: ap, nsnap = _bib_apron(clo, tag, fs, z_top, z_w, z_hem, bw, sw, cfg, kind)
    _finish(m, arm, body, clo, tag, cfg, ap, bib, kind, nsnap, Lm, fs, z_top, z_w, z_hem, bw)
    return ap


def _bib_apron(clo, tag, fs, z_top, z_w, z_hem, bw, sw, cfg, kind):
    """有胸前那片的圍裙（秀琴姨）：從衣服網格挑出朝前的面"""
    Mw = clo.matrix_world; N3 = Mw.to_3x3()
    ap = clo.copy(); ap.data = clo.data.copy(); ap.name = 'Apron_' + tag; ap.data.name = 'Apron_' + tag
    clo.users_collection[0].objects.link(ap)
    bm = bmesh.new(); bm.from_mesh(ap.data); bm.faces.ensure_lookup_table()
    keep = set()
    for f in bm.faces:
        c = Mw @ f.calc_center_median(); n = (N3 @ f.normal).normalized()
        if n.y * fs < 0.30: continue
        if z_w <= c.z <= z_top and abs(c.x) < bw * (0.85 + 0.15 * (z_top - c.z) / max(1e-3, z_top - z_w)): keep.add(f.index); kind[f.index] = 'bib'
        elif z_hem <= c.z < z_w and abs(c.x) < sw(c.z): keep.add(f.index); kind[f.index] = 'skirt'
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.index not in keep], context='FACES')
    bm.verts.ensure_lookup_table()
    # 邊緣拉直（第二版：照面挑出來的邊是鋸齒）：邊界上的點——上緣 3 cm 內拉到 z_top、兩側 2.5 cm 內拉到那個高度的寬度
    nsnap = 0
    for v in bm.verts:
        if not any(e.is_boundary for e in v.link_edges): continue
        w = Mw @ v.co; z = w.z; wx = bw * (0.85 + 0.15 * (z_top - z) / max(1e-3, z_top - z_w)) if z >= z_w else sw(z)
        if z > z_top - 0.03 and abs(w.x) < wx - 0.012: w.z = z_top; nsnap += 1
        elif abs(abs(w.x) - wx) < 0.025 and z > z_hem + 0.02: w.x = math.copysign(wx, w.x); nsnap += 1
        elif z < z_hem + 0.03: w.z = z_hem; nsnap += 1
        v.co = Mw.inverted() @ w
    Mi = Mw.inverted(); Mi3 = Mi.to_3x3()
    for v in bm.verts:
        w = Mw @ v.co; off = cfg.get('off_bib', 0.006) if w.z >= z_w else cfg.get('off_skirt', 0.011)
        n = (N3 @ v.normal).normalized() if v.normal.length > 1e-6 else Vector((0, fs, 0))
        v.co = Mi @ (w + n * off)
    bm.to_mesh(ap.data); bm.free()
    return ap, nsnap


def _finish(m, arm, body, clo, tag, cfg, ap, bib, kind, nsnap, Lm, fs, z_top, z_w, z_hem, bw):
    """材質、帶子、蝴蝶結（兩種圍裙共用；掛脖子的帶子只有 bib 的有）"""
    Mi = clo.matrix_world.inverted()
    # 材質：亞麻、淺米色
    k0 = K.KNIT_RGB; K.KNIT_RGB = np.array(cfg.get('rgb', (0.83, 0.78, 0.68)), float)
    img = C.image_from_array(tag + '_Apron', K.linen_texture(), None) if 'image_from_array' in dir(C) else None
    K.KNIT_RGB = k0
    tmpl = next(mt.name for mt in bpy.data.materials if 'Tops' in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_', tag + '_')))
    mat = K.make_mat(tmpl, tag + '_Apron_CLOTH', img, tuple(np.array(cfg.get('rgb', (0.83, 0.78, 0.68))) * 0.82))
    ap.data.materials.clear(); ap.data.materials.append(mat)
    for p in ap.data.polygons: p.material_index = 0
    nf = len(ap.data.polygons)
    # 帶子＋背後的蝴蝶結（另一個物件：只綁一根骨頭）
    def strap_obj(name, bone, build):
        me = bpy.data.meshes.new(name + '_' + tag); bm2 = bmesh.new(); build(bm2)
        for v in bm2.verts: v.co = Mi @ v.co
        bm2.to_mesh(me); bm2.free(); ob = bpy.data.objects.new(name + '_' + tag, me); clo.users_collection[0].objects.link(ob)
        me.materials.append(mat); C.bind(ob, arm, {bone: 1.0}); return ob
    zn = Lm['neck'] + 0.02; cxn, cyn, rxn, ryn = _body_section(clo, zn) if _has(clo, zn) else _body_section(body, zn)   # 第二版：量衣服（最外面那一層）；第一版量身體，帶子、腰帶都藏在毛衣裡面
    cxt, cyt, rxt, ryt = _body_section(clo, z_top)
    yfront = cyt + fs * (ryt + 0.008)
    def neck(b):
        for s in (-1, 1):
            pts = [(s * bw * 0.8, yfront, z_top - 0.005), (s * (rxn + 0.010), cyn + fs * ryn * 0.4, zn - 0.02), (s * (rxn + 0.008), cyn - fs * ryn * 0.5, zn + 0.005), (s * 0.02, cyn - fs * (ryn + 0.008), zn + 0.012), (0.0, cyn - fs * (ryn + 0.009), zn + 0.012)]
            _tube(b, pts, 0.0065, 6, 0.35)
    cxw, cyw, rxw, ryw = _body_section(clo, z_w)
    RX, RY = rxw + 0.010, ryw + 0.010
    def ties(b):
        ring = lambda a: (cxw + RX * math.sin(a), cyw + fs * RY * math.cos(a), z_w)
        for s in (-1, 1): _tube(b, [ring(s * math.radians(t)) for t in range(62, 181, 8)], 0.008, 6, 0.30)
        bx, by, bz = cxw, cyw - fs * (RY + 0.004), z_w
        for s in (-1, 1):   # 蝴蝶結：兩個圈＋兩條垂下來的帶子
            loop = [(bx + s * 0.055 * math.sin(math.radians(t)) * (1 - 0.3 * math.cos(math.radians(t))), by - fs * 0.006 * math.sin(math.radians(t)), bz + 0.022 * math.sin(math.radians(2 * t)) * 0.9) for t in range(0, 181, 15)]
            _tube(b, loop, 0.007, 6, 0.35)
            _tube(b, [(bx + s * 0.006, by - fs * 0.004, bz - 0.004), (bx + s * 0.022, by - fs * 0.010, bz - 0.07), (bx + s * 0.030, by - fs * 0.012, bz - 0.15)], 0.0085, 6, 0.30)
        _tube(b, [(bx, by - fs * 0.002, bz - 0.012), (bx, by - fs * 0.002, bz + 0.012)], 0.010, 6, 0.6)   # 結
    so = strap_obj('ApronStrap', 'J_Bip_C_UpperChest', neck) if bib else None; to = strap_obj('ApronTie', 'J_Bip_C_Spine', ties)
    print('  apron: edge snapped %d;' % nsnap); print('  apron: faces %d (bib %d, skirt %d); straps %d, ties %d; z top %.3f waist %.3f hem %.3f' % (nf, sum(1 for k in kind.values() if k == 'bib'), sum(1 for k in kind.values() if k == 'skirt'), len(so.data.polygons) if so else 0, len(to.data.polygons), z_top, z_w, z_hem))
    m['apron'] = ap
    return ap
