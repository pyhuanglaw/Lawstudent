"""台北街上的機車：多個車型（使用者 2026-10-16 20:2x：「遊戲裡面機車和腳踏車都只是同個模板換顏色，太假了……國內外都要有，不要抄襲，但要參考」）。
LAWWW2-B（D89：美術歸 LAWWW2）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/scooters_v2.py [-- --out assets/models/env/second_ai/scooter.glb] [--only S1A,S2]

參考：docs/art-rebuild/second_ai/research/vehicles_research.md（9 種外型原型的尺寸、造型線索、配色；數字來自搜尋摘要，標「估」的是估計）。
**只參考車型的類別**（國民通勤、運動型、電動換電、復古圓弧…），外型比例自己定；不放商標、不照抄任何一款的前臉或飾條；車牌空白。

座標：和 scooter.py 一樣——車頭朝 +x、原點在兩輪中間的地面、+z＝左邊（引擎、傳動箱在左；排氣管在右 −z）。
每一款一個節點 `scooter_<代號>`（網格三個材質：scooter_paint 白色＝遊戲乘上這台的顏色、scooter_parts 頂點色、scooter_metal 頂點色＋金屬 0.45），
節點的自訂屬性（glTF extras）：`archetype`（原型）、`weight`（街上的比例，遊戲照這個挑）、`palette`（這一型常見的車殼顏色）。
舊的名稱 `scooter_a`（＝S1 新款）、`scooter_b`（＝S4 復古）也保留：遊戲還沒套新的接法之前照舊能用。
預算：溫州街三角形只剩約 3 千的餘裕 → 每台平均 ≤1,350 三角形（舊版 1,286）。
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import combine   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/scooter.glb'))
ONLY = [s for s in (arg('--only', '') or '').split(',') if s]
PREVIEW_COL = {}   # --preview：渲染用，車殼直接寫這一型的代表色（遊戲版是白色、由遊戲乘顏色）

B.reset(texres=256)
root = B.group('scooters', props={'kind': 'scooters', 'version': 2})
M = {
    'paint': L.flat('scooter_paint', '#ffffff', rough=0.32),
    'parts': L.vc_material('scooter_parts', rough=0.55),
    'metalvc': L.vc_material('scooter_metal', rough=0.32),
}
M['metalvc'].node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0.45
# 零件顏色（寫進頂點色）：(顏色, 金屬)
COL = {'cloth': ('#9aa0a6', 0), 'seat_brown': ('#5a3a28', 0), 'cvt': ('#46494e', 1), 'dark': ('#2a2b2d', 0), 'black': ('#17181a', 0), 'seat': ('#1d1c1c', 0), 'tire': ('#191919', 0), 'lamp': ('#e8edf0', 0), 'lamp_warm': ('#f2e6c8', 0),
       'tail': ('#a1231b', 0), 'amber': ('#d98a1e', 0), 'plate': ('#f1f1ec', 0), 'smoke': ('#3b4148', 0), 'box': ('#2e3033', 0), 'box_grey': ('#8e9196', 0),
       'deliv': ('#31373d', 0), 'helmet_w': ('#e9e7e2', 0), 'helmet_b': ('#2a3a55', 0), 'helmet_r': ('#9b2c2c', 0), 'visor': ('#252a30', 0),
       'metal': ('#7d8186', 1), 'chrome': ('#b9bec3', 1), 'alloy': ('#5d6166', 1), 'gold': ('#a8873e', 1)}


class Part(Mesh):
    """零件：一個顏色（paint＝車殼，白色）。最後全部寫頂點色、換成三個共用材質。
    smooth＝曲面零件（車殼、座墊）：細分一次（Subdivision Surface）讓曲面圓順，再減面（Decimate）回到預算 target 個三角形"""
    def __init__(self, col='paint', smooth=False, target=None):
        super().__init__('p_' + col + ('_s' if smooth else ''), M['paint']); self.col = col; self.smooth = smooth; self.target = target


def subdiv_decimate(ob, target, levels=1):
    """細分＋減面（用 depsgraph 算出結果再換掉網格，不靠 UI 的 modifier_apply）"""
    sub = ob.modifiers.new('sub', 'SUBSURF'); sub.levels = levels; sub.render_levels = levels
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); ob.modifiers.remove(sub)
    old = ob.data; ob.data = me; bpy.data.meshes.remove(old)
    n = sum(len(p.vertices) - 2 for p in me.polygons)
    if target and n > target:
        dec = ob.modifiers.new('dec', 'DECIMATE'); dec.ratio = target / n; dec.use_collapse_triangulate = True
        dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); ob.modifiers.remove(dec)
        old = ob.data; ob.data = me2; bpy.data.meshes.remove(old)


def finish_all(parts, name, loc_z):
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    obs = []
    for p in parts:
        if p.empty(): p.bm.free(); continue
        col = p.col; ob = p.finish(None, uv=False)
        if getattr(p, 'smooth', False): subdiv_decimate(ob, p.target)
        L.smooth_mesh(ob, angle=1.0)
        if '--parts' in ARGS: print('   part', name, col, ob.name, sum(len(q.vertices) - 2 for q in ob.data.polygons))
        hx, met = (PREVIEW_COL.get(name, '#ffffff'), 0) if col == 'paint' else COL[col]
        c = [lin(int(hx[i:i + 2], 16) / 255) for i in (1, 3, 5)] + [1.0]
        at = ob.data.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
        for d in at.data: d.color = c
        ob.data.materials[0] = (M['parts'] if PREVIEW_COL else M['paint']) if col == 'paint' else (M['metalvc'] if met else M['parts'])   # 預覽：車殼用頂點色材質（遊戲版是白色 paint、由遊戲乘顏色）
        obs.append(ob)
    me = combine(obs, name); ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); ob.parent = root
    ob.location = (loc_z * 2.0, 0.0, 0.0) if '--layx' in ARGS else (0.0, -loc_z, 0.0)   # 匯出時一款一款排開（遊戲照名稱取，不看位置）；--layx：沿車身方向排（渲染側面用）
    return ob


def sect(x, cy, hw, hh, p=2.6, n=8, dz=0.0):
    """橫斷面（x 處）：超橢圓，中心高 cy、半寬 hw、半高 hh；p 越大越方"""
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t)
        pts.append((x, cy + hh * math.copysign(abs(s) ** (2 / p), s), dz + hw * math.copysign(abs(c) ** (2 / p), c)))
    return pts


def vsect(x, y, hw, hd, p=2.6, n=8):
    """沿 y 往上接的斷面（前擋）：x–z 平面的超橢圓"""
    e = 2 / p; out = []
    for i in range(n):
        t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t)
        out.append((x + hd * math.copysign(abs(s) ** e, s), y, hw * math.copysign(abs(c) ** e, c)))
    return out


def loft(m, rings, cap=True):
    bm = m.bm; vr = [[bm.verts.new(g2b(*p)) for p in r] for r in rings]; n = len(rings[0])
    for a, b in zip(vr, vr[1:]):
        for i in range(n):
            j = (i + 1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    if cap:
        bm.faces.new(vr[0]); bm.faces.new(list(reversed(vr[-1])))
    return m


def wheel(parts, x, r, w, rim='disc', seg=18):
    """輪胎（車胎截面是圓弧：機車胎窄而圓）＋輪框；rim：disc（壓鑄多輻，簡化成兩面圓盤）、spoke（鋼絲輪：細的框＋輪轂）"""
    t = Part('tire'); hub = r * (0.47 if rim == 'disc' else 0.82)
    prof = [(hub + 0.012, -w / 2 * 0.8), (r - w * 0.3, -w / 2), (r, 0.0), (r - w * 0.3, w / 2), (hub + 0.012, w / 2 * 0.8)]
    bm = L.lathe(prof, seg=seg); t.add_bm(bm, Matrix.Translation(g2b(x, r, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')); bm.free(); parts.append(t)
    if rim == 'disc':
        rm = Part('alloy'); bm = L.lathe([(0.0, -w / 2 * 0.62), (hub + 0.014, -w / 2 * 0.75), (hub + 0.014, w / 2 * 0.75), (0.0, w / 2 * 0.62)], seg=12)
        rm.add_bm(bm, Matrix.Translation(g2b(x, r, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')); bm.free(); parts.append(rm)
    else:   # 鋼絲輪：鍍鉻輪圈（細環）＋輪轂；輻條用 6 根細桿暗示
        rm = Part('chrome'); bm = L.lathe([(hub, -0.016), (hub + 0.016, -0.016), (hub + 0.016, 0.016), (hub, 0.016)], seg=12)
        rm.add_bm(bm, Matrix.Translation(g2b(x, r, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')); bm.free()
        rm.cyl((x, r, -0.045), (x, r, 0.045), 0.045, seg=8)
        for k in range(6):
            a = k * math.pi / 3; rm.cyl((x, r, 0), (x + math.cos(a) * hub, r + math.sin(a) * hub, 0), 0.003, seg=3)
        parts.append(rm)


def tsect(x, yb, yt, wb, wt, p=3.0, n=10, bulge=0.07):
    """後車身的橫斷面：圓角梯形（下寬 wb、上寬 wt 的半寬；底 yb、頂 yt）；p 越大角越方"""
    cy, hh = (yb + yt) / 2, (yt - yb) / 2; pts = []
    for i in range(n):
        t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t)
        v = math.copysign(abs(s) ** (2 / p), s); u = math.copysign(abs(c) ** (2 / p), c)
        w = (wb + (wt - wb) * (v + 1) / 2) * (1 + bulge * (1 - ((v + 0.25) / 1.25) ** 2))   # 側蓋往外鼓（最寬在下 40% 的高度）
        pts.append((x, cy + hh * v, u * w))
    return pts


def shield(x, y, hw, df, db, p=2.6, n=10):
    """前擋的斷面（x–z 平面）：前面鼓（df）、後面（膝蓋那側）平（db）"""
    e = 2 / p; out = []
    for i in range(n):
        t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t)
        d = df if s > 0 else db
        out.append((x + d * math.copysign(abs(s) ** e, s), y, hw * math.copysign(abs(c) ** e, c)))
    return out


def interp(rows, k=1):
    """斷面表的每兩列之間插 k 列（Catmull-Rom，每個欄位各自內插）：車身沿長度方向的輪廓才圓順，不是一段一段的折線"""
    R = [list(r) for r in rows]; out = []
    for i in range(len(R) - 1):
        p0, p1, p2, p3 = R[max(i - 1, 0)], R[i], R[i + 1], R[min(i + 2, len(R) - 1)]
        for j in range(k + 1):
            t = j / (k + 1)
            out.append(tuple(0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t ** 3) for a, b, c, d in zip(p0, p1, p2, p3)))
    out.append(tuple(R[-1])); return out


def arc_band(part, cx, cy, r, a0, a1, w, th=0.012, n=7, nz=4):
    """包著輪子的弧形片（土除）：圓心 (cx, cy)、半徑 r、角度 a0→a1（度，0＝正上方、往 +x 為正）、寬 ±w、厚 th"""
    rings = []
    for i in range(n):
        a = math.radians(a0 + (a1 - a0) * i / (n - 1)); rx, ry = math.sin(a), math.cos(a); ring = []
        for k in range(nz):   # 斷面：扁的圓角長方形（徑向厚 th、橫向寬 w）
            t = 2 * math.pi * k / nz + math.pi / nz; c, s_ = math.cos(t), math.sin(t)
            dr = th * math.copysign(abs(s_) ** 0.5, s_); dz = w * math.copysign(abs(c) ** 0.4, c)
            ring.append((cx + rx * (r + dr), cy + ry * (r + dr), dz))
        rings.append(ring)
    loft(part, rings)


# ---------------- 車型參數 ----------------
# 長度單位公尺。wb 半軸距、rf／rr 輪外半徑、tw 胎寬、fl 踏板高、fx 踏板前緣
# rear：後車身斷面 [(x, 底, 頂, 下半寬, 上半寬)]；rp 方度
# apron：前擋斷面 [(y, 中心 x, 半寬, 前鼓, 後鼓)]；app 方度
# cover：龍頭罩 [(x, 中心高, 半寬, 半高)]；lamp：handle／apron／vled／strip
# seat：[(x, 底, 頂, 半寬)]；exh：normal／big／none；tail：wide／sharp／strip
ARCH = {
    'S1A': dict(name='國民通勤 125（舊款：頭燈在龍頭）', wb=0.61, rf=0.212, rr=0.212, tw=0.09, fl=0.30, fx=0.3,
                rear=[(0.0, 0.29, 0.70, 0.165, 0.13), (-0.14, 0.29, 0.73, 0.175, 0.14), (-0.36, 0.34, 0.745, 0.18, 0.15), (-0.6, 0.47, 0.745, 0.17, 0.145), (-0.8, 0.54, 0.735, 0.15, 0.13), (-0.92, 0.585, 0.71, 0.11, 0.095), (-0.96, 0.62, 0.68, 0.06, 0.05)], rp=3.0,
                apron=[(0.28, 0.31, 0.205, 0.07, 0.03), (0.46, 0.35, 0.2, 0.1, 0.035), (0.63, 0.385, 0.19, 0.11, 0.04), (0.79, 0.415, 0.17, 0.1, 0.045), (0.93, 0.435, 0.13, 0.07, 0.045)], app=2.6,
                cover=[(0.33, 0.985, 0.08, 0.04), (0.39, 1.0, 0.17, 0.06), (0.47, 0.99, 0.17, 0.055), (0.54, 0.965, 0.1, 0.04)], lamp='handle',
                seat=[(0.0, 0.70, 0.745, 0.13), (-0.1, 0.725, 0.785, 0.15), (-0.45, 0.74, 0.8, 0.155), (-0.72, 0.735, 0.81, 0.14), (-0.86, 0.72, 0.785, 0.1)],
                exh='normal', tail='wide', mirror='round', two_tone=False, extras=['rear_box', 'grab'],
                palette=['#e9e9e6', '#1d1f22', '#8c9095', '#b8bcc0', '#22344f', '#8f1f24', '#d9cdb6'], weight=0.22),
    'S1B': dict(name='國民通勤 125（新款：頭燈在前擋）', wb=0.62, rf=0.22, rr=0.212, tw=0.095, fl=0.31, fx=0.3,
                rear=[(0.0, 0.3, 0.71, 0.17, 0.13), (-0.14, 0.3, 0.74, 0.18, 0.14), (-0.36, 0.35, 0.755, 0.185, 0.15), (-0.6, 0.48, 0.755, 0.175, 0.145), (-0.8, 0.55, 0.745, 0.155, 0.13), (-0.93, 0.6, 0.72, 0.115, 0.095), (-0.975, 0.63, 0.69, 0.065, 0.05)], rp=3.4,
                apron=[(0.29, 0.31, 0.21, 0.075, 0.03), (0.47, 0.35, 0.205, 0.11, 0.035), (0.64, 0.39, 0.195, 0.115, 0.04), (0.8, 0.42, 0.175, 0.1, 0.045), (0.94, 0.44, 0.135, 0.07, 0.045)], app=3.0,
                cover=[(0.34, 0.995, 0.08, 0.035), (0.4, 1.005, 0.16, 0.05), (0.47, 0.995, 0.15, 0.045), (0.53, 0.975, 0.09, 0.03)], lamp='apron',
                seat=[(0.0, 0.71, 0.755, 0.13), (-0.1, 0.735, 0.795, 0.15), (-0.45, 0.75, 0.81, 0.155), (-0.74, 0.745, 0.82, 0.14), (-0.88, 0.73, 0.795, 0.1)],
                exh='normal', tail='wide', mirror='round', two_tone=False, extras=['hook_bag', 'grab'],
                palette=['#f1f1ee', '#141517', '#6f7378', '#a9adb2', '#334a6b', '#c9c1b3', '#5d6a5a'], weight=0.24),
    'S2': dict(name='運動型 125～158', wb=0.67, rf=0.232, rr=0.232, tw=0.115, fl=0.32, fx=0.31,
               rear=[(0.0, 0.31, 0.72, 0.16, 0.12), (-0.16, 0.31, 0.75, 0.175, 0.13), (-0.4, 0.37, 0.77, 0.18, 0.14), (-0.66, 0.52, 0.79, 0.16, 0.125), (-0.86, 0.62, 0.82, 0.12, 0.095), (-0.98, 0.7, 0.85, 0.07, 0.055), (-1.03, 0.75, 0.86, 0.03, 0.025)], rp=4.6,
               apron=[(0.3, 0.32, 0.18, 0.08, 0.03), (0.48, 0.37, 0.19, 0.12, 0.035), (0.65, 0.42, 0.18, 0.12, 0.04), (0.81, 0.47, 0.15, 0.1, 0.045), (0.96, 0.51, 0.1, 0.065, 0.045)], app=4.4,
               cover=[(0.37, 1.03, 0.08, 0.045), (0.44, 1.045, 0.15, 0.055), (0.52, 1.03, 0.13, 0.045), (0.6, 0.995, 0.05, 0.025)], lamp='vled',
               seat=[(0.0, 0.72, 0.765, 0.12), (-0.12, 0.745, 0.805, 0.145), (-0.5, 0.765, 0.825, 0.15), (-0.74, 0.79, 0.86, 0.125), (-0.92, 0.82, 0.875, 0.07)],
               exh='big', tail='sharp', mirror='poly', two_tone=True, extras=['phone', 'grab'],
               palette=['#1b1c1e', '#3b3f44', '#20427a', '#e8e8e6', '#6e7276', '#7a1c22', '#2f5a3c'], weight=0.2),
    'S5': dict(name='電動換電型', wb=0.63, rf=0.222, rr=0.222, tw=0.095, fl=0.29, fx=0.29,
               rear=[(0.0, 0.28, 0.7, 0.15, 0.12), (-0.14, 0.28, 0.73, 0.16, 0.13), (-0.36, 0.33, 0.745, 0.165, 0.135), (-0.6, 0.45, 0.745, 0.155, 0.13), (-0.8, 0.52, 0.735, 0.135, 0.115), (-0.92, 0.57, 0.715, 0.1, 0.085), (-0.955, 0.6, 0.69, 0.05, 0.04)], rp=3.8,
               apron=[(0.27, 0.29, 0.17, 0.06, 0.025), (0.45, 0.325, 0.17, 0.085, 0.03), (0.62, 0.36, 0.16, 0.09, 0.035), (0.78, 0.39, 0.145, 0.08, 0.04), (0.92, 0.41, 0.115, 0.06, 0.04)], app=3.6,
               cover=[(0.33, 0.985, 0.07, 0.035), (0.39, 0.995, 0.14, 0.04), (0.46, 0.985, 0.13, 0.035), (0.51, 0.97, 0.08, 0.025)], lamp='strip',
               seat=[(0.0, 0.70, 0.74, 0.12), (-0.1, 0.725, 0.78, 0.14), (-0.45, 0.74, 0.795, 0.145), (-0.72, 0.735, 0.8, 0.13), (-0.85, 0.72, 0.775, 0.09)],
               exh='none', tail='strip', mirror='round', two_tone=False, extras=['grab'],
               palette=['#eef0f0', '#c9cdd0', '#55595e', '#9fc4d2', '#7fb8ab', '#e3a79c', '#1e2023'], weight=0.1),
    'S4': dict(name='復古圓弧', wb=0.655, rf=0.228, rr=0.228, tw=0.1, fl=0.3, fx=0.3,
               rear=[(0.0, 0.29, 0.69, 0.16, 0.12), (-0.14, 0.29, 0.72, 0.18, 0.13), (-0.38, 0.33, 0.735, 0.2, 0.135), (-0.62, 0.44, 0.735, 0.2, 0.13), (-0.8, 0.52, 0.72, 0.17, 0.115), (-0.92, 0.57, 0.69, 0.12, 0.085), (-0.96, 0.6, 0.66, 0.06, 0.045)], rp=2.2, bulge=0.14,
               apron=[(0.28, 0.31, 0.21, 0.08, 0.03), (0.46, 0.34, 0.205, 0.12, 0.035), (0.63, 0.37, 0.19, 0.12, 0.04), (0.79, 0.4, 0.16, 0.1, 0.045), (0.92, 0.42, 0.11, 0.07, 0.045)], app=2.2,
               cover=[(0.33, 0.99, 0.08, 0.05), (0.4, 1.005, 0.15, 0.07), (0.48, 0.99, 0.15, 0.065), (0.55, 0.965, 0.08, 0.045)], lamp='round',
               seat=[(0.0, 0.69, 0.735, 0.12), (-0.1, 0.715, 0.775, 0.145), (-0.45, 0.73, 0.79, 0.15), (-0.72, 0.725, 0.795, 0.135), (-0.86, 0.71, 0.77, 0.09)],
               exh='normal', tail='round', mirror='chrome', two_tone=False, extras=['chrome_rack'], seat_col='seat_brown',
               palette=['#efe6cf', '#a9d3c4', '#a9c4dc', '#7b2a32', '#d8c8a8', '#1c1d1f', '#e6b8a8'], weight=0.07),
    'S7': dict(name='50cc 舊款（綠牌）', base='S1A', scale=0.93, rf=0.2, rr=0.2, tw=0.085, extras=['grab'], lamp='handle', worn=True,
               palette=['#c7c2b6', '#5d6f86', '#7d2a2a', '#dcd6c8', '#3e4a3c', '#9a9aa0'], weight=0.07),
    'S3': dict(name='大型速克達', wb=0.7, rf=0.255, rr=0.25, tw=0.12, fl=0.36, fx=0.36,
               rear=[(0.02, 0.33, 0.74, 0.17, 0.13), (-0.16, 0.33, 0.78, 0.19, 0.145), (-0.42, 0.38, 0.8, 0.2, 0.155), (-0.7, 0.52, 0.8, 0.19, 0.145), (-0.9, 0.6, 0.79, 0.16, 0.12), (-1.03, 0.65, 0.77, 0.11, 0.085), (-1.08, 0.69, 0.75, 0.05, 0.04)], rp=3.4,
               apron=[(0.34, 0.37, 0.23, 0.08, 0.035), (0.52, 0.42, 0.23, 0.13, 0.04), (0.7, 0.47, 0.21, 0.14, 0.045), (0.86, 0.51, 0.18, 0.12, 0.05), (1.0, 0.54, 0.13, 0.08, 0.05)], app=3.2,
               cover=[(0.4, 1.06, 0.08, 0.05), (0.47, 1.075, 0.16, 0.06), (0.55, 1.06, 0.15, 0.05), (0.62, 1.03, 0.08, 0.035)], lamp='apron',
               seat=[(0.0, 0.74, 0.79, 0.15), (-0.12, 0.765, 0.81, 0.17), (-0.45, 0.78, 0.82, 0.17), (-0.6, 0.8, 0.9, 0.16), (-0.78, 0.81, 0.89, 0.15), (-0.94, 0.79, 0.85, 0.1)],
               floor='tunnel', screen=True, exh='big', tail='wide', mirror='poly', two_tone=True, extras=['grab'],
               palette=['#141517', '#e9e9e7', '#4a4e54', '#1f2e48', '#6b6f73'], weight=0.04),
    'S6': dict(name='方塊越野風', wb=0.65, rf=0.232, rr=0.232, tw=0.13, fl=0.33, fx=0.31,
               rear=[(0.0, 0.31, 0.71, 0.16, 0.13), (-0.14, 0.31, 0.75, 0.175, 0.145), (-0.38, 0.36, 0.77, 0.18, 0.15), (-0.64, 0.5, 0.78, 0.17, 0.145), (-0.84, 0.58, 0.78, 0.15, 0.13), (-0.96, 0.63, 0.77, 0.11, 0.1), (-1.0, 0.66, 0.76, 0.07, 0.065)], rp=6.0, bulge=0.0,
               apron=[(0.3, 0.32, 0.2, 0.08, 0.03), (0.48, 0.355, 0.2, 0.12, 0.035), (0.66, 0.39, 0.19, 0.12, 0.04), (0.82, 0.42, 0.17, 0.1, 0.045), (0.95, 0.44, 0.14, 0.07, 0.045)], app=6.0,
               cover=[(0.36, 1.0, 0.07, 0.04), (0.42, 1.01, 0.12, 0.05), (0.5, 1.0, 0.11, 0.045), (0.56, 0.98, 0.06, 0.03)], lamp='stack',
               seat=[(0.0, 0.71, 0.76, 0.13), (-0.1, 0.74, 0.8, 0.15), (-0.45, 0.76, 0.82, 0.155), (-0.74, 0.77, 0.83, 0.14), (-0.88, 0.77, 0.815, 0.1)],
               exh='normal', tail='wide', mirror='round', two_tone=True, extras=['rack', 'grab'], bars=True, hi_fender=True,
               palette=['#1b1c1e', '#4f5a3c', '#b5a27a', '#e3c22b', '#e8e8e6'], weight=0.03),
    'S9': dict(name='彎樑', cub=True, palette=['#8f2626', '#1f2f4f', '#1c1d1f', '#2f4a36', '#d9d2c2'], weight=0.02),
    # 同一個車身的配件變化（街上看起來不同、也是生活痕跡）
    'S1B_D': dict(name='國民通勤＋外送箱', base='S1B', extras=['delivery', 'phone'], weight=0.07, palette=['#141517', '#6f7378', '#334a6b', '#f1f1ee']),
    'S5_H': dict(name='電動＋掛安全帽', base='S5', extras=['grab', 'helmet'], weight=0.05),
    'S1A_C': dict(name='國民通勤＋機車罩', base='S1A', extras=['cover'], weight=0.03, palette=['#8e949a', '#2d3a52', '#6d7176']),
}
for k, A in list(ARCH.items()):          # base：沿用另一型的車身、只改列出的欄位
    if 'base' in A:
        B0 = dict(ARCH[A['base']]); B0.update({kk: vv for kk, vv in A.items() if kk != 'base'}); ARCH[k] = B0


def build(code):
    A = ARCH[code]; P = {}
    if A.get('cub'): return build_cub(A)
    def part(col, smooth=False, target=None):
        k = col + ('_s' if smooth else '')
        if k not in P: P[k] = Part(col, smooth, target)
        return P[k]
    wl = []
    wb, rf, rr, tw, fl, fx = A['wb'], A['rf'], A['rr'], A['tw'], A['fl'], A['fx']
    wheel(wl, wb, rf, tw); wheel(wl, -wb, rr, tw * (1.12 if code == 'S2' else 1.0))
    paint = part('paint'); rear = interp(A['rear'], 1)
    # 後車身：圓角梯形斷面，下緣越往後越高（讓出後輪）
    if 'cover' in A['extras']: return wl + cover_shell(A, rear)
    loft(paint, [tsect(x, yb, yt, w0, w1, p=A['rp'], bulge=A.get('bulge', 0.07)) for (x, yb, yt, w0, w1) in rear])
    if A['two_tone']:   # 運動型：側板下半部黑色塑件（比車殼寬一點點，蓋在下緣）
        loft(part('black'), [tsect(x, yb - 0.005, yb + (yt - yb) * 0.38, w0 + 0.006, w0 * 0.96 + 0.004, p=A['rp']) for (x, yb, yt, w0, w1) in rear[1:-1]])
    # 座墊：坐的地方低、後座高一點；外緣一圈車線（深一點的顏色）
    seat = A['seat']; loft(part(A.get('seat_col', 'seat')), [tsect(x, yb, yt, hw, hw * 0.9, p=2.8, n=8, bulge=0.03) for (x, yb, yt, hw) in interp(seat, 1)])
    # 踏板：平的腳踏板＋橡膠紋（深灰）＋兩側的車殼裙邊
    part('dark').box(-0.02, fx, fl - 0.012, fl, -0.165, 0.165)
    if A.get('floor') == 'tunnel':   # 大型速克達：踏板中間的隧道（騎士要跨過去）
        loft(paint, [tsect(x, fl - 0.01, fl + 0.13, 0.085, 0.06, p=2.6, n=8, bulge=0.0) for x in (-0.03, fx * 0.5, fx + 0.02)])
    loft(paint, [tsect(x, fl - 0.11, fl - 0.008, 0.17, 0.172, p=4) for x in (-0.03, fx * 0.5, fx + 0.01)])
    # 前擋：前面鼓、後面平，往上往前傾
    apr = interp(A['apron'], 1)
    loft(paint, [shield(x, y, hw, df, db, p=A['app']) for (y, x, hw, df, db) in apr])
    loft(part('black'), [shield(x - 0.004, y, hw * 0.93, 0.01, db + 0.005, p=A['app'], n=6) for (y, x, hw, df, db) in apr[1:-1]])   # 膝蓋那面的黑色內板
    # 後車身的分模線：一圈很細的深色帶（側蓋和下半部的接縫），從座墊前緣下方到車尾
    lv = 0.42
    loft(part('black'), [tsect(x, yb + (yt - yb) * lv, yb + (yt - yb) * lv + 0.007, (w0 + (w1 - w0) * lv) * 1.075 + 0.003, (w0 + (w1 - w0) * lv) * 1.075 + 0.003, p=A['rp'] + 1, n=6, bulge=0.0) for (x, yb, yt, w0, w1) in rear[2:-2]])
    # 前土除：貼著前輪（間隙約 3 cm），從前輪後上方包到前方
    if A.get('hi_fender'):   # 越野風：高的前土除（裝在龍頭下面，離輪子很遠）＋黑色前叉護蓋
        arc_band(part('black'), wb - 0.02, rf, rf + 0.13, -40, 55, tw * 0.6 + 0.02, th=0.009)
    else: arc_band(paint, wb, rf, rf + 0.035, -35, 75, tw * 0.62 + 0.012, th=0.008)
    # 前叉：下半截露出來（從輪軸往上到前擋下緣），上半截在前擋裡
    top = (A['apron'][0][1] + 0.03, A['apron'][1][0] - 0.02)
    for z in (-0.055, 0.055):
        part('alloy').cyl((wb, rf, z), (wb + (top[0] - wb) * 0.55, rf + (top[1] - rf) * 0.55, z), 0.021, seg=6)
        part('metal').cyl((wb + (top[0] - wb) * 0.5, rf + (top[1] - rf) * 0.5, z), (top[0], top[1], z * 0.8), 0.016, seg=6)
    # 龍頭罩＋把手＋煞車拉桿＋儀表
    cov = A['cover']; loft(paint, [sect(x, cy, hw, hh, p=3.0) for (x, cy, hw, hh) in cov]); cy_c = cov[1][1]
    gr = part('dark')
    for s in (-1, 1):
        gr.cyl((0.4, cy_c + 0.005, s * 0.15), (0.385, cy_c + 0.015, s * 0.33), 0.017, seg=6)
        part('black').cyl((0.42, cy_c + 0.02, s * 0.2), (0.45, cy_c + 0.01, s * 0.31), 0.006, seg=3)
    part('smoke').box(cov[1][0] - 0.03, cov[1][0] + 0.03, cy_c + 0.035, cy_c + 0.06, -0.07, 0.07)
    # 後照鏡
    mr = part('chrome' if A['mirror'] == 'chrome' else 'dark')
    for s in (-1, 1):
        if A['mirror'] == 'poly':
            mr.cyl((0.4, cy_c + 0.03, s * 0.22), (0.39, cy_c + 0.11, s * 0.26), 0.008, seg=4)
            mr.quad([(0.38, cy_c + 0.1, s * 0.21), (0.395, cy_c + 0.1, s * 0.33), (0.395, cy_c + 0.15, s * 0.32), (0.38, cy_c + 0.155, s * 0.24)][::s])
        else:
            mr.cyl((0.4, cy_c + 0.03, s * 0.22), (0.37, cy_c + 0.2, s * 0.27), 0.008, seg=4); mr.box(0.362, 0.378, cy_c + 0.185, cy_c + 0.255, s * 0.285 - 0.05, s * 0.285 + 0.05)
    # 頭燈、方向燈
    lp = part('lamp'); ap = A['apron']
    if A['lamp'] == 'handle':
        lp.rbox(cov[2][0] + 0.02, cov[2][0] + 0.06, cy_c - 0.045, cy_c + 0.005, -0.095, 0.095, r=0.012, seg=1)
    elif A['lamp'] == 'apron':
        x, y = ap[2][1] + ap[2][3] - 0.012, ap[2][0] + 0.02
        for s in (-1, 1): lp.rbox(x, x + 0.02, y, y + 0.05, s * 0.04, s * 0.12, r=0.01, seg=1)
    elif A['lamp'] == 'vled':
        for s in (-1, 1): lp.quad([(ap[1][1] + 0.098, ap[1][0] + 0.03, s * 0.02), (ap[2][1] + 0.096, ap[2][0] + 0.07, s * 0.125), (ap[2][1] + 0.096, ap[2][0] + 0.105, s * 0.115), (ap[1][1] + 0.098, ap[1][0] + 0.07, s * 0.018)][::s])
        lp.rbox(cov[2][0] + 0.01, cov[2][0] + 0.05, cy_c - 0.03, cy_c - 0.005, -0.06, 0.06, r=0.008, seg=1)
    elif A['lamp'] == 'round':    # 復古：龍頭罩前面的圓頭燈（鍍鉻燈圈）
        part('chrome').cyl((cov[2][0] + 0.03, cy_c - 0.01, 0), (cov[2][0] + 0.065, cy_c - 0.01, 0), 0.072, seg=14); lp.cyl((cov[2][0] + 0.064, cy_c - 0.01, 0), (cov[2][0] + 0.068, cy_c - 0.01, 0), 0.06, seg=14)
    elif A['lamp'] == 'stack':    # 越野風：前擋上下疊的兩顆方燈
        x = ap[2][1] + ap[2][3] - 0.012
        for y in (ap[2][0] - 0.02, ap[2][0] + 0.07): lp.box(x, x + 0.025, y, y + 0.055, -0.085, 0.085)
    elif A['lamp'] == 'strip':
        lp.rbox(ap[1][1] + ap[1][3] - 0.006, ap[1][1] + ap[1][3] + 0.01, ap[1][0] - 0.06, ap[3][0], -0.013, 0.013, r=0.005, seg=1)
        lp.rbox(cov[2][0] + 0.02, cov[2][0] + 0.045, cy_c - 0.025, cy_c - 0.005, -0.08, 0.08, r=0.008, seg=1)
    am = part('amber')
    for s in (-1, 1):
        am.box(ap[1][1] + ap[1][3] * 0.6, ap[1][1] + ap[1][3], ap[1][0] + 0.12, ap[1][0] + 0.16, s * 0.15 - 0.025, s * 0.15 + 0.025)
    tx, tyb, tyt = rear[-2][0], rear[-2][1], rear[-2][2]
    tl = part('tail')
    if A['tail'] == 'wide':
        tl.box(tx - 0.045, tx - 0.01, tyt - 0.09, tyt - 0.03, -0.085, 0.085)
        for s in (-1, 1): am.box(tx - 0.04, tx - 0.01, tyt - 0.12, tyt - 0.095, s * 0.085 - 0.022, s * 0.085 + 0.022)
    elif A['tail'] == 'sharp':
        for s in (-1, 1): tl.quad([(tx - 0.04, tyb + 0.02, s * 0.005), (tx + 0.08, tyb + 0.0, s * 0.1), (tx + 0.08, tyb + 0.035, s * 0.11), (tx - 0.04, tyb + 0.055, s * 0.01)][::s])
    elif A['tail'] == 'round':
        tl.cyl((tx - 0.03, tyt - 0.07, 0), (tx - 0.005, tyt - 0.07, 0), 0.045, seg=12)
    elif A['tail'] == 'strip':
        tl.rbox(tx - 0.035, tx - 0.01, tyt - 0.06, tyt - 0.035, -0.095, 0.095, r=0.006, seg=1)
    # 後土除（包著後輪的後上方）＋車牌架
    arc_band(part('dark'), -wb, rr, rr + 0.03, -95, -10, tw * 0.6 + 0.01, th=0.007, n=6)
    pl = part('plate'); px = -wb - rr * 0.95; pl.box(px - 0.012, px, 0.36, 0.47, -0.1, 0.1)
    part('dark').box(px, px + 0.06, 0.38, 0.4, -0.03, 0.03)
    # 傳動箱（左邊、鋁色、圓角長殼）或電動的輪轂馬達
    if A['exh'] != 'none':
        loft(part('cvt'), [sect(x, cy, hw, hh, p=2.6, n=8, dz=0.115) for (x, cy, hw, hh) in [(-wb - 0.05, rr, 0.025, 0.05), (-wb + 0.03, rr + 0.01, 0.035, 0.08), (-0.32, 0.27, 0.04, 0.085), (-0.12, 0.27, 0.035, 0.075), (-0.06, 0.26, 0.022, 0.05)]])
    else:
        part('dark').cyl((-wb, rr, 0.0), (-wb, rr, 0.075), rr * 0.48, seg=12); part('dark').cyl((-wb, rr, 0.085), (-0.12, 0.28, 0.095), 0.024, seg=5)
        part('dark').rbox(-0.3, -0.05, 0.2, 0.3, -0.12, 0.12, r=0.02, seg=1)   # 踏板下的電池艙底殼
    part('dark').box(-0.42, -0.02, 0.18, 0.3, -0.1, 0.08)
    # 排氣管：從引擎下方往後接到右側的消音器（短胖罐＋隔熱片），不是一根長管
    if A['exh'] != 'none':
        big = A['exh'] == 'big'; mx0, mx1, my, mz, mr_ = -0.46, -wb - (0.2 if big else 0.12), 0.33 if big else 0.31, -0.15, 0.062 if big else 0.052
        part('dark').cyl((-0.06, 0.13, -0.04), (mx0 + 0.02, my - 0.04, mz + 0.02), 0.022, seg=5)
        part('alloy' if big else 'black').cyl((mx0, my, mz), (mx1, my + (0.07 if big else 0.04), mz - 0.005), mr_, seg=10, r2=mr_ * (1.12 if big else 0.92))
        part('chrome' if not big else 'black').quad([(mx0 + 0.05, my + 0.07, mz - mr_ - 0.008), (mx1 + 0.08, my + 0.1, mz - mr_ - 0.012), (mx1 + 0.08, my + 0.0, mz - mr_ - 0.015), (mx0 + 0.05, my - 0.035, mz - mr_ - 0.01)])
    # 中柱
    cs = part('metal')
    for z in (-0.11, 0.11): cs.cyl((-0.12, 0.19, z), (-0.17, 0.0, z * 1.1), 0.014, seg=4)
    cs.cyl((-0.17, 0.012, -0.12), (-0.17, 0.012, 0.12), 0.014, seg=4)
    # 擋風鏡（大型速克達）、外露的把手橫桿（越野風）
    if A.get('screen'):
        sm = part('smoke'); x0, y0 = cov[2][0] + 0.02, cy_c - 0.02
        for q in ([(x0, y0, -0.17), (x0, y0, 0.17), (x0 - 0.08, y0 + 0.33, 0.13), (x0 - 0.08, y0 + 0.33, -0.13)], [(x0, y0, 0.17), (x0, y0, -0.17), (x0 - 0.08, y0 + 0.33, -0.13), (x0 - 0.08, y0 + 0.33, 0.13)]): sm.quad(q)
    if A.get('bars'):
        bb = part('black'); bb.cyl((0.41, cy_c + 0.06, -0.3), (0.41, cy_c + 0.06, 0.3), 0.012, seg=5); bb.cyl((0.41, cy_c + 0.1, -0.12), (0.41, cy_c + 0.1, 0.12), 0.01, seg=5)
        for z in (-0.12, 0.12): bb.cyl((0.41, cy_c + 0.06, z), (0.41, cy_c + 0.1, z), 0.01, seg=4)
    # 配件
    ex = A['extras']; sx_end = seat[-1][0]; sy = seat[-1][2]
    if 'grab' in ex:      # 後扶手（座墊後半兩側往後包到車尾）
        g = part('black' if code != 'S1A' else 'alloy')
        for s in (-1, 1): g.cyl((seat[2][0] - 0.1, sy - 0.02, s * 0.155), (sx_end - 0.02, sy - 0.01, s * 0.12), 0.012, seg=5)
        g.cyl((sx_end - 0.02, sy - 0.01, -0.12), (sx_end - 0.02, sy - 0.01, 0.12), 0.012, seg=5)
    if 'rear_box' in ex:  # 後箱（約 32 L，倒角、上蓋分模線）＋支架
        bx0 = sx_end - 0.06; part('box').rbox(bx0 - 0.36, bx0, sy + 0.03, sy + 0.33, -0.19, 0.19, r=0.05, seg=1)
        part('black').box(bx0 - 0.362, bx0 + 0.002, sy + 0.2, sy + 0.212, -0.192, 0.192); part('tail').box(bx0 - 0.37, bx0 - 0.36, sy + 0.12, sy + 0.16, -0.1, 0.1)
        part('metal').box(bx0 - 0.3, bx0 - 0.04, sy - 0.005, sy + 0.03, -0.11, 0.11)
    if 'hook_bag' in ex:  # 前掛勾掛的塑膠袋（便當、飲料）
        part('helmet_w').ell((ap[2][1] - 0.07, ap[2][0] - 0.12, 0.0), 0.06, 0.085, 0.085, seg=8, rings=5)
    if 'chrome_rack' in ex or 'rack' in ex:   # 後架（復古：鍍鉻；越野：黑色）
        rk = part('chrome' if 'chrome_rack' in ex else 'black'); x0, x1, y = seat[3][0], sx_end - 0.06, sy + 0.02
        for z in (-0.12, 0.12): rk.cyl((x0, y - 0.02, z * 1.2), (x0 - 0.04, y, z), 0.01, seg=4); rk.cyl((x0 - 0.04, y, z), (x1, y, z), 0.01, seg=4)
        for x in (x0 - 0.04, (x0 + x1) / 2 - 0.02, x1): rk.cyl((x, y, -0.12), (x, y, 0.12), 0.009, seg=4)
    if 'delivery' in ex:  # 外送箱（方形保溫箱、素色、沒有平台的標誌）＋後架
        x1 = sx_end - 0.02; part('metal').box(x1 - 0.32, x1, sy + 0.0, sy + 0.025, -0.15, 0.15)
        part('deliv').rbox(x1 - 0.42, x1 + 0.02, sy + 0.025, sy + 0.45, -0.22, 0.22, r=0.03, seg=1)
        part('black').box(x1 - 0.425, x1 + 0.025, sy + 0.33, sy + 0.345, -0.222, 0.222)
    if 'helmet' in ex:    # 掛在左後照鏡下的半罩安全帽
        hx, hy, hz = 0.37, cy_c - 0.08, 0.26; part('helmet_b').ell((hx, hy, hz), 0.12, 0.09, 0.105, seg=10, rings=5)
        part('visor').box(hx + 0.07, hx + 0.1, hy - 0.02, hy + 0.04, hz - 0.08, hz + 0.08)
    if 'phone' in ex:     # 手機架
        part('black').rbox(cov[1][0] - 0.01, cov[1][0] + 0.01, cy_c + 0.08, cy_c + 0.2, -0.04, 0.04, r=0.005, seg=1)
    out = wl + list(P.values())
    if A.get('scale'):   # 50cc：整台小一號
        k = A['scale']
        for prt in out:
            for v in prt.bm.verts: v.co *= k
    if A.get('worn'):   # 舊車：座墊破了用膠帶補
        pass
    return out


def cover_shell(A, rear):
    """整台蓋上機車罩（銀色、藍色的布罩，下緣露出輪子）：一層包住車身輪廓的殼"""
    c = Part('cloth'); wb = A['wb']
    rows = [(wb + 0.18, 0.32, 0.62, 0.1, 0.06), (wb + 0.05, 0.27, 0.88, 0.17, 0.12), (0.42, 0.27, 1.12, 0.3, 0.2), (0.3, 0.26, 0.98, 0.25, 0.2),
            (0.05, 0.26, 0.86, 0.22, 0.19), (-0.3, 0.27, 0.86, 0.23, 0.19), (-0.65, 0.3, 0.85, 0.22, 0.18), (-0.9, 0.33, 0.8, 0.18, 0.14), (-1.0, 0.36, 0.74, 0.1, 0.08)]
    loft(c, [tsect(x, yb, yt, w0, w1, p=2.4, n=10, bulge=0.05) for (x, yb, yt, w0, w1) in interp(rows, 1)])
    return [c]


def build_cub(A):
    """彎樑（Cub 型）：鋼絲輪、彎樑車架、腿部護板、圓頭燈在龍頭、腳踏桿、後貨架、低置的鍍鉻排氣管"""
    out = []; P = {}
    def part(col):
        if col not in P: P[col] = Part(col)
        return P[col]
    wb, r = 0.62, 0.29
    wheel(out, wb, r, 0.075, rim='spoke'); wheel(out, -wb, r, 0.08, rim='spoke')
    paint = part('paint')
    # 彎樑車架：從龍頭往下彎到引擎上方、再往後上到座墊下（粗的管狀車殼）
    path = [(0.47, 0.88, 0.07), (0.38, 0.7, 0.075), (0.25, 0.5, 0.08), (0.08, 0.42, 0.08), (-0.12, 0.45, 0.085), (-0.3, 0.55, 0.11), (-0.5, 0.62, 0.12), (-0.7, 0.66, 0.1), (-0.85, 0.68, 0.06)]
    loft(paint, [tsect(x, y - rr_ * 0.9, y + rr_ * 0.9, rr_, rr_ * 0.9, p=2.4, n=8, bulge=0.0) for (x, y, rr_) in interp(path, 1)])
    # 腿部護板（白色塑膠，在腳前面）
    loft(part('helmet_w'), [shield(x, y, hw, 0.03, 0.015, p=2.4, n=8) for (y, x, hw) in [(0.36, 0.3, 0.16), (0.5, 0.33, 0.2), (0.66, 0.37, 0.19), (0.8, 0.41, 0.12)]])
    # 前土除、前叉（伸縮、鍍鉻）、龍頭罩、圓頭燈
    arc_band(paint, wb, r, r + 0.03, -30, 80, 0.06, th=0.007)
    for z in (-0.06, 0.06): part('chrome').cyl((wb, r, z), (0.47, 0.86, z * 0.8), 0.018, seg=6)
    loft(paint, [sect(x, cy, hw, hh, p=2.6) for (x, cy, hw, hh) in [(0.42, 0.95, 0.06, 0.04), (0.48, 0.97, 0.13, 0.055), (0.55, 0.96, 0.12, 0.05), (0.6, 0.94, 0.06, 0.035)]])
    part('chrome').cyl((0.59, 0.93, 0), (0.62, 0.93, 0), 0.075, seg=14); part('lamp').cyl((0.62, 0.93, 0), (0.625, 0.93, 0), 0.062, seg=14)
    for s in (-1, 1):
        part('dark').cyl((0.5, 0.98, s * 0.12), (0.47, 0.99, s * 0.33), 0.016, seg=6)
        part('chrome').cyl((0.49, 0.99, s * 0.2), (0.45, 1.16, s * 0.26), 0.007, seg=4); part('chrome').cyl((0.445, 1.17, s * 0.265), (0.455, 1.17, s * 0.265), 0.04, seg=10)
    # 引擎（水平汽缸）、鍍鉻排氣管（低置右側）、腳踏桿
    part('cvt').rbox(-0.18, 0.18, 0.18, 0.4, -0.1, 0.12, r=0.04, seg=1); part('metal').cyl((0.05, 0.3, -0.02), (0.26, 0.33, -0.02), 0.06, seg=8)
    part('chrome').cyl((0.22, 0.24, -0.08), (-0.1, 0.18, -0.14), 0.022, seg=6); part('chrome').cyl((-0.1, 0.18, -0.14), (-0.75, 0.26, -0.15), 0.04, seg=8, r2=0.035)
    part('metal').cyl((-0.02, 0.2, -0.24), (-0.02, 0.2, 0.24), 0.012, seg=4)
    # 座墊（長、平）、側蓋、後土除、後貨架、尾燈、車牌
    loft(part('seat'), [tsect(x, yb, yt, hw, hw * 0.9, p=2.8, n=8, bulge=0.03) for (x, yb, yt, hw) in [(-0.05, 0.74, 0.78, 0.1), (-0.15, 0.75, 0.8, 0.13), (-0.45, 0.76, 0.81, 0.135), (-0.66, 0.75, 0.8, 0.11)]])
    part('paint').rbox(-0.45, -0.15, 0.48, 0.7, -0.12, 0.12, r=0.03, seg=1)
    arc_band(paint, -wb, r, r + 0.035, -110, 5, 0.065, th=0.007)
    rk = part('black'); y = 0.79
    for z in (-0.13, 0.13): rk.cyl((-0.66, y, z), (-1.02, y, z), 0.011, seg=4)
    for x in (-0.7, -0.84, -0.98): rk.cyl((x, y, -0.13), (x, y, 0.13), 0.01, seg=4)
    for z in (-0.13, 0.13): rk.cyl((-0.98, y, z), (-0.9, 0.55, z * 0.9), 0.011, seg=4)
    part('tail').box(-0.99, -0.96, 0.62, 0.68, -0.05, 0.05); part('plate').box(-1.0, -0.985, 0.48, 0.58, -0.09, 0.09)
    return out + list(P.values())


meta = {}
codes = ONLY or list(ARCH)
if '--preview' in ARGS:
    PICK = {'S1A': 5, 'S1B': 4, 'S2': 2, 'S5': 3, 'S4': 1, 'S7': 1, 'S3': 0, 'S6': 1, 'S9': 0, 'S1B_D': 0, 'S5_H': 4, 'S1A_C': 1}
    for c in codes: PREVIEW_COL[f'scooter_{c}'] = ARCH[c]['palette'][PICK.get(c, 0)]
for i, code in enumerate(codes):
    parts = build(code); ob = finish_all(parts, f'scooter_{code}', i * 1.2)
    A = ARCH[code]; ob['archetype'] = code; ob['weight'] = A['weight']; ob['palette'] = json.dumps(A['palette']); ob['label'] = A['name']
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); meta[code] = dict(name=A['name'], tris=tris, weight=A['weight'], palette=A['palette'])
    print('scooter', code, A['name'], 'tris', tris)
# 舊名稱（遊戲還沒套新接法時用）：scooter_a＝S1 新款、scooter_b＝S4 復古（S4 還沒做時暫時用 S1 舊款）
alias = {'a': 'S1B', 'b': 'S4' if 'S4' in ARCH else 'S1A'}
for k, code in alias.items():
    src = bpy.data.objects.get(f'scooter_{code}')
    if src is None: continue
    dup = src.copy(); dup.data = src.data; dup.name = f'scooter_{k}'; bpy.context.scene.collection.objects.link(dup); dup.parent = root; dup.location = (0.0, 3.0 + len(codes) * 1.2, 0.0)
info = L.export(OUT, gpu_instances=False)
info['variants'] = meta; info['alias'] = alias
L.write_json(OUT[:-4] + '.json', info)
print('avg tris', round(sum(v['tris'] for v in meta.values()) / max(len(meta), 1)))
