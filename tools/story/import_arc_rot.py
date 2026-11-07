#!/usr/bin/env python3
"""故事線以外的中途：輪換句跟著日期和故事走、她的生活自己往前（BB_305 第 5、6 節；STUDY-DATE-PROGRESS-1107）。
企劃 AA_717（docs/story_planning/AA_717_rot_life.json，企劃線）→ src/data/arc_rot.js（ARC_ROT）。播放：src/arcs3d.js（ARCS.rotPick）。
白名單照 import_guard；讀稿照 read_fix；條件欄位對不上就停下來。
用法：python3 tools/story/import_arc_rot.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_717_rot_life.json'
OUT = 'src/data/arc_rot.js'
WHEN = re.compile(r'^(final|typhoon|cny2w|week1|month:(1[0-2]|[1-9]))$')
IF = re.compile(r'^(dating|ans:[A-Z0-9_]+|flag:[A-Z0-9_]+)$')
DATE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
RENAME = {'巷子裡定食': '小路', '半熟早午餐': 'SUNNY SIDE', '兩點半 Café': '2:30 AM', '巷口茶飲': '帝大紅茶'}   # src/data/places 的 S.RENAME_AA655


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def L(v, w):
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{w}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def build(src, sha):
    rot, life = {}, {}
    for hid, arr in (src.get('rot') or {}).items():
        if hid.startswith('_'):
            continue
        out = []
        for i, r in enumerate(arr):
            w = f'rot.{hid}[{i}]'
            e = {'lines': L(r.get('lines'), w + '.lines')}
            if r.get('when'):
                if not WHEN.match(r['when']):
                    raise SystemExit(f'{w}.when「{r["when"]}」：不認得')
                e['when'] = r['when']
            if r.get('if'):
                c = r['if'] if IF.match(r['if']) else ('flag:' + r['if'] if re.fullmatch(r'[A-Z0-9_]+', r['if']) else None)
                if not c:
                    raise SystemExit(f'{w}.if「{r["if"]}」：不認得')
                e['if'] = c
            for k in ('beat', 'life', 'lifeMax'):
                if r.get(k) is not None:
                    e[k] = int(r[k])
            for k in ('from', 'until'):
                if r.get(k):
                    if not DATE.match(r[k]):
                        raise SystemExit(f'{w}.{k}：要 YYYY-MM-DD')
                    e[k] = r[k]
            if r.get('alt'):
                a = r['alt']
                c = a.get('if', '')
                c = c if IF.match(c) else ('flag:' + c if re.fullmatch(r'[A-Z0-9_]+', c) else None)
                if not c:
                    raise SystemExit(f'{w}.alt.if：不認得')
                e['alt'] = {'if': c, 'lines': L(a.get('lines'), w + '.alt.lines')}
            out.append(e)
        rot[hid] = out
    for hid, arr in (src.get('life') or {}).items():
        if hid.startswith('_'):
            continue
        out = []
        for i, l in enumerate(arr):
            if not DATE.match(l.get('from') or '') or not isinstance(l.get('s'), int):
                raise SystemExit(f'life.{hid}[{i}]：要 s（整數）、from（YYYY-MM-DD）')
            st = l.get('state', '')
            for o, n in RENAME.items():
                st = st.replace(o, n)   # 店名照 AA_655（state 是給程式看的摘要，照樣換）
            out.append({'s': l['s'], 'from': l['from'], 'state': st})
        life[hid] = sorted(out, key=lambda x: x['s'])
    return {'src': f'{PATH}@{sha}', 'rot': rot, 'life': life}


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
    js = ('/* 自動產生：tools/story/import_arc_rot.py（' + data['src'] + '）。不要手改，改企劃 AA_717 再重新匯入。\n'
          '   輪換句跟著日期和故事走、她的生活（BB_305 第 5、6 節；播放 src/arcs3d.js ARCS.rotPick）*/\n'
          "'use strict';\nconst ARC_ROT=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: len(v) for k, v in data['rot'].items()})


if __name__ == '__main__':
    main()
