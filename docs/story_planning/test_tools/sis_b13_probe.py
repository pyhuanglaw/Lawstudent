"""BB-C 10-28：SIS-B13-1028 學姊第十三批（AA_512；LAWWW-C 08:28，開發分支 12a5e6d08 起）——3D 觸發照玩家操作走一遍。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。不用 ?turbo（時間窗、走路觸發要照真的時間）。
共同做法：【前置】使用者存檔（day 14）改日期、時間、區域、路線旗標；【捷徑】用遊戲的 API 設學姊的關係（朋友＝熟悉 45／信任 30，同 tests/pg_harness.js H.FRIEND；
交往＝再 ROM.start，先拿掉存檔原本和可昕的交往＝同 zrlast_probe NOKX），存成快照再讀（區域照新的狀態重建）；之後都是玩家操作（觸控走過去、點對話、點選項、手機）。
  MODE=walk        13-3：2027-12-06（一）16:57 校園椰林大道 (34,-95)，朋友 → 走到霖澤館穿堂門口 (34,-104)（near (34,-109) r7）→ ev_sis13_walk 開演、選「好。」走完、SIS13_WALK
  MODE=walk_dating 對照：同上但交往中 → 站在門口 60 秒不演
  MODE=walk_out    對照：2027-12-08（三）（避開 12/8～10）→ 不演
  MODE=cake        13-4：2028-06-02（五）18:36 公館，朋友 → 找到學姊（她們那桌）走近 → ev_sis13_cake
  MODE=pool        13-8：2029-05-07（一）07:57 校園 (74,46)，朋友 → 走到新體育館門口 (74,53.5)（near (74,58.4) r7）→ ev_sis13_pool
  MODE=laundry     13-6：美國路線（US_ARRIVED、US1 alone）、沒交往，2028-10-10 21:12 美國社區戶外 → 自動 ev_sis13_laundry（2D 洗衣間：現在深色底＋地點字幕，截圖看）
  MODE=lab         2-5：交往中，2026-10-12（一）19:02 霖澤館 4F 樓梯間 → 刷卡門「傳訊息給學姊」→ 她開門（交往：拉袖子）→ 5F 第一次「七點以後。……你準時。」；
                   【捷徑】同一份進度跳到 21:40 → 她離開研究室、玩家一起回 4F
  MODE=jp          13-5：日本路線（JP_DEPARTED 2028-03-25）朋友、沒交往，2028-06-02 當地 21:36 宿舍房間 → 手機傳「生日快樂」→ 排視訊（當地 22:00）→「接起來」→ ev_sis13_jp_bday
  MODE=kv_new／kv_met 13-1：Kevin 家聚交棒（2026-09-17（四）18:30 118 巷定食店）；kv_new＝【前置】拿掉認識學姊（met_sis、SIS_W1、她的記憶）；
                   【捷徑】回 Kevin 群組那則「去。」（SUP497.onKv，手機回覆在 Node 驗過）→ 17:55 宿舍等出遊提醒「出發」→ ev_kv_handover：沒認識＝Kevin 介紹＋她兩句；認識＝只有一句
用法：LW_TESTS=<工作樹>/tests MODE=walk python3 sis_b13_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]；SHA＝記錄用"""
import os, sys, json, asyncio, time, copy, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; MODE = os.environ.get('MODE', 'walk')
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
J = lambda o: json.dumps(o, ensure_ascii=False)
ID = 'heroine_05'
TW = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
US = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_ARRIVED': True, 'US1': 'alone'}
JP = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'AN_SENDOFF': 'together'}
CFG = {
  'walk':        dict(key='2027-12-06', h=16.95, zone='campus', pos=(34, -95), kind='friend', flags=TW, ok='walkOk', ev='ev_sis13_walk', go=(34, -104), pick=['^好。']),
  'walk_dating': dict(key='2027-12-06', h=16.95, zone='campus', pos=(34, -95), kind='dating', flags=TW, ok='walkOk', ev='ev_sis13_walk', go=(34, -104), none=60),
  'walk_out':    dict(key='2027-12-08', h=16.95, zone='campus', pos=(34, -95), kind='friend', flags=TW, ok='walkOk', ev='ev_sis13_walk', go=(34, -104), none=60),
  'cake':        dict(key='2028-06-02', h=18.6, zone='gongguan', pos=None, kind='friend', flags=TW, ok='cakeOk', ev='ev_sis13_cake', go='npc'),
  'pool':        dict(key='2029-05-07', h=7.95, zone='campus', pos=(74, 46), kind='friend', flags=TW, ok='poolOk', ev='ev_sis13_pool', go=(74, 53.5)),
  'laundry':     dict(key='2028-10-10', h=21.2, zone='us_outside', pos=None, kind='friend', flags=US, ok='laundryOk', ev='ev_sis13_laundry', go=None),
  'lab':         dict(key='2026-10-12', h=19.03, zone='linze_4f', pos=(7, -5.5), kind='dating', flags=TW, ok='labEveLine', ev='ev_sis13_lab_eve', go='lab'),
  'jp':          dict(key='2028-06-02', h=21.6, zone='jp_room', pos=None, kind='friend', flags=JP, ok=None, ev='ev_sis13_jp_bday', go='jp', pick=['^接起來']),
  'kv_new':      dict(key='2026-09-17', h=17.9, zone='dorm', pos=None, kind='none', flags={}, ok=None, ev='ev_kv_handover', go='kv', pick=['^出發']),
  'kv_met':      dict(key='2026-09-17', h=17.9, zone='dorm', pos=None, kind='keep', flags={}, ok=None, ev='ev_kv_handover', go='kv', pick=['^出發']),
}[MODE]
DAY_JS = "k=>{ const d=STORY.dayOfKey(k); const w=CALENDAR.dateOf(d).wd; return {d, wd:w===7?0:w}; }"
NOKX = "G.flags.dating_kexin=false; if(G.flags.romance) delete G.flags.romance.kexin; G.flags.ROMANCE_HISTORY=(G.flags.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete G.flags.DATED_1_kexin;"
PREP = ("""(o)=>{ const G=GAME.G, ID='heroine_05', D=k=>STORY.dayOfKey(k);
  if(o.kind==='none'){ G.flags.met_sis=false; delete G.flags.SIS_W1; if(G.social&&G.social.mem) delete G.social.mem[ID]; if(G.contacts) delete G.contacts[ID]; }
  else if(o.kind!=='keep'){ G.flags.met_sis=true; G.flags.SIS_W1=true; const r=SOCIAL.rel(ID); r.fam=Math.max(r.fam||0,45); r.trust=Math.max(r.trust||0,30); if(!SOCIAL.has(ID,'FIRST_MET')) SOCIAL.remember(ID,'FIRST_MET','');
    if(typeof INV!=='undefined'&&!INV.hasContact(G,ID)) INV.addContact(G,ID);
    if(o.kind==='dating'){ %s try{ ROM.start(G,ID); }catch(e){} G.flags.dating_heroine_05=true; } }
  if(o.jp){ G.flags.X1_JP=D('2028-02-20'); G.flags.JP_DEPARTED=D('2028-03-25'); G.flags.JP_RETURNED=null; }
  if(o.kv){ SUP497.onKv(G,{ask:{id:'kv_hand'}},{hand:true}); }
  const X=SISB13; return {stage:SOCIAL.stage(ID), dating:X.dating(G), met:!!G.flags.met_sis, knows:!!SOCIAL.has(ID,'FIRST_MET'), route:X.route(G), ok:o.ok&&X[o.ok]?!!X[o.ok](G):null,
    kv:o.kv?(OUT.get(G,'kv_hand')||null):undefined}; }""" % NOKX)
