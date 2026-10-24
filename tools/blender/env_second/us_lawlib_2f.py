"""美國：法學院圖書館 2F 書庫（AA_399 第 8 節，企劃線 5d09bb725；LAWWW-B 10-24 任務 #82 第七間的另一半）
→ 區域 us_lawlib_2f 的配置＋二樓才有的東西（GLB）：assets/models/env/second_ai/us_lawlib_2f.{glb,json,layout.json}。LAWWW2-B 2026-10-24；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/us_lawlib_2f.py [-- --out-dir assets/models/env/second_ai]
企劃：
  - 書庫：開（圖書館開的時候）。一樓樓梯口的紅絨繩拿掉，換成「上 2F（書庫）」。
  - 學姊平日 10:30～12:00 在 2F（9:00～10:30 在 1F）；美國版的閒聊照舊，只是地點換到書庫（LAWWW-B）。
  - 書架的旁白：「（書架很高，最上層要用梯子。整排都是很舊的判例彙編。）」（AA_399 第 8 節；AA_287 第 120 行）。
做法：
  - 建築本身用一樓那一個 us_lawlib.glb（四層樓的中庭、迴廊、書架、樓梯都在裡面），區域裡往下放 4.6 m＝二樓的樓板在 y 0；
    一樓樓梯口的紅絨繩、小立牌、黃銅柱（usll_rope、usll_rope_sign、usll_stanchions 三個節點）在書庫開的時候藏起來（配置 glb_hide），一樓的區域也一樣。
  - 這支只做二樓才有的東西（座標＝圖書館的區域座標，二樓樓板＝y 0）：
      二樓 → 三樓的樓梯口：紅絨繩＋兩根黃銅柱＋小立牌（圖示：一張卡片；三樓以上這一版關著）；
      東邊迴廊一條走道裡一把靠在書架上的木梯（旁白「最上層要用梯子」）；北邊迴廊一條走道裡一台還書車；西邊迴廊一張圓形的踏凳；
      每一排書架朝走道那一端一塊白色的索書號牌（KF 1–… 一路排下去：美國國會圖書館分類的「美國法」，一般的分類號，不是書名）。
  - 導航（配置 blocks）照 us_lawlib.py 的幾何算：中庭挑空＋欄杆（往迴廊 0.12 m）、每一排書架、方柱、上面那些東西。
D77：沒有校名、書名、出版社。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, clathe, navcheck   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi; SID = 'us_lawlib_2f'
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_lawlib.layout.json'), encoding='utf-8'))
BD = J['bounds']; X0, X1, Z0, Z1 = BD['x0'], BD['x1'], BD['z0'], BD['z1']; V = J['void']; LV = J['levels']; SL = J['slab']
Y2 = LV[1]; H2 = LV[2] - SL - Y2                 # 二樓樓板（一樓地面往上 4.6 m）、二樓天花板（三樓樓板底）4.2 m
RAIL = 0.12                                      # 欄杆在中庭邊往迴廊 0.12 m（us_lawlib.py：玻璃欄杆 d＝0.12）
S1, S2 = J['stair'], J['stairs_up'][0]           # 一樓 → 二樓（東邊，往北上，頂在北邊迴廊）；二樓 → 三樓（西邊，從北邊迴廊往南上）
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


def rows():
    """二樓迴廊的書架（同 us_lawlib.py 的 shelf_row 那一段）：(x0, x1, z0, z1, 朝走道那一端)"""
    out = []
    for z in [Z0 + 1.0 + k * 1.8 for k in range(11)]:
        if z > Z1 - 1.0: break
        out.append((V['x1'] + 1.6, X1 - 0.6, z - 0.3, z + 0.3, 'E')); out.append((X0 + 0.6, V['x0'] - 1.6, z - 0.3, z + 0.3, 'W'))
    for x in [V['x0'] + 0.9 + k * 1.8 for k in range(9)]:
        if x > V['x1'] - 0.6: break
        out.append((x - 0.3, x + 0.3, Z0 + 0.6, V['z0'] - 1.4, 'N')); out.append((x - 0.3, x + 0.3, V['z1'] + 1.4, Z1 - 0.6, 'S'))
    return out


ROWS = rows()
NPL = len(ROWS); PW, PH = 128, 64                 # 索書號牌：8 × 8 格的貼圖，每格 128 × 64


def make_tex():
    im = Image.new('RGB', (1024, 512), '#808080'); d = ImageDraw.Draw(im); f2 = ImageFont.truetype(FONT, 15)
    order = sorted(range(NPL), key=lambda i: ({'N': 0, 'E': 1, 'S': 2, 'W': 3}[ROWS[i][4]], ROWS[i][0] if ROWS[i][4] in 'NS' else ROWS[i][2]))
    lo = 1
    for k, i in enumerate(order):
        cx, cy = (i % 8) * PW, (i // 8) * PH; n = 120 + (k * 37) % 90
        d.rectangle([cx, cy, cx + PW - 1, cy + PH - 1], fill=(246, 245, 240)); d.rectangle([cx + 3, cy + 3, cx + PW - 4, cy + PH - 4], outline=(60, 70, 90), width=2)
        t = 'KF %d–%d' % (lo, lo + n - 1); sz = 26
        while d.textlength(t, font=ImageFont.truetype(FONT, sz)) > PW - 16: sz -= 1   # 四位數的號碼縮小字，不要超出牌子
        f1 = ImageFont.truetype(FONT, sz); w = d.textlength(t, font=f1); d.text((cx + (PW - w) / 2, cy + 8 + (26 - sz) // 2), t, font=f1, fill=(30, 36, 50)); lo += n
        t2 = '2F'; w2 = d.textlength(t2, font=f2); d.text((cx + (PW - w2) / 2, cy + 40), t2, font=f2, fill=(110, 110, 120))
    # 二樓 → 三樓樓梯口的小立牌（圖示：一張卡片＋一個鎖，沒有字）：最後一列最右邊那一格
    cx, cy = 7 * PW, 7 * PH; d.rectangle([cx, cy, cx + PW - 1, cy + PH - 1], fill=(28, 44, 70))
    d.rounded_rectangle([cx + 30, cy + 14, cx + 76, cy + 46], radius=5, outline=(240, 236, 220), width=3); d.rectangle([cx + 30, cy + 22, cx + 76, cy + 28], fill=(240, 236, 220))
    d.rounded_rectangle([cx + 84, cy + 28, cx + 104, cy + 48], radius=3, fill=(240, 236, 220)); d.arc([cx + 86, cy + 16, cx + 102, cy + 36], 180, 360, fill=(240, 236, 220), width=3)
    im.save(os.path.join(GEN, SID + '_plates.png'))


def uvslot(i):
    cx, cy = (i % 8) * PW, (i // 8) * PH; return (cx / 1024, 1 - (cy + PH) / 512, (cx + PW) / 1024, 1 - cy / 512)


def build():
    B.reset(texres=512)
    root = B.group(SID, props={'kind': SID, 'layout': SID + '.layout.json', 'note': '二樓才有的東西；建築本身是 us_lawlib.glb（往下 4.6 m）'})
    M = {'vc': L.vc_material(SID + '_vc', rough=0.6), 'vcm': L.vc_metal(SID + '_vcmetal', rough=0.32, metal=0.45),
         'oak': L.pbr(SID + '_oak', 'walnut_veneer', tile=1.0, target='#c9a77a', contrast=1.0, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.5),   # 和書架同一種淺木
         'plates': img_mat(SID + '_plates', SID + '_plates.png', rough=0.5)}
    vc = CMesh(SID + '_props', M['vc']); vm = CMesh(SID + '_metal', M['vcm']); oak = Mesh(SID + '_oakparts', M['oak']); pl = Mesh(SID + '_plates', M['plates'])
    blocks = []
    def block(x0, x1, z0, z1, why): blocks.append(dict(x0=round(x0, 3), x1=round(x1, 3), z0=round(z0, 3), z1=round(z1, 3), why=why))
    # 導航：中庭挑空＋欄杆、書架、方柱（建築本身的，模型在 us_lawlib.glb）
    block(V['x0'] - RAIL, V['x1'] + RAIL, V['z0'] - RAIL, V['z1'] + RAIL, 'void（中庭挑空＋玻璃欄杆）')
    for (x0, x1, z0, z1, side) in ROWS: block(x0, x1, z0, z1, 'stacks ' + side)
    for c in J['columns']: block(c['x'] - 0.35, c['x'] + 0.35, c['z'] - 0.35, c['z'] + 0.35, 'column')
    # 索書號牌：每一排朝走道那一端
    for i, (x0, x1, z0, z1, side) in enumerate(ROWS):
        y0, y1 = 1.42, 1.66; e = 0.004
        if side == 'E':   p = [(x0 - e, y0, z0 + 0.06), (x0 - e, y0, z1 - 0.06), (x0 - e, y1, z1 - 0.06), (x0 - e, y1, z0 + 0.06)]   # 朝 −x（看的人往 +x 看）：左下在 −z
        elif side == 'W': p = [(x1 + e, y0, z1 - 0.06), (x1 + e, y0, z0 + 0.06), (x1 + e, y1, z0 + 0.06), (x1 + e, y1, z1 - 0.06)]   # 朝 +x：左下在 +z
        elif side == 'N': p = [(x0 + 0.06, y0, z1 + e), (x1 - 0.06, y0, z1 + e), (x1 - 0.06, y1, z1 + e), (x0 + 0.06, y1, z1 + e)]   # 朝 +z：左下在 −x
        else:             p = [(x1 - 0.06, y0, z0 - e), (x0 + 0.06, y0, z0 - e), (x0 + 0.06, y1, z0 - e), (x1 - 0.06, y1, z0 - e)]   # 朝 −z：左下在 +x
        uvquad(pl, p, uvslot(i))
    # 二樓 → 三樓樓梯口：紅絨繩＋兩根黃銅柱＋小立牌（同一樓的做法）
    rz = V['z0'] - RAIL - 0.12; xa, xb = S2['x0'] - 0.12, S2['x1'] + 0.12
    for x in (xa, xb):
        clathe(vm, [(0.0, 0.0), (0.16, 0.0), (0.16, 0.025), (0.05, 0.05), (0.025, 0.08), (0.025, 0.9), (0.04, 0.93), (0.035, 0.98), (0.0, 0.98)], x, 0.0, rz, '#b08a3e', seg=14)
    for k in range(12):
        t0, t1 = k / 12, (k + 1) / 12; sag = lambda t: 0.93 - 0.22 * 4 * t * (1 - t)
        ccyl(vc, (xa + (xb - xa) * t0, sag(t0), rz), (xa + (xb - xa) * t1, sag(t1), rz), 0.022, '#7e1c22', seg=8)
    sx = xa - 0.45; ccyl(vm, (sx, 0.0, rz), (sx, 0.95, rz), 0.015, '#b08a3e', seg=8); clathe(vm, [(0.0, 0.0), (0.13, 0.0), (0.13, 0.02), (0.0, 0.02)], sx, 0.0, rz, '#b08a3e', seg=12)
    vm.cbox(sx - 0.17, sx + 0.17, 0.95, 1.13, rz - 0.012, rz + 0.012, '#b08a3e')
    uvquad(pl, [(sx - 0.15, 0.965, rz + 0.014), (sx + 0.15, 0.965, rz + 0.014), (sx + 0.15, 1.115, rz + 0.014), (sx - 0.15, 1.115, rz + 0.014)], uvslot(63))   # 朝 +z（從迴廊看）
    block(sx - 0.2, xb + 0.18, rz - 0.18, V['z0'] - RAIL, 'rope（二樓 → 三樓：三樓以上這一版關著）')
    # 東邊迴廊的一條走道（z 0～1.8 那兩排之間）：靠在書架上的木梯
    ax, fz, tz = 10.7, 0.72, 1.47
    for s in (-1, 1): oak.box(ax + s * 0.22 - 0.025, ax + s * 0.22 + 0.025, 0.0, 0.05, fz - 0.03, fz + 0.03)
    for s in (-1, 1):
        x = ax + s * 0.22; ccyl(vc, (x, 0.02, fz), (x, 2.18, tz), 0.028, '#c9a77a', seg=8)
        vm.cbox(x - 0.02, x + 0.02, 2.12, 2.22, tz - 0.03, tz + 0.01, '#b08a3e')                                       # 上面的黃銅掛勾
    for k in range(1, 8):
        t = k / 8; y = 0.02 + 2.16 * t; z = fz + (tz - fz) * t; oak.box(ax - 0.21, ax + 0.21, y - 0.02, y + 0.02, z - 0.06, z + 0.06)
    block(ax - 0.3, ax + 0.3, fz - 0.12, tz, 'ladder')
    # 北邊迴廊的一條走道（x −1.2、0.6 那兩排之間）：還書車（沿 z）
    cx, cz0, cz1 = -0.3, -9.0, -8.0
    for y in (0.22, 0.58, 0.94): vm.cbox(cx - 0.22, cx + 0.22, y - 0.02, y, cz0, cz1, '#5b6066')
    for (x, z) in ((cx - 0.21, cz0 + 0.02), (cx + 0.21, cz0 + 0.02), (cx - 0.21, cz1 - 0.02), (cx + 0.21, cz1 - 0.02)):
        ccyl(vm, (x, 0.08, z), (x, 1.0, z), 0.012, '#8a9096', seg=6); ccyl(vc, (x - 0.03, 0.04, z), (x + 0.03, 0.04, z), 0.04, '#2a2b2d', seg=8)
    ccyl(vm, (cx - 0.2, 1.0, cz1 + 0.03), (cx + 0.2, 1.0, cz1 + 0.03), 0.014, '#8a9096', seg=6)                              # 推把
    rr = random.Random(82)
    for y in (0.22, 0.58, 0.94):
        z = cz0 + 0.04
        while z < cz1 - 0.06:
            w = rr.uniform(0.04, 0.08); h = rr.uniform(0.22, 0.3); col = rr.choice(['#5a1e1e', '#1e2f4a', '#2f4a2e', '#4a3a26', '#6e5a3a', '#2b2b2b'])
            vc.cbox(cx - 0.17, cx + 0.15, y, y + h, z, min(z + w, cz1 - 0.04), col); vc.cbox(cx - 0.17, cx + 0.15, y + h * 0.82, y + h * 0.86, z, min(z + w, cz1 - 0.04), '#c9a24a')   # 燙金線
            z += w + 0.004
    block(cx - 0.3, cx + 0.3, cz0 - 0.05, cz1 + 0.12, 'book cart')
    # 西邊迴廊的一條走道（z 0～1.8）：圓形的踏凳
    clathe(vc, [(0.0, 0.0), (0.22, 0.0), (0.2, 0.04), (0.16, 0.38), (0.17, 0.4), (0.0, 0.4)], -10.4, 0.0, 0.9, '#6a7480', seg=18)
    clathe(vc, [(0.0, 0.4), (0.17, 0.4), (0.17, 0.41), (0.0, 0.415)], -10.4, 0.0, 0.9, '#2a2b2d', seg=18)
    block(-10.65, -10.15, 0.65, 1.15, 'step stool')
    for m in (vc, vm): m.finish(root, uv=False)
    oak.finish(root); pl.finish(root, uv=False, merge=False)
    out = os.path.join(OUTDIR, SID + '.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    ex = dict(x=round((S1['x0'] + S1['x1']) / 2, 3), z=round(V['z0'] - RAIL - 0.2, 3), r=0.75, label='下樓（一樓）', to='us_lawlib', spawn_note='回到一樓樓梯口（back_spawn）')
    spawn = dict(x=5.0, z=-6.3, yaw=round(-PI / 2, 4), note='上到二樓、樓梯頂往西走一步（離「下樓」的點 1.5 m）')
    lay = dict(version=1, zone=SID, name='法學院圖書館 2F 書庫（美國）', type='書庫', src='AA_399 第 8 節（企劃線 5d09bb725）；LAWWW-B 10-24 03:53 任務 #82',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=round(H2, 3), cam_dist=4.0,
               glb='us_lawlib', glb_y=-Y2, glb_hide=['usll_rope', 'usll_rope_sign', 'usll_stanchions'],
               note_glb='建築本身＝us_lawlib.glb 往下 4.6 m（二樓樓板在 y 0）；這一區自己的 GLB（us_lawlib_2f.glb）只有二樓才有的東西；一樓樓梯口的紅絨繩、小立牌、黃銅柱（三個節點，usll_stanchions 只有那兩根柱子和立牌的桿子）藏起來',
               lamps=[[10.2, -4.5], [10.2, 4.5], [-10.2, -4.5], [-10.2, 4.5], [0.0, -7.9], [0.0, 7.9]],
               door=dict(x=ex['x'], z=V['z0'], w=S1['x1'] - S1['x0'], axis='x', note='一樓 → 二樓的樓梯頂（北邊迴廊的欄杆缺口）'),
               spawn=spawn, exits=[ex], windows=dict(side='N', wall='front', xs=[], y=2.0, w=0.0, h=0.0, note='二樓沒有窗'),
               counter=None, clerk=None, order=None, seats=[], blocks=blocks,
               interact=[dict(id='stacks', x=8.35, z=-2.7, r=1.0, label='書架', note='', dev='旁白照 AA_399 第 8 節（rooms_glb3d.js 的 LOOK）'),
                         dict(id='stair3', x=round((S2['x0'] + S2['x1']) / 2, 3), z=round(rz - 0.45, 3), r=0.8, label='樓梯（三樓）', note='', dev='三樓以上這一版關著（紅絨繩＋卡片圖示的小立牌）；遊戲裡的字等 AA 寫'),
                         dict(id='ladder', x=9.55, z=0.9, r=0.8, label='木梯', note='', dev='「最上層要用梯子」那一把；看的字等 AA 寫')],
               spots=dict(sis=dict(x=8.45, z=-0.9, yaw=round(PI / 2, 4), act='stand', note='學姊平日 10:30～12:00：站在東邊迴廊的走道口、面向書架之間（翻一本判例彙編）'),
                          player=dict(x=8.4, z=-2.1, yaw=0.0, act='stand', note='玩家（走道上，看著她）')),
               teacherSpot=None,
               back_spawn=dict(x=round((S1['x0'] + S1['x1']) / 2, 3), z=5.6, lv=0, yaw=0.0, note='一樓樓梯口（紅絨繩原本的位置往南 1 m）、面向南'),
               host_door=dict(zone='us_lawlib', id='stair_rope', lv=0, label='上 2F（書庫）', note='us3d.js 一樓的「樓梯（樓上書庫）」那一點：開的時候變成上樓，紅絨繩藏起來'),
               note_open='沒有 open：圖書館開的時候都開（一樓 us_lawlib 沒有開館時段，二樓跟著一樓）')
    prob = navcheck(None, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob)
    L.write_json(os.path.join(OUTDIR, SID + '.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=SID + '.layout.json', out='assets/models/env/second_ai/' + SID + '.glb'))
    print(json.dumps({'room': SID, 'tris': tris, 'plates': NPL, 'blocks': len(blocks), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('US_LAWLIB_2F', 'OK' if not p else p)
