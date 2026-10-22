"""BB（帳號 A）2026-10-22：校外約會四個 bug（校外約會子代理 date2 b632844f → 開發分支 c906ae92；#164）——照玩家用手機約、看選單上寫的字和實際扣的錢。
  FARE        BUG-DATE-FARE-DOUBLE-1021（3f53b5a6）：車資照表（地點資料的交通費就是來回），不再乘 2。
              2026-03-27（五）20:00 宿舍，手機約語彤 →「去校外…」→「兩天一夜…」→ 臺南（D28）：交通小字「單程約 135 分、來回 2800 元」、確認那一句「預計花費 5300 元（含住宿 2500 元）」（舊版 8,100）→「算了」；
              再約「淡水金色水岸」（D13，捷運）明天 15:00：「預計花費 100 元」（舊版 200）→「就這樣約」→ 睡覺 → 隔天手機跳過時間停在出發前 → 出發 → 飲料攤（60 元）→ 回去：
              實際扣 160 元（車資 100＋飲料 60）、結算「花了 160 元（含來回車資）」。
  EXAMWEEK    BUG-DATE-EXAMWEEK-DAY-1021（858b9b99）：一日遊（D24～D27）不能排在考試週（AA_126 1-1，期中第 8～9 週、期末第 16 週）。
              2026-04-09（四，大一下第 7 週）20:00 約語彤「臺中草悟道與國立臺灣美術館」（D26 一日）高鐵：4/13（一，第 8 週）的出發時間灰掉、小字「考試週」、按了只提示「考試週」；
              4/11（六，第 7 週）照常；對照：同一天 4/13 半日的「淡水金色水岸」15:00 不擋（半日、晚上照舊）。
  OVERLAP     BUG-DATE-OVERLAP-1021（a8b4e839）：已經約好校外約會的時間，別的排程不能再排進來。
              3/27 20:00 先約語彤 3/28 15:00 淡水（回到台大約 19:20）→ 手機約阿哲「去公館吃飯」「明天 19:00」＝「你那個時間已經約了別人。改成 …？」、改的時間不在約會那段；
              「明天 12:10」照常（對照）；【前置】用遊戲的 INV.offer 放一則阿哲約你 3/28 18:00 麵店 → 手機按「答應」＝「那個時間你已經約了別人。」、邀約還是待回覆；11:00 那則按「答應」＝答應了（對照）。
  T7A_AN／T7A_ZY  DATE-T7A-HOMETOWN-1021（6efe6ca1，AA_350 T7a）：以安、芷若人在台中（寒暑假 presence kind home）時手機的「約」打開、只有「去校外…」、清單只列 D26 臺中（兩天一夜也只列 D26）；
              約明天 09:00 高鐵 → 她答應的那一句照 T7a：以安「臺中？……好。我去車站接你。」、芷若「你要來臺中？……好。我帶你走。」（以安 2026-01-24、芷若 2026-07-04）
  T7A_LOW     以安在台中、熟悉（第 5 階以下）：照舊關著（手機朋友頁沒有「約」、寫她回台中了）
  T7A_TRIP／T7A_PS  AA_372 #8 新加的「回台中的週末」（以安第 4／8／12 週末、沛珊單數週末；presence kind trip「回台中」，不是 home）：
              照 AA_372 #8 的設計（characters.js 那一段註解：trip＋signal＝週末回家、手機照常，邀約寫「回台中，不在臺北。」，不開「我去台中找妳？」）＝手機的約關著、寫「回台中，不在臺北。」。
              （BB 原本以為也照 T7a 只列 D26——不是，T7a 只管寒暑假 kind home；要不要也套 T7a 由 AA 定，另外問。）
  T7A_FRIBOOK 以安 9/26（五）在臺北時約她 9/27（六，她回台中的週末）去淡水 15:00：期待＝灰掉、照 S6 那一句婉拒；讀碼：DATE.check 只擋 kind home（S.homeNo），trip 週末照樣約得到——疑似 bug。
【前置】讀使用者存檔改日期、時間、地點（每個情境寫在 run.setup）；quiet_events（條件事件不演、要回的訊息不自己打開手機）；讀檔後在頁面裡設她的關係（第 6 階：熟 60、信任 45、自在 40、她的戀愛 55、祐廷 30）、
認識、聯絡方式、錢 30,000。之後照玩家：手機「朋友」→「約」→ 選項、睡覺、手機「跳過時間」、時間到按「出發」、約會裡選互動點。OVERLAP 的阿哲邀約是 INV.offer 放進去的（前置）。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=FARE,... python3 date_bugs_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
S6 = {'fam': 60, 'trust': 45, 'comf': 40, 'npcRom': 55, 'rom': 30}
NAMES = {'D13': '淡水金色水岸', 'D26': '臺中草悟道與國立臺灣美術館', 'D28': '臺南國立臺灣文學館與安平'}
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at()}); }catch(e){} return c0.apply(this,arguments); };
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(t){ try{ window.__LOG.push({n:'［提示］', t:String(t||''), at:at()}); }catch(e){} return t0.apply(this,arguments); }; }
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push({n:'［字幕］', t:String(b||a||'').replace(/<[^>]+>/g,'｜'), at:at()}); }catch(e){} return c1.apply(this,arguments); }; } })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone, money:G.money|0}; })()"""
CHOICES = """(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>{ const h=b.querySelector('.hint'); const hint=h?h.textContent:''; const full=b.textContent; return {t:full.slice(0,full.length-hint.length).trim(), hint:hint.trim(), dim:b.classList.contains('dim')}; }); })()"""
SETREL = """(([rels,extra])=>{ const G=GAME.G, F=G.flags; G.contacts=G.contacts||{};
  for(const id in rels){ const R=SOCIAL.rel(id); Object.assign(R,{fam:0,trust:0,comf:0,rom:0,npcRom:0},rels[id]); SOCIAL.remember(id,'FIRST_MET',''); G.contacts[id]=G.day-30; }
  Object.assign(F,extra||{}); G.money=Math.max(G.money|0,30000);
  const out={}; for(const id in rels){ let st=null, why=null, can=null, only=null; try{ st=DATE.stageNum(id); }catch(e){} try{ why=INV.whyNot(G,id); }catch(e){} try{ can=INV.canInvite(G,id); }catch(e){} try{ only=DATE.homeOnly(G,id); }catch(e){}
    let p=null; try{ p=STORY.presence(id,G); }catch(e){} out[id]={stage:st, whyNot:why, canInvite:can, homeOnly:only, presence:p}; } return out; })"""
