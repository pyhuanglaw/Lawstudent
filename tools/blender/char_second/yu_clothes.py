"""Alison（李語晴，yu）的衣服（參考圖 yu.webp 正面／側面／背面）：
  外套：淡黃／白／灰藍拼色的寬版風衣（尼龍、敞開、落肩、袖子寬、白色鬆緊袖口、灰藍色鬆緊下擺在胯下）。
        拼色照參考圖：肩膀、上胸一圈淡黃；前面胸口一道白、下面灰藍；側面白；背後淡黃和灰藍以 V 字（人字）分開；
        袖子從肩膀往下淡黃→白→灰藍→淡黃→灰藍（斜斜的色帶）→白袖口；前襟兩條淡黃的邊、白色拉鍊布。
  白 T：圓領、紮進裙子（敞開的外套中間看得到）。
  裙子：酒紅色、過膝（膝蓋下面一點；第二版短 4 cm：第一版到小腿中段）、A 字、柔軟的直褶；高腰、同色細腰帶＋方扣，扣子旁邊垂下一段帶尾。
  鞋：白色帆布鞋（白鞋底、一條紅線）。
做法：
  1. 外套＝芯慈、可昕的開襟做法（x_xinci_clothes.build_cardigan_open：h01_clothes 的上衣、前面敞開），另外一個網格，寬鬆量比 T 恤大。
     拼色：身片、兩隻袖子、前襟的 UV 重排成不重疊（身片在左半、袖子在右半，沿著布的長度攤開），
     貼圖照「這一點在身上的位置」決定顏色（bake_colorblock：每個三角形在 UV 上逐點換回 3D 位置再分區），
     所以拼色的邊界是平滑的線、不會沿著網格出現階梯；拼接處畫一條淡淡的車縫，袖口、下擺的鬆緊畫皺褶。
  2. T 恤、裙子、鞋＝芯慈的裙子做法（x_xinci_clothes.build_skirt，這裡多了直褶、腰帶、扣子、帶尾）＋h01 的上衣（圓領、紮進裙子）＋球鞋；
     裙子的權重照芯慈第九版（只綁腰臀＋大腿，不用 VRoid 的裙擺彈簧骨：坐下時不會炸開）。
  3. 外套推到 T 恤、裙子外面（kexin_clothes.push_out），領子照可昕外套的翻領做法（collar：領片很窄＝立起來的領子），
     合併成外套同一個物件、同一個材質（少一個 draw call），顏色是淡黃。
高度直接寫在參考空間（沈以安，p00_clothes.REF：膝 0.552、胯 0.904、脊椎 0.997、胸 1.111、上胸 1.235、脖子 1.350）——
芯慈的基底（Darkness Shibu）和參考是同一個身體，她的數字可以直接比；Alison 的基底（Sendagaya Shibu）照地標分段對到參考空間做、再轉回來。
已知的簡化：參考圖背後的帽子（淡黃、中間一條灰藍）沒有做，用淡黃立領代替（LAWWW2-C 10-18 試做兩版：沿領口往下鋪的布，被頭髮蓋住、形狀皺成一片，比沒有更怪，拿掉）；
側背包＋三個吊飾是配件 prop_yu.py（bag_yu.glb），金色髮夾在頭髮（yu_hair.py）。"""
import os, math
import numpy as np
import bpy
import common as C
import h01_clothes as K
import p00_clothes as PC
import x_xinci_clothes as XC
import kexin_clothes as KC

YELLOW = np.array([236, 222, 160]) / 255.0       # 參考圖：奶油黃
PANEL_W = np.array([240, 238, 233]) / 255.0      # 白色的拼色片
BLUE = np.array([150, 162, 200]) / 255.0         # 灰藍（長春花藍）
ZIP_W = np.array([232, 230, 224]) / 255.0        # 拉鍊布
TEE_RGB = np.array([245, 242, 238]) / 255.0
SKIRT_RGB = np.array([122, 50, 58]) / 255.0      # 酒紅（參考圖受光面 #6f3b3e、陰影 #67373c；toon 的底色亮一點）
CANVAS_RGB = np.array([238, 234, 228]) / 255.0   # 白帆布
SOLE_RGB = np.array([236, 234, 229]) / 255.0
RED_LINE = np.array([176, 54, 52]) / 255.0       # 鞋底的紅線

REF = PC.REF
# 參考空間的高度
SKIRT = dict(z_top=1.052, z_band=1.024, z_hip=0.885, z_hem=0.495, hem_rx=0.300, hem_ry=0.262, n_dir=96, pleats=22, pleat_amp=0.010)
INNER = dict(KNIT_RGB=TEE_RGB, TROUSER_RGB=SKIRT_RGB, BELT_RGB=None, LEATHER_RGB=CANVAS_RGB, SOLE_RGB=SOLE_RGB, GOLD_RGB=CANVAS_RGB,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=False, SLIM=False, TOP_TEX='jersey',
             SLEEVE_LEN=0.40, SLEEVE_K=0.80, CUFF_EASE=0.012, EASE_K=0.80, DROP_X=0.112, TOP_FIT=0.35, HEM_LOOSE=False,
             PANTS_TOP=SKIRT['z_top'], PANTS_BAND=SKIRT['z_band'], KNIT_HEM=SKIRT['z_top'] - 0.002, KNIT_HEM_TOP=SKIRT['z_top'] + 0.008,   # 紮進去：下擺只蓋到裙頭最上面 2 mm（腰帶整條露出來）
             BACK_NECK_Z=1.388, CREW_FRONT_Z=1.335, SIDE_NECK=(0.071, 1.402))
