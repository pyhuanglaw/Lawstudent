"""CC（帳號 A）11-10：TERMEND-OPTS-1110 期末飯桌選項（LAWWW 30dee73c2，開發分支 201803df0）瀏覽器探針（BB 22:37）。判定歸 BB；Playwright（PC GPU）≠ iPhone。

稿（企劃線 claude/story-planning；DRAFT_REF 指定版本，預設 origin/claude/story-planning；DRAFT_DIR＝放三份 json 的資料夾就不用 git）：
  docs/story_planning/AA_749_termend_gf_v2.json（女朋友版 GF）、AA_749_termend_kx_v2.json（可昕 KX）、AA_748_termend_heart_v2.json（心意邀約 tableOpts、confessOpts）。
  比對前照匯入工具 tools/story/import_termend_opts.py 一樣先過 import_guard.read_fix（換名）；稿上的 note 規則（語彤 YT_MET_JOB、學姊「論文」那一格、學姊大二上她請的那一句）照匯入工具的寫法算期望。

對照的程式（201803df0；src/termend3d.js）：
  排飯  S.pickCheck（F.TE_GF＝女朋友版、F.TE_PICK＝心意／朋友：＝玩家在手機按了「好。」）→ S.planDinner；可昕 S.planKexin（她自己排好的那一頓）。
  演    OUT.prompt「出發：學期末的飯」→ ev_termend_dinner beforeOuting → S.dinner：
        女朋友版 kind 'gf'：S.gfEntry（TERMEND_OPTS.GF[她].tableByTerm[學期]，沒寫的學期照 table＝「通用」；稿沒寫、遊戲有寫的學期照舊）→ S.optEntry（says 照條件挑第一組、opts 照 if 篩）
             → run 的 {say,opts,shuffle}：S.shuffled（種子＝那一天｜她｜學期｜gf）→ 選了接 re、fx（SOCIAL.applyFx，上限 S.fxCap＝termend:<天>，一頓 +2）
             → GF_MORE（學姊大四上 XM3 兩句）→ after（學姊大四上 SNOWQ 的 snow 那一段、學姊大二上 noYOUPAY 那一句）→ S.hook → lastByTerm → 收尾；**不接話題池、祐廷不自動回 REPLY**。
        心意 kind 'heart'：talk(2)（話題池照舊）→ 飯桌那一句（spec.table）→ 那一句在 TERMEND_OPTS.TABLE[她].after 裡＝選項（洗過，salt 'table'）→ S.hook → 收尾
             → S.walkHome：「說出來」三句＝S.confessOpts（TERMEND_OPTS.CONFESS[她]，不洗；第四個「（先不說）」）→ fx（上限 +3：S._heart）→ 答應時 yesLead 接在 yes 前面。
        可昕 kind 'kexin'：S.kexinDinner → TERMEND_OPTS.KX[學期] 有＝S.optEntry（sayC10／sayUS 照條件）＋選項（salt 'kx'）＋then → KX_ASK 的二選一照舊。
        朋友 kind 'friend'：照舊（openByTerm、talk(3) 話題池＋祐廷的 REPLY）。
  舊版 779ddd650：沒有 TERMEND_OPTS＝女朋友版照一句＋話題池、祐廷自動回「嗯。」「真的假的。」。

CASES（逗號分隔；每個 case 重新讀 day46 存檔；別名 gf、kx、heart、friend、all）：
  女朋友版（【捷徑】設交往中）：gf_an_Y1S2（以安 通用）gf_an_Y2S1  gf_yt_Y1S2（語彤 通用＋夏天開頭）gf_yt_Y2S1（通用＋大二上開頭）gf_yt_Y4S1
    gf_sis_Y3S2  gf_sis_Y4S1us（學姊 美國路線＋SNOWQ＋XM3：snow 那一段）〔另有 gf_sis_Y4S1tw 臺灣路線，不在 all〕
    gf_zr_Y2S1  gf_zr_Y5S1（芷若 大五上：交換延畢，路線 JP）  gf_zq_Y1S2（子晴 通用 沒玩過 Q6）gf_zq_Y1S2q6（通用 玩過 Q6）gf_zq_Y3S2
  可昕：kx_Y2S1  kx_Y3S2tw（臺灣路線）kx_Y3S2us（美國路線）
  告白那一晚：heart_an  heart_yt  heart_sis  heart_zq（稿有匯：飯桌選項＋告白選項）；heart_zr  heart_ps（芷若、沛珊沒匯：照舊流程）
  朋友版：fr_an  fr_zq
每個 case：讀檔（時段裡）→【捷徑】設定 → pickCheck 排飯 →【捷徑】跳到飯前 24 分鐘 → 真的「出發」→ 一路點（選項照 PICK）。
  女朋友版、可昕另外再跑：同一份存檔重讀一次（順序要一樣）、同一頓改到隔天（順序要變；一樣就再試後天）。SHUF=0 不跑；TAG=old 不跑。
檢查：她說的＝稿、三個選項的字＝稿、選了以後她的回話＝稿、fx＝稿（applyFx 收到的）、一頓戀愛合計 ≤ 2（告白那一晚 ≤ 3）、不接話題池、祐廷沒有自動回 REPLY、
  沒有 undefined、流程走完、沒有 JS 例外；全部 case 跑完：畫面上的字（say、caption、選項）沒有八句舊字串（BB 22:37）；
  BB 23:07 加的五句只算那個人說的（柏翰「二樓靠窗」「總圖二樓」、Alison「不還」、阿凱「幫學姊做的那種」、學姊「宿舍門邊」），別人說的、字幕、選項有＝只記 note。
  TAG=old（舊版 779ddd650 對照）：沒有稿上的選項、女朋友版祐廷有自動回 REPLY（＝舊行為成立）。
PICK＝max（預設：戀愛最多的那個）／min／first／last／idx:N（稿上第 N 個）；CONF_PICK＝告白選單選第幾個（預設 0）。
輸出：<out>/te_lines.txt（全文：每一次跑的 say、caption、選項、選了哪個、fx、adjust）、<out>/te_<TAG>.json。
用法：LW_TESTS=<worktree>/tests SHA=<受測 sha> TAG=new|old CASES=gf_an_Y2S1,... [DRAFT_REF=...|DRAFT_DIR=...] python3 cc_te_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy, re, subprocess
LWT = os.environ.get('LW_TESTS') or 'tests'
sys.path.insert(0, LWT); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'new'
OLD = TAG == 'old'
SHA = os.environ.get('SHA') or ''
PICK = os.environ.get('PICK') or 'max'
CONF_PICK = int(os.environ.get('CONF_PICK') or 0)
SHUF = (os.environ.get('SHUF') or '1') != '0' and not OLD
R = L.Run('te_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
STUCK_S = 60
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LINES_TXT = os.path.join(OUT, 'te_lines.txt')
RESULT = {'tag': TAG, 'sha': SHA, 'url': URL, 'pick': PICK, 'cases': {}}
# BB 22:37 第 2 項：出現任何一句＝稿沒改到
OLD_STRINGS = ['漢堡店開到十二點', '當事人每天打來', '這句不要跟別的人說', '下學期去國小實習', '考到八月四號', '她問男的女的', '不准關靜音', '早半年而已']
# BB 23:07 加的：只算那個人說的（GAME.say 的 charId 或名字）；別人說的、字幕、選項裡有＝只記 note（「不還」這種短字別人也可能說）
OLD_BY = [('二樓靠窗', 'classmate_bohan', ('柏翰', '許柏翰')), ('總圖二樓', 'classmate_bohan', ('柏翰', '許柏翰')), ('不還', 'yu', ('Alison', '李語晴')),
          ('幫學姊做的那種', 'kai', ('阿凱', '王凱翔')), ('宿舍門邊', 'heroine_05', ('學姊', '溫書瑀', '書瑀', '溫學姊'))]
SEEN_TEXT = []   # 全部 case 畫面上出現過的字（say、caption、選項）：{k, who, name, v}，第 2 項用


def seen_of(dl):
    return [{'k': e['k'], 'who': e.get('who'), 'name': e.get('name') or '', 'v': str(e['v'])} for e in dl if e.get('k') in ('say', 'cap')] + \
           [{'k': 'opt', 'who': None, 'name': '', 'v': str(x)} for e in dl if e.get('k') == 'choose' for x in (e.get('v') or [])]

# ---------------- 稿 ----------------
DRAFT_FILES = {'gf': 'AA_749_termend_gf_v2.json', 'kx': 'AA_749_termend_kx_v2.json', 'heart': 'AA_748_termend_heart_v2.json'}


def load_drafts():
    out, src = {}, {}
    dd = os.environ.get('DRAFT_DIR')
    if dd and not os.path.isabs(dd): dd = os.path.join(HERE, dd)   # PC 佇列：DRAFT_DIR=fixtures/te_drafts（CC 從企劃線抄的三份稿，SOURCE_SHA.txt 寫哪一版）
    if dd:
        for k, f in DRAFT_FILES.items():
            out[k] = json.load(open(os.path.join(dd, f), encoding='utf-8')); src[k] = 'DRAFT_DIR ' + os.path.join(dd, f)
        return out, src
    ref = os.environ.get('DRAFT_REF') or 'origin/claude/story-planning'
    repo = os.environ.get('DRAFT_GIT') or REPO
    g = lambda *a: subprocess.check_output(['git', '-C', repo] + list(a)).decode('utf-8')
    sha = g('rev-parse', ref).strip()
    for k, f in DRAFT_FILES.items():
        p = 'docs/story_planning/' + f
        out[k] = json.loads(g('show', '%s:%s' % (sha, p)))
        last = g('log', '-1', '--format=%h %ci', sha, '--', p).strip()
        src[k] = '%s@%s（%s 最後一次改：%s）' % (p, sha[:10], ref, last)
    return out, src


def load_fix():
    """匯入工具的換名（import_guard.read_fix）：受測樹的 tools/story；找不到＝不換（記 note）"""
    for root in (os.path.dirname(os.path.abspath(LWT)), REPO):
        p = os.path.join(root, 'tools', 'story', 'import_guard.py')
        if os.path.exists(p):
            try:
                sys.path.insert(0, os.path.dirname(p))
                sp = importlib.util.spec_from_file_location('import_guard', p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
                m.read_fix('秀琴姨說，A館 201 的最後一排。')   # 先試一次（它還會讀 tools/rename/world_names.py、tools/story/aa655_fix.json）
                return m.read_fix, p
            except Exception as e:
                return (lambda s: s), '讀 %s 失敗：%r' % (p, e)
    return (lambda s: s), '找不到 tools/story/import_guard.py'


DR, DRSRC = {}, {}
RF, RFSRC = (lambda s: s), ''


def rf(s):
    return RF(s) if isinstance(s, str) else s


def ltxt(x):
    if isinstance(x, str): return rf(x)
    if isinstance(x, dict) and isinstance(x.get('narr'), str): return rf(x['narr'])
    return None


def lns(a):
    if a is None: return []
    if not isinstance(a, list): a = [a]
    return [t for t in (ltxt(x) for x in a) if t is not None]


def fxn(v):
    v = {k: n for k, n in (v or {}).items() if n}
    return v or None


def mkopt(o):
    return {'t': rf(o['t']), 're': lns(o.get('re')), 'fx': fxn(o.get('fx')), 'if': o.get('if')}


def vis(opts, C):
    return [o for o in opts if not o.get('if') or C.get(o['if'])]


COND_KEYS = ['Q6', 'noQ6', 'summer', 'SNOWQ', 'YOUPAY', 'noYOUPAY', 'C10', 'US', 'noUS', 'sisGrad', 'sisPreGrad', 'YT_MET_JOB']


def gf_expect(who, term, C, game_tbt):
    """S.gfEntry＋匯入工具 gf_entry 的規則 → [段落]；段落＝{id, say, opts(看得到的), all(全部選項的字), shuffle}"""
    g = DR['gf']['GF'].get(who)
    if not g: return None, '稿沒有這個人（照舊：一句＋話題池）'
    tbt = g.get('tableByTerm') or {}
    if term in tbt: e, key = tbt[term], term
    elif game_tbt: return None, '稿沒寫 %s、遊戲有寫（照遊戲原本那一句＋話題池）' % term
    else: e, key = g['table'], 'table'
    say, why = e.get('say'), 'say'
    if 'sayQ6' in e and C.get('Q6'): say, why = e['sayQ6'], 'sayQ6'
    elif 'sayByKind' in e:
        for k in sorted(e['sayByKind'], key=lambda k: k == 'summer'):
            if k == term or (k == 'summer' and C.get('summer')): say, why = e['sayByKind'][k], 'sayByKind.' + k; break
    opts = [mkopt(o) for o in e.get('opts') or []]
    segs = [{'id': 'gf.%s' % key, 'why': why, 'say': lns(say), 'opts': vis(opts, C), 'all': [o['t'] for o in opts], 'shuffle': True}]
    note = e.get('note') or ''
    if who == 'heroine_05' and key == 'Y2S1':
        m = re.search(r'她請的時候多一句「([^」]+)」', note)
        if m and C.get('noYOUPAY'): segs.append({'id': 'after.noYOUPAY', 'say': [rf(m.group(1))], 'opts': [], 'all': []})
    if 'snow' in e:
        s = e['snow']; so = [mkopt(o) for o in s.get('opts') or []]
        if C.get('SNOWQ'): segs.append({'id': 'snow', 'why': 'SNOWQ', 'say': lns(s.get('say')), 'opts': vis(so, C), 'all': [o['t'] for o in so], 'shuffle': True})
        else: segs[0]['all'] += [o['t'] for o in so]; segs[0]['snowNot'] = [o['t'] for o in so]   # 沒有 SNOWQ：snow 的選項不該出現
    return segs, key


def kx_expect(term, C):
    e = (DR['kx'].get('KX') or {}).get(term)
    if not e: return None, '稿沒有 KX.%s' % term
    say, why = e.get('say'), 'say'
    if 'sayC10' in e and C.get('C10'): say, why = e['sayC10'], 'sayC10'
    elif 'sayUS' in e and C.get('US'): say, why = e['sayUS'], 'sayUS'
    opts = [mkopt(o) for o in e.get('opts') or []]
    allt = [o['t'] for o in opts]
    if 'optsUS' in e:
        ou = [mkopt(o) for o in e['optsUS']]; allt += [o['t'] for o in ou]
        opts = ou if C.get('US') else opts
    return [{'id': 'kx.%s' % term, 'why': why, 'say': lns(say), 'opts': opts, 'all': allt, 'then': lns(e.get('then')), 'shuffle': True}], term


def heart_expect(who, term, C, tl, say3, not_yet):
    t = (DR['heart'].get('tableOpts') or {}).get(who); c = (DR['heart'].get('confessOpts') or {}).get(who)
    segs, notes = [], []
    if t:
        after = [rf(t[k]) for k in ('after', 'afterNoQ6') if k in t]
        opts = [mkopt(o) for o in t.get('opts') or []]
        if who == 'heroine_05':   # 匯入工具：「論文」那一格只在 2026-09 以後；以前換成 note 寫的那一句
            m = re.search(r'大四那年換成「([^」]+)」，她回「([^」]+)」', t.get('note') or '')
            hit = [i for i, o in enumerate(opts) if '論文' in o['t']]
            if m and len(hit) == 1:
                o = opts[hit[0]]; o['if'] = 'sisGrad'
                opts.insert(hit[0] + 1, {'t': '「' + rf(m.group(1)) + '」', 're': [rf(m.group(2))], 'fx': dict(o['fx']) if o['fx'] else None, 'if': 'sisPreGrad'})
            else: notes.append('學姊 tableOpts 的 note 對不上匯入工具的寫法')
        if isinstance(tl, list) and len(tl) == 1 and tl[0] in after:
            segs.append({'id': 'table', 'say': [tl[0]], 'opts': vis(opts, C), 'all': [o['t'] for o in opts], 'shuffle': True})
        else:
            notes.append('飯桌那一句 %s 不在稿的 after %s：不接選項（S._dinner 照稿的 after 才接）' % (J(tl), J(after)))
            segs.append({'id': 'table.none', 'say': [], 'opts': [], 'all': [o['t'] for o in opts]})
    if c:
        O, allt = [], []
        co = [dict(o) for o in c.get('opts') or []]
        if who == 'heroine_03' and '第二個選項只在 YT_MET_JOB' in (c.get('note') or '') and len(co) > 1: co[1]['if'] = 'YT_MET_JOB'; co[1]['orig'] = 1
        for o in co:
            allt.append(rf(o['t']))
            if not o.get('if') or C.get(o['if']): O.append({'t': rf(o['t']), 'yesLead': lns(o.get('yesLead')), 'fx': fxn(o.get('fx'))})
            elif o.get('orig') is not None and say3 and len(say3) > o['orig']: O.append({'t': say3[o['orig']], 'yesLead': [], 'fx': None, 'orig': True})
        if len(O) == 3: segs.append({'id': 'confess', 'ordered': True, 'menu': [o['t'] for o in O] + [not_yet], 'opts': O, 'all': allt})
        else: notes.append('說出來的選項篩完不是三個（%d）＝照原本' % len(O)); segs.append({'id': 'confess.none', 'ordered': True, 'menu': (say3 or []) + [not_yet], 'opts': [], 'all': allt})
    return segs, notes


# ---------------- case 定義 ----------------
# kind：gf／kexin／heart／friend；expect：opts（稿有匯）／old（沒匯：照舊流程）；load：讀檔那一天（沒寫＝時段第一天）；flags、unflags、evDone、evUndo：【捷徑】
CASE_DEF = {
    'gf_an_Y1S2': dict(kind='gf', who='heroine_01', term='Y1S2', label='以安 女朋友版 通用（大一下，稿 table）'),
    'gf_an_Y2S1': dict(kind='gf', who='heroine_01', term='Y2S1', label='以安 女朋友版 大二上'),
    'gf_yt_Y1S2': dict(kind='gf', who='heroine_03', term='Y1S2', label='語彤 女朋友版 通用＋夏天開頭（sayByKind.summer）'),
    'gf_yt_Y2S1': dict(kind='gf', who='heroine_03', term='Y2S1', label='語彤 女朋友版 通用＋大二上開頭（sayByKind.Y2S1）'),
    'gf_yt_Y4S1': dict(kind='gf', who='heroine_03', term='Y4S1', label='語彤 女朋友版 大四上'),
    'gf_sis_Y3S2': dict(kind='gf', who='heroine_05', term='Y3S2', label='學姊 女朋友版 大三下'),
    'gf_sis_Y4S1us': dict(kind='gf', who='heroine_05', term='Y4S1', load='2028-12-24', loadH=10.0, flags={'EXCHANGE_ROUTE': 'US', 'US_SNOW_QUIET': True, 'SIS_XMAS_Y3': 'there'}, unflags=['SIS_ASKED_TWICE'],
                          label='學姊 女朋友版 大四上（美國路線、SNOWQ：snow 那一段；SIS_XMAS_Y3＝there：XM3 兩句）'),
    'gf_sis_Y4S1tw': dict(kind='gf', who='heroine_05', term='Y4S1', load='2028-12-23', loadH=10.0, flags={'EXCHANGE_ROUTE': 'TW', 'SIS_XMAS_Y3': 'there'}, unflags=['US_SNOW_QUIET'], extra=True,
                          label='學姊 女朋友版 大四上（臺灣路線：沒有 snow）'),
    'gf_zr_Y2S1': dict(kind='gf', who='heroine_02', term='Y2S1', label='芷若 女朋友版 大二上'),
    'gf_zr_Y5S1': dict(kind='gf', who='heroine_02', term='Y5S1', flags={'EXCHANGE_ROUTE': 'JP'}, label='芷若 女朋友版 大五上（交換延畢：路線 JP）'),
    'gf_zq_Y1S2': dict(kind='gf', who='heroine_04', term='Y1S2', evUndo=['ev_ziqing_secret_game'], label='子晴 女朋友版 通用（大一下，沒玩過 Q6）'),
    'gf_zq_Y1S2q6': dict(kind='gf', who='heroine_04', term='Y1S2', evDone=['ev_ziqing_secret_game'], label='子晴 女朋友版 通用（大一下，玩過 Q6）'),
    'gf_zq_Y3S2': dict(kind='gf', who='heroine_04', term='Y3S2', label='子晴 女朋友版 大三下'),
    'kx_Y2S1': dict(kind='kexin', who='kexin', term='Y2S1', label='可昕 大二上'),
    'kx_Y3S2tw': dict(kind='kexin', who='kexin', term='Y3S2', flags={'EXCHANGE_ROUTE': 'TW'}, label='可昕 大三下（臺灣路線）'),
    'kx_Y3S2us': dict(kind='kexin', who='kexin', term='Y3S2', flags={'EXCHANGE_ROUTE': 'US'}, label='可昕 大三下（美國路線）'),
    'heart_an': dict(kind='heart', who='heroine_01', term='Y1S2', label='以安 告白那一晚（大一下）'),
    'heart_yt': dict(kind='heart', who='heroine_03', term='Y1S2', label='語彤 告白那一晚（大一下）'),
    'heart_sis': dict(kind='heart', who='heroine_05', term='Y2S1', label='學姊 告白那一晚（大二上：2026-09 以後＝「論文」那一格）'),
    'heart_zq': dict(kind='heart', who='heroine_04', term='Y1S2', evUndo=['ev_ziqing_secret_game'], label='子晴 告白那一晚（大一下，沒玩過 Q6）'),
    'heart_zr': dict(kind='heart', who='heroine_02', term='Y1S2', expect='old', label='芷若 告白那一晚（稿沒匯：照舊流程）'),
    'heart_ps': dict(kind='heart', who='classmate_peishan', term='Y1S2', expect='old', label='沛珊 告白那一晚（稿沒匯：照舊流程）'),
    'fr_an': dict(kind='friend', who='heroine_01', term='Y1S1', label='以安 朋友版（大一上）'),
    'fr_zq': dict(kind='friend', who='heroine_04', term='Y1S2', label='子晴 朋友版（大一下）'),
}
ALIAS = {'gf': [k for k, v in CASE_DEF.items() if v['kind'] == 'gf' and not v.get('extra')], 'kx': [k for k in CASE_DEF if k.startswith('kx_')],
         'heart': [k for k in CASE_DEF if k.startswith('heart_')], 'friend': [k for k in CASE_DEF if k.startswith('fr_')]}
ALIAS['all'] = ALIAS['gf'] + ALIAS['kx'] + ALIAS['heart'] + ALIAS['friend']
CASES = []
for c in [x.strip() for x in (os.environ.get('CASES') or 'all').split(',') if x.strip()]:
    CASES += ALIAS.get(c, [c])

# ---------------- 頁面裡的 JS ----------------
# 只包一次：GAME.say／caption／choose（選項原文＋選了第幾個）、SOCIAL.adjust、SOCIAL.applyFx（新版才有：fx、實際加了多少 ret、上限的鍵）
HOOK_JS = r"""(()=>{ window.__DL=window.__DL||[]; if(GAME.__teHooked) return 'already'; GAME.__teHooked=1;
  const P=(k,v,x)=>{ try{ window.__DL.push(Object.assign({k, v, h:+(+GAME.G.hour).toFixed(3), d:GAME.G.day, z:GAME.G.zone},x||{})); }catch(e){} };
  const s0=GAME.say; if(typeof s0==='function') GAME.say=function(a,b){ P('say', String(b==null?'':b), {who:(a&&a.charId)||null, name:(a&&a.name)||(typeof a==='string'?a:'')}); return s0.apply(this,arguments); };
  const c0=GAME.caption; if(typeof c0==='function') GAME.caption=function(a,b){ P('cap', (a?a+'｜':'')+String(b==null?'':b)); return c0.apply(this,arguments); };
  const h0=GAME.choose; if(typeof h0==='function') GAME.choose=function(o){ let t=[]; try{ t=(o||[]).map(x=>x&&x.t); }catch(e){} P('choose', t); const r=h0.apply(this,arguments); try{ if(r&&typeof r.then==='function') r.then(k=>P('pick',k)); }catch(e){} return r; };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ P('adj', null, {id, dd:(()=>{ try{ return JSON.parse(JSON.stringify(d||{})); }catch(e){ return null; } })()}); return a0.apply(this,arguments); }; }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.applyFx){ const f0=SOCIAL.applyFx; SOCIAL.applyFx=function(G,id,fx,o){ const r=f0.apply(this,arguments); try{ P('fx', null, {id, fx:fx==null?null:JSON.parse(JSON.stringify(fx)), ret:r==null?null:JSON.parse(JSON.stringify(r)), cap:o&&o.cap||null, max:o&&o.max!=null?o.max:null}); }catch(e){} return r; }; }
  return 'hooked'; })()"""
RESET_JS = "(()=>{ window.__DL=[]; return true; })()"
LOG_JS = "(()=>(window.__DL||[]))()"
SNAP_JS = "(()=>JSON.parse(JSON.stringify(GAME.G)))()"
WD_JS = "(d=>CALENDAR.dateOf(d).wd%7)"
DK_JS = "(k=>STORY.dayOfKey(k))"
WIN_JS = "(t=>{ const w=TERMEND.windowOf(t); return w?{id:w.id, from:w.from, to:w.to, fromKey:CALENDAR.dateOf(w.from).key, toKey:CALENDAR.dateOf(w.to).key}:null; })"
REL_JS = "(w=>{ const r=SOCIAL.rel(w)||{}; return {fam:r.fam, trust:r.trust, comf:r.comf, npcRom:r.npcRom}; })"
CH_AT = "(k=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"
PHONE_OPEN_JS = "(()=>{ const e=document.getElementById('phone'); return !!e&&!e.classList.contains('hide'); })()"
ADV_JS = "(()=>!!(typeof ADV!=='undefined'&&ADV.active))()"
OUTQ_JS = "(id=>{ const q=(typeof OUT!=='undefined'&&OUT.get)?OUT.get(GAME.G,id):null; return q?{state:q.state, day:q.day, h:q.h}:null; })"
# 【捷徑】設定：旗標、事件、關係、交往（ROM.start）、這學期的邀約重算，然後照手機「好。」的旗標排飯（S.pickCheck）；可昕照 S.planKexin
SETUP_JS = r"""(a=>{ const G=GAME.G, F=G.flags||(G.flags={}), out={};
  for(const k in (a.flags||{})) F[k]=a.flags[k]; for(const k of (a.unflags||[])) delete F[k];
  G.events=G.events||{}; G.events.done=G.events.done||{}; for(const e of (a.evDone||[])) G.events.done[e]=G.day; for(const e of (a.evUndo||[])) delete G.events.done[e];
  if(a.rel){ const r=SOCIAL.rel(a.who); out.relBefore={fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom}; for(const k in a.rel) r[k]=Math.max(+r[k]||0,a.rel[k]); try{ if(SOCIAL.has&&!SOCIAL.has(a.who,'FIRST_MET')&&SOCIAL.remember) SOCIAL.remember(a.who,'FIRST_MET',''); }catch(e){} }
  if(a.dating){ let ok=false; try{ ok=typeof ROM!=='undefined'&&ROM.start?!!ROM.start(G,a.who):false; }catch(e){ out.romErr=String(e); } if(!F['dating_'+a.who]){ F['dating_'+a.who]=true; out.flagOnly=true; } out.romStart=ok; }
  const w=TERMEND.windowOf(a.term); out.w=w; if(!w) return out;
  const R=TERMEND.rec(G,a.term); for(const k of ['plan','picked','heartPick','done','heartDone','result','hook']) delete R[k];
  try{ const P=TERMEND.plan(G,w); out.plan={gf:P.gf,heart:P.heart,friend:P.friend,kx:P.kx,back:P.back,exempt:P.exempt||null,nope:P.nope}; }catch(e){ out.planErr=String(e); }
  try{ if(a.kind==='gf'){ F.TE_GF=a.term+'|'+a.who; TERMEND.pickCheck(GAME); }
    else if(a.kind==='kexin'){ out.kxPlan=TERMEND.planKexin(G,w); }
    else { F.TE_PICK=a.term+'|'+a.who+'|'+a.kind; TERMEND.pickCheck(GAME); } }catch(e){ out.pickErr=String(e); }
  const q=(OUT.rec(G)||[]).filter(x=>x&&x.te&&x.te.who===a.who&&x.te.term===a.term&&x.state==='planned').pop()||null;
  out.q=q?{id:q.id,day:q.day,h:q.h,travelH:q.travelH,title:q.title,place:q.place,te:q.te,dayKey:CALENDAR.dateOf(q.day).key}:null; out.picked=R.picked||null; out.heartPick=R.heartPick||null;
  return out; })"""
# 飯前（跳到飯前以後、出發以前）讀：條件（TERMEND.optIf；舊版沒有＝null）、遊戲原本的字（話題池、鉤子、REPLY、說出來的三句、（先不說））、上限
INFO_JS = r"""(a=>{ const G=GAME.G, Lx=TERMEND_LINES, has=typeof TERMEND_OPTS!=='undefined'&&!!TERMEND_OPTS&&typeof TERMEND.optIf==='function';
  const res=x=>{ try{ return typeof x==='function'?x(G):x; }catch(e){ return null; } };
  const flat=x=>{ x=res(x); if(x==null) return []; if(typeof x==='string') return [x]; if(Array.isArray(x)) return [].concat(...x.map(flat)); if(typeof x==='object'){ if(typeof x.narr==='string') return [x.narr]; if(typeof x.text==='string') return [x.text]; if(x.say!=null) return flat(x.say); } return []; };
  const c={}; for(const k of a.conds){ try{ c[k]=has?!!TERMEND.optIf(G,k,a.term):null; }catch(e){ c[k]=null; } }
  let spec=null; try{ spec=a.kind==='gf'?TERMEND.gf(a.who,a.term):(a.kind==='heart'?TERMEND.heart(a.who,a.term):(a.kind==='friend'?TERMEND.friend(a.who,a.term):null)); }catch(e){}
  const gameTbt=!!(spec&&spec.tableByTerm&&spec.tableByTerm[a.term]!=null);
  let tl=null; if(a.kind==='heart'&&spec){ const t=res(spec.table); tl=t==null?[]:(Array.isArray(t)?t:[t]); tl=tl.map(x=>typeof x==='string'?x:(x&&x.narr?{narr:x.narr}:J0(x))); }
  function J0(x){ try{ return JSON.stringify(x); }catch(e){ return String(x); } }
  const pool=flat(((Lx.POOL||{})[a.term]||{})[a.who]||[]);
  let hook=[]; try{ const H=TERMEND.hookFor?TERMEND.hookFor(G,a.term,a.who):null; if(H) hook=flat(H.say).concat(flat(H.after),flat(H.then)); }catch(e){}
  let say3=null; try{ if(a.kind==='heart'&&spec){ const D=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[a.who]:null; say3=spec.optsFrom==='confess'&&D&&D.choice?res(D.choice).map(q=>q.t):Lx.OPTS(spec.buddy); } }catch(e){ say3=['ERR '+e]; }
  let kxAsk=null; try{ if(a.kind==='kexin'){ const A=res(Lx.KX_ASK&&Lx.KX_ASK[a.term]); kxAsk=Array.isArray(A)?A.map(o=>o.t):null; } }catch(e){}
  let cap=null; try{ cap=TERMEND.fxCap?TERMEND.fxCap(G,a.who).max:null; }catch(e){}
  return {has, c, gameTbt, tl, pool, hook, say3, kxAsk, notYet:Lx.NOT_YET_OPT||null, reply:Lx.REPLY||[], name:G.name||'祐廷', cap, capConfess:typeof SOCIAL!=='undefined'?(SOCIAL.FX_CAP_CONFESS||null):null,
    romOk:typeof SOCIAL!=='undefined'&&SOCIAL.romOk?!!SOCIAL.romOk(a.who):null, ytMetJob:!!(G.flags||{}).YT_MET_JOB, route:(G.flags||{}).EXCHANGE_ROUTE||null, dkey:CALENDAR.dateOf(G.day).key,
    dating:!!(G.flags||{})['dating_'+a.who], shuffle:typeof TERMEND.shuffled==='function', rel:(()=>{ const r=SOCIAL.rel(a.who)||{}; return {fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom}; })() }; })"""
POST_JS = r"""(a=>{ const G=GAME.G, R=TERMEND.rec(G,a.term), F=G.flags||{}; const r=SOCIAL.rel(a.who)||{};
  return {result:R.result||null, hook:R.hook||null, done:R.done||null, heartDone:R.heartDone||null, kx:R.kx||null, ytDinnerYes:F.YT_DINNER_YES==null?null:F.YT_DINNER_YES, dating:!!F['dating_'+a.who],
    confessed:(F.confessed||{})[a.who]==null?null:F.confessed[a.who], think:((TERMEND.rec(G).think)||{})[a.who]==null?null:TERMEND.rec(G).think[a.who], rel:{fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom},
    fxCap:((F.FX_CAP||{})[a.who])||null }; })"""
FETCH_JS = r"""(async ps=>{ const out={}; for(const p of ps){ try{ const r=await fetch(p,{cache:'no-store'}); out[p]=r.ok?await r.text():null; }catch(e){ out[p]=null; } } return out; })"""


# ---------------- 共用 ----------------
def base_state():
    s = json.load(open(SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    return s


def lines_txt(head, dl):
    with open(LINES_TXT, 'a', encoding='utf-8') as f:
        f.write('\n==== %s ====\n' % head)
        for e in dl:
            k = e.get('k')
            if k == 'say': f.write('%s｜%s\n' % (e.get('name') or ('（旁白）' if not e.get('who') else e.get('who')), e['v']))
            elif k == 'cap': f.write('【字幕】%s\n' % e['v'])
            elif k == 'choose': f.write('【選項】%s\n' % '／'.join(str(x) for x in (e['v'] or [])))
            elif k == 'pick': f.write('【選了】第 %s 個\n' % e['v'])
            elif k == 'fx': f.write('【fx】%s fx=%s 實際=%s 上限鍵=%s max=%s\n' % (e.get('id'), J(e.get('fx')), J(e.get('ret')), e.get('cap'), e.get('max')))
            elif k == 'adj': f.write('【adjust】%s %s\n' % (e.get('id'), J(e.get('dd'))))


async def load(pg, cdp, st, why, settle=True):
    await L.load_state(pg, st, quiet_phone=True)
    pre = []
    if settle:
        await pg.wait_for_timeout(3500); await pe.settle(pg, cdp, pre, 30)
        await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS)
    else:
        await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS); await pg.wait_for_timeout(1500)
    R.setup(why)
    return pre


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CH_AT, k)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return True


def score(o):
    f = o.get('fx') or {}
    return (f.get('love') or 0) * 10 + (f.get('fr') or 0)


def make_pick(segs):
    """選單怎麼選：「出發」先選；稿上的那一組照 PICK；告白選單照 CONF_PICK；其他（鉤子、KX_ASK、她問你的）選第一個能選的"""
    def pick(o):
        T = [x['t'] for x in o]
        for i, t in enumerate(T):
            if t.startswith('出發') and not o[i]['dim']: return i
        for s in segs:
            if s.get('ordered') and s.get('menu') and T == s['menu']: return min(CONF_PICK, len(T) - 1)
            if s.get('opts') and not s.get('ordered') and set(T) == set(x['t'] for x in s['opts']):
                by = {x['t']: x for x in s['opts']}
                if PICK == 'first': return 0
                if PICK == 'last': return len(T) - 1
                if PICK.startswith('idx:'):
                    n = int(PICK[4:]); want = s['opts'][min(n, len(s['opts']) - 1)]['t']; return T.index(want)
                best = max(range(len(T)), key=lambda i: (score(by[T[i]]) if PICK != 'min' else -score(by[T[i]]), -i))
                return best
        for i, x in enumerate(o):
            if not x['dim']: return i
        return 0
    return pick


async def drive(pg, cdp, tag, pick, done, max_s=600):
    t0 = time.time(); last = time.time(); sig = None; idle = 0; picks = []; stuck = False; fin = False
    while time.time() - t0 < max_s:
        if await pg.evaluate(PHONE_OPEN_JS): await pe.close_phone(pg, cdp)
        q = await L.state(pg); n = await pg.evaluate("(window.__DL||[]).length")
        s = (q['dtext'], q['choices'], q['zone'], n, q['busy'], q['dlg'])
        if s != sig: sig = s; last = time.time()
        elif time.time() - last > STUCK_S:
            stuck = True; R.note('%s %d 秒沒有進展：%s' % (tag, STUCK_S, J(q))); break
        if q['choices']:
            o = await pe.opts(pg); k = pick(o)
            picks.append({'opts': [x['t'] for x in o], 'pick': k, 'n': n})
            if not await tap_choice(pg, cdp, k): await pg.wait_for_timeout(500)
            idle = 0; continue
        if q['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); idle = 0; continue
        if not q['busy'] and await done(): idle += 1
        else: idle = 0
        if idle >= 3: fin = True; break
        await pg.wait_for_timeout(500)
    return {'stuck': stuck, 'done': fin, 'secs': round(time.time() - t0, 1), 'picks': picks}


async def one_run(pg, cdp, tag, st, why, qid, segs, errs):
    """讀 st（飯前）→ 出發 → 一路點到出遊結束。回傳這一次的紀錄"""
    e0 = len(errs); fb0 = await pg.evaluate("GAME.walkFallbacks|0")
    await load(pg, cdp, st, why, settle=False)

    async def done():
        s = await pg.evaluate(OUTQ_JS, qid); return bool(s) and s['state'] != 'planned' and not await pg.evaluate(ADV_JS)
    dr = await drive(pg, cdp, tag, make_pick(segs), done)
    dl = await pg.evaluate(LOG_JS); q = await L.state(pg)
    fb = await pg.evaluate("GAME.walkFallbacks|0")
    return {'why': why, 'dl': dl, 'drive': dr, 'end': {k: q.get(k) for k in ('zone', 'dlg', 'choices', 'busy', 'hour', 'dtext')}, 'out': await pg.evaluate(OUTQ_JS, qid),
            'errs': errs[e0:], 'walkFallbacks': [fb0, fb]}


def says(dl, a, b):
    return [e['v'] for e in dl[a:b] if e.get('k') == 'say']


def find_menu(dl, start, seg):
    for i in range(start, len(dl)):
        e = dl[i]
        if e.get('k') != 'choose': continue
        T = [str(x) for x in (e.get('v') or [])]
        if seg.get('ordered'):
            if seg.get('all') and any(t in T for t in seg['all']): return i
            if seg.get('menu') and T == seg['menu']: return i
        elif set(T) == set(o['t'] for o in seg['opts']): return i
    return None


def menu_orders(dl, segs):
    out = []; cur = 0
    for s in segs:
        if not s.get('opts') or s.get('ordered'): continue
        i = find_menu(dl, cur, s)
        out.append(dl[i]['v'] if i is not None else None)
        if i is not None: cur = i + 1
    return out


def analyze(t, case, run, segs, info, check=True):
    """一次跑的紀錄照稿比對。check=False（重跑那幾次）只記不判"""
    dl = run['dl']; who = case['who']; res = {'segs': []}
    ck = (lambda name, ok, det='': R.check(name, ok, det)) if check else (lambda name, ok, det='': ok)
    start = 0
    for i, e in enumerate(dl):
        if e.get('k') == 'choose' and any(str(x).startswith('出發') for x in (e.get('v') or [])): start = i + 1; break
    res['start'] = start
    allsay = says(dl, start, len(dl))
    me = info.get('name') or '祐廷'
    replies = [e['v'] for e in dl[start:] if e.get('k') == 'say' and not e.get('who') and e.get('name') == me and e['v'] in (info.get('reply') or [])]
    res['auto_reply'] = replies
    fxs = [e for e in dl[start:] if e.get('k') == 'fx' and e.get('id') == who]
    love = sum(((e.get('ret') or {}).get('npcRom') or 0) for e in fxs)
    adjl = sum(((e.get('dd') or {}).get('npcRom') or 0) for e in dl[start:] if e.get('k') == 'adj' and e.get('id') == who)
    res['fx_love'] = love; res['adj_love'] = adjl
    bad = [e['v'] for e in dl if e.get('k') in ('say', 'cap') and re.search(r'undefined|\[object|NaN', str(e['v']))] + \
          [x for e in dl if e.get('k') == 'choose' for x in (e.get('v') or []) if x is None or re.search(r'undefined|\[object|NaN', str(x))]
    res['undefined'] = bad
    ck('%s 沒有 undefined／[object／NaN（say、字幕、選項）' % t, not bad, J(bad[:4]))
    ck('%s 流程走完（沒有 %d 秒沒進展、沒有逾時）、最後沒有對話框或選單開著' % (t, STUCK_S), run['drive']['done'] and not run['drive']['stuck'] and not run['end']['dlg'] and not run['end']['choices'], J({k: run['drive'][k] for k in ('stuck', 'done', 'secs')}) + ' ' + J(run['end']))
    ck('%s 出遊結束（OUT 不是 planned）' % t, bool(run['out']) and run['out']['state'] != 'planned', J(run['out']))
    ck('%s 沒有 JS 例外' % t, not run['errs'], J(run['errs'][:3]))
    ck('%s walkFallbacks 沒有增加' % t, run['walkFallbacks'][0] == run['walkFallbacks'][1], J(run['walkFallbacks']))
    seqv = [e['v'] for e in dl if e.get('k') in ('say', 'cap')]
    dups = [[i, seqv[i]] for i in range(1, len(seqv)) if seqv[i] == seqv[i - 1] and str(seqv[i]).strip()]
    res['dups'] = dups
    ck('%s 沒有同一句連續兩次' % t, not dups, J(dups[:4]))
    expect = case.get('expect') or 'opts'
    kind = case['kind']
    if kind == 'friend':
        res['friend_reply'] = replies
        if check: R.note('%s 朋友版：祐廷自動回 %s（朋友版照舊有）；她的戀愛 applyFx %s、adjust %s' % (t, J(replies), love, adjl))
        return res
    if OLD:
        allopt = set(x for s in segs for x in (s.get('all') or [])) - set(info.get('say3') or []) - {info.get('notYet')}   # 和舊版原本一字不差的不算
        hit = [e['v'] for e in dl if e.get('k') == 'choose' and allopt & set(str(x) for x in (e.get('v') or []))]
        ck('%s 【舊版對照】沒有稿上的選項（舊版還沒有 TERMEND_OPTS）' % t, not hit, J(hit[:2]))
        if kind == 'gf':
            ck('%s 【舊版對照】祐廷自動回「嗯。」「真的假的。」（話題池照舊）' % t, bool(replies) or not info.get('pool'), J(replies) + ' 話題池 %d 句' % len(info.get('pool') or []))
        res['old_menus'] = [e['v'] for e in dl[start:] if e.get('k') == 'choose']
        return res
    if expect == 'old':   # 稿沒匯的人（芷若、沛珊告白）：不該出現稿上的字；說出來那一組照遊戲原本的三句＋（先不說）
        # 稿上和遊戲原本一字不差的（「我喜歡妳。」）不算：只看稿才有的字
        allopt = set(x for s in segs for x in (s.get('all') or [])) - set(info.get('say3') or []) - {info.get('notYet')}
        hit = [e['v'] for e in dl if e.get('k') == 'choose' and allopt & set(str(x) for x in (e.get('v') or []))]
        ck('%s 稿沒匯：沒有稿上才有的飯桌選項、告白選項（%d 句）' % (t, len(allopt)), not hit, J(hit[:2]))
        menu = (info.get('say3') or []) + [info.get('notYet')]
        got = [e['v'] for e in dl[start:] if e.get('k') == 'choose']
        ck('%s 稿沒匯：說出來的選單＝遊戲原本的三句＋「（先不說）」' % t, menu in got, '期望 %s；實際選單 %s' % (J(menu), J(got)))
        res['menus'] = got
        return res
    cap = 3 if kind == 'heart' else 2
    ck('%s 一頓她的戀愛（applyFx 實際加的）合計 ≤ +%d' % (t, cap), love <= cap, '合計 %s；applyFx %s；adjust 合計 %s' % (love, J([[e.get('fx'), e.get('ret'), e.get('cap'), e.get('max')] for e in fxs]), adjl))
    if kind == 'gf':
        ck('%s 祐廷沒有自動回 REPLY（「嗯。」「真的假的。」「我也是。」）' % t, not replies, J(replies))
        exp_txt = set(x for s in segs for x in (s.get('say') or []) + [y for o in s.get('opts') or [] for y in o.get('re') or []])
        pl = [x for x in (info.get('pool') or []) if x in allsay and x not in exp_txt and x not in (info.get('hook') or [])]
        res['pool_said'] = pl
        ck('%s 不接朋友的話題池（POOL.%s.%s 沒有一句出現）' % (t, case['term'], who), not pl, J(pl[:3]))
    cur = start
    for s in segs:
        r = {'id': s['id']}; res['segs'].append(r)
        if s['id'].endswith('.none'):
            hit = [e['v'] for e in dl[start:] if e.get('k') == 'choose' and set(s.get('all') or []) & set(str(x) for x in (e.get('v') or []))]
            if s['id'] == 'confess.none':
                ck('%s [%s] 說出來的選項照原本（稿篩完不是三個）' % (t, s['id']), (s.get('menu') or []) in [e['v'] for e in dl[start:] if e.get('k') == 'choose'], J(s.get('menu')))
            else:
                ck('%s [%s] 沒有接稿上的選項（飯桌那一句不在稿的 after）' % (t, s['id']), not hit, J(hit[:2]))
            continue
        if not s.get('opts') and not s.get('ordered'):   # 只有一句（學姊大二上 noYOUPAY）
            seq = says(dl, cur, len(dl)); ok = any(seq[i:i + len(s['say'])] == s['say'] for i in range(len(seq)))
            ck('%s [%s] 她說的照稿：%s' % (t, s['id'], J(s['say'])), ok, '')
            continue
        i = find_menu(dl, cur, s)
        r['menu_at'] = i
        if s.get('ordered'):
            ck('%s [%s] 說出來的選項照稿、照順序（不洗）＋「（先不說）」第四個' % (t, s['id']), i is not None and dl[i]['v'] == s['menu'], '期望 %s；實際 %s' % (J(s['menu']), J(dl[i]['v'] if i is not None else [e['v'] for e in dl[cur:] if e.get('k') == 'choose'])))
        else:
            ck('%s [%s] 三個選項的字照稿（開頭用 %s）' % (t, s['id'], s.get('why') or ''), i is not None, '期望 %s；實際選單 %s' % (J(sorted(o['t'] for o in s['opts'])), J([e['v'] for e in dl[cur:] if e.get('k') == 'choose'])))
            if s.get('snowNot'):
                hit = [e['v'] for e in dl[start:] if e.get('k') == 'choose' and set(s['snowNot']) & set(str(x) for x in (e.get('v') or []))]
                ck('%s 沒有 SNOWQ＝不演 snow 那一段的選項' % t, not hit, J(hit[:1]))
        if i is None: continue
        r['order'] = dl[i]['v']
        prev = max([j for j in range(start, i) if dl[j].get('k') in ('choose', 'pick')] + [start - 1]) + 1
        before = says(dl, prev, i); r['before'] = before
        if s.get('say'):
            ck('%s [%s] 她說的（選項前）照稿' % (t, s['id']), before[-len(s['say']):] == s['say'], '期望 %s；實際 %s' % (J(s['say']), J(before[-max(len(s['say']), 1) - 2:])))
        k = dl[i + 1]['v'] if i + 1 < len(dl) and dl[i + 1].get('k') == 'pick' else None
        if k is None:
            ck('%s [%s] 有選（pick）' % (t, s['id']), False, ''); continue
        chosen = dl[i]['v'][k]; r['picked'] = chosen
        o = next((x for x in s['opts'] if x['t'] == chosen), None)
        nxt = next((j for j in range(i + 2, len(dl)) if dl[j].get('k') == 'choose'), len(dl))
        after = says(dl, i + 2, nxt); r['after'] = after[:8]
        if s.get('ordered'):
            fxe = [e for e in dl[i + 2:nxt] if e.get('k') == 'fx' and e.get('id') == who]
            if k < 3 and o:
                ck('%s [%s] 選「%s」：fx＝稿 %s' % (t, s['id'], chosen, J(o.get('fx'))), (not o.get('fx') and not fxe) or (bool(fxe) and fxe[0].get('fx') == o['fx']), J([e.get('fx') for e in fxe]))
                res['confess_result'] = None
                if o.get('yesLead'):
                    yl = o['yesLead']; seq = says(dl, i + 2, len(dl)); got = any(seq[j:j + len(yl)] == yl for j in range(len(seq)))
                    r['yesLead_seen'] = got
            cur = i + 1; continue
        if not o:
            ck('%s [%s] 選的「%s」在稿上' % (t, s['id'], chosen), False, ''); continue
        ck('%s [%s] 選「%s」以後她的回話照稿' % (t, s['id'], chosen), after[:len(o['re'])] == o['re'], '期望 %s；實際 %s' % (J(o['re']), J(after[:len(o['re']) + 1])))
        if s.get('then'):
            th = after[len(o['re']):len(o['re']) + len(s['then'])]
            ck('%s [%s] then（選項之後她接著說）照稿' % (t, s['id']), th == s['then'], '期望 %s；實際 %s' % (J(s['then']), J(th)))
        fxe = [e for e in dl[i + 2:nxt + 1] if e.get('k') == 'fx' and e.get('id') == who]
        r['fx'] = [[e.get('fx'), e.get('ret')] for e in fxe]
        ok_fx = (not o.get('fx') and not fxe) or (len(fxe) == 1 and fxe[0].get('fx') == o['fx'])
        ck('%s [%s] 效果＝稿 fx %s（SOCIAL.applyFx 收到的）' % (t, s['id'], J(o.get('fx'))), ok_fx, J(r['fx']))
        cur = i + 1
    return res


async def case_run(pg, cdp, errs, cid):
    case = CASE_DEF.get(cid)
    t = '[%s]' % cid
    if not case:
        R.check('%s 認得這個 case' % t, False, J(list(CASE_DEF))); return
    who, term, kind = case['who'], case['term'], case['kind']
    res = {'case': case, 'runs': []}; RESULT['cases'][cid] = res
    R.note('%s %s' % (t, case['label']))
    w = await pg.evaluate(WIN_JS, term); res['window'] = w
    if not R.check('%s 前置：有 %s 的期末時段（TERMEND.windowOf）' % (t, term), bool(w), J(w)): return
    st = base_state()
    ld = await pg.evaluate(DK_JS, case['load']) if case.get('load') else w['from']
    st.update({'day': ld, 'hour': case.get('loadH', 12.0), 'invites': []})
    try: st['weekday'] = await pg.evaluate(WD_JS, ld)
    except Exception: pass
    fl = dict(st.get('flags') or {}); fl.update(case.get('flags') or {})
    for k in case.get('unflags') or []: fl.pop(k, None)
    st['flags'] = fl
    why = '%s 讀 day46 存檔、日期改到 %s（第 %d 天）%.2f 點、清邀約；旗標 %s、拿掉 %s' % (t, case.get('load') or w['fromKey'], ld, st['hour'], J(case.get('flags') or {}), J(case.get('unflags') or []))
    pre = await load(pg, cdp, st, '【捷徑】' + why)
    if pre: R.note('%s 讀檔以後先有的劇情（pe.settle 點完）：%s' % (t, J(pre[-6:])))
    rel = {'npcRom': 80, 'fam': 65, 'trust': 50, 'comf': 45} if kind == 'heart' else ({'npcRom': 60, 'fam': 65, 'trust': 50, 'comf': 45} if kind in ('gf', 'kexin') else {'fam': 45, 'trust': 30})
    a = {'who': who, 'term': term, 'kind': kind, 'flags': case.get('flags') or {}, 'unflags': case.get('unflags') or [], 'evDone': case.get('evDone') or [], 'evUndo': case.get('evUndo') or [],
         'rel': rel, 'dating': kind in ('gf', 'kexin')}
    su = await pg.evaluate(SETUP_JS, a); res['setup'] = su
    R.setup('%s【捷徑】%s；關係至少 %s；%s；這學期的邀約重算（刪 plan、picked）→ %s → %s' % (
        t, '交往中（ROM.start：%s）' % su.get('romStart') if a['dating'] else '不設交往', J(rel), '事件做過 %s、拿掉 %s' % (J(a['evDone']), J(a['evUndo'])),
        J(su.get('plan')), ('TERMEND.planKexin' if kind == 'kexin' else 'F.%s＋TERMEND.pickCheck（＝手機回「好。」）' % ('TE_GF' if kind == 'gf' else 'TE_PICK'))))
    q = su.get('q')
    if not R.check('%s 排好了這一頓（OUT 有一筆 planned）' % t, bool(q), J(su)): return
    R.note('%s 排好：%s' % (t, J(q)))
    s0 = await pg.evaluate(SNAP_JS); s0 = dict(s0.get('G', s0)) if isinstance(s0, dict) else s0
    s0['day'] = q['day']; s0['hour'] = round(q['h'] - 0.4, 4)
    try: s0['weekday'] = await pg.evaluate(WD_JS, q['day'])
    except Exception: pass
    # 先讀一次飯前的狀態，算條件、遊戲原本的字（不出發）
    await load(pg, cdp, s0, '%s【捷徑】日期時間改到這一頓（%s %.2f）前 0.4 小時（G 其他欄位不動），先讀條件' % (t, q['dayKey'], q['h']), settle=False)
    info = await pg.evaluate(INFO_JS, {'who': who, 'term': term, 'kind': kind, 'conds': COND_KEYS + ['term:' + term]}); res['info'] = info
    C = dict(info.get('c') or {})
    R.note('%s 飯前：條件 %s；交往 %s；路線 %s；她的關係 %s；上限 %s；有 TERMEND_OPTS %s' % (t, J(C), info.get('dating'), info.get('route'), J(info.get('rel')), info.get('cap'), info.get('has')))
    if not OLD: R.check('%s 新版有 TERMEND_OPTS、TERMEND.optIf' % t, bool(info.get('has')), '')
    if kind == 'gf': segs, key = gf_expect(who, term, C, info.get('gameTbt'))
    elif kind == 'kexin': segs, key = kx_expect(term, C)
    elif kind == 'heart': segs, key = heart_expect(who, term, C, info.get('tl'), info.get('say3'), info.get('notYet'))
    else: segs, key = [], None
    if kind == 'heart' and key: R.note('%s 期望的備註：%s' % (t, J(key)))
    if segs is None:
        R.check('%s 稿上有這一頓（%s）' % (t, key), False, ''); segs = []
    # 舊版（TAG=old）：條件全是 null，期望只拿來比「稿上的選項沒有出現」（每一段的 all）
    res['expect'] = segs
    R.note('%s 期望（稿）：%s' % (t, J([dict([(k, s.get(k)) for k in ('id', 'why', 'say', 'menu')], opts=[o['t'] for o in s.get('opts') or []]) for s in segs])))
    runs = [('main', s0, '同一份存檔，出發')]
    shuf = SHUF and kind in ('gf', 'kexin') and any(s.get('shuffle') and len(s.get('opts') or []) > 1 for s in segs)
    if shuf: runs.append(('same', copy.deepcopy(s0), '【捷徑】同一份存檔重讀一次（同一天：順序要一樣）'))
    orders = {}
    for rid, st_, why in runs:
        run = await one_run(pg, cdp, '%s(%s)' % (t, rid), st_, '%s %s' % (t, why), q['id'], segs, errs)
        run['post'] = await pg.evaluate(POST_JS, {'who': who, 'term': term})
        lines_txt('%s %s %s（%s）%s' % (TAG, cid, rid, case['label'], why), run['dl'])
        SEEN_TEXT.extend(seen_of(run['dl']))
        an = analyze(t if rid == 'main' else '%s(%s)' % (t, rid), case, run, segs, info, check=(rid == 'main'))
        run['analysis'] = an; orders[rid] = menu_orders(run['dl'], segs)
        res['runs'].append({k: v for k, v in run.items()})
        R.note('%s(%s) 選單順序 %s；選的 %s；她的戀愛 applyFx %s、adjust %s；結果 %s' % (t, rid, J(orders[rid]), J([p['opts'][p['pick']] for p in run['drive']['picks'] if p['opts']]), an.get('fx_love'), an.get('adj_love'), J(run['post'])))
        if rid == 'main':
            try: await pg.screenshot(path=os.path.join(OUT, 'te_%s_%s.jpg' % (TAG, cid)), type='jpeg', quality=70)
            except Exception: pass
            if kind == 'heart' and not OLD:
                R.note('%s 告白：結果 %s；說出來那一段 yesLead 有演 %s' % (t, J(run['post'].get('result')), J([x.get('yesLead_seen') for x in an['segs'] if x.get('id') == 'confess'])))
            if kind == 'gf' and who == 'heroine_03' and not OLD:
                ch = [x.get('picked') for x in an['segs'] if x.get('picked')]
                if ch and str(ch[0]).startswith('「我去。'): R.check('%s 選「我去。」＝記 YT_DINNER_YES' % t, run['post'].get('ytDinnerYes') is not None, J(run['post'].get('ytDinnerYes')))
        open(os.path.join(OUT, 'te_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
    if shuf:
        R.check('%s 同一天讀檔重來：選單順序一樣' % t, orders.get('same') == orders.get('main') and all(x is not None for x in orders.get('main') or [None]), J([orders.get('main'), orders.get('same')]))
        diff = False
        for k in (1, 2):
            st2 = copy.deepcopy(s0); st2['day'] = s0['day'] + k
            try: st2['weekday'] = await pg.evaluate(WD_JS, st2['day'])
            except Exception: pass
            for o in st2.get('outings') or []:
                if o.get('id') == q['id']: o['day'] = q['day'] + k
            tr = ((st2.get('termend') or {}).get(term) or {})
            for m in ('gfDay', 'heartDay'):
                if isinstance(tr.get(m), dict) and isinstance(tr[m].get(who), int) and tr[m][who] >= 0: tr[m][who] += k
            rid = 'day+%d' % k
            run = await one_run(pg, cdp, '%s(%s)' % (t, rid), st2, '%s【捷徑】同一頓改到 %d 天後（出遊、gfDay 一起改；換一天進去：順序要變）' % (t, k), q['id'], segs, errs)
            lines_txt('%s %s %s（%s）' % (TAG, cid, rid, case['label']), run['dl'])
            SEEN_TEXT.extend(seen_of(run['dl']))
            an = analyze('%s(%s)' % (t, rid), case, run, segs, info, check=False); run['analysis'] = an
            orders[rid] = menu_orders(run['dl'], segs); res['runs'].append(run)
            R.note('%s(%s) 選單順序 %s（同一組選項 %s）' % (t, rid, J(orders[rid]), orders[rid] and orders['main'] and orders[rid][0] is not None and orders['main'][0] is not None and set(orders[rid][0]) == set(orders['main'][0])))
            m0, m1 = (orders.get('main') or [None])[0], (orders.get(rid) or [None])[0]
            if m0 is not None and m1 is not None and m0 != m1: diff = True; break
        R.check('%s 換一天進去：第一組選項的順序變了（試到 %d 天後）' % (t, k), diff, J({x: (orders[x] or [None])[0] for x in orders}))
    res['orders'] = orders
    open(os.path.join(OUT, 'te_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))


async def main():
    global DR, DRSRC, RF, RFSRC
    print('CC TE（TERMEND-OPTS-1110 期末飯桌選項）：TAG %s；SHA %s；CASES %s；PICK %s；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(CASES), PICK), flush=True)
    open(LINES_TXT, 'a', encoding='utf-8').write('\n######## %s TAG=%s SHA=%s CASES=%s ########\n' % (time.strftime('%Y-%m-%d %H:%M:%S'), TAG, SHA, ','.join(CASES)))
    try:
        DR, DRSRC = load_drafts()
    except Exception as e:
        R.check('讀得到稿（DRAFT_REF／DRAFT_DIR）', False, repr(e)[:300]); print('FAILED 1: 讀不到稿', flush=True); return
    RF, RFSRC = load_fix()
    RESULT['drafts'] = DRSRC; RESULT['read_fix'] = RFSRC
    R.note('稿：%s；換名：%s' % (J(DRSRC), RFSRC))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]"); RESULT['version'] = ver; R.note('畫面上的版本：%s' % ver)
        imp = await pg.evaluate("(()=>typeof TERMEND_OPTS!=='undefined'&&TERMEND_OPTS?{src:TERMEND_OPTS.src, people:TERMEND_OPTS.people}:null)()")
        RESULT['termend_opts'] = imp; R.note('遊戲的 TERMEND_OPTS：%s' % J(imp))
        await pg.evaluate(HOOK_JS)
        for c in CASES:
            try: await case_run(pg, cdp, errs, c)
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
                RESULT['cases'].setdefault(c, {})['exception'] = repr(e)[:500]
            open(os.path.join(OUT, 'te_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
        # 第 2 項：畫面上出現過的字（全部 case、每一次跑）
        found = {s: [x for x in SEEN_TEXT if s in x['v']][:3] for s in OLD_STRINGS}
        RESULT['old_strings'] = found
        for s in OLD_STRINGS:
            if OLD: R.note('【舊版對照，不判定】畫面上的字有沒有「%s」：%s' % (s, J(found[s])))
            else: R.check('畫面上的字沒有舊字串「%s」（%d 句搜過）' % (s, len(SEEN_TEXT)), not found[s], J(found[s]))
        for s, cid, names in OLD_BY:
            mine = [x for x in SEEN_TEXT if s in x['v'] and x['k'] == 'say' and (x['who'] == cid or x['name'] in names)][:3]
            other = [x for x in SEEN_TEXT if s in x['v'] and x not in mine][:3]
            RESULT['old_strings']['%s@%s' % (s, cid)] = {'mine': mine, 'other': other}
            if OLD: R.note('【舊版對照，不判定】%s 說「%s」：%s；別人／字幕／選項：%s' % (names[0], s, J(mine), J(other)))
            else:
                R.check('畫面上 %s 沒有說舊字串「%s」（%d 句搜過）' % (names[0], s, len(SEEN_TEXT)), not mine, J(mine))
                if other: R.note('（參考，不判定）「%s」出現在別人的話、字幕或選項：%s' % (s, J(other)))
        try:   # 參考：資料檔還有沒有（不算判定）
            fs = await pg.evaluate(FETCH_JS, ['src/data/termend_lines.js', 'src/data/termend_opts.js'])
            st = {f: [s for s in OLD_STRINGS + [x[0] for x in OLD_BY] if txt and s in txt] for f, txt in fs.items()}
            RESULT['old_strings_static'] = st; R.note('（參考，不判定）資料檔裡還有的舊字串：%s' % J(st))
        except Exception as e:
            R.note('（參考）讀資料檔失敗 %r' % e)
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    RESULT['fails'] = R.fails
    open(os.path.join(OUT, 'te_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
