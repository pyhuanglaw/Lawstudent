"""閒聊階梯（企劃線 docs/story_planning/ladder/ladder_aa*.json＋ladder_bb*.json，一學期一個檔）→ src/data/ladder.js。台詞一字不改。
**只匯入 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本**（使用者 2026-10-17 P0：未批准、WIP、來源版本不明預設拒絕；
不再把企劃線分支上所有階梯檔一次匯入——AA 分支的大一下階梯可昕被改 17 處還沒審）。每個檔從名單上寫的 commit 讀，不從分支最新讀。
要換新版本：AA（人物台詞先經 BB）交付「已審版本＋commit」→ 值班 LAWWW 改白名單 → 再跑這個工具。
AA_372 第 13、18 項以安的兩句：企劃線 ladder_aa.json@7fca0df5 已經改好（AA_372 第 6 節），原本疊在這裡的那段拿掉了。
AA_373（大一下「時間、人在哪、作廢設定」修正稿，白名單上的 commit）第 6、8、14、25 項的五句、第 6 節第 4 題一句同樣疊在大一下的階梯上（byTerm.Y1S2）。
AA_374、AA_375（大二上、大二下修正稿）：一層的一個欄位（週次、句子、選項）用 _fix 疊在 ladder_*_y2s1／y2s2.json 上。
AA_376（大三上修正稿）第 9 項以安三句、第 18 項日本路線兩個選項疊在大三上的階梯上（byTerm.Y3S1）；條件、週次在 src/y3fill3d.js。
AA_377（大三下修正稿）第 4 項以安 A6-L2 一句、第 6 項語彤 Y6-L3 杜鵑花（linesIf、選項）、第 15、16 項語彤 Y6-L1、Y6-L4 的 linesIf 疊在大三下的階梯上（byTerm.Y3S2）；A6 挽回中略過在 src/story3d.js 的 LADDER_SKIP。
AA_518（學姊第十五批）第 4 節 4-2、4-15：學姊 S4-L7 一句＋註解、S4-L8 的 linesIf 用 _fix 疊在大二下的階梯上（byTerm.Y2S2）。
AA_525（說了沒發生（二））：子晴 Q2-L5、沛珊 P3-L3／P5-L2、可昕 K2-L8／K3-L5／K6-L6 的選項（字、回覆）整句相同才換（_swap，大一下～大三下各學期）；選了哪一個要記的旗標在 src/aa525_3d.js。
AA_523（學姊第十六批）第 6 節 6-1、6-2：學姊 S7-L3 週次、S7-L8 選項②的回覆用 _fix 疊在大四下的階梯上（byTerm.Y4S2）；6-10：大四上招呼的 base 加一句（_fix_greet_base，byTerm.Y4S1）。
AA_524（說了沒發生（一））：以安 A2-L5、A4-L6 選項②的回覆、A3-L8 extraIf，芷若 Z3-L4 選項②的回覆、Z5-L5 extraIf 用 _fix 疊上去（旗標 AN_COOK_PROMISE、ZR_LUROU_HALF 在 src/aa524_3d.js 記）。
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
show = lambda p: json.loads(G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True)))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
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
        for m in re.finditer(r'^\|\s*`([A-Z][A-Z0-9_]+)`\s*\|\s*([^|]+?)\s*\|', G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{REF}:docs/story_planning/{n}'], text=True)), re.M):
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
def _walk(o, old, new=None):   # 數（new 是 None）或換掉整句相同的字串，回傳幾句（AA_373 疊句用）
    n = 0
    items = o.items() if isinstance(o, dict) else (enumerate(o) if isinstance(o, list) else [])
    for k, v in list(items):
        if isinstance(v, str):
            if v == old:
                n += 1
                if new is not None: o[k] = new
        else: n += _walk(v, old, new)
    return n
# ---- AA_373（企劃線修正稿，白名單 AA373-Y1S2-FIX-1021；AA 定稿）：大一下的六句疊在大一下的階梯上（byTerm.Y1S2）——第 6 節第 4 題學姊「上學期期中那個空的保溫瓶」、第 6 項沛珊 P2-L3「一週兩天。」（作息改週二、四）、
#      第 8 項學姊 S2-L6 兩句（空保溫瓶在大一上）、第 14 項以安第 10～15 週的招呼（交換是大三的伏筆）、第 25 項可昕 K2-L1 選項回覆（使用者 10-18：她沒有在跟祐廷比）。
#      整句相同才換；企劃線的階梯檔下一版自己改好了（舊句沒有、新句已經在）就跳過，那時候這段可以拿掉 ----
A373 = G.approved_files(ALLOW, 'docs/story_planning/AA_373_')
if A373:
    P373, S373 = next(iter(A373.items()))
    ok, why = G.allowed(P373, S373, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md373 = G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S373}:{P373}'], text=True))
    y1s2 = out['byTerm'].get('Y1S2') or {}
    for item, cid, old, new, quote in [('第 6 項', 'classmate_peishan', '我在溫州街的課輔班當志工。一週三天。', '我在溫州街的課輔班當志工。一週兩天。', '「一週兩天。」'),
                                       ('第 8 項', 'heroine_05', '期中的時候，我對著空的保溫瓶喝了好幾次。', '上學期期中的時候，我對著空的保溫瓶喝了好幾次。', '「上學期期中的時候，我對著空的保溫瓶喝了好幾次。」'),
                                       ('第 8 項', 'heroine_05', '上次那杯黑咖啡，謝謝。', '那杯黑咖啡，謝謝。', '「那杯黑咖啡，謝謝。」'),
                                       ('第 14 項', 'heroine_01', '日文課下禮拜小考。……我國中就想去日本交換了。', '日文課下禮拜小考。……片假名我還是會看錯。', '「日文課下禮拜小考。……片假名我還是會看錯。」'),
                                       ('第 25 項', 'kexin', '騙人。……你記幾次？不准說。我會比。', '騙人。……你記幾次？算了，不准說。', '「騙人。……你記幾次？算了，不准說。」'),
                                       ('第 6-2 節第 4 題', 'heroine_05', '期中那個空的保溫瓶，你看到了。', '上學期期中那個空的保溫瓶，你看到了。', '「上學期期中那個空的保溫瓶，你看到了。」')]:   # 第 6 節（bdab2f42）：看過空保溫瓶那一套（linesIf ev_sis_empty_flask）也是上學期的事
        if quote not in md373: sys.exit(f'AA_373@{S373} 裡找不到{item}的「改成」：{quote}')
        ch = y1s2.get(cid) or {}
        n = _walk(ch, old, new)
        if n != 1 and not (n == 0 and _walk(ch, new) == 1): sys.exit(f'AA_373 {item}：大一下 {cid} 的階梯裡「{old}」有 {n} 句（應該是 1 句；或已經是新句）')
    out['source'] += f'＋{os.path.basename(P373)[:6]}@{S373}（大一下 6 句）'
def _approved_md(prefix):   # 白名單上的修正稿（AA_376、AA_377）：(路徑, commit, 內容)；名單上沒有＝None
    A = G.approved_files(ALLOW, prefix)
    if not A: return None
    P, S = next(iter(A.items()))
    ok, why = G.allowed(P, S, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    return P, S, G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S}:{P}'], text=True))
def _swap(tag, md, chars, rows):   # 整句相同才換（同 AA_372、AA_373）：rows＝[(第幾項, 人物, 舊句, 新句, 稿裡的「改成」)]
    for item, cid, old, new, quote in rows:
        if quote not in md: sys.exit(f'{tag} 裡找不到{item}的「改成」：{quote}')
        ch = chars.get(cid) or {}
        n = _walk(ch, old, new)
        if n != 1 and not (n == 0 and _walk(ch, new) == 1): sys.exit(f'{tag} {item}：{cid} 的階梯裡「{old}」有 {n} 句（應該是 1 句；或已經是新句）')
def _step(chars, cid, sid, tag):
    st = next((x for x in (chars.get(cid) or {}).get('steps', []) if x.get('id') == sid), None)
    if st is None: sys.exit(f'{tag}：找不到 {cid} 的 {sid}')
    return st
def _add_choice(tag, md, chars, rows):   # 多一個選項（加在原本那個後面；複製原本的回覆、rel，再蓋上新的字）：哪一個玩家看得到由 src/y3fill3d.js 的 LADDER_CHOICE_IF 決定
    for item, cid, sid, base_t, over, quotes in rows:
        for q in quotes:
            if q not in md: sys.exit(f'{tag} 裡找不到{item}的「改成」：{q}')
        st = _step(chars, cid, sid, tag); C = st.get('choices') or []
        if any(c.get('t') == over['t'] for c in C): continue   # 企劃線自己加好了
        i = next((k for k, c in enumerate(C) if c.get('t') == base_t), None)
        if i is None: sys.exit(f'{tag} {item}：{cid} {sid} 找不到選項「{base_t}」')
        nc = dict(C[i]); nc.update(over); C.insert(i + 1, nc)
def _add_lines_if(tag, md, chars, rows):   # 多一套 linesIf（放在最前面＝先比）：rows＝[(第幾項, 人物, 層, 條件, 台詞, 稿裡的「改成」)]
    for item, cid, sid, cond, lines, quote in rows:
        if quote not in md: sys.exit(f'{tag} 裡找不到{item}的「改成」：{quote}')
        st = _step(chars, cid, sid, tag); L = st.setdefault('linesIf', [])
        if any(x.get('lines') == lines for x in L): continue
        L.insert(0, {'if': cond, 'lines': lines})
# ---- AA_376（企劃線修正稿，白名單 AA376-Y3S1-FIX-1021；AA 定稿）：大三上的階梯（byTerm.Y3S1）——第 9 項以安 A5-L2 三句（柚子照中秋那場；交往中那句不管有沒有傳都通）、
#      第 18 項日本路線的兩個選項（以安 A5-L8「那我們在日本找一家麵店。」、語彤 Y5-L8「我們同一班。」→「……那我十點去機場。送兩個。」）。
#      其他項（K5-L2／L3 跳過、Y5-L1 等事件 12、Y5-L6／L7、A5-L1 第 2 週起）是條件，在 src/y3fill3d.js（程式這邊的表，匯入的 ladder.js 不手改）。企劃線下一版自己改好了就跳過 ----
X376 = _approved_md('docs/story_planning/AA_376_')
if X376:
    P376, S376, md376 = X376; y3s1 = out['byTerm'].get('Y3S1') or {}
    _swap(f'AA_376@{S376}', md376, y3s1, [
        ('第 9 項', 'heroine_01', '柚子我跟室友分著吃完了。', '那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。', '「那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。」'),
        ('第 9 項', 'heroine_01', '很甜。我室友一個人吃了一半。', '很甜。那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。', '「那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。」'),   # 引號裡的是後半句；「很甜。」不在引號裡、不動
        ('第 9 項', 'heroine_01', '你那天晚上傳的訊息，我看了好幾次。', '那天晚上，我看了手機好幾次。', '「那天晚上，我看了手機好幾次。」')])
    _add_choice(f'AA_376@{S376}', md376, y3s1, [
        ('第 18 項', 'heroine_01', 'A5-L8', '「我們幫妳把位子占著。」', {'t': '「那我們在日本找一家麵店。」'}, ['「那我們在日本找一家麵店。」']),
        ('第 18 項', 'heroine_03', 'Y5-L8', '「一起去。」', {'t': '「我們同一班。」', 'reply': '……那我十點去機場。送兩個。'}, ['「我們同一班。」', '「……那我十點去機場。送兩個。」'])])
    out['source'] += f'＋{os.path.basename(P376)[:6]}@{S376}（大三上 3 句＋日本路線 2 個選項）'
# ---- AA_377（企劃線修正稿，白名單 AA377-Y3S2-FIX-1021；AA 定稿）：大三下的階梯（byTerm.Y3S2）——第 4 項以安 A6-L2 選項回覆「宿舍寄來的信」→「房東寄來的信」（她在大學城隔壁的小鎮租公寓，AA_341 裁定 1）、
#      第 15 項語彤 Y6-L1：一起做過田野（YT_T1）的玩家換成「週四我還是五點就到店門口。……只是現在不是去顧店。」、第 16 項語彤 Y6-L4：沒有田野的發現（FIELD_FINDING）的玩家第一句換「巷子裡有個修鞋的老闆」。
#      A6 挽回中整層略過是條件，在 src/story3d.js 的 LADDER_SKIP。企劃線下一版自己改好了就跳過 ----
X377 = _approved_md('docs/story_planning/AA_377_')
if X377:
    P377, S377, md377 = X377; y3s2 = out['byTerm'].get('Y3S2') or {}
    _swap(f'AA_377@{S377}', md377, y3s2, [
        ('第 4 項', 'heroine_01', '有一點。宿舍寄來的信，我還看不太懂。', '有一點。房東寄來的信，我還看不太懂。', '「房東寄來的信，我還看不太懂」')])
    _add_lines_if(f'AA_377@{S377}', md377, y3s2, [
        ('第 15 項', 'heroine_03', 'Y6-L1', {'flags': ['YT_T1']}, ['週四我還是五點就到店門口。……只是現在不是去顧店。'], '「週四我還是五點就到店門口。……只是現在不是去顧店。」'),
        ('第 16 項', 'heroine_03', 'Y6-L4', {'notFlags': ['FIELD_FINDING']}, ['巷子裡有個修鞋的老闆，我又去找他聊了一次。', '他記得每一雙送來修的鞋，客人的臉反而記不住。'], '「巷子裡有個修鞋的老闆，我又去找他聊了一次。」')])
    # 第 6 項（6-3 節，AA 回 LAWWW 01:50）：語彤 Y6-L3 和祐廷拍的杜鵑花（記憶 AN3_AZALEA）——沒和以安交往＋有＝只剩一句；交往中＋有＝交往中那一套（「你們去拍的那張」）；
    #   交往中＋沒有＝原本那一套（語彤陪以安去，不用交往中那一套）；都沒有＝原本。有 AN3_AZALEA 的玩家「妳也有拍嗎？」換成「（給她看手機裡的另一張）」（誰看得到：src/story3d.js 的 LADDER_CHOICE_IF）
    for q in ['「以安傳在群組那張杜鵑花，是你拍的吧。……拍得很好。」', '「杜鵑花節那天你們去拍的那張，以安有傳給我。」', '「（給她看手機裡的另一張）」', '「……這張她眨眼了。」「你沒傳這張，是對的。」']:
        if q not in md377: sys.exit(f'AA_377@{S377} 裡找不到第 6 項的「改成」：{q}')
    st = _step(y3s2, 'heroine_03', 'Y6-L3', f'AA_377@{S377}')
    AZ = {'npc': 'heroine_01', 'tag': 'AN3_AZALEA'}
    DL = ['杜鵑花節那天你們去拍的那張，以安有傳給我。', '她每年都站在同一棵樹前面拍一張，今年是第三張。']
    old_li = [{'if': {'flags': ['dating_heroine_01']}, 'lines': DL}]
    new_li = [{'if': {'flags': ['dating_heroine_01'], 'memory': [AZ]}, 'lines': DL}, {'if': {'memory': [AZ]}, 'lines': ['以安傳在群組那張杜鵑花，是你拍的吧。……拍得很好。']}]
    if st.get('linesIf') != new_li:
        if st.get('linesIf') != old_li: sys.exit(f'AA_377 第 6 項：語彤 Y6-L3 的 linesIf 是 {st.get("linesIf")!r}（企劃線改過了，要重看）')
        st['linesIf'] = new_li
    _add_choice(f'AA_377@{S377}', md377, y3s2, [
        ('第 6 項', 'heroine_03', 'Y6-L3', '「妳也有拍嗎？」', {'t': '（給她看手機裡的另一張）', 'reply': ['……這張她眨眼了。', '你沒傳這張，是對的。']}, ['「（給她看手機裡的另一張）」'])])
    out['source'] += f'＋{os.path.basename(P377)[:6]}@{S377}（大三下 1 句＋語彤 3 套 linesIf、1 個選項）'
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
    md = G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True))
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
#      AA_506（HEROINE-LIFE-1028；AA-C 10-28 ae50b8d5a 定稿）第 0 節第 1 點：子晴 Q4-L1 第二句「……然後手癢，加了第二關。」和 7/31「第二關做好了」撞——改「想把它做大」；
#      第一個選項「第二關是什麼？」換成「做多大？」（第二個選項、extraIf、記號 ZQ4_SECOND_LEVEL 照舊，AA 03:23 回 LAWWW）
_fix('docs/story_planning/AA_506_', '子晴 Q4-L1', [
    ('第 0 節第 1 點', 'Y2S2', 'heroine_04', 'Q4-L1', 'lines', ['上學期期末交的那個小遊戲，寒假我又弄了一下。', '……然後手癢，加了第二關。'],
     ['上學期期末交的那個小遊戲，寒假我又弄了一下。', '……然後手癢，想把它做大。'], '「……然後手癢，想把它做大。」'),
    ('第 0 節第 1 點', 'Y2S2', 'heroine_04', 'Q4-L1', 'choices', [{'t': '「第二關是什麼？」', 'reply': '是第一關倒過來。我懶得想新的。'}, {'t': '「第一關好玩嗎？」', 'reply': '阿凱玩了二十次。他說好玩。他的話不能信，他很閒。'}],
     [{'t': '「做多大？」', 'reply': '還不知道。先做到我自己想玩為止。'}, {'t': '「第一關好玩嗎？」', 'reply': '阿凱玩了二十次。他說好玩。他的話不能信，他很閒。'}], '她回「還不知道。先做到我自己想玩為止。」')])
#      AA_510（HEROINE-LIFE-1028；AA-C 10-28 28f981438 定稿）第 0-2 節第 3 點：以安 A8-L1「保險法」（大三下必修，不能說「不是必修」）改「證券交易法」，選項回覆跟著改；其他照舊
_fix('docs/story_planning/AA_510_', '以安 A8-L1', [
    ('第 0-2 節第 3 點', 'Y4S2', 'heroine_01', 'A8-L1', 'lines', ['這學期我多選了一門保險法。不是必修。', '……學分早就夠了。就是想上。'],
     ['這學期我多選了一門證券交易法。不是必修。', '……學分早就夠了。就是想上。'], '改「證券交易法」'),
    ('第 0-2 節第 3 點', 'Y4S2', 'heroine_01', 'A8-L1', 'choices', [{'t': '「學分夠了還選？」', 'reply': '保險法很好玩。真的。……你那個表情是什麼意思。'}, {'t': '「妳很喜歡商法。」', 'reply': '嗯。公司、保險、證券。Alison 說我講到這些，眼睛會亮。', 'rel': {'comf': 1}}],
     [{'t': '「學分夠了還選？」', 'reply': '證交法很好玩。真的。……你那個表情是什麼意思。'}, {'t': '「妳很喜歡商法。」', 'reply': '嗯。公司、保險、證券。Alison 說我講到這些，眼睛會亮。', 'rel': {'comf': 1}}], '改「證交法很好玩。真的。」')])
#      招呼（greet.when）的一個欄位：用句子 t 找那一筆，整個欄位相同才換；已經是新值就跳過，都不是＝停下來（同 _fix）
def _fix_greet(prefix, label, patches):
    A = G.approved_files(ALLOW, prefix)
    if not A: return
    P, SHA = next(iter(A.items()))
    ok, why = G.allowed(P, SHA, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md = G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True))
    for item, term, cid, t, field, old, new, quote in patches:
        if quote not in md: sys.exit(f'{os.path.basename(P)[:6]}@{SHA} 裡找不到{item}的「改成」：{quote}')
        when = ((((out['byTerm'].get(term) or {}).get(cid) or {}).get('greet') or {}).get('when')) or []
        e = next((x for x in when if x.get('t') == t), None)
        if e is None: sys.exit(f'{os.path.basename(P)[:6]} {item}：{term} {cid} 的招呼沒有「{t}」')
        cur = e.get(field)
        if cur == new: continue
        if cur != old: sys.exit(f'{os.path.basename(P)[:6]} {item}：{term} {cid} 招呼「{t}」的 {field} 是 {cur!r}（應該是 {old!r}，或已經是 {new!r}）')
        e[field] = new
    out['source'] += f'＋{os.path.basename(P)[:6]}@{SHA}（{label}）'
#      AA_508（HEROINE-LIFE-1028；AA-C 10-28 31a4c4002 定稿）第 0-2 節第 2 點：學姊日本路線招呼「你先去。我的結果還沒出來。」第 1～5 週改第 1～3 週（第 4 週週三 3/15 她已經上了）
_fix_greet('docs/story_planning/AA_508_', '學姊日本路線招呼週次', [
    ('第 0-2 節第 2 點', 'Y3S2', 'heroine_05', '你先去。我的結果還沒出來。', 'week', [1, 5], [1, 3], '的週次從第 1～5 週改第 1～3 週')])
#      AA_518（SIS-B15-1028；AA-C 10-28 973dd1b74 定稿）第 4 節：4-2 兩次搬家定了（2026-07 全家搬家、2027-03-20 她自己搬出來一個人住）——學姊 S4-L7 第一句改「搬出來以後，我到法學院要多坐四站。」、註解改綁 2027-03-20；
#      4-15 S4-L8（第 13～16 週）：大二下唯一的家聚是 5/9 在她新家（AA_512 13-2 ev_sis13_curry）——演過的換兩句（放在 linesIf 第一個），沒演過的照原句（原本那一套 ev_family_dinner_y2s2 照留）
_S4L8_OLD = [{'if': {'events': ['ev_family_dinner_y2s2']}, 'lines': ['家族聚餐那天，大一的學弟妹看到我全部站起來。', '我坐下來，他們又站一次。……你也看到了。']}]
_fix('docs/story_planning/AA_518_', '學姊 S4-L7、S4-L8', [
    ('4-2', 'Y2S2', 'heroine_05', 'S4-L7', 'lines', ['搬家以後，我從家裡到法學院要多坐四站。', '多出來那四站，我在讀德文的文章。一站讀一段。'],
     ['搬出來以後，我到法學院要多坐四站。', '多出來那四站，我在讀德文的文章。一站讀一段。'], '改「搬出來以後，我到法學院要多坐四站。」'),
    ('4-2', 'Y2S2', 'heroine_05', 'S4-L7', 'note', 'AA_231：她家 2026-07-11 搬家（AA_218 15-6）；2026-10-17 使用者意見改德文（AA）；2026-10-17 BB-C 照新年級搬層（BB_195）：原 AA_231#2',
     'AA_231；AA_518 4-2：2027-03-20 她自己搬出來、一個人住（AA_512 13-2 的新家；2026-07 是全家搬家，AA_218 15-6）；2026-10-17 使用者意見改德文（AA）；2026-10-17 BB-C 照新年級搬層（BB_195）：原 AA_231#2', '註解改綁 2027-03-20'),
    ('4-15', 'Y2S2', 'heroine_05', 'S4-L8', 'linesIf', _S4L8_OLD,
     [{'if': {'events': ['ev_sis13_curry']}, 'lines': ['上次在我家，大一的學弟妹一進門就全部站起來。', '……我說坐。他們站得更直。']}] + _S4L8_OLD, '「上次在我家，大一的學弟妹一進門就全部站起來。」')])
#      招呼的 base（不分條件的那幾句）整個欄位相同才換；已經是新值就跳過，都不是＝停下來（同 _fix）。哪一句什麼時候說的條件在程式（STORY.LADDER_GREET_IF）
def _fix_greet_base(prefix, label, patches):
    A = G.approved_files(ALLOW, prefix)
    if not A: return
    P, SHA = next(iter(A.items()))
    ok, why = G.allowed(P, SHA, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md = G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True))
    for item, term, cid, old, new, quote in patches:
        if quote not in md: sys.exit(f'{os.path.basename(P)[:6]}@{SHA} 裡找不到{item}的「改成」：{quote}')
        gr = (((out['byTerm'].get(term) or {}).get(cid) or {}).get('greet'))
        if gr is None: sys.exit(f'{os.path.basename(P)[:6]} {item}：{term} {cid} 沒有招呼')
        cur = gr.get('base')
        if cur == new: continue
        if cur != old: sys.exit(f'{os.path.basename(P)[:6]} {item}：{term} {cid} 招呼的 base 是 {cur!r}（應該是 {old!r}，或已經是 {new!r}）')
        gr['base'] = new
    out['source'] += f'＋{os.path.basename(P)[:6]}@{SHA}（{label}）'
#      AA_523（SIS-B16-1028；AA-C 10-28 0d7b5388b 定稿）第 6 節：6-1 學姊 S7-L3「研究室有人在白板上幫我倒數口試」週次 [1,14]→[9,14]（口試日期 4/16 才下來）；
#      6-2 S7-L8 選項②回覆「先把修正本交出去。之後……還沒想。」→「先把修正本交出去。七月，去上班。」（3/28 研究單位回信了；選項①記 SIS7_PHOTO 在程式 src/sis_b16_3d.js）；
#      6-10 大四上的招呼：12/23 回來以後說「（她把保溫瓶遞過來）……回來了。這邊的飲水機有熱水。」——base 加這一句（放在美國那一句後面）；兩句各在什麼時候說在 src/sis_b16_3d.js（STORY.LADDER_GREET_IF）
_fix('docs/story_planning/AA_523_', '學姊 S7-L3 週次、S7-L8 選項②', [
    ('6-1', 'Y4S2', 'heroine_05', 'S7-L3', 'week', [1, 14], [9, 14], '週次 [9,14]（4/16 起）'),
    ('6-2', 'Y4S2', 'heroine_05', 'S7-L8', 'choices', [{'t': '「一起參加典禮。」', 'reply': '嗯。那天記得拍照。'}, {'t': '「畢業以後要做什麼？」', 'reply': '先把修正本交出去。之後……還沒想。', 'rel': {'trust': 1}}],
     [{'t': '「一起參加典禮。」', 'reply': '嗯。那天記得拍照。'}, {'t': '「畢業以後要做什麼？」', 'reply': '先把修正本交出去。七月，去上班。', 'rel': {'trust': 1}}], '「先把修正本交出去。七月，去上班。」')])
_SIS_Y4S1_BASE = ['吃了沒。', '（她把保溫瓶遞過來）熱水。這邊的飲水機只有冰的。', '我剛從圖書館回來。今天坐到靠窗的位子。', '（她手上拿著一本很厚的判例集）……嗯。', '你今天有課嗎？']
_fix_greet_base('docs/story_planning/AA_523_', '學姊大四上回來以後的招呼', [
    ('6-10', 'Y4S1', 'heroine_05', _SIS_Y4S1_BASE, _SIS_Y4S1_BASE[:2] + ['（她把保溫瓶遞過來）……回來了。這邊的飲水機有熱水。'] + _SIS_Y4S1_BASE[2:], '「（她把保溫瓶遞過來）……回來了。這邊的飲水機有熱水。」')])
#      AA_524（HEROINE-LIFE-1028；AA-C 10-28 8fd10848d 定稿）說了沒發生（一）：A14 以安 A2-L5、A4-L6 選項②的回覆不留「下禮拜」；A4 交往中、說過「下次做給我吃。」（AN_COOK_PROMISE，src/aa524_3d.js 記）的
#      A3-L8（番茄炒蛋那一版）後面多兩句（extraIf）；Z10 芷若 Z3-L4 選項②的回覆拿掉「小罐的可以」、Z5-L5 說過「一半也想吃。」（ZR_LUROU_HALF，src/aa524_3d.js 記）的多一句（extraIf）。A7-L7 照留（稿第 1 節 A14）
_fix('docs/story_planning/AA_524_', '以安 A2-L5、A4-L6、A3-L8，芷若 Z3-L4、Z5-L5', [
    ('A14', 'Y1S2', 'heroine_01', 'A2-L5', 'choices', [{'t': '「刑總本來就難。」', 'reply': '聽說全班平均也不高。'}, {'t': '「我也考得不太好。」', 'reply': '那下禮拜找一天一起對考卷吧。', 'rel': {'comf': 1}}],
     [{'t': '「刑總本來就難。」', 'reply': '聽說全班平均也不高。'}, {'t': '「我也考得不太好。」', 'reply': '考卷發回來你先對。不懂的問我。', 'rel': {'comf': 1}}], '「考卷發回來你先對。不懂的問我。」'),
    ('A14', 'Y2S2', 'heroine_01', 'A4-L6', 'choices', [{'t': '「那不是很好嗎？」', 'reply': '我也覺得很好。可是 Alison 說她都在打瞌睡。'}, {'t': '「排一題好玩的。」', 'reply': '例如？……你下禮拜來講，我給你十五分鐘。', 'rel': {'comf': 1}}],
     [{'t': '「那不是很好嗎？」', 'reply': '我也覺得很好。可是 Alison 說她都在打瞌睡。'}, {'t': '「排一題好玩的。」', 'reply': '例如？……你講。我聽十五分鐘。', 'rel': {'comf': 1}}], '「例如？……你講。我聽十五分鐘。」'),
    ('A4', 'Y2S1', 'heroine_01', 'A3-L8', 'extraIf', None,
     [{'if': {'flags': ['dating_heroine_01', 'AN_COOK_PROMISE'], 'memory': [{'npc': 'heroine_01', 'tag': 'AN2_TOMATO_EGG'}]}, 'lines': ['（她從背包拿出一個保鮮盒。）', '番茄炒蛋。練好了。……冷了，你自己熱。']}], '番茄炒蛋。練好了。……冷了，你自己熱。'),
    ('Z10', 'Y2S1', 'heroine_02', 'Z3-L4', 'choices', [{'t': '「牠有名字嗎？」', 'reply': '有三個。每個常客叫的都不一樣。牠每個都答應。'}, {'t': '「下次我帶罐頭。」', 'reply': '不行。牠已經很胖了。……小罐的可以。'}],
     [{'t': '「牠有名字嗎？」', 'reply': '有三個。每個常客叫的都不一樣。牠每個都答應。'}, {'t': '「下次我帶罐頭。」', 'reply': '不行。牠已經很胖了。'}], '「不行。牠已經很胖了。」'),
    ('Z10', 'Y3S2', 'heroine_02', 'Z5-L5', 'extraIf', None,
     [{'if': {'flags': ['ZR_LUROU_HALF']}, 'lines': ['上次說的一半。我媽這次寄了一整罐。……分你。']}], '上次說的一半。我媽這次寄了一整罐。……分你。')])
#      AA_525（HEROINE-LIFE-1028；AA-C 10-28 6081f725f 定稿）說了沒發生（二）：沒有下文的「下次」改原句——1-3 子晴 Q2-L5「我想聽妳彈。」回覆、2-4 沛珊 P3-L3 選項②（字、回覆）、
#      P5-L2「教我。」回覆、3-8 可昕 K2-L8「我去找妳。」回覆（高雄 again 已經有夜市）、3-11 K3-L5「下次介紹給我。」回覆、K6-L6「要我幫妳看嗎？」回覆。整句相同才換；企劃線的階梯檔下一版自己改好了就跳過
X525 = _approved_md('docs/story_planning/AA_525_')
if X525:
    P525, S525, md525 = X525
    for term, rows in [('Y1S2', [('1-3', 'heroine_04', '那下次社課來。我彈給你聽。只彈一次。', '……成發那天來。我只彈一次。', '「……成發那天來。我只彈一次。」'),
                                 ('3-8 K-13', 'kexin', '……真的喔？那我帶你去吃我家巷口的豆花。', '……真的喔？那我帶你去夜市。', '「……真的喔？那我帶你去夜市。」')]),
                       ('Y2S1', [('2-4 P-5', 'classmate_peishan', '「下次我問妳有沒有舉手。」', '「妳舉手了嗎？」', '「妳舉手了嗎？」'),
                                 ('2-4 P-5', 'classmate_peishan', '好。你問。……我會老實說。', '……還沒！不要一直問！', '「……還沒！不要一直問！」'),
                                 ('3-11 K-16', 'kexin', '好啊。下次你來政大，我帶你去圖書館前面找。', '圖書館前面那兩隻，一隻叫原告，一隻叫被告。', '「圖書館前面那兩隻，一隻叫原告，一隻叫被告。」')]),
                       ('Y3S1', [('2-4 P-6', 'classmate_peishan', '不行。這是家傳的。……好，教你一半。', '不行。這是家傳的！', '「不行。這是家傳的！」')]),
                       ('Y3S2', [('3-11 K-17', 'kexin', '要。等我寫完第一頁再給你看。', '不要。我自己寫。', '「不要。我自己寫。」')])]:
        chars = y1 if term == 'Y1S1' else (out['byTerm'].get(term) or {})
        _swap(f'AA_525@{S525}', md525, chars, rows)
    out['source'] += f'＋{os.path.basename(P525)[:6]}@{S525}（子晴 Q2-L5、沛珊 P3-L3／P5-L2、可昕 K2-L8／K3-L5／K6-L6）'
#      AA_531（AA531-US-FIX-1030；AA-B 10-30 475f55fe6 定稿，白名單現在是 a28201f61：第 8 節沒改這一句）7-3：挽回中（美國路線、沒在交往）的美國招呼「這邊的飲水機只有冰的。我自己帶。」——base 加這一句（放在回來以後那一句後面：
#      美國那一句、回來以後那一句、這一句一次只有一句成立，篩過以後其他招呼的位置不變）；哪一句什麼時候說在 src/sis_b16_3d.js（STORY.LADDER_GREET_IF：挽回中不遞保溫瓶）
_SIS_Y4S1_BASE2 = _SIS_Y4S1_BASE[:2] + ['（她把保溫瓶遞過來）……回來了。這邊的飲水機有熱水。'] + _SIS_Y4S1_BASE[2:]
_fix_greet_base('docs/story_planning/AA_531_', '學姊挽回中的美國招呼', [
    ('7-3', 'Y4S1', 'heroine_05', _SIS_Y4S1_BASE2, _SIS_Y4S1_BASE2[:3] + ['這邊的飲水機只有冰的。我自己帶。'] + _SIS_Y4S1_BASE2[3:], '學姊：這邊的飲水機只有冰的。我自己帶。')])
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 閒聊階梯（大一上；AA_135、AA_136、BB_130；README 在企劃線 docs/story_planning/ladder/）。產生器：tools/ladder/import_ladder.py（不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst LADDER=" + json.dumps(out, ensure_ascii=False) + ';\nLADDER.byTerm.Y1S1=LADDER.characters;   /* 大一上：舊的 characters／terms 照留（舊程式、舊測試讀得到）*/\n')
print('wrote', dst, 'Y1S1', {k: len(v['steps']) for k, v in out['characters'].items()}, {t: {k: len(v['steps']) for k, v in c.items()} for t, c in out['byTerm'].items()}, 'kaiDorm', len(out['kaiDorm']))