ST = """(()=>{ const D=GAME.D, E=GAME.E, P=E.player.obj.position, ch=document.getElementById('choices'), it=document.getElementById('interact');
  return {running:(typeof EVENTS!=='undefined'?EVENTS.running:null)||null, depth:D.busyDepth|0, dlg:!!D.active, txt:((document.getElementById('dlgName').textContent||'')+'｜'+(D.full||'')).slice(0,80),
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent.slice(0,30)):[], busy:!!E.player.busy, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2),
    me:[+P.x.toFixed(2),+P.z.toFixed(2),E.player.lv|0], it:(it&&!it.classList.contains('hide'))?(document.getElementById('interactLabel').textContent||''):''}; })()"""
EVLOG = """(()=>{ window.__EV=[]; const o=EVENTS.run; if(o&&!o.__bb){ EVENTS.run=Object.assign(function(e){ try{ window.__EV.push({id:e&&e.id, h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}); }catch(_){} return o.apply(this,arguments); },{__bb:true}); } })()"""
FIRST = """id=>{ const e=STORY_EVENTS.find(x=>x.id===id); if(!e||!Array.isArray(e.dialogue)) return null; const t=e.dialogue.map(l=>l&&(l.text||l.t)).filter(x=>typeof x==='string'&&x.length>3); return t.slice(0,3); }"""
NPC = """id=>{ const n=GAME.E.npcs.find(m=>m.charId===id||m.id===id); if(!n) return null; const p=n.obj.position; return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, beh:n.beh||null, seated:!!n.seat, hidden:!!n.hidden}; }"""


