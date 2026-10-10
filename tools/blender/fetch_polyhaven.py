"""下載 Poly Haven（CC0）PBR 貼圖到 tools/blender/textures/<id>/（顏色 diff、法線 nor_gl、粗糙度 rough；1k JPG）。
Blender 腳本（tools/blender/*.py）從這裡讀；遊戲用的是 Blender 匯出 GLB 時縮小、轉 WebP 的版本（不直接載入這些原檔）。
已經下載過的檔案不會重抓。授權：Poly Haven 全部 CC0（https://polyhaven.com/license），清單記在 LICENSES.md。
用法：python3 tools/blender/fetch_polyhaven.py granite_tile_02 ceiling_interior ...（不給參數＝下載 MATERIALS 全部）"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'textures')
# 霖澤館室內／外觀、教室用到的材質（v9.4 第一批）
MATERIALS = ['granite_tile_02', 'granite_tile', 'granite_wall', 'grey_plaster_02', 'painted_plaster_wall', 'fine_grained_wood',
             'wood_table_001', 'ceiling_interior', 'fabric_leather_02', 'floor_tiles_06', 'large_floor_tiles_02', 'concrete_floor_02']
MAPS = {'diff': ['Diffuse'], 'nor_gl': ['nor_gl'], 'rough': ['Rough', 'rough']}


def curl(url, dest=None):
    cmd = ['curl', '-sSfL', '--retry', '3', '--max-time', '120', url]
    if dest: cmd += ['-o', dest]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0: raise RuntimeError(f'{url}: {r.stderr.decode()[:200]}')
    return r.stdout


def fetch(pid, res='1k'):
    d = os.path.join(OUT, pid); os.makedirs(d, exist_ok=True)
    info = json.loads(curl(f'https://api.polyhaven.com/files/{pid}'))
    got = []
    for short, keys in MAPS.items():
        dest = os.path.join(d, f'{pid}_{short}_{res}.jpg')
        if os.path.exists(dest) and os.path.getsize(dest) > 1000: got.append(short); continue
        node = next((info[k] for k in keys if k in info), None)
        if not node or res not in node or 'jpg' not in node[res]:
            print(f'  {pid}: 沒有 {short} {res} jpg'); continue
        curl(node[res]['jpg']['url'], dest); got.append(short)
    print(f'{pid}: {", ".join(got)}')
    return got


if __name__ == '__main__':
    ids = sys.argv[1:] or MATERIALS
    for pid in ids:
        try: fetch(pid)
        except Exception as e: print(f'{pid}: 失敗 {e}')
