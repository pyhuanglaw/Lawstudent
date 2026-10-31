"""臺大校舍（套件 CK.hall 的那幾棟：總圖書館、行政大樓…）的正式外觀 → 每一棟一個 GLB（校園世界座標）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_hall.py -- --set library|admin|arts|hist [--out 輸出.glb]
（tools/blender/env_second/campus_library.py 也是呼叫這裡的 build(LIBRARY)。）

每一棟的參數照 src/zones3d.js campus 區塊的 CK.hall({...}) 與 ckPlace(...)（改那邊要一起改這裡的 SETS）：位置、尺寸、朝向、樓層、開間、
拱廊柱子、門廊、塔樓都照套件（campuskit3d.js hall() 的算法：開間數、拱的半徑與起拱高度、門廊寬度…）。導航阻擋、鏡頭碰撞、門口互動點都在遊戲程式裡（套件），不變。

台大校舍的語彙（ART_DIRECTION、D23／D25）：面磚外牆、石材收邊（勒腳、樓層腰帶、簷口、拱窗窗框與窗台）、一樓連續拱廊、中央入口門廊、四坡屋頂。和套件不同的地方（品質）：
  - 窗是牆上真的開出的拱形窗洞：石材窗框外凸 6 cm、窗玻璃內凹 30 cm（看得到窗洞內側），窗台外凸；套件是貼在牆面上的薄片。亮燈的窗有由上往下漸暗的自發光貼圖。
  - 拱廊與門廊的拱有拱腹（拱的內側面），拱圈石材收邊；簷口是三段線腳；屋簷底下有簷底板。
  - 門廊頂：山牆（pediment）或陽台欄杆（三面、欄杆柱＋扶手＋底座；套件只有正面一排）。山牆可以有牛眼窗（oculus：石材圓框＋深色玻璃＋十字窗櫺）。
  - 門廊正面的柱子：方柱（套件）或圓石柱（cols='round'：方形柱礎、圓柱身、喇叭形柱頭，上面照舊是方形的拱墩；校史館，套件的註解「圓石柱」）。
  - 面磚（exterior_wall_cladding_02，真實比例）、切石（sandstone_blocks_08）、屋瓦（grey_roof_tiles）、花崗石（granite_tile_03）、木門與木窗框（dark_wood）都是 Poly Haven CC0 PBR。
不用 instancing：全部合成每個材質一個網格（draw call 少）；窗框、窗台、窗洞內側用另一個材質（ck_trim_win），遊戲端不投影。
招牌：PLATE_FACE_*（遊戲用 canvas 畫字：石材匾額樣式，晚上不發光）。
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Vector   # noqa: E402
from cafe_layout import uv01   # noqa: E402

NSEG = 6        # 窗拱的分段（套件也是 6）
NSEG_A = 8      # 拱廊、門廊的大拱
F = 0.16        # 石材窗框寬
GL_TOP, GL_BOT = (0.26, 0.31, 0.36), (0.06, 0.08, 0.10)   # 玻璃的上下顏色（線性；上面反射天空、下面暗）

# 套件的參數（zones3d.js）。plate：匾額（名稱、字、位置 'spandrel'＝中央拱上方／'frieze'＝門廊檐部正面）
SETS = {
    # CK.hall({w:60,d:26,floors:4,gfh:5.0,fh:4.3,wall:'#9e5a44',trim:'#dcd3c2',roof:'#4a3a33',roofH:4.0,arcade:true,arcDepth:3.0,
    #   porch:{bays:5,depth:4.2,pediment:true,pedH:3.0,h:9.0,ys:5.6},tower:{w:9,h:9},sign:'總圖書館'})；ckPlace(lib,100,0,-π/2)
    'library': dict(name='campus_library', prefix='lib_', out='assets/models/env/second_ai/campus_library.glb', place=(100.0, 0.0, -math.pi / 2),
                    w=60.0, d=26.0, floors=4, gfh=5.0, fh=4.3, arcDepth=3.0, roofH=4.0,
                    porch=dict(bays=5, depth=4.2, pediment=True, pedH=3.0, h=9.0, ys=5.6), tower=dict(w=9.0, h=9.0),
                    wall='#9e5a44', trim='#d6cebf', roof='#4a3a33',
                    plate=dict(name='PLATE_FACE_LIB', text='總圖書館', where='spandrel', w=5.0, h=0.9), expect=dict(nb=15, nbs=7)),
    # CK.hall({w:46,d:16,floors:3,gfh:4.2,fh:3.4,wall:'#cdb48e',trim:'#e8e0cf',roof:'#4a3a33',roofH:4.2,arcade:true,porch:{bays:3,depth:3.0,pediment:false},sign:'行政大樓'})；
    # ckPlace(admin,-38,33,Math.PI)（正面朝北對著傅鐘、椰林大道）
    'admin': dict(name='campus_admin', prefix='adm_', out='assets/models/env/second_ai/campus_admin.glb', place=(-38.0, 33.0, math.pi),
                  w=46.0, d=16.0, floors=3, gfh=4.2, fh=3.4, arcDepth=None, roofH=4.2,
                  porch=dict(bays=3, depth=3.0, pediment=False), tower=None,
                  wall='#cdb48e', wall_sat=0.3, trim='#e2dac9', roof='#4a3a33',
                  plate=dict(name='PLATE_FACE_ADMIN', text='行政大樓', where='frieze', w=5.2, h=0.42, fs=0.72), expect=dict(nb=13, nbs=4)),   # 第一版 4.4×0.36、字 0.6 倍：字只有 0.22 m 高，比套件的招牌小很多、遠看讀不出來
    # CK.hall({w:40,d:18,floors:2,gfh:4.8,fh:4.4,wall:'#9b5a42',trim:'#d8cfbd',roof:'#43342e',roofH:4.8,arcade:true,porch:{bays:3,depth:3.0,pediment:true,pedH:1.8},sign:'文學院'})；
    # ckPlace(arts,-38,-34,0)（大道北側，正面朝南對著行政大樓）。中央拱上方到檐部只剩 0.67 m（放不下有框的匾額）→ 匾額刻在檐部正面（和行政大樓一樣）
    'arts': dict(name='campus_arts', prefix='art_', out='assets/models/env/second_ai/campus_arts.glb', place=(-38.0, -34.0, 0.0),
                 w=40.0, d=18.0, floors=2, gfh=4.8, fh=4.4, arcDepth=None, roofH=4.8,
                 porch=dict(bays=3, depth=3.0, pediment=True, pedH=1.8, oculus=True), tower=None,
                 wall='#9b5a42', trim='#d8cfbd', roof='#43342e',
                 plate=dict(name='PLATE_FACE_ARTS', text='文學院', where='frieze', w=4.0, h=0.42, fs=0.72), expect=dict(nb=11, nbs=5)),
    # CK.hall({w:24,d:16,floors:2,gfh:5.0,fh:4.6,wall:'#a25d43',trim:'#d8cfbd',roof:'#43342e',roofH:4.4,arcade:true,porch:{bays:3,depth:2.6,pediment:true,pedH:1.6},sign:'校史館'})；
    # ckPlace(hist,-77,-29,0)（大道北側、靠近大門）。中央拱上方到檐部有 0.98 m：有框的匾額放在拱上方（bh＝石框高度）
    'hist': dict(name='campus_hist', prefix='his_', out='assets/models/env/second_ai/campus_hist.glb', place=(-77.0, -29.0, 0.0),
                 w=24.0, d=16.0, floors=2, gfh=5.0, fh=4.6, arcDepth=None, roofH=4.4,
                 porch=dict(bays=3, depth=2.6, pediment=True, pedH=1.6, oculus=True, cols='round'), tower=None,
                 wall='#a25d43', trim='#d8cfbd', roof='#43342e',
                 plate=dict(name='PLATE_FACE_HIST', text='校史館', where='spandrel', w=3.0, h=0.6, bh=0.8, fs=0.72), expect=dict(nb=7, nbs=4)),
}


def build(c, out=None):
    out = os.path.join(L.ROOT, out or c['out'])
    W, D, NF, GFH, FH = c['w'], c['d'], c['floors'], c['gfh'], c['fh']
    H = GFH + (NF - 1) * FH
    AD = c['arcDepth'] or 2.6; BAYT = 3.8; po = c['porch']; PB = po['bays']
    NB = max(3, round(W / BAYT))                                   # 套件：開間數和門廊的拱數同奇偶（門廊兩側的牆剛好落在拱廊的柱子上）
    if (NB - PB) % 2:
        NB += (1 if W / BAYT > NB else -1)
        if NB < 3: NB += 2
    BW = W / NB; APW = max(0.7, BW * 0.22)
    NBS = max(2, round(D / BAYT)); BWS = D / NBS
    WW = min(1.5, BW * 0.48); WH = min(FH * 0.62, 2.7); WWS = min(1.5, BWS * 0.48)
    AR = (BW - APW) / 2; AYS = min(GFH - AR - 0.5, 2.6); FZ = D / 2 - 0.3             # 拱廊：拱半徑、起拱高度、柱子中心 z
    PD = po['depth']; PH = po.get('h') or GFH + 0.6; PWID = PB * BW; Z0 = D / 2; PBW = PWID / PB; PPW = 0.9
    PR = (PBW - PPW) / 2; PYS = min(PH - PR - 0.6, po.get('ys') or 3.2); PEDH = po.get('pedH') or 2.0
    tw_ = c['tower']; ROOFH = c['roofH'] or min(5, D * 0.28)
    ex = c.get('expect') or {}
    assert ex.get('nb', NB) == NB and ex.get('nbs', NBS) == NBS, (NB, NBS)

    B.reset(texres=512)
    root = B.group(c['name'], props={'kind': c['name']})
    M = {
        # 面磚：實際 2 m 一張（一塊約 22×8 cm，接近二丁掛）。總圖第一版 tile=1.0 把磚縮成一半，近看變成一片紅色雜訊、看不出磚縫
        'wall': L.pbr('ck_wall', 'exterior_wall_cladding_02', tile=2.0, target=c['wall'], normal=0.8, maps=('diff', 'nor'), rough_value=0.88,
                      **({'sat': c['wall_sat']} if c.get('wall_sat') else {})),   # wall_sat：先降低彩度再校正顏色（行政大樓的米黃面磚：原圖橘、褐、深色混在一起，校正成米黃後近看太花）
        # 石材：切石塊（實際 3 m 一張、一塊約 0.86×0.57 m；降低彩度＋校正到套件的石材顏色）。
        # 總圖第一版用 concrete_wall_006（清水混凝土）：遊戲裡門廊的柱子滿是褐色水痕，比套件的切石還髒（library_after_porch 第一版）
        'trim': L.pbr('ck_trim', 'sandstone_blocks_08', tile=3.0, sat=0.45, target=c['trim'], normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.8),
        'trimw': L.pbr('ck_trim_win', 'sandstone_blocks_08', tile=3.0, sat=0.45, target=c['trim'], maps=('diff',), res=512, rough_value=0.8),   # 同一張顏色貼圖（GLB 裡只存一份）
        # 柱子（CAM-PILLAR-HALLS-1031，LAWWW2-B 2026-10-31）：和石材、面磚同一張貼圖，另外一個材質。名字 seethru_ 開頭：遊戲（zones3d.js attachWenzhouModel）標成樹幹透視，
        #   擋在跟隨鏡頭和玩家之間時網點透空（從門廊側邊走向大門時柱子把人切掉一半）。收邊（簷口、拱圈、門廊頂板）、牆照舊不透
        'col': L.pbr('seethru_ck_col', 'sandstone_blocks_08', tile=3.0, sat=0.45, target=c['trim'], normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.8),   # 門廊石柱（柱身、柱頭、柱礎）、拱廊柱墩的柱頭柱腳
        'pier': L.pbr('seethru_ck_pier', 'exterior_wall_cladding_02', tile=2.0, target=c['wall'], normal=0.8, maps=('diff', 'nor'), rough_value=0.88,
                      **({'sat': c['wall_sat']} if c.get('wall_sat') else {})),   # 拱廊的面磚柱墩
        'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target='#9a948a', maps=('diff',), res=256, rough_value=0.7),
        'roof': L.pbr('ck_roof', 'grey_roof_tiles', tile=3.0, target=c['roof'], normal=0.8, maps=('diff', 'nor'), rough_value=0.82),   # 實際 3 m 一張
        'ceil': L.flat('ck_ceiling', '#e2dccf', rough=0.95),
        # 深色木作：窗框、直櫺、大門、門把、屋脊（同一個材質＝一次 draw call；2026-10-11 文學院、校史館：原本大門自己一個材質只有 2 個三角形，窗框是純色，
        # 校門鏡頭五個地標加起來 draw call 超過 +10%）。窗框改成深色木紋（台大舊校舍的木窗框），大門照舊有木紋
        'frame': L.pbr('ck_frame', 'dark_wood', tile=1.0, target='#3c2d23', maps=('diff',), res=256, rough_value=0.58),
        'glass': L.vc_material('ck_glass', rough=0.12),
        'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
    }
    # 玻璃：亮燈的窗、沒亮燈的窗是同一個材質（一次 draw call）。自發光貼圖（glTF emissiveTexture）64×64：左半（u<0.5）全黑＝沒亮燈的窗，
    # 右半＝亮燈的窗（室內的光由上往下漸暗，天花板燈；總圖第一版是一片平均的自發光，近看像一塊發亮的平板）；每扇窗的 UV：沒亮燈 u=0.125、亮燈 u=0.875，v＝窗洞內的高度
    # （取樣點離黑白交界 24 個像素：GLB 裡的貼圖是有損 WebP，交界兩側幾個像素會有壓縮的漣漪）。
    # 遊戲端晚上照 WZ_NIGHT 乘上暖色、白天強度 0，這張貼圖不用 mipmap（縮小時左右兩半不會混在一起，沒亮燈的窗不會在遠處發光）。
    # 2026-10-11 以前是兩個材質（ck_glass、ck_glass_lit）：文學院、校史館加進來後，進校門鏡頭五個地標的 draw call 超過 +10%
    lit = bpy.data.images.new('win_lit_grad', 64, 64, alpha=False); px = []
    for j in range(64):
        t = j / 63; k = [(0.50, 0.36, 0.22), (0.86, 0.70, 0.48), (1.0, 0.92, 0.76)]
        a, b, u = (k[0], k[1], t / 0.6) if t < 0.6 else (k[1], k[2], (t - 0.6) / 0.4)
        px += [0.0, 0.0, 0.0, 1.0] * 32 + ([a[i] + (b[i] - a[i]) * u for i in range(3)] + [1.0]) * 32   # 一列：左 32 個黑、右 32 個是這個高度的燈光顏色
    lit.pixels.foreach_set(px); lit.pack()
    nt = M['glass'].node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = lit; tx.extension = 'EXTEND'
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Emission Color']); nt.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 1.0
    accs = {}

    def acc(k):
        if k not in accs: accs[k] = (CMesh if k.startswith('glass') else Mesh)(c['prefix'] + k, M[k])
        return accs[k]

    pxx, pzz, ry = c['place']; cc, ss = round(math.cos(ry)), round(math.sin(ry))
    def XF(x, y, z): return (pxx + x * cc + z * ss, y, pzz - x * ss + z * cc)   # 建築自己的座標（套件：中心在原點、地面 y=0、正面朝 +z）→ 校園世界座標（ckPlace）

    def newell(pts):
        n = [0.0, 0.0, 0.0]
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
        return n

    def face(m, pts, want=None, uvs=None):
        """一個平面多邊形（本地座標）；want＝想要的法線方向（本地），反了就把點的順序倒過來；uvs＝每個點的 UV（和點一起倒過來，寫進 UVMap）"""
        if want is not None:
            n = newell(pts)
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]; uvs = uvs[::-1] if uvs else uvs
        f = m.bm.faces.new([m.bm.verts.new(g2b(*XF(*p))) for p in pts])
        if uvs:
            lay = m.bm.loops.layers.uv.get('UVMap') or m.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, uvs): lp[lay].uv = uv
        return f

    def box(m, x0, x1, y0, y1, z0, z1, skip=()):
        """方塊（本地座標、軸對齊），skip：不要的面（'bottom'、'top'、'back'（−z）、'front'（+z）、'left'（−x）、'right'（+x））"""
        F_ = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
              'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
              'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
        for k, (pts, n) in F_.items():
            if k not in skip: face(m, pts, n)

    class Fr:
        """立面座標：u＝從外面看往右、v＝往上、d＝往外（法線）；原點 O（本地座標）"""
        def __init__(self, O, R, N): self.O, self.R, self.N = O, R, N
        def p(self, u, v, d=0.0): return (self.O[0] + u * self.R[0] + d * self.N[0], self.O[1] + v, self.O[2] + u * self.R[2] + d * self.N[2])
        def dirv(self, du, dv, dd): return (du * self.R[0] + dd * self.N[0], dv, du * self.R[2] + dd * self.N[2])

    def arc(uc, vs, r, n, a0=math.pi, a1=0.0):
        return [(uc + r * math.cos(a0 + (a1 - a0) * k / n), vs + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]

    def rect(m, fr, ua, ub, va, vb, d=0.0):
        face(m, [fr.p(ua, va, d), fr.p(ub, va, d), fr.p(ub, vb, d), fr.p(ua, vb, d)], fr.N)

    def wall_strip(fr, u0, u1, v0, v1, holes):
        """一段牆（u0..u1 × v0..v1）挖掉窗洞：holes＝[{u, a（半寬）, vb（洞底）, vs（起拱）, arch, vt（方洞的頂）}]"""
        m = acc('wall'); cur = u0
        for h in sorted(holes, key=lambda h: h['u']):
            hl, hr = h['u'] - h['a'], h['u'] + h['a']
            if hl > cur + 1e-4: rect(m, fr, cur, hl, v0, v1)
            if h['vb'] > v0 + 1e-4: rect(m, fr, hl, hr, v0, h['vb'])
            if h['arch']:
                P = arc(h['u'], h['vs'], h['a'], NSEG)
                for k in range(NSEG):
                    (ua, va), (ub, vb) = P[k], P[k + 1]
                    face(m, [fr.p(ua, va), fr.p(ub, vb), fr.p(ub, v1), fr.p(ua, v1)], fr.N)
            elif v1 > h['vt'] + 1e-4: rect(m, fr, hl, hr, h['vt'], v1)
            cur = hr
        if u1 > cur + 1e-4: rect(m, fr, cur, u1, v0, v1)

    def glass_face(fr, pts_uv, d, lit_, vb, vt):
        uc = 0.875 if lit_ else 0.125              # 自發光貼圖：右半＝亮燈（由下往上的燈光）、左半＝黑
        uvs = [(uc, max(0.0, min(1.0, (v - vb) / max(1e-6, vt - vb)))) for u, v in pts_uv]
        m = acc('glass'); f = face(m, [fr.p(u, v, d) for u, v in pts_uv], fr.N, uvs)
        for lp in f.loops:
            t = max(0.0, min(1.0, ((lp.vert.co.z) - vb) / max(1e-6, vt - vb)))   # Blender z＝遊戲 y（高度）
            lp[m.col] = [GL_BOT[i] + (GL_TOP[i] - GL_BOT[i]) * t for i in range(3)] + [1.0]

    def strip(m, fr, a, b, d0, d1, want):
        """沿著立面上的一條邊（a→b，(u,v)）從深度 d0 到 d1 的側面；want＝想要的法線（立面座標 du,dv,dd）"""
        face(m, [fr.p(a[0], a[1], d0), fr.p(b[0], b[1], d0), fr.p(b[0], b[1], d1), fr.p(a[0], a[1], d1)], fr.dirv(*want))

    def window(fr, u, vb, ww, wh, f, lit_, rect_=False, dep=0.30, proud=0.06, door=False):
        """一扇窗（窗洞已經在牆上挖好，外框＝石材窗框外緣）：石材窗框（外凸 proud）＋外側面、窗洞內側（深 dep）、深色窗框、直櫺與橫櫺、玻璃、窗台。
        rect_：方窗（vs＝洞口頂）；door：門（沒有玻璃、窗台、窗洞底、下框、直櫺）"""
        r = ww / 2; ro = r + f; vs = vb + wh if rect_ else vb + wh - r; t = 0.06; tw = acc('trimw'); fm = acc('frame')
        vt = vb + wh                               # 拱頂（內側）
        rect(tw, fr, u - ro, u - r, vb, vs, proud); rect(tw, fr, u + r, u + ro, vb, vs, proud)   # 石材窗框正面
        if rect_:
            rect(tw, fr, u - ro, u + ro, vs, vs + f, proud)
        else:
            I, O = arc(u, vs, r, NSEG), arc(u, vs, ro, NSEG)
            for k in range(NSEG): face(tw, [fr.p(*I[k], proud), fr.p(*I[k + 1], proud), fr.p(*O[k + 1], proud), fr.p(*O[k], proud)], fr.N)
        # 窗框外側面（牆面到外凸的正面）
        strip(tw, fr, (u - ro, vb), (u - ro, vs), 0, proud, (-1, 0, 0)); strip(tw, fr, (u + ro, vb), (u + ro, vs), 0, proud, (1, 0, 0))
        if rect_: strip(tw, fr, (u - ro, vs + f), (u + ro, vs + f), 0, proud, (0, 1, 0))
        else:
            for k in range(NSEG):
                a = math.pi * (1 - (k + 0.5) / NSEG); strip(tw, fr, O[k], O[k + 1], 0, proud, (math.cos(a), math.sin(a), 0))
        # 窗洞內側（從窗框正面到玻璃後面 1 cm：玻璃的邊夾在窗洞裡。總圖第一版剛好停在玻璃前面，斜看時玻璃和窗框之間有一條縫，
        # 看得到空的建築裡面、後面的草地（library_after_arcade 第一版：拱廊裡的窗邊一條綠線））
        de = -dep - 0.01
        strip(tw, fr, (u - r, vb), (u - r, vs), proud, de, (1, 0, 0)); strip(tw, fr, (u + r, vb), (u + r, vs), proud, de, (-1, 0, 0))
        if rect_: strip(tw, fr, (u - r, vs), (u + r, vs), proud, de, (0, -1, 0))
        else:
            for k in range(NSEG):
                a = math.pi * (1 - (k + 0.5) / NSEG); strip(tw, fr, I[k], I[k + 1], proud, de, (-math.cos(a), -math.sin(a), 0))
        if not door: strip(tw, fr, (u - r, vb), (u + r, vb), -0.06, de, (0, 1, 0))           # 窗洞底（窗台蓋住外面那一段）
        # 深色窗框（玻璃外圈）、直櫺、橫櫺
        rect(fm, fr, u - r, u - r + t, vb, vs, -dep + 0.005); rect(fm, fr, u + r - t, u + r, vb, vs, -dep + 0.005)
        if not door: rect(fm, fr, u - r + t, u + r - t, vb, vb + t, -dep + 0.005)
        if rect_: rect(fm, fr, u - r, u + r, vs - t, vs, -dep + 0.005)
        else:
            Ii, Io = arc(u, vs, r - t, NSEG), arc(u, vs, r, NSEG)
            for k in range(NSEG): face(fm, [fr.p(*Ii[k], -dep + 0.005), fr.p(*Ii[k + 1], -dep + 0.005), fr.p(*Io[k + 1], -dep + 0.005), fr.p(*Io[k], -dep + 0.005)], fr.N)
        if door: return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': False, 'vt': vs + f}
        top = vs if rect_ else vt - t
        rect(fm, fr, u - 0.03, u + 0.03, vb + t, top, -dep + 0.035)                                   # 直櫺（正面＋兩側）
        strip(fm, fr, (u - 0.03, vb + t), (u - 0.03, top), -dep + 0.035, -dep, (-1, 0, 0)); strip(fm, fr, (u + 0.03, vb + t), (u + 0.03, top), -dep + 0.035, -dep, (1, 0, 0))
        if not rect_:
            rect(fm, fr, u - r + t, u + r - t, vs - 0.03, vs + 0.03, -dep + 0.035)                    # 橫櫺（起拱線）
            strip(fm, fr, (u - r + t, vs + 0.03), (u + r - t, vs + 0.03), -dep + 0.035, -dep, (0, 1, 0))
        # 玻璃：整個窗洞（邊緣壓在深色窗框後面，斜看也沒有縫）
        if rect_: pts = [(u - r, vb), (u + r, vb), (u + r, vs), (u - r, vs)]
        else: pts = [(u - r, vb), (u + r, vb)] + arc(u, vs, r, NSEG, 0.0, math.pi)[:]
        glass_face(fr, pts, -dep - 0.005, lit_, vb, vt)
        # 窗台（外凸）
        x0, x1 = u - ro - 0.09, u + ro + 0.09
        for (pts_, n) in (([fr.p(x0, vb, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, 0.26), fr.p(x0, vb, 0.26)], (0, 1, 0)),
                          ([fr.p(x0, vb - 0.1, 0.26), fr.p(x1, vb - 0.1, 0.26), fr.p(x1, vb, 0.26), fr.p(x0, vb, 0.26)], (0, 0, 1)),
                          ([fr.p(x0, vb - 0.1, -0.06), fr.p(x1, vb - 0.1, -0.06), fr.p(x1, vb - 0.1, 0.26), fr.p(x0, vb - 0.1, 0.26)], (0, -1, 0)),
                          ([fr.p(x0, vb - 0.1, -0.06), fr.p(x0, vb, -0.06), fr.p(x0, vb, 0.26), fr.p(x0, vb - 0.1, 0.26)], (-1, 0, 0)),
                          ([fr.p(x1, vb - 0.1, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, 0.26), fr.p(x1, vb - 0.1, 0.26)], (1, 0, 0))):
            face(tw, pts_, fr.dirv(*n))
        return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': not rect_, 'vt': vs + f}

    def door_leaves(fr, u, w, h, d):
        """雙開木門（2026-10-21 LAWWW2，ART-ECON-3D-GAP：原本整片深色木作，在拱廊的陰影裡是一個全黑的長方形）：
        每一扇＝木框（邊梃、上冒頭、中冒頭、下冒頭）＋上半玻璃（和窗同一套，晚上透出室內的燈）＋下半凹進去的木板；中間對開縫、直的門把。
        材質沿用窗框的深色木作（ck_frame）、窗玻璃（ck_glass）：不加材質、不加 draw call。d＝門的正面（立面座標的深度）"""
        fm = acc('frame'); hw = w / 2; S, T, MR, BR = 0.11, 0.26, 0.14, 0.22   # 邊梃寬、上冒頭、中冒頭、下冒頭
        gb, gt, pt = 1.08, h - T, 1.08 - MR                                   # 玻璃：中冒頭以上到上冒頭；木板：下冒頭到中冒頭
        for s_ in (-1, 1):
            a, b_ = (u - hw, u - 0.012) if s_ < 0 else (u + 0.012, u + hw)   # 這一扇（中間對開縫 2.4 cm）
            ia, ib = a + S, b_ - S
            rect(fm, fr, a, ia, 0.0, h, d); rect(fm, fr, ib, b_, 0.0, h, d)                                  # 邊梃
            rect(fm, fr, ia, ib, gt, h, d); rect(fm, fr, ia, ib, pt, gb, d); rect(fm, fr, ia, ib, 0.0, BR, d)   # 上、中、下冒頭
            rect(fm, fr, ia, ib, BR, pt, d - 0.025)                                                           # 下半木板（凹進去 2.5 cm）
            glass_face(fr, [(ia, gb), (ib, gb), (ib, gt), (ia, gt)], d - 0.02, True, gb, gt)                  # 上半玻璃（亮燈：門廳）
            for (v0_, v1_, dd) in ((BR, pt, 0.025), (gb, gt, 0.02)):                                          # 木板、玻璃四周的木框內側
                strip(fm, fr, (ia, v0_), (ia, v1_), d, d - dd, (1, 0, 0)); strip(fm, fr, (ib, v0_), (ib, v1_), d, d - dd, (-1, 0, 0))
                strip(fm, fr, (ia, v1_), (ib, v1_), d, d - dd, (0, -1, 0)); strip(fm, fr, (ia, v0_), (ib, v0_), d, d - dd, (0, 1, 0))
            hx = b_ - 0.06 if s_ < 0 else a + 0.06                                                            # 直的門把（靠中間，外凸 4.5 cm）
            rect(fm, fr, hx - 0.015, hx + 0.015, 0.92, 1.42, d + 0.045)
            for (pa, pb, n_) in (((hx - 0.015, 0.92), (hx - 0.015, 1.42), (-1, 0, 0)), ((hx + 0.015, 0.92), (hx + 0.015, 1.42), (1, 0, 0)),
                                 ((hx - 0.015, 1.42), (hx + 0.015, 1.42), (0, 1, 0)), ((hx - 0.015, 0.92), (hx + 0.015, 0.92), (0, -1, 0))):
                strip(fm, fr, pa, pb, d, d + 0.045, n_)

    def lit_hash(*k):
        h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
        return h - math.floor(h) > 0.3          # 約七成的窗晚上亮（套件也是）

    def sill_y(fl): return 1.2 if fl == 0 else GFH + (fl - 1) * FH + 0.75
    def floor_v(fl): return (0.0, GFH) if fl == 0 else (GFH + (fl - 1) * FH, GFH + fl * FH)

    def facade(fr, u0, u1, centers, fl, ww, wh, sid, u_range=None):
        v0, v1 = floor_v(fl); holes = []
        for j, uc in enumerate(centers):
            holes.append(window(fr, uc, sill_y(fl), ww, wh, F, lit_hash(sid, fl, j)))
        a, b = u_range if u_range else (u0, u1)
        wall_strip(fr, a, b, v0, v1, holes)

    # ---------------- 外牆＋窗 ----------------
    FRONT = Fr((0, 0, D / 2), (1, 0, 0), (0, 0, 1)); BACK = Fr((0, 0, -D / 2), (-1, 0, 0), (0, 0, -1))
    RIGHT = Fr((W / 2, 0, 0), (0, 0, -1), (1, 0, 0)); LEFT = Fr((-W / 2, 0, 0), (0, 0, 1), (-1, 0, 0))
    bay_x = [-W / 2 + BW * (i + 0.5) for i in range(NB)]
    side_z = [-D / 2 + BWS * (j + 0.5) for j in range(NBS)]
    for fl in range(NF):
        if fl > 0: facade(FRONT, -W / 2, W / 2, bay_x, fl, WW, WH, 1)
        facade(BACK, -W / 2, W / 2, [-x for x in bay_x], fl, WW, WH, 2)     # 背面：u＝−x
        zs = [z for z in side_z if not (fl == 0 and z > D / 2 - AD - 0.8)]
        rng = (-(D / 2 - AD), D / 2) if fl == 0 else None                    # 一樓：側牆只到拱廊後面（拱廊兩端是開的）
        facade(RIGHT, -D / 2, D / 2, sorted(-z for z in zs), fl, WWS, WH, 3, rng)
        facade(LEFT, -D / 2, D / 2, sorted(zs), fl, WWS, WH, 4, (-D / 2, D / 2 - AD) if fl == 0 else None)

    # ---------------- 一樓拱廊 ----------------
    ARC_BACK = Fr((0, 0, D / 2 - AD), (1, 0, 0), (0, 0, 1))      # 拱廊裡面的牆
    IWW, IWH = min(1.4, BW * 0.4), 2.5
    holes = []
    for i, x in enumerate(bay_x):
        if abs(i - (NB - 1) / 2) < 0.6:   # 中央：大門（雙開木門＋石材門框＋門楣）
            holes.append(window(ARC_BACK, x, 0.0, 1.8, 2.9, 0.15, False, rect_=True, dep=0.15, door=True))
            door_leaves(ARC_BACK, x, 1.8, 2.9, -0.15)
            # 遊戲內對照（econfix2，總圖門 15:00／20:00）：兩扇門中間的對開縫、門底下看得到一條綠線＝空的建築裡面、底下的草地。
            # 縫後面放一條深色木作（門廳裡面的暗處），門洞底放一道石材門檻（從窗框正面到門後面），都不加材質
            rect(acc('frame'), ARC_BACK, x - 0.06, x + 0.06, 0.0, 2.9, -0.18)
            face(acc('trimw'), [ARC_BACK.p(x - 0.9, 0.02, 0.06), ARC_BACK.p(x + 0.9, 0.02, 0.06), ARC_BACK.p(x + 0.9, 0.02, -0.17), ARC_BACK.p(x - 0.9, 0.02, -0.17)], ARC_BACK.dirv(0, 1, 0))
            rect(acc('trimw'), ARC_BACK, x - 0.9, x + 0.9, 0.0, 0.02, 0.06)
            box(acc('trimw'), x - 1.2, x + 1.2, 3.05, 3.25, D / 2 - AD, D / 2 - AD + 0.18, skip=('back',))          # 門楣
        else:
            holes.append(window(ARC_BACK, x, 0.9, IWW, IWH, 0.12, lit_hash(5, i)))
    wall_strip(ARC_BACK, -W / 2, W / 2, 0.0, GFH, holes)
    for sx in (-1, 1): face(acc('wall'), [(sx * W / 2, GFH - 0.3, D / 2 - AD), (sx * W / 2, GFH - 0.3, D / 2 - 0.6), (sx * W / 2, GFH, D / 2 - 0.6), (sx * W / 2, GFH, D / 2 - AD)], (sx, 0, 0))   # 拱廊兩端：天花板到樓板腰帶之間的端牆
    wm, tm = acc('wall'), acc('trim')
    pm, cm = acc('pier'), acc('col')   # 柱子：網點透空的材質（見 M 的 col、pier）
    for i in range(NB + 1):   # 柱墩（面磚）＋柱頭、柱腳（石材）
        x = -W / 2 + BW * i; corner = i in (0, NB)
        # 轉角的柱墩一路到樓板腰帶（套件的轉角柱子上面是空的，從側面看像一根柱子頂著空氣）
        box(pm, x - APW / 2, x + APW / 2, 0.4, GFH if corner else AYS - 0.11, FZ - 0.3, FZ + 0.3, skip=('bottom', 'top'))
        box(cm, x - APW / 2 - 0.08, x + APW / 2 + 0.08, AYS - 0.11, AYS + 0.11, FZ - 0.39, FZ + 0.39)   # 柱頭正面比拱圈石材（外凸 6 cm）再凸一點：同一平面會閃爍
        box(cm, x - APW / 2 - 0.06, x + APW / 2 + 0.06, 0.0, 0.4, FZ - 0.35, FZ + 0.35, skip=('bottom',))

    def arch_bay(m, mring, xc, bw, ys, top, r, zf, zb, n=NSEG_A, ring=0.14, clip=(-1e9, 1e9)):
        """一個開間的拱圈牆：正面（zf）、背面（zb）、拱腹；正面加石材拱圈。clip：左右兩塊不超出這個範圍（被轉角的柱子、門廊側牆蓋住的部分不做，避免同一平面重疊）"""
        for (z, nz) in ((zf, 1), (zb, -1)):
            for (a, b) in ((max(clip[0], xc - bw / 2), xc - r), (xc + r, min(clip[1], xc + bw / 2))):   # 左右兩塊（拱腳到開間邊緣）＋拱上面
                if b - a > 1e-4: face(m, [(a, ys, z), (b, ys, z), (b, top, z), (a, top, z)], (0, 0, nz))
            P = arc(xc, ys, r, n)
            for k in range(n):
                (xa, ya), (xb, yb) = P[k], P[k + 1]
                face(m, [(xa, ya, z), (xb, yb, z), (xb, top, z), (xa, top, z)], (0, 0, nz))
        P = arc(xc, ys, r, n)
        for k in range(n):
            (xa, ya), (xb, yb) = P[k], P[k + 1]; mid = math.pi * (1 - (k + 0.5) / n)
            face(m, [(xa, ya, zb), (xb, yb, zb), (xb, yb, zf), (xa, ya, zf)], (-math.cos(mid), -math.sin(mid), 0))
        if mring:
            O = arc(xc, ys, r + ring, n)
            for k in range(n):
                face(mring, [(P[k][0], P[k][1], zf + 0.06), (P[k + 1][0], P[k + 1][1], zf + 0.06), (O[k + 1][0], O[k + 1][1], zf + 0.06), (O[k][0], O[k][1], zf + 0.06)], (0, 0, 1))
                mid = math.pi * (1 - (k + 0.5) / n)
                face(mring, [(O[k][0], O[k][1], zf), (O[k + 1][0], O[k + 1][1], zf), (O[k + 1][0], O[k + 1][1], zf + 0.06), (O[k][0], O[k][1], zf + 0.06)], (math.cos(mid), math.sin(mid), 0))

    for i, x in enumerate(bay_x): arch_bay(wm, tm, x, BW, AYS, GFH, AR, FZ + 0.3, FZ - 0.3, clip=(-W / 2 + APW / 2, W / 2 - APW / 2))
    face(acc('ceil'), [(-W / 2, GFH - 0.3, D / 2 - AD), (W / 2, GFH - 0.3, D / 2 - AD), (W / 2, GFH - 0.3, FZ - 0.3), (-W / 2, GFH - 0.3, FZ - 0.3)], (0, -1, 0))   # 拱廊天花板
    face(acc('base'), [(-W / 2 - 0.4, 0.04, D / 2 - AD), (W / 2 + 0.4, 0.04, D / 2 - AD), (W / 2 + 0.4, 0.04, D / 2 + 0.1), (-W / 2 - 0.4, 0.04, D / 2 + 0.1)], (0, 1, 0))   # 拱廊地坪

    # ---------------- 勒腳（花崗石，0.7 m 高、外凸 8 cm）；拱廊裡的大門那一段留開口 ----------------
    bm_ = acc('base'); e = 0.08
    for (x0, x1) in ((-W / 2 - e, -1.05), (1.05, W / 2 + e)): box(bm_, x0, x1, 0, 0.7, D / 2 - AD - 0.02, D / 2 - AD + e, skip=('bottom', 'back'))
    box(bm_, -W / 2 - e, W / 2 + e, 0, 0.7, -D / 2 - e, -D / 2 + 0.02, skip=('bottom', 'front'))
    for sx in (-1, 1):
        x0, x1 = (W / 2 - 0.02, W / 2 + e) if sx > 0 else (-W / 2 - e, -W / 2 + 0.02)
        box(bm_, x0, x1, 0, 0.7, -D / 2 + 0.02, D / 2 - AD - 0.02, skip=('bottom', 'left' if sx > 0 else 'right', 'front', 'back'))   # 夾在背面、拱廊那兩段中間（轉角不重疊）

    # ---------------- 樓層腰帶、簷口（三段線腳）----------------
    def ring_box(m, y0, y1, o, w=W, d=D, zc=0.0, skip=('bottom',)):
        """沿建築四周的一圈帶子（外凸 o）：正面、背面兩塊，側面的兩塊夾在中間（轉角不重疊：重疊的面在同一平面上會閃爍）"""
        hx, hz = w / 2 + o, d / 2 + o
        box(m, -hx, hx, y0, y1, zc + d / 2 - 0.02, zc + hz, skip=skip + ('back',)); box(m, -hx, hx, y0, y1, zc - hz, zc - d / 2 + 0.02, skip=skip + ('front',))
        box(m, w / 2 - 0.02, hx, y0, y1, zc - d / 2 + 0.02, zc + d / 2 - 0.02, skip=skip + ('left', 'front', 'back')); box(m, -hx, -w / 2 + 0.02, y0, y1, zc - d / 2 + 0.02, zc + d / 2 - 0.02, skip=skip + ('right', 'front', 'back'))

    for i in range(1, NF): ring_box(tm, GFH + (i - 1) * FH - 0.11, GFH + (i - 1) * FH + 0.11, 0.12, skip=())

    def cornice(m, y, w, d, zc=0.0, prof=((0.0, -0.35), (0.12, -0.35), (0.12, -0.1), (0.35, 0.1), (0.35, 0.5))):
        """線腳簷口：剖面（外凸 o、相對高度 dy）一段一段沿四周繞一圈（轉角斜接）"""
        hx, hz = w / 2, d / 2
        for (o0, y0), (o1, y1) in zip(prof, prof[1:]):
            for (ax, az, bx, bz, nx, nz) in ((-1, 1, 1, 1, 0, 1), (1, -1, -1, -1, 0, -1), (1, 1, 1, -1, 1, 0), (-1, -1, -1, 1, -1, 0)):
                pa0 = (ax * (hx + o0), y + y0, zc + az * (hz + o0)); pb0 = (bx * (hx + o0), y + y0, zc + bz * (hz + o0))
                pa1 = (ax * (hx + o1), y + y1, zc + az * (hz + o1)); pb1 = (bx * (hx + o1), y + y1, zc + bz * (hz + o1))
                dy, do = y1 - y0, o1 - o0
                face(m, [pa0, pb0, pb1, pa1], (nx * dy, -do, nz * dy))   # 剖面上往外走的線段：法線＝(dy, −do)（往外、往下）

    cornice(tm, H, W, D)

    # ---------------- 四坡屋頂（屋瓦）＋簷底板＋屋脊 ----------------
    def hip_roof(m, w, d, rh, y, zc=0.0, soffit_in=(0, 0)):
        hw, hd = w / 2, d / 2; r = max(0.0, (w - d) / 2)
        A, Bp, C, Dp = (-hw, y, zc + hd), (hw, y, zc + hd), (hw, y, zc - hd), (-hw, y, zc - hd); R1, R2 = (-r, y + rh, zc), (r, y + rh, zc)
        face(m, [A, Bp, R2, R1] if r > 0 else [A, Bp, R2], (0, 1, 1)); face(m, [C, Dp, R1, R2] if r > 0 else [C, Dp, R1], (0, 1, -1))
        face(m, [Bp, C, R2], (1, 1, 0)); face(m, [Dp, A, R1], (-1, 1, 0))
        sm = acc('ceil'); iw, idp = soffit_in
        for (p, q, pi, qi) in ((A, Bp, (-iw, y, zc + idp), (iw, y, zc + idp)), (Bp, C, (iw, y, zc + idp), (iw, y, zc - idp)), (C, Dp, (iw, y, zc - idp), (-iw, y, zc - idp)), (Dp, A, (-iw, y, zc - idp), (-iw, y, zc + idp))):
            face(sm, [p, q, qi, pi], (0, -1, 0))                                 # 屋簷底下的簷底板
        for (p, q, n) in ((A, Bp, (0, 0, 1)), (Bp, C, (1, 0, 0)), (C, Dp, (0, 0, -1)), (Dp, A, (-1, 0, 0))):
            face(m, [(p[0], y - 0.15, p[2]), (q[0], y - 0.15, q[2]), q, p], n)   # 屋簷前緣
        return R1, R2

    R1, R2 = hip_roof(acc('roof'), W + 1.6, D + 1.6, ROOFH, H + 0.5, 0.0, (W / 2 + 0.35, D / 2 + 0.35))
    box(acc('frame'), R1[0] - 0.15, R2[0] + 0.15, R1[1] - 0.05, R1[1] + 0.17, -0.16, 0.16, skip=('bottom',))

    # ---------------- 中央塔樓（總圖：面磚、四面各兩扇拱窗、線腳簷口、四坡屋頂）----------------
    if tw_:
        TW, TH = tw_['w'], tw_['h']; TZ = D / 2 - TW / 2 - 0.5; TY = H
        TF = Fr((0, 0, TZ + TW / 2), (1, 0, 0), (0, 0, 1)); TB = Fr((0, 0, TZ - TW / 2), (-1, 0, 0), (0, 0, -1))
        TR = Fr((TW / 2, 0, TZ), (0, 0, -1), (1, 0, 0)); TL = Fr((-TW / 2, 0, TZ), (0, 0, 1), (-1, 0, 0))
        for si, fr in enumerate((TF, TB, TR, TL)):
            hs = [window(fr, k * TW * 0.22, TY + TH - 4.6, 1.3, 3.2, F, lit_hash(9, si, k)) for k in (-1, 1)]
            wall_strip(fr, -TW / 2, TW / 2, TY, TY + TH, hs)
        ring_box(tm, TY + 0.48, TY + 0.73, 0.15, w=TW, d=TW, zc=TZ)
        cornice(tm, TY + TH, TW, TW, TZ, ((0.0, -0.3), (0.1, -0.3), (0.1, -0.08), (0.28, 0.08), (0.28, 0.42)))
        hip_roof(acc('roof'), TW + 1.2, TW + 1.2, 3.2, TY + TH + 0.42, TZ, (TW / 2 + 0.28, TW / 2 + 0.28))

    # ---------------- 中央入口門廊（石材；正面拱、兩側實牆、檐部、山牆或陽台欄杆、天花板、地坪、招牌）----------------
    pzf, pzb = Z0 + PD, Z0 + PD - 0.9
    def ring(m, xc, zc, ya, ra, yb, rb, n=16):
        """圓錐台的側面（中心 (xc, zc)、從 ya 半徑 ra 到 yb 半徑 rb），法線往外"""
        for k in range(n):
            a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n; am = (a0 + a1) / 2
            face(m, [(xc + ra * math.cos(a0), ya, zc + ra * math.sin(a0)), (xc + ra * math.cos(a1), ya, zc + ra * math.sin(a1)),
                     (xc + rb * math.cos(a1), yb, zc + rb * math.sin(a1)), (xc + rb * math.cos(a0), yb, zc + rb * math.sin(a0))],
                 (math.cos(am) * (yb - ya), ra - rb, math.sin(am) * (yb - ya)))

    rcol = Mesh(c['prefix'] + 'rcol', M['col']) if po.get('cols') == 'round' else None   # 圓柱另外一個網格（平滑著色），最後和柱子合併成同一個（同一個材質 seethru_ck_col）
    for i in range(1, PB):
        x = -PWID / 2 + PBW * i
        if rcol:   # 圓石柱：方形柱礎（0.8 m）＋柱腳圓盤＋圓柱身（直徑 0.6 m，往上稍微收分）＋喇叭形柱頭；上面的拱墩照舊（導航阻擋是套件的 0.9 m 方形，柱子在裡面）
            zc = (pzb + pzf) / 2
            box(cm, x - 0.4, x + 0.4, 0.0, 0.3, zc - 0.4, zc + 0.4, skip=('bottom',))
            ring(rcol, x, zc, 0.3, 0.37, 0.42, 0.31); ring(rcol, x, zc, 0.42, 0.31, PYS - 0.42, 0.28)
            ring(rcol, x, zc, PYS - 0.42, 0.28, PYS - 0.34, 0.32); ring(rcol, x, zc, PYS - 0.34, 0.32, PYS - 0.12, 0.44)
        else:
            box(cm, x - PPW / 2, x + PPW / 2, 0.0, PYS - 0.12, pzb, pzf, skip=('bottom', 'top'))
        box(cm, x - PPW / 2 - 0.08, x + PPW / 2 + 0.08, PYS - 0.12, PYS + 0.1, pzb - 0.09, pzf + 0.09)   # 柱頭（拱墩）
    for i in range(PB): arch_bay(tm, acc('trimw'), -PWID / 2 + PBW * (i + 0.5), PBW, PYS, PH, PR, pzf, pzb, ring=0.16, clip=(-PWID / 2 + 0.45, PWID / 2 - 0.45))
    for sx in (-1, 1):   # 門廊兩端的側牆（0.9 m 寬、通高）：也是柱子，seethru_ck_col（CAM-PILLAR-HALLS-1031 續，LAWWW-B 10:00：BB-B 校史館門廊往旁邊 1.3～2.6 m 斜看時整個畫面是這一塊石面）
        x0, x1 = sx * PWID / 2 - 0.45, sx * PWID / 2 + 0.45
        box(cm, x0, x1, 0.0, PH, Z0, pzf, skip=('bottom', 'top', 'back'))
    box(tm, -PWID / 2 - 0.6, PWID / 2 + 0.6, PH, PH + 0.45, Z0 - 0.15, Z0 + PD + 0.15, skip=('back',))           # 檐部
    hw = PWID / 2 + 0.6; py0 = PH + 0.45; pz1 = Z0 + PD + 0.15
    if po.get('pediment'):
        face(tm, [(-hw, py0, pz1), (hw, py0, pz1), (0, py0 + PEDH, pz1)], (0, 0, 1))                                 # 山牆正面
        face(tm, [(-hw, py0, Z0), (-hw, py0, pz1), (0, py0 + PEDH, pz1), (0, py0 + PEDH, Z0)], (-PEDH, hw, 0))      # 山牆兩坡
        face(tm, [(hw, py0, Z0), (0, py0 + PEDH, Z0), (0, py0 + PEDH, pz1), (hw, py0, pz1)], (PEDH, hw, 0))
        for sx in (-1, 1):                                                                                          # 山牆斜邊的線腳（外凸 12 cm）
            a, b = (sx * hw, py0), (0.0, py0 + PEDH); L_ = math.hypot(b[0] - a[0], b[1] - a[1]); nx, ny = -(b[1] - a[1]) / L_ * sx, abs(b[0] - a[0]) / L_
            off = 0.14
            face(tm, [(a[0], a[1], pz1 + 0.12), (b[0], b[1], pz1 + 0.12), (b[0] + nx * off, b[1] + ny * off, pz1 + 0.12), (a[0] + nx * off, a[1] + ny * off, pz1 + 0.12)], (0, 0, 1))
            face(tm, [(a[0], a[1], pz1), (b[0], b[1], pz1), (b[0], b[1], pz1 + 0.12), (a[0], a[1], pz1 + 0.12)], (-nx, -ny, 0))
        if po.get('oculus'):   # 牛眼窗：石材圓框（外凸 7 cm）＋深色玻璃（由上往下變暗，和窗戶同一個材質）＋十字窗櫺
            R = min(0.42, PEDH * 0.25); cy = py0 + PEDH * 0.42; n = 20; tw = acc('trimw'); fm = acc('frame')
            I = [(R * math.cos(2 * math.pi * k / n), cy + R * math.sin(2 * math.pi * k / n)) for k in range(n)]
            O = [(1.3 * R * math.cos(2 * math.pi * k / n), cy + 1.3 * R * math.sin(2 * math.pi * k / n)) for k in range(n)]
            for k in range(n):
                k1 = (k + 1) % n; am = 2 * math.pi * (k + 0.5) / n
                face(tw, [(I[k][0], I[k][1], pz1 + 0.07), (I[k1][0], I[k1][1], pz1 + 0.07), (O[k1][0], O[k1][1], pz1 + 0.07), (O[k][0], O[k][1], pz1 + 0.07)], (0, 0, 1))
                face(tw, [(O[k][0], O[k][1], pz1), (O[k1][0], O[k1][1], pz1), (O[k1][0], O[k1][1], pz1 + 0.07), (O[k][0], O[k][1], pz1 + 0.07)], (math.cos(am), math.sin(am), 0))
                face(tw, [(I[k][0], I[k][1], pz1 + 0.012), (I[k1][0], I[k1][1], pz1 + 0.012), (I[k1][0], I[k1][1], pz1 + 0.07), (I[k][0], I[k][1], pz1 + 0.07)], (-math.cos(am), -math.sin(am), 0))
            gm = acc('glass'); f = face(gm, [(x_, y_, pz1 + 0.012) for x_, y_ in I], (0, 0, 1), [(0.125, 0.5)] * n)   # 牛眼窗不亮燈（自發光貼圖的黑色那半邊）
            for lp in f.loops:
                t = max(0.0, min(1.0, (lp.vert.co.z - (cy - R)) / (2 * R)))
                lp[gm.col] = [GL_BOT[i] + (GL_TOP[i] - GL_BOT[i]) * t for i in range(3)] + [1.0]
            rect(fm, Fr((0, 0, pz1), (1, 0, 0), (0, 0, 1)), -0.03, 0.03, cy - R, cy + R, 0.03); rect(fm, Fr((0, 0, pz1), (1, 0, 0), (0, 0, 1)), -R, R, cy - 0.03, cy + 0.03, 0.035)
    else:
        # 陽台欄杆（套件：正面一排欄杆柱＋扶手）：三面（正面、兩側）都有——底座、方形欄杆柱（每 0.5 m）、轉角的大柱、扶手；後面接到牆
        bt, rail_y, post = py0, py0 + 0.8, 0.12
        zb_ = Z0 + 0.02                                       # 兩側的欄杆一路到牆面
        box(tm, -hw, hw, bt, bt + 0.12, pz1 - 0.24, pz1, skip=('bottom',))                                           # 正面的底座
        for sx in (-1, 1): box(tm, sx * hw - (0.24 if sx > 0 else 0), sx * hw + (0.24 if sx < 0 else 0), bt, bt + 0.12, zb_, pz1 - 0.24, skip=('bottom', 'front', 'back'))
        n_ = max(2, round(2 * hw / 0.5)); step = 2 * hw / n_
        for i in range(1, n_):                                                                                        # 正面的欄杆柱
            x = -hw + step * i; box(tm, x - post / 2, x + post / 2, bt + 0.12, rail_y, pz1 - 0.12 - post / 2, pz1 - 0.12 + post / 2, skip=('bottom', 'top'))
        ns = max(2, round((pz1 - 0.24 - zb_) / 0.5)); steps = (pz1 - 0.24 - zb_) / ns
        for sx in (-1, 1):                                                                                            # 兩側的欄杆柱
            xx = sx * (hw - 0.12)
            for j in range(1, ns + 1):
                z = pz1 - 0.24 - steps * j
                if z < zb_ + 0.1: continue
                box(tm, xx - post / 2, xx + post / 2, bt + 0.12, rail_y, z - post / 2, z + post / 2, skip=('bottom', 'top'))
            box(tm, xx - 0.14, xx + 0.14, bt + 0.12, rail_y + 0.12, pz1 - 0.26, pz1 + 0.02, skip=('bottom',))           # 轉角的大柱（柱頂比扶手高）
        box(tm, -hw + 0.02, hw - 0.02, rail_y, rail_y + 0.1, pz1 - 0.2, pz1 - 0.04, skip=())                             # 正面的扶手
        for sx in (-1, 1): box(tm, sx * (hw - 0.12) - 0.08, sx * (hw - 0.12) + 0.08, rail_y, rail_y + 0.1, zb_, pz1 - 0.26, skip=('back',))   # 兩側的扶手
    face(acc('ceil'), [(-PWID / 2, PH - 0.15, Z0), (PWID / 2, PH - 0.15, Z0), (PWID / 2, PH - 0.15, pzb), (-PWID / 2, PH - 0.15, pzb)], (0, -1, 0))
    box(acc('base'), -PWID / 2 - 0.3, PWID / 2 + 0.3, 0.0, 0.08, Z0 - 0.3, Z0 + PD + 0.9, skip=('bottom',))          # 門廊地坪（比地面高 8 cm）
    # 招牌：spandrel＝中央拱上方、檐部下方（總圖）；frieze＝門廊檐部正面（行政大樓：拱上方只剩 0.6 m）
    pl = c['plate']; sw, sh = pl['w'], pl['h']
    plate = Mesh(pl['name'], M['board'])
    if pl['where'] == 'spandrel':
        bh = pl.get('bh')   # 石框高度（校史館：中央拱圈頂到檐部之間置中）；沒給＝總圖的 1.16 m
        sy = (PYS + PR + 0.16 + PH) / 2 if bh else PYS + PR + (PH - PYS - PR) / 2 + 0.05
        hb = bh / 2 if bh else 0.58
        box(tm, -sw / 2 - 0.15, sw / 2 + 0.15, sy - hb, sy + hb, pzf, pzf + 0.06, skip=('back',))
        face(plate, [(-sw / 2, sy - sh / 2, pzf + 0.065), (sw / 2, sy - sh / 2, pzf + 0.065), (sw / 2, sy + sh / 2, pzf + 0.065), (-sw / 2, sy + sh / 2, pzf + 0.065)], (0, 0, 1))
    else:
        sy = PH + 0.225; zf_ = Z0 + PD + 0.15
        face(plate, [(-sw / 2, sy - sh / 2, zf_ + 0.006), (sw / 2, sy - sh / 2, zf_ + 0.006), (sw / 2, sy + sh / 2, zf_ + 0.006), (-sw / 2, sy + sh / 2, zf_ + 0.006)], (0, 0, 1))

    # ---------------- 完成 ----------------
    for k, m in accs.items():
        if k.startswith('glass'): m.finish(root, uv=False)
        else: m.finish(root, uv=True)
    if rcol: rcol.finish(root, uv=True, smooth=True)
    uv01(plate.finish(root, uv=True, props=dict({'text': pl['text'], 'bg': '#d8d0c0', 'color': '#3b2a1e', 'serif': 1}, **({'fs': pl['fs']} if pl.get('fs') else {}))))   # fs：字高是板面高的幾倍（遊戲的 wzPlateTex；沒給＝0.6）
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    st = ARGS[ARGS.index('--set') + 1] if '--set' in ARGS else 'library'
    build(SETS[st], ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else None)
