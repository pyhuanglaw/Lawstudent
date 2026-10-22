"""溫州街的日式宿舍（圍牆內的黑瓦木造平房）＋院牆與門 → 一個 GLB（溫州街區域的世界座標）。第二 AI 工作階段（環境美術）製作：
  python3 tools/blender/env_second/gen_jp_textures.py      （黑瓦、紙拉門貼圖；本作程式產生）
  /opt/blenv/bin/python tools/blender/env_second/wz_jphouse.py [-- --out assets/models/env/second_ai/wz_jphouse.glb]

取代 src/zones3d.js buildWenzhou 的 TK.japaneseHouse(10,7)（位置 (−21.5,0,12)、轉 π）與
TK.wall(17,1.15,{gate:2.4,gateX:−0.5,openGate:true})（位置 (−21,0,5.35)、轉 π）的外觀。
導航、鏡頭碰撞、「看日式宿舍」互動點、玄關燈的光暈（zones3d 照套件的 userData.genkan 加）、院子裡的樹、灌木、石燈籠、踏石都在遊戲程式裡，不變；
玄關燈、門的位置照套件（光暈對得上）。

台北的日式宿舍（保留台北辨識度，不是日本街景）：
  房子：水泥基座（高架地板，有鐵條通風口）、下見板（雨淋板）＋押緣（直條壓板）、腰線以上白灰泥、木柱、
        木框玻璃窗（窗格；後面是紙拉門，晚上亮）、寄棟黑瓦屋頂（瓦是程式產生的貼圖；屋簷一排瓦頭、隅棟、大棟、鬼瓦）、
        屋簷下的椽木、鐵皮雨水槽與落水管、玄關（切妻小屋頂、格子拉門、門燈、沓脫石）；
        後來加的東西：窗型冷氣、浪板雨遮、電表箱。
  院牆：水泥粉刷牆（Poly Haven 有污漬的水泥）＋瓦頂、壁柱、木門柱與冠木、門上的小屋頂；
        門柱上藍底白字的門牌（台北的門牌）、「私人住宅 請勿進入」的牌子、鐵信箱。
  字不放在 GLB：PLATE_FACE_*＝空白板面（自訂屬性帶文字），遊戲用 canvas 畫。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import combine, uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/wz_jphouse.glb'))

random.seed(1931)
B.reset(texres=512)
root = B.group('wz_jphouse', props={'kind': 'wz_jphouse'})
base = CL.materials()
M = {
    'siding': L.pbr('jp_siding', 'dark_planks', tile=1.6, target='#5b4b3d', normal=0.9, maps=('diff', 'nor'), rough_value=0.85, cull=True),
    'wood': L.pbr('jp_wood_dark', 'dark_wood', tile=1.0, target='#3b2c21', maps=('diff',), res=256, rough_value=0.75),
    'plaster': L.pbr('jp_plaster', 'white_plaster_02', tile=1.2, target='#e4ddcd', maps=('diff',), res=256, rough_value=0.9, cull=True),
    'base': L.pbr('jp_base', 'concrete_wall_006', tile=1.5, target='#9a948a', normal=0.7, maps=('diff', 'nor'), res=256, rough_value=0.9),
    'cwall': L.pbr('jp_cwall', 'concrete_wall_006', tile=2.2, target='#bbb4a6', normal=0.8, maps=('diff', 'nor'), rough_value=0.9),
    'kawara': L.pbr('jp_kawara', 'jp_kawara', tile=1.2, normal=1.0),
    'ridge': L.flat('jp_ridge', '#3a3c40', rough=0.55),
    'shoji': L.pbr('jp_shoji', 'jp_shoji', tile=1.0, maps=('diff',), res=256, rough_value=0.9, cull=True),
    'glass': L.flat('jp_glass', '#cdd6d6', rough=0.05, alpha=0.2),
    'frost': L.flat('jp_frost', '#e6e1d5', rough=0.6, alpha=0.88),
    'lamp': L.flat('jp_lamp', '#f7e3b8', rough=0.4, emit=B.srgb('#ffcf8a')),
    'dark': base['room_dark'], 'metal': base['metal'], 'ac': base['ac'], 'ac_dark': base['ac_dark'], 'corr': base['corr'],
    'pipe': L.flat('jp_gutter', '#6c706e', rough=0.5, metal=0.35), 'board': base['board'],
    'meter': L.flat('jp_meter', '#a9aca6', rough=0.5, metal=0.2),
}
KW, KH = 1.2, 1.08          # 一張黑瓦貼圖＝1.2 m（4 片）× 1.08 m（4 排）


class Xf:
    """建築自己的座標（正面朝 +z）→ 溫州街世界座標（只轉 π/2 的倍數）"""
    def __init__(self, px, pz, ry): self.px, self.pz, self.c, self.s, self.ry = px, pz, round(math.cos(ry)), round(math.sin(ry)), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def box(self, m, x0, x1, y0, y1, z0, z1):
        a = self.p(x0, y0, z0); b = self.p(x1, y1, z1); m.box(min(a[0], b[0]), max(a[0], b[0]), y0, y1, min(a[2], b[2]), max(a[2], b[2])); return m
    def quad(self, m, pts): m.quad([self.p(*q) for q in pts]); return m
    def cyl(self, m, a, b, r, **kw): m.cyl(self.p(*a), self.p(*b), r, **kw); return m


_acc = {}
def acc(key):
    mat = M[key]
    if mat.name not in _acc: _acc[mat.name] = Mesh('jp_' + key, mat)
    return _acc[mat.name]


faces = []
def face(name, mat, xf, pts, props):
    m = Mesh(name, mat); xf.quad(m, pts); faces.append((m, props))


def uvface(m, xf, pts, uvs):
    """自己給 UV 的面（屋頂：瓦的波浪要順著屋簷、一排排往屋脊）"""
    vs = [m.bm.verts.new(g2b(*xf.p(*p))) for p in pts]; f = m.bm.faces.new(vs); uvl = m.bm.loops.layers.uv.verify()
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f


def eave_tile_proto():
    """屋簷的一片瓦頭（instancing）：寬 0.3 m 的波浪斷面＋厚度，往外 0.06 m；原點＝瓦頭下緣中央"""
    m = Mesh('eave_tile', M['ridge']); bm = m.bm; n = 8; prof = []
    for i in range(n + 1):
        u = i / n; x = -0.15 + 0.3 * u; y = 0.035 + 0.035 * math.cos(2 * math.pi * (u - 0.4)); prof.append((x, y))
    front = [bm.verts.new(g2b(x, y, 0.04)) for x, y in prof] + [bm.verts.new(g2b(0.15, 0.0, 0.04)), bm.verts.new(g2b(-0.15, 0.0, 0.04))]
    back = [bm.verts.new(g2b(x, y + 0.06, -0.12)) for x, y in prof]
    bm.faces.new(front)
    for i in range(n): bm.faces.new((front[i + 1], front[i], back[i], back[i + 1]))
    return combine([m.finish(None, uv=False)], 'eave_tile')


EAVE_TILE = eave_tile_proto()
_inst = []


def eave_row(xf, a, b, y, outward):
    """沿著屋簷（a→b，房子座標）每 0.3 m 一片瓦頭；outward＝屋簷朝外的方向（房子座標，水平）"""
    ax, az = a; bx, bz = b; Ln = math.hypot(bx - ax, bz - az); n = int(Ln / 0.3)
    ry_local = math.atan2(outward[0], outward[1])        # 瓦頭原本朝 +z
    for i in range(n):
        t = (i + 0.5) / n; x, z = ax + (bx - ax) * t, az + (bz - az) * t
        wx, _, wz = xf.p(x, 0, z); B.instance(EAVE_TILE, f'eave_{len(_inst)}', wx, y, wz, root, ry=xf.ry + ry_local); _inst.append(1)


def hip_roof(xf, W, D, y0, H, r, kawara, ridge, wood):
    """寄棟屋頂：四個斜面（瓦的 UV 順著各面的屋簷）、屋簷下的封簷板與椽木、軒天、四條隅棟、大棟＋鬼瓦、屋簷一排瓦頭"""
    hw, hd = W / 2, D / 2; run = hd; Ls = math.hypot(run, H); vtop = Ls / KH
    A, Bp, C, D_ = (-hw, y0, hd), (hw, y0, hd), (hw, y0, -hd), (-hw, y0, -hd); R1, R2 = (-r, y0 + H, 0.0), (r, y0 + H, 0.0)
    uvface(kawara, xf, [A, Bp, R2, R1], [(-hw / KW, 0), (hw / KW, 0), (r / KW, vtop), (-r / KW, vtop)])
    uvface(kawara, xf, [C, D_, R1, R2], [(-hw / KW, 0), (hw / KW, 0), (r / KW, vtop), (-r / KW, vtop)])
    uvface(kawara, xf, [D_, A, R1], [(-hd / KW, 0), (hd / KW, 0), (0, vtop)])
    uvface(kawara, xf, [Bp, C, R2], [(-hd / KW, 0), (hd / KW, 0), (0, vtop)])
    # 大棟（兩層）＋圓的冠瓦、兩端鬼瓦；四條隅棟
    xf.box(ridge, -r - 0.15, r + 0.15, y0 + H - 0.05, y0 + H + 0.2, -0.16, 0.16); xf.cyl(ridge, (-r - 0.15, y0 + H + 0.22, 0), (r + 0.15, y0 + H + 0.22, 0), 0.11, seg=8)
    for s in (-1, 1):
        xf.box(ridge, s * (r + 0.15) - 0.06, s * (r + 0.15) + 0.06, y0 + H - 0.05, y0 + H + 0.42, -0.22, 0.22)
        xf.cyl(ridge, (s * (r + 0.15), y0 + H + 0.42, -0.22), (s * (r + 0.15), y0 + H + 0.42, 0.22), 0.07, seg=8)
    for (ex, ez), (rx, rz) in (((-hw, hd), (-r, 0)), ((hw, hd), (r, 0)), ((hw, -hd), (r, 0)), ((-hw, -hd), (-r, 0))):
        xf.cyl(ridge, (ex, y0 + 0.07, ez), (rx, y0 + H + 0.05, rz), 0.1, seg=6)
    # 封簷板（屋簷邊）、軒天（屋簷下，從牆到屋簷）、椽木
    t = 0.14
    xf.box(wood, -hw, hw, y0 - t, y0, hd - 0.04, hd); xf.box(wood, -hw, hw, y0 - t, y0, -hd, -hd + 0.04)
    xf.box(wood, -hw, -hw + 0.04, y0 - t, y0, -hd, hd); xf.box(wood, hw - 0.04, hw, y0 - t, y0, -hd, hd)
    return Ls


# ---- 一盞茶屋（ART-WZ2，LAWWW2-B 2026-10-16；AA_164 2-3）：院門掛紙燈籠「一盞」、門柱掛木牌、玄關掛素面麻布暖簾。
# 招牌字是使用者核可的設計稿（BB-B signs_approved/yizhan_lantern.webp），從溫州街招牌貼圖集（sign_atlas.py）取。
import json as _json
TEAHOUSE = arg('--teahouse', '1') == '1'
M['noren'] = L.flat('jp_noren', '#d8ceb6', rough=0.95)   # 素面麻布（yizhan_front_ref 的暖簾）
_ATL0 = _json.load(open(os.path.join(HERE, 'textures', 'gen', 'wz_signs_atlas.json'), encoding='utf-8'))


def _crop_atlas(keys, pad=4, align=32):
    """燈籠、木牌只用到圖集左上角兩格：切出那一塊（含 pad 個像素的邊，邊界對齊 align，前幾層 mipmap 和整張圖集的同一塊一樣）當自己的小圖，
    UV 換成小圖的座標。GLB 不再帶整張 2048² 圖集（PERF-ZONE-ENTER-1018：wenzhou_street.glb 已經有同一張，原本兩份都要解碼、上傳 GPU）。"""
    src = bpy.data.images.load(os.path.join(HERE, 'textures', 'gen', 'wz_signs_atlas.jpg'), check_existing=True); W, H = src.size
    bx = (min(_ATL0[k]['uv'][0] for k in keys) * W, min(_ATL0[k]['uv'][1] for k in keys) * H, max(_ATL0[k]['uv'][2] for k in keys) * W, max(_ATL0[k]['uv'][3] for k in keys) * H)
    x0 = max(0, math.floor((bx[0] - pad) / align) * align); y0 = max(0, math.floor((bx[1] - pad) / align) * align)      # 圖的第 0 列在最下面（UV 的 v＝0）
    x1 = min(W, math.ceil((bx[2] + pad) / align) * align); y1 = min(H, math.ceil((bx[3] + pad) / align) * align)
    import numpy as np
    px = np.empty(W * H * 4, dtype=np.float32); src.pixels.foreach_get(px)
    img = bpy.data.images.new('wz_yizhan_signs', x1 - x0, y1 - y0, alpha=False)
    img.pixels.foreach_set(np.ascontiguousarray(px.reshape(H, W, 4)[y0:y1, x0:x1]).ravel()); img.pack()
    out = {k: dict(_ATL0[k], uv=[(_ATL0[k]['uv'][0] * W - x0) / (x1 - x0), (_ATL0[k]['uv'][1] * H - y0) / (y1 - y0),
                                  (_ATL0[k]['uv'][2] * W - x0) / (x1 - x0), (_ATL0[k]['uv'][3] * H - y0) / (y1 - y0)]) for k in keys}
    print(_json.dumps({'yizhan_crop': [x0, y0, x1, y1], 'from': [W, H]}))
    return img, out


_ATL_IMG, _ATL = _crop_atlas(('yizhan_lantern', 'yizhan_plaque'))
def _atlas_mat(name, emit):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.7
    tx = N.new('ShaderNodeTexImage'); tx.image = _ATL_IMG; nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    return m


def paper_lantern(xf, x, y, z, r=0.17, h=0.5):
    """紙燈籠：燈籠身是旋轉體，正面、背面各包半圈設計稿（字兩面都看得到）；上下木蓋、鐵環、竹骨的橫紋"""
    u0, v0, u1, v1 = _ATL['yizhan_lantern']['uv']; ub0, ub1 = u0 + (u1 - u0) * 0.1, u0 + (u1 - u0) * 0.9; vb0, vb1 = v0 + (v1 - v0) * 0.12, v0 + (v1 - v0) * 0.86
    m = Mesh('yizhan_lantern_body', _atlas_mat('wz_yizhan_lantern', 0.25)); bm = m.bm; uvl = bm.loops.layers.uv.new('UVMap')
    n, rows = 24, 10; rings = []
    for j in range(rows + 1):
        t = j / rows; yy = y - h / 2 + t * h; rr = r * (0.72 + 0.28 * math.sin(math.pi * t))
        rings.append([bm.verts.new(g2b(*xf.p(x + math.sin(2 * math.pi * i / n) * rr, yy, z + math.cos(2 * math.pi * i / n) * rr))) for i in range(n + 1)])
    for j in range(rows):
        for i in range(n):
            f = bm.faces.new((rings[j][i], rings[j][i + 1], rings[j + 1][i + 1], rings[j + 1][i]))
            for lp, (ii, jj) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                a = ii / n; uu = (a + 0.25) % 0.5 * 2                                        # 正面（+z）在半圈的中間
                if ii == n and uu == 0: uu = 1.0
                lp[uvl].uv = (ub0 + (ub1 - ub0) * (1 - uu), vb0 + (vb1 - vb0) * jj / rows)
    m.finish(root, uv=False)
    cap = acc('wood')
    for yy in (y - h / 2 - 0.03, y + h / 2):
        xf.cyl(cap, (x, yy, z), (x, yy + 0.04, z), r * 0.75, seg=16)
    xf.cyl(acc('metal'), (x, y + h / 2 + 0.04, z), (x, y + h / 2 + 0.16, z), 0.006, seg=4)
    CL.glow(root, 'lantern', *xf.p(x, y, z + r + 0.05), color='rgba(255,214,150,1)', size=1.3, day=0.0, night=1.0)


def wood_plaque(xf, x, y0, z, w=0.15):
    u0, v0, u1, v1 = _ATL['yizhan_plaque']['uv']; asp = _ATL['yizhan_plaque']['aspect']; hgt = w / asp
    m = Mesh('yizhan_plaque', _atlas_mat('wz_yizhan_plaque', 0.0)); bm = m.bm; uvl = bm.loops.layers.uv.new('UVMap')
    f = bm.faces.new([bm.verts.new(g2b(*xf.p(*q))) for q in ((x - w / 2, y0, z), (x + w / 2, y0, z), (x + w / 2, y0 + hgt, z), (x - w / 2, y0 + hgt, z))])
    for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    m.finish(root, uv=False); xf.box(acc('wood'), x - w / 2, x + w / 2, y0, y0 + hgt, z - 0.025, z - 0.002)
    return y0 + hgt


def jp_house():
    xf = Xf(-21.5, 12.0, math.pi); w, d, wh, fl = 10.0, 7.0, 3.0, 0.5; hw, hd = w / 2, d / 2; top = fl + wh
    sid, wood, pla, bas = acc('siding'), acc('wood'), acc('plaster'), acc('base')
    # ---- 基座（高架地板）：水泥＋鐵條通風口
    xf.box(bas, -hw - 0.15, hw + 0.15, 0, fl, -hd - 0.15, hd + 0.15)
    vents = [((x, hd + 0.15), (0, 1)) for x in (-3.9, -2.3, 2.3, 3.9)] + [((hw + 0.15, z), (1, 0)) for z in (-1.6, 1.6)] + [((-hw - 0.15, z), (-1, 0)) for z in (-1.6, 1.6)]
    for (x, z), (nx, nz) in vents:
        tx, tz = nz, -nx; p = lambda a, y, o=0.0: (x + tx * a + nx * o, y, z + tz * a + nz * o)     # t＝從外面看的右手方向
        xf.quad(acc('dark'), [p(-0.2, 0.17, 0.005), p(0.2, 0.17, 0.005), p(0.2, 0.35, 0.005), p(-0.2, 0.35, 0.005)])
        for k in range(5):
            a = -0.16 + k * 0.08; xf.cyl(acc('metal'), p(a, 0.17, 0.02), p(a, 0.35, 0.02), 0.008, seg=4, caps=False)
    # ---- 牆：腰線（窗台高 1.5）以下雨淋板、長押（2.8）以上白灰泥；窗洞
    WIN_F = [(-3.0, 3.2), (2.5, 3.2)]            # 正面兩扇（套件的位置與寬度）
    GEN = (-0.25, 2.2, 1.3, 2.5)                 # 玄關：x、寬、深、高（套件）
    def wall_run(axis_pts, wins, normal, doors=()):
        """一面牆（房子座標）：axis_pts＝牆的兩端 (x,z)，wins＝[(沿牆位置, 寬)]、doors＝整個開口（玄關），normal＝朝外"""
        (x0, z0), (x1, z1) = axis_pts; Ln = math.hypot(x1 - x0, z1 - z0); ux, uz = (x1 - x0) / Ln, (z1 - z0) / Ln; nx, nz = normal
        P = lambda s, y, o: (x0 + ux * s + nx * o, y, z0 + uz * s + nz * o)
        def slab(m, s0, s1, y0, y1, o0, o1):
            a, b = P(s0, y0, o0), P(s1, y1, o1); xf.box(m, min(a[0], b[0]), max(a[0], b[0]), y0, y1, min(a[2], b[2]), max(a[2], b[2]))
        wcuts = [(c - wd / 2, c + wd / 2) for c, wd in wins]; cuts = sorted(wcuts + [(c - wd / 2, c + wd / 2) for c, wd in doors]); ss = [0.0] + [v for c in cuts for v in c] + [Ln]
        for k in range(0, len(ss), 2): slab(sid, ss[k], ss[k + 1], fl, 2.8, -0.15, 0)
        for a, b in wcuts: slab(sid, a, b, fl, 1.5, -0.15, 0)
        slab(pla, 0, Ln, 2.9, top, -0.15, 0)
        slab(wood, -0.02, Ln + 0.02, 2.8, 2.9, -0.15, 0.03)                                      # 長押
        slab(wood, -0.02, Ln + 0.02, fl, fl + 0.08, -0.15, 0.03)                                 # 土台
        # 押緣（每 0.45 m 一條直壓板）：窗下只到窗台
        s = 0.3
        while s < Ln - 0.2:
            inwin = any(a - 0.05 < s < b + 0.05 for a, b in cuts)
            slab(wood, s - 0.02, s + 0.02, fl + 0.08, 1.5 if inwin else 2.8, 0, 0.025); s += 0.45
        for c, wd in wins: window(P, c, wd, nx, nz)
        for sx in (0.0, Ln): slab(wood, sx - 0.08, sx + 0.08, fl, top, -0.1, 0.04)                # 柱
    def window(P, c, wd, nx, nz):
        a, b = c - wd / 2, c + wd / 2; y0, y1 = 1.5, 2.8
        def slab(m, s0, s1, ya, yb, o0, o1):
            p, q = P(s0, ya, o0), P(s1, yb, o1); xf.box(m, min(p[0], q[0]), max(p[0], q[0]), ya, yb, min(p[2], q[2]), max(p[2], q[2]))
        slab(wood, a - 0.06, b + 0.06, y0 - 0.06, y0, -0.15, 0.09)                               # 窗台
        for e in (a, b): slab(wood, e - 0.05, e + 0.05, y0, y1, -0.15, 0.02)                     # 窗框
        n = max(2, round(wd / 0.8)); pw = wd / n
        for k in range(n):                                                                       # 拉窗：每片有窗格
            s0 = a + k * pw; o = -0.05 if k % 2 else -0.09
            slab(wood, s0, s0 + pw, y0, y0 + 0.05, o - 0.03, o); slab(wood, s0, s0 + pw, y1 - 0.05, y1, o - 0.03, o)
            slab(wood, s0, s0 + 0.04, y0, y1, o - 0.03, o); slab(wood, s0 + pw - 0.04, s0 + pw, y0, y1, o - 0.03, o)
            for f in (1 / 3, 2 / 3): yy = y0 + (y1 - y0) * f; slab(wood, s0, s0 + pw, yy - 0.012, yy + 0.012, o - 0.025, o - 0.005)
            slab(wood, s0 + pw / 2 - 0.012, s0 + pw / 2 + 0.012, y0, y1, o - 0.025, o - 0.005)
            g0, g1 = P(s0 + 0.04, y0 + 0.05, o - 0.015), P(s0 + pw - 0.04, y1 - 0.05, o - 0.015)
            xf.quad(acc('glass'), [P(s0 + 0.04, y0 + 0.05, o - 0.015), P(s0 + pw - 0.04, y0 + 0.05, o - 0.015), P(s0 + pw - 0.04, y1 - 0.05, o - 0.015), P(s0 + 0.04, y1 - 0.05, o - 0.015)])
        # 紙拉門（窗後 0.35 m；有的半開，露出暗的房間）
        open_ = random.random() < 0.5; sh_b = b - (wd * 0.4 if open_ else 0)
        xf.quad(acc('shoji'), [P(a, y0, -0.35), P(sh_b, y0, -0.35), P(sh_b, y1, -0.35), P(a, y1, -0.35)])
        if open_: xf.quad(acc('dark'), [P(sh_b, y0, -0.9), P(b, y0, -0.9), P(b, y1, -0.9), P(sh_b, y1, -0.9)])
    gx, gw_, gd, gh = GEN
    front_wins = [(c + hw, wd) for c, wd in WIN_F]
    # 正面：玄關那一段不做牆（玄關的側牆＋拉門代替）
    wall_run(((-hw, hd), (hw, hd)), front_wins, (0, 1), doors=[(gx + hw, gw_)])
    wall_run(((hw, hd), (hw, -hd)), [(3.5, 1.8)], (1, 0))
    wall_run(((-hw, -hd), (-hw, hd)), [(3.5, 1.8)], (-1, 0))
    wall_run(((hw, -hd), (-hw, -hd)), [], (0, -1))
    # 玄關那一段牆的下半（玄關裡面看得到）＝暗色
    xf.quad(acc('dark'), [(gx - gw_ / 2, fl, hd - 0.1), (gx + gw_ / 2, fl, hd - 0.1), (gx + gw_ / 2, fl + gh, hd - 0.1), (gx - gw_ / 2, fl + gh, hd - 0.1)])
    # ---- 玄關：側牆（雨淋板）、石基座、格子拉門、門楣、切妻小屋頂、門燈、沓脫石
    fz = hd
    for s in (-1, 1): xf.box(sid, gx + s * gw_ / 2 - 0.08, gx + s * gw_ / 2 + 0.08, fl, fl + gh, fz, fz + gd)
    xf.box(bas, gx - gw_ / 2 - 0.2, gx + gw_ / 2 + 0.2, 0, fl, fz, fz + gd + 0.1)
    dz = fz + gd
    for k in (0, 1):                                                                             # 兩片格子拉門
        s0 = gx - gw_ / 2 + 0.1 + k * (gw_ - 0.2) / 2; s1 = s0 + (gw_ - 0.2) / 2; o = dz - (0.05 if k else 0.09)
        xf.box(wood, s0, s1, fl, fl + 0.08, o - 0.04, o); xf.box(wood, s0, s1, fl + gh - 0.38, fl + gh - 0.3, o - 0.04, o)
        xf.box(wood, s0, s0 + 0.05, fl, fl + gh - 0.3, o - 0.04, o); xf.box(wood, s1 - 0.05, s1, fl, fl + gh - 0.3, o - 0.04, o)
        xf.box(wood, s0, s1, fl + 1.35, fl + 1.39, o - 0.04, o)
        xx = s0 + 0.09
        while xx < s1 - 0.07: xf.box(wood, xx - 0.012, xx + 0.012, fl + 0.08, fl + gh - 0.38, o - 0.035, o - 0.01); xx += 0.065
        xf.quad(acc('frost'), [(s0 + 0.05, fl + 0.08, o - 0.03), (s1 - 0.05, fl + 0.08, o - 0.03), (s1 - 0.05, fl + gh - 0.38, o - 0.03), (s0 + 0.05, fl + gh - 0.38, o - 0.03)])
    xf.box(wood, gx - gw_ / 2 - 0.1, gx + gw_ / 2 + 0.1, fl + gh - 0.3, fl + gh - 0.1, dz - 0.12, dz + 0.04)     # 門楣
    xf.box(pla, gx - gw_ / 2, gx + gw_ / 2, fl + gh - 0.1, fl + gh + 0.05, dz - 0.12, dz - 0.02)
    ang = 0.36; half = gw_ / 2 + 0.35; rh = math.tan(ang) * half; ry0 = fl + gh + 0.08; z0, z1 = fz - 0.1, dz + 0.4
    kaw = Mesh('genkan_roof', M['kawara']); Ls = math.hypot(half, rh)
    for s in (-1, 1):                                                                            # 兩個斜面（瓦的波浪沿著 z）
        e, r_ = gx + s * half, gx
        pts = [(e, ry0, z1), (e, ry0, z0), (r_, ry0 + rh, z0), (r_, ry0 + rh, z1)] if s > 0 else [(e, ry0, z0), (e, ry0, z1), (r_, ry0 + rh, z1), (r_, ry0 + rh, z0)]
        uvs = [(z1 / KW, 0), (z0 / KW, 0), (z0 / KW, Ls / KH), (z1 / KW, Ls / KH)] if s > 0 else [(z0 / KW, 0), (z1 / KW, 0), (z1 / KW, Ls / KH), (z0 / KW, Ls / KH)]
        uvface(kaw, xf, pts, uvs)
        eave_row(xf, (e, z0), (e, z1), ry0 - 0.05, (s, 0))
    kaw.finish(root, uv=False)
    rid = acc('ridge'); xf.cyl(rid, (gx, ry0 + rh + 0.05, z0), (gx, ry0 + rh + 0.05, z1 + 0.05), 0.1, seg=8)
    for s in (-1, 1):                                                                            # 破風板（妻側的封簷板）
        a, b = (gx + s * (half + 0.02), ry0 - 0.12, z1), (gx, ry0 + rh - 0.04, z1)
        xf.cyl(wood, a, b, 0.07, seg=4)
    xf.quad(pla, [(gx - gw_ / 2, ry0 - 0.02, dz - 0.05), (gx + gw_ / 2, ry0 - 0.02, dz - 0.05), (gx, ry0 + rh * (gw_ / 2) / half, dz - 0.05)])   # 妻壁（三角形）
    lx, ly, lz = gx + gw_ / 2 - 0.25, fl + gh - 0.55, dz + 0.12                                   # 門燈（和套件同一個位置：光暈對得上）
    xf.box(wood, lx - 0.12, lx + 0.12, ly - 0.15, ly + 0.15, lz - 0.12, lz + 0.12); xf.box(acc('lamp'), lx - 0.1, lx + 0.1, ly - 0.13, ly + 0.13, lz - 0.1, lz + 0.1)
    xf.box(wood, lx - 0.14, lx + 0.14, ly + 0.15, ly + 0.19, lz - 0.14, lz + 0.14)
    xf.box(acc('base'), gx - 0.45, gx + 0.45, 0, 0.14, dz + 0.22, dz + 0.78)                      # 沓脫石
    if TEAHOUSE:                                                                                 # 一盞：玄關的素面麻布暖簾（三片，上面一根竹竿）
        nr = acc('noren'); y1 = fl + gh - 0.32
        xf.cyl(acc('wood'), (gx - gw_ / 2 + 0.05, y1 + 0.02, dz + 0.08), (gx + gw_ / 2 - 0.05, y1 + 0.02, dz + 0.08), 0.015, seg=6)
        for k in range(3):
            a = gx - gw_ / 2 + 0.12 + k * (gw_ - 0.24) / 3; b = a + (gw_ - 0.24) / 3 - 0.03; xf.box(nr, a, b, y1 - 0.75, y1, dz + 0.07, dz + 0.085)
    # ---- 主屋頂（寄棟）：屋簷比牆多出 0.8 m
    kawara = Mesh('roof_main', M['kawara'])
    W, D, H = w + 1.6, d + 1.6, 1.9
    hip_roof(xf, W, D, top, H, max(0.2, (W - D) / 2), kawara, acc('ridge'), wood)
    kawara.finish(root, uv=False)
    for a, b, o in (((-W / 2, D / 2), (W / 2, D / 2), (0, 1)), ((W / 2, -D / 2), (-W / 2, -D / 2), (0, -1)), ((-W / 2, -D / 2), (-W / 2, D / 2), (-1, 0)), ((W / 2, D / 2), (W / 2, -D / 2), (1, 0))):
        eave_row(xf, a, b, top - 0.06, o)
    # 軒天（屋簷底下）＋椽木
    soff = acc('wood'); yS = top - 0.02
    xf.quad(soff, [(-W / 2, yS, D / 2), (-hw, yS, hd), (hw, yS, hd), (W / 2, yS, D / 2)]); xf.quad(soff, [(W / 2, yS, -D / 2), (hw, yS, -hd), (-hw, yS, -hd), (-W / 2, yS, -D / 2)])
    xf.quad(soff, [(-W / 2, yS, -D / 2), (-hw, yS, -hd), (-hw, yS, hd), (-W / 2, yS, D / 2)]); xf.quad(soff, [(W / 2, yS, D / 2), (hw, yS, hd), (hw, yS, -hd), (W / 2, yS, -D / 2)])
    x = -W / 2 + 0.3
    while x < W / 2 - 0.2:
        for zz in (1, -1): xf.box(wood, x - 0.03, x + 0.03, yS - 0.07, yS, min(zz * hd, zz * (D / 2 - 0.02)), max(zz * hd, zz * (D / 2 - 0.02)))
        x += 0.45
    # 雨水槽（正面屋簷）＋落水管（左前角）
    gt = acc('pipe'); xf.cyl(gt, (-W / 2, top - 0.19, D / 2 + 0.05), (W / 2, top - 0.19, D / 2 + 0.05), 0.045, seg=8)
    xf.cyl(gt, (-W / 2 + 0.25, top - 0.2, D / 2 + 0.06), (-hw - 0.05, top - 0.75, hd + 0.08), 0.035, seg=6)
    xf.cyl(gt, (-hw - 0.05, top - 0.75, hd + 0.08), (-hw - 0.05, 0.12, hd + 0.08), 0.035, seg=6)
    # ---- 後來加的：窗型冷氣（+x 側牆）、浪板雨遮（−x 側窗上）、電表箱（右前角）
    ac = acc('ac'); xf.box(ac, hw - 0.05, hw + 0.38, 1.9, 2.3, -2.6, -1.95)
    for k in range(6): xf.box(acc('ac_dark'), hw + 0.38, hw + 0.39, 1.95 + k * 0.055, 1.975 + k * 0.055, -2.55, -2.0)
    xf.box(acc('metal'), hw, hw + 0.4, 1.86, 1.9, -2.62, -1.93)
    cr = acc('corr'); y_ = 2.95
    xf.quad(cr, [(-hw, y_, -1.2), (-hw, y_, 1.2), (-hw - 0.6, y_ - 0.22, 1.2), (-hw - 0.6, y_ - 0.22, -1.2)])          # 側窗（z＝0）上面
    xf.quad(cr, [(-hw - 0.6, y_ - 0.22, -1.2), (-hw - 0.6, y_ - 0.22, 1.2), (-hw, y_, 1.2), (-hw, y_, -1.2)])
    xf.box(acc('meter'), hw - 0.55, hw - 0.2, 1.1, 1.55, hd + 0.02, hd + 0.16); xf.cyl(acc('metal'), (hw - 0.37, 1.55, hd + 0.09), (hw - 0.37, top - 0.3, hd + 0.09), 0.02, seg=5)


def jp_wall():
    """院牆（TK.wall(17,1.15,{gate:2.4,gateX:−0.5,openGate:true}) 的位置與大小）"""
    xf = Xf(-21.0, 5.35, math.pi); Ln, h, gx, gw = 17.0, 1.15, -0.5, 2.4
    cw, bas, kaw, rid, wood = acc('cwall'), acc('base'), Mesh('wall_cap', M['kawara']), acc('ridge'), acc('wood')
    def seg(x0, x1):
        xf.box(cw, x0, x1, 0.18, h, -0.125, 0.125); xf.box(bas, x0, x1, 0, 0.18, -0.15, 0.15)            # 牆身＋牆腳
        xf.box(acc('plaster'), x0 - 0.02, x1 + 0.02, h, h + 0.05, -0.17, 0.17)                          # 瓦頂下的壓頂
        # 瓦頂：兩個斜面（波浪沿著牆）、脊
        for s in (-1, 1):
            pts = [(x0 - 0.05, h + 0.05, s * 0.3), (x1 + 0.05, h + 0.05, s * 0.3), (x1 + 0.05, h + 0.2, 0), (x0 - 0.05, h + 0.2, 0)]
            if s < 0: pts = [pts[1], pts[0], pts[3], pts[2]]
            uvface(kaw, xf, pts, [(p[0] / KW * (1 if s > 0 else -1), 0 if p[1] < h + 0.1 else 0.33 / KH) for p in pts])
        xf.cyl(rid, (x0 - 0.05, h + 0.22, 0), (x1 + 0.05, h + 0.22, 0), 0.055, seg=6)
        n = max(1, round((x1 - x0) / 2.6))                                                              # 壁柱
        for k in range(n + 1):
            px = x0 + (x1 - x0) * k / n; px = min(max(px, x0 + 0.17), x1 - 0.17)
            xf.box(cw, px - 0.17, px + 0.17, 0.18, h + 0.02, -0.16, 0.16)
    seg(-Ln / 2, gx - gw / 2); seg(gx + gw / 2, Ln / 2)
    kaw.finish(root, uv=False)
    gh = max(h + 0.4, 2.1)
    for s in (-1, 1):
        px = gx + s * (gw / 2 + 0.11); xf.box(wood, px - 0.11, px + 0.11, 0, gh, -0.11, 0.11); xf.box(bas, px - 0.16, px + 0.16, 0, 0.12, -0.16, 0.16)
    xf.box(wood, gx - gw / 2 - 0.35, gx + gw / 2 + 0.35, gh - 0.25, gh - 0.05, -0.12, 0.12)                # 冠木
    gk = Mesh('gate_roof', M['kawara']); half = 0.45; rh = 0.22; y0 = gh + 0.02
    for s in (-1, 1):                                                                                     # 門上的小屋頂（脊沿著牆）
        pts = [(gx - gw / 2 - 0.5, y0, s * half), (gx + gw / 2 + 0.5, y0, s * half), (gx + gw / 2 + 0.5, y0 + rh, 0), (gx - gw / 2 - 0.5, y0 + rh, 0)]
        if s < 0: pts = [pts[1], pts[0], pts[3], pts[2]]
        Ls = math.hypot(half, rh); uvface(gk, xf, pts, [(p[0] / KW * (1 if s > 0 else -1), 0 if p[1] < y0 + 0.1 else Ls / KH) for p in pts])
        eave_row(xf, (gx - gw / 2 - 0.5, s * half), (gx + gw / 2 + 0.5, s * half), y0 - 0.05, (0, s))
    gk.finish(root, uv=False)
    xf.cyl(rid, (gx - gw / 2 - 0.55, y0 + rh + 0.04, 0), (gx + gw / 2 + 0.55, y0 + rh + 0.04, 0), 0.08, seg=8)
    xf.box(wood, gx - gw / 2 - 0.5, gx + gw / 2 + 0.5, y0 - 0.1, y0, -half, half)
    # 門牌（左門柱正面：藍底白字）、「私人住宅 請勿進入」（門右邊的牆）、鐵信箱
    lp = gx - gw / 2 - 0.11
    face('PLATE_FACE_door', M['board'], xf, [(lp - 0.09, 1.38, 0.115), (lp + 0.09, 1.38, 0.115), (lp + 0.09, 1.7, 0.115), (lp - 0.09, 1.7, 0.115)], {'plate': 'door', 'text': '溫州街', 'sub': '５號', 'bg': '#1f4e8c', 'color': '#ffffff'})
    if TEAHOUSE:                                                                                 # 一盞：院門左邊掛紙燈籠、右門柱掛木牌（原本的「私人住宅 請勿進入」拿掉）
        paper_lantern(xf, gx - gw / 2 + 0.35, 1.5, 0.3); xf.cyl(acc('metal'), (gx - gw / 2 + 0.35, 1.91, 0.3), (gx - gw / 2 + 0.35, gh - 0.25, 0.12), 0.006, seg=4)
        rp = gx + gw / 2 + 0.11; wood_plaque(xf, rp, 0.95, 0.12)
        xf.cyl(acc('metal'), (rp, 1.72, 0.1), (rp, 1.8, 0.115), 0.004, seg=3)
    else:
        face('PLATE_FACE_private', M['board'], xf, [(1.25, 0.62, 0.13), (1.7, 0.62, 0.13), (1.7, 0.86, 0.13), (1.25, 0.86, 0.13)], {'plate': 'notice', 'text': '私人住宅', 'sub': '請勿進入', 'bg': '#f4f1ea', 'color': '#a3262a'})
    xf.box(acc('metal'), 2.0, 2.32, 0.7, 1.02, 0.125, 0.25); xf.box(acc('metal'), 2.04, 2.28, 0.98, 1.0, 0.25, 0.26)


jp_house(); jp_wall()
for k, m in _acc.items(): m.finish(root)
for m, props in faces: uv01(m.finish(root, uv=True, props=props))
# 純色材質改成頂點色材質（第二輪減量，2026-10-10；lib2.vc_consolidate）：同一組的零件合成一個網格、一次 draw call
L.vc_consolidate(root, {
                        **dict.fromkeys(('jp_ridge', 'cafe_ac_body', 'cafe_ac_fan', 'cafe_room_dark'), L.vc_material('wz_vc_matte', rough=0.85)),
                        **dict.fromkeys(('cafe_iron_black', 'jp_gutter', 'jp_meter'), L.vc_metal('wz_vc_metal', rough=0.45, metal=0.35))})
_keep = lambda ob: 'FACE' in ob.name   # 第三輪減量（2026-10-16）：其他純色材質也進頂點色、只擺幾個的 instancing 合進大網格、多材質的零件拆開再合
L.vc_consolidate(root, L.auto_vc_groups(root, bpy.data.materials['wz_vc_matte'], bpy.data.materials['wz_vc_metal'], protect={'jp_lamp', 'jp_shoji', 'wz_lamp_lens', 'wz_yizhan_lantern'}))
L.realize_small_instances(root, keep=_keep)
L.split_by_material(root, keep=_keep)
L.atlas_small(root, os.path.join(HERE, 'textures', 'gen', 'wz_jp_small_atlas.png'), 'wz_jp_small_atlas', protect={'jp_lamp', 'jp_shoji', 'wz_lamp_lens', 'wz_yizhan_lantern', 'wz_yizhan_plaque'}, max_tris=600, keep=_keep)   # 效能第二輪：小貼圖材質合一張
L.atlas_rows(root, os.path.join(HERE, 'textures', 'gen', 'wz_jp_rows.jpg'), 'wz_jp_rows', protect={'jp_lamp', 'jp_shoji', 'wz_lamp_lens', 'wz_yizhan_lantern', 'wz_yizhan_plaque'}, max_vloss=0.06, keep=_keep, skip=lambda m: m.name.startswith('wz_jp_small_atlas'))
L.merge_by_material(root, keep=_keep)
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
