"""校外單獨約會的資料（企劃線 docs/story_planning/date_system/：地點表 D01～D32、128 個互動點的時間與花費）→ src/data/date_locations.js。
**只匯入 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本**（D94 第 5 點；不從分支最新讀）。內容一字不改。
用法：python3 tools/date/import_dates.py [--check 企劃線ref]"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
P = 'docs/story_planning/date_system/'
FILES = {'locations': P + 'date_locations.json', 'points': P + 'point_specs.json'}
APPROVED = G.approved_files(ALLOW, P)
for k, p in FILES.items():
    ok, why = G.allowed(p, APPROVED.get(p, ''), ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
if '--check' in sys.argv:
    ref = sys.argv[sys.argv.index('--check') + 1]
    for p in FILES.values():
        same = subprocess.run(['git', '-C', ROOT, 'diff', '--quiet', APPROVED[p], ref, '--', p]).returncode == 0
        print(('一樣：' if same else f'分支上的版本和白名單（{APPROVED[p]}）不同、不會匯入：') + p)
    sys.exit(0)
show = lambda p: json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True)))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
loc, pts = show(FILES['locations']), show(FILES['points'])
out = {'source': '白名單 ' + '＋'.join(f'{os.path.basename(p)}@{APPROVED[p]}' for p in FILES.values()),
       'codes': loc.get('_codes'), 'heroineIds': loc.get('heroineIds'), 'lodging': loc.get('lodging'),
       'locations': {l['id']: l for l in loc['locations']}, 'points': pts}
dst = os.path.join(ROOT, 'src', 'data', 'date_locations.js')
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 校外單獨約會的地點與互動點（AA_128 第 2 節、AA_148；企劃線 docs/story_planning/date_system/）。產生器：tools/date/import_dates.py（不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst DATE_DATA=" + json.dumps(out, ensure_ascii=False) + ';\n')
print('wrote', dst, len(out['locations']), '個地點')
