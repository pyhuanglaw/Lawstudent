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


def hide_covered(v, added, max_d=0.06, eps=0.004, max_tan=0.03, skip_joints=(), y_keep=None, keep_fn=None):
    """刪掉被移植衣物蓋住的皮膚三角形：皮膚頂點離最近的衣物頂點 < max_d，且在衣物表面的內側（沿衣物法向量的反方向）。
    skip_joints：這些骨頭的皮膚不刪（衣服接縫有縫隙的地方，留著並塗成衣服顏色當內層）。
    y_keep(P)：高於這條線的皮膚不刪（領口剪低之後，脖子與鎖骨的皮膚要留著）。
    keep_fn(P)：回傳 True 的皮膚不刪（例如袖口剪短之後，袖口外的手腕；袖口邊緣附近的皮膚會被 max_tan 當成「被蓋住」）。"""
    G = np.concatenate([a[1] for a in added]); N = np.concatenate([a[2] for a in added])
    node, mesh, skins = body_primitives(v, 'SKIN')
    names, _ = v.skin_mats(node['skin'])
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
        if skip_joints:
            dom = np.array(names, dtype=object)[J[np.arange(len(J)), Wt.argmax(axis=1)]]
            cov &= ~np.array([any(k in x for k in skip_joints) for x in dom])
        if y_keep is not None:
            cov &= ~(pos[:, 1] > y_keep(pos))
        if keep_fn is not None:
            cov &= ~keep_fn(pos)
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
    v._ponytail = newp
    return len(ears), len(left), len(right)


