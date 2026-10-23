"""店員支線「順手的事」做完以後店裡多的東西（痕跡；AA_404／AA_405，企劃線 cool-heisenberg；LAWWW2-B 2026-10-23）。
每一樣是正式模型裡一個獨立的節點 TRACE_<SQ 編號>_<名字>，不參加合併（各店腳本的 merge_by_material keep 加 TRACE_）。
遊戲：Z3.attachRoomGLB 看到 TRACE_SQxx 的節點，SIDEQ.traceOn(G,'SQxx') 是 true 才顯示（patches/sq_traces_1023.patch）。
  SQ12 Pasta 118：吧檯後面的牆（開放式廚房的後牆）多一張照片：兩個人，後面是窗邊那一桌（sq_trace_photos.py 在店裡拍的）。
  SQ13 韓食小廚：小菜櫃上多一個玻璃罐（泡菜），手寫標籤「她的」。
  SQ14 一盞茶屋：櫃台（水屋）上多一張很舊的貓照片，背景是茶屋的院子。
  SQ19 巷子裡定食：結帳台多一個小籃子，寫著「失物」。
  SQ20 半熟早午餐：櫃台後面的牆多兩張證書，並排。
（SQ16 輪轉單車的紙條在公館街上的腳踏車上：zones3d.js，見 patches/gg_bike_door_1023.patch 的說明）
座標都是遊戲座標（x, y 往上, z），和各店腳本、配置檔一樣；Blender 是 (x, −z, y)。
"""
import math, os
import bpy, bmesh
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); ENV = os.path.dirname(HERE); GEN = os.path.join(ENV, 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
g2b = lambda x, y, z: Vector((x, -z, y))
FACE = {'+z': (0, 0, 1), '-z': (0, 0, -1), '+x': (1, 0, 0), '-x': (-1, 0, 0)}


# ---------- 貼圖（PIL）----------
def _font(sz):
    from PIL import ImageFont
    for f in (FONT, '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc'):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


def tex_label(fn, text, w=256, h=128, bg=(246, 240, 226), fg=(40, 36, 32), sz=72, border=None, tilt=0):
    """手寫標籤、紙條：米白紙＋字（字型沒有手寫體：稍微轉一點、字粗細不勻一點）"""
    from PIL import Image, ImageDraw, ImageFilter
    im = Image.new('RGB', (w, h), bg); d = ImageDraw.Draw(im)
    if border: d.rectangle([3, 3, w - 4, h - 4], outline=border, width=3)
    t = Image.new('L', (w, h), 0); dt = ImageDraw.Draw(t); f = _font(sz)
    bb = dt.textbbox((0, 0), text, font=f); dt.text(((w - bb[2] - bb[0]) / 2, (h - bb[3] - bb[1]) / 2 - bb[1] * 0.2), text, font=f, fill=255)
    if tilt: t = t.rotate(tilt, resample=Image.BICUBIC)
    t = t.filter(ImageFilter.GaussianBlur(0.8)); im.paste(Image.new('RGB', (w, h), fg), (0, 0), t)
    p = os.path.join(GEN, fn); im.save(p); return p


def tex_cert(fn, name_w=0.55, seed=0):
    """證書（烘焙的技術士證；看不清楚的距離，只要讀得出「是一張證書」）：米白底、細框、標題、名字一行、幾行小字、紅色印章"""
    import random
    from PIL import Image, ImageDraw
    r = random.Random(seed); W, Hh = 300, 400
    im = Image.new('RGB', (W, Hh), (247, 243, 232)); d = ImageDraw.Draw(im)
    d.rectangle([10, 10, W - 11, Hh - 11], outline=(170, 140, 80), width=4); d.rectangle([20, 20, W - 21, Hh - 21], outline=(190, 165, 110), width=1)
    f1 = _font(34); bb = d.textbbox((0, 0), '技術士證', font=f1); d.text(((W - bb[2]) / 2, 44), '技術士證', font=f1, fill=(60, 50, 40))
    f2 = _font(18); s = '烘焙食品　丙級'; bb = d.textbbox((0, 0), s, font=f2); d.text(((W - bb[2]) / 2, 96), s, font=f2, fill=(80, 70, 60))
    d.rectangle([W * (1 - name_w) / 2, 150, W * (1 + name_w) / 2, 172], fill=(70, 60, 52))          # 名字（遠看是一行粗字）
    for k in range(6):
        y = 200 + k * 22; x1 = W - 40 - r.randint(0, 60); d.line([40, y, x1, y], fill=(150, 140, 128), width=4)
    d.ellipse([W - 110, Hh - 120, W - 40, Hh - 50], outline=(190, 50, 40), width=6); d.rectangle([W - 92, Hh - 102, W - 58, Hh - 68], fill=(200, 70, 60))
    p = os.path.join(GEN, fn); im.save(p); return p


def tex_old(src, dst):
    """舊照片：褪色、偏黃、四角暗、白邊（SQ14：照片很舊）"""
    from PIL import Image, ImageEnhance, ImageFilter, ImageChops, ImageDraw
    im = Image.open(src).convert('RGB'); im = ImageEnhance.Color(im).enhance(0.55); im = ImageEnhance.Contrast(im).enhance(0.8)
    sep = Image.new('RGB', im.size, (226, 196, 140)); im = Image.blend(im, ImageChops.multiply(im, sep), 0.55)
    im = ImageEnhance.Brightness(im).enhance(1.12); w, h = im.size
    v = Image.new('L', (w, h), 0); dv = ImageDraw.Draw(v); dv.ellipse([-w * 0.25, -h * 0.25, w * 1.25, h * 1.25], fill=255); v = v.filter(ImageFilter.GaussianBlur(w * 0.12))
    im = Image.composite(im, ImageChops.multiply(im, Image.new('RGB', (w, h), (150, 128, 100))), v)
    out = Image.new('RGB', (w + 36, h + 36), (238, 230, 210)); out.paste(im, (18, 18)); out.save(dst); return dst


def tex_white_border(src, dst, pad=14):
    from PIL import Image
    im = Image.open(src).convert('RGB'); w, h = im.size; out = Image.new('RGB', (w + 2 * pad, h + 2 * pad), (246, 246, 242)); out.paste(im, (pad, pad)); out.save(dst); return dst


# ---------- 材質、網格 ----------
_mats = {}
def mat_flat(name, hexcol, rough=0.6, alpha=None, metal=0.0):
    """純色材質：和各店腳本同一套（lib2.flat；透明的玻璃照它的做法匯出成 BLEND）"""
    if name not in _mats:
        import lib2
        _mats[name] = lib2.flat(name, hexcol, rough=rough, metal=metal, alpha=alpha)
    return _mats[name]


def mat_img(name, path, rough=0.7):
    if name in _mats: return _mats[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough; _mats[name] = m; return m


class Part:
    """一個 TRACE 節點：好幾個材質的面，最後成一個物件"""
    def __init__(self, name, wall=None):
        """wall＝掛在哪一面牆（'N'、'E'…）：名字加 _WALL_<面>、帶 dir，遊戲照牆的做法淡出（鏡頭在牆外時不會變成飄在空中的相框）"""
        self.wall = wall; self.name = name + (f'_WALL_{wall}' if wall else ''); self.bm = bmesh.new(); self.uv = self.bm.loops.layers.uv.new('UVMap'); self.mats = []

    def mi(self, m):
        if m not in self.mats: self.mats.append(m)
        return self.mats.index(m)

    def quad(self, m, pts, uv=((0, 0), (1, 0), (1, 1), (0, 1))):
        vs = [self.bm.verts.new(g2b(*p)) for p in pts]; f = self.bm.faces.new(vs); f.material_index = self.mi(m)
        for lp, t in zip(f.loops, uv): lp[self.uv].uv = t
        return f

    def box(self, m, x0, x1, y0, y1, z0, z1):
        P = lambda x, y, z: (x, y, z)
        for pts in (((x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)), ((x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)),
                    ((x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)), ((x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)),
                    ((x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)), ((x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1))):
            self.quad(m, [P(*p) for p in pts])

    def cyl(self, m, cx, cz, y0, y1, r0, r1=None, seg=16, top=True, bottom=False):
        r1 = r0 if r1 is None else r1
        a = [self.bm.verts.new(g2b(cx + r0 * math.cos(t), y0, cz + r0 * math.sin(t))) for t in (2 * math.pi * k / seg for k in range(seg))]
        b = [self.bm.verts.new(g2b(cx + r1 * math.cos(t), y1, cz + r1 * math.sin(t))) for t in (2 * math.pi * k / seg for k in range(seg))]
        for k in range(seg):
            f = self.bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k])); f.material_index = self.mi(m)
            for lp, t in zip(f.loops, ((k / seg, 0), ((k + 1) / seg, 0), ((k + 1) / seg, 1), (k / seg, 1))): lp[self.uv].uv = t
        if top: f = self.bm.faces.new(b[::-1] if False else b); f.material_index = self.mi(m); f.normal_update()
        if bottom: f = self.bm.faces.new(a[::-1]); f.material_index = self.mi(m)

    def finish(self, root):
        me = bpy.data.meshes.new(self.name); bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces); self.bm.to_mesh(me); self.bm.free()
        for m in self.mats: me.materials.append(m)
        ob = bpy.data.objects.new(self.name, me); bpy.context.scene.collection.objects.link(ob); ob.parent = root
        ob['trace'] = self.name.split('_')[1]   # glTF extras：SQ 編號
        if self.wall: ob['dir'] = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}[self.wall]   # 和各店的 WALL_ 一樣（牆的法線朝屋裡）
        return ob