TRIPS = """(()=>(GAME.G.trips||[]).map(t=>({trip:t.trip, who:t.who, locs:t.locs, d:CALENDAR.dateOf(t.day).key, depart:t.depart, back:+(+t.back).toFixed(2), kind:t.kind, transport:t.transport, fare:t.fare, fareV:t.fareV, status:t.status})))()"""


async def opts(pg):
    return await pg.evaluate(CHOICES)


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


async def phone_open(pg):
    return await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")


async def phone_tab(pg, cdp, tab):
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(800)


async def tap_sel_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def wait_choices(pg, cdp, timeout=25, through_dlg=True):
    """等選單出來；中間的對話（她的回覆、旁白）照玩家點過去。回傳選單"""
    t0 = time.time()
    while time.time() - t0 < timeout:
        o = await opts(pg)
        if o: return o
        s = await L.state(pg)
        if s['dlg'] and through_dlg: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(500)
    return []


async def pick(pg, cdp, want, label='', timeout=25, contains=False):
    """選單裡選開頭是 want（contains＝包含）的那一個。回傳 (選到的那一項, 整個選單)；找不到＝(None, 選單)"""
    o = await wait_choices(pg, cdp, timeout)
    k = next((i for i, x in enumerate(o) if (want in x['t'] if contains else x['t'].startswith(want))), None)
    say('   %s 選單 %s → %s' % (label, [x['t'][:16] + ('（灰）' if x['dim'] else '') for x in o], o[k]['t'] if k is not None else '（找不到「%s」）' % want))
    if k is None: return None, o
    await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1100); return o[k], o


async def dlg_text(pg):
    """對話框的整句（打字效果還沒打完也拿得到：GAME.D.full）"""
    return await pg.evaluate("((GAME.D&&GAME.D.full)||(document.getElementById('dlgText')||{}).textContent||'')")


async def wait_dlg(pg, contains, timeout=20):
    t0 = time.time()
    while time.time() - t0 < timeout:
        s = await L.state(pg)
        if s['dlg']:
            t = await dlg_text(pg)
            if contains in t: return t
        await pg.wait_for_timeout(400)
    return None


async def drive(pg, cdp, run, picks=None, max_s=240, label=''):
    """一直點到沒有對話、沒有選項（連續 3 次）；picks＝選單裡要選的字（依序找，包含就算）；找不到選第一個。回傳選單紀錄"""
    t0 = time.time(); idle = 0; ch = []
    while time.time() - t0 < max_s:
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            o = await opts(pg)
            if not o: await pg.wait_for_timeout(500); continue
            k = next((i for w in (picks or []) for i, x in enumerate(o) if w in x['t']), None)
            if k is None: k = next((i for i, x in enumerate(o) if x['t'].startswith(('先起床再說', '照樣跳過', '就這樣'))), 0)
            st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': [x['t'] for x in o], 'pick': o[k]['t']})
            say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [x['t'][:14] for x in o], o[k]['t'][:20]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); idle = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); idle = 0; continue
        if s.get('busy'): await pg.wait_for_timeout(700); continue
        idle += 1
        if idle >= 3: break
        await pg.wait_for_timeout(900)
    return ch


