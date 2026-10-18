"""正式模型的夜間登記：白天進校園 → 進宿舍 → 回校園 → 天黑，大一女舍（campus_freshman.glb）的窗有沒有亮（ck_glass 的 emissiveIntensity）。
[前置／捷徑] 用 GAME.applySave 直接進校園、GAME.enter 換區域、E.applyTime 跳時間（量的是材質狀態，不是走路流程）。
用法：python3 night_rereg_check.py <url>"""
import asyncio, json, sys
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
PROBE = "(()=>{ let v=null; GAME.E.scene.traverse(o=>{ if(v===null&&o.isMesh&&o.material&&o.material.name==='ck_glass'&&/fd_glass/.test(o.name)) v=o.material.emissiveIntensity; }); return v; })()"
async def main():
    url = sys.argv[1]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(url)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        async def wait_glass():
            for i in range(80):
                v = await pg.evaluate(PROBE)
                if v is not None: return v
                await pg.wait_for_timeout(500)
            return None
        print('[前置／捷徑] applySave：校園 11:00')
        await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,{zone:'campus',hour:11,day:10,pos:{x:-108,z:53,yaw:3.14}}); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()")
        r = {}
        r['1_day_first'] = await wait_glass()
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.applyTime(h); })(20.5)"); await pg.wait_for_timeout(800)
        r['2_night_first'] = await pg.evaluate(PROBE)
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.applyTime(h); })(11)"); await pg.wait_for_timeout(500)
        print('[前置／捷徑] GAME.enter：進宿舍、再回校園（白天）')
        await pg.evaluate("void GAME.enter('dorm_hall')"); await pg.wait_for_timeout(4000)
        await pg.evaluate("void GAME.enter('campus',{x:-108,z:53,yaw:3.14})"); await pg.wait_for_timeout(1000)
        r['3_day_again'] = await wait_glass()
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.applyTime(h); })(20.5)"); await pg.wait_for_timeout(800)
        r['4_night_again'] = await pg.evaluate(PROBE)
        print(json.dumps(r), 'errors:', errs[:3])
        ok = r['2_night_first'] == 1 and r['4_night_again'] == 1 and r['3_day_again'] == 0
        print('PASS' if ok else 'FAIL', '回到校園以後天黑，大一女舍的窗要亮（emissiveIntensity 1）；白天要暗（0）')
        await b.close()
asyncio.run(main())
