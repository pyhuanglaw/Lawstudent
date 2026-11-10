"""山嵐書店文具區的字（SIS-STATIONERY-1110，LAWWW2-B 2026-11-10）：一張 1024×1024 的貼圖 → shl_stat_label.png（原創、沒有品牌，D77）。
  python3 tools/blender/env_second/shanlan_stationery/label_atlas.py [輸出.png]
格子（像素，左上角原點）：
  (0,0,1024,256)        牆上的木牌「文具選物 STATIONERY」（1.42 × 0.355 m）
  (0,256,512,512)       分區牌「筆 PENS」          (512,256,1024,512) 「紙膠帶 WASHI TAPE」
  (0,512,512,768)       「筆記本 NOTEBOOKS」         (512,512,1024,768) 「便條紙 STICKY NOTES」
  (0,768,512,1024)      試貼板的小牌「試貼 TRY」     (512,768,1024,1024) 試寫本的小牌「試寫 TRY」
字型：文泉驛正黑（wqy-zenhei，GPL＋字型例外：字畫進圖裡可以自由使用；和 AA 的 aa_int_tex.py 同一個）。顏色照山嵐的分類吊牌（木牌底 #d9bf96、深色字 #3a2c22）。"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'shl_stat_label.png'
CELLS = {   # 名字 → (x0, y0, x1, y1)；stationery_add.py 用同一份
    'plaque': (0, 0, 1024, 256),
    'pens': (0, 256, 512, 512), 'washi': (512, 256, 1024, 512),
    'notebooks': (0, 512, 512, 768), 'sticky': (512, 512, 1024, 768),
    'try_tape': (0, 768, 512, 1024), 'try_pen': (512, 768, 1024, 1024),
}


def F(sz): return ImageFont.truetype(FONT, sz)


def text_c(d, xy, s, f, fill):
    b = d.textbbox((0, 0), s, font=f); d.text((xy[0] - (b[2] - b[0]) / 2 - b[0], xy[1] - (b[3] - b[1]) / 2 - b[1]), s, font=f, fill=fill)


def main():
    im = Image.new('RGB', (1024, 1024), '#f4eee2'); d = ImageDraw.Draw(im)
    # 木牌：木頭底色（淡淡的木紋：幾條橫線）、深色字、下面一行英文小字
    x0, y0, x1, y1 = CELLS['plaque']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill='#d9bf96')
    for k in range(14):
        y = y0 + 9 + k * 17 + (k * 7) % 5; d.line([x0, y, x1, y + (k % 3) - 1], fill='#cfb388' if k % 2 else '#dcc39c', width=2)
    d.rectangle([x0 + 10, y0 + 10, x1 - 11, y1 - 11], outline='#8a6a44', width=4)
    text_c(d, ((x0 + x1) / 2, y0 + 108), '文 具 選 物', F(118), '#3a2c22')
    text_c(d, ((x0 + x1) / 2, y0 + 208), 'STATIONERY  ·  筆  ·  筆記本  ·  便條紙  ·  紙膠帶', F(28), '#5a4630')
    # 分區牌：米白卡紙、細框、左上角一個小色塊（各區的代表色）
    cards = {'pens': ('筆', 'PENS', '#2f4a5a'), 'washi': ('紙膠帶', 'WASHI TAPE', '#d98c7a'),
             'notebooks': ('筆記本', 'NOTEBOOKS', '#6b7f5a'), 'sticky': ('便條紙', 'STICKY NOTES', '#e3b448'),
             'try_tape': ('試貼', 'TRY ME', '#d98c7a'), 'try_pen': ('試寫', 'TRY ME', '#2f4a5a')}
    for k, (zh, en, col) in cards.items():
        x0, y0, x1, y1 = CELLS[k]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill='#f6f1e6')
        d.rectangle([x0 + 8, y0 + 8, x1 - 9, y1 - 9], outline='#8a6a44', width=4)
        d.rectangle([x0 + 22, y0 + 22, x0 + 58, y0 + 58], fill=col)
        zs = 120 if len(zh) <= 2 else 104
        text_c(d, ((x0 + x1) / 2, y0 + 112), zh, F(zs), '#3a2c22')
        text_c(d, ((x0 + x1) / 2, y0 + 206), en, F(30), '#5a4630')
    im = im.filter(ImageFilter.SMOOTH)
    im.save(OUT, optimize=True); print('wrote', OUT)


if __name__ == '__main__':
    main()
