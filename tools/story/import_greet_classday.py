#!/usr/bin/env python3
"""招呼只在上課日說（BUG-GREET-NOCLASS-1110；使用者 11-10「禮拜天遇到沈以安 他問我今天還有課嗎」）。
企劃 AA_729（docs/story_planning/AA_729_greet_classday.json）→ src/data/greet_classday.js（GREET_CLASSDAY）；播放 src/story3d.js 的 S.ladGreet。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix。
- classDay／playerNoClass／nextClassDay：用 who＋t 逐字對 ladder.js 的 greet（base 或 when），對不到就停下來（AA 改了 ladder，要重看）。
- add：weekend（週六、週日）／offDay（國定假日、寒暑假）的新招呼，和 base 一起抽。
用法：python3 tools/story/import_greet_classday.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_729_greet_classday.json'
OUT = 'src/data/greet_classday.js'
LADDER = 'src/data/ladder.js'
TAGS = ('classDay', 'playerNoClass', 'nextClassDay')
KINDS = ('weekend', 'offDay')
# 2026-11-11（X327 沛珊重寫，AA_753 第三、四份）：她大三、大四招呼 base 的句子換了字（同一格、同一件事），AA_729 上寫的還是舊句——
# 舊句在 ladder.js 對不到、而且下面對到的新句在＝「只在上課日說」的條件跟著新句子走（不然假日也會說「今天上班級經營…」）。AA_729 自己改成新句以後這張表就用不到。
RENAMED = {('classmate_peishan', '今天課好多，我到現在都還沒吃東西。'): '今天課好多，我現在腦袋是滿的，你講慢一點。',
           ('classmate_peishan', '我剛下課。……你真的坐高鐵來喔？'): '我剛下課，你真的坐高鐵來喔？',
           ('classmate_peishan', '今天上班級經營。點名要記得每個人的臉。'): '今天上班級經營，老師說點名要記得每個人的臉，我先拿你練習。',
           ('classmate_peishan', '我剛下課。下午還要去國小。'): '我剛下課，下午還要去國小，可以講十分鐘。',
           ('classmate_peishan', '今天上教育概論。老師叫我們寫一份小教案。'): '今天上教育概論，老師叫我們寫一份小教案，我還沒想到要寫什麼。',
           ('classmate_peishan', '今天上教育心理學，老師點我回答了兩次。'): '今天上教育心理學，老師點我回答了兩次，我第二次是亂講的。'}


def git(*a):
    return subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True, check=True).stdout


def main():
    args = sys.argv[1:]
    ref = args[args.index('--ref') + 1] if '--ref' in args else None
    allow = IG.load(ROOT)
    if not ref:
        hits = [e for e in allow['files'] if e.get('path') == PATH and e.get('status') == 'approved']
        if not hits:
            sys.exit(f'{PATH}：不在匯入白名單')
        ref = hits[-1]['sha']
    full = git('rev-parse', ref).strip()
    ok, why = IG.allowed(PATH, full, allow)
    print(why)
    if not ok:
        sys.exit(1)
    src = json.loads(IG.read_fix(git('show', f'{full}:{PATH}')))
    # ladder.js 的招呼：who → 所有 greet 句子（每學期的 base＋when）
    lad = open(os.path.join(ROOT, LADDER), encoding='utf-8').read()
    L = json.loads(lad[lad.index('{'):lad.rindex('}') + 1])
    have = {}
    def take(who, P):
        g = (P or {}).get('greet') if isinstance(P, dict) else None
        if not isinstance(g, dict):
            return
        have.setdefault(who, set()).update(t for t in (g.get('base') or []) if isinstance(t, str))
        have[who].update(w.get('t') for w in (g.get('when') or []) if isinstance(w, dict) and w.get('t'))
    for who, P in (L.get('characters') or {}).items():   # 大一上（characters）
        take(who, P)
    for term, T in (L.get('byTerm') or {}).items():      # 其他學期（byTerm.<學期>.<人物>）
        for who, P in (T or {}).items():
            take(who, P)
    out = {t: {} for t in TAGS}
    bad = []
    for tag in TAGS:
        for e in src.get(tag, []):
            who, t = e['who'], e['t']
            if t not in have.get(who, set()) and RENAMED.get((who, t)) in have.get(who, set()):
                t = RENAMED[(who, t)]
            if t not in have.get(who, set()):
                bad.append(f'{tag} {who}：「{t}」在 ladder.js 對不到')
            out[tag].setdefault(who, []).append(t)
    add = {}
    for e in src.get('add', []):
        if e.get('kind') not in KINDS:
            bad.append(f'add {e.get("who")}：kind {e.get("kind")} 不是 {KINDS}')
            continue
        add.setdefault(e['who'], []).append({'kind': e['kind'], 't': e['t']})
    if bad:
        print('\n'.join(bad))
        sys.exit(1)
    out['add'] = add
    n = {t: sum(len(v) for v in out[t].values()) for t in TAGS}
    n['add'] = sum(len(v) for v in add.values())
    body = ('/* 自動產生：tools/story/import_greet_classday.py（企劃 ' + PATH + '@' + full[:9] + '，AA-B D109）；不要手改。\n'
            '   招呼只在上課日說（BUG-GREET-NOCLASS-1110）：classDay＝上課日才出、playerNoClass＝上課日而且玩家今天沒課（或上完了）、nextClassDay＝隔天是上課日；\n'
            '   add＝週末（weekend）、放假（offDay）的招呼，和 base 一起抽。播放 src/story3d.js S.ladGreet */\n'
            'const GREET_CLASSDAY=' + json.dumps(dict(source=f'{PATH}@{full[:9]}', **out), ensure_ascii=False) + ';\n')
    dst = os.path.join(ROOT, OUT)
    if '--check' in args:
        cur = open(dst, encoding='utf-8').read() if os.path.exists(dst) else ''
        print('OK' if cur == body else f'{OUT} 和企劃不同（重跑匯入）')
        sys.exit(0 if cur == body else 1)
    open(dst, 'w', encoding='utf-8').write(body)
    print(f'寫了 {OUT}：' + '、'.join(f'{k} {v}' for k, v in n.items()))


if __name__ == '__main__':
    main()
