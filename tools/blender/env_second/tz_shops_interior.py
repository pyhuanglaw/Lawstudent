"""汀州路／公館六間店的室內（GG-SHOPS3-ART-1110，X320；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/tz_<店>_interior.glb（＋.json）
使用者 2026-11-10 23:xx「六家的內部參考圖」（docs/art-rebuild/second_ai/ref/gg_shops6_1110/interior/int_<店>.webp，從店門口往內看）；規格 docs/handoff/user_specs/GG_SHOPS3_1110.md 第三節。
配置 src/data/tz_shops_layout.js（遊戲 src/tz_shops3d.js 讀同一份）。座標＝遊戲座標（x 往東、y 往上、z 往南；店面在 +z）。
接法：Z3.attachRoomGLB——外牆 WALL_<N|S|E|W>（extras dir＝朝室內，遊戲淡出）；其他照材質合併。
牆上的照片、菜單照片板是參考圖裁的（--ref <室內參考圖資料夾> 重做貼圖集；沒給就用 textures/gen/tz_<店>_int_atlas.jpg）。
六間：taimi（泰米村食）、xile（洗樂洗衣坊）、yindehao（印得好）、antai（安泰藥局）、xianguo（汀州鮮果）、rongendian（榮恩典文具社）。
  /opt/blenv/bin/python tools/blender/env_second/tz_shops_interior.py -- --shop taimi [--ref <資料夾>] [--out <glb>] [--nosingle]"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from lane118_shops import rot, rbox, clathe   # noqa: E402
import numpy as np   # noqa: E402
from PIL import Image   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
SHOP = arg('--shop', 'taimi'); GEN = os.path.join(HERE, 'textures', 'gen'); REF = arg('--ref')
src = open(os.path.join(L.ROOT, 'src/data/tz_shops_layout.js'), encoding='utf-8').read()
J = json.loads(src[src.index('{', src.index('const TZ_SHOPS_LAYOUT=')):src.rindex('}') + 1])[SHOP]
OUT = os.path.join(L.ROOT, arg('--out', J['glb'])); W, D, H = J['w'], J['d'], J['h']; T = 0.2; PI = math.pi
RR = random.Random(sum(ord(c) for c in SHOP))

# ---------- 參考圖裁的貼圖（四個角＝左上、右上、右下、左下，參考圖 1672×941 的像素）----------
CROPS = {'antai': {'sign': ([(285, 98), (1440, 270), (1437, 418), (272, 298)], 768, 112, '../concept/shop_antai.webp'), 'poster': ([(1488, 160), (1596, 135), (1596, 420), (1488, 405)], 224, 448)},
         'xianguo': {'mural': ([(88, 62), (400, 165), (400, 255), (88, 215)], 640, 224)},
         'yindehao': {'price': ([(237, 5), (527, 95), (527, 325), (237, 300)], 512, 300), 'sample': ([(540, 100), (660, 135), (660, 325), (540, 325)], 256, 256), 'campus': ([(668, 165), (732, 180), (732, 320), (668, 325)], 224, 256)},
         'dongnan': {'sign': ([(388, 243), (1426, 172), (1429, 327), (388, 369)], 960, 150, '../../tingzhou_1110/concept/shop_dongnan_dalian.webp')},
         'liantong': {'sign': ([(468, 248), (1345, 223), (1345, 369), (468, 385)], 992, 160, '../../tingzhou_1110/concept/shop_tingzhou_liantong.webp')},
         'keju': {'menu': ([(1208, 483), (1304, 483), (1304, 702), (1208, 702)], 208, 474, '../../tingzhou_1110/concept/shop_kejuyunnan.webp'), 'sign': ([(461, 255), (1325, 202), (1330, 327), (461, 380)], 704, 128, '../../tingzhou_1110/concept/shop_kejuyunnan.webp')},
         'yuehaochi': {'menu': ([(1183, 430), (1301, 430), (1301, 692), (1183, 692)], 216, 480, '../../tingzhou_1110/concept/shop_yuehaochi.webp'), 'sign': ([(527, 255), (1295, 170), (1304, 337), (527, 395)], 704, 150, '../../tingzhou_1110/concept/shop_yuehaochi.webp')},
         'taimi': {'menu': ([(1308, 148), (1672, 25), (1672, 458), (1308, 422)], 768, 360), 'photo1': ([(165, 197), (322, 243), (322, 405), (165, 418)], 448, 256), 'photo2': ([(405, 222), (458, 232), (458, 385), (405, 390)], 320, 256),
                   # v3（BB_379：相框四幅要四張不同的泰式主題圖）：參考圖右牆的兩張植物版畫（葉子、辣椒）、菜單板上的泰式奶茶、綠咖哩
                   'fr_leaf': ([(1167, 227), (1195, 222), (1195, 335), (1167, 337)], 192, 256), 'fr_chili': ([(1207, 217), (1246, 212), (1246, 330), (1207, 334)], 192, 256),
                   'fr_tea': ([(1548, 272), (1660, 272), (1660, 430), (1548, 430)], 192, 256), 'fr_curry': ([(1527, 96), (1662, 96), (1662, 244), (1527, 244)], 192, 256)}}
def make_atlas():
    out = os.path.join(GEN, f'tz_{SHOP}_int_atlas.jpg'); meta = out[:-4] + '.json'
    if REF:
        _name = {'xianguo': 'tingzhou_xianguo'}.get(SHOP, SHOP); _mp = os.path.join(REF, f'int_{_name}.webp'); im_main = Image.open(_mp).convert('RGB') if os.path.exists(_mp) else None; items = []   # 汀州路五間沒有室內參考圖（只從外觀概念圖裁）
        for k, cv in CROPS[SHOP].items():
            quad, w, h = cv[:3]; im0 = Image.open(os.path.join(REF, cv[3])).convert('RGB') if len(cv) > 3 else im_main   # 第四個＝別的參考圖（相對於 --ref 的資料夾）
            A = []; Bv = []
            for (x, y), (u, v) in zip([(0, 0), (w, 0), (w, h), (0, h)], quad): A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); Bv += [u, v]
            items.append((k, im0.transform((w, h), Image.PERSPECTIVE, np.linalg.solve(np.array(A, float), np.array(Bv, float)), Image.BICUBIC)))
        AW = 1024; x = y = rh = 0   # 先排一次算要多高：放不下 512 就用 1024（泰米的菜單 360＋照片 256＝620 px，原本照片超出圖集底下、UV 變負的，繞回去顯示到菜單；LAWWW2-C 11-13）
        for k, im in items:
            if x + im.width > AW: x = 0; y += rh + 4; rh = 0
            x += im.width + 4; rh = max(rh, im.height)
        AH = 512 if y + rh <= 512 else 1024; at = Image.new('RGB', (AW, AH), (40, 40, 40)); uv = {}; x = y = rh = 0
        for k, im in items:
            if x + im.width > AW: x = 0; y += rh + 4; rh = 0
            at.paste(im, (x, y)); uv[k] = [x / AW, 1 - (y + im.height) / AH, (x + im.width) / AW, 1 - y / AH]; x += im.width + 4; rh = max(rh, im.height)
        os.makedirs(GEN, exist_ok=True); at.save(out, quality=90); json.dump(uv, open(meta, 'w'), indent=1)
    return out, json.load(open(meta))


ATL, AUV = make_atlas() if SHOP in CROPS else (None, {})
B.reset(texres=512)
root = B.group(f'tz_{SHOP}_interior', props={'kind': f'tz_{SHOP}_interior'})
_pm = bpy.data.materials.new(f'tzs_{SHOP}_pics'); _pm.use_nodes = True; _nt = _pm.node_tree; _bs = _nt.nodes['Principled BSDF']; _bs.inputs['Roughness'].default_value = 0.6
if ATL: _tx = _nt.nodes.new('ShaderNodeTexImage'); _tx.image = bpy.data.images.load(ATL); _nt.links.new(_tx.outputs['Color'], _bs.inputs['Base Color'])
M = {
    'floor': L.pbr('tzs_floor_stone', 'granite_tile', tile=1.2 if SHOP == 'taimi' else 0.9, target=J.get('floor', '#8f8b84'), normal=0.25, maps=('diff', 'nor'), rough_value=0.45),
    'wall': L.flat('tzs_wall', J.get('wallColor', '#f4f5f4'), rough=0.9),   # 第 2 版（BB 11-10 23:51：六間共同的問題＝牆面那張有髒污斑塊的灰泥貼圖；使用者的室內圖和規格都是乾淨的牆）：全部改乾淨的平塗
    'ceil': L.flat('tzs_ceiling', '#e9dcc0' if J.get('warm') else '#f4f5f4', rough=0.95),
    'wood': L.pbr('tzs_wood', 'walnut_veneer', tile=0.8, target='#9a6f45', maps=('diff',), res=256, rough_value=0.5),
    'wood_d': L.pbr('tzs_wood_dark', 'dark_wood', tile=0.8, target='#4a3426', maps=('diff',), res=256, rough_value=0.5),
    'steel': L.flat('tzs_steel', '#b9bdc1', rough=0.3, metal=0.4),
    'glass': L.flat('tzs_glass', '#e6eeee', rough=0.05, alpha=0.14),
    'light': L.flat('tzs_lightpanel', '#ffe9c0' if J.get('warm') else '#f8fbff', rough=0.5, emit=B.srgb('#ffd9a0' if J.get('warm') else '#f2f7ff')),
    'pics': _pm,
    'vc': L.vc_material('tzs_vc', rough=0.7),
    'vcm': L.vc_material('tzs_vcm', rough=0.35),
}
MM = {}; SQ = []
# ---------- SHOP-REALISM-1112（D159、D160；LAWWW2-C 2026-11-13）：改用 CC0 素材的店（第一間：泰米村食）----------
#   ambientCG 材質組：cc0_fetch 下載到快取，照 Poly Haven 的檔名（<id>_diff_1k.jpg…）放到快取的 staged 資料夾，借 L.pbr（target＝調到這個平均色、tile＝每幾公尺重複一次）；
#   Poly Haven 掃描模型：ph_obj() 匯入、合成一個網格、減面、縮放，之後當原型複製（同一個網格）；遊戲裡的光影另外烘成光照貼圖（lightbake/bake_tz_shops.sh，不烘進顏色）
#   自製印花（布篷的條紋、布簾的格紋、靠枕）：PIL 畫圖案 × ambientCG 布料的明暗紋路。用到的每一件在 LICENSES.md 登記（CC0_USED 印在最後）
CC0 = SHOP in ('taimi', 'xile', 'yindehao', 'liantong', 'dongnan', 'keju', 'yuehaochi')
CC0_USED = []
if CC0:
    import shutil
    import cc0_fetch   # noqa: E402
    STAGE = os.path.join(cc0_fetch.CACHE, 'staged'); os.makedirs(STAGE, exist_ok=True)
    def _stage(pid, diff, nor=None, rough=None):
        d = os.path.join(STAGE, pid); os.makedirs(d, exist_ok=True)
        for src_, suf in ((diff, 'diff'), (nor, 'nor_gl'), (rough, 'rough')):
            if not src_: continue
            dst = os.path.join(d, f'{pid}_{suf}_1k.jpg')
            if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src_): Image.open(src_).convert('RGB').save(dst, quality=92)
    def acg(name, aid, maps=('diff', 'nor'), res=512, vary=None, **kw):
        """ambientCG 材質組 → L.pbr 材質（res：遊戲裡的貼圖邊長）。
        vary：顏色貼圖明暗起伏壓到「平均亮度的這個比例」（標準差）——Plastic006 的顏色貼圖幾乎全黑（平均 7/255、起伏 ±40%），
          校成白色時起伏被放大成一條條黑色大理石紋（LAWWW2-C 11-13 印得好 v1 試拍）；塑膠用 0.05：看得出細紋、不會髒"""
        f = cc0_fetch.acg_material(aid); _stage(aid, f['color'], f.get('normal'), f.get('rough')); CC0_USED.append(('ambientCG', aid))
        pid = aid
        if vary:
            pid = f'{aid}_v{int(round(vary * 100)):02d}'; src_ = os.path.join(STAGE, aid, f'{aid}_diff_1k.jpg'); d_ = os.path.join(STAGE, pid); os.makedirs(d_, exist_ok=True)
            a_ = np.asarray(Image.open(src_).convert('RGB'), float); lum = a_.mean(-1); m_, sd_ = lum.mean(), max(1e-3, lum.std())
            out = a_.mean((0, 1))[None, None, :] * (1 + vary * (lum - m_) / sd_)[..., None]
            Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(os.path.join(d_, f'{pid}_diff_1k.jpg'), quality=92)
            for suf in ('nor_gl', 'rough'):
                q_ = os.path.join(STAGE, aid, f'{aid}_{suf}_1k.jpg')
                if os.path.exists(q_): Image.open(q_).save(os.path.join(d_, f'{pid}_{suf}_1k.jpg'), quality=92)
        old = L.tex_dir; L.tex_dir = lambda q: STAGE if q == pid else old(q)
        try: return L.pbr(name, pid, maps=maps, res=res, **kw)
        finally: L.tex_dir = old
    def printed(name, pid, draw, weave, size=512, amp=0.44, **kw):
        """自製印花：draw(PIL.ImageDraw, size) 畫圖案，乘上 ambientCG 布料（weave）的明暗紋路"""
        f = cc0_fetch.acg_material(weave); CC0_USED.append(('ambientCG', weave))
        from PIL import ImageDraw, ImageOps
        im = Image.new('RGB', (size, size)); draw(ImageDraw.Draw(im), size)
        g = ImageOps.grayscale(Image.open(f['color']).convert('RGB').resize((size, size))); a = np.asarray(g, float); a = 0.78 + amp * (a - a.mean()) / max(1.0, a.std() * 3)
        out = np.clip(np.asarray(im, float) * a[..., None], 0, 255).astype('uint8'); p = os.path.join(STAGE, pid + '_src.jpg'); Image.fromarray(out).save(p, quality=92)
        _stage(pid, p, f.get('normal'))
        old = L.tex_dir; L.tex_dir = lambda q: STAGE if q == pid else old(q)
        try: return L.pbr(name, pid, maps=('diff', 'nor'), res=size, **kw)
        finally: L.tex_dir = old
    class _AsTex:   # 把「畫成某個顏色的頂點色零件」的呼叫轉成某個材質組網格（顏色參數不用）
        def __init__(self, m_): self.m = m_; self.bm = m_.bm
        def paint(self, *a, **k): pass
        def cbox(self, x0, x1, y0, y1, z0, z1, col=None): self.m.box(x0, x1, y0, y1, z0, z1)
        def crbox(self, x0, x1, y0, y1, z0, z1, col=None, r=0.03): self.m.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=2)
    class _Route:   # vc() 的轉接：cbox／crbox／poly 照顏色（ROUTE 表）分到材質組網格；表上沒有的顏色、ccyl／blob／clathe（直接用 .bm＋paint）照舊頂點色
        def __init__(self, base, route): self.base = base; self.route = route; self.bm = base.bm
        def __getattr__(self, k): return getattr(self.base, k)
        def _m(self, col): k_ = self.route.get((col or '').lower()); return mesh(k_) if k_ else None
        def cbox(self, x0, x1, y0, y1, z0, z1, col):
            m_ = self._m(col); (m_.box(x0, x1, y0, y1, z0, z1) if m_ else self.base.cbox(x0, x1, y0, y1, z0, z1, col))
        def crbox(self, x0, x1, y0, y1, z0, z1, col, r=0.03):
            m_ = self._m(col); (m_.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=2) if m_ else self.base.crbox(x0, x1, y0, y1, z0, z1, col, r=r))
        def poly(self, pts, col):
            m_ = self._m(col); (m_.quad(pts) if m_ else self.base.poly(pts, col))
    PH_PROTO = {}
    def _ph_tex(o, res=512):
        """Poly Haven 材質瘦身：粗糙度／金屬度（arm、rough）的圖拿掉改固定值（單通道的圖匯出 WebP 會失敗、手機也不需要）；顏色、法線縮成 res（有透明的存 PNG）"""
        for ms_ in o.material_slots:
            mt = ms_.material
            if not mt or not mt.use_nodes: continue
            N = mt.node_tree.nodes; bs = N.get('Principled BSDF')
            for n in list(N):
                if n.type != 'TEX_IMAGE' or not n.image: continue
                nm = n.image.name.lower(); to = {l.to_socket.name for l in n.outputs['Color'].links} | {l.to_socket.name for l in n.outputs['Alpha'].links}
                if not ({'Base Color', 'Alpha', 'Color'} & to) or '_arm' in nm or 'rough' in nm or 'metal' in nm:
                    N.remove(n); continue
                src_ = bpy.path.abspath(n.image.filepath)
                if not os.path.exists(src_): continue
                im = Image.open(src_); alpha = im.mode in ('RGBA', 'LA') and 'Alpha' in to
                im = im.convert('RGBA' if alpha else 'RGB')
                if max(im.size) > res: im = im.resize((res, res), Image.LANCZOS)
                dst = os.path.join(STAGE, os.path.splitext(os.path.basename(src_))[0] + f'_{res}' + ('.png' if alpha else '.jpg')); (im.save(dst) if alpha else im.save(dst, quality=90))
                cs = n.image.colorspace_settings.name; n.image = bpy.data.images.load(dst); n.image.colorspace_settings.name = cs
            if bs:
                for k_ in ('Roughness', 'Metallic'):
                    for l in list(bs.inputs[k_].links): mt.node_tree.links.remove(l)
                bs.inputs['Roughness'].default_value = 0.65; bs.inputs['Metallic'].default_value = 0.0
    def ph_obj(aid, height=None, decimate=None, recolor=None, chair=False):
        """Poly Haven 模型 → 一個網格物件（底部中心在原點、Blender 座標），做為原型（之後 ph_put 複製、共用同一個網格）。
        recolor：(深色 hex, 亮色 hex)＝顏色貼圖改成這兩色之間（照原圖明暗），保留木紋、磨損"""
        if aid in PH_PROTO: return PH_PROTO[aid]
        path = cc0_fetch.ph_model(aid); before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); CC0_USED.append(('Poly Haven', aid))
        new = [o for o in bpy.data.objects if o not in before]; ms = [o for o in new if o.type == 'MESH']
        bpy.ops.object.select_all(action='DESELECT')
        for o in ms: mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw; o.select_set(True)
        for o in new:
            if o.type != 'MESH': bpy.data.objects.remove(o)
        bpy.context.view_layer.objects.active = ms[0]
        if len(ms) > 1: bpy.ops.object.join()
        o = bpy.context.view_layer.objects.active; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        _ph_tex(o)
        if decimate:
            md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = decimate; bpy.ops.object.modifier_apply(modifier=md.name)
        vs = [v.co for v in o.data.vertices]; mn = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); mx = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
        k = height / (mx.z - mn.z) if height else 1.0
        o.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))))
        if chair:   # 椅子：靠背轉到 +y（前面＝−y＝遊戲的 +z），量座面高度（朝上的面積最多的高度）
            ht = max(v.co.z for v in o.data.vertices); top = [v.co.y for v in o.data.vertices if v.co.z > ht * 0.8]
            if sum(top) / len(top) < 0: o.data.transform(Matrix.Rotation(math.pi, 4, 'Z'))
            hist = {}
            for pg in o.data.polygons:
                if pg.normal.z > 0.8 and 0.3 * ht < pg.center.z < 0.65 * ht: hist[round(pg.center.z, 2)] = hist.get(round(pg.center.z, 2), 0) + pg.area
            o['seat'] = max(hist, key=hist.get) if hist else 0.46 * ht
            ys = [v.co.y for v in o.data.vertices if abs(v.co.z - o['seat']) < 0.03]; o['seat_y'] = (min(ys), max(ys)) if ys else (-0.2, 0.2)
            xs = [v.co.x for v in o.data.vertices if abs(v.co.z - o['seat']) < 0.03]; o['seat_x'] = (min(xs), max(xs)) if xs else (-0.2, 0.2)
            print('PH chair', aid, 'seat', round(o['seat'], 3), [round(v, 3) for v in o['seat_y']], [round(v, 3) for v in o['seat_x']])
        if recolor:
            for ms_ in o.material_slots:
                b = ms_.material.node_tree.nodes.get('Principled BSDF') if ms_.material else None
                ln = b and b.inputs['Base Color'].links
                if not ln or ln[0].from_node.type != 'TEX_IMAGE': continue
                tn = ln[0].from_node; src_ = bpy.path.abspath(tn.image.filepath)
                g = np.asarray(Image.open(src_).convert('L').resize((512, 512)), float) / 255.0; g = (g - g.min()) / max(1e-3, g.max() - g.min())
                c0, c1 = np.array(B.srgb(recolor[0])) ** (1 / 2.2), np.array(B.srgb(recolor[1])) ** (1 / 2.2)
                out = (c0[None, None, :] + (c1 - c0)[None, None, :] * g[..., None]) * 255; p = os.path.join(STAGE, f'{aid}_recolor.jpg'); Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(p, quality=92)
                tn.image = bpy.data.images.load(p); ms_.material.name = 'tzs_ph_' + aid
        else:
            for ms_ in o.material_slots:
                if ms_.material: ms_.material.name = 'tzs_ph_' + aid + ('' if len(o.material_slots) < 2 else '_' + ms_.material.name[-8:])
        o.name = 'PHPROTO_' + aid; o.hide_render = True; o.hide_set(True); PH_PROTO[aid] = o; return o
    PH_N = {}
    def ph_put(aid, x, y, z, yaw=0.0, s=1.0, share=True, roll=0.0, **kw):
        """原型複製一份放在遊戲座標 (x, y, z)，yaw＝繞垂直軸轉（弧度，遊戲的方向：0＝原型的 −y 朝玩家看的 +z）。
        share＝False：自己一份網格（植物：光照烘焙 bake_room.py 會把共用網格的物件合成一個、改名 …_inst，--nolm 認不到名字，碎葉片就被排進光照貼圖、把整張擠成小點；LAWWW2-C 11-13 泰米第一次烘）"""
        p = ph_obj(aid, **kw); o = bpy.data.objects.new(f'S_ph_{aid}_{PH_N.setdefault(aid, 0)}', p.data if share else p.data.copy()); PH_N[aid] += 1
        bpy.context.scene.collection.objects.link(o); o.parent = root
        R_ = Matrix()
        if roll:   # 繞原型的 y 軸（薄的那一邊＝正面的法線）轉，中心在原型高度的一半：相框橫的改直的
            c_ = max(v.co.z for v in p.data.vertices) / 2; R_ = Matrix.Translation((0, 0, c_)) @ Matrix.Rotation(roll, 4, 'Y') @ Matrix.Translation((0, 0, -c_))
        o.matrix_world = Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(yaw, 4, 'Z') @ R_ @ Matrix.Scale(s, 4); return o
    def _awning(d, s):   # 布篷：酒紅、深紅、土黃的直條，中間一條細的米色小花紋（參考圖）
        cols = [(150, 40, 32), (110, 30, 26), (150, 40, 32), (196, 150, 70), (90, 26, 22), (150, 40, 32), (200, 170, 120), (110, 30, 26)]; n = len(cols); w = s / n
        for i, c in enumerate(cols): d.rectangle([i * w, 0, (i + 1) * w, s], fill=c)
        for i in range(0, n, 3):
            for y in range(0, s, 16): d.polygon([(i * w + w / 2, y), (i * w + w / 2 + 4, y + 8), (i * w + w / 2, y + 16), (i * w + w / 2 - 4, y + 8)], fill=(222, 196, 140))
    def _cushion(d, s):   # 靠枕：泰式織布的菱形、橫條（紅、米、深咖啡）
        d.rectangle([0, 0, s, s], fill=(206, 188, 150)); band = s // 8
        for k in range(8):
            y0 = k * band; c = [(170, 52, 40), (206, 188, 150), (70, 46, 34), (206, 188, 150), (190, 120, 50), (206, 188, 150), (170, 52, 40), (90, 60, 40)][k]
            if k % 2 == 0: d.rectangle([0, y0, s, y0 + band], fill=c)
            else:
                for x in range(0, s, band): d.polygon([(x, y0 + band / 2), (x + band / 2, y0 + 3), (x + band, y0 + band / 2), (x + band / 2, y0 + band - 3)], fill=(150, 44, 36))
    M.update({
        # 牆照舊乾淨的平塗（BB 11-10：使用者的室內圖是乾淨的油漆牆，不要灰泥貼圖的斑塊；tests/tz_shops_unit.js 第 8 項）——質感靠烘焙的光影
        'ceil': acg('tzs_ceiling', 'Plaster001', maps=('diff',), vary=(None if SHOP == 'taimi' else 0.015 if SHOP in ('liantong', 'yuehaochi', 'keju') else 0.04), target='#e9dcc0' if J.get('warm') else '#eef0ef', tile=2.0, rough_value=0.95, res=256),   # 暖色店（泰米）米色、其他（洗樂）白
        'duct': None,   # 天花板下的風管、冷氣（和天花板同一個材質；另外一個網格，不叫 S_ceil：tests/tz_shops_unit.js 第 12 項）
        'steel': acg('tzs_steel', 'Metal009', target='#b9bdc1', tile=1.0, metal=0.4, rough_value=0.35),
        'steel_d': acg('tzs_steel_d', 'Metal009', maps=('diff',), target='#6f7479', tile=1.0, metal=0.4, rough_value=0.4, res=256),   # 洗樂 v3：滾筒內筒底（比外圈暗，看起來在裡面）
        'blackmetal': acg('tzs_blackmetal', 'Metal009', maps=('diff',), target='#2e2c2a', tile=1.0, metal=0.3, rough_value=0.45, res=256),
        'leather': acg('tzs_leather', 'Leather037', target='#6a4530', tile=0.8, rough_value=0.55),
        'leather_d': acg('tzs_leather_d', 'Leather037', target='#4f3222', tile=0.8, rough_value=0.55),
        'wicker': acg('tzs_wicker', 'Wicker010A', target='#c9a060', tile=0.35, rough_value=0.7),
        'plaid': acg('tzs_curtain', 'Fabric054', tile=0.7, rough_value=0.9),
        'cloth_b': acg('tzs_doorcloth', 'Fabric036', maps=('diff',), target='#e6d6b4', tile=0.6, rough_value=0.9, res=256),
        'stripe': printed('tzs_awning', 'tz_taimi_awning', _awning, 'Fabric036', tile=1.0, rough_value=0.85),
        'plastic_w': acg('tzs_plastic_w', 'Plastic006', vary=0.05, target='#eef0ef', tile=0.5, rough_value=0.45),     # 洗樂：販賣機、洗衣籃、燈具、冷氣
        'plastic_b': acg('tzs_plastic_b', 'Plastic006', vary=0.05, target='#a9cfe6', tile=0.5, rough_value=0.4),      # 洗樂：候位椅、藍色洗衣籃
        'plastic_dk': acg('tzs_plastic_dk', 'Plastic006', vary=0.05, maps=('diff',), target='#33373c', tile=0.5, rough_value=0.45, res=256),   # 印得好：影印機的掃描台、面板、螢幕
        'plastic_navy': acg('tzs_plastic_navy', 'Plastic006', vary=0.05, maps=('diff',), target='#2c3c5a', tile=0.5, rough_value=0.45, res=256),
        'plastic_grn': acg('tzs_plastic_grn', 'Plastic006', vary=0.05, maps=('diff',), target='#1f5a3e', tile=0.5, rough_value=0.4, res=256),   # 東南大聯 v2：玻璃上緣、收銀台踢腳的墨綠
        'plastic_blue': acg('tzs_plastic_blue', 'Plastic006', vary=0.05, maps=('diff',), target='#1f3f9a', tile=0.5, rough_value=0.4, res=256),   # 聯通：招牌藍的腰線、櫃台正面、展示櫃底
        'cardboard': acg('tzs_cardboard', 'Cardboard001', tile=0.6, rough_value=0.85),
        'tile_w': acg('tzs_kitchen_tile', 'Tiles036', target='#e9e6de', tile=0.6, rough_value=0.3),   # v2（BB_379 末節①）：廚房後牆白磁磚
        'cushion': printed('tzs_cushion', 'tz_taimi_cushion', _cushion, 'Fabric036', size=256, tile=0.45, rough_value=0.85),
    })
    M['duct'] = M['ceil']
    if SHOP == 'yindehao':   # 影印紙的包裝紙（三色）：自畫（底色＋白色標籤＋細條紋）×ambientCG 紙的紋理
        def _ream(col):
            def dr(d, s_):
                d.rectangle([0, 0, s_, s_], fill=col); d.rectangle([s_ * 0.18, s_ * 0.3, s_ * 0.82, s_ * 0.62], fill=(250, 250, 246))
                d.rectangle([s_ * 0.18, s_ * 0.66, s_ * 0.82, s_ * 0.7], fill=tuple(max(0, c - 70) for c in col)); d.rectangle([0, 0, s_, s_ * 0.06], fill=tuple(max(0, c - 40) for c in col))
            return dr
        def _ream_w(band):
            def dr(d, s_):
                d.rectangle([0, 0, s_, s_], fill=(246, 246, 242)); d.rectangle([0, s_ * 0.34, s_, s_ * 0.56], fill=band); d.rectangle([s_ * 0.08, s_ * 0.4, s_ * 0.5, s_ * 0.5], fill=(250, 250, 248))
                d.rectangle([0, s_ * 0.6, s_, s_ * 0.63], fill=tuple(max(0, c - 60) for c in band))
            return dr
        for k_, band in (('ream_w', (40, 86, 160)), ('ream_w2', (196, 52, 48)), ('ream_w3', (46, 128, 84))):   # v2：白色影印紙（藍、紅、綠三個牌子的色帶）
            M[k_] = printed('tzs_' + k_, 'tz_yin_' + k_, _ream_w(band), 'Paper001', size=256, amp=0.12, tile=0.35, rough_value=0.7)
        M['screen'] = L.flat('tzs_screen', '#2b3a52', rough=0.25, emit=B.srgb('#3a5a8a'))   # 螢幕（微微發光的藍灰；光照烘焙時藏起來）
        for k_, col in (('ream_p', (236, 170, 186)), ('ream_b', (168, 204, 232)), ('ream_y', (238, 222, 150))):
            M[k_] = printed('tzs_' + k_, 'tz_yin_' + k_, _ream(col), 'Paper001', size=256, amp=0.12, tile=0.35, rough_value=0.7)   # 紙的紋理只留一點點（0.44 像髒污）
# 機器上的字牌（BB_255：看不出是什麼機器）：黑體字畫成一張小貼圖（每一塊 256×80），材質 tzs_<店>_labels
LABELS = {'xile': [('coin', '兌幣機', '#1f4f9a', '#ffffff'), ('soap', '洗衣精', '#e8f2fa', '#1f4f9a'), ('coin_w', '兌幣機  10 元', '#ffffff', '#1f4f9a'), ('soap_w', '洗衣精・柔軟精', '#ffffff', '#1f4f9a')],
          'yindehao': [('cut', '裁紙機', '#f2c230', '#1d1f22'), ('bind', '膠裝機', '#f2c230', '#1d1f22'), ('pc', '自助列印電腦', '#2c3c5a', '#ffffff'), ('pc_sub', '隨身碟・雲端列印', '#ffffff', '#2c3c5a')]}.get(SHOP, [])
LQ = []; LUV = {}
if LABELS:
    from PIL import ImageDraw, ImageFont
    _n = len(LABELS); _im = Image.new('RGB', (256, 80 * _n), (255, 255, 255)); _d = ImageDraw.Draw(_im)
    for _i, (_k, _t, _bg, _fg) in enumerate(LABELS):
        _d.rectangle([0, _i * 80, 255, _i * 80 + 79], fill=_bg); _d.rectangle([2, _i * 80 + 2, 253, _i * 80 + 77], outline=_fg, width=2); _px = 56
        while _px > 10:
            _f = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', _px); _b = _d.textbbox((0, 0), _t, font=_f)
            if _b[2] - _b[0] <= 232: break
            _px -= 2
        _d.text((128 - (_b[0] + _b[2]) / 2, _i * 80 + 40 - (_b[1] + _b[3]) / 2), _t, font=_f, fill=_fg); LUV[_k] = (0.0, 1 - (_i + 1) / _n, 1.0, 1 - _i / _n)
    os.makedirs(GEN, exist_ok=True); _lp = os.path.join(GEN, f'tz_{SHOP}_labels.png'); _im.save(_lp)
    _lm = bpy.data.materials.new(f'tzs_{SHOP}_labels'); _lm.use_nodes = True; _lt = _lm.node_tree.nodes.new('ShaderNodeTexImage'); _lt.image = bpy.data.images.load(_lp); _lm.node_tree.links.new(_lt.outputs['Color'], _lm.node_tree.nodes['Principled BSDF'].inputs['Base Color']); _lm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.6; M['labels'] = _lm
def label(key, pts): LQ.append((key, [g2b(*p) for p in pts]))   # 左下、右下、右上、左上（從看的人那一邊）
PRE = ''   # 節點分組（禮貌生財的書房：'STUDY:' → 網格叫 STUDY_<材質>，遊戲照名字整組顯示／隱藏）
def mesh(key, cm=False):
    k = PRE + key
    if k not in MM: MM[k] = (CMesh if cm else Mesh)((PRE[:-1] + '_' if PRE else 'S_') + key, M[key])
    return MM[k]
vc = lambda: mesh('vc', True); vm = lambda: mesh('vcm', True)
def pic(key, pts): SQ.append((key, [g2b(*p) for p in pts]))   # 左下、右下、右上、左上（從看的人那一邊）
_PROF = {} if os.environ.get('TRIS_PROF') else None   # 量面數（TRIS_PROF=1：印出每一行 ccyl 用掉多少三角形）
if _PROF is not None:   # cbox 也量：記到呼叫它的那一行（跳過 _Route／bx 這一層）
    _cb0 = CMesh.cbox
    def _cbp(self, *a_, **k_):
        f_ = sys._getframe(1)
        while f_ and f_.f_code.co_name in ('cbox', 'bx'): f_ = f_.f_back
        _l = 'cb%d' % f_.f_lineno; _PROF[_l] = _PROF.get(_l, 0) + 12; return _cb0(self, *a_, **k_)
    CMesh.cbox = _cbp
    for _nm in ('crbox', 'poly', 'box', 'rbox', 'sphere', 'cyl'):
        if not hasattr(CMesh, _nm): continue
        def _mk(_o, _nm=_nm):
            def _w(self, *a_, **k_):
                n0 = len(self.bm.faces); r_ = _o(self, *a_, **k_); f_ = sys._getframe(1)
                while f_ and f_.f_code.co_name in (_nm, 'crbox', 'cbox', 'bx'): f_ = f_.f_back
                _l = _nm[:2] + str(f_.f_lineno); _PROF[_l] = _PROF.get(_l, 0) + 2 * (len(self.bm.faces) - n0); return r_
            return _w
        setattr(CMesh, _nm, _mk(getattr(CMesh, _nm)))
def ccyl(m, a, b, r, col, seg=10, r2=None, caps=True):
    if _PROF is not None: _l = sys._getframe(1).f_lineno; _PROF[_l] = _PROF.get(_l, 0) + seg * (4 if caps else 2)
    pa, pb = g2b(*a), g2b(*b); d = pb - pa
    res = bmesh.ops.create_cone(m.bm, cap_ends=caps, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
    bmesh.ops.rotate(m.bm, verts=res['verts'], cent=(0, 0, 0), matrix=Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()); bmesh.ops.translate(m.bm, verts=res['verts'], vec=(pa + pb) / 2)
    m.paint({f for v in res['verts'] for f in v.link_faces}, col)
def blob(x, y, z, r, col, sy=1.0):
    bm = vc().bm; res = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=5, radius=r)
    for v in res['verts']: v.co.z *= sy
    bmesh.ops.translate(bm, verts=res['verts'], vec=g2b(x, y, z)); vc().paint({f for v in res['verts'] for f in v.link_faces}, col)
WALLS = {}
def wall(side, dirv):
    if side not in WALLS: WALLS[side] = (Mesh('WALL_' + side, M['wall']), dirv)
    return WALLS[side][0]


# ---------- 殼 ----------
mesh('floor').box(-W / 2, W / 2, -0.1, 0.0, -D / 2, D / 2)
# 天花板（TZS-CEIL-1111，LAWWW／BB 11-11 03:15：禮貌生財玩家走到房間後半，跟隨鏡頭 y 3.21 高過天花板 3.0，看到天花板的「上表面」＝整個畫面一片米色；
#   原本是一塊 10 cm 厚、六個面都有的板子）：只留朝下的那一面（單面，從上面看不到）、節點叫 CEIL_ceil——Z3.attachRoomGLB 的 ceilHide 會在鏡頭高過天花板時把 CEIL_* 整組藏起來；
#   吸頂的燈具也放進 CEIL_*（下面各間用 PRE='CEIL:' 包起來的那幾行），不然天花板藏了、燈具還浮在半空擋住房間
PRE = 'CEIL:'
mesh('ceil').quad([(-W / 2, H, -D / 2), (W / 2, H, -D / 2), (W / 2, H, D / 2), (-W / 2, H, D / 2)])   # 逆時針（從下面看）＝法線朝下
PRE = ''
wall('N', [0, 0, 1]).box(-W / 2, W / 2, 0, H, -D / 2 - T, -D / 2); wall('W', [1, 0, 0]).box(-W / 2 - T, -W / 2, 0, H, -D / 2, D / 2); wall('E', [-1, 0, 0]).box(W / 2, W / 2 + T, 0, H, -D / 2, D / 2)
FR = J['front']; zS = D / 2; ws = wall('S', [0, 0, -1]); dx0, dx1, dh = FR['door']; sill, head = FR['sill'], FR['head']
cuts = sorted([(a, b, sill, head) for a, b in FR['windows']] + [(dx0, dx1, 0.0, dh)]); x = -W / 2
for (a, b, y0, y1) in cuts:
    ws.box(x, a, 0, H, zS, zS + T); ws.box(a, b, y1, H, zS, zS + T)
    if y0 > 0: ws.box(a, b, 0, y0, zS, zS + T)
    x = b
ws.box(x, W / 2, 0, H, zS, zS + T)
FRAME = '#3a2416' if SHOP in ('taimi', 'limao', 'yuehaochi', 'keju') else '#c4c8cb'
# SHOP-INTERIOR-VIEW-1112（BB 11-12：進門後跟隨鏡頭在正面牆外面，牆淡出了，窗框、門框、布簾還留在半空擋住畫面）：正面牆上的零件（窗框、窗台、門框、布簾、玻璃、玻璃上的色帶）
#   放進 WALL_Sfix_*（名字含 WALL_＝遊戲 attachRoomGLB 跟著牆一起淡出；dir、at 照正面牆），不再留在一般的 S_vc
PRE = 'WALL_Sfix:'
for (a, b) in FR['windows']:
    mesh('glass').quad([(a, sill, zS + 0.08), (b, sill, zS + 0.08), (b, head, zS + 0.08), (a, head, zS + 0.08)])
    if CC0:   # 窗框、窗台：木頭店面（泰米）深色木頭材質組；鋁框的店（洗樂）不鏽鋼材質組
        FK = ('wood_d', 'wood') if FRAME != '#c4c8cb' else ('steel', 'steel')
        for xx in (a, (a + b) / 2, b): mesh(FK[0]).box(xx - 0.03, xx + 0.03, sill, head, zS + 0.04, zS + 0.12)
        for yy in (sill, head): mesh(FK[0]).box(a, b, yy - 0.03, yy + 0.03, zS + 0.04, zS + 0.12)
        if sill > 0.3: mesh(FK[1]).rbox(a, b, sill - 0.05, sill, zS - 0.12, zS + 0.02, r=0.01, seg=2)
        continue
    for xx in (a, (a + b) / 2, b): vc().cbox(xx - 0.03, xx + 0.03, sill, head, zS + 0.04, zS + 0.12, FRAME)
    for yy in (sill, head): vc().cbox(a, b, yy - 0.03, yy + 0.03, zS + 0.04, zS + 0.12, FRAME)
    vc().cbox(a, b, sill - 0.05, sill, zS - 0.12, zS + 0.02, '#5a3a22')   # 窗台
if not FR.get('open'):
    if CC0:
        FK0 = 'wood_d' if FRAME != '#c4c8cb' else 'steel'
        for xx in (dx0, dx1): mesh(FK0).box(xx - 0.04, xx + 0.04, 0, dh, zS + 0.02, zS + 0.14)
        mesh(FK0).box(dx0, dx1, dh - 0.04, dh + 0.04, zS + 0.02, zS + 0.14)
    else:
        for xx in (dx0, dx1): vc().cbox(xx - 0.04, xx + 0.04, 0, dh, zS + 0.02, zS + 0.14, FRAME)
        vc().cbox(dx0, dx1, dh - 0.04, dh + 0.04, zS + 0.02, zS + 0.14, FRAME)
for i in range(2 if SHOP == 'taimi' else 0):   # 門上的米色布簾（兩片；泰米村食）
    a = dx0 + 0.04 + i * (dx1 - dx0 - 0.08) / 2
    if CC0: mesh('cloth_b').box(a + 0.01, a + (dx1 - dx0 - 0.08) / 2 - 0.01, dh - 1.05, dh - 0.05, zS + 0.07, zS + 0.085)
    else: vc().cbox(a + 0.01, a + (dx1 - dx0 - 0.08) / 2 - 0.01, dh - 1.05, dh - 0.05, zS + 0.07, zS + 0.085, '#e6d6b4')


# ---------- 家具的小零件 ----------
def chair(x, z, yaw, wood='#3a2a20', pad='#5a3a2a'):
    """深色木椅＋皮坐墊（參考圖）：(x, z) 是坐的位置"""
    Tr = rot(x, z, yaw); sh = 0.46
    if CC0:   # Poly Haven 梯背椅（painted_wooden_chair_02，顏色貼圖改成深色木頭、保留木紋和磨損）＋皮坐墊（ambientCG Leather037）
        o = ph_put('painted_wooden_chair_02', x, 0.0, z, yaw, height=0.92, recolor=('#170e08', '#5e3f29'), chair=True, decimate=0.45); p = PH_PROTO['painted_wooden_chair_02']
        sy0, sy1 = p['seat_y']; sx0, sx1 = p['seat_x']; s0 = p['seat']   # 原型座標（Blender，前面＝−y）→ 本地（右手 lx＝+x，前方 lz＝−y）
        rbox(mesh('leather'), Tr, sx0 + 0.03, sx1 - 0.03, s0, s0 + 0.035, -sy1 + 0.05, -sy0 - 0.02, r=0.012, seg=2); return
    rbox(vc(), Tr, -0.21, 0.21, sh - 0.05, sh, -0.2, 0.2, pad, r=0.015, seg=1)
    rbox(vc(), Tr, -0.21, 0.21, sh - 0.09, sh - 0.05, -0.2, 0.2, wood)
    for lx in (-0.18, 0.18):
        for lz in (-0.17, 0.17): (px, pz) = Tr(lx, lz); ccyl(vc(), (px, 0.0, pz), (px, sh - 0.09, pz), 0.02, wood, seg=6)
    for lx in (-0.18, 0.18): (px, pz) = Tr(lx, -0.2); ccyl(vc(), (px, sh, pz), (px, 0.9, pz), 0.02, wood, seg=6)
    for y in (0.62, 0.74, 0.86): rbox(vc(), Tr, -0.19, 0.19, y - 0.035, y + 0.035, -0.215, -0.185, wood)
def table_set(x, y, z):
    """桌上：不鏽鋼餐具筒、木面紙盒、辣椒罐"""
    if CC0: mesh('steel').cyl((x - 0.12, y, z), (x - 0.12, y + 0.13, z), 0.05, seg=12)
    else: ccyl(vm(), (x - 0.12, y, z), (x - 0.12, y + 0.13, z), 0.05, '#b9bdc1', seg=10)
    for i in range(3): ccyl(vm(), (x - 0.12 + (i - 1) * 0.02, y + 0.1, z), (x - 0.12 + (i - 1) * 0.03, y + 0.2, z + (i - 1) * 0.01), 0.004, '#d8dadc', seg=4)
    (mesh('wood').rbox(x + 0.02, x + 0.2, y, y + 0.09, z - 0.07, z + 0.07, r=0.006, seg=1) if CC0 else vc().cbox(x + 0.02, x + 0.2, y, y + 0.09, z - 0.07, z + 0.07, '#b8905a')); vc().cbox(x + 0.07, x + 0.15, y + 0.09, y + 0.13, z - 0.03, z + 0.03, '#f6f4ee')
    ccyl(vc(), (x - 0.02, y, z + 0.12), (x - 0.02, y + 0.07, z + 0.12), 0.025, '#b8402a', seg=8)
PRE = ''
def pendant(x, z, y=2.25):
    """藤編吊燈：電線、藤編燈罩（鏤空感用深淺兩色的橫條）、裡面的燈泡"""
    ccyl(vc(), (x, y + 0.3, z), (x, H, z), 0.006, '#2b2b2b', seg=4)
    if CC0:   # 藤編燈罩（ambientCG Wicker010A）：車削的鐘形，下緣開口（單面材質會補反面，從下面看得到裡面）
        bm_ = L.lathe([(0.2, 0.0), (0.215, 0.05), (0.2, 0.12), (0.16, 0.22), (0.1, 0.28), (0.04, 0.31), (0.012, 0.32)], seg=20); mesh('wicker').add_bm(bm_, Matrix.Translation(g2b(x, y, z))); bm_.free()
        mesh('light').sphere((x, y + 0.1, z), 0.06, seg=8, rings=5); return
    prof = [(0.05, 0.3), (0.16, 0.22), (0.21, 0.08), (0.2, 0.0)]
    for i, ((r0, y0), (r1, y1)) in enumerate(zip(prof, prof[1:])): ccyl(vc(), (x, y + y1, z), (x, y + y0, z), r1, '#d9b06a' if i % 2 else '#c49a52', seg=14, r2=r0, caps=False)
    mesh('light').sphere((x, y + 0.1, z), 0.06, seg=8, rings=5)
def fern(x, y, z, r=0.3, n=14, hang=False):
    for i in range(n):
        a = RR.uniform(0, 2 * PI); rd = RR.uniform(0.1, r); blob(x + math.cos(a) * rd, y + (RR.uniform(-0.7, 0.05) * r * 2 if hang else RR.uniform(0.0, 0.5) * r), z + math.sin(a) * rd * (0.5 if hang else 1), RR.uniform(0.05, 0.09), RR.choice(('#4f7a3a', '#3f6a34', '#6a9a4a')), sy=0.6)


# ---------- 泰米村食 ----------
if SHOP == 'taimi':
    BQ = J['banquette']; CT = J['counter']; KT = J['kitchen']; PT = J['partition']; DC = J['decor']
    LEATHER, LEATHER_D = '#6a4530', '#4f3222'
    # 長卡座：座墊、靠背、底座；一排靠枕
    if CC0:   # 皮面（ambientCG Leather037）：座墊一段一段（每張桌子一段，接縫看得出來）、靠背、木頭底座；靠枕是織布印花
        mesh('wood_d').box(BQ['x0'], BQ['x1'], 0.0, 0.1, BQ['z0'], BQ['z1'])
        nseg = 5; L_ = (BQ['z1'] - BQ['z0']) / nseg
        for k in range(nseg):
            za, zb = BQ['z0'] + k * L_ + 0.006, BQ['z0'] + (k + 1) * L_ - 0.006
            mesh('leather').rbox(BQ['x0'], BQ['x1'] + 0.02, 0.1, 0.46, za, zb, r=0.035, seg=3); mesh('leather_d').rbox(BQ['x0'], BQ['x0'] + 0.14, 0.46, 1.0, za, zb, r=0.035, seg=3)
        mesh('wood').rbox(BQ['x0'], BQ['x0'] + 0.16, 1.0, 1.06, BQ['z0'], BQ['z1'], r=0.01, seg=2)
        for i, t in enumerate(J['tables'][:5]):
            if i % 2 == 0:
                cu = mesh('cushion'); f0 = set(cu.bm.faces); cu.rbox(BQ['x0'] + 0.14, BQ['x0'] + 0.27, 0.5, 0.86, t['z'] - 0.2, t['z'] + 0.2, r=0.05, seg=3)
                vs_ = {v for q in cu.bm.faces if q not in f0 for v in q.verts}; c_ = g2b(BQ['x0'] + 0.2, 0.68, t['z'])
                for v in vs_:   # 靠枕中間鼓起來、往後靠（不是方塊）
                    dyz = Vector((0, v.co.y - c_.y, v.co.z - c_.z)); v.co.x += 0.035 * max(0.0, 1 - (dyz.length / 0.26) ** 2); v.co.x -= 0.06 * (v.co.z - c_.z) / 0.36
    else:
        vc().cbox(BQ['x0'], BQ['x1'], 0.0, 0.1, BQ['z0'], BQ['z1'], '#3a2a20'); vc().crbox(BQ['x0'], BQ['x1'] + 0.02, 0.1, 0.46, BQ['z0'], BQ['z1'], LEATHER, r=0.03)
        vc().crbox(BQ['x0'], BQ['x0'] + 0.14, 0.46, 1.0, BQ['z0'], BQ['z1'], LEATHER_D, r=0.03); mesh('wood').box(BQ['x0'], BQ['x0'] + 0.16, 1.0, 1.06, BQ['z0'], BQ['z1'])
        for i, t in enumerate(J['tables'][:5]):
            if i % 2 == 0: vc().crbox(BQ['x0'] + 0.14, BQ['x0'] + 0.26, 0.5, 0.86, t['z'] - 0.2, t['z'] + 0.2, ('#c9a878', '#b8503a', '#d9c9a8')[i % 3], r=0.04)
    # 桌子：兩人桌（木桌面＋黑色單柱）、四人桌（木桌面＋四支深色桌腳）
    for t in J['tables']:
        x, z, w_, d_ = t['x'], t['z'], t['w'], t['d']
        mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.71, 0.76, z - d_ / 2, z + d_ / 2, r=0.012, seg=2)
        if t['kind'] == 'two' and CC0: mesh('blackmetal').cyl((x, 0.03, z), (x, 0.71, z), 0.035, seg=10); mesh('blackmetal').cyl((x, 0.0, z), (x, 0.03, z), 0.22, seg=18, r2=0.2); mesh('blackmetal').box(x - 0.2, x + 0.2, 0.68, 0.71, z - 0.02, z + 0.02); mesh('blackmetal').box(x - 0.02, x + 0.02, 0.68, 0.71, z - 0.2, z + 0.2)
        elif t['kind'] == 'two': ccyl(vm(), (x, 0.03, z), (x, 0.71, z), 0.035, '#2b2b2b', seg=8); ccyl(vm(), (x, 0.0, z), (x, 0.03, z), 0.22, '#2b2b2b', seg=14)
        else:
            for sx in (-1, 1):
                for sz in (-1, 1): mesh('wood_d').box(x + sx * (w_ / 2 - 0.07) - 0.03, x + sx * (w_ / 2 - 0.07) + 0.03, 0, 0.71, z + sz * (d_ / 2 - 0.07) - 0.03, z + sz * (d_ / 2 - 0.07) + 0.03)
        table_set(x + (0.0 if t['kind'] == 'two' else 0.3), 0.76, z - (0.15 if t['kind'] == 'two' else 0.0))
    for q in J['seats']:
        if not q.get('bench'): chair(q['x'], q['z'], q['yaw'])
    # 木櫃台：直紋木板、檯面、底下的暖色燈條；檯面上收銀螢幕、蘭花、醬料瓶
    mesh('wood').box(CT['x0'], CT['x1'], 0.08, CT['h'] - 0.05, CT['z0'], CT['z1']); mesh('wood_d').rbox(CT['x0'] - 0.04, CT['x1'] + 0.04, CT['h'] - 0.05, CT['h'], CT['z0'] - 0.03, CT['z1'] + 0.06, r=0.012, seg=2)
    (mesh('wood_d').box(CT['x0'], CT['x1'], 0.0, 0.08, CT['z0'], CT['z1'] - 0.05) if CC0 else vc().cbox(CT['x0'], CT['x1'], 0.0, 0.08, CT['z0'], CT['z1'] - 0.05, '#2b2018')); mesh('light').box(CT['x0'] + 0.05, CT['x1'] - 0.05, 0.085, 0.11, CT['z1'] - 0.03, CT['z1'] + 0.005)
    for i in range(28):
        xx = CT['x0'] + 0.05 + i * (CT['x1'] - CT['x0'] - 0.1) / 27
        if CC0: mesh('wood_d' if i % 5 == 2 else 'wood').box(xx - 0.016, xx + 0.016, 0.12, CT['h'] - 0.06, CT['z1'], CT['z1'] + 0.014)   # 直紋木條（木紋材質，五條裡一條深一點）
        else: vc().cbox(xx - 0.012, xx + 0.012, 0.12, CT['h'] - 0.06, CT['z1'], CT['z1'] + 0.012, '#7a5636')
    cx = J['clerk']['x']; (mesh('blackmetal').rbox(cx + 0.5, cx + 0.95, CT['h'] + 0.1, CT['h'] + 0.42, CT['z0'] + 0.15, CT['z0'] + 0.19, r=0.008, seg=1) if CC0 else vc().cbox(cx + 0.5, cx + 0.95, CT['h'] + 0.1, CT['h'] + 0.42, CT['z0'] + 0.15, CT['z0'] + 0.19, '#1f2023')); ccyl(vc(), (cx + 0.72, CT['h'], CT['z0'] + 0.17), (cx + 0.72, CT['h'] + 0.12, CT['z0'] + 0.17), 0.03, '#1f2023', seg=6)
    clathe(vc(), [(0.0, 0.0), (0.07, 0.0), (0.09, 0.12), (0.0, 0.12)], CT['x0'] + 0.5, CT['h'], (CT['z0'] + CT['z1']) / 2, '#f4f1ea', seg=10)   # 蘭花盆
    # 蘭花（SHOP-INTERIOR-VIEW-1112，使用者 11-12 截圖「一堆紫紅色球」：第 1 版是七顆洋紅色的球浮在盆子上面，沒有莖和葉，看起來像缺材質）：
    #   兩支彎彎的綠色花梗、基部三片厚葉子、花是小小扁扁的淺粉色（中心深一點），沿著花梗排
    ox, oy, oz = CT['x0'] + 0.5, CT['h'] + 0.12, (CT['z0'] + CT['z1']) / 2
    for k in range(3): a_ = k * 2.1 + 0.4; vc().poly([(ox, oy, oz), (ox + math.cos(a_) * 0.2 - math.sin(a_) * 0.045, oy + 0.05, oz + math.sin(a_) * 0.2 + math.cos(a_) * 0.045), (ox + math.cos(a_) * 0.26, oy + 0.02, oz + math.sin(a_) * 0.26), (ox + math.cos(a_) * 0.2 + math.sin(a_) * 0.045, oy + 0.05, oz + math.sin(a_) * 0.2 - math.cos(a_) * 0.045)], '#3f6a34'); vc().poly([(ox, oy, oz), (ox + math.cos(a_) * 0.2 + math.sin(a_) * 0.045, oy + 0.05, oz + math.sin(a_) * 0.2 - math.cos(a_) * 0.045), (ox + math.cos(a_) * 0.26, oy + 0.02, oz + math.sin(a_) * 0.26), (ox + math.cos(a_) * 0.2 - math.sin(a_) * 0.045, oy + 0.05, oz + math.sin(a_) * 0.2 + math.cos(a_) * 0.045)], '#35592c')
    for (sx_, n_) in ((-1, 4), (1, 3)):
        pts = [(ox, oy, oz), (ox + sx_ * 0.02, oy + 0.2, oz), (ox + sx_ * 0.07, oy + 0.34, oz + 0.01), (ox + sx_ * 0.15, oy + 0.4, oz + 0.02)]
        for p0, p1 in zip(pts, pts[1:]): ccyl(vc(), p0, p1, 0.005, '#5a7a3a', seg=4)
        for i in range(n_):
            t = 0.45 + i * 0.55 / n_; fx = ox + sx_ * (0.03 + 0.13 * t * t); fy = oy + 0.22 + 0.19 * t - 0.03 * (t > 0.8); fz = oz + 0.02 + (i % 2) * 0.012
            blob(fx, fy, fz, 0.026, ('#f0c6da', '#e8b4cf')[i % 2], sy=0.55); blob(fx, fy, fz + 0.012, 0.009, '#b8508a')
    for i in range(6): ccyl(vc(), (CT['x1'] - 0.3 - i * 0.12, CT['h'], CT['z1'] - 0.15), (CT['x1'] - 0.3 - i * 0.12, CT['h'] + 0.16 + (i % 2) * 0.04, CT['z1'] - 0.15), 0.03, ('#7a2a1a', '#c9a23a', '#3a5a2a', '#e8e0c8', '#a8401a', '#5a3a22')[i], seg=8)
    # 開放式廚房：後牆不鏽鋼、爐台、層架上的鍋、排煙罩；出餐口上面的紅格紋布棚
    zk0, zk1 = KT['z0'], KT['z1']
    if CC0:   # v2（BB_379 末節①「廚房後牆＋抽油煙機整塊灰平板」）：後牆白磁磚到頂；不鏽鋼工作台有門片、把手、檯面倒角；抽油煙機是斜的罩子＋濾網格柵＋往上的風管；層架上鍋碗
        mesh('tile_w').box(KT['x0'], KT['x1'], 0.9, H, zk0, zk0 + 0.03)
        mesh('steel').box(KT['x0'], KT['x1'], 0.06, 0.86, zk0 + 0.03, zk0 + 0.68); mesh('steel').rbox(KT['x0'], KT['x1'], 0.86, 0.9, zk0 + 0.02, zk0 + 0.72, r=0.008, seg=1)
        mesh('blackmetal').box(KT['x0'], KT['x1'], 0.0, 0.06, zk0 + 0.06, zk0 + 0.64)
        nd = 6
        for i in range(nd + 1): xx = KT['x0'] + i * (KT['x1'] - KT['x0']) / nd; mesh('blackmetal').box(xx - 0.004, xx + 0.004, 0.1, 0.82, zk0 + 0.68, zk0 + 0.69)
        for i in range(nd): xx = KT['x0'] + (i + 0.5) * (KT['x1'] - KT['x0']) / nd; mesh('steel').cyl((xx - 0.12, 0.74, zk0 + 0.71), (xx + 0.12, 0.74, zk0 + 0.71), 0.008, seg=6)
        hx0, hx1 = KT['x0'] + 0.6, KT['x1'] - 0.8
        # 斜罩：下緣 2.0 的框、上緣 2.45 往後收、兩側斜板，上面接風管到天花板
        mesh('steel').rbox(hx0, hx1, 1.98, 2.06, zk0 + 0.05, zk0 + 0.95, r=0.01, seg=1)
        mesh('steel').quad([(hx0, 2.06, zk0 + 0.95), (hx1, 2.06, zk0 + 0.95), (hx1 - 0.25, 2.45, zk0 + 0.4), (hx0 + 0.25, 2.45, zk0 + 0.4)])
        mesh('steel').quad([(hx0, 2.06, zk0 + 0.95), (hx0 + 0.25, 2.45, zk0 + 0.4), (hx0 + 0.25, 2.45, zk0 + 0.05), (hx0, 2.06, zk0 + 0.05)])
        mesh('steel').quad([(hx1, 2.06, zk0 + 0.05), (hx1 - 0.25, 2.45, zk0 + 0.05), (hx1 - 0.25, 2.45, zk0 + 0.4), (hx1, 2.06, zk0 + 0.95)])
        mesh('steel').box(hx0 + 0.25, hx1 - 0.25, 2.45, 2.5, zk0 + 0.05, zk0 + 0.4); mesh('steel').box((hx0 + hx1) / 2 - 0.25, (hx0 + hx1) / 2 + 0.25, 2.5, H, zk0 + 0.05, zk0 + 0.4)
        for i in range(12): xx = hx0 + 0.05 + i * (hx1 - hx0 - 0.1) / 11; mesh('blackmetal').box(xx - 0.008, xx + 0.008, 1.975, 1.982, zk0 + 0.1, zk0 + 0.9)   # 濾網格柵（從下面看）
        for (sy_, kk) in ((1.35, 0), (1.7, 1)):
            mesh('steel').box(KT['x0'] + 0.1, KT['x0'] + 0.55, sy_, sy_ + 0.02, zk0 + 0.03, zk0 + 0.35)
            for j in range(3): mesh('steel').cyl((KT['x0'] + 0.18 + j * 0.13, sy_ + 0.02, zk0 + 0.18), (KT['x0'] + 0.18 + j * 0.13, sy_ + 0.08 + 0.03 * ((j + kk) % 2), zk0 + 0.18), 0.055 - 0.01 * j, seg=12)
    else:
        mesh('steel').box(KT['x0'], KT['x1'], 0.0, 0.9, zk0 + 0.02, zk0 + 0.7); mesh('steel').box(KT['x0'], KT['x1'], 0.9, 2.2, zk0, zk0 + 0.03)
        mesh('steel').box(KT['x0'] + 0.6, KT['x1'] - 0.8, 1.95, 2.45, zk0 + 0.05, zk0 + 0.95)                         # 排煙罩
    for i in range(3):
        if CC0: mesh('blackmetal' if i != 1 else 'steel').cyl((KT['x0'] + 1.0 + i * 0.8, 0.9, zk0 + 0.4), (KT['x0'] + 1.0 + i * 0.8, 1.0 + (i % 2) * 0.08, zk0 + 0.4), 0.16, seg=16, r2=0.15 if i != 1 else None)
        else: ccyl(vm(), (KT['x0'] + 1.0 + i * 0.8, 0.9, zk0 + 0.4), (KT['x0'] + 1.0 + i * 0.8, 1.0 + (i % 2) * 0.08, zk0 + 0.4), 0.16, ('#3a3a3c', '#b9bdc1', '#3a3a3c')[i], seg=12)
    mesh('steel').box(KT['x1'] - 0.7, KT['x1'] - 0.05, 0.0, 1.9, zk0 + 0.05, zk0 + 0.7)                           # 冰箱
    if CC0: mesh('blackmetal').box(KT['x1'] - 0.7, KT['x1'] - 0.05, 1.18, 1.2, zk0 + 0.7, zk0 + 0.71); mesh('steel').cyl((KT['x1'] - 0.62, 0.8, zk0 + 0.73), (KT['x1'] - 0.62, 1.1, zk0 + 0.73), 0.012, seg=6); mesh('steel').cyl((KT['x1'] - 0.62, 1.3, zk0 + 0.73), (KT['x1'] - 0.62, 1.6, zk0 + 0.73), 0.012, seg=6)
    for y in ((1.35, 1.7) if not CC0 else ()): mesh('steel').box(KT['x0'] + 0.1, KT['x0'] + 0.55, y, y + 0.02, zk0 + 0.03, zk0 + 0.35)
    for sx in (KT['x0'], KT['x1'] - 0.08): (mesh('wall').box(sx, sx + 0.08, 0.0, H, zk1 - 0.08, zk1) if CC0 else vc().cbox(sx, sx + 0.08, 0.0, H, zk1 - 0.08, zk1, '#e9dcc0'))            # 廚房開口兩側的柱
    (mesh('wall').box(KT['x0'], KT['x1'], 2.55, H, zk1 - 0.08, zk1) if CC0 else vc().cbox(KT['x0'], KT['x1'], 2.55, H, zk1 - 0.08, zk1, '#e9dcc0'))
    if CC0:   # 布篷：一整片條紋印花（兩面），下緣一排小三角的垂邊
        x0_, x1_ = KT['x0'], KT['x1']; aw = mesh('stripe')
        aw.quad([(x0_, 2.55, zk1 + 0.01), (x1_, 2.55, zk1 + 0.01), (x1_, 2.25, zk1 + 0.5), (x0_, 2.25, zk1 + 0.5)]); aw.quad([(x1_, 2.55, zk1 + 0.01), (x0_, 2.55, zk1 + 0.01), (x0_, 2.25, zk1 + 0.5), (x1_, 2.25, zk1 + 0.5)])
        nv = 24
        for i in range(nv):
            a_, b_ = x0_ + i * (x1_ - x0_) / nv, x0_ + (i + 1) * (x1_ - x0_) / nv; m_ = (a_ + b_) / 2
            aw.quad([(a_, 2.25, zk1 + 0.5), (b_, 2.25, zk1 + 0.5), (m_ + 0.001, 2.16, zk1 + 0.505), (m_ - 0.001, 2.16, zk1 + 0.505)]); aw.quad([(b_, 2.25, zk1 + 0.5), (a_, 2.25, zk1 + 0.5), (m_ - 0.001, 2.16, zk1 + 0.495), (m_ + 0.001, 2.16, zk1 + 0.495)])
    for i in range(18 if not CC0 else 0):   # 紅格紋布棚（一條一條深淺相間）
        a = KT['x0'] + i * (KT['x1'] - KT['x0']) / 18; b = a + (KT['x1'] - KT['x0']) / 18
        vc().poly([(a, 2.55, zk1 + 0.01), (b, 2.55, zk1 + 0.01), (b, 2.25, zk1 + 0.5), (a, 2.25, zk1 + 0.5)], ('#a8382a', '#7a2a22', '#c9a24a')[i % 3]); vc().poly([(b, 2.55, zk1 + 0.01), (a, 2.55, zk1 + 0.01), (a, 2.25, zk1 + 0.5), (b, 2.25, zk1 + 0.5)], '#6a2a22')
    # 左後方的隔牆和格紋布簾的門
    d0, d1 = PT['door']
    if CC0:   # 隔牆：灰泥（和牆一樣）；布簾：ambientCG 紅格紋布（Fabric054），上面的橫桿、布有一點波浪（一折一折）
        for (a_, b_, y0_) in ((PT['x0'], d0, 0.0), (d1, PT['x1'], 0.0), (d0, d1, 2.2)): mesh('wall').box(a_, b_, y0_, H, PT['z'] - 0.1, PT['z'])
        cu = mesh('plaid'); nf = 14
        for i in range(nf):
            a_, b_ = d0 + i * (d1 - d0) / nf, d0 + (i + 1) * (d1 - d0) / nf; za_, zb_ = PT['z'] - 0.05 + 0.025 * (i % 2), PT['z'] - 0.05 + 0.025 * ((i + 1) % 2)
            cu.quad([(a_, 0.05, za_), (b_, 0.05, zb_), (b_, 2.18, zb_), (a_, 2.18, za_)]); cu.quad([(b_, 0.05, zb_ - 0.004), (a_, 0.05, za_ - 0.004), (a_, 2.18, za_ - 0.004), (b_, 2.18, zb_ - 0.004)])
        mesh('blackmetal').cyl((d0, 2.19, PT['z'] - 0.04), (d1, 2.19, PT['z'] - 0.04), 0.012, seg=8)
    else:
        vc().cbox(PT['x0'], d0, 0.0, H, PT['z'] - 0.1, PT['z'], '#f1e4c8'); vc().cbox(d1, PT['x1'], 0.0, H, PT['z'] - 0.1, PT['z'], '#f1e4c8'); vc().cbox(d0, d1, 2.2, H, PT['z'] - 0.1, PT['z'], '#f1e4c8')
        for i in range(10): a = d0 + i * (d1 - d0) / 10; vc().cbox(a, a + (d1 - d0) / 10, 0.05, 2.2, PT['z'] - 0.06 + (i % 2) * 0.02, PT['z'] - 0.04 + (i % 2) * 0.02, ('#b8603a', '#8a3a2a', '#d9b06a')[i % 3])
    # 牆上：右牆菜色照片板、左牆泰國街景照片（參考圖裁的）、藤編圓盤、層板＋蕨類
    MB = DC['menuBoard']; xe = W / 2 - 0.03; vc().cbox(W / 2 - 0.04, W / 2, MB['y0'] - 0.05, MB['y1'] + 0.05, MB['z0'] - 0.05, MB['z1'] + 0.05, '#5a3a22')
    pic('menu', [(xe - 0.012, MB['y0'], MB['z0']), (xe - 0.012, MB['y0'], MB['z1']), (xe - 0.012, MB['y1'], MB['z1']), (xe - 0.012, MB['y1'], MB['z0'])])
    xw = -W / 2 + 0.03
    for ph in DC['photos']: pic(ph['key'], [(xw, ph['y0'], ph['z1']), (xw, ph['y0'], ph['z0']), (xw, ph['y1'], ph['z0']), (xw, ph['y1'], ph['z1'])])
    if CC0:   # 藤編圓盤（Wicker010A）：淺盤狀（中間凹）；層板上 Poly Haven 蕨類（fern_02，縮小）＋藤籃；地上 Poly Haven 盆栽（potted_plant_01，減面）
        for pl in DC['plates']:
            r_ = pl['r']; bm_ = L.lathe([(0.0, 0.012), (r_ * 0.55, 0.0), (r_ * 0.95, 0.03), (r_, 0.045), (r_ * 0.97, 0.05)], seg=28)
            mesh('wicker').add_bm(bm_, Matrix.Translation(g2b(-W / 2 + 0.005, pl['y'], pl['z'])) @ Matrix.Rotation(PI / 2, 4, 'Y')); bm_.free()
        SH = DC['shelf']; mesh('wood').rbox(-W / 2, -W / 2 + 0.28, SH['y'], SH['y'] + 0.04, SH['z0'], SH['z1'], r=0.008, seg=1)
        for zz_ in (SH['z0'] + 0.32, SH['z1'] - 0.3): ph_put('fern_02', -W / 2 + 0.15, SH['y'] + 0.04, zz_, RR.uniform(0, 6.28), s=0.24, share=False, decimate=0.25)
        mesh('wicker').rbox(-W / 2 + 0.05, -W / 2 + 0.26, SH['y'] + 0.04, SH['y'] + 0.2, SH['z1'] - 0.62, SH['z1'] - 0.42, r=0.02, seg=2)
        for k, (px, pz) in enumerate(DC['plants']): ph_put('potted_plant_01', px, 0.0, pz, k * 2.1, height=1.45, share=False, decimate=0.022)
    else:
        for pl in DC['plates']:
            ccyl(vc(), (-W / 2 + 0.01, pl['y'], pl['z']), (-W / 2 + 0.05, pl['y'], pl['z']), pl['r'], '#c49a52', seg=20); ccyl(vc(), (-W / 2 + 0.05, pl['y'], pl['z']), (-W / 2 + 0.06, pl['y'], pl['z']), pl['r'] * 0.6, '#d9b06a', seg=16)
        SH = DC['shelf']; mesh('wood').box(-W / 2, -W / 2 + 0.28, SH['y'], SH['y'] + 0.04, SH['z0'], SH['z1'])
        fern(-W / 2 + 0.16, SH['y'] + 0.1, SH['z0'] + 0.3, hang=True); fern(-W / 2 + 0.16, SH['y'] + 0.12, SH['z1'] - 0.35, r=0.26)
        vc().cbox(-W / 2 + 0.05, -W / 2 + 0.26, SH['y'] + 0.04, SH['y'] + 0.2, SH['z1'] - 0.5, SH['z1'] - 0.2, '#d9c9a8')
        for (px, pz) in DC['plants']:
            clathe(vc(), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.36), (0.0, 0.36)], px, 0.0, pz, '#e8e0d0', seg=12); ccyl(vc(), (px, 0.36, pz), (px, 1.0, pz), 0.02, '#6a5038', seg=5); fern(px, 1.0, pz, r=0.34, n=18)
    for (px, pz) in DC['pendants']: pendant(px, pz)
    if CC0:   # v2（BB_379 末節②「牆上太空：參考圖有垂吊植物、四五幅相框、一圈木腰板」）
        # 木腰板（深色木板＋淺色木扶手條，高 0.95）：右牆（跟著右牆淡出：WALL_Efix）、正面牆窗下（WALL_Sfix）、後面隔牆
        def wains(m_, mr_, x0_, x1_, z0_, z1_, axis):
            if axis == 'x': m_.box(x0_, x1_, 0.0, 0.92, z0_, z1_); mr_.rbox(x0_ - 0.01, x1_, 0.92, 0.98, z0_, z1_, r=0.006, seg=1)
            else: m_.box(x0_, x1_, 0.0, 0.92, z0_, z1_); mr_.rbox(x0_, x1_, 0.92, 0.98, z0_, z1_ + 0.01, r=0.006, seg=1)
        PRE = 'WALL_Efix:'
        wains(mesh('wood_d'), mesh('wood'), W / 2 - 0.025, W / 2, -2.3, D / 2 - 0.05, 'x')
        for k in range(int((D / 2 - 0.05 + 2.3) / 0.35)): zz_ = -2.3 + (k + 1) * 0.35; mesh('wood').box(W / 2 - 0.03, W / 2 - 0.025, 0.08, 0.86, zz_ - 0.008, zz_ + 0.008)   # 直條分隔
        PRE = 'WALL_Sfix:'
        segs = []; xx0 = -W / 2 + 0.6   # 正面牆窗下（避開門、左邊長卡座）
        for (a_, b_) in sorted(FR['windows']):
            lo, hi = max(a_, xx0), b_
            if hi > lo: segs.append((lo, hi))
        for (a_, b_) in segs: wains(mesh('wood_d'), mesh('wood'), a_, b_, D / 2 - 0.025, D / 2, 'z')
        PRE = ''
        for (a_, b_) in ((-2.3 + 0.05, -0.9 - 0.1),): wains(mesh('wood_d'), mesh('wood'), a_, b_, PT['z'], PT['z'] + 0.025, 'z')
        # 相框四幅（Poly Haven fancy_picture_frame_01）：右牆兩幅（菜單板旁邊）、左牆一幅（圓盤和卡座盡頭之間）、隔牆一幅
        # v3：框改直放（roll 90°），框裡貼參考圖裁的四張不同的圖（框是 Poly Haven 的；畫心是參考圖）。pic 的四個角＝從看的人那一邊的左下、右下、右上、左上
        PW_, PH_ = 0.46, 0.62
        for (fx, fy, fz, fyaw, key) in ((W / 2 - 0.03, 1.8, -1.6, -PI / 2, 'fr_leaf'), (W / 2 - 0.03, 1.8, -0.4, -PI / 2, 'fr_chili'), (-W / 2 + 0.03, 1.85, -1.75, PI / 2, 'fr_curry'), (-1.6, 1.7, PT['z'] + 0.03, 0.0, 'fr_tea')):   # 原型的正面＝−y（遊戲 +z）：yaw 0 朝 +z、−π/2 朝 −x、π/2 朝 +x
            ph_put('fancy_picture_frame_01', fx, fy - 0.31, fz, fyaw, height=0.62, roll=PI / 2)
            if fyaw == -PI / 2: xq = W / 2 - 0.058; pic(key, [(xq, fy - PH_ / 2, fz - PW_ / 2), (xq, fy - PH_ / 2, fz + PW_ / 2), (xq, fy + PH_ / 2, fz + PW_ / 2), (xq, fy + PH_ / 2, fz - PW_ / 2)])
            elif fyaw == PI / 2: xq = -W / 2 + 0.058; pic(key, [(xq, fy - PH_ / 2, fz + PW_ / 2), (xq, fy - PH_ / 2, fz - PW_ / 2), (xq, fy + PH_ / 2, fz - PW_ / 2), (xq, fy + PH_ / 2, fz + PW_ / 2)])
            else: zq = fz + 0.028; pic(key, [(fx - PW_ / 2, fy - PH_ / 2, zq), (fx + PW_ / 2, fy - PH_ / 2, zq), (fx + PW_ / 2, fy + PH_ / 2, zq), (fx - PW_ / 2, fy + PH_ / 2, zq)])
        # 垂吊盆栽三盆：藤編吊盆（三條繩子吊在天花板）＋Poly Haven 蕨類
        for (hx, hz) in ((-3.5, 0.1), (-3.5, -1.15), (-3.5, -2.4), (-3.45, 4.55), (3.55, -1.95), (2.95, 4.55)):   # v3（BB P3）：左牆多掛三盆，一整排
            bm_ = L.lathe([(0.0, 0.0), (0.09, 0.01), (0.15, 0.08), (0.16, 0.18), (0.15, 0.19)], seg=16); mesh('wicker').add_bm(bm_, Matrix.Translation(g2b(hx, 2.25, hz))); bm_.free()
            for k in range(3): a_ = k * 2.094; ccyl(vc(), (hx + math.cos(a_) * 0.15, 2.43, hz + math.sin(a_) * 0.15), (hx, H, hz), 0.004, '#3a2a1a', seg=4)
            ph_put('fern_02', hx, 2.38, hz, RR.uniform(0, 6.28), s=0.2, share=False, decimate=0.25)
    # 天花板：裸露的風管、冷氣出風口、軌道燈
    if CC0:
        for xx in (-1.6, 1.2): mesh('duct').cyl((xx, H - 0.14, -D / 2 + 0.3), (xx, H - 0.14, D / 2 - 0.3), 0.07, seg=12)
        mesh('duct').rbox(-0.6, 0.6, H - 0.2, H - 0.02, 0.6, 1.8, r=0.01, seg=1); vc().cbox(-0.5, 0.5, H - 0.215, H - 0.2, 0.7, 1.7, '#bfb6a2')
        mesh('blackmetal').box(-3.2, -3.16, H - 0.06, H - 0.03, -2.5, 4.4)
    else:
        for xx in (-1.6, 1.2): ccyl(vc(), (xx, H - 0.14, -D / 2 + 0.3), (xx, H - 0.14, D / 2 - 0.3), 0.07, '#efe4cc', seg=10)
        vc().cbox(-0.6, 0.6, H - 0.2, H - 0.02, 0.6, 1.8, '#e6dcc6'); vc().cbox(-0.5, 0.5, H - 0.215, H - 0.2, 0.7, 1.7, '#bfb6a2')
        vc().cbox(-3.2, -3.16, H - 0.06, H - 0.03, -2.5, 4.4, '#2b2b2b')
    PRE = 'CEIL:'   # 吸頂的燈具：鏡頭高過天花板時一起藏
    for i in range(6):
        z = -2.0 + i * 1.2
        (mesh('blackmetal').cyl((-3.18, H - 0.06, z), (-3.3, H - 0.24, z), 0.04, seg=10) if CC0 else ccyl(vc(), (-3.18, H - 0.06, z), (-3.3, H - 0.24, z), 0.04, '#2b2b2b', seg=8)); mesh('light').cyl((-3.3, H - 0.245, z), (-3.31, H - 0.255, z), 0.033, seg=8)
    PRE = ''


# ---------- 洗樂洗衣坊 ----------
if SHOP == 'xile':
    WS, DR, MC, CH, FT = J['washers'], J['dryers'], J['machines'], J['chairs'], J['foldTable']
    if CC0:   # 原本畫成金屬色的頂點色零件（vm()：門把、按鈕、椅子鋼樑、水槽、龍頭…）全部改進不鏽鋼材質組（顏色參數不用；_AsTex 在上面 CC0 那一段）
        vm = lambda: _AsTex(mesh('steel'))
    BLUE, STEEL, STEEL_D, DARK = '#bfe0ee', '#c4c8cb', '#9a9fa4', '#2a2f36'
    def drum(xf, y, z, r, face):
        """滾筒的圓門：不鏽鋼圈＋深色玻璃；face＝門朝 +x（1）或 −x（−1）"""
        if CC0:   # v2（BB_379：滾筒門整面黑色圓盤 → 要看得到玻璃和不鏽鋼內筒）：
            #   門圈（不鏽鋼倒角環）＋黑色密封圈；裡面一面不鏽鋼內筒底（Metal009）＋三圈網孔（深色小點）＋三片擋板；最外面往外凸的玻璃碗（半透明，像真的滾筒門）
            mesh('steel').cyl((xf, y, z), (xf + face * 0.035, y, z), r, seg=28, r2=r * 0.97)
            mesh('blackmetal').cyl((xf + face * 0.035, y, z), (xf + face * 0.04, y, z), r * 0.82, seg=28)
            # v3（BB_379 末節 P2：內筒是平的 → 要往裡凹、偏暗；網孔改圓的；玻璃加一點反光）：
            #   機身是實心方塊、門開不了洞，所以用「外圈亮、往中心越來越暗」的三層同心圓做出筒壁往裡收的樣子（筒壁亮的那一圈＝看到斜的筒壁，中間暗＝筒底）
            ri = r * 0.74
            mesh('steel').cyl((xf + face * 0.04, y, z), (xf + face * 0.043, y, z), ri, seg=28)                    # 筒壁（亮）
            mesh('steel_d').cyl((xf + face * 0.043, y, z), (xf + face * 0.0445, y, z), ri * 0.8, seg=28)          # 筒底（暗）
            mesh('blackmetal').cyl((xf + face * 0.0445, y, z), (xf + face * 0.0452, y, z), ri * 0.22, seg=20)     # 正中間最深的那一點
            for ring, nh in ((0.42, 8), (0.62, 12), (0.9, 22)):   # 圓的網孔（筒壁那圈的孔小一點、斜著看比較扁）
                for k in range(nh):
                    a_ = 2 * PI * (k + 0.5 * (ring > 0.5)) / nh; yy = y + math.cos(a_) * ri * ring; zz = z + math.sin(a_) * ri * ring; x0_ = xf + face * (0.0445 if ring < 0.8 else 0.043)
                    ccyl(vc(), (x0_, yy, zz), (x0_ + face * 0.0015, yy, zz), 0.0075 if ring < 0.8 else 0.006, '#30343a', seg=8)
            for k in range(3):   # 擋板（從筒壁往中心的三條凸起）
                a_ = 2 * PI * k / 3 + 0.3; c_, s_ = math.cos(a_), math.sin(a_)
                mesh('steel').cyl((xf + face * 0.046, y + c_ * ri * 0.5, z + s_ * ri * 0.5), (xf + face * 0.046, y + c_ * ri * 0.96, z + s_ * ri * 0.96), 0.018, seg=8)
            # 玻璃上的一道反光（左上一彎淡白色，正反兩面都做：鏡頭從哪邊看都在）
            xg = xf + face * 0.102   # 玻璃碗在這個半徑的表面（0.035＋0.064）再往外 3 mm
            for k in range(7):
                a0_, a1_ = 1.9 + k * 0.11, 1.9 + (k + 1) * 0.11; r0_, r1_ = ri * 0.62, ri * (0.7 - 0.012 * abs(k - 3))
                q_ = [(xg, y + math.sin(a0_) * r0_, z + math.cos(a0_) * r0_), (xg, y + math.sin(a1_) * r0_, z + math.cos(a1_) * r0_), (xg, y + math.sin(a1_) * r1_, z + math.cos(a1_) * r1_), (xg, y + math.sin(a0_) * r1_, z + math.cos(a0_) * r1_)]
                vc().poly(q_, '#eef3f6'); vc().poly(q_[::-1], '#eef3f6')
            bm_ = L.lathe([(ri * 1.02, 0.0), (ri * 0.95, 0.03), (ri * 0.75, 0.06), (ri * 0.4, 0.075), (0.0, 0.08)], seg=24)   # 玻璃碗（往外凸 8 cm）
            mesh('glass').add_bm(bm_, Matrix.Translation(g2b(xf + face * 0.035, y, z)) @ Matrix.Rotation(face * PI / 2, 4, 'Y')); bm_.free()
            mesh('steel').box(*sorted((xf + face * 0.035, xf + face * 0.07)), y - 0.08, y + 0.08, z - r * 0.98, z - r * 0.9); return
        ccyl(vm(), (xf, y, z), (xf + face * 0.04, y, z), r, STEEL, seg=20); ccyl(vc(), (xf + face * 0.04, y, z), (xf + face * 0.05, y, z), r * 0.78, DARK, seg=20)
        ccyl(vm(), (xf + face * 0.05, y, z - r * 0.9), (xf + face * 0.07, y, z - r * 0.9), 0.03, STEEL_D, seg=8)
    # 左牆：一排洗衣機（不鏽鋼機身、上面控制面板、圓門朝東）
    n = WS['n']; pw = (WS['z1'] - WS['z0']) / n
    (mesh('blackmetal').box(WS['x0'], WS['x1'], 0.0, 0.12, WS['z0'], WS['z1']) if CC0 else vc().cbox(WS['x0'], WS['x1'], 0.0, 0.12, WS['z0'], WS['z1'], STEEL_D))
    for i in range(n):
        z0 = WS['z0'] + i * pw; zc = z0 + pw / 2
        (mesh('steel').rbox(WS['x0'], WS['x1'], 0.12, 1.18, z0 + 0.012, z0 + pw - 0.012, r=0.015, seg=2) if CC0 else vm().crbox(WS['x0'], WS['x1'], 0.12, 1.18, z0 + 0.012, z0 + pw - 0.012, STEEL, r=0.012))
        (mesh('blackmetal').box(WS['x1'], WS['x1'] + 0.006, 0.98, 1.14, z0 + 0.06, z0 + pw - 0.06) if CC0 else vc().cbox(WS['x1'], WS['x1'] + 0.006, 0.98, 1.14, z0 + 0.06, z0 + pw - 0.06, '#3a3f46')); vc().cbox(WS['x1'] + 0.006, WS['x1'] + 0.01, 1.02, 1.1, zc - 0.12, zc + 0.02, '#8fd0e8')
        ccyl(vm(), (WS['x1'], 1.06, zc + 0.16), (WS['x1'] + 0.03, 1.06, zc + 0.16), 0.03, STEEL_D, seg=10); drum(WS['x1'], 0.58, zc, 0.24, 1)
    # 右牆：四組上下疊的大烘衣機（圓門朝西）
    n = DR['n']; pw = (DR['z1'] - DR['z0']) / n
    for i in range(n):
        z0 = DR['z0'] + i * pw; zc = z0 + pw / 2
        (mesh('steel').rbox(DR['x0'], DR['x1'], 0.08, 2.12, z0 + 0.012, z0 + pw - 0.012, r=0.015, seg=2) if CC0 else vm().crbox(DR['x0'], DR['x1'], 0.08, 2.12, z0 + 0.012, z0 + pw - 0.012, STEEL, r=0.012))
        for yc in (0.6, 1.62): drum(DR['x0'], yc, zc, 0.36, -1)
        (mesh('blackmetal').box(DR['x0'] - 0.006, DR['x0'], 1.02, 1.2, z0 + 0.1, z0 + pw - 0.1) if CC0 else vc().cbox(DR['x0'] - 0.006, DR['x0'], 1.02, 1.2, z0 + 0.1, z0 + pw - 0.1, '#3a3f46')); vc().cbox(DR['x0'] - 0.01, DR['x0'] - 0.006, 1.06, 1.16, zc - 0.25, zc - 0.05, '#8fd0e8')
    (mesh('blackmetal').box(DR['x0'], DR['x1'], 0.0, 0.08, DR['z0'], DR['z1']) if CC0 else vc().cbox(DR['x0'], DR['x1'], 0.0, 0.08, DR['z0'], DR['z1'], STEEL_D))
    # 兌幣機、洗衣精販賣機
    # 第 2 版（BB_255：門邊那台看不出是兌幣機還是洗衣精販賣機——兩樣都要有、上面有字）：兩台分開、各自的樣子和字牌
    zm = (MC['z0'] + MC['z1']) / 2; xw = -W / 2 + 0.012
    cx1 = MC['x0'] + 0.3; cz0, cz1 = MC['z0'], zm - 0.04                                                   # 兌幣機：落地的不鏽鋼櫃、藍色字牌、紙鈔口、退幣口、下面的取幣槽
    (mesh('steel').rbox(MC['x0'], cx1, 0.0, 1.75, cz0, cz1, r=0.015, seg=2) if CC0 else vm().crbox(MC['x0'], cx1, 0.0, 1.75, cz0, cz1, STEEL, r=0.012)); vc().cbox(cx1, cx1 + 0.006, 1.5, 1.72, cz0 + 0.02, cz1 - 0.02, '#1f4f9a'); label('coin', [(cx1 + 0.008, 1.53, cz1 - 0.03), (cx1 + 0.008, 1.53, cz0 + 0.03), (cx1 + 0.008, 1.69, cz0 + 0.03), (cx1 + 0.008, 1.69, cz1 - 0.03)])
    vc().cbox(cx1, cx1 + 0.008, 1.22, 1.4, cz0 + 0.06, cz1 - 0.06, '#1d1f22'); vc().cbox(cx1 + 0.008, cx1 + 0.012, 1.3, 1.32, cz0 + 0.1, cz1 - 0.1, '#8fd0e8')                         # 螢幕、紙鈔口
    vc().cbox(cx1, cx1 + 0.02, 1.02, 1.1, cz0 + 0.1, cz1 - 0.1, '#2a2f36'); ccyl(vm(), (cx1, 0.9, (cz0 + cz1) / 2), (cx1 + 0.02, 0.9, (cz0 + cz1) / 2), 0.03, '#d8dadc', seg=10)         # 投幣口、退幣鈕
    vc().cbox(cx1, cx1 + 0.05, 0.55, 0.72, cz0 + 0.06, cz1 - 0.06, '#1d1f22'); vc().cbox(cx1 + 0.03, cx1 + 0.06, 0.55, 0.6, cz0 + 0.06, cz1 - 0.06, STEEL_D)                           # 取幣槽
    label('coin_w', [(xw, 1.95, cz1 + 0.02), (xw, 1.95, cz0 - 0.02), (xw, 2.08, cz0 - 0.02), (xw, 2.08, cz1 + 0.02)])
    vz0, vz1 = zm + 0.02, MC['z1']                                                                          # 洗衣精販賣機：白色、玻璃窗裡三排瓶子、上面淺藍字牌、下面取物口
    (mesh('plastic_w').rbox(MC['x0'], MC['x1'], 0.0, 1.9, vz0, vz1, r=0.02, seg=2) if CC0 else vc().crbox(MC['x0'], MC['x1'], 0.0, 1.9, vz0, vz1, '#f4f6f6', r=0.012)); mesh('glass').quad([(MC['x1'] + 0.004, 0.95, vz1 - 0.04), (MC['x1'] + 0.004, 0.95, vz0 + 0.04), (MC['x1'] + 0.004, 1.62, vz0 + 0.04), (MC['x1'] + 0.004, 1.62, vz1 - 0.04)])
    vc().cbox(MC['x1'] - 0.14, MC['x1'] + 0.002, 0.95, 1.62, vz0 + 0.04, vz1 - 0.04, '#dfe6ea')
    for j in range(3):
        vc().cbox(MC['x1'] - 0.13, MC['x1'], 0.95 + j * 0.22, 0.965 + j * 0.22, vz0 + 0.04, vz1 - 0.04, '#b9bdc1')
        for i in range(3): ccyl(vc(), (MC['x1'] - 0.06, 0.965 + j * 0.22, vz0 + 0.09 + i * 0.085), (MC['x1'] - 0.06, 1.11 + j * 0.22, vz0 + 0.09 + i * 0.085), 0.028, ('#e8a8c8', '#5aa8e0', '#f4d23a')[(i + j) % 3], seg=8); ccyl(vc(), (MC['x1'] - 0.06, 1.11 + j * 0.22, vz0 + 0.09 + i * 0.085), (MC['x1'] - 0.06, 1.14 + j * 0.22, vz0 + 0.09 + i * 0.085), 0.014, '#f4f4f0', seg=6)
    label('soap', [(MC['x1'] + 0.006, 1.68, vz1 - 0.03), (MC['x1'] + 0.006, 1.68, vz0 + 0.03), (MC['x1'] + 0.006, 1.84, vz0 + 0.03), (MC['x1'] + 0.006, 1.84, vz1 - 0.03)])
    vc().cbox(MC['x1'], MC['x1'] + 0.012, 0.3, 0.5, vz0 + 0.06, vz1 - 0.06, '#2a2f36'); vc().cbox(MC['x1'], MC['x1'] + 0.01, 0.62, 0.86, vz1 - 0.12, vz1 - 0.04, '#b9bdc1')            # 取物口、投幣口
    label('soap_w', [(xw, 1.95, vz1 + 0.02), (xw, 1.95, vz0 - 0.02), (xw, 2.08, vz0 - 0.02), (xw, 2.08, vz1 + 0.02)])
    # 三連座淺藍塑膠椅（鋼樑、兩支腳）
    zc0 = (CH['z0'] + CH['z1']) / 2; xs_ = CH['x0'] + 0.3
    ccyl(vm(), (xs_, 0.4, CH['z0'] + 0.1), (xs_, 0.4, CH['z1'] - 0.1), 0.025, STEEL_D, seg=8)
    for zz in (CH['z0'] + 0.25, CH['z1'] - 0.25): ccyl(vm(), (xs_, 0.0, zz), (xs_, 0.4, zz), 0.025, STEEL_D, seg=8); vm().cbox(xs_ - 0.2, xs_ + 0.2, 0.0, 0.02, zz - 0.03, zz + 0.03, STEEL_D)
    for q in J['seats']:
        if CC0:   # 淺藍塑膠座殼：座面前緣往下彎、靠背往後仰（不是兩塊板子）
            sp = mesh('plastic_b'); f0 = set(sp.bm.faces); sp.rbox(xs_ - 0.2, xs_ + 0.22, 0.42, 0.46, q['z'] - 0.2, q['z'] + 0.2, r=0.02, seg=3); sp.rbox(xs_ - 0.24, xs_ - 0.19, 0.46, 0.88, q['z'] - 0.21, q['z'] + 0.21, r=0.025, seg=3)
            for v in {v for f_ in sp.bm.faces if f_ not in f0 for v in f_.verts}:
                gy = v.co.z
                if gy > 0.47: v.co.x -= 0.12 * (gy - 0.47)        # 靠背往後仰
                elif v.co.x > xs_ + 0.12: v.co.z -= 0.25 * (v.co.x - xs_ - 0.12)   # 座面前緣往下彎
        else: vc().crbox(xs_ - 0.2, xs_ + 0.22, 0.42, 0.46, q['z'] - 0.2, q['z'] + 0.2, '#a9cfe6', r=0.02); vc().crbox(xs_ - 0.24, xs_ - 0.19, 0.46, 0.86, q['z'] - 0.2, q['z'] + 0.2, '#a9cfe6', r=0.02)
    # 牆：淺天藍腰帶、使用說明海報（四格圖示）、層板上的黃金葛
    vc().cbox(-W / 2, -W / 2 + 0.008, 2.05, 2.3, -D / 2, 1.9, BLUE); vc().cbox(W / 2 - 0.008, W / 2, 0.0, 1.1, -D / 2, DR['z0'], BLUE); vc().cbox(1.9, W / 2, 0.0, 1.1, -D / 2, -D / 2 + 0.008, BLUE)
    vc().cbox(-W / 2, -W / 2 + 0.012, 1.95, 2.95, 2.0, 3.9, '#e9f4fa'); vc().cbox(-W / 2 + 0.012, -W / 2 + 0.016, 2.82, 2.92, 2.05, 3.85, '#7fc0e0')
    for i in range(4):
        zz = 2.45 + (i % 2) * 0.95; yy = 2.48 - (i // 2) * 0.42; vc().cbox(-W / 2 + 0.012, -W / 2 + 0.018, yy - 0.14, yy + 0.14, zz - 0.3, zz - 0.02, '#cfe6f2'); ccyl(vc(), (-W / 2 + 0.018, yy, zz - 0.16), (-W / 2 + 0.022, yy, zz - 0.16), 0.08, '#5aa7d0', seg=14)
        for k in range(3): vc().cbox(-W / 2 + 0.012, -W / 2 + 0.018, yy + 0.06 - k * 0.07, yy + 0.085 - k * 0.07, zz + 0.02, zz + 0.38, '#9ab8c8')
    for (zz, yy) in ((1.2, 2.5), (-0.4, 2.42), (-1.2, 2.42)):
        if CC0:   # 層板（木頭材質）＋白瓷盆＋Poly Haven 蕨類（往下垂一點）
            mesh('wood').rbox(-W / 2, -W / 2 + 0.2, yy, yy + 0.03, zz - 0.3, zz + 0.3, r=0.006, seg=1); clathe(vc(), [(0.0, 0.0), (0.07, 0.0), (0.09, 0.12), (0.0, 0.12)], -W / 2 + 0.11, yy + 0.03, zz, '#f4f1ea', seg=12)
            ph_put('fern_02', -W / 2 + 0.12, yy + 0.12, zz, RR.uniform(0, 6.28), s=0.19, share=False, decimate=0.25); continue
        vc().cbox(-W / 2, -W / 2 + 0.2, yy, yy + 0.03, zz - 0.3, zz + 0.3, '#e8dcc0'); clathe(vc(), [(0.0, 0.0), (0.07, 0.0), (0.09, 0.12), (0.0, 0.12)], -W / 2 + 0.11, yy + 0.03, zz, '#f4f1ea', seg=10); fern(-W / 2 + 0.11, yy + 0.16, zz, r=0.2, n=10, hang=True)
    # 後方：木折衣桌和洗衣籃、置物架、門、水槽
    x, z, w_, d_ = FT['x'], FT['z'], FT['w'], FT['d']
    mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.84, 0.89, z - d_ / 2, z + d_ / 2, r=0.012, seg=2)
    for sx in (-1, 1):
        for sz in (-1, 1): mesh('wood').box(x + sx * (w_ / 2 - 0.07) - 0.03, x + sx * (w_ / 2 - 0.07) + 0.03, 0, 0.84, z + sz * (d_ / 2 - 0.07) - 0.03, z + sz * (d_ / 2 - 0.07) + 0.03)
    def basket(bx, by, bz, col):
        if CC0:   # 塑膠洗衣籃（白或淺藍）：倒角的底、鏤空的側板（直條）、上緣一圈
            m_ = mesh('plastic_b' if col == '#8fb8d8' else 'plastic_w'); m_.rbox(bx - 0.26, bx + 0.26, by, by + 0.03, bz - 0.18, bz + 0.18, r=0.01, seg=1)
            for k in range(9): xx = bx - 0.26 + k * 0.52 / 8; m_.box(xx - 0.012, xx + 0.012, by, by + 0.3, bz - 0.19, bz - 0.17); m_.box(xx - 0.012, xx + 0.012, by, by + 0.3, bz + 0.17, bz + 0.19)
            for zz in (bz - 0.18, bz + 0.18): m_.rbox(bx - 0.27, bx + 0.27, by + 0.27, by + 0.32, zz - 0.014, zz + 0.014, r=0.006, seg=1)
            for xx in (bx - 0.26, bx + 0.26): m_.box(xx - 0.012, xx + 0.012, by, by + 0.31, bz - 0.18, bz + 0.18)
            return
        vc().cbox(bx - 0.26, bx + 0.26, by, by + 0.03, bz - 0.18, bz + 0.18, col)
        for k in range(7): xx = bx - 0.26 + k * 0.52 / 6; vc().cbox(xx - 0.012, xx + 0.012, by, by + 0.3, bz - 0.19, bz - 0.17, col); vc().cbox(xx - 0.012, xx + 0.012, by, by + 0.3, bz + 0.17, bz + 0.19, col)
        for zz in (bz - 0.18, bz + 0.18): vc().cbox(bx - 0.27, bx + 0.27, by + 0.27, by + 0.31, zz - 0.012, zz + 0.012, col)
        for xx in (bx - 0.26, bx + 0.26): vc().cbox(xx - 0.012, xx + 0.012, by, by + 0.31, bz - 0.18, bz + 0.18, col)
    for i, col in enumerate(('#f4f4f0', '#8fb8d8', '#f4f4f0')): basket(x - 0.6 + i * 0.6, 0.0, z + 0.05, col)
    for xx in (0.7, 1.9): (mesh('steel').cyl((xx, 0.0, -D / 2 + 0.25), (xx, 1.5, -D / 2 + 0.25), 0.015, seg=8) if CC0 else ccyl(vm(), (xx, 0.0, -D / 2 + 0.25), (xx, 1.5, -D / 2 + 0.25), 0.015, STEEL, seg=6))
    for j, y in enumerate((0.45, 0.95, 1.45)): (mesh('steel').box(0.68, 1.92, y, y + 0.02, -D / 2 + 0.05, -D / 2 + 0.45) if CC0 else vm().cbox(0.68, 1.92, y, y + 0.02, -D / 2 + 0.05, -D / 2 + 0.45, STEEL)); basket(1.3, y + 0.02, -D / 2 + 0.25, ('#f4f4f0', '#f4f4f0', '#8fb8d8')[j])
    vc().cbox(-0.95, -0.05, 0.0, 2.05, -D / 2, -D / 2 + 0.03, '#eceeee'); vc().cbox(-1.0, 0.0, 2.05, 2.1, -D / 2, -D / 2 + 0.04, '#d6d9da'); ccyl(vm(), (-0.18, 1.0, -D / 2 + 0.03), (-0.18, 1.0, -D / 2 + 0.09), 0.03, STEEL_D, seg=8)
    vc().cbox(2.2, W / 2, 0.0, 0.85, -4.3, -3.1, '#f4f4f0'); vm().cbox(2.3, W / 2 - 0.06, 0.8, 0.86, -4.2, -3.2, STEEL); ccyl(vm(), (2.85, 0.86, -3.7), (2.85, 1.1, -3.7), 0.015, STEEL_D, seg=6)
    # 天花板：日光燈六支、冷氣、壁扇、監視器
    for xx in (-1.4, 1.4):
        PRE = 'CEIL:'   # 吸頂的燈具：鏡頭高過天花板時一起藏
        for zz in (-2.6, 0.0, 2.6): (mesh('plastic_w').rbox(xx - 0.7, xx + 0.7, H - 0.07, H - 0.02, zz - 0.09, zz + 0.09, r=0.01, seg=1) if CC0 else vc().cbox(xx - 0.7, xx + 0.7, H - 0.07, H - 0.02, zz - 0.09, zz + 0.09, '#eceeee')); mesh('light').box(xx - 0.62, xx + 0.62, H - 0.095, H - 0.07, zz - 0.035, zz + 0.035)
        PRE = ''
    (mesh('plastic_w').rbox(W / 2 - 0.24, W / 2, 2.35, 2.65, -2.6, -1.75, r=0.03, seg=2) if CC0 else vc().crbox(W / 2 - 0.24, W / 2, 2.35, 2.65, -2.6, -1.75, '#f4f4f0', r=0.02)); ccyl(vc(), (0.0, H - 0.1, 1.2), (0.0, H, 1.2), 0.06, '#2a2f36', seg=10)
    ccyl(vc(), (W / 2 - 0.02, 2.5, -3.6), (W / 2 - 0.25, 2.45, -3.6), 0.02, '#eceeee', seg=6); ccyl(vc(), (W / 2 - 0.25, 2.45, -3.6), (W / 2 - 0.3, 2.45, -3.6), 0.2, '#eceeee', seg=16)


# ---------- 印得好 ----------
if SHOP == 'yindehao':
    CP, PL, CT, SV, DC = J['copiers'], J['plotter'], J['counter'], J['shelves'], J['decor']
    WHITE, GREY, DARK, NAVY, STEEL = '#eceeee', '#b9bcbf', '#2f3338', '#2c3c5a', '#c4c8cb'
    if CC0:   # SHOP-REALISM-1112（LAWWW2-C 11-13）：原本的頂點色方塊照顏色分到材質組（白塑膠、深色塑膠、藏青、不鏽鋼、紙箱、三色包裝紙、米色布簾）；vm() 一律不鏽鋼
        _W = 'plastic_w'; _D = 'plastic_dk'; _S = 'steel'
        ROUTE = {c: _W for c in ('#eceeee', '#f4f4f0', '#f4f1e8', '#e8eaea', '#dfe1e2', '#e2e4e4', '#f4f2ea', '#eeeadf', '#d9d2bc', '#e8eee8', '#f4f6f6')}
        ROUTE.update({c: _D for c in ('#2f3338', '#1d1f22', '#2a2d31', '#3a3f46', '#1f2023', '#2a2f36')})
        ROUTE.update({c: _S for c in ('#b9bcbf', '#d8dadc', '#c4c8cb', '#b9bdc1', '#6f757b', '#e6e8ea')})
        ROUTE.update({'#2c3c5a': 'plastic_navy', '#c9a878': 'cardboard', '#c9c4b8': 'cloth_b', '#b8b2a4': 'cloth_b',
                      '#f4b8c8': 'ream_p', '#d8c8f0': 'ream_p', '#b8d8f0': 'ream_b', '#a8d8d0': 'ream_b', '#f4e6a0': 'ream_y', '#f0c8a0': 'ream_y', '#c8e6b8': 'ream_y'})
        _vc0 = vc; vc = lambda: _Route(_vc0(), ROUTE); vm = lambda: _AsTex(mesh('steel'))
    def copier(z0, z1, front=WHITE):
        """落地型影印機（門朝東）：下面三層紙匣、機身、上面深色掃描台和送稿器、斜的觸控面板"""
        x0, x1 = CP['x0'], CP['x1']; zc = (z0 + z1) / 2
        vc().crbox(x0, x1, 0.08, 0.62, z0 + 0.03, z1 - 0.03, front, r=0.012)
        for k in range(3): vc().cbox(x1, x1 + 0.006, 0.12 + k * 0.17, 0.26 + k * 0.17, z0 + 0.06, z1 - 0.06, '#dfe1e2'); vc().cbox(x1 + 0.006, x1 + 0.012, 0.2 + k * 0.17, 0.22 + k * 0.17, zc - 0.1, zc + 0.1, GREY)
        vc().crbox(x0, x1 + 0.03, 0.62, 0.98, z0 + 0.02, z1 - 0.02, WHITE, r=0.015); vc().cbox(x0 + 0.03, x1 - 0.05, 0.98, 1.06, z0 + 0.05, z1 - 0.05, DARK); vc().crbox(x0 + 0.05, x1 - 0.15, 1.06, 1.16, z0 + 0.1, z1 - 0.1, WHITE, r=0.01)
        vc().poly([(x1 + 0.02, 0.98, zc - 0.14), (x1 + 0.02, 0.98, zc + 0.14), (x1 - 0.06, 1.12, zc + 0.14), (x1 - 0.06, 1.12, zc - 0.14)][::-1], DARK); vc().cbox(x1 - 0.02, x1 + 0.06, 0.72, 0.76, z0 + 0.1, z1 - 0.1, '#f4f4f0')   # 出紙盤上的紙
        for zz in (z0 + 0.1, z1 - 0.1): ccyl(vc(), (x1 - 0.1, 0.04, zz), (x1 - 0.06, 0.04, zz), 0.04, DARK, seg=8)
        if CC0:   # v2（BB_379 印得好 P2）：中間那層紙匣是藍的、深灰上蓋、送稿器旁邊支架上的觸控螢幕
            mesh('plastic_navy').box(x1, x1 + 0.008, 0.29, 0.43, z0 + 0.06, z1 - 0.06)
            mesh('plastic_dk').rbox(x0 + 0.05, x1 - 0.15, 1.16, 1.19, z0 + 0.1, z1 - 0.1, r=0.008, seg=1)
            zs = z0 + 0.14; mesh('plastic_dk').box(x1 - 0.06, x1 - 0.03, 0.98, 1.13, zs - 0.015, zs + 0.015)
            T_ = rot(x1 + 0.02, zs, PI / 2); rbox(mesh('plastic_dk'), T_, -0.12, 0.12, 1.12, 1.29, -0.012, 0.012, r=0.008, seg=1); rbox(mesh('screen'), T_, -0.105, 0.105, 1.135, 1.275, 0.012, 0.014, r=0.002, seg=1)
    n = len(CP['list']); pw = (CP['z1'] - CP['z0']) / n
    for i, kd in enumerate(CP['list'][::-1]):   # 配置由門口往裡寫，z 由大到小
        z0 = CP['z0'] + i * pw; z1 = z0 + pw; zc = (z0 + z1) / 2
        if kd.startswith('copier'): copier(z0, z1, NAVY if kd == 'copier_blue' else WHITE)
        elif kd == 'cutter':   # 裁紙機：鐵桌＋米色機台＋壓桿
            mesh('steel').box(CP['x0'], CP['x1'], 0.72, 0.76, z0 + 0.04, z1 - 0.04)
            for sx in (CP['x0'] + 0.05, CP['x1'] - 0.05):
                for zz in (z0 + 0.08, z1 - 0.08): ccyl(vm(), (sx, 0.0, zz), (sx, 0.72, zz), 0.02, STEEL, seg=6)
            vc().crbox(CP['x0'] + 0.08, CP['x1'] - 0.06, 0.76, 0.98, z0 + 0.12, z1 - 0.12, '#d9d2bc', r=0.01); ccyl(vm(), (CP['x0'] + 0.2, 0.98, zc), (CP['x1'] + 0.05, 1.3, zc + 0.2), 0.015, DARK, seg=6)
            vc().cbox(CP['x0'] + 0.12, CP['x1'] - 0.1, 0.98, 1.0, z0 + 0.16, z1 - 0.16, '#f4f4f0')
            ccyl(vc(), (CP['x1'] + 0.05, 1.3, zc + 0.2), (CP['x1'] + 0.05, 1.3, zc + 0.3), 0.03, '#c9302a', seg=8); vc().cbox(CP['x0'] + 0.1, CP['x0'] + 0.14, 0.98, 1.1, z0 + 0.14, z1 - 0.14, '#f2c230')   # 紅色握把、黃色安全擋板（第 2 版：看得出是裁紙機）
            for k in range(6): vc().cbox(CP['x0'] + 0.16 + k * 0.08, CP['x0'] + 0.165 + k * 0.08, 0.981, 0.983, z0 + 0.14, z1 - 0.14, '#8a8f98')                                                  # 檯面的刻度線
            label('cut', [(CP['x1'] + 0.008, 0.48, zc + 0.3), (CP['x1'] + 0.008, 0.48, zc - 0.3), (CP['x1'] + 0.008, 0.67, zc - 0.3), (CP['x1'] + 0.008, 0.67, zc + 0.3)])
        else:   # 膠裝機：鐵桌＋深色機台
            mesh('steel').box(CP['x0'], CP['x1'], 0.72, 0.76, z0 + 0.04, z1 - 0.04)
            for sx in (CP['x0'] + 0.05, CP['x1'] - 0.05):
                for zz in (z0 + 0.08, z1 - 0.08): ccyl(vm(), (sx, 0.0, zz), (sx, 0.72, zz), 0.02, STEEL, seg=6)
            vc().crbox(CP['x0'] + 0.1, CP['x1'] - 0.08, 0.76, 1.05, z0 + 0.14, z1 - 0.14, '#3a3f46', r=0.01)
            for k in range(8): vc().cbox(CP['x1'] - 0.12, CP['x1'] - 0.08, 0.86, 1.0, z0 + 0.18 + k * 0.07, z0 + 0.21 + k * 0.07, ('#b8262b', '#2b4f8c', '#f4f4f0', '#c9a227')[k % 4])
            vc().cbox(CP['x0'] + 0.05, CP['x1'] - 0.08, 0.05, 0.42, z0 + 0.1, z1 - 0.1, '#c9a878')   # 桌下的紙箱
            vc().cbox(CP['x0'] + 0.14, CP['x1'] - 0.12, 1.05, 1.12, z0 + 0.2, z1 - 0.2, '#2a2d31'); vc().cbox(CP['x1'] - 0.1, CP['x1'] - 0.02, 0.8, 0.86, zc - 0.12, zc + 0.12, '#f4f4f0')        # 夾書的槽、出來的一本
            label('bind', [(CP['x1'] + 0.008, 0.48, zc + 0.3), (CP['x1'] + 0.008, 0.48, zc - 0.3), (CP['x1'] + 0.008, 0.67, zc - 0.3), (CP['x1'] + 0.008, 0.67, zc + 0.3)])
    # 最裡面的大圖輸出機
    vc().crbox(PL['x0'], PL['x1'], 0.55, 1.05, PL['z0'], PL['z1'], WHITE, r=0.02); vc().cbox(PL['x0'] + 0.05, PL['x1'] - 0.05, 0.0, 0.55, PL['z0'] + 0.08, PL['z1'] - 0.08, GREY); vc().cbox(PL['x0'] + 0.1, PL['x1'] - 0.1, 0.9, 0.96, PL['z1'], PL['z1'] + 0.012, DARK)
    for i in range(4): ccyl(vc(), (PL['x1'] + 0.25 + i * 0.16, 0.0, PL['z0'] + 0.3), (PL['x1'] + 0.25 + i * 0.16, 1.2, PL['z0'] + 0.25), 0.06, ('#f4f4f0', '#e8e0c8', '#2f3338', '#f4f4f0')[i], seg=10)   # 立著的大圖紙捲
    # 第 2 版（BB_255：沒看到給客人用的電腦工作站）：後牆前一張自助列印的電腦桌（兩台螢幕、鍵盤、滑鼠、讀卡機、兩張圓凳）、牆上的字牌
    PCD = J.get('pc')
    if PCD:
        px, pz, pw_, pd = PCD['x'], PCD['z'], PCD['w'], PCD['d']; zb = -D / 2
        mesh('wood').rbox(px - pw_ / 2, px + pw_ / 2, 0.72, 0.76, pz - pd / 2, pz + pd / 2, r=0.01, seg=2)
        for sx in (-1, 1): vc().cbox(px + sx * (pw_ / 2 - 0.04) - 0.02, px + sx * (pw_ / 2 - 0.04) + 0.02, 0.0, 0.72, pz - pd / 2 + 0.04, pz + pd / 2 - 0.04, '#d8dadc')
        for sx in (-0.33, 0.33):
            cx = px + sx; vc().crbox(cx - 0.27, cx + 0.27, 0.9, 1.24, pz - 0.2, pz - 0.17, '#1d1f22', r=0.008); vc().cbox(cx - 0.25, cx + 0.25, 0.92, 1.22, pz - 0.17, pz - 0.166, '#8fc4e8' if sx < 0 else '#e8eef4')
            vc().cbox(cx - 0.03, cx + 0.03, 0.76, 0.92, pz - 0.2, pz - 0.18, '#2a2d31'); vc().cbox(cx - 0.1, cx + 0.1, 0.76, 0.775, pz - 0.26, pz - 0.12, '#2a2d31')
            vc().cbox(cx - 0.2, cx + 0.2, 0.76, 0.78, pz + 0.0, pz + 0.14, '#e8eaea'); vc().crbox(cx + 0.24, cx + 0.3, 0.76, 0.79, pz + 0.03, pz + 0.13, '#e8eaea', r=0.01)
        vc().cbox(px - 0.06, px + 0.06, 0.76, 0.8, pz + 0.16, pz + 0.24, '#2a2d31')                              # 讀卡機
        for sx in (-0.33, 0.33): ccyl(vc(), (px + sx, 0.42, pz + 0.62), (px + sx, 0.46, pz + 0.62), 0.16, '#2c3c5a', seg=14); ccyl(vm(), (px + sx, 0.0, pz + 0.62), (px + sx, 0.42, pz + 0.62), 0.025, '#b9bdc1', seg=8); ccyl(vm(), (px + sx, 0.0, pz + 0.62), (px + sx, 0.02, pz + 0.62), 0.14, '#b9bdc1', seg=12)
        lx = px - 0.5   # 字牌往左移：右邊是後牆的布簾
        label('pc', [(lx - 0.5, 1.55, zb + 0.012), (lx + 0.5, 1.55, zb + 0.012), (lx + 0.5, 1.86, zb + 0.012), (lx - 0.5, 1.86, zb + 0.012)]); label('pc_sub', [(lx - 0.4, 1.38, zb + 0.012), (lx + 0.4, 1.38, zb + 0.012), (lx + 0.4, 1.53, zb + 0.012), (lx - 0.4, 1.53, zb + 0.012)])
    PS = J.get('paperStack')   # 客用電腦桌和長櫃台北端之間的角落（LAWWW 11-11 trapFix：這一塊導航擋起來）：一疊疊影印紙箱＋垃圾桶，看得出為什麼過不去
    if PS:
        bx0, bx1, bz0, bz1 = PS['x0'], PS['x1'], PS['z0'], PS['z1']; bw = min(0.46, bx1 - bx0 - 0.04); bd = 0.3; nrow = max(1, int((bz1 - bz0 - 0.34) / (bd + 0.02)))
        for r_ in range(nrow):
            z0_ = bz0 + 0.02 + r_ * (bd + 0.02); x0_ = bx0 + 0.02 + (r_ % 2) * 0.03
            for k in range(3 - (r_ % 2)):
                y0_ = k * 0.26; vc().cbox(x0_, x0_ + bw, y0_, y0_ + 0.25, z0_, z0_ + bd, ('#f4f2ea', '#eeeadf')[(k + r_) % 2])
                vc().cbox(x0_ + 0.05, x0_ + bw - 0.05, y0_ + 0.07, y0_ + 0.18, z0_ + bd, z0_ + bd + 0.003, ('#2f5a9a', '#c0392b', '#2f8a5a')[(k + r_) % 3]); vc().cbox(x0_ - 0.003, x0_, y0_ + 0.07, y0_ + 0.18, z0_ + 0.05, z0_ + bd - 0.05, ('#2f5a9a', '#c0392b', '#2f8a5a')[(k + r_) % 3])   # 紙箱的色標（朝南、朝西各一張）
                vc().cbox(x0_ + bw / 2 - 0.025, x0_ + bw / 2 + 0.025, y0_ + 0.25, y0_ + 0.252, z0_, z0_ + bd, '#c9a878')                                                                              # 封箱膠帶
        tx, tz = (bx0 + bx1) / 2, bz1 - 0.17                                                                                                                                                         # 垃圾桶（灰、套著半透明袋的白邊）
        ccyl(vc(), (tx, 0.0, tz), (tx, 0.42, tz), 0.12, '#6f757b', seg=12, r2=0.15); ccyl(vc(), (tx, 0.42, tz), (tx, 0.45, tz), 0.158, '#e6e8ea', seg=12)
        for k in range(3): blob(tx - 0.04 + k * 0.04, 0.43, tz - 0.03 + (k % 2) * 0.05, 0.05, ('#f4f2ea', '#e8e4d8', '#dfe6ee')[k], sy=0.7)
    # 長櫃台：白色抽屜櫃、白檯面＋木邊；南端圓角接東牆；檯面上電腦、標籤機、樣本架、一疊疊講義、盆栽
    x0, x1, z0, z1, h = CT['x0'], CT['x1'], CT['z0'], CT['z1'], CT['h']
    vc().cbox(x0 + 0.04, x1, 0.06, h - 0.05, z0, z1, WHITE); vc().crbox(x0 - 0.03, x1 + 0.02, h - 0.05, h, z0 - 0.02, z1 + 0.25, '#f4f1e8', r=0.015); mesh('wood').box(x0 - 0.04, x0 - 0.02, h - 0.05, h - 0.005, z0, z1 + 0.25)
    vc().cbox(x0 + 0.04, W / 2 - 0.45, 0.06, h - 0.05, z1, z1 + 0.25, WHITE); vc().crbox(x1, W / 2 - 0.45, h - 0.05, h, z1 - 0.05, z1 + 0.25, '#f4f1e8', r=0.015)
    for i in range(8): zz = z0 + 0.1 + i * (z1 - z0 - 0.2) / 8; vc().cbox(x0 + 0.03, x0 + 0.04, 0.1, h - 0.08, zz + 0.02, zz + (z1 - z0 - 0.2) / 8 - 0.02, '#e2e4e4'); vc().cbox(x0 + 0.02, x0 + 0.03, 0.55, 0.57, zz + 0.25, zz + 0.5, GREY)
    cz = J['clerk']['z']
    if CC0:   # v2（BB_379 印得好 ②：螢幕是一片板、印表機是深色長方塊、講義等大）：
        #   螢幕＝圓角外框＋發光的畫面＋頸＋底座（面向店員 +x）；鍵盤有一排排按鍵；小印表機＝機身＋淺灰上蓋＋出紙匣＋一張紙；講義＝一疊疊螺旋裝訂本（本數、高低、方向都不一樣）；筆筒、Poly Haven 釘書機
        mesh('plastic_dk').rbox(x1 - 0.32, x1 - 0.1, h, h + 0.015, cz - 0.11, cz + 0.11, r=0.01, seg=1); mesh('plastic_dk').box(x1 - 0.2, x1 - 0.17, h + 0.015, h + 0.2, cz - 0.03, cz + 0.03)
        mesh('plastic_dk').rbox(x1 - 0.2, x1 - 0.165, h + 0.14, h + 0.5, cz - 0.3, cz + 0.3, r=0.012, seg=2); mesh('screen').box(x1 - 0.166, x1 - 0.163, h + 0.16, h + 0.48, cz - 0.28, cz + 0.28)
        vc().cbox(x1 - 0.1635, x1 - 0.1625, h + 0.36, h + 0.45, cz - 0.26, cz - 0.02, '#dfe6ee'); vc().cbox(x1 - 0.1635, x1 - 0.1625, h + 0.2, h + 0.33, cz + 0.02, cz + 0.26, '#c8d4e2')   # 畫面上的視窗（訂單、預覽）
        kx0, kx1 = x1 - 0.44, x1 - 0.28; mesh('plastic_dk').rbox(kx0, kx1, h, h + 0.02, cz - 0.22, cz + 0.22, r=0.006, seg=1)
        for r_ in range(4):
            for c_ in range(14): xx = kx0 + 0.02 + r_ * 0.034; zz = cz - 0.2 + c_ * 0.0285; vc().cbox(xx, xx + 0.026, h + 0.02, h + 0.026, zz, zz + 0.023, '#3a3f46')
        ccyl(vc(), (kx0 + 0.02, h, cz + 0.33), (kx0 + 0.02, h + 0.018, cz + 0.33), 0.03, '#2a2d31', seg=10)   # 滑鼠
        pz = cz + 0.97; mesh('plastic_dk').rbox(x0 + 0.12, x0 + 0.48, h, h + 0.17, pz - 0.2, pz + 0.2, r=0.02, seg=2); mesh('plastic_w').rbox(x0 + 0.14, x0 + 0.46, h + 0.17, h + 0.2, pz - 0.18, pz + 0.18, r=0.01, seg=1)   # 小印表機：機身＋上蓋
        mesh('plastic_dk').box(x0 + 0.06, x0 + 0.12, h + 0.06, h + 0.075, pz - 0.15, pz + 0.15); vc().cbox(x0 + 0.04, x0 + 0.12, h + 0.075, h + 0.078, pz - 0.105, pz + 0.105, '#f6f6f2')   # 出紙匣＋剛印好的一張
        vc().cbox(x0 + 0.47, x0 + 0.475, h + 0.12, h + 0.15, pz + 0.08, pz + 0.16, '#5ab06a')   # 電源燈
        RRY = __import__('random').Random(7)
        def booklet_stack(xc, zc, n, rotq):
            yy = h
            for b_ in range(n):
                t_ = RRY.uniform(0.008, 0.018); jx, jz = RRY.uniform(-0.012, 0.012), RRY.uniform(-0.012, 0.012); hw, hd = (0.15, 0.105) if rotq else (0.105, 0.15)
                vc().cbox(xc - hw + jx, xc + hw + jx, yy, yy + t_, zc - hd + jz, zc + hd + jz, '#f4f4f0')
                cov = RRY.choice(('#e8eef4', '#2b4f8c', '#c4302a', '#f4f4f0', '#2f3338'))
                vc().cbox(xc - hw + jx, xc + hw + jx, yy + t_, yy + t_ + 0.0015, zc - hd + jz, zc + hd + jz, cov)
                if rotq: vc().cbox(xc - hw + jx - 0.006, xc - hw + jx + 0.004, yy, yy + t_ + 0.002, zc - hd + jz + 0.01, zc + hd + jz - 0.01, '#1f2023')   # 螺旋裝訂的黑線圈
                else: vc().cbox(xc - hw + jx + 0.01, xc + hw + jx - 0.01, yy, yy + t_ + 0.002, zc - hd + jz - 0.006, zc - hd + jz + 0.004, '#1f2023')
                yy += t_ + 0.0015
        for (zz, n, rq) in ((z0 + 0.62, 9, True), (z0 + 1.1, 4, False), (z0 + 1.55, 12, True), (z0 + 2.05, 6, False), (z0 + 2.5, 3, True)): booklet_stack(x0 + 0.27, zz, n, rq)
        mesh('steel').cyl((x0 + 0.28, h, z1 - 1.25), (x0 + 0.28, h + 0.1, z1 - 1.25), 0.035, seg=12)   # 筆筒＋幾支筆
        for k in range(6): a_ = k * 1.05; ccyl(vc(), (x0 + 0.28 + math.cos(a_) * 0.015, h + 0.02, z1 - 1.25 + math.sin(a_) * 0.015), (x0 + 0.28 + math.cos(a_) * 0.03, h + 0.16 + (k % 3) * 0.015, z1 - 1.25 + math.sin(a_) * 0.03), 0.004, ('#2b4f8c', '#c4302a', '#1f2023', '#2f8a5a')[k % 4], seg=4)
        ph_put('vintage_stapler', x0 + 0.3, h, z1 - 1.45, 1.2, height=0.06, decimate=0.2)
    else:
        vc().cbox(x1 - 0.2, x1 - 0.16, h + 0.15, h + 0.55, cz - 0.32, cz + 0.32, '#1f2023'); ccyl(vc(), (x1 - 0.18, h, cz), (x1 - 0.18, h + 0.16, cz), 0.03, '#1f2023', seg=6); vc().cbox(x0 + 0.12, x0 + 0.3, h, h + 0.025, cz - 0.24, cz + 0.2, '#1f2023')
        vc().crbox(x0 + 0.15, x0 + 0.45, h, h + 0.22, cz + 0.8, cz + 1.15, '#2a2d31', r=0.015)                                  # 標籤機
        for i in range(5): zz = z0 + 0.5 + i * 0.5; vc().cbox(x0 + 0.1, x0 + 0.42, h, h + 0.05 + (i % 3) * 0.03, zz, zz + 0.3, '#f4f4f0'); vc().cbox(x0 + 0.1, x0 + 0.42, h + 0.05 + (i % 3) * 0.03, h + 0.056 + (i % 3) * 0.03, zz, zz + 0.3, ('#d8dce8', '#e8d8d8', '#f4f4f0')[i % 3])
    if CC0:   # v2：裝訂樣本＝壓克力 L 架上斜立的幾本 Poly Haven 資料夾（大小、角度不一樣）
        zb = z1 - 0.62; mesh('glass').box(x0 + 0.1, x0 + 0.52, h, h + 0.008, zb - 0.32, zb + 0.32); mesh('glass').box(x0 + 0.1, x0 + 0.52, h, h + 0.22, zb - 0.33, zb - 0.32)
        for i, (dz, cov) in enumerate(((-0.24, '#2b4f8c'), (-0.12, '#f4f4f0'), (0.0, '#c4302a'), (0.12, '#2f3338'), (0.24, '#e8d8a8'))):   # 斜靠在背板上的螺旋線圈筆記本（封面顏色不同、上緣一排黑色線圈）
            w_, hh_ = 0.105, 0.29
            pts = [(x0 + 0.31 - w_, h + 0.01, zb + dz), (x0 + 0.31 + w_, h + 0.01, zb + dz), (x0 + 0.31 + w_, h + 0.01 + hh_ * 0.95, zb + dz - hh_ * 0.31), (x0 + 0.31 - w_, h + 0.01 + hh_ * 0.95, zb + dz - hh_ * 0.31)]
            vc().poly(pts, cov); vc().poly(pts[::-1], '#f4f4f0')
            for k in range(9): xx = x0 + 0.31 - w_ + 0.015 + k * (2 * w_ - 0.03) / 8; ccyl(vc(), (xx, h + 0.01 + hh_ * 0.93, zb + dz - hh_ * 0.3 - 0.006), (xx, h + 0.01 + hh_ * 0.93, zb + dz - hh_ * 0.3 + 0.006), 0.007, '#1f2023', seg=6)
    for i in range(5 if not CC0 else 0):   # 裝訂樣本架：斜立的封面
        zz = z1 - 0.9 + i * 0.12; vc().poly([(x0 + 0.12, h, zz), (x0 + 0.5, h, zz), (x0 + 0.5, h + 0.42, zz - 0.14), (x0 + 0.12, h + 0.42, zz - 0.14)][::-1], ('#1f2a48', '#7a2a2a', '#d9c9a8', '#2f3338', '#f4f1e8')[i]); vc().poly([(x0 + 0.12, h, zz), (x0 + 0.5, h, zz), (x0 + 0.5, h + 0.42, zz - 0.14), (x0 + 0.12, h + 0.42, zz - 0.14)], '#e8e8e4')
    if CC0: ph_put('potted_plant_02', x0 + 0.3, h, z1 + 0.05, 0.6, height=0.5, share=False, decimate=0.06)   # 櫃台上的盆栽（Poly Haven）
    else: clathe(vc(), [(0.0, 0.0), (0.09, 0.0), (0.12, 0.2), (0.0, 0.2)], x0 + 0.3, h, z1 + 0.05, '#f4f1ea', seg=10); fern(x0 + 0.3, h + 0.32, z1 + 0.05, r=0.24, n=12)
    # 右牆鐵層架：整面彩色紙、紙箱
    sx0, sx1 = SV['x0'], SV['x1']; nb = 5; bw = (SV['z1'] - SV['z0']) / nb
    for i in range(nb + 1): zz = SV['z0'] + i * bw; vm().cbox(sx0, sx0 + 0.03, 0.0, SV['h'], zz - 0.015, zz + 0.015, STEEL)
    for y in (0.15, 0.6, 1.05, 1.5, 1.95, 2.38): vm().cbox(sx0, sx1, y - 0.02, y, SV['z0'], SV['z1'], STEEL)
    PAPER = ['#f4b8c8', '#b8d8f0', '#f4e6a0', '#c8e6b8', '#f4f4f0', '#f0c8a0', '#d8c8f0', '#a8d8d0']
    if CC0:   # v2（BB_379 印得好 ①：每格都是一樣大小的長方盒排格子 → 參考圖是一疊疊影印紙，厚薄不同、橫放直放混著，資料夾、頂層紙箱，高低大小都不同）
        RRS = __import__('random').Random(11); REAMS = ['ream_w', 'ream_w', 'ream_w2', 'ream_w3', 'ream_w', 'ream_p', 'ream_b', 'ream_y']
        dx0, dx1 = sx0 + 0.04, sx1 - 0.02; dep = dx1 - dx0
        for j, y in enumerate((0.15, 0.6, 1.05, 1.5, 1.95)):
            top = 0.4 if j < 4 else 0.42
            for i in range(nb):
                za, zbb = SV['z0'] + i * bw + 0.04, SV['z0'] + (i + 1) * bw - 0.04; zz = za + RRS.uniform(0.0, 0.05)
                if j == 4:   # 頂層：大小不一的紙箱＋一兩疊紙
                    while zz < zbb - 0.25:
                        sc = RRS.uniform(0.75, 1.25); w_ = 0.36 * sc
                        if zz + w_ > zbb: break
                        ph_put('cardboard_box_01', (dx0 + dx1) / 2, y, zz + w_ / 2, RRS.uniform(-0.15, 0.15) + (PI / 2 if RRS.random() < 0.5 else 0), sc, height=0.3, decimate=0.03); zz += w_ + RRS.uniform(0.03, 0.12)
                    continue
                if (i + j) % 4 == 3:   # 這一格前半段立著一排精裝的裝訂本（Poly Haven book_encyclopedia_set_01：一排 55 cm 長、24 cm 高的書），後半段照樣放紙
                    sc = RRS.uniform(0.95, 1.1); ph_put('book_encyclopedia_set_01', dx1 - 0.1, y, zz + 0.28 * sc, PI / 2, sc, height=0.237, decimate=0.015); zz += 0.56 * sc + 0.05
                while zz < zbb - 0.2:
                    rot_ = RRS.random() < 0.35; fw = 0.297 if rot_ else 0.21; fd = 0.21 if rot_ else 0.297   # 直放（短邊朝外）或橫放
                    if zz + fw > zbb: break
                    n = RRS.randint(2, min(7, int(top / 0.054))); key = RRS.choice(REAMS); yy = y
                    xc = dx1 - fd / 2 - RRS.uniform(0.0, max(0.0, dep - fd))
                    for r_ in range(n):
                        t_ = RRS.uniform(0.048, 0.056); jx, jz = RRS.uniform(-0.008, 0.008), RRS.uniform(-0.008, 0.008)
                        mesh(key).box(xc - fd / 2 + jx, xc + fd / 2 + jx, yy, yy + t_, zz + jz, zz + fw + jz); yy += t_
                    if RRS.random() < 0.3 and n < 6: vc().cbox(xc - fd / 2 + 0.01, xc + fd / 2 - 0.01, yy, yy + RRS.uniform(0.004, 0.02), zz + 0.01, zz + fw - 0.01, '#f6f6f2')   # 拆開的一疊散紙
                    zz += fw + RRS.uniform(0.015, 0.06)
    for j, y in enumerate((0.15, 0.6, 1.05, 1.5, 1.95) if not CC0 else ()):
        for i in range(nb):
            for k in range(3):
                zz = SV['z0'] + i * bw + 0.06 + k * (bw - 0.12) / 3; hh = RR.uniform(0.16, 0.36)
                if j == 4 and k == 1: vc().cbox(sx0 + 0.05, sx1 - 0.02, y, y + 0.3, zz, zz + (bw - 0.12) / 3 - 0.03, '#c9a878'); continue
                vc().cbox(sx0 + 0.04, sx1 - 0.02, y, y + hh, zz, zz + (bw - 0.12) / 3 - 0.03, PAPER[(i * 3 + j * 2 + k) % 8])
    # 左牆：價目表、裝訂樣品、海報樣張（參考圖裁的）；玻璃門旁的盆栽
    xw = -W / 2 + 0.012
    for key, d in (('price', DC['priceBoard']), ('sample', DC['samplePoster']), ('campus', DC['campusPoster'])):
        vc().cbox(-W / 2, -W / 2 + 0.01, d['y0'] - 0.03, d['y1'] + 0.03, d['z0'] - 0.03, d['z1'] + 0.03, '#f4f4f0'); pic(key, [(xw, d['y0'], d['z1']), (xw, d['y0'], d['z0']), (xw, d['y1'], d['z0']), (xw, d['y1'], d['z1'])])
    if CC0: ph_put('potted_plant_02', -2.8, 0.0, 4.0, 2.2, height=1.1, share=False, decimate=0.06)   # 玻璃門旁的落地盆栽（Poly Haven）
    else: clathe(vc(), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.36), (0.0, 0.36)], -2.8, 0.0, 4.0, '#e8e0d0', seg=12); fern(-2.8, 0.75, 4.0, r=0.34, n=18)
    # 後牆：冷氣、布簾的門、紙箱；天花板：日光燈、裸露管線
    vc().crbox(-0.2, 0.9, 2.35, 2.65, -D / 2, -D / 2 + 0.24, '#f4f4f0', r=0.02)
    for i in range(8): a = 0.4 + i * 0.13; vc().cbox(a, a + 0.13, 0.05, 2.1, -D / 2 + 0.03 + (i % 2) * 0.02, -D / 2 + 0.05 + (i % 2) * 0.02, ('#c9c4b8', '#b8b2a4')[i % 2])
    if CC0:   # v2：後牆前一堆 Poly Haven 紙箱（大小、角度不一樣，疊兩層）
        for i, (bx_, by_, sc, yw) in enumerate(((-1.0, 0.0, 1.1, 0.05), (-0.55, 0.0, 0.95, -0.1), (-0.12, 0.0, 1.2, 0.08), (-0.95, 0.33, 0.85, 0.2), (-0.15, 0.36, 0.8, -0.15))): ph_put('cardboard_box_01', bx_, by_, -D / 2 + 0.28, yw, sc, height=0.3, decimate=0.03)
    else:
        for i in range(5): vc().cbox(-1.2 + (i % 3) * 0.45, -0.8 + (i % 3) * 0.45, (i // 3) * 0.36, (i // 3) * 0.36 + 0.34, -D / 2 + 0.06, -D / 2 + 0.46, '#c9a878')
    PRE = 'CEIL:'   # 吸頂的燈具：鏡頭高過天花板時一起藏
    for zz in (-3.0, -0.6, 1.8, 3.9): vc().cbox(-1.3, 0.3, H - 0.07, H - 0.02, zz - 0.09, zz + 0.09, '#eceeee'); mesh('light').box(-1.22, 0.22, H - 0.095, H - 0.07, zz - 0.035, zz + 0.035)
    PRE = ''
    ccyl(vc(), (-W / 2 + 0.12, H - 0.25, -D / 2 + 0.2), (-W / 2 + 0.12, H - 0.25, D / 2 - 0.2), 0.03, '#e2e4e4', seg=8); ccyl(vc(), (-W / 2 + 0.2, H - 0.12, -D / 2 + 0.2), (-W / 2 + 0.2, H - 0.12, D / 2 - 0.2), 0.02, '#d6d9da', seg=6)


# ---------- 公館三間共用：貨架上的東西 ----------
def goods(x0, x1, y, z0, z1, cols, hmin=0.1, hmax=0.22, along='z', step=0.11, depth=None):
    """一層貨架上的一排盒子、瓶子（沿 z 或沿 x 排；每個顏色高度不一樣）"""
    a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.02
    while a + step * 0.8 < a1:
        w_ = step * RR.uniform(0.7, 0.95); hh = RR.uniform(hmin, hmax); col = RR.choice(cols)
        if along == 'z': vc().cbox(x0 + 0.02, x1 - 0.02, y, y + hh, a, a + w_, col)
        else: vc().cbox(a, a + w_, y, y + hh, z0 + 0.02, z1 - 0.02, col)
        a += step
def gondola(g, cols_by_level, body='#f1f0ea', levels=(0.25, 0.65, 1.05, 1.42), style='metal', fill=None):
    """中間的雙面貨架：底座、背板、一層層層板＋商品（兩面都有）"""
    x0, x1, z0, z1, h = g['x0'], g['x1'], g['z0'], g['z1'], g['h']; long_z = (z1 - z0) > (x1 - x0)
    if style == 'wood': mesh('wood').box(x0, x1, 0.0, 0.14, z0, z1)
    else: vc().cbox(x0, x1, 0.0, 0.14, z0, z1, body)
    if long_z:
        xm = (x0 + x1) / 2; vc().cbox(xm - 0.02, xm + 0.02, 0.14, h, z0, z1, body)
        for zz in (z0, z1 - 0.04): vc().cbox(x0 + 0.05, x1 - 0.05, 0.14, h, zz, zz + 0.04, body)
        for i, y in enumerate(levels):
            (mesh('wood').box(x0, x1, y - 0.025, y, z0, z1) if style == 'wood' else vc().cbox(x0, x1, y - 0.025, y, z0, z1, body))
            if fill: fill(x0, xm - 0.02, y, z0 + 0.05, z1 - 0.05, 'z', i); fill(xm + 0.02, x1, y, z0 + 0.05, z1 - 0.05, 'z', i + 2); continue
            goods(x0, xm - 0.02, y, z0 + 0.05, z1 - 0.05, cols_by_level[i % len(cols_by_level)]); goods(xm + 0.02, x1, y, z0 + 0.05, z1 - 0.05, cols_by_level[(i + 1) % len(cols_by_level)])
    else:
        zm = (z0 + z1) / 2; vc().cbox(x0, x1, 0.14, h, zm - 0.02, zm + 0.02, body)
        for xx in (x0, x1 - 0.04): vc().cbox(xx, xx + 0.04, 0.14, h, z0 + 0.05, z1 - 0.05, body)
        for i, y in enumerate(levels):
            (mesh('wood').box(x0, x1, y - 0.025, y, z0, z1) if style == 'wood' else vc().cbox(x0, x1, y - 0.025, y, z0, z1, body))
            if fill: fill(x0 + 0.05, x1 - 0.05, y, z0, zm - 0.02, 'x', i); fill(x0 + 0.05, x1 - 0.05, y, zm + 0.02, z1, 'x', i + 2); continue
            goods(x0 + 0.05, x1 - 0.05, y, z0, zm - 0.02, cols_by_level[i % len(cols_by_level)], along='x'); goods(x0 + 0.05, x1 - 0.05, y, zm + 0.02, z1, cols_by_level[(i + 1) % len(cols_by_level)], along='x')
def tubes(rows, x0=-1.5, x1=1.5, grid=True):
    """天花板的日光燈；grid＝輕鋼架格柵天花板的線。整組放進 CEIL_*（鏡頭高過天花板時遊戲一起藏）"""
    global PRE
    PRE = 'CEIL:'
    if grid:
        for k in range(int(W / 1.2) + 1): xx = -W / 2 + k * 1.2; vc().cbox(xx - 0.012, xx + 0.012, H - 0.012, H - 0.004, -D / 2, D / 2, '#d9dad6')
        for k in range(int(D / 1.2) + 1): zz = -D / 2 + k * 1.2; vc().cbox(-W / 2, W / 2, H - 0.012, H - 0.004, zz - 0.012, zz + 0.012, '#d9dad6')
    for zz in rows:
        for xx in (x0, x1): vc().cbox(xx - 0.62, xx + 0.62, H - 0.06, H - 0.015, zz - 0.11, zz + 0.11, '#eceeee'); mesh('light').box(xx - 0.58, xx + 0.58, H - 0.085, H - 0.06, zz - 0.03, zz + 0.03); mesh('light').box(xx - 0.58, xx + 0.58, H - 0.085, H - 0.06, zz + 0.05, zz + 0.08)
    PRE = ''

def pharma(x0, x1, y, z0, z1, along='z', k=0):
    """藥局貨架的一層（第 2 版；BB 11-10 23:51：一塊一塊的色塊看起來像書店——參考圖是藥盒、瓶罐、口罩）：一段一段排——
    白色藥盒（同一段同一種、腰上一條顏色帶）、藥瓶（白／棕／藍瓶身＋瓶蓋）、口罩盒（寬扁的淺藍盒＋白帶）、小盒的眼藥水藥膏（矮）"""
    BAND = ['#2f6fb0', '#3f8a5a', '#c94a4a', '#e08a2a', '#7a5ab0', '#1f9a9a', '#d8a020']; a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.02; run = k
    def box(p0, p1, h, col, band=None, bh=(0.5, 0.72)):
        if along == 'z':
            vc().cbox(x0 + 0.03, x1 - 0.03, y, y + h, p0, p1, col)
            if band: vc().cbox(x0 + 0.027, x1 - 0.027, y + h * bh[0], y + h * bh[1], p0 - 0.002, p1 + 0.002, band)
        else:
            vc().cbox(p0, p1, y, y + h, z0 + 0.03, z1 - 0.03, col)
            if band: vc().cbox(p0 - 0.002, p1 + 0.002, y + h * bh[0], y + h * bh[1], z0 + 0.027, z1 - 0.027, band)
    def bottle(pc, r, h, col, cap):
        for d in (0.5,):
            px, pz = ((x0 + (x1 - x0) * d, pc) if along == 'z' else (pc, z0 + (z1 - z0) * d))
            ccyl(vc(), (px, y, pz), (px, y + h, pz), r, col, seg=6, caps=False); ccyl(vc(), (px, y + h, pz), (px, y + h + 0.03, pz), r * 0.66, cap, seg=6)
    while a < a1 - 0.08:
        kind = ('box', 'bottle', 'box', 'mask', 'small', 'box', 'bottle')[run % 7]; L_ = RR.uniform(0.38, 0.62); e = min(a1 - 0.02, a + L_); band = BAND[(run * 3 + k) % len(BAND)]
        if kind == 'box':
            w = RR.choice((0.11, 0.13, 0.15)); h = RR.uniform(0.11, 0.16)
            while a + w <= e: box(a, a + w - 0.006, h, '#f6f5f0', band); a += w
        elif kind == 'bottle':
            r = RR.choice((0.036, 0.042)); h = RR.uniform(0.11, 0.16); col, cap = RR.choice((('#f6f5f0', '#2f6fb0'), ('#7a4a2a', '#f4f4f0'), ('#f6f5f0', '#3f8a5a'), ('#3f6a9a', '#f4f4f0')))
            while a + 2 * r <= e: bottle(a + r, r, h, col, cap); a += 2 * r + 0.03
        elif kind == 'mask':
            while a + 0.2 <= e:
                for j in range(2): box(a, a + 0.19, 0.085, '#cfe2f2' if j == 0 else '#dce9f4', '#f6f5f0', bh=(0.3, 0.7)) if j == 0 else (vc().cbox(x0 + 0.04, x1 - 0.04, y + 0.086, y + 0.166, a + 0.004, a + 0.186, '#dce9f4') if along == 'z' else vc().cbox(a + 0.004, a + 0.186, y + 0.086, y + 0.166, z0 + 0.04, z1 - 0.04, '#dce9f4'))
                a += 0.2
        else:
            w = 0.09; h = RR.uniform(0.05, 0.075)
            while a + w <= e: box(a, a + w - 0.006, h, RR.choice(('#fff2c8', '#e8f0e0', '#f6e6e0'))); a += w
        a = e + 0.03; run += 1


# ---------- 安泰藥局 ----------
if SHOP == 'antai':
    CT, BR, WC, BP, BK = J['counter'], J['backroom'], J['wallCase'], J['bpTable'], J['bookRack']
    GREEN = '#1f5a3a'; MED = [['#f4f4f0', '#dfe8f4', '#2f6fb0', '#f0e2a0', '#e8eef2'], ['#e8f0e0', '#f4f4f0', '#3f8a5a', '#f4d8a0', '#c9d8ee'], ['#f6e6e0', '#f4f4f0', '#b8503a', '#e6d8f0', '#fff2c8'], ['#8a4a2a', '#f4f4f0', '#5a3a22', '#e8e0c8', '#c9a23a']]
    for g in J['gondolas']: gondola(g, MED, fill=pharma)
    # 藥師櫃台（白色、深綠踢腳）：收銀螢幕、筆筒；後面整面藥品櫃、上面白底綠字招牌（外觀那一塊：藥罐圖示，沒有十字）
    vc().cbox(CT['x0'], CT['x1'], 0.1, CT['h'] - 0.04, CT['z0'], CT['z1'], '#f1f0ea'); vc().cbox(CT['x0'], CT['x1'], 0.0, 0.1, CT['z0'], CT['z1'] + 0.005, GREEN); vc().crbox(CT['x0'] - 0.03, CT['x1'] + 0.03, CT['h'] - 0.04, CT['h'], CT['z0'] - 0.02, CT['z1'] + 0.04, '#f6f5f0', r=0.012)
    vc().cbox(-0.6, -0.1, CT['h'] + 0.12, CT['h'] + 0.48, CT['z0'] + 0.18, CT['z0'] + 0.22, '#1f2023'); ccyl(vc(), (-0.35, CT['h'], CT['z0'] + 0.2), (-0.35, CT['h'] + 0.14, CT['z0'] + 0.2), 0.03, '#1f2023', seg=6); vc().cbox(-0.95, -0.68, CT['h'], CT['h'] + 0.14, CT['z0'] + 0.1, CT['z0'] + 0.4, '#2a2d31')
    ccyl(vc(), (0.3, CT['h'], CT['z1'] - 0.2), (0.3, CT['h'] + 0.1, CT['z1'] - 0.2), 0.04, '#2f6fb0', seg=8)
    zb = -D / 2; vc().cbox(-3.2, 3.2, 0.0, 0.85, zb, zb + 0.45, '#f1f0ea'); vc().cbox(-3.2, 3.2, 0.85, 2.05, zb, zb + 0.04, '#f6f5f0')
    for k in range(5): xx = -3.2 + k * 1.6; vc().cbox(xx - 0.02, xx + 0.02, 0.85, 2.05, zb, zb + 0.34, '#e2e2dc')
    for y in (0.87, 1.11, 1.35, 1.59, 1.83):
        vc().cbox(-3.2, 3.2, y - 0.02, y, zb, zb + 0.32, '#eceae2'); pharma(-3.18, 3.18, y, zb + 0.03, zb + 0.33, 'x', int(y * 10))
    vc().cbox(-2.2, 2.2, 2.2, 2.82, zb, zb + 0.05, '#f6f5f0'); vc().cbox(-2.22, 2.22, 2.18, 2.2, zb, zb + 0.06, GREEN); vc().cbox(-2.22, 2.22, 2.82, 2.84, zb, zb + 0.06, GREEN)
    pic('sign', [(-2.1, 2.22, zb + 0.055), (2.1, 2.22, zb + 0.055), (2.1, 2.8, zb + 0.055), (-2.1, 2.8, zb + 0.055)])
    # 左牆：玻璃門的櫃子（上）＋掛鉤商品（下）；壁扇、時鐘、相框
    vc().cbox(WC['x0'], WC['x1'], 0.0, 0.5, WC['z0'], WC['z1'], '#f1f0ea'); vc().cbox(WC['x0'], WC['x0'] + 0.03, 0.5, WC['h'], WC['z0'], WC['z1'], '#f6f5f0')
    for y in (0.5, 0.9, 1.3, 1.7): vc().cbox(WC['x0'], WC['x1'], y - 0.02, y, WC['z0'], WC['z1'], '#eceae2'); pharma(WC['x0'] + 0.03, WC['x1'] + 0.03, y, WC['z0'] + 0.05, WC['z1'] - 0.05, 'z', int(y * 10) + 1)
    vc().cbox(WC['x0'], WC['x1'], WC['h'], WC['h'] + 0.04, WC['z0'], WC['z1'], '#e2e2dc')
    ccyl(vc(), (-W / 2 + 0.02, 2.55, 2.0), (-W / 2 + 0.3, 2.5, 2.0), 0.02, '#eceeee', seg=6); ccyl(vc(), (-W / 2 + 0.3, 2.5, 2.0), (-W / 2 + 0.36, 2.5, 2.0), 0.22, '#eceeee', seg=16)
    ccyl(vc(), (-W / 2 + 0.01, 2.5, -0.5), (-W / 2 + 0.04, 2.5, -0.5), 0.16, '#2a2d31', seg=16); ccyl(vc(), (-W / 2 + 0.04, 2.5, -0.5), (-W / 2 + 0.045, 2.5, -0.5), 0.14, '#f6f5f0', seg=16)
    vc().cbox(-W / 2, -W / 2 + 0.02, 2.2, 2.75, 3.2, 3.9, '#6a4a2a'); vc().cbox(-W / 2 + 0.02, -W / 2 + 0.024, 2.25, 2.7, 3.25, 3.85, '#cfdfe8')
    # 右牆：衛教海報、書報架、血壓計桌和黑色圓凳
    xe = W / 2 - 0.012
    for (z0_, z1_) in ((1.9, 2.9), (3.1, 3.9)): vc().cbox(W / 2 - 0.01, W / 2, 1.15, 2.75, z0_ - 0.03, z1_ + 0.03, '#f6f5f0'); pic('poster', [(xe, 1.18, z0_), (xe, 1.18, z1_), (xe, 2.72, z1_), (xe, 2.72, z0_)])
    vc().cbox(W / 2 - 0.03, W / 2, 2.0, 2.6, -0.2, 0.25, '#6a4a2a'); vc().cbox(W / 2 - 0.034, W / 2 - 0.03, 2.05, 2.55, -0.15, 0.2, '#f4f1e4')
    mesh('wood').box(BK['x0'], BK['x1'], 0.0, 1.5, BK['z0'], BK['z0'] + 0.03); mesh('wood').box(BK['x0'], BK['x1'], 0.0, 1.5, BK['z1'] - 0.03, BK['z1'])
    for j, y in enumerate((0.3, 0.7, 1.1)):
        mesh('wood').box(BK['x0'], BK['x1'], y - 0.02, y, BK['z0'], BK['z1'])
        for i in range(4): zz = BK['z0'] + 0.08 + i * 0.22; vc().poly([(BK['x0'] + 0.02, y, zz), (BK['x0'] + 0.02, y, zz + 0.18), (BK['x0'] + 0.14, y + 0.28, zz + 0.18), (BK['x0'] + 0.14, y + 0.28, zz)], ('#e8a8b8', '#a8c8e8', '#f0d8a0', '#b8d8b0')[(i + j) % 4])
    x, z = BP['x'], BP['z']; vc().crbox(x - BP['w'] / 2, x + BP['w'] / 2, 0.7, 0.74, z - BP['d'] / 2, z + BP['d'] / 2, '#efe6d0', r=0.01)
    for sx in (-1, 1):
        for sz in (-1, 1): ccyl(vm(), (x + sx * (BP['w'] / 2 - 0.06), 0.0, z + sz * (BP['d'] / 2 - 0.06)), (x + sx * (BP['w'] / 2 - 0.06), 0.7, z + sz * (BP['d'] / 2 - 0.06)), 0.018, '#c4c8cb', seg=6)
    vc().crbox(x - 0.2, x + 0.22, 0.74, 1.02, z + 0.05, z + 0.5, '#eceeee', r=0.04); ccyl(vc(), (x - 0.2, 0.9, z + 0.28), (x - 0.24, 0.9, z + 0.28), 0.1, '#3a3f46', seg=14)   # 隧道式血壓計
    vc().crbox(x - 0.16, x + 0.16, 0.74, 0.9, z - 0.5, z - 0.18, '#eceeee', r=0.02)
    for q in J['seats']:
        ccyl(vc(), (q['x'], 0.44, q['z']), (q['x'], 0.5, q['z']), 0.17, '#1f2023', seg=16)
        for k in range(4): a = k * PI / 2 + PI / 4; ccyl(vm(), (q['x'] + math.cos(a) * 0.08, 0.44, q['z'] + math.sin(a) * 0.08), (q['x'] + math.cos(a) * 0.16, 0.0, q['z'] + math.sin(a) * 0.16), 0.012, '#c4c8cb', seg=6)
    # 玻璃上的一條綠線（照外觀）、門邊的盆栽；天花板
    PRE = 'WALL_Sfix:'
    for (a, b) in FR['windows']: vc().cbox(a, b, 1.05, 1.11, zS + 0.06, zS + 0.07, '#2f8a5a')
    PRE = ''
    clathe(vc(), [(0.0, 0.0), (0.17, 0.0), (0.2, 0.38), (0.0, 0.38)], -3.4, 0.0, 4.2, '#f4f1ea', seg=12); fern(-3.4, 0.75, 4.2, r=0.34, n=18)
    tubes((-3.6, -1.2, 1.2, 3.6))


# ---------- 汀州鮮果 ----------
if SHOP == 'xianguo':
    RK, BT, WT, FG, OC, BK = J['rack'], J['bananaTable'], J['workTable'], J['fridge'], J['orangeCrate'], J['back']
    CRATE, WOODC = '#2f8a4a', '#b89868'
    def pile(x0, x1, y, z0, z1, r, cols, layers=2, sy=1.0):
        """一堆水果（圓的）：一顆顆排、上面再疊一層"""
        for ly in range(layers):
            nx = max(1, int((x1 - x0 - ly * r) / (r * 1.9))); nz = max(1, int((z1 - z0 - ly * r) / (r * 1.9)))
            for i in range(nx):
                for j in range(nz): blob(x0 + r * (1 + ly * 0.9) + i * (x1 - x0 - 2 * r - ly * r * 1.8) / max(1, nx - 1) if nx > 1 else (x0 + x1) / 2, y + r * sy * (0.9 + ly * 1.5), z0 + r * (1 + ly * 0.9) + j * (z1 - z0 - 2 * r - ly * r * 1.8) / max(1, nz - 1) if nz > 1 else (z0 + z1) / 2, r * RR.uniform(0.92, 1.05), RR.choice(cols), sy=sy)
    def crate(x0, x1, y, z0, z1, col=CRATE, h=0.22):
        vc().cbox(x0, x1, y, y + 0.03, z0, z1, col)
        for (a, b, c_, d_) in ((x0, x1, z0, z0 + 0.03), (x0, x1, z1 - 0.03, z1), (x0, x0 + 0.03, z0, z1), (x1 - 0.03, x1, z0, z1)): vc().cbox(a, b, y, y + h, c_, d_, col)
    # 左牆：三階木架，一階一階往牆升高；每一格一種水果
    FR_ = [(['#c0392b', '#a82a22', '#d9574a'], 0.055, 1.0), (['#a8c85a', '#bcd66a'], 0.06, 1.0), (['#e8962a', '#f0a83a'], 0.055, 1.0), (['#5a3a6a', '#4a2f5a', '#7a9a3a'], 0.03, 1.0), (['#a8c85a', '#c8d87a'], 0.07, 1.1), (['#e8962a', '#f0a83a'], 0.055, 1.0)]
    nseg = 5; sw = (RK['z1'] - RK['z0']) / nseg
    for st in range(3):
        xa = RK['x1'] - (st + 1) * 0.5; xb = xa + 0.5; y = 0.45 + st * 0.3
        mesh('wood').box(max(RK['x0'], xa), xb, 0.0 if st == 0 else y - 0.3, y, RK['z0'], RK['z1'])
        for i in range(nseg):
            z0_ = RK['z0'] + i * sw + 0.04; z1_ = z0_ + sw - 0.08; f = FR_[(i + st * 2) % len(FR_)]
            if st == 2 and i % 2 == 0:   # 最上面：鳳梨、西瓜
                if i % 4 == 0:
                    for k in range(3): cx_ = (max(RK['x0'], xa) + xb) / 2; zc = z0_ + 0.14 + k * (z1_ - z0_ - 0.28) / 2; blob(cx_, y + 0.16, zc, 0.11, '#c9962a', sy=1.4); ccyl(vc(), (cx_, y + 0.3, zc), (cx_, y + 0.52, zc), 0.07, '#4f7a3a', seg=6, r2=0.01)
                else:
                    for k in range(2): blob((max(RK['x0'], xa) + xb) / 2, y + 0.19, z0_ + 0.22 + k * 0.42, 0.2, '#3f7a3a' if k else '#4f8a44', sy=0.95)
                continue
            crate(max(RK['x0'], xa) + 0.02, xb - 0.02, y, z0_, z1_, CRATE if (i + st) % 2 else WOODC); pile(max(RK['x0'], xa) + 0.05, xb - 0.05, y + 0.03, z0_ + 0.03, z1_ - 0.03, f[1], f[0], sy=f[2])
    # 門口左邊：一桌香蕉（一串一串黃色）
    x, z = BT['x'], BT['z']; mesh('wood').box(x - BT['w'] / 2, x + BT['w'] / 2, 0.0, 0.7, z - BT['d'] / 2, z + BT['d'] / 2); vc().cbox(x - BT['w'] / 2, x + BT['w'] / 2, 0.7, 0.72, z - BT['d'] / 2, z + BT['d'] / 2, '#4f7a3a')
    for i in range(7):
        bx = x - BT['w'] / 2 + 0.2 + (i % 4) * 0.48; bz = z - 0.22 + (i // 4) * 0.42
        for k in range(5): ccyl(vc(), (bx - 0.14 + k * 0.03, 0.76, bz - 0.12), (bx + 0.1 + k * 0.03, 0.8 + k * 0.012, bz + 0.14), 0.03, '#f0cf3a' if k % 2 else '#e6c22e', seg=6)
    # 中間木工作桌：電子秤、切好的水果盒、砧板上的鳳梨、桌邊掛的粉紅條紋塑膠袋、桌下的綠籃
    x, z, w_, d_ = WT['x'], WT['z'], WT['w'], WT['d']
    mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.82, 0.88, z - d_ / 2, z + d_ / 2, r=0.012, seg=2); mesh('wood').box(x - w_ / 2 + 0.05, x + w_ / 2 - 0.05, 0.3, 0.33, z - d_ / 2 + 0.05, z + d_ / 2 - 0.05)
    for sx in (-1, 1):
        for sz in (-1, 1): mesh('wood').box(x + sx * (w_ / 2 - 0.07) - 0.035, x + sx * (w_ / 2 - 0.07) + 0.035, 0, 0.82, z + sz * (d_ / 2 - 0.07) - 0.035, z + sz * (d_ / 2 - 0.07) + 0.035)
    vm().crbox(x - 0.75, x - 0.3, 0.88, 0.96, z - 0.1, z + 0.3, '#c4c8cb', r=0.01); vm().cbox(x - 0.72, x - 0.33, 0.96, 0.975, z - 0.07, z + 0.18, '#d8dadc'); vc().cbox(x - 0.72, x - 0.33, 0.9, 0.955, z + 0.3, z + 0.305, '#2a3a4a')
    vc().cbox(x + 0.2, x + 0.75, 0.88, 0.9, z - 0.25, z + 0.15, '#f4f1e4'); blob(x + 0.45, 0.94, z - 0.05, 0.1, '#e8c23a', sy=0.5); blob(x + 0.62, 0.93, z + 0.02, 0.06, '#c9962a', sy=1.3)
    for i in range(4): vc().cbox(x - 0.1 + i * 0.01, x + 0.12 + i * 0.01, 0.88 + i * 0.05, 0.93 + i * 0.05, z - 0.35, z - 0.1, ('#f4e6c0', '#e8f0d0', '#f4d0c0', '#f4f4f0')[i])
    for i in range(3): vc().cbox(x - 0.9 + i * 0.03, x - 0.86 + i * 0.03, 0.35, 0.8, z + d_ / 2 + 0.01, z + d_ / 2 + 0.035, ('#f09ab0', '#f4f4f0')[i % 2])
    crate(x - 0.8, x - 0.1, 0.33, z - 0.3, z + 0.3); crate(x + 0.1, x + 0.8, 0.33, z - 0.3, z + 0.3, '#2a2f36')
    # 右邊：不鏽鋼冷藏展示櫃（三層切好的水果盒、下面整顆的水果）；門口右邊一籃橘子
    vm().cbox(FG['x0'], FG['x1'], 0.0, 0.55, FG['z0'], FG['z1'], '#b9bdc1'); vm().cbox(FG['x1'] - 0.06, FG['x1'], 0.55, FG['h'], FG['z0'], FG['z1'], '#c4c8cb'); vm().cbox(FG['x0'], FG['x1'], FG['h'] - 0.12, FG['h'], FG['z0'], FG['z1'], '#c4c8cb')
    for zz in (FG['z0'], FG['z1'] - 0.04): vm().cbox(FG['x0'], FG['x1'], 0.55, FG['h'], zz, zz + 0.04, '#c4c8cb')
    mesh('glass').quad([(FG['x0'] + 0.02, 0.55, FG['z1']), (FG['x0'] + 0.02, 0.55, FG['z0']), (FG['x0'] + 0.02, FG['h'] - 0.12, FG['z0']), (FG['x0'] + 0.02, FG['h'] - 0.12, FG['z1'])])
    mesh('light').box(FG['x0'] + 0.1, FG['x1'] - 0.1, FG['h'] - 0.15, FG['h'] - 0.12, FG['z0'] + 0.1, FG['z1'] - 0.1)
    for j, y in enumerate((0.6, 1.0, 1.38)):
        vm().cbox(FG['x0'] + 0.05, FG['x1'] - 0.06, y - 0.02, y, FG['z0'] + 0.04, FG['z1'] - 0.04, '#d8dadc')
        if j == 0: pile(FG['x0'] + 0.1, FG['x1'] - 0.1, y, FG['z0'] + 0.1, FG['z1'] - 0.1, 0.07, ['#a8c85a', '#5a3a6a', '#c0392b', '#e8e0c0'], layers=1)
        else:
            for i in range(9): zz = FG['z0'] + 0.12 + i * (FG['z1'] - FG['z0'] - 0.24) / 9; vc().cbox(FG['x0'] + 0.12, FG['x0'] + 0.5, y, y + 0.09, zz, zz + 0.26, ('#f0d23a', '#e84a5a', '#a8c85a', '#f09a3a', '#7a3a6a')[(i + j) % 5]); vc().cbox(FG['x0'] + 0.11, FG['x0'] + 0.51, y + 0.09, y + 0.1, zz - 0.01, zz + 0.27, '#f4f6f6')
    x, z = OC['x'], OC['z']; mesh('wood').box(x - OC['w'] / 2, x + OC['w'] / 2, 0.0, 0.45, z - OC['d'] / 2, z + OC['d'] / 2); crate(x - OC['w'] / 2 + 0.02, x + OC['w'] / 2 - 0.02, 0.45, z - OC['d'] / 2 + 0.02, z + OC['d'] / 2 - 0.02); pile(x - OC['w'] / 2 + 0.06, x + OC['w'] / 2 - 0.06, 0.48, z - OC['d'] / 2 + 0.06, z + OC['d'] / 2 - 0.06, 0.06, ['#e8862a', '#f09a3a'], layers=2)
    # 後面：紙箱堆、水槽和層架、立扇；牆：舊白磁磚（下半）、水果壁畫；吊燈
    for i in range(14): bx = -2.6 + (i % 5) * 0.62; by = (i // 5) * 0.42; vc().cbox(bx, bx + 0.58, by, by + 0.4, BK['z0'] + 0.1, BK['z0'] + 0.6, ('#c9a878', '#b8946a', '#d9c9a8')[i % 3])
    mesh('steel').box(1.2, 3.6, 0.0, 0.85, BK['z0'] + 0.05, BK['z0'] + 0.65); mesh('steel').box(1.2, 3.6, 1.5, 1.52, BK['z0'] + 0.05, BK['z0'] + 0.4)
    ccyl(vm(), (-0.6, 0.0, -2.6), (-0.6, 1.2, -2.6), 0.025, '#3a3a3c', seg=8); ccyl(vm(), (-0.6, 0.0, -2.6), (-0.6, 0.04, -2.6), 0.25, '#3a3a3c', seg=14); ccyl(vm(), (-0.6, 1.25, -2.66), (-0.6, 1.25, -2.54), 0.3, '#5a5a5c', seg=18)
    xw = -W / 2 + 0.012; pic('mural', [(xw, 1.75, 3.6), (xw, 1.75, -0.2), (xw, 2.95, -0.2), (xw, 2.95, 3.6)])
    for xx, zz in ((-2.6, 3.0), (-2.2, 0.6), (1.6, 2.2), (2.2, -0.8)):
        ccyl(vc(), (xx, 2.5, zz), (xx, H, zz), 0.006, '#2b2b2b', seg=4); ccyl(vm(), (xx, 2.32, zz), (xx, 2.5, zz), 0.16, '#3a4a44', seg=14, r2=0.04, caps=False); mesh('light').sphere((xx, 2.3, zz), 0.055, seg=8, rings=5)
    tubes((-2.4, 0.2, 2.8), x0=-0.2, x1=2.2, grid=False)
    # 第 2 版（BB 11-10 23:51：比參考圖空很多——參考圖堆得滿滿：掛著的香蕉、整排鳳梨西瓜、一地的箱子）
    def bunch(x, y, z, n=6):   # 掛著的一串香蕉：上面一小段梗、往下散開的幾根
        ccyl(vc(), (x, y, z), (x, y + 0.12, z), 0.012, '#6a5a2a', seg=5)
        for k in range(n): a_ = k * 2 * PI / n; ccyl(vc(), (x + math.cos(a_) * 0.02, y, z + math.sin(a_) * 0.02), (x + math.cos(a_) * 0.075, y - 0.2, z + math.sin(a_) * 0.075), 0.022, '#f0cf3a' if k % 2 else '#e2bd2a', seg=5, r2=0.012)
    for (rx, z0_, z1_, n_) in ((-2.25, -1.4, 2.9, 9), (1.1, 0.5, 2.1, 4)):   # 兩根吊桿：木架前面一整排、工作桌上面一排
        ccyl(vm(), (rx, 2.34, z0_), (rx, 2.34, z1_), 0.012, '#8f9498', seg=6)
        for zz in (z0_ + 0.05, z1_ - 0.05): ccyl(vm(), (rx, 2.34, zz), (rx, H, zz), 0.006, '#8f9498', seg=4)
        for i in range(n_): bunch(rx, 2.2 - (i % 2) * 0.05, z0_ + 0.2 + i * (z1_ - z0_ - 0.4) / max(1, n_ - 1), n=6 if i % 3 else 7)
    for ex in J.get('extraStacks', []):   # 地上一疊疊的箱子、籃子（配置 extraStacks：導航一起擋）
        ex0, ex1, ez0, ez1 = ex['x0'], ex['x1'], ex['z0'], ex['z1']; n_ = max(1, int((ex1 - ex0) / 0.62)); cw = (ex1 - ex0) / n_
        for i in range(n_):
            if any(g0 < ex0 + (i + 0.5) * cw < g1 for g0, g1 in ex.get('gaps', [])): continue
            x0_ = ex0 + i * cw + 0.02; x1_ = x0_ + cw - 0.04; lv = 1 + (i * 7 + int(ez0 * 3)) % 3; kind = (i + int(abs(ez0) * 2)) % 4
            for l in range(lv): crate(x0_, x1_, l * 0.24, ez0 + 0.02, ez1 - 0.02, (CRATE, WOODC, '#c9a878', '#2a2f36')[(i + l) % 4])
            y_ = lv * 0.24 - 0.2
            if kind == 0: pile(x0_ + 0.04, x1_ - 0.04, y_, ez0 + 0.05, ez1 - 0.05, 0.07, ['#e8962a', '#f0a83a'], layers=1)
            elif kind == 1:
                for k in range(2): blob((x0_ + x1_) / 2, y_ + 0.2, ez0 + 0.16 + k * (ez1 - ez0 - 0.32), 0.17, '#3f7a3a' if k else '#4f8a44', sy=0.95)                                   # 西瓜
            elif kind == 2:
                for k in range(2): zc = ez0 + 0.15 + k * (ez1 - ez0 - 0.3); blob((x0_ + x1_) / 2, y_ + 0.15, zc, 0.1, '#c9962a', sy=1.4); ccyl(vc(), ((x0_ + x1_) / 2, y_ + 0.28, zc), ((x0_ + x1_) / 2, y_ + 0.48, zc), 0.065, '#4f7a3a', seg=6, r2=0.01)   # 鳳梨
            else: pile(x0_ + 0.04, x1_ - 0.04, y_, ez0 + 0.05, ez1 - 0.05, 0.068, ['#c0392b', '#a82a22', '#a8c85a'], layers=1)
            vc().poly([(x0_ + 0.08, lv * 0.24 + 0.02, ez1 + 0.004), (x1_ - 0.08, lv * 0.24 + 0.02, ez1 + 0.004), (x1_ - 0.08, lv * 0.24 + 0.2, ez1 + 0.03), (x0_ + 0.08, lv * 0.24 + 0.2, ez1 + 0.03)], '#f6e23a')                    # 黃色價目卡（字：遊戲裡看不清，不寫）
            vc().poly([(x0_ + 0.12, lv * 0.24 + 0.14, ez1 + 0.024), (x1_ - 0.12, lv * 0.24 + 0.14, ez1 + 0.024), (x1_ - 0.12, lv * 0.24 + 0.18, ez1 + 0.03), (x0_ + 0.12, lv * 0.24 + 0.18, ez1 + 0.03)], '#c9302a')
    for i in range(nseg):   # 木架每一格前緣一張黃色價目卡
        zc = RK['z0'] + (i + 0.5) * sw; vc().poly([(RK['x1'] + 0.004, 0.2, zc + 0.14), (RK['x1'] + 0.004, 0.2, zc - 0.14), (RK['x1'] + 0.03, 0.4, zc - 0.14), (RK['x1'] + 0.03, 0.4, zc + 0.14)], '#f6e23a')
    for i in range(5): vc().cbox(3.3 + i * 0.1, 3.38 + i * 0.1, 2.0, 2.45, 3.25, 3.27, ('#f09ab0', '#f4f4f0')[i % 2])   # 冷藏櫃旁掛著的一疊粉紅條紋塑膠袋


# ---------- 榮恩典文具社 ----------
if SHOP == 'rongendian':
    PW, AW_, CT, CR = J['penWall'], J['artWall'], J['counter'], J['cart']
    PENS = ['#1f2a48', '#b8262b', '#2b4f8c', '#1d1f22', '#e8c23a', '#2f8a5a', '#e87a2a', '#8a4aa8', '#f4f4f0']; NOTE = [['#d9c9a8', '#8fb8d8', '#2f3338', '#f4f1e8', '#c9a878'], ['#e8a8b8', '#f4e6a0', '#a8c8e8', '#f4f4f0'], ['#2b4f8c', '#7a2a2a', '#d9c9a8', '#3a5a4a'], ['#f4f1e8', '#e8e0c8', '#c9c4b8']]
    # 左牆：整面筆（一層一層壓克力格，每一格一把同色的筆）；下面抽屜櫃
    mesh('wood').box(PW['x0'], PW['x1'], 0.0, 0.7, PW['z0'], PW['z1']); vc().cbox(PW['x0'], PW['x0'] + 0.03, 0.7, PW['h'], PW['z0'], PW['z1'], '#f4f1e4')
    for j in range(7):
        y = 0.75 + j * 0.25; vc().cbox(PW['x0'], PW['x1'] - 0.1, y - 0.015, y, PW['z0'], PW['z1'], '#e8e4d8')
        zz = PW['z0'] + 0.05
        while zz < PW['z1'] - 0.12:
            col = RR.choice(PENS)
            for k in range(4): ccyl(vc(), (PW['x0'] + 0.1 + k * 0.06, y, zz + 0.04), (PW['x0'] + 0.16 + k * 0.06, y + 0.17, zz + 0.04), 0.008, col, seg=4)
            vc().cbox(PW['x0'] + 0.06, PW['x1'] - 0.12, y, y + 0.06, zz, zz + 0.09, '#eef2f2'); zz += 0.105
    # 右牆：畫材（畫筆筒、顏料瓶、調色盤、素描本）
    mesh('wood').box(AW_['x0'], AW_['x1'], 0.0, 0.75, AW_['z0'], AW_['z1'])
    for j, y in enumerate((0.75, 1.2, 1.65, 2.1)):
        mesh('wood').box(AW_['x0'], AW_['x1'], y - 0.03, y, AW_['z0'], AW_['z1'])
        if j == 0: goods(AW_['x0'] + 0.03, AW_['x1'], y, AW_['z0'] + 0.05, AW_['z1'] - 0.05, NOTE[0], hmin=0.22, hmax=0.34, step=0.06)
        elif j == 1:
            for i in range(12): zc = AW_['z0'] + 0.2 + i * (AW_['z1'] - AW_['z0'] - 0.4) / 11; ccyl(vc(), (AW_['x0'] + 0.25, y, zc), (AW_['x0'] + 0.25, y + 0.12, zc), 0.05, '#3a2a20', seg=8); [ccyl(vc(), (AW_['x0'] + 0.25 + (k - 1.5) * 0.02, y + 0.1, zc + (k % 2 - 0.5) * 0.03), (AW_['x0'] + 0.25 + (k - 1.5) * 0.04, y + 0.32, zc + (k % 2 - 0.5) * 0.05), 0.006, ('#c9a878', '#1d1f22', '#b8262b', '#2b4f8c')[k], seg=4) for k in range(4)]
        elif j == 2:
            for i in range(26): zc = AW_['z0'] + 0.12 + i * (AW_['z1'] - AW_['z0'] - 0.24) / 25; ccyl(vc(), (AW_['x0'] + 0.25, y, zc), (AW_['x0'] + 0.25, y + 0.2, zc), 0.035, ('#f4f4f0', '#e8c23a', '#b8262b', '#2b4f8c', '#1d1f22', '#2f8a5a', '#e87a2a')[i % 7], seg=8); ccyl(vc(), (AW_['x0'] + 0.25, y + 0.2, zc), (AW_['x0'] + 0.25, y + 0.25, zc), 0.018, '#f4f4f0', seg=6)
        else:
            for i in range(6): zc = AW_['z0'] + 0.4 + i * (AW_['z1'] - AW_['z0'] - 0.8) / 5; ccyl(vc(), (AW_['x0'] + 0.3, y + 0.16, zc), (AW_['x0'] + 0.33, y + 0.17, zc), 0.15, '#f6f4ee', seg=14)
    # 中間兩座木層架：筆記本、筆袋、膠帶
    for g in J['gondolas']: gondola(g, NOTE, style='wood', levels=(0.2, 0.6, 1.0, 1.36))
    # 後方木櫃台：收銀機、檯燈、筆筒；後牆層架、紙捲、小十字架、植物
    mesh('wood').box(CT['x0'], CT['x1'], 0.0, CT['h'] - 0.04, CT['z0'], CT['z1']); mesh('wood_d').rbox(CT['x0'] - 0.03, CT['x1'] + 0.03, CT['h'] - 0.04, CT['h'], CT['z0'] - 0.02, CT['z1'] + 0.04, r=0.012, seg=2)
    for i in range(18): xx = CT['x0'] + 0.06 + i * (CT['x1'] - CT['x0'] - 0.12) / 17; vc().cbox(xx - 0.012, xx + 0.012, 0.06, CT['h'] - 0.06, CT['z1'], CT['z1'] + 0.012, '#7a5636')
    vc().crbox(-0.6, -0.15, CT['h'], CT['h'] + 0.16, CT['z0'] + 0.1, CT['z0'] + 0.45, '#2a2d31', r=0.01); vc().cbox(-0.55, -0.2, CT['h'] + 0.16, CT['h'] + 0.42, CT['z0'] + 0.12, CT['z0'] + 0.16, '#1f2023')
    ccyl(vm(), (-1.25, CT['h'], CT['z0'] + 0.3), (-1.25, CT['h'] + 0.32, CT['z0'] + 0.3), 0.012, '#b8a04a', seg=6); ccyl(vc(), (-1.25, CT['h'] + 0.3, CT['z0'] + 0.3), (-1.25, CT['h'] + 0.48, CT['z0'] + 0.3), 0.13, '#f4e6c0', seg=12, r2=0.07, caps=False); mesh('light').sphere((-1.25, CT['h'] + 0.34, CT['z0'] + 0.3), 0.04, seg=6, rings=4)
    ccyl(vc(), (0.5, CT['h'], CT['z1'] - 0.2), (0.5, CT['h'] + 0.11, CT['z1'] - 0.2), 0.045, '#3a2a20', seg=8)
    zb = -D / 2; mesh('wood').box(0.4, 4.0, 0.0, 0.03, zb, zb + 0.4)
    for y in (0.9, 1.4, 1.9): mesh('wood').box(0.4, 4.0, y - 0.03, y, zb, zb + 0.4); goods(0.45, 3.95, y, zb + 0.05, zb + 0.36, ['#c9a878', '#e8e0c8', '#d9c9a8', '#f4f1e8', '#b8946a'], hmin=0.14, hmax=0.32, along='x', step=0.2)
    for i in range(6): ccyl(vc(), (0.6 + i * 0.12, 0.03, zb + 0.2), (0.6 + i * 0.12, 0.8, zb + 0.2), 0.045, '#d9c9a8', seg=8)
    vc().cbox(-2.2, -2.16, 1.7, 2.0, zb + 0.004, zb + 0.02, '#6a4a2a'); vc().cbox(-2.29, -2.07, 1.87, 1.91, zb + 0.004, zb + 0.02, '#6a4a2a')                   # 小十字架（規格：小、低調）
    vc().cbox(-1.8, -1.5, 1.55, 1.95, zb + 0.004, zb + 0.014, '#f4f1e4')
    mesh('wood').box(-1.4, -0.2, 2.1, 2.13, zb, zb + 0.25); clathe(vc(), [(0.0, 0.0), (0.09, 0.0), (0.11, 0.16), (0.0, 0.16)], -0.8, 2.13, zb + 0.13, '#b8603a', seg=10); fern(-0.8, 2.3, zb + 0.14, r=0.26, n=12, hang=True)
    # 門口左邊：特價推車（鐵網推車＋筆記本、黃底紅字的「特價」牌是色塊）；右前方木畫架、靠牆的畫布
    x, z = CR['x'], CR['z']
    for sx in (-1, 1):
        for sz in (-1, 1): ccyl(vm(), (x + sx * (CR['w'] / 2 - 0.04), 0.06, z + sz * (CR['d'] / 2 - 0.04)), (x + sx * (CR['w'] / 2 - 0.04), 0.95, z + sz * (CR['d'] / 2 - 0.04)), 0.012, '#d8dadc', seg=6); ccyl(vc(), (x + sx * (CR['w'] / 2 - 0.04), 0.0, z + sz * (CR['d'] / 2 - 0.04)), (x + sx * (CR['w'] / 2 - 0.04), 0.07, z + sz * (CR['d'] / 2 - 0.04)), 0.035, '#2a2d31', seg=8)
    for y in (0.3, 0.75): vm().cbox(x - CR['w'] / 2, x + CR['w'] / 2, y, y + 0.015, z - CR['d'] / 2, z + CR['d'] / 2, '#d8dadc'); goods(x - CR['w'] / 2 + 0.04, x + CR['w'] / 2 - 0.04, y + 0.015, z - CR['d'] / 2 + 0.04, z + CR['d'] / 2 - 0.04, NOTE[0] + NOTE[1], hmin=0.04, hmax=0.14, along='x', step=0.19)
    vc().poly([(x - 0.45, 0.2, z + CR['d'] / 2 + 0.02), (x + 0.45, 0.2, z + CR['d'] / 2 + 0.02), (x + 0.45, 0.62, z + CR['d'] / 2 + 0.08), (x - 0.45, 0.62, z + CR['d'] / 2 + 0.08)], '#f2c230'); vc().poly([(x - 0.3, 0.28, z + CR['d'] / 2 + 0.036), (x + 0.3, 0.28, z + CR['d'] / 2 + 0.036), (x + 0.3, 0.54, z + CR['d'] / 2 + 0.074), (x - 0.3, 0.54, z + CR['d'] / 2 + 0.074)], '#c9302a')
    for (ex, ez) in J['easels']:
        for sx in (-0.22, 0.22): ccyl(vc(), (ex + sx, 0.0, ez + 0.12), (ex + sx * 0.3, 1.65, ez - 0.1), 0.02, '#c9a878', seg=6)
        ccyl(vc(), (ex, 0.0, ez - 0.35), (ex, 1.6, ez - 0.1), 0.02, '#c9a878', seg=6); vc().cbox(ex - 0.28, ex + 0.28, 0.62, 0.66, ez - 0.02, ez + 0.08, '#c9a878'); vc().poly([(ex - 0.26, 0.66, ez + 0.05), (ex + 0.26, 0.66, ez + 0.05), (ex + 0.26, 1.36, ez - 0.07), (ex - 0.26, 1.36, ez - 0.07)], '#f6f4ee')
    CV = J['canvases']
    for i in range(5): vc().poly([(CV['x0'] + i * 0.05, 0.0, CV['z0']), (CV['x0'] + i * 0.05, 0.0, CV['z1']), (CV['x1'] - 0.1 + i * 0.03, 1.0 - i * 0.08, CV['z1']), (CV['x1'] - 0.1 + i * 0.03, 1.0 - i * 0.08, CV['z0'])][::-1], ('#f6f4ee', '#ece8dc')[i % 2])
    # 天花板：格柵、日光燈、吊扇
    tubes((-3.4, -1.0, 1.4, 3.6), x0=-2.2, x1=2.2); ccyl(vc(), (0.6, H - 0.3, -0.6), (0.6, H, -0.6), 0.03, '#b8a888', seg=8); ccyl(vc(), (0.6, H - 0.36, -0.6), (0.6, H - 0.28, -0.6), 0.12, '#c9b898', seg=12)
    for k in range(4): a = k * PI / 2 + 0.3; vc().poly([(0.6 + math.cos(a) * 0.12 - math.sin(a) * 0.07, H - 0.33, -0.6 + math.sin(a) * 0.12 + math.cos(a) * 0.07), (0.6 + math.cos(a) * 0.75 - math.sin(a) * 0.09, H - 0.33, -0.6 + math.sin(a) * 0.75 + math.cos(a) * 0.09), (0.6 + math.cos(a) * 0.75 + math.sin(a) * 0.09, H - 0.33, -0.6 + math.sin(a) * 0.75 - math.cos(a) * 0.09), (0.6 + math.cos(a) * 0.12 + math.sin(a) * 0.07, H - 0.33, -0.6 + math.sin(a) * 0.12 - math.cos(a) * 0.07)], '#8a6a48')


# ---------- 禮貌生財（X332）：前半命理館＋後半書房（STUDY_*，平常不顯示） ----------
if SHOP == 'limao':
    BC, CB, TE, PT, SD = J['bookcase'], J['cabinet'], J['tea'], J['partition'], J['study']; DK = '#3a2416'
    OLD = ['#7a2a26', '#2f4a6a', '#c9b890', '#3a5a44', '#8a6a3a', '#d9cdb0', '#4a3426', '#a8873a', '#e8dcc0']      # 命理書、線裝書
    LAW = ['#1f2f5a', '#6a1a22', '#1d1f22', '#2f4a3a', '#c9b890', '#8a8f98', '#3a2a5a', '#1f2f5a', '#7a2a26']      # 刑法教科書、德文書、舊法典、期刊合訂本
    def bookcase(x0, x1, z0, z1, h, cols, side, base=0.8, gap=0.42):
        """深色木書櫃（side：'W'／'E' 靠東西牆沿 z 排、'N' 靠北牆沿 x 排）；base 以下是木門櫃"""
        wd = mesh('wood_d'); wd.box(x0, x1, 0.0, base, z0, z1); wd.box(x0, x1, h - 0.06, h, z0, z1)
        if side == 'N': wd.box(x0, x1, base, h, z0, z0 + 0.03)
        else: wd.box(*( (x0, x0 + 0.03) if side == 'W' else (x1 - 0.03, x1) ), base, h, z0, z1)
        a0, a1 = (x0, x1) if side == 'N' else (z0, z1); n = max(1, round((a1 - a0) / 0.95))
        for i in range(n + 1):
            a = a0 + i * (a1 - a0) / n
            if side == 'N': wd.box(max(x0, a - 0.02), min(x1, a + 0.02), base, h, z0, z1)
            else: wd.box(x0, x1, base, h, max(z0, a - 0.02), min(z1, a + 0.02))
        if base > 0.3:   # 下面木門櫃的門縫、銅把手
            for i in range(n):
                a = a0 + (i + 0.5) * (a1 - a0) / n
                if side == 'N': vc().cbox(a - 0.005, a + 0.005, 0.08, base - 0.06, z1, z1 + 0.004, '#2a180e'); ccyl(vm(), (a + 0.05, base * 0.55, z1), (a + 0.05, base * 0.55, z1 + 0.03), 0.012, '#b8923a', seg=6)
                else: xx = x1 if side == 'W' else x0; sg = 1 if side == 'W' else -1; vc().cbox(min(xx, xx + sg * 0.004), max(xx, xx + sg * 0.004), 0.08, base - 0.06, a - 0.005, a + 0.005, '#2a180e'); ccyl(vm(), (xx, base * 0.55, a + 0.05), (xx + sg * 0.03, base * 0.55, a + 0.05), 0.012, '#b8923a', seg=6)
        y = base
        while y + gap < h - 0.02:
            wd.box(x0, x1, y - 0.025, y, z0, z1)
            if side == 'N': goods(x0 + 0.04, x1 - 0.04, y, z0 + 0.05, z1 - 0.08, cols, hmin=0.24, hmax=gap - 0.07, along='x', step=0.058)
            elif side == 'W': goods(x0 + 0.05, x1 - 0.08, y, z0 + 0.04, z1 - 0.04, cols, hmin=0.24, hmax=gap - 0.07, along='z', step=0.058)
            else: goods(x0 + 0.08, x1 - 0.05, y, z0 + 0.04, z1 - 0.04, cols, hmin=0.24, hmax=gap - 0.07, along='z', step=0.058)
            y += gap
    def lantern(x, z, y=2.25, r=0.2):
        ccyl(vc(), (x, y + r + 0.03, z), (x, H, z), 0.006, '#2b2b2b', seg=4); mesh('light').sphere((x, y, z), r, seg=12, rings=8, sy=0.85)
        for yy in (y + r * 0.85 - 0.02, y - r * 0.85 - 0.01): ccyl(vc(), (x, yy, z), (x, yy + 0.03, z), r * 0.42, DK, seg=10)
    def pot(x, z, r=0.17, h=0.36, col='#3f5f8a'):
        clathe(vc(), [(0.0, 0.0), (r * 0.75, 0.0), (r, h * 0.7), (r * 0.9, h), (0.0, h)], x, 0.0, z, col, seg=10); fern(x, h + 0.12, z, r=0.3, n=16)
    # ----- 前半：命理館 -----
    bookcase(BC['x0'], BC['x1'], BC['z0'], BC['z1'], BC['h'], OLD, 'W')
    for (yy, zz) in ((BC['h'], 0.2), (BC['h'], 2.4)): ccyl(vc(), (BC['x0'] + 0.22, yy, zz), (BC['x0'] + 0.22, yy + 0.2, zz), 0.07, '#8a5a2a', seg=8)       # 櫃頂的籤筒、小罐
    for i in range(6): ccyl(vc(), (BC['x0'] + 0.2 + (i % 2) * 0.03, BC['h'] + 0.18, 0.18 + i * 0.012), (BC['x0'] + 0.2 + (i % 3) * 0.03, BC['h'] + 0.36, 0.14 + i * 0.03), 0.005, '#d9b87a', seg=4)
    # 東牆：玻璃門木櫃（茶具、小擺設）
    wd = mesh('wood_d'); wd.box(CB['x0'], CB['x1'], 0.0, 0.8, CB['z0'], CB['z1']); wd.box(CB['x0'], CB['x1'], CB['h'] - 0.06, CB['h'], CB['z0'], CB['z1']); wd.box(CB['x1'] - 0.03, CB['x1'], 0.8, CB['h'], CB['z0'], CB['z1'])
    for zz in (CB['z0'], (CB['z0'] + CB['z1']) / 2 - 0.02, CB['z1'] - 0.04): wd.box(CB['x0'], CB['x1'], 0.8, CB['h'], zz, zz + 0.04)
    mesh('glass').quad([(CB['x0'] + 0.01, 0.82, CB['z1']), (CB['x0'] + 0.01, 0.82, CB['z0']), (CB['x0'] + 0.01, CB['h'] - 0.08, CB['z0']), (CB['x0'] + 0.01, CB['h'] - 0.08, CB['z1'])])
    for j, y in enumerate((0.82, 1.25, 1.68)):
        wd.box(CB['x0'], CB['x1'], y - 0.02, y, CB['z0'], CB['z1'])
        for i in range(7):
            zz = CB['z0'] + 0.18 + i * (CB['z1'] - CB['z0'] - 0.36) / 6
            if (i + j) % 3 == 0: blob(CB['x0'] + 0.22, y + 0.07, zz, 0.07, ('#f4f0e4', '#7a4a2a', '#3f5f8a')[j], sy=0.8)
            elif (i + j) % 3 == 1: ccyl(vc(), (CB['x0'] + 0.22, y, zz), (CB['x0'] + 0.22, y + 0.06, zz), 0.035, '#f4f0e4', seg=8, r2=0.045)
            else: ccyl(vc(), (CB['x0'] + 0.22, y, zz), (CB['x0'] + 0.22, y + 0.2, zz), 0.04, ('#2f4a3a', '#8a5a2a', '#c9b890')[j], seg=8, r2=0.025)
    # 圓茶桌、三張木椅、茶壺茶杯
    x, z = TE['x'], TE['z']; ccyl(mesh('wood_d', False) and vc(), (x, TE['h'] - 0.04, z), (x, TE['h'], z), TE['r'], DK, seg=24); ccyl(vc(), (x, 0.04, z), (x, TE['h'] - 0.04, z), 0.06, DK, seg=10); ccyl(vc(), (x, 0.0, z), (x, 0.04, z), 0.3, DK, seg=14)
    blob(x, TE['h'] + 0.07, z, 0.08, '#f4f0e4', sy=0.85); ccyl(vc(), (x + 0.07, TE['h'] + 0.07, z), (x + 0.15, TE['h'] + 0.11, z), 0.012, '#f4f0e4', seg=6); ccyl(vc(), (x, TE['h'] + 0.13, z), (x, TE['h'] + 0.15, z), 0.02, '#f4f0e4', seg=6)
    for (cx, cz) in ((0.22, 0.12), (-0.2, 0.18), (0.02, -0.26)): ccyl(vc(), (x + cx, TE['h'], z + cz), (x + cx, TE['h'] + 0.006, z + cz), 0.05, '#f4f0e4', seg=10); ccyl(vc(), (x + cx, TE['h'] + 0.006, z + cz), (x + cx, TE['h'] + 0.05, z + cz), 0.025, '#f4f0e4', seg=8, r2=0.035)
    ccyl(vc(), (x - 0.25, TE['h'], z - 0.2), (x - 0.25, TE['h'] + 0.012, z - 0.2), 0.14, '#5a3a22', seg=14)                                                     # 茶盤
    for q in J['seats']: chair(q['x'], q['z'], q['yaw'], wood=DK, pad='#4a2f1e')
    lantern(x, z, y=2.2, r=0.21); lantern(0.9, 3.4, y=2.3, r=0.17)
    pot(-1.95, 4.2, col='#3f5f8a'); pot(1.95, -0.75, col='#7a4a2a')
    # 隔牆（到天花板）和書房的門框；牆上的山水掛畫、書法掛軸（東牆）
    # PART_*：隔牆、門框、掛在隔牆上的掛畫——鏡頭和玩家在隔牆兩邊時遊戲整組藏起來（LM-PART-CAM-1111，BB 11-11 01:47：玩家站在掛畫前、鏡頭退到鎖著的書房裡，整個畫面是隔牆背面的米色）
    PRE = 'PART:'
    zp = PT['z']; d0, d1 = PT['door']; pw = mesh('wall'); pw.box(PT['x0'], d0, 0, H, zp - 0.06, zp + 0.06); pw.box(d1, PT['x1'], 0, H, zp - 0.06, zp + 0.06); pw.box(d0, d1, 2.1, H, zp - 0.06, zp + 0.06)
    for xx in (d0, d1): vc().cbox(xx - 0.05, xx + 0.05, 0, 2.1, zp - 0.08, zp + 0.08, DK)
    vc().cbox(d0 - 0.05, d1 + 0.05, 2.1, 2.18, zp - 0.08, zp + 0.08, DK)
    px0, px1, py0, py1, pz = -1.45, -0.15, 1.15, 2.05, zp + 0.062                                                                                               # 山水掛畫（色塊：遠山、近山、留白）
    vc().cbox(px0 - 0.04, px1 + 0.04, py0 - 0.04, py1 + 0.04, pz, pz + 0.02, DK); vc().poly([(px0, py0, pz + 0.022), (px1, py0, pz + 0.022), (px1, py1, pz + 0.022), (px0, py1, pz + 0.022)], '#e8dfc8')
    for (ax, bx, cx, ty, col) in ((px0 + 0.1, px0 + 0.75, px0 + 0.4, py1 - 0.2, '#a8a898'), (px0 + 0.45, px1 - 0.05, px0 + 0.9, py1 - 0.32, '#8a8c80'), (px0, px0 + 0.6, px0 + 0.22, py0 + 0.42, '#5a5e54'), (px0 + 0.5, px1, px1 - 0.3, py0 + 0.36, '#6a6e62')):
        vc().poly([(ax, py0 + 0.08, pz + 0.024), (bx, py0 + 0.08, pz + 0.024), (cx, ty, pz + 0.024)], col)
    PRE = ''
    xe = W / 2 - 0.012                                                                                                                                         # 書法掛軸（東牆，門邊）：米白紙、幾筆墨
    vc().poly([(xe, 0.95, 3.75), (xe, 0.95, 3.25), (xe, 2.35, 3.25), (xe, 2.35, 3.75)], '#efe6d0'); vc().cbox(xe - 0.02, xe, 2.35, 2.39, 3.2, 3.8, DK); vc().cbox(xe - 0.02, xe, 0.91, 0.95, 3.2, 3.8, DK)
    for i in range(5): vc().poly([(xe - 0.004, 2.12 - i * 0.24, 3.6 - (i % 2) * 0.05), (xe - 0.004, 2.12 - i * 0.24, 3.42 + (i % 2) * 0.04), (xe - 0.004, 2.28 - i * 0.24, 3.4 + (i % 3) * 0.03), (xe - 0.004, 2.28 - i * 0.24, 3.58)], '#1d1f22')
    # ----- 書房的門（關著；解鎖以後不顯示）、蓋子（從上面看是深色的屋頂；解鎖以後不顯示） -----
    PRE = 'STUDY_DOOR:'
    mesh('wood_d').box(d0 + 0.05, d1 - 0.05, 0.0, 2.1, zp - 0.025, zp + 0.025)
    for (a_, b_, y0, y1) in ((d0 + 0.15, d1 - 0.15, 0.2, 0.95), (d0 + 0.15, d1 - 0.15, 1.1, 1.95)): vc().cbox(a_, b_, y0, y1, zp + 0.025, zp + 0.035, '#33200f')
    ccyl(vm(), (d0 + 0.14, 1.02, zp + 0.025), (d0 + 0.14, 1.02, zp + 0.08), 0.025, '#b8923a', seg=8)
    PRE = 'STUDY_LID:'
    vc().cbox(SD['x0'] - T, SD['x1'] + T, H + 0.1, H + 0.2, SD['z0'] - T, SD['z1'] + 0.06, '#2a2622')
    # ----- 後半：私人書房 -----
    PRE = 'STUDY:'
    bookcase(-W / 2, -W / 2 + 0.45, SD['z0'] + 0.5, SD['z1'] - 0.1, 2.8, LAW, 'W', base=0.12, gap=0.38)
    bookcase(-W / 2, W / 2, SD['z0'], SD['z0'] + 0.45, 2.8, LAW, 'N', base=0.12, gap=0.38)
    dx, dz = SD['seat']['x'], SD['blocks'][2][1]                                                                                                                                         # 老式木書桌（面向門）
    mesh('wood_d').rbox(dx - 0.75, dx + 0.75, 0.72, 0.77, dz - 0.4, dz + 0.4, r=0.012, seg=2)
    for sx in (-1, 1): mesh('wood_d').box(dx + sx * 0.72 - (0.38 if sx > 0 else 0.0), dx + sx * 0.72 + (0.38 if sx < 0 else 0.0), 0.0, 0.72, dz - 0.36, dz + 0.36)
    for sx in (-1, 1):
        for y in (0.2, 0.45): cx = dx + sx * 0.53; vc().cbox(cx - 0.16, cx + 0.16, y - 0.1, y + 0.1, dz - 0.37, dz - 0.36, '#2f1c10'); ccyl(vm(), (cx, y, dz - 0.37), (cx, y, dz - 0.39), 0.015, '#b8923a', seg=6)
    chair(SD['seat']['x'], SD['seat']['z'], SD['seat']['yaw'], wood=DK, pad='#4a2a22')
    ccyl(vm(), (dx - 0.55, 0.77, dz - 0.2), (dx - 0.55, 0.79, dz - 0.2), 0.08, '#b8923a', seg=10); ccyl(vm(), (dx - 0.55, 0.79, dz - 0.2), (dx - 0.55, 1.08, dz - 0.2), 0.01, '#b8923a', seg=6)     # 綠罩銀行燈
    vc().crbox(dx - 0.72, dx - 0.38, 1.06, 1.14, dz - 0.27, dz - 0.13, '#2f6a4a', r=0.03); mesh('light').box(dx - 0.68, dx - 0.42, 1.045, 1.06, dz - 0.25, dz - 0.15)
    for i, (px, pz, n) in enumerate(((dx + 0.45, dz - 0.15, 6), (dx + 0.5, dz + 0.2, 3), (dx - 0.1, dz + 0.22, 9))):                                             # 手稿、舊講義（一疊一疊泛黃的紙）
        for k in range(n): vc().cbox(px - 0.11 + (k % 2) * 0.008, px + 0.11 + (k % 3) * 0.006, 0.77 + k * 0.012, 0.782 + k * 0.012, pz - 0.15, pz + 0.15, ('#efe6cc', '#e6dab8', '#f4eedc')[k % 3])
    vc().cbox(dx - 0.2, dx + 0.2, 0.77, 0.79, dz - 0.3, dz - 0.02, '#e8e0c8'); vc().cbox(dx - 0.005, dx + 0.005, 0.77, 0.795, dz - 0.3, dz - 0.02, '#8a7a5a')     # 攤開的書
    ccyl(vc(), (dx + 0.12, 0.795, dz - 0.25), (dx + 0.26, 0.8, dz - 0.1), 0.006, '#1d1f22', seg=5)                                                                # 鋼筆
    for sx in (-0.035, 0.035): ccyl(vm(), (dx - 0.3 + sx, 0.772, dz + 0.05), (dx - 0.3 + sx, 0.776, dz + 0.05), 0.028, '#3a3a3c', seg=10)                          # 眼鏡
    for i in range(3): vc().cbox(dx + 0.2 + i * 0.01, dx + 0.28 + i * 0.01, 0.77 + i * 0.002, 0.772 + i * 0.002, dz - 0.36 + i * 0.01, dz - 0.28 + i * 0.01, '#f2d85a')   # 便條紙
    vc().cbox(-0.9, 1.9, 0.0, 0.012, -4.3, -2.0, '#5a2a2a'); vc().cbox(-0.8, 1.8, 0.012, 0.014, -4.2, -2.1, '#6a3a30')                                              # 舊地毯
    # 東牆：矮櫃（舊講義、學生來信的木盒、私人紀念物）、學術合照、獎狀
    lx0, lx1, lz0, lz1 = 1.75, 2.3, -2.4, -1.5; mesh('wood_d').box(lx0, lx1, 0.0, 0.8, lz0, lz1)
    for k in range(10): vc().cbox(lx0 + 0.08, lx0 + 0.34, 0.8 + k * 0.014, 0.814 + k * 0.014, lz0 + 0.06 + (k % 2) * 0.01, lz0 + 0.34, ('#e6dab8', '#efe6cc', '#d9cca8')[k % 3])
    vc().crbox(lx0 + 0.08, lx0 + 0.42, 0.8, 0.94, lz1 - 0.4, lz1 - 0.08, '#7a5636', r=0.01)
    for k in range(5): vc().cbox(lx0 + 0.11 + k * 0.05, lx0 + 0.13 + k * 0.05, 0.9, 0.98, lz1 - 0.37, lz1 - 0.11, ('#f4eedc', '#e8dcc0', '#dfe6ee')[k % 3])               # 信
    blob(lx0 + 0.25, 0.86, -1.95, 0.05, '#b8923a'); ccyl(vc(), (lx0 + 0.25, 0.8, -1.95), (lx0 + 0.25, 0.82, -1.95), 0.06, DK, seg=8)                                    # 小獎座
    xe = W / 2 - 0.012; fz0, fz1 = -3.75, -2.95                                                                                                                      # 學術合照：深色框、泛黃的照片、兩排人影
    vc().cbox(xe - 0.02, xe, 1.38, 1.98, fz0 - 0.04, fz1 + 0.04, DK); vc().poly([(xe - 0.022, 1.42, fz1), (xe - 0.022, 1.42, fz0), (xe - 0.022, 1.94, fz0), (xe - 0.022, 1.94, fz1)], '#d9cfb4')
    for r_ in range(2):
        for i in range(7 - r_): zz = fz0 + 0.1 + r_ * 0.05 + i * 0.1; vc().poly([(xe - 0.024, 1.47 + r_ * 0.16, zz + 0.07), (xe - 0.024, 1.47 + r_ * 0.16, zz), (xe - 0.024, 1.62 + r_ * 0.16, zz), (xe - 0.024, 1.62 + r_ * 0.16, zz + 0.07)], ('#3a3a40', '#4a4a50', '#2f3338')[(i + r_) % 3])
    for (a_, b_) in ((-4.35, -4.0), (-2.75, -2.45)): vc().cbox(xe - 0.02, xe, 1.5, 1.95, a_ - 0.03, b_ + 0.03, DK); vc().poly([(xe - 0.022, 1.53, b_), (xe - 0.022, 1.53, a_), (xe - 0.022, 1.92, a_), (xe - 0.022, 1.92, b_)], '#efe8d4')
    for zz in (-4.55,): ccyl(vm(), (xe, 2.2, zz), (xe - 0.12, 2.2, zz), 0.012, '#b8923a', seg=6); mesh('light').sphere((xe - 0.14, 2.18, zz), 0.07, seg=8, rings=5)
    lantern(0.3, -3.0, y=2.35, r=0.16)
    for i, (px, pz, n) in enumerate(((-1.55, -1.75, 14), (-1.3, -1.6, 8), (1.4, -4.35, 11))):                                                                         # 地上的書堆
        for k in range(n): vc().cbox(px - 0.12 + (k % 3) * 0.01, px + 0.12 - (k % 2) * 0.012, k * 0.035, k * 0.035 + 0.033, pz - 0.16 + (k % 2) * 0.012, pz + 0.16, LAW[(k * 2 + i) % len(LAW)])
    PRE = ''


# ---------- 越好吃小館（TINGZHOU-SHOPS5-1110；LAWWW2-C 2026-11-12）----------
# 使用者只給外觀概念圖（深木框玻璃、藤編吊燈、木桌椅、照片菜單、大盆栽）；室內是照外觀看進去的樣子設計的越南河粉小館
if SHOP == 'yuehaochi':
    CT = J['counter']; KT = J['kitchen']; PT = J['partition']; DC = J['decor']; HB = J['herbBar']; FG = J['fridge']
    WD, WD2, TEAL, RED = '#3a2416', '#5a3a22', '#2f6f6a', '#8a2a2a'
    if CC0:   # SHOP-REALISM-1112（LAWWW2-C 11-13）：深木條 → 深色木頭、櫃台正面的竹條和斗笠 → 藤編（Wicker010A）、外帶紙袋 → 紙箱、黑鐵 → 黑鐵、廚房磁磚 → 白磁磚、螢幕 → 深色塑膠；
        #   椅子共用 chair()（CC0 已是 Poly Haven 梯背椅＋皮墊）；落地盆栽 → Poly Haven potted_plant_01、窗台小盆 → Poly Haven fern_02；燈籠、藍染布、香草照舊頂點色
        ROUTE = {'#2b2018': 'wood_d', '#3a2416': 'wood_d', '#5a3a22': 'wood_d', '#c9a45a': 'wicker', '#b8903f': 'wicker', '#d9b872': 'wicker', '#e6d3a0': 'wicker', '#c9b278': 'wicker',
                 '#c9a878': 'cardboard', '#b8946a': 'cardboard', '#2b2b2b': 'blackmetal', '#3a3a3c': 'blackmetal', '#eef0ee': 'tile_w', '#1f2023': 'plastic_dk', '#6a6d70': 'steel', '#8a8d90': 'steel'}
        _vc0 = vc; vc = lambda: _Route(_vc0(), ROUTE); vm = lambda: _AsTex(mesh('steel'))
    RRV = random.Random(41); PQ = []; PKUV = {}; SILK = {}   # v2：自己的亂數、飲料標籤印刷面、燈籠的絲布材質
    def pkq(kd, lb, rb, rt, lt_, i=None):
        L_ = PKUV[kd]; PQ.append((L_[RRV.randrange(len(L_)) if i is None else i % len(L_)], [g2b(*p_) for p_ in (lb, rb, rt, lt_)]))
    if CC0:   # v2（BB 607f3fef2a：冰箱玻璃門退成灰鐵箱、燈籠是光滑的實心球、斗笠是扁圓盤）：
        #   飲料標籤貼圖集（罐子 8 款、瓶子 8 款；自己畫的，不寫字、不像任何牌子，D77）；燈籠用 ambientCG 細紋布（Fabric036）照燈籠顏色上色＝絲布
        from PIL import ImageDraw
        _R = random.Random(9); CW, CH = 64, 128; at = Image.new('RGB', (CW * 8, CH * 2), (240, 240, 240))
        DCOL = [(30, 90, 62), (216, 54, 42), (240, 190, 40), (40, 60, 110), (245, 240, 225), (120, 70, 40), (60, 150, 200), (232, 106, 28)]
        for c_ in range(8):   # 罐子：整圈標籤
            bg = DCOL[c_]; cell = Image.new('RGB', (CW, CH), bg); d = ImageDraw.Draw(cell); acc = DCOL[(c_ * 3 + 2) % 8]; lt = tuple(min(255, v + 90) for v in bg)
            d.rectangle([0, 0, CW, CH * 0.07], fill=(200, 202, 206)); d.rectangle([0, CH * 0.93, CW, CH], fill=(200, 202, 206))
            st = c_ % 4
            if st == 0: d.ellipse([CW * 0.15, CH * 0.35, CW * 0.85, CH * 0.7], fill=acc)
            elif st == 1:
                for k in range(3): d.rectangle([0, CH * (0.3 + k * 0.12), CW, CH * (0.35 + k * 0.12)], fill=acc)
            elif st == 2: d.polygon([(0, CH * 0.75), (CW, CH * 0.45), (CW, CH * 0.6), (0, CH * 0.9)], fill=acc)
            else: d.ellipse([CW * 0.25, CH * 0.4, CW * 0.75, CH * 0.62], fill=(250, 250, 245)); d.ellipse([CW * 0.35, CH * 0.45, CW * 0.65, CH * 0.57], fill=acc)
            for k in range(2): w_ = _R.uniform(0.3, 0.6); d.rectangle([CW * 0.15, CH * (0.15 + k * 0.07), CW * (0.15 + w_), CH * (0.19 + k * 0.07)], fill=lt)
            d.line([CW * 0.2, CH * 0.08, CW * 0.2, CH * 0.92], fill=tuple(min(255, v + 70) for v in bg), width=3)   # 鋁罐的一道反光
            at.paste(cell, (c_ * CW, 0)); PKUV.setdefault('can', []).append([c_ / 8, 0.5, (c_ + 1) / 8, 1.0])
        for c_ in range(8):   # 瓶子：腰上一圈標籤
            bg = DCOL[(c_ * 5 + 1) % 8]; cell = Image.new('RGB', (CW, CH), bg); d = ImageDraw.Draw(cell); acc = DCOL[(c_ * 3 + 5) % 8]
            d.rectangle([0, 0, CW, CH * 0.12], fill=acc); d.rectangle([0, CH * 0.88, CW, CH], fill=acc)
            d.ellipse([CW * 0.2, CH * 0.3, CW * 0.8, CH * 0.62], fill=(250, 248, 240)); d.ellipse([CW * 0.32, CH * 0.38, CW * 0.68, CH * 0.55], fill=acc)
            for k in range(2): w_ = _R.uniform(0.3, 0.6); d.rectangle([CW * 0.2, CH * (0.7 + k * 0.07), CW * (0.2 + w_), CH * (0.74 + k * 0.07)], fill=(250, 250, 250))
            at.paste(cell, (c_ * CW, CH)); PKUV.setdefault('blab', []).append([c_ / 8, 0.0, (c_ + 1) / 8, 0.5])
        _pk = os.path.join(STAGE, 'tz_yuehaochi_packs.png'); at.save(_pk)
        _m = bpy.data.materials.new('tzs_yuehaochi_packs'); _m.use_nodes = True; _n = _m.node_tree; _b = _n.nodes['Principled BSDF']; _b.inputs['Roughness'].default_value = 0.3
        _t = _n.nodes.new('ShaderNodeTexImage'); _t.image = bpy.data.images.load(_pk); _n.links.new(_t.outputs['Color'], _b.inputs['Base Color']); M['packs'] = _m
        def _batik(d, S):   # 藍染：深藍底、白色的花和波紋（手染，大小不一、邊緣不齊）
            d.rectangle([0, 0, S, S], fill=(34, 58, 98)); R_ = random.Random(3)
            for k in range(6): y_ = S * (0.1 + k * 0.16); d.line([(x_, y_ + 6 * math.sin(x_ / S * 12 + k)) for x_ in range(0, S + 8, 8)], fill=(214, 220, 228), width=R_.choice((2, 3)))
            for k in range(14):
                x_, y_ = R_.uniform(0, S), R_.uniform(0, S); r_ = R_.uniform(8, 20)
                for a_ in range(6): d.ellipse([x_ + math.cos(a_) * r_ * 0.7 - r_ * 0.35, y_ + math.sin(a_) * r_ * 0.7 - r_ * 0.35, x_ + math.cos(a_) * r_ * 0.7 + r_ * 0.35, y_ + math.sin(a_) * r_ * 0.7 + r_ * 0.35], fill=(226, 230, 236))
                d.ellipse([x_ - r_ * 0.25, y_ - r_ * 0.25, x_ + r_ * 0.25, y_ + r_ * 0.25], fill=(34, 58, 98))
        M['batik'] = printed('tzs_yue_batik', 'tz_yue_batik', _batik, 'Fabric036', size=256, amp=0.3, tile=0.6, rough_value=0.85)
        for _c in sorted({l_[3] for l_ in DC['lanterns']}):
            SILK[_c] = 'silk_' + _c[1:]; M[SILK[_c]] = acg('tzs_silk_' + _c[1:], 'Fabric036', maps=('diff', 'nor'), vary=0.1, target=_c, tile=0.3, rough_value=0.45, res=256)
    # 牆：下半深木護牆板（1.0 m）、上緣木線條；左牆、右牆
    for sx in (-1, 1):
        xw = sx * (W / 2 - 0.02); x0, x1 = min(xw, sx * W / 2), max(xw, sx * W / 2)
        z1_ = D / 2 if sx < 0 else FG['z0']
        mesh('wood_d').box(x0, x1, 0.0, 1.0, PT['z'] if sx < 0 else HB['z1'], z1_); vc().cbox(x0 - 0.01 if sx > 0 else x0, x1 if sx > 0 else x1 + 0.01, 1.0, 1.05, PT['z'] if sx < 0 else HB['z1'], z1_, WD2)
    # 桌椅：四人桌（木桌面＋四支深色桌腳）、兩人桌（單柱）
    for t in J['tables']:
        x, z, w_, d_ = t['x'], t['z'], t['w'], t['d']
        mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.71, 0.76, z - d_ / 2, z + d_ / 2, r=0.012, seg=2)
        if t['kind'] == 'two': ccyl(vm(), (x, 0.03, z), (x, 0.71, z), 0.035, '#2b2b2b', seg=8); ccyl(vm(), (x, 0.0, z), (x, 0.03, z), 0.22, '#2b2b2b', seg=14)
        else:
            for sx in (-1, 1):
                for sz in (-1, 1): mesh('wood_d').box(x + sx * (w_ / 2 - 0.07) - 0.03, x + sx * (w_ / 2 - 0.07) + 0.03, 0, 0.71, z + sz * (d_ / 2 - 0.07) - 0.03, z + sz * (d_ / 2 - 0.07) + 0.03)
        table_set(x + (0.3 if t['kind'] == 'four' else 0.0), 0.76, z - (0.0 if t['kind'] == 'four' else 0.15))
        # 桌上：筷子筒旁邊一小碟檸檬辣椒、是拉差和海鮮醬的瓶子
        bx = x - (0.35 if t['kind'] == 'four' else 0.18)
        ccyl(vc(), (bx, 0.76, z + 0.1), (bx, 0.93, z + 0.1), 0.028, '#c8301e', seg=8); ccyl(vc(), (bx, 0.93, z + 0.1), (bx, 0.97, z + 0.1), 0.012, '#2f8a3a', seg=6)
        ccyl(vc(), (bx + 0.08, 0.76, z + 0.1), (bx + 0.08, 0.9, z + 0.1), 0.026, '#3a2418', seg=8)
        ccyl(vc(), (bx + 0.04, 0.76, z - 0.08), (bx + 0.04, 0.775, z - 0.08), 0.06, '#f4f1ea', seg=10); blob(bx + 0.03, 0.785, z - 0.08, 0.02, '#c9d94a', sy=0.6); blob(bx + 0.06, 0.785, z - 0.07, 0.014, '#c8301e', sy=0.6)
    for q in J['seats']: chair(q['x'], q['z'], q['yaw'], wood=WD, pad='#7a4a2a')
    # 木櫃台：正面竹編（一條一條深淺）、深色檯面、底下燈條；收銀螢幕、外帶袋、小盆竹子
    mesh('wood').box(CT['x0'], CT['x1'], 0.08, CT['h'] - 0.05, CT['z0'], CT['z1']); mesh('wood_d').rbox(CT['x0'] - 0.04, CT['x1'] + 0.04, CT['h'] - 0.05, CT['h'], CT['z0'] - 0.03, CT['z1'] + 0.06, r=0.012, seg=2)
    vc().cbox(CT['x0'], CT['x1'], 0.0, 0.08, CT['z0'], CT['z1'] - 0.05, '#2b2018'); mesh('light').box(CT['x0'] + 0.05, CT['x1'] - 0.05, 0.085, 0.11, CT['z1'] - 0.03, CT['z1'] + 0.005)
    nb = 34
    for i in range(nb): xx = CT['x0'] + 0.04 + i * (CT['x1'] - CT['x0'] - 0.08) / (nb - 1); ccyl(vc(), (xx, 0.12, CT['z1'] + 0.012), (xx, CT['h'] - 0.07, CT['z1'] + 0.012), 0.014, ('#c9a45a', '#b8903f', '#d9b872')[i % 3], seg=5)
    cx = J['clerk']['x']; vc().cbox(cx + 0.5, cx + 0.95, CT['h'] + 0.1, CT['h'] + 0.42, CT['z0'] + 0.15, CT['z0'] + 0.19, '#1f2023'); ccyl(vc(), (cx + 0.72, CT['h'], CT['z0'] + 0.17), (cx + 0.72, CT['h'] + 0.12, CT['z0'] + 0.17), 0.03, '#1f2023', seg=6)
    for i in range(4): vc().cbox(CT['x1'] - 0.75 + i * 0.03, CT['x1'] - 0.45 + i * 0.03, CT['h'], CT['h'] + 0.3 - i * 0.02, CT['z0'] + 0.1 + i * 0.07, CT['z0'] + 0.15 + i * 0.07, ('#c9a878', '#b8946a')[i % 2])   # 外帶紙袋
    clathe(vc(), [(0.0, 0.0), (0.06, 0.0), (0.07, 0.1), (0.0, 0.1)], CT['x0'] + 0.35, CT['h'], (CT['z0'] + CT['z1']) / 2, '#f4f1ea', seg=10)
    for i in range(5): bxx = CT['x0'] + 0.35 + (i - 2) * 0.02; ccyl(vc(), (bxx, CT['h'] + 0.1, (CT['z0'] + CT['z1']) / 2), (bxx + (i - 2) * 0.015, CT['h'] + 0.42 + (i % 2) * 0.1, (CT['z0'] + CT['z1']) / 2 + (i % 3 - 1) * 0.02), 0.01, '#5a8a3a', seg=5); blob(bxx + (i - 2) * 0.02, CT['h'] + 0.5 + (i % 2) * 0.1, (CT['z0'] + CT['z1']) / 2, 0.04, '#6a9a4a', sy=0.5)
    # 開放式廚房：後牆白磁磚（淺色）、不鏽鋼工作台、兩口大湯鍋（冒著熱氣的樣子用淺色的蓋）、燙麵爐、排煙罩、層架上的碗
    zk0, zk1 = KT['z0'], KT['z1']
    vc().cbox(KT['x0'], KT['x1'], 0.9, 2.3, zk0, zk0 + 0.02, '#eef0ee')
    for i in range(1, 9): vc().cbox(KT['x0'], KT['x1'], 0.9 + i * 0.155, 0.905 + i * 0.155, zk0 + 0.02, zk0 + 0.023, '#cfd3d2')
    mesh('steel').box(KT['x0'] + 0.05, KT['x1'] - 0.85, 0.0, 0.9, zk0 + 0.03, zk0 + 0.72)
    mesh('steel').box(KT['x0'] + 0.5, KT['x1'] - 0.95, 1.95, 2.4, zk0 + 0.05, zk0 + 0.95)
    for i, (px_, r_) in enumerate(((KT['x0'] + 0.75, 0.24), (KT['x0'] + 1.45, 0.24), (KT['x0'] + 2.15, 0.17))):
        ccyl(vm(), (px_, 0.9, zk0 + 0.4), (px_, 0.9 + (0.42 if i < 2 else 0.2), zk0 + 0.4), r_, '#b9bdc1', seg=14); ccyl(vm(), (px_, 0.9 + (0.42 if i < 2 else 0.2), zk0 + 0.4), (px_, 0.92 + (0.42 if i < 2 else 0.2), zk0 + 0.4), r_ * 0.94, '#d8c9a0' if i < 2 else '#8a8d90', seg=14)
        for hx in (-1, 1): vc().cbox(px_ + hx * r_ - 0.02, px_ + hx * r_ + 0.02, 0.9 + (0.3 if i < 2 else 0.12), 0.93 + (0.3 if i < 2 else 0.12), zk0 + 0.36, zk0 + 0.44, '#3a3a3c')
    mesh('steel').box(KT['x1'] - 0.75, KT['x1'] - 0.05, 0.0, 1.9, zk0 + 0.05, zk0 + 0.7); vc().cbox(KT['x1'] - 0.42, KT['x1'] - 0.39, 0.9, 1.5, zk0 + 0.7, zk0 + 0.72, '#6a6d70')
    for y in (1.3, 1.62):
        mesh('steel').box(KT['x0'] + 0.1, KT['x0'] + 1.5, y, y + 0.02, zk0 + 0.03, zk0 + 0.32)
        for i in range(7): bx_ = KT['x0'] + 0.25 + i * 0.18; clathe(vc(), [(0.0, 0.0), (0.035, 0.0), (0.08, 0.07), (0.0, 0.07)], bx_, y + 0.02, zk0 + 0.18, ('#f4f1ea', '#e8e4d8')[i % 2], seg=10)
    for sx in (KT['x0'], KT['x1'] - 0.08): vc().cbox(sx, sx + 0.08, 0.0, H, zk1 - 0.08, zk1, '#e9dcc0')
    vc().cbox(KT['x0'], KT['x1'], 2.5, H, zk1 - 0.08, zk1, '#e9dcc0')
    # 廚房開口上方：店名木匾（概念圖招牌裁的）
    pic('sign', [(KT['x0'] + 0.55, 2.56, zk1 + 0.012), (KT['x1'] - 0.55, 2.56, zk1 + 0.012), (KT['x1'] - 0.55, 3.08, zk1 + 0.012), (KT['x0'] + 0.55, 3.08, zk1 + 0.012)])
    vc().cbox(KT['x0'] + 0.5, KT['x1'] - 0.5, 2.52, 3.12, zk1, zk1 + 0.01, WD)
    # 左後方的隔牆和藍染布簾的門
    d0, d1 = PT['door']; WC = J.get('wallColor', '#f0e6cf')
    vc().cbox(PT['x0'], d0, 0.0, H, PT['z'] - 0.1, PT['z'], WC); vc().cbox(d1, PT['x1'], 0.0, H, PT['z'] - 0.1, PT['z'], WC); vc().cbox(d0, d1, 2.15, H, PT['z'] - 0.1, PT['z'], WC)
    for i in range(8): a = d0 + i * (d1 - d0) / 8; (mesh('batik').box(a, a + (d1 - d0) / 8 - 0.005, 0.5 + (i % 3) * 0.02, 2.15, PT['z'] - 0.06 + (i % 2) * 0.02, PT['z'] - 0.045 + (i % 2) * 0.02) if CC0 else vc().cbox(a, a + (d1 - d0) / 8 - 0.005, 0.5, 2.15, PT['z'] - 0.06 + (i % 2) * 0.02, PT['z'] - 0.045 + (i % 2) * 0.02, ('#2f4f7a', '#3a5f8a')[i % 2]))   # v2：門簾＝藍染印花布
    vc().cbox(d0 - 0.05, d1 + 0.05, 2.15, 2.2, PT['z'] - 0.11, PT['z'] + 0.01, WD)
    # 右牆：照片菜單板（概念圖裁的）
    MB = DC['menuBoard']; xe = W / 2 - 0.03; vc().cbox(W / 2 - 0.04, W / 2, MB['y0'] - 0.05, MB['y1'] + 0.05, MB['z0'] - 0.05, MB['z1'] + 0.05, WD2)
    pic('menu', [(xe - 0.012, MB['y0'], MB['z0']), (xe - 0.012, MB['y0'], MB['z1']), (xe - 0.012, MB['y1'], MB['z1']), (xe - 0.012, MB['y1'], MB['z0'])])
    # 左牆：三頂斗笠（淺圓錐＋下巴的紅帶子），中間掛一幅藍染布
    for hh in DC['hats']:
        zc, yc = hh['z'], hh['y']; xw = -W / 2 + 0.03
        if CC0:   # v2（BB：斗笠是扁圓盤）→ 真的斗笠比例（直徑 40 cm、高 19 cm 的尖錐），藤編材質，掛在釘子上往下斜，帽面一圈圈竹骨、邊緣一圈、紅色下巴帶垂下來
            r_ = 0.2 + RRV.uniform(-0.015, 0.015); t_ = 0.32 + RRV.uniform(-0.06, 0.06); sn, cs = math.sin(t_), math.cos(t_); ht = 0.19; wk = _AsTex(mesh('wicker'))
            c0 = (xw - 0.02 + r_ * sn + 0.012, yc, zc); ax = (cs, -sn, 0.0); P_ = lambda f, o=0.0: (c0[0] + ax[0] * (ht * f + o), c0[1] + ax[1] * (ht * f + o), zc)
            ccyl(wk, P_(0.0), P_(1.0), r_, '#e6d3a0', seg=28, r2=0.006, caps=True)
            for k in range(1, 6): f = k / 6.0; ccyl(wk, P_(f, -0.003), P_(f, 0.003), r_ * (1 - f) + 0.004, '#c9b278', seg=28, caps=False)   # 一圈圈竹骨
            ccyl(wk, P_(0.0, -0.006), P_(0.0, 0.008), r_ + 0.005, '#c9b278', seg=28, caps=False)   # 邊緣
            u_ = (sn, cs, 0.0); bot = (c0[0] - u_[0] * r_ * 1.9 + 0.04, c0[1] - u_[1] * r_ * 1.9, zc)
            for sz in (-1, 1): ccyl(vc(), (c0[0] - u_[0] * r_ * 0.45 + 0.01, c0[1] - u_[1] * r_ * 0.45, zc + sz * r_ * 0.86), bot, 0.004, RED, seg=4)
            blob(c0[0] + u_[0] * r_ - 0.004, c0[1] + u_[1] * r_, zc, 0.008, '#3a3a3c'); continue   # 釘子
        ccyl(vc(), (xw, yc, zc), (xw + 0.16, yc, zc), 0.3, '#e6d3a0', seg=18, r2=0.012, caps=True)
        for k in range(1, 4): ccyl(vc(), (xw + 0.16 - k * 0.04, yc, zc), (xw + 0.165 - k * 0.04, yc, zc), 0.075 * k + 0.004, '#c9b278', seg=18, caps=False)
        vc().cbox(xw, xw + 0.012, yc - 0.52, yc - 0.28, zc - 0.012, zc + 0.012, RED)
    if CC0: mesh('batik').box(-W / 2 + 0.02, -W / 2 + 0.035, 1.35, 2.35, 2.35, 3.0)   # v2：牆上那幅＝藍染印花布（原本藍色方塊中間一塊白）
    else: vc().cbox(-W / 2 + 0.02, -W / 2 + 0.035, 1.35, 2.35, 2.35, 3.0, '#2f4f7a'); vc().cbox(-W / 2 + 0.035, -W / 2 + 0.04, 1.6, 2.1, 2.5, 2.85, '#e8e4d8')
    ccyl(vc(), (-W / 2 + 0.03, 2.37, 2.3), (-W / 2 + 0.03, 2.37, 3.05), 0.012, WD, seg=5)
    # 自助香草檯（右牆、櫃台前）：木檯、不鏽鋼盆裡的九層塔、豆芽、檸檬角、辣椒；魚露、是拉差
    mesh('wood').box(HB['x0'], HB['x1'], 0.0, HB['h'] - 0.04, HB['z0'], HB['z1']); mesh('wood_d').rbox(HB['x0'] - 0.03, HB['x1'], HB['h'] - 0.04, HB['h'], HB['z0'] - 0.03, HB['z1'] + 0.03, r=0.01, seg=2)
    for i, (col, kind) in enumerate((('#4f8a3a', 'leaf'), ('#efe9d2', 'sprout'), ('#d9d94a', 'lime'), ('#c8301e', 'chili'))):
        zc = HB['z0'] + 0.17 + i * 0.25; xc = (HB['x0'] + HB['x1']) / 2 - 0.05
        vm().cbox(xc - 0.16, xc + 0.16, HB['h'], HB['h'] + 0.07, zc - 0.1, zc + 0.1, '#b9bdc1')
        for k in range(9): blob(xc + RR.uniform(-0.12, 0.12), HB['h'] + 0.08 + RR.uniform(0, 0.03), zc + RR.uniform(-0.07, 0.07), 0.035 if kind != 'sprout' else 0.028, col, sy=0.55)
    for i in range(3): ccyl(vc(), (HB['x1'] - 0.12, HB['h'], HB['z0'] + 0.2 + i * 0.3), (HB['x1'] - 0.12, HB['h'] + 0.2, HB['z0'] + 0.2 + i * 0.3), 0.03, ('#c8301e', '#6a3a1a', '#c8301e')[i], seg=8)
    vc().cbox(HB['x1'] - 0.05, HB['x1'] - 0.035, 1.25, 1.6, HB['z0'] + 0.2, HB['z1'] - 0.2, '#f4ead0'); vc().cbox(HB['x1'] - 0.035, HB['x1'] - 0.03, 1.3, 1.55, HB['z0'] + 0.28, HB['z1'] - 0.28, '#3a5f3a')
    # 飲料冰箱（右牆、門邊）：黑框、玻璃門、四層瓶罐、上面燈箱
    if CC0:   # v2（BB：冰箱玻璃門退成灰鐵箱）→ 黑框、白內壁、四層鐵網架、一罐罐一瓶瓶（前排正面印標籤、後排露頂）、玻璃門（烘焙時藏起來）、上面燈箱、內側頂燈
        x0, x1, z0, z1, h = FG['x0'], FG['x1'], FG['z0'], FG['z1'], FG['h']; yb, yt = 0.18, h - 0.28; xi = x1 - 0.05
        for (a0, a1, b0, b1, c0_, c1_) in ((x0, x1, 0.0, yb, z0, z1), (x0, x1, yt, h, z0, z1), (x0, x1, yb, yt, z0, z0 + 0.05), (x0, x1, yb, yt, z1 - 0.05, z1), (xi, x1, yb, yt, z0 + 0.05, z1 - 0.05)): vc().cbox(a0, a1, b0, b1, c0_, c1_, '#2b2b2b')   # 黑鐵（深色塑膠的紋路在大面上像木頭）
        mesh('plastic_w').box(xi - 0.01, xi, yb, yt, z0 + 0.05, z1 - 0.05); mesh('light').box(x0 + 0.03, x0 + 0.06, yt - 0.025, yt - 0.01, z0 + 0.06, z1 - 0.06)
        GL = ('#3a7a4a', '#e8e4d8', '#7a4a1a', '#3a6a9a')
        for lv in range(4):
            yy = yb + 0.03 + lv * 0.37; kind = ('can', 'bottle', 'can', 'bottle')[lv]; k0 = RRV.randrange(8)
            mesh('steel').box(x0 + 0.02, xi - 0.01, yy - 0.012, yy, z0 + 0.05, z1 - 0.05)
            for row, xr in enumerate((x0 + 0.075, x0 + 0.16)):
                zz = z0 + 0.09; m_ = 0; r_ = 0.033 if kind == 'can' else 0.03
                while zz < z1 - 0.085:
                    if RRV.random() < (0.06 if row == 0 else 0.0): zz += 2 * r_ + 0.008; m_ += 1; continue   # 前排被拿走一罐
                    lab = (k0 + m_ // 3) % 8; xf = xr - r_ - 0.0012
                    if kind == 'can':
                        ccyl(vc(), (xr, yy, zz), (xr, yy + 0.122, zz), r_, '#b9bdc1', seg=10); ccyl(vc(), (xr, yy + 0.122, zz), (xr, yy + 0.128, zz), r_ * 0.85, '#d9dbde', seg=10)
                        if row == 0: pkq('can', (xf, yy + 0.004, zz - r_ * 0.92), (xf, yy + 0.004, zz + r_ * 0.92), (xf, yy + 0.118, zz + r_ * 0.92), (xf, yy + 0.118, zz - r_ * 0.92), i=lab)
                    else:
                        gc = GL[lab % 4]; ccyl(vc(), (xr, yy, zz), (xr, yy + 0.15, zz), r_, gc, seg=10); ccyl(vc(), (xr, yy + 0.15, zz), (xr, yy + 0.19, zz), r_, gc, seg=10, r2=0.011, caps=False)
                        ccyl(vc(), (xr, yy + 0.19, zz), (xr, yy + 0.215, zz), 0.011, gc, seg=8); ccyl(vc(), (xr, yy + 0.215, zz), (xr, yy + 0.228, zz), 0.0125, ('#c8301e', '#e8c86a', '#f4f1ea', '#2f8a3a')[lab % 4], seg=8)
                        if row == 0: pkq('blab', (xf, yy + 0.03, zz - r_ * 0.9), (xf, yy + 0.03, zz + r_ * 0.9), (xf, yy + 0.125, zz + r_ * 0.9), (xf, yy + 0.125, zz - r_ * 0.9), i=lab)
                    zz += 2 * r_ + 0.008; m_ += 1
        mesh('glass').quad([(x0 - 0.006, yb, z0 + 0.05), (x0 - 0.006, yb, z1 - 0.05), (x0 - 0.006, yt, z1 - 0.05), (x0 - 0.006, yt, z0 + 0.05)])
        for (a0, a1, b0, b1, c0_, c1_) in ((x0 - 0.02, x0, yb, yb + 0.03, z0, z1), (x0 - 0.02, x0, yt - 0.03, yt, z0, z1), (x0 - 0.02, x0, yb, yt, z0, z0 + 0.05), (x0 - 0.02, x0, yb, yt, z1 - 0.05, z1)): vc().cbox(a0, a1, b0, b1, c0_, c1_, '#2b2b2b')   # 門框
    else: vm().cbox(FG['x0'], FG['x1'], 0.0, FG['h'], FG['z0'], FG['z1'], '#1f2023'); vc().cbox(FG['x0'] - 0.012, FG['x0'], 0.18, FG['h'] - 0.28, FG['z0'] + 0.05, FG['z1'] - 0.05, '#dfe9ea')
    mesh('light').box(FG['x0'] - 0.014, FG['x0'], FG['h'] - 0.24, FG['h'] - 0.04, FG['z0'] + 0.05, FG['z1'] - 0.05)
    for lv in range(0 if CC0 else 4):
        yy = 0.24 + lv * 0.37; vc().cbox(FG['x0'] - 0.016, FG['x0'] - 0.012, yy - 0.02, yy, FG['z0'] + 0.05, FG['z1'] - 0.05, '#8a8d90')
        for k in range(7): zz = FG['z0'] + 0.1 + k * 0.085; vc().cbox(FG['x0'] - 0.02, FG['x0'] - 0.012, yy, yy + 0.2 + (k % 2) * 0.04, zz - 0.03, zz + 0.03, ('#e8b23a', '#3a8a5a', '#c8301e', '#f4f1ea', '#6a3a1a', '#3a6a9a')[(k + lv * 2) % 6])
    vc().cbox(FG['x0'] - 0.03, FG['x0'] - 0.012, 0.9, 1.3, FG['z0'] + 0.06, FG['z0'] + 0.09, '#b9bdc1')
    # 會安燈籠（彩色絲布燈籠：上下收口的橢圓、底下流蘇）、藤編吊燈（桌子上方）
    def lantern(x, z, y, col, r=0.17):
        if CC0:   # v2（BB：光滑實心球）→ 絲布（Fabric036 上色）、八條竹骨順著燈籠的弧、上下木蓋、紅結＋一束金紅流蘇
            sk = _AsTex(mesh(SILK[col])); wd = _AsTex(mesh('wood_d')); prof = [(0.24, 1.18), (0.62, 1.0), (0.92, 0.62), (1.0, 0.12), (0.9, -0.42), (0.6, -0.82), (0.24, -1.02)]
            ccyl(vc(), (x, y + r * 1.32, z), (x, H, z), 0.004, '#2b2b2b', seg=4)
            for (r0, y0), (r1, y1) in zip(prof, prof[1:]): ccyl(sk, (x, y + y1 * r, z), (x, y + y0 * r, z), r1 * r, col, seg=16, r2=r0 * r, caps=False)
            ccyl(wd, (x, y + 1.16 * r, z), (x, y + 1.32 * r, z), 0.26 * r, WD, seg=10); ccyl(wd, (x, y - 1.14 * r, z), (x, y - 1.0 * r, z), 0.26 * r, WD, seg=10)
            for k in range(8):
                a_ = k * math.pi / 4 + math.pi / 16; ca, sa = math.cos(a_), math.sin(a_)
                for (r0, y0), (r1, y1) in zip(prof, prof[1:]): ccyl(wd, (x + ca * r0 * r * 1.03, y + y0 * r, z + sa * r0 * r * 1.03), (x + ca * r1 * r * 1.03, y + y1 * r, z + sa * r1 * r * 1.03), 0.0035, WD, seg=3, caps=False)
            blob(x, y - 1.2 * r, z, 0.014, '#c8301e')
            for k in range(9): a_ = k * 0.7; ccyl(vc(), (x + math.cos(a_) * 0.005, y - 1.24 * r, z + math.sin(a_) * 0.005), (x + math.cos(a_) * 0.016, y - 1.24 * r - 0.16 - 0.02 * (k % 3), z + math.sin(a_) * 0.016), 0.0028, '#e8b23a' if k % 3 else '#c8301e', seg=3, r2=0.0018)
            mesh('light').sphere((x, y, z), r * 0.42, seg=8, rings=5); return
        ccyl(vc(), (x, y + r * 1.3, z), (x, H, z), 0.005, '#2b2b2b', seg=4)
        prof = [(0.05, 1.25), (0.6, 1.0), (1.0, 0.45), (1.0, -0.2), (0.6, -0.85), (0.05, -1.1)]
        for (r0, y0), (r1, y1) in zip(prof, prof[1:]): ccyl(vc(), (x, y + y1 * r, z), (x, y + y0 * r, z), r1 * r, col, seg=12, r2=r0 * r, caps=False)
        ccyl(vc(), (x, y - r * 1.1, z), (x, y - r * 1.75, z), 0.012, '#e8c86a', seg=5); mesh('light').sphere((x, y, z), r * 0.42, seg=8, rings=5)
    for (lx, lz, ly, lc) in DC['lanterns']: lantern(lx, lz, ly, lc)
    for (px, pz) in DC['pendants']: pendant(px, pz, y=2.2)
    # 大盆栽（窗邊，概念圖門口那種闊葉）、窗台上的小盆
    for (px, pz) in DC['plants']:
        if CC0: ph_put('potted_plant_01', px, 0.0, pz, 2.4, height=1.5, share=False, decimate=0.012); continue   # Poly Haven 落地盆栽
        clathe(vc(), [(0.0, 0.0), (0.17, 0.0), (0.22, 0.4), (0.0, 0.4)], px, 0.0, pz, '#a8573a', seg=12); ccyl(vc(), (px, 0.4, pz), (px, 1.15, pz), 0.025, '#6a5038', seg=5); fern(px, 1.15, pz, r=0.4, n=24)
    for i in range(3):
        wx = -2.3 + i * 0.75
        if CC0: ph_put('fern_02', wx, sill, zS - 0.08, i * 1.3, height=0.26, share=False, decimate=0.08); continue   # 窗台小盆（Poly Haven）
        clathe(vc(), [(0.0, 0.0), (0.06, 0.0), (0.075, 0.1), (0.0, 0.1)], wx, sill, zS - 0.08, ('#e8e0d0', '#a8573a', '#e8e0d0')[i], seg=8); fern(wx, sill + 0.14, zS - 0.08, r=0.12, n=7)
    # 天花板：軌道燈、冷氣出風口；地上門口紅色腳踏墊（概念圖）
    vc().cbox(-0.02, 0.02, H - 0.06, H - 0.03, -2.2, 4.2, '#2b2b2b'); vc().cbox(0.0, 1.5, 0.001, 0.012, 3.55, 4.4, '#8a2a2a')
    vc().cbox(-0.5, 0.5, H - 0.08, H - 0.02, 1.9, 2.9, '#e6dcc6'); vc().cbox(-0.42, 0.42, H - 0.09, H - 0.08, 1.98, 2.82, '#bfb6a2')
    PRE = 'CEIL:'
    for i in range(6): z = -1.8 + i * 1.15; ccyl(vc(), (0.0, H - 0.06, z), (0.1 if i % 2 else -0.1, H - 0.24, z), 0.04, '#2b2b2b', seg=8); mesh('light').cyl((0.1 if i % 2 else -0.1, H - 0.245, z), (0.11 if i % 2 else -0.11, H - 0.255, z), 0.033, seg=8)
    PRE = ''


# ---------- 客居雲南（TINGZHOU-SHOPS5-1110；LAWWW2-C 2026-11-12）----------
# 使用者只給外觀概念圖（酒紅雨棚、木桌圓凳、藤編吊燈、酒紅牆上的照片菜單、後面櫃台）；室內是照外觀看進去的樣子設計的雲南米線小館
if SHOP == 'keju':
    CT = J['counter']; KT = J['kitchen']; PT = J['partition']; DC = J['decor']; TS = J['teaShelf']
    WD, WD2, WINE, INDIGO = '#4a2a1a', '#6a4028', '#7a2a2a', '#24456e'
    if CC0:   # SHOP-REALISM-1112（LAWWW2-C 11-13）：木頭的直條、飾帶、櫃子 → 木頭材質組；黑鐵 → 黑鐵；廚房磁磚 → 白磁磚；螢幕 → 深色塑膠；
        #   圓凳 → Poly Haven wooden_stool_01、砂鍋 → Poly Haven ceramic_pot（上成深褐）、盆栽 → Poly Haven potted_plant_01；扎染布、油紙傘、酒紅牆照舊（牆要平塗）
        ROUTE = {'#5a3a22': 'wood_d', '#4a2a1a': 'wood_d', '#2b2018': 'wood_d', '#3a2a20': 'wood_d', '#2b1c12': 'wood_d', '#6a4028': 'wood', '#7a5636': 'wood', '#8a6442': 'wood', '#6a4a2a': 'wood', '#8a5a34': 'wood',
                 '#2b2b2b': 'blackmetal', '#3a3a3c': 'blackmetal', '#eef0ee': 'tile_w', '#1f2023': 'plastic_dk', '#6a6d70': 'steel'}
        _vc0 = vc; vc = lambda: _Route(_vc0(), ROUTE); vm = lambda: _AsTex(mesh('steel'))
    RRV = random.Random(53); PQ = []; PKUV = {}   # P2（BB：扎染布太乾淨、像標靶）
    def pkq(kd, lb, rb, rt, lt_, i=None):
        L_ = PKUV[kd]; PQ.append((L_[RRV.randrange(len(L_)) if i is None else i % len(L_)], [g2b(*p_) for p_ in (lb, rb, rt, lt_)]))
    if CC0:   # 大理扎染（自畫：靛藍底、一圈圈不規則的白環、放射的摺痕、邊緣暈開、斑駁）×ambientCG 布紋 Fabric036；2×2 格（三幅掛布＋門簾）
        from PIL import ImageDraw, ImageFilter
        def _kbatik(d, S):
            R_ = random.Random(11); C = S // 2; im = Image.new('RGB', (S, S), (30, 52, 92)); dd = ImageDraw.Draw(im)
            for ci in range(4):
                ox, oy = (ci % 2) * C, (ci // 2) * C; cx, cy = ox + C / 2 + R_.uniform(-10, 10), oy + C / 2 + R_.uniform(-10, 10)
                if ci < 3:
                    for rr, col in ((0.47, (206, 218, 230)), (0.39, (32, 56, 98)), (0.3, (190, 206, 222)), (0.21, (40, 66, 108)), (0.12, (220, 228, 238)), (0.05, (36, 60, 100))):
                        pts = [(cx + math.cos(math.radians(a_)) * rr * C * (1 + R_.uniform(-0.09, 0.09)), cy + math.sin(math.radians(a_)) * rr * C * (1 + R_.uniform(-0.09, 0.09))) for a_ in range(0, 360, 10)]
                        dd.polygon(pts, fill=col)
                    for a_ in range(0, 360, 24):   # 綁線留下的放射摺痕
                        r0, r1 = C * R_.uniform(0.06, 0.12), C * R_.uniform(0.35, 0.48); ca, sa = math.cos(math.radians(a_)), math.sin(math.radians(a_))
                        dd.line([cx + ca * r0, cy + sa * r0, cx + ca * r1, cy + sa * r1], fill=(150, 172, 200), width=R_.choice((1, 2, 2, 3)))
                    for (qx, qy) in ((0.08, 0.08), (0.92, 0.08), (0.08, 0.92), (0.92, 0.92)):   # 四角的小花
                        for k in range(5): r_ = C * 0.035; a_ = k * 1.2566; dd.ellipse([ox + qx * C + math.cos(a_) * r_ - r_ * 0.6, oy + qy * C + math.sin(a_) * r_ - r_ * 0.6, ox + qx * C + math.cos(a_) * r_ + r_ * 0.6, oy + qy * C + math.sin(a_) * r_ + r_ * 0.6], fill=(214, 224, 236))
                else:   # 門簾：靛藍底、白色波紋和點
                    for k in range(7): y_ = oy + C * (0.08 + k * 0.13); dd.line([(x_, y_ + 5 * math.sin((x_ - ox) / C * 14 + k)) for x_ in range(ox, ox + C + 6, 6)], fill=(206, 218, 230), width=3)
            im = im.filter(ImageFilter.GaussianBlur(2.2)); a_ = np.asarray(im, float); nz = np.asarray(Image.fromarray((np.random.RandomState(4).rand(S // 8, S // 8) * 255).astype('uint8')).resize((S, S), Image.BICUBIC), float) / 255.0
            a_ = a_ * (0.86 + 0.22 * nz[..., None]); d._image.paste(Image.fromarray(np.clip(a_, 0, 255).astype('uint8')))
        M['packs'] = printed('tzs_keju_packs', 'tz_keju_batik', _kbatik, 'Fabric036', size=512, amp=0.35, tile=1.0, rough_value=0.85)
        PKUV['batik'] = [[0.0, 0.5, 0.5, 1.0], [0.5, 0.5, 1.0, 1.0], [0.0, 0.0, 0.5, 0.5]]; PKUV['curtain'] = [[0.5, 0.0, 1.0, 0.5]]
    def stool(x, z, col='#8a5a34'):
        """圓木凳（概念圖門口那種）：圓座面、四支外張的腳、一圈橫撐"""
        if CC0: ph_put('wooden_stool_01', x, 0.0, z, 0.0, height=0.46, decimate=0.05); return   # Poly Haven 圓木凳（座面高 0.46，和原本一樣）
        ccyl(vc(), (x, 0.42, z), (x, 0.46, z), 0.17, col, seg=14)
        for k in range(4): a = PI / 4 + k * PI / 2; ccyl(vc(), (x + math.cos(a) * 0.15, 0.0, z + math.sin(a) * 0.15), (x + math.cos(a) * 0.1, 0.42, z + math.sin(a) * 0.1), 0.018, '#5a3a22', seg=5)
        ccyl(vc(), (x, 0.17, z), (x, 0.19, z), 0.13, '#5a3a22', seg=10, caps=False)
    def claypot(x, y, z, r=0.085):
        """過橋米線的小砂鍋：深褐色、兩個耳、淺色的蓋"""
        if CC0: ph_put('ceramic_pot', x, y, z, 0.0, height=r * 1.1, recolor=('#2a1a12', '#7a5640'), decimate=0.08); return   # Poly Haven 陶鍋（上成砂鍋的深褐）
        clathe(vc(), [(0.0, 0.0), (r * 0.7, 0.0), (r, r * 0.55), (r * 0.95, r * 0.9), (0.0, r * 0.9)], x, y, z, '#4a3226', seg=12)
        ccyl(vc(), (x, y + r * 0.9, z), (x, y + r * 1.1, z), r * 0.9, '#6a4a36', seg=12, r2=r * 0.3); 
        for sx in (-1, 1): vc().cbox(x + sx * r - 0.012, x + sx * r + 0.012, y + r * 0.6, y + r * 0.75, z - 0.02, z + 0.02, '#4a3226')
    # 牆：兩側下半深木護牆板；右牆（照片菜單那一段）上半酒紅色
    for sx in (-1, 1):
        xw = sx * (W / 2 - 0.02); x0, x1 = min(xw, sx * W / 2), max(xw, sx * W / 2); za = PT['z'] if sx < 0 else TS['z1']
        mesh('wood_d').box(x0, x1, 0.0, 1.0, za, D / 2); vc().cbox(x0 - (0.01 if sx > 0 else 0), x1 + (0.01 if sx < 0 else 0), 1.0, 1.05, za, D / 2, WD2)
    vc().cbox(W / 2 - 0.015, W / 2, 1.05, H, TS['z1'], D / 2, WINE)
    for yy in (1.12, H - 0.1): vc().cbox(W / 2 - 0.02, W / 2 - 0.015, yy, yy + 0.03, TS['z1'], D / 2, '#c9a45a')
    # 桌子、圓凳；桌上：筷子筒、面紙盒、辣油罐、一只小砂鍋
    for t in J['tables']:
        x, z, w_, d_ = t['x'], t['z'], t['w'], t['d']
        mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.71, 0.76, z - d_ / 2, z + d_ / 2, r=0.012, seg=2)
        if t['kind'] == 'two': ccyl(vm(), (x, 0.03, z), (x, 0.71, z), 0.035, '#2b2b2b', seg=8); ccyl(vm(), (x, 0.0, z), (x, 0.03, z), 0.22, '#2b2b2b', seg=14)
        else:
            for sx in (-1, 1):
                for sz in (-1, 1): mesh('wood_d').box(x + sx * (w_ / 2 - 0.07) - 0.03, x + sx * (w_ / 2 - 0.07) + 0.03, 0, 0.71, z + sz * (d_ / 2 - 0.07) - 0.03, z + sz * (d_ / 2 - 0.07) + 0.03)
        table_set(x + (0.32 if t['kind'] == 'four' else 0.0), 0.76, z - (0.0 if t['kind'] == 'four' else 0.16))
        if t['id'] in (1, 3): claypot(x - 0.25, 0.76, z + 0.05); ccyl(vc(), (x - 0.25, 0.76, z + 0.05), (x - 0.25, 0.765, z + 0.05), 0.12, '#e8e0d0', seg=12)
    for q in J['seats']: stool(q['x'], q['z'])
    # 木櫃台：正面直條木板＋一條酒紅飾帶；檯面上收銀螢幕、疊著的砂鍋、三罐配料
    mesh('wood').box(CT['x0'], CT['x1'], 0.08, CT['h'] - 0.05, CT['z0'], CT['z1']); mesh('wood_d').rbox(CT['x0'] - 0.04, CT['x1'] + 0.04, CT['h'] - 0.05, CT['h'], CT['z0'] - 0.03, CT['z1'] + 0.06, r=0.012, seg=2)
    vc().cbox(CT['x0'], CT['x1'], 0.0, 0.08, CT['z0'], CT['z1'] - 0.05, '#2b2018'); mesh('light').box(CT['x0'] + 0.05, CT['x1'] - 0.05, 0.085, 0.11, CT['z1'] - 0.03, CT['z1'] + 0.005)
    for i in range(22): xx = CT['x0'] + 0.05 + i * (CT['x1'] - CT['x0'] - 0.1) / 21; vc().cbox(xx - 0.02, xx + 0.02, 0.12, CT['h'] - 0.06, CT['z1'], CT['z1'] + 0.012, '#7a5636' if i % 2 else '#8a6442')
    vc().cbox(CT['x0'], CT['x1'], 0.72, 0.8, CT['z1'] + 0.012, CT['z1'] + 0.016, WINE)
    cx = J['clerk']['x']; vc().cbox(cx + 0.45, cx + 0.9, CT['h'] + 0.1, CT['h'] + 0.42, CT['z0'] + 0.15, CT['z0'] + 0.19, '#1f2023'); ccyl(vc(), (cx + 0.67, CT['h'], CT['z0'] + 0.17), (cx + 0.67, CT['h'] + 0.12, CT['z0'] + 0.17), 0.03, '#1f2023', seg=6)
    for k in range(3): claypot(CT['x0'] + 0.3, CT['h'] + k * 0.085, (CT['z0'] + CT['z1']) / 2)
    for k in range(2): claypot(CT['x0'] + 0.52, CT['h'] + k * 0.085, (CT['z0'] + CT['z1']) / 2 + 0.03)
    for i, col in enumerate(('#6a7a3a', '#3f7a3a', '#d9c98a')):
        jx = CT['x0'] + 0.95 + i * 0.2; ccyl(vc(), (jx, CT['h'], CT['z1'] - 0.16), (jx, CT['h'] + 0.2, CT['z1'] - 0.16), 0.07, '#dfe6e4', seg=10); ccyl(vc(), (jx, CT['h'] + 0.01, CT['z1'] - 0.16), (jx, CT['h'] + 0.15, CT['z1'] - 0.16), 0.062, col, seg=10); ccyl(vc(), (jx, CT['h'] + 0.2, CT['z1'] - 0.16), (jx, CT['h'] + 0.23, CT['z1'] - 0.16), 0.072, '#8a5a34', seg=10)
    # 開放式廚房：後牆白磁磚、不鏽鋼台、一排六口小砂鍋爐、大湯桶、排煙罩、冰箱、層架上的碗
    zk0, zk1 = KT['z0'], KT['z1']
    vc().cbox(KT['x0'], KT['x1'], 0.9, 2.3, zk0, zk0 + 0.02, '#eef0ee')
    for i in range(1, 9): vc().cbox(KT['x0'], KT['x1'], 0.9 + i * 0.155, 0.905 + i * 0.155, zk0 + 0.02, zk0 + 0.023, '#cfd3d2')
    mesh('steel').box(KT['x0'] + 0.05, KT['x1'] - 0.8, 0.0, 0.9, zk0 + 0.03, zk0 + 0.72); mesh('steel').box(KT['x0'] + 0.3, KT['x1'] - 0.9, 1.95, 2.4, zk0 + 0.05, zk0 + 0.95)
    for i in range(6): px_ = KT['x0'] + 0.35 + i * 0.27; ccyl(vm(), (px_, 0.9, zk0 + 0.45), (px_, 0.93, zk0 + 0.45), 0.11, '#3a3a3c', seg=10); claypot(px_, 0.93, zk0 + 0.45, r=0.09)
    ccyl(vm(), (KT['x1'] - 1.15, 0.9, zk0 + 0.4), (KT['x1'] - 1.15, 1.35, zk0 + 0.4), 0.22, '#b9bdc1', seg=14); ccyl(vm(), (KT['x1'] - 1.15, 1.35, zk0 + 0.4), (KT['x1'] - 1.15, 1.37, zk0 + 0.4), 0.2, '#e0d2a8', seg=14)
    mesh('steel').box(KT['x1'] - 0.72, KT['x1'] - 0.05, 0.0, 1.9, zk0 + 0.05, zk0 + 0.7); vc().cbox(KT['x1'] - 0.4, KT['x1'] - 0.37, 0.9, 1.5, zk0 + 0.7, zk0 + 0.72, '#6a6d70')
    for y in (1.3, 1.62):
        mesh('steel').box(KT['x0'] + 0.1, KT['x0'] + 1.3, y, y + 0.02, zk0 + 0.03, zk0 + 0.32)
        for i in range(6): clathe(vc(), [(0.0, 0.0), (0.035, 0.0), (0.085, 0.075), (0.0, 0.075)], KT['x0'] + 0.25 + i * 0.19, y + 0.02, zk0 + 0.18, ('#f4f1ea', '#e0d8c4')[i % 2], seg=10)
    for sx in (KT['x0'], KT['x1'] - 0.08): vc().cbox(sx, sx + 0.08, 0.0, H, zk1 - 0.08, zk1, '#e9dcc0')
    vc().cbox(KT['x0'], KT['x1'], 2.5, H, zk1 - 0.08, zk1, '#e9dcc0')
    pic('sign', [(KT['x0'] + 0.35, 2.58, zk1 + 0.012), (KT['x1'] - 0.35, 2.58, zk1 + 0.012), (KT['x1'] - 0.35, 3.06, zk1 + 0.012), (KT['x0'] + 0.35, 3.06, zk1 + 0.012)])
    vc().cbox(KT['x0'] + 0.3, KT['x1'] - 0.3, 2.54, 3.1, zk1, zk1 + 0.01, WD)
    # 左後方的隔牆和扎染布簾的門
    d0, d1 = PT['door']; WC = J.get('wallColor', '#f2e8d2')
    vc().cbox(PT['x0'], d0, 0.0, H, PT['z'] - 0.1, PT['z'], WC); vc().cbox(d1, PT['x1'], 0.0, H, PT['z'] - 0.1, PT['z'], WC); vc().cbox(d0, d1, 2.15, H, PT['z'] - 0.1, PT['z'], WC)
    for i in range(2):
        a = d0 + 0.02 + i * (d1 - d0 - 0.04) / 2; b_ = a + (d1 - d0 - 0.04) / 2 - 0.01; vc().cbox(a + 0.01, b_, 0.6, 2.15, PT['z'] - 0.05, PT['z'] - 0.035, INDIGO)
        if CC0: zf = PT['z'] - 0.035 + 0.0012; pkq('curtain', (a + 0.01, 0.6, zf), (b_, 0.6, zf), (b_, 2.15, zf), (a + 0.01, 2.15, zf)); continue   # P2：印花門簾
        ccyl(vc(), (a + (d1 - d0) / 4, 1.5, PT['z'] - 0.03), (a + (d1 - d0) / 4, 1.5, PT['z'] - 0.028), 0.16, '#e8eef2', seg=14)
    vc().cbox(d0 - 0.05, d1 + 0.05, 2.15, 2.2, PT['z'] - 0.11, PT['z'] + 0.01, WD)
    # 右牆：照片菜單板（概念圖裁的）；普洱茶餅櫃
    MB = DC['menuBoard']; xe = W / 2 - 0.035; vc().cbox(W / 2 - 0.045, W / 2 - 0.015, MB['y0'] - 0.05, MB['y1'] + 0.05, MB['z0'] - 0.05, MB['z1'] + 0.05, '#c9a45a')
    pic('menu', [(xe - 0.014, MB['y0'], MB['z0']), (xe - 0.014, MB['y0'], MB['z1']), (xe - 0.014, MB['y1'], MB['z1']), (xe - 0.014, MB['y1'], MB['z0'])])
    mesh('wood_d').box(TS['x0'] + 0.04, TS['x1'], 0.0, TS['h'], TS['z0'], TS['z1']); 
    for lv in range(5):
        yy = 0.12 + lv * 0.36; vc().cbox(TS['x0'], TS['x0'] + 0.3, yy - 0.03, yy, TS['z0'] + 0.03, TS['z1'] - 0.03, WD2); vc().cbox(TS['x0'] + 0.04, TS['x0'] + 0.3, yy, yy + 0.33, TS['z0'] + 0.03, TS['z1'] - 0.03, '#2b1c12')
        for k in range(4):
            zz = TS['z0'] + 0.17 + k * 0.255
            if (lv + k) % 3 == 2: ccyl(vc(), (TS['x0'] + 0.14, yy, zz), (TS['x0'] + 0.14, yy + 0.2, zz), 0.07, ('#7a2a2a', '#2f5f4a', '#c9a45a')[(lv + k) % 3], seg=10); ccyl(vc(), (TS['x0'] + 0.14, yy + 0.2, zz), (TS['x0'] + 0.14, yy + 0.23, zz), 0.073, '#3a2a20', seg=10)
            else:
                ccyl(vc(), (TS['x0'] + 0.03, yy + 0.15, zz), (TS['x0'] + 0.065, yy + 0.15, zz), 0.105, ('#e8dcc0', '#d9c9a0')[(lv + k) % 2], seg=14)   # 立著的茶餅（紙包）
                vc().cbox(TS['x0'] + 0.025, TS['x0'] + 0.03, yy + 0.11, yy + 0.19, zz - 0.035, zz + 0.035, ('#7a2a2a', '#2f5f4a')[(lv * 2 + k) % 2])
    vc().cbox(TS['x0'] - 0.01, TS['x1'], TS['h'], TS['h'] + 0.05, TS['z0'] - 0.02, TS['z1'] + 0.02, WD2)
    # 左牆：三幅大理扎染布（靛藍底、白色的圓和放射紋）、木桿
    xw = -W / 2 + 0.02
    for bi, bt in enumerate(DC['batiks']):
        z0, z1, y0, y1 = bt['z0'], bt['z1'], bt['y0'], bt['y1']; zc, yc = (z0 + z1) / 2, (y0 + y1) / 2
        vc().cbox(xw, xw + 0.012, y0, y1, z0, z1, INDIGO); ccyl(vc(), (xw + 0.02, y1 + 0.02, z0 - 0.06), (xw + 0.02, y1 + 0.02, z1 + 0.06), 0.014, WD, seg=5)
        if CC0:   # P2（BB：太乾淨、像標靶）→ 印花扎染（不規則的環、摺痕、暈開的邊）；下緣一排短流蘇
            xf = xw + 0.012 + 0.0012; pkq('batik', (xf, y0, z1), (xf, y0, z0), (xf, y1, z0), (xf, y1, z1), i=bi)
            for k in range(int((z1 - z0) / 0.06)): zz = z0 + 0.03 + k * 0.06; ccyl(vc(), (xw + 0.008, y0, zz), (xw + 0.01, y0 - 0.06 - 0.01 * (k % 2), zz), 0.004, INDIGO, seg=3)
            continue
        for (rr, col) in ((0.42, '#e8eef2'), (0.33, INDIGO), (0.22, '#cfdce6'), (0.12, INDIGO), (0.05, '#e8eef2')): ccyl(vc(), (xw + 0.012, yc, zc), (xw + 0.0125 + (0.43 - rr) * 0.004, yc, zc), rr, col, seg=20, caps=True)
        for k in range(4):
            for (sy_, sz_) in ((1, 1), (1, -1), (-1, 1), (-1, -1)): ccyl(vc(), (xw + 0.012, yc + sy_ * 0.5, zc + sz_ * 0.5), (xw + 0.0145, yc + sy_ * 0.5, zc + sz_ * 0.5), 0.07, '#e8eef2', seg=8)
    if CC0:   # P2（BB：牆面空）：左牆兩幅扎染之間各一塊小木層板，上面一小盆蕨（Poly Haven）、一個陶罐
        for (za, zb_) in ((1.2, 2.2), (-0.9, 0.0)):
            zc = (za + zb_) / 2; mesh('wood_d').box(-W / 2, -W / 2 + 0.2, 1.84, 1.87, zc - 0.33, zc + 0.33)
            for sz in (-1, 1): mesh('blackmetal').box(-W / 2, -W / 2 + 0.16, 1.74, 1.84, zc + sz * 0.25 - 0.008, zc + sz * 0.25 + 0.008)
            ph_put('fern_02', -W / 2 + 0.1, 1.87, zc - 0.13, zc * 1.7, height=0.24, share=False, decimate=0.08); ph_put('ceramic_pot', -W / 2 + 0.1, 1.87, zc + 0.17, 0.4, height=0.16, recolor=('#5a3a28', '#a87a58'), decimate=0.08)
    # 天花板吊的油紙傘（撐開、傘面朝下看得到傘骨）
    for (ux, uz, uy, ucol) in DC['umbrellas']:
        ccyl(vc(), (ux, uy, uz), (ux, H, uz), 0.012, '#6a4a2a', seg=5); ccyl(vc(), (ux, uy - 0.5, uz), (ux, uy, uz), 0.012, '#6a4a2a', seg=5)
        ccyl(vc(), (ux, uy - 0.18, uz), (ux, uy, uz), 0.5, ucol, seg=16, r2=0.02, caps=False); ccyl(vc(), (ux, uy - 0.185, uz), (ux, uy - 0.005, uz), 0.495, '#e8d8a8', seg=16, r2=0.02, caps=False)
        for k in range(16): a = k * PI / 8; ccyl(vc(), (ux, uy - 0.01, uz), (ux + math.cos(a) * 0.49, uy - 0.185, uz + math.sin(a) * 0.49), 0.005, '#6a4a2a', seg=3)
    for (px, pz) in DC['pendants']: pendant(px, pz, y=2.2)
    for (px, pz) in DC['plants']:
        if CC0: ph_put('potted_plant_01', px, 0.0, pz, 0.7, height=1.45, share=False, decimate=0.022); continue   # Poly Haven 落地盆栽
        clathe(vc(), [(0.0, 0.0), (0.17, 0.0), (0.22, 0.4), (0.0, 0.4)], px, 0.0, pz, '#a8573a', seg=12); ccyl(vc(), (px, 0.4, pz), (px, 1.1, pz), 0.025, '#6a5038', seg=5); fern(px, 1.1, pz, r=0.38, n=22)
    vc().cbox(0.25, 1.75, 0.001, 0.012, 3.55, 4.4, WINE)                                                                 # 門口腳踏墊
    vc().cbox(1.35, 1.39, H - 0.06, H - 0.03, -2.2, 4.2, '#2b2b2b')
    PRE = 'CEIL:'
    for i in range(6): z = -1.8 + i * 1.15; ccyl(vc(), (1.37, H - 0.06, z), (1.47 if i % 2 else 1.27, H - 0.24, z), 0.04, '#2b2b2b', seg=8); mesh('light').cyl((1.47 if i % 2 else 1.27, H - 0.245, z), (1.48 if i % 2 else 1.26, H - 0.255, z), 0.033, seg=8)
    PRE = ''


# ---------- 東南大聯商行（汀州路；東南亞食品雜貨）----------
if SHOP == 'dongnan':
    WS, BS, RS, FG, RC, CT, BK = J['wallShelf'], J['backShelf'], J['rightShelf'], J['fridge'], J['rice'], J['counter'], J['baskets']
    BODY, POST, GRN, RED, YEL = '#e9e7de', '#c9c8c0', '#1f5a3e', '#d8362a', '#f0b020'
    RRV = __import__('random').Random(23)   # v2 的變化用自己的亂數，不影響原本 RR 排出來的貨
    PQ = []; PKUV = {}
    if CC0:   # v2：包裝印刷貼圖集（BB_379「一樣大小的方塊、只換顏色」→ 每一包正面印上不同的包裝圖；本作自己畫的，不寫字、不像任何品牌，D77）
        from PIL import ImageDraw
        _R = __import__('random').Random(5); CW = 128; at = Image.new('RGB', (CW * 8, CW * 8)); KINDS = ('noodle', 'snack', 'flat', 'box')   # v2.1：8 列（第 5 列＝端架特價看板）
        BASES = [(216, 54, 42), (240, 176, 32), (47, 138, 74), (232, 106, 28), (58, 122, 192), (122, 42, 138), (244, 233, 200), (196, 40, 60), (30, 90, 62), (245, 245, 238)]
        for r_, kd in enumerate(KINDS):
            for c_ in range(8):
                im = Image.new('RGB', (CW, CW), BASES[(r_ * 3 + c_) % len(BASES)]); d = ImageDraw.Draw(im); bc = BASES[(r_ * 3 + c_) % len(BASES)]
                dk = tuple(max(0, v - 70) for v in bc); lt = tuple(min(255, v + 80) for v in bc); acc = BASES[(r_ * 5 + c_ * 3 + 4) % len(BASES)]
                d.rectangle([0, 0, CW, CW * 0.12], fill=dk)                                            # 上緣封口那一條
                if kd == 'noodle':   # 碗＋麵條＋配料
                    d.ellipse([CW * 0.18, CW * 0.42, CW * 0.82, CW * 0.86], fill=(250, 246, 236)); d.ellipse([CW * 0.24, CW * 0.46, CW * 0.76, CW * 0.7], fill=(236, 196, 120))
                    for k in range(5): y_ = CW * (0.5 + k * 0.035); d.arc([CW * 0.28, y_ - 6, CW * 0.72, y_ + 6], 0, 180, fill=(250, 226, 160), width=2)
                    d.ellipse([CW * 0.55, CW * 0.48, CW * 0.66, CW * 0.56], fill=(200, 60, 40)); d.ellipse([CW * 0.34, CW * 0.5, CW * 0.43, CW * 0.57], fill=(70, 150, 70))
                elif kd == 'snack':   # 一堆洋芋片／蝦餅
                    for k in range(9): cx_, cy_ = CW * _R.uniform(0.2, 0.8), CW * _R.uniform(0.5, 0.82); d.ellipse([cx_ - 14, cy_ - 8, cx_ + 14, cy_ + 8], fill=(242, 206, 120), outline=(200, 150, 70))
                elif kd == 'flat':    # 透明窗看得到裡面的米粉／米紙
                    d.rounded_rectangle([CW * 0.14, CW * 0.44, CW * 0.86, CW * 0.86], 10, fill=(236, 232, 220))
                    for k in range(7): x_ = CW * (0.18 + k * 0.1); d.line([x_, CW * 0.46, x_ + _R.uniform(-6, 6), CW * 0.84], fill=(250, 248, 240), width=3)
                else:                 # 盒裝（餅乾、茶包）：一塊色塊＋圓形圖
                    d.rectangle([0, CW * 0.55, CW, CW], fill=lt); d.ellipse([CW * 0.3, CW * 0.48, CW * 0.7, CW * 0.86], fill=acc)
                d.rounded_rectangle([CW * 0.12, CW * 0.17, CW * 0.88, CW * 0.38], 8, fill=(250, 250, 246))   # 名字的白色區塊：假字（一條條色塊，不是字）
                for k in range(_R.randint(2, 4)): w_ = _R.uniform(0.08, 0.16); x_ = CW * (0.16 + k * 0.17); d.rectangle([x_, CW * 0.22, x_ + CW * w_, CW * 0.33], fill=acc if k % 2 == 0 else dk)
                d.ellipse([CW * 0.78, CW * 0.06, CW * 0.95, CW * 0.23], fill=(240, 200, 40))            # 角落的小圓標
                for k in range(CW): a_ = 1.0 + 0.10 * math.sin(k / CW * 3.0)                             # 塑膠袋的一道反光
                at.paste(im, (c_ * CW, r_ * CW)); PKUV.setdefault(kd, []).append([c_ / 8, 1 - (r_ + 1) / 8, (c_ + 1) / 8, 1 - r_ / 8])
        for c_ in range(4):   # v2.1（BB：端架招牌純色板）：特價看板 256×128——黃／紅底、左邊白色爆炸星＋價錢（假字）、右邊一碗麵、下緣墨綠條
            bg = ((240, 176, 32), (216, 54, 42), (240, 176, 32), (30, 90, 62))[c_]; im = Image.new('RGB', (CW * 2, CW), bg); d = ImageDraw.Draw(im); dk = (190, 30, 30) if c_ != 1 else (250, 214, 40)
            st = [(64 + (46 if k % 2 == 0 else 28) * math.cos(k * math.pi / 8), 62 + (46 if k % 2 == 0 else 28) * math.sin(k * math.pi / 8)) for k in range(16)]; d.polygon(st, fill=(252, 250, 240))
            for k in range(2): d.rectangle([40, 48 + k * 16, 40 + _R.uniform(36, 50), 58 + k * 16], fill=dk)
            d.ellipse([140, 46, 230, 106], fill=(250, 246, 236)); d.ellipse([148, 50, 222, 84], fill=(236, 196, 120)); d.ellipse([186, 54, 200, 66], fill=(200, 60, 40)); d.ellipse([160, 58, 172, 68], fill=(70, 150, 70))
            for k in range(3): d.rectangle([132 + k * 30, 14, 132 + k * 30 + _R.uniform(16, 24), 30], fill=(252, 250, 240) if c_ in (1, 3) else (120, 20, 20))
            d.rectangle([0, CW - 12, CW * 2, CW], fill=(30, 90, 62) if c_ != 3 else (240, 176, 32))
            at.paste(im, (c_ * 2 * CW, 4 * CW)); PKUV.setdefault('sign', []).append([c_ * 2 / 8, 1 - 5 / 8, (c_ * 2 + 2) / 8, 1 - 4 / 8])
        _pk = os.path.join(STAGE, 'tz_dongnan_packs.png'); at.save(_pk)
        _m = bpy.data.materials.new('tzs_dongnan_packs'); _m.use_nodes = True; _n = _m.node_tree; _b = _n.nodes['Principled BSDF']; _b.inputs['Roughness'].default_value = 0.35
        _t = _n.nodes.new('ShaderNodeTexImage'); _t.image = bpy.data.images.load(_pk); _n.links.new(_t.outputs['Color'], _b.inputs['Base Color']); M['packs'] = _m
    def pkq(kd, lb, rb, rt, lt_):   # 包裝正面一塊（四個角＝看的人那邊的左下、右下、右上、左上）
        PQ.append((PKUV[kd][RRV.randrange(len(PKUV[kd]))], [g2b(*p_) for p_ in (lb, rb, rt, lt_)]))
    if CC0:   # SHOP-REALISM-1112（LAWWW2-C 11-13）：貨架本體 → 白塑膠（烤漆）、立柱和鐵桿 → 不鏽鋼、紙箱 → ambientCG 紙箱、黑色 → 深色塑膠、收銀台美耐板 → 木頭；
        #   收銀機 → Poly Haven CashRegister_01、紅藍塑膠籃 → Poly Haven plastic_crate；一包包貨品、價格條、三角旗照舊頂點色（太小，分不到材質的紋理）
        ROUTE = {'#e9e7de': 'plastic_w', '#f1efe6': 'plastic_w', '#eceeee': 'plastic_w', '#c9c8c0': 'steel', '#c4c8cb': 'steel', '#2a2d31': 'plastic_dk', '#1f2023': 'plastic_dk',
                 '#c9a878': 'cardboard', '#d2b48a': 'cardboard', '#b89868': 'cardboard', '#e2d8c2': 'wood',
                 '#d9dad6': 'plastic_w', '#1f5a3e': 'plastic_grn'}   # v2：天花板輕鋼架、墨綠色帶也進材質組（shop_cc0 第③項）
        _vc0 = vc; vc = lambda: _Route(_vc0(), ROUTE); vm = lambda: _AsTex(mesh('steel'))
    NOOD = [['#d8362a', '#f0b020', '#e86a1c', '#f4e9c8'], ['#2f8a4a', '#f0b020', '#d8362a', '#f6f1e0'], ['#e86a1c', '#7a2a8a', '#f0d040', '#d8362a'], ['#f4c8d0', '#3a7ac0', '#f0b020', '#2f8a4a']]
    DRY = [['#f1ead6', '#e8d9a8', '#f6f1e0', '#d8362a'], ['#e8d9a8', '#2f8a4a', '#f1ead6', '#f0b020']]
    def bottles(x0, x1, y, z0, z1, along, k, hmin=0.16, hmax=0.24):
        """一排瓶子（魚露、醬油、辣醬、椰奶）：一段一段同一種——瓶身、瓶肩、瓶蓋、一圈標籤"""
        KIND = (('#5a2a14', '#d8362a', '#f0d040'), ('#2a1a10', '#f0b020', '#d8362a'), ('#c8301c', '#2f8a4a', '#f6f1e0'), ('#d89a2a', '#d8362a', '#f6f1e0'), ('#f4f1e6', '#3a7ac0', '#3a7ac0'), ('#3f7a3a', '#f0d040', '#f6f1e0'))
        a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.05; run = k
        while a < a1 - 0.06:
            col, cap, lab = KIND[run % len(KIND)]; r = RR.choice((0.032, 0.038)); h = RR.uniform(hmin, hmax); e = min(a1 - 0.03, a + RR.uniform(0.4, 0.7))
            while a + r <= e:
                px, pz = ((x0 + x1) / 2, a) if along == 'z' else (a, (z0 + z1) / 2)
                ccyl(vc(), (px, y, pz), (px, y + h * 0.7, pz), r, col, seg=6, caps=False); ccyl(vc(), (px, y + h * 0.7, pz), (px, y + h, pz), r, col, seg=6, r2=r * 0.4, caps=False); ccyl(vc(), (px, y + h, pz), (px, y + h + 0.025, pz), r * 0.45, cap, seg=6, caps=not CC0)
                ccyl(vc(), (px, y + h * 0.2, pz), (px, y + h * 0.5, pz), r + 0.002, lab, seg=6, caps=False)
                a += 2 * r + 0.012
            a = e + 0.03; run += 1
    def cans(x0, x1, y, z0, z1, along, k):
        """罐頭：兩層疊著，一段一段同一種"""
        if CC0:   # v2（BB_379 印得好同一個 FAIL：一樣大小排格子）：Poly Haven 罐頭組（三罐一組、有標籤貼圖），兩層疊、大小角度略有不同、偶爾少一組
            a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.04
            while a < a1 - 0.15:
                sc = RRV.uniform(0.85, 1.15); w_ = 0.142 * sc
                if RRV.random() > 0.08:
                    for j in range(RRV.choice((1, 1, 1, 2))):
                        px, pz = ((x0 + x1) / 2 + RRV.uniform(-0.03, 0.03), a + w_ / 2) if along == 'z' else (a + w_ / 2, (z0 + z1) / 2 + RRV.uniform(-0.03, 0.03))
                        ph_put('russian_food_cans_01', px, y + j * 0.085 * sc, pz, (PI / 2 if along == 'z' else 0.0) + RRV.uniform(-0.15, 0.15), sc, height=0.085, decimate=0.03)   # v2.1：0.1→0.03（BB／LAWWW：一間大店 ≤8 萬面）
                a += w_ + RRV.uniform(0.01, 0.04)
            return
        KIND = (('#d8362a', '#f6f1e0'), ('#2f8a4a', '#f0d040'), ('#f0b020', '#d8362a'), ('#3a7ac0', '#f6f1e0'), ('#f6f1e0', '#2f8a4a'))
        a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.05; run = k
        while a < a1 - 0.06:
            col, lab = KIND[run % len(KIND)]; r = 0.04; h = RR.choice((0.075, 0.1)); e = min(a1 - 0.03, a + RR.uniform(0.35, 0.6))
            while a + r <= e:
                px, pz = ((x0 + x1) / 2, a) if along == 'z' else (a, (z0 + z1) / 2)
                for j in range(2): ccyl(vc(), (px, y + j * (h + 0.004), pz), (px, y + j * (h + 0.004) + h, pz), r, '#c4c8cb', seg=8); ccyl(vc(), (px, y + j * (h + 0.004) + h * 0.12, pz), (px, y + j * (h + 0.004) + h * 0.88, pz), r + 0.002, col if j == 0 else lab if run % 2 else col, seg=8, caps=False)
                a += 2 * r + 0.01
            a = e + 0.03; run += 1
    def packs(x0, x1, y, z0, z1, along, k, kind, front=1):
        """一排包裝好的東西（DONGNAN-GOODS-1112；BB 11-12 ④ FAIL：「商品是彩色方塊」＝店面標準 §12 第 2 點不用球和方塊充數）：一段一段同一種，
        kind：'noodle' 袋裝泡麵（扁袋、上緣一條封口、正面一條色帶）｜'cup' 杯麵（上寬下窄的杯子＋蓋）｜'snack' 零食大包（鼓鼓的袋子、上面捏起來的封口、色帶）｜
        'flat' 乾貨（河粉、米紙：薄薄一包立著，上半一塊標籤）。front＝正面朝哪一邊（along='z'：+1 朝 +x、−1 朝 −x；along='x'：朝 +z）。不寫品牌。"""
        PAL = {'noodle': (('#d8362a', '#f0d040'), ('#e86a1c', '#f6f1e0'), ('#2f8a4a', '#f0b020'), ('#f0b020', '#d8362a'), ('#7a2a8a', '#f0d040'), ('#f4e9c8', '#d8362a')),
               'cup': (('#f6f1e0', '#d8362a'), ('#d8362a', '#f0d040'), ('#f0b020', '#2f8a4a'), ('#2f8a4a', '#f6f1e0')),
               'snack': (('#f0b020', '#d8362a'), ('#d8362a', '#f6f1e0'), ('#3a7ac0', '#f0d040'), ('#2f8a4a', '#f0b020'), ('#f4c8d0', '#d8362a'), ('#e86a1c', '#2a1a10')),
               'flat': (('#f1ead6', '#d8362a'), ('#e8d9a8', '#2f8a4a'), ('#f6f1e0', '#f0b020'), ('#efe2c0', '#3a7ac0'))}[kind]
        DIM = {'noodle': (0.13, 0.16, 0.045), 'cup': (0.105, 0.1, 0.1), 'snack': (0.17, 0.24, 0.06), 'flat': (0.1, 0.26, 0.03)}[kind]
        a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.04; run = k
        if along == 'z': fpos = (x1 - 0.03) if front > 0 else (x0 + 0.03)
        else: fpos = z1 - 0.03; front = 1
        def face(d0, ya, yb, p0, p1, kd, bulge=0.0):   # v2：正面印刷（法線朝看的人；正反不疊面，免得烘焙烘黑）；v2.1 bulge＞0：中間鼓起來的袋子（3×4 格，邊緣貼回盒面）
            dd = fpos - front * (d0 + push[0]) + front * 0.0012
            if along == 'z':
                C = ((dd, y + ya, p1), (dd, y + ya, p0), (dd, y + yb, p0), (dd, y + yb, p1)) if front > 0 else ((dd, y + ya, p0), (dd, y + ya, p1), (dd, y + yb, p1), (dd, y + yb, p0)); nv = (front, 0.0, 0.0)
            else: C = ((p0, y + ya, dd), (p1, y + ya, dd), (p1, y + yb, dd), (p0, y + yb, dd)); nv = (0.0, 0.0, 1.0)
            if not bulge: pkq(kd, *C); return
            u0, v0, u1, v1 = PKUV[kd][RRV.randrange(len(PKUV[kd]))]; NU, NV = 2, 3; bz = bulge * RRV.uniform(0.75, 1.15)
            def P(s_, t_):
                b_ = bz * math.sin(math.pi * s_) * math.sin(math.pi * t_) ** 0.6
                return tuple(C[0][k] * (1 - s_) * (1 - t_) + C[1][k] * s_ * (1 - t_) + C[2][k] * s_ * t_ + C[3][k] * (1 - s_) * t_ + nv[k] * b_ for k in range(3))
            for i_ in range(NU):
                for j_ in range(NV):
                    s0, s1, t0, t1 = i_ / NU, (i_ + 1) / NU, j_ / NV, (j_ + 1) / NV
                    PQ.append(((u0 + (u1 - u0) * s0, v0 + (v1 - v0) * t0, u0 + (u1 - u0) * s1, v0 + (v1 - v0) * t1), [g2b(*P(s0, t0)), g2b(*P(s1, t0)), g2b(*P(s1, t1)), g2b(*P(s0, t1))]))
        def cuplab(cx_, cz_, ya, yb, r0, r1):   # v2.1：杯麵正面一塊印刷（上寬下窄，跟著杯身斜）
            nv = (front, 0.0, 0.0) if along == 'z' else (0.0, 0.0, 1.0); lv = (0.0, 0.0, float(front)) if along == 'z' else (-1.0, 0.0, 0.0)
            def Q(r_, yy, sd): return (cx_ + nv[0] * (r_ + 0.0015) + lv[0] * r_ * 0.8 * sd, yy, cz_ + nv[2] * (r_ + 0.0015) + lv[2] * r_ * 0.8 * sd)
            pkq('noodle', Q(r0, ya, 1), Q(r0, ya, -1), Q(r1, yb, -1), Q(r1, yb, 1))
        def bx(d0, d1, ya, yb, p0, p1, col):   # d＝從正面往裡的深度；p＝沿貨架方向
            if CC0: d0 += push[0]; d1 += push[0]   # v2：有的往後推（被拿走前排的）
            lo, hi = sorted((fpos - front * d0, fpos - front * d1))
            if along == 'z': vc().cbox(lo, hi, y + ya, y + yb, p0, p1, col)
            else: vc().cbox(p0, p1, y + ya, y + yb, lo, hi, col)
        push = [0.0]
        while a < a1 - 0.08:
            push[0] = RRV.choice((0.0, 0.0, 0.0, 0.03, 0.07)) if CC0 else 0.0
            col, c2 = PAL[run % len(PAL)]; w, h, t = DIM; h *= RR.uniform(0.94, 1.06); e = min(a1 - 0.03, a + RR.uniform(0.45, 0.8))
            while a + w <= e:
                if CC0 and RRV.random() < 0.07: a += w + 0.012; continue   # v2：賣掉了的空格
                if CC0: h = DIM[1] * RRV.uniform(0.85, 1.12)              # v2：同一種也高低不一
                if kind == 'cup':
                    pc = a + w / 2; cx_, cz_ = ((fpos - front * 0.06, pc) if along == 'z' else (pc, fpos - 0.06))
                    if CC0:   # v2.1（BB：杯麵是低面數六角柱）→ 圓杯（12 邊）、紙蓋、正面印刷；有的疊兩個
                        for lv_ in range(2 if RR.random() < 0.15 else 1):
                            yy_ = y + lv_ * (h + 0.01); ccyl(vc(), (cx_, yy_, cz_), (cx_, yy_ + h, cz_), 0.036, '#f6f1e0', seg=8, r2=0.048, caps=False); ccyl(vc(), (cx_, yy_ + h, cz_), (cx_, yy_ + h + 0.006, cz_), 0.05, c2, seg=8)
                            cuplab(cx_, cz_, yy_ + h * 0.12, yy_ + h * 0.92, 0.036 + 0.012 * 0.12, 0.036 + 0.012 * 0.92)
                    else:
                        ccyl(vc(), (cx_, y, cz_), (cx_, y + h, cz_), 0.036, col, seg=6, r2=0.048, caps=False); ccyl(vc(), (cx_, y + h, cz_), (cx_, y + h + 0.008, cz_), 0.05, c2, seg=6); ccyl(vc(), (cx_, y + h * 0.35, cz_), (cx_, y + h * 0.7, cz_), 0.0415, c2, seg=6, r2=0.0455, caps=False)
                        if RR.random() < 0.35: ccyl(vc(), (cx_, y + h + 0.01, cz_), (cx_, y + 2 * h + 0.01, cz_), 0.036, col, seg=6, r2=0.048, caps=False); ccyl(vc(), (cx_, y + 2 * h + 0.01, cz_), (cx_, y + 2 * h + 0.018, cz_), 0.05, c2, seg=6)   # 疊兩個
                elif kind == 'noodle':
                    bx(0.004, t, 0.0, h, a, a + w, col)
                    if not CC0: bx(0.016, 0.03, h, h + 0.012, a - 0.004, a + w + 0.004, col)   # v2.1：封口那條印在包裝圖上了（貼圖集上緣深色一條），省一個方塊
                    if CC0: face(0.004, h * 0.04, h * 0.98, a + 0.003, a + w - 0.003, 'noodle')
                    else: bx(0.0, 0.004, h * 0.3, h * 0.62, a + 0.008, a + w - 0.008, c2)
                elif kind == 'snack':
                    if CC0:   # v2.1（BB：零食是硬方盒）→ 鼓鼓的枕頭形袋子：薄薄的袋身＋正面鼓起來、上下兩道鋸齒封口
                        bx(0.03, t, h * 0.06, h * 0.86, a + 0.006, a + w - 0.006, col); bx(0.028, 0.04, h * 0.86, h, a + 0.012, a + w - 0.012, col)
                        face(0.03, h * 0.06, h * 0.86, a + 0.006, a + w - 0.006, 'snack', bulge=0.045)
                    else: bx(0.006, t, 0.0, h * 0.86, a, a + w, col); bx(0.022, 0.036, h * 0.86, h, a + 0.01, a + w - 0.01, col)
                    if CC0: pass   # 非 CC0 才畫中間那條色帶
                    else: bx(0.0, 0.006, h * 0.36, h * 0.6, a + 0.012, a + w - 0.012, c2)
                else:
                    bx(0.003, t, 0.0, h, a, a + w, col)
                    if CC0: face(0.003, h * 0.03, h * 0.97, a + 0.003, a + w - 0.003, 'flat')
                    else: bx(0.0, 0.003, h * 0.55, h * 0.86, a + 0.012, a + w - 0.012, c2)
                a += w + 0.012
            a = e + 0.035; run += 1
    def carton(x0, x1, y0, y1, z0, z1, col='#c9a878', band=None):
        """紙箱（DONGNAN-GOODS-1112 第 2 包；BB 11-12：還剩兩處純色方塊）：牛皮紙色箱身、頂面和兩個端面中間一條封箱膠帶、四個側面一條色帶、箱蓋的接縫"""
        vc().cbox(x0, x1, y0, y1, z0, z1, col); xm, zm, t = (x0 + x1) / 2, (z0 + z1) / 2, 0.003; tape = '#e6d6a6'
        if (x1 - x0) >= (z1 - z0):
            vc().cbox(x0 - t, x1 + t, y1, y1 + t, zm - 0.028, zm + 0.028, tape)
            for (a_, b_) in ((x0 - t, x0), (x1, x1 + t)): vc().cbox(a_, b_, y1 - 0.07, y1 + t, zm - 0.028, zm + 0.028, tape)
        else:
            vc().cbox(xm - 0.028, xm + 0.028, y1, y1 + t, z0 - t, z1 + t, tape)
            for (a_, b_) in ((z0 - t, z0), (z1, z1 + t)): vc().cbox(xm - 0.028, xm + 0.028, y1 - 0.07, y1 + t, a_, b_, tape)
        if band:
            ya, yb = y0 + (y1 - y0) * 0.3, y0 + (y1 - y0) * 0.62
            vc().cbox(x0 - t, x1 + t, ya, yb, z0 + 0.02, z1 - 0.02, band); vc().cbox(x0 + 0.02, x1 - 0.02, ya, yb, z0 - t, z1 + t, band)
    def crate(x0, x1, y0, y1, z0, z1, col, caps='#f6f1e0'):
        """塑膠飲料籃：底、四圈邊條、四角柱、側面的直格線（格子之間是空的，看得到裡面的瓶子）、裡面一格一格的瓶蓋"""
        t = 0.014; dark = '#2a2d31'
        vc().cbox(x0, x1, y0, y0 + 0.02, z0, z1, col)
        for (ya, yb) in ((y0, y0 + 0.05), (y1 - 0.05, y1), ((y0 + y1) / 2 - 0.018, (y0 + y1) / 2 + 0.018)):
            vc().cbox(x0, x1, ya, yb, z0, z0 + t, col); vc().cbox(x0, x1, ya, yb, z1 - t, z1, col); vc().cbox(x0, x0 + t, ya, yb, z0, z1, col); vc().cbox(x1 - t, x1, ya, yb, z0, z1, col)
        nx, nz = max(2, round((x1 - x0) / 0.075)), max(2, round((z1 - z0) / 0.075))
        for k in range(nx + 1):
            xx = x0 + (x1 - x0 - t) * k / nx
            for zz in (z0, z1 - t): vc().cbox(xx, xx + t, y0, y1, zz, zz + t, col)
        for k in range(nz + 1):
            zz = z0 + (z1 - z0 - t) * k / nz
            for xx in (x0, x1 - t): vc().cbox(xx, xx + t, y0, y1, zz, zz + t, col)
        vc().cbox(x0 + t, x1 - t, y0 + 0.02, y1 - 0.09, z0 + t, z1 - t, dark)   # 裡面（瓶身擠在一起，暗的）
        for i in range(nx):
            for j in range(nz):
                px, pz = x0 + (x1 - x0) * (i + 0.5) / nx, z0 + (z1 - z0) * (j + 0.5) / nz
                if not CC0: ccyl(vc(), (px, y1 - 0.09, pz), (px, y1 - 0.02, pz), 0.02, '#3f2a1a', seg=6, caps=False)   # v2.1：瓶身在暗的籃子裡看不到，只留瓶蓋
                ccyl(vc(), (px, y1 - 0.02, pz), (px, y1 - 0.005, pz), 0.016, caps, seg=6)
    def wshelf(o, along, face, fill, levels=(0.2, 0.58, 0.96, 1.34, 1.72)):
        """靠牆的貨架：底座、背板、立柱、層板（前緣一條紅色價格條）"""
        x0, x1, z0, z1, h = o['x0'], o['x1'], o['z0'], o['z1'], o['h']
        vc().cbox(x0, x1, 0.0, 0.2, z0, z1, BODY); vc().cbox(x0, x1, h, h + 0.03, z0, z1, BODY)
        if along == 'z':
            (vc().cbox(x0, x0 + 0.03, 0.2, h, z0, z1, BODY) if face > 0 else vc().cbox(x1 - 0.03, x1, 0.2, h, z0, z1, BODY)); n = max(1, round((z1 - z0) / 1.2))
            for k in range(n + 1): zz = z0 + (z1 - z0) * k / n; vc().cbox(x0, x1, 0.0, h + 0.03, zz - 0.015, zz + 0.015, POST)
            xe = (x1, x1 + 0.004) if face > 0 else (x0 - 0.004, x0)
            for i, y in enumerate(levels): vc().cbox(x0, x1, y - 0.022, y, z0, z1, BODY); vc().cbox(xe[0], xe[1], y - 0.03, y + 0.004, z0, z1, RED if i % 2 else YEL); fill(i, y)
        else:
            vc().cbox(x0, x1, 0.2, h, z0, z0 + 0.03, BODY); n = max(1, round((x1 - x0) / 1.2))
            for k in range(n + 1): xx = x0 + (x1 - x0) * k / n; vc().cbox(xx - 0.015, xx + 0.015, 0.0, h + 0.03, z0, z1, POST)
            for i, y in enumerate(levels): vc().cbox(x0, x1, y - 0.022, y, z0, z1, BODY); vc().cbox(x0, x1, y - 0.03, y + 0.004, z1, z1 + 0.004, RED if i % 2 else YEL); fill(i, y)
    # 左牆：泡麵（上面三層：一包一包）、零食大包（下面兩層）
    wshelf(WS, 'z', 1, lambda i, y: packs(WS['x0'] + 0.05, WS['x1'], y, WS['z0'] + 0.04, WS['z1'] - 0.04, 'z', i * 3, ('snack', 'snack', 'noodle', 'cup', 'noodle')[i], front=1))
    # 後牆：最下面大鐵罐和紙箱、罐頭、兩層瓶子（魚露、醬油、辣醬）、最上面罐頭；上面黃底紅字店名（概念圖裁的）
    def back_fill(i, y):
        a, b, c, d = BS['x0'] + 0.04, BS['x1'] - 0.04, BS['z0'] + 0.08, BS['z1'] - 0.03
        if i == 0:   # 最下面：紙箱（封箱膠帶、色帶）和大鐵罐（食用油、椰奶：罐身一圈標籤、罐蓋）交錯
            xx = a; k = 0
            while xx + 0.3 < b:
                if k % 3 == 2:
                    for q in range(2): px = xx + 0.09 + q * 0.19; ccyl(vc(), (px, y, (c + d) / 2), (px, y + 0.28, (c + d) / 2), 0.085, '#c4c8cb', seg=10); ccyl(vc(), (px, y + 0.05, (c + d) / 2), (px, y + 0.22, (c + d) / 2), 0.087, (RED, YEL, GRN)[(k + q) % 3], seg=10, caps=False); ccyl(vc(), (px, y + 0.28, (c + d) / 2), (px, y + 0.295, (c + d) / 2), 0.05, '#8a8f98', seg=8)
                    xx += 0.42
                else:
                    w_ = RR.uniform(0.3, 0.38); carton(xx, xx + w_, y, y + RR.uniform(0.22, 0.3), c, d - 0.01, ('#c9a878', '#b89868', '#d2b48a')[k % 3], band=(RED, YEL, GRN, '#3a7ac0')[k % 4]); xx += w_ + 0.03
                k += 1
        elif i in (1, 4): cans(a, b, y, c, d, 'x', i)
        else: bottles(a, b, y, c, d, 'x', i * 2)
    wshelf(BS, 'x', 1, back_fill); zb = -D / 2 + 0.03
    vc().cbox(-2.95, 1.45, 2.22, 2.96, -D / 2, zb, YEL); vc().cbox(-2.97, 1.47, 2.2, 2.22, -D / 2, zb + 0.01, RED); vc().cbox(-2.97, 1.47, 2.96, 2.98, -D / 2, zb + 0.01, RED)
    pic('sign', [(-2.85, 2.26, zb + 0.004), (1.35, 2.26, zb + 0.004), (1.35, 2.93, zb + 0.004), (-2.85, 2.93, zb + 0.004)])
    # 右牆：乾貨（河粉、米紙、香料包：扁扁一包一包立著）
    wshelf(RS, 'z', -1, lambda i, y: packs(RS['x0'], RS['x1'] - 0.05, y, RS['z0'] + 0.04, RS['z1'] - 0.04, 'z', i * 2 + 1, ('flat', 'flat', 'noodle', 'flat', 'cup')[i], front=-1))
    # 中間兩排雙面貨架（泡麵、零食、餅乾）；架頂疊幾箱貨、朝門口那一頭掛一塊特價牌
    for g in J['gondolas']:
        gondola(g, NOOD, body=BODY, fill=lambda xa, xb, y, za, zb, al, i, g=g: packs(xa, xb, y, za, zb, al, i * 2, ('snack', 'noodle', 'cup', 'noodle', 'snack', 'flat')[i % 6], front=(-1 if (xa + xb) / 2 < (g['x0'] + g['x1']) / 2 else 1)))
        for k in range(3): zz = g['z0'] + 0.3 + k * 1.25; carton(g['x0'] + 0.1, g['x1'] - 0.1, g['h'], g['h'] + 0.26, zz, zz + 0.5, ('#c9a878', '#b89868', '#d2b48a')[k], band=(RED, GRN, '#3a7ac0')[k])
        xm = (g['x0'] + g['x1']) / 2; vc().cbox(xm - 0.32, xm + 0.32, 1.05, 1.45, g['z1'], g['z1'] + 0.012, YEL)
        if CC0: zf = g['z1'] + 0.0132; pkq('sign', (xm - 0.32, 1.05, zf), (xm + 0.32, 1.05, zf), (xm + 0.32, 1.45, zf), (xm - 0.32, 1.45, zf))   # v2.1：印刷的特價看板
        else: vc().cbox(xm - 0.26, xm + 0.26, 1.2, 1.3, g['z1'] + 0.012, g['z1'] + 0.016, RED)
        for k in range(3):
            cx0, cx1, col = xm - 0.31 + k * 0.215, xm - 0.115 + k * 0.215, ('#3a7ac0', '#d8362a', '#2f8a4a')[k]
            for j in range(2 - (k % 2)): crate(cx0, cx1, j * 0.25, j * 0.25 + 0.24, g['z1'] + 0.02, g['z1'] + 0.3, col, caps=('#f6f1e0', '#f0b020', '#d8362a')[k])   # 貨架頭：一箱箱的飲料（在阻擋範圍裡——配置的 blocks 比貨架長 0.3）
    # 飲料冰箱（三門玻璃）：黑框、裡面白色層架、一瓶瓶飲料；上面一條墨綠燈箱
    fx0, fx1, fz0, fz1, fh = FG['x0'], FG['x1'], FG['z0'], FG['z1'], FG['h']
    vc().cbox(fx0, fx1, 0.0, 0.2, fz0, fz1, '#2a2d31'); vc().cbox(fx1 - 0.06, fx1, 0.2, fh - 0.16, fz0, fz1, '#f4f5f4'); vc().cbox(fx0, fx1, fh - 0.16, fh, fz0, fz1, GRN)
    for zz in (fz0, fz1 - 0.04): vc().cbox(fx0, fx1, 0.2, fh - 0.16, zz, zz + 0.04, '#2a2d31')
    mesh('light').box(fx0 - 0.004, fx0, fh - 0.13, fh - 0.03, fz0 + 0.1, fz1 - 0.1)
    for k in range(4): zz = fz0 + (fz1 - fz0) * k / 3; vc().cbox(fx0, fx0 + 0.05, 0.2, fh - 0.16, zz - 0.025, zz + 0.025, '#1f2023')
    for k in range(3): zz = fz0 + (fz1 - fz0) * (k + 1) / 3 - 0.1; vc().cbox(fx0 - 0.03, fx0 - 0.015, 0.9, 1.3, zz, zz + 0.02, '#c4c8cb')   # 門把
    DR = ['#d8362a', '#f0b020', '#2f8a4a', '#3a7ac0', '#f6f1e0', '#7a4a2a', '#e86a1c', '#8ac0e0']
    for i, y in enumerate((0.26, 0.6, 0.94, 1.28, 1.58)):
        vc().cbox(fx0 + 0.06, fx1 - 0.06, y - 0.02, y, fz0 + 0.04, fz1 - 0.04, '#eceeee'); a = fz0 + 0.1; run = i
        while a < fz1 - 0.1:
            col = DR[run % len(DR)]; e = min(fz1 - 0.08, a + RR.uniform(0.3, 0.5)); can = run % 3 == 0
            while a + 0.035 <= e:
                for xx in (fx0 + 0.16,):
                    if can: ccyl(vc(), (xx, y, a), (xx, y + 0.12, a), 0.033, col, seg=6)
                    else: ccyl(vc(), (xx, y, a), (xx, y + 0.17, a), 0.033, col, seg=6, caps=False); ccyl(vc(), (xx, y + 0.17, a), (xx, y + 0.24, a), 0.033, col, seg=6, r2=0.013); 
                a += 0.08
            a = e + 0.03; run += 1
    mesh('glass').quad([(fx0 + 0.02, 0.22, fz0 + 0.03), (fx0 + 0.02, 0.22, fz1 - 0.03), (fx0 + 0.02, fh - 0.18, fz1 - 0.03), (fx0 + 0.02, fh - 0.18, fz0 + 0.03)])
    # 右後角：一疊疊的米袋（白底、紅色或綠色的帶子）、旁邊兩個大鐵桶
    if CC0:   # v2：米袋＝Poly Haven 麻袋（上成米白，保留布紋和皺摺），一疊 3～5 包，每包角度、位置略不同；正面一條色帶
        for cx in (2.78, 3.42):
            for cz in (-4.2, -3.72):
                for j in range(3 + int(RRV.random() * 3)):
                    dx, dz = RRV.uniform(-0.03, 0.03), RRV.uniform(-0.02, 0.02)
                    ph_put('cement_bag', cx + dx, j * 0.15, cz + dz, PI / 2 + RRV.uniform(-0.12, 0.12), 0.84, height=0.17, recolor=('#a8a090', '#f4f0e2'), decimate=0.15)
                    vc().cbox(cx - 0.12 + dx, cx + 0.12 + dx, j * 0.15 + 0.03, j * 0.15 + 0.11, cz + dz - 0.2, cz + dz - 0.195, (RED, '#2f8a4a', YEL)[(j + int(cx * 3)) % 3])
    for cx in (2.78, 3.42):
        for cz in (-4.2, -3.72):
            n = 3 + int(RR.random() * 3)
            for j in range(n if not CC0 else 0):
                dx = RR.uniform(-0.03, 0.03); vc().crbox(cx - 0.29 + dx, cx + 0.29 + dx, j * 0.15, j * 0.15 + 0.145, cz - 0.21, cz + 0.21, '#f1ede0', r=0.05); vc().cbox(cx - 0.12 + dx, cx + 0.12 + dx, j * 0.15 + 0.02, j * 0.15 + 0.125, cz - 0.213, cz + 0.213, (RED, '#2f8a4a', YEL)[(j + int(cx * 3)) % 3])
    for k in range(2): ccyl(vc(), (2.62 + k * 0.42, 0.0, -3.4), (2.62 + k * 0.42, 0.42, -3.4), 0.17, ('#3a7ac0', '#c4c8cb')[k], seg=12)
    # 收銀台（淺色美耐板、墨綠踢腳）：收銀機、電子秤、糖果罐、一盒盒口香糖；上面一根桿子掛一串串零食
    vc().cbox(CT['x0'], CT['x1'], 0.1, CT['h'] - 0.04, CT['z0'], CT['z1'], '#e2d8c2'); vc().cbox(CT['x0'], CT['x1'], 0.0, 0.1, CT['z0'] - 0.005, CT['z1'], GRN); vc().crbox(CT['x0'] - 0.03, CT['x1'] + 0.03, CT['h'] - 0.04, CT['h'], CT['z0'] - 0.04, CT['z1'] + 0.02, '#f1efe6', r=0.012)
    vc().cbox(CT['x0'], CT['x0'] + 0.04, 0.0, CT['h'] - 0.04, CT['z1'], 4.5 - 1.1, '#e2d8c2')   # 櫃台側板往窗邊接一小段（客人繞不進去）
    hC = CT['h']
    if CC0: ph_put('CashRegister_01', 2.51, hC, 2.46, 0.0, height=0.3, decimate=0.15)   # 收銀機（Poly Haven）
    else: vc().cbox(2.3, 2.72, hC, hC + 0.12, 2.3, 2.62, '#2a2d31'); vc().cbox(2.34, 2.68, hC + 0.12, hC + 0.36, 2.52, 2.56, '#1f2023'); vc().cbox(2.36, 2.66, hC + 0.14, hC + 0.34, 2.515, 2.52, '#8ac0e0')
    vc().cbox(1.72, 2.05, hC, hC + 0.05, 2.28, 2.6, '#c4c8cb'); vc().cbox(1.74, 2.03, hC + 0.05, hC + 0.06, 2.3, 2.58, '#eceeee'); vc().cbox(1.8, 1.97, hC + 0.06, hC + 0.16, 2.56, 2.6, '#2a2d31')
    for k, col in enumerate((RED, YEL, '#2f8a4a')): ccyl(vc(), (2.86 + (k % 2) * 0.14, hC, 2.25 + k * 0.13), (2.86 + (k % 2) * 0.14, hC + 0.16, 2.25 + k * 0.13), 0.05, col, seg=8); ccyl(vc(), (2.86 + (k % 2) * 0.14, hC + 0.16, 2.25 + k * 0.13), (2.86 + (k % 2) * 0.14, hC + 0.185, 2.25 + k * 0.13), 0.052, '#f6f1e0', seg=8)
    for k in range(4): vc().cbox(2.08 + k * 0.05, 2.12 + k * 0.05, hC, hC + 0.07, 2.14, 2.24, (RED, '#3a7ac0', YEL, '#2f8a4a')[k])
    ccyl(vm(), (CT['x0'], 2.32, CT['z0'] + 0.1), (CT['x1'] + 0.6, 2.32, CT['z0'] + 0.1), 0.012, '#c4c8cb', seg=6)
    for sx in (CT['x0'] + 0.02, CT['x1'] + 0.55): ccyl(vm(), (sx, 2.32, CT['z0'] + 0.1), (sx, H, CT['z0'] + 0.1), 0.008, '#c4c8cb', seg=4)
    for k in range(9 if CC0 else 0):   # v2：一串串小包零食（夾在一條塑膠夾條上：每包 9×11 cm、上緣封口、正面一塊白標籤；數量、角度不一）
        xx = CT['x0'] + 0.12 + k * 0.22; col = (RED, YEL, '#2f8a4a', '#e86a1c', '#3a7ac0')[k % 5]; zf = CT['z0'] + 0.1
        vc().cbox(xx - 0.008, xx + 0.008, 1.62, 2.3, zf - 0.004, zf + 0.004, '#f6f1e0')
        for j in range(RRV.randint(3, 6)):
            yt = 2.27 - j * (0.105 if CC0 else 0.135); dx = RRV.uniform(-0.01, 0.01)
            if CC0:   # v2.1（BB P2：零食串偏大）→ 7×9 cm 小包、扁扁的，正面印零食包裝（貼圖集），上緣一道封口
                hw = 0.035; vc().cbox(xx - hw + dx, xx + hw + dx, yt - 0.095, yt - 0.01, zf - 0.008, zf + 0.008, col); vc().cbox(xx - hw - 0.002 + dx, xx + hw + 0.002 + dx, yt - 0.01, yt, zf - 0.003, zf + 0.003, col)
                zq = zf - 0.008 - 0.0012; pkq('snack', (xx + hw + dx, yt - 0.095, zq), (xx - hw + dx, yt - 0.095, zq), (xx - hw + dx, yt - 0.01, zq), (xx + hw + dx, yt - 0.01, zq)); continue
            vc().crbox(xx - 0.045 + dx, xx + 0.045 + dx, yt - 0.11, yt - 0.012, zf - 0.012, zf + 0.012, col, r=0.008); vc().cbox(xx - 0.046 + dx, xx + 0.046 + dx, yt - 0.012, yt, zf - 0.004, zf + 0.004, col)
            vc().cbox(xx - 0.025 + dx, xx + 0.025 + dx, yt - 0.075, yt - 0.04, zf + 0.0125, zf + 0.0135, '#f6f1e0')
    for k in range(9 if not CC0 else 0):
        xx = CT['x0'] + 0.12 + k * 0.22; col = (RED, YEL, '#2f8a4a', '#e86a1c', '#3a7ac0')[k % 5]
        for j in range(5): vc().cbox(xx - 0.055, xx + 0.055, 2.3 - (j + 1) * 0.125, 2.3 - j * 0.125 - 0.015, CT['z0'] + 0.09, CT['z0'] + 0.115, col if j % 2 == 0 else '#f6f1e0')
    # 店員後面的東牆：小架子（電話卡、香菸大小的小盒子）、月曆
    for y in (1.2, 1.5, 1.8):
        vc().cbox(W / 2 - 0.22, W / 2, y - 0.02, y, 2.95, 4.15, BODY); goods(W / 2 - 0.2, W / 2 - 0.02, y, 2.97, 4.13, [RED, '#f6f1e0', '#3a7ac0', YEL, '#2f8a4a'], hmin=0.1, hmax=0.14, step=0.075)
    vc().cbox(W / 2 - 0.012, W / 2, 2.1, 2.7, 3.2, 3.7, '#f6f1e0'); vc().cbox(W / 2 - 0.016, W / 2 - 0.012, 2.5, 2.7, 3.2, 3.7, RED)
    # 左前窗邊：一疊疊紅藍塑膠籃、兩箱飲料；上面掛藤編燈罩和斗笠（概念圖門口左邊）
    def basket(x, y, z, col):
        w, d, h = 0.26, 0.19, 0.2
        vc().cbox(x - w, x + w, y, y + 0.015, z - d, z + d, col)
        for (a, b, c, e) in ((x - w, x - w + 0.015, z - d, z + d), (x + w - 0.015, x + w, z - d, z + d), (x - w, x + w, z - d, z - d + 0.015), (x - w, x + w, z + d - 0.015, z + d)): vc().cbox(a, b, y, y + h, c, e, col)
        vc().cbox(x - w - 0.012, x + w + 0.012, y + h - 0.03, y + h, z - d - 0.012, z - d, col); vc().cbox(x - w - 0.012, x + w + 0.012, y + h - 0.03, y + h, z + d, z + d + 0.012, col)
    for k, (bx, n, col) in enumerate(((-3.08, 4, '#c8301c'), (-2.5, 3, '#2a5aa8'))):
        if CC0:   # Poly Haven 塑膠籃（一疊紅、一疊藍；照原本的顏色重新上色，保留塑膠的紋路和磨損）
            aid, rc = (('plastic_crate_01', ('#6a1208', '#e0442c')), ('plastic_crate_02', ('#14305e', '#4a86d8')))[k]
            for j in range(n - 1): ph_put(aid, bx, j * 0.22, 3.95, 0.0, height=0.22, recolor=rc, decimate=(0.035 if k == 0 else 0.2))   # 原始 18k／5.8k 面 → 各約 2.2k
        else:
            for j in range(n): basket(bx, j * 0.11, 3.95, col)
    for (hx, hz, kind) in ((-3.0, 3.3, 'lamp'), (-2.35, 3.45, 'hat'), (-1.7, 3.3, 'lamp')):
        if kind == 'lamp': pendant(hx, hz, y=2.05)
        else:
            ccyl(vc(), (hx, 2.3, hz), (hx, H, hz), 0.005, '#2b2b2b', seg=4); ccyl(vc(), (hx, 2.12, hz), (hx, 2.3, hz), 0.3, '#d9b97a', seg=16, r2=0.01, caps=False); ccyl(vc(), (hx, 2.115, hz), (hx, 2.12, hz), 0.3, '#c4a060', seg=16)
    # 三角旗一串（橫過走道）、牆上的時鐘、門邊的盆栽
    PEN = [RED, YEL, '#2f8a4a', '#3a7ac0', '#e86a1c']
    for k in range(22): xx = -3.3 + k * 0.3; yy = 2.78 - 0.1 * math.sin(k / 21 * PI); vc().poly([(xx, yy, 1.9), (xx + 0.22, yy, 1.9), (xx + 0.11, yy - 0.24, 1.9)], PEN[k % 5]); vc().poly([(xx + 0.22, yy, 1.899), (xx, yy, 1.899), (xx + 0.11, yy - 0.24, 1.899)], PEN[k % 5])
    ccyl(vc(), (-W / 2 + 0.01, 2.55, 3.75), (-W / 2 + 0.04, 2.55, 3.75), 0.16, '#2a2d31', seg=16); ccyl(vc(), (-W / 2 + 0.04, 2.55, 3.75), (-W / 2 + 0.045, 2.55, 3.75), 0.14, '#f6f5f0', seg=16)
    PRE = 'WALL_Sfix:'
    for (a, b) in FR['windows']: vc().cbox(a, b, 2.45, 2.7, zS + 0.06, zS + 0.07, GRN)   # 玻璃上緣一條墨綠（外面雨棚的顏色）
    PRE = ''
    tubes((-3.3, -1.0, 1.3, 3.5), x0=-1.75, x1=1.75)


# ---------- 汀州聯通（汀州路；手機通訊行）----------
def _tint(hexcol, t):
    """顏色往白色混 t（反光的那一條）"""
    c = [int(hexcol[i:i + 2], 16) for i in (1, 3, 5)]; return '#%02x%02x%02x' % tuple(int(v + (255 - v) * t) for v in c)
if SHOP == 'liantong':
    SC, PW, CB, CT = J['showcase'], J['pegWall'], J['cabinet'], J['counter']
    BLUE, BLUE2, WHT, ALU, DK = '#1f3f9a', '#3f7ad0', '#f6f7f7', '#c4c8cb', '#1f2023'
    if CC0:   # SHOP-REALISM-1112（LAWWW2-C 11-13）：白色櫃子、溝槽板、櫃台、盒子 → 白塑膠；鋁框、鉻柱 → 不鏽鋼；黑色櫃腳、圓凳、螢幕框 → 深色塑膠；招牌藍 → 藍塑膠；工作台面 → 木頭。手機殼、小配件、資費海報的色塊照舊頂點色（太小，分不到材質的紋理）
        ROUTE = {c: 'plastic_w' for c in ('#f6f7f7', '#eceeee', '#f4f5f4')}
        ROUTE.update({'#c4c8cb': 'steel', '#1f2023': 'plastic_dk', '#1f3f9a': 'plastic_blue', '#e2d8c2': 'wood', '#d9dad6': 'plastic_w'})   # v1c：天花板輕鋼架格線也進白塑膠
        _vc0 = vc; vc = lambda: _Route(_vc0(), ROUTE); vm = lambda: _AsTex(mesh('steel'))
    RRV = random.Random(31); PQ = []; PKUV = {}   # v2：自己的亂數（不影響原本 RR 排出來的東西）、包裝印刷面
    def pkq(kd, lb, rb, rt, lt_, i=None):   # 包裝正面一塊（四個角＝看的人那邊的左下、右下、右上、左上）；i＝指定第幾款（同一段同一款）
        L_ = PKUV[kd]; PQ.append((L_[RRV.randrange(len(L_)) if i is None else i % len(L_)], [g2b(*p_) for p_ in (lb, rb, rt, lt_)]))
    if CC0:   # v2（BB 607f3fef2a：手機殼牆一樣大小的純色方塊、右櫃大白盒）→ 自己畫一張包裝貼圖集（不寫字、不像任何品牌，D77）：
        #   第 1、2 列手機殼吊卡（16 款：純色、漸層、大理石、亮粉、點點、斜紋、小花、透明、愛心、格子、皮革、碳纖維…，都有鏡頭島）；第 3 列配件盒（充電線、耳機、充電頭、保護貼、行動電源…）；第 4 列手機盒
        from PIL import ImageDraw, ImageFilter
        _R = random.Random(7); CW, CH = 128, 256; at = Image.new('RGB', (CW * 8, CH * 4), (240, 240, 240))
        CC = [(31, 32, 35), (216, 54, 42), (244, 190, 200), (63, 122, 208), (240, 208, 64), (47, 138, 90), (236, 238, 240), (122, 90, 176), (232, 106, 28), (138, 192, 224), (201, 168, 120), (160, 210, 190), (40, 60, 110), (190, 30, 60), (250, 226, 200), (90, 96, 104)]
        def bars(d, x0, y0, w, rows, col, h=5, gap=9):   # 假字：一條條色塊
            for r in range(rows):
                x = x0; e = x0 + w * _R.uniform(0.5, 1.0)
                while x < e: ww = _R.uniform(6, 18); d.rectangle([x, y0 + r * gap, min(x + ww, e), y0 + r * gap + h], fill=col); x += ww + 4
        def mix(a, b, t): return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))
        def rmask(w, h, r): m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], r, fill=255); return m
        def case_im(w, h, style, c, c2):
            im = Image.new('RGB', (w, h), c); d = ImageDraw.Draw(im)
            if style == 'grad':
                for k in range(h): d.line([0, k, w, k], fill=mix(c, c2, k / h))
            elif style == 'marble':
                im.paste((238, 236, 232), [0, 0, w, h])
                for v in range(5):
                    x, y = _R.uniform(0, w), 0.0; pts = []
                    while y < h: pts.append((x, y)); x += _R.uniform(-9, 9); y += _R.uniform(6, 14)
                    d.line(pts, fill=c2 if v % 2 else (150, 150, 150), width=_R.choice((1, 2)))
                im = im.filter(ImageFilter.GaussianBlur(0.8)); d = ImageDraw.Draw(im)
            elif style == 'glitter':
                for k in range(160): x, y = _R.uniform(0, w), _R.uniform(0, h); s = _R.choice((1, 1, 2)); d.ellipse([x, y, x + s, y + s], fill=_R.choice((c2, (255, 255, 255), mix(c, (255, 255, 255), 0.5))))
            elif style == 'dots':
                for yy in range(4, h, 14):
                    for xx in range(4 + (yy // 14 % 2) * 7, w, 14): d.ellipse([xx, yy, xx + 6, yy + 6], fill=c2)
            elif style == 'stripe':
                for k in range(-h, w + h, 16): d.line([k, 0, k + h, h], fill=c2, width=6)
            elif style == 'flower':
                for k in range(7):
                    x, y = _R.uniform(8, w - 8), _R.uniform(30, h - 8); r_ = _R.uniform(5, 8)
                    for a_ in range(5): d.ellipse([x + math.cos(a_ * 1.2566) * r_ - r_ * 0.7, y + math.sin(a_ * 1.2566) * r_ - r_ * 0.7, x + math.cos(a_ * 1.2566) * r_ + r_ * 0.7, y + math.sin(a_ * 1.2566) * r_ + r_ * 0.7], fill=c2)
                    d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(250, 210, 60))
            elif style == 'clear':
                im.paste((214, 222, 230), [0, 0, w, h]); d.rectangle([4, 4, w - 5, h - 5], outline=(190, 200, 210), width=2)
                d.polygon([(w * 0.55, 0), (w * 0.75, 0), (w * 0.25, h), (w * 0.05, h)], fill=(236, 242, 248))
            elif style == 'heart':
                for k in range(6):
                    x, y = _R.uniform(10, w - 14), _R.uniform(34, h - 12); s = _R.uniform(4, 7)
                    d.ellipse([x - s, y - s, x, y]); d.ellipse([x - s, y - s, x, y], fill=c2); d.ellipse([x, y - s, x + s, y], fill=c2); d.polygon([(x - s, y - s / 2), (x + s, y - s / 2), (x, y + s)], fill=c2)
            elif style == 'check':
                for yy in range(0, h, 12):
                    for xx in range(0, w, 12):
                        if (xx // 12 + yy // 12) % 2: d.rectangle([xx, yy, xx + 11, yy + 11], fill=c2)
            elif style == 'leather':
                for k in range(300): x, y = _R.uniform(0, w), _R.uniform(0, h); d.point((x, y), fill=mix(c, (0, 0, 0), 0.18))
                for k in range(8, h - 8, 7): d.line([5, k, 5, k + 3], fill=c2); d.line([w - 6, k, w - 6, k + 3], fill=c2)
            elif style == 'carbon':
                im.paste((38, 40, 44), [0, 0, w, h])
                for yy in range(0, h, 6):
                    for xx in range(0, w, 6): d.rectangle([xx, yy, xx + 2, yy + 2], fill=(58, 60, 66) if (xx + yy) // 6 % 2 else (30, 31, 34))
            else: d.line([3, 6, 3, h - 6], fill=mix(c, (255, 255, 255), 0.35), width=2)   # 純色：側邊一道反光
            d = ImageDraw.Draw(im); ix, iy, iw = 6, 6, w * 0.42   # 鏡頭島（左上）：兩三顆鏡頭＋閃光燈
            d.rounded_rectangle([ix, iy, ix + iw, iy + iw], 7, fill=mix(c, (20, 20, 22), 0.55) if style != 'clear' else (60, 64, 70))
            for (lx, ly) in ((0.27, 0.27), (0.27, 0.72), (0.72, 0.27))[:_R.choice((2, 3, 3))]:
                cx_, cy_ = ix + iw * lx, iy + iw * ly; r_ = iw * 0.19; d.ellipse([cx_ - r_, cy_ - r_, cx_ + r_, cy_ + r_], fill=(20, 22, 26)); d.ellipse([cx_ - r_ * 0.6, cy_ - r_ * 0.6, cx_ + r_ * 0.6, cy_ + r_ * 0.6], fill=(52, 66, 86)); d.ellipse([cx_ - r_ * 0.25, cy_ - r_ * 0.45, cx_, cy_ - r_ * 0.2], fill=(200, 210, 230))
            d.ellipse([ix + iw * 0.64, iy + iw * 0.64, ix + iw * 0.8, iy + iw * 0.8], fill=(250, 240, 200))
            return im
        STY = ('solid', 'grad', 'marble', 'glitter', 'dots', 'stripe', 'flower', 'clear', 'heart', 'check', 'leather', 'carbon', 'solid', 'grad', 'glitter', 'solid')
        for i_ in range(16):   # 手機殼吊卡
            c_, r_ = i_ % 8, i_ // 8; cell = Image.new('RGB', (CW, CH), _R.choice(((246, 246, 244), (238, 243, 250), (250, 240, 244), (232, 232, 230), (30, 32, 36)))); d = ImageDraw.Draw(cell)
            dark = cell.getpixel((0, 0))[0] < 100; band = CC[(i_ * 5 + 3) % len(CC)]
            d.rounded_rectangle([CW * 0.34, CH * 0.022, CW * 0.66, CH * 0.06], 5, fill=(90, 92, 96))            # 掛勾孔
            d.rectangle([0, CH * 0.085, CW, CH * 0.15], fill=band); bars(d, CW * 0.1, CH * 0.1, CW * 0.6, 1, (250, 250, 250))
            d.rounded_rectangle([CW * 0.1, CH * 0.17, CW * 0.9, CH * 0.87], 10, fill=(222, 228, 234) if not dark else (60, 62, 68))   # 透明吸塑殼
            w_, h_ = int(CW * 0.6), int(CH * 0.62); c1 = CC[(i_ * 3) % len(CC)]; c2 = CC[(i_ * 7 + 5) % len(CC)]
            cell.paste(case_im(w_, h_, STY[i_], c1, c2), (int(CW * 0.2), int(CH * 0.2)), rmask(w_, h_, 14)); d = ImageDraw.Draw(cell)
            d.line([CW * 0.16, CH * 0.8, CW * 0.84, CH * 0.24], fill=(250, 252, 255), width=2)                     # 吸塑殼的一道反光
            bars(d, CW * 0.1, CH * 0.9, CW * 0.55, 2, (150, 150, 150) if not dark else (190, 190, 190), h=4, gap=8); d.ellipse([CW * 0.72, CH * 0.885, CW * 0.92, CH * 0.965], fill=(250, 214, 40))   # 價錢貼紙
            at.paste(cell, (c_ * CW, r_ * CH)); PKUV.setdefault('case', []).append([c_ / 8, 1 - (r_ + 1) / 4, (c_ + 1) / 8, 1 - r_ / 4])
        for c_ in range(8):   # 配件盒
            bg = ((246, 246, 244), (30, 32, 36), (63, 122, 208), (246, 246, 244), (40, 60, 110), (236, 238, 240), (216, 54, 42), (246, 246, 244))[c_]
            cell = Image.new('RGB', (CW, CH), bg); d = ImageDraw.Draw(cell); fg = (250, 250, 250) if sum(bg) < 400 else (40, 42, 46); acc = CC[(c_ * 5 + 1) % len(CC)]
            d.rectangle([0, 0, CW, CH * 0.12], fill=acc); bars(d, CW * 0.1, CH * 0.16, CW * 0.8, 2, fg, h=6, gap=11)
            cx_, cy_ = CW * 0.5, CH * 0.55; kd = c_ % 6
            if kd == 0:   # 充電線一捲
                for k in range(6): r1 = 18 + k * 4; d.ellipse([cx_ - r1, cy_ - r1 * 0.8, cx_ + r1, cy_ + r1 * 0.8], outline=(250, 250, 250) if sum(bg) < 400 else (220, 220, 220), width=3)
                d.rectangle([cx_ + 30, cy_ - 4, cx_ + 46, cy_ + 4], fill=(180, 184, 190))
            elif kd == 1:   # 耳機
                ol = (170, 172, 176) if sum(bg) > 600 else None
                for s in (-1, 1): d.ellipse([cx_ + s * 18 - 12, cy_ - 22, cx_ + s * 18 + 12, cy_ + 2], fill=(248, 248, 248), outline=ol, width=2); d.rounded_rectangle([cx_ + s * 18 - 4, cy_, cx_ + s * 18 + 4, cy_ + 34], 4, fill=(248, 248, 248), outline=ol, width=2)   # 白底的盒子：耳機加灰邊
            elif kd == 2:   # 充電頭
                d.rounded_rectangle([cx_ - 24, cy_ - 22, cx_ + 24, cy_ + 26], 10, fill=(248, 248, 248)); d.rectangle([cx_ - 12, cy_ - 36, cx_ - 7, cy_ - 22], fill=(190, 190, 190)); d.rectangle([cx_ + 7, cy_ - 36, cx_ + 12, cy_ - 22], fill=(190, 190, 190))
            elif kd == 3:   # 保護貼：一支手機的輪廓＋斜的反光
                d.rounded_rectangle([cx_ - 26, cy_ - 52, cx_ + 26, cy_ + 52], 10, outline=(60, 62, 66), width=3); d.line([cx_ - 20, cy_ + 40, cx_ + 20, cy_ - 40], fill=(120, 180, 230), width=6)
            elif kd == 4:   # 行動電源
                d.rounded_rectangle([cx_ - 22, cy_ - 46, cx_ + 22, cy_ + 46], 12, fill=(60, 64, 70)); [d.ellipse([cx_ - 12 + k * 7, cy_ + 30, cx_ - 8 + k * 7, cy_ + 34], fill=(80, 200, 255)) for k in range(4)]
            else:   # 車用支架
                d.ellipse([cx_ - 14, cy_ + 14, cx_ + 14, cy_ + 40], fill=(50, 52, 56)); d.line([cx_, cy_ + 20, cx_, cy_ - 10], fill=(50, 52, 56), width=6); d.rounded_rectangle([cx_ - 28, cy_ - 46, cx_ + 28, cy_ - 8], 6, outline=(50, 52, 56), width=5)
            bars(d, CW * 0.1, CH * 0.85, CW * 0.6, 2, fg, h=4, gap=8)
            at.paste(cell, (c_ * CW, 2 * CH)); PKUV.setdefault('acc', []).append([c_ / 8, 1 - 3 / 4, (c_ + 1) / 8, 1 - 2 / 4])
        for c_ in range(6):   # 手機盒：正面一支手機（螢幕桌布或背面）
            bg = (246, 246, 244) if c_ % 3 else (24, 26, 30); cell = Image.new('RGB', (CW, CH), bg); d = ImageDraw.Draw(cell)
            w_, h_ = int(CW * 0.56), int(CH * 0.6); x0_, y0_ = int(CW * 0.22), int(CH * 0.12)
            if c_ % 2:
                scr = case_im(w_, h_, 'grad', CC[(c_ * 3 + 3) % len(CC)], CC[(c_ * 5 + 9) % len(CC)])
            else:
                scr = Image.new('RGB', (w_, h_), (14, 14, 16)); sd = ImageDraw.Draw(scr); c1 = CC[(c_ * 7 + 2) % len(CC)]; c2 = CC[(c_ * 3 + 11) % len(CC)]
                for k in range(h_): sd.line([3, k, w_ - 4, k], fill=mix(c1, c2, k / h_))
                sd.ellipse([w_ / 2 - 3, 6, w_ / 2 + 3, 12], fill=(10, 10, 12))
            cell.paste(scr, (x0_, y0_), rmask(w_, h_, 12)); d = ImageDraw.Draw(cell)
            d.ellipse([CW * 0.44, CH * 0.78, CW * 0.56, CH * 0.84], outline=(150, 150, 150) if c_ % 3 else (200, 200, 200), width=2)   # 圓形小標（不是任何牌子）
            bars(d, CW * 0.2, CH * 0.88, CW * 0.6, 2, (150, 150, 150), h=4, gap=8)
            at.paste(cell, (c_ * CW, 3 * CH)); PKUV.setdefault('pbox', []).append([c_ / 8, 0.0, (c_ + 1) / 8, 1 / 4])
        for j_, bg in enumerate(((31, 63, 154), (216, 54, 42))):   # 資費方案海報（右牆門邊兩張）：上面一條白、一支手機、黃色圓的價錢、下面三列方案
            c_ = 6 + j_; cell = Image.new('RGB', (CW, CH), bg); d = ImageDraw.Draw(cell)
            d.rectangle([0, 0, CW, CH * 0.13], fill=(250, 250, 250)); bars(d, CW * 0.1, CH * 0.035, CW * 0.8, 2, bg, h=6, gap=11)
            scr = case_im(int(CW * 0.34), int(CH * 0.34), 'grad', CC[(j_ * 5 + 9) % len(CC)], CC[(j_ * 3 + 7) % len(CC)]); cell.paste(scr, (int(CW * 0.12), int(CH * 0.18)), rmask(int(CW * 0.34), int(CH * 0.34), 8)); d = ImageDraw.Draw(cell)
            d.ellipse([CW * 0.5, CH * 0.2, CW * 0.94, CH * 0.42], fill=(250, 214, 40)); bars(d, CW * 0.57, CH * 0.27, CW * 0.3, 2, bg, h=7, gap=12)
            for k in range(3):
                y_ = CH * (0.57 + k * 0.13); d.rounded_rectangle([CW * 0.08, y_, CW * 0.92, y_ + CH * 0.1], 6, fill=(250, 250, 250)); bars(d, CW * 0.14, y_ + CH * 0.025, CW * 0.45, 2, (60, 62, 66), h=5, gap=10)
                d.rectangle([CW * 0.68, y_ + CH * 0.02, CW * 0.86, y_ + CH * 0.08], fill=bg)
            at.paste(cell, (c_ * CW, 3 * CH)); PKUV.setdefault('poster', []).append([c_ / 8, 0.0, (c_ + 1) / 8, 1 / 4])
        _pk = os.path.join(STAGE, 'tz_liantong_packs.png'); at.save(_pk)
        _m = bpy.data.materials.new('tzs_liantong_packs'); _m.use_nodes = True; _n = _m.node_tree; _b = _n.nodes['Principled BSDF']; _b.inputs['Roughness'].default_value = 0.4
        _t = _n.nodes.new('ShaderNodeTexImage'); _t.image = bpy.data.images.load(_pk); _n.links.new(_t.outputs['Color'], _b.inputs['Base Color']); M['packs'] = _m
    CASE = ['#1f2023', '#d8362a', '#f4c8d0', '#3f7ad0', '#f0d040', '#2f8a5a', '#f6f7f7', '#7a5ab0', '#e86a1c', '#8ac0e0', '#c9a878']
    def phone(x, y, z, col, yaw=0.0, lie=True):
        """一支手機：平放（螢幕朝上）或立著靠在小架子上"""
        if lie: vc().cbox(x - 0.037, x + 0.037, y, y + 0.008, z - 0.078, z + 0.078, col); vc().cbox(x - 0.033, x + 0.033, y + 0.008, y + 0.009, z - 0.073, z + 0.073, '#15171a')
        else: vc().poly([(x - 0.037, y, z + 0.02), (x + 0.037, y, z + 0.02), (x + 0.037, y + 0.15, z - 0.02), (x - 0.037, y + 0.15, z - 0.02)], '#15171a'); vc().cbox(x - 0.04, x + 0.04, y, y + 0.012, z - 0.03, z + 0.03, col)
    # 側牆一條藍色腰線（招牌的藍）
    for sx in (-1, 1): xx = sx * (W / 2 - 0.004); vc().cbox(min(xx, sx * W / 2), max(xx, sx * W / 2), 2.3, 2.42, -D / 2, D / 2, BLUE)
    # 左牆：白色溝槽板＋一排排手機殼（掛勾上，一格一種顏色）、保護貼盒；下面白色抽屜櫃
    px = PW['x1']; vc().cbox(PW['x0'], px, 0.0, 0.62, PW['z0'], PW['z1'], WHT); vc().cbox(PW['x0'], px - 0.1, 0.62, PW['h'], PW['z0'], PW['z1'], '#eceeee'); vc().cbox(PW['x0'], px + 0.01, 0.6, 0.64, PW['z0'], PW['z1'], ALU)
    for k in range(5): zz = PW['z0'] + (PW['z1'] - PW['z0']) * k / 4; vc().cbox(px - 0.1, px + 0.004, 0.0, PW['h'], zz - 0.012, zz + 0.012, ALU)
    for k in range(4):
        z0_ = PW['z0'] + (PW['z1'] - PW['z0']) * k / 4 + 0.06; z1_ = PW['z0'] + (PW['z1'] - PW['z0']) * (k + 1) / 4 - 0.06
        for j in range(2): vc().cbox(px, px + 0.006, 0.08 + j * 0.27, 0.3 + j * 0.27, z0_, z1_, '#eceeee'); vc().cbox(px + 0.006, px + 0.02, 0.17 + j * 0.27, 0.19 + j * 0.27, (z0_ + z1_) / 2 - 0.08, (z0_ + z1_) / 2 + 0.08, ALU)
        for r, y in enumerate((0.72, 0.94, 1.16, 1.38, 1.6, 1.82)):
            a = z0_; col = CASE[(k * 3 + r * 2) % len(CASE)]; n = 0
            while CC0 and a + 0.085 <= z1_:   # v2：吊卡（印刷）寬窄、長短不一，角度略歪，一個勾掛兩張（後面那張露一點），偶爾賣完剩空勾
                if r == 5 and k % 2:   # 最上面一排：保護貼、充電器的盒子（印刷）
                    bw = RRV.choice((0.075, 0.085, 0.095)); bh = RRV.uniform(0.13, 0.18)
                    if a + bw > z1_: break
                    vc().cbox(px - 0.1, px - 0.02, y, y + bh, a, a + bw, WHT); xf = px - 0.02 + 0.0012
                    pkq('acc', (xf, y, a + bw), (xf, y, a), (xf, y + bh, a), (xf, y + bh, a + bw)); a += bw + RRV.uniform(0.006, 0.016); continue
                cw = RRV.choice((0.08, 0.088, 0.096)); hw = cw / 2; cz = a + hw; yt = y + 0.205
                if cz + hw > z1_: break
                ccyl(vm(), (px - 0.1, yt - 0.012, cz), (px - 0.045, yt - 0.004, cz), 0.0022, ALU, seg=4)   # 掛勾
                if RRV.random() < 0.08: a += cw + 0.012; continue   # 賣完了，剩空勾
                sty = RRV.randrange(16)
                for j_, (cx, dh) in enumerate(((px - 0.084, RRV.uniform(-0.012, 0.012)), (px - 0.07, 0.0))):
                    if j_ == 0 and RRV.random() < 0.3: continue   # 有的勾只剩一張
                    th = RRV.uniform(-0.1, 0.1); sn, cs = math.sin(th), math.cos(th); ch = RRV.choice((0.19, 0.2, 0.215)) + dh; hw_ = hw * (0.96 if j_ == 0 else 1.0)
                    pkq('case', (cx + hw_ * sn, yt - ch, cz + hw_ * cs), (cx - hw_ * sn, yt - ch, cz - hw_ * cs), (cx - hw_ * sn, yt, cz - hw_ * cs), (cx + hw_ * sn, yt, cz + hw_ * cs), i=(sty + j_ * 5) if j_ == 0 else sty)
                a += cw + RRV.uniform(0.008, 0.02)
            while not CC0 and a + 0.085 <= z1_:
                c2 = col if n % 3 else CASE[(k + r + n) % len(CASE)]
                if r == 5 and k % 2: vc().cbox(px - 0.1, px - 0.02, y, y + 0.17, a, a + 0.1, WHT); vc().cbox(px - 0.02, px - 0.018, y + 0.03, y + 0.14, a + 0.01, a + 0.09, c2)   # 最上面一排：保護貼、充電器的盒子
                else:   # 手機殼（LIANTONG-CASES-1112；BB 11-12 ④ FAIL：近看每一格是純色長方塊，沒鏡頭孔、沒包裝）：白色吊卡（上緣一條同色的色條）＋殼＋鏡頭島（兩顆鏡頭、一顆閃光燈）＋側邊一條反光
                    hi = _tint(c2, 0.4)
                    vc().cbox(px - 0.084, px - 0.078, y - 0.012, y + 0.2, a - 0.008, a + 0.088, '#f4f5f4'); vc().cbox(px - 0.078, px - 0.0772, y + 0.174, y + 0.196, a - 0.004, a + 0.084, c2)
                    vc().cbox(px - 0.078, px - 0.062, y, y + 0.165, a, a + 0.08, c2); vc().cbox(px - 0.062, px - 0.0612, y + 0.006, y + 0.159, a + 0.066, a + 0.075, hi)
                    vc().cbox(px - 0.062, px - 0.0594, y + 0.104, y + 0.158, a + 0.007, a + 0.045, '#15171a' if c2 != '#1f2023' else '#34383e')
                    for (ly, lz) in ((0.136, 0.012), (0.112, 0.012)): vc().cbox(px - 0.0594, px - 0.0586, y + ly, y + ly + 0.017, a + lz, a + lz + 0.017, '#4a5a6a')
                    vc().cbox(px - 0.0594, px - 0.0588, y + 0.128, y + 0.136, a + 0.033, a + 0.041, '#f2e9c0')
                a += 0.105; n += 1
            ccyl(vm(), (px - 0.1, y + 0.185 + (0.008 if CC0 else 0.0), z0_), (px - 0.1, y + 0.185 + (0.008 if CC0 else 0.0), z1_), 0.006, ALU, seg=4)
    # 窗邊玻璃展示櫃：白色底座、鋁框、兩層玻璃層板上的手機和盒子
    x0, x1, z0, z1, h = SC['x0'], SC['x1'], SC['z0'], SC['z1'], SC['h']
    vc().cbox(x0, x1, 0.0, 0.42, z0, z1, WHT); vc().cbox(x0, x1, 0.0, 0.08, z0 - 0.004, z1, BLUE); vc().cbox(x0, x1, h - 0.03, h, z0, z1, ALU)
    for xx in (x0, (x0 + x1) / 2 - 0.015, x1 - 0.03):
        for zz in (z0, z1 - 0.03): vc().cbox(xx, xx + 0.03, 0.42, h, zz, zz + 0.03, ALU)
    for j, y in enumerate((0.44, 0.72)):
        if j: vc().cbox(x0 + 0.03, x1 - 0.03, y - 0.012, y, z0 + 0.03, z1 - 0.03, '#dfe9ee')
        for k in range(9):
            xx = x0 + 0.18 + k * 0.235; col = CASE[(k * 2 + j * 5) % len(CASE)]
            phone(xx, y, z0 + 0.2, col, lie=False)
            if CC0:   # v2：手機盒有厚度、正面印手機（印刷）；大小略不同
                bw = RRV.uniform(0.04, 0.05); bh = RRV.uniform(0.15, 0.18); zf = z1 - 0.25 - 0.0012; vc().cbox(xx - bw, xx + bw, y, y + bh, z1 - 0.25, z1 - 0.17, WHT)
                pkq('pbox', (xx + bw, y, zf), (xx - bw, y, zf), (xx - bw, y + bh, zf), (xx + bw, y + bh, zf))
            else: vc().cbox(xx - 0.045, xx + 0.045, y, y + 0.17, z1 - 0.2, z1 - 0.17, WHT); vc().cbox(xx - 0.03, xx + 0.03, y + 0.03, y + 0.14, z1 - 0.202, z1 - 0.2, col)
    for (pa, pb) in (((x0, z0), (x1, z0)), ((x1, z1), (x0, z1))): mesh('glass').quad([(pa[0], 0.42, pa[1]), (pb[0], 0.42, pb[1]), (pb[0], h - 0.03, pb[1]), (pa[0], h - 0.03, pa[1])])
    for k in range(6): phone(x0 + 0.3 + k * 0.33, h, (z0 + z1) / 2, CASE[(k * 3 + 1) % len(CASE)])   # 櫃頂：可以拿起來試的展示機（防盜線）
    for k in range(6): ccyl(vm(), (x0 + 0.3 + k * 0.33, h, (z0 + z1) / 2 + 0.08), (x0 + 0.3 + k * 0.33, h + 0.002, (z0 + z1) / 2 + 0.22), 0.004, DK, seg=4)
    # 右牆：配件展示櫃（白色、每層底下一條燈）＋門邊的資費方案海報（藍色大字塊）
    x0, x1, z0, z1, h = CB['x0'], CB['x1'], CB['z0'], CB['z1'], CB['h']
    vc().cbox(x0, x1, 0.0, 0.5, z0, z1, WHT); vc().cbox(x1 - 0.03, x1, 0.5, h, z0, z1, '#eceeee'); vc().cbox(x0, x1, h, h + 0.04, z0, z1, WHT)
    for zz in (z0, (z0 + z1) / 2 - 0.015, z1 - 0.03): vc().cbox(x0, x1, 0.5, h, zz, zz + 0.03, WHT)
    ACC = [[WHT, DK, '#3f7ad0', '#d8362a'], [DK, WHT, '#f0d040', '#2f8a5a'], [WHT, '#f4c8d0', '#8ac0e0', DK], [WHT, WHT, BLUE2, '#e86a1c']]
    for i, y in enumerate((0.52, 0.9, 1.28, 1.66)):
        vc().cbox(x0, x1, y - 0.02, y, z0, z1, WHT)
        if CC0:   # v2（BB：右櫃大白盒）→ 配件盒（印刷：充電線、耳機、充電頭、保護貼、行動電源、車架），一段同一款、寬窄高低深淺不一
            a = z0 + 0.04; run = RRV.randrange(8); m_ = 0
            while a + 0.06 < z1 - 0.04:
                bw = RRV.choice((0.065, 0.08, 0.1, 0.12)); bh = RRV.uniform(0.11, 0.25 if i < 3 else 0.3); push = RRV.choice((0.0, 0.0, 0.0, 0.05)); xf = x0 + 0.05 + push
                if a + bw > z1 - 0.04: break
                if m_ >= RRV.choice((2, 3, 4)): run += 1; m_ = 0; a += 0.02
                vc().cbox(xf, xf + RRV.uniform(0.05, 0.09), y, y + bh, a, a + bw, WHT); pkq('acc', (xf - 0.0012, y, a), (xf - 0.0012, y, a + bw), (xf - 0.0012, y + bh, a + bw), (xf - 0.0012, y + bh, a), i=run); a += bw + 0.008; m_ += 1
        else: goods(x0 + 0.06, x1 - 0.03, y, z0 + 0.04, z1 - 0.04, ACC[i], hmin=0.12, hmax=0.24, step=0.1)
        mesh('light').box(x0 + 0.02, x0 + 0.05, y + 0.335, y + 0.35, z0 + 0.05, z1 - 0.05)
    xe = W / 2 - 0.006
    for j_, (za, zb_, c1, c2) in enumerate(((1.65, 2.3, BLUE, '#f0d040'), (2.4, 3.05, '#d8362a', WHT))):
        vc().cbox(xe, W / 2, 1.0, 2.15, za, zb_, WHT)
        if CC0: pkq('poster', (xe - 0.0012, 1.04, za + 0.03), (xe - 0.0012, 1.04, zb_ - 0.03), (xe - 0.0012, 2.11, zb_ - 0.03), (xe - 0.0012, 2.11, za + 0.03), i=j_); continue   # v2：印刷的方案海報
        vc().cbox(xe - 0.002, xe, 1.62, 2.1, za + 0.04, zb_ - 0.04, c1); vc().cbox(xe - 0.004, xe - 0.002, 1.75, 1.95, za + 0.12, zb_ - 0.12, c2)
        for j in range(3): vc().cbox(xe - 0.002, xe, 1.08 + j * 0.17, 1.2 + j * 0.17, za + 0.06, zb_ - 0.06 - j * 0.12, '#c9d2dc')
    # 服務櫃台（白色、正面一條藍、底下燈條）：螢幕、鍵盤、刷卡機、維修墊（拆開的手機、螺絲起子）、名片盒
    vc().cbox(CT['x0'], CT['x1'], 0.1, CT['h'] - 0.04, CT['z0'], CT['z1'], WHT); vc().cbox(CT['x0'], CT['x1'], 0.0, 0.1, CT['z0'] + 0.03, CT['z1'] - 0.03, DK); vc().crbox(CT['x0'] - 0.02, CT['x1'], CT['h'] - 0.04, CT['h'], CT['z0'] - 0.02, CT['z1'] + 0.04, WHT, r=0.012)
    vc().cbox(CT['x0'], CT['x1'], 0.5, 0.68, CT['z1'], CT['z1'] + 0.004, BLUE); mesh('light').box(CT['x0'] + 0.1, CT['x1'] - 0.1, 0.1, 0.115, CT['z1'] - 0.03, CT['z1'] - 0.01)
    hC = CT['h']; vc().cbox(1.55, 2.1, hC + 0.1, hC + 0.43, CT['z0'] + 0.14, CT['z0'] + 0.17, DK); vc().cbox(1.58, 2.07, hC + 0.13, hC + 0.4, CT['z0'] + 0.13, CT['z0'] + 0.14, '#8ac0e0'); ccyl(vc(), (1.825, hC, CT['z0'] + 0.17), (1.825, hC + 0.12, CT['z0'] + 0.17), 0.025, DK, seg=6); vc().cbox(1.68, 1.98, hC, hC + 0.012, CT['z0'] + 0.1, CT['z0'] + 0.24, DK)   # 螢幕、鍵盤搬到櫃台右端、放低（LIANTONG-SCREEN-1112；BB 11-12：原本在 x 0.45～1.05、頂 1.5 m，正好擋住店員（站 x 0.8）的正面）
    vc().cbox(1.3, 1.42, hC, hC + 0.05, CT['z1'] - 0.2, CT['z1'] - 0.03, DK); vc().cbox(1.31, 1.41, hC + 0.05, hC + 0.052, CT['z1'] - 0.19, CT['z1'] - 0.1, '#8ac0e0')
    vc().cbox(-0.9, -0.3, hC, hC + 0.006, CT['z0'] + 0.08, CT['z1'] - 0.08, '#3a6a8a'); phone(-0.7, hC + 0.006, CT['z0'] + 0.28, '#c4c8cb'); vc().cbox(-0.52, -0.45, hC + 0.006, hC + 0.012, CT['z0'] + 0.2, CT['z0'] + 0.34, '#2f8a5a')
    ccyl(vc(), (-0.42, hC + 0.012, CT['z0'] + 0.42), (-0.6, hC + 0.012, CT['z0'] + 0.44), 0.007, '#d8362a', seg=5); vc().cbox(1.75, 1.9, hC, hC + 0.04, CT['z1'] - 0.16, CT['z1'] - 0.06, WHT)
    ccyl(vc(), (-0.05, hC, CT['z1'] - 0.14), (-0.05, hC + 0.11, CT['z1'] - 0.14), 0.035, BLUE, seg=8)
    vc().cbox(CT['x0'] - 1.05, CT['x0'], 0.0, 0.9, CT['z0'] + 0.24, CT['z0'] + 0.28, WHT); vc().cbox(CT['x0'] - 1.05, CT['x0'], 0.9, 0.93, CT['z0'] + 0.22, CT['z0'] + 0.3, ALU)   # 櫃台左邊的小矮門（員工進出，關著）
    # 櫃台後面：整面層架的手機盒（白盒子，一格一個牌子的色帶）、左後角維修工作台（檯燈、零件盒、放大鏡）；上面藍底白字店名
    zb = -D / 2; vc().cbox(-0.9, W / 2, 0.0, 0.75, zb, zb + 0.42, WHT); vc().cbox(-0.9, W / 2, 0.75, 2.12, zb, zb + 0.03, '#eceeee')
    for k in range(5): xx = -0.9 + (W / 2 + 0.9) * k / 4; vc().cbox(xx - 0.015 if k else xx, xx + 0.015 if k < 4 else xx, 0.75, 2.12, zb, zb + 0.3, WHT)
    for i, y in enumerate((0.77, 1.04, 1.31, 1.58, 1.85)):
        vc().cbox(-0.9, W / 2, y - 0.02, y, zb, zb + 0.3, WHT); a = -0.86; n = i
        while a + 0.2 < W / 2:
            band = (BLUE2, '#d8362a', '#2f8a5a', DK, '#e86a1c', '#7a5ab0')[n % 6]; e = min(W / 2 - 0.03, a + RR.uniform(0.45, 0.75))
            if CC0:   # v2：手機盒（印刷），同一段同一款，寬窄高低不一，偶爾空一格、往後推一點
                bw0 = RRV.choice((0.075, 0.085, 0.095)); bh0 = RRV.uniform(0.15, 0.2)
                while a + bw0 <= e:
                    if RRV.random() < 0.06: a += bw0 + 0.01; continue
                    bw = bw0 * RRV.uniform(0.97, 1.03); bh = bh0 * RRV.uniform(0.97, 1.03); zf = zb + 0.27 - RRV.choice((0.0, 0.0, 0.0, 0.04))
                    vc().cbox(a, a + bw, y, y + bh, zb + 0.04, zf, WHT); pkq('pbox', (a, y, zf + 0.0012), (a + bw, y, zf + 0.0012), (a + bw, y + bh, zf + 0.0012), (a, y + bh, zf + 0.0012), i=n); a += bw + 0.008
            while not CC0 and a + 0.1 <= e: vc().cbox(a, a + 0.092, y, y + 0.19, zb + 0.06, zb + 0.27, WHT); vc().cbox(a + 0.01, a + 0.082, y + 0.05, y + 0.14, zb + 0.27, zb + 0.272, band); a += 0.1
            a = e + 0.04; n += 1
    vc().cbox(-W / 2, -1.0, 0.72, 0.76, zb, zb + 0.6, '#e2d8c2'); vc().cbox(-W / 2, -1.0, 0.0, 0.72, zb, zb + 0.56, WHT)
    vc().cbox(-2.1, -1.5, 0.76, 0.766, zb + 0.12, zb + 0.5, '#3a6a8a'); phone(-1.8, 0.766, zb + 0.3, DK)
    for k in range(4):
        if CC0:   # P2（BB：純色小方塊）→ 印刷的配件盒，大小略不同
            bh = 0.06 + 0.02 * (k % 2); vc().cbox(-1.42 + k * 0.1, -1.34 + k * 0.1, 0.76, 0.76 + bh, zb + 0.06, zb + 0.2, WHT); zf = zb + 0.2 + 0.0012
            pkq('acc', (-1.42 + k * 0.1, 0.76, zf), (-1.34 + k * 0.1, 0.76, zf), (-1.34 + k * 0.1, 0.76 + bh, zf), (-1.42 + k * 0.1, 0.76 + bh, zf), i=k * 2 + 1); continue
        vc().cbox(-1.42 + k * 0.1, -1.34 + k * 0.1, 0.76, 0.84, zb + 0.06, zb + 0.2, ('#d8362a', '#f0d040', BLUE2, '#2f8a5a')[k])
    if CC0:   # 維修台的檯燈（Poly Haven；它的兩個材質沒有顏色貼圖 → 燈臂黑鐵、燈罩白塑膠，都是 CC0 材質組）；櫃台左端一小盆 Poly Haven 盆栽（概念圖門口有盆栽）
        o_ = ph_put('desk_lamp_arm_01', -2.05, 0.76, zb + 0.22, 0.5, height=0.5, decimate=0.06)
        for i_ in range(len(o_.data.materials)): o_.data.materials[i_] = M['blackmetal'] if i_ == 0 else M['plastic_w']
        ph_put('potted_plant_02', CT['x0'] + 0.22, CT['h'], (CT['z0'] + CT['z1']) / 2 - 0.02, 0.9, height=0.42, share=False, decimate=0.04)
    else: ccyl(vc(), (-2.12, 0.76, zb + 0.14), (-2.12, 0.78, zb + 0.14), 0.07, DK, seg=10); ccyl(vm(), (-2.12, 0.78, zb + 0.14), (-2.12, 1.2, zb + 0.14), 0.01, ALU, seg=5); ccyl(vm(), (-2.12, 1.2, zb + 0.14), (-1.85, 1.3, zb + 0.3), 0.01, ALU, seg=5); ccyl(vc(), (-1.85, 1.31, zb + 0.3), (-1.85, 1.25, zb + 0.3), 0.035, DK, seg=10, r2=0.08, caps=False); mesh('light').sphere((-1.85, 1.265, zb + 0.3), 0.03, seg=6, rings=4)
    vc().cbox(-W / 2 + 0.004, -W / 2 + 0.02, 0.95, 1.9, zb + 0.08, zb + 1.3, '#eceeee')
    for j in range(4):
        for k in range(7):
            if CC0:   # P2（BB：純色小方塊）→ 塑膠抽屜盒（白、藍兩色交錯，CC0 塑膠材質組），前面一小片印刷標籤（配件盒的圖）
                y0_, y1_, z0_, z1_ = 1.0 + j * 0.22, 1.16 + j * 0.22, zb + 0.12 + k * 0.165, zb + 0.26 + k * 0.165; mesh('plastic_blue' if (j + k) % 3 == 2 else 'plastic_w').box(-W / 2 + 0.02, -W / 2 + 0.1, y0_, y1_, z0_, z1_)
                xf = -W / 2 + 0.1 + 0.0012; pkq('acc', (xf, y0_ + 0.05, z1_ - 0.03), (xf, y0_ + 0.05, z0_ + 0.03), (xf, y1_ - 0.03, z0_ + 0.03), (xf, y1_ - 0.03, z1_ - 0.03), i=j * 7 + k); continue
            vc().cbox(-W / 2 + 0.02, -W / 2 + 0.1, 1.0 + j * 0.22, 1.16 + j * 0.22, zb + 0.12 + k * 0.165, zb + 0.26 + k * 0.165, ('#c9d2dc', '#dfe9ee', '#8ac0e0')[(j + k) % 3])   # 零件抽屜盒
    vc().cbox(-1.6, 1.6, 2.2, 2.78, zb, zb + 0.04, BLUE); pic('sign', [(-1.55, 2.24, zb + 0.045), (1.55, 2.24, zb + 0.045), (1.55, 2.74, zb + 0.045), (-1.55, 2.74, zb + 0.045)])
    # 兩張黑色圓凳（概念圖櫃台前那兩張）：黑座面、鉻柱、圓盤底
    for q in J['seats']:
        if CC0:   # v1c：Poly Haven 金屬圓凳本身沒有顏色貼圖（金屬只有粗糙度）→ 換成 CC0 黑鐵材質組（shop_cc0 第③項：純色零件 <25%）
            o_ = ph_put('metal_stool_02', q['x'], 0.0, q['z'], 0.3, height=0.5, decimate=0.15)
            for i_ in range(len(o_.data.materials)): o_.data.materials[i_] = M['blackmetal']
            continue   # v1b：Poly Haven 金屬圓凳（座面 0.5，和原本一樣；shop_cc0 第①項要有掃描模型）
        ccyl(vc(), (q['x'], 0.44, q['z']), (q['x'], 0.5, q['z']), 0.17, DK, seg=16); ccyl(vm(), (q['x'], 0.03, q['z']), (q['x'], 0.44, q['z']), 0.025, ALU, seg=8); ccyl(vm(), (q['x'], 0.0, q['z']), (q['x'], 0.03, q['z']), 0.2, ALU, seg=16); ccyl(vm(), (q['x'], 0.16, q['z']), (q['x'], 0.175, q['z']), 0.13, ALU, seg=12, caps=False)
    # 玻璃上的藍色腰帶、門邊牆上的維修圖示牌、天花板
    PRE = 'WALL_Sfix:'
    for (a, b) in FR['windows']: vc().cbox(a, b, 0.35, 0.5, zS + 0.06, zS + 0.07, BLUE); vc().cbox(a, b, 2.42, 2.6, zS + 0.06, zS + 0.07, BLUE)
    PRE = ''
    tubes((-2.4, 0.0, 2.3), x0=-1.0, x1=1.0)


# ---------- 完成 ----------
for side, (m, d) in WALLS.items(): m.finish(root, props={'dir': d})
FIXP = {'WALL_Sfix:': {'dir': [0, 0, -1], 'at': [0.0, H / 2, D / 2]}, 'WALL_Efix:': {'dir': [-1, 0, 0], 'at': [W / 2, H / 2, 0.0]}}   # WALL_Efix：泰米 v2 右牆的木腰板（跟著右牆淡出）
for key, mm in MM.items(): mm.finish(root, props=next((v for k, v in FIXP.items() if key.startswith(k)), None), uv=key.split(':')[-1] not in ('vc', 'vcm', 'light', 'glass'), smooth=key.split(':')[-1] in ('vc', 'vcm'))
if SQ:
    m = Mesh('S_pics', M['pics']); lay = m.bm.loops.layers.uv.new('UVMap')
    for key, pts in SQ:
        u0, v0, u1, v1 = AUV[key]; f = m.bm.faces.new([m.bm.verts.new(p) for p in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[lay].uv = t
    m.finish(root, uv=False, merge=False)
if SHOP in ('dongnan', 'liantong', 'yuehaochi', 'keju') and CC0 and PQ:   # v2：包裝印刷（一個網格、一張貼圖集）
    m = Mesh('S_packs', M['packs']); lay = m.bm.loops.layers.uv.new('UVMap')
    for (u0, v0, u1, v1), pts in PQ:
        f = m.bm.faces.new([m.bm.verts.new(p) for p in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[lay].uv = t
    m.finish(root, uv=False, merge=False)
if LQ:
    m = Mesh('S_labels', M['labels']); lay = m.bm.loops.layers.uv.new('UVMap')
    for key, pts in LQ:
        u0, v0, u1, v1 = LUV[key]; f = m.bm.faces.new([m.bm.verts.new(p) for p in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[lay].uv = t
    m.finish(root, uv=False, merge=False)
if CC0:
    for p_ in PH_PROTO.values(): bpy.data.objects.remove(p_)   # 原型不匯出（網格還在，複製的那幾份用）
    print('CC0_USED', json.dumps(sorted(set(CC0_USED)), ensure_ascii=False))
# CC0 的店：牆（灰泥，隔牆、廚房開口的柱和上緣是好幾塊貼在一起的方塊）、牆上的照片只從一面看——不補反面
#   （補了會和正面疊在同一個平面：遊戲裡反面被剔掉看不出來，但 Cycles 烘光照貼圖時反面擋在前面，烘成全黑；LAWWW2-C 11-13 泰米試拍）
if '--nosingle' not in ARGS: L.single_side(root, keep=r'glass', nodup=(r'(ceil|lightpanel|tzs_wall|_pics|liantong_packs|yuehaochi_packs|keju_packs)' if SHOP in ('liantong', 'yuehaochi', 'keju') else r'(ceil|lightpanel|tzs_wall|_pics)') if CC0 else r'(ceil|lightpanel)')
if _PROF: print('TRIS_PROF', json.dumps(sorted(_PROF.items(), key=lambda kv: -kv[1])[:15]))
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
info = L.export(OUT, gpu_instances=False)
L.write_json(OUT[:-4] + '.json', dict(info if isinstance(info, dict) else {}, tris_total=tris, walls=sorted(WALLS), note=f'GG-SHOPS3-ART-1110 {J["name"]} 室內'))
print(json.dumps({'TZ_SHOP': SHOP, 'tris': tris, 'walls': len(WALLS)}, ensure_ascii=False))
