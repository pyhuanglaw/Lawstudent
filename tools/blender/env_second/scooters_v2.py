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
COL = {'legs': ('#4b4e52', 0), 'cloth': ('#9aa0a6', 0), 'seat_brown': ('#5a3a28', 0), 'cvt': ('#46494e', 1), 'dark': ('#2a2b2d', 0), 'black': ('#17181a', 0), 'seat': ('#1d1c1c', 0), 'tire': ('#191919', 0), 'lamp': ('#d3dbe2', 0), 'lamp_warm': ('#f2e6c8', 0),
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


def loft(m, rings, cap=True, cap0=None, cap1=None):
    bm = m.bm; vr = [[bm.verts.new(g2b(*p)) for p in r] for r in rings]; n = len(rings[0])
    for a, b in zip(vr, vr[1:]):
        for i in range(n):
            j = (i + 1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    if (cap if cap0 is None else cap0): bm.faces.new(vr[0])
    if (cap if cap1 is None else cap1): bm.faces.new(list(reversed(vr[-1])))
    return m


def loft_split(rings, pick, cap=True):
    """同一個斷面圈、不同的段給不同零件（例：前車身外面車殼色、膝蓋那面黑色塑件）；pick(i)＝第 i 段（點 i→i+1）用哪個零件"""
    n = len(rings[0])
    for a, b in zip(rings, rings[1:]):
        for i in range(n):
            j = (i + 1) % n; pick(i).quad([a[i], a[j], b[j], b[i]])
    if cap: pick(0).quad(rings[0]); pick(0).quad(list(reversed(rings[-1])))


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


def smin(a, b, k):
    """平滑的 min（兩條曲線用半徑約 k 的圓角接起來）"""
    h = max(0.0, min(1.0, 0.5 + 0.5 * (b - a) / k)); return b + (a - b) * h - k * h * (1 - h)


FF = 0.4   # 前車身斷面最寬處在前後深度的哪裡（從後面量）


def front_rows(A):
    """前車身（前擋＋腳踏內板一整塊）的水平斷面列 [(y, 前緣 x, 後緣 x, 半寬)]，由下往上。
    前緣：從頂點 top 往下、沿傾角 lean 往前（真的機車前擋和前叉一樣是「上面往後」），中段往外鼓 bulge，下面讓開前輪（離輪胎 4.5 cm，平滑接）；
    後緣（膝蓋那面）：踏板前端 fx 用半徑 fillet 的圓弧接到踏板（不是直角），往上到頂部時前後深度剩 dtop"""
    F = A['front']; wb, rf, fl, fx = A['wb'], A['rf'], A['fl'], A['fx']
    xt, yt = F['top']; tl = math.tan(math.radians(F['lean'])); rfl = F.get('fillet', 0.06); xbt = xt - F.get('dtop', 0.12)
    hb, hm, ht = F['hw']; rc = rf + 0.045
    ys = [fl - 0.1, fl - 0.03, fl + rfl * 0.3, fl + rfl * 0.7, fl + rfl] + [fl + rfl + (yt - fl - rfl) * k / 5 for k in range(1, 6)]
    rows = []
    for y in ys:
        q = max(0.0, min(1.0, (y - fl) / (yt - fl)))
        xl = xt + (yt - y) * tl + F.get('bulge', 0.02) * math.sin(math.pi * q)
        dy = y - rf; xw = wb - math.sqrt(rc * rc - dy * dy) if abs(dy) < rc else 9.0
        xf = smin(xl, xw, 0.04)
        if y <= fl: xb = fx - rfl
        elif y <= fl + rfl: xb = fx - rfl + math.sqrt(max(0.0, rfl * rfl - (fl + rfl - y) ** 2))
        else: xb = fx + (y - fl - rfl) / (yt - fl - rfl) * (xbt - fx)
        hw = hb + (hm - hb) * q / 0.35 if q < 0.35 else hm + (ht - hm) * ((q - 0.35) / 0.65) ** 1.6
        rows.append((y, xf, min(xb, xf - 0.04), hw))
    return rows


def fsec(row, p, pb, n=12):
    """前車身的斷面：前面（車殼）方度 p、後面（膝蓋那面）方度 pb（大＝平）"""
    y, xf, xb, hw = row; xc = xb + (xf - xb) * FF; out = []
    for i in range(n):
        t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t)
        x = xc + (xf - xc) * abs(s) ** (2 / p) if s >= 0 else xc - (xc - xb) * abs(s) ** (2 / pb)
        out.append((x, y, hw * math.copysign(abs(c) ** (2 / p), c)))
    return out


def row_at(rows, u):
    i = max(0, min(len(rows) - 2, int(math.floor(u)))); f = u - i
    return tuple(a + (b - a) * f for a, b in zip(rows[i], rows[i + 1]))


def u_at(rows, y):
    """高度 y 在前車身斷面列的第幾列（小數）"""
    for i in range(len(rows) - 1):
        if rows[i][0] <= y <= rows[i + 1][0]: return i + (y - rows[i][0]) / (rows[i + 1][0] - rows[i][0])
    return 0.0 if y < rows[0][0] else len(rows) - 1.0


def front_F(rows, p, pb):
    """前車身的參數曲面：(u＝第幾列, t＝斷面角度) → (點, 斷面中心)"""
    def F(u, t):
        y, xf, xb, hw = row_at(rows, u); xc = xb + (xf - xb) * FF; c, s = math.cos(t), math.sin(t)
        x = xc + (xf - xc) * abs(s) ** (2 / p) if s >= 0 else xc - (xc - xb) * abs(s) ** (2 / pb)
        return (x, y, hw * math.copysign(abs(c) ** (2 / p), c)), (xc, y, 0.0)
    return F


def rear_F(rows, p, bulge):
    """後車身（tsect）的參數曲面"""
    def F(u, t):
        x, yb, yt, w0, w1 = row_at(rows, u); cy, hh = (yb + yt) / 2, (yt - yb) / 2; c, s = math.cos(t), math.sin(t)
        v = math.copysign(abs(s) ** (2 / p), s); uu = math.copysign(abs(c) ** (2 / p), c)
        w = (w0 + (w1 - w0) * (v + 1) / 2) * (1 + bulge * (1 - ((v + 0.25) / 1.25) ** 2))
        return (x, cy + hh * v, uu * w), (x, cy, 0.0)
    return F


def patch(part, F, u0, u1, t0, t1, nu=2, nt=2, off=0.003):
    """在車殼曲面上取一塊（u0～u1、t0～t1；t 可以是 u 的函式），沿法線往外推 off：燈和方向燈貼著車殼的曲面，不是貼在表面的小方塊"""
    tv = lambda f, u: f(u) if callable(f) else f
    G = []
    for i in range(nu + 1):
        u = u0 + (u1 - u0) * i / nu; row = []
        for j in range(nt + 1):
            t = tv(t0, u) + (tv(t1, u) - tv(t0, u)) * j / nt
            p, c = F(u, t); pu = F(u + 1e-3, t)[0]; pt = F(u, t + 1e-3)[0]
            du = [a - b for a, b in zip(pu, p)]; dt = [a - b for a, b in zip(pt, p)]
            n = [du[1] * dt[2] - du[2] * dt[1], du[2] * dt[0] - du[0] * dt[2], du[0] * dt[1] - du[1] * dt[0]]
            ln = math.sqrt(sum(a * a for a in n)) or 1.0; n = [a / ln for a in n]
            if sum(a * (b - cc) for a, b, cc in zip(n, p, c)) < 0: n = [-a for a in n]
            row.append(tuple(a + off * b for a, b in zip(p, n)))
        G.append(row)
    for i in range(nu):
        for j in range(nt): part.quad([G[i][j], G[i][j + 1], G[i + 1][j + 1], G[i + 1][j]])


def mirror_head(m, c, style):
    """後照鏡的鏡子：扁的橢圓殼（鏡面朝後），不是方板；poly＝運動型的多角形"""
    seg = 6 if style == 'poly' else 10; ry, rz = {'poly': (0.032, 0.066), 'chrome': (0.045, 0.045)}.get(style, (0.038, 0.058))
    bm = L.lathe([(0.0, -0.012), (1.0, 0.0), (0.0, 0.01)], seg=seg)
    m.add_bm(bm, Matrix.Translation(g2b(*c)) @ Matrix.Rotation(-math.pi / 2, 4, 'Y') @ Matrix.Diagonal((ry, rz, 1.0, 1.0))); bm.free()


# ---------------- 車型參數 ----------------
# 長度單位公尺。wb 半軸距、rf／rr 輪外半徑、tw 胎寬、fl 踏板高、fx 踏板前緣
# rear：後車身斷面 [(x, 底, 頂, 下半寬, 上半寬)]；rp 方度
# front：前車身（front_rows）top＝前擋頂點 (x, y)、lean 傾角（度，上面往後）、bulge 中段外鼓、hw＝(下, 中, 上) 半寬、dtop 頂部深度、fillet 腳踏內板接踏板的圓弧、p 前面方度、pb 後面方度、back 膝蓋那面的顏色
# cov：龍頭罩 L 長、hw 半寬、hh 半高、p 方度、dx 前後位移；lamp：handle／round（龍頭罩）、apron／vled／strip／stack（前擋）
# seat：[(x, 底, 頂, 半寬)]；exh：normal／big／none；tail：wide／sharp／strip
ARCH = {
    'S1A': dict(name='國民通勤 125（舊款：頭燈在龍頭）', wb=0.61, rf=0.212, rr=0.212, tw=0.09, fl=0.30, fx=0.3,
                rear=[(0.0, 0.29, 0.70, 0.165, 0.13), (-0.14, 0.29, 0.73, 0.175, 0.14), (-0.36, 0.34, 0.745, 0.18, 0.15), (-0.6, 0.47, 0.745, 0.17, 0.145), (-0.8, 0.54, 0.735, 0.15, 0.13), (-0.92, 0.585, 0.71, 0.11, 0.095), (-0.96, 0.62, 0.68, 0.06, 0.05)], rp=3.8,
                front=dict(top=(0.42, 0.93), lean=22, bulge=0.025, hw=(0.17, 0.205, 0.13), dtop=0.12, fillet=0.06, p=2.8, pb=6, back='paint'),
                cov=dict(L=0.25, hw=0.17, hh=0.06, p=3.0, dx=0.03), lamp='handle',
                seat=[(0.0, 0.70, 0.745, 0.13), (-0.1, 0.725, 0.785, 0.15), (-0.45, 0.74, 0.8, 0.155), (-0.72, 0.735, 0.81, 0.14), (-0.86, 0.72, 0.785, 0.1)],
                exh='normal', tail='wide', mirror='round', two_tone=False, extras=['rear_box', 'grab'],
                palette=['#e9e9e6', '#e9e9e6', '#b8bcc0', '#b8bcc0', '#d9cdb6', '#8c9095', '#1d1f22', '#22344f', '#8f1f24'], weight=0.22),
    'S1B': dict(name='國民通勤 125（新款：頭燈在前擋）', wb=0.62, rf=0.22, rr=0.212, tw=0.095, fl=0.31, fx=0.3,
                rear=[(0.0, 0.3, 0.71, 0.17, 0.13), (-0.14, 0.3, 0.74, 0.18, 0.14), (-0.36, 0.35, 0.755, 0.185, 0.15), (-0.6, 0.48, 0.755, 0.175, 0.145), (-0.8, 0.55, 0.745, 0.155, 0.13), (-0.93, 0.6, 0.72, 0.115, 0.095), (-0.975, 0.63, 0.69, 0.065, 0.05)], rp=4.0,
                front=dict(top=(0.43, 0.94), lean=24, bulge=0.02, hw=(0.17, 0.21, 0.14), dtop=0.12, fillet=0.06, p=3.2, pb=6, back='legs'),
                cov=dict(L=0.22, hw=0.16, hh=0.05, p=3.4, dx=0.02), lamp='apron',
                seat=[(0.0, 0.71, 0.755, 0.13), (-0.1, 0.735, 0.795, 0.15), (-0.45, 0.75, 0.81, 0.155), (-0.74, 0.745, 0.82, 0.14), (-0.88, 0.73, 0.795, 0.1)],
                exh='normal', tail='wide', mirror='round', two_tone=False, extras=['hook_bag', 'grab'],
                palette=['#f1f1ee', '#f1f1ee', '#f1f1ee', '#a9adb2', '#a9adb2', '#c9c1b3', '#6f7378', '#141517', '#334a6b', '#5d6a5a'], weight=0.24),
    'S2': dict(name='運動型 125～158', wb=0.67, rf=0.232, rr=0.232, tw=0.115, fl=0.32, fx=0.31,
               rear=[(0.0, 0.31, 0.72, 0.16, 0.12), (-0.16, 0.31, 0.75, 0.175, 0.13), (-0.4, 0.37, 0.77, 0.18, 0.14), (-0.66, 0.52, 0.79, 0.16, 0.125), (-0.86, 0.62, 0.82, 0.12, 0.095), (-0.98, 0.7, 0.85, 0.07, 0.055), (-1.03, 0.75, 0.86, 0.03, 0.025)], rp=4.6,
               front=dict(top=(0.47, 0.98), lean=27, bulge=0.0, hw=(0.16, 0.2, 0.11), dtop=0.11, fillet=0.05, p=4.4, pb=8),
               cov=dict(L=0.27, hw=0.15, hh=0.05, p=4.4, dx=0.05), lamp='vled',
               seat=[(0.0, 0.72, 0.765, 0.12), (-0.12, 0.745, 0.805, 0.145), (-0.5, 0.765, 0.825, 0.15), (-0.74, 0.79, 0.86, 0.125), (-0.92, 0.82, 0.875, 0.07)],
               exh='big', tail='sharp', mirror='poly', two_tone=True, extras=['phone', 'grab'],
               palette=['#e8e8e6', '#e8e8e6', '#9ea3a8', '#3b3f44', '#1b1c1e', '#20427a', '#7a1c22', '#2f5a3c'], weight=0.2),
    'S5': dict(name='電動換電型', wb=0.63, rf=0.222, rr=0.222, tw=0.095, fl=0.29, fx=0.29,
               rear=[(0.0, 0.28, 0.7, 0.15, 0.12), (-0.14, 0.28, 0.73, 0.16, 0.13), (-0.36, 0.33, 0.745, 0.165, 0.135), (-0.6, 0.45, 0.745, 0.155, 0.13), (-0.8, 0.52, 0.735, 0.135, 0.115), (-0.92, 0.57, 0.715, 0.1, 0.085), (-0.955, 0.6, 0.69, 0.05, 0.04)], rp=3.8,
               front=dict(top=(0.40, 0.92), lean=17, bulge=0.04, hw=(0.16, 0.185, 0.13), dtop=0.10, fillet=0.08, p=3.6, pb=5, back='paint'),
               cov=dict(L=0.2, hw=0.14, hh=0.04, p=3.6, dx=0.01), lamp='strip',
               seat=[(0.0, 0.70, 0.74, 0.12), (-0.1, 0.725, 0.78, 0.14), (-0.45, 0.74, 0.795, 0.145), (-0.72, 0.735, 0.8, 0.13), (-0.85, 0.72, 0.775, 0.09)],
               exh='none', tail='strip', mirror='round', two_tone=False, extras=['grab'],
               palette=['#eef0f0', '#eef0f0', '#c9cdd0', '#9fc4d2', '#7fb8ab', '#e3a79c', '#55595e', '#1e2023'], weight=0.1),
    'S4': dict(name='復古圓弧', wb=0.655, rf=0.228, rr=0.228, tw=0.1, fl=0.3, fx=0.3,
               rear=[(0.0, 0.29, 0.69, 0.16, 0.12), (-0.14, 0.29, 0.72, 0.18, 0.13), (-0.38, 0.33, 0.735, 0.2, 0.135), (-0.62, 0.44, 0.735, 0.2, 0.13), (-0.8, 0.52, 0.72, 0.17, 0.115), (-0.92, 0.57, 0.69, 0.12, 0.085), (-0.96, 0.6, 0.66, 0.06, 0.045)], rp=2.2, bulge=0.14,
               front=dict(top=(0.42, 0.92), lean=15, bulge=0.05, hw=(0.18, 0.215, 0.12), dtop=0.13, fillet=0.08, p=2.2, pb=4, back='paint'),
               cov=dict(L=0.24, hw=0.15, hh=0.07, p=2.2, dx=0.02), lamp='round',
               seat=[(0.0, 0.69, 0.735, 0.12), (-0.1, 0.715, 0.775, 0.145), (-0.45, 0.73, 0.79, 0.15), (-0.72, 0.725, 0.795, 0.135), (-0.86, 0.71, 0.77, 0.09)],
               exh='normal', tail='round', mirror='chrome', two_tone=False, extras=['chrome_rack'], seat_col='seat_brown',
               palette=['#efe6cf', '#efe6cf', '#a9d3c4', '#a9c4dc', '#d8c8a8', '#e6b8a8', '#7b2a32', '#1c1d1f'], weight=0.07),
    'S7': dict(name='50cc 舊款（綠牌）', base='S1A', scale=0.93, rf=0.2, rr=0.2, tw=0.085, extras=['grab'], lamp='handle', worn=True,
               palette=['#c7c2b6', '#dcd6c8', '#dcd6c8', '#9a9aa0', '#5d6f86', '#7d2a2a', '#3e4a3c'], weight=0.07),
    'S3': dict(name='大型速克達', wb=0.7, rf=0.255, rr=0.25, tw=0.12, fl=0.36, fx=0.36,
               rear=[(0.02, 0.33, 0.74, 0.17, 0.13), (-0.16, 0.33, 0.78, 0.19, 0.145), (-0.42, 0.38, 0.8, 0.2, 0.155), (-0.7, 0.52, 0.8, 0.19, 0.145), (-0.9, 0.6, 0.79, 0.16, 0.12), (-1.03, 0.65, 0.77, 0.11, 0.085), (-1.08, 0.69, 0.75, 0.05, 0.04)], rp=4.0,
               front=dict(top=(0.52, 1.02), lean=26, bulge=0.0, hw=(0.2, 0.24, 0.15), dtop=0.13, fillet=0.06, p=3.4, pb=6),
               cov=dict(L=0.24, hw=0.16, hh=0.06, p=3.4, dx=0.03), lamp='apron',
               seat=[(0.0, 0.74, 0.79, 0.15), (-0.12, 0.765, 0.81, 0.17), (-0.45, 0.78, 0.82, 0.17), (-0.6, 0.8, 0.9, 0.16), (-0.78, 0.81, 0.89, 0.15), (-0.94, 0.79, 0.85, 0.1)],
               floor='tunnel', screen=True, exh='big', tail='wide', mirror='poly', two_tone=True, extras=['grab'],
               palette=['#e9e9e7', '#6b6f73', '#4a4e54', '#141517', '#1f2e48'], weight=0.04),
    'S6': dict(name='方塊越野風', wb=0.65, rf=0.232, rr=0.232, tw=0.13, fl=0.33, fx=0.31,
               rear=[(0.0, 0.31, 0.71, 0.16, 0.13), (-0.14, 0.31, 0.75, 0.175, 0.145), (-0.38, 0.36, 0.77, 0.18, 0.15), (-0.64, 0.5, 0.78, 0.17, 0.145), (-0.84, 0.58, 0.78, 0.15, 0.13), (-0.96, 0.63, 0.77, 0.11, 0.1), (-1.0, 0.66, 0.76, 0.07, 0.065)], rp=6.0, bulge=0.0,
               front=dict(top=(0.44, 0.95), lean=13, bulge=0.0, hw=(0.17, 0.2, 0.16), dtop=0.14, fillet=0.05, p=6.0, pb=8),
               cov=dict(L=0.2, hw=0.12, hh=0.05, p=6.0, dx=0.02), lamp='stack',
               seat=[(0.0, 0.71, 0.76, 0.13), (-0.1, 0.74, 0.8, 0.15), (-0.45, 0.76, 0.82, 0.155), (-0.74, 0.77, 0.83, 0.14), (-0.88, 0.77, 0.815, 0.1)],
               exh='normal', tail='wide', mirror='round', two_tone=True, extras=['rack', 'grab'], bars=True, hi_fender=True,
               palette=['#e8e8e6', '#b5a27a', '#4f5a3c', '#e3c22b', '#1b1c1e'], weight=0.03),
    'S9': dict(name='彎樑', cub=True, palette=['#8f2626', '#1f2f4f', '#1c1d1f', '#2f4a36', '#d9d2c2'], weight=0.02),
    # 同一個車身的配件變化（街上看起來不同、也是生活痕跡）
    'S1B_D': dict(name='國民通勤＋外送箱', base='S1B', extras=['delivery', 'phone'], weight=0.07, palette=['#f1f1ee', '#a9adb2', '#6f7378', '#334a6b', '#141517']),
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
    RR = [tsect(x, yb, yt, w0, w1, p=A['rp'], bulge=A.get('bulge', 0.04)) for (x, yb, yt, w0, w1) in rear]
    k = {'wide': 2, 'sharp': 2, 'strip': 1}.get(A['tail'], 0)   # 尾燈＝車尾最後一兩段（包著車尾的燈殼，不是貼一塊方塊）
    if k: loft(paint, RR[:-k], cap1=False); loft(part('tail'), RR[-k - 1:], cap0=False)
    else: loft(paint, RR)
    if A['two_tone']:   # 運動型：側板下半部黑色塑件（比車殼寬一點點，蓋在下緣）
        loft(part('black'), [tsect(x, yb - 0.005, yb + (yt - yb) * 0.38, w0 + 0.006, w0 * 0.96 + 0.004, p=A['rp']) for (x, yb, yt, w0, w1) in rear[1:-1]])
    # 座墊：坐的地方低、後座高一點；外緣一圈車線（深一點的顏色）
    seat = A['seat']; loft(part(A.get('seat_col', 'seat')), [tsect(x, yb - 0.01, yt + 0.025, hw * 1.05, hw * 0.93, p=2.8, n=8, bulge=0.04) for (x, yb, yt, hw) in interp(seat, 1)])   # 座墊有厚度（約 10 cm、坐進車殼頂）、比車殼寬一點點
    # 踏板：平的腳踏板（深灰橡膠）＋兩側的車殼裙邊，從座墊前緣到腳踏內板的圓弧
    F0 = A['front']; FR = front_rows(A); Fp, Fpb = F0.get('p', 3.0), F0.get('pb', 6.0); xt_, yt_ = F0['top']
    x0f, x1f = rear[0][0] - 0.03, fx - F0.get('fillet', 0.06) + 0.01
    part('dark').box(x0f + 0.02, x1f, fl - 0.012, fl, -0.165, 0.165)
    if A.get('floor') == 'tunnel':   # 大型速克達：踏板中間的隧道（騎士要跨過去）
        loft(paint, [tsect(x, fl - 0.01, fl + 0.13, 0.085, 0.06, p=2.6, n=8, bulge=0.0) for x in (x0f, (x0f + x1f) / 2, x1f + 0.03)])
    loft(paint, [tsect(x, fl - 0.11, fl - 0.008, 0.17, 0.172, p=4) for x in (x0f, (x0f + x1f) / 2, x1f + 0.01)])
    # 前車身：前擋（上面往後傾）＋腳踏內板（膝蓋那面：黑色塑件或同色）一整塊，下面讓開前輪
    back = part(F0.get('back', 'black'))
    loft_split([fsec(r, Fp, Fpb) for r in FR], lambda i: back if i >= 6 else paint)
    FS = front_F(FR, Fp, Fpb); ul = lambda y: u_at(FR, y); PI = math.pi
    # 後車身的分模線：一圈很細的深色帶（側蓋和下半部的接縫），從座墊前緣下方到車尾
    lv = 0.42
    loft(part('black'), [tsect(x, yb + (yt - yb) * lv, yb + (yt - yb) * lv + 0.007, (w0 + (w1 - w0) * lv) * 1.05 + 0.003, (w0 + (w1 - w0) * lv) * 1.05 + 0.003, p=A['rp'] + 1, n=6, bulge=0.0) for (x, yb, yt, w0, w1) in rear[2:-3]])
    # 龍頭罩：坐在前車身頂上
    C = A['cov']; Lc, hwc, hhc = C['L'], C['hw'], C['hh']; xcv = xt_ - F0.get('dtop', 0.12) / 2 + C.get('dx', 0.02); ycv = yt_ + hhc * 0.55
    cov = [(xcv - Lc / 2, ycv - hhc * 0.1, hwc * 0.4, hhc * 0.55), (xcv - Lc * 0.22, ycv, hwc, hhc), (xcv + Lc * 0.2, ycv - hhc * 0.08, hwc * 0.9, hhc * 0.92), (xcv + Lc / 2, ycv - hhc * 0.3, hwc * 0.55, hhc * 0.6)]
    loft(paint, [sect(x, cy, hw, hh, p=C.get('p', 3.0)) for (x, cy, hw, hh) in cov]); cy_c = cov[1][1]
    # 前土除：貼著前輪（間隙約 3 cm），從前輪後上方包到前方
    if A.get('hi_fender'):   # 越野風：高的前土除（裝在前車身下面，離輪子很遠）
        arc_band(part('black'), wb - 0.02, rf, rf + 0.13, -40, 55, tw * 0.6 + 0.02, th=0.009)
    else: arc_band(paint, wb, rf, rf + 0.035, -35, 75, tw * 0.62 + 0.012, th=0.008)
    # 前叉：前輪軸沿轉向軸（指向龍頭罩）往上，下半截露出來、上半截進前車身
    ye = 2 * rf + 0.1; kf = (ye - rf) / (cy_c - rf); fxe = wb + (xcv - wb) * kf
    for z in (-0.055, 0.055):
        part('alloy').cyl((wb, rf, z), (wb + (fxe - wb) * 0.6, rf + (ye - rf) * 0.6, z), 0.021, seg=6)
        part('metal').cyl((wb + (fxe - wb) * 0.55, rf + (ye - rf) * 0.55, z), (fxe, ye, z * 0.8), 0.016, seg=6)
    # 把手＋煞車拉桿＋儀表
    gr = part('dark')
    for s in (-1, 1):
        gr.cyl((xcv, cy_c + 0.005, s * 0.15), (xcv - 0.02, cy_c + 0.015, s * 0.33), 0.017, seg=6)
        part('black').cyl((xcv + 0.02, cy_c + 0.02, s * 0.2), (xcv + 0.05, cy_c + 0.01, s * 0.31), 0.006, seg=3)
    part('smoke').box(cov[1][0] - 0.03, cov[1][0] + 0.03, cy_c + hhc * 0.6, cy_c + hhc * 0.6 + 0.025, -0.07, 0.07)
    # 後照鏡：細桿＋扁橢圓的鏡子（鏡面朝後）
    ms = A['mirror']; mr = part('chrome' if ms == 'chrome' else 'dark')
    for s in (-1, 1):
        hd = (xcv - 0.03, cy_c + (0.13 if ms == 'poly' else 0.2), s * (0.3 if ms == 'poly' else 0.28))
        mr.cyl((xcv - 0.005, cy_c + 0.03, s * 0.21), (hd[0] + 0.005, hd[1] - 0.025, hd[2] - s * 0.02), 0.007, seg=4); mirror_head(mr, hd, ms)
    # 頭燈：龍頭罩前端的燈殼（handle）、復古圓燈（round）；前擋上的燈都從前車身曲面取一塊（貼著曲面）
    lp = part('lamp'); am = part('amber'); lt = A['lamp']; xn, cyn, hwn, hhn = cov[-1]
    if lt == 'handle':
        loft(lp, [sect(xn - 0.004, cyn, hwn * 0.86, hhn * 0.82, p=C.get('p', 3.0)), sect(xn + 0.012, cyn, hwn * 0.76, hhn * 0.68, p=C.get('p', 3.0))])
    elif lt == 'round':
        part('chrome').cyl((xn - 0.03, cyn, 0), (xn + 0.02, cyn, 0), 0.07, seg=14); lp.cyl((xn + 0.019, cyn, 0), (xn + 0.026, cyn, 0), 0.058, seg=14)
    elif lt == 'apron':   # 前擋左右兩顆
        for (a0, a1) in ((0.3 * PI, 0.44 * PI), (0.56 * PI, 0.7 * PI)):
            patch(part('black'), FS, ul(yt_ - 0.212), ul(yt_ - 0.068), a0 - 0.02 * PI, a1 + 0.02 * PI, nu=1, off=0.0015); patch(lp, FS, ul(yt_ - 0.2), ul(yt_ - 0.08), a0, a1)   # 燈殼的黑邊＋燈
    elif lt == 'vled':    # 運動型：V 字形的燈（從中間下方往兩側上方）
        u0, u1 = ul(yt_ - 0.34), ul(yt_ - 0.06)
        for s in (1, -1):
            f = lambda u, d, s=s: PI / 2 - s * (0.04 * PI + 0.22 * PI * (u - u0) / (u1 - u0)) + d
            patch(lp, FS, u0, u1, lambda u, f=f: f(u, -0.035 * PI), lambda u, f=f: f(u, 0.035 * PI), nu=4, nt=1)
    elif lt == 'strip':   # 電動：前擋中間一條直的燈
        patch(lp, FS, ul(fl + 0.22), ul(yt_ - 0.05), 0.47 * PI, 0.53 * PI, nu=4, nt=1)
    elif lt == 'stack':   # 越野風：中間上下兩顆方燈
        for (y0, y1) in ((yt_ - 0.23, yt_ - 0.15), (yt_ - 0.12, yt_ - 0.04)):
            patch(part('black'), FS, ul(y0 - 0.012), ul(y1 + 0.012), 0.36 * PI, 0.64 * PI, nu=1, nt=3, off=0.003); patch(lp, FS, ul(y0), ul(y1), 0.38 * PI, 0.62 * PI, nu=1, nt=3, off=0.006)
    if lt in ('strip', 'apron', 'vled', 'stack'):   # 龍頭罩前端的小燈（位置燈）
        loft(lp, [sect(xn - 0.004, cyn, hwn * 0.5, hhn * 0.4, p=C.get('p', 3.0)), sect(xn + 0.008, cyn, hwn * 0.45, hhn * 0.32, p=C.get('p', 3.0))])
    for (a0, a1) in ((0.1 * PI, 0.22 * PI), (0.78 * PI, 0.9 * PI)): patch(am, FS, ul(yt_ - 0.11), ul(yt_ - 0.03), a0, a1, nu=1, nt=2)   # 前方向燈
    # 後方向燈（車尾兩側，貼著曲面）、復古的圓尾燈
    nR = len(rear); RF = rear_F(rear, A['rp'], A.get('bulge', 0.04))
    for (a0, a1) in ((0.08, 0.42), (PI - 0.42, PI - 0.08)): patch(am, RF, nR - 4.0, nR - 3.2, a0, a1, nu=1, nt=2)
    if A['tail'] == 'round':
        tx, tyb, tyt = rear[-1][0], rear[-1][1], rear[-1][2]; part('chrome').cyl((tx + 0.03, (tyb + tyt) / 2, 0), (tx - 0.01, (tyb + tyt) / 2, 0), 0.046, seg=12)
        part('tail').cyl((tx - 0.009, (tyb + tyt) / 2, 0), (tx - 0.016, (tyb + tyt) / 2, 0), 0.04, seg=12)
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
        bb = part('black'); bx = xcv + 0.01; bb.cyl((bx, cy_c + 0.06, -0.3), (bx, cy_c + 0.06, 0.3), 0.012, seg=5); bb.cyl((bx, cy_c + 0.1, -0.12), (bx, cy_c + 0.1, 0.12), 0.01, seg=5)
        for z in (-0.12, 0.12): bb.cyl((bx, cy_c + 0.06, z), (bx, cy_c + 0.1, z), 0.01, seg=4)
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
        yh = yt_ - 0.34; part('helmet_w').ell((row_at(FR, ul(yh))[2] - 0.07, yh, 0.0), 0.06, 0.085, 0.085, seg=8, rings=5)
    if 'chrome_rack' in ex or 'rack' in ex:   # 後架（復古：鍍鉻；越野：黑色）
        rk = part('chrome' if 'chrome_rack' in ex else 'black'); x0, x1, y = seat[3][0], sx_end - 0.06, sy + 0.02
        for z in (-0.12, 0.12): rk.cyl((x0, y - 0.02, z * 1.2), (x0 - 0.04, y, z), 0.01, seg=4); rk.cyl((x0 - 0.04, y, z), (x1, y, z), 0.01, seg=4)
        for x in (x0 - 0.04, (x0 + x1) / 2 - 0.02, x1): rk.cyl((x, y, -0.12), (x, y, 0.12), 0.009, seg=4)
    if 'delivery' in ex:  # 外送箱（方形保溫箱、素色、沒有平台的標誌）＋後架
        x1 = sx_end - 0.02; part('metal').box(x1 - 0.32, x1, sy + 0.0, sy + 0.025, -0.15, 0.15)
        part('deliv').rbox(x1 - 0.42, x1 + 0.02, sy + 0.025, sy + 0.45, -0.22, 0.22, r=0.03, seg=1)
        part('black').box(x1 - 0.425, x1 + 0.025, sy + 0.33, sy + 0.345, -0.222, 0.222)
    if 'helmet' in ex:    # 掛在左後照鏡下的半罩安全帽
        hx, hy, hz = xcv - 0.03, cy_c - 0.08, 0.27; part('helmet_b').ell((hx, hy, hz), 0.12, 0.09, 0.105, seg=10, rings=5)
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


def make_lod(ob, target=600):
    """遠處用的簡化版（節點名稱加 _lod1）：Decimate（collapse）到約 target 個三角形；頂點色、材質跟著原本的"""
    n = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    dup = ob.copy(); dup.data = ob.data.copy(); dup.name = ob.name + '_lod1'; bpy.context.scene.collection.objects.link(dup); dup.parent = root
    dec = dup.modifiers.new('dec', 'DECIMATE'); dec.ratio = min(1.0, target / n); dec.use_collapse_triangulate = True
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(dup.evaluated_get(dg)); dup.modifiers.remove(dec)
    old = dup.data; dup.data = me; bpy.data.meshes.remove(old)
    dup.location = (ob.location[0], ob.location[1] - 3.0, 0.0) if '--layx' in ARGS else (ob.location[0] + 3.0, ob.location[1], 0.0)
    return dup, sum(len(p.vertices) - 2 for p in me.polygons)


meta = {}
codes = ONLY or list(ARCH)
if '--preview' in ARGS:
    PICK = {'S1A': 5, 'S1B': 4, 'S2': 2, 'S5': 3, 'S4': 1, 'S7': 1, 'S3': 0, 'S6': 1, 'S9': 0, 'S1B_D': 0, 'S5_H': 4, 'S1A_C': 1}
    for c in codes: PREVIEW_COL[f'scooter_{c}'] = ARCH[c]['palette'][PICK.get(c, 0)]
for i, code in enumerate(codes):
    parts = build(code); ob = finish_all(parts, f'scooter_{code}', i * 1.2)
    A = ARCH[code]; ob['archetype'] = code; ob['weight'] = A['weight']; ob['palette'] = json.dumps(A['palette']); ob['label'] = A['name']
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); lod, lt = make_lod(ob)
    meta[code] = dict(name=A['name'], tris=tris, lod1=lt, weight=A['weight'], palette=A['palette'])
    print('scooter', code, A['name'], 'tris', tris, 'lod1', lt)
# 舊名稱（遊戲還沒套新接法時用）：scooter_a＝S1 新款、scooter_b＝S4 復古（S4 還沒做時暫時用 S1 舊款）
alias = {'a': 'S1B', 'b': 'S4' if 'S4' in ARCH else 'S1A'}
for k, code in alias.items():
    src = bpy.data.objects.get(f'scooter_{code}')
    if src is None: continue
    dup = src.copy(); dup.data = src.data; dup.name = f'scooter_{k}'; bpy.context.scene.collection.objects.link(dup); dup.parent = root; dup.location = (0.0, 3.0 + len(codes) * 1.2, 0.0)
info = L.export(OUT, gpu_instances=False)
info['variants'] = meta; info['alias'] = alias
L.write_json(OUT[:-4] + '.json', info)
print('avg tris', round(sum(v['tris'] for v in meta.values()) / max(len(meta), 1)), 'weighted', round(sum(v['tris'] * v['weight'] for v in meta.values()) / sum(v['weight'] for v in meta.values())), 'lod1 weighted', round(sum(v['lod1'] * v['weight'] for v in meta.values()) / sum(v['weight'] for v in meta.values())))
