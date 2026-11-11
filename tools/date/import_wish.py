"""校外約會的心願事件（DATE-C4、DATE-C5；AA_127 第 1、2 節、BB_128 第 3 節）→ src/data/date_wish.js（不要手改，重跑這支）。
**只讀 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本**（不從分支最新讀）：
  - date_system/wish/wish_aa.json（以安 D07、語彤 D13；AA-B 照 AA_127 逐句轉的，0b478a53 補了以安大一的版本）
  - date_system/wish/wish_bb.json（芷若 D05、子晴 D03、學姊 D15、沛珊 D06、可昕 D25；BB-B 照 BB_128 第 3 節逐句轉的）
  - AA_127、BB_128（白名單原有的版本）：拿來逐句對——JSON 的每一句（旁白去掉括號、空白不算）都要在原稿裡，對不到的印出來、寫進 verify.miss
台詞一字不改。只多兩件事：
  1. AA_127 1-5「大一的版本：前三句換成……」（以安收尾），wish_aa.json 沒轉進去（0b478a53 只補了走廊、小路、結尾）：照 AA_127 原文加成 closing.linesIf（原稿逐字對）。
  2. hold：和現行人物設定衝突、整場先不播的人（照舊走一般的第一次約會，心願照樣算完成）。衝突的句子逐句列出來（給 AA 改）：
     子晴（「欸不是」＋「這不是問句」類每學期合計 2、約會台詞不用「存檔」「這是規則」：AA_188 2-6、AA_313 6-1）、
     學姊（不數東西、沒有「重點是」、朋友以上叫名字；美國學期是大四上 2028-08～12）、可昕（不說「假設」、不比輸贏：AA_373 6-1；AA_188 拿掉「這是告知」）。
     AA 改了原稿重新匯入：衝突的句子不在了，hold 自己消失。
  4. AA_764（DLG-FULL-REVIEW-1110，使用者 X324）：學姊 D15 心願事件照稿的 rows 32 列 old→new 疊（AA_595、AA_593 那兩層照舊先套；換完要等於稿的 wish_event）。白名單沒有 AA_764＝不疊。
  5. AA_768（DLG-FULL-REVIEW-1110，使用者 X324）：語彤 D13 心願事件「這次只有兩個人」照稿的 rows 34 列 old→new 疊（照 path；內容不動、只收字：刪節號、「嗯。」開頭、長椅和河那兩句）。
     closing.lines[5]「……不用趕回去。」是 timeline replace 的 key，不動（換完再檢查一次）。白名單沒有 AA_768＝不疊。
  3. AA_757（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫）：沛珊 D06 心願事件照稿的 wish_rows 69 列 old→new 疊（換完要等於稿的 wish_event；只換字，條件、旗標、時間、花費不動）。白名單沒有 AA_757＝不疊。
用法：python3 tools/date/import_wish.py [--check 企劃線ref] [--out 另存的檔（不寫 src/data/date_wish.js）]"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
SP = 'docs/story_planning/'
FILES = {'waa': SP + 'date_system/wish/wish_aa.json', 'wbb': SP + 'date_system/wish/wish_bb.json',
         'aa': SP + 'AA_127_以安語彤_心願約會與邀約變化.md', 'bb': SP + 'BB_128_校外單獨約會_心願地點與淡水示範規格.md'}
APPROVED = G.approved_files(ALLOW, SP)
for p in FILES.values():
    ok, why = G.allowed(p, APPROVED.get(p, ''), ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
if '--check' in sys.argv:
    ref = sys.argv[sys.argv.index('--check') + 1]
    for p in FILES.values():
        same = subprocess.run(['git', '-C', ROOT, 'diff', '--quiet', APPROVED[p], ref, '--', p]).returncode == 0
        print(('一樣：' if same else f'分支上的版本和白名單（{APPROVED[p]}）不同、不會匯入：') + p)
    sys.exit(0)
show = lambda p: G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True))


def deep(o, f):
    if isinstance(o, dict): return {k: deep(v, f) for k, v in o.items()}
    if isinstance(o, list): return [deep(v, f) for v in o]
    return f(o) if isinstance(o, str) else o


WAA = deep(json.loads(show(FILES['waa'])), G.alison)
WBB = deep(json.loads(show(FILES['wbb'])), G.alison)
MD = {'aa': show(FILES['aa']), 'bb': show(FILES['bb'])}
EV = {}
for src, W in (('aa', WAA), ('bb', WBB)):
    for k, e in W['events'].items():
        e = dict(e); e['src'] = src; EV[k] = e

# ---- 1. 以安收尾的大一版本（AA_127 1-5）----
aa = MD['aa']
i = aa.index('### 1-5. 收尾')
j = aa.index('\n### ', i + 5)
sec = aa[i:j]
m = re.search(r'\*\*大一的版本\*\*（[^\n]*）：前三句換成\n((?:  >.*\n?)+)', sec)
if not m:
    sys.exit('AA_127 1-5 找不到「大一的版本：前三句換成」')
new3 = [x.split('：', 1)[1] for x in re.findall(r'  > (以安：.+)', m.group(1))]
c = EV['heroine_01']['closing']
if not any((x.get('note') or '').startswith('大一的收尾') for x in c.get('linesIf', [])):
    L = c['lines']
    assert L[0]['who'] == 'narr' and L[-1]['who'] == 'narr' and len(L) == 5, 'AA_127 1-5 的收尾格式變了，要重看'
    c['linesIf'] = [{'if': {'unless': {'termFrom': 'Y2S1'}}, 'lines': [L[0]] + [{'who': 'heroine_01', 'text': t} for t in new3] + [L[-1]],
                     'note': '大一的收尾（AA_127 1-5「大一的版本」，2026-10-17 AA-C：前三句換成這兩句；旁白、選項照用。wish_aa.json 沒轉，import_wish.py 照原稿加）'}]

# ---- 1b. AA_525 1-5（企劃線修正稿，白名單上的 commit；AA-C 定稿）：子晴交往中（Q12 以前）的結尾「那座橋，我回去要畫一次。……畫好再給你看。」→「那座橋，我回去要畫一次。」
#      （2027-01-09 第三關的橋接得上，不用再說「給你看」）。整句相同才換；wish_bb.json 下一版自己改好了就跳過 ----
A525 = G.approved_files(ALLOW, SP + 'AA_525_')
SRC525 = ''
if A525:
    P525, S525 = next(iter(A525.items()))
    ok, why = G.allowed(P525, S525, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md525 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S525}:{P525}'], text=True))
    OLD5, NEW5 = '那座橋，我回去要畫一次。……畫好再給你看。', '那座橋，我回去要畫一次。'
    if '改原句：「' + NEW5 + '」' not in md525:
        sys.exit(f'AA_525@{S525} 裡找不到 1-5 的「改原句」：{NEW5}')
    hit = [x for e in EV['heroine_04']['closing'].get('ending') or [] for x in e.get('lines') or [] if x.get('text') in (OLD5, NEW5)]
    if len(hit) != 1:
        sys.exit(f'AA_525 1-5：子晴結尾「{OLD5}」有 {len(hit)} 句（應該是 1 句）')
    hit[0]['text'] = NEW5
    SRC525 = f'＋{os.path.basename(P525)[:6]}@{S525}（子晴結尾 1 句）'

# ---- 1c. AA_595（四條新規則違反清單，白名單 AA595-LIB-NOD-THERMOS-1102；「AA 處理決定」第 3 節）：學姊 D15 陽明山車裡的選項「妳的保溫瓶今天是滿的。」（條件：演過空的保溫瓶）
#      跟著空保溫瓶那條線一起拿掉（3-14）。整個選項刪；wish_bb.json 下一版自己刪了就跳過 ----
A595 = G.approved_files(ALLOW, SP + 'AA_595_')
if A595:
    P595, S595 = next(iter(A595.items()))
    ok, why = G.allowed(P595, S595, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md595 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S595}:{P595}'], text=True))
    T595 = '「妳的保溫瓶今天是滿的。」'
    if '心願約會選項「妳的保溫瓶今天是滿的」' not in md595:
        sys.exit(f'AA_595@{S595} 裡找不到第 3 節「心願約會選項」那一句')
    def _drop595(o):
        n = 0
        if isinstance(o, dict):
            for v in o.values(): n += _drop595(v)
        elif isinstance(o, list):
            k = [x for x in o if isinstance(x, dict) and x.get('t') == T595]
            for x in k: o.remove(x)
            n += len(k)
            for v in o: n += _drop595(v)
        return n
    n595 = _drop595(EV['heroine_05'])
    if n595 > 1:
        sys.exit(f'AA_595 3-14：學姊的心願約會「{T595}」有 {n595} 個（應該是 1 個，或已經刪了）')
    SRC525 += f'＋{os.path.basename(P595)[:6]}@{S595}（學姊 D15 保溫瓶選項刪）'

# ---- 1d. AA_592（以安改稿①b，白名單 AA592-AN-1B-1102；第 9 節第 2 點：媽媽那一句統一）第 53 列：以安 D07 法庭「我媽說，坐在上面的人，要先把對方的理由講得比他自己還好，再決定。」
#      →「我媽說，坐在上面的人，要先把兩邊都講得比他們自己還好，再決定。」（法官面前是兩造、不是「反方」）。整句相同才換；wish_aa.json 下一版自己改好了就跳過。
#      換上去的句子不在 AA_127 原稿：第 2 步逐句對稿時，那一句改對 AA_592 第 53 列的「改成」欄 ----
A592 = G.approved_files(ALLOW, SP + 'AA_592_')
FIX592 = set()
if A592:
    P592, S592 = next(iter(A592.items()))
    ok, why = G.allowed(P592, S592, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md592 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S592}:{P592}'], text=True))
    OLD53, NEW53 = '我媽說，坐在上面的人，要先把對方的理由講得比他自己還好，再決定。', '我媽說，坐在上面的人，要先把兩邊都講得比他們自己還好，再決定。'
    if f'| {OLD53} | {NEW53} |' not in md592:
        sys.exit(f'AA_592@{S592} 裡找不到第 53 列（法庭那一句）')
    def _fix592(o):
        n = 0
        if isinstance(o, dict):
            if o.get('text') in (OLD53, NEW53) and o.get('who') == 'heroine_01':
                o['text'] = NEW53; return 1
            for v in o.values(): n += _fix592(v)
        elif isinstance(o, list):
            for v in o: n += _fix592(v)
        return n
    n592 = _fix592(EV['heroine_01'])
    if n592 != 1:
        sys.exit(f'AA_592 第 53 列：以安 D07 法庭「{OLD53}」有 {n592} 句（應該是 1 句）')
    FIX592.add(NEW53)
    SRC525 += f'＋{os.path.basename(P592)[:6]}@{S592}（以安 D07 法庭 1 句）'

# ---- 1d2. AA_593（學姊改稿①b，白名單 AA593-SIS-1B-1102；使用者 11-02 第 10 節確認）第 82 列：學姊 herInvite.decline 換成「好。……那下次。」——
#      源稿 wish_bb.json@9aa8ec40c 已經改好；BB_128 原稿沒有這一句：第 2 步逐句對稿時，那一句改對 AA_593 第 82 列的「改成」欄 ----
A593 = G.approved_files(ALLOW, SP + 'AA_593_')
FIX593 = set()
if A593:
    P593, S593 = next(iter(A593.items()))
    ok, why = G.allowed(P593, S593, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md593 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S593}:{P593}'], text=True))
    OLD82, NEW82 = '好。那我先把那一格擦掉。……下次再寫回來。', '好。……那下次。'
    if f'| {OLD82} | {NEW82} |' not in md593:
        sys.exit(f'AA_593@{S593} 裡找不到第 82 列（學姊 herInvite.decline）')
    FIX593.add(NEW82)
    SRC525 += f'＋{os.path.basename(P593)[:6]}@{S593}（學姊 decline 1 句）'

# ---- 1e. AA_594（以安改稿④b，白名單 AA594-AN-4B-1102；第 9、10 節「本批全部可以交 LAWWW 整合」）第 2-13 節：心願「規則之外的人」（以安 D07）的 16 列＋記憶名稱（第 368 列）。
#      源稿 wish_aa.json 沒改（企劃線），照表疊：位置欄寫 date_wish.js 的數字列，在以安那一場裡把整句相同的換掉（台詞、旁白、記憶名稱；旁白的括號照原樣）；
#      備註寫「兩處都換」的要剛好 2 處，其他剛好 1 處（第 40 列「原句出現 2 次，只換這一處」的另一處不在這一場）；改成＝原句的列（BB_240 補回）跳過 ----
A594 = G.approved_files(ALLOW, SP + 'AA_594_')
if A594:
    P594, S594 = next(iter(A594.items()))
    ok, why = G.allowed(P594, S594, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md594 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S594}:{P594}'], text=True))
    rows594 = []
    for ln in md594.split('\n'):
        m = re.match(r'^\|\s*([0-9]+)\s*\|(.*)\|\s*$', ln)
        if not m: continue
        c = [x.strip() for x in m.group(2).split('|')]
        if len(c) < 5 or not c[0].startswith('date_wish.js') or c[2] == c[3]: continue
        rows594.append((m.group(1), c[2], c[3], 2 if '兩處都換' in c[4] else 1))
    if len(rows594) != 16:
        sys.exit(f'AA_594@{S594} 第 2-13 節（date_wish.js）應該有 16 列要換，讀到 {len(rows594)} 列')
    def _sub594(o, old, new):
        n = 0
        if isinstance(o, dict):
            for k, v in list(o.items()):
                if k in ('text', 't') and isinstance(v, str) and v in (old, '（' + old + '）'):
                    o[k] = new if v == old else '（' + new + '）'; n += 1
                elif k not in ('note', 'source', 'rule', 'where', 'context'): n += _sub594(v, old, new)
        elif isinstance(o, list):
            for v in o: n += _sub594(v, old, new)
        return n
    for n, old, new, want in rows594:
        cnt = lambda: json.dumps(EV['heroine_01'], ensure_ascii=False).count(json.dumps(new, ensure_ascii=False)[1:-1])
        c0 = cnt(); hit = _sub594(EV['heroine_01'], old, new); got = cnt() - c0   # 輸出裡多了幾處（AA_127 大一版收尾和一般版共用同一個旁白物件，算輸出的處數）
        if hit == 0 and c0 > 0:   # AA_661 第 61 列：源稿（AA_127 那幾格）已經是新字＝跳過，和 tools/story/aa630.py 一樣；兩個都不是照舊停下來
            FIX592.add(new); FIX592.add('（' + new + '）'); continue
        if got != want:
            sys.exit(f'AA_594 第 {n} 列：以安 D07「{old}」換了 {got} 處（應該是 {want} 處）')
        FIX592.add(new); FIX592.add('（' + new + '）')
    SRC525 += f'＋{os.path.basename(P594)[:6]}@{S594}（以安 D07 心願 16 列）'

# ---- 1f. AA_757（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；白名單上的 commit、只認那一版）：沛珊 D06 美術館的心願事件改成「不用接話的一天」。
#      稿的 wish_rows＝69 處 old→new（路徑＝wish_classmate_peishan.… 那一格），wish_event＝整個新物件。源稿 wish_bb.json 沒改（企劃線），照表疊：
#      每一列路徑那一格現在的字要剛好是 old（已經是 new＝源稿自己改好了，跳過），換成 new；換完整個物件要和 wish_event 一模一樣（兩邊互相對）。
#      只換字（text、t、title、wish、note、costNote）：id、loc、條件（if）、旗標、記憶、相簿、時間、花費、選項數都不動——路徑不是這幾種欄位、對不上＝停下來，不猜 ----
A757 = G.approved_files(ALLOW, SP + 'AA_757_')
FIX757 = set()
PS = 'classmate_peishan'
if A757:
    P757, S757 = next(iter(A757.items()))
    ok, why = G.allowed(P757, S757, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d757 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S757}:{P757}'], text=True)))
    rows757 = d757.get('wish_rows') or []
    if len(rows757) != 69:
        sys.exit(f'AA_757@{S757} 的 wish_rows 應該是 69 列，讀到 {len(rows757)} 列')
    n757 = 0
    for r in rows757:
        if not r['path'].startswith('wish_' + PS + '.'):
            sys.exit('AA_757 wish_rows：路徑不是沛珊的心願事件：' + r['path'])
        toks = re.findall(r'\[\d+\]|[^.\[\]]+', r['path'][len('wish_' + PS + '.'):])
        cur, par, key, i = EV[PS], None, None, 0
        while i < len(toks):
            t = toks[i]; k = int(t[1:-1]) if t.startswith('[') else t
            if isinstance(cur, dict) and k not in cur and i + 1 < len(toks) and not toks[i + 1].startswith('[') and f'{k}.{toks[i + 1]}' in cur:
                k = f'{k}.{toks[i + 1]}'; i += 1   # hotspots 的 key 本身有點（D06.gallery）
            try:
                par, key, cur = cur, k, cur[k]
            except (KeyError, IndexError, TypeError):
                sys.exit(f'AA_757 wish_rows：路徑 {r["path"]} 找不到（在 {t}）')
            i += 1
        if key not in ('text', 't', 'title', 'wish', 'note', 'costNote') or not isinstance(cur, str):
            sys.exit(f'AA_757 wish_rows：{r["path"]} 不是字的欄位（只換 text、t、title、wish、note、costNote）')
        if cur == r['new']:
            FIX757.add(r['new']); continue
        if cur != r['old']:
            sys.exit(f'AA_757 wish_rows：{r["path"]} 現在是「{cur}」，不是原句「{r["old"]}」')
        par[key] = r['new']; FIX757.add(r['new']); n757 += 1
    if json.dumps(EV[PS], ensure_ascii=False, sort_keys=True) != json.dumps(d757.get('wish_event'), ensure_ascii=False, sort_keys=True):
        sys.exit('AA_757：69 列換完以後和稿的 wish_event 不一樣（稿的兩份對不起來，或源稿 wish_bb.json 沛珊那一段變了）')
    SRC525 += f'＋{os.path.basename(P757)[:6]}@{S757}（沛珊 D06 心願 69 列，換了 {n757} 列）'

# ---- 1g. AA_764（DLG-FULL-REVIEW-1110，使用者 X324 學姊約會台詞重寫；白名單上的 commit）：學姊 D15 心願事件「不排的晚上」照 AA_566 順一次（拿掉多的刪節號、車裡那一段不用保溫瓶、玩家約她那一句、第 6 階結尾）。
#      做法同 1f：稿的 rows＝32 處 old→new（路徑＝wish_heroine_05.…），wish_event＝整個新物件。源稿 wish_bb.json 沒改（企劃線）——上面 1c（AA_595 刪保溫瓶選項）、1d2（AA_593 decline）照舊先套，
#      再照表疊：路徑那一格現在的字要剛好是 old（已經是 new＝跳過），換成 new；換完整個物件要和 wish_event 一模一樣。只換字（text、t、title、wish、note、costNote、where），對不上＝停下來 ----
A764 = G.approved_files(ALLOW, SP + 'AA_764_')
FIX764 = set()
SIS = 'heroine_05'
if A764:
    P764, S764 = next(iter(A764.items()))
    ok, why = G.allowed(P764, S764, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d764 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S764}:{P764}'], text=True)))
    rows764 = d764.get('rows') or []
    if len(rows764) != 32:
        sys.exit(f'AA_764@{S764} 的 rows 應該是 32 列，讀到 {len(rows764)} 列')
    n764 = 0
    for r in rows764:
        if not r['path'].startswith('wish_' + SIS + '.'):
            sys.exit('AA_764 rows：路徑不是學姊的心願事件：' + r['path'])
        toks = re.findall(r'\[\d+\]|[^.\[\]]+', r['path'][len('wish_' + SIS + '.'):])
        cur, par, key, i = EV[SIS], None, None, 0
        while i < len(toks):
            t = toks[i]; k = int(t[1:-1]) if t.startswith('[') else t
            if isinstance(cur, dict) and k not in cur and i + 1 < len(toks) and not toks[i + 1].startswith('[') and f'{k}.{toks[i + 1]}' in cur:
                k = f'{k}.{toks[i + 1]}'; i += 1   # hotspots 的 key 本身有點（D15.rail）
            try:
                par, key, cur = cur, k, cur[k]
            except (KeyError, IndexError, TypeError):
                sys.exit(f'AA_764 rows：路徑 {r["path"]} 找不到（在 {t}）')
            i += 1
        if key not in ('text', 't', 'title', 'wish', 'note', 'costNote', 'where') or not isinstance(cur, str):
            sys.exit(f'AA_764 rows：{r["path"]} 不是字的欄位（只換 text、t、title、wish、note、costNote、where）')
        if cur == r['new']:
            FIX764.add(r['new']); continue
        if cur != r['old']:
            sys.exit(f'AA_764 rows：{r["path"]} 現在是「{cur}」，不是原句「{r["old"]}」')
        par[key] = r['new']; FIX764.add(r['new']); n764 += 1
    if json.dumps(EV[SIS], ensure_ascii=False, sort_keys=True) != json.dumps(d764.get('wish_event'), ensure_ascii=False, sort_keys=True):
        sys.exit('AA_764：32 列換完以後和稿的 wish_event 不一樣（稿的兩份對不起來，或源稿 wish_bb.json 學姊那一段變了）')
    SRC525 += f'＋{os.path.basename(P764)[:6]}@{S764}（學姊 D15 心願 32 列，換了 {n764} 列）'

# ---- 1h. AA_768（DLG-FULL-REVIEW-1110，使用者 X324 語彤約會台詞重寫；白名單上的 commit）：語彤 D13 心願事件「這次只有兩個人」——事件已經是現行設定（AA_626），內容不動、只收字
#      （刪節號 33 處留 4 處、「嗯。」開頭 9 處拿掉、長椅那句的「我們」、河那句的「公館」）。稿只有 rows＝34 列 old→new，path 是 events.heroine_03 底下的位置（那一句台詞的物件或字）。
#      **一定照 path 換**（「……嗯。」「嗯。」「……好。」「……淡水？」「……下次。」整個檔出現很多次）：path 那一格現在的字要剛好是 old（已經是 new＝跳過），換成 new；兩個都不是＝停下來，不猜。
#      只換台詞的字（那一格是 {who,text} 的 text，或直接是一句字）；選項的字、條件、旗標、時間、結構都不動。closing.lines[5]「……不用趕回去。」是 timeline replace 的 key：換完檢查它和 key 都還在 ----
A768 = G.approved_files(ALLOW, SP + 'AA_768_')
FIX768 = set()
YT = 'heroine_03'
if A768:
    P768, S768 = next(iter(A768.items()))
    ok, why = G.allowed(P768, S768, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d768 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S768}:{P768}'], text=True)))
    rows768 = d768.get('rows') or []
    if len(rows768) != 34:
        sys.exit(f'AA_768@{S768} 的 rows 應該是 34 列，讀到 {len(rows768)} 列')
    KEEP768 = '……不用趕回去。'
    n768 = 0
    for r in rows768:
        toks = [q if q else (a if a else int(b)) for q, a, b in re.findall(r'\["([^"]+)"\]|\.?([^.\[\]"]+)|\[(\d+)\]', r['path'])]
        cur, par, key = EV[YT], None, None
        for t in toks:
            try:
                par, key, cur = cur, t, cur[t]
            except (KeyError, IndexError, TypeError):
                sys.exit(f'AA_768 rows：路徑 {r["path"]} 找不到（在 {t!r}）')
        if isinstance(cur, dict) and isinstance(cur.get('text'), str) and cur.get('who') in (YT, 'narr'):
            par, key, cur = cur, 'text', cur['text']
        if not isinstance(cur, str) or key in ('t', 'note', 'who', 'scene', 'rule'):
            sys.exit(f'AA_768 rows：{r["path"]} 不是一句台詞（只換台詞的字）')
        if KEEP768 in (r['old'], r['new']):
            sys.exit(f'AA_768 rows：{r["path"]} 動到 timeline replace 的 key「{KEEP768}」')
        if cur == r['new']:
            FIX768.add(r['new']); continue
        if cur != r['old']:
            sys.exit(f'AA_768 rows：{r["path"]} 現在是「{cur}」，不是原句「{r["old"]}」')
        par[key] = r['new']; FIX768.add(r['new']); n768 += 1
    c768 = EV[YT]['closing']
    if c768['lines'][5].get('text') != KEEP768 or not any(KEEP768 in (x.get('replace') or {}) for x in c768.get('timeline') or []):
        sys.exit(f'AA_768：closing.lines[5]「{KEEP768}」或 timeline replace 的 key 不在了')
    SRC525 += f'＋{os.path.basename(P768)[:6]}@{S768}（語彤 D13 心願 34 列，換了 {n768} 列）'

# ---- 2. 逐句對原稿（台詞、旁白、選項的字；說明欄不算）----
SKIP = ('wish', 'rule', 'note', 'where', 'context', 'source', 'title', 'hotspotsTitle', 'scene', 'repeat', 'costNote', 'likeNote', 'album', 'code', 'name', 'memory', 'record')
def all_text(o, path=''):
    """(路徑, 誰, 字)：台詞與旁白（who 不是 note）、選項（t）、textIf 的 text"""
    if isinstance(o, dict):
        if isinstance(o.get('text'), str) and o.get('who'):
            if o['who'] != 'note': yield path, o['who'], o['text']
            return
        for k, v in o.items():
            if k in SKIP: continue
            if k in ('t', 'text') and isinstance(v, str): yield path + '.' + k, 'opt', v
            else: yield from all_text(v, path + '.' + k)
    elif isinstance(o, list):
        for n, v in enumerate(o): yield from all_text(v, path + f'[{n}]')
def norm(t): return re.sub(r'[\s　]', '', t).replace('『', '「').replace('』', '」')
MDN = {k: norm(v) for k, v in MD.items()}
# AA_626（語彤 D13 照新背景改寫，2026-11-03，白名單 9ba14498e）：wish_aa.json 語彤那一段的新句子對 AA_626（AA_127 第 2 節衝突的句子被它取代）
A626 = G.approved_files(ALLOW, SP + 'AA_626_')
if A626:
    _p, _s = next(iter(A626.items())); _ok, _why = G.allowed(_p, _s, ALLOW)
    if not _ok: sys.exit('拒絕匯入：' + _why)
    MDN['aa'] += norm(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{_s}:{_p}'], text=True)))
miss, extra = [], []
FROM_FREE = re.compile(r'freeVisited')   # 「你來過一次」（AA_160 4-4）：AA_271 第 3 節、BB_213／AB-25 後來加的，不在 AA_127、BB_128
def found(md, p):
    c = {p, p.rstrip('。：'), p.lstrip('她'), p.lstrip('她').rstrip('。：'), re.sub(r'^……嗯。', '', p)}   # 語彤每場第一句的「……嗯。」開頭（AA_186 第 5 節）：AA_626 的稿只寫後面那一句
    return any(x and x in md for x in c)
def walk_ifs(e, k):
    for i, x in enumerate((e.get('arrive') or {}).get('extraIf') or []):
        if FROM_FREE.search(json.dumps(x.get('if') or {})): yield f'{k}.arrive.extraIf[{i}]'
for k, e in EV.items():
    free = tuple(walk_ifs(e, k))
    for path, who, t0 in all_text(e, k):
        t = norm(t0)
        parts = [p for p in re.split(r'[（）「」]', t) if p] if who in ('narr', 'opt') else [t]
        if t0 in FIX592: continue   # AA_592 第 53 列換上去的句子（上面 1d 已對過 AA_592 的表）
        if t0 in FIX593 and k == 'heroine_05': continue   # AA_593 第 82 列（上面 1d2 已對過 AA_593 的表）
        if t0 in FIX768 and k == YT:   # AA_768 換上去的句子（上面 1h 已照 path 對過 AA_768 的 rows）；「你來過一次」的照舊列在 freeVisited
            if free and path.startswith(free): extra.append(f'{path}：{t0}')
            continue
        if t0 in FIX764 and k == SIS:   # AA_764 換上去的句子（上面 1g 已對過 AA_764 的 rows、wish_event）；「你來過一次」的照舊列在 freeVisited
            if free and path.startswith(free): extra.append(f'{path}：{t0}')
            continue
        if t0 in FIX757 and k == PS:   # AA_757 換上去的句子（上面 1f 已對過 AA_757 的 wish_rows、wish_event）；「你來過一次」那兩句照舊列在 freeVisited
            if free and path.startswith(free): extra.append(f'{path}：{t0}')
            continue
        if all(found(MDN[e['src']], p) for p in parts): continue
        (extra if path.startswith(free) and free else miss).append(f'{path}：{t0}')

# ---- 3. 和現行人物設定衝突的句子 ----
RULES = {
    'heroine_04': (r'欸不是|這不是問句|這是問句|這是陳述句|這是直述句|存檔|這是規則',
                   '子晴：「欸不是」＋「這不是問句」類（含「這是問句」「這是陳述句」）每學期合計 2（AA_188 2-6 口氣表、AA_263 1-3）；約會台詞不用「欸不是」「這不是問句」「存檔」（AA_313 6-1）、不用「規則」（BB_128 1165 行 AA_188 重審）'),
    'heroine_05': (r'重點是|學弟[，。]|數到|[一二兩三四五六七八九十]顆|兩次|兩章|下個月就要去美國',
                   '學姊：沒有「重點是」、不數東西、朋友以上叫名字（AA_188 2-6、AA_398、口氣表 1-5）；美國學期是大四上 2028-08～12（b6697e981），「大三上：下個月就要去美國了」對不上'),
    'kexin': (r'假設|這是告知|我輸了',
              '可昕：不說「假設」、不比輸贏（AA_373 6-1，使用者 10-18）；AA_188 拿掉「這是告知」'),
}
hold = {}
for k, (rx, why) in RULES.items():
    bad = [f'{p}：{t}' for p, w, t in all_text(EV[k], k) if re.search(rx, t)]
    if bad:
        hold[k] = {'why': why, 'lines': bad}

out = {'source': '白名單 ' + '＋'.join(f'{os.path.basename(p)}@{APPROVED[p][:8]}' for p in FILES.values()) + SRC525,
       'verify': {'miss': miss, 'freeVisited': extra}, 'hold': hold, 'events': EV}
js = ('/* 校外約會的心願事件（DATE-C4、DATE-C5；AA_127 第 1、2 節、BB_128 第 3 節；date_system/wish/）。產生器：tools/date/import_wish.py（不要手改）。'
      '來源：' + out['source'] + '。hold＝和現行人物設定衝突、先不播的人（衝突的句子在 hold[id].lines，給 AA 改）。接線：src/wish3d.js */\n'
      "'use strict';\nconst DATE_WISH=" + json.dumps(out, ensure_ascii=False) + ';\n')
DST = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, 'src', 'data', 'date_wish.js')   # --out：另存比對用（tests/peishan_dates_1111_unit.js）
open(DST, 'w', encoding='utf-8').write(js)
print('寫入 src/data/date_wish.js：', len(EV), '位；原稿對不到', len(miss), '句（另有「你來過一次」', len(extra), '句：AA_271、BB_213 加的）；hold', ', '.join(f'{k}（{len(v["lines"])} 句）' for k, v in hold.items()) or '無')
for x in miss:
    print('  對不到：', x)
