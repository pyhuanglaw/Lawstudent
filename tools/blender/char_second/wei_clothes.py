"""魏宏仁（魏教授，prof_wei）的衣服（AA_159 的 look：五十多歲，白襯衫外面套深藍色毛衣背心，袖子捲到手肘；沒有參考圖，只在講台上遠景）。
LAWWW2-C 2026-10-17 第一版（npc.py 的變體 'pwei' 用這支做衣服）：
  背心＝h01_clothes 的 V 領身片（深藍粗針織），袖子整片換成白色襯衫布（weilun_clothes.sleeve_panels 把袖子的面改材質），袖子到手肘＋捲起來的一圈；
  V 領裡面＝白色內層（x_xinci_clothes.tee_full，只留前面、收進背心裡）——遠看是白襯衫套背心；襯衫領子沒有做（遠景）。
  深灰西裝褲（褲管跟著腿走）＋深棕樂福鞋。白板筆是遊戲端的配件（props3d），這裡不做。"""
import os
import numpy as np
import bpy
import common as C
import h01_clothes as K
import x_xinci_clothes as XC
import weilun_clothes as WC

NAVY = np.array([40, 48, 78]) / 255.0           # 深藍毛衣背心
WHITE = np.array([236, 236, 232]) / 255.0       # 白襯衫
SLACKS = np.array([72, 72, 76]) / 255.0         # 深灰西裝褲
LOAFER = np.array([58, 40, 30]) / 255.0         # 深棕樂福鞋
STYLE = dict(KNIT_RGB=NAVY, TROUSER_RGB=SLACKS, LEATHER_RGB=LOAFER, SOLE_RGB=np.array([40, 30, 24]) / 255.0, GOLD_RGB=LOAFER, BELT_RGB=None,
             SHOE_STYLE='loafer', NECK_STYLE='V', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='knit', TROUSER_TEX='twill',
             SLEEVE_LEN=0.62, SLEEVE_K=0.74, CUFF_EASE=0.016, EASE_K=0.70, DROP_X=0.105, TOP_FIT=0.3, HEM_LOOSE=False,
             PANTS_ELLIPSE=(0.058, 0.066), PANTS_DROP=False, PANTS_HEM_UP=0.0, PANTS_FOLLOW=True)
# HairSample_Male 樣本的高度（npc.py 的 HT；祐廷／柏翰量過）：背心下擺蓋過褲頭、V 字到胸口中間；白色內層的圓領貼脖子（像扣到最上面的襯衫）
STYLE_M = dict(PANTS_TOP=1.060, PANTS_BAND=1.020, KNIT_HEM=0.950, KNIT_HEM_TOP=0.975, CREW_FRONT_Z=1.452, BACK_NECK_Z=1.478, V_BOTTOM=1.392, TEE_CREW_Z=1.458)
SIDE_NECK_M = (0.066, 1.492)


def _apply(m, arm, body):
    skin = K.Skin(body)
    mb = K.MB()
    pants = K.build_pants(skin, arm, mb)
    top = K.build_top(skin, arm, mb, pants)
    XC.tee_full(skin, arm, mb, K.PANTS_TOP - 0.03, K.TEE_CREW_Z)
    shoes = K.build_shoes(skin, arm, mb)
    print('  sleeve faces → shirt', WC.sleeve_panels(mb, top, mat_from=0, mat_to=4, half_angle=180.0, frac=1.0))
    os.makedirs(K.WIP, exist_ok=True)
    imgs = [C.image_from_array('PW_Vest', K.knit_texture(), os.path.join(K.WIP, 'pw_clothes_Vest.png')),
            C.image_from_array('PW_Trouser', K.trouser_texture(), os.path.join(K.WIP, 'pw_clothes_Trouser.png')),
            C.image_from_array('PW_Loafer', K.loafer_texture(), os.path.join(K.WIP, 'pw_clothes_Loafer.png')),
            C.image_from_array('PW_Shirt', WC._texture(WHITE, 512), os.path.join(K.WIP, 'pw_clothes_Shirt.png')),
            C.image_from_array('PW_Sleeve', WC._texture(WHITE, 512), os.path.join(K.WIP, 'pw_clothes_Sleeve.png'))]
    def tmpl(pat):
        return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_', 'Z01_', 'W01_', 'PW_')))
    mats = [K.make_mat(tmpl('Tops'), 'PW_Vest_CLOTH', imgs[0], (0.70, 0.74, 0.86)),
            K.make_mat(tmpl('Tops'), 'PW_Trouser_CLOTH', imgs[1], (0.76, 0.76, 0.82)),
            K.make_mat(tmpl('Shoes'), 'PW_Loafer_CLOTH', imgs[2], (0.70, 0.66, 0.66)),
            K.make_mat(tmpl('Tops'), 'PW_Shirt_CLOTH', imgs[3], (0.84, 0.84, 0.88)),
            K.make_mat(tmpl('Tops'), 'PW_Sleeve_CLOTH', imgs[4], (0.84, 0.84, 0.88))]
    W = K.compute_weights(skin, arm, mb, top, pants, shoes)
    obj, bad = mb.build('Clothes_PW', mats)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    C.bind(obj, arm, K.weights_dict(skin, W))
    print('  shirt faces removed at the sides/back (under the vest)', WC.trim_tee(obj, tee=3, max_angle=46.0))
    print('  shirt pulled under the vest', WC.tee_under_jacket(obj, tee=3, jacket=(0,)))
    print('  body pulled under the shirt', XC.conform_under(body, obj, 3, K.PANTS_TOP - 0.03, K.TEE_CREW_Z + 0.065))
    n = K.cull_skin(body, obj)
    print('  culled skin faces', n, '; clothes verts', len(obj.data.vertices), 'bad', bad)
    m['clothes'] = obj
    return obj


def apply(m):
    """p00_clothes.run 的做法（BodyMap 對到沈以安的比例 → 做衣服 → 轉回來），呼叫自己的 _apply（背心＋白色內層＋白袖子）"""
    import p00_clothes as PC
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), PC.REF)
    for k, v in STYLE.items(): setattr(K, k, v)
    for k, v in STYLE_M.items(): setattr(K, k, float(np.interp(v, bm.zc, bm.zr)))
    zr = float(np.interp(SIDE_NECK_M[1], bm.zc, bm.zr)); K.SIDE_NECK = (SIDE_NECK_M[0] * float(bm._s(np.array([zr]))[0]), zr)
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_top')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    try:
        obj = _apply(m, arm, body)
    finally:
        C.bone_head = bh; K.WSRC = None
        if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None
    Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj
