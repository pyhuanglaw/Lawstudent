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
- 選項的 kind（七種：feel／notice／wonder／self／joke／crit／ask；434d46fbf 起，原本的 detail、meh 沒有了）照帶；talk.nofb（true＝這部片沒有專屬回答的人不出 talk）、
  talk.qOther（q 是寫給特定的人的：其他人看這部時用這一句）、talk.optsOther（{note, opts:[{t,kind}×3]}：其他人看這部時整組換成這三個選項）照帶、照格式檢查；reBy（m3007b：照之前另一部片選了哪一個換句）的格子 → 當時第幾個選項，對照在 REBY 表。
- AA_745_fallback.json（沒有專屬回答時她怎麼回；MOVIE-FALLBACK-1110）：**在白名單上才匯**（→ MOVIE_PLOTS.fallback）。BB 11-10 審過第三版（BB_313），
  4e41f0d09 起在白名單上、src/movies3d.js 的 S.CFG.fallback＝true。不在白名單＝不產生 fallback，遊戲照沒有 fallback 的規則（稿上沒寫到她＝不問）。
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
KINDS = ('after', 'mid', 'later', 'skip', 'pick')   # pick＝她一定挑這部（AA_745 v2）；skip＝她不看（舊稿 m2801b 的 skip＋need「一定挑」照舊認）
WARN = []   # 不認得的人（re／fx 的 key）：列出來、不停（AA 改稿以後重匯）；遊戲裡這些 key 不會被讀到
BY = ('her', 'me', 'none')
OPT_KINDS = ('feel', 'notice', 'wonder', 'self', 'joke', 'crit', 'ask')   # 選項的種類（第 1 批 _meta.fields.kind；434d46fbf 起七種）
FB_SRC = 'docs/story_planning/AA_745_fallback.json'   # 在白名單上才匯
FB_KINDS = ('feel', 'notice', 'wonder', 'self', 'joke', 'crit')   # ask 沒有 fallback（她沒有專屬回答＝不出那個選項）
# 沛珊的通用回話（PEISHAN-VOICE-1110，使用者 X327）：AA_751_peishan_termend.json 的 fallback **整組取代** AA_745_fallback.json 的 classmate_peishan。
# 白名單那一筆 people.fallback 是 true 才換，而且只認 PS_SHA 那一版（使用者糾正「不是看到食物就要評論」以後的稿；更舊的不匯）。沒換的時候 src/movies3d.js 的 fallbackOff 要留著她。
PS_SRC = 'docs/story_planning/AA_751_peishan_termend.json'
PS_SHA = '768b9a131'   # 2026-11-11：33a1769f8 → 768b9a131（AA 補大四下那一頓；fallback 這一段兩版一樣）
PS = 'classmate_peishan'
# reBy：那個選項她的句子照「之前另一部片那次選了哪一個」換。稿上的格子名 → 當時第幾個選項；has＝那個選項的字裡要有這一段（核對用，AA 改了選項要重看）
REBY = {
    'm3007b': {'opt': 2, 'film': 'm2511b', 'who': 'heroine_02',
               'by': {'說過起雞皮疙瘩': {'k': 0, 'has': '起雞皮疙瘩'}, '說過喜歡翻報紙的聲音': {'k': 1, 'has': '翻報紙的聲音'}, '說過蠻悶的': {'k': 2, 'has': '蠻悶的'}}},
}
# 稿裡有名字說的句子外面整句加「」的（TEXT-QUOTE-UNIFY-1108 會擋）——這一句是沛珊自己學自己要寫的信，不是外面多加的引號，照留
QUOTE_OK = {'「妳好，我是小學坐妳旁邊的人，我欠妳三封信。」'}

