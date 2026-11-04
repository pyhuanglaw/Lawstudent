"""普通教學館、博雅教學館的外觀（校園世界座標）→ assets/models/env/second_ai/campus_putong.glb、campus_boya.glb。LAWWW2-C 2026-10-18（ART-EXT-TEACH 外觀；使用者 10-18 03:3x「四座全部改」）：
  /opt/blenv/bin/python tools/blender/env_second/campus_teach.py -- --set putong|boya

**依文字資料的遊戲化設計，不是照片還原**（docs/art-rebuild/second_ai/research/四棟教學館與宿舍_參考資料.md 第 2、3 節；使用者給的照片連結沙盒打不開）：
  普通：1991 年重建、五層樓、磚紅色、和周圍建築協調；二樓有空橋往北接博雅。→ 紅褐色面磚、洗石子的樓層帶與窗框、磚柱一開間一開間、正面中間平頂門廊、北面二樓空橋的門。
  博雅：2011 年啟用、地上五層＋地下一層；境向聯合建築師事務所；一樓三處大型公共空間、階梯教室；入口在西南（綠園）與東側；北邊是醉月湖。
        → 現代的設計推測：淺灰石材板、一樓整面玻璃（大廳）＋往外挑的樓板、上層橫向長窗＋垂直鋁鰭、樓梯間一道直的石材量體、薄的出挑屋頂板。
位置、佔地照 src/zones3d.js：
  普通 CK.hall({w:34,d:16,floors:4,gfh:4.0,fh:3.5,…,arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}})＋ckPlace(putongB,-38,-58.5,0)：門廊側牆 x=±1.89（九開間，一開間 3.78）、深 2.0；
  博雅 CK.modern({w:34,d:18,floors:4,gfh:4.4,fh:3.85})＋ckPlace(boyaB,-38,-83,0)：本體 34×18（沒有門廊）。
  正面（本地 +z）朝南；本體範圍和套件一樣 → 導航阻擋、門口互動點（classes3d.js DOORS.putong (−38,−49.4)、DOORS.boya (−38,−72.8)）不用改。
  樓層數照真的：五層（套件四層；patch 一起改，鏡頭碰撞跟著變高）。普通一樓 4.0 m＝校園空橋外觀的高度（zones3d.js 的 Y0）；博雅一樓 4.6 m＝空橋往北升 0.6 m 的那一端。
材質名稱沿用校園地標的約定（attachWenzhouModel）：ck_glass、ck_frame、ck_trim_win、ck_stone_base、ck_ceiling、wz_lamp_lens、ck_board；招牌 PLATE_FACE_*。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, bpy   # noqa: E402
from cafe_layout import uv01   # noqa: E402
import archkit as K   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
SET = arg('--set', 'putong')


def build_putong():
    W, D = 34.0, 16.0; YF = [0.0, 4.0, 7.6, 11.2, 14.8, 18.4]; TOP = YF[-1]; NF = 5; PAR = 1.1
    NB = 9; BW = W / NB; PD, PH, PW2 = 2.0, 3.4, BW / 2
    out = arg('--out') or os.path.join(L.ROOT, 'assets/models/env/second_ai/campus_putong.glb')   # --out：先輸出到別的地方看
    B.reset(texres=512)
    root = B.group('campus_putong', props={'kind': 'campus_putong'})
    M = {
        'wall': L.pbr('ck_wall', 'exterior_wall_cladding_02', tile=2.0, target='#9a5341', normal=0.8, maps=('diff', 'nor'), rough_value=0.88),
        'trim': L.pbr('ck_trim', 'granular_concrete', tile=2.0, sat=0.3, target='#cfc8b8', normal=0.4, maps=('diff', 'nor'), res=512, rough_value=0.85),   # 洗石子
        'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target='#8f8a82', maps=('diff',), res=256, rough_value=0.7),
        'ceil': L.flat('ck_ceiling', '#e2dccf', rough=0.95),
        'frame': L.flat('ck_frame', '#8e9295', rough=0.4, metal=0.35),
        'glass': L.vc_material('ck_glass', rough=0.12),
        'misc': L.vc_material('pt_misc', rough=0.55),
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),
        'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
    }
    M['trimw'] = M['trim']; K.setup_glass(M['glass'])
    accs = {}; VC = ('glass', 'misc'); plates = []
    kit = K.Kit(M, accs, 'pt_', place=(-38.0, -58.5, 0.0), vc=VC)
    Fc = K.faces4(W, D); FRONT, BACK, LEFT, RIGHT = Fc['front'], Fc['back'], Fc['left'], Fc['right']
    def lit(*k): return K.lit_hash(23, *k)
    BAYS = [-W / 2 + BW * (i + 0.5) for i in range(NB)]; PIERS = [-W / 2 + BW * i for i in range(NB + 1)]
    # TEACH-PTBOYA-REF-1104（使用者 11-04「普通 博雅 教學館跟真正的太不像」；官網照片 putong_web_02、03；D136 像但不照抄）：
    #   一樓半圓拱廊（真的走得進去；這裡導航不能動 → 0.9 m 深的盲拱、後面整面玻璃）、綠色玻璃樓梯塔（真的在正面中段、頂是半圓拱 → 這裡東邊第二開間、平頂）、
    #   中央山牆（真的是三角山牆＋圓窗 → 這裡三段的階梯山牆＋方形百葉）；紅褐面磚、洗石子樓層帶、五層照舊
    TJ = 7; UT = BAYS[TJ]; TW = BW - 0.56; TTOP = TOP + PAR + 2.2
    M['gframe'] = L.flat('pt_green_frame', '#2e5646', rough=0.4, metal=0.3)
    # 立面：每層每開間一扇窗（洗石子窗框、鋁窗）；正面中間開間一樓是門廊；背面中間開間二樓是空橋的門
    for (fr, side) in ((FRONT, 'S'), (BACK, 'N')):
        for fl in range(NF):
            v0, v1 = YF[fl], YF[fl + 1]; sill = v0 + (1.05 if fl == 0 else 0.95); hs = []
            for j, u in enumerate(BAYS):
                uu = u if side == 'S' else -u
                if side == 'S' and fl == 0 and abs(u) < 0.1: continue
                if side == 'S' and fl == 0:                                                     # 一樓的盲拱：寬 2.86、拱頂 3.5 m、深 0.9 m，後面整面玻璃（直櫺三支、橫櫺一道）；門廊兩邊那一間窄一點（不碰門廊側牆）
                    nar = j in (3, 5); uu = u + (0.15 if j == 5 else -0.15 if j == 3 else 0.0); K.NSEG = 12
                    h = kit.window(fr, uu, 0.12, 2.6 if nar else 2.86, 3.38, 0.14, lit(1, fl, j), rect_=False, dep=0.9, proud=0.05, has_sill=False, mull=[-0.65, 0.0, 0.65] if nar else [-0.72, 0.0, 0.72], transom=2.1)
                    K.NSEG = 6; h['nseg'] = 12; hs.append(h); continue
                if side == 'S' and j == TJ and fl >= 1: hs.append({'u': UT, 'a': TW / 2, 'vb': v0, 'vs': v1, 'arch': False, 'vt': v1}); continue   # 樓梯塔的玻璃（下面另外做）
                if side == 'N' and fl == 1 and abs(-u - (-3.2)) < BW / 2:                    # 空橋的門（本地 x=−3.2，北面的立面座標 u＝−x）
                    hs.append(kit.window(fr, 3.2, v0 + 0.02, 1.8, 2.8, 0.15, False, dep=0.25, proud=0.05, door=True)); continue
                hs.append(kit.window(fr, uu, sill, 2.1, 1.65 if fl else 1.9, 0.14, lit(1 if side == 'S' else 2, fl, j), dep=0.22, proud=0.05, mull=[-0.35, 0.35], transom=1.15))
            if side == 'S' and fl == 0:
                kit.wall_strip(fr, -W / 2, -PW2 - 0.45, v0, v1, [h for h in hs if h['u'] < 0]); kit.wall_strip(fr, PW2 + 0.45, W / 2, v0, v1, [h for h in hs if h['u'] > 0])
            else:
                kit.wall_strip(fr, -W / 2, W / 2, v0, v1, hs)
        for u in PIERS:                                                                         # 磚柱（外凸 0.14，到女兒牆頂）
            if side == 'S' and abs(abs(u) - PW2) < 0.05: y0 = PH + 0.3
            else: y0 = 0.0
            yt_ = TTOP + 0.2 if (side == 'S' and min(abs(u - UT + BW / 2), abs(u - UT - BW / 2)) < 0.05) else TOP + PAR
            kit.fbox('wall', fr, u - 0.28, u + 0.28, y0, yt_, 0.0, 0.14, skip=('in', 'bottom'))
            if side == 'S' and y0 == 0.0: kit.fbox('base', fr, u - 0.32, u + 0.32, 0.0, 0.6, 0.0, 0.18, skip=('in', 'bottom'))   # 柱腳（花崗石；原本一樓整排的石材腰帶會蓋住拱）
        for k in range(1, NF):                                                                  # 洗石子樓層帶（外凸 0.1，在磚柱前面）；正面二樓以上在樓梯塔那一間斷開（綠色玻璃整條通上去）
            segs = [(-W / 2 - 0.2, W / 2 + 0.2)]
            if side == 'S' and k == 1: segs = [(-W / 2 - 0.2, -PW2), (PW2, W / 2 + 0.2)]
            elif side == 'S': segs = [(-W / 2 - 0.2, UT - TW / 2), (UT + TW / 2, W / 2 + 0.2)]
            for (a, b_) in segs: kit.fbox('trim', fr, a, b_, YF[k] - 0.22, YF[k] + 0.12, 0.0, 0.2, skip=('in',))
        if side == 'S':
            for (a, b_) in ((-W / 2 - 0.3, UT - TW / 2), (UT + TW / 2, W / 2 + 0.3)): kit.fbox('trim', fr, a, b_, TOP + PAR, TOP + PAR + 0.2, -0.2, 0.3, skip=())   # 女兒牆壓頂（簷口）
            kit.wall_strip(fr, -W / 2, W / 2, TOP, TOP + PAR, [{'u': UT, 'a': TW / 2, 'vb': TOP, 'vs': TOP + PAR, 'arch': False, 'vt': TOP + PAR}])
        else:
            kit.fbox('trim', fr, -W / 2 - 0.3, W / 2 + 0.3, TOP + PAR, TOP + PAR + 0.2, -0.2, 0.3, skip=())
            kit.wall_strip(fr, -W / 2, W / 2, TOP, TOP + PAR, [])
        kit.fbox('base', fr, -W / 2 - 0.06, W / 2 + 0.06, 0.0, 0.9, 0.0, 0.06, skip=('in', 'bottom')) if side == 'N' else None
    for fr, side in ((LEFT, -1), (RIGHT, 1)):                                                 # 兩端：每層兩扇窗（樓梯間、廁所）
        for fl in range(NF):
            v0, v1 = YF[fl], YF[fl + 1]; hs = []
            for j, u in enumerate((-3.6, 3.6)): hs.append(kit.window(fr, u, v0 + 1.0, 1.4, 1.5, 0.14, lit(3, fl, j, side), dep=0.22, proud=0.05, mull=[0.0]))
            kit.wall_strip(fr, -D / 2, D / 2, v0, v1, hs)
        for k in range(1, NF): kit.fbox('trim', fr, -D / 2 - 0.2, D / 2 + 0.2, YF[k] - 0.22, YF[k] + 0.12, 0.0, 0.2, skip=('in',))
        kit.fbox('trim', fr, -D / 2 - 0.3, D / 2 + 0.3, TOP + PAR, TOP + PAR + 0.2, -0.2, 0.3, skip=('l', 'r'))
        kit.wall_strip(fr, -D / 2, D / 2, TOP, TOP + PAR, [])
        kit.fbox('base', fr, -D / 2 - 0.06, D / 2 + 0.06, 0.0, 0.9, 0.0, 0.06, skip=('in', 'bottom'))
        for u in (-D / 2, D / 2): kit.fbox('wall', fr, u - 0.28, u + 0.28, 0.0, TOP + PAR, 0.0, 0.14, skip=('in', 'bottom'))
    # 屋頂：女兒牆內面、屋面、樓梯間出口、水塔、冷氣室外機
    for (p0, p1, n) in (((-W / 2 + 0.2, D / 2 - 0.2), (W / 2 - 0.2, D / 2 - 0.2), (0, 0, -1)), ((-W / 2 + 0.2, -D / 2 + 0.2), (W / 2 - 0.2, -D / 2 + 0.2), (0, 0, 1))):
        kit.face('wall', [(p0[0], TOP, p0[1]), (p1[0], TOP, p1[1]), (p1[0], TOP + PAR, p1[1]), (p0[0], TOP + PAR, p0[1])], n)
    for s_ in (-1, 1): kit.face('wall', [(s_ * (W / 2 - 0.2), TOP, -D / 2 + 0.2), (s_ * (W / 2 - 0.2), TOP, D / 2 - 0.2), (s_ * (W / 2 - 0.2), TOP + PAR, D / 2 - 0.2), (s_ * (W / 2 - 0.2), TOP + PAR, -D / 2 + 0.2)], (-s_, 0, 0))
    kit.box('misc', -W / 2 + 0.2, W / 2 - 0.2, TOP, TOP + 0.02, -D / 2 + 0.2, D / 2 - 0.2, skip=('bottom',), col='#8a6f60')
    kit.box('wall', -6.0, -1.0, TOP, TOP + 3.0, -4.0, 1.0, skip=('bottom',))                   # 樓梯間出口
    kit.box('trim', -6.2, -0.8, TOP + 3.0, TOP + 3.2, -4.2, 1.2)
    kit.box('trim', -5.6, -1.4, TOP + 3.2, TOP + 4.6, -3.6, 0.6)                                 # 水塔
    for (x, z) in ((6.0, 3.0), (7.3, 3.0), (8.6, 3.0), (12.0, -3.5), (13.3, -3.5), (-12.0, 4.0)):
        kit.box('misc', x - 0.45, x + 0.45, TOP + 0.02, TOP + 0.75, z - 0.18, z + 0.18, skip=('bottom',), col='#d8d7d1')
    # 門廊（套件的位置：側牆 x=±1.89、厚 0.9、深 2.0）：v2（TEACH-PTBOYA）平頂雨遮 → 拱門（前面一道 0.35 m 的磚牆、洗石子拱框，和兩邊的盲拱同一條拱頂線 3.5 m）；裡面玻璃門照舊
    z0, z1 = D / 2, D / 2 + PD; PHA = 3.6; ra = PW2 - 0.45; vsa = 3.5 - ra; TK = 0.35
    for s_ in (-1, 1):
        kit.box('trim', s_ * PW2 - 0.45, s_ * PW2 + 0.45, 0.0, PHA, z0, z1 - TK, skip=('bottom', 'top', 'back'))
        kit.box('base', s_ * PW2 - 0.49, s_ * PW2 + 0.49, 0.0, 0.6, z0, z1 - TK + 0.02, skip=('bottom', 'back'))
    PF = K.Fr((0, 0, z1), (1, 0, 0), (0, 0, 1)); PB = K.Fr((0, 0, z1 - TK), (-1, 0, 0), (0, 0, -1)); NS = 12
    kit.wall_strip(PF, -PW2 - 0.45, PW2 + 0.45, 0.0, YF[1], [{'u': 0.0, 'a': ra + 0.16, 'vb': 0.0, 'vs': vsa, 'arch': True, 'vt': 0.0, 'nseg': NS}])
    kit.wall_strip(PB, -PW2 - 0.45, PW2 + 0.45, 0.0, PHA, [{'u': 0.0, 'a': ra, 'vb': 0.0, 'vs': vsa, 'arch': True, 'vt': 0.0, 'nseg': NS}], mk='trimw')
    I, O = K.arc(0.0, vsa, ra, NS), K.arc(0.0, vsa, ra + 0.16, NS); tw = kit.acc('trimw')
    for k in range(NS):                                                                          # 拱框（洗石子）＋拱底面
        kit.face(tw, [PF.p(*I[k]), PF.p(*I[k + 1]), PF.p(*O[k + 1]), PF.p(*O[k])], PF.N)
        a_ = math.pi * (1 - (k + 0.5) / NS); kit.strip(tw, PF, I[k], I[k + 1], 0.0, -TK, (-math.cos(a_), -math.sin(a_), 0))
    for s_ in (-1, 1):
        kit.rect(tw, PF, min(s_ * ra, s_ * (ra + 0.16)), max(s_ * ra, s_ * (ra + 0.16)), 0.0, vsa)
        kit.strip(tw, PF, (s_ * ra, 0.0), (s_ * ra, vsa), 0.0, -TK, (-s_, 0, 0))
    kit.box('trim', -PW2 - 0.45, PW2 + 0.45, PHA, YF[1], z0, z1 - TK, skip=('bottom', 'back', 'front'))   # 門廊屋頂
    kit.box('trim', -PW2 - 0.52, PW2 + 0.52, YF[1], YF[1] + 0.12, z1 - TK - 0.05, z1 + 0.06)                # 拱門牆的壓頂
    kit.face('ceil', [(-PW2 + 0.45, PHA - 0.001, z0), (PW2 - 0.45, PHA - 0.001, z0), (PW2 - 0.45, PHA - 0.001, z1 - TK), (-PW2 + 0.45, PHA - 0.001, z1 - TK)], (0, -1, 0))
    kit.box('base', -PW2 + 0.45, PW2 - 0.45, 0.0, 0.1, z0, z1 + 0.6, skip=('bottom',))
    DOORF = K.Fr((0, 0, z0), (1, 0, 0), (0, 0, 1))
    dh = kit.window(DOORF, 0.0, 0.1, 2.2, 2.6, 0.0, False, dep=0.12, door=True)
    kit.wall_strip(DOORF, -PW2 + 0.45, PW2 - 0.45, 0.0, PHA, [dh])
    fm = kit.acc('frame')
    for (ua, ub, va, vb_) in ((-1.1, -1.05, 0.1, 2.7), (1.05, 1.1, 0.1, 2.7), (-0.025, 0.025, 0.1, 2.2), (-1.1, 1.1, 2.15, 2.21), (-1.1, 1.1, 2.65, 2.7)):
        kit.rect(fm, DOORF, ua, ub, va, vb_, -0.1)
    for (ua, ub) in ((-1.05, -0.025), (0.025, 1.05)): kit.glass_face(DOORF, [(ua, 0.12), (ub, 0.12), (ub, 2.15), (ua, 2.15)], -0.105, True, 0.1, 2.7)
    kit.glass_face(DOORF, [(-1.05, 2.21), (1.05, 2.21), (1.05, 2.65), (-1.05, 2.65)], -0.105, True, 0.1, 2.7)
    lens, zc = kit.acc('lamp'), (z0 + z1 - TK) / 2
    kit.box(lens, -0.3, 0.3, PHA - 0.1, PHA - 0.001, zc - 0.3, zc + 0.3, skip=('top',))
    m = Mesh('PLATE_FACE_PUTONG', M['board']); kit.face(m, [PF.p(-1.6, 3.68, 0.006), PF.p(1.6, 3.68, 0.006), PF.p(1.6, 3.95, 0.006), PF.p(-1.6, 3.95, 0.006)], PF.N)
    plates.append((m, {'text': '普通教學館', 'bg': '#e6e0d2', 'color': '#3a2f28', 'serif': 1, 'fs': 0.75}))
    # 綠色玻璃樓梯塔：二樓到屋頂上 2.2 m 一整條（深綠的框、橫框每 0.9 m；晚上樓梯間亮著）；屋頂上面是磚的樓梯間＋洗石子壓頂
    gl = kit.acc('glass'); gfm = kit.acc('gframe'); va, vb_ = YF[1] + 0.12, TTOP - 0.25; gx0, gx1 = UT - TW / 2, UT + TW / 2
    f = kit.face(gl, [FRONT.p(gx0, va, -0.12), FRONT.p(gx1, va, -0.12), FRONT.p(gx1, vb_, -0.12), FRONT.p(gx0, vb_, -0.12)], FRONT.N, [(0.125, 0.0), (0.125, 0.0), (0.125, 1.0), (0.125, 1.0)])   # 不當亮窗（u＝0.125）：亮窗的暖色會蓋掉綠色
    GB, GT = K.lin('#3f6e5d'), K.lin('#86b4a0')
    for lp in f.loops:
        t_ = max(0.0, min(1.0, (lp.vert.co.z - va) / (vb_ - va))); lp[gl.col] = [GB[i] + (GT[i] - GB[i]) * t_ for i in range(3)] + [1.0]
    for k in range(4): x_ = gx0 + TW * k / 3; kit.fbox(gfm, FRONT, x_ - 0.04, x_ + 0.04, va, vb_, -0.12, -0.04, skip=('in',))
    y_ = va
    while y_ <= vb_ + 1e-3: kit.fbox(gfm, FRONT, gx0, gx1, y_ - 0.03, y_ + 0.03, -0.12, -0.05, skip=('in',)); y_ += 0.9
    kit.fbox('trim', FRONT, gx0, gx1, va - 0.14, va, -0.12, 0.08, skip=('in',))                                # 窗台
    kit.box('wall', gx0 - 0.02, gx1 + 0.02, TOP + PAR - 0.02, TTOP, D / 2 - 3.2, D / 2 - 0.13, skip=('bottom', 'front'))   # 屋頂上的樓梯間
    kit.box('trim', gx0 - 0.42, gx1 + 0.42, TTOP, TTOP + 0.22, D / 2 - 3.35, D / 2 + 0.3)
    kit.face('wall', [FRONT.p(gx0, vb_, -0.12), FRONT.p(gx1, vb_, -0.12), FRONT.p(gx1, TTOP, -0.12), FRONT.p(gx0, TTOP, -0.12)], FRONT.N)
    # 中央的階梯山牆（三段，每段洗石子壓頂）＋方形百葉通風口
    gb = TOP + PAR
    for (hw, h0, h1) in ((5.67, gb, gb + 0.9), (3.6, gb + 0.9, gb + 1.8), (1.75, gb + 1.8, gb + 2.6)):
        kit.fbox('wall', FRONT, -hw, hw, h0, h1, -0.3, 0.14, skip=('bottom',))
        kit.fbox('trim', FRONT, -hw - 0.08, hw + 0.08, h1, h1 + 0.16, -0.38, 0.22, skip=())
    kit.fbox('trim', FRONT, -0.72, 0.72, gb + 1.12, gb + 2.3, 0.14, 0.19, skip=('in',))
    for k in range(7): kit.fbox('misc', FRONT, -0.6, 0.6, gb + 1.24 + k * 0.145, gb + 1.3 + k * 0.145, 0.19, 0.24, skip=('in',), col='#45484b')
    return finish(root, accs, VC, plates, out, '普通 v2（TEACH-PTBOYA-REF-1104）：五層紅褐面磚＋洗石子、一樓盲拱、拱門門廊、綠色玻璃樓梯塔、中央階梯山牆；照官網照片，D136 像但不照抄')


def build_boya():
    W, D = 34.0, 18.0; YF = [0.0, 4.6, 8.45, 12.3, 16.15, 20.0]; TOP = YF[-1]; NF = 5
    out = arg('--out') or os.path.join(L.ROOT, 'assets/models/env/second_ai/campus_boya.glb')   # --out：先輸出到別的地方看
    B.reset(texres=512)
    root = B.group('campus_boya', props={'kind': 'campus_boya'})
    M = {
        'wall': L.pbr('ck_wall', 'white_plaster_02', tile=3.0, sat=0.15, target='#cdcbc4', normal=0.3, maps=('diff', 'nor'), rough_value=0.8),   # 淺灰外牆（第一版 large_sandstone_blocks：算圖裡一塊一塊的白斑，像髒的石頭）
        'trim': L.pbr('ck_trim', 'concrete_wall_006', tile=3.0, sat=0.2, target='#bdbcb6', normal=0.3, maps=('diff',), res=512, rough_value=0.85),   # 樓板邊、屋頂板（清水模）
        'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target='#7f7c78', maps=('diff',), res=256, rough_value=0.7),
        'ceil': L.flat('ck_ceiling', '#e6e2da', rough=0.95),
        'frame': L.flat('ck_frame', '#4a4e52', rough=0.4, metal=0.4),
        'fin': L.flat('by_fin', '#8a8f94', rough=0.45, metal=0.35),
        'glass': L.vc_material('ck_glass', rough=0.1),
        'misc': L.vc_material('by_misc', rough=0.55),
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),
        'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
    }
    M['trimw'] = M['trim']; K.setup_glass(M['glass'])
    accs = {}; VC = ('glass', 'misc'); plates = []
    kit = K.Kit(M, accs, 'by_', place=(-38.0, -83.0, 0.0), vc=VC)
    Fc = K.faces4(W, D); FRONT, BACK, LEFT, RIGHT = Fc['front'], Fc['back'], Fc['left'], Fc['right']
    def lit(*k): return K.lit_hash(29, *k)

    def curtain(fr, u0, u1, v0, v1, step, key, door_at=None, door_w=0.0):
        """玻璃帷幕：直的鋁框每 step 一支、上下框、中間一道橫框；door_at＝玻璃門（中間兩支框之間）"""
        n = max(1, round((u1 - u0) / step)); st = (u1 - u0) / n
        for i in range(n):
            a, b_ = u0 + st * i, u0 + st * (i + 1)
            if door_at is not None and a < door_at + door_w / 2 and b_ > door_at - door_w / 2: continue
            kit.glass_face(fr, [(a, v0), (b_, v0), (b_, v1), (a, v1)], -0.02, lit(key, i), v0, v1)
        for i in range(n + 1):
            u = u0 + st * i; kit.fbox('frame', fr, u - 0.04, u + 0.04, v0, v1, -0.04, 0.12, skip=('in',))
        for v in (v0, v0 + (v1 - v0) * 0.72, v1): kit.fbox('frame', fr, u0, u1, v - 0.04, v + 0.04, -0.04, 0.1, skip=('in',))

    # 一樓：整面玻璃（大廳、公共空間），往內退 0.6（上面樓板挑出去）；兩端是石材實牆（階梯教室 101、102 的側面）
    SET_ = 0.6
    for (fr, side, ext) in ((FRONT, 'S', W), (BACK, 'N', W)):
        a0, a1 = -W / 2 + 8.0, W / 2 - 8.0
        IN = K.Fr(tuple(fr.O[i] - fr.N[i] * SET_ for i in range(3)), fr.R, fr.N)
        kit.wall_strip(fr, -W / 2, a0 - 0.0, 0.0, YF[1], []); kit.wall_strip(fr, a1, W / 2, 0.0, YF[1], [])
        curtain(IN, a0, a1, 0.15, YF[1] - 0.35, 1.5, 10 if side == 'S' else 11, door_at=0.0 if side == 'S' else None, door_w=3.0)
        kit.fbox('trim', IN, a0, a1, YF[1] - 0.35, YF[1], 0.0, 0.02, skip=('in',))
        kit.face('ceil', [IN.p(a0, YF[1] - 0.35, 0.0), IN.p(a1, YF[1] - 0.35, 0.0), fr.p(a1, YF[1] - 0.35, 0.0), fr.p(a0, YF[1] - 0.35, 0.0)], (0, -1, 0))   # 挑出樓板的底
        kit.box('base', *(sorted([IN.p(a0, 0, 0)[0], fr.p(a1, 0, 0)[0]])), 0.0, 0.02, *(sorted([IN.p(a0, 0, 0)[2], fr.p(a0, 0, 0)[2]])), skip=('bottom',)) if False else None
        for s_ in (-1, 1):                                                                       # 退縮處兩側的牆面
            u = a0 if s_ < 0 else a1
            kit.face('wall', [fr.p(u, 0.0, 0.0), IN.p(u, 0.0, 0.0), IN.p(u, YF[1] - 0.35, 0.0), fr.p(u, YF[1] - 0.35, 0.0)], tuple(fr.R[i] * -s_ for i in range(3)))
        if side == 'S':                                                                          # 玻璃門（中間 3 m）
            DF = IN
            for (ua, ub) in ((-1.5, -0.03), (0.03, 1.5)): kit.glass_face(DF, [(ua, 0.05), (ub, 0.05), (ub, 2.6), (ua, 2.6)], -0.02, True, 0.05, 2.6)
            for (ua, ub, va, vb_) in ((-1.55, -1.45, 0.0, 2.7), (1.45, 1.55, 0.0, 2.7), (-0.04, 0.04, 0.0, 2.6), (-1.55, 1.55, 2.6, 2.7)):
                kit.fbox('frame', DF, ua, ub, va, vb_, -0.04, 0.08, skip=('in',))
            kit.glass_face(DF, [(-1.5, 2.7), (1.5, 2.7), (1.5, YF[1] - 0.35), (-1.5, YF[1] - 0.35)], -0.02, True, 2.7, YF[1] - 0.35)
        kit.fbox('base', fr, -W / 2 - 0.05, a0, 0.0, 0.6, 0.0, 0.05, skip=('in', 'bottom')); kit.fbox('base', fr, a1, W / 2 + 0.05, 0.0, 0.6, 0.0, 0.05, skip=('in', 'bottom'))
    # 二～五樓：橫向長窗＋垂直鋁鰭；樓板邊（清水模帶）；東端一道直的樓梯間（石材、窄長窗）
    for (fr, side) in ((FRONT, 'S'), (BACK, 'N')):
        for fl in range(1, NF):
            v0, v1 = YF[fl], YF[fl + 1]; wb, wt = v0 + 0.95, v1 - 0.45
            kit.wall_strip(fr, -W / 2, W / 2, v0, wb, []); kit.wall_strip(fr, -W / 2, W / 2, wt, v1, [])
            kit.wall_strip(fr, -W / 2, -W / 2 + 1.2, wb, wt, []); kit.wall_strip(fr, W / 2 - 4.2, W / 2, wb, wt, [])
            kit.glass_face(fr, [(-W / 2 + 1.2, wb), (W / 2 - 4.2, wb), (W / 2 - 4.2, wt), (-W / 2 + 1.2, wt)], -0.12, lit(20 if side == 'S' else 21, fl), wb, wt)
            for (a, b_, c0, c1) in ((-W / 2 + 1.2, W / 2 - 4.2, wb - 0.0, wb + 0.02), (-W / 2 + 1.2, W / 2 - 4.2, wt - 0.02, wt)):
                kit.fbox('frame', fr, a, b_, c0, c1, -0.12, 0.0, skip=('in',))
            kit.face('trim', [fr.p(-W / 2 + 1.2, wb, 0.0), fr.p(W / 2 - 4.2, wb, 0.0), fr.p(W / 2 - 4.2, wb, -0.12), fr.p(-W / 2 + 1.2, wb, -0.12)], (0, 1, 0))
            kit.face('trim', [fr.p(-W / 2 + 1.2, wt, 0.0), fr.p(W / 2 - 4.2, wt, 0.0), fr.p(W / 2 - 4.2, wt, -0.12), fr.p(-W / 2 + 1.2, wt, -0.12)], (0, -1, 0))
            for s_, uu in ((-1, -W / 2 + 1.2), (1, W / 2 - 4.2)):
                kit.face('trim', [fr.p(uu, wb, 0.0), fr.p(uu, wt, 0.0), fr.p(uu, wt, -0.12), fr.p(uu, wb, -0.12)], tuple(fr.R[i] * -s_ for i in range(3)))
            u = -W / 2 + 1.2 + 1.2
            while u < W / 2 - 4.4:
                kit.fbox('fin', fr, u - 0.025, u + 0.025, wb, wt, -0.12, 0.3, skip=('in',)); u += 1.2   # 垂直鋁鰭（第一版 0.9 m 一支、深 0.42：斜看整排黑色）
            nar = W / 2 - 2.1 if side == 'S' else -(W / 2 - 2.1)
            kit.glass_face(fr, [(W / 2 - 2.6, v0 + 0.6), (W / 2 - 1.6, v0 + 0.6), (W / 2 - 1.6, v1 - 0.6), (W / 2 - 2.6, v1 - 0.6)], 0.002, lit(22, fl, side == 'S'), v0, v1)
        for k in range(1, NF + 1):
            kit.fbox('trim', fr, -W / 2 - 0.05, W / 2 + 0.05, YF[k] - 0.25, YF[k] + 0.05, 0.0, 0.5 if k == 1 else 0.12, skip=('in',))
    for fr, side in ((LEFT, -1), (RIGHT, 1)):
        for fl in range(NF):
            v0, v1 = YF[fl], YF[fl + 1]; hs = []
            if fl: hs.append(kit.window(fr, 0.0, v0 + 0.95, 6.0, v1 - v0 - 1.4, 0.0, lit(30, fl, side), dep=0.15, proud=0.0, mull=[-2.0, 0.0, 2.0], has_sill=False))
            elif side > 0:   # 東側一樓：大廳的玻璃帶（2026-10-21 LAWWW2 ART-ECON-3D-GAP：原本整面沒開口的牆，經濟系每天走小椰林道過來，站在東側看整個畫面是一片灰牆；資料：入口在西南與東側）
                hs.append(kit.window(fr, 0.0, 0.6, 13.0, YF[1] - 0.55 - 0.6, 0.0, True, dep=0.15, proud=0.0, mull=[-6.5 + 1.625 * k for k in range(1, 8)], has_sill=False, transom=2.0))
            kit.wall_strip(fr, -D / 2, D / 2, v0, v1, hs)
        for k in range(1, NF + 1): kit.fbox('trim', fr, -D / 2 - 0.05, D / 2 + 0.05, YF[k] - 0.25, YF[k] + 0.05, 0.0, 0.12, skip=('in',))
        kit.fbox('base', fr, -D / 2 - 0.05, D / 2 + 0.05, 0.0, 0.6, 0.0, 0.05, skip=('in', 'bottom'))
    # 屋頂：薄的出挑屋頂板（四面挑出 0.9 m）、屋面、機房
    kit.box('trim', -W / 2 - 0.9, W / 2 + 0.9, TOP + 0.6, TOP + 0.85, -D / 2 - 0.9, D / 2 + 0.9)
    for (a, b_, c0, c1) in ((-W / 2, W / 2, D / 2 - 0.2, D / 2), (-W / 2, W / 2, -D / 2, -D / 2 + 0.2), (-W / 2, -W / 2 + 0.2, -D / 2 + 0.2, D / 2 - 0.2), (W / 2 - 0.2, W / 2, -D / 2 + 0.2, D / 2 - 0.2)):
        kit.box('wall', a, b_, TOP, TOP + 0.6, c0, c1, skip=('bottom', 'top'))
    for (x, z) in ((-12.0, -3.0), (-10.5, -3.0), (8.0, 4.0), (9.5, 4.0)):
        kit.box('misc', x - 0.5, x + 0.5, TOP + 0.02, TOP + 0.55, z - 0.3, z + 0.3, skip=('bottom',), col='#c9c8c3')
    # 入口雨遮（南面中間，往外挑 2.4 m 的薄板＋兩支細鋼柱）、名牌
    zf = D / 2
    kit.box('trim', -3.0, 3.0, 3.6, 3.8, zf, zf + 2.4)
    kit.face('ceil', [(-3.0, 3.599, zf), (3.0, 3.599, zf), (3.0, 3.599, zf + 2.4), (-3.0, 3.599, zf + 2.4)], (0, -1, 0))
    for x in (-2.7, 2.7): kit.box('frame', x - 0.06, x + 0.06, 0.0, 3.6, zf + 2.1, zf + 2.22, skip=('bottom',))
    for x in (-1.6, 1.6): kit.box(kit.acc('lamp'), x - 0.25, x + 0.25, 3.56, 3.6, zf + 1.0, zf + 1.5, skip=('top',))
    SIGNF = K.Fr((0, 0, zf + 2.4), (1, 0, 0), (0, 0, 1))
    m = Mesh('PLATE_FACE_BOYA', M['board']); kit.face(m, [SIGNF.p(-2.4, 3.62, 0.006), SIGNF.p(2.4, 3.62, 0.006), SIGNF.p(2.4, 3.78, 0.006), SIGNF.p(-2.4, 3.78, 0.006)], SIGNF.N)
    plates.append((m, {'text': '博思教學館', 'bg': '#d9d6cf', 'color': '#2c2f33', 'serif': 0, 'fs': 0.8}))
    return finish(root, accs, VC, plates, out, '博雅：五層現代建築（淺灰石材、玻璃大廳、橫向長窗＋鋁鰭）；依文字資料推測（沒有照片）')


def finish(root, accs, VC, plates, out, note):
    K.finish(accs, root, VC)
    for (m, props) in plates: uv01(m.finish(root, uv=True, props=props))
    pre = 'pt' if 'putong' in out else 'by'
    VCM = L.vc_material(f'wz_vc_{pre}', rough=0.55)
    L.vc_consolidate(root, {n: VCM for n in (f'{pre}_misc', 'ck_ceiling', 'ck_frame')})
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False); info['note'] = note
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(build_putong() if SET == 'putong' else build_boya())
