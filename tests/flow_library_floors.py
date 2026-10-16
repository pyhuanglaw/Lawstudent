"""真實玩家流程：總圖書館（總圖第一階段，D43；使用者需求 21：「將相同系統擴展到萬才館、總圖與主要建築，實作電梯和其他樓層」「圖書館可進入閱讀區、自習區」）

不用 ?turbo、不瞬移；手機模擬（iPhone 橫向、is_mobile、CDP 觸控）。玩家的操作只用：搖桿、點地面（遊戲的自動找路）、點互動按鈕、點對話與選項、選單。
  [前置／捷徑] 只有一個：讀檔到星期六 10:00、校園總圖門廊前面。之後全部是玩家操作：
  1. 「進入總圖書館」→ 總圖大廳一樓的門廳；走過入口閘門到大廳、看樓層簡介
  2. 走中央大樓梯（中間那一跑 → 平台 → 側邊那一跑）上二樓自習區（經過平台 2.5 m、到二樓 5.0 m）
  3. 自習區的長桌「坐下讀書」→ 坐姿 →「讀書（1 小時）」→ 站起來
  4. 二樓東側「樓梯間：往 3F 閱覽區」→ 閱覽室（現有的 library 區域，座位、劇情不變）
  5. 閱覽室東側的電梯：選「4F–6F 書庫」按不亮 → 選「1F 大廳、出口」→ 關門、車廂往下 → 換到總圖大廳、車廂在一樓、開門、走出來（第 0 層、地面）
  6. 搭大廳的電梯到二樓 → 在二樓存檔 → 重新整理 → 讀取 → 還在總圖大廳二樓（第 1 層、5.0 m）、走得動
  7. 背景路人走大樓梯上下樓（高度變化 ≥ 2 m）
  8. 走大樓梯下一樓 →「離開總圖」→ 回到校園：總圖門廊前面
  9. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）、沒有 JS 例外
這是 Playwright 手機模擬，不是 iPhone 實機。
用法：python3 tests/flow_library_floors.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_library_floors'
Y1 = 5.0
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


async def ride(pg, cdp, run, first_locked, target, until, label):
    """在車廂外按「搭電梯」之後：先選一個按不亮的樓層（看說明），再選目標樓層；等到 until(state) 成立。回傳 (seen, state)"""
    await L.tap(pg, cdp, '#interact')
    t0 = time.time(); seen = {'inside': False, 'locked': False, 'lockedToast': '', 'ys': []}
    while time.time() - t0 < 180:
        s = await L.state(pg); seen['ys'].append(round(s['y'], 2))
        if s['choices']:
            if first_locked and not seen['locked']:
                await run.shot(pg, label + '_choices')
                if await tap_choice(pg, cdp, first_locked):
                    seen['locked'] = True; await pg.wait_for_timeout(700)
                    seen['lockedToast'] = await pg.evaluate("(()=>{ const t=document.getElementById('toast'); return t?t.textContent:''; })()")
                    continue
            if await tap_choice(pg, cdp, target): seen['inside'] = True
        elif seen['inside'] and until(s) and not s['busy']: break
        await pg.wait_for_timeout(400)
    return seen, await L.state(pg)


async def main():
    run = L.Run('flow_library_floors', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：星期六 10:00（第 8 天）、校園總圖門廊前面 (82,0)、晴天')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 82, 'z': 0, 'yaw': 1.5708}, 'flags': FLAGS})
        await pg.wait_for_timeout(3000)
        # 1. 進入總圖 → 大廳
        door = await L.find_it(pg, '進入總圖書館')
        ok = await L.go_to(pg, cdp, run, door['x'] - 1.2, door['z'], 1.0, '總圖門口')
        run.check('「進入總圖書館」→ 總圖大廳', ok and await press(pg, cdp, run, '進入總圖書館', 'library_hall'))
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, 'vestibule')
        run.check('在總圖大廳一樓的門廳（第 0 層、地面）、站得住；不會一進來就跳出「離開總圖」', s['zone'] == 'library_hall' and s['lv'] == 0 and abs(s['y']) < 0.05 and s['stand'] and not s['interact'].startswith('離開總圖'), json.dumps(s, ensure_ascii=False))
        bd = await L.find_it(pg, '看樓層簡介')
        ok = await L.go_to(pg, cdp, run, bd['x'], bd['z'], 0.7, '樓層簡介（走過入口閘門）', lv=0)
        run.check('走過入口閘門、走到大樓梯前的樓層簡介', ok and (await L.state(pg))['interact'].startswith('看樓層簡介'))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); cap = await caption(pg); await run.shot(pg, 'board')
        run.check('樓層簡介：寫得出 3F 閱覽區怎麼去', '閱覽區' in cap and '樓梯間' in cap, f'「{cap[:80]}」')
        await pg.wait_for_timeout(5000)
        # 2. 大樓梯上二樓自習區
        ys = []
        async def watch_y(stop):
            for i in range(900):
                st = await L.state(pg); ys.append((st['y'], st['lv'], st['x'], st['z']))
                if stop(st): return
                await pg.wait_for_timeout(500)
        tgt = (-8.6, 1.4)
        wt = asyncio.ensure_future(watch_y(lambda st: st['lv'] == 1 and abs(st['y'] - Y1) < 0.05 and st['x'] < -6))
        ok = await L.go_to(pg, cdp, run, tgt[0], tgt[1], 0.8, '二樓自習區（走大樓梯）', lv=1)
        await asyncio.sleep(1.0); wt.cancel()
        s = await L.state(pg); await run.shot(pg, 'study_2f')
        land = [y for (y, lv, x, z) in ys if abs(y - 2.5) < 0.05 and z < -4.6]; mids = [y for (y, lv, x, z) in ys if 3.0 < y < 4.8 and abs(x) > 1.7]
        run.check('走大樓梯上二樓：經過平台（2.5 m）、側邊那一跑（3–4.8 m）、到二樓自習區（第 1 層、5.0 m）', ok and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and len(land) >= 1 and len(mids) >= 1,
                  f'平台取樣 {len(land)}、側邊 {len(mids)}；' + json.dumps(s, ensure_ascii=False))
        # 3. 坐下讀書 → 站起來
        seat = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const its=GAME.E.interactables.filter(i=>i.study&&i.lv===1).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const it=its[0]; return it?{x:it.x,z:it.z}:null; })()")
        ok = await L.go_to(pg, cdp, run, seat['x'], seat['z'], 0.6, '自習區的座位', lv=1)
        run.check('走到自習區的座位（出現「坐下讀書」）', ok and (await L.state(pg))['interact'].startswith('坐下讀書'))
        h0 = await pg.evaluate("GAME.G.hour")
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = None
        while time.time() - t0 < 60:
            s = await L.state(pg)
            if s['choices']: sat = s; break
            await pg.wait_for_timeout(500)
        await run.shot(pg, 'sit_study'); txt = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        run.check('走過去坐下（坐姿、在二樓 5.0 m、選項有「讀書」，再選「讀 1 小時」）', bool(sat) and sat['pose'] == 'sit' and abs(sat['y'] - Y1) < 0.3 and any(t.startswith('讀書') for t in txt), json.dumps(dict(sat or {}, texts=txt), ensure_ascii=False))
        await tap_choice(pg, cdp, '讀書')
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=60)
        await pg.wait_for_timeout(1500); s = await L.state(pg); h1 = await pg.evaluate("GAME.G.hour")
        run.check('讀完書（時間過了約 1 小時）、站起來、站得住（還在二樓）', s['pose'] != 'sit' and s['stand'] and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and 0.8 <= (h1 - h0) <= 1.6, f'{h0:.2f} → {h1:.2f}；' + json.dumps(s, ensure_ascii=False))
        # 4. 樓梯間 → 3F 閱覽區
        sd = await L.find_it(pg, '樓梯間：往 3F 閱覽區')
        ok = await L.go_to(pg, cdp, run, sd['x'] - 0.3, sd['z'], 0.7, '二樓東側的樓梯間', lv=1)
        run.check('從自習區走連廊到東側的樓梯間（不用下樓）', ok and (await L.state(pg))['lv'] == 1)
        run.check('「樓梯間：往 3F 閱覽區」→ 閱覽室', await press(pg, cdp, run, '樓梯間：往 3F 閱覽區', 'library'))
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, 'reading_3f')
        run.check('在閱覽室（library 區域）門口、站得住；前面的門是樓梯間', s['zone'] == 'library' and s['stand'] and s['interact'].startswith('樓梯間'), json.dumps(s, ensure_ascii=False))
        # 5. 閱覽室的電梯 → 1F 大廳
        call = await L.find_it(pg, '搭電梯')
        ok = await L.go_to(pg, cdp, run, call['x'], call['z'], 0.6, '閱覽室的電梯門口')
        run.check('走到閱覽室東側的電梯門口（出現「搭電梯」）', ok and (await L.state(pg))['interact'].startswith('搭電梯'))
        seen, s = await ride(pg, cdp, run, '4F', '1F', lambda q: q['zone'] == 'library_hall' and q['lv'] == 0, 'reading_elev')
        await run.shot(pg, 'hall_from_elevator')
        run.check('電梯：選「4F–6F 書庫」按不亮（說明書庫在整理），還在選單裡', seen['locked'] and '書庫' in seen['lockedToast'], seen['lockedToast'])
        cz = await pg.evaluate("(()=>{ const e=GAME.E.zone.elev; return e?{cx:e.cx,outZ:e.outZ,lv:e.lv,open:e.isOpen}:null; })()")
        run.check('電梯：選「1F 大廳、出口」→ 換到總圖大廳、車廂在一樓、走出車廂（第 0 層、地面、電梯門口）', seen['inside'] and s['zone'] == 'library_hall' and s['lv'] == 0 and abs(s['y']) < 0.05 and not s['busy'] and bool(cz) and abs(s['z'] - cz['outZ']) < 0.8,
                  json.dumps(dict(s, elev=cz), ensure_ascii=False))
        # 6. 大廳電梯 → 二樓 → 存檔 → 重新整理 → 讀檔
        run.check('出來就站在大廳的電梯門口（「搭電梯」）', (await L.state(pg))['interact'].startswith('搭電梯'))
        seen, s = await ride(pg, cdp, run, None, '2F', lambda q: q['lv'] == 1, 'hall_elev')
        moving = [y for y in seen['ys'] if 0.5 < y < 4.5]
        run.check('大廳的電梯：選「2F 自習區」→ 看得到車廂往上 → 到二樓（第 1 層、5.0 m）', seen['inside'] and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and len(moving) >= 1, json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔'); const e=b[b.length-1]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        saved = await pg.evaluate("(()=>{ for(const k of ['fatiao3d_slot_3','fatiao3d_slot_2','fatiao3d_slot_1']){ const t=localStorage.getItem(k); if(t){ const s=JSON.parse(t); if(s.zone==='library_hall'&&s.pos&&s.pos.lv===1) return {k,pos:s.pos}; } } return null; })()")
        run.check('在總圖大廳二樓存檔：存檔記錄區域、樓層（lv=1）、位置與高度', bool(saved) and abs(saved['pos'].get('y', 0) - Y1) < 0.1, json.dumps(saved, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnClose') if await L.center_of(pg, '#btnClose') else None
        await pg.reload(); run.check('重新整理', await L.wait_loaded(pg))
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(k=>{ const n=k.replace('fatiao3d_slot_',''); const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 '+n)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(saved['k'] if saved else 'fatiao3d_slot_3'))
        if c: await L.touch_tap(cdp, c[0], c[1])
        await pg.wait_for_timeout(4000); s = await L.state(pg); await run.shot(pg, 'after_load_2f')
        run.check('讀檔：回到總圖大廳二樓（第 1 層、5.0 m）', s['zone'] == 'library_hall' and s['lv'] == 1 and abs(s['y'] - Y1) < 0.1, json.dumps(s, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, 2.0, 0.4, 0.7, '連廊', lv=1)
        s = await L.state(pg)
        run.check('讀檔之後走得動（走到連廊，還在二樓）', ok and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05, json.dumps(s, ensure_ascii=False))
        # 7. 路人跨樓層
        t0 = time.time(); npc_y = await pg.evaluate("GAME.E.npcs.filter(n=>n.isExtra&&n.beh==='route').map(n=>n.obj.position.y)"); spans = [[y, y] for y in npc_y]
        while time.time() - t0 < 240 and npc_y:   # 總圖大樓梯一上一下 5 m、路線比萬才館長；SwiftShader 遊戲時間只有真實時間的 0.2～0.4 倍
            await pg.wait_for_timeout(2000)
            cur = await pg.evaluate("GAME.E.npcs.filter(n=>n.isExtra&&n.beh==='route').map(n=>n.obj.position.y)")
            for i, y in enumerate(cur[:len(spans)]): spans[i][0] = min(spans[i][0], y); spans[i][1] = max(spans[i][1], y)
            if any(b2 - a2 >= 2.0 for a2, b2 in spans): break
        run.check('路人走大樓梯上下樓（240 秒內高度變化 ≥ 2 m）', any(b2 - a2 >= 2.0 for a2, b2 in spans), json.dumps(spans) + '  %.0f 秒' % (time.time() - t0))
        # 8. 大樓梯下一樓 → 離開總圖
        ex = await L.find_it(pg, '離開總圖')
        ys.clear()
        wt = asyncio.ensure_future(watch_y(lambda st: st['lv'] == 0 and abs(st['y']) < 0.05 and st['z'] > 4.0))
        ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'] - 0.5, 0.9, '一樓出口（走大樓梯下來）', lv=0)
        await asyncio.sleep(1.0); wt.cancel()
        s = await L.state(pg); land = [y for (y, lv, x, z) in ys if abs(y - 2.5) < 0.05 and z < -4.6]
        run.check('從二樓走大樓梯下一樓、走過閘門到出口（經過平台、第 0 層、地面）', ok and s['lv'] == 0 and abs(s['y']) < 0.05 and len(land) >= 1 and s['interact'].startswith('離開總圖'), f'平台取樣 {len(land)}；' + json.dumps(s, ensure_ascii=False))
        run.check('離開總圖 → 回到校園', await press(pg, cdp, run, '離開總圖', 'campus'))
        await pg.wait_for_timeout(2000); s = await L.state(pg); await run.shot(pg, 'out_campus')
        run.check('回到校園：總圖門廊前面、站得住', s['zone'] == 'campus' and s['lv'] == 0 and s['stand'] and abs(s['x'] - 80) < 0.6 and abs(s['z']) < 0.6, json.dumps(s, ensure_ascii=False))
        # 9.
        run.check('劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', s['fallbacks'] == 0, str(s['fallbacks']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
