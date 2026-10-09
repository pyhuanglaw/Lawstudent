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
    print('  yuting: eye verts scaled', scale_eyes(v, 0.93, 0.9))
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


def wide_pants(v, donor, name, color, amount=0.075, straight=False, start=0.32):
    mi, added = transplant(v, donor, 'Bottoms', name)
    flare(v, name, amount=amount, straight=straight, start=start)
    n = hide_covered(v, garment_of(v, name))
    recolor_mat(v, name, color, strength=0.9)
    return n


def build_heroine_01():
    """沈以安（Character Bible：深棕長髮單一馬尾＋碎髮、針織上衣、寬褲、樂福鞋、帆布托特包、166cm；參考圖 01）。
    臉＋頭髮：HairSample_Female（拿掉貓耳、雙馬尾改成單一高馬尾並讓它自然下垂、加三節彈簧骨讓馬尾擺動、眼睛縮小）；
    上衣：HairSample_Male 的連帽上衣拿掉帽子／抽繩／口袋線 → 寬鬆米白針織衫（加針織紋、下擺紮進褲子）；
    褲子：HairSample_Male 長褲重新綁定後加寬成藍灰寬褲；鞋：Sendagaya_Shino 的樂福鞋；托特包是遊戲內配件。"""
    v = src('HairSample_Female'); donor = src('HairSample_Male'); shino = src('Sendagaya_Shino')
    print('  heroine_01: ears/left/right hair prims', ponytail_from_twintails(v, back_offset=-0.008, drop=-0.035))
    print('  heroine_01: ponytail rotated deg', round(hang_ponytail(v, v._ponytail, scale=1.3), 1))
    print('  heroine_01: ponytail joints', add_ponytail_chain(v, v._ponytail))
    remove_prims(v, ['Tops'])
    mi, sw = transplant(v, donor, 'Tops', 'F00_906_Tops_Sweater_CLOTH')
    print('  heroine_01: sweater hood tris', uv_cull(v, 'Tops_Sweater', HOOD_RECTS), 'strings', drop_small_parts(v, 'Tops_Sweater', 600, front_z=-0.05))
    print('  heroine_01: crew neck tris', crew_neck(v, 'Tops_Sweater', joint_y(v, 'Neck') - 0.012, slope=1.2))   # 帽口那圈立領（看起來像襯衫領片）→ 圓領針織衫
    smooth_region(v, 'Tops_Sweater', POCKET_RECT)
    smooth_normals_region(v, 'Tops_Sweater', POCKET_RECT)
    waist = joint_y(v, 'Hips') + 0.07
    cut_below(v, 'Tops_Sweater', waist)
    print('  heroine_01: culled under pants', wide_pants(v, donor, 'F00_901_Bottoms_Pants_CLOTH', '#596377', amount=0.045, straight=True, start=0.12))
    remove_prims(v, ['F00_002_01_Shoes'])
    mi, sh = transplant(v, shino, 'Shoes', 'F00_903_Shoes_Loafer_CLOTH'); hide_covered(v, sh)
    recolor_mat(v, 'Shoes_Loafer', '#3b2a20', strength=0.85)
    knit(v, 'Tops_Sweater', period=5, depth=0.11)
    recolor_mat(v, 'Tops_Sweater', '#e0d2bc', strength=0.88)
    print('  heroine_01: maroon inner px -> skin', body_tex_replace(v, is_maroon, lambda med: med))
    print('  heroine_01: painted inner tris', paint_skin(v, '#e3d8c6', joints=('Spine', 'Chest', 'Bust', 'Shoulder', 'UpperArm'), y_max=joint_y(v, 'Neck') - 0.045))
    print('  heroine_01: culled skin under top', hide_covered(v, garment_of(v, 'Tops_Sweater'), max_d=0.11, eps=0.04, max_tan=0.055, skip_joints=('Shoulder', 'UpperArm', 'Chest')))
    recolor_mat(v, 'HAIR', '#3a2619', strength=0.9, keep_detail=1.0)
    print('  heroine_01: eye verts scaled', scale_eyes(v, 0.88, 0.86))
    no_outline(v, 'Tops_Sweater')
    no_hair_shine(v); soften_matcap(v)
    return finish(v, FEMALE_EYES, '#5a3a26', '沈以安（法條之外）', 'Based on VRoid CC0 samples "HairSample_Female" + sweater/trousers from "HairSample_Male" + loafers from "Sendagaya Shino" (pixiv); modified for 法條之外')


