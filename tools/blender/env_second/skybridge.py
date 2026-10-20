"""博雅教學館 ⇄ 普通教學館 二樓空橋（走得過去的版本）→ assets/models/env/second_ai/skybridge.glb（＋.json）。
LAWWW2-B 2026-10-16；使用者試玩 v9.7 回報第 18 項「博雅和普通教學館的空橋居然是一扇門」；LAWWW-B 佇列②：外觀＋走廊室內，遊戲端接導航讓它真的走得過去。
Blender 5.2（bpy，無介面）：/opt/blenv/bin/python tools/blender/env_second/skybridge.py [-- --out <glb>]

**本地座標**（遊戲座標的方向：x 東、y 上、z 南；單位公尺）：
  - 原點＝普通教學館那一端的門口中心、地板高度（普通二樓地板，室內 putong_layout 2F y=4.2）。
  - 空橋往北（−z）走 7.5 m 到博雅那一端（博雅二樓地板高 0.6 m：室內 boya_layout 2F y=4.8）——地板是一段 8% 的緩坡（中間 5.5 m 斜、兩端各 1 m 平台），不用台階。
  - 走廊淨寬 2.6 m（牆中心 ±1.45，外寬 3.2 m，和現在校園的外觀方塊一樣寬）；淨高 2.8 m。
  - 校園裡的位置：中心線 x=−41.2；普通北牆 z=−66.5、博雅南牆 z=−74.0（zones3d.js 第 193 行的外觀方塊）。原點放在世界 (−41.2, Y0, −66.5)，Y0 由遊戲決定。
節點：skybridge（根）＞ 外殼 WALL_*（兩側玻璃牆、矮牆、屋頂）／地板／天花板與燈／扶手／兩端門框。
  會淡出的牆照室內的約定：WALL_<east|west>_*（自訂屬性 dir＝往室內的法線），遊戲在走廊裡可以把外側牆淡掉。
導航（給遊戲）：可走的範圍 x −1.15～1.15、z −7.5～0；地板高 floor_y(z)（json 的 ramp）。兩端門洞寬 1.8 m（x −0.9～0.9）。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/skybridge.glb')
LEN, RISE, FLAT = 7.5, 0.6, 1.0          # 長、兩端高差、兩端平台長
WI, WO, H = 1.45, 1.6, 2.8               # 牆中心半寬、外半寬、淨高
DOOR = 0.9                               # 門洞半寬


def floor_y(z):
    """z：0（普通）→ −LEN（博雅）；兩端各 FLAT 平，中間線性上升 RISE"""
    t = min(1.0, max(0.0, (-z - FLAT) / (LEN - 2 * FLAT)))
    return RISE * t


B.reset(texres=512)
M = {
    'floor': L.pbr('sb_floor', 'large_floor_tiles_02', tile=1.2, target='#c9c6bf', normal=0.4, maps=('diff', 'nor'), rough_value=0.4),
    'glass': L.flat('sb_glass', '#cfdfe4', rough=0.05, alpha=0.2),
    'alu': L.flat('sb_alu', '#8f969b', rough=0.35, metal=0.45),
    'conc': L.pbr('sb_concrete', 'granular_concrete', tile=1.5, target='#bdbab3', maps=('diff', 'nor'), rough_value=0.85),
    'ceil': L.flat('sb_ceiling', '#e9e8e3', rough=0.9),
    'led': L.flat('sb_led', '#ffffff', rough=0.3, emit=B.srgb('#fff6e8')),
    'rail': L.flat('sb_rail', '#c3c7cc', rough=0.25, metal=0.45),
    'door': L.flat('sb_doorframe', '#5d6166', rough=0.4, metal=0.3),
    'mat': L.flat('sb_mat', '#3a3d40', rough=0.95),
    'roof': L.pbr('sb_roof', 'granular_concrete', tile=1.5, target='#bdbab3', maps=('diff', 'nor'), rough_value=0.85),
}
for k in ('ceil', 'roof'): M[k].use_backface_culling = True   # 單面（glTF doubleSided＝false）：從下面看得到、鏡頭在上面時看得穿（見下面天花板的說明）
root = B.group('skybridge', props={'kind': 'skybridge', 'len': LEN, 'rise': RISE})
NZ = 16
ZS = [-LEN * i / NZ for i in range(NZ + 1)]

# ---- 地板（緩坡）：沿 z 分段的斜面，上面一片薄的地磚面；下面是結構樑（從外面看得到的厚度）
fl = Mesh('sb_floor', M['floor'])
for za, zb in zip(ZS, ZS[1:]):
    ya, yb = floor_y(za), floor_y(zb)
    fl.quad([(-WI, ya, za), (WI, ya, za), (WI, yb, zb), (-WI, yb, zb)])
fl.finish(root)
st = Mesh('sb_structure', M['conc'])
st.box(-WO, WO, -0.45, -0.005, -LEN, 0)                               # 結構板（平的，在低的那一端地板下）
for za, zb in zip(ZS, ZS[1:]):                                       # 兩側的裙板：從結構板頂到地板（跟著坡度；外面看是一整片）
    ya, yb = floor_y(za), floor_y(zb)
    for sx in (-1, 1):
        x = sx * WO; q = [(x, -0.005, za), (x, -0.005, zb), (x, yb, zb), (x, ya, za)]
        st.quad(q); st.quad(q[::-1])
st.finish(root)

# ---- 兩側：矮牆（地板上 0.9 m，混凝土）＋上面整片玻璃（直框每 1.25 m）＋天花板／屋頂（外面是平屋頂、薄的屋簷）
for side, sx in (('east', 1), ('west', -1)):
    dirv = [-sx, 0, 0]
    wl = Mesh(f'WALL_{side}_parapet', M['conc']); gl = Mesh(f'WALL_{side}_glass', M['glass']); al = Mesh(f'WALL_{side}_mullion', M['alu'])
    for za, zb in zip(ZS, ZS[1:]):
        ya, yb = floor_y(za), floor_y(zb)
        for x in (sx * WI, sx * WO):                                                                           # 矮牆的內外兩面
            q = [(x, ya, za), (x, yb, zb), (x, yb + 0.9, zb), (x, ya + 0.9, za)]
            wl.quad(q if (x > 0) == (abs(x) == WO) else q[::-1])
        wl.quad([(sx * WI, ya + 0.9, za), (sx * WO, ya + 0.9, za), (sx * WO, yb + 0.9, zb), (sx * WI, yb + 0.9, zb)][:: (1 if sx > 0 else -1)])
        x = sx * (WI + WO) / 2
        q = [(x, ya + 0.9, za), (x, yb + 0.9, zb), (x, H + RISE + 0.0, zb), (x, H + RISE, za)]
        gl.quad(q)
    for k in range(7):
        z = -LEN * k / 6; y0 = floor_y(z) + 0.9
        al.box(sx * (WI + WO) / 2 - 0.03, sx * (WI + WO) / 2 + 0.03, y0, H + RISE, z - 0.035, z + 0.035)
    for z0 in ZS[::4]:
        pass
    al.box(sx * WI - 0.02, sx * WO + 0.02, H + RISE - 0.08, H + RISE, -LEN, 0)                                  # 玻璃上緣的橫框
    for m in (wl, gl, al):
        ob = m.finish(root, props={'dir': dirv})
# 天花板（平的，在最高的地板 + H）＋兩條 LED 燈帶；屋頂（外面）
yc = H + RISE - 0.02
ce = Mesh('sb_ceiling', M['ceil']); ce.quad([(-WI, yc, -LEN), (WI, yc, -LEN), (WI, yc, 0), (-WI, yc, 0)]); ce.finish(root, uv=False)
# 天花板只有朝下的一面（2026-10-20 LAWWW2-C：使用者「走到普通之後被擋住」——鏡頭跟在人後面、比天花板高，原本的薄板＋屋頂頂面從上面看是一整片灰色，
#   人物和路都看不到。改成和室內 room() 的天花板一樣：從下面看得到，鏡頭在上面時看得穿）
led = Mesh('sb_led', M['led'])
for x in (-0.55, 0.55): led.box(x - 0.04, x + 0.04, H + RISE - 0.03, H + RISE - 0.005, -LEN + 0.4, -0.4)
led.finish(root)
ra, rb, ry0, ry1 = WO + 0.12, -LEN, H + RISE, H + RISE + 0.25   # 屋頂：四面的簷口＋底面（屋簷下緣），沒有頂面（同上：鏡頭在上面時看得穿；從校園的地面看不到屋頂頂面）
rf = Mesh('sb_roof', M['roof'])
rf.quad([(-ra, ry0, rb), (ra, ry0, rb), (ra, ry0, 0), (-ra, ry0, 0)])                                          # 底面（朝下）
rf.quad([(-ra, ry0, 0), (ra, ry0, 0), (ra, ry1, 0), (-ra, ry1, 0)])                                            # 普通那一端（朝 +z）
rf.quad([(ra, ry0, rb), (-ra, ry0, rb), (-ra, ry1, rb), (ra, ry1, rb)])                                        # 博雅那一端（朝 −z）
rf.quad([(ra, ry0, 0), (ra, ry0, rb), (ra, ry1, rb), (ra, ry1, 0)])                                            # 東（朝 +x）
rf.quad([(-ra, ry0, rb), (-ra, ry0, 0), (-ra, ry1, 0), (-ra, ry1, rb)])                                        # 西（朝 −x）
rf.finish(root)

# ---- 扶手（兩側，沿著矮牆內面，跟著坡度）
rl = Mesh('sb_rail', M['rail'])
for sx in (-1, 1):
    pts = [(sx * (WI - 0.07), floor_y(z) + 0.85, z) for z in ZS]
    for a, b in zip(pts, pts[1:]): rl.cyl(a, b, 0.022, seg=8, caps=False)
    for z in (-0.3, -LEN / 2, -LEN + 0.3):
        rl.cyl((sx * (WI - 0.07), floor_y(z) + 0.85, z), (sx * (WI - 0.01), floor_y(z) + 0.85, z), 0.012, seg=6)
rl.finish(root, smooth=True)

# ---- 兩端：門框（門洞 1.8 m，自動門開著：門片收在兩側）＋門口地墊
dr = Mesh('sb_doorframe', M['door']); dg = Mesh('sb_doorglass', M['glass']); mt = Mesh('sb_mat', M['mat'])
for z, y in ((0.0, 0.0), (-LEN, RISE)):
    dr.box(-DOOR - 0.08, -DOOR, y, y + 2.3, z - 0.06, z + 0.06); dr.box(DOOR, DOOR + 0.08, y, y + 2.3, z - 0.06, z + 0.06)
    dr.box(-DOOR - 0.08, DOOR + 0.08, y + 2.3, y + 2.42, z - 0.06, z + 0.06)
    for sx in (-1, 1):                                                                                         # 門洞兩旁到牆的實牆（門片收在這裡）
        dr.box(sx * DOOR if sx > 0 else -WI, sx * WI if sx > 0 else -DOOR, y + 2.42, H + RISE, z - 0.05, z + 0.05)
        dg.quad([(sx * (DOOR + 0.08), y + 0.02, z - 0.02), (sx * WI, y + 0.02, z - 0.02), (sx * WI, y + 2.3, z - 0.02), (sx * (DOOR + 0.08), y + 2.3, z - 0.02)][:: (1 if sx > 0 else -1)])
    dz = -0.9 if z == 0.0 else 0.9
    mt.box(-0.8, 0.8, y + 0.001, y + 0.012, min(z, z + dz), max(z, z + dz))
for m in (dr, dg, mt): m.finish(root)

L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=False)
info.update({'local': '原點＝普通那一端門口中心的地板；往北（−z）7.5 m 到博雅；x 東、y 上', 'world_place': {'x': -41.2, 'z': -66.5, 'y': '由遊戲決定（普通二樓地板高）'},
             'walk': {'x0': -1.15, 'x1': 1.15, 'z0': -LEN, 'z1': 0.0}, 'doors': {'putong': {'x0': -DOOR, 'x1': DOOR, 'z': 0.0, 'y': 0.0}, 'boya': {'x0': -DOOR, 'x1': DOOR, 'z': -LEN, 'y': RISE}},
             'ramp': {'flat_each_end': FLAT, 'rise': RISE, 'slope': round(RISE / (LEN - 2 * FLAT), 3), 'formula': 'y = rise * clamp((-z - flat) / (len - 2*flat), 0, 1)'},
             'clear_height': H, 'outer_width': 2 * WO})
L.write_json(OUT[:-4] + '.json', info)
print(json.dumps(info, ensure_ascii=False))
