#!/usr/bin/env python3
"""VRoid（VRM 0.x）人物改造工具：把 CC0 的 VRoid 樣本模型改成本作的角色。

做的事（全部是對既有模型的修改，不自己捏人）：
  1. 移植服裝：把另一個 VRoid 模型的衣物 primitive（例如男性模型的長褲）搬到目標模型身上，
     依兩邊骨架的 bind pose 重新綁定（每個頂點用 skin weight 從來源骨架 rest pose 換到目標骨架 rest pose）。
  2. 隱藏被衣物蓋住的皮膚三角形（避免穿模），或刪掉不要的 primitive（例如領結、裙子）。
  3. 剪短上衣（例如長版上衣在腰線以下的三角形刪掉，變成紮進褲子）。
  4. 貼圖換色（保留明暗，只換色相／色票）、縮小貼圖、移除 normal map 與縮圖（手機用）。

用法：python3 tools/vroid_build.py [角色 id ...]   （不給就全部重建）
來源模型：tools/vroid_src/*.vrm（CC0，見 LICENSES.md；不在 repo 裡就從 github.com/madjin/vrm-samples 的 vroid/beta 取得）
輸出：assets/models/char/<id>.vrm
"""
import json, struct, sys, io, os, math
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'vroid_src')
OUT = os.path.join(ROOT, 'assets', 'models', 'char')

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


