"""BB：LAWWW2 兩件畫面驗收（體育館 1F／B1 光暈 09324bda；大一 203 紙箱＋阿凱膠帶 36c07603）。
[前置] 讀使用者 9/25 存檔；[捷徑] GAME.enter 到區域、設時間、設旗標、把玩家放到互動點前面。不是 iPhone：只看畫面。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
GLOW = """(n=>{ let m=null; GAME.E.scene.traverse(o=>{ if(o.name===n) m=o; }); return m?{n, vis:m.visible, k:m.material&&m.material.emissiveIntensity, cnt:(m.geometry&&m.geometry.attributes.position?m.geometry.attributes.position.count:0)}:null; })"""
Y1 = """(()=>{ const r=[]; GAME.E.scene.traverse(o=>{ if(/^Y1_/.test(o.name)) r.push(o.name+':'+o.visible); }); return r; })()"""
async def enter(pg, z, h):
    await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
    await pg.wait_for_timeout(15000); await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(5000)
async def closephone(pg):
    await pg.evaluate("(()=>{ try{ if(typeof PHONE!=='undefined'&&PHONE.pending) for(const k of (PHONE.pending()||[])){ try{ PHONE.answer&&PHONE.answer(k,0); }catch(e){} } }catch(e){} const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()")
    await pg.wait_for_timeout(800)
async def yaws(pg, run, tag, n=4):
    await closephone(pg)
    y0 = await pg.evaluate("GAME.E.cam.yaw")
    for k in range(n):
        await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; })(%s)" % (y0 + k * 3.14159 / 2)); await pg.wait_for_timeout(2500); await closephone(pg); await run.shot(pg, '%s_y%d' % (tag, k))
    await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; })(%s)" % y0)
async def main():
    run = L.Run('artrev', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('讀 9/25 存檔')
        for z, nm in (('gym', 'gym_glows'), ('gym_b1', 'gym_b1_glows')):
            for h in (13, 20.5):
                await enter(pg, z, h); run.setup('[捷徑] %s %.1f' % (z, h))
                g = await pg.evaluate(GLOW + "(%s)" % json.dumps(nm)); print('  ', z, h, json.dumps(g, ensure_ascii=False), flush=True)
                run.check('%s %.1f 有光暈網格' % (z, h), bool(g), json.dumps(g))
                if g: run.check('%s %.1f 白天／晚上亮度切換' % (z, h), (g['k'] == 1) == (h > 19), str(g['k']))
                await yaws(pg, run, '%s_%02d' % (z, int(h)))
        for tag, fl, done in (('closed', {}, {}), ('tape_text', {'KAI_TAPE': True}, {'ev_kai_tape2': True}), ('folded_tape', {'BOX_WINTER_OPEN': True, 'KAI_TAPE': True}, {})):
            await pg.evaluate("((fl,dn)=>{ const G=GAME.G; for(const k of ['KAI_TAPE','BOX_WINTER_OPEN','KAI_TAPE_GONE']) delete G.flags[k]; G.events=G.events||{}; G.events.done=G.events.done||{}; delete G.events.done.ev_kai_tape2; Object.assign(G.flags,fl); Object.assign(G.events.done,dn); })(%s,%s)" % (json.dumps(fl), json.dumps(done)))
            await enter(pg, 'dorm', 15); run.setup('[捷徑] dorm %s' % tag)
            st = await pg.evaluate(Y1); print('   dorm', tag, st, flush=True)
            exp = {'closed': ('Y1_BOX_WINTER:true', 'Y1_KAI_TAPE:false'), 'tape_text': ('Y1_KAI_TAPE_TEXT:true', 'Y1_KAI_TAPE_MID:false'), 'folded_tape': ('Y1_BOX_FOLDED:true', 'Y1_KAI_TAPE_MID:true')}[tag]
            run.check('203 %s 顯示對' % tag, all(e in st for e in exp), json.dumps(st))
            await yaws(pg, run, 'dorm_%s' % tag)
            it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(i=>i.y1WinterBox); return i?[i.x,i.z,i.label]:null; })()")
            print('   紙箱互動點', it, flush=True)
            if it:
                await pg.evaluate("(([x,z])=>{ const p=GAME.E.player.obj; p.position.x=x; p.position.x=x+0.55; })(%s)" % json.dumps(it[:2])); await pg.wait_for_timeout(3000); await yaws(pg, run, 'dorm_%s_box' % tag)
        await pg.evaluate("(()=>{ Object.assign(GAME.G.flags,{US_DEPARTED:true,US_ARRIVED:true}); })()")
        for h in (17.75, 19.0):
            await enter(pg, 'us_shared', h); run.setup('[捷徑] us_shared %.2f（旗標 US_DEPARTED、US_ARRIVED；日期仍是 9/25 存檔那天）' % h)
            print('   us_shared', h, await pg.evaluate("GAME.G.zone"), flush=True)
            await yaws(pg, run, 'c208_%02d' % int(h))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
