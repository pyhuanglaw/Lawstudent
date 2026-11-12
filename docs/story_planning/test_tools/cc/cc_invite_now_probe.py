"""CC-C 11-12：當面約人「現在一起過去」（W1R D2／D3，QA-W1-VISUAL BB_398；BB-C 11:27，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
要看的：D2 她先起身、跟著走、你停下來她是站著（不是坐姿懸空、不揮手）；D3 到了有座位的地方她先坐、你坐她旁邊才開始。
做法：【前置／捷徑】讀檔到 ZONE（DAY HOUR，條件事件關掉）；她（WHO）不在這裡的話【捷徑】放在祐廷前面最近的一張座位上坐著（GAME.spawnCharacter＋seat）→
  照玩家：走到她旁邊按互動（說話）→ 選單照 PICKS 一層一層選（每層選含那個字的；> 分隔；最後一層應該是「現在一起過去」）→
  記她 3 秒內每 0.25 秒的姿勢（pose、seat、beh、位置）＝有沒有先起身 →
  照 ROUTE 走過去（exit:<區域>，+ 分隔；中間在每一區停一下：停 3 秒記她的姿勢、離祐廷多遠、有沒有 wave 動作）→ 到了：每 0.5 秒記 12 秒（她坐了沒、坐哪、祐廷坐了沒、誰先），截圖。
CC_02 清單 2026-11-12：1✓（平日下午） 2✓（她、座位、出口從遊戲讀） 3✓（一次讀檔走到底） 4✓（選單照字） 5✓（走過去照玩家：go_to＋use_exit） 6✓（每一步等、取樣） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：要看她） 10✓（條件事件關掉） 11✓ 12✓（每一區同樣欄位） 13✓（讀檔、放她坐好是捷徑）
QUICK=<區域>（W1R D4）：走完 ROUTE 以後改用手機「地點」快速前往那一區（直接到達），每 0.5 秒記 6 秒她的位置、離祐廷多遠、站不站得住。
用法：LW_TESTS=<wt>/tests SHA=<sha> [TAG=x] [QUICK=noodle] [ZONE=library_hall] [WHO=heroine_01] [DAY=2025-10-14] [HOUR=15] PICKS=約>吃>麵>現在一起過去 ROUTE=exit:campus+exit:gongguan+exit:noodle python3 cc_invite_now_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_phone
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; TAG = os.environ.get('TAG') or 'x'
ZONE = os.environ.get('ZONE') or 'library_hall'; WHO = os.environ.get('WHO') or 'heroine_01'
DAY = os.environ.get('DAY') or '2025-10-14'; HOUR = float(os.environ.get('HOUR') or 15)
PICKS = [x for x in (os.environ.get('PICKS') or '約>現在一起過去').split('>') if x]
ROUTE = [x for x in (os.environ.get('ROUTE') or '').split('+') if x]
QUICK = os.environ.get('QUICK') or ''   # W1R D4（BB-C 12:00）：走完 ROUTE 以後改用手機「地點」快速前往這一區（直接到達），看她有沒有一起到、站哪、在不在牆裡
R = L.Run('invite_now_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
PLACE_HER = r"""(a=>{ const G=GAME.G, E=GAME.E; G.flags=G.flags||{}; G.flags['met_'+a.who]=true; if(!G.contacts) G.contacts={}; if(G.contacts[a.who]==null) G.contacts[a.who]=2;
  let n=GAME.npc&&GAME.npc[a.who]; if(n) return {had:true, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), seat:!!n.seat};
  const P=E.player.obj.position, S=(E.zone&&E.zone.seats||[]).filter(s=>(s.lv|0)===(E.player.lv|0)).sort((p,q)=>Math.hypot(p.x-P.x,p.z-P.z)-Math.hypot(q.x-P.x,q.z-P.z));
  const s=S.find(s=>Math.hypot(s.x-P.x,s.z-P.z)>1.5)||null;
  n=s?GAME.spawnCharacter(a.who,s.x,s.z,{seat:s,lv:s.lv|0,yaw:s.yaw,pose:'sit'}):GAME.spawnCharacter(a.who,P.x+1.5,P.z,{pose:'idle'});
  return n?{had:false, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), seat:!!n.seat, seatAt:s?[s.x,s.z]:null}:null; })"""
HER = r"""(who=>{ const n=(GAME.npc&&GAME.npc[who])||(typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(who):null); const P=GAME.E.player, r2=v=>+(+v).toFixed(2);
  if(!n||!n.obj) return {none:true, zone:GAME.G.zone};
  const o=n.obj.position; let stand=null; try{ stand=GAME.E.canStand?!!GAME.E.canStand(o.x,o.z,0.2,n.lv|0):null; }catch(e){} let anim=null; try{ const m=n.obj.userData&&n.obj.userData.mixer; anim=n.anim||n.clip||(m&&m._actions?m._actions.filter(x=>x.isRunning()).map(x=>x.getClip().name).join(','):null); }catch(e){}
  return {zone:GAME.G.zone, stand, x:r2(o.x), z:r2(o.z), y:r2(o.y), seat:!!n.seat, pose:n.pose||null, beh:n.beh||null, frozen:!!n.frozen, anim, d:r2(Math.hypot(o.x-P.obj.position.x,o.z-P.obj.position.z)), pSeat:!!P.seat, pPose:P.pose||null,
    iv:(GAME.G.invites||[]).filter(i=>i.who===who).slice(-1).map(i=>({state:i.state, place:i.place, zone:i.zone, now:i.now}))[0]||null}; })"""
DLG = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||''}; })()"""


