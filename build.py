"""打包：把 index.html 的外部 script 內嵌，輸出 build/index.html（完整單檔）與 build/artifact.html（給 claude.ai artifact 用的無外殼版本）"""
import re, os, pathlib, subprocess, sys
root=pathlib.Path(__file__).parent
subprocess.run([sys.executable,str(root/'tools'/'gen_portrait_manifest.py')],check=True)
src=(root/'index.html').read_text(encoding='utf-8')
def inline(m):
    path=m.group(1).split('?')[0]   # index.html 的 script 網址帶 ?v=版本（GitHub Pages 快取用），讀檔時去掉
    code=(root/path).read_text(encoding='utf-8')
    code=code.replace('</script','<\\/script')
    return '<script>/* '+path+' */\n'+code+'\n</script>'
out=re.sub(r'<script src="([^"]+)"></script>',inline,src)
(root/'build').mkdir(exist_ok=True)
# 複製執行期需要的資產（GLB）到 build/assets（相對路徑不變）
import shutil
for sub in ['models/env','models/char']:
    d=root/'build'/'assets'/sub; d.mkdir(parents=True,exist_ok=True)
    for f in list((root/'assets'/sub).glob('*.glb'))+list((root/'assets'/sub).glob('*.vrm')): shutil.copy2(f,d/f.name)
# 正式立繪（webp）
for p in (root/'assets'/'portraits').rglob('*.webp'):
    rel=p.relative_to(root); d=(root/'build'/rel).parent; d.mkdir(parents=True,exist_ok=True); shutil.copy2(p,root/'build'/rel)
import base64
for p in list((root/'build'/'assets').rglob('*.glb'))+list((root/'build'/'assets').rglob('*.vrm')):
    (p.parent/(p.name+'.json')).write_text('{"b64":"'+base64.b64encode(p.read_bytes()).decode()+'"}',encoding='utf-8')
assets=[str(p.relative_to(root/'build')) for p in list((root/'build'/'assets').rglob('*.glb'))+list((root/'build'/'assets').rglob('*.vrm'))+list((root/'build'/'assets').rglob('*.webp'))]
(root/'build'/'ASSET_FILES.txt').write_text('\n'.join(sorted(assets)),encoding='utf-8')
(root/'build'/'index.html').write_text(out,encoding='utf-8')
# artifact 版：去掉 doctype/html/head/body 外殼，保留 title/link/style 與內容
body=out
body=re.sub(r'^<!doctype html>\s*<html[^>]*><head><meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*','',body,flags=re.I)
body=body.replace('</head>\n<body>','').replace('</body></html>','')
(root/'build'/'artifact.html').write_text(body,encoding='utf-8')
print('build/index.html',len(out)//1024,'KB; build/artifact.html',len(body)//1024,'KB; assets',len(assets))
