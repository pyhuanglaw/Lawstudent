"""週末回臺北的家：家人台詞池（企劃線 docs/story_planning/AA_138_回家_家人台詞池.md；AA-B 2026-10-15 定案、直接實作）→ src/data/home_lines.js。台詞一字不改。
用法：python3 tools/home/import_home_lines.py [企劃線的 ref，帳號 B 值班期間預設 origin/claude/cool-heisenberg-o8kuqx]"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
from import_guard import alison
REF = sys.argv[1] if len(sys.argv) > 1 else 'origin/claude/cool-heisenberg-o8kuqx'
PATH = 'docs/story_planning/AA_138_回家_家人台詞池.md'
sha = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', REF], text=True).strip()
md = alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{REF}:{PATH}'], text=True))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
def section(title):
    i = md.index('**' + title); j = md.find('\n**', i + 2); k = md.find('\n## ', i)
    ends = [x for x in (j, k) if x > 0]; return md[i:min(ends) if ends else len(md)]
q = lambda s: re.findall(r'「([^」]*)」', s)
def numbered(title):
    out = []
    for line in section(title).splitlines():
        m = re.match(r'\s*\d+\.\s*(?:(媽媽|爸爸)：)?(.*)$', line)
        if not m: continue
        t = m.group(2).strip(); qq = q(t)
        text = qq[0] if qq else t
        if t.startswith('（') and t.endswith('）'): text = t   # 動作旁白（長輩圖、看報紙）
        elif qq and '（' in t and t.index('（') < t.index('「'): text = t[:t.index('「')] + qq[0]   # 「（在看報紙）今天……」
        out.append({'who': m.group(1) or None, 't': text})
    return out
group = numbered('群組'); arrive = numbered('到家'); morning = numbered('早上'); car = numbered('車'); back = numbered('回宿舍'); sis = numbered('宜蓁在家的晚餐')
dinner = []
for line in section('晚餐').splitlines():
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if len(cells) < 4 or not cells[0].isdigit(): continue
    mom = q(cells[1]); opts = re.findall(r'▸「([^」]*)」([^／]*)', cells[2]); dad = cells[3]
    d = {'n': int(cells[0]), 'mom': mom[0], 'opts': [], 'dad': dad.replace('「', '').replace('」', '') if dad.startswith('「（') else (q(dad)[0] + (re.sub(r'「[^」]*」', '', dad).strip() and '' or ''))}
    for t, rest in opts:
        o = {'t': t}
        if 'KAI_ROOM_RULES' in rest: o['ifMem'] = ['kai', 'KAI_ROOM_RULES']
        d['opts'].append(o)
    m = re.search(r'第 (\d+)～(\d+) 週', cells[1])
    if m: d['weeks'] = [int(m.group(1)), int(m.group(2))]
    act = re.search(r'」（([^）]*)）$', dad)
    if act: d['dadAct'] = act.group(1)
    dinner.append(d)
# AA_532 第 7 節（AA-B 定稿 D109，任務 AA532-VAC-FIX-1030）：晚餐選項「我才大一。」大四還會出現 → 換成稿上那一句（媽媽的收尾照舊）。
# 讀白名單（docs/handoff/story_import_allow.json）上 approved 的 AA_532 那一版；稿裡找不到這一句就不換
from import_guard import load as _load, allowed as _allowed, approved_files as _approved
A532 = 'docs/story_planning/AA_532_D99寒暑假一_過年期間別約_除夕年夜飯_家人群組_她們的放假版.md'
_allow = _load(ROOT); a532_sha = _approved(_allow, 'docs/story_planning/AA_532').get(A532)
if a532_sha:
    ok, why = _allowed(A532, a532_sha, _allow)
    if not ok: raise SystemExit(why)
    a532 = subprocess.check_output(['git', '-C', ROOT, 'show', f'{a532_sha}:{A532}'], text=True)
    m532 = re.search(r'「我才大一。」.*?改成「([^」]+)」', a532, re.S)
    if m532:
        for d in dinner:
            for o in d['opts']:
                if o['t'] == '我才大一。': o['t'] = m532.group(1)
reply = section('群組')
rep = {'yes': q(re.search(r'「會回去」→ 媽媽：(.*?)；', reply).group(1)), 'no': q(re.search(r'「這週不回」→ 媽媽：(.*?)；', reply).group(1)), 'none': q(re.search(r'不回 → 爸爸(?:（[^）]*）)?兩小時後：(.*)$', reply, re.M).group(1))}
out = {'source': REF.replace('origin/', '') + ' ' + sha + (('＋AA_532 ' + a532_sha) if a532_sha else ''),'group': group, 'groupReply': rep, 'arrive': arrive, 'dinner': dinner, 'sisDinner': sis, 'morning': morning, 'car': car, 'back': back}
dst = os.path.join(ROOT, 'src', 'data', 'home_lines.js')
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 週末回臺北的家：家人台詞池（AA_138；產生器 tools/home/import_home_lines.py，不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst HOME_LINES=" + json.dumps(out, ensure_ascii=False, indent=0) + ';\n')
print('wrote', dst, {k: len(v) for k, v in out.items() if isinstance(v, list)})
