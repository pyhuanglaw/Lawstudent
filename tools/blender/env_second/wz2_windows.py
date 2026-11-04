# 溫州街第二批五間的櫥窗（WZ-SECOND-1104 v2，使用者 11-04 06:1x：「櫥窗太假……不可以把很多一樣的東西換顏色複製，參考圖裡是大小不同的東西才有真實感」）。
# wz_shopkit.py 最後 exec 進同一個命名空間（wz_street.py 的 SET、L、B、Matrix、g2b、_CP、_lathe、xf_cyl、CL、acc、SK、M、root 都在）。
# 規則（之後的櫥窗照這個做）：
#   ① 同一類東西每一個的寬、高、深、角度都不同（書的厚薄、高矮；水果的大小；瓶罐的高矮粗細）；
#   ② 排法不是等距：有空隙、有疊起來的、有斜靠的、有倒下來的；
#   ③ 顏色只在一組「真實會有的」顏色裡微調深淺，不是每一個換一種鮮豔的顏色；
#   ④ 每間至少要有三種以上形狀不同的東西（不是同一個方塊、同一顆球重複）。
# 只用在溫州街的 A3（溫州書屋）、B2（常在洗衣）、B6（阿忠鮮果）、B5（帝大紅茶）、B5i（夏日冰菓室）；公館 G02／G08／G09 等其他店照舊。
import colorsys as _cs
SK['brass'] = flat('wz_sf_brass', '#a8843e', rough=0.35, metal=0.4)   # 書屋的黃銅吊燈


def _jit(hexcol, rr, v=0.12, s=0.08, h=0.015):
    """同一個顏色的深淺、彩度、色相微調（舊書、紙箱、水果：同一種東西每一個顏色都差一點）"""
    r, g, b = (int(hexcol[i:i + 2], 16) / 255 for i in (1, 3, 5)); hh, ll, ss = _cs.rgb_to_hls(r, g, b)
    hh = (hh + rr.uniform(-h, h)) % 1.0; ll = min(0.97, max(0.03, ll * (1 + rr.uniform(-v, v)))); ss = min(1.0, max(0.0, ss * (1 + rr.uniform(-s, s))))
    r, g, b = _cs.hls_to_rgb(hh, ll, ss); return '#%02x%02x%02x' % (int(r * 255), int(g * 255), int(b * 255))


def _ell(cm, xf, col, x, y, z, rx, ry, rz, seg=8, rings=5):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * rx, v.co.y * rz, v.co.z * ry))
    _CP(cm, col).add_bm(bm, Matrix.Translation(g2b(*xf.p(x, y, z)))); bm.free()


