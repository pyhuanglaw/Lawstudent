"""人物交 BB 驗收（D59）的打包：遊戲渲染器 lookdev（char_lookdev.py 的輸出）＋Blender 預覽 → docs/art-rebuild/second_ai/char_review/<資料夾>/*.webp，
VRM 複製到 assets/models/char/second_ai/<遊戲檔名>。README 另外寫（每個人物不同）。
用法：python3 tools/blender/char_second/review_pack.py <工作資料夾 SP> <name> <版本> <char_review 資料夾名> <遊戲 VRM 檔名> [舊版本 ...]
  SP/char/<name>/bl_<name>_<版本>.vrm、SP/char/<name>/<版本>_*.png（Blender）、SP/look_<name>_<版本>/<name>_look_*.png（遊戲渲染器）
  舊版本：每個舊版本另外存一張 v<k>_look_sheet.webp（自己退件的版本，給 BB 對照）"""
import os, shutil, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))


def sheet(paths, out, h=420, q=85):
    ims = [Image.open(p).convert('RGB') for p in paths if os.path.exists(p)]
    if not ims: return None
    ims = [i.resize((int(i.width * h / i.height), h)) for i in ims]
    o = Image.new('RGB', (sum(i.width for i in ims), h), (255, 255, 255)); x = 0
    for i in ims: o.paste(i, (x, 0)); x += i.width
    o.save(out, quality=q); return out


def main():
    sp, name, ver, folder, game = sys.argv[1:6]; olds = sys.argv[6:]
    D = os.path.join(sp, 'char', name); L = os.path.join(sp, 'look_%s_%s' % (name, ver))
    O = os.path.join(ROOT, 'docs', 'art-rebuild', 'second_ai', 'char_review', folder); os.makedirs(O, exist_ok=True)
    out = []
    for f in sorted(os.listdir(L)):
        if f.endswith('.png'):
            k = f.split('_look_', 1)[1][:-4]
            Image.open(os.path.join(L, f)).convert('RGB').save(os.path.join(O, 'look_%s.webp' % k), quality=85); out.append('look_%s.webp' % k)
    lk = lambda k: os.path.join(L, '%s_look_%s.png' % (name, k))
    out.append(os.path.basename(sheet([lk('face_front'), lk('face_q45'), lk('face_side'), lk('body_front'), lk('body_q45'), lk('body_back')], os.path.join(O, 'look_sheet.webp'))))
    for k in ('face_front', 'face_q45', 'body_front', 'body_side'):
        p = os.path.join(D, '%s_%s.png' % (ver, k))
        if os.path.exists(p): Image.open(p).convert('RGB').save(os.path.join(O, 'blender_%s.webp' % k), quality=85); out.append('blender_%s.webp' % k)
    for ov in olds:
        Lo = os.path.join(sp, 'look_%s_%s' % (name, ov)); lo = lambda k: os.path.join(Lo, '%s_look_%s.png' % (name, k))
        r = sheet([lo('face_front'), lo('face_q45'), lo('face_side'), lo('body_front'), lo('body_q45')], os.path.join(O, '%s_look_sheet.webp' % ov), h=300, q=78)
        if r: out.append(os.path.basename(r))
    src = os.path.join(D, 'bl_%s_%s.vrm' % (name, ver)); dst = os.path.join(ROOT, 'assets', 'models', 'char', 'second_ai', game)
    shutil.copyfile(src, dst)
    print('wrote', O, out); print('vrm', dst, '%.2f MB' % (os.path.getsize(dst) / 1e6))


if __name__ == '__main__':
    main()
