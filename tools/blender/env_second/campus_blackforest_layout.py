"""黑森林（CAMPUS-BLACKFOREST-1102；LAWWW2〔帳號 A〕2026-11-02）的配置：範圍、土徑、水池、每一棵樹、林下灌木。
  python3 tools/blender/env_second/campus_blackforest_layout.py [--write <repo>] [--json <檔>]
  --write 寫 <repo>/src/data/blackforest_layout.js（const BLACKFOREST_LAYOUT）；遊戲 src/zones3d.js（校園）、Blender tools/blender/env_second/campus_blackforest.py 讀同一份。
起因：使用者 11-02 20:3x「你的黑森林超奇怪的，而且裡面怎麼還會有草皮中的磁磚啊，而且你這一小塊根本就不能叫做黑森林」。
  第二十四批的黑森林：法學院廣場南邊 34×14 m、11 棵樹散在草色地面上，「小步道」是淺色地磚（W3.pathTex）。
真實的黑森林（維基百科〈國立臺灣大學黑森林〉校園文化資產詮釋實習課條目；台大自然保育社 2012 年紀錄）：
  國青宿舍、霖澤館、萬才館之間一大片茂密的樹林，約 9,660 m²；以密集的榕樹為主（名字來自榕樹的濃蔭），
  還有樟樹、黑板樹、白千層、南洋杉、構樹、茄冬等；枝葉把陽光遮住，林下陰暗。
遊戲（法學院區壓縮過，D25；位置照使用者的法律學院配置圖 D31：法學院廣場南邊）：
  - 北塊：x 37.5～100、z −78.6～−65.4（法學院廣場邊那排樹到 z −60 那條路的路緣）。
  - 南塊：x 37.5～100、z −54.6～−44.6（那條路的南邊到下一排建築前）；z −60 的路變成穿過森林。
  - 共約 1,450 m²（原本約 480 m²、真實約 9,660 m²）。
  - 樹：榕樹為主、樟樹少數（遊戲的 street_trees 正式模型：TK.tree 的 sp），樹冠互相交疊；樹幹擋導航。
  - 地面：落葉泥土地（Blender 模型），土徑；沒有草皮、沒有地磚。
  - 水池（第二十四批，霖澤館東南邊）照舊。
  - 路人走的點（story3d.js walkRoutes：(50,−80)、(93,−66)、路上那幾個）旁邊不放樹；路人用找路，會走土徑或在樹之間繞。
"""
import json, math, os, random, sys

# ---- 第二版（11-02 21:4x，使用者附 5 張實景照片：「黑森林其實是兩個系館之間，而且真的很大，你參考一下校園的分布圖……旁邊還有一個小湖，從系館之間的走道會經過那個小湖，然後湖再往校園才是黑森林」）----
# 官方地圖（2026-10-14 版）：霖澤館在北邊辛亥路旁，霖澤館南邊、研三舍旁一個小湖，再往南（往校園）、萬才館西邊是一大片樹林（約 97×81 m）。
# 遊戲（D25 壓縮、D31 兩館朝南）：霖澤館 (34,−112)、萬才館 (88,−112)，兩館中間的空隙 x 54～73。
#   - 霖澤館前庭（劇情的「法學院廣場」：站位 (50,−93)、(58,−90)、事件 (61,−94)）保留成鋪面：x 25～62、z −106～−84；兩館正面一條鋪面 z −106～−97。
#   - 兩館之間往南的走道（鋪面 3 m，x 63.75）：經過小湖西邊，接到 z −60 那條路。
#   - 小湖：走道東邊 (73.5,−87)，水泥弧形池邊、垂柳、石頭、水生植物（照片 4、5）。
#   - 黑森林：小湖和兩館南邊整塊——走道西邊 x 36～62（z −84～−65.4）、走道東邊 x 65.5～100（z −96～−65.4，小湖、往萬才館的鋪面路除外）、z −60 路南邊 x 37.5～100（z −54.6～−44.6）。
#   - 地面：草地夾落葉（照片 1、3：樹下落葉多、樹之間是草）、細土徑；遮蔭但不是全黑。
AREAS = [{'id': 'nw', 'x0': 36.0, 'x1': 62.0, 'z0': -84.0, 'z1': -65.4},
         {'id': 'ne', 'x0': 65.5, 'x1': 74.5, 'z0': -96.0, 'z1': -65.4},
         {'id': 'ne2', 'x0': 74.5, 'x1': 100.0, 'z0': -89.0, 'z1': -65.4},   # 萬才館正面的弧形量體、大樓梯往南凸到 z −92（x 75～90），森林從 z −89 開始
         {'id': 'south', 'x0': 37.5, 'x1': 100.0, 'z0': -54.6, 'z1': -44.6}]
