"""路人的日劇穿搭（使用者 2026-10-17：「路人數量要再加倍喔 而且請參考日劇穿搭」）：npc.py 的變體寫 layered=dict(...) 時用這裡做衣服。
p00_clothes.run 只會做「一件上衣＋長褲＋鞋」；日劇裡大學生、年輕上班族的穿法多半是疊穿和長裙，這裡加兩樣：
  outer：敞開的外套（開襟針織衫、當外套穿的襯衫）＋裡面一件 T 恤——芯慈的做法（x_xinci_clothes.build_cardigan_open＋tee_full）；
  skirt：A 字裙（及膝下、中長、長裙）——芯慈的 build_skirt＋只綁腰臀與大腿的權重（坐下時不炸開，x_xinci_clothes.skirt_weights）。
兩樣可以分開用：外套＋長褲、上衣＋長裙、外套＋T 恤＋長裙。顏色用低彩度（大地色、深藍、灰、白、橄欖綠），不用鮮紅（使用者同一天）。
做法和 p00_clothes.run 一樣：BodyMap 把身體對到沈以安的比例，在參考空間做衣服、算權重、剪掉衣服下的皮膚，再整件轉回來。
layered 的欄位：
  style：h01_clothes 的參數（有外套時是外套的；沒有外套時是上衣的）＋TROUSER_RGB（褲子或裙子）＋鞋
  inner：dict(rgb)——外套裡面的 T 恤
  outer：dict(open=敞開的角度, buttons=前襟的扣子數)；沒有就是不穿外套
  skirt：dict(hem=裙擺高度（參考空間：沈以安的膝 0.552）, rx, ry)；沒有就是長褲
  M：覆蓋 npc.HT 的高度（人物空間）"""
import os
import numpy as np
import bpy
import common as C
import h01_clothes as K
import p00_clothes as PC
import x_xinci_clothes as XC

SKIRT_LEN = {   # 參考空間：裙擺高度、裙擺的左右／前後半徑（芯慈的及膝下 0.47／0.255／0.215；沛珊的長裙放寬，走路時小腿在裙子裡面前後擺）
    'knee': (0.470, 0.255, 0.215),
    'midi': (0.340, 0.280, 0.240),
    'long': (0.210, 0.300, 0.262),
}


def run(m, tag, ht, cfg):
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), PC.REF)
    for k, v in cfg['style'].items(): setattr(K, k, v)
    M = dict(ht['M']); M['TEE_CREW_Z'] = M['CREW_FRONT_Z']
    if cfg.get('outer'): M['CREW_FRONT_Z'] = M['CREW_FRONT_Z'] - 0.022          # 外套的領口比裡面 T 恤的圓領低（芯慈 1.322／1.345）
    M.update(cfg.get('M', {}))
    for k, v in M.items(): setattr(K, k, float(np.interp(v, bm.zc, bm.zr)))
    side = ht['side']; zr = float(np.interp(side[1], bm.zc, bm.zr)); K.SIDE_NECK = (side[0] * float(bm._s(np.array([zr]))[0]), zr)
    SK = None
    if cfg.get('skirt'):
        hem, rx, ry = SKIRT_LEN[cfg['skirt'].get('len', 'midi')]
        SK = dict(z_top=K.PANTS_TOP, z_band=K.PANTS_BAND, z_hip=K.PANTS_TOP - 0.165, z_hem=hem, hem_rx=rx, hem_ry=ry, n_dir=48)
    print('  layered: heights in reference space', {k: round(getattr(K, k), 3) for k in M}, 'skirt', SK and {k: round(v, 3) for k, v in SK.items() if k != 'n_dir'})
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_top')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    try:
        obj = _apply(m, arm, body, tag, cfg, SK)
    finally:
        C.bone_head = bh; K.WSRC = None
        if ws is not None: bpy.data.objects.remove(ws, do_unlink=True); m['wsrc_top'] = None
    Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj


def _apply(m, arm, body, tag, cfg, SK):
    if K.SLIM: K.slim_body(body)
    skin = K.Skin(body); mb = K.MB()
    if SK is not None:
        low = XC.build_skirt(skin, arm, mb, SK); pants = dict(legs={}, z_crotch=low['z_crotch'])
    else:
        low = K.build_pants(skin, arm, mb); pants = low
    outer = cfg.get('outer'); zb = (SK['z_top'] if SK is not None else K.PANTS_TOP) - 0.025
    if outer:
        XC.OPEN_PHI = float(outer.get('open', 30.0))
        top = XC.build_cardigan_open(skin, arm, mb, low)
        XC.tee_full(skin, arm, mb, zb, K.TEE_CREW_Z)
    else:
        top = K.build_top(skin, arm, mb, low)
    shoes = K.build_shoes(skin, arm, mb)
    if outer and outer.get('buttons', 0):
        eL = top['edges']['L']; zt = float(eL['P'][1:-1, 2].max())
        XC.edge_buttons(mb, eL, K.KNIT_HEM_TOP + 0.022, zt - 0.032, int(outer['buttons']))
    os.makedirs(K.WIP, exist_ok=True)
    tex = {'linen': K.linen_texture, 'jersey': K.jersey_texture, 'cotton': K.cotton_texture}.get(K.TOP_TEX, K.knit_texture)
    img_k = C.image_from_array(tag + '_Knit', tex(), os.path.join(K.WIP, 'clothes_Knit.png'))
    img_b = C.image_from_array(tag + '_Bottom', XC.skirt_texture() if SK is not None else K.trouser_texture(), os.path.join(K.WIP, 'clothes_Bottom.png'))
    img_l = C.image_from_array(tag + '_Loafer', K.loafer_texture(), os.path.join(K.WIP, 'clothes_Loafer.png'))
    def tmpl(pat):
        return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_', tag + '_')))
    mats = [K.make_mat(tmpl('Tops'), tag + '_Knit_CLOTH', img_k, (0.84, 0.80, 0.82)),
            K.make_mat(tmpl('Tops'), tag + '_Bottom_CLOTH', img_b, (0.74, 0.76, 0.84)),
            K.make_mat(tmpl('Shoes'), tag + '_Loafer_CLOTH', img_l, (0.62, 0.56, 0.56))]
    if outer:
        XC.WHITE = np.array(cfg['inner']['rgb'], float)
        img_t = C.image_from_array(tag + '_Tee', XC.tee_texture(), os.path.join(K.WIP, 'clothes_Tee.png'))
        mats.append(K.make_mat(tmpl('Tops'), tag + '_Tee_CLOTH', img_t, (0.86, 0.84, 0.86)))
    W = K.compute_weights(skin, arm, mb, top, pants, shoes)
    if SK is not None:
        ms, Ws = XC.skirt_weights(skin, mb, None, arm); W[ms] = K.limit_norm(Ws, 4)
    obj, bad = mb.build('Clothes_' + tag, mats)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    C.bind(obj, arm, K.weights_dict(skin, W))
    if outer:
        print('  dropped loose verts (open front)', XC.drop_loose(obj))
        print('  body pulled under the tee', XC.conform_under(body, obj, 3, zb, K.TEE_CREW_Z + 0.065))
    me = obj.data; tris = {}
    for p in me.polygons: tris[p.material_index] = tris.get(p.material_index, 0) + len(p.vertices) - 2
    print('  layered clothes: verts %d faces %d (bad %d) tris by material %s' % (len(me.vertices), len(me.polygons), bad, tris))
    print('  culled skin faces', K.cull_skin(body, obj))
    m['clothes'] = obj
    return obj
