"""BB-B 2026-11-08：GIFT-FLIRT-1107 送給朋友（LAWWW-B 6e3d4e9dd＋fa81abb92，台詞 AA_728 gifts_friends@6528d7681）瀏覽器抽查。
[前置／捷徑] 讀使用者存檔（預設 day38），【捷徑】改到 13:00 日和便利店；之後觸控：走到櫃台 →「買一份帶走送人…」→ 紅茶拿鐵、青茶（兩樣都是飲料）、飯糰（早餐）。
  找阿凱（kai）：【捷徑】STORY.whereIs，不在就撥時間；手機「地點」過去（點不到才讀檔到那一區，帶著買的東西）→ 走到他旁邊說話
    → 「送他紅茶拿鐵」：他回的話在 AA_728 阿凱那一組、紅茶拿鐵不在身上、好感 fam／comf 各 +1
    → 同一天再說話「送他青茶」：他不收（no 那一組）、青茶還在身上、好感不再加
  再找 Alison（yu）→「送她青茶」：她收（同一種，但換一個人可以）、她的話在 AA_728 Alison 那一組
    →「送她飯糰」：同一天不同種可以收、早餐那一組（fa81abb92 補）、好感一天只算一次。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<測試樹>/tests python3 pt1108g_gift_friends_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, math, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import pt1107c_probe as C   # 共用：choose、opts、run_dialog、carry、walk_use

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
ZONE = C.ZONE
J = lambda o: json.dumps(o, ensure_ascii=False)
BUY = ('紅茶拿鐵', '青茶', '飯糰')


async def buy(pg, cdp, run, ct, item, extra=None):
    for tr in range(3):
        ok, st = await C.walk_use(pg, cdp, run, ct['x'], ct['z'], ct['lv'], ct['label'], 0.9)
        if ok: break
        await C.run_dialog(pg, cdp, [], 20)
    o = []
    for _ in range(24):
        o = await C.opts(pg)
        if o: break
        q = await L.state(pg)
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    if not any('買一份帶走送人' in x for x in o):
        run.check('櫃台有「買一份帶走送人…」（買%s）' % item, False, J(o)); return False
    await C.choose(pg, cdp, '買一份帶走送人')
    await C.run_dialog(pg, cdp, [item] + ([extra] if extra else []), 20)
    return True


async def go_to_person(pg, cdp, run, s2, who, hour=None):
    if hour is not None:
        await pg.evaluate("h=>{ GAME.G.hour=h; }", hour)
        run.setup('【捷徑】時間撥到 %s（同一天；%s 這時候不在打工）' % (hour, who))
    w = await pg.evaluate("(w=>STORY.whereIs(GAME,w)||null)(%s)" % J(who))
    if not w or w.get('away') or not w.get('zone'):
        # 先往後找；今天後面都不在（例：Alison 週五 18:00～23:00 在南洋戲院打工）就從早上 8:00 找——時間往回撥是捷徑，送禮紀錄照日期記、不受影響
        h = await pg.evaluate("(w=>{ const h0=GAME.G.hour; const tryH=h=>{ GAME.G.hour=h; const r=STORY.whereIs(GAME,w); return r&&r.zone&&!r.away; }; for(let h=Math.ceil(h0*2)/2; h<21; h+=0.5) if(tryH(h)) return h; for(let h=8; h<h0; h+=0.5) if(tryH(h)) return h; GAME.G.hour=h0; return null; })(%s)" % J(who))
        run.setup('【捷徑】%s 現在不在，時間撥到 %s 在的時候（%s）' % (who, h, '往回撥，同一天' if (h is not None and h < 18) else '往後'))
        w = await pg.evaluate("(w=>STORY.whereIs(GAME,w)||null)(%s)" % J(who))
    print('   %s 在' % who, w, flush=True)
    if not (w and w.get('zone')):
        run.check('找得到 %s 現在在哪' % who, False, J(w)); return None
    if await pg.evaluate(ZONE) != w['zone']:
        # 手機地點的分區點法這支不測（pt1107c 已驗過「前往」）：【捷徑】用目前的整份狀態（GM.snapshot：身上的東西、今天送過的紀錄、好感）讀檔到那一區
        s3 = await pg.evaluate("(z=>{ const s=JSON.parse(JSON.stringify(GAME.snapshot?GAME.snapshot():GAME.G)); s.zone=z; s.pos=null; return s; })(%s)" % J(w['zone']))
        run.setup('【捷徑】目前的狀態讀檔到 %s（帶著 %s）' % (w['zone'], await C.carry(pg)))
        await L.load_state(pg, s3, quiet_events=True); await pg.wait_for_timeout(3500); await C.run_dialog(pg, cdp, [], 20)
    n = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; })(%s)" % J(who))
    run.check('%s 在這一區（NPC）' % who, bool(n), J(n))
    return n


async def give(pg, cdp, run, who, want, allowed, tag):
    n = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; })(%s)" % J(who))
    lab = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n&&n.talkLabel||('和'+SOCIAL.npcName(w)+'說話'); })(%s)" % J(who))
    ok, st = await C.walk_use(pg, cdp, run, n['x'], n['z'], n['lv'], lab, 1.4)
    if not ok:
        for a in range(8):
            tx, tz = n['x'] + 0.9 * math.cos(a * math.pi / 4), n['z'] + 0.9 * math.sin(a * math.pi / 4)
            ok, st = await C.walk_use(pg, cdp, run, tx, tz, n['lv'], lab, 0.35)
            if ok: break
    run.check('%s 走到旁邊、互動鍵「%s…」' % (tag, lab), ok, J({k: st.get(k) for k in ('x', 'z', 'interact')}))
    if not ok: return None
    r0 = await pg.evaluate("w=>Object.assign({},SOCIAL.rel(w))", who)
    said, seen = await C.run_dialog(pg, cdp, [want], 40)
    had = any(want in x for o in seen for x in o)
    run.check('%s 說話的選項有「%s」' % (tag, want), had, J(seen[:3]))
    r1 = await pg.evaluate("w=>Object.assign({},SOCIAL.rel(w))", who)
    hers = [l.strip('「」') for l in said if any(l.strip('「」') == a or (len(l) > 3 and l.strip('「」') in a) for a in allowed)]
    print('   %s 說' % tag, said[:10], flush=True)
    await run.shot(pg, tag)
    return {'had': had, 'hers': hers, 'carry': await C.carry(pg), 'd': {k: (r1.get(k, 0) or 0) - (r0.get(k, 0) or 0) for k in ('fam', 'comf', 'trust', 'rom')}, 'said': said}


async def main():
    run = L.Run('pt1108g_gift_friends', OUT)
    SAVE = os.environ.get('SAVE', 'fatiao3d_save_day38.json')
    s = json.load(open(os.path.join(SAVES, SAVE), encoding='utf-8'))
    s2 = dict(s); s2.update({'zone': 'cvs', 'hour': 13.0, 'pos': None})
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('【捷徑】使用者存檔 %s 改成 13:00 日和便利店（錢 %s 元）；關條件事件（這支只測送東西）' % (SAVE, s.get('money')))
        await L.load_state(pg, s2, quiet_events=True); await pg.wait_for_timeout(3500); await C.run_dialog(pg, cdp, [], 30)
        allowed = lambda who, part: pg.evaluate("(([w,k])=>{ const S=new Set(); const walk=o=>{ if(typeof o==='string') S.add(o.replace(/^「|」$/g,'')); else if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object') Object.values(o).forEach(walk); }; walk((((GIFT_LINES.friends||{}).people||{})[w]||{})[k]); return [...S]; })(%s)" % J([who, part]))
        ct = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>q.shop==='cvs'||q.counter==='cvs'); return i?{x:i.x,z:i.z,lv:i.lv|0,label:i.label}:null; })()")
        run.check('便利商店有櫃台', bool(ct), J(ct))
        if not ct: return run.finish()
        for item, extra in ((BUY[0], None), (BUY[1], '微糖'), (BUY[2], None)):
            if not await buy(pg, cdp, run, ct, item, extra): return run.finish()
        c1 = await C.carry(pg)
        run.check('身上帶著%s、%s、%s' % BUY, all(any(x.startswith(bn) for x in c1) for bn in BUY), J(c1))
        SKIP_KAI = os.environ.get('SKIP_KAI') == '1'   # 阿凱那一段前兩輪都 PASS；只補 Alison 時跳過
        # 阿凱
        if SKIP_KAI:
            run.note('阿凱那一段這一輪不跑（前一輪 ALL PASS）')
        elif not await go_to_person(pg, cdp, run, s2, 'kai'): return run.finish()
        g1 = None if SKIP_KAI else await give(pg, cdp, run, 'kai', '送他' + BUY[0], await allowed('kai', 'drink'), 'kai_1')
        if g1:
            run.check('[阿凱 1] 「送他%s」：他的話在 AA_728 阿凱那一組（%d 句）' % (BUY[0], len(g1['hers'])), len(g1['hers']) >= 1, J(g1['hers']))
            run.check('[阿凱 1] %s 送出去了' % BUY[0], not any(x.startswith(BUY[0]) for x in g1['carry']), J(g1['carry']))
            run.check('[阿凱 1] 好感 fam +1、comf +1、戀愛不動', g1['d']['fam'] == 1 and g1['d']['comf'] == 1 and not g1['d']['rom'], J(g1['d']))
        g2 = None if SKIP_KAI else await give(pg, cdp, run, 'kai', '送他' + BUY[1], await allowed('kai', 'no'), 'kai_2')
        if g2:
            run.check('[阿凱 2] 同一天再送一杯飲料：他不收（no 那一組）', len(g2['hers']) >= 1, J(g2['hers']))
            run.check('[阿凱 2] %s 還在身上' % BUY[1], any(x.startswith(BUY[1]) for x in g2['carry']), J(g2['carry']))
            run.check('[阿凱 2] 好感不再加', not any(g2['d'].values()), J(g2['d']))
        # Alison
        YH = os.environ.get('YU_HOUR')   # Alison 週五、六 18:00～23:00 在南洋戲院櫃檯（店員，說話鍵不是「和Alison說話」）：給 10 就是早上在晨思鐘旁
        if not await go_to_person(pg, cdp, run, s2, 'yu', float(YH) if YH else None): return run.finish()
        g3 = await give(pg, cdp, run, 'yu', '送她' + BUY[1], await allowed('yu', 'drink'), 'yu_1')
        if g3:
            run.check('[Alison] 「送她%s」：換一個人可以收、她的話在 AA_728 Alison 那一組' % BUY[1], len(g3['hers']) >= 1 and not any(x.startswith(BUY[1]) for x in g3['carry']), J([g3['hers'], g3['carry']]))
            run.check('[Alison] 好感 fam +1、comf +1', g3['d']['fam'] == 1 and g3['d']['comf'] == 1, J(g3['d']))
        g4 = await give(pg, cdp, run, 'yu', '送她' + BUY[2], await allowed('yu', 'breakfast'), 'yu_2')
        if g4:
            run.check('[Alison 早餐] 「送她飯糰」：同一天不同種可以收、她的話在 AA_728 Alison 早餐那一組（fa81abb92 補的，不是「喝了一口」）', len(g4['hers']) >= 1 and not any(x.startswith(BUY[2]) for x in g4['carry']) and not any('喝' in l for l in g4['said']), J([g4['hers'], g4['carry']]))
            run.check('[Alison 早餐] 好感一天只算一次（第二樣不再加）', not any(g4['d'].values()), J(g4['d']))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
