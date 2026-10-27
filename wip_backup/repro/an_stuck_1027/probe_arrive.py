# 重現「約以安現在一起去阿鳳麵店 → 一起走到 → 吃」：從使用者存檔改出到麵店前的狀態（iv13 going、公館麵店門口、16:47），走進麵店，
# 像玩家一樣點對話；mode=plain 什麼都不做、mode=talk 進門後馬上跟以安說話（900 ms 內）、mode=reload 直接讀「在麵店裡、iv13 還是 going」的存檔（自動存檔的狀態）。
# 用法：python3 probe_arrive.py <base url> <mode> <輸出前綴>
import asyncio, json, sys, time, copy
sys.path.insert(0, '/tmp/claude-0/-home-user-Lawstudent/742ba598-1396-5e88-b31e-f2cb9e414c34/scratchpad/wt_anstuck/tests')
from playwright.async_api import async_playwright
import playlib as L

BASE, MODE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open('/tmp/claude-0/-home-user-Lawstudent/742ba598-1396-5e88-b31e-f2cb9e414c34/scratchpad/save_day14/save.json'))


def pre_state(zone):
    s = copy.deepcopy(SAVE); s.pop('_stuck', None)
    iv = [v for v in s['invites'] if v['id'] == 'iv13'][0]
    iv['state'] = 'going'; iv['h'] = 16.68; iv.pop('waitSeat', None)
    s['msgs'] = [m for m in s['msgs'] if not (m.get('iv') == 'iv13' and m['text'].startswith('和沈以安在'))]
    s['hour'] = 16.78 if zone == 'gongguan' else 16.81
    s['zone'] = zone
    s['pos'] = {'x': 0, 'z': 0, 'yaw': 0, 'lv': 0, 'y': 0} if zone == 'gongguan' else {'x': 0, 'z': 3.0, 'yaw': 3.14159, 'lv': 0, 'y': 0}
    return s


DBG_JS = """(()=>{ const D=GAME.D, E=GAME.E, P=E.player.obj.position; const an=E.npcs.find(m=>m.charId==='heroine_01'||m.id==='an');
  const ch=document.getElementById('choices');
  return {depth:D.busyDepth, who:D.busyWho.slice(), dlg:!!D.active, txt:(document.getElementById('dlgName').textContent||'')+'｜'+(document.getElementById('dlgText').textContent||'').slice(0,50),
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent.slice(0,24)):[], adv:typeof ADV!=='undefined'&&!!ADV.active, evr:EVENTS.running||null,
    busy:!!E.player.busy, zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(3), iv:(GAME.G.invites||[]).filter(v=>v.id==='iv13').map(v=>v.state+'@'+v.h)[0],
    an:an&&{beh:an.beh,d:+Math.hypot(an.obj.position.x-P.x,an.obj.position.z-P.z).toFixed(1),seat:!!an.seat,leaving:!!an.leaving}, stale:!!D.stale,
    last:(GAME.G.msgs||[]).slice(-1).map(m=>m.text)[0] }; })()"""


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p)
        logs = []
        pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:400]) if m.type in ('warning', 'error') else None)
        await pg.goto(BASE + '/index.html?turbo', timeout=120000)
        ok = await L.wait_loaded(pg, 240); print('loaded', ok, flush=True)
        await L.no_phone_auto(pg)
        st = pre_state('noodle' if MODE == 'reload' else 'gongguan')
        if MODE != 'reload':
            # 公館麵店門口：找進入阿鳳麵店的門，站在門口外面
            pass
        await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const r=document.getElementById('rotate'); if(r) r.classList.remove('want'); await GAME.applySave(s); })(%s)" % json.dumps(st))
        if MODE != 'reload':
            door = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='noodle'); return it&&[it.x,it.z]; })()")
            print('door', door, flush=True)
            await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; GAME.E.placeAt(P,x,z-1.5); })(%s)" % json.dumps(door))
        await pg.wait_for_timeout(2500)
        print('pre', json.dumps(await pg.evaluate(DBG_JS), ensure_ascii=False), flush=True)
        await pg.screenshot(path=OUT + '_0pre.png')
        if MODE != 'reload':
            await pg.evaluate("void GAME.enter('noodle',{x:0,z:3.4,yaw:Math.PI})")
            if MODE == 'talk':
                for k in range(40):
                    await pg.wait_for_timeout(100)
                    r = await pg.evaluate("(()=>{ if(GAME.G.zone!=='noodle') return 'wait'; const an=GAME.E.npcs.find(m=>m.charId==='heroine_01'); if(!an||!an.talk) return 'noan'; if(GAME.E.player.busy) return 'busy'; an.talk(an); return 'talk'; })()")
                    if r == 'talk' or r == 'busy': print('talk try', k, r, flush=True); break
        t0 = time.time(); idle_since = None; hist = []; stuck = False
        while time.time() - t0 < 240:
            s = await pg.evaluate(DBG_JS)
            key = json.dumps(s, ensure_ascii=False)
            if not hist or hist[-1] != key: hist.append(key); print(round(time.time() - t0, 1), key, flush=True)
            if s['ch']:
                await pg.evaluate("(()=>{ const b=document.querySelectorAll('#choices button'); const e=[...b].find(x=>!/算了|就這樣|不用了/.test(x.textContent))||b[b.length-1]; e&&e.click(); })()")
                idle_since = None
            elif s['dlg']:
                await L.tap(pg, cdp, '#dlg'); idle_since = None
            elif s['depth'] > 0:
                idle_since = idle_since or time.time()
                if time.time() - idle_since > 12: stuck = True; print('STUCK', key, flush=True); break
            else:
                if s['zone'] == 'noodle' and s['iv'] and not s['iv'].startswith('going') and not s['iv'].startswith('accepted'):
                    await pg.wait_for_timeout(4000); print('END', json.dumps(await pg.evaluate(DBG_JS), ensure_ascii=False), flush=True); break
                if MODE == 'reload' and time.time() - t0 > 30: print('END(reload 30s)', key, flush=True); break
            await pg.wait_for_timeout(450)
        await pg.screenshot(path=OUT + '_1end.png')
        # 結束後：以安還在不在跟、跟她說話有沒有「約她去…」
        await pg.wait_for_timeout(2000)
        print('after', json.dumps(await pg.evaluate(DBG_JS), ensure_ascii=False), flush=True)
        print('stuck', stuck)
        print('errs', errs[:5]); print('logs', [l for l in logs if 'Canvas2D' not in l][-20:])
        await b.close()

asyncio.run(main())
