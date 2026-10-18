"""START-WEEK 選 1 的舊存檔相容（使用者 2026-10-16 20:39 對 AA-B 第⑥點：「實際驗證舊存檔相容，不要只因為日曆支援較早的日期就認定沒問題」）。
同一個網址升級：玩家瀏覽器裡的存檔是線上 v9.9.1 寫的（沒有 MAIN_D1、主線第一天是 9/17）。
1. 開 v9.9.1（另開 server）：
   - 開新遊戲、點完開場、自動存檔＝第 1 天晚上（最常見的存檔）；
   - 用 v9.9.1 自己的讀檔＋自動存檔做出大一上第 3、4、6、9（期中）、12、16、18 週的存檔（主線第一、二天已經演完）；
   - 經濟系開局（?y0）點完開場，改成 2025-08-30 晚上（經濟系那年的最後幾天）再存檔。
2. 開新版（開發版），一個一個讀進來（[前置／捷徑]：用遊戲的 applySave 讀，標題畫面的「繼續」另外按一次真的按鈕）：
   - 天數、時間、地點、旗標都一樣；STORY.mainD1＝1（沒有 MAIN_D1）；
   - 讀進來不重播主線：沒有「第一天」「第二天」標題卡、對話框沒有自己跑出宿舍第一晚／民總的台詞；
   - 推進到隔天早上（STORY.sleepNow，[前置／捷徑]）：沒有 JS 例外、天數加一、沒有重播主線；
   - 經濟系 8/30：推進到 8/31 → 轉進法律系，第 1 天（9/17）宿舍（沒有 ?start1）；?start1 的話留在 8/31（第 −16 天，不倒退回新遊戲的 8/29）、MAIN_D1 −13。
用法：python3 tests/save_compat_start1.py OLD_URL NEW_URL [OUT]
   （例：http://127.0.0.1:8794/index.html http://127.0.0.1:8765/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

OLD, NEW = sys.argv[1], sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else '/tmp/save_compat_start1'
ADVANCE = """(()=>{ const D=GAME.D; if(D&&D.active){ GAME.dlgAdvance(); return 'dlg'; } const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')){ const b=ch.querySelector('button'); if(b){ b.click(); return 'choice'; } } return 'free'; })()"""
FLAGS12 = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}
# 第 1 天＝2025-09-17（三）。大一上第 N 週週一＝第 −15＋7(N−1) 天
STATES = [
    ('w3', {'zone': 'campus', 'day': 3, 'weekday': 5, 'hour': 10.5, 'pos': {'x': -38, 'z': 6, 'yaw': 0}}),       # 9/19（五）
    ('w4', {'zone': 'campus', 'day': 8, 'weekday': 3, 'hour': 12.2, 'pos': {'x': -38, 'z': 6, 'yaw': 0}}),       # 9/24（三）
    ('w6', {'zone': 'dorm', 'day': 21, 'weekday': 2, 'hour': 21.0, 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}}),      # 10/7（二）
    ('w9', {'zone': 'dorm', 'day': 43, 'weekday': 3, 'hour': 22.0, 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}}),      # 10/29（三）期中
    ('w12', {'zone': 'campus', 'day': 65, 'weekday': 4, 'hour': 16.0, 'pos': {'x': -38, 'z': 6, 'yaw': 0}}),     # 11/20（四）
    ('w16', {'zone': 'dorm', 'day': 90, 'weekday': 1, 'hour': 21.5, 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}}),     # 12/15（一）
    ('w18', {'zone': 'dorm', 'day': 108, 'weekday': 5, 'hour': 21.5, 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}}),    # 2026-01-02（五）
]
G_JS = "(()=>{ const G=GAME.G; return {day:G.day, hour:+G.hour.toFixed(2), zone:G.zone, stage:G.stage||'law', m1:STORY.mainD1?STORY.mainD1(G):null, mf:G.flags.MAIN_D1, ls:G.flags.LAW_START_DAY, opening:STORY.opening(G), intro:!!G.flags.introDone, metAn:!!G.flags.metAn}; })()"
HOOK = "(()=>{ window.__tc=[]; window.__says=[]; if(!GAME.__hooked){ GAME.__hooked=true; const t=GAME.titleCard; GAME.titleCard=function(a,b,ms){ window.__tc.push(String(a)); return t.call(this,a,b,ms); }; const s=GAME.say; GAME.say=function(w,txt,o){ window.__says.push(String(txt||'')); return s.call(this,w,txt,o); }; } })()"
MAIN_LINES = ['開學第三週', '你是', '案例影本放在桌上', '從課程網站印下來的案例', '第二天']


async def drain(pg, n=120, need_free=5):
    free = 0
    for _ in range(n):
        r = await pg.evaluate(ADVANCE)
        free = free + 1 if r == 'free' else 0
        if free >= need_free: return True
        await pg.wait_for_timeout(300)
    return False


