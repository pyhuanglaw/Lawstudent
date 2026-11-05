"""真實玩家流程：用手機約朋友吃飯、赴約（D54 ⑥；src/invites3d.js）。不用 ?turbo。
[前置／捷徑] 讀檔：第 3 天（9/19 週五）17:00 宿舍房間、去過阿鳳麵店（快速前往的清單才有它）；第一、二天和阿哲的關係照劇情
  （舊版 rel 12＋7、第一天在阿鳳麵店一起吃過麵＝SHARED_MEAL 記憶，story3d.js 記的）；關掉條件事件（這個測試不測劇情，避免其他事件插進來）。
A. 手機「朋友」→ 阿哲「約」→ 選「去阿鳳麵店吃飯」→「今天 19:00」→ 旁白「阿哲答應了」；手機「今天」列出約好的；「訊息」有一則。
B. 手機「跳過時間」選「等到晚上」→ 在約好的時間前 10 分鐘停下來（18:50）。
C. 手機「地點」→ 阿鳳麵店（快速前往）→ 阿哲已經坐在店裡等 → 自己走過去、按「和阿哲說話」→ 見面：時間過了 45 分鐘、邀約變成見到了、訊息「和阿哲在阿鳳麵店」。
用法：python3 tests/flow_invite_phone.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_invite_phone'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}


async def tap_sel(pg, cdp, sel):
    """像玩家一樣先把清單滑到那一列再點"""
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(sel))
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def choose(pg, cdp, prefix):
    """選項裡點開頭是 prefix 的那一個（滑到看得到再點）"""
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(prefix))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return True


async def phone(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(700)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


async def main():
    run = L.Run('flow_invite_phone', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：第 3 天（9/19 週五）17:00 宿舍、去過阿鳳麵店；和阿哲的關係照第一、二天的劇情（第一天一起吃過麵）；關掉條件事件')
        social = {'rel': {}, 'mem': {'zhe': [{'tag': 'SHARED_MEAL', 'day': 1, 'note': '阿鳳麵店'}]}, 'reveal': {}, 'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}}
        await L.load_state(pg, {'zone': 'dorm', 'hour': 17.0, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}, 'flags': BASE_FLAGS,
                                'rel': {'an': 22, 'zhe': 19, 'sis': 5, 'kai': 10, 'yu': 5}, 'social': social,
                                'visited': {'dorm': True, 'noodle': True, 'campus': True, 'gongguan': True, 'wenzhou': True}}, quiet_events=True)
        await pg.wait_for_timeout(3500)
        # ---------- A：手機約阿哲 ----------
        txt = await phone(pg, cdp, 'friends')
        run.check('手機「朋友」有阿哲、有「約」', '阿哲' in txt and await pg.evaluate("!!document.querySelector('#phoneBody [data-inv=\"zhe\"]')"), txt[:160])
        await tap_sel(pg, cdp, '#phoneBody [data-inv="zhe"]'); await pg.wait_for_timeout(1500)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        run.check('選地方（分層，INVITE-MENU-1030／AA_535）：第一層有「吃飯…」（小字有阿鳳麵店）、溫州街、算了', any(o.startswith('吃飯…') and '阿鳳麵店' in o for o in opts) and any('溫州街' in o for o in opts), json.dumps(opts, ensure_ascii=False))
        await choose(pg, cdp, '吃飯…')
        await choose(pg, cdp, '去阿鳳麵店吃飯')
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        run.check('選時間：今天 19:00（手機約不能「現在一起過去」）', any(o.startswith('今天 19:00') for o in opts) and not any('現在一起' in o for o in opts), json.dumps(opts, ensure_ascii=False))
        await choose(pg, cdp, '今天 19:00')
        said = []
        for _ in range(12):
            q = await L.state(pg)
            if q['dtext']: said.append(q['dtext'])
            if not q['busy'] and not q['dlg'] and not q['choices']: break
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1200)
        iv = await pg.evaluate("(GAME.G.invites||[]).find(v=>v.who==='zhe')||null")
        run.check('阿哲答應了：約好今天 19:00 阿鳳麵店（accepted）', iv and iv['state'] == 'accepted' and iv['place'] == 'noodle' and abs(iv['h'] - 19) < 1e-6, json.dumps(iv, ensure_ascii=False) + ' ' + json.dumps(said, ensure_ascii=False))
        txt = await phone(pg, cdp, 'today')
        run.check('手機「今天」列出約好的（19:00 和阿哲約在阿鳳麵店）', '19:00' in txt and '阿鳳麵店' in txt, txt[:200])
        await run.shot(pg, 'A_today')
        txt = await phone(pg, cdp, 'msg')
        run.check('手機「訊息」有「約好了」', '約好了' in txt, txt[:200])
        # ---------- B：跳過時間，在約好的時間前停下來 ----------
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(700)
        ok = await tap_sel(pg, cdp, '#phoneBody [data-skip="20.000"]')   # 按鈕的值是 toFixed(3)（classes3d.js 的 todayHTML）；原本寫 "20" 一直沒按到（2026-10-13 佇列測試）
        await pg.wait_for_timeout(5000)
        for _ in range(10):
            q = await L.state(pg)
            if not q['busy'] and not q['dlg']: break
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1200)
        s = await L.state(pg)
        run.check('「等到晚上」在約好的時間前 10 分鐘停下來（18:50）', ok and abs(s['hour'] - (19 - 1 / 6)) < 0.05, f"{s['hour']:.3f}")
        # ---------- C：去阿鳳麵店赴約 ----------
        await phone(pg, cdp, 'places')
        await tap_sel(pg, cdp, '#phoneBody [data-place="noodle|阿鳳麵店"]'); await pg.wait_for_timeout(7000)
        s = await L.state(pg)
        run.check('快速前往阿鳳麵店', s['zone'] == 'noodle' and s['stand'], json.dumps(s, ensure_ascii=False))
        zhe = await pg.evaluate("(()=>{ const n=GAME.npc.zhe||GAME.E.npcs.find(q=>q.id==='zhe'||q.charId==='zhe'); return n?{x:n.obj.position.x,z:n.obj.position.z,pose:n.pose,seat:!!n.seat}:null; })()")
        run.check('阿哲已經坐在店裡等', bool(zhe) and zhe['seat'], json.dumps(zhe))
        await run.shot(pg, 'C_noodle')
        h0 = s['hour']
        ok = await L.go_to(pg, cdp, run, zhe['x'], zhe['z'] + 0.9, 0.6, '阿哲旁邊') if zhe else False
        s = await L.state(pg)
        run.check('自己走到阿哲旁邊、出現「和阿哲說話」', ok and '阿哲' in s['interact'], json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
        for _ in range(14):
            q = await L.state(pg)
            if not q['busy'] and not q['dlg'] and not q['choices']: break
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1200)
        s = await L.state(pg)
        iv = await pg.evaluate("(GAME.G.invites||[]).find(v=>v.who==='zhe')||null")
        msgs = await pg.evaluate("(GAME.G.msgs||[]).map(m=>m.text)")
        run.check('見面：邀約變成見到了、時間過了 45 分鐘、訊息「和阿哲在阿鳳麵店」', iv and iv['state'] == 'done' and abs(s['hour'] - h0 - 0.75) < 0.1 and any('和阿哲在阿鳳麵店' in t for t in msgs), json.dumps(iv, ensure_ascii=False) + f" {h0:.2f}→{s['hour']:.2f}")
        await run.shot(pg, 'C_after_meet')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
