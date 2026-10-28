#!/usr/bin/env python3
"""畢業以後的固定格（AA_366 第二版：可昕「我們的日子」；AA_367：交往中的六位每月一格）→ src/data/pg_dates.js。台詞一字不改。
只匯入 docs/handoff/story_import_allow.json 列出、status approved 的版本（從名單上的 commit 讀）。
讀的表：
  AA_366 第 1 節「五段」（每一段的開頭那一則＝日子＋「」裡的句子；哪幾天＝那一段的日子、時間）、第 2 節「每一格她說的一句」（段、日子、她說）。
  AA_367 第 1～6 節每一位的月份表（月、她說；句子後面的（視訊）（打烊後）（電影）（台南）照抄在 note）。第 8 節（盤點）不讀。
時間、地點、哪幾個月不排是規則，寫在 src/pgdates3d.js（照稿的條文，註解寫出處）。
AA_523（學姊第十六批）第 6 節 6-5：學姊 2029-06 那一句換成「修正本改完了。這禮拜印，下禮拜交。」（白名單上有 AA_523 才換；整句相同才換）。
用法：python3 tools/story/import_pg_dates.py"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
P366 = 'docs/story_planning/AA_366_可昕我們的日子_畢業以後.md'
P367 = 'docs/story_planning/AA_367_畢業以後的交往節奏_六位.md'
APPROVED = G.approved_files(ALLOW, 'docs/story_planning/')


def read(p):
    if p not in APPROVED: sys.exit('拒絕匯入：' + p + ' 不在白名單')
    ok, why = G.allowed(p, APPROVED[p], ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    return G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True)), APPROVED[p]  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）


def cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


def one_quote(cell, where):
    """整格是一句「……」（後面可以接（視訊）這類的註）：回傳 (句子, 註)"""
    m = re.match(r'^「(.*)」((?:（[^）]*）)?)$', cell)
    if not m or '「' in m.group(1) or '」' in m.group(1): sys.exit(f'{where}：讀不出那一句（{cell}）')
    return m.group(1), m.group(2)


def iso(md, year):
    m, d = md.split('/')
    return f'{year}-{int(m):02d}-{int(d):02d}'


# ---------- AA_366 ----------
t366, s366 = read(P366)
sec = None
segs, slots = {}, []
SEG_YEAR = {'p1': 2029, 'p2': 2029, 'p3': 2029, 'p4': None, 'p5': 2030}
yr = lambda seg, md: SEG_YEAR[seg] or (2029 if int(md.split('/')[0]) >= 6 else 2030)   # P4：12 月是 2029，1 月是 2030
for line in t366.split('\n'):
    if line.startswith('## '): sec = line; continue
    if not sec or not line.startswith('| P'): continue
    c = cells(line); seg = c[0].split()[0].lower()
    if seg not in SEG_YEAR: sys.exit(f'AA_366：認不得的段（{c[0]}）')
    if sec.startswith('## 1.'):
        m = re.match(r'^(\d+/\d+)(?:（.）)?：', c[3])
        if not m: sys.exit(f'AA_366 第 1 節 {seg}：開頭那一則讀不出日子（{c[3]}）')
        lines = re.findall(r'「([^」]*)」', c[3])
        if len(lines) != 2: sys.exit(f'AA_366 第 1 節 {seg}：開頭那一則不是兩句（{c[3]}）')
        days = c[2]
        if seg == 'p3':
            wh = re.search(r'週五 (\d\d):00／週六、週日 (\d\d):00', days)
            if not wh: sys.exit('AA_366 第 1 節 p3：讀不出週五／週六、週日的時間')
            h = {'fri': int(wh.group(1)), 'sat': int(wh.group(2)), 'sun': int(wh.group(2))}
        else:
            wh = re.search(r'(\d\d):00', days)
            if not wh: sys.exit(f'AA_366 第 1 節 {seg}：讀不出時間（{days}）')
            h = int(wh.group(1))
        lst = days.split('：', 1)[1] if '：' in days else ''
        lst = re.sub(r'（[^）]*）', '', lst).replace('那三週', '')
        dl = [iso(x.strip(), yr(seg, x.strip())) for x in lst.split('、') if re.match(r'^\d+/\d+$', x.strip())]
        segs[seg] = {'open': iso(m.group(1), yr(seg, m.group(1))), 'lines': lines, 'h': h, 'days': dl, 'call': '電話' in days}
    elif sec.startswith('## 2.'):
        md = c[1].replace('那週', '').strip()
        line_, note = one_quote(c[2], f'AA_366 第 2 節 {seg} {c[1]}')
        s = {'seg': seg, 'key': iso(md, yr(seg, md)), 'line': line_}
        if '那週' in c[1]: s['week'] = True
        slots.append(s)
if sorted(segs) != ['p1', 'p2', 'p3', 'p4', 'p5'] or len(slots) != 25: sys.exit(f'AA_366：段 {sorted(segs)}、格 {len(slots)}（應該是五段、25 格）')
for seg, S in segs.items():   # 第 1 節的日子＝第 2 節的日子（照順序）
    got = [s['key'] for s in slots if s['seg'] == seg]
    if got != S['days']: sys.exit(f'AA_366 {seg}：第 1 節的日子 {S["days"]} 和第 2 節 {got} 不一樣')
    del S['days']

# ---------- AA_367 ----------
t367, s367 = read(P367)
six, who = {}, None
ORDER = ['heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan']
for line in t367.split('\n'):
    m = re.match(r'^## (\d)\. .*?（(\w+)）\s*$', line)
    if m: who = m.group(2) if m.group(1) in '123456' else None; continue
    if line.startswith('## '): who = None; continue
    m = re.match(r'^\| (20\d\d-\d\d) \| (.*) \|$', line)
    if not (m and who): continue
    line_, note = one_quote(m.group(2), f'AA_367 {who} {m.group(1)}')
    six.setdefault(who, []).append({'ym': m.group(1), 'line': line_, 'note': note.strip('（）')})
if list(six) != ORDER or sum(len(v) for v in six.values()) != 102: sys.exit(f'AA_367：{ {k: len(v) for k, v in six.items()} }（應該是六位、102 句）')

# ---------- AA_523（學姊第十六批，SIS-B16-1028；白名單上的 commit，AA-C 定稿）第 6 節 6-5：學姊 2029-06 那一格「論文送進圖書館了。……」早於 6/20「交了。」（修正本）——
#      換成「修正本改完了。這禮拜印，下禮拜交。」（送圖書館的事放在 7 月以後，這一批不寫）。整句相同才換；已經是新句就跳過，都不是＝停下來（同 tools/ladder/import_ladder.py 的 _fix）----------
P523 = 'docs/story_planning/AA_523_學姊第十六批_回臺灣以後的最後半年.md'
src523 = None
if P523 in APPROVED:
    t523, s523 = read(P523)
    OLD523, NEW523 = '論文送進圖書館了。櫃台的人蓋了章，說『好，下一位』。……就這樣。', '修正本改完了。這禮拜印，下禮拜交。'
    if '「' + NEW523 + '」' not in t523: sys.exit(f'AA_523@{s523} 裡找不到 6-5 的「改成」：{NEW523}')
    cell = next((x for x in six.get('heroine_05', []) if x['ym'] == '2029-06'), None)
    if cell is None: sys.exit('AA_367：學姊沒有 2029-06 那一格')
    if cell['line'] == OLD523: cell['line'] = NEW523
    elif cell['line'] != NEW523: sys.exit(f'AA_523 6-5：學姊 2029-06 那一格是 {cell["line"]}（應該是舊句或新句）')
    src523 = f'{P523}@{s523}（6-5 學姊 2029-06 那一格）'

out = {'source': {'AA_366': f'{P366}@{s366}', 'AA_367': f'{P367}@{s367}'}, 'kexin': {'segs': segs, 'slots': slots}, 'six': six}
if src523: out['source']['AA_523'] = src523
js = ('/* 自動產生：tools/story/import_pg_dates.py（AA_366 第二版、AA_367；企劃線照白名單的 commit；台詞一字不改）。不要手改：改企劃、白名單以後重跑。\n'
      '   kexin.segs＝五段（open 開頭那一則的日子、lines 那兩則、h 時間；p3 照 KX_OUR_DAY.day）；kexin.slots＝每一格（seg、key 稿上的日子、week＝那一週、line 她說）；\n'
      '   six＝六位每一個月（ym、line、note 稿上句子後面的註）。規則在 src/pgdates3d.js */\n'
      "'use strict';\nconst PG_DATES=" + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
open(os.path.join(ROOT, 'src/data/pg_dates.js'), 'w', encoding='utf-8').write(js)
print('src/data/pg_dates.js：可昕', len(slots), '格、開頭', len(segs), '則；六位', {k: len(v) for k, v in six.items()})
