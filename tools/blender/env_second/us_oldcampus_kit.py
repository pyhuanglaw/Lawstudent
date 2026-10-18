"""美國交換：校門西邊、後面的老校區（SCN-US-02 第三版；LAWWW2-C 2026-10-18）。只是背景：走不到、進不去（使用者 10-18 03:3x「其他地區你可以就是照樣子設計，但是可以先不要開放進出」）。
照使用者給的空拍圖（校門在圖的右下角；圖片不進 repo，文字描述在 docs/art-rebuild/second_ai/HANDOFF.md 的 ★★）＋網路查到的文字（石灰岩牆、紅瓦屋頂、灰色石板瓦的老建築）：
  tile_hall    ：沿街的大建築——石灰岩牆、紅瓦四坡屋頂、沿街和東側一排老虎窗；屋頂圍著中庭，中間是白色平屋頂＋一塊玻璃天窗（從上面看是口字形）。
  tower_hall   ：它西北邊——長形的紅瓦山牆屋頂大廳、東北角一座方形塔樓（四角錐屋頂）、西側一個弧形的平台（石欄杆）。
  castle_hall  ：圖上方的老建築——灰色粗面石材、深灰石板瓦屋頂、一角一座圓形塔樓（圓錐屋頂），像城堡。
  stone_block  ：左邊較高的多層石材建築（平屋頂、女兒牆）。
沒有真實校名、建築名、標誌（D77）。座標同 us_campus_kit：B.group 的 location＝(cx, −cz, 0)、rotation z＝yaw；建築自己的 (u, v)＝遊戲 (x, z)，正面朝 +v（南、朝街）。"""
import math, random
import lib2 as L
from lib2 import B, Mesh
import us_campus_kit as UK
from us_campus_kit import Face, poly, wall_with_windows

FH = 4.0


def materials(prefix='uso_', base=None):
    M = dict(base) if base else UK.materials(prefix)                                   # base＝同一個 GLB 已經有的石灰岩、石板瓦…（共用，不重複貼圖）
    M['tile'] = L.pbr(prefix + 'clay_tile', 'grey_roof_tiles', tile=1.0, target='#9a4a32', sat=0.9, normal=0.7, maps=('diff', 'nor'), rough_value=0.7)   # 紅瓦（石板瓦的貼圖改色）
    M['flat'] = L.flat(prefix + 'flat_roof', '#e6e4de', rough=0.9)
    M['sky'] = L.flat(prefix + 'skylight', '#9fb4bf', rough=0.05, metal=0.3)
    M['rough'] = L.pbr(prefix + 'rough_stone', 'japanese_stone_wall', tile=2.0, target='#8d8a84', contrast=0.9, normal=0.9, maps=('diff', 'nor'), rough_value=0.95)   # 灰色粗面石材
    return M


def _mk(name, M, keys):
    return {k: Mesh(f'{name}_{k}', M[k]) for k in keys}


def _box_walls(mk, u0, u1, v0, v1, H, wins_fn, mat='lime'):
    """四面牆（外側有窗）：wins_fn(side, length) → [(a0, a1, y0, ys, 'rect')]；牆厚 0.45、往內的面不做（屋頂、平屋頂蓋住）"""
    sides = {'S': (Face((u0, v1), (1, 0), (0, 1)), u1 - u0), 'N': (Face((u1, v0), (-1, 0), (0, -1)), u1 - u0),
             'E': (Face((u1, v1), (0, -1), (1, 0)), v1 - v0), 'W': (Face((u0, v0), (0, 1), (-1, 0)), v1 - v0)}
    for k, (F, ln) in sides.items():
        mm = dict(mk); mm['lime'] = mk[mat]
        wall_with_windows(mm, F, ln, H, wins_fn(k, ln), detail=0)
        poly(mk['lime_dark'], F, [(0, 0), (ln, 0), (ln, 0.9), (0, 0.9)], 0.06)       # 石頭基座（往外 6 cm）
        poly(mk['trim'], F, [(0, H - 0.35), (ln, H - 0.35), (ln, H), (0, H)], 0.1)  # 簷口的石材帶


def _rows(ln, floors, bay=3.2, w=1.3, h=2.0, skip=()):
    n = max(1, int(ln / bay)); out = []
    for f in range(floors):
        y0 = 1.2 + f * FH
        for k in range(n):
            if k in skip and f == 0: continue
            c = (k + 0.5) * ln / n; out.append((c - w / 2, c + w / 2, y0, y0 + h, 'rect'))
    return out


