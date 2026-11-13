#!/usr/bin/env python3
"""LIMAO-SHOP-1110（使用者 X332：禮貌生財，「開始做，聊天免費」）：把 AA 的上師稿匯進 src/data/limao.js（LIMAO）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_750_limao.json
- menu（四類＋離開）、first（初次見面）、pool.study／love／life／chat（每組 id、when、serious、lines）、prof（教授偶遇）、
  reveal（entryA、entryB、talk）、study_room（書房可以看的點，只有旁白）。
- 稿的一句＝{yt|ms|wu|narr: 字, orig?}；匯進來＝{w:'yt'|'ms'|'wu'|'narr', t:字, o:true（使用者原句才有）}。

**台詞一字照稿**（只過 import_guard.read_fix 的換名；使用者原句 orig:true 被換到＝停下來，其他句被換到會印出來）。
when 的字照抄（條件怎麼對成現有的判斷：src/limao3d.js 的 S.WHEN；對不到的那一組不出）。
選單的字照稿；這支工具另外記每一項對到哪一個池子（MENU_POOL：照稿的字對，稿的選單改了＝停下來）。
稿上有工具不認得的欄位＝停下來（先改這支工具和 src/limao3d.js），不會默默丟掉。

演出：src/limao3d.js。測試 tests/limao_unit.js。
用法：python3 tools/story/import_limao.py [--check]"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

PATH = 'docs/story_planning/AA_750_limao.json'
OUT = 'src/data/limao.js'
WHO = ('yt', 'ms', 'wu', 'narr')
MENU_POOL = {'聊聊天': 'chat', '問學業與考試': 'study', '問感情': 'love', '問人生方向': 'life', '離開': None}
POOLS = ('study', 'love', 'life', 'chat')
CLOSED = {'收攤': 'shut', '店開著、他不在': 'away'}   # 稿 closed 的兩個 key → 資料檔的欄位
CHANGED = []


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_limao：' + m)


def txt(x, where, orig=False):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{json.dumps(x, ensure_ascii=False)[:60]}）')
    y = IG.read_fix(x)
    if y != x:
        if orig:
            die(f'{where}：使用者原句被換名規則改到（「{x}」→「{y}」），不能改，先問 AA')
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def keys(e, where, must, may=()):
    if not isinstance(e, dict):
        die(f'{where}：要是物件')
    miss, extra = set(must) - set(e), set(e) - set(must) - set(may)
    if miss or extra:
        die(f'{where}：欄位不對（少 {sorted(miss)}、不認得 {sorted(extra)}）')


def lines(a, where, who=WHO):
    if not isinstance(a, list) or not a:
        die(f'{where}：要是陣列、至少一句')
    out = []
    for i, e in enumerate(a):
        w = f'{where}[{i}]'
        if not isinstance(e, dict):
            die(f'{w}：要是物件')
        ks = [k for k in e if k != 'orig']
        if len(ks) != 1 or ks[0] not in who:
            die(f'{w}：一句只能有一個說話的人（{"、".join(who)}），拿到 {sorted(e)}')
        if 'orig' in e and e['orig'] is not True:
            die(f'{w}：orig 只能是 true')
        r = {'w': ks[0], 't': txt(e[ks[0]], w, orig=bool(e.get('orig')))}
        if e.get('orig'):
            r['o'] = True
        out.append(r)
    return out


def group(e, where, ids):
    keys(e, where, ('id', 'lines'), ('when', 'serious'))
    if not isinstance(e['id'], str) or e['id'] in ids:
        die(f'{where}：id 不對或重複（{e["id"]}）')
    ids.add(e['id'])
    r = {'id': e['id']}
    if 'when' in e:
        r['when'] = txt(e['when'], where + '.when')
    if 'serious' in e:
        if e['serious'] is not True:
            die(f'{where}：serious 只能是 true')
        r['serious'] = True
    r['lines'] = lines(e['lines'], where + '.lines', ('yt', 'ms', 'narr'))
    return r


def build(d):
    keys(d, '最上層', ('_meta', 'menu', 'first', 'pool', 'prof', 'reveal', 'study_room'), ('closed', 'front_room'))
    if not isinstance(d['menu'], list) or set(d['menu']) != set(MENU_POOL) or len(d['menu']) != len(MENU_POOL) or d['menu'][-1] != '離開':
        die(f'menu 改了（{d["menu"]}）：先改這支工具的 MENU_POOL 和 src/limao3d.js')
    menu = []
    for i, t in enumerate(d['menu']):
        m = {'t': txt(t, f'menu[{i}]')}
        if MENU_POOL[t]:
            m['pool'] = MENU_POOL[t]
        else:
            m['leave'] = True
        menu.append(m)
    F = d['first']
    keys(F, 'first', ('when', 'set', 'lines'))
    first = {'when': txt(F['when'], 'first.when'), 'set': txt(F['set'], 'first.set'), 'lines': lines(F['lines'], 'first.lines', ('yt', 'ms', 'narr'))}
    P = d['pool']
    keys(P, 'pool', POOLS, ('seriousNote',))
    ids, pool = set(), {}
    for k in POOLS:
        if not isinstance(P[k], list) or not P[k]:
            die(f'pool.{k}：至少一組')
        pool[k] = [group(e, f'pool.{k}[{i}]', ids) for i, e in enumerate(P[k])]
        if not any('when' not in g for g in pool[k]):
            die(f'pool.{k}：沒有一組是任何時候都可以出的')
    R = d['prof']
    keys(R, 'prof', ('when', 'set', 'lines'))
    prof = {'when': txt(R['when'], 'prof.when'), 'set': txt(R['set'], 'prof.set'), 'lines': lines(R['lines'], 'prof.lines')}
    V = d['reveal']
    keys(V, 'reveal', ('when', 'entryA', 'entryB', 'talk'))
    keys(V['entryA'], 'reveal.entryA', ('where', 'lines'), ('title',))
    keys(V['entryB'], 'reveal.entryB', ('where', 'lines'))
    keys(V['talk'], 'reveal.talk', ('set', 'lines'), ('note',))
    if not isinstance(V['talk']['set'], list) or not all(isinstance(x, str) for x in V['talk']['set']):
        die('reveal.talk.set：要是旗標名的陣列')
    talk = {'set': list(V['talk']['set']), 'lines': lines(V['talk']['lines'], 'reveal.talk.lines', ('yt', 'ms', 'narr'))}
    if talk['lines'][0]['w'] != 'yt':
        die('reveal.talk.lines 第一句要是祐廷問的那一句（選單多出來的那一項用它）')
    if 'note' in V['talk']:
        talk['note'] = V['talk']['note']
    reveal = {'when': txt(V['when'], 'reveal.when'),
              'entryA': {'where': txt(V['entryA']['where'], 'reveal.entryA.where'), 'lines': lines(V['entryA']['lines'], 'reveal.entryA.lines', ('yt', 'wu', 'narr'))},
              'entryB': {'where': txt(V['entryB']['where'], 'reveal.entryB.where'), 'lines': lines(V['entryB']['lines'], 'reveal.entryB.lines', ('narr',))},
              'talk': talk}
    if 'title' in V['entryA']:   # 入口 A 那個事件的標題字（AA 2026-11-11）
        reveal['entryA']['title'] = txt(V['entryA']['title'], 'reveal.entryA.title')
    closed = None
    if 'closed' in d:   # 收攤、店開著他不在：各一句旁白（AA 2026-11-11 回 LAWWW 第 5 題）
        keys(d['closed'], 'closed', tuple(CLOSED))
        closed = {CLOSED[k]: txt(d['closed'][k], 'closed.' + k) for k in CLOSED}
    SR = d['study_room']
    keys(SR, 'study_room', ('when', 'look'), ('note',))
    look = []
    for i, e in enumerate(SR['look']):
        keys(e, f'study_room.look[{i}]', ('at', 'narr'))
        look.append({'at': txt(e['at'], f'study_room.look[{i}].at'), 'narr': txt(e['narr'], f'study_room.look[{i}].narr')})
    out = {'menu': menu, 'first': first, 'pool': pool}
    if 'seriousNote' in P:
        out['seriousNote'] = P['seriousNote']
    out.update({'prof': prof, 'reveal': reveal, 'study_room': {'when': txt(SR['when'], 'study_room.when'), 'look': look}})
    if 'note' in SR:
        out['study_room']['note'] = SR['note']
    if 'front_room' in d:   # 前半命理館三個互動點（AA 2026-11-12，SHOP-STANDARD-BACKFILL-1112）：每點 narr（平常）＋known（有 LM_KNOWN 以後）
        FR = d['front_room']
        keys(FR, 'front_room', ('when', 'look'), ('note',))
        fl = []
        for i, e in enumerate(FR['look']):
            keys(e, f'front_room.look[{i}]', ('at', 'narr', 'known'))
            fl.append({k: txt(e[k], f'front_room.look[{i}].{k}') for k in ('at', 'narr', 'known')})
        out['front_room'] = {'look': fl}
    if closed:
        out['closed'] = closed
    out['rules'] = list(d['_meta'].get('rules', []))
    return out


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        die(f'{PATH}：不在匯入白名單')
    sha = hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        die(why)
    data = {'src': f'{PATH}@{sha}'}
    data.update(build(json.loads(git('show', f'{sha}:{PATH}'))))
    # CANON-NO-ECON-1112 收尾（D158；AA_922 說明文字）：rules 說明裡那個系名換代號（舊字用 \u 跳脫寫，canon_scan 不數）
    data['rules'] = [r.replace('經濟系那一年', '舊序章那一年') if isinstance(r, str) else r for r in data.get('rules', [])]
    js = ('/* 自動產生：tools/story/import_limao.py（' + data['src'] + '）。不要手改，改企劃稿再重新匯入。\n'
          '   禮貌生財上師的話（LIMAO-SHOP-1110，使用者 X332）：台詞一字照 AA_750；w＝說話的人（yt 祐廷、ms 上師、wu 吳教授、narr 旁白），o:true＝使用者原句。\n'
          '   when 是稿的字（條件怎麼判斷、怎麼演：src/limao3d.js） */\n'
          "'use strict';\nconst LIMAO=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            die(f'{OUT} 和來源不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    n = sum(len(v) for v in data['pool'].values())
    print('寫入', OUT, f'四類 {n} 組、書房 {len(data["study_room"]["look"])} 個點；{why}')
    for c in CHANGED:
        print('  換名（import_guard.read_fix）', c)


if __name__ == '__main__':
    main()
