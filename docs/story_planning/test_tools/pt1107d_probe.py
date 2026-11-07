"""BB-B 2026-11-07：INVITE-PLACES-1107 瀏覽器驗收（LAWWW-B 718b59ec7）。
使用者 11-07 試玩：「daybreak 不能約?」「社科院圖書館也可以唸書吧」「吃飯餐廳也新增很多了沒有每個放進來」「有的店面都可以約吧 看書或吃飯或聊天 南洋戲院可以約看電影」。
[前置／捷徑] 讀使用者存檔（day38）；之後全部用觸控：手機「朋友」→「約」→ 一類 → 地方 → 時間。
  A：【前置】把存檔的 G.visited 拿掉這八個地點＝還沒去過：新地點不列。
  B：【捷徑】G.visited 補上這八個地點（等於自己走去過；走進去記 visited 的那段另外驗）：念書、吃飯、看電影逛書店三類各列出來。
  C：約 WHO 去南洋看電影：時間選項有 09:50／14:00／19:30 其中的（照星期）；答應那一句（照一般的「○○答應了。」，AA 還沒補）。
  D：【捷徑】讀檔到南洋、時間撥到約好的前 10 分鐘（帶著邀約）；走到她旁邊見面 → 散場那一句（AA_649 movieEnd）、時間過 2 小時、記憶 MOVIE_TOGETHER。
用法：LW_TESTS=<測試樹>/tests WHO=heroine_02 python3 pt1107d_probe.py URL 存檔.json 輸出資料夾"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L

URL, SAVE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHO = os.environ.get('WHO', 'heroine_02')
NEW = {'soclib': '社科院圖書館', 'daybreak': 'Daybreak', 'wz_lin': '林家乾麵', 'wz_teishoku': '小路', 'xs_dakou': '大口漢堡', 'xs_nanyang': '南洋戲院', 'bookstore': '頁間書屋', 'xs_shanlan': '山嵐書店'}
WANT = {'念書': ['社科院圖書館', 'Daybreak', '大口漢堡'], '吃飯': ['林家乾麵', '小路', '大口漢堡'], '看電影': ['南洋戲院', '頁間書屋', '山嵐書店']}
ZONE = "(GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id)"


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(sel))
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def choose(pg, cdp, word):
    c = await pg.evaluate("(w=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.includes(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })(%s)" % json.dumps(word))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c[2]


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")


async def run_dialog(pg, cdp, prefs, secs=40):
    said, seen = [], []
    for _ in range(int(secs / 1.2)):
        q = await L.state(pg)
        if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
        if q['choices']:
            o = await opts(pg); seen.append(o)
            t = next((x for p in prefs for x in o if p in x), None) or o[-1]
            await choose(pg, cdp, t); continue
        if not q['busy'] and not q['dlg']: break
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1200)
    return said, seen


async def open_invite(pg, cdp):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-inv="%s"]' % WHO
    if not await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel)): return False
    await tap_sel(pg, cdp, sel); await pg.wait_for_timeout(1500)
    return True


async def list_all(pg, cdp):
    """每一類點進去看列了哪些地方，再按「算了／回上一層」出來（找不到就整個關掉重開）"""
    out = {}
    cats = await opts(pg)
    for c in cats:
        if any(w in c for w in ('算了', '不約', '就這樣', '下次')): continue
        await choose(pg, cdp, c)
        out[c] = await opts(pg)
        back = next((x for x in out[c] if any(w in x for w in ('上一層', '換一類', '回去', '返回'))), None)
        if back: await choose(pg, cdp, back)
        else:
            q = next((x for x in out[c] if any(w in x for w in ('算了', '不約'))), out[c][-1] if out[c] else None)
            if q: await choose(pg, cdp, q)
            await run_dialog(pg, cdp, [], 10)
            if not await open_invite(pg, cdp): break
        cats2 = await opts(pg)
        if not cats2: break
    return cats, out


async def main():
    run = L.Run('pt1107d', OUT)
    s = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # A：還沒去過
        sA = dict(s); vis = dict(s.get('visited') or {})
        for k in NEW: vis.pop(k, None)
        sA['visited'] = vis; sA.update({'zone': 'campus', 'hour': 10.0, 'pos': None})
        run.setup('【前置】使用者存檔 %s，10:00 校園；visited 拿掉 %s＝還沒去過' % (os.path.basename(SAVE), '、'.join(NEW)))
        await L.load_state(pg, sA, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(3500); await run_dialog(pg, cdp, [], 20)
        st = await pg.evaluate("(w=>({stage:INV.stageOf?INV.stageOf(GAME.G,w):null, name:(CHARACTERS[w]||{}).name}))(%s)" % json.dumps(WHO))
        print('   關係', st, flush=True)
        ok = await open_invite(pg, cdp)
        run.check('[A] 手機「朋友」有 %s 的「約」' % WHO, ok)
        if not ok: return run.finish()
        catsA, outA = await list_all(pg, cdp)
        print('   [A] 一類', catsA, json.dumps(outA, ensure_ascii=False), flush=True)
        flatA = ' '.join(x for v in outA.values() for x in v)
        run.check('[A] 還沒去過：新的地點都不列', not any(n in flatA for n in NEW.values()), json.dumps(outA, ensure_ascii=False))
        await run.shot(pg, 'A_cats')
        await run_dialog(pg, cdp, ['算了', '不約'], 10)
        # B：去過
        sB = dict(sA); vis2 = dict(vis); vis2.update({k: 1 for k in NEW}); sB['visited'] = vis2
        run.setup('【捷徑】visited 補上這八個地點（等於自己走去過）')
        await L.load_state(pg, sB, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(3500); await run_dialog(pg, cdp, [], 20)
        await open_invite(pg, cdp)
        catsB, outB = await list_all(pg, cdp)
        print('   [B] 一類', catsB, json.dumps(outB, ensure_ascii=False), flush=True)
        run.check('[B] 有新的一類「看電影、逛書店」', any('看電影' in c for c in catsB), json.dumps(catsB, ensure_ascii=False))
        for cat, names in WANT.items():
            k = next((c for c in outB if cat in c), None)
            got = ' '.join(outB.get(k) or [])
            miss = [n for n in names if n not in got]
            run.check('[B] 「%s」那一類有 %s' % (cat, '、'.join(names)), k is not None and not miss, json.dumps({'cat': k, 'list': outB.get(k), 'miss': miss}, ensure_ascii=False))
        await run_dialog(pg, cdp, ['算了', '不約'], 10)
        # C：約看電影
        await open_invite(pg, cdp)
        c1 = await choose(pg, cdp, '看電影')
        c2 = await choose(pg, cdp, '南洋戲院') if c1 else None
        run.check('[C] 選得到「看電影、逛書店」→「南洋戲院」', bool(c1 and c2), json.dumps([c1, c2], ensure_ascii=False))
        if not c2: return run.finish()
        tops = await opts(pg); print('   [C] 時間', tops, flush=True)
        run.check('[C] 時間選項是場次（09:50／14:00／19:30 其中的）', bool(tops) and all(any(t in x for t in ('09:50', '9:50', '14:00', '19:30')) or any(w in x for w in ('算了', '換', '別天', '下次', '不約')) for x in tops), json.dumps(tops, ensure_ascii=False))
        pick = next((x for x in tops if '14:00' in x and '明天' in x), None) or next((x for x in tops if '19:30' in x), None) or next((x for x in tops if '14:00' in x or '09:50' in x or '9:50' in x), None)
        m0 = await pg.evaluate("(GAME.G.msgs||[]).length")
        said, seen = await run_dialog(pg, cdp, [pick] if pick else [], 40)
        await pg.wait_for_timeout(2500)
        msgs = await pg.evaluate("(m0=>(GAME.G.msgs||[]).slice(m0).map(m=>[m.from||m.who||'',m.text||'']))(%d)" % m0)
        iv = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(i=>i.who===w&&i.place==='xs_nanyang'&&i.state!=='done').map(i=>({day:i.day,h:i.h,state:i.state,place:i.place})))(%s)" % json.dumps(WHO))
        print('   [C] 選了', pick, '她說', said, '訊息', msgs, '邀約', iv, flush=True)
        run.check('[C] 約好了（G.invites 有南洋那一筆）', bool(iv), json.dumps({'said': said, 'msgs': msgs, 'seen': seen}, ensure_ascii=False))
        await run.shot(pg, 'C_accept')
        if not iv: return run.finish()
        # D：見面看電影
        v = iv[0]
        cur = await pg.evaluate("({invites:GAME.G.invites, day:GAME.G.day, money:GAME.G.money, msgs:GAME.G.msgs, social:GAME.G.social})")
        sD = dict(sB); sD.update({'zone': 'xs_nanyang', 'pos': None, 'day': v['day'], 'hour': max(0, v['h'] - 0.17), 'invites': cur['invites'], 'money': cur['money']})
        if cur.get('msgs') is not None: sD['msgs'] = cur['msgs']
        if cur.get('social') is not None: sD['social'] = cur['social']
        run.setup('【捷徑】讀檔到南洋戲院，第 %s 天 %.2f（約好的前 10 分鐘），帶著邀約' % (v['day'], v['h'] - 0.17))
        await L.load_state(pg, sD, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(4000)
        said0, _ = await run_dialog(pg, cdp, [], 20)
        mem0 = await pg.evaluate("(w=>{ const m=(GAME.G.social&&GAME.G.social.mem&&GAME.G.social.mem[w])||[]; return m.filter(x=>(x.k||x.key||x.id||x)==='MOVIE_TOGETHER'||JSON.stringify(x).includes('MOVIE_TOGETHER')).length; })(%s)" % json.dumps(WHO))
        h0 = await pg.evaluate("GAME.G.hour")
        n = None
        for _ in range(40):
            n = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0,pose:n.pose}:null; })(%s)" % json.dumps(WHO))
            if n: break
            await pg.wait_for_timeout(1000)
        run.check('[D] 她到戲院了', bool(n), json.dumps({'n': n, 'hour': await pg.evaluate('GAME.G.hour'), 'said': said0}, ensure_ascii=False))
        if not n: return run.finish()
        await L.go_to(pg, cdp, run, n['x'], n['z'], 1.2, '她旁邊', lv=n['lv'])
        said1, seen1 = await run_dialog(pg, cdp, ['好', '走吧', '進去'], 120)
        lab = await pg.evaluate("(document.getElementById('interactLabel')||{}).textContent||''")
        if not said1 and lab:
            print('   [D] 互動鍵', lab, flush=True)
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            said1, seen1 = await run_dialog(pg, cdp, ['好', '走吧', '進去'], 120)
        h1 = await pg.evaluate("GAME.G.hour")
        mem1 = await pg.evaluate("(w=>{ const m=(GAME.G.social&&GAME.G.social.mem&&GAME.G.social.mem[w])||[]; return m.filter(x=>JSON.stringify(x).includes('MOVIE_TOGETHER')).length; })(%s)" % json.dumps(WHO))
        ME = await pg.evaluate("((INVITE_DATA.seatOpen||{}).movieEnd||[]).flat()")
        MV = await pg.evaluate("((INVITE_DATA.seatOpen||{}).movie||[]).flat()")
        print('   [D] 見面', said1, seen1, 'hour', h0, '→', h1, flush=True)
        run.check('[D] 散場那一句（AA_649 movieEnd）有演', any(any(m.strip('「」') in t for m in ME) for t in said1), json.dumps({'said': said1, 'movieEnd': ME}, ensure_ascii=False))
        run.check('[D] 坐下的開場（AA_649 movie）有演', any(any(m.strip('「」') in t for m in MV) for t in said1), json.dumps({'movie': MV}, ensure_ascii=False))
        run.check('[D] 時間過了約 2 小時', h1 - h0 >= 1.8, '%.2f → %.2f' % (h0, h1))
        run.check('[D] 記憶 MOVIE_TOGETHER 多一筆', mem1 > mem0, '%d → %d' % (mem0, mem1))
        odd = [t for t in said1 if '你也在' in t]
        run.check('[D] 約好的見面不說「你也在」（那是偶遇的句子）', not odd, json.dumps(odd, ensure_ascii=False))
        await run.shot(pg, 'D_after')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
