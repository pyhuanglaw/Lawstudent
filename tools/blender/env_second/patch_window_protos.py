"""直接改 GLB 裡共用的窗原型（不重建整個街區）：修 BUG-WZFLICKER 的兩種疊面。LAWWW2-B 2026-10-16。
  python3 tools/blender/env_second/patch_window_protos.py <glb> [<glb> ...] [--inset 0.009] [--sill 0.003] [--dry]

為什麼不重建：公館、118 巷的 GLB 是 09:00 以前建的，之後溫州街效能那幾輪改了共用的 lib2（合併、貼圖集），
現在重建出來的結構差很多（公館物件 815 → 453、材質 97 → 110），要整套重測。這個工具只動兩個原型的頂點，其他位元組不變。
- window_dark／window_lit（窗內房間）：材質名稱有 room 的那一組頂點，x、y 的四個邊往內縮 --inset。
  原本房間的地板、天花板、左右剛好在窗洞的四個側面上（同一個平面），從玻璃斜看會閃。
- window_shell（鋁框＋窗台＋雨痕）：材質名稱有 band 的那一組（窗台），最上面的頂點往上 --sill。
  原本窗台頂和窗下的牆頂同一個平面。往上 3 mm，藏在窗框下緣裡面；和縮進來的房間地板差 6 mm。
- 溫州街是用 wz_street.py 重建修的（窗內房間縮 6 mm、窗下的牆停在窗台裡面），這個工具給還沒重建的街區用。
- 做過的會在 asset.extras 記一筆，再跑一次會跳過。
"""
import json, struct, sys

A = sys.argv[1:]
def opt(k, d):
    return type(d)(A[A.index(k) + 1]) if k in A else d
INSET = opt('--inset', 0.009); SILL = opt('--sill', 0.003); DRY = '--dry' in A
FILES = [a for i, a in enumerate(A) if a.endswith('.glb') and (i == 0 or A[i - 1] not in ('--inset', '--sill'))]


def patch(path):
    b = bytearray(open(path, 'rb').read())
    jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); bin0 = 20 + jl + 8
    ex = j.setdefault('asset', {}).setdefault('extras', {})
    if 'window_proto_patch' in ex: print(path, '已經改過，跳過', ex['window_proto_patch']); return
    mats = j['materials']; acc = j['accessors']; bvs = j['bufferViews']; n_room = n_sill = 0

    def edit(ai, fn):
        a = acc[ai]; bv = bvs[a['bufferView']]; st = bv.get('byteStride', 12); off = bin0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        assert a['componentType'] == 5126 and a['type'] == 'VEC3'
        lo, hi = a['min'], a['max']; n = 0; mn = [1e9] * 3; mx = [-1e9] * 3
        for k in range(a['count']):
            o = off + k * st; v = list(struct.unpack_from('<3f', b, o)); w = fn(v, lo, hi)
            if w != v: n += 1; struct.pack_into('<3f', b, o, *w)
            for c in range(3): mn[c] = min(mn[c], w[c]); mx[c] = max(mx[c], w[c])
        a['min'], a['max'] = mn, mx; return n

    def room(v, lo, hi):
        x, y, z = v; e = 1e-4
        if x > hi[0] - e: x -= INSET
        elif x < lo[0] + e: x += INSET
        if y > hi[1] - e: y -= INSET
        elif y < lo[1] + e: y += INSET
        return [x, y, z]

    def sill(v, lo, hi):
        return [v[0], v[1] + SILL, v[2]] if v[1] > hi[1] - 1e-4 else v

    used = {}
    for m in j['meshes']:
        for p in m['primitives']: used.setdefault(p['attributes']['POSITION'], []).append(m.get('name', ''))
    for m in j['meshes']:
        nm = m.get('name', '')
        for p in m['primitives']:
            mt = mats[p['material']]['name'] if 'material' in p else ''; ai = p['attributes']['POSITION']
            if nm.startswith('window_') and nm != 'window_shell' and 'room' in mt:
                assert len(used[ai]) == 1, (nm, used[ai]); n_room += edit(ai, room)
            elif nm == 'window_shell' and 'band' in mt:
                assert len(used[ai]) == 1, (nm, used[ai]); n_sill += edit(ai, sill)
    print(path, '窗內房間頂點', n_room, '窗台頂點', n_sill)
    if DRY or not (n_room or n_sill): return
    ex['window_proto_patch'] = {'inset': INSET, 'sill': SILL, 'by': 'tools/blender/env_second/patch_window_protos.py'}
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    rest = bytes(b[20 + jl:])
    out = b[:12] + struct.pack('<I', len(js)) + b'JSON' + js + rest
    out[8:12] = struct.pack('<I', len(out))
    open(path, 'wb').write(out)


for f in FILES: patch(f)
