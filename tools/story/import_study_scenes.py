#!/usr/bin/env python3
"""一起念書第 1～6 次＋輪換（STUDY-DATE-PROGRESS-1107；使用者 11-07「每一次念書或者一起活動都要有不同 進展的感覺 會觸發劇情」）。
企劃 AA_707（docs/story_planning/AA_707_study_scenes.json，企劃線）→ src/data/study_scenes.js（STUDY_SCENES）。規則：AA_706 第 1 節。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix（WORLD_NAMING 換名、Alison…）。
- alt.if 是 AA 寫的中文條件，這裡對到遊戲裡的條件名（ALT_COND；src/studyn3d.js 的 S.ALT）；沒對到就停下來，不猜。
- alt.replyKeep 是說明文字：這裡照原句對到哪一個選項換哪幾句（REPLY_KEEP）；AA 改了字就停下來。
- unlock 是說明文字：這裡對到地點的 key（UNLOCK；地點接在 INVITE-PLACES-1107）。
用法：python3 tools/story/import_study_scenes.py [--ref <commit>] [--check]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG
IG.use_canon897()   # CANON-NO-ECON-1112 第四批：讀稿再照 AA_897 第 2 節換整句（tools/story/canon897_fix.json）

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_707_study_scenes.json'
OUT = 'src/data/study_scenes.js'
ALT_COND = {
    "媽媽發現她打工以後（AA_624 事件 10'，大一下第 9 週）": 'ytMomKnows',
    '學姊已上法研所（2026-08 起）': 'sisGrad',
    '期末飯已經看過手帳那一頁（CG-11）': 'anShopPage',   # AA_707 1b8e247ec：記憶 AN_SHOP_PAGE（src/studyn3d.js S.ALT）
}
REPLY_KEEP = {
    ('heroine_03', '5'): ('兩個選項的字照用；選「我不會說。」的那一支改成：「她已經知道了。……可是謝謝你這樣說。」',
                          {'我不會說。': ['她已經知道了。……可是謝謝你這樣說。']}),
}
UNLOCK = {
    ('heroine_01', '6'): 'an_shop1',     # 以安手帳「想去的店」第一家（AA_587）
    ('heroine_02', '6'): 'xs_nanyang',   # 南洋戲院早場電影
    ('heroine_03', '6'): 'yt_tea',       # 一盞，週末 17:00 下班以後
    ('heroine_04', '6'): 'gg_luwei',     # 公館滷味（新地點）
    ('classmate_peishan', '6'): 'tutor', # 溫州街課輔班（週三 18:30～21:00，AA_614）
    ('kexin', '6'): 'mzu_lib',           # 木柵大學圖書館
}
LISTS = ('seat', 'mid', 'pack', 'bye')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def lines(v, where):
    if not isinstance(v, list) or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{where}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def opts(v, where):
    out = []
    for i, o in enumerate(v):
        w = f'{where}.opts[{i}]'
        # DLG-FX-MECH-1110：選項 {t, rel?, fx?, reply|re}——rel（原本的格式）和 fx（{fr, love}，整數、可以是 0 或負的）至少要有一個；re＝reply 的另一個寫法（一句或陣列），可以不寫
        if not o.get('t') or not (isinstance(o.get('rel'), dict) or isinstance(o.get('fx'), dict)):
            raise SystemExit(f'{w}：要有 t，以及 rel 或 fx')
        bad = [k for k in o if k not in ('t', 'rel', 'fx', 'reply', 're')]
        if bad:
            raise SystemExit(f'{w}：不認得的欄位 {bad}')
        bad = [k for k in (o.get('rel') or {}) if k not in ('fam', 'trust', 'comf', 'npcRom', 'rom')]
        if bad:
            raise SystemExit(f'{w}：rel 不認得的欄位 {bad}')
        e = {'t': IG.read_fix(o['t']), 'rel': {k: int(x) for k, x in (o.get('rel') or {}).items()}}
        if 'fx' in o:
            fx = o['fx']
            if not isinstance(fx, dict) or any(k not in ('fr', 'love') or not isinstance(n, int) or isinstance(n, bool) for k, n in fx.items()):
                raise SystemExit(f'{w}.fx：只能是 fr／love（整數）')
            e['fx'] = dict(fx)
        if 'reply' in o and 're' in o:
            raise SystemExit(f'{w}：reply 和 re 只寫一個')
        rp = o.get('reply') if 'reply' in o else ([o['re']] if isinstance(o.get('re'), str) else o.get('re'))
        e['reply'] = lines(rp, w + '.reply') if rp is not None else []
        if 'reply' not in o and 're' not in o and 'fx' not in o:
            raise SystemExit(f'{w}.reply：要是非空字串的陣列')
        out.append(e)
    return out


def build(src, sha):
    people = {}
    for hid, v in src.items():
        if hid.startswith('_'):
            continue
        P = {'scenes': {}, 'rot': []}
        for k, s in v.items():
            if k.startswith('_'):
                continue
            if k == 'rot':
                for i, r in enumerate(s):
                    w = f'{hid}.rot[{i}]'
                    e = {x: lines(r[x], f'{w}.{x}') for x in LISTS if x in r}
                    if not e.get('seat') and not e.get('mid'):
                        raise SystemExit(f'{w}：輪換至少要有 seat 或 mid')
                    if r.get('if'):
                        e['if'] = r['if']
                    ro = (r.get('choice') or {}).get('opts') if r.get('choice') else r.get('opts')   # DLG-FX-MECH-1110：輪換那幾則也可以有選項
                    if ro:
                        e['opts'] = opts(ro, w)
                    P['rot'].append(e)
                continue
            if not k.isdigit() or not 1 <= int(k) <= 6:
                raise SystemExit(f'{hid}.{k}：不認得的場次')
            w = f'{hid}.{k}'
            e = {'need': int(s.get('need', 1))}
            for x in LISTS:
                if x in s:
                    e[x] = lines(s[x], f'{w}.{x}')
            if not e.get('seat') or not e.get('mid'):
                raise SystemExit(f'{w}：要有 seat 和 mid')
            if s.get('choice'):
                c = s['choice']
                if c.get('at') != 'mid':
                    raise SystemExit(f'{w}.choice.at：只接 mid（收到 {c.get("at")}）')
                e['opts'] = opts(c.get('opts') or [], w + '.choice')
            if s.get('set'):
                e['set'] = s['set']
            if s.get('unlock'):
                if (hid, k) not in UNLOCK:
                    raise SystemExit(f'{w}.unlock「{s["unlock"]}」：UNLOCK 沒有對到地點 key')
                e['unlock'] = UNLOCK[(hid, k)]
            if s.get('alt'):
                a = s['alt']
                if a.get('if') not in ALT_COND:
                    raise SystemExit(f'{w}.alt.if「{a.get("if")}」：ALT_COND 沒有對到遊戲的條件')
                A = {'cond': ALT_COND[a['if']]}
                for x in LISTS:
                    if x in a:
                        A[x] = lines(a[x], f'{w}.alt.{x}')
                if a.get('opts'):
                    A['opts'] = opts(a['opts'], w + '.alt')
                if a.get('replyKeep'):
                    rk = REPLY_KEEP.get((hid, k))
                    if not rk or rk[0] != a['replyKeep']:
                        raise SystemExit(f'{w}.alt.replyKeep：字和 REPLY_KEEP 不一樣，請照新稿改這支工具')
                    base = A.get('opts') or e.get('opts') or []
                    A['opts'] = [dict(o, reply=[IG.read_fix(t) for t in rk[1][o['t']]]) if o['t'] in rk[1] else o for o in base]
                    if not any(o['t'] in rk[1] for o in base):
                        raise SystemExit(f'{w}.alt.replyKeep：找不到要換的選項')
                e['alt'] = A
            P['scenes'][k] = e
        if sorted(P['scenes']) != ['1', '2', '3', '4', '5', '6']:
            raise SystemExit(f'{hid}：第 1～6 次不齊（{sorted(P["scenes"])}）')
        people[hid] = P
    return {'src': f'{PATH}@{sha}', 'people': people}


def main():
    ref = None
    if '--ref' in sys.argv:
        ref = sys.argv[sys.argv.index('--ref') + 1]
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = ref or hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = build(json.loads(git('show', f'{sha}:{PATH}')), sha)
    js = ('/* 自動產生：tools/story/import_study_scenes.py（' + data['src'] + '）。不要手改，改企劃 AA_707 再重新匯入。\n'
          '   一起念書第 1～6 次＋輪換（STUDY-DATE-PROGRESS-1107；規則 AA_706 第 1 節；播放 src/studyn3d.js）*/\n'
          "'use strict';\nconst STUDY_SCENES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: len(v['scenes']) for k, v in data['people'].items()})


if __name__ == '__main__':
    main()
