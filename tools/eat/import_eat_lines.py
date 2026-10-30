#!/usr/bin/env python3
"""X67 吃東西（AA_329）的台詞 → src/data/eat_lines.js（照原文，不改字）。
另讀 AA_336 第 A 節 A4（AA-C 2026-10-20 回 LAWWW 實作問題）：便利商店上次沒加熱的，第 5 次那一句換成另一句、祐廷回一句。
只讀匯入白名單（docs/handoff/story_import_allow.json）上 approved 的那一版（tools/story/import_guard.py）。
用法：python3 tools/eat/import_eat_lines.py"""
import json, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG
PATH = 'docs/story_planning/AA_329_吃東西_一起吃_吃過的_店員認得你.md'
PATH_A = 'docs/story_planning/AA_336_回LAWWW_X67吃東西四題_1B1C實作十三題.md'
allow = IG.load(ROOT)
def read_allowed(path):
    hit = [e for e in allow.get('files', []) if e.get('path') == path and e.get('status') == 'approved']
    if not hit: sys.exit(f'{path} 不在匯入白名單')
    sha = hit[0]['sha']; ok, why = IG.allowed(path, sha, allow)
    if not ok: sys.exit(why)
    return sha, IG.read_fix(subprocess.run(['git', 'show', f'{sha}:{path}'], cwd=ROOT, capture_output=True, text=True, check=True).stdout)  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
SHA, src = read_allowed(PATH)
# AA_497 第 8 節第 3 點（企劃線 60fc3b9a3，AA-C 定）：芯慈追劇減量——朋友以上那一句換句（原文照讀，讀完照這張表換；沒找到原句＝稿變了，停下來）
FIX = [('剛好。我昨天看了一部劇，沒有人可以講。', '剛好。我昨天把筆記重抄了一遍，沒有人可以講。')]
for a, b in FIX:
    if a not in src: raise SystemExit('AA_329 找不到要換的句子：' + a)
    src = src.replace(a, b)
SHA_A, src_a = read_allowed(PATH_A)
SPK = {'以安': 'heroine_01', '芷若': 'heroine_02', '語彤': 'heroine_03', '子晴': 'heroine_04', '學姊': 'heroine_05', '沛珊': 'classmate_peishan', '可昕': 'kexin',
       '阿哲': 'zhe', 'Alison': 'yu', '柏翰': 'classmate_bohan', '芯慈': 'classmate_xinci', '明軒': 'classmate_mingxuan', '祐廷': 'me'}
SEC = {'沈以安': 'heroine_01', '林芷若': 'heroine_02', '陳語彤': 'heroine_03', '高子晴': 'heroine_04', '溫書瑀': 'heroine_05', '郭沛珊': 'classmate_peishan', '杜可昕': 'kexin',
       '阿哲': 'zhe', 'Alison': 'yu', '柏翰': 'classmate_bohan', '芯慈': 'classmate_xinci', '明軒': 'classmate_mingxuan'}
GRP = {'剛認識': 'ACQ', '熟': 'FAM', '朋友以上': 'FRI', '交往中': 'dating', '分開以後、朋友以上': 'exFriend', '分開以後、不到朋友': 'exLow'}
def quote(line):
    m = re.match(r'^\s*>\s?(.*)$', line)
    if not m: return None
    t = m.group(1).strip()
    if not t: return None
    if t.startswith('（'): return [None, t]
    m2 = re.match(r'^([^：]{1,6})：(.+)$', t)   # 說話的人最多 6 個字（AA_380 小語改名 Alison 以後超過 4 個字，原本的 {1,4} 讀不到；2026-10-28 改，重產的結果和改前的 eat_lines.js 一字不差）
    if m2 and m2.group(1) in SPK: return [SPK[m2.group(1)], m2.group(2)]
    raise SystemExit('認不得的台詞行：' + t)
