"""BB-B 2026-11-07：GIFT-FLIRT-1107 送飲料瀏覽器驗收（LAWWW-B a641c0459，台詞 AA_710）。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】改到 2:30 AM 店裡 13:00；之後觸控：走到櫃台 → 點餐「買一份帶走送人…」→ 拿鐵、再買一杯美式（同一種＝飲料）。
  【捷徑】以安現在在哪（STORY.whereIs）；不在就把時間撥到她在某處的時候；手機「地點」過去 → 走到她旁邊 → 說話 →「送她拿鐵」：她的反應在 AA_710 以安那一組、拿鐵不在身上了。
  同一天再說話 →「送她美式咖啡」：她不收（AA_710 no）、美式還在身上。
用法：LW_TESTS=<測試樹>/tests WHO=heroine_01 python3 pt1107c_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHO = os.environ.get('WHO', 'heroine_01')
ZONE = "(GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id)"


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(sel))
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def choose(pg, cdp, word):
    c = await pg.evaluate("(w=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.includes(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })(%s)" % json.dumps(word))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1300); return c[2]


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")


async def run_dialog(pg, cdp, prefs, secs=40):
    """點對話；選項照 prefs 的順序挑（找不到就選第一個不是算了的）。回傳 (台詞, 看過的選項)"""
    said, seen = [], []
    for _ in range(secs * 2):
        q = await L.state(pg)
        if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
        if q['choices']:
            o = await opts(pg); seen.append(o)
            w = next((p for p in prefs if any(p in x for x in o)), None)
            if w is None: w = next((x for x in o if not any(k in x for k in ('算了', '返回', '不用'))), o[0])
            await choose(pg, cdp, w); continue
        if not q['busy'] and not q['dlg']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return said, seen


async def carry(pg):
    return await pg.evaluate("(GIFT.carry(GAME.G)||[]).map(c=>c.n)")


async def walk_use(pg, cdp, run, x, z, lv, label, near=1.2):
    await L.go_to(pg, cdp, run, x, z, near, label, lv=lv)
    for _ in range(14):
        s = await L.state(pg)
        if (s['interact'] or '').startswith(label): break
        await pg.wait_for_timeout(500)
    ok = (s['interact'] or '').startswith(label)
    if ok: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    return ok, s


async def main():
    run = L.Run('pt1107c', OUT)
    SAVE = os.environ.get('SAVE', 'fatiao3d_save_day38.json')   # day46 那天下午有溫州街「颱風後的院子」（ev_wz_t3）會把人帶去一盞，改用 day38
    s = json.load(open(os.path.join(SAVES, SAVE), encoding='utf-8'))
    SHOPZ = os.environ.get('SHOPZ', 'cvs')   # cvs＝日和便利店（櫃台沒有女主角）；cafe＝2:30 AM（芷若當班時互動鍵會變成和她說話）
    s2 = dict(s); s2.update({'zone': SHOPZ, 'hour': 13.0, 'pos': None})
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('【捷徑】使用者存檔 %s 改成 13:00、2:30 AM 店裡（錢 %s 元）；關條件事件（這支只測送東西）' % (SAVE, s.get('money')))
        await L.load_state(pg, s2, quiet_events=True)
        await pg.wait_for_timeout(3500)
        await run_dialog(pg, cdp, [], 30)
        allowed = await pg.evaluate("(w=>{ const S=new Set(); const walk=o=>{ if(typeof o==='string') S.add(o.replace(/^「|」$/g,'')); else if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object') Object.values(o).forEach(walk); }; walk(((GIFT_LINES||{}).people||{})[w]); return [...S]; })(%s)" % json.dumps(WHO))
        ct = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>q.counter==='cafe'||q.shop==='cvs'); return i?{x:i.x,z:i.z,lv:i.lv|0,label:i.label}:null; })()")
        run.check('%s 有櫃台' % SHOPZ, bool(ct), json.dumps(ct, ensure_ascii=False))
        if not ct: return run.finish()
        for item, extra in (('拿鐵', None), ('美式咖啡', '熱的')) if SHOPZ == 'cafe' else (('紅茶拿鐵', None), ('豆漿', None)):
            for tr in range(3):   # 半路有人搭話（店裡的事件）：先演完再走一次
                ok, st = await walk_use(pg, cdp, run, ct['x'], ct['z'], ct['lv'], ct['label'], 0.9)
                if ok: break
                ps = await pg.evaluate("({x:+GAME.E.player.obj.position.x.toFixed(2),z:+GAME.E.player.obj.position.z.toFixed(2),lv:GAME.E.player.lv|0,zone:%s})" % ZONE)
                print('   沒走到櫃台（第 %d 次）' % (tr + 1), ps, st.get('interact'), flush=True)
                await run.shot(pg, 'counter_miss_%d' % tr)
                await run_dialog(pg, cdp, [], 20)
            if not ok and (st.get('interact') or '').startswith('和'):
                # 吧檯有人當班時互動鍵是「和○○說話」：按了看選項有沒有點餐（玩家實際會這樣按）
                print('   櫃台的互動鍵是「%s」→ 按按看' % st.get('interact'), flush=True)
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                for _ in range(16):
                    o = await opts(pg)
                    if o: break
                    q = await L.state(pg)
                    if q['dlg']: await L.tap(pg, cdp, '#dlg')
                    await pg.wait_for_timeout(500)
                print('   說話的選項', o, flush=True)
                run.check('吧檯當班時，說話的選項裡點得到餐（%s）' % item, any(('點' in x or '買' in x) for x in o), json.dumps(o, ensure_ascii=False))
                c = next((x for x in o if '點' in x or '買' in x), None)
                if c: await choose(pg, cdp, c)
            pre = []
            for _ in range(24):   # 店員先說話、選單才出來
                o = await opts(pg)
                if o: break
                q = await L.state(pg)
                if q['dtext'] and (not pre or pre[-1] != q['dtext']): pre.append(q['dtext'])
                if q['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(500)
            print('   櫃台', ok, st.get('interact'), pre[-3:], o, flush=True)
            run.check('櫃台點餐有「買一份帶走送人…」（買%s）' % item, any('買一份帶走送人' in x for x in o), json.dumps(o, ensure_ascii=False))
            if not any('買一份帶走送人' in x for x in o): return run.finish()
            await choose(pg, cdp, '買一份帶走送人')
            said, seen = await run_dialog(pg, cdp, [item] + ([extra] if extra else []), 20)
            print('   買%s' % item, seen, said[-3:], flush=True)
        c1 = await carry(pg)
        BUY = ('拿鐵', '美式') if SHOPZ == 'cafe' else ('紅茶拿鐵', '豆漿')
        run.check('身上帶著%s、%s' % BUY, all(any(b in x for x in c1) for b in BUY), json.dumps(c1, ensure_ascii=False))
        # 找她
        w = await pg.evaluate("(w=>{ const r=STORY.whereIs(GAME,w)||STORY.whereIs(GAME.GM||GAME,w); return r||null; })(%s)" % json.dumps(WHO))
        if not w or w.get('away') or not w.get('zone'):
            h = await pg.evaluate("(w=>{ const h0=GAME.G.hour; for(let h=Math.ceil(h0*2)/2; h<21; h+=0.5){ GAME.G.hour=h; const r=STORY.whereIs(GAME,w); if(r&&r.zone&&!r.away){ return h; } } GAME.G.hour=h0; return null; })(%s)" % json.dumps(WHO))
            run.setup('【捷徑】%s 現在不在（%s），時間撥到 %s 她在的時候' % (WHO, json.dumps(w, ensure_ascii=False), h))
            w = await pg.evaluate("(w=>STORY.whereIs(GAME,w))(%s)" % json.dumps(WHO))
        print('   她在', w, flush=True)
        run.check('找得到她現在在哪', bool(w and w.get('zone')), json.dumps(w, ensure_ascii=False))
        if not (w and w.get('zone')): return run.finish()
        if await pg.evaluate(ZONE) != w['zone']:
            await pg.evaluate("document.getElementById('phone').classList.contains('hide')") and await L.tap(pg, cdp, '#btnPhone')
            await pg.wait_for_timeout(900); await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
            sel = '#phoneBody [data-place^="%s|"]' % w['zone']
            if not await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel)):
                area = await pg.evaluate("(z=>{ const bs=[...document.querySelectorAll('#phoneBody [data-parea]')]; for(const b of bs){ b.click(); if(document.querySelector('#phoneBody [data-place^=\"'+z+'|\"]')) return b.dataset.parea; } return null; })(%s)" % json.dumps(w['zone']))
                print('   展開分區', area, flush=True)
            ok = await tap_sel(pg, cdp, sel)
            await run_dialog(pg, cdp, [], 60)
            run.check('手機「地點」到她那裡（%s）' % w['zone'], await pg.evaluate(ZONE) == w['zone'], await pg.evaluate(ZONE))
        n = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; })(%s)" % json.dumps(WHO))
        run.check('她在這一區（NPC）', bool(n), json.dumps(n))
        if not n: return run.finish()
        lab = await pg.evaluate("(w=>{ const i=GAME.E.interactables.find(q=>(q.npc&&(q.npc.id===w||q.npc.charId===w))||q.charId===w||q.who===w); return i?i.label:null; })(%s)" % json.dumps(WHO))
        lab = lab or '和'
        for k, (want, expect_kept) in enumerate((('送她' + BUY[0], False), ('送她' + BUY[1], True))):
            n = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; })(%s)" % json.dumps(WHO))
            ok, st = await walk_use(pg, cdp, run, n['x'], n['z'], n['lv'], lab, 1.4)
            run.check('[%d] 走到她旁邊、互動鍵「%s…」' % (k + 1, lab), ok, json.dumps({kk: st[kk] for kk in ('x', 'z', 'interact')}, ensure_ascii=False))
            if not ok: break
            said, seen = await run_dialog(pg, cdp, [want], 40)
            had = any(want in x for o in seen for x in o)
            run.check('[%d] 說話的選項有「%s」' % (k + 1, want), had, json.dumps(seen[:3], ensure_ascii=False))
            hers = [l.split('｜', 1)[-1].strip('「」') for l in said if '｜' in l]
            print('   [%d] 她說' % (k + 1), said[:10], flush=True)
            c2 = await carry(pg)
            item = want.replace('送她', '')
            run.check('[%d] 她的話在 AA_710 她那一組（%d 句）' % (k + 1, len(hers)), hers and all(any(h in a or a in h for a in allowed) for h in hers), json.dumps({'hers': hers}, ensure_ascii=False))
            run.check('[%d] %s：%s' % (k + 1, item, '她不收、還在身上' if expect_kept else '送出去了、不在身上'), (any(item in x for x in c2)) == expect_kept, json.dumps(c2, ensure_ascii=False))
            await run.shot(pg, 'gift_%d' % (k + 1))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