# with.need 的字 → 程式的條件（src/movies3d.js S.NEED）
NEED = {
    '朋友以上，而且散場是 21:00 以後': {'stage': 3, 'hourMin': 21},
    '不是 skip 整部：是她一定挑這部（有貓）': {'force': True},
    '和沛珊交往中，或重聚以前已經重新聯絡上（AA_282）': {'psLink': True},
    '朋友以上': {'stage': 3},
    '大四下（2029-03～04），朋友以上': {'stage': 3},
}
# later 的時機（when）→ 怎麼演：msg＝她傳訊息（d＝看完後第幾天、h＝幾點；at＝指定日期；series＝連續幾天一天一則）；
# meet＝下一次和她見面（INV.meet 坐下以後；days 天內〔沒寫＝不限〕、at 地點、before＝這一天起不演、from＝這一天起才演）；hook＝要接在別的劇情裡（那一場還沒有接點＝只記旗標，列在報告）
LATER = {
    'm2409b:kexin': {'mode': 'msg', 'd': 1, 'h': 21},
    'm2505b:kexin': {'mode': 'meet', 'before': '2025-07-11'},   # AA 11-10 20:35：考試（2025-07-11）以前的下一次見面，過了就不演
    'm2603b:heroine_01': {'mode': 'meet'},   # AA 11-10 20:35：下一次見面
    'm2605b:heroine_03': {'mode': 'meet', 'at': 'teahouse'},   # AA 11-10 20:35：下一次在一盞茶屋見面（INV 的 teahouse／wz_teahouse）
    'm2609a:kexin': {'mode': 'msg', 'd': 1, 'h': 21},
    'm2703a:heroine_04': {'mode': 'msg', 'd': 0, 'h': 22},
    'm2703b:heroine_02': {'mode': 'msg', 'at': '2027-09-02', 'h': 11, 'needFlag': 'ZR_FOUR_WORDS'},   # 第二版：沒有送機場面，她出發那天（zr_sendoff3d.js 2027-09-02）登機前傳一張照片
    'm2709b:heroine_01': {'mode': 'meet', 'days': 7, 'at': 'library'},
    'm2805b:heroine_04': {'mode': 'meet', 'from': '2028-07-01', 'needFlag': 'ZQ_LEVEL8'},   # 第二版：她畢業（2028-06）以後、下一次當面見到她
    'm2807b:classmate_peishan': {'mode': 'msg', 'd': 0, 'h': 22, 'anyView': True},
    'm2901b:heroine_05': {'mode': 'meet'},   # 第二版：下一次當面見到她（need「朋友以上」在 NEED）
    'm2909a:heroine_04': {'mode': 'msg', 'd': 1, 'h': 22, 'series': True},
}
OVERRIDE = {}   # AA 交稿以後另外改的句子（稿 films 不動、另外放 override，每一筆寫 src 出處；選項的字要和稿上一樣）。第二版以後沒有（m2703b 已經寫進稿）
# talk.q 寫的是給程式的說明、不是台詞的片（不說 q，三個選項照出）
NOQ = {}   # {片 id: q 裡的一段字}；第一版的 m2807b 第二版已經改成台詞，拿掉
# 她一定挑的片（AA 11-10 20:11 答：子晴《貓咪咖啡館的星期三》《第八關》、芷若《黑白的城市》；寫在 note 裡，不是 skip 欄）
# noRule＝只在 AA_708 那一場沒有指定片（sceneFilm 沒寫）的時候（芷若那則 note：「sceneFilm 沒指定時」）
FORCE = {
    'm2511b:heroine_02': {'noRule': True, 'noteHas': '她一定會挑這部（sceneFilm 沒指定時）'},
}
# note 裡的條件（AA 寫的字 → 程式的條件 id，src/movies3d.js S.COND）。text／sub 的字要一字不差在那一則 note 裡
#   re.<key>：opt＝只管第幾個選項（沒寫＝每個選項）；if＝成立才說（不成立：else 有字＝換成那一句，沒有＝不說）；dating＝交往中換成這一句；sub＝換掉句子裡的一段
#   opt.<k>：if＝成立才出這個選項（不成立：else＝{t,fx,re} 換成這個選項，沒有＝不出）
#   with.<人>：line＝第 i 句在條件成立時換成 text；subs＝交往中換掉的字
COND = {   # 第二版（14536ff5e／77f5d0463／7c2de85b6）的 note 重看過
    'm2801a': {'re': {'heroine_052': {'dating': '今年跟我看。不要去擠。'}}},
    'm2809a': {'opt': {'1': {'if': 'friend'}},   # 朋友以上才出現，不然只有兩個選項
               're': {'heroine_032': {'if': 'flag:YT_MET_JOB', 'else': '那天下雨。你傘很小。'}}},
    'm2811b': {'re': {'heroine_012': {'if': 'dating', 'opt': 1}}},
    'm3001b': {'re': {'heroine_012': {'if': 'close'}}},
    'm3003b': {'re': {'heroine_052': {'if': 'giftBookmark'}}},
    'm3005a': {'re': {'kexin': {'if': 'ev:ev_y0_e26', 'else': '你怕高，我早就知道。', 'opt': 0}}},
    'm3007b': {'opt': {'2': {'if': 'seen:m2511b:heroine_02'}}},   # 她的第一句照當時選的換＝稿上的 reBy（b0f59985d 起；REBY 表），原本的 zrBoring／cut 拿掉
    'with': {
        'm2707b:heroine_02': {'subs': [['抓住你的袖子', '抓住你的手'], ['抱歉，你袖子皺了。', '我九月就看不到這間戲院了。']], 'if': 'dating',
                              'noteHas': ['袖子改成手', '我九月就看不到這間戲院了。']},
    },
}
COND_IDS = ('friend', 'close', 'dating', 'intern', 'zrKeep', 'kxZq', 'giftBookmark', 'zrBoring')


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
        return {k: fix(v, f'{where}.{k}', speech or k in ('re', 'lines', 'say', 'reBy')) for k, v in x.items()}
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
            WARN.append(f'{where}.{p}：不認得的人')
            continue
        if not isinstance(v, dict) or any(k not in ('fr', 'love') or not isinstance(n, int) for k, n in v.items()):
            raise SystemExit(f'{where}.{p}：只能是 fr／love（整數）')