# 外套：寬版、落肩、袖子寬、長袖到手腕；下擺 3.6 cm 的鬆緊帶在胯下（參考圖：裙子的臀部以下）；前面敞開
JACKET = dict(KNIT_RGB=PANEL_W, NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey',
              SLEEVE_LEN=1.0, SLEEVE_K=1.00, CUFF_EASE=0.011, EASE_K=1.35, DROP_X=0.140, TOP_FIT=0.0, HEM_LOOSE=False,
              PANTS_TOP=SKIRT['z_top'], PANTS_BAND=SKIRT['z_band'], KNIT_HEM=0.826, KNIT_HEM_TOP=0.862,
              BACK_NECK_Z=1.392, CREW_FRONT_Z=1.322, SIDE_NECK=(0.080, 1.402))
OPEN_PHI = 32.0
# 拼色的分區（參考空間）：前面的淡黃到上胸下面一點、白到胸下；背後人字的頂點、兩側的低點
Z_YOKE = REF['upper'] + 0.012
Z_WHITE_LO = REF['chest'] - 0.010
Z_SIDE_LO = REF['spine'] + 0.020
Z_CHEV_TOP, Z_CHEV_SIDE = REF['upper'] + 0.027, REF['chest'] + 0.039
SLEEVE_BANDS = ((0.20, 0), (0.34, 1), (0.50, 2), (0.62, 0), (9.0, 2))     # 袖長的比例 → 顏色（0 黃、1 白、2 藍）
Y_, W_, B_, Z_, CUFF_, HEM_ = range(6)
PALETTE = np.array([YELLOW, PANEL_W, BLUE, ZIP_W, PANEL_W, BLUE])
COLLAR_UV = (0.48, 0.50)        # 貼圖左半最右邊一條（身片用不到）塗淡黃：領子的 UV 都放在這裡


# ---------------------------------------------------------------- 裙子（芯慈的做法＋直褶）
def build_skirt_pleated(skin, arm, mb, S):
    """x_xinci_clothes.build_skirt 的做法：每個高度沿 n_dir 個方向量身體（臀部、兩條大腿）的外輪廓、取凸包，胯部以下照 A 字放寬到裙擺的橢圓；
    多了柔軟的直褶（pleats 道，從臀圍線往下漸漸加深，到裙擺 ±pleat_amp；深淺沿著一圈慢慢變，不會整齊得像紙扇）。
    UV：u 繞一圈 0..1（不重複，貼圖的直褶陰影對得上網格的褶），v 0＝裙擺、0.70＝裙頭；0.75 以上給腰帶、扣子"""
    hips_c = C.bone_head(arm, 'J_Bip_C_Hips')
    bv = skin.bvh(['J_Bip_C_Hips', 'J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_L_UpperLeg', 'J_Bip_R_UpperLeg', 'J_Bip_L_LowerLeg', 'J_Bip_R_LowerLeg'], thr=0.3)
    Kd = S['n_dir']; th = np.arange(Kd) * 2 * math.pi / Kd - math.pi / 2         # 0＝正前方（-y），往 +x（人物左邊）轉
    dirs = np.stack([np.cos(th), np.sin(th), np.zeros(Kd)], -1)
    zt, zb, zh, zm = S['z_top'], S['z_band'], S['z_hip'], S['z_hem']
    zs = list(np.linspace(zt, zb, 4)) + list(np.linspace(zb - 0.012, zh, 6)) + list(np.linspace(zh - 0.04, zm, 14))
    cy = hips_c[1]; prev = None; rows = []; cens = []; hip_r = None
    a2 = th + math.pi / 2                                                              # 0..2π，從正前方繞
    pl = np.cos(S['pleats'] * a2)                                                      # +1＝褶的外緣、-1＝褶的裡面
    depth = 0.80 + 0.20 * np.sin(3 * a2 + 1.1) + 0.12 * np.sin(7 * a2 + 2.3)           # 每道褶的深淺慢慢變
    for z in zs:
        o = np.array([0.0, cy, z])
        rb = np.array([K.Skin.outer(skin.full if z > 0.98 else bv, o, dirs[k], 0.45) for k in range(Kd)])
        if prev is not None: rb = np.where(np.isfinite(rb), rb, prev)
        rb = np.where(np.isfinite(rb), rb, 0.12); prev = rb
        pts = dirs[:, :2] * (rb + 0.009)[:, None]
        H = K.hull2(pts); r = np.array([K.ray_poly(H, dirs[k][:2]) for k in range(Kd)])
        if z <= zh + 1e-6:
            if hip_r is None: hip_r = r.copy()
            t = (zh - z) / (zh - zm)
            ell = 1.0 / np.sqrt((np.cos(th) / S['hem_rx']) ** 2 + (np.sin(th) / S['hem_ry']) ** 2)
            aline = hip_r + (ell - hip_r) * t ** 1.15
            r = np.maximum(r + 0.006, np.maximum(r + 0.012, aline) + S['pleat_amp'] * t ** 0.9 * depth * pl)
        else:
            r = r + 0.003
        rows.append(o + dirs * r[:, None]); cens.append(o)
    rows = np.array(rows)
    top_in = rows[0].copy(); top_in[:, :2] = cens[0][:2] + (top_in[:, :2] - cens[0][:2]) * 0.96; top_in[:, 2] -= 0.004
    hem_in = rows[-1].copy(); hem_in[:, :2] = cens[-1][:2] + (hem_in[:, :2] - cens[-1][:2]) * 0.985; hem_in[:, 2] += 0.03
    rows = np.concatenate([top_in[None], rows, hem_in[None]]); cens = [cens[0]] + cens + [cens[-1] + np.array([0, 0, 0.03])]
    I = np.stack([mb.add(rw, 'skirt') for rw in rows])
    U = np.arange(Kd + 1) / Kd
    Vv = np.clip((rows[:, :, 2].mean(1) - zm) / (zt - zm), 0, 1) * 0.70; Vv[0] = 0.72; Vv[-1] = 0.02
    UV = np.zeros((len(rows), Kd + 1, 2)); UV[:, :, 0] = U[None, :]; UV[:, :, 1] = Vv[:, None]
    mb.grid(I, UV, closed=True, mat=1, centers=np.array(cens))
    print('  skirt: rows %d dirs %d pleats %d, waist z %.3f, hem z %.3f, hem radius x %.3f y %.3f' % (
        len(rows), Kd, S['pleats'], zt, zm, np.abs(rows[-2][:, 0]).max(), np.abs(rows[-2][:, 1] - cy).max()))
    legs = {'L': dict(rows=rows[1:-1]), 'R': dict(rows=rows[1:-1])}
    return dict(legs=legs, z_crotch=zh - 0.03, K=Kd, rows=rows, I=I, cens=np.array(cens), th=th, dirs=dirs)


