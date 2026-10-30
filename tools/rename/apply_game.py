#!/usr/bin/env python3
"""遊戲程式的換名（WORLD-RENAME-1030，D115；規則照 docs/WORLD_NAMING.md，換字用 world_names.py 的 spoken／written）。

用法：
  python3 tools/rename/apply_game.py            # 只列：每個檔還有幾個字串要換、哪些法律系館的字串判斷不出口語還是正式
  python3 tools/rename/apply_game.py --apply    # 就地改寫 src/*.js、src/data/*.js 的字串常數
  python3 tools/rename/apply_game.py --list     # 每一處：檔:行、判斷、鍵、原字串 → 新字串

只改字串常數（'…'、"…"、`…`），註解、正規表示式不動；內部 id（看起來像 id 的字串）不會有中文舊名，所以不會碰到。
判斷（只有「霖澤館／萬才館」口語和正式不一樣：A館 vs 法律系館A；其他名字兩種寫法一樣）：
  skip     鍵是 source／license／retired／note／spawn_note／cut／dev、console.warn 的字（開發註記、素材出處，照 WORLD_NAMING 第 9 節 C 類留真名）
  written  （…）開頭、speaker 是 null／系統、鍵是 scene／title／place／label／name／look／memo／goal… 、GM.caption／titleCard／toast／setGoal／addNote
  spoken   speaker 是人物（同一個物件的 speaker／who／from）、鍵是 say／lines／reply／msgs／ask…、GM.say(人物,…)
  其他     tools/rename/game_overrides.json 逐條寫（path＋body＝原字串一字不差 → cls）；法律系館的字串沒寫＝列出來，不改
產生器產生的檔（GEN）不在這裡改：改產生器或它讀的稿，重跑產生器。
"""
import os, re, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import world_names as W  # noqa: E402
from jstok import tokens  # noqa: E402

GEN = {  # 產生器產生的檔（檔頭寫「不要手改」）：改產生器或它讀的稿
    'src/data/date_lines.js', 'src/data/ladder.js', 'src/data/boya_layout.js', 'src/data/room_glb_layouts.js',
    'src/data/invite_replies.js', 'src/data/msg_pool.js', 'src/data/msg2_pool.js', 'src/data/linze_upper_layouts.js',
    'src/data/putong_layout.js', 'src/data/syllabus.js', 'src/data/date_wish.js', 'src/data/date_locations.js',
    'src/data/retake_home.js', 'src/data/msg_kx_y0.js', 'src/data/exam_bank.js', 'src/data/home_lines.js',
    'src/data/pg_dates.js', 'src/data/eat_lines.js', 'src/data/free_trips.js', 'src/data/lane118_shops.js',
    'src/data/gongtong_layout.js', 'src/data/soclib_layout.js', 'src/data/socsci_layout.js', 'src/data/us_layouts.js',
    'src/data/jp_dorm_layouts.js', 'src/data/l118_shop_layouts.js', 'src/data/library_b1_layout.js',
    'src/data/library_upper_layouts.js', 'src/data/lane118_props.js', 'src/data/dorm_room_layout.js',
    'src/data/portrait_manifest.js',
}
SKIP_KEYS = {'source', 'license', 'credit', 'retired', 'note', "'note'", "'spawn_note'", 'cut', 'why_dev', 'dev', 'ref', 'src', "'src'", 'notes'}
SKIP_FUNCS = {'console.warn', 'console.log', 'console.error', 'console.info'}
WRITTEN_KEYS = {'scene', 'title', 'place', 'label', 'caption', 'name', 'away', 'desc', 'loc', 'where', 'travel', 'hint', 'n', 'narr', 'card',
                'memo', 'roomName', 'back', 'goal', 'look', "'look'", "'lookLabel'", "'label'", "'name'", 'sign', 'walkPlace', 'cap', 'whenText',
                'cal', 'board', 'dept', 'school', 'pic', 'shop', 'verb', 'nar', "'where'", 'post', 'photoLook', 'during', 'end', "'habitText'"}
SPOKEN_KEYS = {'say', "'say'", 'lines', "'lines'", 'reply', "'reply'", 'msgs', "'msgs'", 'ask', 'r', 'l', 'line', 'greet', 'yes', 'no', 'dm', 'ans'}
WRITTEN_FUNCS = {'GM.caption', 'GM.titleCard', 'GM.toast', 'GM.setGoal', 'nar', 'narr', 'narrStep', 'GM.addNote', 'x.fillText', 'signPlane'}
SPOKEN_FUNCS = {'GM.say', 'say'}
NARR_SPK = ('null', 'sys', "'narr'", "'system'", "'sys'", '"narr"', "'nar'")

KEY_RX = re.compile(r"""(?:([A-Za-z_$][\w$]*)|'([^'\n]{1,40})'|"([^"\n]{1,40})")\s*:\s*\[?\s*(?:\[\s*)?$""")
CALL_RX = re.compile(r"""([A-Za-z_$][\w$.]*)\s*\(\s*((?:[^()]*?,\s*)*)$""")
SPK_RX = re.compile(r'''(?:\b(?:speaker|who|from)|["'](?:speaker|who|from)["'])\s*:\s*(null|['"]x*['"]|[A-Za-z_$][\w$.]*)''')
TH_RX = re.compile(r'''\bth\s*:\s*['"]x*['"]''')