def chk_film(fid, f, ids):
    w = fid
    if fid not in ids:
        raise SystemExit(f'{w}：不在 AA_730 片單')
    if 'title_new' in f:   # 第二版：改過片名的片 AA 另外寫一格（片名只認 AA_730／nanyang_movies.js；這裡只核對有沒有同步）
        t730 = open(os.path.join(ROOT, FILMS_JS), encoding='utf-8').read()
        m = re.search(r'"id": "' + fid + r'",[^{}]*?"title": "([^"]+)"', t730)
        if not m or m.group(1) != f['title_new']:
            WARN.append(f'{w}.title_new「{f["title_new"]}」和片單（{m.group(1) if m else "找不到"}）不一樣：先重匯 AA_730（import_nanyang_movies.py）')
    bad = [k for k in f if k not in ('plot', 'scene', 'talk', 'with', 'title_new')]
    if bad:
        raise SystemExit(f'{w}：不認得的欄位 {bad}')
    for k in ('plot', 'scene'):
        if not isinstance(f.get(k), str) or not f[k].strip():
            raise SystemExit(f'{w}.{k}：要有字')
    t = f.get('talk')
    if not isinstance(t, dict) or t.get('by') not in BY or not t.get('q') or not isinstance(t.get('opts'), list) or len(t['opts']) != 3:
        raise SystemExit(f'{w}.talk：要有 by（{BY}）、q、三個 opts')
    bad = [k for k in t if k not in ('by', 'q', 'opts', 'note', 'nofb', 'qOther', 'optsOther')]
    if bad:
        raise SystemExit(f'{w}.talk：不認得的欄位 {bad}')
    if 'nofb' in t and t['nofb'] is not True:
        raise SystemExit(f'{w}.talk.nofb：只能是 true（不用就不要寫）')
    if 'qOther' in t and (not isinstance(t['qOther'], str) or not t['qOther'].strip()):
        raise SystemExit(f'{w}.talk.qOther：要有字')
    if 'optsOther' in t:
        oo = t['optsOther']
        if not isinstance(oo, dict) or any(k not in ('note', 'opts') for k in oo) or not isinstance(oo.get('opts'), list) or len(oo['opts']) != 3:
            raise SystemExit(f'{w}.talk.optsOther：要是 {{note, opts:[三個]}}')
        for i, o in enumerate(oo['opts']):
            if not isinstance(o, dict) or not o.get('t') or set(o) != {'t', 'kind'} or o['kind'] not in OPT_KINDS:
                raise SystemExit(f'{w}.talk.optsOther.opts[{i}]：只能有 t、kind（{OPT_KINDS}）')
    for i, o in enumerate(t['opts']):
        wo = f'{w}.talk.opts[{i}]'
        if not o.get('t') or any(k not in ('t', 're', 'fx', 'set', 'kind', 'reBy') for k in o):
            raise SystemExit(f'{wo}：只能有 t、re、fx、set、kind、reBy')
        if 'kind' in o and o['kind'] not in OPT_KINDS:
            raise SystemExit(f'{wo}.kind「{o["kind"]}」：要是 {OPT_KINDS}')
        if 'reBy' in o:
            rb = REBY.get(fid)
            if not rb or rb['opt'] != i or not isinstance(o['reBy'], dict) or set(o['reBy']) != set(rb['by']):
                raise SystemExit(f'{wo}.reBy：格子和 REBY 表不一樣（先補表）')
            for lab, alt in o['reBy'].items():
                if not isinstance(alt, dict) or not alt or any(re_base(k)[0] != rb['who'] or not isinstance(v, str) for k, v in alt.items()):
                    raise SystemExit(f'{wo}.reBy.{lab}：只能是 {rb["who"]} 的句子')
        for k in (o.get('re') or {}):
            if not re_base(k)[0]:
                WARN.append(f'{wo}.re.{k}：不認得的人')
        chk_fx(o.get('fx', {}), wo + '.fx')
        if 'set' in o and not re.fullmatch(r'[A-Z][A-Z0-9_]+', o['set']):
            raise SystemExit(f'{wo}.set：旗標名')
    for p, x in (f.get('with') or {}).items():
        wx = f'{w}.with.{p}'
        if p not in PEOPLE:
            WARN.append(f'{wx}：不認得的人')
            continue
        if x.get('kind') not in KINDS or not isinstance(x.get('lines'), list):
            raise SystemExit(f'{wx}：kind 要是 {KINDS}、要有 lines')
        bad = [k for k in x if k not in ('kind', 'lines', 'when', 'set', 'note', 'need', 'choice', 'pick')]
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


