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
AA_781（閒聊階梯全部重看，X324）：通用覆蓋層（任何人、任何學期），格式寫在檔案後面 AA781 那一段的註解；白名單加一筆就匯。稿對錯人的列列在 AA781_ROW_SKIP（不換、印出來）。
用法：python3 tools/ladder/import_ladder.py [--check 企劃線ref] [--out 檔名] [--no-aa781] [--aa781-log 檔名]（--check：只列出分支上和白名單版本不同、或不在名單的檔，不寫檔；--out：寫到那個檔、不改 src/data/ladder.js，tests/ladder_reimport_unit.js 用；
--no-aa816：不疊 AA_816 選項 fx 層；--no-aa781：不疊 AA_781 通用層（tests/ladder_aa781_1111_unit.js 比零差異用）；--aa781-log：AA_781 每一列換到哪裡、每人每學期刪節號前後，寫成 JSON）"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
_rf = lambda x: json.loads(G.read_fix(json.dumps(x, ensure_ascii=False)))   # 這支程式裡寫死的舊句、改成：和讀稿一樣先 read_fix（AA_612 麵店→燒臘店以後，稿裡讀出來的字已經換了；2026-11-03）
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
show = lambda p: json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True)))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
srcs = sorted(set(APPROVED.values()))
out = {'source': '白名單 ' + '＋'.join(f'{v}（{sum(1 for x in APPROVED.values() if x == v)} 檔）' for v in srcs), 'characters': {}, 'terms': {}, 'byTerm': {}, 'kaiDorm': [], 'bikeSeat': {}}
files = sorted(os.path.basename(p)[:-5] for p in APPROVED)
import aa630   # AA_630（語彤台詞改寫，白名單上的版本）：第 1 節的列照 JSON 路徑換在源稿上（其他疊句照舊在後面）
R630 = aa630.load(ROOT, ALLOW, G); LOG630 = []
for f in files:
    d = show(f'docs/story_planning/ladder/{f}.json')
    aa630.apply_json(R630, f'docs/story_planning/ladder/{f}.json', d, LOG630)
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
        for m in re.finditer(r'^\|\s*`([A-Z][A-Z0-9_]+)`\s*\|\s*([^|]+?)\s*\|', G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{REF}:docs/story_planning/{n}'], text=True)), re.M):
            if not m.group(2).strip().startswith('`'): lab.setdefault(m.group(1), m.group(2).strip())
soc = open(os.path.join(ROOT, 'src', 'social3d.js'), encoding='utf8').read()
has = lambda t: bool(re.search(r'\b' + t + r":'", soc)) or t in lab
def mems(cs):
    for v in cs.values():
        for st in list(v['steps']) + list(v.get('dating') or []):   # dating＝交往中那一階（DLG-FX-MECH-1110；格式同 steps，另外可以有 fx）
            if st.get('mem'): yield st['mem']
            for ch in st.get('choices') or []:
                if ch.get('mem'): yield ch['mem']
            for x in (st.get('linesIf') or []) + (st.get('extraIf') or []):   # linesIf／extraIf 那一套自己的記憶
                if x.get('mem'): yield x['mem']
skipped = {}
dst = os.path.join(ROOT, 'src', 'data', 'ladder.js')
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else dst   # LADDER-IMPORT-AA657-1104：--out 檔名＝寫到別的地方（測試比對重匯結果用；上一次匯入的版本照舊讀 src/data/ladder.js）
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
    md373 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S373}:{P373}'], text=True))
    y1s2 = out['byTerm'].get('Y1S2') or {}
    _s2l6 = any(x.get('id') == 'S2-L6' for x in ((y1s2.get('heroine_05') or {}).get('steps') or []))   # AA_584 第 11 節第 6 點：學姊 S2-L6（空保溫瓶）整層刪——企劃線源稿自己刪了以後，這裡學姊那三句就跳過（現在源稿還有，照換，下面 AA_584 那段再整層刪）
    for item, cid, old, new, quote in [('第 6 項', 'classmate_peishan', '我在溫州街的課輔班當志工。一週三天。', '我在溫州街的課輔班當志工。一週兩天。', '「一週兩天。」'),
                                       ('第 8 項', 'heroine_05', '期中的時候，我對著空的保溫瓶喝了好幾次。', '上學期期中的時候，我對著空的保溫瓶喝了好幾次。', '「上學期期中的時候，我對著空的保溫瓶喝了好幾次。」'),
                                       ('第 8 項', 'heroine_05', '上次那杯黑咖啡，謝謝。', '那杯黑咖啡，謝謝。', '「那杯黑咖啡，謝謝。」'),
                                       ('第 14 項', 'heroine_01', '日文課下禮拜小考。……我國中就想去日本交換了。', '日文課下禮拜小考。……片假名我還是會看錯。', '「日文課下禮拜小考。……片假名我還是會看錯。」'),
                                       ('第 25 項', 'kexin', '騙人。……你記幾次？不准說。我會比。', '騙人。……你記幾次？算了，不准說。', '「騙人。……你記幾次？算了，不准說。」'),
                                       ('第 6-2 節第 4 題', 'heroine_05', '期中那個空的保溫瓶，你看到了。', '上學期期中那個空的保溫瓶，你看到了。', '「上學期期中那個空的保溫瓶，你看到了。」')]:   # 第 6 節（bdab2f42）：看過空保溫瓶那一套（linesIf ev_sis_empty_flask）也是上學期的事
        if quote not in md373: sys.exit(f'AA_373@{S373} 裡找不到{item}的「改成」：{quote}')
        if cid == 'heroine_05' and not _s2l6: continue
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
    return P, S, G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S}:{P}'], text=True))
def _swap(tag, md, chars, rows):   # 整句相同才換（同 AA_372、AA_373）：rows＝[(第幾項, 人物, 舊句, 新句, 稿裡的「改成」)]
    for item, cid, old, new, quote in _rf(rows):
        if quote not in md: sys.exit(f'{tag} 裡找不到{item}的「改成」：{quote}')
        ch = chars.get(cid) or {}
        n = _walk(ch, old, new)
        if n != 1 and not (n == 0 and _walk(ch, new) == 1): sys.exit(f'{tag} {item}：{cid} 的階梯裡「{old}」有 {n} 句（應該是 1 句；或已經是新句）')
def _step(chars, cid, sid, tag):
    st = next((x for x in (chars.get(cid) or {}).get('steps', []) if x.get('id') == sid), None)
    if st is None: sys.exit(f'{tag}：找不到 {cid} 的 {sid}')
    return st
def _add_choice(tag, md, chars, rows):   # 多一個選項（加在原本那個後面；複製原本的回覆、rel，再蓋上新的字）：哪一個玩家看得到由 src/y3fill3d.js 的 LADDER_CHOICE_IF 決定
    for item, cid, sid, base_t, over, quotes in _rf(rows):
        for q in quotes:
            if q not in md: sys.exit(f'{tag} 裡找不到{item}的「改成」：{q}')
        st = _step(chars, cid, sid, tag); C = st.get('choices') or []
        if any(c.get('t') == over['t'] for c in C): continue   # 企劃線自己加好了
        i = next((k for k, c in enumerate(C) if c.get('t') == base_t), None)
        if i is None: sys.exit(f'{tag} {item}：{cid} {sid} 找不到選項「{base_t}」')
        nc = dict(C[i]); nc.update(over); C.insert(i + 1, nc)
