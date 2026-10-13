"""真實玩家流程：使用者 2026-10-13 試玩回報的問題（不用 ?turbo）。單元測試在 smalltalk_unit、schedule_leave_unit、bed_nap_unit、find_person_unit，這裡看遊戲畫面裡真的發生什麼。
A. 林芷若講完話就消失：週二 11:46 在傅鐘附近，自己走到林芷若旁邊、和她說話（走近時她可能先開口：通識分組＝第一次見面）；12:00 她的時段結束——人還在、往最近的出口走（不是直接不見），走到了才離開。
B. 高子晴第一次聊天就說「期末成發你要來」：週二下午在校園找到她（還不認識）——她只點頭（旁白），不自我介紹、沒有吉他社以後才有的三句；第一次見面留給吉他社（AA_120 3-1）。
C. 小睡：週二 10:00 宿舍，床的選項有「小睡一下（13:00）」「睡到傍晚」、沒有「睡覺」；小睡到 13:00；13:00 再小睡會經過 13:20 的課＝先問，選「先不要」時間不動。
D. 朋友在哪：週五 16:30 在霖澤館前，手機「朋友」→ 阿哲「帶我去」→ 目標變成「去找阿哲」→ 自己走過去、和他說話 → 目標恢復。
E. 總圖可以快速前往：手機「地點」有「總圖書館（大廳）」，點了就到。
[前置／捷徑] 每一段開始時讀檔到那個時間地點（標示在輸出）；第一、二天主線已過。
用法：python3 tests/flow_playtest_fixes.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_playtest_fixes'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'fundsV2': 1, 'allowanceMonth': 9}
NPC_JS = "(id=>{ const n=GAME.E.npcs.find(q=>q.charId===id||q.id===id); if(!n) return null; const o=n.obj.position, P=GAME.E.player.obj.position; return {x:+o.x.toFixed(2), z:+o.z.toFixed(2), d:+Math.hypot(o.x-P.x,o.z-P.z).toFixed(2), beh:n.beh||null, pose:n.pose||null, leaving:!!n.leaving, arrived:!!n.arrived}; })(%s)"
GATED = ('「欸不是，你手指好了沒？」', '「阿凱昨天又通宵，你室友要看好他。」', '「期末成發你要來。這不是問句。」')


async def npc(pg, cid): return await pg.evaluate(NPC_JS % json.dumps(cid))
async def goal(pg): return await pg.evaluate("(document.getElementById('goal')||{}).textContent||''")


async def choose(pg, cdp, prefix):
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(prefix))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return True


async def talk_through(pg, cdp, run, max_steps=40):
    """按互動、點完對話（選第一個選項）；回傳出現過的對話文字（全文）"""
    lines = []
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
    for _ in range(max_steps):
        q = await L.state(pg)
        t = await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")
        if t and (not lines or lines[-1] != t): lines.append(t)
        if q['choices']:
            await choose(pg, cdp, (await pg.evaluate("(document.querySelector('#choices button')||{}).textContent||''"))[:3]); continue
        if not q['dlg'] and not q['busy']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(900)
    return lines


async def dialog_through(pg, cdp, run, max_steps=40):
    """已經開始的對話（例如走近時自動開始的事件）：點完；回傳對話文字"""
    lines = []
    for _ in range(max_steps):
        q = await L.state(pg)
        t = await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")
        if t and (not lines or lines[-1] != t): lines.append(t)
        if q['choices']:
            await choose(pg, cdp, (await pg.evaluate("(document.querySelector('#choices button')||{}).textContent||''"))[:3]); continue
        if not q['dlg'] and not q['busy']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(900)
    return lines


async def chase(pg, cdp, run, cid, label, rounds=4):
    """像玩家一樣走到那個人旁邊（點地面；人在走動，所以分幾次重新瞄準）；回傳最後的距離"""
    for _ in range(rounds):
        n = await npc(pg, cid)
        if not n: return None
        if n['d'] <= 2.3: break
        await L.go_to(pg, cdp, run, n['x'], n['z'], 1.8, label, max_s=150)
    n = await npc(pg, cid)
    return n and n['d']


async def main():
    run = L.Run('flow_playtest_fixes', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：林芷若時段結束 ----------
        run.setup('讀檔：第 7 天（9/23 週二）11:46，校園傅鐘附近 (-38,6)；林芷若週二 10–12 在傅鐘附近')
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.77, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': -38, 'z': 6, 'yaw': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(4000)
        z0 = await npc(pg, 'heroine_02')
        run.check('A 林芷若在校園（作息：週二 10–12 傅鐘附近）', bool(z0), json.dumps(z0))
        if z0:
            d = await chase(pg, cdp, run, 'heroine_02', '林芷若旁邊')
            s = await L.state(pg)
            if s['dlg'] or s['choices'] or s['busy']:   # 走近時她先開口（ev_zhiruo_ge_group：週二、四上午走到她 5 m 內，可以是第一次見面，BB 6-1）
                lines = await dialog_through(pg, cdp, run)
                run.check('A 自己走到林芷若附近：她先開口（通識分組，第一次見面）', any('林芷若' in t or '法律系' in t for t in lines), ' / '.join(t[:30] for t in lines[:4]))
            else:
                run.check('A 自己走到林芷若旁邊、出現「和…說話」', d is not None and d <= 2.6 and '說話' in s['interact'], f"d={d} interact={s['interact']}")
                if '說話' in s['interact']:
                    lines = await talk_through(pg, cdp, run)
                    run.note('對話：' + ' / '.join(t[:40] for t in lines[:8]))
            await run.shot(pg, 'A_after_talk')
            # 等到 12:00（不跳時間，站在原地看著她）
            t0 = time.time()
            while time.time() - t0 < 300 and await pg.evaluate("GAME.G.hour") < 12.0: await pg.wait_for_timeout(2000)
            await pg.wait_for_timeout(2500)
            n1 = await npc(pg, 'heroine_02'); h1 = await pg.evaluate("GAME.G.hour")
            run.check('A 12:00 她的時段結束：人還在、正在往出口走（不是直接不見）', bool(n1) and n1['leaving'] and h1 >= 12.0, f"hour={h1:.3f} {json.dumps(n1)}")
            await run.shot(pg, 'A_leaving')
            track, gone_at = [], None
            t0 = time.time()
            while time.time() - t0 < 240:
                n2 = await npc(pg, 'heroine_02')
                if not n2: gone_at = time.time() - t0; break
                track.append((n2['x'], n2['z'], n2['arrived']))
                await pg.wait_for_timeout(3000)
            moved = math.hypot(track[-1][0] - track[0][0], track[-1][1] - track[0][1]) if len(track) >= 2 else 0
            run.note(f'她走過的位置：' + ' → '.join(f'({x:.0f},{z:.0f})' for x, z, _ in track[::3]))
            run.check('A 她真的走了一段（≥ 3 m），走到出口或走遠、看不到了才離開', (moved >= 3 or (track and track[-1][2])) and gone_at is not None, f'moved={moved:.1f} m, 離開於 {gone_at}')
        # ---------- B：高子晴的閒聊 ----------
        run.setup('讀檔：第 7 天（9/23 週二）14:06，校園霖澤館前 (34,-98)；高子晴週二 14–17 在校園走走；還沒參加吉他社的事件')
        await L.load_state(pg, {'zone': 'campus', 'hour': 14.1, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': 34, 'z': -98, 'yaw': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(4000)
        zq = await npc(pg, 'heroine_04')
        run.check('B 高子晴在校園', bool(zq), json.dumps(zq))
        if zq:
            d = await chase(pg, cdp, run, 'heroine_04', '高子晴旁邊')
            s = await L.state(pg)
            run.check('B 自己走到高子晴旁邊、出現「和…說話」', d is not None and d <= 2.6 and '說話' in s['interact'], f"d={d} interact={s['interact']}")
            if '說話' in s['interact']:
                l1 = await talk_through(pg, cdp, run)
                met = await pg.evaluate("SOCIAL.has('heroine_04','FIRST_MET')")
                run.check('B 還不認識子晴時在校園搭話：她只點頭（旁白），不自我介紹、沒有吉他社以後的三句、不記成見過面（她的第一次見面留給吉他社，AA_120 3-1）',
                          bool(l1) and all(t.startswith('（') for t in l1) and not any(g in t for t in l1 for g in GATED) and not met, json.dumps(l1, ensure_ascii=False) + f' met={met}')
                await pg.wait_for_timeout(1500)
                s = await L.state(pg)
                if '說話' not in s['interact']: await chase(pg, cdp, run, 'heroine_04', '高子晴旁邊', rounds=2)
                s = await L.state(pg)
                l2 = await talk_through(pg, cdp, run) if '說話' in s['interact'] else []
                run.check('B 再搭話一次：還是旁白（不會變成一般的自我介紹）', bool(l2) and all(t.startswith('（') for t in l2) and not any('我是' in t for t in l2), json.dumps(l2, ensure_ascii=False))
        # ---------- C：小睡 ----------
        run.setup('讀檔：第 7 天（9/23 週二）10:00，宿舍房間；今天 09:10 國文已經錯過、13:20 通識')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 10.0, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': 0, 'z': 1.0, 'yaw': 3.14}, 'flags': BASE_FLAGS, 'energy': 40}, quiet_events=True)
        await pg.wait_for_timeout(3500)
        bed = await L.find_it(pg, '睡覺')
        ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.7, '床')
        s = await L.state(pg)
        run.check('C 走到床邊、出現「睡覺」', ok and s['interact'].startswith('睡覺'), s['interact'])
        if s['interact'].startswith('睡覺'):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
            run.check('C 早上 10:00 床的選項：小睡一下（13:00）、睡到傍晚、再撐一下；沒有「睡覺」', any(o.startswith('小睡一下') and '13:00' in o for o in opts) and any(o.startswith('睡到傍晚') for o in opts) and not any(o.startswith('睡覺') for o in opts), json.dumps(opts, ensure_ascii=False))
            e0 = await pg.evaluate("GAME.G.energy")
            await choose(pg, cdp, '小睡一下'); await pg.wait_for_timeout(4000)
            q = await pg.evaluate("({hour:GAME.G.hour, day:GAME.G.day, energy:GAME.G.energy, cap:(document.getElementById('caption')||{}).textContent||''})")
            run.check('C 小睡到 13:00、還是同一天、體力有回', abs(q['hour'] - 13.0) < 0.05 and q['day'] == 7 and q['energy'] > e0, json.dumps(q, ensure_ascii=False))
            await run.shot(pg, 'C_after_nap')
            await pg.wait_for_timeout(2000)
            s = await L.state(pg)
            if s['interact'].startswith('睡覺'):
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
                await choose(pg, cdp, '小睡一下'); await pg.wait_for_timeout(1500)
                opts2 = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
                run.check('C 13:00 再小睡（到 18:00）會經過 13:20 的課：先問「照樣跳過／先不要」', any(o.startswith('照樣跳過') and '13:20' in o for o in opts2), json.dumps([opts, opts2], ensure_ascii=False))
                await choose(pg, cdp, '先不要'); await pg.wait_for_timeout(1500)
                h = await pg.evaluate("GAME.G.hour")
                run.check('C 選「先不要」：時間不動（還是 13:00）', abs(h - 13.0) < 0.05, str(h))
        # ---------- D：帶我去找阿哲 ----------
        run.setup('讀檔：第 3 天（9/19 週五）16:30，霖澤館前 (34,-98)；阿哲 15:30–17:30 在校園走走')
        await L.load_state(pg, {'zone': 'campus', 'hour': 16.5, 'day': 3, 'weekday': 5, 'weather': 'clear', 'pos': {'x': 34, 'z': -98, 'yaw': 0}, 'flags': BASE_FLAGS}, quiet_events=True)
        await pg.wait_for_timeout(4000)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(800)
        has = await pg.evaluate("!!document.querySelector('#phoneBody [data-find=\"zhe\"]')")
        run.check('D 手機「朋友」：阿哲那一列有「帶我去」', has)
        if has:
            await pg.evaluate("document.querySelector('#phoneBody [data-find=\"zhe\"]').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(400)
            await L.tap(pg, cdp, '#phoneBody [data-find="zhe"]'); await pg.wait_for_timeout(1500)
            g = await goal(pg); ph = await pg.evaluate("document.getElementById('phone').classList.contains('hide')")
            run.check('D 點「帶我去」：手機關起來、目標變成「去找阿哲」', ph and '去找阿哲' in g, g)
            await run.shot(pg, 'D_find_goal')
            d = await chase(pg, cdp, run, 'zhe', '阿哲旁邊', rounds=6)
            s = await L.state(pg)
            run.check('D 自己走到阿哲旁邊、出現「和阿哲說話」', d is not None and d <= 2.6 and '阿哲' in s['interact'], f"d={d} {s['interact']}")
            if '阿哲' in s['interact']:
                await talk_through(pg, cdp, run)
                g2 = await goal(pg)
                run.check('D 找到了、說完話：目標不再是「去找阿哲」', '去找阿哲' not in g2, g2)
        # ---------- E：總圖快速前往 ----------
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
        sel = '#phoneBody [data-place="library_hall|總圖書館（大廳）"]'
        has = await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel))
        run.check('E 手機「地點」有「總圖書館（大廳）」可以快速前往', has)
        if has:
            await pg.evaluate("document.querySelector(%s).scrollIntoView({block:'center'})" % json.dumps(sel)); await pg.wait_for_timeout(400)
            await L.tap(pg, cdp, sel); await pg.wait_for_timeout(7000)
            s = await L.state(pg)
            run.check('E 到總圖大廳、站得住', s['zone'] == 'library_hall' and s['stand'], json.dumps(s, ensure_ascii=False))
            await run.shot(pg, 'E_library_hall')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
