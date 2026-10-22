"""閒聊階梯（企劃線 docs/story_planning/ladder/ladder_aa*.json＋ladder_bb*.json，一學期一個檔）→ src/data/ladder.js。台詞一字不改。
**只匯入 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本**（使用者 2026-10-17 P0：未批准、WIP、來源版本不明預設拒絕；
不再把企劃線分支上所有階梯檔一次匯入——AA 分支的大一下階梯可昕被改 17 處還沒審）。每個檔從名單上寫的 commit 讀，不從分支最新讀。
要換新版本：AA（人物台詞先經 BB）交付「已審版本＋commit」→ 值班 LAWWW 改白名單 → 再跑這個工具。
AA_372（大一上「知道太早、重複」修正稿，白名單上的 commit）第 13、18 項以安的兩句疊在 ladder_aa.json 上（整句相同才換；ladder_aa.json 自己改好了就跳過）。
AA_373（大一下「時間、人在哪、作廢設定」修正稿，白名單上的 commit）第 6、8、14、25 項的五句同樣疊在大一下的階梯上（byTerm.Y1S2）。
AA_374、AA_375（大二上、大二下修正稿）：一層的一個欄位（週次、句子、選項）用 _fix 疊在 ladder_*_y2s1／y2s2.json 上。
用法：python3 tools/ladder/import_ladder.py [--check 企劃線ref]（--check：只列出分支上和白名單版本不同、或不在名單的檔，不寫檔）"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
APPROVED = G.approved_files(ALLOW, 'docs/story_planning/ladder/')
for p, s in APPROVED.items():
    ok, why = G.allowed(p, s, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
if '--check' in sys.argv:
    ref = sys.argv[sys.argv.index('--check') + 1]
    names = subprocess.check_output(['git', '-C', ROOT, 'ls-tree', '--name-only', f'{ref}:docs/story_planning/ladder/'], text=True).split()
    for n in sorted(names):
        if not re.match(r'^ladder_(aa|bb)(_y\d+s\d)?\.json$', n): continue
        p = 'docs/story_planning/ladder/' + n
        if p not in APPROVED: print('不在白名單（不匯入）：', p); continue
        same = subprocess.run(['git', '-C', ROOT, 'diff', '--quiet', APPROVED[p], ref, '--', p]).returncode == 0
        if not same: print(f'分支上的版本和白名單（{APPROVED[p]}）不同、不會匯入（要先交付已審版本）：', p)
    sys.exit(0)
LREF = ALLOW.get('labelsRef')
if not LREF: sys.exit('白名單沒有 labelsRef（記憶中文名稱表的來源 commit）')
LREFS = LREF if isinstance(LREF, list) else [LREF]   # 可以列好幾個 commit（AA 分支、BB 分支各一個；先列的優先）
show = lambda p: json.loads(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True))
srcs = sorted(set(APPROVED.values()))
out = {'source': '白名單 ' + '＋'.join(f'{v}（{sum(1 for x in APPROVED.values() if x == v)} 檔）' for v in srcs), 'characters': {}, 'terms': {}, 'byTerm': {}, 'kaiDorm': [], 'bikeSeat': {}}
files = sorted(os.path.basename(p)[:-5] for p in APPROVED)
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
lab = {}
for REF in LREFS:
    docs = [n for n in subprocess.check_output(['git', '-C', ROOT, '-c', 'core.quotepath=off', 'ls-tree', '--name-only', f'{REF}:docs/story_planning/'], text=True).split('\n') if n.endswith('.md') and '階梯' in n]
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
            for x in (st.get('linesIf') or []) + (st.get('extraIf') or []):   # linesIf／extraIf 那一套自己的記憶
                if x.get('mem'): yield x['mem']
skipped = {}
dst = os.path.join(ROOT, 'src', 'data', 'ladder.js')
try:   # 上一次匯入的版本：缺中文名稱的學期先保留舊的（不讓那一學期整個消失）
    _s = open(dst, encoding='utf8').read(); OLD = json.loads(_s[_s.index('{'):_s.index(';\nLADDER.byTerm.Y1S1')])
except Exception: OLD = {}
kept = []
for t in list(out['byTerm']):
    miss = sorted({m for m in mems(out['byTerm'][t]) if not has(m)})
    if miss:
        skipped[t] = miss; del out['byTerm'][t]
        old_t = OLD.get('characters') if t == 'Y1S1' else (OLD.get('byTerm') or {}).get(t)   # 大一上存在 characters
        if old_t:
            out['byTerm'][t] = old_t; kept.append(t)
            if t == 'Y1S1': out['characters'] = old_t
out['labels'] = {m: lab[m] for c in out['byTerm'].values() for m in mems(c) if m in lab and not re.search(r'\b' + m + r":'", soc)}
for m, v in ((OLD.get('labels') or {}).items()):
    if m not in out['labels'] and any(m in set(mems(out['byTerm'][t])) for t in kept): out['labels'][m] = v
if skipped: print('先不匯入新版（記憶沒有中文名稱，請企劃在階梯文件補「| `代號` | 名稱 |」表）：', skipped, '；保留上一次匯入的：', kept)
def _walk(o, old, new=None):   # 數（new 是 None）或換掉整句相同的字串，回傳幾句（AA_372、AA_373 疊句共用）
    n = 0
    items = o.items() if isinstance(o, dict) else (enumerate(o) if isinstance(o, list) else [])
    for k, v in list(items):
        if isinstance(v, str):
            if v == old:
                n += 1
                if new is not None: o[k] = new
        else: n += _walk(v, old, new)
    return n
# ---- AA_372（企劃線修正稿，白名單 AA372-Y1S1-FIX-1021；AA 定稿）：大一上以安的兩句疊在 ladder_aa.json 上——第 13 項第 16 週週五的招呼（1/20 才回台中）、
#      第 18 項 A-L9（她三科都在第 8 週）。整句相同才換；ladder_aa.json 下一版自己改好了（舊句沒有、新句已經在）就跳過，那時候這段可以拿掉 ----
A372 = G.approved_files(ALLOW, 'docs/story_planning/AA_372_')
if A372:
    P372, S372 = next(iter(A372.items()))
    ok, why = G.allowed(P372, S372, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md372 = subprocess.check_output(['git', '-C', ROOT, 'show', f'{S372}:{P372}'], text=True)
    an = out['characters'].get('heroine_01') or {}
    for item, old, new, quote in [('第 13 項', '考完我還會留在臺北三個禮拜。', '考完我還會留在臺北一個月。', '「考完我還會留在臺北一個月。」'),
                                  ('第 18 項', '你期中哪一週最多？我十月最後那週有三科。', '你期中哪一週最多？期中考那週我有三科。', '「期中考那週我有三科。」')]:
        if quote not in md372: sys.exit(f'AA_372@{S372} 裡找不到{item}的「改成」：{quote}')
        n = _walk(an, old, new)
        if n != 1 and not (n == 0 and _walk(an, new) == 1): sys.exit(f'AA_372 {item}：大一上以安的階梯裡「{old}」有 {n} 句（應該是 1 句；或已經是新句）')
    out['source'] += f'＋{os.path.basename(P372)[:6]}@{S372}（以安 2 句）'
# ---- AA_373（企劃線修正稿，白名單 AA373-Y1S2-FIX-1021；AA 定稿）：大一下的五句疊在大一下的階梯上（byTerm.Y1S2）——第 6 項沛珊 P2-L3「一週兩天。」（作息改週二、四）、
#      第 8 項學姊 S2-L6 兩句（空保溫瓶在大一上）、第 14 項以安第 10～15 週的招呼（交換是大三的伏筆）、第 25 項可昕 K2-L1 選項回覆（使用者 10-18：她沒有在跟祐廷比）。
#      整句相同才換；企劃線的階梯檔下一版自己改好了（舊句沒有、新句已經在）就跳過，那時候這段可以拿掉 ----
A373 = G.approved_files(ALLOW, 'docs/story_planning/AA_373_')
if A373:
    P373, S373 = next(iter(A373.items()))
    ok, why = G.allowed(P373, S373, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md373 = subprocess.check_output(['git', '-C', ROOT, 'show', f'{S373}:{P373}'], text=True)
    y1s2 = out['byTerm'].get('Y1S2') or {}
    for item, cid, old, new, quote in [('第 6 項', 'classmate_peishan', '我在溫州街的課輔班當志工。一週三天。', '我在溫州街的課輔班當志工。一週兩天。', '「一週兩天。」'),
                                       ('第 8 項', 'heroine_05', '期中的時候，我對著空的保溫瓶喝了好幾次。', '上學期期中的時候，我對著空的保溫瓶喝了好幾次。', '「上學期期中的時候，我對著空的保溫瓶喝了好幾次。」'),
                                       ('第 8 項', 'heroine_05', '上次那杯黑咖啡，謝謝。', '那杯黑咖啡，謝謝。', '「那杯黑咖啡，謝謝。」'),
                                       ('第 14 項', 'heroine_01', '日文課下禮拜小考。……我國中就想去日本交換了。', '日文課下禮拜小考。……片假名我還是會看錯。', '「日文課下禮拜小考。……片假名我還是會看錯。」'),
                                       ('第 25 項', 'kexin', '騙人。……你記幾次？不准說。我會比。', '騙人。……你記幾次？算了，不准說。', '「騙人。……你記幾次？算了，不准說。」')]:
        if quote not in md373: sys.exit(f'AA_373@{S373} 裡找不到{item}的「改成」：{quote}')
        ch = y1s2.get(cid) or {}
        n = _walk(ch, old, new)
        if n != 1 and not (n == 0 and _walk(ch, new) == 1): sys.exit(f'AA_373 {item}：大一下 {cid} 的階梯裡「{old}」有 {n} 句（應該是 1 句；或已經是新句）')
    out['source'] += f'＋{os.path.basename(P373)[:6]}@{S373}（大一下 5 句）'
y1 = out['byTerm'].pop('Y1S1', {})   # 大一上和 characters 是同一份（下面用 JS 指過去，不重複存）
# ---- 大二的修正稿（企劃線，白名單上的 commit；AA 定稿）：一層的一個欄位疊在 ladder_*_y2s1／y2s2.json 上——整個欄位相同才換（週次、句子、選項）；
#      那個檔下一版自己改好了（已經是新值）就跳過，舊值、新值都不是＝停下來（企劃改過了，要重看）。每一項先確認修正稿裡有那一句「改成」。
#      AA_374（AA374-Y2S1-FIX-1021）第 14 項：可昕 K3-L4 週次 [6,16]→[6,6]（互考 10/23 只有一次；第 6 週沒聊到就跳過，不卡住後面的層）
def _fix(prefix, label, patches):
    A = G.approved_files(ALLOW, prefix)
    if not A: return
    P, SHA = next(iter(A.items()))
    ok, why = G.allowed(P, SHA, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md = subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True)
    for item, term, cid, sid, field, old, new, quote in patches:
        if quote not in md: sys.exit(f'{os.path.basename(P)[:6]}@{SHA} 裡找不到{item}的「改成」：{quote}')
        st = next((x for x in (((out['byTerm'].get(term) or {}).get(cid) or {}).get('steps') or []) if x.get('id') == sid), None)
        if st is None: sys.exit(f'{os.path.basename(P)[:6]} {item}：{term} {cid} 沒有 {sid}')
        cur = st.get(field)
        if cur == new: continue
        if cur != old: sys.exit(f'{os.path.basename(P)[:6]} {item}：{term} {cid} {sid} 的 {field} 是 {cur!r}（應該是 {old!r}，或已經是 {new!r}）')
        if new is None: st.pop(field, None)
        else: st[field] = new
    out['source'] += f'＋{os.path.basename(P)[:6]}@{SHA}（{label}）'
_fix('docs/story_planning/AA_374_', '可昕 K3-L4 週次', [
    ('第 14 項', 'Y2S1', 'kexin', 'K3-L4', 'week', [6, 16], [6, 6], '週次改 **[6,6]**'),
    ('第 14 項', 'Y2S1', 'kexin', 'K3-L4', 'skipAfterWeek', None, 6, '週次改 **[6,6]**')])
#      AA_375（AA375-Y2S2-FIX-1021）第 7 項：語彤 Y4-L7 大二下改「下學期系上可能會找我做一點事。……還沒確定，確定再跟你講。」（助教是大三上 1B-08 的新消息；
#      原本的兩句和兩個選項都在講已經確定的助教，整層換成這一句、選項拿掉）；第 11 項：可昕 K4-L2 第 5 週起（3/21 邀約之後；只給 3/25 去了的玩家在 story3d.js 的
#      LADDER_HOLD／LADDER_SKIP）；第 12 項：芷若 Z4-L4 第 11 週以後跳過（同子晴 Q4-L4：週次 [3,11]＋skipAfterWeek 11；英國的信 5/11 第 12 週就到了）
_fix('docs/story_planning/AA_375_', '語彤 Y4-L7、可昕 K4-L2、芷若 Z4-L4', [
    ('第 7 項', 'Y2S2', 'heroine_03', 'Y4-L7', 'lines', ['下學期我要當訪談課的助教了。老師說，教室我可以自己排。', '我想把椅子都擺成斜的。'],
     ['下學期系上可能會找我做一點事。……還沒確定，確定再跟你講。'], '「下學期系上可能會找我做一點事。……還沒確定，確定再跟你講。」'),
    ('第 7 項', 'Y2S2', 'heroine_03', 'Y4-L7', 'choices', [{'t': '「妳會做得很好。」', 'reply': '希望啦。第一堂要自我介紹，我還沒想好要講什麼。'}, {'t': '「老師說了什麼？」', 'reply': '她說每週要改二十份作業。我還在算時間夠不夠。'}],
     None, '「下學期系上可能會找我做一點事。……還沒確定，確定再跟你講。」'),
    ('第 11 項', 'Y2S2', 'kexin', 'K4-L2', 'week', [3, 16], [5, 16], '週次改**第 5 週起**'),
    ('第 12 項', 'Y2S2', 'heroine_02', 'Z4-L4', 'week', [3, 16], [3, 11], '第 11 週以後跳過（同子晴 Q4-L4）'),
    ('第 12 項', 'Y2S2', 'heroine_02', 'Z4-L4', 'skipAfterWeek', None, 11, '第 11 週以後跳過（同子晴 Q4-L4）')])
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 閒聊階梯（大一上；AA_135、AA_136、BB_130；README 在企劃線 docs/story_planning/ladder/）。產生器：tools/ladder/import_ladder.py（不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst LADDER=" + json.dumps(out, ensure_ascii=False) + ';\nLADDER.byTerm.Y1S1=LADDER.characters;   /* 大一上：舊的 characters／terms 照留（舊程式、舊測試讀得到）*/\n')
print('wrote', dst, 'Y1S1', {k: len(v['steps']) for k, v in out['characters'].items()}, {t: {k: len(v['steps']) for k, v in c.items()} for t, c in out['byTerm'].items()}, 'kaiDorm', len(out['kaiDorm']))
