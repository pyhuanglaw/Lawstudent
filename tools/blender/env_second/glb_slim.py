#!/usr/bin/env python3
"""GLB 縮小（PERF-COLD-RT，LAWWW2-B 2026-11-07；CC-B PERF_COLD_RT：第一次進溫州街，慢在下載 wenzhou_street.glb 13.6 MB）。
不改節點、不改位置、不改貼圖，遊戲端不用改程式：
  - 法線 NORMAL：32 位元浮點 → 8 位元（normalized BYTE，每個頂點 4 bytes；KHR_mesh_quantization，three.js 的 GLTFLoader 本來就支援）
  - 頂點色 COLOR_0（浮點）→ 0～255（normalized UNSIGNED_BYTE，每個頂點 4 bytes；glTF 本來就允許）
  - 不受光的材質（KHR_materials_unlit）的法線直接拿掉（MeshBasicMaterial 不用）——用 --keep-unlit-normals 保留
  - 少編幾個 shader（PERF-WZ-SHADERS，同一天）：alpha 全是 1 的 VEC4 頂點色改 VEC3；只有自發光貼圖、底色是黑的材質，底色貼圖接同一張；--single 指定的材質改單面
位置 POSITION、UV、索引都不動（位置量化要改節點的變換，招牌、門牌是照幾何大小畫字的）。
遊戲會自己改幾何的板面整個不碰（--exclude，預設 PLATE_FACE_／SIGN_FACE_／VSIGN_FACE_／INTERIOR_FACE_：zones3d.js 的 wzSplitQuadU、wzAtlasFaces
  把它們切塊、合成 atlas 網格，合併時每一塊的格式要一樣）。共用同一個 accessor 的、有一個不能轉，那一個就不轉。
頂點色是線性值，0～255 在很暗的顏色差比較多：每個 accessor 換算回 sRGB 的最大誤差超過 --max-srgb（預設 1.5/255）就改用 16 位元（每個頂點 8 bytes）。
用法：python3 -I tools/blender/env_second/glb_slim.py <in.glb> <out.glb> [--exclude 正規式] [--keep-unlit-normals] [--max-srgb 1.5]
驗證：tools/blender/env_second/glb_vc_compare.py 舊 新（每個三角形實際的顏色、粗糙度、金屬度、投影一樣）。"""
import sys, json, struct, re
import numpy as np


def arg(k, d=None):
    a = sys.argv
    return a[a.index(k) + 1] if k in a else d


CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT2': 4, 'MAT3': 9, 'MAT4': 16}


def read(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n])
    o = 20 + n; bn = struct.unpack('<I', b[o:o + 4])[0]
    return j, b[o + 8:o + 8 + bn]


def acc_arr(j, binc, i):
    a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; dt = CT[a['componentType']]; n = NC[a['type']]
    es = np.dtype(dt).itemsize * n; st = bv.get('byteStride') or es; off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    raw = np.frombuffer(binc, np.uint8, count=st * (a['count'] - 1) + es, offset=off)
    rows = np.lib.stride_tricks.as_strided(raw, shape=(a['count'], es), strides=(st, 1)).copy()
    arr = rows.view(dt).reshape(a['count'], n).astype(np.float64)
    if a.get('normalized'): arr = arr / float(np.iinfo(dt).max) if np.issubdtype(dt, np.unsignedinteger) else np.maximum(arr / float(np.iinfo(dt).max), -1.0)
    return arr


def srgb(x):
    x = np.clip(x, 0, 1); return np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(x, 1 / 2.4) - 0.055)


EXCLUDE = r'^(PLATE_FACE_|V?SIGN_FACE_|INTERIOR_FACE_)'


