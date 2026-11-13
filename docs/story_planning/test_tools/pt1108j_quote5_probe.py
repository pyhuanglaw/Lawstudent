"""BB-B 2026-11-08：TEXT-QUOTE-UNIFY-1108 第五批（LAWWW-B 41da7c186，測 d6b753f59）瀏覽器抽查——看畫面上的 #dlg：有名字說的那一句外面沒有「」。
  soclib：舊序章的系同學在社科圖（econsl3d.js、econfr_soclib.js）。使用者 day46 存檔【前置】跳到舊序章的人（econ_pinyu）在社科圖的那一天那個時間，走過去說話：
          第一次＝旁白「（在社科圖講話要很小聲。）」＋舊序章的人 met 那一句（名字欄舊序章的人、外面沒有「」）；
          舊存檔：【前置】把剛才記在 flags.ECON_SL 的「說過了」改成有「」的舊寫法 → 讀檔（smallQuoteMigrate）→ key 換回沒有「」的
          → 跳到她下一次在社科圖的時候再說話：不重講說過的、外面沒有「」。
  inv：改時間的回覆（aa614 S.L.inv）——手機約沛珊週三 19:00、明軒週二 19:00（撞到上班）：她／他說的那一句名字欄是本人、外面沒有「」。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<測試樹>/tests MODE=soclib,inv python3 pt1108j_quote5_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, copy, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
import pt1108f_quote3_probe as Q    # DLG_WATCH、full_lines
import pt1107t_aa614_probe as T     # invite、lines_until_idle
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODES = os.environ.get('MODE', 'soclib,inv').split(',')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
PY = 'econ_pinyu'
NARR = '（在社科圖講話要很小聲。）'

FIND = """([id,d0,n])=>{ const G=GAME.G, h0=G.hour, day0=G.day, wd0=G.weekday; let hit=null;
  for(let d=d0; d<d0+n && !hit; d++){ G.day=d; const c=CALENDAR.dateOf(d); G.weekday=c.wd===7?0:c.wd;
    for(let h=9; h<21.5; h+=0.5){ G.hour=h; const r=STORY.whereIs(GAME,id); if(r&&r.zone==='soclib'&&!r.away){ hit={d, wd:G.weekday, h:h+0.25, key:c.key}; break; } } }
  G.day=day0; G.hour=h0; G.weekday=wd0; return hit; }"""


async def load_at(pg, cdp, snap, hit, zone='soclib'):
    s = copy.deepcopy(snap); s.update(day=hit['d'], weekday=hit['wd'], hour=hit['h'], zone=zone, pos=None)
    s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']
    await P.load(pg, cdp, s, quiet=True); await P.init(pg); await pg.evaluate(Q.DLG_WATCH)


async def talk(pg, cdp, run, cid, tag):
    """走到他旁邊；按之前確認互動鍵是「和○○說話」（坐著的人旁邊有空位，互動鍵可能被座位搶走：繞到別的方向再看），再按、點完對話"""
    await pg.evaluate("window.__DW.length=0")
    pr = await P.wait_present(pg, cid, 90)
    want = (pr or {}).get('label') or ''
    lab = lambda: pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
    pos = await pg.evaluate("id=>{ const n=(GAME.E.npcs||[]).find(q=>(q.charId||q.id)===id); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; }", cid)
    ok = False
    import math
    for a in range(8):
        tx, tz = pos['x'] + 0.85 * math.cos(a * math.pi / 4), pos['z'] + 0.85 * math.sin(a * math.pi / 4)
        await L.go_to(pg, cdp, run, tx, tz, 0.3, '%s：%s 旁邊（方向 %d）' % (tag, cid, a), lv=pos['lv'])
        for _ in range(6):
            if (await lab()).startswith(want): ok = True; break
            await pg.wait_for_timeout(500)
        if ok: break
    run.note('%s：按之前互動鍵「%s」（要的是「%s」）' % (tag, await lab(), want))
    if ok:
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
        await P.dialog(pg, cdp, run, picks=(), max_s=120, start_s=10, idle_s=4, tag=tag)
        first = Q.full_lines(await pg.evaluate("window.__DW.slice()"))
        if first and all(not x['n'] and x['t'].startswith('（') for x in first) and any('抬頭' in x['t'] or '點了一下頭' in x['t'] for x in first):   # LIBQ 第一次只點頭（打字可能還沒打完：只看開頭）
            # 讀書區今天第一次遇到＝只點頭（libquiet3d.js LIBQ.gate，AA_595 1-A1）：玩家再按一次才說話
            run.note('%s：第一次按＝讀書區點頭（%s），再按一次' % (tag, first[-1]['t']))
            for _ in range(6):
                if (await lab()).startswith(want): break
                await pg.wait_for_timeout(500)
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
            await P.dialog(pg, cdp, run, picks=(), max_s=120, start_s=10, idle_s=4, tag=tag + '_b')
    lines = Q.full_lines(await pg.evaluate("window.__DW.slice()"))
    await run.shot(pg, tag)
    run.note('%s：在場 %s；畫面 %s' % (tag, J(pr, 200), J(lines)))
    return lines


def named_bad(lines):
    named = [x for x in lines if x['n']]
    return named, [x for x in named if x['t'].startswith('「') and x['t'].endswith('」')]


async def mode_soclib(pg, cdp, run, s0):
    s = copy.deepcopy(s0); s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']
    await P.load(pg, cdp, s, quiet=True); await P.init(pg)
    hit = await pg.evaluate(FIND, [PY, s['day'], 400])
    run.check('[soclib] 找得到舊序章的人在社科圖的日子', bool(hit), J(hit))
    if not hit: return
    snap = await pg.evaluate("()=>JSON.parse(JSON.stringify(GAME.snapshot()))")
    await load_at(pg, cdp, snap, hit)
    run.setup('[前置] day46 存檔同一份進度跳到 %s %.2f 社科圖（舊序章的人在的時候）' % (hit['key'], hit['h']))
    lines = await talk(pg, cdp, run, PY, 'py_1')
    named, bad = named_bad(lines)
    run.check('[soclib] 第一次（點頭以後再按）：先有旁白「%s」' % NARR, any(x['t'].startswith(NARR.rstrip('）')) and not x['n'] for x in lines), J(lines))
    run.check('[soclib] 第一次：舊序章的人說的那幾句名字欄是舊序章的人、外面沒有「」（%d 句）' % len(named), named and not bad and any('舊序章的人' in x['n'] for x in named), J({'named': named, 'bad': bad}))
    sl = await pg.evaluate("(()=>JSON.parse(JSON.stringify(((GAME.G.flags||{}).ECON_SL||{})['%s']||null)))()" % PY)
    run.note('[soclib] 說完 ECON_SL.%s＝%s' % (PY, J(sl)))
    said1 = [x['t'] for x in named]
    if not (sl and sl.get('once')):
        run.check('[soclib] 說完有記「說過了」（ECON_SL.once）', False, J(sl)); return
    # 舊存檔：把 once 的 key 改成有「」的舊寫法再讀檔
    snap2 = await pg.evaluate("()=>JSON.parse(JSON.stringify(GAME.snapshot()))")
    o = snap2['flags']['ECON_SL'][PY]['once']
    snap2['flags']['ECON_SL'][PY]['once'] = {('「' + k + '」' if not k.startswith('（') else k): v for k, v in o.items()}
    run.setup('[前置] 把 ECON_SL.%s.once 改成有「」的舊寫法：%s' % (PY, J(list(snap2['flags']['ECON_SL'][PY]['once'].keys()))))
    hit2 = await pg.evaluate(FIND, [PY, hit['d'] + 1, 120])
    run.check('[soclib] 找得到舊序章的人下一次在社科圖的日子', bool(hit2), J(hit2))
    if not hit2: return
    await load_at(pg, cdp, snap2, hit2)
    run.setup('[前置] 舊寫法的存檔讀進來，跳到 %s %.2f 社科圖' % (hit2['key'], hit2['h']))
    once = await pg.evaluate("(()=>Object.keys((((GAME.G.flags||{}).ECON_SL||{})['%s']||{}).once||{}))()" % PY)
    run.check('[soclib] 讀檔以後 once 的 key 換回沒有「」的（smallQuoteMigrate）', once and not any(k.startswith('「') for k in once), J(once))
    lines2 = await talk(pg, cdp, run, PY, 'py_2')
    named2, bad2 = named_bad(lines2)
    said2 = [x['t'] for x in named2]
    run.check('[soclib] 下一次（點頭以後再按）：舊序章的人有說話、名字欄舊序章的人、外面沒有「」（%d 句；可能是打招呼輪流）' % len(named2), named2 and not bad2, J({'lines': lines2, 'bad': bad2}))
    rep = [t for t in said2 if t in said1 and t not in ('早。',)]
    run.check('[soclib] 下一次沒有重講第一次說過的那一句', not rep, J({'said1': said1, 'said2': said2}))


async def mode_inv(pg, cdp, run, s0):
    PS, MX = T.PS, T.MX
    for who, key, when_key, want_key, label in ((PS, '2025-11-04', '明天 19:00', 'ps', '沛珊（週三 19:00）'), (MX, '2025-11-04', '今天 19:00', 'mx', '明軒（週二 19:00）')):
        s, d = await P.base(pg, s0, key, 15.0, 'campus')
        s['invites'] = [v for v in s.get('invites', []) if v.get('who') != who]
        if who == MX: s.setdefault('contacts', {})[MX] = s.get('contacts', {}).get(MX) or {'day': d['d'] - 10}
        await P.load(pg, cdp, s); await P.init(pg); await pg.evaluate(Q.DLG_WATCH); await pg.evaluate("window.__DW.length=0")
        if who == MX:
            await pg.evaluate("(id=>{ const r=SOCIAL.rel(id); if(r){ r.fam=Math.max(r.fam||0,60); r.trust=Math.max(r.trust||0,40); r.comf=Math.max(r.comf||0,40); } })(%s)" % json.dumps(MX))
            run.setup('【捷徑】明軒：補聯絡方式＋關係撥到 FRIEND 左右（同 pt1107t）')
        want = await pg.evaluate("AA614.L.inv[%s]" % json.dumps(want_key))
        run.setup('[前置] day46 存檔改到 %s 15:00 校園；手機約%s 吃飯 大口漢堡 %s' % (key, label, when_key))
        lv, after = await T.invite(pg, cdp, who, '吃飯', '大口漢堡', when_key)
        lines = Q.full_lines(await pg.evaluate("window.__DW.slice()"))
        hit = [x for x in lines if x['t'] == want]
        run.check('[inv] %s：畫面上「%s」名字欄是本人、外面沒有「」' % (label, want), hit and hit[0]['n'] and not want.startswith('「'), J({'lines': lines, 'lv': lv}))
        await run.shot(pg, 'inv_' + want_key)
        await L.close_panels(pg, cdp)


async def main():
    run = L.Run('pt1108j_quote5', OUT)
    s0 = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8')); s0 = s0.get('G', s0)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        for m in MODES:
            try:
                await (mode_soclib if m == 'soclib' else mode_inv)(pg, cdp, run, s0)
            except Exception as e:
                run.check('[%s] 探針沒有中途出錯' % m, False, repr(e)[:300])
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