lines = src.split('\n')
sec = lambda title: next(i for i, l in enumerate(lines) if l.startswith(title))
# 0. 共通
s0, s1, s2, s3, s4 = sec('## 0.'), sec('## 1.'), sec('## 2.'), sec('## 3.'), sec('## 4.')
q0 = [quote(l) for l in lines[s0:s1] if quote(l)]
OPEN, RECYCLE, DOOR = q0[0][1], q0[1][1], q0[2][1]
door_shops = re.search(r'店裡沒有回收台的（([^）]+)）', '\n'.join(lines[s0:s1])).group(1).split('、')
# 1. 一起吃
together, cur, grp = {}, None, None
for l in lines[s1:s2]:
    m = re.match(r'^### 1-\d+\. (\S+)', l)
    if m:
        name = re.sub(r'（.*$', '', m.group(1)); cur = SEC[name]; together[cur] = {}; grp = None; continue
    m = re.match(r'^- \*\*([^*]+)\*\*', l)
    if m and cur:
        g = re.sub(r'（.*$', '', m.group(1)); grp = GRP[g]; together[cur][grp] = []; continue
    q = quote(l)
    if q and cur and grp: together[cur][grp].append(q)
# 2. 吃過的
first = {}
for l in lines[s2:s3]:
    m = re.match(r'^\| ([^|]+?) \| (（[^|]+）) \|$', l)
    if m: first[m.group(1).strip()] = m.group(2).strip()
# 3. 店員認得你
staff = {}
for l in lines[s3:s4]:
    m = re.match(r'^\| ([^|]+?) \| ([^|]+?) \| 「([^|]+)」 \| (.+) \|$', l)
    if not m or m.group(1) == '店': continue
    same = m.group(4).strip(); alt = None
    m2 = re.match(r'^「([^」]+)」（上次(.+?)的：「([^」]+)」）$', same)
    if m2: same, alt = m2.group(1), {'when': m2.group(2), 't': m2.group(3)}
    else:
        m3 = re.match(r'^「([^」]+)」', same); same = m3.group(1) if m3 else same
    staff[m.group(1).strip()] = {'who': m.group(2).strip(), 'line5': m.group(3), 'same': same, 'alt': alt}
yt = re.search(r'語彤：(……阿姨說，你的不用問。)', '\n'.join(lines[s3:s4])).group(1)
# AA_336 A4：便利商店上次沒加熱的，店員第 5 次那一句改說另一句，回一句（AA-C：「上次沒加熱的，店員改說「**一樣不用加熱，對吧。**」，回「好。」」）
a4 = next(l for l in src_a.split('\n') if l.startswith('| A4 |'))
m4 = re.search(r'上次沒加熱的，店員改說「\*\*([^*」]+)\*\*」，回「([^」]+)」', a4)
if not m4: raise SystemExit('AA_336 A4 那一列格式變了：' + a4)
staff['公館的便利商店']['line5Alt'] = {'when': '沒加熱', 't': m4.group(1), 'reply': m4.group(2)}
data = {'source': f'AA_329（企劃 {SHA}）＋AA_336 第 A 節（企劃 {SHA_A}）＋AA_497 第 8 節第 3 點換一句（企劃 60fc3b9a3）', 'open': OPEN, 'closeRecycle': RECYCLE, 'closeDoor': DOOR, 'doorShops': door_shops,
        'together': together, 'first': first, 'staff': staff, 'staffYutong': ['heroine_03', yt]}
n = sum(len(v) for g in together.values() for v in g.values())
assert len(together) == 12 and len(first) == 15 and len(staff) == 16, (len(together), len(first), len(staff))
out = ('/* ===== 吃東西（X67，使用者 10-20「吃東西好像只是花錢沒有別的功用」）：一起吃、吃過的、店員認得你——台詞 AA_329＋AA_336 第 A 節（AA-C 定稿，D100 照抄）=====\n'
       f'   自動產生：python3 tools/eat/import_eat_lines.py（只讀匯入白名單上的版本 AA_329@{SHA}、AA_336@{SHA_A}）。不要手改；改字請 AA 改企劃、改白名單、重匯。\n'
       '   together[id][ACQ|FAM|FRI|dating|exFriend|exLow]＝[說話的人, 台詞]（null＝旁白、me＝祐廷）；first[店]＝第一次的旁白；staff[店]＝{who,line5,same,alt}；\n'
       '   staff[店].line5Alt＝{when,t,reply}：上次點的東西符合 when 時，第 5 次那一句換成 t、祐廷回 reply（AA_336 A4，只有便利商店）。程式：src/eat3d.js */\n'
       "'use strict';\nconst EAT_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
open(os.path.join(ROOT, 'src/data/eat_lines.js'), 'w', encoding='utf-8').write(out)
print(f'wrote src/data/eat_lines.js：一起吃 {len(together)} 人、{n} 句；吃過的 {len(first)} 間；店員 {len(staff)} 間；來源 AA_329@{SHA}、AA_336@{SHA_A}')
