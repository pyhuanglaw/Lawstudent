"""CC（帳號 A）11-10：BUG-NY-EXIT-1110（P1，BB 21:00／21:01）看完電影走不出南洋大廳？線上 main 779ddd650 和開發分支最新各跑。Playwright（PC GPU）≠ iPhone。
流程（真實玩家，除了【前置】）：【前置】day46 存檔 08:00、以安朋友 → 手機約以安南洋今天最早一場 →「今天」按「前往」→ 一路點對話（選單選第一個）→ 散場 MOVIES.leaveHall 回大廳 → 道別演完
  → MODE=tap：觸控點地板走到出口 (0,6.55)（出口太遠或不在畫面上就點往出口方向 5 m 的地板）；MODE=joy：搖桿照鏡頭方向往出口推。各 30 秒。
每 0.5 秒記：玩家位置、E.player.busy、E.player.path 長度、她（npc heroine_01）的位置／frozen／beh／visible、GAME.sceneDepth()、ADV 開著沒（ADV.active、body.adv-on）、
  最近的互動點 label 和距離、walkFallbacks；開始、卡住（3 秒沒前進 0.3 m）、到出口各截一張。到出口按出口 → 要回到新生南路（xinsheng）。
判斷：30 秒內走到出口（1.0 m 內）＝PASS；走不到＝卡住那一刻的紀錄＋截圖交 BB。
用法：LW_TESTS=<wt>/tests MODE=tap|joy python3 cc_ny_exit_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
MODE = os.environ.get('MODE') or 'tap'; WHO = 'heroine_01'; pe.WHO = WHO
R = L.Run('ny_exit_' + MODE, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
EXIT = (0.0, 6.55)
DIAG = r"""(()=>{ const E=GAME.E, P=E.player, p=P.obj.position; const n=(GAME.npc&&GAME.npc.heroine_01)||(E.npcs||[]).find(q=>q.charId==='heroine_01');
  const its=(E.interactables||[]).filter(i=>!i.hidden&&(i.lv|0)===(P.lv|0)).map(i=>({l:i.label,d:Math.hypot(i.x-p.x,i.z-p.z)})).sort((a,b)=>a.d-b.d);
  return {t:+performance.now().toFixed(0), zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), me:[+p.x.toFixed(2),+p.z.toFixed(2)], busy:!!P.busy, seat:!!P.seat, path:P.path?P.path.length:0,
    her:n&&n.obj?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),frozen:!!n.frozen,beh:n.beh||null,vis:!!n.obj.visible,path:n.path?n.path.length:0}:null,
    depth:GAME.sceneDepth?GAME.sceneDepth():null, adv:!!((typeof ADV!=='undefined'&&ADV.active)||document.body.classList.contains('adv-on')),
    dlg:!!(document.getElementById('dlg')&&!document.getElementById('dlg').classList.contains('hide')), near:its[0]?{l:its[0].l,d:+its[0].d.toFixed(2)}:null,
    interact:(document.getElementById('interact')||{}).textContent||'', fb:GAME.walkFallbacks|0}; })()"""


def state0():
    s = json.load(open(SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    s['hour'] = 8.0; s['invites'] = []; s['money'] = 5000
    soc = copy.deepcopy(s.get('social') or {}); r = soc.setdefault('rel', {}).setdefault(WHO, {})
    r['fam'] = max(r.get('fam', 0), 50); r['trust'] = max(r.get('trust', 0), 35); r['comf'] = max(r.get('comf', 0), 30); s['social'] = soc
    v = dict(s.get('visited') or {}); v['xs_nanyang'] = v.get('xs_nanyang') or 1; s['visited'] = v
    return s


async def shot(pg, name):
    await pg.screenshot(path=os.path.join(OUT, 'nyx_%s_%s.jpg' % (MODE, name)), type='jpeg', quality=75)


async def main():
    sha = os.environ.get('SHA', '')[:9]
    print('CC NY_EXIT（BUG-NY-EXIT-1110）：MODE %s；SHA %s；Playwright ≠ iPhone' % (MODE, sha), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        try: await L.load_state(pg, state0(), quiet_phone=True)
        except TypeError: await L.load_state(pg, state0())
        await pg.wait_for_timeout(3500); await pe.settle(pg, cdp, [], 30)
        R.setup('【前置／捷徑】day46 存檔 08:00、以安朋友（fam≥50 trust≥35 comf≥30）、錢 5000、去過南洋')
        # 約
        await pe.phone(pg, cdp, 'friends')
        if not await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % WHO): R.check('手機朋友頁有以安', False, ''); await b.close(); return
        await pg.wait_for_timeout(1500); await pe.choose(pg, cdp, '看電影', True)
        o = await pe.opts(pg); pc = next((x for x in o if '南洋' in x['t']), None)
        if not R.check('選得到南洋', bool(pc), J(o)): await b.close(); return
        await pe.choose(pg, cdp, pc['t'], True); o = await pe.opts(pg); tm = next((x for x in o if x['t'].startswith('今天') and not x['dim']), None)
        await pe.choose(pg, cdp, tm['t'], True); await pe.settle(pg, cdp, [], 30)
        iv = await pg.evaluate("(w=>{ const v=(GAME.G.invites||[]).filter(x=>x.who===w&&x.state==='accepted').pop(); return v?{id:v.id,h:v.h,film:v.film}:null; })(%s)" % J(WHO))
        if not R.check('約成了', bool(iv), ''): await b.close(); return
        await pe.phone(pg, cdp, 'today')
        if not R.check('「今天」有「前往」', await pe.tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id']), ''): await b.close(); return
        # 看完
        t0 = time.time(); hall = False
        while time.time() - t0 < 420:
            q = await L.state(pg); z = await pg.evaluate("GAME.G.zone")
            if z == 'xs_nanyang_hall': hall = True
            if q['choices']: o = await pe.opts(pg); await pe.choose(pg, cdp, o[0]['t'], True); continue
            if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
            st = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v&&v.state; })(%s)" % J(iv['id']))
            if hall and z == 'xs_nanyang' and st in ('done', 'over') and not q['busy']: break
            await pg.wait_for_timeout(450)
        await pg.wait_for_timeout(1200)
        d0 = await pg.evaluate(DIAG); R.note('道別演完、開始走：%s' % J(d0)); await shot(pg, '1_start')
        if not R.check('看完回到大廳、道別演完', d0['zone'] == 'xs_nanyang', J(d0)): await b.close(); return
        # 走
        log = [d0]; t1 = time.time(); last_prog = (time.time(), d0['me']); stuck_shot = False; reached = None; acts = 0; nxt = 0
        while time.time() - t1 < 30:
            d = await pg.evaluate(DIAG); d['rt'] = round(time.time() - t1, 2); log.append(d)
            dist = math.hypot(d['me'][0] - EXIT[0], d['me'][1] - EXIT[1])
            if dist < 1.0: reached = d; break
            if math.hypot(d['me'][0] - last_prog[1][0], d['me'][1] - last_prog[1][1]) > 0.3: last_prog = (time.time(), d['me'])
            elif time.time() - last_prog[0] > 3 and not stuck_shot: stuck_shot = True; await shot(pg, '2_stuck'); R.note('卡住（3 秒沒前進 0.3 m）：%s' % J(d))
            if time.time() >= nxt:
                if MODE == 'tap':
                    k = min(1.0, 5.0 / max(dist, 0.01)); tx, tz = d['me'][0] + (EXIT[0] - d['me'][0]) * k, d['me'][1] + (EXIT[1] - d['me'][1]) * k
                    r = await L.tap_ground(pg, cdp, tx, tz); acts += 1; nxt = time.time() + 2.5
                    if not r: R.note('%.1f 秒：點地板 (%.1f,%.1f) 點不到（不在畫面上／被按鈕擋）' % (d['rt'], tx, tz))
                else:
                    yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
                    vx, vz = (EXIT[0] - d['me'][0]) / dist, (EXIT[1] - d['me'][1]) / dist
                    sx, sy = vx * rx + vz * rz, -(vx * fx + vz * fz); m = math.hypot(sx, sy) or 1
                    await L.joystick(pg, cdp, sx / m * 45, sy / m * 45, 900); acts += 1; nxt = time.time()
            await pg.wait_for_timeout(500 if MODE == 'tap' else 50)
        json.dump(log, open(os.path.join(OUT, 'nyx_%s_log.json' % MODE), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        R.note('走路紀錄（%d 筆，前 20）：%s' % (len(log), J(log[:20])))
        R.note('最後 8 筆：%s' % J(log[-8:]))
        if reached: await shot(pg, '3_exit')
        R.check('%s：30 秒內走到出口 (0,6.55)（%s 秒、動作 %d 次）' % ('觸控點地板' if MODE == 'tap' else '搖桿', reached and reached['rt'], acts), bool(reached), J(log[-1]))
        if reached:
            await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#interact')
            for _ in range(40):
                if await pg.evaluate("GAME.G.zone") != 'xs_nanyang': break
                await pg.wait_for_timeout(400)
            await pg.wait_for_timeout(2000); z = await pg.evaluate("GAME.G.zone"); await shot(pg, '4_out')
            R.check('按出口回到新生南路（xinsheng）', z == 'xinsheng', z)
        R.check('walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
