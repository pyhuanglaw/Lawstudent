"""夜市十攤的貼圖（NIGHT-MARKET-1110，X326；使用者 2026-11-11 的十張參考圖 docs/art-rebuild/second_ai/ref/night_market_1110/concept/stall_*.webp，都是正面拍）
→ textures/gen/nm_stalls_atlas.{jpg,json}（uv：u0, v0, u1, v1，v 從下往上；第五個＝寬高比）。招牌、菜單、正面的圖從參考圖裁（長方形，x0, y0, x1, y1；參考圖 1448×1086 的像素）。
用法：python3 tools/blender/env_second/nm_stalls_tex.py [<參考圖資料夾>]"""
import os, sys, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs/art-rebuild/second_ai/ref/night_market_1110/concept'); GEN = os.path.join(HERE, 'textures', 'gen')
# key: (檔名, (x0, y0, x1, y1), 輸出高度（像素；寬照比例）)
Q = {
    'milk_sign': ('01_shensanbei', (268, 48, 1195, 225), 150), 'milk_menu': ('01_shensanbei', (248, 718, 585, 958), 200), 'milk_art': ('01_shensanbei', (775, 785, 1210, 960), 150),
    'milk_board': ('01_shensanbei', (832, 555, 1012, 683), 110), 'milk_flag': ('01_shensanbei', (1272, 232, 1420, 668), 300), 'milk_side': ('01_shensanbei', (150, 280, 248, 492), 200), 'milk_fridge': ('01_shensanbei', (768, 305, 1005, 555), 220),
    'pepper_sign': ('02_huangjia_pepper', (120, 165, 1330, 300), 120), 'pepper_front': ('02_huangjia_pepper', (590, 775, 1245, 985), 190), 'pepper_price': ('02_huangjia_pepper', (1075, 525, 1205, 640), 110), 'pepper_flag': ('02_huangjia_pepper', (158, 465, 235, 725), 240),
    'cake_sign': ('03_ershiyuan_wheelcake', (185, 135, 1330, 370), 180), 'cake_side': ('03_ershiyuan_wheelcake', (150, 395, 265, 665), 220), 'cake_tags': ('03_ershiyuan_wheelcake', (1020, 385, 1185, 520), 120),
    'ball_sign': ('04_yige_diqiu', (215, 75, 1235, 285), 170), 'ball_front': ('04_yige_diqiu', (222, 770, 1340, 1055), 210), 'ball_menu': ('04_yige_diqiu', (835, 325, 1025, 535), 180), 'ball_flag': ('04_yige_diqiu', (128, 308, 285, 755), 300),
    'cong_sign': ('05_dangcong', (205, 160, 1300, 355), 170), 'cong_front': ('05_dangcong', (275, 735, 1170, 1005), 220), 'cong_menu': ('05_dangcong', (128, 330, 315, 695), 280),
    'tofu_sign': ('06_shaoxing_tofu', (250, 62, 1250, 250), 160), 'tofu_cloth': ('06_shaoxing_tofu', (585, 262, 1020, 410), 120), 'tofu_front': ('06_shaoxing_tofu', (585, 778, 1020, 1030), 200), 'tofu_menu': ('06_shaoxing_tofu', (1075, 305, 1262, 548), 200), 'tofu_flag': ('06_shaoxing_tofu', (18, 345, 195, 725), 300),
    'corn_sign': ('07_yuhuang_corn', (140, 15, 1310, 300), 220), 'corn_front': ('07_yuhuang_corn', (140, 775, 1295, 1035), 200), 'corn_menu': ('07_yuhuang_corn', (1222, 295, 1392, 740), 320), 'corn_flag': ('07_yuhuang_corn', (20, 298, 135, 740), 300),
    'egg_sign': ('08_chenjia_eggcake', (215, 140, 1185, 300), 140), 'egg_front': ('08_chenjia_eggcake', (190, 825, 1300, 1040), 170), 'egg_side': ('08_chenjia_eggcake', (85, 300, 175, 635), 260), 'egg_price': ('08_chenjia_eggcake', (1135, 300, 1305, 592), 250),
    'cane_sign': ('09_jiejiegao_cane', (245, 85, 1310, 275), 160), 'cane_front': ('09_jiejiegao_cane', (275, 780, 1235, 995), 180), 'cane_price': ('09_jiejiegao_cane', (250, 322, 418, 615), 260),
    'sweet_sign': ('10_apo_tianshang', (215, 170, 1262, 352), 160), 'sweet_sub': ('10_apo_tianshang', (448, 372, 1045, 450), 70), 'sweet_front': ('10_apo_tianshang', (265, 725, 1075, 885), 150), 'sweet_menu': ('10_apo_tianshang', (1200, 400, 1300, 640), 240), 'sweet_flag': ('10_apo_tianshang', (120, 355, 215, 665), 260), 'sweet_ice': ('10_apo_tianshang', (300, 468, 420, 680), 200),
}


