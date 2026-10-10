"""在 campus_overview.py 拍的校園俯視圖上標出地標名稱（給 VISUAL_REVIEW 用；台大平面圖本身有著作權，不放進 repo，只標我們自己的遊戲畫面）。
用法：python3 tools/shots/annotate_overview.py <overview.png> <輸出.jpg>
座標換算對應 campus_overview.py 的鏡頭：中心 (-3, -19.5)、高 640 m、垂直視角 21°、畫面 1300×1050。"""
import sys, math
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
CX, CZ, CAM_H, FOV, W, H = -3.0, -19.5, 640.0, 21.0, 1300, 1050
PPM = (H / 2) / (CAM_H * math.tan(math.radians(FOV / 2)))   # 每公尺幾個像素
LABELS = [('大門', -121, 6), ('椰林大道', -70, 4), ('傅鐘', -38, 16.5), ('行政大樓', -38, 33), ('文學院', -38, -34), ('校史館', -77, -29),
          ('農業陳列館', -104, -30), ('總圖書館', 100, 0), ('小椰林道', 30, -30), ('醉月湖', -30, -65), ('舟山路', -80, 47),
          ('霖澤館（法律學院）', 34, -112), ('萬才館', 88, -112), ('社會科學院', 110, -70), ('男一舍', 20, 68)]

def main():
    im = Image.open(sys.argv[1]).convert('RGB'); sx, sy = im.width / W, im.height / H
    d = ImageDraw.Draw(im); f = ImageFont.truetype(FONT, int(22 * sx))
    for name, x, z in LABELS:
        px = (W / 2 + (x - CX) * PPM) * sx; py = (H / 2 + (z - CZ) * PPM) * sy
        tw = d.textlength(name, font=f); box = [px - tw / 2 - 6, py - 16 * sy, px + tw / 2 + 6, py + 16 * sy]
        d.rounded_rectangle(box, radius=6, fill=(255, 255, 255), outline=(60, 50, 40), width=2)
        d.text((px - tw / 2, py - 13 * sy), name, fill=(40, 30, 24), font=f)
    d.text((14, 10), '遊戲內校園俯視（實際算圖，上＝北）', fill=(30, 26, 22), font=f)
    im.save(sys.argv[2], quality=86); print('saved', sys.argv[2])

main()
