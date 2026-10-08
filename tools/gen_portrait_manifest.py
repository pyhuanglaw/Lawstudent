"""掃描 assets/portraits/<id>/<outfit>/<expression>.webp → src/data/portrait_manifest.js（PORTRAIT_FILES）。build.py 會呼叫。"""
import pathlib, json
root=pathlib.Path(__file__).resolve().parent.parent
base=root/'assets'/'portraits'; out={}
if base.exists():
    for p in sorted(base.rglob('*.webp')):
        rel=p.relative_to(base).as_posix().split('/')
        if len(rel)!=3: continue
        cid,outfit,expr=rel[0],rel[1],rel[2][:-5]
        out.setdefault(cid,{}).setdefault(outfit,[]).append(expr)
js='/* 自動產生（tools/gen_portrait_manifest.py）：實際存在的正式立繪檔案。ADV 只把存在的檔案放進 fallback 鏈；沒有任何檔案的人物走 compact（無立繪）對話模式。 */\n'
js+="'use strict';\nconst PORTRAIT_FILES="+json.dumps(out,ensure_ascii=False,indent=1)+";\n"
js+="const PORTRAIT_SOURCE={heroine_01:'user-provided master sheet 2026-09-27',heroine_02:'user-provided master sheet 2026-09-27',heroine_03:'user-provided master sheet 2026-09-27',heroine_04:'user-provided master sheet 2026-09-27',heroine_05:'user-provided master sheet 2026-09-27'};\n"
(root/'src'/'data'/'portrait_manifest.js').write_text(js,encoding='utf-8')
print(json.dumps(out,ensure_ascii=False))
