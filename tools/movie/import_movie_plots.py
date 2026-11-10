#!/usr/bin/env python3
"""南洋戲院 72 部片的情節、散場後聊什麼、和誰看有什麼不一樣（MOVIE-TALK-1110；使用者 X324，AA_745）。
使用者 11-10 20:0x（對 AA）：「所有的電影……你要認真寫電影的情節，然後會影響劇情，跟誰看對誰有不同影響，但不要每個人都有，這樣會太像一個模板」
企劃（AA 定稿 D109，企劃線）：docs/story_planning/AA_745_movie_plots_<N>.json（一批 24 部，1..N 批都收）
→ src/data/movie_plots.js（MOVIE_PLOTS）。播放在 src/movies3d.js。
- 每一批都要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（import_guard）。
- plot、scene、talk、with 的字一字不改（只走 import_guard.read_fix）；結構照稿（films 原樣帶過去）。
- 第二次看的兩句旁白從 _meta.rules 第 2 條抽出來（括號那兩句，一字不改）。
- AA 寫在 note 裡的條件（「只在朋友以上才說」「交往中改成：…」）由下面 COND 表接到程式能判斷的條件；
  表上寫的替代句一定要一字不差出現在那一則 note 裡（核對不過就停下來），不自己寫字。
- need（with 的條件）、later 的時機（when）各有一張表；稿上出現表上沒有的字就停下來（新的一批要先補表）。
- 片 id 一定要在 AA_730 片單（src/data/nanyang_movies.js）；人只能是七位；re 的 key 是人或人＋2／3（第二、三句）。
用法：python3 tools/movie/import_movie_plots.py [--check]"""
import json, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

SRCS = ['docs/story_planning/AA_745_movie_plots_1.json', 'docs/story_planning/AA_745_movie_plots_2.json',
        'docs/story_planning/AA_745_movie_plots_3.json']
OUT = 'src/data/movie_plots.js'
FILMS_JS = 'src/data/nanyang_movies.js'
PEOPLE = ('heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin')
KINDS = ('after', 'mid', 'later', 'skip')
BY = ('her', 'me', 'none')
# 稿裡有名字說的句子外面整句加「」的（TEXT-QUOTE-UNIFY-1108 會擋）——這一句是沛珊自己學自己要寫的信，不是外面多加的引號，照留
QUOTE_OK = {'「妳好，我是小學坐妳旁邊的人，我欠妳三封信。」'}

