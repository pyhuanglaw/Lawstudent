"""BB（帳號 A）2026-10-22：LAWWW 06:46 派（開發分支 f2336295 起：LAWWW2 六件場景美術整合）——BB 自己補的瀏覽器畫面檢查。
LAWWW 指定的四支現成測試（wz_street_integration、gongguan_layout_nav、reachability_all --zones wenzhou,gongguan、flow_dorm_hall）另外排，這支只做它們沒拍的：
  WZ_SHOPS  溫州街 林家乾麵（wz_lin）、巷子裡定食（wz_teishoku）：從溫州街的店門走進去 → 最靠門口那張桌子「坐下」→ 拍照 → 站起來；
            定食店再坐吧台高腳凳（座位 lift 0.31＝人在凳面上，不是坐進凳子裡）；兩家店的網點透空材質（定食的和紙燈籠）載入後有沒有標上；從門口出去回溫州街。
  WZ_CAM    一盞（wz_teahouse）後面的和室坐墊、中間茶席；半熟（wz_brunch）左牆的位子：坐下拍照（LAWWW2 wz_shops_cam：紙拉門、排煙罩、吊燈不擋人）；半熟的吊燈、燈泡有網點透空
  L118_BAR  118 巷 Pasta 118（l118_pasta）：從巷子的店門進去，坐吧檯高腳椅（lift 0.31）量人的高度、拍照；再坐一般的桌子對照
  LOUNGE    男宿交誼廳（dorm_hall）：走到沙發、電視、自動販賣機、飲水機、長椅旁邊拍照；坐沙發；看販賣機那一句（家具做細了，LAWWW2 ART-DORM-LOUNGE-1021）
  ZR_BAR    ART-ZR-PS-3D-1022（LAWWW 沒拍到的）：芷若在兩點半 Café 當班（大一上週五 13～17 點）——吧台前面、坐吧台座位看她、跟她說話時的畫面；
            另外找沛珊（照作息找她在哪）走過去說話拍照。正式驗收是 LAWWW（D100），這裡只拍、只記看到什麼。
【前置】讀使用者存檔改日期、時間、地點（quiet_events：條件事件不演）。之後照玩家：走路、點門、點「坐下」「站起來」、點對話。
Playwright 手機橫向模擬、不用 turbo（走路要真的走），不是 iPhone。場景美術只有使用者能標 ART_APPROVED；這裡記 PASS／FAIL 的只有「走得進去、坐得下、出得來、高度、材質旗標」這些功能面。
用法：LW_TESTS=<開發分支>/tests SCEN=WZ_SHOPS,WZ_CAM,L118_BAR,LOUNGE,ZR_BAR python3 art1022_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', 'WZ_SHOPS,WZ_CAM,L118_BAR,LOUNGE,ZR_BAR').split(',') if s]
os.makedirs(OUT, exist_ok=True)
def say(*a): print(' '.join(str(x) for x in a), flush=True)

ITS = """(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), lv:i.lv|0, label:i.label||'', to:i.exit&&i.exit.to||null,
  seat:i.seat?{x:+i.seat.x.toFixed(2), z:+i.seat.z.toFixed(2), lift:i.seat.lift||0, yaw:+(+(i.seat.yaw||0)).toFixed(2)}:null})))()"""
PST = """(()=>{ const E=GAME.E, P=E.player, c=E.camera.position, n=E.nav; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), key:CALENDAR.dateOf(GAME.G.day).key,
  seat:P.seat?{x:+P.seat.x.toFixed(2), z:+P.seat.z.toFixed(2), lift:P.seat.lift||0}:null, px:+P.obj.position.x.toFixed(2), py:+P.obj.position.y.toFixed(3), pz:+P.obj.position.z.toFixed(2),
  pose:P.pose||'', busy:!!P.busy, cam:[+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)], nav:n?[n.ox, n.oz, n.w, n.h]:null,
  btn:(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()}; })()"""
OCC = """(pts=>pts.map(([x,z])=>{ const n=(GAME.E.npcs||[]).find(q=>q&&q.seat&&Math.hypot(q.seat.x-x,q.seat.z-z)<0.35); return n?(n.charId||n.id||'路人'):null; }))"""   # 照遊戲自己的判斷（game3d.js E.nearestInteractable 的 occupied：NPC 的 seat 離座位 < 0.35 m）
SEE = """(names=>{ const found={}; GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||!names.includes(m.name)) continue;
  const f=found[m.name]||(found[m.name]={n:0, see:0}); f.n++; if(m.userData&&m.userData.seeThrough) f.see++; } }); return found; })"""
NPC = """(id=>{ const n=(GAME.E.npcs||[]).find(x=>x&&x.charId===id&&x.obj&&x.obj.visible!==false&&!x.hidden); if(!n) return null; const P=GAME.E.player.obj.position;
  return {x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), pose:n.pose||'', beh:n.beh||'', staff:n.staff||'', label:n.talkLabel||'', d:+Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z).toFixed(2)}; })"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push(((w&&w.name)?w.name+'：':'')+String(t||'')); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push('［選項］'+JSON.stringify((o||[]).map(x=>x.t))); }catch(e){} return c0.apply(this,arguments); }; })()"""
