"""農業陳列館（洞洞館；套件 CK.pavilion）的正式外觀 → GLB（校園世界座標）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_pavilion.py [-- --out 輸出.glb]

照 src/zones3d.js campus 區塊：CK.pavilion({w:22,d:14,gfh:4.0,h:9,sign:'農業陳列館'})；ckPlace(hole,-104,-30,0)（正面朝南對著椰林大道）。
位置、尺寸、樓層、柱子、入口照套件（campuskit3d.js pavilion() 的算法）；導航阻擋（整個佔地 22×14 m）、鏡頭碰撞、門口互動點都在遊戲程式裡，不變。
**沒有使用者提供的洞洞館照片**：照套件的量體與註解（上層四面是圓洞鏤空牆、一樓玻璃＋方柱、平屋頂寬屋簷）做，不是照真實建築一比一重建。

和套件不同的地方（品質）：
  - 鏤空牆是真的鏤空：圓洞用貼圖的透明度挖掉（glTF alphaMode MASK，洞的直徑 0.24 m、間距 0.4 m），前後兩層（相隔 0.12 m）——斜看時前後兩層的洞錯開，看得出筒狀的厚度；
    鏤空牆後面 0.54 m 是二樓的牆（深色），白天從洞裡看進去是暗的，晚上照房間（每 2.4 m 一段，約七成）透出暖光。陽光從洞裡穿過，影子是一點一點的。
    套件是一張畫了深色圓點的貼圖貼在方塊上。
  - 一樓：往內退的玻璃帷幕（每格 1.57 m、深色窗框、橫框），亮燈的窗晚上由上往下漸暗（和總圖同一套做法）；入口是石材門框＋玻璃雙開門＋匾額。
  - 結構（柱子、樓板邊、屋簷、牆、台階）一個材質（Poly Haven painted_plaster_wall，平整的漆面粉刷，校正成套件的米白），材質越少越好：
    進校門鏡頭五個地標加起來 draw call 已經是改之前的 1.088 倍（上限 1.1）。
材質（draw call）：ck_pav_conc（結構）、ck_pav_screen（鏤空牆）、ck_pav_dark（二樓內牆、窗框、門框、屋頂防水層：自發光貼圖左半黑、右半暖光，UV 決定亮不亮）、
ck_glass（一樓玻璃，和總圖同名＝遊戲端同一套夜間設定）、匾額（canvas 字）。
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy   # noqa: E402
from cafe_layout import uv01   # noqa: E402

W, D, GFH, H, INSET = 22.0, 14.0, 4.0, 9.0, 0.6
PLACE = (-104.0, -30.0, 0.0)
OUT = 'assets/models/env/second_ai/campus_pavilion.glb'
CELL, TILE, HOLE_R = 0.4, 2.4, 0.12          # 洞的間距、一張貼圖（6×6 個洞）、洞的半徑
SY0, SY1 = GFH + 0.3, GFH + 0.3 + 11 * CELL  # 鏤空的範圍（11 排洞）：上下各留 0.1 m 實心的收邊（套件的鏤空牆 4.2–8.8 m）
GL_TOP, GL_BOT = (0.26, 0.31, 0.36), (0.06, 0.08, 0.10)
U_DARK, U_LIT = 0.125, 0.875                 # 自發光貼圖：左半黑、右半燈光（和 campus_hall.py 相同的做法）


def screen_png():
    """鏤空牆的貼圖（RGBA 512×512＝2.4 m×2.4 m、6×6 個洞）：顏色是 Poly Haven painted_plaster_wall（降低彩度、校正成套件的米白 #e7e4d6），
    洞的地方透明，洞口外一圈稍暗（筒口的陰影）。規則排列的開口，不是隨機的紋理"""
    import numpy as np
    from PIL import Image
    out = os.path.join(HERE, 'textures', 'gen', 'pav_screen.png')
    src = os.path.join(L.tex_dir('painted_plaster_wall'), 'painted_plaster_wall', 'painted_plaster_wall_diff_1k.jpg')
    a = np.asarray(Image.open(src).convert('RGB').resize((512, 512), Image.LANCZOS), dtype=np.float32) / 255.0
    g = a.mean(axis=2, keepdims=True); a = g + (a - g) * 0.3                       # 降低彩度
    tgt = np.array([0xe7, 0xe4, 0xd6], np.float32) / 255.0; a = np.clip(a * (tgt / a.reshape(-1, 3).mean(axis=0)), 0, 1)
    n = 6; cs = 512 / n; r = HOLE_R / TILE * 512
    yy, xx = np.mgrid[0:512, 0:512].astype(np.float32) + 0.5
    cx = (np.floor(xx / cs) + 0.5) * cs; cy = (np.floor(yy / cs) + 0.5) * cs; dist = np.hypot(xx - cx, yy - cy)
    alpha = np.clip(dist - r + 0.5, 0, 1)                                          # 洞裡透明（邊緣 1 個像素的過渡）
    rim = np.clip(1 - (dist - r) / 7.0, 0, 1) * (dist >= r)                        # 洞口外 7 個像素稍暗
    a = a * (1 - 0.22 * rim[..., None])
    rgba = np.concatenate([a, alpha[..., None]], axis=2)
    Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), 'RGBA').save(out)
    return out


def emit_image(name, grad):
    """自發光貼圖 64×64：左半黑（沒亮燈）、右半燈光；grad：由上往下漸暗（窗）或平均（從洞裡看進去的房間）"""
    im = bpy.data.images.new(name, 64, 64, alpha=False); px = []
    for j in range(64):
        t = j / 63
        if grad:
            k = [(0.50, 0.36, 0.22), (0.86, 0.70, 0.48), (1.0, 0.92, 0.76)]
            a, b, u = (k[0], k[1], t / 0.6) if t < 0.6 else (k[1], k[2], (t - 0.6) / 0.4)
            c = [a[i] + (b[i] - a[i]) * u for i in range(3)]
        else:
            c = [0.95, 0.74, 0.46]
        px += [0.0, 0.0, 0.0, 1.0] * 32 + (c + [1.0]) * 32
    im.pixels.foreach_set(px); im.pack(); return im


def add_emit(mat, im):
    nt = mat.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = im; tx.extension = 'EXTEND'
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Emission Color']); nt.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 1.0


def build(out=None):
    out = os.path.join(L.ROOT, out or OUT)
    B.reset(texres=512)
    root = B.group('campus_pavilion', props={'kind': 'campus_pavilion'})
    png = screen_png()
    M = {
        'conc': L.pbr('ck_pav_conc', 'painted_plaster_wall', tile=2.5, target='#e9e5d8', sat=0.3, normal=0.4, maps=('diff', 'nor'), rough_value=0.88),
        'dark': L.flat('ck_pav_dark', '#2c2f31', rough=0.6),
        'glass': L.vc_material('ck_glass', rough=0.12),
        'board': L.flat('ck_board', '#e9e5d8', rough=0.8),
    }
    add_emit(M['dark'], emit_image('pav_room_lit', False)); add_emit(M['glass'], emit_image('win_lit_grad', True))
    sc = bpy.data.materials.new('ck_pav_screen'); sc.use_nodes = True; nt = sc.node_tree; bs = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(png); tx.image.alpha_mode = 'STRAIGHT'
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.55   # 上釉的陶筒：比牆亮一點
    rd = nt.nodes.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha'])   # → glTF alphaMode MASK
    try: sc.surface_render_method = 'DITHERED'
    except Exception: pass
    sc.use_backface_culling = False; M['screen'] = sc

    pxx, pzz, ry = PLACE; cc, ss = round(math.cos(ry)), round(math.sin(ry))
    def XF(x, y, z): return (pxx + x * cc + z * ss, y, pzz - x * ss + z * cc)

    def newell(pts):
        n = [0.0, 0.0, 0.0]
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
        return n

    accs = {}
    def acc(k):
        if k not in accs: accs[k] = (CMesh if k == 'glass' else Mesh)('pav_' + k, M[k])
        return accs[k]

    def face(m, pts, want=None, uvs=None, col=None):
        if want is not None:
            n = newell(pts)
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]; uvs = uvs[::-1] if uvs else uvs; col = col[::-1] if col else col
        f = m.bm.faces.new([m.bm.verts.new(g2b(*XF(*p))) for p in pts])
        if uvs:
            lay = m.bm.loops.layers.uv.get('UVMap') or m.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, uvs): lp[lay].uv = uv
        if col:
            for lp, c in zip(f.loops, col): lp[m.col] = list(c) + [1.0]
        return f

    def box(m, x0, x1, y0, y1, z0, z1, skip=(), uv=None):
        F_ = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
              'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
              'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
        for k, (pts, n) in F_.items():
            if k not in skip: face(m, pts, n, [uv] * 4 if uv else None)

    def lit_hash(*k):
        h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
        return h - math.floor(h) > 0.3          # 約七成亮燈（和總圖、套件相同）

    cm, dk = acc('conc'), acc('dark')
    DU = (U_DARK, 0.5)                          # 深色材質不發光的 UV（窗框、門框、屋頂防水層）

    # ---------------- 一樓：方柱、往內退的玻璃帷幕（前後）、實牆（左右）、地坪 ----------------
    nc = max(3, round(W / 4))
    col_x = [-W / 2 + 0.3 + (W - 0.6) * i / nc for i in range(nc + 1)]
    for x in col_x:
        for zs in (1, -1):
            if zs > 0 and abs(x) < 1.6: continue   # 入口正前方不放柱子（套件在門口正中間有一根，擋住門和匾額；整棟的佔地都是導航阻擋，拿掉不影響走路）
            box(cm, x - 0.25, x + 0.25, 0.1, GFH - 0.175, zs * (D / 2 - 0.3) - 0.25, zs * (D / 2 - 0.3) + 0.25, skip=('bottom', 'top'))
    for xs in (1, -1): box(cm, xs * (W / 2 - 0.3) - 0.25, xs * (W / 2 - 0.3) + 0.25, 0.1, GFH - 0.175, -0.25, 0.25, skip=('bottom', 'top'))
    box(cm, -W / 2, W / 2, 0.0, 0.1, -D / 2, D / 2, skip=('bottom',))                     # 地坪（比地面高 10 cm）
    box(cm, -2.0, 2.0, 0.0, 0.15, D / 2, D / 2 + 1.0, skip=('bottom', 'back'))           # 入口台階（套件 4.0×0.15×1.6，從牆面算起）
    gx0, gx1 = -(W / 2 - INSET), W / 2 - INSET; gz = D / 2 - INSET
    for xs in (1, -1):                                                                   # 左右實牆
        x = xs * gx1; face(cm, [(x, 0.1, -gz), (x, 0.1, gz), (x, GFH - 0.175, gz), (x, GFH - 0.175, -gz)], (xs, 0, 0))
    gw = gx1 - gx0 - 0.4; n = round(gw / 1.6); sw = gw / n; gy0, gy1 = 0.25, GFH - 0.5
    panes = [(gx0 + 0.2 + sw * k, gx0 + 0.2 + sw * (k + 1)) for k in range(n)]
    door_k = [k for k, (xa, xb) in enumerate(panes) if xb > -2.0 and xa < 2.0]       # 正面中間是入口：佔掉的那幾格（套件的門 2.2 m 寬）
    DX0, DX1 = panes[door_k[0]][0], panes[door_k[-1]][1]                             # 入口石材門框的寬度＝佔掉的格子（約 4.7 m）
    for zs in (1, -1):
        z = zs * gz; N_ = (0, 0, zs)
        face(cm, [(gx0, 0.1, z), (gx0 + 0.2, 0.1, z), (gx0 + 0.2, GFH - 0.175, z), (gx0, GFH - 0.175, z)], N_)   # 兩端收邊
        face(cm, [(gx1 - 0.2, 0.1, z), (gx1, 0.1, z), (gx1, GFH - 0.175, z), (gx1 - 0.2, GFH - 0.175, z)], N_)
        face(cm, [(gx0 + 0.2, gy1, z), (gx1 - 0.2, gy1, z), (gx1 - 0.2, GFH - 0.175, z), (gx0 + 0.2, GFH - 0.175, z)], N_)   # 玻璃上方的楣
        face(cm, [(gx0 + 0.2, 0.1, z), (gx1 - 0.2, 0.1, z), (gx1 - 0.2, gy0, z), (gx0 + 0.2, gy0, z)], N_)                   # 玻璃下方的踢腳
        for k, (xa, xb) in enumerate(panes):
            if zs > 0 and k in door_k: continue
            lit = lit_hash(zs, k); u = U_LIT if lit else U_DARK; dz = -zs * 0.06       # 玻璃內凹 6 cm
            face(acc('glass'), [(xa, gy0, z + dz), (xb, gy0, z + dz), (xb, gy1, z + dz), (xa, gy1, z + dz)], N_, [(u, 0), (u, 0), (u, 1), (u, 1)], [GL_BOT, GL_BOT, GL_TOP, GL_TOP])
            for xm in (xa, xb):                                                          # 直櫺（深色，正面＋兩側）
                box(dk, xm - 0.04, xm + 0.04, gy0, gy1, min(z, z + dz) - 0.01, max(z, z + dz) + 0.01, skip=('bottom', 'top'), uv=DU)
            box(dk, xa, xb, gy0 + 1.15, gy0 + 1.21, min(z, z + dz), max(z, z + dz) + 0.01, uv=DU)   # 橫框（約 1.4 m 高）
    # 入口：石材門框（兩側門柱＋門楣，往外凸 12 cm）＋往內退的玻璃雙開門（深色門框、門把）＋門楣上的匾額
    z = gz; dw, dh = 2.2, 2.8; ox = 0.15                                                   # 門洞 2.5 m 寬（門 2.2 m＋兩側 0.15 m）
    box(cm, DX0, -dw / 2 - ox, 0.1, GFH - 0.175, z - 0.05, z + 0.12, skip=('bottom', 'top', 'back'))
    box(cm, dw / 2 + ox, DX1, 0.1, GFH - 0.175, z - 0.05, z + 0.12, skip=('bottom', 'top', 'back'))
    box(cm, -dw / 2 - ox, dw / 2 + ox, 0.25 + dh, GFH - 0.175, z - 0.05, z + 0.12, skip=('top', 'back'))
    face(cm, [(-dw / 2 - ox, 0.1, z - 0.05), (dw / 2 + ox, 0.1, z - 0.05), (dw / 2 + ox, 0.25 + dh, z - 0.05), (-dw / 2 - ox, 0.25 + dh, z - 0.05)], (0, 0, 1))   # 門洞底（門的後面那一面）
    dzg = z - 0.04
    face(acc('glass'), [(-dw / 2, 0.15, dzg), (dw / 2, 0.15, dzg), (dw / 2, 0.15 + dh, dzg), (-dw / 2, 0.15 + dh, dzg)], (0, 0, 1), [(U_LIT, 0), (U_LIT, 0), (U_LIT, 0.6), (U_LIT, 0.6)], [GL_BOT, GL_BOT, GL_TOP, GL_TOP])
    for xm in (-dw / 2, 0.0, dw / 2): box(dk, xm - 0.05, xm + 0.05, 0.15, 0.15 + dh, dzg - 0.005, dzg + 0.03, skip=('bottom',), uv=DU)
    box(dk, -dw / 2 - 0.05, dw / 2 + 0.05, 0.15 + dh, 0.25 + dh, dzg - 0.005, dzg + 0.03, uv=DU)
    for xm in (-0.12, 0.12): box(dk, xm - 0.015, xm + 0.015, 0.95, 1.35, dzg + 0.03, dzg + 0.07, uv=DU)   # 門把
    # 一樓天花板（柱廊頂）＝二樓樓板的底面
    # （原本這一面只到牆線、樓板的底面又畫一次：同一個平面、同一個材質不同的 UV，從柱廊抬頭看會閃——底面只畫這一次，連樓板突出的 15 cm 一起）
    face(cm, [(-W / 2 - 0.15, GFH - 0.175, -D / 2 - 0.15), (W / 2 + 0.15, GFH - 0.175, -D / 2 - 0.15), (W / 2 + 0.15, GFH - 0.175, D / 2 + 0.15), (-W / 2 - 0.15, GFH - 0.175, D / 2 + 0.15)], (0, -1, 0))

    # ---------------- 樓板邊（一樓頂）、二樓：深色的內牆（從洞裡看得到；晚上每 2.4 m 一段照房間亮燈）、四面鏤空牆＋收邊、屋頂 ----------------
    box(cm, -W / 2 - 0.15, W / 2 + 0.15, GFH - 0.175, GFH + 0.175, -D / 2 - 0.15, D / 2 + 0.15, skip=('bottom',))
    iw, idp = W / 2 - INSET, D / 2 - INSET
    for (fr, ln, sgn) in (('front', 2 * iw, 1), ('back', 2 * iw, -1), ('right', 2 * idp, 1), ('left', 2 * idp, -1)):
        nseg = max(1, round(ln / 2.4)); sl = ln / nseg
        for k in range(nseg):
            a, b_ = -ln / 2 + sl * k, -ln / 2 + sl * (k + 1); u = U_LIT if lit_hash(9, ord(fr[0]), k) else U_DARK; uvs = [(u, 0.1), (u, 0.1), (u, 0.9), (u, 0.9)]
            if fr in ('front', 'back'):
                z = sgn * idp; face(dk, [(a, GFH + 0.175, z), (b_, GFH + 0.175, z), (b_, H, z), (a, H, z)], (0, 0, sgn), uvs)
            else:
                x = sgn * iw; face(dk, [(x, GFH + 0.175, a), (x, GFH + 0.175, b_), (x, H, b_), (x, H, a)], (sgn, 0, 0), uvs)
    sm = acc('screen')
    def screen_plane(fr, off):
        """一面鏤空牆的一層（off：從外框往內的距離）；UV 讓洞剛好落在格子中間（u、v 以 2.4 m 為一張貼圖）"""
        if fr in ('front', 'back'):
            s = 1 if fr == 'front' else -1; z = s * (D / 2 + 0.06 - off); xa, xb = -W / 2, W / 2
            pts = [(xa, SY0, z), (xb, SY0, z), (xb, SY1, z), (xa, SY1, z)]; us = [(xa + W / 2) / TILE, (xb + W / 2) / TILE]
            face(sm, pts, (0, 0, s), [(us[0], 0), (us[1], 0), (us[1], (SY1 - SY0) / TILE), (us[0], (SY1 - SY0) / TILE)])
        else:
            s = 1 if fr == 'right' else -1; x = s * (W / 2 + 0.06 - off); za, zb = -D / 2, D / 2
            pts = [(x, SY0, za), (x, SY0, zb), (x, SY1, zb), (x, SY1, za)]; us = [(za + D / 2) / TILE, (zb + D / 2) / TILE]
            face(sm, pts, (s, 0, 0), [(us[0], 0), (us[1], 0), (us[1], (SY1 - SY0) / TILE), (us[0], (SY1 - SY0) / TILE)])
    for fr in ('front', 'back', 'right', 'left'):
        screen_plane(fr, 0.0); screen_plane(fr, 0.12)
    # 鏤空牆的收邊（上下各 0.1 m 實心＋轉角的方柱，蓋住兩面鏤空牆的接縫）
    for (y0, y1) in ((GFH + 0.175, SY0), (SY1, H)):
        box(cm, -W / 2 - 0.06, W / 2 + 0.06, y0, y1, D / 2 - 0.06, D / 2 + 0.06, skip=()); box(cm, -W / 2 - 0.06, W / 2 + 0.06, y0, y1, -D / 2 - 0.06, -D / 2 + 0.06, skip=())
        for xs in (1, -1): box(cm, xs * W / 2 - 0.06, xs * W / 2 + 0.06, y0, y1, -D / 2 + 0.06, D / 2 - 0.06, skip=('front', 'back'))
    for xs in (1, -1):
        for zs in (1, -1): box(cm, xs * W / 2 - 0.15, xs * W / 2 + 0.15, GFH + 0.175, H, zs * D / 2 - 0.15, zs * D / 2 + 0.15, skip=('bottom', 'top'))
    # 鏤空牆和內牆之間的空隙頂、底（從洞裡斜看不會看到天空、地面）
    for y in (GFH + 0.176, H - 0.001):
        nrm = (0, 1, 0) if y < GFH + 1 else (0, -1, 0)
        face(dk, [(-W / 2, y, D / 2), (W / 2, y, D / 2), (W / 2, y, idp), (-W / 2, y, idp)], nrm, [DU] * 4); face(dk, [(-W / 2, y, -idp), (W / 2, y, -idp), (W / 2, y, -D / 2), (-W / 2, y, -D / 2)], nrm, [DU] * 4)
        face(dk, [(iw, y, -idp), (W / 2, y, -idp), (W / 2, y, idp), (iw, y, idp)], nrm, [DU] * 4); face(dk, [(-W / 2, y, -idp), (-iw, y, -idp), (-iw, y, idp), (-W / 2, y, idp)], nrm, [DU] * 4)
    # 屋頂：寬屋簷的平屋頂（套件 W+2.2 × 0.4）＋深色防水層（比屋簷內縮 0.2 m，從下面看不到）
    box(cm, -W / 2 - 1.1, W / 2 + 1.1, H, H + 0.4, -D / 2 - 1.1, D / 2 + 1.1, skip=())
    face(dk, [(-W / 2 - 0.9, H + 0.401, -D / 2 - 0.9), (W / 2 + 0.9, H + 0.401, -D / 2 - 0.9), (W / 2 + 0.9, H + 0.401, D / 2 + 0.9), (-W / 2 - 0.9, H + 0.401, D / 2 + 0.9)], (0, 1, 0), [DU] * 4)
    # 匾額：入口石材門框上方
    plate = Mesh('PLATE_FACE_PAV', M['board']); sy = (0.25 + 2.8 + GFH - 0.175) / 2; pz = D / 2 - INSET + 0.125
    face(plate, [(-1.75, sy - 0.27, pz), (1.75, sy - 0.27, pz), (1.75, sy + 0.27, pz), (-1.75, sy + 0.27, pz)], (0, 0, 1))

    for k, m in accs.items():
        m.finish(root, uv=(k == 'conc'))
    uv01(plate.finish(root, uv=True, props={'text': '農業陳列館', 'bg': '#e9e5d8', 'color': '#3b3b3b', 'serif': 1, 'fs': 0.66}))
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    build(ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else None)
