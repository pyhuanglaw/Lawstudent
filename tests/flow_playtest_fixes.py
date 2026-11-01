"""真實玩家流程：使用者 2026-10-13 試玩回報的問題（不用 ?turbo）。單元測試在 smalltalk_unit、schedule_leave_unit、bed_nap_unit、find_person_unit，這裡看遊戲畫面裡真的發生什麼。
A. 林芷若講完話就消失：週二 11:46 在晨思鐘附近，自己走到林芷若旁邊（走近 2.8 m 她就停下來）、和她說話（走近時她可能先開口：通識分組＝第一次見面）；12:00 她的時段結束——人還在、往最近的出口走（不是直接不見），走到了才離開。
   時間：SwiftShader 只有 0.5–1 fps、每幀最多算 0.1 秒，人走得很慢（手機 30–60 fps 時 50 m 約 40 秒）；等「開始往外走」最多 120 秒、等「走到了才離開」最多 900 秒（看遊戲裡的時間 E.time）。
B. 高子晴第一次聊天就說「期末成發你要來」：週二下午在校園找到她（還不認識）——她只點頭（旁白），不自我介紹、沒有吉他社以後才有的三句；第一次見面留給吉他社（AA_120 3-1）。
C. 小睡（AA_110 6-5）：週二 10:00 宿舍，床的選項有「小睡 30 分鐘／1 小時／2 小時」「睡到傍晚（不設鬧鐘）」（寫會錯過 13:20 通識）、沒有「睡覺」；小睡 2 小時到 12:00；
   12:00 再「睡到傍晚」會經過 13:20 的課＝先問，選「先不要」時間不動。
D. 朋友在哪：週五 16:30 在A館前，手機「朋友」→ 阿哲「帶我去」→ 目標變成「去找阿哲」→ 自己走過去、和他說話 → 目標恢復。
E. 總圖可以快速前往：手機「地點」有「總圖書館（大廳）」，點了就到。
[前置／捷徑] 每一段開始時讀檔到那個時間地點（標示在輸出）；第一、二天主線已過。
用法：python3 tests/flow_playtest_fixes.py URL [輸出資料夾]"""
import asyncio, json, os, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_playtest_fixes'
ONLY = set(os.environ.get('PT_ONLY', 'ABCDE'))   # 只跑某幾段（例：PT_ONLY=AE）；預設全部。查單一段的失敗用，不改任何判斷標準
want = lambda s: s in ONLY
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'fundsV2': 1, 'allowanceMonth': 9}
NPC_JS = "(id=>{ const n=GAME.E.npcs.find(q=>q.charId===id||q.id===id); if(!n) return null; const o=n.obj.position, P=GAME.E.player.obj.position; return {x:+o.x.toFixed(2), z:+o.z.toFixed(2), d:+Math.hypot(o.x-P.x,o.z-P.z).toFixed(2), beh:n.beh||null, pose:n.pose||null, leaving:!!n.leaving, arrived:!!n.arrived, held:!!n.held, path:n.path?n.path.length:0, t:+GAME.E.time.toFixed(1)}; })(%s)"
GATED = ('「你手指好了沒？」', '「阿凱昨天又通宵，你室友要看好他。」', '「期末成發你要來。」')


async def npc(pg, cid): return await pg.evaluate(NPC_JS % json.dumps(cid))
async def goal(pg): return await pg.evaluate("(document.getElementById('goal')||{}).textContent||''")


async def choose(pg, cdp, prefix):
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(prefix))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return True


# 對話裡的選項：有「就這樣」（結束和朋友的對話選單）就選它，不然選第一個能按的。
# 2026-10-16 run12：原本一律選第一個，和阿哲說完話以後的選單第一個是「約他去…」，進了約的流程、選項一直點不掉，40 步用完對話還開著，E 段手機快速前往因此沒有作用（不是遊戲的問題，判斷標準不變）
PICK_JS = "(()=>{ const B=[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled); const e=B.find(b=>b.textContent.startsWith('就這樣')); return ((e||B[0]||{}).textContent||'').slice(0,4); })()"


async def talk_through(pg, cdp, run, max_steps=40):
    """按互動、點完對話（選第一個選項）；回傳出現過的對話文字（全文）"""
    lines = []
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
    for _ in range(max_steps):
        q = await L.state(pg)
        t = await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")
        if t and (not lines or lines[-1] != t): lines.append(t)
        if q['choices']:
            await choose(pg, cdp, await pg.evaluate(PICK_JS)); continue
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
            await choose(pg, cdp, await pg.evaluate(PICK_JS)); continue
        if not q['dlg'] and not q['busy']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(900)
    return lines


