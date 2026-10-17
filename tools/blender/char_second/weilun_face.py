"""邱韋綸（econ_weilun）的臉：沿用 h01_face（p00_face.run）＋男生的參數，皮膚調成小麥色（做法和阿哲 zhe_face 一樣，只是係數不同）。
參考圖 weilun.webp：平常的表情偏酷——眼睛平、細一點（不上揚、不彎）、直的濃眉近黑、鼻樑直、下顎線硬、臉頰收；
膚色：運動曬過的小麥色，比阿哲淺一點（臉頰取樣約 #d8a582；阿哲 #d09772）。
和阿哲同一個 VRoid 樣本：差別靠這組參數＋髮型（weilun_hair）＋服裝（weilun_clothes）。"""
import p00_face as PF
import zhe_face as ZF

WEILUN = dict(PF.MALE)
WEILUN.update(EYE_SZ=0.58, EYE_SX=1.16, EYE_TILT=0.03, IRIS_FRAC=0.47,   # 第九版：差別再拉大——細長、眼尾往上（三個人裡最銳利）     # 第八版（BB_201：四個人同一張臉、看起來很睏）：眼睛張開、眼尾微微往上（有精神、眼神直）
                   # 第三版（BB-C）：眼睛細長、單眼皮感、虹膜小一點（第二版 0.66／1.05：大而圓、看起來擔心、年紀小）
              BROW_K=1.70, BROW_ARCH=0.02, BROW_DROP=0.0060, BROW_COL=(0.06, 0.05, 0.045), BROW_SCALE_Z=1.30,   # 眉毛平、直、壓低（第二版 ARCH 0.12：往上挑）
              JAW_OUT=0.0120, CHIN_WIDEN=0.40, D_CHIN=0.0085, FACE_NARROW=0.90, CHIN_FWD=0.0025,   # 第九版：長臉、窄、下巴長而有角   # 第八版：下顎、顴骨更有稜角（BB_201）   # 下顎、臉頰再瘦硬一點（19 歲成人，不要國中生感）
              MOUTH_K=1.12, LIP_A=0.30, BROW_LEN_D=-0.0045,   # 第十版（BB_201 第 6 節）：嘴窄（到瞳孔內側）、唇色淡；眉毛直、濃、短                              # 嘴平、唇色淡
              LIP_OUT=(0.72, 0.48, 0.40), LIP_IN=(0.62, 0.39, 0.33), LIP_HI=(0.80, 0.60, 0.52))
TAN = (0.68, 0.50, 0.37)          # 第八版（BB_201）：再曬黑一點
TAN_V7 = (0.76, 0.58, 0.44)          # 第三版（BB-C）：小麥色、偏暖棕（騎腳踏車曬的；第二版 (0.89, 0.74, 0.61) 偏白偏粉、像室內的人）；臉和身體同一組
SHADE_TAN = (0.82, 0.63, 0.50)
NECK_K = 1.12                     # 脖子粗一點（BB-C：不要那麼細長；第三版 1.07 遊戲裡還是細）
CALF_MM = 13.0                    # 第十一版（BB_201：運動員的腿）：9 → 13
THIGH_MM = 7.0
CALF_MM_V10 = 9.0                     # 小腿肚往外（騎車的人；樣本座標 mm，遊戲裡約 8 mm）


def _shape_body(m):
    """第三版（BB-C）：脖子粗一點、小腿肚與大腿的肌肉（騎車的人；第二版腿太細直）。只動身體網格（含 shape key），衣服、襪子之後照新的身體做"""
    import numpy as np
    import common as C
    arm, body = m['arm'], m['body']
    def bh(n): return np.array(C.bone_head(arm, n))
    me = body.data; P = C.co(body); Mw = np.array(body.matrix_world); Pw = P @ Mw[:3, :3].T + Mw[:3, 3]
    vg = {g.index: g.name for g in body.vertex_groups}
    def wsum(names):
        w = np.zeros(len(me.vertices))
        for v in me.vertices:
            for g in v.groups:
                if vg.get(g.group) in names: w[v.index] += g.weight
        return w
    D = np.zeros_like(Pw)
    # 脖子：脖子骨頭的權重 × 高度輪廓（上下兩端不動：和臉、肩膀接得起來）
    n0, h0 = bh('J_Bip_C_Neck'), bh('J_Bip_C_Head'); wn = wsum({'J_Bip_C_Neck'})
    t = (Pw[:, 2] - n0[2]) / max(1e-4, h0[2] - n0[2]); prof = np.clip(np.sin(np.pi * np.clip((t + 0.15) / 0.95, 0, 1)), 0, 1)
    k = (NECK_K - 1.0) * np.clip(wn, 0, 1) * prof
    ax = n0[:2] + (h0[:2] - n0[:2]) * np.clip(t, 0, 1)[:, None]
    D[:, :2] += (Pw[:, :2] - ax) * k[:, None]
    nn = int((k > 1e-3).sum())
    # 小腿肚：膝蓋往下 30% 最鼓、後面最多（腓腸肌），前面（脛骨）幾乎不動；大腿前面、外側一點點
    nc = 0
    for side in ('L', 'R'):
        kn, ft, hp = bh('J_Bip_%s_LowerLeg' % side), bh('J_Bip_%s_Foot' % side), bh('J_Bip_%s_UpperLeg' % side)
        wl = wsum({'J_Bip_%s_LowerLeg' % side}); wu = wsum({'J_Bip_%s_UpperLeg' % side})
        for w, a, b, peak, sig, amp, back_k in ((wl, kn, ft, 0.30, 0.17, CALF_MM * 1e-3, 0.80), (wu, hp, kn, 0.55, 0.25, THIGH_MM * 1e-3, -0.30)):
            sel = w > 0.3
            tt = np.clip((a[2] - Pw[:, 2]) / max(1e-4, a[2] - b[2]), 0, 1)
            axp = a[:2] + (b[:2] - a[:2]) * tt[:, None]
            r = Pw[:, :2] - axp; rl = np.linalg.norm(r, axis=1) + 1e-9; rd = r / rl[:, None]
            back = rd[:, 1]                                  # +y＝後面（VRoid 人物面向 -y）
            dirk = np.clip(0.25 + back_k * back, 0.0, 1.0) if back_k > 0 else np.clip(0.55 - back_k * (-back), 0.0, 1.0) * 0.8 + 0.2
            amt = amp * np.exp(-((tt - peak) / sig) ** 2) * dirk * np.clip(w, 0, 1) * sel
            D[:, :2] += rd * amt[:, None]; nc += int((amt > 1e-4).sum())
    Dl = D @ np.linalg.inv(Mw[:3, :3]).T
    C.set_co(body, P + Dl)
    if me.shape_keys:
        for kb in me.shape_keys.key_blocks:
            if kb == me.shape_keys.reference_key: continue   # set_co 已經改了 Basis
            a = np.empty(len(me.vertices) * 3); kb.data.foreach_get('co', a); kb.data.foreach_set('co', (a.reshape(-1, 3) + Dl).reshape(-1))
    me.update()
    return nn, nc


def apply(m):
    PF.run(m, WEILUN, {'Fcl_EYE_Close': 0.18})       # 第三版：上眼皮蓋下來一點（單眼皮感、放鬆、有點酷）
    print('  tan skin materials', ZF.tan_skin([m['face'], m['body']], TAN, SHADE_TAN))
    print('  body shaping (neck verts, leg verts)', _shape_body(m))
