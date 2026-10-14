"""吉他社社辦的室內平面示意圖（PROPOSAL；不是遊戲截圖、沒有建模）。
用法：python3 tools/blender/env_second/shots/guitar_room_plan.py <輸出.png>"""
import sys
from PIL import Image, ImageDraw, ImageFont
OUT = sys.argv[1]
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
f = lambda s: ImageFont.truetype(FONT, s)
W_, D_, S = 6.0, 5.0, 110            # 室內 6×5 m（約 9 坪）；1 m＝110 像素
M = 90
im = Image.new('RGB', (int(W_ * S) + 2 * M + 400, int(D_ * S) + 2 * M + 40), (255, 255, 255)); d = ImageDraw.Draw(im)
P = lambda x, z: (M + x * S, M + z * S)


def rect(x0, z0, x1, z1, fill=None, outline=(60, 60, 60), width=2, label=None, fs=18, tc=(30, 30, 30)):
    d.rectangle([P(x0, z0), P(x1, z1)], fill=fill, outline=outline, width=width)
    if label:
        cx, cy = P((x0 + x1) / 2, (z0 + z1) / 2); tw, th = d.textbbox((0, 0), label, font=f(fs))[2:]; d.text((cx - tw / 2, cy - th / 2), label, font=f(fs), fill=tc)


# 地板、牆（北在上）
rect(0, 0, W_, D_, fill=(226, 206, 170), outline=(40, 40, 40), width=8)
for k in range(1, 12): d.line([P(k * 0.5, 0), P(k * 0.5, D_)], fill=(212, 190, 152), width=1)   # 木地板
# 門（南牆、靠東）、窗（北牆）
d.rectangle([P(4.3, D_ - 0.06), P(5.3, D_ + 0.06)], fill=(255, 255, 255)); d.arc([P(4.3, D_ - 1.0), P(6.3, D_ + 1.0)], 180, 270, fill=(80, 80, 80), width=2)
d.line([P(5.3, D_), P(5.3, D_ - 1.0)], fill=(80, 80, 80), width=3); d.text(P(4.0, D_ + 0.12), '門（往走廊／騎廊）', font=f(16), fill=(60, 60, 60))
d.rectangle([P(1.2, -0.06), P(4.0, 0.06)], fill=(170, 210, 235)); d.text(P(1.7, 0.12), '窗（冷氣在窗上）', font=f(15), fill=(60, 60, 60))
# 牆邊
rect(0.08, 0.5, 0.4, 3.6, fill=(150, 108, 70)); d.text(P(0.48, 0.55), '吉他牆（6 把）', font=f(15), fill=(90, 60, 30))
for k in range(6): d.ellipse([P(0.12, 0.62 + k * 0.5), P(0.36, 0.98 + k * 0.5)], fill=(196, 140, 80), outline=(90, 60, 30))
rect(0.08, 3.8, 1.2, 4.92, fill=(120, 120, 128), label='櫃子＋樂譜', fs=14, tc=(255, 255, 255))
rect(4.4, 0.08, 5.92, 0.4, fill=(240, 240, 240), label='白板（和弦表）', fs=14)
rect(5.45, 0.6, 5.92, 1.4, fill=(40, 40, 44), label='音箱', fs=14, tc=(255, 255, 255))
rect(5.4, 1.6, 5.92, 3.6, fill=(140, 70, 60), label='舊沙發', fs=15, tc=(255, 255, 255))
rect(1.4, 4.45, 3.4, 4.92, fill=(200, 200, 196), label='長桌（報名表、零食）', fs=13)
rect(3.55, 4.5, 4.05, 4.92, fill=(230, 230, 236), label='冰箱', fs=12)
# 中間：圍成一圈的椅子＋木箱鼓、譜架
import math
for k in range(7):
    a = 2 * math.pi * k / 7 + 0.3; cx, cz = 2.8 + 1.15 * math.cos(a), 2.3 + 1.0 * math.sin(a)
    d.rectangle([P(cx - 0.2, cz - 0.2), P(cx + 0.2, cz + 0.2)], fill=(70, 70, 76))
rect(2.6, 2.1, 3.0, 2.5, fill=(170, 120, 70), label='木箱鼓', fs=11, tc=(255, 255, 255))
for (x, z) in ((1.3, 1.2), (4.3, 1.4)): d.line([P(x - 0.2, z), P(x + 0.2, z)], fill=(30, 30, 30), width=4); d.text(P(x - 0.25, z + 0.05), '譜架', font=f(13), fill=(30, 30, 30))
d.ellipse([P(1.5, 1.1), P(4.1, 3.5)], outline=(150, 120, 90), width=2)   # 地毯
# 尺寸
d.line([P(0, D_ + 0.55), P(W_, D_ + 0.55)], fill=(30, 30, 30), width=2); d.text(P(2.7, D_ + 0.6), '6 m', font=f(18), fill=(30, 30, 30))
d.line([P(W_ + 0.35, 0), P(W_ + 0.35, D_)], fill=(30, 30, 30), width=2); d.text(P(W_ + 0.45, 2.3), '5 m', font=f(18), fill=(30, 30, 30))
d.text((M, 20), '吉他社社辦（PROPOSAL，2026-10-13，LAWWW2）：室內 6×5 m（約 9 坪）的示意平面，北在上；不是遊戲截圖', font=f(19), fill=(30, 30, 30))
x0 = int(W_ * S) + 2 * M + 30
for i, t in enumerate(('玩家可以做的事（建議）：', '・坐在圈圈裡上社課（座位 7 個）', '・從吉他牆拿一把吉他練習', '・看白板上的和弦表', '・坐沙發（社員聊天）', '・在長桌填入社單', '', '燈光：暖色日光燈＋一串小燈；', '晚上的社課（19:00–21:00）', '窗外是暗的')):
    d.text((x0, M + i * 30), t, font=f(17), fill=(40, 40, 40))
im.save(OUT); print('ok', OUT)
