"""BB：寒暑假快轉（BB_HOLFF_ROOMS_1021 第一節；AA_340 第 6 節）。
[前置] 使用者 9/25 存檔改到每個假期的成績公布日 08:30、宿舍；麵店團、認識麵店團的人、以安 FAMILIAR；沒在交往、沒報名活動；大三、大四台灣路線，大四 Y4_PATH=bar。
照玩家：宿舍的床（在家是家裡的選單）→「快轉」→「到下一個有事的日子」一直按；手機跳出來（關閉鍵寫「跳過」）就按跳過；中間的劇情對話點過去、選項選第一個。
每一站記：日期時間、在哪（宿舍／臺北的家）、旁白／對話、手機有沒有自己打開（2026-10-22 起：每一張日期卡 GAME.titleCard 都記一站——按「跳過」以後同一次快轉接著跳到的站原本記不到；手機跳出來記待回覆的 id、tag＋截圖）。Playwright 手機橫向模擬、?turbo，不是 iPhone。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
BRK = os.environ.get('BRK', 'Y1W,Y1S,Y2W,Y2S,Y3W,Y3S,Y4W').split(',')
TERM = {'Y1W': 'Y1S1', 'Y1S': 'Y1S2', 'Y2W': 'Y2S1', 'Y2S': 'Y2S2', 'Y3W': 'Y3S1', 'Y3S': 'Y3S2', 'Y4W': 'Y4S1'}
bad = []; rep = []
def say(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); rep.append(s)
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, h:+G.hour.toFixed(2), zone:G.zone, home:!!(G.home&&G.home.at), term:(CALENDAR.termOf(G.day)||{}).id||null, hud:(document.getElementById('clockT')||{}).textContent||'', busy:!!GAME.E.player.busy, depth:(GAME.D&&GAME.D.busyDepth)||0}; })()"""
HOOK = """(()=>{ if(window.__SH) return; window.__SH=1; window.__LOG=[]; window.__CARDS=[]; const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push(((w&&w.name)?w.name+'：':'')+String(t)); }catch(e){} return s0.apply(this,arguments); };
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(){ try{ const G=GAME.G, d=CALENDAR.dateOf(G.day); window.__CARDS.push({at:d.key+' '+(+G.hour).toFixed(2), where:(G.home&&G.home.at)?'臺北的家':G.zone, card:[...arguments].filter(x=>typeof x==='string').join('｜'), lines:window.__LOG.length}); }catch(e){} return t0.apply(this,arguments); }; } })()"""
PEND = """(()=>{ try{ return PHONE.pending(GAME.G).map(m=>({th:m.th||'', tag:m.tag||null, ask:(m.ask&&m.ask.id)||null, t:String(m.text||'').slice(0,26), d:CALENDAR.dateOf(m.day).key})); }catch(e){ return 'ERR '+e; } })()"""
CARDS = "(()=>(window.__CARDS||[]).splice(0))()"
async def phone_state(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); const open=!!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; const b=document.getElementById('btnPhoneClose'); return {open, btn:b?b.textContent:''}; })()")
async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
async def tap_choice(pg, cdp, start):
    c = await pg.evaluate("(w=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim().startsWith(w)); if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(start))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); return True
async def step(pg, cdp, run, stops, tag):
    """處理畫面上的東西到可以再按快轉為止；回傳 'ff' 已經按了快轉、'idle' 沒有選單要去按床"""
    t0 = time.time()
    while time.time() - t0 < 240:
        ph = await phone_state(pg)
        if ph['open']:
            sn = await pg.evaluate(SNAP); stops.append({'at': sn['key'] + ' %.2f' % sn['h'], 'what': '手機自己打開（關閉鍵「%s」）' % ph['btn']})
            pend = await pg.evaluate(PEND); stops[-1]['pending'] = pend; await run.shot(pg, '%s_phone_%s_%02d' % (tag, sn['key'], int(sn['h'])))
            say('   📱 %s %.2f 手機自己打開，關閉鍵「%s」；待回覆 %s' % (sn['key'], sn['h'], ph['btn'], json.dumps(pend, ensure_ascii=False)[:400]))
            await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(1500); continue
        s = await L.state(pg)
        if s['choices']:
            cs = await choices(pg)
            if any(c.startswith('到下一個有事的日子') for c in cs):
                await tap_choice(pg, cdp, '到下一個有事的日子'); return 'ff'
            if any(c.startswith('快轉') for c in cs):
                await tap_choice(pg, cdp, '快轉'); continue
            sn = await pg.evaluate(SNAP); stops.append({'at': sn['key'] + ' %.2f' % sn['h'], 'what': '選項：' + ' / '.join(x[:16] for x in cs)})
            say('   ▶ %s %.2f 選項 %s → 選睡到明天早上／傍晚／第一個' % (sn['key'], sn['h'], [x[:18] for x in cs]))
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(b=>b.textContent.trim().startsWith('睡到明天早上'))||bs.find(b=>b.textContent.trim().startsWith('睡到傍晚'))||bs.find(b=>b.textContent.trim().startsWith('睡覺'))||bs.find(b=>!/存檔/.test(b.textContent))||bs[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['busy']: await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(1200); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']) and not (await phone_state(pg))['open']: return 'idle'
    return 'timeout'
async def press_bed(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(600)
    if not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'): return False
    for k in range(4):
        await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(600)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        st = await L.state(pg)
        if st['choices'] or st['dlg'] or st['busy']: return True   # 除夕 17:00 以後按床＝直接回家吃年夜飯（5c637033），不出床的選單
    return False
async def main():
    run = L.Run('holff', OUT); base = json.load(open(SAVE, encoding='utf-8')); allres = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        for bk in BRK:
            say('== %s' % bk); stops = []; allres[bk] = stops
            gd = await pg.evaluate("CALENDAR.gradeDay(%s)" % json.dumps(TERM[bk]))
            st = json.loads(json.dumps(base)); G = st.get('G', st)
            G.update({'day': gd, 'hour': 8.5, 'zone': 'dorm', 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % gd)})
            F = G['flags']
            for k, key in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
                dd = await pg.evaluate("STORY.dayOfKey('%s')" % key)
                if dd <= gd: F[k] = dd
            if 'ROOM_Y4' in F: F.update({'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None})
            F.update({'dating_kexin': False})
            if bk[:2] in ('Y3', 'Y4'): F['EXCHANGE_ROUTE'] = 'TW'
            if bk == 'Y4W': F['Y4_PATH'] = 'bar'
            G.pop('home', None)
            await L.load_state(pg, G); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK); await pg.evaluate("window.__LOG=[]")
            await pg.evaluate("(()=>{ const G=GAME.G; PHONE.join(G,'noodle_team','麵店團'); const LV=(id,f,t,c)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); }; for(const id of ['zhe','yu','heroine_03','classmate_bohan','classmate_xinci']) LV(id,45,30,10); LV('heroine_01',25,10,10); if(G.flags.romance) for(const k in G.flags.romance){ if(G.flags.romance[k]&&G.flags.romance[k].status==='dating') G.flags.romance[k].status='none'; } })()")
            sn = await pg.evaluate(SNAP); run.setup('[前置] %s：成績公布日 %s 08:30 宿舍（麵店團、以安 FAMILIAR、沒交往%s）' % (bk, sn['key'], '、台灣路線' if bk[:2] in ('Y3', 'Y4') else ''))
            say('   開始：%s' % json.dumps(sn, ensure_ascii=False))
            for i in range(40):
                r = await step(pg, cdp, run, stops, bk)
                sn = await pg.evaluate(SNAP)
                if sn['term'] or (i > 0 and sn['term'] is None and False): pass
                if sn['term']:
                    say('   開學了：%s' % json.dumps(sn, ensure_ascii=False)); break
                for c in await pg.evaluate(CARDS):
                    stops.append({'at': c['at'], 'what': '日期卡（%s）' % c['where'], 'card': c['card']}); say('   🗓 日期卡 %s %s：%s' % (c['at'], c['where'], c['card'][:80]))
                if r == 'ff':
                    await pg.wait_for_timeout(2500); sn2 = await pg.evaluate(SNAP); lg = await pg.evaluate("window.__LOG.splice(0)")
                    stops.append({'at': sn2['key'] + ' %.2f' % sn2['h'], 'what': ('家' if sn2['home'] else sn2['zone']), 'lines': lg[:6]})
                    say('   ⏩ 停在 %s %.2f %s｜右上角「%s」｜台詞 %s' % (sn2['key'], sn2['h'], '臺北的家' if sn2['home'] else sn2['zone'], sn2['hud'], json.dumps(lg[:4], ensure_ascii=False)))
                    if i % 4 == 0: await run.shot(pg, '%s_%02d' % (bk, i))
                    await pg.wait_for_timeout(int(os.environ.get('TICKWAIT', '40000')))   # 等 S.tick 跑一次（實機約 0.5 秒；SwiftShader 約 35 秒），停點上該演的（例：除夕 17:00 回家）才有機會演
                    continue
                if r == 'idle':
                    if sn['home']:
                        say('   ⚠ 在家但沒有選單（%s）' % json.dumps(sn, ensure_ascii=False)); bad.append('%s：在家沒有選單 %s %.2f' % (bk, sn['key'], sn['h'])); await run.shot(pg, '%s_nomenu' % bk); break
                    if not await press_bed(pg, cdp, run):
                        say('   ⚠ 按不到床（%s）' % json.dumps(sn, ensure_ascii=False)); bad.append('%s：按不到床 %s %.2f %s' % (bk, sn['key'], sn['h'], sn['zone'])); await run.shot(pg, '%s_nobed' % bk); break
                    continue
                say('   ⚠ 卡住：%s' % json.dumps(sn, ensure_ascii=False)); bad.append('%s：240 秒沒有結束 %s %.2f' % (bk, sn['key'], sn['h'])); await run.shot(pg, '%s_stuck' % bk); break
            for c in await pg.evaluate(CARDS):
                stops.append({'at': c['at'], 'what': '日期卡（%s）' % c['where'], 'card': c['card']}); say('   🗓 日期卡 %s %s：%s' % (c['at'], c['where'], c['card'][:80]))
        json.dump({'res': allres, 'bad': bad}, open(os.path.join(OUT, 'holff.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('寒暑假快轉：七個假期都能一路快轉到開學、不卡住', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
