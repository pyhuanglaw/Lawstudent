"""BB-B 2026-11-08：GIFT-ROMANCE-ONLY-1108（LAWWW-B 33127181b；使用者 11-08 15:2x「送飲料只需要給可攻略的對象」「飲料改完再發布」；AA-B 15:33「芯慈留」）瀏覽器抽查。
看「當面說話跳出來的選項」：
  ① 阿凱（kai）、Alison（yu）、阿哲（zhe）：帶著飲料當面說話，選項裡沒有「送他／送她○○」，東西還在身上；
  ② 以安（heroine_01）：照舊有「送她○○」，選了會收下、東西送出去；
  ③ 芯慈（classmate_xinci）：她的線打開（XCROM.ON true，遊戲現在的設定）有「送她○○」；
     【捷徑】把 XCROM.ON 改成 false（線關著）再說話＝沒有「送她○○」；
  ④ 沒有 JS 例外。
MODE=old：用 Playwright 把 src/gift3d.js 換成 OLD_GIFT3D（9eef2b95b 那一版）——預期 ① 失敗（朋友都有「送」），證明這支抓得到。
[前置／捷徑] 讀使用者存檔（預設 day38），【捷徑】改到 13:00 日和便利店、關條件事件（這支只測送東西）；之後觸控：走到櫃台 →「買一份帶走送人…」→ 青茶（微糖）、紅茶拿鐵。
  找人：【捷徑】STORY.whereIs，不在就撥時間；不在這一區就用目前的整份狀態讀檔到那一區（帶著買的東西）→ 走到旁邊說話（觸控）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<測試樹>/tests [MODE=old OLD_GIFT3D=<舊 gift3d.js>] python3 pt1108n_gift_romance_only_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, math, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import pt1107c_probe as C   # choose、opts、run_dialog、carry、walk_use
import pt1108g_gift_friends_probe as G8   # buy、go_to_person

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'new')
OLD = os.environ.get('OLD_GIFT3D')
J = lambda o, n=1200: json.dumps(o, ensure_ascii=False)[:n]
BUY = ('青茶', '紅茶拿鐵')
NEUTRAL = ['算了', '不用了', '先這樣', '沒事', '聊天', '聊聊', '閒聊']   # 只看選項、不送：有「算了」類的先選，沒有就聊天


async def npc_of(pg, who):
    return await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; })(%s)" % J(who))


async def talk(pg, cdp, run, who, prefs, tag):
    """走到他旁邊、按互動鍵；第一組選項就是當面說話的選單。回傳 (第一組選項, 全部選項, 說的話)"""
    n = await npc_of(pg, who)
    if not n:
        run.check('%s 在這一區' % tag, False); return None
    lab = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n&&n.talkLabel||('和'+SOCIAL.npcName(w)+'說話'); })(%s)" % J(who))
    ok, st = await C.walk_use(pg, cdp, run, n['x'], n['z'], n['lv'], lab, 1.4)
    if not ok:
        for a in range(8):
            n = await npc_of(pg, who) or n
            tx, tz = n['x'] + 0.9 * math.cos(a * math.pi / 4), n['z'] + 0.9 * math.sin(a * math.pi / 4)
            ok, st = await C.walk_use(pg, cdp, run, tx, tz, n['lv'], lab, 0.35)
            if ok: break
    run.check('%s 走到旁邊、互動鍵「%s」' % (tag, lab), ok, J({k: st.get(k) for k in ('x', 'z', 'interact')}))
    if not ok: return None
    said, seen = await C.run_dialog(pg, cdp, prefs, 40)
    await run.shot(pg, tag)
    print('   %s 選項' % tag, seen[:2], flush=True)
    return (seen[0] if seen else []), seen, said


async def main():
    run = L.Run('pt1108n_gift_romance_only_' + MODE, OUT)
    SAVE = os.environ.get('SAVE', 'fatiao3d_save_day38.json')
    s = json.load(open(os.path.join(SAVES, SAVE), encoding='utf-8'))
    s2 = dict(s); s2.update({'zone': 'cvs', 'hour': 13.0, 'pos': None})
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        if MODE == 'old':
            body = open(OLD, encoding='utf-8').read()
            await pg.route('**/src/gift3d.js*', lambda r: r.fulfill(status=200, content_type='application/javascript; charset=utf-8', body=body))
            run.setup('[前置] MODE=old：src/gift3d.js 換成 %s（%d 字）' % (OLD, len(body)))
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        fo = await pg.evaluate("(()=>{ const o=(typeof GIFT!=='undefined'&&GIFT.FRIEND_OK)||null; return o?Object.keys(o):null; })()")
        run.note('GIFT.FRIEND_OK：%s；XCROM.ON：%s' % (J(fo), await pg.evaluate("typeof XCROM!=='undefined'?XCROM.ON:'no XCROM'")))
        run.setup('【捷徑】使用者存檔 %s 改成 13:00 日和便利店（錢 %s 元）；關條件事件' % (SAVE, s.get('money')))
        await L.load_state(pg, s2, quiet_events=True); await pg.wait_for_timeout(3500); await C.run_dialog(pg, cdp, [], 30)
        ct = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>q.shop==='cvs'||q.counter==='cvs'); return i?{x:i.x,z:i.z,lv:i.lv|0,label:i.label}:null; })()")
        run.check('便利商店有櫃台', bool(ct), J(ct))
        if not ct: return run.finish()
        for item, extra in ((BUY[0], '微糖'), (BUY[1], None)):
            if not await G8.buy(pg, cdp, run, ct, item, extra): return run.finish()
        c1 = await C.carry(pg)
        run.check('身上帶著%s、%s' % BUY, all(any(x.startswith(bn) for x in c1) for bn in BUY), J(c1))
        # ① 朋友：沒有「送」
        for who, name, hour in (('kai', '阿凱', None), ('yu', 'Alison', 10.0), ('zhe', '阿哲', None)):
            if not await G8.go_to_person(pg, cdp, run, s2, who, hour):
                run.note('%s 找不到（這一輪不看他）' % name); continue
            c0 = await C.carry(pg)
            r = await talk(pg, cdp, run, who, NEUTRAL, 'f_' + who)
            if not r: continue
            menu, seen, said = r
            gifts = [o for grp in seen for o in grp if o.startswith('送他') or o.startswith('送她')]
            run.check('① [%s] 當面說話的選項沒有「送他／送她○○」' % name, bool(menu) and not gifts, J({'menu': menu, 'gifts': gifts}))
            run.check('① [%s] 東西還在身上' % name, sorted(await C.carry(pg)) == sorted(c0), J({'before': c0, 'after': await C.carry(pg)}))
        # ② 以安：照舊有，選了收下
        if await G8.go_to_person(pg, cdp, run, s2, 'heroine_01', None):
            c0 = await C.carry(pg)
            r = await talk(pg, cdp, run, 'heroine_01', ['送她' + BUY[0]], 'h_yian')
            if r:
                menu, seen, said = r
                had = any(('送她' + BUY[0]) in o for o in menu)
                run.check('② [以安] 選項有「送她%s」' % BUY[0], had, J(menu))
                c2 = await C.carry(pg)
                run.check('② [以安] 選了以後%s送出去了、她有回話' % BUY[0], had and len(c2) == len(c0) - 1 and not any(x.startswith(BUY[0]) for x in c2) and len(said) >= 2, J({'carry': c2, 'said': said[:6]}))
        else:
            run.check('② 找得到以安', False)
        # ③ 芯慈：線開著有、線關著沒有
        if await G8.go_to_person(pg, cdp, run, s2, 'classmate_xinci', None):
            on = await pg.evaluate("typeof XCROM!=='undefined'?XCROM.ON:null")
            r = await talk(pg, cdp, run, 'classmate_xinci', NEUTRAL, 'x_on')
            if r:
                menu, seen, said = r
                g = [o for grp in seen for o in grp if o.startswith('送她')]
                run.check('③ [芯慈，XCROM.ON=%s] 選項有「送她%s」' % (on, BUY[1]), on is True and any(('送她' + BUY[1]) in o for o in g), J({'menu': menu, 'gifts': g}))
            await pg.evaluate("XCROM.ON=false")
            run.setup('【捷徑】XCROM.ON 改成 false（芯慈的線關著）')
            r = await talk(pg, cdp, run, 'classmate_xinci', NEUTRAL, 'x_off')
            if r:
                menu, seen, said = r
                g = [o for grp in seen for o in grp if o.startswith('送她')]
                run.check('③ [芯慈，XCROM.ON=false] 選項沒有「送她○○」', bool(menu) and not g, J({'menu': menu, 'gifts': g}))
            await pg.evaluate("XCROM.ON=true")
        else:
            run.check('③ 找得到芯慈', False)
        run.check('④ 沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
