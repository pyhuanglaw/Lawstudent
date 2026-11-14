#!/usr/bin/env python3
"""AA_720：決定拍打開的場景（AA_718／AA_719 的 opens 全部寫成可以演的台詞）＋尾聲分版本（endings，使用者 Q3）——AA720-DECIDE-OPENED-1108。
企劃 AA_720（docs/story_planning/AA_720_decide_opened_scenes.json，企劃線）→ src/data/aa720.js（AA720）。播放：src/aa720_3d.js。
- 稿的內容（events、七個區塊、endings）一字不改，只照 import_guard.read_fix（換名：兩點半 Café → 2:30 AM）；_meta 不進遊戲。
- 稿裡寫成文字的時間、條件（「決定那天＋2 天 21:00」「PS_REUNION 有值，而且……」）：播放程式照下面 CFG 寫成遊戲的規則；
  這裡逐項核對稿上的字還是那樣（日期、時間、句子），稿改了就停下來，不猜。
- 寫在說明文字裡的句子（「……你要來嗎？」「這週你有出現。」、E07 多的那一句……）照 QUOTES 抽出來，核對稿上真的有「那一句」。
- quietMove（4f37a68bb）：replaceFirst.from 要是 AA_712 學姊第 6 拍（src/data/heroine_arcs.js）現在的第一句。
- ee689cfb8（AA720-WIRING-1108）：kx_waited_after（等了一個小時以後兩天的短回覆）、zq_intern.demoJan9（1/9 demo intern 版）進遊戲；wiringAnswers 是 AA 回 LAWWW 的說明，不進遊戲（第四封信那一句照 QUOTES 抽）。
- 075eae472（AA720-WIRING-1108 第三輪）：an1_later（以安 AN-1 later 版，含預設值）進遊戲；wiringAnswers2 是 AA 回 LAWWW 的說明，不進遊戲——
  1/9 demo 實習版三處（wiringAnswers2.3 shop／tainan／cat 各三句）照 DEMO3 抽進 cfg.demo3、Café 當面版「……獎學金拿到一半。」照 QUOTES 抽。
- 3e6a7ff71（wiringAnswers3，說明、不進遊戲）：選信版 9/28 電話開頭旁白、1/9 demo 保留的前半「資工系館的電腦教室。」照 QUOTES 抽（zrBdayLetterNarr、zqDemoKeep）；和別人交往中排除照 CHECKS 核對。
- 背景（BG）：要在 OUT.BG（src/outings3d.js）；沒有 3D、也沒有圖的用 dark（稿 _meta.format：沒有 3D 的用 background 暗底）。
白名單照 import_guard。用法：python3 tools/story/import_aa720.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG
IG.use_canon897()   # CANON-NO-ECON-1112 第四批：讀稿再照 AA_897 第 2 節換整句（tools/story/canon897_fix.json）

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_720_decide_opened_scenes.json'
OUT = 'src/data/aa720.js'
WHO = ('heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin')
EVENTS = ('ev_an_expo_together', 'ev_an_grad_think', 'ev_an_airport', 'ev_zr_call_mom', 'ev_zr_scholar_1', 'ev_zr_scholar_2',
          'ev_zr_return_airport', 'ev_zr_sendoff_airport', 'ev_yt_tell_mom', 'ev_yt_result_together', 'ev_zq_quit_intern',
          'ev_sis_last_night', 'ev_sis_alison_guess', 'ev_sis_alison_asks_zhe', 'ev_sis_grandma_dinner', 'ev_ps_before_leave',
          'ev_ps_station_sendoff', 'ev_kx_mock_interview', 'ev_kx_waited')
BLOCKS = ('zr_letters', 'zr_call', 'zq_intern', 'ps_result', 'kx_quiet', 'kx_eat', 'kx_slot')
REL = {'fam', 'comf', 'trust', 'npcRom'}
# 選項的 plan：true＝排那一場；字串＝稿上寫的另一種（播放程式照這張表做）
PLANS = {True, '+1天', '下一週', 'now', 'y3_an_sendoff', 'ev_ps_station_sendoff', '現在＋20 分鐘，公館捷運站（人在臺北才有這個選項）'}
# 稿上寫成文字的時間：(那一欄的路徑, 開頭要是這幾個字) —— 播放程式（src/aa720_3d.js）照這些時間排
AT = [
    ('events.ev_an_expo_together.plan.day', '2027-03-18'),
    ('events.ev_an_grad_think.invite.at', '決定那天 21:00'), ('events.ev_an_grad_think.plan.day', '隔天'),
    ('events.ev_an_airport.dm.at', '2028-03-24 22:30'),
    ('events.ev_zr_call_mom.variants.both.plan.day', '隔天'), ('events.ev_zr_call_mom.variants.tell.trigger', 'say 那天＋10 天起'),
    ('events.ev_zr_scholar_1.invite.at', '決定那天＋2 天 21:00'), ('events.ev_zr_scholar_1.plan.day', '那週四'),
    ('events.ev_zr_scholar_2.invite.at', 'ev_zr_scholar_1 那天＋10 天 21:00'), ('events.ev_zr_scholar_2.plan.day', '隔天'),
    ('events.ev_zr_return_airport.invite.at', '2028-02-14 21:00'), ('events.ev_zr_return_airport.plan.day', '2028-02-15'),
    ('events.ev_yt_tell_mom.at', '大一下第 9 週週六 15:00（2026-04-25'), ('events.ev_yt_tell_mom.phone.at', '第 9 週週日 21:00'), ('events.ev_yt_tell_mom.night.at', '那天 21:30'),
    ('events.ev_yt_result_together.invite.at', '2026-07-02 21:00'), ('events.ev_yt_result_together.plan.day', '2026-07-03'),
    ('events.ev_zq_quit_intern.at', '2026-10-16（五）22:10'), ('events.ev_zq_quit_intern.plan.h', '22:30（從現在起 20 分鐘內到）'), ('events.ev_zq_quit_intern.nextDay.at', '2026-10-17 20:00'),
    ('events.ev_sis_last_night.invite.at', '2026-02-01（日）16:00'), ('events.ev_sis_last_night.plan.day', '2026-02-01'), ('events.ev_sis_last_night.plan.hours', '到閉館'), ('events.ev_sis_last_night.after.at', '2026-02-02 17:30'),
    ('events.ev_sis_alison_guess.at', '決定那天＋5 天 22:00'),
    ('events.ev_sis_alison_asks_zhe.at', '決定那天以後，下一次公法讀書會散場'),
    ('events.ev_sis_grandma_dinner.at', '交往後、決定那天以後第三個週日'), ('events.ev_sis_grandma_dinner.plan.day', '那週日'),
    ('events.ev_ps_before_leave.invite.at', '2026-12-17（四）20:30'), ('events.ev_ps_before_leave.plan.day', '2026-12-17'),
    ('events.ev_ps_station_sendoff.msgAsk.at', '2026-12-17 23:00'), ('events.ev_ps_station_sendoff.plan.day', '2026-12-18'),
    ('events.ev_kx_mock_interview.plan.day', 'say 那天以後第一個週四'), ('events.ev_kx_mock_interview.result.at', 'plan 那天＋5 天 17:00'),
    ('events.ev_kx_waited.when', '決定那天的下一個學期第 3 週週六'), ('events.ev_kx_waited.ask.at', '那週六 10:00'), ('events.ev_kx_waited.showUp.cond', '16:15 以前到公館捷運站'), ('events.ev_kx_waited.late.at', '17:00（16:15 還沒到）'),
    ('zr_call.rule', '2027-09-07～2028-02-11，每週二、週五 22:25'),
    ('ps_result.at', '2027-08-06 09:58'), ('ps_result.rule', '只加這兩則（不用回、沒有選項）'),   # ee689cfb8：先傳兩則，psresults3d.js 原本 10:00 起的全部照演
    ('kx_waited_after.rule', 'ev_kx_waited 演完（或沒來）以後兩天，她回訊息的那一句換成下面輪流（照順序，用完從頭）；第三天起照常'),
    ('zq_intern.demoJan9.where', '1/9 資工系館 demo 那一場「第三關。橋是新的。」那一句'),
    ('kx_quiet.at', '決定那天＋8 天 21:00'),
    ('kx_eat.plan.day', '決定那天'), ('kx_eat.plan.h', '現在＋1 小時（最晚 21:00）'),
    ('an1_later.if', 'dec:heroine_01.jp_tell=later（含預設'), ('an1_later.group.at', '2027-03-19（五）21:00'), ('an1_later.group.th', 'g:noodle_team'),
    ('an1_later.group.cond', '祐廷在桌遊團群組（noodleGroup）'), ('an1_later.dm.at', '2027-03-19 21:20'), ('an1_later.dm.cond', '和以安 FAMILIAR 以上'),
    ('wiringAnswers2.3.default', '沒有 ZQ-2 值＝cat'), ('wiringAnswers2.7', '照舊打：選信的玩家 9/28 生日電話照原本來'),
    ('wiringAnswers3.2', '排除：選信、但那時和別人交往中的玩家，9/28 沒有這通電話'), ('wiringAnswers3.3', '不要整句換'),
    ('kx_slot.wed.slot', '週三 19:00～22:00'), ('kx_slot.wed.ask.at', '每週三 18:00'), ('kx_slot.sat.slot', '週六 13:00～17:00'), ('kx_slot.sat.ask.at', '每週六 11:00'),
]
# 寫在說明文字裡、要演出來的句子：名字 → (那一欄的路徑, 句子)；核對稿上有「句子」
QUOTES = {
    'zrAskAlt': ('events.ev_zr_sendoff_airport.open', '……你要來嗎？'),
    'zrAskOrig': ('events.ev_zr_sendoff_airport.open', '你說要來的。'),
    'zrClerkLeft': ('events.ev_zr_sendoff_airport.note', '她出國前放的。'),
    'zrLettersE07': ('zr_letters.e07', '信你都有去拿嗎？店員說你每次都站在櫃台前面看完才走。'),
    'zrCallE07': ('zr_call.e07', '每次十點半你都打來。……我手機的鬧鐘都不用設了。'),
    'kxWeekShown': ('events.ev_kx_waited.skip', '這週你有出現。'),
    'zqQuitNo': ('events.ev_zq_quit_intern.msgNo.note', '我辭掉實習了。'),
    'zqW5Pic': ('zq_intern.y2s1Moments.week5', '截圖：第一關的地圖，還是灰色的'),
    'zqW5Opt': ('zq_intern.y2s1Moments.week5', '第二關呢？'),
    'zqW5R1': ('zq_intern.y2s1Moments.week5', '還沒'),
    'zqW5R2': ('zq_intern.y2s1Moments.week5', '延長實習的錯'),
    'zqW5Cm': ('zq_intern.y2s1Moments.week5', '灰的？'),
    'zqW5CmR': ('zq_intern.y2s1Moments.week5', '顏色最後上'),
    'zqJ9shop': ('zq_intern.y2s1Moments.jan9', '一間五金行，鐵門拉起來一半'),
    'zqJ9tainan': ('zq_intern.y2s1Moments.jan9', '一條很窄的巷子，兩邊都是紅磚牆'),
    'zqJ9cat': ('zq_intern.y2s1Moments.jan9', '一隻貓走在溫州街上'),
    'zqJ9Cm': ('zq_intern.y2s1Moments.jan9', '好漂亮。'),
    'zqJ9CmR': ('zq_intern.y2s1Moments.jan9', '第二關。比第一關難'),
    'zqJ9Orig': ('zq_intern.y2s1Moments.jan9', '第三關，一隻貓站在一座橋上'),
    'zqW5Orig': ('zq_intern.y2s1Moments.week5', '第二關的地圖，還是灰色的'),
    'zqDemoOrig': ('zq_intern.demoJan9.where', '第三關。橋是新的。'),   # src/data/termend_lines.js C15.zq_demo 換掉的那一句（ee689cfb8）
    'zrLetter4Video': ('wiringAnswers.6', '二十五號晚上視訊。時間寫在這裡，你不要忘記。'),   # 交往中＋信：第四封（第一封是送機那一封）最後加這一句、12/25 視訊照舊
    # 075eae472
    'anLaterNoGroup': ('an1_later.noGroup', '我要申請日本交換。……先跟你說一聲。'),   # 不在桌遊團群組：私訊的第一句換成這一句（選項一樣）
    'zqDemoNarr': ('wiringAnswers2.3.rule', '一隻貓站在一座橋上'),   # termend_lines.js C15.zq_demo 換掉的三處（原本的字）
    'zqDemoFall': ('wiringAnswers2.3.rule', '你在橋的一半掉下去'),
    'zqDemoHard': ('wiringAnswers2.3.rule', '……第三關太難了。我回去改。'),
    'zrCafeAdmit': ('wiringAnswers2.5', '我錄取了。英國那邊的信來了。'),   # y2r2_3d.js ev_zhiruo_admitted 沒交往版那一句
    'zrScholarCafe': ('wiringAnswers2.5', '……獎學金拿到一半。'),   # ZR-1 scholar／both：接在那一句後面
    # 3e6a7ff71 wiringAnswers3
    'zrBdayOrigNarr': ('wiringAnswers3.1', '（明信片背面寫著：台灣晚上十點。）'),   # y2b3d.js S.bdayNarr 明信片版（照原本）
    'zrBdayLetterNarr': ('wiringAnswers3.1', '（台灣晚上十點，手機響了。）'),   # 選信版 9/28 電話開頭的旁白
    'zqDemoKeep': ('wiringAnswers3.3', '資工系館的電腦教室。'),   # 1/9 demo 第一句保留的前半（aa720_3d.js S.demoKeep）
}
# wiringAnswers2.3：1/9 demo 實習版三處照 ZQ-2 換（每個值三句，依序取代 QUOTES 的 zqDemoNarr、zqDemoFall、zqDemoHard 那三句）；沒有 ZQ-2 值＝cat
DEMO3 = ('wiringAnswers2.3', ('shop', 'tainan', 'cat'))
# 那一場的背景：OUT.BG 的鍵（地點字幕照稿 plan.place）；dark＝沒有 3D、也沒有圖
BG = {
    'ev_an_expo_together': 'boya_lecture_hall', 'ev_an_grad_think': 'library_b1', 'ev_zr_call_mom': 'dark', 'ev_zr_scholar_1': 'library_b1',
    'ev_zr_scholar_2': 'library_b1', 'ev_zr_return_airport': 'airport_arrival', 'ev_yt_tell_mom': 'wenzhou_teahouse',
    'ev_yt_result_together': 'library_gate_day', 'ev_zq_quit_intern': 'dark', 'ev_sis_last_night': 'dark', 'ev_sis_grandma_dinner': 'dark',
    'ev_ps_before_leave': 'wenzhou_tutoring', 'ev_ps_station_sendoff': 'dark', 'ev_kx_mock_interview': 'dark', 'ev_kx_waited': 'gongguan',
    'kx_eat': 'noodle_table', 'ev_sis_alison_asks_zhe': 'blur',
}
# 尾聲（endings）的 if：稿上的字 → 遊戲的條件（OR 裡面每一組是 AND）；dec: 只認真的演過、記了的決定（不是預設值、不是過了 before 的 late）
END_IF = {
    'PS_REUNION 有值，而且祐廷在沉默期傳過私訊（AA_723）': [['flag:PS_REUNION', 'psSilDM']],
    'dec:kexin.slot=show 而且 KX_WAITED＝late': [['dec:kexin.slot=show', 'flagIs:KX_WAITED=late']],
}
DEC = re.compile(r'^dec:([a-z0-9_]+)\.([a-z_]+)=([a-z_]+)((?: 或 [a-z_]+)*)$')
FRIEND_PARTNER = {'heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin'}


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def fix(x):
    if isinstance(x, str):
        return IG.read_fix(x)
    if isinstance(x, list):
        return [fix(v) for v in x]
    if isinstance(x, dict):
        return {k: fix(v) for k, v in x.items()}
    return x


def get(d, p):
    for k in p.split('.'):
        if not isinstance(d, dict) or k not in d:
            raise SystemExit(f'AA_720 {p}：沒有這一欄')
        d = d[k]
    return d


def line(v, w):
    if isinstance(v, str) and v.strip():
        return
    if isinstance(v, list) and len(v) == 2 and all(isinstance(t, str) and t.strip() for t in v):
        return
    raise SystemExit(f'{w}：要是字串或 [說話的人, 字]')


def lines(v, w, need=True):
    if v is None and not need:
        return
    if not isinstance(v, list) or (need and not v):
        raise SystemExit(f'{w}：要是非空的陣列')
    for i, t in enumerate(v):
        line(t, f'{w}[{i}]')


def opts(v, w):
    if not isinstance(v, list) or not v:
        raise SystemExit(f'{w}：要有選項')
    for i, o in enumerate(v):
        ww = f'{w}[{i}]'
        if not isinstance(o.get('t'), str) or not o['t'].strip():
            raise SystemExit(f'{ww}.t：要有字')
        lines(o.get('say'), ww + '.say', False)
        if 'plan' in o and o['plan'] not in PLANS:
            raise SystemExit(f'{ww}.plan「{o["plan"]}」：播放程式不認得（src/aa720_3d.js 要先寫這一種）')
        if set((o.get('rel') or {}).keys()) - REL:
            raise SystemExit(f'{ww}.rel：只認 {sorted(REL)}')
        if o.get('alt'):
            lines(o['alt'].get('say'), ww + '.alt.say')


def walk_opts(x, w):
    """稿裡所有 opts／opts2 都檢查一次（選項、她回的那幾句、plan、rel）"""
    if isinstance(x, dict):
        for k, v in x.items():
            if k in ('opts', 'opts2') and isinstance(v, list):
                opts(v, f'{w}.{k}')
            else:
                walk_opts(v, f'{w}.{k}')
    elif isinstance(x, list):
        for i, v in enumerate(x):
            walk_opts(v, f'{w}[{i}]')


def end_cond(c, w):
    if c in END_IF:
        return END_IF[c]
    m = DEC.match(c)
    if not m:
        raise SystemExit(f'{w}.if「{c}」：END_IF 沒有寫成遊戲的條件')
    vals = [m.group(3)] + [v for v in m.group(4).split(' 或 ') if v]
    return [[f'dec:{m.group(1)}.{m.group(2)}={v}'] for v in vals]


def arcs():
    s = open(os.path.join(ROOT, 'src/data/heroine_arcs.js'), encoding='utf-8').read()
    return json.loads(s[s.index('=') + 1:s.rindex(';')])['people']


def bg_keys():
    s = open(os.path.join(ROOT, 'src/outings3d.js'), encoding='utf-8').read()
    return set(re.findall(r'\b([a-z0-9_]+):\{label:', s)) | {'dark', 'blur'}


def build(src, sha):
    ev = src.get('events') or {}
    if set(ev) != set(EVENTS):
        raise SystemExit(f'AA_720 events：多了 {sorted(set(ev) - set(EVENTS))}、少了 {sorted(set(EVENTS) - set(ev))}')
    for b in BLOCKS:
        if b not in src:
            raise SystemExit(f'AA_720 {b}：沒有')
    extra = set(src) - set(BLOCKS) - {'_meta', 'events', 'endings', 'quietMove', 'kx_waited_after', 'wiringAnswers', 'an1_later', 'wiringAnswers2', 'wiringAnswers3'}
    if extra:
        raise SystemExit(f'AA_720 多了不認得的區塊：{sorted(extra)}')
    for k, v in list(ev.items()) + [(b, src[b]) for b in BLOCKS]:
        if v.get('who') not in WHO:
            raise SystemExit(f'AA_720 {k}.who「{v.get("who")}」：不是七位之一')
        for f in ('scene', 'end', 'lines'):
            if f in v:
                lines(v[f]['lines'] if isinstance(v[f], dict) else v[f], f'AA_720 {k}.{f}')
        walk_opts(v, f'AA_720 {k}')
    for p, want in AT:
        v = get(src, p)
        if not isinstance(v, str) or not v.startswith(want):
            raise SystemExit(f'AA_720 {p}「{v}」：播放程式照「{want}」排，稿改了要先改 src/aa720_3d.js')
    q = {}
    for name, (p, t) in QUOTES.items():
        v = get(src, p)
        if '「' + t + '」' not in v:
            raise SystemExit(f'AA_720 {p}：找不到「{t}」')
        q[name] = IG.read_fix(t)
    keys = bg_keys()
    for k, b in BG.items():
        if b not in keys:
            raise SystemExit(f'BG {k}：OUT.BG 沒有 {b}')
    E = src.get('endings') or {}
    end_if = {}
    for who, e in E.items():
        if who.startswith('_'):
            continue
        if who not in FRIEND_PARTNER:
            raise SystemExit(f'endings.{who}：不是七位之一')
        end_if[who] = {}
        for side in ('friend', 'partner'):
            L = e.get(side)
            if not isinstance(L, list):
                raise SystemExit(f'endings.{who}.{side}：要是陣列')
            end_if[who][side] = []
            for i, x in enumerate(L):
                if not isinstance(x.get('line'), str) or not x['line'].strip():
                    raise SystemExit(f'endings.{who}.{side}[{i}].line：要有字')
                end_if[who][side].append(end_cond(x.get('if', ''), f'endings.{who}.{side}[{i}]'))
        if not isinstance(e.get('confFail'), str) or not e['confFail'].strip():
            raise SystemExit(f'endings.{who}.confFail：要有字')
    qm = (src.get('quietMove') or {}).get('sis_beat6')
    if qm is not None:   # 4f37a68bb SIS1-QUIET-LIB-1108：學姊第 6 拍在總圖安靜區＝走到樓梯間再演
        lines(qm.get('open'), 'quietMove.sis_beat6.open')
        lines(qm.get('close'), 'quietMove.sis_beat6.close')
        rf = qm.get('replaceFirst') or {}
        b6 = arcs()['heroine_05']['beats'][5]
        if b6.get('n') != 6 or b6.get('quietOk') is not False or not b6.get('lines') or b6['lines'][0] != IG.read_fix(rf.get('from', '')):
            raise SystemExit('quietMove.sis_beat6.replaceFirst.from：和 AA_712 學姊第 6 拍（src/data/heroine_arcs.js）的第一句對不上')
        if not isinstance(rf.get('to'), str) or not rf['to'].strip():
            raise SystemExit('quietMove.sis_beat6.replaceFirst.to：要有字')
    ka = src.get('kx_waited_after')   # ee689cfb8：等了一個小時以後兩天，她回訊息照這幾句輪
    if ka is not None:
        lines(ka.get('lines'), 'kx_waited_after.lines')
    dj = (src.get('zq_intern') or {}).get('demoJan9')   # ee689cfb8：1/9 demo intern 版（照 ZQ-2 的值）、動態的說明文字
    if dj is not None:
        if set((dj.get('intern') or {})) != {'shop', 'tainan', 'cat', 'default'} or not all(isinstance(t, str) and t.strip() for t in dj['intern'].values()):
            raise SystemExit('zq_intern.demoJan9.intern：要有 shop／tainan／cat／default 四句')
        if set((dj.get('captions') or {})) != {'zq1c', 'zq4c'}:
            raise SystemExit('zq_intern.demoJan9.captions：要有 zq1c、zq4c')
    al = src.get('an1_later')   # 075eae472：以安 AN-1 later（含預設）——3/19 21:00 桌遊團群組 Alison、21:20 以安私訊＋三個選項
    if al is not None:
        lines(al['group'].get('msgs'), 'an1_later.group.msgs')
        lines(al['dm'].get('msgs'), 'an1_later.dm.msgs')
        if len(al['dm']['msgs']) != 1:
            raise SystemExit('an1_later.dm.msgs：播放程式照「一則」換第一句（不在群組的版本），稿改了要先改 src/aa720_3d.js')
        opts(al['dm'].get('opts'), 'an1_later.dm.opts')
        if '選項一樣' not in al.get('noGroup', ''):
            raise SystemExit('an1_later.noGroup：找不到「選項一樣」')
    p3, vals = DEMO3
    w3 = get(src, p3)
    demo3 = {}
    for v in vals:
        L = w3.get(v)
        if not isinstance(L, list) or len(L) != 3 or not all(isinstance(t, str) and t.strip() for t in L):
            raise SystemExit(f'{p3}.{v}：要是三句（依序取代「一隻貓站在一座橋上」那句旁白、「你在橋的一半掉下去」、「……第三關太難了。我回去改。」）')
        demo3[v] = [IG.read_fix(t) for t in L]
    if not str(w3.get('rule', '')).startswith('要：1/9 demo 那一場實習版照 ZQ-2 換三處'):
        raise SystemExit(f'{p3}.rule：稿改了要先改 src/aa720_3d.js')
    # wiringAnswers／wiringAnswers2／wiringAnswers3＝AA 回 LAWWW 的說明（不是台詞）：不進遊戲；要演的句子照 QUOTES、DEMO3 抽出來
    data = fix({k: v for k, v in src.items() if k not in ('_meta', 'wiringAnswers', 'wiringAnswers2', 'wiringAnswers3')})
    return {'src': f'{PATH}@{sha}', 'data': data, 'cfg': {'quotes': q, 'bg': BG, 'endIf': end_if, 'demo3': demo3}}


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
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import aa959 as _AA959   # AA_959（DLG-FULL-REVIEW-1110）：cfg.quotes 是拿別的檔（termend_lines.js…）的句子當鑰匙比對的——那些句子照覆寫表換了字，鑰匙跟著換（不然 aa720_3d.js 對不到，例 zqDemoHard）
    _q = data.get('cfg', {}).get('quotes')
    if isinstance(_q, dict):
        for _k, _v in list(_q.items()):
            if isinstance(_v, str): _q[_k] = _AA959.map_any(_v)
    js = ('/* 自動產生：tools/story/import_aa720.py（' + data['src'] + '）。不要手改，改企劃 AA_720 再重新匯入。\n'
          '   決定拍打開的場景、尾聲分版本（播放 src/aa720_3d.js）*/\n'
          "'use strict';\nconst AA720=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
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
    print('寫入', OUT, why, len(data['data']['events']), '場')


if __name__ == '__main__':
    main()
