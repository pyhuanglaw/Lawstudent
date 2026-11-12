#!/usr/bin/env python3
"""畢業以後的固定格（AA_366 第二版：可昕「我們的日子」；AA_367：交往中的六位每月一格）→ src/data/pg_dates.js。台詞一字不改。
只匯入 docs/handoff/story_import_allow.json 列出、status approved 的版本（從名單上的 commit 讀）。
讀的表：
  AA_366 第 1 節「五段」（每一段的開頭那一則＝日子＋「」裡的句子；哪幾天＝那一段的日子、時間）、第 2 節「每一格她說的一句」（段、日子、她說）。
  AA_367 第 1～6 節每一位的月份表（月、她說；句子後面的（視訊）（打烊後）（電影）（台南）照抄在 note）。第 8 節（盤點）不讀。
時間、地點、哪幾個月不排是規則，寫在 src/pgdates3d.js（照稿的條文，註解寫出處）。
AA_523（學姊第十六批）第 6 節 6-5：學姊 2029-06 那一句換成「修正本改完了。這禮拜印，下禮拜交。」（白名單上有 AA_523 才換；整句相同才換）。
AA_759（X327 沛珊重寫，白名單上的 commit）：沛珊每月一格 17 句裡的 12 句照稿的 old→new 疊（整句相同才換；ym、note、格數不動）。
用法：python3 tools/story/import_pg_dates.py"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
P367 = 'docs/story_planning/AA_367_畢業以後的交往節奏_六位.md'
APPROVED = G.approved_files(ALLOW, 'docs/story_planning/')


def read(p):
    if p not in APPROVED: sys.exit('拒絕匯入：' + p + ' 不在白名單')
    ok, why = G.allowed(p, APPROVED[p], ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    return G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True)), APPROVED[p]  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）


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


# ---------- AA_366（可昕畢業以後的「我們的日子」）：CANON-NO-ECON-1112 第三批拿掉（固定的「我們的日子」只是兩校才需要；白名單那一筆也拿掉了）——不讀、可昕的格子空著 ----------
segs, slots = {}, []

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
# 9aa8ec40c（AA_593 學姊①b 第 38 列）：學姊 2029-09 整列刪掉（「2029-09：不排」）＝101 句；表上沒有那個月＝那個月不排（src/pgdates3d.js 第 21 行的規則）
if list(six) != ORDER or sum(len(v) for v in six.values()) != 101 or any(c['ym'] == '2029-09' for c in six.get('heroine_05', [])): sys.exit(f'AA_367：{ {k: len(v) for k, v in six.items()} }（應該是六位、101 句；學姊沒有 2029-09）')

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

# ---------- AA_759（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；白名單上的 commit、只認那一版）：沛珊畢業以後每月一格 17 句裡的 12 句照新設定換（files['src/data/pg_dates.js']：where＝第幾格、old→new）。
#      源稿 AA_367 第 6 節沒改（企劃線），照表疊：six.classmate_peishan[i].line 整句等於 old 才換（已經是 new＝源稿自己改好了，跳過；都不是＝停下來）。ym、note、格數不動 ----------
P759 = 'docs/story_planning/AA_759_peishan_misc2.json'
src759 = None
if P759 in APPROVED:
    t759, s759 = read(P759)
    rows759 = json.loads(t759)['files'].get('src/data/pg_dates.js') or []
    if len(rows759) != 12: sys.exit(f'AA_759@{s759}：pg_dates.js 應該是 12 列，讀到 {len(rows759)} 列')
    cells759 = six.get('classmate_peishan') or []; n759 = 0
    for r in rows759:
        m = re.search(r'\[(\d+)\]$', r['where'])
        if not m or int(m.group(1)) >= len(cells759): sys.exit(f'AA_759 pg_dates.js：where「{r["where"]}」不是第幾格（或沒有那一格）')
        cell = cells759[int(m.group(1))]
        if cell['line'] == r['new']: continue
        if cell['line'] != r['old']: sys.exit(f'AA_759 pg_dates.js {r["where"]}：現在是「{cell["line"]}」，不是原句「{r["old"]}」')
        cell['line'] = r['new']; n759 += 1
    src759 = f'{P759}@{s759}（沛珊每月一格 12 列，換了 {n759} 列）'

out = {'source': {'AA_367': f'{P367}@{s367}'}, 'kexin': {'segs': segs, 'slots': slots}, 'six': six}   # kexin 空著：src/pgdates3d.js 照舊讀得到（沒有格子）
if src523: out['source']['AA_523'] = src523
if src759: out['source']['AA_759'] = src759
js = ('/* 自動產生：tools/story/import_pg_dates.py（AA_366 第二版、AA_367；企劃線照白名單的 commit；台詞一字不改）。不要手改：改企劃、白名單以後重跑。\n'
      '   kexin.segs＝五段（open 開頭那一則的日子、lines 那兩則、h 時間；p3 照 KX_OUR_DAY.day）；kexin.slots＝每一格（seg、key 稿上的日子、week＝那一週、line 她說）；\n'
      '   six＝六位每一個月（ym、line、note 稿上句子後面的註）。規則在 src/pgdates3d.js */\n'
      "'use strict';\nconst PG_DATES=" + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
open(os.path.join(ROOT, 'src/data/pg_dates.js'), 'w', encoding='utf-8').write(js)
print('src/data/pg_dates.js：可昕', len(slots), '格、開頭', len(segs), '則；六位', {k: len(v) for k, v in six.items()})
# AA_630／AA_627 表 B（語彤台詞改寫，YT-REWRITE-1103）：寫完再照白名單上的逐句表換一次（整句相同才換；tools/story/aa630.py）
import sys as _sys, os as _os
_R0 = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))); _sys.path.insert(0, _os.path.join(_R0, 'tools', 'story'))
import aa630 as _aa630, import_guard as _ig
_aa630.patch_file(_aa630.load(_R0, _ig.load(_R0), _ig), 'src/data/pg_dates.js', _R0)
