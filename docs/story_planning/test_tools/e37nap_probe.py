"""BB-B 2026-10-31：BUG-E37-NAP-CEREMONY-1031 修正驗收（LAWWW-B 19:26，24aebe913）——QA-PLAYTHROUGH ① 天天睡覺的 8/30 那一段重跑（不用整條重來）。
[前置] 讀檔：n36_qa_sleep 玩到 9/2 的最後狀態（經濟系路線、8/29 轉法律系、和可昕交往），改回 8/30（或 8/31），拿掉 ev_y0_e37 演過的紀錄、開學典禮旗標，
  y0_e37 那一筆約改回 planned（8/28 21:00 的私訊「後天你載我搬宿舍」照舊在）。之後都是玩家的操作：走到床邊、按床、選「睡到傍晚（不設鬧鐘）」、對話點過去、選項選第一個。
情境（CASE=noon,twice,skip830）：
  noon    8/30 12:00 宿舍 → 睡到傍晚 → 14:15 被叫醒 → 可昕電話「你在哪？行李我都搬到樓下了。」→ E37 → 回宿舍（LAWWW-B 要的）
  twice   8/30 07:30 宿舍 → 睡到傍晚（出發前被叫醒）→ 再按床「睡到傍晚」（n36 出事的那一步）→ 一樣要在 14:15 叫醒、電話、E37 在 8/30 演
  skip830 8/31 09:00 宿舍、E37 還沒演（8/30 整天錯過的舊存檔）→ 睡到傍晚 → 18:00 開學典禮 → 典禮裡不能接到那通電話、不能演 E37
  cer1800 8/31 18:00 宿舍、E37 已演完、典禮還沒演（18:00 才讀進來）→ 按床 → 要先演開學典禮（LAWWW-B f32a11388 的 bedScene）
  cer831  8/31 09:00 宿舍、E37 已演完 → 床「睡到傍晚」（看選項有沒有提醒 14:00 開學典禮）→ 醒來馬上再按床睡到隔天（n36_qa_nophone 的走法）→ 開學典禮有沒有演、幾點演
用法：LW_TESTS=<工作樹>/tests SHA=<sha> CASE=noon,twice,skip830,cer831 python3 e37nap_probe.py <URL> <輸出資料夾> <final_snap.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SNAP = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
CASES = (os.environ.get('CASE') or 'noon,twice,skip830').split(','); SHA = os.environ.get('SHA', '?')
CALL = '你在哪？行李我都搬到樓下了。'
J = lambda x: json.dumps(x, ensure_ascii=False)
HOOK = r"""(()=>{ window.__S=[]; let last=''; setInterval(()=>{ try{ if(typeof GAME==='undefined'||!GAME.G||!GAME.D) return; const G=GAME.G; const nm=((document.getElementById('dlgName')||{}).textContent||'').trim(); const full=(GAME.D.active&&GAME.D.full)||''; const k=nm+'|'+full;
  if(full&&k!==last){ last=k; window.__S.push({n:nm,t:full.slice(0,80),day:G.day,h:Math.round(G.hour*100)/100,z:G.zone}); } }catch(e){} },200); })();"""


def make_state(day, hour, keep_e37=False):
    s = json.load(open(SNAP, encoding='utf-8'))
    s['day'] = day; s['hour'] = hour; s['zone'] = 'dorm'; s['pos'] = None
    s['weekday'] = 6 if day == -17 else 0   # 2025-08-30 是週六、8/31 週日
    ev = s.get('events') or {}
    for k in ('done', 'last'):
        for e in (('ev_zhe_w1_dorm', 'ev_xc_day1') if keep_e37 else ('ev_y0_e37', 'ev_zhe_w1_dorm', 'ev_xc_day1')): (ev.get(k) or {}).pop(e, None)
    for f in ('CEREMONY_Y1', 'NCCU_FOOD_N', 'E37_LAW', '_forcing'): (s.get('flags') or {}).pop(f, None)
    for o in s.get('outings') or []:
        if o.get('id') == 'y0_e37' and not keep_e37: o['state'] = 'planned'
    return s


async def loop_until(pg, cdp, run, stop, max_s, label, sleepy=False):
    """sleepy＝照 qa_play MODE=sleep 的選法：選項裡有「睡…／再睡／先不要」就先選它（n36 第一次被叫醒時就是這樣又睡回去）"""
    t0 = time.time(); n = 0
    while time.time() - t0 < max_s:
        g = await pg.evaluate("({day:GAME.G.day,h:+GAME.G.hour.toFixed(2),z:GAME.G.zone,e37:!!(GAME.G.events.done||{}).ev_y0_e37,busy:!!(GAME.E.player.busy||(GAME.D&&GAME.D.active))})")
        if stop(g): return g
        s = await L.state(pg)
        if await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled); if(!bs.length) return null; const e=(%s?bs.find(x=>/^(睡|再睡|先不要|晚點|等一下)/.test(x.textContent.trim())):null)||bs.find(x=>/^(出發|直接去|照樣跳過)/.test(x.textContent.trim()))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30),bs.map(b=>b.textContent.trim().slice(0,20))]; })()" % ('true' if sleepy else 'false'))
            if c: await L.touch_tap(cdp, c[0], c[1]); n += 1; run.note('%s 選：%s（選項 %s）' % (label, c[2], J(c[3]))); await pg.wait_for_timeout(800)
            continue
        await pg.wait_for_timeout(500)
    return await pg.evaluate("({day:GAME.G.day,h:+GAME.G.hour.toFixed(2),z:GAME.G.zone,e37:!!(GAME.G.events.done||{}).ev_y0_e37,timeout:true})")


async def nap(pg, cdp, run, label):
    """走到床邊、按床、選「睡到傍晚（不設鬧鐘）」；回傳選項全文"""
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return None
    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, label + ' 床', max_s=120)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const all=bs.map(b=>b.textContent.trim()); const e=bs.find(x=>/^睡到傍晚/.test(x.textContent.trim())); if(!e) return {all}; const r=e.getBoundingClientRect(); return {all, x:r.left+r.width/2, y:r.top+r.height/2, t:e.textContent.trim()}; })()")
    run.note('%s 床的選項：%s' % (label, J(c.get('all'))))
    if 'x' not in c: return c
    await L.touch_tap(cdp, c['x'], c['y']); await pg.wait_for_timeout(1500); return c


async def main():
    run = L.Run('e37nap', OUT)
    async with async_playwright() as p:
        for case in CASES:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await pg.add_init_script(HOOK); await pg.goto(URL)
            if not await L.wait_loaded(pg): run.check('%s 遊戲載入' % case, False); await b.close(); continue
            day, hour = {'noon': (-17, 12.0), 'twice': (-17, 7.5), 'skip830': (-16, 9.0), 'cer831': (-16, 9.0), 'cer1800': (-16, 18.0)}[case]
            await L.load_state(pg, make_state(day, hour, keep_e37=(case in ('cer831', 'cer1800')))); await pg.wait_for_timeout(5000)
            run.setup('[前置] %s：讀 n36_qa_sleep 的最後狀態改到 %s %.1f 宿舍；拿掉 E37／開學典禮紀錄、y0_e37 約改回 planned（SHA %s）' % (case, '2025-08-30' if day == -17 else '2025-08-31', hour, SHA))
            info = {}
            if case in ('noon', 'twice'):
                c1 = await nap(pg, cdp, run, case + ' 第一次'); info['nap1'] = c1 and c1.get('t')
                if case == 'twice':
                    g = await loop_until(pg, cdp, run, lambda g: g['day'] != -17 or (g['h'] >= 12.9 and not g.get('busy')) or g['e37'], 240, case, sleepy=True)   # 叫醒後出發提示要是有「先不要／再睡」就照 n36 選它，空下來再按床
                    run.note('twice 第一次醒來：%s' % J(g)); info['wake1'] = g
                    if not g['e37'] and g['day'] == -17:
                        c2 = await nap(pg, cdp, run, case + ' 第二次'); info['nap2'] = c2 and c2.get('t')
                g = await loop_until(pg, cdp, run, lambda g: g['e37'] and g['z'] == 'dorm' or g['day'] >= -15, 900, case)
            elif case == 'cer1800':
                bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
                if bed: await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, case + ' 床', max_s=120); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
                info['afterTap'] = await pg.evaluate("({zone:GAME.G.zone,cer:!!GAME.G.flags.CEREMONY_Y1,choices:[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,30)),dlg:!!(GAME.D&&GAME.D.active)})")
                g = await loop_until(pg, cdp, run, lambda g: g['day'] >= -15, 900, case)
                info['cer'] = await pg.evaluate("!!GAME.G.flags.CEREMONY_Y1")
            elif case == 'cer831':
                c1 = await nap(pg, cdp, run, case + ' 早上'); info['nap1'] = c1 and c1.get('t'); info['menu1'] = c1 and c1.get('all')
                g = await loop_until(pg, cdp, run, lambda g: g['day'] != -16 or g['h'] >= 13.0, 300, case); info['wake1'] = g
                g = await loop_until(pg, cdp, run, lambda g: g['day'] != -16 or g['h'] >= 20.0 or (g['z'] == 'dorm' and not g.get('busy')), 600, case + ' 醒來以後')   # 醒來的那一刻可能已經在演典禮：點完再按床
                c2 = await nap(pg, cdp, run, case + ' 醒來馬上再睡'); info['nap2'] = c2 and c2.get('t'); info['menu2'] = c2 and c2.get('all')
                if c2 and 'x' not in c2:   # 沒有「睡到傍晚」（晚上了）＝選「睡到明天早上」
                    c3 = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>/^睡到明天/.test(x.textContent.trim())); if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })()")
                    if c3: await L.touch_tap(cdp, c3[0], c3[1]); info['nap2'] = c3[2]
                g = await loop_until(pg, cdp, run, lambda g: g['day'] >= -15, 900, case)
                info['cer'] = await pg.evaluate("!!GAME.G.flags.CEREMONY_Y1")
            else:
                c1 = await nap(pg, cdp, run, case); info['nap1'] = c1 and c1.get('t')
                g = await loop_until(pg, cdp, run, lambda g: g['day'] >= -15 or (g['day'] == -16 and g['h'] >= 21.5), 1200, case)
            S = await pg.evaluate("window.__S||[]"); info['end'] = g
            await run.shot(pg, 'e37nap_%s_end' % case)
            json.dump(S, open(os.path.join(OUT, 'say_%s.json' % case), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
            call = [x for x in S if x['t'].startswith(CALL)]; e37 = [x for x in S if x['t'].startswith('（八月三十日')]
            run.note('%s：%s；電話 %s；E37 第一句 %s' % (case, J(info), J(call), J(e37)))
            for x in S[-12:]: run.note('   %s %s %s %s｜%s' % (x['day'], x['h'], x['z'], x['n'], x['t'][:50]))
            if case in ('noon', 'twice'):
                run.check('%s：8/30 電話「%s」在 14:15～15:00 之間（宿舍）' % (case, CALL), bool(call) and call[0]['day'] == -17 and 14.2 <= call[0]['h'] <= 15.0, J(call))
                run.check('%s：E37 在 8/30 演（「（八月三十日。…）」那天是 8/30）' % case, bool(e37) and e37[0]['day'] == -17, J(e37))
                run.check('%s：演完回到宿舍（8/30 晚上）' % case, g.get('e37') and g['z'] == 'dorm' and g['day'] == -17, J(g))
            elif case == 'cer1800':
                cer = [x for x in S if x['z'] == 'gym_arena']
                run.note('cer1800 按床以後：%s；典禮 %d 句、第一句 %s' % (J(info.get('afterTap')), len(cer), J(cer[:1])))
                run.check('cer1800：18:00 才讀進來、典禮還沒演＝按床先演開學典禮（8/31 當天）', info.get('cer') and bool(cer) and cer[0]['day'] == -16, J({'cer': info.get('cer'), 'first': cer[:1], 'afterTap': info.get('afterTap')}))
            elif case == 'cer831':
                cer = [x for x in S if x['z'] == 'gym_arena']
                run.note('cer831 床的選項：早上 %s；醒來 %s' % (J(info.get('menu1')), J(info.get('menu2'))))
                run.note('cer831：8/31 早上床的選項有沒有寫典禮（只記；f32a11388 的修法是任何選項都 14:00 醒）：%s' % J([t for t in (info.get('menu1') or []) if '典禮' in (t or '')]))
                run.check('cer831：早上睡到傍晚＝14:00 前後醒來（第一次醒來 13.9～14.6）', (info.get('wake1') or {}).get('day') == -16 and 13.9 <= (info.get('wake1') or {}).get('h', 0) <= 14.6, J(info.get('wake1')))
                run.check('cer831：開學典禮有演（CEREMONY_Y1），8/31 當天', info.get('cer') and bool(cer) and cer[0]['day'] == -16, J({'cer': info.get('cer'), 'first': cer[:1], 'n': len(cer)}))
                run.note('cer831 典禮第一句的時間（照設計 14:00）：%s' % J(cer[:1]))
            else:
                run.check('skip830：8/31 不打「%s」、不演 E37（典禮裡也不會）' % CALL, not call and not e37 and not g.get('e37'), J({'call': call, 'e37': e37, 'end': g}))
                cer = [x for x in S if x['z'] == 'gym_arena']
                run.note('skip830 開學典禮：%d 句；最後在 %s' % (len(cer), J(g)))
            run.check('%s：沒有 JS 例外' % case, not errs, J(errs[:3]))
            await b.close()
    sys.exit(run.finish())
asyncio.run(main())
