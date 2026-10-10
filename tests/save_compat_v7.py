"""舊存檔相容（2026-10-10 第一次正式發布 v9 時加）：線上原本是 v7，玩家瀏覽器裡的存檔（localStorage fatiao3d_*）是 v7 寫的。
同一個網址升級後，新版必須讀得進這些存檔，而且不能在標題畫面把它蓋掉。
1. 開 v7（main 的舊版，另開 server）：開新遊戲、把開場的對話與選項點完、自動存檔 → 取出 v7 真正寫出來的存檔
2. 用同一份 v7 存檔，換成 v7 各區域「v7 走得到」的位置（每區抽 6 點；新版的校園、公館、溫州街配置都改過）
3. 開新版，啟動前把 v7 存檔放進 localStorage（模擬同一個網址升級）：
   - 標題畫面停 8 秒：自動存檔不能被改寫（v7 的舊 bug：標題畫面會用空白第一天蓋掉進度）
   - 按「繼續（自動存檔）」：讀得進來、名字／天數／時間／地點／金錢／旗標／關係都一樣、站得住、走得動
   - 讀欄位 1、讀每一個抽樣位置：讀得進來、站得住、附近走得到；全程沒有 JS 例外
用法：python3 tests/save_compat_v7.py V7_URL NEW_URL   （例：http://127.0.0.1:8791/index.html http://127.0.0.1:8790/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright

V7, NEW = sys.argv[1], sys.argv[2]
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
SAMPLE_ZONES = ['campus', 'gongguan', 'wenzhou', 'dorm', 'classroom', 'cafe', 'wancai', 'library']

LOADED = "!!(typeof GAME!=='undefined'&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"
# 對話就點下一句、有選項就選第一個（和玩家一樣按畫面）
ADVANCE = """(()=>{ const D=GAME.D; if(D&&D.active){ GAME.dlgAdvance(); return 'dlg'; } const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')){ const b=ch.querySelector('button'); if(b){ b.click(); return 'choice'; } } return GAME.E&&GAME.E.player&&GAME.E.player.busy?'busy':'free'; })()"""
STATE = """(()=>{ const E=GAME.E, o=E.player.obj.position; const stand=E.canStand?E.canStand(o.x,o.z,0.3):E.nav.free(o.x,o.z);
  let walk=false; for(const [dx,dz] of [[3,0],[-3,0],[0,3],[0,-3],[2,2],[-2,-2]]){ const q=E.nav.nearestFree(o.x+dx,o.z+dz,1.5); if(q){ const p=E.nav.path(o.x,o.z,q[0],q[1]); if(p&&p.length){ walk=true; break; } } }
  return {zone:GAME.G.zone, x:+o.x.toFixed(2), z:+o.z.toFixed(2), stand, walk}; })()"""


async def wait_loaded(pg):
    for i in range(360):
        if await pg.evaluate(LOADED): return True
        await pg.wait_for_timeout(500)
    return False


async def main():
    fails = []
    def check(name, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''), flush=True)
        if not ok: fails.append(name)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        # ---- 1. v7 ----
        c7 = await b.new_context(viewport={'width': 844, 'height': 390}); pg = await c7.new_page(); e7 = []
        pg.on('pageerror', lambda e: e7.append(str(e)))
        await pg.goto(V7 + '?turbo'); check('v7 載入', await wait_loaded(pg))
        await pg.fill('#nameInput', '舊版玩家'); await pg.click('#btnNew')
        free = 0; steps = {'dlg': 0, 'choice': 0}
        for i in range(400):
            r = await pg.evaluate(ADVANCE)
            if r in steps: steps[r] += 1
            free = free + 1 if r == 'free' else 0
            if free >= 6 and await pg.evaluate("!!(GAME.running&&GAME.G&&GAME.G.zone)"): break
            await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const q=GAME.E.nav.nearestFree(P.x+1.5,P.z+1,2); if(q){ P.x=q[0]; P.z=q[1]; } })()")   # 存檔位置不要剛好是出生點
        await pg.evaluate("GAME.autosave()")
        auto = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        a7 = json.loads(auto) if auto else None
        check('v7 開新遊戲、點完開場、寫出自動存檔', bool(a7), f'點了 {steps["dlg"]} 句對話、{steps["choice"]} 個選項；存檔：' + (json.dumps({k: a7[k] for k in ['name', 'day', 'hour', 'zone', 'pos', 'money', 'v']}, ensure_ascii=False) if a7 else '無'))
        if not a7:
            await b.close(); print('FAILED: 拿不到 v7 存檔'); sys.exit(1)
        # v7 各區域裡 v7 走得到的位置
        samples = []
        for z in SAMPLE_ZONES:
            st = dict(a7, zone=z, pos=None, hour=11.0)
            pts = await pg.evaluate("""(async(st)=>{ EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(st);
                const E=GAME.E, N=E.nav, o=E.player.obj.position; const free=[]; for(let i=0;i<N.cols*N.rows;i++){ if(!N.b[i]) free.push(i); }
                const out=[]; const k=Math.max(1,Math.floor(free.length/40)); for(let j=0;j<free.length&&out.length<6;j+=k){ const i=free[(j*7919)%free.length]; const cx=i%N.cols, cz=Math.floor(i/N.cols); const w=N.toWorld(cx,cz); const pth=N.path(o.x,o.z,w[0],w[1]); if(pth&&pth.length) out.push([+w[0].toFixed(2),+w[1].toFixed(2)]); }
                return out; })(""" + json.dumps(st) + ")")   # JS 裡有 % 運算，不能用 Python 的 % 格式化
            await pg.wait_for_timeout(1500)
            samples += [(z, x, zz) for x, zz in pts]
        check('v7 每個區域抽到「v7 走得到」的位置', len(samples) >= len(SAMPLE_ZONES) * 4, f'{len(samples)} 個')
        check('v7 沒有 JS 例外', not e7, json.dumps(e7[:3], ensure_ascii=False))
        await c7.close()
        # ---- 2. 新版：同一個網址升級（啟動前 localStorage 裡已經有 v7 的存檔）----
        cn = await b.new_context(viewport={'width': 844, 'height': 390}); en = []
        await cn.add_init_script("""(()=>{ try{ if(!localStorage.getItem('__compat_seeded')){ localStorage.setItem('fatiao3d_auto',%s); localStorage.setItem('fatiao3d_slot_1',%s); localStorage.setItem('__compat_seeded','1'); } }catch(e){} })()""" % (json.dumps(auto), json.dumps(auto)))
        pg = await cn.new_page(); pg.on('pageerror', lambda e: en.append(str(e)))
        await pg.goto(NEW + '?turbo'); check('新版載入', await wait_loaded(pg))
        t0 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        await pg.wait_for_timeout(8000)
        t1 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        check('標題畫面停 8 秒，v7 的自動存檔沒有被改寫', t0 == auto and t1 == auto)
        await pg.click('#btnContinue')
        for i in range(120):
            await pg.evaluate(ADVANCE)
            if await pg.evaluate("!!(GAME.running&&GAME.G&&GAME.G.zone===%s&&document.getElementById('titleScreen').classList.contains('hide'))" % json.dumps(a7['zone'])): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(2500)
        g = await pg.evaluate("(()=>{ const G=GAME.G; return {name:G.name, day:G.day, hour:G.hour, zone:G.zone, money:G.money, flags:G.flags, rel:G.rel, v:G.v}; })()")
        same = (g['name'] == a7['name'] and g['day'] == a7['day'] and abs(g['hour'] - a7['hour']) < 0.5 and g['zone'] == a7['zone'] and g['money'] == a7['money']
                and all(g['flags'].get(k) == v for k, v in a7['flags'].items()) and all(g['rel'].get(k) == v for k, v in a7['rel'].items()))
        check('按「繼續（自動存檔）」：名字、天數、時間、地點、金錢、旗標、關係和 v7 存檔一樣', same, json.dumps({k: g[k] for k in ['name', 'day', 'hour', 'zone', 'money', 'v']}, ensure_ascii=False))
        s = await pg.evaluate(STATE)
        check('讀進來站得住、走得動', s['stand'] and s['walk'], json.dumps(s, ensure_ascii=False))
        r = await pg.evaluate("(async()=>{ try{ await GAME.applySave(JSON.parse(localStorage.getItem('fatiao3d_slot_1'))); return 'ok'; }catch(e){ return String(e); } })()")
        await pg.wait_for_timeout(2000)
        check('讀 v7 的欄位 1', r == 'ok', r)
        await pg.evaluate("EVENTS.onEnter=()=>false; EVENTS.tick=()=>false;")
        bad = []
        for z, x, zz in samples:
            st = dict(a7, zone=z, pos={'x': x, 'z': zz, 'yaw': 0}, hour=11.0)
            r = await pg.evaluate("(async(st)=>{ try{ await GAME.applySave(st); return 'ok'; }catch(e){ return String(e); } })(%s)" % json.dumps(st))
            await pg.wait_for_timeout(1200)
            s = await pg.evaluate(STATE)
            ok = r == 'ok' and s['zone'] == z and s['stand'] and s['walk']
            moved = ((s['x'] - x) ** 2 + (s['z'] - zz) ** 2) ** 0.5
            print(f'  {"ok " if ok else "BAD"} {z:9s} v7 位置 ({x:7.2f},{zz:7.2f}) → 新版 ({s["x"]:7.2f},{s["z"]:7.2f})' + (f'  移了 {moved:.1f} m（v7 這裡現在是建築／牆）' if moved > 0.3 else '') + ('' if ok else '  ' + r + ' ' + json.dumps(s, ensure_ascii=False)), flush=True)
            if not ok: bad.append((z, x, zz))
        check(f'v7 各區域 {len(samples)} 個位置的存檔：新版都讀得進來、站得住、走得動', not bad, json.dumps(bad, ensure_ascii=False))
        check('新版沒有 JS 例外', not en, json.dumps(en[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
