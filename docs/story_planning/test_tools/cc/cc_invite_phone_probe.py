"""CC-C 11-12：手機約人去汀州路兩間店（越好吃小館 tz_yuehaochi、客居雲南 tz_keju；TZ-INVITE-SUPPER-1112，src/tz_invite_supper3d.js＋src/invites3d.js；BB-C 12:38 第 6 項「當面約／手機約各一次」的手機那一半，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
要看的：手機「朋友」→ 她那一列「約」→ 吃飯 → 那間店 → 今天的時間 → 她答應的那一句（people[人].acc[店]）；到了時間走進店裡：她先坐著等（iv.waitSeat）→ 祐廷坐到她旁邊 → 兩個人坐下以後的那一句（at_table；學姊很熟版／一般版）。
做法：【前置／捷徑】讀檔到 ZONE（DAY HOUR，條件事件關掉）、認識她、有聯絡方式；REL＞0 時【捷徑】關係加 fam（這兩間要有點熟以上）→
  照玩家：按手機 → 「朋友」→ 她那一列「約」→ 選單照 PICKS 一層一層選（每層選含那個字的；> 分隔）→ 記每一句、每個選單（截圖）→ 記 G.invites 最後一筆 →
  【捷徑】時間撥到約定時間前 3 分鐘 → 照 ROUTE 走進店（exit:<區域>）→ 每 0.5 秒記 12 秒她在哪、坐了沒、iv.waitSeat →
  照玩家：走到她旁邊那張空位（iv.waitSeat 旁 1.8 m 內、沒人坐的座位）按「坐下」→ 一句一句點、每句截圖 → 記 iv.state、錢、時間。
CC_02 清單 2026-11-12：1✓（平日下午約今天晚上） 2✓（她、座位、出口、邀約紀錄從遊戲讀） 3✓（一次讀檔走到底） 4✓（選單照字） 5✓（手機照玩家點、走過去 go_to＋use_exit） 6✓（一句一句點、每句截圖） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：要看她） 10✓（條件事件關掉） 11✓ 12✓（兩間同樣欄位） 13✓（讀檔、關係、撥時間是捷徑，R.setup 標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [TAG=x] [ZONE=tingzhou] [WHO=heroine_01] [DAY=2025-10-14] [HOUR=15] [REL=60] PICKS=吃飯>越好吃>今天 ROUTE=exit:tz_yuehaochi python3 cc_invite_phone_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_phone
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; TAG = os.environ.get('TAG') or 'inv_phone'
ZONE = os.environ.get('ZONE') or 'tingzhou'; WHO = os.environ.get('WHO') or 'heroine_01'
DAY = os.environ.get('DAY') or '2025-10-14'; HOUR = float(os.environ.get('HOUR') or 15)
PICKS = [x for x in (os.environ.get('PICKS') or '吃飯>越好吃>今天').split('>') if x]
ROUTE = [x for x in (os.environ.get('ROUTE') or 'exit:tz_yuehaochi').split('+') if x]
REL = int(os.environ.get('REL') or 0)
FLAGS = json.loads(os.environ.get('FLAGS') or '{}')
EXPECT_SIT = os.environ.get('EXPECT_SIT') or ''
DOOR_DIAG = (os.environ.get('DOOR_DIAG') or '') == '1'   # BB-C 11-14：exit 那一步按前按後取樣   # BB-C 11-14 CANON458 #12：坐下以後一定要出現的那一句（只比對字串）   # CC-C 11-14 BB_458 #10：額外的旗標（例 BEATS 以安第幾拍），JSON；ENV 不能有「|」
R = L.Run('invite_phone_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
MEET = r"""(a=>{ const G=GAME.G; G.flags=G.flags||{}; G.flags['met_'+a.who]=true; if(!G.contacts) G.contacts={}; if(G.contacts[a.who]==null) G.contacts[a.who]=2;
  const AL={heroine_01:['met_an','AN_NAME_TOLD'],heroine_05:['met_sis']}; for(const k of (AL[a.who]||[])) G.flags[k]=true; try{ SOCIAL.meet(a.who,G.zone); if(SOCIAL.talkedTo) SOCIAL.talkedTo(a.who); }catch(e){} 
  if(a.rel&&SOCIAL.adjust){ try{ SOCIAL.adjust(a.who,{fam:a.rel,trust:Math.round(a.rel*0.7),comf:Math.round(a.rel*0.7),seen:20,talked:20}); }catch(e){} }
  let st=null; try{ st=SOCIAL.stage(a.who); }catch(e){} return {stage:st, money:G.money|0}; })"""
IV = r"""(who=>{ const v=(GAME.G.invites||[]).filter(i=>i.who===who).slice(-1)[0]; return v?JSON.parse(JSON.stringify(v)):null; })"""
HER = r"""(who=>{ const n=GAME.npc&&GAME.npc[who]; const P=GAME.E.player, r2=v=>+(+v).toFixed(2); if(!n||!n.obj) return {none:true, zone:GAME.G.zone, h:r2(GAME.G.hour)};
  const o=n.obj.position; return {zone:GAME.G.zone, h:r2(GAME.G.hour), x:r2(o.x), z:r2(o.z), seat:!!n.seat, pose:n.pose||null, beh:n.beh||null, d:r2(Math.hypot(o.x-P.obj.position.x,o.z-P.obj.position.z)), pSeat:!!P.seat}; })"""
DLG = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||'',
  toast:(document.getElementById('toast')||{}).textContent||'', phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())}; })()"""
