"""發布檢查（2026-10-10 第一次正式發布 v9 時加）：用 GitHub Pages 會發布的同一組檔案（乾淨 checkout：git worktree add）或線上網址，
載入遊戲、依序進入全部 11 個區域，列出：
- 載入失敗的資源（HTTP 4xx/5xx、連線失敗）——本機有、但沒有 commit 的檔案，線上就是 404，人物會退回 placeholder
- JS 例外、console error
- script 網址有沒有帶版本號（?v=，避免 GitHub Pages 10 分鐘快取混用新舊 js）、標題畫面的版本字樣
- 玩家與 NPC 是不是正式 VRM（CHAR.failures：載入失敗退回 placeholder 的模型）
用法：python3 tests/deploy_check.py URL [預期版本字樣]   （URL 例：http://127.0.0.1:8790/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
WANT_VER = sys.argv[2] if len(sys.argv) > 2 else None
ZONES = ['campus', 'gongguan', 'wenzhou', 'classroom', 'wancai', 'library', 'cafe', 'cvs', 'noodle', 'bookstore', 'dorm']
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}


async def main():
    fails = []
    def check(name, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''), flush=True)
        if not ok: fails.append(name)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        bad, errs, cerrs, reqs = [], [], [], []
        pg.on('response', lambda r: bad.append((r.status, r.url)) if r.status >= 400 else None)
        pg.on('requestfailed', lambda r: bad.append(('FAILED ' + str(r.failure), r.url)))
        pg.on('request', lambda r: reqs.append(r.url))
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: cerrs.append(m.text) if m.type == 'error' else None)
        await pg.goto(URL + ('&' if '?' in URL else '?') + 'turbo')
        ok = False
        for i in range(360):
            if await pg.evaluate("!!(typeof GAME!=='undefined'&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): ok = True; break
            await pg.wait_for_timeout(500)
        check('遊戲載入完成（載入畫面消失）', ok)
        info = await pg.evaluate("""(()=>{ const v=document.getElementById('verLabel'); const ss=[...document.scripts].map(s=>s.getAttribute('src')).filter(Boolean);
            return {ver:v?v.textContent:null, title:!document.getElementById('titleScreen').classList.contains('hide'), scripts:ss.length, noVer:ss.filter(s=>!/[?&]v=/.test(s))}; })()""")
        check('標題畫面顯示', info['title'])
        check('標題畫面有版本字樣' + (f'（預期含「{WANT_VER}」）' if WANT_VER else ''), bool(info['ver']) and (WANT_VER is None or WANT_VER in info['ver']), str(info['ver']))
        check(f'{info["scripts"]} 個 script 都帶版本號 ?v=', not info['noVer'], json.dumps(info['noVer'], ensure_ascii=False))
        for z in ZONES:
            st = {'zone': z, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': None, 'flags': FLAGS}
            r = await pg.evaluate("""(async(st)=>{ try{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); return {ok:GAME.G.zone===st.zone}; }catch(e){ return {ok:false, err:String(e)}; } })(%s)""" % json.dumps(st))
            await pg.wait_for_timeout(2500)
            d = await pg.evaluate("""(()=>{ const E=GAME.E; const drv=o=>{ let d=null; o.traverse(c=>{ if(!d&&c.userData&&c.userData.driver) d=c.userData.driver; }); return d||'none'; };
                const npc={}; for(const n of E.npcs){ const k=drv(n.obj); npc[k]=(npc[k]||0)+1; } return {player:drv(E.player.obj), npc}; })()""")
            check(f'進入 {z}', r.get('ok'), json.dumps(dict(r, **d), ensure_ascii=False))
            if z == 'campus': check('玩家是正式 VRM（不是 placeholder）', d['player'] == 'vrm', d['player'])
        cf = await pg.evaluate("(window.CHAR&&CHAR.failures||[]).slice(0,20)")
        check('沒有退回 placeholder 的人物模型（CHAR.failures）', not cf, json.dumps(cf, ensure_ascii=False))
        uniq = sorted(set((str(s), u) for s, u in bad))
        check(f'所有資源都載得到（共 {len(set(reqs))} 個網址）', not uniq, '\n      ' + '\n      '.join(f'{s} {u}' for s, u in uniq[:30]))
        check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        print('console error（只列出，不算失敗）：' + (json.dumps(cerrs[:8], ensure_ascii=False) if cerrs else '無'), flush=True)
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
