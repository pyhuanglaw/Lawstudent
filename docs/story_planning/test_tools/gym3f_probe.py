"""BB（帳號 A）2026-10-21：ART-GYM2-INT 新體育館 3F 主球場（LAWWW 19:14 派；開發分支 a3837c1c 起；「看」的字 AA_371 第 2 節）。
照玩家：1F 大廳西側樓梯口「上樓到 3F 主球場」→ 入口通道 → 場地中間（四個方向＋往上看有沒有光暈浮在半空）→「看主球場」按兩次、「大螢幕」→
看台走道走上去、坐第 3 排旁邊的位子 → 起來 → 坐第 7 排 → 起來 → 走回通道盡頭的門下樓（回到 1F）。每一步截圖，記鏡頭位置、玩家位置。
[前置] 讀使用者 9/25 存檔改到體育館 1F 15:00（平常的日子，不是典禮）；之後都是玩家的操作（點地面走路、按互動）。往上看那張是 [捷徑] 劇情鏡頭（藏玩家）。
Playwright（SwiftShader）手機橫向模擬，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 gym3f_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SNAP = """(()=>{ const E=GAME.E, P=E.player, c=E.camera.position; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+P.obj.position.x.toFixed(2), y:+P.obj.position.y.toFixed(2), z:+P.obj.position.z.toFixed(2), lv:P.lv|0, seat:!!P.seat,
  cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], camDist:+Math.hypot(c.x-P.obj.position.x,c.z-P.obj.position.z).toFixed(2)}; })()"""
CAP = """(()=>{ if(window.__caph) return; window.__caph=1; window.__CAP=[]; const o=GAME.caption; GAME.caption=function(a,b){ try{ window.__CAP.push(String(b||a||'')); }catch(e){} return o.apply(this,arguments); }; })()"""
DAY_ARENA = ['（三樓的主球場。木頭地板上畫了好幾種顏色的線，籃球、排球、羽球，疊在一起。）', '（看台一排一排往上，大部分的位子都空著。最上面那排，有人在睡午覺。）']
DAY_SCREEN = '（大螢幕是黑的。角落有一個小燈亮著。）'
bad = []; notes = []
def say(*a): print(' '.join(str(x) for x in a), flush=True)


async def use(pg, cdp, run, pred_js, why, near=0.8):
    it = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const its=(GAME.E.interactables||[]).filter(i=>!i.hidden&&(%s)); its.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=its[0]; return i?[i.x,i.z,i.label||'',i.lv|0]:null; })()" % pred_js)
    if not it: say('   ⚠ 找不到 %s' % why); bad.append('找不到 %s' % why); return None
    if not await L.go_to(pg, cdp, run, it[0], it[1], near, it[2], max_s=240, lv=it[3]): say('   ⚠ 走不到 %s' % it[2]); bad.append('走不到 %s' % it[2]); return None
    for k in range(5):
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if lab: break
        await pg.wait_for_timeout(800)
    say('   互動：%s（按鈕「%s」）' % (it[2], lab)); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    return it


async def zone_is(pg, z, secs=60):
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate("GAME.G.zone") == z and not (await L.state(pg))['busy']: return True
        await pg.wait_for_timeout(1000)
    return False


async def sit_row(pg, cdp, run, row):
    """坐第 row 排（3 或 7）：看台的座位互動點裡 seat.y 第幾低的一組；走過去按「坐在看台」"""
    ys = await pg.evaluate("[...new Set((GAME.E.interactables||[]).filter(i=>i.seat&&i.label==='坐在看台').map(i=>+i.seat.y.toFixed(2)))].sort((a,b)=>a-b)")
    if len(ys) < 2: bad.append('看台座位高度只有 %s' % ys); return False
    y = ys[0] if row == 3 else ys[-1]
    it = await use(pg, cdp, run, "i.seat&&i.label==='坐在看台'&&Math.abs(i.seat.y-%s)<0.05" % y, '第 %d 排的座位' % row, near=0.6)
    await pg.wait_for_timeout(2500); s = await pg.evaluate(SNAP); await run.shot(pg, 'seat_row%d' % row)
    say('   第 %d 排（座位高 %.2f m）：%s' % (row, y, json.dumps(s, ensure_ascii=False)))
    if not s['seat']: bad.append('第 %d 排沒有坐下（%s）' % (row, json.dumps(s, ensure_ascii=False))); return False
    for yaw in (0.0, math.pi / 2):   # 坐著轉鏡頭：鏡頭會不會鑽進看台或後牆（看截圖）
        await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=GAME.E.player.obj.rotation.y+Math.PI+y; C.manualT=60; })(%s)" % yaw); await pg.wait_for_timeout(2500)
        await run.shot(pg, 'seat_row%d_cam%d' % (row, int(yaw * 10))); notes.append(('row%d' % row, yaw, await pg.evaluate(SNAP)))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)   # 起來（玩家按互動鍵）
    if (await pg.evaluate(SNAP))['seat']: bad.append('第 %d 排起不來' % row)
    return True


async def main():
    run = L.Run('gym3f', OUT); base = json.load(open(SAVE, encoding='utf-8')); G = base.get('G', base)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        G = json.loads(json.dumps(G)); G.update({'zone': 'gym', 'hour': 15.0, 'pos': None})
        await L.load_state(pg, G); await pg.wait_for_timeout(8000); await pg.evaluate(CAP); run.setup('[前置] 使用者 9/25 存檔改到體育館 1F 15:00')
        await L.close_panels(pg, cdp)
        it = await use(pg, cdp, run, "i.exit&&i.exit.to==='gym_arena'", '上樓到 3F 主球場')
        ok = await zone_is(pg, 'gym_arena'); await pg.wait_for_timeout(8000)
        s = await pg.evaluate(SNAP); await run.shot(pg, 'arena_arrive'); say('   到 3F：%s' % json.dumps(s, ensure_ascii=False))
        if not ok: bad.append('按了以後沒有到 3F 主球場（%s）' % s['zone'])
        else:
            await L.go_to(pg, cdp, run, 0.0, 0.0, 1.5, '場地中間', max_s=240)
            for k, yaw in enumerate([0.0, math.pi / 2, math.pi, -math.pi / 2]):
                await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=60; })(%s)" % yaw); await pg.wait_for_timeout(2500); await run.shot(pg, 'court_y%d' % k)
            # [捷徑] 往上看（劇情鏡頭、藏玩家）：光暈有沒有浮在半空
            await pg.evaluate("(()=>{ const P=GAME.E.player; P.obj.visible=false; const p=P.obj.position; GAME.E.cinematic(new THREE.Vector3(p.x,1.6,p.z), new THREE.Vector3(p.x+0.5,17,p.z-6)); GAME.E.snapCinematic(); })()")
            await pg.wait_for_timeout(2500); await run.shot(pg, 'court_up'); await pg.evaluate("(()=>{ GAME.E.endCinematic(); GAME.E.player.obj.visible=true; })()")
            # 看主球場 ×2、大螢幕
            await pg.evaluate("window.__CAP=[]")
            await use(pg, cdp, run, "i.label==='看主球場'", '看主球場', near=1.2); await pg.wait_for_timeout(1500)
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
            await use(pg, cdp, run, "i.label==='大螢幕'", '大螢幕', near=1.2); await pg.wait_for_timeout(1500)
            caps = await pg.evaluate("window.__CAP||[]"); say('   「看」的字：%s' % json.dumps(caps, ensure_ascii=False))
            if not all(any(t in c for c in caps) for t in DAY_ARENA): bad.append('看主球場兩次沒有出現平常那兩句（%s）' % caps)
            if not any(DAY_SCREEN in c for c in caps): bad.append('大螢幕沒有出現平常那句（%s）' % caps)
            await sit_row(pg, cdp, run, 3); await sit_row(pg, cdp, run, 7)
            it = await use(pg, cdp, run, "i.exit&&i.exit.to==='gym'", '下樓的門')
            back = await zone_is(pg, 'gym'); await pg.wait_for_timeout(4000); s2 = await pg.evaluate(SNAP); await run.shot(pg, 'back_1f')
            say('   下樓：%s' % json.dumps(s2, ensure_ascii=False))
            if not back: bad.append('從 3F 下樓沒有回到 1F（%s）' % s2['zone'])
        json.dump({'bad': bad, 'notes': notes}, open(os.path.join(OUT, 'gym3f.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('3F 主球場：上樓、看、坐看台第 3／7 排、下樓都照玩家做得到（鏡頭、光暈看截圖）', not bad, json.dumps(bad[:6], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    run.finish()
asyncio.run(main())
