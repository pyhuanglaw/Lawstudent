"""BG-DARK-SCENES-1024 第二批（LAWWW-B 13:50 派工）：回國重逢、出國申請那幾段黑底，從遊戲的 3D 拍成 2D 背景（1672×941 webp，和 assets/bg 現有的同規格）。
LAWWW2-B 2026-10-24。用法：python3 tools/blender/env_second/shots/bg_dark_scenes2_post.py <拍好的 PNG 資料夾> <輸出資料夾>
拍法見 docs/art-rebuild/second_ai/test_shots/bg_dark_scenes_1024/README.md 的「第二批」。不調光，只有法圖門口裁掉左邊：
  - law_library_gate：鏡頭在萬才館大廳、往西看樓梯底下凹處的玻璃門；左邊 13% 是正面玻璃的黑框（x 0～215），裁掉、照原比例放大回 1672×941（1.15 倍）。"""
import os, sys
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
W, H = 1672, 941
os.makedirs(OUT, exist_ok=True)


def save(im, name):
    p = os.path.join(OUT, name + '.webp'); im.convert('RGB').save(p, 'WEBP', quality=86, method=6); print('wrote', p, os.path.getsize(p))


def load(name): return Image.open(os.path.join(SRC, name + '.png')).convert('RGB').resize((W, H))


for n, src in (('library_gate_day', 'library_gate_day_c'), ('oldroad_bookstore', 'oldroad_bookstore_a'), ('dorm_desk', 'dorm_desk_a')):
    save(load(src), n)

im = load('law_library_gate_c'); x0, y0 = 222, 40; w = W - x0; h = round(w * H / W)
save(im.crop((x0, y0, x0 + w, y0 + h)).resize((W, H), Image.LANCZOS), 'law_library_gate')