PREF = ('就這樣', '算了', '不用了', '先不要', '離開', '不買')
out = {}


def chk(run, sid, name, ok, info=''):
    run.check('%s：%s' % (sid, name), ok, info if isinstance(info, str) else json.dumps(info, ensure_ascii=False)[:600])


async def load(p, run, base, key, h, zone, label):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key))
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: G['flags'][k] = dd
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK)
    await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
    run.setup('[前置] %s：使用者存檔改到 %s %05.2f %s（quiet_events）' % (label, key, h, zone))
    return b, pg, cdp, errs


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def drain(pg, cdp, secs=90):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            ops = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            k = next((i for i, o in enumerate(ops) if o.startswith(PREF)), len(ops) - 1)
            c = await pg.evaluate("(i=>{ const e=document.querySelectorAll('#choices button')[i]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
            await L.touch_tap(cdp, c[0], c[1]); say('   ▶ 選「%s」（%s）' % (ops[k], ' / '.join(o[:14] for o in ops))); await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        if s['busy']: await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(800); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False


async def go_it(pg, cdp, run, it, r=0.8, max_s=180):
    ok = await L.go_to(pg, cdp, run, it['x'], it['z'], r, it['label'] or '互動點', max_s=max_s, lv=it.get('lv', 0))
    for _ in range(8):   # 互動按鈕每隔幾格才更新（1 fps）
        if (await pg.evaluate(PST))['btn']: break
        await pg.wait_for_timeout(700)
    return ok


async def use(pg, cdp, run, pred, want_zone=None, max_s=240, desc=''):
    its = await pg.evaluate(ITS); it = next((i for i in its if pred(i)), None)
    if not it: say('   ⚠ 找不到「%s」（有：%s）' % (desc, [i['label'] for i in its][:30])); return False, None
    ok = await go_it(pg, cdp, run, it, 0.9, max_s)
    btn = (await pg.evaluate(PST))['btn']; say('   走到「%s」：%s；互動鈕「%s」' % (it['label'], ok, btn))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); await drain(pg, cdp, 40)
    if want_zone:
        for _ in range(30):
            if await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy" % json.dumps(want_zone)): break
            await pg.wait_for_timeout(800)
    return ok, it