def _add_lines_if(tag, md, chars, rows):   # 多一套 linesIf（放在最前面＝先比）：rows＝[(第幾項, 人物, 層, 條件, 台詞, 稿裡的「改成」)]
    for item, cid, sid, cond, lines, quote in _rf(rows):
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
    for q in ['「以安傳在群組那張杜鵑花，是你拍的吧。……拍得很好。」', '「松鼠節那天你們去拍的那張，以安有傳給我。」', '「（給她看手機裡的另一張）」', '「……這張她眨眼了。」「你沒傳這張，是對的。」']:
        if q not in md377: sys.exit(f'AA_377@{S377} 裡找不到第 6 項的「改成」：{q}')
    # 「杜鵑花節」→「松鼠節」（使用者 2026-11-01，ASK-5NAMES）：讀稿 read_fix 已經換名，這裡的字也用新名
    st = _step(y3s2, 'heroine_03', 'Y6-L3', f'AA_377@{S377}')
    AZ = {'npc': 'heroine_01', 'tag': 'AN3_AZALEA'}
    DL = ['松鼠節那天你們去拍的那張，以安有傳給我。', '她每年都站在同一棵樹前面拍一張，今年是第三張。']
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
    md = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True))
    for item, term, cid, sid, field, old, new, quote in _rf(patches):
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
#      AA_580 第 7 節第 10 點（以安改稿第二批）：lines 第 2 句「……學分早就夠了。就是想上。」→「學分早就夠了。就是想上。」（一段「……」最多一次），疊在同一筆的新值
_fix('docs/story_planning/AA_510_', '以安 A8-L1', [
    ('第 0-2 節第 3 點', 'Y4S2', 'heroine_01', 'A8-L1', 'lines', ['這學期我多選了一門保險法。不是必修。', '……學分早就夠了。就是想上。'],
     ['這學期我多選了一門證券交易法。不是必修。', '學分早就夠了。就是想上。'], '改「證券交易法」'),   # 第 2 句拿掉「……」：AA_580 第 7 節第 10 點（企劃線 759e5c000，AA 審查「交 LAWWW 和疊句一起改」；選項①的回覆已有一次「……」）
    ('第 0-2 節第 3 點', 'Y4S2', 'heroine_01', 'A8-L1', 'choices', [{'t': '「學分夠了還選？」', 'reply': '保險法很好玩。真的。……你那個表情是什麼意思。'}, {'t': '「妳很喜歡商法。」', 'reply': '嗯。公司、保險、證券。Alison 說我講到這些，眼睛會亮。', 'rel': {'comf': 1}}],
     [{'t': '「學分夠了還選？」', 'reply': '證交法很好玩。真的。……你那個表情是什麼意思。'}, {'t': '「妳很喜歡商法。」', 'reply': '嗯。公司、保險、證券。Alison 說我講到這些，眼睛會亮。', 'rel': {'comf': 1}}], '改「證交法很好玩。真的。」')])
#      招呼（greet.when）的一個欄位：用句子 t 找那一筆，整個欄位相同才換；已經是新值就跳過，都不是＝停下來（同 _fix）
def _fix_greet(prefix, label, patches):
    A = G.approved_files(ALLOW, prefix)
    if not A: return
    P, SHA = next(iter(A.items()))
    ok, why = G.allowed(P, SHA, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True))
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
    md = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True))
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
_fix('docs/story_planning/AA_524_', '以安 A2-L5、A4-L6、A3-L8，芷若 Z3-L4、Z5-L5', [   # A2-L5 選項①的回覆照 AA_546 第 5 節換過（讀稿時 nocmp_fix.json 先換，D116）
    ('A14', 'Y1S2', 'heroine_01', 'A2-L5', 'choices', [{'t': '「刑總本來就難。」', 'reply': '嗯。我錯的那一題，我回去又查了一次。'}, {'t': '「我也寫得不太好。」', 'reply': '那下禮拜找一天一起對考卷吧。', 'rel': {'comf': 1}}],
     [{'t': '「刑總本來就難。」', 'reply': '嗯。我錯的那一題，我回去又查了一次。'}, {'t': '「我也寫得不太好。」', 'reply': '發回來你先對。不懂的問我。', 'rel': {'comf': 1}}], '「發回來你先對。不懂的問我。」'),   # AA_581 第 49、50 列（D118 沒有期中考）：選項字、回覆照 AA_581 換（讀稿時 d118_fix.json 先換，所以舊值、稿裡的字也是新的）
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
                                 ('3-11 K-16', 'kexin', '好啊。下次你來木柵大學，我帶你去圖書館前面找。', '圖書館前面那兩隻，一隻叫原告，一隻叫被告。', '「圖書館前面那兩隻，一隻叫原告，一隻叫被告。」')]),
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
#      AA_584（學姊改稿第二批：閒聊階梯與邀約；AA 定稿（第 9 節）＋BB_230 口氣審 PASS＋使用者 2026-11-02 18:0x 選擇題確認（第 11 節），企劃線 14154434b）：
#      企劃線的源稿 build_ladder_bb*.py／ladder_bb*.json 還沒改，這裡照稿上的對照表疊上去——第 2 節 ladder.js 的每一列（# 是數字的）：位置＝學期＋層（或 greet、bikeSeat）＋欄位，
#      目前的值＝「原句」才換成「改成」（已經是「改成」就跳過；兩個都不是＝停下來，企劃線改過了要重看）；「（AA 定：甲）」開頭的去掉這幾個字；
#      「（AA 定：甲）（刪整層）」＝爸爸三層 S2-L5、S5-L5、S7-L6 整層刪（第 4 節、第 9 節第 1 點）；「（刪這一格）」＝大四上交往中「{name}。……沒事。叫一下。」那一格刪（第 11 節第 10 點）；
#      第 11 節另外整層刪：大一上 S-L8（第 5 點「沒有前後文」）、大一下 S2-L6（第 6 點空保溫瓶，上面 AA_373 疊的三句一起沒了）、大二上 S3-L3（第 8 點）、大二上 S3-L6 的 extraIf[0]（第 6 點空保溫瓶）。
#      刪層以後舊存檔的進度（G.social.ladder 是「第幾層」）在 src/story3d.js 的 S.LAD_DEL 換算（AA_584 刪的層）。邀約（invites.js）、STUDY_YES（sis_grad3d.js）是手抄檔，直接改 src（tests/aa584_sis_b2_unit.js）
X584 = _approved_md('docs/story_planning/AA_584_')
if X584:
    P584, S584, md584 = X584; tag584 = f'AA_584@{S584}'
    def _chars584(term): return y1 if term == 'Y1S1' else (out['byTerm'].get(term) or {})
    def _path584(term, path):   # → (容器, key)；層不在了＝None
        if term == 'bikeSeat':
            parts = path.split('.'); o = out['bikeSeat']
        else:
            ch = _chars584(term).get('heroine_05')
            if ch is None: sys.exit(f'{tag584}：{term} 沒有學姊的階梯')
            parts = path.split('.')
            if parts[0] == 'greet': o = ch
            else:
                o = next((x for x in ch.get('steps') or [] if x.get('id') == parts[0]), None); parts = parts[1:]
                if o is None: return None
        keys = []
        for p in parts:
            m = re.match(r'^(\w+)(?:\[(\d+)\])?$', p)
            if not m: sys.exit(f'{tag584}：看不懂位置 {term} {path}')
            keys.append(m.group(1))
            if m.group(2) is not None: keys.append(int(m.group(2)))
        for k in keys[:-1]:
            try: o = o[k]
            except (KeyError, IndexError): return None   # 源稿已經照 AA_584 改掉（例：S3-L6 的 extraIf 整個拿掉，AA 2026-11-02 19:29 @03af79d17）
        return o, keys[-1]
    DROP_STEPS = {('Y1S2', 'S2-L5'), ('Y3S1', 'S5-L5'), ('Y4S2', 'S7-L6'), ('Y1S1', 'S-L8'), ('Y1S2', 'S2-L6'), ('Y2S1', 'S3-L3')}
    for q in ['→ **整層刪**（S-L8，連選項）', '大一下 S2-L6 整層刪', '大二上 S3-L6 的 extraIf[0]（第 38 列「去年總圖那個空的保溫瓶……」）刪掉', '→ **整層刪**（S3-L3，連第 34 列）',
              '→ 這一格刪掉', '**爸爸三層一律選甲：刪整層**']:
        if q not in md584: sys.exit(f'{tag584} 裡找不到：{q}')
    rows, drop_when = [], []
    for line in md584.split('\n'):
        m = re.match(r'^\|\s*(\d+)\s*\|\s*ladder\.js:3 (\S+)(?: (\S+))?\s*\|[^|]*\|([^|]*)\|([^|]*)\|', line)
        if not m: continue
        n, a, b, old, new = int(m.group(1)), m.group(2), m.group(3), m.group(4).strip(), m.group(5).strip()
        term, path = ('bikeSeat', a[len('bikeSeat.'):]) if a.startswith('bikeSeat.') else (a, b)
        rows.append(n)
        if new == '（AA 定：甲）（刪整層）':
            sid = path.split('.')[0]
            if (term, sid) not in DROP_STEPS: sys.exit(f'{tag584} 第 {n} 列：{term} {sid} 不在要刪的層')
            continue
        if new == '（刪這一格）':
            drop_when.append((n, term, path, old)); continue
        if new.startswith('（AA 定：甲）'): new = new[len('（AA 定：甲）'):]
        at = _path584(term, path)
        if at is None:
            if (term, path.split('.')[0]) in DROP_STEPS: continue   # 那一層已經不在（企劃線源稿刪了）
            if term == 'Y2S1' and path.startswith('S3-L6.extraIf[0]'): continue   # 第 38、39 列：這一格本來就要刪（保溫瓶），源稿已經沒有 extraIf
            sys.exit(f'{tag584} 第 {n} 列：{term} 找不到 {path}')
        o, k = at; cur = o[k]
        if cur == new: continue
        if cur != old: sys.exit(f'{tag584} 第 {n} 列：{term} {path} 是 {cur!r}（應該是 {old!r}，或已經是 {new!r}）')
        o[k] = new
    want = set(range(1, 79)) | set(range(89, 94))
    if set(rows) != want: sys.exit(f'{tag584}：ladder.js 的列不對（多了 {sorted(set(rows) - want)}、少了 {sorted(want - set(rows))}）')
    for term, sid in sorted(DROP_STEPS):
        ch = _chars584(term)['heroine_05']; ch['steps'] = [x for x in ch['steps'] if x.get('id') != sid]
    st = next(x for x in _chars584('Y2S1')['heroine_05']['steps'] if x.get('id') == 'S3-L6')
    ex = [x for x in st.get('extraIf') or [] if not ('ev_sis_empty_flask' in json.dumps(x.get('if')) and any('空的保溫瓶' in l for l in x.get('lines') or []))]
    if ex: st['extraIf'] = ex
    else: st.pop('extraIf', None)
    for n, term, path, old in drop_when:
        g = _chars584(term)['heroine_05']['greet']; g['when'] = [w for w in g['when'] if w.get('t') != old]
    out['source'] += f'＋{os.path.basename(P584)[:6]}@{S584}（學姊第二批：{len(rows)} 列、刪 {len(DROP_STEPS)} 層、S3-L6 extraIf、大四上招呼一格）'
