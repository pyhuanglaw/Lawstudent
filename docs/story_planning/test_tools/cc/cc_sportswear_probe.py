"""CC-B（帳號 B）11-07：SPORTSWEAR_0f4b（BB-B 06:25；GYM-FIT-1107 ③ 祐廷的短袖運動服，LAWWW2-B 1d022e8d1、開發 c1fe4f3f0／0f4b0394a）。
  規則：在 B1（gym_b1）或上體育課（CLS.peWear）＝穿 GYM_TOP、GYM_SHORTS，藏原本的上衣、褲子、系外套、拿下後背包；出來＝照原樣（後背包回來、外套照舊）。
  每一步記：u.gymWear、GYM_TOP／GYM_SHORTS 看不看得到、後背包（props.backpack）看不看得到、系外套 JACKET_ECON。
    ① B1 走廊：站著（正面、側面）、跑（走廊上跑一段，跑到一半停主迴圈拍）
    ② 坐在器材上：腳踏車機（照玩家按「用腳踏車機」，【前置】會員卡），旁白那一刻拍
    ③ 體育課上課中：【捷徑】在 1F 大廳把 CLS.peWear 設成一堂課 → FIT.gymWearSync（真的「去上課」流程 BB 在雲端測過）；拍完清掉、要換回來
    ④ 從 B1 走「上樓回大廳」回到 1F：換回原本的衣服、後背包回來（換區域那一刻前後各拍一張）
    ⑤ 四階體態 fit 0／30／60／90 × 運動服：B1 走廊同一點、同一個角度，各一張站姿
  看圖給 LAWWW（D100a）：穿模、換裝那一刻閃一下或少東西。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_sportswear_probe.py <url> <out>"""
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
R = L.Run('sportswear', OUT); D.setup(R, OUT)
DAY = '2025-10-15'
WEAR = r"""(()=>{ const P=GAME.E.player, h=P.obj; let u=null; h.traverse(o=>{ if(!u&&o.userData&&o.userData.driver==='vrm') u=o.userData; }); u=u||h.userData; const vis=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
  const m={}; (u.model||h).traverse(o=>{ if(o.name==='GYM_TOP'||o.name==='GYM_SHORTS'||o.name==='JACKET_ECON') m[o.name]=(m[o.name]||false)||vis(o); });
  const bp=u.props&&u.props.backpack; const o=h.position; return {zone:GAME.G.zone, gymWear:!!u.gymWear, top:!!m.GYM_TOP, shorts:!!m.GYM_SHORTS, jacket:m.JACKET_ECON==null?null:m.JACKET_ECON, backpack:bp?vis(bp):null, pe:typeof CLS!=='undefined'?(CLS.peWear||null):null,
    x:+o.x.toFixed(2), z:+o.z.toFixed(2), yaw:+h.rotation.y.toFixed(3), pose:P.pose||null}; })()"""


def cams(x, z, yaw):
    fx, fz = math.sin(yaw), math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
    return {'front': {'eye': [x + fx * 2.6, 1.3, z + fz * 2.6], 'look': [x, 1.0, z], 'lens': 35},
            'side': {'eye': [x + rx * 2.6, 1.3, z + rz * 2.6], 'look': [x, 1.0, z], 'lens': 35}}