async def wait_for(pg, cdp, run, cond, max_s=400, picks=None, label=''):
    """時間照走，遇到對話、選單照 picks 點（包含就算；找不到選第一個），直到 cond（JS）成立"""
    t0 = time.time(); ch = []
    while time.time() - t0 < max_s:
        if await pg.evaluate(cond): return True, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            o = await opts(pg)
            if o:
                k = next((i for w in (picks or []) for i, x in enumerate(o) if w in x['t']), None)
                if k is None: k = next((i for i, x in enumerate(o) if x['t'].startswith(('先起床再說', '照樣跳過'))), 0)
                st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': [x['t'] for x in o], 'pick': o[k]['t']})
                say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [x['t'][:14] for x in o], o[k]['t'][:20]))
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return False, ch


FALLBACK = {'等到傍晚': ['等到傍晚', '等到下午'], '等到下午': ['等到下午']}


async def skip(pg, cdp, label_prefix, label=''):
    await phone_tab(pg, cdp, 'today'); got = None
    for pre in FALLBACK.get(label_prefix, [label_prefix]):
        got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-skip]')].find(b=>b.textContent.trim().startsWith(%s))" % json.dumps(pre))
        if got: break
    if not got:
        btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>b.textContent.trim())"); say('   %s 跳過時間沒有「%s」：%s' % (label, label_prefix, btns)); await L.phone_away(pg, cdp); return None
    await pg.wait_for_timeout(1500)
    for _ in range(6):
        o = await opts(pg)
        if o and any(x['t'].startswith('照樣跳過') for x in o): await tap_idx(pg, cdp, next(i for i, x in enumerate(o) if x['t'].startswith('照樣跳過'))); await pg.wait_for_timeout(1500); break
        if not o: await pg.wait_for_timeout(700)
        else: break
    await pg.wait_for_timeout(2500); say('   %s 跳過時間「%s」→ %s' % (label, got, await pg.evaluate(STATE))); return got


async def quick_go(pg, cdp, zone):
    await phone_tab(pg, cdp, 'places')
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(zone + '|'))
    if not got: await L.phone_away(pg, cdp); return False
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2500); return (await pg.evaluate("GAME.G.zone")) == zone


async def sleep_night(pg, cdp, run, label=''):
    st0 = await pg.evaluate(STATE)
    if st0['zone'] != 'dorm': await quick_go(pg, cdp, 'dorm')
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it: return None, False
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=120, lv=it[2]); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1300)
    o = await wait_choices(pg, cdp, 15, through_dlg=False); say('   %s 床：%s' % (label, [x['t'] for x in o]))
    k = next((i for i, x in enumerate(o) if x['t'].startswith('睡到明天')), None)
    if k is None: return o, False
    await tap_idx(pg, cdp, k); await pg.wait_for_timeout(2000)
    ok, _ = await wait_for(pg, cdp, run, "GAME.G.day>%d&&!GAME.E.player.busy" % st0['day'], max_s=240, label=label)
    await pg.wait_for_timeout(4000)
    for _ in range(3): await drive(pg, cdp, run, max_s=40, label=label); await pg.wait_for_timeout(2500)
    return o, ok


async def friends_row(pg, cdp, who):
    """手機「朋友」：這個人那一列的字、有沒有「約」"""
    await phone_tab(pg, cdp, 'friends')
    r = await pg.evaluate("""(id=>{ const b=document.querySelector('#phoneBody [data-person="'+id+'"]'); const row=b?b.closest('.item'):null; return {text:row?row.innerText.replace(/\\n/g,'｜'):null, inv:!!document.querySelector('#phoneBody [data-inv="'+id+'"]')}; })(%s)""" % json.dumps(who))
    return r


async def open_invite(pg, cdp, who, label=''):
    """手機「朋友」→ 這個人的「約」（INV.flow，手機約人）。回傳第一個選單"""
    r = await friends_row(pg, cdp, who)
    if not r['inv']: await L.phone_away(pg, cdp); return None, r
    await tap_sel_js(pg, cdp, "document.querySelector('#phoneBody [data-inv=\"%s\"]')" % who)
    return await wait_choices(pg, cdp, 20), r


async def close_flow(pg, cdp, label=''):
    """約完（或算了）以後：剩下的對話點掉、手機收起來"""
    await drive(pg, cdp, None, picks=['算了'], max_s=30, label=label)
    if await phone_open(pg): await L.phone_away(pg, cdp)


async def date_to_when(pg, cdp, who, loc, transport=None, overnight=False, label=''):
    """手機約她：去校外…（→ 兩天一夜…）→ 地點 →（交通）。回傳 {first, list, ovlist, transport, ok}；停在日期選單"""
    res = {}
    first, row = await open_invite(pg, cdp, who, label); res['row'] = row; res['first'] = [x['t'] for x in (first or [])]
    if first is None: return res
    got, o = await pick(pg, cdp, '去校外', label)
    if not got: return res
    o = await wait_choices(pg, cdp); res['list'] = [x['t'] + ('（灰）' if x['dim'] else '') for x in o]
    if overnight:
        got, o = await pick(pg, cdp, '兩天一夜', label)
        if not got: return res
        o = await wait_choices(pg, cdp); res['ovlist'] = [x['t'] for x in o]
    got, o = await pick(pg, cdp, NAMES[loc], label)
    if not got: return res
    o = await wait_choices(pg, cdp)
    if o and not any(x['t'].startswith(('今天', '明天')) for x in o):   # 交通選單（有兩種以上才會出現）
        res['transport'] = [{'t': x['t'], 'hint': x['hint']} for x in o]
        got, o = await pick(pg, cdp, transport or o[0]['t'], label)
        if not got: return res
    res['ok'] = True; return res