# 土徑（中心線、寬）：細的（照片 3 那種一人寬的小徑）；往萬才館那條是鋪面路（kind paved，遊戲 zones3d 照舊畫成鋪面），不放樹
PATHS = [{'id': 'nw', 'w': 1.2, 'pts': [[43.4, -84.6], [43.2, -78.0], [40.0, -72.0], [35.2, -67.0]]},
         {'id': 'nw2', 'w': 1.2, 'pts': [[56.0, -84.6], [57.5, -76.0], [54.0, -69.0], [52.0, -65.0]]},
         {'id': 'ne', 'w': 1.2, 'pts': [[65.5, -79.5], [71.0, -77.5], [78.0, -76.6], [84.5, -75.4], [90.5, -73.5]]},
         {'id': 'ne3', 'w': 1.2, 'pts': [[71.0, -77.5], [73.5, -72.0], [70.0, -65.0]]},
         {'id': 'wancai', 'w': 4.0, 'kind': 'paved', 'pts': [[92.5, -97.0], [92.5, -64.0]]},
         {'id': 'walk', 'w': 3.0, 'kind': 'paved', 'pts': [[63.75, -104.0], [63.75, -64.0]]},
         {'id': 's1', 'w': 1.2, 'pts': [[55.0, -55.0], [52.2, -50.2], [47.0, -44.2]]},
         {'id': 's2', 'w': 1.2, 'pts': [[82.0, -55.0], [85.0, -49.6], [80.4, -44.2]]}]
# 小湖（第三版，BB_248 末節第 2 點：照片是彎曲、長條、像水道的形狀，水泥矮邊沿著彎走）：中心線＋每點半寬；輪廓、池邊外緣由 pond_outline() 算好寫進配置（Blender、遊戲共用）
POND = {'pts': [[67.6, -93.0], [70.4, -90.4], [74.2, -88.9], [77.8, -86.6], [80.0, -83.4], [81.8, -80.9]],
        'hw': [1.3, 2.1, 2.7, 2.6, 2.0, 1.3], 'rim': 0.3, 'willow': [66.4, -89.2]}
KEEP = [[50, -80], [66, -80], [93, -66], [92, -62], [80, -62], [60, -62], [36, -62], [40, -70]]   # 路人走的點（story3d.js walkRoutes）、以安散步的檢查點（story3d.js walkChecks (40,−70)）
PLAZA_TREES = [[22.0, -80.0], [24.5, -94.5], [61.4, -88.0]]     # 範圍外、保持距離的東西（霖澤館前庭西邊那棵樹、大樟樹、湖邊長椅）
SPACING = 4.3          # 樹的間距（格子）；隨機偏移 ±1.4、最近不小於 3.0 m
MIN_TREE = 3.0
SEED = 20261102


def seg_dist(px, pz, a, b):
    ax, az = a; bx, bz = b; dx, dz = bx - ax, bz - az; L2 = dx * dx + dz * dz or 1e-9
    t = max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L2)); qx, qz = ax + t * dx, az + t * dz
    return math.hypot(px - qx, pz - qz)


def path_dist(x, z):
    """到最近一條土徑邊緣的距離（負的＝在路上）"""
    best = 1e9
    for p in PATHS:
        for a, b in zip(p['pts'], p['pts'][1:]): best = min(best, seg_dist(x, z, a, b) - p['w'] / 2)
    return best


