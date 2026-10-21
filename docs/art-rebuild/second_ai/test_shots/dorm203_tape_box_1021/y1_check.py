"""大一 203：壓平的紙箱（新位置：衣櫃門前）、阿凱的國界膠帶（4.8 cm、「國界」／「法律系免簽」）——BB_218 不通過那幾個角度。
[前置] 讀使用者 9/25 存檔；[捷徑] 設旗標、GAME.enter('dorm')、搬玩家、設鏡頭。用法：python3 y1_check.py <工作樹> <URL> <輸出>"""
import os, sys, json, asyncio, math
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
FIND = """(re=>{ const R=new RegExp(re,'i'), out=[], vis=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  GAME.E.scene.traverse(o=>{ if(!o.name||!R.test(o.name)||!vis(o)) return; for(let p=o.parent;p;p=p.parent) if(p.name&&R.test(p.name)) return;
    const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const c=b.getCenter(new THREE.Vector3());
    out.push({n:o.name, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]}); }); return out; })"""
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('y1_check', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        for tag, fl, done in (('tape_mid', {'KAI_TAPE': True}, {}), ('tape_text_folded', {'KAI_TAPE': True, 'BOX_WINTER_OPEN': True}, {'ev_kai_tape2': True})):
            await pg.evaluate("((fl,dn)=>{ const G=GAME.G; for(const k of ['KAI_TAPE','BOX_WINTER_OPEN','KAI_TAPE_GONE']) delete G.flags[k]; G.events=G.events||{}; G.events.done=G.events.done||{}; delete G.events.done.ev_kai_tape2; Object.assign(G.flags,fl); Object.assign(G.events.done,dn); })(%s,%s)" % (json.dumps(fl), json.dumps(done)))
            await pg.evaluate("(async()=>{ GAME.G.hour=15; GAME.E.hour=15; await GAME.enter('dorm'); })()"); await pg.wait_for_timeout(15000)
            run.setup('[捷徑] dorm 15:00 %s' % tag)
            d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]")
            box = await pg.evaluate(FIND + "('^Y1_BOX')"); tape = await pg.evaluate(FIND + "('^Y1_KAI_TAPE')"); print(tag, 'box', box, 'tape', tape, flush=True)
            if tag == 'tape_text_folded':
                fb = [x for x in box if 'FOLDED' in x['n']]
                if fb:
                    c = fb[0]['c']
                    await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); })(%s)" % json.dumps([c[0] + 0.9, c[2] + 0.3]))
                    for nm, d, pi in (('box_default', d0, p0), ('box_closest', 2.2, p0)):
                        await pg.evaluate("(([y,d,pp])=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=d; C.pitch=pp; C.manualT=60; })(%s)" % json.dumps([math.pi / 2 + 0.3, d, pi]))
                        await pg.wait_for_timeout(3000); await run.shot(pg, '%s_%s' % (tag, nm))
            mids = [x for x in tape if x['n'] in ('Y1_KAI_TAPE_MID', 'Y1_KAI_TAPE_TEXT')]
            if mids:
                c = mids[0]['c']
                await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); })(%s)" % json.dumps([c[0] - 0.6, c[2]]))
                for nm, d, pi, yaw in (('tape_default', d0, p0, -math.pi / 2), ('tape_closest_down', 2.2, 0.95, -math.pi / 2)):
                    await pg.evaluate("(([y,d,pp])=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=d; C.pitch=pp; C.manualT=60; })(%s)" % json.dumps([yaw, d, pi]))
                    await pg.wait_for_timeout(3000); await run.shot(pg, '%s_%s' % (tag, nm))
                await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([[c[0] - 0.35, 1.25, c[2] + 0.15], c]))
                await pg.wait_for_timeout(2500); await run.shot(pg, '%s_tape_cine_close' % tag); await pg.evaluate("GAME.E.endCinematic()")
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
