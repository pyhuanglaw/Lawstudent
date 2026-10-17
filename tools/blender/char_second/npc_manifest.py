"""從 npc.py 的 VARIANTS 產生 assets3d.js 的路人 manifest 條目（LAWWW-C cedb64dc 的格式：anon、lazy、ambient、sex），每行附檔案大小。
穿搭說明取變體最後一行的註解（「# 米色開襟衫＋白 T＋深藍長裙＋棕樂福鞋」）。
用法：python3 tools/blender/char_second/npc_manifest.py nf9 nf10 … > 輸出.js"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
src = open(os.path.join(HERE, 'npc.py'), encoding='utf-8').read()
for n in sys.argv[1:]:
    i = src.index("'%s': dict(" % n); ends = [k for k in (src.find("\n    '", i + 5), src.find("\n    #", i + 5), src.find("\n}", i + 5)) if k > 0]; blk = src[i:min(ends)]
    sex = re.search(r"sex='(.)'", blk).group(1); base = re.search(r"base='([A-Za-z_]+)'", blk).group(1)
    h = float(re.search(r"height=([0-9.]+)", blk).group(1))
    cm = re.findall(r"#\s*([^\n#]+?)\s*$", blk, re.M); note = cm[-1].split('（')[0] if cm else ''
    url = 'assets/models/char/second_ai/bl_npc_%s.vrm' % n; fp = os.path.join(ROOT, url)
    size = os.path.getsize(fp) if os.path.exists(fp) else -1
    print("    'char.npc_%s':%s{url:'%s',type:'vrm',anims:'char.mixamo_clips',height:%s,ambient:true,anon:true,lazy:true,sex:'%s',source:'LAWWW2 Blender 改作 VRoid CC0 樣本「%s」：%s',license:'CC0'},   // %d"
          % (n, ' ' * max(1, 5 - len(n)), url, ('%g' % h), sex, base, note.replace('＋', '、'), size))
