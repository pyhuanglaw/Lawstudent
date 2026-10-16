"""溫州街店面組件（ART-WZ0 舊店面翻修／WZ2 新店外觀；LAWWW2-B 2026-10-16；AA_164 7b「店面設計準則」）。
wz_street.py 在建好共用材質、acc()/inst()/face() 之後 `exec` 這個檔（共用同一個命名空間），apartment() 遇到有 SF 樣式的棟就用這裡的版本。

原本溫州街的每一間店都是同一個做法：一整片玻璃＋四根直框＋一塊招牌（＋有的有雨遮），貼齊外牆，前面什麼都沒有。
使用者：「現在店面都太單調」「要特別參考一般店面」。這裡照 7b-1 的層次（地面騎樓／一樓立面／招牌／雨棚／設備／晚上）重做：
  ①店門退縮 0.9 m（門廊）：門廊在建築的導航阻擋範圍內（zones3d.js blockRect 從外牆線開始），不改導航，雜物放門廊裡不會擋路；
  ②每家不同的門廊磁磚＋門檻；兩側壁柱；門廊天花板＋一盞燈（晚上亮）；
  ③門：鋁門、木框玻璃門、自動門、木格拉門＋暖簾、整面拉開（摺門收在兩側）；
  ④鐵捲門箱＋導軌（打烊時拉下來的那一種）；
  ⑤招牌：燈箱（厚、金屬框）、木招牌（厚木框）、薄鐵板；直立招牌照舊；
  ⑥雨棚：條紋帆布、單色帆布、鐵皮雨遮、沒有；
  ⑦玻璃上的紙條（徵人、營業時間、支付貼紙、價目表、招租…，shop_notes.png 圖集）；
  ⑧門廊的雜物（共用原型＋instancing）：塑膠凳、A 字黑板、傘桶、垃圾桶、販賣機、水果攤架、麵攤、書車、紙箱、長椅、飲料冰箱、盆栽；
  ⑨設備：一樓冷氣、電錶箱、排油煙管。
相鄰的店至少三樣不同（7b-2 第 2 點）：SF 表每一間都寫清楚。店名、紙條全部虛構，支付貼紙只有通用圖示（D77）。
"""
GEN = os.path.join(HERE, 'textures', 'gen')
NOTES = ['hiring', 'hours', 'pay', 'rent', 'winter', 'copyprice', 'copyprice2', 'nobook', 'chalk', 'menu', 'closed', 'poster', 'lostcat', 'tutor', 'hours2', 'blank']


def _img_mat(name, fn, rough=0.6, clip=False, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links; bs = N['Principled BSDF']
    bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn)); Lk.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], r.inputs[0]); Lk.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    if emit:
        try: Lk.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
        except Exception: pass
    m['tile'] = 1.0
    return m


