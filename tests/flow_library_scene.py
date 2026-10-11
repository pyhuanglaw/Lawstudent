"""真實玩家流程：第二天下午和小安去總圖——「總圖的下午」（劇情原文：「二樓靠牆的長桌」）。總圖第一階段（D43）之後，這段在總圖大廳二樓的自習區開始。

不用 ?turbo、不瞬移；手機模擬（iPhone 橫向、is_mobile、CDP 觸控）。玩家的操作只用：點地面（遊戲的自動找路）、搖桿、點互動按鈕、點對話與選項。
  [前置／捷徑] 只有一個：讀檔到第 2 天 15:40、已經和小安約好去總圖（plan=library、companion=an，小安跟在旁邊）、校園總圖門廊前面。之後全部是玩家操作：
  1. 「進入總圖書館」→ 總圖大廳；目標變成「上二樓的自習區（跟小安一起）」；小安跟著進來
  2. 搭電梯：3F 閱覽區先不能去（和小安約好在二樓自習區）
  3. 走大樓梯上二樓 → 一到二樓就開始「總圖的下午」：兩個人走到西側靠窗的長桌、面對面坐下（劇情的座位、第 1 層）
  4. 對話與選擇（都選第一個）→ 黃昏 → afternoonDone、companion 清掉、目標變成晚上的事
  5. 站起來、還在二樓、走得動；walkFallbacks＝0；沒有 JS 例外
這是 Playwright 手機模擬，不是 iPhone 實機。
用法：python3 tests/flow_library_scene.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_library_scene'
Y1 = 5.0
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'plan': 'library', 'companion': 'an'}


async def tap_choice(pg, cdp, prefix):
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(prefix))
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


async def main():
    run = L.Run('flow_library_scene', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：第 2 天（星期四）15:40、和小安約好去總圖（plan=library、companion=an）、校園總圖門廊前面 (82,0)')
        await L.load_state(pg, {'zone': 'campus', 'hour': 15.67, 'day': 2, 'weekday': 4, 'weather': 'sunny', 'pos': {'x': 82, 'z': 0, 'yaw': 1.5708}, 'flags': FLAGS})
        await pg.wait_for_timeout(3000)
        an = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.an; return n?{beh:n.beh}:null; })()")
        run.check('[前置] 小安跟在旁邊（follow）', bool(an) and an['beh'] == 'follow', json.dumps(an))
        door = await L.find_it(pg, '進入總圖書館')
        ok = await L.go_to(pg, cdp, run, door['x'] - 1.2, door['z'], 1.0, '總圖門口')
        s = await L.state(pg)
        if s['interact'].startswith('進入總圖書館'): await L.tap(pg, cdp, '#interact')
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: q['zone'] == 'library_hall' and not q['busy'] and not q['dlg'], max_steps=60)
        await pg.wait_for_timeout(3000); s = await L.state(pg); await run.shot(pg, 'hall')
        goal = await pg.evaluate("GAME.G.goal||''"); an = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.an; return n?{beh:n.beh,x:n.obj.position.x,z:n.obj.position.z}:null; })()")
        run.check('進入總圖大廳；目標提示「上二樓的自習區」；小安跟著進來', s['zone'] == 'library_hall' and '二樓' in goal and bool(an) and an['beh'] == 'follow', f'目標「{goal}」；小安 {json.dumps(an)}')
        # 2. 電梯：3F 先不能去
        call = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.elevator&&i.lv===0); return it?{x:it.x,z:it.z}:null; })()")
        ok = await L.go_to(pg, cdp, run, call['x'], call['z'], 0.6, '一樓電梯門口', lv=0)
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); toast = ''; hint = ''
        while time.time() - t0 < 90:
            s = await L.state(pg)
            if s['choices']:
                hint = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith('3F')); return b?b.textContent:''; })()")
                await tap_choice(pg, cdp, '3F'); await pg.wait_for_timeout(700)
                toast = await pg.evaluate("(()=>{ const t=document.getElementById('toast'); return t?t.textContent:''; })()")
                await tap_choice(pg, cdp, '不搭了'); break
            await pg.wait_for_timeout(400)
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=40)
        run.check('電梯：和小安約好在二樓，3F 閱覽區先不能去（看得懂的說明）、選「不搭了」走出來', '二樓' in toast and s['zone'] == 'library_hall' and s['lv'] == 0 and not s['busy'], f'選項「{hint}」；說明「{toast}」')
        # 3. 走大樓梯上二樓 → 劇情
        # 先走到大樓梯中間的平台（2.5 m，還在第 0 層，劇情不會開始）；再像玩家一樣沿著路線點二樓連廊（go_to 會自己點掉劇情對話，這裡不用）
        ok = await L.go_to(pg, cdp, run, 0.0, -6.4, 0.8, '大樓梯中間的平台', lv=0)
        s = await L.state(pg); run.check('走到大樓梯中間的平台（2.5 m），劇情還沒開始', ok and abs(s['y'] - 2.5) < 0.05 and not s['busy'], json.dumps(s, ensure_ascii=False))
        t0 = time.time(); started = None; taps = 0
        while time.time() - t0 < 300:
            s = await L.state(pg)
            if s['busy'] or s['dlg']: started = s; break
            if not s['path']:
                if await L.tap_path(pg, cdp, 0.0, 0.4, 1): taps += 1
            await pg.wait_for_timeout(1500)
        run.note(f'從平台點地面 {taps} 次')
        run.check('走上二樓就開始「總圖的下午」', bool(started), json.dumps(started, ensure_ascii=False))
        t0 = time.time(); sat = None
        while time.time() - t0 < 120:
            info = await pg.evaluate("(()=>{ const P=GAME.E.player, n=GAME.npc.an, z=GAME.E.zone; const sA=z.seats[0], sB=z.seats[1]; return {pp:P.pose, py:+P.obj.position.y.toFixed(2), plv:P.lv|0, px:+P.obj.position.x.toFixed(2), pz:+P.obj.position.z.toFixed(2), ap:n&&n.pose, ay:n&&+n.obj.position.y.toFixed(2), ax:n&&+n.obj.position.x.toFixed(2), az:n&&+n.obj.position.z.toFixed(2), sA, sB, dlg:!!GAME.D.active}; })()")
            if info['pp'] == 'sit' and info['ap'] == 'sit': sat = info; break
            await pg.wait_for_timeout(500)
        await run.shot(pg, 'scene_seated')
        ok_seat = bool(sat) and abs(sat['px'] - sat['sA']['x']) < 0.05 and abs(sat['pz'] - sat['sA']['z']) < 0.05 and abs(sat['ax'] - sat['sB']['x']) < 0.05 and abs(sat['az'] - sat['sB']['z']) < 0.05 and abs(sat['py'] - Y1) < 0.3 and abs(sat['ay'] - Y1) < 0.3
        run.check('兩個人走到二樓西側靠窗的長桌、面對面坐下（劇情的兩個座位、二樓 5.0 m）', ok_seat, json.dumps(sat, ensure_ascii=False))
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=120)
        await pg.wait_for_timeout(1500); s = await L.state(pg); await run.shot(pg, 'scene_end')
        fl = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {afternoonDone:!!F.afternoonDone, companion:F.companion||null, goal:GAME.G.goal, hour:GAME.G.hour}; })()")
        run.check('「總圖的下午」結束：afternoonDone、companion 清掉、時間到黃昏、目標換成晚上的事', fl['afternoonDone'] and not fl['companion'] and fl['hour'] >= 17.5 and ('公館' in fl['goal'] or '宿舍' in fl['goal']), json.dumps(fl, ensure_ascii=False))
        run.check('站起來、還在二樓、站得住', s['pose'] != 'sit' and s['lv'] == 1 and abs(s['y'] - Y1) < 0.05 and s['stand'], json.dumps(s, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, 0.0, 0.4, 0.8, '連廊（劇情之後）', lv=1)
        run.check('劇情之後走得動（走到連廊）', ok)
        run.check('劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', (await L.state(pg))['fallbacks'] == 0)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
