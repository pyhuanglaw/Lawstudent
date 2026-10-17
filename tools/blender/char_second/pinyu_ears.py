"""曾品妤（econ_pinyu）第七版的耳朵（BB-C 25db9a59，BB_201 §15）：look_face_q45 的耳朵太大、顏色和臉不一樣（頭髮綁成丸子頭，耳朵整個露出來特別明顯）。
在臉之後、衣服和頭髮之前做（pinyu.py --from-blend face.blend --stages ears,clothes,hair）：
  1. 大小：Darkness Shibu 的耳朵在 Face 網格裡是獨立的小島（每邊正面 82 面、背面 56 面、一片小三角，|x| 0.06–0.10 m）。
     露在頭外面的耳廓縮成 EAR_K 倍（中心＝耳根的中段：最靠頭那一圈頂點的 x、y，耳朵上下的中間）：耳朵外緣離頭近一點、上下短一點。
     耳根（埋在頭裡、到頭皮那一圈）不動：頭的網格在耳朵接的地方有開口，第一次整個耳朵一起縮，上耳根露出一道暗紅色的縫。
     從 |x| ROOT_X0 到 ROOT_X1 漸漸加到全部縮放。所有 shape key 一起變（C.warp_world）。
  2. 顏色：貼圖上的耳朵本來是偏粉紅的一塊（中間 0.96/0.82/0.80，臉頰 0.97/0.91/0.90），遊戲裡比臉紅、亮的地方又比臉白。
     耳朵的島（UV 三角形畫成遮罩、往外擴幾個 px 給 mipmap）改成「耳朵旁邊那一圈臉皮」的顏色（同一張貼圖、頭的兩側），
     原本的明暗只留一點：凹進去的地方最多暗 SHADE_MIN，凸起來的地方不超過旁邊的臉。"""
import bmesh, bpy, numpy as np
import common as C
import h01_face as F
from PIL import Image, ImageDraw, ImageFilter

EAR_K = 0.82          # BB-C：縮小 15～20%
ROOT_X0, ROOT_X1 = 0.071, 0.084   # 頭皮在耳朵那裡約 |x| 0.068–0.079（臉和身體網格接縫的位置）
SHADE_MIN = 0.86      # 耳廓凹處最多暗多少（1＝平的一塊；原本貼圖的凹處約 0.88）
SHADE_GAMMA = 0.9


def _islands(bm, faces):
    fset = set(faces); seen = set(); out = []
    for f in faces:
        if f in seen: continue
        st = [f]; comp = []; seen.add(f)
        while st:
            g = st.pop(); comp.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h in fset and h not in seen: seen.add(h); st.append(h)
        out.append(comp)
    return out


def apply(m):
    face = m['face']; me = face.data
    mi = next(i for i, mt in enumerate(me.materials) if mt and 'Face_00_SKIN' in mt.name); mat = me.materials[mi]
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    Mw = np.array(face.matrix_world); W = np.array([v.co for v in bm.verts]) @ Mw[:3, :3].T + Mw[:3, 3]
    skin = [f for f in bm.faces if f.material_index == mi]
    ears = {1.0: [], -1.0: []}
    for comp in _islands(bm, skin):
        vi = sorted({v.index for f in comp for v in f.verts}); ax = np.abs(W[vi, 0])
        if len(comp) < 300 and ax.min() > 0.057:                     # 耳朵（正面、背面、小三角）；眼角、嘴角的單片三角在 |x|<0.057
            ears[float(np.sign(W[vi, 0].mean()))].append(comp)
    idx = {}; piv = {}
    for s, comps in ears.items():
        vi = np.array(sorted({v.index for c in comps for f in c for v in f.verts})); ax = np.abs(W[vi, 0])
        root = vi[ax < ax.min() + 0.006]; idx[s] = vi; piv[s] = np.array([W[root, 0].mean(), W[root, 1].mean(), 0.5 * (W[vi, 2].min() + W[vi, 2].max())])
        P = W[vi]; print('  ear %+d: %d islands, %d verts, size x %.3f y %.3f z %.3f, pivot %s' % (s, len(comps), len(vi), np.ptp(P[:, 0]), np.ptp(P[:, 1]), np.ptp(P[:, 2]), np.round(piv[s], 4)))

    def fn(P):
        Q = P.copy()
        for s in idx:
            Pi = P[idx[s]]; t = np.clip((np.abs(Pi[:, 0]) - ROOT_X0) / (ROOT_X1 - ROOT_X0), 0, 1); w = (t * t * (3 - 2 * t))[:, None]
            Q[idx[s]] = Pi + (piv[s] + (Pi - piv[s]) * EAR_K - Pi) * w
        return Q
    for s in idx:
        P0 = W[idx[s]]; P1 = fn(W)[idx[s]]; out_ = np.abs(P0[:, 0]) > ROOT_X1
        print('  ear %+d outer part: height %.4f → %.4f, depth %.4f → %.4f, max |x| %.4f → %.4f' % (s, np.ptp(P0[:, 2]), np.ptp(P1[:, 2]), np.ptp(P0[:, 1]), np.ptp(P1[:, 1]), np.abs(P0[:, 0]).max(), np.abs(P1[:, 0]).max()))
    C.warp_world(face, fn)

    # ---- 顏色 ----
    e = mat.vrm_addon_extension.mtoon1; src = e.pbr_metallic_roughness.base_color_texture.index.source
    a = F.img_array(src); H, Wd = a.shape[:2]; uvl = bm.loops.layers.uv.active

    def mask_of(faces, grow=0):
        im = Image.new('L', (Wd, H), 0); d = ImageDraw.Draw(im)
        for f in faces: d.polygon([(l[uvl].uv[0] * Wd, (1 - l[uvl].uv[1]) * H) for l in f.loops], fill=255)
        if grow: im = im.filter(ImageFilter.MaxFilter(2 * grow + 1))
        return np.asarray(im) > 127
    ear_f = [f for comps in ears.values() for c in comps for f in c]
    side_f = [f for f in skin if f not in set(ear_f) and all(0.055 < abs(W[v.index, 0]) and W[v.index, 1] > -0.04 and 1.43 < W[v.index, 2] < 1.53 for v in f.verts)]
    em = mask_of(ear_f, grow=4); sm = mask_of(side_f) & ~em
    rgb = a[..., :3]; ref = np.median(rgb[sm], axis=0); cheek = np.median(rgb[mask_of([f for f in skin if all(0.025 < abs(W[v.index, 0]) < 0.05 and W[v.index, 1] < -0.06 and 1.43 < W[v.index, 2] < 1.46 for v in f.verts)])], axis=0)
    lum = rgb @ np.array([0.30, 0.59, 0.11]); hi = np.percentile(lum[em], 75)
    k = np.clip(lum / hi, SHADE_MIN, 1.0) ** SHADE_GAMMA
    k = F.blur(k, 1)                                                   # 貼圖的鋸齒不要放大
    out = a.copy(); out[em, :3] = ref[None, :] * k[em, None]
    print('  ear colour: was median %s → side-of-head %s (cheek %s), %d px' % (np.round(np.median(rgb[em], 0), 3), np.round(ref, 3), np.round(cheek, 3), int(em.sum())))
    im = C.image_from_array('X07_Face_ears', out.astype(np.float32)); F.set_tex(mat, im)
    bm.free()
