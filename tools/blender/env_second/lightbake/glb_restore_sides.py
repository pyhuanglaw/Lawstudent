"""光照烘焙以後的 GLB 後處理（不用重烘；LAWWW2-B 2026-10-31，體育館 INTERIOR-AAA）：
  python3 tools/blender/env_second/lightbake/glb_restore_sides.py 烘好的.glb 白模.glb [--drop-dayemit]
①材質的單面／雙面照白模還原：bake_room.py 用 Blender 重匯以後，有的材質單面變雙面
  （體育館大廳樓梯口指標的字面 cafe_sign_face；白模是單面：PERF-SINGLESIDE-GLB-1025，tests/singleside_gym_unit.js 第 1 項抓到）。
  只改 materials[].doubleSided，網格、貼圖、extras 不動。
②--drop-dayemit：拿掉場景 extras.lightmap.dayEmit（遊戲的區域自己照時段調那些發光面時用：體育館 1F 的高窗，gym3d.js skyLevel）。"""
import json, struct, sys


def rd(p):
    b = bytearray(open(p, 'rb').read()); n = struct.unpack('<I', b[12:16])[0]
    return b, n, json.loads(b[20:20 + n])


p, ref = sys.argv[1], sys.argv[2]
b, n, j = rd(p); _, _, pl = rd(ref)
ds = {m['name']: bool(m.get('doubleSided')) for m in pl.get('materials', [])}
fixed = []
for m in j.get('materials', []):
    if m['name'] in ds and bool(m.get('doubleSided')) != ds[m['name']]:
        fixed.append(m['name'])
        if ds[m['name']]: m['doubleSided'] = True
        else: m.pop('doubleSided', None)
dropped = False
if '--drop-dayemit' in sys.argv:
    for sc in j.get('scenes', []):
        lm = (sc.get('extras') or {}).get('lightmap')
        if lm and 'dayEmit' in lm: del lm['dayEmit']; dropped = True
s = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf8'); s += b' ' * ((4 - len(s) % 4) % 4)
rest = bytes(b[20 + n:])
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(s) + len(rest)) + struct.pack('<II', len(s), 0x4E4F534A) + s + rest
open(p, 'wb').write(out)
print('單面／雙面照白模還原', fixed, '；dayEmit 拿掉' if dropped else '', p)