def hip_roof(m, u0, u1, v0, v1, yE, yR, over=0.5):
    """四坡屋頂（屋脊沿長邊）；over＝出簷"""
    u0 -= over; u1 += over; v0 -= over; v1 += over; yE -= over * 0.45
    w, d = u1 - u0, v1 - v0
    if w >= d:
        r0, r1 = u0 + d / 2, u1 - d / 2; vm = (v0 + v1) / 2
        m.quad([(u0, yE, v1), (u1, yE, v1), (r1, yR, vm), (r0, yR, vm)]); m.quad([(u1, yE, v0), (u0, yE, v0), (r0, yR, vm), (r1, yR, vm)])
        m.quad([(u1, yE, v1), (u1, yE, v0), (r1, yR, vm)]); m.quad([(u0, yE, v0), (u0, yE, v1), (r0, yR, vm)])
    else:
        r0, r1 = v0 + w / 2, v1 - w / 2; um = (u0 + u1) / 2
        m.quad([(u1, yE, v1), (u1, yE, v0), (um, yR, r0), (um, yR, r1)]); m.quad([(u0, yE, v0), (u0, yE, v1), (um, yR, r1), (um, yR, r0)])
        m.quad([(u0, yE, v1), (u1, yE, v1), (um, yR, r1)]); m.quad([(u1, yE, v0), (u0, yE, v0), (um, yR, r0)])


def dormer(mk, x, yb, z, nz, w=1.4, h=1.5, d=1.4):
    """老虎窗：朝 nz（+1 南、−1 北）的小山牆屋頂盒子，正面一扇窗"""
    s = nz; zf = z + s * 0.05
    mk['lime'].box(x - w / 2, x + w / 2, yb, yb + h, min(zf, zf - s * d), max(zf, zf - s * d))
    mk['glass'].quad([(x - w / 2 + 0.25, yb + 0.25, zf + s * 0.01), (x + w / 2 - 0.25, yb + 0.25, zf + s * 0.01), (x + w / 2 - 0.25, yb + h - 0.2, zf + s * 0.01), (x - w / 2 + 0.25, yb + h - 0.2, zf + s * 0.01)][:: s])
    yt = yb + h + 0.6
    mk['tile'].quad([(x - w / 2 - 0.15, yb + h, zf + s * 0.15), (x, yt, zf + s * 0.15), (x, yt, zf - s * d), (x - w / 2 - 0.15, yb + h, zf - s * d)][:: s])
    mk['tile'].quad([(x, yt, zf + s * 0.15), (x + w / 2 + 0.15, yb + h, zf + s * 0.15), (x + w / 2 + 0.15, yb + h, zf - s * d), (x, yt, zf - s * d)][:: s])
    mk['trim'].quad([(x - w / 2, yb + h, zf + s * 0.02), (x + w / 2, yb + h, zf + s * 0.02), (x, yt - 0.1, zf + s * 0.02)][:: s])


