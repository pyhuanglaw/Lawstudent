"""CC-C 11-14：BIKE_SEAT_RIDE（BB-C 11:41，TEST-04，BB_466 最後一節，P2）——載女主角騎腳踏車：她坐上後座、騎到目的地、下車。判定歸 BB；Playwright（PC GPU）≠ iPhone。
遊戲的做法（main 6106fae2d2）：
  - 車停在宿舍門口（bike3d.js HOME campus (25,57.9)），互動點「騎腳踏車」→ BIKE.mount（先走到車旁才上車）。
  - 一起走的人（beh 'follow'）：你騎著車停下、她在 3 m 內 → beh 'passenger'，約 1.5 秒走到左後方坐上去（engine3d.js 445 行、E.PASSENGER）；STORY.onRide 上車字幕（rideInfo.on）。
  - 還不願意坐的人（STORY.rideMode＝'refuse'）：BIKE.mount 不上車，字幕 STORY.rideBlock（以安「我走路。……你的煞車我還不熟。」）。
  - 下車：右邊「下車」按鈕（#btnBike）→ 她回 beh 'follow'、站到車的左後方，字幕 rideInfo.off（有寫才有）。
這支照玩家：
  A（WHO，預設學姊 heroine_05，熟悉以上＝坐）：【前置／捷徑】讀檔到校園宿舍門口 DAY HOUR（條件事件關掉）、她【捷徑】認識＋關係加到 REL、放在祐廷旁邊、【捷徑】一起走（beh follow，和 invites3d.js「現在一起過去」設的一樣）
    → 走到車旁按「騎腳踏車」→ 每 0.5 秒記 8 秒她的 beh、pose、astride、離祐廷多遠、上車字幕 → 騎到 RIDE_D m 外的一點（點地＋搖桿；全程每 0.5 秒記她）
    → 按「下車」→ 每 0.5 秒記 4 秒、下車字幕。截圖：上車、騎行中、到了、下車。
  B 對照（REFUSE_WHO，預設以安 heroine_01，認識但還不熟）：同樣一起走 → 按「騎腳踏車」→ 記有沒有上車、字幕（rideBlock 那一句）、她 beh 還是 follow。
CC_02 清單 2026-11-14：1✓（平日下午 2025-10-14 15:00；認識、關係用遊戲的 SOCIAL.meet／adjust，rideMode 照遊戲自己算，FAIL_SETUP 確認 A＝ride、B＝refuse） 2✓（車的位置、互動點、她的狀態全部從遊戲讀：E.interactables 的「騎腳踏車」、GAME.npc） 3n/a（指定的人，不挑第一個） 4✓（「騎腳踏車」按 #interact、「下車」按 #btnBike，L.tap 觸控） 5✓（走到車旁、騎到目的地用 L.go_to，點地被擋改 F.joy_to） 6✓（上車等 8 秒、每 0.5 秒取樣；下車取樣 4 秒） 7✓（lint） 8✓（beh、pose、astride、距離逐筆記） 9✓（上車、騎行中、到了、下車、對照都截圖） 10✓（捷徑都寫【捷徑】：讀檔、認識、關係、一起走） 11✓（佇列 probe、SHA 40 碼） 12✓（FAIL_SETUP：在校園、有「騎腳踏車」、她在場、一起走、rideMode 對） 13✓（走路用 go_to／joy_to，到了看位置；不跨區）
用法：LW_TESTS=<wt>/tests SHA=<sha> [WHO=heroine_05] [REL=30] [REFUSE_WHO=heroine_01] [DAY=2025-10-14] [HOUR=15] [RIDE_D=30] python3 cc_bike_seat_ride_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
WHO = os.environ.get('WHO') or 'heroine_05'; REL = int(os.environ.get('REL') or 30)
REFUSE_WHO = os.environ.get('REFUSE_WHO') or 'heroine_01'
DAY = os.environ.get('DAY') or '2025-10-14'; HOUR = float(os.environ.get('HOUR') or 15)
RIDE_D = float(os.environ.get('RIDE_D') or 30)
R = L.Run('bike_seat_ride', OUT); D.setup(R, OUT); F.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

BIKE_IT = r"""(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.bike&&!i.hidden); const s=GAME.G.bike||null; return {it:it?{x:+it.x.toFixed(2), z:+it.z.toFixed(2), label:String(it.label||'')}:null, g:s?{zone:s.zone, x:s.x, z:s.z, riding:!!s.riding}:null, zone:GAME.G.zone}; })()"""
PLACE = r"""(a=>{ const G=GAME.G, E=GAME.E; G.flags=G.flags||{}; G.flags['met_'+a.who]=true; const AL={heroine_01:['met_an','AN_NAME_TOLD'],heroine_05:['met_sis']}; for(const k of (AL[a.who]||[])) G.flags[k]=true;
  try{ SOCIAL.meet(a.who,G.zone); if(SOCIAL.talkedTo) SOCIAL.talkedTo(a.who); }catch(e){}
  if(a.rel){ try{ SOCIAL.adjust(a.who,{fam:a.rel,trust:Math.round(a.rel*0.7),comf:Math.round(a.rel*0.7),seen:20,talked:20}); }catch(e){} }
  let n=GAME.npc&&GAME.npc[a.who]; const P=E.player.obj.position;
  if(!n) n=GAME.spawnCharacter(a.who,P.x+1.2,P.z+0.6,{pose:'idle'}); if(!n) return null;
  if(GAME.standUp&&n.seat) GAME.standUp(n); n.beh='follow'; n.frozen=false; n.followOff=1.1; n.path=null; n.noRide=false;   /* 【捷徑】一起走：和 invites3d.js「現在一起過去」設的一樣 */
  let st=null; try{ st=SOCIAL.stage(a.who); }catch(e){} let info=null; try{ info=STORY.rideInfo(G,a.who); }catch(e){ info='ERR '+e.message; }
  return {stage:st, rideMode:STORY.rideMode?STORY.rideMode(n):null, rideInfo:info, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2)}; })"""
HER = r"""(who=>{ const n=GAME.npc&&GAME.npc[who], P=GAME.E.player, r2=v=>+(+v).toFixed(2); if(!n||!n.obj) return {none:true};
  const o=n.obj.position, p=P.obj.position, cap=document.getElementById('caption'); const cv=!!cap&&!cap.classList.contains('hide')&&getComputedStyle(cap).display!=='none'&&getComputedStyle(cap).opacity!=='0';
  return {beh:n.beh||null, pose:n.pose||null, astride:!!n.astride, mountT:n.mountT==null?null:r2(n.mountT), d:r2(Math.hypot(o.x-p.x,o.z-p.z)), dy:r2(o.y-p.y), x:r2(o.x), z:r2(o.z),
    riding:!!P.riding, pPose:P.pose||null, pSpeed:r2(P.speed||0), px:r2(p.x), pz:r2(p.z), cap:cv?(cap.innerText||'').replace(/\s+/g,' ').trim():''}; })"""
DEST_JS = r"""(a=>{ const E=GAME.E, P=E.player.obj.position; let best=null;
  for(let k=0;k<24;k++){ const t=k*Math.PI/12; for(const d of [a.d, a.d*0.8, a.d*1.2, a.d*0.6]){ const x=P.x+Math.cos(t)*d, z=P.z+Math.sin(t)*d; if(!E.canStand(x,z,0.4,0)) continue;
    let p=null; try{ p=E.pathTo?E.pathTo(P.x,P.z,x,z,0):null; }catch(e){ p=null; } const n=p&&p.length?p.length:0; if(!n) continue; const sc=Math.abs(d-a.d)+n*0.05; if(!best||sc<best.sc) best={x:+x.toFixed(2), z:+z.toFixed(2), d:+d.toFixed(1), wp:n, sc}; } }
  return best; })"""


async def caps(pg, who, n, every, tag, shot=None):
    out = []
    for j in range(n):
        h = await pg.evaluate(HER, who); out.append(h)
        if shot and j in (0, n // 2, n - 1): await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (shot, j)))
        await pg.wait_for_timeout(every)
    R.note('%s %s' % (tag, J([{k: x.get(k) for k in ('beh', 'pose', 'astride', 'mountT', 'd', 'dy', 'riding', 'cap')} for x in out])))
    return out


async def setup(pg, cdp, tag, who, rel):
    sp = None
    s = await D.load_zone(pg, cdp, 'campus', DAY, HOUR, x=26.5, z=60.3, yaw=math.pi, wait=7000)
    bk = await pg.evaluate(BIKE_IT)
    R.setup('%s 【前置／捷徑】讀檔到校園宿舍門口 %s %.1f（條件事件關掉）：%s；車 %s' % (tag, DAY, HOUR, J({k: s.get(k) for k in ('zone', 'x', 'z')}), J(bk)))
    if not R.check('%s FAIL_SETUP 檢查：在校園、有「騎腳踏車」互動點' % tag, s.get('zone') == 'campus' and bool(bk['it']), J(bk)): return None
    sp = await pg.evaluate(PLACE, {'who': who, 'rel': rel}); await pg.wait_for_timeout(1500)
    R.setup('%s 【捷徑】%s 認識、關係 fam %d、放在祐廷旁邊、一起走（beh follow）：%s' % (tag, who, rel, J(sp)))
    if not R.check('%s FAIL_SETUP 檢查：%s 在場' % (tag, who), bool(sp), ''): return None
    return bk, sp


async def mount(pg, cdp, tag, bk):
    it = bk['it']; tg = await D.standable_near(pg, it['x'], it['z'], 0.8, 0)
    if tg: await L.go_to(pg, cdp, R, tg['x'], tg['z'], 0.35, '%s 走到車旁' % tag, max_s=60, lv=0)
    st = await D.settle(pg)
    if not (st.get('interact') or '').startswith('騎腳踏車'):
        jr = await F.joy_to(pg, cdp, tag, it['x'], it['z'], near=0.5, lv=0, max_s=40, btn='騎腳踏車'); R.note('%s 點地沒走到，改推搖桿：%s' % (tag, J({k: jr.get(k) for k in ('ok', 't', 'by', 'why')})))
        st = await D.settle(pg)
    R.check('%s FAIL_SETUP 檢查：走到車旁、互動鍵是「騎腳踏車」' % tag, (st.get('interact') or '').startswith('騎腳踏車'), J({k: st.get(k) for k in ('interact', 'x', 'z')}))
    await L.tap(pg, cdp, '#interact')


async def main():
    print('CC BIKE_SEAT_RIDE：SHA %s；%s %.1f；A＝%s（REL %d）、B 對照＝%s；Windows＋GPU ≠ iPhone' % (SHA or '?', DAY, HOUR, WHO, REL, REFUSE_WHO), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('FAIL_SETUP 檢查：遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(R.finish())
        # A：願意坐的人
        x = await setup(pg, cdp, '[A]', WHO, REL)
        if x:
            bk, sp = x
            R.check('[A] FAIL_SETUP 檢查：%s rideMode＝ride（熟悉以上）、一起走' % WHO, sp.get('rideMode') == 'ride', J(sp))
            await mount(pg, cdp, '[A]', bk)
            on = await caps(pg, WHO, 16, 500, '[A] 按「騎腳踏車」以後 8 秒（每 0.5 秒）她：', 'bike_A_mount')
            res['mount'] = on
            R.check('[A] 祐廷上車了（riding）', any(h.get('riding') for h in on), J(on[-1:]))
            R.check('[A] 她坐上後座（beh passenger、pose sit、離祐廷 <1.2 m）', any(h.get('beh') == 'passenger' and h.get('pose') == 'sit' and (h.get('d') or 9) < 1.2 for h in on), J(on[-1:]))
            caps_on = sorted(set(h['cap'] for h in on if h.get('cap'))); R.note('[A] 上車那幾秒的字幕：%s（rideInfo.on＝%s）' % (J(caps_on), J((sp.get('rideInfo') or {}).get('on') if isinstance(sp.get('rideInfo'), dict) else None)))
            dest = await pg.evaluate(DEST_JS, {'d': RIDE_D}); res['dest'] = dest
            if R.check('[A] FAIL_SETUP 檢查：找得到 %.0f m 外騎得到的點' % RIDE_D, bool(dest), J(dest)):
                stop = asyncio.Event(); ride = []
                async def samp():
                    while not stop.is_set():
                        try: ride.append(await pg.evaluate(HER, WHO))
                        except Exception: pass
                        await asyncio.sleep(0.5)
                t = asyncio.create_task(samp())
                try:
                    await pg.wait_for_timeout(300); await pg.screenshot(path=os.path.join(OUT, 'bike_A_ride_start.png'))
                    ok = await L.go_to(pg, cdp, R, dest['x'], dest['z'], 1.2, '[A] 騎到 %.0f m 外' % RIDE_D, max_s=90, lv=0)
                finally:
                    stop.set(); await t
                await pg.screenshot(path=os.path.join(OUT, 'bike_A_arrived.png'))
                mv = [h for h in ride if not h.get('none')]
                R.note('[A] 騎行中每 0.5 秒（%d 筆）她：%s' % (len(mv), J([{k: h.get(k) for k in ('beh', 'pose', 'd', 'dy', 'riding', 'pSpeed')} for h in mv[::2]])))
                res['ride'] = mv
                moving = [h for h in mv if (h.get('pSpeed') or 0) > 0.5]
                R.check('[A] 騎行中她一直在後座（騎著、速度 >0.5 的每一筆 beh passenger、離祐廷 <1.2 m）', bool(moving) and all(h.get('beh') == 'passenger' and (h.get('d') or 9) < 1.2 for h in moving), J([h for h in moving if not (h.get('beh') == 'passenger' and (h.get('d') or 9) < 1.2)][:3]))
                R.check('[A] 騎到目的地（離目標 1.2 m 內）', bool(ok), J(mv[-1:]))
            await L.tap(pg, cdp, '#btnBike')
            off = await caps(pg, WHO, 8, 500, '[A] 按「下車」以後 4 秒（每 0.5 秒）她：', 'bike_A_off')
            res['off'] = off
            R.check('[A] 下車：祐廷不騎了、她回到一起走（beh follow）、站著（不是 sit）、離祐廷 3 m 內', not off[-1].get('riding') and off[-1].get('beh') == 'follow' and off[-1].get('pose') != 'sit' and (off[-1].get('d') or 9) < 3, J(off[-1:]))
            caps_off = sorted(set(h['cap'] for h in off if h.get('cap'))); R.note('[A] 下車那幾秒的字幕：%s（rideInfo.off＝%s）' % (J(caps_off), J((sp.get('rideInfo') or {}).get('off') if isinstance(sp.get('rideInfo'), dict) else None)))
        # B：還不願意坐的人
        x = await setup(pg, cdp, '[B]', REFUSE_WHO, 0)
        if x:
            bk, sp = x
            R.check('[B] FAIL_SETUP 檢查：%s rideMode＝refuse（還不熟）、一起走' % REFUSE_WHO, sp.get('rideMode') == 'refuse', J(sp))
            await mount(pg, cdp, '[B]', bk)
            ob = await caps(pg, REFUSE_WHO, 10, 400, '[B] 按「騎腳踏車」以後 4 秒（每 0.4 秒）她：', 'bike_B_refuse')
            res['refuse'] = ob
            cb = sorted(set(h['cap'] for h in ob if h.get('cap'))); R.note('[B] 字幕：%s' % J(cb))
            R.check('[B] 還不熟的人：祐廷沒上車、她沒坐後座（beh 還是 follow）', not any(h.get('riding') for h in ob) and all(h.get('beh') != 'passenger' for h in ob if not h.get('none')), J(ob[-1:]))
            R.check('[B] 有說不坐的那一句（字幕）', bool(cb), J(cb))
        open(os.path.join(OUT, 'bike_seat_ride.json'), 'w', encoding='utf-8').write(J(res))
        R.check('沒有 pageerror／JS 例外', not errs, J(errs[:5]))
        await b.close()
    sys.exit(R.finish())

asyncio.run(main())