# with.need 的字 → 程式的條件（src/movies3d.js S.NEED）
NEED = {
    '朋友以上，而且散場是 21:00 以後': {'stage': 3, 'hourMin': 21},
    '不是 skip 整部：是她一定挑這部（有貓）': {'force': True},
    '和沛珊交往中，或重聚以前已經重新聯絡上（AA_282）': {'psLink': True},
    '有 KX_VOLLEYBALL（第 2 批《放學後的球場》）': {'flag': 'KX_VOLLEYBALL'},
    '大四下（2029-03～04），朋友以上': {'stage': 3},
}
# later 的時機（when）→ 怎麼演：msg＝她傳訊息（d＝看完後第幾天、h＝幾點；at＝指定日期；series＝連續幾天一天一則）；
# meet＝下一次和她見面（INV.meet 坐下以後；days 天內、at 地點）；hook＝要接在別的劇情裡（那一場還沒有接點＝只記旗標，列在報告）
LATER = {
    'm2409b:kexin': {'mode': 'msg', 'd': 1, 'h': 21},
    'm2505b:kexin': {'mode': 'hook', 'hook': '分科測驗前一晚（2025-07-10，AA_272 第 10 節）那一場的最後面'},
    'm2507b:heroine_03': {'mode': 'meet', 'days': 7, 'at': 'teaOrMeal'},
    'm2603b:heroine_01': {'mode': 'hook', 'hook': '下一次刑法或民法課下課（同班）'},
    'm2605b:heroine_03': {'mode': 'hook', 'hook': '下一個她在一盞茶屋上班的週末玩家進茶屋（要 YT_MET_JOB）'},
    'm2607a:classmate_peishan': {'mode': 'hook', 'hook': '一週內平日白天在校園遇到沛珊（要 PS_SECRET_PATH）', 'needFlag': 'PS_SECRET_PATH'},
    'm2609a:kexin': {'mode': 'msg', 'd': 1, 'h': 21},
    'm2703a:heroine_04': {'mode': 'msg', 'd': 0, 'h': 22},
    'm2703b:heroine_02': {'mode': 'hook', 'hook': '2027-09 初芷若出發去英國交換那一場的最後（要 ZR_FOUR_WORDS）', 'needFlag': 'ZR_FOUR_WORDS'},
    'm2709b:heroine_01': {'mode': 'meet', 'days': 7, 'at': 'library'},
    'm2805b:heroine_04': {'mode': 'msg', 'at': '2028-07-03', 'h': 21, 'needFlag': 'ZQ_LEVEL8'},
    'm2807b:classmate_peishan': {'mode': 'msg', 'd': 0, 'h': 22, 'anyView': True},
    'm2901b:heroine_05': {'mode': 'msg', 'd': 2, 'h': 21, 'stage': 3},
    'm2909a:heroine_04': {'mode': 'msg', 'd': 1, 'h': 22, 'series': True},
}
# 她一定挑的片（AA 11-10 20:11 答：子晴《貓咪咖啡館的星期三》《第八關》、芷若《黑白的城市》；寫在 note 裡，不是 skip 欄）
# noRule＝只在 AA_708 那一場沒有指定片（sceneFilm 沒寫）的時候（芷若那則 note：「sceneFilm 沒指定時」）
FORCE = {
    'm2511b:heroine_02': {'noRule': True, 'noteHas': '她一定會挑這部（sceneFilm 沒指定時）'},
    'm2805b:heroine_04': {'noteHas': '約她這一段一定是這部'},
}
# note 裡的條件（AA 寫的字 → 程式的條件 id，src/movies3d.js S.COND）。text／sub 的字要一字不差在那一則 note 裡
#   re.<key>：opt＝只管第幾個選項（沒寫＝每個選項）；if＝成立才說（不成立：else 有字＝換成那一句，沒有＝不說）；dating＝交往中換成這一句；sub＝換掉句子裡的一段
#   opt.<k>：if＝成立才出這個選項（不成立：else＝{t,fx,re} 換成這個選項，沒有＝不出）
#   with.<人>：line＝第 i 句在條件成立時換成 text；subs＝交往中換掉的字
COND = {
    'm2801a': {'re': {'heroine_052': {'if': 'friend', 'dating': '今年跟我看。不要去擠。'}}},
    'm2807a': {'re': {'heroine_042': {'if': 'from:2028-07'}}},
    'm2809a': {'opt': {'1': {'if': 'friend', 'else': {'t': '我還在想。', 'fx': {}, 're': {}}}},
               're': {'heroine_032': {'if': 'flag:YT_MET_JOB', 'else': '那天下雨。你傘很小。'}}},
    'm2809b': {'opt': {'0': {'if': 'intern'}}},
    'm2907b': {'re': {'heroine_022': {'if': 'zrKeep', 'opt': 2}}},
    'm2911a': {'re': {'kexin': {'if': 'kxZq', 'cut': '先活過今晚再說。'}}},
    'm2911b': {'re': {'heroine_052': {'if': 'close', 'else': '（她沒有再講話。）', 'opt': 2}}},
    'm3001b': {'re': {'heroine_012': {'if': 'close'}}},
    'm3003b': {'re': {'heroine_052': {'if': 'giftBookmark'}}},
    'm3005a': {'re': {'kexin': {'if': 'ev:ev_y0_e26', 'else': '我知道。你怕高。', 'opt': 0}}},
    'm3007a': {'re': {'kexin2': {'if': 'flag:KX_VOLLEYBALL'}}},
    'm3007b': {'opt': {'2': {'if': 'seen:m2511b:heroine_02'}},
               're': {'heroine_02': {'sub': {'from': '第一部你說很悶。', 'film': 'm2511b',
                                             'by': {'0': '第一部你說起雞皮疙瘩。', '1': '第一部你說喜歡翻報紙的聲音。'}}}}},
    'with': {
        'm2411b:heroine_03': {'line': {'i': 2, 'if': 'flag:YT_CATS', 'text': '公園那隻比較胖。'}},
        'm2707b:heroine_02': {'subs': [['抓住你的袖子', '抓住你的手'], ['抱歉，你袖子皺了。', '我九月就看不到這間戲院了。']], 'if': 'dating',
                              'noteHas': ['袖子改成手', '我九月就看不到這間戲院了。']},
    },
}
COND_IDS = ('friend', 'close', 'dating', 'intern', 'zrKeep', 'kxZq', 'giftBookmark')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def src_sha(allow, path):
    hits = [e for e in allow.get('files', []) if e.get('path') == path and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{path}：不在匯入白名單')
    sha = hits[-1]['sha']
    ok, why = IG.allowed(path, sha, allow)
    if not ok:
        raise SystemExit(why)
    return sha, why


def film_ids():
    t = open(os.path.join(ROOT, FILMS_JS), encoding='utf-8').read()
    return set(re.findall(r'"id": "(m\d{4}[ab])"', t))


def fix(x, where, speech=False):
    """一字不改（read_fix 換名）；有名字說的句子外面不加「」"""
    if isinstance(x, str):
        if not x.strip():
            raise SystemExit(f'{where}：空字串')
        s = IG.read_fix(x)
        if speech and s.startswith('「') and s.endswith('」') and s not in QUOTE_OK:
            raise SystemExit(f'{where}「{s}」：有名字說的不在外面加「」（TEXT-QUOTE-UNIFY-1108）')
        return s
    if isinstance(x, list):
        return [fix(v, f'{where}[{i}]', speech) for i, v in enumerate(x)]
    if isinstance(x, dict):
        return {k: fix(v, f'{where}.{k}', speech or k in ('re', 'lines', 'say')) for k, v in x.items()}
    return x


def re_base(k):
    if k in PEOPLE:
        return k, 1
    m = re.fullmatch(r'(.+?)([23])', k)
    if m and m.group(1) in PEOPLE:
        return m.group(1), int(m.group(2))
    return None, 0


def chk_fx(fx, where, people=True):
    if not isinstance(fx, dict):
        raise SystemExit(f'{where}：fx 要是物件')
    items = fx.items() if people else [('', fx)]
    for p, v in items:
        if people and p not in PEOPLE:
            raise SystemExit(f'{where}.{p}：不認得的人')
        if not isinstance(v, dict) or any(k not in ('fr', 'love') or not isinstance(n, int) for k, n in v.items()):
            raise SystemExit(f'{where}.{p}：只能是 fr／love（整數）')


def chk_film(fid, f, ids):
    w = fid
    if fid not in ids:
        raise SystemExit(f'{w}：不在 AA_730 片單')
    bad = [k for k in f if k not in ('plot', 'scene', 'talk', 'with')]
    if bad:
        raise SystemExit(f'{w}：不認得的欄位 {bad}')
    for k in ('plot', 'scene'):
        if not isinstance(f.get(k), str) or not f[k].strip():
            raise SystemExit(f'{w}.{k}：要有字')
    t = f.get('talk')
    if not isinstance(t, dict) or t.get('by') not in BY or not t.get('q') or not isinstance(t.get('opts'), list) or len(t['opts']) != 3:
        raise SystemExit(f'{w}.talk：要有 by（{BY}）、q、三個 opts')
    for i, o in enumerate(t['opts']):
        wo = f'{w}.talk.opts[{i}]'
        if not o.get('t') or any(k not in ('t', 're', 'fx', 'set') for k in o):
            raise SystemExit(f'{wo}：只能有 t、re、fx、set')
        for k in (o.get('re') or {}):
            if not re_base(k)[0]:
                raise SystemExit(f'{wo}.re.{k}：不認得的 key')
        chk_fx(o.get('fx', {}), wo + '.fx')
        if 'set' in o and not re.fullmatch(r'[A-Z][A-Z0-9_]+', o['set']):
            raise SystemExit(f'{wo}.set：旗標名')
    for p, x in (f.get('with') or {}).items():
        wx = f'{w}.with.{p}'
        if p not in PEOPLE:
            raise SystemExit(f'{wx}：不認得的人')
        if x.get('kind') not in KINDS or not isinstance(x.get('lines'), list):
            raise SystemExit(f'{wx}：kind 要是 {KINDS}、要有 lines')
        bad = [k for k in x if k not in ('kind', 'lines', 'when', 'set', 'note', 'need', 'choice')]
        if bad:
            raise SystemExit(f'{wx}：不認得的欄位 {bad}')
        if 'need' in x and x['need'] not in NEED:
            raise SystemExit(f'{wx}.need「{x["need"]}」：tools/movie/import_movie_plots.py 的 NEED 表沒有，先補表')
        if x['kind'] == 'later' and f'{fid}:{p}' not in LATER:
            raise SystemExit(f'{wx}：later 的時機（{x.get("when")}）不在 LATER 表，先補表')
        for i, c in enumerate(x.get('choice') or []):
            wc = f'{wx}.choice[{i}]'
            if not c.get('t') or any(k not in ('t', 'say', 'fx', 'set', 'time') for k in c):
                raise SystemExit(f'{wc}：只能有 t、say、fx、set、time')
            chk_fx(c.get('fx', {}), wc + '.fx', people=False)
            if 'time' in c and not re.fullmatch(r'\+\d+ 分鐘', c['time']):
                raise SystemExit(f'{wc}.time：要是「+N 分鐘」')


def again_lines(meta):
    R = meta.get('rules') or []
    hit = [r for r in R if '第二次看' in r and 'talk 不再出' in r]
    if len(hit) != 1:
        raise SystemExit('_meta.rules：找不到「同一部片和同一個人第二次看」那一條')
    L = re.findall(r'（[^（）]*）', hit[0])
    if len(L) != 2 or '喜劇' not in hit[0]:
        raise SystemExit('_meta.rules 第二次看：要剛好兩句括號旁白（喜劇片、其他片）')
    return {'comedy': IG.read_fix(L[0]), 'other': IG.read_fix(L[1])}


def chk_cond(films):
    def note_of(fid, who=None):
        f = films[fid]
        if who:
            return (f.get('with') or {}).get(who, {}).get('note', '')
        return (f['talk'].get('note') or '') + ''.join(x.get('note', '') for x in (f.get('with') or {}).values())

    def cid(c, w):
        if c in COND_IDS or re.fullmatch(r'flag:[A-Z][A-Z0-9_]+|from:\d{4}-\d{2}|ev:\w+|seen:m\d{4}[ab]:\w+', c):
            return
        raise SystemExit(f'COND {w}：不認得的條件 {c}')

    def has(txt, note, w):
        if txt not in note:
            raise SystemExit(f'COND {w}：替代句「{txt}」不在 AA 的 note 裡（一字不改：AA 改了 note 要重看這張表）')

    for fid, c in COND.items():
        if fid == 'with':
            for key, x in c.items():
                f, who = key.split(':')
                if f not in films or who not in (films[f].get('with') or {}):
                    raise SystemExit(f'COND with {key}：稿裡沒有')
                n = note_of(f, who)
                cid(x.get('if') or x['line']['if'], key)
                if 'line' in x:
                    has(x['line']['text'], n, key)
                for t in x.get('noteHas', []):
                    has(t, n, key)
                for a, b in x.get('subs', []):
                    if a not in ''.join(films[f]['with'][who]['lines']):
                        raise SystemExit(f'COND with {key}：「{a}」不在句子裡')
            continue
        if fid not in films:
            continue   # 這一批還沒到
        n = note_of(fid)
        for k, x in c.get('re', {}).items():
            if not any(k in (o.get('re') or {}) for o in films[fid]['talk']['opts']):
                raise SystemExit(f'COND {fid}.re.{k}：稿裡沒有這個 key')
            if 'if' in x:
                cid(x['if'], f'{fid}.{k}')
            for t in [x.get('else'), x.get('dating')] + list((x.get('sub') or {}).get('by', {}).values()):
                if t:
                    has(t, n, f'{fid}.{k}')
            if x.get('cut') and not any(x['cut'] in (o.get('re') or {}).get(k, '') for o in films[fid]['talk']['opts']):
                raise SystemExit(f'COND {fid}.{k}：cut「{x["cut"]}」不在句子裡')
            if x.get('sub') and not any(x['sub']['from'] in (o.get('re') or {}).get(k, '') for o in films[fid]['talk']['opts']):
                raise SystemExit(f'COND {fid}.{k}：sub「{x["sub"]["from"]}」不在句子裡')
        for k, x in c.get('opt', {}).items():
            cid(x['if'], f'{fid}.opt{k}')
            if x.get('else'):
                has(x['else']['t'], n, f'{fid}.opt{k}')
    for key, x in FORCE.items():
        f, who = key.split(':')
        if f in films and x['noteHas'] not in ''.join(w.get('note', '') for w in (films[f].get('with') or {}).values()):
            raise SystemExit(f'FORCE {key}：note 裡找不到「{x["noteHas"]}」')


def build(batches):
    ids = film_ids()
    films, src, again = {}, [], None
    for path, sha, d in batches:
        meta = d.get('_meta') or {}
        if again is None:
            again = again_lines(meta)
        F = d.get('films')
        if not isinstance(F, dict) or not F:
            raise SystemExit(f'{path}：films 要是物件')
        for fid, f in F.items():
            if fid in films:
                raise SystemExit(f'{fid}：兩批都有')
            chk_film(fid, f, ids)
            films[fid] = fix(f, fid)
        src.append(f'{path}@{sha}')
    if again is None:
        raise SystemExit('第 1 批的 _meta 要在（第二次看的旁白）')
    chk_cond(films)
    pick = {}
    for fid, f in films.items():
        for who, x in (f.get('with') or {}).items():
            if x['kind'] == 'skip':
                nd = NEED.get(x.get('need'), {})
                pick.setdefault(fid, {})[who] = {'mode': 'force' if nd.get('force') else 'skip'}
    for key, x in FORCE.items():
        f, who = key.split(':')
        if f in films:
            pick.setdefault(f, {})[who] = {'mode': 'force', 'noRule': bool(x.get('noRule'))}
    later = {k: v for k, v in LATER.items() if k.split(':')[0] in films}
    cond = {k: v for k, v in COND.items() if k == 'with' or k in films}
    cond['with'] = {k: {kk: vv for kk, vv in v.items() if kk != 'noteHas'} for k, v in cond['with'].items()}
    order = sorted(films)
    return {'src': src, 'again': again, 'need': NEED, 'later': later, 'pick': pick, 'cond': cond,
            'films': {k: films[k] for k in order}}


def load_batches(allow):
    out = []
    for p in SRCS:
        hits = [e for e in allow.get('files', []) if e.get('path') == p]
        if not hits:
            continue   # 還沒交的批次
        sha, why = src_sha(allow, p)
        out.append((p, sha, json.loads(git('show', f'{sha}:{p}'))))
    if not out:
        raise SystemExit('AA_745：白名單上一批都沒有')
    return out


def render(data):
    return ('/* 自動產生：tools/movie/import_movie_plots.py（' + '、'.join(data['src']) + '）。不要手改，改企劃 AA_745 再重新匯入。\n'
            '   南洋戲院每部片的情節（plot）、大家會記得的那一幕（scene）、散場後聊什麼（talk）、和誰看多出來的（with）——MOVIE-TALK-1110；\n'
            '   again＝同一部片和同一個人第二次看的旁白；need／later／pick／cond＝稿上的條件、時機、一定挑／不看的片、note 裡的條件（對照表在匯入工具）。播放在 src/movies3d.js */\n'
            "'use strict';\nconst MOVIE_PLOTS=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
            "if(typeof module!=='undefined') module.exports=MOVIE_PLOTS;\n")


def main():
    allow = IG.load(ROOT)
    data = build(load_batches(allow))
    js = render(data)
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和白名單上的 AA_745 不一樣：重新匯入')
        print('OK', ', '.join(data['src']))
        return
    open(p, 'w', encoding='utf-8').write(js)
    W = sum(len(f.get('with') or {}) for f in data['films'].values())
    print('寫入', OUT, '：', len(data['films']), '部；with', W, '組；', ', '.join(data['src']))


if __name__ == '__main__':
    main()
