"""從校園看出去的公館（GG-STREETVIEW-1020，X86；使用者 10-20：「從學校去看公館或者外面的建筑都超級丑的完全沒有那種三d游戲的感覺公館的店面」，附 4 張照片）
→ assets/models/env/second_ai/campus_gongguan_bd.glb（＋.json）。LAWWW2-C 2026-10-20；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/gg_backdrop.py [-- --out assets/models/env/second_ai/campus_gongguan_bd.glb]
取代 src/zones3d.js campusBackdrop 的 TK.bgCity 方盒（LAWWW-C 10-20 17:47 給的範圍）：
  第一排 x＝−189（公館南側 15 棟 z −68～77.6，兩端延長到 z −142、152；往溫州街的轉角公寓 z −88～−74；z −74～−68 是巷子）、第二排 x＝−212 的高樓。
座標就是**校園座標**（x 東、y 上、z 南）：放在 (0,0,0)、不用轉。公館區域的 (gx,gz) → 校園 (x＝−170−gz, z＝gx)。
照片（不進 repo）：羅斯福路四段的商店街——5～14 層高低錯落、整面的直立大看板（粉紅、藍、綠）、二樓一整排橫招牌、凸出牆面的直立燈箱、冷氣、鐵窗、騎樓；
  捷運公館站出口前的「GONGGUAN」字樣和藍色小花；水源市場（藍色大樓、彩色橫條、一樓攤位、旁邊的天橋樓梯）。店名全部虛構（D77），不寫電話。
效能（X79 校園卡頓還在查，背景不能加負擔）：窗、鐵窗、冷氣大部分畫在貼圖上；材質 5 個（立面、店面、招牌、水源市場、頂點色零件），整個模型合併成 5 個網格；
  不投影（castShadow 由遊戲關）；所有材質單面。晚上：立面（窗）、店面、招牌的 emissive 已經接好貼圖，強度由遊戲（TK.addNight）控制。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import gg_textures as TXS   # noqa: E402
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, g2b, bpy, uvquad   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/campus_gongguan_bd.glb')
GEN = TXS.GEN; PI = math.pi
GH, FH = 4.2, 3.1                  # 一樓（騎樓）高、樓層高
X1F, D1 = -189.0, 16.0             # 第一排：立面在 x −189、朝 +x（校園）、往西 16 m
X2F, D2 = -212.0, 18.0             # 第二排（高樓）
ARC = 3.0                          # 騎樓深


def img_emit(name, fn, efn, rough=0.85):
    """底色貼圖＋夜間發光貼圖（glTF emissiveTexture；強度由遊戲控制）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if efn:
        te = N.new('ShaderNodeTexImage'); te.image = bpy.data.images.load(os.path.join(GEN, efn), check_existing=True); nt.links.new(te.outputs['Color'], bs.inputs['Emission Color'])
        bs.inputs['Emission Strength'].default_value = 1.0
    m.use_backface_culling = True; return m


B.reset(texres=1024)
TXS.make_all(); SUV = TXS.SIGN_UV
root = B.group('campus_gongguan_bd', props={'kind': 'campus_backdrop', 'coords': 'campus'})
M = {'fac': img_emit('gg_bd_facade', 'gg_bd_facade.png', 'gg_bd_facade_night.png'), 'shop': img_emit('gg_bd_shopfront', 'gg_bd_shopfront.png', 'gg_bd_shopfront.png', rough=0.4),
     'sign': img_emit('gg_bd_signs', 'gg_bd_signs.png', 'gg_bd_signs.png', rough=0.45), 'mkt': img_emit('gg_bd_market', 'gg_bd_market.png', None, rough=0.7),
     'vc': L.vc_material('gg_bd_props', rough=0.75, cull=True)}
FAC = Mesh('gg_bd_facades', M['fac']); SHOP = Mesh('gg_bd_shops', M['shop']); SIGN = Mesh('gg_bd_signboards', M['sign']); MKT = Mesh('gg_bd_marketface', M['mkt']); VC = CMesh('gg_bd_parts', M['vc'])
rr = random.Random(86)


