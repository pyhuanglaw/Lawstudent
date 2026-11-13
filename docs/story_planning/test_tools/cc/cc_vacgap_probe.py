"""CC-C 11-14：BB_457 VACGAP 寒暑假空白驗收（BB198-VACB22；src/vacgap3d.js、src/data/vacgap_lines.js）。判定歸 BB；這支只照玩家看、記字、截圖。
【前置】最小存檔（GAME.defaults＋過了開場的旗標，同 cc_bg5_probe.py；加 DORM_FOUR、MET_KAI＝住 203 四人房）讀到那一天那個時間那一區；
【捷徑】關係用遊戲的 API 墊（SOCIAL.meet＋SOCIAL.rel 數值到 FAMILIAR／FRIEND、G.contacts、dating_<id>、PHONE.join 家族群組），墊完 GAME.snapshot() 再讀一次；
之後條件事件照開（EVENTS 還原），照玩家：站著等時間到、對話框點下去（每一句截圖）、選項照 ALT（第幾個）、走到人旁邊按「和○○說話」、打開手機「訊息」→ 那一串截圖。
同一個 CASE 的第二天以後用 bbplay.jump（同一份進度跳日期）＝【前置】。
CASES（逗號分隔；BB_457 的項次）：
  W203_A／W203_B   1  2026-01-10 20:50 203（阿凱 FAMILIAR）→ 21:00 後 ev_kai_winter_203，選項全選第 1／第 2 個
  REPAIR           2  大一寒假 1/10 以前第一個二四六（阿凱在臺北）19:00 前 203 → ev_kai_shop_visit_Y1W（選「店裡不能修嗎？」）→ 跳到下一個二四六 19:30 → 走到阿凱旁邊說話（只出招呼）
  BACK_IN          3① 2026-02-20 21:55 203 → 22:00 後 ev_kai_back_y1s2
  BACK_LATER       3② 2026-02-20 在校園、不回 203 →【前置】2/21 21:00 讀到 203（＝他回來以後第一次回 203）→ ev_kai_back_y1s2_later
  MXGYM            4  2025-12-29（一）14:30 新體育館（明軒 FAMILIAR）→ 走到明軒旁邊說話 → 跳 12/31（三）14:30 再說一次
  KVJP             5  家族群組；2026-01-24、01-29、01-31 17:55 → 過 18:00 → 手機家族群組
  LNY              6  家族群組＋阿凱、明軒、沛珊 FAMILIAR；2026-02-17 10:25 → 家族群組、沛珊；2026-02-18 22:05 → 阿凱、明軒
  KXHOME_F／_D     7  可昕 FRIEND／交往中；VACGAP.flipOn 算大一寒假回家（go）、回臺北（back）那兩天 17:55 → 過 18:00 → 可昕那一串；（1/2 是阿哲的日子，不拍；BB-C 11-14）
  KXY3_A／_B       9  可昕交往中；2028-06-19 21:55 → 22:00 後；7/6、7/27、8/24 20:55 → 21:00 後實習三則按第 1／第 2 個回覆鍵；8/30 21:00 讀國考那則（_B 不看 6/19）
  OTHERS          11  芷若、沛珊、阿凱、明軒、方奕廷 FAMILIAR；VACGAP_LINES.home 每人第一筆「回家」（日子寫死的照寫、flip 的用 VACGAP.flipOn 算）＋沛珊大三第一筆；h−0.1 → 過 h → 那一串
  KXY2_F／_D      12  可昕 FRIEND／交往中：2027-07-05、07-20 14:00 記 STORY.presence（在臺北＝遇得到）；07-31、08-01、08-31、09-01 17:55 → 過 18:00 → 可昕那一串（7/31 不該有「回高雄了」；8/31 沒有、9/1 有「回來了」，BB-C 11-14 更正）
  第二批（11-14 01:xx）：
  EXAM_MX／EXAM_SIS_F／EXAM_SIS_D／EXAM_KAI  8  【捷徑】考試當天 07:30 用 VAC.signup 報同一場 C04（C04W@Y2 2027-01-23、C04@Y2 2027-08-28 學姊 FRIEND／交往中、C04W@Y3 2028-01-16 多益）
                   → 等遊戲自己跳「出發：…正式考試」→ 點 → 考完的偶遇照演（選項第 1 個）；記 MX_SEEN_TOEFL／SIS_TOEFL_SAMEDAY／KAI_TOEIC_SEEN
  QIXI_A／QIXI_B   10  可昕交往中（台灣路線）2028-08-24 20:55 → 21:00 後她那兩則 → 按第 1 個回覆鍵（好）→ OUT kx_qixi_y3 排上 →【前置】同一份進度跳 8/26 19:00 → 等「出發」→ 五拍＋回程（選項第 1／第 2 個）
  KHINV            12  可昕交往中 2027-07-20 21:24 → 21:30 後高雄那則（y3_kh_inv）→ 按「那兩天不行。」→ 記她的回覆、KX_KH_GO／KX_TRIP_DEFERRED
CC_02 清單 2026-11-13：1✓（日子、時間、區域照 BB_457 表；寒假、二四六、flip 日用遊戲的 HOME.breakOf／CALENDAR／VACGAP.flipOn 在遊戲裡算） 2✓（人用 charId、手機串用 data-th、事件用 G.events.done 讀） 3✓（多個人：每人一串分開開、分開截） 4✓（按之前確認互動鍵是「和○○說話」、回覆鍵在畫面上） 5✓（走到人旁邊用 bbplay.talk 那一套 target＋go_to） 6✓（等遊戲時間真的過了才看、最多 300 秒） 7✓（lint、node 驗 JS） 8n/a（只記，判定歸 BB） 9✓（遊戲畫面、手機畫面原樣截圖） 10✓（中途別的對話照字點完並記下來） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：墊完的關係階段、群組、寒假 key、阿凱在 203、明軒寒訓時段） 13n/a（只在同一區走到人旁邊）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=… ALT=0] python3 cc_vacgap_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'W203_A,W203_B,REPAIR,BACK_IN,BACK_LATER,MXGYM,KVJP,LNY,KXHOME_F,KXHOME_D,KXY3_A,KXY3_B,OTHERS,KXY2_F,KXY2_D').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('vacgap', OUT)
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False, 'DORM_FOUR': True, 'MET_KAI': True}   # GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
STV = {'FAMILIAR': {'fam': 25, 'trust': 10, 'comf': 10}, 'FRIEND': {'fam': 45, 'trust': 30, 'comf': 25}, 'DATING': {'fam': 60, 'trust': 50, 'comf': 45, 'rom': 60, 'npcRom': 50}}
FAM = ['family_law', '法律系直屬家族']
SEED_JS = r"""(a=>{ const G=GAME.G, F=G.flags; G.contacts=G.contacts||{};
  for(const id in a.rel){ SOCIAL.meet(id,'cc_seed'); const r=SOCIAL.rel(id), V=a.V[a.rel[id]]; for(const k in V) r[k]=Math.max(r[k]|0,V[k]);
    if(G.contacts[id]==null) G.contacts[id]=Math.max(0,G.day-30); if(id==='kexin') F.KX_MET=true;
    if(a.rel[id]==='DATING'){ F['dating_'+id]=true; const RM=F.romance||(F.romance={}); RM[id]=Object.assign({},RM[id]||{},{status:'dating'}); } }
  for(const g of a.groups) PHONE.join(G,g[0],g[1]);
  const out={}; for(const id in a.rel) out[id]={stage:SOCIAL.stage(id),level:VACGAP.level(G,id),contact:!!(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id))};
  out.groups=a.groups.map(g=>[g[0],PHONE.inGroup(G,g[0])]); return out; })"""
STATE_JS = r"""(()=>{ const G=GAME.G, F=G.flags||{}, B=HOME.lawBreak?HOME.lawBreak(G):null; let who=[]; try{ who=(STORY.dormWho(G)||[]).map(w=>w[0]); }catch(e){}
  const c=CALENDAR.dateOf(G.day); return {key:c.key, wd:c.wd%7, h:+(+G.hour).toFixed(2), zone:G.zone, brk:B&&B.key, r203:!!(STORY.r203On&&STORY.r203On(G)), dormWho:who,
    gymOn:!!VACGAP.gymOn(G), done:Object.keys((G.events&&G.events.done)||{}).filter(k=>/kai|mx|vacgap|kexin|kx_/.test(k)), cap:F.VACGAP_CAP||null, cut:F.VACGAP_CUT||null}; })()"""
MSGS_JS = "(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({who:m.name||m.from||'', text:String(m.text||'').slice(0,80), d:m.day, h:m.h, tag:m.tag||null, ask:m.ask?(m.ask.opts||[]).map(o=>o.t):null, ans:m.ans!=null?m.ans:null})))"
DAYS_JS = r"""(a=>{ const DK=k=>STORY.dayOfKey(k), out=[]; for(let d=DK(a.from); d<=DK(a.to); d++){ const c=CALENDAR.dateOf(d), B=HOME.breakOf(d);
    if(a.brk&&!(B&&B.key===a.brk)) continue; if(a.wd&&!a.wd.includes(c.wd%7)) continue; if(a.here){ const p=STORY.presence(a.here,Object.assign({},GAME.G,{day:d})); if(!p.here) continue; } out.push(c.key); if(out.length>=(a.n||1)) break; } return out; })"""
FLIP_JS = r"""(a=>{ const DK=k=>STORY.dayOfKey(k), out=[]; for(let d=DK(a.from); d<=DK(a.to); d++){ const f=VACGAP.flipOn(GAME.G,a.who,d); if(f&&(!a.key||f.key===a.key)) out.push({key:CALENDAR.dateOf(d).key, kind:f.kind, brk:f.key}); } return out; })"""


async def st(pg):
    return await pg.evaluate(STATE_JS)


async def fresh(pg, cdp, tag, when, hour, zone, rel=None, groups=()):
    d = await P.day_of(pg, when)
    s = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': [], 'flags': dict(BASEF)}
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: s['flags'][k] = dd
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    await P.load(pg, cdp, s, True)
    R.setup('[%s] 最小存檔讀到 %s %.2f %s（%s 第 %s 週）' % (tag, d['key'], hour, zone, d['term'], d['week']))
    seed = await P.prep(pg, cdp, R, SEED_JS, {'rel': rel or {}, 'groups': list(groups), 'V': STV}, True, '[%s] 墊關係、群組' % tag)
    await P.events_on(pg)
    return seed


async def jump(pg, cdp, tag, when, hour, zone=None, pos='keep'):
    d = await P.jump(pg, cdp, R, when, hour, zone, pos, True, note=tag)
    await P.events_on(pg)
    return d


async def wait_h(pg, cdp, h, tag, max_s=300):
    ok = await P.wait_play(pg, cdp, h, max_s=max_s, run=R, tag=tag)
    c = await P.clock(pg)
    R.check('FAIL_SETUP 檢查：[%s] 遊戲時間過了 %.2f（現在 %s %.2f）' % (tag, h, c['key'], c['h']), ok, '')
    return ok


async def play(pg, cdp, tag, alt=0, prefer=(), max_s=240, start_s=300):
    """等對話開始（最多 start_s 秒；途中手機收起來）→ 每一句截圖 → 選項：prefer 的開頭優先，沒有就第 alt 個 → 到結束"""
    n0 = await P.say_hook(pg); t0 = time.time(); seen = []; opts = []; picked = []; k = 0; started = False; idle = None; run0 = None
    while time.time() - t0 < start_s + max_s:
        s = await P.ts(pg)
        if s['running'] and not run0: run0 = s['running']
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]):
            seen.append([s['name'], s['txt']])
            if len(seen) <= 40: await pg.wait_for_timeout(350); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (tag, k)))
        if s['ch']:
            started = True; idle = None; o = s['ch']; opts.append([x['t'] for x in o])
            i = next((n for p in prefer for n, x in enumerate(o) if x['t'].startswith(p) and not x['dim']), None)
            if i is None: i = min(alt, len(o) - 1)
            picked.append(o[i]['t']); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d_choice.png' % (tag, k)))
            await P.tap_choice(pg, cdp, i); await pg.wait_for_timeout(900); continue
        if s['dlg']: started = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['busy'] or s['depth'] > 0: started = True if s['depth'] > 0 else started; idle = None; await pg.wait_for_timeout(500); continue
        if s['phone']: await L.phone_away(pg, cdp)
        if started:
            idle = idle or time.time()
            if time.time() - idle > 4: break
        elif time.time() - t0 > start_s: break
        await pg.wait_for_timeout(700)
    k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d_end.png' % (tag, k)))
    said = await P.said(pg, n0)
    r = {'started': started, 'event': run0, 'lines': P.clean(seen), 'said': said, 'opts': opts, 'picked': picked}
    R.note('[%s] 對話（事件 %s）：選項 %s；選了 %s；GAME.say %s' % (tag, run0, J(opts), J(picked), J(said)))
    return r


async def talk(pg, cdp, tag, cid, alt=0, prefer=(), max_s=240):
    """走到他旁邊（互動鍵是「和○○說話」）→ 按 → play"""
    w = await P.wait_present(pg, cid, 60)
    if not R.check('FAIL_SETUP 檢查：[%s] %s 在這一區、看得到' % (tag, cid), bool(w) and not w['hidden'], J(w)): return None
    for n in range(4):
        g = await pg.evaluate("id=>__BBF.target(id)", cid)
        if not g: break
        if not g['ok']:
            await L.go_to(pg, cdp, R, g['tx'], g['tz'], 0.55, '[%s] %s 旁邊（第 %d 輪）' % (tag, cid, n + 1), max_s=90, stop=lambda s, w=g['want']: s['interact'].startswith(w))
            await pg.wait_for_timeout(500); g = await pg.evaluate("id=>__BBF.target(id)", cid)
        if g and g['ok']:
            await pg.screenshot(path=os.path.join(OUT, '%s_00_before.png' % tag))
            await L.tap(pg, cdp, '#interact'); r = await play(pg, cdp, tag, alt, prefer, max_s, start_s=8)
            r['label'] = g['want']
            if r['started']: return r
    R.check('[%s] 走到 %s 旁邊按到「和○○說話」' % (tag, cid), False, J(g)); return None


async def thread(pg, cdp, tag, th):
    t = await P.phone_thread(pg, cdp, th)
    await pg.screenshot(path=os.path.join(OUT, '%s_phone_%s.png' % (tag, th.replace(':', '_'))))
    m = await pg.evaluate(MSGS_JS, th)
    R.note('[%s] 手機 %s 打得開=%s；這一串（G.msgs）%s' % (tag, th, t['ok'], J(m[-8:])))
    if not t['ok']: R.note('[%s] 訊息列表：%s' % (tag, t['list'][:400]))
    await L.close_panels(pg, cdp)
    return {'ok': t['ok'], 'msgs': m, 'asks': t['asks']}


async def answer(pg, cdp, tag, th, idx):
    t = await P.phone_thread(pg, cdp, th, open_folds=False)
    live = [a for a in t['asks'] if not a['dis']]
    R.note('[%s] 回覆鍵 %s' % (tag, J(t['asks'])))
    if not live: await L.close_panels(pg, cdp); return None
    lab = live[min(idx, len(live) - 1)]['t']
    txt = await P.phone_answer(pg, cdp, th, lab)
    await pg.screenshot(path=os.path.join(OUT, '%s_reply_%s.png' % (tag, th.replace(':', '_'))))
    await pg.wait_for_timeout(2500); m = await pg.evaluate(MSGS_JS, th)
    R.note('[%s] 按「%s」以後：%s' % (tag, lab, J(m[-4:])))
    await L.close_panels(pg, cdp)
    return lab


async def c_w203(pg, cdp, tag, alt):
    seed = await fresh(pg, cdp, tag, '2026-01-10', 20 + 50 / 60, 'dorm', {'kai': 'FAMILIAR'})
    s = await st(pg); R.note('[%s] 墊完 %s；狀態 %s' % (tag, J(seed), J(s)))
    if not R.check('FAIL_SETUP 檢查：[%s] 大一寒假（Y1W）、203 四人房、阿凱 FAMILIAR' % tag, s['brk'] == 'Y1W' and s['r203'] and seed['kai']['level'] >= 1, J(s)): return {'case': tag, 'skip': 'setup'}
    r = await play(pg, cdp, tag, alt)
    s2 = await st(pg); R.note('[%s] 之後 dormWho（21:00 時）%s；done %s' % (tag, J(s['dormWho']), J(s2['done'])))
    R.check('[%s] ev_kai_winter_203 演了（G.events.done）' % tag, 'ev_kai_winter_203' in s2['done'], J(s2['done']))
    return {'case': tag, 'r': r, 'done': s2['done']}


async def c_repair(pg, cdp, tag, alt):
    days = await pg.evaluate(DAYS_JS, {'from': '2025-12-20', 'to': '2026-01-09', 'brk': 'Y1W', 'wd': [2, 4, 6], 'here': 'kai', 'n': 2})
    R.note('[%s] 大一寒假 1/10 以前的二四六（阿凱在臺北）：%s' % (tag, J(days)))
    if not R.check('FAIL_SETUP 檢查：[%s] 找得到兩個打工日' % tag, len(days) >= 2, J(days)): return {'case': tag, 'skip': 'days'}
    seed = await fresh(pg, cdp, tag, days[0], 18 + 50 / 60, 'dorm', {'kai': 'FAMILIAR'})
    s = await st(pg); R.note('[%s] 墊完 %s；狀態 %s' % (tag, J(seed), J(s)))
    R.check('FAIL_SETUP 檢查：[%s] 大一寒假、203 四人房' % tag, s['brk'] == 'Y1W' and s['r203'], J(s))
    r1 = await play(pg, cdp, tag + '_1', alt, prefer=('「店裡不能修嗎', '店裡不能修嗎'))
    s1 = await st(pg)
    R.check('[%s] ev_kai_shop_visit_Y1W 演了' % tag, 'ev_kai_shop_visit_Y1W' in s1['done'], J(s1['done']))
    await jump(pg, cdp, tag, days[1], 19.5, 'dorm', None)
    s2 = await st(pg); R.note('[%s] 第二天狀態 %s' % (tag, J(s2)))
    r2 = await talk(pg, cdp, tag + '_2', 'kai')
    return {'case': tag, 'days': days, 'first': r1, 'second': r2}


async def c_back(pg, cdp, tag, later):
    if not later:
        seed = await fresh(pg, cdp, tag, '2026-02-20', 21 + 55 / 60, 'dorm', {'kai': 'FAMILIAR'})
    else:
        seed = await fresh(pg, cdp, tag, '2026-02-20', 21.5, 'campus', {'kai': 'FAMILIAR'})
        await wait_h(pg, cdp, 22.2, tag); await pg.screenshot(path=os.path.join(OUT, '%s_0220_campus.png' % tag))
        await jump(pg, cdp, tag, '2026-02-21', 21.0, 'dorm', None)
        R.setup('[%s] 2/20 晚上人在校園沒有回 203；【前置】2/21 21:00 讀到 203＝他回來以後第一次回 203' % tag)
    s = await st(pg); R.note('[%s] 墊完 %s；狀態 %s' % (tag, J(seed), J(s)))
    r = await play(pg, cdp, tag, 0)
    s2 = await st(pg); want = 'ev_kai_back_y1s2' + ('_later' if later else '')
    R.check('[%s] %s 演了' % (tag, want), want in s2['done'], J(s2['done']))
    return {'case': tag, 'r': r, 'done': s2['done']}


async def c_mxgym(pg, cdp, tag):
    seed = await fresh(pg, cdp, tag, '2025-12-29', 14.5, 'gym', {'classmate_mingxuan': 'FAMILIAR'})
    s = await st(pg); R.note('[%s] 墊完 %s；狀態 %s' % (tag, J(seed), J(s)))
    if not R.check('FAIL_SETUP 檢查：[%s] 寒訓時段（VACGAP.gymOn）、人在新體育館' % tag, s['gymOn'] and s['zone'] == 'gym', J(s)): return {'case': tag, 'skip': 'setup'}
    r1 = await talk(pg, cdp, tag + '_1229', 'classmate_mingxuan')
    await jump(pg, cdp, tag, '2025-12-31', 14.5, 'gym', None)
    r2 = await talk(pg, cdp, tag + '_1231', 'classmate_mingxuan')
    mg = await pg.evaluate("(GAME.G.flags.MX_GYM||null)"); R.note('[%s] MX_GYM %s' % (tag, J(mg)))
    return {'case': tag, 'first': r1, 'again': r2, 'MX_GYM': mg}


async def c_kvjp(pg, cdp, tag):
    out = []
    for i, day in enumerate(('2026-01-24', '2026-01-29', '2026-01-31')):
        if i == 0: seed = await fresh(pg, cdp, tag, day, 17 + 55 / 60, 'dorm', {}, [FAM]); R.note('[%s] 墊完 %s' % (tag, J(seed)))
        else: await jump(pg, cdp, tag, day, 17 + 55 / 60, 'dorm', None)
        await wait_h(pg, cdp, 18.1, tag + day[5:]); await pg.wait_for_timeout(3000)
        out.append(dict(day=day, **(await thread(pg, cdp, tag + '_' + day[5:], 'g:family_law'))))
    return {'case': tag, 'days': out}


async def c_lny(pg, cdp, tag):
    rel = {'kai': 'FAMILIAR', 'classmate_mingxuan': 'FAMILIAR', 'classmate_peishan': 'FAMILIAR'}
    seed = await fresh(pg, cdp, tag, '2026-02-17', 10 + 25 / 60, 'dorm', rel, [FAM]); R.note('[%s] 墊完 %s' % (tag, J(seed)))
    await wait_h(pg, cdp, 10.5, tag); await pg.wait_for_timeout(3000)
    a = [await thread(pg, cdp, tag + '_0217', th) for th in ('g:family_law', 'p:classmate_peishan')]
    await jump(pg, cdp, tag, '2026-02-18', 22 + 5 / 60, 'dorm', None)
    await wait_h(pg, cdp, 22.15, tag); await pg.wait_for_timeout(3000)
    b = [await thread(pg, cdp, tag + '_0218', th) for th in ('p:kai', 'p:classmate_mingxuan')]
    s = await st(pg); R.note('[%s] VACGAP_CAP %s；VACGAP_CUT %s' % (tag, J(s['cap']), J(s['cut'])))
    return {'case': tag, 'd0217': a, 'd0218': b, 'cap': s['cap'], 'cut': s['cut']}


async def c_kxhome(pg, cdp, tag, dating):
    rel = {'kexin': 'DATING' if dating else 'FRIEND'}
    seed = await fresh(pg, cdp, tag, '2026-01-02', 17 + 55 / 60, 'dorm', rel); R.note('[%s] 墊完 %s' % (tag, J(seed)))
    flips = await pg.evaluate(FLIP_JS, {'who': 'kexin', 'from': '2025-12-15', 'to': '2026-03-05', 'key': 'Y1W'})
    R.note('[%s] VACGAP.flipOn（可昕，Y1W）：%s' % (tag, J(flips)))
    out = []
    # BB-C 11-14：1/2 是阿哲的日子，可昕寒假沒有寫死日期——只照 flipOn（homeAway 實際切換那天）18:00 判，不拍 1/2
    if not R.check('FAIL_SETUP 檢查：[%s] 算得出回家、回臺北那兩天' % tag, any(f['kind'] == 'go' for f in flips) and any(f['kind'] == 'back' for f in flips), J(flips)): return {'case': tag, 'flips': flips, 'days': out}
    for f in [next(f for f in flips if f['kind'] == 'go'), next(f for f in flips if f['kind'] == 'back')]:
        await jump(pg, cdp, tag, f['key'], 17 + 55 / 60, 'dorm', None)
        await wait_h(pg, cdp, 18.1, tag + '_' + f['kind']); await pg.wait_for_timeout(3000)
        out.append(dict(day=f['key'], kind=f['kind'], **(await thread(pg, cdp, '%s_%s_%s' % (tag, f['kind'], f['key'][5:]), 'p:kexin'))))
    return {'case': tag, 'flips': flips, 'days': out}


async def c_kxy3(pg, cdp, tag, alt):
    first = True; out = []
    plan = ([] if alt else [('2028-06-19', 22, None)]) + [('2028-07-06', 21, alt), ('2028-07-27', 21, alt), ('2028-08-24', 21, alt), ('2028-08-30', 21, alt)]
    for day, h, idx in plan:
        if first: seed = await fresh(pg, cdp, tag, day, h - 5 / 60, 'dorm', {'kexin': 'DATING'}); R.note('[%s] 墊完 %s' % (tag, J(seed))); first = False
        else: await jump(pg, cdp, tag, day, h - 5 / 60, 'dorm', None)
        await wait_h(pg, cdp, h + 0.1, tag + day[5:]); await pg.wait_for_timeout(3000)
        t = await thread(pg, cdp, '%s_%s' % (tag, day[5:]), 'p:kexin')
        lab = await answer(pg, cdp, '%s_%s' % (tag, day[5:]), 'p:kexin', idx) if idx is not None else None
        out.append(dict(day=day, reply=lab, **t))
    fl = await pg.evaluate("(()=>({KX_PLAN_Y3S:GAME.G.flags.KX_PLAN_Y3S||null}))()"); R.note('[%s] %s' % (tag, J(fl)))
    return {'case': tag, 'days': out, 'flags': fl}


async def c_others(pg, cdp, tag):
    who = ['heroine_02', 'classmate_peishan', 'kai', 'classmate_mingxuan', 'npc_fangyt']
    seed = await fresh(pg, cdp, tag, '2025-12-20', 12.0, 'dorm', {w: 'FAMILIAR' for w in who}); R.note('[%s] 墊完 %s' % (tag, J(seed)))
    rows = await pg.evaluate("""(ws=>{ const H=VACGAP_LINES.home, out=[]; for(const w of ws){ const L=(H[w]||[]).filter(r=>r[1]==='go'); const pick=[L[0]]; if(w==='classmate_peishan'){ const y3=L.find(r=>/^Y3/.test(r[0])); if(y3) pick.push(y3); }
        for(const r of pick){ if(!r) continue; out.push({who:w,key:r[0],kind:r[1],dk:r[2],h:r[3],ms:r[4]}); } } return out; })""", who)
    for r in rows:
        if r['dk'] == 'flip':
            f = await pg.evaluate(FLIP_JS, {'who': r['who'], 'from': '2025-12-01', 'to': '2028-09-10', 'key': r['key']})
            g = [x for x in f if x['kind'] == r['kind']]; r['day'] = g[0]['key'] if g else None
        else: r['day'] = r['dk']
    rows = sorted([r for r in rows if r['day']], key=lambda r: r['day'])
    R.note('[%s] 每人第一筆回家（照 VACGAP_LINES.home）：%s' % (tag, J(rows)))
    if not R.check('FAIL_SETUP 檢查：[%s] 五個人都有日子' % tag, len({r['who'] for r in rows}) == 5, J(rows)): pass
    out = []
    for r in rows:
        await jump(pg, cdp, tag, r['day'], r['h'] - 0.1, 'dorm', None)
        await wait_h(pg, cdp, r['h'] + 0.1, '%s_%s' % (tag, r['who'])); await pg.wait_for_timeout(3000)
        t = await thread(pg, cdp, '%s_%s_%s' % (tag, r['who'], r['day']), 'p:' + r['who'])
        s = await st(pg); out.append(dict(r, cap=s['cap'], **t))
    return {'case': tag, 'rows': out}


async def c_kxy2(pg, cdp, tag, dating):
    rel = {'kexin': 'DATING' if dating else 'FRIEND'}; out = []
    seed = await fresh(pg, cdp, tag, '2027-07-05', 14.0, 'campus', rel); R.note('[%s] 墊完 %s' % (tag, J(seed)))
    for day in ('2027-07-05', '2027-07-20'):
        if day != '2027-07-05': await jump(pg, cdp, tag, day, 14.0, 'campus', None)
        p = await pg.evaluate("(()=>STORY.presence('kexin',GAME.G))()"); w = await P.who(pg, 'kexin')
        await pg.screenshot(path=os.path.join(OUT, '%s_%s_campus.png' % (tag, day[5:])))
        R.note('[%s] %s 14:00 校園：STORY.presence(kexin) %s；這一區的她 %s' % (tag, day, J(p), J(w))); out.append({'day': day, 'presence': p, 'npc': w})
    for day in ('2027-07-31', '2027-08-01', '2027-08-31', '2027-09-01'):   # BB-C 11-14 更正（ee49d7ffa8）：「回來了」在 9/1 18:00（homeWin 到 8/31 含當天、flipOn 在不在家的第一天發）——8/31 要沒有、9/1 要有
        await jump(pg, cdp, tag, day, 17 + 55 / 60, 'dorm', None)
        await wait_h(pg, cdp, 18.1, tag + day[5:]); await pg.wait_for_timeout(3000)
        p = await pg.evaluate("(()=>STORY.presence('kexin',GAME.G))()")
        out.append(dict(day=day, presence=p, **(await thread(pg, cdp, '%s_%s' % (tag, day[5:]), 'p:kexin'))))
    return {'case': tag, 'days': out}


EXAMS = {'EXAM_MX': ('2027-01-23', 'C04W@Y2', {'classmate_mingxuan': 'FAMILIAR'}), 'EXAM_SIS_F': ('2027-08-28', 'C04@Y2', {'heroine_05': 'FRIEND'}),
         'EXAM_SIS_D': ('2027-08-28', 'C04@Y2', {'heroine_05': 'DATING'}), 'EXAM_KAI': ('2028-01-16', 'C04W@Y3', {'kai': 'FAMILIAR'})}
SIGNUP_JS = r"""(k=>{ const G=GAME.G, ok=VAC.signup(G,k,'yes'), I=VAC.inst(k.split('@')[0],k.split('@')[1]); const outs=(G.outings||[]).filter(q=>q&&q.vac&&q.vac.key===k).map(q=>({id:q.id,day:CALENDAR.dateOf(q.day).key,h:q.h,title:q.title,state:q.state}));
  return {ok, reg:VAC.rec(G).reg[k]||null, enrolled:!!VAC.enrolled(G,k.split('@')[0],k.split('@')[1]), outs}; })"""


async def go_out(pg, cdp, tag, alt=0, start_s=420):
    """等遊戲自己跳「出發：…」→ 點 → 之後照演（play 兩輪：路上、到了以後）"""
    a = await play(pg, cdp, tag + '_a', alt, prefer=('出發',), start_s=start_s)
    b = await play(pg, cdp, tag + '_b', alt, prefer=('出發',), start_s=20)
    return {'a': a, 'b': b}


async def c_exam(pg, cdp, tag):
    day, key, rel = EXAMS[tag]
    seed = await fresh(pg, cdp, tag, day, 7.5, 'dorm', rel); R.note('[%s] 墊完 %s' % (tag, J(seed)))
    su = await P.prep(pg, cdp, R, SIGNUP_JS, key, True, '[%s] 報名 %s（VAC.signup，玩家報同一場 C04）' % (tag, key)); await P.events_on(pg)
    ex = [o for o in su['outs'] if o['day'] == day]
    if not R.check('FAIL_SETUP 檢查：[%s] 報上了、%s 有排出遊（正式考試）' % (tag, day), su['enrolled'] and bool(ex), J(su)): return {'case': tag, 'signup': su}
    r = await go_out(pg, cdp, tag)
    fl = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {MX_SEEN_TOEFL:F.MX_SEEN_TOEFL||null, SIS_TOEFL_SAMEDAY:F.SIS_TOEFL_SAMEDAY||null, KAI_TOEIC_SEEN:F.KAI_TOEIC_SEEN||null}; })()")
    R.note('[%s] 考完旗標 %s' % (tag, J(fl)))
    return {'case': tag, 'signup': su, 'r': r, 'flags': fl}


async def c_qixi(pg, cdp, tag, alt):
    seed = await fresh(pg, cdp, tag, '2028-08-24', 20 + 55 / 60, 'dorm', {'kexin': 'DATING'}); R.note('[%s] 墊完 %s' % (tag, J(seed)))
    await wait_h(pg, cdp, 21.1, tag); await pg.wait_for_timeout(3000)
    t = await thread(pg, cdp, tag + '_0824', 'p:kexin')
    lab = await answer(pg, cdp, tag + '_0824', 'p:kexin', 0)
    q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'kx_qixi_y3'); return q?{day:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,title:q.title}:null; })()")
    R.note('[%s] 按「%s」以後 OUT kx_qixi_y3：%s；route %s' % (tag, lab, J(q), await pg.evaluate("(()=>STORY.route?STORY.route(GAME.G):null)()")))
    if not R.check('FAIL_SETUP 檢查：[%s] 8/26 20:00 的七夕排上了' % tag, bool(q), J(q)): return {'case': tag, 'ask': t, 'reply': lab}
    await jump(pg, cdp, tag, '2028-08-26', 19.0, 'dorm', None)
    r = await go_out(pg, cdp, tag + '_0826', alt)
    fl = await pg.evaluate("(()=>({KX_QIXI_Y3:GAME.G.flags.KX_QIXI_Y3||null}))()"); R.note('[%s] %s' % (tag, J(fl)))
    return {'case': tag, 'ask': t, 'reply': lab, 'out': q, 'r': r, 'flags': fl}


async def c_khinv(pg, cdp, tag):
    """第 12 項 8/7～8/8：2027-07-20 21:30 可昕約去高雄（r2y3a3d.js y3_kh_inv）→ 按「那兩天不行。」→ 她回「好。那寒假。」"""
    seed = await fresh(pg, cdp, tag, '2027-07-20', 21.4, 'dorm', {'kexin': 'DATING'}); R.note('[%s] 墊完 %s' % (tag, J(seed)))
    await wait_h(pg, cdp, 21.6, tag); await pg.wait_for_timeout(3000)
    t = await thread(pg, cdp, tag + '_0720', 'p:kexin')
    lab = await answer(pg, cdp, tag + '_0720', 'p:kexin', 1)
    fl = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {KX_KH_GO:F.KX_KH_GO, KX_KH_DEFER:F.KX_KH_DEFER||null, KX_TRIP_DEFERRED:F.KX_TRIP_DEFERRED||null}; })()")
    R.note('[%s] 按「%s」以後 %s' % (tag, lab, J(fl)))
    return {'case': tag, 'ask': t, 'reply': lab, 'flags': fl}


async def one(pg, cdp, c):
    if c in EXAMS: return await c_exam(pg, cdp, c)
    if c in ('QIXI_A', 'QIXI_B'): return await c_qixi(pg, cdp, c, 0 if c.endswith('A') else 1)
    if c == 'KHINV': return await c_khinv(pg, cdp, c)
    if c in ('W203_A', 'W203_B'): return await c_w203(pg, cdp, c, 0 if c.endswith('A') else 1)
    if c == 'REPAIR': return await c_repair(pg, cdp, c, 0)
    if c == 'BACK_IN': return await c_back(pg, cdp, c, False)
    if c == 'BACK_LATER': return await c_back(pg, cdp, c, True)
    if c == 'MXGYM': return await c_mxgym(pg, cdp, c)
    if c == 'KVJP': return await c_kvjp(pg, cdp, c)
    if c == 'LNY': return await c_lny(pg, cdp, c)
    if c in ('KXHOME_F', 'KXHOME_D'): return await c_kxhome(pg, cdp, c, c.endswith('D'))
    if c in ('KXY3_A', 'KXY3_B'): return await c_kxy3(pg, cdp, c, 0 if c.endswith('A') else 1)
    if c == 'OTHERS': return await c_others(pg, cdp, c)
    if c in ('KXY2_F', 'KXY2_D'): return await c_kxy2(pg, cdp, c, c.endswith('D'))
    R.check('[%s] 認得這個 CASE' % c, False, ''); return {'case': c, 'skip': 'unknown'}


async def main():
    print('CC VACGAP（BB_457）：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    res = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            await P.init(pg)
            try: res['cases'].append(await one(pg, cdp, c))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            open(os.path.join(OUT, 'vacgap.json'), 'w', encoding='utf-8').write(J(res))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'vacgap.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
