"""BB（帳號 A）2026-10-21：LAWWW 22:23 派的 DATE-OVERNIGHT-1021 兩天一夜約會（開發分支 c6348e60 整合 aadate 669b4fa3，照 AA_359 c7dd0000）。
對照表：子代理 2026-10-21 22:5x 的報告（Node 走過手機那條路：INV.flow → DATE.menu → OUT.prompt → 兩天的場景；逐字稿在 scratchpad probe_ov/）。
這支在瀏覽器裡照玩家走一遍，看玩家實際看到的：手機「約」→ 去校外… → 兩天一夜… → 地點 → 交通 → 日期 → 09:00 出發 → 就這樣約 → 她回一句；
睡覺 → 08:30 鬧鐘 → 08:45「現在要出發嗎？」→ 出發 → 到達 → 選點（第一天兩個）→ 晚上 → 第二天早上 → 選點 → 離開 → 回到台大。
【前置】使用者 9/25 存檔改日期（Y1S2 2026-03-27（五）20:00 宿舍等）；quiet_events（條件事件不演，這次只看約會）；
讀檔後在頁面裡設：她的關係到第 6 階（fam60 trust45 comf40 npcRom55 rom30）或交往中（dating_<id>）、FIRST_MET、聯絡方式、錢 30,000。
可昕「第 6 階、沒交往」介面上沒有「約」（canInvite 只看 dating_kexin）→【捷徑】console 呼叫 INV.flow（手機那條，together=false）。
AA 22:35（e75d1cce）AA_359 第 5 節：B1、B2、B7、B8、B9、B12、5-2 九句開發分支還沒做；這裡看到舊的就記「還沒照新稿」（不是遊戲壞掉）。
已知、不重報：BUG-DATE-FARE-DOUBLE（車資兩倍，記金額）。Playwright 手機模擬（預設橫向；PORT 情境直向）、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=... python3 overnight_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)

NAMES = {'heroine_01': '以安', 'heroine_02': '芷若', 'heroine_03': '語彤', 'heroine_04': '子晴', 'heroine_05': '學姊', 'classmate_peishan': '沛珊', 'kexin': '可昕'}
S6 = {'fam': 60, 'trust': 45, 'comf': 40, 'npcRom': 55, 'rom': 30}
NIGHT1 = '（晚上住在車站附近的旅館。兩間房，隔著一道牆。）'; NIGHT2 = '（晚上住在一間小民宿。窗外很安靜。）'
HOME_NIGHT = '（晚上她回家。你住在車站附近的旅館。）'; RENT_NIGHT = '（晚上她回租的地方。你住在車站附近的旅館。）'
# D27 第一次去（子代理從 d1b3d5f9 的 date_lines.js 走出來的逐字稿；文字層 #134 已核對 32 地點一字不差）
D27 = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'overnight_d27_expect.json'), encoding='utf-8'))

def sc_d27(cid, dating):
    return dict(cid=cid, dating=dating, key='2026-03-27', h=20, loc='嘉義檜意森活村', mode='高鐵', date='明天 3/28（六）～3/29（日）', trip='2026-03-28',
                exp=D27['%s|%s' % (cid, 'dating' if dating else 'single')], arrive_tag='（嘉義檜意森活村。）')

SCENS = {}
for c in NAMES:
    SCENS['D27_%s_S' % NAMES[c]] = sc_d27(c, False)
    SCENS['D27_%s_D' % NAMES[c]] = sc_d27(c, True)
SCENS.update({
    'SP_A': dict(cid='heroine_01', dating=False, key='2026-07-24', h=20, loc='臺中草悟道與國立臺灣美術館', mode='高鐵', date='明天 7/25（六）～7/26（日）', trip='2026-07-25', arrive_tag='（臺中草悟道與國立臺灣美術館。）',
                 exp={'arrive': ['臺中。……我長大的地方。', '被你帶著逛，有點奇怪。……明明是我比較熟。'], 'night': [HOME_NIGHT], 'morning': '我媽多做了一份早餐。……叫我帶給你。',
                      'leave': ['原來草悟道走完這麼遠。我以前都只走一段。', '……我的腳明天會痛。']}, note='以安 D26 2026-07-25（回台中那個週末；她回家）'),
    'SP_B': dict(cid='heroine_02', dating=False, key='2026-06-30', h=20, loc='臺中草悟道與國立臺灣美術館', mode='高鐵', date='7/4（六）～7/5（日）', trip='2026-07-04', arrive_tag='（臺中草悟道與國立臺灣美術館。）',
                 exp={'arrive': ['臺中。我的第一卷底片，就是在這裡拍的。', '高中的時候。拍得很爛。'], 'night': [HOME_NIGHT], 'morning': '我出門的時候，我媽問我跟誰。……我說回來再講。',
                      'leave': ['天要暗了。臺中的天空比臺北大。', '這是我高中最喜歡的一件事。']}, note='芷若 D26 2026-07-04（她回台中；6/30 約、睡四晚）'),
    'SP_C': dict(cid='classmate_peishan', dating=False, key='2027-10-08', h=20, loc='臺南國立臺灣文學館與安平', mode='高鐵', date='明天 10/9（六）～10/10（日）', trip='2027-10-09', arrive_tag='（臺南國立臺灣文學館與安平。）',
                 flags={'PS_RECONNECT': True},
                 exp={'arrive': ['臺南！太陽好大。', '我爸媽說，好好玩，店裡不用擔心。'], 'night': [RENT_NIGHT], 'morning': '我在樓下。早餐我買好了。',
                      'leave': ['腳好痠。可是好好玩。', '我買了蝦捲給我爸媽。我爸一定會說他也會做。']}, note='沛珊大三在台南（PS_RECONNECT）D28'),
    'SP_B2': dict(cid='classmate_peishan', dating=True, key='2027-08-13', h=20, loc='臺中草悟道與國立臺灣美術館', mode='高鐵', date='明天 8/14（六）～8/15（日）', trip='2027-08-14', arrive_tag='（臺中草悟道與國立臺灣美術館。）',
                  exp={'night': [HOME_NIGHT], 'morning_new': '我在樓下。早餐從我家店裡帶來的。', 'morning_old': '我在樓下。早餐我買好了。'}, note='AA_359 B2：沛珊在台中老家約 D26（早上那句新稿）'),
    'SP_D': dict(cid='heroine_01', dating=True, key='2026-03-27', h=20, loc='南投日月潭', combo='南投日月潭＋南投清境農場', mode=None, date='明天 3/28（六）～3/29（日）', trip='2026-03-28', arrive_tag='（南投日月潭。）',
                 exp={'arrive': ['湖比地圖上看的大很多。', '走一圈要多久，我查一下。'], 'arrive2': ['這裡快兩千公尺。我查過了。', '……難怪這麼冷。'], 'night': [NIGHT2],
                      'leave': ['雲海要再看一次。', '下次早上來。下午的雲比較薄。'], 'b8': '（吃完早餐，你們開車上清境。一個半小時。）'}, note='日月潭＋清境（以安交往中；B7、B8 新稿）'),
    'EXAM': dict(cid='heroine_01', dating=False, key='2026-06-12', h=20, loc='嘉義檜意森活村', mode='高鐵', date='明天 6/13（六）～6/14（日）', trip=None, exam=True, note='考試週：09:00 出發灰掉、寫「考試週」'),
    'SAVELOAD': dict(sc_d27('heroine_01', False), reload='go', note='到達（強制自動存檔）以後重新整理 → 讀取 → 自動存檔 → 出發'),
    'SAVELOAD_MOVE': dict(sc_d27('heroine_01', False), reload='move', note='讀到達的存檔後選「改時間」→ 改到明天 → 隔天出發的車程（子代理在 Node 看到 q.arrived 沒清：車程 0）'),
    'PORT': dict(sc_d27('heroine_04', True), portrait=True, book_only=True, note='直向畫面：約的每一層選單（日期 7 個、兩天一夜 7 個、去校外 25 項）捲得到、點得到'),
})
for k, v in SCENS.items(): v.setdefault('note', '%s %s D27' % (NAMES[v['cid']], '交往中' if v['dating'] else '第 6 階'))

HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; window.__CAP=[]; window.__TOAST=[]; window.__MONEY=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(t){ try{ window.__TOAST.push({t:String(t||''), at:at()}); }catch(e){} return t0.apply(this,arguments); }; }
  if(GAME.money){ const m0=GAME.money; GAME.money=function(d,why){ try{ window.__MONEY.push({d:+d, why:String(why||''), at:at()}); }catch(e){} return m0.apply(this,arguments); }; }
  const watch=id=>{ const e=document.getElementById(id); if(!e) return; let last=''; new MutationObserver(()=>{ const t=(e.textContent||'').trim(); if(t&&t!==last){ last=t; window.__CAP.push({id, t, at:at()}); } }).observe(e,{childList:true,subtree:true,characterData:true}); };
  watch('title3'); watch('caption'); })()"""
