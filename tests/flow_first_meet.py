"""真實玩家流程：女主角的第一次見面（AA_120 3-1、AA 2026-10-13 回報的 P1-1／P1-2／P1-3）。不用 ?turbo。
[前置／捷徑] 每一段讀檔到那一天、那個時間、那一區（位置與時間是設定的；D2 從 D 結束時的存檔接著讀，只改日期、時間、天氣）；之後都走真的介面（點地面走路、互動按鈕、點對話、點選項）。
A. 晨思鐘（芷若還沒見過）：9/23 週二 11:20 在晨思鐘附近找到她、按「和不認識的女生說話」→ 只有一句旁白；名字還是「不認識的女生」、熟悉度 0、沒有 FIRST_MET、
   「晨思鐘旁邊」（認識以後的日常）沒有播。修改前：搭話一次名字就出現、熟悉度 5、直接演「剛下外文系的課」並記下 FIRST_MET。
B1. 經原分組（P1-3）：9/26 週五 12:06（大一上第 4 週）在普通的門廳。她在 101 上經原；12:10 下課後起身、走到 101 門口的走廊（一步一步走過去，不瞬移）；玩家離她超過 5 m，不會開始。
B2. 同一天 12:15 在 101 裡面的東門旁（她在門口的走廊，離玩家 3.7 m、隔著牆）：不會開始；走出 101 到走廊 → 自動開始：「不好意思，你是法律系的嗎？剛剛點名有聽到。」（AA_207 §2；原本「欸！法律系！你也修「經濟學原理」？」）「林芷若，外文二。」→ 選第一個 → 記下 FIRST_MET。
   修改前：她 12:10 就去吃飯（作息 zone:null），經原分組幾乎碰不到。
C. 兩點半 Café（芷若還沒見過）：9/26 週五 13:30 走到櫃台 →「和店員說話」→「歡迎光臨——喔，法律系的。」、選項有「檸檬塔。然後——妳是外文系的？」→ 記下 FIRST_MET、名字變成林芷若；
   同一天再和她說話（她的事件一天一次）＝點餐。修改前（v9.7 候選 4 以前）：吧檯的點餐點永遠比較近，「和店員說話」不會出現（tests/cafe_barista_unit.js）。
D. 總圖門口（語彤還沒見過、不下雨）：9/21 週日 17:30 從總圖前面走到門口 → 自動開始 ev_library_door_phone（「總圖門口有個女生一直在看手機……」）→ 記下 FIRST_MET。
D2. 接著 D 的存檔，隔天晚上下雨走到總圖門口：下雨版（ev_rain_library_door）不會再演一次初遇（AA_120 7-5 第 1 項）。
E. 總圖門口（語彤還沒見過、下雨）：9/22 週一 18:30 → 下雨版當第一次見面（「總圖門口的屋簷下站著一個人……」）→ 記下 FIRST_MET。
子晴的第一次見面（吉他社）在 tests/flow_clubs.py 的 A。全程沒有 JS 例外。
用法：python3 tests/flow_first_meet.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_first_meet'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
NPC_JS = "(id=>{ const n=GAME.E.npcs.find(q=>q.charId===id||q.id===id); if(!n) return null; const o=n.obj.position, P=GAME.E.player.obj.position; return {x:+o.x.toFixed(2), z:+o.z.toFixed(2), d:+Math.hypot(o.x-P.x,o.z-P.z).toFixed(2), seat:!!n.seat, pose:n.pose||null, path:n.path?n.path.length:0, leaving:!!n.leaving, name:n.name||'', beh:n.beh||null, tgt:(()=>{ const t=n.path&&n.path.length?n.path[n.path.length-1]:null; return t?(Array.isArray(t)?[+(+t[0]).toFixed(1),+(+t[1]).toFixed(1)]:[+(+t.x).toFixed(1),+(+t.z).toFixed(1)]):null; })()}; })(%s)"
WHO_JS = "(id=>({met:SOCIAL.has(id,'FIRST_MET'), fam:SOCIAL.rel(id).fam, name:SOCIAL.displayName(id), done:Object.keys(GAME.G.events.done||{}).filter(k=>GAME.G.events.done[k])}))(%s)"
SPOT = (-4.8, 0.9)   # 芷若經原下課後站的位置（src/data/characters.js）


async def npc(pg, cid): return await pg.evaluate(NPC_JS % json.dumps(cid))
async def who(pg, cid): return await pg.evaluate(WHO_JS % json.dumps(cid))
async def dtext(pg): return await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")
# 整句台詞：對話框有打字機效果，畫面上的字可能只打到一半（v9.7 回歸 B2 記到「林芷若」「剛剛分」）；讀遊戲正在說的那一整句（GAME.D.full），沒有對話時退回畫面上的字
async def dline(pg): return await pg.evaluate("(GAME.D&&GAME.D.active&&GAME.D.full)?GAME.D.full:((document.getElementById('dlgText')||{}).textContent||'')")
async def menu(pg): return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")


async def play_dialog(pg, cdp, start_tap=False, max_steps=60):
    """點完對話（選第一個選項）；回傳 (台詞, 選單)"""
    lines, menus = [], []
    if start_tap: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
    for _ in range(max_steps):
        q = await L.state(pg); t = await dline(pg)
        if t and (not lines or lines[-1] != t): lines.append(t)
        if q['choices']:
            menus.append(await menu(pg)); await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(1500); continue
        if not q['dlg'] and not q['busy']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(900)
    return lines, menus


async def chase(pg, cdp, run, cid, label, max_s=420, tries=90):
    """追走路中的人：像玩家一樣先按「跑」，每 2 秒重新看她現在在哪、重新瞄準——遠的時候點她附近的地面（遊戲找路），近了（6 m 內）用搖桿朝她推；
    玩家走到 2.8 m 內她就會停下來（engine3d.js updateNPC）。不瞬移。最多 tries 次；追不到就把她的位置、走去哪、行為寫進 log。
    v9.7 回歸：原本走路去追、每次走到她「原本的位置」才看下一步，SwiftShader 太慢，最後 d=30.9 m"""
    on = await pg.evaluate("!!(GAME.E.player&&GAME.E.player.runHold)")
    if not on: await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(300)
    t0 = time.time(); k = 0; best = 1e9; n = None
    while time.time() - t0 < max_s and k < tries:
        n = await npc(pg, cid)
        if not n: break
        best = min(best, n['d'])
        if n['d'] <= 2.0: break
        q = await L.state(pg); k += 1
        if n['d'] > 6:
            await L._tap_toward(pg, cdp, q, n['x'], n['z'], n['d'], None)
        else:
            yaw = q['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
            ux, uz = (n['x'] - q['x']) / max(n['d'], 0.01), (n['z'] - q['z']) / max(n['d'], 0.01)
            await L.joystick(pg, cdp, int(28 * (ux * rx + uz * rz)), int(-28 * (ux * fx + uz * fz)), 600)
        await pg.wait_for_timeout(2000)
    if not on and await pg.evaluate("!!(GAME.E.player&&GAME.E.player.runHold)"): await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(300)
    n = await npc(pg, cid)
    if n and n['d'] > 2.0:
        q = await L.state(pg)
        run.note(f"{label}：追了 {k} 次（{int(time.time() - t0)} 秒、用跑的）沒追到——最近 {best:.1f} m、最後 {n['d']:.1f} m；她在 ({n['x']},{n['z']})、pose {n['pose']}、path {n['path']} 段、"
                 f"要走去 {n.get('tgt')}、行為 {n.get('beh')}、leaving {n['leaving']}；遊戲時間 {q['hour']:.2f}（作息：週二 10–12 在晨思鐘附近）")
    return n and n['d']


async def walk_until_dialog(pg, cdp, run, tx, tz, label, max_s=300, wait_s=60):
    """點地面往 (tx,tz) 走；走的途中自動開始的對話一出現就停（回傳 True）。
    點了沒有往目標靠近（點到牆、門框）就用搖桿朝目標推（v9.7 回歸 B2：在 101 裡點走廊，300 秒還沒走出去，她 12:40 已經走了）。
    走到以後最多等 wait_s 秒：自動事件每 30 格畫面檢查一次（SwiftShader 1–4 fps＝7–30 秒一次），有 random_weight 的還要抽中（總圖門口晴天版每次 1/3）；
    真的玩家 60 fps 是 0.5 秒一次（v9.7 回歸 D：走到門口只等 3 秒就判沒開始）"""
    t0 = time.time(); last_d = None
    while time.time() - t0 < max_s:
        q = await L.state(pg)
        if q['dlg'] or q['choices'] or q['busy']: return True
        d = math.hypot(q['x'] - tx, q['z'] - tz)
        if d < 0.8:
            t1 = time.time()
            while time.time() - t1 < wait_s:
                await pg.wait_for_timeout(1000); q = await L.state(pg)
                if q['dlg'] or q['choices'] or q['busy']: return True
            run.note(f'{label}：走到了，等了 {wait_s} 秒沒有對話')
            return False
        if last_d is not None and d > last_d - 0.2 and d < 3.0:   # 只在很近、還沒走到時推搖桿（遠的時候直推會撞牆、卡在門框裡）
            yaw = q['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
            ux, uz = (tx - q['x']) / max(d, 0.01), (tz - q['z']) / max(d, 0.01)
            await L.joystick(pg, cdp, int(25 * (ux * rx + uz * rz)), int(-25 * (ux * fx + uz * fz)), 900)
        else:
            await L._tap_toward(pg, cdp, q, tx, tz, d, None)   # 點目標；看不到（隔著牆、門）就沿著遊戲的路線點看得到的那一段（v9.7 回歸 B2：從 101 裡點走廊點不到）
        last_d = d
        await pg.wait_for_timeout(4000)
    run.note(f'{label}：{max_s} 秒內沒有走到、也沒有對話')
    return False


async def main():
    run = L.Run('flow_first_meet', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：傅鐘，芷若還沒見過 ----------
        run.setup('讀檔：第 7 天（9/23 週二）11:20，校園晨思鐘附近 (-38,6)；林芷若週二 10–12 在晨思鐘附近；還沒見過她')
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.33, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': -38, 'z': 6, 'yaw': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(4000)
        z0 = await npc(pg, 'heroine_02')
        run.check('A 林芷若在晨思鐘附近（作息：週二 10–12）', bool(z0), json.dumps(z0, ensure_ascii=False))
        if z0:
            d = await chase(pg, cdp, run, 'heroine_02', '林芷若旁邊')
            s = await L.state(pg)
            run.check('A 走到她旁邊：按鈕是「和不認識的女生說話」（還不知道她的名字）', d is not None and d <= 2.4 and s['interact'] == '和不認識的女生說話', f"d={d} interact={s['interact']}")
            if '說話' in s['interact']:
                lines, menus = await play_dialog(pg, cdp, start_tap=True)
                await run.shot(pg, 'A_after_talk')
                run.check('A 搭話：只有一句旁白（她點個頭又忙自己的事），沒有選單', len(lines) == 1 and lines[0].startswith('（她') and not menus, ' / '.join(lines[:3]))
            w = await who(pg, 'heroine_02'); s = await L.state(pg)
            run.check('A 之後：名字還是「不認識的女生」、熟悉度 0、沒有 FIRST_MET、「晨思鐘旁邊」沒有播', w['name'] == '不認識的女生' and w['fam'] == 0 and not w['met'] and 'ev_zhiruo_bell' not in w['done'], json.dumps(w, ensure_ascii=False) + ' interact=' + s['interact'])
        # ---------- B：經原分組 ----------
        run.setup('讀檔：第 10 天（9/26 週五，大一上第 4 週）12:06，普通教學館門廳 (2.5,6)；林芷若在 101 上重修的經原（09:10–12:10）；還沒見過她')
        await L.load_state(pg, {'zone': 'putong', 'hour': 12.1, 'day': 10, 'weekday': 5, 'weather': 'clear', 'pos': {'x': 2.5, 'z': 6.0, 'yaw': 3.14, 'lv': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(5000)
        n0 = await npc(pg, 'heroine_02')
        run.check('B1 12:06 她坐在 101 上課', bool(n0) and n0['seat'], json.dumps(n0, ensure_ascii=False))
        track, t0, early = [], time.time(), False
        while time.time() - t0 < 600:
            q = await L.state(pg); n = await npc(pg, 'heroine_02')
            if q['dlg'] or q['choices']: early = True; break
            if n: track.append((n['x'], n['z'], q['hour']))
            if n and math.hypot(n['x'] - SPOT[0], n['z'] - SPOT[1]) < 0.6 and not n['path']: break
            await pg.wait_for_timeout(2500)
        await run.shot(pg, 'B1_she_at_door')
        jumps = [math.hypot(track[i][0] - track[i - 1][0], track[i][1] - track[i - 1][1]) for i in range(1, len(track))]
        end = track[-1] if track else None
        run.check('B1 12:10 下課後她起身走到 101 門口的走廊（一步一步走，沒有一次跳超過 2.5 m）', bool(end) and math.hypot(end[0] - SPOT[0], end[1] - SPOT[1]) < 0.6 and bool(jumps) and max(jumps) < 2.5 and sum(jumps) > 2,
                  f"終點={end} 走了 {sum(jumps):.1f} m、最大一步 {max(jumps) if jumps else 0:.2f} m、樣本 {len(track)}")
        q = await L.state(pg)
        run.check('B1 玩家在門廳、離她超過 5 m：不會開始經原分組', not early and not (q['dlg'] or q['choices']) and math.hypot(q['x'] - SPOT[0], q['z'] - SPOT[1]) > 5, f"early={early}")
        run.setup('讀檔：同一天 12:15，普通教學館 101 裡、東門旁 (-6.0,-2.6)（離她站的走廊 3.7 m、隔著牆）；還沒見過她')
        await L.load_state(pg, {'zone': 'putong', 'hour': 12.25, 'day': 10, 'weekday': 5, 'weather': 'clear', 'pos': {'x': -6.0, 'z': -2.6, 'yaw': 3.14, 'lv': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(5000)
        n1 = await npc(pg, 'heroine_02'); await pg.wait_for_timeout(8000); q = await L.state(pg)
        run.check('B2 12:15 進普通：她站在 101 門口的走廊；玩家在 101 裡（隔著牆、不到 5 m）不會開始經原分組', bool(n1) and math.hypot(n1['x'] - SPOT[0], n1['z'] - SPOT[1]) < 0.3 and n1['d'] < 5 and not (q['dlg'] or q['choices'] or q['busy']), json.dumps(n1, ensure_ascii=False))
        started = await walk_until_dialog(pg, cdp, run, -6.4, 0.3, '走出 101 到走廊')
        lines, menus = await play_dialog(pg, cdp) if started else ([], [])
        await run.shot(pg, 'B2_after_group')
        run.check('B2 走出 101 到走廊：自動開始經原分組（「不好意思，你是法律系的嗎？……」→「林芷若，外文二。」→ 分組；AA_207 §2）', started and any('剛剛點名有聽到' in t for t in lines) and '林芷若，外文二。' in lines and bool(menus), ' / '.join(t[:24] for t in lines[:5]))
        w = await who(pg, 'heroine_02')
        run.check('B2 之後：記下 FIRST_MET、名字是林芷若', w['met'] and w['name'] == '林芷若' and 'ev_zhiruo_ge_group' in w['done'], json.dumps(w, ensure_ascii=False))
        # ---------- C：兩點半 Café ----------
        run.setup('讀檔：第 10 天（9/26 週五）13:30，兩點半 Café 門口裡面 (0,5)；林芷若 13:00–17:00 在櫃台；還沒見過她')
        await L.load_state(pg, {'zone': 'cafe', 'hour': 13.5, 'day': 10, 'weekday': 5, 'weather': 'clear', 'pos': {'x': 0, 'z': 5, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(5000)
        c0 = await npc(pg, 'heroine_02')
        run.check('C 她在櫃台', bool(c0), json.dumps(c0, ensure_ascii=False))
        if c0:
            await L.go_to(pg, cdp, run, c0['x'], c0['z'] + 1.5, 0.6, '櫃台前', max_s=240)
            s = await L.state(pg)
            run.check('C 走到櫃台前：「和店員說話」', s['interact'] == '和店員說話', s['interact'])
            if '說話' in s['interact']:
                lines, menus = await play_dialog(pg, cdp, start_tap=True)
                await run.shot(pg, 'C_after_cafe')
                run.check('C 第一次見面：「歡迎光臨——喔，法律系的。」、選項有「檸檬塔。然後——妳是外文系的？」', any(t.startswith('歡迎光臨——喔，法律系的。') for t in lines) and bool(menus) and any('檸檬塔。然後——妳是外文系的？' in o for o in menus[0]), ' / '.join(t[:20] for t in lines[:3]) + ' ｜ ' + json.dumps(menus[:1], ensure_ascii=False))
            w = await who(pg, 'heroine_02')
            run.check('C 之後：記下 FIRST_MET、名字是林芷若', w['met'] and w['name'] == '林芷若', json.dumps(w, ensure_ascii=False))
            if w['met']:
                await pg.wait_for_timeout(1500); s = await L.state(pg)
                run.check('C 同一天再走到她前面：按鈕是「和林芷若說話」', s['interact'] == '和林芷若說話', s['interact'])
                if '說話' in s['interact']:
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
                    m = await menu(pg)
                    run.check('C 同一天再和她說話：她的事件一天一次，這次就是點餐（拿鐵、手沖咖啡、檸檬塔、不用了）', any(o.startswith('拿鐵') for o in m) and any(o.startswith('檸檬塔') for o in m) and '不用了' in m, json.dumps(m, ensure_ascii=False))
                    if '不用了' in m:
                        await L.tap(pg, cdp, '#choices button:last-child'); await pg.wait_for_timeout(1500)
        # ---------- D：總圖門口，不下雨 ----------
        run.setup('讀檔：第 5 天（9/21 週日）17:30、晴天，校園總圖前 (81,12)；還沒見過陳語彤')
        await L.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'day': 5, 'weekday': 0, 'weather': 'clear', 'pos': {'x': 81, 'z': 12, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(5000)
        started = await walk_until_dialog(pg, cdp, run, 81, 2.5, '總圖門口', wait_s=180)   # random_weight 20：每次檢查 1/3（SwiftShader 7–30 秒檢查一次）
        lines, menus = await play_dialog(pg, cdp) if started else ([], [])
        await run.shot(pg, 'D_after_door')
        w = await who(pg, 'heroine_03')
        run.check('D 走到總圖門口：自動開始「總圖門口」（不下雨的版本），記下 FIRST_MET', started and any(t.startswith('總圖門口有個女生一直在看手機') for t in lines) and w['met'] and 'ev_library_door_phone' in w['done'], ' / '.join(t[:20] for t in lines[:3]) + ' ' + json.dumps(w, ensure_ascii=False))
        # ---------- D2：接著 D 的存檔，隔天晚上下雨 ----------
        snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
        st = json.loads(snap); st.update({'day': 6, 'weekday': 1, 'hour': 18.5, 'weather': 'rain', 'zone': 'campus', 'pos': {'x': 81, 'z': 12, 'yaw': 3.14, 'lv': 0}})
        run.setup('接著 D 的存檔（已經在總圖門口見過語彤）：改成第 6 天（9/22 週一）18:30、下雨，校園總圖前 (81,12)')
        await L.load_state(pg, st)
        await pg.wait_for_timeout(5000)
        started = await walk_until_dialog(pg, cdp, run, 81, 2.5, '總圖門口（下雨）', max_s=200)
        if not started:
            await pg.wait_for_timeout(15000); q = await L.state(pg); started = bool(q['dlg'] or q['choices'])
        lines, _ = await play_dialog(pg, cdp) if started else ([], [])
        w = await who(pg, 'heroine_03')
        run.check('D2 已經見過語彤：下雨天走到總圖門口不會再演一次初遇（ev_rain_library_door 沒播）', not any('屋簷下站著一個人' in t for t in lines) and 'ev_rain_library_door' not in w['done'], ' / '.join(t[:20] for t in lines[:2]) + ' ' + json.dumps(w['done'], ensure_ascii=False))
        # ---------- E：總圖門口，下雨、還沒見過 ----------
        run.setup('讀檔：第 6 天（9/22 週一）18:30、下雨，校園總圖前 (81,12)；還沒見過陳語彤')
        await L.load_state(pg, {'zone': 'campus', 'hour': 18.5, 'day': 6, 'weekday': 1, 'weather': 'rain', 'pos': {'x': 81, 'z': 12, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(5000)
        started = await walk_until_dialog(pg, cdp, run, 81, 2.5, '總圖門口（下雨）')
        lines, menus = await play_dialog(pg, cdp) if started else ([], [])
        await run.shot(pg, 'E_after_rain')
        w = await who(pg, 'heroine_03')
        run.check('E 下雨天、還沒見過：下雨版當第一次見面（「總圖門口的屋簷下站著一個人……」），記下 FIRST_MET', started and any(t.startswith('總圖門口的屋簷下站著一個人') for t in lines) and w['met'], ' / '.join(t[:20] for t in lines[:3]) + ' ' + json.dumps(w, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))


asyncio.run(main())
