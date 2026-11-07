"""CC-B（帳號 B）11-07：GYMUSE_3880（BB-B 06:07；GYM-FIT-1107：新體 B1 健身中心 22 件器材一台一台用，388087110）。
  【前置／捷徑】讀檔到 gym_b1 健身中心裡面（平日 2025-10-15 10:00、晚上 20:30；條件事件關閉）；G.daily.gym.card＝今天（會員卡）——月票／單次照遊戲問（選第一個）。
  三台：跑步機（treadmill）、腳踏車機（bike）、深蹲架（squat_rack）——各走到 stand 旁邊、互動按鈕是「用○○」、按下去：
    ① 截圖三張（玩家看得到的跟隨鏡頭）：開始那一刻（人放上器材）、做到一半（旁白那一句出來時）、做完（站回 stand）；白天一組、晚上一組。
    ② 記：旁白那一句、時間前進多少（應該 1 小時）、體能 G.daily.gym.fit 前後、行動次數（G.slots 前後）。
    ③ 有路人在用的那一台不出按鈕：找一台「人在健身中心裡、hidden＝有人用」的，走到它的 stand 旁邊看互動按鈕不是它；截那一區。
    ④ 體能跨階：【捷徑】fit 設 24（這週次數 fitN 0、upIx 0）→ 用一次（+2＝26）要有 levelUp 旁白和「體能：○○（走路、騎腳踏車快了一點）」；同一階再用一次不能再出現。
  判定照 D141（走不到、坐不下、穿模、卡住、黑畫面才擋），其他記錄給 BB。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_gymuse_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('gymuse', OUT); D.setup(R, OUT)
DAY = '2025-10-15'   # 星期三（不是第四個週一）
KINDS = ['treadmill', 'bike', 'squat_rack']
LABEL = {'treadmill': '用跑步機', 'bike': '用腳踏車機', 'squat_rack': '用深蹲架'}
SAYHOOK = r"""(()=>{ if(!window.__ccSayWrapped){ const s0=GAME.say; GAME.say=function(who,t){ try{ (window.__ccSay=window.__ccSay||[]).push({who:who?(who.name||String(who)):null, t:String(t), h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return s0.apply(this,arguments); };
  const t0=GAME.toast; if(t0) GAME.toast=function(t){ try{ (window.__ccToast=window.__ccToast||[]).push(String(t)); }catch(e){} return t0.apply(this,arguments); }; window.__ccSayWrapped=true; }
  window.__ccSay=[]; window.__ccToast=[]; return true; })()"""
EQ = r"""(()=>{ const E=GAME.E, B=GYM_LAYOUT.b1, F=B.fitness; const its=(E.interactables||[]).filter(i=>i.gymEquip);
  return its.map(i=>{ const e=(F.equip||[]).find(q=>q.id===i.gymEquip)||{}; return {id:i.gymEquip, kind:e.kind||null, label:i.label, x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), hidden:!!i.hidden, use:(e.use||[]).map(u=>[u.x,u.z])}; }); })()"""
FIT = r"""(()=>{ const G=GAME.G, r=(G.daily&&G.daily.gym)||{}; return {fit:r.fit|0, fitN:r.fitN|0, upIx:r.upIx, card:r.card, hour:+(+G.hour).toFixed(3), day:G.day, slots:JSON.stringify(G.slots||null), money:G.money|0}; })()"""
PL = r"""(()=>{ const P=GAME.E.player, o=P.obj.position; return {x:+o.x.toFixed(2), y:+o.y.toFixed(2), z:+o.z.toFixed(2), pose:P.pose||null, busy:!!P.busy}; })()"""


async def drive(pg, cdp, tag, it, shot_prefix):
    """按下「用○○」以後：選單選第一個（不是算了）、開始那一刻截圖、旁白那一句截圖、做完截圖"""
    t0 = time.time(); shots = {}; poses = []
    while time.time() - t0 < 60:
        q = await D.st(pg); p = await pg.evaluate(PL)
        if p['pose'] and p['pose'] != 'idle' and 'start' not in shots:
            await pg.wait_for_timeout(400); await D.shot(pg, shot_prefix + '_1start'); shots['start'] = p; poses.append(p['pose'])
        if q['choices']:
            k = next((i for i, x in enumerate(q['choices']) if not x.startswith('算了') and not x.startswith('不用')), 0)
            R.note('%s 選單 %s → 選 %s' % (tag, J(q['choices']), J(q['choices'][k])))
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(900); continue
        if q['dlg']:
            if 'mid' not in shots:
                await D.shot(pg, shot_prefix + '_2mid'); shots['mid'] = p; poses.append(p['pose'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if 'mid' in shots and not q['busy'] and not q['dlg'] and not q['choices']: break
        await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(800); p = await pg.evaluate(PL); await D.shot(pg, shot_prefix + '_3end'); shots['end'] = p
    return shots, poses


async def use_one(pg, cdp, tag, kind, shot_prefix):
    eqs = await pg.evaluate(EQ)
    it = next((e for e in eqs if e['kind'] == kind and not e['hidden']), None)
    if not R.check('%s 有沒人在用的%s（互動點沒藏）' % (tag, LABEL[kind][1:]), bool(it), J([e for e in eqs if e['kind'] == kind])): return None
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.3, '%s 走到 %s 旁邊' % (tag, it['id']), max_s=90)
    q = await D.st(pg)
    for _ in range(8):
        if q['interact'].startswith(LABEL[kind]): break
        await pg.wait_for_timeout(500); q = await D.st(pg)
    if not R.check('%s 走到旁邊，互動按鈕是「%s」' % (tag, LABEL[kind]), q['interact'].startswith(LABEL[kind]), J({k: q[k] for k in ('x', 'z', 'interact')})): return None
    f0 = await pg.evaluate(FIT); await pg.evaluate(SAYHOOK)
    await L.tap(pg, cdp, '#interact')
    shots, poses = await drive(pg, cdp, tag, it, shot_prefix)
    f1 = await pg.evaluate(FIT); says = await pg.evaluate("window.__ccSay||[]"); toasts = await pg.evaluate("window.__ccToast||[]")
    dh = round(f1['hour'] - f0['hour'] + 24 * (f1['day'] - f0['day']), 3)
    R.note('%s 旁白 %s；toast %s；時間 %.3f→%.3f（+%.2f h）；體能 %d→%d（這週第 %d 次）；行動 %s → %s；錢 %d→%d；姿勢 %s' % (tag, J([s['t'] for s in says]), J(toasts), f0['hour'], f1['hour'], dh, f0['fit'], f1['fit'], f1['fitN'], f0['slots'], f1['slots'], f0['money'], f1['money'], J(poses)))
    end = shots.get('end') or {}
    if f1['hour'] >= 21.4 or f1['day'] != f0['day']: end = None   # 晚上那一格用完會走回宿舍（設計）：不查站回旁邊，改查下面的軌跡
    # BB-B 06:49：fitDone＝advance 1＋slotUse＋queueJump（跳到時段結束，和 ACTION-BUDGET 一樣）＝至少 +1 小時，而且這個時段的次數有扣
    try: u0 = json.loads(f0['slots'] or 'null') or {}; u1 = json.loads(f1['slots'] or 'null') or {}
    except Exception: u0, u1 = {}, {}
    used = lambda u: sum(((u.get('used') or {}).get(k) or 0) for k in ('am', 'pm', 'ev')) if isinstance(u, dict) else 0
    R.check('%s 用完：時間至少 +1 小時、這個時段的次數有扣（CLS slots）' % tag, dh >= 0.95 and used(u1) > used(u0 if u0.get('day') == u1.get('day') else {}), J({'hour': [f0['hour'], f1['hour']], 'slots': [f0['slots'], f1['slots']]}))
    if f1['hour'] >= 21.4 or f1['day'] != f0['day']:   # BB-B 06:49 請查：晚上用完人不在 stand 旁邊——21:30 清場帶到門口？還是晚上那一格用完回去睡（00d5fd0f4，3880 有）？印之後 10 秒
        trail = []; d0 = f0['day']
        for _ in range(180):   # BB-B 06:53（LAWWW-B：設計）：晚上那一格用完 → 走回宿舍（15 分鐘）→ 進房間 → 睡到隔天早上；最多等 90 秒
            await pg.wait_for_timeout(500); q_ = await D.st(pg); fx = await pg.evaluate(FIT)
            if not trail or trail[-1][0] != q_['zone'] or fx['day'] != trail[-1][1]: trail.append([q_['zone'], fx['day'], q_['hour'], q_['x'], q_['z']])
            if q_['dlg']: await L.tap(pg, cdp, '#dlg'); continue
            if q_['choices']: await L.tap(pg, cdp, '#choices button:first-child'); continue
            if fx['day'] > d0 and q_['hour'] < 12 and not q_['busy']: break
        q_ = await D.st(pg); fx = await pg.evaluate(FIT)
        R.note('%s 晚上用完以後的軌跡（zone、day、hour、x、z）：%s' % (tag, J(trail)))
        R.check('%s 晚上用完：回到宿舍、睡到隔天早上（day+1、12 點前）' % tag, any(str(t[0]).startswith('dorm') for t in trail) and fx['day'] == d0 + 1 and q_['hour'] < 12, J({'now': [q_['zone'], fx['day'], q_['hour']], 'trail': trail[-6:]}))
        return {'id': it['id'], 'night_home': trail}
    if end is not None: R.check('%s 用完：站回旁邊、不是在器材上（姿勢 idle、離 stand ≤ 0.5 m）' % tag, end.get('pose') == 'idle' and abs(end.get('x', 99) - it['x']) <= 0.5 and abs(end.get('z', 99) - it['z']) <= 0.5, J(end))
    mv = await D.pushable(pg, cdp); R.check('%s 用完推得動（≥0.3 m）' % tag, mv >= 0.3, J(mv))
    return {'id': it['id'], 'says': [s['t'] for s in says], 'toasts': toasts, 'dh': dh, 'fit': [f0['fit'], f1['fit']], 'slots': [f0['slots'], f1['slots']], 'poses': poses, 'shots': {k: v for k, v in shots.items()}}


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC GYMUSE（B1 健身中心器材一台一台用）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'runs': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        F = await pg.evaluate("(()=>{ const F=GYM_LAYOUT.b1.fitness; return {x0:F.x0,x1:F.x1,z0:F.z0,z1:F.z1, n:(F.equip||[]).length}; })()")
        R.note('健身中心 %s' % J(F))
        cx, cz = (F['x0'] + F['x1']) / 2 + 8.0, F['z0'] + 3.0
        for tn, h in (('day', 10.0), ('night', 20.5)):
            R.setup('[%s] 讀檔 gym_b1 健身中心裡 (%.1f, %.1f) %s %05.2f；【前置】會員卡（G.daily.gym.card＝今天）' % (tn, cx, cz, DAY, h))
            s = await D.load_zone(pg, cdp, 'gym_b1', DAY, h, x=cx, z=cz, wait=8000)
            if not R.check('[%s] 讀到 gym_b1、站得住' % tn, s['zone'] == 'gym_b1' and s['stand'], J(s)): continue
            await pg.evaluate("(()=>{ const G=GAME.G; G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; if(!r.card) r.card=G.day; })()")
            eqs = await pg.evaluate(EQ)
            R.note('[%s] 器材互動點 %d 個：%s' % (tn, len(eqs), J([[e['id'], e['kind'], e['label'], e['hidden']] for e in eqs])))
            for k in KINDS:
                print('== %s %s' % (tn, k), flush=True)
                # 每一台都重新讀檔回同一個時間：一個時段只能做一件主要的事（用一台＝那一格用掉；PC／雲端 11-07：第二台「這個下午已經排滿了」；晚上用完一台就過了 21:30 清場）
                R.setup('[%s %s] 讀檔回 %s %05.2f 健身中心裡；【前置】會員卡' % (tn, k, DAY, h))
                await D.load_zone(pg, cdp, 'gym_b1', DAY, h, x=cx, z=cz, wait=7000)
                await pg.evaluate("(()=>{ const G=GAME.G; G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; if(!r.card) r.card=G.day; })()")
                try:
                    r = await use_one(pg, cdp, '[%s %s]' % (tn, k), k, 'gymuse_%s_%s' % (tn, k))
                    if r: rec['runs'].append(dict(r, t=tn, kind=k))
                except Exception as ex: R.check('[%s %s] 探針沒有例外' % (tn, k), False, repr(ex)[:300])
            # ③ 有路人在用的那一台不出按鈕
            eqs = await pg.evaluate(EQ); busy = [e for e in eqs if e['hidden']]
            R.note('[%s] 有人在用（互動點藏起來）的：%s' % (tn, J([[e['id'], e['kind']] for e in busy])))
            if busy:
                e = busy[0]
                await L.go_to(pg, cdp, R, e['x'], e['z'], 0.3, '[%s] 走到有人在用的 %s 旁邊' % (tn, e['id']), max_s=90)
                q = await D.st(pg); n = await pg.evaluate(D.NEAR_IT)
                R.check('[%s] 有人在用的 %s：互動按鈕不是「%s」' % (tn, e['id'], e['label']), not q['interact'].startswith(e['label']), J({'interact': q['interact'], 'near': n}))
                await D.shot(pg, 'gymuse_%s_busy_%s' % (tn, e['id']))
            else: R.note('[%s] 這一刻沒有路人在用器材（③ 沒測到）' % tn)
        # ④ 體能跨階
        R.setup('[跨階] 讀檔 gym_b1 %s 10:00；【捷徑】體能 fit 24、這週次數 0、upIx 0' % DAY)
        await D.load_zone(pg, cdp, 'gym_b1', DAY, 10.0, x=cx, z=cz, wait=8000)
        await pg.evaluate("(()=>{ const G=GAME.G; G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; r.card=r.card||G.day; r.fit=24; r.fitN=0; r.upIx=0; r.upPend=null; })()")
        r1 = await use_one(pg, cdp, '[跨階 第 1 次]', 'treadmill', 'gymuse_up1')
        R.setup('[跨階 第 2 次] 讀檔回 %s 10:00；【捷徑】體能接著第 1 次的結果（fit %s、upIx 1、這週 1 次）' % (DAY, r1 and r1['fit'][1]))
        await D.load_zone(pg, cdp, 'gym_b1', DAY, 10.0, x=cx, z=cz, wait=7000)
        await pg.evaluate("((f)=>{ const G=GAME.G; G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; r.card=r.card||G.day; r.fit=f; r.fitN=1; r.upIx=1; r.upPend=null; })", (r1 and r1['fit'][1]) or 26)
        r2 = await use_one(pg, cdp, '[跨階 第 2 次]', 'bike', 'gymuse_up2')
        up = lambda r: [t for t in ((r or {}).get('toasts') or []) if t.startswith('體能：')]
        R.check('[跨階] 24→26：有「體能：○○（走路、騎腳踏車快了一點）」', bool(r1) and bool(up(r1)) and (r1['fit'][1] >= 25), J(r1 and {'fit': r1['fit'], 'toasts': r1['toasts'], 'says': r1['says']}))
        R.check('[跨階] 同一階再用一次：不再出現升階那一句', bool(r2) and not up(r2), J(r2 and {'fit': r2['fit'], 'toasts': r2['toasts']}))
        with open(os.path.join(OUT, 'gymuse.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
