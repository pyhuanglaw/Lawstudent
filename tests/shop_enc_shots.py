"""店內偶遇（SHOP-ENCOUNTER-1103）＋店裡客人的路人句（AA_640）遊戲內截圖。
[前置／捷徑] 每一間直接讀檔到店門口，存檔裡先寫好「今天這個時段在這間店遇到誰」（G.daily.shopEnc；60% 擲到誰在 tests/shop_enc_unit.js 測），
把玩家放到她旁邊（只為了截圖）；按鈕、對話、選項照遊戲真正的流程（點 #interact、點對話、點選項）。
用法：python3 tests/shop_enc_shots.py http://127.0.0.1:8791/index.html?turbo shots/shop_enc_1103"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True}
# (標籤, 區域, 日期, 時刻, 誰, 熟到哪（social 的 fam／trust）, 要點的選項)
CASES = [
    ('cafe_an', 'cafe', '2025-10-18', 15.25, 'heroine_01', {'fam': 45, 'trust': 30}, '一起坐'),
    ('bookstore_zhining', 'bookstore', '2025-10-18', 15.0, 'npc_songzn', None, '「一起看？」'),
    ('cvs_kai', 'cvs', '2025-10-15', 23.5, 'kai', {'fam': 30, 'trust': 10}, '打招呼'),
]
STATE = """(()=>{ const ch=document.getElementById('choices'), c=ch&&!ch.classList.contains('hide')?ch.querySelectorAll('button'):[], it=document.getElementById('interact');
  return {zone:GAME.G.zone, dlg:!!(GAME.D&&GAME.D.active), dtext:(document.getElementById('dlgText')||{}).textContent||'', dname:(document.getElementById('dlgName')||{}).textContent||'',
    choices:[...c].map(b=>b.textContent), interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():''}; })()"""
async def say_state(pg): return await pg.evaluate(STATE)
async def main():
    run = L.Run('shop_enc_shots', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        info = {}
        for label, zone, date, hour, who, rel, pick in CASES:
            d = await pg.evaluate(f"STORY.dayOfKey('{date}')"); wd = await pg.evaluate(f"CALENDAR.dateOf({d}).wd%7")
            per = 'am' if hour < 12 else ('pm' if hour < 18 else 'ev'); key = f'{d}:{zone}:{per}'
            sp = await pg.evaluate(f"(()=>{{ const s=Z3.ZONES['{zone}'].spawn; return s?{{x:s.x,z:s.z,yaw:s.yaw||0}}:null; }})()")
            run.setup(f'{label}：［捷徑］讀檔到 {zone}（{date} {int(hour)}:{int(round((hour % 1) * 60)):02d}），存檔寫好今天這個時段遇到 {who}')
            st = {'zone': zone, 'hour': hour, 'day': d, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': dict(BASE),
                  'daily': {'shopEnc': {'day': d, 'dec': {key: {'who': who, 'spot': zone}}, 'who': {who: key}, 'met': []}}}
            if sp: st['pos'] = {'x': sp['x'], 'z': sp['z'], 'yaw': sp['yaw']}
            await L.load_state(pg, st, quiet_events=True)
            for _ in range(30):
                if await pg.evaluate("GAME.G.zone===%s&&(!GAME.E.zone||GAME.E.zone.formal!==false)" % json.dumps(zone)): break
                await pg.wait_for_timeout(1000)
            await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
            if rel: await pg.evaluate("(r=>SOCIAL.adjust(%s,r))(%s)" % (json.dumps(who), json.dumps(rel)))
            # 她在哪裡：作息生的人（EVENTS.npcOf）或宋知寧（shopZn）
            pos = await pg.evaluate("""(w=>{ const E=GAME.E; const n=w==='npc_songzn'?E.npcs.find(m=>m.shopZn):EVENTS.npcOf(w); if(!n) return null; const o=n.obj.position;
              return {x:+o.x.toFixed(2),z:+o.z.toFixed(2),seat:!!n.seat,pose:n.pose,label:n.talkLabel||'',reserved:(()=>{ const st=n.seat; return st?!!CROWD.shopReserved(GAME.G.zone,st,GAME.G):(CROWD.shopStandReserved(GAME.G.zone,o.x,o.z,GAME.G)); })(),
                crowdNear:E.npcs.filter(m=>m!==n&&typeof m.crowd==='string'&&Math.hypot(m.obj.position.x-o.x,m.obj.position.z-o.z)<0.4).length}; })(%s)""" % json.dumps(who))
            run.check(f'{label}：{who} 在店裡（{"坐著" if pos and pos["seat"] else "站著"}，姿勢 {pos and pos["pose"]}），按鈕「{pos and pos["label"]}」，位子有預約、沒有路人疊在一起',
                      bool(pos) and pos['crowdNear'] == 0 and ('打招呼' in pos['label'] or '二手書' in pos['label']), json.dumps(pos, ensure_ascii=False))
            if not pos: await run.shot(pg, label + '_missing'); continue
            # 把玩家放到她前面一點、轉向她（捷徑），讓按鈕出來
            await pg.evaluate("""(p=>{ const E=GAME.E, P=E.player; const cand=[[0,1.0],[1.0,0],[-1.0,0],[0,-1.0],[0.8,0.8],[-0.8,0.8],[0.8,-0.8],[-0.8,-0.8]];
              for(const [dx,dz] of cand){ const x=p.x+dx, z=p.z+dz; if(E.canStand(x,z,0.3,0)){ E.placeAt(P,x,z,0); P.obj.rotation.y=Math.atan2(p.x-x,p.z-z); E.cam.yaw=P.obj.rotation.y+Math.PI; return; } } })(%s)""" % json.dumps(pos))
            await pg.wait_for_timeout(2500)
            s = await say_state(pg); info[label + '_button'] = s
            run.check(f'{label}：走近她，按鈕是「{s["interact"]}」', '打招呼' in s['interact'] or '二手書' in s['interact'], json.dumps(s, ensure_ascii=False))
            await run.shot(pg, label + '_1_button')
            if '打招呼' in s['interact'] or '二手書' in s['interact']:
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
                s = await say_state(pg); info[label + '_why'] = s; await run.shot(pg, label + '_2_why')
                for _ in range(8):
                    s = await say_state(pg)
                    if s['choices']: break
                    if s['dlg']: await L.tap(pg, cdp, '#dlg')
                    await pg.wait_for_timeout(1200)
                info[label + '_choices'] = s; await run.shot(pg, label + '_3_choices')
                run.check(f'{label}：選項 {s["choices"]}', bool(s['choices']), json.dumps(s, ensure_ascii=False))
                if pick in s['choices']:
                    i = s['choices'].index(pick)
                    c = await pg.evaluate("(i=>{ const e=document.querySelectorAll('#choices button')[i]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
                    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(2000)
                    s = await say_state(pg); info[label + '_line'] = s; await run.shot(pg, label + '_4_line')
                for _ in range(10):
                    s = await say_state(pg)
                    if not s['dlg'] and not s['choices']: break
                    if s['choices']: await L.touch_tap(cdp, *(await pg.evaluate("(()=>{ const r=document.querySelector('#choices button').getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")))
                    else: await L.tap(pg, cdp, '#dlg')
                    await pg.wait_for_timeout(1200)
                after = await pg.evaluate("(w=>{ const n=w==='npc_songzn'?GAME.E.npcs.find(m=>m.shopZn):EVENTS.npcOf(w); return {label:n?n.talkLabel:null, met:(GAME.G.daily.shopEnc||{}).met, flags:{MET:GAME.G.flags.SHOP_ZN_MET}}; })(%s)" % json.dumps(who))
                info[label + '_after'] = after
                run.check(f'{label}：遇過以後按鈕回到一般（{after["label"]}），記在今天遇過的人', who in (after['met'] or []), json.dumps(after, ensure_ascii=False))
        # 路人說一句：巷子裡定食 10/15（三）12:30，一桌兩個人
        label = 'teishoku_diner'; d = await pg.evaluate("STORY.dayOfKey('2025-10-15')"); wd = await pg.evaluate(f"CALENDAR.dateOf({d}).wd%7")
        sp = await pg.evaluate("(()=>{ const s=Z3.ZONES['wz_teishoku'].spawn; return {x:s.x,z:s.z,yaw:s.yaw||0}; })()")
        run.setup(f'{label}：［捷徑］讀檔到巷子裡定食（2025-10-15 12:30），把玩家放到一桌兩個客人旁邊')
        await L.load_state(pg, {'zone': 'wz_teishoku', 'hour': 12.5, 'day': d, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': dict(BASE), 'pos': sp}, quiet_events=True)
        for _ in range(30):
            if await pg.evaluate("GAME.G.zone==='wz_teishoku'&&(!GAME.E.zone||GAME.E.zone.formal!==false)"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
        pos = await pg.evaluate("""(()=>{ const E=GAME.E; const n=E.npcs.find(m=>typeof m.crowd==='string'&&/^shop_/.test(m.crowd)&&m.talk&&m.seat); if(!n) return null; const o=n.obj.position; return {x:o.x,z:o.z,yaw:n.seat.yaw||0,label:n.talkLabel}; })()""")
        run.check(f'{label}：有一桌兩個人可以「聽一句」', bool(pos), json.dumps(pos, ensure_ascii=False))
        if pos:
            await pg.evaluate("""(p=>{ const E=GAME.E, P=E.player; for(const r of [0.9,1.1,1.3]) for(let a=0;a<12;a++){ const x=p.x+Math.sin(a*Math.PI/6)*r, z=p.z+Math.cos(a*Math.PI/6)*r; if(E.canStand(x,z,0.3,0)){ E.placeAt(P,x,z,0); P.obj.rotation.y=Math.atan2(p.x-x,p.z-z); E.cam.yaw=P.obj.rotation.y+Math.PI; return; } } })(%s)""" % json.dumps(pos))
            await pg.wait_for_timeout(2500); s = await say_state(pg); info[label + '_button'] = s; await run.shot(pg, label + '_1_button')
            run.check(f'{label}：按鈕「{s["interact"]}」', s['interact'] == '聽一句', json.dumps(s, ensure_ascii=False))
            if s['interact'] == '聽一句':
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000); s = await say_state(pg); info[label + '_line'] = s; await run.shot(pg, label + '_2_line')
                run.check(f'{label}：路人說一句「{s["dname"]}：{s["dtext"]}」', s['dname'] == '路人' and bool(s['dtext']), json.dumps(s, ensure_ascii=False))
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1500); s = await say_state(pg); info[label + '_line2'] = s; await run.shot(pg, label + '_3_line2')
        with open(os.path.join(OUT, 'info.json'), 'w', encoding='utf8') as f: json.dump(info, f, ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, '；'.join(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