def belt(mb, sk, S):
    """同色細腰帶（1.8 cm、在裙頭外 3 mm）＋前面偏右的方扣（3.2×2.6 cm 的框）＋扣子旁邊垂下的帶尾（2 cm 寬、9 cm 長）。
    標成 'skirt'（裙子的權重：腰以上照身體最近點）、材質是裙子的（UV 在 v 0.76–0.94：貼圖畫深一點的酒紅）"""
    rows, cens, dirs, Kd = sk['rows'], sk['cens'], sk['dirs'], sk['K']
    zt, zb = S['z_top'], S['z_band']; zc = 0.5 * (zt + zb)
    j = 2                                                     # 裙頭中間那一列（rows[1..4] 從裙頭上緣到下緣）
    base = rows[j]; c = cens[j]
    rad = base[:, :2] - c[:2]; rr = np.linalg.norm(rad, axis=1); rad = rad / rr[:, None]
    def ring(off, z):
        return np.column_stack([c[0] + rad[:, 0] * (rr + off), c[1] + rad[:, 1] * (rr + off), np.full(Kd, z)])
    R4 = np.stack([ring(0.0012, zc - 0.0095), ring(0.0032, zc - 0.009), ring(0.0032, zc + 0.009), ring(0.0012, zc + 0.0095)])
    I = np.stack([mb.add(rw, 'skirt') for rw in R4])
    UV = np.zeros((4, Kd + 1, 2)); UV[:, :, 0] = (np.arange(Kd + 1) / Kd)[None, :]; UV[:, :, 1] = np.array([0.765, 0.772, 0.808, 0.815])[:, None]
    mb.grid(I, UV, closed=True, mat=1, centers=np.array([[c[0], c[1], z] for z in R4[:, 0, 2]]))
    # 方扣：前面偏人物右邊（-x）11°
    kb = Kd - 3; p = ring(0.0062, zc)[kb]; n = np.array([rad[kb, 0], rad[kb, 1], 0.0]); tg = np.array([-n[1], n[0], 0.0]); up = np.array([0, 0, 1.0])
    def rect(w, h, off): return np.array([p + n * off + tg * sx * w / 2 + up * sz * h / 2 for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
    o_out, o_in = rect(0.032, 0.026, 0.0), rect(0.020, 0.014, 0.0)
    io = mb.add(o_out, 'skirt'); ii = mb.add(o_in, 'skirt')
    Ib = np.stack([np.r_[io, io[0]], np.r_[ii, ii[0]]])         # 框：外圈、內圈各一環（不閉合的 grid，頭尾重複一點）
    UVb = np.zeros((2, 6, 2)); UVb[:, :, 0] = np.linspace(0.10, 0.30, 6)[None, :]; UVb[0, :, 1] = 0.905; UVb[1, :, 1] = 0.935
    mb.grid(Ib[:, :5], UVb[:, :5], closed=False, mat=1, centers=np.array([p - n * 0.02, p - n * 0.02]))
    # 帶尾：從扣子右邊（+tg）垂下 9 cm，貼著裙子外面 4 mm
    zs = np.linspace(zc, zc - 0.090, 8); th = sk['th']
    def surf(z, k):
        zr = rows[1:-1, 0, 2]; o = np.argsort(zr)
        r = np.interp(z, zr[o], np.linalg.norm(rows[1:-1, k, :2] - cens[1:-1, :2], axis=1)[o])
        return np.array([c[0] + rad[k, 0] * (r + 0.0045), c[1] + rad[k, 1] * (r + 0.0045), z])
    kt = Kd - 1
    L_ = [surf(z, kt) + tg * (0.004 + 0.006 * i / 7.0) for i, z in enumerate(zs)]
    A = np.array([q - tg * 0.010 for q in L_]); Bq = np.array([q + tg * 0.010 for q in L_])
    It = np.stack([mb.add(A, 'skirt'), mb.add(Bq, 'skirt')], 1)
    UVt = np.zeros((len(zs), 2, 2)); UVt[:, 0, 0] = 0.40; UVt[:, 1, 0] = 0.46; UVt[:, :, 1] = np.linspace(0.77, 0.81, len(zs))[:, None]
    mb.grid(It, UVt, closed=False, mat=1, centers=np.array([q - n * 0.03 for q in L_]))
    print('  belt: ring z %.3f, buckle at dir %d (%.0f deg), tail %.3f m' % (zc, kb, math.degrees(th[kb] + math.pi / 2) - 360, 0.090))


def skirt_texture(S=1024, seed=23, pleats=22):
    """酒紅細斜紋＋直褶的明暗（u 繞一圈、和網格的褶對齊；越往裙擺越明顯）；v 0.76–0.82 腰帶（深一點）、0.90–0.94 扣子（再深、有一點亮邊）"""
    rng = np.random.default_rng(seed)
    v = (np.arange(S)[::-1] + 0.5)[:, None] / S; u = (np.arange(S) + 0.5)[None, :] / S
    tw = 0.5 + 0.5 * np.cos(2 * math.pi * (u * 420 + v * 420))
    g = np.cos(2 * math.pi * pleats * u)
    w = np.clip(1 - v / 0.62, 0, 1) ** 0.7
    lum = (0.96 + 0.04 * tw + (K._noise(rng, S, S, 8) - 0.5) * 0.04) * (1 + 0.07 * g * w)
    lum = np.where((v > 0.755) & (v < 0.83), lum * 0.86, lum)
    lum = np.where((v > 0.89) & (v < 0.95), 0.72 + 0.10 * (np.abs(v - 0.92) > 0.022), lum)
    rgb = SKIRT_RGB[None, None, :] * lum[:, :, None]
    return np.concatenate([np.clip(rgb, 0, 1), np.ones((S, S, 1))], -1)


def sneaker_texture():
    """h01 的球鞋貼圖（白帆布、白鞋底、鞋帶）＋鞋底上緣一條紅線（帆布鞋）"""
    img = K.loafer_texture(); S = img.shape[0]
    u = (np.arange(S) + 0.5)[None, :] / S; k = np.broadcast_to(u / 0.86 * 18, (S, S))
    red = (np.abs(k - 2.55) < 0.14) | (np.abs(k - 15.45) < 0.14)
    img[..., :3] = np.where(red[:, :, None], RED_LINE[None, None, :], img[..., :3])
    return img


# ---------------------------------------------------------------- 外套的拼色
def uv_wrap(mb, regions):
    """包住 mb.grid：外套的身片（64 欄）、袖子（24 欄，先左後右）、前襟（2 欄，先左後右）的 UV 重排成不重疊——
    身片 u 0.02..0.46、袖子 u 0.50..0.72（左）／0.75..0.97（右）、前襟 u 0.004..0.010（左）／0.012..0.018（右）；
    v 沿著布的長度（每一欄的弧長）攤成 0.01..0.99。regions 記下每一段的面（給 bake_colorblock）"""
    orig = mb.grid; seen = {'sleeve': 0, 'facing': 0}
    def arc_v(P):                      # P: (R, n, 3) → 每一欄沿 R 的弧長，正規化
        d = np.r_[np.zeros((1, P.shape[1])), np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=2), axis=0)]
        return 0.01 + 0.98 * d / np.maximum(d[-1:], 1e-6)
    def grid(I, UV, closed=True, mat=0, centers=None, skip=None, outward=1):
        f0 = len(mb.F); name = None; I = np.asarray(I)
        if mat == 0 and I.ndim == 2:
            V = np.array(mb.V); P = V[I]; Kc = I.shape[1]
            if Kc == 64 and closed and 'body' not in [r[2] for r in regions]:
                name = 'body'; vv = arc_v(P); UV = np.zeros((I.shape[0], Kc + 1, 2))
                UV[:, :Kc, 0] = 0.02 + 0.44 * np.arange(Kc)[None, :] / Kc; UV[:, Kc, 0] = 0.46
                UV[:, :Kc, 1] = vv; UV[:, Kc, 1] = vv[:, 0]
            elif closed and Kc == 24:
                name = ('sleeveL', 'sleeveR')[min(seen['sleeve'], 1)]; base = (0.50, 0.75)[min(seen['sleeve'], 1)]; seen['sleeve'] += 1
                vv = arc_v(P); UV = np.zeros((I.shape[0], Kc + 1, 2))
                UV[:, :Kc, 0] = base + 0.22 * np.arange(Kc)[None, :] / Kc; UV[:, Kc, 0] = base + 0.22
                UV[:, :Kc, 1] = vv; UV[:, Kc, 1] = vv[:, 0]
            elif not closed and Kc == 2:
                name = ('facingL', 'facingR')[min(seen['facing'], 1)]; base = (0.004, 0.012)[min(seen['facing'], 1)]; seen['facing'] += 1
                vv = arc_v(P[:, :1])[:, 0]; UV = np.zeros((I.shape[0], 2, 2)); UV[:, 0, 0] = base; UV[:, 1, 0] = base + 0.006; UV[:, :, 1] = vv[:, None]
            else:
                print('  uv_wrap: grid not remapped', I.shape, 'closed', closed, 'mat', mat)
        out = orig(I, UV, closed, mat, centers, skip, outward)
        if name: regions.append((f0, len(mb.F), name))
        return out
    mb.grid = grid
    return orig