#      AA_595（四條新規則違反清單，任務 AA595-LIB-NOD-THERMOS-1102；「AA 處理決定」第 4 節：使用者 2026-11-02 選「改成『回家』」）：4-1 以安大一上 A-L10 第一句「寒假你回臺北的家，對吧。」→「寒假你會回家住嗎？」
#      （AA 定稿的句子；整句相同才換，企劃線源稿自己改好了就跳過）。其他「臺北的家」都在手抄檔、程式裡，直接改 src（tests/aa595_rules_unit.js）
X595 = _approved_md('docs/story_planning/AA_595_')
if X595:
    P595, S595, md595 = X595
    _swap(f'AA_595@{S595}', md595, y1, [('4-1', 'heroine_01', '寒假你回臺北的家，對吧。', '寒假你會回家住嗎？', '「寒假你會回家住嗎？」')])
    out['source'] += f'＋{os.path.basename(P595)[:6]}@{S595}（以安 A-L10 一句）'
#      AA_753（沛珊重寫第二份，PEISHAN-VOICE-1110，使用者 X327「有趣、聰明、會接梗」）：大一上 P-L1～P-L8 的 lines、choices 和 greet 整組換成稿上的；
#      id、if／skipIf／week、順序、rel、整層的 mem 不動（稿的 _meta.target）。choices 用 {t, re, fx, mem?}（DLG-FX-MECH-1110；re 裡的 {narr} 寫成整句括號的字串＝story3d.js ladPlay 當旁白演）。
#      舊的 note（都在講被換掉的舊句）拿掉。**只認 PS753_SHA 那一版**（LAWWW 2026-11-10：使用者糾正「不是看到食物就要評論」以後的稿）。這一段放在最後＝前面疊在沛珊大一上的修正（AA_703 P-L6…）都被整層取代
PS753_SHA = '33a1769f8'
A753 = G.approved_files(ALLOW, 'docs/story_planning/AA_753_peishan_ladder_Y1S1')   # 2026-11-11：AA_753 其他學期的三個檔在下面（PS753_MORE），這裡只拿大一上那一個
if A753:
    (P753, S753), = A753.items()
    ok, why = G.allowed(P753, S753, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    if not (S753.startswith(PS753_SHA) or PS753_SHA.startswith(S753)): sys.exit(f'{P753}@{S753}：沛珊的稿只認 {PS753_SHA}（要換版本先改這支工具的 PS753_SHA）')
    d753 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S753}:{P753}'], text=True)))
    ps = y1['classmate_peishan']; cur = {s['id']: s for s in ps['steps']}
    ids = [s.get('id') for s in d753['steps']]
    if ids != [f'P-L{i}' for i in range(1, 9)] or [s['id'] for s in ps['steps']] != ids: sys.exit(f'AA_753@{S753}：steps 要剛好是 P-L1～P-L8、順序和現在的階梯一樣（{ids}）')
    def _re753(x, w):
        if isinstance(x, str) and x.strip(): return x
        if isinstance(x, dict) and set(x) == {'narr'} and re.fullmatch(r'（[^（）]+）', x['narr'] or ''): return x['narr']
        sys.exit(f'AA_753 {w}：re 的每一行要是字串或 {{narr: （…）}}')
    for s in d753['steps']:
        t = cur[s['id']]; w = s['id']
        if set(s) - {'id', 'lines', 'choices', 'mem', 'note'}: sys.exit(f'AA_753 {w}：不認得的欄位 {sorted(set(s) - {"id", "lines", "choices", "mem", "note"})}')
        if s.get('mem') != t.get('mem'): sys.exit(f'AA_753 {w}：整層的 mem 要和現在的一樣（稿 {s.get("mem")}、現在 {t.get("mem")}）')
        if not (isinstance(s.get('lines'), list) and s['lines'] and all(isinstance(l, str) and l.strip() for l in s['lines'])): sys.exit(f'AA_753 {w}：lines 要是字串陣列')
        ch = []
        for i, c in enumerate(s.get('choices') or []):
            if set(c) - {'t', 're', 'fx', 'mem'} or not isinstance(c.get('t'), str) or not isinstance(c.get('re'), list) or not c['re']: sys.exit(f'AA_753 {w} 選項 {i + 1}：只認得 {{t, re, fx, mem}}')
            fx = c.get('fx') or {}
            if set(fx) - {'fr', 'love'} or not all(isinstance(v, int) for v in fx.values()): sys.exit(f'AA_753 {w} 選項 {i + 1}：fx 只能是 {{fr, love}} 整數')
            o = {'t': c['t'], 're': [_re753(x, f'{w} 選項 {i + 1}') for x in c['re']]}
            if fx: o['fx'] = fx
            if c.get('mem'): o['mem'] = c['mem']
            ch.append(o)
        if len(ch) < 2: sys.exit(f'AA_753 {w}：選項至少兩個')
        t['lines'] = list(s['lines']); t['choices'] = ch; t.pop('note', None)
        for k in ('linesIf', 'extraIf'):
            if k in t: sys.exit(f'AA_753 {w}：現在的階梯這一層有 {k}（稿沒有寫怎麼處理），先問 AA')
    g = d753.get('greet') or {}
    if set(g) - {'base', 'when', 'note'} or not g.get('base') or not all(isinstance(x, str) and x.strip() for x in g['base']): sys.exit('AA_753 greet：只認得 {base, when, note}')
    old_when = [{k: v for k, v in x.items() if k != 't'} for x in (ps.get('greet') or {}).get('when') or []]
    if [{k: v for k, v in x.items() if k != 't'} for x in g.get('when') or []] != old_when: sys.exit('AA_753 greet.when：條件（time／location／weekday）要和現在的一樣，只換句子')
    ps['greet'] = {'base': list(g['base']), 'when': [dict(x) for x in g['when']]}
    bad = [m for m in mems({'classmate_peishan': ps}) if not has(m)]
    if bad: sys.exit(f'AA_753：記憶沒有中文名稱 {bad}（src/social3d.js 補）')
    out['source'] += f'＋AA_753@{S753}（沛珊大一上 P-L1～P-L8＋招呼整組重寫）'
