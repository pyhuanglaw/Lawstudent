"""真實玩家流程：交接包 v2 C9 春假麵店團兩天一夜（出遊系統「出發／晚一點／不去了」＋STORY.travelOvernight）。不用 ?turbo。
[前置／捷徑] 讀檔：大一下春假第一天（4/3）07:54，宿舍房間；補「認識以安、Alison」、加入麵店團群組，
用 STORY.springChoose 記下「和麵店團去」（等於第 5 週在手機上選了它；silent＝不重發選完的訊息）。
之後都走真的介面：08:00 跳出「出發：春假・小旅行」→ 點「出發」→ 過場 → 2D 畫面的旁白與台詞（點對話）→ 回到台北。
檢查：提示的三個選項；AA 的六句（認識以安、Alison 的版本）；回來是 4/4（第二天）17:00、天氣晴、人還在宿舍、不在劇情裡；
回來以後走得動；沒有 JS 例外。
用法：python3 tests/flow_spring_trip.py URL [輸出資料夾]（Playwright 手機模擬＋SwiftShader，不是 iPhone 實機）"""
import asyncio, json, math, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_spring_trip'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}


async def play_through(pg, cdp, run, until, pick_text=None, seen=None, max_s=300):
    """像玩家一樣點對話；出現選項就照文字選（pick_text 開頭的那一個，沒有就第一個）；看過的對話記在 seen"""
    t0 = time.time(); last = None; still = time.time()
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        # 整句台詞（GAME.D.full）：對話框有打字機效果，SwiftShader 取樣常常只拿到半句（2026-10-14 flow_spring_trip 記到「……好。行程表」就被點到下一句）
        full = await pg.evaluate("(GAME.D&&GAME.D.active&&GAME.D.full)?String(GAME.D.full):''")
        if full: s['dtext'] = full
        if s['dtext'] and seen is not None and (not seen or seen[-1] != s['dtext']): seen.append(s['dtext'])
        if until(s): return s
        key = (s['dtext'], s['choices'], round(s['hour'], 2))
        if key != last: last = key; still = time.time()
        if time.time() - still > 60: run.note('超過 60 秒沒有進展：' + json.dumps(s, ensure_ascii=False)); return s
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
            run.note('選項：' + json.dumps(opts, ensure_ascii=False))
            i = next((k for k, o in enumerate(opts) if pick_text and o.startswith(pick_text)), 0)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1))
        elif s['dlg']:
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    return await L.state(pg)


async def main():
    run = L.Run('flow_spring_trip', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        d0 = await pg.evaluate("STORY.springDays().d0")
        wd = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % d0)
        run.setup(f'讀檔：春假第一天（第 {d0} 天，4/3）07:54，宿舍房間；認識以安、Alison；麵店團群組；STORY.springChoose 選「和麵店團去」')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 7.9, 'day': d0, 'weekday': wd, 'weather': 'rain', 'flags': BASE_FLAGS})
        await pg.evaluate("SOCIAL.remember('heroine_01','FIRST_MET','');SOCIAL.remember('yu','FIRST_MET','');PHONE.join(GAME.G,'noodle_team','麵店團');STORY.springChoose(GAME,'noodle',{silent:true})")
        q = await pg.evaluate("OUT.get(GAME.G,'ndl_trip_y1s2')")
        run.note('排好的出遊：' + json.dumps(q, ensure_ascii=False))
        # 1. 08:00 提示
        opts = []
        for _ in range(240):
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
            if opts: break
            await pg.wait_for_timeout(1000)
        run.check('08:00 跳出提示：「出發：春假・小旅行」／「晚一點」／「不去了」', len(opts) == 3 and opts[0].startswith('出發：春假・小旅行') and opts[1].startswith('晚一點') and opts[2].startswith('不去了'), json.dumps(opts, ensure_ascii=False))
        await run.shot(pg, '1_prompt')
        # 2. 出發 → 2D 畫面的台詞
        seen = []
        s = await play_through(pg, cdp, run, lambda q: (not q['dlg']) and (not q['choices']) and (not q['busy']) and q['hour'] >= 16, pick_text='出發', seen=seen)
        run.note('看到的對話：' + json.dumps(seen, ensure_ascii=False))
        want = ['火車上，四個位子怎麼坐', '猜拳。', '到的第一天就下雨。', '……好。行程表第二版。', '雨停的空檔，大家在堤防上排成一排拍照。', '第二天早上，阿哲睡過頭，Alison 在門外敲了五分鐘。', '民宿老闆很熱情，每個人多拿了一顆茶葉蛋。']
        run.check('2D 畫面：AA 的六句（認識以安、Alison 的版本）', all(any(t.startswith(w_[:10]) for t in seen) for w_ in want), json.dumps(seen, ensure_ascii=False))
        g = await pg.evaluate("({day:GAME.G.day,hour:+GAME.G.hour.toFixed(2),weather:GAME.G.weather,zone:GAME.G.zone,done:!!(GAME.G.events.done.ev_noodle_trip_spring_y1),companion:GAME.G.flags.companion||null,wd:GAME.G.weekday})")
        wd1 = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % (d0 + 1))
        run.check('回來：4/4（第二天）17:00 左右、星期跟著換、天氣晴、人還在宿舍', g['day'] == d0 + 1 and 16.9 <= g['hour'] <= 17.6 and g['wd'] == wd1 and g['weather'] == 'clear' and g['zone'] == 'dorm' and g['done'], json.dumps(g))
        await run.shot(pg, '2_back')
        # 3. 回來以後走得動
        s0 = await L.state(pg)
        moved = 0.0
        for dx, dy in [(0, -40), (40, 0), (0, 40), (-40, 0)]:
            await L.joystick(pg, cdp, dx, dy, 1200); await pg.wait_for_timeout(500)
            s1 = await L.state(pg); moved = max(moved, math.hypot(s1['x'] - s0['x'], s1['z'] - s0['z']))
        run.check('回來以後走得動（搖桿）', moved > 0.3 and not s1['busy'], f'移動 {moved:.2f} m')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