def classify(P, uv, region, G):
    """P (n,3) 參考空間的位置、uv (n,2) 貼圖座標、region 哪一片 → 顏色分類（Y_ 黃、W_ 白、B_ 藍、Z_ 拉鍊布、CUFF_ 白袖口、HEM_ 藍下擺）"""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    if region.startswith('facing'): return np.full(len(P), Z_)
    if region == 'body':
        a = np.abs(np.degrees(np.arctan2(x, -(y - G['cy']))))
        c = np.full(len(P), B_)
        fr = a <= 70; sd = (a > 70) & (a < 110); bk = a >= 110
        c = np.where(fr & (z > Z_YOKE), Y_, np.where(fr & (z > Z_WHITE_LO), W_, c))
        zy = Z_YOKE + 0.02 * np.clip((a - 70) / 40, 0, 1)
        c = np.where(sd & (z > zy), Y_, np.where(sd & (z > Z_SIDE_LO), W_, np.where(sd, B_, c)))
        zc = Z_CHEV_SIDE + (Z_CHEV_TOP - Z_CHEV_SIDE) * np.clip((a - 110) / 70, 0, 1)
        c = np.where(bk & (z > zc), Y_, np.where(bk, B_, c))
        c = np.where(a < OPEN_PHI + 7, Y_, c)                       # 前襟兩條淡黃的邊
        c = np.where(z < G['hem_top'] + 0.002, HEM_, c)
        return c
    side = region[-1]; S0, Wr, Lt, cuff = G['arm_' + side]
    ax = (Wr - S0) / np.linalg.norm(Wr - S0); q = P - S0; s = q @ ax
    perp = q - np.outer(s, ax); pn = np.linalg.norm(perp, axis=1) + 1e-9
    s_eff = s - 0.035 * perp[:, 1] / pn + 0.015 * perp[:, 2] / pn     # 色帶斜斜的（前面往外、上面往外一點）
    f = s_eff / Lt
    c = np.full(len(P), Y_)
    lo = -9.0
    for hi, col in SLEEVE_BANDS:
        c = np.where((f >= lo) & (f < hi), col, c); lo = hi
    c = np.where(s < 0.0, Y_, c)
    c = np.where(s > cuff, CUFF_, c)
    return c


