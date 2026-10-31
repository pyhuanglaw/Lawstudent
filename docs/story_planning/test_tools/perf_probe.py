"""BB-B 10-30：n26_perfpanel——換場景量測小面板（PERF-ZONE-ENTER-1018，LAWWW-B 23:42，1df75303c）。
  橫向：網址加 ?perf，【前置】讀使用者存檔在宿舍 2025-09-27（六）14:00，照玩家走門換三次區域（宿舍 → 校園 → 溫州街或 Café；路上要經過別的區域就照走），
        每次淡入以後等 10 秒＋餘裕；右上角 #perfPanel：標題「換場景量測（?perf，按一下複製）」、一行一次、新的在上面、每行照格式；
        小框不擋搖桿（#joy）、互動鈕（#interact）、小地圖（#minimap），其他 HUD 重疊的也列出來。
  直向：同樣讀檔，宿舍 → 校園一次，量重疊、截圖。
  沒有 ?perf：宿舍 → 校園一次，不能有 #perfPanel。
  數字是 SwiftShader 的，照實記，不判斷好壞。
n26_perfpanel（08:26）：宿舍房間的出口現在是「走出房間」→ dorm_hall（宿舍走廊），路線表沒有它，一步都沒走＝探針；路線前面加 dorm_hall。
用法：LW_TESTS=<工作樹>/tests python3 perf_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, re, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright

URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
J = lambda x: json.dumps(x, ensure_ascii=False)[:1500]
ROW = re.compile(r'^(.+)：黑畫面 [\d.]+ 秒（建區域 [\d.]+、預熱 [\d.]+）；淡入後 10 秒最長一格 [\d.]+ 秒、卡 \d+ 次；shader 黑畫面 \+-?\d+、淡入後 \+-?\d+$')
ROW_NEG = re.compile(r'shader 黑畫面 \+-\d+')   # n26：小框印出「+-6」＝shader 數是負的（遊戲顯示的問題，另外記，不讓格式那一項跟著 FAIL）
HEAD = '換場景量測（?perf，按一下複製）'
PANEL = """(()=>{ const d=document.getElementById('perfPanel'); const on=typeof PERFPANEL!=='undefined'?PERFPANEL.on:null;
  if(!d) return {exists:false, on}; const r=d.getBoundingClientRect();
  const hud={}; for(const id of ['joy','interact','minimap','btnPhone','btnMenu','hudR','hud','btnBigMap','nextClass','guide']){ const e=document.getElementById(id); if(!e) continue; const q=e.getBoundingClientRect(); const vis=!!e.offsetParent&&q.width>0&&q.height>0&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).opacity!=='0';
    const ix=Math.max(0,Math.min(r.right,q.right)-Math.max(r.left,q.left)), iy=Math.max(0,Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top));
    const cx=q.left+q.width/2, cy=q.top+q.height/2, top=vis?document.elementFromPoint(cx,cy):null;   /* 鈕的正中間按下去，最上面是誰（被小框蓋住＝按不到）*/
    hud[id]={vis, rect:[Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)], overlap:Math.round(ix*iy), tapOK:vis?!!(top&&(e===top||e.contains(top))):null, topId:top?(top.id||top.className||top.tagName):null}; }
  return {exists:true, on, text:d.textContent, rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)], vw:innerWidth, vh:innerHeight, hud}; })()"""
EXITS = "(()=>GAME.E.interactables.filter(i=>i.exit).map(i=>({to:i.exit.to, x:+i.x.toFixed(1), z:+i.z.toFixed(1), label:i.label})))()"


async def door_to(pg, cdp, run, to, max_s=420):
    # n26_perfpanel_b 09:34：宿舍走廊在二樓（lv 1），「離開宿舍」在一樓（lv 0）——沒給 lv，go_to 一直在二樓點地面、走不到樓梯下面＝探針；照互動點的 lv 走
    it = await pg.evaluate("(to=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return it?[it.x,it.z,it.label,it.lv==null?null:(it.lv|0)]:null; })", to)
    if not it: return False
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=max_s, lv=it[3], stop=lambda s: s['dlg'] or s['choices']); await L.tap(pg, cdp, '#interact')
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("GAME.G.zone") == to: return True
    return False


async def settle_after_enter(pg, cdp):
    # 淡入以後等 10 秒（PERFPANEL.WATCH）＋餘裕；中間有對話就點過去（讀檔用 quiet，照理沒有）
    t0 = time.time()
    while time.time() - t0 < 16:
        s = await P.ts(pg)
        if s['ch']: await P.tap_choice(pg, cdp, len(s['ch']) - 1); await pg.wait_for_timeout(800); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(1000)


async def start(p, run, perf, landscape, tag):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    u = URL + (('&' if '?' in URL else '?') + 'perf' if perf else '')
    await pg.goto(u); ok = await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await P.init(pg)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); return !!r&&!!r.offsetParent; })()"):
        await L.tap(pg, cdp, '#rotate'); await pg.wait_for_timeout(800)
    st, d = await P.base(pg, SAVE, '2025-09-27', 14.0, 'dorm'); await P.load(pg, cdp, st)
    run.setup('[前置] %s：網址 %s；使用者存檔改到 %s（六）14:00 宿舍房間（quiet 讀檔）' % (tag, u.split('/')[-1], d['key']))
    await settle_after_enter(pg, cdp)
    return b, pg, cdp, errs, ok


async def walk_route(pg, cdp, run, tag, targets, max_hops=4):
    hops = []
    for _ in range(max_hops):
        z = await pg.evaluate("GAME.G.zone")
        if z in targets['done']: break
        ex = await pg.evaluate(EXITS); tos = [e['to'] for e in ex]
        nxt = next((t for t in targets['order'] if t in tos and t not in [h['to'] for h in hops] and t != z), None)
        run.note('%s：在 %s，出口 %s → 下一站 %s' % (tag, z, J(ex), nxt))
        if not nxt: break
        t0 = time.time(); ok = await door_to(pg, cdp, run, nxt)
        hops.append({'from': z, 'to': nxt, 'ok': ok, 'secs': round(time.time() - t0)})
        await settle_after_enter(pg, cdp)
        pn = await pg.evaluate(PANEL); await run.shot(pg, '%s_%d_%s' % (tag, len(hops), nxt))
        run.note('%s 進 %s 以後的小框：%s' % (tag, nxt, J(pn)))
    return hops


def rows_of(pn):
    t = (pn.get('text') or '').split('\n')
    return t[0] if t else '', [x for x in t[1:] if x.strip()]


async def main():
    run = L.Run('perf_probe', OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        # 1 橫向 ?perf：宿舍 → 校園 → 溫州街或 Café
        b, pg, cdp, errs, ok = await start(p, run, True, True, '橫向 ?perf')
        run.check('遊戲載入（?perf）', ok)
        pn0 = await pg.evaluate(PANEL); run.note('讀檔進宿舍以後的小框：%s' % J(pn0))
        hops = await walk_route(pg, cdp, run, 'land', {'order': ['dorm_hall', 'campus', 'wenzhou', 'cafe', 'gongguan'], 'done': ['wenzhou', 'cafe']}, max_hops=5)
        run.note('橫向路線：%s' % J(hops))
        run.check('橫向：照玩家走門換了 ≥ 2 次區域，最後在溫州街或 Café', len([h for h in hops if h['ok']]) >= 2 and hops and hops[-1]['ok'] and hops[-1]['to'] in ('wenzhou', 'cafe'), J(hops))
        pn = await pg.evaluate(PANEL); head, rows = rows_of(pn)
        await run.shot(pg, 'land_final')
        run.note('橫向最後的小框（%s）：\n%s' % (J(pn.get('rect')), pn.get('text')))
        run.check('橫向：右上角有小框、標題「%s」' % HEAD, pn['exists'] and head == HEAD and pn['rect'][0] + pn['rect'][2] >= pn['vw'] - 40 and pn['rect'][1] <= 60, J({k: pn.get(k) for k in ('exists', 'rect', 'vw', 'vh')}) + ' ' + head)
        nin = len([h for h in hops if h['ok']])
        run.check('橫向：一行一次（行數 ≥ 換區域次數 %d）、每行照格式' % nin, len(rows) >= nin and all(ROW.match(r) for r in rows), J(rows))
        neg = [r for r in rows if ROW_NEG.search(r)]
        run.check('橫向：shader 黑畫面的數字不是負的（n26 看到「+-6」）', not neg, J(neg))
        z_last = hops[-1]['to'] if hops else None; z_names = [ROW.match(r).group(1) if ROW.match(r) else None for r in rows]
        run.note('每行的區域：%s；走過的順序：%s' % (J(z_names), J([h['to'] for h in hops])))
        run.check('橫向：新的在上面（第一行是最後進的 %s）' % z_last, bool(rows) and bool(z_last) and bool(z_names[0]) and (z_last in z_names[0] or z_names[0] in (await pg.evaluate("GAME.E.zone&&GAME.E.zone.name||''"))), J(z_names))
        hud = pn.get('hud', {}); bad = {k: v for k, v in hud.items() if k in ('joy', 'interact', 'minimap') and v['vis'] and v['overlap'] > 0}
        run.note('橫向 HUD 重疊（面積 px²）：%s' % J({k: (v['vis'], v['overlap'], v['rect']) for k, v in hud.items()}))
        run.check('橫向：小框不擋搖桿、互動鈕、小地圖', not bad, J(bad))
        blocked = {k: v.get('topId') for k, v in hud.items() if v.get('vis') and v.get('tapOK') is False}
        run.note('橫向：哪些鈕正中間按下去被別的東西蓋住：%s' % J(blocked))
        run.check('橫向：手機鈕、選單鈕正中間按得到（不被小框蓋住；只有 ?perf 才有小框）', not any(k in blocked for k in ('btnPhone', 'btnMenu')), J(blocked))
        run.check('沒有 JS 例外（橫向）', not errs, J(errs[:3]))
        await b.close()
        # 2 直向 ?perf：宿舍 → 校園
        b, pg, cdp, errs, ok = await start(p, run, True, False, '直向 ?perf')
        hops = await walk_route(pg, cdp, run, 'port', {'order': ['dorm_hall', 'campus'], 'done': ['campus']}, max_hops=2)
        pn = await pg.evaluate(PANEL); head, rows = rows_of(pn); await run.shot(pg, 'port_final')
        run.note('直向小框（%s，畫面 %sx%s）：\n%s' % (J(pn.get('rect')), pn.get('vw'), pn.get('vh'), pn.get('text')))
        run.check('直向：有小框、標題對、每行照格式', pn['exists'] and head == HEAD and bool(rows) and all(ROW.match(r) for r in rows), J(rows))
        hud = pn.get('hud', {}); bad = {k: v for k, v in hud.items() if k in ('joy', 'interact', 'minimap') and v['vis'] and v['overlap'] > 0}
        run.note('直向 HUD 重疊（面積 px²）：%s' % J({k: (v['vis'], v['overlap'], v['rect']) for k, v in hud.items()}))
        run.check('直向：小框不擋搖桿、互動鈕、小地圖', not bad, J(bad))
        run.check('沒有 JS 例外（直向）', not errs, J(errs[:3]))
        await b.close()
        # 3 沒有 ?perf
        b, pg, cdp, errs, ok = await start(p, run, False, True, '沒有 ?perf')
        hops = await walk_route(pg, cdp, run, 'noperf', {'order': ['dorm_hall', 'campus'], 'done': ['campus']}, max_hops=2)
        pn = await pg.evaluate(PANEL); await run.shot(pg, 'noperf_final')
        run.check('沒有 ?perf：換區域以後也沒有 #perfPanel（PERFPANEL.on＝false）', not pn['exists'] and pn.get('on') is False and bool(hops) and hops[0]['ok'], J({'pn': pn, 'hops': hops}))
        run.check('沒有 JS 例外（沒有 ?perf）', not errs, J(errs[:3]))
        await b.close()
    print('SHA', os.environ.get('SHA', '?'))
    sys.exit(run.finish())
asyncio.run(main())
