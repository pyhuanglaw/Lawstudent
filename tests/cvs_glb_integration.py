"""全日便利商店室內的正式模型（第二個 AI：Blender GLB bldg.cvs_interior）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。

  1. 正式模型接上（zone.formal）、程序化備用模型藏起來；會淡出的牆（WALL_*）有前後左右四面。
  2. 導航格和 ?nobldg 完全相同；結帳 (3.2,−0.6)、離開 (0,4.2) 兩個互動點不變；貨架、雙面貨架、櫃檯、飲料櫃擋住，走道、出生點、結帳位置走得到。
  3. 鏡頭在前牆外：前牆淡出、後牆不淡出（自我檢查：故意把前牆 dir 弄反，淡出檢查必須失敗）。
  4. 走道分類牌都有 canvas 字；LED 燈條、飲料櫃背光一直亮；自動門外的窗景和窗戶同一個材質（跟著時段換）。
[前置／捷徑]：用遊戲自己的讀檔把玩家放進便利商店（GAME.applySave），關掉條件事件；直接設鏡頭位置測牆面淡出。
用法：python3 tests/cvs_glb_integration.py http://127.0.0.1:8765/index.html
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'cvs_glb_integration')
WAIT_FORMAL = "(async()=>{ for(let i=0;i<240;i++){ if(GAME.E.zone&&GAME.E.zone.formal) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"


async def check(pg, run, formal):
    run.setup('讀檔到便利商店出生點 (0,3.5) 11:00，關掉條件事件')
    await PL.load_state(pg, {'zone': 'cvs', 'hour': 11, 'pos': {'x': 0, 'z': 3.5, 'yaw': 3.1416}}, quiet_events=True)
    if formal: run.check('正式模型接上（zone.formal）', await pg.evaluate(WAIT_FORMAL))
    else:
        await pg.wait_for_timeout(3000); run.check('?nobldg：沒有載入正式模型', not await pg.evaluate("!!GAME.E.zone.formal"))
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const fb=z.group.children.find(o=>o.name==='fallback');
        const sides={}; for(const w of z.walls){ const d=w.userData.dir; const k=d?(Math.abs(d.x)>0.5?(d.x>0?'left':'right'):(d.z>0?'back':'front')):'?'; sides[k]=(sides[k]||0)+1; }
        const it=GAME.E.interactables.map(i=>[i.label,i.x,i.z]); return {fb:fb?fb.visible:null, sides, it}; })()""")
    if formal:
        run.check('程序化備用模型藏起來', info['fb'] is False, json.dumps(info['fb']))
        run.check('會淡出的牆有前後左右四面（WALL_*）', all(info['sides'].get(k, 0) > 0 for k in ('front', 'back', 'left', 'right')), json.dumps(info['sides']))
    else:
        run.check('?nobldg：程序化備用模型看得到', info['fb'] is True, json.dumps(info['fb']))
    it = {l: (x, z) for l, x, z in info['it']}
    run.check('結帳 (3.2,−0.6)、離開 (0,4.2) 不變', it.get('結帳：飯糰／咖啡／飲料') == (3.2, -0.6) and it.get('離開便利商店') == (0, 4.2), json.dumps(info['it'], ensure_ascii=False))
    for (x, z, name) in ((-4.5, -4.2, '後牆貨架'), (-2.0, 0.0, '左邊雙面貨架'), (2.0, 0.0, '右邊雙面貨架'), (4.0, -1.5, '櫃檯'), (5.6, 2.0, '飲料櫃')):
        run.check(f'導航：{name} ({x},{z}) 擋住', not await pg.evaluate(f"GAME.E.nav.free({x},{z})"))
    for (x, z, name) in ((0.0, 3.5, '出生點'), (3.2, -0.6, '結帳位置'), (0.0, 0.0, '中間走道'), (-4.0, -2.0, '左邊走道'), (4.0, 1.0, '飲料櫃前')):
        run.check(f'導航：{name} ({x},{z}) 走得到', await pg.evaluate(f"GAME.E.nav.free({x},{z})"))
    if formal:
        fade = await pg.evaluate("""(async()=>{ const E=GAME.E, z=E.zone; E.cinematic(new THREE.Vector3(0,2.2,8.0),new THREE.Vector3(0,1.4,0)); E.camera.position.set(0,2.2,8.0); E.cam.look=new THREE.Vector3(0,1.4,0); E.camera.lookAt(E.cam.look);
            const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250));
            const o={front:[],back:[]}; for(const w of z.walls){ const d=w.userData.dir; if(!d) continue; if(d.z<-0.5) o.front.push(+w.material.opacity.toFixed(2)); if(d.z>0.5) o.back.push(+w.material.opacity.toFixed(2)); } E.endCinematic(); return o; })()""")
        run.check('鏡頭在前牆外：前牆淡出', len(fade['front']) > 0 and max(fade['front']) < 0.5, json.dumps(fade))
        run.check('鏡頭在前牆外：後牆不淡出', len(fade['back']) > 0 and min(fade['back']) > 0.9, json.dumps(fade['back']))
        neg = await pg.evaluate("""(async()=>{ const E=GAME.E, z=E.zone; const fw=z.walls.filter(w=>w.userData.dir&&w.userData.dir.z<-0.5); for(const w of fw) w.userData.dir.z=1;
            E.cinematic(new THREE.Vector3(0,2.2,8.0),new THREE.Vector3(0,1.4,0)); E.camera.position.set(0,2.2,8.0); const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250));
            const op=fw.map(w=>+w.material.opacity.toFixed(2)); for(const w of fw) w.userData.dir.z=-1; E.endCinematic(); return op; })()""")
        run.check('（自我檢查）前牆 dir 故意弄反時，淡出檢查會失敗', len(neg) > 0 and max(neg) > 0.5, json.dumps(neg))
        ex = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const mats={}, signs={}; z.group.traverse(o=>{ if(!o.isMesh) return; mats[o.material.name]=o.material; if(/^SIGN_FACE_aisle/.test(o.name)) signs[o.name]=!!(o.material.map&&o.material.map.image&&o.material.map.image.getContext); });
            const dv=z.winParts&&z.winParts.find(p=>Math.abs(p.at.z-4.5)<0.01&&Math.abs(p.at.x)<0.01); const same=!!(dv&&z.wins&&z.wins[0]&&dv.obj.material===z.wins[0].material);
            return {signs, led:mats.cvs_led?+mats.cvs_led.emissiveIntensity.toFixed(2):-1, cooler:mats.cvs_cooler_light?+mats.cvs_cooler_light.emissiveIntensity.toFixed(2):-1, goodsGlow:mats.cvs_goods?mats.cvs_goods.customProgramCacheKey()==='cvsVcGlow':false, doorView:same}; })()""")
        run.check('走道分類牌（4 塊兩面＝8 面）都有 canvas 字', len(ex['signs']) == 8 and all(ex['signs'].values()), json.dumps(ex['signs']))
        run.check('LED 燈條、飲料櫃背光亮著；商品頂點色有自發光', ex['led'] >= 1.0 and ex['cooler'] >= 1.0 and ex['goodsGlow'], json.dumps(ex))
        run.check('自動門外的窗景和窗戶同一個材質（跟著時段換）', ex['doorView'], json.dumps(ex['doorView']))
    await run.shot(pg, 'cvs_' + ('formal' if formal else 'nobldg'))
    return await pg.evaluate(NAV_HASH)


async def main():
    run = PL.Run('cvs_glb_integration', OUT); hashes = {}
    async with async_playwright() as p:
        for formal in (True, False):
            url = URL if formal else (URL + ('&' if '?' in URL else '?') + 'nobldg')
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            await pg.goto(url); run.check(('一般網址' if formal else '?nobldg') + '：遊戲載入', await PL.wait_loaded(pg))
            hashes[formal] = await check(pg, run, formal)
            run.check(('一般網址' if formal else '?nobldg') + '：沒有 JS 錯誤', not errs, '; '.join(errs[:3]))
            await b.close()
    run.check('導航格：正式模型和程序化版完全相同', hashes[True] == hashes[False], json.dumps([hashes[True], hashes[False]]))
    sys.exit(run.finish())


asyncio.run(main())