async def main():
    run = L.Run('save_compat_start1', OUT)
    async with async_playwright() as p:
        # ---- 1. 舊版（線上 v9.9.1）做存檔 ----
        b, ctx, pg, cdp, eo = await L.launch(p, landscape=True)
        await pg.goto(OLD + '?turbo'); run.check('舊版載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.getElementById('titleScreen')||{}).textContent||''")
        run.check('這是 v9.9.1（標題畫面的版本字樣）', 'v9.9.1' in ver, ver[-40:])
        await pg.fill('#nameInput', '舊版玩家'); await pg.click('#btnNew')
        await drain(pg, 500, 6)
        await pg.evaluate("GAME.autosave()")
        saves = {'night1': await pg.evaluate("localStorage.getItem('fatiao3d_auto')")}
        a0 = json.loads(saves['night1']) if saves['night1'] else None
        run.check('舊版開新遊戲、點完開場、自動存檔（第 1 天晚上、沒有 MAIN_D1）', bool(a0) and a0.get('day') == 1 and 'MAIN_D1' not in (a0.get('flags') or {}),
                  json.dumps({k: a0.get(k) for k in ['day', 'hour', 'zone']} if a0 else {}, ensure_ascii=False))
        if not a0:
            await b.close(); sys.exit(run.finish())
        for key, st in STATES:
            s = json.loads(saves['night1']); s.update(st); s['flags'] = dict(s.get('flags') or {}, **FLAGS12)
            await pg.evaluate("(async(st)=>{ EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(st); })(%s)" % json.dumps(s))
            await pg.wait_for_timeout(2000)
            await pg.evaluate("GAME.autosave()")
            saves[key] = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        run.check('舊版做出大一上七個存檔', all(saves.get(k) for k, _ in STATES), ', '.join(f"{k}: 第 {json.loads(saves[k])['day']} 天" for k, _ in STATES if saves.get(k)))
        run.check('舊版沒有 JS 例外', not eo, json.dumps(eo[:3], ensure_ascii=False))
        await b.close()
        # 經濟系（?y0）：開局點完 E01，改到 2025-08-30 晚上
        b, ctx, pg, cdp, ey = await L.launch(p, landscape=True)
        await pg.goto(OLD + '?turbo&y0'); run.check('舊版（?y0）載入', await L.wait_loaded(pg))
        await pg.fill('#nameInput', '經濟系玩家'); await pg.click('#btnNewEcon')
        await drain(pg, 500, 6)
        g = await pg.evaluate(G_JS)
        run.check('舊版經濟系開局：stage econ、負的天數', g['stage'] == 'econ' and g['day'] < 0, json.dumps(g, ensure_ascii=False))
        err = None
        for _try in range(4):   # 經濟系開場剛演完，劇情流程可能還沒收尾：等空閒再套，套完確認日期（2026-10-16 重跑時第一次沒套上）
            await drain(pg, 40, 4)
            err = await pg.evaluate("(async()=>{ try{ const s=GAME.snapshot(); s.day=STORY.dayOfKey('2025-08-30'); s.weekday=6; s.hour=22.5; s.zone='dorm'; s.pos={x:0,z:2.4,yaw:3.14}; EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); return null; }catch(e){ return String(e&&e.message||e); } })()")
            await pg.wait_for_timeout(2000)
            if await pg.evaluate("GAME.G.day") == -17: break
        await pg.evaluate("GAME.autosave()")
        saves['econ830'] = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        e8 = json.loads(saves['econ830']) if saves['econ830'] else {}
        run.check('舊版經濟系 8/30 晚上的存檔', e8.get('stage') == 'econ' and e8.get('day') == -17, json.dumps({k: e8.get(k) for k in ['stage', 'day', 'hour', 'zone']}, ensure_ascii=False) + (f'　applySave：{err}' if err else ''))
        await b.close()

        # ---- 2. 新版：同一個網址升級，一個一個讀 ----
        async def open_new(q=''):
            b, ctx, pg, cdp, en = await L.launch(p, landscape=True)
            await ctx.add_init_script("(s=>{ try{ if(!localStorage.getItem('__compat_seeded')){ localStorage.setItem('fatiao3d_auto',s); localStorage.setItem('__compat_seeded','1'); } }catch(e){} })(%s)" % json.dumps(saves['night1']))
            await pg.goto(NEW + '?turbo' + q); ok = await L.wait_loaded(pg)
            return b, pg, en, ok
        b, pg, en, ok = await open_new()
        run.check('新版載入', ok)
        t0 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')"); await pg.wait_for_timeout(6000)
        run.check('標題畫面停 6 秒：舊版的自動存檔沒有被改寫', t0 == saves['night1'] and await pg.evaluate("localStorage.getItem('fatiao3d_auto')") == saves['night1'])
        await pg.evaluate(HOOK)
        await pg.click('#btnContinue'); await pg.wait_for_timeout(5000)
        g = await pg.evaluate(G_JS); tc = await pg.evaluate("window.__tc"); says = await pg.evaluate("window.__says")
        run.check('「繼續」（真的按鈕）讀第 1 天晚上：第 1 天、宿舍、mainD1＝1、沒有 MAIN_D1', g['day'] == 1 and g['zone'] == 'dorm' and g['m1'] == 1 and g['mf'] is None, json.dumps(g, ensure_ascii=False))
        run.check('第 1 天晚上讀進來不重播宿舍第一晚（沒有「第一天」標題卡、沒有開場旁白）', not tc and not any(any(m in s for m in MAIN_LINES) for s in says), json.dumps([tc, says[:4]], ensure_ascii=False))
        for key, st in [('night1', None)] + STATES:
            s = json.loads(saves[key])
            await pg.evaluate(HOOK)
            await pg.evaluate("(async(st)=>{ document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(st); })(%s)" % json.dumps(s))
            await pg.wait_for_timeout(3000)
            g = await pg.evaluate(G_JS)
            run.check(f'[前置／捷徑 applySave] {key}：天數、時間、地點照存檔，mainD1＝1', g['day'] == s['day'] and abs(g['hour'] - s['hour']) < 0.4 and g['zone'] == s['zone'] and g['m1'] == 1 and g['mf'] is None, json.dumps(g, ensure_ascii=False))
            d0 = g['day']
            await pg.evaluate("void STORY.sleepNow(GAME,7.5)")
            for _ in range(80):
                await pg.evaluate(ADVANCE); await pg.wait_for_timeout(300)
                if await pg.evaluate("GAME.G.day") > d0 and await pg.evaluate("!(GAME.D&&GAME.D.active)"): break
            await drain(pg, 60, 4)
            g2 = await pg.evaluate(G_JS); tc = await pg.evaluate("window.__tc"); says = await pg.evaluate("window.__says")
            if key == 'night1':   # 第 1 天晚上睡覺＝主線照常往下走到第二天（不是重播）：13:05 霖澤館前、「第二天」標題卡
                replay = [t for t in tc if t == '第一天'] + [x for x in says if any(m in x for m in ['開學第三週', '案例影本放在桌上', '從課程網站印下來的案例'])]
                run.check('[前置／捷徑 sleepNow] night1：睡到第 2 天，主線照常接「第二天」13:05 校園（舊局不變），沒有重播第一天', g2['day'] == 2 and tc.count('第二天') == 1 and g2['zone'] == 'campus' and abs(g2['hour'] - 13.05) < 0.3 and not replay, json.dumps([g2, tc, replay[:3]], ensure_ascii=False))
                continue
            replay = [t for t in tc if t in ('第一天', '第二天')] + [x for x in says if any(m in x for m in ['開學第三週', '案例影本放在桌上', '從課程網站印下來的案例'])]
            run.check(f'[前置／捷徑 sleepNow] {key}：睡到隔天早上，天數 +1、沒有重播主線', g2['day'] == d0 + 1 and not replay, json.dumps([g2, tc, replay[:3]], ensure_ascii=False))
        run.check('新版讀大一上存檔、推進一天：沒有 JS 例外', not en, json.dumps(en[:3], ensure_ascii=False))
        # 經濟系 8/30 → 法律系轉場：預設（CAMP-L1 以後＝原本的 ?start1）讀檔就轉、留在 8/30～8/31；?start0（舊開局）照舊睡到 8/31、第 1 天（9/17）
        for q, want in [('', {'day': -16, 'm1': -13}), ('&start0', {'day': 1, 'm1': 1})]:
            await pg.evaluate("(async(st)=>{ document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(st); })(%s)" % json.dumps(json.loads(saves['econ830'])))
            if q:
                await b.close(); b, pg, en, ok = await open_new(q)
                await pg.evaluate("(async(st)=>{ document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(st); })(%s)" % json.dumps(json.loads(saves['econ830'])))
            await pg.wait_for_timeout(2500)
            await pg.evaluate("void STORY.sleepNow(GAME,7.5)")
            for _ in range(200):
                await pg.evaluate(ADVANCE); await pg.wait_for_timeout(300)
                if await pg.evaluate("(GAME.G.stage||'law')==='law'&&!(GAME.D&&GAME.D.active)"): break
            await drain(pg, 120, 6)
            g = await pg.evaluate(G_JS)
            okday = g['day'] in (-17, -16) if not q else g['day'] == want['day']   # 預設：8/30 的經濟系存檔一讀進來就轉（8/29 已過），不倒退
            run.check(f"經濟系 8/30 存檔 → 轉進法律系{'（?start0 舊開局：睡到 8/31 才轉、第 1 天）' if q else '（預設：讀檔就轉，留在 8/30～8/31，不倒退回 8/29）'}：mainD1 {want['m1']}",
                      g['stage'] == 'law' and okday and g['m1'] == want['m1'] and g['zone'] == 'dorm', json.dumps(g, ensure_ascii=False))
            run.check(f"經濟系轉場{'（?start0）' if q else '（預設）'}沒有 JS 例外", not en, json.dumps(en[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