async def pick_day_time(pg, cdp, day_label, time_label, label=''):
    """日期選單選 day_label（包含）→ 時間選單：回傳時間選單（含小字、灰不灰）；選 time_label"""
    got, o = await pick(pg, cdp, day_label, label, contains=True)
    if not got: return None, None, o
    o = await wait_choices(pg, cdp); times = [{'t': x['t'], 'hint': x['hint'], 'dim': x['dim']} for x in o]
    k = next((i for i, x in enumerate(o) if x['t'].startswith(time_label)), None)
    if k is None: return times, None, o
    n0 = len(await pg.evaluate("window.__LOG||[]"))
    await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500)
    toast = [x['t'] for x in (await pg.evaluate("window.__LOG||[]"))[n0:] if x['n'] == '［提示］']
    return times, {'picked': o[k]['t'], 'dim': o[k]['dim'], 'hint': o[k]['hint'], 'toast': toast}, o


async def launch(p, run, base, key, h, zone, rels, flags=None, label=''):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: F[k] = dd
    for k in list(F.keys()):
        if k.startswith('dating_'): F[k] = False
    F['KX_DEC3_MIGRATED'] = True
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETREL + "(%s)" % json.dumps([rels, flags or {}]))
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（quiet_events）；關係 %s、認識、聯絡方式、錢 30,000；旗標 %s → %s' % (
        label, key, h, zone, json.dumps(rels, ensure_ascii=False), json.dumps(flags or {}, ensure_ascii=False), json.dumps(r, ensure_ascii=False)[:600]))
    say('   %s 設定：%s' % (label, json.dumps(r, ensure_ascii=False)[:400]))
    return b, pg, cdp, errs, r


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def book_d13(pg, cdp, run, res, label):
    """手機約語彤明天（3/28）15:00 淡水（D13，捷運）：確認那一句要寫「預計花費 100 元」→ 就這樣約"""
    r = await date_to_when(pg, cdp, 'heroine_03', 'D13', label=label); res['d13_menu'] = r
    if not r.get('ok'): run.check('%s：手機約語彤 → 去校外… → 淡水金色水岸' % label, False, json.dumps(r, ensure_ascii=False)[:400]); return False
    times, p, o = await pick_day_time(pg, cdp, '明天', '15:00', label); res['d13_times'] = times
    sm = await wait_dlg(pg, '預計花費', 20); res['d13_summary'] = sm
    run.check('%s：淡水（捷運）確認那一句「預計花費 100 元」（照表的來回；舊版乘 2＝200）' % label, bool(sm) and '預計花費 100 元' in sm, sm or json.dumps(times, ensure_ascii=False)[:300])
    if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
    got, o = await pick(pg, cdp, '就這樣約', label)
    await close_flow(pg, cdp, label)
    T = await pg.evaluate(TRIPS); res['trips'] = T; t = next((x for x in T if x['locs'] == ['D13'] and x['status'] == 'booked'), None)
    run.check('%s：約好了＝行程 3/28 15:00、車資 100、fareV 2' % label, bool(t) and t['fare'] == 100 and t['fareV'] == 2 and t['d'] == '2026-03-28' and t['depart'] == 15, json.dumps(T, ensure_ascii=False)[:300])
    return bool(t)


