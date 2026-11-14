"""五湖四海（118 巷店 id home，水餃店）的室內——L118-SHOPS-REDO-1111（USER_WANTS X338；使用者 2026-11-11 規格 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md
＋參考圖 docs/handoff/user_specs/l118_ref/int_home.webp）。LAWWW 的 Blender 子代理臨時代 LAWWW2 做（2026-11-11）。
  /opt/blenv/bin/python tools/blender/env_second/l118_int_home.py [-- --out-dir assets/models/env/second_ai] [--preview <輸出資料夾>]
產出（覆蓋）：assets/models/env/second_ai/l118_home.glb、l118_home.json、l118_home.layout.json。一間店一個 Blender 程序（lib2 的貼圖快取）。
做法：import lane118_shops（LAWWW2 的九間店生成器，不修改它）用它的 Shop／shell／零件／navcheck；室內寬深、門的位置（SPEC 的 W、D、door_x）維持原值。
  老麵館：米白方磚牆、灰地磚、日光燈；左牆（西）一整條咖啡色皮面長條座位＋不鏽鋼桌＋木面圓凳；中間、右牆不鏽鋼桌；
  最裡面開放式煮水餃區（大鍋冒蒸氣、漏勺、一盤盤包好的水餃、不鏽鋼工作檯、抽油煙罩、深藍門簾）；右前不鏽鋼餐具架（碗、茶壺、保溫茶桶）；
  左牆手寫價目板（紅框）、木牌「手工水餃 現包現煮」、綠色舊壁扇、老照片；右牆圓掛鐘、山水畫、「五湖四海」掛軸。
  價目板的品名、價錢照使用者文字規格（不照參考圖：圖上有規格沒有的品項、不同的價錢）。
這支檔另外有三樣給 l118_int_cafe2.py 共用（同一個子代理做的兩間）：finish2（照 lane118_shops.finish，多了平滑著色、seat 的 r、notrap）、notrap（站得到的地方都走得回出口）、ensure_view、preview。"""
import json, math, os, random, struct, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as LS   # noqa: E402  （有 __main__ 保護：import 不會開始產生；會讀 sys.argv 的 --out-dir）
from lane118_shops import L, B, Mesh, CMesh, g2b, bpy, bmesh, Matrix, PI, H, ccyl, csph, clathe   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter   # noqa: E402

TX = LS.TX; GEN = LS.GEN; F = TX.F; hexrgb = TX.hexrgb
STEEL = '#b4b9bd'; STEEL_D = '#8e9499'


