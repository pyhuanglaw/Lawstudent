"""BB-B 2026-11-07：PLAYTEST-1107 三項修正的瀏覽器驗收（LAWWW-B 5efd46e4e，測試樹 70cd58a2d）。
MODE=pe     BUG-PE-CLASS-1107：體育課用手機「今天」的一鍵上課 → 進體育館（gym，游泳週是 gym_b1）、在館內上課，不是停在法律系館A前。
MODE=yizhan BUG-YIZHAN-1107：去過一盞（使用者存檔 visited.wz_teahouse＝true）、營業時間（週六 18:10）→ 手機「地點」有一盞，點了就到一盞（wz_teahouse）。
MODE=shanlan SHOP-STAFF-1107 山嵐一項：走到書架間「坐在…看書」、按互動 → 坐在地板、姿勢 read（書只在 read 畫出來）。
[前置／捷徑] 讀使用者 11-07 的存檔（AA-B 收在 claude/cool-heisenberg-o8kuqx 的 user_saves/2026-11-07/）；pe、shanlan 另外改日期、時間、區域（標【捷徑】）。之後全部觸控。
用法：LW_TESTS=<測試樹>/tests MODE=pe python3 pt1107_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'pe')
ZONE = "(GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id)"


def save(name):
    return json.load(open(os.path.join(SAVES, name), encoding='utf-8'))


async def phone(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(800)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(sel))
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def drain(pg, cdp, until_js, secs=120, log=None):
    """點對話、遇到選項點第一個（不是「算了／返回」的），直到 until_js 成立"""
    for _ in range(secs * 2):
        if await pg.evaluate(until_js): return True
        q = await L.state(pg)
        if log is not None and q['dtext'] and (not log or log[-1] != q['dtext']): log.append(q['dtext'])
        if q['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=bs.find(x=>!/算了|返回|取消/.test(x.textContent))||bs[0]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })()")
            if c:
                if log is not None: log.append('選：' + c[2])
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False


async def pe(pg, cdp, run):
    s = save('fatiao3d_save_day38.json')
    found = await pg.evaluate("""(st=>{ const G=Object.assign(GAME.defaults(st.name||'祐廷'),st); for(let d=st.day; d<st.day+21; d++){ const its=CLS.dayItems(G,d)||[]; const it=its.find(q=>q.room&&q.room.door==='gym'); if(it){ const w=CALENDAR.dateOf(d).wd; return {day:d, wd:w===7?0:w, key:it.key, name:it.name||it.title||'', t0:it.t0, t1:it.t1}; } } return null; })(%s)""" % json.dumps(s))
    run.check('從使用者存檔往後 3 週找得到體育課', bool(found), json.dumps(found, ensure_ascii=False))
    if not found: return
    s2 = dict(s); s2.update({'day': found['day'], 'weekday': found['wd'], 'hour': found['t0'] - 0.75, 'zone': 'dorm', 'pos': None})
    run.setup('【捷徑】使用者存檔 day38 改成體育課那天（第 %d 天）上課前 45 分鐘、宿舍' % found['day'])
    await L.load_state(pg, s2, quiet_phone=True)
    await pg.wait_for_timeout(3500)
    await drain(pg, cdp, "!GAME.D.active&&!document.querySelector('#choices button')&&!(GAME.E.player&&GAME.E.player.busy)", 60)
    await phone(pg, cdp, 'today')
    sel = '#phoneBody [data-go="%s"]' % found['key']
    has = await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel))
    run.check('手機「今天」體育課有「直接去上課」的按鈕', has, (await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''"))[:200])
    if not has: return
    await tap_sel(pg, cdp, sel)
    log = []
    z_seen = []
    for _ in range(240):
        z = await pg.evaluate(ZONE)
        if not z_seen or z_seen[-1] != z: z_seen.append(z)
        if await pg.evaluate("(k=>{ const R=GAME.G.courses||{}; return !!((R.done||{})[k]||(R.attend||{})[k]); })(%s)" % json.dumps(found['key'])): break
        q = await L.state(pg)
        if q['dtext'] and (not log or log[-1] != q['dtext']): log.append(q['dtext'])
        if q['choices']:
            o = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            log.append('選項：' + '｜'.join(o))
            break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    await run.shot(pg, 'pe_after_go')
    print('   區域', z_seen, '\n   台詞', log[:25], flush=True)
    run.check('一鍵上課以後進了體育館（gym 或 gym_b1），沒有停在校園', any(z in ('gym', 'gym_b1') for z in z_seen), json.dumps(z_seen))
    rec = await pg.evaluate("(k=>{ const R=GAME.G.courses||{}; return {done:(R.done||{})[k]||null, attend:(R.attend||{})[k]||null}; })(%s)" % json.dumps(found['key']))
    run.check('這堂體育課有記到上課（courses.done／attend）', bool(rec['done'] or rec['attend']), json.dumps(rec, ensure_ascii=False))
    run.check('上課的旁白沒有「法律系館A前」', not any('法律系館A前' in l or '法律系館 A 前' in l for l in log), json.dumps([l for l in log if '法律系館' in l], ensure_ascii=False))


async def yizhan(pg, cdp, run):
    s = save('fatiao3d_save_day46_1.json')
    run.setup('讀使用者存檔 day46_1（第 46 天週六 18:10 木曜日；visited.wz_teahouse＝%s）' % (s.get('visited') or {}).get('wz_teahouse'))
    await L.load_state(pg, s, quiet_phone=True)
    await pg.wait_for_timeout(3500)
    await drain(pg, cdp, "!GAME.D.active&&!document.querySelector('#choices button')&&!(GAME.E.player&&GAME.E.player.busy)", 60)
    txt = await phone(pg, cdp, 'places')
    run.check('手機「地點」有一盞', '一盞' in txt, txt[:300])
    # 地點分區（data-parea）展開以後，一盞那一列是 [data-place="wz_teahouse|…"]（第一輪點到整個溫州街分區，不算）
    if not await pg.evaluate("!!document.querySelector('#phoneBody [data-place^=\"wz_teahouse|\"]')"):
        await tap_sel(pg, cdp, '#phoneBody [data-parea="wenzhou"]'); await pg.wait_for_timeout(800)
    btn = await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody [data-place^=\"wz_teahouse|\"]'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.outerHTML.slice(0,160)]; })()")
    run.check('「一盞」那一列點得到', bool(btn), json.dumps(btn, ensure_ascii=False))
    if not btn: return
    await pg.wait_for_timeout(400)
    await L.touch_tap(cdp, btn[0], btn[1]); await pg.wait_for_timeout(1500)
    log = []
    ok = await drain(pg, cdp, ZONE + "==='wz_teahouse'&&!GAME.D.active", 120, log)
    await run.shot(pg, 'yizhan_arrive')
    run.check('點了就到一盞（wz_teahouse）', ok, json.dumps({'zone': await pg.evaluate(ZONE), 'log': log[:12]}, ensure_ascii=False))
    pin = await pg.evaluate("(()=>{ try{ return JSON.stringify(PLACEMAP&&PLACEMAP.PINS||null).includes('wz_teahouse'); }catch(e){ return String(e); } })()")
    print('   大地圖資料有 wz_teahouse：', pin, flush=True)


async def shanlan(pg, cdp, run):
    s = save('fatiao3d_save_day46_1.json')
    s2 = dict(s); s2.update({'zone': 'xs_shanlan', 'hour': 14.0, 'pos': None})
    run.setup('【捷徑】使用者存檔 day46_1 改成 14:00、山嵐書店門口')
    await L.load_state(pg, s2, quiet_phone=True)
    await pg.wait_for_timeout(4000)
    await drain(pg, cdp, "!GAME.D.active&&!document.querySelector('#choices button')&&!(GAME.E.player&&GAME.E.player.busy)", 60)
    spots = await pg.evaluate("GAME.E.interactables.map((i,n)=>({n, label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||i.r, lv:i.lv|0, hidden:!!i.hidden, shl:!!i.shlSit})).filter(i=>i.shl||(/^坐在/.test(i.label||'')&&/看書/.test(i.label||'')))")
    open_ = await pg.evaluate("(()=>{ try{ return SHL.sitOpen(GAME.G); }catch(e){ return String(e); } })()")
    print('   坐地板的點', spots, ' sitOpen', open_, flush=True)
    run.check('山嵐有「坐在…看書」（坐地板）', bool(spots), json.dumps(spots, ensure_ascii=False)[:300])
    got = None
    for sp in spots[:4]:
        lab = sp['label']
        ok = await L.go_to(pg, cdp, run, sp['x'], sp['z'], max(0.4, (sp['r'] or 1) * 0.6), lab, lv=sp['lv'])
        s3 = await L.state(pg)
        for _ in range(12):
            if (s3['interact'] or '').startswith(lab): break
            await pg.wait_for_timeout(500); s3 = await L.state(pg)
        d = ((s3['x'] - sp['x']) ** 2 + (s3['z'] - sp['z']) ** 2) ** 0.5
        plv = await pg.evaluate("GAME.E.player.lv|0")
        print('   試 #%d %s (%.2f,%.2f) lv%d r=%s hidden=%s → 停在 (%.2f,%.2f) lv%d 距離 %.2f 互動鍵「%s」' % (sp['n'], lab, sp['x'], sp['z'], sp['lv'], sp['r'], sp['hidden'], s3['x'], s3['z'], plv, d, s3['interact']), flush=True)
        if (s3['interact'] or '').startswith(lab):
            got = (sp, lab); break
    run.check('走到書架間的坐地板點、互動鍵出現（試前 %d 個）' % min(4, len(spots)), bool(got), json.dumps(spots[:4], ensure_ascii=False))
    if not got: return
    await L.tap(pg, cdp, '#interact')
    poses, log, shot = [], [], False
    for _ in range(160):   # 坐著看書的那一段（旁白還在）就要看到 read；演完會站起來
        st = await pg.evaluate("(()=>{ const P=GAME.E.player; const d=document.getElementById('dlg'); return {pose:P.pose, idle:P.idlePose, y:+P.obj.position.y.toFixed(2), dlg:!!(d&&!d.classList.contains('hide')), txt:(document.getElementById('dtext')||{}).textContent||''}; })()")
        if not poses or poses[-1] != st['pose']: poses.append(st['pose'])
        if st['txt'] and (not log or log[-1] != st['txt']): log.append(st['txt'])
        if st['pose'] == 'read' and not shot:
            await pg.wait_for_timeout(1200); await run.shot(pg, 'shanlan_sit_read'); shot = True
        if shot and not st['dlg'] and st['pose'] != 'read': break
        if st['dlg'] and shot: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(300)
    print('   姿勢變化', poses, ' 旁白', log[:4], flush=True)
    run.check('坐下看書時姿勢是 read（手上有書）', 'read' in poses, json.dumps({'poses': poses, 'log': log[:6]}, ensure_ascii=False))
    run.check('看完會站起來（不卡在地板）', poses[-1] != 'read', json.dumps(poses))


async def main():
    run = L.Run('pt1107_' + MODE, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await {'pe': pe, 'yizhan': yizhan, 'shanlan': shanlan}[MODE](pg, cdp, run)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