async def two(pg, cdp, name, w):
    return {k: await D.user_shot(pg, cdp, '%s_%s' % (name, k), c, hide_player=False) for k, c in cams(w['x'], w['z'], w['yaw']).items()}


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC SPORTSWEAR（祐廷短袖運動服）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        B = await pg.evaluate("(()=>{ const B=GYM_LAYOUT.b1; return {cor:B.corridor, exit:B.exit}; })()")
        cz = (B['cor']['z0'] + B['cor']['z1']) / 2; cx = 6.0
        # ① 走廊站著、跑
        R.setup('[①] 讀檔 gym_b1 走廊 (%.1f, %.2f) %s 10:00' % (cx, cz, DAY))
        await D.load_zone(pg, cdp, 'gym_b1', DAY, 10.0, x=cx, z=cz, yaw=-1.5708, wait=8000); await pg.wait_for_timeout(1500)
        w = await pg.evaluate(WEAR); rec['b1_stand'] = w
        R.check('[①] B1：穿運動服（gymWear、GYM_TOP、GYM_SHORTS 看得到）、後背包拿下', w['gymWear'] and w['top'] and w['shorts'] and w['backpack'] in (False, None), J(w))
        await two(pg, cdp, 'sw_b1_stand', w)
        task = asyncio.create_task(L.go_to(pg, cdp, R, cx - 12.0, cz, 0.5, '[①] 走廊往西跑 12 m', max_s=40)); wr = None
        for _ in range(30):
            await pg.wait_for_timeout(200); wr = await pg.evaluate(WEAR)
            if wr['pose'] in ('run', 'walk') and abs(wr['x'] - cx) > 1.0: break
        await pg.evaluate("(()=>{ GAME.E.paused=true; })()"); await two(pg, cdp, 'sw_b1_run', wr); await pg.evaluate("(()=>{ GAME.E.paused=false; })()")
        try: await task
        except Exception: pass
        R.note('[①] 跑的那一刻 %s' % J(wr))
        # ② 腳踏車機
        F = await pg.evaluate("(()=>{ const F=GYM_LAYOUT.b1.fitness; return {x0:F.x0,x1:F.x1,z0:F.z0,z1:F.z1}; })()")
        R.setup('[②] 讀檔 gym_b1 健身中心裡 %s 10:00；【前置】會員卡' % DAY)
        await D.load_zone(pg, cdp, 'gym_b1', DAY, 10.0, x=(F['x0'] + F['x1']) / 2 + 8.0, z=F['z0'] + 3.0, wait=8000)
        await pg.evaluate("(()=>{ const G=GAME.G; G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; if(!r.card) r.card=G.day; })()")
        its = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>i.gymEquip&&!i.hidden&&/腳踏車機/.test(i.label)).map(i=>({x:i.x,z:i.z,label:i.label})))()")
        if R.check('[②] 有沒人在用的腳踏車機', bool(its), J(its)):
            it = its[0]; await L.go_to(pg, cdp, R, it['x'], it['z'], 0.3, '[②] 走到腳踏車機', max_s=60)
            q = await D.st(pg)
            if q['interact'].startswith('用腳踏車機'):
                await L.tap(pg, cdp, '#interact'); shot = False
                for _ in range(80):
                    q = await D.st(pg)
                    if q['choices']:
                        k = next((i for i, x in enumerate(q['choices']) if not x.startswith('算了')), 0); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(900); continue
                    if q['dlg']:
                        wb = await pg.evaluate(WEAR)
                        if not shot and wb['pose'] not in (None, 'idle'):
                            rec['bike'] = wb; await two(pg, cdp, 'sw_bike', wb); shot = True
                            R.check('[②] 騎腳踏車機時穿運動服', wb['gymWear'] and wb['top'], J(wb))
                        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                    if shot and not q['busy']: break
                    await pg.wait_for_timeout(300)
                R.check('[②] 腳踏車機那一刻拍到了', shot, '')
            else: R.note('[②] 走到旁邊按鈕是 %r' % q['interact'])
        # ③ 體育課（捷徑）
        R.setup('[③] 讀檔 gym（1F 大廳）%s 14:00；【捷徑】CLS.peWear＝probe → FIT.gymWearSync' % DAY)
        await D.load_zone(pg, cdp, 'gym', DAY, 14.0, wait=8000); await pg.wait_for_timeout(1200)
        w0 = await pg.evaluate(WEAR)
        await pg.evaluate("(()=>{ CLS.peWear='probe'; FIT.gymWearSync(GAME); })()"); await pg.wait_for_timeout(800)
        w1 = await pg.evaluate(WEAR); rec['pe_on'] = w1
        R.check('[③] 上體育課（CLS.peWear）穿運動服、後背包拿下', w1['gymWear'] and w1['top'] and w1['backpack'] in (False, None), J({'before': w0, 'pe': w1}))
        await two(pg, cdp, 'sw_pe', w1)
        await pg.evaluate("(()=>{ CLS.peWear=null; FIT.gymWearSync(GAME); })()"); await pg.wait_for_timeout(800)
        w2 = await pg.evaluate(WEAR); rec['pe_off'] = w2
        R.check('[③] 下課（peWear 清掉）換回原本的、後背包照原樣', not w2['gymWear'] and not w2['top'] and w2['backpack'] == w0['backpack'] and w2['jacket'] == w0['jacket'], J({'before': w0, 'after': w2}))
        # ④ B1 走出去回到 1F
        R.setup('[④] 讀檔 gym_b1 出口旁 %s 10:00' % DAY)
        ex = B['exit']['at']
        await D.load_zone(pg, cdp, 'gym_b1', DAY, 10.0, x=ex['x'], z=ex['z'] - 1.2, wait=8000); await pg.wait_for_timeout(1200)
        wa = await pg.evaluate(WEAR); await two(pg, cdp, 'sw_exit_before', wa)
        s = await D.use_exit(pg, cdp, '[④]', '上樓回大廳', 'gym')
        await pg.wait_for_timeout(1500); wb = await pg.evaluate(WEAR); rec['exit'] = {'before': wa, 'after': wb}
        R.check('[④] 回到 1F：換回原本的衣服（gymWear false、GYM_TOP 藏）、後背包回來', wb['zone'] == 'gym' and not wb['gymWear'] and not wb['top'] and wb['backpack'] in (True, None), J({'before': wa, 'after': wb}))
        await two(pg, cdp, 'sw_exit_after', wb)
        # ⑤ 四階體態 × 運動服
        for fit in (0, 30, 60, 90):
            R.setup('[⑤ fit %d] 讀檔 gym_b1 走廊 (%.1f, %.2f)；【捷徑】fit＝%d → FIT.sync' % (fit, cx, cz, fit))
            await D.load_zone(pg, cdp, 'gym_b1', DAY, 10.0, x=cx, z=cz, yaw=-1.5708, wait=7000)
            await pg.evaluate("((f)=>{ const G=GAME.G; G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; r.fit=f; FIT.sync(GAME); FIT.gymWearSync(GAME); })", fit); await pg.wait_for_timeout(1200)
            wf = await pg.evaluate(WEAR); rec['fit%d' % fit] = wf
            await two(pg, cdp, 'sw_fit%02d' % fit, wf)
        with open(os.path.join(OUT, 'sportswear.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
