"""山嵐書店 v3（AA 2026-11-03；回 LAWWW2 驗收三點：樓梯實木、天花板格樑＋嵌燈、整體蜂蜜色暖木）。
不是單獨執行的腳本：shanlan_interior.py 在 v2 之後 exec 這個檔（共用 sh、K、Xf、LAY、ST、VD…）。
座標、樓梯的階數／一階高／踏面、寬度都沒動（導航照舊）；顏色在 shanlan_interior.py 頂端的材質改。
  1. 樓梯：兩側加厚的實木側板（斜的整片，不是鋸齒），東側側板高出踏面 0.3 m＝實木矮牆，上面接原本的玻璃欄杆
  2. 天花板：一樓、二樓都加木格樑（約 2.3 m 一格），每一格一盞方形嵌燈（發光材質）；一樓避開挑空
"""
from aa_kit import bmesh as _bm, g2b as _g2b   # noqa: E402

def prism(m, x0, x1, prof):
    """沿 x 擠出的實心體：prof＝[(z, y), ...]（凸多邊形），用 convex_hull 生面，法線一定朝外。"""
    vs = [m.bm.verts.new(_g2b(x, y, z)) for x in (x0, x1) for (z, y) in prof]
    r = _bm.ops.convex_hull(m.bm, input=vs)
    for g in r.get('geom_interior', []):
        if isinstance(g, _bm.types.BMVert): m.bm.verts.remove(g)

# ---------------------------------------------------------------- 1. 樓梯：實木側板
sx0, sx1 = ST['x'] - ST['w'] / 2, ST['x'] + ST['w'] / 2
zb = ST['z'] + ST['len'] / 2; ri = ST['rise']; zt = VD['z0']
sw3 = sh.a('wood')
# 西側（靠牆）：厚 7 cm，高出踏面 0.14
prism(sw3, sx0 - 0.07, sx0, [(zb + 0.03, 0.0), (zb + 0.03, ri + 0.14), (zt, Y2 + 0.14), (zt, 0.0)])
# 東側（挑空那一側）：厚 9 cm，高出踏面 0.30（實木矮牆；上面是原本的玻璃欄杆）
prism(sw3, sx1, sx1 + 0.09, [(zb + 0.03, 0.0), (zb + 0.03, ri + 0.30), (zt, Y2 + 0.30), (zt, 0.0)])
# 東側矮牆頂的木壓條（比牆寬一點，看起來是一整塊實木）
prism(sw3, sx1 - 0.01, sx1 + 0.10, [(zb + 0.03, ri + 0.30), (zb + 0.03, ri + 0.33), (zt, Y2 + 0.33), (zt, Y2 + 0.30)])
sh.tally('v3 stairs')

# ---------------------------------------------------------------- 2. 天花板：木格樑＋方形嵌燈
NX, NZ = 6, 8                                   # 14 m／6≈2.33、18 m／8＝2.25
xs = [X0 + W * k / NX for k in range(1, NX)]
zs = [Z0 + D * k / NZ for k in range(1, NZ)]
BW, BD = 0.07, 0.12                             # 樑寬、樑深（v5：LAWWW2 驗收，梁寬減半；v3 0.14／0.16）

def in_void(x, z): return VD['x0'] - 1e-3 <= x <= VD['x1'] + 1e-3 and VD['z0'] - 1e-3 <= z <= VD['z1'] + 1e-3

def grid(top, lvl, skip_void):
    wm = sh.a('wood', lvl)
    for x in xs:                                # 沿 z 的樑
        if skip_void and VD['x0'] < x < VD['x1']:
            wm.box(x - BW / 2, x + BW / 2, top - BD, top - 0.005, Z0, VD['z0'])
        else:
            wm.box(x - BW / 2, x + BW / 2, top - BD, top - 0.005, Z0, Z1)
    for z in zs:                                # 沿 x 的樑
        a0 = VD['x1'] if (skip_void and VD['z0'] < z < VD['z1']) else X0
        wm.box(a0, X1, top - BD, top - 0.005, z - BW / 2, z + BW / 2)
    bx = [X0] + xs + [X1]; bz = [Z0] + zs + [Z1]; lm = sh.a('bulb', lvl); n = 0
    for i in range(len(bx) - 1):
        for j in range(len(bz) - 1):
            cx, cz = (bx[i] + bx[i + 1]) / 2, (bz[j] + bz[j + 1]) / 2
            if skip_void and in_void(cx, cz): continue
            lm.box(cx - 0.11, cx + 0.11, top - 0.012, top - 0.004, cz - 0.11, cz + 0.11)    # 嵌燈（發光的方片）
            wm.box(cx - 0.14, cx + 0.14, top - 0.006, top - 0.002, cz - 0.14, cz + 0.14)   # 燈框（不倒角：GLB 要 ≤ 5 MB）
            if (i + j) % 3 == 0: CL.glow(sh.root, 'downlight', cx, top - 0.3, cz, color='rgba(255,210,150,1)', size=0.7, day=0.1, night=0.55)
            n += 1
    return n

n1 = grid(H1, '', True)
n2 = grid(H, 'L2', False)
print('v3 downlights', n1, n2)
sh.tally('v3 ceiling grid')
