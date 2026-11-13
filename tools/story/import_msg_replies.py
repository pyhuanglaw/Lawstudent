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
DROP = {('kexin', '……玉米還是我們的好。'), ('kexin', '吃完了。下次換你挑。'), ('kexin', '他們說下次一定要看到本人。'), ('kexin', '讀書會的學弟妹要請你吃飯。你在國外，先視訊被看。'),
        ('kexin', '解決了。不用安慰我。')}   # CANON-NO-ECON-1112 第四批：可昕大二上考壞的那一串（y2b3d.js y2_kx_bad_self）照 AA_873 ② 拿掉


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


# CANON-NO-ECON-1112 第五批（AA_919 第 2 節、AA_920 ①⑥、AA_921 第 3-2 節，企劃線 96c3a668eb）：src 手機那句換了，回覆的 text 跟著換（AA_709 的規矩：text 要和遊戲那則一字不差）；
# 回覆只換稿上寫到的句子。照「那一則現在的 text」找（剛好一則，對不到就停，不猜）。外校同學的名字用 \u 跳脫寫。
# 欄位：text＝新的 text、drop＝整則不匯（「見過他們」那一版：AA_919 兩則合成一則）、thread＝{i: (舊, 新)}、opts＝{j: {'t': (舊, 新), 'say': (舊陣列, 新陣列)}}
U = lambda s: json.loads('"' + s + '"')
B5 = [
    ('kexin', '我們系有一個人，考古題有目錄。目錄有索引。', {'text': '系上有一個學長，考古題有目錄。目錄有索引。'}),
    ('kexin', U(r'詹靖') + '拍了山下那家的老闆一整天，老闆只說了一句：好。', {'drop': True}),
    ('kexin', '我那個拍片的朋友' + U(r'詹靖') + '，拍了山下那家的老闆一整天。老闆只說了一句：好。',
     {'text': '我們模擬法庭同組那個同學會拍片。他拍了公館一家麵店的老闆一整天，老闆只說了一句：好。',
      'opts': {1: {'say': ([U(r'詹靖') + '說，這樣才好看。'], ['他說，這樣才好看。'])}}}),
    ('kexin', '我那個拍片的朋友' + U(r'詹靖') + '，短片在小影展放了。我坐第一排。', {'text': '同組那個同學的短片，在小影展放了。我坐第一排。'}),
    ('kexin', '期末報告講完了。最後一排空著。',
     {'thread': {0: ('（照片：台上，' + U(r'詹靖') + '拍的）', '（照片：台上，同組的同學拍的）')},
      'opts': {2: {'say': ([U(r'詹靖') + '拍的。', '他說最後一排空著，他幫你拍了一張空椅子。不准笑。'], ['同組的同學拍的。', '他說最後一排空著，他幫你拍了一張空椅子。不准笑。'])}}}),
    ('kexin', '報告講完了。……好累。',
     {'thread': {0: ('（照片：台上，' + U(r'詹靖') + '拍的）', '（照片：台上，同組的同學拍的）')},
      'opts': {1: {'say': (['很順。', U(r'詹靖') + '拍了照片。你回來給你看。'], ['很順。', '同組的同學拍了照片。你回來給你看。'])}}}),
    ('kexin', '我們系那個考古題有目錄的人，現在出第二冊了。', {'text': '系上那個學長的考古題目錄，現在出第二冊了。'}),
    ('kexin', '報告我寫完了。聖誕快樂。禮物等考完。', {'text': '報告我寫完了。聖誕快樂。'}),
    ('kexin', '行程表做好了。……這次吃的只有一頁。',
     {'text': '這次我只想吃。其他的你決定。',
      'opts': {1: {'t': ('吃的只有一頁，妳還好嗎？', '只想吃？'), 'say': (['第二頁是吃的二。', '……你每次都信。'], ['對。高雄人到哪裡都先找吃的。'])},
               2: {'t': ('我看一下行程。', '去哪裡吃？'), 'say': (['不准改。'], ['到了再說。'])}}}),
    ('kexin', '表格我開好了。下次你也要真的讀。',
     {'text': '你沒來。我一個人讀得比較快。……騙你的。',
      'opts': {1: {'t': ('表格傳給我。', '明天我去。'), 'say': (['已經傳了。', '你自己去看今天那一格，寫著「沒來」。'], ['明天我不讀了。……好啦，九點。'])},
               2: {'say': (['你說的。', '我截圖了。'], ['你說的。'])}}}),
    ('kexin', '欠著。考完再去。',
     {'text': '沒關係。今年高雄也很冷。', 'thread': {0: ('📷（讀書計畫表，那一天的格子畫了一輛車）', '📷（高雄車站的月台，沒有人）')},
      'opts': {0: {'t': ('對不起。考完我們一定去。', '對不起，沒去成。'), 'say': (['嗯。', '我把車畫在考完那一天了。你看清楚。'], ['嗯。'])},
               1: {'t': ('車是妳畫的？', '月台怎麼沒人？'), 'say': (['對。', '畫得很爛。不准說。'], ['今天大家都在家。我也是。'])},
               2: {'t': ('考完去哪裡都可以，妳決定。', '妳家那邊冷嗎？'), 'say': (['我決定好了。', '考完再說。現在說你會分心。'], ['冷。我媽一直叫我穿外套。'])}}}),
    ('kexin', '最後一個春假。……這次不排行程表。',
     {'text': '最後一個春假。開車，去哪都好。',
      'opts': {0: {'say': (['不知道。', '不排就是不知道。你決定。'], ['不知道。', '上車再想。'])},
               1: {'t': ('妳做得到不排嗎？', '妳想去海邊嗎？'), 'say': (['做不到。', '我已經在想了。可是我不寫下來。'], ['想。', '可是你開，你決定。'])}}}),
    # CANON-NO-ECON-1112 收尾：AA_934 第 2 節（企劃線 0b9340c61c，BB_454 照用）r3_3d.js y3s2_kx_cat 換字，回覆跟著換
    ('kexin', '山上的貓認得我了。', {'text': '系館樓下那隻貓認得我了。'}),
]


