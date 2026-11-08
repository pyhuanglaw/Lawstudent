"""光照貼圖上「某個網格、某個範圍、某個朝向的面」那幾格乘一個倍數（11-08 LAWWW2-B；BB-B XS9 PC GPU：山嵐左前那根柱子朝街那一面白天整面亮黃）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/lm_scale_faces.py <glb> <光照 webp> --node <網格名字正規式> --box x0,x1,y0,y1,z0,z1 --normal z+
      (--factor F | --target T) [--out 輸出 webp，預設覆蓋] [--dry]
為什麼：bake_room.py 的 --dayscale 是整個物件一起乘。山嵐的柱子和室內的牆合併在同一個網格（shl_wall），只想壓柱子朝街那一面。
做法：
  1. 網格名字合 --node、三角形中心在 --box 裡（GLB／遊戲座標）、法線朝 --normal（和那個軸夾角 < 30°）的三角形＝要改的面。
  2. 在光照貼圖上畫出這些三角形蓋到的格子（格子中心在三角形內），再往外長 4 格的留邊——只長進「沒有任何網格」的空白格（烘焙的 margin），不碰別的面。
  3. 這些格子先從 WebP 編碼值換回線性（sRGB），乘 F，再換回去。--target T：自動算 F，讓這幾面的平均編碼值變成 T。
  4. 存成 WebP（品質 90、method 6，和 to_webp.py 一樣）。只改光照貼圖，不動 GLB。
"""
import json, struct, sys, re
import numpy as np
from PIL import Image


def opt(name, d=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else d


def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); b0 = 20 + n + 8
    def acc(i):
        a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; off = b0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
        st = bv.get('byteStride', k * np.dtype(dt).itemsize)
        raw = np.frombuffer(b, dtype=np.uint8, count=st * (a['count'] - 1) + k * np.dtype(dt).itemsize, offset=off)
        return np.lib.stride_tricks.as_strided(raw, shape=(a['count'], k * np.dtype(dt).itemsize), strides=(st, 1)).copy().view(dt).reshape(a['count'], k)
    return J, acc


def mat(nd):
    if 'matrix' in nd: return np.array(nd['matrix'], dtype=float).reshape(4, 4).T
    M = np.eye(4); t = nd.get('translation', [0, 0, 0]); x, y, z, w = nd.get('rotation', [0, 0, 0, 1]); s = nd.get('scale', [1, 1, 1])
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    M[:3, :3] = R * np.array(s); M[:3, 3] = t; return M


def raster(tris_uv, H, W):
    """UV 三角形（像素座標）蓋到的格子（格子中心在三角形內）"""
    m = np.zeros((H, W), bool)
    for P in tris_uv:
        x0, y0 = np.floor(P.min(0)).astype(int); x1, y1 = np.ceil(P.max(0)).astype(int)
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W), min(y1, H)
        if x1 <= x0 or y1 <= y0: continue
        X, Y = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
        (ax, ay), (bx, by), (cx, cy) = P; d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(d) < 1e-12: continue
        w0 = ((by - cy) * (X - cx) + (cx - bx) * (Y - cy)) / d; w1 = ((cy - ay) * (X - cx) + (ax - cx) * (Y - cy)) / d
        m[y0:y1, x0:x1] |= (w0 >= -1e-4) & (w1 >= -1e-4) & (1 - w0 - w1 >= -1e-4)
    return m


def s2l(v): return np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)
def l2s(v): return np.where(v <= 0.0031308, v * 12.92, 1.055 * np.power(np.maximum(v, 0), 1 / 2.4) - 0.055)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--') and a not in {opt(k) for k in ('--node', '--box', '--normal', '--factor', '--target', '--out')}]
    glb, webp = args[:2]
    node = re.compile(opt('--node')); box = [float(t) for t in opt('--box').split(',')]; nrm = opt('--normal')
    ax = 'xyz'.index(nrm[0]); sg = 1 if nrm[1] == '+' else -1
    J, acc = load(glb)
    W_ = {}
    def walk(i, P):
        nd = J['nodes'][i]; M = P @ mat(nd); W_[i] = M
        for c in nd.get('children', []): walk(c, M)
    for r in J['scenes'][J.get('scene', 0)]['nodes']: walk(r, np.eye(4))
    im = Image.open(webp).convert('RGB'); px = np.asarray(im, dtype=np.float64) / 255; H, W = px.shape[:2]
    sel, allt = [], []; area = 0.0; names = set()
    for i, nd in enumerate(J['nodes']):
        if 'mesh' not in nd or i not in W_: continue
        for pr in J['meshes'][nd['mesh']]['primitives']:
            if 'TEXCOORD_1' not in pr['attributes'] or 'indices' not in pr: continue
            P = acc(pr['attributes']['POSITION']).astype(float); P = (np.c_[P, np.ones(len(P))] @ W_[i].T)[:, :3]
            U = acc(pr['attributes']['TEXCOORD_1']).astype(float) * [W, H]; I = acc(pr['indices']).reshape(-1, 3)
            allt.extend(U[I])
            if not node.search(nd['name']): continue
            T = P[I]; c = T.mean(1); N = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); A = np.linalg.norm(N, axis=1) / 2; Nn = N / np.maximum(2 * A[:, None], 1e-12)
            ok = (c[:, 0] >= box[0]) & (c[:, 0] <= box[1]) & (c[:, 1] >= box[2]) & (c[:, 1] <= box[3]) & (c[:, 2] >= box[4]) & (c[:, 2] <= box[5]) & (Nn[:, ax] * sg > 0.866)
            if ok.any(): sel.extend(U[I][ok]); area += float(A[ok].sum()); names.add(nd['name'])
    if not sel: print('沒有符合的面'); sys.exit(1)
    core = raster(sel, H, W); used = raster(allt, H, W); m = core.copy()
    for _ in range(4):   # 留邊：只長進沒有任何網格的空白格
        g = m.copy(); g[1:, :] |= m[:-1, :]; g[:-1, :] |= m[1:, :]; g[:, 1:] |= m[:, :-1]; g[:, :-1] |= m[:, 1:]
        m = m | (g & ~used)
    before = float(px[core].mean())
    if opt('--factor'): F = float(opt('--factor'))
    else:
        T_ = float(opt('--target')); lin = s2l(px[core]); lo, hi = 0.0, 4.0
        for _ in range(40):
            F = (lo + hi) / 2
            if float(l2s(np.clip(lin * F, 0, 1)).mean()) > T_: hi = F
            else: lo = F
    out = px.copy(); out[m] = np.clip(l2s(np.clip(s2l(px[m]) * F, 0, 1)), 0, 1)
    after = float(out[core].mean())
    print('%s：%s 的面 %.2f m²（%s）、%d 格（＋留邊 %d 格）；乘 %.3f（線性）；平均 %.3f → %.3f' % (webp, '、'.join(sorted(names)), area, nrm, int(core.sum()), int((m & ~core).sum()), F, before, after))
    if '--dry' in sys.argv: return
    Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB').save(opt('--out', webp), 'WEBP', quality=90, method=6)


if __name__ == '__main__':
    main()