#      AA_753 其他三份（2026-11-11，X327 沛珊重寫；大一下＋大二上、大三、大四）：一份一個檔、各自只認一個 SHA（PS753_MORE）。照大一上的做法：
#      每一層只換 lines、choices（{t, re, fx, mem?}），id、if／week／skipIf／skipAfterWeek、順序、rel、整層的 mem、friendOnly、context 不動；舊的 note 拿掉。
#      - linesIf（P2-L3 看過她上課、P3-L3／L4／L6／L8 聽過「我要重考」）：稿沒有寫這幾套（稿的 _meta 寫這兩學期是沒交往的玩家聽的；程式裡 friendOnly 不擋人，交往中、看過 P3 的玩家聽的是 linesIf）——
#        那一套的兩句照舊留著，**原本的選項跟著那一套走**（linesIf[].choices；story3d.js ladPlay：那一套成立就用它的選項），不然舊的兩句會接到新的選項上（「我舉手了」接「後來有舉嗎？」「沒有！」）。等 AA 補這五套再換。
#      - extraIf（P5-L6 日本／美國多說的一句）照舊接在新的兩句後面。
#      - 招呼：mode full＝稿給 base＋when 整組（when 的條件要和現在的一樣，只少 drop 列的那幾則——第 8、9 週那句，AA_578 沒有期中考）；mode base＝只換 base，when 照舊、只拿掉 drop 列的那幾則（整句相同才拿）。
#        2026-11-11 AA 補了這五套（AA_753_peishan_ladder_linesIf.json，下面的 PS753_LINESIF_FILE）：那一套的兩句和選項都換成稿上的，條件照舊。
#        同一個 commit（b59a8f9de）AA_753_peishan_ladder_Y1S2_Y2S1.json 更正一句：P2-L3 主句第一句「一個禮拜兩天。」→「每個禮拜三。」（課輔班是每週三 18:00～21:00，AA_614）——和 c5094495d 只差這一句。
#      - P8-L2（要排公開課，我舉手了）：稿的 event_open_class.ladder——4/14 那一場（ev_peishan_open_class）演過就跳過這一層（skipIf；原本的 skipAfterWeek 8 照留）。
PS753_MORE = [('AA_753_peishan_ladder_Y1S2_Y2S1.json', 'b59a8f9de', {'Y1S2': ('full', ['我在客運上背了一路，才背到第三章。']), 'Y2S1': ('full', ['我背到第三章，還有四章。'])}),
              ('AA_753_peishan_ladder_Y3.json', '188061108', {'Y3S1': ('base', ['你吃早餐了嗎？……我家開早餐店，習慣問。']), 'Y3S2': ('base', ['期中。我的考卷上，畫了一個笑臉。……我自己畫的。', '你吃早餐了嗎？'])}),
              ('AA_753_peishan_ladder_Y4.json', '465382f83', {'Y4S1': ('base', []), 'Y4S2': ('base', [])})]
PS753_LINESIF = {'P2-L3', 'P3-L3', 'P3-L4', 'P3-L6', 'P3-L8'}; PS753_EXTRAIF = {'P5-L6'}
PS753_SKIPIF = {'P8-L2': {'events': ['ev_peishan_open_class']}}
def _ps753_re(x, w):
    if isinstance(x, str) and x.strip(): return x
    if isinstance(x, dict) and set(x) == {'narr'} and re.fullmatch(r'（[^（）]+）', x['narr'] or ''): return x['narr']
    sys.exit(f'AA_753 {w}：re 的每一行要是字串或 {{narr: （…）}}')
for F753, SHA753, TERMS753 in PS753_MORE:
    PATH753 = 'docs/story_planning/' + F753
    A = G.approved_files(ALLOW, PATH753)
    if not A: continue
    S = A[PATH753]
    ok, why = G.allowed(PATH753, S, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    if not (S.startswith(SHA753) or SHA753.startswith(S)): sys.exit(f'{PATH753}@{S}：沛珊的稿只認 {SHA753}（要換版本先改這支工具的 PS753_MORE）')
    d = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S}:{PATH753}'], text=True)))
    for term, (mode, drop) in TERMS753.items():
        ps = (out['byTerm'].get(term) or {}).get('classmate_peishan'); m = d.get(term)
        if not ps or not isinstance(m, dict): sys.exit(f'AA_753@{S}：{term} 稿或現在的階梯找不到 classmate_peishan')
        if set(m) - {'steps', 'greet'}: sys.exit(f'AA_753 {term}：不認得的欄位 {sorted(set(m) - {"steps", "greet"})}')
        cur = {s['id']: s for s in ps['steps']}; ids = [s.get('id') for s in m['steps']]
        if [s['id'] for s in ps['steps']] != ids or len(ids) != 8: sys.exit(f'AA_753@{S} {term}：steps 要和現在的階梯一樣八層、同順序（{ids}）')
        for s in m['steps']:
            t = cur[s['id']]; w = s['id']
            if set(s) - {'id', 'lines', 'choices', 'mem', 'note'}: sys.exit(f'AA_753 {w}：不認得的欄位 {sorted(set(s) - {"id", "lines", "choices", "mem", "note"})}')
            if s.get('mem') != t.get('mem'): sys.exit(f'AA_753 {w}：整層的 mem 要和現在的一樣（稿 {s.get("mem")}、現在 {t.get("mem")}）')
            if not (isinstance(s.get('lines'), list) and s['lines'] and all(isinstance(l, str) and l.strip() for l in s['lines'])): sys.exit(f'AA_753 {w}：lines 要是字串陣列')
            ch = []
            for i, c in enumerate(s.get('choices') or []):
                if set(c) - {'t', 're', 'fx', 'mem'} or not isinstance(c.get('t'), str) or not isinstance(c.get('re'), list) or not c['re']: sys.exit(f'AA_753 {w} 選項 {i + 1}：只認得 {{t, re, fx, mem}}')
                fx = c.get('fx') or {}
                if set(fx) - {'fr', 'love'} or not all(isinstance(v, int) for v in fx.values()): sys.exit(f'AA_753 {w} 選項 {i + 1}：fx 只能是 {{fr, love}} 整數')
                o = {'t': c['t'], 're': [_ps753_re(x, f'{w} 選項 {i + 1}') for x in c['re']]}
                if fx: o['fx'] = fx
                if c.get('mem'): o['mem'] = c['mem']
                ch.append(o)
            if len(ch) < 2: sys.exit(f'AA_753 {w}：選項至少兩個')
            if ('linesIf' in t) != (w in PS753_LINESIF) or ('extraIf' in t) != (w in PS753_EXTRAIF): sys.exit(f'AA_753 {w}：這一層的 linesIf／extraIf 和工具認得的不一樣（PS753_LINESIF／PS753_EXTRAIF），先問 AA')
            for x in t.get('linesIf') or []:
                if 'choices' not in x: x['choices'] = [dict(c) for c in t['choices']]   # 那一套的選項＝重寫以前的（等 AA 補）
            t['lines'] = list(s['lines']); t['choices'] = ch; t.pop('note', None)
            if w in PS753_SKIPIF:
                if t.get('skipIf') not in (None, PS753_SKIPIF[w]): sys.exit(f'AA_753 {w}：現在已經有別的 skipIf（{t.get("skipIf")}）')
                t['skipIf'] = PS753_SKIPIF[w]
        g = m.get('greet') or {}; og = ps.get('greet') or {}
        if not g.get('base') or not all(isinstance(x, str) and x.strip() for x in g['base']): sys.exit(f'AA_753 {term} greet：base 要是字串陣列')
        for x in drop:
            if sum(1 for q in og.get('when') or [] if q.get('t') == x) != 1: sys.exit(f'AA_753 {term} greet：要拿掉的那一則「{x}」在現在的 when 裡不是剛好一則')
        keep_when = [q for q in og.get('when') or [] if q.get('t') not in drop]
        cond = lambda q: {k: v for k, v in q.items() if k not in ('t', 'note')}
        if mode == 'full':
            if set(g) - {'base', 'when', 'note'}: sys.exit(f'AA_753 {term} greet：只認得 {{base, when, note}}')
            if [cond(q) for q in g.get('when') or []] != [cond(q) for q in keep_when]: sys.exit(f'AA_753 {term} greet.when：條件要和現在的一樣（只少第 8、9 週那一則），只換句子')
            ps['greet'] = {'base': list(g['base']), 'when': [dict(q) for q in g['when']]}
        else:
            if set(g) - {'base', 'note'}: sys.exit(f'AA_753 {term} greet：這一份只給 base（when 照現有的）')
            ps['greet'] = dict(og, base=list(g['base']), when=keep_when)
        bad = [x for x in mems({'classmate_peishan': ps}) if not has(x)]
        if bad: sys.exit(f'AA_753 {term}：記憶沒有中文名稱 {bad}（src/social3d.js 補）')
    out['source'] += f'＋{F753[:-5]}@{S}（沛珊 {"、".join(TERMS753)} 八層＋招呼重寫）'
