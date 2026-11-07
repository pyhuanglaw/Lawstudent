"""把 GLB 裡的 GLOW_* 標記（AA／BB 店內模型的燈位：空節點，extras 有 glow 顏色、size、day、night）換成 bake_room.py 的 --points（LAWWW2-B 2026-11-07，光照第一級第三批：溫州街 7 間）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/glow_points.py <glb> [--w pendant=9,sconce=5,...] [--default 5] [--drop 0.05] [--radius 0.05] [--only 正規式] [--skip 正規式] [--scale 1.0]
輸出一行：x,y,z,W,r,g,b,半徑;...（bake_room --points 的格式；遊戲座標 x 東、y 上、z 南）。
  - 標記名字是 GLOW_<種類>_<編號>（pendant 吊燈、sconce 壁燈、spot 投射燈、tablelamp 檯燈、floorlamp 落地燈、washi／andon 紙燈、candle 蠟燭、barled 吧台燈條、track 軌道燈、panel 平板燈…），照種類給瓦數（--w 蓋過預設）。
  - 顏色用 extras.glow（rgba），沒有就暖白；位置是世界座標（一路乘上父節點的變換），往下 --drop m（燈泡在燈罩裡面：光源放在燈罩口）。
  - 晚上比白天亮的才算燈（extras.night > 0）；--only／--skip 用名字篩選。
  - --below（預設開；--no-below 關）：標記常常就在燈罩、紙燈、壁燈燈座「裡面」（小路的吊燈：燈罩幾何在標記 −0.06～+0.12 m；紙燈是封閉的頂點色網格），
    光源放在裡面會被擋住，只剩彈射光（試烘晚上 0.08，滿地亮點）。改成：找標記水平 0.3 m、上下 −0.35～+0.3 m 內「烘焙時不藏」的網格頂點，
    光源放到那些頂點最低處再往下 3 cm（燈罩口、紙燈下面）；最多往下 0.4 m。蠟燭（candle）不動。--hide 和 bake_gg_new.sh 的 HIDE 一樣（藏起來的不算）。"""
import json, math, re, struct, sys

WATT = {'pendant': 9, 'sconce': 5, 'spot': 6, 'tablelamp': 4, 'floorlamp': 6, 'washi': 6, 'andon': 4, 'candle': 0.6,
        'barled': 3, 'track': 6, 'panel': 14}


def arg(k, d=None):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d


def mat_mul(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(4)) for j in range(4)] for i in range(4)]


def node_mat(nd):
    if 'matrix' in nd:
        m = nd['matrix']; return [[m[c * 4 + r] for c in range(4)] for r in range(4)]
    t = nd.get('translation', [0, 0, 0]); q = nd.get('rotation', [0, 0, 0, 1]); s = nd.get('scale', [1, 1, 1])
    x, y, z, w = q
    R = [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
         [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
         [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]]
    return [[R[i][0] * s[0], R[i][1] * s[1], R[i][2] * s[2], t[i]] for i in range(3)] + [[0, 0, 0, 1]]


def main():
    p = sys.argv[1]
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n])
    watt = dict(WATT)
    for kv in (arg('--w', '') or '').split(','):
        if '=' in kv: k, v = kv.split('='); watt[k.strip()] = float(v)
    dflt = float(arg('--default', 5)); drop = float(arg('--drop', 0.05)); rad = float(arg('--radius', 0.05)); scale = float(arg('--scale', 1.0))
    only = re.compile(arg('--only')) if arg('--only') else None; skip = re.compile(arg('--skip')) if arg('--skip') else None
    I = [[1 if i == j else 0 for j in range(4)] for i in range(4)]; marks = []; verts = []
    below = '--no-below' not in sys.argv; hide = re.compile(arg('--hide', r'glass|VIEW|bulb|washi|_pend$'))
    bin0 = 20 + n + 8

    def positions(acc_i, W):
        a = J['accessors'][acc_i]; bv = J['bufferViews'][a['bufferView']]; off = bin0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride', 12)
        for k in range(a['count']):
            x, y, z = struct.unpack_from('<3f', b, off + k * st)
            yield (W[0][0] * x + W[0][1] * y + W[0][2] * z + W[0][3], W[1][0] * x + W[1][1] * y + W[1][2] * z + W[1][3], W[2][0] * x + W[2][1] * y + W[2][2] * z + W[2][3])

    def walk(i, M):
        nd = J['nodes'][i]; W = mat_mul(M, node_mat(nd)); nm = nd.get('name', '')
        m = re.match(r'^GLOW_([a-z]+)', nm)
        if m and 'mesh' not in nd and not (only and not only.search(nm)) and not (skip and skip.search(nm)):
            ex = nd.get('extras') or {}
            if float(ex.get('night', 1) or 0) > 0:
                c = re.findall(r'[\d.]+', ex.get('glow', 'rgba(255,214,170,1)'))[:3]; r, g, bl = [float(v) / 255 for v in c]
                marks.append((m.group(1), W[0][3], W[1][3], W[2][3], watt.get(m.group(1), dflt) * scale, r, g, bl))
        if below and 'mesh' in nd and not hide.search(nm) and 'EXT_mesh_gpu_instancing' not in nd.get('extensions', {}):
            for pr in J['meshes'][nd['mesh']]['primitives']: verts.extend(positions(pr['attributes']['POSITION'], W))
        for c in nd.get('children', []): walk(c, W)
    for root in J['scenes'][J.get('scene', 0)]['nodes']: walk(root, I)
    out = []; moved = 0
    for kind, x, y, z, w, r, g, bl in marks:
        ly = y - drop
        if below and kind != 'candle':
            ys = [vy for vx, vy, vz in verts if (vx - x) ** 2 + (vz - z) ** 2 < 0.09 and y - 0.35 < vy < y + 0.3]
            if ys and min(ys) - 0.03 < ly: ly = max(min(ys) - 0.03, y - 0.4); moved += 1
        out.append('%.3f,%.3f,%.3f,%g,%.3f,%.3f,%.3f,%g' % (x, ly, z, w, r, g, bl, rad))
    print(';'.join(out))
    if '--verbose' in sys.argv: print('lights', len(out), 'moved below fixture', moved, file=sys.stderr)


if __name__ == '__main__':
    main()
