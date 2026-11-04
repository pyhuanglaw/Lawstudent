"""新生南路七家店的店面貼圖：直接從使用者給的參考圖（企劃線 docs/story_planning/ref_images/shops/*_ext.webp）裁出來、校正透視（LAWWW2 11-04，SCENE_RULES 第 12 節：參考圖就是規格）。
用法：python3 tools/blender/env_second/xs_front_tex.py <參考圖資料夾>   → tools/blender/env_second/textures/gen/xs_<店>_<部位>.jpg
每一塊是參考圖上的一個四邊形（左上、右上、右下、左下，參考圖 1672×941 的像素），校正成正面的長方形：
  sign＝招牌（貼在 3D 招牌板上）、int＝一樓玻璃後面看到的店內（景深卡，放在玻璃後 1.3 m，兩側牆、地板、天花是 3D）、
  up＝二樓的窗後面（同弦的吉他、新生運動廣場的球衣、山嵐的二樓書區、大口漢堡的二樓座位）、v＝直立招牌、其他是門口的小東西。
店名、招牌都是虛構的（D77）；這些貼圖只在遊戲裡用，來源寫在 LICENSES.md（使用者提供的參考圖）。"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

REF = sys.argv[1] if len(sys.argv) > 1 else 'docs/story_planning/ref_images/shops'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'textures', 'gen')
# (參考圖, 部位, 四個角, 輸出寬, 輸出高)
Q = [
    ('dabu_ext', 'sign', [(547, 207), (1600, 13), (1600, 187), (547, 344)], 1024, 192),
    ('dabu_ext', 'int', [(583, 349), (1553, 253), (1553, 800), (583, 693)], 1024, 384),
    ('haopai_ext', 'sign', [(583, 167), (1453, 13), (1453, 133), (583, 287)], 1024, 160),
    ('haopai_ext', 'int', [(587, 300), (1480, 173), (1480, 880), (587, 800)], 768, 512),
    ('shanlan_ext', 'sign', [(637, 317), (1000, 340), (1000, 440), (637, 407)], 512, 128),
    ('shanlan_ext', 'int', [(260, 400), (1147, 415), (1147, 705), (260, 735)], 1024, 384),
    ('shanlan_ext', 'up', [(160, 53), (1267, 227), (1267, 393), (160, 253)], 1024, 256),
    ('tongxian_ext', 'sign', [(527, 133), (891, 40), (891, 160), (527, 260)], 512, 160),
    ('tongxian_ext', 'up', [(891, 53), (1187, 13), (1187, 240), (891, 287)], 512, 384),
    ('tongxian_ext', 'int', [(504, 513), (953, 467), (953, 853), (504, 793)], 512, 448),
    ('tongxian_ext', 'plaque', [(1191, 440), (1249, 440), (1249, 620), (1191, 620)], 96, 288),
    ('tongxian_ext', 'guitar', [(1087, 407), (1187, 407), (1187, 653), (1087, 653)], 128, 320),
    ('xinsheng_sports_ext', 'sign', [(247, 304), (1264, 429), (1264, 513), (247, 440)], 1024, 128),
    ('xinsheng_sports_ext', 'v', [(1287, 51), (1376, 47), (1376, 416), (1287, 420)], 128, 512),
    ('xinsheng_sports_ext', 'int', [(220, 460), (1207, 520), (1207, 767), (220, 793)], 1024, 320),
    ('xinsheng_sports_ext', 'up', [(340, 60), (1224, 220), (1224, 393), (340, 287)], 1024, 256),
    ('dakou_ext', 'sign', [(653, 380), (1507, 353), (1507, 460), (653, 480)], 1024, 128),
    ('dakou_ext', 'int', [(687, 473), (1593, 467), (1593, 700), (687, 693)], 1024, 288),
    ('dakou_ext', 'up', [(811, 180), (1480, 153), (1480, 357), (811, 360)], 1024, 320),
    ('dakou_ext', 'v', [(1507, 93), (1640, 113), (1640, 473), (1507, 467)], 192, 512),
    ('nanyang_ext', 'fascia', [(587, 27), (1213, 27), (1213, 267), (587, 267)], 768, 288),
    ('nanyang_ext', 'sign', [(843, 273), (1180, 271), (1180, 387), (843, 389)], 512, 176),
    ('nanyang_ext', 'front', [(407, 393), (1380, 373), (1380, 800), (407, 800)], 1024, 448),
    ('nanyang_ext', 'poster', [(1393, 307), (1640, 307), (1640, 773), (1393, 773)], 288, 544),
]
# 溫州街（wz_fronts_atlas）：日常失速（W2 一樓，參考圖 ref_images/wz_cafes/daily_offbeat_ref_v2.webp，企劃線）
QW = [
    ('offbeat_ref_v2', 'sign', [(600, 18), (1340, 0), (1340, 112), (600, 140)], 1024, 160),
    # 店裡、側窗裡：不裁參考圖，直接用 AA 的室內 GLB（aa_support/daily_offbeat.glb）從街上的位置渲染（render_interior.py，鏡頭正對玻璃、畫面寬＝玻璃寬）：
    # 從外面看到的店內＝走進去看到的店內（參考圖畫的店內和 AA 做的室內配置不一樣，以走得進去的那一個為準）
    ('@textures/src/offbeat_int_render.jpg', 'int', None, 1024, 300),    # 正面：眼睛 (0.35,1.55,11)、看 (0.35,1.55,0)、22.3 mm、藏 WALL_front；畫面＝本地 x −4.55～5.25、y 0.11～2.99
    ('@textures/src/offbeat_side_render.jpg', 'side', None, 704, 512),   # 側面：眼睛 (11.5,1.6,−1.75)、看 (0,1.6,−1.75)、52.7 mm、藏 WALL_right；畫面＝室內 z 0.3～−3.8（側窗）
]


def coeffs(dst, src):
    """PIL PERSPECTIVE 的 8 個係數：輸出（dst 長方形）→ 輸入（src 四邊形）"""
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()


os.makedirs(OUT, exist_ok=True)


def build(QQ, atlas_name, alias=lambda n: n):
  cache = {}
  for name, part, quad, w, h in QQ:
      if name.startswith('@'):   # 本作的渲染圖（tools/blender/env_second/ 底下的相對路徑），整張縮到 w×h
          o = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), name[1:])).convert('RGB').resize((w, h), Image.LANCZOS)
          key = f'{alias(name)}_{part}'; cache[key] = o; print(key, o.size); continue
      if name not in cache: cache[name] = Image.open(os.path.join(REF, name + '.webp')).convert('RGB')
      im = cache[name]
      c = coeffs([(0, 0), (w, 0), (w, h), (0, h)], quad)
      o = im.transform((w, h), Image.PERSPECTIVE, c, Image.BICUBIC).filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=2))
      key = f'{alias(name)}_{part}'
      if key == 'xsports_up':   # 球衣上的校名（參考圖寫了真實的大學名字，D77 要虛構）：只把字那一條糊掉，號碼留著
          band = o.crop((0, 62, w, 112)).filter(ImageFilter.GaussianBlur(5)); o.paste(band, (0, 62))
      cache[key] = o; print(key, o.size)

  # ---- 拼成一張圖集（整條街一個材質）：一列一列往下排，寬 2048；xs_fronts_atlas.jpg＋.json（uv：u0, v0, u1, v1，v 從下往上）
  import json
  keys = [k for k in cache if k not in {n for n, *_ in QQ}]   # 參考圖原圖不放進圖集
  items = sorted(keys, key=lambda k: -cache[k].size[1]); AW = 2048; pos = {}; x = y = rowh = 0
  for k in items:
      w_, h_ = cache[k].size
      if x + w_ > AW: x = 0; y += rowh + 4; rowh = 0
      pos[k] = (x, y); x += w_ + 4; rowh = max(rowh, h_)
  AH = y + rowh; atlas = Image.new('RGB', (AW, AH), (128, 128, 128))
  for k, (x_, y_) in pos.items(): atlas.paste(cache[k], (x_, y_))
  atlas = atlas.resize((AW // 2, AH // 2), Image.LANCZOS)   # 手機：2048×3856 的圖集在 GPU 上 31 MB，縮一半（招牌從人行道看還是清楚）
  atlas.save(os.path.join(OUT, atlas_name + '.jpg'), quality=88)
  uv = {k: [x_ / AW, 1 - (y_ + cache[k].size[1]) / AH, (x_ + cache[k].size[0]) / AW, 1 - y_ / AH, cache[k].size[0] / cache[k].size[1]] for k, (x_, y_) in pos.items()}
  json.dump(uv, open(os.path.join(OUT, atlas_name + '.json'), 'w'), indent=1)
  print('atlas', AW, AH, len(uv))


build(Q, 'xs_fronts_atlas', lambda n: n.replace('_ext', '').replace('xinsheng_sports', 'xsports'))
build(QW, 'wz_fronts_atlas', lambda n: 'offbeat' if n.startswith('@') else n.replace('_ref_v2', ''))