SK = {
    'notes': _img_mat('wz_shop_notes', 'shop_notes.png', rough=0.8, clip=True),
    'stripe_green': _img_mat('wz_awn_stripe_green', 'shop_awning_stripe_green.png', rough=0.85),
    'stripe_red': _img_mat('wz_awn_stripe_red', 'shop_awning_stripe_red.png', rough=0.85),
    'stripe_navy': _img_mat('wz_awn_stripe_navy', 'shop_awning_stripe_navy.png', rough=0.85),
    'stripe_orange': _img_mat('wz_awn_stripe_orange', 'shop_awning_stripe_orange.png', rough=0.85),
    'f_granite': L.pbr('wz_sf_granite', 'granite_tile', tile=0.8, target='#8e8c88', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'f_quarry': L.pbr('wz_sf_quarry', 'square_brick_paving', tile=0.9, target='#9a5a44', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.8),
    'f_white': L.pbr('wz_sf_white', 'large_floor_tiles_02', tile=1.2, target='#cfcdc6', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.45),
    'f_mosaic': L.pbr('wz_sf_mosaic', 'rounded_square_tiled_wall', tile=0.5, target='#9fa7a3', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'f_terrazzo': L.pbr('wz_sf_terrazzo', 'terrazzo_tiles', tile=0.9, target='#a49a8c', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'f_floral': L.pbr('wz_sf_floral', 'floor_tiles_06', tile=0.7, target='#b0a48e', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'f_concrete': L.pbr('wz_sf_concrete', 'concrete_floor_painted', tile=1.4, target='#8f8b84', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.85),
    'wood_dk': L.pbr('wz_sf_wood_dark', 'dark_wood', tile=0.8, target='#5a3c28', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'wood_lt': L.pbr('wz_sf_wood_light', 'fine_grained_wood', tile=0.8, target='#a07850', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'steel': flat('wz_sf_steel', '#b9bcbf', rough=0.3, metal=0.45),
    'alu2': flat('wz_sf_alu', '#c9ccce', rough=0.35, metal=0.4),
    'black': flat('wz_sf_black', '#2a2a2c', rough=0.5, metal=0.2),
    'corr': L.pbr('wz_sf_corr', 'corrugated_iron', tile=0.6, target='#a7aaa8', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.45),
    'cloth_navy': flat('wz_sf_noren', '#22324e', rough=0.9),
    'lamp': L.flat('wz_sf_lamp', '#fff4dc', rough=0.3, emit=B.srgb('#ffe2b0')),
    'lamp_cool': L.flat('wz_sf_lamp_cool', '#f4f8ff', rough=0.3, emit=B.srgb('#eef6ff')),
    'vend_panel': L.flat('wz_sf_vend_panel', '#dfe9f2', rough=0.2, emit=B.srgb('#cfe4ff')),
}
VC = M['laundry']    # 頂點色材質（雜物的小零件顏色放在頂點色，整條巷子一次 draw call）


def _cm(name): return L.CMesh(name, VC)


# ---------------- 雜物原型（原點＝底部中央；正面朝 +z） ----------------
def p_stool(col):
    m = _cm('stool'); m.cbox(-0.17, 0.17, 0.43, 0.47, -0.17, 0.17, col)
    for sx in (-1, 1):
        for sz in (-1, 1): m.cbox(sx * 0.13 - 0.02, sx * 0.13 + 0.02, 0.0, 0.43, sz * 0.13 - 0.02, sz * 0.13 + 0.02, col, 0.85)
    return combine([m.finish(None, uv=False)], f'sk_stool_{col[1:]}')


def p_bins():
    m = _cm('bins')
    for x0, col in ((-0.48, '#3f7a4c'), (0.02, '#2f5f9c'), (0.5, '#d9b23a')):
        m.cbox(x0, x0 + 0.44, 0.0, 0.72, -0.2, 0.2, col); m.cbox(x0 - 0.02, x0 + 0.46, 0.72, 0.78, -0.22, 0.22, col, 0.8)
    return combine([m.finish(None, uv=False)], 'sk_bins')


def p_boxes():
    m = _cm('boxes'); y = 0.0
    for (w, h, d, dx, k) in ((0.6, 0.4, 0.45, 0.0, 1.0), (0.5, 0.35, 0.4, 0.04, 0.92), (0.36, 0.3, 0.3, -0.06, 1.05)):
        m.cbox(-w / 2 + dx, w / 2 + dx, y, y + h, -d / 2, d / 2, '#b48a5c', k); m.cbox(-w / 2 + dx, w / 2 + dx, y + h * 0.48, y + h * 0.52, -d / 2 - 0.003, d / 2 + 0.003, '#c9b48c', k); y += h
    return combine([m.finish(None, uv=False)], 'sk_boxes')


def p_umbrella():
    m = Mesh('umb_stand', SK['steel']); m.cyl((0, 0, 0), (0, 0.55, 0), 0.13, seg=10)
    u = _cm('umbs')
    for i, (dx, dz, c) in enumerate(((-0.04, 0.03, '#22324e'), (0.05, -0.02, '#b33a32'), (0.0, 0.05, '#3d5a47'))):
        u.cbox(dx - 0.025, dx + 0.025, 0.1, 0.95, dz - 0.025, dz + 0.025, c); u.cbox(dx - 0.012, dx + 0.012, 0.95, 1.05, dz - 0.012, dz + 0.012, '#2a2a2a')
    return combine([m.finish(None), u.finish(None, uv=False)], 'sk_umbrella')


def p_vend():
    m = _cm('vend'); m.cbox(-0.45, 0.45, 0.0, 1.82, -0.36, 0.36, '#e9e6dc'); m.cbox(-0.45, 0.45, 0.0, 0.1, -0.36, 0.36, '#3b3b3b')
    for r in range(4):
        y = 0.62 + r * 0.26
        for c in range(6): m.cbox(-0.36 + c * 0.12, -0.27 + c * 0.12, y, y + 0.16, 0.25, 0.33, ['#d64a3c', '#3a78c0', '#f2c440', '#4aa05a', '#f4f2ec', '#8a5a3c'][(r + c) % 6])
    m.cbox(0.24, 0.4, 0.3, 0.5, 0.36, 0.38, '#2a2a2a')
    pn = Mesh('vend_glass', M['glass']); pn.quad([(-0.4, 0.58, 0.345), (0.4, 0.58, 0.345), (0.4, 1.7, 0.345), (-0.4, 1.7, 0.345)])
    lt = Mesh('vend_light', SK['vend_panel']); lt.quad([(-0.42, 1.72, 0.362), (0.42, 1.72, 0.362), (0.42, 1.8, 0.362), (-0.42, 1.8, 0.362)])
    return combine([m.finish(None, uv=False), pn.finish(None), lt.finish(None)], 'sk_vend')


def p_fridge():
    m = _cm('fridge'); m.cbox(-0.4, 0.4, 0.0, 1.9, -0.32, 0.32, '#f2f2f0')
    for r in range(4):
        y = 0.22 + r * 0.38
        for c in range(7): m.cbox(-0.34 + c * 0.1, -0.29 + c * 0.1, y, y + 0.22, 0.08, 0.22, ['#2f7fbf', '#e0473a', '#f0c34a', '#58a65c', '#c9d4dc', '#7b4a2e', '#ffffff'][(r * 3 + c) % 7])
    gl = Mesh('fridge_glass', M['glass']); gl.quad([(-0.36, 0.12, 0.33), (0.36, 0.12, 0.33), (0.36, 1.78, 0.33), (-0.36, 1.78, 0.33)])
    lt = Mesh('fridge_light', SK['lamp_cool']); lt.quad([(-0.36, 1.8, 0.33), (0.36, 1.8, 0.33), (0.36, 1.86, 0.33), (-0.36, 1.86, 0.33)])
    return combine([m.finish(None, uv=False), gl.finish(None), lt.finish(None)], 'sk_fridge')


def p_bench():
    m = _cm('bench'); m.cbox(-0.7, 0.7, 0.42, 0.46, -0.18, 0.18, '#8a6a4a')
    for sx in (-0.6, 0.6): m.cbox(sx - 0.03, sx + 0.03, 0.0, 0.42, -0.16, 0.16, '#3a3a3a')
    return combine([m.finish(None, uv=False)], 'sk_bench')


def p_crates():
    """水果攤：三層木架＋箱子＋水果（低多邊形球）"""
    m = _cm('crates'); fr = []
    for k, (y, z) in enumerate(((0.0, 0.25), (0.32, -0.12), (0.64, -0.48))):
        m.cbox(-1.1, 1.1, y, y + 0.3, z - 0.18, z + 0.18, '#7a5a3a', 0.9)
        for c in range(4):
            x0 = -1.05 + c * 0.53; m.cbox(x0, x0 + 0.48, y + 0.3, y + 0.42, z - 0.17, z + 0.17, '#b88d55')
            fr.append((x0 + 0.24, y + 0.47, z, ['#e8892c', '#d93c2e', '#f2d040', '#7bb04a', '#a2315a', '#f0a030'][(k * 4 + c) % 6]))
    parts = [m.finish(None, uv=False)]
    by = {}
    for (x, y, z, c) in fr: by.setdefault(c, []).append((x, y, z))
    for c, lst in by.items():
        f = Mesh('fruit', flat('wz_sf_fruit_' + c[1:], c, rough=0.45))
        for (x, y, z) in lst:
            for dx in (-0.14, 0.0, 0.14):
                for dz in (-0.08, 0.08): f.sphere((x + dx, y, z + dz), 0.065, seg=6, rings=4)
        parts.append(f.finish(None, smooth=True))
    return combine(parts, 'sk_crates')


def p_noodle():
    """麵攤（台灣麵店在店門口煮麵）：不鏽鋼工作台＋兩鍋＋湯杓架＋玻璃櫥窗"""
    s = Mesh('noodle_steel', SK['steel']); s.box(-0.8, 0.8, 0.0, 0.85, -0.3, 0.3); s.box(-0.82, 0.82, 0.85, 0.88, -0.32, 0.32)
    s.cyl((-0.42, 0.88, 0.0), (-0.42, 1.12, 0.0), 0.22, seg=12); s.cyl((0.1, 0.88, 0.02), (0.1, 1.06, 0.02), 0.18, seg=12)
    s.box(0.42, 0.8, 0.88, 1.32, -0.28, 0.1)
    g = Mesh('noodle_glass', M['glass']); g.quad([(0.42, 0.9, 0.12), (0.8, 0.9, 0.12), (0.8, 1.3, 0.12), (0.42, 1.3, 0.12)])
    w = _cm('noodle_food'); w.cbox(0.46, 0.76, 0.9, 0.98, -0.24, 0.06, '#f0e2b0'); w.cbox(0.46, 0.76, 1.04, 1.1, -0.24, 0.06, '#7a4a2a')
    w.cbox(-0.62, -0.22, 1.12, 1.13, -0.2, 0.2, '#d8c8a0')
    return combine([s.finish(None), g.finish(None), w.finish(None, uv=False)], 'sk_noodle')


def p_bookcart():
    m = _cm('bookcart'); m.cbox(-0.6, 0.6, 0.0, 0.62, -0.24, 0.24, '#6a4a30'); m.cbox(-0.62, 0.62, 0.62, 0.66, -0.26, 0.26, '#7a5a3c')
    cols = ['#3d5a47', '#8a3a2a', '#d9c7a6', '#2f3e5c', '#c9a040', '#6d6d6d', '#a85a4a']
    x = -0.56; i = 0
    while x < 0.5:
        w = 0.035 + (i % 3) * 0.012; m.cbox(x, x + w, 0.66, 0.66 + 0.2 + (i % 4) * 0.02, -0.18, 0.12, cols[i % len(cols)]); x += w + 0.004; i += 1
    return combine([m.finish(None, uv=False)], 'sk_bookcart')


def p_meter():
    m = _cm('meter'); m.cbox(-0.22, 0.22, 0.0, 0.62, -0.02, 0.12, '#b9bcb6'); m.cbox(-0.12, 0.12, 0.34, 0.5, 0.12, 0.125, '#3a4048')
    return combine([m.finish(None, uv=False)], 'sk_meter')


P_STOOL_R, P_STOOL_B = p_stool('#c8392e'), p_stool('#2f6fb0')
PROTO = {'stool_r': P_STOOL_R, 'stool_b': P_STOOL_B, 'bins': p_bins(), 'boxes': p_boxes(), 'umb': p_umbrella(), 'vend': p_vend(),
         'fridge': p_fridge(), 'bench': p_bench(), 'crates': p_crates(), 'noodle': p_noodle(), 'bookcart': p_bookcart(), 'meter': p_meter()}

NOTE_Q = []   # (四點世界座標, 圖集格名稱)：最後合成一個網格（一次 draw call）


def note(xf, cellname, x, y, w, h, z):
    NOTE_Q.append(([xf.p(x - w / 2, y, z), xf.p(x + w / 2, y, z), xf.p(x + w / 2, y + h, z), xf.p(x - w / 2, y + h, z)], cellname))


def note_tilt(pts_world, cellname): NOTE_Q.append((pts_world, cellname))


def build_notes():
    if not NOTE_Q: return
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    for pts, cn in NOTE_Q:
        i = NOTES.index(cn); col, row = i % 4, i // 4; u0, u1 = col / 4, (col + 1) / 4; v1 = 1 - row / 4; v0 = v1 - 0.25
        vs = [bm.verts.new(g2b(*p)) for p in pts]; f = bm.faces.new(vs)
        for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    me = bpy.data.meshes.new('wz_shop_notes'); bm.to_mesh(me); bm.free(); me.materials.append(SK['notes'])
    ob = bpy.data.objects.new('wz_shop_notes', me); B.scene().collection.objects.link(ob); ob.parent = root


def aboard(xf, x, z, cell='chalk'):
    """A 字立牌：木腳＋前後兩面（圖集的黑板）"""
    m = acc(SK['wood_lt'])
    for sx in (-0.3, 0.27): xf.box(m, x + sx, x + sx + 0.03, 0.0, 0.95, z - 0.22, z + 0.22)
    for s in (-1, 1):
        zb, zt = z + s * 0.2, z + s * 0.03
        a = xf.p(x - 0.27, 0.1, zb); b = xf.p(x + 0.27, 0.1, zb); c = xf.p(x + 0.27, 0.9, zt); d = xf.p(x - 0.27, 0.9, zt)
        note_tilt([a, b, c, d] if s > 0 else [b, a, d, c], cell)


# ---------------- 店面 ----------------
def shopfront_v2(spec, xf, W, gt, wall):
    s = spec['shop']; sf = spec['sf']; R = sf.get('recess', 0.9); gz = -R
    iw = W - 0.6; ih = GH - 0.9; fr = frame_mat(s.get('frame', '#3b2a1e')); top = ih + 0.4
    # 店內景深卡（退到玻璃後 1.2 m）＋店內地板、兩側的牆
    face(f'INTERIOR_FACE_{spec["id"]}', M['board'], xf, [(-iw / 2, 0.15, gz - 1.2), (iw / 2, 0.15, gz - 1.2), (iw / 2, ih + 0.15, gz - 1.2), (-iw / 2, ih + 0.15, gz - 1.2)], {'interior': s['type']})
    xf.box(acc(M['gwall']), -iw / 2, iw / 2, 0, 0.15, gz - 1.3, gz)
    for sx in (-1, 1): xf.box(acc(M['plaster']), sx * iw / 2 - 0.03, sx * iw / 2 + 0.03, 0.15, ih + 0.15, gz - 1.2, gz)
    # 門廊：地坪（這家的磁磚）＋門檻、兩側壁柱（外牆材質）、天花板、門楣（招牌底下那一段牆）
    xf.box(acc(SK[sf['floor']]), -W / 2 + 0.28, W / 2 - 0.28, 0.0, 0.03, gz, 0.0)
    st = sf.get('step', 0.0)
    if st > 0: xf.box(acc(SK[sf['floor']]), -iw / 2, iw / 2, 0.0, st, gz, gz + 0.3)
    for sx in (-1, 1): xf.box(wall, sx * (W / 2 - 0.14) - 0.14, sx * (W / 2 - 0.14) + 0.14, 0, GH, gz, 0.0)
    xf.box(acc(M['ceilA']), -W / 2 + 0.28, W / 2 - 0.28, top - 0.04, top, gz, 0.0)
    xf.box(wall, -W / 2, W / 2, top, GH, -0.25, 0.0)
    lm = SK['lamp_cool'] if sf.get('light') == 'cool' else SK['lamp']
    for lx in ([0.0] if W < 7 else [-W / 4, W / 4]):
        q = xf.p(lx, top - 0.06, gz / 2); acc(lm).sphere(q, 0.07, seg=8, rings=4)
        CL.glow(root, 'shoplamp', q[0], q[1] - 0.05, q[2], color='rgba(240,248,255,1)' if sf.get('light') == 'cool' else 'rgba(255,214,150,1)', size=1.3, day=0.0, night=0.9)
    # 門面
    door = sf.get('door', 'alu'); f_ = acc(fr)
    if door != 'open':
        xf.box(f_, -iw / 2, iw / 2, ih + 0.1, ih + 0.18, gz - 0.06, gz + 0.06); xf.box(f_, -iw / 2, iw / 2, 0.08, 0.16, gz - 0.06, gz + 0.06)
        xf.quad(acc(M['glass']), [(-iw / 2, 0.16, gz + 0.01), (iw / 2, 0.16, gz + 0.01), (iw / 2, ih + 0.1, gz + 0.01), (-iw / 2, ih + 0.1, gz + 0.01)])
    dw = sf.get('door_w', 1.8); dx = sf.get('door_x', 0.0)
    if door == 'alu':
        a = acc(SK['alu2'])
        for x in (-iw / 2, dx - dw / 2, dx, dx + dw / 2, iw / 2): xf.box(a, x - 0.04, x + 0.04, 0.08, ih + 0.18, gz - 0.05, gz + 0.05)
        for x in (dx - 0.12, dx + 0.08): xf.box(a, x, x + 0.03, 0.9, 1.45, gz + 0.05, gz + 0.1)                    # 長把手
        xf.box(a, -iw / 2, iw / 2, 1.0, 1.04, gz - 0.03, gz + 0.03)                                                   # 腰框
    elif door in ('wood', 'lattice'):
        w = acc(SK['wood_dk'])
        for x in (-iw / 2, dx - dw / 2, dx, dx + dw / 2, iw / 2): xf.box(w, x - 0.06, x + 0.06, 0.08, ih + 0.18, gz - 0.06, gz + 0.06)
        xf.box(w, -iw / 2, iw / 2, 0.08, 0.55, gz - 0.04, gz + 0.04)                                                  # 下半部木板
        if door == 'lattice':                                                                                         # 木格拉門（定食、茶屋）
            for k in range(1, 8): y = 0.55 + k * (ih - 0.45) / 8; xf.box(w, -iw / 2, iw / 2, y - 0.012, y + 0.012, gz - 0.03, gz + 0.03)
            for k in range(1, int(iw / 0.3)): x = -iw / 2 + k * 0.3; xf.box(w, x - 0.012, x + 0.012, 0.55, ih + 0.1, gz - 0.03, gz + 0.03)
        for x in (dx - 0.1, dx + 0.07): xf.box(acc(M['brass']), x, x + 0.03, 1.0, 1.2, gz + 0.06, gz + 0.1)
    elif door == 'auto':
        a = acc(SK['alu2']); dw = sf.get('door_w', 2.4)
        for x in (-iw / 2, dx - dw / 2, dx, dx + dw / 2, iw / 2): xf.box(a, x - 0.03, x + 0.03, 0.08, ih + 0.18, gz - 0.05, gz + 0.05)
        xf.box(a, dx - dw / 2 - 0.1, dx + dw / 2 + 0.1, ih + 0.18, ih + 0.36, gz - 0.02, gz + 0.16)                 # 自動門的機箱
        xf.box(acc(M['ac_dark']), dx - 0.08, dx + 0.08, ih + 0.2, ih + 0.26, gz + 0.16, gz + 0.19)                   # 感應器
    elif door == 'open':                                                                                              # 整面拉開：摺門收在兩側
        w = acc(SK['alu2'])
        for sx in (-1, 1):
            for k in range(4):
                x = sx * (iw / 2 - 0.05 - k * 0.07); xf.box(w, x - 0.025, x + 0.025, 0.05, ih + 0.1, gz - 0.25 + (k % 2) * 0.12, gz + 0.02)
        xf.box(f_, -iw / 2, iw / 2, ih + 0.1, ih + 0.18, gz - 0.06, gz + 0.06)
    if sf.get('noren'):                                                                                               # 暖簾（定食）
        n = acc(SK['cloth_navy'])
        for k in range(3):
            x0 = dx - 0.75 + k * 0.5; xf.quad(n, [(x0 + 0.02, ih - 0.55, gz + 0.12), (x0 + 0.48, ih - 0.55, gz + 0.12), (x0 + 0.48, ih + 0.05, gz + 0.12), (x0 + 0.02, ih + 0.05, gz + 0.12)])
        xf.cyl(acc(SK['wood_dk']), (dx - 0.8, ih + 0.07, gz + 0.12), (dx + 0.8, ih + 0.07, gz + 0.12), 0.02, seg=6)
    # 鐵捲門箱＋導軌
    if sf.get('rollbox', True):
        a = acc(M['alu']); xf.box(a, -iw / 2 - 0.05, iw / 2 + 0.05, ih + 0.2, top - 0.05, gz + 0.06, gz + 0.36)
        for sx in (-1, 1): xf.box(a, sx * (iw / 2 + 0.02) - 0.035, sx * (iw / 2 + 0.02) + 0.035, 0.0, ih + 0.2, gz + 0.06, gz + 0.14)
    # 招牌（字照舊由遊戲畫：SIGN_FACE）
    sw = min(W - 0.4, sf.get('sign_w', 6.5)); sy0, sy1 = GH - 0.7, GH - 0.06; ss = sf.get('sign', 'lightbox')
    if ss == 'lightbox':
        xf.box(acc(SK['alu2']), -sw / 2 - 0.06, sw / 2 + 0.06, sy0 - 0.06, sy1 + 0.06, 0.0, 0.26); zf = 0.265
    elif ss == 'wood':
        w = acc(SK['wood_dk']); xf.box(w, -sw / 2 - 0.1, sw / 2 + 0.1, sy0 - 0.1, sy1 + 0.1, 0.0, 0.12); zf = 0.125
        for sx in (-1, 1): xf.box(acc(SK['black']), sx * (sw / 2 - 0.3) - 0.02, sx * (sw / 2 - 0.3) + 0.02, sy1 + 0.1, sy1 + 0.45, 0.02, 0.06)
    else:
        xf.box(acc(fr), -sw / 2 - 0.03, sw / 2 + 0.03, sy0 - 0.03, sy1 + 0.03, 0.0, 0.05); zf = 0.055
    face(f'SIGN_FACE_{spec["id"]}', M['board'], xf, [(-sw / 2, sy0, zf), (sw / 2, sy0, zf), (sw / 2, sy1, zf), (-sw / 2, sy1, zf)],
         {'sign': s['name'], 'sub': s.get('sub', ''), 'bg': s.get('signBg', '#3b2a1e'), 'color': s.get('signColor', '#f4ead8'), 'serif': 1 if s.get('serif') else 0, 'band': s.get('band', '')})
    if ss == 'lightbox': CL.glow(root, 'signbox', *xf.p(0, (sy0 + sy1) / 2, 0.5), color='rgba(255,250,235,1)', size=2.2, day=0.0, night=0.55)
    if s.get('vertical'):
        vsign(xf, spec['id'], W / 2 - 0.5, GH + 0.3, GH + 2.9, {'vertical': s['vertical'], 'vBg': s.get('vBg', '#ffffff'), 'vColor': s.get('vColor', '#b0332a'), 'vBand': s.get('vBand', '#b0332a'), 'serif': 1 if s.get('serif') else 0})
    # 雨棚
    aw_ = sf.get('awning'); aw = W - 0.5
    if aw_ and aw_.startswith('stripe'):
        m = acc(SK[aw_]); ay0, ay1, ad = top + 0.0, top - 0.45, 1.0
        xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1]); xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)])
        xf.box(m, -aw / 2, aw / 2, ay1 - 0.24, ay1, ad - 0.01, ad + 0.01)
        for sx in (-1, 1): xf.cyl(acc(M['metal']), (sx * aw / 2, ay0, 0.02), (sx * aw / 2, ay1 + 0.02, ad), 0.015, seg=5)
    elif aw_ == 'metal':                                                                                              # 鐵皮雨遮（浪板＋三角鐵架）
        m = acc(SK['corr']); ay0, ay1, ad = GH + 0.25, GH - 0.05, 0.85
        xf.quad(m, [(-aw / 2, ay0, 0.0), (aw / 2, ay0, 0.0), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)]); xf.quad(m, [(-aw / 2, ay0, 0.0), (aw / 2, ay0, 0.0), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1])
        for x in (-aw / 2 + 0.2, 0.0, aw / 2 - 0.2): xf.cyl(acc(SK['black']), (x, ay0 - 0.5, 0.0), (x, ay1 - 0.02, ad - 0.05), 0.012, seg=5)
    elif aw_ and aw_.startswith('#'):
        m = acc(awning_mat(aw_)); ay0, ay1, ad = top, top - 0.4, 0.9
        xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1]); xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)])
        xf.box(m, -aw / 2, aw / 2, ay1 - 0.2, ay1, ad - 0.01, ad + 0.01)
    # 玻璃上的紙條、門邊的牌子
    for (cn, x, y, w, h) in sf.get('notes', []): note(xf, cn, x, y, w, h, gz + 0.03)
    # 門廊雜物（都在 z∈(gz, 0)：建築的導航阻擋範圍內）
    for it in sf.get('clutter', []):
        k, x, z = it[0], it[1], it[2]; zz = gz + z
        if k == 'aboard': aboard(xf, x, zz, it[3] if len(it) > 3 else 'chalk')
        elif k == 'pot': B.instance(POT_BROAD if (len(it) > 3 and it[3] == 'broad') else POT_FERN[int(abs(x * 7)) % 2], f'skpot_{spec["id"]}_{len(_inst)}', *_wp(xf, x, zz), root, ry=x * 1.7); _inst.append(1)
        else: inst(PROTO[k], f'sk_{k}_{spec["id"]}', xf, x, 0.0, zz)
    # 設備：一樓冷氣（門楣旁）、電錶箱、排油煙管
    if sf.get('ac'): ax = sf['ac']; inst(AC, f'skac_{spec["id"]}', xf, ax, GH - 0.95, 0.0)
    if sf.get('meter') is not None: inst(PROTO['meter'], f'skmeter_{spec["id"]}', xf, sf['meter'], 1.5, 0.0)
    if sf.get('duct') is not None:
        dxp = sf['duct']; xf.cyl(acc(SK['steel']), (dxp, GH - 0.4, 0.18), (dxp, GH + 3 * FH, 0.18), 0.11, seg=10)
        xf.cyl(acc(SK['steel']), (dxp, GH - 0.4, 0.18), (dxp, GH - 0.4, -0.3), 0.11, seg=10)


