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
        'base': L.flat('ck_stone_base', '#8f8a82', rough=0.7),   # v2：純色（併進頂點色材質：teach_east 鏡頭 draw call，BB-C 15:4x）
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
    for s_ in (-1, 1): kit.face('wall', [(s_ * (PW2 + 0.45), 0.0, z1 - TK), (s_ * (PW2 + 0.45), 0.0, z1), (s_ * (PW2 + 0.45), YF[1], z1), (s_ * (PW2 + 0.45), YF[1], z1 - TK)], (s_, 0, 0))   # 拱門牆的兩端（厚 0.35；沒封會看到一條黑縫）
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
    """v2（TEACH-PTBOYA-REF-1104，使用者 11-04「普通 博雅 教學館跟真正的太不像」；官網照片 boya_web_03～06；D136 像但不照抄）：
    保留：五層、白色＋玻璃的樓層、一樓玻璃大廳、樓板邊的清水模帶。
    改成照片的感覺：靠普通那面（南面）二樓以上改紅磚＋深的小方窗；主入口清水混凝土大雨遮（真的是正中間一個圓洞 → 這裡一排五個小方形天窗（v2b，BB D136），雨遮往東偏、避開西邊的空橋）；
      北面一大片長草的斜坡一路到二樓（二樓以上往南退到 z=−2.5），斜坡上一道木格柵樓梯（真的通到屋頂花園 → 這裡底下關著門）；入口上方木格柵、一樓圓柱。
    不動：導航（CK.modern 34×18 本體）、門口 DOORS.boya、空橋（x=−41.2、二樓 4.6 m）、樓層高度。"""
    W, D = 34.0, 18.0; YF = [0.0, 4.6, 8.45, 12.3, 16.15, 20.0]; TOP = YF[-1]; NF = 5; NZ = -2.5
    out = arg('--out') or os.path.join(L.ROOT, 'assets/models/env/second_ai/campus_boya.glb')   # --out：先輸出到別的地方看
    B.reset(texres=512)
    root = B.group('campus_boya', props={'kind': 'campus_boya'})
    M = {
        'wall': L.pbr('ck_wall', 'white_plaster_02', tile=3.0, sat=0.15, target='#d6d4cd', normal=0.3, maps=('diff', 'nor'), rough_value=0.8),
        'trim': L.pbr('ck_trim', 'socsci_formwork', tile=2.4, sat=0.2, target='#bcbab3', normal=0.45, maps=('diff', 'nor'), res=512, rough_value=0.82),   # 清水模（有模板的分格和繫桿孔）：樓板邊、雨遮、擋土牆
        'base': L.flat('ck_stone_base', '#7f7c78', rough=0.7),   # 純色（併進頂點色材質：teach_east 鏡頭 draw call，BB-C 15:4x）
        'brick': L.pbr('by_brick', 'red_brick_03', tile=1.6, target='#ad6249', normal=0.6, maps=('diff', 'nor'), rough_value=0.86),   # 靠普通那面的紅磚（比普通的紅褐色淺、偏橘）
        'grass': L.pbr('by_grass', 'leafy_grass', tile=2.5, target='#5b7a3a', maps=('diff',), res=256, rough_value=0.95),
        'wood': L.flat('by_wood', '#a8743f', rough=0.6),   # 木格柵：純色（細的直條看不出木紋；併進頂點色材質）
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
    BACK2 = K.Fr((0.0, 0, NZ), (-1, 0, 0), (0, 0, -1))   # 二樓以上的北面（往南退）
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

    def column(x, z, r, y0, y1, mk='trim', n=12):
        m = kit.acc(mk)
        for k in range(n):
            a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
            p0, p1 = (x + r * math.cos(a0), z + r * math.sin(a0)), (x + r * math.cos(a1), z + r * math.sin(a1))
            kit.face(m, [(p0[0], y0, p0[1]), (p1[0], y0, p1[1]), (p1[0], y1, p1[1]), (p0[0], y1, p0[1])], (math.cos((a0 + a1) / 2), 0, math.sin((a0 + a1) / 2)))

    # ---- 一樓南面：玻璃大廳（往內退 0.6）、兩端實牆（東端清水模、西端白牆）、四支圓柱、門上方木格柵
    SET_ = 0.6; fr = FRONT; a0, a1 = -W / 2 + 8.0, W / 2 - 8.0
    IN = K.Fr(tuple(fr.O[i] - fr.N[i] * SET_ for i in range(3)), fr.R, fr.N)
    kit.wall_strip(fr, -W / 2, a0, 0.0, YF[1], []); kit.wall_strip(fr, a1, W / 2, 0.0, YF[1], [], mk='trim')
    curtain(IN, a0, a1, 0.15, YF[1] - 0.35, 1.5, 10, door_at=0.0, door_w=3.0)
    kit.fbox('trim', IN, a0, a1, YF[1] - 0.35, YF[1], 0.0, 0.02, skip=('in',))
    kit.face('ceil', [IN.p(a0, YF[1] - 0.35, 0.0), IN.p(a1, YF[1] - 0.35, 0.0), fr.p(a1, YF[1] - 0.35, 0.0), fr.p(a0, YF[1] - 0.35, 0.0)], (0, -1, 0))
    for s_ in (-1, 1):
        u = a0 if s_ < 0 else a1
        kit.face('wall' if s_ < 0 else 'trim', [fr.p(u, 0.0, 0.0), IN.p(u, 0.0, 0.0), IN.p(u, YF[1] - 0.35, 0.0), fr.p(u, YF[1] - 0.35, 0.0)], tuple(fr.R[i] * -s_ for i in range(3)))
    for (ua, ub) in ((-1.5, -0.03), (0.03, 1.5)): kit.glass_face(IN, [(ua, 0.05), (ub, 0.05), (ub, 2.6), (ua, 2.6)], -0.02, True, 0.05, 2.6)
    for (ua, ub, va, vb_) in ((-1.55, -1.45, 0.0, 2.7), (1.45, 1.55, 0.0, 2.7), (-0.04, 0.04, 0.0, 2.6), (-1.55, 1.55, 2.6, 2.7)):
        kit.fbox('frame', IN, ua, ub, va, vb_, -0.04, 0.08, skip=('in',))
    kit.glass_face(IN, [(-1.5, 2.7), (1.5, 2.7), (1.5, YF[1] - 0.35), (-1.5, YF[1] - 0.35)], -0.02, True, 2.7, YF[1] - 0.35)
    u = -2.9                                                                                      # 門上方的木格柵（直條 5 cm、間距 15 cm）
    while u <= 2.9 + 1e-6: kit.fbox('wood', IN, u - 0.025, u + 0.025, 2.78, YF[1] - 0.42, 0.03, 0.15, skip=('in',)); u += 0.15
    kit.fbox('wood', IN, -3.0, 3.0, 2.72, 2.78, 0.0, 0.16, skip=('in',)); kit.fbox('wood', IN, -3.0, 3.0, YF[1] - 0.42, YF[1] - 0.36, 0.0, 0.16, skip=('in',))
    for x in (-7.5, -4.5, 4.5, 7.5): column(x, D / 2 - 0.3, 0.28, 0.0, YF[1] - 0.35)
    kit.fbox('base', fr, -W / 2 - 0.05, a0, 0.0, 0.6, 0.0, 0.05, skip=('in', 'bottom'))
    # ---- 二～五樓南面（靠普通）：紅磚、深的小方窗（上面一道清水模遮陽板）；西邊二樓是空橋的入口；東端一道白框玻璃樓梯間
    BRW, BRH, BRS = 1.3, 1.65, 2.4; SX0, SX1 = 13.2, 16.6
    xs = [-W / 2 + 1.6 + BRS * k for k in range(12)]
    for fl in range(1, NF):
        v0, v1 = YF[fl], YF[fl + 1]; hs = []
        for k, u in enumerate(xs):
            if fl == 1 and abs(u + 3.2) < 1.9: continue
            hs.append(kit.window(FRONT, u, v0 + 1.0, BRW, BRH, 0.0, lit(40, fl, k), dep=0.4, proud=0.0, mull=[0.0], has_sill=False, fmat='trim'))
            kit.fbox('trim', FRONT, u - BRW / 2 - 0.1, u + BRW / 2 + 0.1, v0 + 1.0 + BRH, v0 + 1.0 + BRH + 0.08, 0.0, 0.34, skip=('in',))
        if fl == 1: hs.append(kit.window(FRONT, -3.2, v0 + 0.02, 2.9, 2.75, 0.0, False, dep=0.3, proud=0.0, mull=[0.0], has_sill=False, transom=2.25))   # 空橋的入口（空橋的 GLB 從普通那邊接過來，蓋在這裡）
        hs.append({'u': (SX0 + SX1) / 2, 'a': (SX1 - SX0) / 2, 'vb': v0, 'vs': v1, 'arch': False, 'vt': v1})
        kit.wall_strip(FRONT, -W / 2, W / 2, v0, v1, hs, mk='brick')
    kit.glass_face(FRONT, [(SX0, YF[1]), (SX1, YF[1]), (SX1, TOP + 0.6), (SX0, TOP + 0.6)], -0.15, True, YF[1], TOP + 0.6)   # 樓梯間的玻璃（白框）
    for k in range(4): x_ = SX0 + (SX1 - SX0) * k / 3; kit.fbox('misc', FRONT, x_ - 0.05, x_ + 0.05, YF[1], TOP + 0.6, -0.15, -0.02, skip=('in',), col='#ecebe6')
    y_ = YF[1]
    while y_ <= TOP + 0.6 + 1e-6: kit.fbox('misc', FRONT, SX0, SX1, y_ - 0.04, y_ + 0.04, -0.15, -0.03, skip=('in',), col='#ecebe6'); y_ += 1.28
    for s_, uu in ((-1, SX0), (1, SX1)): kit.face('brick', [FRONT.p(uu, YF[1], 0.0), FRONT.p(uu, TOP + 0.6, 0.0), FRONT.p(uu, TOP + 0.6, -0.15), FRONT.p(uu, YF[1], -0.15)], tuple(FRONT.R[i] * -s_ for i in range(3)))
    # ---- 主入口的清水混凝土大雨遮（二樓樓板高、往外挑 3.6 m、厚 0.6）＋一排五個小方形天窗；底下四盞崁燈；名牌在雨遮前緣
    #   v2b（BB-C 16:3x BB_255，D136）：v2 的長條橢圓洞從低角度看和照片 06 的圓洞一樣（建築師很有辨識度的設計）→ 改成一排小方形天窗（0.6 m 見方、間距 1.4 m，靠外緣）
    CX0, CX1, CZ0, CZ1, CY0, CY1 = -1.2, 9.0, D / 2, D / 2 + 3.6, YF[1], YF[1] + 0.6
    HOLES = [(1.2 + 1.4 * k, D / 2 + 2.35, 0.3) for k in range(5)]   # (中心 x、中心 z、半邊長)
    xs_ = sorted(set([CX0, CX1] + [h[0] - h[2] for h in HOLES] + [h[0] + h[2] for h in HOLES])); zs_ = sorted(set([CZ0, CZ1] + [h[1] - h[2] for h in HOLES] + [h[1] + h[2] for h in HOLES]))
    cm_ = kit.acc('trim')
    for i in range(len(xs_) - 1):
        for j in range(len(zs_) - 1):
            xa, xb, za, zb = xs_[i], xs_[i + 1], zs_[j], zs_[j + 1]; mx, mz = (xa + xb) / 2, (za + zb) / 2
            if any(abs(mx - hx) < hr and abs(mz - hz) < hr for hx, hz, hr in HOLES): continue
            kit.face(cm_, [(xa, CY1, za), (xb, CY1, za), (xb, CY1, zb), (xa, CY1, zb)], (0, 1, 0)); kit.face(cm_, [(xa, CY0, za), (xb, CY0, za), (xb, CY0, zb), (xa, CY0, zb)], (0, -1, 0))
    for hx, hz, hr in HOLES:                                                                       # 天窗洞的四面內壁（朝洞裡）
        for (p0, p1, n) in (((hx - hr, hz - hr), (hx + hr, hz - hr), (0, 0, 1)), ((hx - hr, hz + hr), (hx + hr, hz + hr), (0, 0, -1)), ((hx - hr, hz - hr), (hx - hr, hz + hr), (1, 0, 0)), ((hx + hr, hz - hr), (hx + hr, hz + hr), (-1, 0, 0))):
            kit.face(cm_, [(p0[0], CY0, p0[1]), (p1[0], CY0, p1[1]), (p1[0], CY1, p1[1]), (p0[0], CY1, p0[1])], n)
    for (p0, p1, n) in (((CX0, CZ1), (CX1, CZ1), (0, 0, 1)), ((CX0, CZ0), (CX0, CZ1), (-1, 0, 0)), ((CX1, CZ0), (CX1, CZ1), (1, 0, 0))):
        kit.face(cm_, [(p0[0], CY0, p0[1]), (p1[0], CY0, p1[1]), (p1[0], CY1, p1[1]), (p0[0], CY1, p0[1])], n)
    for (x, z) in ((0.6, D / 2 + 1.0), (0.6, D / 2 + 2.6), (7.8, D / 2 + 1.0), (7.8, D / 2 + 2.6)): kit.box(kit.acc('lamp'), x - 0.18, x + 0.18, CY0 - 0.02, CY0, z - 0.18, z + 0.18, skip=('top',))
    SIGNF = K.Fr((0, 0, CZ1), (1, 0, 0), (0, 0, 1))
    m = Mesh('PLATE_FACE_BOYA', M['board']); kit.face(m, [SIGNF.p(1.4, CY0 + 0.14, 0.006), SIGNF.p(6.6, CY0 + 0.14, 0.006), SIGNF.p(6.6, CY1 - 0.12, 0.006), SIGNF.p(1.4, CY1 - 0.12, 0.006)], SIGNF.N)
    plates.append((m, {'text': '博思教學館', 'bg': '#c9c6bf', 'color': '#2c2f33', 'serif': 0, 'fs': 0.8}))
    # ---- 二～五樓北面（往南退到 z=−2.5）：白色＋玻璃的橫向長窗、垂直鋁鰭、清水模樓板帶；二樓在斜坡樓梯頂端開一扇玻璃門
    fr = BACK2; DU = -9.2
    for fl in range(1, NF):
        v0, v1 = YF[fl], YF[fl + 1]; wb, wt = v0 + 0.95, v1 - 0.45
        kit.wall_strip(fr, -W / 2, W / 2, v0, wb, [{'u': DU, 'a': 1.15, 'vb': v0, 'vs': wb, 'arch': False, 'vt': wb}] if fl == 1 else []); kit.wall_strip(fr, -W / 2, W / 2, wt, v1, [])
        kit.wall_strip(fr, -W / 2, -W / 2 + 1.2, wb, wt, []); kit.wall_strip(fr, W / 2 - 4.2, W / 2, wb, wt, [])
        kit.glass_face(fr, [(-W / 2 + 1.2, wb), (W / 2 - 4.2, wb), (W / 2 - 4.2, wt), (-W / 2 + 1.2, wt)], -0.12, lit(21, fl), wb, wt)
        if fl == 1:
            kit.glass_face(fr, [(DU - 1.1, v0 + 0.02), (DU + 1.1, v0 + 0.02), (DU + 1.1, wb), (DU - 1.1, wb)], -0.12, False, v0, wb)
            for uu in (DU - 1.12, DU, DU + 1.12): kit.fbox('frame', fr, uu - 0.03, uu + 0.03, v0, wb, -0.12, -0.04, skip=('in',))
        for (a, b_, c0, c1) in ((-W / 2 + 1.2, W / 2 - 4.2, wb - 0.0, wb + 0.02), (-W / 2 + 1.2, W / 2 - 4.2, wt - 0.02, wt)):
            kit.fbox('frame', fr, a, b_, c0, c1, -0.12, 0.0, skip=('in',))
        kit.face('trim', [fr.p(-W / 2 + 1.2, wb, 0.0), fr.p(W / 2 - 4.2, wb, 0.0), fr.p(W / 2 - 4.2, wb, -0.12), fr.p(-W / 2 + 1.2, wb, -0.12)], (0, 1, 0))
        kit.face('trim', [fr.p(-W / 2 + 1.2, wt, 0.0), fr.p(W / 2 - 4.2, wt, 0.0), fr.p(W / 2 - 4.2, wt, -0.12), fr.p(-W / 2 + 1.2, wt, -0.12)], (0, -1, 0))
        for s_, uu in ((-1, -W / 2 + 1.2), (1, W / 2 - 4.2)):
            kit.face('trim', [fr.p(uu, wb, 0.0), fr.p(uu, wt, 0.0), fr.p(uu, wt, -0.12), fr.p(uu, wb, -0.12)], tuple(fr.R[i] * -s_ for i in range(3)))
        u = -W / 2 + 1.2 + 1.2
        while u < W / 2 - 4.4:
            kit.fbox('fin', fr, u - 0.025, u + 0.025, wb, wt, -0.12, 0.3, skip=('in',)); u += 1.2
        kit.glass_face(fr, [(W / 2 - 2.6, v0 + 0.6), (W / 2 - 1.6, v0 + 0.6), (W / 2 - 1.6, v1 - 0.6), (W / 2 - 2.6, v1 - 0.6)], 0.002, lit(22, fl), v0, v1)
    for k in range(1, NF + 1):
        kit.fbox('trim', fr, -W / 2 - 0.05, W / 2 + 0.05, YF[k] - 0.25, YF[k] + 0.05, 0.0, 0.5 if k == 1 else 0.12, skip=('in',))
    # ---- 北面：長草的斜坡（一樓的屋頂，從 z=−9 高 0.3 m 斜到 z=−2.5 二樓樓板）＋木格柵樓梯（底下關著門）＋兩端清水模擋土牆
    zN = -D / 2; SL0, SL1 = 0.3, YF[1]; STX0, STX1 = 7.8, 10.6; NST = 26; RISE = SL1 / NST; RUN = (NZ - zN) / NST
    def sl(z): return SL0 + (SL1 - SL0) * (z - zN) / (NZ - zN)
    gm = kit.acc('grass')
    for (xa, xb) in ((-W / 2, STX0 - 0.2), (STX1 + 0.15, W / 2)):
        kit.face(gm, [(xa, SL0, zN), (xb, SL0, zN), (xb, SL1, NZ), (xa, SL1, NZ)], (0, 0.83, -0.56))
    kit.box('trim', -W / 2, W / 2, 0.0, SL0 + 0.06, zN - 0.06, zN + 0.22, skip=('bottom', 'top'))     # 斜坡底的清水模矮牆
    kit.box('trim', -W / 2, STX0 - 0.2, SL0 + 0.06, SL0 + 0.08, zN - 0.06, zN + 0.22, skip=('bottom',)); kit.box('trim', STX1 + 0.15, W / 2, SL0 + 0.06, SL0 + 0.08, zN - 0.06, zN + 0.22, skip=('bottom',))
    for k in range(NST):                                                                          # 樓梯（花崗石踏階；只做踏面和踢面）
        z0_ = zN + k * RUN; kit.box('base', STX0, STX1, 0.0, (k + 1) * RISE, z0_, z0_ + RUN, skip=('bottom', 'front', 'left', 'right'))
    for (xa, xb, sd) in ((STX0 - 0.2, STX0, 1), (STX1, STX1 + 0.15, -1)):                          # 樓梯兩邊的矮牆（清水模，高出斜坡 0.15）
        kit.face('trim', [(xa, sl(zN) + 0.15, zN), (xb, sl(zN) + 0.15, zN), (xb, sl(NZ) + 0.15, NZ), (xa, sl(NZ) + 0.15, NZ)], (0, 0.83, -0.56))
        xi = xb if sd > 0 else xa
        kit.face('trim', [(xi, 0.0, zN), (xi, SL1 - RISE, NZ), (xi, SL1 + 0.15, NZ), (xi, SL0 + 0.15, zN)], (sd, 0, 0))
        kit.face('trim', [(xa, 0.0, zN - 0.001), (xb, 0.0, zN - 0.001), (xb, SL0 + 0.15, zN - 0.001), (xa, SL0 + 0.15, zN - 0.001)], (0, 0, -1))
        xo = xa if sd > 0 else xb                                                                  # 矮牆外面（草那一側）高出斜坡的那 15 cm
        kit.face('trim', [(xo, sl(zN), zN), (xo, sl(NZ), NZ), (xo, sl(NZ) + 0.15, NZ), (xo, sl(zN) + 0.15, zN)], (-sd, 0, 0))
    z_ = zN + 0.12                                                                                # 樓梯東邊一排木格柵（照片 boya_web_03：直條遮陽）＋上面一道斜的木樑
    while z_ < NZ - 0.05:
        yb = sl(z_) + 0.15; kit.box('wood', STX1 + 0.02, STX1 + 0.12, yb, yb + 2.3, z_ - 0.035, z_ + 0.035, skip=('bottom',)); z_ += 0.18
    kit.face('wood', [(STX1 + 0.0, sl(zN) + 2.45, zN), (STX1 + 0.14, sl(zN) + 2.45, zN), (STX1 + 0.14, sl(NZ) + 2.45, NZ), (STX1 + 0.0, sl(NZ) + 2.45, NZ)], (0, 0.83, -0.56))
    kit.face('wood', [(STX1 + 0.14, sl(zN) + 2.3, zN), (STX1 + 0.14, sl(NZ) + 2.3, NZ), (STX1 + 0.14, sl(NZ) + 2.45, NZ), (STX1 + 0.14, sl(zN) + 2.45, zN)], (1, 0, 0))
    fm = kit.acc('frame'); GZ = zN - 0.08                                                          # 樓梯底的鐵門（關著）＋告示牌
    for x in (STX0 + 0.02, STX1 - 0.02): kit.box(fm, x - 0.04, x + 0.04, 0.0, 1.15, GZ - 0.04, GZ + 0.04, skip=('bottom',))
    for y in (0.12, 1.1): kit.box(fm, STX0, STX1, y - 0.025, y + 0.025, GZ - 0.02, GZ + 0.02)
    x = STX0 + 0.2
    while x < STX1 - 0.15: kit.box(fm, x - 0.012, x + 0.012, 0.12, 1.1, GZ - 0.012, GZ + 0.012); x += 0.14
    GF = K.Fr(((STX0 + STX1) / 2, 0, GZ - 0.03), (-1, 0, 0), (0, 0, -1))
    m = Mesh('PLATE_FACE_BOYA_GARDEN', M['board']); kit.face(m, [GF.p(-0.5, 0.52, 0.0), GF.p(0.5, 0.52, 0.0), GF.p(0.5, 0.86, 0.0), GF.p(-0.5, 0.86, 0.0)], GF.N)
    plates.append((m, {'text': '屋頂花園 整修中', 'bg': '#ece8de', 'color': '#3a3a3a', 'serif': 0, 'fs': 0.6}))
    # ---- 東西兩面：一樓（斜坡以南）＋二～五樓都在 z∈(−2.5, 9)；斜坡的側面是清水模擋土牆
    for fr, side in ((LEFT, -1), (RIGHT, 1)):
        ua, ub = (NZ, D / 2) if side < 0 else (-D / 2, -NZ); uc = (ua + ub) / 2
        for fl in range(NF):
            v0, v1 = YF[fl], YF[fl + 1]; hs = []
            if fl: hs.append(kit.window(fr, uc, v0 + 0.95, 6.0, v1 - v0 - 1.4, 0.0, lit(30, fl, side), dep=0.15, proud=0.0, mull=[-2.0, 0.0, 2.0], has_sill=False))
            elif side > 0: hs.append(kit.window(fr, uc, 0.6, 9.0, YF[1] - 0.55 - 0.6, 0.0, True, dep=0.15, proud=0.0, mull=[-4.5 + 1.5 * k for k in range(1, 6)], has_sill=False, transom=2.0))
            kit.wall_strip(fr, ua, ub, v0, v1, hs)
        for k in range(1, NF + 1): kit.fbox('trim', fr, ua - 0.05, ub + 0.05, YF[k] - 0.25, YF[k] + 0.05, 0.0, 0.12, skip=('in',))
        kit.fbox('base', fr, ua - 0.05, ub + 0.05, 0.0, 0.6, 0.0, 0.05, skip=('in', 'bottom'))
        xw = side * W / 2
        kit.face('trim', [(xw, 0.0, zN), (xw, 0.0, NZ), (xw, SL1, NZ), (xw, SL0 + 0.08, zN)], (side, 0, 0))
    # ---- 屋頂：薄的出挑屋頂板（四面挑出 0.9 m）、女兒牆（南面紅磚）、機房
    kit.box('trim', -W / 2 - 0.9, W / 2 + 0.9, TOP + 0.6, TOP + 0.85, NZ - 0.9, D / 2 + 0.9)
    for (a, b_, c0, c1, mk) in ((-W / 2, W / 2, D / 2 - 0.2, D / 2, 'brick'), (-W / 2, W / 2, NZ, NZ + 0.2, 'wall'), (-W / 2, -W / 2 + 0.2, NZ + 0.2, D / 2 - 0.2, 'wall'), (W / 2 - 0.2, W / 2, NZ + 0.2, D / 2 - 0.2, 'wall')):
        kit.box(mk, a, b_, TOP, TOP + 0.6, c0, c1, skip=('bottom', 'top'))
    for (x, z) in ((-12.0, 0.5), (-10.5, 0.5), (8.0, 4.0), (9.5, 4.0)):
        kit.box('misc', x - 0.5, x + 0.5, TOP + 0.02, TOP + 0.55, z - 0.3, z + 0.3, skip=('bottom',), col='#c9c8c3')
    return finish(root, accs, VC, plates, out, '博雅 v2（TEACH-PTBOYA-REF-1104）：南面二樓以上紅磚、清水混凝土大雨遮＋一排小方形天窗、北面長草斜坡到二樓＋木格柵樓梯（底下關著）、入口木格柵、一樓圓柱；照官網照片，D136 像但不照抄')


def finish(root, accs, VC, plates, out, note):
    K.finish(accs, root, VC)
    for (m, props) in plates: uv01(m.finish(root, uv=True, props=props))
    pre = 'pt' if 'putong' in out else 'by'
    VCM = L.vc_material(f'wz_vc_{pre}', rough=0.55)
    L.vc_consolidate(root, {n: VCM for n in (f'{pre}_misc', 'ck_ceiling', 'ck_frame', 'ck_stone_base', 'pt_green_frame', 'by_fin', 'by_wood')})   # TEACH-PTBOYA：純色的零件都併進頂點色（teach_east 鏡頭 draw call 超 1.1 倍，BB-C 15:4x）
    if '--no-tiles' not in ARGS:
        # TEACH-EAST-DRAWCALL（BB-C P3：teach_east 鏡頭 draw call 218→243，×1.115）：有貼圖的材質（普通：面磚、洗石子；博雅：紅磚、灰泥、清水模、草）合成一張貼圖集，
        # 頂點色的零件也併進來（UV 指到貼圖集最上面的白色帶子，顏色照舊用頂點色）：一棟一個網格（＋玻璃、燈罩、匾額）。材質名沿用 wz_vc_*（遊戲照舊投影）。
        # 一格 512 px（和原本每個週期 512 px 一樣清楚）；收邊（洗石子、清水模）一格放 2×2 個週期：三角形少一半，牆和紅磚照舊一格一個週期（最常近看的面不糊）。
        TILES = {'ck_wall', 'ck_trim'} | ({'by_brick', 'by_grass'} if pre == 'by' else set())
        REPS = {'ck_trim': 2}; REPS.update({k: int(v) for k, v in (kv.split('=') for kv in (arg('--reps') or '').split(',') if kv)})
        sol = {'color': '#ffffff', 'rough': 0.55, 'metal': 0.0, 'px': 32}
        L.atlas_tiles(root, os.path.join(HERE, 'textures', 'gen', f'teach_{pre}_tiles'), f'{pre}_tiles', only=TILES, cell=512, keep=lambda ob: 'FACE' in ob.name, reps=REPS, solid=sol, orm_div=8)
        L.fold_vc(root, f'wz_vc_{pre}', f'{pre}_tiles', sol['uv'], new_name=f'wz_vc_{pre}')
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False); info['note'] = note
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(build_putong() if SET == 'putong' else build_boya())
