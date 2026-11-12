# 【CC-B 11-07 複製自 BB-B claude/elegant-brown-fcos7n 18fda7b28；只改參數：runner 給 <url> <out> 時存檔資料夾用 SAVES 環境變數（預設 fixtures/user_saves_1107）】
"""BB-B 2026-11-07：INVITE-PLACES-1107 第二批（118 巷七家，AA_721）＋約看電影買票（LAWWW-B 55d611b22、f2afc7173）瀏覽器驗收。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】DAYSHIFT 天（預設 -12＝2025-10-20 週一）早上 10 點、清邀約；【捷徑】WHO 的關係到朋友（fam 50／trust 35／comf 30）；
  【捷徑】去過（G.visited）118 巷六家（不含韓食小廚）＋南洋戲院；錢 1000。其他全部觸控（手機「朋友」→ 約 → 分類 → 地點 → 時間）。
MODE=menu 看選單：
  ① 「吃飯」列了去過的五家（滇香、巷口家常菜、蛋包飯研究所、六張犁麵舖、好家自助餐），沒去過的韓食小廚不列；
  ② 週一選巷口家常菜：今天的時間灰掉、小字「巷口家常菜週一休」；
  ③ 「散步」有一一八茶飲；
  ④ 「看電影、逛書店」南洋戲院：錢 1000 可以選；錢 100 灰掉「錢不夠買電影票（150 元）」；錢 100 但今天已經買過票（NY_TICKET＝今天）＝可以選；
  ⑤ 可昕（KX=1）：「吃飯」好家自助餐灰掉、小字是她那句「平日我在外校上課。……週末那間又沒開。」。
MODE=meet 走一場：WHO 約滇香小館今天中午 → 答應句（AA_721）→ 去 → 第一次一起去那一句 → 吃飯那一場坐下（E.player.seat）→ 記 SHARED_MEAL；
  MOVIE=1 再約南洋戲院：那一場開始時扣 150、記 NY_TICKET＝今天。
用法：LW_TESTS=<測試樹>/tests MODE=menu WHO=heroine_01 python3 pt1107i_invplaces_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt1107e_arcs_probe.py'))
pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
from playwright.async_api import async_playwright

if len(sys.argv) >= 4: URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
else: URL, OUT = sys.argv[1], sys.argv[2]; SAVES = os.environ.get('SAVES') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures', 'user_saves_1107')   # CC-B：PC runner 只給 <url> <out>
WHO = os.environ.get('WHO', 'heroine_01'); pe.WHO = WHO
MODE = os.environ.get('MODE', 'menu')
SHIFT = int(os.environ.get('DAYSHIFT', '-12'))
KX = os.environ.get('KX', '1') == '1'
MOVIE = os.environ.get('MOVIE', '1') == '1'
VISIT = ['l118_dian', 'l118_home', 'l118_omu', 'l118_noodle2', 'l118_self', 'l118_tea', 'xs_nanyang']   # 韓食小廚 l118_korea 故意不去


def base_state(who):
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s); s['day'] = s['day'] + SHIFT; s['weekday'] = ((s.get('weekday') or 0) + SHIFT) % 7;   # 撥日子也要撥 G.weekday（invites3d wdOf 從它算；不撥＝週一被當成週六，BB-B 10:0x 自己的 TEST_BUG）
    s['hour'] = 10.0; s['invites'] = []; s['money'] = 1000
    v = dict(s.get('visited') or {})
    for z in VISIT: v[z] = v.get(z) or 1
    v.pop('l118_korea', None); s['visited'] = v
    f = dict(s.get('flags') or {}); f.pop('NY_TICKET', None); s['flags'] = f
    soc = dict(s.get('social') or {}); rel = dict(soc.get('rel') or {}); r = dict(rel.get(who) or {})
    r['fam'] = max(r.get('fam', 0), 50); r['trust'] = max(r.get('trust', 0), 35); r['comf'] = max(r.get('comf', 0), 30)
    rel[who] = r; soc['rel'] = rel; s['social'] = soc
    return s


async def back_out(pg, cdp):
    for _ in range(8):
        o = await pe.opts(pg)
        if not o: break
        b = next((x['t'] for x in o if x['t'] in ('返回', '算了', '不約了', '換一天', '取消', '先不要') or x['t'].startswith('返回')), None)
        if not b: break   # 找不到「返回」就不亂按（以前退回最後一個選項，會不小心約成：BB-B 10:5x 自己的 TEST_BUG）
        await pe.choose(pg, cdp, b, True)
    await pe.close_phone(pg, cdp)
    await pe.settle(pg, cdp, [], 10)


async def open_cat(pg, cdp, who, cat):
    await pe.phone(pg, cdp, 'friends')
    if not await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who): return None
    await pg.wait_for_timeout(1500)
    o = await pe.opts(pg)
    if not await pe.choose(pg, cdp, cat): return {'top': o, 'list': None}
    return {'top': o, 'list': await pe.opts(pg)}


def find(lst, word):
    return next((x for x in (lst or []) if word in x['t']), None)


async def load(pg, cdp, s):
    await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 40)


async def menu(pg, cdp, run):
    s = base_state(WHO)
    await load(pg, cdp, s)
    info = await pg.evaluate("(w=>({day:GAME.G.day, date:CALENDAR.dateOf(GAME.G.day), wd:INV.dayLabel?INV.dayLabel(GAME.G,GAME.G.day):null, stage:INV.stageOf?INV.stageOf(GAME.G,w):null, money:GAME.G.money}))(%s)" % json.dumps(WHO))
    print('   狀態', json.dumps(info, ensure_ascii=False), flush=True)
    r = await open_cat(pg, cdp, WHO, '吃飯')
    lst = (r or {}).get('list') or []
    print('   吃飯', json.dumps([x['t'] for x in lst], ensure_ascii=False)[:600], flush=True)
    want = ['滇香小館', '巷口家常菜', '蛋包飯研究所', '六張犁麵舖', '好家自助餐']
    miss = [w for w in want if not find(lst, w)]
    run.check('① 「吃飯」列了去過的五家', not miss, json.dumps({'miss': miss, 'list': [x['t'] for x in lst]}, ensure_ascii=False))
    run.check('① 沒去過的韓食小廚不列', not find(lst, '韓食'), json.dumps([x['t'] for x in lst], ensure_ascii=False))
    await run.shot(pg, 'menu_meal')
    # ② 週一巷口家常菜
    if find(lst, '巷口家常菜'):
        await pe.choose(pg, cdp, '巷口家常菜')
        t = await pe.opts(pg)
        today = [x for x in t if x['t'].startswith('今天')]
        run.check('② 週一巷口家常菜：今天的時間都灰掉、小字「巷口家常菜週一休」', bool(today) and all(x['dim'] for x in today) and any('週一休' in x['t'] for x in today), json.dumps(t, ensure_ascii=False))
        await run.shot(pg, 'menu_home_monday')
    await back_out(pg, cdp)
    # ③ 散步
    r = await open_cat(pg, cdp, WHO, '散步')
    lst = (r or {}).get('list') or []
    run.check('③ 「散步」有一一八茶飲', bool(find(lst, '一一八茶飲')), json.dumps([x['t'] for x in lst], ensure_ascii=False))
    await back_out(pg, cdp)
    # ④ 南洋
    for money, tk, expect_dim, tag in [(1000, False, False, '錢 1000'), (100, False, True, '錢 100'), (100, True, False, '錢 100、今天已經買過票')]:
        await pg.evaluate("((m,tk)=>{ GAME.G.money=m; GAME.G.flags=GAME.G.flags||{}; if(tk) GAME.G.flags.NY_TICKET=GAME.G.day; else delete GAME.G.flags.NY_TICKET; })(%d,%s)" % (money, 'true' if tk else 'false'))
        run.setup('【捷徑】%s' % tag)
        r = await open_cat(pg, cdp, WHO, '看電影')
        lst = (r or {}).get('list') or []
        n = find(lst, '南洋')
        ok = bool(n) and (n['dim'] == expect_dim) and ((not expect_dim) or ('錢不夠買電影票（150 元）' in n['t']))
        run.check('④ %s：南洋戲院 %s' % (tag, '灰掉「錢不夠買電影票（150 元）」' if expect_dim else '可以選'), ok, json.dumps(n, ensure_ascii=False))
        if expect_dim: await run.shot(pg, 'menu_nanyang_nomoney')
        await back_out(pg, cdp)
    # ⑤ 可昕
    if KX:
        s2 = base_state('kexin'); await load(pg, cdp, s2)
        run.setup('讀同一個存檔給可昕（【捷徑】關係到朋友）')
        r = await open_cat(pg, cdp, 'kexin', '吃飯')
        top = (r or {}).get('top'); lst = (r or {}).get('list') or []
        print('   可昕', json.dumps({'top': [x['t'] for x in (top or [])], 'list': [x['t'] for x in lst]}, ensure_ascii=False)[:700], flush=True)
        n = find(lst, '好家自助餐')
        run.check('⑤ 可昕：好家自助餐灰掉、小字是她那句', bool(n) and n['dim'] and '平日我在外校上課' in n['t'], json.dumps({'item': n, 'list': [x['t'] for x in lst], 'top': [x['t'] for x in (top or [])]}, ensure_ascii=False))
        await run.shot(pg, 'menu_kexin_self')
        await back_out(pg, cdp)


async def meet(pg, cdp, run):
    s = base_state(WHO)
    await load(pg, cdp, s)
    lines = await pg.evaluate("(w=>{ const P=(INVITE_PLACE_LINES.places||{}); return {dian:(P.l118_dian||{})[w]||null}; })(%s)" % json.dumps(WHO))
    await pg.evaluate("(()=>{ window.__sat=[]; clearInterval(window.__satT); window.__satT=setInterval(()=>{ try{ const p=GAME.E.player; if(p&&p.seat) window.__sat.push({z:GAME.G.zone,h:+GAME.G.hour.toFixed(2)}); }catch(e){} },500); })()")
    m0 = await pg.evaluate("GAME.G.money")
    n0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    pv = await pg.evaluate("(w=>{ try{ const P=INV.place('l118_dian'); const r=INV.personal(GAME.G,w,P,GAME.G.day,12,{res:'accept'}); return {lines:r&&r.lines, res:r&&r.res}; }catch(e){ return {err:String(e)}; } })(%s)" % json.dumps(WHO))
    print('   滇香 INV.personal（照遊戲自己的挑法，接受時會說什麼）', json.dumps(pv, ensure_ascii=False), flush=True)
    said, picked = await pe.meet_once(pg, cdp, run, '吃飯', '滇香', '滇香')
    newm = await pg.evaluate("(n=>(GAME.G.msgs||[]).slice(n).map(m=>(m.from||'')+'｜'+m.text))(%d)" % n0)
    print('   約滇香以後新的訊息', json.dumps(newm, ensure_ascii=False)[:800], flush=True)
    hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.map(x=>(x.name||'')+'｜'+x.text):[]")
    msgs = await pg.evaluate("(w=>(GAME.G.msgs||[]).filter(m=>m.from===w).slice(-4).map(m=>m.text))(%s)" % json.dumps(WHO))
    allt = (said or []) + hist + msgs + newm
    core = lambda t: t.strip('（）「」 ')[:9]
    d = lines.get('dian') or {}
    run.check('滇香：見面演完', said is not None, json.dumps((said or [])[-8:], ensure_ascii=False))
    acc = d.get('acc') or []
    run.check('滇香：答應句「%s」' % (acc[0] if acc else ''), bool(acc) and any(core(acc[0]) in t for t in allt), json.dumps({'said': (said or [])[:6], 'msgs': msgs}, ensure_ascii=False))
    fa = d.get('firstAt') or []
    miss = [t for t in fa if not any(core(t) in x for x in allt)]
    run.check('滇香：第一次一起去那一句（%d 句）' % len(fa), bool(fa) and not miss, json.dumps({'miss': miss, 'hist': hist[-12:]}, ensure_ascii=False))
    sat = await pg.evaluate("window.__sat||[]")
    run.check('滇香：吃飯那一場坐下了（l118_dian 裡 E.player.seat）', any(x['z'] == 'l118_dian' for x in sat), json.dumps(sat[:5]))
    mem = await pg.evaluate("(w=>{ const M=(typeof SOCIAL!=='undefined'&&SOCIAL.memories)?SOCIAL.memories(w):null; return M?JSON.stringify(M).slice(0,400):null; })(%s)" % json.dumps(WHO))
    print('   記憶', mem, flush=True)
    await run.shot(pg, 'meet_dian_after')
    if MOVIE:
        run.setup('【捷徑】隔天早上 10 點、錢 1000、清掉 NY_TICKET')
        await pg.evaluate("(()=>{ GAME.G.day+=1; GAME.G.hour=10; GAME.G.money=1000; if(GAME.G.flags) delete GAME.G.flags.NY_TICKET; })()")
        await pg.wait_for_timeout(1500); await pe.settle(pg, cdp, [], 30)
        await pg.evaluate("(()=>{ window.__money=[]; if(GAME.money&&!GAME.__mW){ const f=GAME.money; GAME.money=function(v,why){ try{ window.__money.push({v,why,day:GAME.G.day,h:+GAME.G.hour.toFixed(2)}); }catch(e){} return f.apply(this,arguments); }; GAME.__mW=1; } })()")
        said2, _ = await pe.meet_once(pg, cdp, run, '看電影', '南洋', '南洋')
        ivs = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(v=>v.who===w).slice(-3).map(v=>({place:v.place,day:v.day,h:v.h,state:v.state})))(%s)" % json.dumps(WHO))
        print('   南洋 said', json.dumps((said2 or [])[-14:], ensure_ascii=False)[:1500], '邀約', json.dumps(ivs, ensure_ascii=False), flush=True)
        run.check('南洋：見面演了（燈暗下來那一句：%s）' % ('有' if any('燈暗下來' in x for x in (said2 or [])) else '沒有'), said2 is not None and any('燈暗下來' in x for x in (said2 or [])), json.dumps({'said': (said2 or [])[-10:], 'ivs': ivs}, ensure_ascii=False))
        mv = await pg.evaluate("({money:GAME.G.money, log:window.__money||[], tk:(GAME.G.flags||{}).NY_TICKET, day:GAME.G.day})")
        tick = [x for x in mv['log'] if x.get('why') == '電影票']
        run.check('南洋：那一場扣了 150（電影票）、記 NY_TICKET＝今天', said2 is not None and len(tick) == 1 and tick[0]['v'] == -150 and mv['tk'] == mv['day'], json.dumps(mv, ensure_ascii=False))
        await run.shot(pg, 'meet_nanyang_after')


async def movie(pg, cdp, run):
    """MODE=movie：只測看電影（當天約、當天看）：燈暗那一句、扣 150、NY_TICKET"""
    s = base_state(WHO); s['hour'] = 11.0
    await load(pg, cdp, s)
    r = await open_cat(pg, cdp, WHO, '看電影')
    lst = (r or {}).get('list') or []
    print('   看電影選單', json.dumps({'top': [x['t'] for x in ((r or {}).get('top') or [])], 'list': [x['t'] for x in lst]}, ensure_ascii=False)[:800], flush=True)
    n = find(lst, '南洋')
    run.check('看電影選單有南洋、可以選', bool(n) and not n['dim'], json.dumps(n, ensure_ascii=False))
    await back_out(pg, cdp)
    if not n or n['dim']: return
    await pg.evaluate("(()=>{ window.__money=[]; if(GAME.money&&!GAME.__mW){ const f=GAME.money; GAME.money=function(v,why){ try{ window.__money.push({v,why,day:GAME.G.day,h:+GAME.G.hour.toFixed(2)}); }catch(e){} return f.apply(this,arguments); }; GAME.__mW=1; } })()")
    said2, _ = await pe.meet_once(pg, cdp, run, '看電影', '南洋', '南洋')
    ivs = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(v=>v.who===w).slice(-3).map(v=>({place:v.place,day:v.day,h:v.h,state:v.state})))(%s)" % json.dumps(WHO))
    print('   南洋 said', json.dumps((said2 or [])[-14:], ensure_ascii=False)[:1500], '邀約', json.dumps(ivs, ensure_ascii=False), flush=True)
    run.check('南洋：見面演了、有「燈暗下來，電影開始了。」', said2 is not None and any('燈暗下來' in x for x in (said2 or [])), json.dumps({'said': (said2 or [])[-10:], 'ivs': ivs}, ensure_ascii=False))
    mv = await pg.evaluate("({money:GAME.G.money, log:window.__money||[], tk:(GAME.G.flags||{}).NY_TICKET, day:GAME.G.day})")
    tick = [x for x in mv['log'] if x.get('why') == '電影票']
    run.check('南洋：那一場扣了 150（電影票）、記 NY_TICKET＝今天', len(tick) == 1 and tick[0]['v'] == -150 and mv['tk'] == mv['day'], json.dumps(mv, ensure_ascii=False))
    await run.shot(pg, 'movie_after')


async def main():
    run = L.Run('pt1107i_' + MODE, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀使用者存檔 day46；【捷徑】day %+d 早上 10 點、清邀約；【捷徑】%s 關係到朋友；【捷徑】去過 118 巷六家（不含韓食小廚）＋南洋；錢 1000' % (SHIFT, WHO))
        has = await pg.evaluate("typeof INV!=='undefined'&&(INVITE_DATA.places||[]).some(q=>q.id==='l118_dian')&&typeof INVITE_PLACE_LINES!=='undefined'")
        run.check('這一版有 118 巷的約會地點', has)
        if has:
            if MODE == 'menu': await menu(pg, cdp, run)
            elif MODE == 'movie': await movie(pg, cdp, run)
            else: await meet(pg, cdp, run)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