def tile_hall(root, name, cx, cz, W=34.0, D=26.0, floors=3, yaw=0.0, M=None, court=(14.0, 10.0)):
    """沿街的大建築：石灰岩牆、紅瓦屋頂圍著中庭、中間白色平屋頂＋玻璃天窗；沿街（南）和東側一排老虎窗；正面中間一個石頭門廊"""
    M = M or materials(); g = B.group(name, root, {'kind': 'us_tile_hall'}); g.location = (cx, -cz, 0.0); g.rotation_euler = (0.0, 0.0, yaw)
    mk = _mk(name, M, ('lime', 'lime_dark', 'trim', 'glass', 'lead', 'door', 'tile', 'flat', 'sky'))
    u0, u1, v0, v1 = -W / 2, W / 2, -D / 2, D / 2; H = floors * FH + 0.6
    _box_walls(mk, u0, u1, v0, v1, H, lambda k, ln: _rows(ln, floors, skip=((int(ln / 3.2) // 2,) if k == 'S' else ())))
    # 正面中間的門廊（石頭、三個方開口）
    F = Face((u0, v1), (1, 0), (0, 1)); c = W / 2
    mk['lime_dark'].box(-3.9, 3.9, 0.0, 0.18, v1, v1 + 2.6)                                    # 台階
    for (p0, p1) in ((-3.6, -3.0), (-1.4, -0.8), (0.8, 1.4), (3.0, 3.6)): mk['trim'].box(p0, p1, 0.18, 3.4, v1 + 1.6, v1 + 2.2)   # 四根方柱（三個開口）
    mk['trim'].box(-3.6, 3.6, 3.4, 4.6, v1, v1 + 2.2); mk['trim'].box(-3.75, 3.75, 4.6, 4.8, v1 - 0.1, v1 + 2.35)                 # 楣、簷
    mk['door'].box(-1.0, 1.0, 0.18, 3.0, v1, v1 + 0.06)                                         # 門（門廊裡面）
    # 屋頂：外圈四坡往上到中庭邊（yR），中庭是平屋頂＋天窗
    cw, cd = court; yE = H; yR = H + 4.6; over = 0.5                                   # 坡陡一點：街上看得到紅瓦（第一版 +3.2 從人行道幾乎看不到屋頂）
    a0, a1, b0, b1 = -cw / 2, cw / 2, -cd / 2, cd / 2
    U0, U1, V0, V1 = u0 - over, u1 + over, v0 - over, v1 + over; yE2 = yE - over * 0.45
    t = mk['tile']
    t.quad([(U0, yE2, V1), (U1, yE2, V1), (a1, yR, b1), (a0, yR, b1)]); t.quad([(U1, yE2, V0), (U0, yE2, V0), (a0, yR, b0), (a1, yR, b0)])
    t.quad([(U1, yE2, V1), (U1, yE2, V0), (a1, yR, b0), (a1, yR, b1)]); t.quad([(U0, yE2, V0), (U0, yE2, V1), (a0, yR, b1), (a0, yR, b0)])
    mk['flat'].quad([(a0, yR, b1), (a1, yR, b1), (a1, yR, b0), (a0, yR, b0)])
    mk['sky'].box(-cw * 0.3, cw * 0.3, yR, yR + 0.5, -cd * 0.3, cd * 0.3)
    mk['trim'].box(a0 - 0.1, a1 + 0.1, yR - 0.05, yR + 0.25, b1 - 0.1, b1 + 0.1); mk['trim'].box(a0 - 0.1, a1 + 0.1, yR - 0.05, yR + 0.25, b0 - 0.1, b0 + 0.1)
    # 老虎窗：沿街（南）一排、東側一排
    sl = (yR - yE) / ((V1 - b1))
    for k in range(int(W / 4.2)):
        x = u0 + (k + 0.5) * W / int(W / 4.2)
        if abs(x) < 4.5: continue
        dormer(mk, x, yE + 0.9, v1 - 1.2, 1)
    for k in range(int(D / 4.6)):
        z = v0 + (k + 0.5) * D / int(D / 4.6); xd = u1 - 1.2
        mk['lime'].box(xd - 1.4, xd + 0.05, yE + 0.9, yE + 2.4, z - 0.7, z + 0.7)
        mk['glass'].quad([(xd + 0.06, yE + 1.15, z + 0.45), (xd + 0.06, yE + 1.15, z - 0.45), (xd + 0.06, yE + 2.2, z - 0.45), (xd + 0.06, yE + 2.2, z + 0.45)])
        t.quad([(xd + 0.2, yE + 2.4, z + 0.85), (xd + 0.2, yE + 2.4, z - 0.85), (xd - 1.4, yE + 2.6, z - 0.85), (xd - 1.4, yE + 2.6, z + 0.85)])
    for m in mk.values(): m.finish(g, uv=True)
    return g


def tower_hall(root, name, cx, cz, W=30.0, D=13.0, floors=2, yaw=0.0, M=None, tower=(7.0, 24.0)):
    """長形的紅瓦山牆屋頂大廳（陡、兩端山牆）＋東北角方形塔樓（四角錐屋頂、上層四面大窗）＋西側弧形平台（石欄杆）"""
    M = M or materials(); g = B.group(name, root, {'kind': 'us_tower_hall'}); g.location = (cx, -cz, 0.0); g.rotation_euler = (0.0, 0.0, yaw)
    mk = _mk(name, M, ('lime', 'lime_dark', 'trim', 'glass', 'lead', 'door', 'tile'))
    u0, u1, v0, v1 = -W / 2, W / 2, -D / 2, D / 2; H = floors * FH + 1.2
    _box_walls(mk, u0, u1, v0, v1, H, lambda k, ln: [(a0, a1, y0, y0 + 3.0, 'rect') for (a0, a1, y0, _, _) in _rows(ln, floors, bay=3.6, w=1.6)])
    yR = H + D * 0.55; t = mk['tile']; o = 0.5
    t.quad([(u0 - o, H - 0.2, v1 + o), (u1 + o, H - 0.2, v1 + o), (u1 + o, yR, 0.0), (u0 - o, yR, 0.0)]); t.quad([(u1 + o, H - 0.2, v0 - o), (u0 - o, H - 0.2, v0 - o), (u0 - o, yR, 0.0), (u1 + o, yR, 0.0)])
    for uu, s in ((u0, -1), (u1, 1)):                                                   # 山牆（石灰岩三角形＋一扇圓窗）
        mk['lime'].quad([(uu, H, v1), (uu, H, v0), (uu, yR, 0.0)] if s > 0 else [(uu, H, v0), (uu, H, v1), (uu, yR, 0.0)])
        mk['glass'].quad([(uu + s * 0.02, H + 1.6, 1.0), (uu + s * 0.02, H + 1.6, -1.0), (uu + s * 0.02, H + 3.2, -1.0), (uu + s * 0.02, H + 3.2, 1.0)][:: (1 if s > 0 else -1)])
    # 東北角的方塔
    tw, th = tower; x0, x1, z0, z1 = u1 - tw + 1.0, u1 + 1.0, v0 - 1.0, v0 - 1.0 + tw
    mk['lime'].box(x0, x1, 0.0, th, z0, z1)
    for (fx, fz, nx, nz) in ((0, z1, 0, 1), (0, z0, 0, -1), (x1, 0, 1, 0), (x0, 0, -1, 0)):          # 塔上層四面的長窗、鐘面高度的石帶
        for yy in (th - 6.0, th - 13.0):
            if nz: mk['glass'].quad([(x0 + 2.0, yy, fz + nz * 0.02), (x1 - 2.0, yy, fz + nz * 0.02), (x1 - 2.0, yy + 3.6, fz + nz * 0.02), (x0 + 2.0, yy + 3.6, fz + nz * 0.02)][:: nz])
            else: mk['glass'].quad([(fx + nx * 0.02, yy, z1 - 2.0), (fx + nx * 0.02, yy, z0 + 2.0), (fx + nx * 0.02, yy + 3.6, z0 + 2.0), (fx + nx * 0.02, yy + 3.6, z1 - 2.0)][:: nx])
    mk['trim'].box(x0 - 0.2, x1 + 0.2, th - 0.4, th, z0 - 0.2, z1 + 0.2)
    xm, zm = (x0 + x1) / 2, (z0 + z1) / 2; ap = th + tw * 0.9
    for (p, q) in (((x0 - 0.3, z1 + 0.3), (x1 + 0.3, z1 + 0.3)), ((x1 + 0.3, z1 + 0.3), (x1 + 0.3, z0 - 0.3)), ((x1 + 0.3, z0 - 0.3), (x0 - 0.3, z0 - 0.3)), ((x0 - 0.3, z0 - 0.3), (x0 - 0.3, z1 + 0.3))):
        t.quad([(p[0], th, p[1]), (q[0], th, q[1]), (xm, ap, zm)])
    # 西側弧形平台（石欄杆）
    R = D * 0.6; cxp = u0
    for k in range(12):
        a0 = math.pi / 2 + k * math.pi / 12; a1 = a0 + math.pi / 12
        p0 = (cxp + R * math.cos(a0), R * math.sin(a0)); p1 = (cxp + R * math.cos(a1), R * math.sin(a1))
        mk['lime_dark'].quad([(cxp, 0.9, 0.0), (p1[0], 0.9, p1[1]), (p0[0], 0.9, p0[1])])
        mk['lime_dark'].quad([(p1[0], 0.0, p1[1]), (p0[0], 0.0, p0[1]), (p0[0], 0.9, p0[1]), (p1[0], 0.9, p1[1])])     # 外側（朝外）
        i0 = (cxp + (R - 0.25) * math.cos(a0), (R - 0.25) * math.sin(a0)); i1 = (cxp + (R - 0.25) * math.cos(a1), (R - 0.25) * math.sin(a1))
        mk['trim'].quad([(p1[0], 0.9, p1[1]), (p0[0], 0.9, p0[1]), (p0[0], 1.85, p0[1]), (p1[0], 1.85, p1[1])])           # 石欄杆：外、內、頂
        mk['trim'].quad([(i0[0], 0.9, i0[1]), (i1[0], 0.9, i1[1]), (i1[0], 1.85, i1[1]), (i0[0], 1.85, i0[1])])
        mk['trim'].quad([(p1[0], 1.85, p1[1]), (p0[0], 1.85, p0[1]), (i0[0], 1.85, i0[1]), (i1[0], 1.85, i1[1])])
    for m in mk.values(): m.finish(g, uv=True)
    return g


def castle_hall(root, name, cx, cz, W=26.0, D=14.0, floors=3, yaw=0.0, M=None, turret='NE'):
    """灰色粗面石材、深灰石板瓦四坡屋頂；一角一座圓形塔樓（比屋頂高、圓錐屋頂）"""
    M = M or materials(); g = B.group(name, root, {'kind': 'us_castle_hall'}); g.location = (cx, -cz, 0.0); g.rotation_euler = (0.0, 0.0, yaw)
    mk = _mk(name, M, ('lime', 'lime_dark', 'trim', 'glass', 'lead', 'door', 'slate', 'rough'))
    u0, u1, v0, v1 = -W / 2, W / 2, -D / 2, D / 2; H = floors * FH + 0.6
    _box_walls(mk, u0, u1, v0, v1, H, lambda k, ln: _rows(ln, floors, bay=3.4, w=1.2, h=2.2), mat='rough')
    hip_roof(mk['slate'], u0, u1, v0, v1, H, H + min(W, D) * 0.42)
    tx, tz = {'NE': (u1, v0), 'NW': (u0, v0), 'SE': (u1, v1), 'SW': (u0, v1)}[turret]; R = 3.2; th = H + 5.0; n = 20
    for k in range(n):
        a0 = 2 * math.pi * k / n; a1 = 2 * math.pi * (k + 1) / n
        p0 = (tx + R * math.cos(a0), tz + R * math.sin(a0)); p1 = (tx + R * math.cos(a1), tz + R * math.sin(a1))
        mk['rough'].quad([(p1[0], 0.0, p1[1]), (p0[0], 0.0, p0[1]), (p0[0], th, p0[1]), (p1[0], th, p1[1])])
        mk['slate'].quad([(p1[0] + 0.3 * math.cos(a1), th, p1[1] + 0.3 * math.sin(a1)), (p0[0] + 0.3 * math.cos(a0), th, p0[1] + 0.3 * math.sin(a0)), (tx, th + 6.0, tz)])
        if k % 4 == 1:
            am = (a0 + a1) / 2
            for yy in (2.0, 6.0, 10.0, th - 3.0):
                pm = (tx + (R + 0.02) * math.cos(am), tz + (R + 0.02) * math.sin(am)); dx, dz = -math.sin(am) * 0.45, math.cos(am) * 0.45
                mk['glass'].quad([(pm[0] + dx, yy, pm[1] + dz), (pm[0] - dx, yy, pm[1] - dz), (pm[0] - dx, yy + 1.8, pm[1] - dz), (pm[0] + dx, yy + 1.8, pm[1] + dz)])
    for m in mk.values(): m.finish(g, uv=True)
    return g


def stone_block(root, name, cx, cz, W=24.0, D=16.0, floors=5, yaw=0.0, M=None):
    """較高的多層石灰岩建築：平屋頂、女兒牆、每層一排方窗"""
    M = M or materials(); g = B.group(name, root, {'kind': 'us_stone_block'}); g.location = (cx, -cz, 0.0); g.rotation_euler = (0.0, 0.0, yaw)
    mk = _mk(name, M, ('lime', 'lime_dark', 'trim', 'glass', 'lead', 'door', 'flat'))
    u0, u1, v0, v1 = -W / 2, W / 2, -D / 2, D / 2; H = floors * FH + 0.6
    _box_walls(mk, u0, u1, v0, v1, H, lambda k, ln: _rows(ln, floors, bay=3.0, w=1.5, h=2.1))
    mk['flat'].quad([(u0, H, v1), (u1, H, v1), (u1, H, v0), (u0, H, v0)])
    mk['trim'].box(u0 - 0.1, u1 + 0.1, H, H + 1.0, v1 - 0.3, v1 + 0.1); mk['trim'].box(u0 - 0.1, u1 + 0.1, H, H + 1.0, v0 - 0.1, v0 + 0.3)
    mk['trim'].box(u0 - 0.1, u0 + 0.3, H, H + 1.0, v0, v1); mk['trim'].box(u1 - 0.3, u1 + 0.1, H, H + 1.0, v0, v1)
    for m in mk.values(): m.finish(g, uv=True)
    return g
