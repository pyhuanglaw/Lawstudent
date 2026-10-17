"""v0 經濟系 → 法律系（AA_154 2-4b）的瀏覽器流程：在真的遊戲裡從 8/30 晚上（臺北的家）睡覺 → 8/31 早上自動換階段 → 法律系第一天（9/17 21:12 宿舍）。
確認：3b② 四句、字卡、3b③、宿舍、introDorm 的開場、可昕第一則多「第二次的大一」、備份存檔（fatiao3d_backup_y0end）讀得回 8/31 早上、全程沒有 JS 例外。
[前置／捷徑]：用遊戲自己的讀檔（GAME.applySave）把玩家放到 8/30 22:00 在家（經濟系、休學後住家裡、E37 演過）；對話、選項都用觸控點；用 ?turbo。
用法：python3 tests/flow_v0_tolaw.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_v0_tolaw'
TURBO = URL + ('&' if '?' in URL else '?') + 'turbo'


async def pick(pg, cdp, prefer):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=bs.find(x=>w.some(s=>x.textContent.includes(s)))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })(%s)" % json.dumps(prefer))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700)
    return c and c[2]


async def drive(pg, cdp, until_js, prefer, max_s=240):
    log = []
    for _ in range(int(max_s * 2)):
        if await pg.evaluate(until_js): return True, log
        s = await L.state(pg)
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,16))")
            log.append('▶' + str(await pick(pg, cdp, prefer))); print('  ', log[-1], '／選項', opts, flush=True)
        elif s['dlg']:
            t = await pg.evaluate("(document.querySelector('#dlg .text, #dlgText, #dlg')||{}).textContent||''")
            if not log or log[-1] != t[:40]: log.append(t[:40]); print('  ', t[:40], flush=True)
            await L.tap(pg, cdp, '#dlg')
        elif _ % 20 == 0:
            g = await pg.evaluate("({stage:GAME.G.stage,day:GAME.G.day,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,home:HOME.at(GAME.G),busy:GAME.E.player.busy})")
            print('   （等）', json.dumps(g, ensure_ascii=False), flush=True)
        await pg.wait_for_timeout(500)
    return False, log


async def main():
    run = L.Run('flow_v0_tolaw', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(TURBO); run.check('遊戲載入', await L.wait_loaded(pg))
        d30 = await pg.evaluate("STORY.dayOfKey('2025-08-30')")
        st = {'stage': 'econ', 'zone': 'campus', 'day': d30, 'weekday': 6, 'hour': 22, 'money': 31234, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57},
              'home': {'at': True, 'base': True, 'day': d30},
              'flags': {'Y0_MOVED_OUT': True, 'LEAVE_WEEK': 6, 'Y0_LEFT': True, 'E36_PACT': 'weekly', 'E25_ANSWER': 'only_me', 'E35_PLAN': 'sea', 'Y0_STICKY': True, 'dating_kexin': False, 'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 8, 'E01_DONE': True},
              'events': {'done': {'ev_y0_e36': 1, 'ev_y0_e36n': 1, 'ev_y0_e37': 1, 'ev_y0_a3': 1, 'ev_y0_e35': 1, 'ev_y0_e35sh': 1}, 'last': {}, 'count': 6}}
        run.setup('讀檔到 8/30（六）22:00 在臺北的家（經濟系、休學後、E37 演過）')
        await L.load_state(pg, st)
        ok, log = await drive(pg, cdp, "!!document.querySelector('#choices button')&&[...document.querySelectorAll('#choices button')].some(x=>x.textContent.includes('睡覺'))", [], 60)
        run.check('在家的選單出來了（有「睡覺」）', ok, json.dumps(log[-4:], ensure_ascii=False))
        await run.shot(pg, 'home_830')
        # 打字機效果下畫面上的字只抓得到開頭：另外記下 GM.say 收到的完整句子（只記錄、不改流程）
        await pg.evaluate("(()=>{ if(window.__said) return; window.__said=[]; const o=GAME.say; GAME.say=function(w,t){ window.__said.push(String(t||'')); return o.apply(this,arguments); }; })()")
        await pick(pg, cdp, ['睡覺'])
        ok, log = await drive(pg, cdp, "GAME.G.stage==='law'&&GAME.G.zone==='dorm'&&!!GAME.G.flags.introDone", ['讀到一半。'], 300)
        said = await pg.evaluate("window.__said||[]")
        text = ' | '.join(log + said)
        run.check('8/31 早上換階段：3b② 第一句、字卡之後的 3b③、法律系第一天的開場都演了', ok and '暑假剩下的日子' in text and '開學第一週，你走進霖澤館' in text, json.dumps(said[:30], ensure_ascii=False))
        s = await pg.evaluate("({stage:GAME.G.stage,day:GAME.G.day,zone:GAME.G.zone,dk:GAME.G.flags.dating_kexin,xun:GAME.G.flags.MET_XUN,played:GAME.G.flags.PLAYED_Y0,pact:GAME.G.flags.E36_PACT,money:GAME.G.money,home:HOME.at(GAME.G)})")
        run.check('法律系第 1 天、宿舍、不在家；可昕交往中、認識阿勳、E36_PACT 和錢都帶過來', s['stage'] == 'law' and s['day'] == 1 and s['zone'] == 'dorm' and s['dk'] is True and s['xun'] and s['played'] and s['pact'] == 'weekly' and not s['home'], json.dumps(s, ensure_ascii=False))
        kx = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>m.text)")
        run.check('可昕的第一則：先「第二次的大一。我們都是重考上來的。」', bool(kx) and kx[0] == '第二次的大一。我們都是重考上來的。', json.dumps(kx[:3], ensure_ascii=False))
        await run.shot(pg, 'law_day1')
        bk = await pg.evaluate("(()=>{ try{ const s=JSON.parse(localStorage.getItem('fatiao3d_backup_y0end')); return s&&{stage:s.stage,day:s.day,label:s.backupLabel,home:!!(s.home&&s.home.at)}; }catch(e){ return null; } })()")
        d31 = d30 + 1
        run.check('備份存檔 fatiao3d_backup_y0end：經濟系、8/31、標「經濟系那一年的最後一天」', bool(bk) and bk['stage'] == 'econ' and bk['day'] == d31 and bk['label'] == '經濟系那一年的最後一天', json.dumps(bk, ensure_ascii=False))
        run.setup('重新整理，讀備份存檔（GAME.applySave）')
        await pg.goto(TURBO); await L.wait_loaded(pg)
        await pg.evaluate("(async()=>{ const s=JSON.parse(localStorage.getItem('fatiao3d_backup_y0end')); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()")
        await pg.wait_for_timeout(3000)
        s2 = await pg.evaluate("({stage:GAME.G.stage,day:GAME.G.day})")
        run.check('備份讀得回 8/31 早上（還是經濟系）', s2['stage'] == 'econ' and s2['day'] == d31, json.dumps(s2))
        run.check('全程沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