def mask(src, toks):
    b = list(src)
    for k, s, e in toks:
        if k in ('str', 'tpl'):
            for i in range(s, e):
                if b[i] != '\n': b[i] = 'x'
        elif k in ('comment', 'regex'):
            for i in range(s, e):
                if b[i] != '\n': b[i] = ' '
    return ''.join(b)


def enclosing_obj(m, pos):
    d = 0; i = pos - 1
    while i >= 0:
        c = m[i]
        if c in '}])': d += 1
        elif c in '{[(':
            if d == 0:
                if c == '{': break
            else: d -= 1
        i -= 1
    if i < 0: return None
    s = i; d = 0; j = s
    while j < len(m):
        c = m[j]
        if c in '{[(': d += 1
        elif c in '}])':
            d -= 1
            if d == 0: break
        j += 1
    return s, j


def literals(path, src):
    toks = tokens(src)
    m = mask(src, toks)
    for k, s, e in toks:
        if k not in ('str', 'tpl'): continue
        body = src[s:e]
        if not W.find_old(body): continue
        line = src.count('\n', 0, s) + 1
        off = max(0, s - 300)
        pre = m[off:s - 1]
        km = KEY_RX.search(pre)
        key = ''
        if km:
            if km.group(1): key = km.group(1)
            else:
                g = 2 if km.group(2) else 3
                key = "'" + src[off + km.start(g):off + km.end(g)] + "'"
        cm = CALL_RX.search(pre[-160:])
        func = cm.group(1) if cm and not km else ''
        firstarg = ''
        if func:
            fa = re.match(r'\s*([^,]*)', cm.group(2) or '')
            firstarg = fa.group(1).strip() if fa and cm.group(2) else ''
        spk = ''
        ob = enclosing_obj(m, s)
        if ob and ob[1] - ob[0] > 700: ob = None   # 太大＝函式本體，不是一個物件
        if ob:
            os_, oe = ob
            mm = SPK_RX.search(m[os_:oe + 1])
            if mm:
                spk = mm.group(1)
                if spk[0] in '\'"':
                    st = os_ + mm.start(1); spk = src[st:st + len(mm.group(1))]
            tm = TH_RX.search(m[os_:oe + 1])
            if tm:
                thv = src[os_ + tm.start():os_ + tm.end()]
                if "'sys'" in thv or '"sys"' in thv: spk = spk or 'sys'
        yield dict(path=path, line=line, s=s, e=e, key=key, func=func, firstarg=firstarg, spk=spk,
                   law=bool(re.search('霖澤|萬才', body)), body=body)


def classify(x):
    k, f, sp, b = x['key'], x['func'], x['spk'], x['body']
    if k in SKIP_KEYS or f in SKIP_FUNCS: return 'skip'
    if b.startswith('（') or b.startswith('('): return 'written'
    if k in ('text', "'text'", 't', "'t'"):
        if sp in NARR_SPK: return 'written'
        if sp: return 'spoken'
    if k in WRITTEN_KEYS: return 'written'
    if k in SPOKEN_KEYS: return 'spoken'
    if f in WRITTEN_FUNCS: return 'written'
    if f in SPOKEN_FUNCS: return 'written' if x['firstarg'] == 'null' else 'spoken'
    if sp in NARR_SPK: return 'written'
    if sp: return 'spoken'
    return 'unknown'


def load_overrides():
    p = os.path.join(HERE, 'game_overrides.json')
    if not os.path.exists(p): return {}
    return {(o['path'], o['body']): o['cls'] for o in json.load(open(p, encoding='utf-8'))}


def game_files():
    for d in ('src', 'src/data'):
        for f in sorted(os.listdir(os.path.join(ROOT, d))):
            if f.endswith('.js'):
                p = d + '/' + f
                if p not in GEN: yield p


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ''
    ov = load_overrides()
    total = undecided = changed_files = 0
    for p in game_files():
        src = open(os.path.join(ROOT, p), encoding='utf-8').read()
        edits = []
        for x in literals(p, src):
            c = ov.get((p, x['body'])) or classify(x)
            if c == 'skip': continue
            if c == 'unknown':
                if x['law']:
                    undecided += 1; print(f'未判斷\t{p}:{x["line"]}\t{x["body"][:80]}'); continue
                c = 'written'   # 沒有法律系館：口語、正式換出來一樣
            new = W.spoken(x['body']) if c == 'spoken' else W.written(x['body'])
            if new != x['body']:
                edits.append((x['s'], x['e'], new)); total += 1
                if mode == '--list': print(f'{p}:{x["line"]}\t{c}\t{x["key"] or x["func"]}\t{x["body"][:70]}\t→\t{new[:70]}')
        if edits and mode == '--apply':
            out = src
            for s, e, new in sorted(edits, reverse=True): out = out[:s] + new + out[e:]
            open(os.path.join(ROOT, p), 'w', encoding='utf-8').write(out); changed_files += 1
        elif edits and mode == '':
            print(f'{len(edits):4d}  {p}')
    print(f'要換 {total} 處' + (f'，改了 {changed_files} 個檔' if mode == '--apply' else '') + f'；法律系館判斷不出來 {undecided} 處（寫進 game_overrides.json）', file=sys.stderr)
    sys.exit(1 if undecided else 0)


if __name__ == '__main__':
    main()
