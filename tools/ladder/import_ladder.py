"""閒聊階梯（企劃線 docs/story_planning/ladder/ladder_aa*.json＋ladder_bb*.json，一學期一個檔；使用者 2026-10-15 全案通過、直接實作）→ src/data/ladder.js。台詞一字不改。
用法：python3 tools/ladder/import_ladder.py [企劃線的 ref，帳號 B 值班期間預設 origin/claude/cool-heisenberg-o8kuqx]"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = sys.argv[1] if len(sys.argv) > 1 else 'origin/claude/cool-heisenberg-o8kuqx'
sha = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', REF], text=True).strip()
show = lambda p: json.loads(subprocess.check_output(['git', '-C', ROOT, 'show', f'{REF}:{p}'], text=True))
out = {'source': REF.replace('origin/', '') + ' ' + sha, 'characters': {}, 'terms': {}, 'byTerm': {}, 'kaiDorm': [], 'bikeSeat': {}}
# 一學期一個檔（README 2026-10-16）：ladder_aa.json／ladder_bb.json＝大一上；ladder_aa_y1s2.json 之類＝其他學期（以檔裡的 term 為準）
names = subprocess.check_output(['git', '-C', ROOT, 'ls-tree', '--name-only', f'{REF}:docs/story_planning/ladder/'], text=True).split()
files = sorted(n[:-5] for n in names if re.match(r'^ladder_(aa|bb)(_y\d+s\d)?\.json$', n))
for f in files:
    d = show(f'docs/story_planning/ladder/{f}.json')
    term = d.get('term')
    if not re.match(r'^Y\d+S[12]$', term or ''): sys.exit(f'{f}：term 不對（{term}）')
    bt = out['byTerm'].setdefault(term, {})
    for cid, v in d['characters'].items():
        if cid in bt: sys.exit(f'人物重複：{term} {cid}')
        bt[cid] = {k: v[k] for k in v if k != 'note'}
        if term == 'Y1S1': out['characters'][cid] = bt[cid]; out['terms'][cid] = term
    if d.get('kaiDorm'): out['kaiDorm'] = d['kaiDorm']
    if d.get('bikeSeat'): out['bikeSeat'] = d['bikeSeat']
# 記憶的中文名稱（人物面板）：企劃線檔名有「階梯」的文件裡「| `TAG` | 名稱 |」那種表格；social3d.js 已經有的不重複。
# 有記憶沒有名稱的學期檔先不匯入（印出來，請企劃補表）——不然人物面板會直接顯示英文代號
docs = [n for n in subprocess.check_output(['git', '-C', ROOT, '-c', 'core.quotepath=off', 'ls-tree', '--name-only', f'{REF}:docs/story_planning/'], text=True).split('\n') if n.endswith('.md') and '階梯' in n]
lab = {}
for n in docs:
    for m in re.finditer(r'^\|\s*`([A-Z][A-Z0-9_]+)`\s*\|\s*([^|]+?)\s*\|', subprocess.check_output(['git', '-C', ROOT, 'show', f'{REF}:docs/story_planning/{n}'], text=True), re.M):
        if not m.group(2).strip().startswith('`'): lab.setdefault(m.group(1), m.group(2).strip())
soc = open(os.path.join(ROOT, 'src', 'social3d.js'), encoding='utf8').read()
has = lambda t: bool(re.search(r'\b' + t + r":'", soc)) or t in lab
def mems(cs):
    for v in cs.values():
        for st in v['steps']:
            if st.get('mem'): yield st['mem']
            for ch in st.get('choices') or []:
                if ch.get('mem'): yield ch['mem']
skipped = {}
for t in list(out['byTerm']):
    if t == 'Y1S1': continue
    miss = sorted({m for m in mems(out['byTerm'][t]) if not has(m)})
    if miss: skipped[t] = miss; del out['byTerm'][t]
out['labels'] = {m: lab[m] for c in out['byTerm'].values() for m in mems(c) if m in lab and not re.search(r'\b' + m + r":'", soc)}
if skipped: print('先不匯入（記憶沒有中文名稱，請企劃在階梯文件補「| `代號` | 名稱 |」表）：', {t: len(v) for t, v in skipped.items()}, '例：', {t: v[:3] for t, v in skipped.items()})
y1 = out['byTerm'].pop('Y1S1', {})   # 大一上和 characters 是同一份（下面用 JS 指過去，不重複存）
dst = os.path.join(ROOT, 'src', 'data', 'ladder.js')
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 閒聊階梯（大一上；AA_135、AA_136、BB_130；README 在企劃線 docs/story_planning/ladder/）。產生器：tools/ladder/import_ladder.py（不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst LADDER=" + json.dumps(out, ensure_ascii=False) + ';\nLADDER.byTerm.Y1S1=LADDER.characters;   /* 大一上：舊的 characters／terms 照留（舊程式、舊測試讀得到）*/\n')
print('wrote', dst, 'Y1S1', {k: len(v['steps']) for k, v in out['characters'].items()}, {t: {k: len(v['steps']) for k, v in c.items()} for t, c in out['byTerm'].items()}, 'kaiDorm', len(out['kaiDorm']))
