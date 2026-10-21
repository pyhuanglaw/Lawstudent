"""BB（帳號 A）2026-10-21：LAWWW 21:54 排後面的兩項（開發分支 2469df7f）。
① BUG-INTERMS-PARTNER-1021：沛珊（classmate_peishan）大二上第 7 週起分手、兩人都單身、好感夠高（第 5 階「有點在意」）→ 手機聊天是 L 層。
   照玩家：手機 →「人」→ 沛珊 →「傳訊息」→「分享」→「吃的」。L 層回「下次換我帶你去吃早餐。我家的。」；R 層回「你吃這個喔。要吃青菜啦。」。
   PS7＝大二上第 8 週（分手後，應該 L）；PS3＝大二上第 3 週（還在交往，對照：R）；PS0＝大一下第 3 週（4/6 以前還沒交往，AA_373 #3：應該 L）。
② AA_376 #2：大三上每週二刑訴照課表系統上，不再另外演 v7 舊課堂「上週我們談了刑事訴訟的目的……」、小考「這兩題會出現在期中。」——第 2、3 週週二照玩家去上課、坐下、上完。
【前置】讀使用者 9/25 存檔改日期、關係（fam 60／trust 45／comf 40／rom 35／npcRom 35）、通訊錄；[捷徑] 刑訴第 3 週用同一個頁面跳日期。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 interms_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>（SCEN=PS7,PS3,PS0,CRIM）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', 'PS7,PS3,PS0,CRIM').split(',')
bad = []; out = {}
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+G.hour.toFixed(2), zone:G.zone}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'', t:String(t||''), d:CALENDAR.dateOf(GAME.G.day).key, h:+GAME.G.hour.toFixed(2)}); }catch(e){} return o.apply(this,arguments); };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||'', t:String(t||''), d:CALENDAR.dateOf(GAME.G.day).key, h:+GAME.G.hour.toFixed(2)}); }catch(e){} return s0.apply(this,arguments); }; })()"""
FOOD_L, FOOD_R = '下次換我帶你去吃早餐。我家的。', '你吃這個喔。要吃青菜啦。'


async def drain(pg, cdp, pref, secs=240):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().includes(t)); if(e) break; } e=e||bs[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })(%s)" % json.dumps(pref))
            await L.touch_tap(cdp, c[0], c[1]); say('   ▶', c[2]); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(900); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False


async def load(p, base, key, h, zone, js):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("(k=>{ if(k.startsWith('TERMDAY:')){ const [_,t,w,wd]=k.split(':'); return STORY.termDay(t,+w,+wd); } return STORY.dayOfKey(k); })(%s)" % json.dumps(key))
    fl = {}
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: fl[k] = dd
    G['flags'].update(fl); G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    if js: await pg.evaluate("(()=>{ const G=GAME.G, LV=(id,f,t,c,r,nr)=>{ const R=SOCIAL.rel(id); R.fam=f; R.trust=t; R.comf=c; if(r!=null) R.rom=r; if(nr!=null) R.npcRom=nr; SOCIAL.remember(id,'FIRST_MET',''); }; %s })()" % js)
    return b, pg, cdp, errs, await pg.evaluate(SNAP)


async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def share_food(pg, cdp, pid):
    """照玩家：手機 →「人」→ 那個人的「訊息」→「傳訊息」→「分享」→「吃的」"""
    await L.phone_away(pg, cdp)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"friends\"]')")
    if not await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-msg]')].find(b=>b.dataset.msg===%s)" % json.dumps(pid)): return 'no data-msg'
    if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgto=%s]')" % json.dumps(pid)):
        return 'no 傳訊息：' + await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\n/g,'｜').slice(0,200)")
    tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>b.dataset.msgt+'='+b.textContent.trim())")
    if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgt=%s]')" % json.dumps(pid + '|share')): return 'no share：%s' % tops
    subs = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>b.dataset.msgt+'='+b.textContent.trim())")
    k = next((x.split('=')[0] for x in subs if x.split('=')[0].startswith(pid + '|share|') and ('吃' in x or 'food' in x)), None)
    if not k: return 'no food：%s' % subs
    n0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgt=%s]')" % json.dumps(k))
    await L.close_panels(pg, cdp); return n0


