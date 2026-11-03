# -*- coding: utf-8 -*-
"""BB（帳號 A）11-03：下一版兩項小修正的瀏覽器探針。
① CARREL-FREE-1103（4cf116b0c＋4fc0dda22；使用者 11-03 選擇題「大一就能用，免預約」）：總圖 2F 研究小間 08 開館時間（08:00～22:00）門開著、直接坐；第一次進去演一次旁白；
   服務台不再有預約。src/lupstory3d.js S.FREE／S.booked、src/library_upper3d.js（08 的門、座位）。
② CLASSROOM-BAGS-1103（0527e6ebc；使用者 11-03「為什麼教室地板有奇怪的袋子」）：201 階梯教室座位後面不再放 prop.bag（src/zones3d.js）。
流程（Playwright 手機橫向 844×390，SwiftShader，不是 iPhone）：
  A【前置】最小存檔：法律系大一 2025-10-15（三）10:00，在研究小間（library_carrels）門廳。
    檢查：A1 08 的門開著（沒有「研究小間 08」關門互動點）、有「坐下（研究小間）」；A2 第一次進去演「（小間裡只聽得到自己翻書的聲音。）」一次；
    A3 照玩家走到 08 的椅子、點「坐下」坐得下去；A4 畫面上看得到的牌子（使用須知、預約表、08 門）不再叫玩家「去服務台預約」；
    A5【前置】再讀一次同一天：旁白不再演；A6【前置】22:30 讀檔：08 關門（有關門互動點、沒有座位），說明不是「請預約」。
  B【前置】最小存檔讀進 201 教室（classroom）：B1 建教室時沒有拿 prop.bag（包住 ASSETS.get 記錄）；B2 截圖（直向、橫向）給 BB 看。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 bb_n19_carrel_bag_probe.py '<URL>/index.html' <輸出資料夾>"""
import os, sys, json, asyncio, time, traceback, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

URL0, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
J = lambda o: json.dumps(o, ensure_ascii=False)
QUIET = '（小間裡只聽得到自己翻書的聲音。）'
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1,
         'CAMP_Y1': True}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'library_carrels', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'cvs', 'bookstore', 'dorm', 'dorm_hall', 'campus', 'classroom')
DAY_JS = "k=>{ const d=STORY.dayOfKey(k); if(d==null) return null; const c=CALENDAR.dateOf(d); return {d, wd:c.wd===7?0:c.wd, key:c.key}; }"
HOOK = r"""(()=>{ if(window.__N19) return 'again'; const W=window.__N19={say:[],assets:[]};
  const s0=GAME.say; GAME.say=function(w,t){ try{ W.say.push({n:(w&&w.name)||'',t:String(t==null?'':t),z:GAME.G.zone}); }catch(e){} return s0.apply(this,arguments); };
  const a0=ASSETS.get; ASSETS.get=function(k){ try{ W.assets.push({k:String(k),z:(GAME.G&&GAME.G.zone)||''}); }catch(e){} return a0.apply(this,arguments); };
  return true; })()"""
ITS = "(()=>GAME.E.interactables.map(i=>({id:i.id||null,label:i.label||'',look:typeof i.look==='string'?i.look:'',x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2),seat:!!i.seat})))()"
TS = r"""(()=>{ const D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg');
  return {dlg:!!(D&&D.active), txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim():'',
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()):[], zone:GAME.G.zone,
    seat:!!GAME.E.player.seat||GAME.E.player.pose==='sit'||/sit|study/.test(String(GAME.E.player.pose||'')), pose:String(GAME.E.player.pose||''),
    x:+(+GAME.E.player.obj.position.x).toFixed(2), z:+(+GAME.E.player.obj.position.z).toFixed(2), btn:((document.getElementById('interactLabel')||document.getElementById('interact')||{}).textContent||'').trim()}; })()"""


def url_for():
    base, _, q = URL0.partition('?'); ps = [x for x in q.split('&') if x and x != 'turbo']
    return base + ('?' + '&'.join(ps) if ps else '')


def state(d, h, zone, pos=None):
    return {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF),
            'day': d['d'], 'weekday': d['wd'], 'hour': h, 'zone': zone, 'pos': pos, 'weather': 'clear', 'stage': 'law', 'money': 30000,
            'visited': {z: True for z in VISITED}}


async def clear_dialogs(pg, cdp, secs=20):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await pg.evaluate(TS)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['ch']: break
        await pg.wait_for_timeout(500)
        if not (await pg.evaluate(TS))['dlg']: break