def build_heroine_02():
    """林芷若（黑色及肩微捲髮、細框眼鏡、亞麻米色系、工作時圍裙、銀色小耳環、161cm；參考圖 03／05）。
    臉＋頭髮：Victoria_Rubin（拿掉側馬尾與髮飾、染黑，剩下及肩髮）；上衣：HairSample_Female 的長袖上衣（女生身形、米色亞麻）——
    不再用 Sendagaya_Shino 的制服短袖＋背心；褲子：淺灰直筒寬褲；鞋：樂福鞋；眼鏡、耳環、圍裙是遊戲內配件。"""
    v = src('Victoria_Rubin'); hsf = src('HairSample_Female'); shino = src('Sendagaya_Shino'); donor = src('HairSample_Male')
    print('  heroine_02: hair prims dropped', hair_drop(v, lambda x: (x[1][0] < -0.145) or ('HAIR_03' in v.j['materials'][x[0]['material']]['name'])
                                                     or (x[2][1] > 1.72 and x[2][0] < -0.045 and x[3] < 220)))   # 側馬尾的髮束（含舊版漏掉、在頭頂翹起來的兩束）
    remove_prims(v, ['Tops', 'F00_002_01_Shoes'])
    mi, tp = transplant(v, hsf, 'Tops', 'F00_904_Tops_Linen_CLOTH')
    waist = joint_y(v, 'Hips') + 0.07
    cut_below(v, 'Tops_Linen', waist)
    neck_cut = joint_y(v, 'Neck') - 0.03
    print('  heroine_02: round neckline tris', crew_neck(v, 'Tops_Linen', neck_cut, x_max=0.12, slope=1.0))   # 參考圖：開領上衣（原本是荷葉邊高領）；要在 hide_covered 之前剪，脖子的皮膚才不會被當成「被衣服蓋住」刪掉
    recolor_mat(v, 'Tops_Linen', '#d6c6aa', strength=0.88, keep_detail=0.9)
    print('  heroine_02: maroon inner px -> skin', body_tex_replace(v, is_maroon, lambda med: med))
    paint_skin(v, '#ddd0b9', joints=('Spine', 'Chest', 'Bust', 'Shoulder'), y_max=joint_y(v, 'Neck') - 0.045)
    hide_covered(v, garment_of(v, 'Tops_Linen'), max_d=0.1, eps=0.04, max_tan=0.05, skip_joints=('Shoulder', 'UpperArm'),
                 y_keep=lambda P: neck_cut - 0.025 + 1.0 * np.maximum(0, np.abs(P[:, 0]) - 0.045) + np.where(P[:, 2] > 0, 0.012, 0.0))   # 領口線以上（往下 2.5 cm 內）的皮膚留著
    print('  heroine_02: culled under pants', wide_pants(v, donor, 'F00_901_Bottoms_Pants_CLOTH', '#9f998e', amount=0.04, straight=True, start=0.12))
    mi, sh = transplant(v, shino, 'Shoes', 'F00_903_Shoes_Loafer_CLOTH'); hide_covered(v, sh)
    recolor_mat(v, 'Shoes_Loafer', '#3a2a22', strength=0.85)
    recolor_mat(v, 'HAIR', '#161314', strength=0.92, keep_detail=0.9); hair_factor_reset(v, shade=(0.7, 0.68, 0.7))
    face_line_colors(v, '#2a2422', '#211b19')   # Victoria 原本是金髮，眉毛是淺米色
    swap_image(v, hsf, 'EyeHighlight')           # Victoria 的眼睛反光是青色點點，換成一般白色反光
    print('  heroine_02: eye verts scaled', scale_eyes(v, 0.9, 0.88), 'springs tamed', tame_springs(v), 'arm colliders off', hair_colliders_body_only(v))
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
    T 恤：HairSample_Male 的連帽上衣拿掉帽子／抽繩／口袋線、袖子剪短 → 寬鬆深灰 T 恤（不是畫在身上的緊身衣）；
    牛仔褲：HairSample_Male 長褲（略寬的直筒）；白球鞋：HairSample_Female；後背包是遊戲內配件。"""
    v = src('Sendagaya_Shibu'); donor = src('HairSample_Male'); hsf = src('HairSample_Female')
    remove_prims(v, ['AccessoryNeck', 'Bottoms', 'Tops', 'F00_001_01_Shoes', 'Hair_00_HAIR_02'])   # HAIR_02：前面的 7 字髮夾（參考圖沒有）
    print('  heroine_03: hair verts lengthened', lengthen_hair(v, 1.45, 1.3))   # 鮑伯只到下巴 → 接近齊肩（髮尾內彎保留）
    print('  heroine_03: transparent skin px filled', body_alpha_fill(v))
    mi, tee = transplant(v, donor, 'Tops', 'F00_909_Tops_Tee_CLOTH')
    print('  heroine_03: tee hood', uv_cull(v, 'Tops_Tee', HOOD_RECTS), 'strings', drop_small_parts(v, 'Tops_Tee', 600, front_z=-0.05), 'sleeve tris cut', cut_sleeves(v, 'Tops_Tee', 0.17, clean=True))
    print('  heroine_03: crew neck tris', crew_neck(v, 'Tops_Tee', joint_y(v, 'Neck') - 0.012, slope=1.2, cap=0.004))   # 帽口那圈立領剪掉 → 貼近脖子的圓領（太低會看到後領內側，像脖子上有深色條紋；cap：兩側不留尖角）
    print('  heroine_03: neckline strip uv', neck_strip_uv(v, 'Tops_Tee', joint_y(v, 'Neck') - 0.03))   # 領口正中間的小蝴蝶結（帽子貼圖尖端的深色描邊）→ 胸口素面布料
    uv_cull(v, 'Tops_Tee', [(0.05, 0.915, 0.95, 1.0)])   # 拿掉羅紋下擺（T 恤是平口）
    print('  heroine_03: tee hem flattened', flatten_hem(v, 'Tops_Tee', joint_y(v, 'UpperLeg') - 0.05))   # 剪掉羅紋後下擺是鋸齒狀 → 收平
    smooth_region(v, 'Tops_Tee', POCKET_RECT); smooth_normals_region(v, 'Tops_Tee', POCKET_RECT)
    recolor_mat(v, 'Tops_Tee', '#3a3b40', strength=0.9, keep_detail=0.8)
    paint_skin(v, '#34353a', joints=('Spine', 'Chest', 'Bust', 'Shoulder'), y_max=joint_y(v, 'Neck') - 0.05)
    hide_covered(v, garment_of(v, 'Tops_Tee'), max_d=0.1, eps=0.04, max_tan=0.05, skip_joints=('Shoulder', 'UpperArm'))
    mi, added = transplant(v, donor, 'Bottoms', 'F00_901_Bottoms_Jeans_CLOTH')
    flare(v, 'Bottoms_Jeans', amount=0.02, start=0.15, straight=True)
    print('  heroine_03: culled under jeans', hide_covered(v, garment_of(v, 'Bottoms_Jeans')))
    recolor_mat(v, 'Bottoms_Jeans', '#506a88', strength=0.9)   # 中藍（舊的 #5f7a98 在白天看起來太淺）
    mi, sh = transplant(v, hsf, 'Shoes', 'F00_905_Shoes_Sneaker_CLOTH'); hide_covered(v, sh)
    recolor_mat(v, 'Shoes_Sneaker', '#efece6', strength=0.6)
    recolor_mat(v, 'HAIR', '#1a1614', strength=0.9, keep_detail=0.9); hair_factor_reset(v, shade=(0.7, 0.68, 0.7))   # 黑髮（原本材質乘深藍，帶藍色調）
    face_line_colors(v, '#221d1b', '#1c1716')   # 眉毛原本是深藍色
    print('  heroine_03: eye verts scaled', scale_eyes(v, 0.9, 0.88), 'springs tamed', tame_springs(v))
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
    want = sys.argv[1:] or list(BUILDS)
    os.makedirs(OUT, exist_ok=True)
    for k in want:
        v = BUILDS[k]()
        n = v.save(os.path.join(OUT, k + '.vrm'))
        print(k, round(n / 1e6, 2), 'MB')