SETUP = """(([cid,dating,rel])=>{ const G=GAME.G; for(const k in G.flags) if(k.indexOf('dating_')===0) G.flags[k]=false; if(dating) G.flags['dating_'+cid]=true;
  const R=SOCIAL.rel(cid); Object.assign(R,rel); SOCIAL.remember(cid,'FIRST_MET','');
  if(typeof INV!=='undefined'){ INV.rec(G); if(!(INV.hasContact&&INV.hasContact(G,cid))) G.contacts[cid]=G.day-30; } G.money=Math.max(+G.money||0,30000);
  let st=null, can=null; try{ st=DATE.stageNum(cid); }catch(e){} try{ can=INV.canInvite(G,cid); }catch(e){}
  return {stage:st, can, money:G.money, day:CALENDAR.dateOf(G.day).key, h:G.hour, zone:G.zone}; })"""
TRIP = """(()=>{ const T=(GAME.G.trips||[]); const t=T[T.length-1]; if(!t) return null; return {kind:t.kind, night:t.night, status:t.status, day:CALENDAR.dateOf(t.day).key, depart:t.depart, back:t.back, leave:t.leave, fare:t.fare, lodging:t.lodging, transport:t.transport, locs:t.locs, spots:t.spots, departed:!!t.departed}; })()"""
STATE = """(()=>{ const G=GAME.G; return {day:G.day, key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone, money:G.money, ov:JSON.stringify(G.flags.DATE_OVERNIGHT||null)}; })()"""
END_OPTS = ('今天先到這裡', '差不多了，回去吧')


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.textContent.trim(), dim:b.classList.contains('dim')||b.disabled}))")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k)
    await pg.wait_for_timeout(300)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2, r.top>=0&&r.bottom<=innerHeight]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1]); return c[2]


