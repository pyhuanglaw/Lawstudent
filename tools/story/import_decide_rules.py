#!/usr/bin/env python3
"""決定拍的規則：她有自己的想法（AA_719；BB_305 第 10-5、10-6 節；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）。
企劃 AA_719（docs/story_planning/AA_719_decide_rules.json，企劃線）→ src/data/decide_rules.js（DECIDE_RULES）。播放：src/decide3d.js。
- 每個 key 要對到 AA_712 現有的那一拍（src/data/heroine_arcs.js），opts 的 i 要在那一拍的選項範圍內；對不上就停下來。
- 稿裡用中文寫的特殊條件（if／ruleIf）在這裡寫成遊戲的條件（SPECIAL）；不認得的 if／ruleIf 就停下來，不猜。
白名單照 import_guard；讀稿照 read_fix。用法：python3 tools/story/import_decide_rules.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_719_decide_rules.json'
OUT = 'src/data/decide_rules.js'
STANCE = re.compile(r'^(push:[A-Za-z0-9_]+|support|space|tease)$')
STYLES = {'contrary', 'reassure', 'think', 'own'}
# 稿裡的中文條件 → 遊戲（AA_719 3788d00c1）
SPECIAL = {
    'YT-1': {'if': {'before': 'Y1S2W9'}},   # 只在大一下第 9 週（媽媽發現）以前演到第 4 拍才算；已經過了＝default（found）
    'PS-2': {'ruleIf': {0: 'dec:classmate_peishan.future=seen'}},   # 第一條還要 future=seen；hide＋support＋hi 照下面的條（沒有符合＝default after）
    'SIS-2': {'if': None},   # 只影響那一拍說「我妹」或 Alison（AA_712 alt），規則照常
}


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def arcs():
    s = open(os.path.join(ROOT, 'src/data/heroine_arcs.js'), encoding='utf-8').read()
    return json.loads(s[s.index('=') + 1:s.rindex(';')])['people']


def build(src, sha):
    A = arcs()
    out = []
    for v in src['keys']:
        w = f'AA_719 {v.get("id")}'
        who, n = v['who'], int(v['beat'])
        if who not in A or not (1 <= n <= len(A[who]['beats'])):
            raise SystemExit(f'{w}：AA_712 沒有 {who} 第 {n} 拍')
        nopt = len(A[who]['beats'][n - 1]['opts'])
        if v.get('style') not in STYLES:
            raise SystemExit(f'{w}.style「{v.get("style")}」：不認得')
        vals = set((v.get('values') or {}).keys())
        if v.get('default') not in vals or v.get('lean') not in vals:
            raise SystemExit(f'{w}：default／lean 要是 values 裡的值')
        opts = []
        for o in v['opts']:
            if not (0 <= int(o['i']) < nopt) or not STANCE.match(o.get('stance', '')):
                raise SystemExit(f'{w}.opts：i 要在 0～{nopt - 1}、stance 要是 push:X／support／space／tease')
            opts.append({'i': int(o['i']), 'stance': o['stance']})
        if len({o['i'] for o in opts}) != nopt:
            raise SystemExit(f'{w}.opts：要每一個選項都有 stance（那一拍有 {nopt} 個）')
        sp = SPECIAL.get(v['id'], {})
        if v.get('if') and 'if' not in sp:
            raise SystemExit(f'{w}.if「{v["if"]}」：SPECIAL 沒有寫成遊戲的條件')
        if v.get('ruleIf') and 'ruleIf' not in sp:
            raise SystemExit(f'{w}.ruleIf「{v["ruleIf"]}」：SPECIAL 沒有寫成遊戲的條件')
        rules = []
        for j, r in enumerate(v['rules']):
            if not STANCE.match(r.get('stance', '')) or r.get('trust') not in ('hi', 'lo', 'any') or r.get('result') not in vals:
                raise SystemExit(f'{w}.rules[{j}]：stance／trust（hi|lo|any）／result（values 裡的值）')
            e = {'stance': r['stance'], 'trust': r['trust'], 'result': r['result'], 'rel': r.get('rel') or {}, 'delay': int(r.get('delay') or 0)}
            if r.get('opt') is not None:
                e['opt'] = int(r['opt'])
            if r.get('say'):
                e['say'] = [IG.read_fix(t) for t in r['say']]
            c = (sp.get('ruleIf') or {}).get(j)
            if c:
                e['if'] = c
            rules.append(e)
        e = {'id': v['id'], 'who': who, 'beat': n, 'key': v['key'], 'style': v['style'], 'lean': v['lean'], 'default': v['default'],
             'keyTrue': bool(v.get('key_true')), 'opts': opts, 'rules': rules, 'values': v['values'],
             'opens': v.get('opens') or {}, 'closes': v.get('closes') or {}}
        if v.get('keyNote'):
            e['keyNote'] = IG.read_fix(v['keyNote'])
        if (sp.get('if') or {}).get('before'):
            e['before'] = sp['if']['before']
        out.append(e)
    return {'src': f'{PATH}@{sha}', 'keys': out}


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
    js = ('/* 自動產生：tools/story/import_decide_rules.py（' + data['src'] + '）。不要手改，改企劃 AA_719 再重新匯入。\n'
          '   決定拍的規則：她有自己的想法（播放 src/decide3d.js）*/\n'
          "'use strict';\nconst DECIDE_RULES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, [e['id'] for e in data['keys']])


if __name__ == '__main__':
    main()
