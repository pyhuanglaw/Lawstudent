"""BB（帳號 A）2026-10-22：PERF-NPC-POOL-1022（LAWWW 07:24 派，P2；開發分支 e63ba5d2 起）——換區域時路人底模每次只換 1 女 1 男、晚到的路人每 1.5 秒換上一個。
照玩家走：公館 →（巷口）溫州街 →（店門）兩點半 Café →（店門）溫州街 →（巷口）公館 → 溫州街 → Café → 溫州街（來回兩趟，換 7 次區域）。
每次換區域以後每 1.5 秒記一次路人（E.npcs 的 isExtra、機車騎士）的狀態，看 60 秒：
  1 路人都有出現：模型還沒到的路人是程序化備用人物、整個藏著（character3d.js C.build 的 degradedHidden），等到換上正式模型才看得到——
    「方塊人露出來」＝程序化人物看得到（不准出現）；「一直藏著」＝60 秒後還有路人在等（不准）；「一個一個冒出來」＝每次記錄之間換上的人數（記下來，不算秒數）
  2 旁邊沒有兩個一模一樣的路人：同一層 4 m 內兩個看得到的路人用同一個底模（BUG-NPC-DUP-1018 的定義）
  3 沒有頁面錯誤
卡不卡：SwiftShader 看不準（LAWWW：只記看到的，不量秒數）。
【前置】讀使用者存檔改到 2025-10-04（六）15:00 公館（quiet_events：條件事件不演）；之後照玩家走路、按「進○○」的門。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 perfpool_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
EXTRAS = """(()=>{ const E=GAME.E, P=E.player.obj.position, C=typeof CHAR!=='undefined'?CHAR:null;
  const one=(h,id,lv,hidden)=>{ const u=(h&&h.userData)||{}; const kid=[...(h?h.children:[])].some(c=>c.visible); return {id, drv:u.driver||'', wait:!!u.degradedHidden&&u.driver==='proc', box:u.driver==='proc'&&!u.degradedHidden&&kid&&h.visible!==false&&!hidden,
    show:u.driver!=='proc'&&h.visible!==false&&!hidden, key:C&&C.anonKeyOf?C.anonKeyOf(h):null, lv:lv|0, x:+h.position.x.toFixed(1), z:+h.position.z.toFixed(1)}; };
  const out=(E.npcs||[]).filter(n=>n&&n.isExtra&&n.obj).map(n=>one(n.obj,n.id,n.lv,n.hidden));
  for(const x of (GAME.extras||[])) if(x&&x.rider){ const w=new THREE.Vector3(); x.rider.getWorldPosition(w); const o=one(x.rider,'rider',0,false); o.x=+w.x.toFixed(1); o.z=+w.z.toFixed(1); out.push(o); }
  const vis=out.filter(o=>o.show), dup=[];
  for(let i=0;i<vis.length;i++) for(let j=i+1;j<vis.length;j++){ const a=vis[i], b=vis[j], d=Math.hypot(a.x-b.x,a.z-b.z); if(a.key&&a.key===b.key&&a.lv===b.lv&&d<4) dup.push([a.id,b.id,a.key,+d.toFixed(1)]); }
  return {zone:GAME.G.zone, n:out.length, vis:vis.length, wait:out.filter(o=>o.wait).length, box:out.filter(o=>o.box).length, boxIds:out.filter(o=>o.box).map(o=>o.id), dup,
    pool:C&&C.anonPool?C.anonPool.cur.slice():null, keys:[...new Set(vis.map(o=>o.key).filter(Boolean))].length, near:vis.filter(o=>Math.hypot(o.x-P.x,o.z-P.z)<15).length}; })()"""
EXIT = """(to=>{ const i=(GAME.E.interactables||[]).find(q=>q&&!q.hidden&&q.exit&&q.exit.to===to); return i?[i.x,i.z,i.lv|0,i.label||'']:null; })"""
ROUTE = ['wenzhou', 'cafe', 'wenzhou', 'gongguan', 'wenzhou', 'cafe', 'wenzhou']
NAME = {'gongguan': '公館', 'wenzhou': '溫州街', 'cafe': '兩點半 Café'}


async def phone_tab(pg, cdp, tab):
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(800)


async def quick_go(pg, cdp, zone):
    await phone_tab(pg, cdp, 'places')
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(zone))
    if not c: await L.phone_away(pg, cdp); return False
    await L.touch_tap(cdp, c[0], c[1]); return True


def pick(ops, pre=('進', '走', '去', '好')):
    """別人的出遊、約定的提示一律「不去了／先不要」（這支只測換區域）；其他選「進／走／去／好」開頭的，不然第一個"""
    for i, o in enumerate(ops):
        if o.startswith(('不去了', '先不要', '今天先不要', '先不接', '不接')): return i
    return next((i for i, o in enumerate(ops) if o.startswith(pre)), 0)


async def settle(pg, cdp, secs=20):
    """把畫面上的對話、選項點掉（出遊提示選「不去了」）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            ops = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            if not ops: await pg.wait_for_timeout(400); continue
            k = pick(ops); say('   選項 %s → %s' % ([o[:14] for o in ops], ops[k][:14]))
            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        return


