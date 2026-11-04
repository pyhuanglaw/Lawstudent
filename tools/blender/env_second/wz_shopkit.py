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
_ATL = 'gg_signs_atlas' if ('--set' in sys.argv and sys.argv[sys.argv.index('--set') + 1] == 'gongguan') else 'wz_signs_atlas'   # 公館用自己的貼圖集（sign_atlas.py --set gongguan）
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
if SET == 'wenzhou': SK['enamel_red'] = flat('wz_sf_enamel_steel', '#c9ccc9', rough=0.28, metal=0.45)   # WZ-FIVE-1104：林家的攤車照參考圖是不鏽鋼（溫州街只有林家用麵攤）
SK['lamp_red'] = flat('wz_sf_lamp_red', '#d4442e', rough=0.5, emit=B.srgb('#e8583c'))   # WZ-FIVE-1104：小路門邊的紅燈籠（名字照 wz_sf_lamp 開頭：不投影、晚上亮）
SK['noren'] = _img_mat('wz_noren', 'shop_noren.png', rough=0.9)   # 定食店的暖簾（shopkit_tex.noren）
SK['bowl_w'] = flat('wz_sf_bowl_white', '#f2efe8', rough=0.3); SK['bowl_b'] = flat('wz_sf_bowl_indigo', '#2f4a6a', rough=0.3)   # 燈箱：貼圖自己發光（白天也微微亮，和真的燈箱一樣）
# 有使用者核可招牌圖（BB-B signs_approved）的店：棟號 → 貼圖集的名字（_h 橫、_v 直）
SIGNMAP = {'A1': 'wz_ade', 'A3': 'xiangkou_books', 'A4': 'wz_lin', 'A5': 'riri_mart', 'B2': 'laundry', 'B3': 'wz_komichi',
           'B5': 'xiangkou_tea', 'B5i': 'summer_ice', 'B6': 'azhong_fruit', 'B7': 'wz_sunnyside'}   # WZ-FIVE-1104：林家、小路、SUNNY SIDE、阿德換成使用者 11-04 參考圖的招牌（舊的設計稿 lin_noodle／xiangzi_teishoku／banshu／ade_print 留在圖集裡）


def sign_tex(xf, key, cx, y0, w, zf, name):
    """一塊貼圖招牌（設計稿）：寬 w，高照設計稿比例；回傳上緣高度"""
    it = SIGN_ATLAS[key]; h = w / it['aspect']
    uvquad(name, SK['sign_lit'] if it['lit'] else SK['sign'], [xf.p(cx - w / 2, y0, zf), xf.p(cx + w / 2, y0, zf), xf.p(cx + w / 2, y0 + h, zf), xf.p(cx - w / 2, y0 + h, zf)], tuple(it['uv']))
    return y0 + h