def build_reby(films):
    out = {}
    for fid, rb in REBY.items():
        if fid not in films:
            continue
        o = films[fid]['talk']['opts'][rb['opt']]
        if 'reBy' not in o:
            raise SystemExit(f'REBY {fid}：稿上第 {rb["opt"]} 個選項沒有 reBy')
        if rb['film'] not in films:
            raise SystemExit(f'REBY {fid}：{rb["film"]} 不在稿裡')
        src = films[rb['film']]['talk']['opts']
        by = {}
        for lab, x in rb['by'].items():
            if x['has'] not in src[x['k']]['t']:
                raise SystemExit(f'REBY {fid}.{lab}：{rb["film"]} 第 {x["k"]} 個選項的字裡沒有「{x["has"]}」（AA 改了選項要重看這張表）')
            by[str(x['k'])] = lab
        out[fid] = {str(rb['opt']): {'film': rb['film'], 'by': by}}
    return out


def build_fallback(d):
    """AA_745_fallback.json → {人:{kind:[{re, fx?}]}}；字一字不改"""
    out = {}
    for p, v in d.items():
        if p == '_meta':
            continue
        if p not in PEOPLE or not isinstance(v, dict):
            raise SystemExit(f'fallback.{p}：只能是七位')
        out[p] = {}
        for k, L in v.items():
            w = f'fallback.{p}.{k}'
            if k not in FB_KINDS or not isinstance(L, list) or not L:
                raise SystemExit(f'{w}：kind 要是 {FB_KINDS}、要有句子')
            row = []
            for i, e in enumerate(L):
                if not isinstance(e, dict) or any(x not in ('re', 'fx') for x in e) or not (isinstance(e.get('re'), str) or (isinstance(e.get('re'), list) and e['re'])):
                    raise SystemExit(f'{w}[{i}]：只能有 re（一句或幾句）、fx')
                r = {'re': fix(e['re'], f'{w}[{i}].re', True)}
                if 'fx' in e:
                    chk_fx(e['fx'], f'{w}[{i}].fx', people=False)
                    r['fx'] = e['fx']
                row.append(r)
            out[p][k] = row
    return out