def cell_uv(k, fu0, fu1, fv0, fv1):
    """立面貼圖第 k 格裡的一塊（fu、fv：0～1，v 從下往上）"""
    u0 = (k % 4) * 0.25; vb = 1 - (k // 4 + 1) * 0.5
    return (u0 + fu0 * 0.25, vb + fv0 * 0.5, u0 + fu1 * 0.25, vb + fv1 * 0.5)


def facade_x(xf, za, zb, y0, y1, k, tw=6.0, th=12.4):
    """朝 +x 的立面（x＝xf），z 由 zb（看的人的左手邊）到 za；貼圖一格 tw × th 公尺重複"""
    z = zb
    while z > za + 1e-6:
        z2 = max(za, z - tw); fu = (z - z2) / tw; y = y0
        while y < y1 - 1e-6:
            y2 = min(y1, y + th); fv = (y2 - y) / th
            uvquad(FAC, [(xf, y, z), (xf, y, z2), (xf, y2, z2), (xf, y2, z)], cell_uv(k, 0, fu, 0, fv)); y = y2
        z = z2


def facade_z(zf, sgn, xa, xb, y0, y1, k=7, tw=6.0, th=12.4):
    """側牆（z＝zf，sgn＝+1 朝 +z、−1 朝 −z）"""
    x = xa
    while x < xb - 1e-6:
        x2 = min(xb, x + tw); fu = (x2 - x) / tw; y = y0
        while y < y1 - 1e-6:
            y2 = min(y1, y + th); fv = (y2 - y) / th
            pts = [(x, y, zf), (x2, y, zf), (x2, y2, zf), (x, y2, zf)] if sgn > 0 else [(x2, y, zf), (x, y, zf), (x, y2, zf), (x2, y2, zf)]
            uvquad(FAC, pts, cell_uv(k, 0, fu, 0, fv)); y = y2
        x = x2


def sign_quad_x(xf, za, zb, y0, y1, key):
    u0, v0, u1, v1 = SUV[key]; uvquad(SIGN, [(xf, y0, zb), (xf, y0, za), (xf, y1, za), (xf, y1, zb)], (u0, v0, u1, v1))


def building(xf, d, za, zb, floors, k, arcade=True, extras=True, row=1):
    """一棟：立面、兩側、屋頂（女兒牆、水塔、屋頂看板）、騎樓、二樓橫招牌、整面大看板、直立燈箱、冷氣"""
    W = zb - za; H = GH + (floors - 1) * FH; xb = xf - d
    g0 = GH if arcade else 0.0
    facade_x(xf, za, zb, g0, H, k)
    facade_z(zb, +1, xb, xf, 0.0, H); facade_z(za, -1, xb, xf, 0.0, H)
    VC.poly([(xb, H, za), (xb, H, zb), (xf, H, zb), (xf, H, za)], '#8e8b86')   # 屋頂（朝上）
    for (a0, a1, b0, b1) in ((xf - 0.25, xf, za, zb), (xb, xb + 0.25, za, zb), (xb, xf, za, za + 0.25), (xb, xf, zb - 0.25, zb)): VC.cbox(a0, a1, H, H + 0.9, b0, b1, '#b8b4ac')   # 女兒牆
    if extras and rr.random() < 0.65:   # 水塔（不鏽鋼，四支腳）
        tz = za + rr.uniform(1.2, max(1.3, W - 1.2)); tx = xf - rr.uniform(3, d - 2)
        for (dx, dz) in ((-0.5, -0.5), (0.5, -0.5), (-0.5, 0.5), (0.5, 0.5)): VC.cbox(tx + dx - 0.05, tx + dx + 0.05, H, H + 0.9, tz + dz - 0.05, tz + dz + 0.05, '#7a7d80')
        VC.cbox(tx - 0.7, tx + 0.7, H + 0.9, H + 2.3, tz - 0.7, tz + 0.7, '#c9ced2')
    if arcade:   # 騎樓：天花板、店面、柱子、樑、地板
        VC.poly([(xf - ARC, GH, za), (xf, GH, za), (xf, GH, zb), (xf - ARC, GH, zb)], '#5c5b58')   # 朝下
        z = zb
        while z > za + 1e-6:
            z2 = max(za, z - 6.0); fu = (z - z2) / 6.0; sc = rr.randrange(8); u0, v0 = (sc % 4) * 0.25, 1 - (sc // 4 + 1) * 0.5
            uvquad(SHOP, [(xf - ARC, 0.0, z), (xf - ARC, 0.0, z2), (xf - ARC, 3.3, z2), (xf - ARC, 3.3, z)], (u0, v0, u0 + fu * 0.25, v0 + 0.5)); z = z2
        VC.poly([(xf - ARC, 3.3, zb), (xf - ARC, 3.3, za), (xf - ARC, GH, za), (xf - ARC, GH, zb)], '#3a3a3a')
        VC.cbox(xf - 0.12, xf + 0.02, GH - 0.45, GH, za, zb, '#c8c2b6')
        for zc in [za + 0.3] + ([za + W / 2] if W > 9 else []): VC.cbox(xf - 0.55, xf - 0.05, 0.0, GH - 0.45, zc - 0.25, zc + 0.25, '#bdb5a6')
        VC.poly([(xf - ARC, 0.02, zb), (xf - ARC, 0.02, za), (xf, 0.02, za), (xf, 0.02, zb)][::-1], '#b9b2a6')
    if not extras: return H
    # 二樓的橫招牌（整排）：寬的店面分兩塊
    n2 = 2 if W > 11 else 1
    for j in range(n2):
        a = za + 0.25 + j * (W - 0.5) / n2; b = za + 0.25 + (j + 1) * (W - 0.5) / n2 - (0.15 if n2 > 1 else 0)
        y0 = GH + 0.12 + rr.uniform(0, 0.2); y1 = y0 + rr.uniform(0.9, 1.2); VC.cbox(xf, xf + 0.22, y0, y1, a, b, '#2b2b2b'); sign_quad_x(xf + 0.225, a, b, y0 + 0.04, y1 - 0.04, 'hs%d' % rr.randrange(8))
    # 整面大看板（3～5 層樓高，貼在立面上）
    if floors >= 5 and rr.random() < 0.95:   # 照片：幾乎每一棟都有，寬的樓兩面
        nb = 2 if (W > 9.5 and rr.random() < 0.65) else 1
        for j in range(nb):
            bw = min(4.5, W * rr.uniform(0.3, 0.45) if nb == 1 else W * 0.36); a = (za + 0.4) if j == 0 else (zb - 0.4 - bw)
            if nb == 1 and rr.random() < 0.5: a = zb - 0.5 - bw
            hb = FH * rr.choice((3, 4, 5, 5, 6)); y0 = GH + FH * 0.5 + rr.uniform(0, FH); y1 = min(H - 0.5, y0 + hb)
            if y1 - y0 < 4: continue
            VC.cbox(xf, xf + 0.12, y0 - 0.08, y1 + 0.08, a - 0.08, a + bw + 0.08, '#3a3d40'); sign_quad_x(xf + 0.125, a, a + bw, y0, y1, 'bb%d' % rr.randrange(8))
    # 二、三樓整面的大招牌（補習班、診所常見：整面蓋住二、三樓的窗）
    if floors >= 5 and rr.random() < 0.3:
        y0 = GH + 1.4; y1 = GH + FH + 2.6; VC.cbox(xf, xf + 0.18, y0 - 0.06, y1 + 0.06, za + 0.2, zb - 0.2, '#2b2b2b')
        sign_quad_x(xf + 0.185, za + 0.25, zb - 0.25, y0, y1, 'hs%d' % rr.randrange(8))
    # 凸出牆面的直立燈箱（兩面）
    for _lb in range(2 if (W > 9 and rr.random() < 0.4) else 1):
        if rr.random() < 0.8:
            zc = ((za + 0.45) if rr.random() < 0.5 else (zb - 0.45)) if _lb == 0 else (za + W / 2); y0 = GH + 1.4 + _lb * 0.6; y1 = min(H - 0.3, y0 + rr.choice((4.0, 5.5, 7.0, 8.5)))
            if y1 - y0 > 2.5:
                key = 'lb%d' % rr.randrange(16); u0, v0, u1, v1 = SUV[key]; x0, x1 = xf + 0.1, xf + 1.0
                VC.cbox(xf, x1 + 0.02, y0 - 0.05, y1 + 0.05, zc - 0.14, zc + 0.14, '#2b2b2b')
                uvquad(SIGN, [(x0, y0, zc + 0.145), (x1, y0, zc + 0.145), (x1, y1, zc + 0.145), (x0, y1, zc + 0.145)], (u0, v0, u1, v1))   # 朝 +z
                uvquad(SIGN, [(x1, y0, zc - 0.145), (x0, y0, zc - 0.145), (x0, y1, zc - 0.145), (x1, y1, zc - 0.145)], (u0, v0, u1, v1))   # 朝 −z
    # 冷氣室外機（立體的幾台；其他畫在貼圖上）
    for _ in range(rr.randint(1, 4)):
        f = rr.randint(1, floors - 1); y = GH + (f - 1) * FH + 0.2; zc = rr.uniform(za + 0.8, zb - 0.8)
        VC.cbox(xf, xf + 0.38, y, y + 0.55, zc - 0.4, zc + 0.4, '#e6e6e0'); VC.cbox(xf + 0.38, xf + 0.4, y + 0.1, y + 0.45, zc - 0.3, zc + 0.05, '#8a8a86')
    # 屋頂看板（高的樓）
    if floors >= 7 and rr.random() < 0.5:
        bw = min(8.0, W - 1.0); a = za + (W - bw) / 2; y0 = H + 1.2; y1 = y0 + 2.2
        for zz in (a + 0.3, a + bw - 0.3): VC.cbox(xf - 1.2, xf - 1.0, H, y1, zz - 0.06, zz + 0.06, '#5a5d60')
        VC.cbox(xf - 1.15, xf - 1.0, y0, y1, a, a + bw, '#2b2b2b'); sign_quad_x(xf - 0.995, a, a + bw, y0 + 0.08, y1 - 0.08, 'hs%d' % rr.randrange(8))
    return H


# ================= 第一排（羅斯福路對面的商店街） =================
ROW1 = []
z = -142.0
while z < -88.0 - 1e-6:   # 北段
    w = min(-88.0 - z, rr.choice((7, 8, 9, 10, 11, 12, 13))); ROW1.append((z, z + w)); z += w
ROW1.append((-88.0, -74.0))   # 往溫州街的轉角公寓
SHOPS_W = [10, 8, 12, 10, 8, 8, 9, 9, 8, 9, 9, 10, 8, 9, 9]   # 公館區域 15 棟的寬度（和 zones3d.js gongguan 的 shops 一樣；前 8 棟各多 1.2 m）
z = -68.0
for i, w in enumerate(SHOPS_W): W = w + (1.2 if i < 8 and i < len(SHOPS_W) - 1 else 0.0); ROW1.append((z, z + W)); z += W
MKT_Z = (100.0, 136.0)
while z < 152.0 - 1e-6:   # 南段（水源市場那一塊另外蓋）
    if MKT_Z[0] - 1e-6 <= z < MKT_Z[1]: z = MKT_Z[1]; continue
    w = rr.choice((7, 8, 9, 10, 11, 12)); w = min(w, (MKT_Z[0] - z) if z < MKT_Z[0] else 152.0 - z)
    if w < 3: w = (MKT_Z[0] - z) if z < MKT_Z[0] else 152.0 - z
    ROW1.append((z, z + w)); z += w
HEIGHTS_SHOPS = [9, 12, 7, 13, 8, 10, 6, 11, 9, 12, 8, 14, 7, 10, 9]
stats = dict(row1=0, row2=0)
for (za, zb) in ROW1:
    if -68.0 - 1e-6 <= za < 77.6 - 1e-6: f = HEIGHTS_SHOPS[[r for r in ROW1 if -68.0 - 1e-6 <= r[0] < 77.6 - 1e-6].index((za, zb))]
    elif (za, zb) == (-88.0, -74.0): f = 7
    else: f = rr.choice((4, 5, 6, 7, 8, 8, 9, 10, 11, 12, 13))
    k = rr.choice((0, 1, 1, 2, 3, 4, 5, 5)) if f < 12 else rr.choice((0, 3, 6))
    building(X1F, D1, za, zb, f, k, arcade=True); stats['row1'] += 1

# 水源市場（第一排南段）：藍色大樓、彩色橫條、大字；一樓是攤位（遮雨棚）
za, zb = MKT_Z; fm = 8; Hm = GH + (fm - 1) * FH
uvquad(MKT, [(X1F, GH, zb), (X1F, GH, za), (X1F, Hm, za), (X1F, Hm, zb)], (0.0, 0.25, 1.0, 1.0))
uvquad(MKT, [(X1F - 1.2, 0.0, zb), (X1F - 1.2, 0.0, za), (X1F - 1.2, GH - 0.6, za), (X1F - 1.2, GH - 0.6, zb)], (0.0, 0.0, 1.0, 0.25))
VC.cbox(X1F - 1.2, X1F + 1.6, GH - 0.6, GH - 0.45, za, zb, '#3a78c8'); VC.cbox(X1F + 1.45, X1F + 1.6, GH - 1.2, GH - 0.45, za, zb, '#f4f4f0')   # 遮雨棚
facade_z(zb, +1, X1F - 24, X1F, 0.0, Hm); facade_z(za, -1, X1F - 24, X1F, 0.0, Hm)
VC.poly([(X1F - 24, Hm, za), (X1F - 24, Hm, zb), (X1F, Hm, zb), (X1F, Hm, za)], '#8e8b86')
VC.cbox(X1F - 0.3, X1F, Hm, Hm + 1.0, za, zb, '#2e6fc4')
# 市場旁邊的天橋：市場那一端的樓梯（綠色踏面）→ 橋面跨過羅斯福路 → 校園這一側的人行道（圍牆外面）
bz = MKT_Z[0] - 3.0; deckY = 6.2
VC.cbox(-186.0, -129.0, deckY - 0.45, deckY, bz - 1.5, bz + 1.5, '#9a9c98')   # 橋面
for s_ in (-1, 1): VC.cbox(-186.0, -129.0, deckY, deckY + 1.15, bz + s_ * 1.5 - 0.06, bz + s_ * 1.5 + 0.06, '#c9ced2')   # 欄杆（矮牆）
for xb_, dirz in ((-184.5, -1), (-131.0, 1)):   # 兩端的樓梯：沿著 z 走下來
    n = 30; rise = deckY / n; run = 0.3
    for j in range(n):
        zz0 = bz + dirz * (1.5 + j * run); zz1 = zz0 + dirz * run; y = deckY - (j + 1) * rise
        VC.cbox(xb_ - 1.2, xb_ + 1.2, y, y + rise, min(zz0, zz1), max(zz0, zz1), '#5b9a6a')
    for s_ in (-1, 1): VC.cbox(xb_ + s_ * 1.2 - 0.06, xb_ + s_ * 1.2 + 0.06, 0.0, deckY + 1.0, min(bz + dirz * 1.5, bz + dirz * (1.5 + n * run)), max(bz + dirz * 1.5, bz + dirz * (1.5 + n * run)), '#c9ced2')
for xp in (-176.0, -160.0, -146.0, -137.0): VC.cbox(xp - 0.4, xp + 0.4, 0.0, deckY - 0.45, bz - 0.4, bz + 0.4, '#b0b2ae')   # 橋墩

# 捷運公館站出口前的「GONGGUAN」字樣（白色字、花台）＋藍色小花（照片：出口 1）
gz0 = -30.0; gx = -184.6
VC.cbox(gx - 0.6, gx + 0.6, 0.0, 0.55, gz0 - 4.6, gz0 + 4.6, '#f4f4f0'); VC.cbox(gx - 0.5, gx + 0.5, 0.55, 0.75, gz0 - 4.5, gz0 + 4.5, '#4f8a3a')
bpy.ops.object.text_add(location=(0, 0, 0)); tob = bpy.context.object; tob.data.body = 'GONGGUAN'; tob.data.size = 1.0; tob.data.extrude = 0.08; tob.data.align_x = 'CENTER'
bpy.ops.object.convert(target='MESH'); tm = tob.data; tm.calc_loop_triangles()
for tri in tm.loop_triangles:   # 字（Blender 的 x、y 平面）→ 遊戲：立在花台上、朝 +x（看的人的左手邊是 +z：字的 +x 對到遊戲的 −z）
    pts = []
    for vi in tri.vertices:
        v = tm.vertices[vi].co; pts.append((gx + 0.02 + v.z, 0.8 + v.y, gz0 - v.x))
    VC.poly(pts, '#ffffff')
bpy.data.objects.remove(tob, do_unlink=True)
for (fz, fh) in ((gz0 - 5.6, 1.9), (gz0 + 5.6, 1.6), (gz0 + 6.8, 1.2)):   # 藍色小花：細桿＋五片花瓣（兩面）＋白色花心
    VC.cbox(gx - 0.04, gx + 0.04, 0.0, fh, fz - 0.04, fz + 0.04, '#d9d9d4')
    for p_ in range(5):
        a = p_ * 2 * PI / 5; cx_, cy_ = fz + 0.42 * math.cos(a), fh + 0.42 * math.sin(a); el = []
        for q in range(10):
            t = q * 2 * PI / 10; ex, ey = 0.3 * math.cos(t), 0.2 * math.sin(t); el.append((gx + 0.06, cy_ + ex * math.sin(a) + ey * math.cos(a), cx_ + ex * math.cos(a) - ey * math.sin(a)))
        VC.poly(el, '#3f7fd8'); VC.poly(el[::-1], '#3f7fd8')
    ring = [(gx + 0.08, fh + 0.16 * math.sin(q * 2 * PI / 8), fz + 0.16 * math.cos(q * 2 * PI / 8)) for q in range(8)]
    VC.poly(ring[::-1], '#ffffff'); VC.poly(ring, '#ffffff')

# ================= 第二排（後面的高樓：高低錯落、中間有縫） =================
z = -140.0
while z < 154.0:
    w = rr.choice((14, 16, 18, 20, 22, 24)); f = rr.choice((10, 11, 12, 13, 14, 16, 18, 20)); k = rr.choice((2, 3, 6, 6, 0))
    H = building(X2F, D2, z, min(154.0, z + w), f, k, arcade=False, extras=False)
    if rr.random() < 0.4:   # 屋頂的天線、看板
        VC.cbox(X2F - 6, X2F - 5.8, H, H + rr.uniform(3, 7), z + w / 2 - 0.1, z + w / 2 + 0.1, '#6a6d70')
    if rr.random() < 0.35:
        a = z + 2; b = min(154.0, z + w) - 2; y0 = H + 1.0; y1 = y0 + 2.6
        VC.cbox(X2F - 1.2, X2F - 1.0, y0, y1, a, b, '#2b2b2b'); sign_quad_x(X2F - 0.995, a, b, y0 + 0.1, y1 - 0.1, 'hs%d' % rr.randrange(8))
    stats['row2'] += 1; z += w + rr.choice((2, 3, 4, 6))

for m in (FAC, SHOP, SIGN, MKT): m.finish(root, uv=False, merge=False)
VC.finish(root, uv=False)
L.merge_by_material(root, keep=lambda ob: False, key=lambda ob: '')
st = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
info = dict(st if isinstance(st, dict) else {}, tris_total=tris, coords='campus（x 東、z 南）：放在原點、不用轉', replaces='zones3d.js campusBackdrop 的 city：x −189 的第一排（z −142～152、含轉角 z −88～−74）、x −212 的第二排',
            night='gg_bd_facade（窗）、gg_bd_shopfront（店面）、gg_bd_signs（招牌）的 emissive 接了貼圖：TK.addNight(material, nightI, dayI)', **stats)
L.write_json(OUT[:-4] + '.json', info)
print(json.dumps(dict(tris=tris, **stats), ensure_ascii=False))
