"""烘焙以後把 GPU instancing 節點的名字、extras 照原檔補回去（LAWWW2-B 2026-11-07，轉角唱片光照烘焙；bake_gg_new.sh corner）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/glb_fix_instnames.py 原檔.glb 烘好的.glb
為什麼：bake_room.py --keep-instances 用 Blender 重新匯出時，EXT_mesh_gpu_instancing 的節點叫「<根節點>.N」、沒有自訂屬性
  （corner_interior.py 匯出時用 fix_instanced_names 補過一次：名字＝網格名＋_inst、牆上的補 extras.dir／at）。
  遊戲的牆淡出（/WALL_/）、天花板上的東西（/^CEIL_/）都看節點名字，名字掉了，架上的音響、投射燈就不會淡出、不會藏。
做法：烘好的檔裡每個 instancing 節點，名字改成「網格名＋_inst」；原檔有同名的 instancing 節點就把它的 extras 抄過來。
  只改節點的 name、extras，不動幾何、材質、變換；改完列出對不上的（原檔有、烘好的沒有）。
--match（11-08 LAWWW2-B，新生南路 bake_xs.sh）：原檔的名字不是「網格名＋_inst」的時候用（BB 的大口二樓叫 dakou_2f.N、大步牆上的鞋子叫 WALL_left_shoes.N——
  照「網格名＋_inst」改，鞋子就沒有 WALL_、不跟牆淡出）。改成用「實例個數、第一個實例的位置、節點位置、頂點數」比對原檔的節點，名字、extras 整個照原檔抄；
  比對不到的照舊用「網格名＋_inst」，最後列出對不上的。"""
import json, struct, sys


def read(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]
    return b, json.loads(b[20:20 + n]), b[20 + n:]


def sig(J, bin_, nd):
    """比對用：實例個數、第一個實例的位置、節點位置、頂點數（四捨五入到 mm）"""
    import numpy as np
    a = J['accessors'][nd['extensions']['EXT_mesh_gpu_instancing']['attributes']['TRANSLATION']]; v = J['bufferViews'][a['bufferView']]
    t0 = np.frombuffer(bin_, dtype=np.float32, count=3, offset=v.get('byteOffset', 0) + a.get('byteOffset', 0))
    nv = sum(J['accessors'][p['attributes']['POSITION']]['count'] for p in J['meshes'][nd['mesh']]['primitives'])
    return (a['count'], tuple(round(float(x), 3) for x in t0), tuple(round(float(x), 3) for x in nd.get('translation', [0, 0, 0])), nv)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; match = '--match' in sys.argv
    src, dst = args[0], args[1]
    _, S, srest = read(src); b, J, rest = read(dst)
    inst = lambda nd: 'EXT_mesh_gpu_instancing' in nd.get('extensions', {})
    ref = {nd['name']: nd.get('extras') for nd in S['nodes'] if inst(nd)}
    bysig = {}
    if match:
        for nd in S['nodes']:
            if inst(nd): bysig.setdefault(sig(S, srest[8:], nd), []).append(nd)
    done, seen = 0, set()
    for nd in J['nodes']:
        if not inst(nd): continue
        hit = bysig.get(sig(J, rest[8:], nd)) if match else None
        if hit and len(hit) == 1:   # 原檔的名字、extras 整個抄過來
            o = hit[0]; nd['name'] = o['name']; seen.add(o['name']); done += 1
            if o.get('extras'): nd['extras'] = o['extras']
            elif 'extras' in nd: del nd['extras']
            continue
        nm = J['meshes'][nd['mesh']]['name'] + '_inst'; nd['name'] = nm; seen.add(nm); done += 1
        if ref.get(nm): nd['extras'] = ref[nm]
        elif 'extras' in nd and not nd['extras']: del nd['extras']
    miss = sorted(set(ref) - seen)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    out = b[:12] + struct.pack('<I', len(js)) + b'JSON' + js + rest
    out = out[:8] + struct.pack('<I', len(out)) + out[12:]; open(dst, 'wb').write(out)
    print('instancing 節點補名字', done, '個；原檔有、烘好的沒有：', miss or '無')
    if miss: sys.exit(1)


if __name__ == '__main__':
    main()