async def go_zone(pg, cdp, run, to):
    """照玩家走到通往那一區的出口（巷口、店門）按下去；找不到出口才用手機「地點」。回傳（怎麼去的, 換區域那一刻）"""
    await settle(pg, cdp)
    it = await pg.evaluate(EXIT + "(%s)" % json.dumps(to)); how = None
    if it:
        r = await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[3] or NAME[to], max_s=150, lv=it[2])
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if lab: await L.tap(pg, cdp, '#interact'); how = '走到「%s」按「%s」' % (it[3], lab)
    if not how:
        if await quick_go(pg, cdp, to): how = '手機「地點」快速前往'
    for _ in range(90):
        await pg.wait_for_timeout(500)
        if (await pg.evaluate("GAME.G.zone")) == to: break
        s = await L.state(pg)
        if s['choices']:
            ops = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            if not ops: continue
            k = pick(ops); say('   選項 %s → %s' % ([o[:14] for o in ops], ops[k][:14]))
            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
            await L.touch_tap(cdp, c[0], c[1])
        elif s['dlg']: await L.tap(pg, cdp, '#dlg')
    return how, time.time()


async def watch(pg, run, tag, t_in, secs=60):
    """換區域以後每 1.5 秒記一次路人"""
    rows = []; shot = set()
    while time.time() - t_in < secs:
        r = await pg.evaluate(EXTRAS); r['t'] = round(time.time() - t_in, 1); rows.append(r)
        if r['t'] >= 2 and 'a' not in shot: await run.shot(pg, '%s_arrive' % tag); shot.add('a')
        if r['n'] and not r['wait'] and r['t'] >= 6 and 'b' not in shot: await run.shot(pg, '%s_all' % tag); shot.add('b'); break
        await pg.wait_for_timeout(1500)
    if 'b' not in shot: await run.shot(pg, '%s_end' % tag)
    return rows


async def main():
    run = L.Run('perfpool', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {'legs': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        try:
            await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
            st = json.loads(json.dumps(base)); G = st.get('G', st)
            d = await pg.evaluate("STORY.dayOfKey('2025-10-04')")
            G.update({'day': d, 'hour': 15.0, 'zone': 'gongguan', 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
            t0 = time.time(); await L.load_state(pg, G, quiet_events=True)
            run.setup('[前置] 使用者存檔改到 2025-10-04（六）15:00 公館（quiet_events：條件事件不演）；之後照玩家走路、按門')
            rows = await watch(pg, run, '00_gongguan_load', t0); out['legs'].append({'to': 'gongguan', 'how': '讀檔', 'rows': rows})
            for k, to in enumerate(ROUTE, 1):
                tag = '%02d_%s' % (k, to)
                how, t_in = await go_zone(pg, cdp, run, to)
                z = await pg.evaluate("GAME.G.zone"); say('== %s：%s → %s（%s）' % (tag, how, z, NAME[to]))
                run.check('%s：%s到%s' % (tag, how or '（沒有出口也沒有快速前往）', NAME[to]), z == to, z)
                if z != to: break
                rows = await watch(pg, run, tag, t_in); out['legs'].append({'to': to, 'how': how, 'rows': rows})
                json.dump(out, open(os.path.join(OUT, 'perfpool.json'), 'w'), ensure_ascii=False, indent=1)
            for k, leg in enumerate(out['legs']):
                R = leg['rows']; tag = '%02d_%s' % (k, leg['to']); last = R[-1] if R else {}
                boxes = [r for r in R if r['box']]; dups = [r for r in R if r['dup']]
                steps = [R[i - 1]['wait'] - R[i]['wait'] for i in range(1, len(R)) if R[i - 1]['wait'] > R[i]['wait']]
                say('   %s：路人 %s、最後看得到 %s、在等的 %s、方塊人 %s、重複 %s、一次換上 %s、底模池 %s' % (tag, last.get('n'), last.get('vis'), [r['wait'] for r in R], len(boxes), len(dups), steps, last.get('pool')))
                run.check('%s：%s 沒有露出方塊人（%d 次記錄）' % (tag, NAME[leg['to']], len(R)), not boxes, json.dumps(boxes[:2], ensure_ascii=False)[:300])
                run.check('%s：路人沒有一直藏著（%.0f 秒內在等的 %s → 最後 %s）' % (tag, last.get('t', 0), R[0]['wait'] if R else None, last.get('wait')), bool(R) and last['wait'] == 0, json.dumps([(r['t'], r['wait'], r['vis']) for r in R], ensure_ascii=False)[:400])
                if leg['to'] in ('gongguan', 'wenzhou'): run.check('%s：%s街上有路人（看得到 %s 個、%s 種底模）' % (tag, NAME[leg['to']], last.get('vis'), last.get('keys')), bool(last.get('vis')), json.dumps(last, ensure_ascii=False)[:300])
                run.check('%s：旁邊（同一層 4 m 內）沒有兩個一模一樣的路人' % tag, not (last.get('dup') or []), json.dumps(last.get('dup'), ensure_ascii=False))
                if dups: run.note('%s：過程中有 %d 次記錄出現兩個一樣的路人在 4 m 內（最後沒有＝已換掉）：%s' % (tag, len(dups), json.dumps(dups[0]['dup'], ensure_ascii=False)[:200]))
                if steps: run.note('%s：晚到的路人一次換上幾個（每 1.5 秒記一次之間）：%s' % (tag, steps))
            out['errs'] = errs[:5]
            run.check('沒有頁面錯誤（JS 例外）', not errs, json.dumps(errs[:3], ensure_ascii=False))
        finally:
            json.dump(out, open(os.path.join(OUT, 'perfpool.json'), 'w'), ensure_ascii=False, indent=1)
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    run.finish()
asyncio.run(main())