async def sit(pg, cdp, run, it, tag):
    """走到座位的互動點、按「坐」：回傳坐下以後的狀態（沒坐下＝seat null）"""
    await go_it(pg, cdp, run, it, 0.6, 150)
    st = await pg.evaluate(PST)
    if '坐' not in st['btn']:   # 旁邊別的互動點比較近：再走近一點
        await L.go_to(pg, cdp, run, it['x'], it['z'], 0.35, it['label'], max_s=60, lv=it.get('lv', 0)); await pg.wait_for_timeout(1500); st = await pg.evaluate(PST)
    say('   %s 座位 %s 互動鈕「%s」' % (tag, json.dumps(it['seat']), st['btn']))
    await L.tap(pg, cdp, '#interact')
    for _ in range(15):
        await pg.wait_for_timeout(800); st = await pg.evaluate(PST)
        if st['seat']: break
    await pg.wait_for_timeout(1500); st = await pg.evaluate(PST); st['btn0'] = st['btn']; return st


async def stand(pg, cdp):
    st = await pg.evaluate(PST)
    if st['seat']:
        await L.tap(pg, cdp, '#interact')
        for _ in range(10):
            await pg.wait_for_timeout(700)
            if not (await pg.evaluate(PST))['seat']: break
    await drain(pg, cdp, 20)


def nearest(seats, x, z, cond=lambda s: True):
    c = [s for s in seats if cond(s)]
    return sorted(c, key=lambda s: (s['x'] - x) ** 2 + (s['z'] - z) ** 2)[0] if c else None