async def ps(p, base, sid, key, want, nope):
    js = "LV('classmate_peishan',60,45,40,35,35); INV.addContact(G,'classmate_peishan'); for(const k in G.flags) if(k.indexOf('dating_')===0) G.flags[k]=false;"
    b, pg, cdp, errs, sn = await load(p, base, key, 15.0, 'campus', js)
    say('== %s：%s %.2f（[前置] 沛珊 fam60/trust45/comf40/rom35/npcRom35、通訊錄、沒有交往）' % (sid, sn['key'], sn['h']))
    info = await pg.evaluate("(()=>({tier:MSG.tier(GAME.G,'classmate_peishan'), stage:SOCIAL.stage('classmate_peishan'), partner:STORY.partnerOn(GAME.G,CHARACTERS.classmate_peishan.partner), term:(CALENDAR.termOf(GAME.G.day)||{}).id+' W'+(CALENDAR.termOf(GAME.G.day)||{}).week}))()")
    say('   遊戲裡：%s' % json.dumps(info, ensure_ascii=False))
    n0 = await share_food(pg, cdp, 'classmate_peishan')
    if not isinstance(n0, int): bad.append('%s：手機分享走不通（%s）' % (sid, n0)); say('   ⚠', n0); rep = []
    else:
        t0 = time.time(); rep = []
        while time.time() - t0 < 120:
            rep = await pg.evaluate("(n0=>(GAME.G.msgs||[]).slice(n0).filter(m=>PHONE.th(m)==='p:classmate_peishan'&&(m.from||m.who)==='classmate_peishan').map(m=>m.text))(%d)" % n0)
            if rep: break
            await drain(pg, cdp, ['不', '晚一點'], secs=5); await pg.wait_for_timeout(1500)
    await run.shot(pg, sid + '_reply')
    say('   沛珊回：%s' % json.dumps(rep, ensure_ascii=False))
    ok = any(want in t for t in rep) and not any(nope in t for t in rep)
    run.check('%s %s：分享吃的，沛珊回「%s」（不是「%s」）' % (sid, sn['key'], want, nope), ok, json.dumps({'rep': rep, 'info': info}, ensure_ascii=False))
    if not ok: bad.append('%s：%s' % (sid, json.dumps(rep, ensure_ascii=False)))
    out[sid] = {'info': info, 'rep': rep, 'errs': errs[:3]}
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


OLD = ['上週我們談了刑事訴訟的目的', '這兩題會出現在期中']


async def crim(p, base):
    b, pg, cdp, errs, sn = await load(p, base, 'TERMDAY:Y3S1:2:2', 8.5, 'dorm', '')
    say('== CRIM：%s %.2f（[前置] 大三上第 2 週週二 08:30 宿舍）' % (sn['key'], sn['h']))
    res = []
    for wk in (2, 3):
        if wk == 3:
            k = await pg.evaluate("CALENDAR.dateOf(STORY.termDay('Y3S1',3,2)).key")
            await pg.evaluate("(k=>{ const G=GAME.G; G.day=STORY.dayOfKey(k); G.hour=8.5; G.weekday=CALENDAR.dateOf(G.day).wd%%7; GAME.E.hour=8.5; })(%s)" % json.dumps(k))
            say('   [捷徑] 跳到 %s 08:30（同一個頁面）' % k); await pg.wait_for_timeout(3000)
        items = await pg.evaluate("(()=>CLS.dayItems(GAME.G).map(x=>({c:x.c&&x.c.name, t0:+x.t0.toFixed(2), zone:x.room&&x.room.zone})))()")
        say('   第 %d 週週二的課：%s' % (wk, json.dumps(items, ensure_ascii=False)))
        await pg.evaluate("window.__LOG=[]")
        t0 = time.time()
        while time.time() - t0 < 900:
            sn = await pg.evaluate(SNAP)
            if sn['h'] >= 12.4: break
            s = await L.state(pg)
            if s['dlg'] or s['choices'] or s['busy']: await drain(pg, cdp, ['直接去上課：刑事訴訟法', '直接去上課', '還是去', '坐中間的位子', '老位子', '坐'], secs=300); continue
            if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
            await pg.wait_for_timeout(2000)
        lines = await pg.evaluate("(window.__LOG||[]).map(x=>x.h+' '+(x.n?x.n+'：':'')+x.t)")
        done = await pg.evaluate("(()=>{ const r=CLS.rec(GAME.G).done||{}; return Object.keys(r).filter(k=>r[k]&&/crim|刑訴|刑事訴訟/.test(k+JSON.stringify(r[k]))).slice(0,5); })()")
        hit = [l for l in lines if any(o in l for o in OLD)]
        await run.shot(pg, 'crim_w%d_end' % wk)
        say('   第 %d 週：台詞 %d 句，舊課堂的句子 %s；上課紀錄 %s；前 6 句 %s' % (wk, len(lines), json.dumps(hit, ensure_ascii=False), done, json.dumps(lines[:6], ensure_ascii=False)))
        res.append({'wk': wk, 'n': len(lines), 'hit': hit, 'done': done, 'lines': lines[:80]})
        run.check('CRIM 第 %d 週週二：刑訴照課表上（有台詞），沒有「上週我們談了刑事訴訟的目的」「這兩題會出現在期中」' % wk, not hit and len(lines) > 0, json.dumps({'hit': hit, 'n': len(lines)}, ensure_ascii=False))
        if hit: bad.append('CRIM 第 %d 週：%s' % (wk, hit))
    out['CRIM'] = {'res': res, 'errs': errs[:3]}
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def main():
    global run
    run = L.Run('interms', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        if 'PS7' in SCEN: await ps(p, base, 'PS7', 'TERMDAY:Y2S1:8:3', FOOD_L, FOOD_R)
        if 'PS3' in SCEN: await ps(p, base, 'PS3', 'TERMDAY:Y2S1:3:3', FOOD_R, FOOD_L)
        if 'PS0' in SCEN: await ps(p, base, 'PS0', 'TERMDAY:Y1S2:3:3', FOOD_L, FOOD_R)
        if 'CRIM' in SCEN: await crim(p, base)
        json.dump({'out': out, 'bad': bad}, open(os.path.join(OUT, 'interms.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
