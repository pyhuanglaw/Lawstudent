"""BB-B 10-30：RENAME-1030 虛構校名更名的獨立實測（AA_540 第 3 節標 BB-B 的三項；AA_534 第 5 節；docs/WORLD_NAMING.md）。
搜尋結果是零不算驗收（使用者 10-30）：這支看的是遊戲畫面上真的出現的字，每一格都截圖。
MODE（環境變數）：
  views    VP＝portrait（390×844）／landscape（844×390）／desktop（1366×768）：
           各區域（宿舍、校園、法律系館A、201、法律系館B、總圖、博思、公館、溫州街）讀檔進去 →
           右上地點字（#clockZ）、下一堂課、目標、導引、ADV 地點條、每一個出入口走到旁邊的互動字（#interactLabel）、
           大地圖（標題、地點清單）、選單存檔頁（存一格再看）——字有沒有被截（scrollWidth＞clientWidth、超出畫面右邊）、有沒有舊名、
           「法律系館A館」疊字、自己縮的「帝大／首帝」、明衡館／致遠館、寫的字（地點、門口、地圖、存檔頁）只寫「A館／B館」。
  oldsave  使用者的舊存檔（9/25 第 9 天，存檔裡已經寫下「週末來政大？我當導遊。」「去政大找可昕」「回到台大。」）
           照玩家：放進自動存檔那一格 → 重新整理 → 標題「繼續」→ 手機每一個分頁、每一個對話、選單筆記、人物、存檔頁 → 有沒有舊名；
           另外兩份舊存檔改到法律系館A大廳、法律系館B大廳（舊的區域 id linze／wancai）讀進來，看地點字。
  route    照玩家走一遍常走的路線（宿舍房間 → 宿舍門廳 → 校園 → 法律系館A → 校園 → 法律系館B → 校園 → 總圖 → 校園 → 公館 → 溫州街）：
           走到門口、看互動字、按進去；沿路的字幕、提示、對話、地點字全部記下來比對。網址加 ?turbo（看的是字，不是移動速度）。
判斷用企劃線的 tools/rename/world_names.py（find_old；路徑 WN_DIR）。不是 iPhone：Playwright＋SwiftShader。
用法：LW_TESTS=<工作樹>/tests WN_DIR=<world_names.py 所在資料夾> MODE=<上面> [VP=portrait] python3 rename_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, re, copy, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
sys.path.insert(0, os.environ['WN_DIR']); import world_names as WN
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'views'); VP = os.environ.get('VP', 'landscape')
J = lambda o: json.dumps(o, ensure_ascii=False)

BAD = [('疊字「法律系館A館／B館」', re.compile(r'法律系館[AB]館')), ('自己縮的「首帝」', re.compile(r'首帝(?!國|大)')),
       ('自己縮的「帝大」', re.compile(r'(?<!首都)帝大')), ('明衡館／致遠館', re.compile(r'明衡館|致遠館'))]
SHORT = re.compile(r'(?<![系館])[AB]館')   # 寫的字（地點、門口、地圖、存檔頁）要「法律系館A」，只寫「A館」＝報
WRITTEN_IDS = ('clockZ', 'interactLabel', 'title3', 'bmTitle', 'bmSub', 'bmInfo', 'nextClass')
UI = """(()=>{ const pick=id=>{ const e=document.getElementById(id); if(!e) return null; const cs=getComputedStyle(e); const vis=!!(e.offsetParent||e.getClientRects().length)&&cs.visibility!=='hidden'&&cs.display!=='none';
    const r=e.getBoundingClientRect(); return {id, t:(e.innerText||e.textContent||'').trim(), vis, over:vis&&e.scrollWidth>e.clientWidth+2, off:vis&&Math.round(r.right)>innerWidth+1, w:Math.round(r.width)}; };
  return ['clockZ','clockT','nextClass','goal','guideText','interactLabel','title3','caption','toast','bmTitle','bmSub','bmInfo'].map(pick).filter(Boolean); })()"""
INTER = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label||'',x:i.x,z:i.z,lv:i.lv|0,to:i.exit&&i.exit.to||null})))()"
BODY = "(()=>document.body.innerText||'')()"


class Find:
    def __init__(s): s.old = []; s.bad = []; s.short = []; s.over = []; s.seen = set()

    def text(s, where, t, written=False):
        if not t: return
        for line in str(t).split('\n'):
            line = line.strip()
            if not line or (where, line) in s.seen: continue
            s.seen.add((where, line))
            for nm, hit in WN.find_old(line): s.old.append({'where': where, 'word': nm, 'hit': hit, 'line': line[:120]})
            for nm, rx in BAD:
                if rx.search(line): s.bad.append({'where': where, 'what': nm, 'line': line[:120]})
            if written and SHORT.search(line): s.short.append({'where': where, 'line': line[:120]})

    def ui(s, where, items):
        for it in items:
            if not it['vis'] or not it['t']: continue
            s.text('%s #%s' % (where, it['id']), it['t'], written=it['id'] in WRITTEN_IDS)
            if it['over'] or it['off']: s.over.append({'where': where, 'id': it['id'], 't': it['t'][:80], 'over': it['over'], 'off': it['off'], 'w': it['w']})


async def launch(p):
    if VP == 'desktop':
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
        ctx = await b.new_context(viewport={'width': 1366, 'height': 768}, device_scale_factor=1, has_touch=True)
        pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        return b, ctx, pg, cdp, errs
    return await L.launch(p, landscape=(VP != 'portrait'))


async def save_page(pg, cdp, run, F, tag, do_save=True):
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu [data-tab="save"]'); await pg.wait_for_timeout(900)
    if do_save:
        k = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].find(b=>/存檔/.test(b.textContent||'')&&!b.disabled); if(!b) return false; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if k: await L.touch_tap(cdp, k[0], k[1]); await pg.wait_for_timeout(1500)
    txt = await pg.evaluate("(document.getElementById('saveSlots')||{}).innerText||''")
    over = await pg.evaluate("(()=>[...document.querySelectorAll('#saveSlots *')].filter(e=>e.children.length===0&&(e.textContent||'').trim()&&(e.scrollWidth>e.clientWidth+2||e.getBoundingClientRect().right>innerWidth+1)).map(e=>(e.textContent||'').trim().slice(0,60)))()")
    F.text('%s 存檔頁' % tag, txt, written=True)
    for o in over: F.over.append({'where': '%s 存檔頁' % tag, 'id': 'saveSlots', 't': o, 'over': True, 'off': None, 'w': None})
    run.note('%s 存檔頁：%s；被截的：%s' % (tag, J(txt[:300]), J(over)))
    await run.shot(pg, '%s_savepage' % tag)
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
    return txt


async def big_map(pg, cdp, run, F, tag):
    if not await pg.evaluate("(()=>{ const b=document.getElementById('btnBigMap'); return !!b&&!!b.offsetParent; })()"):
        run.note('%s：看不到大地圖按鈕' % tag); return None
    await L.tap(pg, cdp, '#btnBigMap'); await pg.wait_for_timeout(1500)
    F.ui('%s 大地圖' % tag, await pg.evaluate(UI))
    lst = await pg.evaluate("(document.getElementById('mapList')||{}).innerText||''"); F.text('%s 大地圖清單' % tag, lst, written=True)
    run.note('%s 大地圖：%s' % (tag, J(lst[:400])))
    await run.shot(pg, '%s_bigmap' % tag)
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
    return lst


SPOTS = [('dorm_hall', '宿舍門廳'), ('campus', '校園'), ('linze', '法律系館A'), ('classroom', '法律系館A 201'), ('wancai', '法律系館B'),
         ('library_hall', '總圖大廳'), ('boya', '博思教學館'), ('gongguan', '公館'), ('wenzhou', '溫州街')]


async def views(pg, cdp, run, F):
    for zone, nm in SPOTS:
        st, d = await P.base(pg, SAVE, '2025-09-25', 14.5, zone); await P.load(pg, cdp, st)
        z = await pg.evaluate("GAME.G.zone")
        if z != zone: run.note('%s：讀不進 %s（現在 %s），跳過' % (nm, zone, z)); continue
        await pg.wait_for_timeout(1500)
        ui = await pg.evaluate(UI); F.ui(nm, ui)
        run.note('%s 地點字：%s' % (nm, J([(u['id'], u['t'][:40]) for u in ui if u['vis'] and u['t']])))
        await run.shot(pg, 'v_%s' % zone)
        inter = await pg.evaluate(INTER)
        for it in inter: F.text('%s 互動清單' % nm, it['label'], written=True)
        doors = [it for it in inter if it['to']][:6]
        for k, it in enumerate(doors):
            await pg.evaluate("([x,z,R,lv])=>__BBF.placeNear(x,z,R,lv)", [it['x'], it['z'], 0.8, it['lv']]); await pg.wait_for_timeout(1800)
            u = [x for x in await pg.evaluate(UI) if x['id'] == 'interactLabel']; F.ui('%s 門口' % nm, u)
            run.note('%s 門口 %s → %s：畫面上「%s」%s' % (nm, it['label'], it['to'], u and u[0]['t'], '（被截）' if u and (u[0]['over'] or u[0]['off']) else ''))
            if k < 3: await run.shot(pg, 'v_%s_door%d' % (zone, k))
        if zone == 'campus': await big_map(pg, cdp, run, F, nm)
        F.text('%s 整頁' % nm, await pg.evaluate(BODY))
    await save_page(pg, cdp, run, F, '最後一區')


async def oldsave(pg, cdp, run, F):
    s = copy.deepcopy(SAVE); s = s.get('G', s)
    await pg.evaluate("s=>{ localStorage.clear(); localStorage.setItem('fatiao3d_auto', JSON.stringify(s)); }", s)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.wait_for_timeout(1500); await P.init(pg)
    btn = await pg.evaluate("(()=>{ const b=document.getElementById('btnContinue'); return b?{t:(b.textContent||'').trim(),vis:!!b.offsetParent}:null; })()")
    run.check('前置：標題有「繼續」（舊存檔放在自動存檔那一格）', bool(btn) and btn['vis'], J(btn))
    F.text('標題', await pg.evaluate(BODY))
    await L.tap(pg, cdp, '#btnContinue')
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("!!(GAME.G&&GAME.running)"): break
    await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
    run.check('舊存檔讀得進來（第 9 天、溫州街）', await pg.evaluate("GAME.G.day===9&&GAME.G.zone==='wenzhou'"), J(await pg.evaluate("({d:GAME.G.day,z:GAME.G.zone})")))
    F.ui('舊存檔', await pg.evaluate(UI)); await run.shot(pg, 'old_in')
    mem = await pg.evaluate("""(()=>{ const G=GAME.G; return {msg15:(G.msgs[15]||{}).text||null, outings:(G.outings||[]).map(o=>({title:o.title,place:o.place,back:o.back})), autoAsk:(G.flags._autoAsk||[]).slice(0,4)}; })()""")
    run.note('讀進來以後存檔裡的字：%s' % J(mem))
    tabs = await pg.evaluate("[...document.querySelectorAll('#phoneTabs button[data-ptab]')].map(b=>b.dataset.ptab)")
    if not tabs:
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        tabs = await pg.evaluate("[...document.querySelectorAll('#phoneTabs button[data-ptab]')].map(b=>b.dataset.ptab)")
    run.note('手機分頁：%s' % J(tabs))
    for tb in tabs:
        t = await P.phone_tab(pg, cdp, tb); F.text('手機 %s' % tb, t)
        if tb == 'msg':
            ths = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-th]')].map(e=>e.dataset.th)")
            for th in ths:
                r = await P.phone_thread(pg, cdp, th); F.text('手機對話 %s' % th, r['text'])
                if th.endswith('kexin'): await run.shot(pg, 'old_phone_kexin')
    await run.shot(pg, 'old_phone')
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
    mtabs = await pg.evaluate("(()=>{ return []; })()")
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    mtabs = await pg.evaluate("[...document.querySelectorAll('#menu [data-tab]')].map(b=>b.dataset.tab)")
    for tb in mtabs:
        await L.tap(pg, cdp, '#menu [data-tab="%s"]' % tb); await pg.wait_for_timeout(900)
        F.text('選單 %s' % tb, await pg.evaluate("(document.getElementById('menu')||{}).innerText||''"), written=(tb == 'save'))
        await run.shot(pg, 'old_menu_%s' % tb)
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
    for zone, nm in (('linze', '法律系館A'), ('wancai', '法律系館B')):
        st, d = await P.base(pg, SAVE, '2025-09-25', 14.5, zone); await P.load(pg, cdp, st); await pg.wait_for_timeout(1500)
        ui = await pg.evaluate(UI); F.ui('舊存檔 %s' % zone, ui)
        cz = next((u['t'] for u in ui if u['id'] == 'clockZ'), '')
        run.check('舊存檔在 %s（舊的區域 id）讀進來，右上地點字是「%s」' % (zone, nm), nm in cz and not WN.find_old(cz), cz)
        await run.shot(pg, 'old_%s' % zone)
    return mem


ROUTE = [('dorm', 'dorm_hall'), ('dorm_hall', 'campus'), ('campus', 'linze'), ('linze', 'campus'), ('campus', 'wancai'), ('wancai', 'campus'),
         ('campus', 'library_hall'), ('library_hall', 'campus'), ('campus', 'gongguan'), ('gongguan', 'wenzhou')]


async def route(pg, cdp, run, F):
    st, d = await P.base(pg, SAVE, '2025-09-27', 9.5, 'dorm'); await P.load(pg, cdp, st, quiet=False)   # 週六早上（沒有課），宿舍房間
    run.setup('[前置] 使用者存檔 → 2025-09-27（六）09:30 宿舍房間；事件照常')
    n0 = await P.cap_n(pg); s0 = await P.say_hook(pg); ok = 0
    for a, b in ROUTE:
        z = await pg.evaluate("GAME.G.zone")
        if z != a: run.note('不在 %s（在 %s），這一段跳過' % (a, z)); continue
        F.ui('路線 %s' % a, await pg.evaluate(UI))
        dr = await pg.evaluate("(to=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&i.exit&&i.exit.to===to); return it?{x:it.x,z:it.z,lv:it.lv|0,label:it.label}:null; })", b)
        if not dr: run.check('路線：%s 有往 %s 的門' % (a, b), False, ''); continue
        await L.go_to(pg, cdp, run, dr['x'], dr['z'], 0.9, '%s → %s：%s' % (a, b, dr['label']), max_s=300, lv=dr['lv'], stop=lambda s, w=dr['label']: s['interact'].startswith(w[:4]))
        u = [x for x in await pg.evaluate(UI) if x['id'] == 'interactLabel']; F.ui('路線 %s 門口' % a, u)
        await run.shot(pg, 'r_%s_to_%s' % (a, b))
        await L.tap(pg, cdp, '#interact')
        for _ in range(40):
            await pg.wait_for_timeout(1000)
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
            if s['choices']: await L.tap(pg, cdp, '#choices button'); continue
            if await pg.evaluate("GAME.G.zone") == b and not s['busy']: break
        z2 = await pg.evaluate("GAME.G.zone"); okk = z2 == b; ok += okk
        run.check('路線：%s → %s（按「%s」進得去）' % (a, b, dr['label']), okk, z2)
        await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
        F.ui('路線 %s' % b, await pg.evaluate(UI)); await run.shot(pg, 'r_in_%s' % b)
    for c in await P.captions(pg, n0): F.text('路線 字幕', c.get('t'))
    for nm, t in await P.said(pg, s0): F.text('路線 對話 %s' % nm, t)
    return ok


async def main():
    run = L.Run('rename_%s_%s' % (MODE, VP), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await launch(p)
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        url = URL + ('&' if '?' in URL else '?') + 'turbo' if MODE == 'route' else URL
        await pg.goto(url); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
        F = Find()
        if MODE == 'views': await views(pg, cdp, run, F)
        elif MODE == 'oldsave': await oldsave(pg, cdp, run, F)
        elif MODE == 'route': await route(pg, cdp, run, F)
        run.note('舊名：%s' % J(F.old)); run.note('疊字／自己縮／明衡致遠：%s' % J(F.bad)); run.note('寫的字只寫 A館／B館：%s' % J(F.short)); run.note('被截的字：%s' % J(F.over))
        run.check('畫面上沒有舊名（WORLD_NAMING 第 6 節；企劃線 world_names.find_old）', not F.old, J(F.old[:12]))
        run.check('沒有「法律系館A館」疊字、自己縮的「帝大／首帝」、明衡館／致遠館', not F.bad, J(F.bad[:12]))
        run.check('地點字、門口互動字、大地圖、存檔頁寫的是「法律系館A／B」，不是只寫「A館／B館」', not F.short, J(F.short[:12]))
        run.check('地點字、門口互動字、大地圖、存檔頁的字沒有被截、沒有超出畫面（%s）' % VP, not F.over, J(F.over[:12]))
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        json.dump({'old': F.old, 'bad': F.bad, 'short': F.short, 'over': F.over}, open(os.path.join(OUT, 'rename_%s_%s.json' % (MODE, VP)), 'w'), ensure_ascii=False, indent=1)
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE, 'VP', VP)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
