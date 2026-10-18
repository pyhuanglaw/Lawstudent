"""BB：118 巷（v9.10 第 17b 項，LAWWW 1b51a162）＋學姊資料頁年級（SIS-GRADE-1017）。手機模擬橫向，不用 turbo 走路；每段標 [前置／捷徑]。
A. 九間店門：都走得到、互動鍵是店名；沒開的店「鐵門拉下來一半」；一個人點餐（招呼→菜單→「你點了」→吃完、扣錢）。
B. 有常客的店：招呼「幾位？裡面有位子。」、吃完換常客那一句。
C. 阿哲週一 12:00 揪人（大一上第 2 週第一次）：「走。」排 12:15 那間店門口；「今天不行。」→「好喔 下次」。
D. 第 16 週、寒假：巷子裡沒有常客。
E. 學姊資料頁：大一「法律系・四年級」，大二～大四「法研所・碩一／碩二／碩三」。
用法：LW_TESTS=<tests> python3 lane_probe.py URL OUT [A,B,C,D,E]"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; PARTS = (sys.argv[3] if len(sys.argv) > 3 else 'A,B,C,D,E,F').split(',')
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1}
MET = ['zhe', 'yu', 'classmate_bohan', 'classmate_mingxuan', 'classmate_xinci', 'heroine_01', 'classmate_peishan', 'heroine_03', 'heroine_05']


def social(stage_fam=30):
    rel = {k: {'fam': stage_fam, 'trust': 15, 'aff': 10, 'resp': 5, 'comf': 15, 'rom': 0, 'npcRom': 0, 'seen': 5, 'talked': 5} for k in MET}
    return {'rel': rel, 'mem': {k: [{'tag': 'FIRST_MET', 'day': -3, 'note': ''}] for k in MET}, 'reveal': {}, 'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}}


async def load(pg, key, hour, zone, pos, flags=None, soc=None, money=3000):
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key))
    wd = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % d)
    await L.load_state(pg, {'zone': zone, 'hour': hour, 'day': d, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': money, 'flags': dict(flags or BASE), 'social': soc or social(), 'pos': pos})
    await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp_ref[0])


cdp_ref = [None]


async def talk(pg, cdp, until, max_s=120, pick=0):
    t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate(until): return True
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(i=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; const e=bs[Math.min(i,bs.length-1)]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]; })(%d)" % pick)
            if c: await L.touch_tap(cdp, c[0], c[1])
        elif s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    return False


HOOK = "(()=>{ window.__said=[]; if(window.__saidHook) return; const s0=GAME.say; GAME.say=function(who,t,o){ window.__said.push((who&&who.name?who.name+'：':'')+t); return s0.apply(this,arguments); }; window.__saidHook=true; })()"


async def to_lane(pg, cdp, run):
    ex = await L.find_it(pg, '從後門出去')
    if not ex: run.check('找到「從後門出去（118 巷）」', False); return False
    await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, '後門'); await pg.wait_for_timeout(800)
    await L.tap(pg, cdp, '#interact')
    for _ in range(60):
        if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): return True
        await pg.wait_for_timeout(1000)
    return False


async def door_go(pg, cdp, run, sid):
    d = await pg.evaluate("L118.door(%s)" % json.dumps(sid))
    await L.go_to(pg, cdp, run, d['x'] + (0.6 if d['side'] == 'W' else -0.6), d['z'], 1.0, sid)
    s = await L.state(pg)
    for _ in range(8):
        if s['interact']: break
        await pg.wait_for_timeout(500); s = await L.state(pg)
    return s['interact']


async def order(pg, cdp, label):
    await pg.evaluate(HOOK); m0 = await pg.evaluate("GAME.G.money")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    await talk(pg, cdp, "!GAME.D.active&&!GAME.E.player.busy&&!document.querySelector('#choices button')", 90)
    return (await pg.evaluate("window.__said||[]")), m0 - (await pg.evaluate("GAME.G.money"))


async def main():
    run = L.Run('lane_probe', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cdp_ref[0] = cdp
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        shops = await pg.evaluate("LANE118_SHOPS.shops.map(s=>({id:s.id,name:s.name}))")
        print('店家：', json.dumps(shops, ensure_ascii=False))
        if 'A' in PARTS:
            run.setup('A. 讀檔 2025-09-17（三）15:00 霖澤館後面的小廣場（大一上第 3 週，平日下午，沒有常客的時段）')
            await load(pg, '2025-09-17', 15.0, 'campus', {'x': 34, 'z': -124.6, 'yaw': 3.14})
            run.check('A. 走後門進 118 巷', await to_lane(pg, cdp, run)); await run.shot(pg, 'A_lane')
            got = {}
            for s in shops:
                it = await door_go(pg, cdp, run, s['id']); got[s['id']] = it
                print('   ', s['name'], '→ 互動鍵：', it)
            bad = [s['name'] for s in shops if s['name'] not in (got.get(s['id']) or '')]
            run.check('A. 九間店門都走得到、互動鍵是店名（%d 間）' % len(shops), not bad and len(shops) == 9, json.dumps(got, ensure_ascii=False))
            closed = await pg.evaluate("LANE118_SHOPS.shops.filter(s=>!L118.isOpen(s.id,GAME.G)).map(s=>s.id)")
            openq = await pg.evaluate("LANE118_SHOPS.shops.filter(s=>L118.isOpen(s.id,GAME.G)&&!L118.companions(GAME,s.id).length).map(s=>s.id)")
            print('   這時候沒開：', closed, '開著、沒常客：', openq)
            if closed:
                await door_go(pg, cdp, run, closed[0]); said, _ = await order(pg, cdp, closed[0])
                run.check('A. 沒開的店（%s）：「（鐵門拉下來一半。門上貼著營業時間。）」' % closed[0], any('鐵門拉下來一半' in t for t in said), json.dumps(said, ensure_ascii=False))
            else: run.check('A. 15:00 有沒開的店可以測', False, '全部開著（記錄，不算遊戲問題）')
            if openq:
                await door_go(pg, cdp, run, openq[0]); await run.shot(pg, 'A_door_solo')
                said, cost = await order(pg, cdp, openq[0]); await run.shot(pg, 'A_after_solo')
                run.check('A. 一個人點餐（%s）：招呼 → 「（你點了…）」→ 吃完的旁白、扣錢' % openq[0], any('你點了' in t for t in said) and cost > 0 and not any('幾位？裡面有位子' in t for t in said), json.dumps(said, ensure_ascii=False) + ' 扣 %d' % cost)
            gate = await L.find_it(pg, '回到台大')
            if gate:
                await L.go_to(pg, cdp, run, gate['x'], gate['z'], gate['r'] * 0.7, '後門'); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact')
                for _ in range(60):
                    if await pg.evaluate("GAME.G.zone==='campus'&&!GAME.E.player.busy"): break
                    await pg.wait_for_timeout(1000)
            run.check('A. 走回後門回到校園', await pg.evaluate("GAME.G.zone==='campus'"))
        if 'B' in PARTS:
            run.setup('B. 讀檔 2025-09-24（三）12:20 118 巷後門（大一上第 4 週平日中午；見過常客表上的人）')
            await load(pg, '2025-09-24', 12.33, 'campus', {'x': 34, 'z': -124.6, 'yaw': 3.14}, flags=dict(BASE, L118_FIRST_SENT=True))
            await to_lane(pg, cdp, run); await pg.wait_for_timeout(4000)
            reg = await pg.evaluate("LANE118_SHOPS.shops.map(s=>({id:s.id,open:L118.isOpen(s.id,GAME.G),with:L118.companions(GAME,s.id).map(x=>x.id||x)})).filter(s=>s.with.length)")
            print('   有常客的店：', json.dumps(reg, ensure_ascii=False)); await run.shot(pg, 'B_lane_noon')
            run.check('B. 平日中午有常客站在店門口', bool(reg), json.dumps(reg, ensure_ascii=False))
            tgt = next((r for r in reg if r['open']), None)
            if tgt:
                await door_go(pg, cdp, run, tgt['id']); await run.shot(pg, 'B_door_regular')
                said, cost = await order(pg, cdp, tgt['id'])
                run.check('B. 有常客（%s，%s）：招呼「幾位？裡面有位子。」、吃完換常客的一句、扣錢' % (tgt['id'], tgt['with']), any('幾位？裡面有位子' in t for t in said) and cost > 0, json.dumps(said, ensure_ascii=False) + ' 扣 %d' % cost)
        if 'C' in PARTS:
            for k, want in ((0, 'yes'), (1, 'no')):
                run.setup('C%d. 讀檔 2025-09-08（一）11:58 霖澤館後面的小廣場；[捷徑] 用 PHONE.join 放進麵店團群組、還沒收過第一次揪人' % (k + 1))
                await load(pg, '2025-09-08', 11.97, 'campus', {'x': 34, 'z': -124.6, 'yaw': 3.14})
                await pg.evaluate("PHONE.join(GAME.G,'noodle_team','麵店團')")
                for _ in range(90):
                    if await pg.evaluate("PHONE.sent(GAME.G,'l118_lunch_'+GAME.G.day)"): break
                    await pg.wait_for_timeout(1000)
                msgs = await pg.evaluate("(()=>{ const t=PHONE.threads(GAME.G).find(x=>x.th==='g:noodle_team'||x.id==='g:noodle_team'); return t?JSON.stringify(t).slice(-600):null; })()")
                print('   群組：', msgs)
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
                await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
                c = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='g:noodle_team'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
                await run.shot(pg, 'C%d_group' % (k + 1))
                bb = await pg.evaluate("(k=>{ const bs=[...document.querySelectorAll('#phoneBody [data-ask]')]; if(!bs.length) return null; const e=bs[Math.min(k,bs.length-1)]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim(),bs.map(x=>x.textContent.trim())]; })(%d)" % k)
                run.check('C%d. 12:00 麵店團群組有阿哲揪人、有兩個回覆按鈕' % (k + 1), bool(bb) and len(bb[3]) >= 2, json.dumps(bb and bb[3], ensure_ascii=False))
                if bb: await L.touch_tap(cdp, bb[0], bb[1]); await pg.wait_for_timeout(2000)
                await run.shot(pg, 'C%d_replied' % (k + 1))
                txt = await pg.evaluate("document.getElementById('phoneBody').textContent")
                if want == 'yes':
                    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(2500)
                    for _w in range(40):
                        st = await pg.evaluate("({pick:GAME.G.flags.L118_PICK||null,lunch:GAME.G.flags.L118_LUNCH||null,h:+GAME.G.hour.toFixed(2),plans:(typeof OUT!=='undefined'&&OUT.get)?!!OUT.get(GAME.G,'l118_lunch_'+GAME.G.day):null})")
                        if _w % 5 == 0: print('   等排程', st, flush=True)
                        if st['lunch']: break
                        await pg.wait_for_timeout(1000)
                    lunch = await pg.evaluate("GAME.G.flags.L118_LUNCH||null")
                    plan = await pg.evaluate("(()=>{ try{ return JSON.stringify((GAME.G.outings||GAME.G.plans||[])).slice(0,400); }catch(e){ return String(e); } })()")
                    run.check('C1. 回「%s」：排了 12:15 那間店門口（L118_LUNCH）' % bb[2], bool(lunch) and lunch.get('shop') == 'noodle2', json.dumps(lunch, ensure_ascii=False) + ' ' + str(plan))
                else:
                    run.check('C2. 回「%s」：阿哲回「好喔 下次」' % bb[2], '好喔 下次' in txt, txt[-200:])
                    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
        if 'D' in PARTS:
            k16 = await pg.evaluate("CALENDAR.dateOf(STORY.termDay('Y1S1',16,1)).key")
            for key, why in ((k16, '大一上第 16 週週一'), ('2026-01-12', '寒假週一')):
                run.setup('D. 讀檔 %s 12:20 118 巷（%s）' % (key, why))
                await load(pg, key, 12.33, 'campus', {'x': 34, 'z': -124.6, 'yaw': 3.14}, flags=dict(BASE, L118_FIRST_SENT=True))
                wk = await pg.evaluate("(t=>t?t.id+' 第 '+t.week+' 週':'放假')(CALENDAR.termOf(GAME.G.day))")
                await to_lane(pg, cdp, run); await pg.wait_for_timeout(4000)
                reg = await pg.evaluate("LANE118_SHOPS.shops.map(s=>L118.companions(GAME,s.id).length).reduce((a,b)=>a+b,0)")
                npcs = await pg.evaluate("Object.keys(GAME.npc||{}).filter(k=>GAME.npc[k]&&GAME.npc[k].obj&&GAME.npc[k].obj.visible!==false)")
                await run.shot(pg, 'D_%s' % key)
                run.check('D. %s（%s）巷子裡沒有常客' % (key, wk), reg == 0, json.dumps({'companions': reg, 'npcs': npcs}, ensure_ascii=False))
        if 'E' in PARTS:
            want = {'2025-10-15': '法律系・四年級', '2026-10-14': '碩一', '2027-10-13': '碩二', '2028-10-18': '碩三'}
            for key, w in want.items():
                run.setup('E. 讀檔 %s 20:00 宿舍房間；見過學姊（熟悉 30）' % key)
                await load(pg, key, 20.0, 'dorm', {'x': -0.6, 'z': -0.4, 'yaw': 3.14}, flags=dict(BASE, L118_FIRST_SENT=True, ROOM_Y2=True, ROOM_Y2_ITEMS=True))
                await talk(pg, cdp, "!GAME.D.active&&!document.querySelector('#choices button')&&!GAME.E.player.busy", 40)
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
                await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
                lst = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody .item')].find(x=>/溫書瑀|學姊/.test(x.textContent)); return e?e.textContent.replace(/\\s+/g,' ').slice(0,120):null; })()")
                await run.shot(pg, 'E_list_%s' % key)
                c = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-person=\"heroine_05\"]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                prof = None
                if c:
                    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000)
                    prof = await pg.evaluate("document.getElementById('phoneBody').textContent.replace(/\\s+/g,' ').slice(0,200)")
                    await run.shot(pg, 'E_profile_%s' % key)
                run.check('E. %s 學姊資料頁顯示「%s」（朋友列表：%s）' % (key, w, lst), bool(prof) and w in prof, json.dumps({'list': lst, 'profile': prof}, ensure_ascii=False))
                await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
        if 'F' in PARTS:   # 正式地面（ART-L118-GROUND，5ecab8b8）：白天、晚上各拍後門、斑馬線、巷子
            for hh, nm in ((15.0, 'day'), (21.0, 'night')):
                run.setup('F. 讀檔 2025-09-17 %02d:00 霖澤館後面的小廣場 → 走後門進 118 巷（看地面）' % hh)
                await load(pg, '2025-09-17', hh, 'campus', {'x': 34, 'z': -124.6, 'yaw': 3.14}, flags=dict(BASE, L118_FIRST_SENT=True))
                await run.shot(pg, 'F_%s_campus_gate' % nm)
                ok = await to_lane(pg, cdp, run); await pg.wait_for_timeout(3000)
                await run.shot(pg, 'F_%s_lane_entry' % nm)
                for sid in ('noodle2', 'home'):
                    await door_go(pg, cdp, run, sid); await run.shot(pg, 'F_%s_%s' % (nm, sid))
                run.check('F. %s 進得了 118 巷（地面截圖給人看）' % nm, ok)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