def pond_hw(x, z):
    """到水道中心線的距離、那裡的半寬（沿中心線內插）"""
    best = (1e9, 1.0)
    P = POND['pts']; H = POND['hw']
    for i in range(len(P) - 1):
        ax, az = P[i]; bx, bz = P[i + 1]; dx, dz = bx - ax, bz - az; L2 = dx * dx + dz * dz or 1e-9
        t = max(0.0, min(1.0, ((x - ax) * dx + (z - az) * dz) / L2)); d = math.hypot(x - ax - t * dx, z - az - t * dz)
        if d < best[0]: best = (d, H[i] + (H[i + 1] - H[i]) * t)
    return best


def pond_dist(x, z):
    """到池邊外緣（水＋水泥池邊）的距離（負的＝在池子裡）"""
    d, hw = pond_hw(x, z); return d - hw - POND['rim']


def pond_outline(off=0.0, n_cap=6):
    """水道的輪廓多邊形（水邊；off＝往外再推，池邊外緣用 off=rim）：左邊順著走、尾端半圓、右邊倒著走、頭端半圓"""
    P = POND['pts']; H = POND['hw']; L_, R_ = [], []
    for i in range(len(P)):
        a = P[max(0, i - 1)]; b = P[min(len(P) - 1, i + 1)]; tx, tz = b[0] - a[0], b[1] - a[1]; tl = math.hypot(tx, tz) or 1; tx, tz = tx / tl, tz / tl
        nx, nz = -tz, tx; w = H[i] + off
        L_.append([P[i][0] + nx * w, P[i][1] + nz * w]); R_.append([P[i][0] - nx * w, P[i][1] - nz * w])
    def cap(c, w, tx, tz, sgn):
        nx, nz = -tz, tx; out = []
        for k in range(1, n_cap):
            a = math.pi * k / n_cap; ca, sa = math.cos(a), math.sin(a)
            out.append([c[0] + (nx * ca + tx * sa * sgn) * w, c[1] + (nz * ca + tz * sa * sgn) * w])
        return out
    e = P[-1]; tx, tz = P[-1][0] - P[-2][0], P[-1][1] - P[-2][1]; tl = math.hypot(tx, tz); tx, tz = tx / tl, tz / tl
    s0 = P[0]; ux, uz = P[1][0] - P[0][0], P[1][1] - P[0][1]; ul = math.hypot(ux, uz); ux, uz = ux / ul, uz / ul
    poly = L_ + cap(e, H[-1] + off, tx, tz, 1) + R_[::-1] + [[p[0], p[1]] for p in cap(s0, H[0] + off, -ux, -uz, 1)]
    return [[round(p[0], 3), round(p[1], 3)] for p in poly]


def in_area(x, z, m=0.0):
    return any(a['x0'] + m <= x <= a['x1'] - m and a['z0'] + m <= z <= a['z1'] - m for a in AREAS)


