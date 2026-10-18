"""BB：BUG-KX-MALE-1018（3c6207b6：可昕用 char.kexin）——遊戲裡拍可昕的 3D。
A [前置] 讀新遊戲玩到 9/1 的存檔，讓事件模式自己跳（9/5 會計課、9/9 經原、9/18 E07、9/20 E05…）到 9/21；可昕在 3D 場景裡就拍：原畫面一張＋把 UI 藏起來的近拍一張（E.cinematic，拍完回 follow）。
B [前置／捷徑] 讀檔到 2024-11-06 19:46 醉月湖南岸（E12 約好、她站在湖邊）：拍。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; SAVE = sys.argv[3]
KX = "(()=>{ const n=GAME.npc&&GAME.npc.kexin; if(!n||!n.obj||!GAME.E.npcs.includes(n)) return null; const p=n.obj.position; return {x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2),ry:+n.obj.rotation.y.toFixed(2),vis:n.obj.visible,model:String((n.spec&&n.spec.model)||(n.obj.userData&&n.obj.userData.charModel)||'')}; })()"
async def shoot(pg, run, tag):
    await run.shot(pg, tag + '_screen')
    await pg.evaluate("document.querySelectorAll('#hud,#dlg,#choices,#adv,#advBg,#joy,#interact,#btnPhone,#btnMenu,#btnBigMap,#minimap,.toast').forEach(e=>{ e.dataset.bbv=e.style.visibility; e.style.visibility='hidden'; })")
    for k, (d, hgt, look) in enumerate(((1.4, 1.45, 1.35), (3.2, 1.2, 0.9))):
        await pg.evaluate("((d,h,l)=>{ const E=GAME.E,n=GAME.npc.kexin,p=n.obj.position,r=n.obj.rotation.y; E.cinematic(new THREE.Vector3(p.x+Math.sin(r)*d,p.y+h,p.z+Math.cos(r)*d),new THREE.Vector3(p.x,p.y+l,p.z)); })(%s,%s,%s)" % (d, hgt, look))
        await pg.wait_for_timeout(2200); await run.shot(pg, tag + ('_face' if k == 0 else '_body'))
    await pg.evaluate("(()=>{ GAME.E.cam.mode='follow'; document.querySelectorAll('[data-bbv]').forEach(e=>{ e.style.visibility=e.dataset.bbv||''; delete e.dataset.bbv; }); })()")
async def main():
    run = L.Run('kx3d_probe', OUT); shots = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('A 讀新遊戲玩到 9/1 的存檔，事件模式自己跳'); await pg.wait_for_timeout(3000)
        t0 = time.time()
        while time.time() - t0 < 1500:
            key = await pg.evaluate("CALENDAR.dateOf(GAME.G.day).key")
            if key >= '2024-09-21': break
            k = await pg.evaluate(KX)
            if k and k['vis'] and key not in shots and len(shots) < 5:
                await pg.wait_for_timeout(1200); k = await pg.evaluate(KX)
                if k: shots[key] = k; print('A 可昕在', key, await pg.evaluate("GAME.G.zone"), json.dumps(k), flush=True); await shoot(pg, run, 'A_%s' % key)
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
            if s['choices']: await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(800); continue
            await pg.wait_for_timeout(500)
        d = await pg.evaluate("STORY.dayOfKey('2024-11-06')")
        st = {'stage': 'econ', 'zone': 'campus', 'day': d, 'weekday': 3, 'hour': 19.77, 'money': 12000, 'pos': {'x': -30.5, 'z': -97.2, 'yaw': 1.57}, 'home': {'at': False, 'base': True, 'day': d},
              'contacts': {'kexin': d - 60}, 'flags': {'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'Y0_MOVED_OUT': True, 'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17', 'KX_FIRST_MSG': True, 'fundsV2': 1, 'E12_ASKED': True, 'Y0_STICKY': True},
              'events': {'done': {'ev_y0_e30': 1, 'ev_y0_e26': 1, 'ev_y0_e02': 1, 'ev_y0_e30_note': 1}, 'last': {}, 'count': 4}}
        run.setup('B 讀檔到 2024-11-06 19:46 醉月湖南岸，離可昕 5 m（E12 約好）'); await L.load_state(pg, st)
        for _ in range(30):
            await pg.wait_for_timeout(1000); k = await pg.evaluate(KX)
            if k: break
        print('B 可昕', json.dumps(k), flush=True)
        if k: await shoot(pg, run, 'B_1106')
        run.check('A 9/2～9/20 事件模式裡拍到可昕（%d 處）' % len(shots), len(shots) >= 1, json.dumps(shots))
        run.check('B 11/6 醉月湖可昕在 3D 裡', bool(k), json.dumps(k))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
