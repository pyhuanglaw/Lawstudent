"""烘焙出來的光照貼圖 PNG → WebP（遊戲用）。用法：python3 to_webp.py <前綴（不含 _day.png）> <輸出前綴（不含 _day.webp）> [品質 90]"""
import sys, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]; q = int(sys.argv[3]) if len(sys.argv) > 3 else 90
for t in ('day', 'night', 'dark'):
    if t == 'dark' and not os.path.exists(f'{src}_{t}.png'): continue   # 熄燈那一張（bake_room.py --dark）只有宿舍有
    Image.open(f'{src}_{t}.png').convert('RGB').save(f'{dst}_{t}.webp', quality=q, method=6); print('wrote', f'{dst}_{t}.webp')
