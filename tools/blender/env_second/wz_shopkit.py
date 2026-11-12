"""溫州街店面組件（ART-WZ0 舊店面翻修／WZ2 新店外觀；LAWWW2-B 2026-10-16；AA_164 7b「店面設計準則」）。
wz_street.py 在建好共用材質、acc()/inst()/face() 之後 `exec` 這個檔（共用同一個命名空間），apartment() 遇到有 SF 樣式的棟就用這裡的版本。

原本溫州街的每一間店都是同一個做法：一整片玻璃＋四根直框＋一塊招牌（＋有的有雨遮），貼齊外牆，前面什麼都沒有。
使用者：「現在店面都太單調」「要特別參考一般店面」。這裡照 7b-1 的層次（地面騎樓／一樓立面／招牌／雨棚／設備／晚上）重做：
  ①店門退縮 0.9 m（門廊）：門廊在建築的導航阻擋範圍內（zones3d.js blockRect 從外牆線開始），不改導航，雜物放門廊裡不會擋路；
  ②每家不同的門廊磁磚＋門檻；兩側壁柱；門廊天花板＋一盞燈（晚上亮）；
  ③門：鋁門、木框玻璃門、自動門、木格拉門＋暖簾、整面拉開（摺門收在兩側）；
  ④鐵捲門箱＋導軌（打烊時拉下來的那一種）；
  ⑤招牌：燈箱（厚、金屬框）、木招牌（厚木框）、薄鐵板；直立招牌照舊；
  ⑥雨棚：條紋帆布、單色帆布、鐵皮雨遮、沒有；
  ⑦玻璃上的紙條（徵人、營業時間、支付貼紙、價目表、招租…，shop_notes.png 圖集）；
  ⑧門廊的雜物（共用原型＋instancing）：塑膠凳、A 字黑板、傘桶、垃圾桶、販賣機、水果攤架、麵攤、書車、紙箱、長椅、飲料冰箱、盆栽；
  ⑨設備：一樓冷氣、電錶箱、排油煙管。
相鄰的店至少三樣不同（7b-2 第 2 點）：SF 表每一間都寫清楚。店名、紙條全部虛構，支付貼紙只有通用圖示（D77）。
"""
GEN = os.path.join(HERE, 'textures', 'gen')
NOTES = ['hiring', 'hours', 'pay', 'rent', 'winter', 'copyprice', 'copyprice2', 'nobook', 'chalk', 'menu', 'closed', 'poster', 'lostcat', 'tutor', 'hours2', 'blank']


def _img_mat(name, fn, rough=0.6, clip=False, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links; bs = N['Principled BSDF']
    bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn)); Lk.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], r.inputs[0]); Lk.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    if emit:
        try: Lk.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
        except Exception: pass
    m['tile'] = 1.0
    return m


SK = {
    'notes': _img_mat('wz_shop_notes', 'shop_notes.png', rough=0.8, clip=True),
    'stripe_green': _img_mat('wz_awn_stripe_green', 'shop_awning_stripe_green.png', rough=0.85),
    'stripe_red': _img_mat('wz_awn_stripe_red', 'shop_awning_stripe_red.png', rough=0.85),
    'stripe_navy': _img_mat('wz_awn_stripe_navy', 'shop_awning_stripe_navy.png', rough=0.85),
    'stripe_orange': _img_mat('wz_awn_stripe_orange', 'shop_awning_stripe_orange.png', rough=0.85),
    'stripe_maroon': _img_mat('wz_awn_stripe_maroon', 'shop_awning_stripe_maroon.png', rough=0.85),   # WZ-SECOND-1104 帝大紅茶
    'stripe_mint': _img_mat('wz_awn_stripe_mint', 'shop_awning_stripe_mint.png', rough=0.85),       # WZ-SECOND-1104 夏日冰菓室
    'f_granite': L.pbr('wz_sf_granite', 'granite_tile', tile=0.8, target='#8e8c88', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'f_quarry': L.pbr('wz_sf_quarry', 'square_brick_paving', tile=0.9, target='#9a5a44', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.8),
    'f_white': L.pbr('wz_sf_white', 'large_floor_tiles_02', tile=1.2, target='#cfcdc6', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.45),
    'f_mosaic': L.pbr('wz_sf_mosaic', 'rounded_square_tiled_wall', tile=0.5, target='#9fa7a3', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'f_terrazzo': L.pbr('wz_sf_terrazzo', 'terrazzo_tiles', tile=0.9, target='#a49a8c', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'f_floral': L.pbr('wz_sf_floral', 'floor_tiles_06', tile=0.7, target='#b0a48e', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'f_concrete': L.pbr('wz_sf_concrete', 'concrete_floor_painted', tile=1.4, target='#8f8b84', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.85),
    'wood_dk': L.pbr('wz_sf_wood_dark', 'dark_wood', tile=0.8, target='#5a3c28', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'wood_lt': L.pbr('wz_sf_wood_light', 'walnut_veneer', tile=0.9, target='#a07850', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'f_wood': L.pbr('wz_sf_wood_floor', 'laminate_floor_02', tile=1.4, target='#cdb594', normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.5),   # 店內的淺色木地板（使用者 10-23：不要深色木地板，整個遊戲都不要；D112；同宿舍四人房）
    'steel': flat('wz_sf_steel', '#b9bcbf', rough=0.3, metal=0.45),
    'alu2': flat('wz_sf_alu', '#c9ccce', rough=0.35, metal=0.4),
    'black': flat('wz_sf_black', '#2a2a2c', rough=0.5, metal=0.2),
    'corr': L.pbr('wz_sf_corr', 'corrugated_iron', tile=0.6, target='#a7aaa8', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.45),
    'cloth_navy': flat('wz_sf_noren', '#22324e', rough=0.9),
    'lamp': L.flat('wz_sf_lamp', '#fff4dc', rough=0.3, emit=B.srgb('#ffe2b0')),
    'lamp_cool': L.flat('wz_sf_lamp_cool', '#f4f8ff', rough=0.3, emit=B.srgb('#eef6ff')),
    'lamp_green': L.flat('wz_sf_lamp_green', '#3fae5a', rough=0.3, emit=B.srgb('#3fae5a')),   # 藥局的綠十字燈箱（2026-10-23）
    'vend_panel': L.flat('wz_sf_vend_panel', '#dfe9f2', rough=0.2, emit=B.srgb('#cfe4ff')),
}
import json as _json, sys
_SETN = sys.argv[sys.argv.index('--set') + 1] if '--set' in sys.argv else ''
_ATL = {'gongguan': 'gg_signs_atlas', 'lane118': 'l118_signs_atlas'}.get(_SETN, 'wz_signs_atlas')   # 公館用自己的貼圖集（sign_atlas.py --set gongguan）；118 巷：l118_signs_tex.py（L118-SHOPS-REDO-1111）
if _ATL == 'l118_signs_atlas' and not os.path.exists(os.path.join(GEN, _ATL + '.json')):
    import l118_signs_tex as _l118t; _l118t.build()
SIGN_ATLAS = _json.load(open(os.path.join(GEN, _ATL + '.json'), encoding='utf-8'))   # sign_atlas.py 產生


def _atlas_mat(name, emit):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.45
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, _ATL + '.jpg'), check_existing=True)   # 兩個材質共用同一張圖
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit:
        ep = os.path.join(GEN, _ATL + '_emit.jpg')   # 公館：晚上發光另外一張（燈箱整塊、霓虹只有燈管、不亮的是黑的；sign_atlas.py --set gongguan）
        if os.path.exists(ep):
            te = N.new('ShaderNodeTexImage'); te.image = bpy.data.images.load(ep, check_existing=True); nt.links.new(te.outputs['Color'], bs.inputs['Emission Color'])
        else: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color'])
        bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


SK['sign'] = _atlas_mat('wz_signs', 0.0); SK['sign_lit'] = _atlas_mat('wz_signs_lit', 0.6)
SK['enamel_red'] = flat('wz_sf_enamel_red', '#b8322a', rough=0.35)   # 麵攤正面的紅色烤漆板
if SET in ('wenzhou', 'lane118'): SK['enamel_red'] = flat('wz_sf_enamel_steel', '#c9ccc9', rough=0.28, metal=0.45)   # WZ-FIVE-1104：林家的攤車照參考圖是不鏽鋼（溫州街只有林家用麵攤）
SK['goose_green'] = flat('wz_sf_goose_green', '#3e5747', rough=0.45, metal=0.3)   # WZ-SECOND-1104：溫州書屋招牌上的綠色鵝頸燈
SK['goose_dark'] = flat('wz_sf_goose_dark', '#2b2724', rough=0.45, metal=0.3)     # 帝大紅茶、夏日冰菓室的深色鵝頸燈（燈罩裡面是燈泡的亮色）
SK['lamp_red'] = flat('wz_sf_lamp_red', '#d4442e', rough=0.5, emit=B.srgb('#e8583c'))   # WZ-FIVE-1104：小路門邊的紅燈籠（名字照 wz_sf_lamp 開頭：不投影、晚上亮）
SK['noren'] = _img_mat('wz_noren', 'shop_noren.png', rough=0.9)   # 定食店的暖簾（shopkit_tex.noren）
SK['bowl_w'] = flat('wz_sf_bowl_white', '#f2efe8', rough=0.3); SK['bowl_b'] = flat('wz_sf_bowl_indigo', '#2f4a6a', rough=0.3)   # 燈箱：貼圖自己發光（白天也微微亮，和真的燈箱一樣）
# 有使用者核可招牌圖（BB-B signs_approved）的店：棟號 → 貼圖集的名字（_h 橫、_v 直）
SIGNMAP = {'A1': 'wz_ade', 'A3': 'wz_wzbooks', 'A4': 'wz_lin', 'A5': 'riri_mart', 'B2': 'wz_changzai', 'B3': 'wz_komichi',
           'B5': 'wz_dida', 'B5i': 'wz_summer', 'B6': 'wz_azhong', 'B7': 'wz_sunnyside'}   # WZ-SECOND-1104（使用者 11-04 05:4x）：溫州書屋、常在洗衣、帝大紅茶、夏日冰菓室、阿忠鮮果換參考圖的招牌   # WZ-FIVE-1104：林家、小路、SUNNY SIDE、阿德換成使用者 11-04 參考圖的招牌（舊的設計稿 lin_noodle／xiangzi_teishoku／banshu／ade_print 留在圖集裡）


def sign_tex(xf, key, cx, y0, w, zf, name):
    """一塊貼圖招牌（設計稿）：寬 w，高照設計稿比例；回傳上緣高度"""
    it = SIGN_ATLAS[key]; h = w / it['aspect']
    uvquad(name, SK['sign_lit'] if it['lit'] else SK['sign'], [xf.p(cx - w / 2, y0, zf), xf.p(cx + w / 2, y0, zf), xf.p(cx + w / 2, y0 + h, zf), xf.p(cx - w / 2, y0 + h, zf)], tuple(it['uv']))
    return y0 + h


def hsign(xf, sid, key, cx, sw, sy0, depth=None, lamps=None, lampcol='goose_dark'):
    """橫招牌：底座（燈箱＝鋁框盒、木招牌＝深色薄板）＋設計稿；回傳上緣"""
    it = SIGN_ATLAS[key]; lit = it['lit']; sh_ = sw / it['aspect']; dp = depth if depth is not None else (0.2 if lit else 0.12)   # 木招牌也要 12 cm：樓層的水泥帶凸出牆面 8 cm，薄招牌會被它蓋住一條
    xf.box(acc(SK['alu2'] if lit else SK['black']), cx - sw / 2 - 0.03, cx + sw / 2 + 0.03, sy0 - 0.03, sy0 + sh_ + 0.03, 0.0, dp)
    sy1 = sign_tex(xf, key, cx, sy0, sw, dp + 0.004, f'sk_sign_{sid}')
    if lit: CL.glow(root, 'signbox', *xf.p(cx, (sy0 + sy1) / 2, 0.6), color='rgba(255,250,235,1)', size=2.2, day=0.0, night=0.55)
    if lamps:                                                                         # WZ-SECOND-1104：參考圖的鵝頸燈（招牌上緣往外彎、燈罩朝下照著字）；WZ-FIVE-1104 阿德：燈箱招牌上面也可以有鵝頸燈（參考圖 wz_ade_ext 三盞）
        for lx in lamps: gooseneck(xf, cx + lx, sy1, dp, lampcol)
    elif not lit:                                                                             # 木招牌、鐵皮招牌：上面一盞投光燈照著
        for lx in (cx - sw / 3, cx + sw / 3):
            xf.cyl(acc(SK['black']), (lx, sy1 + 0.05, 0.05), (lx, sy1 + 0.12, 0.35), 0.012, seg=5); acc(SK['black']).sphere(xf.p(lx, sy1 + 0.12, 0.38), 0.05, seg=8, rings=4)
            CL.glow(root, 'signspot', *xf.p(lx, sy1 - 0.2, 0.45), color='rgba(255,226,180,1)', size=1.4, day=0.0, night=0.6)
    return sy1


def gooseneck(xf, x, sy1, dp, col='goose_dark'):
    """鵝頸燈（WZ-SECOND-1104）：招牌上緣的牆上底座 → 往上、往外彎的燈臂 → 朝下的燈罩（外面燈的顏色、裡面亮）＋燈泡；晚上有光暈"""
    m = acc(SK[col]); y0 = sy1 + 0.12; ht = sy1 + 0.36; zo = dp + 0.42
    xf.box(m, x - 0.05, x + 0.05, y0 - 0.05, y0 + 0.07, 0.0, 0.03)
    pts = [(x, y0, 0.02), (x, y0 + 0.16, 0.06), (x, ht, 0.16), (x, ht + 0.02, 0.3), (x, ht - 0.02, zo - 0.04), (x, ht - 0.07, zo)]
    for a, b in zip(pts, pts[1:]): xf.cyl(m, a, b, 0.013, seg=6)
    sh = L.lathe([(0.035, 0.0), (0.05, -0.03), (0.15, -0.13), (0.16, -0.15), (0.155, -0.15), (0.0, -0.12)], seg=14)
    p_ = xf.p(x, ht - 0.07, zo); m.add_bm(sh, Matrix.Translation(g2b(*p_))); sh.free()
    acc(SK['lamp']).sphere(xf.p(x, ht - 0.19, zo), 0.045, seg=8, rings=4)
    CL.glow(root, 'goose', *xf.p(x, ht - 0.25, zo), color='rgba(255,220,160,1)', size=1.2, day=0.0, night=0.85)


def sconce(xf, x, y, z=0.0):
    """牆上的上下照壁燈（常在洗衣參考圖：店面兩側的柱子上）"""
    xf.box(acc(SK['goose_dark']), x - 0.06, x + 0.06, y - 0.1, y + 0.1, z, z + 0.09)
    acc(SK['lamp']).box(*sorted((xf.p(x - 0.045, 0, 0)[0], xf.p(x + 0.045, 0, 0)[0])), y + 0.1, y + 0.11, *sorted((xf.p(0, 0, z + 0.01)[2], xf.p(0, 0, z + 0.08)[2])))
    for yy in (y + 0.25, y - 0.25): CL.glow(root, 'sconce', *xf.p(x, yy, z + 0.12), color='rgba(255,228,180,1)', size=0.9, day=0.0, night=0.8)


def vsign_tex(xf, sid, key, vx, vy0, vw=0.62):
    """直立招牌（設計稿）：突出牆面、兩面都貼（另一面左右對調，字才是正的）、上下鐵架"""
    it = SIGN_ATLAS[key]; lit = it['lit']; vh = vw / it['aspect']; vy1 = vy0 + vh; z0, z1 = 0.22, 0.22 + vw; uv = tuple(it['uv'])
    for yb in (vy1 + 0.05, vy0 - 0.05): xf.box(acc(M['metal']), vx - 0.03, vx + 0.03, yb - 0.03, yb + 0.03, 0.0, z1 + 0.04)
    xf.box(acc(SK['alu2'] if lit else SK['wood_dk']), vx - 0.07, vx + 0.07, vy0, vy1, z0, z1)
    mat = SK['sign_lit'] if lit else SK['sign']
    uvquad(f'sk_vsign_{sid}_a', mat, [xf.p(vx + 0.072, vy0, z1), xf.p(vx + 0.072, vy0, z0), xf.p(vx + 0.072, vy1, z0), xf.p(vx + 0.072, vy1, z1)], uv)
    uvquad(f'sk_vsign_{sid}_b', mat, [xf.p(vx - 0.072, vy0, z0), xf.p(vx - 0.072, vy0, z1), xf.p(vx - 0.072, vy1, z1), xf.p(vx - 0.072, vy1, z0)], uv)
    if lit: CL.glow(root, 'vsign', *xf.p(vx, (vy0 + vy1) / 2, (z0 + z1) / 2), color='rgba(255,250,235,1)', size=1.4, day=0.0, night=0.55)
    return vy1


VC = M['laundry']    # 頂點色材質（雜物的小零件顏色放在頂點色，整條巷子一次 draw call）
FRUIT_VC = L.vc_material('wz_fruit_vc', rough=0.45)   # 阿忠鮮果攤子上的水果（wz_street 的 WZ_VC 對到不投影的 cafe_vc_wz_matte；物件名 NOSHADOW_ 在 combine 以後會不見，所以用材質）


def _cm(name): return L.CMesh(name, VC)


# ---------------- 雜物原型（原點＝底部中央；正面朝 +z） ----------------
def p_stool(col):
    m = _cm('stool'); m.cbox(-0.17, 0.17, 0.43, 0.47, -0.17, 0.17, col)
    for sx in (-1, 1):
        for sz in (-1, 1): m.cbox(sx * 0.13 - 0.02, sx * 0.13 + 0.02, 0.0, 0.43, sz * 0.13 - 0.02, sz * 0.13 + 0.02, col, 0.85)
    return combine([m.finish(None, uv=False)], f'sk_stool_{col[1:]}')


def p_bins():
    m = _cm('bins')
    for x0, col in ((-0.48, '#3f7a4c'), (0.02, '#2f5f9c'), (0.5, '#d9b23a')):
        m.cbox(x0, x0 + 0.44, 0.0, 0.72, -0.2, 0.2, col); m.cbox(x0 - 0.02, x0 + 0.46, 0.72, 0.78, -0.22, 0.22, col, 0.8)
    return combine([m.finish(None, uv=False)], 'sk_bins')


def p_boxes():
    m = _cm('boxes'); y = 0.0
    for (w, h, d, dx, k) in ((0.6, 0.4, 0.45, 0.0, 1.0), (0.5, 0.35, 0.4, 0.04, 0.92), (0.36, 0.3, 0.3, -0.06, 1.05)):
        m.cbox(-w / 2 + dx, w / 2 + dx, y, y + h, -d / 2, d / 2, '#b48a5c', k); m.cbox(-w / 2 + dx, w / 2 + dx, y + h * 0.48, y + h * 0.52, -d / 2 - 0.003, d / 2 + 0.003, '#c9b48c', k); y += h
    return combine([m.finish(None, uv=False)], 'sk_boxes')


def p_umbrella():
    m = Mesh('umb_stand', SK['steel']); m.cyl((0, 0, 0), (0, 0.55, 0), 0.13, seg=10)
    u = _cm('umbs')
    for i, (dx, dz, c) in enumerate(((-0.04, 0.03, '#22324e'), (0.05, -0.02, '#b33a32'), (0.0, 0.05, '#3d5a47'))):
        u.cbox(dx - 0.025, dx + 0.025, 0.1, 0.95, dz - 0.025, dz + 0.025, c); u.cbox(dx - 0.012, dx + 0.012, 0.95, 1.05, dz - 0.012, dz + 0.012, '#2a2a2a')
    return combine([m.finish(None), u.finish(None, uv=False)], 'sk_umbrella')


def p_vend():
    """販賣機：展示窗是凹進去的（機身到 z 0.22，窗的四邊是框）。原本機身整塊到 z 0.36，飲料（z 0.25～0.33）和玻璃（0.345）都包在機身裡面，
    從街上看只有一個米色大方塊加退幣口（溫州街 A1、B2，公館 G03、G09、G10；ART-WZ0 遊戲內截圖 10-22 發現）"""
    m = _cm('vend'); m.cbox(-0.45, 0.45, 0.0, 1.82, -0.36, 0.22, '#e9e6dc'); m.cbox(-0.45, 0.45, 0.0, 0.1, -0.36, 0.36, '#3b3b3b')
    m.cbox(-0.45, 0.45, 0.1, 0.58, 0.22, 0.36, '#e9e6dc'); m.cbox(-0.45, 0.45, 1.7, 1.82, 0.22, 0.36, '#e9e6dc')   # 窗下、窗上
    for x0, x1 in ((-0.45, -0.4), (0.4, 0.45)): m.cbox(x0, x1, 0.58, 1.7, 0.22, 0.36, '#e9e6dc')                     # 窗的兩側
    m.cbox(-0.4, 0.4, 0.58, 1.7, 0.2, 0.225, '#f4f6f8')                                                                # 展示窗裡的白色背板（亮）
    for r in range(4):
        y = 0.62 + r * 0.26
        for c in range(6): m.cbox(-0.36 + c * 0.12, -0.27 + c * 0.12, y, y + 0.16, 0.25, 0.33, ['#d64a3c', '#3a78c0', '#f2c440', '#4aa05a', '#f4f2ec', '#8a5a3c'][(r + c) % 6])
    m.cbox(0.24, 0.4, 0.3, 0.5, 0.36, 0.38, '#2a2a2a')
    pn = Mesh('vend_glass', M['glass']); pn.quad([(-0.4, 0.58, 0.345), (0.4, 0.58, 0.345), (0.4, 1.7, 0.345), (-0.4, 1.7, 0.345)])
    lt = Mesh('vend_light', SK['vend_panel']); lt.quad([(-0.42, 1.72, 0.362), (0.42, 1.72, 0.362), (0.42, 1.8, 0.362), (-0.42, 1.8, 0.362)])
    return combine([m.finish(None, uv=False), pn.finish(None), lt.finish(None)], 'sk_vend')


def p_fridge():
    m = _cm('fridge'); m.cbox(-0.4, 0.4, 0.0, 1.9, -0.32, 0.32, '#f2f2f0')
    for r in range(4):
        y = 0.22 + r * 0.38
        for c in range(7): m.cbox(-0.34 + c * 0.1, -0.29 + c * 0.1, y, y + 0.22, 0.08, 0.22, ['#2f7fbf', '#e0473a', '#f0c34a', '#58a65c', '#c9d4dc', '#7b4a2e', '#ffffff'][(r * 3 + c) % 7])
    gl = Mesh('fridge_glass', M['glass']); gl.quad([(-0.36, 0.12, 0.33), (0.36, 0.12, 0.33), (0.36, 1.78, 0.33), (-0.36, 1.78, 0.33)])
    lt = Mesh('fridge_light', SK['lamp_cool']); lt.quad([(-0.36, 1.8, 0.33), (0.36, 1.8, 0.33), (0.36, 1.86, 0.33), (-0.36, 1.86, 0.33)])
    return combine([m.finish(None, uv=False), gl.finish(None), lt.finish(None)], 'sk_fridge')


def p_bench():
    m = _cm('bench'); m.cbox(-0.7, 0.7, 0.42, 0.46, -0.18, 0.18, '#8a6a4a')
    for sx in (-0.6, 0.6): m.cbox(sx - 0.03, sx + 0.03, 0.0, 0.42, -0.16, 0.16, '#3a3a3a')
    return combine([m.finish(None, uv=False)], 'sk_bench')


def p_crates():
    """水果攤：三層木架＋箱子＋水果（低多邊形球）"""
    m = _cm('crates'); fr = []
    for k, (y, z) in enumerate(((0.0, 0.25), (0.32, -0.12), (0.64, -0.48))):
        m.cbox(-1.1, 1.1, y, y + 0.3, z - 0.18, z + 0.18, '#7a5a3a', 0.9)
        for c in range(4):
            x0 = -1.05 + c * 0.53; m.cbox(x0, x0 + 0.48, y + 0.3, y + 0.42, z - 0.17, z + 0.17, '#b88d55')
            fr.append((x0 + 0.24, y + 0.47, z, ['#e8892c', '#d93c2e', '#f2d040', '#7bb04a', '#a2315a', '#f0a030'][(k * 4 + c) % 6]))
    parts = [m.finish(None, uv=False)]
    by = {}
    for (x, y, z, c) in fr: by.setdefault(c, []).append((x, y, z))
    for c, lst in by.items():
        f = Mesh('fruit', flat('wz_sf_fruit_' + c[1:], c, rough=0.45))
        for (x, y, z) in lst:
            for dx in (-0.14, 0.0, 0.14):
                for dz in (-0.08, 0.08): f.sphere((x + dx, y, z + dz), 0.065, seg=6, rings=4)
        parts.append(f.finish(None, smooth=True))
    return combine(parts, 'sk_crates')



def p_fruitstall():
    """阿忠水果的攤子（AA_413 第 4 節，企劃 9f6a848c；LAWWW2-B 10-23）：「騎樓下排著一箱一箱的水果。紙板上用麥克筆寫著價錢，每一張的字都不一樣大。」
    兩層檯（前層 0.72 m、後層 0.96 m；鐵架＋夾板）、十箱水果（淺木箱、紅色塑膠籃）、五張紙板價錢牌（textures/gen/fruit_price.png，shops_tex.py aa413）、
    右邊一張不鏽鋼小桌（果汁機、杯子：現打木瓜牛奶）、左邊一捲粉紅塑膠袋、前層一台小磅秤。
    原點＝底部中央；正面（客人那一邊）朝 +z；寬 2.5 m（加右邊小桌到 +1.75）、深 0.8 m。老闆站在後面（z −0.75）"""
    m = _cm('fruitstall'); fr = []; rr = random.Random(413)
    for x in (-1.2, 0.0, 1.2):                                                                              # 鐵架（三組，前低後高）
        for z in (0.32, -0.32): m.cbox(x - 0.025, x + 0.025, 0.0, 0.7 if z > 0 else 0.94, z - 0.025, z + 0.025, '#4a4c4e')
    m.cbox(-1.25, 1.25, 0.68, 0.72, 0.0, 0.4, '#b89a72', 0.95); m.cbox(-1.25, 1.25, 0.92, 0.96, -0.4, 0.0, '#b89a72', 0.95)   # 夾板檯面兩層
    m.cbox(-1.25, 1.25, 0.72, 0.92, -0.02, 0.0, '#9a7c56', 0.9)                                              # 兩層中間的立板
    # WZ-SECOND-1104 v2（使用者 11-04 06:1x：不可以同樣的東西換顏色複製）：十箱不再是同樣大小排成方格——
    #   每一箱的寬、深、高、擺的角度不同（木箱、紅色塑膠籃、淺竹籃三種）；每一箱是不同的水果，每顆大小差 ±15%、堆成中間高的一堆、
    #   顏色在同一種水果裡深淺不同；芒果、木瓜是橢圓、香蕉一串一串、梨子套白網、葡萄一顆一顆
    import colorsys as _cs2
    def jit(c, v=0.14):
        r_, g_, b_ = (int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)); h_, l_, s_ = _cs2.rgb_to_hls(r_, g_, b_); l_ = min(0.95, max(0.05, l_ * (1 + rr.uniform(-v, v))))
        r_, g_, b_ = _cs2.hls_to_rgb(h_, l_, s_); return '#%02x%02x%02x' % (int(r_ * 255), int(g_ * 255), int(b_ * 255))
    FK = [('guava', '#9cc35a', 0.05, 1.0), ('banana', '#f2d040', 0, 0), ('orange', '#e8952e', 0.042, 1.0), ('apple', '#c8322a', 0.045, 0.95), ('pear', '#efe9d4', 0.05, 1.15),
          ('dragon', '#d2386c', 0.058, 1.2), ('mango', '#e8b23a', 0.05, 1.4), ('papaya', '#e8952e', 0.07, 1.45), ('grape', '#4a2a4a', 0.0, 0), ('lemon', '#e2d84a', 0.034, 1.1)]
    slots = [(-1.02, 0.2, 0), (-0.53, 0.21, 0), (-0.02, 0.19, 0), (0.5, 0.2, 0), (1.0, 0.21, 0), (-0.98, -0.2, 1), (-0.48, -0.19, 1), (0.03, -0.21, 1), (0.52, -0.2, 1), (1.02, -0.19, 1)]
    for i, (x, z, tier) in enumerate(slots):
        nm, col, r, sy = FK[i]; y = 0.72 if tier == 0 else 0.96
        hw = rr.uniform(0.19, 0.235); hd = rr.uniform(0.14, 0.18); ch = rr.uniform(0.08, 0.15); x += rr.uniform(-0.02, 0.02)
        crate = rr.choice(('#c9a46a', '#b8935a', '#c8322a', '#d8b878')) if nm != 'grape' else '#2f8a4a'
        m.cbox(x - hw, x + hw, y, y + 0.03, z - hd, z + hd, crate, 0.9)
        for sx in (-1, 1): m.cbox(x + sx * hw - 0.012, x + sx * hw + 0.012, y, y + ch, z - hd, z + hd, crate)
        for sz in (-1, 1): m.cbox(x - hw, x + hw, y, y + ch * rr.uniform(0.8, 1.0), z + sz * hd - 0.012, z + sz * hd + 0.012, crate)
        if nm == 'banana':                                                                               # 香蕉：大小不同的三四串，彎的
            for k in range(rr.randint(3, 4)):
                bx = x - hw + 0.08 + k * (2 * hw - 0.16) / 3; n_ = rr.randint(4, 7); L_ = rr.uniform(0.13, 0.18)
                for q in range(n_):
                    a_ = (q / max(1, n_ - 1) - 0.5) * 1.4; fr.append(('cyl', (bx, y + 0.06, z - 0.04), (bx + math.sin(a_) * L_ * 0.5, y + 0.09 + q % 2 * 0.01, z + math.cos(a_) * L_ * 0.6), jit('#f0cf3c', 0.08), 0.021))
            continue
        if nm == 'grape':                                                                                # 葡萄：五串，一顆一顆
            for k in range(5):
                gx, gz = x + rr.uniform(-hw + 0.06, hw - 0.06), z + rr.uniform(-hd + 0.05, hd - 0.05)
                for q in range(12): fr.append(('ell', (gx + rr.uniform(-0.035, 0.035), y + 0.05 + rr.uniform(0, 0.05), gz + rr.uniform(-0.04, 0.04)), jit(col, 0.2), (0.013, 0.015, 0.013)))
            continue
        nx = max(2, int(2 * hw / (2.05 * r))); nz = max(1, int(2 * hd / (2.05 * r)))
        for layer in range(2):
            for a in range(nx - layer):
                for b in range(nz - layer):
                    if layer and rr.random() < 0.3: continue
                    s = rr.uniform(0.85, 1.15); cx = x - hw + r + (a + 0.5 * layer) * 2.05 * r + rr.uniform(-0.008, 0.008); cz = z - hd + r + (b + 0.5 * layer) * 2.05 * r
                    ry_ = r * s * sy * (0.75 if nm in ('mango', 'papaya') else 1.0)
                    fr.append(('ell', (cx, y + 0.03 + ry_ + layer * r * 1.4, cz), jit('#f4f0e4' if nm == 'pear' else col), (r * s * (1.25 if nm in ('mango', 'papaya') else 1.0), ry_, r * s)))
    sx0 = 1.32; m.cbox(sx0, sx0 + 0.5, 0.0, 0.03, -0.25, 0.25, '#9aa0a4')                               # 右邊的不鏽鋼小桌＋果汁機
    for (a, b) in ((sx0 + 0.02, -0.23), (sx0 + 0.48, -0.23), (sx0 + 0.02, 0.23), (sx0 + 0.48, 0.23)): m.cbox(a - 0.015, a + 0.015, 0.0, 0.8, b - 0.015, b + 0.015, '#9aa0a4')
    m.cbox(sx0, sx0 + 0.5, 0.8, 0.83, -0.25, 0.25, '#c9ced2', 0.95)
    m.cbox(sx0 + 0.08, sx0 + 0.24, 0.83, 0.93, -0.08, 0.08, '#2b2b2b'); m.cbox(sx0 + 0.1, sx0 + 0.22, 0.93, 1.15, -0.06, 0.06, '#e8eef0', 0.9); m.cbox(sx0 + 0.11, sx0 + 0.21, 0.93, 1.02, -0.05, 0.05, '#f0a060')   # 果汁機（杯子裡半杯木瓜牛奶）
    for k in range(4): m.cbox(sx0 + 0.3, sx0 + 0.4, 0.83 + k * 0.02, 0.84 + k * 0.02, -0.16, -0.06, '#f4f4f1')   # 疊起來的塑膠杯
    m.cbox(-1.45, -1.3, 0.85, 1.25, -0.08, 0.08, '#e88aa8')                                              # 左邊掛著的一捲粉紅塑膠袋（掛在鐵架上）
    m.cbox(-1.32, -1.28, 0.7, 1.32, -0.02, 0.02, '#4a4c4e')
    m.cbox(-1.05, -0.75, 0.72, 0.8, 0.28, 0.4, '#c0392b'); m.cbox(-1.02, -0.78, 0.8, 0.81, 0.29, 0.39, '#d9dcde')   # 前層左邊的小磅秤（紅色、秤盤）
    parts = [m.finish(None, uv=False)]
    fm = L.CMesh('fruitstall_fruit', FRUIT_VC)                                                         # 每一顆一個顏色（頂點色，一次 draw call；原本一種顏色一個材質）。FRUIT_VC：wz_street 把它併進不投影的 cafe_vc_wz_matte——一顆幾公分，影子看不出來（LAWWW 11-04 lane_east 三角形超標：陰影那一輪又畫一次）；每顆 5×3 段（原本 7×4）
    for it in fr:
        if it[0] == 'cyl': _, a_, b_, c_, r_ = it; n0 = len(fm.bm.faces); Mesh.cyl(fm, a_, b_, r_, seg=5, r2=r_ * 0.7); fm.bm.faces.ensure_lookup_table(); fm.paint([fm.bm.faces[k] for k in range(n0, len(fm.bm.faces))], c_)
        else:
            _, cc, c_, (rx, ry_, rz) = it; n0 = len(fm.bm.faces); Mesh.ell(fm, cc, rx, ry_, rz, seg=5, rings=3); fm.bm.faces.ensure_lookup_table(); fm.paint([fm.bm.faces[k] for k in range(n0, len(fm.bm.faces))], c_)
    parts.append(fm.finish(None, uv=False, smooth=True))
    cm_ = Mesh('fruitprice', _img_mat('wz_fruitprice', 'fruit_price.png', rough=0.85, clip=True)); bm = cm_.bm; uvl = bm.loops.layers.uv.verify()
    # (卡片, 左下、右下、右上、左上)：插在箱子前緣的往後仰一點；小桌上的立在果汁機旁邊、貼在桌子前緣
    def card(x, y0, z, w, tilt=0.06): return [(x - w / 2, y0, z), (x + w / 2, y0, z), (x + w / 2, y0 + w, z - tilt), (x - w / 2, y0 + w, z - tilt)]
    CARDS = [(0, card(-1.0, 0.84, 0.37, 0.17)), (1, card(-0.5, 0.84, 0.37, 0.17)), (4, card(0.0, 1.08, -0.03, 0.17)), (5, card(0.5, 0.84, 0.37, 0.17)), (7, card(-0.5, 1.08, -0.03, 0.17)),   # 芭樂（前層芭樂）、香蕉（前層香蕉）、甜！（後層木瓜）、自己挑（前層蘋果）、不甜包換（後層芭樂）
             (2, card(sx0 + 0.38, 0.83, 0.12, 0.16, 0.02)), (6, card(sx0 + 0.25, 0.6, 0.26, 0.16, 0.0))]                                                                             # 木瓜牛奶（桌上）、現打果汁（桌子前緣）
    for (ci, pts) in CARDS:
        col, row = ci % 4, ci // 4; u0, u1 = col / 4, (col + 1) / 4; v1 = 1 - row / 2; v0 = v1 - 0.5
        f_ = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
        for lp, uv in zip(f_.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
        f2 = bm.faces.new([bm.verts.new(g2b(*q)) for q in (pts[1], pts[0], pts[3], pts[2])])                 # 背面（從店裡看）
        for lp, uv in zip(f2.loops, ((u1, v0), (u0, v0), (u0, v1), (u1, v1))): lp[uvl].uv = uv
    parts.append(cm_.finish(None, uv=False, merge=False))
    return combine(parts, 'sk_fruitstall')

def _crate(m, x0, x1, y0, y1, z0, z1, col='#c9a46a', slat=0.028):
    """木條水果箱：底板＋四面一條一條的木條（中間有縫，看得到裡面的水果）"""
    m.cbox(x0, x1, y0, y0 + 0.02, z0, z1, col, 0.85)
    n = max(2, int((y1 - y0) / 0.075))
    for k in range(n):
        yy = y0 + 0.02 + k * (y1 - y0 - 0.02) / n; h_ = (y1 - y0 - 0.02) / n * 0.62; c_ = col if k % 2 else '#b8935a'
        m.cbox(x0, x1, yy, yy + h_, z1 - slat, z1, c_); m.cbox(x0, x1, yy, yy + h_, z0, z0 + slat, c_)
        m.cbox(x0, x0 + slat, yy, yy + h_, z0, z1, c_); m.cbox(x1 - slat, x1, yy, yy + h_, z0, z1, c_)
    for xx in (x0, x1 - 0.04):
        for zz in (z0, z1 - 0.04): m.cbox(xx, xx + 0.04, y0, y1, zz, zz + 0.04, '#9c7a4c')


def p_fruitcrates(kind):
    """WZ-SECOND-1104 阿忠鮮果（參考圖 azhong_fruit_ext）：攤子兩邊的水果箱。原點＝底部中央、正面朝 +z、深 ≤ 0.55 m（在店面門廊的導航阻擋裡）。
    pine＝兩個疊起來的木箱、上面六顆鳳梨；banana＝兩階的木架、一串一串的香蕉；melon＝綠色塑膠籃上的木箱、四顆大西瓜＋一顆剖半"""
    m = _cm('fruitcrates_' + kind); rr = random.Random(sum(ord(c) * (i + 3) for i, c in enumerate(kind)) % 997); parts = []   # 固定的雜湊（Python 的 hash() 每次執行都不一樣：重匯 GLB 時水果、葉子會變，BB-C 11-04 15:00 T0 比對看到）
    def balls(lst, col, rough=0.45, seg=8):
        f = Mesh('fruit', flat('wz_sf_fruit_' + col[1:], col, rough=rough))
        for (c, rx, ry, rz) in lst: f.ell(c, rx, ry, rz, seg=seg, rings=5)
        parts.append(f.finish(None, smooth=True))
    if kind == 'pine':
        _crate(m, -0.32, 0.32, 0.0, 0.3, -0.24, 0.24); _crate(m, -0.32, 0.32, 0.3, 0.6, -0.24, 0.24)
        body = []; crown = Mesh('pinecrown', flat('wz_sf_pine_leaf', '#4d7a30', rough=0.6))
        for a in range(3):
            for b in range(2):
                x = -0.2 + a * 0.2 + rr.uniform(-0.015, 0.015); z = -0.1 + b * 0.2; y = 0.6 + 0.12
                body.append(((x, y, z), 0.075, 0.12, 0.075))
                for k in range(6):
                    ang = k * math.pi / 3 + rr.uniform(-0.3, 0.3); tx, tz = x + math.cos(ang) * 0.06, z + math.sin(ang) * 0.06
                    crown.cyl((x, y + 0.1, z), (tx, y + 0.27 + rr.uniform(-0.03, 0.03), tz), 0.018, seg=4, r2=0.002)
        balls(body, '#c08a2c', rough=0.75); parts.append(crown.finish(None, smooth=False))
    elif kind == 'banana':
        _crate(m, -0.36, 0.36, 0.0, 0.32, -0.04, 0.26); _crate(m, -0.36, 0.36, 0.0, 0.58, -0.27, -0.04)
        fing = Mesh('banana', flat('wz_sf_banana', '#efcd3c', rough=0.5)); stem = []
        for (cx, cy, cz) in ((-0.2, 0.34, 0.11), (0.02, 0.35, 0.12), (0.22, 0.34, 0.1), (-0.17, 0.6, -0.16), (0.1, 0.61, -0.15)):
            for k in range(5):
                ang = -0.5 + k * 0.25; dx, dz = math.sin(ang) * 0.09, math.cos(ang) * 0.09
                fing.cyl((cx, cy + 0.02, cz - 0.02), (cx + dx * 0.6, cy + 0.06, cz + dz * 0.5), 0.022, seg=6, r2=0.026)
                fing.cyl((cx + dx * 0.6, cy + 0.06, cz + dz * 0.5), (cx + dx * 1.1, cy + 0.1, cz + dz * 1.0), 0.026, seg=6, r2=0.012)
            stem.append(((cx, cy + 0.035, cz - 0.03), 0.02, 0.02, 0.03))
        parts.append(fing.finish(None, smooth=True)); balls(stem, '#5d4a22', rough=0.8, seg=6)
    elif kind == 'melon':
        m.cbox(-0.38, 0.38, 0.0, 0.25, -0.26, 0.26, '#2f8a4a', 0.9)                                                    # 綠色塑膠籃
        for k in range(5): m.cbox(-0.36 + k * 0.17, -0.3 + k * 0.17, 0.05, 0.2, 0.258, 0.262, '#24703a')
        _crate(m, -0.38, 0.38, 0.25, 0.5, -0.26, 0.26)
        mel = []; stripes = []
        for i, (x, z) in enumerate(((-0.18, -0.1), (0.18, -0.1), (-0.18, 0.12), (0.2, 0.13))):
            c = (x, 0.5 + 0.13 + (0.03 if i < 2 else 0.0), z); mel.append((c, 0.17, 0.135, 0.2))
            for k in range(6):   # 深綠色的條紋：貼在表面的細長橢球
                a_ = k * math.pi / 3; stripes.append(((c[0] + math.cos(a_) * 0.158, c[1], c[2] + math.sin(a_) * 0.0), 0.02, 0.128, 0.19))
        balls(mel, '#4d7a3a', rough=0.35, seg=12); balls(stripes, '#22401f', rough=0.35, seg=6)
        cut = Mesh('melon_cut', flat('wz_sf_melon_red', '#d8403a', rough=0.5)); cut.box(-0.1, 0.1, 0.5, 0.505, 0.27, 0.29)
        parts.append(cut.finish(None))
    elif kind in ('orange', 'apple', 'guava', 'tomato'):   # 汀州鮮果外觀第 3 版（BB 11-11 01:47：敞開的店面只有一張平面照片 → 開口前排放真的水果箱）：綠色塑膠籃墊高＋斜放的木箱，上面一堆水果、一張黃色價目卡
        cols = {'orange': ('#e8962a', '#f0a83a'), 'apple': ('#c0392b', '#a82a22'), 'guava': ('#9fc85a', '#b4d46a'), 'tomato': ('#d8452f', '#e86a3a')}[kind]; r_ = {'orange': 0.076, 'apple': 0.074, 'guava': 0.08, 'tomato': 0.068}[kind]
        m.cbox(-0.36, 0.36, 0.0, 0.26, -0.25, 0.25, '#2f8a4a', 0.9)
        for k in range(5): m.cbox(-0.34 + k * 0.16, -0.29 + k * 0.16, 0.05, 0.21, 0.248, 0.252, '#24703a')
        _crate(m, -0.36, 0.36, 0.26, 0.44, -0.25, 0.25)
        for ci in range(2):
            lst = []
            for a in range(4):
                for b in range(3):
                    for l in range(2 if (a in (1, 2) and b == 1) else 1):
                        if (a + b + l) % 2 != ci: continue
                        lst.append(((-0.255 + a * 0.17 + rr.uniform(-0.012, 0.012) + l * 0.04, 0.44 + r_ * 0.6 + l * r_ * 1.5, -0.155 + b * 0.155 + rr.uniform(-0.01, 0.01)), r_, r_ * 0.95, r_))
            balls(lst, cols[ci], seg=6)
        m.cbox(-0.14, 0.14, 0.47, 0.63, 0.252, 0.262, '#f6e23a'); m.cbox(-0.1, 0.1, 0.56, 0.6, 0.262, 0.266, '#c9302a')
    parts.insert(0, m.finish(None, uv=False))
    return combine(parts, 'sk_fruitcrates_' + kind)


FRUIT_CARDS = {'fruit_pine': [('wz2_azhong_fruit_pine', 0.0, 0.32, 0.26, 0.16)], 'fruit_banana': [('wz2_azhong_fruit_banana', 0.0, 0.36, 0.28, 0.16)],
               'fruit_melon': [('wz2_azhong_fruit_melon', 0.0, 0.52, 0.28, 0.17)]}


def p_noodle():
    """麵攤（台灣麵店在店門口煮麵）：倒角的不鏽鋼工作台（正面紅色烤漆板）、兩口有提耳的湯鍋（一鍋蓋著）、竹撈、湯杓、
    玻璃櫥窗（碗疊、麵團、滷味盤）。v6c：原本是直角方塊＋圓柱，像灰色積木"""
    s = Mesh('noodle_steel', SK['steel'])
    s.rbox(-0.8, 0.8, 0.08, 0.85, -0.3, 0.3, r=0.02, seg=2); s.rbox(-0.83, 0.83, 0.85, 0.89, -0.33, 0.33, r=0.012, seg=2)   # 台身、檯面（前緣往外一點）
    for x in (-0.76, 0.76):
        for z in (-0.26, 0.26): s.cyl((x, 0.0, z), (x, 0.09, z), 0.025, seg=8)                                   # 腳
    for (x, r, h) in ((-0.42, 0.21, 0.26), (0.08, 0.17, 0.2)):                                                       # 湯鍋：鍋身、鍋口捲邊、兩個提耳
        bm = L.lathe([(0.0, 0.0), (r - 0.01, 0.0), (r, 0.01), (r, h - 0.012), (r + 0.012, h - 0.004), (r + 0.012, h), (r - 0.004, h), (r - 0.006, h - 0.02), (0.0, h - 0.02)], seg=20)
        s.add_bm(bm, Matrix.Translation(g2b(x, 0.89, 0.0))); bm.free()
        for sx in (-1, 1): s.cyl((x + sx * (r + 0.005), 0.89 + h - 0.05, -0.03), (x + sx * (r + 0.04), 0.89 + h - 0.05, 0.03), 0.008, seg=5)
    bm = L.lathe([(0.0, 0.25), (0.05, 0.245), (0.12, 0.225), (0.175, 0.205), (0.18, 0.2), (0.0, 0.2)], seg=20); s.add_bm(bm, Matrix.Translation(g2b(0.08, 0.89, 0.0))); bm.free()   # 小鍋的蓋子
    s.cyl((0.08, 0.89 + 0.25, 0.0), (0.08, 0.89 + 0.27, 0.0), 0.02, seg=8)
    s.cyl((-0.42, 0.89 + 0.24, 0.12), (-0.62, 0.89 + 0.62, 0.22), 0.008, seg=5)                                       # 湯杓
    bm = L.lathe([(0.0, 0.0), (0.04, 0.005), (0.05, 0.03), (0.0, 0.03)], seg=10); s.add_bm(bm, Matrix.Translation(g2b(-0.42, 0.89 + 0.2, 0.12))); bm.free()
    s.rbox(0.42, 0.8, 0.89, 0.92, -0.28, 0.1, r=0.008, seg=1)                                                         # 櫥窗底座、框
    for (x, z) in ((0.42, -0.28), (0.8, -0.28), (0.42, 0.1), (0.8, 0.1)): s.cyl((x, 0.92, z), (x, 1.32, z), 0.012, seg=6)
    s.rbox(0.41, 0.81, 1.31, 1.34, -0.29, 0.11, r=0.008, seg=1)
    r_ = Mesh('noodle_red', SK['enamel_red']); r_.rbox(-0.74, 0.74, 0.18, 0.76, 0.3, 0.31, r=0.01, seg=1)            # 正面紅色烤漆板
    bb = Mesh('noodle_bamboo', SK['wood_lt'])                                                                          # 竹撈（掛在鍋邊）
    for k in range(2):
        x = -0.6 + k * 0.1; bb.cyl((x, 1.16, -0.05), (x - 0.02, 1.5, -0.2), 0.008, seg=5)
        bm = L.lathe([(0.0, 0.0), (0.045, 0.02), (0.06, 0.06), (0.0, 0.06)], seg=10); bb.add_bm(bm, Matrix.Translation(g2b(x, 1.06, -0.03))); bm.free()
    g = Mesh('noodle_glass', M['glass']); g.quad([(0.42, 0.92, 0.1), (0.8, 0.92, 0.1), (0.8, 1.31, 0.1), (0.42, 1.31, 0.1)]); g.quad([(0.8, 0.92, 0.1), (0.8, 0.92, -0.28), (0.8, 1.31, -0.28), (0.8, 1.31, 0.1)])
    w = _cm('noodle_food')
    for k in range(4): w.crbox(0.46, 0.58, 0.925 + k * 0.014, 0.937 + k * 0.014, -0.16, -0.04, '#f4f1ea', r=0.005, seg=1)   # 碗疊
    for k in range(5): w.cbox(0.62 + (k % 3) * 0.05, 0.66 + (k % 3) * 0.05, 0.92, 0.95, -0.2 + (k // 3) * 0.08, -0.15 + (k // 3) * 0.08, '#efd9a0')   # 一球一球的麵
    w.cbox(0.47, 0.75, 1.1, 1.12, -0.22, 0.04, '#c9c4bb'); w.cbox(0.5, 0.72, 1.12, 1.15, -0.2, 0.02, '#7a4a2a')     # 層板上的滷味盤
    w.cbox(-0.6, -0.24, 0.89 + 0.235, 0.89 + 0.24, -0.17, 0.17, '#c9a674')                                           # 大鍋的湯面
    return combine([s.finish(None, smooth=True), r_.finish(None), bb.finish(None, smooth=True), g.finish(None), w.finish(None, uv=False)], 'sk_noodle')


def p_bookcart():
    m = _cm('bookcart'); m.cbox(-0.6, 0.6, 0.0, 0.62, -0.24, 0.24, '#6a4a30'); m.cbox(-0.62, 0.62, 0.62, 0.66, -0.26, 0.26, '#7a5a3c')
    cols = ['#3d5a47', '#8a3a2a', '#d9c7a6', '#2f3e5c', '#c9a040', '#6d6d6d', '#a85a4a']
    x = -0.56; i = 0
    while x < 0.5:
        w = 0.035 + (i % 3) * 0.012; m.cbox(x, x + w, 0.66, 0.66 + 0.2 + (i % 4) * 0.02, -0.18, 0.12, cols[i % len(cols)]); x += w + 0.004; i += 1
    return combine([m.finish(None, uv=False)], 'sk_bookcart')


def p_meter():
    m = _cm('meter'); m.cbox(-0.22, 0.22, 0.0, 0.62, -0.02, 0.12, '#b9bcb6'); m.cbox(-0.12, 0.12, 0.34, 0.5, 0.12, 0.125, '#3a4048')
    return combine([m.finish(None, uv=False)], 'sk_meter')


def p_outlet(face='x'):
    """騎樓柱子上的插座（ZQ-ARCADE-SEAT-1028，LAWWW2-B 11-01：子晴「坐在騎樓下的插座旁邊，筆電開著」）：白色面板、上下兩個插座（兩條直的插孔＋接地孔）。
    face 'x'＝朝本地 −x、'z'＝朝本地 −z（公館的店轉了 π：分別朝世界 +x、+z）；原點在面板背面中心（y 由 inst 給）"""
    m = _cm('outlet')
    def bx(d0, d1, y0, y1, w0, w1, col, k=1.0):   # d＝離牆的深度（往外是負的），w＝沿牆的橫向
        if face == 'x': m.cbox(d0, d1, y0, y1, w0, w1, col, k)
        else: m.cbox(w0, w1, y0, y1, d0, d1, col, k)
    bx(-0.009, 0.0, -0.06, 0.06, -0.037, 0.037, '#ece8de')
    for yc in (-0.026, 0.026):
        bx(-0.012, -0.009, yc - 0.017, yc + 0.017, -0.017, 0.017, '#dcd7cb', 0.95)
        for wc in (-0.0065, 0.0065): bx(-0.0125, -0.0115, yc - 0.002, yc + 0.007, wc - 0.0012, wc + 0.0012, '#2c2b29')
        bx(-0.0125, -0.0115, yc - 0.010, yc - 0.006, -0.002, 0.002, '#2c2b29')
    return combine([m.finish(None, uv=False)], 'sk_outlet_' + face)


P_STOOL_R, P_STOOL_B = p_stool('#c8392e'), p_stool('#2f6fb0')
def p_fntree():
    """花序門口的樹（FLOWER-NOTES 第 2 版；參考圖 exterior.png：門兩邊各一棵，白色方盆、細樹幹、修成圓的細葉樹冠）。原點＝底部中央。
    樹冠＝幾顆平滑的橢球（深淺三種綠）＋表面伸出來的一片片葉子（風箏形，兩面都看得到）——不是一顆顆多面體的球"""
    m = _cm('fntree'); rr = random.Random(417); parts = []
    m.cbox(-0.24, 0.24, 0.0, 0.6, -0.24, 0.24, '#f1ece2'); m.cbox(-0.25, 0.25, 0.56, 0.6, -0.25, 0.25, '#e6dfd2'); m.cbox(-0.21, 0.21, 0.6, 0.61, -0.21, 0.21, '#4a3a2a')
    tk = Mesh('fntrunk', flat('wz_sf_fntrunk', '#7a6a52', rough=0.8)); tk.cyl((0.0, 0.6, 0.0), (0.02, 1.15, 0.01), 0.028, seg=7, r2=0.022); tk.cyl((0.02, 1.15, 0.01), (0.0, 1.6, 0.0), 0.022, seg=7, r2=0.016)
    for (ex, ez) in ((0.16, 0.05), (-0.14, 0.08), (0.02, -0.15)): tk.cyl((0.0, 1.5, 0.0), (ex, 1.85, ez), 0.012, seg=5, r2=0.006)
    parts.append(tk.finish(None, smooth=True))
    cols = ('#4f7242', '#456a3c', '#5c7f4c'); lcols = ('#7a9a62', '#628a50', '#90ad74'); blobs = [[], [], []]; leaves = [Mesh('fnleaf%d' % k, flat('wz_sf_fnleaf_' + c[1:], c, rough=0.75, cull=False)) for k, c in enumerate(lcols)]
    for i in range(13):
        a_ = i * 2.39996; rd = 0.06 + 0.27 * rr.random(); c = (math.cos(a_) * rd, 1.62 + 0.62 * rr.random(), math.sin(a_) * rd * 0.85); r_ = 0.15 + 0.08 * rr.random()
        blobs[i % 3].append((c, r_ * 0.93, r_ * 0.82, r_ * 0.93))
        for k in range(64):   # 葉片：貼著橢球表面鋪（面朝外、葉尖稍微翹起來），從外面看到的是一片片葉子，不是球
            th = rr.uniform(0.1, 2.8); ph = rr.uniform(0, 2 * math.pi); n = Vector((math.sin(th) * math.cos(ph), math.cos(th), math.sin(th) * math.sin(ph)))
            t1 = n.cross(Vector((0.0, 1.0, 0.0))); t1 = (t1 if t1.length > 1e-3 else Vector((1.0, 0.0, 0.0))).normalized(); t2 = n.cross(t1); ang = rr.uniform(0, 2 * math.pi)
            d_ = (t1 * math.cos(ang) + t2 * math.sin(ang) + n * 0.4).normalized(); wv = n.cross(d_).normalized(); ln = rr.uniform(0.12, 0.19); wd = ln * 0.32
            b = Vector(c) + Vector((n.x * r_, n.y * r_ * 0.88, n.z * r_)) * 0.96; tip = b + d_ * ln; mid = b + d_ * ln * 0.5 + n * ln * 0.06
            leaves[(i + k) % 3].quad([tuple(b), tuple(mid + wv * wd), tuple(tip), tuple(mid - wv * wd)])
    for k, c in enumerate(cols):
        f = Mesh('fnball%d' % k, flat('wz_sf_fnball_' + c[1:], c, rough=0.85))
        for (cc, rx, ry, rz) in blobs[k]: f.ell(cc, rx, ry, rz, seg=10, rings=6)
        parts.append(f.finish(None, smooth=True)); parts.append(leaves[k].finish(None, smooth=False))
    parts.insert(0, m.finish(None, uv=False))
    return combine(parts, 'sk_fntree')


def p_fnbox(w=2.6, d=0.34):
    """花序櫥窗下的長花箱（參考圖：白色花箱，一叢叢綠葉上面粉、紫、白的小花）。原點＝底部中央、長邊沿 x"""
    m = _cm('fnbox'); rr = random.Random(523); parts = []
    m.cbox(-w / 2, w / 2, 0.0, 0.34, -d / 2, d / 2, '#f1ece2'); m.cbox(-w / 2 - 0.01, w / 2 + 0.01, 0.3, 0.34, -d / 2 - 0.01, d / 2 + 0.01, '#e6dfd2'); m.cbox(-w / 2 + 0.03, w / 2 - 0.03, 0.34, 0.35, -d / 2 + 0.03, d / 2 - 0.03, '#4a3a2a')
    n_ = max(3, int(w / 0.24)); mound = [[], []]; fl = {c: [] for c in ('#e9a3b8', '#b9a3d8', '#f6f1e8', '#d98aa6')}; fk = list(fl)
    for i in range(n_):
        xx = -w / 2 + 0.13 + i * (w - 0.26) / (n_ - 1); zz = 0.03 * ((i % 3) - 1); mound[i % 2].append(((xx, 0.4, zz), 0.14, 0.11, 0.13))
        for j in range(4):
            a_ = j * 2.39996 + i; rd = 0.05 + 0.06 * rr.random(); fl[fk[(i + j) % 4]].append(((xx + math.cos(a_) * rd, 0.5 + 0.03 * rr.random(), zz + math.sin(a_) * rd), 0.045, 0.034, 0.045))
    for k, c in enumerate(('#58804a', '#6f8f5a')):
        f = Mesh('fnmound%d' % k, flat('wz_sf_fnball_' + c[1:], c, rough=0.85))
        for (cc, rx, ry, rz) in mound[k]: f.ell(cc, rx, ry, rz, seg=9, rings=5)
        parts.append(f.finish(None, smooth=True))
    for c, lst in fl.items():
        f = Mesh('fnflower_' + c[1:], flat('wz_sf_fnflower_' + c[1:], c, rough=0.6))
        for (cc, rx, ry, rz) in lst: f.ell(cc, rx, ry, rz, seg=6, rings=3)
        parts.append(f.finish(None, smooth=True))
    parts.insert(0, m.finish(None, uv=False))
    return combine(parts, 'sk_fnbox_%d' % int(w * 100))


PROTO = {'fruit_pine': p_fruitcrates('pine'), 'fruit_banana': p_fruitcrates('banana'), 'fruit_melon': p_fruitcrates('melon'), 'fruit_orange': p_fruitcrates('orange'), 'fruit_apple': p_fruitcrates('apple'), 'fruit_guava': p_fruitcrates('guava'), 'fruit_tomato': p_fruitcrates('tomato'), 'stool_r': P_STOOL_R, 'stool_b': P_STOOL_B, 'bins': p_bins(), 'boxes': p_boxes(), 'umb': p_umbrella(), 'vend': p_vend(),
         'fridge': p_fridge(), 'bench': p_bench(), 'crates': p_crates(), 'fruitstall': p_fruitstall(), 'noodle': p_noodle(), 'bookcart': p_bookcart(), 'meter': p_meter(), 'outlet': p_outlet('x'), 'outlet_z': p_outlet('z')}

NOTE_Q = []   # (四點世界座標, 圖集格名稱)：最後合成一個網格（一次 draw call）


def note(xf, cellname, x, y, w, h, z):
    if cellname in XS_ATLAS:   # WZ-FIVE-1104：參考圖裁的價目牌／菜單（xs_front_tex.py 的 wz_* 那幾格），貼 wz_xs_fronts 圖集，不是紙條圖集
        xs_quad(cellname, [xf.p(x - w / 2, y, z), xf.p(x + w / 2, y, z), xf.p(x + w / 2, y + h, z), xf.p(x - w / 2, y + h, z)]); return
    NOTE_Q.append(([xf.p(x - w / 2, y, z), xf.p(x + w / 2, y, z), xf.p(x + w / 2, y + h, z), xf.p(x - w / 2, y + h, z)], cellname))



def cork_board(xf, x, y0, w, h, z, cells=('tutor', 'rent', 'lostcat', 'hours2', 'blank')):
    """門邊的布告欄（AA_413 第 3 節：自助洗衣「看布告欄」，布告欄的字照月份換——遊戲的字；這裡只畫一塊軟木板、鋁框、幾張用圖釘釘著的紙）：
    鋁框＋軟木板貼在玻璃外面 z（玻璃＋3 cm）；紙條用玻璃紙條同一張圖集（NOTES），每張歪一點"""
    xf.box(acc(SK['alu2']), x - w / 2 - 0.03, x + w / 2 + 0.03, y0 - 0.03, y0 + h + 0.03, z, z + 0.02)
    xf.box(acc(flat('wz_cork', '#b98a58', rough=0.9)), x - w / 2, x + w / 2, y0, y0 + h, z + 0.02, z + 0.03)
    rr = random.Random(int(abs(x) * 100)); n = len(cells)
    for i, cn in enumerate(cells):
        cw = rr.uniform(0.18, 0.24); ch = cw * rr.uniform(1.1, 1.35); cx = x - w / 2 + 0.06 + cw / 2 + i * (w - 0.12 - cw) / max(1, n - 1); cy = y0 + 0.06 + (h - ch - 0.12) * (0.25 + 0.5 * ((i * 37) % 3) / 2)
        a = rr.uniform(-0.12, 0.12); ca, sa = math.cos(a), math.sin(a); zz = z + 0.032 + i * 0.002
        pts = [xf.p(cx + (dx * ca - dy * sa), cy + (dx * sa + dy * ca), zz) for (dx, dy) in ((-cw / 2, -ch / 2), (cw / 2, -ch / 2), (cw / 2, ch / 2), (-cw / 2, ch / 2))]
        note_tilt(pts, cn)
        xf.box(acc(flat('wz_pin_' + ('red' if i % 2 else 'blue'), '#c0392b' if i % 2 else '#2f5fa8', rough=0.4)), cx - 0.008, cx + 0.008, cy + ch / 2 - 0.03, cy + ch / 2 - 0.014, zz, zz + 0.01)


def note_tilt(pts_world, cellname):
    if cellname in XS_ATLAS: xs_quad(cellname, pts_world); return   # WZ-FIVE-1104：A 字立牌貼參考圖裁的黑板
    NOTE_Q.append((pts_world, cellname))


def build_notes():
    if not NOTE_Q: return
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    for pts, cn in NOTE_Q:
        i = NOTES.index(cn); col, row = i % 4, i // 4; u0, u1 = col / 4, (col + 1) / 4; v1 = 1 - row / 4; v0 = v1 - 0.25
        vs = [bm.verts.new(g2b(*p)) for p in pts]; f = bm.faces.new(vs)
        for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    me = bpy.data.meshes.new('wz_shop_notes'); bm.to_mesh(me); bm.free(); me.materials.append(SK['notes'])
    ob = bpy.data.objects.new('wz_shop_notes', me); B.scene().collection.objects.link(ob); ob.parent = root


def aboard(xf, x, z, cell='chalk'):
    """A 字立牌：木腳＋前後兩面（圖集的黑板）"""
    a_, b_ = xf.p(x - 0.3, 0, z - 0.22), xf.p(x + 0.3, 0, z + 0.22); PROP_FP.append(dict(tag='aboard', rect=[round(min(a_[0], b_[0]), 3), round(min(a_[2], b_[2]), 3), round(max(a_[0], b_[0]), 3), round(max(a_[2], b_[2]), 3)], h=0.95))
    m = acc(SK['wood_lt'])
    for sx in (-0.3, 0.27): xf.box(m, x + sx, x + sx + 0.03, 0.0, 0.95, z - 0.22, z + 0.22)
    for s in (-1, 1):
        zb, zt = z + s * 0.2, z + s * 0.03
        a = xf.p(x - 0.27, 0.1, zb); b = xf.p(x + 0.27, 0.1, zb); c = xf.p(x + 0.27, 0.9, zt); d = xf.p(x - 0.27, 0.9, zt)
        note_tilt([a, b, c, d] if s > 0 else [b, a, d, c], cell)


# ---------------- 店面 ----------------
def _door_glass(spec, xf, sf, iw, ih, gz, fr, top):
    """店門、玻璃、暖簾、鐵捲門箱＋導軌（溫州街門廊店面、公館騎樓店面共用；原本寫在 shopfront_v2 裡）"""
    # 門面
    door = sf.get('door', 'alu'); f_ = acc(fr)
    if door == 'none':   # 118 巷的外帶飲料店：門、窗、櫃台都由 _drink 照參考圖做，這裡只留上面的橫框
        xf.box(f_, -iw / 2, iw / 2, ih + 0.1, ih + 0.18, gz - 0.06, gz + 0.06); return
    if door != 'open':
        xf.box(f_, -iw / 2, iw / 2, ih + 0.1, ih + 0.18, gz - 0.06, gz + 0.06); xf.box(f_, -iw / 2, iw / 2, 0.08, 0.16, gz - 0.06, gz + 0.06)
        xf.quad(acc(M['glass']), [(-iw / 2, 0.16, gz + 0.01), (iw / 2, 0.16, gz + 0.01), (iw / 2, ih + 0.1, gz + 0.01), (-iw / 2, ih + 0.1, gz + 0.01)])
    dw = sf.get('door_w', 1.8); dx = sf.get('door_x', 0.0)
    _sdw = sf.get('door_w', 2.4 if door == 'auto' else 1.8); season_door(spec, xf, dx - _sdw / 2, dx + _sdw / 2, ih + 0.1, gz, 'open' if door == 'open' else 'shop', glass=(-iw / 2, iw / 2))   # 季節布置用（只記錄）
    if door == 'alu':
        a = acc(frame_mat(sf['frame_col'])) if sf.get('frame_col') else acc(SK['alu2'])   # frame_col：鋁門窗框的顏色（L118-SHOPS-REDO-1111：義大麵屋奶油白、迪倫披薩黑鐵）
        for x in (-iw / 2, dx - dw / 2, dx, dx + dw / 2, iw / 2) + tuple(sf.get('mullions', ())): xf.box(a, x - 0.04, x + 0.04, 0.085, ih + 0.175, gz - 0.05, gz + 0.05)   # 直框的兩端藏在上下橫框裡（BUG-WZFLICKER-2：原本頂面、底面和橫框同一個平面）；mullions＝窗中間多的直框（阿德）
        for x in (dx - 0.12, dx + 0.08): xf.box(a, x, x + 0.03, 0.9, 1.45, gz + 0.05, gz + 0.1)                    # 長把手
        if not sf.get('full_glass'): xf.box(a, -iw / 2, iw / 2, 1.0, 1.04, gz - 0.03, gz + 0.03)                    # 腰框（full_glass＝落地玻璃，沒有腰框：阿德參考圖）
        if sf.get('glass_band'):                                                                                      # 玻璃上的一條色條（阿德：藍色，窗的部分，門不貼）
            bc, by0, by1 = sf['glass_band']; bm_ = acc(flat('wz_sf_band_' + bc[1:], bc, rough=0.5)); xr = sf['pier_r'] if sf.get('pier_r') is not None else iw / 2
            for x0_, x1_ in ((-iw / 2, dx - dw / 2), (dx + dw / 2, xr)):
                if x1_ - x0_ > 0.2: xf.box(bm_, x0_ + 0.04, x1_ - 0.04, by0, by1, gz + 0.012, gz + 0.018)
    elif door in ('wood', 'lattice'):
        w = acc(frame_mat(sf['frame'])) if sf.get('frame') else acc(SK['wood_dk'])   # WZ-FIVE-1104：frame＝框的顏色（SUNNY SIDE 深綠框）
        if sf.get('grid'):   # WZ-FIVE-1104：大窗的格子（每 grid 公尺一根直框、上面一道橫框；門那一段不畫）——SUNNY SIDE 參考圖的綠框落地窗
            l0, l1 = dx - dw / 2, dx + dw / 2
            for x0_, x1_ in ((-iw / 2, l0), (l1, iw / 2)):
                if x1_ - x0_ < 0.3: continue
                xf.box(w, x0_, x1_, ih - 0.55, ih - 0.5, gz - 0.04, gz + 0.04)
                n_ = max(1, round((x1_ - x0_) / sf['grid']))
                for j in range(1, n_): x = x0_ + j * (x1_ - x0_) / n_; xf.box(w, x - 0.025, x + 0.025, 0.55, ih + 0.1, gz - 0.04, gz + 0.04)
        for x in (-iw / 2, dx - dw / 2, dx, dx + dw / 2, iw / 2): xf.box(w, x - 0.06, x + 0.06, 0.085, ih + 0.175, gz - 0.065, gz + 0.065)   # 直框：兩端藏在橫框裡、前後凸出橫框 5 mm（BUG-WZFLICKER-2）
        xf.box(w, -iw / 2, iw / 2, 0.085, 0.55, gz - 0.04, gz + 0.04)                                                  # 下半部木板
        if door == 'lattice':                                                                                         # 木格拉門（定食、茶屋）：只有門那一段是格子，其他是木框玻璃窗（v5 整面格子像籠子）
            l0, l1 = dx - dw / 2, dx + dw / 2
            for k in range(1, 8): y = 0.55 + k * (ih - 0.45) / 8; xf.box(w, l0, l1, y - 0.012, y + 0.012, gz - 0.03, gz + 0.03)
            for k in range(1, int((l1 - l0) / 0.15)): x = l0 + k * 0.15; xf.box(w, x - 0.012, x + 0.012, 0.55, ih + 0.1, gz - 0.03, gz + 0.03)
            pane = sf.get('pane', 1.2); sill = sf.get('sill', 0.55)
            for x0_, x1_ in ((-iw / 2, l0), (l1, iw / 2)):                                                         # 窗：中間一道橫框、每 1.2 m 一根直框
                if x1_ - x0_ < 0.3: continue
                xf.box(w, x0_, x1_, 1.45, 1.5, gz - 0.04, gz + 0.04)
                if sill > 0.55: xf.box(w, x0_, x1_, 0.55, sill, gz - 0.04, gz + 0.04); xf.box(w, x0_, x1_, sill, sill + 0.05, gz - 0.07, gz + 0.12)   # WZ-FIVE-1104 小路：木腰板到窗台 0.85＋窗台板（參考圖）
                if pane < 1.2: xf.box(w, x0_, x1_, ih - 0.3, ih - 0.26, gz - 0.035, gz + 0.035)                                             # 上面再一道細橫框（小格子窗）
                n_ = max(1, round((x1_ - x0_) / pane))
                for j in range(1, n_): x = x0_ + j * (x1_ - x0_) / n_; xf.box(w, x - (0.03 if pane >= 1.2 else 0.02), x + (0.03 if pane >= 1.2 else 0.02), sill, ih + 0.1, gz - 0.04, gz + 0.04)
        for x in (dx - 0.1, dx + 0.07): xf.box(acc(M['brass']), x, x + 0.03, 1.0, 1.2, gz + 0.06, gz + 0.1)
    elif door == 'auto':
        a = acc(SK['alu2']); dw = sf.get('door_w', 2.4)
        for x in (-iw / 2, dx - dw / 2, dx, dx + dw / 2, iw / 2): xf.box(a, x - 0.03, x + 0.03, 0.085, ih + 0.175, gz - 0.05, gz + 0.05)
        xf.box(a, dx - dw / 2 - 0.1, dx + dw / 2 + 0.1, ih + 0.18, ih + 0.36, gz - 0.02, gz + 0.16)                 # 自動門的機箱
        xf.box(acc(M['ac_dark']), dx - 0.08, dx + 0.08, ih + 0.2, ih + 0.26, gz + 0.16, gz + 0.19)                   # 感應器
    elif door == 'open':                                                                                              # 整面拉開：摺門收在兩側
        w = acc(SK['alu2'])
        for sx in (-1, 1):
            for k in range(4):
                x = sx * (iw / 2 - 0.05 - k * 0.07); xf.box(w, x - 0.025, x + 0.025, 0.05, ih + 0.1, gz - 0.25 + (k % 2) * 0.12, gz + 0.02)
        xf.box(f_, -iw / 2, iw / 2, ih + 0.1, ih + 0.18, gz - 0.06, gz + 0.06)
    if sf.get('noren'):                                                                                               # 暖簾（定食）
        for k in range(3):                                                                                            # v6d：三片布（中間開衩）、布面微微起伏、白色「食」字跨三片（BB-B：原本三塊深色平板像方板）
            x0 = dx - 0.75 + k * 0.5
            for j in range(6):
                a_, b_ = x0 + 0.015 + j * 0.47 / 6, x0 + 0.015 + (j + 1) * 0.47 / 6
                za, zb_ = gz + 0.12 + 0.012 * math.sin(j * 1.9 + k), gz + 0.12 + 0.012 * math.sin((j + 1) * 1.9 + k)
                u0, u1 = (k + j / 6) / 3, (k + (j + 1) / 6) / 3
                pq = [xf.p(a_, ih - 0.62, za), xf.p(b_, ih - 0.62, zb_), xf.p(b_, ih + 0.05, zb_), xf.p(a_, ih + 0.05, za)]
                nk = sf['noren'] if isinstance(sf['noren'], str) else None
                if nk in XS_ATLAS:   # WZ-FIVE-1104：參考圖裁的暖簾（小路），每一條照位置取圖集裡那一段
                    U0, V0, U1, V1 = XS_ATLAS[nk][:4]; _XSQ.append((pq, (U0 + (U1 - U0) * u0, V0, U0 + (U1 - U0) * u1, V1), False)); continue
                uvquad(f'sk_noren_{spec["id"]}_{k}_{j}', SK['noren'], pq, (u0, 0.0, u1, 1.0))
        xf.cyl(acc(SK['wood_dk']), (dx - 0.8, ih + 0.07, gz + 0.12), (dx + 0.8, ih + 0.07, gz + 0.12), 0.02, seg=6)
    # 鐵捲門箱＋導軌
    if sf.get('rollbox', True):
        a = acc(M['alu']); xf.box(a, -iw / 2 - 0.05, iw / 2 + 0.05, ih + 0.2, top - 0.05, gz + 0.06, gz + 0.36)
        for sx in (-1, 1): xf.box(a, sx * (iw / 2 + 0.02) - 0.035, sx * (iw / 2 + 0.02) + 0.035, 0.0, ih + 0.2, gz + 0.06, gz + 0.14)


# OPEN-SRC-2D3D-1104（LAWWW2-C 2026-11-04，使用者「從 GitHub 開源找…還有很多你需要用的美術內容」）：Poly Haven（CC0）的實景掃描模型，
# lib2.ph_model 自動下載（tools/blender/models_ph/，不放 repo）、減面、貼圖縮成 512；一個原型 instancing（同一種東西整條街一份網格）
PH = {}
def ph_proto(key):
    if key not in PH:
        if key == 'ac': PH[key] = L.ph_model('exterior_aircon_unit', nodes=['exterior_aircon_unit'], ratio=0.16, name='ph_ac', back=True)   # 冷氣室外機：9,493 → 1,517 面
        elif key == 'pot': PH[key] = L.ph_model('potted_plant_02', ratio={'potted_plant_02_leaves': 0.2, 'potted_plant_02_pot': 0.12, 'potted_plant_02_dirt': 0.004}, name='ph_pot_syngonium')   # 陶盆合果芋：69,806 → 約 3,000 面
        elif key == 'succ': PH[key] = L.ph_model('potted_plant_04', ratio=0.15, name='ph_pot_succulent')   # 白盆多肉：8,929 → 約 1,300 面（potted_plant_01 小樹的葉子是上千片分開的小葉，減面只到 68,000 面，不用）
    return PH[key]


def _decal_tex(kind):
    """玻璃上的白字貼紙（透明底）：阿德＝參考圖 wz_ade_ext 的四行服務項目（圖示＋字），本作自己畫（PIL），不是裁參考圖（裁下來的背景是店裡的灰色）"""
    from PIL import Image, ImageDraw, ImageFont
    fn = f'wz_decal_{kind}.png'; out = os.path.join(GEN, fn)
    W_, H_ = 512, 512; im = Image.new('RGBA', (W_, H_), (255, 255, 255, 0)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 64); wh = (250, 250, 248, 255)
    rows = ['影印・複印', '掃描建檔', '彩色列印', '論文裝訂']
    for i, t in enumerate(rows):
        y = 28 + i * 120; d.rounded_rectangle((14, y - 4, 102, y + 84), radius=12, fill=(36, 40, 46, 220)); d.rounded_rectangle((18, y, 98, y + 80), radius=10, outline=wh, width=6)   # 圖示底下一塊深色（v2b：白色影印機前面看不見）
        if i == 0: d.rectangle((36, y + 18, 80, y + 62), outline=wh, width=5); d.line((44, y + 34, 72, y + 34), fill=wh, width=5); d.line((44, y + 48, 72, y + 48), fill=wh, width=5)
        elif i == 1: d.rectangle((32, y + 38, 84, y + 58), outline=wh, width=5); d.line((32, y + 30, 84, y + 30), fill=wh, width=6)
        elif i == 2:
            for (cx, cy, col) in ((40, y + 24, (220, 60, 60, 255)), (62, y + 24, (60, 160, 80, 255)), (40, y + 46, (50, 110, 200, 255)), (62, y + 46, (240, 200, 40, 255))): d.rectangle((cx, cy, cx + 18, cy + 18), fill=col)
        else:
            for k in range(3): d.line((32, y + 26 + k * 14, 84, y + 20 + k * 14), fill=wh, width=6)
        d.text((122, y + 4), t, font=f, fill=wh, stroke_width=6, stroke_fill=(36, 40, 46, 245))   # 深灰描邊：店裡亮的時候白字才看得到（第一版白字疊在店裡白牆上看不見）
    a = im.split()[3]; sh = Image.new('RGBA', im.size, (40, 44, 50, 0)); sh.putalpha(a.point(lambda v: min(255, v) * 0.55))   # 圖示也加一圈淡淡的陰影
    from PIL import ImageFilter
    sh = sh.filter(ImageFilter.GaussianBlur(2.2)); base = Image.new('RGBA', im.size, (255, 255, 255, 0)); base.alpha_composite(sh); base.alpha_composite(im)
    base.save(out); return fn


def glass_decal(xf, kind, x, y, w, z):
    """玻璃上的白字貼紙：左下角 (x − w/2, y)，寬 w（高照貼圖比例）；自己一個 alpha clip 材質"""
    k = 'decal_' + kind
    if k not in SK: SK[k] = _img_mat('wz_sf_decal_' + kind, _decal_tex(kind), rough=0.4, clip=True)
    h = w; uvquad(f'sk_decal_{kind}_{len(_inst)}', SK[k], [xf.p(x - w / 2, y, z), xf.p(x + w / 2, y, z), xf.p(x + w / 2, y + h, z), xf.p(x - w / 2, y + h, z)]); _inst.append(1)


def shopfront_v2(spec, xf, W, gt, wall):
    s = spec['shop']; sf = spec['sf']; R = sf.get('recess', 0.9); gz = -R
    iw = W - 0.6; ih = GH - 0.9; fr = frame_mat(sf.get('frame_col') or s.get('frame', '#3b2a1e')); top = ih + 0.4
    if sf.get('brick'): wall = acc(l118_brick())   # L118-SHOPS-REDO-1111 迪倫窯烤披薩：一樓的壁柱、門楣換成紅磚
    if sf.get('wall_col'): wall = acc(flat('l118_front_' + sf['wall_col'].lstrip('#'), sf['wall_col'], rough=0.92))   # 義大麵屋、奈良咖哩：一樓是粉刷牆（參考圖）
    # 店內景深卡（退到玻璃後 1.2 m）＋店內地板、兩側的牆
    if sf.get('real'):   # SHOP-REAL-INSIDE 溫州街（11-12）：玻璃後面是遊戲放的室內模型（Z3.shopInsideReal；real＝室內在這一棟本地座標的 x 範圍、深度）——不做簡化的淺店內。
        #   店面的玻璃比室內寬的那幾段（室內的側牆外面）在玻璃後面補一片實牆（fill 色），不然會看到室內模型外面的空洞
        _r = sf['real']; _fm = acc(flat('wz_real_fill_' + _r.get('fill', '#e9dcc4').lstrip('#'), _r.get('fill', '#e9dcc4'), rough=0.9))
        if _r['x0'] > -iw / 2 + 0.05: xf.box(_fm, -iw / 2, _r['x0'], 0.0, ih + 0.15, gz - 0.12, gz - 0.03)
        if _r['x1'] < iw / 2 - 0.05: xf.box(_fm, _r['x1'], iw / 2, 0.0, ih + 0.15, gz - 0.12, gz - 0.03)
    elif sf.get('inner'): shallow_interior(spec, xf, iw, gz, ih, bright=sf.get('bright', 0.62))   # 立體的淺店內（深 2.6 m）；bright＝店內亮度（WZ-SECOND-1104：常在洗衣、溫州書屋照參考圖調亮）
    else:
        face(f'INTERIOR_FACE_{spec["id"]}', M['board'], xf, [(-iw / 2, 0.15, gz - 1.2), (iw / 2, 0.15, gz - 1.2), (iw / 2, ih + 0.15, gz - 1.2), (-iw / 2, ih + 0.15, gz - 1.2)], {'interior': s['type']})
        xf.box(acc(M['gwall']), -iw / 2, iw / 2, 0, 0.15, gz - 1.3, gz)
        for sx in (-1, 1): xf.box(acc(M['plaster']), sx * iw / 2 - 0.03, sx * iw / 2 + 0.03, 0.15, ih + 0.15, gz - 1.2, gz - 0.012)   # 前端退到壁柱後面 1.2 cm（BUG-WZFLICKER-2：端面原本和壁柱正面同一個平面）
    # 門廊：地坪（這家的磁磚）＋門檻、兩側壁柱（外牆材質）、天花板、門楣（招牌底下那一段牆）
    xf.box(acc(SK[sf['floor']]), -W / 2 + 0.28, W / 2 - 0.28, 0.0, 0.03, gz, 0.0)
    st = sf.get('step', 0.0)
    if st > 0: xf.box(acc(SK[sf['floor']]), -iw / 2, iw / 2, 0.0, st, gz, gz + 0.3)
    if sf.get('woodfront'): wall = acc(SK['wood_dk'])   # WZ-FIVE-1104 小路（參考圖 wz_komichi_ext）：一樓整面深色木頭——壁柱、門楣都換成深色木板（原本是外牆的白色面磚）
    for sx in (-1, 1): xf.box(wall, sx * (W / 2 - 0.14) - 0.14, sx * (W / 2 - 0.14) + 0.14, 0, GH, gz, 0.0)
    xf.box(acc(M['ceilA']), -W / 2 + 0.28, W / 2 - 0.28, top - 0.04, top, gz, 0.0)
    xf.box(wall, -W / 2, W / 2, top, GH, -0.25, 0.0)
    if sf.get('woodfront'):
        bt = acc(SK['black'])
        for k in range(int(W / 0.24)): x = -W / 2 + 0.12 + k * 0.24; xf.box(wall, x - 0.012, x + 0.012, top + 0.02, GH - 0.02, 0.0, 0.012)   # 門楣的直條木板（一條一條的接縫）
        for sx in (-1, 1): xf.box(wall, sx * (W / 2 - 0.3) - 0.03, sx * (W / 2 - 0.3) + 0.03, 0.0, GH, 0.0, 0.03)                   # 壁柱外緣的木框
        xf.box(wall, -W / 2, W / 2, GH - 0.06, GH + 0.02, -0.02, 0.06); xf.box(bt, -W / 2, W / 2, 0.0, 0.12, -0.02, 0.02)     # 上緣壓條、下面的黑色踢腳
    lm = SK['lamp_cool'] if sf.get('light') == 'cool' else SK['lamp']
    for lx in ([0.0] if W < 7 else [-W / 4, W / 4]):
        q = xf.p(lx, top - 0.06, gz / 2); acc(lm).sphere(q, 0.07, seg=8, rings=4)
        CL.glow(root, 'shoplamp', q[0], q[1] - 0.05, q[2], color='rgba(240,248,255,1)' if sf.get('light') == 'cool' else 'rgba(255,214,150,1)', size=1.3, day=0.0, night=0.9)
    _door_glass(spec, xf, sf, iw, ih, gz, fr, top)
    # 招牌：有使用者核可設計稿的店用貼圖（sign_atlas.py），沒有的照舊由遊戲畫字（SIGN_FACE）
    sw = min(W - 0.4, sf.get('sign_w', 6.5)); key = SIGNMAP.get(spec['id']) or (('l118_' + spec['lane118']) if spec.get('lane118') else None); sy1t = None
    if key and key + '_h' in SIGN_ATLAS:
        if 'm' in SIGN_ATLAS[key + '_h']: sw = min(W - 0.4, SIGN_ATLAS[key + '_h']['m'])   # 118 巷：招牌在街上的寬度寫在貼圖集裡（l118_signs_tex.py）
        sy1t = hsign(xf, spec['id'], key + '_h', 0.0, sw, GH - 0.45, lamps=sf.get('lamps'), lampcol=sf.get('lampcol', 'goose_dark'))
        if key + '_v' in SIGN_ATLAS and not sf.get('no_v'): vsign_tex(xf, spec['id'], key + '_v', sf.get('v_x', W / 2 - 0.5), sf.get('v_y', max(GH + 0.45, sy1t + 0.14) if spec.get('lane118') else GH + 0.45), vw=sf.get('v_w', 0.62))
    else:
        sy0, sy1 = GH - 0.7, GH - 0.06; ss = sf.get('sign', 'lightbox')
        if ss == 'lightbox':
            xf.box(acc(SK['alu2']), -sw / 2 - 0.06, sw / 2 + 0.06, sy0 - 0.06, sy1 + 0.06, 0.0, 0.26); zf = 0.265
        elif ss == 'wood':
            w = acc(SK['wood_dk']); xf.box(w, -sw / 2 - 0.1, sw / 2 + 0.1, sy0 - 0.1, sy1 + 0.1, 0.0, 0.12); zf = 0.125
            for sx in (-1, 1): xf.box(acc(SK['black']), sx * (sw / 2 - 0.3) - 0.02, sx * (sw / 2 - 0.3) + 0.02, sy1 + 0.1, sy1 + 0.45, 0.02, 0.06)
        else:
            xf.box(acc(fr), -sw / 2 - 0.03, sw / 2 + 0.03, sy0 - 0.03, sy1 + 0.03, 0.0, 0.05); zf = 0.055
        face(f'SIGN_FACE_{spec["id"]}', M['board'], xf, [(-sw / 2, sy0, zf), (sw / 2, sy0, zf), (sw / 2, sy1, zf), (-sw / 2, sy1, zf)],
             {'sign': s['name'], 'sub': s.get('sub', ''), 'bg': s.get('signBg', '#3b2a1e'), 'color': s.get('signColor', '#f4ead8'), 'serif': 1 if s.get('serif') else 0, 'band': s.get('band', '')})
        if ss == 'lightbox': CL.glow(root, 'signbox', *xf.p(0, (sy0 + sy1) / 2, 0.5), color='rgba(255,250,235,1)', size=2.2, day=0.0, night=0.55)
        if s.get('vertical'):
            vsign(xf, spec['id'], W / 2 - 0.5, GH + 0.3, GH + 2.9, {'vertical': s['vertical'], 'vBg': s.get('vBg', '#ffffff'), 'vColor': s.get('vColor', '#b0332a'), 'vBand': s.get('vBand', '#b0332a'), 'serif': 1 if s.get('serif') else 0})
    # 雨棚
    aw_ = sf.get('awning'); aw = W - 0.5
    if aw_ and aw_.startswith('stripe'):
        m = acc(SK[aw_]); ay0, ay1, ad = top + 0.0, top - 0.45, 1.0
        xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1]); xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)])
        xf.box(m, -aw / 2, aw / 2, ay1 - 0.24, ay1, ad - 0.01, ad + 0.01)
        for sx in (-1, 1): xf.cyl(acc(M['metal']), (sx * aw / 2, ay0, 0.02), (sx * aw / 2, ay1 + 0.02, ad), 0.015, seg=5)
    elif aw_ == 'metal':                                                                                              # 鐵皮雨遮（浪板＋三角鐵架）
        m = acc(SK['corr']); ay0, ay1, ad = (sy1t + 0.25, sy1t - 0.02, 0.85) if sy1t else (GH + 0.25, GH - 0.05, 0.85)   # 有大招牌時雨遮在招牌上面
        xf.quad(m, [(-aw / 2, ay0, 0.0), (aw / 2, ay0, 0.0), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)]); xf.quad(m, [(-aw / 2, ay0, 0.0), (aw / 2, ay0, 0.0), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1])
        for x in (-aw / 2 + 0.2, 0.0, aw / 2 - 0.2): xf.cyl(acc(SK['black']), (x, ay0 - 0.5, 0.0), (x, ay1 - 0.02, ad - 0.05), 0.012, seg=5)
    elif aw_ and aw_.startswith('#'):
        m = acc(SK['wood_dk'] if sf.get('woodfront') else awning_mat(aw_)); ay0, ay1, ad = top, top - 0.4, 0.9   # 小路：木板的雨遮（參考圖是深色木頭的小屋簷，原本的帆布從下面看是淺色）
        xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1]); xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)])
        xf.box(m, -aw / 2, aw / 2, ay1 - 0.2, ay1, ad - 0.01, ad + 0.01)
        if sf.get('ivy'):   # WZ-FIVE-1104 小路：雨遮上垂下來的常春藤（參考圖：左右兩段、中間門口那一段少）；葉片卡、不投影（cafe_leaf_ 開頭）
            iv = acc(base['ivy']); rr = random.Random(sum(ord(c) * (i + 5) for i, c in enumerate(spec['id'])) % 991)   # 固定的雜湊（同上）
            for (xa, xb, n_) in sf['ivy']:
                for k in range(n_):
                    for j in range(2):   # 一條藤蔓兩張窄卡交叉（原本一張寬卡，渲染出來像一塊塊綠色方旗）
                        x = xa + (xb - xa) * (k + rr.random()) / n_; hh = rr.uniform(0.3, 1.0) * (0.7 if j else 1.0); q = xf.p(x, ay1 - 0.2 - hh / 2 + 0.05, ad + 0.02 + rr.uniform(0, 0.08))
                        CL.card(iv, q[0], q[1], q[2], rr.uniform(0.14, 0.22), hh, ry=xf.ry + (0.7 if j else -0.7) + rr.uniform(-0.3, 0.3), rx=rr.uniform(-0.12, 0.12), uv=CL.rand_uv(0.35))
                for k in range(n_ * 2):                                                                                # 雨遮頂上爬的一叢叢
                    x = xa + (xb - xa) * rr.random(); q = xf.p(x, ay0 - (ay0 - ay1) * 0.6 + 0.08, 0.3 + rr.uniform(0, 0.5))
                    CL.card(iv, q[0], q[1], q[2], rr.uniform(0.3, 0.45), rr.uniform(0.22, 0.32), ry=xf.ry + rr.uniform(-0.6, 0.6), rx=-1.0 + rr.uniform(-0.3, 0.3), uv=CL.rand_uv(0.5))
    # 玻璃上的紙條、門邊的牌子
    if sf.get('lantern'):   # WZ-FIVE-1104：紅燈籠（小路參考圖：門右邊掛一顆，上下黑色蓋子、鐵勾掛在門楣）
        lx, ly = sf['lantern']; lz = gz + 0.34
        for k, (yy, rr) in enumerate(((ly - 0.16, 0.15), (ly, 0.2), (ly + 0.16, 0.15))): acc(SK['lamp_red']).sphere(xf.p(lx, yy, lz), rr, seg=12, rings=6)
        for yy in (ly - 0.3, ly + 0.27): xf.cyl(acc(SK['black']), (lx, yy, lz), (lx, yy + 0.05, lz), 0.11, seg=10)
        xf.box(acc(SK['black']), lx - 0.01, lx + 0.01, ly + 0.32, ih + 0.15, lz - 0.01, lz + 0.01)
        q = xf.p(lx, ly, lz + 0.25); CL.glow(root, 'lantern', q[0], q[1], q[2], color='rgba(255,120,80,1)', size=1.1, day=0.0, night=0.8)
    if sf.get('pier_r') is not None:   # WZ-FIVE-1104 阿德：玻璃右邊一段白磁磚壁面（參考圖：軟木公告板、價目表、一盞壁燈掛在這裡）
        px0 = sf['pier_r']; xf.box(wall, px0, iw / 2 + 0.02, 0.0, ih + 0.18, gz - 0.06, gz + 0.02); sconce(xf, (px0 + iw / 2) / 2 + 0.05, 2.12, gz + 0.02)
    if sf.get('decal'): glass_decal(xf, *sf['decal'], gz + 0.016)
    if sf.get('ivy_hang'):   # ADE-V2-1104：二樓窗台垂下來的常春藤（參考圖 wz_ade_ext 左上）：一條兩張窄葉片卡交叉，長短不一
        iv = acc(base['ivy']); rr_ = random.Random(sum(ord(c) for c in spec['id']) * 13)
        for (xa, xb, n_) in sf['ivy_hang']:
            for k in range(n_):
                x = xa + (xb - xa) * (k + rr_.random()) / n_; hh = rr_.uniform(0.6, 1.5)
                for j in range(2):
                    q = xf.p(x, GH + 0.55 - hh / 2, 0.14 + rr_.uniform(0, 0.1)); CL.card(iv, q[0], q[1], q[2], rr_.uniform(0.16, 0.26), hh * (0.75 if j else 1.0), ry=xf.ry + (0.7 if j else -0.7) + rr_.uniform(-0.3, 0.3), rx=rr_.uniform(-0.1, 0.1), uv=CL.rand_uv(0.35))
            for k in range(n_):
                x = xa + (xb - xa) * rr_.random(); q = xf.p(x, GH + 0.62, 0.16 + rr_.uniform(0, 0.2)); CL.card(iv, q[0], q[1], q[2], rr_.uniform(0.3, 0.45), rr_.uniform(0.22, 0.32), ry=xf.ry + rr_.uniform(-0.6, 0.6), rx=-1.0 + rr_.uniform(-0.3, 0.3), uv=CL.rand_uv(0.5))
    for (cn, x, y, w, h) in sf.get('notes', []): note(xf, cn, x, y, w, h, gz + 0.03)
    if sf.get('wains'):   # 窗下的一段矮牆（迪倫：紅磚到窗台；參考圖）：(x0, x1, 高)
        _w0, _w1, _wh = sf['wains']; xf.box(wall, _w0, _w1, 0.0, _wh, gz - 0.06, gz + 0.05); xf.box(acc(SK['black']), _w0, _w1, _wh, _wh + 0.05, gz - 0.08, gz + 0.09)
    if sf.get('case'):   # 水上便當：腰牆上的不鏽鋼檯面＋玻璃保溫櫃（上層炸雞腿、雞排，下層配菜；參考圖），左邊一疊便當盒
        _c0, _c1 = sf['case']; _h = sf['wains'][2]; _st = acc(SK['steel']); xf.box(_st, sf['wains'][0], sf['wains'][1], _h, _h + 0.04, gz - 0.5, gz + 0.12)
        for _y in (_h + 0.04, _h + 0.34): xf.box(_st, _c0 + 0.5, _c1, _y, _y + 0.02, gz - 0.42, gz + 0.02)
        for _j in range(int((_c1 - _c0 - 0.6) / 0.42)):
            for _r, _cols in enumerate((('#4e8a2e', '#f0d870', '#e8842a', '#f6e8a0', '#6a4a2e'), ('#c8842a', '#d09438', '#b8741e', '#c8842a', '#d09438'))):
                _x = _c0 + 0.62 + _j * 0.42; xf.box(acc(flat('l118_food_' + _cols[_j % 5].lstrip('#'), _cols[_j % 5], rough=0.6)), _x, _x + 0.34, _h + 0.06 + _r * 0.3, _h + 0.13 + _r * 0.3, gz - 0.36, gz - 0.04)
        xf.box(acc(M['glass']), _c0 + 0.5, _c1, _h + 0.04, _h + 0.66, gz + 0.02, gz + 0.03); xf.box(_st, _c0 + 0.5, _c1, _h + 0.66, _h + 0.69, gz - 0.44, gz + 0.04)
        for _k in range(7): xf.box(acc(flat('l118_bento_box', '#f6f4ee', rough=0.7)), _c0, _c0 + 0.36, _h + 0.04 + _k * 0.05, _h + 0.085 + _k * 0.05, gz - 0.34, gz - 0.04)
    for _i, _ph in enumerate(sf.get('photos', [])):   # L118-SHOPS-REDO-1111：貼在玻璃上的餐點照片、門邊的菜單板（貼圖集的鍵、中心 x、下緣 y、寬；第五個＝離玻璃多遠）
        sign_tex(xf, _ph[0], _ph[1], _ph[2], _ph[3], gz + (_ph[4] if len(_ph) > 4 else 0.024), f'sk_photo_{spec["id"]}_{_i}')
    if sf.get('board'): cork_board(xf, *sf['board'], gz + 0.03)
    for sx in sf.get('sconce', []): sconce(xf, sx, 2.15, 0.0)   # WZ-SECOND-1104 常在洗衣
    # 門廊雜物（都在 z∈(gz, 0)：建築的導航阻擋範圍內）
    for it in sf.get('clutter', []):
        k, x, z = it[0], it[1], it[2]; zz = gz + z
        if k == 'aboard': aboard(xf, x, zz, it[3] if len(it) > 3 else 'chalk')
        elif k == 'mat': xf.box(acc(flat('l118_doormat_' + it[3].lstrip('#'), it[3], rough=0.95)), x - 0.8, x + 0.8, 0.03, 0.045, zz - 0.3, zz + 0.3)   # 門口的地墊（118牛排：紅色；參考圖）
        elif k == 'pot': _pm = _pot_pick(it, x); _w = _wp(xf, x, zz); B.instance(_pm, f'skpot_{spec["id"]}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], x * 1.7)
        elif k == 'ph_pot': _pm = ph_proto('pot'); _w = _wp(xf, x, zz); B.instance(_pm, f'skphpot_{spec["id"]}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skphpot', _w[0], _w[2], x * 1.7)   # Poly Haven 的盆栽（OPEN-SRC-2D3D-1104）
        elif k == 'ph_succ': _pm = ph_proto('succ'); _w = _wp(xf, x, zz); ob_ = B.instance(_pm, f'skphsucc_{spec["id"]}_{len(_inst)}', *_w, root, ry=x * 2.3); ob_.scale = (1.5, 1.5, 1.5); _inst.append(1); prop_fp(_pm, 'skphsucc', _w[0], _w[2], x * 2.3, 1.5)   # Poly Haven 白盆多肉（放大 1.5 倍，ADE-V2-1104）
        elif k == 'planter_c':   # 水泥花箱（ADE-V2-1104，參考圖轉角那一個）：箱子＋裡面兩叢 Poly Haven 合果芋（縮小、轉不同角度）
            pc = acc(flat('wz_sf_planter_concrete', '#a9a7a1', rough=0.92)); xf.box(pc, x - 0.5, x + 0.5, 0.0, 0.44, zz - 0.2, zz + 0.2); xf.box(acc(flat('wz_sf_soil', '#4a3a2c', rough=1.0)), x - 0.46, x + 0.46, 0.42, 0.43, zz - 0.16, zz + 0.16)
            for j, (dx_, pm_) in enumerate(((-0.27, POT_BROAD), (0.05, POT_FERN[0]), (0.3, POT_BROAD))):   # 花箱裡三叢（大葉、蕨類、大葉；共用的 instancing 原型，不多三角形。11-04 第一次試用兩份合果芋：沒有 instancing，多 5,900 面）
                _w = _wp(xf, x + dx_, zz); B.instance(pm_, f'skplanter_{spec["id"]}_{len(_inst)}', _w[0], 0.13, _w[2], root, ry=x * 3.1 + j * 2.1); _inst.append(1)
            a_, b_ = xf.p(x - 0.5, 0, zz - 0.2), xf.p(x + 0.5, 0, zz + 0.2)   # 花箱的腳印（導航、street_props_nav_unit）
            PROP_FP.append(dict(tag='planter_c', rect=[round(min(a_[0], b_[0]), 3), round(min(a_[2], b_[2]), 3), round(max(a_[0], b_[0]), 3), round(max(a_[2], b_[2]), 3)], h=0.44))
        else:
            inst(PROTO[k], f'sk_{k}_{spec["id"]}', xf, x, 0.0, zz)
            for (cn, cx_, cy_, cz_, cw_) in FRUIT_CARDS.get(k, []):   # WZ-SECOND-1104：參考圖裁的手寫價錢牌（插在箱子前緣、往後仰一點）
                note_tilt([xf.p(x + cx_ - cw_ / 2, cy_, zz + cz_), xf.p(x + cx_ + cw_ / 2, cy_, zz + cz_), xf.p(x + cx_ + cw_ / 2, cy_ + cw_ * 1.05, zz + cz_ - 0.04), xf.p(x + cx_ - cw_ / 2, cy_ + cw_ * 1.05, zz + cz_ - 0.04)], cn)
    # 設備：一樓冷氣（門楣旁）、電錶箱、排油煙管
    if sf.get('ac'): ax = sf['ac']; inst(ph_proto('ac') if sf.get('ac_ph') else AC, f'skac_{spec["id"]}', xf, ax, GH - (1.05 if sf.get('ac_ph') else 0.95), 0.0)   # ac_ph：Poly Haven 的冷氣室外機（CC0 實景掃描）
    if sf.get('meter') is not None: inst(PROTO['meter'], f'skmeter_{spec["id"]}', xf, sf['meter'], 1.5, 0.0)
    if sf.get('duct') is not None:
        dxp = sf['duct']; xf.cyl(acc(SK['steel']), (dxp, GH - 0.4, 0.18), (dxp, GH + 3 * FH, 0.18), 0.11, seg=10)
        xf.cyl(acc(SK['steel']), (dxp, GH - 0.4, 0.18), (dxp, GH - 0.4, -0.3), 0.11, seg=10)


def _wp(xf, x, z):
    p = xf.p(x, 0, z); return p[0], 0.0, p[2]


def housefront_v2(spec, xf, W, rng, rec):
    """住家一樓的公寓大門（取代 housedoor 的平板鐵門）：台北老公寓常見的樣子——
    石材門框＋兩階台階、對開的鍛造鐵門（下半實心、上半鐵條＋暗玻璃）、門上的鐵條氣窗、混凝土小雨遮、門燈、
    藍底白字門牌（PLATE_FACE，遊戲畫字）、對講機（一排按鈕）、各樓層的信箱、旁邊的鋁窗（一半有鐵窗）；最後是門口的雜物與紙條。"""
    sf = spec['sf']; z = -rec; dx = sf.get('door_x', -W * 0.2); dw = sf.get('door_w', 1.3); dh = 2.25; th = 0.42      # 門洞寬、門高、氣窗高
    dc = acc(door_mat(spec.get('door', '#9c2f2a'))); st = acc(SK['steel']); dk = acc(M['ac_dark']); stone = acc(SK['f_granite'])
    x0, x1 = dx - dw / 2, dx + dw / 2; top = dh + th
    season_door(spec, xf, x0, x1, top, z, 'house')   # 季節布置用（只記錄）
    # 門框（石材，凸出牆面 6 cm）＋兩階台階
    # 一樓的牆是實心的：門、門框都貼在牆面前面（門框凸出 14 cm，門片退在門框裡 7 cm）
    for (a0, a1) in ((x0 - 0.2, x0), (x1, x1 + 0.2)): xf.box(stone, a0, a1, 0.0, top + 0.2, z, z + 0.14)
    xf.box(stone, x0 - 0.2, x1 + 0.2, top, top + 0.22, z, z + 0.14)
    xf.box(stone, x0 - 0.3, x1 + 0.3, 0.0, 0.08, z, z + 0.62); xf.box(stone, x0 - 0.2, x1 + 0.2, 0.08, 0.16, z, z + 0.32)
    zd = z + 0.03; opened = bool(sf.get('stair_open'))
    if not opened:
        xf.box(dk, x0, x1, 0.16, top, z, z + 0.006)                                             # 門後的暗處（玻璃後面看到的樓梯間）
        xf.quad(acc(M['win_glass']), [(x0, dh * 0.5, z + 0.012), (x1, dh * 0.5, z + 0.012), (x1, top, z + 0.012), (x0, top, z + 0.012)])
    else: mok_stair_entry(spec, xf, x0, x1, z, dc)                                              # 木曜日（B4）：鐵門開著，看得到往上的樓梯（ART-MOKUYOBI-1103）
    # 對開的門片：外框、下半實心板（兩塊凸起的菱形框）、上半鐵條
    lw = dw / 2
    for k in ((0, 1) if not opened else ()):
        l0 = x0 + k * lw; l1 = l0 + lw; cx = (l0 + l1) / 2
        for (a0, a1) in ((l0, l0 + 0.05), (l1 - 0.05, l1)): xf.box(dc, a0, a1, 0.16, dh, zd, zd + 0.04)
        xf.box(dc, l0, l1, dh - 0.05, dh, zd, zd + 0.04); xf.box(dc, l0, l1, 0.16, 1.12, zd, zd + 0.03)
        for (yy, hh) in ((0.32, 0.3), (0.72, 0.3)):                                             # 下半部的凸起方框
            xf.box(dc, cx - lw * 0.32, cx + lw * 0.32, yy, yy + hh, zd + 0.03, zd + 0.045)
        xf.box(dc, l0, l1, 1.12, 1.17, zd, zd + 0.04); xf.box(dc, l0, l1, 1.66, 1.7, zd, zd + 0.035)
        n = 5
        for i in range(1, n): bx = l0 + i * lw / n; xf.box(dc, bx - 0.011, bx + 0.011, 1.17, dh - 0.05, zd + 0.01, zd + 0.03)
        for (yy, r_) in ((1.42, 0.09),):                                                         # 上半部中間的圓形花樣
            for i in range(10):
                a_ = i / 10 * 2 * math.pi; b_ = (i + 1) / 10 * 2 * math.pi
                xf.cyl(dc, (cx + math.cos(a_) * r_, yy + math.sin(a_) * r_, zd + 0.02), (cx + math.cos(b_) * r_, yy + math.sin(b_) * r_, zd + 0.02), 0.009, seg=4)
    xf.box(acc(M['brass']), dx - 0.1, dx - 0.07, 0.95, 1.08, zd + 0.04, zd + 0.08); xf.box(acc(M['brass']), dx + 0.07, dx + 0.1, 0.95, 1.08, zd + 0.04, zd + 0.08)
    xf.box(dk, dx - 0.06, dx + 0.06, 1.1, 1.18, zd + 0.04, zd + 0.06)                            # 鎖頭
    # 氣窗：門上的鐵條
    xf.box(dc, x0, x1, dh, dh + 0.04, zd, zd + 0.04)
    for i in range(1, 9): bx = x0 + i * dw / 9; xf.box(dc, bx - 0.01, bx + 0.01, dh + 0.04, top, zd + 0.01, zd + 0.03)
    # 小雨遮（混凝土板＋磁磚收邊）
    xf.box(acc(M['gwall']), x0 - 0.45, x1 + 0.45, top + 0.24, top + 0.34, z, z + 0.7)
    xf.box(acc(M['gwall']), x0 - 0.45, x1 + 0.45, top + 0.17, top + 0.24, z + 0.62, z + 0.7)
    q = xf.p(x0 - 0.05, top + 0.1, z + 0.12); acc(M['bulb']).sphere(q, 0.07, seg=8, rings=4)   # 門燈
    CL.glow(root, 'doorlamp', q[0], q[1] - 0.05, q[2], color='rgba(255,214,150,1)', size=1.0, day=0.0, night=0.85)
    # 門牌（藍底白字）、對講機、信箱
    side = 1 if dx < 0 else -1; ex = x1 + 0.38 if side > 0 else x0 - 0.38
    pn = sf.get('number', '')
    if pn:
        face(f'PLATE_FACE_door_{spec["id"]}', M['board'], xf, [(ex - 0.17, 1.95, z + 0.02), (ex + 0.17, 1.95, z + 0.02), (ex + 0.17, 2.13, z + 0.02), (ex - 0.17, 2.13, z + 0.02)],
             {'plate': 'door', 'text': '溫州街', 'sub': pn, 'bg': '#1f4f9c', 'color': '#ffffff'})
    xf.box(st, ex - 0.1, ex + 0.1, 1.25, 1.6, z, z + 0.04)                                      # 對講機面板
    for i in range(sf.get('floors_bell', spec.get('floors', 4))):
        xf.box(dk, ex - 0.06, ex + 0.06, 1.29 + i * 0.055, 1.32 + i * 0.055, z + 0.04, z + 0.05)
    xf.box(dk, ex - 0.05, ex + 0.05, 1.5, 1.57, z + 0.04, z + 0.05)                            # 喇叭孔
    mx = ex + side * 0.55; nf = spec.get('floors', 4)
    for i in range(nf):                                                                          # 信箱：每一層一格（兩排）
        col, row = i % 2, i // 2; bx0 = mx + side * col * 0.34; by = 1.0 + row * 0.3
        xf.box(acc(M['mailbox']), min(bx0, bx0 + side * 0.32), max(bx0, bx0 + side * 0.32), by, by + 0.28, z, z + 0.16)
        xf.box(dk, min(bx0, bx0 + side * 0.32) + 0.05, max(bx0, bx0 + side * 0.32) - 0.05, by + 0.2, by + 0.22, z + 0.16, z + 0.165)   # 投信口
    # 旁邊的鋁窗（一半有鐵窗）
    if W > 4.5:
        wx = sf.get('win_x', side * (W / 2 - 1.3)); al = acc(M['alu'])                          # 窗在信箱那一側的最外面
        if abs(wx - dx) > dw / 2 + 1.3 and abs(wx - mx) > 1.4:
            xf.box(al, wx - 1.0, wx + 1.0, 1.0, 1.06, z - 0.05, z + 0.05); xf.box(al, wx - 1.0, wx + 1.0, 2.14, 2.2, z - 0.05, z + 0.05)
            for xx in (wx - 1.0, wx - 0.03, wx + 0.94): xf.box(al, xx, xx + 0.06, 1.0, 2.2, z - 0.05, z + 0.05)
            # 玻璃原本直接貼在牆面上（同一個平面，從外面看牆的磁磚在玻璃裡閃，BUG-WZFLICKER）：玻璃後面一層拉上的窗簾（離牆 6 mm）、玻璃再往前 8 mm
            xf.quad(acc(M['curtain']), [(wx - 0.97, 1.06, z + 0.006), (wx + 0.97, 1.06, z + 0.006), (wx + 0.97, 2.14, z + 0.006), (wx - 0.97, 2.14, z + 0.006)])
            xf.quad(acc(M['win_glass']), [(wx - 0.97, 1.06, z + 0.014), (wx + 0.97, 1.06, z + 0.014), (wx + 0.97, 2.14, z + 0.014), (wx - 0.97, 2.14, z + 0.014)])
            if rng.random() < 0.6: inst(GRILLE, f'dgrille_{spec["id"]}', xf, wx, 0.95, z)
    if sf.get('decal'):                                                                          # 二樓中間那扇窗的割字貼紙（課輔班）
        it = SIGN_ATLAS[sf['decal']]; n_ = max(1, round(W / 3.6)); cxw = -W / 2 + (n_ // 2 + 0.5) * W / n_; ww_ = min(2.2, W / n_ - 0.9) - 0.1; yw0 = GH + (sf.get('decal_f', 1) - 1) * FH + FH * 0.52 - 0.75 + 0.18   # decal_f：貼在第幾層的窗（B4 的課輔班 11-03 起在三樓）
        sign_tex(xf, sf['decal'], cxw, yw0, ww_, -0.124, f'sk_decal_{spec["id"]}')   # 貼在玻璃前面 6 mm（BUG-WZFLICKER-2：原本和窗玻璃同一個平面）
    if sf.get('banner'):                                                                         # 樓梯口旁邊掛的帆布布條
        it = SIGN_ATLAS[sf['banner'][0]]; bx_ = sf['banner'][1]; bw_ = 0.5; bh_ = bw_ / it['aspect']
        xf.cyl(acc(SK['wood_dk']), (bx_ - 0.3, 0.95 + bh_ + 0.03, z + 0.05), (bx_ + 0.3, 0.95 + bh_ + 0.03, z + 0.05), 0.012, seg=6)
        sign_tex(xf, sf['banner'][0], bx_, 0.95, bw_, z + 0.04, f'sk_banner_{spec["id"]}')
    for (cn, x, y, w, h) in sf.get('notes', []): note(xf, cn, x, y, w, h, z + 0.06)
    for it in sf.get('clutter', []):
        k, x, zc = it[0], it[1], it[2]; zz = z + zc
        if k == 'pot': _pm = _pot_pick(it, x); _w = _wp(xf, x, zz); B.instance(_pm, f'skpot_{spec["id"]}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], x * 1.7)
        elif k == 'aboard': aboard(xf, x, zz, it[3] if len(it) > 3 else 'chalk')
        else: inst(PROTO[k], f'sk_{k}_{spec["id"]}', xf, x, 0.0, zz)
    if sf.get('meter') is not None: inst(PROTO['meter'], f'skmeter_{spec["id"]}', xf, sf['meter'], 1.5, z)


def mok_stair_entry(spec, xf, x0, x1, z, dc):
    """木曜日（B4，ART-MOKUYOBI-1103）：打開的深綠鐵門後面往上的窄樓梯（從巷子看得到；真正走的樓梯在 wz_mokuyobi 區域，tools/blender/env_second/mokuyobi_stair.py）。
    本地 z＝牆面（−rec），往 −z 是屋裡；踏階和區域一樣 0.2 m×0.294 m，第一階在門檻後 0.3 m。兩側是奶油色牆＋淡綠腰牆（斜線）、天花一盞吊燈，最裡面是暗的。"""
    dep = spec['sf']['stair_open']['depth']; R_, T_, n_ = 0.2, 0.294, 16; zb = z - 0.3
    cream, dado, step = acc(frame_mat('#e2d4b6')), acc(frame_mat('#9bb39a')), acc(SK['f_terrazzo'])
    xf.box(step, x0, x1, -0.02, 0.16, zb, z + 0.02)                                              # 門檻後面那一小段地（和門口的台階同高）
    for k in range(1, n_):
        za_, zb_ = zb - k * T_, zb - (k - 1) * T_
        if za_ < z - dep + 0.05: break
        xf.box(step, x0, x1, 0.0, 0.16 + k * R_, max(za_, z - dep), zb_)
    yd = lambda zz: min(GH - 0.05, 1.0 + 0.16 + R_ * max(0.0, (zb - zz) / T_))                 # 腰牆上緣：跟著樓梯斜上去
    for (xx, sgn) in ((x0 + 0.005, 1), (x1 - 0.005, -1)):
        for (za_, zb_) in ((z, zb), (zb, z - dep)):
            for (m_, ya, yb, yc, ydd) in ((dado, 0.0, 0.0, yd(za_), yd(zb_)), (cream, yd(za_), yd(zb_), GH - 0.05, GH - 0.05)):
                pts = [(xx, ya, za_), (xx, yb, zb_), (xx, (ydd if m_ is dado else GH - 0.05), zb_), (xx, (yc if m_ is dado else GH - 0.05), za_)]
                xf.quad(m_, pts if sgn < 0 else pts[::-1])
    xf.quad(acc(M['ac_dark']), [(x0, 0.0, z - dep + 0.01), (x1, 0.0, z - dep + 0.01), (x1, GH - 0.05, z - dep + 0.01), (x0, GH - 0.05, z - dep + 0.01)])   # 最裡面（暗）
    xf.quad(cream, [(x0, GH - 0.06, z), (x1, GH - 0.06, z), (x1, GH - 0.06, z - dep), (x0, GH - 0.06, z - dep)])   # 天花
    q = xf.p((x0 + x1) / 2, 2.75, zb - 0.9); acc(M['bulb']).sphere(q, 0.09, seg=10, rings=5)   # 吊燈
    CL.glow(root, 'mok_stairlamp', q[0], q[1] - 0.05, q[2], color='rgba(255,214,150,1)', size=0.9, day=0.25, night=0.9)
    # 兩扇鐵門往裡開、貼著兩側的牆（外框＋下半實心＋上半鐵條；和關著的門同一種樣子）
    lw = (x1 - x0) / 2
    for (xa, xb) in ((x0 + 0.01, x0 + 0.045), (x1 - 0.045, x1 - 0.01)):
        xf.box(dc, xa, xb, 0.16, 1.12, z - lw, z - 0.02); xf.box(dc, xa, xb, 1.12, 1.17, z - lw, z - 0.02); xf.box(dc, xa, xb, 2.2, 2.25, z - lw, z - 0.02)
        for (za_, zb_) in ((z - lw, z - lw + 0.05), (z - 0.07, z - 0.02)): xf.box(dc, xa, xb, 0.16, 2.25, za_, zb_)
        for i in range(1, 5): zc_ = z - 0.02 - i * (lw - 0.02) / 5; xf.box(dc, xa, xb, 1.17, 2.2, zc_ - 0.011, zc_ + 0.011)
    # 門左上的木招牌（字在遊戲裡畫：PLATE_FACE＋serif）＋門燈
    ms = spec['sf'].get('mok_sign')
    if ms:
        wd = acc(frame_mat('#5e3e29')); sx0, sx1 = ms['x'] - ms['w'] / 2, ms['x'] + ms['w'] / 2
        xf.box(wd, sx0 - 0.03, sx1 + 0.03, ms['y0'] - 0.03, ms['y1'] + 0.03, z, z + 0.05)
        face(f'PLATE_FACE_mok_{spec["id"]}', M['board'], xf, [(sx0, ms['y0'], z + 0.052), (sx1, ms['y0'], z + 0.052), (sx1, ms['y1'], z + 0.052), (sx0, ms['y1'], z + 0.052)],
             {'plate': 'sign', 'text': '木曜日', 'bg': '#5e3e29', 'color': '#f1e3c4', 'serif': True, 'fs': 0.62})
        lx = ms['x']; xf.cyl(acc(M['grille']), (lx, ms['y1'] + 0.08, z), (lx, ms['y1'] + 0.2, z + 0.25), 0.012, seg=6)
        q = xf.p(lx, ms['y1'] + 0.17, z + 0.27); acc(M['bulb']).sphere(q, 0.06, seg=8, rings=4)
        CL.glow(root, 'mok_signlamp', q[0], q[1] - 0.04, q[2], color='rgba(255,214,150,1)', size=0.8, day=0.0, night=0.85)


def mok_window(spec, xf, w):
    """木曜日二樓的整排木框窗（一格 0.9 m、上面一排小氣窗）：玻璃後面是亮著暖光的店（room_lit，晚上發光）＋奶油白紗簾（兩端、中間各一組）。
    牆的洞由 apartment() 照 w['w'] 留好；窗退在牆面裡 12 cm。"""
    x0, x1, y0, y1 = w['x'] - w['w'] / 2, w['x'] + w['w'] / 2, w['y0'], w['y1']; wd = acc(frame_mat('#5e3e29'))
    xf.box(acc(M['room_lit']), x0, x1, y0, y1, -0.9, -0.88)                                     # 店裡（遠一點的暖色面）
    for (a, b) in ((x0, x0 + 0.7), (x1 - 0.7, x1), (w['x'] - 0.25, w['x'] + 0.25)):
        xf.quad(acc(M['curtain_lit']), [(a, y0 + 0.05, -0.2), (b, y0 + 0.05, -0.2), (b, y1 - 0.05, -0.2), (a, y1 - 0.05, -0.2)])
    xf.quad(acc(M['glass_lit']), [(x0, y0, -0.13), (x1, y0, -0.13), (x1, y1, -0.13), (x0, y1, -0.13)])
    for (a, b) in ((x0, x0 + 0.07), (x1 - 0.07, x1)): xf.box(wd, a, b, y0, y1, -0.16, -0.1)
    for (c, d) in ((y0, y0 + 0.07), (y1 - 0.07, y1), (y1 - 0.5, y1 - 0.45)): xf.box(wd, x0, x1, c, d, -0.16, -0.1)
    n = max(1, round((x1 - x0) / 0.9))
    for i in range(1, n): xx = x0 + i * (x1 - x0) / n; xf.box(wd, xx - 0.025, xx + 0.025, y0, y1, -0.15, -0.11)
    xf.box(acc(M['band']), x0 - 0.06, x1 + 0.06, y0 - 0.06, y0, -0.25, 0.06)                   # 窗台


# ======================================================================== 新生南路七家店（ART-XINSHENG-FRONTS-1104，LAWWW2）
# 參考圖就是規格（SCENE_RULES 第 12 節）：招牌、玻璃後面看到的店內、二樓窗後面，都是從使用者的參考圖直接裁出來校正透視（xs_front_tex.py → xs_fronts_atlas.jpg，整條街一個材質）；
# 框、玻璃、招牌板、騎樓柱子、天花板、店內的地板／兩側牆／天花燈是 3D。店內景深卡在玻璃後 0.8 m（看斜一點看得到兩側的牆，不是貼在玻璃上的一張照片）。
_XSA = {'xinsheng': 'xs_fronts_atlas', 'wenzhou': 'wz_fronts_atlas', 'gongguan': 'gg_fronts_atlas', 'tingzhou': 'tz_fronts_atlas'}.get(SET)   # 溫州街（日常失速，WZ-OFFBEAT-1104）用自己的小圖集：兩條街不同 GLB，各帶各的
XS_ATLAS = _json.load(open(os.path.join(GEN, _XSA + '.json'), encoding='utf-8')) if (_XSA and os.path.exists(os.path.join(GEN, _XSA + '.json'))) else {}
XS_MAT = _img_mat('wz_xs_fronts', _XSA + '.jpg', rough=0.55, emit=0.85) if XS_ATLAS else None   # 店裡、二樓窗後面、燈箱：自發光（參考圖裡店都是亮的；在騎樓的陰影裡只靠反光會變成一片暗）
XS_MAT_M = _img_mat('wz_xs_fronts_matte', _XSA + '.jpg', rough=0.75, emit=0.1) if XS_ATLAS else None   # 外牆上的字、招牌板、海報櫃：不發光
XS_LIT = ('_int', '_up', '_side', 'nanyang_sign', 'dakou_sign', 'dakou_v', 'xsports_v', '_door', '_take', '_shop', 'ggcvs_sign', 'ggcvs_vend', '_kitchen', '_win', 'ggyy_sign', 'tzlian_sign', 'tzxile_sign', 'tzyue_sign', 'tzkeju_sign', 'tzdong_sign', '_vsign', '_menu')   # 汀州路五間（tz_fronts_tex.py）：燈箱招牌、照片菜單燈箱晚上亮；溫特寶邸的黑底招牌不發光（上面三盞鵝頸燈照）
_XSQ = []   # 先收起來，最後一次做成兩個網格（同材質合併）
XS_SHOPS = []   # 窗卡的店前綴（照第一次出現的順序編號，寫進 xs_fronts_lit 的 extras xsShops）


def xs_quad(key, pts, flip=False, tiles=1):
    """把圖集裡的 key 貼在 pts（左下、右下、右上、左上，本地座標已經換成世界座標）；tiles＞1：橫向重複 n 次（太寬的店面不拉長）"""
    if key not in XS_ATLAS: return
    u0, v0, u1, v1 = XS_ATLAS[key][:4]
    a, b, c, d = pts
    for i in range(tiles):
        t0, t1 = i / tiles, (i + 1) / tiles
        lerp = lambda p, q, t: tuple(p[k] + (q[k] - p[k]) * t for k in range(3))
        _XSQ.append(([lerp(a, b, t0), lerp(a, b, t1), lerp(d, c, t1), lerp(d, c, t0)], (u1, v0, u0, v1) if flip else (u0, v0, u1, v1), any(t in key for t in XS_LIT), key))


def xs_finish():
    if not _XSQ or XS_MAT is None: return
    for lit, mat, nm in ((True, XS_MAT, 'xs_fronts_lit'), (False, XS_MAT_M, 'xs_fronts')):
        qs = [q for q in _XSQ if q[2] == lit]
        if not qs: continue
        bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); uvs = bm.loops.layers.uv.new('UVShop') if lit else None
        for q_ in qs:
            pts, (u0, v0, u1, v1) = q_[0], q_[1]
            f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
            for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
            if uvs is not None:   # 店的編號（第二組 UV 的 u；0＝不屬於哪一間、永遠亮）：遊戲照營業時間把打烊的店的窗卡調暗，不用拆網格（BB 11-04 05:06）
                k_ = q_[3] if len(q_) > 3 and q_[3] else ''; pre = k_.split('_')[0] if k_ else ''
                if pre and pre not in XS_SHOPS: XS_SHOPS.append(pre)
                si = (XS_SHOPS.index(pre) + 1) if pre else 0
                for lp in f.loops: lp[uvs].uv = (float(si), 0.0)
        me = bpy.data.meshes.new(nm); bm.to_mesh(me); bm.free(); me.materials.append(mat)
        ob = bpy.data.objects.new(nm, me); B.scene().collection.objects.link(ob); ob.parent = root
        if lit: ob['xsShops'] = ','.join(XS_SHOPS)   # glTF extras：第 i 間（從 1 開始）＝這串的第 i 個前綴（ggtea、ggbook、ggcvs…）


def _xq(xf, key, x0, x1, y0, y1, z, tiles=None, nz=1):
    """本地平面（z 固定）上的一塊圖集貼圖：x0→x1 是參考圖的左→右；nz＝面朝 +z（街上）或 −z"""
    asp = XS_ATLAS.get(key, [0, 0, 1, 1, 1])[4]
    n = tiles if tiles else max(1, round((x1 - x0) / max(0.1, (y1 - y0) * asp)))
    pts = [xf.p(x0, y0, z), xf.p(x1, y0, z), xf.p(x1, y1, z), xf.p(x0, y1, z)]
    xs_quad(key, pts if nz > 0 else [pts[1], pts[0], pts[3], pts[2]], flip=nz < 0, tiles=n)


def xs_front(spec, xf, W, wall):
    """新生南路的一間店（一樓騎樓＋店面）：c＝spec['xs']（wz_street.py 的 XS_FRONTS）"""
    c = spec['xs']; dep = c.get('dep', 3.5); D = 0.8; fr = acc(frame_mat(c.get('frame', '#3a3a38'))); cream = acc(frame_mat('#e8e2d6'))
    gx0, gx1 = c.get('glass', (-W / 2 + 0.3, W / 2 - 0.3)); gy1 = c.get('glass_h', 2.95); z = -dep
    # 店內（景深卡＋地板、兩側牆、天花板的燈）
    in3d = bool(c.get('int')) and SET == 'xinsheng' and xs_inside3d(spec, c, xf, gx0, gx1, gy1, z, fr)   # SHOP-WINDOW-3D-1112：有立體店內的不放景深卡
    if (c.get('int') and in3d) or c.get('real'):   # real＝沒有景深卡也沒有簡化店內：只做玻璃和框，後面由遊戲放室內模型
        xf.quad(acc(M['glass']), [(gx0, 0.12, z + 0.01), (gx1, 0.12, z + 0.01), (gx1, gy1, z + 0.01), (gx0, gy1, z + 0.01)])
        for (a, b) in ((gx0 - 0.05, gx0 + 0.02), (gx1 - 0.02, gx1 + 0.05)): xf.box(fr, a, b, 0.0, gy1 + 0.05, z - 0.04, z + 0.05)
        xf.box(fr, gx0, gx1, gy1, gy1 + 0.08, z - 0.04, z + 0.05); xf.box(fr, gx0, gx1, 0.0, 0.12, z - 0.04, z + 0.05)
        for mx in c.get('mullions', []): xf.box(fr, mx - 0.025, mx + 0.025, 0.12, gy1, z - 0.03, z + 0.04)
    elif c.get('int'):
        _xq(xf, c['int'], gx0, gx1, 0.12, gy1, z - D, tiles=c.get('int_tiles'))
        xf.box(acc(SK['f_terrazzo']), gx0, gx1, -0.02, 0.12, z - D, z)
        for xx in (gx0, gx1): xf.box(cream, xx - 0.03, xx + 0.03, 0.12, gy1, z - D, z)
        xf.box(cream, gx0, gx1, gy1, gy1 + 0.05, z - D, z)
        for k in range(max(1, round((gx1 - gx0) / 1.6))):
            lx = gx0 + (k + 0.5) * (gx1 - gx0) / max(1, round((gx1 - gx0) / 1.6)); xf.box(acc(M['bulb']), lx - 0.5, lx + 0.5, gy1 - 0.03, gy1, z - D * 0.6, z - D * 0.4)
        xf.quad(acc(M['glass']), [(gx0, 0.12, z + 0.01), (gx1, 0.12, z + 0.01), (gx1, gy1, z + 0.01), (gx0, gy1, z + 0.01)])
        for (a, b) in ((gx0 - 0.05, gx0 + 0.02), (gx1 - 0.02, gx1 + 0.05)): xf.box(fr, a, b, 0.0, gy1 + 0.05, z - 0.04, z + 0.05)
        xf.box(fr, gx0, gx1, gy1, gy1 + 0.08, z - 0.04, z + 0.05); xf.box(fr, gx0, gx1, 0.0, 0.12, z - 0.04, z + 0.05)
        for mx in c.get('mullions', []): xf.box(fr, mx - 0.025, mx + 0.025, 0.12, gy1, z - 0.03, z + 0.04)
    if c.get('arcade', True) is False:   # 溫州街日常失速（WZ-OFFBEAT-1104）：沒有騎樓，落地窗退 dep 公尺，外面是牆、雨棚、招牌
        xs_street_front(spec, xf, W, wall, c, gx0, gx1, gy1, z); return
    # 店面上方到騎樓天花板：牆（店面那一面的飾帶）
    xf.box(acc(M['gwall']) if c.get('band') == 'stone' else cream, -W / 2, W / 2, gy1 + 0.08, GH - 0.35, z - 0.25, z)
    for (key, x0, x1, y0, y1, where) in c.get('signs', []):
        zz = {'front': z + 0.02, 'street': 0.0, 'hang': -0.9}[where]; th = 0.12 if where != 'hang' else 0.2
        bm_ = acc(frame_mat(c.get('sign_back', '#2a2a28')))
        xf.box(bm_, x0 - 0.03, x1 + 0.03, y0 - 0.03, y1 + 0.03, zz, zz + th)
        _xq(xf, key, x0, x1, y0, y1, zz + th + 0.004, tiles=1)
        if where == 'hang':
            for hx in (x0 + 0.2, x1 - 0.2): xf.box(acc(M['metal']), hx - 0.01, hx + 0.01, y1 + 0.03, GH - 0.35, zz + th / 2 - 0.01, zz + th / 2 + 0.01)
        if c.get('lit'): CL.glow(root, 'xs_sign', *xf.p((x0 + x1) / 2, (y0 + y1) / 2, zz + 0.5), color='rgba(255,248,232,1)', size=2.0, day=0.0, night=0.6)
    for (key, x, y0, y1, w) in c.get('vsigns', []):   # 直立招牌（兩面）
        xf.box(acc(M['metal']), x - 0.04, x + 0.04, y1 + 0.02, y1 + 0.08, 0.0, w + 0.25); xf.box(acc(M['metal']), x - 0.04, x + 0.04, y0 - 0.08, y0 - 0.02, 0.0, w + 0.25)
        xf.box(acc(frame_mat('#1f2e4a')), x - 0.07, x + 0.07, y0, y1, 0.2, 0.2 + w)
        for sx in (-1, 1):
            p = [xf.p(x + sx * 0.075, y0, 0.2), xf.p(x + sx * 0.075, y0, 0.2 + w), xf.p(x + sx * 0.075, y1, 0.2 + w), xf.p(x + sx * 0.075, y1, 0.2)]
            xs_quad(key, p if sx < 0 else [p[1], p[0], p[3], p[2]], tiles=1)   # 兩面的字都是正的（從街上兩個方向看）
    for (key, x0, x1, y0, y1, zo) in c.get('decals', []):   # 門口的小東西（海報櫃、吉他、木牌…）：一層薄板＋貼圖
        xf.box(fr, x0 - 0.04, x1 + 0.04, y0 - 0.04, y1 + 0.04, z + zo - 0.03, z + zo + 0.03)
        _xq(xf, key, x0, x1, y0, y1, z + zo + 0.035, tiles=1)
    if c.get('stair'): xs_stair(xf, c['stair'], z)
    # 騎樓：天花板（日光燈）、靠街那一邊的柱子
    xf.box(acc(M['ceilA']), -W / 2, W / 2, GH - 0.35, GH - 0.12, -dep, 0.0)
    for k in range(max(1, round(W / 3.0))):
        lx = -W / 2 + (k + 0.5) * W / max(1, round(W / 3.0)); xf.box(acc(M['bulb']), lx - 0.6, lx + 0.6, GH - 0.38, GH - 0.35, -dep / 2 - 0.05, -dep / 2 + 0.05)
    for sx in spec.get('pillars', (W / 2,)):
        xf.box(acc(M['pillar']), sx - 0.3, min(sx + 0.3, W / 2), 0.0, GH - 0.35, -0.6, 0.0)


def xs_awning(xf, x0, x1, y0, y1, d, col, along='x', zc=0.0):
    """綠色帆布雨棚（日常失速參考圖：斜的帆布面＋前緣一排半圓波浪邊）。along='x'：正面（雨棚沿本地 x、往 +z 伸出）；'z'：側面（本地 x＝zc 那一面，沿 z、往 +x 伸出）"""
    m = acc(awning_mat(col))
    P = (lambda u, y, o: xf.p(u, y, o)) if along == 'x' else (lambda u, y, o: xf.p(zc + o, y, u))
    def Q(mm, pts): mm.quad([P(*q) for q in pts])
    top = [(x0, y0, 0.02), (x1, y0, 0.02), (x1, y1, d), (x0, y1, d)]
    if along == 'z': top = top[::-1]
    Q(m, top); Q(m, top[::-1])
    n = max(2, round((x1 - x0) / 0.34)); sw = (x1 - x0) / n; hh = 0.13
    for i in range(n):
        a_ = x0 + i * sw
        for k in range(3):   # 半圓分三段（梯形），前後兩面
            t0, t1 = k / 3, (k + 1) / 3
            ua, ub = a_ + sw * t0, a_ + sw * t1
            ha, hb = hh * math.sin(math.pi * t0) + 0.06, hh * math.sin(math.pi * t1) + 0.06
            q = [(ua, y1, d), (ub, y1, d), (ub, y1 - hb, d), (ua, y1 - ha, d)]
            if along == 'z': q = [q[1], q[0], q[3], q[2]]
            Q(m, q[::-1]); Q(m, q)
    for u in (x0, x1):   # 兩端的鐵架
        a_, b_ = P(u, y0 - 0.35, 0.02), P(u, y1 + 0.02, d - 0.02); acc(M['metal']).cyl(a_, b_, 0.012, seg=5)


def xs_street_front(spec, xf, W, wall, c, gx0, gx1, gy1, z):
    """沒有騎樓的店面（溫州街日常失速）：落地窗（黑鐵窗框，每 pane 公尺一格、tr 一道橫框）、門、玻璃上方到一樓頂的牆、綠色波浪雨棚、牆上的招牌（參考圖裁的字）、兩盞門燈、側面的窗、門口的 A 字立牌和大理石小圓桌"""
    fr = acc(frame_mat(c['frame'])) if c.get('frame') else acc(SK['black']); wm = wall
    xf.box(wm, -W / 2, W / 2, gy1 + 0.08, GH, z - 0.85, 0.0)                      # 窗上的牆（一樓牆體從 rec＝dep＋0.85 開始，玻璃前後這一段要補；原本只補到玻璃後 0.25，北面轉角露出一條縫）
    xf.box(wm, -W / 2, gx0 - 0.05, 0.0, gy1 + 0.08, z - 0.85, 0.0); xf.box(wm, gx1 + 0.05, W / 2, 0.0, gy1 + 0.08, z - 0.85, 0.0)   # 玻璃兩側的牆
    tr, pane = c.get('transom', 2.65), c.get('pane', 1.1)
    for (a, b) in c.get('piers', []): xf.box(fr, a, b, 0.0, gy1, z - 0.04, z + 0.05)   # 門和窗中間的黑鐵框
    for (a, b) in c.get('panes', [(gx0, gx1)]):
        n = max(1, round((b - a) / pane))
        for i in range(1, n): xx = a + i * (b - a) / n; xf.box(fr, xx - 0.025, xx + 0.025, 0.12, gy1, z - 0.03, z + 0.04)
        xf.box(fr, a, b, tr - 0.025, tr + 0.025, z - 0.03, z + 0.04)
    dr = c.get('door')
    if dr:   # 門：門框、上面一道橫框、直把手
        d0, d1, dh = dr
        season_door(spec, xf, d0, d1, dh, z, 'gg')   # 季節布置用（只記錄）
        for xx in (d0, d1): xf.box(fr, xx - 0.04, xx + 0.04, 0.0, gy1, z - 0.04, z + 0.06)
        xf.box(fr, d0, d1, dh - 0.03, dh + 0.03, z - 0.04, z + 0.06)
        xf.box(acc(M['metal']), d1 - 0.16, d1 - 0.13, 0.9, 1.5, z + 0.06, z + 0.1)
    aw = c.get('awning')
    if aw: xs_awning(xf, aw['x0'], aw['x1'], aw['y0'], aw['y1'], aw['d'], aw['color'])
    pn = c.get('panel')
    if pn:   # 招牌：奶油色的牆面一塊（字直接漆在牆上，參考圖），字是參考圖裁的
        xf.box(acc(frame_mat(pn.get('color', '#efe4cc'))), pn['x0'], pn['x1'], pn['y0'], pn['y1'], -0.02, 0.025)
        for (key, x0, x1, y0, y1) in pn.get('text', []): _xq(xf, key, x0, x1, y0, y1, 0.03, tiles=1)
    for (lx, ly) in c.get('lamps', []):   # 黑色鐵門燈（燈臂＋燈籠＋暖光）
        k = acc(SK['black']); xf.box(k, lx - 0.06, lx + 0.06, ly + 0.15, ly + 0.35, 0.0, 0.04); xf.cyl(k, (lx, ly + 0.3, 0.03), (lx, ly + 0.3, 0.32), 0.015, seg=6)
        xf.box(k, lx - 0.1, lx + 0.1, ly + 0.2, ly + 0.24, 0.22, 0.42); acc(M['bulb']).sphere(xf.p(lx, ly + 0.08, 0.32), 0.08, seg=8, rings=4)
        q = xf.p(lx, ly + 0.08, 0.32); CL.glow(root, 'offbeat_lamp', q[0], q[1], q[2], color='rgba(255,214,150,1)', size=0.9, day=0.15, night=0.9)
    for (key, x, y0, y1, w) in c.get('vsigns', []):   # 直立燈箱招牌（兩面；同 gg_front。汀州路沒有騎樓的五間）
        for yy in (y1 + 0.05, y0 - 0.05): xf.box(acc(M['metal']), x - 0.04, x + 0.04, yy - 0.03, yy + 0.03, 0.0, w + 0.25)
        xf.box(acc(frame_mat('#1f2e4a')), x - 0.07, x + 0.07, y0, y1, 0.2, 0.2 + w)
        for sx in (-1, 1):
            p = [xf.p(x + sx * 0.075, y0, 0.2), xf.p(x + sx * 0.075, y0, 0.2 + w), xf.p(x + sx * 0.075, y1, 0.2 + w), xf.p(x + sx * 0.075, y1, 0.2)]
            xs_quad(key, p if sx < 0 else [p[1], p[0], p[3], p[2]], tiles=1)
    sd = c.get('side')
    if sd: xs_side_window(spec, xf, W, c, sd)
    for it in c.get('clutter', []):
        if it[0] == 'aboard': aboard(xf, it[1], it[2], it[3] if len(it) > 3 else 'chalk')
        elif it[0] == 'bistro': bistro_table(xf, it[1], it[2])
    if c.get('lit', True):
        CL.glow(root, 'offbeat_in', *xf.p((gx0 + gx1) / 2, 1.6, z - 0.4), color='rgba(255,232,190,1)', size=4.0, day=0.0, night=0.55)


def side_glass(spec, xf, W, rec, wall):
    """SUNNY SIDE 東側的綠框落地窗（本地 x＝+W/2 那一面）：玻璃在 x＝W/2−dep；z1～−rec 那一段看得到後面的立體淺店內，−rec 以後是店內景深卡（AA 的室內 GLB 從側面渲染，玻璃後 0.8 m）。
    框照正面（wz_shopkit shopfront_v2 的 grid）：每 0.55 m 一根直框、y 2.0 一道橫框、0.55 以下木腰板；轉角 z1～門廊之間留實牆（參考圖轉角的米白柱子）"""
    sg = spec['sf']['side_glass']; z0, z1, dep, hd = sg['z0'], sg['z1'], sg.get('dep', 0.15), sg.get('head', 2.6)
    xg = W / 2 - dep; xc = xg - 0.8; w = acc(frame_mat(spec['sf'].get('frame', '#3f5a3c')))
    _real = spec['sf'].get('real')
    if sg.get('int') in XS_ATLAS and not _real:
        u0, v0, u1, v1 = XS_ATLAS[sg['int']][:4]; zc = -rec - 0.1
        _XSQ.append(([xf.p(xc, 0.12, zc), xf.p(xc, 0.12, z0), xf.p(xc, hd, z0), xf.p(xc, hd, zc)], (u0, v0, u1, v1), True, sg['int']))
        xf.box(acc(SK['f_terrazzo']), xc, xg, -0.02, 0.12, z0, -rec)                                             # 景深卡前面的地板
    if not _real: xf.box(acc(SK['f_wood']), W / 2 - 0.3, xg, -0.02, 0.12, -rec, z1)                              # 淺店內和玻璃之間那一條地板
    xf.box(wall, W / 2 - 0.26, W / 2, 0, GH, z1, -0.9)                                                           # 轉角的實牆（窗和門廊之間）
    xf.box(wall, W / 2 - 0.26, W / 2, hd + 0.08, GH, -rec, z1)                                                   # 窗上的牆（淺店內那一段）
    xf.quad(acc(M['glass']), [(xg + 0.01, 0.55, z1), (xg + 0.01, 0.55, z0), (xg + 0.01, hd, z0), (xg + 0.01, hd, z1)])
    xf.box(w, xg - 0.04, xg + 0.04, 0.085, 0.55, z0, z1)                                                         # 木腰板（和正面同色）
    xf.box(w, xg - 0.06, xg + 0.06, 0.0, 0.085, z0, z1); xf.box(w, xg - 0.06, xg + 0.06, hd, hd + 0.08, z0, z1)
    xf.box(w, xg - 0.04, xg + 0.04, 1.98, 2.03, z0, z1)                                                          # 橫框
    n = max(1, round((z1 - z0) / 0.55))
    for i in range(n + 1): zz = z0 + i * (z1 - z0) / n; t = 0.06 if i in (0, n) else 0.025; xf.box(w, xg - 0.045, xg + 0.045, 0.085, hd, zz - t, zz + t)
    # 側面也有條紋雨遮（參考圖）：用轉 90° 的座標（+z＝建築的 +x）照正面雨遮的做法畫，貼圖方向和正面一樣，才能和正面合進同一張圖集（不多一個 draw call）
    ox, _, oz = xf.p(W / 2, 0, (z0 + z1) / 2); sx_ = Xf(ox, oz, xf.ry + math.pi / 2); m = acc(SK['stripe_green']); aw = (z1 - z0) + 0.1
    ay0, ay1, ad = hd + 0.5, hd + 0.05, 0.9
    for k in range(3):   # 分三段：貼圖照世界座標投影，一片 7 m 長在 v 方向超過 atlas_rows 的 6 個週期，整個材質會被排除、自己一個 draw call
        a0, a1 = -aw / 2 + k * aw / 3, -aw / 2 + (k + 1) * aw / 3
        q = [(a0, ay0, 0.02), (a1, ay0, 0.02), (a1, ay1, ad), (a0, ay1, ad)]; sx_.quad(m, q[::-1]); sx_.quad(m, q)
        sx_.box(m, a0, a1, ay1 - 0.24, ay1, ad - 0.01, ad + 0.01)


def xs_side_window(spec, xf, W, c, sd):
    """側面（本地 x＝+W/2 那一面）的落地窗：玻璃退 dep、後面 0.8 m 是店內的景深卡（從街上渲染 AA 的室內 GLB），一樓牆體在 wz_street.apartment 挖開"""
    z0, z1, y1, dep, D = sd['z0'], sd['z1'], sd.get('glass_h', 3.1), sd.get('dep', 0.3), 0.8
    xg = W / 2 - dep; xc = xg - D; fr = acc(SK['black']); cream = acc(frame_mat('#e8e2d6'))
    if sd.get('int') in XS_ATLAS and not c.get('real'):   # real：側窗後面也是遊戲放的室內模型，不放景深卡
        u0, v0, u1, v1 = XS_ATLAS[sd['int']][:4]
        _XSQ.append(([xf.p(xc, 0.12, z1), xf.p(xc, 0.12, z0), xf.p(xc, y1, z0), xf.p(xc, y1, z1)], (u0, v0, u1, v1), True, sd['int']))
    if not c.get('real'):   # real：窗洞裡不做 0.8 m 深的窗台、側板、頂板（會伸進室內模型裡）
        xf.box(acc(SK['f_terrazzo']), xc, xg, -0.02, 0.12, z0, z1)
        for zz in (z0, z1): xf.box(cream, xc, xg, 0.12, y1, zz - 0.03, zz + 0.03)
        xf.box(cream, xc, xg, y1, y1 + 0.05, z0, z1)
    xf.quad(acc(M['glass']), [(xg + 0.01, 0.12, z1), (xg + 0.01, 0.12, z0), (xg + 0.01, y1, z0), (xg + 0.01, y1, z1)])
    for zz in (z0, z1): xf.box(fr, xg - 0.04, xg + 0.05, 0.0, y1 + 0.05, zz - 0.05, zz + 0.05)
    xf.box(fr, xg - 0.04, xg + 0.05, y1, y1 + 0.08, z0, z1); xf.box(fr, xg - 0.04, xg + 0.05, 0.0, 0.12, z0, z1)
    n = max(1, round((z1 - z0) / c.get('pane', 1.1)))
    for i in range(1, n): zz = z0 + i * (z1 - z0) / n; xf.box(fr, xg - 0.03, xg + 0.04, 0.12, y1, zz - 0.025, zz + 0.025)
    tr = c.get('transom', 2.65); xf.box(fr, xg - 0.03, xg + 0.04, tr - 0.025, tr + 0.025, z0, z1)
    aw = sd.get('awning')
    if aw: xs_awning(xf, z0 - 0.1, z1 + 0.1, aw['y0'], aw['y1'], aw['d'], aw['color'], along='z', zc=W / 2)


def bistro_table(xf, x, z):
    """門口的大理石小圓桌（參考圖右前：兩杯冰咖啡、肉桂捲、小花瓶）"""
    PROP_FP.append(dict(tag='bistro', rect=[round(min(xf.p(x - 0.36, 0, z - 0.36)[0], xf.p(x + 0.36, 0, z + 0.36)[0]), 3), round(min(xf.p(x - 0.36, 0, z - 0.36)[2], xf.p(x + 0.36, 0, z + 0.36)[2]), 3),
                    round(max(xf.p(x - 0.36, 0, z - 0.36)[0], xf.p(x + 0.36, 0, z + 0.36)[0]), 3), round(max(xf.p(x - 0.36, 0, z - 0.36)[2], xf.p(x + 0.36, 0, z + 0.36)[2]), 3)], h=1.0))
    k = acc(SK['black']); w_ = acc(frame_mat('#e8e2d6')); g_ = acc(M['glass'])
    xf.cyl(k, (x, 0.0, z), (x, 0.03, z), 0.24, seg=12); xf.cyl(k, (x, 0.03, z), (x, 0.72, z), 0.03, seg=8); xf.cyl(w_, (x, 0.72, z), (x, 0.76, z), 0.36, seg=18)
    cf = acc(SK['wood_lt'])   # 冰咖啡、肉桂捲：用街上現成的淺木色（不多開材質）
    for (dx, dz) in ((-0.12, 0.08), (0.06, 0.12)):
        xf.cyl(g_, (x + dx, 0.76, z + dz), (x + dx, 0.9, z + dz), 0.04, seg=8); xf.cyl(cf, (x + dx, 0.765, z + dz), (x + dx, 0.86, z + dz), 0.037, seg=8)
    xf.cyl(w_, (x + 0.12, 0.76, z - 0.08), (x + 0.12, 0.77, z - 0.08), 0.1, seg=12); xf.cyl(cf, (x + 0.12, 0.77, z - 0.08), (x + 0.12, 0.81, z - 0.08), 0.06, seg=10)
    xf.cyl(g_, (x - 0.02, 0.76, z - 0.14), (x - 0.02, 0.88, z - 0.14), 0.03, seg=6); xf.box(w_, x - 0.07, x + 0.03, 0.88, 0.95, z - 0.19, z - 0.09)


GG_WOOD = '#8a5a32'   # 公館四間新店共用的木框色（材質少一點：每個顏色一個材質、一次 draw call）


def gg_flatwall(col):
    """平塗的淺色石材牆（花序第 2 版，BB 11-11 01:50：灰泥貼圖在遊戲裡是灰水泥；參考是米白石材，整間在街上比兩邊亮）：沒有貼圖、帶一點暖色自發光（騎樓裡整天背光）"""
    nm = 'gg_xs_flatwall_' + col.lstrip('#')
    if nm not in _mats: _mats[nm] = L.flat(nm, col, rough=0.85, emit=B.srgb('#4a4436'))
    return _mats[nm]


def gg_plaster(col):
    col = {'#efe8da': '#f0eee8'}.get(col.lower(), col)   # PERF-GG-DC-1104：青木的 #efe8da 和日和的 #f0eee8 看不出差別，合成一個材質（少一次 draw call）
    nm = 'gg_xs_plaster_' + col.lstrip('#')
    if nm not in _mats: _mats[nm] = L.pbr(nm, 'plaster_grey_04', tile=1.5, target=col, normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.9)
    return _mats[nm]


def gg_front(spec, xf, W, wall, gz, ceil_y):
    """公館四間新店的店面（使用者 11-04 01:0x，AA_647：青木茶室、頁間書屋、日和便利店、慢輪單車；LAWWW2 11-04）。
    參考圖就是規格（SCENE_RULES §12）：窗後面看到的店內、門裡面、招牌、黑板立牌、販賣機等等是參考圖裁的（xs_front_tex.py 的 QG → gg_fronts_atlas）；
    牆、窗框、門框、玻璃、屋簷、雨遮、燈、盆栽是 3D。遊戲的店面比參考圖寬，多出來的那一段用同一間店的室內參考圖做另一扇窗。
    c＝spec['xs']（wz_street.py 的 GG_XS）：cards＝窗（貼圖、範圍、景深）；door；eave／canopy／awning；signs；decals；lamps；props"""
    c = spec['xs']; wl = wall if c.get('wall_same') else acc(gg_flatwall(c['wallc']) if c.get('wall_flat') else gg_plaster(c.get('wallc', '#e9dfcc'))); fr = acc(SK['alu2'] if c.get('frame') == 'alu' else frame_mat(c['frame'] if str(c.get('frame', '')).startswith('#') else GG_WOOD)); cream = acc(frame_mat('#e8e2d6'))   # wall_same＝店面的牆和這一棟的外牆同一種（禮貌生財：米白小方磚）
    X0, X1 = -W / 2 + 0.3, W / 2 - 0.3
    if c.get('lane'):   # 巷口（GG-G10-LANE-MOUTH-1111；使用者 11-11 選擇題選「改成真的巷口」：往汀州路的巷子從 G10 的一樓穿過去）：中間一條通道（兩側牆、樓板底、柏油地面、往裡通到底），
        #   兩邊各一段牆（電表箱、排水管、信箱）；通道口上面一塊巷名牌的底板（字由遊戲的互動點說，不寫字）、裡面兩盞壁燈
        lw = c.get('lane_w', 4.6) / 2; depth = c.get('lane_d', 13.0); top = ceil_y; alu = acc(SK['alu2']); dark = acc(frame_mat('#3a3a3c')); road = acc(SK['f_concrete'] if 'f_concrete' in SK else SK['f_granite'])
        for sg in (-1, 1):
            a_, b_ = (X0, -lw) if sg < 0 else (lw, X1)
            xf.box(wl, a_, b_, 0.0, top, gz - 0.25, gz)                                                        # 兩邊的牆
            xf.box(acc(SK['f_granite']), a_, b_, 0.0, 0.5, gz, gz + 0.02)                                       # 牆腳
            xi = sg * lw; xf.box(wl, min(xi, xi + sg * 0.22), max(xi, xi + sg * 0.22), 0.0, top, gz - depth, gz)   # 通道的側牆
            xf.box(acc(SK['f_granite']), min(xi - sg * 0.02, xi), max(xi - sg * 0.02, xi), 0.0, 0.4, gz - depth, gz)
            xf.box(dark, sg * (lw + 0.9) - 0.3, sg * (lw + 0.9) + 0.3, 1.2, 1.9, gz, gz + 0.14)                  # 電表箱
            xf.box(alu, sg * (X1 - 0.35) - 0.05, sg * (X1 - 0.35) + 0.05, 0.0, top, gz, gz + 0.1)               # 排水管
            for k in range(3):                                                                                  # 通道裡牆上的管線、舊冷氣架、壁燈
                zz = gz - 2.5 - k * 4.0; xw = sg * (lw - 0.02)
                xf.box(alu, min(xw, xw - sg * 0.06), max(xw, xw - sg * 0.06), 2.5, 2.56, zz - 1.8, zz + 1.8)
                if (k + (sg > 0)) % 2 == 0:
                    xf.box(dark, min(xw, xw - sg * 0.16), max(xw, xw - sg * 0.16), 2.25, 2.4, zz - 0.09, zz + 0.09); CL.glow(root, 'arcadelamp', *xf.p(xw - sg * 0.3, 2.2, zz), color='rgba(255,214,150,1)', size=1.6, day=0.0, night=0.8)
        xf.box(acc(M['ceilA']), -lw, lw, top - 0.02, top + 0.1, gz - depth, gz)                                 # 樓板底
        xf.box(road, -lw, lw, 0.0, 0.04, gz - depth, gz)                                                       # 通道的地面
        xf.box(wl, -lw - 0.22, lw + 0.22, top - 0.5, top, gz - 0.25, gz + 0.02)                                 # 通道口上面的樑
        xf.box(dark, -0.75, 0.75, top - 0.42, top - 0.1, gz + 0.02, gz + 0.06); xf.box(acc(frame_mat('#1f5a3a')), -0.7, 0.7, top - 0.38, top - 0.14, gz + 0.06, gz + 0.068)   # 巷名牌的底板（綠色，沒有字）
        return
    if c.get('shut'):   # 拉下鐵捲門的空店面（GG-G09-G10-SHUTTER-1111，X335；使用者 11-11「先拉下鐵門」：洗樂、印得好搬到汀州路以後，公館這兩格先空著）：兩扇鐵捲門、中間一根牆柱、上面捲門箱；沒有招牌字、沒有機器、沒有雜物
        sm = acc(M['shutter']); alu = acc(SK['alu2']); top = ceil_y - 0.42; mid = c.get('pier', 0.0)
        xf.box(wl, X0, X1, 0.0, ceil_y, gz - 0.3, gz - 0.22)                                                   # 鐵門後面的牆（鐵門的縫看不到店內）
        xf.box(wl, X0, X1, top, ceil_y, gz - 0.22, gz + 0.02)
        for (a_, b_) in ((X0, X0 + 0.16), (mid - 0.14, mid + 0.14), (X1 - 0.16, X1)): xf.box(wl, a_, b_, 0.0, top, gz - 0.22, gz + 0.02)
        for (a_, b_) in ((X0 + 0.16, mid - 0.14), (mid + 0.14, X1 - 0.16)):
            xf.quad(sm, [(a_, 0.03, gz - 0.06), (b_, 0.03, gz - 0.06), (b_, top, gz - 0.06), (a_, top, gz - 0.06)])
            xf.box(alu, a_ - 0.02, b_ + 0.02, top - 0.02, top + 0.26, gz - 0.2, gz + 0.06)                     # 捲門箱
            for xx in (a_, b_ - 0.05): xf.box(alu, xx, xx + 0.05, 0.03, top, gz - 0.1, gz - 0.03)               # 導軌
            xf.box(alu, a_ + 0.05, b_ - 0.05, 0.03, 0.1, gz - 0.07, gz - 0.035)                                # 底條
            xf.box(acc(SK['f_granite']), a_, b_, 0.0, 0.03, gz - 0.2, gz + 0.02)
        return
    opens = [(cd[1], cd[2], cd[3], cd[4]) for cd in c.get('cards', [])]
    dr = c.get('door')
    if dr: opens.append((dr['x0'], dr['x1'], 0.0, dr['y1']))
    _gl = (min(o[0] for o in opens), max(o[1] for o in opens)) if opens else None   # 季節布置用（只記錄）：門、整面開著的店
    if dr: season_door(spec, xf, dr['x0'], dr['x1'], dr['y1'], gz, 'open' if dr.get('style') == 'open' else 'gg', glass=_gl)
    else:
        for cd in c.get('cards', []):
            if str(cd[0]).endswith('_door'): season_door(spec, xf, cd[1], cd[2], cd[4], gz, 'gg', glass=_gl)
            elif cd[0] in c.get('open', ()) and cd[2] - cd[1] > 3.0: season_door(spec, xf, cd[1], cd[2], cd[4], gz, 'open', glass=_gl)
    # 牆：店面那一面（窗、門以外的地方），一格一格補
    xs_ = sorted({X0, X1} | {v for o in opens for v in (o[0], o[1]) if X0 < v < X1})
    for a_, b_ in zip(xs_, xs_[1:]):
        if b_ - a_ < 1e-3: continue
        m_ = (a_ + b_) / 2; cov = sorted((o[2], o[3]) for o in opens if o[0] <= m_ <= o[1]); y = 0.0
        for (p0, p1) in cov + [(ceil_y, ceil_y)]:
            if p0 > y + 1e-3: xf.box(wl, a_, b_, y, p0, gz - 0.25, gz)
            y = max(y, p1)
    bs = c.get('base')   # 窗台下的腰牆貼圖（頁間書屋的石材）
    if bs:
        for cd in c.get('cards', []):
            if cd[3] > 0.2: _xq(xf, bs, cd[1], cd[2], 0.0, cd[3] - 0.04, 0.006 + gz)
    # 窗：景深卡＋窗台、兩側、上緣的內牆＋玻璃＋框
    for cd in c.get('cards', []):
        key, x0, x1, y0, y1, d = cd[:6]; mull = cd[6] if len(cd) > 6 else []; tr = cd[7] if len(cd) > 7 else None; zc = gz - d
        if not c.get('real'):   # real（SHOP-REAL-INSIDE-1112）：不放景深卡和窗洞的內牆——玻璃後面由遊戲放走進去的那一顆室內模型（Z3.shopInsideReal）
            _xq(xf, key, x0, x1, y0, y1, zc, tiles=1)
            xf.box(acc(SK['f_terrazzo']) if y0 < 0.2 else cream, x0, x1, y0 - 0.04, y0, zc, gz)
            for xx in (x0, x1): xf.box(cream, xx - 0.02, xx + 0.02, y0, y1, zc, gz - 0.01)
            xf.box(cream, x0, x1, y1, y1 + 0.04, zc, gz - 0.01)
        if key in c.get('open', ()):   # 開放式的櫃台開口（洋洋鹹酥雞的炸物櫃台）：沒有玻璃、沒有窗框，檯面在 ledges
            if c.get('lit', True): CL.glow(root, 'gg_xs_in', *xf.p((x0 + x1) / 2, (y0 + y1) / 2, zc + 0.3), color='rgba(255,236,200,1)', size=min(3.5, x1 - x0), day=0.0, night=0.6)
            continue
        xf.quad(acc(M['glass']), [(x0, y0, gz + 0.005), (x1, y0, gz + 0.005), (x1, y1, gz + 0.005), (x0, y1, gz + 0.005)])
        fw = c.get('fw', 0.05)
        for (a_, b_) in ((x0 - fw, x0 + 0.01), (x1 - 0.01, x1 + fw)): xf.box(fr, a_, b_, y0 - fw, y1 + fw, gz - 0.04, gz + 0.05)
        xf.box(fr, x0, x1, y1 - 0.01, y1 + fw, gz - 0.04, gz + 0.05); xf.box(fr, x0, x1, y0 - fw, y0 + 0.01, gz - 0.04, gz + 0.06)
        for mx in mull: xf.box(fr, mx - 0.025, mx + 0.025, y0, y1, gz - 0.03, gz + 0.04)
        for t_ in (tr if isinstance(tr, (list, tuple)) else ([tr] if tr else [])): xf.box(fr, x0, x1, t_ - 0.025, t_ + 0.025, gz - 0.03, gz + 0.04)   # 橫框可以好幾條（禮貌生財的格子窗）
        if c.get('lit', True): CL.glow(root, 'gg_xs_in', *xf.p((x0 + x1) / 2, (y0 + y1) / 2, zc + 0.3), color='rgba(255,236,200,1)', size=min(3.5, x1 - x0), day=0.0, night=0.5)
    for lf in c.get('leaves', []):   # 往外開的門扇（禮貌生財：深色木框格子玻璃門，垂直店面往騎樓開著）：(門軸 x, 門寬, 高, 往哪一邊偏 ±1)
        hx, lw_, lh, sd = lf; t = 0.045; z0_, z1_ = gz + 0.02, gz + 0.02 + lw_; xa, xb = (hx, hx + t) if sd > 0 else (hx - t, hx)
        for (y0_, y1_) in ((0.0, 0.12), (0.86, 0.94), (lh - 0.1, lh)): xf.box(fr, xa, xb, y0_, y1_, z0_, z1_)
        for zz in (z0_, z1_ - 0.08): xf.box(fr, xa, xb, 0.0, lh, zz, zz + 0.08)
        xf.box(fr, xa + 0.008, xb - 0.008, 0.12, 0.86, z0_ + 0.08, z1_ - 0.08)                                   # 下半實木板
        for k in (1, 2): yy = 0.94 + k * (lh - 1.04) / 3; xf.box(fr, xa, xb, yy - 0.018, yy + 0.018, z0_ + 0.08, z1_ - 0.08)
        zm_ = (z0_ + z1_) / 2; xf.box(fr, xa, xb, 0.94, lh - 0.1, zm_ - 0.018, zm_ + 0.018)
        xm_ = (xa + xb) / 2; xf.quad(acc(M['glass']), [(xm_, 0.94, z0_ + 0.08), (xm_, 0.94, z1_ - 0.08), (xm_, lh - 0.1, z1_ - 0.08), (xm_, lh - 0.1, z0_ + 0.08)])
        xf.box(acc(SK['alu2']), xa - 0.02 * sd, xa, 1.0, 1.06, z1_ - 0.16, z1_ - 0.1)                              # 門把
    # 門
    if dr:
        x0, x1, y1, st = dr['x0'], dr['x1'], dr['y1'], dr.get('style', 'wood'); _df = dr.get('frame', c.get('frame')); dfr = acc(SK['alu2'] if _df == 'alu' else frame_mat(_df if str(_df or '').startswith('#') else GG_WOOD))
        if st == 'open':   # 整面拉開（慢輪單車）：門裡面的店（景深卡在 1.4 m）＋地板＋兩側內牆、兩扇門片往裡打開貼在兩側
            zc = gz - dr.get('d', 1.4)
            if not c.get('real'):   # real（SHOP-REAL-INSIDE 公館第二批 11-12）：門裡面不放景深卡和內牆，後面是遊戲放的室內模型
                _xq(xf, dr['key'], x0, x1, 0.0, y1, zc, tiles=1)
                xf.box(acc(SK['f_concrete'] if 'f_concrete' in SK else SK['f_terrazzo']), x0, x1, -0.02, 0.02, zc, gz)
                for xx in (x0, x1): xf.box(cream, xx - 0.03, xx + 0.03, 0.0, y1, zc, gz)
                xf.box(cream, x0, x1, y1, y1 + 0.05, zc, gz)
            lw = (x1 - x0) / 2
            for xx, sg in ((x0 + 0.06, 1), (x1 - 0.06, -1)):
                xf.box(dfr, xx - 0.03, xx + 0.03, 0.0, y1 - 0.05, gz - lw, gz); xf.quad(acc(M['glass']), [(xx + 0.031 * sg, 0.9, gz - lw + 0.08), (xx + 0.031 * sg, 0.9, gz - 0.08), (xx + 0.031 * sg, y1 - 0.2, gz - 0.08), (xx + 0.031 * sg, y1 - 0.2, gz - lw + 0.08)])
            CL.glow(root, 'gg_xs_in', *xf.p((x0 + x1) / 2, 1.6, zc + 0.4), color='rgba(255,236,200,1)', size=2.4, day=0.0, night=0.6)
        else:
            if dr.get('key'):
                zc = gz - dr.get('d', 0.6)
                if not c.get('real'):
                    _xq(xf, dr['key'], x0, x1, 0.0, y1, zc, tiles=1); xf.box(acc(SK['f_terrazzo']), x0, x1, -0.02, 0.0, zc, gz)
                    for xx in (x0, x1): xf.box(cream, xx - 0.02, xx + 0.02, 0.0, y1, zc, gz - 0.01)
                    xf.box(cream, x0, x1, y1, y1 + 0.04, zc, gz - 0.01)
                xf.quad(acc(M['glass']), [(x0, 0.0, gz + 0.005), (x1, 0.0, gz + 0.005), (x1, y1, gz + 0.005), (x0, y1, gz + 0.005)])
            fw = 0.07 if st == 'wood' else 0.045
            for (a_, b_) in ((x0 - fw, x0 + 0.01), (x1 - 0.01, x1 + fw)): xf.box(dfr, a_, b_, 0.0, y1 + fw, gz - 0.05, gz + 0.06)
            xf.box(dfr, x0, x1, y1 - 0.01, y1 + fw, gz - 0.05, gz + 0.06)
            if st == 'wood':   # 木框玻璃門：門片外框＋直把手
                for (a_, b_) in ((x0, x0 + 0.1), (x1 - 0.1, x1)): xf.box(dfr, a_, b_, 0.0, dr.get('leaf', y1), gz - 0.02, gz + 0.04)
                xf.box(dfr, x0, x1, 0.0, 0.18, gz - 0.02, gz + 0.04); xf.box(dfr, x0, x1, dr.get('leaf', y1) - 0.08, dr.get('leaf', y1), gz - 0.02, gz + 0.04)
                hx = x1 - 0.17 if dr.get('hinge', 'left') == 'left' else x0 + 0.17; xf.cyl(acc(M['metal']), (hx, 0.85, gz + 0.09), (hx, 1.45, gz + 0.09), 0.014, seg=6)
            elif st == 'auto':   # 自動門：鋁框、中間兩扇的接縫、上面一道橫框（感應器盒）
                mx = (x0 + x1) / 2; xf.box(dfr, mx - 0.03, mx + 0.03, 0.0, dr.get('leaf', y1), gz - 0.02, gz + 0.04)
                xf.box(dfr, x0, x1, dr.get('leaf', y1) - 0.03, dr.get('leaf', y1) + 0.03, gz - 0.03, gz + 0.05); xf.box(dfr, mx - 0.25, mx + 0.25, dr.get('leaf', y1) + 0.03, dr.get('leaf', y1) + 0.14, gz, gz + 0.12)
        if dr.get('mat'): xf.box(acc(frame_mat('#4a5a44')), x0 + 0.05, x1 - 0.05, 0.0, 0.012, gz + 0.06, gz + 0.85)
    # 屋簷（青木茶室的綠瓦）、雨遮框（日和的白色招牌框）、鐵皮雨遮（慢輪單車）
    ev = c.get('eave')
    if ev:
        key, x0, x1, yw, yo, d = ev; asp = XS_ATLAS.get(key, [0, 0, 1, 1, 8])[4]; sl = math.hypot(yw - yo, d); n = max(1, round((x1 - x0) / (sl * asp)))
        xs_quad(key, [xf.p(x0, yo, gz + d), xf.p(x1, yo, gz + d), xf.p(x1, yw, gz + 0.02), xf.p(x0, yw, gz + 0.02)], tiles=n)
        xf.quad(acc(SK['black']), [(x1, yw - 0.05, gz + 0.02), (x0, yw - 0.05, gz + 0.02), (x0, yo - 0.05, gz + d), (x1, yo - 0.05, gz + d)])
        xf.box(acc(SK['black']), x0, x1, yo - 0.07, yo + 0.01, gz + d - 0.03, gz + d + 0.02)
        n2 = max(1, round((x1 - x0) / (0.3 * asp)))   # 前緣一排瓦（從騎樓、馬路往上看，看到的是這一條；參考圖的綠瓦屋簷）
        xs_quad(key, [xf.p(x0, yo - 0.26, gz + d + 0.025), xf.p(x1, yo - 0.26, gz + d + 0.025), xf.p(x1, yo + 0.04, gz + d + 0.025), xf.p(x0, yo + 0.04, gz + d + 0.025)], tiles=n2)
    cn = c.get('canopy')
    if cn:
        x0, x1, y0, y1, d = cn['x0'], cn['x1'], cn['y0'], cn['y1'], cn['d']; cm = acc(gg_plaster(cn.get('color', c.get('wallc', '#f0eee8'))))
        xf.box(cm, x0, x1, y0, y1, gz, gz + d); xf.box(cm, x0, x1, y0 - 0.06, y0, gz + d - 0.08, gz + d)
        for (a_, b_, yy) in cn.get('stripes', []): xf.box(acc(frame_mat(cn.get('stripe', '#8a9a4a'))), a_, b_, yy, yy + 0.06, gz + d, gz + d + 0.01)
        for k in range(max(1, round((x1 - x0) / 2.2))):   # 雨遮框底下的崁燈
            lx = x0 + (k + 0.5) * (x1 - x0) / max(1, round((x1 - x0) / 2.2)); xf.box(acc(M['bulb']), lx - 0.08, lx + 0.08, y0 - 0.005, y0, gz + d / 2 - 0.08, gz + d / 2 + 0.08)
    aw = c.get('awning')
    if aw:
        x0, x1, yw, yo, d = aw['x0'], aw['x1'], aw['y0'], aw['y1'], aw['d']; m_ = acc(awning_mat(aw['color']) if aw.get('style') == 'canvas' else SK['corr'])   # canvas：Daybreak 的米色帆布雨棚
        q = [(x0, yw, gz + 0.02), (x1, yw, gz + 0.02), (x1, yo, gz + d), (x0, yo, gz + d)]; xf.quad(m_, q); xf.quad(m_, q[::-1])
        xf.box(acc(SK['black']), x0, x1, yo - 0.06, yo, gz + d - 0.02, gz + d + 0.02)
        nb = max(2, round((x1 - x0) / 1.8) + 1)
        for k in range(nb):
            bx = x0 + 0.1 + k * (x1 - x0 - 0.2) / (nb - 1); xf.cyl(acc(SK['black']), (bx, yw - 0.55, gz + 0.02), (bx, yo + 0.01, gz + d * 0.85), 0.018, seg=5)
    # 招牌、牆上的小東西
    for (key, x0, x1, y0, y1, where) in c.get('signs', []):
        if where == 'canopy': zz = gz + cn['d'] + 0.012
        else:
            zz = gz + 0.03
            if c.get('sign_back'): xf.box(acc(SK['black'] if c['sign_back'] == 'black' else frame_mat(GG_WOOD)), x0 - 0.04, x1 + 0.04, y0 - 0.04, y1 + 0.04, gz, gz + 0.06); zz = gz + 0.064
        _xq(xf, key, x0, x1, y0, y1, zz, tiles=1)
        if c.get('sign_lit'): CL.glow(root, 'signbox', *xf.p((x0 + x1) / 2, (y0 + y1) / 2, zz + 0.5), color='rgba(255,250,235,1)', size=2.0, day=0.0, night=0.55)
    for (key, x0, x1, y0, y1, zo) in c.get('decals', []):
        xf.box(acc(frame_mat(GG_WOOD)), x0 - 0.02, x1 + 0.02, y0 - 0.02, y1 + 0.02, gz + zo - 0.02, gz + zo + 0.02); _xq(xf, key, x0, x1, y0, y1, gz + zo + 0.022, tiles=1)
    for lg in c.get('ledges', []): x0, x1, y, dp = lg[:4]; xf.box(acc(SK['steel'] if (len(lg) > 4 and lg[4] == 'steel') else SK['wood_lt']), x0, x1, y - 0.05, y, gz - (0.6 if len(lg) > 4 else 0.0), gz + dp)   # 外帶窗口的木檯面；洋洋的不鏽鋼櫃台面
    for (lx, ly) in c.get('lamps', []):   # 黑色鵝頸燈（照招牌）
        k_ = acc(SK['black']); xf.box(k_, lx - 0.05, lx + 0.05, ly - 0.06, ly + 0.06, gz, gz + 0.03); xf.cyl(k_, (lx, ly, gz + 0.03), (lx, ly + 0.05, gz + 0.38), 0.012, seg=5)
        xf.cyl(k_, (lx, ly - 0.02, gz + 0.38), (lx, ly - 0.14, gz + 0.42), 0.09, seg=10); acc(M['bulb']).sphere(xf.p(lx, ly - 0.13, gz + 0.42), 0.04, seg=6, rings=3)
        q = xf.p(lx, ly - 0.2, gz + 0.42); CL.glow(root, 'gg_xs_lamp', q[0], q[1], q[2], color='rgba(255,214,150,1)', size=0.8, day=0.0, night=0.85)   # 11-04 白天 0.1→0（公館的光暈白天都是 0：gongguan_glb_integration「11:00 不畫」）
    # 門口的東西（騎樓走得到的地方：腳印寫進 props.json，遊戲端照 GG_PROP_BLOCKS 擋）
    for it in c.get('props', []):
        k = it[0]
        if k == 'pot':
            _pm = POT_BROAD if it[3] == 'broad' else POT_FERN[0]; _w = _wp(xf, it[1], gz + it[2]); B.instance(_pm, f'ggpot_{spec["id"]}_{len(_inst)}', *_w, root, ry=it[1] * 1.7); _inst.append(1); prop_fp(_pm, 'ggpot', _w[0], _w[2], it[1] * 1.7)
        elif k == 'board': gg_board(xf, it[1], it[2], gz + it[3])
        elif k == 'fn_tree':   # 花序門口的樹（白色方盆、細樹幹、圓的樹冠；原型 p_fntree）：('fn_tree', x, 離店面線)
            x, zo = it[1], gz + it[2]; _w = xf.p(x, 0, zo); B.instance(_fn_proto('tree'), f'ggfntree_{spec["id"]}_{len(_inst)}', _w[0], 0.0, _w[2], root, ry=xf.ry + x * 1.3); _inst.append(1)
            a_, b_ = xf.p(x - 0.25, 0, zo - 0.25), xf.p(x + 0.25, 0, zo + 0.25); PROP_FP.append(dict(tag='gg_fn_tree', rect=[round(min(a_[0], b_[0]), 3), round(min(a_[2], b_[2]), 3), round(max(a_[0], b_[0]), 3), round(max(a_[2], b_[2]), 3)], h=2.3))
        elif k == 'fn_box':   # 花序櫥窗下的長花箱（原型 p_fnbox）：('fn_box', x0, x1, 離店面線, 深)
            _, x0, x1, zo, dp = it; z0_, z1_ = gz + zo, gz + zo + dp; _w = xf.p((x0 + x1) / 2, 0, (z0_ + z1_) / 2); B.instance(_fn_proto('box', round(x1 - x0, 2), dp), f'ggfnbox_{spec["id"]}_{len(_inst)}', _w[0], 0.0, _w[2], root, ry=xf.ry); _inst.append(1)
            a_, b_ = xf.p(x0, 0, z0_), xf.p(x1, 0, z1_); PROP_FP.append(dict(tag='gg_fn_box', rect=[round(min(a_[0], b_[0]), 3), round(min(a_[2], b_[2]), 3), round(max(a_[0], b_[0]), 3), round(max(a_[2], b_[2]), 3)], h=0.6))
        elif k == 'fruit':   # 敞開的店面裡的水果箱（汀州鮮果第 3 版）：('fruit', 種類, x, 離店面線的深度（負的＝店面線裡面，不佔騎樓、不用腳印）[, 墊高])——放在開口和照片卡中間
            _pm = PROTO['fruit_' + it[1]]; _y = it[4] if len(it) > 4 else 0.0
            if _y > 0: xf.box(acc(frame_mat(GG_WOOD)), it[2] - 0.42, it[2] + 0.42, 0.0, _y, gz + it[3] - 0.3, gz + it[3] + 0.3)   # 後排墊高的木台
            _w = xf.p(it[2], 0, gz + it[3]); B.instance(_pm, f'ggfruit_{spec["id"]}_{len(_inst)}', _w[0], _y, _w[2], root, ry=xf.ry); _inst.append(1)   # 在店面線裡面（建築的導航阻擋裡）：不寫腳印
        elif k == 'box':
            _, key, x0, x1, h, zo, dp, col = it; zf = gz + zo; xf.box(acc(SK['steel'] if col == 'steel' else frame_mat(GG_WOOD if col == 'wood' else '#e8e2d6')), x0, x1, 0.0, h, zf - dp, zf); _xq(xf, key, x0 + 0.02, x1 - 0.02, 0.03, h - 0.03, zf + 0.004, tiles=1)
            a_, b_ = xf.p(x0, 0, zf - dp), xf.p(x1, 0, zf); PROP_FP.append(dict(tag='gg_' + key, rect=[round(min(a_[0], b_[0]), 3), round(min(a_[2], b_[2]), 3), round(max(a_[0], b_[0]), 3), round(max(a_[2], b_[2]), 3)], h=h))
        elif k == 'pump':   # 打氣站（慢輪單車）
            x, zo = it[1], gz + it[2]; g_ = acc(frame_mat('#8a9a4a')); xf.box(g_, x - 0.07, x + 0.07, 0.0, 1.15, zo - 0.07, zo + 0.07); xf.box(g_, x - 0.12, x + 0.12, 0.0, 0.05, zo - 0.12, zo + 0.12)
            xf.cyl(acc(SK['steel']), (x, 1.2, zo), (x, 1.2, zo + 0.06), 0.07, seg=12); xf.cyl(acc(SK['black']), (x + 0.08, 1.0, zo), (x + 0.25, 0.6, zo + 0.1), 0.012, seg=5)
            a_, b_ = xf.p(x - 0.15, 0, zo - 0.15), xf.p(x + 0.15, 0, zo + 0.15); PROP_FP.append(dict(tag='gg_pump', rect=[round(min(a_[0], b_[0]), 3), round(min(a_[2], b_[2]), 3), round(max(a_[0], b_[0]), 3), round(max(a_[2], b_[2]), 3)], h=1.27))


def gg_board(xf, key, x, z):
    """黑板 A 字立牌：木腳＋前後兩面（參考圖裁的字）"""
    a_, b_ = xf.p(x - 0.32, 0, z - 0.24), xf.p(x + 0.32, 0, z + 0.24); PROP_FP.append(dict(tag='gg_aboard', rect=[round(min(a_[0], b_[0]), 3), round(min(a_[2], b_[2]), 3), round(max(a_[0], b_[0]), 3), round(max(a_[2], b_[2]), 3)], h=1.1))
    m = acc(SK['wood_lt'])
    for sx in (-0.31, 0.28):
        for s_ in (-1, 1): xf.cyl(m, (x + sx + 0.015, 0.0, z + s_ * 0.24), (x + sx + 0.015, 1.08, z + s_ * 0.02), 0.015, seg=4)
    for s_ in (-1, 1):
        zb, zt = z + s_ * 0.22, z + s_ * 0.035
        p = [xf.p(x - 0.29, 0.12, zb), xf.p(x + 0.29, 0.12, zb), xf.p(x + 0.29, 1.02, zt), xf.p(x - 0.29, 1.02, zt)]
        xs_quad(key, p if s_ > 0 else [p[1], p[0], p[3], p[2]], tiles=1)


def xs_stair(xf, st, z):
    """同弦樂器：騎樓旁邊往上的樓梯口（參考圖右邊：磨石子踏階、奶油色牆＋扶手、壁燈；一樓牆體在 wz_street.apartment 挖開）。看得到，不能走（二樓的店還沒做）。"""
    x0, x1, dep = st['x0'], st['x1'], st['depth']; R_, T_ = 0.19, 0.27; cream = acc(frame_mat('#e8dcc4')); step = acc(SK['f_terrazzo'])
    for k in range(1, 30):
        za_, zb_ = z - k * T_, z - (k - 1) * T_
        if za_ < z - dep: break
        xf.box(step, x0, x1, 0.0, k * R_, za_, zb_)
    for xx, sg in ((x0, 1), (x1, -1)):
        xf.box(cream, xx - 0.02 if sg > 0 else xx, xx if sg > 0 else xx + 0.02, 0.0, GH - 0.4, z - dep, z)
    xf.box(cream, x0, x1, GH - 0.42, GH - 0.38, z - dep, z); xf.box(acc(M['ac_dark']), x0, x1, 0.0, GH - 0.4, z - dep - 0.02, z - dep)
    for k in range(2, 14, 3):   # 扶手（右邊那面牆）
        za_ = z - (k - 0.5) * T_; xf.cyl(acc(M['metal']), (x1 - 0.06, k * R_ + 0.9, za_), (x1 - 0.06, (k + 3) * R_ + 0.9, za_ - 3 * T_), 0.02, seg=6)
    for zz in (z - 0.6, z - 2.4):
        q = xf.p(x0 + 0.08, 2.4 + (z - zz) * 0.5, zz); acc(M['bulb']).sphere(q, 0.07, seg=8, rings=4)
        CL.glow(root, 'xs_stairlamp', q[0], q[1], q[2], color='rgba(255,214,150,1)', size=0.8, day=0.2, night=0.85)


def xs_window(spec, xf, w):
    """新生南路二樓（山嵐、同弦、運動廣場、大口漢堡）：整排玻璃，後面 0.5 m 是參考圖二樓的店內；solid＝南洋戲院那種一整片字的外牆（貼圖直接在牆面上）"""
    x0, x1, y0, y1 = w['x'] - w['w'] / 2, w['x'] + w['w'] / 2, w['y0'], w['y1']
    if w.get('blank'): return   # 這一段不開窗（牆在 wz_street.apartment 用同一種外牆補滿）
    if w.get('solid'):
        xf.box(acc(M['gwall']), x0, x1, y0, y1, -0.25, -0.01); _xq(xf, w['tex'], x0, x1, y0, y1, 0.004, tiles=1); return
    fr = acc(frame_mat(w.get('frame') or '#2a2a28'))
    _xq(xf, w['tex'], x0, x1, y0, y1, -0.55, tiles=w.get('tiles'))
    xf.box(acc(frame_mat('#e8e2d6')), x0, x1, y0 - 0.02, y0, -0.55, -0.1); xf.box(acc(frame_mat('#e8e2d6')), x0, x1, y1, y1 + 0.02, -0.55, -0.1)
    xf.quad(acc(M['glass']), [(x0, y0, -0.1), (x1, y0, -0.1), (x1, y1, -0.1), (x0, y1, -0.1)])
    for (a, b) in ((x0, x0 + 0.06), (x1 - 0.06, x1)): xf.box(fr, a, b, y0, y1, -0.14, -0.06)
    xf.box(fr, x0, x1, y0, y0 + 0.06, -0.14, -0.06); xf.box(fr, x0, x1, y1 - 0.06, y1, -0.14, -0.06)
    n = max(1, round((x1 - x0) / w.get('pane', 1.4)))
    for i in range(1, n): xx = x0 + i * (x1 - x0) / n; xf.box(fr, xx - 0.03, xx + 0.03, y0, y1, -0.13, -0.07)
    xf.box(acc(M['band']), x0 - 0.06, x1 + 0.06, y0 - 0.06, y0, -0.25, 0.06)


def shutter_v2(spec, xf, W, rec):
    """拉下鐵捲門的店（空店面）：鐵捲門照舊＋紙條（招租、暫停營業）"""
    sf = spec['sf']
    for (cn, x, y, w, h) in sf.get('notes', []): note(xf, cn, x, y, w, h, -rec + 0.06)
    for it in sf.get('clutter', []):
        k, x, z = it[0], it[1], it[2]; inst(PROTO[k], f'sk_{k}_{spec["id"]}', xf, x, 0.0, -rec + z)


# ---------------- 店裡（玻璃後面 2.6 m 深的立體淺店內；取代平面的景深卡 INTERIOR_FACE）----------------
# 使用者：「招牌字體太假」「不要很像積木」——街上最假的剩下玻璃後面那張平面的店內圖。改成真的有深度的店：櫃台、貨架、桌椅、燈。
DI = 2.6


def books_mat():
    m = bpy.data.materials.new('wz_in_books'); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.7
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, 'wz_books_spines.jpg'), check_existing=True)   # lawlib_books.png 縮成 768 的 JPG（小一半以上）
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); return m


def _tex_unlit(m, name=None):
    """貼圖材質改成不受場景光（Image Texture → 輸出）"""
    nt = m.node_tree; tx = [n for n in nt.nodes if n.type == 'TEX_IMAGE'][0]
    for n in list(nt.nodes):
        if n.type not in ('OUTPUT_MATERIAL', 'TEX_IMAGE'): nt.nodes.remove(n)
    nt.links.new(tx.outputs['Color'], nt.nodes['Material Output'].inputs['Surface'])
    if name: m.name = name
    return m


IN_MAT = {}
def in_mat(key):
    if key not in IN_MAT:
        IN_MAT[key] = {'books': lambda: _tex_unlit(books_mat(), 'wz_in_books_u'), 'price': lambda: _tex_unlit(_img_mat('wz_in_price_u', 'print_price.png', rough=0.6)),
                       'board': lambda: _tex_unlit(_img_mat('wz_in_board_u', 'brunch_board.png', rough=0.85)), 'menu_tea': lambda: SK['menu_tea']}[key]()   # 店內的貼圖也不受場景光（2026-10-23，見 IN_VC）
    return IN_MAT[key]


def uvq(name, mat, px, pts, uv):
    uvquad(name, mat, [px.p(*q) for q in pts], uv)


# ---- 商品（2026-10-23 LAWWW2-B；使用者：「公館店面外觀也一樣醜」）：藥局、便利商店的貨架原本是單色小方塊排成格子，隔著玻璃看像一張色票。
# 改用 cvs_goods.py（便利商店室內那一套）的包裝貼圖集＋形狀：瓶子、罐子、袋子、盒子、黑膠封套；整條街的商品一個網格、一張 1024 的貼圖（一次 draw call）
import cvs_goods as CG   # noqa: E402
_GOODS = {}


def goods():
    if 'g' not in _GOODS:
        import tempfile
        from PIL import Image
        full = CG.make_atlas(os.path.join(tempfile.gettempdir(), 'wz_goods_atlas_full.png')); out = os.path.join(GEN, 'wz_goods_atlas.jpg')
        Image.open(full).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(out, quality=88)   # 隔著玻璃 3～8 m：一格 64 px 就夠
        m = bpy.data.materials.new('wz_in_goods'); m.use_nodes = True; nt = m.node_tree   # 不受場景光（和店內一樣，見 IN_VC）
        for n in list(nt.nodes):
            if n.type != 'OUTPUT_MATERIAL': nt.nodes.remove(n)
        tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(out); tx.image.pack(); nt.links.new(tx.outputs['Color'], nt.nodes['Material Output'].inputs['Surface'])
        _GOODS['g'] = CG.Goods('sk_goods', m, lod=1); _GOODS['rng'] = random.Random(23)
    return _GOODS['g']


def goods_finish():
    """wz_street.py 在合併材質以前呼叫：整條街的商品收成一個網格"""
    if 'g' in _GOODS: _GOODS['g'].finish(root, 'sk_goods'); _GOODS.clear()


def _gframe(xf):
    """店的 +z（朝街）在世界座標是哪一面、貨架沿哪一軸"""
    c, s = round(math.cos(xf.ry)), round(math.sin(xf.ry))
    return {(1, 0): '+z', (-1, 0): '-z', (0, 1): '+x', (0, -1): '-x'}[(c, s)], ('x' if c != 0 else 'z')


def gshelf(xf, la0, la1, y, lfront, cats, hmax, rail=True, facings=(2, 4)):
    """一層商品（店的座標）：la0～la1 沿貨架、lfront＝商品正面（朝街）；價格標籤貼在層板前緣（正面再往外 3.6 cm）"""
    G = goods(); face, axis = _gframe(xf); p0, p1, pt = xf.p(la0, y, lfront), xf.p(la1, y, lfront), xf.p(la0, y, lfront + 0.036)
    if axis == 'x': a0, a1, fd, td = min(p0[0], p1[0]), max(p0[0], p1[0]), p0[2], pt[2]
    else: a0, a1, fd, td = min(p0[2], p1[2]), max(p0[2], p1[2]), p0[0], pt[0]
    G.shelf(a0, a1, y, fd, face, axis, cats, hmax, _GOODS['rng'], rail_y=(y if rail else None), facings=facings, tag_d=td)


def gbox(xf, x0, x1, y0, y1, z0, z1, cell):
    """一個盒子（店的座標），+z 那一面（朝街）貼包裝"""
    face, _ = _gframe(xf); a, b = xf.p(x0, y0, z0), xf.p(x1, y1, z1)
    goods().box(min(a[0], b[0]), max(a[0], b[0]), y0, y1, min(a[2], b[2]), max(a[2], b[2]), face, cell)


def _unlit_vc(name):
    """不受場景光的頂點色材質（glTF KHR_materials_unlit；three.js 是 MeshBasicMaterial）：頂點色就是畫面上的顏色"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL': nt.nodes.remove(n)
    vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'; nt.links.new(vc.outputs['Color'], nt.nodes['Material Output'].inputs['Surface'])
    m.use_backface_culling = False; return m   # 雙面：Mesh.cyl／lathe 的蓋子有的朝內（第一版單面：腳踏車行輪胎的黑色胎面不見了）


# 店內（玻璃後面）用的材質：不受場景光。2026-10-23 公館騎樓下第一次試（受光的頂點色＋照深度變暗）：騎樓底下只有環境光，店裡比騎樓還暗、像打烊（10-18 試做立體店內「書店一片黑」也是這個原因）。
# 真的從騎樓、街上看進開著燈的店，店裡是被店自己的燈照亮的，白天晚上都一樣亮 → 店內的牆、天花板、地板、櫃台、貨架、小道具都畫進 unlit 的頂點色網格，明暗由 _shade_interior 決定
WARM_T = tuple(c ** 2.2 for c in (1.0, 0.95, 0.86)); COOL_T = tuple(c ** 2.2 for c in (0.98, 0.99, 1.0))   # 燈光的顏色：暖黃（麵店、咖啡、書店…）、白光（便利商店、藥局、洗衣…）
IN_VC = _unlit_vc('wz_in_shop')   # 名稱 wz_in_ 開頭：遊戲不畫影子（zones3d.js WZ_NO_SHADOW；店在室內，太陽照不到）
FLOOR_VC = {'f_white': ('#d6d4cd', 0.6, 'tile'), 'f_wood': ('#cdb594', 0.18, 'plank'), 'f_mosaic': ('#a3aba7', 0.3, 'tile'), 'f_granite': ('#a29f9a', 0.6, 'tile'),
            'f_terrazzo': ('#b3a99b', 0.6, 'tile'), 'f_oak': ('#b08a62', 0.18, 'plank'), 'f_cream': ('#ddd5c2', 0.6, 'tile'), 'f_concrete': ('#9c9891', 1.2, 'tile'), 'f_quarry': ('#a8634b', 0.3, 'tile'), 'f_floral': ('#b8ac96', 0.3, 'tile')}


class _CP:
    """店裡的小道具（湯鍋、碗、凳腳、輪胎…）畫進店內的頂點色網格，顏色＝原本材質的顏色（原本各自用受光的共用材質，在騎樓下發黑）"""
    def __init__(self, cm, col): self.cm, self.col = cm, col

    def _w(self, fn, *a, **k):
        n0 = len(self.cm.bm.faces); getattr(Mesh, fn)(self.cm, *a, **k); self.cm.bm.faces.ensure_lookup_table()
        self.cm.paint([self.cm.bm.faces[i] for i in range(n0, len(self.cm.bm.faces))], self.col); return self

    def box(self, *a, **k): return self._w('box', *a, **k)
    def cyl(self, *a, **k): return self._w('cyl', *a, **k)
    def sphere(self, *a, **k): return self._w('sphere', *a, **k)
    def add_bm(self, *a, **k): return self._w('add_bm', *a, **k)


def _floor_vc(cm, xf, iw, zb, zf, y0, flo, rr):
    """店內地板（頂點色）：一塊塊磁磚或木條，每塊深淺差一點（原本是和騎樓共用的 PBR 地磚貼圖、受光）"""
    col, t, kind = FLOOR_VC.get(flo, FLOOR_VC['f_white'])
    xf_vbox(cm, xf, -iw / 2, iw / 2, 0.0, y0 - 0.004, zb, zf, col, k=0.8)
    nx = max(1, round(iw / t)); nz = 1 if kind == 'plank' else max(1, round((zf - zb) / t)); var = 0.08 if kind == 'plank' else 0.045
    for i in range(nx):
        for j in range(nz):
            x0, x1 = -iw / 2 + i * iw / nx, -iw / 2 + (i + 1) * iw / nx; z0, z1 = zb + j * (zf - zb) / nz, zb + (j + 1) * (zf - zb) / nz
            fs = cm.poly([xf.p(x0, y0, z1), xf.p(x1, y0, z1), xf.p(x1, y0, z0), xf.p(x0, y0, z0)], col, 1.0 + rr.uniform(-var, var))
            fs[0].normal_update()
            if fs[0].normal.z < 0: bmesh.ops.reverse_faces(cm.bm, faces=fs)


def _shade_interior(cm, xf, iw, gz, yt, bright=1.0, warm=False):
    """店裡的光（2026-10-23）：越裡面越暗、天花板和牆角暗一點、地上的東西底部暗一點。
    原本店裡的牆、櫃台都是接近白色，在遊戲的環境光下和騎樓一樣亮——從街上看像一張貼在玻璃後面的白紙，看不出是室內。
    真的從亮的街上看進店裡，店內比外面暗、越裡面越暗，亮的是燈和冰箱。只改頂點色（店裡的牆、櫃台、貨架），燈、冰箱背板、商品不變"""
    bx = getattr(xf, 'xf', xf); ox = getattr(xf, 'ox', 0.0); c, s = bx.c, bx.s
    for f in cm.bm.faces:
        for lp in f.loops:
            co = lp.vert.co; gx, gy, gw = co.x, co.z, -co.y
            dx, dz = gx - bx.px, gw - bx.pz; lx = dx * c - dz * s - ox; lz = dx * s + dz * c
            d = min(1.0, max(0.0, (gz - lz) / DI)); k = 0.95 - 0.27 * d ** 0.85                # 玻璃後面 0.95 → 後牆 0.68（unlit：頂點色就是畫面上的顏色，再乘遊戲的曝光 1.3）
            if gy > yt - 0.02: k *= 0.86                                                    # 天花板
            k *= 0.9 + 0.1 * min(1.0, max(0.0, (iw / 2 - abs(lx)) / 0.6))                   # 兩側的牆角
            k *= 0.88 + 0.12 * min(1.0, max(0.0, gy - 0.15) / 0.35)                          # 貼地的部分
            k = (k * bright) ** 2.2; col = lp[cm.col]; t = WARM_T if warm else COOL_T
            lp[cm.col] = (col[0] * k * t[0], col[1] * k * t[1], col[2] * k * t[2], col[3])


def _copier(vb, x, zc, w, d, h, yb, size):
    """店裡的影印機（ADE-V2.1，BB_255 第 3 點：v2 像白色方盒）。正面朝玻璃（+z）、右邊是 +x。
    底座 → 紙匣（縫＋深色把手）→ 機身中間的出紙口（暗色凹槽、出紙盤、一疊紙）→ 掃描器 → 自動送紙器（深色進紙頭、兩段的進紙盤、原稿）
    → 右前方凸出的操作面板（亮藍螢幕、綠色開始鍵）；L＝大台（左邊裝訂出紙器、兩層出紙盤）、M＝中台（右邊手送紙盤）、S＝桌上型"""
    CW, CG, CD, PAP = '#e8e8e3', '#c9ccce', '#3a3e44', '#fbfaf4'
    x0, x1, zb_, zf = x - w / 2, x + w / 2, zc - d / 2, zc + d / 2
    nd = {'L': 3, 'M': 2, 'S': 1}[size]; hl = h * (0.42 if size == 'S' else 0.56); gap = {'L': 0.13, 'M': 0.11, 'S': 0.08}[size]
    vb(x0 + 0.03, x1 - 0.03, yb, yb + 0.05, zb_ + 0.03, zf - 0.03, CD)                                      # 底座（深灰、往裡縮）
    vb(x0, x1, yb + 0.05, yb + hl, zb_, zf, CW, r=0.012)                                                      # 下半部：紙匣
    dh = (hl - 0.07) / nd
    for k in range(nd):
        yk = yb + 0.06 + k * dh
        vb(x0 + 0.02, x1 - 0.02, yk + dh - 0.012, yk + dh, zf, zf + 0.006, '#9a9ea3')                       # 紙匣之間的縫
        vb(x - 0.12, x + 0.12, yk + dh - 0.06, yk + dh - 0.035, zf, zf + 0.014, '#5a5e64')                  # 把手
    yg0, yg1 = yb + hl, yb + hl + gap                                                                          # 機身中間的出紙口：右邊一根直柱連上下，左前方開口
    vb(x0 + 0.1, x1 - 0.16, yg0, yg1, zb_ + 0.02, zf - 0.12, '#5c6168')
    vb(x1 - 0.16, x1, yg0, yg1, zb_, zf, CW)
    vb(x0 + 0.06, x1 - 0.22, yg0, yg0 + 0.018, zb_ + 0.06, zf - 0.08, '#d9dcdc')                            # 出紙盤
    vb(x0 + 0.1, x1 - 0.3, yg0 + 0.018, yg0 + 0.04, zb_ + 0.1, zf - 0.14, PAP)                              # 剛印好的一疊紙
    vb(x0, x1, yg1, yb + h, zb_, zf, CW, r=0.012)                                                             # 掃描器
    vb(x0 + 0.02, x1 - 0.02, yb + h, yb + h + 0.02, zb_ + 0.02, zf - 0.03, CD)                              # 蓋子和機身之間的深色縫
    ya = yb + h + 0.02
    vb(x0 + 0.03, x1 - 0.03, ya, ya + 0.06, zb_ + 0.03, zf - 0.05, CG, r=0.008)                             # 自動送紙器
    vb(x1 - 0.2, x1 - 0.03, ya + 0.06, ya + 0.1, zb_ + 0.03, zf - 0.05, CD, r=0.008)                        # 進紙頭（深色）
    vb(x0 + 0.05, x1 - 0.22, ya + 0.06, ya + 0.075, zb_ + 0.06, zf - 0.08, CG)                              # 進紙盤：兩段，往左高一點
    vb(x0 + 0.05, x0 + 0.05 + (w - 0.27) * 0.45, ya + 0.075, ya + 0.09, zb_ + 0.06, zf - 0.08, CG)
    vb(x0 + 0.08, x1 - 0.3, ya + 0.075, ya + 0.095, zb_ + 0.09, zf - 0.11, PAP)                             # 原稿
    pw = 0.22 if size == 'S' else 0.3                                                                          # 操作面板：右前方凸出 10 cm
    vb(x1 - pw - 0.03, x1 - 0.03, yb + h - 0.08, yb + h - 0.01, zf - 0.06, zf + 0.1, '#2c2f34', r=0.008)
    vb(x1 - pw, x1 - 0.1, yb + h - 0.01, yb + h - 0.004, zf - 0.03, zf + 0.08, '#8fb8de')                   # 亮藍的螢幕
    vb(x1 - 0.08, x1 - 0.05, yb + h - 0.01, yb + h - 0.002, zf + 0.02, zf + 0.05, '#4caf50')                 # 綠色開始鍵
    if size == 'L':                                                                                            # 左邊：裝訂出紙器（兩層出紙盤＋紙）
        fx0, fx1 = x0 - 0.26, x0 - 0.01
        vb(fx0, fx1, yb, yb + h * 0.88, zb_ + 0.04, zf - 0.04, CW, r=0.01); vb(fx0 + 0.02, fx1 - 0.02, yb, yb + 0.05, zb_ + 0.06, zf - 0.06, CD)
        for yy in (yb + h * 0.45, yb + h * 0.7):
            vb(fx0 - 0.16, fx0, yy, yy + 0.02, zb_ + 0.1, zf - 0.1, CG); vb(fx0 - 0.14, fx0 - 0.01, yy + 0.02, yy + 0.05, zb_ + 0.13, zf - 0.13, PAP)
    elif size == 'M':                                                                                          # 右邊：手送紙盤
        yt_ = yb + hl * 0.8
        vb(x1, x1 + 0.2, yt_, yt_ + 0.015, zc - 0.16, zc + 0.16, CG); vb(x1, x1 + 0.17, yt_ + 0.015, yt_ + 0.025, zc - 0.13, zc + 0.13, PAP)


def _l118_oven(spec, xf, cm, iw, zb, y0, yt):
    """迪倫窯烤披薩：窗內左邊的磚砌圓頂窯爐（參考圖；使用者的規格「小型窯爐」）——圓頂、磚拱的爐口裡有火、不鏽鋼排煙管、前面的製作檯"""
    vb = lambda *a, **k: xf_vbox(cm, xf, *a, **k)
    ox = spec['sf']['oven']; oz = zb + 0.85; cq = lambda col: _CP(cm, col); pl = spec['sf'].get('oven_prep', 1)   # oven_prep −1＝製作檯在窯爐左邊
    vb(ox - 0.85, ox + 0.85, y0, y0 + 0.95, zb + 0.05, zb + 1.6, '#8e4a36', r=0.01)
    cq('#cbbba6').sphere(xf.p(ox, y0 + 0.95, oz), 0.78, seg=16, rings=8, sy=0.82)
    for k in range(9): a_ = math.pi * k / 8; cq('#a8523a').sphere(xf.p(ox + math.cos(a_) * 0.36, y0 + 0.97 + math.sin(a_) * 0.34, oz + 0.72), 0.075, seg=6, rings=4)   # 爐口的磚拱
    vb(ox - 0.3, ox + 0.3, y0 + 0.97, y0 + 1.25, oz + 0.6, oz + 0.74, '#1a1210', r=0)
    acc(SK['lamp_red']).sphere(xf.p(ox - 0.08, y0 + 1.03, oz + 0.7), 0.11, seg=8, rings=4); acc(SK['lamp']).sphere(xf.p(ox + 0.1, y0 + 1.02, oz + 0.72), 0.07, seg=8, rings=4)
    CL.glow(root, 'oven', *xf.p(ox, y0 + 1.1, oz + 0.9), color='rgba(255,150,70,1)', size=1.3, day=0.5, night=0.95)
    xf.cyl(acc(SK['steel']), (ox - 0.2, y0 + 1.5, oz - 0.2), (ox - 0.2, yt, oz - 0.2), 0.14, seg=10)
    px0, px1 = (ox + 1.0, min(iw / 2 - 0.2, ox + 2.6)) if pl > 0 else (ox - 2.2, ox - 1.0)
    vb(px0, px1, y0, y0 + 0.9, zb + 0.9, zb + 1.5, '#b9bdc0', r=0.01)                                              # 製作檯＋麵團、配料盒
    for k in range(4): cq('#f1e6cc').sphere(xf.p(px0 + 0.2 + k * 0.2, y0 + 0.95, zb + 1.2), 0.07, seg=8, rings=4, sy=0.6)


# ---- 118 巷九間店的淺店內（L118-STREET-FIX-1111，BB_341 第 1 項「玻璃後面是一排紅色方塊……和新室內對不上」；LAWWW 的子代理代 LAWWW2，2026-11-11）----
# 原本九間店用舊店型的淺店內（麵店＝後牆一排紅紙菜單、自助餐＝白板上一排紅條），和 11-11 換過的新室內沒有關係。
# 現在：後牆那一面貼 l118_peek_tex.py 算的圖——新室內的 GLB（l118_<id>.glb）從街上看進去、玻璃後面 2.6 m 以後的整間店（桌椅、櫃台、廚房、牆上的東西都在真正的位置）；
#   玻璃後面 2.6 m 以內是立體的：地板、側牆、天花板的顏色取自那張圖的邊緣（接得起來），再照這間店新室內的桌椅樣子放一兩組桌椅（L118_FRONT）。
#   室內重做以後：重跑 l118_peek_tex.py（圖）→ wz_street.py --set lane118；桌椅的樣子要換就改 L118_FRONT。
_L118_PEEK = {}
def l118_peek():
    if not _L118_PEEK:
        fn = os.path.join(GEN, 'l118_peek_atlas.json'); _L118_PEEK['d'] = _json.load(open(fn, encoding='utf-8')) if os.path.exists(fn) else {}
        if _L118_PEEK['d']: _L118_PEEK['m'] = _tex_unlit(_img_mat('wz_in_l118_peek', 'l118_peek_atlas.jpg', rough=0.8), 'wz_in_l118_peek_u')
    return _L118_PEEK['d']


# 玻璃後面那 2.6 m 的桌椅（本地 x、離玻璃多遠 dz；o＝椅子擺在桌子的哪兩邊：'x' 左右、'z' 前後）。樣子照各店的新室內（l118_peek_tex.py 的圖、BB_341 第二節）：
#   118牛排 深咖啡木桌椅｜水上便當 靠牆的不鏽鋼吧台＋圓凳｜辛亥韓食 深色卡座｜五湖四海 不鏽鋼桌＋咖啡色圓凳｜大學食堂 白桌＋橘色椅｜義大麵屋、奈良咖哩 木桌椅｜清州刀削麵 淺灰桌面黑框桌＋黑椅（第 3 版對過）｜迪倫 黑鐵腳木桌（窯爐、製作檯照舊）
# 門後面留空（門的位置照 SF_L118 的 door_x、door_w）。warm＝燈光的顏色
# 室內第 3 版（L118-PEEK-V3-1111，LAWWW 的子代理；LAWWW2 的 118牛排、水上便當、清州刀削麵、辛亥韓食第 3 版）：這四間照新室內的 l118_<id>.layout.json 前 2.6 m 擺
#   （本地 x＝室內 x × 約 0.97：圖是室內寬 − 0.12 m 貼到店面寬 − 0.69 m）。sets 第 4 格（可省）：sides＝椅子放哪幾邊（−1／+1）、pair＝每邊兩張椅子時左右各偏多少
#   118牛排：西排第三桌讓給自助台（濃湯桶、紅茶桶、紅色杯架；soup）、東牆一張靠牆的桌子只有西邊一張椅子、東牆門邊的餐具台（cutlery）
#   水上便當：右前方一張不鏽鋼桌＋兩張圓凳（第 2 版就有，原本漏了）；拉長的吧台和四張圓凳在 2.67 m 以後（圖上）
#   清州刀削麵：門左邊製麵台後面那一桌（四張椅子，前後各兩張）；右前方的吊扇（fan；室內的吊扇比街上淺店內的天花板高，放在天花板下）
#   辛亥韓食：卡座照室內往裡面移 0.4 m（後面那張卡座的靠背剛好接到圖上）
L118_FRONT = {
    'dian': dict(warm=False, top='#4f3628', leg='#2c2624', seat='#3a2a22', line=('#c8323a', 1.72, 0.05), sets=[(2.25, 2.1, 'x', dict(sides=(-1,)))], tw=0.8, td=0.66,
                 soup=(0.85, 2.35, 0.6), cutlery=(0.42, 1.17, 0.38)),
    'self': dict(warm=False, line=('#f2b824', 1.22, 0.06), top='#d4d6d8', leg='#2a2a2c', seat='#c4c7ca', stool=True, stool_leg='#9aa0a6', sets=[(1.95, 1.9, 'x')], tw=0.74, td=0.64),
    'tea': dict(warm=True, top='#5a3c2c', leg='#2a2422', booth='#2b2523', wains=('#7a2a26', 1.0), sets=[(0.72, 1.8, 'z')], tw=0.75, td=0.55),
    'home': dict(warm=True, top='#c4c8cc', leg='#9aa0a6', seat='#a8623c', stool=True, sets=[(-2.6, 1.35, 'x'), (-0.7, 1.35, 'x')], tw=0.75, td=0.7),
    'cafe2': dict(warm=False, top='#d9b98a', leg='#2c2c2e', seat='#5a5d62', buffet=0.92, sets=[(-1.1, 1.35, 'x')], tw=0.75, td=0.7),
    'pasta': dict(warm=True, top='#c9a070', leg='#8a6a48', seat='#b48a5e', sets=[(-2.6, 1.3, 'x'), (-0.8, 1.3, 'x')], tw=0.7, td=0.7),
    'korea': dict(warm=False, top='#cfd0cd', leg='#222224', seat='#2a2a2c', line=('#c8323a', 1.9, 0.05), sets=[(0.39, 1.55, 'z', dict(pair=0.25))], tw=1.0, td=0.74, fan=(1.56, 1.65)),
    'omu': dict(warm=True, top='#5a3a26', leg='#3a2618', seat='#4a3020', wains=('#4a3020', 0.95), sets=[(-2.3, 1.3, 'x'), (-0.7, 1.3, 'x')], tw=0.7, td=0.7),
    'noodle2': dict(warm=True, top='#a87a4e', leg='#222224', seat='#2c2c2e', sets=[(-2.6, 1.1, 'z')], tw=0.65, td=0.65),
}


def _pk_chair(vb, x, z, y0, col, leg, back):
    """餐椅：座面、四支腳、兩支背柱＋靠背板。back＝靠背在哪一邊（'+x'｜'-x'｜'+z'｜'-z'）"""
    vb(x - 0.2, x + 0.2, y0 + 0.43, y0 + 0.47, z - 0.2, z + 0.2, col, r=0.012)
    for sx in (-0.17, 0.17):
        for sz in (-0.17, 0.17): vb(x + sx - 0.018, x + sx + 0.018, y0, y0 + 0.43, z + sz - 0.018, z + sz + 0.018, leg, r=0)
    ax = back[1]; sg = 1 if back[0] == '+' else -1
    for t in (-0.17, 0.17):
        if ax == 'x': vb(x + sg * 0.19 - 0.018, x + sg * 0.19 + 0.018, y0 + 0.47, y0 + 0.88, z + t - 0.018, z + t + 0.018, leg, r=0)
        else: vb(x + t - 0.018, x + t + 0.018, y0 + 0.47, y0 + 0.88, z + sg * 0.19 - 0.018, z + sg * 0.19 + 0.018, leg, r=0)
    if ax == 'x': vb(x + sg * 0.19 - 0.014, x + sg * 0.19 + 0.014, y0 + 0.66, y0 + 0.86, z - 0.17, z + 0.17, col, r=0.008)
    else: vb(x - 0.17, x + 0.17, y0 + 0.66, y0 + 0.86, z + sg * 0.19 - 0.014, z + sg * 0.19 + 0.014, col, r=0.008)


def _pk_stool(cp, xf, x, z, y0, col, leg):
    """圓凳：圓座面＋四支微微外張的腳＋一圈橫桿"""
    _lathe(cp(col), xf, [(0.0, 0.0), (0.16, 0.0), (0.17, 0.02), (0.16, 0.045), (0.0, 0.045)], x, y0 + 0.42, z, seg=12)
    for k in range(4):
        a_ = math.pi / 4 + k * math.pi / 2; xf_cyl(cp(leg), xf, (x + math.cos(a_) * 0.15, y0, z + math.sin(a_) * 0.15), (x + math.cos(a_) * 0.11, y0 + 0.42, z + math.sin(a_) * 0.11), 0.013, seg=5)
    _lathe(cp(leg), xf, [(0.125, 0.0), (0.137, 0.0), (0.137, 0.012), (0.125, 0.012)], x, y0 + 0.16, z, seg=10)


def l118_peek_interior(spec, xf, iw, gz, ih, bright=0.8):
    sid = spec['lane118']; pk = l118_peek()[sid]; F = L118_FRONT.get(sid, {}); sf = spec.get('sf', {})
    pid = spec['id']; y0 = 0.15; yt = ih + 0.15; zb = gz - DI; gzf = gz - 0.012; cm = L.CMesh(f'sk_in_{pid}', IN_VC); cp = lambda col: _CP(cm, col)
    rr = random.Random(sum(ord(c) for c in pid) * 31); vb = lambda *a, **k: xf_vbox(cm, xf, *a, **k); warm = F.get('warm', False)
    FLOOR_VC['_pk_' + sid] = (pk['floor'], 0.6, 'tile'); _floor_vc(cm, xf, iw, zb, gzf, y0, '_pk_' + sid, rr)
    vb(-iw / 2, iw / 2, y0, yt, zb - 0.05, zb, pk['wall'], r=0)
    for sx in (-1, 1): vb(sx * iw / 2 - 0.047, sx * iw / 2 + 0.047, y0, yt, zb, gzf, pk['wall'], r=0)
    vb(-iw / 2, iw / 2, yt, yt + 0.05, zb, gzf, pk['ceil'], r=0)
    if F.get('wains'):   # 側牆的腰板（辛亥韓食的深紅）
        wc, wh = F['wains']
        for sx in (-1, 1): vb(sx * (iw / 2 - 0.047) - 0.012, sx * (iw / 2 - 0.047) + 0.012, y0, y0 + wh, zb, gzf, wc, r=0)
    if F.get('line'):    # 側牆上的一條色帶（118牛排、清州刀削麵的紅線，水上便當的黃線；接圖上的那一條）
        lc, ly, lh = F['line']
        for sx in (-1, 1): vb(sx * (iw / 2 - 0.047) - 0.008, sx * (iw / 2 - 0.047) + 0.008, y0 + ly, y0 + ly + lh, zb, gzf, lc, r=0)
    if F.get('buffet'):   # 大學食堂：左邊的自助餐台從圖上一路接到玻璃前面（不鏽鋼保溫台、兩排菜盤、防噴罩）
        bx0, bx1, bz0, bz1 = -iw / 2 + 0.06, -iw / 2 + F['buffet'], zb, gz - 0.55; n_ = max(3, int((bz1 - bz0 - 0.1) / 0.38))
        vb(bx0, bx1, y0, y0 + 0.86, bz0, bz1, '#c9ccce', r=0.01)
        for j in range(n_):
            zc = bz0 + 0.1 + (j + 0.5) * (bz1 - bz0 - 0.2) / n_
            for r_ in range(2):
                xc = bx0 + 0.22 + r_ * 0.38
                vb(xc - 0.17, xc + 0.17, y0 + 0.86, y0 + 0.88, zc - 0.17, zc + 0.17, '#d9dcde', r=0); vb(xc - 0.15, xc + 0.15, y0 + 0.88, y0 + 0.9, zc - 0.15, zc + 0.15, rr.choice(['#7a9a3a', '#c9822e', '#e8d9a8', '#8a4a2a', '#d4a03a', '#3f6a2f', '#e6c060', '#b05a3a']), r=0)
        for z_ in (bz0 + 0.03, (bz0 + bz1) / 2, bz1 - 0.03): vb(bx1 - 0.05, bx1 - 0.02, y0 + 0.9, y0 + 1.32, z_ - 0.015, z_ + 0.015, '#c9ccce', r=0)
        vb(bx0 + 0.3, bx1 - 0.02, y0 + 1.3, y0 + 1.33, bz0, bz1, '#c9ccce', r=0)
        xf.quad(acc(M['glass']), [(bx1 - 0.035, y0 + 0.98, bz0), (bx1 - 0.035, y0 + 0.98, bz1), (bx1 - 0.035, y0 + 1.3, bz1), (bx1 - 0.035, y0 + 1.3, bz0)])
    for lx in ([-iw / 4, iw / 4] if iw > 5 else [0.0]):
        xf.box(acc(M['tube']), lx - 0.5, lx + 0.5, yt - 0.03, yt, zb + DI * 0.45 - 0.05, zb + DI * 0.45 + 0.05)
        CL.glow(root, 'shopin', *xf.p(lx, yt - 0.3, zb + DI * 0.5), color='rgba(255,226,180,1)' if warm else 'rgba(244,250,255,1)', size=1.7, day=0.0, night=0.85)
    uvq(f'sk_in_peek_{pid}', _L118_PEEK['m'], xf, [(-iw / 2 + 0.047, y0, zb + 0.006), (iw / 2 - 0.047, y0, zb + 0.006), (iw / 2 - 0.047, yt, zb + 0.006), (-iw / 2 + 0.047, yt, zb + 0.006)], tuple(pk['uv']))
    tw, td = F.get('tw', 0.7), F.get('td', 0.7)
    for st_ in F.get('sets', []):
        tx, dz, o = st_[:3]; so = st_[3] if len(st_) > 3 else {}
        tz = gz - dz
        vb(tx - tw / 2, tx + tw / 2, y0 + 0.71, y0 + 0.75, tz - td / 2, tz + td / 2, F['top'], r=0.012)
        if F.get('booth'):   # 卡座：桌子一支中柱，前後各一張高背的長椅
            vb(tx - 0.04, tx + 0.04, y0, y0 + 0.71, tz - 0.04, tz + 0.04, F['leg'], r=0); vb(tx - 0.2, tx + 0.2, y0, y0 + 0.03, tz - 0.2, tz + 0.2, F['leg'], r=0)
            for sg in (-1, 1):
                bz = tz + sg * (td / 2 + 0.3); vb(tx - tw / 2 - 0.05, tx + tw / 2 + 0.05, y0, y0 + 0.45, bz - 0.22, bz + 0.22, F['booth'], r=0.02)
                vb(tx - tw / 2 - 0.05, tx + tw / 2 + 0.05, y0 + 0.45, y0 + 1.08, min(bz + sg * 0.14, bz + sg * 0.22), max(bz + sg * 0.14, bz + sg * 0.22), F['booth'], r=0.02)
            continue
        for sx in (-1, 1):
            for sz in (-1, 1): vb(tx + sx * (tw / 2 - 0.05) - 0.02, tx + sx * (tw / 2 - 0.05) + 0.02, y0, y0 + 0.71, tz + sz * (td / 2 - 0.05) - 0.02, tz + sz * (td / 2 - 0.05) + 0.02, F['leg'], r=0)
        pr = so.get('pair')
        for sg in so.get('sides', (-1, 1)):
            for off in ((-pr, pr) if pr else (0.0,)):
                cx_, cz_ = (tx + sg * (tw / 2 + 0.22), tz + off) if o == 'x' else (tx + off, tz + sg * (td / 2 + 0.22))
                if F.get('stool'): _pk_stool(cp, xf, cx_, cz_, y0, F['seat'], F.get('stool_leg', F['leg']))
                else: _pk_chair(vb, cx_, cz_, y0, F['seat'], F['leg'], ('+' if sg > 0 else '-') + o)
        for k_, c_ in enumerate(('#b3242a', '#2c2420')):   # 桌上的醬料瓶
            xf_cyl(cp(c_), xf, (tx - 0.06 + k_ * 0.1, y0 + 0.75, tz - 0.05), (tx - 0.06 + k_ * 0.1, y0 + 0.87, tz - 0.05), 0.022, seg=6)
    if F.get('bar'):   # 靠牆的不鏽鋼吧台＋圓凳（水上便當；新室內右邊那一段接過來）
        sd, col = F['bar']; sx = 1 if sd == 'R' else -1; bx = sx * (iw / 2 - 0.047)
        vb(min(bx, bx - sx * 0.42), max(bx, bx - sx * 0.42), y0 + 0.72, y0 + 0.76, zb + 0.25, gz - 0.55, col, r=0.008)
        for z_ in (zb + 0.4, gz - 0.7): vb(bx - sx * 0.4 - 0.015, bx - sx * 0.4 + 0.015, y0, y0 + 0.72, z_ - 0.015, z_ + 0.015, F['leg'], r=0)
        for (oz,) in F.get('stools', []): _pk_stool(cp, xf, bx - sx * 0.68, (zb + gz) / 2 + oz * 0.8, y0, F['seat'], F['leg'])
    wx = iw / 2 - 0.047   # 側牆的內面
    if F.get('soup'):   # 118牛排第 3 版：西牆的自助台（不鏽鋼台＋門口這邊高的紅褐色濃湯桶、裡面矮的不鏽鋼紅茶桶，各一張黃標籤）＋上面的紅色杯架
        d0, d1, dp = F['soup']; z0_, z1_ = gz - d1, gz - d0; x0_ = -wx; x1_ = -wx + dp
        vb(x0_, x1_, y0, y0 + 0.86, z0_, z1_, '#b9bdc0', r=0.01); vb(x0_, x1_ + 0.02, y0 + 0.86, y0 + 0.9, z0_ - 0.02, z1_ + 0.02, '#d2d5d7', r=0.006)
        vb(x1_ + 0.002, x1_ + 0.006, y0 + 0.12, y0 + 0.8, z0_ + 0.05, z1_ - 0.05, '#a3a7aa', r=0)                       # 台子正面的門板線
        for (dzc, rr_, hh, col, lid) in ((1.38, 0.19, 0.57, '#8a3a2a', '#3a2a24'), (1.95, 0.23, 0.37, '#b0b4b8', '#5a5d62')):
            ux, uz = x0_ + dp * 0.55, gz - dzc
            xf_cyl(cp(col), xf, (ux, y0 + 0.9, uz), (ux, y0 + 0.9 + hh, uz), rr_, seg=14)
            _lathe(cp(lid), xf, [(0.0, 0.0), (rr_ + 0.01, 0.0), (rr_ * 0.7, 0.05), (0.03, 0.08), (0.03, 0.11), (0.0, 0.11)], ux, y0 + 0.9 + hh, uz, seg=14)
            vb(ux + rr_ - 0.02, ux + rr_ + 0.005, y0 + 0.9 + hh * 0.45, y0 + 0.9 + hh * 0.8, uz - 0.1, uz + 0.1, '#f2c230', r=0)   # 黃標籤
            vb(ux + rr_, ux + rr_ + 0.07, y0 + 0.97, y0 + 1.0, uz - 0.015, uz + 0.015, '#2c2c2e', r=0)                       # 水龍頭
        vb(-wx, -wx + 0.26, y0 + 1.86, y0 + 1.9, z0_ + 0.05, z1_ - 0.1, '#b3242a', r=0)                                  # 紅色杯架
        for k in range(6): xf_cyl(cp('#f4f1ea'), xf, (-wx + 0.13, y0 + 1.9, z0_ + 0.18 + k * (z1_ - z0_ - 0.4) / 5), (-wx + 0.13, y0 + 1.99, z0_ + 0.18 + k * (z1_ - z0_ - 0.4) / 5), 0.04, seg=7)
    if F.get('cutlery'):   # 118牛排第 3 版：東牆門邊的餐具台（不鏽鋼矮櫃＋上面的餐具盒、杯子）
        d0, d1, dp = F['cutlery']; z0_, z1_ = gz - d1, gz - d0
        vb(wx - dp, wx, y0, y0 + 0.9, z0_, z1_, '#b9bdc0', r=0.01); vb(wx - dp - 0.003, wx - dp, y0 + 0.12, y0 + 0.82, z0_ + 0.04, z1_ - 0.04, '#a3a7aa', r=0)
        vb(wx - dp + 0.05, wx - 0.05, y0 + 0.9, y0 + 0.98, z0_ + 0.06, (z0_ + z1_) / 2, '#c9a070', r=0.006)
        for k in range(3): xf_cyl(cp('#f4f1ea'), xf, (wx - dp / 2, y0 + 0.9, (z0_ + z1_) / 2 + 0.1 + k * 0.1), (wx - dp / 2, y0 + 1.02, (z0_ + z1_) / 2 + 0.1 + k * 0.1), 0.035, seg=7)
    if F.get('fan'):   # 清州刀削麵第 3 版：天花板的吊扇（吊桿、馬達、四片扇葉）
        fx, fd = F['fan']; fz = gz - fd; fy = yt - 0.38
        xf_cyl(cp('#e8e8e6'), xf, (fx, fy + 0.08, fz), (fx, yt, fz), 0.02, seg=6)
        _lathe(cp('#e8e8e6'), xf, [(0.0, 0.0), (0.11, 0.0), (0.12, 0.04), (0.09, 0.09), (0.0, 0.09)], fx, fy, fz, seg=12)
        for (ax_, az_) in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if ax_: vb(fx + ax_ * 0.1 if ax_ > 0 else fx - 0.62, fx + 0.62 if ax_ > 0 else fx - 0.1, fy + 0.03, fy + 0.042, fz - 0.065, fz + 0.065, '#efefed', r=0)
            else: vb(fx - 0.065, fx + 0.065, fy + 0.03, fy + 0.042, fz + 0.1 if az_ > 0 else fz - 0.62, fz + 0.62 if az_ > 0 else fz - 0.1, '#efefed', r=0)
    if sf.get('oven'): _l118_oven(spec, xf, cm, iw, zb, y0, yt)
    _shade_interior(cm, xf, iw, gz, yt, bright, warm)
    cm.finish(root, uv=False)


def _lin_inside(cm, cp, vb, xf, iw, gz, zb, y0, yt, pid):
    """林家乾麵從街上看進去的那一面（WZ-LIN-STREET-REF-1112；使用者 11-12 附線上版截圖：「林家乾麵我明明有給參考圖 還這麼醜」——空的褐色牆、一排紅色方塊、紅藍塑膠凳）。
    照參考圖 wz_lin_ext（企劃線 ref_images/shops）：白牆＋白磁磚腰牆（上緣一條墨綠）、後牆木框窗、相框、兩支壁扇、月曆；木桌＋圓木凳三組；
    右後方不鏽鋼工作檯（疊碗、電鍋、水槽）和上面的層板；右前方滷味的玻璃菜櫃（一盤盤滷味）；後牆右邊一排紅紙菜單（紅紙條上有字和價錢的樣子，不是純紅方塊）"""
    WOODT, WOODL, STEEL, GRN = '#9a6a3c', '#5a3a22', '#b9bdc0', '#2f5a47'
    # 白磁磚腰牆（後牆、兩側牆）：磁磚縫、上緣墨綠
    vb(-iw / 2 + 0.05, iw / 2 - 0.05, y0, y0 + 1.25, zb, zb + 0.018, '#eef0ee', r=0); vb(-iw / 2 + 0.05, iw / 2 - 0.05, y0 + 1.25, y0 + 1.31, zb, zb + 0.024, GRN, r=0)
    for k in range(1, 5): vb(-iw / 2 + 0.05, iw / 2 - 0.05, y0 + k * 0.25 - 0.004, y0 + k * 0.25 + 0.004, zb + 0.018, zb + 0.021, '#c4c9c8', r=0)
    for k in range(1, int((iw - 0.1) / 0.25)): x_ = -iw / 2 + 0.05 + k * 0.25; vb(x_ - 0.004, x_ + 0.004, y0, y0 + 1.25, zb + 0.018, zb + 0.021, '#c4c9c8', r=0)
    for sx in (-1, 1):
        xw = sx * (iw / 2 - 0.047); a_, b_ = sorted((xw, xw - sx * 0.018)); vb(a_, b_, y0, y0 + 1.25, zb + 0.03, gz - 0.05, '#eef0ee', r=0); a2, b2 = sorted((xw, xw - sx * 0.024)); vb(a2, b2, y0 + 1.25, y0 + 1.31, zb + 0.03, gz - 0.05, GRN, r=0)
    # 後牆：木框窗（六格、裡面暗）、相框、月曆、兩支壁扇
    wx0, wx1, wy0, wy1 = -2.25, -0.75, y0 + 1.5, y0 + 2.4
    vb(wx0 - 0.06, wx1 + 0.06, wy0 - 0.06, wy1 + 0.06, zb, zb + 0.03, '#6a4a30', r=0); vb(wx0, wx1, wy0, wy1, zb + 0.03, zb + 0.034, '#4a5a62', r=0)
    for k in (1, 2): x_ = wx0 + (wx1 - wx0) * k / 3; vb(x_ - 0.02, x_ + 0.02, wy0, wy1, zb + 0.034, zb + 0.05, '#6a4a30', r=0)
    vb(wx0, wx1, (wy0 + wy1) / 2 - 0.02, (wy0 + wy1) / 2 + 0.02, zb + 0.034, zb + 0.05, '#6a4a30', r=0)
    vb(-0.35, 0.15, y0 + 1.75, y0 + 2.3, zb, zb + 0.03, '#3a2a1e', r=0); vb(-0.3, 0.1, y0 + 1.8, y0 + 2.25, zb + 0.03, zb + 0.034, '#e2d8c0', r=0); vb(-0.2, 0.0, y0 + 1.9, y0 + 2.12, zb + 0.034, zb + 0.037, '#8a9a7a', r=0)
    vb(0.45, 0.75, y0 + 1.7, y0 + 2.2, zb, zb + 0.012, '#f4f1e6', r=0); vb(0.45, 0.75, y0 + 2.05, y0 + 2.2, zb + 0.012, zb + 0.016, '#c0392b', r=0)
    for fx_ in (-3.0, 1.15):
        vb(fx_ - 0.05, fx_ + 0.05, y0 + 2.5, y0 + 2.62, zb, zb + 0.16, '#d9dcdc', r=0); xf_cyl(cp('#e4e7e7'), xf, (fx_, y0 + 2.5, zb + 0.16), (fx_, y0 + 2.5, zb + 0.24), 0.21, seg=14); xf_cyl(cp('#5a6068'), xf, (fx_, y0 + 2.5, zb + 0.24), (fx_, y0 + 2.5, zb + 0.25), 0.07, seg=8)
    # 後牆右邊：一排紅紙菜單（紅紙條、上面一格格深色的字、最下面黃色的價錢）
    for j in range(7):
        x_ = 1.55 + j * 0.27; vb(x_, x_ + 0.2, y0 + 1.55, y0 + 2.3, zb, zb + 0.008, '#c23a2c', r=0)
        for q in range(4): vb(x_ + 0.05, x_ + 0.15, y0 + 2.14 - q * 0.13, y0 + 2.24 - q * 0.13, zb + 0.008, zb + 0.011, '#2a1a14', r=0)
        vb(x_ + 0.04, x_ + 0.16, y0 + 1.6, y0 + 1.68, zb + 0.008, zb + 0.011, '#f0d060', r=0)
    # 右後方：不鏽鋼工作檯（水槽、疊碗、電鍋）＋上面一層層板（碗、調味料罐）
    cx0, cx1 = 0.9, iw / 2 - 0.25
    vb(cx0, cx1, y0, y0 + 0.86, zb + 0.03, zb + 0.6, STEEL, r=0.01); vb(cx0 - 0.02, cx1 + 0.02, y0 + 0.86, y0 + 0.9, zb + 0.03, zb + 0.63, '#cfd3d5', r=0)
    vb(cx0 + 0.15, cx0 + 0.75, y0 + 0.9, y0 + 0.905, zb + 0.12, zb + 0.5, '#8a9096', r=0)
    for k in range(4): _lathe(cp('#f2f0ea'), xf, [(0.0, 0.0), (0.05, 0.0), (0.11, 0.07), (0.105, 0.075)], cx0 + 1.1 + (k % 2) * 0.26, y0 + 0.9 + (k // 2) * 0.05, zb + 0.3)
    _lathe(cp('#e9e6dc'), xf, [(0.0, 0.0), (0.15, 0.0), (0.17, 0.2), (0.12, 0.27), (0.0, 0.28)], cx1 - 0.35, y0 + 0.9, zb + 0.32)
    vb(cx0 + 0.1, cx1 - 0.1, y0 + 1.36, y0 + 1.39, zb + 0.02, zb + 0.28, '#cfd3d5', r=0)
    for k in range(7): xf_cyl(cp(['#8a4a2a', '#f2f0ea', '#c0392b', '#3a2a1e', '#e8c860', '#f2f0ea', '#5a7a3a'][k]), xf, (cx0 + 0.25 + k * 0.28, y0 + 1.39, zb + 0.15), (cx0 + 0.25 + k * 0.28, y0 + 1.39 + 0.12 + (k % 3) * 0.03, zb + 0.15), 0.045, seg=8)
    # 右前方：滷味的玻璃菜櫃（不鏽鋼桌＋玻璃櫃，裡面兩層盤子）
    gx0, gx1, gz0, gz1 = 1.5, 3.0, gz - 0.95, gz - 0.4
    vb(gx0, gx1, y0, y0 + 0.82, gz0, gz1, STEEL, r=0.01); vb(gx0 - 0.02, gx1 + 0.02, y0 + 0.82, y0 + 0.86, gz0 - 0.02, gz1 + 0.02, '#cfd3d5', r=0)
    for (a_, b_) in ((gx0, gz0), (gx1 - 0.02, gz0), (gx0, gz1 - 0.02), (gx1 - 0.02, gz1 - 0.02)): vb(a_, a_ + 0.02, y0 + 0.86, y0 + 1.36, b_, b_ + 0.02, '#aeb3b6', r=0)
    vb(gx0, gx1, y0 + 1.36, y0 + 1.38, gz0, gz1, '#aeb3b6', r=0); vb(gx0 + 0.02, gx1 - 0.02, y0 + 1.1, y0 + 1.112, gz0 + 0.02, gz1 - 0.02, '#dfe4e6', r=0)
    FOOD = ['#8a4a2a', '#c9822e', '#5a3a22', '#e8d9a8', '#5a9a3a', '#b84a3a', '#d4a03a', '#f2efe8']
    for t_, yy in enumerate((y0 + 0.86, y0 + 1.112)):
        for k in range(5):
            x_ = gx0 + 0.08 + k * 0.28; vb(x_, x_ + 0.24, yy, yy + 0.02, gz0 + 0.06, gz1 - 0.06, '#e6e9ea', r=0)
            for q in range(3): vb(x_ + 0.03 + q * 0.065, x_ + 0.085 + q * 0.065, yy + 0.02, yy + 0.05 + ((k + q + t_) % 3) * 0.015, gz0 + 0.1 + (q % 2) * 0.1, gz0 + 0.24 + (q % 2) * 0.1, FOOD[(k * 2 + t_ * 3 + q) % len(FOOD)], r=0)
    gl_ = acc(M['glass'])
    xf.quad(gl_, [(gx0, y0 + 0.86, gz1), (gx1, y0 + 0.86, gz1), (gx1, y0 + 1.36, gz1), (gx0, y0 + 1.36, gz1)]); xf.quad(gl_, [(gx0, y0 + 0.86, gz0), (gx0, y0 + 0.86, gz1), (gx0, y0 + 1.36, gz1), (gx0, y0 + 1.36, gz0)])
    # 三組木桌＋圓木凳（參考圖左邊那一區）
    def stool(x, z):
        vb(x - 0.15, x + 0.15, y0 + 0.42, y0 + 0.46, z - 0.15, z + 0.15, '#8a5a34', r=0.008)   # 方的木凳面（圓柱的蓋子頂點色會掉成白的）
        for k in range(4): a_ = math.pi / 4 + k * math.pi / 2; xf_cyl(cp(WOODL), xf, (x + math.cos(a_) * 0.13, y0, z + math.sin(a_) * 0.13), (x + math.cos(a_) * 0.09, y0 + 0.42, z + math.sin(a_) * 0.09), 0.016, seg=4)
    for (tx, tz, w_, d_) in ((-2.75, zb + 0.95, 0.75, 0.75), (-1.1, zb + 1.05, 1.1, 0.7), (-2.4, gz - 0.7, 1.1, 0.7)):
        vb(tx - w_ / 2, tx + w_ / 2, y0 + 0.72, y0 + 0.76, tz - d_ / 2, tz + d_ / 2, WOODT, r=0.008)
        for sx in (-1, 1):
            for sz in (-1, 1): vb(tx + sx * (w_ / 2 - 0.06) - 0.022, tx + sx * (w_ / 2 - 0.06) + 0.022, y0, y0 + 0.72, tz + sz * (d_ / 2 - 0.06) - 0.022, tz + sz * (d_ / 2 - 0.06) + 0.022, WOODL, r=0)
        xf_cyl(cp('#c9a23a'), xf, (tx - 0.12, y0 + 0.76, tz), (tx - 0.12, y0 + 0.88, tz), 0.035, seg=8); vb(tx + 0.02, tx + 0.2, y0 + 0.76, y0 + 0.83, tz - 0.06, tz + 0.06, '#d8c9a0', r=0)   # 筷子筒、面紙盒
        for sx in (-1, 1): stool(tx + sx * (w_ / 2 + 0.22), tz + 0.05)
        if w_ > 1.0: stool(tx - 0.2, tz - d_ / 2 - 0.24); stool(tx + 0.25, tz + d_ / 2 + 0.24)


def shallow_interior(spec, xf, iw, gz, ih, bright=0.62):
    """玻璃後面的店（深 DI）：地板、牆、天花板、燈，加上每一種店自己的東西。
    bright：店內（unlit）的整體亮度（遊戲的曝光 ×1.3 也會乘上去）。曬得到太陽的街（溫州街、118 巷）0.62——第一次 1.0、第二次 0.76，從大太陽的巷子看進去白牆都比外面亮、像在發光；公館騎樓底下 0.85"""
    if SET == 'lane118' and spec.get('lane118') in l118_peek(): return l118_peek_interior(spec, xf, iw, gz, ih)   # L118-STREET-FIX-1111：九間店照新室內（上面）
    kind = spec['shop']['type']; pid = spec['id']; y0 = 0.15; yt = ih + 0.15; zb = gz - DI; cm = L.CMesh(f'sk_in_{pid}', IN_VC)   # 2026-10-23：店內不受場景光（unlit），亮度＝頂點色
    cp = lambda col: _CP(cm, col)
    rr = random.Random(sum(ord(c) for c in pid) * 31)
    # 地板：木頭類一律淺色 f_wood（使用者 10-23：不要深色木地板；原本定食 wood_dk、書店／早午餐 wood_lt #a07850）
    flo = {'noodle': 'f_mosaic', 'cvs': 'f_white', 'print': 'f_granite', 'laundry': 'f_terrazzo', 'teishoku': 'f_wood', 'books': 'f_wood', 'fruit': 'f_concrete', 'brunch': 'f_wood', 'buffet': 'f_white', 'tea': 'f_white', 'luwei': 'f_concrete', 'pharm': 'f_white', 'records': 'f_terrazzo', 'stationery': 'f_wood'}.get(kind, 'f_white')
    gzf = gz - 0.012                                                                                        # 店內的前緣在玻璃後面 1.2 cm（BUG-WZFLICKER-2：地板、側牆、天花板的前面原本和玻璃同一個平面）
    _floor_vc(cm, xf, iw, zb, gzf, y0, flo, rr)
    wallc = '#f1eee4' if (pid == 'A4' and SET == 'wenzhou') else {'noodle': '#ecdcc4', 'cvs': '#f4f4f0', 'print': '#dfe1dd', 'laundry': '#dceaf0', 'teishoku': '#e2d2b4', 'books': '#e0d2b8', 'fruit': '#efe8d8', 'brunch': '#e9dcc4', 'buffet': '#efe6d6', 'tea': '#f4f2ec', 'luwei': '#eadcc6', 'pharm': '#f4f6f2', 'records': '#dccbb0', 'stationery': '#ece2d0'}.get(kind, '#eeeeea')
    vb = lambda *a, **k: xf_vbox(cm, xf, *a, **k)
    vb(-iw / 2, iw / 2, y0, yt, zb - 0.05, zb, wallc, r=0)
    sgl = spec.get('sf', {}).get('side_glass')
    for sx in (-1, 1):
        if sx > 0 and sgl: vb(iw / 2 - 0.047, iw / 2 + 0.047, y0, yt, sgl['z1'], gzf, wallc, r=0); continue   # SUNNY SIDE：右側牆只留窗前面那一段（側窗看得到店內）
        vb(sx * iw / 2 - 0.047, sx * iw / 2 + 0.047, y0, yt, zb, gzf, wallc, r=0)   # 側牆厚 9.4 cm（BUG-WZFLICKER-2：內面原本和店面鋁框的側面同一個平面）
    vb(-iw / 2, iw / 2, yt, yt + 0.05, zb, gzf, '#d8d2c6', r=0)                                          # 天花板（2026-10-23 改頂點色：和牆一起照深度變暗）
    warm = kind in ('teishoku', 'books', 'brunch', 'fruit', 'noodle', 'buffet', 'records', 'stationery', 'luwei')
    for lx in ([-iw / 4, iw / 4] if iw > 5 else [0.0]):
        xf.box(acc(M['tube']), lx - 0.5, lx + 0.5, yt - 0.03, yt, zb + DI * 0.45 - 0.05, zb + DI * 0.45 + 0.05)
        CL.glow(root, 'shopin', *xf.p(lx, yt - 0.3, zb + DI * 0.5), color='rgba(255,226,180,1)' if warm else 'rgba(244,250,255,1)', size=1.7, day=0.0, night=0.85)   # 白天 0（2026-10-23：店內 unlit 本身就亮；白天有光暈，整個光暈網格白天也要多畫一次）
    if SET == 'wenzhou' and pid in WZ2_IN: WZ2_IN[pid](pid, cm, xf, iw, gz, zb, y0, yt, rr)   # WZ-SECOND-1104 v2：第二批五間的櫥窗（wz2_windows.py；大小、形狀、排法都不同）
    elif kind == 'noodle' and pid == 'A4' and SET == 'wenzhou': _lin_inside(cm, cp, vb, xf, iw, gz, zb, y0, yt, pid)   # WZ-LIN-STREET-REF-1112：林家乾麵照參考圖（下面）
    elif kind == 'noodle':                                                                                    # 麵店：後面的煮麵台、紅紙菜單、兩張桌子
        vb(-iw / 2 + 0.3, iw / 2 - 1.2, y0, y0 + 0.88, zb, zb + 0.6, '#b9bdc0', r=0.01)
        for x in (-iw / 2 + 0.8, -iw / 2 + 1.5): _lathe(cp('#b9bcbf'), xf, [(0.0, 0.0), (0.24, 0.0), (0.25, 0.35), (0.23, 0.36)], x, y0 + 0.88, zb + 0.3)   # 湯鍋
        for j in range(8): x = -iw / 2 + 0.6 + j * 0.42; vb(x - 0.15, x + 0.15, 1.55, 2.25, zb + 0.005, zb + 0.015, '#b8322a', r=0)
        for (tx, tz) in ((-0.8, gz - 1.2), (1.6, gz - 1.0)):
            vb(tx - 0.4, tx + 0.4, y0 + 0.7, y0 + 0.74, tz - 0.3, tz + 0.3, '#f1efe9', r=0.008); xf_cyl(cp('#9aa0a6'), xf, (tx, y0, tz), (tx, y0 + 0.7, tz), 0.03)
            for sx in (-0.55, 0.55): inst(P_STOOL_R, f'sk_instool_{pid}', xf, tx + sx, y0, tz)
    elif kind == 'luwei':                                                                                   # 滷味・鹹酥雞（G05，整面拉開）：臨街的三層不鏽鋼展示架（一盤盤滷味料）、紅色小籃子、後面的滷鍋和油炸台、紅紙菜單
        rl = random.Random(sum(ord(c) for c in pid) * 7); FOOD = ['#e8d9a8', '#5a9a3a', '#b84a3a', '#2f3a2a', '#e8c860', '#f2efe8', '#c9822e', '#8a4a2a', '#d4a03a']
        r0, r1 = -iw / 2 + 0.5, 1.2
        for t in range(3):                                                                                  # 三層，一層比一層高、往裡面退
            yy = y0 + 0.78 + t * 0.2; zf_ = gz - 0.35 - t * 0.28; zb_ = zf_ - 0.3
            vb(r0, r1, yy - 0.03, yy, zb_, zf_, '#c4c8cc', r=0)
            x_ = r0 + 0.04
            while x_ < r1 - 0.26:
                vb(x_, x_ + 0.24, yy, yy + 0.025, zb_ + 0.03, zf_ - 0.03, '#dfe2e4', r=0)                    # 不鏽鋼淺盤
                c_ = rl.choice(FOOD)
                for q in range(3): vb(x_ + 0.02 + q * 0.07, x_ + 0.08 + q * 0.07, yy + 0.025, yy + 0.025 + rl.uniform(0.03, 0.06), zb_ + 0.06 + (q % 2) * 0.08, zb_ + 0.14 + (q % 2) * 0.08, c_, r=0)
                x_ += 0.27
        for x_ in (r0, r1): vb(x_ - 0.02, x_ + 0.02, y0, y0 + 1.2, gz - 1.25, gz - 0.33, '#b9bcbf', r=0)
        vb(r0, r1, y0, y0 + 0.75, gz - 0.65, gz - 0.35, '#c4c8cc', r=0)                                     # 下面的櫃子
        for k_ in range(6): vb(r1 + 0.1, r1 + 0.42, y0 + 0.75 + k_ * 0.06, y0 + 0.8 + k_ * 0.06, gz - 0.6, gz - 0.38, '#c0392b', r=0.01)   # 一疊紅色小籃子
        vb(-iw / 2 + 0.3, iw / 2 - 0.3, y0, y0 + 0.88, zb, zb + 0.6, '#b9bdc0', r=0.01)                      # 後面：滷鍋台＋油炸台
        for x in (-iw / 2 + 0.8, -iw / 2 + 1.5): _lathe(cp('#b9bcbf'), xf, [(0.0, 0.0), (0.26, 0.0), (0.27, 0.38), (0.25, 0.39)], x, y0 + 0.88, zb + 0.3)
        vb(iw / 2 - 1.6, iw / 2 - 0.5, y0 + 0.88, y0 + 1.1, zb + 0.05, zb + 0.55, '#9aa0a6', r=0.01); vb(iw / 2 - 1.5, iw / 2 - 0.6, y0 + 1.1, y0 + 1.11, zb + 0.1, zb + 0.5, '#3a2a18', r=0)   # 油鍋
        for j in range(8): x = -iw / 2 + 0.6 + j * 0.42; vb(x - 0.15, x + 0.15, 1.55, 2.25, zb + 0.005, zb + 0.015, '#b8322a', r=0)
    elif kind == 'cvs':                                                                                     # 便利商店：後牆的飲料冰箱（真的瓶罐）、中間一排貨架（泡麵、零食、日用品）、櫃台
        n = int((iw - 0.6) / 0.62)
        for j in range(n):
            x0 = -iw / 2 + 0.3 + j * 0.62                                                                    # 冰箱：背板（發光）＋兩側＋上下框，飲料在前面（v6 第一版做成實心方塊，飲料被包在裡面）
            xf.box(acc(SK['lamp_cool']), x0 + 0.02, x0 + 0.58, y0 + 0.05, y0 + 1.95, zb + 0.005, zb + 0.03)   # 背板離後牆 5 mm（BUG-WZFLICKER-2）
            for (a_, b_) in ((x0, x0 + 0.03), (x0 + 0.57, x0 + 0.6)): vb(a_, b_, y0, y0 + 2.0, zb, zb + 0.56, '#3a3d40', r=0.0)
            vb(x0 + 0.03, x0 + 0.57, y0 + 1.95, y0 + 2.0, zb, zb + 0.56, '#3a3d40', r=0.0); vb(x0 + 0.03, x0 + 0.57, y0, y0 + 0.1, zb, zb + 0.56, '#3a3d40', r=0.0)   # 上下框夾在兩側板中間（BUG-WZFLICKER-2：原本和側板重疊，兩端、前後面同一個平面）
            for t in range(5):
                vb(x0 + 0.03, x0 + 0.57, y0 + 0.12 + t * 0.36, y0 + 0.14 + t * 0.36, zb + 0.03, zb + 0.5, '#c8ccd0', r=0.0)   # 層架
                gshelf(xf, x0 + 0.04, x0 + 0.56, y0 + 0.14 + t * 0.36, zb + 0.46, (['drink'], ['can', 'drink'], ['carton', 'drink'])[(j + t) % 3], 0.3, rail=False, facings=(3, 5))   # 2026-10-23：瓶罐（原本是單色小方塊）
            vb(x0 + 0.5, x0 + 0.52, y0 + 0.75, y0 + 1.35, zb + 0.56, zb + 0.58, '#c9ccd0', r=0)               # 門把
            xf.quad(acc(M['glass']), [(x0 + 0.03, y0 + 0.1, zb + 0.548), (x0 + 0.57, y0 + 0.1, zb + 0.548), (x0 + 0.57, y0 + 1.95, zb + 0.548), (x0 + 0.03, y0 + 1.95, zb + 0.548)])   # 冰箱門玻璃嵌在框裡、比框的前面退 1.2 cm（BUG-WZFLICKER-2：原本和框的前面同一個平面，隔著店面玻璃看得到閃）
        # 中間一排雙面貨架（2026-10-23 原本兩座和玻璃垂直、從街上只看得到端面；改成和玻璃平行、正面朝街，四層商品）
        gx0, gx1, gf, gb = -iw / 2 + 0.5, iw / 2 - 1.7, gz - 1.45, gz - 1.85
        vb(gx0, gx1, y0, y0 + 0.1, gb, gf - 0.03, '#3a3d40', r=0); vb(gx0, gx1, y0, y0 + 1.4, gb, gb + 0.04, '#e6e6e2', r=0)
        for x_ in (gx0, gx1): vb(x_ - 0.02, x_ + 0.02, y0, y0 + 1.4, gb, gf + 0.03, '#e6e6e2', r=0)
        for t, cats in enumerate((['daily', 'daily2'], ['cupnoodle', 'bagnoodle'], ['chips', 'cookie'], ['candy', 'bread'])):
            yy = y0 + 0.1 + t * 0.32; vb(gx0 + 0.02, gx1 - 0.02, yy - 0.02, yy, gb + 0.04, gf + 0.03, '#f2f2ee', r=0)
            gshelf(xf, gx0 + 0.03, gx1 - 0.03, yy, gf, cats, 0.28)
        vb(gx0, gx1, y0 + 1.4, y0 + 1.58, gf - 0.01, gf + 0.01, '#d8432f', r=0)                             # 貨架頂的促銷條
        vb(iw / 2 - 1.3, iw / 2 - 0.2, y0, y0 + 0.95, gz - 1.6, gz - 0.9, '#f2f2ee', r=0.01); vb(iw / 2 - 1.0, iw / 2 - 0.6, y0 + 0.95, y0 + 1.25, gz - 1.4, gz - 1.2, '#2c2c2e', r=0.01)
        vb(iw / 2 - 1.25, iw / 2 - 1.05, y0 + 0.95, y0 + 1.3, gz - 1.5, gz - 1.0, '#b9bdc0', r=0.01)          # 櫃台上的熱食櫃（關東煮）
        vb(iw / 2 - 1.3, iw / 2 - 0.2, y0 + 0.1, y0 + 0.12, gz - 0.9, gz - 0.8, '#f2f2ee', r=0); gshelf(xf, iw / 2 - 1.28, iw / 2 - 0.25, y0 + 0.12, gz - 0.82, ['candy', 'stationery'], 0.2, rail=False)   # 櫃台前面一層小東西（喉糖、電池）
    elif kind == 'pharm':                                                                                   # 藥局（公館藥局 G04）：後牆整面白色層架（藥盒、保健食品）、綠十字燈箱、藥師櫃台（玻璃展示櫃）、一座雙面貨架、門邊的血壓計
        sx0, sx1 = -iw / 2 + 0.25, iw / 2 - 0.25
        for t in range(6):
            yy = y0 + 0.12 + t * 0.36; vb(sx0, sx1, yy - 0.025, yy, zb, zb + 0.36, '#fbfbf8', r=0)
            gshelf(xf, sx0 + 0.03, sx1 - 0.03, yy, zb + 0.33, (['med'], ['med', 'med2'], ['daily2', 'med'])[t % 3], 0.3)
        x_ = sx0
        while x_ <= sx1 + 1e-6: vb(x_ - 0.015, x_ + 0.015, y0, y0 + 2.3, zb, zb + 0.37, '#dcdcd8', r=0); x_ += 1.2
        vb(-0.42, 0.42, y0 + 2.42, y0 + 3.02, zb + 0.02, zb + 0.14, '#f4f6f2', r=0.01)                       # 綠十字燈箱
        for (a_, b_, c_, d_) in ((-0.09, 0.09, 2.5, 2.94), (-0.31, 0.31, 2.63, 2.81)): xf.box(acc(SK['lamp_green']), a_, b_, y0 + c_, y0 + d_, zb + 0.14, zb + 0.15)
        cz0, cz1 = gz - 1.95, gz - 1.45                                                                     # 藥師櫃台：白色檯面＋前面的玻璃展示櫃（裡面兩層藥盒）
        vb(-1.7, 1.7, y0, y0 + 0.12, cz0, cz1 - 0.02, '#3a3d40', r=0); vb(-1.7, 1.7, y0 + 0.92, y0 + 0.97, cz0, cz1 + 0.03, '#f8f8f4', r=0.01)
        for x_ in (-1.7, 0.0, 1.7): vb(x_ - 0.03, x_ + 0.03, y0, y0 + 0.92, cz1 - 0.06, cz1, '#d8dadc', r=0)
        vb(-1.7, 1.7, y0 + 0.12, y0 + 0.92, cz0, cz0 + 0.04, '#f2f2ee', r=0)
        for t in range(2):
            yy = y0 + 0.14 + t * 0.4; vb(-1.67, 1.67, yy - 0.015, yy, cz0 + 0.04, cz1 - 0.06, '#eef2f2', r=0); gshelf(xf, -1.62, 1.62, yy, cz1 - 0.09, ['med'], 0.25, rail=False)
        xf.quad(acc(M['glass']), [(-1.7, y0 + 0.12, cz1 - 0.008), (1.7, y0 + 0.12, cz1 - 0.008), (1.7, y0 + 0.92, cz1 - 0.008), (-1.7, y0 + 0.92, cz1 - 0.008)])
        vb(-1.2, -0.85, y0 + 0.97, y0 + 1.27, cz0 + 0.1, cz0 + 0.3, '#2c2c2e', r=0.01)                        # 收銀機
        gx0, gx1, gf, gb = -iw / 2 + 0.5, 0.0, gz - 0.75, gz - 1.15                                          # 雙面貨架（門在右邊，左半邊放貨架）
        vb(gx0, gx1, y0, y0 + 0.1, gb, gf - 0.03, '#3a3d40', r=0); vb(gx0, gx1, y0, y0 + 1.3, gb, gb + 0.04, '#e6e6e2', r=0)
        for x__ in (gx0, gx1): vb(x__ - 0.02, x__ + 0.02, y0, y0 + 1.3, gb, gf + 0.03, '#e6e6e2', r=0)
        for t, cats in enumerate((['daily'], ['daily2', 'med2'], ['candy', 'med'], ['med2', 'daily2'])):
            yy = y0 + 0.1 + t * 0.3; vb(gx0 + 0.02, gx1 - 0.02, yy - 0.02, yy, gb + 0.04, gf + 0.03, '#f2f2ee', r=0); gshelf(xf, gx0 + 0.03, gx1 - 0.03, yy, gf, cats, 0.26)
        vb(gx0, gx1, y0 + 1.3, y0 + 1.46, gf - 0.01, gf + 0.01, '#3fae5a', r=0)
        bx_ = iw / 2 - 0.65                                                                                 # 門邊的投幣血壓計（白色機身＋螢幕＋量手臂的圓筒）
        vb(bx_ - 0.28, bx_ + 0.28, y0, y0 + 0.75, gz - 0.95, gz - 0.45, '#f2f2ee', r=0.02); vb(bx_ - 0.24, bx_ + 0.24, y0 + 0.75, y0 + 1.25, gz - 0.95, gz - 0.85, '#f2f2ee', r=0.02)
        xf.box(acc(SK['lamp_cool']), bx_ - 0.15, bx_ + 0.15, y0 + 0.98, y0 + 1.16, gz - 0.85, gz - 0.845)
        xf_cyl(cp('#2a2a2c'), xf, (bx_ - 0.1, y0 + 0.82, gz - 0.65), (bx_ + 0.1, y0 + 0.82, gz - 0.65), 0.09, seg=10)
    elif kind == 'records':                                                                                 # 二手唱片（G12）：後牆兩排封面朝外的唱片、下面 CD 架、兩個木箱唱片櫃（唱片一張張立著）、櫃台上的唱盤
        G = goods(); rec = CG.CATS['record']; rr2 = random.Random(sum(ord(c) for c in pid))
        for t in range(2):
            yy = y0 + 1.25 + t * 0.48; vb(-iw / 2 + 0.3, iw / 2 - 0.3, yy - 0.03, yy, zb, zb + 0.1, '#8a6a4a', r=0)
            x_ = -iw / 2 + 0.36
            while x_ < iw / 2 - 0.66:
                if rr2.random() > 0.12: gbox(xf, x_, x_ + 0.31, yy, yy + 0.31, zb + 0.04, zb + 0.05, rr2.choice(rec)['cell'])
                x_ += 0.36
        vb(-iw / 2 + 0.3, iw / 2 - 0.3, y0, y0 + 1.05, zb, zb + 0.3, '#a8865e', r=0)                         # CD 架：四層，CD 的側邊用書背貼圖（一層一片；第一版一片一個方塊，三萬多個三角形）
        bm_ = in_mat('books')
        for t in range(4):
            yy = y0 + 0.08 + t * 0.24; v1 = 1 - (t % 6) * 0.155
            uvq(f'sk_in_cds_{pid}_{t}', bm_, xf, [(-iw / 2 + 0.36, yy, zb + 0.305), (iw / 2 - 0.36, yy, zb + 0.305), (iw / 2 - 0.36, yy + 0.142, zb + 0.305), (-iw / 2 + 0.36, yy + 0.142, zb + 0.305)], (0, v1 - 0.065, (iw - 0.72) / 1.4, v1))
        for (bx_, bz_) in ((-iw / 2 + 1.3, gz - 1.2), (-iw / 2 + 2.6, gz - 1.2)):                          # 木箱唱片櫃：四隻腳、箱子、唱片立著（朝街那一面是封面）
            vb(bx_ - 0.4, bx_ + 0.4, y0 + 0.4, y0 + 0.75, bz_ - 0.5, bz_ + 0.5, '#9a7650', r=0.01)
            for (lx_, lz_) in ((-0.36, -0.46), (0.36, -0.46), (-0.36, 0.46), (0.36, 0.46)): vb(bx_ + lx_ - 0.03, bx_ + lx_ + 0.03, y0, y0 + 0.4, bz_ + lz_ - 0.03, bz_ + lz_ + 0.03, '#7a5a3a', r=0)
            for col_ in (-0.18, 0.18):
                for k_ in range(22):
                    z_ = bz_ + 0.44 - k_ * 0.04; gbox(xf, bx_ + col_ - 0.155, bx_ + col_ + 0.155, y0 + 0.6, y0 + 0.6 + 0.31 - 0.03 * (k_ % 3 == 1), z_ - 0.007, z_, rr2.choice(rec)['cell'])
        vb(-0.2, 1.1, y0, y0 + 0.95, gz - 2.0, gz - 1.45, '#8a6a4a', r=0.015)                            # 櫃台＋唱盤（門在右邊：櫃台放中間後面）
        vb(0.15, 0.65, y0 + 0.95, y0 + 1.03, gz - 1.9, gz - 1.5, '#1d1d1f', r=0.01)
        xf_cyl(cp('#2a2a2c'), xf, (0.4, y0 + 1.03, gz - 1.7), (0.4, y0 + 1.04, gz - 1.7), 0.15, seg=14)
    elif kind == 'bike':                                                                                    # 腳踏車行（G06）：後牆洞洞板（工具）、一排掛著的輪胎、零件層架、修車架（前面 1.2 m 留給遊戲擺的車）
        vb(-iw / 2 + 0.3, iw / 2 - 0.3, y0 + 0.95, y0 + 2.45, zb, zb + 0.03, '#cfc8b8', r=0)
        rb = random.Random(sum(ord(c) for c in pid))
        for j in range(int((iw - 1.2) / 0.5)):
            x_ = -iw / 2 + 0.75 + j * 0.5; yc = y0 + 1.95 - (j % 2) * 0.12
            ro = 0.31 if j % 3 else 0.34                                                                       # 輪胎（黑）→ 鋼圈（銀，窄）→ 中間透出後面的洞洞板＋輻條（第一版是實心銀盤，看起來像黑膠唱片）
            xf_cyl(cp('#2a2a2c'), xf, (x_, yc, zb + 0.04), (x_, yc, zb + 0.08), ro, seg=16)
            xf_cyl(cp('#b9bcbf'), xf, (x_, yc, zb + 0.08), (x_, yc, zb + 0.083), ro - 0.045, seg=16)
            xf_cyl(cp('#cfc8b8'), xf, (x_, yc, zb + 0.083), (x_, yc, zb + 0.086), ro - 0.07, seg=16)
            for q in range(8):
                a_ = q * math.pi / 8; xf_cyl(cp('#c9ccce'), xf, (x_ - (ro - 0.07) * math.cos(a_), yc - (ro - 0.07) * math.sin(a_), zb + 0.088), (x_ + (ro - 0.07) * math.cos(a_), yc + (ro - 0.07) * math.sin(a_), zb + 0.088), 0.004, seg=3)
            xf_cyl(cp('#2a2a2c'), xf, (x_, yc, zb + 0.083), (x_, yc, zb + 0.095), 0.035, seg=6)
        for j in range(14):
            x_ = -iw / 2 + 0.5 + j * (iw - 1.0) / 14; vb(x_, x_ + rb.uniform(0.04, 0.12), y0 + 1.05 + rb.uniform(0, 0.12), y0 + 1.25 + rb.uniform(0, 0.12), zb + 0.03, zb + 0.06, rb.choice(['#c0392b', '#2c2c2e', '#3a5a8a', '#e0a030', '#6a6e72']), r=0)   # 工具
        for t in range(3):
            yy = y0 + 0.1 + t * 0.3; vb(-iw / 2 + 0.3, iw / 2 - 0.3, yy - 0.025, yy, zb, zb + 0.4, '#d8d8d4', r=0)
            x_ = -iw / 2 + 0.36
            while x_ < iw / 2 - 0.5:
                w_ = rb.uniform(0.14, 0.3); vb(x_, x_ + w_, yy, yy + rb.uniform(0.1, 0.22), zb + 0.08, zb + 0.36, rb.choice(['#e8e4dc', '#c9463d', '#2f4a6a', '#e0a030', '#3c7d3a', '#1d1d1f']), r=0); x_ += w_ + rb.uniform(0.02, 0.08)
        sx_ = iw / 2 - 1.3                                                                                  # 修車架
        xf_cyl(cp('#2a2a2c'), xf, (sx_, y0, gz - 1.6), (sx_, y0 + 1.2, gz - 1.6), 0.025, seg=6); xf_cyl(cp('#2a2a2c'), xf, (sx_, y0 + 1.2, gz - 1.6), (sx_ - 0.35, y0 + 1.2, gz - 1.6), 0.02, seg=6)
        vb(sx_ - 0.3, sx_ + 0.3, y0, y0 + 0.03, gz - 1.9, gz - 1.3, '#3a3d40', r=0)
    elif kind == 'stationery':                                                                              # 文具・畫材（G13）：後牆的洞洞板（吊卡文具）、右邊層架（色鉛筆、水彩、本子）、中間平台、櫃台
        vb(-iw / 2 + 0.3, 1.0, y0 + 0.4, y0 + 2.3, zb, zb + 0.03, '#d9c9a8', r=0)
        for t in range(5):
            yy = y0 + 0.5 + t * 0.36; gshelf(xf, -iw / 2 + 0.35, 0.95, yy, zb + 0.06, ['stationery', 'art'] if t % 2 else ['stationery'], 0.3, rail=False, facings=(3, 5))
        for t in range(5):
            yy = y0 + 0.12 + t * 0.42; vb(1.2, iw / 2 - 0.3, yy - 0.025, yy, zb, zb + 0.34, '#f2ece0', r=0)
            gshelf(xf, 1.23, iw / 2 - 0.33, yy, zb + 0.31, ['art'], 0.36)
        vb(-1.5, 0.5, y0, y0 + 0.78, gz - 1.6, gz - 0.95, '#e8e4dc', r=0.01)                                # 中間平台：一疊疊本子、紙膠帶
        gshelf(xf, -1.45, 0.45, y0 + 0.78, gz - 1.0, ['art', 'stationery'], 0.3, rail=False)
        vb(iw / 2 - 1.5, iw / 2 - 0.3, y0, y0 + 0.95, gz - 1.0, gz - 0.5, '#e8e4dc', r=0.015); vb(iw / 2 - 1.2, iw / 2 - 0.8, y0 + 0.95, y0 + 1.2, gz - 0.9, gz - 0.7, '#2c2c2e', r=0.01)
    elif kind == 'print':   # ADE-V2-1104（BB-C 退回：玻璃後面要看得到兩三台大小不同的影印機、層架、紙箱、櫃台；參考圖 wz_ade_ext）：玻璃後 1.0～2.5 m 排出前後層次
        # ADE-V2.1（BB_255 第 3 點：v2 的影印機像白色方盒）：每台都有底座、紙匣（縫＋把手）、機身中間的出紙口、掃描器＋自動送紙器、右前方的操作面板；
        # 大台左邊多一個裝訂出紙器，中台右邊有手送紙盤，桌上型放在木櫃上（v2 的櫃子和影印機疊在同一個位置，改成櫃子在下、影印機在上）
        # 參考圖：兩台大的在白字右邊、門的左邊（玻璃後 1.5～1.8 m；白字後面放深色的紙箱，白字才看得清楚——v2.1 第一次把中台放在白字正後面，白字疊在白色機器上），桌上型在門後面
        _copier(vb, -1.6, gz - 1.55, 0.8, 0.7, 1.12, y0, 'L')   # 左邊的裝訂出紙器到 −2.42，剛好在白字（到 −2.38）外面
        _copier(vb, -0.75, gz - 1.75, 0.64, 0.56, 0.98, y0, 'M')
        vb(0.27, 0.83, y0, y0 + 0.62, gz - 2.08, gz - 1.6, '#a07a52', r=0.01)                                                              # 桌上型底下的木櫃（兩扇門）
        for k in (0, 1): vb(0.29 + k * 0.27, 0.54 + k * 0.27, y0 + 0.05, y0 + 0.58, gz - 1.6, gz - 1.594, '#b48a5e'); vb(0.51 + k * 0.06, 0.53 + k * 0.06, y0 + 0.42, y0 + 0.5, gz - 1.594, gz - 1.58, '#5a5e64')
        _copier(vb, 0.55, gz - 1.84, 0.5, 0.42, 0.46, y0 + 0.62, 'S')
        # 後牆整排層架：鐵柱＋木板四層，大小不同的紙箱、一包包彩色紙、一排排資料夾（不是同一個東西換顏色：寬高深都不同）
        sz0, sz1 = zb + 0.04, zb + 0.46; xs0, xs1 = -iw / 2 + 0.25, iw / 2 - 0.25
        for x_ in [xs0 + k * (xs1 - xs0) / 5 for k in range(6)]: vb(x_ - 0.02, x_ + 0.02, y0, y0 + 2.05, sz0, sz0 + 0.04, '#8a8f94'); vb(x_ - 0.02, x_ + 0.02, y0, y0 + 2.05, sz1 - 0.04, sz1, '#8a8f94')
        # v2.1：參考圖的層架多半是紙箱和白色包裝的影印紙，資料夾少、顏色沉（v2 一整排彩色資料夾，從街上看像書店）
        PAP = ['#f6f4ec', '#f6f4ec', '#f4f2ea', '#efe3b4', '#cfe2ec', '#e8e8e3']; BIN = ['#2f5fa8', '#3a3e44', '#9aa0a6', '#e8e8e3', '#1f4e8c', '#c0392b']; BOX = ['#b48a5c', '#a87e52', '#c09a6c', '#e9e6de', '#b8905e']
        for lvl, y in enumerate((y0 + 0.04, y0 + 0.56, y0 + 1.06, y0 + 1.56)):
            vb(xs0, xs1, y - 0.03, y, sz0, sz1, '#c9a77a')
            x_ = xs0 + 0.05
            while x_ < xs1 - 0.2:
                kind_ = rr.random()
                if kind_ < 0.45:   # 紙箱（牛皮色深淺不同、幾個白箱子，大小不同）
                    w_ = rr.uniform(0.32, 0.55); h_ = rr.uniform(0.22, 0.4); vb(x_, x_ + w_, y, y + h_, sz0 + 0.02, sz0 + rr.uniform(0.3, 0.4), BOX[rr.randrange(len(BOX))]); x_ += w_ + rr.uniform(0.02, 0.08)
                elif kind_ < 0.85:   # 一疊影印紙（一包一包，多半白色，高矮不同）
                    for j in range(rr.randint(2, 4)):
                        hh = rr.uniform(0.05, 0.07); yy = y + j * hh; vb(x_, x_ + 0.3, yy, yy + hh - 0.004, sz0 + 0.05, sz0 + 0.26, PAP[rr.randrange(len(PAP))])
                    x_ += 0.34
                else:   # 一排資料夾（寬窄、高矮不同）
                    n_ = rr.randint(4, 9)
                    for j in range(n_): bw = rr.uniform(0.04, 0.07); vb(x_, x_ + bw - 0.005, y, y + rr.uniform(0.26, 0.32), sz0 + 0.04, sz0 + 0.3, BIN[rr.randrange(len(BIN))]); x_ += bw
                    x_ += rr.uniform(0.04, 0.12)
        # 右邊：木頭櫃台（門右邊到壁面前），前面一條藍色，上面一台螢幕、一疊紙、筆筒
        dx_ = spec.get('sf', {}).get('door_x', 0.0); cx_ = 0.0 if dx_ < 0.5 else dx_ - 3.3                    # 櫃台的位置：門在中間（阿德）放門的右邊；門在右邊（公館 G10，門 2.2）放門的左邊（−0.12～1.2），不擋在門後面
        vb(cx_ + 0.98, cx_ + 2.3, y0, y0 + 0.95, gz - 1.18, gz - 0.72, '#c09a6c', r=0.015); vb(cx_ + 0.96, cx_ + 2.32, y0 + 0.95, y0 + 0.99, gz - 1.2, gz - 0.7, '#e8dcc4', r=0.01)
        vb(cx_ + 0.98, cx_ + 2.3, y0 + 0.62, y0 + 0.68, gz - 0.72, gz - 0.705, '#1f4e8c')
        vb(cx_ + 1.5, cx_ + 1.98, y0 + 1.08, y0 + 1.38, gz - 1.05, gz - 1.02, '#1c1e22'); vb(cx_ + 1.7, cx_ + 1.78, y0 + 0.99, y0 + 1.08, gz - 1.06, gz - 1.0, '#2a2c30')   # 螢幕（背面朝客人）
        for j in range(5): vb(cx_ + 1.08 + j * 0.01, cx_ + 1.36 + j * 0.01, y0 + 0.99 + j * 0.012, y0 + 1.0 + j * 0.012, gz - 1.0, gz - 0.8, '#f8f8f4')
        xf_cyl(cp('#3a5a8a'), xf, (cx_ + 2.15, y0 + 0.99, gz - 0.9), (cx_ + 2.15, y0 + 1.11, gz - 0.9), 0.04, seg=8)
        uvq(f'sk_in_price_{pid}', in_mat('price'), xf, [(0.2, 2.12, zb + 0.47), (1.3, 2.12, zb + 0.47), (1.3, 2.68, zb + 0.47), (0.2, 2.68, zb + 0.47)], (0, 0, 1, 1))   # 價目表掛在層架上面
        for (x_, w_, h_, dz) in ((-iw / 2 + 0.55, 0.55, 0.42, 2.0), (-iw / 2 + 1.0, 0.4, 0.3, 1.9), (-iw / 2 + 0.63, 0.45, 0.32, 2.05)):   # 地上疊的紙箱（v2.1：放在白字後面，深色的牛皮紙箱襯白字）
            vb(x_ - w_ / 2, x_ + w_ / 2, y0 + (0.42 if dz == 2.05 else 0.0), y0 + (0.42 if dz == 2.05 else 0.0) + h_, gz - dz - 0.2, gz - dz + 0.2, '#b8905e', r=0.01)
    elif kind == 'laundry':                                                                                 # 洗衣：後牆一排洗衣機＋上面疊烘衣機、摺衣桌、椅子
        n = int((iw - 0.8) / 0.7)
        for j in range(n):
            x = -iw / 2 + 0.55 + j * 0.7
            for lvl, (ya, yb_) in enumerate(((y0, y0 + 0.9), (y0 + 0.92, y0 + 1.82))):
                vb(x - 0.32, x + 0.32, ya, yb_, zb, zb + 0.65, '#f4f4f2', r=0.02)
                c = (ya + yb_) / 2 - 0.05; xf_cyl(cp('#9aa0a6'), xf, (x, c, zb + 0.65), (x, c, zb + 0.68), 0.22, seg=16)
                xf_cyl(cp('#2a2a2c'), xf, (x, c, zb + 0.68), (x, c, zb + 0.69), 0.17, seg=16)
                vb(x - 0.25, x + 0.25, yb_ - 0.12, yb_ - 0.04, zb + 0.65, zb + 0.66, '#9aa8b0', r=0)
        vb(-0.9, 0.9, y0 + 0.82, y0 + 0.86, gz - 1.55, gz - 0.95, '#f2f0ea', r=0.01)
        for sx in (-0.8, 0.8): xf_cyl(cp('#9aa0a6'), xf, (sx, y0, gz - 1.25), (sx, y0 + 0.82, gz - 1.25), 0.025)
        for j in range(3): inst(P_STOOL_B, f'sk_inchair_{pid}', xf, iw / 2 - 0.45, y0, gz - 0.6 - j * 0.5)
    elif kind == 'teishoku':                                                                                # 定食：木吧台＋高腳凳、後面的碗盤架、暖簾、紙燈籠
        vb(-iw / 2 + 0.6, iw / 2 - 1.2, y0, y0 + 0.95, zb + 1.0, zb + 1.5, '#5a3c28', r=0.015); vb(-iw / 2 + 0.55, iw / 2 - 1.15, y0 + 0.95, y0 + 1.0, zb + 0.98, zb + 1.62, '#a07850', r=0.01)
        for j in range(int((iw - 1.8) / 0.8)):
            x = -iw / 2 + 1.0 + j * 0.8; _lathe(cp('#7a5a3e'), xf, [(0.0, 0.62), (0.18, 0.62), (0.18, 0.66), (0.0, 0.66)], x, y0, zb + 1.85, seg=12); xf_cyl(cp('#2a2a2c'), xf, (x, y0, zb + 1.85), (x, y0 + 0.62, zb + 1.85), 0.025)
        for t in range(3):                                                                                  # v6d：碗盤架（BB-B：原本一格一格的彩色方塊，從外面看像書店）
            yy = y0 + 1.3 + t * 0.35; vb(-iw / 2 + 0.6, iw / 2 - 1.2, yy, yy + 0.03, zb, zb + 0.3, '#5a3c28', r=0)
            x = -iw / 2 + 0.75
            while x < iw / 2 - 1.35:
                if rr.random() < 0.6:                                                                       # 一疊碗（3～4 個疊起來的輪廓）
                    hh = 0.05 + rr.randint(2, 3) * 0.028                                                   # 疊起來的碗：外形一個喇叭狀（8 邊；一整排一百多疊，不能太細）
                    _lathe(cp('#f2efe8' if rr.random() < 0.6 else '#2f4a6a'), xf, [(0.0, 0.0), (0.045, 0.0), (0.08, hh), (0.0, hh)], x + 0.08, yy + 0.03, zb + 0.15, seg=6); x += 0.24   # 效能版：6 邊、少一圈（在店裡的架子上，從街上看不出邊數）
                else:                                                                                       # 立著的盤子（三片）
                    for q in range(3): xf_cyl(cp('#f2efe8'), xf, (x + 0.02 + q * 0.03, yy + 0.03 + 0.11, zb + 0.12), (x + 0.03 + q * 0.03, yy + 0.03 + 0.11, zb + 0.12), 0.11, seg=6)
                    x += 0.16
        for j in range(9): vb(-iw / 2 + 0.75 + j * 0.3, -iw / 2 + 0.97 + j * 0.3, y0 + 2.35, y0 + 2.75, zb + 0.005, zb + 0.012, '#e8dcc0', r=0)   # 牆上的木札菜單（米色長條）
        for j in range(3): vb(iw / 2 - 1.0 + j * 0.27, iw / 2 - 0.76 + j * 0.27, y0 + 1.3, y0 + 2.2, zb + 0.4, zb + 0.41, '#22324e', r=0)
        for x in (-iw / 4, iw / 4): _lathe(acc(SK['lamp']), xf, [(0.0, 0.0), (0.12, 0.0), (0.16, 0.12), (0.16, 0.28), (0.12, 0.4), (0.0, 0.4)], x, yt - 0.75, zb + 1.3, seg=12)
    elif kind == 'books':                                                                                   # 二手書：整面書牆（書背貼圖）、中間的平台、櫃台
        bm_ = in_mat('books')
        for t in range(6):
            yy = y0 + 0.1 + t * 0.36; vb(-iw / 2 + 0.2, iw / 2 - 0.2, yy - 0.025, yy, zb, zb + 0.32, '#6a4a30', r=0)
            v1 = 1 - (t % 6) * 0.155; uvq(f'sk_in_books_{pid}_{t}', bm_, xf, [(-iw / 2 + 0.2, yy, zb + 0.1), (iw / 2 - 0.2, yy, zb + 0.1), (iw / 2 - 0.2, yy + 0.32, zb + 0.1), (-iw / 2 + 0.2, yy + 0.32, zb + 0.1)], (0, v1 - 0.15, (iw - 0.4) / 2.2, v1))
        vb(-1.6, 0.6, y0, y0 + 0.75, gz - 1.7, gz - 1.0, '#7a5a3a', r=0.015)
        for j in range(9): vb(-1.5 + (j % 3) * 0.7, -1.0 + (j % 3) * 0.7, y0 + 0.75, y0 + 0.75 + 0.04 * (1 + j // 3), gz - 1.6 + (j // 3) * 0.2, gz - 1.45 + (j // 3) * 0.2, rr.choice(['#2f4a6a', '#6a2f2f', '#e8e0d0', '#3a5a3a', '#c9a46a']), r=0.004)
        vb(iw / 2 - 1.4, iw / 2 - 0.3, y0, y0 + 0.95, gz - 1.0, gz - 0.5, '#5a3c28', r=0.015)
    elif kind == 'fruit':                                                                                   # 水果：三層木架、一籃一籃的水果、後面的冰箱（果汁）、吊燈
        for k, x in enumerate((-iw / 2 + 1.4, 0.0, iw / 2 - 1.4)):
            for t in range(3):
                zz = gz - 0.6 - t * 0.45; yy = y0 + 0.35 + t * 0.3; vb(x - 1.0, x + 1.0, yy - 0.04, yy, zz - 0.2, zz + 0.2, '#8a6a4a', r=0.008)
                for b in range(4):                                                                       # 一籃：竹籃（扁圓柱）＋堆起來的水果（兩顆）
                    col = rr.choice(['#e04a2a', '#f0b030', '#7ab040', '#f0d050', '#c02a4a', '#f08030']); cx = x - 0.75 + b * 0.5
                    xf_cyl(cp('#b48a5e'), xf, (cx, yy, zz), (cx, yy + 0.06, zz), 0.16, seg=10)
                    for q in range(2): cp(col).sphere(xf.p(cx + (q - 0.5) * 0.12, yy + 0.1, zz + (q % 2) * 0.05 - 0.02), 0.07, seg=7, rings=4)
        vb(-iw / 2 + 0.4, -iw / 2 + 2.2, y0, y0 + 1.9, zb, zb + 0.6, '#e8e8e4', r=0.02); xf.box(acc(SK['lamp_cool']), -iw / 2 + 0.5, -iw / 2 + 2.1, y0 + 0.1, y0 + 1.8, zb + 0.6, zb + 0.605)
        for x in (-iw / 3, 0.0, iw / 3): acc(SK['lamp']).sphere(xf.p(x, yt - 0.45, gz - 1.0), 0.07, seg=8, rings=5); xf_cyl(cp('#2a2a2c'), xf, (x, yt, gz - 1.0), (x, yt - 0.38, gz - 1.0), 0.004, seg=4)
    elif kind == 'brunch':                                                                                  # 半熟：兩張小桌、吊燈、後面的吧台＋咖啡機、黑板
        for (tx, tz) in ((-iw / 2 + 1.1, gz - 1.0), (-iw / 2 + 2.6, gz - 1.0), (iw / 2 - 1.2, gz - 1.6)):
            vb(tx - 0.33, tx + 0.33, y0 + 0.72, y0 + 0.76, tz - 0.33, tz + 0.33, '#b48a5e', r=0.012); xf_cyl(cp('#2a2a2c'), xf, (tx, y0, tz), (tx, y0 + 0.72, tz), 0.03)
            for sz in (-0.5, 0.5):
                vb(tx - 0.2, tx + 0.2, y0 + 0.43, y0 + 0.47, tz + sz - 0.2, tz + sz + 0.2, '#a07850', r=0.012); vb(tx - 0.19, tx + 0.19, y0 + 0.7, y0 + 0.86, tz + sz + (0.2 if sz > 0 else -0.23), tz + sz + (0.23 if sz > 0 else -0.2), '#a07850', r=0.008)
            acc(SK['lamp']).sphere(xf.p(tx, y0 + 1.95, tz), 0.06, seg=8, rings=5); xf_cyl(cp('#2a2a2c'), xf, (tx, yt, tz), (tx, y0 + 2.0, tz), 0.004, seg=4)
            _lathe(cp('#2a2a2c'), xf, [(0.15, 0.0), (0.14, 0.0), (0.04, 0.14), (0.02, 0.16)], tx, y0 + 1.97, tz, seg=14)   # 輪廓由下往上（ART-LAMPSHADE-FLIP-1027：原本由上往下＝裡外相反；部署的 wenzhou_street.glb 用 glb_flip_insideout.py 修過）
        vb(-iw / 2 + 0.4, iw / 2 - 0.4, y0, y0 + 0.95, zb, zb + 0.55, '#5a3c28', r=0.015); vb(-iw / 2 + 0.35, iw / 2 - 0.35, y0 + 0.95, y0 + 0.99, zb, zb + 0.6, '#b48a5e', r=0.01)
        vb(0.4, 0.95, y0 + 0.99, y0 + 1.4, zb + 0.05, zb + 0.5, '#b9bdc0', r=0.03)
        uvq(f'sk_in_board_{pid}', in_mat('board'), xf, [(-1.6, 1.55, zb + 0.01), (0.2, 1.55, zb + 0.01), (0.2, 2.15, zb + 0.01), (-1.6, 2.15, zb + 0.01)], (0, 0, 1, 1))
        if spec.get('sf', {}).get('in_books'):                                                             # 118 巷慢讀咖啡：吧台上方右邊一面書牆（三層）
            bm_ = in_mat('books'); x0b, x1b = 0.6, iw / 2 - 0.4
            for t in range(3):
                yy = y0 + 1.45 + t * 0.36; vb(x0b, x1b, yy - 0.025, yy, zb, zb + 0.3, '#c9ad85', r=0)
                v1 = 1 - t * 0.155; uvq(f'sk_in_cbooks_{pid}_{t}', bm_, xf, [(x0b, yy, zb + 0.08), (x1b, yy, zb + 0.08), (x1b, yy + 0.32, zb + 0.08), (x0b, yy + 0.32, zb + 0.08)], (0, v1 - 0.15, (x1b - x0b) / 2.2, v1))
    elif kind == 'buffet':                                                                                  # 自助餐（118 巷好家）：不鏽鋼餐檯（兩排菜盤）、防噴罩、餐盤和碗、電鍋、後牆的價目板
        c0, c1, cz0, cz1 = -iw / 2 + 0.8, iw / 2 - 0.8, gz - 1.35, gz - 0.75
        xf.box(cp('#b9bcbf'), c0, c1, y0, y0 + 0.86, cz0, cz1)                                             # 餐檯（保溫台）
        n = max(3, int((c1 - c0 - 0.1) / 0.34))
        for r_ in range(2):
            for j in range(n):
                x = c0 + 0.08 + j * (c1 - c0 - 0.16) / n; zc = cz0 + 0.16 + r_ * 0.3
                vb(x + 0.01, x + (c1 - c0 - 0.16) / n - 0.01, y0 + 0.86, y0 + 0.88, zc - 0.12, zc + 0.12, '#d9dcde', r=0)   # 不鏽鋼菜盤的邊
                vb(x + 0.03, x + (c1 - c0 - 0.16) / n - 0.03, y0 + 0.88, y0 + 0.9, zc - 0.1, zc + 0.1, rr.choice(['#7a9a3a', '#c9822e', '#e8d9a8', '#8a4a2a', '#d4a03a', '#3f6a2f', '#e6c060', '#b05a3a']), r=0)   # 菜
        xf.box(cp('#c9ccce'), c0, c1, y0 + 1.28, y0 + 1.31, cz0 + 0.05, cz1 - 0.05)                        # 防噴罩的頂框
        for x in (c0 + 0.02, (c0 + c1) / 2, c1 - 0.02): xf.box(cp('#c9ccce'), x - 0.015, x + 0.015, y0 + 0.9, y0 + 1.3, cz1 - 0.06, cz1 - 0.03)
        xf.box(acc(M['glass']), c0, c1, y0 + 1.0, y0 + 1.28, cz1 - 0.055, cz1 - 0.04)                        # 防噴罩的玻璃（客人那一面）
        for k in range(6): vb(c0 - 0.55, c0 - 0.15, y0 + 0.7 + k * 0.018, y0 + 0.715 + k * 0.018, cz0 + 0.1, cz1 - 0.1, '#c9a45a' if k % 2 else '#b88f48', r=0.004)   # 餐盤（疊起來）
        vb(c0 - 0.6, c0 - 0.1, y0, y0 + 0.7, cz0 + 0.05, cz1 - 0.05, '#e8e4dc', r=0.01)
        _lathe(cp('#b9bcbf'), xf, [(0.0, 0.0), (0.2, 0.0), (0.22, 0.32), (0.18, 0.36), (0.0, 0.38)], c1 + 0.35, y0 + 0.7, (cz0 + cz1) / 2, seg=12)   # 大電鍋
        vb(c1 + 0.1, c1 + 0.6, y0, y0 + 0.7, cz0 + 0.05, cz1 - 0.05, '#e8e4dc', r=0.01)
        vb(-iw / 2 + 0.6, iw / 2 - 0.6, y0 + 1.75, y0 + 2.35, zb + 0.005, zb + 0.02, '#fbf8f0', r=0)          # 後牆的價目板（白底紅字的條）
        for j in range(int((iw - 1.6) / 0.5)): vb(-iw / 2 + 0.75 + j * 0.5, -iw / 2 + 1.05 + j * 0.5, y0 + 1.85, y0 + 2.25, zb + 0.02, zb + 0.025, '#c0392b', r=0)
    elif kind == 'tea':                                                                                     # 手搖飲（118 巷一一八茶飲）：臨街的點餐櫃台＋後面的工作檯（和公館騎樓的同一套）
        (_drink(xf, iw, gzf, zb, cm, pid, spec['sf']['drink']) if spec.get('sf', {}).get('drink') else _tea(xf, iw, gzf, zb, cm, pid))
    if spec.get('sf', {}).get('oven'): _l118_oven(spec, xf, cm, iw, zb, y0, yt)
    _shade_interior(cm, xf, iw, gz, yt, bright, warm)
    cm.finish(root, uv=False)


def _pot_pick(it, x):
    """門廊盆栽的種類（第四個欄位）：broad＝紅陶大葉、tall_w＝高的白瓷圓筒盆、broad_w＝白瓷碗形盆、fern_c＝水泥盆蕨類；沒寫＝紅陶蕨類（ADE-V2.1）"""
    v = it[3] if len(it) > 3 else None
    return {'broad': POT_BROAD, 'tall_w': globals().get('POT_TALL_W', POT_BROAD), 'broad_w': globals().get('POT_BROAD_W', POT_BROAD), 'fern_c': globals().get('POT_FERN_C', POT_FERN[0])}.get(v) or POT_FERN[int(abs(x * 7)) % 2]


_FNP = {}
def _fn_proto(kind, *a):   # 花序門口的樹、花箱：用到才建（只有公館那一組有）
    if (kind, a) not in _FNP: _FNP[(kind, a)] = p_fntree() if kind == 'tree' else p_fnbox(*a)
    return _FNP[(kind, a)]


FRUIT = {}
def acc_fruit(col):
    if col not in FRUIT: FRUIT[col] = L.flat(f'wz_fruit_{col[1:]}', col, rough=0.45)
    return acc(FRUIT[col])


def xf_vbox(cm, xf, x0, x1, y0, y1, z0, z1, col, k=1.0, r=0.0):   # 預設直角（小東西倒角看不出來，一個要多 100 個三角形）；櫃台、桌子在呼叫時給 r
    a = xf.p(x0, y0, z0); b = xf.p(x1, y1, z1); args = (min(a[0], b[0]), max(a[0], b[0]), y0, y1, min(a[2], b[2]), max(a[2], b[2]), col, k)
    cm.crbox(*args, r=r, seg=1) if r > 0 else cm.cbox(*args)   # 店裡的東西隔著玻璃看：倒角一段就夠


def xf_cyl(m, xf, a, b, r, seg=8): xf.cyl(m, a, b, r, seg=seg); return m


def _lathe(m, xf, prof, x, y, z, seg=14):
    bm = L.lathe(prof, seg=seg); m.add_bm(bm, Matrix.Translation(g2b(*xf.p(x, y, z)))); bm.free()


# ---------------- 騎樓下的兩間小店（B5：巷口茶飲＋夏日冰菓室，AA-B 10-16）----------------
class OffXf:
    """把一棟建築的 Xf 往自己的 x 方向平移 ox（騎樓裡左右兩間店各用自己的座標，中心＝0）"""
    def __init__(self, xf, ox): self.xf, self.ox, self.ry = xf, ox, xf.ry
    def p(self, x, y, z): return self.xf.p(x + self.ox, y, z)
    def box(self, m, x0, x1, y0, y1, z0, z1): return self.xf.box(m, x0 + self.ox, x1 + self.ox, y0, y1, z0, z1)
    def quad(self, m, pts): return self.xf.quad(m, [(x + self.ox, y, z) for (x, y, z) in pts])
    def cyl(self, m, a, b, r, **kw): return self.xf.cyl(m, (a[0] + self.ox, a[1], a[2]), (b[0] + self.ox, b[1], b[2]), r, **kw)


def uvquad(name, mat, pts, uv=(0.0, 0.0, 1.0, 1.0), parent=None):
    """一片有自己 UV 範圍的四邊形（菜單燈箱、季節節點裡的紙條）：pts＝世界座標，左下、右下、右上、左上"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts]); u0, v0, u1, v1 = uv
    for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent or root; return ob


def note_uv(cell):
    i = NOTES.index(cell); col, row = i % 4, i // 4; v1 = 1 - row / 4; return (col / 4, v1 - 0.25, (col + 1) / 4, v1)


def vbox(cm, xf, x0, x1, y0, y1, z0, z1, col, k=1.0, r=0.015):
    """頂點色的倒角方塊（CMesh 吃世界座標；建築只轉 π/2 的倍數，所以兩個角換算後取最小最大就好）。r＝0 是直角"""
    a = xf.p(x0, y0, z0); b = xf.p(x1, y1, z1); args = (min(a[0], b[0]), max(a[0], b[0]), y0, y1, min(a[2], b[2]), max(a[2], b[2]), col, k)
    cm.crbox(*args, r=r, seg=2) if r > 0 else cm.cbox(*args)


SK['menu_tea'] = _img_mat('wz_menu_tea', 'shop_menu_tea.png', rough=0.35, emit=0.8)
SK['menu_tea_wz'] = _img_mat('wz_menu_tea_wz', 'shop_menu_tea_wz.png', rough=0.35, emit=0.8)   # 溫州街巷口茶飲（B5）：AA_364 第 2 節的四樣；公館的手搖飲照舊
SK['menu_ice'] = _img_mat('wz_menu_ice', 'shop_menu_ice.png', rough=0.7)
SEASON_KEEP = []


def arcade_split_v2(spec, xf, W, wall):
    """騎樓（深 3 m，走得到）＋後面兩間 2.6 m 深的立體小店（看得到裡面，不能進去）。分隔柱在兩店中間：遊戲要加一個導航阻擋（交付時寫明座標）"""
    dep, D2 = 3.0, 2.6; zf, zb = -dep, -dep - D2; yo = 2.6; ceil_y = GH - 0.35
    # 騎樓：天花板、地坪、柱子、日光燈
    xf.box(acc(M['ceilA']), -W / 2, W / 2, ceil_y, GH - 0.12, -dep, 0.0)
    xf.box(acc(M['sidewalk']), -W / 2, W / 2, 0.0, 0.05, -dep, 0.0)
    xs = [-W / 2] + [p['x1'] for p in spec['sf']['split'][:-1]] + [W / 2]
    for k, px in enumerate(xs):
        cx = min(max(px, -W / 2 + 0.3), W / 2 - 0.3); xf.box(acc(M['pillar']), cx - 0.275, cx + 0.275, 0.05, ceil_y, -0.575, -0.025)
    for k in range(max(1, round(W / 2.5))):
        tx = -W / 2 + (k + 0.5) * W / max(1, round(W / 2.5)); xf.box(acc(M['tube']), tx - 0.6, tx + 0.6, ceil_y - 0.03, ceil_y, -dep * 0.55 - 0.05, -dep * 0.55 + 0.05)
    for part in spec['sf']['split']:
        w = part['x1'] - part['x0']; ox = (part['x0'] + part['x1']) / 2; px = OffXf(xf, ox); s = part['shop']; pid = part['id']
        # 店面的骨架：開口上方的牆（騎樓那一面）、鐵捲門箱、兩側的牆、天花板、地板、後牆
        px.box(wall, -w / 2, w / 2, yo, ceil_y, zf - 0.15, zf)
        px.box(acc(M['alu']), -w / 2 + 0.25, w / 2 - 0.25, yo - 0.28, yo, zf, zf + 0.26)
        for sx in (-1, 1): px.box(acc(M['alu']), sx * (w / 2 - 0.25) - 0.035, sx * (w / 2 - 0.25) + 0.035, 0.0, yo - 0.28, zf, zf + 0.08)
        for sx in (-1, 1): px.box(acc(M['plaster']), sx * (w / 2 - 0.12) - 0.12, sx * (w / 2 - 0.12) + 0.12, 0.0, ceil_y, zb, zf)
        px.box(acc(M['ceilA']), -w / 2, w / 2, 2.95, 3.0, zb, zf)
        px.box(acc(SK[part['floor']]), -w / 2 + 0.24, w / 2 - 0.24, 0.0, 0.06, zb, zf)
        # 招牌（騎樓外、這一間的上方；字由遊戲畫）
        sw = min(w - 0.6, 5.2); key = SIGNMAP.get(pid)
        if key and key + '_h' in SIGN_ATLAS:
            hsign(px, pid, key + '_h', 0.0, sw, GH - 0.3, lamps=part.get('lamps'), lampcol=part.get('lampcol', 'goose_dark'))
            if key + '_v' in SIGN_ATLAS: vsign_tex(px, pid, key + '_v', w / 2 - 0.45, GH + 0.75)
        else:
            sy0, sy1 = GH - 0.67, GH - 0.05
            px.box(acc(SK['alu2']), -sw / 2 - 0.05, sw / 2 + 0.05, sy0 - 0.05, sy1 + 0.05, 0.0, 0.22)
            face(f'SIGN_FACE_{pid}', M['board'], px, [(-sw / 2, sy0, 0.225), (sw / 2, sy0, 0.225), (sw / 2, sy1, 0.225), (-sw / 2, sy1, 0.225)],
                 {'sign': s['name'], 'sub': s.get('sub', ''), 'bg': s.get('signBg', '#3b2a1e'), 'color': s.get('signColor', '#f4ead8'), 'serif': 1 if s.get('serif') else 0, 'band': s.get('band', '')})
            CL.glow(root, 'signbox', *px.p(0, (sy0 + sy1) / 2, 0.6), color='rgba(255,250,235,1)', size=2.0, day=0.0, night=0.5)
        for lx in (-w / 4, w / 4):                                                                  # 店裡的燈
            px.box(acc(M['tube']), lx - 0.55, lx + 0.55, 2.92, 2.95, (zf + zb) / 2 - 0.06, (zf + zb) / 2 + 0.06)
            CL.glow(root, 'shoplamp', *px.p(lx, 2.6, (zf + zb) / 2), color='rgba(250,252,255,1)', size=1.6, day=0.0, night=0.8)
        unlit = SET == 'wenzhou' and bool(part.get('front'))   # WZ-SECOND-1104 v3（使用者 06:2x：這五間的室內就是從外面看得到的那一塊）：店裡改用和其他店內一樣的 unlit 頂點色＋越裡面越暗，
        cm = L.CMesh(f'sk_in_{pid}', IN_VC) if unlit else _cm(f'sk_{pid}_vc')   # 原本受光的材質在騎樓陰影下整片發黑（參考圖窗口裡是亮的）；店面牆、窗框、腰板另外一個受光的網格
        if part.get('front'): cmf = _cm(f'sk_{pid}_front_vc'); split_front(px, w, zf, yo, part, wall, cmf); cmf.finish(root, uv=False)   # 騎樓後面的店面牆＋外帶窗口（照參考圖；騎樓和導航不變）
        if part['kind'] == 'tea': _tea(px, w, zf, zb, cm, pid)
        else: _ice(px, w, zf, zb, cm, pid, yo)
        if unlit: _shade_interior(cm, px, w, zf, 2.95, bright=0.78, warm=True)
        cm.finish(root, uv=False)
        for (cn, x, y, ww, hh) in part.get('notes', []): note(px, cn, x, y, ww, hh, zf + 0.09)
        for it in part.get('clutter', []):
            k, x, z = it[0], it[1], it[2]
            if k == 'aboard': aboard(px, x, zf + z, it[3] if len(it) > 3 else 'chalk')
            elif k == 'pot': _pm = _pot_pick(it, x); _w = _wp(px, x, zf + z); B.instance(_pm, f'skpot_{pid}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], x * 1.7)
            else: inst(PROTO[k], f'sk_{k}_{pid}', px, x, 0.0, zf + z)


def split_front(px, w, zf, yo, part, wall, cm):
    """WZ-SECOND-1104（使用者 11-04 05:4x 參考圖 dida_tea_ext、summer_ice_ext）：原本整面打開的小店 → 店面牆（大樓外牆的磁磚）＋窗口＋門。
    牆在 zf−0.1～zf（店裡那一側；騎樓走得到的範圍、導航都不動）。fr＝窗框、門框顏色；awning＝窗口上方的條紋雨遮（伸進騎樓 0.55 m，下緣 2.05 m，不擋人）；
    wains＝窗口下的木腰板（冰菓室的薄荷綠直條木板）；door＝(x0, x1) 雙開玻璃格子門；menu＝(cell, x, y, w, h) 牆上的價目牌；flag＝(cell, x) 門邊的「冰」旗；curtain＝窗口上緣的短布簾"""
    F = part['front']; wx0, wx1 = F['win']; wy0, wy1 = F.get('win_y', (0.98, 2.2)); z0, z1 = zf - 0.1, zf
    frm = vc_or(F.get('frame', '#4a2e1c')); x0, x1 = -w / 2 + 0.24, w / 2 - 0.24
    holes = sorted([(wx0, wx1, wy0, wy1)] + ([(F['door'][0], F['door'][1], 0.06, 2.2)] if F.get('door') else []))
    cx = x0
    for (a, b, ya, yb) in holes:                                                                       # 開口之間的整片牆
        if a > cx: px.box(wall, cx, a, 0.0, yo, z0, z1)
        px.box(wall, a, b, yb, yo, z0, z1)
        if ya > 0.1: px.box(wall, a, b, 0.0, ya, z0, z1)
        cx = b
    if cx < x1: px.box(wall, cx, x1, 0.0, yo, z0, z1)
    for (a, b, ya, yb) in holes:                                                                       # 開口的框
        for xx in (a, b - 0.06): vbox(cm, px, xx, xx + 0.06, ya, yb, z0 - 0.01, z1 + 0.02, frm)
        vbox(cm, px, a, b, yb - 0.06, yb, z0 - 0.01, z1 + 0.02, frm)
    if F.get('wains'):                                                                                 # 木腰板（直條）
        col = F['wains']; vbox(cm, px, wx0, wx1, 0.06, wy0, z1, z1 + 0.035, col)
        for k in range(int((wx1 - wx0) / 0.13)): xx = wx0 + 0.065 + k * 0.13; vbox(cm, px, xx - 0.006, xx + 0.006, 0.08, wy0 - 0.03, z1 + 0.035, z1 + 0.04, '#6f9690')
    px.box(acc(SK['steel'] if F.get('ledge', 'steel') == 'steel' else SK['wood_lt']), wx0 - 0.04, wx1 + 0.04, wy0 - 0.04, wy0, z0 - 0.5, z1 + 0.12)   # 窗台（外帶的檯面）
    if F.get('door'):
        a, b = F['door']; m_ = (a + b) / 2; dcol = F.get('door_col', F.get('frame', '#4a2e1c'))
        for (p0, p1) in ((a + 0.06, m_), (m_, b - 0.06)):
            vbox(cm, px, p0, p1, 0.06, 0.95, z0 + 0.03, z0 + 0.07, dcol)
            for (q0, q1) in ((p0, p0 + 0.06), (p1 - 0.06, p1)): vbox(cm, px, q0, q1, 0.95, 2.14, z0 + 0.03, z0 + 0.07, dcol)
            for yy in (0.95, 1.55, 2.08): vbox(cm, px, p0, p1, yy, yy + 0.06, z0 + 0.03, z0 + 0.07, dcol)
            vbox(cm, px, (p0 + p1) / 2 - 0.02, (p0 + p1) / 2 + 0.02, 0.95, 2.14, z0 + 0.03, z0 + 0.07, dcol)
            px.box(acc(M['glass']), p0 + 0.06, p1 - 0.06, 1.0, 2.1, z0 + 0.045, z0 + 0.055)
    aw = F.get('awning')
    if aw:                                                                                             # 窗口上的條紋雨遮
        m = acc(SK[aw]); ax0, ax1 = wx0 - 0.15, (F['door'][1] + 0.1) if F.get('awn_door') else wx1 + 0.15; ay0, ay1, ad = wy1 + 0.38, 2.05, 0.55
        px.quad(m, [(ax0, ay0, z1), (ax1, ay0, z1), (ax1, ay1, z1 + ad), (ax0, ay1, z1 + ad)]); px.quad(m, [(ax0, ay0, z1), (ax1, ay0, z1), (ax1, ay1, z1 + ad), (ax0, ay1, z1 + ad)][::-1])
        n = int((ax1 - ax0) / 0.25)
        for k in range(n):                                                                             # 下緣一片一片的扇形垂邊
            a_ = ax0 + k * (ax1 - ax0) / n; b_ = a_ + (ax1 - ax0) / n
            pts = [(a_, ay1, z1 + ad)] + [(a_ + (b_ - a_) * t / 6, ay1 - 0.12 * math.sin(math.pi * t / 6) - 0.04, z1 + ad) for t in range(1, 6)] + [(b_, ay1, z1 + ad)]
            bm = bmesh.new(); vs = [bm.verts.new(g2b(*px.p(*q))) for q in pts]; bm.faces.new(vs); m.add_bm(bm); bm.free()
            bm = bmesh.new(); vs = [bm.verts.new(g2b(*px.p(*q))) for q in pts[::-1]]; bm.faces.new(vs); m.add_bm(bm); bm.free()
        for xx in (ax0, ax1): px.cyl(acc(M['metal']), (xx, ay0, z1), (xx, ay1 + 0.02, z1 + ad), 0.012, seg=5)
    if F.get('curtain'):                                                                               # 窗口上緣的短布簾（冰菓室參考圖）
        n = 4; cw = (wx1 - wx0 - 0.12) / n
        for k in range(n): vbox(cm, px, wx0 + 0.06 + k * cw + 0.02, wx0 + 0.06 + (k + 1) * cw - 0.02, wy1 - 0.42, wy1 - 0.06, z0 - 0.06, z0 - 0.05, '#efe8d8')
    if F.get('menu'):
        cn, mx, my, mw_, mh_ = F['menu']; vbox(cm, px, mx - mw_ / 2 - 0.03, mx + mw_ / 2 + 0.03, my - 0.03, my + mh_ + 0.03, z1, z1 + 0.03, '#6a4a30'); note(px, cn, mx, my, mw_, mh_, z1 + 0.035)
    if F.get('flag'):                                                                                  # 「冰」旗：牆上伸出的鐵桿掛一面布
        cn, fx = F['flag']; px.cyl(acc(M['metal']), (fx, 2.3, z1), (fx, 2.3, z1 + 0.5), 0.012, seg=5)
        q = [px.p(fx - 0.0, 1.62, z1 + 0.47), px.p(fx, 1.62, z1 + 0.05), px.p(fx, 2.28, z1 + 0.05), px.p(fx, 2.28, z1 + 0.47)]
        note_tilt(q, cn); note_tilt([q[1], q[0], q[3], q[2]], cn)
    for (cx_, kind) in F.get('pots', []):
        _pm = POT_BROAD if kind == 'broad' else POT_FERN[int(abs(cx_ * 7)) % 2]; _w = _wp(px, cx_, z1 + 0.25); B.instance(_pm, f'skpot_{part["id"]}_{len(_inst)}', *_w, root, ry=cx_ * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], cx_ * 1.7)


def vc_or(c): return c


def _tea(px, w, zf, zb, cm, pid):
    """手搖飲：臨騎樓的點餐櫃台（白色＋綠色腰帶、不鏽鋼檯面）、收銀機、杯子、封口機；後面的工作檯（茶桶、搖茶機、冰桶）、
    牆上的層架（杯子、茶葉罐）；菜單燈箱掛在櫃台上方，後牆再一個"""
    c0, c1 = -w / 2 + 0.35, w / 2 - 1.25                                                             # 櫃台（右邊留員工進出的門）
    vbox(cm, px, c0, c1, 0.06, 0.98, zf - 0.62, zf - 0.04, '#eeebe3'); vbox(cm, px, c0, c1, 0.06, 0.14, zf - 0.6, zf - 0.03, '#3a3a3a')
    vbox(cm, px, c0, c1, 0.72, 0.84, zf - 0.035, zf - 0.03, '#7a9a5a')
    px.box(acc(SK['steel']), c0 - 0.03, c1 + 0.03, 0.98, 1.03, zf - 0.66, zf)
    vbox(cm, px, c0 + 0.3, c0 + 0.62, 1.03, 1.1, zf - 0.45, zf - 0.2, '#2c2c2e'); vbox(cm, px, c0 + 0.34, c0 + 0.58, 1.1, 1.3, zf - 0.42, zf - 0.38, '#1e2a36')  # 收銀機
    for k in (range(3) if pid != 'B5' else ()):                                                     # 杯子（疊起來的透明杯；帝大紅茶換成 wz2_tea 的杯塔）
        cx = c0 + 1.1 + k * 0.14; px.cyl(acc(M['glass']), (cx, 1.03, zf - 0.3), (cx, 1.38, zf - 0.3), 0.045, seg=10)
    x_ = c1 - 0.6; vbox(cm, px, x_, x_ + 0.36, 1.03, 1.42, zf - 0.55, zf - 0.15, '#f2f2ee'); vbox(cm, px, x_ + 0.04, x_ + 0.32, 1.22, 1.3, zf - 0.17, zf - 0.13, '#30343a')   # 封口機
    vbox(cm, px, c1 - 1.6, c1 - 1.1, 1.03, 1.06, zf - 0.4, zf - 0.1, '#d84a3a')                       # 取餐的紅色托盤
    if pid == 'B5' and SET == 'wenzhou': wz2_tea(px, w, zf, zb, cm, random.Random(523)); return   # WZ-SECOND-1104 v2 帝大紅茶：茶桶三個不同大小、杯塔不同高度、罐子大小不同；拿掉菜單燈箱（價目牌在店外的牆上）
    # 後面的工作檯＋茶桶
    px.box(acc(SK['steel']), -w / 2 + 0.3, w / 2 - 0.3, 0.86, 0.9, zb, zb + 0.62)
    vbox(cm, px, -w / 2 + 0.3, w / 2 - 0.3, 0.06, 0.86, zb + 0.02, zb + 0.6, '#c9ccce', 0.9)
    for k in range(4):
        cx = -w / 2 + 0.7 + k * 0.42; px.cyl(acc(SK['steel']), (cx, 0.9, zb + 0.32), (cx, 1.42, zb + 0.32), 0.16, seg=14)
        vbox(cm, px, cx - 0.02, cx + 0.02, 0.98, 1.04, zb + 0.46, zb + 0.54, '#222222')
    vbox(cm, px, 0.4, 0.95, 0.9, 1.3, zb + 0.1, zb + 0.55, '#d8dadb'); vbox(cm, px, 0.45, 0.9, 1.3, 1.33, zb + 0.12, zb + 0.5, '#555a60')   # 搖茶機
    vbox(cm, px, 1.2, 1.9, 0.9, 1.1, zb + 0.08, zb + 0.56, '#e9ecef')                                 # 冰桶
    # 後牆：白磁磚、層架（杯子、茶葉罐）、菜單燈箱
    px.box(acc(SK['f_white']), -w / 2 + 0.24, w / 2 - 0.24, 0.0, 2.95, zb - 0.05, zb)
    for y in (1.62, 2.0):
        px.box(acc(SK['wood_lt']), -w / 2 + 0.4, -0.3, y, y + 0.03, zb, zb + 0.28)
        for k in range(9):
            cx = -w / 2 + 0.55 + k * 0.3; col = ['#c8a26a', '#7a5a3a', '#4a6a3a', '#d9c7a0'][k % 4]
            vbox(cm, px, cx - 0.08, cx + 0.08, y + 0.03, y + 0.26, zb + 0.06, zb + 0.22, col)
    mw, mh = 1.9, 0.71; mt = SK['menu_tea_wz'] if pid == 'B5' else SK['menu_tea']
    uvquad(f'sk_menu_{pid}_back', mt, [px.p(0.3, 1.95, zb + 0.02), px.p(0.3 + mw, 1.95, zb + 0.02), px.p(0.3 + mw, 1.95 + mh, zb + 0.02), px.p(0.3, 1.95 + mh, zb + 0.02)])
    px.box(acc(SK['alu2']), c0 + 0.1, c0 + 0.1 + mw + 0.1, 1.92, 1.98 + mh, zf - 0.32, zf - 0.22)                                  # 櫃台上方吊著的燈箱
    uvquad(f'sk_menu_{pid}_front', mt, [px.p(c0 + 0.15, 1.95, zf - 0.215), px.p(c0 + 0.15 + mw, 1.95, zf - 0.215), px.p(c0 + 0.15 + mw, 1.95 + mh, zf - 0.215), px.p(c0 + 0.15, 1.95 + mh, zf - 0.215)])
    for sx in (0.3, mw - 0.1): px.cyl(acc(M['metal']), (c0 + 0.1 + sx, 1.98 + mh, zf - 0.27), (c0 + 0.1 + sx, 2.95, zf - 0.27), 0.008, seg=4)
    CL.glow(root, 'menubox', *px.p(c0 + 0.15 + mw / 2, 1.95 + mh / 2, zf + 0.1), color='rgba(255,252,240,1)', size=1.8, day=0.0, night=0.6)


_L118_BRICK = []
def l118_brick():
    """118 巷迪倫窯烤披薩一樓的紅磚（Poly Haven red_brick，CC0）"""
    if not _L118_BRICK: _L118_BRICK.append(L.pbr('l118_front_brick', 'red_brick', tile=1.3, target='#8e4a36', contrast=0.8, normal=0.5, maps=('diff', 'nor'), res=512, rough_value=0.85))
    return _L118_BRICK[0]


def _drink(px, w, zf, zb, cm, pid, style):
    """118 巷的兩間外帶飲料店（L118-SHOPS-REDO-1111，X338）：貼著立面的外帶櫃台，沒有室內、不能進去。第 1 版照使用者 11-11 的參考圖（l118_ref/ext_drink_a／b、int_drink_a／b）。
    style 'trad'＝喝不喝咖啡（寬 5 m）：深灰鋁框；左邊一扇關著的玻璃門、門右的玻璃貼四張飲料照片、右邊一整條外帶窗口（淺灰磁磚腰牆、不鏽鋼檯面：收銀機、吸管筒、立式菜單牌、疊杯、藍色捲膜的封口機），
      後面的工作檯上四個茶桶、義式咖啡機（兼賣咖啡）、製冰機；上面一排氣窗。
    style 'fruit'＝果茶社（寬 3 m，參考圖是寬店面：留招牌、窗口＋櫃台、水果展示櫃，門省掉）：淺金色細框；左邊淺木直紋櫃台、白檯面，窗口上方三杯水果茶的橫幅；右邊米白的牆（菜單板）＋玻璃水果展示櫃；
      後面的製茶檯（茶桶、果汁機）、木層板上的玻璃罐。
    玻璃門是關著的樣子、不是入口；菜單板的品名價錢照 AA_280（l118_signs_tex.py 的 MENUS），不照圖"""
    cp = lambda col: _CP(cm, col); trad = style == 'trad'; ct = 1.0; TOP = 2.78; TR = 2.3
    fr = acc(frame_mat('#4a4e54' if trad else '#cdb98a')); gl = acc(M['glass']); st = acc(SK['steel'])
    bar = lambda x0, x1, y0, y1: px.box(fr, x0, x1, y0, y1, zf - 0.03, zf + 0.03)
    def glass(x0, x1, y0, y1): px.quad(gl, [(x0, y0, zf + 0.005), (x1, y0, zf + 0.005), (x1, y1, zf + 0.005), (x0, y1, zf + 0.005)])
    def atlas(key, x0, y0, wd, z, name, lit=False):
        it = SIGN_ATLAS[key]; h_ = wd / it['aspect']
        uvquad(name, SK['sign_lit'] if lit else SK['sign'], [px.p(x0, y0, z), px.p(x0 + wd, y0, z), px.p(x0 + wd, y0 + h_, z), px.p(x0, y0 + h_, z)], tuple(it['uv'])); return h_
    x0_, x1_ = -w / 2 + 0.04, w / 2 - 0.04
    if trad:
        d0, d1 = x0_ + 0.04, x0_ + 0.94; p1 = d1 + 1.0; c0, c1 = p1 + 0.03, x1_ - 0.03
        for x in (x0_, d1, p1, x1_): bar(x - 0.03, x + 0.03, 0.0, TOP)                                                  # 直框：門邊、海報那一片的右邊、兩端
        bar(x0_, x1_, TR - 0.03, TR + 0.03); bar(x0_, x1_, TOP - 0.05, TOP); glass(x0_, x1_, TR + 0.03, TOP - 0.05)      # 氣窗
        for x in (d1 + (p1 - d1) * 0.0, c0 + (c1 - c0) / 3, c0 + (c1 - c0) * 2 / 3): bar(x - 0.02, x + 0.02, TR, TOP)
        bar(d0, d1, 0.0, 0.1); glass(d0, d1 - 0.03, 0.1, TR - 0.03); px.box(st, d1 - 0.16, d1 - 0.13, 0.95, 1.35, zf + 0.03, zf + 0.08)   # 關著的玻璃門＋把手
        vbox(cm, px, d0, d1, 0.06, 2.3, zf - 1.3, zf - 1.25, '#e9ebe9', r=0)                                               # 門後面：備料間的白牆、層架和紙箱
        for k in range(3): vbox(cm, px, d0 + 0.08, d1 - 0.1, 0.5 + k * 0.55, 0.53 + k * 0.55, zf - 1.25, zf - 0.9, '#b9bdc0', r=0); vbox(cm, px, d0 + 0.14 + (k % 2) * 0.2, d0 + 0.5 + (k % 2) * 0.2, 0.53 + k * 0.55, 0.83 + k * 0.55, zf - 1.2, zf - 0.95, '#c8a878', r=0)
        # 腰牆：淺灰磁磚（海報那一片和窗口下面），磁磚縫
        tile = acc(flat('l118_drink_tile_grey', '#d9dcdb', rough=0.45)); joint = acc(flat('l118_drink_tile_joint', '#b4b8b7', rough=0.7))
        px.box(tile, d1 + 0.03, x1_ - 0.03, 0.0, ct, zf - 0.1, zf + 0.02)
        for k in range(1, 4): px.box(joint, d1 + 0.03, x1_ - 0.03, k * 0.25 - 0.004, k * 0.25 + 0.004, zf + 0.02, zf + 0.024)
        for k in range(1, int((x1_ - d1) / 0.3) + 1): x = d1 + 0.03 + k * 0.3; px.box(joint, x - 0.004, x + 0.004, 0.0, ct, zf + 0.02, zf + 0.024)
        bar(d1 + 0.03, p1, ct, ct + 0.05); glass(d1 + 0.03, p1 - 0.03, ct + 0.05, TR - 0.03)                               # 海報那一片玻璃
        atlas('l118_ref_drink_a_posters', (d1 + p1) / 2 - 0.4, ct + 0.14, 0.8, zf + 0.012, f'sk_drink_{pid}_posters')
        px.box(st, c0 - 0.03, c1 + 0.03, ct, ct + 0.04, zf - 0.6, zf + 0.14)                                               # 不鏽鋼檯面（往外凸 14 cm，還在店面線裡面）
        vbox(cm, px, c0, c1, 0.06, ct, zf - 0.6, zf - 0.1, '#c9ccce')
        Y = ct + 0.04; x = c0 + 0.3
        vbox(cm, px, x - 0.16, x + 0.16, Y, Y + 0.07, zf - 0.42, zf - 0.16, '#2c2c2e'); vbox(cm, px, x - 0.15, x + 0.15, Y + 0.07, Y + 0.33, zf - 0.3, zf - 0.27, '#1c1e22')   # 收銀機（螢幕朝店員）
        px.cyl(cp('#c9ccce'), (x + 0.42, Y, zf - 0.2), (x + 0.42, Y + 0.14, zf - 0.2), 0.055, seg=10)                       # 吸管筒
        for k in range(8): px.cyl(cp('#f4f2ec'), (x + 0.39 + (k % 3) * 0.03, Y + 0.1, zf - 0.22 + (k % 2) * 0.03), (x + 0.38 + (k % 3) * 0.035, Y + 0.3, zf - 0.23 + (k % 2) * 0.04), 0.005, seg=4)
        mw = 0.46; mh = mw / SIGN_ATLAS['l118_menu_drink_a']['aspect']; mx = x + 0.7                                      # 立式菜單牌（照 AA_280 的品名價錢）
        vbox(cm, px, mx - 0.02, mx + mw + 0.02, Y, Y + mh + 0.04, zf - 0.2, zf - 0.17, '#e9e4d6', r=0); atlas('l118_menu_drink_a', mx, Y + 0.02, mw, zf - 0.165, f'sk_drink_{pid}_menu')
        for k in range(4): cx = mx + mw + 0.22 + (k % 2) * 0.14; px.cyl(gl, (cx, Y, zf - 0.3 - (k // 2) * 0.15), (cx, Y + 0.32 + (k % 2) * 0.06, zf - 0.3 - (k // 2) * 0.15), 0.045, seg=10)   # 疊杯
        sx = c1 - 0.75                                                                                                    # 封口機：機身＋上面兩捲藍色的膜
        vbox(cm, px, sx - 0.17, sx + 0.17, Y, Y + 0.42, zf - 0.52, zf - 0.18, '#dfe1df'); vbox(cm, px, sx - 0.12, sx + 0.12, Y + 0.16, Y + 0.24, zf - 0.19, zf - 0.165, '#30343a', r=0)
        for dx in (-0.09, 0.09): px.cyl(cp('#2a5fb8'), (sx + dx - 0.07, Y + 0.52, zf - 0.35), (sx + dx + 0.07, Y + 0.52, zf - 0.35), 0.085, seg=12)
        vbox(cm, px, c1 - 0.5, c1 - 0.02, 0.9, 1.75, zb + 0.05, zb + 0.6, '#c4c8ca'); vbox(cm, px, c1 - 0.46, c1 - 0.06, 1.2, 1.55, zb + 0.6, zb + 0.615, '#e8f0f4', r=0)   # 製冰機（後面右邊）
        for lx in (c0 + 0.7, c1 - 0.9): px.box(acc(M['tube']), lx - 0.55, lx + 0.55, 3.03, 3.07, zf + 0.12, zf + 0.18)       # 招牌下面的兩支日光燈
        CL.glow(root, 'drinktube', *px.p((c0 + c1) / 2, 2.9, zf + 0.2), color='rgba(244,250,255,1)', size=2.0, day=0.0, night=0.7)
    else:
        c0, c1 = x0_ + 0.03, 0.22; r0, r1 = c1 + 0.06, x1_                                                                # 左：窗口＋櫃台；右：米白的牆＋水果展示櫃
        for x in (x0_, c1 + 0.03): bar(x - 0.02, x + 0.02, 0.0, TOP)
        bar(x0_, c1 + 0.03, TOP - 0.04, TOP)
        wood = acc(flat('l118_drink_wood_lt', '#d9bb8c', rough=0.6)); wood2 = acc(flat('l118_drink_wood_lt2', '#cfae7c', rough=0.6)); cream = acc(flat('l118_drink_cream', '#f2ead8', rough=0.9))
        px.box(wood, c0, c1, 0.06, ct - 0.05, zf - 0.55, zf + 0.0)                                                         # 櫃台：淺木直紋（一條一條的細木條）
        for k in range(int((c1 - c0) / 0.06)): x = c0 + 0.03 + k * 0.06; px.box(wood2 if k % 2 else wood, x - 0.022, x + 0.022, 0.08, ct - 0.06, zf, zf + 0.012)
        px.box(acc(flat('l118_drink_top_white', '#f6f3ea', rough=0.4)), c0 - 0.03, c1 + 0.03, ct - 0.05, ct, zf - 0.6, zf + 0.12)
        bw = c1 - c0 - 0.06; bh = atlas('l118_ref_drink_b_banner', c0 + 0.03, 2.28, bw, zf - 0.02, f'sk_drink_{pid}_banner', lit=True)   # 窗口上方：三杯水果茶的橫幅（參考圖裁的）
        bar(c0, c1, 2.24, 2.27); px.box(cream, c0, c1, 2.28 + bh, TOP - 0.04, zf - 0.03, zf - 0.02)
        Y = ct; x = c0 + 0.28
        vbox(cm, px, x - 0.11, x + 0.11, Y + 0.03, Y + 0.2, zf - 0.33, zf - 0.31, '#f2f2f0', r=0); px.cyl(cp('#c9ccce'), (x, Y, zf - 0.3), (x, Y + 0.06, zf - 0.34), 0.012, seg=6)   # 平板收銀機
        for k, col in enumerate(('#f4e9a0', '#f2c030', '#f2a090')): cx = x + 0.34 + k * 0.17; px.cyl(cp(col), (cx, Y, zf - 0.22), (cx, Y + 0.17, zf - 0.22), 0.045, seg=10, r2=0.052); px.cyl(cp('#f6f6f2'), (cx, Y + 0.17, zf - 0.22), (cx, Y + 0.185, zf - 0.22), 0.056, seg=10)   # 檯上三杯成品
        px.box(cream, r0, r1, 0.0, 0.72, zf - 0.5, zf + 0.02); px.box(cream, r0, r1, 1.5, TOP, zf - 0.06, zf + 0.02)       # 右邊：米白的台座、上面的牆（掛菜單板）
        g0, g1, gy0, gy1 = r0 + 0.04, r1 - 0.04, 0.72, 1.5                                                                 # 玻璃水果展示櫃：兩層（檸檬、柳橙／葡萄柚、百香果）
        for y_ in (gy0, (gy0 + gy1) / 2): px.box(fr, g0, g1, y_, y_ + 0.02, zf - 0.46, zf)
        for (y_, cols) in ((gy0 + 0.02, ('#f08a5a', '#f2a060', '#5a2a5a', '#6a3a6a')), ((gy0 + gy1) / 2 + 0.02, ('#f4d23a', '#f4d23a', '#f08a1e', '#f08a1e'))):
            n_ = max(3, int((g1 - g0 - 0.1) / 0.11))
            for j in range(n_):
                for i_ in range(3): cp(cols[(j * 4 // n_ + 0) % 4]).sphere(px.p(g0 + 0.08 + j * (g1 - g0 - 0.16) / max(1, n_ - 1), y_ + 0.05 + (0.07 if i_ == 2 else 0.0), zf - 0.4 + (i_ % 2) * 0.16 + (0.08 if i_ == 2 else 0.0)), 0.052, seg=8, rings=5)
        for x in (g0, g1): px.box(fr, x - 0.012, x + 0.012, gy0, gy1, zf - 0.012, zf + 0.012)
        px.box(fr, g0, g1, gy1 - 0.02, gy1, zf - 0.46, zf + 0.012); glass(g0, g1, gy0 + 0.02, gy1 - 0.02)
        mw = min(0.62, r1 - r0 - 0.16); mh = mw / SIGN_ATLAS['l118_menu_drink_b']['aspect']; atlas('l118_menu_drink_b', (r0 + r1) / 2 - mw / 2, 1.62, mw, zf + 0.024, f'sk_drink_{pid}_menu')
        px.box(fr, (r0 + r1) / 2 - mw / 2 - 0.02, (r0 + r1) / 2 + mw / 2 + 0.02, 1.6, 1.62 + mh + 0.02, zf + 0.02, zf + 0.022)
        for lx in (c0 + 0.35, c1 - 0.35, (r0 + r1) / 2): acc(SK['lamp']).sphere(px.p(lx, 3.07, zf + 0.15), 0.045, seg=8, rings=4)   # 招牌下面的嵌燈
        CL.glow(root, 'drinklamp', *px.p(0.0, 2.9, zf + 0.2), color='rgba(255,226,170,1)', size=1.6, day=0.0, night=0.75)
    # 後面的工作檯：茶桶；trad 左邊一台義式咖啡機和磨豆機（兼賣咖啡）；fruit 是果汁機、砧板和切開的水果
    b0, b1 = -w / 2 + 0.2, (w / 2 - 0.75) if trad else (w / 2 - 0.2)
    if trad: b0 = d1 + 0.1
    px.box(st, b0, b1, 0.86, 0.9, zb, zb + 0.62); vbox(cm, px, b0, b1, 0.06, 0.86, zb + 0.02, zb + 0.6, '#c9ccce' if trad else '#e3d6bc', 0.9)
    mx = b0 + 0.1
    if trad:
        vbox(cm, px, mx, mx + 0.62, 0.9, 1.3, zb + 0.08, zb + 0.52, '#1e1e20'); vbox(cm, px, mx + 0.02, mx + 0.6, 1.3, 1.33, zb + 0.06, zb + 0.54, '#b9bec2', r=0)   # 義式咖啡機
        for dx in (0.16, 0.46): px.cyl(cp('#b9bec2'), (mx + dx, 1.12, zb + 0.56), (mx + dx, 1.2, zb + 0.56), 0.04, seg=8); px.cyl(cp('#f2efe8'), (mx + dx, 1.33, zb + 0.3), (mx + dx, 1.4, zb + 0.3), 0.035, seg=8)
        vbox(cm, px, mx + 0.72, mx + 0.92, 0.9, 1.22, zb + 0.15, zb + 0.4, '#2a2a2c'); px.cyl(cp('#3a2a20'), (mx + 0.82, 1.22, zb + 0.28), (mx + 0.82, 1.42, zb + 0.28), 0.08, seg=10, r2=0.1)   # 磨豆機
        mx += 1.2
    nb = 4 if trad else 2
    for k in range(nb):
        cx = mx + 0.2 + k * 0.4
        if cx + 0.2 > b1: break
        px.cyl(st, (cx, 0.9, zb + 0.32), (cx, 1.4, zb + 0.32), 0.16, seg=14); px.cyl(cp('#2a2a2c'), (cx, 1.4, zb + 0.32), (cx, 1.43, zb + 0.32), 0.165, seg=14)
        vbox(cm, px, cx - 0.02, cx + 0.02, 0.98, 1.04, zb + 0.46, zb + 0.54, '#222222', r=0)
    if not trad:
        fx = mx + 0.2 + nb * 0.4 + 0.05
        if fx + 0.2 < b1: px.cyl(cp('#e9e9e6'), (fx + 0.1, 0.9, zb + 0.3), (fx + 0.1, 1.02, zb + 0.3), 0.09, seg=10); px.cyl(gl, (fx + 0.1, 1.02, zb + 0.3), (fx + 0.1, 1.32, zb + 0.3), 0.075, seg=10)   # 果汁機
    # 後牆：trad 白磁磚＋不鏽鋼層架（杯子、茶葉罐）＋深藍的菜單板；fruit 米白牆＋木層板（玻璃罐裡的糖漬水果）
    px.box(acc(SK['f_white']) if trad else acc(flat('l118_drink_cream', '#f2ead8', rough=0.9)), -w / 2 + 0.05, w / 2 - 0.05, 0.0, 2.95, zb - 0.038, zb + 0.012)   # L118-DRINK-WALL-FLICKER-1112（使用者 11-12「飲料店牆壁一直在閃」）：原本 zb−0.05～zb，和 shallow_interior 畫的後牆（頂點色，也是 zb−0.05～zb）兩片疊在同一個平面；這一片往店裡挪 1.2 cm（已交的 lane118_street.glb 用 glb_shift_plane.py 挪了同樣的量，沒有重建）
    s0, s1 = b0 + 0.05, b1 - 0.05
    for y in ((1.75, 2.1) if trad else (1.6, 1.98)):
        px.box(st if trad else acc(SK['wood_lt']), s0, s1, y, y + 0.03, zb, zb + 0.26)
        for k in range(max(2, int((s1 - s0) / 0.24))):
            cx = s0 + 0.14 + k * 0.24
            if trad: vbox(cm, px, cx - 0.08, cx + 0.08, y + 0.03, y + 0.24, zb + 0.05, zb + 0.21, ['#1b3274', '#c8a26a', '#f1eee6', '#7a5a3a'][k % 4])
            else: px.cyl(cp(['#f4c21e', '#e8643a', '#9ac23a', '#f08a1e', '#d8486a'][k % 5]), (cx, y + 0.03, zb + 0.13), (cx, y + 0.2, zb + 0.13), 0.07, seg=10); px.cyl(cp('#b98d5e'), (cx, y + 0.2, zb + 0.13), (cx, y + 0.23, zb + 0.13), 0.075, seg=10)


def _ice(px, w, zf, zb, cm, pid, yo):
    """冰菓室：整面拉開（摺門收兩側）、前面的配料冰櫃（不鏽鋼方盒裝紅豆、綠豆、芋頭、粉圓…，斜玻璃擋板）、剉冰機、
    三張小圓桌＋塑膠凳、木板牆腰＋一排長條木牌菜單、吊扇；冬天（SEASON_ICECLOSED_on）拉下鐵捲門、貼「五月見」（AA_364 第 3 節）"""
    for sx in (-1, 1):                                                                               # 摺門收在兩側
        for k in range(4):
            x = sx * (w / 2 - 0.32 - k * 0.07); px.box(acc(SK['alu2']), x - 0.025, x + 0.025, 0.06, yo - 0.3, zf - 0.22 + (k % 2) * 0.1, zf + 0.02)
    if pid == 'B5i' and SET == 'wenzhou':                                                              # WZ-SECOND-1104 v3：店裡 unlit（和其他店內一樣），後牆用頂點色
        vbox(cm, px, -w / 2 + 0.24, w / 2 - 0.24, 0.0, 1.1, zb - 0.05, zb, '#b48a5e', r=0); vbox(cm, px, -w / 2 + 0.24, w / 2 - 0.24, 1.1, 2.95, zb - 0.05, zb, '#eee6d6', r=0)
    else:
        px.box(acc(SK['wood_lt']), -w / 2 + 0.24, w / 2 - 0.24, 0.0, 1.1, zb - 0.05, zb)                 # 後牆：木板牆腰
        px.box(acc(M['plaster']), -w / 2 + 0.24, w / 2 - 0.24, 1.1, 2.95, zb - 0.05, zb)
    mw, mh = 4.2, 1.31; mx0 = -mw / 2 + 0.3
    uvquad(f'sk_menu_{pid}', SK['menu_ice'], [px.p(mx0, 1.45, zb + 0.02), px.p(mx0 + mw, 1.45, zb + 0.02), px.p(mx0 + mw, 1.45 + mh, zb + 0.02), px.p(mx0, 1.45 + mh, zb + 0.02)])
    if pid == 'B5i' and SET == 'wenzhou': wz2_ice(px, w, zf, zb, cm, random.Random(5104))   # WZ-SECOND-1104 v2：窗台上的古早剉冰機、大小不同的配料罐、糖漿瓶、玻璃碗；後面的層架
    else:
        # 配料冰櫃（臨騎樓，左邊）
        f0, f1 = -w / 2 + 0.45, -w / 2 + 2.35; fz0, fz1 = zf - 0.85, zf - 0.12
        vbox(cm, px, f0, f1, 0.06, 0.86, fz0, fz1, '#eef0ee'); vbox(cm, px, f0, f1, 0.06, 0.14, fz0 + 0.02, fz1 + 0.01, '#5a5f63')
        px.box(acc(SK['steel']), f0, f1, 0.86, 0.9, fz0, fz1)
        tops = ['#5c2420', '#8e9a3e', '#b8a0c6', '#c9a46a', '#2a2220', '#e6c25a', '#d9d2c0', '#1e1a16', '#c98aa0', '#f0eadc']
        for i in range(10):
            c_, r_ = i % 5, i // 5; tx = f0 + 0.12 + c_ * 0.34; tz = fz0 + 0.12 + r_ * 0.3
            vbox(cm, px, tx, tx + 0.3, 0.88, 0.93, tz, tz + 0.26, '#b8bcc0'); vbox(cm, px, tx + 0.02, tx + 0.28, 0.93, 0.945, tz + 0.02, tz + 0.24, tops[i])
        px.quad(acc(M['glass']), [(f0, 0.95, fz1), (f1, 0.95, fz1), (f1, 1.35, fz1 - 0.25), (f0, 1.35, fz1 - 0.25)])
        # 剉冰機（冰櫃旁的小桌）
        t0 = f1 + 0.15; vbox(cm, px, t0, t0 + 0.7, 0.06, 0.8, fz0 + 0.1, fz1, '#d0d4d6', 0.9); px.box(acc(SK['steel']), t0, t0 + 0.7, 0.8, 0.83, fz0 + 0.1, fz1)
        vbox(cm, px, t0 + 0.15, t0 + 0.55, 0.83, 1.05, fz0 + 0.25, fz1 - 0.15, '#2f6fb0'); px.cyl(acc(SK['steel']), (t0 + 0.35, 1.05, (fz0 + fz1) / 2), (t0 + 0.35, 1.32, (fz0 + fz1) / 2), 0.11, seg=12)
        vbox(cm, px, t0 + 0.2, t0 + 0.5, 1.32, 1.4, fz0 + 0.3, fz1 - 0.2, '#30343a')
    # 小圓桌＋塑膠凳
    for (tx, tz) in ((-0.1, zf - 1.55), (1.35, zf - 1.05), (2.45, zf - 1.85)):
        px.cyl(acc(SK['steel']), (tx, 0.72, tz), (tx, 0.75, tz), 0.36, seg=16); px.cyl(acc(M['metal']), (tx, 0.06, tz), (tx, 0.72, tz), 0.03, seg=6)
        px.cyl(acc(M['metal']), (tx, 0.06, tz), (tx, 0.08, tz), 0.22, seg=10)
        for (dx, dz, sp) in ((-0.5, 0.05, P_STOOL_R), (0.5, -0.05, P_STOOL_B), (0.0, 0.5, P_STOOL_R)): inst(sp, f'sk_istool_{pid}', px, tx + dx, 0.06, tz + dz)
    # 吊扇
    fx, fz = 0.9, (zf + zb) / 2; px.cyl(acc(M['metal']), (fx, 2.95, fz), (fx, 2.62, fz), 0.015, seg=5); px.cyl(acc(SK['wood_dk']), (fx, 2.6, fz), (fx, 2.66, fz), 0.09, seg=10)
    for k in range(3):
        a_ = k * 2 * math.pi / 3 + 0.4; ex, ez = math.cos(a_) * 0.62, math.sin(a_) * 0.62
        px.quad(acc(SK['wood_dk']), [(fx, 2.63, fz), (fx + ex, 2.63, fz + ez), (fx + ex * 1.0 - ez * 0.16, 2.63, fz + ez + ex * 0.16), (fx - ez * 0.12, 2.63, fz + ex * 0.12)])
    # 冬天：拉下鐵捲門＋「五月見」紙條（季節節點；夏天這組藏起來）
    grp = B.group(f'SEASON_ICECLOSED_on_{pid}', root, {'season': 'iceclosed', 'state': 'on'})   # 和公園一樣：_on＝那個季節的樣子（AA_164 1-2：只在 5～9 月開，10～4 月鐵門拉下、冬天休息）
    sh = Mesh(f'SEASON_ICECLOSED_on_{pid}_shutter', M['shutter']); px.quad(sh, [(-w / 2 + 0.27, 0.05, zf + 0.06), (w / 2 - 0.27, 0.05, zf + 0.06), (w / 2 - 0.27, yo - 0.28, zf + 0.06), (-w / 2 + 0.27, yo - 0.28, zf + 0.06)])
    sh.finish(grp, uv=True)
    uvquad(f'SEASON_ICECLOSED_on_{pid}_note', SK['notes'], [px.p(-0.35, 1.25, zf + 0.07), px.p(0.35, 1.25, zf + 0.07), px.p(0.35, 1.95, zf + 0.07), px.p(-0.35, 1.95, zf + 0.07)], note_uv('winter'), parent=grp)


# ---------------- 建築背面（對著小公園的那一面；ART-WZ1）----------------
REAR = {'A3', 'A4', 'S1'}   # 背面從小公園看得到的棟（北側 P1、P2 用正面對著公園）


def rear_facade(spec, xf, W, D, F, totalH):
    """台北老公寓的背面：後陽台的鐵窗籠（曬衣服、熱水器）、浴室廚房的小窗＋排風扇、冷氣、排水管、樓層的水泥帶；
    一樓是後門（小雨遮）、有鐵窗的小窗、瓦斯錶。全部貼在背牆外面（背牆是實心的）"""
    bp = xf.p(0, 0, -D); R = Xf(bp[0], bp[2], xf.ry + math.pi); rr = random.Random(sum(ord(c) * (i + 3) for i, c in enumerate(spec['id'])) + 77)
    dk = acc(M['ac_dark']); al = acc(M['alu']); gl = acc(M['win_glass']); band = acc(M['band']); pid = spec['id']
    n = max(1, round(W / 3.4)); bw = W / n
    for f in range(1, F):
        y0 = GH + (f - 1) * FH; yw = y0 + FH * 0.52 - 0.75
        R.box(band, -W / 2 - 0.03, W / 2 + 0.03, y0 - 0.09, y0 + 0.09, 0.0, 0.08)
        for i in range(n):
            cx = -W / 2 + (i + 0.5) * bw
            if (i + f) % 2 == 0 and bw >= 2.7:                                                     # 後陽台：暗的開口＋鐵窗籠
                R.box(dk, cx - 1.15, cx + 1.15, yw, yw + 1.55, 0.0, 0.012)
                inst(GRILLE, f'rgrille_{pid}', R, cx, yw - 0.14, 0.0)
                if rr.random() < 0.55: bake(LAUNDRY[rr.randrange(3)], f'rlaundry_{pid}', R, cx, yw - 0.14, 0.0)
                hx = cx + (0.85 if rr.random() < 0.5 else -0.85)
                R.box(acc(M['ac']), hx - 0.16, hx + 0.16, yw + 0.75, yw + 1.3, 0.02, 0.2)                           # 熱水器
                R.cyl(acc(M['pipe']), (hx, yw + 0.75, 0.1), (hx, yw + 0.35, 0.1), 0.015, seg=5)
            else:                                                                                   # 浴室／廚房的小窗＋排風扇
                wx0, wx1 = cx - 0.42, cx + 0.42; wy0 = y0 + 1.45; wy1 = wy0 + 0.62
                R.box(al, wx0 - 0.04, wx1 + 0.04, wy0 - 0.04, wy1 + 0.04, 0.0, 0.04)
                R.quad(gl, [(wx0, wy0, 0.042), (wx1, wy0, 0.042), (wx1, wy1, 0.042), (wx0, wy1, 0.042)])
                R.box(al, cx - 0.01, cx + 0.01, wy0, wy1, 0.04, 0.05)
                if rr.random() < 0.7: R.cyl(dk, (cx + 0.78, wy0 + 0.32, 0.0), (cx + 0.78, wy0 + 0.32, 0.07), 0.13, seg=10)
                if rr.random() < 0.6: inst(AC, f'rac_{pid}', R, cx - 0.95 if cx - 0.95 > -W / 2 + 0.5 else cx + 1.2, y0 + 0.55, 0.0)
    for px_ in (-W / 2 + 0.35, W * 0.12):                                                           # 排水管
        R.cyl(acc(M['pipe']), (px_, 0.0, 0.12), (px_, totalH + 0.9, 0.12), 0.05, seg=8)
    # 一樓：後門＋小雨遮、有鐵窗的小窗、瓦斯錶
    dx = -W / 2 + 1.3
    R.box(acc(SK['f_granite']), dx - 0.6, dx + 0.6, 0.0, 0.12, 0.0, 0.5)
    R.box(acc(door_mat('#6f7476')), dx - 0.45, dx + 0.45, 0.12, 2.15, 0.0, 0.05)
    R.box(acc(M['brass']), dx + 0.3, dx + 0.34, 1.0, 1.15, 0.05, 0.08)
    R.box(acc(SK['corr']), dx - 0.75, dx + 0.75, 2.45, 2.5, 0.0, 0.8)
    for wx in (W * 0.05, W * 0.32):
        if wx + 0.8 > W / 2: continue
        R.box(al, wx - 0.6, wx + 0.6, 1.2, 2.1, 0.0, 0.04); R.quad(gl, [(wx - 0.56, 1.24, 0.042), (wx + 0.56, 1.24, 0.042), (wx + 0.56, 2.06, 0.042), (wx - 0.56, 2.06, 0.042)])
        for k in range(7): bx = wx - 0.6 + k * 0.2; R.box(acc(M['grille']), bx - 0.01, bx + 0.01, 1.15, 2.15, 0.12, 0.14)
        R.box(acc(M['grille']), wx - 0.65, wx + 0.65, 1.13, 1.16, 0.0, 0.14); R.box(acc(M['grille']), wx - 0.65, wx + 0.65, 2.14, 2.17, 0.0, 0.14)
    inst(PROTO['meter'], f'rmeter_{pid}', R, dx + 1.0, 1.4, 0.0)


# ---------------- 每一間的樣式（7b-2：相鄰的店至少三樣不同）----------------
# 門廊雜物的 z：從玻璃（−recess）往外量，0.1～0.8；x：建築自己的座標（−W/2..W/2）
def arcade_front_v2(spec, xf, W, wall):
    """公館的騎樓店面（ART-GG-SHOPS-1018；使用者 10-18 05:5x「公館的店面從外面看都好醜」）。
    原本（wz_street.shopfront）：十五間都是一整片玻璃＋四根直框＋玻璃後 1.2 m 一張店內貼圖；騎樓地板整條同一種、柱子同一種磁磚；晚上騎樓沒有燈光。
    現在照溫州街的店面組件（7b 店面設計準則）：
      ①茶飲是臨騎樓的立體點餐櫃台（溫州街巷口茶飲同一套）；其他店的玻璃後面照舊是店內景深卡（遊戲畫的，亮）——
        試做立體的淺店內（inner=True）：在 3 m 深的騎樓後面白天太暗，書店一片黑、腳踏車行只剩灰牆，比景深卡差，沒用；
      ②每家不同的門：鋁門、木框玻璃門、自動門、整面拉開、木格拉門＋暖簾；鐵捲門箱＋導軌；
      ③每棟騎樓的地磚不同（台北的騎樓一棟一種）；柱子、店與店之間的壁柱包這一棟的外牆；
      ④玻璃上的紙條（營業時間、徵人、支付貼紙、價目表…，全部虛構、沒有品牌）；⑤騎樓日光燈、店內燈晚上亮。
    招牌照舊（設計稿貼圖集）。騎樓裡不放雜物：騎樓走得到，導航、店門互動點都不動（zones3d.js 的 gongguan 不用改）"""
    s = spec['shop']; sf = spec['sf']; dep = 3.0; gz = -dep; iw = W - 0.6; ih = GH - 0.9; fr = frame_mat(s.get('frame', '#3b2a1e'))
    ceil_y = GH - 0.35; top = ceil_y - 0.02; kind = sf.get('kind', s['type'])
    # 店內
    XSM = spec.get('xs')
    if XSM: gg_front(spec, xf, W, wall, gz, ceil_y)                                                 # 公館四間新店（AA_647）：照參考圖的店面
    elif kind == 'tea':                                                                               # 手搖飲：臨騎樓的點餐櫃台（溫州街巷口茶飲同一套）
        xf.box(acc(SK[sf['floor_in']]), -iw / 2, iw / 2, 0.0, 0.06, gz - DI, gz)
        for sx in (-1, 1): xf.box(acc(M['plaster']), sx * iw / 2 - 0.04, sx * iw / 2 + 0.04, 0.0, ceil_y, gz - DI, gz - 0.012)   # 前端退到壁柱後面 1.2 cm（BUG-WZFLICKER-2）
        xf.box(acc(M['ceilA']), -iw / 2, iw / 2, 2.95, 3.0, gz - DI, gz)
        cm = _cm(f'sk_{spec["id"]}_vc'); _tea(OffXf(xf, 0.0), iw, gz, gz - DI, cm, spec['id']); cm.finish(root, uv=False)
        for lx in (-iw / 4, iw / 4):
            xf.box(acc(M['tube']), lx - 0.55, lx + 0.55, 2.92, 2.95, gz - DI / 2 - 0.06, gz - DI / 2 + 0.06)
            CL.glow(root, 'shoplamp', *xf.p(lx, 2.6, gz - DI / 2), color='rgba(250,252,255,1)', size=1.6, day=0.0, night=0.8)
        xf.box(wall, -W / 2, W / 2, 3.0, ceil_y, gz - 0.15, gz)                                      # 開口上方的牆
        a = acc(M['alu']); xf.box(a, -iw / 2 + 0.05, iw / 2 - 0.05, 2.72, 3.0, gz, gz + 0.26)
        for sx in (-1, 1): xf.box(a, sx * (iw / 2 - 0.05) - 0.035, sx * (iw / 2 - 0.05) + 0.035, 0.0, 2.72, gz, gz + 0.08)
    else:
        if sf.get('inner'): shallow_interior(dict(spec, shop=dict(s, type=kind)), xf, iw, gz, ih, bright=sf.get('bright', 0.85))   # 騎樓底下（只有環境光）：店裡要比騎樓亮
        else:                                                                                         # 店內景深卡（遊戲畫 TK.interiorTex(店種)，亮的）：立體的淺店內在 3 m 深的騎樓後面白天太暗（試做：書店一片黑）
            face(f'INTERIOR_FACE_{spec["id"]}', M['board'], xf, [(-iw / 2, 0.15, gz - 1.2), (iw / 2, 0.15, gz - 1.2), (iw / 2, ih + 0.15, gz - 1.2), (-iw / 2, ih + 0.15, gz - 1.2)], {'interior': s['type']})
            xf.box(acc(M['gwall']), -iw / 2, iw / 2, 0, 0.15, gz - 1.3, gz)
            for sx in (-1, 1): xf.box(acc(M['ceilA']), sx * iw / 2 - 0.03, sx * iw / 2 + 0.03, 0.15, ih + 0.15, gz - 1.2, gz - 0.012)   # 前端退到壁柱後面 1.2 cm（BUG-WZFLICKER-2）
        _door_glass(spec, xf, sf, iw, ih, gz, fr, top)
        xf.box(wall, -W / 2, W / 2, ih + 0.18, ceil_y, gz - 0.15, gz)                                # 店門上方到騎樓天花板的牆
    for sx in (-1, 1): xf.box(wall, sx * (W / 2 - 0.15) - 0.15, sx * (W / 2 - 0.15) + 0.15, 0.0, ceil_y, gz - (0.9 if XSM else (DI if (sf.get('inner') or kind == 'tea') else 1.3)) - 0.1, gz)   # 店與店之間的壁柱（這一棟的外牆）
    # 騎樓：天花板、這一棟的地磚、柱子（包外牆）、日光燈（晚上亮）
    xf.box(acc(flat('wz_arcade_ceiling_warm', XSM['ceilc'], rough=0.9, emit=B.srgb('#7a6444'))) if (XSM and XSM.get('ceilc')) else acc(M['ceilA']), -W / 2, W / 2, ceil_y, GH - 0.12, -dep, 0.0)   # ceilc＝騎樓天花板被店裡的暖燈照亮（禮貌生財：米白＋一點暖色自發光；預設的天花板在背光面，遊戲裡招牌下面壓成一條黑）
    xf.box(acc(SK[sf['floor']]), -W / 2, W / 2, 0.0, 0.05, -dep, 0.0)
    pm = Mesh(f'pillar_{spec["id"]}', pillar_mat(spec['wall']))   # 柱子：外牆的樣子，但自己一個材質 wz_pillar_<牆>——遊戲照材質名加「樹幹透視」（擋住玩家時網點透空；10-20 gongguan_glb_integration 查到 10-18 包外牆以後沒了）
    for sx in spec.get('pillars', (-W / 2 + 0.3, W / 2 - 0.3)):
        xf.box(pm, sx - 0.275, sx + 0.275, 0.05, ceil_y, -0.575, -0.025)
        xf.box(acc(SK['f_granite']), sx - 0.29, sx + 0.29, 0.05, 0.45, -0.59, -0.01)                  # 柱腳的石材護角
    if not pm.empty(): set_tint(pm.finish(root), spec['color'], spec['wall'])
    nl = max(1, round(W / 2.5))
    for k in range(nl):
        tx = -W / 2 + (k + 0.5) * W / nl; xf.box(acc(M['tube']), tx - 0.6, tx + 0.6, ceil_y - 0.03, ceil_y, -dep * 0.55 - 0.05, -dep * 0.55 + 0.05)
        CL.glow(root, 'arcadelamp', *xf.p(tx, ceil_y - 0.2, -dep * 0.55), color='rgba(255,214,150,1)' if (XSM and XSM.get('lamp_warm')) else 'rgba(244,248,255,1)', size=2.4 if (XSM and XSM.get('lamp_warm')) else 1.5, day=0.0, night=0.9 if (XSM and XSM.get('lamp_warm')) else 0.7)
    # 招牌（設計稿；和原本的 shopfront 同一套）
    sw = min(W - 0.4, 6.5); sy0, sy1 = GH - 0.67, GH - 0.03
    if XSM and XSM.get('lane'): pass   # 巷口：樑上沒有招牌
    elif XSM and XSM.get('shut'):   # 空店面：招牌拆掉了，樑上只剩一塊沒有字的舊招牌底板（不寫字、晚上不亮）
        xf.box(acc(SK['alu2']), -sw / 2 - 0.04, sw / 2 + 0.04, sy0 - 0.05, sy1 + 0.03, 0.0, 0.16); xf.box(acc(frame_mat('#d9d6cc')), -sw / 2, sw / 2, sy0, sy1, 0.16, 0.168)
    elif XSM and XSM.get('street'):   # 公館四間新店：騎樓外的招牌也是參考圖裁的字（沒有 street 的——燒臘 G00——照下面一般的招牌：設計稿或空白板面由遊戲畫字）（同一塊招牌，貼在騎樓樑上給馬路看）
        key = XSM['street']; h_ = sy1 - sy0; w_ = min(sw, h_ * XS_ATLAS.get(key, [0, 0, 1, 1, 4])[4]); cx_ = XSM.get('street_x', 0.0)
        if XSM.get('street_fit'): w_ = min(W - 0.4, XSM['street_fit']); h_ = w_ / XS_ATLAS.get(key, [0, 0, 1, 1, 4])[4]; sy1 = sy0 + h_   # 招牌板照指定的寬度、高度照貼圖比例往上長（汀州路三間：BB 第 2 版——字比參考圖小、街上讀不出來）
        xf.box(acc(SK['alu2']), cx_ - w_ / 2 - 0.04, cx_ + w_ / 2 + 0.04, sy0 - 0.05, sy1 + 0.03, 0.0, 0.2); _xq(xf, key, cx_ - w_ / 2, cx_ + w_ / 2, sy0, sy1, 0.204, tiles=1)
        if XSM.get('street_lit'): CL.glow(root, 'signbox', *xf.p(cx_, (sy0 + sy1) / 2, 0.6), color='rgba(255,250,235,1)', size=2.2, day=0.0, night=0.55)
    elif s.get('atlas') and s['atlas'] in SIGN_ATLAS:
        h_ = sy1 - sy0 + 0.08; w_ = min(sw, h_ * SIGN_ATLAS[s['atlas']]['aspect'])
        xf.box(acc(SK['alu2']), -w_ / 2 - 0.03, w_ / 2 + 0.03, sy0 - 0.07, sy0 - 0.04 + h_ + 0.03, 0.0, 0.2)
        sign_tex(xf, s['atlas'], 0.0, sy0 - 0.04, w_, 0.204, f'sk_sign_{spec["id"]}')
        if SIGN_ATLAS[s['atlas']]['lit']: CL.glow(root, 'signbox', *xf.p(0.0, (sy0 + sy1) / 2, 0.6), color='rgba(255,250,235,1)', size=2.2, day=0.0, night=0.55)
    else:
        xf.box(acc(fr), -sw / 2 - 0.05, sw / 2 + 0.05, sy0 - 0.04, sy1 + 0.04, 0.0, 0.1)
        face(f'SIGN_FACE_{spec["id"]}', M['board'], xf, [(-sw / 2, sy0, 0.105), (sw / 2, sy0, 0.105), (sw / 2, sy1, 0.105), (-sw / 2, sy1, 0.105)],
             {'sign': s['name'], 'sub': s.get('sub', ''), 'bg': s.get('signBg', '#3b2a1e'), 'color': s.get('signColor', '#f4ead8'), 'serif': 1 if s.get('serif') else 0, 'band': s.get('band', '')})
    if XSM and (XSM.get('shut') or XSM.get('lane')): pass
    elif s.get('vatlas') and s['vatlas'] in SIGN_ATLAS: vsign_tex(xf, spec['id'], s['vatlas'], W / 2 - 0.5, GH + 0.3, vw=0.74)
    elif s.get('vertical'):
        vsign(xf, spec['id'], W / 2 - 0.5, GH + 0.3, GH + 2.9, {'vertical': s['vertical'], 'vBg': s.get('vBg', '#ffffff'), 'vColor': s.get('vColor', '#b0332a'), 'vBand': s.get('vBand', '#b0332a'), 'serif': 1 if s.get('serif') else 0})
    for (cn, x, y, w, h) in ([] if XSM else sf.get('notes', [])): note(xf, cn, x, y, w, h, gz + (0.32 if kind == 'tea' else 0.03))
    # 騎樓裡貼著店面玻璃的雜物（ART-WZ0 第三批，LAWWW2 10-21；7b-2 第 1 條：騎樓兩樣東西）：玻璃前 0.7 m 內、避開店門和店門口的互動點；
    # 人走的地方：zones3d.js 的 gongguan 照 gongguan_shops.props.json 的腳印擋住那幾格（tests/street_props_nav_unit.js），騎樓照樣整排走得通
    for it in ([c for c in sf.get('clutter', []) if c[0] in XSM.get('keep', ())] if XSM else sf.get('clutter', [])):   # keep＝照參考圖的店面也要留著的騎樓雜物（G08 子晴坐的紅凳子和插座：ZQ-ARCADE-SEAT-1028；洗樂的木長椅）   # 公館四間新店：門口的東西照參考圖（gg_front 的 props）
        k, x, zc = it[0], it[1], it[2]; zz = gz + zc
        if k == 'aboard': aboard(xf, x, zz, it[3] if len(it) > 3 else 'chalk')
        elif k == 'outlet': inst(PROTO['outlet' + ('_z' if len(it) > 4 and it[4] == 'z' else '')], f'sk_outlet_{spec["id"]}', xf, x, it[3] if len(it) > 3 else 0.35, zz)   # 柱子、牆上離地的東西（inst 只替地上的東西登記腳印：不擋路）
        elif k == 'pot': _pm = _pot_pick(it, x); _w = _wp(xf, x, zz); B.instance(_pm, f'skpot_{spec["id"]}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], x * 1.7)
        else: inst(PROTO[k], f'sk_{k}_{spec["id"]}', xf, x, 0.0, zz)


# 公館騎樓店面（G00–G14，wz_street.py --set gongguan 的棟號；和 zones3d.js 的 shops 同一個順序）：相鄰的店門、地磚、燈色至少兩樣不同。
# ART-WZ0 第三批（10-21）：每間店騎樓兩三樣雜物（clutter；G06 腳踏車行的車是遊戲擺的）；G10 影印改自動門、G06 腳踏車行改玻璃櫥窗＋寬門（相鄰兩間至少三樣不同）
SF_GG = {
    'G00': dict(inner=True, door='open', floor='f_mosaic', light='warm', notes=[('menu', 2.6, 1.2, 0.6, 0.66)], clutter=[('stool_r', -4.4, 0.35), ('stool_b', -3.8, 0.35), ('bins', 3.6, 0.35)]),                                        # 阿鳳麵店
    'G01': dict(kind='tea', floor='f_white', floor_in='f_white', notes=[('pay', -2.6, 0.62, 0.26, 0.26), ('hiring', 2.2, 1.1, 0.4, 0.44)], clutter=[('aboard', -3.4, 0.6, 'menu'), ('bins', 2.4, 0.6)]),               # 清葉茶行
    'G02': dict(inner=True, kind='books', door='wood', floor='f_quarry', light='warm', door_x=2.6, notes=[('hours', 1.4, 1.2, 0.36, 0.36), ('poster', -3.8, 1.0, 0.5, 0.6)], clutter=[('bookcart', -3.6, 0.35), ('pot', -5.6, 0.3, 'broad'), ('aboard', 5.0, 0.35, 'menu')]),   # 舊路書房
    'G03': dict(inner=True, door='auto', floor='f_white', light='cool', door_x=-1.6, rollbox=False, notes=[('hours2', 0.6, 1.25, 0.42, 0.42), ('pay', 1.2, 1.3, 0.34, 0.34), ('hiring', 2.6, 1.1, 0.42, 0.46)], clutter=[('bins', 2.4, 0.32), ('umb', -3.2, 0.3), ('vend', 4.5, 0.42)]),   # 日日便利
    'G04': dict(inner=True, kind='pharm', door='alu', floor='f_granite', light='cool', door_x=1.4, door_w=1.2, notes=[('hours2', -1.2, 1.2, 0.4, 0.4)], clutter=[('aboard', -1.6, 0.35, 'menu'), ('boxes', -3.4, 0.3), ('pot', 3.5, 0.3)]),   # 公館藥局
    'G05': dict(inner=True, kind='luwei', door='open', floor='f_concrete', light='warm', notes=[('menu', -2.4, 1.2, 0.6, 0.66)], clutter=[('stool_r', -3.5, 0.35), ('stool_r', -2.9, 0.4), ('bins', 2.6, 0.35)]),                       # 滷味・鹹酥雞
    'G06': dict(inner=True, kind='bike', door='alu', door_x=0.2, door_w=2.4, floor='f_terrazzo', light='cool', notes=[('hours', 3.0, 1.3, 0.34, 0.34)]),                         # 輪轉單車（騎樓、櫥窗的車是遊戲擺的）
    'G07': dict(inner=True, kind='brunch', door='wood', floor='f_floral', light='warm', door_x=-2.4, door_w=1.0, notes=[('hours', -1.4, 1.25, 0.34, 0.34), ('pay', -0.95, 1.3, 0.26, 0.26)], clutter=[('aboard', -0.8, 0.4, 'chalk'), ('pot', 1.9, 0.3, 'broad'), ('bench', 3.2, 0.35), ('pot', 4.5, 0.3, 'broad')]),   # 咖啡・輕食
    'G08': dict(inner=True, kind='fruit', door='open', floor='f_concrete', light='warm', notes=[], clutter=[('crates', -1.8, 0.55), ('boxes', 2.6, 0.3),
               ('stool_r', 4.0, 2.2), ('outlet', 3.79, 2.425, 0.35, 'z')]),   # ZQ-ARCADE-SEAT-1028（LAWWW2-B 11-01）：G07／G08 交界的柱子（世界 x 15.6、z 19.03～19.58）靠騎樓那一面，一張紅凳子（世界 (15.6, 19.8)），柱子那一面離地 35 cm 一個插座（世界 x 15.81，在她左手邊）——子晴（heroine_04）「坐在騎樓下的插座旁邊，筆電開著」，背靠柱子、面向騎樓（第一版放柱子靠馬路那邊、面向馬路：從街上看被停的機車整排擋住，騎樓裡只看到背）；座位是 zones3d.js 的 gongguan                                                      # 水果行
    'G09': dict(inner=True, kind='laundry', door='alu', floor='f_white', light='cool', door_x=-2.4, door_w=1.0, notes=[('hours2', -1.4, 1.2, 0.4, 0.4), ('lostcat', 1.4, 1.1, 0.4, 0.42)], clutter=[('bench', 0.4, 0.35), ('vend', 3.0, 0.42)]),   # 自助洗衣
    'G10': dict(inner=True, kind='print', door='auto', floor='f_granite', light='cool', door_x=2.2, notes=[('copyprice', -2.6, 0.9, 0.62, 0.62), ('copyprice2', -1.9, 0.9, 0.62, 0.62), ('pay', 0.9, 1.45, 0.34, 0.34)], clutter=[('vend', -3.2, 0.42), ('boxes', -1.8, 0.3)]),   # 影印・輸出
    'G11': dict(inner=True, kind='teishoku', door='lattice', noren=True, floor='f_quarry', light='warm', door_x=-2.4, door_w=1.8, notes=[('menu', 1.6, 1.0, 0.58, 0.62), ('hours', 2.4, 1.2, 0.34, 0.34)], clutter=[('aboard', 0.2, 0.4, 'menu'), ('pot', 3.6, 0.3, 'broad'), ('umb', -4.3, 0.3)]),   # 日日定食
    'G12': dict(inner=True, kind='records', door='wood', floor='f_mosaic', light='warm', door_x=2.0, door_w=1.0, notes=[('poster', -2.2, 1.0, 0.5, 0.6)], clutter=[('bookcart', -2.0, 0.35), ('boxes', -3.4, 0.3), ('pot', 3.3, 0.3)]),   # 二手唱片
    'G13': dict(inner=True, kind='stationery', door='alu', floor='f_terrazzo', light='cool', door_x=-2.2, door_w=1.2, notes=[('hours2', -0.9, 1.2, 0.4, 0.4), ('pay', 0.4, 1.3, 0.3, 0.3)], clutter=[('aboard', 0.4, 0.4, 'menu'), ('umb', 1.4, 0.3), ('pot', 3.6, 0.3)]),   # 文具・畫材
    'G14': dict(inner=True, kind='brunch', door='wood', floor='f_granite', light='warm', door_x=1.8, door_w=1.0, notes=[('chalk', -2.4, 0.9, 0.5, 0.62), ('hours', 0.8, 1.25, 0.34, 0.34)], clutter=[('aboard', -0.8, 0.4, 'chalk'), ('bench', -2.8, 0.35), ('pot', 3.6, 0.3, 'broad')]),   # 早午餐
}


SF = {
    'A1': dict(inner=True, door='alu', sign='lightbox', awning=None, floor='f_granite', step=0.06, light='cool', ac=2.6, ac_ph=True,   # WZ-FIVE-1104 阿德（參考圖 wz_ade_ext）；v2.1 拿掉電錶箱（meter=−3.5 在門廊開口裡、懸在玻璃前面，蓋住白字的左上角；參考圖正面沒有電錶箱）：
               lamps=[-2.2, 0.0, 2.2], full_glass=True, mullions=[-2.3], glass_band=('#1f4e8c', 0.6, 0.66), pier_r=2.35, decal=('ade', -2.98, 1.0, 1.2),   #   三盞鵝頸燈、鋁框落地玻璃（沒有腰框）、藍色飾條、右邊白磁磚壁面掛軟木板＋價目表＋壁燈、玻璃上的白字服務項目（v2 放大）
               notes=[('wz_ade_cork', 2.72, 0.92, 0.6, 0.9), ('wzade_price', 3.36, 1.0, 0.56, 0.67), ('pay', -1.25, 1.42, 0.28, 0.28)],                                   #   冷氣、盆栽是 Poly Haven 的 CC0 實景掃描模型（OPEN-SRC-2D3D-1104）
               ivy_hang=[(-3.95, -2.9, 9), (2.9, 3.95, 9)],                                                                                                            #   v2（BB-C）：二樓垂下來的常春藤、門兩邊大小不同的盆栽、壁面前一個水泥花箱
               bright=0.74,                                                                                                                                             #   v2.1（BB_255 第 5 點）：店裡的燈亮一點（預設 0.62）
               clutter=[('pot', -1.62, 0.5, 'tall_w'), ('ph_pot', -1.18, 0.42), ('pot', 1.28, 0.4, 'fern_c'), ('ph_succ', 1.72, 0.5), ('pot', 2.18, 0.38, 'broad'), ('planter_c', 3.02, 0.3)]),   # v2.1（BB_255 第 4 點）：白瓷高盆、陶盆合果芋、水泥盆蕨類、白盆多肉、紅陶大葉、水泥花箱
    'A3': dict(inner=True, door='wood', sign='wood', awning=None, floor='f_quarry', step=0.1, door_x=1.4, frame='#4a2e1c', sign_w=10.4, bright=0.85, light='warm',   # WZ-SECOND-1104 溫州書屋（原本的巷口書房；參考圖 wenzhou_books_ext）：米白長飾帶深綠字、四盞綠色鵝頸燈、深色木框大窗、沒有雨遮、營業時間黑板
               lamps=[-4.2, -1.4, 1.4, 4.2], lampcol='goose_green', notes=[],
               clutter=[('bookcart', -3.4, 0.35), ('aboard', 3.9, 0.45, 'wz2_wenzhou_books_chalk'), ('pot', -4.9, 0.3, 'broad'), ('pot', 5.0, 0.3)]),
    'A4': dict(real=dict(x0=-3.2, x1=3.2, d=8.0, fill='#f1eee4'), inner=True, bright=0.86, door='open', sign='panel', awning='#2f5a47', floor='f_mosaic', light='warm', ac=-2.7, duct=3.4,   # WZ-FIVE-1104 林家（參考圖 wz_lin_ext）：深綠雨遮、門邊參考圖裁的價目牌、兩盆大盆栽
               notes=[('wz_lin_menu', 3.22, 1.05, 0.62, 0.97)],   # WZ-LIN-STREET-REF-1112：2.4 → 3.22（靠右邊門柱；原本擋在玻璃菜櫃前面）
               clutter=[('noodle', -1.6, 0.42), ('pot', 3.3, 0.35, 'broad'), ('pot', -3.45, 0.35, 'broad')]),   # WZ-LIN-STREET-REF-1112：門口的紅、藍塑膠凳拿掉（參考圖是店裡的木凳）
    'A5': dict(inner=True, door='auto', sign='lightbox', awning=None, floor='f_white', light='cool', door_x=-1.4, rollbox=False,
               notes=[('hours2', 0.6, 1.25, 0.42, 0.42), ('pay', 1.2, 1.3, 0.34, 0.34), ('hiring', 2.6, 1.1, 0.42, 0.46)],
               clutter=[('bins', 2.6, 0.32), ('umb', 0.3, 0.3), ('fridge', 3.3, 0.36)]),
    'B2': dict(inner=True, door='alu', sign='panel', awning=None, floor='f_terrazzo', light='cool', door_w=1.0, door_x=-1.6, meter=2.6, sign_w=5.6, sconce=[-2.86, 2.86], bright=1.0,   # WZ-SECOND-1104 常在洗衣（原本的自助洗衣；參考圖 changzai_laundry_ext）：整面灰藍燈箱招牌、沒有雨遮、兩側壁燈
               notes=[('hours2', -0.6, 1.2, 0.4, 0.4)], board=(1.35, 1.0, 0.9, 0.7),   # AA_413（10-23）：門右邊的布告欄（尋貓的紙條搬到布告欄上；「看布告欄」在世界 x −16.4）
               clutter=[('bench', 0.9, 0.35), ('vend', 2.3, 0.42), ('pot', -2.6, 0.3)]),   # ART-WZ0 第二批（10-21）：洗衣粉販賣機、門邊盆栽（準則 7b-2 第 1 條：騎樓兩樣東西）
    'B3': dict(real=dict(x0=-4.0, x1=4.0, d=8.0, fill='#4a3526'), inner=True, door='lattice', sign='wood', awning='#3a2a1f', floor='f_floral', step=0.12, noren='wz_komichi_noren', lantern=(-0.75, 2.05), light='warm', door_x=-2.0, door_w=1.8, ac=4.8, woodfront=True, sill=0.85, pane=0.6, ivy=[(-6.4, -3.3, 7), (0.2, 6.2, 11)],   # WZ-FIVE-1104 小路（參考圖 wz_komichi_ext）：深色木雨遮、參考圖的暖簾、黑板立牌
               notes=[],
               clutter=[('aboard', 0.2, 0.45, 'wz_komichi_menu'), ('pot', -5.8, 0.3, 'broad'), ('pot', 2.6, 0.32, 'broad'), ('pot', 5.4, 0.32)]),
    'B5': dict(split=[dict(id='B5', kind='tea', x0=-7.0, x1=0.0, floor='f_white', shop=dict(name='帝大紅茶', sub='紅茶・奶茶', signBg='#6e2a2c', signColor='#efe4cf', band='#6e2a2c'),   # WZ-SECOND-1104 帝大紅茶（原本的巷口茶飲；參考圖 dida_tea_ext）
                           lamps=[-1.7, 0.0, 1.7], front=dict(win=(-1.95, 2.15), frame='#5a2a28', awning='stripe_maroon', menu=('wz2_dida_tea_menu', -2.75, 1.0, 1.0, 1.15), pots=[(2.85, 'broad')]),
                           notes=[('pay', -1.75, 1.05, 0.2, 0.2), ('hiring', 2.75, 1.45, 0.34, 0.38)], clutter=[('aboard', 3.0, 0.4, 'wz2_dida_tea_aboard')]),   # 立牌放在原本垃圾桶的位置（導航的道具阻擋 [22.73,−7.6,1.46,0.44] 不變，比立牌大一點）
                      dict(id='B5i', kind='ice', x0=0.0, x1=7.0, floor='f_terrazzo', shop=dict(name='夏日冰菓室', sub='剉冰・古早味', signBg='#f7efe0', signColor='#2a5f8a', band='#2f7a8a', serif=True),   # WZ-SECOND-1104（參考圖 summer_ice_ext）：薄荷綠木腰板、窗口、雙開玻璃格子門、「冰」旗
                           lamps=[-1.6, 1.6], front=dict(win=(-3.2, 0.25), frame='#86bab2', wains='#a6d2ca', ledge='wood', curtain=True, door=(0.95, 2.25), door_col='#9cc9c1', awning='stripe_mint', awn_door=True,
                                                         menu=('wz2_summer_ice_menu', 0.6, 1.1, 0.5, 1.0), flag=('wz2_summer_ice_flag', 2.6)),   # 參考圖左邊的繡球花盆不放：騎樓走得到的地方沒有導航阻擋（tests/street_props_nav_unit.js），不新增阻擋
                           notes=[('hours', 2.95, 1.3, 0.3, 0.3)], clutter=[('aboard', 3.0, 0.5, 'wz2_summer_ice_menu')])]),
    'B7': dict(real=dict(x0=-2.55, x1=3.85, d=10.0, fill='#e9dcc4'), inner=True, door='wood', sign='wood', awning='stripe_green', floor='f_terrazzo', step=0.08, light='warm', door_x=1.02, door_w=1.0, ac=3.2, frame='#3f5a3c', grid=0.55,   # WZ-SUNNY-DOOR-1112：門 −2.0 → 1.02（＝室內的門：室內本地 x 0.4＋室內中心偏東 0.62；原本店外的門在左、走進去門在右邊）
               side_glass=dict(z0=-8.3, z1=-1.3, dep=0.15, head=2.6, int='sunnyside_side'),   # BB 11-04 06:43：參考圖是轉角店，東側（朝 2:30 AM 路口）整排綠框落地窗；室內右牆 z −2.4～4.6（＝本地 z −8.3～−1.3，室內 z − 5.9），窗台 0.75 以下木腰板   # WZ-FIVE-1104 SUNNY SIDE（原本的半熟；參考圖 wz_sunnyside_ext）：綠白條紋雨遮、參考圖的黑板立牌、門口盆栽
               notes=[('hours', 2.0, 1.25, 0.34, 0.34)],
               clutter=[('aboard', -0.6, 0.5, 'wz_sunnyside_board'), ('pot', -3.4, 0.35, 'broad'), ('pot', 3.3, 0.35, 'broad'), ('pot', -2.0, 0.32)]),   # WZ-SUNNY-DOOR-1112：黑板、小盆栽讓開新的門口
    'B6': dict(inner=True, door='open', sign='panel', awning='#4b7055', floor='f_concrete', light='warm', ac=-3.7, sign_w=9.0,   # WZ-SECOND-1104 阿忠鮮果（原本的阿忠水果；參考圖 azhong_fruit_ext）：米白招牌＋水果插畫、綠色帆布雨遮
               notes=[('pay', 3.5, 1.6, 0.32, 0.32)],
               clutter=[('fruitstall', -0.1, 0.5), ('fruit_pine', -3.75, 0.5), ('fruit_banana', -2.45, 0.5), ('fruit_melon', 3.6, 0.5), ('stool_b', 2.4, 0.45)]),   # WZ-SECOND-1104：攤子兩邊加鳳梨箱、香蕉架、西瓜箱（參考圖；都在門廊的導航阻擋裡），紙箱拿掉   # AA_413（10-23）：門廊前緣的攤子（原本是 x −1.2 的三層木架 crates）；老闆站在攤子後面＝世界 (34.9, −6.15)
}
# 住家、空店面
# 118 巷九間店（ART-L118-FACADE-3D-1023，使用者 10-23：「118店面裡面做了 但外觀還是很2D」）：原本是舊的 shopfront（玻璃後面一張平面景深卡）→ 店面組件＋立體淺店內。
# 鍵＝lane118_layout.js 的店 id；kind＝淺店內的店型（覆蓋 wz_street.py _TYPE 的分類）；門在店面正中間（遊戲的進店互動點在 (facade±0.9, 店的中心 z)）
# L118-SHOPS-REDO-1111（X338，使用者 2026-11-11；docs/handoff/user_specs/L118_SHOPS_REDO_1111.md）：九間店換成新的店（店 id、地圖位置不變）＋兩間外帶飲料店。
#   招牌是貼圖（l118_signs_tex.py：顏色、樣子照使用者的規格），不再由遊戲畫字；photos＝玻璃上的餐點圖、門邊的菜單板（貼圖集的鍵、中心 x、下緣 y、寬）。
SF_L118 = {   # 第 1 版：照使用者 11-11 的參考圖（docs/handoff/user_specs/l118_ref/ext_<id>.webp）；店面寬度、位置不動，圖上的元素照做
    'dian': dict(kind='noodle', inner=True, door='alu', frame_col='#2c2c2e', full_glass=True, door_w=2.7, awning=None, floor='f_white', light='cool', v_x=-2.86, v_y=2.3,   # 118牛排：紅底黃字招牌＋左邊直招牌、四扇深色框落地玻璃、左邊玻璃三張餐點海報、紅地墊、兩邊盆栽
                 photos=[('l118_ref_dian_p1', -2.02, 1.86, 1.15), ('l118_ref_dian_p2', -2.02, 1.14, 1.15), ('l118_ref_dian_p3', -2.02, 0.42, 1.15), ('l118_menu_dian', 2.02, 0.95, 0.62)],
                 clutter=[('mat', 0.0, 0.45, '#b3242a'), ('pot', -2.62, 0.3, 'broad'), ('pot', 2.62, 0.3, 'broad')]),
    'self': dict(kind='noodle', inner=True, door='open', awning=None, floor='f_white', light='cool', v_x=-3.3, v_y=3.7, v_w=0.9, pier_r=2.35, wains=(-3.2, 0.6, 1.0), case=(-2.9, 0.4),                              # 水上便當：黃底咖啡字大招牌＋左上突出的方形燈箱、不鏽鋼外帶櫃台和保溫櫃、右邊的牆上價目牌
                 photos=[('l118_menu_self', 2.78, 0.95, 0.6, 0.03)], clutter=[('pot', -3.1, 0.3, 'broad'), ('pot', 3.1, 0.3, 'broad')]),
    'tea': dict(kind='noodle', inner=True, door='alu', frame_col='#3a2a22', awning=None, floor='f_granite', light='warm', door_w=0.95, door_x=-0.45, full_glass=True,   # 辛亥韓食：深紅底米白字招牌、深色框落地玻璃、餐點海報（店面只有 3 m 寬：放兩張）
                photos=[('l118_ref_tea_p1', 0.33, 1.2, 0.5), ('l118_ref_tea_p3', 0.88, 1.2, 0.5)], clutter=[]),
    'home': dict(kind='noodle', inner=True, door='wood', frame='#5a3524', grid=0.9, awning='#7d8f84', floor='f_mosaic', light='warm', door_x=2.2, door_w=1.9, duct=3.3,   # 五湖四海：木板招牌書法字、舊的灰綠遮雨棚、深木框窗和木門、窗上貼水餃的價目紙
                 photos=[('l118_ph_dumpling', -2.55, 1.55, 0.6), ('l118_menu_home', -2.55, 0.62, 0.6)], clutter=[('pot', -3.35, 0.3, 'broad'), ('bins', 3.3, 0.35)]),
    'cafe2': dict(kind='buffet', inner=True, door='alu', full_glass=True, glass_band=('#ef7a1a', 0.55, 0.72), awning=None, floor='f_white', light='cool', door_x=1.3, door_w=1.8, pier_r=2.3,   # 大學食堂：橘白招牌、玻璃上的橘色腰線、窗內就是配菜台、右邊牆上「今日菜色」白板、水泥花槽
                  photos=[('l118_ref_cafe2_today', 2.75, 0.95, 0.8, 0.03)], clutter=[('planter_c', -2.3, 0.28), ('planter_c', -1.1, 0.28), ('pot', 2.9, 0.3, 'broad')]),
    'pasta': dict(kind='brunch', inner=True, door='wood', frame='#c9a37a', wall_col='#f3ead8', awning='#8a9a94', floor='f_floral', light='warm', door_x=1.9, door_w=1.3, pier_r=2.9,   # 義大麵屋：奶油白底紅字招牌、奶油色粉刷牆、淺木框、灰色小雨遮、兩張海報、門右的菜單
                  photos=[('l118_ref_pasta_p1', -2.5, 1.2, 0.78), ('l118_ref_pasta_p2', -1.4, 1.2, 0.78), ('l118_menu_pasta', 3.3, 0.95, 0.6, 0.03)],
                  clutter=[('pot', -3.3, 0.3, 'broad'), ('pot', 3.3, 0.3, 'broad')]),
    'korea': dict(kind='noodle', inner=True, door='alu', full_glass=True, awning=None, floor='f_white', light='cool', door_x=1.7, door_w=1.8,                             # 清州刀削麵：白底紅色毛筆字招牌、不鏽鋼框玻璃、門口左邊的製麵和大湯鍋、兩張海報、「營業中」木牌
                  photos=[('l118_ref_korea_p1', -2.35, 1.5, 0.95), ('l118_ref_korea_p2', -1.05, 1.5, 0.95), ('l118_ref_korea_open', 0.62, 1.25, 0.2)],
                  clutter=[('noodle', -1.9, 0.42), ('pot', 3.1, 0.3, 'broad')]),
    'omu': dict(kind='teishoku', inner=True, door='wood', frame='#5a3220', wall_col='#e9dfc8', awning=None, floor='f_quarry', step=0.06, light='warm', door_x=1.2, door_w=1.2, pier_r=2.2, lamps=[-2.2, 0.0, 2.2],   # 奈良咖哩：黃底咖啡字招牌＋三盞鵝頸燈、米色粉刷牆、深木框、兩張海報、門邊壁燈、木長凳、黑板立牌
                photos=[('l118_ref_omu_p1', -2.35, 1.25, 0.8), ('l118_ref_omu_p2', -1.05, 1.25, 0.8)], clutter=[('bench', -1.6, 0.45), ('aboard', 2.7, 0.45, 'chalk'), ('pot', -3.0, 0.3, 'broad')]),
    'noodle2': dict(kind='brunch', inner=True, door='alu', frame_col='#1b1b1c', full_glass=True, brick=True, awning=None, floor='f_concrete', light='warm', door_x=2.0, door_w=1.6, lamps=[-2.3, 0.0, 2.3],   # 迪倫窯烤披薩：黑鐵招牌＋三盞鵝頸燈、紅磚牆（窗下也是磚）、黑鐵框窗、窗內的圓頂窯爐、黑板
                    wains=(-3.2, 1.2, 0.95), oven=0.15, oven_prep=-1, photos=[('l118_ref_noodle2_board', 0.75, 1.15, 0.5)], clutter=[('pot', 3.05, 0.3, 'broad')]),
    'drink_a': dict(kind='tea', drink='trad', inner=True, door='none', rollbox=False, frame_col='#4a4e54', recess=0.3, awning=None, floor='f_white', light='cool', bright=0.85, clutter=[]),      # 喝不喝咖啡（參考圖 ext_drink_a）：深藍底白字燈箱、深灰鋁框、關著的玻璃門＋飲料海報＋外帶窗口（_drink）
    'drink_b': dict(kind='tea', drink='fruit', inner=True, door='none', rollbox=False, frame_col='#cdb98a', wall_col='#f1ead9', recess=0.3, awning=None, floor='f_white', light='warm', bright=0.9, clutter=[]),   # 果茶社（參考圖 ext_drink_b）：米白招牌金黃立體字、淺金細框、米白粉刷牆、淺木櫃台＋水果展示櫃（_drink）
}
# 118 巷填空的小店（早餐店、影印、洗衣、水果行、二手書、文具；wz_street.py 的 _FILL）：照店型套店面組件，不讓同一排一新一舊
SF_L118_FILL = {
    'teishoku': dict(inner=True, door='open', sign='lightbox', awning='#e0a030', floor='f_white', light='warm', clutter=[('stool_r', -1.2, 0.5), ('bins', 1.4, 0.35)]),
    'print': dict(inner=True, door='auto', sign='lightbox', awning=None, floor='f_granite', light='cool', rollbox=False, notes=[('copyprice', -1.2, 0.9, 0.62, 0.62)]),
    'laundry': dict(inner=True, door='alu', sign='panel', awning='#4a90c2', floor='f_terrazzo', light='cool', door_w=1.0, notes=[('hours2', 0.9, 1.2, 0.4, 0.4)], clutter=[('bench', -1.0, 0.4)]),
    'fruit': dict(inner=True, door='open', sign='panel', awning='stripe_orange', floor='f_concrete', light='warm', clutter=[('crates', -1.0, 0.55), ('boxes', 1.4, 0.3)]),
    'books': dict(inner=True, door='wood', sign='wood', awning=None, floor='f_quarry', light='warm', door_w=1.0, clutter=[('bookcart', -1.2, 0.35)]),
}
SF_HOUSE = {
    'A2': dict(number='31號', door_x=-1.2, notes=[('poster', 1.0, 1.25, 0.36, 0.42)], clutter=[('pot', 1.4, 0.18), ('pot', 2.4, 0.2, 'broad'), ('pot', 3.0, 0.18)], meter=-3.0),
    'B4': dict(number='37號', door_x=-2.6, door_w=1.4, decal='xiaoshubao_decal', decal_f=2, banner=('xiaoshubao_v', -5.3), notes=[('tutor', -0.9, 1.2, 0.42, 0.46)], clutter=[('pot', -5.0, 0.18, 'broad'), ('umb', -1.0, 0.25), ('bins', 2.6, 0.25)], meter=-4.6,
               stair_open=dict(depth=4.9), win2f=dict(x0=-1.45, x1=3.75, y0=3.2 + 0.75, y1=3.2 + 2.55), mok_sign=dict(x=-3.95, y0=2.02, y1=2.34, w=0.86)),
    # B4（37 號，ART-MOKUYOBI-1103）：二樓是木曜日（AA_617：深綠鐵門＋往上的窄樓梯；店內 src/data/mokuyobi_layout.js，區域 src/mokuyobi3d.js：溫州街 x＝區域 x＋11.15、z＝區域 z−12.25）；
    #   鐵門白天開著（stair_open）、二樓整排木框窗（win2f：店內窗 x −2.6～2.6、窗台 0.75、窗頂 2.55，二樓地板 3.2）、門左上的木招牌＋門燈（mok_sign）。
    #   小書包兒童課輔（ART-BG13；沛珊的課輔班事件只用一樓門口的 2D 背景，沒寫幾樓）搬到三樓：割字貼紙 decal_f＝2、帆布布條移到門的更西邊
    'C2': dict(number='45號', door_x=-1.4, notes=[('poster', 0.55, 1.25, 0.36, 0.42)], clutter=[('pot', 1.6, 0.18, 'broad')]),   # ART-WZ0 第二批：門邊的社區公告（生活痕跡）
    'W0': dict(number='7號', door_x=-2.8, notes=[('lostcat', -1.6, 1.3, 0.36, 0.4)], clutter=[('pot', 2.0, 0.18), ('pot', 2.5, 0.18, 'broad')], meter=-5.2),
}
SF_SHUTTER = {
    'B1': dict(notes=[('rent', -1.0, 1.0, 0.7, 0.7), ('closed', 1.6, 1.2, 0.5, 0.5)], clutter=[('boxes', 3.6, 0.3)]),   # 紙箱凸出牆面 33 cm：zones3d.js 擋住那一格（ART-WZ0 第二批）
    'C1': dict(notes=[('rent', 1.6, 1.05, 0.7, 0.7), ('poster', -2.2, 1.3, 0.5, 0.6)]),   # ART-WZ0 第二批：Café 南邊拉下鐵捲門的店也貼「招租」和海報（只貼紙，不放東西：門口是人走的地方）
}


# ---------------- ART-WZ6：阿德影印的兩種外觀（AA_420 第 3 節、12-1；wz_events.js 的 WZ_COPY_SHOP：'stay'＝留下來、'moved'＝搬到轉角；LAWWW2-B 2026-10-24）----------------
# 轉角＝A2（31 號公寓）東側一樓、朝北巷的那一面（主巷和北巷的轉角；北巷 x 3.3～8.2 走得到）：一樓牆體挖一個 3.8 m 寬、2.15 m 深的凹口（世界 x 0.95～3.1、z 5.6～9.4、高 2.95）。
# 店面比原來（A1 寬 8 m）小一半。凹口的地板、天花板、內牆一直都在；兩組獨立的節點照狀態開關（遊戲 zones3d.js 的 wzCopyShop）：
#   COPY_CORNER_SHUT  沒搬來以前（還沒有 WZ_COPY_SHOP、或 'stay'）：拉下的鐵捲門＋「招租」（空店面）
#   COPY_CORNER_OPEN  'moved'：鋁門玻璃店面（玻璃上的價目表貼得滿滿的）、阿德影印的招牌（同 A1 的設計稿）、裡面一台影印機、一個櫃台、紙箱架、日光燈
#   COPY_A1_SHUT      'moved'：A1 原本的店鐵捲門拉下來，貼著「本店已遷至轉角」（箭頭指向轉角）
#   COPY_A1_RENEW     'stay'：A1 玻璃門上、價目表旁邊多一張手寫的紙「本店續約三年。感謝大家。」
# 告示的字是本作畫的（PIL，手寫風）；沒有真實的店名、商標（D77）。進店的互動點：搬走以後在北巷 (3.75, 6.5)（wz_shops_layout.js 的 print.moved）。
COPYC = dict(cx=3.1, cz=7.5, w=3.8, d=2.15, top=2.95)


def _copy_notices_tex():
    """兩張告示（512×256，左右兩格）：①「本店已遷至轉角 ←」白紙黑色麥克筆 ②「本店續約三年。感謝大家。」有格線的紙、藍黑原子筆"""
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    fp = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
    im = Image.new('RGB', (512, 256), (250, 250, 246)); d = ImageDraw.Draw(im)
    def txt(x, y, s, sz, col, rot=0.0):
        t = Image.new('L', (256, 256), 0); dt = ImageDraw.Draw(t); f = ImageFont.truetype(fp, sz); dt.text((x, y), s, font=f, fill=255)
        if rot: t = t.rotate(rot, resample=Image.BICUBIC, center=(128, 128))
        return t.filter(ImageFilter.GaussianBlur(0.6))
    a = Image.new('L', (256, 256), 0)
    for (x, y, s, sz, rot) in ((40, 18, '本店', 52, 1.2), (24, 84, '已遷至', 52, -0.8), (40, 150, '轉角', 52, 0.6)):
        a = Image.fromarray(__import__('numpy').maximum(__import__('numpy').array(a), __import__('numpy').array(txt(x, y, s, sz, 0, rot))))
    im.paste(Image.new('RGB', (256, 256), (24, 24, 28)), (0, 0), a)
    d.line((84, 238, 214, 238), fill=(24, 24, 28), width=6); d.polygon([(84, 226), (58, 238), (84, 250)], fill=(24, 24, 28))   # ← 往轉角（從街上看，轉角在左邊）
    d.rectangle((256, 0, 511, 255), fill=(250, 248, 238))
    for k in range(9): d.line((268, 30 + k * 26, 500, 30 + k * 26), fill=(196, 210, 226), width=1)
    b = Image.new('L', (256, 256), 0)
    for (x, y, s, sz, rot) in ((20, 40, '本店續約三年。', 30, 0.5), (20, 96, '感謝大家。', 30, -0.4), (150, 180, '阿德', 24, 0.8)):
        b = Image.fromarray(__import__('numpy').maximum(__import__('numpy').array(b), __import__('numpy').array(txt(x, y, s, sz, 0, rot))))
    im.paste(Image.new('RGB', (256, 256), (36, 44, 96)), (256, 0), b)
    p = os.path.join(GEN, 'wz_copy_notices.png'); im.save(p); return p


def copy_corner_carve(xf, wall, W, D, rec):
    """A2 一樓牆體（取代 apartment() 的整塊一樓牆）：東側挖出轉角店面的凹口；凹口的地板、天花板、內牆（一直都在）"""
    RD = COPYC['d']; hw = COPYC['w'] / 2; t = COPYC['top']; z0, z1 = 5.0 - (COPYC['cz'] + hw), 5.0 - (COPYC['cz'] - hw)   # A2 自己的 z（世界 z＝5 − z）
    xe = -W / 2                                                                     # A2 自己的 x：世界 x＝中心 − x → 東面（世界 3.1）＝−W/2
    xf.box(wall, xe + RD, W / 2, 0, GH, -D, -rec)
    xf.box(wall, xe, xe + RD, 0, GH, -D, z0); xf.box(wall, xe, xe + RD, 0, GH, z1, -rec); xf.box(wall, xe, xe + RD, t, GH, z0, z1)
    c = Xf(COPYC['cx'], COPYC['cz'], math.pi / 2)                                  # 轉角店面自己的座標：正面朝 +x（北巷），x 往右＝世界 −z
    c.box(acc(SK['f_granite']), -hw, hw, 0.0, 0.03, -RD, 0.0)
    c.box(acc(M['ceilA']), -hw, hw, t - 0.03, t, -RD, 0.0)
    lin = acc(flat('wz_c6_wall', '#e8e6df', rough=0.85))                          # 店裡的內牆：白色水泥漆（外牆的材質是橘色的磁磚色，看起來像倉庫）
    c.box(lin, -hw, hw, 0.03, t - 0.03, -RD, -RD + 0.02)
    for sx in (-1, 1): c.box(lin, sx * hw - (0.02 if sx > 0 else 0.0), sx * hw + (0.0 if sx > 0 else 0.02), 0.03, t - 0.03, -RD + 0.02, 0.0)


def _copy_group(name, props, build):
    """build() 用 acc()／note()／uvquad()／CL.glow() 做的東西，全部收進獨立的節點 name（不參加合併；遊戲照名字開關）"""
    saved = dict(_acc); _acc.clear(); nq = list(NOTE_Q); del NOTE_Q[:]; before = set(bpy.data.objects)
    build()
    g = B.group(name, root, props)
    for k, m in list(_acc.items()): m.finish(g, uv=True)
    if NOTE_Q:
        bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
        for pts, cn in NOTE_Q:
            u0, v0, u1, v1 = note_uv(cn); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
            for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
        me = bpy.data.meshes.new(name + '_notes'); bm.to_mesh(me); bm.free(); me.materials.append(SK['notes'])
        ob = bpy.data.objects.new(name + '_notes', me); B.scene().collection.objects.link(ob); ob.parent = g
    for o in set(bpy.data.objects) - before:
        if o.name.startswith('GLOW_'): bpy.data.objects.remove(o); continue   # 光暈：遊戲把整條街的光暈合成一批（wzGlowBatch），不能跟著節點開關——開關的店面不放光暈（燈箱、日光燈本身會亮）
        if o is not g and o.parent is root: o.parent = g
    _acc.clear(); _acc.update(saved); del NOTE_Q[:]; NOTE_Q.extend(nq)
    return g


def copy_variants():
    """四組開關的節點（見上面的說明）。在所有建築做完、玻璃紙條合併（build_notes）以前呼叫"""
    tex = _img_mat('wz_copy_notices', os.path.basename(_copy_notices_tex()), rough=0.8)
    RD = COPYC['d']; hw = COPYC['w'] / 2; t = COPYC['top']; c = Xf(COPYC['cx'], COPYC['cz'], math.pi / 2)
    def corner_shut():
        z = -0.06; sm = acc(M['shutter'])
        c.quad(sm, [(-hw + 0.06, 0.03, z), (hw - 0.06, 0.03, z), (hw - 0.06, t - 0.02, z), (-hw + 0.06, t - 0.02, z)])
        c.box(acc(M['alu']), -hw + 0.02, hw - 0.02, t - 0.34, t - 0.03, -0.42, -0.08)          # 捲門箱藏在門楣裡面
        for sx in (-1, 1): c.box(acc(M['alu']), sx * (hw - 0.05) - 0.03, sx * (hw - 0.05) + 0.03, 0.0, t - 0.02, -0.1, -0.02)
        note(c, 'rent', -0.7, 1.05, 0.7, 0.7, z + 0.012); note(c, 'poster', 0.75, 1.15, 0.42, 0.5, z + 0.012)   # 空店面：招租＋一張舊的社區海報（不貼「暫停營業」：空店面不是暫停）
    def corner_open():
        gz = -0.32; iw = 2 * hw - 0.12; ih = t - 0.45; top = ih + 0.4
        sf = dict(door='alu', door_w=0.95, door_x=1.05, rollbox=True, full_glass=True, mullions=[-0.55], glass_band=('#1f4e8c', 0.6, 0.66))   # WZ-FIVE-1104：照參考圖 wz_ade_ext（落地玻璃、藍色飾條）
        c.box(acc(SK['f_granite']), -hw + 0.02, hw - 0.02, 0.0, 0.035, gz, 0.0)              # 門口那一段的地（和店裡同一種）
        _door_glass(dict(id='A2C'), c, sf, iw, ih, gz, frame_mat('#c3c7ca'), top)              # 框：參考圖的銀色鋁框（原本藍色）
        glass_decal(c, 'ade', -1.35, 1.62, 0.62, gz + 0.016)                               # 白字貼紙在左邊玻璃上段（下段貼滿價目表：AA_420「玻璃上的價目表貼得滿滿的」）
        for (cn, x, y, w_, h_) in (('copyprice', -1.45, 0.82, 0.56, 0.56), ('copyprice2', -0.8, 0.86, 0.56, 0.56), ('copyprice', -0.15, 0.8, 0.56, 0.56), ('nobook', -0.45, 1.48, 0.42, 0.42),
                                    ('copyprice2', 0.32, 1.42, 0.42, 0.42), ('pay', 1.32, 1.5, 0.26, 0.26), ('copyprice', 0.8, 0.95, 0.4, 0.4), ('hours2', 1.3, 1.05, 0.3, 0.3)):
            note(c, cn, x, y, w_, h_, gz + 0.03)
        hsign(c, 'A2C', 'wz_ade_h', 0.0, 3.5, t + 0.1, lamps=[-1.2, 0.0, 1.2])          # 招牌：和 A1 同一張（WZ-FIVE-1104 參考圖 wz_ade_ext 的白底藍字＋三盞鵝頸燈（BB-C v2：參考圖是三盞）；原本是 10 月的 ade_print_h），掛在門楣上（往上蓋到二樓的牆）
        # 店裡（玻璃後面 1.8 m）：左邊一台大影印機、中間櫃台（電腦螢幕朝裡）、後牆的紙箱架、天花板一支日光燈
        cp = acc(flat('wz_c6_copier', '#dcdcd6', rough=0.4)); dk = acc(flat('wz_c6_dark', '#3a3c40', rough=0.5)); wd = acc(SK['wood_lt']); st = acc(SK['steel'])
        _cm = {'#3a3e44': dk, '#5a5e64': dk, '#5c6168': dk, '#2c2f34': dk, '#9a9ea3': dk, '#4caf50': dk, '#8fb8de': acc(SK['lamp_cool'])}   # 白色的零件用影印機的白、深色的用 dk、螢幕用冷白燈（不多材質）
        _copier(lambda x0, x1, y0, y1, z0, z1, col, r=0.0: c.box(_cm.get(col, cp), x0, x1, y0, y1, z0, z1), -1.375, -RD + 0.43, 0.75, 0.7, 1.0, 0.0, 'M')   # ADE-V2.1：和 A1 同一種影印機（紙匣、出紙口、送紙器、操作面板、手送紙盤；原本是白盒子＋上蓋）
        c.box(wd, -0.55, 0.45, 0.0, 0.98, -1.05, -0.62); c.box(dk, -0.35, 0.05, 0.98, 1.3, -1.0, -0.97)                                    # 櫃台＋螢幕（背面朝客人）
        for x_ in (-0.45, 0.55, 1.57):                                                                                                     # 後牆的鐵架：三根立柱、四層板（開放的，看得到紙箱）
            for z_ in (-RD + 0.03, -RD + 0.39): c.box(st, x_, x_ + 0.03, 0.0, 1.9, z_, z_ + 0.03)
        for k, y in enumerate((0.05, 0.62, 1.2)):
            c.box(st, -0.45, 1.6, y - 0.02, y, -RD + 0.02, -RD + 0.42)
            for j in range(4): c.box(acc(flat('wz_c6_ream_' + str((j + k) % 3), ('#f4f2ea', '#e9d9a8', '#cfe0ea')[(j + k) % 3], rough=0.8)), -0.4 + j * 0.5, -0.4 + j * 0.5 + 0.42, y, y + 0.28 - 0.05 * ((j * 3 + k) % 2), -RD + 0.06, -RD + 0.36)
        c.box(acc(M['tube']), -0.6, 0.6, t - 0.08, t - 0.05, -1.0, -0.9)
    def a1(kind):
        sp = next(s for s in SPECS if s['id'] == 'A1'); xa, W_, _ = place(sp); iw = W_ - 0.6; ih = GH - 0.9; gz = -0.9
        if kind == 'shut':
            z = gz + 0.10; sm = acc(M['shutter'])
            xa.quad(sm, [(-iw / 2 - 0.02, 0.03, z), (iw / 2 + 0.02, 0.03, z), (iw / 2 + 0.02, ih + 0.2, z), (-iw / 2 - 0.02, ih + 0.2, z)])
            uvquad('COPY_A1_SHUT_notice', tex, [xa.p(-0.22, 1.02, z + 0.004), xa.p(0.22, 1.02, z + 0.004), xa.p(0.22, 1.46, z + 0.004), xa.p(-0.22, 1.46, z + 0.004)], (0.0, 0.0, 0.5, 1.0))
            for sx in (-1, 1): uvquad(f'COPY_A1_SHUT_tape{sx}', SK['notes'], [xa.p(sx * 0.2 - 0.04, 1.43, z + 0.005), xa.p(sx * 0.2 + 0.04, 1.43, z + 0.005), xa.p(sx * 0.2 + 0.04, 1.48, z + 0.005), xa.p(sx * 0.2 - 0.04, 1.48, z + 0.005)], note_uv('blank'))
        else:
            z = gz + 0.026
            uvquad('COPY_A1_RENEW_notice', tex, [xa.p(-0.62, 1.12, z), xa.p(-0.38, 1.12, z), xa.p(-0.38, 1.36, z), xa.p(-0.62, 1.36, z)], (0.5, 0.0, 1.0, 1.0))
    _copy_group('COPY_CORNER_SHUT', {'kind': 'copy_shop', 'show': "WZ_COPY_SHOP 不是 'moved'（空店面：鐵捲門＋招租）"}, corner_shut)
    _copy_group('COPY_CORNER_OPEN', {'kind': 'copy_shop', 'show': "WZ_COPY_SHOP＝'moved'（阿德影印搬到轉角）"}, corner_open)
    _copy_group('COPY_A1_SHUT', {'kind': 'copy_shop', 'show': "WZ_COPY_SHOP＝'moved'（原本的店鐵捲門拉下、遷址告示）"}, lambda: a1('shut'))
    _copy_group('COPY_A1_RENEW', {'kind': 'copy_shop', 'show': "WZ_COPY_SHOP＝'stay'（續約三年的紙）"}, lambda: a1('renew'))


exec(open(os.path.join(HERE, 'wz2_windows.py'), encoding='utf-8').read())   # WZ-SECOND-1104 v2：第二批五間的櫥窗（同一個命名空間）


# SHOP-WINDOW-3D-1112（LAWWW2-C；使用者 11-12：「我非常滿意118巷的店家，從外面看進去店裡面是有3D的感覺；反而是新生南路那一批…都直接拿我2D的參考圖去貼在外面…我希望改成像118巷的店家一樣」）
# 新生南路的店：玻璃後面原本是一張 0.8 m 深的參考圖（景深卡）→ 改成 3 m 深、真的有東西的店內（和 118 巷、溫州街同一套：unlit 頂點色、越裡面越暗），不貼參考圖。
XS_DI = 3.0
def _xs_shoe(vb, x, y, z, col, sole='#f2f0ea', acc_='#2a2a2c', sx=1, L_=0.27, along='x', lod=0):
    """一隻球鞋（側面對著看的人）：鞋底、鞋頭、鞋身、鞋領、側邊一條色塊。(x,y,z)＝鞋底中心；sx＝鞋頭朝 +x／−x；along='z'＝鞋子沿 z 擺。
    lod=1（牆上、遠的）：鞋底＋鞋身＋鞋領三塊直角的"""
    k = L_ / 0.27
    def b(a0, a1, y0_, y1_, w0, w1, c, r=0.0):
        a0, a1, y0_, y1_, w0, w1 = a0 * k, a1 * k, y0_ * k, y1_ * k, w0 * k, w1 * k
        if along == 'x': a0, a1 = sorted((x + sx * a0, x + sx * a1)); vb(a0, a1, y + y0_, y + y1_, z + w0, z + w1, c, r=r * k)
        else: a0, a1 = sorted((z + sx * a0, z + sx * a1)); vb(x + w0, x + w1, y + y0_, y + y1_, a0, a1, c, r=r * k)
    h = 0.135
    b(-h, h, 0.0, 0.026, -0.05, 0.05, sole)
    if lod:
        b(-h + 0.01, h - 0.01, 0.026, 0.075, -0.045, 0.045, col); b(-h + 0.005, -h + 0.11, 0.075, 0.118, -0.043, 0.043, col); return
    b(h - 0.105, h - 0.004, 0.026, 0.072, -0.046, 0.046, col, r=0.02)          # 鞋頭
    b(-h + 0.02, h - 0.09, 0.026, 0.094, -0.045, 0.045, col)                   # 鞋身
    b(-h + 0.004, -h + 0.105, 0.026, 0.122, -0.043, 0.043, col, r=0.016)       # 鞋領
    b(-0.045, 0.05, 0.046, 0.074, -0.048, 0.048, acc_)                        # 側邊色塊


def _xs_leaves(cm, xf, x, y, z, n, r, h, col, rr, droop=0.0):
    """盆栽的葉子：n 片往外張的葉片（兩個三角形一片），不用球"""
    for k in range(n):
        a = k * 2.399 + rr.uniform(-0.3, 0.3); t = (k + 0.5) / n; rad = r * (0.35 + 0.65 * rr.random()); yy = y + h * (0.25 + 0.75 * rr.random())
        cx_, cz_ = x + math.cos(a) * rad * 0.35, z + math.sin(a) * rad * 0.35; ex, ez = x + math.cos(a) * rad, z + math.sin(a) * rad
        wx_, wz_ = -math.sin(a) * 0.085, math.cos(a) * 0.085; ye = yy + 0.1 - droop * rad
        fs = cm.poly([xf.p(cx_ - wx_, yy, cz_ - wz_), xf.p(cx_ + wx_, yy, cz_ + wz_), xf.p(ex + wx_ * 0.4, ye, ez + wz_ * 0.4), xf.p(ex - wx_ * 0.4, ye, ez - wz_ * 0.4)], col, 0.8 + 0.4 * rr.random())


def _xs_plant(cm, cp, xf, x, z, y0, rr, ph=0.42, pr=0.16, fh=0.7, fr=0.42, pot='#eeeae2'):
    _lathe(cp(pot), xf, [(0.0, 0.0), (pr * 0.8, 0.0), (pr, ph), (pr * 0.86, ph), (pr * 0.8, ph - 0.03), (0.0, ph - 0.03)], x, y0, z, seg=12)
    xf_cyl(cp('#4a3a26'), xf, (x, y0 + ph - 0.03, z), (x, y0 + ph + fh * 0.5, z), 0.012, seg=5)
    _xs_leaves(cm, xf, x, y0 + ph, z, 34, fr, fh, '#3f7a3a', rr)


def _xs_in_dabu(cm, cp, vb, xf, iw, gz, zb, y0, yt, rr, c):
    """大步球鞋（參考圖 dabu_ext／dabu_int）：左邊大櫥窗＝鋼柱木層板四層球鞋、下面一階階的水泥台（球鞋、籃球、盆栽）；右邊是門，看得到店裡：
    兩側牆的鞋牆、中間的木展示桌和試穿長凳、後牆的鞋牆和櫃台、天花板的軌道燈"""
    SHOE = ['#f2f0ea', '#e9e6de', '#2a2a2e', '#c0483c', '#5a56a8', '#8ad0c0', '#f0a890', '#d8d4c8', '#3a5a8c', '#f2f0ea', '#9a2a3a', '#dfe6ea', '#e8c860', '#f2f0ea', '#6a6e74']
    ACC = ['#2a2a2c', '#c0483c', '#f2f0ea', '#e8873a', '#3a5a8c', '#2a2a2c', '#8ad0c0']
    WOOD, STEELC, CONC = '#d3ae7e', '#8c9096', '#cfccc4'
    mx = c.get('mullions', [1.2])[0] - (c.get('glass', (-iw / 2, iw / 2))[0] + iw / 2)   # 門和櫥窗中間那支直料（店內座標）
    # ── 櫥窗（玻璃後面 0.12～1.15 m）
    wx0, wx1 = -iw / 2 + 0.12, mx - 0.12; zf_, zr_ = gz - 0.12, gz - 1.15
    vb(wx0, wx1, y0, y0 + 0.22, zr_, zf_, '#e6e3db', r=0.01)                                                    # 櫥窗的台子
    rx0, rx1 = wx0 + 1.05, wx1 - 0.1; nb = 4; ups = [rx0 + k * (rx1 - rx0) / nb for k in range(nb + 1)]
    for ux in ups:                                                                                             # 鋼柱（前後兩支）
        for uz in (zr_ + 0.12, zr_ + 0.5): vb(ux - 0.02, ux + 0.02, y0 + 0.22, yt - 0.25, uz - 0.02, uz + 0.02, STEELC, r=0)
    k_ = 0
    for j, sy in enumerate((y0 + 0.98, y0 + 1.46, y0 + 1.94, y0 + 2.42)):
        vb(rx0 - 0.08, rx1 + 0.08, sy - 0.03, sy, zr_ + 0.08, zr_ + 0.54, WOOD, r=0.004)
        n_ = 5
        for i in range(n_):
            if j == 3 and i in (0,): continue
            x_ = rx0 + 0.02 + (i + 0.5) * (rx1 - rx0 - 0.04) / n_
            _xs_shoe(vb, x_, sy, zr_ + 0.31, SHOE[k_ % len(SHOE)], acc_=ACC[k_ % len(ACC)], sx=1 if (i + j) % 5 else -1, L_=0.36); k_ += 1
    # 一階階的水泥台＋上面的球鞋
    for (a0, a1, hh, zz0, zz1) in ((wx0 + 0.75, wx0 + 1.9, 0.28, zf_ - 0.62, zf_ - 0.2), (wx0 + 1.7, wx0 + 2.9, 0.46, zf_ - 0.8, zf_ - 0.38), (wx0 + 3.0, wx1 - 0.55, 0.3, zf_ - 0.66, zf_ - 0.22)):
        vb(a0, a1, y0 + 0.22, y0 + 0.22 + hh, zz0, zz1, CONC, r=0.012)
        for i in range(max(1, int((a1 - a0) / 0.5))):
            _xs_shoe(vb, a0 + 0.28 + i * 0.5, y0 + 0.22 + hh, (zz0 + zz1) / 2, SHOE[(k_ + 3) % len(SHOE)], acc_=ACC[k_ % len(ACC)], sx=1, L_=0.36); k_ += 1
    bx_, bz_ = wx0 + 1.32, zf_ - 0.42; _lathe(cp('#c9663a'), xf, [(0.12 * math.sin(math.pi * t / 8), 0.12 - 0.12 * math.cos(math.pi * t / 8)) for t in range(9)], bx_, y0 + 0.5, bz_, seg=14)   # 籃球
    _xs_plant(cm, cp, xf, wx0 + 0.42, zf_ - 0.5, y0 + 0.22, rr, ph=0.5, pr=0.2, fh=0.9, fr=0.5)
    _xs_plant(cm, cp, xf, wx1 - 0.3, zf_ - 0.38, y0 + 0.22, rr, ph=0.28, pr=0.13, fh=0.45, fr=0.3)
    _lathe(cp('#d9d5cc'), xf, [(0.0, 0.0), (0.1, 0.0), (0.12, 0.16), (0.0, 0.16)], wx0 + 2.4, y0 + 0.22, zf_ - 0.2, seg=10); _xs_leaves(cm, xf, wx0 + 2.4, y0 + 0.36, zf_ - 0.2, 14, 0.24, 0.1, '#4a8a44', rr, droop=0.5)   # 垂下來的小盆
    # ── 店裡：兩側牆的鞋牆（層板＋鞋，鞋頭朝店裡）
    for sx in (-1, 1):
        xw = sx * (iw / 2 - 0.047); z0_, z1_ = zb + 0.15, (zr_ - 0.15 if sx < 0 else gz - 0.5)
        a_, b_ = sorted((xw, xw - sx * 0.03)); vb(a_, b_, y0 + 0.5, yt - 0.35, z0_, z1_, '#e0d2bc', r=0)
        for j in range(4):
            sy = y0 + 0.7 + j * 0.5; a_, b_ = sorted((xw - sx * 0.03, xw - sx * 0.34)); vb(a_, b_, sy - 0.022, sy, z0_, z1_, '#d3ae7e', r=0)
            for i in range(int((z1_ - z0_) / 0.42)):
                _xs_shoe(vb, xw - sx * 0.19, sy, z0_ + 0.22 + i * 0.42, SHOE[(k_ + j) % len(SHOE)], acc_=ACC[(k_ + i) % len(ACC)], sx=-sx, along='x', L_=0.3, lod=1); k_ += 1
    # 後牆：鞋牆（左 2/3）＋海報框＋櫃台（右）
    bx0, bx1 = -iw / 2 + 0.5, iw / 2 - 2.3
    vb(bx0, bx1, y0 + 0.5, yt - 0.35, zb, zb + 0.03, '#e0d2bc', r=0)
    for j in range(4):
        sy = y0 + 0.7 + j * 0.5; vb(bx0, bx1, sy - 0.022, sy, zb + 0.03, zb + 0.3, '#d3ae7e', r=0)
        for i in range(int((bx1 - bx0) / 0.46)):
            _xs_shoe(vb, bx0 + 0.26 + i * 0.46, sy, zb + 0.17,  SHOE[(k_ * 3 + i) % len(SHOE)], acc_=ACC[(k_ + i + j) % len(ACC)], sx=1 if (i + j) % 4 else -1, L_=0.32, lod=1); k_ += 1
    px0, px1 = iw / 2 - 2.05, iw / 2 - 1.25
    vb(px0 - 0.04, px1 + 0.04, y0 + 1.45, y0 + 2.55, zb, zb + 0.025, '#2a2a2c', r=0); vb(px0, px1, y0 + 1.49, y0 + 2.51, zb + 0.025, zb + 0.03, '#d8b890', r=0)   # 海報（跑步的人的剪影）
    vb(px0 + 0.3, px1 - 0.28, y0 + 1.75, y0 + 2.2, zb + 0.03, zb + 0.033, '#5a4636', r=0); vb(px0 + 0.33, px1 - 0.31, y0 + 2.2, y0 + 2.32, zb + 0.03, zb + 0.033, '#5a4636', r=0)
    cx0_, cx1_ = iw / 2 - 2.1, iw / 2 - 0.45                                                                    # 櫃台
    vb(cx0_, cx1_, y0, y0 + 0.95, zb + 0.55, zb + 1.0, '#ecdcc2', r=0.012); vb(cx0_ - 0.03, cx1_ + 0.03, y0 + 0.95, y0 + 0.99, zb + 0.52, zb + 1.03, WOOD, r=0.006)
    vb(cx0_ + 0.3, cx0_ + 0.62, y0 + 0.99, y0 + 1.02, zb + 0.66, zb + 0.9, '#2a2a2c', r=0); vb(cx0_ + 0.32, cx0_ + 0.6, y0 + 1.02, y0 + 1.26, zb + 0.72, zb + 0.75, '#2a2a2c', r=0)   # 收銀螢幕
    for i in range(3): vb(cx1_ - 0.5 + i * 0.03, cx1_ - 0.14 + i * 0.03, y0 + 0.99 + i * 0.11, y0 + 1.1 + i * 0.11, zb + 0.62, zb + 0.84, ['#c0483c', '#f2f0ea', '#3a5a8c'][i], r=0)   # 疊著的鞋盒
    # 中間：木展示桌（兩層）＋試穿長凳
    tx0, tx1, tz0, tz1 = mx - 0.9, mx + 0.75, zb + 1.35, zb + 2.05
    vb(tx0, tx1, y0 + 0.68, y0 + 0.73, tz0, tz1, WOOD, r=0.008); vb(tx0 + 0.12, tx1 - 0.12, y0 + 0.24, y0 + 0.28, tz0 + 0.08, tz1 - 0.08, WOOD, r=0)
    for ax in (tx0 + 0.05, tx1 - 0.05):
        for az in (tz0 + 0.05, tz1 - 0.05): vb(ax - 0.022, ax + 0.022, y0, y0 + 0.68, az - 0.022, az + 0.022, '#2a2a2c', r=0)
    for i in range(4): _xs_shoe(vb, tx0 + 0.25 + i * 0.4, y0 + 0.73, (tz0 + tz1) / 2 + (0.14 if i % 2 else -0.12), SHOE[(i * 4 + 2) % len(SHOE)], acc_=ACC[i % len(ACC)], sx=1 if i % 2 else -1, L_=0.3)
    for i in range(3): vb(tx0 + 0.2 + i * 0.45, tx0 + 0.52 + i * 0.45, y0 + 0.28, y0 + 0.4, tz0 + 0.15, tz1 - 0.15, ['#e8873a', '#2a2a2c', '#f2f0ea'][i], r=0)   # 下層的鞋盒
    hx0, hx1, hz0, hz1 = mx + 0.25, mx + 1.55, gz - 1.25, gz - 0.85
    vb(hx0, hx1, y0 + 0.38, y0 + 0.46, hz0, hz1, '#b9b4aa', r=0.02)
    for ax in (hx0 + 0.08, hx1 - 0.08): vb(ax - 0.02, ax + 0.02, y0, y0 + 0.38, hz0 + 0.04, hz1 - 0.04, '#2a2a2c', r=0)
    vb(mx + 0.2, iw / 2 - 0.3, y0, y0 + 0.012, gz - 0.75, gz - 0.2, '#6a6e72', r=0)                               # 門口的腳踏墊
    # 天花板：兩條黑色軌道＋投射燈
    for tz_ in (zb + 1.0, gz - 0.9):
        vb(-iw / 2 + 0.4, iw / 2 - 0.4, yt - 0.06, yt - 0.03, tz_ - 0.015, tz_ + 0.015, '#1c1c1e', r=0)
        for i in range(int(iw / 0.9)):
            lx = -iw / 2 + 0.7 + i * 0.9; xf_cyl(cp('#1c1c1e'), xf, (lx, yt - 0.06, tz_), (lx, yt - 0.2, tz_ + 0.05), 0.035, seg=6); vb(lx - 0.025, lx + 0.025, yt - 0.215, yt - 0.2, tz_ + 0.03, tz_ + 0.08, '#fff6e0', r=0)


XS_IN3D = {'dabu': dict(fn=_xs_in_dabu, floor='f_oak', wall='#e6d8c4', ceil='#dccfba', warm=True)}   # 顏色照走進去的室內（bb_support/dabu_interior.py：暖米白牆、橡木地板和層板；BB_379「櫥窗裡的店要照各店真的室內做」）


def xs_inside3d(spec, c, xf0, gx0, gx1, gy1, z, fr):
    """新生南路一間店玻璃後面的立體店內（XS_DI 深）。xf0＝這一棟的座標；店內座標＝玻璃的中心是 x 0。回傳 True＝做了（xs_front 不再放景深卡）"""
    cfg = XS_IN3D.get(spec.get('lane118'))
    if not cfg: return False
    pid = spec.get('lane118'); iw = gx1 - gx0; xf = OffXf(xf0, (gx0 + gx1) / 2); y0 = 0.12; yt = gy1; gz = z; zb = gz - XS_DI; gzf = gz - 0.012
    cm = L.CMesh(f'sk_in_{pid}', IN_VC); cp = lambda col: _CP(cm, col); vb = lambda *a, **k: xf_vbox(cm, xf, *a, **k); rr = random.Random(sum(ord(ch) for ch in pid) * 31)
    _floor_vc(cm, xf, iw, zb, gzf, y0, cfg.get('floor', 'f_white'), rr)
    vb(-iw / 2, iw / 2, y0, yt, zb - 0.05, zb, cfg['wall'], r=0)
    for sx in (-1, 1): vb(sx * iw / 2 - 0.047, sx * iw / 2 + 0.047, y0, yt, zb, gzf, cfg['wall'], r=0)
    vb(-iw / 2, iw / 2, yt, yt + 0.05, zb, gzf, cfg['ceil'], r=0)
    cfg['fn'](cm, cp, vb, xf, iw, gz, zb, y0, yt, rr, c)
    # 店內不放夜間光暈（GLOW_shopin）：光暈整條街合成一個網格，打烊的店關不掉；店內是 unlit，晚上本來就亮（打烊由遊戲把這個網格調暗：Z3.shopInsideLit）
    global DI; _di = DI; DI = XS_DI
    try: _shade_interior(cm, xf, iw, gz, yt, cfg.get('bright', 0.86), cfg.get('warm', False))
    finally: DI = _di
    cm.finish(root, uv=False)
    return True


# ── SHOP-WINDOW-3D-1112 第 2 包：好拍運動、新生運動廣場、山嵐書店、同弦樂器、大口漢堡（共用的小東西在前面）
def _xs_vcyl(cp, xf, x, ya, yb, z, r, col, seg=6):
    """直立的圓柱（用車削做：xf_cyl 直立的圓柱頂點色會掉成白的）"""
    ya, yb = min(ya, yb), max(ya, yb); _lathe(cp(col), xf, [(0.0, 0.0), (r, 0.0), (r, yb - ya), (0.0, yb - ya)], x, ya, z, seg=seg)


def _xs_ngon(cm, xf, x, y, z, rx, ry, col, n=10, k=1.0, a0=0.0):
    """朝街的扁橢圓片（球拍面、吉他琴身、圓牌子）"""
    return cm.poly([xf.p(x + math.cos(a0 + i * 2 * math.pi / n) * rx, y + math.sin(a0 + i * 2 * math.pi / n) * ry, z) for i in range(n)], col, k)


def _xs_ball(cp, xf, x, y, z, r, col, seg=8):
    _lathe(cp(col), xf, [(r * math.sin(math.pi * t / 4), r - r * math.cos(math.pi * t / 4)) for t in range(5)], x, y, z, seg=seg)


def _xs_racket(cm, vb, xf, x, y, z, col, s=1.0, grip='#2a2a2c'):
    """掛在牆上的球拍（拍頭朝上）：拍框、拍面、拍柄"""
    _xs_ngon(cm, xf, x, y + 0.42 * s, z, 0.115 * s, 0.15 * s, col, n=10); _xs_ngon(cm, xf, x, y + 0.42 * s, z + 0.004, 0.095 * s, 0.13 * s, '#f1efe6', n=10, k=0.96)
    vb(x - 0.012 * s, x + 0.012 * s, y + 0.12 * s, y + 0.28 * s, z - 0.008, z + 0.008, col, r=0); vb(x - 0.017 * s, x + 0.017 * s, y, y + 0.13 * s, z - 0.012, z + 0.012, grip, r=0)


def _xs_mannequin(cp, vb, xf, x, z, y0, top, bottom, skin='#e6e2da'):
    """半身人台：底座、立桿、軀幹（上衣的顏色）、短褲、脖子"""
    _lathe(cp('#b9bcc0'), xf, [(0.0, 0.0), (0.17, 0.0), (0.17, 0.02), (0.0, 0.02)], x, y0, z, seg=10); _xs_vcyl(cp, xf, x, y0 + 0.02, y0 + 0.78, z, 0.014, '#b9bcc0', 5)
    vb(x - 0.17, x + 0.17, y0 + 0.74, y0 + 1.02, z - 0.1, z + 0.1, bottom, r=0.03)
    vb(x - 0.2, x + 0.2, y0 + 1.0, y0 + 1.5, z - 0.11, z + 0.11, top, r=0.04)
    for sx in (-1, 1): vb(x + sx * 0.2 - 0.05, x + sx * 0.2 + 0.05, y0 + 1.26, y0 + 1.5, z - 0.07, z + 0.07, top, r=0.025)
    _xs_vcyl(cp, xf, x, y0 + 1.5, y0 + 1.6, z, 0.045, skin, 6)


def _xs_rack(cp, vb, xf, x0, x1, z, y0, cols, h=1.45):
    """衣架桿＋掛著的衣服（一件一片）"""
    for ux in (x0, x1): vb(ux - 0.015, ux + 0.015, y0, y0 + h, z - 0.015, z + 0.015, '#b9bcc0', r=0); vb(ux - 0.2, ux + 0.2, y0, y0 + 0.02, z - 0.02, z + 0.02, '#b9bcc0', r=0)
    vb(x0, x1, y0 + h - 0.02, y0 + h, z - 0.012, z + 0.012, '#b9bcc0', r=0); n = max(2, int((x1 - x0 - 0.1) / 0.11))
    for i in range(n):
        x_ = x0 + 0.08 + i * (x1 - x0 - 0.16) / max(1, n - 1); vb(x_ - 0.022, x_ + 0.022, y0 + h - 0.72 - (i % 3) * 0.05, y0 + h - 0.05, z - 0.21, z + 0.21, cols[i % len(cols)], r=0)


def _xs_shelfwall(vb, x0, x1, zw, y0, ys, d=0.3, back='#ded9cf', board='#f2efe8', dirz=1):
    """牆上的層板（靠後牆：dirz=1 往玻璃方向伸出來）"""
    a_, b_ = sorted((zw, zw + dirz * 0.03)); vb(x0, x1, y0 + ys[0] - 0.14, y0 + ys[-1] + 0.4, a_, b_, back, r=0)
    for sy in ys: a_, b_ = sorted((zw + dirz * 0.03, zw + dirz * d)); vb(x0, x1, y0 + sy - 0.022, y0 + sy, a_, b_, board, r=0)


def _xs_books(vb, x0, x1, y, z0, z1, rr, hmax=0.26, pal=None, wide=1.0):
    """一排書（書背朝外）：一本一本寬窄高矮不同，偶爾空一段、斜一疊"""
    pal = pal or ['#8c3b2a', '#2f4a3a', '#e8dcc0', '#3b5a8c', '#c9a23a', '#5a3a22', '#d9d3c6', '#7a2a4a', '#2a2a2e', '#c0563a', '#6a8a7a', '#f1ece0']
    x = x0 + 0.01
    while x < x1 - 0.05:
        if rr.random() < 0.07: x += rr.uniform(0.06, 0.16); continue
        w = rr.uniform(0.028, 0.06) * (2.4 if rr.random() < 0.3 else 1.0) * wide; w = min(w, x1 - x - 0.01); h = hmax * rr.uniform(0.72, 1.0)
        vb(x, x + w, y, y + h, z0, z1, pal[rr.randrange(len(pal))], r=0); x += w + 0.003


def _xs_pendant(cp, xf, x, z, yt, drop, col, r=0.2):
    _xs_vcyl(cp, xf, x, yt - drop, yt, z, 0.006, '#2a2a2c', 4)
    _lathe(cp(col), xf, [(0.03, 0.14), (r * 0.5, 0.11), (r, 0.0), (r - 0.012, 0.0), (r * 0.5 - 0.012, 0.1), (0.0, 0.13)], x, yt - drop - 0.14, z, seg=10)
    _lathe(cp('#fff2cc'), xf, [(0.0, 0.0), (0.045, 0.0), (0.045, 0.05), (0.0, 0.05)], x, yt - drop - 0.1, z, seg=6)


def _xs_track(cp, vb, xf, iw, tz_, yt, step=1.0):
    vb(-iw / 2 + 0.4, iw / 2 - 0.4, yt - 0.06, yt - 0.03, tz_ - 0.015, tz_ + 0.015, '#1c1c1e', r=0)
    for i in range(int((iw - 1.0) / step) + 1):
        lx = -iw / 2 + 0.6 + i * step; xf_cyl(cp('#1c1c1e'), xf, (lx, yt - 0.06, tz_), (lx, yt - 0.2, tz_ + 0.05), 0.035, seg=6); vb(lx - 0.025, lx + 0.025, yt - 0.215, yt - 0.2, tz_ + 0.03, tz_ + 0.08, '#fff6e0', r=0)


def _xs_counter(vb, x0, x1, z0, z1, y0, body='#e9e5dc', top='#c9a878', h=0.95):
    vb(x0, x1, y0, y0 + h, z0, z1, body, r=0.012); vb(x0 - 0.03, x1 + 0.03, y0 + h, y0 + h + 0.04, z0 - 0.03, z1 + 0.03, top, r=0.006)
    vb(x0 + 0.25, x0 + 0.57, y0 + h + 0.04, y0 + h + 0.07, z0 + 0.1, z1 - 0.1, '#2a2a2c', r=0); vb(x0 + 0.27, x0 + 0.55, y0 + h + 0.07, y0 + h + 0.31, (z0 + z1) / 2 - 0.015, (z0 + z1) / 2 + 0.015, '#2a2a2c', r=0)


def _xs_in_haopai(cm, cp, vb, xf, iw, gz, zb, y0, yt, rr, c):
    """好拍運動（羽球、網球拍專賣；參考圖 haopai_ext／haopai_int）：兩側牆掛滿球拍、後牆一格格的球筒和拍袋、中間矮台放球鞋和球筒、右後方櫃台和穿線機"""
    RC = ['#c0392b', '#1f4e8c', '#2a2a2c', '#e8873a', '#2f7d5b', '#f2c230', '#7a2a6a', '#dfe6ea']
    for sx in (-1, 1):                                                                                          # 兩側牆：洞洞板＋兩排球拍
        xw = sx * (iw / 2 - 0.047); a_, b_ = sorted((xw, xw - sx * 0.025)); vb(a_, b_, y0 + 0.75, yt - 0.3, zb + 0.2, gz - 0.35, '#d6cdb8', r=0)
        for row in range(2):
            for i in range(int((XS_DI - 0.7) / 0.34)):
                z_ = zb + 0.42 + i * 0.34; yb = y0 + 0.85 + row * 0.95; col = RC[(i + row * 3 + (0 if sx < 0 else 4)) % len(RC)]
                # 球拍面對店裡（法線沿 x）：用細長的盒子當拍框的側影＋一片拍面
                fs = cm.poly([xf.p(xw - sx * 0.04, yb + 0.42 + math.sin(k * 2 * math.pi / 10) * 0.15, z_ + math.cos(k * 2 * math.pi / 10) * 0.115) for k in range(10)], col, 1.0)
                cm.poly([xf.p(xw - sx * 0.045, yb + 0.42 + math.sin(k * 2 * math.pi / 10) * 0.13, z_ + math.cos(k * 2 * math.pi / 10) * 0.095) for k in range(10)], '#f1efe6', 0.96)
                a2, b2 = sorted((xw - sx * 0.03, xw - sx * 0.05)); vb(a2, b2, yb + 0.12, yb + 0.28, z_ - 0.012, z_ + 0.012, col, r=0); vb(a2, b2, yb, yb + 0.13, z_ - 0.017, z_ + 0.017, '#2a2a2c', r=0)
    # 後牆：上面一排球拍（正面對著街）、下面層板放球筒、拍袋
    vb(-iw / 2 + 0.3, iw / 2 - 1.5, y0 + 0.4, yt - 0.25, zb, zb + 0.025, '#d6cdb8', r=0)
    for i in range(int((iw - 2.0) / 0.36)): _xs_racket(cm, vb, xf, -iw / 2 + 0.55 + i * 0.36, y0 + 1.75, zb + 0.05, RC[(i * 3 + 1) % len(RC)], s=1.25)
    for sy in (0.62, 1.12, 1.6): vb(-iw / 2 + 0.3, iw / 2 - 1.5, y0 + sy - 0.022, y0 + sy, zb + 0.025, zb + 0.3, '#94714b', r=0)
    for j, sy in enumerate((0.62, 1.12)):
        for i in range(int((iw - 2.0) / 0.2)):
            x_ = -iw / 2 + 0.42 + i * 0.2
            if (i + j) % 5 == 4: vb(x_ - 0.07, x_ + 0.09, y0 + sy, y0 + sy + 0.3, zb + 0.06, zb + 0.26, RC[(i + j) % len(RC)], r=0.02); continue   # 拍袋
            _xs_vcyl(cp, xf, x_, y0 + sy, y0 + sy + 0.34, zb + 0.17, 0.036, ['#f2c230', '#e9e6de', '#c0392b', '#1f4e8c'][(i + j * 2) % 4], 7)   # 羽球筒
    # 中間矮台：球鞋、網球罐、一疊護腕
    tx0, tx1, tz0, tz1 = -iw / 2 + 0.7, iw / 2 - 1.7, gz - 1.45, gz - 0.55
    vb(tx0, tx1, y0, y0 + 0.5, tz0, tz1, '#94714b', r=0.012); vb(tx0 + 0.3, tx1 - 0.3, y0 + 0.5, y0 + 0.74, tz0 + 0.3, tz1 - 0.3, '#a8855e', r=0.01)
    for i in range(3): _xs_shoe(vb, tx0 + 0.3 + i * 0.5, y0 + 0.5, tz1 - 0.16, ['#f2f0ea', '#1f4e8c', '#c0392b'][i], acc_=['#c0392b', '#f2f0ea', '#2a2a2c'][i], sx=1 if i != 1 else -1, L_=0.32)
    for i in range(4): _xs_vcyl(cp, xf, tx0 + 0.5 + i * 0.22, y0 + 0.74, y0 + 0.74 + 0.22, (tz0 + tz1) / 2, 0.04, ['#d9e23a', '#e9e6de', '#d9e23a', '#c0392b'][i], 7)
    _xs_racket(cm, vb, xf, tx1 - 0.25, y0 + 0.5, tz0 + 0.12, '#e8873a', s=1.2)
    # 右後方：櫃台＋穿線機（立柱＋橫臂＋轉盤）
    _xs_counter(vb, iw / 2 - 1.35, iw / 2 - 0.35, zb + 0.55, zb + 1.0, y0, body='#94714b', top='#d6cdb8')
    mx_, mz_ = iw / 2 - 0.75, zb + 1.75
    vb(mx_ - 0.22, mx_ + 0.22, y0, y0 + 0.04, mz_ - 0.22, mz_ + 0.22, '#3a3d42', r=0); _xs_vcyl(cp, xf, mx_, y0 + 0.04, y0 + 1.0, mz_, 0.035, '#3a3d42', 6)
    vb(mx_ - 0.42, mx_ + 0.42, y0 + 1.0, y0 + 1.06, mz_ - 0.07, mz_ + 0.07, '#c0392b', r=0.01); _xs_ngon(cm, xf, mx_, y0 + 1.07, mz_, 0.01, 0.01, '#2a2a2c', n=4)
    for sx in (-1, 1): vb(mx_ + sx * 0.36 - 0.02, mx_ + sx * 0.36 + 0.02, y0 + 1.06, y0 + 1.2, mz_ - 0.02, mz_ + 0.02, '#b9bcc0', r=0)
    _xs_track(cp, vb, xf, iw, zb + 1.4, yt, step=0.8)


def _xs_in_xsports(cm, cp, vb, xf, iw, gz, zb, y0, yt, rr, c):
    """新生運動廣場（參考圖 xsports_ext／xsports_int）：左邊一架籃球、排球、網球；兩個穿球衣的人台；中間門後看得到衣架和櫃台；右邊一架水壺、牆上的球拍"""
    m0, m1 = (c.get('mullions', [-2.2, 2.2]) + [2.2])[:2]
    # 左：球架（鐵線層架四層）
    bx0, bx1, bz0, bz1 = -iw / 2 + 0.25, -iw / 2 + 2.3, gz - 1.0, gz - 0.45
    for ux in (bx0, bx1):
        for uz in (bz0, bz1): vb(ux - 0.015, ux + 0.015, y0, y0 + 2.2, uz - 0.015, uz + 0.015, '#8c9096', r=0)
    BALL = [('#c9663a', 0.12), ('#c9663a', 0.12), ('#f2e9c8', 0.105), ('#d9e23a', 0.06)]
    for j, sy in enumerate((1.75, 1.25, 0.75, 0.25)):
        vb(bx0, bx1, y0 + sy - 0.02, y0 + sy, bz0, bz1, '#a9adb2', r=0); col, r_ = BALL[j]; n_ = int((bx1 - bx0 - 0.1) / (r_ * 2 + 0.03))
        for i in range(n_):
            cc = col if j != 2 else ['#f2e9c8', '#2f5fa8', '#e8c23a'][i % 3]
            _xs_ball(cp, xf, bx0 + 0.07 + r_ + i * (r_ * 2 + 0.03), y0 + sy, (bz0 + bz1) / 2 + (0.05 if i % 2 else -0.05), r_, cc, seg=7 if r_ > 0.08 else 5)
    # 洞洞板上的背包、護具
    px0, px1 = -iw / 2 + 2.6, m0 - 1.9
    vb(px0, px1, y0 + 0.5, y0 + 2.4, gz - 1.25, gz - 1.21, '#d8c8ae', r=0)
    for j in range(3):
        for i in range(max(1, int((px1 - px0) / 0.42))):
            x_ = px0 + 0.22 + i * 0.42; yy = y0 + 0.65 + j * 0.6; vb(x_ - 0.15, x_ + 0.15, yy, yy + 0.42, gz - 1.21, gz - 1.06, ['#2a2a2c', '#1f4e8c', '#3a3d42', '#c0392b'][(i + j) % 4], r=0.04)
    # 兩個人台（球衣）
    _xs_mannequin(cp, vb, xf, m0 - 1.25, gz - 0.7, y0, '#1f2e55', '#1f2e55'); _xs_mannequin(cp, vb, xf, m0 - 0.55, gz - 0.75, y0, '#f2f0ea', '#2a3a5a')
    vb(m0 - 1.33, m0 - 1.17, y0 + 1.2, y0 + 1.36, gz - 0.59, gz - 0.585, '#f2f0ea', r=0); vb(m0 - 0.63, m0 - 0.47, y0 + 1.2, y0 + 1.36, gz - 0.64, gz - 0.635, '#c0392b', r=0)   # 胸前的號碼
    # 門後：兩排衣架、後面櫃台、後牆的鞋牆
    _xs_rack(cp, vb, xf, m0 + 0.5, m0 + 2.1, zb + 1.5, y0, ['#2a2a2c', '#f2f0ea', '#1f4e8c', '#c0392b', '#3a3d42', '#e8873a'])
    _xs_rack(cp, vb, xf, m1 - 2.0, m1 - 0.5, zb + 0.95, y0, ['#f2f0ea', '#2f7d5b', '#2a2a2c', '#f2c230', '#1f4e8c'])
    _xs_counter(vb, m0 + 0.2, m0 + 1.6, zb + 0.35, zb + 0.8, y0, body='#b48654', top='#e6dccb')
    _xs_shelfwall(vb, -iw / 2 + 0.3, m0 - 0.2, zb, y0, (0.7, 1.2, 1.7, 2.2), back='#d8c8ae', board='#b48654')
    k_ = 0
    for sy in (0.7, 1.2, 1.7, 2.2):
        for i in range(int((m0 - 0.5 + iw / 2) / 0.62)):
            _xs_shoe(vb, -iw / 2 + 0.62 + i * 0.62, y0 + sy, zb + 0.17, ['#f2f0ea', '#2a2a2e', '#c0483c', '#3a5a8c', '#e9e6de', '#8ad0c0'][k_ % 6], sx=1 if k_ % 3 else -1, L_=0.32, lod=1); k_ += 1
    # 右：水壺架（五層，一瓶一瓶）＋牆上的球拍
    wx0, wx1, wz0, wz1 = m1 + 0.45, iw / 2 - 0.3, gz - 0.95, gz - 0.5
    for ux in (wx0, wx1): vb(ux - 0.02, ux + 0.02, y0, y0 + 2.3, wz0, wz1, '#b48654', r=0)
    BOT = ['#e9e6de', '#f0a8b8', '#8ad0e0', '#2a2a2c', '#c0392b', '#f2c230', '#2f7d5b', '#dfe6ea', '#7a6aa8']
    for j, sy in enumerate((0.3, 0.75, 1.2, 1.65, 2.1)):
        vb(wx0, wx1, y0 + sy - 0.02, y0 + sy, wz0, wz1, '#b48654', r=0)
        for i in range(int((wx1 - wx0 - 0.1) / 0.16)):
            x_ = wx0 + 0.11 + i * 0.16; h_ = 0.2 + ((i + j) % 3) * 0.03
            _lathe(cp(BOT[(i * 2 + j) % len(BOT)]), xf, [(0.0, 0.0), (0.04, 0.0), (0.04, h_), (0.022, h_ + 0.012), (0.022, h_ + 0.04), (0.0, h_ + 0.04)], x_, y0 + sy, (wz0 + wz1) / 2, seg=6)
    vb(m1 + 0.2, iw / 2 - 0.3, y0 + 0.9, yt - 0.3, zb, zb + 0.025, '#d8c8ae', r=0)
    for i in range(int((iw / 2 - m1 - 0.7) / 0.4)): _xs_racket(cm, vb, xf, m1 + 0.5 + i * 0.4, y0 + 1.3, zb + 0.05, ['#c0392b', '#1f4e8c', '#2a2a2c', '#e8873a', '#2f7d5b'][i % 5], s=1.3)
    for tz_ in (zb + 1.1, gz - 0.9): _xs_track(cp, vb, xf, iw, tz_, yt, step=1.3)


def _xs_in_shanlan(cm, cp, vb, xf, iw, gz, zb, y0, yt, rr, c):
    """山嵐書店一樓（參考圖 shanlan_ext／shanlan_int）：暖色木頭。左邊往上的木樓梯和大盆栽；後牆整面到頂的書牆；中間門後的平台放新書；右邊斜面的雜誌架和閱讀桌；吊燈"""
    WOOD, WOODD = '#c9a070', '#8a6a48'; m0, m1 = (c.get('mullions', [-2.6, 2.6]) + [2.6])[:2]
    # 後牆的書牆（六層到頂；直板一格一格）
    sx0, sx1 = -iw / 2 + 2.6, iw / 2 - 0.2
    vb(sx0, sx1, y0, yt - 0.1, zb, zb + 0.03, WOODD, r=0)
    ys = [0.08 + j * 0.46 for j in range(6)]
    for sy in ys + [ys[-1] + 0.46]: vb(sx0, sx1, y0 + sy - 0.025, y0 + sy, zb + 0.03, zb + 0.3, WOOD, r=0)
    nb = int((sx1 - sx0) / 1.1); bw = (sx1 - sx0) / nb
    for i in range(nb + 1): vb(sx0 + i * bw - 0.015, sx0 + i * bw + 0.015, y0, y0 + ys[-1] + 0.45, zb + 0.032, zb + 0.296, WOOD, r=0)
    for sy in ys:
        for i in range(nb): _xs_books(vb, sx0 + i * bw + 0.02, sx0 + (i + 1) * bw - 0.02, y0 + sy, zb + 0.08, zb + 0.26, rr, hmax=0.36, wide=1.75)
    # 左：木樓梯（往後往上，七階看得到）＋扶手＋大盆栽
    st0 = -iw / 2 + 0.15
    for i in range(8):
        vb(st0, st0 + 1.15, y0 + i * 0.19, y0 + (i + 1) * 0.19, gz - 0.9 - (i + 1) * 0.26, gz - 0.9 - i * 0.26 if i else gz - 0.9, WOOD, r=0)
    for i in (0, 3, 7): vb(st0 + 1.13, st0 + 1.17, y0 + (i + 1) * 0.19, y0 + (i + 1) * 0.19 + 0.9, gz - 0.9 - (i + 0.5) * 0.26 - 0.02, gz - 0.9 - (i + 0.5) * 0.26 + 0.02, '#2a2a2c', r=0)
    cm.poly([xf.p(st0 + 1.15, y0 + 0.19 + 0.9, gz - 1.0), xf.p(st0 + 1.15, y0 + 0.19 + 0.94, gz - 1.0), xf.p(st0 + 1.15, y0 + 8 * 0.19 + 0.94, gz - 0.9 - 7.5 * 0.26), xf.p(st0 + 1.15, y0 + 8 * 0.19 + 0.9, gz - 0.9 - 7.5 * 0.26)], '#2a2a2c', 1.0)
    _xs_plant(cm, cp, xf, st0 + 1.75, gz - 0.55, y0, rr, ph=0.45, pr=0.2, fh=1.2, fr=0.55, pot='#c9c2b4')
    # 中間（門後）：新書平台兩張（平放的書一疊疊＋立著的）
    for (tx, tz_) in ((m0 + 1.3, gz - 1.3), (m1 - 1.4, gz - 1.75)):
        vb(tx - 0.8, tx + 0.8, y0 + 0.5, y0 + 0.56, tz_ - 0.45, tz_ + 0.45, WOOD, r=0.01)
        for ax in (tx - 0.72, tx + 0.72):
            for az in (tz_ - 0.38, tz_ + 0.38): vb(ax - 0.03, ax + 0.03, y0, y0 + 0.5, az - 0.03, az + 0.03, WOODD, r=0)
        for i in range(5):
            for j in range(2):
                bx_, bz_ = tx - 0.62 + i * 0.31, tz_ - 0.2 + j * 0.4; n_ = 1 + (i * 3 + j) % 3
                for q in range(n_): vb(bx_ - 0.1, bx_ + 0.1, y0 + 0.56 + q * 0.03, y0 + 0.585 + q * 0.03, bz_ - 0.14, bz_ + 0.14, ['#e8dcc0', '#3b5a8c', '#c0563a', '#2f4a3a', '#f1ece0', '#c9a23a', '#7a2a4a'][(i + j * 2 + q) % 7], r=0)
    # 右邊：斜面的雜誌架（靠玻璃，三層，封面朝街）＋閱讀桌和兩張椅子
    rx0, rx1 = m1 + 0.5, iw / 2 - 0.35
    for j in range(3):
        yb = y0 + 0.35 + j * 0.5; zc = gz - 0.75 - j * 0.16
        vb(rx0, rx1, yb - 0.03, yb, zc - 0.1, zc + 0.14, WOOD, r=0)
        for i in range(int((rx1 - rx0 - 0.1) / 0.3)):
            x_ = rx0 + 0.2 + i * 0.3; cm.poly([xf.p(x_ - 0.11, yb, zc + 0.1), xf.p(x_ + 0.11, yb, zc + 0.1), xf.p(x_ + 0.11, yb + 0.3, zc + 0.0), xf.p(x_ - 0.11, yb + 0.3, zc + 0.0)], ['#e8dcc0', '#8ab0c0', '#c0563a', '#f1ece0', '#2f4a3a', '#d9b45a', '#b88aa0'][(i + j * 3) % 7], 1.0)
            cm.poly([xf.p(x_ - 0.08, yb + 0.17, zc + 0.045), xf.p(x_ + 0.08, yb + 0.17, zc + 0.045), xf.p(x_ + 0.08, yb + 0.26, zc + 0.015), xf.p(x_ - 0.08, yb + 0.26, zc + 0.015)], ['#3b2a1e', '#f1ece0', '#f1ece0', '#8c3b2a', '#e8dcc0', '#3b2a1e', '#f1ece0'][(i + j * 3) % 7], 1.0)
    for sx in (-1, 1): vb((rx0 + rx1) / 2 + sx * (rx1 - rx0) / 2 - 0.02, (rx0 + rx1) / 2 + sx * (rx1 - rx0) / 2 + 0.02, y0, y0 + 1.5, gz - 1.2, gz - 0.6, WOODD, r=0)
    tx, tz_ = (rx0 + rx1) / 2, zb + 1.2
    vb(tx - 0.75, tx + 0.75, y0 + 0.7, y0 + 0.74, tz_ - 0.38, tz_ + 0.38, WOOD, r=0.008)
    for ax in (tx - 0.68, tx + 0.68):
        for az in (tz_ - 0.32, tz_ + 0.32): vb(ax - 0.02, ax + 0.02, y0, y0 + 0.7, az - 0.02, az + 0.02, '#2a2a2c', r=0)
    _pk_chair(vb, tx - 0.35, tz_ + 0.6, y0, WOOD, '#2a2a2c', '+z'); _pk_chair(vb, tx + 0.4, tz_ + 0.6, y0, WOOD, '#2a2a2c', '+z')
    vb(tx - 0.3, tx - 0.02, y0 + 0.74, y0 + 0.765, tz_ - 0.1, tz_ + 0.1, '#e8dcc0', r=0)
    # 櫃台（門後偏左）＋吊燈
    _xs_counter(vb, m0 - 2.2, m0 - 0.5, zb + 0.6, zb + 1.05, y0, body=WOOD, top='#e8e2d6')
    for (lx, lz, dr) in ((m0 + 1.3, gz - 1.3, 0.75), (m1 - 1.4, gz - 1.75, 0.75), (tx, tz_, 0.7), (m0 - 1.4, zb + 0.85, 0.6), (st0 + 1.9, gz - 0.9, 0.55)): _xs_pendant(cp, xf, lx, lz, yt, dr, '#c9753a', r=0.22)


def _xs_guitar(cm, vb, xf, x, y, z, col, s=1.0, elec=False):
    """掛在牆上的吉他（琴頭朝上，正面朝街）"""
    if elec:
        _xs_ngon(cm, xf, x, y + 0.2 * s, z, 0.16 * s, 0.2 * s, col, n=8, a0=0.4); vb(x - 0.05 * s, x + 0.05 * s, y + 0.12 * s, y + 0.3 * s, z + 0.002, z + 0.012, '#f1efe6', r=0)
    else:
        _xs_ngon(cm, xf, x, y + 0.17 * s, z, 0.19 * s, 0.17 * s, col, n=12); _xs_ngon(cm, xf, x, y + 0.4 * s, z + 0.002, 0.145 * s, 0.14 * s, col, n=12); _xs_ngon(cm, xf, x, y + 0.36 * s, z + 0.005, 0.05 * s, 0.05 * s, '#2a1c14', n=8)
        vb(x - 0.06 * s, x + 0.06 * s, y + 0.14 * s, y + 0.17 * s, z + 0.003, z + 0.014, '#2a1c14', r=0)
    vb(x - 0.026 * s, x + 0.026 * s, y + 0.38 * s, y + 0.9 * s, z + 0.006, z + 0.018, '#3a2a1e', r=0); vb(x - 0.04 * s, x + 0.04 * s, y + 0.9 * s, y + 1.03 * s, z, z + 0.014, col if elec else '#3a2a1e', r=0)


def _xs_in_tongxian(cm, cp, vb, xf, iw, gz, zb, y0, yt, rr, c):
    """同弦樂器的一樓櫥窗（店在二樓；參考圖 tongxian_ext）：木牆上掛一排吉他、烏克麗麗；前面立架上兩把、音箱、一張高腳凳和譜架；暖光"""
    WOOD = '#b98a5a'
    for i in range(int(iw / 0.5)): vb(-iw / 2 + i * 0.5 + 0.01, -iw / 2 + (i + 1) * 0.5 - 0.01, y0, yt - 0.05, zb, zb + 0.02 + (i % 2) * 0.006, ['#a87a4e', '#b98a5a', '#9c7046'][i % 3], r=0)   # 木板牆
    GC = ['#c98a3a', '#8a4a22', '#e0c08a', '#2a2a2c', '#b0452a', '#d9b06a', '#5a3a22']
    n_ = int((iw - 0.5) / 0.5)
    for i in range(n_):
        x_ = -iw / 2 + 0.45 + i * 0.5; _xs_guitar(cm, vb, xf, x_, y0 + 1.25 + (i % 2) * 0.08, zb + 0.06, GC[i % len(GC)], s=1.0 if i % 4 != 3 else 0.62, elec=(i % 3 == 2))
        vb(x_ - 0.04, x_ + 0.04, y0 + 2.2 + (i % 2) * 0.08, y0 + 2.23 + (i % 2) * 0.08, zb + 0.02, zb + 0.09, '#2a2a2c', r=0)
    for sx in (-1, 1):                                                                                          # 側牆各兩把（側面對著街：只看得到薄薄一片＋琴頸）
        xw = sx * (iw / 2 - 0.047)
        for i in range(2):
            z_ = zb + 0.9 + i * 0.9; cm.poly([xf.p(xw - sx * 0.06, y0 + 1.2 + 0.17 + math.sin(k * math.pi / 5) * 0.19, z_ + math.cos(k * math.pi / 5) * 0.19) for k in range(10)], GC[(i * 2 + (3 if sx > 0 else 0)) % len(GC)], 1.0)
            a_, b_ = sorted((xw - sx * 0.05, xw - sx * 0.075)); vb(a_, b_, y0 + 1.5, y0 + 2.2, z_ - 0.026, z_ + 0.026, '#3a2a1e', r=0)
    # 前面：地上兩個吉他架（A 字架＋吉他）、音箱、高腳凳、譜架、地毯
    vb(-iw / 2 + 0.3, iw / 2 - 0.3, y0, y0 + 0.012, gz - 1.9, gz - 0.35, '#8a3a2e', r=0); vb(-iw / 2 + 0.42, iw / 2 - 0.42, y0 + 0.012, y0 + 0.016, gz - 1.78, gz - 0.47, '#a8503a', r=0)
    for (gx_, col, el) in ((-iw / 2 + 0.75, '#c98a3a', False), (-iw / 2 + 1.35, '#b0452a', True)):
        _xs_guitar(cm, vb, xf, gx_, y0 + 0.14, gz - 0.95, col, s=1.0, elec=el)
        for sx in (-1, 1): xf_cyl(cp('#2a2a2c'), xf, (gx_ + sx * 0.18, y0, gz - 0.85), (gx_, y0 + 0.5, gz - 1.0), 0.01, seg=4)
        xf_cyl(cp('#2a2a2c'), xf, (gx_, y0, gz - 1.2), (gx_, y0 + 0.5, gz - 1.0), 0.01, seg=4)
    ax0 = iw / 2 - 1.15
    vb(ax0, ax0 + 0.62, y0, y0 + 0.56, gz - 1.25, gz - 0.9, '#2a2a2c', r=0.02); vb(ax0 + 0.04, ax0 + 0.58, y0 + 0.04, y0 + 0.42, gz - 0.9, gz - 0.893, '#6a5a48', r=0); vb(ax0 + 0.04, ax0 + 0.58, y0 + 0.45, y0 + 0.53, gz - 0.9, gz - 0.893, '#c9a23a', r=0)   # 音箱
    _pk_stool(cp, xf, -0.1, gz - 1.15, y0 + 0.22, '#3a2a1e', '#2a2a2c'); _xs_vcyl(cp, xf, -0.1, y0, y0 + 0.24, gz - 1.15, 0.02, '#2a2a2c', 5)
    sxm = 0.55; _xs_vcyl(cp, xf, sxm, y0, y0 + 1.05, gz - 0.85, 0.012, '#2a2a2c', 5)
    cm.poly([xf.p(sxm - 0.2, y0 + 1.0, gz - 0.8), xf.p(sxm + 0.2, y0 + 1.0, gz - 0.8), xf.p(sxm + 0.2, y0 + 1.3, gz - 0.9), xf.p(sxm - 0.2, y0 + 1.3, gz - 0.9)], '#2a2a2c', 1.0)
    cm.poly([xf.p(sxm - 0.16, y0 + 1.03, gz - 0.795), xf.p(sxm + 0.16, y0 + 1.03, gz - 0.795), xf.p(sxm + 0.16, y0 + 1.27, gz - 0.875), xf.p(sxm - 0.16, y0 + 1.27, gz - 0.875)], '#f1ece0', 1.0)
    for lx in (-iw / 4, iw / 4): _xs_pendant(cp, xf, lx, gz - 1.1, yt, 0.5, '#2a2a2c', r=0.17)


def _xs_in_dakou(cm, cp, vb, xf, iw, gz, zb, y0, yt, rr, c):
    """大口漢堡一樓（參考圖 dakou_ext／dakou_int）：後面一整條點餐櫃台（白色檯面、藍色腰帶、橘色線）、上方一排發亮的菜單板、後牆廚房的出餐口；
    前面靠窗四人桌三組＋高腳吧台；牆上的漢堡海報；吊燈"""
    NAVY, ORG, CREAM = '#1f3a6b', '#e8873a', '#f1ece0'
    cx0, cx1 = -iw / 2 + 2.2, iw / 2 - 2.2
    vb(cx0, cx1, y0, y0 + 1.0, zb + 0.95, zb + 1.4, CREAM, r=0.012); vb(cx0 - 0.03, cx1 + 0.03, y0 + 1.0, y0 + 1.04, zb + 0.92, zb + 1.43, '#f6f4ee', r=0.006)
    vb(cx0, cx1, y0 + 0.3, y0 + 0.62, zb + 1.4, zb + 1.412, NAVY, r=0); vb(cx0, cx1, y0 + 0.66, y0 + 0.7, zb + 1.4, zb + 1.412, ORG, r=0)
    for i in range(3):                                                                                          # 收銀機、托盤上的漢堡和飲料
        x_ = cx0 + 0.8 + i * (cx1 - cx0 - 1.6) / 2
        vb(x_ - 0.16, x_ + 0.16, y0 + 1.04, y0 + 1.07, zb + 1.05, zb + 1.3, '#2a2a2c', r=0); vb(x_ - 0.14, x_ + 0.14, y0 + 1.07, y0 + 1.3, zb + 1.16, zb + 1.19, '#2a2a2c', r=0)
        vb(x_ + 0.4, x_ + 0.78, y0 + 1.04, y0 + 1.055, zb + 1.03, zb + 1.32, '#8a5a3a', r=0)
        _lathe(cp('#d9a05a'), xf, [(0.0, 0.0), (0.07, 0.0), (0.075, 0.03), (0.06, 0.07), (0.0, 0.08)], x_ + 0.5, y0 + 1.055, zb + 1.17, seg=8); _xs_vcyl(cp, xf, x_ + 0.68, y0 + 1.055, y0 + 1.19, zb + 1.17, 0.035, '#c0392b', 7)
    # 後牆：深藍＋出餐口（不鏽鋼框，裡面暗的廚房）、上方菜單板五塊（發亮：白底、圖和字的色塊）
    vb(-iw / 2 + 0.05, iw / 2 - 0.05, y0, y0 + 1.15, zb, zb + 0.02, NAVY, r=0); vb(-iw / 2 + 0.05, iw / 2 - 0.05, y0 + 1.15, y0 + 1.2, zb, zb + 0.026, ORG, r=0)
    vb(-1.6, 1.6, y0 + 1.25, y0 + 1.95, zb, zb + 0.03, '#b9bdc0', r=0); vb(-1.5, 1.5, y0 + 1.32, y0 + 1.88, zb + 0.03, zb + 0.034, '#4a4640', r=0); vb(-1.6, 1.6, y0 + 1.22, y0 + 1.26, zb, zb + 0.16, '#cfd3d5', r=0)
    for i in range(4): vb(-1.2 + i * 0.75, -0.9 + i * 0.75, y0 + 1.26, y0 + 1.36, zb + 0.04, zb + 0.14, [CREAM, ORG, CREAM, '#c0392b'][i], r=0)
    nm = 5; mw = (cx1 - cx0) / nm
    for i in range(nm):
        x_ = cx0 + i * mw; vb(x_ + 0.04, x_ + mw - 0.04, y0 + 2.12, y0 + 2.72, zb + 0.9, zb + 0.96, '#1a1a1c', r=0); vb(x_ + 0.07, x_ + mw - 0.07, y0 + 2.15, y0 + 2.69, zb + 0.96, zb + 0.965, '#fbf6ea', r=0)
        _xs_ngon(cm, xf, x_ + 0.36, y0 + 2.46, zb + 0.97, 0.17, 0.13, ['#d9a05a', '#c98a3a', '#e8c070', '#d9a05a', '#b87a3a'][i], n=10); vb(x_ + 0.2, x_ + 0.52, y0 + 2.43, y0 + 2.455, zb + 0.972, zb + 0.975, ['#5a8a3a', '#c0392b', '#5a8a3a', '#f2c230', '#c0392b'][i], r=0)
        for q in range(3): vb(x_ + 0.62, x_ + mw - 0.14 - (q % 2) * 0.12, y0 + 2.56 - q * 0.14, y0 + 2.6 - q * 0.14, zb + 0.966, zb + 0.969, '#3a2a1e' if q else NAVY, r=0)
        vb(x_ + mw - 0.3, x_ + mw - 0.12, y0 + 2.2, y0 + 2.27, zb + 0.966, zb + 0.969, '#c0392b', r=0)
    # 兩側牆：左邊大海報、右邊飲料機
    xw = -(iw / 2 - 0.047); vb(xw, xw + 0.02, y0 + 1.0, y0 + 2.4, zb + 0.5, zb + 2.3, NAVY, r=0)
    cm.poly([xf.p(xw + 0.025, y0 + 1.7 + math.sin(k * math.pi / 5) * 0.36, zb + 1.4 + math.cos(k * math.pi / 5) * 0.5) for k in range(10)], '#d9a05a', 1.0)
    cm.poly([xf.p(xw + 0.03, y0 + 1.62 + s_ * 0.05, zb + 1.4 + c_ * 0.5) for (c_, s_) in ((-1, -1), (1, -1), (1, 1), (-1, 1))], '#5a8a3a', 1.0)
    dx0 = iw / 2 - 1.9
    vb(dx0, iw / 2 - 0.3, y0, y0 + 0.95, zb + 0.1, zb + 0.7, '#cfd3d5', r=0.01); vb(dx0 + 0.15, iw / 2 - 0.45, y0 + 0.95, y0 + 1.7, zb + 0.15, zb + 0.6, '#2a2a2c', r=0.02)
    for i in range(4): vb(dx0 + 0.25 + i * 0.3, dx0 + 0.45 + i * 0.3, y0 + 1.3, y0 + 1.58, zb + 0.6, zb + 0.605, ['#c0392b', '#e8873a', '#5a8a3a', '#3a2a1e'][i], r=0)
    # 前面：四人桌三組（白桌面、藍橘椅子）＋左邊靠窗的高腳吧台
    for k, tx in enumerate((-1.9, 1.1, 4.0)):
        tz_ = gz - 1.05
        vb(tx - 0.55, tx + 0.55, y0 + 0.72, y0 + 0.76, tz_ - 0.35, tz_ + 0.35, '#f6f4ee', r=0); _xs_vcyl(cp, xf, tx, y0, y0 + 0.72, tz_, 0.035, '#3a3d42', 6); vb(tx - 0.2, tx + 0.2, y0, y0 + 0.02, tz_ - 0.2, tz_ + 0.2, '#3a3d42', r=0)
        for sx in (-1, 1):
            for sz in (-1, 1):
                if sz > 0 and (k + sx) % 3 == 0: continue
                _pk_chair(vb, tx + sx * 0.27, tz_ + sz * 0.62, y0, ORG if (sx * sz + k) % 2 else NAVY, '#3a3d42', '+z' if sz > 0 else '-z')
        vb(tx - 0.2, tx + 0.12, y0 + 0.76, y0 + 0.775, tz_ - 0.15, tz_ + 0.1, '#c9a070', r=0); _xs_vcyl(cp, xf, tx + 0.3, y0 + 0.76, y0 + 0.9, tz_ + 0.05, 0.035, '#f1ece0', 7)
    hx0, hx1 = -iw / 2 + 0.3, -iw / 2 + 3.0
    vb(hx0, hx1, y0 + 1.0, y0 + 1.05, gz - 0.55, gz - 0.2, '#d7b78a', r=0.008)
    for ux in (hx0 + 0.1, (hx0 + hx1) / 2, hx1 - 0.1): vb(ux - 0.02, ux + 0.02, y0, y0 + 1.0, gz - 0.4, gz - 0.36, '#3a3d42', r=0)
    for i in range(4): _pk_stool(cp, xf, hx0 + 0.4 + i * 0.65, gz - 0.85, y0 + 0.28, NAVY if i % 2 else ORG, '#3a3d42'); _xs_vcyl(cp, xf, hx0 + 0.4 + i * 0.65, y0, y0 + 0.3, gz - 0.85, 0.02, '#3a3d42', 5)
    for lx in (-4.6, -1.9, 1.1, 4.0): _xs_pendant(cp, xf, lx, gz - 1.05, yt, 0.55, ORG if lx != 1.1 else '#f1ece0', r=0.2)


XS_IN3D.update({
    'haopai': dict(fn=_xs_in_haopai, floor='f_cream', wall='#c8bfaa', ceil='#c4b8a2', warm=True),
    'xsports': dict(fn=_xs_in_xsports, floor='f_granite', wall='#c9b69c', ceil='#c2ae92', warm=True),
    'shanlan': dict(fn=_xs_in_shanlan, floor='f_wood', wall='#ece6da', ceil='#d9c8a8', warm=True),
    'tongxian': dict(fn=_xs_in_tongxian, floor='f_wood', wall='#d9c4a0', ceil='#cdb890', warm=True),
    'dakou': dict(fn=_xs_in_dakou, floor='f_terrazzo', wall='#f2e0c6', ceil='#e6dfd0', warm=True),
})
