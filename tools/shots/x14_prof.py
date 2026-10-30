"""X14 換區域卡一下（PERF-ZONE-ENTER-1018，LAWWW2-C 2026-10-27）：公館 → 溫州街 → 咖啡廳 → 溫州街，每一次 CPU profiler 開著，
把取樣照時間分到每一格（requestAnimationFrame 的間隔），列出最長幾格在做什麼（self／inclusive），以及那一格在 GAME.enter 的哪一段（黑畫面、淡入後）。
用法：python3 tools/shots/x14_prof.py 工作樹 URL [--desktop] [秒數] [--route 區域,區域,…]（PERF-ZONE-ENTER-1018 第三輪加 --route，LAWWW2-B 10-30：室內）"""
import asyncio, json, sys, collections
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[2]; DESKTOP = '--desktop' in sys.argv
REC = int([a for a in sys.argv[3:] if a.isdigit()][0]) if [a for a in sys.argv[3:] if a.isdigit()] else 20
ROUTE = sys.argv[sys.argv.index('--route') + 1].split(',') if '--route' in sys.argv else None
HOOK = """(()=>{ const P=window.__fp={frames:[]}; let last=performance.now(); const tick=()=>{ const t=performance.now(); P.frames.push([last,t]); last=t; requestAnimationFrame(tick); }; requestAnimationFrame(tick); })()"""
def analyze(prof, tpage, frames, t_enter0, t_enter1, label):
    nodes = {n['id']: n for n in prof['nodes']}; parent = {}
    for n in prof['nodes']:
        for c in n.get('children', []): parent[c] = n['id']
    def lab(nid):
        cf = nodes[nid]['callFrame']; return f"{cf.get('functionName') or '(anon)'} {cf.get('url','').rsplit('/',1)[-1].split('?')[0]}:{cf.get('lineNumber',-1)+1}"
    def stack(nid):
        out = []
        while nid in nodes:
            l = lab(nid)
            if not l.startswith('(root)'): out.append(l)
            nid = parent.get(nid)
        return out
    ts = []; t = tpage
    for d in prof['timeDeltas']: t += d / 1000; ts.append(t)
    fr = sorted([f for f in frames if f[1] >= t_enter0], key=lambda f: -(f[1] - f[0]))
    print(f'=== {label}：GAME.enter {t_enter1 - t_enter0:.0f} ms；之後 {REC} 秒共 {len([f for f in frames if f[1] >= t_enter0])} 格')
    for (a, b, ) in fr[:4]:
        c = collections.Counter(); inc = collections.Counter()
        for nid, tt in zip(prof['samples'], ts):
            if a <= tt < b:
                c[lab(nid)] += 0.5
                for l in set(stack(nid)): inc[l] += 0.5
        where = '黑畫面（enter 還沒結束）' if b <= t_enter1 else ('淡入時' if a < t_enter1 + 600 else f'淡入後 {(a - t_enter1) / 1000:.1f} 秒')
        print(f'  -- 一格 {b - a:.0f} ms，從 enter 開始 {(a - t_enter0) / 1000:.1f} 秒起（{where}）')
        for l, ms in c.most_common(5): print(f'       self {ms:6.0f}  {l}')
        for l, ms in [x for x in inc.most_common(40) if x[1] >= 50][:16]: print(f'       incl {ms:6.0f}  {l}')
async def main():
    async with async_playwright() as p:
        if DESKTOP:
            b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
            ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1); pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg)
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        else:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        await L.load_state(pg, {'zone': 'gongguan', 'hour': 15.0, 'weather': 'clear', 'pos': None}, quiet_events=True)
        await pg.wait_for_timeout(25000); await pg.evaluate(HOOK)
        await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 500})
        plan = [(z, '→ %s（第 %d 站）' % (z, i + 1)) for i, z in enumerate(ROUTE)] if ROUTE else (('wenzhou', '公館 → 溫州街（第一次）'), ('cafe', '溫州街 → 咖啡廳（第一次）'), ('wenzhou', '咖啡廳 → 溫州街（第二次）'))
        for zone, label in plan:
            tpage = await pg.evaluate("performance.now()"); await cdp.send('Profiler.start')
            t01 = await pg.evaluate("(async()=>{ const t=performance.now(); await GAME.enter('%s'); return [t, performance.now()]; })()" % zone)
            await pg.wait_for_timeout(REC * 1000)
            prof = (await cdp.send('Profiler.stop'))['profile']; frames = await pg.evaluate("window.__fp.frames.splice(0)")
            analyze(prof, tpage, frames, t01[0], t01[1], label)
        print('errs', errs[:3]); await b.close()
asyncio.run(main())