async def sample(pg, tag, n, every, shot=None):
    out = []
    for j in range(n):
        h = await pg.evaluate(HER, WHO); out.append(h)
        if shot and j in (0, n // 2, n - 1): await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (shot, j)))
        await pg.wait_for_timeout(every)
    R.note('%s %s' % (tag, J([{k: x.get(k) for k in ('x', 'z', 'seat', 'pose', 'beh', 'anim', 'd', 'pSeat')} for x in out])))
    return out


async def main():
    print('CC 當面約現在一起過去：TAG %s；SHA %s；%s %s %.1f；WHO %s；PICKS %s；ROUTE %s' % (TAG, SHA or '?', ZONE, DAY, HOUR, WHO, PICKS, ROUTE), flush=True)
    res = {'tag': TAG, 'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        s = await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=7000)
        if not R.check('讀到 %s' % ZONE, s['zone'] == ZONE, J(s)): await b.close(); sys.exit(1)
        her = await pg.evaluate(PLACE_HER, {'who': WHO}); res['her0'] = her
        R.setup('【前置／捷徑】讀檔到 %s %s %.1f（條件事件關掉）；%s：%s' % (ZONE, DAY, HOUR, WHO, '本來就在' if her and her.get('had') else '放在最近的座位坐著（spawnCharacter）%s' % J(her)))
        if not R.check('她在場', bool(her), ''): await b.close(); sys.exit(1)
        await L.go_to(pg, cdp, R, her['x'], her['z'], 1.1, WHO, max_s=60); await D.settle(pg)
        st = await pg.evaluate(DLG); R.note('走到她旁邊，互動鍵「%s」' % st['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        picked = []; lines = []; k = 0
        for j in range(80):
            st = await pg.evaluate(DLG)
            if st['choices']:
                want = PICKS[k] if k < len(PICKS) else None
                i = next((n for n, t in enumerate(st['choices']) if want and want in t), None)
                if i is None:
                    R.note('選單沒有含「%s」的：%s' % (want, J(st['choices']))); await pg.screenshot(path=os.path.join(OUT, 'inv_%s_menu_miss.png' % TAG))
                    i = len(st['choices']) - 1
                else: k += 1
                picked.append([st['choices'], st['choices'][i]]); await pg.screenshot(path=os.path.join(OUT, 'inv_%s_menu_%02d.png' % (TAG, len(picked))))
                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900)
                if k >= len(PICKS): break
                continue
            if st['dlg']:
                ln = st['who'] + '｜' + st['t']
                if not lines or lines[-1] != ln: lines.append(ln)
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if not st['busy'] and j > 3: break
            await pg.wait_for_timeout(500)
        R.note('選單一路：%s' % J(picked)); res['picked'] = picked
        rise = await sample(pg, 'D2 約完 3 秒（每 0.25 秒）她：', 12, 250, 'inv_%s_rise' % TAG)
        for j in range(30):   # 剩下的對話（答應那幾句）
            st = await pg.evaluate(DLG)
            if st['dlg']:
                ln = st['who'] + '｜' + st['t']
                if not lines or lines[-1] != ln: lines.append(ln)
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if st['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(800); continue
            break
        R.note('對話：%s' % J(lines)); res['lines'] = lines
        rise2 = await sample(pg, 'D2 對話完 3 秒（每 0.25 秒）她：', 12, 250, 'inv_%s_rise2' % TAG)
        res['rise'] = rise + rise2
        R.check('D2 她有起身（不是坐著跟）', any(not x.get('seat') and x.get('beh') == 'follow' for x in rise + rise2), J(rise2[-1:]))
        legs = []
        for n, step in enumerate(ROUTE, 1):
            kind, _, arg = step.partition(':')
            if kind != 'exit': continue
            exs = await pg.evaluate("(to=>GAME.E.interactables.filter(i=>i.exit&&i.exit.to===to&&!i.hidden).map(i=>i.label))", arg)
            if not R.check('[%d] 找得到往 %s 的出口' % (n, arg), bool(exs), J(await pg.evaluate("GAME.E.interactables.filter(i=>i.exit).map(i=>[i.label,i.exit.to])"))): break
            s2 = await D.use_exit(pg, cdp, '[%d]' % n, exs[0], arg)
            if not s2 or s2.get('zone') != arg: break
            stop = await sample(pg, '[%d] 到 %s 以後停 3 秒（每 0.5 秒）她：' % (n, arg), 6, 500, 'inv_%s_leg%d' % (TAG, n))
            legs.append({'to': arg, 'stop': stop})
            R.check('[%d] 停下來她站著（沒坐姿、離 3 m 內）' % n, all(not x.get('seat') and x.get('pose') != 'sit' for x in stop[2:] if not x.get('none')) and any((x.get('d') or 99) < 3 for x in stop), J(stop[-1:]))
        res['legs'] = legs
        if QUICK:
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(900)
            ok = await cc_phone.reveal(pg, cdp, QUICK); await pg.screenshot(path=os.path.join(OUT, 'inv_%s_quick_list.png' % TAG))
            c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })", QUICK)
            R.note('D4 手機「地點」找 %s（展開地區 %s）：%s' % (QUICK, ok, J(c)))
            if R.check('D4 手機地點有 %s' % QUICK, bool(c), ''):
                await L.touch_tap(cdp, c[0], c[1])
                for _ in range(60):
                    await pg.wait_for_timeout(1000)
                    st = await pg.evaluate(DLG)
                    if st['choices']:
                        i = next((n for n, t in enumerate(st['choices']) if '直接' in t or '過去' in t), 0); R.note('D4 選單 %s → %s' % (J(st['choices']), st['choices'][i]))
                        await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); continue
                    if st['dlg']: await L.tap(pg, cdp, '#dlg'); continue
                    if await pg.evaluate("GAME.G.zone") == QUICK: break
                qk = await sample(pg, 'D4 直接到達 %s 以後 6 秒（每 0.5 秒）她：' % QUICK, 12, 500, 'inv_%s_quick' % TAG)
                res['quick'] = qk
                R.check('D4 她一起到、站在旁邊 3 m 內、站得住（不在牆裡／家具裡）', any((x.get('d') or 99) < 3 and x.get('stand') is not False for x in qk if not x.get('none')), J(qk[-1:]))
        arr = await sample(pg, '到了 12 秒（每 0.5 秒）她和祐廷：', 24, 500, 'inv_%s_arrive' % TAG)
        res['arrive'] = arr
        t_her = next((j for j, x in enumerate(arr) if x.get('seat')), None); t_me = next((j for j, x in enumerate(arr) if x.get('pSeat')), None)
        R.note('D3 她第 %s 格坐下、祐廷第 %s 格坐下（每格 0.5 秒）' % (t_her, t_me))
        R.check('D3 到了她先坐（或同時）、祐廷也坐', t_her is not None and (t_me is None or t_her <= t_me), J([t_her, t_me]))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'invite_now_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
