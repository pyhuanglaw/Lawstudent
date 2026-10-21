"""BB：X68 118 巷熟人照作息（AA_320）——[前置] 使用者 9/25 存檔改日期、人放在 118 巷（店門外或巷子中間）；
照玩家：走到門口按「進○○」→ 店裡看有沒有那個人；巷子裡散步的看巷子。先用 STORY.whereIs 列出「那個時間應該在 118 巷」的人（只查不改）。
Playwright 手機橫向模擬、?turbo，不是 iPhone。"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
bad = []; rep = []
def say(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); rep.append(s)
CASES0 = [(1, 18.2, 'lane118'), (5, 17.8, 'lane118'), (2, 12.4, 'l118_dian'), (3, 18.1, 'l118_home'), (3, 18.2, 'l118_omu'), (2, 18.2, 'l118_self'), (2, 18.3, 'l118_korea'), (1, 19.2, 'l118_dian')]
CASES = [c for c in CASES0 if not os.environ.get('ONLY') or ('%d_%s' % (c[0], c[2])) in os.environ['ONLY'].split(',')]
WHO = """((h)=>{ const out=[]; for(const id of Object.keys(CHARACTERS)){ let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){} if(w&&w.zone&&/^(lane118|l118_)/.test(w.zone)) out.push({id, name:(CHARACTERS[id].name||id), zone:w.zone, act:w.act||'', until:w.until||''}); } return out; })()"""
NPCS = "(()=>GAME.E.npcs.filter(n=>n&&n.obj&&n.charId&&n.obj.visible!==false&&!n.hidden).map(n=>({id:n.charId, name:n.name||'', x:+n.obj.position.x.toFixed(1), z:+n.obj.position.z.toFixed(1), seat:!!n.seat})))()"
async def drain(pg, cdp, secs=40):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(b=>/不|晚一點|之後|離開|算了/.test(b.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent.trim().slice(0,24)]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['busy']: await pg.wait_for_timeout(500); continue
        await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()")
        await pg.wait_for_timeout(800); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return
async def main():
    run = L.Run('x68', OUT); base = json.load(open(SAVE, encoding='utf-8')); res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(5000)
        for wd, h, zt in CASES:
            day = await pg.evaluate("((wd)=>{ const d0=STORY.dayOfKey('2025-09-29'); for(let d=d0; d<d0+28; d++){ if(CALENDAR.dateOf(d).wd%%7===wd&&!CALENDAR.holiday(d)) return d; } return null; })(%d)" % wd)
            key = await pg.evaluate("CALENDAR.dateOf(%d).key" % day)
            shop = await pg.evaluate("(z=>{ for(const k of Object.keys(L118_SHOP_LAYOUTS)) if(L118_SHOP_LAYOUTS[k].zone===z) return k; return null; })(%s)" % json.dumps(zt))
            LL = await pg.evaluate("L118_SHOP_LAYOUTS[%s]" % json.dumps(shop)) if shop else None
            so = LL['street']['spawn_out'] if LL else {'x': 0, 'z': 0, 'yaw': 0}
            st = json.loads(json.dumps(base)); G = st.get('G', st)
            G.update({'day': day, 'hour': h, 'zone': 'lane118', 'weekday': wd, 'pos': {'x': so['x'], 'z': so['z'], 'yaw': so.get('yaw', 0)}})
            G['hour'] = round(h - 0.05, 2)
            await L.load_state(pg, G); await pg.wait_for_timeout(6000); await drain(pg, cdp)
            for _ in range(60):
                if await pg.evaluate("!!GAME.G.flags.afternoonDone"): break
                await pg.wait_for_timeout(2000)
            say('   讀檔後 afternoonDone=%s（主線第 3 天以後的開放，S.tick 每 30 格才跑）' % await pg.evaluate("GAME.G.flags.afternoonDone"))
            await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(1500)
            await pg.evaluate("(async()=>{ await GAME.enter('lane118'); })()"); await pg.wait_for_timeout(6000); await drain(pg, cdp); await pg.wait_for_timeout(4000)
            say('   GAME.npc：%s｜E.npcs：%s' % (await pg.evaluate("Object.keys(GAME.npc||{})"), await pg.evaluate("GAME.E.npcs.map(n=>(n.charId||n.id||'?')+(n.isExtra?'(路人)':''))")))
            run.setup('[前置] 使用者存檔改到 %s（週%s）%.2f，118 巷 %s' % (key, '日一二三四五六'[wd], h, ('「%s」門外' % LL['name']) if LL else '巷子中間'))
            exp = await pg.evaluate(WHO); say('== %s 週%s %.2f %s：作息上應該在 118 巷的人 %s' % (key, '日一二三四五六'[wd], h, zt, json.dumps(exp, ensure_ascii=False)))
            want = [e for e in exp if e['zone'] == zt]
            r = {'case': [key, wd, h, zt], 'expected': want}
            if not want: say('   ⚠ 作息上這個時間沒有人在 %s（照 AA_320 應該有）' % zt); bad.append('%s %.2f %s：whereIs 沒有人' % (key, h, zt))
            if zt == 'lane118':
                await pg.wait_for_timeout(4000); seen = await pg.evaluate(NPCS); r['seen'] = seen
                say('   巷子裡看到的人：%s' % json.dumps(seen, ensure_ascii=False)); await run.shot(pg, 'x68_%s_%s' % (key, zt))
                for e in want:
                    if not any(n['id'] == e['id'] for n in seen): bad.append('%s %.2f 巷子：%s 作息在巷子，畫面上沒有' % (key, h, e['name']))
            else:
                it = await L.find_it(pg, '進' + LL['name'])
                ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, LL['name'] + '門口')
                s = await L.state(pg); say('   門口按鈕「%s」' % s['interact'])
                if not s['interact'].startswith('進' + LL['name']): bad.append('%s：門口按鈕是「%s」' % (LL['name'], s['interact']))
                await L.tap(pg, cdp, '#interact')
                for _ in range(60):
                    if await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy" % json.dumps(zt)): break
                    s = await L.state(pg)
                    if s['dlg'] or s['choices']: await drain(pg, cdp, 20)
                    await pg.wait_for_timeout(1000)
                await pg.wait_for_timeout(5000); seen = await pg.evaluate(NPCS); r['seen'] = seen; z = await pg.evaluate("GAME.G.zone")
                say('   店裡（%s）看到的人：%s' % (z, json.dumps(seen, ensure_ascii=False))); await run.shot(pg, 'x68_%s_%s' % (key, zt))
                if z != zt: bad.append('%s：沒進到店裡（%s）' % (LL['name'], z))
                for e in want:
                    if not any(n['id'] == e['id'] for n in seen): bad.append('%s %.2f %s：%s 作息在店裡，店裡沒有' % (key, h, LL['name'], e['name']))
            res.append(r)
        json.dump({'res': res, 'bad': bad}, open(os.path.join(OUT, 'x68.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('X68 118 巷熟人照作息出現', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
