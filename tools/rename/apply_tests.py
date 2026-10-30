#!/usr/bin/env python3
"""測試檔裡寫死的預期字串跟著遊戲換名（WORLD-RENAME-1030）。只看資料決定，不猜：
  測試的字串 T 有舊名 → 看現在的遊戲（src/、index.html）裡出現的是 spoken(T) 還是 written(T)（整段字串、或字串的一部分）：
    只出現一種＝照那一種換；兩種一樣（沒有法律系館）＝照換；
    T 自己原樣還在遊戲裡、換過的都不在＝遊戲照留的字（開發註記、console.warn、舊存檔比對的鍵）→ 測試也不換；
    都找不到、兩種都有 → 列出來，人看過以後寫進 tools/rename/test_overrides.json（path＋body → spoken／written／skip）。
  正規表示式（/…/）的樣式照同樣的規則換（例：/活大的自助餐/ → /學活的自助餐/）；要故意比對舊字的（舊存檔）寫進 test_overrides.json 照留。
用法：python3 tools/rename/apply_tests.py [--apply] tests/x_unit.js …"""
import os, re, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import world_names as W  # noqa: E402
from jstok import tokens  # noqa: E402


def game_text():
    out = []
    for d in ('src', 'src/data'):
        for f in sorted(os.listdir(os.path.join(ROOT, d))):
            if f.endswith('.js'): out.append(open(os.path.join(ROOT, d, f), encoding='utf-8').read())
    out.append(open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read())
    return '\n'.join(out)


def decide(body, G, ov, path):
    o = ov.get((path, body))
    if o: return o, 'override'
    sp, wr = W.spoken(body), W.written(body)
    if sp == body and wr == body: return 'same', ''
    hs, hw = sp in G, wr in G
    if sp == wr: return ('spoken', 'same') if (hs or body not in G) else ('skip', 'kept-in-game')
    if hs and not hw: return 'spoken', 'game'
    if hw and not hs: return 'written', 'game'
    if not hs and not hw and body in G: return 'skip', 'kept-in-game'
    # 整段找不到（測試自己拼的字、說明文字）：每一個法律系館的舊名，取前後幾個字的片段到遊戲裡找，片段都指向同一種才算
    cls = set()
    for m in re.finditer(r'霖澤館?館?|萬才館?館?', body):
        found = None
        for k in (10, 8, 6, 5, 4, 3, 2):
            a, b = max(0, m.start() - k), min(len(body), m.end() + k)
            win = body[a:b]
            if len(win) < 5: continue
            ws, ww = W.spoken(win), W.written(win)
            fs, fw = ws in G, ww in G
            if fs != fw: found = 'spoken' if fs else 'written'; break
        if not found: return 'unknown', ('both' if hs and hw else 'none')
        cls.add(found)
    if len(cls) == 1: return cls.pop(), 'window'
    return 'unknown', 'mixed'


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    apply = '--apply' in sys.argv
    G = game_text()
    p = os.path.join(HERE, 'test_overrides.json')
    ov = {(o['path'], o['body']): o['cls'] for o in json.load(open(p, encoding='utf-8'))} if os.path.exists(p) else {}
    unk = 0
    for f in args:
        rel = os.path.relpath(os.path.abspath(f), ROOT)
        src = open(os.path.join(ROOT, rel), encoding='utf-8').read()
        edits = []
        for k, s, e in tokens(src):
            if k == 'regex':   # /…/flags：只看樣式那一段
                j = src.rfind('/', s + 1, e)
                if j <= s: continue
                s, e = s + 1, j
            elif k not in ('str', 'tpl'): continue
            body = src[s:e]
            if not W.find_old(body): continue
            c, why = decide(body, G, ov, rel)
            line = src.count('\n', 0, s) + 1
            if c == 'unknown':
                unk += 1; print(f'未判斷({why})\t{rel}:{line}\t{body[:100]}'); continue
            if c in ('skip',):
                print(f'照留({why})\t{rel}:{line}\t{body[:80]}'); continue
            new = W.spoken(body) if c in ('spoken', 'same') else W.written(body)
            if new != body:
                edits.append((s, e, new)); print(f'{c}({why})\t{rel}:{line}\t{body[:70]}\t→\t{new[:70]}')
        if apply and edits:
            out = src
            for s, e, new in sorted(edits, reverse=True): out = out[:s] + new + out[e:]
            open(os.path.join(ROOT, rel), 'w', encoding='utf-8').write(out)
    print(f'未判斷 {unk}', file=sys.stderr)


if __name__ == '__main__':
    main()
