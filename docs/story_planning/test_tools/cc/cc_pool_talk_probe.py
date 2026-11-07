"""CC-B（帳號 B）11-07：SHOP-STAFF-1107 第 3 件（f607b0a22；BB-B 04:59 派，PC）——隔著牆的人不能說話。
  使用者 11-07 試玩：「游泳池跟一個年輕男生說話 結果是櫃台阿姨？」：B1 服務櫃台的阿姨（gym_layout b1.desk.staff (21.0, 0.2)）背後 0.4 m 就是游泳池的牆（z −0.2）。
  做法：體育館 B1（gym_b1）游泳池這一側，每一張池邊長椅（b1.poolBenches）旁邊站一下（長椅南邊 0.6～1.0 m、離櫃台阿姨最近的那幾張最重要），
    看互動按鈕：是「聽一句」之類跟人說話的話，那個人要在游泳池這一側（z < −0.2），不能是櫃台後面的阿姨；按下去說話的人也要是他。
    另外站在走廊／大廳、櫃台前面（客人那一側 z 1.9）：還是要能跟阿姨說話（櫃台不是牆）。
  【前置／捷徑】讀檔到 B1（條件事件關閉）；條件：平日 15:00（游泳池有人）。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [EXPECT=fixed] python3 cc_pool_talk_probe.py <url> <out>"""
import os, sys, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('pool_talk', OUT); D.setup(R, OUT)
DAY = '2025-10-15'   # 星期三（不是第四個週一＝沒休館）
EXPECT = os.environ.get('EXPECT', '').strip()   # fixed：f607b0a22 以後（池邊不能選到櫃台阿姨）；空＝只記錄（改之前的對照）
GEO = r"""(()=>{ const B=GYM_LAYOUT.b1; return {benches:B.poolBenches, desk:B.desk, poolZ1:B.pool.z1}; })()"""
NEAR = r"""(()=>{ const E=GAME.E, it=E.nearestInteractable&&E.nearestInteractable(); if(!it) return null; const n=it.npc, o=n&&n.obj&&n.obj.position;
  return {label:it.label||'', npc:n?(n.id||n.cid||n.name||'?'):null, nx:o?+o.x.toFixed(2):null, nz:o?+o.z.toFixed(2):null, role:n&&(n.role||n.kind||n.job)||null}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC POOL_TALK（B1 池邊不跟牆後的櫃台阿姨說話）：SHA=%s（worktree 實際 %s）；EXPECT=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', EXPECT or '-'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        if not R.check('這一版有 gym_b1', await pg.evaluate("!!Z3.ZONES.gym_b1&&typeof GYM_LAYOUT!=='undefined'&&!!GYM_LAYOUT.b1")): await b.close(); sys.exit(1)
        g = await pg.evaluate(GEO); sx, sz = g['desk']['staff']['x'], g['desk']['staff']['z']
        R.note('池邊長椅 %s；櫃台阿姨 (%s, %s)；游泳池那一側 z < %s' % (J(g['benches']), sx, sz, g['poolZ1']))
        benches = sorted(g['benches'], key=lambda q: (q[0] - sx) ** 2 + (q[1] - sz) ** 2)
        bad = []
        for k, (bx, bz) in enumerate(benches):
            for dz in (0.45, -0.7):   # 長椅在池邊、靠走廊那面牆（z −0.2）、面向北（泳池）：站長椅和牆中間（+0.45，離櫃台阿姨最近）、站長椅前面（−0.7）
                tag = '[長椅 %d (%s, %s) 站 z %+.2f]' % (k + 1, bx, bz, dz)
                tz = bz + dz
                R.setup('%s 讀檔 B1 (%.2f, %.2f) %s 15:00' % (tag, bx, tz, DAY))
                s = await D.load_zone(pg, cdp, 'gym_b1', DAY, 15.0, x=bx, z=tz, yaw=3.1416, wait=6000)
                if s['zone'] != 'gym_b1' or not s['stand']:
                    R.note('%s 這一點讀不進去或站不住（%s），換下一點' % (tag, J(s))); continue
                await pg.wait_for_timeout(1500)
                seen = []
                for _ in range(6):
                    n = await pg.evaluate(NEAR); seen.append(n)
                    if n and n['npc'] and n['nz'] is not None and n['nz'] > g['poolZ1'] and abs(n['nx'] - sx) < 1.0 and abs(n['nz'] - sz) < 1.0: bad.append([tag, n])
                    await pg.wait_for_timeout(500)
                last = seen[-1]
                R.note('%s 互動按鈕：%s' % (tag, J(last)))
                if EXPECT == 'fixed':
                    R.check('%s 池邊的按鈕不是牆後的櫃台阿姨（她在 (%s, %s)）' % (tag, sx, sz), not any(b_[0] == tag for b_ in bad), J(seen))
        R.note('池邊選到櫃台阿姨的點：%s' % J(bad))
        tag = '[櫃台前]'
        R.setup('%s 讀檔 B1 櫃台客人那一側 (%s, 1.9) %s 15:00' % (tag, sx, DAY))
        s = await D.load_zone(pg, cdp, 'gym_b1', DAY, 15.0, x=sx, z=1.9, yaw=3.1416, wait=6000)
        await pg.wait_for_timeout(1500); n = await pg.evaluate(NEAR)
        R.check('%s 站在櫃台前還是可以跟阿姨說話（櫃台不是牆）' % tag, bool(n and n['npc'] and n['nz'] is not None and abs(n['nx'] - sx) < 1.0 and abs(n['nz'] - sz) < 1.0), J({'near': n, 'me': s}))
        await D.user_shot(pg, cdp, 'pool_desk', {'eye': [sx - 3.0, 1.7, -3.5], 'look': [sx, 1.0, 0.0], 'lens': 22})
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
