"""BB（帳號 A）2026-10-21：BB_HOLFF_ROOMS_1021 第二、三節（READY_FOR_ART_REVIEW；場景美術只有使用者能標 ART_APPROVED，BB 只驗能不能用＋截圖）。
  二、霖澤館 202（linze_202）40 個座位、萬才館多功能教室（wancai_multi）32 個座位：每一個都照玩家走過去按「坐下」、再按一次站起來；
      多功能教室一進門不會馬上出現「坐下」。
  三、宿舍大三 507、大四 409：走廊（樓上那一層）自己的門牌、一樓樓梯口指標；房間窗外白天 14:00、晚上 21:00 各一張（312、507、409 三間要不一樣）。
      9/5 拆箱一件一件出現：這支不做（NOT TESTED，要從拆箱那一天玩）。
[前置] 讀使用者 9/25 存檔改區域、時間、旗標（ROOM_Y2／Y3／Y4）；之後都是玩家的操作（點地面走、按互動）。Playwright（SwiftShader）手機橫向模擬，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 rooms_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>（ONLY=202,multi,dorm）"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
SNAP = """(()=>{ const E=GAME.E, P=E.player; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), lv:P.lv|0, seat:!!P.seat}; })()"""
IBTN = "(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()"
res = {}; bad = []
def say(*a): print(' '.join(str(x) for x in a), flush=True)


async def load(pg, cdp, run, base, why, zone, h, key=None, flags=None):
    G = json.loads(json.dumps(base)); G = G.get('G', G)
    if key: d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key)); G.update({'day': d, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    G.update({'zone': zone, 'hour': h, 'pos': None}); G['flags'].update(flags or {})
    await L.load_state(pg, G); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
    run.setup('[前置] %s：使用者 9/25 存檔改到 %s %.2f%s%s' % (why, zone, h, ' %s' % key if key else '', ' 旗標 %s' % json.dumps(flags, ensure_ascii=False) if flags else ''))


async def seats_all(pg, cdp, run, tag):
    seats = await pg.evaluate("(GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden).map(i=>[+i.x.toFixed(2),+i.z.toFixed(2),i.label])")
    say('   %s：座位互動點 %d 個' % (tag, len(seats))); ok_sit = 0; ok_up = 0; fails = []
    for k, (x, z, lab) in enumerate(seats):
        if not await L.go_to(pg, cdp, run, x, z, 0.6, '%s 座位 %d' % (tag, k + 1), max_s=90):
            fails.append((k + 1, x, z, '走不到')); continue
        await pg.wait_for_timeout(600); b = await pg.evaluate(IBTN)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800); s = await pg.evaluate(SNAP)
        if not s['seat']: fails.append((k + 1, x, z, '按「%s」沒坐下' % b)); continue
        ok_sit += 1
        if k in (0, len(seats) // 2, len(seats) - 1): await run.shot(pg, '%s_seat%02d' % (tag, k + 1))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); s2 = await pg.evaluate(SNAP)
        if s2['seat']: fails.append((k + 1, x, z, '站不起來')); continue
        ok_up += 1
    return len(seats), ok_sit, ok_up, fails


async def t202(pg, cdp, run, base):
    await load(pg, cdp, run, base, '霖澤館 202', 'linze_202', 12.2)
    await pg.wait_for_timeout(4000); await run.shot(pg, '202_enter')
    n, a, b, f = await seats_all(pg, cdp, run, '202')
    res['202'] = {'n': n, 'sit': a, 'up': b, 'fails': f}; say('   202：%d 個座位，坐下 %d、站起來 %d；失敗 %s' % (n, a, b, f[:8]))
    if n != 40 or f: bad.append('202：座位 %d（應該 40），失敗 %s' % (n, f[:5]))


async def tmulti(pg, cdp, run, base):
    await load(pg, cdp, run, base, '萬才館多功能教室', 'wancai_multi', 12.2)
    await pg.wait_for_timeout(4000); b0 = await pg.evaluate(IBTN); s0 = await pg.evaluate(SNAP); await run.shot(pg, 'multi_enter')
    say('   一進門的互動鈕：「%s」（%s）' % (b0, json.dumps(s0, ensure_ascii=False)))
    if '坐' in b0: bad.append('多功能教室一進門就出現「%s」' % b0)
    n, a, b, f = await seats_all(pg, cdp, run, 'multi')
    res['multi'] = {'n': n, 'sit': a, 'up': b, 'fails': f, 'door_btn': b0}; say('   多功能教室：%d 個座位，坐下 %d、站起來 %d；失敗 %s' % (n, a, b, f[:8]))
    if n != 32 or f: bad.append('多功能教室：座位 %d（應該 32），失敗 %s' % (n, f[:5]))


async def tdorm(pg, cdp, run, base):
    out = {}
    for yr, key, flags, plate in (('y2', '2026-09-20', {'ROOM_Y2': True}, '312'), ('y3', '2027-09-20', {'ROOM_Y2': True, 'ROOM_Y3': True}, '507'), ('y4', '2028-09-20', {'ROOM_Y2': True, 'ROOM_Y3': True, 'ROOM_Y4': True, 'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None}, '409')):
        rec = {}
        for h in (14.0, 21.0):
            await load(pg, cdp, run, base, '宿舍 %s（%s）' % (plate, yr), 'dorm', h, key, flags)
            await pg.wait_for_timeout(5000)
            # 房間裡：窗外（鏡頭轉向窗、拉遠）
            win = await pg.evaluate("(()=>{ const z=GAME.E.zone; const w=z&&(z.winParts||[])[0]; if(!w) return null; const p=new THREE.Vector3(); w.getWorldPosition(p); return [p.x,p.y,p.z]; })()")
            if win:
                await pg.evaluate("(w=>{ const P=GAME.E.player.obj.position; GAME.E.player.obj.visible=false; GAME.E.cinematic(new THREE.Vector3(P.x,1.5,P.z), new THREE.Vector3(w[0],w[1],w[2])); GAME.E.snapCinematic(); })(%s)" % json.dumps(win))
                await pg.wait_for_timeout(3000); await run.shot(pg, 'dorm_%s_window_%02d' % (plate, int(h)))
                await pg.evaluate("(()=>{ GAME.E.endCinematic(); GAME.E.player.obj.visible=true; })()")
            rec['win%02d' % int(h)] = win
        # 走出房間到走廊：門牌
        it = await pg.evaluate("(()=>{ const its=(GAME.E.interactables||[]).filter(i=>i.exit&&!i.hidden); return its.map(i=>[i.x,i.z,i.label,i.exit.to]); })()")
        say('   %s 房間的出口：%s' % (plate, it))
        ex = next((x for x in it if x[3] in ('dorm_hall', 'dorm_corridor')), it[0] if it else None)
        if ex and await L.go_to(pg, cdp, run, ex[0], ex[1], 0.7, ex[2], max_s=90):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(6000)
            labs = await pg.evaluate("(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>i.label||'')")
            plates = [l for l in labs if any(c.isdigit() for c in l)]
            rec['hall'] = {'zone': await pg.evaluate("GAME.G.zone"), 'labels': plates[:20]}
            await run.shot(pg, 'dorm_%s_hall' % plate)
            say('   %s 走廊：%s' % (plate, json.dumps(rec['hall'], ensure_ascii=False)))
            if not any(plate in l for l in plates): bad.append('%s：走廊的互動點沒有自己的門牌 %s（%s）' % (yr, plate, plates[:8]))
        else: bad.append('%s：走不出房間（%s）' % (yr, it))
        out[yr] = rec
    res['dorm'] = out


async def main():
    run = L.Run('rooms', OUT); base = json.load(open(SAVE, encoding='utf-8')); allerrs = []
    async with async_playwright() as p:
        for name, fn in (('202', t202), ('multi', tmulti), ('dorm', tdorm)):
            if ONLY and name not in ONLY: continue
            say('== %s' % name); t0 = time.time()
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                await asyncio.wait_for(fn(pg, cdp, run, base), 2400)
            except asyncio.TimeoutError: bad.append('%s 超過 40 分鐘' % name)
            except Exception as e: bad.append('%s 例外 %r' % (name, e))
            allerrs += errs; say('   （%.0f 秒）' % (time.time() - t0))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
        json.dump({'res': res, 'bad': bad}, open(os.path.join(OUT, 'rooms.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('兩間教室每個座位坐得下去、站得起來；多功能教室一進門不會出現「坐下」；宿舍 312／507／409 門牌（窗外看截圖）', not bad, json.dumps(bad[:6], ensure_ascii=False))
        run.check('沒有 JS 例外', not allerrs, json.dumps(allerrs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
