"""X79（PERF-CAMPUS-DAY-1027，LAWWW2-C 2026-10-27）：走路時很長的那幾格在做什麼。CPU profiler 開著走第一段（校門 → 椰林大道），把每一格的取樣照時間分到格子裡，列出最長幾格的前幾名函式（self／inclusive）。"""
import asyncio, json, sys, collections
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[2]; X_END = float(sys.argv[3]) if len(sys.argv) > 3 else -40   # 用法：python3 tools/shots/x79_prof.py 工作樹 URL [走到 x 多少停]（有 Z3.warmup 的會先等它做完）
SETUP = """(()=>{ const E=GAME.E; window.__fr=[]; window.__walk=false; const orig=E.render; let x=-115;
  E.render=function(){ const t0=performance.now(); const P=E.player.obj; if(window.__walk){ x+=1.2; P.position.x=x; P.position.z=0.5; P.rotation.y=Math.PI/2; E.cam.yaw=P.rotation.y+Math.PI; }
    orig.apply(this,arguments); window.__fr.push({t:t0, r:performance.now()-t0, x:+P.position.x.toFixed(1)}); }; })()"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2028-09-14')")
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': {'x': -115, 'z': 0.5, 'lv': 0}}, quiet_events=True)
        await pg.evaluate(SETUP); await pg.wait_for_timeout(17000); await L.close_panels(pg, cdp)
        for _ in range(80):
            w = await pg.evaluate("GAME.E.lastWarmup||null")
            if not w or w.get('done'): break
            await pg.wait_for_timeout(5000)
        await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 500})
        tpage = await pg.evaluate("performance.now()"); await cdp.send('Profiler.start'); await pg.evaluate("window.__walk=true; window.__fr=[]")
        for _ in range(400):
            if await pg.evaluate(f"GAME.E.player.obj.position.x>={X_END}"): break
            await pg.wait_for_timeout(1000)
        prof = (await cdp.send('Profiler.stop'))['profile']; fr = await pg.evaluate("window.__fr"); await b.close()
    nodes = {n['id']: n for n in prof['nodes']}
    parent = {}
    for n in prof['nodes']:
        for c in n.get('children', []): parent[c] = n['id']
    def label(nid):
        cf = nodes[nid]['callFrame']; return f"{cf.get('functionName') or '(anon)'} {cf.get('url','').rsplit('/',1)[-1]}:{cf.get('lineNumber',-1)+1}"
    def stack(nid, k=6):
        out = []
        while nid in nodes and len(out) < k:
            l = label(nid)
            if not l.startswith('(root)'): out.append(l)
            nid = parent.get(nid)
        return out
    ts = []; t = tpage
    for d in prof['timeDeltas']: t += d / 1000; ts.append(t)
    frames = [(fr[i-1]['t'], fr[i]['t'], fr[i]['t'] - fr[i-1]['t'], fr[i-1]['r'], fr[i]['x']) for i in range(1, len(fr))]
    frames.sort(key=lambda f: -f[2])
    med = sorted(f[2] for f in frames)[len(frames)//2]
    print('frames', len(frames), 'median', round(med))
    for (a, b_, dt, r, x) in frames[:5]:
        c = collections.Counter(); inc = collections.Counter()
        for nid, tt in zip(prof['samples'], ts):
            if a <= tt < b_:
                c[label(nid)] += 0.5
                for l in set(stack(nid, 40)): inc[l] += 0.5
        print(f'== frame dt {dt:.0f} ms（render {r:.0f}）x={x}  samples {sum(c.values()):.0f} ms')
        for l, ms in c.most_common(6): print(f'    self {ms:6.0f}  {l}')
        for l, ms in inc.most_common(14): print(f'    incl {ms:6.0f}  {l}')
asyncio.run(main())