async def settle(pg, cdp):
    await pg.wait_for_timeout(6000); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)


def want(ch, picks):
    for p in picks or []:
        k = next((i for i, t in enumerate(ch) if re.search(p, t)), None)
        if k is not None: return k
    return None


async def play(pg, cdp, run, picks=None, max_s=300, until=None):
    """點對話、選選項（picks 的正規式先；沒有就第一個不是灰的），直到不忙、沒有對話；回傳看到的句子、選項"""
    t0 = time.time(); lines = []; chs = []; idle = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate(ST)
        if until and until(s): break
        if s['ch']:
            idle = None; chs.append(s['ch']); k = want(s['ch'], picks)
            await pg.evaluate("(k=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=(k!=null?bs[k]:null)||bs.find(x=>!x.classList.contains('dim'))||bs[0]; if(b) b.click(); })(%s)" % J(k))
            await pg.wait_for_timeout(800); continue
        if s['dlg']:
            idle = None
            if not lines or lines[-1] != s['txt']: lines.append(s['txt'])
            if len(lines) == 1: await run.shot(pg, 'line1')
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['busy'] or s['depth'] or s['running']: idle = None; await pg.wait_for_timeout(500); continue
        idle = idle or time.time()
        if time.time() - idle > 4: break
        await pg.wait_for_timeout(400)
    return lines, chs


