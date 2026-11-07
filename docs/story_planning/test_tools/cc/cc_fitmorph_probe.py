"""CC-B（帳號 B）11-07：FITMORPH_41bf（BB-B 06:08；祐廷的體態跟著體能變：VRM morph「fit」四階 0／0.4／0.7／1，LAWWW2-B 08fa5580f，開發 41bfc5cbe）。
  同一個起點、同一個時間、同一個地點：【捷徑】G.daily.gym.fit 設 0、30、60、90（其他不動）→ FIT.sync → 等 1 秒（u.fitMorphW 要等於 0／0.4／0.7／1）。
  每一階拍三種姿勢 × 正面、側面（鏡頭照玩家的朝向算，四階同一個角度）：站著、走路（走到一半那一刻停主迴圈拍）、坐下（教室最近的一張椅子，照玩家點椅子坐）。
  看圖給 LAWWW（D100a 角色美術）：一階一階看得出差別、衣服沒穿模、坐下沒穿進椅子。Windows＋GPU／SwiftShader ≠ iPhone。
  【前置／捷徑】讀檔到 201 教室（classroom）出生點，2025-10-18（六）14:00（沒有課）。
用法：LW_TESTS=<wt>/tests python3 cc_fitmorph_probe.py <url> <out>"""
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
R = L.Run('fitmorph', OUT); D.setup(R, OUT)
DAY, H, ZONE = '2025-10-18', 14.0, 'classroom'
LEVELS = [(0, 0.0), (30, 0.4), (60, 0.7), (90, 1.0)]
SETFIT = r"""((f)=>{ const G=GAME.G; G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; r.fit=f; if(typeof FIT!=='undefined'&&FIT.sync) FIT.sync(GAME); return true; })"""
MW = r"""(()=>{ let w=null, n=0; GAME.E.player.obj.traverse(o=>{ const u=o.userData||{}; if(u.fitMorph){ n=u.fitMorph.length; w=u.fitMorphW; } }); const P=GAME.E.player, o=P.obj.position; return {w, meshes:n, x:+o.x.toFixed(2), z:+o.z.toFixed(2), yaw:+P.obj.rotation.y.toFixed(3), pose:P.pose||null, seat:!!P.seat}; })()"""


def cams(x, z, yaw, y0=0.0):
    fx, fz = math.sin(yaw), math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
    look = [x, y0 + 1.0, z]
    return {'front': {'eye': [x + fx * 2.6, y0 + 1.3, z + fz * 2.6], 'look': look, 'lens': 35},
            'side': {'eye': [x + rx * 2.6, y0 + 1.3, z + rz * 2.6], 'look': look, 'lens': 35}}


async def two(pg, cdp, name, x, z, yaw, keep_paused=False):
    out = {}
    for k, c in cams(x, z, yaw).items():
        out[k] = await D.user_shot(pg, cdp, '%s_%s' % (name, k), c, hide_player=False)
    return out


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC FITMORPH（祐廷體態四階）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'levels': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for fit, w in LEVELS:
            tag = '[fit %d]' % fit
            R.setup('%s 讀檔 %s %s %05.2f（出生點）；【捷徑】G.daily.gym.fit＝%d → FIT.sync' % (tag, ZONE, DAY, H, fit))
            s = await D.load_zone(pg, cdp, ZONE, DAY, H, wait=7000)
            if not R.check('%s 讀到 %s' % (tag, ZONE), s['zone'] == ZONE, J(s)): continue
            await pg.evaluate(SETFIT, fit); await pg.wait_for_timeout(1200); m = await pg.evaluate(MW)
            R.check('%s 玩家模型有 fit morph、強度＝%.1f（u.fitMorphW）' % (tag, w), m['meshes'] > 0 and m['w'] is not None and abs(m['w'] - w) < 1e-3, J(m))
            lv = {'fit': fit, 'w': m['w'], 'shots': {}}
            lv['shots']['stand'] = await two(pg, cdp, 'fit%02d_stand' % fit, m['x'], m['z'], m['yaw'])
            # 走路：往前走 4 m，走 1.2 秒時停主迴圈拍（姿勢是 walk／run 那一刻）
            tx, tz = m['x'] + math.sin(m['yaw']) * 4.0, m['z'] + math.cos(m['yaw']) * 4.0
            ok_t = await pg.evaluate("((q)=>GAME.E.canStand(q[0],q[1],0.3,0))", [tx, tz])
            if not ok_t: tx, tz = m['x'] - math.sin(m['yaw']) * 4.0, m['z'] - math.cos(m['yaw']) * 4.0
            task = asyncio.create_task(L.go_to(pg, cdp, R, tx, tz, 0.3, '%s 往前走 4 m' % tag, max_s=30))
            mw = None
            for _ in range(20):
                await pg.wait_for_timeout(200); mw = await pg.evaluate(MW)
                if mw['pose'] in ('walk', 'run') and math.hypot(mw['x'] - m['x'], mw['z'] - m['z']) > 0.8: break
            await pg.evaluate("(()=>{ GAME.E.paused=true; })()")
            R.note('%s 走路那一刻 %s' % (tag, J(mw)))
            lv['shots']['walk'] = await two(pg, cdp, 'fit%02d_walk' % fit, mw['x'], mw['z'], mw['yaw'])
            await pg.evaluate("(()=>{ GAME.E.paused=false; })()")
            try: await task
            except Exception: pass
            # 坐下：最近的一張椅子——走到 seatApproach、按「坐」、坐著的時候拍（不起身先拍），再照選單起身
            seats = await pg.evaluate(D.SEATS); pm = await pg.evaluate(MW)
            seats = sorted([q for q in seats if q['slv'] == 0], key=lambda q: math.hypot(q['sx'] - pm['x'], q['sz'] - pm['z']))
            for q in seats[:4]:
                ap = q['ap'] or [q['x'], q['z']]
                await L.go_to(pg, cdp, R, ap[0], ap[1], 0.22, '%s 走到椅子 (%s, %s)' % (tag, q['sx'], q['sz']), max_s=60)
                st = await D.st(pg)
                if not st['interact'].startswith(q['label']): continue
                await L.tap(pg, cdp, '#interact'); ms = None
                for _ in range(16):
                    await pg.wait_for_timeout(500); ms = await pg.evaluate(MW)
                    if ms['seat']: break
                if not ms or not ms['seat']: continue
                await pg.wait_for_timeout(1200); ms = await pg.evaluate(MW)
                lv['shots']['sit'] = await two(pg, cdp, 'fit%02d_seated' % fit, ms['x'], ms['z'], ms['yaw'])
                R.note('%s 坐下 (%s, %s)：%s' % (tag, q['sx'], q['sz'], J(ms)))
                for _ in range(20):   # 起身
                    c = await D.st(pg)
                    if not c['seat'] and not c['busy']: break
                    if c['dlg']: await L.tap(pg, cdp, '#dlg')
                    elif c['choices']:
                        kk = next((i_ for i_, x in enumerate(c['choices']) if x.startswith('起身')), len(c['choices']) - 1)
                        await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (kk + 1))
                    await pg.wait_for_timeout(600)
                break
            else: R.note('%s 附近 4 張椅子都沒坐成（坐下那一組沒拍）' % tag)
            R.check('%s 坐下那一組拍到了' % tag, 'sit' in lv['shots'], '')
            rec['levels'].append(lv)
        with open(os.path.join(OUT, 'fitmorph.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
