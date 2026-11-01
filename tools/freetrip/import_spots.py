"""捷運自由出行的景點（DL-06／DL-06B；AA_160 第 4 節、AA_161）→ src/data/free_trips.js。
第一批（spots_v1，DL-06 當時照抄進 free_trips.js）照現在檔案裡的內容保留；第二批以後**只匯入 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本**（不從分支最新讀）。內容一字不改。
同一個景點 id 出現在新的批次就用新的那一份。
用法：python3 tools/freetrip/import_spots.py"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
DST = os.path.join(ROOT, 'src', 'data', 'free_trips.js')
BATCHES = ['docs/story_planning/free_trip/spots_v2.json', 'docs/story_planning/free_trip/spots_v3.json']
APPROVED = G.approved_files(ALLOW, 'docs/story_planning/free_trip/')
src = open(DST, encoding='utf8').read()
cur = json.loads(src[src.index('{'):src.rindex('}') + 1])
head = src[:src.index('const FREE_TRIPS')]
v1 = [s for s in cur['spots'] if s.get('batch', 1) == 1]   # 第一批：原本檔案裡的
spots = {s['id']: s for s in v1}
used = []
for p in BATCHES:
    ok, why = G.allowed(p, APPROVED.get(p, ''), ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True)))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
    for s in d['spots']:
        spots[s['id']] = dict(s, batch=d.get('batch', 2))
    used.append(f'{os.path.basename(p)}@{APPROVED[p]}')
out = {'rules': cur['rules'], 'source': '第一批＝DL-06 照抄（free_trips.js 原有）＋白名單 ' + '＋'.join(used), 'spots': list(spots.values())}
if not head.strip().endswith('*/'):
    head = head.rstrip() + '\n'
head = re.sub(r'/\* 自由出行第一批四個景點（DL-06）.*?\*/', '/* 捷運自由出行的景點（DL-06 第一批四處、DL-06B 第二批五處、DL-06C 第三批十八處）：AA_161、docs/story_planning/free_trip/spots_v*.json 照抄，不在這裡改內容。\n   產生器：tools/freetrip/import_spots.py（第二批以後只讀匯入白名單的版本）。規則在 AA_160 第 4 節；rules 是 AA 寫的施工說明。 */', head, flags=re.S)
with open(DST, 'w', encoding='utf8') as fo:
    fo.write(head + 'const FREE_TRIPS=' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print('wrote', DST, [s['id'] for s in out['spots']], out['source'])