def build():
    rnd = random.Random(SEED); trees = []
    # 第三版（BB_248 末節第 1 點：65 棵像同一棵、排成等距的一排排）：泊松圓盤（每棵自己的最小間距 2.8～4.6 m、試很多次隨機點），
    # 大小 0.6～1.3 倍、方向隨機；三種：榕樹（矮、寬、氣根）、樟樹（高直、樹冠圓）、高瘦的樹（照片 3、5 那種高直樹幹：樟樹模型拉高、樹冠縮窄）
    for A in AREAS:
        area = (A['x1'] - A['x0']) * (A['z1'] - A['z0'])
        for _ in range(int(area * 2.2)):
            x = rnd.uniform(A['x0'], A['x1']); z = rnd.uniform(A['z0'], A['z1'])
            if not in_area(x, z, 0.8) or path_dist(x, z) < 0.9 or pond_dist(x, z) < 1.2: continue
            if any(math.hypot(x - k[0], z - k[1]) < 2.4 for k in KEEP + PLAZA_TREES) or math.hypot(x - POND['willow'][0], z - POND['willow'][1]) < 3.2: continue
            gap = rnd.uniform(2.8, 4.6)
            if any(math.hypot(x - t['x'], z - t['z']) < max(gap, t['gap']) * 0.85 for t in trees): continue
            sc = rnd.uniform(0.6, 1.3); r = rnd.random()
            if r < 0.55:   # 榕樹：枝幹多、樹冠寬、深綠
                t = {'sp': 'banyan', 'h': round(6.4 * 1.7 * sc, 2), 'spread': round(rnd.uniform(1.05, 1.5), 2), 'dark': round(rnd.uniform(0.6, 0.78), 2), 'trunk': round(0.45 + 0.3 * sc, 2)}
            elif r < 0.8:  # 樟樹：直一點、高一點
                t = {'sp': 'camphor', 'h': round(6.4 * 1.85 * sc, 2), 'spread': round(rnd.uniform(0.95, 1.25), 2), 'dark': round(rnd.uniform(0.78, 0.92), 2), 'trunk': round(0.35 + 0.2 * sc, 2)}
            else:          # 高瘦：高直的樹幹、樹冠窄（照片 3、5）
                t = {'sp': 'camphor', 'h': round(6.4 * rnd.uniform(2.1, 2.6), 2), 'spread': round(rnd.uniform(0.62, 0.8), 2), 'dark': round(rnd.uniform(0.7, 0.85), 2), 'trunk': 0.35, 'tall': True}
            t.update({'x': round(x, 2), 'z': round(z, 2), 'ry': round(rnd.uniform(0, 6.283), 3), 'seed': 900 + len(trees), 'gap': round(gap, 2)}); trees.append(t)
    # 林下灌木、蕨類（Blender 模型；不擋導航——高 0.5～1.3 m，人可以從旁邊擠過去的那種密度）
    shrubs = []
    for A in AREAS:
        n = int((A['x1'] - A['x0']) * (A['z1'] - A['z0']) / 55.0)   # 照片：林下大多是草加落葉，只有零星小灌木（BB_248 末節第 3 點：大蕨類太多）
        for _ in range(n * 3):
            if len([s for s in shrubs if s['a'] == A['id']]) >= n: break
            x = rnd.uniform(A['x0'] + 0.4, A['x1'] - 0.4); z = rnd.uniform(A['z0'] + 0.4, A['z1'] - 0.4)
            if path_dist(x, z) < 0.5 or pond_dist(x, z) < 0.3: continue
            if any(math.hypot(x - t['x'], z - t['z']) < t['trunk'] + 0.5 for t in trees): continue
            if any(math.hypot(x - s['x'], z - s['z']) < 1.5 for s in shrubs): continue
            shrubs.append({'a': A['id'], 'x': round(x, 2), 'z': round(z, 2), 'h': round(rnd.uniform(0.35, 0.8), 2), 'r': round(rnd.uniform(0.3, 0.6), 2), 'ry': round(rnd.uniform(0, 6.283), 2),
                           'kind': 'fern' if rnd.random() < 0.2 else 'shrub'})
    area_m2 = sum((a['x1'] - a['x0']) * (a['z1'] - a['z0']) for a in AREAS)
    pond = dict(POND); pond['outline'] = pond_outline(0.0); pond['outer'] = pond_outline(POND['rim'])
    return {'version': 3, 'areas': AREAS, 'paths': PATHS, 'pond': pond, 'keep': KEEP, 'trees': trees, 'shrubs': shrubs,
            'stats': {'area_m2': round(area_m2), 'trees': len(trees), 'banyan': sum(t['sp'] == 'banyan' for t in trees), 'shrubs': len(shrubs)}}


def main():
    A = sys.argv[1:]; L = build()
    if '--json' in A: json.dump(L, open(A[A.index('--json') + 1], 'w'), ensure_ascii=False, indent=1)
    if '--write' in A:
        p = os.path.join(A[A.index('--write') + 1], 'src', 'data', 'blackforest_layout.js')
        head = ('/* ===== 校園：黑森林的配置（CAMPUS-BLACKFOREST-1102）=====\n'
                '   由 tools/blender/env_second/campus_blackforest_layout.py 產生，不要手改。遊戲 src/zones3d.js（校園）、Blender tools/blender/env_second/campus_blackforest.py 讀同一份。\n'
                '   座標：校園世界座標（x 往東、−z 往北）。 */\n')
        open(p, 'w', encoding='utf-8').write(head + 'const BLACKFOREST_LAYOUT=' + json.dumps(L, ensure_ascii=False, indent=1) + ';\n')
        print('wrote', p)
    print(json.dumps(L['stats'], ensure_ascii=False))


if __name__ == '__main__':
    main()
