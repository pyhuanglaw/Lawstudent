"""真實玩家流程：萬才館室內兩層樓（萬才館第三階段，D42；使用者需求 21：「將相同系統擴展到萬才館、總圖與主要建築，實作電梯和其他樓層」）

不用 ?turbo、不瞬移；手機模擬（iPhone 橫向、is_mobile、CDP 觸控）。玩家的操作只用：搖桿、點地面（遊戲的自動找路）、點互動按鈕、點對話與選項、選單。
  [前置／捷徑] 只有一個：讀檔到星期六 10:00、萬才館大樓梯頂端的平台（校園第 1 層、3.63 m，二樓入口前面）。之後全部是玩家操作：
  1. 走到二樓入口 →「進入萬才館（二樓）」→ 萬才館二樓的門廳（第 1 層、4.2 m）；不會一進來就跳出「走出去」
  2. 沿著西側迴廊走到北側走廊、研討室 A 的門 →（6ac74b063 起）門可以進去，不按；以前是按下去是看得懂的說明（v9.7 起照 AA 2026-10-13 P2：社課的時間＋「今天沒有社課」、研討室的說明＋「今天沒有你在這裡的課」；以前是「門鎖著」）
  3. 搭電梯：二樓電梯門口「搭電梯」→ 選「3F–9F 研究室」按不亮（要刷識別證）→ 選「1F 大廳」→ 看得到車廂往下 → 到一樓（第 0 層、地面）
  4. 一樓大廳（v9.3 的大廳）：路人走樓梯上下樓（高度變化 ≥ 2 m）；坐在沙發上（「坐一下，看看四周」）→ 自己站起來
  5. 走樓梯上二樓（點地面／搖桿：經過樓梯中段 1–3 m）→ 二樓門廳
  6. 在二樓存檔（欄位 3）→ 重新整理 → 讀取 → 還在萬才館二樓（第 1 層、4.2 m）、走得動
  7. 走樓梯下一樓 →「離開萬才館」→ 回到校園：陽台下的一樓入口前面（地面）
  8. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）、沒有 JS 例外
這是 Playwright 手機模擬，不是 iPhone 實機。
用法：python3 tests/flow_wancai_floors.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_wancai_floors'
Y1 = 4.2
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


async def tap_choice(pg, cdp, prefix):
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(prefix))
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


async def main():
    run = L.Run('flow_wancai_floors', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：星期六 10:00（第 8 天）、萬才館大樓梯頂端的平台 (87,-99.6)（校園第 1 層、3.63 m，面向二樓入口）、晴天')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 87, 'z': -99.6, 'yaw': 3.1416, 'lv': 1, 'y': 3.63}, 'flags': FLAGS}, quiet_phone=True)
        await pg.wait_for_timeout(3000)
        s = await L.state(pg); await run.shot(pg, 'platform')
        run.check('在平台上（校園第 1 層、3.63 m）', s['zone'] == 'campus' and s['lv'] == 1 and abs(s['y'] - 3.63) < 0.05, json.dumps(s, ensure_ascii=False))
        # 1. 二樓入口
        d2 = await L.find_it(pg, '進入法律系館B（二樓）')
        run.check('平台上有「進入法律系館B（二樓）」', bool(d2) and d2['lv'] == 1, json.dumps(d2, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, d2['x'], d2['z'] + 0.4, 0.8, '二樓入口', lv=1)
        run.check('進入法律系館B（二樓）→ 室內二樓', ok and await press(pg, cdp, run, '進入法律系館B（二樓）', 'wancai'))
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, 'foyer_2f')
        run.check('在法律系館B二樓的門廳（第 1 層、4.2 m）、站得住；不會一進來就跳出「走出去」', s['zone'] == 'wancai' and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and s['stand'] and not s['interact'].startswith('走出去'),
                  json.dumps(s, ensure_ascii=False))
        # 2. 迴廊 → 北側走廊 → 研討室 A
        da = await L.find_it(pg, '進入 研討室 A') or await L.find_it(pg, '研討室 A')   # 6ac74b063 起門的字是「進入 研討室 A」
        ok = await L.go_to(pg, cdp, run, da['x'], da['z'] + 0.3, 0.8, '研討室 A 的門', lv=1)
        s = await L.state(pg); await run.shot(pg, 'corridor_2f')
        run.check('沿著西側迴廊走到北側走廊、研討室 A 的門（還在二樓）', ok and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and '研討室 A' in (s['interact'] or ''), json.dumps(s, ensure_ascii=False))
        # 6ac74b063 起研討室 A 走得進去：門口是「進入 研討室 A」（按了就進房間，不再有門鎖的說明）。這裡只檢查門可以進去、不按——按了人就在房間裡，第 3 步找不到二樓的電梯（BB-B 10-24）
        door = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>(i.label||'').startsWith('進入 研討室 A')); return it?{label:it.label,to:it.exit&&it.exit.to||null}:null; })()")
        run.check('研討室 A 的門可以進去（「進入 研討室 A」，有通往房間的出口）', bool(door) and bool(door.get('to')), json.dumps(door, ensure_ascii=False))
        # 3. 電梯：二樓 → 一樓（先按一次不開放的樓層）
        call = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.elevator&&i.lv===GAME.E.player.lv); return it?{x:it.x,z:it.z}:null; })()")
        ok = await L.go_to(pg, cdp, run, call['x'], call['z'], 0.6, '電梯按鈕（二樓）', lv=1)
        run.check('走到二樓的電梯門口（出現「搭電梯」）', ok and (await L.state(pg))['interact'].startswith('搭電梯'))
        await L.tap(pg, cdp, '#interact')
        t0 = time.time(); seen = {'inside': False, 'moving': False, 'locked': False, 'lockedToast': ''}
        while time.time() - t0 < 150:
            s = await L.state(pg)
            if s['choices']:
                if not seen['locked']:
                    await run.shot(pg, 'elevator_choices')
                    if await tap_choice(pg, cdp, '3F'):
                        seen['locked'] = True; await pg.wait_for_timeout(700)
                        seen['lockedToast'] = await pg.evaluate("(()=>{ const t=document.getElementById('toast'); return t?t.textContent:''; })()")
                        continue
                if await tap_choice(pg, cdp, '1F'): seen['inside'] = True
            elif seen['inside'] and 0.3 < s['y'] < 3.9: seen['moving'] = True
            elif seen['inside'] and not s['busy'] and s['lv'] == 0: break
            await pg.wait_for_timeout(400)
        s = await L.state(pg); await run.shot(pg, 'after_elevator')
        run.check('電梯：選「3F–9F 研究室」按不亮（說明要刷識別證），還在選單裡', seen['locked'] and '識別證' in seen['lockedToast'], seen['lockedToast'])
        run.check('電梯：選「1F 大廳」→ 看得到車廂往下（經過中間的高度）→ 到一樓（第 0 層、地面）、走出車廂', seen['inside'] and seen['moving'] and s['lv'] == 0 and abs(s['y']) < 0.05 and not s['busy'], json.dumps(dict(s, **seen), ensure_ascii=False))
        # 3b. 路人跨樓層（背景路人照路線走樓梯上下樓；觀察最多 150 秒，高度變化 ≥ 2 m 就提早結束；和霖澤館同一個標準）
        t0 = time.time(); npc_y = await pg.evaluate("GAME.E.npcs.filter(n=>n.isExtra&&n.beh==='route').map(n=>n.obj.position.y)"); spans = [[y, y] for y in npc_y]
        while time.time() - t0 < 150 and npc_y:
            await pg.wait_for_timeout(2000)
            cur = await pg.evaluate("GAME.E.npcs.filter(n=>n.isExtra&&n.beh==='route').map(n=>n.obj.position.y)")
            for i, y in enumerate(cur[:len(spans)]): spans[i][0] = min(spans[i][0], y); spans[i][1] = max(spans[i][1], y)
            if any(b2 - a2 >= 2.0 for a2, b2 in spans): break
        run.check('路人走樓梯上下樓（150 秒內高度變化 ≥ 2 m）', any(b2 - a2 >= 2.0 for a2, b2 in spans), json.dumps(spans) + '  %.0f 秒' % (time.time() - t0))
        # 4. 一樓大廳：坐沙發 → 站起來
        sofa = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.seat&&i.label==='坐在沙發上'&&i.seat.x>0); return it?{x:it.x,z:it.z}:null; })()")
        ok = await L.go_to(pg, cdp, run, sofa['x'], sofa['z'], 0.6, '沙發（東邊那張）', lv=0)
        run.check('走到一樓大廳的沙發（出現「坐在沙發上」）', ok and (await L.state(pg))['interact'].startswith('坐在沙發上'))
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = None
        while time.time() - t0 < 60:
            s = await L.state(pg)
            if s['choices']: sat = s; break
            await pg.wait_for_timeout(500)
        await run.shot(pg, 'sofa')
        run.check('走過去坐在沙發上（坐姿，出現「坐一下，看看四周」）', bool(sat) and sat['pose'] == 'sit', json.dumps(sat, ensure_ascii=False))
        await tap_choice(pg, cdp, '坐一下')
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=40)
        await pg.wait_for_timeout(1500); s = await L.state(pg)
        run.check('坐一下之後站起來、站得住（一樓地面）', s['pose'] != 'sit' and s['stand'] and s['lv'] == 0 and abs(s['y']) < 0.05, json.dumps(s, ensure_ascii=False))
        # 5. 走樓梯上二樓
        foyer = await pg.evaluate("WANCAI_LAYOUT.upperDoor.spawn")
        ys = []
        async def watch_y(stop):
            for i in range(900):
                st = await L.state(pg); ys.append((st['y'], st['lv'], st['z']))
                if stop(st): return
                await pg.wait_for_timeout(500)
        wt = asyncio.ensure_future(watch_y(lambda st: st['lv'] == 1 and abs(st['y'] - Y1) < 0.05 and st['z'] > 4.5))
        ok = await L.go_to(pg, cdp, run, foyer['x'], foyer['z'], 0.8, '二樓門廳（走樓梯）', lv=1)
        await asyncio.sleep(1.0); wt.cancel()
        s = await L.state(pg); await run.shot(pg, 'up_stairs')
        mids = [y for (y, lv, z) in ys if 1.0 < y < 3.0]
        run.check('從一樓大廳走樓梯上二樓：經過樓梯中段（1–3 m）、到二樓門廳（第 1 層、4.2 m）', ok and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and len(mids) >= 1, f'中段取樣 {len(mids)} 個；' + json.dumps(s, ensure_ascii=False))
        # 6. 在二樓存檔 → 重新整理 → 讀檔
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔'); const e=b[b.length-1]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        saved = await pg.evaluate("(()=>{ for(const k of ['fatiao3d_slot_3','fatiao3d_slot_2','fatiao3d_slot_1']){ const t=localStorage.getItem(k); if(t){ const s=JSON.parse(t); if(s.zone==='wancai'&&s.pos&&s.pos.lv===1) return {k,pos:s.pos}; } } return null; })()")
        run.check('在法律系館B二樓存檔：存檔記錄區域、樓層（lv=1）、位置與高度', bool(saved) and abs(saved['pos'].get('y', 0) - Y1) < 0.1, json.dumps(saved, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnClose') if await L.center_of(pg, '#btnClose') else None
        await pg.reload(); run.check('重新整理', await L.wait_loaded(pg))
        await L.no_phone_auto(pg)   # [前置] 讀進來的存檔有要回的訊息：手機自己打開會擋住搖桿（D103）
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(k=>{ const n=k.replace('fatiao3d_slot_',''); const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 '+n)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(saved['k'] if saved else 'fatiao3d_slot_3'))
        if c: await L.touch_tap(cdp, c[0], c[1])
        await pg.wait_for_timeout(4000); s = await L.state(pg); await run.shot(pg, 'after_load_2f')
        run.check('讀檔：回到法律系館B二樓（第 1 層、4.2 m）', s['zone'] == 'wancai' and s['lv'] == 1 and abs(s['y'] - Y1) < 0.1, json.dumps(s, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, -6.0, 2.0, 0.7, '西側迴廊', lv=1)
        s = await L.state(pg)
        run.check('讀檔之後走得動（走到西側迴廊，還在二樓）', ok and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05, json.dumps(s, ensure_ascii=False))
        # 7. 走樓梯下一樓 → 離開萬才館
        ex = await L.find_it(pg, '離開法律系館B')
        ys.clear()
        wt = asyncio.ensure_future(watch_y(lambda st: st['lv'] == 0 and abs(st['y']) < 0.05 and st['z'] > 4.0))
        ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'] - 0.4, 0.9, '一樓出口（走樓梯下來）', lv=0)
        await asyncio.sleep(1.0); wt.cancel()
        s = await L.state(pg); mids = [y for (y, lv, z) in ys if 1.0 < y < 3.0]
        run.check('從二樓走樓梯下一樓、走到出口（經過樓梯中段、第 0 層、地面）', ok and s['lv'] == 0 and abs(s['y']) < 0.05 and len(mids) >= 1 and s['interact'].startswith('離開法律系館B'), f'中段取樣 {len(mids)} 個；' + json.dumps(s, ensure_ascii=False))
        run.check('離開法律系館B → 回到校園', await press(pg, cdp, run, '離開法律系館B', 'campus'))
        await pg.wait_for_timeout(2000); s = await L.state(pg); await run.shot(pg, 'out_1f')
        run.check('回到校園：陽台下的一樓入口前面、地面那一層、站得住', s['zone'] == 'campus' and s['lv'] == 0 and abs(s['y']) < 0.05 and s['stand'] and abs(s['x'] - 93.8) < 0.5 and abs(s['z'] + 98.4) < 0.5, json.dumps(s, ensure_ascii=False))
        # 8.
        run.check('劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', s['fallbacks'] == 0, str(s['fallbacks']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
