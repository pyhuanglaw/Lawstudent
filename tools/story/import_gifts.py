#!/usr/bin/env python3
"""送早餐、飲料（GIFT-FLIRT-1107；使用者 11-07「買飲料 早餐 給別人」「也沒辦法送早餐飲料?」）。
企劃 AA_710（docs/story_planning/AA_710_gifts.json，企劃線）→ src/data/gift_lines.js（GIFT_LINES）。播放 src/gift3d.js。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix。fav.item 要對得到 src/gift3d.js 賣的品項（FAV_ITEMS），對不到就停下來。
用法：python3 tools/story/import_gifts.py [--ref <commit>] [--check]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_710_gifts.json'
OUT = 'src/data/gift_lines.js'
CATS = ('drink', 'breakfast')
FAV_ITEMS = {'熱可可（加一份濃縮）', '美式咖啡（冰的）', '無糖綠茶（去冰）', '青茶（無糖）'}   # src/gift3d.js S.OPTS 做得出來的
REL = ('fam', 'trust', 'comf', 'npcRom', 'rom')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def lines(v, where):
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{where}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def rel(v, where):
    v = v or {}
    bad = [k for k in v if k not in REL]
    if bad:
        raise SystemExit(f'{where}：rel 不認得的欄位 {bad}')
    return {k: int(x) for k, x in v.items()}


def build(src, sha):
    people = {}
    for hid, v in src.items():
        if hid.startswith('_'):
            continue
        P = {}
        for c in CATS:
            if c not in v:
                continue
            s, w = v[c], f'{hid}.{c}'
            yes = sorted(({'need': int(y.get('need', 1)), 'lines': lines(y.get('lines'), f'{w}.yes'), 'rel': rel(y.get('rel'), f'{w}.yes')} for y in s.get('yes') or []), key=lambda y: y['need'])
            if not yes or yes[0]['need'] > 1:
                raise SystemExit(f'{w}.yes：至少要有一格 need 1')
            e = {'yes': yes, 'no': lines(s.get('no'), f'{w}.no')}
            if s.get('fav'):
                f = s['fav']
                if f.get('item') not in FAV_ITEMS:
                    raise SystemExit(f'{w}.fav.item「{f.get("item")}」：遊戲沒有這個品項（FAV_ITEMS），請照新稿改 src/gift3d.js')
                e['fav'] = {'item': f['item'], 'lines': lines(f.get('lines'), f'{w}.fav'), 'rel': rel(f.get('rel'), f'{w}.fav')}
            P[c] = e
        if not P:
            raise SystemExit(f'{hid}：沒有 drink／breakfast')
        people[hid] = P
    return {'src': f'{PATH}@{sha}', 'items': src.get('_items') or [], 'people': people}


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
    js = ('/* 自動產生：tools/story/import_gifts.py（' + data['src'] + '）。不要手改，改企劃 AA_710 再重新匯入。\n'
          '   送早餐、飲料（GIFT-FLIRT-1107；播放 src/gift3d.js）*/\n'
          "'use strict';\nconst GIFT_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: sorted(v) for k, v in data['people'].items()})


if __name__ == '__main__':
    main()