def _basis(face):
    n = Vector(FACE[face]); u = Vector((n.z, 0, -n.x)) if abs(n.y) < 0.9 else Vector((1, 0, 0))   # 站在正面看的右手邊（朝 +z 的畫：右邊是 +x）
    return n, u


def tex_framed(srcs, dst, frame=(35, 35, 35), bpx=18, gap=0):
    """相框做進貼圖（一個材質＝一個網格：掛在牆上的要跟著牆淡出，見 Part(wall=)）：每張圖加 bpx 像素的框，左右並排；回傳 (路徑, [各張的 UV 範圍])"""
    from PIL import Image
    ims = [Image.open(f).convert('RGB') for f in srcs]; H = max(i.size[1] for i in ims) + 2 * bpx; W = sum(i.size[0] + 2 * bpx for i in ims)
    out = Image.new('RGB', (W, H), frame); x = 0; rects = []
    for im in ims:
        w, h = im.size; out.paste(im, (x + bpx, bpx + (H - 2 * bpx - h) // 2)); rects.append((x / W, 0.0, (x + w + 2 * bpx) / W, 1.0)); x += w + 2 * bpx
    out.save(dst); return dst, rects, (bpx / W * 0.5, 0.5)


def picture(p, m, c, w, h, face, rect=(0, 0, 1, 1), side_uv=(0.002, 0.5), depth=0.018, back=None):
    """相框（w×h＝含框的外尺寸；c＝畫面中心；face＝朝向）：正面整張貼圖（rect 那一塊），側面、背面取框的顏色（side_uv）；back＝立在桌上的背撐長度"""
    n, u = _basis(face); cx, cy, cz = c; up = Vector((0, 1, 0)); C = Vector((cx, cy, cz))
    def pt(du, dv, dn): q = C + u * du + up * dv + n * dn; return (q.x, q.y, q.z)
    hw, hh = w / 2, h / 2; d = depth; u0, v0, u1, v1 = rect; S = (side_uv,) * 4
    p.quad(m, [pt(-hw, -hh, d), pt(hw, -hh, d), pt(hw, hh, d), pt(-hw, hh, d)], uv=((u0, v0), (u1, v0), (u1, v1), (u0, v1)))
    p.quad(m, [pt(-hw, -hh, 0), pt(hw, -hh, 0), pt(hw, -hh, d), pt(-hw, -hh, d)], uv=S); p.quad(m, [pt(-hw, hh, d), pt(hw, hh, d), pt(hw, hh, 0), pt(-hw, hh, 0)], uv=S)
    p.quad(m, [pt(-hw, -hh, 0), pt(-hw, -hh, d), pt(-hw, hh, d), pt(-hw, hh, 0)], uv=S); p.quad(m, [pt(hw, -hh, d), pt(hw, -hh, 0), pt(hw, hh, 0), pt(hw, hh, d)], uv=S)
    p.quad(m, [pt(hw, -hh, 0), pt(-hw, -hh, 0), pt(-hw, hh, 0), pt(hw, hh, 0)], uv=S)
    if back:   # 背撐：從框背面中間斜到桌面
        q0 = C + up * (hh * 0.3); q1 = C - up * hh - n * back
        a, b, a1, b1 = q0 - u * 0.015, q0 + u * 0.015, q1 - u * 0.015, q1 + u * 0.015
        p.quad(m, [tuple(a1), tuple(b1), tuple(b), tuple(a)], uv=S); p.quad(m, [tuple(a), tuple(b), tuple(b1), tuple(a1)], uv=S)


# ---------- 五家店 ----------
def sq12_pasta(root, X1, Z0):
    """Pasta 118：開放式廚房的後牆（北牆 z=Z0），備料台上面、煮麵大鍋左邊；照片白邊＋黑框，外尺寸 32×25 cm；跟著北牆淡出"""
    src = tex_white_border(os.path.join(GEN, 'sq12_photo.png'), os.path.join(GEN, 'sq12_photo_print.png'))
    img, rects, suv = tex_framed([src], os.path.join(GEN, 'sq12_photo_framed.png'), frame=(30, 30, 30), bpx=16)
    p = Part('TRACE_SQ12_photo', wall='N')
    picture(p, mat_img('trace_sq12_photo', img, 0.5), (X1 - 1.42, 1.34, Z0 + 0.012), 0.32, 0.25, '+z', rect=rects[0], side_uv=suv)
    return p.finish(root)


def sq13_korea(root, X1):
    """韓食小廚：東牆的小菜櫃（glass_case X1−0.6～X1、z −1.2～0.4；玻璃箱頂 1.50 m）頂上靠北那一端；泡菜玻璃罐＋手寫標籤「她的」朝店裡"""
    lab = tex_label('sq13_label.png', '她的', 256, 128, sz=78, tilt=3)
    p = Part('TRACE_SQ13_jar'); cx, cz, y0 = X1 - 0.3, -0.95, 1.5
    glass = mat_flat('trace_jar_glass', '#dce8e6', 0.08, alpha=0.35); kim = mat_flat('trace_kimchi', '#b8422e', 0.55); lid = mat_flat('trace_jar_lid', '#d8d4cc', 0.35, metal=0.3)
    p.cyl(kim, cx, cz, y0 + 0.005, y0 + 0.13, 0.058, seg=16)                     # 罐子裡的泡菜（到 2/3）
    p.cyl(glass, cx, cz, y0, y0 + 0.17, 0.065, seg=16, bottom=True)             # 玻璃
    p.cyl(lid, cx, cz, y0 + 0.17, y0 + 0.2, 0.055, 0.052, seg=16)               # 蓋子
    lm = mat_img('trace_sq13_label', lab, 0.8); a = math.pi - 0.6     # 標籤朝店裡（−x）偏店門（+z）：客人從那邊看過來
    def at(t, y): return (cx + 0.0665 * math.cos(t), y, cz + 0.0665 * math.sin(t))
    k = 6; pts = [a - 0.55 + 1.1 * i / k for i in range(k + 1)]
    for i in range(k):
        p.quad(lm, [at(pts[i + 1], y0 + 0.05), at(pts[i], y0 + 0.05), at(pts[i], y0 + 0.11), at(pts[i + 1], y0 + 0.11)], uv=(((i + 1) / k, 0), (i / k, 0), (i / k, 1), ((i + 1) / k, 1)))
    return p.finish(root)


def sq14_teahouse(root, mz):
    """一盞茶屋：水屋（mizuya x 3.75、z 1.3，流理台面向店裡 −x）檯面上靠南那一端（沙漏再過去），立著的舊照片（木框，外尺寸 15×12 cm）"""
    raw = os.path.join(GEN, 'sq14_catphoto_raw.png'); old = tex_old(raw, os.path.join(GEN, 'sq14_catphoto_old.png'))
    img, rects, suv = tex_framed([old], os.path.join(GEN, 'sq14_catphoto.png'), frame=(122, 90, 58), bpx=20)
    p = Part('TRACE_SQ14_catphoto'); top = mz.get('top', 0.86)
    picture(p, mat_img('trace_sq14_photo', img, 0.6), (mz['x'] - 0.12, top + 0.06, mz['z'] + 1.35), 0.15, 0.12, '-x', rect=rects[0], side_uv=suv, depth=0.012, back=0.06)
    return p.finish(root)


def sq19_teishoku(root, reg):
    """巷子裡定食：結帳台（register）上面客人那一端，小竹籃＋「失物」紙牌、裡面一把摺傘、一本筆記本、一個筆袋"""
    tag = tex_label('sq19_tag.png', '失物', 256, 128, sz=76, border=(120, 90, 60), tilt=-2)
    p = Part('TRACE_SQ19_basket'); cx, cz, y0 = reg['x'] + 0.12, reg['z'] + 0.25, reg.get('top', 1.0)   # 收銀機在靠裡那一端（z − 0.15），籃子放客人那一端
    rat = mat_flat('trace_basket', '#c49a62', 0.85); rat2 = mat_flat('trace_basket_dk', '#9a7040', 0.85)
    w, d, h = 0.28, 0.19, 0.09; sx, sz = w / 2, d / 2
    def ring(y, k=1.0): return [(cx + sx * k * math.cos(t), y, cz + sz * k * math.sin(t)) for t in (2 * math.pi * i / 16 for i in range(16))]
    for j in range(4):   # 竹籃：上寬下窄的橢圓，四圈深淺交錯（遠看是編的紋路）
        y0j, y1j = y0 + h * j / 4, y0 + h * (j + 1) / 4; A, Bv = ring(y0j, 0.86 + 0.14 * j / 4), ring(y1j, 0.86 + 0.14 * (j + 1) / 4)
        for i in range(16): p.quad(rat if (i + j) % 2 == 0 else rat2, [A[i], A[(i + 1) % 16], Bv[(i + 1) % 16], Bv[i]], uv=((0, 0), (1, 0), (1, 1), (0, 1)))
    bot = ring(y0 + 0.002, 0.86); f = p.bm.faces.new([p.bm.verts.new(g2b(*q)) for q in bot]); f.material_index = p.mi(rat2)
    for i in range(16):   # 收口（一圈粗一點的邊）
        A, Bv = ring(y0 + h, 1.0), ring(y0 + h + 0.012, 1.03); p.quad(rat2, [A[i], A[(i + 1) % 16], Bv[(i + 1) % 16], Bv[i]], uv=((0, 0), (1, 0), (1, 1), (0, 1)))
    for i in range(12):   # 提把：從長邊兩端拱起來
        t0, t1 = math.pi * i / 12, math.pi * (i + 1) / 12; y_ = lambda t: y0 + h + 0.012 + 0.11 * math.sin(t)
        x_ = lambda t: cx - sx * math.cos(t); p.quad(rat2, [(x_(t0), y_(t0), cz - 0.008), (x_(t1), y_(t1), cz - 0.008), (x_(t1), y_(t1), cz + 0.008), (x_(t0), y_(t0), cz + 0.008)], uv=((0, 0), (1, 0), (1, 1), (0, 1)))
    p.box(mat_flat('trace_note', '#3d5a80', 0.7), cx - 0.09, cx + 0.02, y0 + 0.008, y0 + 0.07, cz - 0.06, cz + 0.05)      # 筆記本（斜插，露出上緣）
    p.box(mat_flat('trace_umb', '#2f4a3a', 0.6), cx + 0.03, cx + 0.07, y0 + 0.01, y0 + 0.085, cz - 0.07, cz + 0.07)         # 摺傘（收好的）
    p.box(mat_flat('trace_pencase', '#c9a0a8', 0.7), cx - 0.11, cx - 0.04, y0 + 0.02, y0 + 0.075, cz + 0.02, cz + 0.07)    # 筆袋
    tm = mat_img('trace_sq19_tag', tag, 0.8)                                                                       # 紙牌：插在籃子前緣、朝客人（+z）
    p.quad(tm, [(cx - 0.07, y0 + h - 0.01, cz + d / 2 + 0.006), (cx + 0.07, y0 + h - 0.01, cz + d / 2 + 0.006), (cx + 0.07, y0 + h + 0.06, cz + d / 2 + 0.006), (cx - 0.07, y0 + h + 0.06, cz + d / 2 + 0.006)])
    return p.finish(root)


def sq20_brunch(root, ca, X1):
    """半熟早午餐：結帳櫃台（cashier x 2.6、z −1.1）後面的東牆（x=X1），兩張證書並排（A4 直式＋淺木框，一張貼圖）；跟著東牆淡出"""
    c1 = tex_cert('sq20_cert_a.png', 0.5, 1); c2 = tex_cert('sq20_cert_b.png', 0.38, 2)
    img, rects, suv = tex_framed([c1, c2], os.path.join(GEN, 'sq20_certs.png'), frame=(200, 166, 120), bpx=22)
    p = Part('TRACE_SQ20_certs', wall='E'); m = mat_img('trace_sq20_certs', img, 0.6)
    for k, dz in enumerate((0.2, -0.2)):   # 第一張在左（從店裡看，左邊是 z 小的那一側）
        picture(p, m, (X1 - 0.132, 1.62, ca['z'] - dz), 0.27, 0.35, '-x', rect=rects[k], side_uv=suv)   # 牆 0.12 m 厚、往屋裡長（wz_shops_interior.wall_box）
    return p.finish(root)