# ---------------------------------------------------------------- WZ_SHOPS
async def s_wz_shops(p, run, base, sid):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await load(p, run, base, '2025-10-04', 12.5, 'wenzhou', sid + '（10/4 週六中午溫州街）')
    try:
        for k, nm in (('lin', '林家乾麵'), ('teishoku', '巷子裡定食')):
            r = res.setdefault(k, {}); zid = 'wz_' + k
            ok, it = await use(pg, cdp, run, lambda i: i['to'] == zid, zid, desc=nm + '的門')
            st = await pg.evaluate(PST); r['enter'] = st
            chk(run, sid, '%s：從溫州街的店門（%s）走進去' % (nm, it['label'] if it else '—'), st['zone'] == zid, st)
            if st['zone'] != zid: continue
            await pg.wait_for_timeout(6000); await run.shot(pg, '%s_%s_enter' % (sid, k))
            sp = (st['px'], st['pz']); its = await pg.evaluate(ITS); seats = [i for i in its if i['seat']]
            r['seats'] = len(seats); r['lift_seats'] = len([i for i in seats if i['seat']['lift']])
            first = nearest(seats, sp[0], sp[1], lambda s: not s['seat']['lift'])
            if first:
                s1 = await sit(pg, cdp, run, first, nm); r['sit'] = s1; await run.shot(pg, '%s_%s_sit' % (sid, k))
                chk(run, sid, '%s：最靠門口的桌子「坐下」坐得下（%s）' % (nm, first['label']), bool(s1['seat']), s1)
                await stand(pg, cdp)
            if k == 'teishoku':
                bar = nearest(seats, sp[0], sp[1], lambda s: s['seat']['lift'] > 0)
                if bar:
                    s2 = await sit(pg, cdp, run, bar, nm + '吧台'); r['bar'] = s2; await run.shot(pg, '%s_%s_bar' % (sid, k))
                    lift = bar['seat']['lift']
                    chk(run, sid, '%s：吧台高腳凳坐得下、人抬高到凳面（座位 lift %.2f，人的高度 %.2f）' % (nm, lift, s2['py']), bool(s2['seat']) and abs(s2['py'] - lift) < 0.12, s2)
                    await stand(pg, cdp)
                else: chk(run, sid, '%s：有吧台高腳凳（lift）的座位' % nm, False, its)
            names = await pg.evaluate("(k=>{ const L=typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT[k]; return L&&L.seeThru||[]; })(%s)" % json.dumps(k))
            if names:
                see = await pg.evaluate(SEE + "(%s)" % json.dumps(names)); r['seeThru'] = {'names': names, 'found': see}
                ok_see = bool(see) and all(v['see'] == v['n'] for v in see.values())
                chk(run, sid, '%s：網點透空的材質（%s）載入後都有標上' % (nm, '、'.join(names)), ok_see, {'names': names, 'found': see})
            ok, it2 = await use(pg, cdp, run, lambda i: i['to'] == 'wenzhou', 'wenzhou', desc=nm + '的出口')
            st = await pg.evaluate(PST); r['exit'] = st
            chk(run, sid, '%s：從門口出去回溫州街（%s）' % (nm, it2['label'] if it2 else '—'), st['zone'] == 'wenzhou', st)
        res['errs'] = errs[:3]; chk(run, sid, '沒有 JS 例外', not errs, errs[:3])
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); chk(run, sid, '測試跑完', False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- WZ_CAM
async def s_wz_cam(p, run, base, sid):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await load(p, run, base, '2025-10-04', 13.0, 'wenzhou', sid + '（10/4 週六 13:00 溫州街）')
    try:
        SH = [x for x in os.environ.get('SHOPS', 'teahouse,brunch').split(',') if x]
        for n_, (k, nm, picks) in enumerate([t for t in (('teahouse', '一盞', ('back_left', 'back_right', 'mid')), ('brunch', '半熟', ('left', 'right'))) if t[0] in SH]):
            r = res.setdefault(k, {}); zid = 'wz_' + k
            if n_ > 0:   # 2026-10-22（候選 364dabe0 第一輪）：從一盞門口走到半熟門口約 63 m，1 fps 四分鐘走不到；改成重新讀檔回溫州街主巷再走（約 13 m）
                await close(b); b, pg, cdp, errs = await load(p, run, base, '2025-10-04', 13.0, 'wenzhou', sid + '（10/4 週六 13:00 溫州街，%s）' % nm)
            ok, it = await use(pg, cdp, run, lambda i: i['to'] == zid, zid, desc=nm + '的門')
            st = await pg.evaluate(PST); r['enter'] = st
            chk(run, sid, '%s：從溫州街的店門走進去' % nm, st['zone'] == zid, st)
            if st['zone'] != zid: continue
            await pg.wait_for_timeout(6000); await run.shot(pg, '%s_%s_enter' % (sid, k))
            seats = [i for i in await pg.evaluate(ITS) if i['seat']]; r['seats'] = [i['seat'] for i in seats]
            if not seats: chk(run, sid, '%s：有座位' % nm, False, ''); continue
            xs = sorted(seats, key=lambda s: s['seat']['x']); zs = sorted(seats, key=lambda s: s['seat']['z'])
            pick = {'back_left': nearest(seats, xs[0]['seat']['x'], zs[0]['seat']['z']), 'back_right': nearest(seats, xs[-1]['seat']['x'], zs[0]['seat']['z']),
                    'mid': nearest(seats, 0, (zs[0]['seat']['z'] + zs[-1]['seat']['z']) / 2), 'left': nearest(seats, xs[0]['seat']['x'], 0), 'right': nearest(seats, xs[-1]['seat']['x'], 0)}
            for pk in picks:
                it = pick.get(pk)
                if not it: continue
                s1 = await sit(pg, cdp, run, it, '%s %s' % (nm, pk)); r[pk] = s1; await run.shot(pg, '%s_%s_%s' % (sid, k, pk))
                chk(run, sid, '%s：%s 的位子坐得下（%s）' % (nm, pk, it['label']), bool(s1['seat']), s1)
                await stand(pg, cdp)
            names = await pg.evaluate("(k=>{ const L=typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT[k]; return L&&L.seeThru||[]; })(%s)" % json.dumps(k))
            if names:
                see = await pg.evaluate(SEE + "(%s)" % json.dumps(names)); r['seeThru'] = {'names': names, 'found': see}
                chk(run, sid, '%s：網點透空的材質（%s）載入後都有標上' % (nm, '、'.join(names)), bool(see) and all(v['see'] == v['n'] for v in see.values()), {'names': names, 'found': see})
            ok, it2 = await use(pg, cdp, run, lambda i: i['to'] == 'wenzhou', 'wenzhou', desc=nm + '的出口')
            chk(run, sid, '%s：從門口出去回溫州街' % nm, (await pg.evaluate("GAME.G.zone")) == 'wenzhou', await pg.evaluate(PST))
        res['errs'] = errs[:3]; chk(run, sid, '沒有 JS 例外', not errs, errs[:3])
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); chk(run, sid, '測試跑完', False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- L118_BAR
async def s_l118(p, run, base, sid):
    res = out.setdefault(sid, {})
    for key, h in (('2025-10-04', 12.5), ('2025-10-01', 12.5), ('2025-10-01', 18.5)):
        b, pg, cdp, errs = await load(p, run, base, key, h, 'lane118', sid + '（118 巷）')
        try:
            its = await pg.evaluate(ITS); door = next((i for i in its if i['to'] == 'l118_pasta'), None)
            res.setdefault('tries', []).append({'key': key, 'h': h, 'door': door})
            if not door: say('   %s %.1f Pasta 118 沒開（門的互動點藏起來）' % (key, h)); await close(b); continue
            ok, it = await use(pg, cdp, run, lambda i: i['to'] == 'l118_pasta', 'l118_pasta', desc='Pasta 118 的門')
            st = await pg.evaluate(PST); res['enter'] = st
            chk(run, sid, '%s %.1f 從 118 巷的店門走進 Pasta 118' % (key, h), st['zone'] == 'l118_pasta', st)
            if st['zone'] != 'l118_pasta': await close(b); break
            await pg.wait_for_timeout(6000); await run.shot(pg, '%s_enter' % sid)
            seats = [i for i in await pg.evaluate(ITS) if i['seat']]; sp = (st['px'], st['pz'])
            bar = nearest(seats, sp[0], sp[1], lambda s: s['seat']['lift'] > 0); tbl = nearest(seats, sp[0], sp[1], lambda s: not s['seat']['lift'])
            if bar:
                s1 = await sit(pg, cdp, run, bar, '吧檯'); res['bar'] = s1; await run.shot(pg, '%s_bar' % sid)
                chk(run, sid, '吧檯高腳椅坐得下、人抬高到凳面（座位 lift %.2f，人的高度 %.2f；修改前坐進凳子裡＝0）' % (bar['seat']['lift'], s1['py']), bool(s1['seat']) and abs(s1['py'] - bar['seat']['lift']) < 0.12, s1)
                await pg.evaluate("(()=>{ const P=GAME.E.player.obj, s=GAME.E.player.seat; if(!s) return; const yaw=(s.yaw||0)+Math.PI/2; GAME.E.cinematic(new THREE.Vector3(P.position.x+Math.sin(yaw)*2.4, 1.3, P.position.z+Math.cos(yaw)*2.4), new THREE.Vector3(P.position.x, 0.8, P.position.z)); GAME.E.snapCinematic(); })()")
                await pg.wait_for_timeout(2500); await run.shot(pg, '%s_bar_side' % sid); await pg.evaluate("GAME.E.endCinematic()")
                run.note('%s：吧檯側面那一張是【捷徑】劇情鏡頭只動鏡頭（從人的側面 2.4 m 看坐姿），不是玩家的鏡頭' % sid)
                await stand(pg, cdp)
            else: chk(run, sid, 'Pasta 118 有吧檯高腳椅（lift）的座位', False, seats)
            if tbl:
                s2 = await sit(pg, cdp, run, tbl, '一般桌子'); res['table'] = s2; await run.shot(pg, '%s_table' % sid)
                chk(run, sid, '一般的桌子照舊坐得下、人在地上的高度（%.2f）' % s2['py'], bool(s2['seat']) and abs(s2['py']) < 0.12, s2)
                await stand(pg, cdp)
            res['errs'] = errs[:3]; chk(run, sid, '沒有 JS 例外', not errs, errs[:3])
        except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); chk(run, sid, '測試跑完', False, str(e)[:300])
        await close(b); break
    if 'enter' not in res: chk(run, sid, '找到 Pasta 118 開著的時候', False, res.get('tries'))


