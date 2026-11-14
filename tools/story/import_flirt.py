#!/usr/bin/env python3
"""說點不一樣的（撩妹選項；GIFT-FLIRT-1107；使用者 11-07「也沒有撩妹對話可以選」）。
企劃 AA_711（docs/story_planning/AA_711_flirt.json，企劃線）→ src/data/flirt_lines.js（FLIRT_LINES）。播放 src/flirt3d.js。
來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）；讀稿照 import_guard.read_fix。
用法：python3 tools/story/import_flirt.py [--ref <commit>] [--check]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_711_flirt.json'
OUT = 'src/data/flirt_lines.js'
REL = ('fam', 'trust', 'comf', 'npcRom', 'rom')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def part(v, w):
    if not isinstance(v, dict) or not isinstance(v.get('lines'), list) or not v['lines']:
        raise SystemExit(f'{w}：要有 lines')
    r = v.get('rel') or {}
    bad = [k for k in r if k not in REL]
    if bad:
        raise SystemExit(f'{w}：rel 不認得的欄位 {bad}')
    return {'lines': [IG.read_fix(t) for t in v['lines']], 'rel': {k: int(x) for k, x in r.items()}}


def build(src, sha):
    people = {}
    for hid, v in src.items():
        if hid.startswith('_'):
            continue
        L = []
        for i, e in enumerate(v):
            w = f'{hid}[{i}]'
            if not e.get('t') or not 1 <= int(e.get('need', 0)) <= 6:
                raise SystemExit(f'{w}：要有 t、need 1～6')
            row = {'need': int(e['need']), 't': IG.read_fix(e['t']), 'ok': part(e.get('ok'), w + '.ok'), 'early': part(e.get('early'), w + '.early')}
            if e['t'].startswith('（CANON-NO-ECON-1112：這一句拿掉'):   # AA 在稿上把那一句換成這個標記（AA_897）：留位置（存檔用索引記「用過了」），不給玩家選
                row['gone'] = True
            L.append(row)
        if not L:
            raise SystemExit(f'{hid}：沒有句子')
        people[hid] = L
    return {'src': f'{PATH}@{sha}', 'people': people}


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
    js = ('/* 自動產生：tools/story/import_flirt.py（' + data['src'] + '）。不要手改，改企劃 AA_711 再重新匯入。\n'
          '   說點不一樣的（GIFT-FLIRT-1107；播放 src/flirt3d.js）*/\n'
          "'use strict';\nconst FLIRT_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    import l118_fix772   # 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版）：AA_772 給這個檔的幾列 old→new 疊在組好的文字上（tools/story/l118_fix772.py；白名單沒有那份稿＝不疊）
    js = l118_fix772.layer_js(OUT, js, ROOT, allow)
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: len(v) for k, v in data['people'].items()})


if __name__ == '__main__':
    main()