#      AA_753 補（2026-11-11，X327）：沛珊五套 linesIf——P2-L3（記得 SAW_HER_TEACH）、P3-L3／L4／L6／L8（演過 ev_peishan_decision）。稿每一層給 term、if、lines（兩句）、choices（{t, re, fx}）：
#      現在的階梯那一層要剛好一套 linesIf、條件（if）和稿的一模一樣（不一樣就停）；那一套的 lines、choices 換成稿上的（上面留著的舊兩句、舊選項被取代），其他欄位不動。**只認 PS753_LINESIF_FILE 的那一版**。
PS753_LINESIF_FILE = ('AA_753_peishan_ladder_linesIf.json', 'b59a8f9de')
PATH753L = 'docs/story_planning/' + PS753_LINESIF_FILE[0]
A753L = G.approved_files(ALLOW, PATH753L)
if A753L:
    S = A753L[PATH753L]
    ok, why = G.allowed(PATH753L, S, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    if not (S.startswith(PS753_LINESIF_FILE[1]) or PS753_LINESIF_FILE[1].startswith(S)): sys.exit(f'{PATH753L}@{S}：沛珊的稿只認 {PS753_LINESIF_FILE[1]}（要換版本先改這支工具的 PS753_LINESIF_FILE）')
    d = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S}:{PATH753L}'], text=True)))
    ids = sorted(k for k in d if not k.startswith('_'))
    if ids != sorted(PS753_LINESIF): sys.exit(f'AA_753 linesIf@{S}：要剛好是 {sorted(PS753_LINESIF)} 五層（稿是 {ids}）')
    for w in ids:
        m = d[w]
        if set(m) - {'term', 'if', 'lines', 'choices', 'mainLineFix'}: sys.exit(f'AA_753 linesIf {w}：不認得的欄位 {sorted(set(m) - {"term", "if", "lines", "choices", "mainLineFix"})}')
        ps = (out['byTerm'].get(m.get('term')) or {}).get('classmate_peishan')
        t = next((x for x in (ps or {}).get('steps', []) if x['id'] == w), None)
        if not t: sys.exit(f'AA_753 linesIf {w}：現在的階梯 {m.get("term")} 找不到這一層')
        li = t.get('linesIf') or []
        if len(li) != 1 or li[0].get('if') != m.get('if'): sys.exit(f'AA_753 linesIf {w}：現在的階梯要剛好一套 linesIf、條件和稿一樣（現在 {[x.get("if") for x in li]}、稿 {m.get("if")}）')
        if not (isinstance(m.get('lines'), list) and len(m['lines']) == 2 and all(isinstance(l, str) and l.strip() for l in m['lines'])): sys.exit(f'AA_753 linesIf {w}：lines 要是兩句')
        ch = []
        for i, c in enumerate(m.get('choices') or []):
            if set(c) - {'t', 're', 'fx'} or not isinstance(c.get('t'), str) or not isinstance(c.get('re'), list) or not c['re']: sys.exit(f'AA_753 linesIf {w} 選項 {i + 1}：只認得 {{t, re, fx}}')
            fx = c.get('fx') or {}
            if set(fx) - {'fr', 'love'} or not all(isinstance(v, int) for v in fx.values()): sys.exit(f'AA_753 linesIf {w} 選項 {i + 1}：fx 只能是 {{fr, love}} 整數')
            o = {'t': c['t'], 're': [_ps753_re(x, f'{w} linesIf 選項 {i + 1}') for x in c['re']]}
            if fx: o['fx'] = fx
            ch.append(o)
        if len(ch) < 2: sys.exit(f'AA_753 linesIf {w}：選項至少兩個')
        fixm = m.get('mainLineFix')
        if fixm and t['lines'][0] != fixm['new']: sys.exit(f'AA_753 linesIf {w}：主句第一句應該已經是更正後的「{fixm["new"]}」（AA_753_peishan_ladder_Y1S2_Y2S1.json@b59a8f9de），現在是「{t["lines"][0]}」')
        li[0]['lines'] = list(m['lines']); li[0]['choices'] = ch
    out['source'] += f'＋{PS753_LINESIF_FILE[0][:-5]}@{S}（沛珊 linesIf 五套）'
#      AA_763（2026-11-11，X327 沛珊零散檔案第三批；tools/story/ps763.py，只認那一版）：階梯重寫沒包到的九句——大三上～大四下招呼 when 七句（只換字，出現條件不動）＋bikeSeat 的 onFirst／offFirst。
#      這九句的來源是 ladder_bb_*.json 的 greet.when（PS753 的 base 模式照舊留著的）和 ladder_bb.json 的 bikeSeat；源檔沒改（企劃線），照稿的 old→new 疊（整句相同才換）。
import ps763 as _ps763
_n763 = _ps763.apply_ladder(out, ROOT, ALLOW)
if _ps763.load(ROOT, ALLOW): out['source'] += '＋' + _ps763.tag(ROOT, ALLOW).replace('.json', '') + f'（沛珊招呼 7 句＋坐後座 2 句，換了 {_n763} 列）'
#      2026-11-11（X327 沛珊重寫；AA 回覆 LAWWW 的問題——AA_763 只列了大四上那一則，大四下還有一則同字的）：byTerm.Y4S2.classmate_peishan.greet.when 裡
#      「早。我八點的課，七點就到了。」→「早。八點的課我還是修了，不要問我為什麼。」（字是 AA 給的，照抄；只換字 t，time、note 不動；大四上那一則 AA_763 已經換成別的字，不動）。
#      剛好一則才換；已經是新句＝跳過；兩個都對不到＝停下來。AA_763 那一層有套（白名單上有）才跟著套。「只在上課日說」跟著新句子走：tools/story/import_greet_classday.py 的 RENAMED。
PS_Y4S2_GREET = ('早。我八點的課，七點就到了。', '早。八點的課我還是修了，不要問我為什麼。')
if _ps763.load(ROOT, ALLOW):
    _w = ((((out.get('byTerm') or {}).get('Y4S2') or {}).get('classmate_peishan') or {}).get('greet') or {}).get('when') or []
    _hit = [q for q in _w if q.get('t') == PS_Y4S2_GREET[0]]
    if not _hit and sum(1 for q in _w if q.get('t') == PS_Y4S2_GREET[1]) == 1:
        pass
    elif len(_hit) != 1:
        sys.exit(f'沛珊大四下的招呼「{PS_Y4S2_GREET[0]}」對到 {len(_hit)} 則（要剛好 1 則）')
    else:
        _hit[0]['t'] = PS_Y4S2_GREET[1]; out['source'] += '＋AA 2026-11-11 回覆（沛珊大四下招呼 1 句）'
