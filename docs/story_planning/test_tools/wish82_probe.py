"""BB-B 2026-10-24：清單第 82 項「心願事件」（wish3d.js；AA_426 起七位都演、hold 是空的——清單原文寫四位、子晴學姊可昕照一般約會，已過時）。開發分支 23bba7c8d 起。
  ASK_<id>（七位）：她主動約（手機）。訊息那一天、時間照 wish3d.js 的 S.msgDays／S.msgTime（沒寫的＝約的那天往前三天 21:00～22:30）；
      訊息逐字照 herInvite（{出發時間}照遊戲換）、選項「答應」「這週不行」、收到就算知道心願；手機按「答應」→ 她回的 accept 逐字 → 訂好那天的約會（wishAsk booked）。
      以安、語彤、芷若接著睡到那天、跳過時間、時間到「出發」→ 心願那一趟（抵達句逐字、芷若的固定活動〔電影 120 分〕句逐字、互動點、收尾）→ 心願完成。
  NOASK_*：不該約的時候沒有訊息（考試週的約會、心願已完成、寒假）。
  PINV_*：玩家自己用手機約她去心願地點：她回 playerInvite 的 unknown／known 逐字、約好。
  還沒寫（下一輪）：聊天提到（INV.meet 校園見面時說一次）、她有伴侶／知道你有伴侶不約、被拒絕後隔 4 週。
【前置】讀使用者存檔改日期、時間、地點（每個情境寫在 run.setup）；quiet_events；讀檔後在頁面裡設她的關係（第 5 階：熟 45、信任 30、自在 30、她的戀愛 35、祐廷 10）、
認識、聯絡方式、錢 30,000；企劃條件裡的事件、旗標用 js 設（寫在 run.setup／情境說明）。之後照玩家：手機訊息、朋友「約」、睡覺、手機「跳過時間」、「出發」、互動點。
Playwright 手機橫向模擬、?turbo，不是 iPhone。共用的工具照抄 date_bugs_probe.py（同一套點法）。
用法：LW_TESTS=<開發分支>/tests SCEN=ASK_heroine_01,... python3 wish82_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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
    if k is None:
        # 早上的床沒有「睡到明天」（只有小睡／睡到傍晚／快轉）：照玩家會做的，按「快轉」→「到下一個有事的日子」（訂好的出遊出發會停；10-24 線 15 wish82a 卡在這裡）
        kf = next((i for i, x in enumerate(o) if x['t'] == '快轉'), None)
        if kf is None: return o, False
        t0 = await pg.evaluate("GAME.G.day*24+GAME.G.hour")
        await tap_idx(pg, cdp, kf); await pg.wait_for_timeout(1500)
        o2 = await wait_choices(pg, cdp, 15, through_dlg=False); say('   %s 快轉：%s' % (label, [x['t'] for x in o2]))
        k2 = next((i for i, x in enumerate(o2) if x['t'].startswith('到下一個有事')), None)
        if k2 is None: return o2, False
        await tap_idx(pg, cdp, k2); await pg.wait_for_timeout(2000)
        ok, _ = await wait_for(pg, cdp, run, "GAME.G.day*24+GAME.G.hour>%f+0.5&&!GAME.E.player.busy" % t0, max_s=240, label=label)
        await pg.wait_for_timeout(4000)
        for _ in range(3): await drive(pg, cdp, run, max_s=40, label=label); await pg.wait_for_timeout(2500)
        return o2, ok
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



# ================================================================ 第 82 項：心願事件（wish3d.js；AA_426 起七位都演，hold 是空的）
S5 = {'fam': 45, 'trust': 30, 'comf': 30, 'npcRom': 35, 'rom': 10}   # DATE.stageNum 第 5 階：fam≥40、trust≥25、npcRom≥30（沒到第 6 階）
S4 = {'fam': 60, 'trust': 45, 'comf': 40}                              # 第 4 階（聊天提到的門檻 dateStage≥4；她主動約要第 5 階）
EVDONE = "(e=>{ const G=GAME.G; G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done[e]=G.events.done[e]||G.day-30; })"
# 每位：訊息那一天（她傳訊息的星期、時間照 wish3d.js S.msgDays／S.msgTime）、前置（企劃的條件：事件、旗標）
ASK = {
  'heroine_01': dict(key='2026-12-02', h=18.8, pre="", why='以安：週三 19:00～22:30 傳、約週六 13:30；條件 ev_an_admin_answer＝大二上行政法第 12 週上過（12/2 是第 13 週）'),
  'heroine_03': dict(key='2026-09-30', h=20.3, pre=EVDONE + "('ev_yt_thursday_free')", why='語彤：週三四五 20:30～23:00 傳、約週六日落前兩小時；條件 ev_yt_thursday_free（【前置】設成演過）'),
  'heroine_02': dict(key='2026-09-30', h=22.3, pre="", why='芷若：週三四 22:30～24:00 傳、約週六或週日 14:30（光典影展，固定活動 120 分）'),
  'heroine_04': dict(key='2026-09-30', h=20.8, pre="", why='子晴：沒寫訊息時間＝約的那天往前三天 21:00～22:30（週六→週三）、約 15:00'),
  'heroine_05': dict(key='2026-09-29', h=20.8, pre="GAME.G.flags.SIS_EXAM_DONE=true;", why='學姊：約週五 18:30＝週二 21:00～22:30 傳；條件 SIS_EXAM_DONE（【前置】設旗標）'),
  'classmate_peishan': dict(key='2026-11-12', h=20.8, pre="", why='沛珊：約週日 14:00＝週四 21:00～22:30 傳；11/15（日）她在臺北（單數週末回台中；10/1 那週她和柏翰交往中＝不約，Node 先驗過）'),
  'kexin': dict(key='2026-09-30', h=20.8, pre=EVDONE + "('ev_kexin_trip_spring_y1')", why='可昕：約週六 09:00（火車，外澳）＝週三 21:00～22:30 傳；條件 ev_kexin_trip_spring_y1（【前置】設成演過）'),
}
TRIP = {'heroine_02', 'heroine_03', 'heroine_01'}   # 這三位答應以後走完那一趟（芷若有固定活動、語彤是日落前兩小時、以安 13:30）
WINFO = """(id=>{ const G=GAME.G, ev=WISH.ev(id), I=ev&&ev.herInvite, A=DATE.log(G,id).wishAsk||null, o=A?{depart:A.depart}:{};
  const sp=L=>(L||[]).filter(l=>l&&l.who!=='note'&&l.who!=='narr').map(l=>WISH.fill(l.text,o));
  const base=I?((WISH.pickIf(G,id,I.linesIf)||I).lines):[];
  return {loc:ev&&ev.loc, name:ev&&DATE.loc(ev.loc)&&DATE.loc(ev.loc).name, ask:A, inv:sp(base), accept:sp(I&&I.accept), decline:sp(I&&I.decline),
    arrive:sp((ev.arrive||{}).lines), fixed:sp((ev.fixed||{}).lines), spots:Object.keys(ev.hotspots||{}).map(p=>ev.hotspots[p].name),
    known:WISH.known(G,id), done:WISH.done(G,id), stage:DATE.stageNum(id), here:WISH.here(G,id), willing:WISH.willing(G,id),
    cond:I?WISH.cond(G,id,I.if):null, mention:WISH.mentionDue(G,id)}; })"""
THREAD = """(id=>(GAME.G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>({from:m.from, text:m.text, ask:m.ask?m.ask.id:null, at:m.day!=null?CALENDAR.dateOf(m.day).key+' '+(+m.h||0).toFixed(2):''})))"""
PEND = """(id=>PHONE.pending(GAME.G).filter(m=>m.ask&&String(m.ask.id).indexOf('wish_ask_'+id+'_')===0).map(m=>({id:m.ask.id, opts:m.ask.opts.map(o=>o.t)})))"""


async def answer_ask(pg, cdp, who, want):
    """手機 → 訊息 → 她的對話串（p:id）→ 按 want 那個選項（照玩家點）"""
    pend = await pg.evaluate(PEND + "(%s)" % json.dumps(who))
    if not pend: return None, pend
    m = pend[0]; k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), None)
    if k is None: return None, pend
    await phone_tab(pg, cdp, 'msg')
    await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps('p:' + who))
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (m['id'], k)))
    await pg.wait_for_timeout(1200); await L.phone_away(pg, cdp); return got, pend


async def wish_drive(pg, cdp, cond, spots, max_s=900, label=''):
    """心願那一趟：互動點照順序挑沒灰掉、還沒去過的；沒有了就「差不多了，回去吧」；其他選單：出發、（今天先不說）、否則第一個。直到 cond 成立"""
    t0 = time.time(); used = []; ch = []
    while time.time() - t0 < max_s:
        if await pg.evaluate(cond): return True, ch, used
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            o = await opts(pg)
            if not o: await pg.wait_for_timeout(500); continue
            k = next((i for i, x in enumerate(o) if x['t'] in spots and x['t'] not in used and not x['dim']), None)
            if k is not None: used.append(o[k]['t'])
            if k is None and any(x['t'] in spots for x in o): k = next((i for i, x in enumerate(o) if x['t'].startswith(('差不多了', '就這樣回去'))), None)
            if k is None: k = next((i for i, x in enumerate(o) if x['t'].startswith(('出發', '（今天先不說）', '照樣跳過'))), 0)
            st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': [x['t'] + ('（灰）' if x['dim'] else '') for x in o], 'pick': o[k]['t']})
            say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [x['t'][:12] + ('（灰）' if x['dim'] else '') for x in o], o[k]['t'][:20]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1200)
    return False, ch, used


def has_all(log, lines):
    T = [x['t'] for x in log]; miss = [l for l in lines if not any(l in t for t in T)]; return not miss, miss


async def s_ask(p, run, base, sid, out):
    """她主動約（手機）：時間到傳訊息（逐字照 herInvite）→ 按「答應」→ 她回 accept → 訂好那天的約會（by her、wish）；TRIP 的三位接著走完"""
    who = sid.split('ASK_', 1)[1]; A = ASK[who]; res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, A['key'], A['h'], 'dorm', {who: S5}, label=sid + '（%s）' % A['why'])
    try:
        if A['pre']: await pg.evaluate("(()=>{ %s })()" % A['pre'])
        info0 = await pg.evaluate(WINFO + "(%s)" % json.dumps(who)); res['info0'] = info0; say('   %s 開始：%s' % (sid, json.dumps(info0, ensure_ascii=False)[:500]))
        NAMES[info0['loc']] = info0['name']
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, ch = await wait_for(pg, cdp, run, "(%s)(%s).length>0" % (PEND, json.dumps(who)), max_s=700, picks=['（今天先不說）'], label=sid)
        st = await pg.evaluate(STATE); info = await pg.evaluate(WINFO + "(%s)" % json.dumps(who)); th = await pg.evaluate(THREAD + "(%s)" % json.dumps(who)); res.update(info=info, thread=th, at=st)
        run.check('%s：%s 她傳訊息（手機 p:%s，要回）' % (sid, A['key'], who), ok, json.dumps({'at': st, 'ask': info.get('ask'), 'cond': info.get('cond'), 'stage': info.get('stage')}, ensure_ascii=False))
        if not ok: raise RuntimeError('沒有收到她的訊息')
        got_lines = [m['text'] for m in th]
        run.check('%s：訊息逐字照 herInvite（{出發時間}換成 %s）' % (sid, info['ask'] and info['ask'].get('depart')), all(l in got_lines for l in info['inv']), json.dumps({'want': info['inv'], 'got': got_lines}, ensure_ascii=False)[:600])
        pend = await pg.evaluate(PEND + "(%s)" % json.dumps(who))
        run.check('%s：選項「答應」「這週不行」' % sid, bool(pend) and pend[0]['opts'] == ['答應', '這週不行'], json.dumps(pend, ensure_ascii=False))
        run.check('%s：收到就算知道心願（wishKnown）' % sid, info['known'] is True, json.dumps(info['known']))
        await run.shot(pg, '%s_msg' % sid)
        got, _ = await answer_ask(pg, cdp, who, '答應'); res['answered'] = got
        ok2, ch2 = await wait_for(pg, cdp, run, "(()=>{ const A=DATE.log(GAME.G,%s).wishAsk; return !!A&&A.state!=='sent'; })()" % json.dumps(who), max_s=300, picks=['（今天先不說）'], label=sid)
        info2 = await pg.evaluate(WINFO + "(%s)" % json.dumps(who)); th2 = await pg.evaluate(THREAD + "(%s)" % json.dumps(who)); T = await pg.evaluate(TRIPS); res.update(info2=info2, thread2=th2, trips=T)
        got2 = [m['text'] for m in th2]
        run.check('%s：手機按「答應」→ 她回的那句逐字照 accept' % sid, bool(got) and all(l in got2 for l in info2['accept']), json.dumps({'want': info2['accept'], 'got': got2[-4:]}, ensure_ascii=False)[:500])
        A2 = info2['ask'] or {}; trip = next((t for t in T if t['trip'] == A2.get('trip')), None)
        exp_d = await pg.evaluate("CALENDAR.dateOf(%d).key" % A2['date']) if A2.get('date') is not None else None
        run.check('%s：訂好那天的約會（wishAsk booked、行程 %s %s 出發、地點 %s）' % (sid, exp_d, A2.get('depart'), info0['loc']), ok2 and A2.get('state') == 'booked' and bool(trip) and trip['status'] == 'booked' and trip['locs'] == [info0['loc']] and trip['d'] == exp_d, json.dumps({'ask': A2, 'trip': trip}, ensure_ascii=False)[:500])
        if who in TRIP and trip:
            # [捷徑] 中間這幾天不是這一項要測的（10-24 線 16：睡覺醒來劇情自己帶去上課、人在教室回不了床，連兩次卡在這裡）：
            # 日子撥到約會那天、出發前 1 小時，人在宿舍（同 zrlast 的 'jump'；遊戲自己的日子換算，不改行程、不改旗標）
            k = await pg.evaluate("(([d,h])=>{ const G=GAME.G; G.day=d; G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); return CALENDAR.dateOf(d).key; })(%s)" % json.dumps([A2['date'], max(8.0, A2['depart'] - 1.0)]))
            run.setup('[捷徑] %s：日子撥到 %s %.2f（約會那天、出發前 1 小時；中間的日子不在這一項）' % (sid, k, max(8.0, A2['depart'] - 1.0)))
            await pg.wait_for_timeout(2500)
            if (await pg.evaluate(STATE))['zone'] != 'dorm': await quick_go(pg, cdp, 'dorm')
            for _ in range(2): await drive(pg, cdp, run, max_s=40, label=sid); await pg.wait_for_timeout(2000)
            st = await pg.evaluate(STATE); res['dayof'] = st
            run.check('%s：睡到約會那天（%s）' % (sid, exp_d), st['key'] == exp_d, json.dumps(st, ensure_ascii=False))
            if st['h'] < A2['depart'] - 1.5: await skip(pg, cdp, '等到傍晚' if A2['depart'] >= 15 else '等到下午', sid)
            n0 = len(await pg.evaluate("window.__LOG||[]"))
            done_js = "(()=>{ const t=(GAME.G.trips||[]).find(x=>x.trip===%s); return !!t&&['done','cancelled','missed'].includes(t.status)&&!GAME.E.player.busy&&!(GAME.D&&GAME.D.active)&&document.getElementById('choices').classList.contains('hide'); })()" % json.dumps(trip['trip'])
            ok3, ch3, used = await wish_drive(pg, cdp, done_js, info0['spots'], max_s=1200, label=sid); res['ch3'] = ch3; res['used'] = used
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log; T3 = await pg.evaluate(TRIPS); info3 = await pg.evaluate(WINFO + "(%s)" % json.dumps(who)); res['info3'] = info3
            t3 = next((t for t in T3 if t['trip'] == trip['trip']), None)
            run.check('%s：那一趟走完（行程 done、心願完成 WISH_DONE／dateLog.wish）' % sid, ok3 and bool(t3) and t3['status'] == 'done' and info3['done'], json.dumps({'trip': t3, 'done': info3['done'], 'spots': used}, ensure_ascii=False)[:400])
            a_ok, a_miss = has_all(log, info0['arrive'])
            run.check('%s：抵達的句子逐字（arrive）' % sid, a_ok, json.dumps({'miss': a_miss}, ensure_ascii=False)[:400])
            if info0['fixed']:
                f_ok, f_miss = has_all(log, info0['fixed'])
                run.check('%s：固定活動的句子逐字（fixed）' % sid, f_ok, json.dumps({'miss': f_miss}, ensure_ascii=False)[:400])
            run.check('%s：互動點選了至少一個（選單上是心願的四個）' % sid, len(used) >= 1, json.dumps(ch3[:6], ensure_ascii=False)[:500])
            await run.shot(pg, '%s_back' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# 不該約的時候：考試週、已經完成、寒假（S.askRule）
NOASK = {
  'NOASK_EXAM_AN': ('heroine_01', '2026-12-23', 18.8, '', '以安：12/23（三，第 16 週）傳的話約的是 12/26（六）＝期末考週，notExamWeek（行政法第 12 週已上過＝條件成立；對照：12/16 會傳，Node 驗過）'),
  'NOASK_PARTNER_PS': ('classmate_peishan', '2026-10-01', 20.8, '', '沛珊：10/1 她和柏翰交往中（DATE.canAskCore：她現在有交往的對象）'),
  'NOASK_TAICHUNG_PS': ('classmate_peishan', '2026-11-19', 20.8, '', '沛珊：約的那天 11/22（日）她回台中（WISH.here 那一天）'),
  'NOASK_DONE_ZQ': ('heroine_04', '2026-09-30', 20.8, "GAME.G.flags.WISH_DONE_heroine_04=true;", '子晴：心願已經完成（WISH_DONE_heroine_04）'),
  'NOASK_VAC_ZQ': ('heroine_04', '2027-02-03', 20.8, '', '子晴：寒假（2027-02-03，沒有學期）'),
}


async def s_noask(p, run, base, sid, out):
    who, key, h, pre, why = NOASK[sid]; res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, key, h, 'dorm', {who: S5}, label=sid + '（%s）' % why)
    try:
        if pre: await pg.evaluate("(()=>{ %s })()" % pre)
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, ch = await wait_for(pg, cdp, run, "(%s)(%s).length>0||GAME.G.hour>=%.2f" % (PEND, json.dumps(who), min(h + 2.0, 23.9)), max_s=900, picks=['（今天先不說）'], label=sid)
        pend = await pg.evaluate(PEND + "(%s)" % json.dumps(who)); st = await pg.evaluate(STATE); info = await pg.evaluate(WINFO + "(%s)" % json.dumps(who)); res.update(pend=pend, at=st, info=info)
        run.check('%s：到 %.2f 都沒有她的心願訊息' % (sid, st['h']), not pend and st['h'] >= min(h + 2.0, 23.9) - 0.05, json.dumps({'pend': pend, 'at': st, 'ask': info.get('ask')}, ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# 玩家自己約她去心願地點：她回 playerInvite 的 unknown（還不知道）／known（聊天提過、她傳過訊息）
PINV = {
  'PINV_UNKNOWN_AN': ('heroine_01', '2026-09-30', 20.0, ''),
  'PINV_KNOWN_ZQ': ('heroine_04', '2026-09-30', 20.0, "DATE.knowWish(GAME.G,'heroine_04');"),
  'PINV_UNKNOWN_PS': ('classmate_peishan', '2026-11-12', 20.0, ''),
}


async def s_pinv(p, run, base, sid, out):
    who, key, h, pre = PINV[sid]; res = out.setdefault(sid, {}); known = 'KNOWN_' in sid and 'UNKNOWN' not in sid
    b, pg, cdp, errs, r = await launch(p, run, base, key, h, 'dorm', {who: S5}, label=sid + '（%s）' % ('已經知道心願：【前置】DATE.knowWish' if known else '還不知道心願'))
    try:
        if pre: await pg.evaluate("(()=>{ %s })()" % pre)
        info0 = await pg.evaluate(WINFO + "(%s)" % json.dumps(who)); NAMES[info0['loc']] = info0['name']
        want = await pg.evaluate("(([id,k])=>{ const P=WISH.ev(id).playerInvite; return (P[k]||[]).filter(l=>l&&l.who!=='note'&&l.who!=='narr').map(l=>WISH.fill(l.text)); })(%s)" % json.dumps([who, 'known' if known else 'unknown']))
        await drive(pg, cdp, run, max_s=30, label=sid)
        rr = await date_to_when(pg, cdp, who, info0['loc'], label=sid); res['menu'] = rr
        run.check('%s：手機約她 → 去校外… → 清單有「%s」' % (sid, info0['name']), bool(rr.get('ok')), json.dumps(rr, ensure_ascii=False)[:400])
        if not rr.get('ok'): raise RuntimeError('沒走到日期選單')
        o = await wait_choices(pg, cdp); k = next((i for i, x in enumerate(o) if not x['dim'] and ('週六' in x['t'] or '週日' in x['t'] or '明天' in x['t'])), next((i for i, x in enumerate(o) if not x['dim']), 0))
        say('   %s 日期 %s → %s' % (sid, [x['t'] for x in o], o[k]['t'] if o else None)); await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200)
        o = await wait_choices(pg, cdp); k = next((i for i, x in enumerate(o) if not x['dim']), 0)
        say('   %s 時間 %s → %s' % (sid, [x['t'] + ('（灰）' if x['dim'] else '') for x in o], o[k]['t'] if o else None)); await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500)
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        sm = await wait_dlg(pg, '預計花費', 20)
        if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
        got, o = await pick(pg, cdp, '就這樣約', sid)
        await close_flow(pg, cdp, sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log; T = await pg.evaluate(TRIPS); res['trips'] = T
        ok, miss = has_all(log, want)
        run.check('%s：她回的話逐字照 playerInvite.%s' % (sid, 'known' if known else 'unknown'), bool(got) and ok, json.dumps({'want': want, 'miss': miss, 'log': [x['t'] for x in log][-6:]}, ensure_ascii=False)[:600])
        run.check('%s：約好了（行程 booked、地點 %s）' % (sid, info0['loc']), any(t['locs'] == [info0['loc']] and t['status'] == 'booked' for t in T), json.dumps(T, ensure_ascii=False)[:300])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ================================================================ 第 83 項①：多線交往——第一次正式校外約會的問句（multirel3d.js S.dateOpen／AA_422 0-1）
#   她知道祐廷正在和 y 交往（ROM.learn）、她還沒和祐廷交往：第一次正式校外約會的抵達句之後、第一個互動點之前問一次；記 <X>_ASKED_GF；選項 yt 交給 ROM.ytAnswer（YT_HONEST／YT_DODGED）
MR = {'MR83_ASK_YT': ('heroine_03', 'heroine_01', 'D10'), 'MR83_ASK_AN': ('heroine_01', 'heroine_03', 'D10')}
MRINFO = """(([x,y])=>{ const G=GAME.G, F=G.flags||{}; let ko=null; try{ ko=MREL.knownOthers(G,x); }catch(e){ ko='ERR '+e.message; }
  const L=typeof MULTIREL_LINES!=='undefined'?MULTIREL_LINES:null, A=L&&L.ASK&&L.ASK[x]; const head=[]; if(Array.isArray(A)) for(const it of A){ if(typeof it==='string') head.push(it); else if(it&&it.choice) break; else if(it&&it.c) break; }
  return {askFlag:MREL.ASK_FLAG[x], asked:F[MREL.ASK_FLAG[x]]!=null?F[MREL.ASK_FLAG[x]]:null, knownOthers:ko, due:MREL.askDue(G,x), honest:(F.YT_HONEST||null), dodged:(F.YT_DODGED||null), head:head, dating:!!F['dating_'+y]}; })"""


async def s_mrask(p, run, base, sid, out):
    x, y, loc = MR[sid]; res = out.setdefault(sid, {})
    S6 = {'fam': 60, 'trust': 45, 'comf': 40, 'npcRom': 55, 'rom': 30}
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-09-30', 20.0, 'dorm', {x: S5, y: S6}, label=sid + '（和 %s 交往中【前置：ROM.start】、%s 知道【前置：ROM.learn】）' % (y, x))
    try:
        rr = await pg.evaluate("(([x,y])=>{ const G=GAME.G; const ok=ROM.start(G,y); ROM.learn(G,x,y,'test'); return {start:ok, knows:ROM.knows(G,x)}; })(%s)" % json.dumps([x, y]))
        run.setup('[前置] %s：ROM.start(%s)＝%s、ROM.learn(%s 知道 %s)→ %s' % (sid, y, rr.get('start'), x, y, json.dumps(rr.get('knows'), ensure_ascii=False)))
        i0 = await pg.evaluate(MRINFO + "(%s)" % json.dumps([x, y])); res['i0'] = i0; say('   %s 開始：%s' % (sid, json.dumps(i0, ensure_ascii=False)[:400]))
        run.check('%s：開始時 askDue（她知道、還沒問過、沒在和祐廷交往）' % sid, i0['due'] is True, json.dumps(i0, ensure_ascii=False)[:300])
        NAMES[loc] = await pg.evaluate("DATE.loc(%s).name" % json.dumps(loc))
        await drive(pg, cdp, run, max_s=30, label=sid)
        rr = await date_to_when(pg, cdp, x, loc, label=sid); res['menu'] = rr
        if not rr.get('ok'): run.check('%s：手機約她去 %s' % (sid, NAMES[loc]), False, json.dumps(rr, ensure_ascii=False)[:400]); raise RuntimeError('沒約到')
        o = await wait_choices(pg, cdp); k = next((i for i, q in enumerate(o) if not q['dim'] and ('週六' in q['t'] or '（六）' in q['t'])), next((i for i, q in enumerate(o) if not q['dim']), 0))   # BB-B 14:3x：日期選單寫「10/3（六）」，不是「週六」
        await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200)
        o = await wait_choices(pg, cdp); k = next((i for i, q in enumerate(o) if not q['dim']), 0); await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500)
        sm = await wait_dlg(pg, '預計花費', 20)
        if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
        await pick(pg, cdp, '就這樣約', sid); await close_flow(pg, cdp, sid)
        T = await pg.evaluate(TRIPS); trip = next((t for t in T if t['locs'] == [loc] and t['status'] == 'booked'), None); res['trip'] = trip
        run.check('%s：約好 %s（%s）' % (sid, NAMES[loc], trip and trip['d']), bool(trip), json.dumps(T, ensure_ascii=False)[:300])
        if not trip: raise RuntimeError('沒有行程')
        if (await pg.evaluate(STATE))['key'] < trip['d']:   # [捷徑] 同上：日子撥到約會那天、出發前 1 小時（中間的日子不在這一項）
            tday = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(trip['d'])); th = max(8.0, trip['depart'] - 1.0)
            k = await pg.evaluate("(([d,h])=>{ const G=GAME.G; G.day=d; G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); return CALENDAR.dateOf(d).key; })(%s)" % json.dumps([tday, th]))
            run.setup('[捷徑] %s：日子撥到 %s %.2f（約會那天、出發前 1 小時）' % (sid, k, th)); await pg.wait_for_timeout(2500)
            if (await pg.evaluate(STATE))['zone'] != 'dorm': await quick_go(pg, cdp, 'dorm')
            for _ in range(2): await drive(pg, cdp, run, max_s=40, label=sid); await pg.wait_for_timeout(2000)
        st = await pg.evaluate(STATE)
        if st['h'] < trip['depart'] - 1.5: await skip(pg, cdp, '等到傍晚' if trip['depart'] >= 15 else '等到下午', sid)
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        done_js = "(()=>{ const t=(GAME.G.trips||[]).find(q=>q.trip===%s); return !!t&&['done','cancelled','missed'].includes(t.status)&&!GAME.E.player.busy&&!(GAME.D&&GAME.D.active)&&document.getElementById('choices').classList.contains('hide'); })()" % json.dumps(trip['trip'])
        spots = await pg.evaluate("DATE.points?Object.keys(DATE.points(%s)||{}).map(k=>(DATE.points(%s)[k]||{}).name).filter(Boolean):[]" % (json.dumps(loc), json.dumps(loc)))
        ok3, ch3, used = await wish_drive(pg, cdp, done_js, spots, max_s=1200, label=sid); res['ch3'] = ch3
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log; i1 = await pg.evaluate(MRINFO + "(%s)" % json.dumps([x, y])); res['i1'] = i1
        run.check('%s：問過（%s 記那一天）、行程走完' % (sid, i1['askFlag']), ok3 and i1['asked'] is not None, json.dumps({'i1': i1, 'used': used}, ensure_ascii=False)[:400])
        head_ok = all(any((h.split('{')[0] or h.split('}')[-1]) in q['t'] for q in log) for h in i1['head'][:2]) if i1['head'] else False
        run.check('%s：問句的開頭照 MREL_LINES.ASK（前兩句）' % sid, head_ok, json.dumps({'head': i1['head'][:3], 'log': [q['t'] for q in log][:12]}, ensure_ascii=False)[:600])
        ask_menu = next((c for c in ch3 if not any(sx in c['opts'] for sx in spots) and not c['pick'].startswith('出發')), None); res['ask_menu'] = ask_menu
        run.check('%s：問句的選項（記下來對清單「只列誠實的」；程式的資料有 dodge 選項）' % sid, bool(ask_menu), json.dumps(ask_menu, ensure_ascii=False)[:300])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ORDER = ['ASK_' + k for k in ASK] + list(NOASK) + list(PINV) + list(MR)
FN = dict([('ASK_' + k, s_ask) for k in ASK] + [(k, s_noask) for k in NOASK] + [(k, s_pinv) for k in PINV] + [(k, s_mrask) for k in MR])


async def main():
    run = L.Run('wish82', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'wish82.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