# ======================== v9.1：依 Character Bible 與美術參考圖的進一步改作 ========================
def uv_cull(v, mat_pat, rects):
    """刪掉 UV 中心落在 rects（貼圖座標 u0,v0,u1,v1；v 向下）裡的三角形：用來拿掉連帽上衣的帽子／抽繩、背心等。"""
    n = 0
    for m in v.j['meshes']:
        for p in m['primitives']:
            if mat_pat not in v.j['materials'][p['material']]['name']:
                continue
            uv = v.acc(p['attributes']['TEXCOORD_0']).astype(np.float64)
            tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
            c = uv[tris].mean(axis=1)
            kill = np.zeros(len(tris), dtype=bool)
            for (u0, v0, u1, v1) in rects:
                kill |= (c[:, 0] >= u0) & (c[:, 0] <= u1) & (c[:, 1] >= v0) & (c[:, 1] <= v1)
            n += int(kill.sum())
            p['indices'] = v.add_acc(tris[~kill].reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
    return n


def joint_world(v, name_suffix, mesh_prefix='Body'):
    ni, node = v.mesh_node(mesh_prefix)
    names, ibm = v.skin_mats(node['skin'])
    for i, n in enumerate(names):
        if n.endswith(name_suffix):
            return np.linalg.inv(ibm[i])
    raise KeyError(name_suffix)


def flare(v, mat_pat, amount=0.075, start=0.32, inner=0.45, straight=False):
    """長褲變寬褲：膝蓋以下的頂點沿腿軸向外推（越往褲腳越寬，內側推一半，避免兩腳穿插）。
    straight=True：從 start 開始很快加到全寬、之後維持（直筒寬褲，不是喇叭褲）。"""
    node, mesh, prims = body_primitives(v, mat_pat)
    legs = {}
    for side in ('L', 'R'):
        hip = joint_world(v, f'J_Bip_{side}_UpperLeg')[:3, 3]; ank = joint_world(v, f'J_Bip_{side}_Foot')[:3, 3]
        legs[side] = (hip, ank)
    cx = (legs['L'][0][0] + legs['R'][0][0]) / 2
    for p in prims:
        A = p['attributes']; pos = v.acc(A['POSITION']).astype(np.float64)
        out = pos.copy()
        for i, q in enumerate(pos):
            side = 'L' if (q[0] - cx) * (legs['L'][0][0] - cx) > 0 else 'R'
            hip, ank = legs[side]; d = ank - hip; L2 = (d * d).sum()
            t = np.clip(((q - hip) * d).sum() / L2, 0, 1)
            w = np.clip((t - start) / 0.3, 0, 1) ** 0.8 if straight else np.clip((t - start) / (1 - start), 0, 1) ** 1.4
            if w <= 0: continue
            axis = hip + t * d; r = q - axis; r[1] = 0; rl = np.linalg.norm(r)
            if rl < 1e-5: continue
            r /= rl
            inward = (r[0] * (cx - axis[0])) > 0
            out[i] = q + r * amount * w * (inner if inward else 1.0)
        A['POSITION'] = v.add_acc(out.astype(np.float32), 5126, 'VEC3', 34962, True)


def inpaint_face_markings(v, sat_min=0.28, warm_check=False, dilate=7):
    """把臉部貼圖上的彩色花紋（Vita 臉頰的科幻紋路）用周圍膚色填掉。"""
    for i, m in enumerate(v.j['materials']):
        if 'Face_00_SKIN' not in m['name']:
            continue
        ii = v.image_of_tex(v.vrm_mat(i)['textureProperties']['_MainTex'])
        img = v.get_image(ii); a = np.asarray(img).astype(np.float64) / 255
        rgb = a[..., :3]; mx = rgb.max(2); mn = rgb.min(2); sat = (mx - mn) / np.maximum(1e-4, mx)
        mask = (sat > sat_min) & ((rgb[..., 2] > rgb[..., 0] + 0.05) | (rgb[..., 1] > rgb[..., 0] + 0.05))
        if warm_check:   # 皮膚一定是 R 明顯大於 G、B；花紋的淡綠光暈、藍紫色描邊與皮膚混色的邊緣都不夠「暖」→ 一起填掉
            mask |= ((rgb[..., 0] - rgb[..., 1]) < 0.05) | ((rgb[..., 0] - rgb[..., 2]) < 0.1)
        from PIL import ImageFilter
        m8 = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(dilate))
        mask = np.asarray(m8) > 0
        valid = (~mask).astype(np.float64)
        cur = rgb.copy()
        for it in range(60):
            acc = np.zeros_like(cur); cnt = np.zeros(cur.shape[:2])
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (2, 0), (-2, 0), (0, 2), (0, -2)):
                acc += np.roll(np.roll(cur * valid[..., None], dy, 0), dx, 1); cnt += np.roll(np.roll(valid, dy, 0), dx, 1)
            fill = acc / np.maximum(1e-6, cnt[..., None])
            newly = mask & (cnt > 0) & (valid == 0)
            cur[newly] = fill[newly]; valid[newly] = 1
            if not (mask & (valid == 0)).any(): break
        out = np.concatenate([cur, a[..., 3:]], 2)
        v.set_image(ii, Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA'))
        return int(mask.sum())


def swap_image(v, donor, pat):
    """把 donor 模型某張貼圖（名稱含 pat）換到 v 的同名貼圖（例如虹膜：Vita 的貓眼換成一般圓瞳）。"""
    di = [i for i, im in enumerate(donor.j['images']) if pat in im.get('name', '')][0]
    vi = [i for i, im in enumerate(v.j['images']) if pat in im.get('name', '')][0]
    img = donor.get_image(di).resize(v.get_image(vi).size, Image.LANCZOS)
    v.set_image(vi, img)


def hair_prims_info(v):
    m = [x for x in v.j['meshes'] if x['name'].startswith('Hair')][0]
    P = v.acc(m['primitives'][0]['attributes']['POSITION'])
    info = []
    for p in m['primitives']:
        idx = v.acc(p['indices']).astype(np.int64); q = P[np.unique(idx)]
        info.append((p, q.min(0), q.max(0), len(idx) // 3))
    return m, info


def cut_hair_below(v, y):
    """頭髮三角形整個在 y 以下就拿掉（短髮角色：垂到脖子以下、會從帽子裡穿出來的髮尾）。"""
    m = [x for x in v.j['meshes'] if x['name'].startswith('Hair')][0]
    P = v.acc(m['primitives'][0]['attributes']['POSITION']); n = 0
    for p in m['primitives']:
        tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
        kill = (P[tris][:, :, 1] < y).all(1); n += int(kill.sum())
        p['indices'] = v.add_acc(tris[~kill].reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
    m['primitives'] = [p for p in m['primitives'] if v.j['accessors'][p['indices']]['count'] > 0]
    return n


def lengthen_hair(v, y_from, factor):
    """頭髮在 y_from 以下的部分往下拉長（陳語彤：Shibu 的鮑伯只到下巴，正式設定是齊肩、髮尾內彎）。只改頂點位置，骨頭權重不變。"""
    m = [x for x in v.j['meshes'] if x['name'].startswith('Hair')][0]
    acc = m['primitives'][0]['attributes']['POSITION']
    P = v.acc(acc).astype(np.float32).copy(); low = P[:, 1] < y_from
    P[low, 1] = y_from - (y_from - P[low, 1]) * factor
    newp = v.add_acc(P, 5126, 'VEC3', 34962, True)
    for p in m['primitives']:
        if p['attributes']['POSITION'] == acc: p['attributes'] = dict(p['attributes'], POSITION=newp)
    return int(low.sum())


def crew_neck(v, mat_pat, y0, x_max=0.11, slope=0.9, cap=None):
    """連帽上衣改 T 恤：帽子拿掉後，脖子周圍還有一圈立起來的帽口（像漏斗）。把領口剪到脖子根部（中間低、往兩側沿肩線升高），
    剪口的頂點收到領口線上（不會留下鋸齒）。cap：領口線往兩側最多升高多少（陳語彤：不設上限時，脖子兩側後面會留下
    兩個帽口的尖角，從正面看是脖子旁邊的深色尖片）。"""
    rise = (lambda d: d) if cap is None else (lambda d: np.minimum(d, cap))
    edge = lambda P: y0 + rise(slope * np.maximum(0, np.abs(P[:, 0]) - 0.045)) + np.where(P[:, 2] > 0, 0.012, 0.0)
    n = 0
    for m in v.j['meshes']:
        for p in m['primitives']:
            if mat_pat not in v.j['materials'][p['material']]['name']: continue
            P = v.acc(p['attributes']['POSITION']).astype(np.float32).copy(); tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
            near = np.abs(P[:, 0]) < x_max; above = near & (P[:, 1] > edge(P))
            kill = above[tris].all(1); tris = tris[~kill]; n += int(kill.sum())
            used = np.zeros(len(P), dtype=bool); used[np.unique(tris)] = True
            fix = used & above; P[fix, 1] = edge(P[fix])
            p['indices'] = v.add_acc(tris.reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
            p['attributes'] = dict(p['attributes'], POSITION=v.add_acc(P, 5126, 'VEC3', 34962, True))
    return n


def neck_strip_uv(v, mat_pat, y_min, x_max=0.1, uv_rect=(0.2, 0.0, 0.8, 0.36), u_of_x=lambda x: 0.5 - 0.92 * x, v_fixed=0.55):
    """連帽上衣改圓領之後，領口正中間留下一圈很窄的三角形，還在用帽子貼圖的尖端（帽緣的深色描邊＋貼圖島外面的底色）；
    陳語彤臉部近景看起來像領口中間一個深色的小蝴蝶結。把這些頂點的 UV 改到胸口上緣的素面布料（u 依左右位置對應，v 固定）。"""
    n = 0; u0, v0, u1, v1 = uv_rect
    for m in v.j['meshes']:
        for p in m['primitives']:
            if mat_pat not in v.j['materials'][p['material']]['name']: continue
            P = v.acc(p['attributes']['POSITION']).astype(np.float32); UV = v.acc(p['attributes']['TEXCOORD_0']).astype(np.float32).copy()
            sel = (np.abs(P[:, 0]) < x_max) & (P[:, 1] > y_min) & (UV[:, 0] > u0) & (UV[:, 0] < u1) & (UV[:, 1] > v0) & (UV[:, 1] < v1)
            if not sel.any(): continue
            UV[sel, 0] = u_of_x(P[sel, 0]); UV[sel, 1] = v_fixed; n += int(sel.sum())
            p['attributes'] = dict(p['attributes'], TEXCOORD_0=v.add_acc(UV, 5126, 'VEC2', 34962))
    return n


def hair_drop(v, pred):
    m, info = hair_prims_info(v)
    keep = [x[0] for x in info if not pred(x)]
    n = len(m['primitives']) - len(keep); m['primitives'] = keep
    return n


def no_hair_shine(v):
    """頭髮不要「塑膠亮片」：拿掉頭髮的 emission（VRoid 的高光貼圖）與 matcap 亮邊，只留柔和的明暗。"""
    vm = v.j['extensions']['VRM']['materialProperties']
    black = [i for i, t in enumerate(v.j['textures']) if v.j['images'][t['source']].get('name', '').startswith('Shader_NoneBlack')]
    for mp in vm:
        if 'HAIR' not in mp['name']:
            continue
        tp = mp['textureProperties']
        tp.pop('_EmissionMap', None)
        if black: tp['_SphereAdd'] = black[0]
        mp['vectorProperties']['_EmissionColor'] = [0, 0, 0, 1]
        mp['floatProperties']['_RimLightingMix'] = 0.0
        mp['vectorProperties']['_RimColor'] = [0, 0, 0, 1]


def hair_factor_reset(v, shade=(0.66, 0.6, 0.57)):
    """頭髮材質的顏色乘數改成白色、陰影色改成偏棕：Sendagaya_Shino 的頭髮 _Color 是深藍（0.10, 0.14, 0.22），
    貼圖換成棕色也會被乘成接近黑色。"""
    n = 0
    for i, m in enumerate(v.j['materials']):
        if 'HAIR' not in m['name']: continue
        vp = v.vrm_mat(i)['vectorProperties']
        vp['_Color'] = [1, 1, 1, 1]; vp['_ShadeColor'] = [shade[0], shade[1], shade[2], 1]
        pbr = m.setdefault('pbrMetallicRoughness', {}); pbr['baseColorFactor'] = [1, 1, 1, 1]; n += 1
    return n


def face_line_colors(v, brow, line, lash=None):
    """眉毛、眼線、睫毛的顏色（材質顏色乘數）：Vita 原本是淺藍灰、Victoria 原本是金髮的淺米色眉毛，
    換成跟頭髮一致的深色；貼圖是灰階形狀，顏色由材質決定。"""
    n = 0
    for i, m in enumerate(v.j['materials']):
        nm = m['name']; c = brow if 'FaceBrow' in nm else (line if 'FaceEyeline' in nm else ((lash or line) if 'FaceEyelash' in nm else None))
        if c is None: continue
        r, g, b = hexrgb(c); vp = v.vrm_mat(i)['vectorProperties']
        vp['_Color'] = [r, g, b, 1]; vp['_ShadeColor'] = [r * 0.75, g * 0.75, b * 0.75, 1]
        m.setdefault('pbrMetallicRoughness', {})['baseColorFactor'] = [r, g, b, 1]; n += 1
    return n


def flatten_hem(v, mat_pat, y_cut):
    """剪短的褲子：跨過剪裁線的三角形會留下往下垂的鋸齒（大腿內側特別明顯）；把剪裁線以下的頂點往上收到剪裁線，褲口變平整。"""
    n = 0
    for m in v.j['meshes']:
        for p in m['primitives']:
            if mat_pat not in v.j['materials'][p['material']]['name']: continue
            P = v.acc(p['attributes']['POSITION']).astype(np.float32).copy()
            used = np.zeros(len(P), dtype=bool); used[np.unique(v.acc(p['indices']).astype(np.int64))] = True   # 只動這件褲子自己的頂點（頂點緩衝可能和身體共用）
            low = used & (P[:, 1] < y_cut); P[low, 1] = y_cut; n += int(low.sum())
            p['attributes'] = dict(p['attributes'], POSITION=v.add_acc(P, 5126, 'VEC3', 34962, True))
    return n


def remove_center_curtain(v, mat_pat, y_max, x_thr=0.022):
    """長褲移植過來時兩腿之間有一片連接面（寬褲看不出來；剪成短褲後會在大腿中間垂下一塊）：拿掉胯下以下、靠中線的三角形。"""
    n = 0
    for m in v.j['meshes']:
        for p in m['primitives']:
            if mat_pat not in v.j['materials'][p['material']]['name']: continue
            P = v.acc(p['attributes']['POSITION']); tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3); T = P[tris]
            kill = (T[:, :, 1].max(1) < y_max) & (np.abs(T[:, :, 0].mean(1)) < x_thr)
            p['indices'] = v.add_acc(tris[~kill].reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963); n += int(kill.sum())
    return n


def soften_matcap(v, k=0.45):
    """所有材質的 matcap（_SphereAdd）亮邊減弱：皮膚與衣服不要像塑膠反光。"""
    done = set()
    for mp in v.j['extensions']['VRM']['materialProperties']:
        t = mp['textureProperties'].get('_SphereAdd')
        if t is None: continue
        ii = v.image_of_tex(t)
        if ii in done or v.j['images'][ii].get('name', '').startswith('Shader_None'): continue
        done.add(ii); img = v.get_image(ii); a = np.asarray(img).astype(np.float64)
        a[..., :3] *= k
        v.set_image(ii, Image.fromarray(a.astype(np.uint8), 'RGBA'))


def paint_tshirt(v, color, sleeve=0.11, neck_drop=0.05):
    """在身體皮膚貼圖上畫一件合身 T 恤（軀幹＋上臂靠肩的部分）：VRoid 本來就用這種方式做貼身衣物。"""
    from PIL import ImageDraw
    node, mesh, skins = body_primitives(v, 'SKIN')
    names, _ = v.skin_mats(node['skin'])
    neck_y = joint_y(v, 'Neck'); hips_y = joint_y(v, 'Hips')
    shL = joint_world(v, 'J_Bip_L_UpperArm')[:3, 3]; shR = joint_world(v, 'J_Bip_R_UpperArm')[:3, 3]
    ii = v.image_of_tex(v.vrm_mat(skins[0]['material'])['textureProperties']['_MainTex'])
    img = v.get_image(ii); W, H = img.size; d = ImageDraw.Draw(img)
    base = hexrgb(color)
    n = 0
    for p in skins:
        pos, J, Wt, idx = prim_arrays(v, p)
        uv = v.acc(p['attributes']['TEXCOORD_0'])
        dom = np.array(names, dtype=object)[J[np.arange(len(J)), Wt.argmax(axis=1)]]
        torso = np.array([any(s in x for s in ('Spine', 'Chest', 'Bust', 'Shoulder')) for x in dom])
        arm = np.array(['UpperArm' in x for x in dom])
        near_sh = np.minimum(np.linalg.norm(pos - shL, axis=1), np.linalg.norm(pos - shR, axis=1)) < sleeve
        ok = ((torso & (pos[:, 1] < neck_y - neck_drop)) | (arm & near_sh)) & (pos[:, 1] > hips_y - 0.05)
        for t in idx.reshape(-1, 3):
            if ok[t].all():
                sh = 0.92 + 0.08 * np.random.rand()
                c = tuple(int(255 * min(1, x * sh)) for x in base) + (255,)
                d.polygon([(uv[k][0] * W, uv[k][1] * H) for k in t], fill=c); n += 1
    v.set_image(ii, img)
    return n


def repaint_region(v, mat_pat, rect, color, detail=0.6):
    """把衣服貼圖某個區域重畫成指定顏色（保留一點原本的明暗紋理）：背心區塊 → 白襯衫。"""
    for i, m in enumerate(v.j['materials']):
        if mat_pat not in m['name']: continue
        ii = v.image_of_tex(v.vrm_mat(i)['textureProperties']['_MainTex'])
        img = v.get_image(ii); W, H = img.size
        u0, v0, u1, v1 = rect; box = (int(u0 * W), int(v0 * H), int(u1 * W), int(v1 * H))
        part = img.crop(box)
        part = recolor(part, color, strength=1.0, keep_detail=detail)
        img.paste(part, box[:2]); v.set_image(ii, img)
        return


def paint_white_shirt(v, mat_pat, color='#f3f2ee', body_v0=0.355):
    """制服襯衫＋V 領背心 → 一般白襯衫（溫書瑀）：整件換成白色（袖子、領子保留 45% 皺褶）；
    身體區塊（原本的深藍 V 領背心與羅紋下擺）只留 6% 明暗，再畫前襟門襟與鈕扣。影子貼圖同樣處理、略暗。"""
    from PIL import ImageDraw
    done = set()
    for i, m in enumerate(v.j['materials']):
        if mat_pat not in m['name']: continue
        tp = v.vrm_mat(i)['textureProperties']
        for k in ('_MainTex', '_ShadeTexture'):
            if k not in tp: continue
            ii = v.image_of_tex(tp[k])
            if ii in done: continue
            done.add(ii)
            orig = v.get_image(ii).convert('RGBA'); W, H = orig.size
            full = recolor(orig, color, strength=1.0, keep_detail=0.45)
            box = (0, int(body_v0 * H), W, H)
            full.paste(recolor(orig.crop(box), color, strength=1.0, keep_detail=0.06), box[:2])
            d = ImageDraw.Draw(full); cx = W * 0.5; lw = max(2, W // 700)
            y0, y1 = (body_v0 + 0.03) * H, 0.985 * H
            for sx in (-0.011, 0.011):
                d.line([(cx + sx * W, y0), (cx + sx * W, y1)], fill=(206, 203, 196, 255), width=lw)
            y = (body_v0 + 0.065) * H; r = W * 0.0055
            while y < y1 - 0.02 * H:
                d.ellipse([cx - r, y - r, cx + r, y + r], fill=(238, 236, 230, 255), outline=(186, 182, 174, 255), width=max(1, lw // 2)); y += 0.075 * H
            if k == '_ShadeTexture':
                a = np.asarray(full).astype(np.float64); a[..., :3] *= np.array([0.84, 0.85, 0.88]); full = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
            v.set_image(ii, full)


def lower_hood(v, mat_pat, rects, k=0.45, narrow=0.32):
    """連帽外套的帽子放下來（高子晴）：HairSample_Male 的帽子穿在比較小的身體上，會立在後腦勺（到頭骨關節以上），
    兩側帽緣升到臉頰高度，從正面看是頭髮縫隙裡露出來的白色毛邊。帽子（UV 在 rects 裡）臉旁的帽緣（前面、兩側）
    高於脖子關節的部分，高度壓成 k 倍；後面靠著後腦的部分不動；脖子以下（和外套接縫）不動。回傳移動的頂點數。"""
    ny = joint_y(v, 'Neck'); n = 0
    node, mesh, prims = body_primitives(v, mat_pat)
    for p in prims:
        A = p['attributes']; P = v.acc(A['POSITION']).astype(np.float64); UV = v.acc(A['TEXCOORD_0'])
        inr = np.zeros(len(P), dtype=bool)
        for (u0, v0, u1, v1) in rects: inr |= (UV[:, 0] >= u0) & (UV[:, 0] <= u1) & (UV[:, 1] >= v0) & (UV[:, 1] <= v1)
        # 只壓低臉旁（前面、兩側）的帽緣：後面立在後腦的部分不動（整個壓低會在脖子後面變成往後凸出的平台）；z 在 z0~z1 之間漸變
        z0, z1 = 0.02, 0.09
        w = np.clip((z1 - P[:, 2]) / (z1 - z0), 0, 1)
        m = inr & (P[:, 1] > ny) & (w > 0); d = P[m, 1] - ny
        P[m, 1] = ny + d * (1 - w[m] * (1 - k)); n += int(m.sum())
        # 立在後腦的部分比頭寬（±0.12 m，頭約 ±0.085 m），從正面會在兩側頭髮的縫隙露出淺灰色：往中間收窄、稍微壓低，躲到頭後面
        mb = inr & (P[:, 1] > ny); d = P[mb, 1] - ny; sq = np.clip(d / 0.05, 0, 1)
        P[mb, 0] = P[mb, 0] * (1 - narrow * sq); P[mb, 1] = ny + d * (1 - 0.15 * sq); n += int(mb.sum())
        A['POSITION'] = v.add_acc(P.astype(np.float32), 5126, 'VEC3', 34962, True)
    return n


def extend_sleeves(v, mat_pat, end_frac=0.45, clearance=0.014, roll_w=0.038, roll_bulge=0.009, rings=8, K=32):
    """短袖 → 反摺到前臂的長袖（溫書瑀：參考圖是白襯衫長袖、袖子反摺到前臂）。VRoid 樣本裡沒有長袖白襯衫，
    所以把襯衫袖口沿著手臂接一段袖管：從原本袖口內側開始（接縫藏在袖口裡），半徑從袖口漸漸收到前臂粗細＋鬆份，
    到前臂中段（手肘→手腕 end_frac）結束，最後 roll_w 做成鼓起的反摺袖口；最末一圈往內收到貼近手臂。
    蒙皮權重抄最近的手臂皮膚頂點，UV 抄同一角度的原袖口頂點（白色布料、皺褶延續）。回傳每邊新增的三角形數。"""
    from collections import Counter
    node, mesh, prims = body_primitives(v, mat_pat); p = prims[0]; A = p['attributes']
    P = v.acc(A['POSITION']).astype(np.float64); N = v.acc(A['NORMAL']).astype(np.float64); UV = v.acc(A['TEXCOORD_0']).astype(np.float64)
    J = v.acc(A['JOINTS_0']).astype(np.int64); W = v.acc(A['WEIGHTS_0']).astype(np.float64)
    tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
    E = Counter()
    for t in tris:
        for a, b in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])): E[(min(a, b), max(a, b))] += 1
    bv = np.unique(np.array([e for e, c in E.items() if c == 1]).ravel())
    _, _, skins = body_primitives(v, 'SKIN')
    SP = []; SJ = []; SW = []
    for sp_ in skins:
        pa, ja, wa, ia = prim_arrays(v, sp_); u = np.unique(ia); SP.append(pa[u]); SJ.append(ja[u]); SW.append(wa[u])
    SP = np.concatenate(SP); SJ = np.concatenate(SJ); SW = np.concatenate(SW)
    addP, addN, addUV, addJ, addW, addT = [], [], [], [], [], []
    base = len(P); counts = []
    for sgn, side in ((-1, 'L'), (1, 'R')):
        el = joint_world(v, 'J_Bip_%s_LowerArm' % side)[:3, 3]; ha = joint_world(v, 'J_Bip_%s_Hand' % side)[:3, 3]
        hem = bv[sgn * P[bv, 0] > 0.2]
        if not len(hem): counts.append(0); continue
        c0 = np.array([P[hem, 1].mean(), P[hem, 2].mean()])
        x_end = el[0] + end_frac * (ha[0] - el[0]); ce = np.array([el[1] + end_frac * (ha[1] - el[1]), el[2] + end_frac * (ha[2] - el[2])])
        phis = np.linspace(-np.pi, np.pi, K, endpoint=False)
        def bins(Y, Z, c, R):
            ph = np.arctan2(Z - c[1], Y - c[0]); out = np.full(K, np.nan)
            k = ((ph + np.pi) / (2 * np.pi) * K).astype(int) % K
            for kk in range(K):
                m = k == kk
                if m.any(): out[kk] = R[m].max()
            ok = ~np.isnan(out)
            return np.interp(np.arange(K), np.arange(K)[ok], out[ok], period=K)
        rho_h = bins(P[hem, 1], P[hem, 2], c0, np.hypot(P[hem, 1] - c0[0], P[hem, 2] - c0[1]))
        near = np.abs(SP[:, 0] - x_end) < 0.012
        rho_s = bins(SP[near, 1], SP[near, 2], ce, np.hypot(SP[near, 1] - ce[0], SP[near, 2] - ce[1]))
        xin = np.abs(P[hem, 0]).min() * sgn - sgn * 0.012; xh = np.abs(P[hem, 0]).max() * sgn + sgn * 0.002
        # 每一圈：(x, 圓心, 半徑陣列)
        ring_def = [(xin, c0, rho_h - 0.005)]
        for i in range(rings):
            t = i / (rings - 1); xr = xh + t * (x_end - roll_w * sgn - xh); s_ = t * t * (3 - 2 * t)
            ring_def.append((xr, c0 * (1 - t) + ce * t, rho_h * (1 - s_) + (rho_s + clearance) * s_ - 0.001 * (1 - t)))
        for f, bulge in ((0.35, 0.75), (0.7, 1.0), (1.0, 0.55)):
            ring_def.append((x_end - roll_w * sgn * (1 - f), ce, rho_s + clearance + roll_bulge * bulge))
        ring_def.append((x_end + 0.003 * sgn, ce, rho_s + 0.004))
        hem_ph = np.arctan2(P[hem, 2] - c0[1], P[hem, 1] - c0[0])
        verts = []
        for (xr, c, rho) in ring_def:
            ring = []
            for kk, ph in enumerate(phis):
                y = c[0] + rho[kk] * np.cos(ph); z = c[1] + rho[kk] * np.sin(ph)
                ring.append((xr, y, z, ph))
            verts.append(ring)
        V = np.array([[r[0], r[1], r[2]] for ring in verts for r in ring])
        PH = np.array([r[3] for ring in verts for r in ring])
        Nn = np.stack([np.zeros(len(V)), np.cos(PH), np.sin(PH)], 1)
        hu = np.array([UV[hem[np.argmin(np.abs(np.angle(np.exp(1j * (hem_ph - ph)))))]] for ph in PH])
        d2 = ((V[:, None, :] - SP[None, :, :]) ** 2).sum(2); nn = d2.argmin(1)
        off = base + sum(len(a) for a in addP)
        T = []
        R = len(ring_def)
        for i in range(R - 1):
            for kk in range(K):
                a = off + i * K + kk; b = off + i * K + (kk + 1) % K; c = off + (i + 1) * K + (kk + 1) % K; d = off + (i + 1) * K + kk
                T += [(a, b, c), (a, c, d)]
        T = np.array(T)
        # 法向量朝外：檢查第一個三角形
        allP = np.concatenate([P] + addP + [V])
        t0 = T[R * K // 2]; nrm = np.cross(allP[t0[1]] - allP[t0[0]], allP[t0[2]] - allP[t0[0]])
        if np.dot(nrm, Nn[t0[0] - off]) < 0: T = T[:, ::-1]
        addP.append(V); addN.append(Nn); addUV.append(hu); addJ.append(SJ[nn]); addW.append(SW[nn]); addT.append(T); counts.append(len(T))
    if not addP: return counts
    A['POSITION'] = v.add_acc(np.concatenate([P] + addP).astype(np.float32), 5126, 'VEC3', 34962, True)
    A['NORMAL'] = v.add_acc(np.concatenate([N] + addN).astype(np.float32), 5126, 'VEC3', 34962)
    A['TEXCOORD_0'] = v.add_acc(np.concatenate([UV] + addUV).astype(np.float32), 5126, 'VEC2', 34962)
    A['JOINTS_0'] = v.add_acc(np.concatenate([J] + addJ).astype(np.uint16), 5123, 'VEC4', 34962)
    A['WEIGHTS_0'] = v.add_acc(np.concatenate([W] + addW).astype(np.float32), 5126, 'VEC4', 34962)
    p['indices'] = v.add_acc(np.concatenate([tris] + addT).reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
    return counts


def rigid_hair_gather(v, y_start_off=0.0, tie_drop=0.07, cut_front_below=0.13, width=0.28, whole_strand=False):
    """長直髮 → 低馬尾：後腦以下的頭髮往後中央收攏（綁在後頸），前面兩側長髮剪到下巴；改過的頭髮改綁頭骨（剛體）。"""
    ni = [i for i, n in enumerate(v.j['nodes']) if 'mesh' in n and v.j['meshes'][n['mesh']]['name'].startswith('Hair')][0]
    mesh = v.j['meshes'][v.j['nodes'][ni]['mesh']]
    names, _ = v.skin_mats(v.j['nodes'][ni]['skin'])
    head = names.index('J_Bip_C_Head')
    A = mesh['primitives'][0]['attributes']
    P = v.acc(A['POSITION']).astype(np.float64); JJ = v.acc(A['JOINTS_0']).astype(np.int64); WW = v.acc(A['WEIGHTS_0']).astype(np.float64)
    head_y = joint_world(v, 'J_Bip_C_Head', 'Hair')[1, 3]; neck_y = joint_y(v, 'Neck')
    y0 = head_y + y_start_off; yt = neck_y - tie_drop
    zb = np.percentile(P[:, 2], 97) - 0.02
    out = P.copy(); changed = np.zeros(len(P), dtype=bool)
    back = P[:, 2] > -0.03
    for i, q in enumerate(P):
        if not back[i] or q[1] >= y0: continue
        s = np.clip((y0 - q[1]) / max(1e-3, y0 - yt), 0, 1)
        f = 1 - (1 - width) * (s ** 0.8)
        out[i, 0] = q[0] * f
        out[i, 2] = zb + (q[2] - zb) * f
        changed[i] = True
    rigid = changed.copy()
    if whole_strand:
        for p in mesh['primitives']:
            vi = np.unique(v.acc(p['indices']).astype(np.int64))
            if changed[vi].any(): rigid[vi] = True
    JJ[rigid] = [head, 0, 0, 0]; WW[rigid] = [1, 0, 0, 0]
    newA = {'POSITION': v.add_acc(out.astype(np.float32), 5126, 'VEC3', 34962, True), 'JOINTS_0': v.add_acc(JJ.astype(np.uint16), 5123, 'VEC4', 34962), 'WEIGHTS_0': v.add_acc(WW.astype(np.float32), 5126, 'VEC4', 34962)}
    for p in mesh['primitives']:
        p['attributes'] = dict(p['attributes'], **newA)
    # 前面（臉旁）垂到胸前的長髮剪到下巴
    ycut = head_y - cut_front_below
    for p in mesh['primitives']:
        tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
        kill = (out[tris][:, :, 1] < ycut).all(1) & (P[tris][:, :, 2] < -0.03).all(1)
        p['indices'] = v.add_acc(tris[~kill].reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
    return int(changed.sum())


def low_ponytail(v, tie_below=0.025, top_above=0.15, tie_w=0.16, tail_w=0.24, front_lim=0.62, cut_front_below=0.06, hang=0.18, gap=0.035):
    """長直髮 → 真的「低馬尾」（v9.3 取代 rigid_hair_gather：舊版只是把後面的頭髮往下逐漸收窄，從側面看還是一片往後翹的長直髮）。
    做法（模型檔座標：前方 -z、後方 +z）：以頭的中軸為圓心，後半圈與兩側的頭髮在綁點以上沿著頭的弧面往後中央收攏（半徑不變，
    頭髮貼著頭）；綁點在後頸（頭骨下緣）；綁點以下的頭髮收成一束窄的馬尾，沿著背往下垂（離背 gap）。臉旁的前髮不動、剪到下巴。
    改過的頭髮改綁頭骨（剛體）。回傳 (改了幾個頂點, 綁點座標)：綁點給遊戲內的髮圈配件用。"""
    ni = [i for i, n in enumerate(v.j['nodes']) if 'mesh' in n and v.j['meshes'][n['mesh']]['name'].startswith('Hair')][0]
    mesh = v.j['meshes'][v.j['nodes'][ni]['mesh']]
    names, _ = v.skin_mats(v.j['nodes'][ni]['skin'])
    head = names.index('J_Bip_C_Head')
    A = mesh['primitives'][0]['attributes']
    P = v.acc(A['POSITION']).astype(np.float64); JJ = v.acc(A['JOINTS_0']).astype(np.int64); WW = v.acc(A['WEIGHTS_0']).astype(np.float64)
    used = np.zeros(len(P), dtype=bool)
    for p in mesh['primitives']:
        used[np.unique(v.acc(p['indices']).astype(np.int64))] = True
    hw = joint_world(v, 'J_Bip_C_Head', 'Hair'); head_y, zc = hw[1, 3], hw[2, 3]
    yt = head_y - tie_below; ytop = head_y + top_above
    r = np.hypot(P[:, 0], P[:, 2] - zc); th = np.arctan2(P[:, 0], P[:, 2] - zc)
    backish = used & (np.abs(th) <= front_lim * np.pi)
    # 身體背面（x 接近 0）每個高度的 z：馬尾沿著背垂，不能穿進身體
    bm = [x for x in v.j['meshes'] if x['name'].startswith('Body')][0]
    B = v.acc(bm['primitives'][0]['attributes']['POSITION'])
    def back_z(y):
        s = B[(np.abs(B[:, 1] - y) < 0.02) & (np.abs(B[:, 0]) < 0.06)]
        return float(s[:, 2].max()) if len(s) else 0.06
    near = backish & (np.abs(P[:, 1] - yt) < 0.02) & (np.abs(th) < 0.35)
    rt = float(np.median(r[near])) if near.any() else 0.11
    zt = zc + rt
    out = P.copy(); changed = np.zeros(len(P), dtype=bool)
    # 綁點以上：沿著頭的弧面往後中央收攏
    up = backish & (P[:, 1] >= yt) & (P[:, 1] < ytop)
    s_ = np.clip((ytop - P[up, 1]) / max(1e-3, ytop - yt), 0, 1)
    th2 = th[up] * (1 - (1 - tie_w) * s_ ** 1.6)
    out[up, 0] = r[up] * np.sin(th2); out[up, 2] = zc + r[up] * np.cos(th2); changed[up] = True
    # 綁點以下：收成一束，沿著背往下垂
    lo = np.where(backish & (P[:, 1] < yt))[0]
    if len(lo):
        ys = P[lo, 1]
        bands = {}
        for i in lo:
            k = int(round(P[i, 1] / 0.02)); bands.setdefault(k, []).append(P[i, 2])
        zmid = {k: float(np.median(z)) for k, z in bands.items()}
        bz = {k: back_z(k * 0.02) for k in bands}
        for i in lo:
            y = P[i, 1]; k = int(round(y / 0.02))
            zcen = max(zt - (yt - y) * hang, bz[k] + gap)
            w = tie_w + (tail_w - tie_w) * min(1.0, (yt - y) / 0.05)
            out[i, 0] = P[i, 0] * w
            out[i, 2] = zcen + (P[i, 2] - zmid[k]) * 0.3
            changed[i] = True
    rigid = changed.copy()
    for p in mesh['primitives']:
        vi = np.unique(v.acc(p['indices']).astype(np.int64))
        if changed[vi].any(): rigid[vi] = True
    JJ[rigid] = [head, 0, 0, 0]; WW[rigid] = [1, 0, 0, 0]
    # 綁點以下那一束：記下來給 low_ponytail_chain 加骨頭（v9.3：原本整束綁在頭骨上，走路完全不會晃）
    tail = np.zeros(len(P), dtype=bool); tail[lo] = True
    if tail.any():
        ymin = out[tail, 1].min(); low = tail & (out[:, 1] < ymin + 0.01)
        v._lowtail = {'mask': tail, 'root': np.array([0.0, yt, zt]), 'tip': np.array([0.0, float(ymin), float(np.median(out[low, 2]))])}
    newA = {'POSITION': v.add_acc(out.astype(np.float32), 5126, 'VEC3', 34962, True), 'JOINTS_0': v.add_acc(JJ.astype(np.uint16), 5123, 'VEC4', 34962), 'WEIGHTS_0': v.add_acc(WW.astype(np.float32), 5126, 'VEC4', 34962)}
    for p in mesh['primitives']:
        p['attributes'] = dict(p['attributes'], **newA)
    # 臉旁的前髮剪到下巴
    ycut = head_y - cut_front_below; front = ~backish
    for p in mesh['primitives']:
        tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
        kill = (out[tris][:, :, 1] < ycut).all(1) & front[tris].all(1)
        p['indices'] = v.add_acc(tris[~kill].reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
    mesh['primitives'] = [p for p in mesh['primitives'] if v.j['accessors'][p['indices']]['count'] > 0]
    return int(changed.sum()), (0.0, float(yt), float(zt)), (float(hw[0, 3]), float(head_y), float(zc))


def lengthen_side_locks(v, rules):
    """臉旁的碎髮加長（沈以安：參考圖臉旁的長碎髮垂到下巴以下；樣本的側髮只到臉頰）。
    rules：[(條件, 目標髮尾高度)]，條件看每一束頭髮的髮尾（最低處）位置 (tip_x, tip_y, tip_z) 與髮根高度。
    做法：只拉長那一束的下半段——髮束中點以下的頂點依「離中點多遠」往下拉，髮尾剛好到目標高度；x、z 不動，骨頭權重不動（照樣跟著彈簧骨擺）。
    注意：前面的步驟（例如 ponytail_from_twintails 拿掉貓耳、改馬尾）會讓部分髮束有自己的 POSITION；
    每一束都用自己的 POSITION 算，改過的 POSITION 只換給原本共用同一個 POSITION 的髮束（v9.3：第一版假設全部共用，把貓耳改回來了）。
    回傳 [(primitive 編號, 原本髮尾高度, 新的髮尾高度)]。"""
    m = [x for x in v.j['meshes'] if x['name'].startswith('Hair')][0]
    arrays = {}; owner = {}
    for k, p in enumerate(m['primitives']):
        a = p['attributes']['POSITION']
        if a not in arrays: arrays[a] = v.acc(a).astype(np.float64)
        for i in np.unique(v.acc(p['indices']).astype(np.int64)): owner.setdefault((a, int(i)), set()).add(k)
    out = {a: P.copy() for a, P in arrays.items()}; changed = set(); done = []
    for k, p in enumerate(m['primitives']):
        a = p['attributes']['POSITION']; P = arrays[a]
        idx = np.unique(v.acc(p['indices']).astype(np.int64)); q = P[idx]; nt = len(v.acc(p['indices'])) // 3
        if nt > 300: continue   # 只動一束一束的碎髮（幾十～一百多個三角形）；頭髮底層、馬尾這種大片的不動
        mn, mx = q.min(0), q.max(0)
        tip = q[q[:, 1] < mn[1] + 0.012].mean(0); yroot = q[q[:, 1] > mx[1] - 0.012][:, 1].mean()
        for cond, y_target in rules:
            if not cond(tip, yroot): continue
            if any(len(owner[(a, int(i))]) > 1 for i in idx): break   # 和別的髮束共用頂點就不動（避免拉壞旁邊那一束）
            ytip = mn[1]; y0 = ytip + 0.5 * (mx[1] - ytip); d = ytip - y_target
            sel = idx[P[idx, 1] < y0]
            s_ = (y0 - P[sel, 1]) / max(1e-4, y0 - ytip)
            out[a][sel, 1] = P[sel, 1] - s_ * d; changed.add(a)
            done.append((k, round(float(ytip), 3), round(float(y_target), 3))); break
    for a in changed:
        newP = v.add_acc(out[a].astype(np.float32), 5126, 'VEC3', 34962, True)
        for p in m['primitives']:
            if p['attributes']['POSITION'] == a: p['attributes'] = dict(p['attributes'], POSITION=newP)
    return done


def low_ponytail_chain(v, params=(0.04, 0.42, 0.78), stiff=0.35, grav=0.9, drag=0.42):
    """low_ponytail 收成一束的馬尾加三節骨頭（綁點 → 1 → 2 → 3），頂點依沿著馬尾的位置分配權重，註冊成 VRM 彈簧骨：
    走路、轉身時馬尾自然擺動（v9.3：溫書瑀的馬尾原本整束綁在頭骨上，完全不會動）。綁點以上收攏的頭髮仍然綁頭骨。"""
    lt = getattr(v, '_lowtail', None)
    if lt is None: return []
    ni = [i for i, n in enumerate(v.j['nodes']) if 'mesh' in n and v.j['meshes'][n['mesh']]['name'].startswith('Hair')][0]
    mesh = v.j['meshes'][v.j['nodes'][ni]['mesh']]
    sk = v.j['skins'][v.j['nodes'][ni]['skin']]
    names = [v.j['nodes'][j]['name'] for j in sk['joints']]
    head_ix = names.index('J_Bip_C_Head'); head_node = sk['joints'][head_ix]
    ibm = v.acc(sk['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
    Hw = np.linalg.inv(ibm[head_ix])
    A = mesh['primitives'][0]['attributes']
    P = v.acc(A['POSITION']).astype(np.float64); J = v.acc(A['JOINTS_0']).astype(np.uint16).copy(); Wt = v.acc(A['WEIGHTS_0']).astype(np.float32).copy()
    root, tip = lt['root'], lt['tip']; d = tip - root; L = float(np.linalg.norm(d))
    new_nodes = []; parent = head_node; parent_w = Hw
    for k, tt in enumerate(params):
        W = np.eye(4); W[:3, 3] = root + d * tt
        local = np.linalg.inv(parent_w) @ W
        node = {'name': f'J_Sec_LowTail_{k+1}', 'translation': [float(x) for x in local[:3, 3]], 'rotation': [0, 0, 0, 1], 'scale': [1, 1, 1]}
        v.j['nodes'].append(node); idx = len(v.j['nodes']) - 1
        v.j['nodes'][parent].setdefault('children', []).append(idx)
        new_nodes.append((idx, W)); parent = idx; parent_w = W
    base = len(sk['joints'])
    sk['joints'] = sk['joints'] + [x[0] for x in new_nodes]
    ibm2 = np.concatenate([ibm, np.stack([np.linalg.inv(x[1]) for x in new_nodes])])
    sk['inverseBindMatrices'] = v.add_acc(ibm2.transpose(0, 2, 1).reshape(-1, 16).astype(np.float32), 5126, 'MAT4')
    t = np.clip(((P - root) @ d) / (L * L), 0, 1)
    for i in np.where(lt['mask'])[0]:
        tt = t[i]
        if tt < params[0]:
            w = tt / params[0]; J[i] = [head_ix, base, 0, 0]; Wt[i] = [1 - w, w, 0, 0]
        elif tt < params[1]:
            w = (tt - params[0]) / (params[1] - params[0]); J[i] = [base, base + 1, 0, 0]; Wt[i] = [1 - w, w, 0, 0]
        elif tt < params[2]:
            w = (tt - params[1]) / (params[2] - params[1]); J[i] = [base + 1, base + 2, 0, 0]; Wt[i] = [1 - w, w, 0, 0]
        else:
            J[i] = [base + 2, 0, 0, 0]; Wt[i] = [1, 0, 0, 0]
    nJ = v.add_acc(J, 5123, 'VEC4', 34962); nW = v.add_acc(Wt, 5126, 'VEC4', 34962)
    for p in mesh['primitives']:
        p['attributes'] = dict(p['attributes'], JOINTS_0=nJ, WEIGHTS_0=nW)
    sec = v.j['extensions']['VRM']['secondaryAnimation']
    sec['boneGroups'].append({'comment': 'ponytail', 'stiffiness': stiff, 'gravityPower': grav, 'gravityDir': {'x': 0, 'y': -1, 'z': 0}, 'dragForce': drag, 'center': -1, 'hitRadius': 0.035, 'bones': [new_nodes[0][0]], 'colliderGroups': list(range(len(sec.get('colliderGroups', []))))})
    return [x[0] for x in new_nodes]


def add_ponytail_chain(v, prim):
    """在馬尾上加三節骨頭（頭 → 1 → 2 → 3），頂點依位置分配權重，並註冊成 VRM 彈簧骨：走路、轉身時馬尾自然擺動。"""
    ni = [i for i, n in enumerate(v.j['nodes']) if 'mesh' in n and v.j['meshes'][n['mesh']]['name'].startswith('Hair')][0]
    sk = v.j['skins'][v.j['nodes'][ni]['skin']]
    names = [v.j['nodes'][j]['name'] for j in sk['joints']]
    head_ix = names.index('J_Bip_C_Head'); head_node = sk['joints'][head_ix]
    ibm = v.acc(sk['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
    Hw = np.linalg.inv(ibm[head_ix])
    A = prim['attributes']; P = v.acc(A['POSITION']).astype(np.float64)
    root = P[P[:, 1].argmax()]; tip = P[P[:, 1].argmin()]
    d = tip - root; L = np.linalg.norm(d)
    params = [0.04, 0.42, 0.78]
    pts = [root + d * t for t in params]
    new_nodes = []; parent = head_node; parent_w = Hw
    for k, pt in enumerate(pts):
        W = np.eye(4); W[:3, 3] = pt
        local = np.linalg.inv(parent_w) @ W
        node = {'name': f'J_Sec_Ponytail_{k+1}', 'translation': [float(x) for x in local[:3, 3]], 'rotation': [0, 0, 0, 1], 'scale': [1, 1, 1]}
        v.j['nodes'].append(node); idx = len(v.j['nodes']) - 1
        v.j['nodes'][parent].setdefault('children', []).append(idx)
        new_nodes.append((idx, W)); parent = idx; parent_w = W
    base = len(sk['joints'])
    sk['joints'] = sk['joints'] + [x[0] for x in new_nodes]
    ibm2 = np.concatenate([ibm, np.stack([np.linalg.inv(x[1]) for x in new_nodes])])
    sk['inverseBindMatrices'] = v.add_acc(ibm2.transpose(0, 2, 1).reshape(-1, 16).astype(np.float32), 5126, 'MAT4')
    t = np.clip(((P - root) @ d) / (L * L), 0, 1)
    J = np.zeros((len(P), 4), dtype=np.uint16); Wt = np.zeros((len(P), 4), dtype=np.float32)
    for i, tt in enumerate(t):
        if tt < params[0]:
            J[i] = [head_ix, base, 0, 0]; w = tt / params[0]; Wt[i] = [1 - w, w, 0, 0]
        elif tt < params[1]:
            w = (tt - params[0]) / (params[1] - params[0]); J[i] = [base, base + 1, 0, 0]; Wt[i] = [1 - w, w, 0, 0]
        elif tt < params[2]:
            w = (tt - params[1]) / (params[2] - params[1]); J[i] = [base + 1, base + 2, 0, 0]; Wt[i] = [1 - w, w, 0, 0]
        else:
            J[i] = [base + 2, 0, 0, 0]; Wt[i] = [1, 0, 0, 0]
    A['JOINTS_0'] = v.add_acc(J, 5123, 'VEC4', 34962); A['WEIGHTS_0'] = v.add_acc(Wt, 5126, 'VEC4', 34962)
    sec = v.j['extensions']['VRM']['secondaryAnimation']
    sec['boneGroups'].append({'comment': 'ponytail', 'stiffiness': 0.35, 'gravityPower': 0.9, 'gravityDir': {'x': 0, 'y': -1, 'z': 0}, 'dragForce': 0.42, 'center': -1, 'hitRadius': 0.035, 'bones': [new_nodes[0][0]], 'colliderGroups': list(range(len(sec.get('colliderGroups', []))))})
    return [x[0] for x in new_nodes]


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


def recolor(img, color, strength=1.0, keep_detail=0.85, gamma=1.0, s_max=1.6):
    """保留明暗、把顏色換成 color。亮度相對於中位數做為明暗因子。"""
    a = np.asarray(img).astype(np.float64) / 255.0
    rgb, al = a[..., :3], a[..., 3:]
    L = (0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2])
    mask = al[..., 0] > 0.5
    med = np.median(L[mask]) if mask.any() else 0.5
    s = np.clip(L / max(0.04, med), 0.0, s_max) ** gamma
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
    outline_tone(v)
    bake_face(v, eyes, blink_scale=1.0 - eyes.get('Fcl_EYE_Close', 0.0))
    prune_morphs(v)
    merge_prims(v)
    recolor_iris(v, iris)
    optimize(v, DEFAULT_SIZES)
    set_meta(v, title, note)
    return v


def src(name):
    return VRM(os.path.join(SRC, name + '.vrm'))


def drop_small_parts(v, mat_pat, max_tris=400, front_z=None):
    """衣服裡面小的獨立零件（連帽上衣的抽繩、領結）用連通元件找出來刪掉。"""
    n = 0
    for m in v.j['meshes']:
        for p in m['primitives']:
            if mat_pat not in v.j['materials'][p['material']]['name']: continue
            P = v.acc(p['attributes']['POSITION'])
            tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
            # 以「位置相同」合併頂點後做 union-find（VRoid 在 UV 接縫會重複頂點）
            key = {tuple(np.round(q, 4)): i for i, q in enumerate(P)}
            rep = np.array([key[tuple(np.round(q, 4))] for q in P])
            par = np.arange(len(P))
            def f(a):
                while par[a] != a:
                    par[a] = par[par[a]]; a = par[a]
                return a
            for a, b, c in rep[tris]:
                ra, rb, rc = f(a), f(b), f(c); par[rb] = ra; par[rc] = ra
            comp = np.array([f(rep[t[0]]) for t in tris])
            ids, cnt = np.unique(comp, return_counts=True)
            small = set(ids[cnt <= max_tris])
            kill = np.array([c in small for c in comp])
            if front_z is not None:
                kill &= P[tris][:, :, 2].mean(1) < front_z
            n += int(kill.sum())
            p['indices'] = v.add_acc(tris[~kill].reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
    return n



def rot_between(a, b):
    """把單位向量 a 轉到 b 的旋轉矩陣（Rodrigues）。"""
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    w = np.cross(a, b); c = float(np.dot(a, b)); s = np.linalg.norm(w)
    if s < 1e-8:
        return np.eye(3)
    wx = np.array([[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]])
    return np.eye(3) + wx + wx @ wx * ((1 - c) / (s * s))


def hang_ponytail(v, prim, target=(0.0, -0.97, 0.24), scale=1.0):
    """馬尾自然下垂：整束以綁髮點（最高點）為中心轉到 target 方向（往下、略往後）。
    原本由雙馬尾改來的馬尾是往旁邊／往後翹的，不轉的話站著時馬尾會水平往後飛。"""
    A = prim['attributes']
    P = v.acc(A['POSITION']).astype(np.float64); N = v.acc(A['NORMAL']).astype(np.float64)
    root = P[P[:, 1].argmax()].copy()
    d = np.linalg.norm(P - root, axis=1)
    far = P[d >= np.percentile(d, 85)].mean(0)
    R = rot_between(far - root, np.array(target, dtype=np.float64))
    A['POSITION'] = v.add_acc(((P - root) @ R.T * scale + root).astype(np.float32), 5126, 'VEC3', 34962, True)
    A['NORMAL'] = v.add_acc((N @ R.T).astype(np.float32), 5126, 'VEC3', 34962)
    return float(np.degrees(np.arccos(np.clip(np.dot((far - root) / np.linalg.norm(far - root), np.array(target) / np.linalg.norm(target)), -1, 1))))


EYE_PARTS = ('EyeWhite', 'EyeIris', 'EyeHighlight', 'FaceEyeline', 'FaceEyelash', 'EyeExtra')


def scale_eyes(v, sx=0.9, sy=0.86):
    """眼睛縮小（以左右眼各自的中心縮放眼白、虹膜、高光、眼線、睫毛；表情 morph 的位移一起縮）：
    VRoid 預設眼睛偏大，參考圖是成熟自然的大學生，不要大眼娃娃。"""
    m = [x for x in v.j['meshes'] if x['name'].startswith('Face')][0]
    mats = v.j['materials']
    is_eye = lambda p: any(k in mats[p['material']]['name'] for k in EYE_PARTS)
    by_acc = {}
    for p in m['primitives']:
        by_acc.setdefault(p['attributes']['POSITION'], []).append(p)
    pos_new, tgt_new, n = {}, {}, 0
    for acc_i, prims in by_acc.items():
        P = v.acc(acc_i).astype(np.float64)
        eye_v = np.unique(np.concatenate([v.acc(p['indices']).astype(np.int64) for p in prims if is_eye(p)] or [np.zeros(0, np.int64)]))
        white = np.unique(np.concatenate([v.acc(p['indices']).astype(np.int64) for p in prims if 'EyeWhite' in mats[p['material']]['name']] or [np.zeros(0, np.int64)]))
        if len(eye_v) == 0 or len(white) == 0:
            continue
        S = np.array([sx, sy, 1.0])
        centers = {}
        for side in (1, -1):
            w = white[P[white, 0] * side > 0]
            centers[side] = P[w].mean(0)
        P2 = P.copy()
        for side in (1, -1):
            ids = eye_v[P[eye_v, 0] * side > 0]
            c = centers[side]
            P2[ids] = c + (P[ids] - c) * S
        n += len(eye_v)
        pos_new[acc_i] = v.add_acc(P2.astype(np.float32), 5126, 'VEC3', 34962, True)
        for p in prims:
            for t in p.get('targets', []):
                ti = t['POSITION']
                if ti in tgt_new:
                    continue
                D = v.acc(ti).astype(np.float64)
                D[eye_v] = D[eye_v] * S
                tgt_new[ti] = v.add_acc(D.astype(np.float32), 5126, 'VEC3')
    for acc_i, prims in by_acc.items():
        if acc_i not in pos_new:
            continue
        for p in prims:
            p['attributes']['POSITION'] = pos_new[acc_i]
            for t in p.get('targets', []):
                t['POSITION'] = tgt_new.get(t['POSITION'], t['POSITION'])
    return n


def smooth_region(v, mat_pat, rect, size=15):
    """把衣服貼圖某個區域的細線（例如連帽上衣的口袋縫線）用中值濾波抹掉，保留大的皺褶明暗。"""
    from PIL import ImageFilter
    done = set()
    for i, m in enumerate(v.j['materials']):
        if mat_pat not in m['name']:
            continue
        tp = v.vrm_mat(i)['textureProperties']
        for k in ('_MainTex', '_ShadeTexture'):
            if k not in tp:
                continue
            ii = v.image_of_tex(tp[k])
            if ii in done:
                continue
            done.add(ii)
            img = v.get_image(ii); W, H = img.size
            u0, v0, u1, v1 = rect; box = (int(u0 * W), int(v0 * H), int(u1 * W), int(v1 * H))
            part = img.crop(box).filter(ImageFilter.MedianFilter(size))
            img.paste(part, box[:2]); v.set_image(ii, img)


def fill_from_row(v, mat_pat, rect, src_v):
    """把衣服貼圖 rect（u0,v0,u1,v1）裡的每一欄，換成同一欄在 src_v 那一列的顏色（用下面素面布料的顏色蓋掉畫在貼圖上的細線、陰影）。
    左右兩端 6 px 漸變，不留接縫。"""
    done = set()
    for i, m in enumerate(v.j['materials']):
        if mat_pat not in m['name']:
            continue
        tp = v.vrm_mat(i)['textureProperties']
        for k in ('_MainTex', '_ShadeTexture'):
            if k not in tp:
                continue
            ii = v.image_of_tex(tp[k])
            if ii in done:
                continue
            done.add(ii)
            img = v.get_image(ii); W, H = img.size; a = np.array(img).astype(np.float32)
            u0, v0, u1, v1 = rect; x0, x1, y0, y1, ys = int(u0 * W), int(u1 * W), int(v0 * H), int(v1 * H), int(src_v * H)
            for x in range(x0, x1):
                w = min(1.0, (x - x0 + 1) / 6.0, (x1 - x) / 6.0)
                a[y0:y1, x] = a[y0:y1, x] * (1 - w) + a[ys, x] * w
            v.set_image(ii, Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), img.mode))


def body_tex_replace(v, pred, color_fn):
    """身體皮膚貼圖裡符合 pred(rgb 陣列) 的像素換成 color_fn(skin_median) 的顏色：
    例如 HairSample_Female 在身體貼圖上畫了酒紅色內搭／領子，換上別的上衣後會從縫隙露出來。"""
    node, mesh, skins = body_primitives(v, 'SKIN')
    ii = v.image_of_tex(v.vrm_mat(skins[0]['material'])['textureProperties']['_MainTex'])
    img = v.get_image(ii); a = np.asarray(img).astype(np.float64) / 255
    rgb = a[..., :3]; m = pred(rgb) & (a[..., 3] > 0.5)
    skin = (rgb[..., 0] > rgb[..., 2] + 0.08) & (rgb[..., 0] > 0.6) & ~m & (a[..., 3] > 0.5)
    med = np.median(rgb[skin], axis=0) if skin.any() else np.array([0.95, 0.82, 0.74])
    out = a.copy(); out[m, :3] = color_fn(med)
    v.set_image(ii, Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA'))
    return int(m.sum())


def is_maroon(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (r > g * 1.5) & (r > b * 1.2) & (r < 0.62) & (r > 0.12)


def outline_tone(v, k=0.42, width_scale=0.75):
    """描邊顏色改成「該材質貼圖中位色的深色版」（VRoid 預設全部是酒紅色），寬度略減：
    參考圖是半寫實的成熟風格，不要明顯的動畫描線；衣服接縫的小縫隙也不會變成暗紅色塊。"""
    vm = v.j['extensions']['VRM']['materialProperties']
    for mp in vm:
        fp = mp['floatProperties']
        if not fp.get('_OutlineWidthMode'):
            continue
        t = mp['textureProperties'].get('_MainTex')
        if t is None:
            continue
        a = np.asarray(v.get_image(v.image_of_tex(t))).astype(np.float64) / 255
        m = a[..., 3] > 0.5
        med = np.median(a[..., :3][m], axis=0) if m.any() else np.array([0.5, 0.45, 0.42])
        mp['vectorProperties']['_OutlineColor'] = [float(x) for x in med * k] + [1.0]
        fp['_OutlineColorMode'] = 0
        fp['_OutlineWidth'] = fp.get('_OutlineWidth', 0.075) * width_scale


def smooth_normals_region(v, mat_pat, rect):
    """UV 落在 rect 裡的頂點：同一位置的重複頂點法向量取平均（硬邊變軟邊）。
    連帽上衣的口袋縫線是建模出來的硬邊，描邊會沿著硬邊畫出線條；變軟邊後口袋線就不明顯了。"""
    u0, v0, u1, v1 = rect; n = 0
    for m in v.j['meshes']:
        for p in m['primitives']:
            if mat_pat not in v.j['materials'][p['material']]['name']:
                continue
            A = p['attributes']
            P = v.acc(A['POSITION']); N = v.acc(A['NORMAL']).astype(np.float64); UV = v.acc(A['TEXCOORD_0'])
            ins = (UV[:, 0] >= u0) & (UV[:, 0] <= u1) & (UV[:, 1] >= v0) & (UV[:, 1] <= v1)
            groups = {}
            for i in np.nonzero(ins)[0]:
                groups.setdefault(tuple(np.round(P[i], 4)), []).append(i)
            for ids in groups.values():
                if len(ids) < 2:
                    continue
                avg = N[ids].mean(0); L = np.linalg.norm(avg)
                if L > 1e-6:
                    N[ids] = avg / L; n += len(ids)
            A['NORMAL'] = v.add_acc(N.astype(np.float32), 5126, 'VEC3', 34962)
    return n


def no_outline(v, mat_pat):
    """這件衣服不畫描邊（移植衣物在接縫處有小縫隙時，描邊會把縫隙畫成深色塊）。"""
    for mp in v.j['extensions']['VRM']['materialProperties']:
        if mat_pat in mp['name']:
            mp['floatProperties']['_OutlineWidthMode'] = 0
            mp['floatProperties']['_OutlineWidth'] = 0


def body_alpha_fill(v):
    """身體皮膚貼圖的透明區（VRoid 把原本被衣服蓋住的皮膚做成透明）補成膚色、不透明：
    換了比較短的衣服後，原本被蓋住的地方才不會變成破洞（看得到背景）。"""
    node, mesh, skins = body_primitives(v, 'SKIN')
    ii = v.image_of_tex(v.vrm_mat(skins[0]['material'])['textureProperties']['_MainTex'])
    img = v.get_image(ii); a = np.asarray(img).astype(np.float64) / 255
    rgb = a[..., :3]; al = a[..., 3]
    skin = (al > 0.5) & (rgb[..., 0] > rgb[..., 2] + 0.06) & (rgb[..., 0] > 0.6)
    med = np.median(rgb[skin], axis=0) if skin.any() else np.array([0.95, 0.82, 0.74])
    m = al < 0.5
    out = a.copy(); out[m, :3] = med; out[..., 3] = 1.0
    v.set_image(ii, Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA'))
    return int(m.sum())


def cut_sleeves(v, mat_pat, keep=0.17, clean=False, extra=()):
    """上衣袖子剪短：離肩關節（沿上臂方向）超過 keep 公尺的三角形刪掉 → 短袖（連帽上衣改 T 恤）。
    extra：也算在手臂上的次要骨頭（例如林芷若袖口荷葉邊綁在 J_Sec_*_TipSleeve，不在 UpperArm／LowerArm／Hand 上）。"""
    node, mesh, prims = body_primitives(v, mat_pat)
    names, _ = v.skin_mats(node['skin'])
    sh = {s: joint_world(v, f'J_Bip_{s}_UpperArm')[:3, 3] for s in ('L', 'R')}
    el = {s: joint_world(v, f'J_Bip_{s}_LowerArm')[:3, 3] for s in ('L', 'R')}
    n = 0
    for p in prims:
        pos, J, W, idx = prim_arrays(v, p)
        dom = np.array(names, dtype=object)[J[np.arange(len(J)), W.argmax(axis=1)]]
        cut = np.zeros(len(pos), dtype=bool); moved = np.array(pos, dtype=np.float64)
        for s in ('L', 'R'):
            d = el[s] - sh[s]; L = np.linalg.norm(d); d /= L
            t = (pos - sh[s]) @ d
            onarm = np.array([(f'_{s}_' in x) and any(k in x for k in ('UpperArm', 'LowerArm', 'Hand') + tuple(extra)) for x in dom])
            cut |= onarm & (t > keep)
            if clean:   # 剪口：留下來的三角形如果有頂點超過剪裁線，沿手臂方向收回剪裁線（袖口平整，不留鋸齒）
                sel = onarm & (t > keep); moved[sel] -= np.outer(t[sel] - keep, d)
        tris = idx.reshape(-1, 3); keep_t = ~cut[tris].all(axis=1) if clean else ~cut[tris].any(axis=1)
        n += int((~keep_t).sum())
        p['indices'] = v.add_acc(tris[keep_t].reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
        if clean:
            used = np.zeros(len(pos), dtype=bool); used[np.unique(tris[keep_t])] = True; fx = used & cut
            P = v.acc(p['attributes']['POSITION']).astype(np.float32).copy(); P[fx] = moved[fx]
            p['attributes'] = dict(p['attributes'], POSITION=v.add_acc(P, 5126, 'VEC3', 34962, True))
    return n


def tame_springs(v, grav=0.6, stiff_max=0.75, drag_min=0.42):
    """頭髮彈簧骨：重力至少 grav、剛性不超過 stiff_max、阻尼至少 drag_min——遊戲裡頭髮自然垂下、不會往上翹或往外飛。"""
    n = 0
    for gp in v.j['extensions']['VRM']['secondaryAnimation'].get('boneGroups', []):
        if gp.get('comment') == 'ponytail':
            continue
        gp['gravityPower'] = max(gp.get('gravityPower', 0), grav); gp['gravityDir'] = {'x': 0, 'y': -1, 'z': 0}
        gp['stiffiness'] = min(gp.get('stiffiness', 1), stiff_max); gp['dragForce'] = max(gp.get('dragForce', 0.4), drag_min); n += 1
    return n


def hair_colliders_body_only(v, drag_min=0.55):
    """長髮的彈簧骨只和頭、脖子、胸、脊椎碰撞，不和手臂碰撞：走路時手臂擺動會把垂到胸前的長髮往外推，
    頭髮在耳朵高度往兩側翹起來（林芷若走路截圖）。阻尼也提高一點，頭髮比較穩。"""
    sa = v.j['extensions']['VRM']['secondaryAnimation']; cgs = sa.get('colliderGroups', [])
    keep = [i for i, cg in enumerate(cgs) if any(k in v.j['nodes'][cg['node']]['name'] for k in ('Spine', 'Chest', 'Neck', 'Head'))]
    n = 0
    for gp in sa.get('boneGroups', []):
        if gp.get('comment') in ('Bust', 'Skirt', 'Sleeve'): continue
        old = gp.get('colliderGroups', []); gp['colliderGroups'] = [i for i in old if i in keep]; n += len(old) - len(gp['colliderGroups'])
        gp['dragForce'] = max(gp.get('dragForce', 0.4), drag_min)
    return n


HOOD_RECTS = [(0.295, 0.0, 0.705, 0.27), (0.32, 0.27, 0.68, 0.41)]   # HairSample_Male 連帽上衣：帽子
POCKET_RECT = (0.29, 0.63, 0.71, 0.915)                              # HairSample_Male 連帽上衣：前口袋
NECK_V_RECT = (0.458, 0.5265, 0.544, 0.5375)                         # HairSample_Male 連帽上衣：前領口正中間帽子交疊的 V 形陰影（領口羅紋下緣，貼圖 1024 px 的 y 539–550）


# ======================== v9.4 人物外觀驗收（2026-10-10，docs/art-rebuild/CHARACTER_REVIEW.md）：改臉、瀏海、鼻樑 ========================
def deform_mesh(v, prefix, fn, mat_filter=None):
    """對名字以 prefix 開頭的網格，每個 POSITION accessor 套 fn(P, sel)→新的 P（sel＝這個 accessor 裡屬於 mat_filter 材質的頂點；沒有給就是全部）。
    morph target 的位移不動（表情照樣疊在新的形狀上）。回傳改動的頂點數"""
    mats = v.j['materials']; n = 0; done = {}
    for m in v.j['meshes']:
        if not m['name'].startswith(prefix): continue
        by_acc = {}
        for p in m['primitives']: by_acc.setdefault(p['attributes']['POSITION'], []).append(p)
        for acc_i, prims in by_acc.items():
            if acc_i in done: continue
            P = v.acc(acc_i).astype(np.float64)
            ps = [p for p in prims if (mat_filter is None or mat_filter(mats[p['material']]['name']))]
            if not ps: continue
            sel = np.unique(np.concatenate([v.acc(p['indices']).astype(np.int64) for p in ps]))
            P2 = fn(P.copy(), sel); ch = np.any(np.abs(P2 - P) > 1e-7, axis=1); n += int(ch.sum())
            new = v.add_acc(P2.astype(np.float32), 5126, 'VEC3', 34962, True); done[acc_i] = new
            for p in prims: p['attributes'] = dict(p['attributes'], POSITION=new)
    return n


def face_marks(v):
    """臉部的參考位置（模型座標，臉朝 -z）：眼睛中心高度、眉毛高度、嘴的高度、臉最前面的 z"""
    mats = v.j['materials']; out = {}
    for m in v.j['meshes']:
        if not m['name'].startswith('Face'): continue
        for p in m['primitives']:
            nm = mats[p['material']]['name']; q = v.acc(p['attributes']['POSITION'])[np.unique(v.acc(p['indices']).astype(np.int64))]
            for k in ('EyeWhite', 'FaceBrow', 'FaceMouth', 'Face_00_SKIN'):   # 同一種材質可能分成好幾個 primitive：全部合起來量
                if k in nm: q2 = np.concatenate([out[k][2], q]) if k in out else q; out[k] = (q2.min(0), q2.max(0), q2)
    return {'eye_y': float((out['EyeWhite'][0][1] + out['EyeWhite'][1][1]) / 2), 'eye_top': float(out['EyeWhite'][1][1]),
            'brow_y': float((out['FaceBrow'][0][1] + out['FaceBrow'][1][1]) / 2), 'brow_lo': float(out['FaceBrow'][0][1]),
            'mouth_y': float((out['FaceMouth'][0][1] + out['FaceMouth'][1][1]) / 2), 'chin_y': float(out['Face_00_SKIN'][0][1]),
            'front_z': float(out['Face_00_SKIN'][0][2]), 'skin': out['Face_00_SKIN'][2]}


def trim_bangs(v, y_stop, k=0.3, x_max=0.1, z_max=-0.075):
    """瀏海縮短：臉前面（z < z_max、|x| < x_max）在 y_stop 以下的頭髮往上壓到 y_stop 下方（y' = y_stop − (y_stop − y)·k）。
    髮尾的尖細形狀、髮束的寬度、骨頭權重都不變，只是垂直方向變短（祐廷：參考圖 02 的瀏海在眉毛上下，原本一束束垂到鼻子、蓋住眼睛）"""
    def fn(P, sel):
        s = sel[(P[sel, 1] < y_stop) & (np.abs(P[sel, 0]) < x_max) & (P[sel, 2] < z_max)]
        P[s, 1] = y_stop - (y_stop - P[s, 1]) * k
        return P
    return deform_mesh(v, 'Hair', fn)


def nose_bridge(v, amount=0.006, y0=None, y1=None, half_w=0.022):
    """鼻樑墊高：臉皮在鼻子那一條（|x| < half_w、y0..y1）往前（−z）推，越靠中線、越靠鼻樑中段推越多（側面才看得出鼻子；VRoid 的鼻子幾乎是平的）"""
    fm = face_marks(v); y0 = fm['mouth_y'] + 0.012 if y0 is None else y0; y1 = fm['eye_y'] + 0.004 if y1 is None else y1
    def fn(P, sel):
        x, y = P[sel, 0], P[sel, 1]
        wx = np.clip(1 - (np.abs(x) / half_w) ** 2, 0, None); t = np.clip((y - y0) / (y1 - y0), 0, 1); wy = np.sin(np.pi * t) * ((y >= y0) & (y <= y1))
        P[sel, 2] -= amount * wx * wy
        return P
    return deform_mesh(v, 'Face', fn, lambda nm: 'Face_00_SKIN' in nm)


def face_slim(v, narrow=0.07, chin=0.006, z_front=-0.03, z_back=0.02):
    """臉型：眼睛以下的臉往中線收窄（越往下巴越多，最多 narrow 比例）、下巴往下拉長 chin 公尺（二次曲線：越接近下巴越多）。
    只動臉的前半部（z < z_front 全部、到 z_back 漸減為 0），耳朵與脖子接縫不動。整個臉網格（臉皮、嘴、眼睛以下的部分）一起變形，表情 morph 照樣疊上去。
    VRoid 女性樣本的下半臉偏圓（像小孩），參考圖是鵝蛋臉、下巴比較尖"""
    fm = face_marks(v); y0 = fm['eye_y'] - 0.008; y1 = fm['chin_y']
    def fn(P, sel):
        y = P[sel, 1]; z = P[sel, 2]
        t = np.clip((y0 - y) / (y0 - y1), 0, 1)
        wz = np.clip((z_back - z) / (z_back - z_front), 0, 1)
        P[sel, 0] *= 1 - narrow * t * wz
        P[sel, 1] -= chin * t * t * wz
        return P
    return deform_mesh(v, 'Face', fn)


def hair_tuck_sides(v, y_top, head_r, keep=0.4, front_z=-0.06, back_z=0.06):
    """兩側的頭髮往頭收：y_top 以下、臉前（z < front_z）以外、後腦（z > back_z）以外的頭髮，離中線的距離超過 head_r 的部分壓成 keep 倍
    （綁高馬尾時側邊頭髮往後梳，輪廓貼著頭；原本兩側各伸出 9 cm，正面看像短鮑伯）。y_top 附近漸進。只改頂點位置"""
    def fn(P, sel):
        x, y, z = P[sel, 0], P[sel, 1], P[sel, 2]
        side = (z >= front_z) & (z <= back_z) & (np.abs(x) > head_r) & (y < y_top + 0.02)
        w = np.clip((y_top + 0.02 - y) / 0.04, 0, 1) * side
        ax = np.abs(x); nx = head_r + (ax - head_r) * (1 - (1 - keep) * w)
        P[sel, 0] = np.sign(x) * np.where(side, nx, ax)
        return P
    return deform_mesh(v, 'Hair', fn)


def trim_side_hair(v, y_stop, k=0.3, z_front=-0.06, z_back=0.05, x_min=0.06, push_back=0.025):
    """側簾往上收、往後梳：臉兩側（z_front ≤ z ≤ z_back、|x| > x_min）在 y_stop 以下的頭髮垂直壓短成 k 倍、並往後（+z）推最多 push_back。
    臉前的長碎髮（z < z_front）不動。綁高馬尾時側邊頭髮往後梳、露出下巴線條（沈以安：原本下巴高度一圈側簾，正面看像短鮑伯）"""
    def fn(P, sel):
        x, y, z = P[sel, 0], P[sel, 1], P[sel, 2]
        s = (z >= z_front) & (z <= z_back) & (np.abs(x) > x_min) & (y < y_stop)
        d = np.where(s, y_stop - y, 0.0)
        P[sel, 1] = np.where(s, y_stop - d * k, y)
        w = np.clip(d / 0.06, 0, 1)
        P[sel, 2] = z + push_back * w * s
        return P
    return deform_mesh(v, 'Hair', fn)


# ---- 沈以安 v9.4（人物外觀驗收：分析代理在暫存區做的原型 scratchpad/wf/h01/proto_v2.py，整合進來）----
def _ss(t):
    t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)


def strand_info(v):
    """頭髮網格的每一個 primitive（VRoid 一束一個）：髮尾（最低 1.2 cm 的平均）、髮根（最高 1.2 cm 的平均）、三角形數"""
    m = [x for x in v.j['meshes'] if x['name'].startswith('Hair')][0]; out = []
    for k, p in enumerate(m['primitives']):
        a = p['attributes']['POSITION']; P = v.acc(a).astype(float); ids = np.unique(v.acc(p['indices']).astype(np.int64)); q = P[ids]
        mn, mx = q.min(0), q.max(0)
        out.append(dict(k=k, p=p, acc=a, ids=ids, tip=q[q[:, 1] < mn[1] + 0.012].mean(0), root=q[q[:, 1] > mx[1] - 0.012].mean(0), nt=len(v.acc(p['indices'])) // 3))
    return m, out


def edit_strands(v, pred, fn):
    """pred(髮束資訊)→要不要改；fn(P, ids, 髮束資訊)→P（只改 ids 的頂點）。依 accessor 分組寫回；馬尾（v._ponytail）不動"""
    m, infos = strand_info(v); arrays = {}; hit = []
    for s in infos:
        if s['p'] is getattr(v, '_ponytail', None) or not pred(s): continue
        if s['acc'] not in arrays: arrays[s['acc']] = v.acc(s['acc']).astype(np.float64)
        arrays[s['acc']] = fn(arrays[s['acc']], s['ids'], s); hit.append(s['k'])
    for a, P in arrays.items():
        new = v.add_acc(P.astype(np.float32), 5126, 'VEC3', 34962, True)
        for p in m['primitives']:
            if p['attributes']['POSITION'] == a: p['attributes'] = dict(p['attributes'], POSITION=new)
    return hit


def trim_fn(y_stop, k):
    """髮束在 y_stop 以下的部分垂直壓短成 k 倍（髮尾形狀不變）"""
    def fn(P, ids, s):
        sel = ids[P[ids, 1] < y_stop]; P[sel, 1] = y_stop - (y_stop - P[sel, 1]) * k; return P
    return fn


def drape_fn(tip_y, B, gap=0.012):
    """髮束下半段拉長到 tip_y，並且整條往前推到衣服／皮膚表面（B）前面 gap（垂在胸前、不插進衣服）"""
    def front_z(x, y, win=0.012):
        s = B[(np.abs(B[:, 0] - x) < win) & (np.abs(B[:, 1] - y) < win) & (B[:, 2] < 0.02)]
        return s[:, 2].min() if len(s) else None
    def fn(P, ids, s):
        q = P[ids]; ytop = q[:, 1].max(); ytip = q[:, 1].min(); ymid = ytip + 0.5 * (ytop - ytip)
        sel = ids[P[ids, 1] < ymid]; f = (ymid - P[sel, 1]) / (ymid - ytip); P[sel, 1] = P[sel, 1] - f * (ytip - tip_y)
        rows = np.arange(1.44, tip_y - 0.02, -0.01); need = []
        for y in rows:
            r = ids[np.abs(P[ids, 1] - y) < 0.005]
            if not len(r): need.append(0.0); continue
            zs = [front_z(x, y) for x in np.linspace(P[r, 0].min(), P[r, 0].max(), 3)]; zs = [z for z in zs if z is not None]
            need.append(max(0.0, P[r, 2].max() - (min(zs) - gap)) if zs else 0.0)
        need = np.maximum.accumulate(np.array(need))
        P[ids, 2] -= np.interp(P[ids, 1], rows[::-1], need[::-1], left=need[-1], right=0.0)
        return P
    return fn


def reshape_ponytail(v, prim, tip_y=1.13, path=((1.60, 0.172), (1.52, 0.175), (1.46, 0.160), (1.40, 0.142), (1.34, 0.132), (1.26, 0.128), (1.19, 0.126), (1.13, 0.124)),
                     drift=((1.60, 0.0), (1.46, 0.022), (1.36, 0.035), (1.13, 0.04)), wx_end=0.62, wz_end=0.7, f_keep=0.12):
    """馬尾重新塑形：髮尾拉到 tip_y（腰上方）、中心線沿著 path（貼著背、離背約 3 cm）往下、往下漸細（寬 ×wx_end、厚 ×wz_end）、
    綁點附近（f_keep）保持原樣。原本離背 10–12 cm 往後翹、只到肩膀下面（參考圖 01：貼著背垂到腰上方）"""
    A = prim['attributes']; P = v.acc(A['POSITION']).astype(float); idx = np.unique(v.acc(prim['indices']).astype(np.int64)); q = P[idx]
    y_tie = q[:, 1].max(); y0 = q[:, 1].min(); yc = []; cx = []; cz = []
    for y in np.arange(y_tie, y0 - 0.02, -0.02):
        s = q[(q[:, 1] <= y + 0.01) & (q[:, 1] > y - 0.01)]
        if len(s) >= 3: yc.append(y); cx.append(s[:, 0].mean()); cz.append(s[:, 2].mean())
    yc = np.array(yc)[::-1]; sm = lambda a: np.convolve(np.pad(np.array(a)[::-1], 1, mode='edge'), np.ones(3) / 3, 'valid'); cx = sm(cx); cz = sm(cz)
    y = q[:, 1]; f = (y_tie - y) / (y_tie - y0); yn = y_tie - f * (y_tie - tip_y)
    ox = np.interp(y, yc, cx); oz = np.interp(y, yc, cz)
    py = np.array([p[0] for p in path])[::-1]; pz = np.array([p[1] for p in path])[::-1]; dy = np.array([p[0] for p in drift])[::-1]; dx = np.array([p[1] for p in drift])[::-1]
    b = _ss(f / f_keep); nx = (1 - b) * ox + b * np.interp(yn, dy, dx); nz = (1 - b) * oz + b * np.interp(yn, py, pz)
    wx = 1 - (1 - wx_end) * _ss(f); wz = 1 - (1 - wz_end) * _ss(f)
    out = P.copy(); out[idx, 0] = nx + (q[:, 0] - ox) * wx; out[idx, 1] = yn; out[idx, 2] = nz + (q[:, 2] - oz) * wz
    A['POSITION'] = v.add_acc(out.astype(np.float32), 5126, 'VEC3', 34962, True)
    return len(idx)


def v_neck(v, mat_pat, y_bottom, y_top, half_w, front_z=-0.01):
    """V 領：前面（z < front_z）在 V 字邊以上的衣服三角形拿掉，剩下的邊緣頂點拉到 V 字邊上（不留鋸齒）。回傳 (拿掉的三角形數, V 字邊函式)"""
    edge = lambda P: y_bottom + (y_top - y_bottom) * np.clip(np.abs(P[:, 0]) / half_w, 0, 1)
    n = 0
    for m in v.j['meshes']:
        for p in m['primitives']:
            if mat_pat not in v.j['materials'][p['material']]['name']: continue
            P = v.acc(p['attributes']['POSITION']).astype(np.float32).copy(); tris = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
            reg = (P[:, 2] < front_z) & (np.abs(P[:, 0]) < half_w + 0.02) & (P[:, 1] > edge(P))
            kill = reg[tris].all(1); tris = tris[~kill]; n += int(kill.sum())
            used = np.zeros(len(P), bool); used[np.unique(tris)] = True; fix = used & reg; P[fix, 1] = edge(P[fix])
            p['indices'] = v.add_acc(tris.reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
            p['attributes'] = dict(p['attributes'], POSITION=v.add_acc(P, 5126, 'VEC3', 34962, True))
    return n, edge


def raise_waist(v, mat_pat, y_new, ref_body, band=0.10, gap=0.012):
    """高腰：褲頭往上拉到 y_new（自然腰線），最上面 band 公尺漸進，並貼著身體（ref_body＝還沒被藏起來的原始皮膚頂點）"""
    node, mesh, prims = body_primitives(v, mat_pat); p = prims[0]; A = p['attributes']
    P = v.acc(A['POSITION']).astype(float); ids = np.unique(v.acc(p['indices']).astype(np.int64)); q = P[ids]
    ytop = q[:, 1].max(); ya = ytop - band; out = P.copy()
    sel = ids[P[ids, 1] > ya]; t = (P[sel, 1] - ya) / band
    Q = P[sel].copy(); Q[:, 1] = P[sel, 1] + t * (y_new - ytop)
    for a in range(0, len(Q), 256):
        qq = Q[a:a + 256]; d2 = ((qq[:, None, :] - ref_body[None, :, :]) ** 2).sum(-1); j = d2.argmin(1); b = ref_body[j]; d = np.sqrt(d2[np.arange(len(qq)), j])
        keep = 1 - 0.85 * _ss((t[a:a + 256] - 0.3) / 0.7); nd = np.where(d > gap, gap + (d - gap) * keep, d)
        Q[a:a + 256] = b + (qq - b) * (nd / np.maximum(d, 1e-9))[:, None]
    out[sel] = Q; A['POSITION'] = v.add_acc(out.astype(np.float32), 5126, 'VEC3', 34962, True)
    return len(sel)


def straighten_hem(v, mat_pat, y_ref=0.20, y_back=0.032, y_front=0.07):
    """褲管直直垂到鞋面：y_ref 以下的褲管照 y_ref 那一圈的半徑往下延伸（不再往外翻、像反摺的褲口），後面垂到 y_back、前面到 y_front（露鞋尖）"""
    node, mesh, prims = body_primitives(v, mat_pat); p = prims[0]; A = p['attributes']
    P = v.acc(A['POSITION']).astype(float); ids = np.unique(v.acc(p['indices']).astype(np.int64)); out = P.copy()
    for side in ('L', 'R'):
        hip = joint_world(v, f'J_Bip_{side}_UpperLeg')[:3, 3]; ank = joint_world(v, f'J_Bip_{side}_Foot')[:3, 3]
        sid = ids[(P[ids, 0] < 0) == (hip[0] < 0)]
        ax = lambda y: hip + (y - hip[1]) / (ank[1] - hip[1]) * (ank - hip)
        ring = sid[np.abs(P[sid, 1] - y_ref) < 0.02]; a0 = ax(y_ref)
        ph_r = np.arctan2(P[ring, 2] - a0[2], P[ring, 0] - a0[0]); r_r = np.hypot(P[ring, 2] - a0[2], P[ring, 0] - a0[0])
        K = 24; bins = ((ph_r + np.pi) / (2 * np.pi) * K).astype(int) % K; R = np.full(K, np.nan)
        for kk in range(K):
            if (bins == kk).any(): R[kk] = np.median(r_r[bins == kk])
        ok = ~np.isnan(R); R = np.interp(np.arange(K), np.arange(K)[ok], R[ok], period=K)
        low = sid[P[sid, 1] < y_ref]; ylow = P[sid, 1].min()
        for i in low:
            ph = np.arctan2(P[i, 2] - ax(P[i, 1])[2], P[i, 0] - ax(P[i, 1])[0]); kk = int((ph + np.pi) / (2 * np.pi) * K) % K
            sfr = (y_ref - P[i, 1]) / (y_ref - ylow); front = np.clip(-np.sin(ph), 0, 1); yb = y_back + (y_front - y_back) * front
            yn = y_ref - sfr * (y_ref - yb); an = ax(yn)
            out[i] = [an[0] + R[kk] * np.cos(ph), yn, an[2] + R[kk] * np.sin(ph)]
    A['POSITION'] = v.add_acc(out.astype(np.float32), 5126, 'VEC3', 34962, True)


def surface_verts(v, pats):
    """目前看得到的衣服／皮膚頂點（用來讓頭髮垂在衣服前面）"""
    mats = v.j['materials']; out = []
    for m in v.j['meshes']:
        if not m['name'].startswith('Body'): continue
        for p in m['primitives']:
            if any(t in mats[p['material']]['name'] for t in pats):
                idx = np.unique(v.acc(p['indices']).astype(np.int64))
                if len(idx): out.append(v.acc(p['attributes']['POSITION']).astype(float)[idx])
    return np.concatenate(out)


def fit_to_body(v, mat_pat, keep=0.45, gap=0.012, y_min=None, y_max=None, skin_pat='Body_00_SKIN'):
    """衣服收合身：mat_pat 衣服的每個頂點，朝最近的身體皮膚頂點靠近——離身體的距離 d 變成 gap + (d − gap)·keep（本來就貼著的不動）。
    寬鬆的連帽衫 → 合身的毛衣（祐廷：參考圖 02）。骨頭權重不變；只動 y_min..y_max 之間（不給＝全部）。回傳改動的頂點數"""
    mats = v.j['materials']
    # 身體＝皮膚三角形實際用到的頂點（同一個 POSITION accessor 裡還有衣服、以及被複製走的舊衣服頂點，不能整個拿來用）
    ids = {}
    for m in v.j['meshes']:
        for p in m['primitives']:
            if skin_pat in mats[p['material']]['name']: ids.setdefault(p['attributes']['POSITION'], []).append(v.acc(p['indices']).astype(np.int64))
    body = np.concatenate([v.acc(a).astype(np.float64)[np.unique(np.concatenate(l))] for a, l in ids.items()]) if ids else None
    if body is None or not len(body): return 0
    def fn(P, sel):
        if y_min is not None: sel = sel[P[sel, 1] >= y_min]
        if y_max is not None: sel = sel[P[sel, 1] <= y_max]
        Q = P[sel]; out = Q.copy()
        for a in range(0, len(Q), 512):
            q = Q[a:a + 512]; d2 = ((q[:, None, :] - body[None, :, :]) ** 2).sum(-1); j = d2.argmin(1)
            b = body[j]; vec = q - b; d = np.sqrt(d2[np.arange(len(q)), j])
            nd = np.where(d > gap, gap + (d - gap) * keep, d)
            out[a:a + 512] = b + vec * (nd / np.maximum(d, 1e-9))[:, None]
        P[sel] = out
        return P
    return deform_mesh(v, 'Body', fn, lambda nm: mat_pat in nm)


def crew_collar(v, mat_pat, y_c, gap=0.012, x_lim=0.16, band=0.025, skin_pat='Body_00_SKIN'):
    """圓領：上衣在脖子附近（|x| < x_lim、y > y_c − band）的頂點往脖子收——在 xz 平面上拉到「脖子橢圓＋gap」以內、高度壓到 y_c＋0.01 以下；
    y_c − band..y_c 之間漸進（不留折痕）。連帽衫帽子底部那兩片翻領 → 貼著脖子的圓領（祐廷：參考圖 02）。只移動頂點，不挖洞"""
    mats = v.j['materials']; ids = {}
    for m in v.j['meshes']:
        for p in m['primitives']:
            if skin_pat in mats[p['material']]['name']: ids.setdefault(p['attributes']['POSITION'], []).append(v.acc(p['indices']).astype(np.int64))
    B = np.concatenate([v.acc(a).astype(np.float64)[np.unique(np.concatenate(l))] for a, l in ids.items()])
    nk = B[(np.abs(B[:, 1] - y_c) < 0.006) & (np.abs(B[:, 0]) < 0.1)]
    cx, cz = (nk[:, 0].min() + nk[:, 0].max()) / 2, (nk[:, 2].min() + nk[:, 2].max()) / 2
    rx, rz = (nk[:, 0].max() - nk[:, 0].min()) / 2 + gap, (nk[:, 2].max() - nk[:, 2].min()) / 2 + gap
    def fn(P, sel):
        s = sel[(np.abs(P[sel, 0]) < x_lim) & (P[sel, 1] > y_c - band)]
        x, y, z = P[s, 0] - cx, P[s, 1], P[s, 2] - cz
        w = np.clip((y - (y_c - band)) / band, 0, 1)                      # 0（領口下緣）→ 1（領口）
        r = np.sqrt((x / rx) ** 2 + (z / rz) ** 2); k = np.where(r > 1, 1 / np.maximum(r, 1e-9), 1.0)
        k = 1 + (k - 1) * w
        P[s, 0] = cx + x * k; P[s, 2] = cz + z * k
        P[s, 1] = np.where(y > y_c + 0.01, y_c + 0.01 + (y - y_c - 0.01) * 0.25, y)
        return P
    return deform_mesh(v, 'Body', fn, lambda nm: mat_pat in nm)


# ======================== 林芷若第一輪（2026-10-10）：側分瀏海、剪到及肩、右耳撥到耳後、微捲、平滑髮際線 ========================
# 頭髮的頂點和髮束彈簧骨要一起改（骨頭的位置、IBM 重算），不然遊戲裡彈簧骨一動，頭髮就被拉回原本的長度／位置。
# 頭的球心：Victoria_Rubin 的頭（bind pose，模型座標，臉朝 -z）；其他模型要另外量（head_center）。
HEAD_C_VICTORIA = np.array([0.0, 1.598, -0.007])


def _hair_mesh(v):
    ni = [i for i, n in enumerate(v.j['nodes']) if 'mesh' in n and v.j['meshes'][n['mesh']]['name'].startswith('Hair')][0]
    return ni, v.j['meshes'][v.j['nodes'][ni]['mesh']]


def node_world(v):
    """每個節點 bind pose 的世界矩陣 W(i)（4×4），和 parent 對照表"""
    nodes = v.j['nodes']; parent = {}
    for i, n in enumerate(nodes):
        for c in n.get('children', []): parent[c] = i
    def local(n):
        T = np.eye(4); t = n.get('translation', [0, 0, 0]); x, y, z, w = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1])
        R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                      [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
        T[:3, :3] = R * np.array(s)[None, :]; T[:3, 3] = t
        return T
    cache = {}
    def W(i):
        if i not in cache: cache[i] = local(nodes[i]) if i not in parent else W(parent[i]) @ local(nodes[i])
        return cache[i]
    return W, parent


def _set_hair_pos(v, m, acc, P, N=None):
    newp = v.add_acc(P.astype(np.float32), 5126, 'VEC3', 34962, True)
    newn = v.add_acc(N.astype(np.float32), 5126, 'VEC3', 34962) if N is not None else None
    for p in m['primitives']:
        if p['attributes']['POSITION'] == acc:
            p['attributes'] = dict(p['attributes'], POSITION=newp, **({'NORMAL': newn} if newn is not None else {}))


def rebind_head(v, vids):
    """頭髮頂點 vids 改成 100% 綁頭骨（剛體跟著頭，彈簧骨不會把它甩回原處）"""
    ni, m = _hair_mesh(v)
    names, _ = v.skin_mats(v.j['nodes'][ni]['skin']); head = names.index('J_Bip_C_Head')
    A = m['primitives'][0]['attributes']
    J = v.acc(A['JOINTS_0']).astype(np.int64); Wt = v.acc(A['WEIGHTS_0']).astype(np.float64)
    J[vids] = [head, 0, 0, 0]; Wt[vids] = [1, 0, 0, 0]
    nJ = v.add_acc(J.astype(np.uint16), 5123, 'VEC4', 34962); nW = v.add_acc(Wt.astype(np.float32), 5126, 'VEC4', 34962)
    for p in m['primitives']: p['attributes'] = dict(p['attributes'], JOINTS_0=nJ, WEIGHTS_0=nW)


def shorten_hair_rig(v, y_from, factor, C=HEAD_C_VICTORIA, joint_prefix='HairJoint'):
    """頭髮剪短：y_from 以下的部分在（半徑 r、高度 y）平面上，以「這一束在 y_from 的半徑」為中心等比縮小 factor（方位角不變）——
    只壓 y 會把往外翹的髮尾壓成水平的尖刺；等比縮小保留彎曲角度。髮束彈簧骨用同樣的對應一起移（半徑以骨頭所屬髮束的半徑為中心），
    節點 local 位移與 IBM 重算。回傳移動的骨頭數"""
    ni, m = _hair_mesh(v)
    acc = m['primitives'][0]['attributes']['POSITION']; A0 = m['primitives'][0]['attributes']
    P = v.acc(acc).astype(np.float64); out = P.copy()
    J = v.acc(A0['JOINTS_0']).astype(np.int64); Wt = v.acc(A0['WEIGHTS_0']).astype(np.float64)
    zc = C[2]; jnodes = v.j['skins'][v.j['nodes'][ni]['skin']]['joints']; anchor = {}
    for p in m['primitives']:
        vi = np.unique(v.acc(p['indices']).astype(np.int64)); q = P[vi]
        if q[:, 1].min() >= y_from: continue
        r = np.hypot(q[:, 0], q[:, 2] - zc); ph = np.arctan2(q[:, 0], q[:, 2] - zc)
        near = np.abs(q[:, 1] - y_from) < 0.012
        ra = float(np.median(r[near])) if near.any() else float(r[q[:, 1] < y_from].max())
        lo = q[:, 1] < y_from; r2 = ra + (r[lo] - ra) * factor
        out[vi[lo], 0] = r2 * np.sin(ph[lo]); out[vi[lo], 2] = zc + r2 * np.cos(ph[lo]); out[vi[lo], 1] = y_from - (y_from - q[lo, 1]) * factor
        dom = J[vi, :][np.arange(len(vi)), Wt[vi].argmax(1)]
        for j in np.unique(dom): anchor.setdefault(int(jnodes[j]), []).append(ra)
    _set_hair_pos(v, m, acc, out)
    W, parent = node_world(v); nodes = v.j['nodes']
    hj = [i for i, n in enumerate(nodes) if n.get('name', '').startswith(joint_prefix)]
    newW = {i: W(i) for i in range(len(nodes))}; moved = []
    def chain_anchor(i):   # 沿著鏈往上找有直接權重的骨頭（同一條鏈共用一個中心）
        cur = i
        while cur in parent:
            if cur in anchor: return float(np.median(anchor[cur]))
            cur = parent[cur]
        return None
    for i in hj:
        M = newW[i].copy(); x, y, z = M[:3, 3]
        if y >= y_from: continue
        r = np.hypot(x, z - zc); ph = np.arctan2(x, z - zc); ra = chain_anchor(i)
        if ra is None: ra = r
        r2 = ra + (r - ra) * factor
        M[0, 3] = r2 * np.sin(ph); M[2, 3] = zc + r2 * np.cos(ph); M[1, 3] = y_from - (y_from - y) * factor
        newW[i] = M; moved.append(i)
    for i in hj:
        L = np.linalg.inv(newW[parent[i]]) @ newW[i]; nodes[i]['translation'] = [float(t) for t in L[:3, 3]]
    done = set()
    for s in v.j['skins']:
        a = s['inverseBindMatrices']
        if a in done: continue
        done.add(a)
        ibm = v.acc(a).reshape(-1, 4, 4).transpose(0, 2, 1).copy()
        for k, ji in enumerate(s['joints']):
            if ji in moved: ibm[k] = np.linalg.inv(newW[ji])
        na = v.add_acc(ibm.transpose(0, 2, 1).reshape(-1, 16).astype(np.float32), 5126, 'MAT4')
        for s2 in v.j['skins']:
            if s2['inverseBindMatrices'] == a: s2['inverseBindMatrices'] = na
    return len(moved)


def _rodrigues(axis, ang):
    a = axis / np.linalg.norm(axis); K = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
    return np.eye(3) + np.sin(ang) * K + (1 - np.cos(ang)) * K @ K


def sweep_bangs(v, part_deg=-15.0, major_deg=-30.0, minor_deg=35.0, lift_major=(0.30, 0.12), lift_minor=0.35, C=HEAD_C_VICTORIA, mat='HAIR_02', ramp=1.5):
    """齊瀏海 → 側分：每一束以「頭中心 C → 髮根」為軸彎過去（從髮根 0 漸增到髮尾 θ），髮束形狀與寬度不變、貼著頭的弧面；
    髮尾往上收（以髮根為中心壓縮夾角 lift 比例；負值＝拉長）。part_deg＝分線方位（0＝正前方，負＝角色左邊 -x）；分線右側的髮束撥 major_deg
    （越靠分線撥越多）、左側撥 minor_deg。被撥到太陽穴那一側（分線左側）的髮束改綁頭骨。回傳（髮束數、綁頭骨的髮束數）"""
    ni, m = _hair_mesh(v); mats = v.j['materials']
    acc = m['primitives'][0]['attributes']['POSITION']; P = v.acc(acc).astype(np.float64); P0 = P.copy()
    strands = [np.unique(v.acc(p['indices']).astype(np.int64)) for p in m['primitives'] if mat in mats[p['material']]['name']]
    part = np.radians(part_deg); info = []
    for vi in strands:
        q = P0[vi]; it = q[:, 1].argmin(); d = q[it] - C; info.append((vi, np.arctan2(d[0], -d[2]), it))
    far_major = max(abs(t[1] - part) for t in info if t[1] > part); far_minor = max(abs(t[1] - part) for t in info if t[1] <= part)
    rigid = []
    for vi, ph_tip, it in info:
        q = P0[vi]; root = q[q[:, 1] > q[:, 1].max() - 0.01].mean(0); tip = q[it]; ax = root - C; b = ax / np.linalg.norm(ax)
        u = abs(ph_tip - part) / (far_major if ph_tip > part else far_minor)
        if ph_tip > part: th = np.radians(major_deg) * (1 - 0.5 * u); lift = lift_major[0] + (lift_major[1] - lift_major[0]) * u
        else: th = np.radians(minor_deg) * (0.6 + 0.4 * u); lift = lift_minor; rigid.append(vi)
        def ang(p): a = (p - C); a = a / np.linalg.norm(a, axis=-1, keepdims=True); return np.arccos(np.clip(a @ b, -1, 1))
        s = np.clip(ang(q) / ang(tip[None])[0], 0, 1); out = q.copy()
        for i in range(len(q)): out[i] = C + _rodrigues(ax, th * s[i] ** ramp) @ (q[i] - C)
        if lift != 0:   # 負的 lift＝髮尾往下拉長
            for i in range(len(out)):
                d = out[i] - C; r = np.linalg.norm(d); dn = d / r; a = np.arccos(np.clip(dn @ b, -1, 1))
                if a < 1e-4: continue
                perp = dn - b * np.cos(a); perp /= np.linalg.norm(perp); a2 = a * (1 - lift * s[i] ** 1.2)
                out[i] = C + r * (b * np.cos(a2) + perp * np.sin(a2))
        P[vi] = out
    _set_hair_pos(v, m, acc, P)
    if rigid: rebind_head(v, np.concatenate(rigid))
    return len(strands), len(rigid)


def tuck_behind_ear(v, side=1, C=HEAD_C_VICTORIA, y_lo=1.40, y_band=(1.49, 1.585), y_fade=1.64, x_min=0.06, z_max=0.05, gap=0.006):
    """一側（side=+1：角色右邊 +x）蓋住耳朵的側髮撥到耳後：繞頭的垂直軸往後轉，耳朵高度以下整段都轉（髮尾跟著在耳後），
    耳朵以上到 y_fade 漸變為 0。被轉的頂點改綁頭骨。回傳轉了幾束"""
    ni, m = _hair_mesh(v); mats = v.j['materials']
    acc = m['primitives'][0]['attributes']['POSITION']; P = v.acc(acc).astype(np.float64); out = P.copy()
    ear = [p for mm in v.j['meshes'] if mm['name'].startswith('Face') for p in mm['primitives'] if 'Face_00_SKIN' in mats[p['material']]['name']][1]
    E = v.acc(ear['attributes']['POSITION'])[np.unique(v.acc(ear['indices']).astype(np.int64))].astype(np.float64); E = E[side * E[:, 0] > 0]
    ear_back = E[:, 2].max(); zc = C[2]; moved = []
    for p in m['primitives']:
        if 'HAIR_01' not in mats[p['material']]['name']: continue
        vi = np.unique(v.acc(p['indices']).astype(np.int64)); q = P[vi]
        band = (side * q[:, 0] > x_min) & (q[:, 1] > y_band[0]) & (q[:, 1] < y_band[1]) & (q[:, 2] < z_max)
        if band.sum() < 4: continue
        th = np.arctan2(side * q[:, 0], -(q[:, 2] - zc)); r = np.hypot(q[:, 0], q[:, 2] - zc)
        rb = r[band].mean(); th_goal = np.arccos(np.clip(-(ear_back + gap - zc) / rb, -1, 1))   # 這一束在耳朵高度的最前緣要轉到耳後
        dth = max(0.0, th_goal - th[band].min())
        if dth <= 0: continue
        w = np.where(q[:, 1] <= y_band[1], 1.0, np.clip((y_fade - q[:, 1]) / (y_fade - y_band[1]), 0, 1)); w = np.where(q[:, 1] < y_lo, 1.0, w)
        th2 = th + dth * w
        out[vi, 0] = side * r * np.sin(th2); out[vi, 2] = zc - r * np.cos(th2); moved.append(vi[w > 0])
    _set_hair_pos(v, m, acc, out)
    if moved: rebind_head(v, np.concatenate(moved))
    return len(moved)


def wave_bob(v, C=HEAD_C_VICTORIA, y_top=1.56, y_tip=1.40, amp=0.008, lam=0.075, tamp=0.005, flare=0.010, mat='HAIR_01'):
    """直髮 → 微捲：y_top 以下的側髮／後髮沿著半徑方向（amp）與切線方向（tamp）做波浪，越往髮尾越明顯，髮尾微微外張（flare）；
    每一束的相位不同（不會整排一起彎）。法線照位移的斜率調整（明暗跟著波浪）。回傳改動的頂點數"""
    ni, m = _hair_mesh(v); mats = v.j['materials']
    A = m['primitives'][0]['attributes']; acc = A['POSITION']
    P = v.acc(acc).astype(np.float64); N = v.acc(A['NORMAL']).astype(np.float64); sid = np.full(len(P), -1)
    for k, p in enumerate(m['primitives']):
        if mat in mats[p['material']]['name']: sid[np.unique(v.acc(p['indices']).astype(np.int64))] = k
    sel = np.where((sid >= 0) & (P[:, 1] < y_top))[0]
    def disp(y, ph):
        t = np.clip((y_top - y) / (y_top - y_tip), 0, 1); a = 2 * np.pi * (y_top - y) / lam + ph
        return flare * t ** 1.5 + amp * np.sin(a) * t ** 0.6, tamp * np.cos(a) * t ** 0.6
    x, y, z = P[sel, 0], P[sel, 1], P[sel, 2] - C[2]; r = np.maximum(np.hypot(x, z), 1e-6)
    u = np.stack([x / r, np.zeros_like(x), z / r], 1); tv = np.stack([-u[:, 2], np.zeros_like(x), u[:, 0]], 1)
    ph = 2.39996 * sid[sel]; dr, dt = disp(y, ph); e = 1e-4; dr2, dt2 = disp(y + e, ph)
    P[sel] += u * dr[:, None] + tv * dt[:, None]
    fr = (dr2 - dr) / e; ft = (dt2 - dt) / e; n = N[sel]
    n2 = n - (fr * (u * n).sum(1) + ft * (tv * n).sum(1))[:, None] * np.array([0, 1.0, 0])
    N[sel] = n2 / np.maximum(1e-9, np.linalg.norm(n2, axis=1, keepdims=True))
    _set_hair_pos(v, m, acc, P, N)
    return len(sel)


def paint_hairline(v, color, y0=1.655, k=0.6, z_max=-0.02, soft=0.003):
    """瀏海撥開後，額頭上方的臉皮（髮際線 y > y0 + k·x² 以上、只看前面 z < z_max）在臉的貼圖上塗成髮色：
    髮際線是貼圖解析度的平滑曲線（刪三角形會留下鋸齒）；soft＝髮際線的漸層寬度（公尺）。回傳塗到的像素數"""
    mats = v.j['materials']; col = hexrgb(color) * 255; acc_w = {}
    for mm in v.j['meshes']:
        if not mm['name'].startswith('Face'): continue
        for p in mm['primitives']:
            if 'Face_00_SKIN' not in mats[p['material']]['name']: continue
            ii = v.image_of_tex(v.vrm_mat(p['material'])['textureProperties']['_MainTex'])
            if ii not in acc_w:
                im = v.get_image(ii); acc_w[ii] = np.zeros((im.size[1], im.size[0]))
            wmap = acc_w[ii]; H, Wd = wmap.shape
            P = v.acc(p['attributes']['POSITION']).astype(np.float64); UV = v.acc(p['attributes']['TEXCOORD_0']).astype(np.float64)
            T = v.acc(p['indices']).astype(np.int64).reshape(-1, 3); Q = P[T]
            cand = (Q[:, :, 1] > y0 + k * Q[:, :, 0] ** 2 - 2 * soft).any(1) & (Q[:, :, 2] < z_max).any(1)
            for t in T[cand]:
                us, vs = UV[t, 0] * Wd, UV[t, 1] * H
                x0, x1 = int(max(0, np.floor(us.min()))), int(min(Wd - 1, np.ceil(us.max()))); y0p, y1p = int(max(0, np.floor(vs.min()))), int(min(H - 1, np.ceil(vs.max())))
                if x0 > x1 or y0p > y1p: continue
                xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0p, y1p + 1) + 0.5)
                (ax, ay), (bx, by), (cx, cy) = zip(us, vs); den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
                if abs(den) < 1e-12: continue
                l1 = ((by - cy) * (xs - cx) + (cx - bx) * (ys - cy)) / den; l2 = ((cy - ay) * (xs - cx) + (ax - cx) * (ys - cy)) / den; l3 = 1 - l1 - l2
                e = -0.02; inside = (l1 >= e) & (l2 >= e) & (l3 >= e)   # 邊上的像素也算（三角形之間不留縫）
                if not inside.any(): continue
                X = l1 * P[t[0], 0] + l2 * P[t[1], 0] + l3 * P[t[2], 0]; Y = l1 * P[t[0], 1] + l2 * P[t[1], 1] + l3 * P[t[2], 1]; Z = l1 * P[t[0], 2] + l2 * P[t[1], 2] + l3 * P[t[2], 2]
                w = np.clip((Y - (y0 + k * X ** 2)) / soft + 0.5, 0, 1) * (Z < z_max) * inside
                sub = wmap[y0p:y1p + 1, x0:x1 + 1]; np.maximum(sub, w, out=sub)
    n = 0
    for ii, wmap in acc_w.items():
        img = np.asarray(v.get_image(ii)).astype(np.float64).copy()
        img[..., :3] = img[..., :3] * (1 - wmap[..., None]) + col[None, None, :] * wmap[..., None]
        v.set_image(ii, Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGBA')); n += int((wmap > 0.5).sum())
    return n


# ======================== 陳語彤第一輪（2026-10-10）：左右頭髮對稱（鏡射）、補齊瀏海、齊肩、貼脖子的圓領、合身 T 恤、壓薄鞋底 ========================
def hair_mesh(v):
    return [x for x in v.j['meshes'] if x['name'].startswith('Hair')][0]


def hair_strands(v):
    m = hair_mesh(v); out = []
    for k, p in enumerate(m['primitives']):
        a = p['attributes']['POSITION']; P = v.acc(a).astype(np.float64)
        idx = np.unique(v.acc(p['indices']).astype(np.int64)); q = P[idx]
        out.append(dict(k=k, p=p, idx=idx, mn=q.min(0), mx=q.max(0), nt=len(v.acc(p['indices'])) // 3, xmean=float(q[:, 0].mean()), zmean=float(q[:, 2].mean())))
    return out


def mirror_hair_strands(v, pick, max_jd=0.035, offset=None):
    """把 pick(strand) 選到的髮束左右鏡射（x→−x）複製一份到另一側。
    頂點／法線 x 取負、三角形繞向反轉；UV 不變；骨頭：rigid（Head 等）照用，彈簧骨找「鏡射位置最近」的頭髮骨頭（< max_jd），找不到就綁 Head。"""
    m = hair_mesh(v); A = m['primitives'][0]['attributes']
    for p in m['primitives']: assert p['attributes'] == A, 'hair prims must share attributes'
    ni = [i for i, n in enumerate(v.j['nodes']) if 'mesh' in n and v.j['meshes'][n['mesh']]['name'].startswith('Hair')][0]
    sk = v.j['skins'][v.j['nodes'][ni]['skin']]; jn = [v.j['nodes'][j]['name'] for j in sk['joints']]
    ibm = v.acc(sk['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1); jw = np.array([np.linalg.inv(b)[:3, 3] for b in ibm])
    head = jn.index('J_Bip_C_Head')
    hairj = np.array([i for i, n in enumerate(jn) if 'Hair' in n or 'J_Sec_Hair' in n])
    P = v.acc(A['POSITION']).astype(np.float64); N = v.acc(A['NORMAL']).astype(np.float64); UV = v.acc(A['TEXCOORD_0']).astype(np.float64)
    J = v.acc(A['JOINTS_0']).astype(np.int64); W = v.acc(A['WEIGHTS_0']).astype(np.float64)
    def mapj(j):
        if j not in hairj: return j
        t = jw[j] * np.array([-1, 1, 1]); d = np.linalg.norm(jw[hairj] - t, axis=1); k = d.argmin()
        return int(hairj[k]) if d[k] < max_jd else head
    jm = {}
    newP, newN, newUV, newJ, newW, newprims, log = [P], [N], [UV], [J], [W], [], []
    base = len(P)
    for s in hair_strands(v):
        if not pick(s): continue
        idx = s['idx']; remap = np.full(len(P), -1, np.int64); remap[idx] = base + np.arange(len(idx)); base += len(idx)
        if offset is None:
            newP.append(P[idx] * [-1, 1, 1]); newN.append(N[idx] * [-1, 1, 1])
        else:
            newP.append(P[idx] + np.array(offset)); newN.append(N[idx])
        newUV.append(UV[idx])
        jj = J[idx].copy()
        if offset is None:
            for a in np.unique(jj):
                if a not in jm: jm[a] = mapj(a)
            jj = np.vectorize(lambda a: jm[a])(jj)
        newJ.append(jj); newW.append(W[idx])
        T = v.acc(s['p']['indices']).astype(np.int64).reshape(-1, 3)
        T2 = remap[T][:, [0, 2, 1]] if offset is None else remap[T]
        q = dict(s['p']); newprims.append((q, T2)); log.append(s['k'])
    if not newprims: return []
    P2 = np.concatenate(newP); A2 = {'POSITION': v.add_acc(P2.astype(np.float32), 5126, 'VEC3', 34962, True),
          'NORMAL': v.add_acc(np.concatenate(newN).astype(np.float32), 5126, 'VEC3', 34962),
          'TEXCOORD_0': v.add_acc(np.concatenate(newUV).astype(np.float32), 5126, 'VEC2', 34962),
          'JOINTS_0': v.add_acc(np.concatenate(newJ).astype(np.uint16), 5123, 'VEC4', 34962),
          'WEIGHTS_0': v.add_acc(np.concatenate(newW).astype(np.float32), 5126, 'VEC4', 34962)}
    for p in m['primitives']: p['attributes'] = dict(A2)
    for q, T2 in newprims:
        q = dict(q); q['attributes'] = dict(A2); q['indices'] = v.add_acc(T2.reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963); m['primitives'].append(q)
    return log, {jn[a]: jn[b] for a, b in jm.items() if a != b}


def _chamfer(a, b):
    a = a[::max(1, len(a)//300)]; b = b[::max(1, len(b)//300)]
    d = np.sqrt(((a[:, None] - b[None]) ** 2).sum(-1))
    return 0.5 * (d.min(1).mean() + d.min(0).mean())


def missing_mirror_picker(v, thr=0.009, zmax=0.0):
    """右側（+x＝角色右邊）有、左側沒有對應的髮束：鏡射後和左側每一束的平均最近距離都 > thr，且在耳朵前面（zmean < zmax）"""
    m = hair_mesh(v); P = v.acc(m['primitives'][0]['attributes']['POSITION']).astype(np.float64)
    S = hair_strands(v); left = [P[s['idx']] for s in S if s['xmean'] < -0.01]
    pick = set()
    for s in S:
        bang = s['mn'][1] > 1.44
        if s['xmean'] <= (0.025 if bang else 0.04) or s['zmean'] >= zmax: continue
        q = P[s['idx']] * [-1, 1, 1]
        best = min(_chamfer(q, L) for L in left)
        if best > (0.007 if bang else thr): pick.add(s['k'])
    return lambda s: s['k'] in pick


def hair_length_by_angle(v, target, curl=0.03, span=0.12, zc=0.013):
    """每一束頭髮依髮尾方位角拉到 target(角度, 髮尾) 的高度：髮尾 curl 公尺內（內彎的弧）整段平移、
    往上 span 公尺內的直段線性拉長，再上面不動。只改 y；骨頭權重、x、z 不變。只拉長、不縮短。"""
    m = hair_mesh(v); a0 = m['primitives'][0]['attributes']['POSITION']
    P = v.acc(a0).astype(np.float64); out = P.copy(); log = []
    for s in hair_strands(v):
        if s['p']['attributes']['POSITION'] != a0: continue
        idx = s['idx']; q = P[idx]; ytip = s['mn'][1]
        tip = q[q[:, 1] < ytip + 0.012].mean(0)
        ang = float(np.degrees(np.arctan2(tip[0], tip[2] - zc)))
        yt = target(ang, tip, s)
        if yt is None or yt >= ytip - 0.002: continue
        d = ytip - yt; yc = ytip + curl; yf = min(s['mx'][1] - 0.01, ytip + span)
        if yf <= yc + 0.01: yc = ytip; 
        y = q[:, 1]; dy = np.where(y < yc, d, np.where(y < yf, d * (yf - y) / max(1e-6, yf - yc), 0.0))
        out[idx, 1] = np.minimum(out[idx, 1], P[idx, 1] - dy)
        log.append((s['k'], round(ang), round(ytip, 3), round(yt, 3)))
    newp = v.add_acc(out.astype(np.float32), 5126, 'VEC3', 34962, True)
    for p in m['primitives']:
        if p['attributes']['POSITION'] == a0: p['attributes'] = dict(p['attributes'], POSITION=newp)
    return log


def bob_target(back=1.285, side=1.318, front=1.300):
    def f(ang, tip, s):
        a = abs(ang)
        if s['mn'][1] > 1.44: return None   # 瀏海、短碎髮不動
        if a <= 45: return back
        if a <= 110: return back + (side - back) * (a - 45) / 65
        if a <= 140: return side
        return front
    return f


def crew_collar_fit(v, mat_pat, y_c, rx=0.062, rz=0.05, cz=None, band=0.035, gap=0.008, x_lim=0.15, skin_pat='Body_00_SKIN'):
    """圓領收到脖子：領口附近（y > y_c − band、|x| < x_lim）的上衣頂點在 xz 平面往「脖子橢圓 rx×rz」收（越接近領口收越多），
    收進來之後高度抬到「該位置的身體表面＋gap」以上（沿肩膀斜面滑上去，不會插進斜方肌）。y_c 以上的部分壓到 y_c+0.01。"""
    mats = v.j['materials']; ids = {}
    for m in v.j['meshes']:
        for p in m['primitives']:
            if skin_pat in mats[p['material']]['name']: ids.setdefault(p['attributes']['POSITION'], []).append(v.acc(p['indices']).astype(np.int64))
    B = np.concatenate([v.acc(a).astype(np.float64)[np.unique(np.concatenate(l))] for a, l in ids.items()])
    if cz is None:
        nk = B[(np.abs(B[:, 1] - (y_c + 0.03)) < 0.006) & (np.abs(B[:, 0]) < 0.06)]; cz = (nk[:, 2].min() + nk[:, 2].max()) / 2
    Bl = B[(B[:, 1] < y_c + 0.015) & (B[:, 1] > y_c - 0.08) & (np.abs(B[:, 0]) < x_lim + 0.03)]
    def fn(P, sel):
        s = sel[(np.abs(P[sel, 0]) < x_lim) & (P[sel, 1] > y_c - band)]
        x, y, z = P[s, 0], P[s, 1], P[s, 2] - cz
        w = np.clip((y - (y_c - band)) / band, 0, 1) ** 1.5
        r = np.sqrt((x / rx) ** 2 + (z / rz) ** 2); k = np.where(r > 1, 1 / np.maximum(r, 1e-9), 1.0); k = 1 + (k - 1) * w
        nx, nz = x * k, z * k + cz
        y2 = np.where(y > y_c + 0.01, y_c + 0.01 + (y - y_c - 0.01) * 0.25, y)
        d2 = (nx[:, None] - Bl[None, :, 0]) ** 2 + (nz[:, None] - Bl[None, :, 2]) ** 2
        near = d2 < 0.008 ** 2
        h = np.where(near, Bl[None, :, 1], -9).max(1)
        y2 = np.maximum(y2, np.where(h > -9, h + gap, y2))
        P[s, 0] = nx; P[s, 2] = nz; P[s, 1] = y2
        return P
    return deform_mesh(v, 'Body', fn, lambda nm: mat_pat in nm)


def smooth_neckline(v, mat_pat, y_min, x_max=0.12, iters=12, k=0.5, front_only=False, band_iters=6):
    """領口的剪口（crew_neck 刪三角形留下的鋸齒）：上衣網格的邊界頂點裡，y > y_min、|x| < x_max 的那一圈，
    依繞脖子的角度排序，高度與離中心的距離做移動平均（iters 次、權重 k），變成平順的領口線。同位置的頂點（UV 接縫）一起動。回傳動到的頂點數"""
    from collections import Counter
    node, mesh, prims = body_primitives(v, mat_pat); n = 0
    for p in prims:
        P = v.acc(p['attributes']['POSITION']).astype(np.float64); T = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
        key = {}; rep = np.array([key.setdefault(tuple(np.round(q, 5)), i) for i, q in enumerate(P)]); R = rep[T]
        E = Counter()
        for a, b, c in R:
            for e in ((a, b), (b, c), (c, a)): E[(min(e), max(e))] += 1
        bv = np.unique(np.array([e for e, c in E.items() if c == 1]).ravel())
        bv = bv[(P[bv, 1] > y_min) & (np.abs(P[bv, 0]) < x_max)]
        if front_only: bv = bv[P[bv, 2] < 0]
        if len(bv) < 5: continue
        cz = (P[bv, 2].min() + P[bv, 2].max()) / 2
        th = np.arctan2(P[bv, 0], -(P[bv, 2] - cz)); o = np.argsort(th); bv = bv[o]; th = th[o]
        y = P[bv, 1].copy(); r = np.hypot(P[bv, 0], P[bv, 2] - cz)
        closed = (th[-1] - th[0]) > np.radians(300)
        for _ in range(iters):
            if closed: yp, yn, rp, rn = np.roll(y, 1), np.roll(y, -1), np.roll(r, 1), np.roll(r, -1)
            else:
                yp = np.r_[y[0], y[:-1]]; yn = np.r_[y[1:], y[-1]]; rp = np.r_[r[0], r[:-1]]; rn = np.r_[r[1:], r[-1]]
            y = y + k * ((yp + yn) / 2 - y); r = r + k * ((rp + rn) / 2 - r)
        out = P.copy()
        for i, vi in enumerate(bv):
            same = np.where(rep == rep[vi])[0]
            out[same, 0] = r[i] * np.sin(th[i]); out[same, 2] = cz - r[i] * np.cos(th[i]); out[same, 1] = y[i]; n += len(same)
        if band_iters:   # 領口下面那一圈布（收領口時壓出來的小皺褶，正面看像鋸齒）：Taubin 平滑（λ/μ 交替，不會整片縮進去），邊界固定
            reps = np.unique(rep); inreg = reps[(out[reps, 1] > y_min) & (np.abs(out[reps, 0]) < x_max)]
            fixed = set(rep[bv].tolist()); mov = np.array([q for q in inreg if q not in fixed])
            nb = {q: set() for q in inreg}
            for a, b, c in R:
                for e, f in ((a, b), (b, c), (c, a)):
                    if e in nb: nb[e].add(f)
                    if f in nb: nb[f].add(e)
            Q = out[reps].copy(); pos = {q: i for i, q in enumerate(reps)}
            for it in range(band_iters * 2):
                lam = 0.5 if it % 2 == 0 else -0.53; Q2 = Q.copy()
                for q in mov:
                    ns = [pos[t] for t in nb[q]]
                    if ns: Q2[pos[q]] = Q[pos[q]] + lam * (Q[ns].mean(0) - Q[pos[q]])
                Q = Q2
            for q in mov:
                same = np.where(rep == q)[0]; out[same] = Q[pos[q]]; n += len(same)
        acc_i = p['attributes']['POSITION']; new = v.add_acc(out.astype(np.float32), 5126, 'VEC3', 34962, True)
        for m in v.j['meshes']:
            for q in m['primitives']:
                if q['attributes']['POSITION'] == acc_i: q['attributes'] = dict(q['attributes'], POSITION=new)
    return n


def squash_soles(v, mat_pat, y_top, k=0.5):
    """鞋底壓薄：y_top 以下的鞋子頂點往 y_top 壓成 k 倍高度（厚底 → 一般球鞋）"""
    def fn(P, sel):
        s = sel[P[sel, 1] < y_top]; P[s, 1] = y_top - (y_top - P[s, 1]) * k; return P
    return deform_mesh(v, 'Body', fn, lambda nm: mat_pat in nm)


def build_yuting():
    """祐廷（玩家）：HairSample_Male。依參考圖 02：自然黑短髮（拿掉頭頂呆毛與頭髮高光）、淺灰圓領上衣（連帽上衣拿掉帽子、抽繩與口袋線）、
    深灰直筒長褲（略加寬）、白球鞋、眼睛略縮小；黑色後背包是遊戲內配件（src/props3d.js）。"""
    v = src('HairSample_Male')
    print('  yuting: ahoge prims', hair_drop(v, lambda x: x[2][1] > 1.79 and x[3] < 80))
    print('  yuting: hood tris removed', uv_cull(v, 'Tops', HOOD_RECTS), 'strings', drop_small_parts(v, 'Tops', 600, front_z=-0.05))
    print('  yuting: crew neck tris', crew_neck(v, 'Tops', joint_y(v, 'Neck') - 0.012, slope=1.2))   # 帽口那圈立領 → 圓領（參考圖 02：圓領上衣）
    smooth_region(v, 'Tops', POCKET_RECT)
    print('  yuting: pocket seam normals', smooth_normals_region(v, 'Tops', POCKET_RECT))
    recolor_mat(v, 'Tops', '#aaa59e', strength=0.88)
    flare(v, 'Bottoms', amount=0.03, start=0.12)
    recolor_mat(v, 'Bottoms', '#3d3f45', strength=0.8)
    recolor_mat(v, 'Shoes', '#f2f0ea', strength=0.7)
    recolor_mat(v, 'HAIR', '#1d1a1b', strength=0.85, keep_detail=0.75)
    print('  yuting: eye verts scaled', scale_eyes(v, 0.86, 0.82))   # v9.4 外觀驗收：0.93／0.9 → 0.86／0.82（參考圖 02：自然大小、偏細長）
    fm = face_marks(v)
    print('  yuting: bangs trimmed verts', trim_bangs(v, fm['brow_y'] - 0.004, k=0.28))   # 瀏海到眉毛（原本垂到鼻子、蓋住眼睛）
    print('  yuting: nose bridge verts', nose_bridge(v, 0.007))
    print('  yuting: top fitted verts', fit_to_body(v, 'Tops', keep=0.45, gap=0.014))   # 寬鬆連帽衫 → 合身圓領毛衣（參考圖 02）
    print('  yuting: crew collar verts', crew_collar(v, 'Tops', joint_y(v, 'Neck') - 0.016))
    no_hair_shine(v); soften_matcap(v)
    return finish(v, MALE_EYES, '#3a2a22', '祐廷（法條之外）', 'Based on VRoid CC0 sample "HairSample_Male" (pixiv); modified for 法條之外')


def knit(v, mat_pat, period=6, depth=0.09):
    """在衣服貼圖加上直條針織紋（換色前做），讓上衣看起來是針織。"""
    done = set()
    for i, m in enumerate(v.j['materials']):
        if mat_pat not in m['name']: continue
        ii = v.image_of_tex(v.vrm_mat(i)['textureProperties']['_MainTex'])
        if ii in done: continue
        done.add(ii); img = v.get_image(ii); a = np.asarray(img).astype(np.float64)
        x = np.arange(img.size[0]); mod = 1 - depth * (0.5 + 0.5 * np.cos(2 * np.pi * x / period))
        a[..., :3] *= mod[None, :, None]
        v.set_image(ii, Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA'))


def wide_pants(v, donor, name, color, amount=0.075, straight=False, start=0.32, keep_detail=0.85):
    mi, added = transplant(v, donor, 'Bottoms', name)
    flare(v, name, amount=amount, straight=straight, start=start)
    n = hide_covered(v, garment_of(v, name))
    recolor_mat(v, name, color, strength=0.9, keep_detail=keep_detail)   # keep_detail 低＝貼圖畫的反光皺褶變淡（布料變霧面，不像發亮的牛仔布）
    return n


def build_heroine_01():
    """沈以安（Character Bible：深棕長髮單一高馬尾＋碎髮、米白寬鬆 V 領針織衫、藍灰高腰寬褲、深棕樂福鞋、帆布托特包、166cm；參考圖 01、06）。
    v9.4 人物外觀驗收（2026-10-10，docs/art-rebuild/CHARACTER_REVIEW.md）：分析代理的原型（暫存區 proto_v2.py）整合進來——
    頭髮：瀏海剪到眉毛（原本 4 束橫過眼睛）、側簾與後頸收短（原本正面看是一頭鮑伯、耳朵被蓋住）、臉旁兩束細碎髮垂到胸口（在衣服前面）、
          馬尾重新塑形（貼著背垂到腰上方、往下漸細；原本離背 10–12 cm 往後翹、只到肩膀下面），塑形之後才加彈簧骨（走路照樣擺動）；
    上衣：HairSample_Male 的連帽上衣 → V 領、袖子剪到手肘＋反摺袖口、收合身一點、下擺紮進高腰褲；粗針直紋米色；
    褲子：HairSample_Male 長褲 → 褲頭拉到自然腰線（高腰）、褲管直直垂到鞋面（原本褲口外翻像反摺的牛仔褲）、霧面淺藍灰；
    臉：眼睛縮小、下半臉收窄＋下巴稍長（鵝蛋臉）、鼻樑。鞋：Sendagaya_Shino 的樂福鞋；托特包是遊戲內配件。"""
    v = src('HairSample_Female'); donor = src('HairSample_Male'); shino = src('Sendagaya_Shino')
    RB = surface_verts(v, ('SKIN',))   # 原始皮膚（還沒被衣服藏起來）：高腰褲貼著身體用
    print('  heroine_01: ears/left/right hair prims', ponytail_from_twintails(v, back_offset=-0.008, drop=-0.035))
    print('  heroine_01: ponytail rotated deg', round(hang_ponytail(v, v._ponytail, scale=1.3), 1))
    # 上衣：V 領、袖子到手肘、收合身、紮進高腰褲
    remove_prims(v, ['Tops'])
    mi, sw = transplant(v, donor, 'Tops', 'F00_906_Tops_Sweater_CLOTH')
    print('  heroine_01: sweater hood tris', uv_cull(v, 'Tops_Sweater', HOOD_RECTS), 'strings', drop_small_parts(v, 'Tops_Sweater', 600, front_z=-0.05))
    print('  heroine_01: crew neck tris', crew_neck(v, 'Tops_Sweater', joint_y(v, 'Neck') - 0.012, slope=1.2))
    n, vedge = v_neck(v, 'Tops_Sweater', 1.272, 1.352, 0.065); print('  heroine_01: v-neck tris', n)
    print('  heroine_01: sleeve tris cut', cut_sleeves(v, 'Tops_Sweater', 0.19, clean=True))
    print('  heroine_01: sleeve roll', extend_sleeves(v, 'Tops_Sweater', end_frac=0.10, clearance=0.022, roll_w=0.035, roll_bulge=0.012))
    smooth_region(v, 'Tops_Sweater', POCKET_RECT)
    smooth_normals_region(v, 'Tops_Sweater', POCKET_RECT)
    waist_new = 1.085   # 自然腰線（模型座標；參考圖側面腰頭離地約 1.07 m）
    cut_below(v, 'Tops_Sweater', waist_new - 0.015)
    print('  heroine_01: sweater fit', fit_to_body(v, 'Tops_Sweater', keep=0.6, gap=0.015), 'tuck', fit_to_body(v, 'Tops_Sweater', keep=0.2, gap=0.006, y_max=waist_new + 0.01))
    # 褲子：高腰、直筒垂到鞋面、霧面淺藍灰
    mi, added = transplant(v, donor, 'Bottoms', 'F00_901_Bottoms_Pants_CLOTH')
    flare(v, 'Bottoms_Pants', amount=0.06, straight=True, start=0.12)
    print('  heroine_01: raise waist verts', raise_waist(v, 'Bottoms_Pants', waist_new, RB))
    straighten_hem(v, 'Bottoms_Pants')
    print('  heroine_01: culled under pants', hide_covered(v, garment_of(v, 'Bottoms_Pants')))
    recolor_mat(v, 'Bottoms_Pants', '#86909f', strength=0.9, keep_detail=0.38)
    remove_prims(v, ['F00_002_01_Shoes'])
    mi, sh = transplant(v, shino, 'Shoes', 'F00_903_Shoes_Loafer_CLOTH'); hide_covered(v, sh)
    recolor_mat(v, 'Shoes_Loafer', '#3b2a20', strength=0.85)
    knit(v, 'Tops_Sweater', period=12, depth=0.16)   # 粗針直紋（原本 5 px＝約 5 mm，太細）
    recolor_mat(v, 'Tops_Sweater', '#dccfb6', strength=0.9, keep_detail=0.8)   # 米色（原本在遊戲光線下接近白色）
    print('  heroine_01: maroon inner px -> skin', body_tex_replace(v, is_maroon, lambda med: med))
    print('  heroine_01: painted inner tris', paint_skin(v, '#e3d8c6', joints=('Spine', 'Chest', 'Bust', 'Shoulder', 'UpperArm'), y_max=1.262))   # V 領裡面（1.272 以上）保留皮膚色
    vkeep = lambda P: (P[:, 2] < 0) & (P[:, 1] > vedge(P) - 0.02) & (np.abs(P[:, 0]) < 0.085)
    print('  heroine_01: culled skin under top', hide_covered(v, garment_of(v, 'Tops_Sweater'), max_d=0.11, eps=0.04, max_tan=0.055, skip_joints=('Shoulder', 'UpperArm', 'Chest'),
                                                             keep_fn=lambda P: vkeep(P) | (np.abs(P[:, 0]) > 0.33)))
    recolor_mat(v, 'HAIR', '#3a2619', strength=0.9, keep_detail=1.0)
    # 頭髮（在衣服之後：碎髮要垂在衣服前面）
    fm = face_marks(v); B = surface_verts(v, ('Tops_Sweater', 'SKIN'))
    bang = lambda st: st['tip'][2] < -0.06 and abs(st['root'][0]) < 0.016 and st['root'][1] > 1.62 and st['tip'][1] > 1.43
    print('  heroine_01: bangs trimmed', edit_strands(v, bang, trim_fn(fm['brow_lo'] + 0.004, 0.12)))
    print('  heroine_01: side curtain trimmed', edit_strands(v, lambda st: abs(st['tip'][0]) > 0.075 and -0.02 < st['tip'][2] < 0.01 and st['root'][2] > 0.05 and st['tip'][1] < 1.5, trim_fn(1.505, 0.2)))
    print('  heroine_01: nape trimmed', edit_strands(v, lambda st: st['root'][2] > 0.08 and st['tip'][1] < 1.46 and abs(st['tip'][0]) < 0.075, trim_fn(1.455, 0.3)))
    print('  heroine_01: side locks draped', edit_strands(v, lambda st: 0.058 < abs(st['tip'][0]) < 0.075 and st['tip'][2] < -0.06 and st['tip'][1] < 1.405 and st['nt'] > 200, drape_fn(1.25, B)))
    print('  heroine_01: ponytail reshaped verts', reshape_ponytail(v, v._ponytail))
    print('  heroine_01: ponytail joints', add_ponytail_chain(v, v._ponytail))   # 塑形之後才加骨頭（骨頭沿著新的馬尾）
    # 臉
    print('  heroine_01: eye verts scaled', scale_eyes(v, 0.82, 0.78))   # 原本 0.88／0.86（眼睛約臉寬 1/4.4 → 約 1/5）
    print('  heroine_01: face slim verts', face_slim(v, narrow=0.08, chin=0.007))
    print('  heroine_01: nose bridge verts', nose_bridge(v, 0.005, half_w=0.016))
    no_outline(v, 'Tops_Sweater')
    no_hair_shine(v); soften_matcap(v)
    return finish(v, FEMALE_EYES, '#4a3226', '沈以安（法條之外）', 'Based on VRoid CC0 samples "HairSample_Female" + sweater/trousers from "HairSample_Male" + loafers from "Sendagaya Shino" (pixiv); modified for 法條之外')


def build_heroine_02():
    """林芷若（黑色及肩微捲髮、側分瀏海、細框眼鏡、亞麻米色系、工作時圍裙、銀色小耳環、161cm；參考圖 03／05）。
    臉＋頭髮：Victoria_Rubin（拿掉側馬尾與髮飾、染黑）；上衣：HairSample_Female 的上衣（女生身形、米色亞麻）；褲子：淺灰直筒寬褲；鞋：樂福鞋；
    眼鏡、耳環、圍裙是遊戲內配件（src/props3d.js）。
    v9.4 第一輪（CHARACTER_REVIEW 第 6 節）：舊版是過肩直髮＋厚齊瀏海壓在眼鏡上、耳朵被蓋住（耳環看不到）、燈籠長袖＋腰間蝴蝶結（像荷葉邊襯衫）、
    眼睛占臉寬 26%。改成：瀏海從左邊分線往兩側撥開、頭髮剪到肩上（連彈簧骨一起剪）、右邊撥到耳後露出耳朵、髮尾微捲；
    袖子剪到手肘上方反摺（參考圖的短袖亞麻衫）、拿掉腰間蝴蝶結、下襬收合身；眼睛縮小、鼻樑；褲子的反光皺褶變淡。"""
    v = src('Victoria_Rubin'); hsf = src('HairSample_Female'); shino = src('Sendagaya_Shino'); donor = src('HairSample_Male')
    print('  heroine_02: hair prims dropped', hair_drop(v, lambda x: (x[1][0] < -0.145) or ('HAIR_03' in v.j['materials'][x[0]['material']]['name'])
                                                     or (x[2][1] > 1.72 and x[2][0] < -0.045 and x[3] < 220)))   # 側馬尾的髮束（含舊版漏掉、在頭頂翹起來的兩束）
    # 頭髮（順序：先撥瀏海、再剪短、再撥到耳後、最後捲；剪短會移動彈簧骨，撥到耳後的頂點改綁頭骨）
    print('  heroine_02: bangs swept (strands, rigid)', sweep_bangs(v, part_deg=-15, major_deg=-55, minor_deg=50, lift_major=(-0.2, -0.35), lift_minor=-0.2))   # 往兩側撥、髮尾拉長到眼鏡外側（髮尾往上收會在額頭排成一排鋸齒；4 種變體比較見 CHARACTER_REVIEW 第 6 節）
    print('  heroine_02: hair shortened, joints moved', shorten_hair_rig(v, 1.50, 0.62))
    print('  heroine_02: right side tucked behind ear', tuck_behind_ear(v, side=1))
    print('  heroine_02: wave verts', wave_bob(v, amp=0.008, lam=0.075, tamp=0.005, flare=0.010))
    print('  heroine_02: hairline px', paint_hairline(v, '#1d1819', y0=1.655, k=0.6))   # 瀏海撥開後露出的額頭上方塗成髮色（平滑的髮際線）
    remove_prims(v, ['Tops', 'F00_002_01_Shoes'])
    mi, tp = transplant(v, hsf, 'Tops', 'F00_904_Tops_Linen_CLOTH')
    print('  heroine_02: waist bow parts dropped', drop_small_parts(v, 'Tops_Linen', max_tris=60, front_z=-0.10))   # 腰間的蝴蝶結（參考圖是素面亞麻衫）
    waist = joint_y(v, 'Hips') + 0.07
    cut_below(v, 'Tops_Linen', waist)
    neck_cut = joint_y(v, 'Neck') - 0.03
    print('  heroine_02: round neckline tris', crew_neck(v, 'Tops_Linen', neck_cut, x_max=0.12, slope=1.0))   # 參考圖：開領上衣（原本是荷葉邊高領）；要在 hide_covered 之前剪，脖子的皮膚才不會被當成「被衣服蓋住」刪掉
    print('  heroine_02: sleeves cut', cut_sleeves(v, 'Tops_Linen', 0.12, clean=True, extra=('TipSleeve', 'LowerSleeve')))   # 燈籠袖剪到上臂，再接一段到手肘上方的反摺袖
    el = joint_world(v, 'J_Bip_R_LowerArm')[0, 3]; ha = joint_world(v, 'J_Bip_R_Hand')[0, 3]
    cuff_x = el - 0.14 * (ha - el)
    print('  heroine_02: rolled sleeves', extend_sleeves(v, 'Tops_Linen', end_frac=-0.14, clearance=0.016, roll_w=0.035, roll_bulge=0.008))
    print('  heroine_02: hem fitted', fit_to_body(v, 'Tops_Linen', keep=0.55, gap=0.024, y_max=1.13))   # 下襬原本是撐開的荷葉邊
    recolor_mat(v, 'Tops_Linen', '#d6c6aa', strength=0.88, keep_detail=0.9)
    print('  heroine_02: maroon inner px -> skin', body_tex_replace(v, is_maroon, lambda med: med))
    paint_skin(v, '#ddd0b9', joints=('Spine', 'Chest', 'Bust', 'Shoulder'), y_max=joint_y(v, 'Neck') - 0.045)
    hide_covered(v, garment_of(v, 'Tops_Linen'), max_d=0.1, eps=0.04, max_tan=0.05, skip_joints=('Shoulder', 'UpperArm'),
                 y_keep=lambda P: neck_cut - 0.025 + 1.0 * np.maximum(0, np.abs(P[:, 0]) - 0.045) + np.where(P[:, 2] > 0, 0.012, 0.0),   # 領口線以上（往下 2.5 cm 內）的皮膚留著
                 keep_fn=lambda P: np.abs(P[:, 0]) > cuff_x - 0.03)   # 袖口往內 3 cm 以外的前臂、手留著
    print('  heroine_02: culled under pants', wide_pants(v, donor, 'F00_901_Bottoms_Pants_CLOTH', '#9f998e', amount=0.04, straight=True, start=0.12, keep_detail=0.38))   # keep_detail 低：褲子貼圖畫的緞面反光、縫線變淡
    mi, sh = transplant(v, shino, 'Shoes', 'F00_903_Shoes_Loafer_CLOTH'); hide_covered(v, sh)
    recolor_mat(v, 'Shoes_Loafer', '#3a2a22', strength=0.85)
    recolor_mat(v, 'HAIR', '#161314', strength=0.92, keep_detail=0.9); hair_factor_reset(v, shade=(0.7, 0.68, 0.7))
    face_line_colors(v, '#2a2422', '#211b19')   # Victoria 原本是金髮，眉毛是淺米色
    swap_image(v, hsf, 'EyeHighlight')           # Victoria 的眼睛反光是青色點點，換成一般白色反光
    print('  heroine_02: eye verts scaled', scale_eyes(v, 0.80, 0.74), 'nose', nose_bridge(v, 0.004),
          'springs tamed', tame_springs(v), 'arm colliders off', hair_colliders_body_only(v))
    no_hair_shine(v); soften_matcap(v)
    return finish(v, FEMALE_EYES, '#3e2c24', '林芷若（法條之外）', 'Based on VRoid CC0 samples "Victoria Rubin" + top from "HairSample_Female" + loafers from "Sendagaya Shino" + trousers from "HairSample_Male" (pixiv); modified for 法條之外')


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
    """陳語彤（黑色齊肩直髮、髮尾內彎、深色 T 恤、牛仔褲、後背包、159cm；參考圖 03／05）。
    臉＋頭髮：Sendagaya_Shibu（齊肩鮑伯，本來就是髮尾內彎）；拿掉制服上衣、領結、百褶裙；身體貼圖透明區補成膚色；
    T 恤：HairSample_Male 的連帽上衣拿掉帽子／抽繩／口袋線、袖子剪短；牛仔褲：HairSample_Male 長褲；白球鞋：HairSample_Female；後背包是遊戲內配件。
    v9.4 第一輪（CHARACTER_REVIEW 第 7 節）：舊版左邊是原樣本「用髮夾夾到耳後」的設計（髮夾拿掉了、夾到耳後的短髮還在）→ 左耳整個露出、
    左額頭缺一塊瀏海；頭髮只到下巴（前長後短）；寬一字領露出鎖骨，領口正中間的「黑色小蝴蝶結」其實是胸口皮膚被刪掉後看進軀幹裡的洞；
    oversize 喇叭袖；鞋底比腳底低 5 cm（像厚底鞋）。改成：右側的髮束鏡射到左側、補一束瀏海、依方位拉到齊肩、圓領收到脖子、
    胸口皮膚留著、T 恤合身、鞋底壓薄、牛仔褲霧面中藍灰、眼睛縮小、臉稍微收、鼻樑。"""
    v = src('Sendagaya_Shibu'); donor = src('HairSample_Male'); hsf = src('HairSample_Female')
    remove_prims(v, ['AccessoryNeck', 'Bottoms', 'Tops', 'F00_001_01_Shoes', 'Hair_00_HAIR_02'])   # HAIR_02：前面的 7 字髮夾（參考圖沒有）
    # 頭髮：先拿掉夾到耳後的短髮、鏡射、補瀏海，最後才拉長（拉長才會套到鏡射出來的髮束）
    print('  heroine_03: tucked strands dropped', hair_drop(v, lambda x: x[1][1] > 1.45 and x[1][0] < -0.09 and x[3] < 400))
    print('  heroine_03: mirrored strands', mirror_hair_strands(v, missing_mirror_picker(v))[0])
    print('  heroine_03: center bang cloned', mirror_hair_strands(v, lambda s: s['mn'][1] > 1.47 and abs(s['xmean']) < 0.008 and s['mn'][2] < -0.105, offset=(-0.013, 0.0, 0.002))[0])
    print('  heroine_03: strands lengthened', len(hair_length_by_angle(v, bob_target(back=1.285, side=1.318, front=1.300))))   # 後面到肩胛上緣、兩側碰到肩膀；只拉長、不縮短（後背包要一起往下移，見 props3d 的 drop）
    print('  heroine_03: transparent skin px filled', body_alpha_fill(v))
    mi, tee = transplant(v, donor, 'Tops', 'F00_909_Tops_Tee_CLOTH')
    print('  heroine_03: tee hood', uv_cull(v, 'Tops_Tee', HOOD_RECTS), 'strings', drop_small_parts(v, 'Tops_Tee', 600, front_z=-0.05), 'sleeve tris cut', cut_sleeves(v, 'Tops_Tee', 0.12, clean=True))   # 袖子到上臂中段
    print('  heroine_03: crew neck tris', crew_neck(v, 'Tops_Tee', joint_y(v, 'Neck') - 0.012, slope=1.2, cap=0.004))   # 帽口那圈立領剪掉
    print('  heroine_03: neckline strip uv', neck_strip_uv(v, 'Tops_Tee', joint_y(v, 'Neck') - 0.03))
    uv_cull(v, 'Tops_Tee', [(0.05, 0.915, 0.95, 1.0)])   # 拿掉羅紋下擺（T 恤是平口）
    print('  heroine_03: tee fitted', fit_to_body(v, 'Tops_Tee', keep=0.4, gap=0.012))   # 要在剪下擺之前（反過來的話，收合身會把平的下擺拉成波浪）
    print('  heroine_03: collar fitted', crew_collar_fit(v, 'Tops_Tee', joint_y(v, 'Neck') - 0.008))   # 寬一字領 → 貼脖子的圓領（順著肩膀斜面往上滑，不會插進斜方肌）
    print('  heroine_03: neckline smoothed', smooth_neckline(v, 'Tops_Tee', joint_y(v, 'Neck') - 0.06, x_max=0.11))   # 剪口的鋸齒 → 平順的領口線
    hem = joint_y(v, 'Hips') - 0.01
    cut_below(v, 'Tops_Tee', hem); print('  heroine_03: tee hem flattened', flatten_hem(v, 'Tops_Tee', hem))   # 下擺在臀部、蓋住褲頭
    smooth_region(v, 'Tops_Tee', POCKET_RECT); smooth_normals_region(v, 'Tops_Tee', POCKET_RECT)
    fill_from_row(v, 'Tops_Tee', NECK_V_RECT, NECK_V_RECT[3] + 0.004)   # 領口正中間的深色 V 形（連帽上衣帽子兩邊在胸前交疊的陰影，畫在貼圖上）
    recolor_mat(v, 'Tops_Tee', '#333338', strength=0.9, keep_detail=0.8)   # 參考圖是接近黑的炭灰（舊的 #3a3b40 在白天看起來是中灰）
    nk = joint_y(v, 'Neck')
    paint_skin(v, '#2f3034', joints=('Spine', 'Chest', 'Bust', 'Shoulder'), y_max=nk - 0.09)
    hide_covered(v, garment_of(v, 'Tops_Tee'), max_d=0.1, eps=0.04, max_tan=0.05, skip_joints=('Shoulder', 'UpperArm'),
                 y_keep=lambda P: np.where(P[:, 2] < 0.0, nk - 0.075, nk - 0.004))   # 領口正下方的胸口皮膚留著：刪掉的話從斜上方看進領口是軀幹裡面（#34 的「黑色小蝴蝶結」）
    mi, added = transplant(v, donor, 'Bottoms', 'F00_901_Bottoms_Jeans_CLOTH')
    flare(v, 'Bottoms_Jeans', amount=0.02, start=0.15, straight=True)
    print('  heroine_03: culled under jeans', hide_covered(v, garment_of(v, 'Bottoms_Jeans')))
    recolor_mat(v, 'Bottoms_Jeans', '#5d6f86', strength=0.9, keep_detail=0.55)   # 水洗中藍灰、霧面（舊版是發亮的寶藍色）
    mi, sh = transplant(v, hsf, 'Shoes', 'F00_905_Shoes_Sneaker_CLOTH')
    print('  heroine_03: soles squashed', squash_soles(v, 'Shoes_Sneaker', 0.016, 0.35))   # HairSample_Female 的鞋底在 Shibu 腳底下 5 cm（像厚底鞋，整個人也被縮小）
    hide_covered(v, garment_of(v, 'Shoes_Sneaker'))   # 用壓過的新位置
    recolor_mat(v, 'Shoes_Sneaker', '#efece6', strength=0.85, keep_detail=0.7)
    recolor_mat(v, 'HAIR', '#1a1614', strength=0.9, keep_detail=0.9); hair_factor_reset(v, shade=(0.7, 0.68, 0.7))   # 黑髮（原本材質乘深藍，帶藍色調）
    face_line_colors(v, '#221d1b', '#1c1716')   # 眉毛原本是深藍色
    print('  heroine_03: eye verts scaled', scale_eyes(v, 0.80, 0.76), 'slim', face_slim(v, narrow=0.04, chin=0.004), 'nose', nose_bridge(v, 0.005, half_w=0.016),
          'springs tamed', tame_springs(v), 'arm colliders off', hair_colliders_body_only(v))
    no_hair_shine(v); soften_matcap(v)
    return finish(v, FEMALE_EYES, '#3a2a22', '陳語彤（法條之外）', 'Based on VRoid CC0 samples "Sendagaya Shibu" + top/jeans from "HairSample_Male" + sneakers from "HairSample_Female" (pixiv); modified for 法條之外')


def build_heroine_04():
    """高子晴（耳下短髮、深棕、明亮有精神、oversize 連帽外套、短褲、球鞋、169cm、吉他袋）。
    臉＋頭髮：Vita（拿掉頭上的科幻角飾、臉頰花紋用膚色補掉、貓眼虹膜換成 Shibu 的圓瞳、頭髮染深棕）；
    連帽外套：HairSample_Male（女生穿就是 oversize）；短褲：HairSample_Male 長褲剪到大腿；腿上畫的科幻褲襪改回膚色；白球鞋：HairSample_Female；吉他袋是遊戲內配件。"""
    v = src('Vita'); donor = src('HairSample_Male'); hsf = src('HairSample_Female'); shibu = src('Sendagaya_Shibu')
    print('  heroine_04: horn prims', hair_drop(v, lambda x: 'HAIR_03' in v.j['materials'][x[0]['material']]['name']))
    print('  heroine_04: ahoge prims', hair_drop(v, lambda x: x[1][1] > 1.66 and x[3] < 100))   # 頭頂翹起的兩撮呆毛（參考圖沒有）
    remove_prims(v, ['Onepiece', 'F00_002_01_Shoes', 'Tops'])
    print('  heroine_04: face marking px', inpaint_face_markings(v, warm_check=True, dilate=11))   # 臉頰的科幻花紋（含淡綠光暈與描邊殘影）
    swap_image(v, shibu, 'EyeIris')
    paint_skin(v, '#f1d6c3', joints=('UpperLeg', 'LowerLeg', 'Foot', 'Toe'))
    paint_skin(v, '#f1d6c3', joints=('LowerArm', 'Hand', 'Thumb', 'Index', 'Middle', 'Ring', 'Little'))   # 手套殘影（手背、手指）
    paint_skin(v, '#f1d6c3', joints=('Hips',))   # 原本的深色緊身褲：大腿內側會在短褲下面露出一塊深色
    print('  heroine_04: hair below neck cut', cut_hair_below(v, joint_y(v, 'Neck') - 0.01))
    mi, hood = transplant(v, donor, 'Tops', 'F00_906_Tops_Hoodie_CLOTH')
    print('  heroine_04: hood lowered verts', lower_hood(v, 'Tops_Hoodie', HOOD_RECTS))   # 帽子放下來（原本立在後腦、兩側帽緣到臉頰高度，從頭髮縫隙露出白邊）
    hood = garment_of(v, 'Tops_Hoodie')
    hide_covered(v, hood, max_d=0.09, eps=0.03, max_tan=0.035)
    recolor_mat(v, 'Tops_Hoodie', '#b3b6ba', strength=0.9)   # 淺灰（#c3c6c9 在遊戲光線下看起來是全白）
    mi, pants = transplant(v, donor, 'Bottoms', 'F00_907_Bottoms_Shorts_CLOTH')
    knee = joint_y(v, 'LowerLeg'); hip = joint_y(v, 'UpperLeg')
    cut_below(v, 'Bottoms_Shorts', hip - (hip - knee) * 0.55)
    print('  heroine_04: hem verts flattened', flatten_hem(v, 'Bottoms_Shorts', hip - (hip - knee) * 0.55))
    hide_covered(v, garment_of(v, 'Bottoms_Shorts'))
    recolor_mat(v, 'Bottoms_Shorts', '#2f3035', strength=0.92, keep_detail=0.85)   # 參考圖：黑色牛仔短褲
    print('  heroine_04: crotch curtain tris', remove_center_curtain(v, 'Bottoms_Shorts', hip - 0.06) + remove_center_curtain(v, 'Bottoms_Shorts', hip - 0.075, x_thr=0.034))
    mi, sh = transplant(v, hsf, 'Shoes', 'F00_905_Shoes_Sneaker_CLOTH'); hide_covered(v, sh)
    recolor_mat(v, 'Shoes_Sneaker', '#ecebe8', strength=0.6)
    recolor_mat(v, 'HAIR', '#3b281d', strength=0.95, keep_detail=0.8, s_max=1.15); hair_factor_reset(v)   # 髮尾不要白（帽口像毛邊）、HAIR_02 原本乘淺藍
    face_line_colors(v, '#3b2a1f', '#2b201b')   # 原本是淺藍灰色的眉毛與眼線
    print('  heroine_04: springs tamed', tame_springs(v, grav=0.7, stiff_max=0.6))
    no_hair_shine(v); soften_matcap(v)
    return finish(v, FEMALE_EYES, '#4a3226', '高子晴（法條之外）', 'Based on VRoid CC0 samples "Vita" + hoodie/shorts from "HairSample_Male" + sneakers from "HairSample_Female" + iris from "Sendagaya Shibu" (pixiv); modified for 法條之外')


def build_heroine_05():
    """溫書瑀（深棕低馬尾、白襯衫、卡其長褲、樂福鞋、172cm、判決節錄）。
    臉＋頭髮：Sendagaya_Shino（長直髮沿著頭的弧面收到後頸、綁成一束低馬尾沿背垂下；臉旁長髮剪到下巴；染深棕；髮圈是遊戲內配件）；
    白襯衫：Sakurada_Fumiriya 的短袖襯衫（背心區塊重畫成白襯衫），袖子接長到前臂、做反摺袖口；卡其寬褲；自己的樂福鞋；判決節錄是遊戲內配件。"""
    v = src('Sendagaya_Shino'); fumi = src('Sakurada_Fumiriya'); donor = src('HairSample_Male')
    n, tie, hj = low_ponytail(v)
    print('  heroine_05: low ponytail verts', n, 'tie (file)', np.round(tie, 3), 'tie - head joint (給 src/props3d.js 的髮圈)', np.round(np.array(tie) - np.array(hj), 3))
    print('  heroine_05: low ponytail joints (彈簧骨，走路會擺動)', low_ponytail_chain(v))
    remove_prims(v, ['AccessoryNeck', 'Bottoms', 'Tops'])
    mi, sh = transplant(v, fumi, 'Tops', 'F00_908_Tops_Shirt_CLOTH')
    paint_white_shirt(v, 'Tops_Shirt')   # 背心區塊塗白、畫門襟鈕扣（舊版只把背心區塊淡化，線條還在）
    print('  heroine_05: rolled long sleeves tris', extend_sleeves(v, 'Tops_Shirt'))   # 參考圖：長袖反摺到前臂（樣本只有短袖）
    no_outline(v, 'Tops_Shirt')          # 背心的 V 領與袖口是模型折線，描邊會把它畫成線：白襯衫不畫描邊
    shade_color(v, 'Tops_Shirt', 0.84, (0.95, 0.965, 1.0))   # 陰影偏冷灰（原本偏粉紅，白襯衫看起來像粉色）
    remove_prims(v, ['Hair_00_HAIR_02'])  # Shino 的 X 形髮夾（參考圖的溫書瑀沒有）
    print('  heroine_05: shirt normals smoothed', smooth_normals_region(v, 'Tops_Shirt', (0.0, 0.0, 1.0, 1.0)))
    hide_covered(v, garment_of(v, 'Tops_Shirt'), max_d=0.09, eps=0.035, max_tan=0.035)
    print('  heroine_05: culled under pants', wide_pants(v, donor, 'F00_901_Bottoms_Pants_CLOTH', '#b8aa8e', amount=0.05, straight=True))   # 參考圖：高腰直筒寬褲（不是喇叭褲）
    recolor_mat(v, 'Shoes', '#2f2622', strength=0.8)
    recolor_mat(v, 'HAIR', '#4a3427', strength=0.92, keep_detail=0.88); hair_factor_reset(v)   # 深棕（原本材質乘了深藍色，貼圖再怎麼改都是黑色）
    face_line_colors(v, '#3d2b22', '#2b201b')   # 眉毛跟著深棕髮色（原本乘深藍）
    no_hair_shine(v); soften_matcap(v); tame_springs(v, grav=0.6, stiff_max=0.75); hair_colliders_body_only(v)
    return finish(v, FEMALE_EYES, '#3a2a22', '溫書瑀（法條之外）', 'Based on VRoid CC0 samples "Sendagaya Shino" + shirt from "Sakurada Fumiriya" + trousers from "HairSample_Male" (pixiv); modified for 法條之外')


AMB_SIZES = dict(DEFAULT_SIZES, Body=512, Tops=512, Onepiece=512, Bottoms=256, Hair=256, HairBack=256, Face_00=512)
# 路人底模：衣服、頭髮烘成淺中性色，遊戲裡依每個 NPC 原本的穿搭顏色用材質顏色相乘（共用貼圖，不另外下載）
AMB_BASE = {'hair': '#8a6a52', 'top': '#e6e3de', 'bottom': '#cfcbc4'}


def finish_amb(v, eyes, title, note):
    outline_tone(v)
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


BUILDS = {'vroid_yuting': build_yuting, 'vroid_heroine_01': build_heroine_01, 'vroid_zhe': build_zhe, 'vroid_heroine_02': build_heroine_02, 'vroid_heroine_03': build_heroine_03,
          'vroid_heroine_04': build_heroine_04, 'vroid_heroine_05': build_heroine_05,
          'vroid_npc_f1': build_npc_f1, 'vroid_npc_f2': build_npc_f2, 'vroid_npc_m1': build_npc_m1, 'vroid_npc_m2': build_npc_m2}

if __name__ == '__main__':
    args = sys.argv[1:]
    if '--out' in args:   # 試作版輸出到別的資料夾（例如 tools/vroid_wip/，用 test_charlook.html?file=… 比較），不覆蓋遊戲用的模型
        i = args.index('--out'); OUT = os.path.join(ROOT, args[i + 1]); del args[i:i + 2]
    want = args or list(BUILDS)
    os.makedirs(OUT, exist_ok=True)
    for k in want:
        v = BUILDS[k]()
        n = v.save(os.path.join(OUT, k + '.vrm'))
        print(k, round(n / 1e6, 2), 'MB')
