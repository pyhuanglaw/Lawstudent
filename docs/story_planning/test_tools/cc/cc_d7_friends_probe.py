"""CC-C 11-12：W1R D7——法律系大一宿營後，手機朋友／聯絡人清單有可昕（QA-W1-VISUAL BB_398；BB-C 12:00 定情境，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
做法（沒有捷徑）：標題「從法律系開始」→ 照玩家點完宿營（cc_camp608_common：new_game_law＋resume_ok，走到 8/29 搬宿舍）→
  打開手機（#btnPhone）→ 每一個分頁（#phoneTabs 的 data-ptab）各點一次、截圖、記分頁上的字 → 看「朋友」「聯絡人」那幾頁有沒有「可昕」；另外記遊戲資料 G.contacts.kexin、SOCIAL 的階段。
CC_02 清單 2026-11-12：1✓（宿營後 8/29，照玩家玩到） 2✓（分頁從畫面 data-ptab 讀） 3✓（一局） 4✓（宿營選項照共用的玩法） 5n/a（只看手機） 6✓（每頁等 1 秒） 7✓ 8n/a（不判，截圖給 BB） 9n/a（手機截圖） 10n/a（沒有捷徑，條件事件照遊戲） 11✓ 12✓（每一頁同樣欄位） 13✓（沒有捷徑）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CAMP_S=2400] python3 cc_d7_friends_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_camp608_common as C
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
J = lambda o: json.dumps(o, ensure_ascii=False)


async def main():
    run = L.Run('d7_friends', OUT)
    print('CC W1R D7 宿營後手機朋友清單：SHA %s' % (SHA or '?'), flush=True)
    res = {'sha': SHA, 'tabs': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        await pg.goto(URL)
        if not run.check('遊戲載入', await L.wait_loaded(pg, 600)): await b.close(); sys.exit(1)
        run.check('標題畫面按「從法律系開始」', await C.new_game_law(pg, cdp, run))
        ok_c, s_c = await C.resume_ok(pg, cdp, run, int(os.environ.get('CAMP_S', '2400')))
        run.check('照玩家點完宿營、走到 8/29', ok_c, J({k: s_c.get(k) for k in ('key', 'h', 'zone')} if s_c else None))
        if not ok_c: await run.shot(pg, 'camp_not_done'); await b.close(); sys.exit(1)
        await L.close_panels(pg, cdp); await pg.wait_for_timeout(1500)
        g = await pg.evaluate("(()=>{ const G=GAME.G; let st=null; try{ st=SOCIAL.stage?SOCIAL.stage('kexin'):null; }catch(e){} return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone, contact:(G.contacts||{}).kexin, stage:st, met:!!(G.flags&&G.flags.met_kexin)}; })()")
        run.note('遊戲資料：%s' % J(g)); res['game'] = g
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        tabs = await pg.evaluate("[...document.querySelectorAll('#phoneTabs button[data-ptab]')].map(b=>({k:b.dataset.ptab, t:(b.textContent||'').trim()}))")
        run.note('手機分頁：%s' % J(tabs))
        found = []
        for tb in tabs:
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tb['k']); await pg.wait_for_timeout(1100)
            txt = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\s+/g,' ')")
            await pg.screenshot(path=os.path.join(OUT, 'd7_tab_%s.png' % tb['k']))
            has = '可昕' in txt
            if has: found.append(tb)
            res['tabs'].append({'tab': tb, 'has_kexin': has, 'text': txt[:600]})
            run.note('分頁「%s」(%s)：有可昕=%s；字 %s' % (tb['t'], tb['k'], has, txt[:300]))
        run.check('手機的朋友／聯絡人那一頁有可昕', any(any(w in (t['t'] + t['k']) for w in ('朋友', '聯絡', 'friend', 'contact', 'ppl', 'people')) for t in found), J(found))
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'd7_friends.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not run.fails else 'FAILED %d: %s' % (len(run.fails), '；'.join(run.fails)), flush=True)
    sys.exit(1 if run.fails else 0)

asyncio.run(main())
