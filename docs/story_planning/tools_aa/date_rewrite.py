#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""校外約會台詞整批改稿的工具（AA，2026-11-11；DLG-FULL-REVIEW-1110／PEISHAN-VOICE-1110）

源稿是 docs/story_planning/date_system/lines/Dxx.json（遊戲的 src/data/date_lines.js 由 tools/date/import_date_lines.py 從白名單上的這些檔產生）。
這個工具只換「某一個人在某一個地點」的字，**格子的數量、tier、選項數都不動**：

  列出（給改稿的人看，編號就是順序）：
    python3 docs/story_planning/tools_aa/date_rewrite.py list <人物id> D01 [D02 ...]
  套用（改稿檔是 JSON：{"who": 人物id, "D01": ["第 1 格的新字", "第 2 格…", …], "D02": […]}；null＝這一格不改）：
    python3 docs/story_planning/tools_aa/date_rewrite.py apply <改稿檔.json>
  和遊戲現在的字對齊（源稿之後還疊了好幾層改稿，遊戲裡的字可能比源稿新；改一個人之前先跑一次，之後那幾層對這個人就不用再套）：
    python3 docs/story_planning/tools_aa/date_rewrite.py syncgame <開發分支的 src/data/date_lines.js> <人物id> D01 [D02 ...]   （加 --dry 只列不寫）
  數量對不上就停，不寫檔。套用以後 Dxx.py（更早的產生器，已經比 json 舊）不會跟著變——以 json 為準。
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
LINES = os.path.join(HERE, '..', 'date_system', 'lines')


def slots(d, who):
    """照固定順序回傳 [(標籤, 容器, key)]：容器[key] 是那一格的字串"""
    out = []
    L = d['lines'][who]
    def block(tag, b):
        if isinstance(b, dict) and 'lines' in b:
            for i, x in enumerate(b['lines']): out.append((f'{tag}[{b.get("tier","")}].{i}', x, 'text'))
            for j, c in enumerate(b.get('choice', [])):
                out.append((f'{tag}.選項{j+1}', c, 't'))
                for k, r in enumerate(c.get('reply', [])): out.append((f'{tag}.選項{j+1}.回{k}', r, 'text'))
        elif isinstance(b, list):
            for i, x in enumerate(b): block(f'{tag}#{i}', x)
    for part in ('arrive', 'closing'):
        for kind in ('first', 'normal', 'dating'):
            if kind in L.get(part, {}): block(f'{part}.{kind}', L[part][kind])
    for hs, H in L.get('hotspots', {}).items():
        for kind in ('first', 'normal', 'remember', 'dating'):
            if kind in H: block(f'{hs}.{kind}', H[kind])
        for k in H:
            if k not in ('first', 'normal', 'remember', 'dating'): block(f'{hs}.{k}', H[k])
    for hs in list(d.get('dislikeLine', {}).get(who, {})):
        out.append((f'dislikeLine.{hs}', d['dislikeLine'][who], hs))
    return out


def main():
    a = sys.argv[1:]
    if a and a[0] == 'list':
        who = a[1]
        for loc in a[2:]:
            d = json.load(open(os.path.join(LINES, loc + '.json'), encoding='utf8'))
            S = slots(d, who)
            print(f'=== {loc}（{d.get("loc","")}）{who}：{len(S)} 格；景點 ' + '、'.join(f'{k}={v}' for k, v in d['points'].items()))
            for i, (tag, c, k) in enumerate(S, 1): print(f'{i:3d} {tag}｜{c[k]}')
    elif a and a[0] == 'apply':
        spec = json.load(open(a[1], encoding='utf8')); who = spec['who']; todo = []
        for loc, new in spec.items():
            if not loc.startswith('D'): continue
            p = os.path.join(LINES, loc + '.json'); d = json.load(open(p, encoding='utf8')); S = slots(d, who)
            if len(S) != len(new): sys.exit(f'{loc}：源稿 {len(S)} 格、改稿 {len(new)} 格，數量對不上，沒有寫檔')
            n = 0
            for (tag, c, k), t in zip(S, new):
                if t is not None and t != c[k]: c[k] = t; n += 1
            todo.append((p, d, loc, n, len(S)))
        for p, d, loc, n, m in todo:
            json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=1); print(f'{loc}：換了 {n}／{m} 格')
    elif a and a[0] == 'syncgame':
        dry = '--dry' in a; a = [x for x in a if x != '--dry']
        raw = open(a[1], encoding='utf8').read(); G = json.JSONDecoder().raw_decode(raw[raw.index('{'):])[0]['loc']; who = a[2]; tot = 0
        for loc in a[3:]:
            p = os.path.join(LINES, loc + '.json'); d = json.load(open(p, encoding='utf8'))
            if who not in d['lines'] or who not in G.get(loc, {}).get('lines', {}): print(f'{loc}：沒有這個人，跳過'); continue
            S = slots(d, who); T = slots(G[loc], who)
            if len(S) != len(T) or [x[0] for x in S] != [x[0] for x in T]: print(f'{loc}：源稿 {len(S)} 格、遊戲 {len(T)} 格，格子對不上，這個地點沒有動'); continue
            n = 0
            for (tag, c, k), (_, gc, gk) in zip(S, T):
                if c[k] != gc[gk]:
                    n += 1
                    if dry: print(f'  {loc} {tag}｜{c[k]} → {gc[gk]}')
                    else: c[k] = gc[gk]
            tot += n
            if not dry: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
            print(f'{loc}：和遊戲不同 {n}／{len(S)} 格' + ('' if dry else '，已對齊'))
        print(f'合計 {tot} 格')
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
