"""TripoSR（CPU）：輸入已去背的 RGBA（自己做的遮罩），照 run.py 的前處理（前景縮到 85%、灰底），輸出頂點色 GLB＋時間。
用法：python tsr_run.py <TripoSR 原始碼資料夾> <權重資料夾> <in_rgba.png> <out_dir> [--mc 256] [--threads 4]"""
import sys, time, os
A = sys.argv[1:]
sys.path.insert(0, A[0])
import numpy as np, torch
from PIL import Image
from tsr.system import TSR
from tsr.utils import resize_foreground
mc = int(A[A.index('--mc') + 1]) if '--mc' in A else 256
if '--threads' in A: torch.set_num_threads(int(A[A.index('--threads') + 1]))
out = A[3]; os.makedirs(out, exist_ok=True)
t0 = time.time(); model = TSR.from_pretrained(A[1], config_name='config.yaml', weight_name='model.ckpt'); model.renderer.set_chunk_size(8192); model.to('cpu'); t1 = time.time()
im = resize_foreground(Image.open(A[2]).convert('RGBA'), 0.85)
a = np.asarray(im).astype(np.float32) / 255; a = a[..., :3] * a[..., 3:4] + (1 - a[..., 3:4]) * 0.5
img = Image.fromarray((a * 255).astype(np.uint8)); img.save(os.path.join(out, 'input.png'))
with torch.no_grad(): codes = model([img], device='cpu')
t2 = time.time(); mesh = model.extract_mesh(codes, True, resolution=mc)[0]; t3 = time.time()
mesh.export(os.path.join(out, 'mesh.glb'))
print(f'TIMES load={t1 - t0:.1f}s model={t2 - t1:.1f}s mesh(mc{mc})={t3 - t2:.1f}s tris={len(mesh.faces)} verts={len(mesh.vertices)} threads={torch.get_num_threads()}')