# ================= 共用（home、cafe2） =================
def ensure_view(sid):
    """門外的巷景 textures/gen/l118_view_<id>.png（從街景模型拍的；沒進版控）：沒有的話從現有的 l118_<id>.glb 把那張圖取出來用（LAWWW2 街景定了以後會重拍）"""
    dst = os.path.join(GEN, f'l118_view_{sid}.png')
    if os.path.exists(dst): return True
    glb = os.path.join(LS.OUTDIR, f'l118_{sid}.glb')
    if not os.path.exists(glb): glb = os.path.join(L.ROOT, 'assets/models/env/second_ai', f'l118_{sid}.glb')
    try:
        f = open(glb, 'rb'); f.read(12); n, _ = struct.unpack('<II', f.read(8)); j = json.loads(f.read(n)); m, _ = struct.unpack('<II', f.read(8)); bin_ = f.read(m)
        im = next(i for i in j['images'] if i.get('name') == f'l118_view_{sid}'); bv = j['bufferViews'][im['bufferView']]
        import io
        Image.open(io.BytesIO(bin_[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']])).convert('RGB').save(dst); print('門外的巷景：從現有的 GLB 取出', dst); return True
    except Exception as e:
        print('門外的巷景取不到（用淺灰）：', e); return False


def uvr(REG, key, size=1024):
    x0, y0, x1, y1 = REG[key]; return (x0 / size, 1 - y1 / size, x1 / size, 1 - y0 / size)


def pr(c, side, a0, a1, y0, y1, key, inset=0.015, reg=None):
    """牆上的印刷品（自己的貼圖集 c.REG；做法照 lane118_shops.printed）：W、E 牆的 a0..a1 是 z 的範圍"""
    rect = uvr(reg or c.REG, key); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'iprint', c.M['iprint'])
    if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
    else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
    LS.uvquad(m, pts, rect)


def frame(c, side, a0, a1, y0, y1, col, t=0.035, d=0.022):
    """畫框、匾的框：四條倒角的邊（不是一塊板）；side 牆、a0..a1 沿牆"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'trim', c.M['vc'], cm=True)
    for (b0, b1, v0, v1) in ((a0 - t, a1 + t, y0 - t, y0), (a0 - t, a1 + t, y1, y1 + t), (a0 - t, a0, y0, y1), (a1, a1 + t, y0, y1)):
        if side == 'N': m.crbox(b0, b1, v0, v1, Z0, Z0 + d, col, r=0.006, seg=1)
        elif side == 'S': m.crbox(b0, b1, v0, v1, Z1 - d, Z1, col, r=0.006, seg=1)
        elif side == 'W': m.crbox(X0, X0 + d, v0, v1, b0, b1, col, r=0.006, seg=1)
        else: m.crbox(X1 - d, X1, v0, v1, b0, b1, col, r=0.006, seg=1)


def cell_(m, ctr, rx, ry, rz, col, seg=6, rings=3, rotz=0.0):
    """頂點色的橢球（水餃、菜、蒸氣以外的小東西）"""
    f0 = set(m.bm.faces); m.ell(ctr, rx, ry, rz, seg=seg, rings=rings, matrix=Matrix.Rotation(rotz, 4, 'Z')); m.paint([q for q in m.bm.faces if q not in f0], col)


def stool_wood(c, x, z, seat='wood'):
    """木面圓凳（不鏽鋼腳、踏環）：座面是車出來的圓盤（邊緣倒圓）；seat='wood' 用木紋材質、其他＝頂點色色碼"""
    prof = [(0.0, 0.412), (0.15, 0.412), (0.166, 0.42), (0.17, 0.434), (0.164, 0.448), (0.15, 0.455), (0.0, 0.455)]
    if seat == 'wood': bm = L.lathe(prof, seg=16); c.wood.add_bm(bm, Matrix.Translation(g2b(x, 0.0, z))); bm.free()
    else: clathe(c.vc, prof, x, 0.0, z, seat, seg=16)
    ccyl(c.vm, (x, 0.396, z), (x, 0.413, z), 0.12, STEEL_D, seg=12)
    for k in range(4):
        a = k * PI / 2 + PI / 4; ca, sa = math.cos(a), math.sin(a)
        ccyl(c.vm, (x + 0.095 * ca, 0.4, z + 0.095 * sa), (x + 0.155 * ca, 0.0, z + 0.155 * sa), 0.011, STEEL, seg=6)
    rr = 0.132
    for k in range(8):
        a0, a1 = k * PI / 4 + PI / 8, (k + 1) * PI / 4 + PI / 8
        ccyl(c.vm, (x + rr * math.cos(a0), 0.15, z + rr * math.sin(a0)), (x + rr * math.cos(a1), 0.15, z + rr * math.sin(a1)), 0.007, STEEL, seg=4, caps=False)


def notrap(lay, cell=0.4, step=0.2, R=0.32):
    """站得到的每一個地方都走得回出口（BUG-XIANGUO-TRAP-1111 的教訓：汀州鮮果兩堆箱子之間 0.7 m 的縫，人站得進去、找路走不出來）。
    導航格照 lane118_shops.navcheck（0.4 m、牆內縮 0.25 m、blockRect 最小 0.4 m；路線經過的格子要 clear(0.33)）：
    每 step 掃一點，站得住（玩家半徑 R）的點，它那一格或旁邊一格要在「從出生點走得到」的範圍裡。回傳問題清單"""
    Bd = lay['bounds']; ox, oz = Bd['x0'], Bd['z0']; cols, rows = math.ceil((Bd['x1'] - ox) / cell), math.ceil((Bd['z1'] - oz) / cell)
    blk = [[False] * cols for _ in range(rows)]; w2 = lambda cx, cz: (ox + (cx + 0.5) * cell, oz + (cz + 0.5) * cell)
    for r_ in range(rows):
        for c_ in range(cols):
            x, z = w2(c_, r_)
            if x < Bd['x0'] + 0.25 or x > Bd['x1'] - 0.25 or z < Bd['z0'] + 0.25 or z > Bd['z1'] - 0.25: blk[r_][c_] = True
    for b in lay['blocks']:
        cx_, cz_ = (b['x0'] + b['x1']) / 2, (b['z0'] + b['z1']) / 2; hw, hd = max(b['x1'] - b['x0'], 0.4) / 2, max(b['z1'] - b['z0'], 0.4) / 2
        for r_ in range(rows):
            for c_ in range(cols):
                x, z = w2(c_, r_)
                if abs(x - cx_) <= hw and abs(z - cz_) <= hd: blk[r_][c_] = True
    cellof = lambda x, z: (math.floor((x - ox) / cell), math.floor((z - oz) / cell))
    def free(x, z):
        cx, cz = cellof(x, z); return 0 <= cx < cols and 0 <= cz < rows and not blk[cz][cx]
    clear = lambda x, z, r: free(x, z) and free(x + r, z) and free(x - r, z) and free(x, z + r) and free(x, z - r)
    sp = lay['spawn']; s0 = cellof(sp['x'], sp['z']); seen = {s0}; q = [s0]
    while q:
        cx, cz = q.pop()
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                n = (cx + dx, cz + dz)
                if n in seen or not (0 <= n[0] < cols and 0 <= n[1] < rows) or blk[n[1]][n[0]] or not clear(*w2(*n), 0.33): continue
                seen.add(n); q.append(n)
    bad = []; nx, nz = int((Bd['x1'] - ox) / step), int((Bd['z1'] - oz) / step)
    for i in range(nx + 1):
        for j in range(nz + 1):
            x, z = ox + i * step, oz + j * step
            if not clear(x, z, R): continue
            cx, cz = cellof(x, z)
            if not any((cx + dx, cz + dz) in seen for dx in (-1, 0, 1) for dz in (-1, 0, 1)): bad.append((round(x, 2), round(z, 2)))
    free_n = sum(1 for r_ in range(rows) for c_ in range(cols) if not blk[r_][c_])
    return ([f'站得到卻走不回出口 {len(bad)} 點：{bad[:6]}'] if bad else []), dict(step=step, r=R, free_cells=free_n, reach_cells=len(seen))


def finish2(c, src, old_name=None, old_type=None, smooth_keys=('trim', 'kitchen', 'kmetal', 'ksteel', 'lamps', 'lampshade')):
    """收尾（照 lane118_shops.finish 抄過來改的：LAWWW2-C 2026-10-20）：多了 ①圓的東西平滑著色（頂點共用，GLB 比較小）②layout 的 src ③notrap（站得到的地方都走得回出口）
    ④layout 的 name／type 照舊寫原本那間店的（old_name、old_type）：遊戲的店名、類型已經改成讀店家資料（src/data/lane118_shops.js），
      而 zones3d.js 畫 118 巷招牌的字時用「室內配置記的店名＝街景模型板面上的舊字」對出是哪一間再換成新店名（tests/l118_shops_redo_1111_unit.js 3-7）——
      街景模型換成新招牌以前，這裡改成新店名的話那一間街上的招牌會變回舊店名。按鈕的字（點餐（○○）、離開○○）寫新店名。"""
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items():
            uv = key in ('wall', 'wain') or '_' in key; mg = key not in ('print', 'iprint', 'screen', 'view')   # '_'：CC0 的店分到材質組的牆上零件（lane118_shops.cc0_setup）要盒狀 UV
            m.finish(c.root, props=dict({'dir': D[k]}, **c.WGP.get((k, key), {})), uv=uv, merge=mg, smooth=key in smooth_keys)
    cc0m = getattr(c, 'cc0m', None)
    if cc0m is not None: c.vc, c.vm, c.steel = c._vc0, c._vm0, c._steel0   # CC0 的店（SHOP-CC0-HELP-1113）：轉接器拿掉，剩下的頂點色零件照舊
    for m in (c.vc, c.vm, c.steel): m.finish(c.root, uv=False, smooth=True)
    for m in (cc0m or {}).values(): m.finish(c.root)                                  # 材質組網格（盒狀 UV）
    for m in getattr(c, 'cc0raw', []): m.finish(c.root, uv=False, smooth=True)       # 自己帶 UV 的（菜色貼圖集）
    for m in (c.tube, c.warm, c.fridgel): m.finish(c.root, uv=False)
    c.wood.finish(c.root, smooth=True)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for k, m in c.extra.items(): m.finish(c.root, uv=k in getattr(c, 'extra_uv', ()), smooth=k in getattr(c, 'extra_smooth', ()))
    if getattr(c, 'ph', None): c.ph.cleanup()   # Poly Haven 原型不匯出
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(LS.OUTDIR, f'l118_{c.sid}.glb'); st = L.export(out, gpu_instances=False)
    if getattr(c, 'ph', None): import cc0_kit; print('CC0_USED', json.dumps(cc0_kit.USED, ensure_ascii=False))
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    sh = next(q for q in LS.LAY['shops'] if q['id'] == c.sid); Wst = sh['side'] == 'W'; fx = LS.LAY['facade']['west'] if Wst else LS.LAY['facade']['east']; cz = (sh['z0'] + sh['z1']) / 2
    street = dict(side=sh['side'], door=dict(x=round(fx + (0.9 if Wst else -0.9), 3), z=cz, note='118 巷的店門口互動點（現在 zones3d.js buildLane118 的位置）'),
                  spawn_out=dict(x=round(fx + (1.3 if Wst else -1.3), 3), z=round(cz + 1.7, 3), yaw=0.0, note='出店門站的位置：人行道上、面向後門（辛亥路）那一頭（面向巷子對面的話，鏡頭會被自己店的牆擠到人物背後）；離門口互動點 1.75 m（現在的互動半徑 1.4 m：一出來不會就顯示「進店」）'))
    lay = dict(version=1, zone=f'l118_{c.sid}', shop=c.sid, name=old_name or c.T['name'], type=old_type or c.T['sub'], src=src,
               bounds=dict(x0=c.X0, x1=c.X1, z0=c.Z0, z1=c.Z1), h=H, cam_dist=c.S.get('cam', 3.6), door=c.door, spawn=c.spawn, exits=c.exits, street=street,
               counter=c.counter, clerk=c.clerk, order=c.order, seats=c.seats, interact=c.inter, blocks=c.blocks,
               **({'name_note': f'name／type 是配置原本的店名（街上招牌換字用的對照，見 l118_int_home.py finish2）；現在的店名是「{c.T["name"]}」（{c.T["sub"]}），遊戲讀 src/data/lane118_shops.js'} if old_name else {}),
               ceiling=dict(single_sided=True, node=f'l118_{c.sid}_ceiling', note='天花板只有朝下的單面（材質 cull）：鏡頭高過天花板時看得穿，不需要 ceilHide；吊著的燈在 2.5 m 以上'))
    sys.path.insert(0, os.path.join(L.ROOT, 'tools', 'lane118')); import it_fix; _st = it_fix.apply(c.sid, lay)   # SHOP-CC0-HELP-1113（AA-C 11-13）：按鈕位置、走近點、半徑照 tools/lane118/it_fix.py（和 lane118_shops.py 一樣）；
    if _st: print('IT_FIX 對不到配置：' + '、'.join(_st))                                                                          #   cam_dist 預設 3.6＝ab9ab0fbe8 改的值。原本只改了 layout.json，重建會蓋回去
    prob = LS.navcheck(c, lay); p2, info = notrap(lay); prob = prob + p2
    lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, notrap=info)
    L.write_json(os.path.join(LS.OUTDIR, f'l118_{c.sid}.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'l118_{c.sid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'shop': c.sid, 'tris': tris, 'seats': len(c.seats), 'problems': prob, 'notrap': info}, ensure_ascii=False))
    return prob


def preview(sid, outdir, views, points, samples=48):
    """Blender 渲染兩張預覽（Cycles；不是遊戲截圖）：另開一個程序跑 render_cycles.py（這個沙盒的 EEVEE 用軟體 OpenGL，太慢），PNG 轉成 1280×720 jpg"""
    tmp = os.path.join(outdir, '_tmp'); os.makedirs(tmp, exist_ok=True); vj = os.path.join(tmp, f'{sid}_views.json'); json.dump(views, open(vj, 'w'))
    cmd = [sys.executable, os.path.join(HERE, 'render_cycles.py'), '--', os.path.join(LS.OUTDIR, f'l118_{sid}.glb'), tmp, sid, vj, '--res', '1280x720', '--samples', str(samples), '--view', 'Standard', '--exposure', '0.0']
    for p in points: cmd += ['--point', ','.join(str(v) for v in p)]
    subprocess.run(cmd, check=False, stdout=subprocess.DEVNULL)
    for v in views:
        p = os.path.join(tmp, f'{sid}_{v[0]}.png')
        if os.path.exists(p): Image.open(p).convert('RGB').save(os.path.join(outdir, f'{sid}_{v[0]}.jpg'), quality=88); os.remove(p); print('預覽', os.path.join(outdir, f'{sid}_{v[0]}.jpg'))
    try: os.remove(vj); os.rmdir(tmp)
    except Exception: pass


# ================= 五湖四海 =================
SID = 'home'
NAME, SUB = '五湖四海', '水餃店'
MENU = [('高麗菜水餃10顆', 80), ('韭菜水餃10顆', 85), ('酸辣湯', 45), ('玉米濃湯', 45)]   # 使用者文字規格（L118_SHOPS_REDO_1111.md 二-4）
HOURS = '11:00～14:00、17:00～20:00；每天'                                              # src/data/lane118_shops.js（AA_280）
REG = {'BOARD': (0, 0, 600, 460), 'PLAQUE': (600, 0, 840, 460), 'SCROLL': (840, 0, 1024, 460), 'PAINT': (0, 460, 300, 860), 'PHOTO1': (300, 460, 600, 700), 'PHOTO2': (300, 700, 600, 860),
       'NOREN': (600, 460, 1024, 640), 'DOORSIGN': (600, 640, 760, 1024), 'CAL': (760, 640, 900, 860), 'CLOCK': (900, 640, 1024, 764), 'HOURS': (760, 860, 1024, 1024), 'TAG': (900, 764, 1024, 860)}


def vtext(d, cx, y, t, f, fill, gap=6):
    for ch in t: w = d.textlength(ch, font=f); d.text((cx - w / 2, y), ch, font=f, fill=fill); y += f.size + gap
    return y


def dumpling_icon(d, cx, cy, w, col, width=4):
    """水餃的線稿：半月形＋上緣的摺"""
    h = w * 0.55; d.arc([cx - w / 2, cy - h, cx + w / 2, cy + h], 180, 360, fill=col, width=width); d.line([(cx - w / 2, cy), (cx + w / 2, cy)], fill=col, width=width)
    for k in range(5):
        a = math.radians(205 + k * 32.5); x, y = cx + w / 2 * math.cos(a), cy + h * math.sin(a); d.line([(x, y), (x - (x - cx) * 0.22, y + h * 0.3)], fill=col, width=max(2, width - 1))


def atlas():
    """五湖四海室內的印刷品貼圖集 → textures/gen/l118_int_home_print.png（程式畫的；字型文泉驛正黑）"""
    rr = random.Random(118); im = Image.new('RGB', (1024, 1024), '#808080')
    def put(key, sub): im.paste(sub, REG[key][:2])
    def size(key): x0, y0, x1, y1 = REG[key]; return x1 - x0, y1 - y0
    # 價目板：米白紙、紅色雙框、四個角的回紋；店名＋四樣（規格的品名、價錢）
    w, h = size('BOARD'); b = TX.paper(w, h, '#f3ead6', seed=3); d = ImageDraw.Draw(b); red = (168, 38, 30)
    d.rectangle([8, 8, w - 9, h - 9], outline=red, width=5); d.rectangle([20, 20, w - 21, h - 21], outline=red, width=2)
    for (cx, cy) in ((34, 34), (w - 34, 34), (34, h - 34), (w - 34, h - 34)): d.rectangle([cx - 12, cy - 12, cx + 12, cy + 12], outline=red, width=3); d.rectangle([cx - 5, cy - 5, cx + 5, cy + 5], fill=red)
    TX.ctext(d, w / 2, 40, '　'.join(NAME), F(54), (40, 30, 24)); d.line([(70, 116), (w - 70, 116)], fill=red, width=3)
    y = 140
    for (nm, pr_) in MENU:
        d.text((64, y), nm, font=F(44), fill=(40, 30, 24)); t = str(pr_); tw = d.textlength(t, font=F(46)); d.text((w - 70 - tw, y - 1), t, font=F(46), fill=red)
        x = 64 + d.textlength(nm, font=F(44)) + 14
        while x < w - 84 - tw: d.ellipse([x, y + 28, x + 4, y + 32], fill=(120, 100, 84)); x += 16
        y += 74
    put('BOARD', b)
    # 木牌「手工水餃 現包現煮」（直寫兩行，右起）
    w, h = size('PLAQUE'); p = TX.wood_bg(w, h, '#a9773f', 21); d = ImageDraw.Draw(p); d.rectangle([5, 5, w - 6, h - 6], outline=(74, 46, 22), width=5)
    vtext(d, w * 0.7, 34, '手工水餃', F(84), (52, 30, 14), gap=14); vtext(d, w * 0.3, 34, '現包現煮', F(84), (52, 30, 14), gap=14); put('PLAQUE', p)
    # 掛軸「五湖四海」（米色布、下面一段藍色水波）
    w, h = size('SCROLL'); s = TX.paper(w, h, '#efe3c6', seed=5); d = ImageDraw.Draw(s); vtext(d, w / 2, 22, NAME, F(82), (36, 28, 22), gap=6)
    for k in range(3):
        yy = h - 62 + k * 20
        for i in range(-1, 6): d.arc([i * 44 - (k % 2) * 22, yy, i * 44 + 44 - (k % 2) * 22, yy + 36], 180, 360, fill=(38, 62, 110), width=5)
    d.rectangle([0, 0, w - 1, 9], fill=(90, 62, 40)); d.rectangle([0, h - 10, w - 1, h - 1], fill=(90, 62, 40)); put('SCROLL', s)
    # 山水畫（程式畫的：三層遠山、霧、一枚紅印）
    w, h = size('PAINT'); pt = TX.paper(w, h, '#e9e0cc', seed=9); d = ImageDraw.Draw(pt)
    for k, (base, g) in enumerate(((0.42, 178), (0.56, 140), (0.72, 96))):
        pts = [(0, h)]; x = 0
        while x <= w: pts.append((x, h * base - rr.uniform(0, h * (0.22 - k * 0.05)) * (1 if (x // 40) % 2 else 0.4))); x += rr.randint(18, 46)
        pts += [(w, h)]; d.polygon(pts, fill=(g, g, g - 6))
        pt = pt.filter(ImageFilter.GaussianBlur(2.2 - k * 0.6)); d = ImageDraw.Draw(pt)
        mist = Image.new('RGBA', (w, h), (0, 0, 0, 0)); ImageDraw.Draw(mist).rectangle([0, h * (base + 0.05), w, h * (base + 0.12)], fill=(233, 224, 204, 150)); pt.paste(mist.filter(ImageFilter.GaussianBlur(8)), (0, 0), mist.filter(ImageFilter.GaussianBlur(8))); d = ImageDraw.Draw(pt)
    for k in range(5): x = 40 + k * 50 + rr.randint(-8, 8); d.line([(x, h * 0.9), (x, h * 0.8)], fill=(60, 56, 50), width=3); d.ellipse([x - 14, h * 0.74, x + 14, h * 0.83], fill=(70, 74, 62))
    d.rectangle([w - 44, h - 50, w - 24, h - 30], fill=(170, 40, 32)); put('PAINT', pt)
    # 老照片兩張（程式畫的褐色街景：樓房的方塊、騎樓、天空；不是任何真實照片）
    for key, seed in (('PHOTO1', 31), ('PHOTO2', 47)):
        w, h = size(key); r2 = random.Random(seed); ph = Image.new('RGB', (w, h), (206, 190, 160)); d = ImageDraw.Draw(ph); x = 0
        while x < w:
            bw = r2.randint(36, 70); bh = r2.randint(int(h * 0.35), int(h * 0.7)); g = r2.randint(96, 150); d.rectangle([x, h - bh - 20, x + bw, h - 20], fill=(g, g - 14, g - 40))
            for wy in range(h - bh - 10, h - 44, 22):
                for wx in range(x + 6, x + bw - 8, 16): d.rectangle([wx, wy, wx + 7, wy + 11], fill=(g - 50, g - 60, g - 80))
            x += bw + r2.randint(0, 6)
        d.rectangle([0, h - 22, w, h], fill=(120, 104, 80)); ph = ph.filter(ImageFilter.GaussianBlur(1.1)); d = ImageDraw.Draw(ph); d.rectangle([0, 0, w - 1, h - 1], outline=(238, 228, 204), width=9); put(key, ph)
    # 門簾（深藍、三片各一個水餃線稿）
    w, h = size('NOREN'); n = Image.new('RGB', (w, h), (30, 44, 86)); d = ImageDraw.Draw(n)
    for k in range(3): dumpling_icon(d, w * (k + 0.5) / 3, h * 0.62, 78, (226, 226, 216), 5)
    put('NOREN', n)
    # 門邊的直木牌「五湖四海 水餃專賣」
    w, h = size('DOORSIGN'); ds = TX.wood_bg(w, h, '#3d2a1e', 77); d = ImageDraw.Draw(ds); d.rectangle([5, 5, w - 6, h - 6], outline=(214, 204, 180), width=2)
    y = vtext(d, w / 2, 16, NAME, F(58), (236, 228, 208), gap=4); y = vtext(d, w / 2, y + 8, '水餃專賣', F(22), (236, 228, 208), gap=2); dumpling_icon(d, w / 2, h - 30, 56, (236, 228, 208), 3); put('DOORSIGN', ds)
    # 日曆（紅頭白紙、格線；不寫日期）
    w, h = size('CAL'); cal = TX.paper(w, h, '#f6f2e8', seed=13); d = ImageDraw.Draw(cal); d.rectangle([0, 0, w, 50], fill=(176, 40, 34))
    for i in range(1, 7): d.line([(i * w / 7, 62), (i * w / 7, h - 8)], fill=(170, 160, 150), width=1)
    for j in range(6): d.line([(6, 62 + j * (h - 70) / 5), (w - 6, 62 + j * (h - 70) / 5)], fill=(170, 160, 150), width=1)
    put('CAL', cal)
    # 掛鐘的鐘面（10:10）
    w, h = size('CLOCK'); ck = Image.new('RGB', (w, h), (244, 240, 230)); d = ImageDraw.Draw(ck); cx, cy = w / 2, h / 2
    for k in range(12): a = math.radians(k * 30); d.line([(cx + 46 * math.sin(a), cy - 46 * math.cos(a)), (cx + 55 * math.sin(a), cy - 55 * math.cos(a))], fill=(40, 36, 32), width=4 if k % 3 == 0 else 2)
    for (ang, ln, wd) in ((305, 28, 5), (60, 42, 3)): a = math.radians(ang); d.line([(cx, cy), (cx + ln * math.sin(a), cy - ln * math.cos(a))], fill=(30, 26, 24), width=wd)
    d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(30, 26, 24)); put('CLOCK', ck)
    # 營業時間
    w, h = size('HOURS'); hr = TX.paper(w, h, '#ffffff', seed=7); d = ImageDraw.Draw(hr); TX.ctext(d, w / 2, 12, '營業時間', F(40), (40, 40, 40)); yy = 68
    for ln in HOURS.split('；')[0].split('、') + HOURS.split('；')[1:]: TX.ctext(d, w / 2, yy, ln, F(28), (60, 60, 60)); yy += 30
    d.rectangle([3, 3, w - 4, h - 4], outline=(120, 60, 40), width=4); put('HOURS', hr)
    w, h = size('TAG'); tg = TX.paper(w, h, '#f3ead6', seed=17); d = ImageDraw.Draw(tg); TX.ctext(d, w / 2, 8, '水餃', F(44), (40, 30, 24)); dumpling_icon(d, w / 2, h - 16, 60, (40, 30, 24), 3); put('TAG', tg)
    im.save(os.path.join(GEN, 'l118_int_home_print.png'))


def tile_tex():
    """牆面的米白方磚（20 cm；程式畫的：每塊磚深淺差一點、灰縫、往下流的淡水漬）→ textures/gen/l118_int_home_tile.png，一張＝1 m × 1 m
    （Poly Haven 的 rounded_square_tiled_wall 是 2 cm 的馬賽克，放大成 20 cm 一塊會糊）"""
    rr = random.Random(55); S = 512; n = 5; p = S / n; im = Image.new('RGB', (S, S), (206, 197, 174)); d = ImageDraw.Draw(im)
    for i in range(n):
        for j in range(n):
            k = rr.uniform(0.965, 1.02); col = (int(236 * k), int(227 * k), int(205 * k)); d.rounded_rectangle([i * p + 2, j * p + 2, (i + 1) * p - 3, (j + 1) * p - 3], radius=3, fill=col)
            d.line([(i * p + 4, j * p + 4), ((i + 1) * p - 6, j * p + 4)], fill=tuple(min(255, v + 8) for v in col), width=2)
    st = Image.new('RGBA', (S, S), (0, 0, 0, 0)); ds = ImageDraw.Draw(st)
    for _ in range(7): x = rr.randrange(S); ds.rectangle([x, 0, x + rr.randint(6, 22), S], fill=(150, 136, 104, rr.randint(8, 20)))
    st = st.filter(ImageFilter.GaussianBlur(6)); im.paste(st, (0, 0), st)
    im.save(os.path.join(GEN, 'l118_int_home_tile.png'))


def uvdisc(mesh, x, y, z, r, rect, nx=-1, seg=20):
    """貼在東／西牆上的圓形印刷品（鐘面）：nx＝面朝的方向（−1 朝西＝東牆上）"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = rect; vs = []; uvs = []
    for k in range(seg):
        a = 2 * PI * k / seg; hz = math.cos(a) * r * (1 if nx < 0 else -1); vs.append(bm.verts.new(g2b(x, y + math.sin(a) * r, z + hz))); uvs.append(((u0 + u1) / 2 + math.cos(a) * (u1 - u0) / 2, (v0 + v1) / 2 + math.sin(a) * (v1 - v0) / 2))
    f = bm.faces.new(vs)
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv


def lathe_x(m, prof, x, y, z, col, seg=20, nx=-1, pz=False):
    """車出來的旋轉體，軸朝 −x（東牆上的東西往店裡凸）或 +x；pz＝軸朝 +z（後牆上的東西往店裡凸）"""
    R = Matrix.Rotation(PI / 2, 4, 'X') if pz else Matrix.Rotation(-PI / 2 if nx < 0 else PI / 2, 4, 'Y')
    f0 = set(m.bm.faces); bm = L.lathe(prof, seg=seg); m.add_bm(bm, Matrix.Translation(g2b(x, y, z)) @ R); bm.free(); m.paint([q for q in m.bm.faces if q not in f0], col)


def condiments(c, x, z, y=0.74):
    """桌上的醬油、醋、辣椒罐、不鏽鋼面紙盒"""
    v = c.vc
    clathe(v, [(0.0, 0.0), (0.027, 0.0), (0.03, 0.012), (0.03, 0.085), (0.013, 0.115), (0.013, 0.135), (0.018, 0.14), (0.018, 0.152), (0.0, 0.152)], x - 0.075, y, z, '#2a1a12', seg=10)
    clathe(v, [(0.0, 0.0), (0.027, 0.0), (0.03, 0.012), (0.03, 0.085), (0.013, 0.115), (0.013, 0.135), (0.018, 0.14), (0.018, 0.152), (0.0, 0.152)], x, y, z + 0.015, '#b98a34', seg=10)
    clathe(v, [(0.0, 0.0), (0.034, 0.0), (0.037, 0.01), (0.037, 0.062), (0.033, 0.068), (0.0, 0.068)], x + 0.085, y, z, '#b3261e', seg=10)
    ccyl(c.vm, (x + 0.085, y + 0.06, z), (x + 0.115, y + 0.12, z + 0.01), 0.004, STEEL, seg=4)
    c.vm.crbox(x - 0.07, x + 0.07, y, y + 0.085, z + 0.1, z + 0.22, '#c4c8cb', r=0.008, seg=1); v.cbox(x - 0.03, x + 0.03, y + 0.085, y + 0.11, z + 0.15, z + 0.17, '#fbfaf6')


def dumpling(m, x, y, z, a, col='#f1e9d6'):
    """一顆水餃：胖胖的半月形（橢球壓扁一邊）＋上面一道捏起來的邊"""
    cell_(m, (x, y + 0.017, z), 0.037, 0.019, 0.023, col, seg=10, rings=4, rotz=a)
    cell_(m, (x, y + 0.027, z), 0.035, 0.012, 0.0045, '#e9dfc9', seg=6, rings=3, rotz=a)


def dumplings(m, x0, x1, z0, z1, y, nx, nz, rng):
    for i in range(nx):
        for j in range(nz):
            dumpling(m, x0 + (i + 0.5) * (x1 - x0) / nx, y, z0 + (j + 0.5) * (z1 - z0) / nz, rng.uniform(-0.3, 0.3))


def bowls(m, x, y, z, n=5, col='#eef0f2', rim='#3f5f9c'):
    for k in range(n): clathe(m, [(0.0, 0.004), (0.04, 0.0), (0.045, 0.004), (0.072, 0.052), (0.074, 0.058), (0.069, 0.058), (0.0, 0.012)], x, y + k * 0.021, z, rim if k == n - 1 else col, seg=12)


def banquette(c, z0, z1):
    """西牆的長條座位（咖啡色皮面、一條一條直的車縫）：木底座、一塊一塊的坐墊、直條靠背、上面一條木壓條"""
    X0 = c.X0; v = c.vc; lea = '#5d3a2b'
    v.cbox(X0, X0 + 0.42, 0.0, 0.1, z0, z1, '#2e2018'); v.cbox(X0, X0 + 0.46, 0.1, 0.31, z0, z1, '#3d2a1f')
    n = max(1, round((z1 - z0) / 0.6)); dz = (z1 - z0) / n
    for k in range(n): v.crbox(X0 + 0.07, X0 + 0.5, 0.3, 0.455, z0 + k * dz + 0.004, z0 + (k + 1) * dz - 0.004, lea, k=1.0 + 0.04 * ((k * 7) % 3 - 1), r=0.035, seg=2)
    n = max(1, round((z1 - z0) / 0.2)); dz = (z1 - z0) / n
    for k in range(n): v.crbox(X0 + 0.005, X0 + 0.1, 0.47, 1.0, z0 + k * dz + 0.003, z0 + (k + 1) * dz - 0.003, lea, k=0.97 + 0.05 * ((k * 5) % 3) / 2, r=0.03, seg=2)
    c.wood.rbox(X0, X0 + 0.11, 1.0, 1.035, z0, z1, r=0.008, seg=1)
    for zz in (z0 - 0.04, z1): c.wood.rbox(X0, X0 + 0.52, 0.0, 0.64, zz, zz + 0.04, r=0.012, seg=2); c.wood.rbox(X0, X0 + 0.12, 0.64, 1.035, zz, zz + 0.04, r=0.008, seg=1)   # 兩端的木側板（扶手高）


def hood(c, x0, x1, z0, z1, y0=1.95, y1=2.5):
    """抽油煙罩（不鏽鋼，上窄下寬的斗＋下緣一圈直邊＋排到天花板的風管；底面是濾網的深色）"""
    ks = c.wg('N', 'ksteel', c.M['steel']); kt = c.wg('N', 'kitchen', c.M['vc'], cm=True)
    a0, a1, b0, b1 = x0 + 0.45, x1 - 0.45, z0, z1 - 0.6
    for (p, q, r_, s) in (((x0, z1), (x1, z1), (a1, b1), (a0, b1)), ((x1, z1), (x1, z0), (a1, b0), (a1, b1)), ((x0, z0), (x0, z1), (a0, b1), (a0, b0))):
        ks.quad([(p[0], y0, p[1]), (q[0], y0, q[1]), (r_[0], y1, r_[1]), (s[0], y1, s[1])])
    ks.quad([(a0, y1, b1), (a1, y1, b1), (a1, y1, b0), (a0, y1, b0)])
    for (xa, xb, za, zb) in ((x0, x1, z1 - 0.02, z1), (x0, x0 + 0.02, z0, z1), (x1 - 0.02, x1, z0, z1)): ks.box(xa, xb, y0 - 0.14, y0, za, zb)
    kt.poly([(x0 + 0.02, y0 - 0.02, z0), (x1 - 0.02, y0 - 0.02, z0), (x1 - 0.02, y0 - 0.02, z1 - 0.02), (x0 + 0.02, y0 - 0.02, z1 - 0.02)], '#5a5f63')
    xm = (x0 + x1) / 2; ks.box(xm - 0.3, xm + 0.3, y1, H, z0 + 0.02, z0 + 0.55)


def lattice_window(c, z0, z1, y0, y1):
    """西牆上的深木框格子窗（兩扇、每扇 2×3 格；霧面壓花玻璃：下面兩排霧白、最上面一排淡綠白）——int2 參考圖、文字規格「木框窗戶」"""
    X0 = c.X0; m = c.wg('W', 'trim', c.M['vc'], cm=True); wd = '#4a3122'; zm = (z0 + z1) / 2
    m.crbox(X0, X0 + 0.07, y0 - 0.07, y0, z0 - 0.09, z1 + 0.09, wd, r=0.01, seg=1); m.crbox(X0, X0 + 0.055, y1, y1 + 0.07, z0 - 0.07, z1 + 0.07, wd, r=0.01, seg=1)
    for zz in (z0 - 0.07, z1): m.crbox(X0, X0 + 0.055, y0, y1, zz, zz + 0.07, wd, r=0.01, seg=1)
    m.crbox(X0, X0 + 0.05, y0, y1, zm - 0.035, zm + 0.035, wd, r=0.008, seg=1)
    for (a, b) in ((z0, zm - 0.035), (zm + 0.035, z1)):
        for k in range(3):
            ya, yb = y0 + k * (y1 - y0) / 3, y0 + (k + 1) * (y1 - y0) / 3
            for j in range(2):
                za, zb = a + j * (b - a) / 2, a + (j + 1) * (b - a) / 2
                m.poly([(X0 + 0.02, ya, zb), (X0 + 0.02, ya, za), (X0 + 0.02, yb, za), (X0 + 0.02, yb, zb)], '#dfe9e2' if k == 2 else ('#e9ece6' if (k + j) % 2 else '#e3e7e1'))
            if k: m.crbox(X0, X0 + 0.04, ya - 0.014, ya + 0.014, a, b, wd, r=0.004, seg=1)
        m.crbox(X0, X0 + 0.04, y0, y1, (a + b) / 2 - 0.014, (a + b) / 2 + 0.014, wd, r=0.004, seg=1)
    for zz in (zm - 0.12, zm + 0.12): m.crbox(X0 + 0.05, X0 + 0.065, y0 + 0.5, y0 + 0.62, zz - 0.012, zz + 0.012, '#b08d57', r=0.004, seg=1)   # 把手


def ceiling_fan(c, x, z):
    """吊扇（int2 參考圖）：吊桿、馬達殼、四片扇葉；最低 2.72 m（鏡頭在人物後上方，吊著的東西要在 2.5 m 以上）"""
    ccyl(c.vm, (x, 2.86, z), (x, H, z), 0.014, '#cfc7b4', seg=6); clathe(c.vc, [(0.0, 0.0), (0.06, 0.0), (0.11, 0.03), (0.12, 0.07), (0.09, 0.11), (0.03, 0.13), (0.0, 0.13)], x, 2.74, z, '#d8cfba', seg=14)
    clathe(c.vc, [(0.0, 0.0), (0.05, 0.0), (0.035, 0.03), (0.0, 0.03)], x, H - 0.03, z, '#d8cfba', seg=10)
    for k in range(4):
        T = LS.rot(x, z, k * PI / 2); LS.rbox(c.vc, T, -0.065, 0.065, 2.775, 2.787, 0.16, 0.66, '#e4dcc8', r=0.004, seg=1); LS.rbox(c.vm, T, -0.02, 0.02, 2.77, 2.785, 0.1, 0.2, '#b9b19e')


def build_home(c):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rng = c.rng
    LS.shell(c)
    if getattr(c, 'cc0m', None) is not None: c.WG['S']['frame_alu'].mat = c.MX['wood_d']                # CC0（SHOP-CC0-HELP-1113）：店面框的材質組換深木（同下）
    else: fr = c.WG['S']['frame']; fr.paint(list(fr.bm.faces), '#4a3122')                             # 深木框的門窗（參考圖；shell 的框是鋁色）
    KZ = -2.25                                                                                        # 煮水餃區和用餐區的界線（導航格線）
    kt = c.wg('N', 'kitchen', M['vc'], cm=True); km = c.wg('N', 'kmetal', M['vcm'], cm=True); ks = c.wg('N', 'ksteel', M['steel'])
    for key in ('kitchen', 'kmetal', 'ksteel', 'iprint', 'ksteam'): c.WGP[('N', key)] = {'at': [0.0, 1.6, KZ - 0.05]}   # 鏡頭在煮水餃區裡或後牆外面：整個煮水餃區跟著後牆淡出（不擋住人）

    # ---------- 最裡面：開放式煮水餃區 ----------
    ks.quad([(X0 + 0.02, 0.86, Z0 + 0.012), (1.3, 0.86, Z0 + 0.012), (1.3, 1.92, Z0 + 0.012), (X0 + 0.02, 1.92, Z0 + 0.012)])       # 後牆的不鏽鋼壁板
    ks.box(-3.2, 1.25, 0.82, 0.86, Z0, Z0 + 0.62); km.cbox(-3.18, 1.23, 0.1, 0.82, Z0 + 0.02, Z0 + 0.6, '#a9aeb2')                   # 後面的爐台、備料檯
    for xx in (-3.1, -1.6, -0.1, 1.15): ccyl(km, (xx, 0.0, Z0 + 0.55), (xx, 0.1, Z0 + 0.55), 0.025, STEEL_D, seg=6)
    for k, (xx, r_, hh) in enumerate(((-2.75, 0.19, 0.3), (-2.25, 0.16, 0.24), (-1.2, 0.2, 0.32))):                                   # 湯鍋（酸辣湯、玉米濃湯）
        clathe(km, [(0.0, 0.0), (r_, 0.0), (r_ + 0.006, 0.01), (r_ + 0.006, hh), (r_ + 0.018, hh + 0.008), (r_ + 0.018, hh + 0.02), (r_ - 0.01, hh + 0.02), (r_ - 0.01, 0.02), (0.0, 0.02)], xx, 0.86, Z0 + 0.32, '#c2c7ca', seg=18)
        ccyl(kt, (xx, 0.86 + hh - 0.03, Z0 + 0.32), (xx, 0.86 + hh - 0.025, Z0 + 0.32), r_ - 0.012, ('#b8572a', '#e3c35a', '#d8d2c0')[k], seg=16)
        for s in (-1, 1): km.crbox(xx + s * (r_ + 0.012) - 0.02, xx + s * (r_ + 0.012) + 0.02, 0.86 + hh - 0.07, 0.86 + hh - 0.045, Z0 + 0.28, Z0 + 0.36, '#9aa0a4', r=0.006, seg=1)
    for k in range(6): bowls(kt, 0.05 + (k % 3) * 0.2, 0.86, Z0 + 0.2 + (k // 3) * 0.2, n=4 + (k % 2))                                 # 備料檯上的碗
    hood(c, -3.1, -0.6, Z0, -2.5)
    ks.cyl((-2.9, 1.62, Z0 + 0.05), (-0.8, 1.62, Z0 + 0.05), 0.009, seg=6)                                                            # 掛漏勺、湯杓的桿子
    for k, xx in enumerate((-2.62, -2.34, -2.06, -1.78, -1.5)):                                                                     # 一排撈網（木柄、不鏽鋼網勺；int2 參考圖）
        ccyl(kt, (xx, 1.6, Z0 + 0.06), (xx, 1.3, Z0 + 0.06), 0.011, '#b98a4e', seg=6); ccyl(km, (xx, 1.3, Z0 + 0.06), (xx, 1.2, Z0 + 0.06), 0.005, STEEL, seg=4)
        lathe_x(km, [(0.0, 0.035), (0.06, 0.028), (0.098, 0.006), (0.104, 0.0), (0.104, 0.008), (0.062, 0.036), (0.0, 0.044)], xx, 1.1, Z0 + 0.03, '#c2c7ca', seg=12, pz=True)
    # 後牆的層架（兩層：碗、籃子裡的青菜）
    for yy in (1.25, 1.68):
        ks.box(-0.45, 1.25, yy - 0.02, yy, Z0 + 0.01, Z0 + 0.32)
        for xx in (-0.4, 0.4, 1.2): ks.box(xx - 0.012, xx + 0.012, yy - 0.16, yy - 0.02, Z0 + 0.01, Z0 + 0.03)
    for k in range(5): bowls(kt, -0.3 + k * 0.19, 1.25, Z0 + 0.17, n=5 - (k % 2))
    for k, (xx, col, veg) in enumerate(((-0.2, '#c8c4b8', '#6aa046'), (0.25, '#c8c4b8', '#8fbf5a'), (0.72, '#c0392b', '#6aa046'))):
        clathe(kt, [(0.0, 0.0), (0.12, 0.0), (0.16, 0.1), (0.165, 0.11), (0.15, 0.11), (0.11, 0.015), (0.0, 0.015)], xx, 1.68, Z0 + 0.17, col, seg=12)
        for j in range(5): cell_(kt, (xx + 0.07 * math.cos(j * 1.3), 1.79 + 0.02 * (j % 2), Z0 + 0.17 + 0.07 * math.sin(j * 1.3)), 0.07, 0.035, 0.05, veg, rotz=j * 0.7)
    for k in range(3): clathe(kt, [(0.0, 0.0), (0.15, 0.0), (0.155, 0.006), (0.155, 0.07), (0.15, 0.076), (0.0, 0.076)], 1.05, 1.68 + k * 0.078, Z0 + 0.17, '#c9a56a' if k % 2 else '#bf9a5e', seg=16)   # 竹蒸籠三層＋蓋子（int2 參考圖）
    clathe(kt, [(0.0, 0.0), (0.155, 0.0), (0.15, 0.02), (0.09, 0.05), (0.0, 0.06)], 1.05, 1.68 + 3 * 0.078, Z0 + 0.17, '#b08a4e', seg=16)
    # 冰箱（不鏽鋼雙門立式）
    km.crbox(1.36, 2.16, 0.06, 1.98, Z0 + 0.02, Z0 + 0.72, '#b7bcc0', r=0.012, seg=1); km.cbox(1.38, 2.14, 0.0, 0.06, Z0 + 0.06, Z0 + 0.68, '#3a3d40')
    km.cbox(1.36, 2.16, 1.0, 1.012, Z0 + 0.72, Z0 + 0.726, '#6c7176'); km.cbox(1.755, 1.765, 0.08, 1.96, Z0 + 0.72, Z0 + 0.726, '#6c7176')
    for (xx, y0_, y1_) in ((1.7, 1.2, 1.6), (1.82, 1.2, 1.6), (1.7, 0.45, 0.85), (1.82, 0.45, 0.85)): km.crbox(xx - 0.012, xx + 0.012, y0_, y1_, Z0 + 0.72, Z0 + 0.76, '#8e9499', r=0.006, seg=1)
    # 深藍門簾（三片，水餃圖案）＋後面的門洞
    kt.poly([(2.42, 0.0, Z0 + 0.008), (3.38, 0.0, Z0 + 0.008), (3.38, 2.12, Z0 + 0.008), (2.42, 2.12, Z0 + 0.008)], '#2b2622')
    kt.crbox(2.36, 3.44, 2.1, 2.16, Z0, Z0 + 0.05, '#4a3122', r=0.008, seg=1)
    u0, v0, u1, v1 = uvr(REG, 'NOREN'); npm = c.wg('N', 'iprint', M['iprint'])
    for k in range(3):
        xa, xb = 2.42 + k * 0.32 + 0.006, 2.42 + (k + 1) * 0.32 - 0.006; ua, ub = u0 + (u1 - u0) * k / 3, u0 + (u1 - u0) * (k + 1) / 3
        LS.uvquad(npm, [(xa, 1.42, Z0 + 0.04), (xb, 1.42, Z0 + 0.04), (xb, 2.1, Z0 + 0.04), (xa, 2.1, Z0 + 0.04)], (ua, v0, ub, v1))
    # 麵粉袋（門簾旁邊疊三袋）
    for k in range(3): kt.crbox(3.2 - 0.02 * k, 3.72 - 0.02 * k, 0.02 + k * 0.17, 0.2 + k * 0.17, -3.3 + 0.03 * (k % 2), -2.92 + 0.03 * (k % 2), '#ddd3bd', k=1.0 - 0.03 * k, r=0.06, seg=2)
    # 西側靠牆的備料檯（疊起來的不鏽鋼盤、一口鍋）
    ks.box(X0, -3.22, 0.82, 0.86, Z0 + 0.62, KZ - 0.1); km.cbox(X0 + 0.02, -3.24, 0.1, 0.82, Z0 + 0.62, KZ - 0.12, '#a9aeb2')
    for k in range(5): km.crbox(X0 + 0.08, -3.3, 0.86 + k * 0.022, 0.876 + k * 0.022, -3.4, -2.95, '#c2c7ca', r=0.004, seg=1)
    clathe(km, [(0.0, 0.0), (0.17, 0.0), (0.176, 0.01), (0.176, 0.2), (0.19, 0.21), (0.19, 0.22), (0.16, 0.22), (0.16, 0.02), (0.0, 0.02)], X0 + 0.3, 0.86, -2.65, '#c2c7ca', seg=16)
    # 煮水餃的大鍋（低的快速爐上；鍋裡的水、浮起來的水餃、蒸氣）——「看」的那一句放在這裡
    px, pz = -1.6, -2.82
    ks.rbox(px - 0.56, px + 0.56, 0.44, 0.5, pz - 0.5, pz + 0.5, r=0.012, seg=1); km.cbox(px - 0.52, px + 0.52, 0.1, 0.44, pz - 0.46, pz + 0.46, '#9da3a7')
    for (sx, sz) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): ccyl(km, (px + sx * 0.5, 0.0, pz + sz * 0.44), (px + sx * 0.5, 0.44, pz + sz * 0.44), 0.022, STEEL_D, seg=6)
    for k in range(2): ccyl(kt, (px - 0.25 + k * 0.5, 0.28, pz + 0.46), (px - 0.25 + k * 0.5, 0.28, pz + 0.49), 0.03, '#2a2a2a', seg=10)   # 爐子的旋鈕
    clathe(km, [(0.0, 0.0), (0.2, 0.0), (0.24, 0.03), (0.2, 0.05), (0.0, 0.05)], px, 0.5, pz, '#3a3d40', seg=16)                       # 爐頭
    R_, Hh = 0.42, 0.46
    clathe(km, [(0.0, 0.0), (R_ - 0.015, 0.0), (R_, 0.02), (R_, Hh), (R_ + 0.022, Hh + 0.01), (R_ + 0.022, Hh + 0.028), (R_ - 0.018, Hh + 0.028), (R_ - 0.018, 0.03), (0.0, 0.03)], px, 0.55, pz, '#c6cbce', seg=28)
    ccyl(kt, (px, 0.55 + Hh - 0.06, pz), (px, 0.55 + Hh - 0.055, pz), R_ - 0.02, '#dfe2da', seg=24)                                    # 水面
    for k in range(10): a = k * 0.63 + 0.2; rd = 0.1 + 0.24 * ((k * 37) % 10) / 10; dumpling(kt, px + rd * math.cos(a), 0.55 + Hh - 0.072, pz + rd * math.sin(a), a, '#f4eedd')
    for s in (-1, 1): km.crbox(px + s * (R_ + 0.03) - 0.025, px + s * (R_ + 0.03) + 0.025, 0.55 + Hh - 0.1, 0.55 + Hh - 0.07, pz - 0.07, pz + 0.07, '#9aa0a4', r=0.008, seg=1)
    st = c.wg('N', 'ksteam', L.flat('l118_home_steam', '#ffffff', rough=1.0, alpha=0.16))
    for k, (dx_, dy_, dz_, r_) in enumerate(((0.0, 0.2, 0.0, 0.26), (0.1, 0.52, -0.06, 0.3), (-0.12, 0.82, 0.04, 0.27), (0.06, 1.1, -0.02, 0.22), (-0.04, 1.34, 0.03, 0.16))):
        st.ell((px + dx_, 0.55 + Hh + dy_, pz + dz_), r_, r_ * 0.8, r_, seg=10, rings=6)
    ccyl(km, (px + 0.3, 0.55 + Hh + 0.02, pz + 0.2), (px + 0.62, 0.55 + Hh + 0.3, pz + 0.42), 0.008, STEEL, seg=5)                    # 靠在鍋邊的大漏勺
    clathe(km, [(0.0, 0.0), (0.07, 0.01), (0.1, 0.04), (0.095, 0.045), (0.0, 0.012)], px + 0.24, 0.55 + Hh - 0.03, pz + 0.16, '#c9ced2', seg=12)
    # 鍋子左邊的架子：一大籃剛撈起來的水餃
    bx, bz = -2.72, -2.72
    for k in range(3): a = k * 2 * PI / 3 + 0.5; ccyl(km, (bx + 0.1 * math.cos(a), 0.78, bz + 0.1 * math.sin(a)), (bx + 0.26 * math.cos(a), 0.0, bz + 0.26 * math.sin(a)), 0.012, STEEL_D, seg=6)
    clathe(km, [(0.0, 0.0), (0.16, 0.012), (0.27, 0.07), (0.31, 0.13), (0.318, 0.14), (0.3, 0.14), (0.25, 0.085), (0.15, 0.03), (0.0, 0.02)], bx, 0.77, bz, '#c0c5c8', seg=20)
    for k in range(13): a = k * 2.4; rd = 0.05 + 0.15 * ((k * 53) % 10) / 10; dumpling(kt, bx + rd * math.cos(a), 0.81 + 0.02 * (k % 3), bz + rd * math.sin(a), a)
    # 不鏽鋼工作檯（面向客人；包好的水餃一盤盤、餡料盆、擀麵棍、餃子皮、收銀機）＝櫃台
    wx0, wx1, wz0, wz1 = -0.8, 2.1, -2.88, -2.3
    ks.rbox(wx0 - 0.02, wx1 + 0.02, 0.82, 0.86, wz0 - 0.02, wz1 + 0.03, r=0.006, seg=1); km.cbox(wx0, wx1, 0.1, 0.82, wz0, wz1, '#a9aeb2')
    for k in range(4):
        a = wx0 + 0.02 + k * (wx1 - wx0 - 0.04) / 4; b = a + (wx1 - wx0 - 0.04) / 4
        km.crbox(a + 0.012, b - 0.012, 0.14, 0.78, wz1, wz1 + 0.014, '#bcc1c5', r=0.004, seg=1); km.crbox(b - 0.1, b - 0.07, 0.4, 0.56, wz1 + 0.014, wz1 + 0.03, '#8e9499', r=0.004, seg=1)
    for xx in (wx0 + 0.06, (wx0 + wx1) / 2, wx1 - 0.06): ccyl(km, (xx, 0.0, wz1 - 0.06), (xx, 0.1, wz1 - 0.06), 0.025, STEEL_D, seg=6)
    for (ta, tb) in ((-0.7, -0.08), (-0.02, 0.6)):
        km.crbox(ta, tb, 0.86, 0.878, wz0 + 0.08, wz1 - 0.06, '#c9ced2', r=0.004, seg=1); dumplings(kt, ta + 0.03, tb - 0.03, wz0 + 0.1, wz1 - 0.08, 0.878, 6, 3, rng)
    clathe(km, [(0.0, 0.0), (0.13, 0.0), (0.2, 0.1), (0.21, 0.11), (0.195, 0.11), (0.125, 0.012), (0.0, 0.012)], 0.92, 0.86, -2.62, '#c6cbce', seg=18)
    csph(kt, (0.92, 0.935, -2.62), 0.17, '#c9a78c', seg=12, rings=5, sy=0.5)
    for k in range(9): a = k * 2.1; cell_(kt, (0.92 + 0.1 * math.cos(a) * (0.4 + (k % 3) * 0.3), 1.0 + 0.004 * (k % 2), -2.62 + 0.1 * math.sin(a) * (0.4 + (k % 3) * 0.3)), 0.016, 0.006, 0.01, '#6aa046', rotz=a)   # 餡料裡的韭菜、高麗菜
    ccyl(c.vc, (1.14, 0.885, -2.42), (1.46, 0.885, -2.38), 0.022, '#c8a46a', seg=8)                                                    # 擀麵棍
    for k in range(2): ccyl(kt, (1.25 + k * 0.13, 0.86, -2.7), (1.25 + k * 0.13, 0.9 - k * 0.012, -2.7), 0.05, '#f3ecd9', seg=12)     # 餃子皮
    LS.register(c, 1.82, 0.86, -2.6, face='+z')
    if getattr(c, 'ph', None): c.ph.put('wooden_cutting_board', 1.36, 0.861, -2.68, 0.0, length=0.36, decimate=0.1, texres=256)   # CC0：餡料盆和收銀機中間一塊掃描的木砧板（Poly Haven）
    # 員工進出的矮門（工作檯右邊到東牆）
    ccyl(km, (2.2, 0.0, KZ - 0.04), (2.2, 0.98, KZ - 0.04), 0.03, STEEL_D, seg=8); ccyl(km, (X1 - 0.06, 0.0, KZ - 0.04), (X1 - 0.06, 0.98, KZ - 0.04), 0.03, STEEL_D, seg=8)
    km.crbox(2.25, 3.0, 0.22, 0.93, KZ - 0.055, KZ - 0.025, '#b7bcc0', r=0.01, seg=1); km.crbox(3.03, X1 - 0.1, 0.22, 0.93, KZ - 0.055, KZ - 0.025, '#b7bcc0', r=0.01, seg=1)
    c.vc.cbox(-3.2, 2.2, 0.0, 0.006, KZ + 0.04, KZ + 0.16, '#4a4e52')                                                                   # 煮水餃區前面的排水溝蓋
    for k in range(27): c.vc.cbox(-3.18 + k * 0.2, -3.08 + k * 0.2, 0.006, 0.009, KZ + 0.055, KZ + 0.145, '#2c2f32')
    c.block(X0, X1, Z0, KZ, 'dumpling_area')   # 不叫 kitchen：遊戲的備用方塊（模型還沒載好時）把 why 有 kitchen 的畫成 1.9 m 高
    c.counter = dict(x0=wx0, x1=wx1, z0=wz0, z1=wz1, h=0.86, note='煮水餃區的不鏽鋼工作檯（面向客人）')
    c.clerk = dict(x=0.6, z=-3.3, yaw=0.0, note='工作檯後面（煮水餃區），面向客人；老闆娘（AA_772 staff：原巷口家常菜的老闆娘）')
    c.order = dict(x=0.65, z=-1.65, r=0.8, label='點餐（' + NAME + '）', note='工作檯前面（shop118:home）')
    c.look('dumpling_pot', -1.4, -1.8, 0.8, '煮水餃的大鍋', '（老闆娘數都不數，一把下去剛好十顆。）', dev='AA_772 look_lines.home（開放式煮水餃區）；大鍋在 (-1.6, -2.82)')

    # ---------- 左牆：長條座位＋不鏽鋼桌＋木面圓凳 ----------
    bz0, bz1 = KZ + 0.04, 1.31
    banquette(c, bz0, bz1)
    TXc = -2.95                                                                                         # 桌子中心 x（桌面 −3.3…−2.6）
    for (tz, dl) in ((-1.4, 1.2), (-0.2, 0.7), (0.75, 0.7)):
        LS.table(c, TXc, tz, 0.7, dl, top='steel', legc=STEEL, block=False); condiments(c, TXc - 0.08, tz - (0.12 if dl < 1 else 0.1))
        for sz in ((tz - 0.3, tz + 0.3) if dl > 1 else (tz,)):
            c.seat(X0 + 0.3, sz, PI / 2, (TXc, tz), 'eat', ap=(-2.0, sz)); c.seats[-1]['r'] = 1.6       # 長條座位：前面是桌子，從走道那一側走近（離走道 1.5 m：r）
            stool_wood(c, -2.3, sz); c.seat(-2.3, sz, -PI / 2, (TXc, tz), 'eat')
    c.block(X0, -2.6, KZ, 1.35, 'banquette_row')
    # ---------- 中間兩張四人桌、右牆兩張兩人桌 ----------
    for tz in (-0.25, 2.15):
        LS.table(c, 0.8, tz, 1.2, 0.7, top='steel', legc=STEEL, block=False); condiments(c, 0.8, tz - 0.12); c.block(0.2, 1.4, tz - 0.4, tz + 0.4, 'table')
        for sx in (0.5, 1.1):
            stool_wood(c, sx, tz - 0.65); c.seat(sx, tz - 0.65, 0.0, (0.8, tz), 'eat'); stool_wood(c, sx, tz + 0.65); c.seat(sx, tz + 0.65, PI, (0.8, tz), 'eat')
    for tz in (-1.05, 0.95):
        LS.table(c, 3.42, tz, 0.7, 0.7, top='steel', legc=STEEL, block=False); condiments(c, 3.52, tz - 0.12); c.block(3.0, X1, tz - 0.4, tz + 0.4, 'table')
        stool_wood(c, 3.3, tz - 0.65); c.seat(3.3, tz - 0.65, 0.0, (3.42, tz), 'eat'); stool_wood(c, 3.3, tz + 0.65); c.seat(3.3, tz + 0.65, PI, (3.42, tz), 'eat')
    # ---------- 右前：不鏽鋼餐具架（碗、茶壺、保溫茶桶；下層蛋籃、青蔥、鍋子） ----------
    sx0, sx1, sz0, sz1 = 3.22, X1 - 0.02, 2.22, 3.68
    for yy in (0.2, 0.52, 0.86): c.steel.box(sx0, sx1, yy - 0.025, yy, sz0, sz1)
    for (xx, zz) in ((sx0 + 0.02, sz0 + 0.02), (sx1 - 0.02, sz0 + 0.02), (sx0 + 0.02, sz1 - 0.02), (sx1 - 0.02, sz1 - 0.02)): ccyl(c.vm, (xx, 0.0, zz), (xx, 0.86, zz), 0.016, STEEL_D, seg=6)
    tb = (3.5, 2.6)                                                                                       # 保溫茶桶（桶身、蓋子、水龍頭、提把）
    clathe(c.vm, [(0.0, 0.0), (0.17, 0.0), (0.18, 0.012), (0.18, 0.44), (0.172, 0.455), (0.0, 0.455)], tb[0], 0.86, tb[1], '#c6cbce', seg=20)
    clathe(c.vm, [(0.0, 0.0), (0.185, 0.0), (0.185, 0.025), (0.12, 0.06), (0.03, 0.07), (0.03, 0.1), (0.0, 0.1)], tb[0], 1.315, tb[1], '#b4b9bd', seg=20)
    ccyl(c.vm, (tb[0] - 0.18, 0.95, tb[1]), (tb[0] - 0.25, 0.95, tb[1]), 0.014, STEEL_D, seg=6); c.vc.cbox(tb[0] - 0.25, tb[0] - 0.225, 0.95, 1.0, tb[1] - 0.012, tb[1] + 0.012, '#2a2a2a')
    tp = (3.42, 3.08)                                                                                     # 茶壺
    clathe(c.vm, [(0.0, 0.0), (0.085, 0.0), (0.125, 0.05), (0.13, 0.1), (0.1, 0.165), (0.06, 0.18), (0.055, 0.19), (0.015, 0.2), (0.015, 0.22), (0.0, 0.22)], tp[0], 0.86, tp[1], '#c9ced2', seg=16)
    ccyl(c.vm, (tp[0] - 0.1, 0.93, tp[1]), (tp[0] - 0.22, 1.03, tp[1]), 0.022, '#c9ced2', seg=6, r2=0.012)
    for k in range(5): a0_, a1_ = k * PI / 5, (k + 1) * PI / 5; ccyl(c.vm, (tp[0], 1.04 + 0.1 * math.sin(a0_), tp[1] - 0.1 * math.cos(a0_)), (tp[0], 1.04 + 0.1 * math.sin(a1_), tp[1] - 0.1 * math.cos(a1_)), 0.007, '#3a3a3a', seg=4, caps=False)   # 提把
    for k, (xx, zz) in enumerate(((3.4, 3.42), (3.62, 3.42), (3.62, 3.18))): bowls(c.vc, xx, 0.86, zz, n=5 - k)
    for k in range(4): bowls(c.vc, 3.38 + (k % 2) * 0.22, 0.52, 2.45 + (k // 2) * 0.22, n=4)
    c.vc.crbox(3.3, 3.72, 0.52, 0.66, 3.0, 3.5, '#b89a5a', r=0.012, seg=1)                                # 青蔥的籃子
    for k in range(7): ccyl(c.vc, (3.34 + k * 0.05, 0.67, 3.04), (3.36 + k * 0.05, 0.69, 3.46), 0.012, '#5f9a3f' if k % 3 else '#e9efd8', seg=5)
    c.vc.crbox(3.28, 3.74, 0.2, 0.42, 2.3, 2.9, '#b8322c', r=0.012, seg=1); c.vc.cbox(3.3, 3.72, 0.4, 0.425, 2.32, 2.88, '#7a1f1b')    # 紅色蛋籃
    for k in range(15): csph(c.vc, (3.35 + (k % 5) * 0.08, 0.44, 2.4 + (k // 5) * 0.2), 0.03, '#e2c7a2' if k % 4 else '#f0e4d0', seg=8, rings=5, sy=1.2)
    clathe(c.vm, [(0.0, 0.0), (0.15, 0.0), (0.155, 0.01), (0.155, 0.2), (0.17, 0.21), (0.17, 0.22), (0.0, 0.22)], 3.5, 0.2, 3.3, '#c2c7ca', seg=16)
    c.block(3.0, X1, 2.15, 3.75, 'utensil_rack')

    # ---------- 牆上 ----------
    pr(c, 'W', -1.0, 0.5, 1.28, 2.43, 'BOARD'); frame(c, 'W', -1.0, 0.5, 1.28, 2.43, '#8c2a22')            # 手寫價目板（紅框）
    pr(c, 'W', -1.98, -1.46, 1.3, 2.3, 'PLAQUE', inset=0.03); c.wg('W', 'trim', M['vc'], cm=True).crbox(X0, X0 + 0.028, 1.28, 2.32, -2.0, -1.44, '#6b4423', r=0.006, seg=1)   # 木牌「手工水餃 現包現煮」
    pr(c, 'W', 0.74, 1.26, 1.42, 1.84, 'PHOTO1'); frame(c, 'W', 0.74, 1.26, 1.42, 1.84, '#3d2a1e', t=0.03)   # 老照片（窗和價目板中間、壁扇下面）
    pr(c, 'E', -2.1, -1.55, 1.5, 1.79, 'PHOTO2'); frame(c, 'E', -2.1, -1.55, 1.5, 1.79, '#3d2a1e', t=0.03)
    lattice_window(c, 1.5, 2.95, 1.08, 2.46)                                                             # 深木框格子窗（霧面玻璃；這面牆隔壁是鄰居，不做窗外的景）
    pr(c, 'W', -1.38, -1.1, 1.36, 1.8, 'CAL')
    pr(c, 'W', 3.2, 3.6, 1.2, 2.16, 'DOORSIGN', inset=0.03); c.wg('W', 'trim', M['vc'], cm=True).crbox(X0, X0 + 0.028, 1.18, 2.18, 3.18, 3.62, '#2e2018', r=0.006, seg=1)   # 門邊的直木牌
    LS.wall_shelf(c, 'W', -1.9, -1.4, 2.58, depth=0.24, items='jars'); LS.wall_shelf(c, 'W', -1.4, -1.04, 2.58, depth=0.24, items='none'); LS.wall_shelf(c, 'W', -1.04, -0.2, 2.58, depth=0.24, items='jars')                                    # 高處的層板：罐子、一盆垂下來的黃金葛
    wt = c.wg('W', 'trim', M['vc'], cm=True)
    clathe(wt, [(0.0, 0.0), (0.07, 0.0), (0.095, 0.13), (0.1, 0.14), (0.0, 0.14)], X0 + 0.13, 2.58, -1.22, '#e8e4dc', seg=12)   # 黃金葛放在價目板和木牌中間的上面（垂下來不擋字）
    for k in range(22):
        a = rng.uniform(0, 2 * PI); dn = rng.uniform(0.0, 0.5); rd = rng.uniform(0.04, 0.16)
        cell_(wt, (X0 + 0.14 + abs(rd * math.cos(a)) * 0.8, 2.74 - dn, -1.22 + rd * math.sin(a)), 0.055, 0.012, 0.04, rng.choice(['#3f7a3a', '#4f8f44', '#356a33']), rotz=a)
    f0 = set(c.vc.bm.faces); LS.wall_fan(c, X0, 2.6, 1.0, '+x'); nf = [q for q in c.vc.bm.faces if q not in f0]; c.vc.paint(nf[:-24], '#86a898')    # 綠色的舊壁扇（零件照 lane118_shops.wall_fan：機身改漆綠色；最後 24 個面是三片扇葉，照舊）
    pr(c, 'E', -0.4, 0.22, 1.4, 2.23, 'PAINT'); frame(c, 'E', -0.4, 0.22, 1.4, 2.23, '#3d2a1e')            # 山水畫
    pr(c, 'E', 2.45, 2.87, 1.22, 2.27, 'SCROLL', inset=0.02)                                             # 「五湖四海」掛軸
    et = c.wg('E', 'trim', M['vc'], cm=True)
    for yy in (1.21, 2.28): ccyl(et, (X1 - 0.03, yy, 2.41), (X1 - 0.03, yy, 2.91), 0.014, '#5a3d28', seg=6)
    lathe_x(et, [(0.0, 0.0), (0.215, 0.0), (0.225, 0.012), (0.225, 0.035), (0.2, 0.045), (0.19, 0.03), (0.0, 0.03)], X1, 2.55, 1.55, '#5a3423', seg=24, nx=-1)   # 圓掛鐘（木框）
    uvdisc(c.wg('E', 'iprint', M['iprint']), X1 - 0.034, 2.55, 1.55, 0.19, uvr(REG, 'CLOCK'), nx=-1)
    dd = c.door; pr(c, 'S', dd['x'] + 0.55, dd['x'] + 1.0, 1.25, 1.53, 'HOURS', inset=0.03)              # 營業時間：門邊的玻璃上
    pr(c, 'S', 0.4, 0.85, 1.35, 1.7, 'TAG', inset=0.03)                                                  # 窗上的「水餃」紙
    # ---------- 天花板：輕鋼架的格線、雙管日光燈 ----------
    cg = c.extra.setdefault('ceilgrid', Mesh('l118_home_ceilgrid', L.flat('l118_home_ceilgrid', '#cfc9bb', rough=0.9, cull=True)))
    x = X0 + 0.61
    while x < X1 - 0.1: cg.quad([(x - 0.012, H - 0.004, Z0), (x + 0.012, H - 0.004, Z0), (x + 0.012, H - 0.004, Z1), (x - 0.012, H - 0.004, Z1)]); x += 0.61
    z = Z0 + 0.61
    while z < Z1 - 0.1: cg.quad([(X0, H - 0.004, z - 0.012), (X1, H - 0.004, z - 0.012), (X1, H - 0.004, z + 0.012), (X0, H - 0.004, z + 0.012)]); z += 0.61
    pts = []
    for (lx, lz) in ((-1.7, -1.2), (1.7, -1.2), (-1.7, 0.95), (1.7, 0.95), (-1.7, 3.1), (1.7, 3.1), (0.6, -3.2)): pts += [(lx, lz - 0.09, 'x'), (lx, lz + 0.09, 'x')]
    LS.tubes(c, pts, L_=1.2)
    ceiling_fan(c, -0.7, 0.95)
    c.spawn['note'] = '從門進來、面向店裡（正前方是走道，直走到煮水餃的大鍋）'


PREVIEW = ([['door', [-2.2, 1.55, 4.0], [-0.6, 1.05, -2.0], 17], ['back', [0.9, 1.6, -3.5], [-1.2, 0.95, 3.0], 17]],
           [(-1.7, 2.9, -1.2, 42), (1.7, 2.9, -1.2, 42), (-1.7, 2.9, 0.95, 42), (1.7, 2.9, 0.95, 42), (-1.7, 2.9, 3.1, 42), (1.7, 2.9, 3.1, 42), (0.6, 2.9, -3.2, 36)])


def main():
    pv = LS.arg('--preview')
    if '--preview-only' in LS.ARGS: return preview(SID, os.path.join(L.ROOT, pv), *PREVIEW)      # 只重算預覽圖（不重新產生模型）
    os.makedirs(GEN, exist_ok=True)
    # lane118_shops 的兩個表改寫成新店（W、D、door_x 維持原值）；它的印刷品貼圖（Shop() 會讀）照新店名重畫——這間實際用的是自己的貼圖集（atlas()）
    LS.SPEC[SID] = dict(W=7.6, D=8.5, floor=('granite_tile', '#a09f9a', 1.0), wall='#efe7d4', wain=('rounded_square_tiled_wall', '#e7ddc6', 1.0), wainH=2.72, wood=('walnut_veneer', '#6e452c'), door_x=-2.6, trim='#cfc5ad', ceil='#eeebe2')
    TX.SHOPS[SID] = dict(name=NAME, sub=SUB, menu=MENU, hours=HOURS, bg='#f1e7d0', fg='#3a2a1e', ac='#a8261e', p1=('手工水餃', ['現包現煮']), p2='水餃專賣')
    TX.shop_atlas(SID, TX.SHOPS[SID])
    if not os.path.exists(os.path.join(GEN, 'l118_screens.png')): TX.screens()
    atlas(); tile_tex(); ensure_view(SID)
    c = LS.Shop(SID); c.extra = {}; c.REG = REG
    c.M['iprint'] = LS.img_mat('l118_home_iprint', 'l118_int_home_print.png', rough=0.6)
    c.M['wain'] = LS.img_mat('l118_home_walltile', 'l118_int_home_tile.png', rough=0.34)   # 牆面的方磚換成自己畫的 20 cm 米白磚（SPEC 的 wain 那張馬賽克不用）
    if SID in LS.CC0_INT: LS.cc0_setup(c)   # SHOP-CC0-HELP-1113（D161）：CC0 材質組＋Poly Haven 模型（lane118_shops.py 的同一套）
    build_home(c)
    if SID in LS.CC0_INT: LS.cc0_post(c)
    prob = finish2(c, src='L118-SHOPS-REDO-1111（使用者 2026-11-11 規格：店名、菜單；參考圖 l118_ref/int_home.webp）；室內 tools/blender/env_second/l118_int_home.py')
    print('L118_INT_HOME', 'OK' if not prob else prob)
    if pv: preview(SID, os.path.join(L.ROOT, pv), *PREVIEW)


if __name__ == '__main__':
    main()
