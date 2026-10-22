"""路人底模的遠距離版本（PERF-CROWD-LOD-1021，LAWWW2 2026-10-21）。
一個路人底模（assets/models/char/second_ai/bl_npc_*.vrm）有 13～14 個網格（臉 8 個、身體、衣服 3 個、頭髮），
約 3 萬個三角形，五個材質還有描邊——30 m 外的人只有畫面上二三十個像素高，這些細節看不出來，卻佔了大部分的 draw call。
這裡做一個「遠距離版本」，和原本的 VRM 共用同一副骨架（節點、關節順序、反向綁定矩陣原封不動複製），遊戲裡綁到同一組骨頭上：
  - 身體網格＝臉的皮膚＋身體＋衣服合成一個，貼圖顏色烘成頂點色（不用貼圖；sRGB 轉線性），再減面（meshoptimizer）；
    身體的 MASK 透明部分（被衣服蓋住、挖空的地方）整片拿掉；眼睛、眉毛、睫毛、眼線、嘴巴裡面不要（30 m 外不到一個像素）。
  - 頭髮網格＝原本的髮片（MASK）減面，貼圖縮到 256 px。
輸出一般的 glTF（沒有 VRM 擴充）：節點 0..N-1＝原本的骨架、最後一個節點＝NPC_LOD（mesh＋skin）。
用法：PYTHONPATH=<裝了 meshoptimizer 的路徑> python3 tools/lod/npc_lod.py <輸入.vrm> <輸出.glb> [--ratio 0.12] [--hair 0.4]
（meshoptimizer：pip install meshoptimizer，MIT 授權，只在離線產生時用，遊戲不載入）"""
import sys, os, json, struct, io, argparse
import numpy as np
from PIL import Image
import ctypes
import meshoptimizer as mo
from meshoptimizer._loader import lib as _mlib

# PyPI 的 meshoptimizer 0.2.30a0 沒有宣告 meshopt_simplifyWithAttributes 的參數型別（target_error 的 float 傳不進去）：這裡補上
_F, _U = ctypes.POINTER(ctypes.c_float), ctypes.POINTER(ctypes.c_uint)
_mlib.meshopt_simplifyWithAttributes.argtypes = [_U, _U, ctypes.c_size_t, _F, ctypes.c_size_t, ctypes.c_size_t, _F, ctypes.c_size_t, _F, ctypes.c_size_t,
                                                 ctypes.POINTER(ctypes.c_ubyte), ctypes.c_size_t, ctypes.c_float, ctypes.c_uint, _F]
_mlib.meshopt_simplifyWithAttributes.restype = ctypes.c_size_t

