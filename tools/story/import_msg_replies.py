#!/usr/bin/env python3
"""女主角主動傳來的訊息：回覆選項（MSG-REPLY-1107；使用者 11-07「至少他們傳給我 可以給我選項回覆 依照選項增加或降低好感」「芯慈 我又不能回 他問我 我睡了嗎」）。
企劃 AA_709（docs/story_planning/AA_709_msg_replies.json，企劃線）→ src/data/msg_replies.js（MSG_REPLIES）。播放 src/msgreply3d.js。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- text 是遊戲裡那一則訊息的原句：一定要在 src/ 裡找得到（逐字），找不到就停下來（遊戲靠這一句對到訊息）。
用法：python3 tools/story/import_msg_replies.py [--ref <commit>] [--check]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_709_msg_replies.json'
OUT = 'src/data/msg_replies.js'
REL = ('fam', 'trust', 'comf', 'npcRom', 'rom')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def in_src(t):
    r = subprocess.run(['git', '-C', ROOT, 'grep', '-l', '-F', t, '--', 'src/', ':!' + OUT], capture_output=True, text=True)
    return bool(r.stdout.strip())


def rel(v, w):
    v = v or {}
    bad = [k for k in v if k not in REL]
    if bad:
        raise SystemExit(f'{w}：rel 不認得的欄位 {bad}')
    return {k: int(x) for k, x in v.items()}


def build(src, sha):
    people = {}
    for hid, v in src.items():
        if hid.startswith('_'):
            continue
        L = []
        for i, e in enumerate(v):
            w = f'{hid}[{i}]'
            t = e.get('text')
            if not t or not in_src(t):
                raise SystemExit(f'{w}.text「{t}」：src/ 裡找不到這一則訊息（要逐字）')
            opts = []
            for j, o in enumerate(e.get('opts') or []):
                if not o.get('t'):
                    raise SystemExit(f'{w}.opts[{j}]：沒有 t')
                say = [IG.read_fix(x) for x in (o.get('say') or [])]
                opts.append({'t': IG.read_fix(o['t']), 'rel': rel(o.get('rel'), f'{w}.opts[{j}]'), 'say': say})
            if not 2 <= len(opts) <= 4:
                raise SystemExit(f'{w}：選項要 2～4 個（{len(opts)}）')
            sk = e.get('skip') or {}
            if sk.get('say') or sk.get('rel'):
                raise SystemExit(f'{w}.skip：沒回的結果還沒做（AA 說分享生活的不扣分）；有內容的話先改 src/msgreply3d.js')
            L.append({'text': t, 'opts': opts})
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
    js = ('/* 自動產生：tools/story/import_msg_replies.py（' + data['src'] + '）。不要手改，改企劃 AA_709 再重新匯入。\n'
          '   女主角主動傳來的訊息的回覆選項（MSG-REPLY-1107；播放 src/msgreply3d.js）*/\n'
          "'use strict';\nconst MSG_REPLIES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
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
