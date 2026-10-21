"""BB（帳號 A）2026-10-21：#134 AA-C 10-21 劇情驗證的遊戲那一層——芷若在英國寄的第二張明信片（2027-10-22）的新句子
「這裡的同學問我最喜歡哪部電影。我說了我自己的那一部。他們都沒看過。」（AA 15:34，開發分支 43a8c17a；y2b3d.js 的 S.PC）。
【前置】讀使用者 9/25 存檔，改到 2027-10-22（五）12:30、法律系大三上（ROOM_Y2／ROOM_Y3 照日期補）；芷若 fam 45／trust 30（朋友）；
9/24 那張已經讀過、回過（ZR_PC、ZR_CARDS_SENT＝['slow']），不然會先演 9/24 那張。三種版本：
  dorm＝沒有交往：宿舍書桌上「明信片」；gf＝和芷若交往中：寄給你（宿舍）；cafe＝和以安交往中：寄到 Café、抬頭「兩點半的常客們」、吧檯旁「牆上的明信片」。
照玩家：走到明信片的互動點、按互動、點完對話，選「（先不回）」。只加記錄（包 GAME.say），不改遊戲。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 postcard_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)

NEW = '這裡的同學問我最喜歡哪部電影。我說了我自己的那一部。他們都沒看過。'
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+GAME.G.hour.toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); }; })()"""
CARD = """(()=>{ const its=(GAME.E.interactables||[]).filter(i=>i.zrPostcard&&!i.hidden); return its.map(i=>[+i.x.toFixed(2),+i.z.toFixed(2),i.label]); })()"""
SCEN = {'dorm': ('dorm', '', '明信片'), 'gf': ('dorm', 'heroine_02', '明信片'), 'cafe': ('cafe', 'heroine_01', '明信片（兩點半的常客們）')}


async def one(p, run, G0, sid):
    zone, dt, want_name = SCEN[sid]; G = json.loads(json.dumps(G0)); F = G['flags']; res = {'sid': sid}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2027-10-22')"); d924 = await pg.evaluate("STORY.dayOfKey('2027-09-24')")
        for k, key in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05')): F[k] = await pg.evaluate("STORY.dayOfKey('%s')" % key)
        for k in list(F.keys()):
            if k.startswith('dating_'): F[k] = False
        if dt: F['dating_' + dt] = True
        ver = 'gf' if sid == 'gf' else ('cafe' if sid == 'cafe' else 'dorm')
        F['ZR_PC'] = {'ver': {'2027-09-24': ver}, 'read': {'2027-09-24': d924}, 'sent': {'2027-09-24': 'slow'}}; F['ZR_CARDS_SENT'] = ['slow']
        G.update({'day': d, 'hour': 12.5, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
        await L.load_state(pg, G); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
        await pg.evaluate("(()=>{ const R=SOCIAL.rel('heroine_02'); R.fam=Math.max(R.fam||0,45); R.trust=Math.max(R.trust||0,30); R.comf=Math.max(R.comf||0,30); SOCIAL.remember('heroine_02','FIRST_MET',''); })()")
        run.setup('[前置] %s：使用者 9/25 存檔改到 2027-10-22（五）12:30 %s；芷若 fam45／trust30；9/24 那張已讀已回；交往：%s' % (sid, zone, dt or '沒有'))
        await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        card = []
        for i in range(20):
            card = await pg.evaluate(CARD)
            if card: break
            s = await L.state(pg)
            if s['dlg'] or s['choices']: await L.advance_dialogs(pg, cdp, run, lambda s: not (s['dlg'] or s['choices']), max_steps=60)
            await L.phone_away(pg, cdp); await pg.wait_for_timeout(1000)
        res['card'] = card
        say('   %s 明信片互動點：%s' % (sid, card))
        if card:
            await L.go_to(pg, cdp, run, card[0][0], card[0][1], 0.6, card[0][2], max_s=180)
            await L.close_panels(pg, cdp)
            btn = (await L.state(pg))['interact']; res['button'] = btn; say('   按鈕：%s' % btn)
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            seen_choice = []
            for k in range(40):
                s = await L.state(pg)
                if s['choices']:
                    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"); seen_choice.append(opts)
                    await run.shot(pg, '%s_choices' % sid)
                    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b.find(x=>x.textContent.indexOf('先不回')>=0)||b[b.length-1]; e.scrollIntoView({block:'center'}); })()")
                    c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b.find(x=>x.textContent.indexOf('先不回')>=0)||b[b.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); continue
                if s['dlg']:
                    if k == 0: await run.shot(pg, '%s_card' % sid)
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900); continue
                if k > 2: break
                await pg.wait_for_timeout(900)
            res['choices'] = seen_choice
        log = await pg.evaluate("window.__LOG||[]"); res['log'] = log
        lines = [x for x in log if '明信片' in (x.get('n') or '')]
        res['lines'] = lines; say('   %s 明信片的句子：%s' % (sid, json.dumps(lines, ensure_ascii=False)))
        res['state'] = await pg.evaluate("(()=>{ const P=GAME.G.flags.ZR_PC||{}; return {ver:P.ver, read:P.read, sent:P.sent}; })()")
        ok = bool(lines) and any(x['t'] == '「%s」' % NEW for x in lines) and all(x['n'] == want_name for x in lines) and '2027-10-22' in json.dumps((res['state'] or {}).get('read') or {})
        run.check('%s：10/22 的明信片（%s）唸出新句「%s」' % (sid, want_name, NEW), ok, json.dumps({'lines': lines, 'state': res['state'], 'button': res.get('button')}, ensure_ascii=False)[:400])
        run.check('%s：有「（先不回）」以外的回寄選項（每張可以回一次）' % sid, bool(res.get('choices')) and any(len(o) >= 2 for o in res['choices']), json.dumps(res.get('choices'), ensure_ascii=False)[:300])
        run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e:
        res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：跑完沒有例外（測試本身）' % sid, False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return res


async def main():
    run = L.Run('postcard', OUT); base = json.load(open(SAVE, encoding='utf-8')); G = base.get('G', base); out = []
    async with async_playwright() as p:
        for sid in os.environ.get('SCEN', 'dorm,gf,cafe').split(','):
            say('== %s' % sid); out.append(await one(p, run, G, sid))
            json.dump(out, open(os.path.join(OUT, 'postcard.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