SEAT_NEAR = r"""(a=>{ const E=GAME.E; const near=(p,q,r)=>Math.hypot(p.x-q.x,p.z-q.z)<r; const ws=a.ws;
  const busy=st=>(E.npcs||[]).some(m=>m&&m.seat&&near(m.seat,st,0.35));
  const its=E.interactables.filter(i=>i.seat&&!i.hidden&&ws&&(i.seat.lv|0)===(ws.lv|0)&&near(i.seat,ws,1.8)&&!near(i.seat,ws,0.3)&&!busy(i.seat));
  its.sort((p,q)=>Math.hypot(p.seat.x-ws.x,p.seat.z-ws.z)-Math.hypot(q.seat.x-ws.x,q.seat.z-ws.z));
  const i=its[0]; if(!i) return null; const ap=(GAME.seatApproach&&GAME.seatApproach(i.seat))||[i.x,i.z]; return {x:ap[0], z:ap[1], lv:i.seat.lv|0, sx:i.seat.x, sz:i.seat.z, label:String(typeof i.label==='function'?i.label():i.label||'')}; })"""


async def travel_to(pg, cdp, zone):
    for _ in range(20):
        st = await pg.evaluate(DLG)
        if not st['dlg']: break
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
    await cc_phone.reveal(pg, cdp, zone)
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')||b.dataset.place===z); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", zone)
    await pg.screenshot(path=os.path.join(OUT, 'invp_%s_places_%s.png' % (TAG, zone)))
    if not c: R.note('手機「地點」沒有 %s' % zone); await L.close_panels(pg, cdp); return False
    await L.touch_tap(cdp, c[0], c[1])
    for _ in range(40):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("GAME.G.zone") == zone: await pg.wait_for_timeout(1500); return True
    return await pg.evaluate("GAME.G.zone") == zone


async def talk(pg, cdp, tag, prefix, picks=None, n=80):
    """一句一句點（每句截圖）；選單照 picks（含那個字的）、沒有就選第一個"""
    lines, menus, k = [], [], 0
    for j in range(n):
        st = await pg.evaluate(DLG)
        if st['choices']:
            want = picks[k] if picks and k < len(picks) else None
            i = next((q for q, t in enumerate(st['choices']) if want and want in t), None)
            if i is None and want:   # BB-C 11-14 INV_LAWLIB TEST_BUG：PICKS 對不到字就點第一個＝約錯地方還判成功——改成 FAIL_SETUP、停下來
                await pg.screenshot(path=os.path.join(OUT, '%s_menu_nomatch.png' % prefix))
                R.check('FAIL_SETUP 檢查：%s 選單有含「%s」的那一項' % (tag, want), False, J(st['choices']))
                menus.append(st['choices']); return lines, menus
            if i is None: i = 0
            else: k += 1
            menus.append(st['choices']); lines.append('▶ ' + st['choices'][i]); await pg.screenshot(path=os.path.join(OUT, '%s_menu_%02d.png' % (prefix, len(menus))))
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln: lines.append(ln); await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (prefix, len(lines))))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy'] and j > 3: break
        await pg.wait_for_timeout(500)
    R.note('%s 選單 %s' % (tag, J(menus))); R.note('%s 整段 %s' % (tag, J(lines)))
    return lines, menus


