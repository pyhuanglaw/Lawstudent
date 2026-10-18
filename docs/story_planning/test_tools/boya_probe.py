"""BB：博雅 101 上課時的同學長相（使用者 2026-10-18「博雅101有人禿頭 有人看起來很可怕」）。
[前置] 讀上一段玩到的存檔（經濟系 2024-09-09 早上，標題「讀取」欄位 1）；之後照玩家：手機「今天」→ 經濟學原理 → 到教室，上課中截圖、近拍每個同學。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; SAVE = sys.argv[3]
async def main():
    run = L.Run('boya_probe', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[0]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        run.setup('讀取經濟系 9/9 的存檔'); await pg.wait_for_timeout(4000)
        print(await pg.evaluate("({key:CALENDAR.dateOf(GAME.G.day).key,h:GAME.G.hour,zone:GAME.G.zone})"))
        for i in range(400):
            z = await pg.evaluate("GAME.G.zone")
            if z == 'boya':
                n = await pg.evaluate("(GAME.E.npcs||[]).length")
                if n >= 3: break
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if s['choices']:
                await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(900); continue
            if i % 20 == 0:
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
                await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
                g = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].filter(b=>!/缺席/.test(b.textContent))[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })()")
                if g: print('前往', g[2]); await L.touch_tap(cdp, g[0], g[1]); await pg.wait_for_timeout(1500)
                else: await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600)
            await pg.wait_for_timeout(700)
        await pg.wait_for_timeout(3000)
        info = json.loads(await pg.evaluate("JSON.stringify((GAME.E.npcs||[]).map((n,i)=>({i,id:String(n.id||(n.spec&&n.spec.id)||''),name:String(n.name||''),x:+n.obj.position.x.toFixed(1),z:+n.obj.position.z.toFixed(1),model:String((n.spec&&typeof n.spec.model==='string'&&n.spec.model)||'')})))"))
        print('教室裡的人', json.dumps(info, ensure_ascii=False))
        await run.shot(pg, 'boya_wide')
        await pg.evaluate("document.querySelectorAll('#hud,#dlg,#choices').forEach(e=>e.style.visibility='hidden')")
        for k, n in enumerate(info[:14]):
            await pg.evaluate("(i=>{ const E=GAME.E,n=E.npcs[i],p=n.obj.position; E.cinematic(new THREE.Vector3(p.x+Math.sin(n.obj.rotation.y)*1.3,p.y+1.35,p.z+Math.cos(n.obj.rotation.y)*1.3),new THREE.Vector3(p.x,p.y+1.15,p.z)); })(%d)" % n['i'])
            await pg.wait_for_timeout(1500); await run.shot(pg, 'npc_%02d_%s' % (k, (n['id'] or 'x')[:16]))
        await b.close()
    run.finish()
asyncio.run(main())