# ---------------------------------------------------------------- LOUNGE
async def s_lounge(p, run, base, sid):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await load(p, run, base, '2025-10-04', 20.0, 'dorm_hall', sid + '（10/4 週六 20:00 宿舍一樓）')
    try:
        its = await pg.evaluate(ITS); res['its'] = [i['label'] for i in its]
        for pat in ('看自動販賣機', '看飲水機', '看電視', '坐在沙發上', '坐在長椅上'):
            it = next((i for i in its if pat in i['label']), None)
            if not it: chk(run, sid, '交誼廳有「%s」' % pat, False, res['its']); continue
            if pat.startswith('坐'):
                cands = [i for i in its if pat in i['label']]
                occ = await pg.evaluate(OCC + "(%s)" % json.dumps([[i['seat']['x'], i['seat']['z']] for i in cands]))
                free = [i for i, o in zip(cands, occ) if not o] or cands; res[pat + '_occupied'] = occ
                say('   %s：%d 個，有人坐的 %s（2026-10-22 第一輪：沙發被住宿生坐走、按鈕不出現）' % (pat, len(cands), occ))
                s1 = None; tr = 0
                for it in free:   # 沒人坐的一個一個試（座位不同）
                    for k2 in range(2):
                        tr += 1; s1 = await sit(pg, cdp, run, it, pat + ('' if tr == 1 else '（第 %d 次）' % tr))
                        if s1['seat']: break
                        await pg.wait_for_timeout(15000)   # 二樓走廊窄，路人站在長椅前面就過不去：等他走開
                    if s1['seat']: break
                res[pat] = s1; await run.shot(pg, '%s_%s' % (sid, pat))
                chk(run, sid, '「%s」坐得下' % pat, bool(s1['seat']), s1); await stand(pg, cdp)
            else:
                await go_it(pg, cdp, run, it, 1.0); await run.shot(pg, '%s_%s' % (sid, pat))
                n0 = len(await pg.evaluate("window.__LOG||[]")); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); await drain(pg, cdp, 40)
                lines = (await pg.evaluate("window.__LOG||[]"))[n0:]; res[pat] = lines; say('   %s：%s' % (pat, json.dumps(lines, ensure_ascii=False)[:300]))
        res['errs'] = errs[:3]; chk(run, sid, '沒有 JS 例外', not errs, errs[:3])
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); chk(run, sid, '測試跑完', False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- ZR_BAR
async def talk_shot(pg, cdp, run, sid, cid, tag):
    """走到她面前、按說話；說話開始 1.5 秒拍一張（劇情鏡頭或 2D），再點完對話"""
    n = await pg.evaluate(NPC + "(%s)" % json.dumps(cid))
    if not n: return None
    await L.go_to(pg, cdp, run, n['x'], n['z'] + (1.3 if n['staff'] else 0), 1.0, tag, max_s=150)
    for _ in range(8):
        if (await pg.evaluate(PST))['btn']: break
        await pg.wait_for_timeout(700)
    st = await pg.evaluate(PST); await run.shot(pg, '%s_%s_front' % (sid, tag))
    n0 = len(await pg.evaluate("window.__LOG||[]")); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    await run.shot(pg, '%s_%s_talk' % (sid, tag)); adv = await pg.evaluate("!!(typeof ADV!=='undefined'&&ADV.active)")
    await drain(pg, cdp, 90); lines = (await pg.evaluate("window.__LOG||[]"))[n0:]
    return {'npc': n, 'btn': st['btn'], 'adv': adv, 'lines': lines[:12]}


async def s_zr(p, run, base, sid):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await load(p, run, base, '2025-10-03', 14.0, 'cafe', sid + '（10/3 週五 14:00 兩點半 Café：芷若大一上週五 13～17 點當班）')
    try:
        await pg.wait_for_timeout(4000)
        zr = await pg.evaluate(NPC + "('heroine_02')"); res['zr'] = zr; await run.shot(pg, '%s_cafe' % sid)
        chk(run, sid, '芷若在吧台後面當班（barista）', bool(zr) and zr['staff'] == 'cafe', zr)
        seats = [i for i in await pg.evaluate(ITS) if i['seat']]
        bar = nearest(seats, -2.5, -4.0, lambda s: s['seat']['lift'] > 0) if seats else None
        if bar:
            s1 = await sit(pg, cdp, run, bar, '吧台座位'); res['bar'] = s1; await run.shot(pg, '%s_bar_seat' % sid)
            chk(run, sid, '吧台座位坐得下（lift %.2f，人的高度 %.2f）' % (bar['seat']['lift'], s1['py']), bool(s1['seat']), s1)
            await stand(pg, cdp)
        else: run.note('%s：Café 沒有 lift 的吧台座位（只拍站在吧台前面）' % sid)
        t = await talk_shot(pg, cdp, run, sid, 'heroine_02', 'zr'); res['talk_zr'] = t
        chk(run, sid, '走到吧台前面跟芷若說話（互動鈕「%s」）' % ((t or {}).get('btn') or '—'), bool(t and t['lines']), t)
        res['errs'] = errs[:3]; chk(run, sid, '沒有 JS 例外（Café）', not errs, errs[:3])
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); chk(run, sid, '測試跑完（Café）', False, str(e)[:300])
    await close(b)
    # 沛珊：先在同一天問作息她在哪（【讀資料】），挑第一個看得到的區域，讀檔到那裡走過去說話
    b, pg, cdp, errs = await load(p, run, base, '2025-10-03', 12.0, 'campus', sid + '（沛珊：先查作息）')
    try:
        where = await pg.evaluate("""(()=>{ const C=CHARACTERS.classmate_peishan, o=[]; for(const h of [12.5,13.5,15.5,16.5,18.5,19.5]){ const G2=Object.assign({},GAME.G,{hour:h}); let e=null; try{ e=STORY.schedEnt(C,G2); }catch(x){} o.push([h, e&&e.zone||null, e&&e.act||null]); } return o; })()""")
        res['ps_where'] = where; say('   沛珊 10/3 作息：%s' % json.dumps(where, ensure_ascii=False))
    except Exception as e: where = []; say('   ! 例外', e)
    await close(b)
    cand = next((w for w in where if w[1] and w[1] not in ('dorm', 'fdorm', 'home')), None)
    if not cand: chk(run, sid, '沛珊 10/3 有看得到她的區域', False, where); return
    b, pg, cdp, errs = await load(p, run, base, '2025-10-03', cand[0], cand[1], sid + '（沛珊在 %s）' % cand[1])
    try:
        await pg.wait_for_timeout(4000); t = await talk_shot(pg, cdp, run, sid, 'classmate_peishan', 'ps'); res['talk_ps'] = t
        chk(run, sid, '%s %.1f 走到沛珊旁邊說話' % (cand[1], cand[0]), bool(t and t['lines']), t)
        res['errs_ps'] = errs[:3]; chk(run, sid, '沒有 JS 例外（沛珊）', not errs, errs[:3])
    except Exception as e: res['err_ps'] = str(e)[:300]; say('   ! 例外', e); chk(run, sid, '測試跑完（沛珊）', False, str(e)[:300])
    await close(b)


FN = {'WZ_SHOPS': s_wz_shops, 'WZ_CAM': s_wz_cam, 'L118_BAR': s_l118, 'LOUNGE': s_lounge, 'ZR_BAR': s_zr}


async def main():
    run = L.Run('art1022', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        for sid in SCEN:
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'art1022.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