async def sample(pg, tag, n, every, shot=None):
    out = []
    for j in range(n):
        out.append(await pg.evaluate(HER, WHO))
        if shot and j in (0, n // 2, n - 1): await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (shot, j)))
        await pg.wait_for_timeout(every)
    R.note('%s %s' % (tag, J(out))); return out


async def main():
    print('CC 手機約人：TAG %s；SHA %s；%s %s %.1f；WHO %s；PICKS %s；ROUTE %s' % (TAG, SHA or '?', ZONE, DAY, HOUR, WHO, PICKS, ROUTE), flush=True)
    res = {'tag': TAG, 'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        s = await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=7000)
        if not R.check('讀到 %s' % ZONE, s['zone'] == ZONE, J(s)): await b.close(); sys.exit(1)
        m = await pg.evaluate(MEET, {'who': WHO, 'rel': REL}); res['meet'] = m
        if FLAGS:
            res['flags'] = await pg.evaluate("(f=>{ Object.assign(GAME.G.flags,f); return Object.keys(f); })", FLAGS); R.setup('【捷徑】旗標 %s' % J(FLAGS))
        R.setup('【前置／捷徑】讀檔到 %s %s %.1f（條件事件關掉）、認識 %s、有聯絡方式%s；階段 %s' % (ZONE, DAY, HOUR, WHO, ('、【捷徑】關係加 fam %d' % REL) if REL else '', m.get('stage')))
        # 手機「朋友」→ 她那一列「約」
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(1000)
        sel = '#phoneBody [data-inv=%s]' % J(WHO)
        await pg.evaluate("(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); })", sel); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, 'invp_%s_friends.png' % TAG))
        if not R.check('手機「朋友」她那一列有「約」', await pg.evaluate("(s=>!!document.querySelector(s))", sel), ''): await b.close(); sys.exit(1)
        await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
        lines, menus = await talk(pg, cdp, '約', 'invp_%s_book' % TAG, PICKS)
        iv = await pg.evaluate(IV, WHO); res['book'] = {'lines': lines, 'menus': menus, 'iv': iv}
        R.note('約完 G.invites 最後一筆：%s' % J(iv))
        if (await pg.evaluate(DLG))['phone']: await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(700)
        if not R.check('約好了（G.invites 有 accepted、今天、地點是 ROUTE 最後一區）', bool(iv) and iv.get('state') == 'accepted' and iv.get('accepted') and any(r.endswith(':' + str(iv.get('zone'))) for r in ROUTE[-1:]), J(iv)):
            open(os.path.join(OUT, 'invite_phone.json'), 'w', encoding='utf-8').write(J(res)); await b.close(); sys.exit(1)
        # 【捷徑】撥到約定時間前 3 分鐘，走過去
        await pg.evaluate("(h=>{ GAME.G.hour=h; })", float(iv['h']) - 0.05); await pg.wait_for_timeout(1500)
        R.setup('【捷徑】時間撥到約定時間 %.2f 前 3 分鐘' % float(iv['h']))
        # 11-14 CANON458 BEAT6_r2：約定時間到，遊戲自己跳「直接過去：…（照快速前往的路程時間）／自己走過去」——r1 沒處理＝一直 busy、走不到門口（BADM／BEAT6／BEAT8 r1 的真正原因）
        #   ROUTE 第一步是 travel＝選「直接過去」（遊戲自己的走法）；exit＝選「自己走過去」再照玩家走
        go_direct = ROUTE and ROUTE[0].startswith('travel:')
        for _ in range(16):
            st = await pg.evaluate(DLG)
            if st['choices']:
                want = '直接過去' if go_direct else '自己走過去'
                i = next((k for k, x in enumerate(st['choices']) if x.startswith(want)), None)
                R.note('約定時間的選單 %s → 選「%s」' % (J(st['choices']), st['choices'][i] if i is not None else '（沒有，選第一個）'))
                await pg.screenshot(path=os.path.join(OUT, 'invp_%s_gochoice.png' % TAG))
                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % (i or 0)); await pg.wait_for_timeout(2500); break
            if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            await pg.wait_for_timeout(500)
        for n, step in enumerate(ROUTE, 1):
            kind, _, arg = step.partition(':')
            if kind == 'travel' and await pg.evaluate("GAME.G.zone") == arg: R.note('[%d] 已經在 %s（約定時間的「直接過去」）' % (n, arg)); continue
            if kind == 'travel':   # 11-14 CANON458 BADM／AN_BEAT6／8：走 111 m、或從公館另一頭走過去走不到門口——照玩家用手機「地點」快速前往（先把對話點掉）
                ok_t = await travel_to(pg, cdp, arg)
                if not R.check('[%d] 手機「地點」快速前往 %s' % (n, arg), ok_t, J(await pg.evaluate(DLG))): break
                continue
            if kind != 'exit': continue
            exs = await pg.evaluate("(to=>GAME.E.interactables.filter(i=>i.exit&&i.exit.to===to&&!i.hidden).map(i=>i.label))", arg)
            if not R.check('[%d] 找得到往 %s 的出口' % (n, arg), bool(exs), ''): break
            samp = []; stop = asyncio.Event()
            async def _samp():
                while not stop.is_set():
                    try: samp.append(await pg.evaluate("(()=>{ const P=GAME.E.player, o=P.obj.position, d=document.getElementById('dlg'), it=document.getElementById('interact'); return {t:+performance.now().toFixed(0), zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), x:+o.x.toFixed(2), z:+o.z.toFixed(2), busy:!!P.busy, depth:(GAME.D&&GAME.D.busyDepth)|0, dlg:!!(d&&d.offsetParent)?((document.getElementById('dlgText')||{}).textContent||'').slice(0,40):'', interact:it&&it.offsetParent?(it.textContent||'').trim().slice(0,20):'', toast:((document.getElementById('toast')||{}).textContent||'').trim().slice(0,40)}; })()"))
                    except Exception: pass
                    await asyncio.sleep(0.25)
            task = asyncio.create_task(_samp()) if DOOR_DIAG else None   # BB-C 11-14 AN_BEAT8：照玩家走到門口按「進入…」——記按前、按後各 2 秒的 zone、busy、對話
            s2 = await D.use_exit(pg, cdp, '[%d]' % n, exs[0], arg)
            if task:
                await pg.wait_for_timeout(2000); stop.set(); await task
                sh = await pg.evaluate("(()=>{ try{ return typeof SHOP_HOURS!=='undefined'?JSON.parse(JSON.stringify(SHOP_HOURS)):null; }catch(e){ return String(e); } })()")
                R.note('[%d] 門口取樣（每 0.25 秒，最後 6 秒）：%s' % (n, J(samp[-24:])))
                R.note('[%d] SHOP_HOURS（%s）：%s' % (n, arg, J((sh or {}).get(arg) if isinstance(sh, dict) else sh)))
                await pg.screenshot(path=os.path.join(OUT, 'invp_%s_door_after.png' % TAG))
            if not s2 or s2.get('zone') != arg: break
        arr = await sample(pg, '進店 12 秒（每 0.5 秒）她：', 24, 500, 'invp_%s_arrive' % TAG)
        iv2 = await pg.evaluate(IV, WHO); res['arrive'] = {'her': arr, 'iv': iv2}
        R.note('進店以後邀約紀錄：%s' % J(iv2))
        nseat = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden).length)()")
        if nseat:
            R.check('到了她先坐著等（坐下、iv.waitSeat 有）', any(x.get('seat') for x in arr) and bool((iv2 or {}).get('waitSeat') or (iv2 or {}).get('state') == 'done'), J([arr[-1:], iv2]))
        else:   # BB-C 11-14 INV_BADM_r2 判：羽球場這種沒有座位的地方，她在場站著等也算
            R.check('到了她在場等（這裡沒有玩家能坐的位子，站著等也算）', any(not x.get('none') for x in arr), J([arr[-1:], iv2]))
        ws = (iv2 or {}).get('waitSeat')
        if not ws and arr and arr[-1].get('seat'): ws = {'x': arr[-1]['x'], 'z': arr[-1]['z'], 'lv': 0}
        seat = await pg.evaluate(SEAT_NEAR, {'ws': ws}) if ws else None
        R.note('她旁邊的空位：%s' % J(seat))
        m0 = await pg.evaluate("({money:GAME.G.money|0, h:+(+GAME.G.hour).toFixed(3)})")
        if not nseat: R.note('這裡沒有座位：不找空位、不坐（BB-C 11-14）'); seat = None
        if nseat and R.check('她旁邊有空位可以坐', bool(seat), J(ws)):
            await L.go_to(pg, cdp, R, seat['x'], seat['z'], 0.3, seat['label'] or '她旁邊的位子', max_s=60, lv=seat['lv']); await D.settle(pg)
            st = await pg.evaluate(DLG); R.note('走到她旁邊的位子，互動鍵「%s」' % st['interact'])
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            l2, mm2 = await talk(pg, cdp, '坐下以後', 'invp_%s_table' % TAG)
            m1 = await pg.evaluate("({money:GAME.G.money|0, h:+(+GAME.G.hour).toFixed(3)})"); iv3 = await pg.evaluate(IV, WHO)
            R.note('坐下以後：錢 %s → %s；時間 %s → %s；邀約 %s' % (m0['money'], m1['money'], m0['h'], m1['h'], J(iv3)))
            R.check('坐到她旁邊就開演（有句子、邀約變 done）', len([x for x in l2 if not x.startswith('▶')]) > 0 and (iv3 or {}).get('state') == 'done', J([l2[:3], iv3]))
            res['table'] = {'lines': l2, 'menus': mm2, 'before': m0, 'after': m1, 'iv': iv3}
            if EXPECT_SIT: R.check('坐下以後有那一句「%s」（BB-C 11-14：AA 新字，27001bdc02 起）' % EXPECT_SIT, any(EXPECT_SIT in x for x in l2), J(l2[:6]))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'invite_phone.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
