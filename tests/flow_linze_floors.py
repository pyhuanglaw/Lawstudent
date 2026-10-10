"""真實玩家流程：霖澤館多樓層示範區（v9.4 第一階段，D36；使用者的最高驗收標準）
「玩家能從台大校園走進霖澤館，穿過大廳，自己走上樓梯到二樓，進入教室、坐在座位上，最後再正常走出建築。整個過程不能靠測試專用瞬移完成。」

不用 ?turbo、不瞬移；手機模擬（iPhone 橫向、is_mobile、CDP 觸控）。玩家的操作只用：點地面（遊戲的自動找路）、搖桿、點互動按鈕、點選項。
  [前置／捷徑] 只有一個：讀檔到星期六 10:00、法學院廣場（霖澤館前）。之後全部是玩家操作：
  1. 廣場 → 前台階 → 穿堂（高度 0.9 m）→ 穿過建築到後面的小廣場 → 走回穿堂
  2. 點「進入霖澤館」→ 一樓大廳
  3. 走到樓梯 → 自己走上樓梯（中間平台 2.18 m）→ 二樓迴廊（第 1 層、4.2 m）
  4. 走到 201 教室門口 → 進去（階梯教室最上面那一排的走道，1.8 m）
  5. 走到第 2 排第 5 個座位 →「坐下」→ 坐在座位上（高度＝那一排的平台）→「坐一下」→ 起身（站回同一排的走道）
  6. 走到「離開教室」→ 回到二樓迴廊
  7. 存到欄位 3（在二樓）→ 重新整理 → 讀取欄位 3 → 還在二樓（第 1 層、4.2 m）、走得動
  8. 搭電梯：按「搭電梯」→ 門開 → 走進車廂 → 選「1F 大廳」→ 車廂往下 → 門開 → 走出來（第 0 層、地面）
  9. 走到「走出霖澤館」→ 回到校園的穿堂 → 走下前台階到廣場（高度 0）
  10. NPC 上下樓：大廳裡走樓梯的路人，60 秒內有上到二樓或下到一樓（高度變化 ≥ 2 m）
  11. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）、沒有 JS 例外
用法：python3 tests/flow_linze_floors.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_linze_floors'


async def press(pg, cdp, run, label, wait_zone=None, timeout=60):
    s = await L.state(pg)
    if not s['interact'].startswith(label):
        run.note(f'互動按鈕是「{s["interact"]}」，不是「{label}」'); return False
    await L.tap(pg, cdp, '#interact')
    if wait_zone:
        t0 = time.time()
        while time.time() - t0 < timeout:
            s = await L.state(pg)
            if s['zone'] == wait_zone and not s['busy']: return True
            await pg.wait_for_timeout(700)
        return False
    return True


async def main():
    run = L.Run('flow_linze_floors', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：星期六 10:00（第 8 天）、法學院廣場（霖澤館前 (34,-94)）、晴天')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 34, 'z': -94, 'yaw': 3.14},
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}})
        await pg.wait_for_timeout(3000)
        await run.shot(pg, 'plaza')
        # 1. 穿堂
        ok = await L.go_to(pg, cdp, run, 34, -110, 1.2, '穿堂中間')
        s = await L.state(pg); await run.shot(pg, 'passage')
        run.check('走上前台階、進到穿堂（高度 0.9 m）', ok and abs(s['y'] - 0.9) < 0.1, json.dumps(s, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, 34, -125.6, 1.2, '後面的小廣場')
        s = await L.state(pg); await run.shot(pg, 'behind_passage')
        run.check('穿過建築：走下後台階到後面的小廣場（高度 0）', ok and abs(s['y']) < 0.1, json.dumps(s, ensure_ascii=False))
        door = await L.find_it(pg, '進入霖澤館')
        ok = await L.go_to(pg, cdp, run, door['x'] + 0.4, door['z'], 1.0, '穿堂西側的大廳門口')
        run.check('走回穿堂，到大廳門口（出現「進入霖澤館」）', ok and (await L.state(pg))['interact'].startswith('進入霖澤館'))
        # 2. 進大廳
        run.check('點「進入霖澤館」→ 一樓大廳', await press(pg, cdp, run, '進入霖澤館', 'linze'))
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, 'lobby')
        run.check('在大廳：第 0 層、地面高度', s['zone'] == 'linze' and s['lv'] == 0 and abs(s['y']) < 0.05, json.dumps(s, ensure_ascii=False))
        # 3. 走樓梯上二樓
        ok = await L.go_to(pg, cdp, run, -6.6, 5.7, 0.9, '樓梯下面', lv=0)
        run.check('走到樓梯下面', ok)
        ys = []
        async def watch_y():
            for i in range(400):
                st = await L.state(pg); ys.append((st['y'], st['lv'], st['z']))
                if st['lv'] == 1 and st['y'] > 4.1: return
                await pg.wait_for_timeout(500)
        wt = asyncio.ensure_future(watch_y())
        ok = await L.go_to(pg, cdp, run, -6.6, -4.4, 0.9, '樓梯頂（二樓迴廊）', lv=1)
        await asyncio.sleep(1.0); wt.cancel()
        s = await L.state(pg); await run.shot(pg, 'gallery_2f')
        mids = [y for (y, lv, z) in ys if 1.0 < y < 3.5]
        run.check('自己走上樓梯：經過樓梯中段（高度 1–3.5 m 之間的位置）、到二樓（第 1 層、4.2 m）', ok and s['lv'] == 1 and abs(s['y'] - 4.2) < 0.1 and len(mids) >= 2,
                  f'中段 {len(mids)} 個取樣 ' + json.dumps(s, ensure_ascii=False))
        # 4. 201 教室
        c201 = await L.find_it(pg, '進入 201')
        ok = await L.go_to(pg, cdp, run, c201['x'], c201['z'] + 0.3, 0.9, '201 教室門口', lv=1)
        run.check('走到 201 教室門口（出現「進入 201 階梯教室」）', ok and (await L.state(pg))['interact'].startswith('進入 201'))
        run.check('進入 201 階梯教室', await press(pg, cdp, run, '進入 201', 'classroom'))
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, 'classroom_top')
        run.check('在階梯教室最上面那一排的走道（1.8 m）', s['zone'] == 'classroom' and abs(s['y'] - 1.8) < 0.1, json.dumps(s, ensure_ascii=False))
        # 5. 坐下、起身
        seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(s=>s.row===2&&s.col===5); return {x:s.x,z:s.z,y:s.y}; })()")
        ok = await L.go_to(pg, cdp, run, seat['x'], seat['z'] + 0.6, 0.55, '第 2 排第 5 個座位後面')
        s = await L.state(pg)
        run.check('走到第 2 排第 5 個座位旁（出現「坐下」）', ok and s['interact'].startswith('坐下'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact')
        t0 = time.time()
        while time.time() - t0 < 60:
            s = await L.state(pg)
            if s['choices']: break
            await pg.wait_for_timeout(600)
        s = await L.state(pg); pose = await pg.evaluate("GAME.E.player.pose"); await run.shot(pg, 'seated')
        run.check('坐在座位上（姿勢 sit、高度＝第 2 排平台 0.9 m）', pose == 'sit' and abs(s['y'] - seat['y']) < 0.05 and math.hypot(s['x'] - seat['x'], s['z'] - seat['z']) < 0.1, f'pose={pose} ' + json.dumps(s, ensure_ascii=False))
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['choices'] and not q['dlg'], max_steps=40, pick=0)
        pose = await pg.evaluate("GAME.E.player.pose")
        run.check('「坐一下」之後起身，站回同一排的走道（高度不變、站得住）', pose != 'sit' and abs(s['y'] - seat['y']) < 0.1 and s['stand'], f'pose={pose} ' + json.dumps(s, ensure_ascii=False))
        # 6. 離開教室
        ex = await L.find_it(pg, '離開教室')
        ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'] - 0.3, 0.9, '教室後門')
        run.check('走到「離開教室」', ok and (await L.state(pg))['interact'].startswith('離開教室'))
        run.check('離開教室 → 二樓迴廊', await press(pg, cdp, run, '離開教室', 'linze'))
        await pg.wait_for_timeout(2000); s = await L.state(pg)
        run.check('回到二樓迴廊（第 1 層、4.2 m）', s['zone'] == 'linze' and s['lv'] == 1 and abs(s['y'] - 4.2) < 0.1, json.dumps(s, ensure_ascii=False))
        # 7. 在二樓存檔 → 重新整理 → 讀檔
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔'); const e=b[b.length-1]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        saved = await pg.evaluate("(()=>{ for(const k of ['fatiao3d_slot_3','fatiao3d_slot_2','fatiao3d_slot_1']){ const t=localStorage.getItem(k); if(t){ const s=JSON.parse(t); if(s.zone==='linze') return {k,pos:s.pos}; } } return null; })()")
        run.check('在二樓存檔：存檔記錄建築（linze）、樓層（lv=1）、位置與高度', bool(saved) and saved['pos'].get('lv') == 1 and abs(saved['pos'].get('y', 0) - 4.2) < 0.1, json.dumps(saved, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnClose') if await L.center_of(pg, '#btnClose') else None
        await pg.reload(); run.check('重新整理', await L.wait_loaded(pg))
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(k=>{ const n=k.replace('fatiao3d_slot_',''); const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 '+n)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(saved['k'] if saved else 'fatiao3d_slot_3'))
        if c: await L.touch_tap(cdp, c[0], c[1])
        await pg.wait_for_timeout(4000); s = await L.state(pg)
        run.check('讀檔：回到霖澤館二樓（第 1 層、4.2 m）', s['zone'] == 'linze' and s['lv'] == 1 and abs(s['y'] - 4.2) < 0.1, json.dumps(s, ensure_ascii=False))
        # 8. 電梯
        call = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.elevator&&i.lv===GAME.E.player.lv); return it?{x:it.x,z:it.z}:null; })()")
        ok = await L.go_to(pg, cdp, run, call['x'], call['z'], 0.6, '電梯按鈕（二樓）', lv=1)
        run.check('走到二樓的電梯門口（出現「搭電梯」）', ok and (await L.state(pg))['interact'].startswith('搭電梯'))
        await L.tap(pg, cdp, '#interact')
        t0 = time.time(); seen = {'inside': False, 'moving': False}
        while time.time() - t0 < 120:
            s = await L.state(pg)
            if s['choices']:
                await run.shot(pg, 'elevator_choices')
                c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith('1F')); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                if c: await L.touch_tap(cdp, c[0], c[1]); seen['inside'] = True
            elif seen['inside'] and 0.3 < s['y'] < 3.9: seen['moving'] = True
            elif seen['inside'] and not s['busy'] and s['lv'] == 0: break
            await pg.wait_for_timeout(400)
        s = await L.state(pg); await run.shot(pg, 'after_elevator')
        run.check('搭電梯：選「1F 大廳」→ 看得到車廂往下（經過中間的高度）→ 到一樓（第 0 層、地面）、走出車廂', seen['inside'] and seen['moving'] and s['lv'] == 0 and abs(s['y']) < 0.05 and not s['busy'], json.dumps(dict(s, **seen), ensure_ascii=False))
        # 10. NPC 上下樓（大廳裡走樓梯的路人）
        npc_y = await pg.evaluate("GAME.E.npcs.filter(n=>n.isExtra&&n.beh==='route').map(n=>n.obj.position.y)")
        t0 = time.time(); spans = [[y, y] for y in npc_y]
        while time.time() - t0 < 60 and npc_y:
            await pg.wait_for_timeout(2000)
            cur = await pg.evaluate("GAME.E.npcs.filter(n=>n.isExtra&&n.beh==='route').map(n=>n.obj.position.y)")
            for i, y in enumerate(cur[:len(spans)]): spans[i][0] = min(spans[i][0], y); spans[i][1] = max(spans[i][1], y)
            if any(b2 - a2 >= 2.0 for a2, b2 in spans): break
        run.check('NPC 走樓梯上下樓（60 秒內高度變化 ≥ 2 m）', any(b2 - a2 >= 2.0 for a2, b2 in spans), json.dumps(spans))
        # 9. 走出建築
        ex = await L.find_it(pg, '走出霖澤館')
        ok = await L.go_to(pg, cdp, run, ex['x'] - 0.3, ex['z'], 0.9, '大廳出口', lv=0)
        run.check('走到「走出霖澤館」', ok and (await L.state(pg))['interact'].startswith('走出霖澤館'))
        run.check('走出霖澤館 → 校園（穿堂）', await press(pg, cdp, run, '走出霖澤館', 'campus'))
        await pg.wait_for_timeout(2000); s = await L.state(pg)
        run.check('回到校園的穿堂（高度 0.9 m）', s['zone'] == 'campus' and abs(s['y'] - 0.9) < 0.1, json.dumps(s, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, 34, -94, 1.5, '法學院廣場')
        s = await L.state(pg); await run.shot(pg, 'back_to_plaza')
        run.check('走下前台階回到廣場（高度 0）', ok and abs(s['y']) < 0.05, json.dumps(s, ensure_ascii=False))
        run.check('劇情自動走路沒有用到「卡住後放到目的地」的保險', s['fallbacks'] == 0, f"fallbacks={s['fallbacks']}")
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
