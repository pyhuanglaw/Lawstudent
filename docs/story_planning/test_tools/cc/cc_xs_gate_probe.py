"""CC-C（帳號 C）11-05：XS_GATE（BB-C 08:05 第 2 點；XS-GATE-MOVE-1105，LAWWW2 14052d810＝開發分支 7aa703cf9 收進來）——新生南路側門搬到映月湖和博思中間。
  期望（BB-C 08:05；座標照 src/data/xinsheng_layout.js 的 note＋commit 7aa703cf9 訊息：側門 (−66, −99)、從新生南路回來落在 campusSpawn）：
    a 步道往西看側門：白天 14:00、晚上 20:30 各一張（給使用者看，不判）。
    b 從新生南路「回到首都帝大（新生南路側門）」照玩家走過去按：到校園、站得住、推得動；從落點照玩家走得到映月湖南岸步道、博思門口、校門內側（walkFallbacks 0）。
    c 校門往北看斜牆：白天、晚上各一張（不判）＋一張近一點的（斜牆中段）。
    d 舊存檔存在舊側門 (−120, −83)：讀檔要落在 (−118.25, −80.25)（BB-C 08:05；容許 0.3 m）、站得住、推得動、走得到校門內側。
  【前置／捷徑】讀檔指定地點時間（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [PARTS=shots,back,old] python3 cc_xs_gate_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
PARTS = [x for x in (os.environ.get('PARTS') or 'shots,back,old').split(',') if x]
R = L.Run('xs_gate', OUT); D.setup(R, OUT)
DAY = '2025-10-18'   # 星期六（沒有課拉走人）
GATE = (-66.0, -99.0)
OLD = (-120.0, -83.0); OLD_WANT = (-118.25, -80.25)
FB = "(GAME.walkFallbacks||0)"
RAY = r"""((pts)=>{ const E=GAME.E, rc=new THREE.Raycaster(), out=[]; for(const [x,y] of pts){ rc.setFromCamera(new THREE.Vector2(x,y),E.camera);
  const h=rc.intersectObjects(E.scene.children,true).filter(q=>{ for(let o=q.object;o;o=o.parent) if(o.visible===false) return false; return true; })[0];
  if(!h){ out.push({p:[x,y], hit:null}); continue; } const o=h.object, chain=[]; for(let a=o;a&&chain.length<4;a=a.parent) chain.push(a.name||a.type); const m=[].concat(o.material)[0]||{};
  out.push({p:[x,y], d:+h.distance.toFixed(1), at:[+h.point.x.toFixed(1),+h.point.y.toFixed(1),+h.point.z.toFixed(1)], chain, mat:m.name||m.type, color:m.color?'#'+m.color.getHexString():null, map:!!m.map, side:m.side, transparent:!!m.transparent, opacity:m.opacity}); }
  return out; })"""


async def goals_from(pg, cdp, tag, here):
    """從 here 照玩家走到三個地方（每一段從上一個終點接著走）"""
    boya = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&/博思/.test(i.label||'')); return i?[+i.x.toFixed(2),+i.z.toFixed(2),i.label]:null; })()")
    R.note('%s 博思門口：%s' % (tag, J(boya)))
    goals = [('映月湖南岸步道', -36.0, -98.0)]
    if boya:
        b = await D.standable_near(pg, boya[0], boya[1], 1.2)
        if b: goals.append(('博思門口（%s）' % boya[2], b['x'], b['z']))
    goals.append(('校門內側', -110.0, 0.0))
    for nm, x, z in goals:
        fb0 = await pg.evaluate(FB)
        ok = await L.go_to(pg, cdp, R, x, z, 1.2, '%s → %s' % (tag, nm), max_s=420)
        s = await D.settle(pg); fb = await pg.evaluate(FB)
        R.check('%s 照玩家走得到%s (%s, %s)（自動放過去 0 次）' % (tag, nm, x, z), bool(ok) and math.hypot(s['x'] - x, s['z'] - z) <= 1.6 and fb == fb0 and s['stand'],
                J({'at': [s['x'], s['z']], 'fb': fb - fb0, 'stand': s['stand']}))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC XS_GATE（新生南路側門搬到映月湖和博思中間）：SHA=%s（worktree 實際 %s）；PARTS=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', PARTS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        ex = await pg.evaluate("(()=>({lay:XINSHENG_LAYOUT.sideGate.campusSpawn, label:XINSHENG_LAYOUT.sideGate.label}))()")
        R.note('這一版 XINSHENG_LAYOUT.sideGate：%s' % J(ex))
        if 'shots' in PARTS:
            for hh, tn in ((14.0, 'day'), (20.5, 'night')):
                R.setup('讀檔校園 %s %05.2f、側門東邊步道 (−50, −99)' % (DAY, hh))
                await D.load_zone(pg, cdp, 'campus', DAY, hh, -50.0, -99.0, -math.pi / 2, wait=7000)
                gx = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='xinsheng'); return i?[+i.x.toFixed(2),+i.z.toFixed(2),i.label]:null; })()")
                R.check('[%s] 校園的「往新生南路（側門）」出口在映月湖和博思中間那條步道的西端（x −66 附近、z −99）' % tn, bool(gx) and abs(gx[1] - GATE[1]) < 1.0 and abs(gx[0] - GATE[0]) < 3.0, J(gx))
                await D.user_shot(pg, cdp, 'xsgate_path_west_%s' % tn, {'eye': [-44.0, 1.7, -99.4], 'look': [-66.0, 1.6, -99.0], 'lens': 24})
                await D.user_shot(pg, cdp, 'xsgate_path_west_near_%s' % tn, {'eye': [-55.0, 1.7, -99.6], 'look': [-67.0, 1.8, -99.0], 'lens': 24})
                await D.user_shot(pg, cdp, 'xsgate_maingate_north_%s' % tn, {'eye': [-110.0, 1.7, -4.0], 'look': [-98.0, 1.4, -86.0], 'lens': 24})   # 校門內側往北（洞洞館 (−104, −30) 擋在中間；左上黑的一塊＝鏡頭旁邊的樹冠，雲端 12cb 看到，給 BB 看）
                # BB-C 09:07：這張左上一大塊黑的半圓「不像樹冠」——同一個鏡頭從左上幾點打射線，記打到什麼（名字、往上三層、材質顏色、離鏡頭多遠）
                await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(500)
                await pg.evaluate(D.CAM, {'eye': [-110.0, 1.7, -4.0], 'look': [-98.0, 1.4, -86.0], 'lens': 24})
                hits = await pg.evaluate(RAY, [[-0.9, 0.9], [-0.75, 0.8], [-0.6, 0.9], [-0.85, 0.6], [-0.5, 0.75], [-0.3, 0.95]])
                await pg.evaluate(D.UNCAM)
                R.note('[%s] 校門往北那張左上（NDC x,y）射線打到：%s' % (tn, J(hits)))
                await D.user_shot(pg, cdp, 'xsgate_maingate_north_near_%s' % tn, {'eye': [-116.0, 1.7, -44.0], 'look': [-98.0, 1.4, -86.0], 'lens': 24})   # 走過洞洞館以後往北
                await D.user_shot(pg, cdp, 'xsgate_slantwall_%s' % tn, {'eye': [-92.0, 1.7, -78.0], 'look': [-95.0, 1.2, -87.5], 'lens': 24})
        if 'back' in PARTS:
            R.setup('讀檔新生南路 %s 14:00（出生點）' % DAY)
            s = await D.load_zone(pg, cdp, 'xinsheng', DAY, 14.0, wait=7000)
            if R.check('[b] 讀到新生南路', s['zone'] == 'xinsheng', J(s)):
                s = await D.use_exit(pg, cdp, '[b]', '回到首都帝大', 'campus')
                if s:
                    cs = ex['lay']
                    R.check('[b] 落點在 campusSpawn (%s, %s) 1 m 內、站得住' % (cs['x'], cs['z']), math.hypot(s['x'] - cs['x'], s['z'] - cs['z']) <= 1.0 and s['stand'], J(s))
                    await D.shot(pg, 'xsgate_back_landing')
                    mv = await D.pushable(pg, cdp)
                    R.check('[b] 落點推得動（搖桿 ≥0.3 m）', mv >= 0.3, J(mv))
                    await goals_from(pg, cdp, '[b] 落點', s)
        if 'old' in PARTS:
            R.setup('讀檔校園 %s 14:00、舊側門 (%s, %s)（舊存檔的位置；GAME.applySave）' % (DAY, OLD[0], OLD[1]))
            s = await D.load_zone(pg, cdp, 'campus', DAY, 14.0, OLD[0], OLD[1], math.pi / 2, wait=7000)
            d = math.hypot(s['x'] - OLD_WANT[0], s['z'] - OLD_WANT[1])
            R.check('[d] 舊存檔 (−120, −83) 讀進來落在 (%s, %s)（BB-C 08:05；容許 0.3 m）、站得住' % OLD_WANT, s['zone'] == 'campus' and d <= 0.3 and s['stand'], J({'at': [s['x'], s['z']], 'd': round(d, 2), 'stand': s['stand']}))
            await D.shot(pg, 'xsgate_old_landing')
            mv = await D.pushable(pg, cdp)
            R.check('[d] 舊存檔落點推得動（搖桿 ≥0.3 m）', mv >= 0.3, J(mv))
            fb0 = await pg.evaluate(FB)
            ok = await L.go_to(pg, cdp, R, -110.0, 0.0, 1.2, '[d] 舊存檔落點 → 校門內側', max_s=420)
            s = await D.settle(pg); fb = await pg.evaluate(FB)
            R.check('[d] 從舊存檔落點照玩家走得出去（到校門內側 (−110, 0)，自動放過去 0 次）', bool(ok) and math.hypot(s['x'] + 110, s['z']) <= 1.6 and fb == fb0, J({'at': [s['x'], s['z']], 'fb': fb - fb0}))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
