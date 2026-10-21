"""BB（帳號 A）2026-10-21：ART-ECON-3D-GAP-1021 第一批（LAWWW2 f858b47c → 開發分支 ae968ffb）榕樹氣根「不再是黑線」——修正前後對照。
lamppost_probe 那一輪站在椰林大道，法學院那一區（黑森林）沒有載入，榕樹 0 棵、沒拍到；這支直接站到黑森林北邊、溫州街小公園旁邊。
【前置】讀使用者 9/25 存檔，改到 13:00（白天）：campus＝法學院廣場南邊、黑森林北側 (70,-60)；wenzhou＝小公園北側。quiet_events。
讀檔前把 TK.tree 包一層記下樹種（sp 'banyan' 或 dark ≤ 0.75＝榕樹；正式模型 street_trees.glb 的 banyan_a）。劇情鏡頭（只動鏡頭）從 8 m 外、1.6 m 高拍樹幹和氣根。
修正前：同一版開發分支，只把 street_trees.glb／json 換成 ae968ffb~1 的（scratchpad abserve.py）。畫面只記看到什麼：場景美術 ART_APPROVED 只有使用者能標。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 banyan_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json> <now|old>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
TAG = sys.argv[4] if len(sys.argv) > 4 else 'now'
def say(*a): print(' '.join(str(x) for x in a), flush=True)

WRAP = """(()=>{ if(window.__TW) return; window.__TW=1; window.__TREES=[];
  const hook=()=>{ if(typeof TK==='undefined'||!TK.tree||TK.tree.__bb) return false; const tr=TK.tree; const f=function(h,seed,o){ const t=tr.apply(this,arguments); try{ const dk=(o&&o.dark)||1; window.__TREES.push({t:t, sp:(o&&o.sp)||(dk<=0.75?'banyan':'camphor'), h:h}); }catch(e){} return t; }; f.__bb=1; TK.tree=f; return true; };
  if(!hook()){ const iv=setInterval(()=>{ if(hook()) clearInterval(iv); },50); } })()"""
POS = """(()=>{ const out=[]; for(const r of (window.__TREES||[])){ if(r.sp!=='banyan') continue; const t=r.t; if(!t||!t.getWorldPosition) continue; const p=t.getWorldPosition(new THREE.Vector3()); out.push({x:+p.x.toFixed(2), z:+p.z.toFixed(2), h:+(+r.h).toFixed(1)}); } return {n:(window.__TREES||[]).length, banyan:out}; })()"""
PLACES = {'campus': {'pos': {'x': 70, 'z': -60, 'yaw': 0, 'lv': 0}, 'note': '黑森林（法學院廣場南邊）'},
          'wenzhou': {'pos': None, 'note': '溫州街小公園中間的大樹（zones3d.js 804 行 sp:banyan）'}}


async def one(p, run, base, zone):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); res = {'zone': zone, 'tag': TAG}
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await pg.evaluate(WRAP)
        st = json.loads(json.dumps(base)); G = st.get('G', st); G.update({'hour': 13.0, 'zone': zone, 'pos': PLACES[zone]['pos']})
        await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(12000)
        run.setup('[前置] %s %s：使用者 9/25 存檔改到 13:00 %s（quiet_events）' % (TAG, zone, PLACES[zone]['note']))
        r = await pg.evaluate(POS); res['trees'] = r
        say('   %s %s：樹 %d 棵，榕樹 %d 棵：%s' % (TAG, zone, r['n'], len(r['banyan']), json.dumps(r['banyan'][:12], ensure_ascii=False)))
        run.check('%s %s：找得到榕樹' % (TAG, zone), len(r['banyan']) > 0, json.dumps(r, ensure_ascii=False)[:300])
        P = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [o.x,o.z]; })()")
        picks = sorted(r['banyan'], key=lambda t: (t['x'] - P[0]) ** 2 + (t['z'] - P[1]) ** 2)[:3]
        for i, t in enumerate(picks):
            for side, (dx, dz) in (('n', (0, 8)), ('w', (-8, 0))):
                cam = [t['x'] + dx, 1.6, t['z'] + dz]; look = [t['x'], 3.0, t['z']]
                await pg.evaluate("(([c,l])=>{ GAME.E.cinematic(new THREE.Vector3(...c), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([cam, look]))
                await pg.wait_for_timeout(3500); await run.shot(pg, '%s_%s_tree%d_%s' % (TAG, zone, i, side))
        await pg.evaluate("(()=>{ try{ GAME.E.endCinematic(); }catch(e){} })()")
        res['picked'] = picks
        run.check('%s %s：沒有 JS 例外' % (TAG, zone), not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e:
        res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s %s：測試跑完' % (TAG, zone), False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return res


async def main():
    run = L.Run('banyan_' + TAG, OUT); base = json.load(open(SAVE, encoding='utf-8')); out = []
    async with async_playwright() as p:
        for zone in ('campus', 'wenzhou'):
            say('== %s %s' % (TAG, zone)); out.append(await one(p, run, base, zone))
            json.dump(out, open(os.path.join(OUT, 'banyan_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
