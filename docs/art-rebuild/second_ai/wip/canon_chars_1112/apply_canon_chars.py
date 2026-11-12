#!/usr/bin/env python3
"""CANON-NO-ECON-1112 ②（D158）：五個舊序章人物（甲～戊）的 3D 模型、立繪、建模腳本、只測它們的測試拿掉，
manifest／坐姿表／配件表／立繪清單／LICENSES 跟著改。在開發分支的 repo 根目錄跑：
  python3 docs/art-rebuild/second_ai/wip/canon_chars_1112/apply_canon_chars.py [--dry]
用 git rm 刪檔；改檔用比對英文識別字（這支檔本身不出現字表裡的字）。每一步找不到預期的東西就報錯、什麼都不寫。"""
import json, os, re, subprocess, sys
DRY = '--dry' in sys.argv
IDS = ['zhengxun', 'weilun', 'tangrui', 'jiahao', 'pinyu']
ALT = '|'.join(IDS)

def sh(*a):
    return subprocess.run(a, check=True, capture_output=True, text=True).stdout

def ls(*pats):
    out = sh('git', 'ls-files', *pats).split('\n')
    return [x for x in out if x]

# 1) 要刪的檔
DEL = []
DEL += ['assets/models/char/second_ai/bl_econ_%s.vrm' % i for i in IDS]
DEL += ls(*['assets/portraits/econ_%s' % i for i in IDS])
DEL += ls(*['tools/blender/char_second/%s%s.py' % (i, s) for i in ('jiahao', 'tangrui', 'weilun') for s in ('', '_clothes', '_face', '_hair')])
DEL += ls('tests/v0_econ_chars_unit.js')
DEL += ls('docs/art-rebuild/ingame_review/2026-10-17_econ_peishan')
miss = [f for f in DEL if not os.path.exists(f)]
if miss: sys.exit('找不到要刪的檔：%s' % miss)

# 2) 要改的檔（先全部算好，最後一起寫）
W = {}
def edit(path, fn, expect):
    s = open(path, encoding='utf-8').read(); t, n = fn(s)
    if n != expect: sys.exit('%s：預期改 %d 處，實際 %d 處' % (path, expect, n))
    W[path] = t

# assets3d.js：manifest 五行
edit('src/assets3d.js', lambda s: re.subn(r"^[ \t]*'char\.econ_(%s)':[^\n]*\n" % ALT, '', s, flags=re.M), 5)
# character3d.js：坐姿表五格、配件表三格
def c3(s):
    s, a = re.subn(r"'bl_econ_(%s)\.vrm':\[[^\]]*\],?" % ALT, '', s)
    s, b = re.subn(r"'char\.econ_(%s)':\[(?:[^\[\]{}]|\{[^{}]*\})*\],?" % ALT, '', s)
    return s, a + b
edit('src/character3d.js', c3, 8)
# tools/anim/sit_fit.json：五格
def sf(s):
    j = json.loads(s); ks = [k for k in j if re.fullmatch(r'bl_econ_(%s)\.vrm' % ALT, k)]
    for k in ks: del j[k]
    ind = 1 if s.startswith('{\n ') and not s.startswith('{\n  ') else 2
    return json.dumps(j, ensure_ascii=False, indent=ind) + ('\n' if s.endswith('\n') else ''), len(ks)
edit('tools/anim/sit_fit.json', sf, 5)
# LICENSES.md：只講這五個人的模型或立繪的列
def lic(s):
    L = s.split('\n'); keep = []; n = 0
    for l in L:
        if l.startswith('|') and re.search(r'bl_econ_(%s)\.vrm|portraits/(\{)?econ_(%s)' % (ALT, ALT), l):
            n += 1; continue
        keep.append(l)
    return '\n'.join(keep), n
edit('LICENSES.md', lic, 6)

# 3) 檢查：改完的程式不能再提到這五個 id
for p, t in W.items():
    if p.endswith('.js') and re.search(r'econ_(%s)' % ALT, t): sys.exit('%s 改完還有 id' % p)

print('刪 %d 個檔、改 %d 個檔' % (len(DEL), len(W)))
if DRY:
    for f in DEL: print('  rm', f)
    for p in W: print('  edit', p)
    sys.exit(0)
for p, t in W.items(): open(p, 'w', encoding='utf-8').write(t)
sh('git', 'rm', '-q', '-r', '--', *DEL)
# 4) 立繪清單重產（照實際存在的檔）
print(sh(sys.executable, 'tools/gen_portrait_manifest.py')[:0] or 'portrait_manifest.js 重產完成')
print('完成。請跑：node tests/release_pack_unit.js 和改到的測試')