async def chase(pg, cdp, run, cid, label, rounds=30):
    """像玩家一樣追上走動中的人：看她現在在哪、點那裡（遠的話點往那個方向的地面；超過 16 m 遊戲自己會用跑的），
    每 15 秒（近了 6 秒）看一次、再點一次；她先開口就停；回傳最後的距離。
    v9.6 發布回歸（候選 3）：原本用 go_to 走到她「剛才」的位置——go_to 在人物還在走上一條路線時不會重新點，
    一直走到舊的目標才換，她出現在 60 m 外、還在往遠處走時追不上（c772bab、a6c3d1a 兩次都在這裡失敗）。
    判斷標準不變（2.8 m 內停下、出現「說話」）。
    v9.6 發布回歸（候選 3 第二次，11:30 版）還是追不上：SwiftShader 每秒約 1 格，遊戲時間只有真實的十分之一；鏡頭沒朝她，畫面上看得到的路線只有近的一段，
    點下去不到 16 m、一直用走的（1.8 m/s，她走走 1.2 m/s）。真人會先把鏡頭轉向她、點遠一點的地面跑過去：遠的時候先滑鏡頭（第三次 A 段全過：點 10 次、追到 3.4 m）。"""
    taps = 0; t0 = time.time()
    for _ in range(rounds):
        n = await npc(pg, cid)
        if not n or n['d'] <= 2.3: break
        s = await L.state(pg)
        if s['busy'] or s['dlg'] or s['choices']: break   # 走近時她先開口（相遇事件）
        if n['d'] > 16: await L.turn_camera_to(pg, cdp, n['x'], n['z'])   # 遠的時候先用手指滑鏡頭朝她，畫面上才看得到遠處的路（點超過 16 m 遊戲會用跑的）
        if await L._tap_toward(pg, cdp, await L.state(pg), n['x'], n['z'], n['d'], None): taps += 1
        await pg.wait_for_timeout(15000 if n['d'] > 6 else 6000)
    t1 = time.time()
    while time.time() - t1 < 30:   # 等人物停下來（真人會等走完再看按鈕）
        s = await L.state(pg)
        if not s['path'] or s['busy'] or s['dlg'] or s['choices']: break
        await pg.wait_for_timeout(1000)
    n = await npc(pg, cid)
    run.note(f'追「{label}」：點地面 {taps} 次、{time.time() - t0:.0f} 秒，最後距離 {n["d"] if n else None}')
    return n and n['d']

