"""CC（帳號 A）11-10：X186 橘貓跳上跳下（LAWWW 14:21 ③；開發分支 99294fead；改前 e9af13061）。
程式依據 src/wzcat3d.js：醒著＝07:00～日落（WZCAT.sleepH，臺北日落）；有 cat_jump_down／cat_jump_up／cat_lie_idle 的 GLB：
  早上：在圓椅座面上 cat_lie_idle → 時間到 jturn（轉向外）→ jdown（跳下來）→ 走到圓椅前；
  傍晚：走回圓椅前 → prejump（走到座面前 0.30 m）→ jup（跳上去）→ sleep（座面上 cat_lie_idle）；晚上趴著（lie＝bench、clip cat_lie_idle）。
遊戲時間 1 分鐘＝真實 2.5 秒（hourRate 1/150）。
【前置／捷徑】load_zone 讀檔到 wenzhou 公園 (24, 19)（離圓椅 4 m 多，貓不會來蹭）、DAY（預設 2025-10-22 週三），條件事件關掉；
  三段：① 06:58 讀檔，每 0.4 秒記 WZCAT.state() 和貓的高度，看到 07:00 以後跳下來；② 讀檔到 sleepH−0.03（日落前約 2 分鐘），記到跳上去趴好；③ 21:00 讀檔，看趴在座面上。
每段在關鍵時刻用另一台相機（藏玩家）拍圓椅：jdown／jup 中、落地／趴好以後。玩家不動（貓只在玩家 4 m 內不動 3 秒才會來蹭）。
只記錄、判狀態順序和位置（動作好不好看交 BB）。PARK.rainy、catCold、catLost、catAdopted 成立時那一天貓不醒——照實記，換下一天。Playwright（PC GPU）≠ iPhone。
用法：LW_TESTS=<wt>/tests TAG=new|old [DAY=2025-10-22] python3 cc_wzcat_jump_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
DAYS = [d for d in (os.environ.get('DAY') or '2025-10-22,2025-10-23,2025-10-16,2025-11-05').split(',') if d]
R = L.Run('wzcat_jump_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
POS = (24.0, 19.0)
ST = r"""(()=>{ const W=typeof WZCAT!=='undefined'?WZCAT:null; const s=W&&W.state?W.state():null; let y=null, vis=null;
  let bone=null; GAME.E.scene.traverse(o=>{ if(y==null&&o.name==='CAT_walk_mesh'){ let v=true; for(let q=o;q;q=q.parent) if(q.visible===false){ v=false; break; } const p=new THREE.Vector3(); o.getWorldPosition(p); y=+p.y.toFixed(3); vis=v;
    const sk=o.skeleton||(o.children||[]).map(c=>c.skeleton).find(Boolean); const bs=sk?sk.bones:[]; const bn=bs.find(b=>/body/i.test(b.name))||bs.find(b=>/spine|hip|pelvis/i.test(b.name))||bs[1]||bs[0];
    if(bn){ const w=new THREE.Vector3(); bn.getWorldPosition(w); bone={name:bn.name,x:+w.x.toFixed(3),y:+w.y.toFixed(3),z:+w.z.toFixed(3)}; } } });   /* 跳的位移在 body 骨頭上（S.JUMP），播完才搬物件：連續不連續要看骨頭 */
  const K=typeof PARK!=='undefined'?PARK:null, G=GAME.G;
  return {h:+(+G.hour).toFixed(3), zone:G.zone, s, y, vis, bone, awake:W&&W.awake?W.awake(G):null, sleepH:W&&W.sleepH?+W.sleepH(G).toFixed(3):null,
    rainy:K&&K.rainy?!!K.rainy(G):null, cold:K&&K.catCold?!!K.catCold(G):null, lost:K&&K.catLost?!!K.catLost(G):null, adopted:K&&K.catAdopted?!!K.catAdopted(G):null,
    clips:W&&W.clips?W.clips():null}; })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(50, c.width/c.height, 0.05, 300); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const P=E.player.obj, pv=P.visible; P.visible=false; try{ r.render(E.scene,cam); } finally { P.visible=pv; } return c.toDataURL('image/png'); })"""


async def snap(pg, fn, x, z, y=0.4):
    u = await pg.evaluate(SNAP, {'from': [x + 2.2, 1.5, z - 2.2], 'at': [x, y, z]}); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def watch(pg, tag, secs, stop=None, shots=()):
    """平常每 0.4 秒記一次（狀態變了才記一筆）；跳的那幾個狀態（jturn／jdown／prejump／jup）每 0.1 秒記 body 骨頭的世界位置（S.JUMP 的位移在骨頭上、播完才搬物件，所以不看物件位置），算每一格移動多少（BB：自然、不是瞬移）。
    shots＝[(狀態, 檔名)]：進入那個狀態時拍一張；jdown／jup 另外在中間、結束各拍一張"""
    log = []; last = None; seen = set(); fine = []; t_end = secs; t = 0.0; jcount = {}
    while t < t_end:
        q = await pg.evaluate(ST); s = q['s'] or {}
        key = (s.get('state'), s.get('clip'), s.get('lie')); stt = s.get('state')
        if key != last:
            log.append({'h': q['h'], 'state': stt, 'clip': s.get('clip'), 'lie': s.get('lie'), 'x': s.get('x'), 'z': s.get('z'), 'y': q['y'], 'vis': q['vis']}); last = key
            for st_, fn in shots:
                if st_ == stt and st_ not in seen and s.get('x') is not None:
                    seen.add(st_); await snap(pg, fn, s['x'], s['z'])
        jumping = stt in ('jturn', 'jdown', 'prejump', 'jup')
        if jumping:
            bn = q.get('bone') or {}
            fine.append({'state': stt, 'x': bn.get('x'), 'z': bn.get('z'), 'y': bn.get('y'), 'h': q['h'], 'bone': bn.get('name'), 'ox': s.get('x'), 'oz': s.get('z'), 'oy': q['y']})
            jcount[stt] = jcount.get(stt, 0) + 1
            if stt in ('jdown', 'jup') and jcount[stt] == 4 and s.get('x') is not None:
                await snap(pg, 'cat_%s_%s_mid.png' % (TAG, stt), s['x'], s['z'])
        if stop and stop(q): break
        dt = 0.1 if jumping else 0.4
        await pg.wait_for_timeout(int(dt * 1000)); t += dt
    R.note('%s 狀態變化：%s' % (tag, J(log)))
    if fine:
        steps = []
        for a, b_ in zip(fine, fine[1:]):
            if None in (a['x'], b_['x'], a['y'], b_['y']): continue
            steps.append(round(((b_['x'] - a['x']) ** 2 + (b_['z'] - a['z']) ** 2 + (b_['y'] - a['y']) ** 2) ** 0.5, 3))
        R.note('%s 跳的那一段每 0.1 秒 body 骨頭的世界位置（x, z, y；骨頭 %s）：%s' % (tag, fine[0].get('bone'), J([(f['state'], f['x'], f['z'], f['y']) for f in fine])))
        print('  INFO %s 跳的那一段：%d 格、每格移動最大 %.3f m、平均 %.3f m（瞬移＝某一格突然跳很遠）' % (tag, len(fine), max(steps) if steps else 0, (sum(steps) / len(steps)) if steps else 0), flush=True)
    return log, q, fine


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 橘貓跳上跳下：worktree %s；TAG %s；Playwright（PC GPU）≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        has = await pg.evaluate("(()=>typeof WZCAT!=='undefined'&&!!WZCAT.state)()")
        if not R.check('這一版有 WZCAT（會動的貓）', has, ''): await b.close(); return
        day = None
        for d in DAYS:
            R.setup('【前置／捷徑】讀檔到 wenzhou 公園 (%s, %s) %s 10:00（先看這一天貓會不會醒）' % (POS[0], POS[1], d))
            await D.load_zone(pg, cdp, 'wenzhou', d, 10.0, x=POS[0], z=POS[1], yaw=0.0, wait=9000)
            q = await pg.evaluate(ST); R.note('%s 10:00：%s' % (d, J({k: q[k] for k in ('awake', 'sleepH', 'rainy', 'cold', 'lost', 'adopted')})))
            if q['awake']: day = d; break
        if not R.check('找得到貓醒著的一天', bool(day), J(DAYS)): await b.close(); return
        sleepH = q['sleepH'] or 18.5
        # ① 早上跳下來
        R.setup('【前置／捷徑】讀檔到 wenzhou 公園 %s 06:58（貓還在圓椅上睡）' % day)
        await D.load_zone(pg, cdp, 'wenzhou', day, 6.0 + 52 / 60, x=POS[0], z=POS[1], yaw=0.0, wait=9000)   # r2：06:52（PC r1 06:58 讀檔等 9 秒＝遊戲 3.6 分，貓在讀檔時就跳完了）
        q0 = await pg.evaluate(ST); s0 = q0['s'] or {}
        await snap(pg, 'cat_%s_1_0658.png' % TAG, s0.get('x') or 26.0, s0.get('z') or 24.0)
        R.check('06:58 貓在圓椅上睡（state sleep、lie bench）', s0.get('state') == 'sleep' and s0.get('lie') == 'bench', J(q0))
        log1, q1, f1 = await watch(pg, '① 07:00 前後', 150, stop=lambda q: (q['s'] or {}).get('state') in ('walk', 'sit', 'look', 'idle', 'wander') and q['h'] > 7.02,
                               shots=(('jturn', 'cat_%s_1_jturn.png' % TAG), ('jdown', 'cat_%s_1_jdown.png' % TAG), ('rise', 'cat_%s_1_rise.png' % TAG)))
        sts = [x['state'] for x in log1]
        R.check('07:00 以後：jturn → jdown（從座面轉向外、跳下來）', 'jdown' in sts and ('jturn' not in sts or sts.index('jturn') < sts.index('jdown')), J(sts))
        if f1: R.check('跳下來那一段沒有瞬移（每 0.1 秒 body 骨頭移動 ≤ 0.35 m）', max([0] + [((b_['x'] - a['x']) ** 2 + (b_['z'] - a['z']) ** 2 + (b_['y'] - a['y']) ** 2) ** 0.5 for a, b_ in zip(f1, f1[1:]) if None not in (a['x'], b_['x'], a['y'], b_['y'])]) <= 0.35, J([(f['state'], f['x'], f['z'], f['y']) for f in f1][:40]))
        s1 = q1['s'] or {}
        await snap(pg, 'cat_%s_1_after.png' % TAG, s1.get('x') or 26.0, s1.get('z') or 23.3)
        R.check('跳下來以後在地上（貓高度 < 0.15 m）', q1['y'] is not None and q1['y'] < 0.15, J({'y': q1['y'], 's': s1}))
        # ② 傍晚跳上去
        h2 = sleepH - 0.12   # r2：日落前約 7 分（r1 −0.03 讀檔時就跳上去了）
        R.setup('【前置／捷徑】讀檔到 wenzhou 公園 %s %.3f 時（日落 %.3f 前約 2 分鐘）' % (day, h2, sleepH))
        await D.load_zone(pg, cdp, 'wenzhou', day, h2, x=POS[0], z=POS[1], yaw=0.0, wait=9000)
        log2, q2, f2 = await watch(pg, '② 日落前後', 240, stop=lambda q: (q['s'] or {}).get('state') == 'sleep' and (q['s'] or {}).get('lie') == 'bench',
                               shots=(('prejump', 'cat_%s_2_prejump.png' % TAG), ('jup', 'cat_%s_2_jup.png' % TAG), ('sleep', 'cat_%s_2_sleep.png' % TAG)))
        sts = [x['state'] for x in log2]
        R.check('日落以後：prejump → jup → sleep（走到座面前、跳上去、趴好）', 'jup' in sts and sts[-1] == 'sleep' and sts.index('jup') < len(sts) - 1, J(sts))
        if f2: R.check('跳上去那一段沒有瞬移（每 0.1 秒 body 骨頭移動 ≤ 0.35 m）', max([0] + [((b_['x'] - a['x']) ** 2 + (b_['z'] - a['z']) ** 2 + (b_['y'] - a['y']) ** 2) ** 0.5 for a, b_ in zip(f2, f2[1:]) if None not in (a['x'], b_['x'], a['y'], b_['y'])]) <= 0.35, J([(f['state'], f['x'], f['z'], f['y']) for f in f2][:40]))
        s2 = q2['s'] or {}
        R.check('趴在圓椅座面上（lie bench、clip cat_lie_idle、高度 ≥ 0.35 m）', s2.get('lie') == 'bench' and s2.get('clip') == 'cat_lie_idle' and (q2['y'] or 0) >= 0.35, J(q2))
        # ③ 晚上
        R.setup('【前置／捷徑】讀檔到 wenzhou 公園 %s 21:00' % day)
        await D.load_zone(pg, cdp, 'wenzhou', day, 21.0, x=POS[0], z=POS[1], yaw=0.0, wait=9000)
        await pg.wait_for_timeout(3000); q3 = await pg.evaluate(ST); s3 = q3['s'] or {}
        await snap(pg, 'cat_%s_3_2100.png' % TAG, s3.get('x') or 26.0, s3.get('z') or 24.0)
        R.check('21:00 趴在圓椅上（sleep、lie bench、cat_lie_idle、高度 ≥ 0.35 m）', s3.get('state') == 'sleep' and s3.get('lie') == 'bench' and s3.get('clip') == 'cat_lie_idle' and (q3['y'] or 0) >= 0.35, J(q3))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