async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return c[2]


async def wait_choices(pg, cdp, secs=40):
    """等選項出來；途中的對話點掉（記在 __LOG）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']: return await opts(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(600)
    return None


async def book(pg, cdp, run, sc, res):
    """手機「約」→ 一層一層選。回傳 True＝約好了"""
    picks = ['去校外…', '兩天一夜…', sc['loc']] + ([sc['combo']] if sc.get('combo') else []) + ([sc['mode']] if sc.get('mode') else []) + [sc['date'], '09:00 出發', '就這樣約']
    levels = []; res['levels'] = levels
    if sc['cid'] == 'kexin' and not sc['dating']:
        run.note('【捷徑】可昕第 6 階沒交往：介面上沒有「約」，console 呼叫 INV.flow(GAME,"kexin",null,false)（手機那條）')
        await pg.evaluate("void (GAME.sceneBegin(), INV.flow(GAME,'kexin',null,false).finally(()=>GAME.sceneEnd()))")
    else:
        await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1300)
        await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"friends\"]')")
        got = await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-inv=\"%s\"]')" % sc['cid'])
        if not got:
            row = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\n/g,'｜').slice(0,300)")
            run.check('%s：手機「人」有她的「約」' % sc['id'], False, row); return False
    i = 0
    while i < len(picks):
        ops = await wait_choices(pg, cdp)
        if not ops: run.check('%s：約的第 %d 層（%s）出現' % (sc['id'], i + 1, picks[i]), False, ''); return False
        texts = [o['t'] for o in ops]; levels.append(texts)
        if sc.get('portrait') and len(levels) <= 8: await run.shot(pg, '%s_book%d' % (sc['id'], len(levels)))
        k = next((j for j, o in enumerate(ops) if o['t'].startswith(picks[i])), None)
        if k is None and i + 1 < len(picks):   # 沒有這一層（例：清境沒有交通）就看下一層
            k2 = next((j for j, o in enumerate(ops) if o['t'].startswith(picks[i + 1])), None)
            if k2 is not None: i += 1; k = k2
        if k is None: run.check('%s：第 %d 層找得到「%s」' % (sc['id'], len(levels), picks[i]), False, json.dumps(texts, ensure_ascii=False)[:400]); return False
        if sc.get('exam') and picks[i] == '09:00 出發':
            res['exam_opt'] = ops[k]; n0 = len(await pg.evaluate("window.__TOAST||[]"))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500)
            toasts = (await pg.evaluate("window.__TOAST||[]"))[n0:]; still = await opts(pg)
            res['exam_toast'] = toasts; await run.shot(pg, 'EXAM_dim')
            run.check('EXAM：「%s」那一天的 09:00 出發灰掉、提示寫「考試週」' % sc['date'], ops[k]['dim'] and '考試週' in ops[k]['t'], json.dumps(ops[k], ensure_ascii=False))
            run.check('EXAM：點下去跳「考試週」、停在同一層', any('考試週' in x['t'] for x in toasts) and bool(still) and any(o['t'].startswith('09:00 出發') for o in still), json.dumps({'toast': toasts, 'still': [o['t'][:20] for o in (still or [])]}, ensure_ascii=False))
            kk = next((j for j, o in enumerate(still or []) if o['t'].startswith('算了')), None)
            if kk is not None: await tap_idx(pg, cdp, kk)
            return False
        vis = await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1300)
        if sc.get('portrait'): res.setdefault('portrait_vis', []).append([picks[i], vis])
        i += 1
    for _ in range(12):   # 摘要、她回一句、約好了
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['choices']: break
        await pg.wait_for_timeout(600)
    log = await pg.evaluate("window.__LOG||[]"); res['book_lines'] = log[-6:]
    tr = await pg.evaluate(TRIP); res['booked'] = tr
    return bool(tr) and tr.get('status') == 'booked'


async def sleep_to(pg, cdp, run, sc, tday, secs=1500):
    """照玩家：還沒到出遊那天就去宿舍的床睡覺（醒來的課表選單點「先起床再說」）；到了那天停在 08:30 以後"""
    t0 = time.time()
    while time.time() - t0 < secs:
        st = await pg.evaluate(STATE)
        if st['day'] >= tday: return True
        await L.phone_away(pg, cdp)
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg); t = [o['t'] for o in ops]
            k = next((j for j, o in enumerate(t) if o.startswith(('睡到明天早上', '睡覺', '先起床再說', '先起床'))), 0)
            say('   （睡覺途中）%s %s → %s' % (st['key'], t, t[k] if t else '')); await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['busy']: await pg.wait_for_timeout(800); continue
        if st['zone'] != 'dorm':
            run.note('%s：不在宿舍（%s），等一下' % (sc['id'], st['zone'])); await pg.wait_for_timeout(2000); continue
        bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
        if not bed: await pg.wait_for_timeout(1500); continue
        if await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=120):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    return False


async def trip(pg, cdp, run, sc, res, secs=1800):
    """出遊那天：等「現在要出發嗎？」→ 出發 → 兩天。回傳 True＝回到台大"""
    t0 = time.time(); seen = []; res['trip_choices'] = seen; reloaded = False; moved = False
    while time.time() - t0 < secs:
        tr = await pg.evaluate(TRIP)
        if tr and tr['status'] == 'done':
            s = await L.state(pg)
            if not s['dlg'] and not s['choices'] and not s['busy']: return True
        s = await L.state(pg)
        log = await pg.evaluate("window.__LOG||[]")
        if sc.get('reload') and not reloaded and any(x['t'] == sc['arrive_tag'] for x in log):
            await pg.wait_for_timeout(2500); st = await pg.evaluate(STATE); res['before_reload'] = {'state': st, 'trip': tr}
            run.note('到達（%s %.2f）以後重新整理 → 標題「讀取」→ 自動存檔' % (st['key'], st['h']))
            await pg.reload(); await L.wait_loaded(pg); await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
            ok = await L.tap(pg, cdp, '#saveSlots .item:first-child .btn.pri'); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK)
            res['after_reload'] = {'loaded': ok, 'state': await pg.evaluate(STATE), 'trip': await pg.evaluate(TRIP)}; reloaded = True
            say('   讀檔後：%s' % json.dumps(res['after_reload'], ensure_ascii=False)); continue
        if s['choices']:
            ops = await opts(pg); t = [o['t'] for o in ops]; st = await pg.evaluate(STATE)
            seen.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': t, 'reloaded': reloaded})
            if t and t[0].startswith('出發'):
                if sc.get('reload') == 'move' and reloaded and not moved:
                    k = next((j for j, x in enumerate(t) if x.startswith('改時間')), 0); moved = True
                else: k = 0
                if len(seen) <= 3 or reloaded: await run.shot(pg, '%s_prompt%d' % (sc['id'], len(seen)))
            elif any(x.startswith('改到明天同一個時間') for x in t): k = next(j for j, x in enumerate(t) if x.startswith('改到明天同一個時間'))
            elif any(x.startswith(END_OPTS) for x in t):
                k = next((j for j, o in enumerate(ops) if not o['t'].startswith(END_OPTS) and not o['dim']), None)
                if k is None: k = next(j for j, x in enumerate(t) if x.startswith(END_OPTS))
            else: k = 0
            seen[-1]['pick'] = t[k] if t else None
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1300); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if moved and (await pg.evaluate(STATE))['zone'] == 'dorm' and not s['busy']:
            tday = await pg.evaluate("(()=>{ const T=GAME.G.trips||[]; const t=T[T.length-1]; return t?t.day:null; })()")
            if tday is not None and (await pg.evaluate(STATE))['day'] < tday:
                run.note('改到明天以後：照玩家去睡覺'); await sleep_to(pg, cdp, run, sc, tday); continue
        await L.phone_away(pg, cdp); await pg.wait_for_timeout(1000)
    return False


def idx(lst, t):
    return [i for i, x in enumerate(lst) if x == t]


async def one(p, run, base, sid):
    sc = dict(SCENS[sid]); sc['id'] = sid; res = {'sid': sid, 'note': sc['note']}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not sc.get('portrait'))
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
        d = await pg.evaluate("STORY.dayOfKey('%s')" % sc['key'])
        for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05')):
            dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
            if dd <= d: F[k] = dd
        F['KX_DEC3_MIGRATED'] = True; F.update(sc.get('flags') or {})
        G.update({'day': d, 'hour': sc['h'], 'zone': 'dorm', 'pos': None, 'money': 30000, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
        await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
        pre = await pg.evaluate(SETUP + "(%s)" % json.dumps([sc['cid'], sc['dating'], S6]))
        res['pre'] = pre; say('   讀檔後：%s' % json.dumps(pre, ensure_ascii=False))
        run.setup('[前置] %s：使用者 9/25 存檔改到 %s %02d:00 宿舍（quiet_events）；%s %s；錢 30,000%s' % (sid, sc['key'], sc['h'], NAMES[sc['cid']], '交往中' if sc['dating'] else '第 6 階', ('；' + json.dumps(sc.get('flags'), ensure_ascii=False)) if sc.get('flags') else ''))
        m0 = await pg.evaluate("GAME.G.money"); ov0 = await pg.evaluate("JSON.stringify(GAME.G.flags.DATE_OVERNIGHT||null)")
        dl0 = await pg.evaluate("(id=>{ try{ return DATE.log(GAME.G,id).count||0; }catch(e){ return null; } })('%s')" % sc['cid'])
        okb = await book(pg, cdp, run, sc, res)
        if sc.get('exam'): pass
        else:
            bl = [x['t'] for x in res.get('book_lines', [])]
            run.check('%s：約好了（trips 最後一筆 booked，兩天一夜）' % sid, okb and (res.get('booked') or {}).get('kind') == 'overnight', json.dumps({'booked': res.get('booked'), 'levels': [l[:4] for l in res['levels']]}, ensure_ascii=False)[:500])
            if sc.get('exp', {}).get('reply'):
                run.check('%s：她答應的那一句（第一次）%s' % (sid, '」「'.join(sc['exp']['reply'])), all(x in bl for x in sc['exp']['reply']), json.dumps(res.get('book_lines'), ensure_ascii=False)[:300])
            summ = next((x for x in bl if '兩天一夜' in x and '回到台大' in x), '')
            res['summary_book'] = summ
            if sc.get('portrait'):
                run.check('PORT：直向每一層都捲得到、點得到（點的那一刻按鈕在畫面裡）', okb and all(v for _, v in res.get('portrait_vis', [])), json.dumps(res.get('portrait_vis'), ensure_ascii=False))
            if okb and not sc.get('book_only'):
                tday = await pg.evaluate("STORY.dayOfKey('%s')" % sc['trip'])
                slept = await sleep_to(pg, cdp, run, sc, tday)
                run.check('%s：睡到出遊那天' % sid, slept, json.dumps(await pg.evaluate(STATE), ensure_ascii=False))
                done = await trip(pg, cdp, run, sc, res)
                log = await pg.evaluate("window.__LOG||[]"); cap = await pg.evaluate("window.__CAP||[]"); toast = await pg.evaluate("window.__TOAST||[]"); money = await pg.evaluate("window.__MONEY||[]")
                res.update({'log': log[-90:], 'cap': cap[-30:], 'toast': toast[-30:], 'money': money[-20:], 'end': await pg.evaluate(STATE), 'trip': await pg.evaluate(TRIP)})
                T = [x['t'] for x in log]; C = [x['t'] for x in cap]; E = sc.get('exp') or {}
                run.check('%s：兩天走完、回到台大（trip done）' % sid, done and (res['trip'] or {}).get('status') == 'done', json.dumps({'trip': res['trip'], 'end': res['end']}, ensure_ascii=False)[:400])
                ai = idx(T, sc['arrive_tag'])
                if E.get('arrive'):
                    a = T[ai[-1] + 1: ai[-1] + 3] if ai else []
                    run.check('%s：到達「%s」→「%s」' % (sid, sc['arrive_tag'], '」「'.join(E['arrive'])), a == E['arrive'], json.dumps(a, ensure_ascii=False))
                nights = [x for x in T if x.startswith('（晚上')]
                run.check('%s：晚上旁白只有一句、是「%s」' % (sid, E.get('night', ['?'])[0]), len(nights) == 1 and nights == E.get('night', nights[:1]), json.dumps(nights, ensure_ascii=False))
                mi = idx(T, '（第二天早上。）')
                run.check('%s：「（第二天早上。）」只出現一次' % sid, len(mi) == 1, str(len(mi)))
                mline = T[mi[0] + 1] if mi and mi[0] + 1 < len(T) else ''
                res['morning'] = mline
                if E.get('morning'): run.check('%s：第二天早上她那一句「%s」' % (sid, E['morning']), mline == E['morning'], mline)
                if 'morning_new' in E:
                    stt = 'NEW' if mline == E['morning_new'] else ('OLD' if mline == E['morning_old'] else 'OTHER')
                    run.check('%s：沛珊在台中老家的早上照新稿「%s」（AA_359 B2；%s）' % (sid, E['morning_new'], {'NEW': '已照新稿', 'OLD': '還沒照新稿＝「早餐我買好了」', 'OTHER': '別的句子：' + mline}[stt]), stt == 'NEW', mline)
                si = [i for i, x in enumerate(T) if x.startswith('（這兩天去了')]
                if E.get('leave'):
                    lv = T[si[-1] - 2: si[-1]] if si else []
                    run.check('%s：離開「%s」' % (sid, '」「'.join(E['leave'])), lv == E['leave'], json.dumps(lv, ensure_ascii=False))
                run.check('%s：最後的結算旁白（這兩天去了…花了…）只有一次' % sid, len(si) == 1, json.dumps([T[i] for i in si], ensure_ascii=False)[:300])
                run.check('%s：字幕「回到台大。」' % sid, '回到台大。' in C, json.dumps(C[-6:], ensure_ascii=False))
                nm = NAMES[sc['cid']]
                bad = [x for x in log if '差不多了' in x['t'] and x['n'] and x['n'] not in ('', '祐廷')] + [{'t': o} for c in res.get('trip_choices', []) for o in c['opts'] if '告白' in o]
                run.check('%s：沒有她說的「差不多了」、沒有告白選項' % sid, not bad, json.dumps(bad, ensure_ascii=False)[:300])
                lodg = [m for m in money if m['d'] == -2500]; fare = [m for m in money if m['why'] == '交通']
                res['spend'] = m0 - res['end']['money']
                run.check('%s：住宿扣一次 2,500' % sid, len(lodg) == 1, json.dumps(money, ensure_ascii=False)[:300])
                run.note('%s：車資扣 %s（BUG-DATE-FARE-DOUBLE 已知：資料的 fare 已經是來回、程式又加一次）；整趟花 %s 元' % (sid, [m['d'] for m in fare], res['spend']))
                tr = res['trip'] or {}
                run.check('%s：trips 最後一筆 kind overnight、night=%s、status done' % (sid, 'dating' if sc['dating'] else 'single／home／rent'), tr.get('kind') == 'overnight' and tr.get('status') == 'done' and (tr.get('night') == ('dating' if sc['dating'] else 'single') or tr.get('night') in ('home', 'rent')), json.dumps(tr, ensure_ascii=False)[:300])
                dl1 = await pg.evaluate("(id=>{ try{ return DATE.log(GAME.G,id).count||0; }catch(e){ return null; } })('%s')" % sc['cid'])
                run.check('%s：dateLog 次數 +1（只加一次）' % sid, dl0 is not None and dl1 == dl0 + 1, '%s → %s' % (dl0, dl1))
                ov1 = res['end']['ov']; res['ov'] = [ov0, ov1]
                run.check('%s：DATE_OVERNIGHT 照人物記 {%s:1}（AA_359 B9 新稿；舊的照地點記）' % (sid, sc['cid']), ('"%s":1' % sc['cid']) in (ov1 or ''), '%s → %s' % (ov0, ov1))
                back_h = next((x['at'] for x in cap if x['t'] == '回到台大。'), None); res['back_at'] = back_h
                if res.get('booked'):
                    bk = res['booked']; run.check('%s：實際回到台大的時間和約的時候說的一樣（摘要：第二天約 %02d:%02d）' % (sid, int(bk['back']), round((bk['back'] % 1) * 60)), bool(back_h) and abs(float(back_h.split()[1]) - bk['back']) < 0.6, '摘要 %s；字幕「回到台大。」%s' % (summ, back_h))
                if sid == 'SP_D':
                    t2 = idx(T, '（南投清境農場。）'); a2 = T[t2[-1] + 1: t2[-1] + 3] if t2 else []
                    run.check('SP_D：第二天換清境「（南投清境農場。）」→「%s」' % '」「'.join(E['arrive2']), a2 == E['arrive2'], json.dumps(a2, ensure_ascii=False))
                    run.check('SP_D：第二天早上以後「%s」（AA_359 B8 新稿）' % E['b8'], E['b8'] in T, json.dumps(T[mi[0]: mi[0] + 4] if mi else [], ensure_ascii=False))
                    lists = [c for c in res.get('trip_choices', []) if any(o.startswith(END_OPTS) for o in c['opts'])]
                    cloud = [i for i, c in enumerate(lists) if any(o.startswith('觀景台看雲海') for o in c['opts'])]
                    d2first = next((i for i, c in enumerate(lists) if c['at'][:10] != sc['trip']), -1)
                    run.check('SP_D：「觀景台看雲海」只在第二天第一張清單（AA_359 B7 新稿）', cloud == [d2first], json.dumps({'cloud': cloud, 'd2first': d2first, 'lists': [(c['at'], [o[:8] for o in c['opts']]) for c in lists]}, ensure_ascii=False)[:500])
                if sid == 'SP_C':
                    run.check('SP_C：第二天早上不是「我四點半就醒了…」', '四點半' not in mline, mline)
                if sid in ('SAVELOAD', 'SAVELOAD_MOVE'):
                    ar = res.get('after_reload') or {}
                    pr = [c for c in res.get('trip_choices', []) if c.get('reloaded') and c['opts'] and c['opts'][0].startswith('出發')]
                    run.check('%s：讀到達的存檔 → 馬上問「現在要出發嗎？」，三個選項都在、沒有「趕不上」' % sid, ar.get('loaded') and bool(pr) and len(pr[0]['opts']) == 3 and not any('趕不上' in x for x in T[-60:]), json.dumps({'after_reload': ar, 'prompt': pr[:1]}, ensure_ascii=False)[:400])
                    if sid == 'SAVELOAD':
                        run.check('SAVELOAD：出發以後從「%s」重新演，整趟只算一次' % sc['arrive_tag'], len(ai) >= 1 and dl1 == dl0 + 1, json.dumps({'arrive_tags': len(ai), 'dateLog': [dl0, dl1]}, ensure_ascii=False))
                    else:
                        arr = [x for x in log if x['t'] == sc['arrive_tag']]
                        last = arr[-1]['at'] if arr else None; res['moved_arrive_at'] = last
                        nd = await pg.evaluate("CALENDAR.dateOf(STORY.dayOfKey('%s')+1).key" % sc['trip'])
                        run.check('SAVELOAD_MOVE：改到明天（%s）、08:45 出發以後，到達時間是 10:50 左右（有車程，不是 0 分鐘）' % nd, bool(last) and last.startswith(nd) and abs(float(last.split()[1]) - 10.83) < 0.5, json.dumps(arr, ensure_ascii=False)[:300])
        run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e:
        res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完（測試本身沒有例外）' % sid, False, str(e)[:300])
        try: await run.shot(pg, 'err_%s' % sid)
        except Exception: pass
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return res


async def main():
    run = L.Run('overnight', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = []
    scen = [s for s in os.environ.get('SCEN', ','.join(SCENS)).split(',') if s]
    async with async_playwright() as p:
        for sid in scen:
            say('== %s：%s' % (sid, SCENS[sid]['note'])); out.append(await one(p, run, base, sid))
            json.dump(out, open(os.path.join(OUT, 'overnight.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
