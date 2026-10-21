"""ART-Y1-BOX-MIRROR-1021：大一 203 壓平的紙箱上「冬天的衣服」（BB_218：看起來左右鏡像）——修改前後同角度。
[前置] 讀使用者 9/25 存檔；[捷徑] 設旗標（BOX_WINTER_OPEN＋ev_kai_tape2 已演）、GAME.enter('dorm') 15:00、搬玩家、設鏡頭、劇情鏡頭正對紙箱。
用法：python3 box_check.py <工作樹> <URL> <輸出>"""
import os, sys, json, asyncio, math
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
FIND = """(re=>{ const R=new RegExp(re,'i'), out=[], vis=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  GAME.E.scene.traverse(o=>{ if(!o.name||!R.test(o.name)||!vis(o)) return; for(let p=o.parent;p;p=p.parent) if(p.name&&R.test(p.name)) return;
    const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const c=b.getCenter(new THREE.Vector3());
    out.push({n:o.name, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]}); }); return out; })"""
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('box_check', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        await pg.evaluate("(()=>{ const G=GAME.G; for(const k of ['KAI_TAPE','BOX_WINTER_OPEN','KAI_TAPE_GONE']) delete G.flags[k]; G.events=G.events||{}; G.events.done=G.events.done||{}; Object.assign(G.flags,{KAI_TAPE:true,BOX_WINTER_OPEN:true}); G.events.done.ev_kai_tape2=true; })()")
        await pg.evaluate("(async()=>{ GAME.G.hour=15; GAME.E.hour=15; await GAME.enter('dorm'); })()"); await pg.wait_for_timeout(15000)
        for _ in range(3):
            n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
            if not (n or shut): break
            await pg.wait_for_timeout(1500)
        run.setup('[捷徑] dorm 15:00，BOX_WINTER_OPEN＋ev_kai_tape2 已演')
        d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]")
        box = await pg.evaluate(FIND + "('^Y1_BOX')"); print('box', box, flush=True)
        fb = [x for x in box if 'FOLDED' in x['n']]
        run.check('看得到壓平的紙箱、看不到封好的紙箱', bool(fb) and not [x for x in box if 'WINTER' in x['n']], json.dumps(box))
        if fb:
            c = fb[0]['c']
            await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); })(%s)" % json.dumps([c[0] + 0.9, c[2] + 0.3]))
            for nm, d, pi in (('box_default', d0, p0), ('box_closest', 2.2, p0)):
                await pg.evaluate("(([y,d,pp])=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=d; C.pitch=pp; C.manualT=60; })(%s)" % json.dumps([math.pi / 2 + 0.3, d, pi]))
                await pg.wait_for_timeout(3000); await run.shot(pg, nm)
            # 劇情鏡頭正對紙箱（箱面朝 +x）：從走道那一側、和箱子中間一樣高
            await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([[c[0] + 1.0, c[1] + 0.1, c[2]], [c[0], c[1], c[2]]]))
            await pg.wait_for_timeout(2500); await run.shot(pg, 'box_cine_front'); await pg.evaluate("GAME.E.endCinematic()")
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
