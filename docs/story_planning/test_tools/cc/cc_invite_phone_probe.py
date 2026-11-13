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
DOOR_DIAG = (os.environ.get('DOOR_DIAG') or '') == '1'
START = [float(v) for v in (os.environ.get('START') or '').split(',') if v] or None   # 讀檔站的位置 x,z
SEAT_R = float(os.environ.get('SEAT_R') or 1.8)   # BB-C 11-14 LAWLIB：她旁邊找空位的半徑（法圖 T7 隔壁那張約 1.6～2 m）
TRUST = int(os.environ.get('TRUST') or 0); COMF = int(os.environ.get('COMF') or 0)   # BB-C 21:02 ⑤：第 6、8 拍要第 4 階（熟悉 ≥60、信任 ≥45、自在 ≥40）——【捷徑】直接設到至少這個數
ARRIVE_LOG = int(os.environ.get('ARRIVE_LOG') or 0)   # BB-C 21:02 ⑤：到店以後 N 秒，一邊點對話一邊記每一句（對話框文字一換就記，不靠輪詢）
EXPECT_LINE = os.environ.get('EXPECT_LINE') or ''
SEED_MET = [z for z in (os.environ.get('SEED_MET') or '').split(',') if z]   # BB-C 21:02 ⑥：這些人【捷徑】設成見過、初見演過（SOCIAL.meet＋talkedTo）
SEAT_LABEL = os.environ.get('SEAT_LABEL') or ''
HER_IA = os.environ.get('HER_IA') or ''   # LAWWW-C 21:24（INV-MEET-YIELD-1113）：到了以後走到她旁邊 1 m，互動鍵要含這個字（例「和可昕說話」），不是旁人的初見   # BB-C 21:02 ⑥：坐下要按位子自己的那顆（互動鍵字含這個），不是最近的人
VISITED = [z for z in (os.environ.get('VISITED') or '').split(',') if z]   # 11-14 BOOKSTORE：頁間這類「自己走進去過一次才列」（invites.js show:V('bookstore')）——【捷徑】墊 G.visited   # BB-C 11-14：exit 那一步按前按後取樣   # BB-C 11-14 CANON458 #12：坐下以後一定要出現的那一句（只比對字串）   # CC-C 11-14 BB_458 #10：額外的旗標（例 BEATS 以安第幾拍），JSON；ENV 不能有「|」
R = L.Run('invite_phone_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
MEET = r"""(a=>{ const G=GAME.G; G.flags=G.flags||{}; G.flags['met_'+a.who]=true; if(!G.contacts) G.contacts={}; if(G.contacts[a.who]==null) G.contacts[a.who]=2;
  const AL={heroine_01:['met_an','AN_NAME_TOLD'],heroine_05:['met_sis']}; for(const k of (AL[a.who]||[])) G.flags[k]=true; try{ SOCIAL.meet(a.who,G.zone); if(SOCIAL.talkedTo) SOCIAL.talkedTo(a.who); }catch(e){} 
  if(a.rel&&SOCIAL.adjust){ try{ SOCIAL.adjust(a.who,{fam:a.rel,trust:Math.round(a.rel*0.7),comf:Math.round(a.rel*0.7),seen:20,talked:20}); }catch(e){} }
  if((a.trust||a.comf)&&SOCIAL.rel){ try{ const r=SOCIAL.rel(a.who); if(a.trust) r.trust=Math.max(r.trust|0,a.trust); if(a.comf) r.comf=Math.max(r.comf|0,a.comf); }catch(e){} }
  let st=null, rv=null; try{ st=SOCIAL.stage(a.who); const r=SOCIAL.rel(a.who); rv={fam:r.fam,trust:r.trust,comf:r.comf}; }catch(e){} return {stage:st, rel:rv, money:G.money|0}; })"""
DLGLOG_JS = r"""(()=>{ if(window.__ccDlg) return 'already'; window.__ccDlg=[]; let last='';
  const rec=()=>{ try{ const D=GAME.D||{}, d=document.getElementById('dlg'); if(!d||d.classList.contains('hide')) return; const t=String(D.full||(document.getElementById('dlgText')||{}).textContent||'').trim(); const w=((document.getElementById('dlgName')||{}).textContent||'').trim();
    const k=w+'｜'+t; if(t&&k!==last){ last=k; window.__ccDlg.push({ms:Math.round(performance.now()), h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone, who:w, t}); } }catch(e){} };
  for(const id of ['dlgText','dlg','dlgName']){ const el=document.getElementById(id); if(el) new MutationObserver(rec).observe(el,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']}); }
  return 'on'; })()"""
IV = r"""(who=>{ const v=(GAME.G.invites||[]).filter(i=>i.who===who).slice(-1)[0]; return v?JSON.parse(JSON.stringify(v)):null; })"""
HER = r"""(who=>{ const n=GAME.npc&&GAME.npc[who]; const P=GAME.E.player, r2=v=>+(+v).toFixed(2); if(!n||!n.obj) return {none:true, zone:GAME.G.zone, h:r2(GAME.G.hour)};
  const o=n.obj.position; return {zone:GAME.G.zone, h:r2(GAME.G.hour), x:r2(o.x), z:r2(o.z), seat:!!n.seat, pose:n.pose||null, beh:n.beh||null, d:r2(Math.hypot(o.x-P.obj.position.x,o.z-P.obj.position.z)), pSeat:!!P.seat}; })"""
DLG = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||'',
  toast:(document.getElementById('toast')||{}).textContent||'', phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())}; })()"""
SEAT_NEAR = r"""(a=>{ const E=GAME.E; const near=(p,q,r)=>Math.hypot(p.x-q.x,p.z-q.z)<r; const ws=a.ws;
  const busy=st=>(E.npcs||[]).some(m=>m&&m.seat&&near(m.seat,st,0.35));
  const its=E.interactables.filter(i=>i.seat&&!i.hidden&&ws&&(i.seat.lv|0)===(ws.lv|0)&&near(i.seat,ws,a.r||1.8)&&!near(i.seat,ws,0.3)&&!busy(i.seat));
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
        s = await D.load_zone(pg, cdp, ZONE, DAY, HOUR, x=START[0], z=START[1], wait=7000) if START else await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=7000)   # BB-C 11-14：門口那一份從門口附近開始（從公館另一頭走 77 m，路上點到別家的門）
        if not R.check('讀到 %s' % ZONE, s['zone'] == ZONE, J(s)): await b.close(); sys.exit(1)
        R.note('對話紀錄（MutationObserver 掛在 #dlgText／#dlg／#dlgName，每換一句記一筆）：%s' % await pg.evaluate(DLGLOG_JS))
        m = await pg.evaluate(MEET, {'who': WHO, 'rel': REL, 'trust': TRUST, 'comf': COMF}); res['meet'] = m
        if TRUST or COMF: R.setup('【捷徑】%s 信任至少 %d、自在至少 %d → 關係 %s、階段 %s' % (WHO, TRUST, COMF, J(m.get('rel')), m.get('stage')))
        if SEED_MET:
            sm = await pg.evaluate("(ids=>ids.map(id=>{ try{ SOCIAL.meet(id,GAME.G.zone); if(SOCIAL.talkedTo) SOCIAL.talkedTo(id); }catch(e){ return [id,'ERR '+e.message]; } return [id, typeof POOL!=='undefined'&&POOL.met?POOL.met(GAME.G,id):SOCIAL.has(id,'FIRST_MET')]; }))", SEED_MET)
            R.setup('【捷徑】設成見過、初見演過（SOCIAL.meet＋talkedTo）：%s' % J(sm))
            if not R.check('FAIL_SETUP 檢查：%s 都已經算見過' % ','.join(SEED_MET), all(x[1] is True for x in sm), J(sm)): await b.close(); sys.exit(1)
        if VISITED:
            vv = await pg.evaluate("(a=>{ const G=GAME.G; G.visited=G.visited||{}; for(const z of a) G.visited[z]=true; return a.map(z=>[z,!!G.visited[z]]); })", VISITED)
            R.setup('【捷徑】墊「去過」G.visited %s（這類地點要自己走進去過一次才會出現在約人的選單）' % J(vv))
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
        await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)   # 11-14 BEAT6_r4：撥完時間以後遊戲時間停在 18.95（手機／面板還開著＝暫停），選單出不來——先收掉
        h0 = await pg.evaluate("+(+GAME.G.hour).toFixed(3)")
        for _ in range(50):   # 11-14 BEAT6_r3：選單在時間撥完 8 秒以後才跳（先跳「提醒：19:00…」toast）——等到 25 秒
            st = await pg.evaluate(DLG)
            if st['choices']:
                want = '直接過去' if go_direct else '自己走過去'
                i = next((k for k, x in enumerate(st['choices']) if x.startswith(want)), None)
                R.note('約定時間的選單 %s → 選「%s」' % (J(st['choices']), st['choices'][i] if i is not None else '（沒有，選第一個）'))
                await pg.screenshot(path=os.path.join(OUT, 'invp_%s_gochoice.png' % TAG))
                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % (i or 0)); await pg.wait_for_timeout(2500); break
            if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if st.get('phone'): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(600); continue
            await pg.wait_for_timeout(500)
        else:
            R.note('約定時間的選單 25 秒內沒出現：時間 %s → %s（沒走＝遊戲暫停）' % (h0, await pg.evaluate("+(+GAME.G.hour).toFixed(3)")))
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
        if ARRIVE_LOG:   # BB-C 21:02 ⑤：到店就自動坐下開演——ARRIVE_LOG 秒內每 0.5 秒記她一次、對話點下去（選單點第一個），每一句由對話紀錄記
            ms0 = await pg.evaluate("Math.round(performance.now())"); arr = []
            for j in range(ARRIVE_LOG * 2):
                arr.append(await pg.evaluate(HER, WHO))
                if j in (0, ARRIVE_LOG, ARRIVE_LOG * 2 - 1): await pg.screenshot(path=os.path.join(OUT, 'invp_%s_arrive_%02d.png' % (TAG, j)))
                st = await pg.evaluate(DLG)
                if st['choices']:
                    R.note('到店以後的選單 %s → 點第一個' % J(st['choices'])); await pg.screenshot(path=os.path.join(OUT, 'invp_%s_arrive_menu_%02d.png' % (TAG, j)))
                    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()")
                elif st['dlg']:
                    await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(500)
            R.note('到店 %d 秒（每 0.5 秒）她：%s' % (ARRIVE_LOG, J(arr)))
            dl = await pg.evaluate("(m=>(window.__ccDlg||[]).filter(x=>x.ms>=m))", ms0); res['arrive_log'] = dl
            R.note('到店 %d 秒的對話紀錄（%d 句）：%s' % (ARRIVE_LOG, len(dl), J(dl)))
            if EXPECT_LINE: R.check('到店以後有那一句「%s」（BB-C 21:02）' % EXPECT_LINE, any(EXPECT_LINE in x['t'] for x in dl), J([x['t'] for x in dl][:12]))
        else:
            arr = await sample(pg, '進店 12 秒（每 0.5 秒）她：', 24, 500, 'invp_%s_arrive' % TAG)
        iv2 = await pg.evaluate(IV, WHO); res['arrive'] = {'her': arr, 'iv': iv2}
        R.note('進店以後邀約紀錄：%s' % J(iv2))
        nseat = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden).length)()")
        if HER_IA and arr and not arr[-1].get('none'):
            h = arr[-1]
            await L.go_to(pg, cdp, R, h['x'], h['z'], 1.0, '她旁邊 1 m', max_s=60); await D.settle(pg)
            st = await pg.evaluate(DLG); hh = await pg.evaluate(HER, WHO)
            await pg.screenshot(path=os.path.join(OUT, 'invp_%s_her_ia.png' % TAG))
            nb = await pg.evaluate("(()=>{ const E=GAME.E, P=E.player.obj.position; return (E.interactables||[]).filter(i=>!i.hidden&&Math.hypot(i.x-P.x,i.z-P.z)<2.5).map(i=>({l:String(typeof i.label==='function'?i.label():i.label||''),d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2),npc:!!i.npc})).sort((a,b)=>a.d-b.d).slice(0,6); })()")
            R.note('走到她旁邊（離她 %s m）2.5 m 內的互動點：%s' % (hh.get('d'), J(nb)))
            R.check('走到她旁邊時互動鍵是「%s」（LAWWW-C INV-MEET-YIELD-1113，不是旁人的初見）' % HER_IA, HER_IA in st['interact'], st['interact'])
        pseat = bool(arr and arr[-1].get('pSeat'))
        if pseat: R.note('到店以後玩家已經坐下（pSeat true）：不再找她旁邊的空位（BB-C 21:02 ⑤）')
        if nseat and not pseat:
            R.check('到了她先坐著等（坐下、iv.waitSeat 有）', any(x.get('seat') for x in arr) and bool((iv2 or {}).get('waitSeat') or (iv2 or {}).get('state') == 'done'), J([arr[-1:], iv2]))
        else:   # BB-C 11-14 INV_BADM_r2 判：羽球場這種沒有座位的地方，她在場站著等也算
            R.check('到了她在場等（這裡沒有玩家能坐的位子，站著等也算）', any(not x.get('none') for x in arr), J([arr[-1:], iv2]))
        ws = (iv2 or {}).get('waitSeat')
        if not ws and arr and arr[-1].get('seat'): ws = {'x': arr[-1]['x'], 'z': arr[-1]['z'], 'lv': 0}
        seat = await pg.evaluate(SEAT_NEAR, {'ws': ws, 'r': SEAT_R}) if ws else None
        if ws:   # BB-C 11-14 LAWLIB r4：記 SEAT_R 內每一張座位的座標、有沒有人坐
            allst = await pg.evaluate("(a=>{ const E=GAME.E, f=v=>+(+v).toFixed(2); return E.interactables.filter(i=>i.seat&&!i.hidden&&(i.seat.lv|0)===(a.ws.lv|0)&&Math.hypot(i.seat.x-a.ws.x,i.seat.z-a.ws.z)<a.r).map(i=>({x:f(i.seat.x),z:f(i.seat.z),d:f(Math.hypot(i.seat.x-a.ws.x,i.seat.z-a.ws.z)),label:String(typeof i.label==='function'?i.label():i.label||''),taken:(E.npcs||[]).filter(m=>m&&m.seat&&Math.hypot(m.seat.x-i.seat.x,m.seat.z-i.seat.z)<0.35).map(m=>m.charId||m.id||'npc')})); })", {'ws': ws, 'r': SEAT_R})
            R.note('她（%s）%.1f m 內的座位：%s' % (J(ws), SEAT_R, J(allst)))
        R.note('她旁邊的空位：%s' % J(seat))
        m0 = await pg.evaluate("({money:GAME.G.money|0, h:+(+GAME.G.hour).toFixed(3)})")
        if not nseat: R.note('這裡沒有座位：不找空位、不坐（BB-C 11-14）'); seat = None
        if pseat: nseat = 0; seat = None
        if nseat and R.check('她旁邊有空位可以坐', bool(seat), J(ws)):
            await L.go_to(pg, cdp, R, seat['x'], seat['z'], 0.3, seat['label'] or '她旁邊的位子', max_s=60, lv=seat['lv']); await D.settle(pg)
            st = await pg.evaluate(DLG); R.note('走到她旁邊的位子，互動鍵「%s」' % st['interact'])
            if SEAT_LABEL and SEAT_LABEL not in st['interact']:   # BB-C 21:02 ⑥：最近的是人（「和常在圖書館的男生說話」）——【捷徑】往座位本身挪 0.15 m 一步，直到互動鍵是那張位子自己的字
                for k in range(8):
                    await pg.evaluate("(a=>{ const P=GAME.E.player.obj.position, dx=a.x-P.x, dz=a.z-P.z, d=Math.hypot(dx,dz); if(d>0.05){ const s=Math.min(0.15,d); P.x+=dx/d*s; P.z+=dz/d*s; } if(GAME.refreshInteract) GAME.refreshInteract(); })", {'x': seat['sx'], 'z': seat['sz']})
                    await pg.wait_for_timeout(400); st = await pg.evaluate(DLG)
                    if SEAT_LABEL in st['interact']: break
                R.setup('【捷徑】往座位本身挪（每步 0.15 m，%d 步）→ 互動鍵「%s」' % (k + 1, st['interact']))
                if not R.check('FAIL_SETUP 檢查：互動鍵是位子自己的「%s」' % SEAT_LABEL, SEAT_LABEL in st['interact'], st['interact']):
                    await pg.screenshot(path=os.path.join(OUT, 'invp_%s_seatlabel.png' % TAG)); await b.close(); sys.exit(1)
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