async def main():
    run = L.Run('sisb13_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate(DAY_JS, CFG['key'])
        st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.pop('_busy', None)
        st.update(day=d['d'], weekday=d['wd'], hour=CFG['h'], zone=CFG['zone'],
                  pos=({'x': CFG['pos'][0], 'z': CFG['pos'][1], 'yaw': 3.14159, 'lv': 0, 'y': 0} if CFG['pos'] else None))
        st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
        st.setdefault('flags', {}).update(CFG['flags'])
        await L.load_state(pg, st, quiet_events=False, quiet_phone=True); await settle(pg, cdp)
        run.setup('[前置] 使用者存檔（day 14）改到 %s %.2f %s；旗標 %s' % (CFG['key'], CFG['h'], CFG['zone'], J(CFG['flags'])))
        o = {'kind': CFG['kind'], 'ok': CFG['ok'], 'jp': MODE == 'jp', 'kv': CFG.get('go') == 'kv'}
        pr = await pg.evaluate(PREP, o); run.setup('[捷徑] 學姊的關係／前置（%s）：%s' % (CFG['kind'], J(pr)))
        snap = await pg.evaluate("()=>GAME.snapshot()")
        if CFG['pos']: snap['pos'] = {'x': CFG['pos'][0], 'z': CFG['pos'][1], 'yaw': 3.14159, 'lv': 0, 'y': 0}
        snap['hour'] = CFG['h']
        await L.load_state(pg, snap, quiet_events=False, quiet_phone=True); await pg.evaluate(EVLOG); await settle(pg, cdp)
        pr2 = await pg.evaluate(PREP.replace("if(o.kv){ SUP497.onKv(G,{ask:{id:'kv_hand'}},{hand:true}); }", ''), dict(o, kind='keep', jp=False))
        run.note('讀進來：%s；%s' % (J(pr2), J(await pg.evaluate(ST))))
        if CFG['ok']:
            exp = not CFG.get('none')
            run.check('前置：SISB13.%s ＝ %s（%s）' % (CFG['ok'], exp, '條件成立' if exp else '對照：條件不成立'), pr2['ok'] == exp, J(pr2))
        first = await pg.evaluate(FIRST, CFG['ev']); run.note('%s 開頭：%s' % (CFG['ev'], J(first)))
        await run.shot(pg, 'start')
        ev_on = lambda s: bool(s.get('dlg') or s.get('choices'))
        lines = []; chs = []
        go = CFG.get('go')
        if isinstance(go, tuple):
            for k in range(3):
                await L.go_to(pg, cdp, run, go[0], go[1], 0.8, '走到觸發的地方（第 %d 次）' % (k + 1), max_s=300, stop=ev_on)
                if CFG.get('none'):
                    t0 = time.time()
                    while time.time() - t0 < CFG['none']:
                        s = await pg.evaluate(ST)
                        if s['dlg'] or s['ch'] or s['running']: break
                        await pg.wait_for_timeout(1000)
                l1, c1 = await play(pg, cdp, run, CFG.get('pick'), max_s=120); lines += l1; chs += c1
                evs = [e['id'] for e in await pg.evaluate("window.__EV")]
                if CFG['ev'] in evs or CFG.get('none'): break
                run.note('先演了 %s（不是這次要看的），再走一次' % J(evs))
        elif go == 'npc':
            for k in range(3):
                n = await pg.evaluate(NPC, ID); run.note('學姊：%s' % J(n))
                if not n: run.check('前置：學姊在%s' % CFG['zone'], False); break
                await L.go_to(pg, cdp, run, n['x'], n['z'] + 1.6, 0.9, '走近學姊（第 %d 次）' % (k + 1), max_s=300, stop=ev_on)
                t0 = time.time()
                while time.time() - t0 < 20 and not ev_on(await L.state(pg)): await pg.wait_for_timeout(1000)
                l1, c1 = await play(pg, cdp, run, CFG.get('pick'), max_s=180); lines += l1; chs += c1
                if CFG['ev'] in [e['id'] for e in await pg.evaluate("window.__EV")]: break
        elif go is None:
            t0 = time.time()
            while time.time() - t0 < 60 and not ev_on(await L.state(pg)): await pg.wait_for_timeout(1000)
            l1, c1 = await play(pg, cdp, run, CFG.get('pick'), max_s=180); lines += l1; chs += c1
        elif go == 'lab':
            door = await pg.evaluate("(()=>{ const s=LINZE_UPPER_LAYOUTS['4f'].stairs; return [s.door.x, s.door.z]; })()")
            await L.go_to(pg, cdp, run, door[0], door[1] + 0.9, 0.5, '4F 往 5F 的刷卡門', max_s=200)
            s = await pg.evaluate(ST); run.note('門口：%s' % J(s))
            run.check('刷卡門的按鈕在（%s）' % s['it'], bool(s['it']) and ('5F' in s['it'] or '樓' in s['it']), J(s))
            await L.tap(pg, cdp, '#interact')
            l1, c1 = await play(pg, cdp, run, ['^傳訊息給學姊'], max_s=240, until=lambda s: s['zone'] == 'linze_5f' and not s['dlg'] and not s['ch'] and not s['busy'])
            lines += l1; chs += c1
            run.check('選單有「傳訊息給學姊」', any(any(t.startswith('傳訊息給學姊') for t in c) for c in c1), J(c1))
            t0 = time.time()
            while time.time() - t0 < 120 and (await pg.evaluate("GAME.G.zone")) != 'linze_5f':
                l2, c2 = await play(pg, cdp, run, None, max_s=10); lines += l2; chs += c2; await pg.wait_for_timeout(1000)
            l3, c3 = await play(pg, cdp, run, None, max_s=120); lines += l3; chs += c3
            z = await pg.evaluate("({zone:GAME.G.zone, inEve:GAME.G.flags.LAB5_IN_EVE, line:GAME.G.flags.SIS13_LAB_EVE})"); run.note('進門以後：%s' % J(z))
            run.check('她開門、進到 5F 研究室', z['zone'] == 'linze_5f', J(z))
            run.check('交往中開門那句是「（她開了門，沒有說話，拉你的袖子進去。）」', any('拉你的袖子進去' in t for t in lines), J(lines[-8:]))
            await run.shot(pg, 'lab_in')
        elif go == 'jp':
            await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
            await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
            ok1 = await pg.evaluate("(id=>{ const b=[...document.querySelectorAll('#phoneBody [data-msg]')].find(x=>x.dataset.msg===id); if(!b) return false; b.click(); return true; })(%s)" % J(ID)); await pg.wait_for_timeout(900)
            ok2 = await pg.evaluate("(id=>{ const b=document.querySelector('#phoneBody [data-msgto=\"'+id+'\"]'); if(!b) return false; b.click(); return true; })(%s)" % J(ID)); await pg.wait_for_timeout(900)
            tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>b.dataset.msgt+'='+b.textContent.trim())")
            await run.shot(pg, 'jp_topics')
            ok3 = await pg.evaluate("(k=>{ const b=document.querySelector('#phoneBody [data-msgt=\"'+k+'\"]'); if(!b) return false; b.click(); return true; })(%s)" % J(ID + '|bday')); await pg.wait_for_timeout(1500)
            run.note('手機：朋友頁「訊息」%s、「傳訊息」%s、話題 %s → 傳「生日快樂」%s' % (ok1, ok2, J(tops), ok3))
            await L.close_panels(pg, cdp); await L.phone_away(pg, cdp)
            run.check('手機傳得出「生日快樂」', ok3, J(tops))
            q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'sisb13_jp_bday'); return q?{day:q.day,h:q.h,verb:q.verb,no:q.no,state:q.state}:null; })()")
            run.check('排了視訊（當地 22:00、接起來／先不接）', bool(q) and q['h'] == 22 and q['verb'] == '接起來', J(q))
            t0 = time.time()
            while time.time() - t0 < 400:
                s = await pg.evaluate(ST)
                if s['ch'] and any(t.startswith('接起來') for t in s['ch']): break
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(1000)
            run.note('等到：%s' % J(await pg.evaluate(ST))); await run.shot(pg, 'jp_ring')
            l1, c1 = await play(pg, cdp, run, CFG.get('pick'), max_s=240); lines += l1; chs += c1
        elif go == 'kv':
            run.check('前置：出遊排好了（18:30 118 巷・定食店）', bool(pr.get('kv')), J(pr.get('kv')))
            t0 = time.time()
            while time.time() - t0 < 600:
                s = await pg.evaluate(ST)
                if s['ch'] and any(re.search('^出發', t) for t in s['ch']): break
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(1000)
            run.note('出遊提醒：%s' % J(await pg.evaluate(ST))); await run.shot(pg, 'kv_go')
            l1, c1 = await play(pg, cdp, run, CFG.get('pick'), max_s=360); lines += l1; chs += c1
        evs = await pg.evaluate("window.__EV"); done = await pg.evaluate("id=>!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done[id])", CFG['ev'])
        run.note('演過的事件：%s' % J(evs)); run.note('句子：%s' % J(lines[:40])); run.note('選項：%s' % J(chs[:6]))
        if CFG.get('none'):
            run.check('對照：%s 不演' % CFG['ev'], CFG['ev'] not in [e['id'] for e in evs] and not done, J(evs))
        else:
            run.check('%s 照常觸發、演完（events.done）' % CFG['ev'], CFG['ev'] in [e['id'] for e in evs] and done, J({'evs': evs, 'done': done}))
            if first: run.check('開頭照稿（「%s」）' % first[0][:30], any(first[0][:16] in t for t in lines), J(lines[:6]))
        fl = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {SIS13_WALK:F.SIS13_WALK, SIS13_CAKE:F.SIS13_CAKE, SIS13_POOL:F.SIS13_POOL, SIS13_LAUNDRY:F.SIS13_LAUNDRY, SIS13_LAB_EVE:F.SIS13_LAB_EVE, SIS13_JP_BDAY:F.SIS13_JP_BDAY, KV_HANDOVER:F.KV_HANDOVER, met_sis:F.met_sis, SIS_W1:F.SIS_W1}; })()")
        run.note('旗標：%s' % J(fl))
        if MODE == 'walk': run.check('選「好。」走完記 SIS13_WALK', fl['SIS13_WALK'] is True, J(fl))
        if MODE == 'laundry': run.check('記 SIS13_LAUNDRY', fl['SIS13_LAUNDRY'] is True, J(fl))
        if MODE == 'jp': run.check('記 SIS13_JP_BDAY', bool(fl['SIS13_JP_BDAY']), J(fl))
        if MODE == 'kv_new':
            run.check('沒認識：Kevin 介紹學姊（「學弟，這是溫學姊。我們家族最大的。」）＋她自我介紹（「……溫書瑀。碩一。」）', any('這是溫學姊' in t for t in lines) and any('溫書瑀。碩一' in t for t in lines), J(lines[:12]))
            run.check('演完在這裡認識（met_sis、SIS_W1）', fl['met_sis'] is True and fl['SIS_W1'] is True, J(fl))
        if MODE == 'kv_met':
            run.check('認識的：只有「（對你點了一下頭）來了。」、沒有 Kevin 介紹、沒有「碩一」', any('來了。' in t for t in lines) and not any('這是溫學姊' in t for t in lines) and not any('碩一' in t for t in lines), J(lines[:12]))
        if MODE == 'lab':
            run.check('5F 第一次「七點以後。……你準時。」', any('七點以後' in t for t in lines), J(lines[-8:]))
            snap = await pg.evaluate("()=>GAME.snapshot()"); snap['hour'] = 21.67
            await L.load_state(pg, snap, quiet_events=False, quiet_phone=True)
            run.setup('[捷徑] 同一份進度（還在 5F、LAB5_IN_EVE 記著）跳到 21:40')
            t0 = time.time(); z = None
            while time.time() - t0 < 90:
                z = await pg.evaluate("GAME.G.zone")
                if z == 'linze_4f': break
                l2, c2 = await play(pg, cdp, run, None, max_s=8); lines += l2
                await pg.wait_for_timeout(1000)
            await run.shot(pg, 'lab_leave')
            run.check('21:30 以後她離開、玩家一起回到 4F 樓梯間', z == 'linze_4f', str(z))
        await run.shot(pg, 'end')
        moved, n, sx = await L.push_until(pg, cdp, 0, -60, 0.3, max_pushes=3, ms=1200)
        if moved < 0.3: moved, n, sx = await L.push_until(pg, cdp, 0, 60, 0.3, max_pushes=2, ms=1200)
        run.check('最後推搖桿走得動', moved >= 0.3, '%.2f m' % moved)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