#      BB_326 第 4 節（BB 2026-11-11 定——條件歸 BB；LAWWW 同意）：沛珊課輔班那兩句招呼的出現條件照現行作息改（課輔班每週三 18:00～21:00、溫州街、大一上～大二上，AA_614／characters.js）：
#      「（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！」（大一下、大二上）＝溫州街、週三 18:00～21:00；「我剛從課輔班回來。……」（大二上）＝週三 21:00～22:30、不限地點。
#      舊的週二四 16:30～18:00、週二三四 16:30～18:00／18:00～21:00 兩組拿掉。只改 when 的 weekday／time，字不動；現在的條件要剛好是舊的那一組（已經是新的＝跳過；都不是＝停下來）。白名單沒有 BB_326＝不改。
#      （src/aa614_3d.js 原本在載入時把第一句搬到週三 20:50～21:10——那一段拿掉，條件以這裡為準。）
PATH326 = 'docs/story_planning/BB_326_學姊約會樣板D01到D03_第二意見.md'
A326 = G.approved_files(ALLOW, PATH326)
if A326:
    S = A326[PATH326]
    ok, why = G.allowed(PATH326, S, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md326 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S}:{PATH326}'], text=True))
    for q in ('溫州街、週三 18:00～21:00、Y1S1～Y2S1', '週三 21:00～22:30，不限地點', '舊的週二四 16:30～18:00、週二三四兩組條件拿掉'):
        if q not in md326: sys.exit(f'BB_326@{S} 第 4 節找不到：{q}')
    CROSS326 = '（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！'
    PS326 = [('Y1S2', CROSS326, {'location': ['wenzhou'], 'weekday': [2, 4], 'time': [16.5, 18]}, {'location': ['wenzhou'], 'weekday': [3], 'time': [18, 21]}),
             ('Y2S1', CROSS326, {'location': ['wenzhou'], 'weekday': [2, 3, 4], 'time': [16.5, 18]}, {'location': ['wenzhou'], 'weekday': [3], 'time': [18, 21]}),
             ('Y2S1', '我剛從課輔班回來。你看我的手，都是紅筆。', {'weekday': [2, 3, 4], 'time': [18, 21]}, {'weekday': [3], 'time': [21, 22.5]})]
    n326 = 0
    for term, t, old, new in PS326:
        when = out['byTerm'][term]['classmate_peishan']['greet']['when']
        idx = [i for i, q in enumerate(when) if q.get('t') == t]
        if len(idx) != 1: sys.exit(f'BB_326 第 4 節：{term} 沛珊的招呼「{t}」在 when 裡不是剛好一則（{len(idx)}）')
        cur = {k: v for k, v in when[idx[0]].items() if k not in ('t', 'note')}
        if cur == new: continue
        if cur != old: sys.exit(f'BB_326 第 4 節：{term}「{t}」現在的條件是 {cur}，不是舊的 {old}（要重看）')
        e = dict(new); e['t'] = t
        if 'note' in when[idx[0]]: e['note'] = when[idx[0]]['note']
        when[idx[0]] = e; n326 += 1
    out['source'] += f'＋BB_326@{S}（第 4 節：沛珊課輔班兩句招呼的出現條件，改了 {n326} 則）'
#      AA_781（DLG-FULL-REVIEW-1110，使用者 X324：閒聊階梯全部重看；AA 2026-11-11 交稿，BB 看過）：**通用覆蓋層**——任何人、任何學期都走這一段，不用再為一個人寫一段。
#      白名單上 docs/story_planning/AA_781_<人>_ladder_<學期>.json 一檔一筆（path＋sha）＝匯；加白名單就好，不用改這支工具。稿的格式（LAWWW 和 AA 2026-11-11 07:4x 定）：
#      - 最上層只認 who（人物 id）、term（例 "Y1S1"；陣列＝同一份疊在好幾個學期）、_meta（說明，不匯）、steps、rows；別的欄位＝停。同一人同一學期只能一個檔。
#      - steps：[{id, lines, choices[, mem, rel, note]}]——那一層整層換 lines 和 choices（選項 {t, re, fx[, rel, mem]}，re 每一行是字串或 {narr: "（…）"}）；
#        id、if、week、location、順序、整層的 rel、mem、note 都不動（稿有寫 mem／rel 就要和現在的一樣）。選項至少兩個、fx 只認 {fr, love} 整數。
#        現在那一層的選項有 rel／mem、稿沒照抄（或稿多了）＝停；現在那一層有 linesIf／extraIf（稿沒寫那一套怎麼辦；要換就用 rows 一句一句換）＝停；
#        選項的字被程式認的層（AA781_CHOICE_KEYED＋掃 src 的 LADDER_CHOICE_IF／LADDER_REPLY_IF／S.LAD.choice／privtalk choiceIf）選項的 t 要一字不差。
#      - rows：[{at, old, new[, note, path]}]——at＝層的 id：old 在那一層（lines、選項的 t／回話、linesIf、extraIf）整句相同剛好一處；at＝greet.base[i]／greet.when[i]：那一格的字＝old。
#        對不到、不只一處＝停（不猜）。path 有寫就要和實際換到的位置一樣。換到選項的 t、而那一層在上面那張表＝停。
#      - 先 steps 再 rows；這一段放在所有修正層後面（稿對的是遊戲現在的字）。讀稿照 read_fix，換名換出來和稿不一樣＝停（稿要寫遊戲現在的字）。
#      - 被換掉的字如果 src 裡有程式寫死（例：STORY.LADDER_GREET_IF 用招呼的字認條件）：同一個檔也要有新字（程式跟著改了）、或列在 AA781_CODE_OK，不然停；
#        「只在上課日說」（src/data/greet_classday.js，tools/story/import_greet_classday.py 產生）的招呼：RENAMED 要有這一句的新字，不然停。
#      測試：tests/ladder_aa781_1111_unit.js（每個檔每一列都換到、其他人其他學期零差異、選項被程式認的層字不變、rel／mem 沒掉）
AA781_PREFIX = 'docs/story_planning/AA_781_'
AA781_CHOICE_KEYED = {'A7-L5', 'Y6-L3', 'Y4-L6', 'A5-L1', 'A5-L8', 'K5-L2', 'Y5-L1', 'Y5-L6', 'Y5-L7', 'Y5-L8'}   # LAWWW 2026-11-11 列的（另外掃 src 補）
AA781_CODE_OK = {   # {(舊字, 'src/…js'): '為什麼程式裡那一句不用跟著換'}（只是剛好同一句，不是程式用字認階梯）
    ('……嗯。你也是。', 'src/data/jp_blank_lines.js'): '日本篇空白日立衡的台詞（AA_435），和學姊大三下 S6-L4 剛好同一句；不是用字認階梯，不跟著換'}
AA781_ROW_SKIP = {}   # {(檔名不含 .json, at, old): 為什麼這一列不換}——稿對錯人的列：不換、印出來、紀錄裡記 skip（其他列照換）；AA 改稿以後從這裡拿掉。
                      # 2026-11-12：AA 把 AA_781_kx_ladder_Y0S1 的 K0-L8「……那就是你。不意外。」那一列從稿拿掉了（企劃線 74e0421b8；那一句是品妤 PY0-L7 的回話）→ 這張表清空
