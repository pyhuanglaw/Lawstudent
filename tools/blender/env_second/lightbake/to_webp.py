"""烘焙出來的光照貼圖 PNG → WebP（遊戲用）。用法：python3 to_webp.py <前綴（不含 _day.png）> <輸出前綴（不含 _day.webp）> [品質 90] [彩度 1.0]
彩度（11-02 LAWWW2 加，預設 1.0＝不改）：光照貼圖的顏色往灰階拉（0.5＝彩度減半）。日本宿舍房間 jp_room：小房間木地板、木門、木衣櫃互相反射，
  白色衣櫃門的光照貼圖紅／藍 1.3，遊戲裡白天衣櫃和門中段一塊橘色（烘焙前的即時光是中性的白）。亮度不變（照 Rec.709 的亮度在線性空間換算）。"""
import sys, os
import numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]; q = int(sys.argv[3]) if len(sys.argv) > 3 else 90
sat = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0


def desat(im, k):
    a = np.asarray(im).astype(np.float32) / 255
    lin = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    y = (lin * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(axis=2, keepdims=True)
    lin = np.clip(y + (lin - y) * k, 0, 1)
    a = np.where(lin <= 0.0031308, lin * 12.92, 1.055 * lin ** (1 / 2.4) - 0.055)
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


for t in ('day', 'night', 'dark'):
    if t == 'dark' and not os.path.exists(f'{src}_{t}.png'): continue   # 熄燈那一張（bake_room.py --dark）只有宿舍有
    im = Image.open(f'{src}_{t}.png').convert('RGB')
    if sat != 1.0: im = desat(im, sat)
    im.save(f'{dst}_{t}.webp', quality=q, method=6); print('wrote', f'{dst}_{t}.webp', 'sat', sat)