async def main():
    run = L.Run('flow_playtest_fixes', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：林芷若時段結束 ----------
        if want('A'):
            run.setup('讀檔：第 7 天（9/23 週二）11:30，校園晨思鐘附近 (-38,6)；林芷若週二 10–12 在校園走走（v9.6 發布回歸：原本 11:46，她出現的位置照路線隨機挑、可能在 100 m 外，14 分鐘追不到；改早讓追人和對話有足夠的遊戲時間，判斷標準不變）')
            await L.load_state(pg, {'zone': 'campus', 'hour': 11.5, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': -38, 'z': 6, 'yaw': 0}, 'flags': BASE_FLAGS})
            await pg.wait_for_timeout(4000)
            z0 = await npc(pg, 'heroine_02')
            run.check('A 林芷若在校園（作息：週二 10–12 晨思鐘附近）', bool(z0), json.dumps(z0))
            if z0:
                d = await chase(pg, cdp, run, 'heroine_02', '林芷若旁邊')
                s = await L.state(pg); zn = await npc(pg, 'heroine_02')
                if not (s['dlg'] or s['choices'] or s['busy']):
                    run.check('A 走到她旁邊時她停下來（走走的人玩家走近 2.8 m 就停、看著玩家）', bool(zn) and zn['d'] <= 2.8 and zn['held'] and zn['path'] == 0, json.dumps(zn))
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
                while time.time() - t0 < 1500 and await pg.evaluate("GAME.G.hour") < 12.0: await pg.wait_for_timeout(2000)
                n1 = None; t1 = time.time()
                while time.time() - t1 < 120:   # 行程每 3 秒（遊戲時間）檢查一次：SwiftShader 要 30–60 秒
                    n1 = await npc(pg, 'heroine_02')
                    if not n1 or n1['leaving']: break
                    await pg.wait_for_timeout(2000)
                h1 = await pg.evaluate("GAME.G.hour")
                run.check('A 12:00 她的時段結束：人還在、正在往出口走（不是直接不見）', bool(n1) and n1['leaving'] and h1 >= 12.0, f"hour={h1:.3f} {json.dumps(n1)}")
                await run.shot(pg, 'A_leaving')
                track, gone_at = [], None
                t0 = time.time()
                g0 = await pg.evaluate("GAME.E.time")
                while time.time() - t0 < 900:
                    n2 = await npc(pg, 'heroine_02')
                    if not n2: gone_at = time.time() - t0; break
                    track.append((n2['x'], n2['z'], n2['arrived']))
                    await pg.wait_for_timeout(3000)
                run.note(f'等她離開：真實 {time.time() - t0:.0f} 秒、遊戲裡 {await pg.evaluate("GAME.E.time") - g0:.1f} 秒')
                moved = math.hypot(track[-1][0] - track[0][0], track[-1][1] - track[0][1]) if len(track) >= 2 else 0
                run.note(f'她走過的位置：' + ' → '.join(f'({x:.0f},{z:.0f})' for x, z, _ in track[::3]))
                run.check('A 她真的走了一段（≥ 3 m），走到出口或走遠、看不到了才離開', (moved >= 3 or (track and track[-1][2])) and gone_at is not None, f'moved={moved:.1f} m, 離開於 {gone_at}')
        # ---------- B：高子晴的閒聊 ----------
        if want('B'):
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
        if want('C'):
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
                run.check('C 早上 10:00 床的選項：小睡 30 分鐘／1 小時／2 小時、睡到傍晚（不設鬧鐘，寫會錯過 13:20 通識）、再撐一下；沒有「睡覺」', all(any(o.startswith(k) for o in opts) for k in ('小睡 30 分鐘', '小睡 1 小時', '小睡 2 小時')) and any(o.startswith('睡到傍晚') and '13:20' in o for o in opts) and not any(o.startswith('睡覺') for o in opts), json.dumps(opts, ensure_ascii=False))
                e0 = await pg.evaluate("GAME.G.energy")
                await choose(pg, cdp, '小睡 2 小時'); await pg.wait_for_timeout(4000)
                q = await pg.evaluate("({hour:GAME.G.hour, day:GAME.G.day, energy:GAME.G.energy, cap:(document.getElementById('caption')||{}).textContent||''})")
                run.check('C 小睡 2 小時到 12:00、還是同一天（體力拿掉了，DL-02：右上角沒有體力條）', abs(q['hour'] - 12.0) < 0.05 and q['day'] == 7 and not await pg.evaluate("!!document.getElementById('energy')"), json.dumps(q, ensure_ascii=False))
                await run.shot(pg, 'C_after_nap')
                woke = await L.skip_wake_menu(pg, cdp)   # DL-01：小睡醒來、13:20 還有課 → 起床選單
                run.check('C 小睡醒來：出起床選單（DL-01 一鍵上課），選「先起床再說」交回操作', woke)
                await pg.wait_for_timeout(2000)
                s = await L.state(pg)
                if s['interact'].startswith('睡覺'):
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
                    await choose(pg, cdp, '睡到傍晚'); await pg.wait_for_timeout(1500)
                    opts2 = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
                    run.check('C 12:00 再「睡到傍晚」（不設鬧鐘）會經過 13:20 的課：先問「照樣跳過／先不要」', any(o.startswith('照樣跳過') and '13:20' in o for o in opts2), json.dumps([opts, opts2], ensure_ascii=False))
                    h0 = await pg.evaluate("GAME.G.hour")   # 小睡醒來是 12:02，之後自由行動時時鐘照常走（2026-10-14 回歸：選單前後走了約 1 分鐘，舊的「離 12:00 不超過 3 分鐘」差 4 秒沒過）
                    await choose(pg, cdp, '先不要'); await pg.wait_for_timeout(1500)
                    h = await pg.evaluate("GAME.G.hour")
                    run.check('C 選「先不要」：時間不動（沒有跳到傍晚：和選之前差不到 3 分鐘、還在中午）', abs(h - h0) < 0.05 and h < 12.25, f'選之前 {h0:.4f}、選之後 {h:.4f}')
        # ---------- D：帶我去找阿哲 ----------
        if want('D'):
            run.setup('讀檔：第 3 天（9/19 週五）16:30，法律系館A前 (34,-98)；阿哲 15:30–17:30 在校園走走')
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
                d = await chase(pg, cdp, run, 'zhe', '阿哲旁邊', rounds=30)   # v9.6 候選 3 第三次：6 次（每次 15 秒）追不到 78 m 外的阿哲（舊版每次 go_to 最多 150 秒）；判斷標準不變
                s = await L.state(pg)
                run.check('D 自己走到阿哲旁邊、出現「和阿哲說話」', d is not None and d <= 2.6 and '阿哲' in s['interact'], f"d={d} {s['interact']}")
                if '阿哲' in s['interact']:
                    await talk_through(pg, cdp, run)
                    g2 = await goal(pg)
                    run.check('D 找到了、說完話：目標不再是「去找阿哲」', '去找阿哲' not in g2, g2)
        # ---------- E：總圖快速前往 ----------
        if want('E'):
            q0 = await L.state(pg)
            if q0['dlg'] or q0['choices'] or q0['busy']:   # 前一段的對話還開著：先像玩家一樣說完（選「就這樣」）
                await dialog_through(pg, cdp, run)
            q1 = await L.state(pg)
            run.check('E 開手機之前沒有開著的對話', not any(q1[k] for k in ('dlg', 'choices')), json.dumps(q1, ensure_ascii=False)[:200])
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
