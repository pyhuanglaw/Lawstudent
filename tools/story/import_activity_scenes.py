#!/usr/bin/env python3
"""一起活動第 1～N 次（吃飯、咖啡、電影、書店；STUDY-DATE-PROGRESS-1107；使用者 11-07「每一次念書或者一起活動都要有不同 進展的感覺」）。
企劃 AA_708（docs/story_planning/AA_708_activity_scenes.json，企劃線）→ src/data/activity_scenes.js（ACTIVITY_SCENES）。格式和 AA_707 一樣（每種活動 3～4 場＋輪換）。
播放：src/studyn3d.js（STUDYN.act(kind)）。白名單照 import_guard；讀稿照 read_fix；欄位驗證照 import_study_scenes.py。
用法：python3 tools/story/import_activity_scenes.py [--ref <commit>] [--check]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG
import import_study_scenes as ST

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_708_activity_scenes.json'
OUT = 'src/data/activity_scenes.js'
KINDS = ('eat', 'cafe', 'movie', 'bookstore')
ALT_COND = dict(ST.ALT_COND, **{'學姊已上法研所（2026-08 起）': 'sisGrad', '不在 2:30 AM': 'notCafe', '交往中，或她的告白條件已到': 'datingOrReady'})   # datingOrReady：AA_708 d30416e6b（BB_342），src/studyn3d.js S.ALT
LISTS = ST.LISTS


def person(hid, v, kind):
    P = {'scenes': {}, 'rot': []}
    for k, s in v.items():
        if k.startswith('_'):
            continue
        w = f'{kind}.{hid}.{k}'
        if k == 'rot':
            for i, r in enumerate(s):
                e = {x: ST.lines(r[x], f'{w}[{i}].{x}') for x in LISTS if x in r}
                if not e.get('seat') and not e.get('mid'):
                    raise SystemExit(f'{w}[{i}]：輪換至少要有 seat 或 mid')
                if r.get('if'):
                    e['if'] = r['if']
                ro = (r.get('choice') or {}).get('opts') if r.get('choice') else r.get('opts')   # DLG-FX-MECH-1110：輪換那幾則也可以有選項（choice.opts 或 opts）
                if ro:
                    e['opts'] = ST.opts(ro, f'{w}[{i}].opts')
                P['rot'].append(e)
            continue
        if not k.isdigit():
            raise SystemExit(f'{w}：不認得的場次')
        e = {'need': int(s.get('need', 1))}
        for x in LISTS:
            if x in s:
                e[x] = ST.lines(s[x], f'{w}.{x}')
        if not e.get('seat') or not e.get('mid'):
            raise SystemExit(f'{w}：要有 seat 和 mid')
        if s.get('choice'):
            c = s['choice']
            if c.get('at') != 'mid':
                raise SystemExit(f'{w}.choice.at：只接 mid')
            e['opts'] = ST.opts(c.get('opts') or [], w + '.choice')
        if s.get('set'):
            e['set'] = s['set']
        if s.get('day'):   # e0e92919e（KX-MOVIE-BYE-1107）：那一場 18:00 以前開始＝這幾格換句（可昕講末班車的那幾句只在晚上）
            D = {x: ST.lines(s['day'][x], f'{w}.day.{x}') for x in LISTS if x in s['day']}
            if not D:
                raise SystemExit(f'{w}.day：至少要有一格（{"、".join(LISTS)}）')
            e['day'] = D
        if s.get('alt'):
            a = s['alt']
            if a.get('if') not in ALT_COND:
                raise SystemExit(f'{w}.alt.if「{a.get("if")}」：ALT_COND 沒有對到遊戲的條件')
            A = {'cond': ALT_COND[a['if']]}
            for x in LISTS:
                if x in a:
                    A[x] = ST.lines(a[x], f'{w}.alt.{x}')
            if a.get('opts'):
                A['opts'] = ST.opts(a['opts'], w + '.alt')
            e['alt'] = A
        P['scenes'][k] = e
    n = sorted(int(k) for k in P['scenes'])
    if n != list(range(1, len(n) + 1)) or len(n) < 3:
        raise SystemExit(f'{kind}.{hid}：場次要從 1 連續（{n}）')
    return P


def build(src, sha):
    kinds = {}
    for kind, v in src.items():
        if kind.startswith('_'):
            continue
        if kind not in KINDS:
            raise SystemExit(f'{kind}：不認得的活動（{KINDS}）')
        kinds[kind] = {'people': {hid: person(hid, P, kind) for hid, P in v.items() if not hid.startswith('_')}}
    return {'src': f'{PATH}@{sha}', 'kinds': kinds}


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
    import canon1112_rows as C1112   # CANON-NO-ECON-1112 第四批：AA_894 第 5 節的整句換字疊在稿上（讀稿換名以後、建資料以前）
    data = build(json.loads(C1112.fix(PATH, IG.read_fix(ST.git('show', f'{sha}:{PATH}')))), sha)
    import ps755   # 2026-11-11（X327 沛珊重寫）：AA_755_peishan_feed_misc.json 的 other 逐則 old→new 疊在 classmate_peishan 上（tools/story/ps755.py；白名單沒有那份稿＝不換）
    n755 = ps755.apply(data, 'activity_scenes.js', ROOT, allow)
    js = ('/* 自動產生：tools/story/import_activity_scenes.py（' + data['src'] + (f'；沛珊 {n755} 處照 {ps755.tag(ROOT, allow)}' if n755 else '') + '）。不要手改，改企劃 AA_708 再重新匯入。\n'
          '   一起活動第 1～N 次（吃飯、咖啡、電影、書店；播放 src/studyn3d.js STUDYN.act）*/\n'
          "'use strict';\nconst ACTIVITY_SCENES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    import l118_fix772   # 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版）：AA_772 給這個檔的幾列 old→new 疊在組好的文字上（tools/story/l118_fix772.py；白名單沒有那份稿＝不疊）
    js = l118_fix772.layer_js(OUT, js, ROOT, allow)
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import aa959 as _AA959   # AA_959（DLG-FULL-REVIEW-1110，LAWWW 11-13 選 (a)）：「今天」開頭砍半＋「……」開頭減量，源稿不動、寫檔前最後一步照 docs/handoff/AA_959_overlay.json 換（tools/story/aa959.py）
    js = _AA959.layer(js, 'activity_scenes.js')
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import canon_b5_rows as _B5   # D158-KX-SAMESCHOOL（76f8 rc2，BB_467）：可昕外校／通勤前提的句子，寫檔前照 tools/story/canon_b5_rows.py 整句換
    js = _B5.fix(OUT, js)
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: len(v['people']) for k, v in data['kinds'].items()})


if __name__ == '__main__':
    main()
