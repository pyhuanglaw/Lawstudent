"""把 VRM 0.x 頭髮材質（名字結尾 _HAIR）的 MatCap（MToon 的 _SphereAdd）拿掉，其他東西一個位元組都不動。
原因：VRoid 樣本的頭髮材質帶「Matcap_RimHair」（黑底、邊緣一圈亮），在遊戲的燈光下髮梢邊緣會出現一條白邊、頭頂一個白點。
新做的角色在 Blender 端就關掉了（char_second/*_hair.py：matcap_texture.index.source=None）；這支是給已經交付的 VRM 用的。
只改 glTF 的 JSON 區塊（extensions.VRM.materialProperties[*].textureProperties._SphereAdd）；貼圖、網格、骨架（BIN 區塊）原樣保留。
用法：python3 tools/char_strip_hair_matcap.py <in.vrm> [<out.vrm>]（不給 out＝覆寫）"""
import json, struct, sys


def strip(src, dst):
    b = open(src, 'rb').read(); assert b[:4] == b'glTF', src
    ln0, ty0 = struct.unpack('<II', b[12:20]); assert ty0 == 0x4E4F534A
    j = json.loads(b[20:20 + ln0]); rest = b[20 + ln0:]
    done = []
    for mp in j.get('extensions', {}).get('VRM', {}).get('materialProperties', []):
        if mp.get('name', '').endswith('_HAIR') and '_SphereAdd' in mp.get('textureProperties', {}):
            del mp['textureProperties']['_SphereAdd']; done.append(mp['name'])
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((4 - len(js) % 4) % 4)
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<II', len(js), 0x4E4F534A) + js + rest
    open(dst, 'wb').write(out)
    return done


if __name__ == '__main__':
    print(sys.argv[1], strip(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else sys.argv[1]))