def main():
    cache = {}; items = []   # 高度整體縮 7%：剛好排進 2048×2048
    for k, (n, (x0, y0, x1, y1), h) in Q.items():
        if n not in cache: cache[n] = Image.open(os.path.join(SRC, f'stall_{n}.webp')).convert('RGB')
        h = round(h * 0.93); w = max(8, round(h * (x1 - x0) / (y1 - y0))); items.append((k, cache[n].crop((x0, y0, x1, y1)).resize((w, h), Image.LANCZOS)))
    items.sort(key=lambda kv: -kv[1].height); AW = 2048; pos = {}; x = y = rh = 0; P = 4
    for k, im in items:
        if x + im.width > AW: x = 0; y += rh + P; rh = 0
        pos[k] = (x, y); x += im.width + P; rh = max(rh, im.height)
    AH = 1024
    while AH < y + rh: AH *= 2
    at = Image.new('RGB', (AW, AH), (30, 30, 30)); uv = {}
    for k, im in items: x, y = pos[k]; at.paste(im, (x, y)); uv[k] = [x / AW, 1 - (y + im.height) / AH, (x + im.width) / AW, 1 - y / AH, round(im.width / im.height, 4)]
    # 背景三攤（使用者 11-10：不取名，只寫賣的東西）的字牌＋燈泡的暖白色塊：畫在最下面的空白（參考圖沒有這三攤）
    from PIL import ImageDraw, ImageFont
    d = ImageDraw.Draw(at); F = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'; gy = y + rh + P; gh = AH - gy - 2
    for i, (k, t, bg, fg) in enumerate((('bg_ring', '套圈圈', '#f4d23a', '#b8231c'), ('bg_ring_p', '十個圈 50 元', '#fffdf4', '#b8231c'), ('bg_case', '手機殼', '#f4f6fa', '#1f3f9a'), ('bg_case_p', '任選 100 元', '#fffdf4', '#1f3f9a'), ('bg_socks', '襪子', '#fff6a8', '#b8231c'), ('bg_socks_p', '三雙 100 元', '#fffdf4', '#b8231c'))):
        gx, gw = 4 + i * 330, 322; d.rectangle([gx, gy, gx + gw, gy + gh], fill=bg); d.rectangle([gx + 3, gy + 3, gx + gw - 3, gy + gh - 3], outline=fg, width=3)
        px = gh - 24
        while px > 8:
            f = ImageFont.truetype(F, px); bb = d.textbbox((0, 0), t, font=f)
            if bb[2] - bb[0] <= gw - 30: break
            px -= 2
        d.text((gx + gw / 2 - (bb[0] + bb[2]) / 2, gy + gh / 2 - (bb[1] + bb[3]) / 2), t, font=f, fill=fg); uv[k] = [gx / AW, 1 - (gy + gh) / AH, (gx + gw) / AW, 1 - gy / AH, round(gw / gh, 4)]
    d.rectangle([2000, gy, 2046, gy + gh], fill='#fff0c8'); uv['bulb'] = [2010 / AW, 1 - (gy + gh - 10) / AH, 2036 / AW, 1 - (gy + 10) / AH, 1.0]
    os.makedirs(GEN, exist_ok=True); at.save(os.path.join(GEN, 'nm_stalls_atlas.jpg'), quality=90); json.dump(uv, open(os.path.join(GEN, 'nm_stalls_atlas.json'), 'w'), indent=1); print('atlas', AW, AH, len(uv), 'used', y + rh)


if __name__ == '__main__':
    main()