def bake_colorblock(mb, regions, G, S=1024, seed=41):
    """每個三角形在 UV 上逐點（貼圖的像素中心）用重心座標換回 3D 位置 → classify → 顏色。
    沒有蓋到的像素從旁邊補（避免 mipmap 在接縫滲色）；分類不同的交界畫一條淡淡的車縫；袖口、下擺的鬆緊畫皺褶"""
    V = np.array(mb.V); cls = np.full((S, S), -1, np.int16)
    for f0, f1, region in regions:
        for fi in range(f0, f1):
            f = mb.F[fi]; uv = np.array(mb.FUV[fi], float)
            tris = ((0, 1, 2), (0, 2, 3)) if len(f) == 4 else ((0, 1, 2),)
            for a_, b_, c_ in tris:
                T = uv[[a_, b_, c_]] * S; P3 = V[[f[a_], f[b_], f[c_]]]
                x0 = max(0, int(math.floor(T[:, 0].min()))); x1 = min(S - 1, int(math.ceil(T[:, 0].max())))
                y0 = max(0, int(math.floor(T[:, 1].min()))); y1 = min(S - 1, int(math.ceil(T[:, 1].max())))
                if x1 < x0 or y1 < y0: continue
                xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
                d = (T[1, 1] - T[2, 1]) * (T[0, 0] - T[2, 0]) + (T[2, 0] - T[1, 0]) * (T[0, 1] - T[2, 1])
                if abs(d) < 1e-12: continue
                l0 = ((T[1, 1] - T[2, 1]) * (xs - T[2, 0]) + (T[2, 0] - T[1, 0]) * (ys - T[2, 1])) / d
                l1 = ((T[2, 1] - T[0, 1]) * (xs - T[2, 0]) + (T[0, 0] - T[2, 0]) * (ys - T[2, 1])) / d
                l2 = 1 - l0 - l1
                m = (l0 >= -1e-6) & (l1 >= -1e-6) & (l2 >= -1e-6)
                if not m.any(): continue
                Pq = l0[m][:, None] * P3[0] + l1[m][:, None] * P3[1] + l2[m][:, None] * P3[2]
                uq = np.column_stack([xs[m] / S, ys[m] / S])
                cls[(S - 1 - (ys[m] - 0.5)).astype(int), (xs[m] - 0.5).astype(int)] = classify(Pq, uq, region, G)
    filled = cls >= 0
    # 領子的一條（u 0.48–0.50）：淡黃
    cu = np.arange(S); cls[:, (cu >= int(COLLAR_UV[0] * S)) & (cu < int(COLLAR_UV[1] * S))] = Y_
    # 交界的車縫（只在有蓋到的像素之間）
    seam = np.zeros((S, S), bool)
    for dy, dx in ((0, 1), (1, 0)):
        a = cls[:S - dy, :S - dx]; b = cls[dy:, dx:]
        e = (a >= 0) & (b >= 0) & (a != b) & ~(((a == CUFF_) | (a == HEM_)) & ((b == CUFF_) | (b == HEM_)))
        seam[:S - dy, :S - dx] |= e; seam[dy:, dx:] |= e
    # 補空白（8 次，每次從上下左右拿）
    for _ in range(8):
        miss = cls < 0
        if not miss.any(): break
        for sh in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nb = np.roll(cls, sh, axis=(0, 1)); take = miss & (nb >= 0); cls[take] = nb[take]; miss = cls < 0
    cls[cls < 0] = W_
    rng = np.random.default_rng(seed)
    rgb = PALETTE[cls]
    lum = 1.0 + (K._noise(rng, S, S, 6) - 0.5) * 0.035 + (K._noise(rng, S, S, 40) - 0.5) * 0.02     # 尼龍：很淡的不均勻
    u = (np.arange(S) + 0.5)[None, :] / S
    gather = 0.5 + 0.5 * np.cos(2 * math.pi * u * 260)                                             # 鬆緊帶的細皺
    lum = np.where((cls == CUFF_) | (cls == HEM_), lum * (0.93 + 0.07 * gather), lum)
    lum = np.where(seam, lum * 0.86, lum)
    rgb = rgb * lum[:, :, None]
    print('  colorblock: %d regions, covered %.1f%% of texels, seams %d px, classes %s' % (
        len(regions), 100.0 * filled.mean(), int(seam.sum()), {n: int((cls == i).sum()) for i, n in enumerate(('Y', 'W', 'B', 'Z', 'cuff', 'hem'))}))
    return np.concatenate([np.clip(rgb, 0, 1), np.ones((S, S, 1))], -1)