# ---------------------------------------------------------------- 情境
async def s_fare(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-03-27', 20.0, 'dorm', {'heroine_03': S6}, label=sid)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        # ① 臺南兩天一夜：小字和確認那一句（不約）
        rr = await date_to_when(pg, cdp, 'heroine_03', 'D28', transport='高鐵', overnight=True, label=sid + ' D28'); res['d28_menu'] = rr
        tr = {x['t'].split('（')[0]: x['hint'] for x in (rr.get('transport') or [])}
        run.check('%s：臺南（D28）交通小字照表：高鐵「單程約 135 分、來回 2800 元」' % sid, tr.get('高鐵') == '單程約 135 分、來回 2800 元', json.dumps(rr.get('transport'), ensure_ascii=False))
        if rr.get('ok'):
            times, pk, o = await pick_day_time(pg, cdp, '明天', '09:00', sid + ' D28'); res['d28_times'] = times
            sm = await wait_dlg(pg, '預計花費', 20); res['d28_summary'] = sm
            run.check('%s：臺南兩天一夜確認那一句「預計花費 5300 元（含住宿 2500 元）」（舊版 2800×2＋2500＝8100）' % sid, bool(sm) and '預計花費 5300 元（含住宿 2500 元）' in sm, sm or json.dumps(times, ensure_ascii=False)[:300])
            if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
            await pick(pg, cdp, '算了', sid)
        await close_flow(pg, cdp, sid); await run.shot(pg, '%s_after_d28' % sid)
        # ② 淡水半日：約好、走完，看實際扣多少
        if not await book_d13(pg, cdp, run, res, sid): raise RuntimeError('淡水沒約成')
        o, slept = await sleep_night(pg, cdp, run, sid); res['bed'] = [x['t'] for x in (o or [])]
        st = await pg.evaluate(STATE); res['morning'] = st
        run.check('%s：睡到 3/28 早上' % sid, st['key'] == '2026-03-28', json.dumps(st, ensure_ascii=False))
        await skip(pg, cdp, '等到傍晚', sid); st = await pg.evaluate(STATE); res['after_skip'] = st
        run.check('%s：手機「跳過時間」停在出發前（14:50，DATE.alarmsFor）' % sid, 14.7 <= st['h'] <= 14.95, json.dumps(st, ensure_ascii=False))
        ok, ch = await wait_for(pg, cdp, run, "(()=>{ const ch=document.getElementById('choices'); return !!ch&&!ch.classList.contains('hide')&&[...ch.querySelectorAll('button')].some(b=>b.textContent.trim().startsWith('出發')); })()", max_s=300, label=sid)
        m0 = await pg.evaluate("GAME.G.money|0"); res['m0'] = m0; await run.shot(pg, '%s_prompt' % sid)
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        await pick(pg, cdp, '出發', sid)
        ok2, ch2 = await wait_for(pg, cdp, run, "(()=>{ const t=(GAME.G.trips||[]).find(x=>(x.locs||[])[0]==='D13'); return !!t&&t.status==='done'&&(window.__LOG||[]).slice(%d).some(x=>x.n==='［字幕］'&&x.t.indexOf('回到台大')>=0); })()" % n0,
                                  max_s=600, picks=['飲料攤', '差不多了，回去吧', '（今天先不說）'], label=sid)   # 回程扣車資在演完以後（outings3d.js OUT.go）：等「回到台大。」那一行字幕
        await drive(pg, cdp, run, picks=['（今天先不說）'], max_s=60, label=sid); await pg.wait_for_timeout(3000)
        m1 = await pg.evaluate("GAME.G.money|0"); res['m1'] = m1; res['ch'] = ch2
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log
        settle = [x['t'] for x in log if x['t'].startswith('（今天去了')]
        run.check('%s：淡水走完實際扣 160 元（車資 100＋飲料 60）' % sid, ok2 and m0 - m1 == 160, json.dumps({'出發前': m0, '回來': m1, '差': m0 - m1}, ensure_ascii=False))
        run.check('%s：結算「花了 160 元（含來回車資）」' % sid, any('花了 160 元（含來回車資）' in x for x in settle), json.dumps(settle, ensure_ascii=False))
        await run.shot(pg, '%s_back' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_examweek(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-04-09', 20.0, 'dorm', {'heroine_03': S6}, label=sid + '（大一下第 7 週週四；4/13 起第 8 週＝期中考試週）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        rr = await date_to_when(pg, cdp, 'heroine_03', 'D26', transport='高鐵', label=sid); res['menu'] = rr
        if not rr.get('ok'): raise RuntimeError('沒走到日期選單：%s' % json.dumps(rr, ensure_ascii=False)[:300])
        days = await opts(pg); res['days'] = [x['t'] for x in days]
        times, pk, o = await pick_day_time(pg, cdp, '4/13', '09:00', sid); res['exam_times'] = times; res['exam_pick'] = pk; await run.shot(pg, '%s_0413_times' % sid)
        dt = [x for x in (times or []) if x['t'].endswith('出發')]
        run.check('%s：4/13（一，第 8 週）一日遊的出發時間全部灰掉、小字「考試週」' % sid, bool(dt) and all(x['dim'] and '考試週' in x['hint'] for x in dt), json.dumps(times, ensure_ascii=False)[:400])
        run.check('%s：按灰掉的 09:00 只提示「考試週」、不會約' % sid, bool(pk) and pk['dim'] and any('考試週' in t for t in pk['toast']) and not any(t['locs'] == ['D26'] for t in await pg.evaluate(TRIPS)), json.dumps(pk, ensure_ascii=False))
        got, o = await pick(pg, cdp, '換一天', sid)
        times2, pk2, o2 = await pick_day_time(pg, cdp, '4/11', '09:00', sid); res['ok_times'] = times2; await run.shot(pg, '%s_0411_times' % sid)
        t9 = next((x for x in (times2 or []) if x['t'].startswith('09:00')), None)
        run.check('%s：4/11（六，第 7 週）09:00 照常可以選（不是考試週）' % sid, bool(t9) and not t9['dim'] and '考試週' not in t9['hint'], json.dumps(times2, ensure_ascii=False)[:300])
        sm = await wait_dlg(pg, '預計花費', 15); res['summary_0411'] = sm
        if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
        await pick(pg, cdp, '算了', sid); await close_flow(pg, cdp, sid)
        # 對照：同一天半日（淡水）不擋
        rr2 = await date_to_when(pg, cdp, 'heroine_03', 'D13', label=sid + ' 半日'); res['menu_half'] = rr2
        if rr2.get('ok'):
            times3, pk3, o3 = await pick_day_time(pg, cdp, '4/13', '15:00', sid + ' 半日'); res['half_times'] = times3
            t15 = next((x for x in (times3 or []) if x['t'].startswith('15:00')), None)
            run.check('%s：對照——4/13 半日的淡水 15:00 不寫「考試週」（AA_126 1-1 只管一日遊、兩天一夜）' % sid, bool(t15) and '考試週' not in t15['hint'], json.dumps(times3, ensure_ascii=False)[:300])
            sm = await wait_dlg(pg, '預計花費', 10)
            if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
            await pick(pg, cdp, '算了', sid)
        await close_flow(pg, cdp, sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_overlap(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-03-27', 20.0, 'dorm', {'heroine_03': S6, 'zhe': {'fam': 50, 'trust': 35, 'comf': 20}}, label=sid)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        if not await book_d13(pg, cdp, run, res, sid): raise RuntimeError('淡水沒約成')
        sat = await pg.evaluate("STORY.dayOfKey('2026-03-28')")
        # ① 手機約阿哲：明天 19:00（撞到約會 15:00～19:20）
        first, row = await open_invite(pg, cdp, 'zhe', sid); res['zhe_first'] = [x['t'] for x in (first or [])]
        if first is None: raise RuntimeError('阿哲沒有「約」：%s' % json.dumps(row, ensure_ascii=False))
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        await pick(pg, cdp, '去公館吃飯', sid)
        got, o = await pick(pg, cdp, '明天 19:00', sid); res['zhe_times'] = [x['t'] for x in o]
        o2 = await wait_choices(pg, cdp, 15); log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['zhe_log'] = log
        mine = [x['t'] for x in log if '你那個時間已經約了別人' in x['t']]
        run.check('%s：約阿哲「明天 19:00」＝「你那個時間已經約了別人。」（3/28 15:00～19:20 和語彤去淡水）' % sid, bool(got) and bool(mine), json.dumps([x['t'] for x in log][-4:], ensure_ascii=False))
        alt = next((x['t'] for x in o2 if x['t'].startswith('好，就')), None); res['zhe_alt'] = alt
        run.check('%s：改的時間不在約會那段（3/28 15:00～19:20）' % sid, alt is None or not any(('明天 ' + hh) in alt for hh in ('15', '16', '17', '18', '19:0', '19:1')), json.dumps({'改成': alt, '選單': [x['t'] for x in o2]}, ensure_ascii=False))
        await pick(pg, cdp, '下次再說', sid); await close_flow(pg, cdp, sid)
        # ② 對照：明天 12:10
        first, row = await open_invite(pg, cdp, 'zhe', sid)
        n1 = len(await pg.evaluate("window.__LOG||[]"))
        if first is not None:
            await pick(pg, cdp, '去公館吃飯', sid); await pick(pg, cdp, '明天 12:10', sid); await drive(pg, cdp, run, picks=['下次再說'], max_s=30, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n1:]; res['zhe_noon_log'] = log
        run.check('%s：對照——阿哲「明天 12:10」不是「已經約了別人」' % sid, first is not None and not any('已經約了別人' in x['t'] for x in log), json.dumps([x['t'] for x in log][-4:], ensure_ascii=False))
        if await phone_open(pg): await L.phone_away(pg, cdp)
        # ③ 阿哲約你（INV.offer 放進去）：18:00 撞到、11:00 不撞
        ivs = await pg.evaluate("""(d=>{ const G=GAME.G; const a=INV.offer(G,'zhe','noodle',d,18,'明天六點，阿鳳麵店？'); const b=INV.offer(G,'zhe','noodle',d,11,'明天十一點，阿鳳麵店？'); return [a&&a.id,b&&b.id]; })(%d)""" % sat)
        run.setup('[前置] %s：用遊戲的 INV.offer 放兩則阿哲約你：3/28 18:00、11:00 阿鳳麵店 → %s' % (sid, ivs))
        res['offers'] = ivs; ans = {}
        for ivid, tag in zip(ivs, ('18', '11')):
            await phone_tab(pg, cdp, 'msg'); await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='p:zhe')")
            await pg.wait_for_timeout(800); await run.shot(pg, '%s_offer_%s' % (sid, tag))
            got = await tap_sel_js(pg, cdp, "document.querySelector('#phoneBody [data-ans=\"%s|yes\"]')" % ivid); await pg.wait_for_timeout(1500)
            st = await pg.evaluate("(id=>{ const v=INV.byId(GAME.G,id); return v?{state:v.state,accepted:!!v.accepted}:null; })(%s)" % json.dumps(ivid))
            M = await pg.evaluate("(GAME.G.msgs||[]).slice(-4).map(m=>({th:m.th,text:String(m.text||'')}))"); ans[tag] = {'tap': got, 'iv': st, 'msgs': M}
            await run.shot(pg, '%s_offer_%s_after' % (sid, tag)); await L.phone_away(pg, cdp)
        res['answers'] = ans
        run.check('%s：阿哲約你 3/28 18:00 按「答應」＝「那個時間你已經約了別人。」、邀約還沒答應' % sid, bool(ans['18']['tap']) and (ans['18']['iv'] or {}).get('state') == 'offered' and any('那個時間你已經約了別人' in m['text'] for m in ans['18']['msgs']), json.dumps(ans['18'], ensure_ascii=False)[:400])
        run.check('%s：對照——3/28 11:00 那則按「答應」＝答應了' % sid, bool(ans['11']['tap']) and (ans['11']['iv'] or {}).get('accepted') is True, json.dumps(ans['11'], ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


T7 = {'T7A_AN': ('heroine_01', '2026-01-24', 10.5, '臺中？……好。我去車站接你。', '明天'),
      'T7A_ZY': ('heroine_02', '2026-07-04', 10.5, '你要來臺中？……好。我帶你走。', '明天')}


async def s_t7a(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    who, key, h, yes, day = T7[sid]
    b, pg, cdp, errs, r = await launch(p, run, base, key, h, 'dorm', {who: S6}, label=sid + '（她在台中老家：presence kind home）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        row = await friends_row(pg, cdp, who); res['row'] = row; await run.shot(pg, '%s_friends' % sid)
        run.check('%s：手機朋友頁她那一列有「約」（T7a：她在台中也打開）' % sid, row['inv'], json.dumps(row, ensure_ascii=False)[:300])
        await L.phone_away(pg, cdp)
        first, row = await open_invite(pg, cdp, who, sid); res['first'] = [x['t'] for x in (first or [])]
        CAMPUS = ('去兩點半 Café', '去總圖一起念書', '去公館吃飯', '去溫州街散步', '去半熟', '去一盞')   # INV 的校園地點（「我去台中找妳？」寒暑假那一項 HV.offer 可以有）
        run.check('%s：約她的選單有「去校外…」、沒有 Café、總圖這些校園的地點' % sid, bool(first) and any(x['t'] == '去校外…' for x in first) and not any(x['t'].startswith(CAMPUS) for x in first), json.dumps(res['first'], ensure_ascii=False))
        if not first: raise RuntimeError('沒有約的選單')
        await pick(pg, cdp, '去校外', sid); o = await wait_choices(pg, cdp); res['list'] = [x['t'] for x in o]
        loc_list = [x['t'] for x in o if x['t'] not in ('算了', '兩天一夜…')]
        run.check('%s：約會清單只列 D26「%s」' % (sid, NAMES['D26']), loc_list == [NAMES['D26']], json.dumps(res['list'], ensure_ascii=False))
        if any(x['t'] == '兩天一夜…' for x in o):
            await pick(pg, cdp, '兩天一夜', sid); o2 = await wait_choices(pg, cdp); res['ovlist'] = [x['t'] for x in o2]
            run.check('%s：「兩天一夜…」裡也只有 D26' % sid, [x for x in res['ovlist'] if x != '算了'] == [NAMES['D26']], json.dumps(res['ovlist'], ensure_ascii=False))
            await pick(pg, cdp, '算了', sid); o = await wait_choices(pg, cdp)
        await pick(pg, cdp, NAMES['D26'], sid)
        o = await wait_choices(pg, cdp)
        if o and not any(x['t'].startswith(('今天', '明天')) for x in o): res['transport'] = [{'t': x['t'], 'hint': x['hint']} for x in o]; await pick(pg, cdp, '高鐵', sid)
        times, pk, o = await pick_day_time(pg, cdp, day, '09:00', sid); res['times'] = times
        sm = await wait_dlg(pg, '預計花費', 15); res['summary'] = sm
        if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        got, o = await pick(pg, cdp, '就這樣約', sid)
        await drive(pg, cdp, run, max_s=30, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log
        th = await pg.evaluate("(id=>(GAME.G.msgs||[]).filter(m=>m.th==='p:'+id).slice(-3).map(m=>String(m.text||'')))(%s)" % json.dumps(who)); res['thread'] = th
        run.check('%s：她答應那一句照 T7a「%s」（手機，寫進她的對話串）' % (sid, yes), any(x['t'] == yes for x in log) and yes in th, json.dumps({'台詞': [x['t'] for x in log][-5:], '對話串': th}, ensure_ascii=False)[:400])
        T = await pg.evaluate(TRIPS); res['trips'] = T
        run.check('%s：約好了 D26 一日（明天 09:00）' % sid, any(t['locs'] == ['D26'] and t['status'] == 'booked' for t in T), json.dumps(T, ensure_ascii=False)[:300])
        if await phone_open(pg): await L.phone_away(pg, cdp)
        await run.shot(pg, '%s_after' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_t7a_closed(p, run, base, sid, out):
    """T7A_LOW（期待關著）／T7A_TRIP、T7A_PS（照 AA_372 #8 設計：週末回台中＝約關著、寫「回台中，不在臺北。」）"""
    res = out.setdefault(sid, {})
    C = {'T7A_LOW': ('heroine_01', '2026-01-24', {'fam': 25, 'trust': 5, 'comf': 0}, 'closed', '以安在台中（寒假 kind home）、只有熟悉'),
         'T7A_TRIP': ('heroine_01', '2025-09-27', S6, 'trip', '以安第 4 週週六回台中（AA_372 #8，presence kind trip）、第 6 階'),
         'T7A_PS': ('classmate_peishan', '2025-10-04', S6, 'trip', '沛珊單數週（第 5 週）週六回台中（AA_372 #8，presence kind trip）、第 6 階')}[sid]
    who, key, rel, expect, desc = C
    b, pg, cdp, errs, r = await launch(p, run, base, key, 10.5, 'dorm', {who: rel}, label='%s（%s）' % (sid, desc))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        row = await friends_row(pg, cdp, who); res['row'] = row; res['code'] = r; await run.shot(pg, '%s_friends' % sid)
        if expect == 'closed':
            run.check('%s：還不到第 5 階＝照舊關著（沒有「約」、寫她回台中了）' % sid, not row['inv'] and '台中' in (row['text'] or ''), json.dumps(row, ensure_ascii=False)[:300])
            await L.phone_away(pg, cdp)
        elif expect == 'trip':
            run.check('%s：週末回台中（AA_372 #8 設計）＝手機的約關著、寫「回台中，不在臺北。」、沒有「我去台中找妳？」' % sid,
                      not row['inv'] and '回台中，不在臺北' in (row['text'] or '') and '台中找' not in (row['text'] or ''), json.dumps({'朋友頁': row, '讀碼': (r or {}).get(who)}, ensure_ascii=False)[:500])
            await L.phone_away(pg, cdp)
        else:
            await L.phone_away(pg, cdp)
            lst = None
            if row['inv']:
                first, _ = await open_invite(pg, cdp, who, sid); res['first'] = [x['t'] for x in (first or [])]
                if first and any(x['t'].startswith('去校外') for x in first):
                    await pick(pg, cdp, '去校外', sid); o = await wait_choices(pg, cdp); lst = [x['t'] for x in o]; res['list'] = lst
                await close_flow(pg, cdp, sid)
            run.check('%s：（BB 10-22 期待，規格待 AA／LAWWW 定）她回台中的週末也照 T7a：手機的「約」打開、只列 D26' % sid,
                      row['inv'] and lst is not None and [x for x in lst if x not in ('算了', '兩天一夜…')] == [NAMES['D26']],
                      json.dumps({'朋友頁': row, '清單': lst, '讀碼': (r or {}).get(who)}, ensure_ascii=False)[:600])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_t7a_fribook(p, run, base, sid, out):
    """9/26（五）以安在臺北，約她 9/27（六，回台中的週末）"""
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-09-26', 20.0, 'dorm', {'heroine_01': S6}, label=sid + '（以安 9/27～9/28 回台中，AA_372 #8）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        rr = await date_to_when(pg, cdp, 'heroine_01', 'D13', label=sid); res['menu'] = rr
        if not rr.get('ok'): raise RuntimeError('沒走到日期選單：%s' % json.dumps(rr, ensure_ascii=False)[:300])
        times, pk, o = await pick_day_time(pg, cdp, '明天', '15:00', sid); res['times'] = times; res['pick'] = pk; await run.shot(pg, '%s_0927_times' % sid)
        t15 = next((x for x in (times or []) if x['t'].startswith('15:00')), None)
        run.check('%s：9/27（她在台中）約淡水 15:00 灰掉、寫她回台中（期待；讀碼 DATE.check 只擋 kind home → 疑似約得到）' % sid, bool(t15) and t15['dim'] and '台中' in t15['hint'], json.dumps(times, ensure_ascii=False)[:400])
        sm = await wait_dlg(pg, '預計花費', 10); res['summary'] = sm
        if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
        await pick(pg, cdp, '算了', sid); await close_flow(pg, cdp, sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ORDER = ['FARE', 'EXAMWEEK', 'OVERLAP', 'T7A_AN', 'T7A_ZY', 'T7A_LOW', 'T7A_TRIP', 'T7A_PS', 'T7A_FRIBOOK']
FN = {'FARE': s_fare, 'EXAMWEEK': s_examweek, 'OVERLAP': s_overlap, 'T7A_AN': s_t7a, 'T7A_ZY': s_t7a,
      'T7A_LOW': s_t7a_closed, 'T7A_TRIP': s_t7a_closed, 'T7A_PS': s_t7a_closed, 'T7A_FRIBOOK': s_t7a_fribook}


async def main():
    run = L.Run('date_bugs', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'date_bugs.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
