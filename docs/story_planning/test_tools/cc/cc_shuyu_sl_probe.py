"""CC（帳號 A）11-02 P3b：學姊（溫書瑀，heroine_05）大一上閒聊階梯 S-L1～S-L4 一層一層照玩家的方式走完（BB_229；AA_584 刪層以後條件鏈不能斷）。
不是 iPhone：Playwright 手機模擬（橫向 844×390、is_mobile、CDP 觸控；SwiftShader 1～4 fps）。預設不加 ?turbo（走路是真的走）；TURBO=1 才加。

讀碼看到的規則（ef63b1877）：
- 階梯資料 src/data/ladder.js（tools/ladder/import_ladder.py 產生，源稿企劃線 03af79d17＝AA 照 AA_584 定案）LADDER.byTerm.Y1S1.heroine_05.steps，AA_584 以後的順序：
    0 S-L1   if stage≥ACQUAINTANCE；location library／campus；time 9～17；weekday 一～五
    1 S-L2   if stage≥ACQUAINTANCE＋flags classDone（民總第一堂上過）
    2 S-L3   if stage≥ACQUAINTANCE＋flags SIS_CLUB_EXPO、LAWCLUB_SAT_FIRST（社博報名、去過一次週六法服）；skipIf stage≥FAMILIAR 且沒有 LAWCLUB_SAT_FIRST
    3 S-Lx3  if stage≥ACQUAINTANCE；location library；week 3～15；選項帶記憶 GRAD_SCHOOL_DISCUSSION
    4 S-L4   if stage≥FAMILIAR（熟悉度 fam≥20）
    5 S-L5、6 S-Lx2、7 S-L7（原本第 8 位的 S-L8 被 AA_584 刪掉；舊存檔換算 story3d.js S.LAD_DEL.aa584 heroine_05:[8]）
  「S-L1～L4」照資料是 S-L1、S-L2、S-L3、S-Lx3、S-L4 五層（S-Lx3 夾在 S-L3 和 S-L4 中間，走到 S-L4 一定要先過它），這支五層都走。
- 推進（story3d.js S.ladNext／S.ladPlay／S.ladderTalk）：每人每天最多一層（G.social.ladderDay[id]＝推進的那一天）；條件不到或今天推進過＝短招呼；
  推進＝G.social.ladder.heroine_05 加一、ladderDay＝今天、SOCIAL.adjust(rel)、SOCIAL.remember(mem)、SOCIAL.activity chat／chatNew。
- 總圖 3F 閱覽室（library）她是劇情的 sis（GAME.npc.sis，說話走 talkSis）：EVENTS.onInteract → met_sis → relUp（升到有點熟那次只說門檻台詞「你最近很常來法圖」，這次不聊階梯）
  → ladderTalk → offerInvite（約她去…／交換聯絡方式／就這樣：點「就這樣」）。大一上平日 9～17 她在總圖（characters.js daily_schedule；第 8～9 週下午在法圖，這支避開）。
- LAWCLUB_SAT_FIRST：story3d.js S.fafuWatch——單週週六 9～12（第 3 週起、考試週與假日不值班，S.fafuDuty）在萬才館大廳點「在旁邊看法服值班」(2.3,3.1)。

流程（一個瀏覽器、橫向）：
  [前置] 讀檔到大一上第 3 週週一 10:00 總圖 3F；旗標 classDone、SIS_CLUB_EXPO、met_sis，ev_sis_w1 記成演過（認識學姊那一場）；
  【捷徑】SOCIAL.meet＋熟悉度 5（ACQUAINTANCE），快照再讀。沒有 LAWCLUB_SAT_FIRST。
  第 1 天：走到她旁邊、按「和…說話」、點對話、選選項 → S-L1。反例①：同一天再找她說話 → 不推進（短招呼）。
  【前置／捷徑】每兩層之間：同一份進度（GAME.snapshot）跳到下一個平日 10:00 總圖（不是遊戲裡的睡覺；ladderDay 只比 G.day，標明）。
  第 2 天：S-L2。第 3 天：反例②——還沒去過法服，S-L3 不出現、後面的 S-Lx3 也不會越過它提早出現（進度停在 2）。
  【前置】跳到那一週的值班週六 9:15 萬才館：走到「在旁邊看法服值班」、按、點完 → LAWCLUB_SAT_FIRST。
  下一個平日：S-L3；再下一天：S-Lx3（記憶 GRAD_SCHOOL_DISCUSSION）；之後每天找她（升階那次只聽門檻台詞、同一天再找一次）直到 S-L4（最多 SL4_DAYS 天）。
  OLDSAVE=1（預設）：另外讀一份 AA_584 以前的舊存檔（進度 4、沒有 ladDel、有點熟）→ 找她說話 → 播 S-L4（換算後沒有把 S-L1～L4 這一段推錯位）。
c89a5f9be 起（D127 小聲講，AA_595；src/libquiet3d.js）：讀書區（總圖 3F 閱覽區等）**每天**第一次按「和她說話」＝LIBQ.gate 只播一句點頭旁白
  （「（她抬頭看到你，點了一下頭。）」，G.libNod 記今天見過），這次不說話、不推進；之後的台詞前面加「（小聲）」（開頭有動作括號的合成「（…，小聲）」）。
  探針照玩家：點頭那一次記下來（要確認進度、relUp 沒動），同一天再找她一次才是真的聊天；比對台詞時把「（小聲）」前綴拿掉。舊版（沒有 LIBQ）不會點頭，流程照舊。
  推進的判斷不變（一天最多一層、條件鏈、S-L4 要有點熟）；反例①＝點頭、推進以後同一天再找她。
判斷都讀遊戲狀態（G.social.ladder／ladderDay、SOCIAL 記憶、旗標）；畫面上的台詞（對話框）只確認玩家看得到，比對用 startswith。
用法：LW_TESTS=<受測工作樹>/tests python3 cc_shuyu_sl_probe.py <URL index.html> <輸出資料夾>
環境變數：TURBO（0）、OLDSAVE（1）、SL4_DAYS（4）、TALK_MAX（秒，每次說話上限 480）。最後一行 ALL PASS 或 FAILED n；exit 0／1；transcript.json。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
if os.environ.get('TURBO', '0') == '1' and 'turbo' not in URL: URL = URL + ('&' if '?' in URL else '?') + 'turbo'
J = lambda o: json.dumps(o, ensure_ascii=False)
OLDSAVE = os.environ.get('OLDSAVE', '1') == '1'
SL4_DAYS = int(os.environ.get('SL4_DAYS', '4'))
TALK_MAX = int(os.environ.get('TALK_MAX', '480'))
CID = 'heroine_05'
EXPECT_IDS = ['S-L1', 'S-L2', 'S-L3', 'S-Lx3', 'S-L4', 'S-L5', 'S-Lx2', 'S-L7']   # AA_584 以後的大一上（S-L8 刪掉）
PICKS = ['「謝謝妳。」', '「我還在背定義。」', '「去了，在旁邊聽。」', '「研究所在讀什麼？」', '「三包？」']   # 每一層點第一個選項
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False, 'met_sis': True, 'SIS_CLUB_EXPO': True, 'SIS_CONTACTED': True}
TRANS = {'steps': [], 'talks': []}

# 遊戲狀態（只讀；下一層用 ladData＋進度算，不呼叫會改狀態的 ladNext）
LAD_JS = """(id=>{ const G=GAME.G, so=G.social||{}, D=STORY.ladData(G,id), K=D?D.key:id, n=((so.ladder||{})[K])|0, st=D&&D.L.steps[n];
  const T=CALENDAR.termOf(G.day), r=SOCIAL.rel(id);
  return {day:G.day, key:CALENDAR.dateOf(G.day).key, wd:G.weekday, h:+(+G.hour).toFixed(2), zone:G.zone, term:T&&T.id, week:T&&T.week,
    lad:n, ladKey:K, ladDay:(so.ladderDay||{})[id]==null?null:(so.ladderDay||{})[id], next:st?st.id:null, nextFirst:st?(STORY.ladLines(st,G,id)[0]||''):'', nextAll:st?STORY.ladLines(st,G,id).map(l=>typeof l==='string'?l:(l&&l.t)||'').concat(STORY.ladChoices(st).flatMap(c=>[].concat(c.reply||[]))):[],
    nextFirstCh:st?STORY.ladChoices(st).map(c=>c.t):[], relUp:((so.relUp||{})[id])|0, evCount:(G.events&&G.events.count)|0,
    fam:r.fam|0, trust:r.trust|0, comf:r.comf|0, stage:SOCIAL.stage(id), mems:SOCIAL.memories(id).map(m=>m.tag||m.k||m.type||m),
    satFirst:!!(G.flags&&G.flags.LAWCLUB_SAT_FIRST), ladDel:so.ladDel||null}; })(%s)"""
STEPS_JS = """(id=>{ const B=LADDER.byTerm||{}, L=B.Y1S1&&B.Y1S1[id]; return L?L.steps.map(s=>s.id):null; })(%s)"""
PLAN_JS = """(()=>{ const out={}, dk=d=>CALENDAR.dateOf(d).key, ok=d=>{ const c=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); return c.wd>=1&&c.wd<=5&&!(CALENDAR.holiday&&CALENDAR.holiday(d))&&t&&t.id==='Y1S1'&&t.week>=3&&t.week<=7; };
  const wk=[]; for(let d=STORY.termDay('Y1S1',3,1), i=0; i<60&&wk.length<14; i++,d++) if(ok(d)) wk.push(d);
  let sat=null; for(let d=wk[2]+1; d<wk[2]+30; d++){ if(CALENDAR.dateOf(d).wd===6&&STORY.fafuDuty({day:d,stage:'law',hour:9.5,flags:{}})){ sat=d; break; } }
  out.wk=wk.map(d=>({d,key:dk(d),wd:CALENDAR.dateOf(d).wd,week:CALENDAR.termOf(d).week})); out.sat=sat==null?null:{d:sat,key:dk(sat),week:CALENDAR.termOf(sat).week}; return out; })()"""
SOCIAL_PREP_JS = """(id=>{ if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'library'); const r=SOCIAL.rel(id); r.fam=5; r.trust=Math.min(r.trust|0,5); r.comf=Math.min(r.comf|0,5);
  const so=GAME.G.social; so.ladder=so.ladder||{}; delete so.ladder[id]; so.ladderDay=so.ladderDay||{}; delete so.ladderDay[id];
  return {stage:SOCIAL.stage(id), fam:r.fam, first:SOCIAL.has(id,'FIRST_MET')}; })(%s)"""
NODS_JS = "(typeof LIBQ!=='undefined'&&LIBQ.NOD)?Object.values(LIBQ.NOD):[]"
NPCKEY_JS = """(id=>{ if(GAME.npc&&GAME.npc.sis&&GAME.npc.sis.obj) return 'sis'; if(GAME.npc&&GAME.npc[id]&&GAME.npc[id].obj) return id; const n=(GAME.E.npcs||[]).find(m=>m.charId===id); return n?(n.id||id):null; })(%s)"""


def fails_n(run): return len(run.fails)


async def lad(pg):
    return await pg.evaluate(LAD_JS % J(CID))


async def start_state(pg, key, hour, zone):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {'ev_sis_w1': d['d'] - 10}, 'last': {}, 'count': 1}, 'contacts': {}}
    st['flags'] = dict(BASEF)
    st.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in ('library', 'library_hall', 'wancai', 'linze', 'cafe', 'noodle', 'gongguan', 'wenzhou', 'lawlib', 'classroom')}
    return st, d


async def talk(pg, cdp, run, tag):
    """像玩家一樣找她說話一次：走到旁邊、按「和…說話」、點對話、選選項（PICKS，邀約選單點「就這樣」）。回傳 (前, 後, GAME.say 原文, 對話框看到的)"""
    key = await pg.evaluate(NPCKEY_JS % J(CID))
    b = await lad(pg)
    if not key:
        run.note('%s：學姊不在這一區（%s %s %.2f）' % (tag, b['key'], b['zone'], b['h'])); return b, b, [], None
    w = await P.wait_present(pg, key, 60)
    n0 = await P.say_hook(pg)
    r = await P.talk_to(pg, cdp, run, key, tag, picks=PICKS, max_s=TALK_MAX)
    said = await P.said(pg, n0)
    a = await lad(pg)
    TRANS['talks'].append({'tag': tag, 'npc': key, 'who': w, 'before': b, 'after': a, 'said': said, 'dialog': r})
    run.note('%s：進度 %s→%s（下一層 %s→%s）、relUp %s→%s、事件數 %s→%s、熟悉 %s→%s（%s）' % (tag, b['lad'], a['lad'], b['next'], a['next'], b['relUp'], a['relUp'], b['evCount'], a['evCount'], b['fam'], a['fam'], a['stage']))
    return b, a, said, r


def unquiet(t):
    """拿掉 D127 的「（小聲）」：開頭的「（小聲）」；合成進動作括號的「（…，小聲）」「（…，小聲。）」還原成原文（LIBQ.quiet 的反向）"""
    t = (t or '').strip()
    if t.startswith('（小聲）'): t = t[len('（小聲）'):]
    if t.startswith('（'):
        k = t.find('）')
        if k > 0:
            head = t[:k + 1].replace('，小聲。）', '。）').replace('，小聲）', '）')
            t = head + t[k + 1:]
    return t


def norm(t): return unquiet(t).strip().lstrip('「').strip()


NODS = []


def is_nod(said, b, a):
    """這一次只有 LIBQ.gate 的點頭旁白：沒有人開口、只有那一句，而且進度、relUp、事件數都沒動"""
    return bool(NODS) and len(said) >= 1 and all((not w) and (t or '').strip() in NODS for w, t in said) \
        and a['lad'] == b['lad'] and a['relUp'] == b['relUp'] and a['evCount'] == b['evCount']


def seen_line(said, dlg, first, alls=()):
    """GAME.say 有那一層的第一句（startswith）；對話框看得到那一層的台詞或回覆（任一句，startswith 前 6 個字）——
    兩個字的短句（「學弟。」）對話框輪詢常常整句漏掉（bbplay 的 say_hook 註解），所以畫面這一項看整層"""
    f = norm(first)
    in_say = any(norm(t).startswith(f) for _, t in said) if f else False
    shown = [norm(t) for _, t in ((dlg or {}).get('lines') or [])]
    cands = [norm(x) for x in ([first] + list(alls or [])) if norm(x)]
    in_box = any(s.startswith(c[:6]) for s in shown for c in cands)
    return in_say, in_box


NODLOG = []


async def advance_layer(pg, cdp, run, label, tries=5):
    """這一天找她說話直到推進一層：升階台詞、找她說話演的事件＝這次沒聊階梯，同一天再找一次（像玩家）；短招呼（什麼都沒變）＝今天推進不了。回傳 (前, 後, say, dlg, 是否推進)"""
    b0 = await lad(pg); last = None
    for k in range(tries):
        b, a, said, r = await talk(pg, cdp, run, '%s 第 %d 次' % (label, k + 1))
        last = (b0, a, said, r)
        if a['lad'] > b['lad']: return b, a, said, r, True
        if r is None: return b0, a, said, r, False
        if is_nod(said, b, a):
            NODLOG.append({'label': label, 'day': a['day'], 'try': k + 1})
            if sum(1 for x in NODLOG if x['day'] == a['day']) > 1:
                run.check('%s：同一天在讀書區只點頭一次（LIBQ：今天見過就不再點頭）' % label, False, J(NODLOG[-3:])); return b0, a, said, r, False
            run.note('%s：讀書區今天第一次遇到＝只點頭（D127 LIBQ.gate；進度、relUp 沒動），同一天再找她一次' % label); continue
        if a['relUp'] > b['relUp'] or a['evCount'] > b['evCount']:
            run.note('%s：這次是升階台詞／事件（relUp %s→%s、事件 %s→%s），同一天再找她一次' % (label, b['relUp'], a['relUp'], b['evCount'], a['evCount'])); continue
        return b, a, said, r, False
    return last[0], last[1], last[2], last[3], False


async def check_layer(pg, cdp, run, sid, label, extra=None):
    b, a, said, r, adv = await advance_layer(pg, cdp, run, label)
    in_say, in_box = seen_line(said, r, b['nextFirst'], b.get('nextAll'))
    ok = adv and b['next'] == sid.split('（')[0] and a['lad'] == b['lad'] + 1 and a['ladDay'] == a['day'] and in_say and in_box
    ex_ok, ex_info = True, ''
    if extra: ex_ok, ex_info = extra(b, a)
    shot = await run.shot(pg, 'after_' + sid)
    run.check('%s：%s（%s 第 %s 週 %s）照玩家方式推進一層' % (sid, label, a['key'], a['week'], a['zone']), ok and ex_ok,
              J({'next_before': b['next'], 'lad': [b['lad'], a['lad']], 'ladDay': a['ladDay'], 'day': a['day'], 'first': b['nextFirst'], 'say有': in_say, '對話框有': in_box,
                 'stage': a['stage'], 'fam': [b['fam'], a['fam']], 'extra': ex_info, 'shot': os.path.basename(shot)}))
    TRANS['steps'].append({'sid': sid, 'ok': ok and ex_ok, 'before': b, 'after': a})
    return ok and ex_ok, a


async def jump_day(pg, cdp, run, key, hour, zone, note):
    await P.jump(pg, cdp, run, key, hour, zone, pos=None, quiet=True, note='【捷徑】撥時間：同一份進度（G.social 階梯進度照留）換日，不是遊戲裡的睡覺；' + note)
    await P.wait_present(pg, (await pg.evaluate(NPCKEY_JS % J(CID))) or 'sis', 30)


async def fafu_watch(pg, cdp, run, sat):
    await jump_day(pg, cdp, run, sat['key'], 9.25, 'wancai', '值班週六（第 %s 週）9:15 萬才館大廳' % sat['week'])
    lab = '在旁邊看法服值班'
    s0 = await L.state(pg)
    got = await L.go_to(pg, cdp, run, 2.3, 3.1, 0.9, '萬才館圓桌旁（法服值班）', max_s=300, stop=lambda s: s['interact'].startswith(lab))
    s = await L.state(pg)
    run.note('萬才館：從 (%.1f,%.1f) 走到 (%.1f,%.1f)；互動按鈕「%s」' % (s0['x'], s0['z'], s['x'], s['z'], s['interact']))
    if got and s['interact'].startswith(lab):
        await L.tap(pg, cdp, '#interact')
        d = await P.dialog(pg, cdp, run, picks=(), max_s=300, tag='法服值班')
    else:
        d = None
    await run.shot(pg, 'fafu_watch')
    a = await lad(pg)
    return run.check('前置事件：值班週六在萬才館點「%s」（玩家方式）→ LAWCLUB_SAT_FIRST' % lab, bool(d and d['started']) and a['satFirst'],
                     J({'走到': got, '按鈕': s['interact'], 'satFirst': a['satFirst'], '台詞': (d or {}).get('lines', [])[:3]}))


async def main_flow(pg, cdp, run, errs):
    steps = await pg.evaluate(STEPS_JS % J(CID))
    run.check('階梯資料（AA_584 以後）：大一上學姊 %s' % J(steps), steps == EXPECT_IDS, J({'expect': EXPECT_IDS}))
    plan = await pg.evaluate(PLAN_JS)
    run.note('日程：平日 %s；值班週六 %s' % (J([w['key'] for w in plan['wk'][:10]]), J(plan['sat'])))
    if not run.check('前置：找得到第 3～7 週的平日和值班週六', len(plan['wk']) >= 8 and plan['sat'] is not None, J(plan)): return
    wk = plan['wk']; sat = plan['sat']
    after_sat = [w for w in wk if w['d'] > sat['d']]
    before_sat = [w for w in wk if w['d'] < sat['d']]
    if not run.check('前置：值班週六之前至少三個平日', len(before_sat) >= 3, J(before_sat)): return

    st, d = await start_state(pg, before_sat[0]['key'], 10.0, 'library')
    run.setup('[前置] 讀檔到 %s（大一上第 %s 週，週%s）10:00 總圖 3F；旗標 classDone、SIS_CLUB_EXPO、met_sis；ev_sis_w1 記成演過；沒有 LAWCLUB_SAT_FIRST' % (d['key'], d['week'], d['wd']))
    await P.load(pg, cdp, st, quiet=True)
    await P.prep(pg, cdp, run, SOCIAL_PREP_JS % J(CID), label='SOCIAL.meet 學姊＋熟悉度 5（認識、還沒有點熟）、階梯進度清成 0')
    a = await lad(pg)
    run.check('前置：開始狀態——認識（ACQUAINTANCE）、階梯進度 0、下一層 S-L1', a['stage'] == 'ACQUAINTANCE' and a['lad'] == 0 and a['next'] == 'S-L1', J(a))
    await run.shot(pg, 'start_library')

    # 第 1 天：S-L1
    ok1, a = await check_layer(pg, cdp, run, 'S-L1', '第 1 天在總圖找她說話')
    # 反例①：同一天再找她
    b, a2, said, r = await talk(pg, cdp, run, '反例①：同一天再找她說話')
    run.check('反例①：同一天第二次說話不推進（一天最多一層），S-L2 不提早出現', r is not None and a2['lad'] == b['lad'] and a2['next'] == b['next'] and not any(norm(t).startswith(norm(b['nextFirst'])) for _, t in said if b['nextFirst']),
              J({'lad': [b['lad'], a2['lad']], 'next': a2['next'], 'said': said[:4]}))

    # 第 2 天：S-L2
    await jump_day(pg, cdp, run, before_sat[1]['key'], 10.0, 'library', '下一個平日 10:00 總圖 3F')
    await check_layer(pg, cdp, run, 'S-L2', '第 2 天在總圖找她說話')

    # 第 3 天：反例②（還沒去過法服）
    await jump_day(pg, cdp, run, before_sat[2]['key'], 10.0, 'library', '下一個平日 10:00 總圖 3F')
    b, a3, said, r, adv = await advance_layer(pg, cdp, run, '反例②：還沒去過法服就找她說話')
    s3 = J({'lad': [b['lad'], a3['lad']], 'next': a3['next'], 'stage': a3['stage'], 'fam': a3['fam'], 'satFirst': a3['satFirst'], 'said': said[:4]})
    run.check('反例②：沒有 LAWCLUB_SAT_FIRST 時 S-L3 不出現、S-Lx3 也不越過它提早出現（進度停在 2）', r is not None and not adv and a3['lad'] == 2 and a3['next'] == 'S-L3' and not a3['satFirst'], s3)
    await run.shot(pg, 'counter2_no_fafu')

    # 值班週六：法服（LAWCLUB_SAT_FIRST）
    if not await fafu_watch(pg, cdp, run, sat):
        run.note('沒拿到 LAWCLUB_SAT_FIRST：S-L3 以後照樣試，但預期會失敗')

    # S-L3、S-Lx3
    await jump_day(pg, cdp, run, after_sat[0]['key'], 10.0, 'library', '值班週六之後第一個平日 10:00 總圖 3F')
    await check_layer(pg, cdp, run, 'S-L3', '去過法服以後的平日')
    await jump_day(pg, cdp, run, after_sat[1]['key'], 10.0, 'library', '下一個平日 10:00 總圖 3F')
    await check_layer(pg, cdp, run, 'S-Lx3', '下一個平日（總圖、第 3～15 週）',
                      extra=lambda b, a: ('GRAD_SCHOOL_DISCUSSION' in J(a['mems']) and 'GRAD_SCHOOL_DISCUSSION' not in J(b['mems']), '記憶 GRAD_SCHOOL_DISCUSSION 新增'))

    # S-L4：有點熟（fam≥20）以後
    got = False; i = 2
    for k in range(SL4_DAYS):
        if i + k >= len(after_sat): break
        w = after_sat[i + k]
        await jump_day(pg, cdp, run, w['key'], 10.0, 'library', '下一個平日 10:00 總圖 3F（找 S-L4，第 %d 天）' % (k + 1))
        cur = await lad(pg)
        if cur['next'] != 'S-L4':
            run.check('S-L4 前：下一層是 S-L4', False, J(cur)); break
        if cur['stage'] not in ('FAMILIAR', 'FRIEND', 'CLOSE_FRIEND'):
            b, a4, said, r, adv = await advance_layer(pg, cdp, run, 'S-L4 前（還沒有點熟）')
            run.check('反例③：還沒有點熟（%s，熟悉 %s）時 S-L4 不出現' % (b['stage'], b['fam']), not adv or a4['stage'] != b['stage'], J({'lad': [b['lad'], a4['lad']], 'stage': [b['stage'], a4['stage']]}))
            continue
        ok, a = await check_layer(pg, cdp, run, 'S-L4', '有點熟以後的平日')
        got = True; break
    if not got: run.check('S-L4：%d 個平日內走到' % SL4_DAYS, False, J(await lad(pg)))


async def old_save(pg, cdp, run):
    """AA_584 以前的舊存檔：進度 4（下一層 S-L4）、沒有 ladDel、有點熟 → 讀檔換算後還是 S-L4"""
    plan = await pg.evaluate(PLAN_JS)
    w = plan['wk'][-1]
    st, d = await start_state(pg, w['key'], 10.0, 'library')
    st['flags']['LAWCLUB_SAT_FIRST'] = True
    await P.load(pg, cdp, st, quiet=True)
    js = """(id=>{ if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'library'); const r=SOCIAL.rel(id); r.fam=26; SOCIAL.markUp(id,2);
      const so=GAME.G.social; so.ladder=so.ladder||{}; so.ladder[id]=4; so.ladderDay=so.ladderDay||{}; delete so.ladderDay[id]; delete so.ladDel; return {lad:so.ladder[id], stage:SOCIAL.stage(id)}; })(%s)""" % J(CID)
    run.setup('[前置] 舊存檔：%s 10:00 總圖 3F；【捷徑】階梯進度 4、拿掉 ladDel（AA_584 以前的存檔）、熟悉 26、門檻台詞聽過' % d['key'])
    await P.prep(pg, cdp, run, js, label='做成 AA_584 以前的舊存檔')
    ok, a = await check_layer(pg, cdp, run, 'S-L4（舊存檔）', '舊存檔（AA_584 以前，進度 4）讀進來找她說話',
                              extra=lambda b, a: (bool(a['ladDel'] and a['ladDel'].get('aa584')), 'ladDel.aa584 記上'))


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('cc_shuyu_sl', OUT)
    print('cc_shuyu_sl_probe  URL=%s  OLDSAVE=%s  SL4_DAYS=%d' % (URL, OLDSAVE, SL4_DAYS), flush=True)
    t0 = time.time()
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.set_default_timeout(180000)
        try:
            await pg.goto(URL)
            if run.check('遊戲載入', await L.wait_loaded(pg, 300)):
                await P.init(pg)
                NODS[:] = await pg.evaluate(NODS_JS)
                run.note('讀書區點頭旁白（LIBQ.NOD；舊版沒有＝不點頭）：%s' % J(NODS))
                try:
                    await main_flow(pg, cdp, run, errs)
                except Exception:
                    run.check('主流程沒有例外', False, traceback.format_exc()[-1500:])
                if OLDSAVE:
                    try:
                        await old_save(pg, cdp, run)
                    except Exception:
                        run.check('舊存檔流程沒有例外', False, traceback.format_exc()[-1500:])
                run.check('沒有 JS 錯誤（pageerror）', not errs, '; '.join(errs[:5]))
        finally:
            TRANS['secs'] = round(time.time() - t0)
            with open(os.path.join(OUT, 'transcript.json'), 'w', encoding='utf-8') as f: json.dump(TRANS, f, ensure_ascii=False, indent=1)
            await b.close()
    n = fails_n(run)
    print('用時 %d 秒' % (time.time() - t0))
    print('ALL PASS' if n == 0 else 'FAILED %d' % n, flush=True)
    sys.exit(0 if n == 0 else 1)


asyncio.run(main())
