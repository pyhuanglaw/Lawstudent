# 從 GLB 取出嵌入的圖集 → 把拉正的招牌貼回原本那一格 → 存成 PNG 給 glb_replace_image.py（用 GLB 裡的那一張當底，不用重新產生的：別的格子一個像素都不動）
import io, json, struct, sys
sys.path.insert(0, '/tmp'); import rect as R
from PIL import Image
glb, key, atlas_json, out = sys.argv[1:5]; items = json.loads(sys.argv[5]); REF = sys.argv[6]
d = open(glb, 'rb').read(); jl = struct.unpack('<I', d[12:16])[0]; J = json.loads(d[20:20 + jl]); BIN = d[20 + jl + 8:]
im = [i for i in J['images'] if i.get('name') == key][0]; bv = J['bufferViews'][im['bufferView']]; base = Image.open(io.BytesIO(BIN[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']])).convert('RGB')
A = json.load(open(atlas_json)); W, H = base.size
for k, (ref, q) in items.items():
    u0, v0, u1, v1 = A[k][:4]; x0, y0, x1, y1 = round(u0 * W), round((1 - v1) * H), round(u1 * W), round((1 - v0) * H)
    base.paste(R.rect(REF + ref + '.webp', q, x1 - x0, y1 - y0), (x0, y0))
base.save(out); print(key, base.size, len(items))