A781 = {} if '--no-aa781' in sys.argv else {p: s for p, s in G.approved_files(ALLOW, AA781_PREFIX).items() if re.match(r'^docs/story_planning/AA_781_[A-Za-z0-9]+_ladder_[A-Za-z0-9_]+\.json$', p)}   # --no-aa781：不疊這一層（測試比「其他人、其他學期零差異」用，配 --out）
AA781_LOG = []
if A781:
    _keyed781 = set(AA781_CHOICE_KEYED)
    for _fn in ('story3d.js', 'privtalk3d.js', 'y3fill3d.js'):
        _s = open(os.path.join(ROOT, 'src', _fn), encoding='utf8').read()
        _keyed781 |= set(re.findall(r"'([A-Za-z0-9]+-L\w+)'\]?\s*[:=]\s*\{\s*'", _s)) | set(re.findall(r"step:'([A-Za-z0-9]+-L\w+)',\s*choice:'", _s))
    _lits781 = {}   # src 裡的字串常數 → 檔（ladder.js、greet_classday.js 是產生出來的，另外看）
    for _dp, _dn, _fns in os.walk(os.path.join(ROOT, 'src')):
        for _f in _fns:
            _p = os.path.relpath(os.path.join(_dp, _f), ROOT).replace(os.sep, '/')
            if not _f.endswith('.js') or _p in ('src/data/ladder.js', 'src/data/greet_classday.js'): continue
            for _m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"", open(os.path.join(_dp, _f), encoding='utf8').read()):
                _lits781.setdefault(_m.group(1) if _m.group(1) is not None else _m.group(2), set()).add(_p)
    try:
        _gc = open(os.path.join(ROOT, 'src', 'data', 'greet_classday.js'), encoding='utf8').read(); _gc781 = json.loads(_gc[_gc.index('{'):_gc.rindex('}') + 1])
    except (OSError, ValueError): _gc781 = {}
    import import_greet_classday as _GCI
    TEXT781 = ('lines', 'choices', 'linesIf', 'extraIf', 't', 'reply', 're')
    def _txt781(o):   # 一層裡所有台詞字串：(值, 位置 [key/index…])
        if isinstance(o, str): yield o, []
        elif isinstance(o, list):
            for i, v in enumerate(o):
                for x, p in _txt781(v): yield x, [i] + p
        elif isinstance(o, dict):
            for k in TEXT781:
                if k in o:
                    for x, p in _txt781(o[k]): yield x, [k] + p
    def _pstr781(keys):
        return ''.join(f'[{k}]' if isinstance(k, int) else f'.{k}' for k in keys)
    def _code781(tag, who, old, new):   # 程式寫死舊字＝新字也要在同一個檔（或 AA781_CODE_OK）；new 是 None（steps 整層換掉的字）＝程式裡不能有舊字
        for p in sorted(_lits781.get(old, ())):
            if (old, p) in AA781_CODE_OK: continue
            if new is None or p not in _lits781.get(new, ()): sys.exit(f'{tag}：「{old}」在 {p} 裡是寫死的字（程式用字認），那個檔沒有新字「{new}」——先改程式（或列 AA781_CODE_OK）')
        for k, v in _gc781.items():
            if isinstance(v, dict) and old in (v.get(who) or []):
                if new is None: sys.exit(f'{tag}：「{old}」是只在上課日說的招呼（src/data/greet_classday.js {k}），steps 不能換招呼')
                rn = _GCI.RENAMED.get((who, old)); rn = (rn,) if isinstance(rn, str) else (rn or ())
                if new not in rn: sys.exit(f'{tag}：「{old}」是只在上課日說的招呼（src/data/greet_classday.js {k}），tools/story/import_greet_classday.py 的 RENAMED 要加 ({who!r}, {old!r}) → {new!r}')
    def _re781(x, w):
        if isinstance(x, str) and x.strip(): return x
        if isinstance(x, dict) and set(x) == {'narr'} and re.fullmatch(r'（[^（）]+）', x['narr'] or ''): return x['narr']
        sys.exit(f'{w}：re 的每一行要是字串或 {{narr: （…）}}')
    def _rm781(cs):   # 選項的 rel／mem（不看字）：要和現在的一樣
        return sorted(json.dumps([c.get('rel') or None, c.get('mem') or None], sort_keys=True, ensure_ascii=False) for c in cs if c.get('rel') or c.get('mem'))
    seen781 = {}
    for P781 in sorted(A781):
        S781 = A781[P781]
        ok, why = G.allowed(P781, S781, ALLOW)
        if not ok: sys.exit('拒絕匯入：' + why)
        raw = subprocess.check_output(['git', '-C', ROOT, 'show', f'{S781}:{P781}'], text=True); fx = G.read_fix(raw)   # 讀稿照 read_fix（同一行，tests/alison_unit.js 第 4 項掃得到）
        d0, d = json.loads(raw), json.loads(fx)
        tag = f'{os.path.basename(P781)[:-5]}@{S781}'
        if {k: v for k, v in d0.items() if k != '_meta'} != {k: v for k, v in d.items() if k != '_meta'}: sys.exit(f'{tag}：讀稿換名（read_fix）以後字變了——稿要寫遊戲現在的字，請 AA 改稿')
        if set(d) - {'who', 'term', '_meta', 'steps', 'rows'}: sys.exit(f'{tag}：不認得的欄位 {sorted(set(d) - {"who", "term", "_meta", "steps", "rows"})}')
        who = d.get('who'); terms = d.get('term'); terms = [terms] if isinstance(terms, str) else terms
        if not isinstance(who, str) or not isinstance(terms, list) or not terms or not all(isinstance(t, str) and re.match(r'^Y\d+S[12]$', t) for t in terms): sys.exit(f'{tag}：who／term 不對（{who!r}、{d.get("term")!r}）')
        steps, rows = d.get('steps') or [], d.get('rows') or []
        if not isinstance(steps, list) or not isinstance(rows, list) or not (steps or rows): sys.exit(f'{tag}：steps、rows 要是陣列，至少一個有東西')
        for term in terms:
            if (who, term) in seen781: sys.exit(f'{tag}：{term} {who} 已經有 {seen781[(who, term)]}（同一人同一學期只能一個檔）')
            seen781[(who, term)] = tag
            chars = y1 if term == 'Y1S1' else out['byTerm'].get(term)   # 大一上在 characters（上面 y1，和 out['characters'] 同一份）
            ch = (chars or {}).get(who)
            if not isinstance(ch, dict): sys.exit(f'{tag}：現在的階梯 {term} 沒有 {who}')
            base = f'characters.{who}' if term == 'Y1S1' else f'byTerm.{term}.{who}'
            ell0 = sum(x.count('……') for x, _ in _txt781({'lines': [s for s in ch.get('steps') or []] + list(ch.get('dating') or [])})) + sum(x.count('……') for x in ((ch.get('greet') or {}).get('base') or [])) + sum((w.get('t') or '').count('……') for w in ((ch.get('greet') or {}).get('when') or []))
            def _layer(sid, w):
                L = [x for x in list(ch.get('steps') or []) + list(ch.get('dating') or []) if x.get('id') == sid]
                if len(L) != 1: sys.exit(f'{w}：{term} {who} 的階梯找到 {len(L)} 個 {sid}（要剛好一個）')
                return L[0], ('steps' if L[0] in (ch.get('steps') or []) else 'dating')
            n_steps = n_rows = 0
            for s in steps:
                w = f'{tag} {term} steps {s.get("id")}'
                if not isinstance(s, dict) or set(s) - {'id', 'lines', 'choices', 'mem', 'rel', 'note'}: sys.exit(f'{w}：不認得的欄位 {sorted(set(s) - {"id", "lines", "choices", "mem", "rel", "note"}) if isinstance(s, dict) else s}')
                t, _ = _layer(s.get('id'), w)
                for k in ('mem', 'rel'):
                    if k in s and s[k] != t.get(k): sys.exit(f'{w}：整層的 {k} 要和現在的一樣（稿 {s[k]!r}、現在 {t.get(k)!r}）')
                for k in ('linesIf', 'extraIf'):
                    if t.get(k): sys.exit(f'{w}：現在的階梯這一層有 {k}（稿沒有寫那一套怎麼處理），先問 AA（要換那一套的字用 rows）')
                if not (isinstance(s.get('lines'), list) and s['lines'] and all(isinstance(l, str) and l.strip() for l in s['lines'])): sys.exit(f'{w}：lines 要是字串陣列')
                chs = []
                for i, c in enumerate(s.get('choices') or []):
                    wi = f'{w} 選項 {i + 1}'
                    if not isinstance(c, dict) or set(c) - {'t', 're', 'fx', 'rel', 'mem'} or not isinstance(c.get('t'), str) or not c['t'].strip() or not isinstance(c.get('re'), list) or not c['re']: sys.exit(f'{wi}：只認得 {{t, re, fx, rel, mem}}（t 字串、re 陣列）')
                    fx = c.get('fx') or {}
                    if not isinstance(fx, dict) or set(fx) - {'fr', 'love'} or not all(type(v) is int for v in fx.values()): sys.exit(f'{wi}：fx 只能是 {{fr, love}} 整數')
                    if 'rel' in c and not (isinstance(c['rel'], dict) and c['rel'] and all(type(v) is int for v in c['rel'].values())): sys.exit(f'{wi}：rel 要是 {{名稱: 整數}}')
                    if 'mem' in c and not (isinstance(c['mem'], str) and has(c['mem'])): sys.exit(f'{wi}：mem {c.get("mem")!r} 沒有中文名稱（src/social3d.js 補）')
                    o = {'t': c['t'], 're': [_re781(x, wi) for x in c['re']]}
                    if fx: o['fx'] = dict(fx)
                    if c.get('rel'): o['rel'] = dict(c['rel'])
                    if c.get('mem'): o['mem'] = c['mem']
                    chs.append(o)
                if len(chs) < 2: sys.exit(f'{w}：選項至少兩個')
                cur = t.get('choices') or []
                if _rm781(cur) != _rm781(chs): sys.exit(f'{w}：選項的 rel／mem 和現在的不一樣（現在 {_rm781(cur)}、稿 {_rm781(chs)}）——原本有的要照抄，不默默掉、不多加')
                if s['id'] in _keyed781 and [c.get('t') for c in cur] != [c['t'] for c in chs]: sys.exit(f'{w}：這一層的選項字被程式認（LADDER_CHOICE_IF 之類），t 要一字不差（現在 {[c.get("t") for c in cur]}）')
                keep = {x for x, _ in _txt781({'lines': s['lines'], 'choices': chs})}
                for x, _ in _txt781({'lines': t.get('lines') or [], 'choices': cur}):   # 整層換掉、新稿沒有的字（舊句、舊選項、舊回話）：程式裡不能寫死
                    if x not in keep: _code781(w, who, x, None)
                t['lines'] = list(s['lines']); t['choices'] = chs; n_steps += 1
            for r in rows:
                w = f'{tag} {term} rows {r.get("at") if isinstance(r, dict) else r}'
                if not isinstance(r, dict) or set(r) - {'at', 'old', 'new', 'note', 'path'}: sys.exit(f'{w}：不認得的欄位')
                at, old, new = r.get('at'), r.get('old'), r.get('new')
                if not all(isinstance(x, str) and x.strip() for x in (at, old, new)) or old == new: sys.exit(f'{w}：at、old、new 要是字串、old ≠ new')
                _sk = AA781_ROW_SKIP.get((os.path.basename(P781)[:-5], at, old))
                if _sk:
                    print(f'{w}：「{old}」這一列不換——{_sk}'); AA781_LOG.append({'file': tag, 'term': term, 'who': who, 'at': at, 'skip': _sk}); continue
                m = re.fullmatch(r'greet\.(base|when)\[(\d+)\]', at)
                if m:
                    g = ch.get('greet') or {}; arr = g.get(m.group(1)) or []; i = int(m.group(2))
                    if i >= len(arr): sys.exit(f'{w}：{term} {who} 的招呼沒有 {at}')
                    cur = arr[i] if m.group(1) == 'base' else (arr[i] or {}).get('t')
                    if cur != old: sys.exit(f'{w}：{at} 現在是「{cur}」，不是稿的 old「{old}」（對不到，不猜）')
                    hit = f'{base}.greet.{m.group(1)}[{i}]' + ('.t' if m.group(1) == 'when' else '')
                    if m.group(1) == 'base': arr[i] = new
                    else: arr[i]['t'] = new
                    kind = 'greet'
                else:
                    t, where = _layer(at, w)
                    hits = [p for x, p in _txt781(t) if x == old]
                    if len(hits) != 1: sys.exit(f'{w}：「{old}」在 {term} {who} {at} 整句相同的有 {len(hits)} 處（要剛好一處；對不到不猜）')
                    p = hits[0]; o = t
                    for k in p[:-1]: o = o[k]
                    o[p[-1]] = new
                    is_t = len(p) >= 3 and p[-1] == 't' and p[-3] == 'choices'
                    if is_t and at in _keyed781: sys.exit(f'{w}：{at} 的選項字被程式認（LADDER_CHOICE_IF 之類），不能用 rows 換選項的 t')
                    kind = 'choice.t' if is_t else ('line' if p[0] == 'lines' else ('reply' if p[-1] in ('reply', 're') or (len(p) >= 2 and p[-2] in ('reply', 're')) else p[0]))
                    hit = f'{base}.{where}[{at}]' + _pstr781(p)
                if r.get('path') is not None:
                    alias = {r['path'], r['path'].replace('byTerm.Y1S1.', 'characters.', 1)}
                    if hit not in alias and not (hit.endswith('.t') and hit[:-2] in alias): sys.exit(f'{w}：path 寫的是 {r["path"]}，實際換到的是 {hit}')
                _code781(w, who, old, new)
                AA781_LOG.append({'file': tag, 'term': term, 'who': who, 'at': at, 'kind': kind, 'hit': hit}); n_rows += 1
            ell1 = sum(x.count('……') for x, _ in _txt781({'lines': [s for s in ch.get('steps') or []] + list(ch.get('dating') or [])})) + sum(x.count('……') for x in ((ch.get('greet') or {}).get('base') or [])) + sum((w.get('t') or '').count('……') for w in ((ch.get('greet') or {}).get('when') or []))
            AA781_LOG.append({'file': tag, 'term': term, 'who': who, 'steps': n_steps, 'rows': n_rows, 'ellipsis': [ell0, ell1]})
            bad = [x for x in mems({who: ch}) if not has(x)]
            if bad: sys.exit(f'{tag}：記憶沒有中文名稱 {bad}（src/social3d.js 補）')
    _sum781 = [x for x in AA781_LOG if 'steps' in x]
    out['source'] += f'＋AA_781 通用層 {len(A781)} 檔（{"、".join(sorted({x["term"] for x in _sum781}))}；steps {sum(x["steps"] for x in _sum781)} 層、rows {sum(x["rows"] for x in _sum781)} 列）'
    if '--aa781-log' in sys.argv:
        with open(sys.argv[sys.argv.index('--aa781-log') + 1], 'w', encoding='utf8') as fo: json.dump(AA781_LOG, fo, ensure_ascii=False, indent=1)
