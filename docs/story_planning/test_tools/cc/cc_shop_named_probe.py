"""CC-C（帳號 C）11-05：SHOP_NAMED（BB-C 08:16／08:17／08:30，V21R 最終 SHA 83d09d13b；SHOP-NAMED-NPC-1105）——新店面裡遇得到有名字的人。
  期望（台詞一字照企劃 AA_705 @ 4e6755340（企劃線 claude/magical-albattani-bk7b4n）的表；時段照 AA_705 補一節＋BB-C 08:30：以安週六 19:30、學姊單數週週日 16:30、芷若週日 14:00）：
    每一個人：在那個時段進店 → 人在、站或坐得對（站的：那一點站得住＝不在牆裡；坐的：坐在座位上）、不擋路（從店門走得到他旁邊、也走得回店門）→
      照玩家走近（2.5 m 內）跳出那一句（caption：說話的人＋句子）→ 走開再走近，同一學期不再跳（SHOPNPC.heard）。
    南洋 Alison（AA_615 第 4 節）：週五 19:00 走近爆米花櫃檯 → 第一次那一段（第一句「（爆米花櫃檯後面的人戴著戲院的帽子。抬頭，是 Alison。）」、「剛剛多做的，不用錢。不要跟別人說。」）。
  讀檔：使用者的存檔（遊戲 repo tests/fixtures/user_save_day37_1105.json，10/23）改到那一天那個時間、那一間店的出生點；日子＝10/23 以後第一個 SHOPNPC 說「在」的那一天。
  【前置／捷徑】讀檔指定日子時間地點（條件事件關閉）；不認識那個人（STORY.knows）＝照設計不跳，記下來不判。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [ONLY=afar_yt,xs_dakou_bh,alison] python3 cc_shop_named_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
ONLY = [x for x in (os.environ.get('ONLY') or '').split(',') if x]
R = L.Run('shop_named', OUT); D.setup(R, OUT)
FIX = 'tests/fixtures/user_save_day37_1105.json'
# AA_705 @ 4e6755340 表格（說話的人：None＝旁白）
EXP = {
    'xs_shanlan_an': (None, '（以安在雜誌牆前面翻一本手帳特刊。翻到一半，拿出自己的手帳對了一下。）'),
    'xs_shanlan_sis': (None, '（二樓法律區的走道上，學姊靠著書架坐著，膝蓋上是一本研究所的考古題。她沒有抬頭。）'),
    'xs_dabu_zhe': ('zhe', '這雙上次沒有我的號碼。……今天還是沒有。'),
    'xs_haopai_mx': ('classmate_mingxuan', '一筒四百五的那種比較耐打。算下來一顆比較便宜。'),
    'xs_xsports_xc': ('classmate_xinci', '這個水壺有刻度。我想知道我一天到底喝了多少。'),
    'xs_dakou_bh': ('classmate_bohan', '總圖十點關。這裡還可以再讀一個小時。'),
    'afar_yt': (None, '（語彤一個人坐窗邊，筆電旁邊那杯冰紅茶一口都沒喝。）'),
    'daybreak_ps': ('classmate_peishan', '這家的鬆餅好大！……我一個人吃不完，可是我還是點了。'),
    'aoki_sis': (None, '（學姊一個人坐在最裡面，茶壺旁邊攤著一疊影印的判決。）'),
    'bikeshop_kai': ('kai', '我只是來打氣。……順便看一下那台變速的。'),
    'wz_mokuyobi_zq': (None, '（子晴戴著耳機，在筆電上畫一張地圖。旁邊的拿鐵已經沒有泡了。）'),
    'wz_offbeat_zr': ('heroine_02', '我休假的時候，會去別人的店喝咖啡。……看看別人怎麼拉花。'),
}
ALISON1 = '（爆米花櫃檯後面的人戴著戲院的帽子。抬頭，是 Alison。）'   # AA_615 @ 4e6755340 第 33 行
ALISON2 = '剛剛多做的，不用錢。不要跟別人說。'   # 同上第 37 行
FIND_DAY = r"""((row)=>{ const G=GAME.G, d0=G.day, h0=G.hour, z0=G.zone, out=[]; const R=SHOPNPC.rows().find(r=>r.id===row); if(!R) return {err:'沒有這一列'};
  const h=R.from+Math.min(0.25,(R.to-R.from)/3); let hit=null, why=[];
  const wk0=G.weekday; for(let d=d0; d<d0+120&&!hit; d++){ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=h; G.zone=R.zone; const w=[]; if(R.hearBy==='alison'){ try{ const e=STORY.schedEnt(CHARACTERS.yu,G); if(e&&e.zone==='xs_nanyang') hit=d; }catch(e){} } else if(SHOPNPC.on(G,R,w)) hit=d; else why.push(w[0]); }
  G.day=d0; G.weekday=wk0; G.hour=h0; G.zone=z0; const cnt={}; why.forEach(w=>cnt[w]=(cnt[w]||0)+1);
  return {row:R.id, who:R.who, zone:R.zone, pose:R.pose, at:R.at||null, seat:R.seat||null, day:hit, key:hit!=null?CALENDAR.dateOf(hit).key:null, h, why:cnt}; })"""
CAPHOOK = r"""(()=>{ if(!window.__ccCapW){ const c0=GAME.caption; GAME.caption=function(w,t){ try{ (window.__ccCap=window.__ccCap||[]).push({w:String(w||''),t:String(t),h:+GAME.G.hour.toFixed(2)}); }catch(e){} return c0.apply(this,arguments); }; window.__ccCapW=true; } window.__ccCap=[]; return true; })()"""
NPC = r"""((id)=>{ const n=EVENTS.npcOf?EVENTS.npcOf(id):null, E=GAME.E; if(!n||!n.obj) return null; const p=n.obj.position;
  return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), y:+p.y.toFixed(2), lv:n.lv|0, pose:n.pose||null, seat:n.seat?[+n.seat.x.toFixed(2),+n.seat.z.toFixed(2)]:null, hidden:!!n.hidden, vis:n.obj.visible!==false,
    stand:E.canStand?!!E.canStand(p.x,p.z,0.25,n.lv|0):null, name:n.name||id}; })"""
DLGTXT = "(()=>{ const d=document.getElementById('dlg'); return d&&GAME.D&&GAME.D.active?(d.innerText||'').replace('▼ 點一下繼續','').trim():''; })()"
DLGLOG = "(()=>{ window.__ccDlg=[]; const d=document.getElementById('dlg'); if(!d||window.__ccDlgOb) return true; window.__ccDlgOb=new MutationObserver(()=>{ const t=(d.innerText||'').replace('▼ 點一下繼續','').trim(); const L=window.__ccDlg; if(t&&L[L.length-1]!==t) L.push(t); }); window.__ccDlgOb.observe(d,{childList:true,subtree:true,characterData:true}); return true; })()"   # 對話框每一次變的字（打字機的半句也會記，比對用 in）
KNOWS = "((id)=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,GAME.G):null)"


async def load_fix(pg, cdp, zone, day, hour):
    sv = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
    sv['zone'] = zone; sv.pop('pos', None); sv['day'] = day; sv['hour'] = hour
    sv['weekday'] = (await pg.evaluate("((d)=>CALENDAR.dateOf(d).wd)", day)) % 7   # 改日子要一起改星期（作息看 G.weekday；11-05 雲端第一次沒改＝Alison 週五還是照週四在溫州街）
    await pg.evaluate(CAPHOOK)   # 讀檔前就裝：出生點就在 2.5 m 內的（慢輪阿凱）一進門就跳
    await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })", sv)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    return await D.st(pg)


async def walk_near(pg, cdp, tag, n, r=1.6):
    """走到他旁邊 r m、站得住、離門那一側（玩家走過去的方向）"""
    p = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [o.x,o.z]; })()")
    dx, dz = p[0] - n['x'], p[1] - n['z']; d = math.hypot(dx, dz) or 1
    tgt = None
    for rr in (r, r + 0.4, r - 0.4, r + 0.8):
        for a in (0, 30, -30, 60, -60, 90, -90):
            ang = math.atan2(dx, dz) + math.radians(a); x, z = n['x'] + math.sin(ang) * rr, n['z'] + math.cos(ang) * rr
            if await pg.evaluate("(([x,z,lv])=>GAME.E.canStand(x,z,0.3,lv))", [x, z, n['lv']]): tgt = (x, z); break
        if tgt: break
    if not tgt: return None
    await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.35, '%s 走到他旁邊' % tag, max_s=150, lv=n['lv'])
    return await D.settle(pg)


async def one(pg, cdp, rid):
    info = await pg.evaluate(FIND_DAY, rid)
    tag = '[%s %s]' % (rid, info.get('who'))
    R.note('%s 列：%s' % (tag, J(info)))
    if not R.check('%s 10/23 以後 120 天內找得到他在的那一天' % tag, info.get('day') is not None, J(info)): return
    R.setup('%s 讀使用者的存檔，改到 %s %.2f %s（店裡出生點）' % (tag, info['key'], info['h'], info['zone']))
    s = await load_fix(pg, cdp, info['zone'], info['day'], info['h'])
    if not R.check('%s 讀到 %s' % (tag, info['zone']), s['zone'] == info['zone'], J(s)): return
    kn = await pg.evaluate(KNOWS, info['who'])
    n = None
    for _ in range(20):
        n = await pg.evaluate(NPC, info['who'])
        if n and n['vis']: break
        await pg.wait_for_timeout(500)
    sp = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [+o.x.toFixed(2),+o.z.toFixed(2)]; })()")
    R.note('%s 認識（STORY.knows）＝%s；人：%s；玩家出生點 %s' % (tag, kn, J(n), J(sp)))
    if not R.check('%s 人在店裡、看得到' % tag, bool(n) and not n['hidden'], J(n)): return
    if info['pose'] == 'seat': R.check('%s 坐在座位上（pose sit、有 seat）' % tag, n['pose'] in ('sit', 'read', 'eat') or bool(n['seat']), J(n))
    elif info['pose'] == 'stand': R.check('%s 站的那一點站得住（不在牆裡、桌上）' % tag, bool(n['stand']) and abs(n['y'] - (0 if n['lv'] == 0 else n['y'])) < 0.3, J(n))
    else: R.note('%s pose=%s（坐地板）' % (tag, info['pose']))
    d0 = math.hypot(sp[0] - n['x'], sp[1] - n['z'])
    ex = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&!i.hidden); return i?{label:i.label,x:i.x,z:i.z,r:i.radius||1,lv:i.lv|0}:null; })()")
    await D.shot(pg, 'named_%s_0' % rid)
    if d0 <= 2.5: R.note('%s 出生點離他 %.2f m（一進門就在 2.5 m 內）' % (tag, d0))
    s2 = await walk_near(pg, cdp, tag, n)
    if not R.check('%s 照玩家從店門走得到他旁邊（不擋路）' % tag, bool(s2) and s2['stand'], J(s2)): return
    for _ in range(30):   # 最多 15 秒（11-05 雲端：大口柏翰那一句晚才跳——店裡別人的對話字幕還在（HCIRCLE._capBusy）就等）
        caps = await pg.evaluate("window.__ccCap||[]")
        if caps: break
        await pg.wait_for_timeout(500)
    await D.shot(pg, 'named_%s_1_near' % rid, judge_black=False)
    exp = EXP.get(rid)
    if kn is False:
        R.note('%s 不認識他（STORY.knows=false）：照設計不跳；caption %s' % (tag, J(caps)))
    elif exp:
        nm = await pg.evaluate("((id)=>id?SHOPNPC.nameOf(id):'')", exp[0])
        hit = [c for c in caps if c['t'] == exp[1]]
        R.check('%s 走近 2.5 m 內跳出 AA_705 那一句「%s」（說話的人＝%s）' % (tag, exp[1], nm or '旁白'), bool(hit) and hit[0]['w'] == (nm or ''), J(caps))
        # 走開再走近：同一學期不再跳
        if ex:
            await L.go_to(pg, cdp, R, (ex['x'] + n['x']) / 2, (ex['z'] + n['z']) / 2, 0.8, '%s 走開' % tag, max_s=90, lv=ex['lv'])
        n0 = len(await pg.evaluate("window.__ccCap||[]"))
        await walk_near(pg, cdp, tag + ' 再一次', n); await pg.wait_for_timeout(6000)
        caps2 = (await pg.evaluate("window.__ccCap||[]"))[n0:]
        heard = await pg.evaluate("((id)=>SHOPNPC.heard(GAME.G,id))", info['who'])
        R.check('%s 走開再走近：同一學期不再跳（SHOPNPC.heard=%s）' % (tag, heard), not any(c['t'] == exp[1] for c in caps2) and heard, J(caps2))
    R.note('%s 這一次全部的 caption：%s' % (tag, J(await pg.evaluate("window.__ccCap||[]"))))
    # 走得回店門
    if ex:
        tgt = await D.standable_near(pg, ex['x'], ex['z'], ex['r'] * 0.6, ex['lv'])
        fb0 = (await D.st(pg))['fb']
        ok = tgt and await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.5, '%s 走回店門' % tag, max_s=150, lv=ex['lv'])
        q = await D.st(pg)
        R.check('%s 走得回店門「%s」（自動放過去 0 次）' % (tag, ex['label']), bool(ok) and q['fb'] == fb0, J(q))


async def alison(pg, cdp):
    info = await pg.evaluate(FIND_DAY, 'xs_nanyang_yu')
    tag = '[alison]'
    R.note('%s 列：%s' % (tag, J(info)))
    # BB-C 08:17：週五 19:00
    day = await pg.evaluate("((d0)=>{ for(let d=d0; d<d0+40; d++){ const G=GAME.G, h0=G.hour, dd=G.day, z0=G.zone, w0=G.weekday; G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=19; G.zone='xs_nanyang'; let ok=false; try{ const e=STORY.schedEnt(CHARACTERS.yu,G); ok=!!e&&e.zone==='xs_nanyang'&&CALENDAR.dateOf(d).wd===5; }catch(e){} G.day=dd; G.weekday=w0; G.hour=h0; G.zone=z0; if(ok) return d; } return null; })(GAME.G.day)")
    if not R.check('%s 10/23 以後找得到她在南洋打工的週五' % tag, day is not None, J(day)): return
    R.setup('%s 讀使用者的存檔，改到 %s 19:00 南洋（xs_nanyang 出生點）' % (tag, await pg.evaluate("((d)=>CALENDAR.dateOf(d).key)", day)))
    s = await load_fix(pg, cdp, 'xs_nanyang', day, 19.0)
    if not R.check('%s 讀到南洋大廳' % tag, s['zone'] == 'xs_nanyang', J(s)): return
    kn = await pg.evaluate(KNOWS, 'yu')
    n = None
    for _ in range(20):
        n = await pg.evaluate(NPC, 'yu')
        if n and n['vis']: break
        await pg.wait_for_timeout(500)
    R.note('%s 認識 Alison＝%s；人：%s' % (tag, kn, J(n)))
    if not R.check('%s Alison 在爆米花櫃檯、看得到' % tag, bool(n), J(n)): return
    await pg.evaluate(DLGLOG)   # 走過去的路上就會開始（ALISON_R），從這裡開始全程記
    await walk_near(pg, cdp, tag, n, r=1.4)
    seen = []; t0 = time.time()
    while time.time() - t0 < 60:
        q = await D.st(pg)
        txt = await pg.evaluate(DLGTXT)
        if txt:   # 打字機：字停下來（0.5 秒內一樣）才記、才點（11-05 雲端第一次只記到半句）
            await pg.wait_for_timeout(500); t2 = await pg.evaluate(DLGTXT)
            if t2 != txt: continue
            if not seen or seen[-1] != txt: seen.append(txt)
        if q['choices']: seen.append('選項 ' + J(q['choices'])); await L.tap(pg, cdp, '#choices button:first-child'); await pg.wait_for_timeout(800); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if seen and not q['busy']: break
        await pg.wait_for_timeout(500)
    seen = seen + await pg.evaluate("window.__ccDlg||[]")
    R.note('%s 演出來的：%s' % (tag, J(seen)))
    if kn is False: R.note('%s 不認識 Alison：照設計不演' % tag); return
    R.check('%s 第一次那一段有 AA_615 的「%s」和「%s」' % (tag, ALISON1, ALISON2), any(ALISON1 in x for x in seen) and any(ALISON2 in x for x in seen), J(seen))
    mv = await D.pushable(pg, cdp)
    R.check('%s 演完推得動' % tag, mv >= 0.3, J(mv))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC SHOP_NAMED（新店面裡有名字的人，AA_705／AA_615）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        if not R.check('這一版有 SHOPNPC', await pg.evaluate("typeof SHOPNPC!=='undefined'&&!!SHOPNPC.rows")): await b.close(); sys.exit(1)
        s = await load_fix(pg, cdp, 'dorm', 37, 8.5)
        rows = await pg.evaluate("SHOPNPC.rows().map(r=>r.id)")
        R.note('這一版的列：%s' % J(rows))
        for rid in [r for r in EXP if r in rows] + ['alison']:
            if ONLY and rid not in ONLY: continue
            print('== %s' % rid, flush=True)
            try:
                if rid == 'alison': await alison(pg, cdp)
                else: await one(pg, cdp, rid)
            except Exception as ex: R.check('[%s] 探針沒有例外' % rid, False, repr(ex)[:300])
        miss = [r for r in EXP if r not in rows]
        if miss: R.note('AA_705 有、這一版沒有的列：%s' % J(miss))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
