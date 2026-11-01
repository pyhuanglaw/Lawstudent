"""在光照貼圖上量幾個位置的亮度（白天、晚上），烘焙完自己檢查（LIB-HALL-LM-1028，LAWWW2-C 2026-10-28）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/lm_probe.py GLB 光照貼圖前綴 '探針 json'
探針：[名字, x, y, z, 法線（up、down、+x、-x、+z、-z）, 白天至少, 晚上至少]（遊戲座標；後兩個可以不寫）。
找法線方向對、平面距離 2 cm 內、點在三角形裡、有第二套 UV（TEXCOORD_1）的面，照第二套 UV 內插、雙線性取樣；
數值＝貼圖解碼回線性 × 2（bake_room.py 的 SCALE；遊戲再乘 extras.lightmap.intensity）。
有探針低於下限、或找不到面：印 FAIL、結束碼 1。為什麼：總圖大廳第一次校正烘焙，二樓木地板、一樓天花板、樓梯踏面整面全黑
（烘焙前沒有拿掉疊在一起的反面），光看 log 的平均亮度看不出來，拍了遊戲截圖才發現。"""
import sys, json, struct
import numpy as np
from PIL import Image


def glb_tris(path):
    b = open(path, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); bo = 20 + n + 8

    def acc(i):
        a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; nc = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
        dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}[a['componentType']]
        return np.frombuffer(b, dt, count=nc * a['count'], offset=bo + bv.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(a['count'], nc)
    out = []
    for nd in J['nodes']:   # 室內的 GLB 節點沒有位移、旋轉（bake_room.py 匯出時套用了）
        if 'mesh' not in nd: continue
        for pr in J['meshes'][nd['mesh']]['primitives']:
            if 'TEXCOORD_1' not in pr['attributes']: continue
            P = acc(pr['attributes']['POSITION']).astype(float); U = acc(pr['attributes']['TEXCOORD_1']).astype(float); I = acc(pr['indices']).reshape(-1, 3).astype(int)
            out += [(nd.get('name', ''), P[t], U[t]) for t in I]
    return out


def load(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4).max(axis=2) * 2.0


ND = {'up': (0, 1, 0), 'down': (0, -1, 0), '+x': (1, 0, 0), '-x': (-1, 0, 0), '+z': (0, 0, 1), '-z': (0, 0, -1)}


def main():
    G, PRE, PROBES = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
    day, night = load(PRE + '_day.webp'), load(PRE + '_night.webp'); H, W = day.shape

    def bil(img, u, v):
        x = u * W - 0.5; y = v * H - 0.5; x0 = int(np.floor(x)); y0 = int(np.floor(y)); fx = x - x0; fy = y - y0
        g = lambda a, c: img[min(H - 1, max(0, c)), min(W - 1, max(0, a))]
        return (g(x0, y0) * (1 - fx) + g(x0 + 1, y0) * fx) * (1 - fy) + (g(x0, y0 + 1) * (1 - fx) + g(x0 + 1, y0 + 1) * fx) * fy
    T = glb_tris(G); bad = 0
    for pb in PROBES:
        nm, x, y, z, nd = pb[:5]; dmin = pb[5] if len(pb) > 5 else None; nmin = pb[6] if len(pb) > 6 else None
        q = np.array([x, y, z], float); want = np.array(ND[nd], float); best = None
        for name, p, u in T:
            n = np.cross(p[1] - p[0], p[2] - p[0]); a = np.linalg.norm(n)
            if a < 1e-9: continue
            n /= a
            if n.dot(want) < 0.9: continue
            dist = (q - p[0]).dot(n)
            if abs(dist) > 0.02: continue
            qq = q - dist * n; v0, v1, v2 = p[1] - p[0], p[2] - p[0], qq - p[0]
            d00, d01, d11, d20, d21 = v0.dot(v0), v0.dot(v1), v1.dot(v1), v2.dot(v0), v2.dot(v1); den = d00 * d11 - d01 * d01
            if abs(den) < 1e-12: continue
            b1 = (d11 * d20 - d01 * d21) / den; b2 = (d00 * d21 - d01 * d20) / den; b0 = 1 - b1 - b2
            if min(b0, b1, b2) < -1e-4: continue
            if best is None or abs(dist) < best[0]: best = (abs(dist), name, b0 * u[0] + b1 * u[1] + b2 * u[2])
        if best is None: print(f'FAIL {nm}：找不到有第二套 UV 的面'); bad += 1; continue
        vd, vn = bil(day, *best[2]), bil(night, *best[2])
        ok = (dmin is None or vd >= dmin) and (nmin is None or vn >= nmin); bad += 0 if ok else 1
        print(f'{"PASS" if ok else "FAIL"} {nm}：白天 {vd:.3f}' + (f'（至少 {dmin}）' if dmin is not None else '') + f'、晚上 {vn:.3f}' + (f'（至少 {nmin}）' if nmin is not None else '') + f'　{best[1]}')
    print('ALL PASS' if not bad else f'FAILED {bad}'); sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
