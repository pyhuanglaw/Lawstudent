"""霖澤館上下樓梯、搭電梯時不能看到大片天空（2026-10-11 使用者回報：「霖澤 上樓梯或搭電梯移動樓層的時候會出現天空」）。
原因：剖面視角（engine3d.js 的 updateLevelVis）在鏡頭高過二樓地板、人還沒到二樓地板下 0.8 m 時，把二樓整層藏起來，空出來的地方看到天空球。
量法：把天空球換成洋紅色，數畫面上洋紅像素的比例。修改前（v9.4.2）：平台 25%、第二跑 37–48%；修改後：0%。
每一點門檻 3%：往下看大廳時，南面玻璃底下還有一條窗景板沒蓋到的縫會透出一點天空（約 1.5%，屬於窗景問題）。
用法：python3 tests/levels_no_sky.py http://127.0.0.1:8765/index.html?turbo [輸出資料夾]"""
import asyncio, sys, json
sys.path.insert(0, '/home/user/Lawstudent/tests')
from playwright.async_api import async_playwright
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html?turbo'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/levels_no_sky'
# 霖澤館樓梯：x -7.6..-5.6；第一跑 z 5.0→1.36（y 0→2.18）、平台 z -0.04..1.36、第二跑 z -0.04→-3.4（y 2.18→4.2）
SPOTS = [('linze', 'f1_mid', -6.6, 3.2, 0, 0.0), ('linze', 'landing', -6.6, 0.7, 0, 0.0), ('linze', 'f2_low', -6.6, -0.8, 0, 0.0), ('linze', 'f2_mid', -6.6, -1.7, 0, 0.0),
         ('linze', 'f2_high', -6.6, -2.7, 1, 0.0), ('linze', 'top', -6.6, -4.2, 1, 0.0), ('linze', 'f2_down_view', -6.6, -1.7, 0, 3.14)]
async def sky_ratio(pg):
    # 用引擎自己的天空：把天空球換成純洋紅，數洋紅像素
    return await pg.evaluate("""(()=>{ const E=GAME.E; const sk=E.sky; const u=sk.material.uniforms; const keep=[u.top.value.clone(),u.mid.value.clone(),u.bot.value.clone()]; u.top.value.set(1,0,1); u.mid.value.set(1,0,1); u.bot.value.set(1,0,1); const bg=E.scene.background; const bk=bg&&bg.isColor?bg.clone():null; if(bk) bg.set(1,0,1);
      E.render&&E.render(); const c=E.canvas; const g=document.createElement('canvas'); g.width=160; g.height=Math.round(160*c.height/c.width); const x=g.getContext('2d'); x.drawImage(c,0,0,g.width,g.height); const d=x.getImageData(0,0,g.width,g.height).data; let n=0, v=0; for(let i=0;i<d.length;i+=4){ if(d[i]>200&&d[i+1]<60&&d[i+2]>200) n++; }
      if(bk) bg.copy(bk); u.top.value.copy(keep[0]); u.mid.value.copy(keep[1]); u.bot.value.copy(keep[2]); return n/(g.width*g.height)+v/(g.width*g.height); })()""")
async def main():
    run = L.Run('probe_sky', OUT); res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); assert await L.wait_loaded(pg)
        run.setup('讀檔：第三天 10:00 霖澤館大廳（事件關閉）')
        await L.load_state(pg, {'day':3,'weekday':5,'hour':10.0,'zone':'linze','pos':{'x':0,'z':5,'yaw':3.14,'lv':0},'flags':{'introDone':True,'classDone':True,'afternoonDone':True,'metAn':True,'guideTip':True}}, quiet_events=True)
        await pg.wait_for_timeout(5000)
        has = await pg.evaluate("!!(GAME.E.canvas&&GAME.E.render)")
        print('renderer/render available:', has)
        for zone, name, x, z, lv, yaw in SPOTS:
            await pg.evaluate("((x,z,lv,yaw)=>{ const E=GAME.E; E.placeAt(E.player,x,z,lv); E.player.obj.rotation.y=Math.PI+yaw; E.cam.yaw=yaw; E.cam.manualT=0; })(%s,%s,%s,%s)" % (x, z, lv, yaw))
            await pg.wait_for_timeout(2500)
            r = await sky_ratio(pg) if has else -1
            info = await pg.evaluate("(()=>{ const E=GAME.E; return {py:+E.player.obj.position.y.toFixed(2), lv:E.player.lv|0, cy:+E.camera.position.y.toFixed(2), vis:(E.zone.levelGroups||[]).map(l=>l.group.visible)}; })()")
            print(name, 'sky=%.3f' % r, json.dumps(info)); res.append((name, r, info))
            await run.shot(pg, name)
        # 電梯：一樓叫電梯、搭到二樓，途中每 0.5 秒量一次
        run.setup('一樓電梯：走到叫車點、按互動、選 2F')
        await pg.evaluate("GAME.E.placeAt(GAME.E.player,4.6,-3.9,0); GAME.E.cam.yaw=0")
        # 機器忙的時候（SwiftShader 1～4 fps）互動按鈕、選單不一定 1.5 秒就出來：等到出現（各最多 10 秒），不是固定等（LAWWW-B 10-24：release_suite 在忙的機器上選單是空的、BB 那台 PASS）
        lab = ''
        for i in range(20):
            await pg.wait_for_timeout(500)
            lab = await pg.evaluate("document.getElementById('interact').textContent")
            if '電梯' in lab: break
        print('interact:', lab)
        await L.tap(pg, cdp, '#interact')
        btns = []
        for i in range(20):
            await pg.wait_for_timeout(500)
            btns = await pg.evaluate("Array.from(document.querySelectorAll('#choices button')).map(b=>b.textContent)")
            if btns: break
        print('choices:', btns)
        idx = next((i for i, t in enumerate(btns) if '2F' in t), None)
        if idx is not None:
            await pg.evaluate("document.querySelectorAll('#choices button')[%d].click()" % idx)
            for k in range(16):
                await pg.wait_for_timeout(700)
                r = await sky_ratio(pg)
                info = await pg.evaluate("(()=>{ const E=GAME.E; return {py:+E.player.obj.position.y.toFixed(2), lv:E.player.lv|0, cy:+E.camera.position.y.toFixed(2), vis:(E.zone.levelGroups||[]).map(l=>l.group.visible)}; })()")
                print('elev', k, 'sky=%.3f' % r, json.dumps(info)); res.append(('elev%d' % k, r, info))
                if k in (2, 5, 8): await run.shot(pg, 'elev%d' % k)
        await ctx.close(); await b.close()
    worst = max(res, key=lambda t: t[1])
    run.check('上下樓梯、搭電梯每一個位置的天空像素都 < 3%', worst[1] < 0.03, 'worst=%s %.3f' % (worst[0], worst[1]))
    run.check('有量到電梯途中', any(n.startswith('elev') for n, _, _ in res))
    print('errors:', errs[:3])
    return run.finish()
sys.exit(asyncio.run(main()))
