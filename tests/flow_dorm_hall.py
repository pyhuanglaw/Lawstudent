"""真實玩家流程：男生宿舍的走廊與樓梯（宿舍走廊，D44；使用者需求 21 第 3 點：「宿舍可進入房間、走廊，並與床、書桌互動」）

不用 ?turbo、不瞬移；手機模擬（iPhone 橫向、is_mobile、CDP 觸控）。玩家的操作只用：搖桿、點地面（遊戲的自動找路）、點互動按鈕、點對話與選項、選單。
  [前置／捷徑] 只有一個：讀檔到星期六 8:30（第 8 天）、宿舍房間裡（房門內側）。之後全部是玩家操作：
  1. 房間的「走出房間」→ 二樓走廊、自己的房門前（第 1 層、3.6 m）；不會一出來就跳出「回房間」
  2. 二樓走廊：看一扇關著的寢室門（看得懂的說明）
  3. 走樓梯下一樓（B 跑 → 平台 1.8 m → A 跑）→ 走廊 → 門廳；看舍監室窗口、信箱
  4. 「離開宿舍」→ 回到校園：宿舍門廊前面
  5. 從校園「回宿舍」→ 宿舍門廳（第 0 層）
  6. 交誼廳：沙發坐下、站起來
  7. 走樓梯上二樓 → 自己的房門 →「回房間（203）」→ 房間裡（原本的出生點）；書桌「坐在書桌前」照舊出現
  8. 再走出房間，在二樓走廊存檔 → 重新整理 → 讀取 → 還在宿舍二樓走廊（第 1 層、3.6 m）、走得動
  9. 背景路人走樓梯上下樓（高度變化 ≥ 1.5 m）
  10. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）、沒有 JS 例外
這是 Playwright 手機模擬，不是 iPhone 實機。
用法：python3 tests/flow_dorm_hall.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_dorm_hall'
Y1 = 3.6
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}


async def press(pg, cdp, run, label, wait_zone=None, timeout=60):
    s = await L.state(pg)
    if not s['interact'].startswith(label):
        run.note(f'互動按鈕是「{s["interact"]}」，不是「{label}」'); return False
    await L.tap(pg, cdp, '#interact')
    if wait_zone:
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: q['zone'] == wait_zone and not q['busy'] and not q['dlg'], max_steps=int(timeout))
        return s['zone'] == wait_zone and not s['busy']
    return True


async def caption(pg):
    return await pg.evaluate("(()=>{ const e=document.getElementById('caption'); return e&&!e.classList.contains('hide')?e.textContent:''; })()")


async def look(pg, cdp, run, label):
    """走到後按互動、讀說明（look 類的互動點）"""
    s = await L.state(pg)
    if not s['interact'].startswith(label): return ''
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); cap = await caption(pg)
    await pg.wait_for_timeout(3500); return cap


async def main():
    run = L.Run('flow_dorm_hall', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：星期六 8:30（第 8 天）、宿舍房間裡（房門內側 (0,2.4)）、晴天')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 8.5, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.1416}, 'flags': FLAGS})
        await pg.wait_for_timeout(3000)
        # 1. 走出房間 → 二樓走廊
        out = await L.find_it(pg, '走出房間')
        ok = bool(out) and await L.go_to(pg, cdp, run, out['x'], out['z'] - 0.3, 0.6, '房門')
        run.check('房間的門口出現「走出房間」', ok and (await L.state(pg))['interact'].startswith('走出房間'))
        run.check('「走出房間」→ 宿舍走廊', await press(pg, cdp, run, '走出房間', 'dorm_hall'))
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, 'corridor_2f')
        run.check('站在二樓走廊、自己的房門前（第 1 層、3.6 m）、站得住；不會一出來就跳出「回房間」', s['zone'] == 'dorm_hall' and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and s['stand'] and not s['interact'].startswith('回房間'), json.dumps(s, ensure_ascii=False))
        # 2. 二樓走廊：關著的寢室門
        d = await L.find_it(pg, '204 寢室')
        ok = bool(d) and await L.go_to(pg, cdp, run, d['x'], d['z'], 0.6, '204 寢室門口', lv=1)
        cap = await look(pg, cdp, run, '204 寢室') if ok else ''
        run.check('走到 204 寢室門口（二樓走廊）、門關著有說明', ok and '204' in cap, f'「{cap[:60]}」')
        # 3. 樓梯下一樓 → 門廳
        ys = []
        async def watch_y(stop):
            for i in range(900):
                st = await L.state(pg); ys.append((st['y'], st['lv'], st['x'], st['z']))
                if stop(st): return
                await pg.wait_for_timeout(500)
        win = await L.find_it(pg, '舍監室窗口')
        wt = asyncio.ensure_future(watch_y(lambda st: st['lv'] == 0 and abs(st['y']) < 0.05 and st['z'] > 1.6))
        ok = bool(win) and await L.go_to(pg, cdp, run, win['x'], win['z'], 0.7, '門廳的舍監室窗口（走樓梯下來）', lv=0)
        await asyncio.sleep(1.0); wt.cancel()
        s = await L.state(pg); await run.shot(pg, 'lobby')
        land = [y for (y, lv, x, z) in ys if abs(y - 1.8) < 0.05 and z < -4.6]
        run.check('從二樓走樓梯下一樓（經過平台 1.8 m）、走到門廳（第 0 層、地面）', ok and s['lv'] == 0 and abs(s['y']) < 0.05 and len(land) >= 1, f'平台取樣 {len(land)}；' + json.dumps(s, ensure_ascii=False))
        cap = await look(pg, cdp, run, '舍監室窗口')
        run.check('舍監室窗口：看得懂的說明（門禁）', '門禁' in cap, f'「{cap[:60]}」')
        mb = await L.find_it(pg, '看信箱')
        ok = bool(mb) and await L.go_to(pg, cdp, run, mb['x'], mb['z'], 0.6, '信箱', lv=0)
        cap = await look(pg, cdp, run, '看信箱') if ok else ''
        run.check('信箱：走得到、有說明', ok and '信箱' in cap, f'「{cap[:60]}」')
        # 4. 離開宿舍 → 校園
        ex = await L.find_it(pg, '離開宿舍')
        ok = bool(ex) and await L.go_to(pg, cdp, run, ex['x'], ex['z'] - 0.4, 0.6, '大門', lv=0)
        run.check('走到大門、出現「離開宿舍」', ok and (await L.state(pg))['interact'].startswith('離開宿舍'))
        run.check('「離開宿舍」→ 校園', await press(pg, cdp, run, '離開宿舍', 'campus'))
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, 'campus_out')
        run.check('回到校園：宿舍門廊前面 (20,54)、站得住', s['zone'] == 'campus' and s['stand'] and abs(s['x'] - 20) < 0.8 and abs(s['z'] - 54) < 0.8, json.dumps(s, ensure_ascii=False))
        # 5. 回宿舍 → 門廳
        dr = await L.find_it(pg, '回宿舍')
        ok = bool(dr) and await L.go_to(pg, cdp, run, dr['x'], dr['z'] - 1.2, 1.2, '宿舍門口')
        run.check('「回宿舍」→ 宿舍門廳', ok and await press(pg, cdp, run, '回宿舍', 'dorm_hall'))
        await pg.wait_for_timeout(2500); s = await L.state(pg)
        run.check('在宿舍門廳（第 0 層、地面）、站得住；不會一進來就跳出「離開宿舍」', s['zone'] == 'dorm_hall' and s['lv'] == 0 and abs(s['y']) < 0.05 and s['stand'] and not s['interact'].startswith('離開宿舍'), json.dumps(s, ensure_ascii=False))
        # 6. 交誼廳：沙發坐下、站起來
        sofa = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.label==='坐在沙發上'); return it?{x:it.x,z:it.z}:null; })()")
        ok = bool(sofa) and await L.go_to(pg, cdp, run, sofa['x'], sofa['z'], 0.5, '交誼廳的沙發', lv=0)
        run.check('走到交誼廳的沙發（出現「坐在沙發上」）', ok and (await L.state(pg))['interact'].startswith('坐在沙發上'))
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = None
        while time.time() - t0 < 40:
            s = await L.state(pg)
            if s['pose'] == 'sit': sat = s; break
            if s['choices']: await L.advance_dialogs(pg, cdp, run, until=lambda q: q['pose'] == 'sit' or not q['choices'], max_steps=4)
            await pg.wait_for_timeout(500)
        await run.shot(pg, 'lounge_sofa')
        run.check('坐在交誼廳的沙發上（坐姿）', bool(sat), json.dumps(sat, ensure_ascii=False))
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=30)
        if s['pose'] == 'sit':
            await L.joystick(pg, cdp, 0, 40, 900); await pg.wait_for_timeout(1500)
        s = await L.state(pg)
        run.check('站起來、站得住（還在一樓）', s['pose'] != 'sit' and s['stand'] and s['lv'] == 0, json.dumps(s, ensure_ascii=False))
        # 7. 樓梯上二樓 → 回房間
        hm = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='dorm'); return it?{x:it.x,z:it.z,label:it.label}:null; })()")
        ys.clear()
        wt = asyncio.ensure_future(watch_y(lambda st: st['lv'] == 1 and abs(st['y'] - Y1) < 0.05 and st['x'] > 3.0))
        ok = bool(hm) and await L.go_to(pg, cdp, run, hm['x'], hm['z'] + 0.3, 0.5, '自己的房門（走樓梯上二樓）', lv=1)
        await asyncio.sleep(1.0); wt.cancel()
        s = await L.state(pg); land = [y for (y, lv, x, z) in ys if abs(y - 1.8) < 0.05 and z < -4.6]
        run.check('走樓梯上二樓（經過平台 1.8 m）、走到自己的房門（第 1 層、3.6 m、出現「回房間」）', ok and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and len(land) >= 1 and s['interact'].startswith('回房間'), f'平台取樣 {len(land)}；' + json.dumps(s, ensure_ascii=False))
        run.check('「回房間（203）」→ 房間', await press(pg, cdp, run, '回房間', 'dorm'))
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, 'room')
        desk = await L.find_it(pg, '坐在書桌前')
        run.check('回到房間：房門內側 (0,2.4)、站得住；書桌「坐在書桌前」還在', s['zone'] == 'dorm' and s['stand'] and abs(s['x']) < 0.6 and abs(s['z'] - 2.4) < 0.6 and bool(desk), json.dumps(s, ensure_ascii=False))
        # 8. 再出房間 → 二樓走廊存檔 → 重新整理 → 讀取
        out = await L.find_it(pg, '走出房間')
        ok = bool(out) and await L.go_to(pg, cdp, run, out['x'], out['z'] - 0.3, 0.6, '房門')
        run.check('再走出房間 → 二樓走廊', ok and await press(pg, cdp, run, '走出房間', 'dorm_hall'))
        await pg.wait_for_timeout(2500)
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔'); const e=b[b.length-1]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        saved = await pg.evaluate("(()=>{ for(const k of ['fatiao3d_slot_3','fatiao3d_slot_2','fatiao3d_slot_1']){ const t=localStorage.getItem(k); if(t){ const s=JSON.parse(t); if(s.zone==='dorm_hall'&&s.pos&&s.pos.lv===1) return {k,pos:s.pos}; } } return null; })()")
        run.check('在宿舍二樓走廊存檔：存檔記錄區域、樓層（lv=1）、位置與高度', bool(saved) and abs(saved['pos'].get('y', 0) - Y1) < 0.1, json.dumps(saved, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnClose') if await L.center_of(pg, '#btnClose') else None
        await pg.reload(); run.check('重新整理', await L.wait_loaded(pg))
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(k=>{ const n=k.replace('fatiao3d_slot_',''); const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 '+n)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(saved['k'] if saved else 'fatiao3d_slot_1'))
        if c: await L.touch_tap(cdp, c[0], c[1])
        await pg.wait_for_timeout(4000); s = await L.state(pg); await run.shot(pg, 'after_load_2f')
        run.check('讀檔：回到宿舍二樓走廊（第 1 層、3.6 m）', s['zone'] == 'dorm_hall' and s['lv'] == 1 and abs(s['y'] - Y1) < 0.1, json.dumps(s, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, -9.0, 0.0, 0.8, '二樓走廊西端', lv=1)
        s = await L.state(pg)
        run.check('讀檔之後走得動（走到二樓走廊西端，還在二樓）', ok and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05, json.dumps(s, ensure_ascii=False))
        # 9. 路人跨樓層
        t0 = time.time(); npc_y = await pg.evaluate("GAME.E.npcs.filter(n=>n.isExtra&&n.beh==='route').map(n=>n.obj.position.y)"); spans = [[y, y] for y in npc_y]
        while time.time() - t0 < 240 and npc_y:
            await pg.wait_for_timeout(2000)
            cur = await pg.evaluate("GAME.E.npcs.filter(n=>n.isExtra&&n.beh==='route').map(n=>n.obj.position.y)")
            for i, y in enumerate(cur[:len(spans)]): spans[i][0] = min(spans[i][0], y); spans[i][1] = max(spans[i][1], y)
            if any(b2 - a2 >= 1.5 for a2, b2 in spans): break
        run.check('路人走樓梯上下樓（240 秒內高度變化 ≥ 1.5 m）', any(b2 - a2 >= 1.5 for a2, b2 in spans), json.dumps(spans) + '  %.0f 秒' % (time.time() - t0))
        # 10.
        s = await L.state(pg)
        run.check('劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', s['fallbacks'] == 0, str(s['fallbacks']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
