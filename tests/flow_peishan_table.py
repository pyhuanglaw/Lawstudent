"""真實玩家流程：交接包 v2 C13 選擇③——沛珊的那張表（BB_96 3-7）。不用 ?turbo。
[前置／捷徑] 讀檔：大一下第 11 週週四 20:33，校園、大一女舍門口長椅南邊約 5 m；補「有沛珊的聯絡方式、認識沛珊」（照劇情這時候早就有，只是把人放到那個時間）。
之後都走真的介面：等到 20:40 手機收到她改約的兩句、自己走到長椅旁、看她的訊息、選「那我等妳十分鐘。」、點對話。
檢查：20:40 以前走到長椅旁不會演；20:40 以後演；三個選項；選「等十分鐘」→ 時間過了十分鐘、她下來的四句、拿到表；
手機裡她的兩句只出現一次、接著是你的回覆；沒有 JS 例外。
用法：python3 tests/flow_peishan_table.py URL [輸出資料夾]（Playwright 手機模擬＋SwiftShader，不是 iPhone 實機）"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_peishan_table'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
BENCH = (-93.0, 54.26)


async def play_through(pg, cdp, run, until, pick_text=None, seen=None, max_s=240):
    """像玩家一樣點對話；出現選項就照文字選（pick_text 開頭的那一個，沒有就第一個）；看過的對話記在 seen"""
    t0 = time.time(); last = None; still = time.time()
    while time.time() - t0 < max_s:
        s = await L.state(pg)
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
    run = L.Run('flow_peishan_table', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        thu = await pg.evaluate("STORY.termDay('Y1S2',11,4)")
        run.setup(f'讀檔：大一下第 11 週週四（第 {thu} 天）20:33，大一女舍門口長椅南邊；補沛珊的聯絡方式、認識沛珊')
        await L.load_state(pg, {'zone': 'campus', 'hour': 20.55, 'day': thu, 'weekday': 4, 'weather': 'clear', 'pos': {'x': BENCH[0], 'z': BENCH[1] - 5.5, 'yaw': 0}, 'flags': BASE_FLAGS})
        await pg.evaluate("INV.addContact(GAME.G,'classmate_peishan');SOCIAL.remember('classmate_peishan','FIRST_MET','')")
        await pg.wait_for_timeout(3000)
        # 1. 20:40 以前：走到長椅旁不會演
        await L.go_to(pg, cdp, run, BENCH[0], BENCH[1] - 1.2, 0.8, '長椅前面', lv=0)
        s = await L.state(pg)
        early = s['hour'] % 24 < 20 + 40 / 60
        run.check('20:40 以前走到長椅旁：還沒有她的訊息、不會演', (not early) or (not s['dlg'] and not await pg.evaluate("(GAME.G.msgs||[]).some(m=>m.tag==='ps_table_cancel')")), f"時間 {s['hour']}、對話 {s['dtext']}")
        # 2. 等到 20:40 以後：演
        seen = []
        s = await play_through(pg, cdp, run, lambda q: q['choices'] > 0, seen=seen, max_s=300)
        run.note('看到的對話：' + json.dumps(seen, ensure_ascii=False))
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        run.check('20:40 以後在長椅旁：手機上她的兩句（「對不起。課輔班的作業還沒改完，明天要發回去。」「今天下不去了。」）→ 三個選項',
                  any(t.startswith('對不起。課輔班') for t in seen) and any(t.startswith('今天下不去了') for t in seen) and len(opts) == 3 and opts[1].startswith('「那我等妳十分鐘。」'),
                  json.dumps({'seen': seen, 'opts': opts, 'h': s['hour']}, ensure_ascii=False))
        await run.shot(pg, '1_choice')
        h0 = s['hour']
        s = await play_through(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'] and not q['busy'], pick_text='「那我等妳十分鐘。」', seen=seen)
        f = await pg.evaluate("({c:GAME.G.flags.PS_CANCEL,g:GAME.G.flags.PS_TABLE_GOT})")
        run.check('選「那我等妳十分鐘。」：她下來（四句）、拿到表、時間過了約十分鐘',
                  any(t.startswith('十分鐘後她真的下來了') for t in seen) and any(t.startswith('……我上去了。還有十二本。') for t in seen) and f['c'] == 'waited' and f['g'] is True and 0.12 <= s['hour'] - h0 <= 0.5,
                  json.dumps({'f': f, 'h0': h0, 'h': s['hour'], 'seen': seen[-5:]}, ensure_ascii=False))
        th = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.th==='p:classmate_peishan').map(m=>(m.from||'')+':'+m.text)")
        run.check('手機裡：她的兩句只出現一次，接著是你的「那我等妳十分鐘。」', th.count('classmate_peishan:今天下不去了。') == 1 and th[-1] == 'player:那我等妳十分鐘。', json.dumps(th, ensure_ascii=False))
        await run.shot(pg, '2_after')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
