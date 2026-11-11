#!/usr/bin/env python3
"""她請客的格（AA_782；DLG-FULL-REVIEW-1110，使用者 X324）→ src/data/she_pays.js（SHE_PAYS_DATA）。src/date3d.js 載入時合進 S.SHE_PAYS：
她在那個互動點說了那一句的那一次，祐廷那一份（S.pointCost）不扣（做法見 date3d.js S.SHE_PAYS 的註解；以安三格是 AA_780 _meta.she_pays，在 date3d.js 手寫）。
稿 docs/story_planning/AA_782_she_pays.json：{_meta, she_pays:[{who, loc, n, key, text}]}——AA 寫「字都不改」、格號＝date_rewrite.py list 的編號、字照遊戲現在的。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 每一列都要對得到遊戲現在的 src/data/date_lines.js（不猜，對不到就停）：
  key＝<互動點 id>.<first|firstHigh|remember|normal|dating|afterBreakup>[#第幾套]，互動點 id 的前三個字＝loc；
  那一套的 lines 裡她（who）說的、和 text 一字不差的剛好一句；text 在她這個互動點底下（所有套、選項、回話）也只有這一處（不然別套也會不扣）；
  格號 n（她在這個地點的第 n 格，date_rewrite.py list 的順序：到達、收尾各 first／normal／dating，互動點 first／normal／remember／dating 再來是其他，最後是不喜歡那一句）就是這一句。
- 同一個人同一套（key）只能一列（同一個互動點可以好幾套，例：學姊 D22.fish 的 first 和 remember）；以安的三格在 date3d.js（AA_780），這裡不能再列以安。
用法：python3 tools/date/import_she_pays.py [--check] [--out 檔名]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'story'))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_782_she_pays.json'
OUT = 'src/data/she_pays.js'
LINES = 'src/data/date_lines.js'
KINDS = ('first', 'firstHigh', 'remember', 'normal', 'dating', 'afterBreakup')
HAND = {'heroine_01'}   # date3d.js 手寫的（AA_780 _meta.she_pays）


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def date_lines():
    t = open(os.path.join(ROOT, LINES), encoding='utf-8').read()
    i = t.index('const DATE_LINES=') + len('const DATE_LINES=')
    return json.loads(t[i:t.rindex(';')])


def leaves(x, p=''):
    if isinstance(x, list):
        for i, v in enumerate(x):
            yield from leaves(v, f'{p}/{i}')
    elif isinstance(x, dict):
        for k, v in x.items():
            yield from leaves(v, f'{p}/{k}')
    else:
        yield p, x


def slots(d, who):
    """同 tests/an_dates_1111_unit.js 的 slots()：她在這個地點的每一格（date_rewrite.py list 的順序）"""
    out, L, K4 = [], d['lines'][who], ('first', 'normal', 'remember', 'dating')

    def block(b):
        if isinstance(b, list):
            for x in b:
                block(x)
        elif isinstance(b, dict) and 'lines' in b:
            for x in b['lines']:
                out.append(x.get('text'))
            for c in b.get('choice') or []:
                out.append(c.get('t'))
                for r in c.get('reply') or []:
                    out.append(r.get('text'))
    for part in ('arrive', 'closing'):
        for kind in ('first', 'normal', 'dating'):
            if L.get(part) and kind in L[part]:
                block(L[part][kind])
    for hs, X in (L.get('hotspots') or {}).items():
        for kind in K4:
            if kind in X:
                block(X[kind])
        for k in X:
            if k not in K4:
                block(X[k])
    for hs, v in ((d.get('dislikeLine') or {}).get(who) or {}).items():
        out.append(v)
    return out


def build(src, sha, DL):
    if set(src) - {'_meta', 'she_pays'} or not isinstance(src.get('she_pays'), list) or not src['she_pays']:
        raise SystemExit(f'{PATH}@{sha}：最上層只認 _meta、she_pays（she_pays 要是有東西的陣列）')
    pays, cells, seen = {}, [], set()
    for i, r in enumerate(src['she_pays']):
        w = f'{PATH}@{sha} she_pays[{i}]'
        if not isinstance(r, dict) or set(r) - {'who', 'loc', 'n', 'key', 'text', 'note'}:
            raise SystemExit(f'{w}：只認 who、loc、n、key、text（note）')
        who, loc, n, key, text = r.get('who'), r.get('loc'), r.get('n'), r.get('key'), r.get('text')
        if not all(isinstance(x, str) and x for x in (who, loc, key, text)) or type(n) is not int or n < 1:
            raise SystemExit(f'{w}：who、loc、key、text 要是字串，n 要是正整數')
        m = re.fullmatch(r'((D\d\d)\.\w+)\.(\w+)(?:#(\d+))?', key)
        if not m or m.group(2) != loc or m.group(3) not in KINDS:
            raise SystemExit(f'{w}：key「{key}」要寫 <互動點 id>.<{"／".join(KINDS)}>[#第幾套]，互動點 id 開頭＝loc {loc}')
        pid, kind, k = m.group(1), m.group(3), m.group(4)
        if who in HAND:
            raise SystemExit(f'{w}：{who} 的請客格在 src/date3d.js 手寫（AA_780），這裡不列')
        if (who, key) in seen:
            raise SystemExit(f'{w}：{who} {key} 已經有一列（同一套只能一列）')
        seen.add((who, key))
        D = (DL.get('loc') or {}).get(loc) or {}
        H = ((((D.get('lines') or {}).get(who) or {}).get('hotspots')) or {}).get(pid)
        if not isinstance(H, dict):
            raise SystemExit(f'{w}：date_lines.js 的 {loc} 沒有 {who} 的互動點 {pid}')
        S = H.get(kind)
        if k is not None:
            if not isinstance(S, list) or int(k) >= len(S):
                raise SystemExit(f'{w}：{pid} 的 {kind} 沒有第 {k} 套')
            S = S[int(k)]
        elif isinstance(S, list):
            raise SystemExit(f'{w}：{pid} 的 {kind} 有好幾套，key 要寫 #第幾套')
        if not isinstance(S, dict) or not isinstance(S.get('lines'), list):
            raise SystemExit(f'{w}：{pid} 沒有 {kind}{"" if k is None else "#" + k} 那一套')
        mine = [x for x in S['lines'] if isinstance(x, dict) and x.get('who') == who and x.get('text') == text]
        if len(mine) != 1:
            raise SystemExit(f'{w}：「{text}」在 {who} {key} 那一套她說的台詞裡有 {len(mine)} 句（要剛好一句；字照遊戲現在的）')
        at = [p for p, v in leaves(H) if v == text]
        if len(at) != 1:
            raise SystemExit(f'{w}：「{text}」在 {who} {pid} 底下有 {len(at)} 處（{at}；要剛好一處，不然別套也會不扣）')
        sl = slots(D, who)
        if n > len(sl) or sl[n - 1] != text:
            raise SystemExit(f'{w}：格號 {n} 在 date_lines.js {loc} {who} 是「{sl[n - 1] if n <= len(sl) else "（沒有這一格）"}」，不是「{text}」')
        pays.setdefault(who, {}).setdefault(pid, []).append(text)
        cells.append({'who': who, 'loc': loc, 'n': n, 'key': key, 'pid': pid, 'text': text, 'at': f'/loc/{loc}/lines/{who}/hotspots/{pid}{at[0]}'})
    return {'src': f'{PATH}@{sha}', 'pays': pays, 'cells': cells}


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if len(hits) != 1:
        raise SystemExit(f'{PATH}：白名單要剛好一筆 approved（現在 {len(hits)}）')
    sha = hits[0]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = build(json.loads(git('show', f'{sha}:{PATH}')), sha, date_lines())
    js = ('/* 自動產生：tools/date/import_she_pays.py（' + data['src'] + '）。不要手改，改企劃 AA_782 再重新匯入。\n'
          '   她請客的格：pays＝{她:{互動點 id:[那一句]}}，src/date3d.js 載入時合進 S.SHE_PAYS（她在那個互動點說了那一句的那一次，祐廷那一份不扣）；\n'
          '   cells＝稿的每一列（格號 n＝date_rewrite.py list 的編號、key＝哪一套、at＝date_lines.js 裡的位置）。以安三格在 date3d.js 手寫（AA_780）。測試 tests/date_she_pays_1111_unit.js */\n'
          "'use strict';\nconst SHE_PAYS_DATA=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(out, encoding='utf-8').read() if os.path.exists(out) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(out, 'w', encoding='utf-8').write(js)
    print('寫入', os.path.relpath(out, ROOT), why, {k: len(v) for k, v in data['pays'].items()})


if __name__ == '__main__':
    main()