def apply_b5(src):
    bad = []
    for hid, old, ch in B5:
        L = src.get(hid) or []
        hit = [i for i, e in enumerate(L) if e.get('text') == old]
        if len(hit) != 1:
            bad.append(f'{hid}「{old[:16]}」：{len(hit)} 則'); continue
        e = L[hit[0]]
        if ch.get('drop'):
            L.pop(hit[0]); continue
        for i, (o, n) in (ch.get('thread') or {}).items():
            th = e.get('thread') or []
            if len(th) <= i or th[i] != o:
                bad.append(f'{hid}「{old[:16]}」thread[{i}] 對不到'); continue
            th[i] = n
        for j, c in (ch.get('opts') or {}).items():
            o = (e.get('opts') or [])[j] if len(e.get('opts') or []) > j else None
            if o is None:
                bad.append(f'{hid}「{old[:16]}」opts[{j}] 沒有'); continue
            if 't' in c:
                if o.get('t') != c['t'][0]:
                    bad.append(f'{hid}「{old[:16]}」opts[{j}].t 對不到'); continue
                o['t'] = c['t'][1]
            if 'say' in c:
                if (o.get('say') or []) != c['say'][0]:
                    bad.append(f'{hid}「{old[:16]}」opts[{j}].say 對不到'); continue
                o['say'] = list(c['say'][1])
        if 'text' in ch:
            e['text'] = ch['text']
    if bad:
        raise SystemExit('CANON-NO-ECON-1112 第五批（回覆跟著換）：' + '；'.join(bad))
    return src


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
    data = build(apply_b5(json.loads(C1112.fix(PATH, IG.read_fix(git('show', f'{sha}:{PATH}'))))), sha)   # 第五批：回覆跟著 src 換（apply_b5）
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
