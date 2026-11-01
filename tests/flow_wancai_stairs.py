"""真實玩家流程：萬才館的弧形大樓梯（萬才館第二階段，D36；使用者需求 21：「萬才館的弧形大樓梯必須能讓玩家走上去」「玩家能從室外地面走上樓梯，到達二樓平台」）

不用 ?turbo、不瞬移；手機模擬（iPhone 橫向、is_mobile、CDP 觸控）。玩家的操作只用：搖桿、點地面（遊戲的自動找路）、點互動按鈕、點對話。
  [前置／捷徑] 只有一個：讀檔到星期六 10:00、法學院廣場（萬才館大樓梯前面 (87,-84)，面向樓梯）。之後全部是玩家操作：
  1. 推搖桿往前：從廣場走上大樓梯（一階一階：經過樓梯中段 1–3 m 的高度）→ 樓梯頂端的平台（第 1 層、3.63 m）
  2. 點地面走到弧形陽台；站在一樓入口正上方時不會跳出「進入萬才館」（那是陽台下面一樓的門）
  3. 二樓入口（萬才館第三階段，D42：第二階段是關著的告示）：出現「進入萬才館（二樓）」→ 進到萬才館二樓的門廳（第 1 層、4.2 m）
     →「走出去（大樓梯平台）」→ 回到平台（校園第 1 層、3.63 m）、走得動
  4. 在陽台上存檔（欄位 3）→ 重新整理 → 讀取 → 還在陽台上（第 1 層、3.63 m）、走得動
  5. 點地面走下樓梯回到廣場（經過樓梯中段、回到地面那一層、高度 0）
  6. 走到陽台下面的一樓入口 → 「進入萬才館」→ 一樓大廳 →「離開萬才館」→ 回到校園（地面）
  7. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）、沒有 JS 例外
這是 Playwright 手機模擬，不是 iPhone 實機。
用法：python3 tests/flow_wancai_stairs.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_wancai_stairs'
PF = 3.63
PLAZA = (87.0, -84.0)


async def press(pg, cdp, run, label, wait_zone=None, timeout=60):
    s = await L.state(pg)
    if not s['interact'].startswith(label):
        run.note(f'互動按鈕是「{s["interact"]}」，不是「{label}」'); return False
    await L.tap(pg, cdp, '#interact')
    if wait_zone:
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: q['zone'] == wait_zone and not q['busy'] and not q['dlg'], max_steps=int(timeout))
        return s['zone'] == wait_zone and not s['busy']
    return True


async def main():
    run = L.Run('flow_wancai_stairs', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：星期六 10:00（第 8 天）、法學院廣場（萬才館大樓梯前 (87,-84)，面向樓梯）、晴天')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': PLAZA[0], 'z': PLAZA[1], 'yaw': 3.1416},
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}}, quiet_phone=True)
        await pg.wait_for_timeout(3000)
        s = await L.state(pg); await run.shot(pg, 'plaza')
        run.check('在廣場（地面那一層、高度 0）', s['zone'] == 'campus' and s['lv'] == 0 and abs(s['y']) < 0.05, json.dumps(s, ensure_ascii=False))
        # 1. 搖桿走上大樓梯
        ys = []; t0 = time.time(); pushes = 0; shot_mid = False
        while time.time() - t0 < 300:
            await L.joystick(pg, cdp, 0, -40, 1500); pushes += 1
            s = await L.state(pg); ys.append((s['y'], s['lv'], s['z']))
            if not shot_mid and 1.2 < s['y'] < 2.6: await run.shot(pg, 'stairs_mid'); shot_mid = True
            if s['lv'] == 1 and s['z'] < -99.0: break
            if s['busy'] or s['dlg']: await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['busy'], max_steps=20)
        s = await L.state(pg); await run.shot(pg, 'platform')
        mids = [y for (y, lv, z) in ys if 1.0 < y < 3.0]
        run.check('推搖桿走上大樓梯：經過樓梯中段（高度 1–3 m）、到樓梯頂端的平台（第 1 層、3.63 m）', s['lv'] == 1 and abs(s['y'] - PF) < 0.1 and len(mids) >= 1,
                  f'推了 {pushes} 次；中段取樣 {len(mids)} 個；' + json.dumps(s, ensure_ascii=False))
        # 2. 陽台
        ok = await L.go_to(pg, cdp, run, 93.8, -100.6, 0.7, '弧形陽台（一樓入口正上方）', lv=1)
        s = await L.state(pg); await run.shot(pg, 'balcony')
        run.check('點地面走到弧形陽台（第 1 層、3.63 m）', ok and s['lv'] == 1 and abs(s['y'] - PF) < 0.1, json.dumps(s, ensure_ascii=False))
        run.check('站在一樓入口正上方：不會跳出「進入法律系館B」（那是陽台下面的門）', not s['interact'].startswith('進入法律系館B'), f'按鈕：「{s["interact"]}」')
        # 3. 二樓入口 → 萬才館二樓 → 走出去回到平台（萬才館第三階段，D42）
        d2 = await L.find_it(pg, '進入法律系館B（二樓）')
        ok = await L.go_to(pg, cdp, run, d2['x'], d2['z'] + 0.3, 0.8, '二樓入口', lv=1)
        s = await L.state(pg)
        run.check('走到二樓入口（出現「進入法律系館B（二樓）」）', ok and s['interact'].startswith('進入法律系館B（二樓）'), json.dumps(s, ensure_ascii=False))
        run.check('進入法律系館B（二樓）→ 室內二樓', await press(pg, cdp, run, '進入法律系館B（二樓）', 'wancai'))
        await pg.wait_for_timeout(2000); s = await L.state(pg); await run.shot(pg, 'wancai_2f_foyer')
        run.check('在法律系館B二樓的門廳（第 1 層、4.2 m）', s['zone'] == 'wancai' and s['lv'] == 1 and abs(s['y'] - 4.2) < 0.05 and s['stand'], json.dumps(s, ensure_ascii=False))
        ex2 = await L.find_it(pg, '走出去')
        ok = await L.go_to(pg, cdp, run, ex2['x'], ex2['z'] - 0.3, 0.8, '二樓的門（走出去）', lv=1)
        run.check('走出去（大樓梯平台）→ 回到校園', ok and await press(pg, cdp, run, '走出去', 'campus'))
        await pg.wait_for_timeout(2000); s = await L.state(pg)
        run.check('回到平台（校園第 1 層、3.63 m）、站得住、沒有馬上又跳出進門按鈕', s['zone'] == 'campus' and s['lv'] == 1 and abs(s['y'] - PF) < 0.1 and s['stand'] and not s['interact'].startswith('進入法律系館B'), json.dumps(s, ensure_ascii=False))
        # 4. 在陽台上存檔 → 重新整理 → 讀檔
        ok = await L.go_to(pg, cdp, run, 92.5, -100.4, 0.7, '陽台', lv=1)
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔'); const e=b[b.length-1]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        saved = await pg.evaluate("(()=>{ for(const k of ['fatiao3d_slot_3','fatiao3d_slot_2','fatiao3d_slot_1']){ const t=localStorage.getItem(k); if(t){ const s=JSON.parse(t); if(s.zone==='campus'&&s.pos&&s.pos.lv===1) return {k,pos:s.pos}; } } return null; })()")
        run.check('在陽台上存檔：存檔記錄樓層（lv=1）、位置與高度', bool(saved) and abs(saved['pos'].get('y', 0) - PF) < 0.1, json.dumps(saved, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnClose') if await L.center_of(pg, '#btnClose') else None
        await pg.reload(); run.check('重新整理', await L.wait_loaded(pg))
        await L.no_phone_auto(pg)   # [前置] 讀進來的存檔有要回的訊息：手機自己打開會擋住搖桿（D103）
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        if saved:
            c = await pg.evaluate("(k=>{ const n=k.replace('fatiao3d_slot_',''); const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 '+n)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(saved['k']))
            if c: await L.touch_tap(cdp, c[0], c[1])
        await pg.wait_for_timeout(4000); s = await L.state(pg); await run.shot(pg, 'balcony_after_load')
        run.check('讀檔：回到萬才館陽台（第 1 層、3.63 m）', s['zone'] == 'campus' and s['lv'] == 1 and abs(s['y'] - PF) < 0.1, json.dumps(s, ensure_ascii=False))
        mm = await pg.evaluate("(()=>{ const m=document.getElementById('minimap'); return m?getComputedStyle(m).display:'none'; })()")
        run.check('讀檔在陽台上：小地圖照常顯示（畫地面那一層）', mm != 'none', mm)
        ok = await L.go_to(pg, cdp, run, 95.5, -100.9, 0.7, '陽台東側', lv=1)
        s = await L.state(pg)
        run.check('讀檔之後走得動（走到陽台東側，還在第 1 層）', ok and s['lv'] == 1 and abs(s['y'] - PF) < 0.1, json.dumps(s, ensure_ascii=False))
        # 5. 下樓梯回到廣場
        ys = []
        async def watch_y():
            for i in range(600):
                st = await L.state(pg); ys.append((st['y'], st['lv'], st['z']))
                if st['lv'] == 0 and st['y'] < 0.05 and st['z'] > -90.0: return
                await pg.wait_for_timeout(500)
        wt = asyncio.ensure_future(watch_y())
        ok = await L.go_to(pg, cdp, run, PLAZA[0], PLAZA[1] - 1, 1.2, '廣場（樓梯下）', lv=0)
        await asyncio.sleep(1.0); wt.cancel()
        s = await L.state(pg); await run.shot(pg, 'back_plaza')
        mids = [y for (y, lv, z) in ys if 1.0 < y < 3.0]
        run.check('走下大樓梯回到廣場：經過樓梯中段、回到地面那一層（高度 0）', ok and s['lv'] == 0 and abs(s['y']) < 0.05 and len(mids) >= 1, f'中段取樣 {len(mids)} 個；' + json.dumps(s, ensure_ascii=False))
        # 6. 陽台下面的一樓入口
        d1 = await L.find_it(pg, '進入法律系館B')
        ok = await L.go_to(pg, cdp, run, d1['x'], d1['z'] + 0.6, 1.0, '陽台下面的一樓入口', lv=0)
        s = await L.state(pg); await run.shot(pg, 'door_1f')
        run.check('走到陽台下面的一樓入口（地面、出現「進入法律系館B」）', ok and s['lv'] == 0 and abs(s['y']) < 0.05 and s['interact'].startswith('進入法律系館B'), json.dumps(s, ensure_ascii=False))
        run.check('進入法律系館B → 一樓大廳', await press(pg, cdp, run, '進入法律系館B', 'wancai'))
        await pg.wait_for_timeout(2000)
        ex = await L.find_it(pg, '離開法律系館B')
        ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'] - 0.3, 1.0, '大廳出口')
        run.check('離開法律系館B → 回到校園', ok and await press(pg, cdp, run, '離開法律系館B', 'campus'))
        await pg.wait_for_timeout(2000); s = await L.state(pg); await run.shot(pg, 'out_1f')
        run.check('回到校園：一樓入口前面、地面那一層、站得住', s['zone'] == 'campus' and s['lv'] == 0 and abs(s['y']) < 0.05 and s['stand'], json.dumps(s, ensure_ascii=False))
        # 7.
        run.check('劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', s['fallbacks'] == 0, str(s['fallbacks']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