def slim(pin, pout, exclude=EXCLUDE, keep_unlit=False, max_srgb=1.5, single=()):
    """pin → pout（可以是同一個檔：整個讀進來才寫）；回傳統計"""
    excl = re.compile(exclude); max_srgb = max_srgb / 255.0
    j, binc = read(pin); before = len(open(pin, 'rb').read())
    unlit = {i for i, m in enumerate(j.get('materials', [])) if 'KHR_materials_unlit' in (m.get('extensions') or {})}
    bad_mesh = {nd['mesh'] for nd in j['nodes'] if 'mesh' in nd and excl.search(nd.get('name', ''))}
    # 每個 accessor 被誰用：(語意, 能不能轉)
    use = {}
    for mi, m in enumerate(j['meshes']):
        for pr in m['primitives']:
            for sem, ai in pr['attributes'].items(): use.setdefault(ai, []).append((sem, mi not in bad_mesh, pr.get('material') in unlit))
            if 'indices' in pr: use.setdefault(pr['indices'], []).append(('INDICES', False, False))
            for t in pr.get('targets', []):
                for sem, ai in t.items(): use.setdefault(ai, []).append(('TARGET_' + sem, False, False))
    for nd in j['nodes']:
        for ai in ((nd.get('extensions') or {}).get('EXT_mesh_gpu_instancing') or {}).get('attributes', {}).values(): use.setdefault(ai, []).append(('INSTANCE', False, False))
    for sk in j.get('skins', []):
        if 'inverseBindMatrices' in sk: use.setdefault(sk['inverseBindMatrices'], []).append(('SKIN', False, False))
    for an in j.get('animations', []):
        for s in an['samplers']: use.setdefault(s['input'], []).append(('ANIM', False, False)); use.setdefault(s['output'], []).append(('ANIM', False, False))
    conv = {}; drop = set(); stat = {'normal_i8': 0, 'normal_drop': 0, 'color_u8': 0, 'color_u16': 0, 'skip_shared': 0, 'color_a1': 0, 'emi_as_map': 0, 'single': 0}
    for ai, us in use.items():
        sems = {u[0] for u in us}; a = j['accessors'][ai]; ok = len(sems) == 1 and all(u[1] for u in us)
        if ok and sems == {'COLOR_0'} and a['type'] == 'VEC4' and a['componentType'] != 5126:   # 已經是整數的 VEC4 頂點色：alpha 全是 1 就改 VEC3（見下面）
            v = acc_arr(j, binc, ai)
            if len(v) and v[:, 3].min() >= 0.999:
                dt = CT[a['componentType']]; out = np.zeros((len(v), 4), dt); out[:, :3] = np.round(v[:, :3] * np.iinfo(dt).max).astype(dt)
                conv[ai] = (out.tobytes(), a['componentType'], 'VEC3', 4 * np.dtype(dt).itemsize); stat['color_a1'] += 1
            continue
        if a['componentType'] != 5126 or not ok:
            if a['componentType'] == 5126 and sems & {'NORMAL', 'COLOR_0'}: stat['skip_shared'] += 1
            continue
        sem = sems.pop()
        if sem == 'NORMAL':
            if not keep_unlit and all(u[2] for u in us): drop.add(ai); stat['normal_drop'] += 1; continue
            v = acc_arr(j, binc, ai); q = np.clip(np.round(v * 127.0), -127, 127).astype(np.int8)
            out = np.zeros((len(q), 4), np.int8); out[:, :3] = q; conv[ai] = (out.tobytes(), 5120, 'VEC3', 4); stat['normal_i8'] += 1
        elif sem == 'COLOR_0':
            v = acc_arr(j, binc, ai); typ = a['type']
            if typ == 'VEC4' and len(v) and v[:, 3].min() >= 0.999: v = v[:, :3]; typ = 'VEC3'; stat['color_a1'] += 1   # PERF-WZ-SHADERS：alpha 全是 1 的 VEC4 → VEC3（three.js 的 vertexAlphas 是另一個 shader 版本）
            n = v.shape[1]; q8 = np.clip(np.round(v * 255.0), 0, 255)
            err = np.abs(srgb(q8 / 255.0) - srgb(v)).max() if len(v) else 0
            if err <= max_srgb:
                out = np.zeros((len(v), 4), np.uint8); out[:, :n] = q8.astype(np.uint8)
                conv[ai] = (out.tobytes(), 5121, typ, 4); stat['color_u8'] += 1
            else:
                q16 = np.clip(np.round(v * 65535.0), 0, 65535).astype(np.uint16); out = np.zeros((len(v), 4), np.uint16); out[:, :n] = q16
                conv[ai] = (out.tobytes(), 5123, typ, 8); stat['color_u16'] += 1
    # PERF-WZ-SHADERS（LAWWW2-B 11-07）：只有自發光貼圖、底色是黑的材質（offbeat_storefront）：底色貼圖接同一張。底色乘 0 還是 0，畫面一樣；
    #   和「底色貼圖＋自發光貼圖」的招牌（wz_signs_lit、cafe_sign_face…）變成同一個 shader，少編一次
    for m in j.get('materials', []):
        pb = m.get('pbrMetallicRoughness') or {}
        if 'emissiveTexture' in m and 'baseColorTexture' not in pb and all(abs(c) < 1e-6 for c in pb.get('baseColorFactor', [1, 1, 1, 1])[:3]):
            m.setdefault('pbrMetallicRoughness', pb)['baseColorTexture'] = json.loads(json.dumps(m['emissiveTexture'])); stat['emi_as_map'] += 1
    for m in j.get('materials', []):   # 指定改單面的材質（--single；溫州街：wz_in_price_u，wz_street.py 的單面清單也有）
        if m.get('name') in single and m.get('doubleSided'): m['doubleSided'] = False; stat['single'] += 1
    # 拿掉的法線：從 primitive 刪掉
    for m in j['meshes']:
        for pr in m['primitives']:
            if pr['attributes'].get('NORMAL') in drop: del pr['attributes']['NORMAL']
    # 重建 BIN：沒人用的 bufferView 不留；轉過的 accessor 各自一個新的 bufferView
    used_bv = set()
    for ai, a in enumerate(j['accessors']):
        if ai in conv or ai in drop or 'bufferView' not in a: continue
        used_bv.add(a['bufferView'])
    for im in j.get('images', []):
        if 'bufferView' in im: used_bv.add(im['bufferView'])
    out = bytearray(); newbv = []; remap = {}
    def put(data, **kw):
        while len(out) % 4: out.append(0)
        d = dict(buffer=0, byteOffset=len(out), byteLength=len(data)); d.update(kw); out.extend(data); newbv.append(d); return len(newbv) - 1
    for i, bv in enumerate(j['bufferViews']):
        if i not in used_bv: continue
        o = bv.get('byteOffset', 0); kw = {k: v for k, v in bv.items() if k not in ('buffer', 'byteOffset', 'byteLength')}
        remap[i] = put(binc[o:o + bv['byteLength']], **kw)
    for ai, a in enumerate(j['accessors']):
        if 'bufferView' not in a or ai in drop: continue
        if ai in conv:
            data, ct, typ, stride = conv[ai]; a['bufferView'] = put(data, byteStride=stride, target=34962); a['byteOffset'] = 0
            a['componentType'] = ct; a['type'] = typ; a['normalized'] = True; a.pop('min', None); a.pop('max', None)
        else: a['bufferView'] = remap[a['bufferView']]
    for im in j.get('images', []):
        if 'bufferView' in im: im['bufferView'] = remap[im['bufferView']]
    # 拿掉的 accessor 不刪（索引會跑掉）：改成沒有 bufferView 的空 accessor 不合規格，所以換成 1 個元素、指向最小的資料
    if drop:
        tiny = put(bytes(12), target=34962)
        for ai in drop: a = j['accessors'][ai]; a.update(bufferView=tiny, byteOffset=0, count=1, componentType=5126, type='VEC3'); a.pop('min', None); a.pop('max', None); a.pop('normalized', None)
    j['bufferViews'] = newbv; j['buffers'] = [dict(byteLength=len(out))]
    if stat['normal_i8']:
        for k in ('extensionsUsed', 'extensionsRequired'):
            j.setdefault(k, [])
            if 'KHR_mesh_quantization' not in j[k]: j[k].append('KHR_mesh_quantization')
    while len(out) % 4: out.append(0)
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(out)
    with open(pout, 'wb') as f:
        f.write(b'glTF' + struct.pack('<II', 2, total)); f.write(struct.pack('<I', len(js)) + b'JSON' + js); f.write(struct.pack('<I', len(out)) + b'BIN\0' + bytes(out))
    return dict(stat, before=before, after=total, excluded_meshes=len(bad_mesh))


if __name__ == '__main__':
    print(json.dumps(slim(sys.argv[1], sys.argv[2], arg('--exclude', EXCLUDE), '--keep-unlit-normals' in sys.argv, float(arg('--max-srgb', '1.5')), tuple(x for x in (arg('--single', '') or '').split(',') if x)), ensure_ascii=False))