def build(batches, fallback=None):
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
            if who not in PEOPLE:
                continue
            if x['kind'] == 'pick' or x.get('pick') is True:   # 第二版：kind pick，或 with 裡寫 pick:true＝她一定挑這部
                pick.setdefault(fid, {})[who] = {'mode': 'force'}
            if x['kind'] == 'skip':
                nd = NEED.get(x.get('need'), {})
                pick.setdefault(fid, {})[who] = {'mode': 'force' if nd.get('force') else 'skip'}
    for key, x in FORCE.items():
        f, who = key.split(':')
        if f in films:
            pick.setdefault(f, {}).setdefault(who, {'mode': 'force'}).update({'mode': 'force', 'noRule': bool(x.get('noRule'))})
    later = {k: v for k, v in LATER.items() if k.split(':')[0] in films}
    override = {}
    for key, o in OVERRIDE.items():
        f, who = key.split(':')
        if f not in films:
            continue
        x = (films[f].get('with') or {}).get(who)
        if not x or not o.get('src'):
            raise SystemExit(f'OVERRIDE {key}：稿裡沒有這一組，或沒寫出處')
        if [c['t'] for c in o.get('choice', [])] != [c['t'] for c in x.get('choice', [])]:
            raise SystemExit(f'OVERRIDE {key}：選項的字要和稿上一樣（AA 改了稿要重看這張表）')
        for i, c in enumerate(o.get('choice', [])):
            chk_fx(c.get('fx', {}), f'OVERRIDE {key}.choice[{i}].fx', people=False)
        override[key] = o
    noq = []
    for fid, has in NOQ.items():
        if fid in films:
            if has in films[fid]['talk'].get('q', ''):
                noq.append(fid)
            else:
                WARN.append(f'NOQ {fid}：q 改過了（找不到「{has}」），這一筆不套，請重看')
    cond = {k: v for k, v in COND.items() if k == 'with' or k in films}
    cond['with'] = {k: {kk: vv for kk, vv in v.items() if kk != 'noteHas'} for k, v in cond['with'].items()}
    order = sorted(films)
    data = {'src': src, 'again': again, 'need': NEED, 'later': later, 'override': override, 'noQ': sorted(noq), 'pick': pick, 'cond': cond,
            'reBy': build_reby(films)}
    if fallback:   # 在白名單上才有（(path, sha, 內容)）
        data['src'] = src + [f'{fallback[0]}@{fallback[1]}'] + list(fallback[3])
        data['fallback'] = build_fallback(fallback[2])
        miss = [f'{fid}[{i}]' for fid in order for i, o in enumerate(films[fid]['talk']['opts']) if 'kind' not in o]
        for p, v in data['fallback'].items():
            lack = [k for k in FB_KINDS if k not in v]
            if lack:
                raise SystemExit(f'fallback.{p}：少了 {lack}（ask 以外的六種都要有）')
        if miss:
            raise SystemExit(f'有 fallback 的時候每個選項都要有 kind：{miss[:8]}…（{len(miss)} 個）')
    data['films'] = {k: films[k] for k in order}
    return data


def load_fallback(allow):
    if not any(e.get('path') == FB_SRC for e in allow.get('files', [])):
        return None   # 還沒放進白名單＝不匯（遊戲照原本的規則）
    sha, why = src_sha(allow, FB_SRC)
    d, extra = json.loads(git('show', f'{sha}:{FB_SRC}')), []
    ps = [e for e in allow.get('files', []) if e.get('path') == PS_SRC and e.get('status') == 'approved' and (e.get('people') or {}).get('fallback') is True]
    if ps:   # 沛珊：整組換成 AA_751 的（note 以外每個 kind 的句子、順序照稿）
        psha, _ = src_sha(allow, PS_SRC)
        if not (str(psha).startswith(PS_SHA) or PS_SHA.startswith(str(psha))):
            raise SystemExit(f'{PS_SRC}@{psha}：沛珊的稿只認 {PS_SHA}（要換版本先改這支工具的 PS_SHA）')
        f = dict(json.loads(git('show', f'{psha}:{PS_SRC}')).get('fallback') or {})
        if not str(f.pop('note', '')).startswith('整組取代 AA_745_fallback.json 的 classmate_peishan') or set(f) != set(FB_KINDS) or PS not in d:
            raise SystemExit(f'{PS_SRC}：fallback 的欄位改了（要有說明那一句、六種 kind 都要有），先改這支工具')
        d[PS] = f
        extra.append(f'{PS_SRC}@{psha}（fallback.{PS} 整組）')
    return (FB_SRC, sha, d, extra)


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


def warn():
    if WARN:
        print(f'警告 {len(WARN)} 項（不擋匯入；請 AA 改稿以後重匯）：')
        for w in WARN:
            print('  -', w)


def main():
    allow = IG.load(ROOT)
    data = build(load_batches(allow), load_fallback(allow))
    js = render(data)
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import aa959 as _AA959   # AA_959（DLG-FULL-REVIEW-1110，LAWWW 11-13 選 (a)）：「今天」開頭砍半＋「……」開頭減量，源稿不動、寫檔前最後一步照 docs/handoff/AA_959_overlay.json 換（tools/story/aa959.py）
    js = _AA959.layer(js, 'movie_plots.js')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和白名單上的 AA_745 不一樣：重新匯入')
        print('OK', ', '.join(data['src']))
        warn()
        return
    open(p, 'w', encoding='utf-8').write(js)
    W = sum(len(f.get('with') or {}) for f in data['films'].values())
    print('寫入', OUT, '：', len(data['films']), '部；with', W, '組；fallback', '有' if 'fallback' in data else '沒有（不在白名單）', '；', ', '.join(data['src']))
    warn()



if __name__ == '__main__':
    main()
