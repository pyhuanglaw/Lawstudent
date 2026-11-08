"""CC-B（帳號 B）11-07：CORNER-IN-1107 ⑦ 約去轉角唱片（BB-B 16:38；f186ad035）。
【捷徑／函式層】不是點手機：用手機邀約選單同一組函式——INV 的地點清單照 P.show(G,id)（invites3d.js:784）、時間列＝INV.timeOptions(G,together,P,id)（:728，whoDays 以外的日子不列）。
步驟：
  a 【前置】讀檔進公館 G12 門外，週五 2025-10-17 11:00（條件事件關閉）：還沒進過轉角 → P.show(G,'kexin') 和另一個人都是 false（地點不列）
  b 照玩家走到店門、按「轉角唱片」進店（G.visited.corner_records 由遊戲記）→ 出來回公館 → P.show＝true
  c 週五 11:00：可昕的時間列只有「明天 …」（週六）；另一個人（WHO2，預設 heroine_01）今天、明天都有；所有時間在 13:00～19:00 開始（times）
  d 週六 2025-10-18 11:00：可昕今天、明天（週日）都有
判定＝BB。用法：LW_TESTS=<wt>/tests [WHO2=heroine_01] python3 cc_corner_invite_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('corner_invite', OUT); D.setup(R, OUT)
WHO2 = os.environ.get('WHO2') or 'heroine_01'

Q = r"""((a)=>{ const G=GAME.G, P=INVITE_DATA.places.find(p=>p.id==='corner_records'); const wd=G.weekday;
  const one=id=>({id, show:P.show?!!P.show(G,id):true, times:INV.timeOptions(G,false,P,id).map(q=>({t:q.t,day:q.day,h:q.h,dim:!!q.dim,hint:q.hint||null}))});
  return {day:G.day, hour:G.hour, wd, visited:!!(G.visited&&G.visited.corner_records), place:{times:P.times, hours:P.hours, whoDays:P.whoDays}, kexin:one('kexin'), other:one(a)}; })"""


async def at_door(pg, cdp, tag, day, h):
    R.setup('%s 【前置／捷徑】讀檔進公館 G12 轉角唱片門外 %s %.2f（條件事件關閉）' % (tag, day, h))
    out = await pg.evaluate("(()=>{ const s=Z3.SHOP_IN&&Z3.SHOP_IN.corner_records; return s&&s.out?s.out:null; })()")
    return await D.load_zone(pg, cdp, 'gongguan', day, h, x=out['x'], z=out['z'] - 0.6, yaw=math.pi, wait=5000)


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 轉角唱片 ⑦ 約去（函式層）：SHA=%s（worktree 實際 %s）' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if not R.check('遊戲載入', ok, ''): await b.close(); return
        await pg.evaluate("localStorage.clear()")
        try:
            await at_door(pg, cdp, '[a]', '2025-10-17', 11.0)
            a = await pg.evaluate(Q, WHO2); R.note('[a] %s' % J(a)); rec['a'] = a
            R.check('[a] 還沒進過：可昕、%s 的地點清單都沒有轉角唱片（show=false）' % WHO2, not a['visited'] and not a['kexin']['show'] and not a['other']['show'], J([a['visited'], a['kexin']['show'], a['other']['show']]))
            # b 照玩家進店一次
            R.setup('[b] 【捷徑】時間撥到 12:30（店 12:00 開；11:00 按門進不去）'); await pg.evaluate("GAME.G.hour=12.5")
            its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>!i.hidden&&/轉角/.test(i.label||'')).map(i=>({label:i.label,x:i.x,z:i.z})))()")
            if R.check('[b] 公館有「轉角唱片」的店門', bool(its), J(its)):
                d = its[0]; await L.go_to(pg, cdp, R, d['x'], d['z'], 0.3, '[b] 走到轉角唱片店門', max_s=120); await pg.wait_for_timeout(900)
                await L.tap(pg, cdp, '#interact'); await D.wait_zone(pg, cdp, 'corner_records', max_s=40); await pg.wait_for_timeout(3000)
                await L.advance_dialogs(pg, cdp, R, lambda s_: not s_['dlg'] and not s_['choices'], max_steps=20)
                s_ = await D.st(pg); R.check('[b] 進得了轉角唱片', s_['zone'] == 'corner_records', J(s_))
                ex = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&!i.hidden); return i?{x:i.x,z:i.z,label:i.label}:null; })()")
                if ex:
                    await L.go_to(pg, cdp, R, ex['x'], ex['z'], 0.3, '[b] 走到出口', max_s=90); await pg.wait_for_timeout(900); await L.tap(pg, cdp, '#interact')
                    await D.wait_zone(pg, cdp, 'gongguan', max_s=30); await pg.wait_for_timeout(1500)
            bb = await pg.evaluate(Q, WHO2); R.note('[b] %s' % J(bb)); rec['b'] = bb
            R.check('[b] 進去過一次以後：G.visited.corner_records、可昕和 %s 都列（show=true）' % WHO2, bb['visited'] and bb['kexin']['show'] and bb['other']['show'], J([bb['visited'], bb['kexin']['show'], bb['other']['show']]))
            # c 週五：可昕只有明天
            R.setup('[c] 【捷徑】時間撥回週五 11:00（GAME.G.hour；進出店會過一點時間）')
            await pg.evaluate("GAME.G.hour=11")
            c = await pg.evaluate(Q, WHO2); R.note('[c] 週五（wd=%s）可昕 %s；%s %s' % (c['wd'], J(c['kexin']['times']), WHO2, J(c['other']['times']))); rec['c'] = c
            kx = c['kexin']['times']; ot = c['other']['times']
            R.check('[c] 週五約可昕：只列「明天」（週六）的時間', bool(kx) and all(q['day'] == c['day'] + 1 and q['t'].startswith('明天') for q in kx), J(kx))
            R.check('[c] 週五約 %s：今天、明天都有' % WHO2, any(q['day'] == c['day'] for q in ot) and any(q['day'] == c['day'] + 1 for q in ot), J(ot))
            R.check('[c] 開始時間都在 13:00～19:00', all(13 - 1e-6 <= q['h'] <= 19 + 1e-6 for q in kx + ot if not q['t'].startswith('現在')), J(sorted({q['h'] for q in kx + ot})))
            # d 週六
            await at_door(pg, cdp, '[d]', '2025-10-18', 11.0)
            await pg.evaluate("(()=>{ (GAME.G.visited=GAME.G.visited||{}).corner_records=true; })()")
            R.setup('[d] 【捷徑】讀檔換日子會清掉進過的紀錄：G.visited.corner_records=true（[b] 已照玩家驗過）')
            d_ = await pg.evaluate(Q, WHO2); R.note('[d] 週六（wd=%s）可昕 %s' % (d_['wd'], J(d_['kexin']['times']))); rec['d'] = d_
            kd = d_['kexin']['times']
            R.check('[d] 週六約可昕：今天、明天（週日）都有', any(q['day'] == d_['day'] for q in kd) and any(q['day'] == d_['day'] + 1 for q in kd), J(kd))
        except Exception as ex: R.check('探針沒有例外', False, repr(ex)[:400])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'corner_invite.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