def _wp(xf, x, z):
    p = xf.p(x, 0, z); return p[0], 0.0, p[2]


def housefront_v2(spec, xf, W, rng, rec):
    """住家一樓（鐵門）：門口的雜物、紙條（課輔班的樓梯口也是這種）"""
    sf = spec['sf']
    for (cn, x, y, w, h) in sf.get('notes', []): note(xf, cn, x, y, w, h, -rec + 0.06)
    for it in sf.get('clutter', []):
        k, x, z = it[0], it[1], it[2]; zz = -rec + z
        if k == 'pot': B.instance(POT_BROAD if (len(it) > 3 and it[3] == 'broad') else POT_FERN[int(abs(x * 7)) % 2], f'skpot_{spec["id"]}_{len(_inst)}', *_wp(xf, x, zz), root, ry=x * 1.7); _inst.append(1)
        elif k == 'aboard': aboard(xf, x, zz, it[3] if len(it) > 3 else 'chalk')
        else: inst(PROTO[k], f'sk_{k}_{spec["id"]}', xf, x, 0.0, zz)
    if sf.get('meter') is not None: inst(PROTO['meter'], f'skmeter_{spec["id"]}', xf, sf['meter'], 1.5, -rec)


def shutter_v2(spec, xf, W, rec):
    """拉下鐵捲門的店（空店面）：鐵捲門照舊＋紙條（招租、暫停營業）"""
    sf = spec['sf']
    for (cn, x, y, w, h) in sf.get('notes', []): note(xf, cn, x, y, w, h, -rec + 0.06)
    for it in sf.get('clutter', []):
        k, x, z = it[0], it[1], it[2]; inst(PROTO[k], f'sk_{k}_{spec["id"]}', xf, x, 0.0, -rec + z)


