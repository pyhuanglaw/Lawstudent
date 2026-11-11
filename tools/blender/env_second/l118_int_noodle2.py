"""118 巷店面室內重做（L118-SHOPS-REDO-1111，USER_WANTS X338）——迪倫窯烤披薩（店 id noodle2，原六張犁麵舖）的室內。
LAWWW 的 Blender 子代理臨時代 LAWWW2 做；Blender 5.2（一間店一個 Blender 程序）：
  /opt/blenv/bin/python tools/blender/env_second/l118_int_noodle2.py [-- [--out-dir assets/models/env/second_ai] [--preview]]
產出（覆蓋）：assets/models/env/second_ai/l118_noodle2.glb、.json、.layout.json；--preview：docs/art-rebuild/second_ai/wip/l118_int_1111/noodle2_door.jpg、noodle2_back.jpg。
參考圖：docs/handoff/user_specs/l118_ref/int_noodle2.webp；店名、品名、價錢照 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md（不照圖抄：圖上的義式臘腸、野菇松露、價錢都不是規格的）。
共用的零件（begin／shell2／table_unit／CEIL_*／trap_check／餐點照片）在 l118_int_omu.py（同一個子代理做的三間共用；說明見那個檔的檔頭）。
這間：工業風小店——左牆紅磚（白漆手繪店名和披薩）、其餘水泥色牆、深灰地磚（地上白線「外帶取餐 ↑」）、裸露管線的深色天花板、軌道燈、鐵罩吊燈；
  最裡面中間磚砌圓頂窯爐（火＝GLOW_ 材質、下層堆柴、黑色排煙管），左後木櫃台「外帶取餐」（點餐在這裡），右側靠牆一長條不鏽鋼開放製作檯；
  左側靠牆的雙人桌（木桌面、黑鐵椅）。午餐邀約要四人桌：參考圖只有雙人桌——左牆中間那一組是兩張雙人桌併在一起（四個座位 table 同一個值）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import l118_int_omu as K   # noqa: E402
from l118_int_omu import LS, L, B, Mesh, CMesh, Matrix, g2b, Image, ImageDraw, ImageFilter, F, hexrgb, shade, ctext, fit, PI, H, ccyl, csph, clathe, rbox, rot, uvquad   # noqa: E402

REG = {'MENU': (0, 0, 512, 640), 'TAKE': (512, 0, 1024, 128), 'BW1': (512, 128, 768, 448), 'BW2': (768, 128, 1024, 448), 'BW3': (512, 448, 768, 768), 'HOURS': (768, 448, 1024, 608),
       'NOTE': (768, 608, 1024, 768), 'PIZZA': (0, 640, 384, 1024), 'PIZZA2': (384, 768, 640, 1024), 'BOX': (640, 768, 896, 1024), 'TAG': (896, 768, 1024, 1024)}
PAINT = {'WALL': (0, 0, 1024, 512), 'FLOOR': (0, 512, 512, 1024), 'LEAF': (512, 512, 1024, 1024)}   # 去背的那一張（白漆、地上的字）
MENU = [('瑪格麗特', 180), ('夏威夷', 200), ('燻雞蘑菇', 210), ('四種起司', 230)]   # 使用者文字規格第二節 9（個人尺寸）
NAME = '迪倫窯烤披薩'


def slice_icon(d, cx, cy, s, col, w=5):
    """一片披薩的線稿（三角形＋餅皮的弧＋幾顆配料）"""
    a, b, t = (cx - s * 0.55, cy - s * 0.45), (cx + s * 0.55, cy - s * 0.3), (cx - s * 0.05, cy + s * 0.6)
    d.line([a, t, b], fill=col, width=w, joint='curve'); d.line([a, (cx, cy - s * 0.5), b], fill=col, width=w + 2, joint='curve')
    for (px, py, r) in ((-0.15, -0.15, 0.08), (0.18, -0.1, 0.07), (0.0, 0.15, 0.07), (-0.05, -0.3, 0.05)): d.ellipse([cx + px * s - r * s, cy + py * s - r * s, cx + px * s + r * s, cy + py * s + r * s], outline=col, width=max(2, w - 2))


def sprig(d, x, y, L_, col, flip=1, w=4):
    """一枝葉子（手繪）"""
    d.line([(x, y), (x + flip * L_, y - L_ * 0.25)], fill=col, width=w)
    for k in range(5):
        t = (k + 1) / 6; px, py = x + flip * L_ * t, y - L_ * 0.25 * t
        for s in (-1, 1): d.ellipse([px - 10, py + s * 16 - 7, px + 14, py + s * 16 + 7], outline=col, width=w - 1)


def atlas(hours):
    im = Image.new('RGB', (1024, 1024), '#808080'); wh = (240, 236, 224)
    # MENU：黑板菜單（店名、個人尺寸、四樣、一片披薩的粉筆畫）
    w, h = 512, 640; a = K.chalk(w, h, '#262a28', 4); d = ImageDraw.Draw(a); ctext(d, w / 2 - 40, 30, NAME, F(54), wh); slice_icon(d, w - 70, 62, 70, wh, 4)
    d.line([(40, 108), (w - 40, 108)], fill=(200, 196, 184), width=3); ctext(d, w / 2, 122, '個人尺寸・現點現烤', F(30), (214, 196, 150))
    K.menu_lines(d, 50, w - 50, 190, MENU, 46, wh, wh, gap=92, dots=True); sprig(d, 300, 610, 150, (150, 190, 130)); K.put(im, REG, 'MENU', a)
    # TAKE：外帶取餐（深色鐵牌、白字＋披薩盒）
    w, h = 512, 128; a = Image.new('RGB', (w, h), '#23211f'); d = ImageDraw.Draw(a); d.rectangle([4, 4, w - 5, h - 5], outline=(120, 116, 108), width=3); ctext(d, w / 2 - 50, 26, '外帶取餐', F(72), wh)
    d.polygon([(400, 74), (440, 58), (486, 70), (446, 88)], outline=wh); d.line([(400, 74), (400, 92), (446, 106), (446, 88)], fill=wh, width=3); d.line([(446, 106), (486, 88), (486, 70)], fill=wh, width=3); K.put(im, REG, 'TAKE', a)
    # BW1～3：牆上的黑白照片（程式畫的披薩照片轉黑白＋白色襯紙）
    for key, kind in (('BW1', 'pizza_marg'), ('BW2', 'pizza_chicken'), ('BW3', 'pizza_cheese')):
        p = Image.new('RGB', (256, 320), '#f1efe9'); ph = K.dish(kind, 200, 250).convert('L').convert('RGB'); p.paste(ph, (28, 30)); ImageDraw.Draw(p).rectangle([28, 30, 227, 279], outline=(60, 60, 60), width=2); K.put(im, REG, key, p)
    # HOURS、NOTE
    w, h = 256, 160; a = K.paper(w, h, '#f4efe2', 7); d = ImageDraw.Draw(a); ctext(d, w / 2, 12, '營業時間', F(34), (40, 40, 40)); yy = 62
    for ln in hours.split('；'): ctext(d, w / 2, yy, ln, fit(d, ln, w - 20, 26), (60, 60, 60)); yy += 40
    d.rectangle([3, 3, w - 4, h - 4], outline=(40, 40, 40), width=4); K.put(im, REG, 'HOURS', a)
    a = K.paper(256, 160, '#e9dcc0', 9); d = ImageDraw.Draw(a); ctext(d, 128, 30, '現烤', F(46), (60, 40, 24)); ctext(d, 128, 92, '約等八分鐘', F(36), (60, 40, 24)); K.put(im, REG, 'NOTE', a)
    # PIZZA、PIZZA2：製作檯上的披薩（從上面看）；BOX：披薩盒的盒蓋；TAG：小價格卡
    K.put(im, REG, 'PIZZA', K.dish('pizza_marg', 384, 384)); K.put(im, REG, 'PIZZA2', K.dish('pizza_hawaii', 256, 256))
    a = K.paper(256, 256, '#c9a676', 5); d = ImageDraw.Draw(a); d.rectangle([10, 10, 245, 245], outline=(120, 86, 50), width=4); slice_icon(d, 128, 104, 110, (110, 76, 44), 5); ctext(d, 128, 190, NAME, F(30), (110, 76, 44)); K.put(im, REG, 'BOX', a)
    a = K.paper(128, 256, '#f4efe2', 3); d = ImageDraw.Draw(a); ctext(d, 64, 20, '今日', F(40), (60, 40, 24)); ctext(d, 64, 80, '柴火', F(40), (60, 40, 24)); ctext(d, 64, 150, '龍眼木', F(34), (150, 60, 30)); K.put(im, REG, 'TAG', a)
    return im


def paint_atlas():
    """去背的白漆（RGBA）：左牆紅磚上手繪的店名和一片披薩、地上的「外帶取餐 ↑」；邊緣故意刷得不太實（漆在磚上）"""
    im = Image.new('RGBA', (1024, 1024), (244, 240, 230, 0)); wh = (244, 240, 230, 255)
    a = Image.new('L', (1024, 512), 0); d = ImageDraw.Draw(a); ctext(d, 512, 40, NAME, F(150), 255); slice_icon(d, 512, 350, 230, 255, 9); sprig(d, 330, 400, 190, 255, -1, 6); sprig(d, 700, 400, 190, 255, 1, 6)
    rr = random.Random(5); px = a.load()
    for _ in range(26000): x, y = rr.randrange(1024), rr.randrange(512); px[x, y] = int(px[x, y] * rr.uniform(0.0, 0.7))      # 磚縫吃掉一點漆
    im.paste(Image.new('RGBA', (1024, 512), wh), (0, 0), a)
    a = Image.new('L', (512, 512), 0); d = ImageDraw.Draw(a); ctext(d, 256, 250, '外帶取餐', F(104), 255)
    d.polygon([(256, 40), (176, 130), (226, 130), (226, 220), (286, 220), (286, 130), (336, 130)], fill=255)
    d.polygon([(176, 430), (256, 400), (336, 430), (256, 462)], outline=255); d.line([(176, 430), (176, 470), (256, 502), (256, 462)], fill=255, width=7); d.line([(256, 502), (336, 470), (336, 430)], fill=255, width=7); d.line([(176, 430), (256, 400), (336, 430), (256, 462), (176, 430)], fill=255, width=7)
    px = a.load()
    for _ in range(9000): x, y = rr.randrange(512), rr.randrange(512); px[x, y] = int(px[x, y] * rr.uniform(0.0, 0.6))
    im.paste(Image.new('RGBA', (512, 512), wh), (0, 512), a)
    return im


def mask_mat(name, fn, rough=0.9):
    """去背貼圖的材質：Alpha 經過 ROUND（匯出成 alphaMode MASK，不用半透明混合；ROLE_LAWWW2 場景規則 3）"""
    m = bpy_mat = LS.img_mat(name, fn, rough=rough); nt = m.node_tree; tx = next(n for n in nt.nodes if n.type == 'TEX_IMAGE'); bs = nt.nodes['Principled BSDF']
    rd = nt.nodes.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha'])
    try: m.blend_method = 'CLIP'
    except Exception: pass
    return m


def iron_chair(c, x, z, yaw, col='#222222', seat='#8a5c36'):
    """黑鐵椅（工業風）：四支外撇的鐵腳、木頭座面、兩支椅背柱＋上橫桿＋中間一片背板"""
    T = rot(x, z, yaw); v = c.vc; vm = c.vm; top = K.SIT_TOP
    rbox(v, T, -0.19, 0.19, top - 0.03, top, -0.18, 0.18, seat, r=0.012, seg=1)
    for (lx, lz) in ((-0.16, 0.15), (0.16, 0.15), (-0.16, -0.15), (0.16, -0.15)):
        a = T(lx * 1.22, lz * 1.25); b = T(lx, lz); ccyl(vm, (a[0], 0.0, a[1]), (b[0], top - 0.03, b[1]), 0.014, col, seg=5, caps=False)
    for lx in (-0.16, 0.16):
        a = T(lx, -0.17); b = T(lx * 0.95, -0.21); ccyl(vm, (a[0], top - 0.03, a[1]), (b[0], 0.86, b[1]), 0.013, col, seg=5, caps=False)
    rbox(vm, T, -0.165, 0.165, 0.83, 0.87, -0.225, -0.2, col, r=0.008, seg=1); rbox(vm, T, -0.07, 0.07, 0.56, 0.83, -0.215, -0.2, col)
    for lz in (0.15, -0.15): rbox(vm, T, -0.17, 0.17, 0.22, 0.235, lz - 0.006, lz + 0.006, col)


def pizza_box(m, x, y, z, n=4, s=0.3, col='#c9a676'):
    for k in range(n): m.cbox(x - s / 2, x + s / 2, y + k * 0.045, y + k * 0.045 + 0.04, z - s / 2, z + s / 2, col, 0.94 + 0.08 * (k % 2))


def jar(m, x, y, z, col, r=0.045, h=0.14, lid='#3a3a3a'):
    ccyl(m, (x, y, z), (x, y + h, z), r, col, seg=6); ccyl(m, (x, y + h, z), (x, y + h + 0.02, z), r * 1.05, lid, seg=6)


def pipe_shelf(c, m, xw, z0, z1, ys, depth=0.26, wood='#8a5c36'):
    """鐵管層架（靠東牆，xw＝牆面 x）：木層板＋黑鐵管立柱和托架"""
    for y in ys: m.cbox(xw - depth, xw, y - 0.03, y, z0, z1, wood)
    for zz in (z0 + 0.06, (z0 + z1) / 2, z1 - 0.06):
        ccyl(m, (xw - depth + 0.03, ys[0] - 0.35, zz), (xw - depth + 0.03, ys[-1] + 0.3, zz), 0.014, '#1e1e1e', seg=5, caps=False)
        for y in ys: ccyl(m, (xw - depth + 0.03, y - 0.045, zz), (xw, y - 0.045, zz), 0.012, '#1e1e1e', seg=5, caps=False)


def cage_lamp(c, m, xw, y, z):
    """牆上的鐵罩壁燈（左牆）：鵝頸管＋碟形燈罩＋鐵絲籠＋暖光燈泡（燈泡在 WALL_W 的發光網格，跟著牆淡出）"""
    ccyl(m, (xw, y + 0.25, z), (xw + 0.02, y + 0.25, z), 0.05, '#1e1e1e', seg=8); ccyl(m, (xw + 0.02, y + 0.25, z), (xw + 0.2, y + 0.32, z), 0.012, '#1e1e1e', seg=5, caps=False); ccyl(m, (xw + 0.2, y + 0.32, z), (xw + 0.26, y + 0.2, z), 0.012, '#1e1e1e', seg=5, caps=False)
    clathe(m, [(0.0, 0.17), (0.07, 0.16), (0.16, 0.1), (0.165, 0.105), (0.07, 0.175), (0.0, 0.185)], xw + 0.26, y, z, '#26272a', seg=10)
    for k in range(6):
        a = k * PI / 3; ccyl(m, (xw + 0.26 + 0.06 * math.cos(a), y + 0.12, z + 0.06 * math.sin(a)), (xw + 0.26 + 0.045 * math.cos(a), y - 0.06, z + 0.045 * math.sin(a)), 0.004, '#1e1e1e', seg=3, caps=False)
    c.wg('W', 'lampbulb', c.M['warm']).sphere((xw + 0.26, y + 0.04, z), 0.045, seg=8, rings=5)


def oven(c, cx, z0, zf, brick):
    """磚砌圓頂窯爐：磚砌的基座（前面一格放柴）、圓頂（抹灰）、正面的磚拱和爐口（裡面的火＝GLOW_ 材質）、黑色排煙管。cx＝中心 x；z0＝後牆；zf＝基座正面"""
    v = c.vc; W2 = 1.0; yb = 0.95; bm = Mesh('l118_noodle2_ovenbrick', brick, tile=1.0)
    # 基座：左右兩墩＋後半＋檯面（中間前面留一格放柴）
    bm.box(cx - W2, cx - 0.5, 0.0, yb - 0.1, z0, zf); bm.box(cx + 0.5, cx + W2, 0.0, yb - 0.1, z0, zf); bm.box(cx - 0.5, cx + 0.5, 0.0, yb - 0.1, z0, zf - 0.75); bm.box(cx - 0.5, cx + 0.5, 0.72, yb - 0.1, zf - 0.75, zf)
    v.crbox(cx - W2 - 0.04, cx + W2 + 0.04, yb - 0.1, yb, z0, zf + 0.05, '#8f8a80', r=0.012, seg=1)                                    # 爐台的石板
    v.cbox(cx - 0.5, cx + 0.5, 0.0, 0.72, zf - 0.76, zf - 0.74, '#1c1a18'); v.cbox(cx - 0.5, cx + 0.5, 0.0, 0.01, zf - 0.75, zf, '#2a2725')   # 柴格的裡面（暗）
    rr = random.Random(7); y = 0.01
    for row in range(5):                                                                                                                # 一根根柴（看到的是圓的截面）
        n = 6 - row % 2; r = 0.062
        for k in range(n):
            x = cx - 0.42 + (k + (0.5 if row % 2 else 0.0)) * 0.14 + rr.uniform(-0.01, 0.01); rk = r * rr.uniform(0.85, 1.1)
            ccyl(v, (x, y + rk, zf - 0.6), (x, y + rk, zf - 0.06 + rr.uniform(-0.04, 0.02)), rk, rr.choice(['#b98a58', '#a87a4a', '#c89a68', '#96693c']), seg=6)
        y += 0.118
    # 圓頂（抹灰的半球，扁一點）＋正面磚砌的拱、爐口
    R = 0.9; zc = zf - R - 0.04
    prof = [(R * math.cos(t), R * 0.9 * math.sin(t)) for t in (0.0, 0.28, 0.56, 0.84, 1.1, 1.33)] + [(0.2, R * 0.9)]
    clathe(v, [(R + 0.02, 0.0)] + prof, cx, yb, zc, '#cfc7b6', seg=18)
    my0, mw, mh = yb + 0.02, 0.4, 0.3; zfa = zf - 0.02                                                                                     # 爐口：寬 0.8、拱頂高 0.3＋0.36；磚拱比圓頂凸出來
    bm.box(cx - 0.72, cx - mw, yb, yb + mh, zfa - 0.3, zfa); bm.box(cx + mw, cx + 0.72, yb, yb + mh, zfa - 0.3, zfa)                    # 爐口兩側的磚墩
    for k in range(9):                                                                                                                  # 拱：九塊楔形磚
        a = PI * (k + 0.5) / 9; rad = mw + 0.17; px, py = cx + rad * math.cos(a), yb + mh + rad * math.sin(a) * 0.9
        b_ = L.rbox_bm(0.19, 0.3, 0.3, r=0.01, seg=1); bm.add_bm(b_, Matrix.Translation(g2b(px, py, zfa - 0.15)) @ Matrix.Rotation(PI / 2 - a, 4, 'Y')); b_.free()
    # 爐膛：圓頂的殼在磚拱後面 6～10 cm 就切進來，所以爐膛做成拱形的一片暗面（在磚拱後面 5 cm）＋前面的火、柴、炭火——從店裡看是一個有火的洞
    dk = '#1a120c'; zb = zfa - 0.05
    arc = [(cx + (mw + 0.03) * math.cos(PI * k / 10), yb + mh + 0.37 * math.sin(PI * k / 10), zb) for k in range(11)]
    v.poly([(cx - mw - 0.03, my0, zb), (cx + mw + 0.03, my0, zb)] + arc, dk)
    v.poly([(cx - mw, my0, zb), (cx - mw, my0, zfa), (cx + mw, my0, zfa), (cx + mw, my0, zb)], '#3a2a1e')
    fire = c.extra.setdefault('fire', Mesh('l118_noodle2_fire', L.flat('GLOW_l118_noodle2_fire', '#ffb04a', rough=0.5, emit=B.srgb('#ff8a1e'))))
    hot = c.extra.setdefault('ember', Mesh('l118_noodle2_ember', L.flat('GLOW_l118_noodle2_ember', '#ffe08a', rough=0.5, emit=B.srgb('#ffd060'))))
    zfi = zb + 0.012
    for (fx, fw, fh) in ((-0.23, 0.11, 0.3), (-0.07, 0.14, 0.46), (0.1, 0.13, 0.38), (0.24, 0.09, 0.26)):                                # 火焰（一片片尖的）
        fire.quad([(cx + fx - fw, my0 + 0.05, zfi), (cx + fx + fw, my0 + 0.05, zfi), (cx + fx + fw * 0.3, my0 + 0.05 + fh * 0.6, zfi + 0.004), (cx + fx - fw * 0.2, my0 + 0.05 + fh, zfi)])
        hot.quad([(cx + fx - fw * 0.5, my0 + 0.05, zfi + 0.008), (cx + fx + fw * 0.5, my0 + 0.05, zfi + 0.008), (cx + fx + fw * 0.15, my0 + 0.05 + fh * 0.35, zfi + 0.01), (cx + fx - fw * 0.1, my0 + 0.05 + fh * 0.55, zfi + 0.008)])
    for k in range(3): ccyl(v, (cx - 0.3 + k * 0.03, my0 + 0.035 + (k % 2) * 0.04, zfi + 0.02 + k * 0.012), (cx + 0.28 - k * 0.02, my0 + 0.045 + (k % 2) * 0.04, zfi + 0.02 + k * 0.012), 0.03, '#3a241a', seg=5)   # 爐裡的柴
    hot.box(cx - 0.32, cx + 0.32, my0, my0 + 0.015, zfi, zfa - 0.005)                                                                    # 炭火的光
    # 排煙管（黑鐵）：圓頂上面往上到天花板
    ccyl(c.vm, (cx, yb + R * 0.9, zc), (cx, H, zc), 0.17, '#232323', seg=12, caps=False); ccyl(c.vm, (cx, yb + R * 0.88, zc), (cx, yb + R * 1.0, zc), 0.21, '#1c1c1c', seg=12); ccyl(c.vm, (cx, 2.5, zc), (cx, 2.56, zc), 0.185, '#1c1c1c', seg=12)
    bm.finish(c.root)
    c.block(cx - W2, cx + W2, z0, zf, 'oven')


def prep_counter(c, x0, x1, z0, z1):
    """不鏽鋼開放製作檯（靠東牆）：鐵網櫃門、檯面、配料冷藏盒＋玻璃罩、麵粉、鋼盆、麵團、做到一半的披薩、橄欖油、毛巾"""
    v = c.vc; vm = c.vm; h = 0.92
    c.steel.box(x0 - 0.03, x1, h - 0.04, h, z0, z1 + 0.03); vm.cbox(x0, x1, 0.0, 0.1, z0, z1, '#2a2b2d'); v.cbox(x0 + 0.02, x1, 0.1, h - 0.04, z0, z1, '#35363a')
    n = 5; dz = (z1 - z0) / n
    for k in range(n):                                                                                                                  # 櫃門：黑鐵框＋鐵網
        a, b = z0 + k * dz + 0.03, z0 + (k + 1) * dz - 0.03
        vm.cbox(x0 - 0.012, x0 + 0.02, 0.14, h - 0.08, a, b, '#5b5d60'); vm.cbox(x0 - 0.02, x0 - 0.01, 0.14, h - 0.08, a, a + 0.035, '#1e1e1e'); vm.cbox(x0 - 0.02, x0 - 0.01, 0.14, h - 0.08, b - 0.035, b, '#1e1e1e')
        vm.cbox(x0 - 0.02, x0 - 0.01, 0.14, 0.175, a, b, '#1e1e1e'); vm.cbox(x0 - 0.02, x0 - 0.01, h - 0.115, h - 0.08, a, b, '#1e1e1e')
        for j in range(1, 6): vm.cbox(x0 - 0.016, x0 - 0.011, 0.175, h - 0.115, a + j * (b - a) / 6 - 0.004, a + j * (b - a) / 6 + 0.004, '#3c3d40')
        for j in range(1, 5): vm.cbox(x0 - 0.016, x0 - 0.011, 0.175 + j * (h - 0.29) / 5 - 0.004, 0.175 + j * (h - 0.29) / 5 + 0.004, a + 0.035, b - 0.035, '#3c3d40')
    # 毛巾桿＋毛巾、掛著的鐵杯
    ccyl(vm, (x0 - 0.06, 0.78, z1 - 1.3), (x0 - 0.06, 0.78, z1 - 0.5), 0.01, '#9aa0a4', seg=5); v.cbox(x0 - 0.075, x0 - 0.045, 0.42, 0.79, z1 - 1.15, z1 - 0.9, '#f1eee6'); v.cbox(x0 - 0.077, x0 - 0.043, 0.46, 0.48, z1 - 1.15, z1 - 0.9, '#b8322a')
    clathe(vm, [(0.0, 0.0), (0.05, 0.0), (0.06, 0.13), (0.055, 0.13), (0.0, 0.01)], x0 - 0.09, 0.56, z1 - 0.62, '#c4c8cb', seg=8)
    # 配料冷藏盒（靠牆那一側墊高）＋斜的玻璃罩
    rz0, rz1 = z0 + 0.25, z0 + 2.15; rx0, rx1 = x1 - 0.42, x1 - 0.04
    c.steel.box(rx0 - 0.03, x1, h, h + 0.16, rz0 - 0.04, rz1 + 0.04)
    cols = ['#2f2a2a', '#c8281c', '#e9dcc0', '#7a3a6a', '#3f7a2a', '#d8402c', '#f2d98a']; nn = len(cols); dd = (rz1 - rz0) / nn
    for k, col in enumerate(cols):
        a, b = rz0 + k * dd + 0.015, rz0 + (k + 1) * dd - 0.015; v.cbox(rx0, rx1, h + 0.15, h + 0.165, a, b, '#17181a')
        for j in range(5): csph(v, (rx0 + 0.06 + (j % 3) * 0.12, h + 0.165, a + 0.05 + (j % 2) * (b - a - 0.1)), 0.06, col, seg=5, rings=3, sy=0.4)
    gl = c.extra.setdefault('pglass', Mesh('l118_noodle2_prepglass', c.M['glass']))
    gl.quad([(rx0 - 0.06, h + 0.2, rz1 + 0.03), (rx0 - 0.06, h + 0.2, rz0 - 0.03), (rx1 - 0.05, h + 0.52, rz0 - 0.03), (rx1 - 0.05, h + 0.52, rz1 + 0.03)])
    for zz in (rz0 - 0.03, rz1 + 0.03): ccyl(vm, (rx1 - 0.03, h + 0.16, zz), (rx1 - 0.03, h + 0.53, zz), 0.01, '#b9bec2', seg=5, caps=False)
    vm.cbox(rx1 - 0.08, rx1 - 0.02, h + 0.52, h + 0.535, rz0 - 0.04, rz1 + 0.04, '#b9bec2')
    # 檯面上（由裡到外）：麵粉桶、鋼盆（起司）、醬汁盆、做到一半的披薩、橄欖油和胡椒罐、麵團板
    xm = x0 + 0.34
    v.crbox(xm - 0.13, xm + 0.13, h, h + 0.26, z0 + 0.06, z0 + 0.3, '#e9e6de', r=0.02, seg=1); v.cbox(xm - 0.14, xm + 0.14, h + 0.26, h + 0.28, z0 + 0.05, z0 + 0.31, '#d9d6cc')
    clathe(vm, [(0.0, 0.0), (0.08, 0.0), (0.17, 0.11), (0.165, 0.11), (0.0, 0.012)], xm, h, z0 + 0.62, '#c4c8cb', seg=10); csph(v, (xm, h + 0.085, z0 + 0.62), 0.13, '#f2e6b8', seg=8, rings=4, sy=0.3)
    clathe(vm, [(0.0, 0.0), (0.07, 0.0), (0.13, 0.085), (0.125, 0.085), (0.0, 0.012)], xm + 0.02, h, z0 + 1.0, '#c4c8cb', seg=10); csph(v, (xm + 0.02, h + 0.07, z0 + 1.0), 0.1, '#c8321e', seg=8, rings=4, sy=0.25)
    pz = z0 + 1.62; K.print_quad(c, c.prt, [(xm + 0.21, h + 0.004, pz + 0.21), (xm + 0.21, h + 0.004, pz - 0.21), (xm - 0.21, h + 0.004, pz - 0.21), (xm - 0.21, h + 0.004, pz + 0.21)], 'PIZZA')
    v.cbox(xm - 0.23, xm + 0.23, h, h + 0.003, pz - 0.23, pz + 0.23, '#b98d5e')
    clathe(v, [(0.0, 0.0), (0.033, 0.0), (0.033, 0.17), (0.013, 0.22), (0.013, 0.27), (0.0, 0.27)], xm - 0.12, h, z0 + 2.2, '#c9b23a', seg=6); clathe(v, [(0.0, 0.0), (0.03, 0.0), (0.022, 0.1), (0.03, 0.13), (0.02, 0.19), (0.0, 0.2)], xm + 0.02, h, z0 + 2.25, '#4a2c18', seg=6)
    bz = z1 - 0.95; v.crbox(xm - 0.2, xm + 0.42, h, h + 0.03, bz - 0.3, bz + 0.3, '#b98d5e', r=0.008, seg=1)
    for (dx, dz_) in ((-0.05, -0.14), (0.24, -0.12), (0.1, 0.12), (0.34, 0.14)): csph(v, (xm + dx, h + 0.075, bz + dz_), 0.105, '#f1e6cc', seg=8, rings=5, sy=0.62)
    K.pot_plant(c, xm + 0.1, z1 - 0.28, h, h=0.26, seed=5, r=0.085, pot='#e9e6de', col='#4f9a37')                                         # 羅勒
    c.block(x0, x1, z0, z1, 'prep_counter')


def build():
    sid = 'noodle2'; sd = K.shop_data(sid); hours = sd['hours']['text']
    assert [tuple(m) for m in sd['menu']] == MENU and sd['name'] == NAME, '店家資料和這裡寫的菜單不一樣'
    spec = dict(floor=('granite_tile', '#6f6e6c', 1.2), wall='#b7b2a8', wain=('white_plaster_02', '#b7b2a8', 2.0), wainH=1.0, wood=('walnut_veneer', '#8a5c36'), trim='#232323', ceil='#7f7c76')
    os.makedirs(LS.GEN, exist_ok=True); paint_atlas().save(os.path.join(LS.GEN, 'l118_noodle2_paint.png'))
    c = K.begin(sid, spec, REG, atlas(hours)); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; v = c.vc; vm = c.vm; IR = '#1e1e1e'; dx = c.S['door_x']
    brick = L.pbr('l118_noodle2_brick', 'red_brick', tile=1.3, target='#9a4e3a', contrast=0.85, normal=0.5, maps=('diff', 'nor'), res=512, rough_value=0.85)
    paint = mask_mat('l118_noodle2_paint', 'l118_noodle2_paint.png')
    K.shell2(c, frame='#232323', doorc='#232323', handle='#8f969b', wallmat={'W': brick}, wainmat={'W': brick, 'N': c.M['wall'], 'E': c.M['wall'], 'S': c.M['wall']}, rail=False, base='#2a2a2a', grid=True)
    # ---- 最裡面中間：窯爐 ----
    ox = 0.9; oven(c, ox, Z0, -2.65, brick)
    c.look('oven', ox, -2.05, 0.9, '窯爐', note='（窯裡的火是橘色的。站近一點，臉會熱。）', dev='AA_772 look_lines noodle2；火是 GLOW_l118_noodle2_fire／ember')
    # 披薩鏟（靠在窯爐右邊）、右後角：不鏽鋼冰箱和層架
    ccyl(v, (2.08, 0.0, -2.78), (2.02, 1.75, -2.98), 0.014, '#b98d5e', seg=5); vm.cbox(1.9, 2.14, 1.75, 2.1, -3.0, -2.985, '#b9bec2')
    ccyl(v, (2.2, 0.0, -2.8), (2.24, 1.5, -3.0), 0.014, '#96693c', seg=5); v.cbox(2.1, 2.38, 1.5, 1.84, -3.02, -2.99, '#b98d5e')
    c.steel.box(2.45, X1, 0.0, 1.9, Z0, -3.0); vm.cbox(2.45, X1, 0.0, 0.1, Z0 + 0.02, -2.98, '#2a2b2d'); vm.cbox(2.86, 2.9, 0.15, 1.85, -3.0, -2.99, '#55585c')
    for xx in (2.8, 2.96): vm.cbox(xx, xx + 0.02, 0.8, 1.3, -2.99, -2.955, '#d9dcde')
    pizza_box(v, 2.75, 1.9, -3.55, n=5, s=0.34); pizza_box(v, 3.05, 1.9, -3.5, n=3, s=0.3)
    c.block(1.9, X1, Z0, -2.65, 'fridge_corner')
    # ---- 右側：開放製作檯、牆上的鐵管層架和黑板菜單 ----
    prep_counter(c, 2.3, X1, -2.65, 1.35)
    trE = c.wg('E', 'trim', c.M['vc'], cm=True)
    pipe_shelf(c, trE, X1, -2.5, -0.55, (1.55, 1.95, 2.35)); rr = c.rng
    for y in (1.55, 1.95, 2.35):
        zz = -2.4
        while zz < -0.65:
            k = rr.random()
            if k < 0.6: jar(trE, X1 - 0.13, y, zz, rr.choice(['#c8a04a', '#8a3a2a', '#e6d9b8', '#5a7a2a', '#d9c7a0', '#a8422a']), r=0.042, h=rr.uniform(0.1, 0.16)); zz += 0.13
            elif k < 0.8: clathe(trE, [(0.0, 0.0), (0.032, 0.0), (0.032, 0.16), (0.012, 0.22), (0.012, 0.26), (0.0, 0.26)], X1 - 0.13, y, zz, rr.choice(['#2f4a2a', '#5a2a2a', '#c9b23a']), seg=6); zz += 0.11
            else: K.plates(trE, X1 - 0.13, y, zz + 0.06, n=5, r=0.1); zz += 0.28
    K.vine(c, trE, X1 - 0.24, 2.35, -0.62, 0.7, 51, out=(-1, 0))
    K.framed(c, 'E', -0.15, 1.05, 1.45, 2.95, 'MENU', col='#6a4a30', t=0.04)
    # ---- 左後：木櫃台「外帶取餐」（收銀、披薩盒）、活動門、後牆的層架（披薩盒）和布簾 ----
    kx0, kx1, kz0, kz1, kh = X0, -0.9, -2.65, -2.25, 1.02
    c.wood.rbox(kx0, kx1 + 0.03, kh - 0.05, kh, kz0 - 0.04, kz1 + 0.04, r=0.008, seg=2)
    n = 12; w_ = (kx1 - kx0) / n
    for k in range(n): c.wood.box(kx0 + k * w_ + 0.006, kx0 + (k + 1) * w_ - 0.006, 0.1, kh - 0.05, kz1 - 0.03, kz1)                           # 櫃台正面的直木板
    v.cbox(kx0, kx1, 0.0, kh - 0.05, kz0, kz1 - 0.03, '#4a3320'); vm.cbox(kx0, kx1, 0.0, 0.1, kz0, kz1 + 0.005, IR); vm.cbox(kx1 - 0.02, kx1 + 0.03, 0.0, kh - 0.05, kz0, kz1 + 0.005, IR)
    LS.register(c, -1.5, kh, -2.45, face='+z'); pizza_box(v, -2.75, kh, -2.45, n=4); pizza_box(v, -2.38, kh, -2.47, n=2); K.pot_plant(c, -3.08, -2.45, kh, h=0.3, seed=2, r=0.08, pot='#e9e6de')
    K.print_quad(c, c.prt, [(-2.9, kh + 0.045 * 4 + 0.002, -2.3), (-2.6, kh + 0.045 * 4 + 0.002, -2.3), (-2.6, kh + 0.045 * 4 + 0.002, -2.6), (-2.9, kh + 0.045 * 4 + 0.002, -2.6)], 'BOX')
    vm.cbox(-0.9, -0.86, 0.0, 0.95, -2.49, -2.41, IR); vm.cbox(-0.14, -0.1, 0.0, 0.95, -2.49, -2.41, IR)                                   # 活動門（黑鐵框＋木條）
    vm.cbox(-0.86, -0.14, 0.86, 0.9, -2.47, -2.43, IR); vm.cbox(-0.86, -0.14, 0.14, 0.18, -2.47, -2.43, IR)
    for k in range(5): v.cbox(-0.84 + k * 0.142, -0.84 + k * 0.142 + 0.12, 0.18, 0.86, -2.465, -2.435, '#8a5c36')
    c.block(X0, -0.1, Z0, kz1 + 0.03, 'takeout_counter')
    c.counter = dict(x0=kx0, x1=kx1, z0=kz0, z1=kz1, h=kh, note='木櫃台「外帶取餐」（收銀在這裡）；右邊是活動門，後面是店員的工作區，窯爐在右後')
    c.clerk = dict(x=-0.45, z=-3.1, yaw=0.0, note='窯爐的左前方、活動門後面（店員的工作區），面向店裡；店員＝新的，三十歲上下，站在窯爐前（AA_772 staff）')
    c.order = dict(x=-1.5, z=-1.7, r=0.8, label='點餐（' + c.T['name'] + '）', note='「外帶取餐」木櫃台的收銀前面（shop118:noodle2）')
    fr = c.wg('N', 'frame2', c.M['vcm'], cm=True); c.WGP[('N', 'frame2')] = c.WGP[('N', 'takeprint')] = {'at': [-2.0, 1.6, -2.45]}          # 櫃台上面的黑鐵框和「外帶取餐」牌（在後牆前面 1.8 m：淡出判斷點放在櫃台線上）
    for xx in (X0 + 0.04, -0.12): fr.cbox(xx - 0.025, xx + 0.025, kh, H, -2.475, -2.425, IR)
    fr.cbox(X0, -0.1, 2.1, 2.15, -2.475, -2.425, IR); fr.cbox(X0, -0.1, 2.62, 2.66, -2.475, -2.425, IR)
    for k in range(1, 14): fr.cbox(X0 + k * 0.229 - 0.004, X0 + k * 0.229 + 0.004, 2.15, 2.62, -2.453, -2.447, '#3c3d40')
    for k in range(1, 3): fr.cbox(X0, -0.1, 2.15 + k * 0.157 - 0.004, 2.15 + k * 0.157 + 0.004, -2.453, -2.447, '#3c3d40')
    K.print_quad(c, c.wg('N', 'takeprint', c.M['print']), [(-2.6, 2.2, -2.42), (-1.0, 2.2, -2.42), (-1.0, 2.6, -2.42), (-2.6, 2.6, -2.42)], 'TAKE')
    trN = c.wg('N', 'trim', c.M['vc'], cm=True)
    for y in (1.15, 1.6, 2.05): trN.cbox(X0 + 0.1, -1.9, y - 0.03, y, Z0, Z0 + 0.36, '#8a5c36')
    for xx in (X0 + 0.12, -2.6, -1.92): trN.cbox(xx - 0.02, xx + 0.02, 0.0, 2.35, Z0, Z0 + 0.36, IR)
    for (y, n_) in ((1.15, 3), (1.6, 4), (2.05, 2)):
        for k in range(3): pizza_box(trN, X0 + 0.42 + k * 0.42, y, Z0 + 0.19, n=max(1, n_ - k % 2), s=0.32)
    trN.cbox(-1.75, -0.85, 2.02, 2.06, Z0 + 0.03, Z0 + 0.07, IR); K.noren(trN, -1.72, -0.88, 0.95, 2.03, Z0 + 0.06, 2, '#d9cdb2'); trN.cbox(-1.78, -0.82, 0.0, 2.1, Z0, Z0 + 0.03, '#2a2623')   # 後門的布簾
    # ---- 左牆（紅磚）：白漆手繪的店名和披薩、鐵罩壁燈、黑白照片、層板和黃金葛 ----
    pw = c.wg('W', 'paint', paint); u = lambda key: tuple(v_ / 1024 for v_ in (PAINT[key][0], 1024 - PAINT[key][3], PAINT[key][2], 1024 - PAINT[key][1]))
    uvquad(pw, [(X0 + 0.012, 1.25, 3.3), (X0 + 0.012, 1.25, 0.9), (X0 + 0.012, 2.45, 0.9), (X0 + 0.012, 2.45, 3.3)], u('WALL'))
    trW = c.wg('W', 'trim', c.M['vc'], cm=True)
    cage_lamp(c, trW, X0, 2.25, 3.65); cage_lamp(c, trW, X0, 2.2, -0.9)
    for (key, zc_, y0) in (('BW1', 0.35, 1.3), ('BW2', -0.25, 1.38), ('BW3', -1.5, 1.3)): K.framed(c, 'W', zc_ - 0.2, zc_ + 0.2, y0, y0 + 0.5, key, col='#2a2420', t=0.03)
    trW.cbox(X0, X0 + 0.22, 2.55, 2.585, -0.6, 0.7, '#8a5c36')
    for zz in (-0.45, 0.55): ccyl(trW, (X0, 2.38, zz), (X0 + 0.2, 2.55, zz), 0.012, IR, seg=5, caps=False)
    for k in range(4): jar(trW, X0 + 0.12, 2.585, -0.4 + k * 0.14, rr.choice(['#c8a04a', '#8a3a2a', '#e6d9b8']), r=0.04, h=0.13)
    for k in range(3): trW.cbox(X0 + 0.04, X0 + 0.19, 2.585, 2.585 + rr.uniform(0.18, 0.25), 0.2 + k * 0.045, 0.24 + k * 0.045, rr.choice(['#2a4a6a', '#e8dcc0', '#7a2a2a']))
    K.pot_plant(c, X0 + 0.12, 0.55, 2.585, h=0.2, seed=4, r=0.075, m=trW, pot='#2a2a2a'); K.vine(c, trW, X0 + 0.2, 2.58, 0.66, 1.1, 61, out=(1, 0)); K.vine(c, trW, X0 + 0.2, 2.58, 0.4, 0.6, 62, out=(1, 0))
    K.vine(c, trW, X0 + 0.06, 3.05, 3.95, 1.3, 63, out=(1, 0)); K.vine(c, trW, X0 + 0.06, 3.05, 3.7, 0.8, 64, out=(1, 0))
    # ---- 桌椅：左牆三組（裡面雙人桌、中間兩張雙人桌併成四人桌、靠窗雙人桌）＋中間靠窗一張雙人桌 ----
    ch = lambda c_, x, z, yaw: iron_chair(c_, x, z, yaw); TK = dict(td=0.66, half=0.8, gap=0.28, legs='posts', legc=IR)
    t = K.table_unit(c, (X0, -2.5), (-3.26, -2.56), -0.25, [-2.9], [(-2.5, 1)], ch, **TK); candle(c, t[0] - 0.05, t[1] + 0.1); shakers(c, t[0] - 0.18, t[1] - 0.12)
    # 併桌：兩張 0.7 m 的雙人桌併成 1.4 m（中間看得到接縫；四個座位 table 同一個值）
    for (ta, tb) in ((-3.26, -2.57), (-2.55, -1.86)): K.table_top(c, ta, tb, 1.35 - 0.33, 1.35 + 0.33, legs='posts', legc=IR)
    K.table_unit(c, (X0, -1.7), (-3.26, -1.86), 1.35, [-2.9, -2.2], [(-1.7, 1)], ch, notop=True, why='table_unit_joined', **TK); candle(c, -2.9, 1.42); shakers(c, -2.3, 1.25); candle(c, -2.15, 1.45)
    t = K.table_unit(c, (X0, -2.5), (-3.26, -2.56), 2.95, [-2.9], [(-2.5, 1)], ch, zext=(2.15, Z1), **TK); candle(c, t[0] - 0.05, t[1] + 0.1); shakers(c, t[0] - 0.18, t[1] - 0.12)
    t = K.table_unit(c, (-0.9, -0.1), (-0.85, -0.15), 2.95, [-0.5], [(-0.1, 1), (-0.9, -1)], ch, zext=(2.15, Z1), **TK); candle(c, t[0], t[1] + 0.08); shakers(c, t[0] - 0.15, t[1] - 0.12)
    for s in c.seats:                                                                                                                 # 緊鄰併桌的兩張椅子：走近點往自己那一桌退 0.16 m（併桌那一組比雙人桌凸出 0.8 m，原本的走近點貼著它的桌角、站不住）
        for (sz, az) in ((0.36, 0.2), (2.34, 2.5)):
            if abs(s['x'] + 2.9) < 0.01 and abs(s['z'] - sz) < 0.02: s['ap'] = [-2.15, az]; s['r'] = 0.92
    # ---- 地上的白線「外帶取餐 ↑」（從門口往櫃台）、門邊木凳上的盆栽 ----
    fl = c.extra.setdefault('floorpaint', Mesh('l118_noodle2_floorpaint', paint)); y = 0.006
    uvquad(fl, [(0.25, y, 0.9), (1.55, y, 0.9), (1.55, y, -0.4), (0.25, y, -0.4)], u('FLOOR'))
    for xx in (0.05, 1.75):
        for (za, zb) in ((1.6, 0.2), (-0.2, -1.6)): v.cbox(xx - 0.035, xx + 0.035, 0.0, 0.005, zb, za, '#d9d6cc')
    v.cbox(2.55, 2.95, 0.36, 0.4, 1.75, 2.15, '#8a5c36')
    for (ax, az) in ((2.58, 1.78), (2.92, 1.78), (2.58, 2.12), (2.92, 2.12)): v.cbox(ax - 0.02, ax + 0.02, 0.0, 0.36, az - 0.02, az + 0.02, '#6a4426')
    K.pot_plant(c, 2.75, 1.95, 0.4, h=0.42, seed=9, r=0.12, pot='#e9e6de', col='#4f9a37', n=20); c.block(2.3, X1, 1.35, 2.15, 'stool_plant')
    LS.printed(c, 'S', dx - 1.0, dx - 0.55, 1.25, 1.53, 'HOURS', inset=0.03); LS.printed(c, 'N', 2.5, 2.95, 2.4, 2.68, 'NOTE', inset=0.016)
    # ---- 天花板：裸露的黑鐵管線、軌道燈、兩盞大鐵罩吊燈、吸頂冷氣 ----
    cf = c.cf
    for (xa, za, xb, zb, r) in ((-2.2, Z0, -2.2, Z1, 0.035), (-2.05, Z0, -2.05, Z1, 0.025), (X0, 2.0, X1, 2.0, 0.03), (1.3, Z0, 1.3, -0.8, 0.06), (1.3, -0.8, X1, -0.8, 0.06), (X0, -1.9, 0.7, -1.9, 0.03)):
        ccyl(cf, (xa, H - 0.14 - r, za), (xb, H - 0.14 - r, zb), r, '#232323', seg=6, caps=False)
    for (xa, za, xb, zb) in ((-0.4, -1.6, -0.4, 3.4), (1.6, -1.2, 1.6, 3.4)):                                                              # 軌道燈
        cf.cbox(xa - 0.02, xa + 0.02, H - 0.1, H - 0.06, za, zb, '#1c1c1c')
        for zz in (za, (za + zb) / 2, zb): ccyl(cf, (xa, H - 0.06, zz), (xa, H - 0.001, zz), 0.008, '#1c1c1c', seg=4, caps=False)
        n_ = 4
        for k in range(n_):
            zz = za + 0.4 + k * (zb - za - 0.8) / (n_ - 1); sx = -0.1 if k % 2 else 0.1
            ccyl(cf, (xa, H - 0.1, zz), (xa + sx, H - 0.24, zz + 0.04), 0.045, '#1c1c1c', seg=7); c.cw.cyl((xa + sx, H - 0.24, zz + 0.04), (xa + sx * 1.06, H - 0.248, zz + 0.043), 0.036, seg=7)
    lamps = [(2.35, -1.7), (2.35, 0.3)]
    for (x_, z_) in lamps: K.pendant2(c, x_, z_, 2.5, '#2e2f31', r=0.32, seg=14, drop=0.22)
    K.pendant2(c, -2.9, 1.35, 2.52, '#2e2f31', r=0.22); K.pendant2(c, -0.5, 2.95, 2.52, '#2e2f31', r=0.22)
    K.cassette_ac(c, -0.4, -0.6, col='#d9d7d0')
    lay = K.end(c, 'L118-SHOPS-REDO-1111（使用者 2026-11-11 規格＋參考圖 int_noodle2.webp）；店名、菜單 AA_280；室內 tools/blender/env_second/l118_int_noodle2.py（LAWWW 子代理代 LAWWW2）')
    if '--preview' in K.ARGS:
        pts = [(2.2, 2.35, -1.7, 90), (2.2, 2.35, 0.3, 90), (-2.7, 2.4, 1.35, 60), (-0.5, 2.4, 2.95, 60), (-0.4, 2.7, 0.9, 70), (1.6, 2.7, 1.2, 70), (0.9, 1.25, -3.15, 45), (-1.5, 2.6, -3.3, 70), (0.9, 2.5, -1.6, 60), (-2.9, 2.4, -0.25, 50)]
        K.preview(sid, [['door', [dx - 0.35, 1.5, Z1 - 0.3], [0.2, 1.1, Z0 + 0.6], 17], ['back', [0.9, 1.75, -1.9], [-0.3, 1.0, Z1], 15]], pts)
    return lay


def candle(c, x, z):
    """桌上的小蠟燭（玻璃杯＋發光的燭火）"""
    ccyl(c.vc, (x, 0.74, z), (x, 0.8, z), 0.03, '#e9dcc0', seg=6); c.warm.sphere((x, 0.815, z), 0.014, seg=5, rings=3)


def shakers(c, x, z):
    for (dx_, col) in ((0.0, '#e9e6de'), (0.06, '#4a4a4a')):
        ccyl(c.vc, (x + dx_, 0.74, z), (x + dx_, 0.81, z), 0.018, col, seg=6); ccyl(c.vm, (x + dx_, 0.81, z), (x + dx_, 0.828, z), 0.019, '#b9bec2', seg=6)
    c.vc.cbox(x + 0.11, x + 0.115, 0.74, 0.9, z - 0.05, z + 0.05, '#f1ece0')


if __name__ == '__main__':
    build()
