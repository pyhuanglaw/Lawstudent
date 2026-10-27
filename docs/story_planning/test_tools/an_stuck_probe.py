"""BB-C 10-27：AN-MEAL-STUCK-1027（使用者 20:3x 回報「跟沈以安吃完飯卡住在她說話的畫面」）玩家操作版。
底：使用者存檔 wip_backup/saves/fatiao3d_save_day14_1027.json（法律系 day 14）；改法照 LAWWW-C 子代理 wip_backup/repro/an_stuck_1027（dc1a836d0）。
【前置】iv13（和沈以安約在阿鳳麵店，now＝一起走過去）改回 going、h 16.68，拿掉「和沈以安在…」那一則，16:47 公館、站在麵店門口外 1.5 m。
之後都是玩家操作：觸控「進入阿鳳麵店」的互動按鈕 → 進門以後
  MODE=talk ：互動按鈕一出現「和沈以安說話」就按（使用者的情況；越快越好，記下進門後幾毫秒按到）
  MODE=plain：什麼都不按，對話照點
  MODE=reload：【前置】直接讀「已經在麵店裡、iv13 還是 going」的存檔（＝走進門那一刻的自動存檔）
  MODE=user  ：讀使用者原本的存檔（day 14 17:33 麵店）
檢查：12 秒以上「對話框沒有、選項沒有、還在忙（busyDepth>0）」＝卡住；吃完以後她不再跟著（beh 不是 follow、離玩家越來越遠或回作息）；iv13 不是 going。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests MODE=talk python3 an_stuck_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]; MODE = os.environ.get('MODE', 'talk')
SAVE = json.load(open(SAVEF, encoding='utf-8'))
def pre_state(zone):
    s = copy.deepcopy(SAVE); s.pop('_stuck', None)
    iv = [v for v in s['invites'] if v['id'] == 'iv13'][0]; iv['state'] = 'going'; iv['h'] = 16.68; iv.pop('waitSeat', None)
    s['msgs'] = [m for m in s['msgs'] if not (m.get('iv') == 'iv13' and str(m.get('text', '')).startswith('和沈以安在'))]
    s['hour'] = 16.78 if zone == 'gongguan' else 16.81; s['zone'] = zone
    s['pos'] = {'x': 0, 'z': 0, 'yaw': 0, 'lv': 0, 'y': 0} if zone == 'gongguan' else {'x': 0, 'z': 3.0, 'yaw': 3.14159, 'lv': 0, 'y': 0}
    return s
DBG = """(()=>{ const D=GAME.D, E=GAME.E, P=E.player.obj.position; const an=E.npcs.find(m=>m.charId==='heroine_01'||m.id==='an');
  const ch=document.getElementById('choices'), it=document.getElementById('interact');
  return {depth:D.busyDepth, dlg:!!D.active, txt:(document.getElementById('dlgName').textContent||'')+'｜'+(document.getElementById('dlgText').textContent||'').slice(0,40),
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent.slice(0,20)):[], busy:!!E.player.busy, zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(3),
    iv:(GAME.G.invites||[]).filter(v=>v.id==='iv13').map(v=>v.state)[0], it:(it&&!it.classList.contains('hide'))?(document.getElementById('interactLabel').textContent||''):'',
    an:an&&{beh:an.beh,d:+Math.hypot(an.obj.position.x-P.x,an.obj.position.z-P.z).toFixed(1)} }; })()"""
async def main():
    run = L.Run('anstuck_' + MODE, OUT); os.makedirs(OUT, exist_ok=True); sha = os.environ.get('SHA', '?')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        if MODE == 'user': st = copy.deepcopy(SAVE); run.setup('讀使用者原本的存檔（day 14 17:33 麵店）')
        else:
            st = pre_state('noodle' if MODE == 'reload' else 'gongguan')
            run.setup('[前置] iv13 改回 going、16:47 %s' % ('已經在麵店裡（＝進門那一刻的自動存檔）' if MODE == 'reload' else '公館麵店門口外'))
        await L.load_state(pg, st); await pg.wait_for_timeout(5000)
        await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()")
        talk_ms = None
        if MODE in ('talk', 'plain'):
            door = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='noodle'); return it&&[it.x,it.z,it.label]; })()")
            run.note('麵店的門 %s' % door)
            await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; GAME.E.placeAt(P,x,z-1.5); })(%s)" % json.dumps(door[:2])); run.setup('[前置] 站在門口外 1.5 m')
            await pg.wait_for_timeout(2500)
            ok = await L.go_to(pg, cdp, run, door[0], door[1], 0.9, door[2] or '麵店的門', max_s=120)
            for k in range(20):
                s = await pg.evaluate(DBG)
                if s['it'] and ('麵店' in s['it'] or '進' in s['it']): break
                await pg.wait_for_timeout(300)
            if MODE == 'talk':
                # 【捷徑】進門後「和沈以安說話」一出現就按：SwiftShader 1–4 fps，從 Python 觸控（每次 evaluate 幾百 ms）趕不上 S.arrive 那 0.9 秒（第一版 f54 talk1 按到的時候見面已經開始）；
                # 改成頁面裡每 20 ms 看一次互動鍵，看到就 click（同一個 onclick＝doInteract，玩家手指點按鈕會走的路），只在進門 4 秒內
                await pg.evaluate("""(()=>{ window.__bbTalk=null; window.__bbT0=null; window.__bbSeen=[]; let last=''; const iv=setInterval(()=>{ try{ if(GAME.G.zone!=='noodle') return; const now=performance.now(); if(window.__bbT0==null) window.__bbT0=now; if(now-window.__bbT0>4000){ clearInterval(iv); return; }
                  const b=document.getElementById('interact'), l=(document.getElementById('interactLabel').textContent||''), an=GAME.E.npcs.find(m=>m.charId==='heroine_01');
                  const k=[b&&b.classList.contains('hide')?'hide':'show', l, 'busy='+!!GAME.E.player.busy, 'depth='+GAME.D.busyDepth, 'dlg='+!!GAME.D.active, 'an='+(an?an.beh:'-')].join(' ');
                  if(k!==last){ last=k; window.__bbSeen.push(Math.round(now-window.__bbT0)+'ms '+k); }
                  if(window.__bbFcall&&an&&an.talk&&!GAME.E.player.busy){ window.__bbTalk={ms:Math.round(now-window.__bbT0),label:'(an.talk 直接呼叫) '+l,depth:GAME.D.busyDepth}; an.talk(an); clearInterval(iv); return; }
                  if(b&&!b.classList.contains('hide')&&/沈以安/.test(l)){ window.__bbTalk={ms:Math.round(now-window.__bbT0),label:l,depth:GAME.D.busyDepth}; b.click(); clearInterval(iv); } }catch(e){} },20); })()""".replace('window.__bbTalk=null;', 'window.__bbTalk=null; window.__bbFcall=%s;' % ('true' if os.environ.get('FCALL') else 'false')))
                run.setup('[捷徑] 進門後互動鍵一出現「和沈以安說話」就由頁面內 click（20 ms 檢查一次）' + ('；FCALL＝不等互動鍵，玩家空著就直接呼叫 an.talk（同 LAWWW-C 子代理 probe_arrive.py）' if os.environ.get('FCALL') else ''))
            run.note('互動按鈕：%s' % s['it']); await L.tap(pg, cdp, '#interact'); t_in = None
            for k in range(60):
                s = await pg.evaluate(DBG)
                if s['zone'] == 'noodle':
                    t_in = t_in or time.time()
                    if MODE == 'talk':
                        tk = await pg.evaluate("window.__bbTalk")
                        if tk: talk_ms = tk['ms']; run.note('進門後 %d ms 按到「%s」（按的時候 busyDepth %s）' % (talk_ms, tk['label'], tk['depth'])); break
                    if MODE == 'plain' or (t_in and time.time() - t_in > 5): break
                await pg.wait_for_timeout(80)
            if MODE == 'talk':
                await pg.wait_for_timeout(4500); run.note('進門後 4 秒內互動鍵的變化：%s' % json.dumps(await pg.evaluate("window.__bbSeen||[]"), ensure_ascii=False))
                tk = await pg.evaluate("window.__bbTalk")
                if tk and talk_ms is None: talk_ms = tk['ms']; run.note('進門後 %d ms 按到「%s」（按的時候 busyDepth %s）' % (talk_ms, tk['label'], tk['depth']))
            run.check('走得進麵店', s['zone'] == 'noodle', json.dumps(s, ensure_ascii=False))
            if MODE == 'talk': run.check('進門後按得到「和沈以安說話」（使用者的操作）', talk_ms is not None, str(talk_ms))
        t0 = time.time(); idle = None; stuck = False; last = None; ended = None
        while time.time() - t0 < 300:
            s = await pg.evaluate(DBG); k = json.dumps(s, ensure_ascii=False)
            if k != last: last = k; run.note(k)
            if s['ch']:
                c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>!/算了|就這樣|不用了/.test(x.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.slice(0,20)]; })()")
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(600); idle = None; continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); idle = None; continue
            if s['depth'] > 0 or s['busy']:
                idle = idle or time.time()
                if time.time() - idle > 12: stuck = True; run.note('卡住：%s' % k); await run.shot(pg, 'stuck'); break
            else:
                idle = None; ended = ended or time.time()
                if time.time() - ended > (20 if MODE != 'reload' else 30): break
            await pg.wait_for_timeout(450)
        await run.shot(pg, 'end')
        a0 = await pg.evaluate(DBG); await pg.wait_for_timeout(8000); a1 = await pg.evaluate(DBG)
        run.note('結束 %s → 8 秒後 %s' % (json.dumps(a0, ensure_ascii=False), json.dumps(a1, ensure_ascii=False)))
        run.check('沒有卡在對話（12 秒以上沒有對話框、沒有選項、還在忙）', not stuck, last or '')
        run.check('iv13 不再是 going（約好的那一場有結束）', a1['iv'] != 'going', str(a1['iv']))
        run.check('她沒有一直跟著（beh 不是 follow）', not (a1['an'] and a1['an'].get('beh') == 'follow'), json.dumps(a1['an'], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        print('SHA', sha, 'MODE', MODE)
    sys.exit(run.finish())
asyncio.run(main())
