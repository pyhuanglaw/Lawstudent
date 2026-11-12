"""CC（帳號 A）11-10：X324 MOVIE-TALK-1110（AA_745 72 部電影的情節、那一幕、散場三選項、with、skip、看過紀錄）；BB 20:35；開發分支 354b527b5。Playwright（PC GPU）≠ iPhone。
對照的程式（354b527b5）：src/movies3d.js（S.infoLines 海報牆「看這部在演什麼」：看過以前只有第一句；S.midLines／playMid 那一幕；S.after：第二次看同一部＝一句旁白（again.comedy／other）、
  否則 talk（一天一人一次 G.daily.mvTalk_<人>）→ with.after → with.later；S.talk 三選項、re 她的回答、fx：fr＝熟悉信任自在各 +n、love＝npcRom（SOCIAL.adjust）；
  S.pickAdj：skip＝換同一段另一部、她說 skip.lines、不扣好感；force＝那一段一定這部）、src/aa614_3d.js（一個人看：soloPlay＝solo 三句中間接兩部的 scene）、
  src/data/movie_plots.js（MOVIE_PLOTS：films／pick／cond／later／again）。期望值一律從遊戲載入的 MOVIE_PLOTS（＝AA_745 匯入）讀，原文另存 movie_talk_lines.txt 給 BB 對稿。
CASES（逗號分隔；每個 case 重新讀檔）：
  INFO     【前置】day46 存檔改 2025-11-01 14:00、南洋大廳 → 觸控走到「看這部在演什麼」按 → 每部只有第一句（S.firstSentence）。
  TALK0／TALK1／TALK2  day46 08:00 手機約以安（heroine_01）南洋今天最早一場 →「今天」前往 → 一路玩：那一幕、散場三選項選第 K 個、她的回答、fx（SOCIAL.adjust 的實際呼叫）
           TALK0 另外：看完以後回大廳海報牆＝看過的那部是全部情節、沒看過的仍是第一句；同一天 14:00 約語彤（heroine_03）看＝照樣有選項；
           19:30 再約以安【捷徑：約好以後把那一筆的片換成同一段另一部】＝沒有選項、沒有「第二次看」旁白（一天一人一次）。
  AGAIN    【前置】MOVIE_SEEN.heroine_01 兩部都看過（昨天）→ 約以安看 → 沒有選項、只有一句 again 旁白（喜劇／其他照片的 genre）。
  SOLO     【前置】2025-11-01 14:00 南洋大廳 → 觸控買票 → 進 1 廳 → 坐下 → solo 三句中間接兩部的 scene、沒有選項；之後海報牆兩部都是全部情節。
  SKIP     【前置】子晴（heroine_04）朋友＋聯絡方式 → 手機約子晴南洋（2025-11：pick m2511b＝skip）→ 答應以後她說換片那句、約好的是另一部、好感前後不扣。
  WITHZQ1／WITHZQ2／WITHZR  【前置】日期改 2028-01-15（《貓咪咖啡館的星期三》m2801b）／2028-05-15（《第八關》m2805b）、子晴；2025-11-01（《黑白的城市》m2511b）、芷若（heroine_02）
           → 約她看、一路玩（散場選第一個）→ 記 with 那一段原文（after／mid／later：later 記 MOVIE_LATER／手機排程）。
  OLD（要兩個網址：python3 cc_movie_talk_probe.py <舊版 v9.10.24 網址> <新版網址> <out>）：舊版用 day46 約以安看完一場 → 取 localStorage 自動存檔
           → 新版讀進來（標題「繼續」）→ 沒有 JS 例外、NY_WATCHED／MOVIE_TOGETHER 還在、MOVIES.seenRec 可以用、海報牆照常。
全程 JS 例外 0、walkFallbacks 0；所有 GAME.say／caption／choose 原文存 movie_talk_lines.txt。
  KX1～KX4（BB 20:36）：舊序章系所那一年（2024-11、2025-03、2025-05、2025-07）約可昕看 m2411b／m2503b／m2505a／m2507b（稿上沒有可昕的回答）→ 散場選完不卡住、沒有 undefined／空白對話框。
用法：LW_TESTS=<wt>/tests CASES=... python3 cc_movie_talk_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
from playwright.async_api import async_playwright
TWO = len(sys.argv) >= 4
URL0 = sys.argv[1] if TWO else None
URL, OUT = (sys.argv[2], sys.argv[3]) if TWO else (sys.argv[1], sys.argv[2])
os.makedirs(OUT, exist_ok=True)
CASES = (os.environ.get('CASES') or ('OLD' if TWO else 'INFO,TALK0,TALK1,TALK2,AGAIN,SOLO,SKIP,WITHZQ1,WITHZQ2,WITHZR')).split(',')
R = L.Run('movie_talk', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
TXT = []
HOOK = r"""(()=>{ window.__MT=window.__MT||[]; window.__ADJ=window.__ADJ||[]; if(GAME.__mtHooked) return; GAME.__mtHooked=1;   /* r2：只包一次（r1 每次讀檔重包一層＝每句記兩次）*/ const P=(k,v)=>{ try{ window.__MT.push({k, v:String(v||''), h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}); }catch(e){} };
  for(const [n,k] of [['toast','toast'],['caption','cap'],['say','say']]){ const f=GAME[n]; if(typeof f!=='function') continue; GAME[n]=function(a,b){ P(k, n==='toast'?a:(n==='caption'?((a?a+'｜':'')+b):(((a&&a.name)||'')+'｜'+b))); return f.apply(this,arguments); }; }
  const c0=GAME.choose; if(typeof c0==='function') GAME.choose=function(o){ try{ P('choose', JSON.stringify((o||[]).map(x=>x&&x.t))); }catch(e){} return c0.apply(this,arguments); };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&!SOCIAL.__mt){ const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ try{ window.__ADJ.push({id, d:JSON.parse(JSON.stringify(d||{})), h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone, n:window.__MT.length}); }catch(e){} return a0.apply(this,arguments); }; SOCIAL.__mt=1; } })()"""
REL = "(w=>{ const r=SOCIAL.rel(w)||{}; return {fam:r.fam, trust:r.trust, comf:r.comf, npcRom:r.npcRom}; })"
INFO = "(()=>{ const p=MOVIES.billAt(GAME.G); return p.bill.map(b=>({id:b.id, title:b.title, genre:b.genre, first:MOVIES.firstSentence((MOVIES.info(b.id)||{}).plot), full:(MOVIES.info(b.id)||{}).plot||null, seenMe:MOVIES.seenWith(GAME.G,'me',b.id)})); })()"


def base_state(who=None, day_key=None, hour=8.0, zone=None):
    s = json.load(open(SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    s['hour'] = hour; s['invites'] = []; s['money'] = 5000
    if zone: s['zone'] = zone; s['pos'] = None
    soc = copy.deepcopy(s.get('social') or {})
    for w in ([who] if isinstance(who, str) else (who or [])):
        r = soc.setdefault('rel', {}).setdefault(w, {})
        r['fam'] = max(r.get('fam', 0), 50); r['trust'] = max(r.get('trust', 0), 35); r['comf'] = max(r.get('comf', 0), 30)
        c = dict(s.get('contacts') or {}); c[w] = c.get(w) or 1; s['contacts'] = c
    s['social'] = soc
    v = dict(s.get('visited') or {}); v['xs_nanyang'] = v.get('xs_nanyang') or 1; s['visited'] = v
    return s


async def load(pg, cdp, st, day_key=None, why=''):
    if day_key:
        d = await pg.evaluate("(k=>STORY.dayOfKey(k))(%s)" % J(day_key)); st['day'] = d
        try: st['weekday'] = await pg.evaluate("(d=>CALENDAR.dateOf(d).wd%%7)(%d)" % d)
        except Exception: pass
    await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(3500); await pe.settle(pg, cdp, [], 30)
    await pg.evaluate("window.__MT=[]; window.__ADJ=[];")
    await pg.evaluate(HOOK)
    R.setup('【前置／捷徑】%s' % why)


async def book(pg, cdp, tag, who, slot=0):
    """手機「朋友」→ 她 → 看電影、逛書店 → 南洋 → 今天第 slot 個時間；回傳 invite"""
    pe.WHO = who
    await pe.phone(pg, cdp, 'friends')
    if not await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who): R.check('%s 手機朋友頁有 %s' % (tag, who), False, ''); return None
    await pg.wait_for_timeout(1500)
    if not await pe.choose(pg, cdp, '看電影', True): R.check('%s 有「看電影、逛書店」' % tag, False, J(await pe.opts(pg))); return None
    o = await pe.opts(pg); pc = next((x for x in o if '南洋' in x['t']), None)
    if not R.check('%s 選得到南洋戲院' % tag, bool(pc) and not pc['dim'], J(o)): await pe.close_phone(pg, cdp); return None
    await pe.choose(pg, cdp, pc['t'], True); o = await pe.opts(pg)
    ts = [x for x in o if x['t'].startswith('今天') and not x['dim']]
    if not R.check('%s 今天有能選的時間（要第 %d 個）' % (tag, slot + 1), len(ts) > slot, J(o)): await pe.close_phone(pg, cdp); return None
    await pe.choose(pg, cdp, ts[slot]['t'], True); log = []; await pe.settle(pg, cdp, log, 30)
    iv = await pg.evaluate("(w=>{ const L=(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day&&v.state==='accepted'); const v=L[L.length-1]; return v?{id:v.id,h:v.h,film:v.film,title:(MOVIES.film(v.film)||{}).title}:null; })(%s)" % J(who))
    R.note('%s 約好：%s；對話 %s' % (tag, J(iv), J(log[-6:])))
    R.check('%s 約成了' % tag, bool(iv), J(log[-4:]))
    return iv


async def go_watch(pg, cdp, tag, who, iv, pickK=0, want=None):
    """手機「今天」前往 → 一路玩；散場後（回到大廳）出現的選單選第 pickK 個，其他選單選第一個。回傳 {trace, choices}"""
    await pe.phone(pg, cdp, 'today')
    ok = await pe.tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id'])
    if not ok and await pg.evaluate("GAME.G.zone") == 'xs_nanyang':   # r3：人已經在南洋（上一場看完）＝手機照設計不給「前往」（INV.canGo／hereNote）→ 先走出戲院再按
        await pe.close_phone(pg, cdp)
        ex = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.exit&&q.exit.to!=='xs_nanyang_hall'); return i?{x:i.x,z:i.z,label:i.label}:null; })()")
        if ex:
            dg = await pg.evaluate("(()=>{ const P=GAME.E.player; return {me:[+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)], busy:!!P.busy, seat:!!P.seat, npcs:(GAME.E.npcs||[]).filter(n=>n.obj&&!n.isExtra).map(n=>({id:n.charId||n.id||n.name, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), frozen:!!n.frozen}))}; })()")
            R.note('%s 看完一場以後在大廳：%s' % (tag, J(dg))); await pg.screenshot(path=os.path.join(OUT, 'mt_lobby_after_%s.jpg' % tag.strip('[]').replace(' ', '_')), type='jpeg', quality=70)   # r5：走不到出口是探針還是她擋路
            okw = await L.go_to(pg, cdp, R, ex['x'], ex['z'], 0.6, '%s 先走出戲院（%s）' % (tag, ex['label']), max_s=90)
            if not okw: await pg.screenshot(path=os.path.join(OUT, 'mt_lobby_stuck_%s.jpg' % tag.strip('[]').replace(' ', '_')), type='jpeg', quality=70)
            await L.tap(pg, cdp, '#interact')
            for _ in range(30):
                if await pg.evaluate("GAME.G.zone") != 'xs_nanyang': break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(2500); await pe.phone(pg, cdp, 'today')
            ok = await pe.tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id'])
    if not R.check('%s「今天」有「前往」' % tag, ok, ''): return None
    t0 = time.time(); zones = []; hall = False; chs = []
    while time.time() - t0 < 480:
        q = await L.state(pg); z = await pg.evaluate("GAME.G.zone")
        if not zones or zones[-1] != z: zones.append(z)
        if z == 'xs_nanyang_hall': hall = True
        if q['choices']:
            o = await pe.opts(pg); ot = [x['t'] for x in o]; after = (bool(want) and sorted(ot[:len(want)]) == sorted(want)) or (not want and hall)   # 散場三選項：照 MOVIE_PLOTS 的選項字認（r5：第二版選項隨機排順序＝比集合）
            k = (ot.index(want[pickK]) if (want and pickK < len(want) and want[pickK] in ot) else min(pickK, len(o) - 1)) if after else 0   # r5：選 MOVIE_PLOTS 第 K 個的字（不管畫面順序）
            chs.append({'after': after, 'opts': [x['t'] for x in o], 'pick': k, 'n': await pg.evaluate("(window.__MT||[]).length"), 'rel_before': await pg.evaluate("(%s)(%s)" % (REL, J(who)))})
            await pe.choose(pg, cdp, o[k]['t'], True); continue
        st = await pg.evaluate("((id)=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v&&v.state; })(%s)" % J(iv['id']))
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if st in ('done', 'over') and not q['busy'] and hall: break
        await pg.wait_for_timeout(450)
    return {'zones': zones, 'hall': hall, 'choices': chs}


async def dump(pg, tag):
    mt = await pg.evaluate("window.__MT||[]"); adj = await pg.evaluate("window.__ADJ||[]")
    TXT.append('==== %s ====' % tag)
    for e in mt: TXT.append('[%s %s %.2f] %s' % (e['k'], e['z'], e['h'], e['v']))
    TXT.append('-- SOCIAL.adjust：%s' % J(adj))
    return mt, adj


async def info_look(pg, cdp, tag):
    it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.movieInfo); return i?{x:i.x,z:i.z,label:i.label}:null; })()")
    if not R.check('%s 大廳有「看這部在演什麼」' % tag, bool(it), ''): return None
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.6, '%s 走到海報牆' % tag, max_s=90)
    n0 = len(await pg.evaluate("window.__MT||[]")); await L.tap(pg, cdp, '#interact'); log = []; await pe.settle(pg, cdp, log, 30)
    mt = (await pg.evaluate("window.__MT||[]"))[n0:]
    return [e['v'].split('｜', 1)[-1] for e in mt if e['k'] == 'say']


async def expect_talk(pg, film, who):
    return await pg.evaluate("((id,w)=>{ const T=MOVIES.talkFor(GAME.G,w,id); const f=MOVIES.info(id)||{}; return {talk:T, scene:f.scene||null, with:(f.with||{})[w]||null, again:MOVIES.againLine(id), genre:(MOVIES.film(id)||{}).genre}; })(%s,%s)" % (J(film), J(who)))


async def case_talk(pg, cdp, K, chain):
    tag = '[TALK%d]' % K
    await load(pg, cdp, base_state(['heroine_01', 'heroine_03']), why='day46 08:00、以安和語彤朋友＋聯絡方式、錢 5000、去過南洋')
    iv = await book(pg, cdp, tag, 'heroine_01', 0)
    if not iv: return
    ex = await expect_talk(pg, iv['film'], 'heroine_01'); TXT.append('==== %s 期望（MOVIE_PLOTS）%s《%s》：%s' % (tag, iv['film'], iv['title'], J(ex)))
    r = await go_watch(pg, cdp, tag, 'heroine_01', iv, K, [o['t'] for o in ((ex['talk'] or {}).get('opts') or [])])
    mt, adj = await dump(pg, tag)
    if not r: return
    R.note('%s 區域：%s；選單：%s' % (tag, J(r['zones']), J(r['choices'])))
    says = [e['v'] for e in mt if e['k'] == 'say']
    R.check('%s 那一幕（scene）有演' % tag, bool(ex['scene']) and any(ex['scene'][:12] in s for s in says), J(ex['scene']))
    aft = [c for c in r['choices'] if c['after']]
    T = ex['talk'] or {}
    want = [o['t'] for o in (T.get('opts') or [])]
    R.check('%s 散場後三個選項＝MOVIE_PLOTS talk（%s；順序不比）' % (tag, J(want)), bool(aft) and sorted(aft[0]['opts'][:len(want)]) == sorted(want) and len(want) == 3, J(aft))
    if aft and T.get('opts'):
        o = T['opts'][K]; re_ = o.get('lines') or []
        R.check('%s 選第 %d 個以後她的回答＝re（%d 句）' % (tag, K + 1, len(re_)), all(any(x.replace('{name}', '')[:10] in s for s in says) for x in re_), J(re_))
        fx = o.get('fx') or {}; hit = [a for a in adj if a['id'] == 'heroine_01' and set(a['d'].keys()) <= {'fam', 'trust', 'comf', 'npcRom'} and a['z'] in ('xs_nanyang', 'xs_nanyang_hall')]
        R.note('%s fx 期望 %s；大廳的 SOCIAL.adjust：%s；選之前 %s' % (tag, J(fx), J(hit), J(aft[0]['rel_before'])))
        fr, lv = int(fx.get('fr') or 0), int(fx.get('love') or 0)
        exp = {}
        if fr: exp.update(fam=fr, trust=fr, comf=fr)
        if lv: exp['npcRom'] = lv
        n0 = aft[0].get('n') or 0; hit2 = [a for a in hit if a['n'] >= n0]   # r3：只看散場選項之後的（之前的是看到一半那一場、見面的加法）
        if exp: R.check('%s fx 照 AA_745（%s）：選了以後有一筆一樣的 SOCIAL.adjust' % (tag, J(exp)), any(a['d'] == exp for a in hit2), J(hit2))
        else: R.note('%s 這個選項 AA_745 沒有 fx（選了以後的 adjust：%s，是見面本身的加法）' % (tag, J(hit2)))
    R.check('%s walkFallbacks 0' % tag, (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')
    if not chain: return
    # 看過以後的海報牆
    fi = await pg.evaluate(INFO); lines = await info_look(pg, cdp, tag + '海報牆（看過）')
    R.note('%s 看過以後海報牆：%s；期望 %s' % (tag, J(lines), J(fi)))
    if lines is not None:
        ok = all(any(('《%s》%s' % (f['title'], f['full'] if f['seenMe'] else f['first'])) == l for l in lines) for f in fi)
        R.check('%s 海報牆：看過的那部＝全部情節、沒看過的＝第一句' % tag, ok and any(f['seenMe'] for f in fi), J({'lines': lines, 'info': fi}))
    # 同一天第二個人
    tag2 = '[TALK0-語彤]'; await pg.evaluate("window.__MT=[]; window.__ADJ=[]")
    iv2 = await book(pg, cdp, tag2, 'heroine_03', 0)
    if iv2:
        ex2 = await expect_talk(pg, iv2['film'], 'heroine_03'); TXT.append('==== %s 期望 %s' % (tag2, J(ex2)))
        r2 = await go_watch(pg, cdp, tag2, 'heroine_03', iv2, 0, [o['t'] for o in ((ex2['talk'] or {}).get('opts') or [])]); mt2, _ = await dump(pg, tag2)
        R.check('%s 同一天第二個人：散場照樣有選項' % tag2, bool(r2) and any(c['after'] for c in r2['choices']), J(r2 and r2['choices']))
    # 同一天同一人、另一部
    tag3 = '[TALK0-以安再一次]'; await pg.evaluate("window.__MT=[]; window.__ADJ=[]")
    iv3 = await book(pg, cdp, tag3, 'heroine_01', 0)
    if iv3:
        other = await pg.evaluate("((id,f)=>{ const p=MOVIES.billAt(GAME.G); const o=p.bill.find(b=>b.id!==f); const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); if(v&&o) v.film=o.id; return o&&o.id; })(%s,%s)" % (J(iv3['id']), J(iv['film'])))
        R.setup('%s【捷徑】約好以後把這一筆的片換成同一段另一部 %s（不是同一部、測一天一人一次）' % (tag3, other))
        ex3 = await expect_talk(pg, other, 'heroine_01')
        r3 = await go_watch(pg, cdp, tag3, 'heroine_01', iv3, 0, [o['t'] for o in ((ex3['talk'] or {}).get('opts') or [])]); mt3, _ = await dump(pg, tag3)
        again = [e for e in mt3 if e['k'] == 'say' and ('第二次看' in e['v'] or '看過了' in e['v'])]
        R.check('%s 同一天同一人第二次：沒有散場選項、也沒有「第二次看」旁白' % tag3, bool(r3) and not any(c['after'] for c in r3['choices']) and not again, J({'ch': r3 and r3['choices'], 'again': again}))


async def case_again(pg, cdp):
    tag = '[AGAIN]'; st = base_state(['heroine_01'])
    await load(pg, cdp, st, why='day46 08:00、以安朋友')
    await pg.evaluate("(()=>{ const G=GAME.G, p=MOVIES.billAt(G), F=G.flags||(G.flags={}); F.MOVIE_SEEN=F.MOVIE_SEEN||{}; F.MOVIE_SEEN.heroine_01={}; for(const b of p.bill) F.MOVIE_SEEN.heroine_01[b.id]=G.day-1; })()")
    R.setup('%s【前置】MOVIE_SEEN.heroine_01＝這一段兩部都看過（昨天）' % tag)
    iv = await book(pg, cdp, tag, 'heroine_01', 0)
    if not iv: return
    ex = await expect_talk(pg, iv['film'], 'heroine_01')
    r = await go_watch(pg, cdp, tag, 'heroine_01', iv, 0, [o['t'] for o in ((ex['talk'] or {}).get('opts') or [])]); mt, adj = await dump(pg, tag)
    ag = [e['v'] for e in mt if e['k'] == 'say' and ex['again'] and ex['again'] in e['v'] and e['z'] in ('xs_nanyang', 'xs_nanyang_hall')]
    R.check('%s 第二次看：沒有散場選項、有一句 again 旁白（%s：%s）' % (tag, ex['genre'], ex['again']), bool(r) and not any(c['after'] for c in r['choices']) and len(ag) == 1, J({'ch': r and r['choices'], 'again': ag}))


async def case_solo(pg, cdp):
    tag = '[SOLO]'
    await load(pg, cdp, base_state(None, hour=14.0, zone='xs_nanyang'), day_key=None, why='day46 14:00 南洋大廳')
    fi0 = await pg.evaluate(INFO); l0 = await info_look(pg, cdp, '[INFO]')
    R.note('[INFO] 海報牆（沒看過）：%s；期望第一句 %s' % (J(l0), J([f['first'] for f in fi0])))
    if l0 is not None:
        R.check('[INFO] 沒看過＝每部只有第一句', all(('《%s》%s' % (f['title'], f['first'])) in l0 for f in fi0) and len(l0) == len(fi0), J(l0))
    tk = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.nyTicket&&!q.hidden); return i?{x:i.x,z:i.z,label:i.label}:null; })()")
    if not R.check('%s 大廳有買票' % tag, bool(tk), ''): return
    await L.go_to(pg, cdp, R, tk['x'], tk['z'], 0.6, '%s 走到售票' % tag, max_s=90); await L.tap(pg, cdp, '#interact')
    for _ in range(40):
        q = await L.state(pg)
        if q['choices']: o = await pe.opts(pg); k = next((i for i, x in enumerate(o) if '買' in x['t'] or '票' in x['t']), 0); await pe.choose(pg, cdp, o[k]['t'], True); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if await pg.evaluate("!!(NYS.hasTicket&&NYS.hasTicket(GAME.G))"): break
        await pg.wait_for_timeout(400)
    if not R.check('%s 買到票（NY_TICKET）' % tag, await pg.evaluate("!!(NYS.hasTicket&&NYS.hasTicket(GAME.G))"), ''): return
    hl = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.exit&&q.exit.to==='xs_nanyang_hall'); return i?{x:i.x,z:i.z}:null; })()")
    if not R.check('%s 有「進 1 廳」' % tag, bool(hl), ''): return
    await L.go_to(pg, cdp, R, hl['x'], hl['z'], 0.6, '%s 走到 1 廳門口' % tag, max_s=90); await L.tap(pg, cdp, '#interact')
    for _ in range(30):
        if await pg.evaluate("GAME.G.zone") == 'xs_nanyang_hall': break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(2500)
    se = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const L=(GAME.E.interactables||[]).filter(q=>q.seat&&q.seat.kind==='cinema'); L.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=L[0]; return i?{x:i.x,z:i.z}:null; })()")
    if not R.check('%s 1 廳有座位' % tag, bool(se), ''): return
    await L.go_to(pg, cdp, R, se['x'], se['z'], 0.4, '%s 走到座位' % tag, max_s=90); n0 = len(await pg.evaluate("window.__MT||[]")); await L.tap(pg, cdp, '#interact')
    chs = []; t0 = time.time()
    while time.time() - t0 < 120:
        q = await L.state(pg)
        if q['choices']: o = await pe.opts(pg); chs.append([x['t'] for x in o]); await pe.choose(pg, cdp, o[0]['t'], True); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if await pg.evaluate("GAME.G.flags.NY_WATCHED===GAME.G.day") and not q['busy'] and time.time() - t0 > 8: break
        await pg.wait_for_timeout(450)
    mt, _ = await dump(pg, tag); says = [e['v'] for e in mt[n0:] if e['k'] == 'say']
    sc = await pg.evaluate("(()=>{ const p=MOVIES.billAt(GAME.G); return p.bill.map(b=>(MOVIES.info(b.id)||{}).scene); })()")
    R.note('%s 坐下以後的選單 %s；旁白 %s' % (tag, J(chs), J(says)))
    R.check('%s 一個人看：兩部的那一幕都有演' % tag, all(s and any(s[:12] in x for x in says) for s in sc), J(sc))
    R.check('%s 一個人看：沒有散場三選項（坐下的選單以外）' % tag, all(len(c) < 3 or not any('看' in t for t in c) for c in chs[1:]), J(chs))
    fi = await pg.evaluate(INFO)
    R.check('%s 看完兩部都算看過（MOVIE_SEEN.me）' % tag, all(f['seenMe'] for f in fi), J(fi))


async def case_skip(pg, cdp):
    tag = '[SKIP]'; await load(pg, cdp, base_state(['heroine_04']), why='day46 08:00、子晴朋友（fam50 trust35 comf30）＋聯絡方式')
    pr = await pg.evaluate("(()=>{ const p=MOVIES.billAt(GAME.G); return {bill:p.bill.map(b=>b.id), choose:MOVIES.choose(GAME.G,'heroine_04'), pick:(MOVIE_PLOTS.pick||{})}; })()")
    R.note('%s 這一段 %s；MOVIES.choose（約之前試算）%s' % (tag, J(pr['bill']), J(pr['choose'])))
    b0 = await pg.evaluate("(%s)('heroine_04')" % REL)
    iv = await book(pg, cdp, tag, 'heroine_04', 0); mt, adj = await dump(pg, tag)
    b1 = await pg.evaluate("(%s)('heroine_04')" % REL)
    sk = await pg.evaluate("(()=>{ const x=MOVIES.withOf('m2511b','heroine_04'); return x; })()")
    R.note('%s skip 的 with：%s；好感 約之前 %s → 之後 %s' % (tag, J(sk), J(b0), J(b1)))
    if iv:
        says = [e['v'] for e in mt if e['k'] == 'say']
        if pr['choose'] and pr['choose'].get('say'):
            R.check('%s 約好的是換過的片（不是 m2511b）' % tag, iv['film'] != 'm2511b', J(iv))
            R.check('%s 她說了換片那一句（skip.lines）' % tag, all(any(t[:10] in s for s in says) for t in pr['choose']['say']), J({'want': pr['choose']['say'], 'says': says[-6:]}))
        else:
            R.note('%s 這次 choose 本來就沒挑到 m2511b（沒有 skip 可測）' % tag)
        R.check('%s 好感不扣（fam／trust／comf／npcRom 都沒有變少）' % tag, all((b1.get(k) or 0) >= (b0.get(k) or 0) for k in ('fam', 'trust', 'comf', 'npcRom')), J([b0, b1]))


async def case_with(pg, cdp, who, key, film):
    tag = '[WITH %s %s]' % (who, film)
    await load(pg, cdp, base_state([who]), day_key=key, why='日期改 %s 08:00、%s 朋友＋聯絡方式（day46 存檔的其他欄位不變）' % (key, who))
    ex = await expect_talk(pg, film, who); TXT.append('==== %s 期望 with：%s' % (tag, J(ex['with'])))
    iv = await book(pg, cdp, tag, who, 0)
    if not iv: return
    R.check('%s 約好的片＝%s（pick force）' % (tag, film), iv['film'] == film, J(iv))
    r = await go_watch(pg, cdp, tag, who, iv, 0); mt, adj = await dump(pg, tag)
    says = [e['v'] for e in mt if e['k'] == 'say']
    W = ex['with'] or {}
    lines = W.get('lines') or []
    later = await pg.evaluate("(()=>({later:(GAME.G.flags||{}).MOVIE_LATER||null, due:(GAME.G.flags||{}).MOVIE_LATER_DUE||null, phone:JSON.stringify((GAME.G.phone||{}).sched||(GAME.G.phone||{}).queue||null).slice(0,600)}))()")
    R.note('%s with kind %s；later 紀錄 %s' % (tag, W.get('kind'), J(later)))
    if W.get('kind') in ('after', 'mid'):
        R.check('%s with.%s 那一段有演（%d 句）' % (tag, W.get('kind'), len(lines)), all(any(t.replace('{name}', '')[:8] in s for s in says) for t in lines), J(lines))
    else:
        R.note('%s with.kind＝%s（之後才出現，記上面的紀錄）' % (tag, W.get('kind')))
    R.check('%s walkFallbacks 0' % tag, (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def case_old(p, b, ctx, pg, cdp):
    tag = '[OLD]'
    p0 = await ctx.new_page(); await p0.goto(URL0)
    if not R.check('%s 舊版（v9.10.24）載入' % tag, await L.wait_loaded(p0), ''): return
    ver = await p0.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]"); R.note('%s 舊版 %s' % (tag, ver))
    pgo = pg
    await L.load_state(p0, base_state(['heroine_01']), quiet_phone=True); await p0.wait_for_timeout(3500); await pe.settle(p0, cdp, [], 30)
    R.setup('%s【前置】舊版讀 day46 08:00、以安朋友' % tag)
    # 舊版約以安看一場（同一套手機流程；cdp 用舊版的）
    cdp0 = await ctx.new_cdp_session(p0)
    iv = await book(p0, cdp0, tag + '舊版', 'heroine_01', 0)
    if iv: await go_watch(p0, cdp0, tag + '舊版', 'heroine_01', iv, 0)
    old = await p0.evaluate("(()=>({auto:localStorage.getItem('fatiao3d_auto'), flags:{NY_WATCHED:(GAME.G.flags||{}).NY_WATCHED, MOVIE_SEEN:(GAME.G.flags||{}).MOVIE_SEEN||null}, mem:JSON.stringify(((GAME.G.social||{}).mem||{}).heroine_01||'').slice(0,300)}))()")
    R.note('%s 舊版看完：%s' % (tag, J({k: v for k, v in old.items() if k != 'auto'})))
    if not R.check('%s 舊版有自動存檔' % tag, bool(old['auto']), ''): return
    await p0.close()
    await pgo.add_init_script("(v=>{ try{ if(!sessionStorage.getItem('__cc_old')){ localStorage.setItem('fatiao3d_auto', v); sessionStorage.setItem('__cc_old','1'); } }catch(e){} })(%s)" % J(old['auto']))
    await pgo.goto(URL)
    if not R.check('%s 新版載入' % tag, await L.wait_loaded(pgo), ''): return
    clicked = await pgo.evaluate("(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/繼續/.test(x.textContent)&&x.offsetParent); if(b){ b.click(); return b.textContent.trim(); } return null; })()")
    await pgo.wait_for_timeout(9000)
    st = await pgo.evaluate("(()=>({day:GAME.G.day, zone:GAME.G.zone, NY_WATCHED:(GAME.G.flags||{}).NY_WATCHED, seenRec:(()=>{ try{ return MOVIES.seenRec(GAME.G); }catch(e){ return 'ERR '+e; } })(), info:(()=>{ try{ return MOVIES.infoLines(GAME.G); }catch(e){ return 'ERR '+e; } })()}))()")
    R.note('%s 新版讀舊存檔（按 %s）：%s' % (tag, clicked, J(st)))
    od = json.loads(old['auto']); od = od.get('G', od) if isinstance(od, dict) else {}
    R.check('%s 新版讀得進舊存檔（同一天 %s）' % (tag, od.get('day')), bool(clicked) and st['day'] == od.get('day'), J(st))
    R.check('%s 舊版看過的紀錄還在（NY_WATCHED）' % tag, st['NY_WATCHED'] == (old['flags'] or {}).get('NY_WATCHED'), J([st['NY_WATCHED'], old['flags']]))
    R.check('%s MOVIES.seenRec／海報牆照常（不是 ERR）' % tag, not str(st['seenRec']).startswith('ERR') and not str(st['info']).startswith('ERR'), J(st))


KX = {'KX1': ('2024-11-15', 'm2411b'), 'KX2': ('2025-03-15', 'm2503b'), 'KX3': ('2025-05-15', 'm2505a'), 'KX4': ('2025-07-15', 'm2507b')}


async def case_kexin(pg, cdp, c):
    """BB 20:36：舊序章系所那一年約可昕看這四部（稿上沒有可昕的回答）→ 散場選完不卡住、沒有 undefined／空白對話框；記實際顯示了什麼"""
    key, film = KX[c]; tag = '[%s 可昕 %s]' % (c, film)
    await load(pg, cdp, base_state(['kexin']), day_key=key, why='日期改 %s（舊序章系所那一年，負的天數）08:00、可昕朋友＋聯絡方式（day46 存檔的其他欄位不變）' % key)
    iv = await book(pg, cdp, tag, 'kexin', 0)
    if not iv: return
    if iv['film'] != film:
        await pg.evaluate("((id,f)=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); if(v) v.film=f; })(%s,%s)" % (J(iv['id']), J(film)))
        R.setup('%s【捷徑】約好的是 %s，改成 %s' % (tag, iv['film'], film))
    ex = await expect_talk(pg, film, 'kexin'); TXT.append('==== %s 期望 %s' % (tag, J(ex)))
    want = [o['t'] for o in ((ex['talk'] or {}).get('opts') or [])]
    r = await go_watch(pg, cdp, tag, 'kexin', iv, 0, want); mt, adj = await dump(pg, tag)
    says = [e['v'] for e in mt if e['k'] == 'say']
    bad = [v for v in says if 'undefined' in v or 'null' in v or not v.split('｜', 1)[-1].strip()]
    R.note('%s 選單：%s；散場以後的對話：%s' % (tag, J(r and r['choices']), J(says[-8:])))
    R.check('%s 有散場三選項（%s）' % (tag, J(want)), bool(r) and any(c_['after'] for c_ in r['choices']), J(r and r['choices']))
    R.check('%s 選完不卡住（見面結束、回到大廳）' % tag, bool(r) and r['hall'] and r['zones'][-1] == 'xs_nanyang', J(r and r['zones']))
    R.check('%s 沒有 undefined／null／空白的對話' % tag, not bad, J(bad))
    R.check('%s walkFallbacks 0' % tag, (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def case_ps(pg, cdp, K, who='classmate_peishan', film='m2511a', nm='沛珊'):
    """r4（CC）：以安在《聖誕快遞》的 talk 沒有回答、沒有 fx（AA_745 只寫了芷若、沛珊）→ 用別人測「她的回答＋fx」三個選項（r5：芷若；沛珊不在手機朋友頁）"""
    tag = '[%s%d %s %s]' % ('ZR' if who == 'heroine_02' else 'PS', K, nm, film)
    await load(pg, cdp, base_state([who]), why='day46 08:00、沛珊朋友＋聯絡方式')
    iv = await book(pg, cdp, tag, who, 0)
    if not iv: return
    if iv['film'] != film:
        await pg.evaluate("((id,f)=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); if(v) v.film=f; })(%s,%s)" % (J(iv['id']), J(film)))
        R.setup('%s【捷徑】約好的是 %s，改成 %s' % (tag, iv['film'], film))
    ex = await expect_talk(pg, film, who); TXT.append('==== %s 期望 %s' % (tag, J(ex)))
    T = ex['talk'] or {}; want = [o['t'] for o in (T.get('opts') or [])]
    r = await go_watch(pg, cdp, tag, who, iv, K, want); mt, adj = await dump(pg, tag)
    says = [e['v'] for e in mt if e['k'] == 'say']
    aft = [c for c in (r or {}).get('choices', []) if c['after']]
    R.check('%s 散場三選項＝MOVIE_PLOTS（順序不比）' % tag, bool(aft) and sorted(aft[0]['opts'][:len(want)]) == sorted(want) and len(want) == 3, J(aft))
    if aft and T.get('opts'):
        o = T['opts'][K]; re_ = o.get('lines') or []
        R.check('%s 選第 %d 個：她的回答＝re（%s）' % (tag, K + 1, J(re_)), bool(re_) and all(any(x[:10] in s_ for s_ in says) for x in re_), J(says[-6:]))
        fx = o.get('fx') or {}; fr, lv = int(fx.get('fr') or 0), int(fx.get('love') or 0); exp = {}
        if fr: exp.update(fam=fr, trust=fr, comf=fr)
        romok = await pg.evaluate("(w=>!!(SOCIAL.romOk&&SOCIAL.romOk(w)))(%s)" % J(who))
        if lv and romok: exp['npcRom'] = lv
        n0 = aft[0].get('n') or 0; hit = [a for a in adj if a['id'] == who and a['n'] >= n0]
        R.note('%s fx（AA_745）%s；romOk %s；選了以後的 SOCIAL.adjust %s；選之前 %s' % (tag, J(fx), romok, J(hit), J(aft[0]['rel_before'])))
        R.check('%s fx 照 AA_745（%s）' % (tag, J(exp)), (not exp) or any(a['d'] == exp for a in hit), J(hit))
    R.check('%s walkFallbacks 0' % tag, (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')
    sk = await pg.evaluate("(()=>{ const p=MOVIES.billAt(GAME.G), f=p.bill.find(b=>b.id==='m2511b'); const r=MOVIES.pickAdj(p.bill,'heroine_04',f,null); return {film:r.film.id, say:r.say}; })()")
    R.note('[SKIP 補充（單元層級，不是玩家流程）] MOVIES.pickAdj(這一段, 子晴, 黑白的城市) → %s' % J(sk))


async def main():
    print('CC MOVIE_TALK（X324）：CASES %s；Playwright ≠ iPhone' % ','.join(CASES), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        if 'OLD' in CASES and TWO:
            try: await case_old(p, b, ctx, pg, cdp)
            except Exception as e: R.check('[OLD] 沒有中斷', False, repr(e)[:300])
        else:
            await pg.goto(URL)
            if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
            for c in CASES:
                try:
                    if c.startswith('TALK'): await case_talk(pg, cdp, int(c[4:]), c == 'TALK0')
                    elif c == 'AGAIN': await case_again(pg, cdp)
                    elif c in ('SOLO', 'INFO'): await case_solo(pg, cdp)
                    elif c == 'SKIP': await case_skip(pg, cdp)
                    elif c == 'WITHZQ1': await case_with(pg, cdp, 'heroine_04', '2028-01-15', 'm2801b')
                    elif c == 'WITHZQ2': await case_with(pg, cdp, 'heroine_04', '2028-05-15', 'm2805b')
                    elif c == 'WITHZR': await case_with(pg, cdp, 'heroine_02', '2025-11-01', 'm2511b')
                    elif c in KX: await case_kexin(pg, cdp, c)
                    elif c.startswith('PS'): await case_ps(pg, cdp, int(c[2:]))
                    elif c.startswith('ZR'): await case_ps(pg, cdp, int(c[2:]), 'heroine_02', os.environ.get('ZRFILM') or 'm2511a', '芷若')
                except Exception as e:
                    R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
                open(os.path.join(OUT, 'movie_talk_lines.txt'), 'w', encoding='utf-8').write('\n'.join(TXT))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'movie_talk_lines.txt'), 'w', encoding='utf-8').write('\n'.join(TXT))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
if __name__ == '__main__':   # r6：cc_mt3_probe.py 會 import 這一支的工具
    asyncio.run(main())
