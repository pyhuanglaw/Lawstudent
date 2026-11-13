#!/usr/bin/env python3
"""女主角自己的故事線（8 拍，所有一起的活動共用；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）。
使用者 11-07 05:1x 對 BB-B：「我要真的玩起來有戀愛遊戲的感覺不要很像在跟機器人說話」「他有他的故事，他有他的煩惱還有他的生活……這些都是要聊天的」。
企劃 AA_712（docs/story_planning/AA_712_heroine_arcs.json，企劃線）→ src/data/heroine_arcs.js（HEROINE_ARCS）。規則：BB_305。播放：src/arcs3d.js。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）；讀稿照 import_guard.read_fix。
- AA 用中文寫的條件（after、until、alt.if）在這裡對到遊戲的條件名（COND）；對不到就停下來，不猜。
- from 寫學期＋週（例 Y1S2W8）或日期；until 寫日期或 COND 的日期名。
- invite 是說明文字（她提議下一次一起做什麼）：先記成 invite 旗標（G.flags.ARC_INVITE），地點照 INVITE-PLACES 慢慢補。
用法：python3 tools/story/import_arcs.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_712_heroine_arcs.json'
OUT = 'src/data/heroine_arcs.js'
REL = ('fam', 'trust', 'comf', 'npcRom', 'rom')
TELL = ('econ', 'retake', 'dad', 'mom', 'sister', 'bday')
WHERE = ('any', 'study', 'eat', 'cafe', 'movie', 'book', 'gym', 'trip')
# AA 寫的中文條件 → 遊戲的條件（src/arcs3d.js S.COND；flag:旗標名＝那個旗標有值）
DKEY = re.compile(r'^[A-Za-z][A-Za-z0-9_]*$')
STANCE = re.compile(r'^(push:[A-Za-z0-9_]+|support|space|tease)$')
OPEN = re.compile(r'^(beat:\d+|place:[a-z0-9_]+|flag:[A-Z0-9_]+)$')
COND = {
    '以安手帳「想去的店」第一家那一場演過（AN_STUDY_SHOP，或 AA_587 第一家）': 'flag:AN_SHOP1_DONE',   # AA_722（AA-B 11-07 09:41）：第一家那一場＝念書第 6 次解鎖的那一格（小路）演完記 AN_SHOP1_DONE，第 7 拍照這個
    '找公園的貓演過（AA_624；旗標照 LAWWW）': 'ytCats',
    "媽媽發現她打工（AA_624 事件 10'，大一下第 9 週）": 'ytMomKnows',
}
ALT_IF = {
    'AN_MSG_MOM_OK（AA_709：她傳過「她說好的時候，都不太像好」）': 'flag:AN_MSG_MOM_OK',
    'KNOWS_SIS_ALISON（礁溪以後，知道她和 Alison 是姊妹）': 'flag:KNOWS_SIS_ALISON',
}
# CANON-NO-ECON-1112 第三批（AA_892 第 1 節最後兩列）：整拍拿掉、n 不重排（決定拍、邀約照 n 對；src/arcs3d.js 照 n 找下一拍）
DROP_BEATS = {'kexin': (4, 5)}
UNTIL = {
    '學姊法研所放榜前（2026 春，日期照 LAWWW 的考試日）': '2026-03-22',   # src/sis_grad3d.js：放榜 3/23（一）
}


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def lines(v, w, need=True):
    if v is None and not need:
        return []
    if isinstance(v, str):
        v = [v]
    if not isinstance(v, list) or (need and not v) or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{w}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def rel(v, w):
    v = v or {}
    bad = [k for k in v if k not in REL]
    if bad:
        raise SystemExit(f'{w}：rel 不認得的欄位 {bad}')
    return {k: int(x) for k, x in v.items()}


def when(v, w):
    if v is None:
        return None
    if v in UNTIL:
        return UNTIL[v]
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}', v) or re.fullmatch(r'Y\d+S[12]W\d+', v):
        return v
    raise SystemExit(f'{w}「{v}」：日期要寫 YYYY-MM-DD 或 Y1S1W8（或加進 UNTIL）')


def build(src, sha):
    people = {}
    for hid, v in src.items():
        if hid.startswith('_'):
            continue
        beats = v.get('beats') if isinstance(v, dict) else None
        if not isinstance(beats, list) or len(beats) != 8:
            raise SystemExit(f'{hid}：要有 8 拍（beats）')
        out = []
        for i, b in enumerate(beats):
            w = f'{hid}[{i + 1}]'
            if int(b.get('n', i + 1)) != i + 1:
                raise SystemExit(f'{w}：n 不是 {i + 1}')
            e = {'n': i + 1, 'need': int(b.get('need', 1)), 'lines': lines(b.get('lines'), w + '.lines'), 'ask': lines(b.get('ask'), w + '.ask')}
            if b.get('topic'):
                e['topic'] = b['topic']
            if b.get('keyNote'):
                e['keyNote'] = IG.read_fix(b['keyNote'])   # 小心選擇那一行字（BB_305 10-5；有 key:true 的選項才用）
            opts = []
            for j, o in enumerate(b.get('opts') or []):
                wo = f'{w}.opts[{j}]'
                if not o.get('t'):
                    raise SystemExit(f'{wo}：沒有 t')
                q = {'t': IG.read_fix(o['t']), 'rel': rel(o.get('rel'), wo), 'reply': lines(o.get('reply'), wo + '.reply', need=False)}
                if o.get('mem'):
                    q['ansId'] = o['mem']   # 存在 BEATS[id].ans（不是人物面板的記憶，不叫 mem）
                if o.get('tell'):
                    if o['tell'] not in TELL:
                        raise SystemExit(f'{wo}.tell「{o["tell"]}」：只能是 {TELL}')
                    q['tell'] = o['tell']
                if o.get('toldAlt'):
                    q['toldAlt'] = IG.read_fix(o['toldAlt']) if isinstance(o['toldAlt'], str) else o['toldAlt']
                # 選項會改變故事（BB_305 第 10 節；src/decide3d.js）：decide 記她的決定、stance 你怎麼說、key 小心選擇、opens／closes 打開或錯過
                if o.get('decide'):
                    d = o['decide']
                    if not isinstance(d, dict) or not DKEY.match(str(d.get('key', ''))) or not isinstance(d.get('value'), str):
                        raise SystemExit(f'{wo}.decide：要 {{key, value}}')
                    q['decide'] = {'key': d['key'], 'value': d['value']}
                if o.get('stance'):
                    if not STANCE.match(o['stance']):
                        raise SystemExit(f'{wo}.stance「{o["stance"]}」：只能是 push:X／support／space／tease')
                    q['stance'] = o['stance']
                if o.get('key'):
                    q['key'] = True
                for k in ('opens', 'closes'):
                    if o.get(k):
                        L = o[k] if isinstance(o[k], list) else [o[k]]
                        for x in L:
                            if not OPEN.match(str(x)):
                                raise SystemExit(f'{wo}.{k}「{x}」：只能是 beat:N、place:地點、flag:旗標')
                        q[k] = L
                opts.append(q)
            if len(opts) < 2:
                raise SystemExit(f'{w}：選項至少 2 個')
            e['opts'] = opts
            for k in ('from', 'until'):
                if b.get(k):
                    e[k] = when(b[k], f'{w}.{k}')
            if b.get('after'):
                if b['after'] not in COND:
                    raise SystemExit(f'{w}.after「{b["after"]}」：COND 沒有對到遊戲的條件')
                e['after'] = COND[b['after']]
            if b.get('where'):
                if b['where'] not in WHERE:
                    raise SystemExit(f'{w}.where「{b["where"]}」：只能是 {WHERE}')
                e['where'] = b['where']
            if b.get('quietOk') is False:
                e['quietOk'] = False
            if b.get('late'):
                if b['late'] != 'skip':
                    raise SystemExit(f'{w}.late：現在只接 skip')
                e['late'] = 'skip'
            if b.get('set'):
                e['set'] = b['set']
            if b.get('invite'):
                e['invite'] = b['invite']
            if b.get('cite_later'):
                e['cite'] = {k: lines(x, f'{w}.cite_later.{k}') for k, x in b['cite_later'].items()}
            if b.get('alt'):
                a = b['alt']
                if a.get('if') not in ALT_IF:
                    raise SystemExit(f'{w}.alt.if「{a.get("if")}」：ALT_IF 沒有對到遊戲的條件')
                A = {'cond': ALT_IF[a['if']]}
                for k in ('lines', 'ask'):
                    if a.get(k):
                        A[k] = lines(a[k], f'{w}.alt.{k}')
                e['alt'] = A
            if e['n'] in DROP_BEATS.get(hid, ()):
                continue
            out.append(e)
        people[hid] = {'theme': v.get('theme', ''), 'beats': out}
    return {'src': f'{PATH}@{sha}', 'people': people}


# 2026-11-11（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫第三份之一）：AA_755_peishan_arc.json 的 classmate_peishan **整段取代** AA_712 匯出來的同名物件。
# 稿是照 heroine_arcs.js 輸出的格式寫的（ansId、cite），不是 AA_712 的輸入格式，所以不走 build()，在這裡疊。**只認 PS755_SHA 那一版。**
# AA 說只換 theme、每一拍的 topic、lines、ask、opts[].reply、cite 的字；祐廷的選項 t、ansId、rel、tell、toldAlt、need、invite、set、from／until／late、cite 的 key 都原樣——
# 這裡逐欄和 AA_712 匯出來的比，「應該原樣」的有一欄不一樣就停下來（不猜）。
PS755_PATH = 'docs/story_planning/AA_755_peishan_arc.json'
PS755_SHA = '9685559c84'   # 2026-11-13 STALE-SOURCES-1112（舊：6b5507f8a）
PS755_TEXT = ('topic', 'lines', 'ask', 'cite')      # 一拍裡可以換字的欄位
PS755_KEEP = ('n', 'need', 'invite', 'set', 'from', 'until', 'late', 'after', 'where', 'quietOk', 'keyNote', 'alt')
PS755_OPT_KEEP = ('t', 'rel', 'ansId', 'tell', 'toldAlt', 'decide', 'stance', 'key', 'opens', 'closes')


def overlay_peishan(data, allow):
    hits = [e for e in allow.get('files', []) if e.get('path') == PS755_PATH and e.get('status') == 'approved']
    if not hits:
        return
    sha = hits[-1]['sha']
    ok, why = IG.allowed(PS755_PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    if not (sha.startswith(PS755_SHA) or PS755_SHA.startswith(sha)):
        raise SystemExit(f'{PS755_PATH}@{sha}：沛珊的稿只認 {PS755_SHA}（要換版本先改這支工具的 PS755_SHA）')
    src = json.loads(IG.read_fix(git('show', f'{sha}:{PS755_PATH}')))
    new, old = src.get('classmate_peishan'), data['people'].get('classmate_peishan')
    if not isinstance(new, dict) or set(new) != {'theme', 'beats'} or not old or len(new['beats']) != 8 or len(old['beats']) != 8:
        raise SystemExit(f'{PS755_PATH}：classmate_peishan 要是 {{theme, beats×8}}')
    bad = []
    for i, (a, o) in enumerate(zip(new['beats'], old['beats'])):
        w = f'classmate_peishan[{i + 1}]'
        extra = set(a) | set(o)
        for k in extra - {'opts'}:
            if k in PS755_TEXT:
                continue
            if k not in PS755_KEEP:
                bad.append(f'{w}.{k}：工具不認得的欄位')
            elif a.get(k) != o.get(k):
                bad.append(f'{w}.{k}：應該原樣，稿 {a.get(k)!r} ≠ 現在 {o.get(k)!r}')
        for k in ('lines', 'ask'):
            lines(a.get(k), f'{w}.{k}')
        if set((a.get('cite') or {})) != set((o.get('cite') or {})):
            bad.append(f'{w}.cite：key 要和現在的一樣（稿 {sorted(a.get("cite") or {})}、現在 {sorted(o.get("cite") or {})}）')
        for k, v in (a.get('cite') or {}).items():
            lines(v, f'{w}.cite.{k}')
        if len(a.get('opts') or []) != len(o['opts']):
            bad.append(f'{w}.opts：數量 {len(a.get("opts") or [])} ≠ {len(o["opts"])}')
            continue
        for j, (x, y) in enumerate(zip(a['opts'], o['opts'])):
            for k in set(x) | set(y):
                if k == 'reply':
                    lines(x.get(k), f'{w}.opts[{j}].reply', need=False)
                elif k not in PS755_OPT_KEEP:
                    bad.append(f'{w}.opts[{j}].{k}：工具不認得的欄位')
                elif x.get(k) != y.get(k):
                    bad.append(f'{w}.opts[{j}].{k}：應該原樣，稿 {x.get(k)!r} ≠ 現在 {y.get(k)!r}')
    if bad:
        raise SystemExit('AA_755 沛珊故事線：「應該原樣」的欄位和現在的不一樣（先問 AA）：\n  ' + '\n  '.join(bad))
    data['people']['classmate_peishan'] = {'theme': new['theme'], 'beats': new['beats']}
    data['overlay'] = f'{PS755_PATH}@{sha}'
    if '--check' not in sys.argv:
        print('沛珊整段照', data['overlay'], '（應該原樣的欄位逐欄比過，沒有變）')


# CANON-NO-ECON-1112 第四批（AA_892 第 1 節，AA-C 定稿；BB_427）：祐廷講自己舊序章那一年的選項（應屆以後都不成立）照列換字，可昕的 theme 換成同校同系那一版。
# 稿是「舊 → 新」對照表，不是 AA_712 的輸入格式，所以在 build()（和沛珊那一層）之後疊；每一列先對「舊」的字，對不到就停下來（不猜）。
# 改過的選項，原本的 tell（祐廷講過舊序章那件事的標記）一起拿掉（BB_427）。舊字用 \u 跳脫寫（D158：這個檔不出現那些字）。
U = lambda t: t.encode('ascii').decode('unicode_escape')
CANON892_PATH = 'docs/story_planning/AA_892_src對照表_arcs_r2y4b_msgpool.md'
CANON892 = [
    # (誰, 第幾拍 n, 欄位, 舊, 新)；欄位：('lines', i)、('ask', i)、('topic',)、('opt', j)＝選項 t、('reply', j, i)、('cite', key, i)
    ('heroine_01', 6, ('lines', 0), U(r'Alison \u8aaa\u4f60\u4ee5\u524d\u5ff5\u7d93\u6fdf\u7cfb\u3002'), 'Alison 說你國中就決定要念法律。'),
    ('heroine_01', 6, ('lines', 1), '我沒有要問你為什麼換。我想問別的。', '我沒有要問你為什麼。我想問別的。'),
    ('heroine_01', 6, ('ask', 0), '換跑道的時候，你怕嗎？', '那麼早就決定，你怕不怕選錯？'),
    ('heroine_01', 6, ('topic',), '換跑道的時候怕不怕', '那麼早決定怕不怕'),
    ('heroine_01', 6, ('opt', 0), '怕。每天都在想是不是錯了。', None),        # 前兩個選項照留（只拿掉 tell）
    ('heroine_01', 6, ('opt', 1), '不怕。做決定的時候，已經想很久了。', None),
    ('heroine_01', 6, ('opt', 2), '怕。可是我更怕一直待在不想待的地方。', '怕。可是我更怕從來沒自己選過。'),
    ('heroine_02', 1, ('opt', 0), U(r'\u6709\u3002\u6211\u8ddf\u6211\u5abd\u8aaa\u6211\u8981\u91cd\u8003\u90a3\u5929\u3002'), '有。高三跟我媽說我只填法律的那天。'),
    ('heroine_02', 1, ('cite', 'PL_TELL_MOM', 0), U(r'\u4f60\u4e0a\u6b21\u8aaa\u4f60\u76f4\u63a5\u8ddf\u4f60\u5abd\u8aaa\u8981\u91cd\u8003\u3002\u2026\u2026\u6211\u4e5f\u60f3\u8a66\u8a66\u770b\u76f4\u63a5\u3002'), '你上次說你直接跟你媽說只填法律。……我也想試試看直接。'),
    ('heroine_03', 4, ('opt', 0), U(r'\u9003\u4e5f\u6c92\u95dc\u4fc2\u3002\u6211\u4f11\u5b78\u90a3\u5929\uff0c\u4e5f\u89ba\u5f97\u81ea\u5df1\u5728\u9003\u3002'), '逃也沒關係。高三有一陣子我每天躲在圖書館，也覺得自己在逃。'),
    ('heroine_03', 8, ('opt', 1), U(r'\u96e2\u958b\u7d93\u6fdf\u7cfb\u3002\u6211\u5230\u73fe\u5728\u9084\u4e0d\u77e5\u9053\u5c0d\u4e0d\u5c0d\uff0c\u53ef\u662f\u4e0d\u5f8c\u6094\u3002'), '只填一個志願。我到現在還不知道對不對，可是不後悔。'),
    ('heroine_04', 5, ('opt', 1), U(r'\u4f11\u5b78\u90a3\u5929\uff0c\u6211\u5728\u6377\u904b\u4e0a\u6253\u7d66\u4e00\u500b\u4eba\uff0c\u8b1b\u4e86\u5f88\u4e45\u3002\u8aaa\u51fa\u53e3\u4ee5\u5f8c\uff0c\u5c31\u6bd4\u8f03\u4e0d\u6015\u4e86\u3002'), '我也有一件事，一直到說出口才敢做。說出口以後，就比較不怕了。'),
    ('heroine_05', 5, ('opt', 1), U(r'\u6211\u5f9e\u5c0f\u5c31\u60f3\u5ff5\u6cd5\u5f8b\u3002\u7b2c\u4e00\u6b21\u5dee\u56db\u5206\u6c92\u8003\u4e0a\uff0c\u91cd\u8003\u90a3\u5e74\u6bcf\u5929\u90fd\u5728\u60f3\uff0c\u6211\u5230\u5e95\u60f3\u7528\u5b83\u505a\u4ec0\u9ebc\u3002'), '我從小就想念法律。可是真的進來以後，我每天都在想，我到底想用它做什麼。'),
    ('classmate_peishan', 2, ('opt', 1), U(r'\u6211\u4e5f\u4e0d\u77e5\u9053\u3002\u4f11\u5b78\u90a3\u6bb5\u6642\u9593\u6211\u60f3\u904e\u4e00\u6a23\u7684\u554f\u984c\uff0c\u5230\u73fe\u5728\u9084\u4e0d\u77e5\u9053\u3002'), '我也不知道。高三的時候我想過一樣的問題，到現在還不知道。'),
    ('classmate_peishan', 5, ('opt', 0), U(r'\u9084\u6c92\u3002\u6211\u5ff5\u7d93\u6fdf\u7cfb\u4e00\u500b\u591a\u6708\u5c31\u4f11\u5b78\u4e86\u3002\u63db\u8dd1\u9053\u4e0d\u662f\u5931\u6557\u3002'), '還沒。可是換跑道不是失敗。妳想換就換。'),
    ('classmate_peishan', 8, ('opt', 0), U(r'\u4e0d\u6703\u3002\u6211\u4f11\u5b78\u7684\u6642\u5019\uff0c\u6700\u6015\u5225\u4eba\u89ba\u5f97\u53ef\u60dc\u3002\u5f8c\u4f86\u767c\u73fe\uff0c\u4e00\u9ede\u90fd\u4e0d\u53ef\u60dc\u3002'), '不會。妳做得好的事，就不可惜。'),
    ('kexin', 3, ('opt', 0), U(r'\u6703\u3002\u91cd\u8003\u90a3\u5e74\u59b3\u5728\u6211\u5bb6\u8ddf\u6211\u5435\u7533\u8ad6\u984c\uff0c\u5435\u8d0f\u7684\u90fd\u662f\u59b3\u3002'), '會。老師追問那次，妳停下來說不確定，回去查完又講一遍——那次全班都在聽。'),
    ('kexin', 3, ('reply', 0, 0), '那時候是你寫錯。', '……你記得那次喔。'),
]
CANON892_THEME = {'kexin': '火爆、聰明、不甜；不爽會講，講完不一定馬上過。首都帝大法律系，和祐廷同班。想做的是讓人聽懂自己的處境，律師或司法官還沒定（`AA_873`）。不出假設題；不放固定口頭禪或道具。'}


# CANON-NO-ECON-1112 第四批四（AA_901 第 5、6 項，AA-C 定稿；BB_434）：以安 beat 6 第三個選項的回覆和 cite、beat 8「改過一次」那個選項換字、拿掉 tell。
# 疊在 CANON892 之後（beat 6 第三個選項的字是 AA_892 換過的那一版）；格式同 CANON892，對不到舊字就停。
CANON901_PATH = 'docs/story_planning/AA_901_第四批二留下的十一件.md'
CANON901 = [
    ('heroine_01', 6, ('reply', 2, 1), '不想待的地方？我好像沒有想過，我有沒有那種地方。', '從來沒自己選過……我好像也是。'),
    ('heroine_01', 6, ('cite', 'PL_SWITCH_STAY', 0), '我想了一個禮拜，你說的「不想待的地方」。……我沒有。我好像真的喜歡這裡。', '我想了一個禮拜，你說的『從來沒自己選過』。……研究所那一組，我想自己選。'),
    ('heroine_01', 8, ('opt', 1), '選錯也可以再改。我就改過一次。', '選錯也可以再改。改的時候比較難，可是改得了。'),
    ('heroine_01', 8, ('reply', 1, 1), '可是你真的改過。所以你說的，我信。', '……可是你說得很確定。我先信你。'),
]


def canon892(data, rows=None, label='AA_892 第 1 節', path=None):
    bad = []
    for hid, n, f, old, new in (CANON892 if rows is None else rows):
        b = next((x for x in data['people'].get(hid, {}).get('beats', []) if x['n'] == n), None)
        if b is None:
            bad.append(f'{hid}[{n}]：沒有這一拍'); continue
        if f[0] in ('lines', 'ask'):
            L = b.get(f[0]) or []
            if len(L) <= f[1] or L[f[1]] != old:
                bad.append(f'{hid}[{n}].{f[0]}[{f[1]}]：舊字對不到'); continue
            L[f[1]] = new
        elif f[0] == 'topic':
            if b.get('topic') != old:
                bad.append(f'{hid}[{n}].topic：舊字對不到'); continue
            b['topic'] = new
        elif f[0] == 'opt':
            o = b['opts'][f[1]] if len(b['opts']) > f[1] else None
            if not o or o['t'] != old:
                bad.append(f'{hid}[{n}].opts[{f[1]}].t：舊字對不到'); continue
            if new is not None:
                o['t'] = new
            o.pop('tell', None)
        elif f[0] == 'reply':
            o = b['opts'][f[1]]
            if len(o.get('reply') or []) <= f[2] or o['reply'][f[2]] != old:
                bad.append(f'{hid}[{n}].opts[{f[1]}].reply[{f[2]}]：舊字對不到'); continue
            o['reply'][f[2]] = new
        elif f[0] == 'cite':
            L = (b.get('cite') or {}).get(f[1]) or []
            if len(L) <= f[2] or L[f[2]] != old:
                bad.append(f'{hid}[{n}].cite.{f[1]}[{f[2]}]：舊字對不到'); continue
            L[f[2]] = new
    if rows is None:
        for hid, t in CANON892_THEME.items():
            if hid in data['people']:
                data['people'][hid]['theme'] = t
    if bad:
        raise SystemExit(label + '（CANON-NO-ECON-1112）：\n  ' + '\n  '.join(bad))
    data['canon'] = CANON892_PATH if path is None else data['canon'] + '、' + path


def main():
    ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else None
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = ref or hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = build(json.loads(git('show', f'{sha}:{PATH}')), sha)
    overlay_peishan(data, allow)
    canon892(data)
    canon892(data, CANON901, 'AA_901 第 5、6 項', CANON901_PATH)
    js = ('/* 自動產生：tools/story/import_arcs.py（' + data['src'] + (('；沛珊整段照 ' + data['overlay']) if data.get('overlay') else '') + (('；照 ' + data['canon'] + ' 換字') if data.get('canon') else '') + '）。不要手改，改企劃 AA_712 再重新匯入。\n'
          '   女主角自己的故事線（8 拍；規則 BB_305；播放 src/arcs3d.js）*/\n'
          "'use strict';\nconst HEROINE_ARCS=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import canon_b5_rows as _B5   # CANON-NO-ECON-1112 第五批：AA_920／921／923 的 src 對照表在寫檔前照整句換（tools/story/canon_b5_rows.py）
    js = _B5.fix(OUT, js)
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: len(v['beats']) for k, v in data['people'].items()})


if __name__ == '__main__':
    main()