def set_style(d):
    for k, v in d.items():
        if k == 'SIDE_NECK': K.SIDE_NECK = tuple(v)
        else: setattr(K, k, v)


def _tmpl(pat):
    return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_', 'K01_', 'Y01_')))


def build_jacket(m):
    """外套（第二個網格）：先把身體對到沈以安的比例（BodyMap），用芯慈的開襟做法做外套、拼色貼圖，再轉回來"""
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), REF)
    set_style(JACKET)
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_jacket')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    try:
        skin = K.Skin(body)
        dummy = K.MB(); sk = build_skirt_pleated(skin, arm, dummy, SKIRT); shoes = K.build_shoes(skin, arm, dummy)   # 只要尺寸（外套下擺蓋過裙子）
        mb = K.MB(); regions = []
        orig = uv_wrap(mb, regions)
        XC.OPEN_PHI = OPEN_PHI
        try: top = XC.build_cardigan_open(skin, arm, mb, sk)
        finally: mb.grid = orig
        G = dict(cy=float(C.bone_head(arm, 'J_Bip_C_Hips')[1]), hem_top=K.KNIT_HEM_TOP)
        for sd in ('L', 'R'):
            S0 = C.bone_head(arm, 'J_Bip_%s_UpperArm' % sd); E = C.bone_head(arm, 'J_Bip_%s_LowerArm' % sd); Wr = C.bone_head(arm, 'J_Bip_%s_Hand' % sd)
            Lt = (np.linalg.norm(E - S0) + np.linalg.norm(Wr - E)) * K.SLEEVE_LEN
            G['arm_' + sd] = (S0, Wr, Lt, Lt - 0.062)
        print('  jacket uv regions', [(r[2], r[1] - r[0]) for r in regions])
        os.makedirs(K.WIP, exist_ok=True)
        img_j = C.image_from_array('Y01_Jacket', bake_colorblock(mb, regions, G), os.path.join(K.WIP, 'y01_clothes_Jacket.png'))
        mat = K.make_mat(_tmpl('Tops'), 'Y01_Jacket_CLOTH', img_j, (0.84, 0.84, 0.90))
        W = K.compute_weights(skin, arm, mb, top, dict(legs={}, z_crotch=sk['z_crotch']), shoes)
        obj, bad = mb.build('Clothes_Y01_Jacket', [mat])           # 身片、袖子、前襟都是材質 0（沒有扣子）
        (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
        C.bind(obj, arm, K.weights_dict(skin, W))
        print('  jacket: dropped loose verts (open front)', XC.drop_loose(obj), 'bad faces', bad)
    finally:
        C.bone_head = bh; K.WSRC = None
        if ws is not None: C.warp_world(ws, bm.inv)
    Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj


def build_inner(m):
    """T 恤＋裙子（直褶、腰帶）＋帆布鞋：一個網格、三個材質（芯慈 _apply 的做法，上衣換成 h01 的圓領 T 恤、紮進裙子）"""
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), REF)
    set_style(INNER)
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_top')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    try:
        skin = K.Skin(body)
        mb = K.MB()
        sk = build_skirt_pleated(skin, arm, mb, SKIRT)
        belt(mb, sk, SKIRT)
        top = K.build_top(skin, arm, mb, sk)
        shoes = K.build_shoes(skin, arm, mb)
        os.makedirs(K.WIP, exist_ok=True)
        img_t = C.image_from_array('Y01_Tee', K.jersey_texture(), os.path.join(K.WIP, 'y01_clothes_Tee.png'))
        img_s = C.image_from_array('Y01_Skirt', skirt_texture(pleats=SKIRT['pleats']), os.path.join(K.WIP, 'y01_clothes_Skirt.png'))
        img_l = C.image_from_array('Y01_Sneaker', sneaker_texture(), os.path.join(K.WIP, 'y01_clothes_Sneaker.png'))
        mats = [K.make_mat(_tmpl('Tops'), 'Y01_Tee_CLOTH', img_t, (0.86, 0.84, 0.86)),
                K.make_mat(_tmpl('Tops'), 'Y01_Skirt_CLOTH', img_s, (0.74, 0.62, 0.68)),
                K.make_mat(_tmpl('Shoes'), 'Y01_Sneaker_CLOTH', img_l, (0.80, 0.78, 0.80))]
        W = K.compute_weights(skin, arm, mb, top, dict(legs={}, z_crotch=sk['z_crotch']), shoes)
        ms, Ws = XC.skirt_weights(skin, mb, None, arm)
        W[ms] = K.limit_norm(Ws, 4)
        obj, bad = mb.build('Clothes_Y01', mats)
        (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
        C.bind(obj, arm, K.weights_dict(skin, W))
        me = obj.data; tris = {}
        for p in me.polygons: tris[p.material_index] = tris.get(p.material_index, 0) + len(p.vertices) - 2
        print('  inner clothes: verts %d faces %d (bad %d) tris tee %d skirt %d sneakers %d' % (len(me.vertices), len(me.polygons), bad, tris.get(0, 0), tris.get(1, 0), tris.get(2, 0)))
        print('  culled skin faces (tee, skirt, shoes)', K.cull_skin(body, obj))
    finally:
        C.bone_head = bh; K.WSRC = None
        if ws is not None: bpy.data.objects.remove(ws, do_unlink=True); m['wsrc_top'] = None
    Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj


def collar(m, jacket, stand=(0.024, 0.020), width=(0.014, 0.014, 0.016), max_x=0.10):
    """立領：照可昕外套的翻領（kexin_clothes.jacket_collar）——沿著外套領口（網格邊界上、脖子附近的點，照繞脖子的角度排）做領座＋很窄的領片
    （立起來、往外微翻）。差別：領口點的範圍放寬到離中心 10 cm（Alison 的外套比較寬，可昕的 8.5 cm 會漏掉兩側）；
    直接用外套的材質、UV 全部放到貼圖的淡黃條；最後合併進外套（同一個物件、同一個材質，少一個 draw call）"""
    from mathutils import Vector
    import p05_clothes as P5
    arm = m['arm']; N = C.bone_head(arm, 'J_Bip_C_Neck'); neck_z = float(N[2])
    bvh, P = P5._bvh(jacket)
    loops = P5._boundary_loops(jacket, P)
    cand = sorted({i for l in loops for i in l if P[i][2] > neck_z - 0.045 and abs(P[i][0]) < max_x and P[i][1] > N[1] - 0.10})
    if len(cand) < 12: print('  collar: neckline not found (%d)' % len(cand)); return None
    Q = P[cand]; yc = float(N[1])
    ang = np.degrees(np.arctan2(Q[:, 0], -(Q[:, 1] - yc))); ang = np.where(ang < 0, ang + 360.0, ang)
    o = np.argsort(ang); Q = Q[o]; ang = ang[o]
    keep = (ang > 8) & (ang < 352); Q = Q[keep]; ang = ang[keep]
    seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(Q, axis=0), axis=1))]; L = seg[-1]
    s = np.linspace(0.0, L, 81); ring = np.stack([np.interp(s, seg, Q[:, k]) for k in range(3)], -1)
    for _ in range(4): ring[1:-1] = ring[1:-1] * 0.5 + (ring[:-2] + ring[2:]) * 0.25
    t = s / L; back = np.cos(np.pi * (t - 0.5)) ** 2
    tan = P5._u(np.gradient(ring, axis=0)); cen = np.array([N[0], N[1], float(np.mean(ring[:, 2]))])
    stand_h = np.interp(np.abs(t - 0.5), [0, 0.20, 0.34, 0.46, 0.5], [stand[0], stand[0] * 0.9, stand[1], 0.004, 0.002])
    radial = P5._u(np.column_stack([ring[:, 0] - cen[0], ring[:, 1] - cen[1], np.zeros(len(ring))]))
    fold = ring + np.array([0, 0, 1.0]) * stand_h[:, None] + radial * 0.004
    wd = np.interp(np.abs(t - 0.5), [0, 0.20, 0.34, 0.43, 0.48, 0.5], [width[0], width[0], width[1], width[2], width[2] * 0.8, 0.02])
    def onsurf(p, off):
        hit = bvh.find_nearest(Vector(p))
        return np.array(p) if hit[0] is None else np.array(hit[0]) + np.array(hit[1]) * off
    outer, mid = [], []
    for i in range(len(ring)):
        p = fold[i] + radial[i] * 0.005
        nrm = np.array(bvh.find_nearest(Vector(ring[i]))[1]); d = P5._u(np.cross(tan[i], nrm))
        hd = np.array([d[0], d[1], 0.0])
        if np.dot(hd, radial[i]) - 0.5 * d[2] < 0: d = -d
        walked, q, qm, target = 0.0, p.copy(), None, wd[i] + stand_h[i]
        while walked < target:
            st = min(0.002, target - walked); q = onsurf(q + d * st, 0.0035)
            nrm = np.array(bvh.find_nearest(Vector(q))[1]); d = P5._u(d - nrm * np.dot(d, nrm)); walked += st
            if qm is None and walked >= stand_h[i] + 0.45 * wd[i]: qm = q + nrm * 0.0012
        outer.append(q); mid.append(qm if qm is not None else (p + q) / 2)
    outer = np.array(outer); mid = np.array(mid)
    for _ in range(8):
        outer[1:-1] = outer[1:-1] * 0.5 + (outer[:-2] + outer[2:]) * 0.25
        mid[1:-1] = mid[1:-1] * 0.5 + (mid[:-2] + mid[2:]) * 0.25
    jm = jacket.data.materials[0]
    mc = P5.Mesh(); wneck = 0.65 * back + 0.25
    mc.strip(ring + radial * 0.0015, fold, (0.40, 0.46), wneck)
    mc.strip(fold + radial * 0.005, mid, (0.46, 0.53), wneck * 0.6)
    mc.strip(mid, outer, (0.53, 0.70), wneck * 0.5)
    o = mc.obj('Clothes_Y01_Collar', arm, jm, lambda V, W: {'J_Bip_C_Neck': W, 'J_Bip_C_UpperChest': 1 - W})
    uvl = o.data.uv_layers.active; n = len(uvl.data)
    uv = np.zeros((n, 2), np.float32); uv[:, 0] = 0.5 * (COLLAR_UV[0] + COLLAR_UV[1]); uv[:, 1] = np.linspace(0.2, 0.8, n)
    uvl.data.foreach_set('uv', uv.reshape(-1))
    print('  collar: neckline %d points (%.0f..%.0f deg), length %.3f, faces %d' % (len(Q), float(ang.min()), float(ang.max()), L, len(mc.F)))
    with bpy.context.temp_override(active_object=jacket, object=jacket, selected_objects=[jacket, o], selected_editable_objects=[jacket, o]):
        bpy.ops.object.join()
    print('  collar joined into the jacket; jacket materials', [mt.name for mt in jacket.data.materials if mt])
    return jacket


