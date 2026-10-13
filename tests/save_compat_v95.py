"""舊存檔相容：線上 v9.5（main，沒有課表、手機、邀約）的存檔，在開發版（課表、選課、手機、跳過時間、邀約、關係同步）讀得進來、照常玩（ChatGPT 審查第七點「新舊課表相容性測試」）。
同一個網址升級：玩家瀏覽器裡的 localStorage（fatiao3d_*）是 v9.5 寫的。
1. 開 v9.5（另開 server）：
   - 開新遊戲、點完開場、自動存檔＝最常見的存檔（第 1 天晚上）。
   - 再用 v9.5 自己的讀檔＋自動存檔做出三個 v9.5 格式的存檔（第 3 天上午校園、第 9 天中午公館、第 23 天晚上 Café）。
   - v9.5 的存檔沒有 courses、invites、msgs、habits、acts、social._relSync。
2. 開新版，啟動前把它們放進 localStorage（自動存檔＋欄位 1～3）：
   - 標題畫面停 8 秒：自動存檔不能被改寫；
   - 按「繼續（自動存檔）」、從標題「讀取」選單讀欄位 1～3（真的按鈕）：天數、時間、地點、名字、金錢、旗標、舊版關係都一樣，站得住；
   - 課表：手機「課表」是那一學期、那一週；今天的課照日曆；之前的天數沒有被補成「上過」；不會問選課；不會補發成績；
   - 關係：舊版關係同步到新版（只補一次）；
   - 跳過時間、存檔、再讀檔都正常；
   - 全程沒有 JS 例外。
用法：python3 tests/save_compat_v95.py V95_URL NEW_URL   （例：http://127.0.0.1:8769/index.html http://127.0.0.1:8768/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

V95, NEW = sys.argv[1], sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else '/tmp/save_compat_v95'
ADVANCE = """(()=>{ const D=GAME.D; if(D&&D.active){ GAME.dlgAdvance(); return 'dlg'; } const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')){ const b=ch.querySelector('button'); if(b){ b.click(); return 'choice'; } } return GAME.E&&GAME.E.player&&GAME.E.player.busy?'busy':'free'; })()"""
FLAGS12 = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}
# v9.5 裡做出來的狀態（第 1 天 9/17 週三）：第 3 天＝9/19 週五、第 9 天＝9/25 週四、第 23 天＝10/9 週四
STATES = [
    ('slot1', {'zone': 'campus', 'day': 3, 'weekday': 5, 'hour': 10.5, 'pos': {'x': -38, 'z': 6, 'yaw': 0}, 'flags': FLAGS12, 'rel': {'an': 22, 'zhe': 19, 'sis': 5, 'kai': 10, 'yu': 5}, 'money': 19300}),
    ('slot2', {'zone': 'gongguan', 'day': 9, 'weekday': 4, 'hour': 12.4, 'pos': None, 'flags': FLAGS12, 'rel': {'an': 25, 'zhe': 24, 'sis': 9, 'kai': 14, 'yu': 8}, 'money': 16850}),
    ('slot3', {'zone': 'cafe', 'day': 23, 'weekday': 4, 'hour': 20.2, 'pos': None, 'flags': FLAGS12, 'rel': {'an': 30, 'zhe': 28, 'sis': 12, 'kai': 18, 'yu': 11}, 'money': 9400}),
    # 方案 A（D55）把醉月湖往北搬、原本的湖南岸蓋了普通教學館：v9.5 玩家站在舊湖邊存檔，新版這個位置在普通教學館裡面
    ('lake', {'zone': 'campus', 'day': 5, 'weekday': 0, 'hour': 16.0, 'pos': {'x': -30, 'z': -53.5, 'yaw': 3.14}, 'flags': FLAGS12, 'rel': {'an': 22, 'zhe': 19, 'sis': 5, 'kai': 10, 'yu': 5}, 'money': 18000}),
]


async def main():
    run = L.Run('save_compat_v95', OUT)
    async with async_playwright() as p:
        # ---- 1. v9.5 ----
        b, ctx, pg, cdp, e95 = await L.launch(p, landscape=True)
        await pg.goto(V95 + '?turbo'); run.check('v9.5 載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.getElementById('titleScreen')||{}).textContent||''")
        run.check('這是 v9.5（標題畫面的版本字樣）', 'v9.5' in ver, ver[-40:])
        await pg.fill('#nameInput', '舊版玩家'); await pg.click('#btnNew')
        free = 0; n = {'dlg': 0, 'choice': 0}
        for i in range(400):
            r = await pg.evaluate(ADVANCE)
            if r in n: n[r] += 1
            free = free + 1 if r == 'free' else 0
            if free >= 6 and await pg.evaluate("!!(GAME.running&&GAME.G&&GAME.G.zone)"): break
            await pg.wait_for_timeout(400)
        await pg.evaluate("GAME.autosave()")
        saves = {'auto': await pg.evaluate("localStorage.getItem('fatiao3d_auto')")}
        a0 = json.loads(saves['auto']) if saves['auto'] else None
        run.check('v9.5 開新遊戲、點完開場、寫出自動存檔', bool(a0), f"對話 {n['dlg']} 句、選項 {n['choice']} 個；" + (json.dumps({k: a0.get(k) for k in ['v', 'name', 'day', 'hour', 'zone', 'money']}, ensure_ascii=False) if a0 else '無'))
        if not a0:
            await b.close(); sys.exit(run.finish())
        run.check('v9.5 的存檔沒有新版的欄位（courses、invites、msgs、acts）', not any(k in a0 for k in ['courses', 'invites', 'msgs', 'acts']), ','.join(sorted(a0.keys())))
        for key, st in STATES:
            s = dict(a0); s.update(st)
            await pg.evaluate("(async(st)=>{ EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(st); })(%s)" % json.dumps(s))
            await pg.wait_for_timeout(2500)
            await pg.evaluate("GAME.autosave()")
            saves[key] = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        lk = json.loads(saves['lake']) if saves.get('lake') else {}
        run.check('v9.5 舊湖邊（-30,-53.5）是 v9.5 走得到的地方', bool(lk) and abs((lk.get('pos') or {}).get('x', 0) + 30) < 1.5 and abs((lk.get('pos') or {}).get('z', 0) + 53.5) < 1.5, json.dumps(lk.get('pos')))
        run.check('v9.5 做出四個存檔（v9.5 自己寫的格式）', all(saves.get(k) for k, _ in STATES), ', '.join(f"{k}: 第 {json.loads(saves[k])['day']} 天 {json.loads(saves[k])['zone']}" for k, _ in STATES if saves.get(k)))
        run.check('v9.5 沒有 JS 例外', not e95, json.dumps(e95[:3], ensure_ascii=False))
        await b.close()
        # ---- 2. 新版：同一個網址升級 ----
        b, ctx, pg, cdp, en = await L.launch(p, landscape=True)
        seed = {'fatiao3d_auto': saves['auto'], 'fatiao3d_slot_1': saves['slot1'], 'fatiao3d_slot_2': saves['slot2'], 'fatiao3d_slot_3': saves['slot3']}
        await ctx.add_init_script("(s=>{ try{ if(!localStorage.getItem('__compat_seeded')){ for(const k in s) localStorage.setItem(k,s[k]); localStorage.setItem('__compat_seeded','1'); } }catch(e){} })(%s)" % json.dumps(seed))
        await pg.goto(NEW); run.check('新版載入', await L.wait_loaded(pg))
        t0 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        await pg.wait_for_timeout(8000)
        t1 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        run.check('標題畫面停 8 秒：v9.5 的自動存檔沒有被改寫', t0 == saves['auto'] and t1 == saves['auto'])
        G_JS = "(()=>{ const G=GAME.G, R=G.courses||{}; return {name:G.name, day:G.day, hour:+G.hour.toFixed(2), zone:G.zone, money:G.money, flags:G.flags, rel:G.rel, v:G.v, done:Object.keys(R.done||{}).length, attend:R.attend||{}, grades:Object.keys(R.grades||{}), el:R.electives||{}, sync:!!(G.social&&G.social._relSync), zheFam:(G.social&&G.social.rel&&G.social.rel.zhe||{}).fam }; })()"

        def same(g, a):
            return (g['name'] == a['name'] and g['day'] == a['day'] and abs(g['hour'] - a['hour']) < 0.3 and g['zone'] == a['zone'] and g['money'] == a['money']
                    and all(g['flags'].get(k) == v for k, v in a['flags'].items()) and all(g['rel'].get(k) == v for k, v in a['rel'].items()))
        # 繼續（自動存檔）
        await L.tap(pg, cdp, '#btnContinue')
        for i in range(60):
            if await pg.evaluate("!!(GAME.running&&GAME.G&&GAME.G.zone===%s&&document.getElementById('titleScreen').classList.contains('hide'))" % json.dumps(a0['zone'])): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(3000)
        for i in range(60):   # 第一天的劇情如果接著演（還沒讀案例、睡覺前的對話），點完
            r = await pg.evaluate(ADVANCE)
            if r == 'free': break
            await pg.wait_for_timeout(500)
        g = await pg.evaluate(G_JS); s = await L.state(pg)
        run.check('按「繼續（自動存檔）」：名字、天數、時間、地點、金錢、旗標、舊版關係和 v9.5 存檔一樣、站得住', same(g, a0) and s['stand'], json.dumps({k: g[k] for k in ['name', 'day', 'hour', 'zone', 'money', 'v']}, ensure_ascii=False))
        await run.shot(pg, 'auto_day1')
        # 欄位 1～3：從標題畫面的「讀取」選單（真的按鈕）
        for idx, (key, st) in enumerate(STATES[:3], start=1):
            a = json.loads(saves[key])
            await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
            await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
            c = await pg.evaluate("(i=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(d=>(d.querySelector('b')||{}).textContent===('欄位 '+i)); if(!it) return null; const b=[...it.querySelectorAll('button')].find(x=>x.textContent==='讀取'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % idx)
            run.check(f'欄位 {idx}：標題「讀取」選單裡有 v9.5 的存檔（第 {a["day"]} 天）', bool(c))
            if not c: continue
            await L.touch_tap(cdp, c[0], c[1])
            for i in range(60):
                if await pg.evaluate("!!(GAME.running&&GAME.G&&GAME.G.day===%d&&document.getElementById('titleScreen').classList.contains('hide'))" % a['day']): break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(3500)
            g = await pg.evaluate(G_JS); s = await L.state(pg)
            run.check(f'欄位 {idx}（第 {a["day"]} 天 {a["zone"]}）：讀得進來、各欄位一樣、站得住', same(g, a) and s['stand'], json.dumps({k: g[k] for k in ['day', 'hour', 'zone', 'money']}, ensure_ascii=False) + f" stand={s['stand']}")
            run.check(f'欄位 {idx}：課表紀錄是新的（之前的天數沒有補成上過、沒有成績、沒有選課）', g['done'] == 0 and not g['attend'] and not g['grades'] and not g['el'], json.dumps({k: g[k] for k in ['done', 'attend', 'grades', 'el']}, ensure_ascii=False))
            run.check(f'欄位 {idx}：舊版關係同步到新版（只補一次）：阿哲熟悉度 ≥ 舊版 {a["rel"]["zhe"]}', g['sync'] and (g['zheFam'] or 0) >= a['rel']['zhe'], f"sync={g['sync']} fam={g['zheFam']}")
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="week"]'); await pg.wait_for_timeout(800)
            wk = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
            week = (a['day'] - 1 + 2) // 7 + 3   # 第 1 天＝大一上第 3 週週三
            run.check(f'欄位 {idx}：手機「課表」是大一上第 {week} 週', '大一上' in wk and f'第 {week} 週' in wk, wk[:80])
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(800)
            td = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
            await run.shot(pg, f'slot{idx}_phone_today')
            run.check(f'欄位 {idx}：手機「今天」照日曆列課（週{"一二三四五六日"[a["weekday"] - 1] if a["weekday"] else "日"}）', ('09:10' in td or '13:20' in td or '今天沒有課' in td), td[:160])
            await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600)
        # 方案 A：v9.5 在舊湖邊的存檔（新版是普通教學館裡面）→ 讀檔時移到最近站得住的地方、走得到普通的門口
        r = await pg.evaluate("(async(s)=>{ try{ await GAME.applySave(s); return 'ok'; }catch(e){ return String(e); } })(%s)" % saves['lake'])
        await pg.wait_for_timeout(3500)
        s = await L.state(pg)
        walk = await pg.evaluate("(()=>{ const N=GAME.E.nav, o=GAME.E.player.obj.position; const p=N.path(o.x,o.z,-38,-48.6); return !!(p&&p.length); })()")
        moved = ((s['x'] + 30) ** 2 + (s['z'] + 53.5) ** 2) ** 0.5
        run.check('方案 A：v9.5 在舊湖邊的存檔（新版是普通教學館裡面）讀得進來、移到旁邊站得住的地方（15 m 內）、走得到普通的門口', r == 'ok' and s['zone'] == 'campus' and s['stand'] and moved < 15 and walk, f"r={r} 位置 ({s['x']},{s['z']})、移了 {moved:.1f} m、walk={walk}")
        await run.shot(pg, 'lake_save_unstuck')
        await pg.evaluate("(async(s)=>{ await GAME.applySave(s); })(%s)" % saves['slot3']); await pg.wait_for_timeout(3000)
        # 存檔、再讀檔。課表紀錄（courses）是課表系統第一次用到時才建（classes3d.js 的 rec；每 30 幀的 tick）：真機 60 fps 讀檔後半秒就有，
        # 這台 SwiftShader 約 1 fps，3 秒只過了幾幀——等它真的建起來（最多 90 秒）再存，不是放寬條件（2026-10-13 v9.6 回歸：3 秒時還沒建，誤判）
        for _ in range(90):
            if await pg.evaluate("!!(GAME.G&&GAME.G.courses)"): break
            await pg.wait_for_timeout(1000)
        await pg.evaluate("GAME.autosave()")
        sv = await pg.evaluate("JSON.parse(localStorage.getItem('fatiao3d_auto'))")
        run.check('新版存檔：有 courses、v 是新版、v9.5 的欄位都還在', bool(sv) and 'courses' in sv and all(k in sv for k in a0.keys()), ','.join(sorted(set(a0.keys()) - set(sv.keys()))) if sv else '無')
        await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(6000)
        g = await pg.evaluate(G_JS)
        run.check('重新整理 → 繼續：讀回新版存檔（第 23 天 Café）', g['day'] == 23 and g['zone'] == 'cafe', json.dumps({k: g[k] for k in ['day', 'zone', 'hour']}, ensure_ascii=False))
        run.check('新版沒有 JS 例外', not en, json.dumps(en[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
