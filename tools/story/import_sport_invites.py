#!/usr/bin/env python3
"""約她去健身房、游泳池（GYM-FIT-1107、INVITE-PLACES-1107；使用者 11-07「不能約運動健身嗎」）。
企劃 AA_715（docs/story_planning/AA_715_sport_gym_pool_invites.json，企劃線）→ src/data/sport_invite_lines.js（SPORT_INVITE_LINES，載入時併進
INVITE_DATA.people[人].acc／firstAt／sport／beforeLearn 和 INVITE_DATA.sport；格式和羽球、晨跑一樣，AA_417）。白名單照 import_guard；讀稿照 read_fix。
用法：python3 tools/story/import_sport_invites.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG
IG.use_canon897()   # CANON-NO-ECON-1112 第四批：讀稿再照 AA_897 第 2 節換整句（tools/story/canon897_fix.json）

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_715_sport_gym_pool_invites.json'
OUT = 'src/data/sport_invite_lines.js'
PLACES = ('gym_fitness', 'gym_pool')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def L(v, w):
    if isinstance(v, str):
        v = [v]
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{w}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def N(v, w):
    """她（他）在對話框有名字說的（people 的 acc、firstAt、sport、beforeLearn.decline：src/invites3d.js 的 S.playLines，（…）開頭的是旁白）：
    拿掉外面那一對「」（AA-B 2026-11-08 00:21／01:09，TEXT-QUOTE-UNIFY-1108；IG.unq，旁白、「A」「B」好幾段的不動）。shared（兩個人一起的旁白）照 L"""
    return [IG.unq(t) for t in L(v, w)]


def sport(v, w):
    d = v.get('during') or []
    during = [N(x, f'{w}.during[{i}]') for i, x in enumerate(d)] if d and isinstance(d[0], list) else ([N(d, w + '.during')] if d else [])
    return {'during': during, 'end': N(v.get('end'), w + '.end') if v.get('end') else []}


def build(src, sha):
    shared = {}
    for pid, v in ((src.get('shared') or {}).get('sport') or {}).items():
        if pid not in PLACES:
            raise SystemExit(f'shared.sport.{pid}：不是 {PLACES}')
        shared[pid] = {'during': L(v.get('during'), f'shared.{pid}.during'), 'end': L(v.get('end'), f'shared.{pid}.end')}
    people = {}
    for hid, p in (src.get('people') or {}).items():
        q = {}
        for k in ('acc', 'firstAt'):
            for pid, v in (p.get(k) or {}).items():
                if pid not in PLACES:
                    raise SystemExit(f'{hid}.{k}.{pid}：不是 {PLACES}')
                q.setdefault(k, {})[pid] = {b: N(x, f'{hid}.{k}.{pid}.{b}') for b, x in v.items()} if isinstance(v, dict) else N(v, f'{hid}.{k}.{pid}')
        for pid, v in (p.get('sport') or {}).items():
            q.setdefault('sport', {})[pid] = sport(v, f'{hid}.sport.{pid}')
        for pid, v in (p.get('beforeLearn') or {}).items():
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', v.get('until') or ''):
                raise SystemExit(f'{hid}.beforeLearn.{pid}.until：要 YYYY-MM-DD')
            q.setdefault('beforeLearn', {})[pid] = {'until': v['until'], 'decline': N(v.get('decline'), f'{hid}.beforeLearn.{pid}.decline')}
        people[hid] = q
    return {'src': f'{PATH}@{sha}', 'shared': shared, 'people': people}


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
    js = ('/* 自動產生：tools/story/import_sport_invites.py（' + data['src'] + '）。不要手改，改企劃 AA_715 再重新匯入。\n'
          '   約她去健身房、游泳池的台詞（GYM-FIT-1107）：載入時併進 INVITE_DATA（要在 src/data/invites.js 後面載入）。\n'
          '   people 裡有名字說的台詞外面不加「」（AA-B 2026-11-08，稿上有；（…）是旁白）；shared 是兩個人一起的旁白*/\n'
          "'use strict';\nconst SPORT_INVITE_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
          "(function(){ if(typeof INVITE_DATA==='undefined') return; const D=INVITE_DATA, P=D.people||(D.people={}), SP=D.sport||(D.sport={});\n"
          "  for(const pid in SPORT_INVITE_LINES.shared) if(!SP[pid]) SP[pid]=SPORT_INVITE_LINES.shared[pid];\n"
          "  for(const id in SPORT_INVITE_LINES.people){ const e=SPORT_INVITE_LINES.people[id], p=P[id]||(P[id]={});\n"
          "    for(const k of ['acc','firstAt','sport','beforeLearn']) if(e[k]) for(const pid in e[k]){ const o=p[k]||(p[k]={}); if(o[pid]==null) o[pid]=e[k][pid]; } } })();\n")
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import canon_b5_rows as _B5   # CANON-NO-ECON-1112 第五批：AA_920／921／923 的 src 對照表在寫檔前照整句換（tools/story/canon_b5_rows.py）
    js = _B5.fix(OUT, js)
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, sorted(data['people']))


if __name__ == '__main__':
    main()
