#!/usr/bin/env python3
"""TERMEND-OPTS-1110（使用者 X324：期末飯要有選項）：把 AA 的期末飯選項稿匯進 src/data/termend_opts.js（TERMEND_OPTS）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha；台詞一字照稿，只照 import_guard.read_fix 換名）：
- docs/story_planning/AA_749_termend_gf_v2.json：女朋友版的期末飯——GF[她].table／tableByTerm[學期]＝{say, opts:[{t, re, fx}]}
- docs/story_planning/AA_749_termend_kx_v2.json：可昕的學期末約會——KX[學期]＝{say, sayC10／sayUS, opts, optsUS, then}（白名單那一筆 people.kx 是 true 才匯入；KX_ASK 的二選一照舊接在後面）
- docs/story_planning/AA_748_termend_heart_v2.json：心意的邀約——tableOpts（飯桌那一句之後的選項）、confessOpts（祐廷「說出來」的選項）
- docs/story_planning/AA_749_termend_friend_v2_<學期>.json（六個檔、七個學期）：朋友版的期末飯（一對一）——<學期>[人]＝{say, sayUS?, opts:[{t, re, fx, if?}], then?}
  → TERMEND_OPTS.FRIEND[學期][人]。白名單每個檔一筆，people.friend 列要匯入的人（沒列的人不匯入；沛珊重寫中，稿上本來也沒有）。
  稿上用文字寫的條件，這支工具換成程式認得的：芷若大二下前兩個選項（ZR_LAST／noZR_LAST）、學姊大三下第三個選項（noUS）、學姊大四上 sayUS（US4P）、
  Alison 大三上第三個選項（note：日本路線不出＝noJP）、柏翰大三下（note：鉤子不念 say＝hookNoSay）。{子晴學姊|一個學姊} 照字留著，播放時照 Q6 二選一。
- 可昕（企劃線 1cf434dee）：每個選項的 set 取代舊的 KX_ASK 二選一（有選項稿的學期 KX_ASK 不再接在後面）——
  KX_KHH true／false → 選項的 khh＝[那一次寒暑假的 key（Y2W、Y2S、Y3W、Y3S、Y4W）, 'yes'／'no']（和原本二選一記進 G.flags.KX_KHH 的值一樣：yes＝去、no＝沒空）；
  KX_Y5_CALL true → 選項的 y5＝'sat'（原本「週末一定打。」記的值，src/kx_khh3d.js 只認這個值排「打給可昕」的提醒）。美國路線 optsUS 不能有 set（不記）；
  例外：大三下（Y3S2）的 optsUS 三個選項一律記 khh ['Y3S','yes']（KX_US_YES，AA 2026-11-10 23:4x：七月第 3 天「七月你空哪天。」照舊發）。
- 朋友版 thenIf｛if, lines｝（學姊大三上，1cf434dee）：選項演完（then 之後）照條件多說的；if 只認得 SIS_FU（termend_lines.js 的 SIS_FU）。
- 鉤子（AA 11-10 回 LAWWW，不在稿上）：子晴女朋友版 Q6 通用格（大一下）——選「（現在玩。）」＝鉤子整個不出（opts 的 hook:'skip'），
  另外兩個＝不念 say、直接出選項（hook:'nosay'）；那一頓記 hookTerm:'Y1S2'（只有大一下的鉤子「要不要玩？」這樣）。以安女朋友版大二下（京都）在 src/termend3d.js 的 S.HOOK_NOSAY。

**只匯入白名單那一筆 `people` 列的人**（gf／table／confess 各一份名單）：沒列的人（重寫中的沛珊、芷若的心意邀約）不寫進 TERMEND_OPTS，
遊戲照 src/data/termend_lines.js 現在的字、一個字都不動。
- 「她先說」的告白（SHE-FIRST-1110，LAWWW 2026-11-10 23:26）→ TERMEND_OPTS.HEART[人]＝{mode:'sheFirst', invite, invite2, table, tableOpts, (walk, walkOpts, guess), she,
  confessOpts[{t, result, yesLead／re, fx}], yes, she2, yes2…}：
  芷若＝AA_748 的 HEART／tableOpts／confessOpts.heroine_02（白名單 people.heart 列她才匯；atBar：在吧台、不走路；inviteHeart 取代邀約句，星期和時間照 over 的說明換；closeAdd＝inviteNote 的收尾旁白）；
  沛珊＝docs/story_planning/AA_751_peishan_termend.json 的 HEART（**只認 PS_SHA 那一版**；白名單 people.heart）。播放 src/termend3d.js 的 S.sheFirst。
- 沛珊其他段（同一份 AA_751，白名單那一筆的 people）：gf → TERMEND_OPTS.GF.classmate_peishan（table＋tableByTerm；大三下「那我留到明天。」的 nextMorning／alt）；
  friend → TERMEND_OPTS.FRIEND[學期].classmate_peishan（friend_v2 五頓；大三上 hookNoSay）；lines → TERMEND_OPTS.LINES.classmate_peishan（FRIEND.y1s1、手機句；termend_lines.js 照抄同字）；
  fallback（電影通用回話）在 tools/movie/import_movie_plots.py。AA_749 那幾個檔的白名單列沛珊＝停下來（她只從 AA_751@PS_SHA）。
稿上有工具不認得的欄位＝停下來（先改這支工具和 src/termend3d.js），不會默默丟掉。

寫給程式的條件（if）：Q6／noQ6（子晴的遊戲）、SNOWQ（美國路線下雪那天）、YOUPAY／noYOUPAY（學姊 11/6「下次你請」）、YT_MET_JOB、
C10（大二暑假加州）、US／noUS（美國路線）、summer（下學期末）、term:<學期>、sisGrad／sisPreGrad（學姊上法研所 2026-09 以後／以前）。播放在 src/termend3d.js。

用法：python3 tools/story/import_termend_opts.py [--check]"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

GF_PATH = 'docs/story_planning/AA_749_termend_gf_v2.json'
HEART_PATH = 'docs/story_planning/AA_748_termend_heart_v2.json'
KX_PATH = 'docs/story_planning/AA_749_termend_kx_v2.json'
FRIEND_PATHS = ['docs/story_planning/AA_749_termend_friend_v2_%s.json' % k for k in ('Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2_Y4S1')]
PS_PATH = 'docs/story_planning/AA_751_peishan_termend.json'   # 沛珊重寫（使用者 X327，PEISHAN-VOICE-1110）
PS_SHA = '768b9a131'   # 沛珊的稿**只認這一版**（LAWWW 2026-11-10：更舊的版本是使用者糾正以前的「看到食物就評論」，不匯）；AA 再改稿＝先改這一行和白名單。2026-11-11：33a1769f8 → 768b9a131（AA 補大四下 6/8 台南那一頓 GF.tableByTerm.Y4S2；其他段兩版一樣）
PS_GF_TERMS = ['Y4S2']   # 沛珊女朋友版多的學期：大四下 6/8 台南那一頓（ev_ps_termend_y4s2，src/r2y4b3d.js 的 R2Y4B.psDinner 演；別人的大四下沒有這種飯，TERMS 不加）
PS = 'classmate_peishan'
OUT = 'src/data/termend_opts.js'
TERMS = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y5S1']
IFS = {'Q6', 'noQ6'}
FR_IFS = {'ZR_LAST', 'noZR_LAST', 'noUS', 'noJP'}
KX_KEY = {'Y2S1': 'Y2W', 'Y2S2': 'Y2S', 'Y3S1': 'Y3W', 'Y3S2': 'Y3S', 'Y4S1': 'Y4W'}   # 那一頓問的是哪一次寒暑假（termend_lines.js KX_ASK 的 khh[0]）
# 明確的例外（AA 2026-11-10 23:4x 回覆 LAWWW）：可昕大三下（Y3S2）美國路線的 optsUS 三個選項都要記 KX_KHH true（＝khh ['Y3S','yes']，和臺灣路線答應的存檔值一樣）——
# 他八月才出發，七月第 3 天那則「七月你空哪天。」照舊要發（src/kx_khh3d.js）。稿（1cf434dee）的 optsUS 還沒有 set，AA 之後才補：沒寫＝一律補 yes；
# 之後補上 {KX_KHH: true} 就一致、不衝突，寫別的＝停下來。
KX_US_YES = {'Y3S2'}


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_termend_opts：' + m)


def line(x, where):
    if isinstance(x, str) and x.strip():
        return IG.read_fix(x)
    if isinstance(x, dict) and set(x) == {'narr'} and isinstance(x['narr'], str) and x['narr'].strip():
        return {'narr': IG.read_fix(x['narr'])}
    die(f'{where}：行要是字串或 {{narr}}（{json.dumps(x, ensure_ascii=False)[:80]}）')


def lines(a, where, empty=False):
    if not isinstance(a, list) or (not a and not empty):
        die(f'{where}：要是陣列')
    return [line(x, where) for x in a]


def fx(v, where):
    if v is None:
        return None
    if not isinstance(v, dict) or set(v) - {'fr', 'love'} or not all(isinstance(n, int) for n in v.values()):
        die(f'{where}：fx 只能是 {{fr, love}} 整數')
    v = {k: n for k, n in v.items() if n}
    return v or None


def opt(o, where, extra=(), ifs=IFS):
    bad = set(o) - {'t', 're', 'fx', 'if', 'time'} - set(extra)
    if bad:
        die(f'{where}：不認得的欄位 {sorted(bad)}')
    if not isinstance(o.get('t'), str) or not o['t'].strip():
        die(f'{where}：選項要有 t')
    r = {'t': IG.read_fix(o['t']), 're': lines(o.get('re'), where + '.re')}
    f = fx(o.get('fx'), where)
    if f:
        r['fx'] = f
    if 'if' in o:
        if o['if'] not in ifs:
            die(f'{where}：if 只認得 {sorted(ifs)}（{o["if"]}）')
        r['if'] = o['if']
    if 'time' in o:   # 「+15 分鐘」：選了以後時間多走那麼久
        m = re.fullmatch(r'\+(\d+) 分鐘', o['time'])
        if not m:
            die(f'{where}：time 只認得「+N 分鐘」（{o["time"]}）')
        r['adv'] = round(int(m.group(1)) / 60, 4)
    return r


def opts(a, where, extra=()):
    if not isinstance(a, list) or len(a) < 2:
        die(f'{where}：opts 至少兩個')
    return [opt(o, f'{where}[{i}]', extra=extra) for i, o in enumerate(a)]


def kx_opts(a, term, where, us=False):
    """可昕的選項：set → khh／y5（存檔值和原本 KX_ASK 二選一記的一樣）；美國路線那一組不記"""
    O = opts(a, where, extra=('set',) if (not us or term in KX_US_YES) else ())
    if us:
        if term in KX_US_YES:   # 大三下美國路線：三個選項都記 KX_KHH true（稿沒寫 set＝一律補 yes；稿補上了要一致）
            for i, (o, r) in enumerate(zip(a, O)):
                if 'set' in o and o['set'] != {'KX_KHH': True}:
                    die(f'{where}[{i}].set：大三下美國路線只認得 {{KX_KHH: true}}（AA 2026-11-10 23:4x）（{json.dumps(o["set"], ensure_ascii=False)}）')
                r['khh'] = [KX_KEY[term], 'yes']
        return O
    for i, (o, r) in enumerate(zip(a, O)):
        s, w = o.get('set'), f'{where}[{i}].set'
        if term == 'Y5S1':
            if s != {'KX_Y5_CALL': True}:
                die(f'{w}：大五上只認得 {{KX_Y5_CALL: true}}（{json.dumps(s, ensure_ascii=False)}）')
            r['y5'] = 'sat'
        else:
            if not isinstance(s, dict) or set(s) != {'KX_KHH'} or not isinstance(s['KX_KHH'], bool) or term not in KX_KEY:
                die(f'{w}：只認得 {{KX_KHH: true／false}}（{json.dumps(s, ensure_ascii=False)}）')
            r['khh'] = [KX_KEY[term], 'yes' if s['KX_KHH'] else 'no']
    return O


def quoted(note, pat, where):
    m = re.search(pat, note or '')
    if not m:
        die(f'{where}：note 改了（找不到 {pat}），先改這支工具')
    return [IG.read_fix(g) for g in m.groups()]


def gf_entry(who, key, e):
    """一頓飯：{says:[{if?, say}], opts, after?:[{if, say, opts?}]}"""
    where = f'GF.{who}.{key}'
    known = {'say', 'opts', 'note', 'sayQ6', 'sayByKind', 'sayMore', 'snow'}
    if set(e) - known:
        die(f'{where}：不認得的欄位 {sorted(set(e) - known)}')
    says = []
    if 'sayQ6' in e:   # 子晴：聽過她在做遊戲（Q6）的開頭
        says.append({'if': 'Q6', 'say': lines(e['sayQ6'], where + '.sayQ6')})
    if 'sayByKind' in e:   # 語彤：大二上、下學期末（夏天）的開頭不一樣；其他照 say
        K = e['sayByKind']
        if set(K) - {'summer'} - set(TERMS):
            die(f'{where}.sayByKind：只認得 summer 和學期（{sorted(K)}）')
        for k in sorted(K, key=lambda k: k == 'summer'):   # 寫學期的先比
            says.append({'if': 'summer' if k == 'summer' else 'term:' + k, 'say': lines(K[k], f'{where}.sayByKind.{k}')})
    says.append({'say': lines(e.get('say'), where + '.say')})
    r = {'says': says, 'opts': opts(e.get('opts'), where + '.opts', extra=('nextMorning', 'alt') if who == PS else ())}
    if who == PS:   # 沛珊大三下「那我留到明天。」：nextMorning＝跳到隔天早上演那幾行、回臺北；alt＝隔天有不能錯過的事時改出的選項（src/termend3d.js S.gfPrep）
        for i, (o, q) in enumerate(zip(e['opts'], r['opts'])):
            w = f'{where}.opts[{i}]'
            if ('nextMorning' in o) != ('alt' in o):
                die(f'{w}：nextMorning 和 alt 要一起寫')
            if 'nextMorning' in o:
                nm = o['nextMorning']
                if not isinstance(nm, dict) or set(nm) != {'where', 'lines'} or not isinstance(nm['where'], str) or '（沒有現成背景就用深色底）' not in nm['where']:
                    die(f'{w}.nextMorning：只認得 {{where（…（沒有現成背景就用深色底）），lines}}')
                q['nextMorning'] = {'where': IG.read_fix(nm['where'].replace('（沒有現成背景就用深色底）', '')), 'lines': lines(nm['lines'], w + '.nextMorning.lines')}
                q['alt'] = opt(o['alt'], w + '.alt')
    note = e.get('note', '')
    after = []
    if who == PS and key == 'Y4S2':   # note：祐廷延畢的存檔（大五上還在學）第一句改用 note 裡那一句（DELAYED＝現有的延畢判斷，src/termend3d.js S.optIf）；第二句照 say
        if '（ev_ps_termend_y4s2' not in note or len(says[-1]['say']) != 2 or says[-1]['say'][0] != '你要畢業了欸，我還有兩年。':
            die(f'{where}：note／say 改了，先改這支工具')
        says.insert(len(says) - 1, {'if': 'DELAYED', 'say': [quoted(note, r'第一句「你要畢業了欸」請照現有的延畢判斷改用「([^」]+)」', where)[0], says[-1]['say'][1]]})
        note = ''
    if who == 'heroine_04' and key == 'table':   # AA 11-10：Q6 通用格（大一下）——選「（現在玩。）」鉤子整個不出；另外兩個不念鉤子的 say、直接出選項
        Q = [o for o in r['opts'] if o.get('if') == 'Q6']
        play = [o for o in Q if o['t'] == '（現在玩。）']
        if len(Q) != 3 or len(play) != 1:
            die(f'{where}：Q6 那三個選項改了（找不到「（現在玩。）」），先改這支工具')
        for o in Q:
            o['hook'] = 'skip' if o is play[0] else 'nosay'
        r['hookTerm'] = 'Y1S2'
    if who == 'heroine_03' and key == 'table':   # note：選「我去」＝多記一個旗標 YT_DINNER_YES
        m = re.search(r'選「我去」＝多記一個旗標 (\w+)', note)
        hit = [o for o in r['opts'] if o['t'].startswith('「我去。')]
        if not m or len(hit) != 1:
            die(f'{where}：note 的旗標那一句改了，先改這支工具')
        hit[0]['set'] = m.group(1)
    elif who == 'heroine_05' and key == 'Y2S1':   # note：她請的時候（沒有 YOUPAY）選項後面多一句；玩家請的照現有 lastByTerm
        after.append({'if': 'noYOUPAY', 'say': quoted(note, r'她請的時候多一句「([^」]+)」', where)})
    elif 'note' in e and not (who == 'heroine_04' and key == 'Y5S1') and not (who == PS and key == 'Y4S2'):   # 子晴大五上的 note 是 D116 的說明，不是台詞
        die(f'{where}：有新的 note，先看要不要接（{note[:40]}）')
    if 'sayMore' in e and not (who == 'heroine_05' and key == 'Y4S1'):
        die(f'{where}：sayMore 只有學姊大四上（XM3、BK470 照舊接在選項後面，寫在 termend3d.js）')
    if 'snow' in e:   # 學姊大四上：美國路線下雪那天「回去再跟你說」的（SNOWQ）多一段，自己有選項
        s = e['snow']
        if set(s) - {'if', 'say', 'opts', 'note'} or not str(s.get('if', '')).startswith('SNOWQ'):
            die(f'{where}.snow：欄位改了')
        after.append({'if': 'SNOWQ', 'say': lines(s.get('say'), where + '.snow.say'), 'opts': opts(s.get('opts'), where + '.snow.opts')})
    if after:
        r['after'] = after
    return r


def build_gf(src, people, ps=None):
    out = {}
    if PS in people:
        die(f'{GF_PATH}：沛珊不從這個檔匯入（使用者 X327 重寫；她的女朋友版在 {PS_PATH}）')
    todo = [(who, src['GF'].get(who)) for who in people]
    if ps and ps[2].get('gf'):   # 沛珊：AA_751 的 GF（只認 PS_SHA）
        if ps[2]['gf'] != [PS]:
            die(f'{PS_PATH}：people.gf 只能是 [{PS}]')
        g = dict(ps[0].get('GF') or {})
        if not str(g.pop('invite', '')).startswith('照現有各學期的邀約') or '大三下選項二「那我留到明天」有 nextMorning' not in str(g.pop('note', '')):
            die(f'{PS_PATH}：GF.invite／GF.note 改了，先改這支工具')
        todo.append((PS, g))
    for who, g in todo:
        if not g:
            die(f'GF.{who}：稿上沒有這個人')
        if set(g) - {'table', 'tableByTerm'}:
            die(f'GF.{who}：不認得的欄位 {sorted(set(g) - {"table", "tableByTerm"})}')
        bt = g.get('tableByTerm', {})
        TT = TERMS + (PS_GF_TERMS if who == PS else [])
        if set(bt) - set(TT):
            die(f'GF.{who}.tableByTerm：不認得的學期 {sorted(set(bt) - set(TT))}')
        out[who] = {'table': gf_entry(who, 'table', g['table']), 'tableByTerm': {t: gf_entry(who, t, bt[t]) for t in sorted(TT) if t in bt}}
    return out


def build_table(src, people):
    out = {}
    for who in people:
        e = src['tableOpts'].get(who)
        where = f'tableOpts.{who}'
        if not e:
            die(f'{where}：稿上沒有這個人')
        if set(e) - {'after', 'afterNoQ6', 'opts', 'note'}:
            die(f'{where}：不認得的欄位')
        r = {'after': [IG.read_fix(e[k]) for k in ('after', 'afterNoQ6') if k in e], 'opts': opts(e['opts'], where + '.opts')}
        if who == 'heroine_05':   # note：第三個選項的「論文」只在她上法研所以後（2026-09 起）；大四那年換一組
            t2, re2 = quoted(e.get('note', ''), r'大四那年換成「([^」]+)」，她回「([^」]+)」', where)
            hit = [i for i, o in enumerate(r['opts']) if '論文' in o['t']]
            if len(hit) != 1:
                die(f'{where}：找不到「論文」那個選項')
            o = r['opts'][hit[0]]
            o['if'] = 'sisGrad'
            alt = {'t': '「' + t2 + '」', 're': [re2], 'if': 'sisPreGrad'}
            if 'fx' in o:
                alt['fx'] = dict(o['fx'])
            r['opts'].insert(hit[0] + 1, alt)
        elif 'note' in e:
            die(f'{where}：有新的 note，先看要不要接')
        out[who] = r
    return out


def build_confess(src, people):
    out = {}
    for who in people:
        e = src['confessOpts'].get(who)
        where = f'confessOpts.{who}'
        if not e or set(e) - {'opts', 'note'}:
            die(f'{where}：稿上沒有這個人，或有不認得的欄位')
        O = []
        for i, o in enumerate(e['opts']):
            w = f'{where}.opts[{i}]'
            if set(o) - {'t', 'yesLead', 'fx', 'if'}:
                die(f'{w}：不認得的欄位')
            r = {'t': IG.read_fix(o['t']), 'yesLead': lines(o.get('yesLead'), w + '.yesLead', empty=True)}
            f = fx(o.get('fx'), w)
            if f:
                r['fx'] = f
            if 'if' in o:
                if o['if'] not in IFS:
                    die(f'{w}：if 只認得 {sorted(IFS)}')
                r['if'] = o['if']
            O.append(r)
        if who == 'heroine_03':   # note：第二個選項只在 YT_MET_JOB 的存檔出現；其他存檔照原本的第二個選項
            if '第二個選項只在 YT_MET_JOB' not in e.get('note', ''):
                die(f'{where}：note 改了，先改這支工具')
            O[1]['if'] = 'YT_MET_JOB'
            O[1]['orig'] = 1   # 條件不合＝這一格照遊戲原本的那一個選項（沒有 yesLead、fx）
        out[who] = {'opts': O}
    return out


def conf_opts(a, where):
    """「她先說」模式的三個回應：{t, result: yes／think, yesLead?（yes）, re?（think）, fx?}"""
    if not isinstance(a, list) or len(a) < 2:
        die(f'{where}：至少兩個')
    O = []
    for i, o in enumerate(a):
        w = f'{where}[{i}]'
        if set(o) - {'t', 'result', 'yesLead', 're', 'fx'}:
            die(f'{w}：不認得的欄位 {sorted(set(o) - {"t", "result", "yesLead", "re", "fx"})}')
        if o.get('result') not in ('yes', 'think') or not isinstance(o.get('t'), str) or not o['t'].strip():
            die(f'{w}：要有 t 和 result（yes／think）')
        r = {'t': IG.read_fix(o['t']), 'result': o['result']}
        if o['result'] == 'yes':
            if 're' in o:
                die(f'{w}：yes 的選項用 yesLead，不用 re')
            r['yesLead'] = lines(o.get('yesLead', []), w + '.yesLead', empty=True)
        else:
            if 'yesLead' in o:
                die(f'{w}：think 的選項用 re，不用 yesLead')
            r['re'] = lines(o.get('re'), w + '.re')
        f = fx(o.get('fx'), w)
        if f:
            r['fx'] = f
        O.append(r)
    if sum(1 for o in O if o['result'] == 'think') != 1 or not any(o['result'] == 'yes' for o in O):
        die(f'{where}：要剛好一個 think、至少一個 yes')
    return O


THINK_MERGED = '（併進 confessOpts 第三個的 re）'


def heart_zr(src):
    """芷若（AA_748 HEART／tableOpts／confessOpts 的 heroine_02）：她先說、在吧台（不走路）、寫在杯套上"""
    who, where = 'heroine_02', 'HEART.heroine_02'
    e = (src.get('HEART') or {}).get(who)
    known = {'why', 'place', 'table', 'she', 'think', 'invite2', 'she2', 'yes2', 'over', 'inviteHeart', 'inviteNote', 'yes', 'yesNote'}
    if not e or set(e) - known:
        die(f'{where}：稿上沒有，或有不認得的欄位 {sorted(set(e or {}) - known)}')
    if e.get('think') != THINK_MERGED:
        die(f'{where}.think：要是「{THINK_MERGED}」（她先說的模式沒有另外的 think 句）')
    if '不走到巷口，walk 拿掉，告白在吧台' not in e.get('place', ''):
        die(f'{where}.place 改了（找不到「不走到巷口，walk 拿掉，告白在吧台」），先改這支工具')
    m = re.search(r'收尾旁白加一句：(（[^（）]+）)', e.get('inviteNote', ''))
    if not m or '取代這一場原本的邀約句' not in e['inviteNote']:
        die(f'{where}.inviteNote 改了，先改這支工具')
    ov = e.get('over', '')
    if '用 inviteHeart' not in ov or '禮拜五十點／禮拜四十點' not in ov or '大二下' not in ov or '句子不變' not in ov:
        die(f'{where}.over 改了，先改這支工具')
    inv, inv2 = IG.read_fix(e['inviteHeart']), IG.read_fix(e['invite2'])
    if inv.count('禮拜五') != 1 or not inv.startswith('這禮拜五') or inv2 != '禮拜五九點。老地方。':
        die(f'{where}：inviteHeart／invite2 改了，先改這支工具（星期、時間照學期換的那幾格）')
    # over：「星期和時間照那一學期她的班換（禮拜五十點／禮拜四十點）」——大一上～大二上她晚班到 22:00（十點），大三下只排週四到 22:00（禮拜四十點），
    # 其他（大二下代班）照稿 21:00 的字。大二下的邀約是週五晚上才到、飯在下一個週五（TE-FRI-SAME-NIGHT-1104），照 AA_689 第五節同一格的處理「這禮拜五」→「下禮拜五」。
    r = {'mode': 'sheFirst', 'atBar': True,
         'invite': {'gen': inv, 'byTerm': {'Y2S2': inv.replace('這禮拜五', '下禮拜五', 1), 'Y3S2': inv.replace('禮拜五', '禮拜四', 1)}},
         'invite2': {'gen': inv2, 'byTerm': dict({t: inv2.replace('九點', '十點') for t in ('Y1S1', 'Y1S2', 'Y2S1')}, Y3S2=inv2.replace('禮拜五', '禮拜四').replace('九點', '十點'))},
         'table': lines(e['table'], where + '.table'), 'she': lines(e['she'], where + '.she'), 'yes': lines(e['yes'], where + '.yes'),
         'she2': lines(e['she2'], where + '.she2'), 'yes2': lines(e['yes2'], where + '.yes2'), 'closeAdd': IG.read_fix(m.group(1))}
    t = (src.get('tableOpts') or {}).get(who)
    if not t or set(t) - {'after', 'opts'} or IG.read_fix(t.get('after', '')) != r['table'][-1]:
        die(f'tableOpts.{who}：稿上沒有、有不認得的欄位，或 after 不是飯桌的最後一句')
    r['tableOpts'] = opts(t['opts'], f'tableOpts.{who}.opts')
    c = (src.get('confessOpts') or {}).get(who)
    if not c or set(c) - {'mode', 'opts'} or not str(c.get('mode', '')).startswith('她先說'):
        die(f'confessOpts.{who}：稿上沒有、有不認得的欄位，或 mode 不是「她先說」')
    r['confessOpts'] = conf_opts(c['opts'], f'confessOpts.{who}.opts')
    return r


def heart_ps(src):
    """沛珊（AA_751 HEART）：她先說——飯桌兩句＋選項 → 回家路上（三個入口都接到 guess）→ 猜 → 她說 → 三個回應"""
    where = f'HEART.{PS}'
    e = src.get('HEART')
    known = {'place', 'invite', 'decline', 'table', 'tableOpts', 'walk', 'walkOpts', 'guess', 'she', 'confessOpts', 'yes', 'think', 'invite2', 'she2', 'yes2', 'over_Y4S1', 'confessNote'}
    if not e or set(e) - known:
        die(f'{where}：稿上沒有，或有不認得的欄位 {sorted(set(e or {}) - known)}')
    if e.get('think') != THINK_MERGED or not str(e.get('place', '')).startswith('照舊') or not str(e.get('confessNote', '')).startswith('「她先說」的模式'):
        die(f'{where}：think／place／confessNote 改了，先改這支工具')
    r = {'mode': 'sheFirst', 'invite': IG.read_fix(e['invite']), 'decline': IG.read_fix(e['decline']), 'invite2': IG.read_fix(e['invite2']),
         'table': lines(e['table'], where + '.table'), 'tableOpts': opts(e['tableOpts'], where + '.tableOpts'), 'walk': lines(e['walk'], where + '.walk'),
         'she': lines(e['she'], where + '.she'), 'yes': lines(e['yes'], where + '.yes'), 'she2': lines(e['she2'], where + '.she2'), 'yes2': lines(e['yes2'], where + '.yes2'),
         'confessOpts': conf_opts(e['confessOpts'], where + '.confessOpts')}
    wo = e.get('walkOpts')
    if not isinstance(wo, dict) or set(wo) - {'note', 'opts'} or any(o.get('next') != 'guess' for o in wo.get('opts', [])):
        die(f'{where}.walkOpts：欄位改了（每個選項都要 next: guess）')
    r['walkOpts'] = opts(wo['opts'], where + '.walkOpts.opts', extra=('next',))
    g = e.get('guess')
    if not isinstance(g, dict) or set(g) - {'say', 'opts', 'note'}:
        die(f'{where}.guess：欄位改了')
    GO = opts(g['opts'], where + '.guess.opts', extra=('sheFrom',))
    for o, q in zip(g['opts'], GO):
        if 'sheFrom' in o:   # 選了這個：she 從這一句開始（前面的旁白照演、前面她說的句子不重講）
            sf = IG.read_fix(o['sheFrom'])
            if r['she'].count(sf) != 1:
                die(f'{where}.guess：sheFrom「{sf}」不在 she 裡')
            q['sheFrom'] = sf
    r['guess'] = {'say': lines(g['say'], where + '.guess.say'), 'opts': GO}
    y4 = e.get('over_Y4S1')
    if not isinstance(y4, dict) or set(y4) - {'she', 'answer', 'note'} or not isinstance(y4.get('answer'), list) or len(y4['answer']) != 2:
        die(f'{where}.over_Y4S1：欄位改了（she＋answer 兩個選項）')
    r['byTerm'] = {'Y4S1': {'she': lines(y4['she'], where + '.over_Y4S1.she'), 'answer': [IG.read_fix(t) for t in y4['answer']]}}
    return r


def ps_source(allow):
    """沛珊的稿：白名單有才讀，而且只認 PS_SHA 那一版"""
    if not any(e.get('path') == PS_PATH and e.get('status') == 'approved' for e in allow.get('files', [])):
        return None
    d, sha, P, why = source(PS_PATH, allow)
    if not (str(sha).startswith(PS_SHA) or PS_SHA.startswith(str(sha))):
        die(f'{PS_PATH}@{sha}：沛珊的稿只認 {PS_SHA}（使用者 X327 糾正以後的那一版）；要換版本先改這支工具的 PS_SHA')
    return d, sha, P, why


def build_heart(ht, hp, ps):
    """→ HEART{人:她先說的那一份}。people.heart 列的人才匯；沛珊只從 AA_751@PS_SHA"""
    out = {}
    want = hp.get('heart', [])
    if set(want) - {'heroine_02'}:
        die(f'{HEART_PATH}：people.heart 只認得 heroine_02（沛珊在 {PS_PATH}）')
    if 'heroine_02' in want:
        out['heroine_02'] = heart_zr(ht)
    if ps and ps[2].get('heart'):
        if ps[2]['heart'] != [PS]:
            die(f'{PS_PATH}：people.heart 只能是 [{PS}]')
        out[PS] = heart_ps(ps[0])
    return out


def build_kx(src):
    out = {}
    if set(src['KX']) - set(TERMS):
        die('KX：不認得的學期')
    for t in TERMS:
        e = src['KX'].get(t)
        if not e:
            continue
        where = f'KX.{t}'
        if set(e) - {'say', 'sayC10', 'sayUS', 'opts', 'optsUS', 'then', 'note'}:
            die(f'{where}：不認得的欄位 {sorted(e)}')
        says = [{'if': c, 'say': lines(e[k], f'{where}.{k}')} for k, c in (('sayC10', 'C10'), ('sayUS', 'US')) if k in e]
        says.append({'say': lines(e.get('say'), where + '.say')})
        O = kx_opts(e.get('opts'), t, where + '.opts')
        if 'optsUS' in e:   # 美國路線的那一組；opts＝臺灣路線
            if 'sayUS' not in e:
                die(f'{where}：optsUS 要配 sayUS')
            for o in O:
                o['if'] = 'noUS'
            O = [dict(o, **{'if': 'US'}) for o in kx_opts(e['optsUS'], t, where + '.optsUS', us=True)] + O
        r = {'says': says, 'opts': O}
        if 'then' in e:   # 選項之後她接著說
            r['then'] = lines(e['then'], where + '.then')
        out[t] = r
    return out


def fr_if(v, where):
    """朋友版稿上用文字寫的條件 → 程式認得的（src/termend3d.js S.optIf）"""
    for pre, c in (('沒有 ZR_LAST_SHIFT', 'noZR_LAST'), ('ZR_LAST_SHIFT', 'ZR_LAST'), ('不是美國路線', 'noUS')):
        if isinstance(v, str) and v.startswith(pre):
            return c
    die(f'{where}：不認得的 if（{v}），先改這支工具和 src/termend3d.js')


def friend_entry(term, who, e):
    """朋友版的一頓：{says:[{if?, say}], opts, then?, hookNoSay?}"""
    where = f'FRIEND.{term}.{who}'
    if set(e) - {'say', 'sayUS', 'opts', 'then', 'thenIf', 'note'}:
        die(f'{where}：不認得的欄位 {sorted(set(e) - {"say", "sayUS", "opts", "then", "thenIf", "note"})}')
    note = e.get('note', '')
    says = []
    if 'sayUS' in e:   # 學姊大四上：美國路線（現有 US4P 判斷）的開頭
        if 'US4P' not in note:
            die(f'{where}：sayUS 要在 note 寫照哪個判斷（現在只認得 US4P）')
        says.append({'if': 'US4P', 'say': lines(e['sayUS'], where + '.sayUS')})
    says.append({'say': lines(e.get('say'), where + '.say')})
    src = e.get('opts')
    if not isinstance(src, list) or len(src) < 2:
        die(f'{where}：opts 至少兩個')
    O = [opt(dict(o, **({'if': fr_if(o['if'], f'{where}.opts[{i}]')} if 'if' in o else {})), f'{where}.opts[{i}]', ifs=FR_IFS) for i, o in enumerate(src)]
    if term == 'Y3S1' and who == 'yu':   # Alison 大三上：note 寫「第三個選項：日本路線（3/25 出發）不出」
        if not re.match(r'第三個選項：日本路線（[^）]*）不出', note) or len(O) != 3 or 'if' in O[2]:
            die(f'{where}：note 的「日本路線不出」改了，先改這支工具')
        O[2]['if'] = 'noJP'
    elif note.startswith('第三個選項：') and '不出' in note:
        die(f'{where}：note 有新的「不出」條件，先改這支工具')
    r = {'says': says, 'opts': O}
    if 'then' in e:   # 選項之後她（他）接著說，後面才是鉤子、收尾
        r['then'] = lines(e['then'], where + '.then')
    if 'thenIf' in e:   # 選項演完以後照條件多說的（學姊大三上：SIS_FU＝朋友以上，「……收到信那天，我打給你。」）
        ti = e['thenIf']
        if not isinstance(ti, dict) or set(ti) != {'if', 'lines'} or not str(ti['if']).startswith('SIS_FU'):
            die(f'{where}.thenIf：只認得 {{if: SIS_FU…, lines}}')
        r['thenIf'] = {'if': 'SIS_FU', 'lines': lines(ti['lines'], where + '.thenIf.lines')}
    if '鉤子不念 say' in note or (who == PS and '請不念 say、直接出選項' in note):   # 柏翰大三下：飯桌已經講了補習班，鉤子那一句不念、直接出選項；沛珊大三上（去國小看課）同
        r['hookNoSay'] = True
    txt = json.dumps(r, ensure_ascii=False)
    alts = set(re.findall(r'\{[^{}"]*\|[^{}"]*\}', txt))
    if alts - {'{子晴學姊|一個學姊}'} or (alts and 'Q6' not in note):
        die(f'{where}：不認得的二選一寫法 {sorted(alts)}（只認得 {{子晴學姊|一個學姊}}＝照 Q6）')
    return r


def build_friend(allow):
    """→ (FRIEND{學期:{人:一頓}}, 來源清單, people{學期:[人]}, 說明)"""
    out, srcs, ppl, whys = {}, [], {}, []
    for path in FRIEND_PATHS:
        if not any(e.get('path') == path and e.get('status') == 'approved' for e in allow.get('files', [])):
            whys.append(f'{path}：不在白名單，不匯入')
            continue
        d, sha, P, why = source(path, allow)
        want = P.get('friend')
        if not isinstance(want, list):
            die(f'{path}：白名單那一筆的 people 要寫 friend（匯入哪幾個人）')
        if 'classmate_peishan' in want:
            die(f'{path}：沛珊不從這個檔匯入（使用者 X327 重寫；她的朋友版只認 {PS_PATH}@{PS_SHA}）')
        terms = [k for k in d if k != '_meta']
        if set(terms) - set(TERMS):
            die(f'{path}：不認得的學期 {sorted(set(terms) - set(TERMS))}')
        used = set()
        for t in terms:
            if t in out:
                die(f'{path}：{t} 已經在別的檔匯入過')
            out[t] = {who: friend_entry(t, who, e) for who, e in d[t].items() if who in want}
            ppl[t] = list(out[t])
            used |= set(out[t])
        if set(want) - used:
            die(f'{path}：白名單列了稿上沒有的人 {sorted(set(want) - used)}')
        srcs.append(f'{path}@{sha}')
        whys.append(why)
    ps = ps_source(allow)
    if ps and ps[2].get('friend'):   # 沛珊的朋友版五頓：AA_751 的 friend_v2（只認 PS_SHA），接進已經匯的朋友版
        if ps[2]['friend'] != [PS]:
            die(f'{PS_PATH}：people.friend 只能是 [{PS}]')
        fv = ps[0].get('friend_v2') or {}
        if not fv or set(fv) - set(TERMS):
            die(f'{PS_PATH}：friend_v2 沒有，或有不認得的學期')
        for t, e in fv.items():
            if PS in out.setdefault(t, {}):
                die(f'{PS_PATH}：{t} 已經有沛珊')
            out[t][PS] = friend_entry(t, PS, e)
            ppl.setdefault(t, []).append(PS)
    return {t: out[t] for t in TERMS if t in out}, srcs, {t: ppl[t] for t in TERMS if t in ppl}, '／'.join(whys)


def build_lines(ps):
    """沛珊的單句（AA_751 FRIEND.y1s1、phone）→ LINES：src/data/termend_lines.js 照抄同樣的字（tests/peishan_termend_1110_unit.js 逐句比）"""
    if not (ps and ps[2].get('lines') is True):
        return {}
    d = ps[0]
    f, ph = d.get('FRIEND') or {}, d.get('phone') or {}
    if set(f) != {'y1s1', 'gen', 'no', 'note'} or not f['note'].startswith('只換 y1s1'):
        die(f'{PS_PATH}：FRIEND 的欄位改了，先改這支工具')
    if set(ph) != {'NOPE.partner', 'NOPE.knows', 'NOPE.low', 'REPLY（玩家婉拒）', 'ENDED', 'note'}:
        die(f'{PS_PATH}：phone 的欄位改了，先改這支工具（{sorted(ph)}）')
    rf = IG.read_fix
    return {PS: {'FRIEND': {'y1s1': rf(f['y1s1']), 'gen': rf(f['gen']), 'no': rf(f['no'])},
                 'NOPE': {'partner': rf(ph['NOPE.partner']), 'knows': rf(ph['NOPE.knows']), 'low': rf(ph['NOPE.low'])},
                 'AUTO_NO': rf(ph['REPLY（玩家婉拒）']), 'ENDED': rf(ph['ENDED'])}}


def source(path, allow):
    hits = [e for e in allow.get('files', []) if e.get('path') == path and e.get('status') == 'approved']
    if not hits:
        die(f'{path}：不在匯入白名單')
    e = hits[-1]
    ok, why = IG.allowed(path, e['sha'], allow)
    if not ok:
        die(why)
    P = e.get('people')
    if not isinstance(P, dict):
        die(f'{path}：白名單那一筆要寫 people（匯入哪幾個人）')
    return json.loads(git('show', f'{e["sha"]}:{path}')), e['sha'], P, why


def main():
    allow = IG.load(ROOT)
    gf, gsha, gp, w1 = source(GF_PATH, allow)
    ht, hsha, hp, w2 = source(HEART_PATH, allow)
    kx_on = any(e.get('path') == KX_PATH and e.get('status') == 'approved' for e in allow.get('files', []))
    kx, ksha, kp, w3 = source(KX_PATH, allow) if kx_on else ({'KX': {}}, None, {}, f'{KX_PATH}：不在白名單，不匯入')
    kx_on = kx_on and kp.get('kx') is True
    FR, fsrc, fppl, w4 = build_friend(allow)
    ps = ps_source(allow)
    psrc, w5 = ([f'{PS_PATH}@{ps[1]}'], ps[3]) if ps else ([], f'{PS_PATH}：不在白名單，不匯入')
    HT = build_heart(ht, hp, ps)
    data = {'src': {'gf': f'{GF_PATH}@{gsha}', 'heart': f'{HEART_PATH}@{hsha}', 'kx': f'{KX_PATH}@{ksha}' if kx_on else None, 'friend': fsrc},
            'people': {'gf': gp.get('gf', []), 'table': hp.get('table', []), 'confess': hp.get('confess', []), 'kx': kx_on, 'friend': fppl, 'heart': list(HT)},
            'ps': {k: (ps[2].get(k) or False) for k in ('heart', 'gf', 'friend', 'lines')} if ps else None,
            'FRIEND': FR, 'HEART': HT, 'LINES': build_lines(ps),
            'GF': build_gf(gf, gp.get('gf', []), ps), 'TABLE': build_table(ht, hp.get('table', [])), 'CONFESS': build_confess(ht, hp.get('confess', [])),
            'KX': build_kx(kx) if kx_on else {}}
    if psrc:
        data['src']['ps'] = psrc[0]
    js = ('/* 自動產生：tools/story/import_termend_opts.py（' + data['src']['gf'] + '、' + data['src']['heart'] + ('、' + data['src']['kx'] if kx_on else '') + ''.join('、' + x for x in fsrc + psrc) + '）。不要手改，改企劃稿再重新匯入。\n'
          '   期末飯的選項（TERMEND-OPTS-1110，使用者 X324）：女朋友版 GF、心意邀約飯桌句之後 TABLE、祐廷說出來的選項 CONFESS、可昕 KX、朋友版 FRIEND[學期][人]、「她先說」的告白 HEART[人]（SHE-FIRST-1110）；只有 people 列的人，其他人照 termend_lines.js。播放 src/termend3d.js */\n'
          "'use strict';\nconst TERMEND_OPTS=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import aa959 as _AA959   # AA_959（DLG-FULL-REVIEW-1110，LAWWW 11-13 選 (a)）：「今天」開頭砍半＋「……」開頭減量，源稿不動、寫檔前最後一步照 docs/handoff/AA_959_overlay.json 換（tools/story/aa959.py）
    js = _AA959.layer(js, 'termend_opts.js')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            die(f'{OUT} 和來源不一樣：重新匯入')
        print('OK', w1, '／', w2, '／', w3, '／', w4, '／', w5)
        return
    open(p, 'w', encoding='utf-8').write(js)
    n = sum(1 + len(v['tableByTerm']) for v in data['GF'].values())
    print('她先說的告白：', '、'.join(HT) or '（沒有）')
    print('寫入', OUT, f'女朋友版 {len(data["GF"])} 人 {n} 頓、飯桌選項 {len(data["TABLE"])} 人、告白選項 {len(data["CONFESS"])} 人、可昕 {len(data["KX"])} 頓、朋友版 ' + '、'.join(f'{t} {len(v)} 人' for t, v in FR.items()))


if __name__ == '__main__':
    main()