class VRM:
    def __init__(self, path):
        b = open(path, 'rb').read()
        assert b[:4] == b'glTF'
        L = struct.unpack('<I', b[12:16])[0]
        self.j = json.loads(b[20:20 + L])
        off = 20 + L
        BL = struct.unpack('<I', b[off:off + 4])[0]
        self.bin = b[off + 8:off + 8 + BL]
        # 每個 bufferView 的資料（之後可以替換）
        self.views = []
        for bv in self.j['bufferViews']:
            o = bv.get('byteOffset', 0)
            self.views.append(bytes(self.bin[o:o + bv['byteLength']]))
        self.path = path

    # ---- 讀寫 accessor ----
    def acc(self, i):
        a = self.j['accessors'][i]
        bv = self.j['bufferViews'][a['bufferView']]
        data = self.views[a['bufferView']]
        dt = np.dtype(CT[a['componentType']])
        n = NC[a['type']]
        stride = bv.get('byteStride', 0)
        off = a.get('byteOffset', 0)
        if stride and stride != dt.itemsize * n:
            raw = np.frombuffer(data, dtype=np.uint8)
            out = np.zeros((a['count'], n), dtype=dt)
            for k in range(a['count']):
                out[k] = np.frombuffer(raw[off + k * stride: off + k * stride + dt.itemsize * n].tobytes(), dtype=dt)
            return out
        arr = np.frombuffer(data, dtype=dt, count=a['count'] * n, offset=off).copy()
        assert 'sparse' not in a, 'sparse accessor not supported'
        return arr.reshape(a['count'], n) if n > 1 else arr

    def add_acc(self, arr, ctype, typ, target=None, minmax=False):
        arr = np.ascontiguousarray(arr.astype(CT[ctype]))
        self.views.append(arr.tobytes())
        bv = {'buffer': 0, 'byteLength': len(self.views[-1])}
        if target:
            bv['target'] = target
        self.j['bufferViews'].append(bv)
        a = {'bufferView': len(self.j['bufferViews']) - 1, 'componentType': ctype, 'count': int(arr.shape[0]), 'type': typ}
        if minmax:
            a['min'] = [float(x) for x in arr.min(axis=0)]
            a['max'] = [float(x) for x in arr.max(axis=0)]
        self.j['accessors'].append(a)
        return len(self.j['accessors']) - 1

    # ---- 貼圖 ----
    def image_of_tex(self, ti):
        return self.j['textures'][ti]['source']

    def get_image(self, ii):
        return Image.open(io.BytesIO(self.views[self.j['images'][ii]['bufferView']])).convert('RGBA')

    def set_image(self, ii, img, fmt='PNG'):
        bio = io.BytesIO()
        if fmt == 'JPEG':
            img.convert('RGB').save(bio, 'JPEG', quality=88)
            self.j['images'][ii]['mimeType'] = 'image/jpeg'
        else:
            img.save(bio, 'PNG', optimize=True)
            self.j['images'][ii]['mimeType'] = 'image/png'
        self.views[self.j['images'][ii]['bufferView']] = bio.getvalue()

    def add_image(self, img, name):
        bio = io.BytesIO(); img.save(bio, 'PNG', optimize=True)
        self.views.append(bio.getvalue())
        self.j['bufferViews'].append({'buffer': 0, 'byteLength': len(self.views[-1])})
        self.j['images'].append({'name': name, 'bufferView': len(self.j['bufferViews']) - 1, 'mimeType': 'image/png'})
        self.j['textures'].append({'sampler': 0, 'source': len(self.j['images']) - 1})
        return len(self.j['textures']) - 1

    # ---- 結構查詢 ----
    def vrm_mat(self, mi):
        return self.j['extensions']['VRM']['materialProperties'][mi]

    def mat_index(self, pattern):
        for i, m in enumerate(self.j['materials']):
            if pattern in m['name']:
                return i
        return None

    def mesh_node(self, mesh_name_prefix):
        for ni, n in enumerate(self.j['nodes']):
            if 'mesh' in n and self.j['meshes'][n['mesh']]['name'].startswith(mesh_name_prefix):
                return ni, n
        raise KeyError(mesh_name_prefix)

    def skin_mats(self, skin_i):
        sk = self.j['skins'][skin_i]
        ibm = self.acc(sk['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)  # column-major → row-major
        names = [self.j['nodes'][ji]['name'] for ji in sk['joints']]
        return names, ibm

    # ---- 存檔（重新打包 BIN，丟掉沒用到的 bufferView）----
    def save(self, path):
        j = self.j
        used_acc = set()
        for m in j['meshes']:
            for p in m['primitives']:
                used_acc.update(p['attributes'].values())
                if 'indices' in p:
                    used_acc.add(p['indices'])
                for t in p.get('targets', []):
                    used_acc.update(t.values())
        for s in j.get('skins', []):
            if 'inverseBindMatrices' in s:
                used_acc.add(s['inverseBindMatrices'])
        used_bv = set(j['accessors'][a]['bufferView'] for a in used_acc if 'bufferView' in j['accessors'][a])
        used_bv.update(im['bufferView'] for im in j['images'])
        # 重新排列 bufferViews
        remap = {}
        newviews, newbvs, chunks, off = [], [], [], 0
        for i, bv in enumerate(j['bufferViews']):
            if i not in used_bv:
                continue
            data = self.views[i]
            pad = (-off) % 4
            if pad:
                chunks.append(b'\0' * pad); off += pad
            nb = dict(bv); nb['byteOffset'] = off; nb['byteLength'] = len(data); nb['buffer'] = 0
            remap[i] = len(newbvs); newbvs.append(nb); chunks.append(data); off += len(data)
        for a in j['accessors']:
            if 'bufferView' in a:
                a['bufferView'] = remap.get(a['bufferView'], 0)
        for im in j['images']:
            im['bufferView'] = remap[im['bufferView']]
        j['bufferViews'] = newbvs
        binb = b''.join(chunks)
        binb += b'\0' * ((-len(binb)) % 4)
        j['buffers'] = [{'byteLength': len(binb)}]
        js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
        js += b' ' * ((-len(js)) % 4)
        total = 12 + 8 + len(js) + 8 + len(binb)
        with open(path, 'wb') as f:
            f.write(b'glTF' + struct.pack('<II', 2, total))
            f.write(struct.pack('<I', len(js)) + b'JSON' + js)
            f.write(struct.pack('<I', len(binb)) + b'BIN\0' + binb)
        return total


# ---------------- 操作 ----------------
def body_primitives(v, mat_pat):
    """Body mesh 裡材質名稱含 mat_pat 的 primitive。"""
    ni, node = v.mesh_node('Body')
    mesh = v.j['meshes'][node['mesh']]
    return node, mesh, [p for p in mesh['primitives'] if mat_pat in v.j['materials'][p['material']]['name']]


def remove_prims(v, mat_pats):
    for m in v.j['meshes']:
        m['primitives'] = [p for p in m['primitives'] if not any(s in v.j['materials'][p['material']]['name'] for s in mat_pats)]


def transplant(dst, src, mat_pat, new_name=None):
    """把 src 的 Body mesh 中材質含 mat_pat 的 primitive 移植到 dst 的 Body mesh，依骨架 bind pose 重新綁定。"""
    snode, smesh, sprims = body_primitives(src, mat_pat)
    dnode, dmesh, _ = body_primitives(dst, 'SKIN')
    snames, sibm = src.skin_mats(snode['skin'])
    dnames, dibm = dst.skin_mats(dnode['skin'])
    dindex = {n: i for i, n in enumerate(dnames)}
    dbind = np.linalg.inv(dibm)  # 目標骨頭 rest 世界矩陣
    # 每根來源骨頭 → 目標的轉換 M = Bt · IBMs
    M = np.zeros((len(snames), 4, 4))
    jmap = np.zeros(len(snames), dtype=np.int64)
    for i, n in enumerate(snames):
        if n in dindex:
            M[i] = dbind[dindex[n]] @ sibm[i]
            jmap[i] = dindex[n]
        else:
            M[i] = np.eye(4)
            jmap[i] = 0
    # 材質（含貼圖）複製過來
    smi = sprims[0]['material']
    smat = json.loads(json.dumps(src.j['materials'][smi]))
    svm = json.loads(json.dumps(src.vrm_mat(smi)))
    texmap = {}
    def copy_tex(ti):
        if ti in texmap:
            return texmap[ti]
        ii = src.image_of_tex(ti)
        img = src.get_image(ii)
        nt = dst.add_image(img, src.j['images'][ii].get('name', 'img') + '_x')
        texmap[ti] = nt
        return nt
    for k, ti in list(svm['textureProperties'].items()):
        name = src.j['images'][src.image_of_tex(ti)].get('name', '')
        if k in ('_BumpMap', '_SphereAdd', '_EmissionMap') or name.startswith('Shader_None'):
            # normal map／空白貼圖：用目標模型自己的對應貼圖
            dvm = dst.vrm_mat(dprims_mat(dst))
            if k in dvm['textureProperties']:
                svm['textureProperties'][k] = dvm['textureProperties'][k]
            else:
                del svm['textureProperties'][k]
        else:
            svm['textureProperties'][k] = copy_tex(ti)
    pbr = smat.get('pbrMetallicRoughness', {})
    if 'baseColorTexture' in pbr:
        pbr['baseColorTexture']['index'] = svm['textureProperties'].get('_MainTex', pbr['baseColorTexture']['index'])
    smat.pop('normalTexture', None); smat.pop('emissiveTexture', None)
    nm = new_name or (smat['name'] + '_x')
    smat['name'] = nm; svm['name'] = nm
    dst.j['materials'].append(smat)
    dst.j['extensions']['VRM']['materialProperties'].append(svm)
    new_mi = len(dst.j['materials']) - 1
    added = []
    for p in sprims:
        A = p['attributes']
        # VRoid 同一個 mesh 的 primitive 共用整個頂點緩衝：只取這件衣服用到的頂點
        idx_full = src.acc(p['indices']).astype(np.int64)
        used, inv = np.unique(idx_full, return_inverse=True)
        pos = src.acc(A['POSITION']).astype(np.float64)[used]
        nor = src.acc(A['NORMAL']).astype(np.float64)[used] if 'NORMAL' in A else None
        uv = src.acc(A['TEXCOORD_0'])[used]
        J = src.acc(A['JOINTS_0']).astype(np.int64)[used]
        W = src.acc(A['WEIGHTS_0']).astype(np.float64)[used]
        if W.dtype != np.float64 or W.max() > 1.5:
            W = W / max(1.0, W.max())
        W = W / np.maximum(1e-8, W.sum(axis=1, keepdims=True))
        ph = np.concatenate([pos, np.ones((len(pos), 1))], axis=1)
        Mv = np.einsum('vk,vkij->vij', W, M[J])  # 每個頂點的混合矩陣
        npos = np.einsum('vij,vj->vi', Mv, ph)[:, :3]
        out = {'POSITION': dst.add_acc(npos.astype(np.float32), 5126, 'VEC3', 34962, True)}
        nn = None
        if nor is not None:
            nn = np.einsum('vij,vj->vi', Mv[:, :3, :3], nor)
            nn /= np.maximum(1e-8, np.linalg.norm(nn, axis=1, keepdims=True))
            out['NORMAL'] = dst.add_acc(nn.astype(np.float32), 5126, 'VEC3', 34962)
        out['TEXCOORD_0'] = dst.add_acc(uv.astype(np.float32), 5126, 'VEC2', 34962)
        out['JOINTS_0'] = dst.add_acc(jmap[J].astype(np.uint16), 5123, 'VEC4', 34962)
        out['WEIGHTS_0'] = dst.add_acc(W.astype(np.float32), 5126, 'VEC4', 34962)
        idx = inv.astype(np.uint32)
        prim = {'attributes': out, 'indices': dst.add_acc(idx, 5125, 'SCALAR', 34963), 'material': new_mi, 'mode': p.get('mode', 4)}
        dmesh['primitives'].append(prim)
        added.append((prim, npos, nn))
    return new_mi, added


def dprims_mat(v):
    for i, m in enumerate(v.j['materials']):
        if 'Body' in m['name'] and 'SKIN' in m['name']:
            return i
    return 0


def prim_arrays(v, p):
    A = p['attributes']
    return v.acc(A['POSITION']).astype(np.float64), v.acc(A['JOINTS_0']).astype(np.int64), v.acc(A['WEIGHTS_0']).astype(np.float64), v.acc(p['indices']).astype(np.int64)


def cull_tris(v, prim, keep_fn):
    """刪掉 keep_fn 回傳 False 的三角形（keep_fn(pos[tri], dominant_joint_name[tri]) → bool array）。"""
    node, mesh, _ = body_primitives(v, 'SKIN')
    names, _ = v.skin_mats(node['skin'])
    pos, J, W, idx = prim_arrays(v, prim)
    dom = np.array(names, dtype=object)[J[np.arange(len(J)), W.argmax(axis=1)]]
    tris = idx.reshape(-1, 3)
    keep = keep_fn(pos[tris], dom[tris])
    newidx = tris[keep].reshape(-1)
    prim['indices'] = v.add_acc(newidx.astype(np.uint32), 5125, 'SCALAR', 34963)
    return int((~keep).sum()), int(len(tris))


LEG = ('UpperLeg', 'LowerLeg')


def hide_skin_under_pants(v, pants_pos, margin_top=0.03, margin_bottom=0.02):
    """刪掉被長褲蓋住的腿部／臀部皮膚三角形。"""
    y_top = pants_pos[:, 1].max() - margin_top
    y_bot = pants_pos[:, 1].min() + margin_bottom
    node, mesh, skins = body_primitives(v, 'SKIN')
    tot = 0
    for p in skins:
        def keep(tp, td):
            covered = np.ones(len(tp), dtype=bool)
            for k in range(3):
                y = tp[:, k, 1]
                d = td[:, k]
                isleg = np.array([any(s in x for s in LEG) or x.endswith('Hips') for x in d])
                covered &= isleg & (y < y_top) & (y > y_bot)
            return ~covered
        n, _ = cull_tris(v, p, keep)
        tot += n
    return tot


def hide_covered(v, added, max_d=0.06, eps=0.004, max_tan=0.03):
    """刪掉被移植衣物蓋住的皮膚三角形：皮膚頂點離最近的衣物頂點 < max_d，且在衣物表面的內側（沿衣物法向量的反方向）。"""
    G = np.concatenate([a[1] for a in added]); N = np.concatenate([a[2] for a in added])
    node, mesh, skins = body_primitives(v, 'SKIN')
    tot = 0
    for p in skins:
        pos, J, Wt, idx = prim_arrays(v, p)
        cov = np.zeros(len(pos), dtype=bool)
        for s0 in range(0, len(pos), 512):
            P = pos[s0:s0 + 512]
            d2 = ((P[:, None, :] - G[None, :, :]) ** 2).sum(axis=2)
            k = d2.argmin(axis=1)
            dist = np.sqrt(d2[np.arange(len(P)), k])
            dn = ((P - G[k]) * N[k]).sum(axis=1)
            tan = np.sqrt(np.maximum(0, dist ** 2 - dn ** 2))
            cov[s0:s0 + 512] = (dist < max_d) & (dn < eps) & (tan < max_tan)
        tris = idx.reshape(-1, 3)
        keep = ~cov[tris].all(axis=1)
        tot += int((~keep).sum())
        p['indices'] = v.add_acc(tris[keep].reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
    return tot


def garment_of(v, mat_pat):
    """模型自己的衣物 primitive → [(prim, pos, normal)]（只取用到的頂點），給 hide_covered 用。"""
    node, mesh, prims = body_primitives(v, mat_pat)
    out = []
    for p in prims:
        idx = v.acc(p['indices']).astype(np.int64); used = np.unique(idx)
        pos = v.acc(p['attributes']['POSITION']).astype(np.float64)[used]
        nor = v.acc(p['attributes']['NORMAL']).astype(np.float64)[used]
        out.append((p, pos, nor))
    return out


def hide_skin_under_top(v, top_pos, margin=0.02):
    """刪掉被上衣蓋住的軀幹／手臂皮膚（給移植上衣用）。依上衣頂點的骨頭與高度範圍判斷。"""
    node, mesh, skins = body_primitives(v, 'SKIN')
    y_top = top_pos[:, 1].max() - 0.06
    y_bot = top_pos[:, 1].min() + margin
    for p in skins:
        def keep(tp, td):
            covered = np.ones(len(tp), dtype=bool)
            for k in range(3):
                y = tp[:, k, 1]; d = td[:, k]
                istorso = np.array([any(s in x for s in ('Spine', 'Chest', 'UpperArm', 'Shoulder', 'Hips', 'Bust')) for x in d])
                covered &= istorso & (y < y_top) & (y > y_bot)
            return ~covered
        cull_tris(v, p, keep)


def paint_skin(v, color, joints=('Spine', 'Chest', 'Bust'), y_max=None, front_only=False):
    """在身體皮膚貼圖上，把指定骨頭（軀幹）範圍的三角形塗成 color：用在領口開太低的上衣，當作內搭。"""
    from PIL import ImageDraw
    node, mesh, skins = body_primitives(v, 'SKIN')
    names, _ = v.skin_mats(node['skin'])
    tp = v.vrm_mat(skins[0]['material'])['textureProperties']
    ii = v.image_of_tex(tp['_MainTex'])
    img = v.get_image(ii)
    W, H = img.size
    d = ImageDraw.Draw(img)
    col = tuple(int(c * 255) for c in hexrgb(color)) + (255,)
    n = 0
    for p in skins:
        pos, J, Wt, idx = prim_arrays(v, p)
        uv = v.acc(p['attributes']['TEXCOORD_0'])
        dom = np.array(names, dtype=object)[J[np.arange(len(J)), Wt.argmax(axis=1)]]
        ok = np.array([any(s in x for s in joints) for x in dom])
        if y_max is not None:
            ok &= pos[:, 1] < y_max
        if front_only:
            ok &= pos[:, 2] > 0  # VRM0：正面朝 -z？依模型而定，下面用法向判斷較保險
        for t in idx.reshape(-1, 3):
            if ok[t].all():
                d.polygon([(uv[k][0] * W, uv[k][1] * H) for k in t], fill=col)
                n += 1
    v.set_image(ii, img)
    return n


def bake_face(v, weights, blink_scale=None):
    """把臉部 blendshape 的一部分永久加到基本形狀（例如眼睛稍微瞇一點，看起來更成熟、不像大眼娃娃）。
    weights: {morph 名稱片段: 權重}。blink_scale：同時把眨眼表情的權重縮小，避免眨眼時眼皮超過。"""
    if not weights:
        return
    m = [x for x in v.j['meshes'] if x['name'].startswith('Face')][0]
    names = m.get('extras', {}).get('targetNames') or m['primitives'][0].get('extras', {}).get('targetNames')
    weights = {k: w for k, w in weights.items() if any(n.endswith(k) for n in names)}
    for p in m['primitives']:
        if not p.get('targets'):
            continue
        pos = v.acc(p['attributes']['POSITION']).astype(np.float64)
        for frag, w in weights.items():
            ti = [i for i, n in enumerate(names) if n.endswith(frag)][0]
            pos += w * v.acc(p['targets'][ti]['POSITION'])
        p['attributes']['POSITION'] = v.add_acc(pos.astype(np.float32), 5126, 'VEC3', 34962, True)
    if blink_scale is not None:
        for g in v.j['extensions']['VRM']['blendShapeMaster']['blendShapeGroups']:
            if g.get('presetName', '').startswith('blink'):
                for b in g['binds']:
                    b['weight'] = b['weight'] * blink_scale


KEEP_MORPHS = ('Fcl_ALL_Angry', 'Fcl_ALL_Fun', 'Fcl_ALL_Joy', 'Fcl_ALL_Sorrow', 'Fcl_ALL_Surprised', 'Fcl_EYE_Close', 'Fcl_EYE_Close_R', 'Fcl_EYE_Close_L', 'Fcl_MTH_A', 'Fcl_MTH_I', 'Fcl_MTH_U', 'Fcl_MTH_E', 'Fcl_MTH_O')


def prune_morphs(v, keep=KEEP_MORPHS):
    """只留下 VRM 表情預設會用到的 blendshape，並丟掉 morph normal（檔案從 ~6MB 降到 ~2MB）。"""
    for mi, m in enumerate(v.j['meshes']):
        prims = [p for p in m['primitives'] if p.get('targets')]
        if not prims:
            continue
        names = m.get('extras', {}).get('targetNames') or prims[0].get('extras', {}).get('targetNames') or []
        if not names:
            continue
        idx = [i for i, n in enumerate(names) if any(n.endswith(k) for k in keep)]
        remap = {old: new for new, old in enumerate(idx)}
        for p in prims:
            p['targets'] = [{'POSITION': p['targets'][i]['POSITION']} for i in idx]
            if p.get('extras', {}).get('targetNames'):
                p['extras']['targetNames'] = [names[i] for i in idx]
        if m.get('extras', {}).get('targetNames'):
            m['extras']['targetNames'] = [names[i] for i in idx]
        if 'weights' in m:
            m['weights'] = [m['weights'][i] for i in idx]
        for g in v.j['extensions']['VRM']['blendShapeMaster']['blendShapeGroups']:
            g['binds'] = [dict(b, index=remap[b['index']]) for b in g['binds'] if b['mesh'] != mi or b['index'] in remap]


def merge_prims(v):
    """同一個 mesh 裡「同材質、同頂點資料」的 primitive 合併成一個（VRoid 頭髮常常拆成 40～80 個 → 1～3 個 draw call）。"""
    for m in v.j['meshes']:
        groups = {}
        order = []
        for p in m['primitives']:
            key = (p['material'], json.dumps(p['attributes'], sort_keys=True), p.get('mode', 4), json.dumps(p.get('targets', []), sort_keys=True))
            if key not in groups:
                groups[key] = []; order.append(key)
            groups[key].append(p)
        out = []
        for key in order:
            ps = groups[key]
            if len(ps) == 1:
                out.append(ps[0]); continue
            idx = np.concatenate([v.acc(p['indices']).astype(np.uint32) for p in ps])
            q = dict(ps[0]); q['indices'] = v.add_acc(idx, 5125, 'SCALAR', 34963)
            out.append(q)
        m['primitives'] = out


def recolor_iris(v, color):
    recolor_mat(v, 'EyeIris', color, strength=0.85, keep_detail=1.0)



def ponytail_from_twintails(v, back_offset=0.0, drop=0.0):
    """HairSample_Female 是「貓耳＋雙馬尾」樣本：拿掉貓耳與左邊的馬尾，把右邊的馬尾移到後腦中央，
    變成一束高馬尾（綁在頭骨上，剛體跟著頭動）。沈以安的設定是長髮綁馬尾，不是雙馬尾、更不是貓耳。"""
    ni = [i for i, n in enumerate(v.j['nodes']) if 'mesh' in n and v.j['meshes'][n['mesh']]['name'].startswith('Hair')][0]
    mesh = v.j['meshes'][v.j['nodes'][ni]['mesh']]
    names, _ = v.skin_mats(v.j['nodes'][ni]['skin'])
    head = names.index('J_Bip_C_Head')
    A = mesh['primitives'][0]['attributes']
    P = v.acc(A['POSITION']).astype(np.float64); Nn = v.acc(A['NORMAL']).astype(np.float64); UV = v.acc(A['TEXCOORD_0'])
    info = []
    for p in mesh['primitives']:
        idx = v.acc(p['indices']).astype(np.int64); q = P[np.unique(idx)]
        info.append((p, idx, q.min(0), q.max(0)))
    ears = [x for x in info if x[3][1] > 1.655 and len(x[1]) // 3 <= 64]
    tails = [x for x in info if max(abs(x[2][0]), abs(x[3][0])) > 0.135 and x[2][1] < 1.45]
    right = [x for x in tails if x[2][0] > 0.0]; left = [x for x in tails if x[3][0] < 0.0]
    rest = [x for x in info if x not in ears and x not in tails]
    back_z = max(x[3][2] for x in rest)
    idx_all = np.concatenate([x[1] for x in right]); used, inv = np.unique(idx_all, return_inverse=True)
    q = P[used]; root = q[q[:, 1].argmax()].copy()
    th = -np.pi / 2; R = np.array([[np.cos(th), 0, np.sin(th)], [0, 1, 0], [-np.sin(th), 0, np.cos(th)]])
    new_root = np.array([0.0, root[1] + 0.01 - drop, back_z - 0.015 + back_offset])
    q2 = (q - root) @ R.T + new_root
    n2 = Nn[used] @ R.T
    out = {'POSITION': v.add_acc(q2.astype(np.float32), 5126, 'VEC3', 34962, True), 'NORMAL': v.add_acc(n2.astype(np.float32), 5126, 'VEC3', 34962),
           'TEXCOORD_0': v.add_acc(UV[used].astype(np.float32), 5126, 'VEC2', 34962),
           'JOINTS_0': v.add_acc(np.tile(np.array([head, 0, 0, 0], dtype=np.uint16), (len(used), 1)), 5123, 'VEC4', 34962),
           'WEIGHTS_0': v.add_acc(np.tile(np.array([1, 0, 0, 0], dtype=np.float32), (len(used), 1)), 5126, 'VEC4', 34962)}
    newp = {'attributes': out, 'indices': v.add_acc(inv.astype(np.uint32), 5125, 'SCALAR', 34963), 'material': right[0][0]['material'], 'mode': 4}
    drop_ids = set(id(x[0]) for x in ears + left + right)
    mesh['primitives'] = [p for p in mesh['primitives'] if id(p) not in drop_ids] + [newp]
    return len(ears), len(left), len(right)

def cut_below(v, mat_pat, y_cut):
    """把某件衣服在 y_cut 以下的三角形刪掉（例如長版上衣改成到腰）。"""
    node, mesh, prims = body_primitives(v, mat_pat)
    for p in prims:
        cull_tris(v, p, lambda tp, td: ~(np.all(tp[:, :, 1] < y_cut, axis=1)))


def joint_y(v, name_part):
    node, mesh, _ = body_primitives(v, 'SKIN')
    names, ibm = v.skin_mats(node['skin'])
    for i, n in enumerate(names):
        if n.endswith(name_part):
            return np.linalg.inv(ibm[i])[1, 3]
    raise KeyError(name_part)


# ---- 貼圖 ----
def hexrgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64) / 255.0


def recolor(img, color, strength=1.0, keep_detail=0.85, gamma=1.0):
    """保留明暗、把顏色換成 color。亮度相對於中位數做為明暗因子。"""
    a = np.asarray(img).astype(np.float64) / 255.0
    rgb, al = a[..., :3], a[..., 3:]
    L = (0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2])
    mask = al[..., 0] > 0.5
    med = np.median(L[mask]) if mask.any() else 0.5
    s = np.clip(L / max(0.04, med), 0.0, 1.6) ** gamma
    s = 1.0 + (s - 1.0) * keep_detail
    tgt = hexrgb(color)[None, None, :] * s[..., None]
    out = rgb * (1 - strength) + tgt * strength
    out = np.clip(out, 0, 1)
    return Image.fromarray((np.concatenate([out, al], axis=2) * 255).astype(np.uint8), 'RGBA')


def recolor_mat(v, mat_pat, color, **kw):
    done = set()
    for i, m in enumerate(v.j['materials']):
        if mat_pat in m['name']:
            tp = v.vrm_mat(i)['textureProperties']
            for k in ('_MainTex', '_ShadeTexture'):
                if k in tp:
                    ii = v.image_of_tex(tp[k])
                    if ii in done:
                        continue
                    done.add(ii)
                    v.set_image(ii, recolor(v.get_image(ii), color, **kw))


def shade_color(v, mat_pat, factor=0.82, tint=(1.0, 0.96, 0.96)):
    """把 MToon 的陰影色調成「主色的較暗版」，比 VRoid 預設的偏紫灰更自然。"""
    for i, m in enumerate(v.j['materials']):
        if mat_pat in m['name']:
            vp = v.vrm_mat(i)['vectorProperties']
            vp['_ShadeColor'] = [factor * tint[0], factor * tint[1], factor * tint[2], 1]


def optimize(v, maxsize):
    """縮貼圖、移除 normal map／高光圖、縮圖換成 4×4。maxsize: dict(圖片名稱片段 → 最大邊長)。"""
    used_as = {}
    for i, mp in enumerate(v.j['extensions']['VRM']['materialProperties']):
        for k, ti in mp['textureProperties'].items():
            used_as.setdefault(v.image_of_tex(ti), set()).add(k)
    tiny = Image.new('RGBA', (4, 4), (128, 128, 255, 255))
    for ii, im in enumerate(v.j['images']):
        name = im.get('name', '')
        kinds = used_as.get(ii, set())
        if name == 'Thumbnail' or not kinds:
            v.set_image(ii, Image.new('RGBA', (4, 4), (0, 0, 0, 255))); continue
        if kinds <= {'_BumpMap'} or name.endswith('_nml'):
            v.set_image(ii, tiny); continue
        img = v.get_image(ii)
        lim = 512
        for pat, s in maxsize.items():
            if pat in name:
                lim = s
        if max(img.size) > lim:
            r = lim / max(img.size)
            img = img.resize((max(4, int(img.size[0] * r)), max(4, int(img.size[1] * r))), Image.LANCZOS)
        opaque = np.asarray(img)[..., 3].min() >= 250
        v.set_image(ii, img, 'JPEG' if (opaque and max(img.size) >= 256 and '_MainTex' in kinds) else 'PNG')
    # 不用 normal map（手機省效能；MToon 沒有它也正常）
    for mp in v.j['extensions']['VRM']['materialProperties']:
        mp['textureProperties'].pop('_BumpMap', None)
        mp.get('keywordMap', {}).pop('_NORMALMAP', None)
    for m in v.j['materials']:
        m.pop('normalTexture', None)
    # 縮圖欄位
    v.j['extensions']['VRM']['meta'].pop('texture', None)


DEFAULT_SIZES = {'Body': 1024, 'Tops': 1024, 'Onepiece': 1024, 'Bottoms': 512, 'Shoes': 256, 'Face_00': 512, 'Eye': 256,
                 'Hair': 512, 'HairBack': 512, 'Matcap': 128, 'Accessory': 128, 'FaceMouth': 256, 'FaceBrow': 256, 'FaceEyeline': 512, 'FaceEyelash': 512}


def set_meta(v, title, note):
    meta = v.j['extensions']['VRM']['meta']
    meta['title'] = title
    meta['reference'] = note


# ---------------- 角色設定 ----------------
FEMALE_EYES = {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2}   # 眼睛稍微收一點：成熟、不像大眼娃娃
MALE_EYES = {}  # 男性樣本的眼型本來就偏細長，不改


def finish(v, eyes, iris, title, note):
    bake_face(v, eyes, blink_scale=1.0 - eyes.get('Fcl_EYE_Close', 0.0))
    prune_morphs(v)
    merge_prims(v)
    recolor_iris(v, iris)
    optimize(v, DEFAULT_SIZES)
    set_meta(v, title, note)
    return v


def src(name):
    return VRM(os.path.join(SRC, name + '.vrm'))


def build_yuting():
    """祐廷（玩家）：VRoid CC0「HairSample_Male」——黑短髮、連帽上衣、深色長褲、球鞋。上衣改燕麥灰。"""
    v = src('HairSample_Male')
    recolor_mat(v, 'Tops', '#d9d4ca', strength=0.75)
    recolor_mat(v, 'Bottoms', '#2c3039', strength=0.6)
    recolor_mat(v, 'Shoes', '#eeeae2', strength=0.5)
    return finish(v, MALE_EYES, '#3a2a22', '祐廷（法條之外）', 'Based on VRoid CC0 sample "HairSample_Male" (pixiv); modified for 法條之外')


def build_heroine_01():
    """沈以安：VRoid CC0「HairSample_Female」（高馬尾）＋ HairSample_Male 的長褲（重新綁定）；
    深棕長髮、米杏針織上衣（長版下擺剪到腰）、深藍寬褲、白球鞋（依 Character Bible／2D 立繪）。"""
    v = src('HairSample_Female')
    donor = src('HairSample_Male')
    print('  heroine_01: ears/left/right hair prims', ponytail_from_twintails(v))
    waist = joint_y(v, 'Hips') + 0.07
    cut_below(v, 'Tops', waist)
    mi, added = transplant(v, donor, 'Bottoms', 'F00_901_Bottoms_Pants_CLOTH')
    n = hide_covered(v, added)
    recolor_mat(v, 'Bottoms_Pants', '#262d44', strength=0.9)
    recolor_mat(v, 'Tops', '#d8c3a5', strength=0.85)
    # 原模型是深 U 領：領口下方的軀幹皮膚塗成內搭（同色系、稍淺），變成一般圓領針織
    print('  heroine_01: painted inner tris', paint_skin(v, '#e3d2b8', y_max=joint_y(v, 'Neck') - 0.035))
    print('  heroine_01: culled skin under top', hide_covered(v, garment_of(v, 'Tops'), max_d=0.09, eps=0.035, max_tan=0.035))
    recolor_mat(v, 'HAIR', '#3a2619', strength=0.9, keep_detail=1.0)
    recolor_mat(v, 'Shoes', '#f1eee8', strength=0.8)
    print('  heroine_01: culled skin tris', n)
    return finish(v, FEMALE_EYES, '#5a3a26', '沈以安（法條之外）', 'Based on VRoid CC0 samples "HairSample_Female" + trousers from "HairSample_Male" (pixiv); modified for 法條之外')


def build_zhe():
    """阿哲：VRoid CC0「Sakurada_Fumiriya」＋ HairSample_Male 的連帽上衣；深棕短髮、墨綠連帽、卡其褲。"""
    v = src('Sakurada_Fumiriya')
    donor = src('HairSample_Male')
    remove_prims(v, ['AccessoryNeck'])
    # 原本的襯衫＋背心換成連帽上衣
    _, _, tops = body_primitives(v, 'Tops')
    remove_prims(v, ['M00_001_01_Tops'])
    mi, added = transplant(v, donor, 'Tops', 'M00_906_Tops_Hoodie_CLOTH')
    hide_covered(v, added)
    recolor_mat(v, 'Tops_Hoodie', '#3f5a4c', strength=0.85)
    recolor_mat(v, 'Bottoms', '#b9a98a', strength=0.85)
    recolor_mat(v, 'HAIR', '#2a1d15', strength=1.0, keep_detail=0.8)
    return finish(v, MALE_EYES, '#3a2a22', '阿哲（法條之外）', 'Based on VRoid CC0 samples "Sakurada Fumiriya" + hoodie from "HairSample_Male" (pixiv); modified for 法條之外')


def build_heroine_03():
    """陳語彤：VRoid CC0「Sendagaya_Shibu」（齊肩黑短髮）＋ HairSample_Male 的長褲；
    拿掉領結與百褶裙、上衣改深綠、褲子改牛仔藍、白球鞋。"""
    v = src('Sendagaya_Shibu')
    donor = src('HairSample_Male')
    remove_prims(v, ['AccessoryNeck', 'Bottoms'])
    mi, added = transplant(v, donor, 'Bottoms', 'F00_901_Bottoms_Jeans_CLOTH')
    n = hide_covered(v, added)
    recolor_mat(v, 'Bottoms_Jeans', '#55708f', strength=0.9)
    recolor_mat(v, 'Tops', '#2f4a3c', strength=0.9)
    recolor_mat(v, 'HAIR', '#15120f', strength=0.8, keep_detail=1.0)
    recolor_mat(v, 'Shoes', '#ece8e0', strength=0.85)
    return finish(v, FEMALE_EYES, '#4a3226', '陳語彤（法條之外）', 'Based on VRoid CC0 samples "Sendagaya Shibu" + trousers from "HairSample_Male" (pixiv); modified for 法條之外')


AMB_SIZES = dict(DEFAULT_SIZES, Body=512, Tops=512, Onepiece=512, Bottoms=256, Hair=256, HairBack=256, Face_00=512)
# 路人底模：衣服、頭髮烘成淺中性色，遊戲裡依每個 NPC 原本的穿搭顏色用材質顏色相乘（共用貼圖，不另外下載）
AMB_BASE = {'hair': '#8a6a52', 'top': '#e6e3de', 'bottom': '#cfcbc4'}


def finish_amb(v, eyes, title, note):
    bake_face(v, eyes, blink_scale=1.0 - eyes.get('Fcl_EYE_Close', 0.0))
    prune_morphs(v)
    merge_prims(v)
    recolor_iris(v, '#4a3226')
    optimize(v, AMB_SIZES)
    set_meta(v, title, note)
    return v


def amb_colors(v, top_pats=('Tops',), bottom_pats=('Bottoms',)):
    recolor_mat(v, 'HAIR', AMB_BASE['hair'], strength=1.0, keep_detail=0.9)
    for t in top_pats:
        recolor_mat(v, t, AMB_BASE['top'], strength=1.0, keep_detail=0.8)
    for b in bottom_pats:
        recolor_mat(v, b, AMB_BASE['bottom'], strength=1.0, keep_detail=0.8)


def build_npc_f1():
    """路人女 1：VRoid CC0「Sendagaya_Shino」（黑長直髮）——拿掉領結與百褶裙，換上長褲。"""
    v = src('Sendagaya_Shino'); donor = src('HairSample_Male')
    remove_prims(v, ['AccessoryNeck', 'Bottoms'])
    mi, added = transplant(v, donor, 'Bottoms', 'F00_901_Bottoms_Pants_CLOTH')
    hide_covered(v, added)
    amb_colors(v)
    return finish_amb(v, FEMALE_EYES, 'NPC female A（法條之外）', 'Based on VRoid CC0 samples "Sendagaya Shino" + trousers from "HairSample_Male" (pixiv)')


def build_npc_f2():
    """路人女 2：VRoid CC0「Victoria_Rubin」——拿掉舞台服，換上 HairSample_Female 的上衣與 HairSample_Male 的長褲。"""
    v = src('Victoria_Rubin'); d1 = src('HairSample_Female'); d2 = src('HairSample_Male')
    remove_prims(v, ['Tops'])
    mi, a1 = transplant(v, d1, 'Tops', 'F00_902_Tops_Blouse_CLOTH')
    waist = joint_y(v, 'Hips') + 0.07
    cut_below(v, 'Tops_Blouse', waist)
    mi, a2 = transplant(v, d2, 'Bottoms', 'F00_901_Bottoms_Pants_CLOTH')
    hide_covered(v, a2)
    hide_covered(v, garment_of(v, 'Tops_Blouse'), max_d=0.09, eps=0.035, max_tan=0.035)
    paint_skin(v, AMB_BASE['top'], y_max=joint_y(v, 'Neck') - 0.035)
    recolor_mat(v, 'Shoes', '#4a3f38', strength=0.9)
    amb_colors(v)
    return finish_amb(v, FEMALE_EYES, 'NPC female B（法條之外）', 'Based on VRoid CC0 samples "Victoria Rubin" + top from "HairSample_Female" + trousers from "HairSample_Male" (pixiv)')


def build_npc_m1():
    """路人男 1：VRoid CC0「Sakurada_Fumiriya」＋ HairSample_Male 的連帽上衣。"""
    v = src('Sakurada_Fumiriya'); donor = src('HairSample_Male')
    remove_prims(v, ['AccessoryNeck', 'M00_001_01_Tops'])
    mi, added = transplant(v, donor, 'Tops', 'M00_906_Tops_Hoodie_CLOTH')
    hide_covered(v, added)
    amb_colors(v)
    return finish_amb(v, MALE_EYES, 'NPC male A（法條之外）', 'Based on VRoid CC0 samples "Sakurada Fumiriya" + hoodie from "HairSample_Male" (pixiv)')


def build_npc_m2():
    """路人男 2：VRoid CC0「HairSample_Male」的臉與頭髮＋ Sakurada_Fumiriya 的襯衫背心（拿掉領帶）。"""
    v = src('HairSample_Male'); donor = src('Sakurada_Fumiriya')
    remove_prims(v, ['Tops'])
    mi, added = transplant(v, donor, 'Tops', 'M00_901_Tops_Shirt_CLOTH')
    hide_covered(v, added)
    amb_colors(v)
    return finish_amb(v, MALE_EYES, 'NPC male B（法條之外）', 'Based on VRoid CC0 samples "HairSample_Male" + shirt from "Sakurada Fumiriya" (pixiv)')


BUILDS = {'vroid_yuting': build_yuting, 'vroid_heroine_01': build_heroine_01, 'vroid_zhe': build_zhe, 'vroid_heroine_03': build_heroine_03,
          'vroid_npc_f1': build_npc_f1, 'vroid_npc_f2': build_npc_f2, 'vroid_npc_m1': build_npc_m1, 'vroid_npc_m2': build_npc_m2}

if __name__ == '__main__':
    want = sys.argv[1:] or list(BUILDS)
    os.makedirs(OUT, exist_ok=True)
    for k in want:
        v = BUILDS[k]()
        n = v.save(os.path.join(OUT, k + '.vrm'))
        print(k, round(n / 1e6, 2), 'MB')