def hsign(xf, sid, key, cx, sw, sy0, depth=None):
    """橫招牌：底座（燈箱＝鋁框盒、木招牌＝深色薄板）＋設計稿；回傳上緣"""
    it = SIGN_ATLAS[key]; lit = it['lit']; sh_ = sw / it['aspect']; dp = depth if depth is not None else (0.2 if lit else 0.12)   # 木招牌也要 12 cm：樓層的水泥帶凸出牆面 8 cm，薄招牌會被它蓋住一條
    xf.box(acc(SK['alu2'] if lit else SK['black']), cx - sw / 2 - 0.03, cx + sw / 2 + 0.03, sy0 - 0.03, sy0 + sh_ + 0.03, 0.0, dp)
    sy1 = sign_tex(xf, key, cx, sy0, sw, dp + 0.004, f'sk_sign_{sid}')
    if lit: CL.glow(root, 'signbox', *xf.p(cx, (sy0 + sy1) / 2, 0.6), color='rgba(255,250,235,1)', size=2.2, day=0.0, night=0.55)
    else:                                                                             # 木招牌、鐵皮招牌：上面一盞投光燈照著
        for lx in (cx - sw / 3, cx + sw / 3):
            xf.cyl(acc(SK['black']), (lx, sy1 + 0.05, 0.05), (lx, sy1 + 0.12, 0.35), 0.012, seg=5); acc(SK['black']).sphere(xf.p(lx, sy1 + 0.12, 0.38), 0.05, seg=8, rings=4)
            CL.glow(root, 'signspot', *xf.p(lx, sy1 - 0.2, 0.45), color='rgba(255,226,180,1)', size=1.4, day=0.0, night=0.6)
    return sy1


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
    KINDS = [('#9cc35a', 0.055, 1), ('#f2d040', 0.0, 2), ('#e8952e', 0.075, 3), ('#c8322a', 0.05, 4), ('#e6dc9a', 0.055, 5), ('#d2386c', 0.06, 6), ('#9cc35a', 0.055, 1), ('#f0a030', 0.07, 3), ('#7bb04a', 0.05, 4), ('#e8952e', 0.075, 6)]
    for i, (col, r, style) in enumerate(KINDS):
        tier = i // 5; x = -1.0 + (i % 5) * 0.5; y = 0.72 if tier == 0 else 0.96; z = 0.2 if tier == 0 else -0.2
        crate = '#c8322a' if (i % 3 == 1) else '#c9a46a'                                                     # 紅色塑膠籃或淺木箱
        m.cbox(x - 0.22, x + 0.22, y, y + 0.03, z - 0.17, z + 0.17, crate, 0.9)
        for sx in (-1, 1): m.cbox(x + sx * 0.22 - 0.012, x + sx * 0.22 + 0.012, y, y + 0.12, z - 0.17, z + 0.17, crate)
        for sz in (-1, 1): m.cbox(x - 0.22, x + 0.22, y, y + 0.12, z + sz * 0.17 - 0.012, z + sz * 0.17 + 0.012, crate)
        if r == 0.0:                                                                                     # 香蕉：一串一串（黃色長條，兩層）
            for k in range(3): m.cbox(x - 0.18 + k * 0.12, x - 0.1 + k * 0.12, y + 0.05, y + 0.12 + (k % 2) * 0.03, z - 0.13, z + 0.13, '#f2d040'); m.cbox(x - 0.16 + k * 0.12, x - 0.12 + k * 0.12, y + 0.12, y + 0.16, z + 0.1, z + 0.14, '#6a5a2a')
            continue
        for a in range(3):
            for b in range(2):
                fr.append((x - 0.13 + a * 0.13 + rr.uniform(-0.01, 0.01), y + 0.03 + r + (0.02 if (a + b) % 2 else 0.0), z - 0.07 + b * 0.14, col, r))
        if style == 5:                                                                                   # 套白色網套的梨子：上面再一顆
            fr.append((x, y + 0.03 + r * 2.4, z, '#f4f0e4', r * 0.9))
    sx0 = 1.32; m.cbox(sx0, sx0 + 0.5, 0.0, 0.03, -0.25, 0.25, '#9aa0a4')                               # 右邊的不鏽鋼小桌＋果汁機
    for (a, b) in ((sx0 + 0.02, -0.23), (sx0 + 0.48, -0.23), (sx0 + 0.02, 0.23), (sx0 + 0.48, 0.23)): m.cbox(a - 0.015, a + 0.015, 0.0, 0.8, b - 0.015, b + 0.015, '#9aa0a4')
    m.cbox(sx0, sx0 + 0.5, 0.8, 0.83, -0.25, 0.25, '#c9ced2', 0.95)
    m.cbox(sx0 + 0.08, sx0 + 0.24, 0.83, 0.93, -0.08, 0.08, '#2b2b2b'); m.cbox(sx0 + 0.1, sx0 + 0.22, 0.93, 1.15, -0.06, 0.06, '#e8eef0', 0.9); m.cbox(sx0 + 0.11, sx0 + 0.21, 0.93, 1.02, -0.05, 0.05, '#f0a060')   # 果汁機（杯子裡半杯木瓜牛奶）
    for k in range(4): m.cbox(sx0 + 0.3, sx0 + 0.4, 0.83 + k * 0.02, 0.84 + k * 0.02, -0.16, -0.06, '#f4f4f1')   # 疊起來的塑膠杯
    m.cbox(-1.45, -1.3, 0.85, 1.25, -0.08, 0.08, '#e88aa8')                                              # 左邊掛著的一捲粉紅塑膠袋（掛在鐵架上）
    m.cbox(-1.32, -1.28, 0.7, 1.32, -0.02, 0.02, '#4a4c4e')
    m.cbox(-1.05, -0.75, 0.72, 0.8, 0.28, 0.4, '#c0392b'); m.cbox(-1.02, -0.78, 0.8, 0.81, 0.29, 0.39, '#d9dcde')   # 前層左邊的小磅秤（紅色、秤盤）
    parts = [m.finish(None, uv=False)]
    by = {}
    for (x, y, z, c, r) in fr: by.setdefault((c, r), []).append((x, y, z))
    for (c, r), lst in by.items():
        f = Mesh('fruit', flat('wz_sf_fruit_' + c[1:], c, rough=0.45))
        for (x, y, z) in lst: f.sphere((x, y, z), r, seg=7, rings=4)
        parts.append(f.finish(None, smooth=True))
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
PROTO = {'stool_r': P_STOOL_R, 'stool_b': P_STOOL_B, 'bins': p_bins(), 'boxes': p_boxes(), 'umb': p_umbrella(), 'vend': p_vend(),
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
    if door != 'open':
        xf.box(f_, -iw / 2, iw / 2, ih + 0.1, ih + 0.18, gz - 0.06, gz + 0.06); xf.box(f_, -iw / 2, iw / 2, 0.08, 0.16, gz - 0.06, gz + 0.06)
        xf.quad(acc(M['glass']), [(-iw / 2, 0.16, gz + 0.01), (iw / 2, 0.16, gz + 0.01), (iw / 2, ih + 0.1, gz + 0.01), (-iw / 2, ih + 0.1, gz + 0.01)])
    dw = sf.get('door_w', 1.8); dx = sf.get('door_x', 0.0)
    if door == 'alu':
        a = acc(SK['alu2'])
        for x in (-iw / 2, dx - dw / 2, dx, dx + dw / 2, iw / 2): xf.box(a, x - 0.04, x + 0.04, 0.085, ih + 0.175, gz - 0.05, gz + 0.05)   # 直框的兩端藏在上下橫框裡（BUG-WZFLICKER-2：原本頂面、底面和橫框同一個平面）
        for x in (dx - 0.12, dx + 0.08): xf.box(a, x, x + 0.03, 0.9, 1.45, gz + 0.05, gz + 0.1)                    # 長把手
        xf.box(a, -iw / 2, iw / 2, 1.0, 1.04, gz - 0.03, gz + 0.03)                                                   # 腰框
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
            for x0_, x1_ in ((-iw / 2, l0), (l1, iw / 2)):                                                         # 窗：中間一道橫框、每 1.2 m 一根直框
                if x1_ - x0_ < 0.3: continue
                xf.box(w, x0_, x1_, 1.45, 1.5, gz - 0.04, gz + 0.04)
                n_ = max(1, round((x1_ - x0_) / 1.2))
                for j in range(1, n_): x = x0_ + j * (x1_ - x0_) / n_; xf.box(w, x - 0.03, x + 0.03, 0.55, ih + 0.1, gz - 0.04, gz + 0.04)
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


def shopfront_v2(spec, xf, W, gt, wall):
    s = spec['shop']; sf = spec['sf']; R = sf.get('recess', 0.9); gz = -R
    iw = W - 0.6; ih = GH - 0.9; fr = frame_mat(s.get('frame', '#3b2a1e')); top = ih + 0.4
    # 店內景深卡（退到玻璃後 1.2 m）＋店內地板、兩側的牆
    if sf.get('inner'): shallow_interior(spec, xf, iw, gz, ih)                                  # 立體的淺店內（深 2.6 m）
    else:
        face(f'INTERIOR_FACE_{spec["id"]}', M['board'], xf, [(-iw / 2, 0.15, gz - 1.2), (iw / 2, 0.15, gz - 1.2), (iw / 2, ih + 0.15, gz - 1.2), (-iw / 2, ih + 0.15, gz - 1.2)], {'interior': s['type']})
        xf.box(acc(M['gwall']), -iw / 2, iw / 2, 0, 0.15, gz - 1.3, gz)
        for sx in (-1, 1): xf.box(acc(M['plaster']), sx * iw / 2 - 0.03, sx * iw / 2 + 0.03, 0.15, ih + 0.15, gz - 1.2, gz - 0.012)   # 前端退到壁柱後面 1.2 cm（BUG-WZFLICKER-2：端面原本和壁柱正面同一個平面）
    # 門廊：地坪（這家的磁磚）＋門檻、兩側壁柱（外牆材質）、天花板、門楣（招牌底下那一段牆）
    xf.box(acc(SK[sf['floor']]), -W / 2 + 0.28, W / 2 - 0.28, 0.0, 0.03, gz, 0.0)
    st = sf.get('step', 0.0)
    if st > 0: xf.box(acc(SK[sf['floor']]), -iw / 2, iw / 2, 0.0, st, gz, gz + 0.3)
    for sx in (-1, 1): xf.box(wall, sx * (W / 2 - 0.14) - 0.14, sx * (W / 2 - 0.14) + 0.14, 0, GH, gz, 0.0)
    xf.box(acc(M['ceilA']), -W / 2 + 0.28, W / 2 - 0.28, top - 0.04, top, gz, 0.0)
    xf.box(wall, -W / 2, W / 2, top, GH, -0.25, 0.0)
    lm = SK['lamp_cool'] if sf.get('light') == 'cool' else SK['lamp']
    for lx in ([0.0] if W < 7 else [-W / 4, W / 4]):
        q = xf.p(lx, top - 0.06, gz / 2); acc(lm).sphere(q, 0.07, seg=8, rings=4)
        CL.glow(root, 'shoplamp', q[0], q[1] - 0.05, q[2], color='rgba(240,248,255,1)' if sf.get('light') == 'cool' else 'rgba(255,214,150,1)', size=1.3, day=0.0, night=0.9)
    _door_glass(spec, xf, sf, iw, ih, gz, fr, top)
    # 招牌：有使用者核可設計稿的店用貼圖（sign_atlas.py），沒有的照舊由遊戲畫字（SIGN_FACE）
    sw = min(W - 0.4, sf.get('sign_w', 6.5)); key = SIGNMAP.get(spec['id']); sy1t = None
    if key and key + '_h' in SIGN_ATLAS:
        sy1t = hsign(xf, spec['id'], key + '_h', 0.0, sw, GH - 0.45)
        if key + '_v' in SIGN_ATLAS: vsign_tex(xf, spec['id'], key + '_v', W / 2 - 0.5, GH + 0.45)
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
        m = acc(awning_mat(aw_)); ay0, ay1, ad = top, top - 0.4, 0.9
        xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1]); xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)])
        xf.box(m, -aw / 2, aw / 2, ay1 - 0.2, ay1, ad - 0.01, ad + 0.01)
    # 玻璃上的紙條、門邊的牌子
    if sf.get('lantern'):   # WZ-FIVE-1104：紅燈籠（小路參考圖：門右邊掛一顆，上下黑色蓋子、鐵勾掛在門楣）
        lx, ly = sf['lantern']; lz = gz + 0.34
        for k, (yy, rr) in enumerate(((ly - 0.16, 0.15), (ly, 0.2), (ly + 0.16, 0.15))): acc(SK['lamp_red']).sphere(xf.p(lx, yy, lz), rr, seg=12, rings=6)
        for yy in (ly - 0.3, ly + 0.27): xf.cyl(acc(SK['black']), (lx, yy, lz), (lx, yy + 0.05, lz), 0.11, seg=10)
        xf.box(acc(SK['black']), lx - 0.01, lx + 0.01, ly + 0.32, ih + 0.15, lz - 0.01, lz + 0.01)
        q = xf.p(lx, ly, lz + 0.25); CL.glow(root, 'lantern', q[0], q[1], q[2], color='rgba(255,120,80,1)', size=1.1, day=0.0, night=0.8)
    for (cn, x, y, w, h) in sf.get('notes', []): note(xf, cn, x, y, w, h, gz + 0.03)
    if sf.get('board'): cork_board(xf, *sf['board'], gz + 0.03)
    # 門廊雜物（都在 z∈(gz, 0)：建築的導航阻擋範圍內）
    for it in sf.get('clutter', []):
        k, x, z = it[0], it[1], it[2]; zz = gz + z
        if k == 'aboard': aboard(xf, x, zz, it[3] if len(it) > 3 else 'chalk')
        elif k == 'pot': _pm = POT_BROAD if (len(it) > 3 and it[3] == 'broad') else POT_FERN[int(abs(x * 7)) % 2]; _w = _wp(xf, x, zz); B.instance(_pm, f'skpot_{spec["id"]}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], x * 1.7)
        else: inst(PROTO[k], f'sk_{k}_{spec["id"]}', xf, x, 0.0, zz)
    # 設備：一樓冷氣（門楣旁）、電錶箱、排油煙管
    if sf.get('ac'): ax = sf['ac']; inst(AC, f'skac_{spec["id"]}', xf, ax, GH - 0.95, 0.0)
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
        if k == 'pot': _pm = POT_BROAD if (len(it) > 3 and it[3] == 'broad') else POT_FERN[int(abs(x * 7)) % 2]; _w = _wp(xf, x, zz); B.instance(_pm, f'skpot_{spec["id"]}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], x * 1.7)
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
_XSA = {'xinsheng': 'xs_fronts_atlas', 'wenzhou': 'wz_fronts_atlas', 'gongguan': 'gg_fronts_atlas'}.get(SET)   # 溫州街（日常失速，WZ-OFFBEAT-1104）用自己的小圖集：兩條街不同 GLB，各帶各的
XS_ATLAS = _json.load(open(os.path.join(GEN, _XSA + '.json'), encoding='utf-8')) if (_XSA and os.path.exists(os.path.join(GEN, _XSA + '.json'))) else {}
XS_MAT = _img_mat('wz_xs_fronts', _XSA + '.jpg', rough=0.55, emit=0.85) if XS_ATLAS else None   # 店裡、二樓窗後面、燈箱：自發光（參考圖裡店都是亮的；在騎樓的陰影裡只靠反光會變成一片暗）
XS_MAT_M = _img_mat('wz_xs_fronts_matte', _XSA + '.jpg', rough=0.75, emit=0.1) if XS_ATLAS else None   # 外牆上的字、招牌板、海報櫃：不發光
XS_LIT = ('_int', '_up', '_side', 'nanyang_sign', 'dakou_sign', 'dakou_v', 'xsports_v', '_door', '_take', '_shop', 'ggcvs_sign', 'ggcvs_vend', '_kitchen', '_win', 'ggyy_sign')
_XSQ = []   # 先收起來，最後一次做成兩個網格（同材質合併）


def xs_quad(key, pts, flip=False, tiles=1):
    """把圖集裡的 key 貼在 pts（左下、右下、右上、左上，本地座標已經換成世界座標）；tiles＞1：橫向重複 n 次（太寬的店面不拉長）"""
    if key not in XS_ATLAS: return
    u0, v0, u1, v1 = XS_ATLAS[key][:4]
    a, b, c, d = pts
    for i in range(tiles):
        t0, t1 = i / tiles, (i + 1) / tiles
        lerp = lambda p, q, t: tuple(p[k] + (q[k] - p[k]) * t for k in range(3))
        _XSQ.append(([lerp(a, b, t0), lerp(a, b, t1), lerp(d, c, t1), lerp(d, c, t0)], (u1, v0, u0, v1) if flip else (u0, v0, u1, v1), any(t in key for t in XS_LIT)))


def xs_finish():
    if not _XSQ or XS_MAT is None: return
    for lit, mat, nm in ((True, XS_MAT, 'xs_fronts_lit'), (False, XS_MAT_M, 'xs_fronts')):
        qs = [q for q in _XSQ if q[2] == lit]
        if not qs: continue
        bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
        for pts, (u0, v0, u1, v1), _ in qs:
            f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
            for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
        me = bpy.data.meshes.new(nm); bm.to_mesh(me); bm.free(); me.materials.append(mat)
        ob = bpy.data.objects.new(nm, me); B.scene().collection.objects.link(ob); ob.parent = root


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
    if c.get('int'):
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
    fr = acc(SK['black']); wm = wall
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
    sd = c.get('side')
    if sd: xs_side_window(spec, xf, W, c, sd)
    for it in c.get('clutter', []):
        if it[0] == 'aboard': aboard(xf, it[1], it[2], it[3] if len(it) > 3 else 'chalk')
        elif it[0] == 'bistro': bistro_table(xf, it[1], it[2])
    if c.get('lit', True):
        CL.glow(root, 'offbeat_in', *xf.p((gx0 + gx1) / 2, 1.6, z - 0.4), color='rgba(255,232,190,1)', size=4.0, day=0.0, night=0.55)


def xs_side_window(spec, xf, W, c, sd):
    """側面（本地 x＝+W/2 那一面）的落地窗：玻璃退 dep、後面 0.8 m 是店內的景深卡（從街上渲染 AA 的室內 GLB），一樓牆體在 wz_street.apartment 挖開"""
    z0, z1, y1, dep, D = sd['z0'], sd['z1'], sd.get('glass_h', 3.1), sd.get('dep', 0.3), 0.8
    xg = W / 2 - dep; xc = xg - D; fr = acc(SK['black']); cream = acc(frame_mat('#e8e2d6'))
    if sd.get('int') in XS_ATLAS:
        u0, v0, u1, v1 = XS_ATLAS[sd['int']][:4]
        _XSQ.append(([xf.p(xc, 0.12, z1), xf.p(xc, 0.12, z0), xf.p(xc, y1, z0), xf.p(xc, y1, z1)], (u0, v0, u1, v1), True))
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
    c = spec['xs']; wl = acc(gg_plaster(c.get('wallc', '#e9dfcc'))); fr = acc(SK['alu2'] if c.get('frame') == 'alu' else frame_mat(c['frame'] if str(c.get('frame', '')).startswith('#') else GG_WOOD)); cream = acc(frame_mat('#e8e2d6'))
    X0, X1 = -W / 2 + 0.3, W / 2 - 0.3
    opens = [(cd[1], cd[2], cd[3], cd[4]) for cd in c.get('cards', [])]
    dr = c.get('door')
    if dr: opens.append((dr['x0'], dr['x1'], 0.0, dr['y1']))
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
        if tr: xf.box(fr, x0, x1, tr - 0.025, tr + 0.025, gz - 0.03, gz + 0.04)
        if c.get('lit', True): CL.glow(root, 'gg_xs_in', *xf.p((x0 + x1) / 2, (y0 + y1) / 2, zc + 0.3), color='rgba(255,236,200,1)', size=min(3.5, x1 - x0), day=0.0, night=0.5)
    # 門
    if dr:
        x0, x1, y1, st = dr['x0'], dr['x1'], dr['y1'], dr.get('style', 'wood'); _df = dr.get('frame', c.get('frame')); dfr = acc(SK['alu2'] if _df == 'alu' else frame_mat(_df if str(_df or '').startswith('#') else GG_WOOD))
        if st == 'open':   # 整面拉開（慢輪單車）：門裡面的店（景深卡在 1.4 m）＋地板＋兩側內牆、兩扇門片往裡打開貼在兩側
            zc = gz - dr.get('d', 1.4); _xq(xf, dr['key'], x0, x1, 0.0, y1, zc, tiles=1)
            xf.box(acc(SK['f_concrete'] if 'f_concrete' in SK else SK['f_terrazzo']), x0, x1, -0.02, 0.02, zc, gz)
            for xx in (x0, x1): xf.box(cream, xx - 0.03, xx + 0.03, 0.0, y1, zc, gz)
            xf.box(cream, x0, x1, y1, y1 + 0.05, zc, gz)
            lw = (x1 - x0) / 2
            for xx, sg in ((x0 + 0.06, 1), (x1 - 0.06, -1)):
                xf.box(dfr, xx - 0.03, xx + 0.03, 0.0, y1 - 0.05, gz - lw, gz); xf.quad(acc(M['glass']), [(xx + 0.031 * sg, 0.9, gz - lw + 0.08), (xx + 0.031 * sg, 0.9, gz - 0.08), (xx + 0.031 * sg, y1 - 0.2, gz - 0.08), (xx + 0.031 * sg, y1 - 0.2, gz - lw + 0.08)])
            CL.glow(root, 'gg_xs_in', *xf.p((x0 + x1) / 2, 1.6, zc + 0.4), color='rgba(255,236,200,1)', size=2.4, day=0.0, night=0.6)
        else:
            if dr.get('key'):
                zc = gz - dr.get('d', 0.6); _xq(xf, dr['key'], x0, x1, 0.0, y1, zc, tiles=1); xf.box(acc(SK['f_terrazzo']), x0, x1, -0.02, 0.0, zc, gz)
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
    if w.get('blank'): xf.box(acc(frame_mat(spec.get('color', '#d9cbb0'))), x0, x1, y0 - 0.01, y1 + 0.01, -0.25, -0.005); return   # 這一段不開窗（牆補起來）
    if w.get('solid'):
        xf.box(acc(M['gwall']), x0, x1, y0, y1, -0.25, -0.01); _xq(xf, w['tex'], x0, x1, y0, y1, 0.004, tiles=1); return
    fr = acc(frame_mat(w.get('frame', '#2a2a28')))
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
            'f_terrazzo': ('#b3a99b', 0.6, 'tile'), 'f_concrete': ('#9c9891', 1.2, 'tile'), 'f_quarry': ('#a8634b', 0.3, 'tile'), 'f_floral': ('#b8ac96', 0.3, 'tile')}


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


def shallow_interior(spec, xf, iw, gz, ih, bright=0.62):
    """玻璃後面的店（深 DI）：地板、牆、天花板、燈，加上每一種店自己的東西。
    bright：店內（unlit）的整體亮度（遊戲的曝光 ×1.3 也會乘上去）。曬得到太陽的街（溫州街、118 巷）0.62——第一次 1.0、第二次 0.76，從大太陽的巷子看進去白牆都比外面亮、像在發光；公館騎樓底下 0.85"""
    kind = spec['shop']['type']; pid = spec['id']; y0 = 0.15; yt = ih + 0.15; zb = gz - DI; cm = L.CMesh(f'sk_in_{pid}', IN_VC)   # 2026-10-23：店內不受場景光（unlit），亮度＝頂點色
    cp = lambda col: _CP(cm, col)
    rr = random.Random(sum(ord(c) for c in pid) * 31)
    # 地板：木頭類一律淺色 f_wood（使用者 10-23：不要深色木地板；原本定食 wood_dk、書店／早午餐 wood_lt #a07850）
    flo = {'noodle': 'f_mosaic', 'cvs': 'f_white', 'print': 'f_granite', 'laundry': 'f_terrazzo', 'teishoku': 'f_wood', 'books': 'f_wood', 'fruit': 'f_concrete', 'brunch': 'f_wood', 'buffet': 'f_white', 'tea': 'f_white', 'luwei': 'f_concrete', 'pharm': 'f_white', 'records': 'f_terrazzo', 'stationery': 'f_wood'}.get(kind, 'f_white')
    gzf = gz - 0.012                                                                                        # 店內的前緣在玻璃後面 1.2 cm（BUG-WZFLICKER-2：地板、側牆、天花板的前面原本和玻璃同一個平面）
    _floor_vc(cm, xf, iw, zb, gzf, y0, flo, rr)
    wallc = {'noodle': '#ecdcc4', 'cvs': '#f4f4f0', 'print': '#eef0ee', 'laundry': '#dceaf0', 'teishoku': '#e2d2b4', 'books': '#e0d2b8', 'fruit': '#efe8d8', 'brunch': '#e9dcc4', 'buffet': '#efe6d6', 'tea': '#f4f2ec', 'luwei': '#eadcc6', 'pharm': '#f4f6f2', 'records': '#dccbb0', 'stationery': '#ece2d0'}.get(kind, '#eeeeea')
    vb = lambda *a, **k: xf_vbox(cm, xf, *a, **k)
    vb(-iw / 2, iw / 2, y0, yt, zb - 0.05, zb, wallc, r=0)
    for sx in (-1, 1): vb(sx * iw / 2 - 0.047, sx * iw / 2 + 0.047, y0, yt, zb, gzf, wallc, r=0)   # 側牆厚 9.4 cm（BUG-WZFLICKER-2：內面原本和店面鋁框的側面同一個平面）
    vb(-iw / 2, iw / 2, yt, yt + 0.05, zb, gzf, '#d8d2c6', r=0)                                          # 天花板（2026-10-23 改頂點色：和牆一起照深度變暗）
    warm = kind in ('teishoku', 'books', 'brunch', 'fruit', 'noodle', 'buffet', 'records', 'stationery', 'luwei')
    for lx in ([-iw / 4, iw / 4] if iw > 5 else [0.0]):
        xf.box(acc(M['tube']), lx - 0.5, lx + 0.5, yt - 0.03, yt, zb + DI * 0.45 - 0.05, zb + DI * 0.45 + 0.05)
        CL.glow(root, 'shopin', *xf.p(lx, yt - 0.3, zb + DI * 0.5), color='rgba(255,226,180,1)' if warm else 'rgba(244,250,255,1)', size=1.7, day=0.0, night=0.85)   # 白天 0（2026-10-23：店內 unlit 本身就亮；白天有光暈，整個光暈網格白天也要多畫一次）
    if kind == 'noodle':                                                                                    # 麵店：後面的煮麵台、紅紙菜單、兩張桌子
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
    elif kind == 'print':                                                                                   # 影印：兩台影印機、櫃台、價目表
        for x in (-iw / 2 + 0.8, -iw / 2 + 1.8):
            vb(x - 0.35, x + 0.35, y0, y0 + 1.05, zb + 0.1, zb + 0.72, '#e4e4e0', r=0.03); vb(x - 0.33, x + 0.33, y0 + 1.05, y0 + 1.11, zb + 0.13, zb + 0.69, '#4a4e54', r=0.015)
            vb(x + 0.35, x + 0.6, y0 + 0.45, y0 + 0.95, zb + 0.2, zb + 0.62, '#e4e4e0', r=0.02)
        vb(-0.6, iw / 2 - 0.4, y0, y0 + 0.98, gz - 1.3, gz - 0.75, '#5d7286', r=0.015); vb(-0.62, iw / 2 - 0.38, y0 + 0.98, y0 + 1.02, gz - 1.32, gz - 0.73, '#f2f0ea', r=0.01)
        for j in range(4): vb(0.4 + j * 0.02, 0.7 + j * 0.02, y0 + 1.02 + j * 0.012, y0 + 1.032 + j * 0.012, gz - 1.2, gz - 0.9, '#f8f8f4', r=0)
        uvq(f'sk_in_price_{pid}', in_mat('price'), xf, [(0.6, 1.5, zb + 0.01), (2.1, 1.5, zb + 0.01), (2.1, 2.27, zb + 0.01), (0.6, 2.27, zb + 0.01)], (0, 0, 1, 1))
        for j in range(3): vb(iw / 2 - 1.6 + j * 0.36, iw / 2 - 1.3 + j * 0.36, y0, y0 + 0.27 * (1 + j % 2), zb + 0.1, zb + 0.5, '#b08a5c', r=0.01)
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
        _tea(xf, iw, gzf, zb, cm, pid)
    _shade_interior(cm, xf, iw, gz, yt, bright, warm)
    cm.finish(root, uv=False)


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
            hsign(px, pid, key + '_h', 0.0, sw, GH - 0.3)
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
        cm = _cm(f'sk_{pid}_vc')
        if part['kind'] == 'tea': _tea(px, w, zf, zb, cm, pid)
        else: _ice(px, w, zf, zb, cm, pid, yo)
        cm.finish(root, uv=False)
        for (cn, x, y, ww, hh) in part.get('notes', []): note(px, cn, x, y, ww, hh, zf + 0.09)
        for it in part.get('clutter', []):
            k, x, z = it[0], it[1], it[2]
            if k == 'aboard': aboard(px, x, zf + z, it[3] if len(it) > 3 else 'chalk')
            elif k == 'pot': _pm = POT_BROAD if (len(it) > 3 and it[3] == 'broad') else POT_FERN[int(abs(x * 7)) % 2]; _w = _wp(px, x, zf + z); B.instance(_pm, f'skpot_{pid}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], x * 1.7)
            else: inst(PROTO[k], f'sk_{k}_{pid}', px, x, 0.0, zf + z)


def _tea(px, w, zf, zb, cm, pid):
    """手搖飲：臨騎樓的點餐櫃台（白色＋綠色腰帶、不鏽鋼檯面）、收銀機、杯子、封口機；後面的工作檯（茶桶、搖茶機、冰桶）、
    牆上的層架（杯子、茶葉罐）；菜單燈箱掛在櫃台上方，後牆再一個"""
    c0, c1 = -w / 2 + 0.35, w / 2 - 1.25                                                             # 櫃台（右邊留員工進出的門）
    vbox(cm, px, c0, c1, 0.06, 0.98, zf - 0.62, zf - 0.04, '#eeebe3'); vbox(cm, px, c0, c1, 0.06, 0.14, zf - 0.6, zf - 0.03, '#3a3a3a')
    vbox(cm, px, c0, c1, 0.72, 0.84, zf - 0.035, zf - 0.03, '#7a9a5a')
    px.box(acc(SK['steel']), c0 - 0.03, c1 + 0.03, 0.98, 1.03, zf - 0.66, zf)
    vbox(cm, px, c0 + 0.3, c0 + 0.62, 1.03, 1.1, zf - 0.45, zf - 0.2, '#2c2c2e'); vbox(cm, px, c0 + 0.34, c0 + 0.58, 1.1, 1.3, zf - 0.42, zf - 0.38, '#1e2a36')  # 收銀機
    for k in range(3):                                                                               # 杯子（疊起來的透明杯）
        cx = c0 + 1.1 + k * 0.14; px.cyl(acc(M['glass']), (cx, 1.03, zf - 0.3), (cx, 1.38, zf - 0.3), 0.045, seg=10)
    x_ = c1 - 0.6; vbox(cm, px, x_, x_ + 0.36, 1.03, 1.42, zf - 0.55, zf - 0.15, '#f2f2ee'); vbox(cm, px, x_ + 0.04, x_ + 0.32, 1.22, 1.3, zf - 0.17, zf - 0.13, '#30343a')   # 封口機
    vbox(cm, px, c1 - 1.6, c1 - 1.1, 1.03, 1.06, zf - 0.4, zf - 0.1, '#d84a3a')                       # 取餐的紅色托盤
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


def _ice(px, w, zf, zb, cm, pid, yo):
    """冰菓室：整面拉開（摺門收兩側）、前面的配料冰櫃（不鏽鋼方盒裝紅豆、綠豆、芋頭、粉圓…，斜玻璃擋板）、剉冰機、
    三張小圓桌＋塑膠凳、木板牆腰＋一排長條木牌菜單、吊扇；冬天（SEASON_ICECLOSED_on）拉下鐵捲門、貼「五月見」（AA_364 第 3 節）"""
    for sx in (-1, 1):                                                                               # 摺門收在兩側
        for k in range(4):
            x = sx * (w / 2 - 0.32 - k * 0.07); px.box(acc(SK['alu2']), x - 0.025, x + 0.025, 0.06, yo - 0.3, zf - 0.22 + (k % 2) * 0.1, zf + 0.02)
    px.box(acc(SK['wood_lt']), -w / 2 + 0.24, w / 2 - 0.24, 0.0, 1.1, zb - 0.05, zb)                 # 後牆：木板牆腰
    px.box(acc(M['plaster']), -w / 2 + 0.24, w / 2 - 0.24, 1.1, 2.95, zb - 0.05, zb)
    mw, mh = 4.2, 1.31; mx0 = -mw / 2 + 0.3
    uvquad(f'sk_menu_{pid}', SK['menu_ice'], [px.p(mx0, 1.45, zb + 0.02), px.p(mx0 + mw, 1.45, zb + 0.02), px.p(mx0 + mw, 1.45 + mh, zb + 0.02), px.p(mx0, 1.45 + mh, zb + 0.02)])
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
        if sf.get('inner'): shallow_interior(dict(spec, shop=dict(s, type=kind)), xf, iw, gz, ih, bright=0.85)   # 騎樓底下（只有環境光）：店裡要比騎樓亮
        else:                                                                                         # 店內景深卡（遊戲畫 TK.interiorTex(店種)，亮的）：立體的淺店內在 3 m 深的騎樓後面白天太暗（試做：書店一片黑）
            face(f'INTERIOR_FACE_{spec["id"]}', M['board'], xf, [(-iw / 2, 0.15, gz - 1.2), (iw / 2, 0.15, gz - 1.2), (iw / 2, ih + 0.15, gz - 1.2), (-iw / 2, ih + 0.15, gz - 1.2)], {'interior': s['type']})
            xf.box(acc(M['gwall']), -iw / 2, iw / 2, 0, 0.15, gz - 1.3, gz)
            for sx in (-1, 1): xf.box(acc(M['ceilA']), sx * iw / 2 - 0.03, sx * iw / 2 + 0.03, 0.15, ih + 0.15, gz - 1.2, gz - 0.012)   # 前端退到壁柱後面 1.2 cm（BUG-WZFLICKER-2）
        _door_glass(spec, xf, sf, iw, ih, gz, fr, top)
        xf.box(wall, -W / 2, W / 2, ih + 0.18, ceil_y, gz - 0.15, gz)                                # 店門上方到騎樓天花板的牆
    for sx in (-1, 1): xf.box(wall, sx * (W / 2 - 0.15) - 0.15, sx * (W / 2 - 0.15) + 0.15, 0.0, ceil_y, gz - (0.9 if XSM else (DI if (sf.get('inner') or kind == 'tea') else 1.3)) - 0.1, gz)   # 店與店之間的壁柱（這一棟的外牆）
    # 騎樓：天花板、這一棟的地磚、柱子（包外牆）、日光燈（晚上亮）
    xf.box(acc(M['ceilA']), -W / 2, W / 2, ceil_y, GH - 0.12, -dep, 0.0)
    xf.box(acc(SK[sf['floor']]), -W / 2, W / 2, 0.0, 0.05, -dep, 0.0)
    pm = Mesh(f'pillar_{spec["id"]}', pillar_mat(spec['wall']))   # 柱子：外牆的樣子，但自己一個材質 wz_pillar_<牆>——遊戲照材質名加「樹幹透視」（擋住玩家時網點透空；10-20 gongguan_glb_integration 查到 10-18 包外牆以後沒了）
    for sx in spec.get('pillars', (-W / 2 + 0.3, W / 2 - 0.3)):
        xf.box(pm, sx - 0.275, sx + 0.275, 0.05, ceil_y, -0.575, -0.025)
        xf.box(acc(SK['f_granite']), sx - 0.29, sx + 0.29, 0.05, 0.45, -0.59, -0.01)                  # 柱腳的石材護角
    if not pm.empty(): set_tint(pm.finish(root), spec['color'], spec['wall'])
    nl = max(1, round(W / 2.5))
    for k in range(nl):
        tx = -W / 2 + (k + 0.5) * W / nl; xf.box(acc(M['tube']), tx - 0.6, tx + 0.6, ceil_y - 0.03, ceil_y, -dep * 0.55 - 0.05, -dep * 0.55 + 0.05)
        CL.glow(root, 'arcadelamp', *xf.p(tx, ceil_y - 0.2, -dep * 0.55), color='rgba(244,248,255,1)', size=1.5, day=0.0, night=0.7)
    # 招牌（設計稿；和原本的 shopfront 同一套）
    sw = min(W - 0.4, 6.5); sy0, sy1 = GH - 0.67, GH - 0.03
    if XSM:   # 公館四間新店：騎樓外的招牌也是參考圖裁的字（同一塊招牌，貼在騎樓樑上給馬路看）
        key = XSM['street']; h_ = sy1 - sy0; w_ = min(sw, h_ * XS_ATLAS.get(key, [0, 0, 1, 1, 4])[4]); cx_ = XSM.get('street_x', 0.0)
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
    if s.get('vatlas') and s['vatlas'] in SIGN_ATLAS: vsign_tex(xf, spec['id'], s['vatlas'], W / 2 - 0.5, GH + 0.3, vw=0.74)
    elif s.get('vertical'):
        vsign(xf, spec['id'], W / 2 - 0.5, GH + 0.3, GH + 2.9, {'vertical': s['vertical'], 'vBg': s.get('vBg', '#ffffff'), 'vColor': s.get('vColor', '#b0332a'), 'vBand': s.get('vBand', '#b0332a'), 'serif': 1 if s.get('serif') else 0})
    for (cn, x, y, w, h) in ([] if XSM else sf.get('notes', [])): note(xf, cn, x, y, w, h, gz + (0.32 if kind == 'tea' else 0.03))
    # 騎樓裡貼著店面玻璃的雜物（ART-WZ0 第三批，LAWWW2 10-21；7b-2 第 1 條：騎樓兩樣東西）：玻璃前 0.7 m 內、避開店門和店門口的互動點；
    # 人走的地方：zones3d.js 的 gongguan 照 gongguan_shops.props.json 的腳印擋住那幾格（tests/street_props_nav_unit.js），騎樓照樣整排走得通
    for it in ([] if XSM else sf.get('clutter', [])):   # 公館四間新店：門口的東西照參考圖（gg_front 的 props）
        k, x, zc = it[0], it[1], it[2]; zz = gz + zc
        if k == 'aboard': aboard(xf, x, zz, it[3] if len(it) > 3 else 'chalk')
        elif k == 'outlet': inst(PROTO['outlet' + ('_z' if len(it) > 4 and it[4] == 'z' else '')], f'sk_outlet_{spec["id"]}', xf, x, it[3] if len(it) > 3 else 0.35, zz)   # 柱子、牆上離地的東西（inst 只替地上的東西登記腳印：不擋路）
        elif k == 'pot': _pm = POT_BROAD if (len(it) > 3 and it[3] == 'broad') else POT_FERN[int(abs(x * 7)) % 2]; _w = _wp(xf, x, zz); B.instance(_pm, f'skpot_{spec["id"]}_{len(_inst)}', *_w, root, ry=x * 1.7); _inst.append(1); prop_fp(_pm, 'skpot', _w[0], _w[2], x * 1.7)
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
    'A1': dict(inner=True, door='alu', sign='lightbox', awning='metal', floor='f_granite', step=0.06, light='cool', ac=2.6, meter=-3.5,
               notes=[('copyprice', -2.6, 0.9, 0.62, 0.62), ('copyprice2', -1.9, 0.9, 0.62, 0.62), ('nobook', 1.6, 1.3, 0.5, 0.5), ('pay', 2.3, 1.45, 0.34, 0.34)],
               clutter=[('vend', -3.0, 0.42), ('boxes', 2.9, 0.35)]),
    'A3': dict(inner=True, door='wood', sign='wood', awning='stripe_green', floor='f_quarry', step=0.1, door_x=1.4,
               notes=[('hours', -1.2, 1.2, 0.36, 0.36), ('poster', 3.6, 1.0, 0.5, 0.6)],
               clutter=[('bookcart', -3.4, 0.35), ('aboard', 3.9, 0.45, 'menu'), ('pot', -4.9, 0.3, 'broad'), ('pot', 5.0, 0.3)]),
    'A4': dict(inner=True, door='open', sign='panel', awning='#2f5a47', floor='f_mosaic', light='warm', ac=-2.7, duct=3.4,   # WZ-FIVE-1104 林家（參考圖 wz_lin_ext）：深綠雨遮、門邊參考圖裁的價目牌、兩盆大盆栽
               notes=[('wz_lin_menu', 2.4, 1.05, 0.62, 0.97)],
               clutter=[('noodle', -1.6, 0.42), ('stool_r', 0.6, 0.55), ('stool_b', 1.1, 0.4), ('pot', 3.3, 0.35, 'broad'), ('pot', -3.45, 0.35, 'broad')]),
    'A5': dict(inner=True, door='auto', sign='lightbox', awning=None, floor='f_white', light='cool', door_x=-1.4, rollbox=False,
               notes=[('hours2', 0.6, 1.25, 0.42, 0.42), ('pay', 1.2, 1.3, 0.34, 0.34), ('hiring', 2.6, 1.1, 0.42, 0.46)],
               clutter=[('bins', 2.6, 0.32), ('umb', 0.3, 0.3), ('fridge', 3.3, 0.36)]),
    'B2': dict(inner=True, door='alu', sign='panel', awning='#3a6f8c', floor='f_terrazzo', light='cool', door_w=1.0, door_x=-1.6, meter=2.6,
               notes=[('hours2', -0.6, 1.2, 0.4, 0.4)], board=(1.35, 1.0, 0.9, 0.7),   # AA_413（10-23）：門右邊的布告欄（尋貓的紙條搬到布告欄上；「看布告欄」在世界 x −16.4）
               clutter=[('bench', 0.9, 0.35), ('vend', 2.3, 0.42), ('pot', -2.6, 0.3)]),   # ART-WZ0 第二批（10-21）：洗衣粉販賣機、門邊盆栽（準則 7b-2 第 1 條：騎樓兩樣東西）
    'B3': dict(inner=True, door='lattice', sign='wood', awning='#3a2a1f', floor='f_floral', step=0.12, noren='wz_komichi_noren', lantern=(-0.75, 2.05), light='warm', door_x=-2.0, door_w=1.8, ac=4.8,   # WZ-FIVE-1104 小路（參考圖 wz_komichi_ext）：深色木雨遮、參考圖的暖簾、黑板立牌
               notes=[],
               clutter=[('aboard', 0.2, 0.45, 'wz_komichi_menu'), ('pot', -5.8, 0.3, 'broad'), ('pot', 2.6, 0.32, 'broad'), ('pot', 5.4, 0.32)]),
    'B5': dict(split=[dict(id='B5', kind='tea', x0=-7.0, x1=0.0, floor='f_white', shop=dict(name='巷口茶飲', sub='手搖飲・現煮珍珠', signBg='#f4ead8', signColor='#5c3a21', band='#7a9a5a'),
                           notes=[('pay', -2.9, 0.62, 0.26, 0.26), ('hiring', 2.75, 1.1, 0.4, 0.44)], clutter=[('bins', 3.0, 0.4)]),
                      dict(id='B5i', kind='ice', x0=0.0, x1=7.0, floor='f_terrazzo', shop=dict(name='夏日冰菓室', sub='剉冰・古早味', signBg='#f7efe0', signColor='#b0322a', band='#2f7a8a', serif=True),
                           notes=[('hours', 2.95, 1.3, 0.34, 0.34)], clutter=[('aboard', 3.0, 0.5, 'menu')])]),
    'B7': dict(inner=True, door='wood', sign='wood', awning='stripe_green', floor='f_terrazzo', step=0.08, light='warm', door_x=-2.0, door_w=1.0, ac=3.2, frame='#3f5a3c', grid=0.55,   # WZ-FIVE-1104 SUNNY SIDE（原本的半熟；參考圖 wz_sunnyside_ext）：綠白條紋雨遮、參考圖的黑板立牌、門口盆栽
               notes=[('hours', -1.0, 1.25, 0.34, 0.34)],
               clutter=[('aboard', 0.6, 0.5, 'wz_sunnyside_board'), ('pot', -3.4, 0.35, 'broad'), ('pot', 3.3, 0.35, 'broad'), ('pot', 1.5, 0.32)]),
    'B6': dict(inner=True, door='open', sign='panel', awning='stripe_orange', floor='f_concrete', light='warm', ac=-3.7,
               notes=[('pay', 3.5, 1.6, 0.32, 0.32)],
               clutter=[('fruitstall', -0.1, 0.5), ('boxes', 3.4, 0.35), ('stool_b', 2.4, 0.45)]),   # AA_413（10-23）：門廊前緣的攤子（原本是 x −1.2 的三層木架 crates）；老闆站在攤子後面＝世界 (34.9, −6.15)
}
# 住家、空店面
# 118 巷九間店（ART-L118-FACADE-3D-1023，使用者 10-23：「118店面裡面做了 但外觀還是很2D」）：原本是舊的 shopfront（玻璃後面一張平面景深卡）→ 店面組件＋立體淺店內。
# 鍵＝lane118_layout.js 的店 id；kind＝淺店內的店型（覆蓋 wz_street.py _TYPE 的分類）；門在店面正中間（遊戲的進店互動點在 (facade±0.9, 店的中心 z)）
SF_L118 = {
    'dian': dict(kind='teishoku', inner=True, door='wood', sign='wood', awning='stripe_green', floor='f_quarry', step=0.08, light='warm', door_w=1.2, ac=-2.2,
                 notes=[('menu', 1.4, 1.0, 0.58, 0.62), ('hours', -1.2, 1.25, 0.34, 0.34)], clutter=[('aboard', 2.2, 0.45, 'menu'), ('pot', -2.6, 0.3, 'broad')]),
    'self': dict(kind='buffet', inner=True, door='open', sign='lightbox', awning='#b8352c', floor='f_white', light='cool', meter=3.0,
                 notes=[('menu', -2.6, 1.2, 0.6, 0.66)], clutter=[('bins', 2.8, 0.35), ('stool_r', -2.9, 0.5), ('umb', 2.3, 0.3)]),
    'tea': dict(kind='tea', inner=True, door='open', sign='lightbox', awning=None, floor='f_white', light='cool', sign_w=2.5,
                notes=[('pay', 0.8, 1.15, 0.26, 0.26)], clutter=[('aboard', -0.9, 0.5, 'menu')]),
    'home': dict(kind='noodle', inner=True, door='alu', sign='panel', awning='#3b5a8c', floor='f_mosaic', light='warm', door_w=1.2, duct=3.3,
                 notes=[('menu', 1.6, 1.2, 0.6, 0.66), ('hiring', -1.6, 1.1, 0.4, 0.44)], clutter=[('stool_r', -2.9, 0.45), ('stool_b', -2.4, 0.4), ('bins', 3.2, 0.35)]),
    'cafe2': dict(kind='brunch', in_books=True, inner=True, door='wood', sign='wood', awning=None, floor='f_terrazzo', step=0.08, light='warm', door_w=1.0, ac=2.6,
                  notes=[('hours', -0.9, 1.25, 0.34, 0.34), ('pay', 0.9, 1.3, 0.26, 0.26)], clutter=[('aboard', -1.9, 0.5, 'chalk'), ('pot', 2.9, 0.35, 'broad'), ('bench', -2.6, 0.45)]),
    'pasta': dict(kind='brunch', inner=True, door='alu', sign='panel', awning='stripe_green', floor='f_floral', light='warm', door_w=1.2, ac=-3.0,
                  notes=[('menu', 1.8, 1.0, 0.58, 0.62)], clutter=[('aboard', -1.8, 0.5, 'menu'), ('pot', 3.2, 0.3), ('pot', -3.3, 0.3, 'broad')]),
    'korea': dict(kind='noodle', inner=True, door='alu', sign='lightbox', awning='#c9463d', floor='f_granite', light='cool', door_w=1.2, duct=-3.0,
                  notes=[('menu', 1.6, 1.2, 0.6, 0.66), ('hours2', -1.4, 1.2, 0.4, 0.4)], clutter=[('bins', 2.9, 0.35), ('umb', -2.5, 0.3)]),
    'omu': dict(kind='brunch', inner=True, door='wood', sign='panel', awning='stripe_orange', floor='f_white', step=0.06, light='warm', door_w=1.0, meter=-3.0,
                notes=[('menu', 1.5, 1.0, 0.58, 0.62), ('hours', -1.0, 1.25, 0.34, 0.34)], clutter=[('aboard', 2.4, 0.5, 'chalk'), ('pot', -2.6, 0.3, 'broad')]),
    'noodle2': dict(kind='noodle', inner=True, door='open', sign='wood', awning='stripe_red', floor='f_mosaic', light='warm', ac=-2.8,
                    notes=[('menu', 2.2, 1.2, 0.6, 0.66)], clutter=[('noodle', -1.9, 0.42), ('stool_r', 1.2, 0.5), ('stool_b', 1.7, 0.4), ('bins', 3.0, 0.35)]),
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
        sf = dict(door='alu', door_w=0.95, door_x=1.05, rollbox=True)
        c.box(acc(SK['f_granite']), -hw + 0.02, hw - 0.02, 0.0, 0.035, gz, 0.0)              # 門口那一段的地（和店裡同一種）
        _door_glass(dict(id='A2C'), c, sf, iw, ih, gz, frame_mat('#3b5a8c'), top)
        for (cn, x, y, w_, h_) in (('copyprice', -1.45, 0.82, 0.56, 0.56), ('copyprice2', -0.8, 0.86, 0.56, 0.56), ('copyprice', -0.15, 0.8, 0.56, 0.56), ('nobook', -1.1, 1.48, 0.42, 0.42),
                                    ('copyprice2', 0.32, 1.42, 0.42, 0.42), ('pay', 1.32, 1.5, 0.26, 0.26), ('copyprice', 0.8, 0.95, 0.4, 0.4), ('hours2', 1.3, 1.05, 0.3, 0.3)):
            note(c, cn, x, y, w_, h_, gz + 0.03)
        hsign(c, 'A2C', 'ade_print_h', 0.0, 2.6, t + 0.06)                               # 招牌：和 A1 同一張設計稿（BB-B signs_approved），掛在門楣上（往上蓋到二樓的牆）
        # 店裡（玻璃後面 1.8 m）：左邊一台大影印機、中間櫃台（電腦螢幕朝裡）、後牆的紙箱架、天花板一支日光燈
        cp = acc(flat('wz_c6_copier', '#dcdcd6', rough=0.4)); dk = acc(flat('wz_c6_dark', '#3a3c40', rough=0.5)); wd = acc(SK['wood_lt']); st = acc(SK['steel'])
        c.box(cp, -1.75, -1.0, 0.0, 1.0, -RD + 0.08, -RD + 0.78); c.box(dk, -1.72, -1.03, 1.0, 1.06, -RD + 0.12, -RD + 0.74); c.box(dk, -1.6, -1.2, 0.62, 0.66, -RD + 0.78, -RD + 0.9)   # 影印機＋上蓋＋出紙盤
        c.box(cp, -1.74, -1.01, 0.12, 0.6, -RD + 0.785, -RD + 0.79)
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
