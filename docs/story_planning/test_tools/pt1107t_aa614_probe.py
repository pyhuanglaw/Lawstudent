"""BB-B 2026-11-07：AA614-CLASSMATE-JOBS-1103＋AA615-ALISON-CINEMA-1103（LAWWW-B f5bc29f5d，測 c9cdebb78）瀏覽器抽查。
  MODE=watch：南洋 1 廳「坐下看電影」——沒票坐下＝不演；買票（大廳「買票」）→ 1 廳坐下＝燈暗、時間往後（最多到 24:00）、三句旁白隨機一句、NY_WATCHED；同一天再坐＝不再演
  MODE=inv：手機約人撞到上班——沛珊（週三晚上）→「禮拜三我在課輔班……禮拜四好不好？」＋改約隔天同時間；明軒（週二 19:00）→「我那時候家教……」＋改約當天 21:30
  MODE=door：沛珊 週三 18:20～18:50 溫州街課輔班門口：第一次那一句、下一個週三換窗戶旁白
  MODE=page：Alison 資料頁「打工：南洋戲院（週五、週六晚上）」（第一次在櫃檯碰到以後）
[前置／捷徑] 讀使用者存檔 day46（2025-11-01 六，大一上第 9 週；認識沛珊、明軒、Alison），同一份進度跳日期記【前置】；買票、坐下、約人、手機都照玩家點。
用法：LW_TESTS=<測試樹>/tests MODE=... python3 pt1107t_aa614_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'watch')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
PS, MX, YU = 'classmate_peishan', 'classmate_mingxuan', 'yu'


async def choose(pg, cdp, word):
    c = await pg.evaluate("(w=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.includes(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })(%s)" % json.dumps(word))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c[2]


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")


async def wait_opts(pg, s=20):
    for _ in range(int(s / 0.5)):
        o = await opts(pg)
        if o: return o
        await pg.wait_for_timeout(500)
    return []


async def lines_until_idle(pg, cdp, secs=60, picks=()):
    said = []
    for _ in range(int(secs / 1.0)):
        q = await P.ts(pg)
        if q['txt'] and (not said or said[-1] != q['txt']): said.append(q['txt'])
        if q['ch']:
            o = [x['t'] for x in q['ch']]; t = next((x for p in picks for x in o if p in x), None)
            if t is None: return said, o
            await choose(pg, cdp, t); continue
        if not q['busy'] and not q['dlg']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(900)
    return said, []


async def interact(pg, cdp, run, label, near=0.6):
    it = await L.find_it(pg, label)
    if not it: return None
    await L.go_to(pg, cdp, run, it['x'], it['z'], near, label, max_s=300)
    for _ in range(10):
        lab = await pg.evaluate("__BBF.lab()")
        if lab.startswith(label): break
        await pg.wait_for_timeout(400)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    return it


async def person_lines(pg, cdp, pid):
    await P.phone_tab(pg, cdp, 'friends')
    if not await pg.evaluate("(id=>!!document.querySelector('#phoneBody [data-person=\"'+id+'\"]'))(%s)" % json.dumps(pid)):
        await L.close_panels(pg, cdp); return None
    await L.tap(pg, cdp, '#phoneBody [data-person="%s"]' % pid); await pg.wait_for_timeout(900)
    ui = await pg.evaluate("(()=>{ const w=document.querySelector('#phoneBody .whois'); return w?w.innerText.split('\\n').map(s=>s.trim()).filter(Boolean):[]; })()")
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody [data-personback]'); if(b) b.click(); })()"); await L.close_panels(pg, cdp)
    return ui


async def invite(pg, cdp, who, cat, place, when):
    """手機 → 朋友 →「約」→ 類別 → 地點 → 時間；回傳 (各層選項, 之後說的話與選項)"""
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(800)
    sel = '#phoneBody [data-inv="%s"]' % who
    if not await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel)):
        why = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        return {'err': 'no inv button', 'body': why[:600]}, None
    await pg.evaluate("(s=>document.querySelector(s).scrollIntoView({block:'center'}))(%s)" % json.dumps(sel))
    await L.tap(pg, cdp, sel)
    lv = {}
    lv['cat'] = await wait_opts(pg); await choose(pg, cdp, cat)
    lv['place'] = await wait_opts(pg); await choose(pg, cdp, place)
    lv['time'] = await wait_opts(pg); got = await choose(pg, cdp, when)
    lv['picked'] = got
    said, o = await lines_until_idle(pg, cdp, 40)
    return lv, {'said': said, 'opts': o}


async def main():
    run = L.Run('pt1107t_aa614_' + MODE, OUT)
    base = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        Lx = None
        if MODE == 'watch':
            s, d = await P.base(pg, base, '2025-11-01', 14.0, 'xs_nanyang')
            s.setdefault('flags', {}).pop('NY_TICKET', None); s['flags'].pop('NY_WATCHED', None); s['money'] = max(s.get('money', 0), 2000)
            await P.load(pg, cdp, s); await P.init(pg)
            run.setup('[前置] day46 存檔 2025-11-01（六）14:00 南洋戲院大廳；沒有今天的票')
            Lx = await pg.evaluate("AA614.L.watch")
            # 沒票：進 1 廳坐下＝不演
            await pg.evaluate("void GAME.enter('xs_nanyang_hall')"); await pg.wait_for_timeout(6000); await P.init(pg)
            h0 = await pg.evaluate("+GAME.G.hour")
            await interact(pg, cdp, run, '坐下看電影')
            said0, _ = await lines_until_idle(pg, cdp, 20)
            h1 = await pg.evaluate("+GAME.G.hour"); w0 = await pg.evaluate("GAME.G.flags.NY_WATCHED")
            print('[NOTICKET]', J(said0), h0, h1, w0)
            run.setup('【捷徑】沒票那一段用 GAME.enter 直接進 1 廳（買票以後那一段照玩家走）')
            run.check('沒票坐下：不演（沒有那三句旁白、時間沒跳、沒記 NY_WATCHED）', not any(t in said0 for t in Lx) and (h1 - h0) < 0.5 and w0 is None, J([said0, h0, h1, w0]))
            # 有票
            await pg.evaluate("void GAME.enter('xs_nanyang')"); await pg.wait_for_timeout(6000); await P.init(pg)
            m0 = await pg.evaluate("GAME.G.money|0")
            await interact(pg, cdp, run, '買票')
            said1, o1 = await lines_until_idle(pg, cdp, 30)
            if o1: await choose(pg, cdp, o1[0]); said1b, _ = await lines_until_idle(pg, cdp, 30); said1 += said1b
            tk = await pg.evaluate("({t:GAME.G.flags.NY_TICKET, day:GAME.G.day, m:GAME.G.money|0})")
            print('[TICKET]', J(said1), J(o1), J(tk), m0)
            run.check('大廳「買票」→ 有今天的票（NY_TICKET＝今天）、扣錢', tk['t'] == tk['day'] and tk['m'] < m0, J([o1, tk, m0]))
            hall = await L.find_it(pg, '進')
            print('[HALL IT]', J(hall))
            entered = False
            for lab in ('進 1 廳', '進入 1 廳', '1 廳', '進場'):
                if await L.find_it(pg, lab):
                    await interact(pg, cdp, run, lab); await pg.wait_for_timeout(5000); entered = True; break
            zone = await pg.evaluate("GAME.G.zone")
            if zone != 'xs_nanyang_hall':
                await pg.evaluate("void GAME.enter('xs_nanyang_hall')"); await pg.wait_for_timeout(6000); run.setup('【捷徑】找不到進 1 廳的門，用 GAME.enter 進去（%s）' % J(hall))
            await P.init(pg)
            h2 = await pg.evaluate("+GAME.G.hour")
            await interact(pg, cdp, run, '坐下看電影')
            said2, _ = await lines_until_idle(pg, cdp, 60)
            h3 = await pg.evaluate("+GAME.G.hour"); w2 = await pg.evaluate("GAME.G.flags.NY_WATCHED"); day = await pg.evaluate("GAME.G.day")
            await run.shot(pg, 'watch_after')
            print('[WATCH]', J(said2), h2, h3, w2)
            one = [t for t in Lx if t in said2]
            run.check('有票坐下：三句旁白其中一句（%s）、時間往後（%.2f→%.2f，最多到 24:00）、NY_WATCHED＝今天' % (J(one, 60), h2, h3), len(one) == 1 and 1.0 < (h3 - h2) <= 4.01 and h3 <= 24.0 and w2 == day, J([said2, h2, h3, w2]))
            # 再坐一次
            await L.close_panels(pg, cdp)
            hh = await pg.evaluate("+GAME.G.hour")
            await P.jump(pg, cdp, run, '2025-11-01', min(hh, 23.5), zone='xs_nanyang_hall', pos=None, note='同一天、站起來重新進 1 廳（存檔裡 NY_WATCHED 照留）'); await P.init(pg)
            h4 = await pg.evaluate("+GAME.G.hour")
            await interact(pg, cdp, run, '坐下看電影')
            said3, _ = await lines_until_idle(pg, cdp, 20)
            h5 = await pg.evaluate("+GAME.G.hour")
            print('[AGAIN]', J(said3), h4, h5)
            run.check('同一天再坐：不再演（一天一次）', not any(t in said3 for t in Lx) and (h5 - h4) < 0.5, J([said3, h4, h5]))
        elif MODE == 'inv':
            Lx = None
            for who, key, when_key, hour, want_line, label in ((PS, '2025-11-04', '明天 19:00', 15.0, 'ps', '沛珊（週三 19:00）'), (MX, '2025-11-04', '今天 19:00', 15.0, 'mx', '明軒（週二 19:00）')):
                s, d = await P.base(pg, base, key, hour, 'campus')
                s['invites'] = [v for v in s.get('invites', []) if v.get('who') != who]
                if who == MX:
                    s.setdefault('contacts', {})[MX] = s.get('contacts', {}).get(MX) or {'day': d['d'] - 10}
                await P.load(pg, cdp, s); await P.init(pg)
                if who == MX:
                    await pg.evaluate("(id=>{ const r=SOCIAL.rel(id); if(r){ r.fam=Math.max(r.fam||0,60); r.trust=Math.max(r.trust||0,40); r.comf=Math.max(r.comf||0,40); } })(%s)" % json.dumps(MX))
                    run.setup('【捷徑】明軒：存檔裡還沒有他的聯絡方式（ACQUAINTANCE）→ 補 contacts＋關係撥到 FRIEND 左右')
                inv = await pg.evaluate("AA614.L.inv")
                run.setup('[前置] day46 存檔改到 %s %.0f:00 校園' % (key, hour))
                lv, after = await invite(pg, cdp, who, '吃飯', '大口漢堡', when_key)
                print('[INV %s]' % who, J(lv, 1500), J(after, 1500))
                if after is None:
                    run.check('%s：朋友頁有「約」' % label, False, J(lv)); continue
                said = after['said']; o = after['opts']
                run.check('%s 約到上班時間：她／他說「%s」' % (label, inv[want_line]), any(inv[want_line].strip('「」') in t for t in said), J([lv.get('picked'), said]))
                run.check('%s：給改約的選項（%s）' % (label, J(o, 200)), bool(o), J(o))
                if o:
                    yes = next((x for x in o if x.startswith('好') or '那就' in x), o[0])
                    await choose(pg, cdp, yes); said2, _ = await lines_until_idle(pg, cdp, 30)
                    ivs = await pg.evaluate("(id=>(GAME.G.invites||[]).filter(v=>v.who===id).map(v=>({day:v.day,h:v.h,state:v.state,place:v.place})))(%s)" % json.dumps(who))
                    print('[RESCHED %s]' % who, yes, J(said2), J(ivs))
                    want = (d['d'] + 2, 19.0) if who == PS else (d['d'], 21.5)
                    run.check('%s 改約：約在 %s' % (label, '隔天（週四）19:00' if who == PS else '當天 21:30'), any(v['day'] == want[0] and abs(v['h'] - want[1]) < 0.05 for v in ivs), J([yes, said2, ivs, want]))
                await L.close_panels(pg, cdp)
        elif MODE == 'door':
            s, d = await P.base(pg, base, '2025-11-05', 18.2, 'wenzhou')
            s.setdefault('flags', {}).pop('AA614_PSDOOR', None); s['flags'].pop('AA614_PSDOOR_N', None)
            await P.load(pg, cdp, s, quiet=False); await P.init(pg)
            run.setup('[前置] day46 存檔改到 2025-11-05（三）18:12 溫州街（條件事件開著）')
            Lx = await pg.evaluate("({a:AA614.L.psDoor, b:AA614.L.psDoorAgain})")
            pj0 = await person_lines(pg, cdp, PS); print('[PSPAGE0]', J(pj0))
            run.check('沛珊資料頁：還沒在門口遇到、沒聽過閒聊那句＝沒有「打工：……課輔班」', pj0 is not None and not any('打工' in x for x in pj0), J(pj0))
            n0 = await P.say_hook(pg)
            await P.wait_play(pg, cdp, 18.6, max_s=600, run=run, tag='door1')
            s1 = await P.said(pg, n0)
            f1 = await pg.evaluate("({d:GAME.G.flags.AA614_PSDOOR, n:GAME.G.flags.AA614_PSDOOR_N, day:GAME.G.day})")
            print('[DOOR1]', J(s1), J(f1))
            run.check('沛珊 週三 18:20 課輔班門口第一次：「%s」' % Lx['a'], any(Lx['a'] in t for _, t in s1) and f1['n'] == 1, J([s1, f1]))
            pj1 = await person_lines(pg, cdp, PS); print('[PSPAGE1]', J(pj1))
            run.check('門口遇到以後：沛珊資料頁有「打工：溫州街的國小課輔班（助教）」', pj1 is not None and any('打工：溫州街的國小課輔班（助教）' in x for x in pj1), J(pj1))
            await P.jump(pg, cdp, run, '2025-11-12', 18.2, quiet=False); await P.init(pg)
            n1 = await P.say_hook(pg)
            await P.wait_play(pg, cdp, 18.6, max_s=600, run=run, tag='door2')
            s2 = await P.said(pg, n1)
            f2 = await pg.evaluate("({d:GAME.G.flags.AA614_PSDOOR, n:GAME.G.flags.AA614_PSDOOR_N})")
            print('[DOOR2]', J(s2), J(f2))
            run.check('下一個週三：窗戶旁白「%s」、沒有第一次那句' % Lx['b'], any(Lx['b'] in t for _, t in s2) and not any(Lx['a'] in t for _, t in s2) and f2['n'] == 2, J([s2, f2]))
        elif MODE == 'page':
            async def page_lines():
                await P.phone_tab(pg, cdp, 'friends')
                await L.tap(pg, cdp, '#phoneBody [data-person="yu"]'); await pg.wait_for_timeout(900)
                ui = await pg.evaluate("(()=>{ const w=document.querySelector('#phoneBody .whois'); return w?w.innerText.split('\\n').map(s=>s.trim()).filter(Boolean):[]; })()")
                await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody [data-personback]'); if(b) b.click(); })()"); await L.close_panels(pg, cdp)
                return ui
            s, d = await P.base(pg, base, '2025-11-01', 18.5, 'xs_nanyang')
            s.setdefault('flags', {}).pop('NY_ALISON', None)
            await P.load(pg, cdp, s); await P.init(pg)
            run.setup('[前置] day46 存檔 2025-11-01（六）18:30 南洋戲院大廳；NY_ALISON 拿掉＝還沒在櫃檯碰過')
            u0 = await page_lines(); print('[PAGE0]', J(u0))
            run.check('還沒在櫃檯碰到：Alison 資料頁沒有「打工：南洋戲院……」', not any('打工' in x for x in u0), J(u0))
            r = await P.talk_to(pg, cdp, run, YU, 'alison_counter', picks=('好', '謝'))
            print('[MEET]', J(r, 1500))
            ny = await pg.evaluate("GAME.G.flags.NY_ALISON")
            u1 = await page_lines(); print('[PAGE1]', J(u1), J(ny))
            await run.shot(pg, 'alison_page_after')
            run.check('週六晚上在櫃檯碰到 Alison 以後：資料頁多「打工：南洋戲院（週五、週六晚上）」', bool(ny) and any('打工：南洋戲院（週五、週六晚上）' in x for x in u1), J([ny, u1]))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
