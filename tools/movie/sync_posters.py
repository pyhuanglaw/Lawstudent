#!/usr/bin/env python3
"""把企劃線 BB 檢查通過的電影海報接進遊戲（X314／MOVIE-POSTERS-ALL-1110）。
讀 origin/claude/story-planning 的 docs/story_planning/bg_approved/posters/README.md：表格裡「檢查」欄以「通過」開頭的 id，
而且那個 .webp 在企劃線上有、在片單（src/data/nanyang_movies.js）裡有 → 複製到 assets/posters/<id>.webp。
再改 src/movies3d.js 的 S.POSTERS（assets/posters 裡所有的）、LICENSES.md「南洋戲院電影海報第四批起」那一列的 id 清單。
用法：git fetch origin claude/story-planning；python3 tools/movie/sync_posters.py [--ref origin/claude/story-planning]
最後印：遊戲裡幾張、片單幾張、還缺哪些。"""
import os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else 'origin/claude/story-planning'
D = 'docs/story_planning/bg_approved/posters/'
def git(*a, binary=False):
    r = subprocess.run(['git', '-C', ROOT] + list(a), capture_output=True)
    if r.returncode: raise SystemExit('git ' + ' '.join(a) + ' 失敗：' + r.stderr.decode('utf-8', 'replace'))
    return r.stdout if binary else r.stdout.decode('utf-8')
need = sorted(set(re.findall(r'm\d{4}[ab]', open(os.path.join(ROOT, 'src/data/nanyang_movies.js'), encoding='utf-8').read())))
readme = git('show', f'{ref}:{D}README.md')
ok = sorted({m.group(1) for m in re.finditer(r'^\| (m\d{4}[ab]) \|[^|]*\| *通過', readme, re.M)})
have_remote = set(re.findall(r'(m\d{4}[ab])\.webp', git('ls-tree', '--name-only', f'{ref}:{D}')))
os.makedirs(os.path.join(ROOT, 'assets/posters'), exist_ok=True)
added = []
for i in ok:
    if i not in need or i not in have_remote: continue
    dst = os.path.join(ROOT, 'assets/posters', i + '.webp')
    if not os.path.exists(dst):
        open(dst, 'wb').write(git('show', f'{ref}:{D}{i}.webp', binary=True)); added.append(i)
ids = sorted(f[:-5] for f in os.listdir(os.path.join(ROOT, 'assets/posters')) if f.endswith('.webp'))
p = os.path.join(ROOT, 'src/movies3d.js'); s = open(p, encoding='utf-8').read()
s = re.sub(r"S\.POSTERS=\[[^\]]*\];", "S.POSTERS=" + repr(ids).replace(' ', '') + ";", s, count=1); open(p, 'w', encoding='utf-8').write(s)
FIRST = ['m2509a','m2509b','m2511a','m2511b','m2601a','m2601b','m2603a','m2603b','m2605a','m2605b']
rest = [i for i in ids if i not in FIRST]
p = os.path.join(ROOT, 'LICENSES.md'); L = open(p, encoding='utf-8').read().split('\n')
for k, l in enumerate(L):
    if l.startswith('| 南洋戲院電影海報第四批起'):
        cells = l.split(' | ')
        cells[0] = f"| 南洋戲院電影海報第四批起 {len(rest)} 張 {'、'.join(rest)}（`assets/posters/<id>.webp`，1024×1536；片單 AA_730 的 id；企劃線 `claude/story-planning` `docs/story_planning/bg_approved/posters/` 照原檔複製，檢查紀錄同資料夾 README；tools/movie/sync_posters.py）"
        L[k] = ' | '.join(cells)
open(p, 'w', encoding='utf-8').write('\n'.join(L))
miss = [i for i in need if i not in ids]
print(f'新接 {len(added)} 張：{"、".join(added) or "（沒有）"}')
print(f'遊戲裡 {len(ids)}／片單 {len(need)}；還缺 {len(miss)}：{" ".join(miss)}')
sys.exit(0)
