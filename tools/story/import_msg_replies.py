#!/usr/bin/env python3
"""女主角主動傳來的訊息：回覆選項（MSG-REPLY-1107；使用者 11-07「至少他們傳給我 可以給我選項回覆 依照選項增加或降低好感」「芯慈 我又不能回 他問我 我睡了嗎」）。
企劃 AA_709（docs/story_planning/AA_709_msg_replies.json，企劃線）→ src/data/msg_replies.js（MSG_REPLIES）。播放 src/msgreply3d.js。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- text 是遊戲裡那一則訊息的原句：一定要在 src/ 裡找得到（逐字），找不到就停下來（遊戲靠這一句對到訊息）。
用法：python3 tools/story/import_msg_replies.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_709_msg_replies.json'
OUT = 'src/data/msg_replies.js'
REL = ('fam', 'trust', 'comf', 'npcRom', 'rom')
TELL = ('econ', 'retake', 'dad', 'mom', 'sister', 'bday')
# new（AA 新寫、遊戲裡還沒有的訊息）的條件 → src/msgreply3d.js S.COND
NEWCOND = {'YT_MET_JOB': 'flag:YT_MET_JOB', '學姊階段 ≥2': 'stage:2', '學姊階段 ≥3': 'stage:3'}
# 遊戲裡已經拿掉的訊息（CANON-NO-ECON-1112 第三批：外校室友那一份 src/data/yule_lines.js 整份拿掉，裡面可昕那一則跟著沒了）：匯入時略過；AA 從 AA_709 拿掉以後這裡可以清空
GONE = {'她說完就哭了，然後點了雞排。'}


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


# CANON-NO-ECON-1112 第三批：可昕大二中秋外校烤肉那兩則（y2r2_3d.js y2r2_ma_photo）整則拿掉——它的回覆不匯
DROP = {('kexin', '……玉米還是我們的好。'), ('kexin', '吃完了。下次換你挑。'), ('kexin', '他們說下次一定要看到本人。'), ('kexin', '讀書會的學弟妹要請你吃飯。你在國外，先視訊被看。')}


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
            if (hid, t) in DROP:   # 那一則訊息已經拿掉（CANON-NO-ECON-1112 第三批）：回覆跟著不匯
                continue
            new = bool(e.get('new'))
            if t in GONE and not new:
                continue
            if not t or (not new and not in_src(t)):
                raise SystemExit(f'{w}.text「{t}」：src/ 裡找不到這一則訊息（要逐字；AA 新寫的要標 new）')
            opts = []
            for j, o in enumerate(e.get('opts') or []):
                if not o.get('t'):
                    raise SystemExit(f'{w}.opts[{j}]：沒有 t')
                say = [IG.read_fix(x) for x in (o.get('say') or [])]
                q = {'t': IG.read_fix(o['t']), 'rel': rel(o.get('rel'), f'{w}.opts[{j}]'), 'say': say}
                if 're' in o and not say:   # DLG-FX-MECH-1110：re＝say 的另一個寫法（一句或陣列）
                    q['say'] = [IG.read_fix(x) for x in ([o['re']] if isinstance(o['re'], str) else o['re'])]
                if 'fx' in o:   # fx＝{fr, love}（整數，可以是 0 或負的）
                    fx = o['fx']
                    if not isinstance(fx, dict) or any(k not in ('fr', 'love') or not isinstance(n, int) or isinstance(n, bool) for k, n in fx.items()):
                        raise SystemExit(f'{w}.opts[{j}].fx：只能是 fr／love（整數）')
                    q['fx'] = dict(fx)
                if o.get('tell'):
                    if o['tell'] not in TELL:
                        raise SystemExit(f'{w}.opts[{j}].tell「{o["tell"]}」：只能是 {TELL}')
                    q['tell'] = o['tell']
                opts.append(q)
            if not 2 <= len(opts) <= 4:
                raise SystemExit(f'{w}：選項要 2～4 個（{len(opts)}）')
            sk = e.get('skip') or {}
            if sk.get('say') or sk.get('rel'):
                raise SystemExit(f'{w}.skip：沒回的結果還沒做（AA 說分享生活的不扣分）；有內容的話先改 src/msgreply3d.js')
            E = {'text': t, 'opts': opts}
            if e.get('set'):
                E['set'] = e['set']
            if new:
                th = [IG.read_fix(x) for x in (e.get('thread') or [])]
                m = re.fullmatch(r'(Y\d+S[12])W(\d+) (\d{1,2}):(\d{2})', e.get('at') or '')
                if not m:
                    raise SystemExit(f'{w}.at「{e.get("at")}」：要寫 Y1S2W6 22:00')
                c = e.get('cond') or ''
                if c and c not in NEWCOND:
                    raise SystemExit(f'{w}.cond「{c}」：NEWCOND 沒有對到遊戲的條件')
                E['new'] = {'thread': th, 'term': m.group(1), 'week': int(m.group(2)), 'h': int(m.group(3)) + int(m.group(4)) / 60, 'cond': NEWCOND.get(c)}
            L.append(E)
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
    import canon1112_rows as C1112   # CANON-NO-ECON-1112 第四批：AA_894 第 3 節的整句換字疊在稿上（讀稿換名以後、建資料以前）
    data = build(json.loads(C1112.fix(PATH, IG.read_fix(git('show', f'{sha}:{PATH}')))), sha)
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