async def main():
    run = L.Run('n19_carrel_bag', OUT); os.makedirs(OUT, exist_ok=True)
    print('bb_n19_carrel_bag_probe  SHA=%s  URL=%s' % (SHA, url_for()), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        pg.set_default_timeout(180000)
        try:
            await pg.goto(url_for()); run.check('遊戲載入', await L.wait_loaded(pg))
            await pg.evaluate(HOOK)
            d = await pg.evaluate(DAY_JS, '2025-10-15')
            # ---------------- A 研究小間 ----------------
            await pg.evaluate("localStorage.clear()")
            await L.load_state(pg, state(d, 10.0, 'library_carrels', {'x': -7.0, 'z': 0.0, 'yaw': 1.5708}), quiet_events=False, quiet_phone=True)
            await pg.wait_for_timeout(4000)
            run.setup('最小存檔：法律系大一 %s 10:00，研究小間門廳（條件事件照開）' % d['key'])
            await pg.screenshot(path=os.path.join(OUT, 'A_enter.png'))
            await clear_dialogs(pg, cdp)
            its = await pg.evaluate(ITS)
            run.note('研究小間的互動點：%s' % J([[i['id'], i['label']] for i in its]))
            seat = next((i for i in its if i['label'].startswith('坐下（研究小間）')), None)
            run.check('A1 08 的門開著：沒有「研究小間 08」關門互動點、有「坐下（研究小間）」', not any(i['id'] == 'door08' for i in its) and bool(seat), J([i['label'] for i in its]))
            W = await pg.evaluate("(()=>window.__N19)()")
            q = [s for s in W['say'] if s['t'] == QUIET]
            run.check('A2 第一次進去演一次「%s」' % QUIET, len(q) == 1, J([s['t'] for s in W['say']][-5:]))
            if seat:
                ok = await L.go_to(pg, cdp, run, 0.2, 1.85, 0.6, '08 的椅子前', max_s=240)
                run.note('走到 08 的椅子前：%s %s' % (ok, J(await pg.evaluate(TS))))
                for _ in range(6):
                    s = await pg.evaluate(TS)
                    if s['btn'].startswith('坐下'): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); break
                    await L.go_to(pg, cdp, run, 0.2, 2.1, 0.35, '08 的椅子', max_s=60); await pg.wait_for_timeout(800)
                for _ in range(10):
                    s = await pg.evaluate(TS)
                    if s['ch']: run.note('坐下後的選項 %s' % J(s['ch'])); break
                    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                    await pg.wait_for_timeout(800)
                s = await pg.evaluate(TS); await pg.screenshot(path=os.path.join(OUT, 'A_sit08.png'))
                run.check('A3 照玩家走到 08 的椅子、按「坐下」坐得下去（或出現讀書選單）', s['seat'] or bool(s['ch']), J(s))
                for _ in range(4):
                    s = await pg.evaluate(TS)
                    if s['ch']:
                        k = next((i for i, t in enumerate(s['ch']) if '起來' in t or '不' in t or '離開' in t or '算了' in t), len(s['ch']) - 1)
                        bb = await pg.evaluate("(k=>{ const e=document.querySelectorAll('#choices button')[k]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", k)
                        if bb: await L.touch_tap(cdp, bb[0], bb[1]); await pg.wait_for_timeout(1500)
                    elif s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
                    else: break
            texts = [i for i in its if i['id'] in ('rules', 'booking', 'door08')]
            bad = [i for i in texts if '預約' in (i['label'] + i['look'])]
            run.check('A4 牌子（使用須知、預約表、08 門）不再叫玩家「去服務台預約」（免預約以後還寫「請到 1F 服務台預約」＝玩家會被誤導）', not bad, J(texts))
            # A5 同一天再進一次
            n0 = len((await pg.evaluate("(()=>window.__N19)()"))['say'])
            snap = await pg.evaluate("()=>GAME.snapshot()"); snap = snap.get('G', snap) if isinstance(snap, dict) else snap
            snap['zone'] = 'library_carrels'; snap['pos'] = {'x': -7.0, 'z': 0.0, 'yaw': 1.5708}; snap['hour'] = 11.0
            await L.load_state(pg, snap, quiet_events=False, quiet_phone=True); await pg.wait_for_timeout(4000)
            W = await pg.evaluate("(()=>window.__N19)()")
            run.check('A5【前置】同一天 11:00 再讀一次：旁白不再演', not any(s['t'] == QUIET for s in W['say'][n0:]), J([s['t'] for s in W['say'][n0:]][-4:]))
            # A6 22:30
            snap['hour'] = 22.5
            await L.load_state(pg, snap, quiet_events=False, quiet_phone=True); await pg.wait_for_timeout(4000)
            its2 = await pg.evaluate(ITS); await pg.screenshot(path=os.path.join(OUT, 'A_2230.png'))
            d8 = next((i for i in its2 if i['id'] == 'door08'), None)
            run.check('A6【前置】22:30（閉館後）08 關門：有關門互動點、沒有「坐下（研究小間）」', bool(d8) and not any(i['label'].startswith('坐下（研究小間）') for i in its2), J([[i['id'], i['label']] for i in its2]))
            run.check('A6 關門時 08 的說明不是「請預約」', bool(d8) and '預約' not in (d8['label'] + d8['look']), J(d8))
            # ---------------- B 201 教室 ----------------
            n1 = len((await pg.evaluate("(()=>window.__N19)()"))['assets'])
            d2 = await pg.evaluate(DAY_JS, '2025-10-16')
            await L.load_state(pg, state(d2, 12.5, 'classroom', {'x': 0.0, 'z': 4.6, 'yaw': math.pi}), quiet_events=True, quiet_phone=True)
            await pg.wait_for_timeout(5000)
            run.setup('最小存檔：%s 12:30 201 教室（條件事件關閉）' % d2['key'])
            W = await pg.evaluate("(()=>window.__N19)()")
            keys = [a for a in W['assets'][n1:] if a['z'] == 'classroom' or True]
            bags = [a for a in keys if a['k'] == 'prop.bag']
            run.note('進 201 時拿的道具：%s' % J(sorted({a['k'] for a in keys if a['k'].startswith('prop.')})))
            run.check('B1 201 教室建教室時沒有拿 prop.bag（座位後面浮在走道上的紙袋拿掉）', not bags and any(a['k'] == 'prop.bottle' for a in keys), J(bags[:3]))
            await pg.screenshot(path=os.path.join(OUT, 'B_201_land.png'))
            await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2500); await pg.screenshot(path=os.path.join(OUT, 'B_201_port.png'))
        except Exception as e:
            run.check('跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
            try: await run.shot(pg, 'exception')
            except Exception: pass
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('SHA', SHA, flush=True)
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
