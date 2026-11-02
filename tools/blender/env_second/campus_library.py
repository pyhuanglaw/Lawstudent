"""總圖書館（椰影大道東端盡頭，正面朝西）的正式外觀 → 一個 GLB（校園世界座標）。LAWWW2（帳號 A）2026-11-02 照使用者給的照片重做：
  /opt/blenv/bin/python tools/blender/env_second/campus_library.py [-- --out 輸出.glb] [--render 資料夾]
（第一版 2026-10-11 是 campus_hall.py 的 build(SETS['library'])，照套件 CK.hall 的開間做的紅磚四坡屋頂；那一版留在 campus_hall.py，這支不再呼叫它。）

使用者 11-02 08:45「這是總圖前草坪的樣子 你修改遊戲中建築和草皮 這件事先做」（五張照片）、08:55「總圖前的台階要做出來」。照片裡的立面（由中間往外）：
  - 中央：白色石材的大面，上面一個大拱窗（扇形窗櫺＋下面的方格）；兩旁白石小窗、浮雕方塊；外圈紅磚框，兩側細高的拱頂長窗；
    頂上一個淺山牆（紅磚斜簷、齒狀線腳、白色壓頂），山牆和白石面的小山牆中間一個圓窗。大拱窗下一塊白石匾額（招牌「總圖書館」）。
  - 兩旁各一座比山牆屋簷高的磚塔（五層＋頂層），中間一排白框窗：二樓雙窗、三樓寬窗＋小陽台、四樓白石拱窗、頂層白框方窗；最上面白色壓頂。
  - 再往外：退一點的磚牆（窄窗）→ 外翼（五層、白框窗）→ 更矮的端部（四層）。
  - 一樓：突出在前面的一層樓拱廊。中間一段紅磚、三個拱（中間的最大，是大門）；兩旁白色石材牆、各兩個拱。拱廊頂是二樓的露台（白色女兒牆）。
  - 拱廊前一整排寬台階（五階、約 36 m 寬），兩端是白石花台；台階上去是平台，再進拱廊。
    使用者 11-02 10:4x 糾正「仔細看我給你的圖 總圖出來還有個平台 之後才是階梯往下」：第一版平台只有 1.35 m（台階頂到拱廊正面），走出拱廊馬上下台階。
    照片 2、照片 1 放大看：人站在拱廊和台階中間的平面上、台階前緣離拱廊有一段距離 → 平台改成 6 m 深（x 76～82），台階整個往草坪那邊移 4.25 m（x 73.75～76）；
    平台兩端（|z| 30，落差 0.9）加白石矮牆（不然走得出平台邊、一步掉下去）。
  - 北邊（從草坪看是左邊）一座獨立的方形磚塔：白石基座、白色腰帶，頂上每面兩個拱形開口、白色簷口和女兒牆。
尺寸：照片 2（正面、最不變形）量比例，立面寬 60 m（套件 CK.hall 的 w，導航和鏡頭碰撞的盒子照舊）：
  一樓 0.9～6.6（平台 0.9），二～五樓每層 3.6，主體屋頂 21.0；磚塔 23.6＋白色壓頂；山牆屋簷 21.6、頂 25.8；大拱窗 6.1×8.6 m。
台階、平台、拱廊在這個模型裡；走得上去要遊戲的導航配合（addSurf：台階一階一階、平台 0.9 m）——位置寫在 campus_library.layout.json，
  接法是給 LAWWW 的 patch（docs/art-rebuild/second_ai/patches/）。
材質名稱照舊（遊戲 attachWenzhouModel 認名字）：ck_wall（面磚）、ck_white（白色石材牆，新）、ck_trim（白色收邊）、ck_trim_win（窗框、窗台）、
  seethru_ck_pier／seethru_ck_col（拱廊的柱墩：擋在鏡頭和玩家中間時網點透空）、ck_stone_base（花崗石：平台、台階、勒腳）、ck_roof、ck_ceiling、
  ck_frame（深色窗框）、ck_glass（窗：晚上約七成亮燈）、ck_board（招牌板面 PLATE_FACE_LIB，遊戲用 canvas 畫字）。
貼圖都是 Poly Haven CC0：exterior_wall_cladding_02（面磚）、sandstone_blocks_08（石材，降彩度調白）、granite_tile（花崗石）、grey_roof_tiles（屋瓦）、dark_wood。
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Vector   # noqa: E402
from cafe_layout import uv01   # noqa: E402

OUT = 'assets/models/env/second_ai/campus_library.glb'
NSEG = 8                     # 窗拱分段
NSEG_A = 10                  # 拱廊大拱
GL_TOP, GL_BOT = (0.26, 0.31, 0.36), (0.06, 0.08, 0.10)

# ---------------- 尺寸（校園世界座標：x 往東、y 往上、z 往南；正面朝西 −x）----------------
P = 0.90                     # 平台（拱廊地坪）高度
NST, RISE, TREAD = 5, 0.18, 0.45
XST0 = 73.75                 # 第一階的前緣（使用者 11-02 10:4x：走出總圖先是平台，之後才是台階往下 → 平台 6 m 深；第一版 78.0、平台只有 1.35 m）
XL = XST0 + NST * TREAD      # 76.0：最上一階＝平台前緣（平台 x 76～82 在拱廊外面、82.6～86.4 是拱廊走道）
ZST = 18.0                   # 台階半寬（|z| ≤ 18）
AFW, AFC = 82.0, 81.6        # 一樓拱廊正面：白石翼牆、中間紅磚段（多凸 0.4）
TWW, TWC = 0.6, 1.0          # 正面牆厚：白石翼 0.6、紅磚段 1.0 → 內面都在 x=82.6
XIN = AFW + TWW              # 82.6：拱廊走道的前牆內面
AB = 86.4                    # 拱廊後牆（大門、玻璃店面）
CEIL = 5.75                  # 拱廊天花板
F2 = 6.6                     # 二樓樓板＝一樓簷口頂＝露台面
FH = 3.6                     # 二樓以上每層
ROOF = F2 + 4 * FH           # 21.0 主體屋頂
ZW = 30.0                    # 立面半寬
ZA = 27.4                    # 拱廊走道半長（兩端到 ZW 是實牆）
ZC = 8.4                     # 中間紅磚段半寬
XBACK = 113.0
SPRING = 3.3                 # 拱廊各拱的起拱高度（同一條線）
ARCHES = [(0.0, 2.3, 'c'), (5.6, 1.7, 'c'), (-5.6, 1.7, 'c'), (12.2, 1.6, 'w'), (-12.2, 1.6, 'w'), (21.6, 1.6, 'w'), (-21.6, 1.6, 'w')]   # (z 中心, 半徑, 紅磚段/白石翼)
XPAV, XSTRIP, XBAY, XOW, XLOW = 86.6, 87.0, 86.2, 87.6, 88.2
EAVE, PEAK = 21.6, 25.8      # 山牆屋簷、頂
GW = 10.6                    # 山牆（中央量體）半寬
WF = 7.2                     # 中央白石面半寬
WEAVE, WPEAK = 18.9, 20.6    # 白石面的小山牆
BAYZ0, BAYZ1, BAYC = 12.4, 21.2, 16.8
BAYTOP, BAYX1 = 23.6, 96.0   # 磚塔頂、磚塔量體的深度（後面降到主體屋頂）
OWZ, LOWTOP = 26.6, F2 + 3 * FH   # 外翼到 26.6；端部 26.6～30 只有四層（17.4）
TOWER = dict(x=84.8, z=-34.8, s=5.4, h=22.6, bel=3.8)   # 北邊的方塔：中心、邊長、塔身高、鐘樓層（照片 3 和使用者 11-02 09:4x 那張：塔比兩旁磚塔、山牆都高一點，約 28 m；離主體北端約 2 m、正面和拱廊對齊）


def build(out, render_dir=None):
    B.reset(texres=512)
    root = B.group('campus_library', props={'kind': 'campus_library'})
    M = {
        'wall': L.pbr('ck_wall', 'exterior_wall_cladding_02', tile=2.0, target='#a26c58', sat=0.55, normal=1.2, contrast=1.25, maps=('diff', 'nor'), rough_value=0.88),   # v3.2（BB_234 ④）：近看磚紋偏淡 → 法線 0.8→1.2、對比 1.25
        'white': L.pbr('ck_white', 'sandstone_blocks_08', tile=3.6, sat=0.12, target='#dcd8cf', normal=0.9, maps=('diff', 'nor'), res=512, rough_value=0.78),   # v3.2（BB_234 ④）：石面的接縫立體一點（法線 0.45→0.9）
        'trim': L.pbr('ck_trim', 'sandstone_blocks_08', tile=3.0, sat=0.12, target='#e4e0d7', normal=0.9, maps=('diff', 'nor'), res=512, rough_value=0.75),
        'trimw': L.pbr('ck_trim_win', 'sandstone_blocks_08', tile=3.0, sat=0.12, target='#e4e0d7', maps=('diff',), res=512, rough_value=0.75),
        'pier': L.pbr('seethru_ck_pier', 'exterior_wall_cladding_02', tile=2.0, target='#a26c58', sat=0.55, normal=1.2, contrast=1.25, maps=('diff', 'nor'), rough_value=0.88),
        'col': L.pbr('seethru_ck_col', 'sandstone_blocks_08', tile=3.6, sat=0.12, target='#dcd8cf', normal=0.9, maps=('diff', 'nor'), res=512, rough_value=0.78),
        'base': L.pbr('ck_stone_base', 'granite_tile', tile=1.6, sat=0.5, target='#a8a49c', maps=('diff',), res=512, rough_value=0.7),
        'roof': L.pbr('ck_roof', 'grey_roof_tiles', tile=3.0, target='#4c535b', normal=0.8, maps=('diff', 'nor'), rough_value=0.82),   # 鳥瞰圖：深灰藍
        'ceil': L.flat('ck_ceiling', '#a49d91', rough=0.95),   # v3.2（BB_234 ①）：拱廊天花板、屋簷底下暗一點（原本 #e6e1d7：從草坪看拱裡面是亮的，像牆上的窗框，沒有深度）
        'flat': L.flat('ck_flatroof', '#b9b4aa', rough=0.92),
        'frame': L.flat('ck_frame', '#3d3f42', rough=0.5),
        'glass': L.vc_material('ck_glass', rough=0.12),
        'board': L.flat('ck_board', '#e1dcd2', rough=0.8),
    }
    # 玻璃：亮燈、沒亮燈同一個材質（campus_hall.py 同一套）：自發光貼圖左半黑、右半由上往下漸暗的燈光；窗的 UV：沒亮燈 u=0.125、亮燈 u=0.875
    lit = bpy.data.images.new('win_lit_grad', 64, 64, alpha=False); px = []
    for j in range(64):
        t = j / 63; k = [(0.50, 0.36, 0.22), (0.86, 0.70, 0.48), (1.0, 0.92, 0.76)]
        a, b, u = (k[0], k[1], t / 0.6) if t < 0.6 else (k[1], k[2], (t - 0.6) / 0.4)
        px += [0.0, 0.0, 0.0, 1.0] * 32 + ([a[i] + (b[i] - a[i]) * u for i in range(3)] + [1.0]) * 32
    lit.pixels.foreach_set(px); lit.pack()
    nt = M['glass'].node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = lit; tx.extension = 'EXTEND'
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Emission Color']); nt.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 1.0
    accs = {}

    def acc(k):
        if k not in accs: accs[k] = (CMesh if k == 'glass' else Mesh)('lib_' + k, M[k])
        return accs[k]

    # ---------------- 幾何小工具（世界座標）----------------
    def newell(pts):
        n = [0.0, 0.0, 0.0]
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
        return n

    def face(m, pts, want=None, uvs=None):
        if want is not None:
            n = newell(pts)
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]; uvs = uvs[::-1] if uvs else uvs
        f = m.bm.faces.new([m.bm.verts.new(g2b(*p)) for p in pts])
        if uvs:
            lay = m.bm.loops.layers.uv.get('UVMap') or m.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, uvs): lp[lay].uv = uv
        return f

    def box(m, x0, x1, y0, y1, z0, z1, skip=()):
        F_ = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
              'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
              'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
        for k, (pts, n) in F_.items():
            if k not in skip: face(m, pts, n)

    class Fr:
        """立面座標：u＝從外面看往右、v＝高度、d＝往外"""
        def __init__(self, O, R, N): self.O, self.R, self.N = O, R, N
        def p(self, u, v, d=0.0): return (self.O[0] + u * self.R[0] + d * self.N[0], self.O[1] + v, self.O[2] + u * self.R[2] + d * self.N[2])
        def dirv(self, du, dv, dd): return (du * self.R[0] + dd * self.N[0], dv, du * self.R[2] + dd * self.N[2])

    def FW(x): return Fr((x, 0, 0), (0, 0, 1), (-1, 0, 0))     # 朝西（正面）：u＝z
    def FE(x): return Fr((x, 0, 0), (0, 0, -1), (1, 0, 0))     # 朝東（背面）：u＝−z
    def FN(z): return Fr((0, 0, z), (-1, 0, 0), (0, 0, -1))    # 朝北：u＝−x
    def FS(z): return Fr((0, 0, z), (1, 0, 0), (0, 0, 1))      # 朝南：u＝x

    def arc(uc, vs, r, n, a0=math.pi, a1=0.0):
        return [(uc + r * math.cos(a0 + (a1 - a0) * k / n), vs + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]

    def rect(m, fr, ua, ub, va, vb, d=0.0):
        if ub - ua > 1e-4 and vb - va > 1e-4: face(m, [fr.p(ua, va, d), fr.p(ub, va, d), fr.p(ub, vb, d), fr.p(ua, vb, d)], fr.N)

    def strip(m, fr, a, b, d0, d1, want):
        face(m, [fr.p(a[0], a[1], d0), fr.p(b[0], b[1], d0), fr.p(b[0], b[1], d1), fr.p(a[0], a[1], d1)], fr.dirv(*want))

    def wall_strip(fr, u0, u1, v0, v1, holes, key='wall', d=0.0, n=NSEG):
        """一段牆（u0..u1 × v0..v1）挖掉洞：holes＝[{u, a（半寬）, vb（洞底）, vs（起拱）, arch, vt（方洞的頂）}]"""
        m = acc(key); cur = u0
        for h in sorted(holes, key=lambda h: h['u']):
            hl, hr = h['u'] - h['a'], h['u'] + h['a']
            if hl > cur + 1e-4: rect(m, fr, cur, hl, v0, v1, d)
            if h['vb'] > v0 + 1e-4: rect(m, fr, hl, hr, v0, h['vb'], d)
            if h['arch']:
                Pp = arc(h['u'], h['vs'], h['a'], h.get('n', n))
                for k in range(len(Pp) - 1):
                    (ua, va), (ub, vb) = Pp[k], Pp[k + 1]
                    face(m, [fr.p(ua, va, d), fr.p(ub, vb, d), fr.p(ub, v1, d), fr.p(ua, v1, d)], fr.N)
            elif v1 > h['vt'] + 1e-4: rect(m, fr, hl, hr, h['vt'], v1, d)
            cur = hr
        if u1 > cur + 1e-4: rect(m, fr, cur, u1, v0, v1, d)

    def wall_bands(fr, u0, u1, bands, holes, key='wall'):
        """一段牆分成幾條水平帶子（每一層一條），每個洞放進它底部所在的那一條（wall_strip 同一條帶子裡同一個 u 只能有一個洞：
        11-02 第一版把上下好幾層的窗放在同一條帶子裡，上面那幾扇被牆蓋住，遊戲裡只看到白框、裡面是磚）"""
        for (v0, v1) in bands:
            hs = [h for h in holes if v0 - 1e-6 <= h['vb'] < v1 - 1e-6]
            for h in hs:
                top = h['vs'] + h['a'] if h['arch'] else h['vt']
                if top > v1 + 1e-6: print('wall_bands：洞超出帶子', round(h['u'], 2), round(h['vb'], 2), round(top, 2), '>', round(v1, 2))
            wall_strip(fr, u0, u1, v0, v1, hs, key)

    def glass_face(fr, pts_uv, d, lit_, vb, vt, dark=False):
        uc = 0.875 if lit_ else 0.125
        uvs = [(uc, max(0.0, min(1.0, (v - vb) / max(1e-6, vt - vb)))) for u, v in pts_uv]
        m = acc('glass'); f = face(m, [fr.p(u, v, d) for u, v in pts_uv], fr.N, uvs)
        k = 0.45 if dark else 1.0
        for lp in f.loops:
            t = max(0.0, min(1.0, ((lp.vert.co.z) - vb) / max(1e-6, vt - vb)))
            lp[m.col] = [k * (GL_BOT[i] + (GL_TOP[i] - GL_BOT[i]) * t) for i in range(3)] + [1.0]

    def window(fr, u, vb, ww, wh, f, lit_, rect_=False, dep=0.30, proud=0.06, sill=True, mull=1, trans=0, tkey='trimw'):
        """一扇窗（窗洞挖在牆上；外框＝石材窗框外緣）：石材窗框（外凸）＋外側面、窗洞內側、深色窗框、直櫺 mull 根、橫櫺 trans 根、玻璃、窗台"""
        r = ww / 2; ro = r + f; vs = vb + wh if rect_ else vb + wh - r; t = 0.06; tw = acc(tkey); fm = acc('frame')
        vt = vb + wh
        rect(tw, fr, u - ro, u - r, vb, vs, proud); rect(tw, fr, u + r, u + ro, vb, vs, proud)
        if rect_: rect(tw, fr, u - ro, u + ro, vs, vs + f, proud)
        else:
            I, O = arc(u, vs, r, NSEG), arc(u, vs, ro, NSEG)
            for k in range(NSEG): face(tw, [fr.p(*I[k], proud), fr.p(*I[k + 1], proud), fr.p(*O[k + 1], proud), fr.p(*O[k], proud)], fr.N)
        strip(tw, fr, (u - ro, vb), (u - ro, vs), 0, proud, (-1, 0, 0)); strip(tw, fr, (u + ro, vb), (u + ro, vs), 0, proud, (1, 0, 0))
        if rect_: strip(tw, fr, (u - ro, vs + f), (u + ro, vs + f), 0, proud, (0, 1, 0))
        else:
            for k in range(NSEG):
                a = math.pi * (1 - (k + 0.5) / NSEG); strip(tw, fr, O[k], O[k + 1], 0, proud, (math.cos(a), math.sin(a), 0))
        de = -dep - 0.01
        strip(tw, fr, (u - r, vb), (u - r, vs), proud, de, (1, 0, 0)); strip(tw, fr, (u + r, vb), (u + r, vs), proud, de, (-1, 0, 0))
        if rect_: strip(tw, fr, (u - r, vs), (u + r, vs), proud, de, (0, -1, 0))
        else:
            for k in range(NSEG):
                a = math.pi * (1 - (k + 0.5) / NSEG); strip(tw, fr, I[k], I[k + 1], proud, de, (-math.cos(a), -math.sin(a), 0))
        strip(tw, fr, (u - r, vb), (u + r, vb), -0.06 if sill else proud, de, (0, 1, 0))
        rect(fm, fr, u - r, u - r + t, vb, vs, -dep + 0.005); rect(fm, fr, u + r - t, u + r, vb, vs, -dep + 0.005)
        rect(fm, fr, u - r + t, u + r - t, vb, vb + t, -dep + 0.005)
        if rect_: rect(fm, fr, u - r, u + r, vs - t, vs, -dep + 0.005)
        else:
            Ii, Io = arc(u, vs, r - t, NSEG), arc(u, vs, r, NSEG)
            for k in range(NSEG): face(fm, [fr.p(*Ii[k], -dep + 0.005), fr.p(*Ii[k + 1], -dep + 0.005), fr.p(*Io[k + 1], -dep + 0.005), fr.p(*Io[k], -dep + 0.005)], fr.N)
        top = vs if rect_ else vt - t
        for j in range(mull):
            um = u - r + 2 * r * (j + 1) / (mull + 1)
            rect(fm, fr, um - 0.03, um + 0.03, vb + t, top, -dep + 0.035)
        if not rect_:
            rect(fm, fr, u - r + t, u + r - t, vs - 0.03, vs + 0.03, -dep + 0.035)
        for j in range(trans):
            vm = vb + (vs - vb) * (j + 1) / (trans + 1)
            rect(fm, fr, u - r + t, u + r - t, vm - 0.03, vm + 0.03, -dep + 0.035)
        pts = [(u - r, vb), (u + r, vb), (u + r, vs), (u - r, vs)] if rect_ else [(u - r, vb), (u + r, vb)] + arc(u, vs, r, NSEG, 0.0, math.pi)
        glass_face(fr, pts, -dep - 0.005, lit_, vb, vt)
        if sill:
            x0, x1 = u - ro - 0.08, u + ro + 0.08
            for (pts_, n) in (([fr.p(x0, vb, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, 0.22), fr.p(x0, vb, 0.22)], (0, 1, 0)),
                              ([fr.p(x0, vb - 0.1, 0.22), fr.p(x1, vb - 0.1, 0.22), fr.p(x1, vb, 0.22), fr.p(x0, vb, 0.22)], (0, 0, 1)),
                              ([fr.p(x0, vb - 0.1, -0.06), fr.p(x1, vb - 0.1, -0.06), fr.p(x1, vb - 0.1, 0.22), fr.p(x0, vb - 0.1, 0.22)], (0, -1, 0)),
                              ([fr.p(x0, vb - 0.1, -0.06), fr.p(x0, vb, -0.06), fr.p(x0, vb, 0.22), fr.p(x0, vb - 0.1, 0.22)], (-1, 0, 0)),
                              ([fr.p(x1, vb - 0.1, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, 0.22), fr.p(x1, vb - 0.1, 0.22)], (1, 0, 0))):
                face(tw, pts_, fr.dirv(*n))
        return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': not rect_, 'vt': vs + f}

    def lit_hash(*k):
        h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
        return h - math.floor(h) > 0.3

    def band(fr, u0, u1, v0, v1, proud, key='trim', ends=True, top=True, bottom=True):
        """立面上外凸的一條帶子（腰帶、簷口）：正面＋上下面＋兩端"""
        m = acc(key); rect(m, fr, u0, u1, v0, v1, proud)
        if top: strip(m, fr, (u0, v1), (u1, v1), 0, proud, (0, 1, 0))
        if bottom: strip(m, fr, (u0, v0), (u1, v0), 0, proud, (0, -1, 0))
        if ends: strip(m, fr, (u0, v0), (u0, v1), 0, proud, (-1, 0, 0)); strip(m, fr, (u1, v0), (u1, v1), 0, proud, (1, 0, 0))

    def floor_vb(fl, sill=0.95): return F2 + (fl - 2) * FH + sill   # 二樓 fl=2

    lay = {'blocks': [], 'surfs': [], 'cams': [], 'note': '校園世界座標；blocks＝導航阻擋（x0,z0,x1,z1）、surfs＝NavGrid.addSurf、cams＝鏡頭碰撞盒（x0,y0,z0,x1,y1,z1）'}
    def blk(x0, z0, x1, z1, why): lay['blocks'].append({'x0': round(min(x0, x1), 3), 'z0': round(min(z0, z1), 3), 'x1': round(max(x0, x1), 3), 'z1': round(max(z0, z1), 3), 'why': why})

    # =====================================================================
    # 一、台階、平台、花台（花崗石／白石）
    # =====================================================================
    gb = acc('base'); tm = acc('trim')
    for k in range(NST):
        x0, x1, y0, y1 = XST0 + k * TREAD, XST0 + (k + 1) * TREAD, k * RISE, (k + 1) * RISE
        face(gb, [(x0, y0, -ZST), (x0, y0, ZST), (x0, y1, ZST), (x0, y1, -ZST)], (-1, 0, 0))                 # 踢面
        face(gb, [(x0, y1, -ZST), (x0, y1, ZST), (x1, y1, ZST), (x1, y1, -ZST)], (0, 1, 0))                  # 踏面
        rect(tm, FW(x0), -ZST, ZST, y1 - 0.035, y1 + 0.002, 0.012)                                          # 踏面前緣一條白石（看得出一階一階）
    # 平台面（花崗石，0.9）：台階頂到拱廊後牆；兩端到 ZW
    face(gb, [(XL, P, -ZW), (XL, P, ZW), (AB, P, ZW), (AB, P, -ZW)], (0, 1, 0))
    PAR_T, PAR_H = 0.4, 0.55                                                                                  # 平台兩端的白石矮牆：厚 0.4、比平台高 0.55
    for s in (-1, 1):                                                                                         # 平台兩端的側面（落差 0.9；拱廊正面以後是拱廊的端牆）
        face(gb, [(XL, 0, s * ZW), (AFW, 0, s * ZW), (AFW, P, s * ZW), (XL, P, s * ZW)], (0, 0, s))
        za, zb = sorted((s * (ZW - PAR_T), s * ZW))
        box(tm, XL, AFW, P, P + PAR_H, za, zb, skip=('bottom', 'right'))                                     # 矮牆（拱廊那一頭貼著拱廊的端牆）
        box(tm, XL - 0.04, AFW, P + PAR_H, P + PAR_H + 0.08, za - 0.04, zb + 0.04, skip=('right',))          # 壓頂（外凸 4 cm）
        blk(XL, s * (ZW - PAR_T - 0.2), AFW + 0.05, s * ZW, '平台兩端的白石矮牆（落差 0.9）')
    # 花台（台階兩端，白石，比平台高 0.6 m；上面是灌木——灌木在草坪那個模型）
    PLH = 1.5
    for s in (-1, 1):
        za, zb = sorted((s * ZST, s * ZW))
        box(tm, XST0, XL, 0, PLH, za, zb, skip=('bottom',))
        face(acc('flat'), [(XST0 + 0.25, PLH + 0.001, za + 0.25), (XL - 0.25, PLH + 0.001, za + 0.25), (XL - 0.25, PLH + 0.001, zb - 0.25), (XST0 + 0.25, PLH + 0.001, zb - 0.25)], (0, 1, 0))   # 土面（灌木蓋住）
        blk(XST0, za, XL, zb, '花台')
    lay['surfs'].append({'x0': XST0, 'x1': XL, 'z0': -ZST, 'z1': ZST, 'axis': 'x', 'ya': 0.0, 'yb': P, 'tread': TREAD, 'rise': RISE, 'low': 'x0', 'why': '台階（五階，每階 0.18 m、深 0.45 m）'})
    lay['surfs'].append({'x0': XL, 'x1': AB, 'z0': -ZW + 0.2, 'z1': ZW - 0.2, 'y': P, 'why': '平台＋拱廊走道'})

    # =====================================================================
    # 二、一樓拱廊（正面牆＋拱、走道、後牆、天花板、簷口、露台女兒牆）
    # =====================================================================
    def arcade_front(z0, z1, xo, thick, key, ringkey, arches, ends=()):
        """正面牆（外面 x=xo、裡面 x=xo+thick）從 z0 到 z1，開 arches 的拱：外面、裡面、拱腹、側面（洞口兩側）；外面加拱圈（石材）、拱心石、拱墩"""
        fo, fi = FW(xo), FW(xo + thick)
        holes = [{'u': z, 'a': r, 'vb': P, 'vs': SPRING, 'arch': True, 'vt': SPRING + r, 'n': NSEG_A} for (z, r, _) in arches]
        wall_strip(fo, z0, z1, P, F2 - 0.6, holes, key)                    # 外面（到簷口帶的下緣）
        wall_strip(fi, z0, z1, P, CEIL, holes, key)                        # 裡面（走道那一面，到天花板）
        m = acc(key)
        for (z, r, _) in arches:
            # 洞口兩側（拱腳以下）、拱腹
            face(m, [(xo, P, z - r), (xo + thick, P, z - r), (xo + thick, SPRING, z - r), (xo, SPRING, z - r)], (0, 0, 1))
            face(m, [(xo, P, z + r), (xo + thick, P, z + r), (xo + thick, SPRING, z + r), (xo, SPRING, z + r)], (0, 0, -1))
            Pp = arc(z, SPRING, r, NSEG_A)
            for k in range(NSEG_A):
                (za, ya), (zb, yb) = Pp[k], Pp[k + 1]; mid = math.pi * (1 - (k + 0.5) / NSEG_A)
                face(m, [(xo, ya, za), (xo, yb, zb), (xo + thick, yb, zb), (xo + thick, ya, za)], (0, -math.sin(mid), -math.cos(mid)))
            # 拱圈（石材，外凸 6 cm、寬 0.32）＋拱心石＋拱墩（起拱處一塊外凸的石材）
            rm = acc(ringkey); I_, O_ = arc(z, SPRING, r, NSEG_A), arc(z, SPRING, r + 0.32, NSEG_A)
            for k in range(NSEG_A):
                face(rm, [fo.p(*I_[k], 0.06), fo.p(*I_[k + 1], 0.06), fo.p(*O_[k + 1], 0.06), fo.p(*O_[k], 0.06)], fo.N)
                mid = math.pi * (1 - (k + 0.5) / NSEG_A)
                strip(rm, fo, O_[k], O_[k + 1], 0, 0.06, (math.cos(mid), math.sin(mid), 0))
            box(acc('trim'), xo - 0.1, xo + 0.05, SPRING + r - 0.05, SPRING + r + 0.55, z - 0.28, z + 0.28, skip=('right',))   # 拱心石
            for s in (-1, 1):   # 拱墩：起拱處洞口兩旁各一塊石材（穿過牆、兩面各凸一點）
                za_, zb_ = sorted((z + s * r, z + s * (r + 0.36)))
                box(acc('trim'), xo - 0.1, xo + thick + 0.05, SPRING - 0.22, SPRING, za_, zb_, skip=())
        for (zz, s, xa, xb) in ends:   # 牆頭（只做看得到的那一段）
            face(m, [(xa, P, zz), (xb, P, zz), (xb, F2 - 0.6, zz), (xa, F2 - 0.6, zz)], (0, 0, s))
        return holes

    # 中間紅磚段（凸 0.4，牆厚 1.0）＋兩旁白石翼牆（牆厚 0.6）
    cen = [a for a in ARCHES if a[2] == 'c']; wing = [a for a in ARCHES if a[2] == 'w']
    arcade_front(-ZC, ZC, AFC, TWC, 'pier', 'trim', cen, ends=((-ZC, -1, AFC, AFW), (ZC, 1, AFC, AFW)))   # 紅磚段兩端只有凸出的 0.4 m 看得到
    for s in (-1, 1):
        za, zb = sorted((s * ZC, s * ZW))
        arcade_front(za, zb, AFW, TWW, 'col', 'trim', [a for a in wing if a[0] * s > 0])
    # 紅磚段比白石翼凸出 0.4：凸出的側面（簷口以下）由 arcade_front 兩端的牆頭蓋住了（紅磚段兩端 z=±ZC、x 81.6～82.6）
    # 導航：正面牆（拱的位置留開口）
    def front_blocks(z0, z1, xo, thick, arches, why):
        cur = z0
        for (z, r, _) in sorted(arches):
            if z - r > cur: blk(xo, cur, xo + thick, z - r, why)
            cur = z + r
        if z1 > cur: blk(xo, cur, xo + thick, z1, why)
    front_blocks(-ZC, ZC, AFC, TWC, cen, '拱廊正面（紅磚段）的牆')
    for s in (-1, 1):
        za, zb = sorted((s * ZC, s * ZW)); front_blocks(za, zb, AFW, TWW, [a for a in wing if a[0] * s > 0], '拱廊正面（白石翼）的牆')
    # 走道：天花板、兩端實牆、後牆（大門、玻璃店面）
    face(acc('ceil'), [(XIN, CEIL, -ZA), (XIN, CEIL, ZA), (AB, CEIL, ZA), (AB, CEIL, -ZA)], (0, -1, 0))
    for s in (-1, 1):
        face(acc('base'), [(XIN, P, s * ZA), (AB, P, s * ZA), (AB, CEIL, s * ZA), (XIN, CEIL, s * ZA)], (0, 0, -s))   # v3.2：白石 → 花崗石（和後牆一樣）
        blk(XIN - 0.05, s * ZA, AB + 0.1, s * ZW, '拱廊走道兩端的實牆')
    fb = FW(AB); holes = []
    for (z, r, kind) in ARCHES:
        if abs(z) < 1e-6:
            continue
        holes.append(window(fb, z, P + 0.25, 2.4 if kind == 'c' else 2.2, 3.2, 0.14, lit_hash(7, z), rect_=True, dep=0.12, proud=0.04, sill=False, mull=2, trans=1))
    # 大門：雙開玻璃門（2.9 m 寬、3.1 m 高）＋上面一扇橫窗；石材門框
    door_w, door_h = 2.9, 3.1
    rr = door_w / 2
    rect(acc('trimw'), fb, -rr - 0.22, -rr, P, P + door_h + 1.25, 0.05); rect(acc('trimw'), fb, rr, rr + 0.22, P, P + door_h + 1.25, 0.05)
    rect(acc('trimw'), fb, -rr - 0.22, rr + 0.22, P + door_h + 1.25, P + door_h + 1.47, 0.05)
    strip(acc('trimw'), fb, (-rr - 0.22, P), (-rr - 0.22, P + door_h + 1.47), 0, 0.05, (-1, 0, 0)); strip(acc('trimw'), fb, (rr + 0.22, P), (rr + 0.22, P + door_h + 1.47), 0, 0.05, (1, 0, 0))
    strip(acc('trimw'), fb, (-rr - 0.22, P + door_h + 1.47), (rr + 0.22, P + door_h + 1.47), 0, 0.05, (0, 1, 0))
    for s_ in (-1, 1): strip(acc('trimw'), fb, (s_ * rr, P), (s_ * rr, P + door_h + 1.25), 0.05, -0.1, (-s_, 0, 0))   # 門框內側
    strip(acc('trimw'), fb, (-rr, P + door_h + 1.25), (rr, P + door_h + 1.25), 0.05, -0.1, (0, -1, 0))
    fm = acc('frame')
    for (a, b) in ((-rr, -0.02), (0.02, rr)):
        rect(fm, fb, a, a + 0.09, P, P + door_h, -0.02); rect(fm, fb, b - 0.09, b, P, P + door_h, -0.02)
        rect(fm, fb, a + 0.09, b - 0.09, P + door_h - 0.12, P + door_h, -0.02); rect(fm, fb, a + 0.09, b - 0.09, P, P + 0.18, -0.02)
        hx = b - 0.16 if a < 0 else a + 0.16; rect(fm, fb, hx - 0.02, hx + 0.02, P + 0.85, P + 1.65, 0.03)
        glass_face(fb, [(a + 0.09, P + 0.18), (b - 0.09, P + 0.18), (b - 0.09, P + door_h - 0.12), (a + 0.09, P + door_h - 0.12)], -0.06, True, P, P + door_h)
    rect(fm, fb, -rr, rr, P + door_h, P + door_h + 0.1, -0.02)
    rect(fm, fb, -rr - 0.05, rr + 0.05, P, P + door_h + 1.3, -0.16)   # 門後面一片深色底板（遊戲內 11-02：兩扇門中間的縫看得到後面的草地，一條綠線；campus_hall.py 10-21 同一個問題）
    glass_face(fb, [(-rr, P + door_h + 0.1), (rr, P + door_h + 0.1), (rr, P + door_h + 1.25), (-rr, P + door_h + 1.25)], -0.08, True, P + door_h, P + door_h + 1.25)
    rect(fm, fb, -0.03, 0.03, P + door_h + 0.1, P + door_h + 1.25, -0.04)
    holes.append({'u': 0.0, 'a': rr + 0.22, 'vb': P, 'vs': P + door_h + 1.47, 'arch': False, 'vt': P + door_h + 1.47})
    wall_strip(fb, -ZA, ZA, P, CEIL, holes, 'base')   # v3.2（BB_234 ①）：拱廊後牆白石 → 花崗石（#a8a49c，比白石暗；照片裡拱裡面是暗的、看得出深度）。用現有的材質，不多 draw call
    # v3.2（BB_234 ①）：拱廊裡的吊燈——中間三拱各一盞，從拱廊天花板垂下來；四面玻璃（亮燈那一半 UV：和亮著的窗一樣，晚上才亮）
    def lantern(xc, zc):
        fm_ = acc('frame'); s_ = 0.2; y0, y1 = CEIL - 1.55, CEIL - 0.95
        box(fm_, xc - 0.012, xc + 0.012, y1 + 0.16, CEIL, zc - 0.012, zc + 0.012)                          # 吊桿
        box(fm_, xc - s_ - 0.04, xc + s_ + 0.04, y1, y1 + 0.16, zc - s_ - 0.04, zc + s_ + 0.04)            # 頂蓋
        box(fm_, xc - s_ - 0.03, xc + s_ + 0.03, y0 - 0.06, y0, zc - s_ - 0.03, zc + s_ + 0.03)            # 底座
        for (dx, dz) in ((-1, -1), (-1, 1), (1, -1), (1, 1)):                                              # 四根角柱
            box(fm_, xc + dx * s_ - 0.016, xc + dx * s_ + 0.016, y0, y1, zc + dz * s_ - 0.016, zc + dz * s_ + 0.016, skip=('top', 'bottom'))
        for fr_, uc_ in ((FW(xc - s_), zc), (FE(xc + s_), -zc), (FN(zc - s_), -xc), (FS(zc + s_), xc)):
            glass_face(fr_, [(uc_ - s_ + 0.016, y0), (uc_ + s_ - 0.016, y0), (uc_ + s_ - 0.016, y1), (uc_ - s_ + 0.016, y1)], 0.0, True, y0, y1)
    for (z, r, kind) in ARCHES:
        if kind == 'c': lantern((XIN + AB) / 2, z)
    blk(AB - 0.02, -ZA, AB + 0.6, ZA, '拱廊後牆（大門在 z=0，遊戲的門口互動點 (86.4,0)）')
    # 簷口帶（6.0～6.6）＋露台的女兒牆（6.6～7.5）：沿正面（紅磚段在 81.6、白石翼在 82.0）
    for (z0, z1, xo) in ((-ZC, ZC, AFC), (-ZW, -ZC, AFW), (ZC, ZW, AFW)):
        fr = FW(xo)
        band(fr, z0, z1, F2 - 0.6, F2 - 0.42, 0.18, ends=True)
        band(fr, z0, z1, F2 - 0.42, F2, 0.06, key='trim', ends=True, bottom=False)
        rect(acc('trim'), fr, z0, z1, F2, F2 + 0.9, 0.0)                                         # 女兒牆正面
        face(acc('trim'), [(xo, F2 + 0.9, z0), (xo, F2 + 0.9, z1), (xo + 0.3, F2 + 0.9, z1), (xo + 0.3, F2 + 0.9, z0)], (0, 1, 0))
        face(acc('trim'), [(xo + 0.3, F2, z0), (xo + 0.3, F2, z1), (xo + 0.3, F2 + 0.9, z1), (xo + 0.3, F2 + 0.9, z0)], (1, 0, 0))
        band(fr, z0, z1, F2 + 0.9, F2 + 1.0, 0.06, ends=True)                                    # 女兒牆壓頂
    for zz, s in ((-ZW, -1), (ZW, 1)):                                                            # 兩端的側面（白石實牆，從地面到露台女兒牆的高度；到端部量體的正面）
        face(acc('white'), [(AFW, 0, zz), (XLOW, 0, zz), (XLOW, F2 + 0.9, zz), (AFW, F2 + 0.9, zz)], (0, 0, s))
    for s in (-1, 1):                                                                             # 紅磚段比翼牆凸出：女兒牆、簷口那一段的側面
        face(acc('trim'), [(AFC, F2 - 0.6, s * ZC), (AFW, F2 - 0.6, s * ZC), (AFW, F2 + 1.0, s * ZC), (AFC, F2 + 1.0, s * ZC)], (0, 0, s))
    # 露台地面（6.6，從女兒牆後面到上面各量體的正面）
    for (z0, z1, xo) in ((-ZC, ZC, AFC), (-ZW, -ZC, AFW), (ZC, ZW, AFW)):
        face(acc('flat'), [(xo + 0.3, F2 + 0.01, z0), (xo + 0.3, F2 + 0.01, z1), (XLOW, F2 + 0.01, z1), (XLOW, F2 + 0.01, z0)], (0, 1, 0))
    # 大拱窗下的白石匾額（紅磚段女兒牆中間，招牌「總圖書館」在這裡）
    box(acc('trim'), AFC - 0.12, AFC + 0.3, F2 + 0.15, F2 + 1.35, -3.1, 3.1, skip=('right', 'bottom'))
    plate = Mesh('PLATE_FACE_LIB', M['board'])
    face(plate, [(AFC - 0.125, F2 + 0.35, -2.6), (AFC - 0.125, F2 + 0.35, 2.6), (AFC - 0.125, F2 + 1.15, 2.6), (AFC - 0.125, F2 + 1.15, -2.6)], (-1, 0, 0))
    lay['cams'].append([AFC, P, -ZW, AB + 0.6, F2 + 1.0, ZW])   # 拱廊這一層（鏡頭不穿進去：拱廊走道裡的鏡頭靠網點透空的柱墩）

    # =====================================================================
    # 三、二樓以上的量體（中央山牆量體、退縮帶、磚塔、外翼、端部）——z ≥ 0 定義，北邊（z<0）鏡射
    # =====================================================================
    # (z0, z1, 正面 x, [(到哪個 x, 頂高)…])：高度沿 x 分段
    BL = [(0.0, GW, XPAV, [(99.0, EAVE), (XBACK, ROOF)]),
          (GW, BAYZ0, XSTRIP, [(XBACK, ROOF)]),
          (BAYZ0, BAYZ1, XBAY, [(BAYX1, BAYTOP), (XBACK, ROOF)]),
          (BAYZ1, OWZ, XOW, [(XBACK, ROOF)]),
          (OWZ, ZW, XLOW, [(XBACK, LOWTOP)])]

    def hgt(b, x):
        if b is None or x < b[2] - 1e-6: return F2
        for (xe, h) in b[3]:
            if x < xe - 1e-6: return h
        return F2

    for s in (-1, 1):
        def Z(z): return s * z
        for i, b in enumerate(BL):
            z0, z1, xf, prof = b
            za, zb = sorted((Z(z0), Z(z1)))
            # 屋頂（平的部分；中央山牆量體的前段是斜屋頂，另外做）
            xs = xf
            for (xe, h) in prof:
                if not (i == 0 and xe == 99.0):
                    face(acc('flat'), [(xs, h, za), (xs, h, zb), (xe, h, zb), (xe, h, za)], (0, 1, 0))
                xs = xe
            # 量體內部的高低段（磚塔後面、山牆量體後面）：朝東的牆
            for (xa, ha), (xb2, hb) in zip(prof, prof[1:]):
                if ha > hb and i != 0: face(acc('wall'), [(xa, hb, za), (xa, hb, zb), (xa, ha, zb), (xa, ha, za)], (1, 0, 0))
            # 和外側（z 較大）那一塊之間的側牆
            nb = BL[i + 1] if i + 1 < len(BL) else None
            zz = Z(z1); xsb = sorted(set([xf] + [p[0] for p in prof] + ([nb[2]] + [p[0] for p in nb[3]] if nb else [])))
            xsb = [x for x in xsb if x >= min(xf, nb[2] if nb else xf) - 1e-6]
            for xa, xb2 in zip(xsb, xsb[1:]):
                xm = (xa + xb2) / 2; ha, hb = hgt(b, xm), hgt(nb, xm)
                if nb is None and xm >= xf: hb = F2      # 最外面（z=±ZW）：一樓那一段另外做
                if ha > hb + 1e-6:
                    face(acc('wall'), [(xa, hb, zz), (xb2, hb, zz), (xb2, ha, zz), (xa, ha, zz)], (0, 0, s))
                elif hb > ha + 1e-6 and nb is not None:
                    face(acc('wall'), [(xa, ha, zz), (xb2, ha, zz), (xb2, hb, zz), (xa, hb, zz)], (0, 0, -s))
            # 背面（x=XBACK，從地面到頂）
            hb_ = prof[-1][1]
            face(acc('wall'), [(XBACK, 0, za), (XBACK, 0, zb), (XBACK, hb_, zb), (XBACK, hb_, za)], (1, 0, 0))
            box(acc('trim'), XBACK - 0.02, XBACK + 0.18, hb_ - 0.5, hb_ + 0.15, za, zb, skip=('left', 'bottom'))
        # 兩端（z=±ZW）一樓的側牆：從端部量體正面到背面
        face(acc('wall'), [(XLOW, 0, s * ZW), (XBACK, 0, s * ZW), (XBACK, F2, s * ZW), (XLOW, F2, s * ZW)], (0, 0, s))

    # ---- 各量體的正面（窗）----
    def upper_front(z0, z1, xf, top, cols, key='wall', fl_top=5):
        """一般的正面：z0..z1（世界 z），每層 cols 的窗（u＝z）"""
        fr = FW(xf); holes = []
        for fl in range(2, fl_top + 1):
            for j, (u, ww, wh, kind) in enumerate(cols):
                holes.append(window(fr, u, floor_vb(fl), ww, wh, 0.08, lit_hash(1, fl, u), rect_=(kind == 'r'), mull=1 if ww > 1.3 else 0, proud=0.04))
        bands = [(F2 + (fl - 2) * FH, F2 + (fl - 1) * FH) for fl in range(2, fl_top + 1)]
        if top > bands[-1][1] + 1e-6: bands.append((bands[-1][1], top))
        wall_bands(fr, z0, z1, bands, holes, key)
        band(fr, z0, z1, top - 0.5, top + 0.15, 0.22, key='trim')                         # 簷口

    for s in (-1, 1):
        # 退縮帶（10.6～12.4）：一列窄窗
        za, zb = sorted((s * GW, s * BAYZ0)); upper_front(za, zb, XSTRIP, ROOF, [(s * 11.5, 0.8, 1.7, 'r')])
        # 外翼（21.2～26.6）：兩列白框窗
        za, zb = sorted((s * BAYZ1, s * OWZ)); upper_front(za, zb, XOW, ROOF, [(s * 22.7, 1.3, 1.9, 'r'), (s * 25.2, 1.3, 1.9, 'r')])
        # 端部（26.6～30）：一列、到四樓
        za, zb = sorted((s * OWZ, s * ZW)); upper_front(za, zb, XLOW, LOWTOP, [(s * 28.3, 1.2, 1.8, 'r')], fl_top=4)

    # ---- 磚塔（12.4～21.2）----
    for s in (-1, 1):
        za, zb = sorted((s * BAYZ0, s * BAYZ1)); c = s * BAYC; fr = FW(XBAY); holes = []
        for fl in range(2, 6):                                                           # 兩旁的小窗（每層一扇）
            for du in (-3.3, 3.3):
                holes.append(window(fr, c + du, floor_vb(fl), 0.95, 1.6, 0.08, lit_hash(2, fl, c + du), rect_=True, mull=0, proud=0.04))
        # 中間一排白框窗
        holes.append(window(fr, c - 0.85, floor_vb(2, 0.7), 1.15, 2.0, 0.2, lit_hash(3, c, 2), rect_=True, mull=0, trans=1))      # 二樓雙窗
        holes.append(window(fr, c + 0.85, floor_vb(2, 0.7), 1.15, 2.0, 0.2, lit_hash(3, c, 3), rect_=True, mull=0, trans=1))
        holes.append(window(fr, c, floor_vb(3, 0.8), 2.6, 2.0, 0.32, lit_hash(3, c, 4), rect_=True, mull=2, sill=False))           # 三樓寬窗（下面小陽台）
        holes.append(window(fr, c, floor_vb(4, 0.45), 2.4, 2.75, 0.38, lit_hash(3, c, 5), rect_=False, mull=1))                  # 四樓拱窗（拱頂外框到這一層的頂）
        holes.append(window(fr, c, floor_vb(5, 0.7), 1.9, 1.8, 0.3, lit_hash(3, c, 6), rect_=True, mull=1))                      # 五樓
        holes.append(window(fr, c, ROOF + 0.55, 1.5, 1.4, 0.32, lit_hash(3, c, 7), rect_=True, mull=1))                         # 頂層
        wall_bands(fr, za, zb, [(F2 + k * FH, F2 + (k + 1) * FH) for k in range(4)] + [(ROOF, BAYTOP)], holes)
        # 三樓的小陽台（白石板＋欄板）
        vb3 = floor_vb(3, 0.8)
        box(acc('trim'), XBAY - 0.75, XBAY, vb3 - 0.18, vb3, c - 1.8, c + 1.8, skip=('right',))
        box(acc('trim'), XBAY - 0.75, XBAY - 0.6, vb3, vb3 + 0.95, c - 1.8, c + 1.8, skip=('right', 'bottom'))
        # 頂層的白框（把頂層窗框起來的白石面）＋ 塔頂白色壓頂
        rect(acc('trim'), fr, c - 1.9, c + 1.9, ROOF + 0.2, ROOF + 2.25, 0.08)
        band(fr, za, zb, BAYTOP - 0.1, BAYTOP + 0.6, 0.3, key='trim')
        box(acc('trim'), XBAY - 0.3, BAYX1 + 0.3, BAYTOP + 0.6, BAYTOP + 0.75, za - 0.3, zb + 0.3, skip=())
        band(fr, za, zb, F2 + 3 * FH - 0.1, F2 + 3 * FH + 0.1, 0.08)          # 五樓樓板一條白線（照片：磚塔上半截有一條）
        # 中間那一排上下：白石的窗間板（二～四樓窗之間）
        for (va, vb_) in ((floor_vb(2, 0.7) + 2.0 + 0.3, floor_vb(3, 0.8) - 0.18), (floor_vb(3, 0.8) + 2.0 + 0.32, floor_vb(4, 0.45))):
            rect(acc('trim'), fr, c - 1.5, c + 1.5, va, vb_, 0.05)
    # ---- 中央山牆量體（|z| ≤ 10.6）----
    fr = FW(XPAV); frw = FW(XPAV + 0.35)
    # 白石面（|z| ≤ 7.2、凹進去 0.35）：大拱窗、兩旁小窗、浮雕方塊；頂是小山牆
    GR = 3.05; gvb, gvt = 8.0, 16.6; gvs = gvt - GR
    hole_big = {'u': 0.0, 'a': GR + 0.45, 'vb': gvb - 0.3, 'vs': gvs, 'arch': True, 'vt': gvt + 0.45, 'n': 16}
    small = []
    for s in (-1, 1):
        for (vb_, h_) in ((F2 + 0.75, 1.7), (F2 + FH + 0.75, 1.7)):
            small.append(window(frw, s * 5.2, vb_, 1.4, h_, 0.22, lit_hash(5, s, vb_), rect_=True, mull=1, sill=True))
    wm = acc('white')
    # 白石面：用 wall_strip 開大拱窗和小窗，頂到白石小山牆的屋簷高度；屋簷以上是三角形
    wall_strip(frw, -GR - 0.45, GR + 0.45, F2 + 0.3, WEAVE, [hole_big], 'white', n=16)                       # 中間一欄：大拱窗
    for s in (-1, 1):                                                                                        # 兩旁：上下兩扇小窗（分兩條帶子）
        a_, b_ = sorted((s * (GR + 0.45), s * WF))
        wall_bands(frw, a_, b_, [(F2 + 0.3, F2 + FH + 0.3), (F2 + FH + 0.3, WEAVE)], [h for h in small if h['u'] * s > 0], 'white')
    face(wm, [frw.p(-WF, WEAVE), frw.p(WF, WEAVE), frw.p(0, WPEAK)], frw.N)
    # 大拱窗：石材拱圈（0.45 寬、外凸 0.12）＋窗洞內側＋窗櫺（扇形的放射櫺＋下面方格）＋玻璃
    tw = acc('trimw'); I_, O_ = arc(0, gvs, GR, 16), arc(0, gvs, GR + 0.45, 16)
    for k in range(16):
        face(tw, [frw.p(*I_[k], 0.12), frw.p(*I_[k + 1], 0.12), frw.p(*O_[k + 1], 0.12), frw.p(*O_[k], 0.12)], frw.N)
        mid = math.pi * (1 - (k + 0.5) / 16); strip(tw, frw, O_[k], O_[k + 1], 0, 0.12, (math.cos(mid), math.sin(mid), 0))
        strip(tw, frw, I_[k], I_[k + 1], 0.12, -0.42, (-math.cos(mid), -math.sin(mid), 0))
    for s in (-1, 1):
        rect(tw, frw, s * GR if s > 0 else -GR - 0.45, GR + 0.45 if s > 0 else -GR, gvb - 0.3, gvs, 0.12)
        strip(tw, frw, (s * (GR + 0.45), gvb - 0.3), (s * (GR + 0.45), gvs), 0, 0.12, (s, 0, 0))
        strip(tw, frw, (s * GR, gvb), (s * GR, gvs), 0.12, -0.42, (-s, 0, 0))
    rect(tw, frw, -GR - 0.45, GR + 0.45, gvb - 0.3, gvb, 0.12); strip(tw, frw, (-GR, gvb), (GR, gvb), 0.12, -0.42, (0, 1, 0))
    strip(tw, frw, (-GR - 0.45, gvb - 0.3), (GR + 0.45, gvb - 0.3), 0, 0.12, (0, -1, 0))
    glass_face(frw, [(-GR, gvb), (GR, gvb)] + arc(0, gvs, GR, 16, 0.0, math.pi), -0.42, True, gvb, gvt)   # 晚上亮（大廳的燈）
    fm = acc('frame'); dd = -0.38
    for zc in (-GR * 2 / 3, -GR / 3, 0.0, GR / 3, GR * 2 / 3):                                      # 下面的直櫺（五根）
        rect(fm, frw, zc - 0.05, zc + 0.05, gvb, gvs, dd)
    for k in range(1, 4):                                                                          # 下面的橫櫺
        vm = gvb + (gvs - gvb) * k / 4; rect(fm, frw, -GR, GR, vm - 0.05, vm + 0.05, dd)
    rect(fm, frw, -GR, GR, gvs - 0.07, gvs + 0.07, dd)
    for k in range(1, 8):                                                                          # 扇形的放射櫺
        a = math.pi * k / 8; ca, sa = math.cos(a), math.sin(a); r0, r1 = GR * 0.32, GR - 0.04
        p0, p1 = (r0 * ca, gvs + r0 * sa), (r1 * ca, gvs + r1 * sa); nx, ny = -sa * 0.045, ca * 0.045
        face(fm, [frw.p(p0[0] - nx, p0[1] - ny, dd), frw.p(p1[0] - nx, p1[1] - ny, dd), frw.p(p1[0] + nx, p1[1] + ny, dd), frw.p(p0[0] + nx, p0[1] + ny, dd)], frw.N)
    Ia, Oa = arc(0, gvs, GR * 0.32 - 0.05, 8), arc(0, gvs, GR * 0.32 + 0.05, 8)                    # 扇心的小半圓
    for k in range(8): face(fm, [frw.p(*Ia[k], dd), frw.p(*Ia[k + 1], dd), frw.p(*Oa[k + 1], dd), frw.p(*Oa[k], dd)], frw.N)
    Ia, Oa = arc(0, gvs, GR * 0.68 - 0.05, 12), arc(0, gvs, GR * 0.68 + 0.05, 12)
    for k in range(12): face(fm, [frw.p(*Ia[k], dd), frw.p(*Ia[k + 1], dd), frw.p(*Oa[k + 1], dd), frw.p(*Oa[k], dd)], frw.N)
    # 浮雕方塊（白石面兩旁、四樓那一格）＋ 兩旁窗之間的石材線
    for s in (-1, 1):
        box(acc('trim'), XPAV + 0.35 - 0.1, XPAV + 0.35, 14.3, 16.0, s * 5.2 - 0.85, s * 5.2 + 0.85, skip=('right',))
        box(acc('trim'), XPAV + 0.35 - 0.16, XPAV + 0.35 - 0.1, 14.6, 15.7, s * 5.2 - 0.55, s * 5.2 + 0.55, skip=('right',))
    # v3.2（BB_234 ③）：白石面的線腳——兩邊的壁柱、上下兩排小窗之間的腰帶、小山牆下兩層的簷口、大拱窗的拱心石和拱墩（都是白石 trim，不多 draw call）
    XW = XPAV + 0.35; tm2 = acc('trim')
    for s in (-1, 1):
        za, zb = sorted((s * (WF - 0.42), s * WF))
        box(tm2, XW - 0.07, XW, F2 + 0.3, WEAVE - 0.32, za, zb, skip=('right', 'front' if s > 0 else 'back'))   # 壁柱（貼著紅磚框的那一面不做：和凹面同一個平面會閃）
        za, zb = sorted((s * (GR + 0.45), s * (WF - 0.42)))
        box(tm2, XW - 0.1, XW, F2 + FH + 0.14, F2 + FH + 0.34, za, zb, skip=('right', 'back' if s > 0 else 'front'))   # 腰帶（靠大拱窗框那一端貼著拱框，不做）
        za, zb = sorted((s * (GR - 0.05), s * (GR + 0.6)))
        box(tm2, XW - 0.2, XW, gvs - 0.3, gvs, za, zb, skip=('right',))                                             # 大拱窗的拱墩
    box(tm2, XW - 0.24, XW, WEAVE - 0.32, WEAVE - 0.08, -WF - 0.08, WF + 0.08, skip=('right',))                      # 小山牆下的簷口（兩端埋進紅磚框）
    box(tm2, XW - 0.32, XW, WEAVE - 0.08, WEAVE + 0.02, -WF - 0.14, WF + 0.14, skip=('right',))
    box(tm2, XW - 0.22, XW, gvs + GR + 0.3, gvs + GR + 1.05, -0.32, 0.32, skip=('right',))                            # 大拱窗的拱心石
    # 白石面四周的凹面（紅磚框的內側面）
    for s in (-1, 1):
        face(acc('wall'), [(XPAV, F2 + 0.3, s * WF), (XPAV + 0.35, F2 + 0.3, s * WF), (XPAV + 0.35, WEAVE, s * WF), (XPAV, WEAVE, s * WF)], (0, 0, -s))
        face(acc('wall'), [(XPAV, WEAVE, s * WF), (XPAV + 0.35, WEAVE, s * WF), (XPAV + 0.35, WPEAK, 0), (XPAV, WPEAK, 0)], (0, -1, -s * 0.2))
    face(acc('wall'), [(XPAV, F2 + 0.3, -WF), (XPAV, F2 + 0.3, WF), (XPAV + 0.35, F2 + 0.3, WF), (XPAV + 0.35, F2 + 0.3, -WF)], (0, 1, 0))
    # 紅磚框：兩側（7.2～10.6，開細高的拱頂長窗）＋ 白石面上面那一段（到山牆斜邊）＋ 下緣（F2～F2+0.3）
    for s in (-1, 1):
        za, zb = sorted((s * WF, s * GW)); uc = s * 8.9
        h = window(fr, uc, F2 + 0.7, 1.15, 11.2, 0.24, lit_hash(6, s), rect_=False, mull=0, trans=3)
        wall_strip(fr, za, zb, F2, EAVE, [h])
    rect(acc('wall'), fr, -WF, WF, F2, F2 + 0.3)
    yz = lambda z: EAVE + (PEAK - EAVE) * (1 - abs(z) / GW)                                        # 山牆斜邊的高度
    face(acc('wall'), [fr.p(-WF, WEAVE), fr.p(0, WPEAK), fr.p(0, PEAK), fr.p(-WF, yz(WF))], fr.N)
    face(acc('wall'), [fr.p(0, WPEAK), fr.p(WF, WEAVE), fr.p(WF, yz(WF)), fr.p(0, PEAK)], fr.N)
    for s in (-1, 1):
        face(acc('wall'), [fr.p(s * WF, EAVE), fr.p(s * GW, EAVE), fr.p(s * WF, yz(WF))] if s > 0 else [fr.p(s * GW, EAVE), fr.p(s * WF, EAVE), fr.p(s * WF, yz(WF))], fr.N)
    # 圓窗（白石圈＋深色玻璃）
    cy, R = 22.4, 0.78; n = 20; tw = acc('trimw')
    I = [(R * math.cos(2 * math.pi * k / n), cy + R * math.sin(2 * math.pi * k / n)) for k in range(n)]
    O = [(1.35 * R * math.cos(2 * math.pi * k / n), cy + 1.35 * R * math.sin(2 * math.pi * k / n)) for k in range(n)]
    for k in range(n):
        k1 = (k + 1) % n; am = 2 * math.pi * (k + 0.5) / n
        face(tw, [fr.p(*I[k], 0.08), fr.p(*I[k1], 0.08), fr.p(*O[k1], 0.08), fr.p(*O[k], 0.08)], fr.N)
        face(tw, [fr.p(*O[k], 0.0), fr.p(*O[k1], 0.0), fr.p(*O[k1], 0.08), fr.p(*O[k], 0.08)], fr.dirv(math.cos(am), math.sin(am), 0))
    glass_face(fr, I, 0.02, False, cy - R, cy + R, dark=True)
    # 山牆的斜簷：紅磚帶（外凸 0.35、高 0.55）＋白色壓頂＋齒狀線腳；山牆屋簷那一條水平的白石線
    for s in (-1, 1):
        a, b = (s * (GW + 0.3), EAVE - 0.15), (0.0, PEAK + 0.25)
        Ln = math.hypot(b[0] - a[0], b[1] - a[1]); tx, ty = (b[0] - a[0]) / Ln, (b[1] - a[1]) / Ln; nx, ny = -ty * s, tx * s
        if ny < 0: nx, ny = -nx, -ny
        def P2(p, o, d=0.0): return fr.p(p[0] + nx * o, p[1] + ny * o, d)
        face(acc('wall'), [P2(a, -0.55, 0.35), P2(b, -0.55, 0.35), P2(b, 0.0, 0.35), P2(a, 0.0, 0.35)], fr.N)          # 正面
        face(acc('wall'), [P2(a, -0.55, 0.0), P2(b, -0.55, 0.0), P2(b, -0.55, 0.35), P2(a, -0.55, 0.35)], fr.dirv(-nx, -ny, 0))   # 下面
        face(acc('trim'), [P2(a, 0.0, 0.42), P2(b, 0.0, 0.42), P2(b, 0.14, 0.42), P2(a, 0.14, 0.42)], fr.N)           # 白色壓頂（正面）
        face(acc('trim'), [P2(a, 0.14, -0.3), P2(b, 0.14, -0.3), P2(b, 0.14, 0.42), P2(a, 0.14, 0.42)], fr.dirv(nx, ny, 0))   # 壓頂上面
        face(acc('trim'), [P2(a, 0.0, 0.35), P2(b, 0.0, 0.35), P2(b, 0.0, 0.42), P2(a, 0.0, 0.42)], fr.dirv(-nx, -ny, 0))
        nd = int(Ln / 0.38)
        for k in range(1, nd):                                                                    # 齒狀線腳（斜簷下面一排小方塊）
            t_ = k / nd; cx_, cy_ = a[0] + (b[0] - a[0]) * t_, a[1] + (b[1] - a[1]) * t_
            q = [(cx_ + tx * dx + nx * dy, cy_ + ty * dx + ny * dy) for dx, dy in ((-0.09, -0.78), (0.09, -0.78), (0.09, -0.55), (-0.09, -0.55))]
            face(acc('trim'), [fr.p(*q[0], 0.22), fr.p(*q[1], 0.22), fr.p(*q[2], 0.22), fr.p(*q[3], 0.22)], fr.N)
            face(acc('trim'), [fr.p(*q[0], 0.0), fr.p(*q[1], 0.0), fr.p(*q[1], 0.22), fr.p(*q[0], 0.22)], fr.dirv(-nx, -ny, 0))
            face(acc('trim'), [fr.p(*q[0], 0.0), fr.p(*q[3], 0.0), fr.p(*q[3], 0.22), fr.p(*q[0], 0.22)], fr.dirv(-tx, -ty, 0))
            face(acc('trim'), [fr.p(*q[1], 0.0), fr.p(*q[2], 0.0), fr.p(*q[2], 0.22), fr.p(*q[1], 0.22)], fr.dirv(tx, ty, 0))
    band(fr, -GW - 0.3, GW + 0.3, EAVE - 0.35, EAVE - 0.15, 0.3, key='trim')
    # 山牆後面的斜屋頂（屋瓦，到 x=99；後面是三角形的山牆端牆）
    rm = acc('roof'); xr0, xr1 = XPAV + 0.3, 99.0
    for s in (-1, 1):
        face(rm, [(xr0, EAVE - 0.1, s * (GW + 0.3)), (xr1, EAVE - 0.1, s * (GW + 0.3)), (xr1, PEAK + 0.15, 0), (xr0, PEAK + 0.15, 0)], (0, 1, 0))
    face(acc('wall'), [(xr1, EAVE - 0.1, -GW - 0.3), (xr1, EAVE - 0.1, GW + 0.3), (xr1, PEAK + 0.15, 0)], (1, 0, 0))
    face(acc('wall'), [(xr1, ROOF, -GW), (xr1, ROOF, GW), (xr1, EAVE - 0.1, GW + 0.3), (xr1, EAVE - 0.1, -GW - 0.3)], (1, 0, 0))
    box(acc('frame'), xr0, xr1, PEAK + 0.1, PEAK + 0.3, -0.12, 0.12, skip=('bottom',))

    # 四坡屋頂（使用者 11-02 給的行政入口鳥瞰圖：主體、磚塔上面是深灰藍的四坡屋頂；從地面只看得到一點，從高處、遠處看得到）
    def hip(x0, x1, z0, z1, y, rise, over=0.45):
        x0 -= over; x1 += over; z0 -= over; z1 += over; w, d = x1 - x0, z1 - z0; rm = acc('roof')
        if w >= d:
            r = d / 2; A, Bq = (x0 + r, y + rise, (z0 + z1) / 2), (x1 - r, y + rise, (z0 + z1) / 2)
            face(rm, [(x0, y, z0), (x1, y, z0), Bq, A], (0, 1, -1)); face(rm, [(x0, y, z1), A, Bq, (x1, y, z1)], (0, 1, 1))
            face(rm, [(x0, y, z0), A, (x0, y, z1)], (-1, 1, 0)); face(rm, [(x1, y, z0), (x1, y, z1), Bq], (1, 1, 0))
        else:
            r = w / 2; A, Bq = ((x0 + x1) / 2, y + rise, z0 + r), ((x0 + x1) / 2, y + rise, z1 - r)
            face(rm, [(x0, y, z0), (x0, y, z1), Bq, A], (-1, 1, 0)); face(rm, [(x1, y, z0), A, Bq, (x1, y, z1)], (1, 1, 0))
            face(rm, [(x0, y, z0), A, (x1, y, z0)], (0, 1, -1)); face(rm, [(x0, y, z1), (x1, y, z1), Bq], (0, 1, 1))
        face(acc('ceil'), [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], (0, -1, 0))      # 屋簷底下
    for s in (-1, 1):
        za, zb = sorted((s * BAYZ0, s * BAYZ1)); hip(XBAY + 0.4, BAYX1 - 0.2, za + 0.3, zb - 0.3, BAYTOP + 0.75, 1.6, 0.0)   # 磚塔（白色壓頂裡面；從地面只露出一點）
    hip(99.4, XBACK - 0.6, -ZW + 0.6, ZW - 0.6, ROOF + 0.15, 4.2, 0.0)                                                    # 主體後半（山牆屋頂後面）

    # 二樓以上：鏡頭碰撞（各量體的盒子）
    lay['cams'].append([XBAY, F2, -ZW, XBACK, ROOF, ZW])
    lay['cams'].append([AB + 0.6, 0.0, -ZW, XBACK, F2, ZW])
    blk(AB + 0.6, -ZW, XBACK, ZW, '總圖主體')

    # =====================================================================
    # 四、北邊的方塔＋連接
    # =====================================================================
    T = TOWER; tx0, tx1, tz0, tz1 = T['x'] - T['s'] / 2, T['x'] + T['s'] / 2, T['z'] - T['s'] / 2, T['z'] + T['s'] / 2
    TH, BEL = T['h'], T['bel']
    frs = [FW(tx0), FE(tx1), FN(tz0), FS(tz1)]
    centers = [T['z'], -T['z'], -T['x'], T['x']]          # 每一面的 u 中心
    for fi, (frt, uc) in enumerate(zip(frs, centers)):
        u0, u1 = uc - T['s'] / 2, uc + T['s'] / 2
        holes = []
        for v in (8.2, 12.6, 17.0):                                                           # 塔身上的細窗
            holes.append(window(frt, uc, v, 0.6, 1.6, 0.1, lit_hash(8, fi, v), rect_=False, mull=0, sill=False, proud=0.04))
        wall_bands(frt, u0, u1, [(1.2, 10.4), (10.4, 14.8), (14.8, TH)], holes)
        rect(acc('white'), frt, u0, u1, 0.0, 1.2)                                              # 白石基座
        band(frt, u0 - 0.05, u1 + 0.05, 1.2, 1.4, 0.08)
        band(frt, u0 - 0.05, u1 + 0.05, F2 - 0.6, F2, 0.12)                                    # 和拱廊簷口同高的白色腰帶
        band(frt, u0 - 0.05, u1 + 0.05, 15.4, 15.75, 0.1)
        # 鐘樓層：每面兩個拱形開口（白石拱圈、裡面深色）
        hb = []
        for du in (-1.1, 1.1):
            hb.append(window(frt, uc + du, TH + 0.4, 1.1, 2.7, 0.26, False, rect_=False, mull=0, sill=False, dep=0.5))
        wall_strip(frt, u0, u1, TH, TH + BEL, hb)
        band(frt, u0 - 0.1, u1 + 0.1, TH - 0.2, TH + 0.25, 0.18)
        band(frt, u0 - 0.2, u1 + 0.2, TH + BEL, TH + BEL + 0.6, 0.35)                           # 簷口
        rect(acc('wall'), frt, u0 - 0.2, u1 + 0.2, TH + BEL + 0.6, TH + BEL + 1.5, 0.35)        # 女兒牆
        band(frt, u0 - 0.25, u1 + 0.25, TH + BEL + 1.5, TH + BEL + 1.65, 0.4)
    face(acc('flat'), [(tx0, TH + BEL + 0.6, tz0), (tx0, TH + BEL + 0.6, tz1), (tx1, TH + BEL + 0.6, tz1), (tx1, TH + BEL + 0.6, tz0)], (0, 1, 0))
    blk(tx0 - 0.1, tz0 - 0.1, tx1 + 0.1, tz1 + 0.1, '北邊的方塔')
    lay['cams'].append([tx0, 0.0, tz0, tx1, TH + BEL + 1.6, tz1])
    # ---------------- 完成 ----------------
    for k, m in accs.items():
        m.finish(root, uv=(k != 'glass'))
    uv01(plate.finish(root, uv=True, props={'text': '總圖書館', 'bg': '#e1dcd2', 'color': '#3b2a1e', 'serif': 1, 'fs': 0.7}))
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    L.write_json(out[:-4] + '.json', info)
    lay.update({'steps': {'x0': XST0, 'x1': XL, 'zHalf': ZST, 'n': NST, 'rise': RISE, 'tread': TREAD}, 'podium': P, 'door': {'x': AB, 'z': 0.0},
                'arches': [{'z': z, 'r': r, 'kind': k} for (z, r, k) in ARCHES], 'tower': TOWER})
    with open(out[:-4] + '.layout.json', 'w', encoding='utf-8') as f: json.dump(lay, f, ensure_ascii=False, indent=1)
    if render_dir: render(render_dir)
    return info


def render(d):
    """Blender 預覽（遊戲裡的截圖另外拍）：正面、斜前方、塔"""
    os.makedirs(d, exist_ok=True)
    views = [('front', (40.0, 9.0, 0.0), (100.0, 12.0, 0.0)), ('diag_n', (55.0, 6.0, -40.0), (98.0, 12.0, -2.0)), ('diag_s', (60.0, 5.0, 32.0), (96.0, 12.0, -6.0)),
             ('steps', (64.0, 2.4, 9.0), (84.0, 2.2, -3.0)), ('terrace', (74.5, 2.6, -16.0), (84.0, 1.8, 6.0))]
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    sc.render.resolution_x, sc.render.resolution_y = 1280, 800
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.55, 0.68, 0.85, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 1.0
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.5; so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(50), 0, math.radians(-120))
    gm = bpy.data.meshes.new('ground'); go = bpy.data.objects.new('ground', gm); sc.collection.objects.link(go)
    import bmesh
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=150); bm.to_mesh(gm); bm.free(); go.location = (80, 0, -0.01)
    gmat = bpy.data.materials.new('g'); gmat.use_nodes = True; gmat.node_tree.nodes['Principled BSDF'].inputs[0].default_value = (0.25, 0.35, 0.15, 1); gm.materials.append(gmat)
    cam = bpy.data.cameras.new('cam'); cam.lens = 24; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    for (nm, p, l) in views:
        co.location = g2b(*p); dvec = g2b(*l) - g2b(*p); co.rotation_euler = dvec.to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(d, nm + '.png'); bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    out = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1]) if '--out' in ARGS else os.path.join(L.ROOT, OUT)
    build(out, ARGS[ARGS.index('--render') + 1] if '--render' in ARGS else None)
