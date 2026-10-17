"""真實玩家流程：從標題按「開始新的一天」（網址 ?start1）→ 回顧 → 8/22～24 迎新宿營整段 → 8/29 搬進宿舍（CAMP-L1；AA_205、BB_177 第五版）。
不用 ?turbo、不瞬移、不改劇情狀態：像玩家一樣點對話、選第一個選項（手機模擬 844×390 觸控，不是實機）。
檢查：宿營 12 段都演完、旗標（CAMP_Y1、MET_ZHE、CAMP_MOLE_REVEALED、小隊五人 FIRST_MET＝camp）、最後在 8/29 的宿舍可以操作、沒有 JS 錯誤；
中途截圖：遊覽車、破冰、營火揭曉、回到校門、8/29 宿舍。
用法：python3 tests/flow_camp_y1.py http://127.0.0.1:8765/index.html   （SwiftShader 很慢，約 20～30 分鐘）
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
URL = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html') + '?start1'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shots', 'flow_camp_y1')
SHOTS = {'（早上八點半，校門口停了兩台遊覽車': 'bus', '我是你們的小隊輔': 'ice', '各小隊的臥底，出列': 'reveal', '十二點半，遊覽車停在校門口': 'gate'}


async def main():
    run = L.Run('flow_camp_y1', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        await run.shot(pg, 'title')
        run.check('標題畫面有「開始新的一天」', await L.tap(pg, cdp, '#btnNew'))
        seen = set(); steps = 0
        while steps < 900:
            s = await L.state(pg); steps += 1
            done = await pg.evaluate("!!(GAME.G&&GAME.G.flags&&GAME.G.flags.CAMP_Y1)&&GAME.G.zone==='dorm'&&!GAME.D.active&&!(GAME.E.player||{}).busy")
            if done: break
            for k, lab in SHOTS.items():
                if k in s['dtext'] and lab not in seen: seen.add(lab); await run.shot(pg, lab)
            if s['choices']:
                await pg.evaluate("(()=>{ const b=document.querySelectorAll('#choices button'); const e=b[0]; if(e) e.scrollIntoView({block:'center'}); })()")
                c = await pg.evaluate("(()=>{ const e=document.querySelectorAll('#choices button')[0]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                if c: await L.touch_tap(cdp, c[0], c[1])
            elif s['dlg']:
                await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(450)
        st = await pg.evaluate("""(()=>{ const G=GAME.G, F=G.flags, m=id=>((G.social.mem[id]||[]).find(x=>x.tag==='FIRST_MET')||{}).note; return {day:G.day, zone:G.zone, money:G.money, camp:!!F.CAMP_Y1, metZhe:!!F.MET_ZHE, reveal:!!F.CAMP_MOLE_REVEALED,
          met:['zhe','classmate_xinci','classmate_peishan','classmate_mingxuan','classmate_bohan'].map(m), done:['ev_camp_d1_bus','ev_camp_d1_ice','ev_camp_d1_field','ev_camp_d1_party','ev_camp_d1_walk','ev_camp_d2_quiz','ev_camp_d2_water','ev_camp_d2_bbq','ev_camp_d2_fire','ev_camp_d2_talk','ev_camp_d3_quiz','ev_camp_d3_end'].filter(id=>G.events.done[id]).length,
          groups:Object.keys((G.phone||{}).groups||{})}; })()""")
        run.note(json.dumps(st, ensure_ascii=False))
        await run.shot(pg, 'dorm_829')
        run.check('宿營 12 段都演完、CAMP_Y1', st['camp'] and st['done'] == 12, json.dumps(st, ensure_ascii=False))
        run.check('小隊五人 FIRST_MET＝camp、MET_ZHE、臥底揭曉', st['met'] == ['camp'] * 5 and st['metZhe'] and st['reveal'])
        run.check('最後在 8/29（第 −18 天）的宿舍、錢 7,000', st['day'] == -18 and st['zone'] == 'dorm' and st['money'] == 7000)
        run.check('手機群組：系學會新生群組、第七小隊', 'law_new' in st['groups'] and 'camp_squad_y1' in st['groups'], str(st['groups']))
        run.check('中途截圖都有（遊覽車、破冰、揭曉、校門）', seen >= set(SHOTS.values()), str(sorted(seen)))
        run.check('沒有 JS 錯誤', not errs, '; '.join(errs[:5]))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
