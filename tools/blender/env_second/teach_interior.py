"""普通、博雅、共同教學館的室內（兩層）正式模型 → assets/models/env/second_ai/{putong,boya,gongtong}_interior.glb。LAWWW2-C 2026-10-18（ART-EXT-TEACH 第二批）：
  /opt/blenv/bin/python tools/blender/env_second/teach_interior.py -- --set putong|boya|gongtong [--out 輸出.glb]

配置讀 src/data/{putong,boya,gongtong}_layout.js（遊戲 src/teach3d.js 的導航、座位、互動點讀同一份，兩邊的牆、樓梯、階梯教室的平台一定一致）。
座標＝配置的座標：x 往東、z 往南（+z＝南牆：入口）、y 往上；一樓地板 y=0、二樓 floors[1].y、屋頂 roofY。
節點命名（src/building3d.js 的 B3.attachFormal）：L0_root（一樓＋整座樓梯）、L1_root（二樓：玩家在一樓、鏡頭高過二樓樓板時藏起來）；
  名字含 WALL_ 的是外牆和貼在外牆上的東西（窗框、窗台、入口的門、往空橋的玻璃門；擋住鏡頭時一起淡出），自訂屬性 dir＝往室內的法線。
  隔間牆的材質 tb_partition（遊戲接上時標 seeThrough：擋住鏡頭時網點透空，和備用模型一樣）。
這個模型取代 teach3d.js 備用模型 fb0／fb1 裡的東西：地板、樓板、樓梯、外牆、隔間、窗框、天花板與燈、黑板、講桌、階梯教室的平台與走道台階、講台、黑板、投影幕、
  沙發、關著的房間的門、講座資訊螢幕的框、入口的門。**桌椅不在這裡**（遊戲的 Z3.desk／Z3.chair、LAWWW2 的 furniture_study.glb 照舊放；patch 把它們搬出 fb0／fb1）。
不做：字（牌子、指標：遊戲用 canvas 畫）、公告欄（W3.bulletin）、長椅（W3.formalBench）、窗外的景（B3.outView）、點地面用的透明地板。
真實性：房間配置是遊戲的模板（docs/campus/TEACHING_BUILDINGS_PLAN.md），材料是台灣大學教學館常見的做法（磨石子地板、輕鋼架礦纖天花板、白牆、綠黑板），不宣稱還原真實室內。
2026-10-30 博思（BOYA-LM-1030，LAWWW2-B；LAWWW-B 派工、INTERIOR_AAA_REVIEW_1028 第 5 節 P1 光照＋P5 燈具）：
  階梯教室的長桌、翻椅改在模型裡（LECT_<房號>_*、SEATPANS；照霖澤館 201 v2）：遊戲 patch（patches/boya_lecture_furn_1030.patch）看到 SEATPANS 就藏起備用的方塊桌椅、空位椅面掀起來（Z3.seatFold）；
  天花板的燈板換成 T5 格柵燈具（1.2×0.6，格子線 x＝0.6k、z＝0.6k＋0.1）；光照烘焙 lightbake/bake_boya.sh。普通（--set putong）照舊：沒有階梯教室、燈板和格子不變。
2026-10-30 共同（--set gongtong，ART-ECON-3D-GAP-1021 A，LAWWW2-B）：原本沒有正式模型（遊戲一直是 teach3d.js 的程序化備用畫面）。做法和博思一樣：T5 格柵燈具、101 階梯教室的長桌翻椅在模型裡。
  配置沒有 lightPanels：燈位照 teach3d.js 備用模型的預設（DEFAULT_LP，兩邊一致）。休息區的圓桌、自習區的桌椅（配置的 lounge／study，舊寫法）照舊是遊戲畫的，不在這裡。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
SET = arg('--set', 'boya'); KEY = {'boya': 'BOYA_LAYOUT', 'putong': 'PUTONG_LAYOUT', 'gongtong': 'GONGTONG_LAYOUT'}[SET]
OUT = os.path.join(L.ROOT, arg('--out', f'assets/models/env/second_ai/{SET}_interior.glb'))
src = open(os.path.join(L.ROOT, f'src/data/{SET}_layout.js'), encoding='utf8').read()
J = json.loads(src[src.index('{', src.index(KEY)):src.rindex('}') + 1])

W, D, T = J['W'], J['D'], J['wallT']; Y1 = J['floors'][1]['y']; RY = J['roofY']; ST = J['slabT']; C0 = J['ceil0']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
XI0, XI1, ZI0, ZI1 = X0 + T / 2, X1 - T / 2, Z0 + T / 2, Z1 - T / 2
S = J['stair']; SA, SB, LD, MW, WL = S['A'], S['B'], S['landing'], S['midWall'], S['well']; RS, TR = S['rise'], S['tread']
EN = J['entrance']; BR = J.get('bridge')
B.reset(texres=512)
root = B.group(f'{SET}_interior', props={'kind': f'{SET}_interior', 'w': W, 'd': D})
G = [B.group('L0_root', root), B.group('L1_root', root)]
DIRS = {'N': [0, 0, 1], 'S': [0, 0, -1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'ceil': [0, -1, 0]}   # ceil：天花板的輕鋼架、燈框（往室內＝往下：鏡頭比它高時和牆一樣藏起來）
WARM = SET == 'putong'

M = {
    'floor': L.pbr('tb_floor', 'terrazzo_tiles', tile=1.6, target='#cfc7b8' if WARM else '#d6d2ca', sat=0.45, maps=('diff',), res=512, rough_value=0.4),   # 磨石子
    'slab': L.flat('tb_slab', '#e6e3dc', rough=0.9),
    'wall': L.flat('tb_wall', '#ece7dd' if WARM else '#eeece7', rough=0.9),
    'part': L.flat('tb_partition', '#e9e4d9' if WARM else '#ebe9e3', rough=0.9),
    'base': L.flat('tb_baseboard', '#5a5650', rough=0.6),
    'ceil': L.pbr('tb_ceiling', 'ceiling_interior', tile=0.6, target='#eeede9', sat=0.0, normal=0.25, maps=('diff', 'nor'), rough_value=0.9, cull=True),
    'tbar': L.flat('tb_ceiling_grid', '#dcdcd8', rough=0.5),   # 輕鋼架、燈框：方盒照舊，整組放在 L{lv}_WALL_ceil_tbar（dir 朝下）：鏡頭拉到最遠最陡、比天花板高時藏起來（LAWWW2 10-22 第二版：只留底面的話從下面平視看遠處會不見）
    'light': L.flat('tb_light_panel', '#fff6e4', rough=0.9, emit=B.srgb('#fff4dc'), cull=True),
    'granite': L.pbr('tb_stair_granite', 'granite_tile_03', tile=1.2, target='#8f8b85', sat=0.4, normal=0.4, maps=('diff', 'nor'), rough_value=0.4),
    'nosing': L.flat('tb_nosing', '#34363a', rough=0.7),
    'steel': L.flat('tb_steel', '#c9ccd0', rough=0.28, metal=0.45),
    'frame': L.flat('tb_frame', '#7d8287', rough=0.4, metal=0.3),
    'wood': L.pbr('tb_wood', 'fine_grained_wood', tile=1.2, target='#8a6a4a', maps=('diff',), res=256, rough_value=0.5),
    'door': L.pbr('tb_door', 'fine_grained_wood', tile=1.6, target='#7a5a3e', maps=('diff',), res=256, rough_value=0.55),
    'board': L.flat('tb_chalkboard', '#2f4a3a', rough=0.75),
    'tray': L.flat('tb_chalk_tray', '#a7a9a6', rough=0.4, metal=0.3),
    'screen': L.flat('tb_screen', '#f2f0ea', rough=0.85),
    'carpet': L.pbr('tb_carpet', 'dirty_carpet', tile=1.0, target='#5f6b78', sat=0.15, normal=0.4, maps=('diff', 'nor'), rough_value=0.95),   # 階梯教室的平台
    'riser': L.flat('tb_riser', '#8f8b84', rough=0.85),
    'stepvinyl': L.flat('tb_step_strip', '#d8d2c4', rough=0.7),
    'sofa': L.flat('tb_sofa_fabric', '#5e6a72' if not WARM else '#6a5a4c', rough=0.92),
    'sofaleg': L.flat('tb_sofa_leg', '#2c2c2e', rough=0.5, metal=0.3),
    'glass': L.flat('tb_glass', '#c4d6dc', rough=0.05, alpha=0.22),
    'mat': L.flat('tb_doormat', '#6e6c67', rough=0.95),   # 入口的地墊：第一版 #4a4d50、深 1.4 m，大廳的鏡頭往下看是一整條黑帶
    'dark': L.flat('tb_dark', '#26282b', rough=0.5),
}
for _k, _m in M.items():   # 除了玻璃都單面（PERF-PATROL-ECON-1025，LAWWW2-B 10-25）：網格全是封閉的方盒、有蓋的圓柱、朝固定方向的面，背面本來就看不到；
    if _k != 'glass': _m.use_backface_culling = True   # 雙面時博雅大廳往北看 1.55 fps、單面 1.95（SwiftShader）。玻璃兩面都看得到，照舊雙面
MESH, WMESH = {}, {}
def mk(lv, key):
    k = (lv, key)
    if k not in MESH: MESH[k] = Mesh(f'L{lv}_{key}', M[key])
    return MESH[k]
def wm(lv, side, key):
    k = (lv, side, key)
    if k not in WMESH: WMESH[k] = Mesh(f'L{lv}_WALL_{side}_{key}', M[key])
    return WMESH[k]
def hquad(m, x0, x1, z0, z1, y, down=True):
    p = [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)]
    m.quad(p if down else p[::-1])
def vquad_z(m, z, x0, x1, y0, y1, facing):
    p = [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)]
    m.quad(p if facing > 0 else p[::-1])
def vquad_x(m, x, z0, z1, y0, y1, facing):
    p = [(x, y0, z1), (x, y0, z0), (x, y1, z0), (x, y1, z1)]
    m.quad(p if facing > 0 else p[::-1])
def seg_gaps(a0, a1, gaps):
    out, a = [], a0
    for (g0, g1) in sorted(gaps):
        if g0 > a: out.append((a, g0))
        a = max(a, g1)
    if a < a1: out.append((a, a1))
    return out

# ================= 地板、樓板、天花板 =================
mk(0, 'floor').box(X0, X1, -0.05, 0.0, Z0, Z1)
mk(0, 'mat').box(EN['a0'] + 0.3, EN['a1'] - 0.3, 0.0, 0.012, ZI1 - 0.95, ZI1 - 0.02)
QS = [(X0, X1, WL['z1'], Z1), (X0, WL['x0'], Z0, WL['z1']), (WL['x1'], X1, Z0, WL['z1']), (WL['x0'], WL['x1'], Z0, WL['z0']), (SB['x0'], SB['x1'], SB['z1'], WL['z1'])]
for (a, b, c, d) in QS:
    if b - a < 0.05 or d - c < 0.05: continue
    mk(1, 'slab').box(a, b, Y1 - ST, Y1 - 0.012, c, d)
    mk(1, 'floor').box(max(a, XI0), min(b, XI1), Y1 - 0.012, Y1, max(c, ZI0), min(d, ZI1))
# 一樓天花板（ceil0）：樓梯井那一塊不做（往上看得到樓梯）；井的四周從天花板到二樓樓板之間封板
DEFAULT_LP = {'xs': [-9.6, -6.0, -1.2, 1.2, 6.0, 9.6], 'zs': [-5.2, -2.0, 1.0, 4.6]}   # teach3d.js：配置沒寫 lightPanels 時的燈位（共同）
LP = J.get('lightPanels') or DEFAULT_LP
# 博思（BOYA-LM-1030，LAWWW2-B 10-30；照 202 v2、多功能教室 v2）：原本 1.2×0.3 的平板燈貼在格子上、對不上格子線 → T5 格柵燈具（1.2×0.6，佔兩格：外殼、發光面、格柵）。
# 格子線改成 x＝0.6k、z＝0.6k＋0.1：配置的燈位 x 都是 0.6 的倍數（燈具的長邊兩端剛好在格子線上），z 對到最近一格的中心（7.2 → 7.0，其他不動）。
# 烘焙的面光源用同一個位置（lightbake/bake_boya.sh 的 trof()）。普通照舊（燈板、格子從外牆內面量）。
TROF = SET in ('boya', 'gongtong')
GXO, GZO = (0.0, 0.1) if TROF else (XI0, ZI0)
def trof(x, z): return (round(0.6 * round(x / 0.6), 3), round(0.4 + 0.6 * round((z - 0.4) / 0.6), 3))
if TROF:
    M['trof'] = L.flat('tb_troffer', '#ecebe7', rough=0.5); M['louvre'] = L.flat('tb_louvre', '#d3d6d9', rough=0.3, metal=0.35)
    for _k in ('trof', 'louvre'): M[_k].use_backface_culling = True
def ceiling(lv, y, rects):
    for (x0, x1, z0, z1) in rects:
        if x1 - x0 < 0.05 or z1 - z0 < 0.05: continue
        hquad(mk(lv, 'ceil'), x0, x1, z0, z1, y)
        k = math.ceil((x0 - GXO) / 0.6 + 1e-6)
        while GXO + k * 0.6 < x1 - 0.05:
            x = GXO + k * 0.6; wm(lv, 'ceil', 'tbar').box(x - 0.012, x + 0.012, y - 0.012, y, z0, z1); k += 1
        k = math.ceil((z0 - GZO) / 0.6 + 1e-6)
        while GZO + k * 0.6 < z1 - 0.05:
            z = GZO + k * 0.6; wm(lv, 'ceil', 'tbar').box(x0, x1, y - 0.012, y, z - 0.012, z + 0.012); k += 1
    for x in LP['xs']:
        for z in LP['zs']:
            if lv == 0 and WL['x0'] - 0.7 < x < WL['x1'] + 0.7 and WL['z0'] - 0.2 < z < WL['z1'] + 0.2: continue
            if TROF:
                x, z = trof(x, z)
                wm(lv, 'ceil', 'trof').box(x - 0.6, x + 0.6, y - 0.04, y - 0.002, z - 0.3, z + 0.3)                 # 燈具外殼（凸出天花板 4 cm）
                hquad(mk(lv, 'light'), x - 0.57, x + 0.57, z - 0.27, z + 0.27, y - 0.044)                          # 發光面：單面朝下（tests/room_ceiling_unit.js：掛在天花板上的燈板要朝下）
                lvm = wm(lv, 'ceil', 'louvre')   # 格柵：只做從下面看得到的底面和兩個長邊（方塊的頂面、兩端看不到；一盞燈 8 條，兩層 90 盞）
                for oz in (-0.18, -0.09, 0.0, 0.09, 0.18):
                    za_, zb_ = z + oz - 0.004, z + oz + 0.004; hquad(lvm, x - 0.57, x + 0.57, za_, zb_, y - 0.058)
                    vquad_z(lvm, za_, x - 0.57, x + 0.57, y - 0.058, y - 0.044, -1); vquad_z(lvm, zb_, x - 0.57, x + 0.57, y - 0.058, y - 0.044, 1)
                for ox in (-0.38, 0.0, 0.38):
                    xa_, xb_ = x + ox - 0.004, x + ox + 0.004; hquad(lvm, xa_, xb_, z - 0.27, z + 0.27, y - 0.058)
                    vquad_x(lvm, xa_, z - 0.27, z + 0.27, y - 0.058, y - 0.044, -1); vquad_x(lvm, xb_, z - 0.27, z + 0.27, y - 0.058, y - 0.044, 1)
                continue
            wm(lv, 'ceil', 'tbar').box(x - 0.62, x + 0.62, y - 0.02, y - 0.004, z - 0.17, z + 0.17)
            hquad(mk(lv, 'light'), x - 0.6, x + 0.6, z - 0.15, z + 0.15, y - 0.021)
ceiling(0, C0, [(XI0, XI1, WL['z1'], ZI1), (XI0, WL['x0'], ZI0, WL['z1']), (WL['x1'], XI1, ZI0, WL['z1']), (WL['x0'], WL['x1'], ZI0, WL['z0'])])
for (a, b, c, d) in ((WL['x0'], WL['x1'], WL['z0'] - 0.02, WL['z0']), (WL['x0'], WL['x1'], WL['z1'], WL['z1'] + 0.02)):
    mk(0, 'wall').box(a, b, C0, Y1 - ST, c, d)
for (x, s) in ((WL['x0'], -1), (WL['x1'], 1)):
    mk(0, 'wall').box(x - 0.01, x + 0.01, C0, Y1 - ST, WL['z0'], WL['z1'])
ceiling(1, RY, [(XI0, XI1, ZI0, ZI1)])

# ================= 外牆（兩層，一層一塊）：窗洞、入口、往空橋的門 =================
def holes_for(lv, side):
    y0, y1 = (0.0, Y1) if lv == 0 else (Y1, RY); out = []
    for w in J['windows']:
        if w['wall'] != side or (w['lv'] | 0) != lv: continue
        out.append((w['a0'], w['a1'], max(w['y0'], y0), min(w['y1'], y1), w))
    if lv == 0 and side == EN['wall']: out.append((EN['a0'], EN['a1'], 0.0, 2.6, 'entrance'))
    if lv == 1 and BR and side == 'N': out.append((BR['x'] - BR['doorW'] / 2, BR['x'] + BR['doorW'] / 2, Y1, Y1 + BR['clear'], 'bridge'))
    for r in J['rooms']:
        ld = r.get('linkDoor')
        if ld and (r['lv'] | 0) == lv and side == ('S' if ld['z'] > 0 else 'N'): out.append((ld['x'] - ld['w'] / 2, ld['x'] + ld['w'] / 2, Y1, Y1 + 2.4, 'link'))
    return sorted(out, key=lambda h: h[0])
def wall_piece(lv, side, a0, a1, y0, y1):
    if a1 - a0 < 0.01 or y1 - y0 < 0.01: return
    m = wm(lv, side, 'wall')
    if side == 'N': m.box(a0, a1, y0, y1, Z0 - T / 2, Z0 + T / 2)
    elif side == 'S': m.box(a0, a1, y0, y1, Z1 - T / 2, Z1 + T / 2)
    elif side == 'W': m.box(X0 - T / 2, X0 + T / 2, y0, y1, a0, a1)
    else: m.box(X1 - T / 2, X1 + T / 2, y0, y1, a0, a1)
def on_wall(m, side, a0, a1, y0, y1, d0, d1):
    """貼在外牆內面的盒子：a＝沿牆、d＝從牆的內面往室內"""
    if side == 'N': m.box(a0, a1, y0, y1, ZI0 + d0, ZI0 + d1)
    elif side == 'S': m.box(a0, a1, y0, y1, ZI1 - d1, ZI1 - d0)
    elif side == 'W': m.box(XI0 + d0, XI0 + d1, y0, y1, a0, a1)
    else: m.box(XI1 - d1, XI1 - d0, y0, y1, a0, a1)
SPAN = {'N': (X0, X1), 'S': (X0, X1), 'W': (ZI0, ZI1), 'E': (ZI0, ZI1)}
for lv in (0, 1):
    y0, y1 = (0.0, Y1) if lv == 0 else (Y1, RY)
    for side in 'NSWE':
        a0, a1 = SPAN[side]; cur = a0
        for (ha, hb, hy0, hy1, w) in holes_for(lv, side):
            wall_piece(lv, side, cur, ha, y0, y1); wall_piece(lv, side, ha, hb, y0, hy0); wall_piece(lv, side, ha, hb, hy1, y1); cur = hb
            fr = wm(lv, side, 'frame')
            if isinstance(w, dict):                                                      # 窗：直櫺、上下框（在牆的內面，窗外的景在它們後面）、窗台
                n = w['n']; ln = hb - ha
                for i in range(n + 1):
                    a = ha + ln * i / n; e = 0.03 if 0 < i < n else 0.045
                    on_wall(fr, side, max(ha - 0.02, a - e), min(hb + 0.02, a + e), hy0, hy1, -0.02, 0.07)
                for yy, top in ((hy0, False), (hy1, True)):
                    on_wall(fr, side, ha - 0.04, hb + 0.04, yy - (0.05 if top else 0.0), yy + (0.0 if top else 0.05), -0.02, 0.07)
                on_wall(fr, side, ha, hb, hy0 + (hy1 - hy0) * 0.7 - 0.02, hy0 + (hy1 - hy0) * 0.7 + 0.02, -0.02, 0.06)   # 橫櫺（上面一格固定窗）
                on_wall(wm(lv, side, 'wood'), side, ha - 0.06, hb + 0.06, hy0 - 0.04, hy0, -0.02, 0.18)               # 窗台
            elif w == 'entrance':                                                        # 入口：鋁框玻璃雙開門＋上面的固定窗
                for (ua, ub) in ((ha, ha + 0.06), (hb - 0.06, hb), ((ha + hb) / 2 - 0.03, (ha + hb) / 2 + 0.03)): on_wall(fr, side, ua, ub, 0.0, 2.6, -0.08, 0.04)
                for (va, vb) in ((2.12, 2.18), (2.54, 2.6)): on_wall(fr, side, ha, hb, va, vb, -0.08, 0.04)
                for (ua, ub) in ((ha + 0.06, (ha + hb) / 2 - 0.03), ((ha + hb) / 2 + 0.03, hb - 0.06)):
                    on_wall(fr, side, ua, ub, 0.0, 0.12, -0.06, 0.02)
                    for d_ in (-0.03,):
                        g_ = mk(lv, 'glass')
                        if side == 'S': vquad_z(g_, ZI1 - d_, ua, ub, 0.12, 2.12, -1)
                    on_wall(mk(lv, 'steel'), side, (ua + ub) / 2 + (0.25 if ua < (ha + hb) / 2 else -0.27), (ua + ub) / 2 + (0.27 if ua < (ha + hb) / 2 else -0.25), 0.85, 1.3, 0.04, 0.09)
                if side == 'S': vquad_z(mk(lv, 'glass'), ZI1 + 0.03, ha + 0.06, hb - 0.06, 2.18, 2.54, -1)
            elif w in ('bridge', 'link'):                                                # 往空橋：門框（門洞本身打開；空橋那一頭是另一個模型）
                hh = hy1 - hy0
                for (ua, ub) in ((ha - 0.06, ha + 0.02), (hb - 0.02, hb + 0.06)): on_wall(fr, side, ua, ub, hy0, hy0 + hh + 0.06, -0.04, 0.05)
                on_wall(fr, side, ha - 0.06, hb + 0.06, hy0 + hh, hy0 + hh + 0.08, -0.04, 0.05)
        wall_piece(lv, side, cur, a1, y0, y1)
        # 踢腳板（外牆內面；門洞的地方斷開）
        cur = a0
        for (ha, hb, hy0, hy1, w) in holes_for(lv, side) + [(a1, a1, 0, 0, None)]:
            if hy0 <= y0 + 0.01 and ha - cur > 0.02: on_wall(wm(lv, side, 'base'), side, cur, ha, y0, y0 + 0.1, 0.0, 0.015)
            elif ha - cur > 0.02: on_wall(wm(lv, side, 'base'), side, cur, ha, y0, y0 + 0.1, 0.0, 0.015)
            cur = max(cur, hb) if hy0 <= y0 + 0.01 else cur

# ================= 隔間牆（門洞上方門楣、門框、兩面踢腳板）=================
for w in J['walls']:
    lv = w['lv'] | 0; y0 = Y1 if lv else 0.0; h = (RY - Y1) if lv else C0
    horiz = abs(w['z0'] - w['z1']) < 1e-6
    a0, a1 = (min(w['x0'], w['x1']), max(w['x0'], w['x1'])) if horiz else (min(w['z0'], w['z1']), max(w['z0'], w['z1']))
    c = w['z0'] if horiz else w['x0']; gaps = w.get('gaps') or []
    pm, bm_, fm = mk(lv, 'part'), mk(lv, 'base'), mk(lv, 'frame')
    def box_a(m, a, b, ya, yb, t0, t1):
        if horiz: m.box(a, b, ya, yb, c + t0, c + t1)
        else: m.box(c + t0, c + t1, ya, yb, a, b)
    for (a, b) in seg_gaps(a0, a1, gaps):
        if b - a < 0.02: continue
        box_a(pm, a, b, y0, y0 + h, -0.1, 0.1)
        box_a(bm_, a, b, y0, y0 + 0.1, -0.115, -0.1); box_a(bm_, a, b, y0, y0 + 0.1, 0.1, 0.115)
    for (g0, g1) in gaps:
        if h > 2.4: box_a(pm, g0, g1, y0 + 2.4, y0 + h, -0.1, 0.1)
        for (a, b) in ((g0 - 0.06, g0 + 0.01), (g1 - 0.01, g1 + 0.06)): box_a(fm, a, b, y0, y0 + 2.46, -0.12, 0.12)   # 門框（不鏽鋼）
        box_a(fm, g0 - 0.06, g1 + 0.06, y0 + 2.4, y0 + 2.46, -0.12, 0.12)
# 隔間的材質名換成 tb_partition（已經是）；外牆的材質 tb_wall
# 樓梯井北邊、平台以北的空間：兩層都封起來（導航兩層都不能走）
for lv in (0, 1):
    y0, y1 = (0.0, C0) if lv == 0 else (Y1, RY)
    mk(lv, 'part').box(WL['x0'], WL['x1'], y0, y1, WL['z0'] - 0.2, WL['z0'])

# ================= 樓梯（A 跑往北爬到平台、B 跑往南爬回二樓；磨石子踏面＋深色止滑條、實心到地面）=================
g = mk(0, 'granite'); nos = mk(0, 'nosing')
for k in range(SA['risers']):
    top = (k + 1) * RS; za, zb = SA['z1'] - (k + 1) * TR, SA['z1'] - k * TR
    if k == SA['risers'] - 1: za = SA['z0']
    g.box(SA['x0'], SA['x1'], 0.0, top, za, zb); nos.box(SA['x0'] + 0.04, SA['x1'] - 0.04, top, top + 0.004, zb - 0.06, zb - 0.01)
g.box(LD['x0'], LD['x1'], 0.0, LD['y'], LD['z0'], LD['z1'])
for j in range(SB['risers']):
    top = LD['y'] + (j + 1) * RS; za, zb = SB['z0'] + j * TR, SB['z0'] + (j + 1) * TR
    if j == SB['risers'] - 1: zb = SB['z1']
    g.box(SB['x0'], SB['x1'], 0.0, top, za, zb); nos.box(SB['x0'] + 0.04, SB['x1'] - 0.04, top, top + 0.004, za + 0.01, za + 0.06)
mk(0, 'part').box(MW['x0'], MW['x1'], 0.0, Y1 + 0.9, SA['z0'], SA['z1'])                          # 兩跑中間的牆（到二樓樓板上 0.9 m）
mk(0, 'base').box(MW['x0'] - 0.01, MW['x1'] + 0.01, Y1 + 0.9, Y1 + 0.95, SA['z0'], SA['z1'])
st = mk(0, 'steel')
def handrail(pts, r=0.022):
    for a, b in zip(pts, pts[1:]): st.cyl(a, b, r, seg=8)
H = 0.9
# 外側扶手（貼牆）：A 跑西側、B 跑東側；平台三面
handrail([(SA['x0'] + 0.06, RS + H, SA['z1'] - 0.1), (SA['x0'] + 0.06, SA['risers'] * RS + H, SA['z0'] + 0.1)])
handrail([(SB['x1'] - 0.06, LD['y'] + RS + H, SB['z0'] + 0.1), (SB['x1'] - 0.06, LD['y'] + SB['risers'] * RS + H, SB['z1'] - 0.1)])
handrail([(LD['x0'] + 0.06, LD['y'] + H, LD['z1']), (LD['x0'] + 0.06, LD['y'] + H, LD['z0'] + 0.06), (LD['x1'] - 0.06, LD['y'] + H, LD['z0'] + 0.06), (LD['x1'] - 0.06, LD['y'] + H, LD['z1'])])
for (x, z0_, z1_, y0_, y1_) in ((SA['x0'] + 0.06, SA['z1'] - 0.1, SA['z0'] + 0.1, RS + H, SA['risers'] * RS + H), (SB['x1'] - 0.06, SB['z0'] + 0.1, SB['z1'] - 0.1, LD['y'] + RS + H, LD['y'] + SB['risers'] * RS + H)):
    for t in (0.15, 0.5, 0.85):                                                                     # 扶手的托架
        z = z0_ + (z1_ - z0_) * t; y = y0_ + (y1_ - y0_) * t
        st.cyl((x, y - 0.06, z), (x - (0.05 if x < 0 or x == SA['x0'] + 0.06 else -0.05), y - 0.06, z), 0.008, seg=6)
# 二樓樓板邊（樓梯井）的欄杆：鋼扶手＋玻璃（井的西側、南側 A 跑上面）
gl = mk(1, 'glass')
for (pa, pb) in (((WL['x0'], Y1, WL['z0']), (WL['x0'], Y1, WL['z1'])), ((WL['x0'], Y1, WL['z1']), (SB['x0'] - 0.02, Y1, WL['z1']))):
    handrail([(pa[0], Y1 + 1.0, pa[2]), (pb[0], Y1 + 1.0, pb[2])], r=0.025)
    if abs(pa[0] - pb[0]) < 1e-6: vquad_x(gl, pa[0] + 0.02, min(pa[2], pb[2]), max(pa[2], pb[2]), Y1 + 0.1, Y1 + 0.95, 1)
    else: vquad_z(gl, pa[2] - 0.02, min(pa[0], pb[0]), max(pa[0], pb[0]), Y1 + 0.1, Y1 + 0.95, -1)
    n = max(2, int(math.hypot(pb[0] - pa[0], pb[2] - pa[2]) / 1.2) + 1)
    for i in range(n + 1):
        t = i / n; x = pa[0] + (pb[0] - pa[0]) * t; z = pa[2] + (pb[2] - pa[2]) * t
        st.cyl((x, Y1, z), (x, Y1 + 1.0, z), 0.02, seg=8)

# ================= 房間：階梯教室、教室、關著的房間 =================
for r in J['rooms']:
    lv = r['lv'] | 0; Y = J['floors'][lv]['y']
    if r['kind'] == 'lecture':
        up = -1 if r.get('stage') == 'S' else 1; sx0, sx1 = r['seatX0'], r['seatX1']
        wx0, wx1 = min(a[0] for a in r['aisles']), max(a[1] for a in r['aisles'])
        cp, rs, ns, sv = mk(lv, 'carpet'), mk(lv, 'riser'), mk(lv, 'nosing'), mk(lv, 'stepvinyl')
        for q in r['rowsData']:
            za, zb = min(q['front'], q['back']), max(q['front'], q['back']); half = (q['y'] - q['yPrev']) / 2
            cp.box(sx0, sx1, Y, Y + q['y'], za, zb)                                                   # 座位區的平台（和遊戲備用模型同尺寸）
            rs.box(sx0, sx1, Y + q['yPrev'], Y + q['y'], q['front'] - up * 0.022, q['front'] - up * 0.0005) if up < 0 else rs.box(sx0, sx1, Y + q['yPrev'], Y + q['y'], q['front'] - 0.0005, q['front'] + 0.022)
            ns.box(wx0, wx1, Y + q['y'] - 0.035, Y + q['y'], *(sorted([q['front'], q['front'] + up * 0.05])))
            for (a0, a1) in r['aisles']:
                fa, fb = min(q['stepEnd'], q['back']), max(q['stepEnd'], q['back'])
                z_1 = q['front'] + up * r['stepD']
                cp.box(a0, a1, Y, Y + q['yPrev'] + half, *(sorted([q['front'], q['front'] + up * r['stepD']])))
                cp.box(a0, a1, Y, Y + q['y'], *(sorted([q['front'] + up * r['stepD'], q['front'] + up * r['stepD'] * 2])))
                cp.box(a0, a1, Y, Y + q['y'], fa, fb)
                for (zz, yy) in ((q['front'], q['yPrev'] + half), (z_1, q['y'])):
                    sv.box(a0, a1, Y + yy, Y + yy + 0.006, *(sorted([zz, zz + up * 0.06])))
        if r.get('lectern'):
            lc = r['lectern']; wd = mk(lv, 'wood')
            wd.box(lc['x'] - lc['w'] / 2, lc['x'] + lc['w'] / 2, Y, Y + 1.05, lc['z'] - lc['d'] / 2, lc['z'] + lc['d'] / 2)
            mk(lv, 'dark').box(lc['x'] - lc['w'] / 2 - 0.05, lc['x'] + lc['w'] / 2 + 0.05, Y + 1.05, Y + 1.1, lc['z'] - lc['d'] / 2 - 0.05, lc['z'] + lc['d'] / 2 + 0.05)
        wz = r['z1'] if up < 0 else r['z0']                                                          # 講台那一面牆（外牆的內面）
        wz_in = wz                                                                                   # 房間的邊界就是牆的內面（z1＝D/2−T/2）
        if r.get('board'):
            b = r['board']; zf = wz_in + up * 0.02
            mk(lv, 'board').box(b['x'] - b['w'] / 2, b['x'] + b['w'] / 2, Y + b['y0'], Y + b['y1'], *(sorted([wz_in, zf + up * 0.02])))
            mk(lv, 'frame').box(b['x'] - b['w'] / 2 - 0.05, b['x'] + b['w'] / 2 + 0.05, Y + b['y0'] - 0.05, Y + b['y0'], *(sorted([wz_in, wz_in + up * 0.1])))
            mk(lv, 'tray').box(b['x'] - b['w'] / 2, b['x'] + b['w'] / 2, Y + b['y0'] - 0.07, Y + b['y0'] - 0.04, *(sorted([wz_in, wz_in + up * 0.08])))
        if r.get('screen'):
            sc = r['screen']; zf = wz_in + up * 0.12                                                # 投影幕本身是遊戲畫的白色平面（不在備用模型的群組裡、不會被藏），這裡只做上面的捲軸盒
            mk(lv, 'dark').box(sc['x'] - sc['w'] / 2 - 0.1, sc['x'] + sc['w'] / 2 + 0.1, Y + sc['y1'], Y + sc['y1'] + 0.12, *(sorted([wz_in, zf])))   # 捲軸盒
    elif r['kind'] == 'classroom':
        bb = r['blackboard']; s = 1 if r.get('board') == 'W' else -1; x = bb['x']
        mk(lv, 'board').box(min(x, x + s * 0.04), max(x, x + s * 0.04), Y + 1.0, Y + 2.2, bb['z'] - bb['len'] / 2, bb['z'] + bb['len'] / 2)
        mk(lv, 'frame').box(min(x, x + s * 0.05), max(x, x + s * 0.05), Y + 0.96, Y + 1.0, bb['z'] - bb['len'] / 2 - 0.05, bb['z'] + bb['len'] / 2 + 0.05)
        mk(lv, 'tray').box(min(x, x + s * 0.08), max(x, x + s * 0.08), Y + 0.97, Y + 0.99, bb['z'] - bb['len'] / 2, bb['z'] + bb['len'] / 2)
        for zz in (bb['z'] - bb['len'] / 2 - 0.05, bb['z'] + bb['len'] / 2 + 0.05): mk(lv, 'frame').box(min(x, x + s * 0.05), max(x, x + s * 0.05), Y + 0.96, Y + 2.24, zz - 0.02, zz + 0.02)
        mk(lv, 'frame').box(min(x, x + s * 0.05), max(x, x + s * 0.05), Y + 2.2, Y + 2.24, bb['z'] - bb['len'] / 2 - 0.05, bb['z'] + bb['len'] / 2 + 0.05)
        tc = r['teacher']                                                                               # 講桌（木頭、前面一塊深色面板）
        mk(lv, 'wood').box(tc['x'] - tc['w'] / 2, tc['x'] + tc['w'] / 2, Y, Y + 0.95, tc['z'] - tc['d'] / 2, tc['z'] + tc['d'] / 2)
        mk(lv, 'dark').box(tc['x'] - tc['w'] / 2 - 0.03, tc['x'] + tc['w'] / 2 + 0.03, Y + 0.95, Y + 0.98, tc['z'] - tc['d'] / 2 - 0.03, tc['z'] + tc['d'] / 2 + 0.03)
    elif r['kind'] == 'closed':
        dz = r['doorZ'] if r.get('doorZ') is not None else r['z0']; out = 1 if abs(dz - r['z1']) < 1e-6 else -1
        a, b_ = r['door']                                                                               # 門板＋門框（在走廊那一側的牆面上）
        mk(lv, 'door').box(a + 0.05, b_ - 0.05, Y, Y + 2.3, *(sorted([dz + out * 0.1, dz + out * 0.16])))
        for (ua, ub) in ((a - 0.02, a + 0.05), (b_ - 0.05, b_ + 0.02)): mk(lv, 'frame').box(ua, ub, Y, Y + 2.36, *(sorted([dz + out * 0.1, dz + out * 0.17])))
        mk(lv, 'frame').box(a - 0.02, b_ + 0.02, Y + 2.3, Y + 2.36, *(sorted([dz + out * 0.1, dz + out * 0.17])))
        mk(lv, 'steel').box(b_ - 0.2, b_ - 0.12, Y + 1.0, Y + 1.04, *(sorted([dz + out * 0.16, dz + out * 0.22])))   # 門把

# ================= 階梯教室的長桌、翻椅（BOYA-LM-1030，LAWWW2-B 10-30；照霖澤館 201 v2 classroom_201.py 的做法）=================
# 原本是遊戲的 Z3.desk／Z3.chair（方塊桌、方塊椅，一排一排一模一樣）。現在：
#   長桌＝桌板分四段（接縫）、圓角、朝講台那一面的擋板、懸臂鋼板桌腳（在兩個座位中間，膝蓋不會撞到）、桌下置物架、桌上電源盒；桌面在那一排的平台上 0.75 m（teach3d.js LECT_DESK_TOP）。
#   翻椅＝地上的固定座＋中柱＋轉軸、模壓夾板的椅背（弧形、往後仰）；椅面（SEATPANS，所有階梯教室一個網格）：遊戲把沒有人坐的位子掀起來（zones3d.js 的 seatFold，和 201 同一套）。
#   椅面上緣 0.475（201 一樣；坐姿高度不變）、座位位置照配置（座位、導航、走近點都不動）。
# 名字 LECT_<房號>_*、SEATPANS 不併進大網格（遊戲看到 SEATPANS 就藏起備用的方塊桌椅；一間一組，鏡頭裡只有一間時另一間整組被裁掉）。
import bmesh   # noqa: E402
def shell(m, P, nu, nv, off):
    """曲面板（模壓夾板的椅背、椅面）：P(u,v)＝正面的點（遊戲座標，u、v 都是 0..1），off＝背面的位移（遊戲座標）；正面、背面、周邊封起來，平滑著色"""
    bm = m.bm; Fv = [[bm.verts.new(g2b(*P(i / nu, j / nv))) for j in range(nv + 1)] for i in range(nu + 1)]
    Kv = [[bm.verts.new(g2b(*[a + b for a, b in zip(P(i / nu, j / nv), off)])) for j in range(nv + 1)] for i in range(nu + 1)]
    fs = []
    for i in range(nu):
        for j in range(nv):
            fs.append(bm.faces.new((Fv[i][j], Fv[i + 1][j], Fv[i + 1][j + 1], Fv[i][j + 1]))); fs.append(bm.faces.new((Kv[i][j], Kv[i][j + 1], Kv[i + 1][j + 1], Kv[i + 1][j])))
    ring = [(i, 0) for i in range(nu)] + [(nu, j) for j in range(nv)] + [(i, nv) for i in range(nu, 0, -1)] + [(0, j) for j in range(nv, 0, -1)]
    for k in range(len(ring)):
        (a0, a1), (b0, b1) = ring[k], ring[(k + 1) % len(ring)]; fs.append(bm.faces.new((Fv[a0][a1], Fv[b0][b1], Kv[b0][b1], Kv[a0][a1])))
    bmesh.ops.recalc_face_normals(bm, faces=fs)
    for f in fs: f.smooth = True
def prism_x(m, xa, xb, zy):
    """(z, y) 多邊形沿 x 擠出（桌腳的懸臂鋼板）"""
    bm = m.bm; A = [bm.verts.new(g2b(xa, y, z)) for (z, y) in zy]; Bv = [bm.verts.new(g2b(xb, y, z)) for (z, y) in zy]
    fs = [bm.faces.new(A), bm.faces.new(list(reversed(Bv)))]
    for i in range(len(zy)): j = (i + 1) % len(zy); fs.append(bm.faces.new((A[i], A[j], Bv[j], Bv[i])))
    bmesh.ops.recalc_face_normals(bm, faces=fs)
LECT = [r for r in J['rooms'] if r['kind'] == 'lecture']
LMESH = {}
if LECT:
    # 桌面、擋板：淺橡木色的木紋美耐板（備用模型是很深的 #3b3330）。第一版 fine_grained_wood 對比太高（桌面看起來斑斑點點、像髒的）、擋板深灰（從講台看是一條一條黑帶）
    M['ldesk'] = L.pbr('tb_lect_desk', 'wood_table_001', tile=1.4, target='#b08e6a', contrast=0.6, maps=('diff',), res=256, rough_value=0.45)
    M['lpanel'] = L.pbr('tb_lect_panel', 'wood_table_001', tile=1.8, target='#97785a', contrast=0.5, maps=('diff',), res=256, rough_value=0.55)
    M['lsteel'] = L.flat('tb_lect_steel', '#2e3033', rough=0.45, metal=0.35)                                                         # 桌腳、椅腳：深灰烤漆鋼
    M['lseat'] = L.pbr('tb_lect_seat', 'walnut_veneer', tile=0.7, target='#a77650', normal=0.35, maps=('diff', 'nor'), res=256, rough_value=0.5)   # 椅面、椅背：模壓夾板（201 同色）
    for _k in ('ldesk', 'lpanel', 'lsteel', 'lseat'): M[_k].use_backface_culling = True
def lm_(name, key):
    if name not in LMESH: LMESH[name] = Mesh(name, M[key])
    return LMESH[name]
for r in LECT:
    lv = r['lv'] | 0; Y = J['floors'][lv]['y']; rid = r['id']; fwd = 1 if r.get('stage') == 'S' else -1   # 學生面向 fwd（+z＝講台在南邊）
    dsk, pnl, stl, sea = lm_(f'LECT_{rid}_desk', 'ldesk'), lm_(f'LECT_{rid}_panel', 'lpanel'), lm_(f'LECT_{rid}_steel', 'lsteel'), lm_(f'LECT_{rid}_seat', 'lseat')
    pans = lm_('SEATPANS' if lv == 0 else f'SEATPANS_L{lv}', 'lseat')
    sx0, sx1, dd = r['seatX0'], r['seatX1'], r['deskD']
    for q in r['rowsData']:
        h = Y + q['y']; top = h + 0.75; zF = q['deskZ'] + fwd * dd / 2; zR = q['deskZ'] - fwd * dd / 2   # zF＝桌子朝講台那一邊、zR＝學生那一邊
        za, zb = min(zF, zR), max(zF, zR)
        xs = [sx0 + i * (sx1 - sx0) / 4 for i in range(5)]
        for a, b in zip(xs, xs[1:]): dsk.rbox(a + 0.0015, b - 0.0015, top - 0.03, top, za, zb, r=0.006, seg=2)          # 桌板（四段）
        pnl.box(sx0, sx1, h + 0.04, top - 0.03, *sorted([zF - fwd * 0.004, zF - fwd * 0.024]))                          # 擋板（朝講台）
        rs = sorted(s['x'] for s in r['seats'] if s.get('row') == q['r'])
        legs = [sx0 + 0.012, sx1 - 0.012] + [(rs[k] + rs[k + 1]) / 2 for k in range(1, len(rs) - 1, 2)]
        for bx in legs:                                                                                                  # 懸臂鋼板桌腳：擋板那一側落地、往學生那一側斜上去托住桌板
            prism_x(stl, bx - 0.006, bx + 0.006, [(zF - fwd * 0.024, h), (zF - fwd * 0.17, h), (zR + fwd * 0.035, top - 0.03), (zF - fwd * 0.024, top - 0.03)])
        stl.box(sx0 + 0.02, sx1 - 0.02, top - 0.235, top - 0.225, *sorted([zF - fwd * 0.03, zF - fwd * 0.33]))       # 桌下置物架
        stl.box(sx0 + 0.02, sx1 - 0.02, top - 0.235, top - 0.2, *sorted([zF - fwd * 0.325, zF - fwd * 0.335]))       # 置物架的前緣
        for k in range(1, len(rs) - 1, 3):                                                                               # 桌上的電源盒（擋板那一側，兩個位子共用一個）
            ox = (rs[k] + rs[k + 1]) / 2; mk(lv, 'dark').box(ox - 0.07, ox + 0.07, top, top + 0.007, *sorted([zF - fwd * 0.03, zF - fwd * 0.11]))
    for st in r['seats']:
        sx, sz, h = st['x'], st['z'], Y + st['y']; f = fwd   # 本地：+lz＝學生面向的方向（配置的座位 yaw：講台在南＝0、在北＝π）
        def W_(lx, ly, lz, sx=sx, sz=sz, h=h, f=f): return (sx + lx * f, h + ly, sz + lz * f)   # 面向 −z 時左右也要翻（右手方向不變）
        def pan_P(u, v):   # u：左右、v：前（0）到後（1）
            x = -0.24 + 0.48 * u; xn = x / 0.24; z = 0.25 - 0.42 * v
            y = 0.475 + 0.01 * xn * xn - (0.032 * (1 - v / 0.22) ** 2 if v < 0.22 else 0.0)                            # 中間微凹、前緣往下彎
            if v < 0.1 or v > 0.92: x *= 0.93                                                                            # 四個角收一點
            return W_(x, y, z)
        shell(pans, pan_P, 6, 5, (0.0, -0.022, 0.0))
        def back_P(u, v):  # u：左右、v：下（0）到上（1）
            x = -0.25 + 0.5 * u; xn = x / 0.25; y = 0.53 + 0.38 * v; z = -0.205 - 0.07 * v + 0.03 * xn * xn             # 往後仰、左右往前包
            e = max(0.0, abs(2 * v - 1) - 0.7) / 0.3; x *= 1 - 0.1 * e * e
            return W_(x, y, z)
        shell(sea, back_P, 6, 4, (0.0, 0.0, -0.018 * f))
        def lbox(m, lx0, lx1, ly0, ly1, lz0, lz1):
            a, b = W_(lx0, ly0, lz0), W_(lx1, ly1, lz1); m.box(min(a[0], b[0]), max(a[0], b[0]), a[1], b[1], min(a[2], b[2]), max(a[2], b[2]))
        stl.cyl(W_(0, 0, -0.06), W_(0, 0.012, -0.06), 0.1, seg=8)                                                       # 地上的固定座
        stl.cyl(W_(0, 0.012, -0.06), W_(0, 0.41, -0.06), 0.032, seg=8, caps=False)                                      # 中柱
        lbox(stl, -0.05, 0.05, 0.38, 0.44, -0.13, -0.02)                                                                 # 柱頭（轉軸座）
        lbox(stl, -0.21, 0.21, 0.425, 0.445, -0.17, -0.13)                                                               # 椅面的轉軸
        for sgn in (-1, 1):   # 椅背的支架：柱頭往兩側斜上去、托住椅背下緣兩角（第一版是椅背後面一根直管＋固定板，從後排看每張椅背都是一個黑十字）
            stl.cyl(W_(sgn * 0.04, 0.42, -0.11), W_(sgn * 0.17, 0.56, -0.21), 0.014, seg=6)

# ================= 沙發（公共空間）、講座資訊螢幕的框 =================
for grp in (J.get('groups') or []):
    lv = grp['lv'] | 0; Y = J['floors'][lv]['y']
    for so in (grp.get('sofas') or []):
        c, s = math.cos(so['ry']), math.sin(so['ry'])
        def at(ox, oz): return (so['x'] + ox * c + oz * s, so['z'] - ox * s + oz * c)
        def rb(m, ox0, ox1, y0_, y1_, oz0, oz1):
            pts = [at(ox, oz) for ox in (ox0, ox1) for oz in (oz0, oz1)]; xs = [p[0] for p in pts]; zs = [p[1] for p in pts]
            m.rbox(min(xs), max(xs), Y + y0_, Y + y1_, min(zs), max(zs), r=0.04, seg=2)
        fm_ = mk(lv, 'sofa'); ln = so['len']
        rb(fm_, -ln / 2, ln / 2, 0.14, 0.3, -0.38, 0.38)                                                # 底座
        n = so.get('seats', 2)
        for i in range(n): rb(fm_, -ln / 2 + ln * i / n + 0.02, -ln / 2 + ln * (i + 1) / n - 0.02, 0.3, 0.44, -0.2, 0.38)   # 坐墊
        rb(fm_, -ln / 2, ln / 2, 0.3, 0.82, -0.38, -0.2)                                                # 靠背
        for sx in (-1, 1): rb(fm_, sx * ln / 2 - (0.16 if sx > 0 else 0.0), sx * ln / 2 + (0.0 if sx > 0 else 0.16), 0.14, 0.62, -0.38, 0.38)   # 扶手
        for (ox, oz) in ((-ln / 2 + 0.08, -0.3), (ln / 2 - 0.08, -0.3), (-ln / 2 + 0.08, 0.3), (ln / 2 - 0.08, 0.3)):
            x, z = at(ox, oz); mk(lv, 'sofaleg').cyl((x, Y, z), (x, Y + 0.14, z), 0.022, seg=6)
for bd in (J.get('boards') or []):
    if bd.get('style') != 'screen': continue
    lv = bd['lv'] | 0; Y = J['floors'][lv]['y']; sw = bd['w']; sh = sw * 0.6; y0 = Y + 1.25
    c, s = math.cos(bd['ry']), math.sin(bd['ry'])
    if abs(s) < 0.5: mk(lv, 'dark').box(bd['x'] - sw / 2 - 0.04, bd['x'] + sw / 2 + 0.04, y0 - 0.04, y0 + sh + 0.04, bd['z'] - 0.03 * c, bd['z'] + 0.03 * c) if c > 0 else None
    else: mk(lv, 'dark').box(bd['x'] - 0.03, bd['x'] + 0.03, y0 - 0.04, y0 + sh + 0.04, bd['z'] - sw / 2 - 0.04, bd['z'] + sw / 2 + 0.04)

# ================= 輸出 =================
for (lv, key), m in MESH.items():
    if m.empty(): continue
    m.finish(G[lv], smooth=key in ('sofa', 'steel', 'sofaleg'))
for (lv, side, key), m in WMESH.items():
    if m.empty(): continue
    m.finish(G[lv], props={'dir': DIRS[side]})
for name, m in LMESH.items():   # 階梯教室的桌椅：一間一組（SEATPANS 所有階梯教室一個）
    if m.empty(): continue
    m.finish(G[1 if name.endswith('_L1') else 0], smooth='steel' in name, uv='steel' not in name)   # 鋼件：平滑著色、不要 UV（單色材質；圓管共用頂點，檔案小一點；方塊的邊照樣是硬的）
KEEP = lambda ob: 'WALL_' in ob.name or ob.name.startswith(('LECT_', 'SEATPANS'))
L.merge_by_material(G[0], keep=KEEP, key=lambda ob: 'L0')
L.merge_by_material(G[1], keep=KEEP, key=lambda ob: 'L1')
# 光照貼圖分給每個網格的比例（自訂屬性 lm，lightbake/bake_room.py 讀；遊戲不用）：天花板大片、平的，分少一點；階梯教室的平台（玩家坐著、走著一直看得到）多一點
LMR = (('_ceil', 0.35), ('_slab', 0.2), ('WALL_', 0.6), ('_part', 0.7), ('_carpet', 1.3), ('_riser', 1.0), ('_floor', 1.0))
for ob in root.children_recursive:
    if ob.type != 'MESH': continue
    for k_, v_ in LMR:
        if k_ in ob.name: ob['lm'] = v_; break
tris = 0
for ob in root.children_recursive:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
st_ = L.export(OUT, gpu_instances=False)
L.write_json(OUT[:-4] + '.json', dict(st_, tris_total=tris, layout=f'src/data/{SET}_layout.js', note='兩層室內的殼＋固定設備（黑板、講桌、階梯教室平台、沙發、關著的門）' +
             ('＋階梯教室的長桌、翻椅（LECT_*、SEATPANS：遊戲看到就藏起備用的方塊桌椅、空位掀起來）；其他桌椅由遊戲放' if LECT else '；桌椅由遊戲放')))
print(SET, 'tris', tris)
