#!/usr/bin/env python3
"""她打工的時候你走進店裡（SHIFT-TREAT-1110；USER_WANTS X302）。
使用者 11-10：「可攻略對象在打工的時候 要有什麼她打工的時候才會有的劇情吧? 主動招待一個東西 或者很開心你在她打工來」
企劃（AA 定稿 D109，企劃線）：docs/story_planning/AA_739_shift_treat.json
→ src/data/shift_treat.js（SHIFT_TREAT）。播放 src/shifttreat3d.js。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix；有名字說的那一句外面不加「」（TEXT-QUOTE-UNIFY-1108），稿裡有就停下來。
- 台詞一字不改，結構原樣：lines[人物] = {acq:[組…], familiar:[組…], friend:{happy,treat}, dating:{happy,treat}}，一組＝句子陣列。
  who、rules、notCovered、format 原樣帶過去（程式的判斷寫在 shifttreat3d.js，這裡只核對結構）。
- 核對（對不上就停下來，AA 改了稿要重看）：只有 heroine_02、heroine_03；四個階段都在；每組是非空的句子陣列；
  friend.treat 第 3 組（T3：芷若熱可可、語彤收走單子，rules「那次點的東西不扣錢」）照稿的字認得出來。
用法：python3 tools/shift/import_shift_treat.py [--check]"""
import json, os, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

SRC = 'docs/story_planning/AA_739_shift_treat.json'
OUT = 'src/data/shift_treat.js'
PEOPLE = ('heroine_02', 'heroine_03')
T3_WORD = {'heroine_02': '熱可可', 'heroine_03': '端了一壺'}   # rules：「T3 那兩句（芷若熱可可、語彤先端來一壺）例外：那次點的東西不扣錢」（dc607dd90 起；5eff96441 是「單子收走」）


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def src_sha(allow, path):
    hits = [e for e in allow.get('files', []) if e.get('path') == path and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{path}：不在匯入白名單')
    sha = hits[-1]['sha']
    ok, why = IG.allowed(path, sha, allow)
    if not ok:
        raise SystemExit(why)
    return sha, why


def txt(t, where):
    if not isinstance(t, str) or not t.strip():
        raise SystemExit(f'{where}：要是非空字串')
    s = IG.read_fix(t)
    if s.startswith('「') and s.endswith('」'):
        raise SystemExit(f'{where}「{s}」：有名字說的不在外面加「」（TEXT-QUOTE-UNIFY-1108）')
    return s


def groups(v, where):
    if not isinstance(v, list) or not v:
        raise SystemExit(f'{where}：要是非空的組陣列')
    out = []
    for i, g in enumerate(v):
        if not isinstance(g, list) or not g:
            raise SystemExit(f'{where}[{i}]：一組要是非空的句子陣列')
        out.append([txt(t, f'{where}[{i}][{j}]') for j, t in enumerate(g)])
    return out


def fix_all(x, where):
    if isinstance(x, str):
        return IG.read_fix(x)
    if isinstance(x, list):
        return [fix_all(v, f'{where}[{i}]') for i, v in enumerate(x)]
    if isinstance(x, dict):
        return {k: fix_all(v, f'{where}.{k}') for k, v in x.items()}
    return x


def build(d, sha):
    L = d.get('lines') or {}
    if sorted(L) != sorted(PEOPLE):
        raise SystemExit(f'AA_739.lines：人物要是 {PEOPLE}，稿上是 {sorted(L)}')
    lines = {}
    for pid in PEOPLE:
        P = L[pid]
        w = f'AA_739.lines.{pid}'
        for k in ('acq', 'familiar', 'friend', 'dating'):
            if k not in P:
                raise SystemExit(f'{w}：少了 {k}')
        o = {'acq': groups(P['acq'], w + '.acq'), 'familiar': groups(P['familiar'], w + '.familiar')}
        for k in ('friend', 'dating'):
            if sorted(P[k]) != ['happy', 'treat']:
                raise SystemExit(f'{w}.{k}：要有 happy、treat 兩組')
            o[k] = {s: groups(P[k][s], f'{w}.{k}.{s}') for s in ('happy', 'treat')}
        t3 = o['friend']['treat']
        if len(t3) < 3 or not any(T3_WORD[pid] in s for s in t3[2]):
            raise SystemExit(f'{w}.friend.treat[2]：認不出 T3（要有「{T3_WORD[pid]}」），AA 改了稿要重看 shifttreat3d.js 的 FREE')
        lines[pid] = o
    if sorted(d.get('who') or {}) != sorted(PEOPLE):
        raise SystemExit('AA_739.who：人物和 lines 不一樣')
    return {'src': [f'{SRC}@{sha}'], 'id': d.get('id'), 'task': d.get('task'), 'wants': d.get('wants'),
            'who': fix_all(d['who'], 'AA_739.who'), 'notCovered': fix_all(d.get('notCovered', ''), 'AA_739.notCovered'),
            'rules': fix_all(d.get('rules', []), 'AA_739.rules'), 'format': fix_all(d.get('format', ''), 'AA_739.format'),
            'lines': lines}


def main():
    allow = IG.load(ROOT)
    sha, why = src_sha(allow, SRC)
    d = json.loads(git('show', f'{sha}:{SRC}'))
    data = build(d, sha)
    js = ('/* 自動產生：tools/shift/import_shift_treat.py（' + '、'.join(data['src']) + '）。不要手改，改企劃 AA_739 再重新匯入。\n'
          '   她打工的時候你走進店裡（SHIFT-TREAT-1110，X302；播放 src/shifttreat3d.js）：lines[人物]＝acq／familiar／friend{happy,treat}／dating{happy,treat}，一組＝句子陣列 */\n'
          "'use strict';\nconst SHIFT_TREAT=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
          "if(typeof module!=='undefined') module.exports=SHIFT_TREAT;\n")
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import aa959 as _AA959   # AA_959（RC2-PORT-DEV-1114：785 列）：源稿不動、寫檔前照 docs/handoff/AA_959_overlay.json 換；順序 AA959.layer 先、B5.fix 後
    js = _AA959.layer(js, os.path.basename(OUT))
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和白名單上的 AA_739 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why)
    print(' ', {pid: {k: (len(v) if isinstance(v, list) else {s: len(x) for s, x in v.items()}) for k, v in o.items()} for pid, o in data['lines'].items()})


if __name__ == '__main__':
    main()