CT ={5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
DROP = ('EyeWhite', 'FaceEyeline', 'FaceEyelash', 'FaceBrow', 'Iris', 'EyeExtra', 'EyeHighlight', 'FaceMouth')


def load_glb(p):
    b = open(p, 'rb').read(); off = 12; J = BIN = None
    while off < len(b):
        ln, ty = struct.unpack('<II', b[off:off + 8]); data = b[off + 8:off + 8 + ln]
        if ty == 0x4E4F534A: J = json.loads(data)
        elif ty == 0x004E4942: BIN = data
        off += 8 + ln
    return J, BIN


def accessor(J, BIN, i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]
    dt = CT[a['componentType']]; nc = NC[a['type']]; cnt = a['count']
    base = bv.get('byteOffset', 0) + a.get('byteOffset', 0); isz = np.dtype(dt).itemsize * nc; stride = bv.get('byteStride', 0) or isz
    raw = np.frombuffer(BIN, dtype=np.uint8, count=(cnt - 1) * stride + isz, offset=base)
    arr = np.lib.stride_tricks.as_strided(raw, shape=(cnt, isz), strides=(stride, 1)).copy().view(dt).reshape(cnt, nc)
    if a.get('normalized'):
        arr = arr.astype(np.float32) / float(np.iinfo(dt).max)
    return arr


def image(J, BIN, tex_index):
    src = J['textures'][tex_index]['source']; im = J['images'][src]; bv = J['bufferViews'][im['bufferView']]
    o = bv.get('byteOffset', 0); return Image.open(io.BytesIO(BIN[o:o + bv['byteLength']])).convert('RGBA')


def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def sample(img, uv, size):
    """貼圖縮到 size（平均，等於先模糊）再雙線性取樣；回傳 0..1 的 RGBA"""
    w, h = img.size; s = min(1.0, size / max(w, h)); im = img.resize((max(1, round(w * s)), max(1, round(h * s))), Image.BOX) if s < 1 else img
    A = np.asarray(im, dtype=np.float32) / 255.0; H, W = A.shape[:2]
    x = (uv[:, 0] % 1.0) * W - 0.5; y = (uv[:, 1] % 1.0) * H - 0.5
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
    x0 %= W; y0 %= H; x1 = (x0 + 1) % W; y1 = (y0 + 1) % H
    return (A[y0, x0] * (1 - fx) * (1 - fy) + A[y0, x1] * fx * (1 - fy) + A[y1, x0] * (1 - fx) * fy + A[y1, x1] * fx * fy)


def weld(P, N, C, Jt, W, I, Gid):
    """同一個材質裡、同一個位置、同一組關節權重的頂點合成一個（貼圖接縫拆開的頂點），法線、顏色取平均——減面才能跨過接縫。
    不同材質的頂點不合（衣服和皮膚的交界保留一條縫，兩邊各自的顏色）"""
    key = np.concatenate([Gid[:, None], np.round(P * 2e4).astype(np.int64), Jt.astype(np.int64), np.round(W * 1e3).astype(np.int64)], axis=1)
    _, inv, cnt = np.unique(key, axis=0, return_inverse=True, return_counts=True); inv = inv.reshape(-1); n = len(cnt)
    def avg(X):
        out = np.zeros((n, X.shape[1]), np.float64); np.add.at(out, inv, X); return out / cnt[:, None]
    P2 = avg(P).astype(np.float32); N2 = avg(N); N2 /= np.maximum(1e-8, np.linalg.norm(N2, axis=1, keepdims=True))
    first = np.full(n, -1, np.int64); first[inv[::-1]] = np.arange(len(inv))[::-1]
    return P2, N2.astype(np.float32), avg(C).astype(np.float32), Jt[first], W[first], inv[I].astype(np.uint32)


def simplify(P, attrs, weights, I, ratio, err):
    dst = np.zeros(len(I), np.uint32); tgt = max(3, int(len(I) * ratio) // 3 * 3)
    n = mo.simplify_with_attributes(dst, I, np.ascontiguousarray(P, np.float32), np.ascontiguousarray(attrs, np.float32), np.asarray(weights, np.float32),
                                    target_index_count=tgt, target_error=err)
    return dst[:n]


def compact(I, *arrs):
    used = np.unique(I); remap = np.full(len(arrs[0]), -1, np.int64); remap[used] = np.arange(len(used))
    return (remap[I].astype(np.uint32),) + tuple(a[used] for a in arrs)


def build(src, out, ratio=0.12, hair_ratio=0.4, hair_px=256, color_px=128):
    J, BIN = load_glb(src)
    skins = J['skins']; joints = skins[0]['joints']
    assert all(s['joints'] == joints and s.get('inverseBindMatrices') == skins[0].get('inverseBindMatrices') for s in skins), 'skins differ'
    mesh_nodes = [i for i, nd in enumerate(J['nodes']) if 'mesh' in nd]
    keep_n = min(mesh_nodes); assert max(joints) < keep_n and all(c < keep_n for nd in J['nodes'][:keep_n] for c in nd.get('children', [])), 'node layout'
    for i in mesh_nodes:
        nd = J['nodes'][i]; assert not any(k in nd for k in ('translation', 'rotation', 'scale', 'matrix')), 'mesh node transform'
    body = dict(P=[], N=[], C=[], J=[], W=[], I=[], G=[]); hair = []; stats = dict(src_tris=0, src_prims=0, dropped=[])
    for i in mesh_nodes:
        for pr in J['meshes'][J['nodes'][i]['mesh']]['primitives']:
            mat = J['materials'][pr['material']]; name = mat.get('name', ''); a = pr['attributes']
            I = accessor(J, BIN, pr['indices']).reshape(-1).astype(np.uint32); stats['src_tris'] += len(I) // 3; stats['src_prims'] += 1
            if any(k in name for k in DROP): stats['dropped'].append(name); continue
            P = accessor(J, BIN, a['POSITION']).astype(np.float32); N = accessor(J, BIN, a['NORMAL']).astype(np.float32)
            UV = accessor(J, BIN, a['TEXCOORD_0']).astype(np.float32); Jt = accessor(J, BIN, a['JOINTS_0']).astype(np.uint16); W = accessor(J, BIN, a['WEIGHTS_0']).astype(np.float32)
            I, P, N, UV, Jt, W = compact(I, P, N, UV, Jt, W)   # 同一個網格的幾個材質共用一組頂點（Blender 匯出）：只留這個材質用到的頂點，顏色才不會混在一起
            W = W / np.maximum(1e-8, W.sum(1, keepdims=True))
            pbr = mat.get('pbrMetallicRoughness', {}); fac = np.array(pbr.get('baseColorFactor', [1, 1, 1, 1]), np.float32)
            tex = pbr.get('baseColorTexture'); img = image(J, BIN, tex['index']) if tex else None
            if 'HAIR' in name or 'Hair' in name:
                hair.append(dict(P=P, N=N, UV=UV, J=Jt, W=W, I=I, img=img, fac=fac, cutoff=mat.get('alphaCutoff', 0.5), ds=mat.get('doubleSided', False))); continue
            col = sample(img, UV, color_px) if img is not None else np.ones((len(P), 4), np.float32)
            col = col * fac
            if mat.get('alphaMode') == 'MASK':
                al = sample(img, UV, 256)[:, 3] * fac[3] if img is not None else np.ones(len(P))
                tri = I.reshape(-1, 3); keep = al[tri].mean(1) >= mat.get('alphaCutoff', 0.5); I = tri[keep].reshape(-1)
            col[:, :3] = srgb_to_lin(np.clip(col[:, :3], 0, 1)); col[:, 3] = 1.0 if '_CLOTH' in name else 0.0   # 第 4 欄＝衣服（遊戲裡和 MToon 的衣服一樣乘 CLOTH_K）
            off = sum(len(x) for x in body['P'])
            body['P'].append(P); body['N'].append(N); body['C'].append(col); body['J'].append(Jt); body['W'].append(W); body['I'].append(I + off); body['G'].append(np.full(len(P), len(body['G']), np.int64))
    P, N, C, Jt, W, I, Gid = (np.concatenate(body[k]) for k in ('P', 'N', 'C', 'J', 'W', 'I', 'G'))
    P, N, C, Jt, W, I = weld(P, N, C, Jt, W, I, Gid)
    I2 = simplify(P, np.concatenate([C[:, :3], N * 0.5], 1), [1.0, 1.0, 1.0, 0.5, 0.5, 0.5], I, ratio, 0.05)
    bI, bP, bN, bC, bJ, bW = compact(I2, P, N, C, Jt, W)
    prims = [dict(kind='body', I=bI, P=bP, N=bN, C=bC, J=bJ, W=bW)]
    hair_img = None
    for h in hair:
        hI = simplify(h['P'], np.concatenate([h['UV'], h['N'] * 0.25], 1), [1.0, 1.0, 0.25, 0.25, 0.25], h['I'], hair_ratio, 0.02)
        hI, hP, hN, hUV, hJ, hW = compact(hI, h['P'], h['N'], h['UV'], h['J'], h['W'])
        im = h['img']; s = min(1.0, hair_px / max(im.size)); hair_img = im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS) if s < 1 else im
        prims.append(dict(kind='hair', I=hI, P=hP, N=hN, UV=hUV, J=hJ, W=hW, fac=h['fac'], cutoff=h['cutoff'], ds=h['ds']))
    ibm = accessor(J, BIN, skins[0]['inverseBindMatrices']).astype(np.float32)
    write(out, J, keep_n, joints, skins[0].get('skeleton'), ibm, prims, hair_img)
    stats.update(lod_tris=sum(len(p['I']) // 3 for p in prims), lod_prims=len(prims), body_tris=len(prims[0]['I']) // 3, hair_tris=sum(len(p['I']) // 3 for p in prims[1:]), bytes=os.path.getsize(out))
    return stats


def write(out, J, keep_n, joints, skel, ibm, prims, hair_img):
    bin_ = bytearray(); views = []; accs = []
    def add_view(data, target=None):
        while len(bin_) % 4: bin_.append(0)
        v = dict(buffer=0, byteOffset=len(bin_), byteLength=len(data))
        if target: v['target'] = target
        bin_.extend(data); views.append(v); return len(views) - 1
    def add_acc(arr, ctype, typ, target=None, normalized=False, minmax=False):
        arr = np.ascontiguousarray(arr); a = dict(bufferView=add_view(arr.tobytes(), target), componentType=ctype, count=int(arr.shape[0]), type=typ)
        if normalized: a['normalized'] = True
        if minmax: a['min'] = [float(x) for x in arr.min(0)]; a['max'] = [float(x) for x in arr.max(0)]
        accs.append(a); return len(accs) - 1
    nodes = [dict(nd) for nd in J['nodes'][:keep_n]]
    for nd in nodes: nd.pop('mesh', None); nd.pop('skin', None); nd.pop('extensions', None); nd.pop('extras', None)
    mats = []; gprims = []; images = []; textures = []; samplers = []
    for p in prims:
        att = dict(POSITION=add_acc(p['P'].astype(np.float32), 5126, 'VEC3', 34962, minmax=True), NORMAL=add_acc(p['N'].astype(np.float32), 5126, 'VEC3', 34962))
        jt = p['J']; att['JOINTS_0'] = add_acc(jt.astype(np.uint8) if jt.max() < 256 else jt.astype(np.uint16), 5121 if jt.max() < 256 else 5123, 'VEC4', 34962)
        w8 = np.round(p['W'] * 255).astype(np.int32); k = np.argmax(w8, 1); w8[np.arange(len(w8)), k] += 255 - w8.sum(1)   # 權重存 0..255（核心 glTF 允許），總和剛好 255
        att['WEIGHTS_0'] = add_acc(w8.astype(np.uint8), 5121, 'VEC4', 34962, normalized=True)
        if p['kind'] == 'body':
            att['COLOR_0'] = add_acc(np.round(np.clip(p['C'][:, :3], 0, 1) * 255).astype(np.uint8), 5121, 'VEC3', 34962, normalized=True)
            att['_CLOTH'] = add_acc((p['C'][:, 3] > 0.5).astype(np.uint8)[:, None], 5121, 'SCALAR', 34962)   # 遊戲裡變成 geometry 的 _cloth
            mats.append(dict(name='npc_lod_body', pbrMetallicRoughness=dict(baseColorFactor=[1, 1, 1, 1], metallicFactor=0.0, roughnessFactor=1.0)))
        else:
            att['TEXCOORD_0'] = add_acc(p['UV'].astype(np.float32), 5126, 'VEC2', 34962)
            buf = io.BytesIO(); hair_img.save(buf, 'PNG', optimize=True); images.append(dict(bufferView=add_view(buf.getvalue()), mimeType='image/png', name='npc_lod_hair'))
            if not samplers: samplers.append(dict(magFilter=9729, minFilter=9987, wrapS=10497, wrapT=10497))
            textures.append(dict(sampler=0, source=len(images) - 1))
            mats.append(dict(name='npc_lod_hair', alphaMode='MASK', alphaCutoff=float(p['cutoff']), doubleSided=bool(p['ds']),
                             pbrMetallicRoughness=dict(baseColorFactor=[float(x) for x in p['fac']], baseColorTexture=dict(index=len(textures) - 1), metallicFactor=0.0, roughnessFactor=1.0)))
        idx = p['I']; ind = add_acc(idx.astype(np.uint16) if len(p['P']) < 65536 else idx.astype(np.uint32), 5123 if len(p['P']) < 65536 else 5125, 'SCALAR', 34963)
        gprims.append(dict(attributes=att, indices=ind, material=len(mats) - 1))
    ib = add_acc(ibm.reshape(-1, 16), 5126, 'MAT4')
    nodes.append(dict(name='NPC_LOD', mesh=0, skin=0))
    root_nodes = [i for i in J['scenes'][J.get('scene', 0)]['nodes'] if i < keep_n] + [len(nodes) - 1]
    skin = dict(joints=joints, inverseBindMatrices=ib)
    if skel is not None: skin['skeleton'] = skel
    G = dict(asset=dict(version='2.0', generator='Lawstudent tools/lod/npc_lod.py'), scene=0, scenes=[dict(nodes=root_nodes)], nodes=nodes,
             meshes=[dict(name='NPC_LOD', primitives=gprims)], skins=[skin], materials=mats, accessors=accs, bufferViews=views, buffers=[dict(byteLength=0)])
    if images: G.update(images=images, textures=textures, samplers=samplers)
    while len(bin_) % 4: bin_.append(0)
    G['buffers'][0]['byteLength'] = len(bin_)
    js = json.dumps(G, separators=(',', ':')).encode()
    while len(js) % 4: js += b' '
    with open(out, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js); f.write(struct.pack('<II', len(bin_), 0x004E4942)); f.write(bin_)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('--ratio', type=float, default=0.12); ap.add_argument('--hair', type=float, default=0.4)
    a = ap.parse_args(); os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    print(json.dumps(build(a.src, a.out, a.ratio, a.hair), ensure_ascii=False))