def _obox(cm, xf, col, cx, cy, cz, w, h, d, ry=0.0, rz=0.0, rx=0.0):
    """任意角度的方塊（斜靠的書、倒下來的紙箱、仰著放的書）：中心 (cx,cy,cz)、寬 w（x）高 h（y）深 d（z）；ry 繞垂直軸、rz 往左右倒、rx 往前後仰"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    m = Matrix.Translation(g2b(*xf.p(cx, cy, cz))) @ Matrix.Rotation(getattr(xf, 'ry', 0.0) + ry, 4, 'Z') @ Matrix.Rotation(-rz, 4, 'Y') @ Matrix.Rotation(rx, 4, 'X') @ Matrix.Diagonal((w, d, h, 1.0))
    _CP(cm, col).add_bm(bm, m); bm.free()


BOOK_PAL = ['#6e2c28', '#2c4462', '#3a5236', '#b9a47c', '#e2d8c2', '#563826', '#8a6a3a', '#2a2a2c', '#9a4a32', '#5e6e7e', '#cdbd98', '#463a52', '#7c5a44', '#3d5a5a']


def book_row(cm, xf, rr, x0, x1, y, zfront, ymax, dmax=0.22):
    """一層書：一本一本不同的厚度、高度、深度、顏色（同一系列的會挨在一起、同一種顏色深淺不同）；
    中間有空隙、有一疊橫放的、有斜靠在旁邊的、偶爾一個書擋"""
    x = x0; prev_h = 0.2; series = None
    while x < x1 - 0.03:
        r = rr.random()
        if r < 0.05: x += rr.uniform(0.04, 0.14); continue                                           # 空隙
        if r < 0.11 and x1 - x > 0.3:                                                                    # 一疊橫放的
            n = rr.randint(2, 5); yy = y; L_ = rr.uniform(0.15, 0.25); dd = rr.uniform(0.12, min(dmax, 0.2))
            for k in range(n):
                t = rr.uniform(0.016, 0.04); w_ = L_ * rr.uniform(0.85, 1.0); off = rr.uniform(-0.015, 0.015)
                _obox(cm, xf, _jit(rr.choice(BOOK_PAL), rr), x + L_ / 2 + off, yy + t / 2, zfront - dd / 2, w_, t, dd * rr.uniform(0.9, 1.0), ry=rr.uniform(-0.06, 0.06)); yy += t
            x += L_ + 0.012; continue
        if r < 0.15 and prev_h > 0.18 and x1 - x > 0.25:                                                 # 斜靠的一本
            w_ = rr.uniform(0.02, 0.04); h_ = rr.uniform(0.18, min(0.29, ymax - y - 0.01)); a = rr.uniform(0.22, 0.4)
            _obox(cm, xf, _jit(rr.choice(BOOK_PAL), rr), x + math.sin(a) * h_ / 2 + w_ / 2, y + math.cos(a) * h_ / 2, zfront - 0.08, w_, h_, rr.uniform(0.13, 0.18), rz=a)
            x += math.sin(a) * h_ + w_ + 0.01; continue
        if r < 0.17:                                                                                       # 書擋（L 形鐵片）
            vb_ = lambda *a: xf_vbox(cm, xf, *a, r=0)
            vb_(x, x + 0.004, y, y + 0.14, zfront - 0.13, zfront - 0.02, '#3a3a3c'); vb_(x, x + 0.1, y, y + 0.004, zfront - 0.13, zfront - 0.02, '#3a3a3c'); x += 0.012; continue
        if series is None or rr.random() < 0.3:                                                          # 換一個系列（同一套書的厚度、高度、顏色接近）
            series = (rr.choice(BOOK_PAL), rr.choice((0.018, 0.026, 0.034, 0.045, 0.06)), rr.uniform(0.16, 0.3), rr.randint(1, 6))
        col, tw, th, _ = series
        w_ = tw * rr.uniform(0.75, 1.3); h_ = min(ymax - y - 0.012, th * rr.uniform(0.92, 1.06)); d_ = rr.uniform(0.11, dmax)
        _obox(cm, xf, _jit(col, rr), x + w_ / 2, y + h_ / 2, zfront - d_ / 2 - rr.uniform(0.0, 0.02), w_, h_, d_)
        if rr.random() < 0.35:                                                                             # 書背上的書名籤（淺色的一小條）
            ly = y + h_ * rr.uniform(0.55, 0.8); _obox(cm, xf, _jit('#e8dfc8', rr, 0.05), x + w_ / 2, ly, zfront - 0.0015 - rr.uniform(0, 0.02) + 0.002, w_ * 0.7, rr.uniform(0.02, 0.05), 0.003)
        x += w_ + rr.uniform(0.0, 0.004); prev_h = h_


def cover_book(cm, xf, rr, x, y, z, w, h, tilt, col):
    """封面朝外、往後仰的書（櫥窗）：封面一個顏色＋一塊淺色的書名區（不同的書不同的位置、大小）"""
    _obox(cm, xf, col, x, y + h / 2 * math.cos(tilt), z - h / 2 * math.sin(tilt), w, h, rr.uniform(0.012, 0.035), rx=-tilt)
    if rr.random() < 0.7:
        fy = rr.uniform(0.5, 0.8); fw = w * rr.uniform(0.5, 0.8); fh = h * rr.uniform(0.1, 0.22)
        _obox(cm, xf, _jit('#efe7d2', rr, 0.06), x, y + h * fy * math.cos(tilt), z - h * fy * math.sin(tilt) + 0.02, fw, fh, 0.002, rx=-tilt)


def _pendant_brass(xf, x, y, z, glow=True):
    _lathe(acc(SK['black']), xf, [(0.0, 0.0), (0.01, 0.0), (0.01, 0.4), (0.0, 0.4)], x, y + 0.18, z, seg=6)
    _lathe(acc(SK['lamp']), xf, [(0.0, 0.0), (0.05, 0.0), (0.0, 0.05)], x, y - 0.02, z, seg=10)
    _lathe(acc(SK['brass']), xf, [(0.04, 0.2), (0.07, 0.17), (0.17, 0.03), (0.18, 0.0), (0.16, 0.0), (0.06, 0.15), (0.03, 0.2)], x, y, z, seg=16)
    if glow: CL.glow(root, 'shopin', *xf.p(x, y - 0.1, z), color='rgba(255,220,160,1)', size=1.6, day=0.0, night=0.9)


# ---------------------------------------------------------------- A3 溫州書屋
def wz2_books(pid, cm, xf, iw, gz, zb, y0, yt, rr):
    vb = lambda *a, **k: xf_vbox(cm, xf, *a, **k); cp = lambda c: _CP(cm, c)
    wood, wood_dk = '#5a3a26', '#4a2e1e'
    # 後牆：五座高書櫃（櫃子之間有立板、頂上有一條飾板），每層一本一本的書
    n = 5; uw = (iw - 0.6) / n
    for u in range(n):
        ux0 = -iw / 2 + 0.3 + u * uw; ux1 = ux0 + uw - 0.04
        vb(ux0, ux1, y0, yt - 0.12, zb, zb + 0.02, wood_dk, r=0)                                               # 背板
        for sx in (ux0, ux1 - 0.035): vb(sx, sx + 0.035, y0, yt - 0.12, zb, zb + 0.3, wood, r=0)               # 立板
        vb(ux0, ux1, yt - 0.2, yt - 0.12, zb, zb + 0.32, wood, r=0); vb(ux0, ux1, y0, y0 + 0.12, zb, zb + 0.3, wood, r=0)   # 頂飾板、踢腳
        ys = [y0 + 0.12 + k * 0.37 for k in range(6)]
        for k, yy in enumerate(ys):
            vb(ux0 + 0.035, ux1 - 0.035, yy - 0.022, yy, zb, zb + 0.3, wood, r=0)
            if k < len(ys) - 1 or yy + 0.3 < yt - 0.2:
                book_row(cm, xf, rr, ux0 + 0.04, ux1 - 0.04, yy, zb + 0.29, min(yy + 0.35, yt - 0.21), dmax=0.24)
        if u == 2: vb(ux0 + 0.3, ux1 - 0.3, ys[4] + 0.02, ys[4] + 0.3, zb + 0.02, zb + 0.03, '#d8ccb0', r=0); vb(ux0 + 0.34, ux1 - 0.34, ys[4] + 0.06, ys[4] + 0.26, zb + 0.03, zb + 0.032, '#6a7a6a', r=0)   # 一格掛了一張框畫
    # 中間的平台：幾疊不同高度的書、兩本翻開立著的、一盞黃銅檯燈
    tx0, tx1, tz0, tz1 = -2.3, 0.4, gz - 1.75, gz - 1.0
    vb(tx0, tx1, y0, y0 + 0.72, tz0, tz1, wood, r=0.015); vb(tx0 - 0.03, tx1 + 0.03, y0 + 0.72, y0 + 0.76, tz0 - 0.03, tz1 + 0.03, '#7a5434', r=0.01)
    ty = y0 + 0.76; x = tx0 + 0.12
    while x < tx1 - 0.25:
        L_ = rr.uniform(0.15, 0.27); D_ = rr.uniform(0.11, 0.2); yy = ty; zc = rr.uniform(tz0 + 0.15, tz1 - 0.15)
        for k in range(rr.randint(1, 7)):
            t = rr.uniform(0.015, 0.045); _obox(cm, xf, _jit(rr.choice(BOOK_PAL), rr), x + L_ / 2 + rr.uniform(-0.01, 0.01), yy + t / 2, zc, L_ * rr.uniform(0.85, 1.0), t, D_ * rr.uniform(0.85, 1.0), ry=rr.uniform(-0.12, 0.12)); yy += t
        x += L_ + rr.uniform(0.04, 0.12)
    for (bx, tilt) in ((tx0 + 0.5, 0.35), (tx1 - 0.6, 0.28)):                                                 # 小書架上立著、封面朝外
        vb(bx - 0.1, bx + 0.1, ty, ty + 0.012, tz1 - 0.2, tz1 - 0.1, '#3a2a1e', r=0)
        cover_book(cm, xf, rr, bx, ty + 0.012, tz1 - 0.12, rr.uniform(0.15, 0.21), rr.uniform(0.21, 0.27), tilt, _jit(rr.choice(BOOK_PAL), rr))
    lx = tx1 - 0.2; lz = tz0 + 0.2                                                                             # 黃銅檯燈（綠燈罩）
    _lathe(cp('#a8843e'), xf, [(0.0, 0.0), (0.07, 0.0), (0.07, 0.02), (0.012, 0.03), (0.012, 0.34), (0.0, 0.34)], lx, ty, lz, seg=12)
    _obox(cm, xf, '#2f5a3e', lx, ty + 0.36, lz + 0.02, 0.24, 0.06, 0.11)
    CL.glow(root, 'shopin', *xf.p(lx, ty + 0.3, lz + 0.05), color='rgba(255,214,150,1)', size=1.0, day=0.0, night=0.9)
    # 櫥窗：玻璃後面的低平台，封面朝外的書（大小、角度、顏色都不同）、幾疊、一盆小植物、一個舊地球儀
    for (wx0, wx1) in ((-iw / 2 + 0.25, 0.75), (2.1, iw / 2 - 0.25)):
        vb(wx0, wx1, y0, y0 + 0.32, gz - 0.42, gz - 0.05, wood, r=0.01)
        x = wx0 + 0.15
        while x < wx1 - 0.2:
            r = rr.random()
            if r < 0.62:
                w_ = rr.uniform(0.13, 0.24); h_ = rr.uniform(0.18, 0.3)
                cover_book(cm, xf, rr, x + w_ / 2, y0 + 0.32, gz - 0.18 - rr.uniform(0, 0.12), w_, h_, rr.uniform(0.12, 0.4), _jit(rr.choice(BOOK_PAL), rr)); x += w_ + rr.uniform(0.04, 0.16)
            elif r < 0.85:
                L_ = rr.uniform(0.14, 0.22); yy = y0 + 0.32
                for k in range(rr.randint(2, 6)):
                    t = rr.uniform(0.015, 0.04); _obox(cm, xf, _jit(rr.choice(BOOK_PAL), rr), x + L_ / 2, yy + t / 2, gz - 0.25, L_ * rr.uniform(0.85, 1), t, rr.uniform(0.12, 0.18), ry=rr.uniform(-0.15, 0.15)); yy += t
                x += L_ + 0.08
            else:
                _lathe(cp('#a8653e'), xf, [(0.0, 0.0), (0.06, 0.0), (0.075, 0.11), (0.0, 0.11)], x + 0.08, y0 + 0.32, gz - 0.25, seg=10)
                for k in range(7): a = k * 0.9; _ell(cm, xf, _jit('#4f7a3a', rr, 0.2), x + 0.08 + math.cos(a) * 0.05, y0 + 0.5 + (k % 3) * 0.04, gz - 0.25 + math.sin(a) * 0.05, 0.06, 0.025, 0.035, seg=6, rings=3)
                x += 0.22
    gx_, gz_ = iw / 2 - 1.5, gz - 0.25                                                                         # 地球儀
    _lathe(cp('#3a2a1e'), xf, [(0.0, 0.0), (0.07, 0.0), (0.02, 0.05), (0.02, 0.12), (0.0, 0.12)], gx_, y0 + 0.32, gz_, seg=10)
    _ell(cm, xf, '#5e7f8e', gx_, y0 + 0.56, gz_, 0.11, 0.11, 0.11, seg=12, rings=8)
    # 櫃台（右邊）＋舊收銀機、一疊包書紙
    cx0, cx1 = iw / 2 - 1.5, iw / 2 - 0.35
    vb(cx0, cx1, y0, y0 + 0.92, gz - 1.25, gz - 0.7, wood_dk, r=0.015)
    vb(cx0 + 0.15, cx0 + 0.5, y0 + 0.92, y0 + 1.08, gz - 1.15, gz - 0.85, '#2c2c2c', r=0.01); _obox(cm, xf, '#1c2a34', cx0 + 0.33, y0 + 1.13, gz - 1.08, 0.24, 0.08, 0.02, rx=0.4)
    for k in range(4): _obox(cm, xf, _jit('#d8ccb0', rr), cx1 - 0.3, y0 + 0.93 + k * 0.006, gz - 0.95, 0.32, 0.005, 0.24, ry=rr.uniform(-0.1, 0.1))
    for x in (-iw / 3, 0.0, iw / 3): _pendant_brass(xf, x, yt - 0.55, gz - 1.3)


# ---------------------------------------------------------------- B2 常在洗衣
def wz2_laundry(pid, cm, xf, iw, gz, zb, y0, yt, rr):
    vb = lambda *a, **k: xf_vbox(cm, xf, *a, **k); cp = lambda c: _CP(cm, c)
    vb(-iw / 2 + 0.05, iw / 2 - 0.05, y0 + 0.95, y0 + 1.05, zb + 0.001, zb + 0.004, '#8ec5d6', r=0)            # 牆上的淺藍色腰帶（參考圖）
    def machine(x, y, w, h, d, big, kind):
        vb(x - w / 2, x + w / 2, y, y + h, zb, zb + d, '#f2f3f2' if kind == 'washer' else '#e9ebeb', r=0.015)
        cy = y + h * (0.45 if big else 0.5); rd = min(w, h) * 0.36
        xf_cyl(cp('#b5bbbf'), xf, (x, cy, zb + d), (x, cy, zb + d + 0.025), rd, seg=18); xf_cyl(cp('#2a2d30'), xf, (x, cy, zb + d + 0.025), (x, cy, zb + d + 0.03), rd * 0.8, seg=18)
        if rr.random() < 0.55:                                                                                 # 有的機器裡有衣服（不同顏色的一團）
            c = rr.choice(['#7a8aa0', '#c9c2b4', '#a8584a', '#4a5a4a', '#d8b860', '#5a6e8a']); _ell(cm, xf, _jit(c, rr), x + rr.uniform(-0.05, 0.05), cy - rd * 0.3, zb + d + 0.031, rd * 0.55, rd * 0.35, 0.004, seg=10, rings=4)
        vb(x - w / 2 + 0.05, x + w / 2 - 0.05, y + h - 0.12, y + h - 0.04, zb + d, zb + d + 0.006, '#c9d2d8', r=0)   # 控制面板
        vb(x + w / 2 - 0.16, x + w / 2 - 0.08, y + h - 0.1, y + h - 0.06, zb + d + 0.006, zb + d + 0.009, '#2a6fa8' if kind == 'washer' else '#c85a2a', r=0)
    # 後牆左半：下面三台大洗衣機、上面疊兩台烘衣機（大小、門的位置不一樣）；右半：洗衣精販賣機、兌幣機、付款機
    x = -iw / 2 + 0.45
    for j in range(3):
        machine(x, y0, 0.68, 0.92, 0.66, True, 'washer')
        if j < 2: machine(x, y0 + 0.94, 0.68, 0.78, 0.62, False, 'dryer')
        x += 0.72
    vx = x + 0.15
    vb(vx, vx + 0.72, y0, y0 + 1.82, zb, zb + 0.66, '#f4f4f2', r=0.02); vb(vx + 0.06, vx + 0.5, y0 + 0.75, y0 + 1.7, zb + 0.66, zb + 0.67, '#dfe8ec', r=0)
    for row in range(4):                                                                                       # 販賣機裡一排排不同高度、不同顏色的瓶子
        yy = y0 + 0.78 + row * 0.23; xx = vx + 0.09
        while xx < vx + 0.46:
            bw = rr.uniform(0.035, 0.065); bh = rr.uniform(0.09, 0.19); col = rr.choice(['#5aa8d8', '#e8eef2', '#f0c040', '#8a5ac8', '#4ab87a', '#e86a8a'])
            _lathe(cp(_jit(col, rr)), xf, [(0.0, 0.0), (bw / 2, 0.0), (bw / 2, bh * 0.72), (bw * 0.18, bh * 0.85), (bw * 0.18, bh), (0.0, bh)], xx + bw / 2, yy, zb + 0.6, seg=8); xx += bw + 0.012
    sx = vx + 0.8
    vb(sx, sx + 0.42, y0, y0 + 1.5, zb, zb + 0.4, '#b8bcc0', r=0.015); vb(sx + 0.08, sx + 0.34, y0 + 1.05, y0 + 1.3, zb + 0.4, zb + 0.405, '#1e3a52', r=0)   # 兌幣機（螢幕）
    vb(sx + 0.12, sx + 0.3, y0 + 0.75, y0 + 0.82, zb + 0.4, zb + 0.41, '#2a2a2c', r=0)
    vb(sx + 0.5, sx + 0.88, y0, y0 + 1.36, zb, zb + 0.34, '#4a78a8', r=0.015); vb(sx + 0.56, sx + 0.82, y0 + 0.95, y0 + 1.2, zb + 0.34, zb + 0.345, '#dfe8ec', r=0)   # 付款機（藍色）
    for (px_, py_) in ((-iw / 2 + 0.7, y0 + 1.9), (-iw / 2 + 1.6, y0 + 1.9)):                                    # 兩張藍框海報（不同大小）
        pw, ph = rr.uniform(0.3, 0.42), rr.uniform(0.4, 0.52)
        vb(px_ - pw / 2, px_ + pw / 2, py_, py_ + ph, zb + 0.001, zb + 0.012, '#3a78a8', r=0); vb(px_ - pw / 2 + 0.03, px_ + pw / 2 - 0.03, py_ + 0.03, py_ + ph - 0.03, zb + 0.012, zb + 0.014, '#eef4f6', r=0)
    # 中間的摺衣桌：兩個大小不同的籃子、不同高度的一疊衣服、洗衣精、一條毛巾
    tx0, tx1, tz0, tz1 = -1.0, 0.7, gz - 1.6, gz - 1.05
    vb(tx0, tx1, y0 + 0.8, y0 + 0.85, tz0, tz1, '#c9a878', r=0.01)
    for (lx, lz) in ((tx0 + 0.05, tz0 + 0.05), (tx1 - 0.08, tz0 + 0.05), (tx0 + 0.05, tz1 - 0.08), (tx1 - 0.08, tz1 - 0.08)): vb(lx, lx + 0.03, y0, y0 + 0.8, lz, lz + 0.03, '#a8a8a8', r=0)
    vb(tx0 + 0.05, tx1 - 0.05, y0 + 0.18, y0 + 0.2, tz0 + 0.05, tz1 - 0.05, '#c9a878', r=0)
    for (bx, bw, bh) in ((tx0 + 0.3, 0.44, 0.22), (tx0 + 0.85, 0.36, 0.17)):
        vb(bx - bw / 2, bx + bw / 2, y0 + 0.85, y0 + 0.85 + bh, tz0 + 0.1, tz0 + 0.1 + bw * 0.7, '#f4f4f2', r=0.02)
        for k in range(rr.randint(2, 4)): _ell(cm, xf, _jit(rr.choice(['#c9c2b4', '#7a8aa0', '#e8e4dc', '#a87a6a']), rr), bx + rr.uniform(-0.08, 0.08), y0 + 0.85 + bh + 0.02, tz0 + 0.1 + bw * 0.35, bw * 0.3, 0.05, bw * 0.25, seg=8, rings=4)
    yy = y0 + 0.85
    for k in range(rr.randint(4, 6)):                                                                          # 摺好的衣服一疊（每件大小、顏色不同）
        t = rr.uniform(0.025, 0.05); _obox(cm, xf, _jit(rr.choice(['#e8e4dc', '#5a6e8a', '#c95a4a', '#d8c890', '#7a7a7a']), rr), tx1 - 0.28, yy + t / 2, tz1 - 0.22, rr.uniform(0.26, 0.32), t, rr.uniform(0.2, 0.26), ry=rr.uniform(-0.1, 0.1)); yy += t
    _lathe(cp('#3a8ac8'), xf, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.16), (0.02, 0.2), (0.02, 0.23), (0.0, 0.23)], tx0 + 1.25, y0 + 0.85, tz1 - 0.12, seg=8)
    _obox(cm, xf, '#e8d8c8', tx0 + 0.6, y0 + 0.65, tz1 + 0.005, 0.3, 0.32, 0.01)                              # 掛在桌邊的毛巾
    # 店裡另外：窗邊的大盆栽、垃圾桶、牆上的時鐘
    _lathe(cp('#f2f2ee'), xf, [(0.0, 0.0), (0.16, 0.0), (0.19, 0.4), (0.0, 0.4)], -iw / 2 + 0.45, y0, gz - 0.5, seg=12)
    for k in range(11):
        a = k * 0.57; hh = rr.uniform(0.4, 0.85); xf_cyl(cp('#3f6a32'), xf, (-iw / 2 + 0.45, y0 + 0.4, gz - 0.5), (-iw / 2 + 0.45 + math.cos(a) * 0.12, y0 + 0.4 + hh, gz - 0.5 + math.sin(a) * 0.12), 0.006, seg=3)
        _ell(cm, xf, _jit('#4f8a3a', rr, 0.2), -iw / 2 + 0.45 + math.cos(a) * 0.2, y0 + 0.4 + hh, gz - 0.5 + math.sin(a) * 0.2, rr.uniform(0.08, 0.14), 0.02, rr.uniform(0.05, 0.08), seg=6, rings=3)
    xf_cyl(cp('#9aa0a6'), xf, (iw / 2 - 0.4, y0, gz - 1.2), (iw / 2 - 0.4, y0 + 0.5, gz - 1.2), 0.15, seg=12)
    xf_cyl(cp('#f4f4f2'), xf, (0.6, yt - 0.55, zb + 0.001), (0.6, yt - 0.55, zb + 0.03), 0.14, seg=16); xf_cyl(cp('#2a2a2c'), xf, (0.6, yt - 0.55, zb + 0.03), (0.6, yt - 0.55, zb + 0.032), 0.12, seg=16)


# ---------------------------------------------------------------- B6 阿忠鮮果
FRUIT = {'apple': ('#c8322a', 0.042), 'guava': ('#9cc35a', 0.045), 'orange': ('#ec8a26', 0.04), 'mango': ('#e8b23a', 0.055), 'papaya': ('#e88a3a', 0.08),
         'dragon': ('#d2386c', 0.06), 'pear': ('#f2ecd8', 0.048), 'grape': ('#4a2a4a', 0.012), 'lemon': ('#e8d84a', 0.032)}


def fruit_heap(cm, xf, rr, kind, x0, x1, z0, z1, y):
    """一箱水果堆：每顆大小差 ±15%、位置錯開、上面一層少一點、顏色深淺不同；葡萄一串一串、木瓜／芒果是橢圓的"""
    col, r = FRUIT[kind]
    if kind == 'grape':
        for k in range(int((x1 - x0) / 0.12) * 2):
            cx, cz = rr.uniform(x0 + 0.05, x1 - 0.05), rr.uniform(z0 + 0.05, z1 - 0.05)
            for q in range(14): _ell(cm, xf, _jit(col, rr, 0.18), cx + rr.uniform(-0.04, 0.04), y + 0.03 + rr.uniform(0, 0.05), cz + rr.uniform(-0.05, 0.05), 0.012, 0.014, 0.012, seg=5, rings=3)
        return
    nx = max(1, int((x1 - x0) / (2.1 * r))); nz = max(1, int((z1 - z0) / (2.1 * r)))
    for layer in range(2):
        for i in range(nx - layer):
            for j in range(nz - layer):
                if layer and rr.random() < 0.35: continue
                s = rr.uniform(0.85, 1.15); cx = x0 + r + (i + 0.5 * layer) * 2.05 * r + rr.uniform(-0.01, 0.01); cz = z0 + r + (j + 0.5 * layer) * 2.05 * r + rr.uniform(-0.01, 0.01)
                ry_ = r * s * (1.35 if kind in ('mango', 'papaya') else (1.1 if kind == 'pear' else 0.95)); cy = y + ry_ + layer * r * 1.5
                _ell(cm, xf, _jit(col, rr, 0.16, 0.1, 0.02), cx, cy, cz, r * s * (0.85 if kind in ('mango', 'papaya') else 1.0), ry_, r * s, seg=8, rings=5)
                if kind == 'dragon': _ell(cm, xf, '#7ab040', cx, cy + ry_ * 0.85, cz, r * 0.25, r * 0.3, r * 0.25, seg=5, rings=3)


def wz2_fruit(pid, cm, xf, iw, gz, zb, y0, yt, rr):
    vb = lambda *a, **k: xf_vbox(cm, xf, *a, **k); cp = lambda c: _CP(cm, c)
    # 左後：冷藏櫃（切好的水果，一盒一盒不同大小、顏色）
    fx0, fx1 = -iw / 2 + 0.4, -iw / 2 + 2.0
    for (a0, a1, b0, b1) in ((fx0, fx0 + 0.07, y0, y0 + 1.95), (fx1 - 0.07, fx1, y0, y0 + 1.95), (fx0, fx1, y0, y0 + 0.14), (fx0, fx1, y0 + 1.82, y0 + 1.95)):   # 冷藏櫃的框（中間是玻璃門，看得到裡面）
        vb(a0, a1, b0, b1, zb, zb + 0.62, '#e8e8e4', r=0.01)
    xf.box(acc(SK['lamp_cool']), fx0 + 0.07, fx1 - 0.07, y0 + 0.14, y0 + 1.82, zb + 0.02, zb + 0.025)   # 背板的燈（亮的是後面，前面是玻璃）
    xf.box(acc(M['glass']), fx0 + 0.07, fx1 - 0.07, y0 + 0.14, y0 + 1.82, zb + 0.6, zb + 0.605); vb(fx0 + 0.78, fx0 + 0.82, y0 + 0.6, y0 + 1.3, zb + 0.605, zb + 0.64, '#c9ced2', r=0)
    for t in range(4):
        yy = y0 + 0.3 + t * 0.4; vb(fx0 + 0.08, fx1 - 0.08, yy - 0.015, yy, zb + 0.05, zb + 0.6, '#c9ced2', r=0); xx = fx0 + 0.12
        while xx < fx1 - 0.2:
            bw = rr.uniform(0.12, 0.22); bh = rr.uniform(0.05, 0.1); col = rr.choice(['#e84a3a', '#f0c040', '#9cc35a', '#f08030', '#e8e0c0', '#d2386c'])
            vb(xx, xx + bw, yy, yy + bh, zb + 0.35, zb + 0.55, '#f4f4f2', r=0); vb(xx + 0.01, xx + bw - 0.01, yy + bh - 0.012, yy + bh - 0.002, zb + 0.36, zb + 0.54, _jit(col, rr), r=0); xx += bw + rr.uniform(0.02, 0.05)
    # 後牆：鐵架上的紙箱（大小、顏色、堆法都不一樣；有的倒著、有的貼了紅標）
    sx0, sx1 = fx1 + 0.4, iw / 2 - 0.35
    for t in range(3):
        yy = y0 + 0.05 + t * 0.65; vb(sx0, sx1, yy - 0.02, yy, zb, zb + 0.5, '#8a8e92', r=0); xx = sx0 + 0.05
        while xx < sx1 - 0.25:
            bw = rr.uniform(0.25, 0.55); bh = rr.uniform(0.18, 0.5) if t < 2 else rr.uniform(0.15, 0.35); bd = rr.uniform(0.3, 0.46)
            if xx + bw > sx1: break
            rot = rr.choice((0.0, 0.0, 0.0, rr.uniform(-0.15, 0.15)))
            _obox(cm, xf, _jit('#b89466', rr, 0.15, 0.15), xx + bw / 2, yy + bh / 2, zb + bd / 2 + 0.02, bw, bh, bd, ry=rot)
            if rr.random() < 0.5: _obox(cm, xf, rr.choice(['#c8322a', '#2a6a3a', '#f0c040', '#ffffff']), xx + bw / 2, yy + bh * rr.uniform(0.4, 0.7), zb + bd + 0.022, bw * rr.uniform(0.3, 0.6), bh * rr.uniform(0.2, 0.35), 0.003, ry=rot)
            if rr.random() < 0.3 and yy + bh + 0.2 < yy + 0.63:                                               # 上面再疊一個小的
                b2 = bw * rr.uniform(0.5, 0.85); h2 = rr.uniform(0.1, 0.2); _obox(cm, xf, _jit('#c8a070', rr, 0.15), xx + bw / 2 + rr.uniform(-0.04, 0.04), yy + bh + h2 / 2, zb + bd / 2, b2, h2, bd * 0.8, ry=rr.uniform(-0.2, 0.2))
            xx += bw + rr.uniform(0.02, 0.1)
    # 中間後面：收銀櫃台（電子秤、收銀機、一捲粉紅袋子、計算機）
    cx0, cx1, cz0, cz1 = -0.9, 0.9, gz - 1.9, gz - 1.35
    vb(cx0, cx1, y0, y0 + 0.9, cz0, cz1, '#b48a5e', r=0.015); vb(cx0 - 0.02, cx1 + 0.02, y0 + 0.9, y0 + 0.93, cz0 - 0.02, cz1 + 0.02, '#c9ced2', r=0.008)
    vb(cx0 + 0.2, cx0 + 0.55, y0 + 0.93, y0 + 1.0, cz0 + 0.2, cz1 - 0.1, '#f2f2ee', r=0.01); vb(cx0 + 0.24, cx0 + 0.51, y0 + 1.0, y0 + 1.01, cz0 + 0.22, cz1 - 0.12, '#c9ced2', r=0)   # 秤
    vb(cx1 - 0.55, cx1 - 0.2, y0 + 0.93, y0 + 1.08, cz0 + 0.1, cz0 + 0.4, '#2c2c2c', r=0.01); _obox(cm, xf, '#1c2a34', cx1 - 0.37, y0 + 1.15, cz0 + 0.22, 0.26, 0.12, 0.02, rx=0.5)
    xf_cyl(cp('#e88aa8'), xf, (cx0 - 0.15, y0 + 1.0, cz1 - 0.1), (cx0 - 0.15, y0 + 1.35, cz1 - 0.1), 0.06, seg=10); xf_cyl(cp('#f4f4f2'), xf, (cx0 - 0.3, y0 + 1.0, cz1 - 0.1), (cx0 - 0.3, y0 + 1.28, cz1 - 0.1), 0.05, seg=10)
    # 地上：店裡的幾箱水果（不同大小的箱子放在棧板上，每箱不同的水果）
    plan = [('mango', -iw / 2 + 2.3, 0.55, 0.42), ('papaya', -iw / 2 + 2.95, 0.6, 0.45), ('dragon', 1.25, 0.5, 0.4), ('grape', 1.85, 0.42, 0.36), ('pear', 2.4, 0.5, 0.4), ('lemon', 3.0, 0.38, 0.34), ('guava', 3.5, 0.46, 0.38)]
    for (kind, x, w, d) in plan:
        if x + w / 2 > iw / 2 - 0.2: continue
        z = gz - 1.1 + rr.uniform(-0.15, 0.15); h = rr.uniform(0.22, 0.34)
        vb(x - w / 2 - 0.03, x + w / 2 + 0.03, y0, y0 + 0.1, z - d / 2 - 0.03, z + d / 2 + 0.03, '#a8865a', r=0)
        vb(x - w / 2, x + w / 2, y0 + 0.1, y0 + 0.1 + h, z - d / 2, z + d / 2, _jit('#c9a46a', rr), r=0)
        fruit_heap(cm, xf, rr, kind, x - w / 2 + 0.02, x + w / 2 - 0.02, z - d / 2 + 0.02, z + d / 2 - 0.02, y0 + 0.1 + h)
    for k in range(3):                                                                                         # 掛在架子上的香蕉（一串大、一串小）
        hx = sx0 + 0.3 + k * 0.6; hy = y0 + 2.05; xf_cyl(cp('#5a5a5a'), xf, (hx, hy + 0.25, zb + 0.55), (hx, hy, zb + 0.55), 0.004, seg=3)
        n_ = rr.randint(5, 9)
        for q in range(n_):
            a = (q / n_ - 0.5) * 1.6; L_ = rr.uniform(0.13, 0.19); xf_cyl(cp(_jit('#efcd3c', rr, 0.08)), xf, (hx, hy, zb + 0.55), (hx + math.sin(a) * L_, hy - L_ * 0.8, zb + 0.55 + math.cos(a) * 0.04), 0.02, seg=5)


# ---------------------------------------------------------------- B5 帝大紅茶（_tea 的店裡：三個大小不同的茶桶、不同高度的杯塔、封口機、冰桶、罐子）
def wz2_tea(px, w, zf, zb, cm, rr):
    vb = lambda *a, **k: xf_vbox(cm, px, *a, **k); cp = lambda c: _CP(cm, c)
    px.box(acc(SK['steel']), -w / 2 + 0.3, w / 2 - 0.3, 0.86, 0.9, zb, zb + 0.62)
    vb(-w / 2 + 0.3, w / 2 - 0.3, 0.06, 0.86, zb + 0.02, zb + 0.6, '#c9ccce', 0.9)
    x = -1.7
    for (r_, h_) in ((0.2, 0.6), (0.17, 0.52), (0.15, 0.46)):                                                  # 茶桶（不鏽鋼、蓋子、黑色水龍頭、紅標）
        _lathe(acc(SK['steel']), px, [(0.0, 0.0), (r_, 0.0), (r_, h_), (r_ * 0.9, h_ + 0.03), (r_ * 0.3, h_ + 0.06), (0.04, h_ + 0.09), (0.0, h_ + 0.09)], x, 0.9, zb + 0.32, seg=16)
        vb(x - 0.025, x + 0.025, 0.98, 1.03, zb + 0.32 + r_, zb + 0.32 + r_ + 0.06, '#1e1e1e', r=0); vb(x - 0.08, x + 0.08, 0.9 + h_ * 0.55, 0.9 + h_ * 0.7, zb + 0.32 + r_ - 0.01, zb + 0.32 + r_ + 0.002, '#7a2a2c', r=0)
        x += 2 * r_ + rr.uniform(0.06, 0.12)
    sx = x + 0.15                                                                                              # 封口機（白、紅）
    vb(sx, sx + 0.36, 0.9, 1.35, zb + 0.12, zb + 0.5, '#f2f2ee', r=0.02); vb(sx + 0.04, sx + 0.32, 1.12, 1.2, zb + 0.5, zb + 0.505, '#c8322a', r=0); vb(sx + 0.08, sx + 0.28, 0.9, 1.0, zb + 0.5, zb + 0.6, '#d8dadb', r=0.01)
    vb(sx + 0.55, sx + 1.15, 0.9, 1.08, zb + 0.08, zb + 0.56, '#e9ecef', r=0.02)                              # 冰桶＋冰塊
    for k in range(14): _obox(cm, px, '#f4f8fa', sx + 0.6 + rr.uniform(0.0, 0.5), 1.08 + rr.uniform(0, 0.03), zb + 0.12 + rr.uniform(0, 0.4), 0.04, 0.035, 0.04, ry=rr.uniform(0, 1.5), rx=rr.uniform(0, 0.8))
    # 櫃台上：不同高度的透明杯塔、吸管筒
    for (cx_, ch) in ((-2.6, 0.48), (-2.42, 0.36), (-2.26, 0.56), (-2.1, 0.3)):
        xf_cyl(acc(M['glass']), px, (cx_, 1.03, zf - 0.32), (cx_, 1.03 + ch, zf - 0.32), rr.uniform(0.04, 0.05), seg=10)
    xf_cyl(cp('#8a6a3a'), px, (-1.75, 1.03, zf - 0.3), (-1.75, 1.18, zf - 0.3), 0.045, seg=8)
    for k in range(9): xf_cyl(cp(rr.choice(['#e8e4dc', '#c8322a', '#2a2a2a'])), px, (-1.75 + rr.uniform(-0.02, 0.02), 1.15, zf - 0.3 + rr.uniform(-0.02, 0.02)), (-1.75 + rr.uniform(-0.04, 0.04), 1.36, zf - 0.3 + rr.uniform(-0.04, 0.04)), 0.004, seg=3)
    # 後牆：白磁磚、一層木層架（大小不同的茶葉罐、玻璃罐、量杯）、掛著的毛巾、一盞吊燈
    px.box(acc(SK['f_white']), -w / 2 + 0.24, w / 2 - 0.24, 0.0, 2.95, zb - 0.05, zb)
    for y in (1.62, 2.05):
        px.box(acc(SK['wood_lt']), -w / 2 + 0.4, 1.2, y, y + 0.03, zb, zb + 0.28); xx = -w / 2 + 0.5
        while xx < 1.1:
            jr = rr.uniform(0.04, 0.08); jh = rr.uniform(0.1, 0.26); col = rr.choice(['#8a5a3a', '#c9a46a', '#d8d2c4', '#3a3a3a', '#b8bcc0'])
            _lathe(cp(_jit(col, rr)), px, [(0.0, 0.0), (jr, 0.0), (jr, jh), (jr * 0.8, jh + 0.015), (0.0, jh + 0.015)], xx + jr, y + 0.03, zb + 0.15, seg=10); xx += 2 * jr + rr.uniform(0.02, 0.08)
    vb(1.5, 1.82, 1.3, 1.75, zb + 0.01, zb + 0.02, '#f2f0ea', r=0)
    _lathe(cp('#2a2a2c'), px, [(0.0, 0.0), (0.04, 0.0), (0.2, -0.16), (0.21, -0.17), (0.0, -0.12)], 0.2, 2.6, (zf + zb) / 2, seg=14)
    CL.glow(root, 'shopin', *px.p(0.2, 2.35, (zf + zb) / 2), color='rgba(255,220,160,1)', size=1.4, day=0.0, night=0.9)


# ---------------------------------------------------------------- B5i 夏日冰菓室（窗台上的東西＋後面的層架）
def wz2_ice(px, w, zf, zb, cm, rr):
    vb = lambda *a, **k: xf_vbox(cm, px, *a, **k); cp = lambda c: _CP(cm, c)
    ly = 0.98; lz = zf - 0.28
    # 古早剉冰機（鑄鐵機身、大輪子、冰盤），放在窗台左邊
    mx = -2.75
    vb(mx - 0.16, mx + 0.16, ly, ly + 0.08, lz - 0.14, lz + 0.14, '#c9ccce', r=0.01)
    xf_cyl(cp('#b8bcc0'), px, (mx - 0.1, ly + 0.08, lz), (mx - 0.1, ly + 0.5, lz), 0.035, seg=8)
    vb(mx - 0.14, mx + 0.12, ly + 0.45, ly + 0.58, lz - 0.1, lz + 0.1, '#d8dadb', r=0.015); vb(mx - 0.06, mx + 0.04, ly + 0.5, ly + 0.55, lz + 0.1, lz + 0.11, '#c8322a', r=0)
    _lathe(cp('#e8eef0'), px, [(0.0, 0.0), (0.09, 0.0), (0.11, 0.03), (0.0, 0.03)], mx, ly + 0.08, lz, seg=12)
    xf_cyl(cp('#8a8e92'), px, (mx + 0.16, ly + 0.42, lz - 0.02), (mx + 0.16, ly + 0.42, lz + 0.02), 0.13, seg=16); xf_cyl(cp('#c9ccce'), px, (mx + 0.16, ly + 0.42, lz + 0.02), (mx + 0.16, ly + 0.42, lz + 0.03), 0.03, seg=8)
    xf_cyl(cp('#3a3a3a'), px, (mx + 0.16, ly + 0.42, lz + 0.03), (mx + 0.16 + 0.12, ly + 0.5, lz + 0.05), 0.008, seg=4)
    # 配料玻璃罐（五個，粗細高矮不同，裡面是芒果、紅豆、芋頭、粉圓、鳳梨）
    x = -2.4
    for col in ('#f0b030', '#6a2a24', '#b8a0c6', '#3a2a22', '#e6cc5a'):
        jr = rr.uniform(0.055, 0.085); jh = rr.uniform(0.14, 0.24)
        _lathe(acc(M['glass']), px, [(0.0, 0.0), (jr, 0.0), (jr, jh), (jr * 0.85, jh + 0.02), (0.0, jh + 0.02)], x + jr, ly, lz, seg=12)
        _lathe(cp(_jit(col, rr)), px, [(0.0, 0.0), (jr * 0.92, 0.0), (jr * 0.92, jh * rr.uniform(0.45, 0.8)), (0.0, jh * 0.8)], x + jr, ly + 0.005, lz, seg=10)
        _lathe(cp('#d8dadb'), px, [(0.0, 0.0), (jr * 0.88, 0.0), (jr * 0.88, 0.03), (0.0, 0.03)], x + jr, ly + jh + 0.02, lz, seg=10)
        x += 2 * jr + rr.uniform(0.02, 0.05)
    # 糖漿瓶（六支，高矮、顏色不同）
    for col in ('#c8322a', '#2f8a4a', '#f0c040', '#8a4a2a', '#e86a8a', '#d8d2c4'):
        br = rr.uniform(0.025, 0.04); bh = rr.uniform(0.18, 0.3)
        _lathe(cp(_jit(col, rr, 0.1)), px, [(0.0, 0.0), (br, 0.0), (br, bh * 0.7), (br * 0.4, bh * 0.85), (br * 0.4, bh), (0.0, bh)], x + br, ly, lz - rr.uniform(0.0, 0.06), seg=8)
        x += 2 * br + rr.uniform(0.015, 0.04)
    # 玻璃碗：三個疊著、一碗已經做好的芒果剉冰
    for k in range(3): _lathe(acc(M['glass']), px, [(0.03, 0.0), (0.06, 0.005), (0.09, 0.06), (0.095, 0.065), (0.0, 0.03)], x + 0.1, ly + k * 0.025, lz, seg=12)
    x += 0.24; _lathe(acc(M['glass']), px, [(0.03, 0.0), (0.06, 0.005), (0.09, 0.06), (0.095, 0.065), (0.0, 0.03)], x + 0.1, ly, lz + 0.02, seg=12)
    _ell(cm, px, '#f4f0e8', x + 0.1, ly + 0.09, lz + 0.02, 0.085, 0.07, 0.085, seg=10, rings=5)
    for k in range(6): _obox(cm, px, _jit('#f0b030', rr), x + 0.1 + rr.uniform(-0.05, 0.05), ly + 0.15 + rr.uniform(0, 0.02), lz + 0.02 + rr.uniform(-0.05, 0.05), 0.03, 0.025, 0.03, ry=rr.uniform(0, 1.5))
    # 後面：兩層木架（大小不同的鐵罐、鍋子、茶壺），吊燈（琺瑯燈罩）
    for y in (1.5, 1.95):
        px.box(acc(SK['wood_lt']), -w / 2 + 0.35, w / 2 - 0.35, y, y + 0.03, zb, zb + 0.3); xx = -w / 2 + 0.45
        while xx < w / 2 - 0.5:
            kind = rr.random(); r_ = rr.uniform(0.05, 0.12); h_ = rr.uniform(0.08, 0.24)
            if kind < 0.5: _lathe(cp(_jit(rr.choice(['#c9ccce', '#b8a888', '#8a6a4a']), rr)), px, [(0.0, 0.0), (r_, 0.0), (r_, h_), (0.0, h_)], xx + r_, y + 0.03, zb + 0.16, seg=12)
            elif kind < 0.8: _lathe(cp('#c9ccce'), px, [(0.0, 0.0), (r_ * 1.2, 0.0), (r_ * 1.3, h_ * 0.6), (r_ * 1.35, h_ * 0.62), (0.0, h_ * 0.62)], xx + r_, y + 0.03, zb + 0.16, seg=14)
            else: _ell(cm, px, '#d8d2c4', xx + r_, y + 0.03 + h_ * 0.5, zb + 0.16, r_, h_ * 0.5, r_, seg=10, rings=6)
            xx += 2 * r_ + rr.uniform(0.04, 0.14)
    _lathe(cp('#f2f0ea'), px, [(0.0, 0.0), (0.03, 0.0), (0.18, -0.14), (0.185, -0.15), (0.0, -0.1)], -1.4, 2.55, zf - 0.7, seg=14)
    CL.glow(root, 'shopin', *px.p(-1.4, 2.3, zf - 0.7), color='rgba(255,226,170,1)', size=1.3, day=0.0, night=0.9)


WZ2_IN = {'A3': wz2_books, 'B2': wz2_laundry, 'B6': wz2_fruit}