# ---------------- 每一間的樣式（7b-2：相鄰的店至少三樣不同）----------------
# 門廊雜物的 z：從玻璃（−recess）往外量，0.1～0.8；x：建築自己的座標（−W/2..W/2）
SF = {
    'A1': dict(door='alu', sign='lightbox', awning='metal', floor='f_granite', step=0.06, light='cool', ac=2.6, meter=-3.5,
               notes=[('copyprice', -2.6, 0.9, 0.62, 0.62), ('copyprice2', -1.9, 0.9, 0.62, 0.62), ('nobook', 1.6, 1.3, 0.5, 0.5), ('pay', 2.3, 1.45, 0.34, 0.34)],
               clutter=[('vend', -3.0, 0.42), ('boxes', 2.9, 0.35)]),
    'A3': dict(door='wood', sign='wood', awning='stripe_green', floor='f_quarry', step=0.1, door_x=1.4,
               notes=[('hours', -1.2, 1.2, 0.36, 0.36), ('poster', 3.6, 1.0, 0.5, 0.6)],
               clutter=[('bookcart', -3.4, 0.35), ('aboard', 3.9, 0.45, 'menu'), ('pot', -4.9, 0.3, 'broad'), ('pot', 5.0, 0.3)]),
    'A4': dict(door='open', sign='panel', awning='stripe_red', floor='f_mosaic', light='warm', ac=-2.7, duct=3.4,
               notes=[('menu', 2.4, 1.2, 0.6, 0.66)],
               clutter=[('noodle', -1.6, 0.42), ('stool_r', 0.6, 0.55), ('stool_b', 1.1, 0.4), ('stool_r', 2.9, 0.55)]),
    'A5': dict(door='auto', sign='lightbox', awning=None, floor='f_white', light='cool', door_x=-1.4, rollbox=False,
               notes=[('hours2', 0.6, 1.25, 0.42, 0.42), ('pay', 1.2, 1.3, 0.34, 0.34), ('hiring', 2.6, 1.1, 0.42, 0.46)],
               clutter=[('bins', 2.6, 0.32), ('umb', 0.3, 0.3), ('fridge', 3.3, 0.36)]),
    'B2': dict(door='alu', sign='panel', awning='#3a6f8c', floor='f_terrazzo', light='cool', door_w=1.0, door_x=-1.6, meter=2.6,
               notes=[('hours2', -0.6, 1.2, 0.4, 0.4), ('lostcat', 1.4, 1.1, 0.4, 0.42)],
               clutter=[('bench', 0.9, 0.35)]),
    'B3': dict(door='lattice', sign='wood', awning='stripe_navy', floor='f_floral', step=0.12, noren=True, light='warm', door_x=-2.0, ac=4.8,
               notes=[('menu', 2.2, 1.0, 0.58, 0.62), ('hours', 3.0, 1.2, 0.34, 0.34)],
               clutter=[('aboard', 4.4, 0.45, 'menu'), ('pot', -5.8, 0.3, 'broad'), ('pot', -5.2, 0.32), ('umb', 5.6, 0.3)]),
    'B6': dict(door='open', sign='panel', awning='stripe_orange', floor='f_concrete', light='warm', ac=-3.7,
               notes=[('pay', 3.5, 1.6, 0.32, 0.32)],
               clutter=[('crates', -1.2, 0.55), ('boxes', 3.4, 0.35), ('stool_b', 2.4, 0.45)]),
}
# 住家、空店面
SF_HOUSE = {
    'A2': dict(notes=[('poster', 1.4, 1.2, 0.36, 0.42)], clutter=[('pot', 0.9, 0.12), ('pot', 1.2, 0.14, 'broad'), ('pot', 2.6, 0.12)], meter=-2.6),
    'B4': dict(notes=[], clutter=[('pot', -4.6, 0.12, 'broad'), ('pot', -4.0, 0.12), ('bins', 4.2, 0.22)], meter=-4.9),
    'B7': dict(notes=[('tutor', -0.4, 1.2, 0.42, 0.46)], clutter=[('pot', 2.8, 0.12), ('umb', 2.2, 0.15)], meter=-3.3),   # B7：二樓是課輔班（樓梯口，ART-BG13）
}
SF_SHUTTER = {
    'B1': dict(notes=[('rent', -1.0, 1.0, 0.7, 0.7), ('closed', 1.6, 1.2, 0.5, 0.5)], clutter=[('boxes', 3.6, 0.3)]),
}