def apply(m):
    # 外套的權重來源：原本的上衣（build_inner 用完會刪掉，先複製一份）
    ws = m.get('wsrc_top')
    if ws is not None:
        cp = ws.copy(); cp.data = ws.data.copy(); cp.name = 'WSRC_Jacket'
        (ws.users_collection[0] if ws.users_collection else bpy.context.scene.collection).objects.link(cp); m['wsrc_jacket'] = cp
    jacket = build_jacket(m)        # 外套先做：裡面那一輪做完會把衣服蓋住的皮膚刪掉（cull_skin），之後再量身體就量不到軀幹
    if m.get('wsrc_jacket') is not None: bpy.data.objects.remove(m['wsrc_jacket'], do_unlink=True); m['wsrc_jacket'] = None
    inner = build_inner(m)
    print('  jacket pushed outside the tee/skirt (verts moved, max m)', KC.push_out(jacket, [inner]))
    print('  culled skin faces under the jacket', K.cull_skin(m['body'], jacket))
    collar(m, jacket)
    me = jacket.data; tris = sum(len(p.vertices) - 2 for p in me.polygons)
    print('  jacket tris %d, materials %d' % (tris, len([mt for mt in me.materials if mt])))
    m['clothes'] = [inner, jacket]        # 頭髮避開 T 恤、裙子＋外套
    return inner
