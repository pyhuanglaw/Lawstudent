"""v0 經濟系 → 法律系的瀏覽器流程（LIFE-LINE：8/22 法律系宿營之後、8/29 搬進法律系宿舍；START-WEEK 選 1 預設）：在真的遊戲裡從 8/28 晚上（臺北的家）睡覺 →
8/29 早上自動換階段（3b② 前兩句、備份）→ 8/29 15:00 搬宿舍（「你去年也搬過一次宿舍，這次只有一個行李箱。」）→ 法律系、宿舍。
確認：前兩句、搬宿舍、法律系 8/29、可昕交往中與經濟系的旗標帶過來、備份存檔（fatiao3d_backup_y0end）讀得回 8/29 早上（還是經濟系）、全程沒有 JS 例外。
[前置／捷徑]：用遊戲自己的讀檔（GAME.applySave）把玩家放到 8/28 22:00 在家（經濟系、休學後住家裡、宿營演過）；對話、選項都用觸控點；用 ?turbo。
（2026-10-17 改寫，FLOW-V0TOLAW：原本 8/30 開始、8/31 換階段、法律系第一天 9/17 的流程在 LIFE-LINE 以後不存在了）
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
    log = []; rep = 0
    for _ in range(int(max_s * 2)):
        if await pg.evaluate(until_js): return True, log
        s = await L.state(pg)
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,16))")
            log.append('▶' + str(await pick(pg, cdp, prefer))); print('  ', log[-1], '／選項', opts, flush=True)
        elif s['dlg']:
            t = await pg.evaluate("(document.querySelector('#dlg .text, #dlgText, #dlg')||{}).textContent||''")
            if not log or log[-1] != t[:40]: log.append(t[:40]); print('  ', t[:40], flush=True); rep = 0
            else: rep += 1
            fade = await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!f&&getComputedStyle(f).opacity>0.5&&getComputedStyle(f).pointerEvents!=='none'; })()")
            if fade and rep >= 6:   # 2026-10-17：對話在黑幕（#fade）下面、點不下去——原本會空轉到逾時（40～60 分鐘）
                log.append('<黑幕下有對話>'); print('   <黑幕下有對話：點不下去>', flush=True); return False, log
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
        d28 = await pg.evaluate("STORY.dayOfKey('2025-08-28')")
        st = {'stage': 'econ', 'zone': 'campus', 'day': d28, 'weekday': 4, 'hour': 22, 'money': 31234, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57},
              'home': {'at': True, 'base': True, 'day': d28},
              'flags': {'CAMP_Y1': True, 'Y0_MOVED_OUT': True, 'LEAVE_WEEK': 6, 'Y0_LEFT': True, 'E36_PACT': 'weekly', 'E25_ANSWER': 'only_me', 'E35_PLAN': 'sea', 'Y0_STICKY': True, 'dating_kexin': False, 'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 8, 'E01_DONE': True},
              'events': {'done': {'ev_y0_e36': 1, 'ev_y0_e36n': 1, 'ev_y0_e37': 1, 'ev_y0_a3': 1, 'ev_y0_e35': 1, 'ev_y0_e35sh': 1}, 'last': {}, 'count': 6}}
        run.setup('讀檔到 8/28（四）22:00 在臺北的家（經濟系、休學後、宿營演過）')
        await L.load_state(pg, st)
        ok, log = await drive(pg, cdp, "!!document.querySelector('#choices button')&&[...document.querySelectorAll('#choices button')].some(x=>x.textContent.includes('睡覺'))", [], 60)
        run.check('在家的選單出來了（有「睡覺」）', ok, json.dumps(log[-4:], ensure_ascii=False))
        await run.shot(pg, 'home_828')
        # 打字機效果下畫面上的字只抓得到開頭：另外記下 GM.say 收到的完整句子（只記錄、不改流程）
        await pg.evaluate("(()=>{ if(window.__said) return; window.__said=[]; const o=GAME.say; GAME.say=function(w,t){ window.__said.push(String(t||'')); return o.apply(this,arguments); }; })()")
        await pick(pg, cdp, ['睡覺'])
        ok, log = await drive(pg, cdp, "GAME.G.stage==='law'&&GAME.G.zone==='dorm'&&!!GAME.E.zone&&!!GAME.E.zone.def&&GAME.E.zone.def.id==='dorm'&&!GAME.E.player.busy&&!document.querySelector('#choices button')&&!(GAME.D&&GAME.D.active)", ['讀到一半。'], 300)   # G.zone 在搬宿舍那兩句之前就設成 dorm 了：要等真的進了宿舍（E.zone）、劇情演完
        said = await pg.evaluate("window.__said||[]")
        text = ' | '.join(log + said)
        d29 = d28 + 1
        run.check('8/29 早上換階段：3b② 前兩句（「暑假剩下的日子，過得很快。」）、搬宿舍「你去年也搬過一次宿舍，這次只有一個行李箱。」', ok and '暑假剩下的日子，過得很快。' in text and '你去年也搬過一次宿舍，這次只有一個行李箱。' in text, json.dumps(said[:30], ensure_ascii=False))
        s = await pg.evaluate("({stage:GAME.G.stage,day:GAME.G.day,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,dk:GAME.G.flags.dating_kexin,xun:GAME.G.flags.MET_XUN,played:GAME.G.flags.PLAYED_Y0,pact:GAME.G.flags.E36_PACT,money:GAME.G.money,home:HOME.at(GAME.G)})")
        run.check('法律系 8/29、宿舍、不在家；可昕交往中、認識阿勳、E36_PACT 帶過來', s['stage'] == 'law' and s['day'] == d29 and s['zone'] == 'dorm' and s['dk'] is True and s['xun'] and s['played'] and s['pact'] == 'weekly' and not s['home'], json.dumps(s, ensure_ascii=False))
        kx = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>m.text)")
        run.check('可昕的訊息串有東西（交往中；資訊）', True, json.dumps(kx[:3], ensure_ascii=False))
        await run.shot(pg, 'law_day1')
        bk = await pg.evaluate("(()=>{ try{ const s=JSON.parse(localStorage.getItem('fatiao3d_backup_y0end')); return s&&{stage:s.stage,day:s.day,label:s.backupLabel,home:!!(s.home&&s.home.at)}; }catch(e){ return null; } })()")
        run.check('備份存檔 fatiao3d_backup_y0end：經濟系、8/29、標「經濟系那一年的最後一天」', bool(bk) and bk['stage'] == 'econ' and bk['day'] == d29 and bk['label'] == '經濟系那一年的最後一天', json.dumps(bk, ensure_ascii=False))
        run.setup('重新整理，讀備份存檔（GAME.applySave）')
        await pg.goto(TURBO); await L.wait_loaded(pg)
        await pg.evaluate("(async()=>{ const s=JSON.parse(localStorage.getItem('fatiao3d_backup_y0end')); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()")
        await pg.wait_for_timeout(3000)
        s2 = await pg.evaluate("({stage:GAME.G.stage,day:GAME.G.day})")
        run.check('備份讀得回 8/29 早上（還是經濟系）', s2['stage'] == 'econ' and s2['day'] == d29, json.dumps(s2))
        run.check('黑幕沒有擋住對話（8/29 搬宿舍那兩句可以點）', '<黑幕下有對話>' not in log)
        run.check('全程沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