# ---- AA_816（X324 最後一塊，AA 11-11 20:56 提格式、LAWWW 同意）：閒聊階梯選項「只加 fx」的覆蓋層（不重抄台詞）——最後一層（AA_781 之後）。
#      docs/story_planning/AA_816_ladder_fx.json＝{"<學期>":{"<人>":{"<層 id>":{"<選項 t 一字不差>":{"fr":0,"love":1}}}}}（"_" 開頭的鍵＝註解）。
#      學期 Y0S1～Y4S2（Y1S1＝characters）；層 id 找 steps 和 dating；選項字照「遊戲裡現在的字」（疊過 AA_781、_swap、_fix 以後）。已經有 fx 的照稿覆蓋；
#      對不到（學期、人、層、選項字）＝停、列出哪一格；fx 只收 fr／love 整數。--no-aa816：不疊（測試比「拿掉 fx 一字不差」用）
P816 = 'docs/story_planning/AA_816_ladder_fx.json'
S816 = None if '--no-aa816' in sys.argv else G.approved_files(ALLOW, P816).get(P816)
if S816:
    _ok, _why = G.allowed(P816, S816, ALLOW)
    if not _ok: sys.exit('拒絕匯入：' + _why)
    raw = subprocess.check_output(['git', '-C', ROOT, 'show', f'{S816}:{P816}'], text=True); fx816 = json.loads(G.read_fix(raw))   # 讀稿照 read_fix（同一行）
    n816, miss816 = 0, []
    for term, people in fx816.items():
        if term.startswith('_'): continue
        chars = y1 if term == 'Y1S1' else out['byTerm'].get(term)
        if not isinstance(chars, dict): miss816.append(f'{term}（沒有這個學期）'); continue
        for who, layers in people.items():
            if who.startswith('_'): continue
            ch = chars.get(who)
            if not ch: miss816.append(f'{term}/{who}（這學期沒有這個人）'); continue
            idx = {}
            for st in list(ch.get('steps') or []) + list(ch.get('dating') or []):
                idx.setdefault(st.get('id'), []).append(st)
            for sid, opts in layers.items():
                if sid.startswith('_'): continue
                sts = idx.get(sid) or []
                if len(sts) != 1: miss816.append(f'{term}/{who}/{sid}（{len(sts)} 層對到）'); continue
                cs = sts[0].get('choices') or []
                for t, fx in opts.items():
                    if t.startswith('_'): continue
                    if not isinstance(fx, dict) or not fx or any(k not in ('fr', 'love') or not isinstance(v, int) or isinstance(v, bool) for k, v in fx.items()):
                        sys.exit(f'AA_816 {term}/{who}/{sid}/「{t}」：fx 只能是 fr／love（整數）——讀到 {fx!r}')
                    hit = [c for c in cs if c.get('t') == t]
                    if len(hit) != 1: miss816.append(f'{term}/{who}/{sid}/「{t}」（{len(hit)} 個選項對到；這一層的選項：{[c.get("t") for c in cs]}）'); continue
                    hit[0]['fx'] = dict(fx); n816 += 1
    if miss816: sys.exit('AA_816：對不到 ' + str(len(miss816)) + ' 格（選項字照 src/data/ladder.js 現在的字）：\n' + '\n'.join(miss816[:40]))
    out['source'] += f'＋AA_816@{S816}（選項 fx {n816} 個）'
if R630: out['source'] += f'＋AA_630@{R630["sha"]}（語彤 {sum(int(re.search(r"(\d+) 列", x).group(1)) for x in LOG630)} 列）'
with open(OUT, 'w', encoding='utf8') as fo:
    fo.write('/* 閒聊階梯（大一上；AA_135、AA_136、BB_130；README 在企劃線 docs/story_planning/ladder/）。產生器：tools/ladder/import_ladder.py（不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst LADDER=" + json.dumps(out, ensure_ascii=False) + ';\nLADDER.byTerm.Y1S1=LADDER.characters;   /* 大一上：舊的 characters／terms 照留（舊程式、舊測試讀得到）*/\n')
print('wrote', OUT, 'Y1S1', {k: len(v['steps']) for k, v in out['characters'].items()}, {t: {k: len(v['steps']) for k, v in c.items()} for t, c in out['byTerm'].items()}, 'kaiDorm', len(out['kaiDorm']))
