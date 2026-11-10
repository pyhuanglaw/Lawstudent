"""CC（帳號 A）11-10：MT3＝MOVIE-TALK-1110 第二輪（AA_745 第二版，開發分支 0160bb208；BB 21:03 A 項 1～9）。Playwright（PC GPU）≠ iPhone。
工具沿用 cc_movie_talk_probe.py（book／go_watch／dump／expect_talk／load／base_state）。對照的程式（0160bb208 src/movies3d.js）：talkFor（稿上沒寫到她＝null＝不出選項）、
  shuffle＋seedOf(day,片,人)（同一天同一部同一人順序固定）、fxFilm（一次電影她的戀愛最多 +2，G.flags.MOVIE_LOVE）、pickAdj（kind pick／force：選到同一部也說她那幾句）、
  playWith（with.choice）、onSeated（later mode meet：下次見面，at＝library 等）。
CASES：
  ZR0／ZR1／ZR2  芷若（heroine_02）2025-11-01 約南洋（她一定挑 m2511b《黑白的城市》）→ 散場選 MOVIE_PLOTS 第 K 個選項的字：她的回答、選前選後、SOCIAL.adjust（fx；ZR2＝fr −1）；記畫面上的選項順序。
  ZRNOFX   芷若 2027-03-13（週六；03-15 週一她在 Café 上班）【捷徑：約好後片換成 m2703b】→ 選「「你要保重。」」（沒有 fx）：她的回答有、選了以後沒有 adjust。
  SHUF     （單元層級＋上面三次的畫面順序）芷若 m2511b：day 46～52 每天 MOVIES.shuffle 的順序有不一樣的；ZR0～2 同一天三次畫面順序一樣。
  NOQ      以安 2025-11-01《聖誕快遞》（稿上沒寫到她）→ 散場不出選項、直接道別，不卡、沒有空白對話。
  LOVECAP  以安 2027-09-15【捷徑：片換成 m2709b《借據》】→ talk 選 love 2 那個 → 隔天約以安總圖念書（下次見面 at library）→ with 那段選「（小聲）「也幫我印一張。」」→ 她的戀愛這部合計只 +2（MOVIE_LOVE）。
  PICK     子晴 2028-01-15 約南洋 → 答應時說「這部全片都有貓…」「另一部沒有。所以看這部。」、不能出現「我只看動作片」。
  KXCH0／KXCH1  可昕 2028-03-15【捷徑：片換成 m2803b】→ 散場 talk 選第一個 → with 那段選第 1／2 個：say 原文、fx、KX_CHOSE_DEFENSE 有沒有設（只有第 1 個設）。
  LATER    以安 2026-03-15【捷徑：片換成 m2603b】看完 → 隔天約以安咖啡（下次見面）→ 筆記本那段有演。
  SECOND   芷若 2025-11-01 09:50 看完 → 先走出戲院 → 同一天 14:00 約沛珊（m2511b 稿上沒沛珊＝不出選項；改約有她回答的芷若以外的人：照 talkFor 挑）→ 記有沒有選項；同人同一天第二次【捷徑換另一部】沒有選項。
  SKIP     （單元層級）pickAdj(子晴, m2511b／m3007b 那一段) → 換片＋lines；玩家流程：子晴 2025-11-01 約，記 choose 結果。
  KXVB     可昕 2027-05-15（m2705a）、2028-11-15（m2811a）【捷徑換片】看完：全程沒有「排球」的 with 段落（開關拿掉）；m3007a 單元層級查 with／later 沒有可昕。
全程 JS 例外 0、walkFallbacks 0；台詞原文 out/movie_talk_lines.txt。
用法：LW_TESTS=<wt>/tests CASES=... python3 cc_mt3_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_s = importlib.util.spec_from_file_location('MT', os.path.join(HERE, 'cc_movie_talk_probe.py')); M = importlib.util.module_from_spec(_s); _s.loader.exec_module(M)
L, pe, R, J, OUT, URL, TXT = M.L, M.pe, M.R, M.J, M.OUT, M.URL, M.TXT
from playwright.async_api import async_playwright
CASES = (os.environ.get('CASES') or 'ZR0,ZR1,ZR2,ZRNOFX,SHUF,NOQ,PICK,SKIP').split(',')
ORD = {}


async def setfilm(pg, iv, film, tag):
    if iv and iv['film'] != film:
        await pg.evaluate("((id,f)=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); if(v) v.film=f; })(%s,%s)" % (J(iv['id']), J(film)))
        R.setup('%s【捷徑】約好的是 %s，改成 %s' % (tag, iv['film'], film)); iv['film'] = film


async def watch_pick(pg, cdp, tag, who, iv, opt_text, extra_pick=None):
    """go_watch 的散場三選項照字選（opt_text）；with 的小選項照 extra_pick 的字選"""
    ex = await M.expect_talk(pg, iv['film'], who); TXT.append('==== %s 期望 %s' % (tag, J(ex)))
    want = [o['t'] for o in ((ex['talk'] or {}).get('opts') or [])]
    K = want.index(opt_text) if opt_text in want else 0
    # with.choice 的字：go_watch 沒有 want 的選單選第一個 → 用 extra_pick 換（monkeypatch pe.opts 的順序不好）：改成自己跑
    await pe.phone(pg, cdp, 'today')
    ok = await pe.tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id'])
    if not R.check('%s「今天」有「前往」' % tag, ok, ''): return None
    t0 = time.time(); zones = []; hall = False; chs = []; leadw = {}
    while time.time() - t0 < 720:
        q = await L.state(pg); z = await pg.evaluate("GAME.G.zone")
        if not zones or zones[-1] != z: zones.append(z)
        if z == 'xs_nanyang_hall': hall = True
        if q['choices']:
            o = await pe.opts(pg); ot = [x['t'] for x in o]
            after = bool(want) and sorted(ot[:len(want)]) == sorted(want)
            if after: k = ot.index(want[K])
            elif extra_pick and any(e in t for e in extra_pick for t in ot): k = next(i for i, t in enumerate(ot) if any(e in t for e in extra_pick))
            else: k = 0
            n = await pg.evaluate("(window.__MT||[]).length")
            chs.append({'after': after, 'opts': ot, 'pick': k, 'picked': ot[k], 'n': n, 'rel_before': await pg.evaluate("(%s)(%s)" % (M.REL, J(who)))})
            await pe.choose(pg, cdp, o[k]['t'], True); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        st = await pg.evaluate("((id)=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v&&v.state; })(%s)" % J(iv['id']))
        if st in ('done', 'over') and not q['busy'] and (hall or iv.get('nohall')): break
        # 約念書總圖（sitAt.lead）：她帶路坐下（lead.ph 'wait'）→ 玩家要走到她的位子 2 m 內才開演（INV-SIT-TOGETHER-1104）；像玩家一樣點地板走過去（MT3 r1 LOVECAP 沒走＝TEST_BUG）
        ld = await pg.evaluate("((id)=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v&&v.lead&&v.state==='accepted'?{ph:v.lead.ph,her:v.lead.her}:null; })(%s)" % J(iv['id']))
        if ld and ld['ph'] == 'wait' and ld.get('her') and not q['busy'] and not leadw.get(ld['her']['x']):
            leadw[ld['her']['x']] = 1; hx, hz, hl = ld['her']['x'], ld['her']['z'], ld['her'].get('lv', 0)
            R.note('%s 她帶路坐下了（%.1f,%.1f lv%s）→ 點地板走到她旁邊' % (tag, hx, hz, hl))
            ok = await L.go_to(pg, cdp, R, hx, hz, 1.6, '走到%s的位子旁邊' % who, max_s=240, lv=hl)
            R.note('%s 走到她旁邊：%s' % (tag, ok)); continue
        await pg.wait_for_timeout(450)
    return {'zones': zones, 'hall': hall, 'choices': chs, 'want': want, 'K': K, 'ex': ex}


def fxexp(fx, romok):
    fx = fx or {}; fr, lv = int(fx.get('fr') or 0), int(fx.get('love') or 0); e = {}
    if fr: e.update(fam=fr, trust=fr, comf=fr)
    if lv and romok: e['npcRom'] = lv
    return e


async def case_zr(pg, cdp, K, day_key='2025-11-01', film='m2511b', opt=None, tag=None):
    who = 'heroine_02'; tag = tag or '[ZR%d]' % K
    await M.load(pg, cdp, M.base_state([who]), day_key=day_key, why='%s 08:00、芷若朋友＋聯絡方式' % day_key)
    iv = await M.book(pg, cdp, tag, who, 0)
    if not iv: return None
    await setfilm(pg, iv, film, tag)
    ex0 = await M.expect_talk(pg, film, who); want = [o['t'] for o in ((ex0['talk'] or {}).get('opts') or [])]
    ot = opt if opt is not None else (want[K] if K < len(want) else None)
    r = await watch_pick(pg, cdp, tag, who, iv, ot); mt, adj = await M.dump(pg, tag)
    if not r: return None
    says = [e['v'] for e in mt if e['k'] == 'say']
    aft = [c for c in r['choices'] if c['after']]
    R.note('%s 選單 %s' % (tag, J(r['choices'])))
    if not R.check('%s 散場三選項（字＝MOVIE_PLOTS，順序不比）' % tag, bool(aft), J(r['choices'])): return r
    ORD.setdefault((day_key, film), []).append(aft[0]['opts'][:3])
    o = next((x for x in (r['ex']['talk'] or {}).get('opts', []) if x['t'] == ot), None) or {}
    re_ = o.get('lines') or []
    R.check('%s 選「%s」：她的回答＝re（%s）' % (tag, ot, J(re_)), all(any(x.replace('{name}', '')[:10] in s for s in says) for x in re_) and bool(re_), J(says[-6:]))
    romok = await pg.evaluate("(w=>!!(SOCIAL.romOk&&SOCIAL.romOk(w)))(%s)" % J(who))
    exp = fxexp(o.get('fx'), romok); n0 = aft[0]['n']; hit = [a for a in adj if a['id'] == who and a['n'] >= n0]
    after_rel = await pg.evaluate("(%s)(%s)" % (M.REL, J(who)))
    R.note('%s fx（AA_745）%s；romOk %s；選了以後的 adjust %s；選之前 %s；最後 %s' % (tag, J(o.get('fx')), romok, J(hit), J(aft[0]['rel_before']), J(after_rel)))
    if exp: R.check('%s fx 照 AA_745（%s）' % (tag, J(exp)), any(all(a['d'].get(k) == v for k, v in exp.items()) for a in hit), J(hit))
    else: R.check('%s 這個選項沒有 fx：選了以後沒有 talk 的 adjust（只可能有見面本身的）' % tag, not any(set(a['d']) <= {'fam', 'trust', 'comf', 'npcRom'} and a['d'] and len(set(a['d'].values())) == 1 and set(a['d']) >= {'fam', 'trust', 'comf'} for a in hit), J(hit))
    return r


async def case_noq(pg, cdp):
    tag = '[NOQ 以安 聖誕快遞]'
    await M.load(pg, cdp, M.base_state(['heroine_01']), why='day46 08:00、以安朋友')
    iv = await M.book(pg, cdp, tag, 'heroine_01', 0)
    if not iv: return
    await setfilm(pg, iv, 'm2511a', tag)
    tf = await pg.evaluate("(()=>MOVIES.talkFor(GAME.G,'heroine_01','m2511a'))()")
    R.note('%s MOVIES.talkFor＝%s（null＝稿上沒寫到她＝不問）' % (tag, J(tf)))
    raw = await pg.evaluate("(()=>((MOVIE_PLOTS.films.m2511a.talk||{}).opts||[]).map(o=>o.t))()")
    r = await watch_pick(pg, cdp, tag, 'heroine_01', iv, None); mt, adj = await M.dump(pg, tag)
    bad = [e['v'] for e in mt if e['k'] == 'say' and (not e['v'].split('｜', 1)[-1].strip() or 'undefined' in e['v'])]
    talkish = [c for c in (r or {}).get('choices', []) if sorted(c['opts'][:3]) == sorted(raw)]
    R.check('%s 散場不出三選項（稿上的三句都沒出現在選單）' % tag, bool(r) and not talkish and tf is None, J({'talkFor': tf, 'choices': r and r['choices']}))
    R.check('%s 看完回到大廳、沒有空白／undefined' % tag, bool(r) and r['zones'][-1] == 'xs_nanyang' and not bad, J({'zones': r and r['zones'], 'bad': bad}))


async def book_place(pg, cdp, tag, who, cat, place, slot=0):
    await pe.phone(pg, cdp, 'friends')
    if not await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who): R.check('%s 手機朋友頁有 %s' % (tag, who), False, ''); return None
    await pg.wait_for_timeout(1500)
    if not await pe.choose(pg, cdp, cat, True): R.check('%s 有「%s」' % (tag, cat), False, J(await pe.opts(pg))); return None
    o = await pe.opts(pg); pc = next((x for x in o if place in x['t'] and not x['dim']), None)
    if not R.check('%s 選得到 %s' % (tag, place), bool(pc), J(o)): await pe.close_phone(pg, cdp); return None
    await pe.choose(pg, cdp, pc['t'], True); o = await pe.opts(pg)
    ts = [x for x in o if (x['t'].startswith('今天') or x['t'].startswith('明天')) and not x['dim']]
    if not R.check('%s 有能選的時間' % tag, len(ts) > slot, J(o)): await pe.close_phone(pg, cdp); return None
    await pe.choose(pg, cdp, ts[slot]['t'], True); await pe.settle(pg, cdp, [], 30)
    iv = await pg.evaluate("(w=>{ const L=(GAME.G.invites||[]).filter(v=>v.who===w&&v.state==='accepted'); const v=L[L.length-1]; return v?{id:v.id,h:v.h,day:v.day,place:v.place,film:v.film||null}:null; })(%s)" % J(who))
    R.note('%s 約好：%s' % (tag, J(iv))); R.check('%s 約成了' % tag, bool(iv), ''); return iv


async def next_day(pg, cdp, tag, h=8.0):
    """【捷徑】存檔快照、天數＋1、時間 h 讀回來（下次見面要隔天以後）"""
    st = await pg.evaluate("GAME.snapshot()"); G = st.get('G', st) if isinstance(st, dict) else st
    tgt = G if isinstance(G, dict) and 'day' in G else st
    tgt['day'] = tgt['day'] + 1; tgt['hour'] = h; tgt['zone'] = 'dorm'; tgt['pos'] = None
    try: tgt['weekday'] = await pg.evaluate("(d=>CALENDAR.dateOf(d).wd%%7)(%d)" % tgt['day'])
    except Exception: pass
    await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(3500); await pe.settle(pg, cdp, [], 30)
    R.setup('%s【捷徑】存檔快照 → 隔天 %02d:00 宿舍讀回來（MOVIE_LATER、MOVIE_LOVE 照舊）' % (tag, h))


async def case_lovecap(pg, cdp):
    tag = '[LOVECAP 以安 借據]'; who = 'heroine_01'
    await M.load(pg, cdp, M.base_state([who]), day_key='2027-09-15', why='2027-09-15 08:00、以安朋友')
    iv = await M.book(pg, cdp, tag, who, 0)
    if not iv: return
    await setfilm(pg, iv, 'm2709b', tag)
    r = await watch_pick(pg, cdp, tag, who, iv, '寫「免還」算不算債務免除？'); mt, adj = await M.dump(pg, tag)
    ml = await pg.evaluate("(()=>({love:((GAME.G.flags||{}).MOVIE_LOVE||{}).heroine_01||null, later:(GAME.G.flags||{}).MOVIE_LATER||null, rom:(SOCIAL.rel('heroine_01')||{}).npcRom}))()")
    R.note('%s talk 以後：%s；選單 %s' % (tag, J(ml), J(r and r['choices'])))
    R.check('%s talk 選 love 2 的：MOVIE_LOVE.m2709b＝2' % tag, ((ml['love'] or {}).get('m2709b')) == 2, J(ml))
    R.check('%s 下次見面排了（MOVIE_LATER 有 m2709b）' % tag, any(q.get('f') == 'm2709b' for q in (ml['later'] or [])), J(ml))
    rom0 = ml['rom']
    await next_day(pg, cdp, tag)
    iv2 = await book_place(pg, cdp, tag + '隔天', who, '念書', '總圖')
    if not iv2: return
    iv2['nohall'] = True
    r2 = await watch_pick(pg, cdp, tag + '隔天總圖', who, iv2, None, ['也幫我印一張']); mt2, adj2 = await M.dump(pg, tag + '隔天總圖')
    says = [e['v'] for e in mt2 if e['k'] == 'say']
    ml2 = await pg.evaluate("(()=>({love:((GAME.G.flags||{}).MOVIE_LOVE||{}).heroine_01||null, rom:(SOCIAL.rel('heroine_01')||{}).npcRom, flag:(GAME.G.flags||{}).AN_BIRTHDAY_PAPER}))()")
    R.note('%s 隔天總圖：選單 %s；之後 %s；npcRom %s → %s' % (tag, J(r2 and r2['choices']), J(ml2), rom0, ml2['rom']))
    R.check('%s 下次見面（總圖）演了微捲機那段' % tag, any('微捲機' in s for s in says), J(says[-8:]))
    # r2（MOVIE_LATER 那段是在 go_to 走到她旁邊的途中演的，選單由 playlib 點掉、不在 r2['choices']）：照 __MT 找那一個選單的位置，只看它到下一個選單之間的 adjust
    ci = [i for i, e in enumerate(mt2) if e['k'] == 'choose' and '也幫我印一張' in str(e['v'])]
    nxt = [i for i, e in enumerate(mt2) if e['k'] == 'choose' and ci and i > ci[-1]]
    lo, hi = (ci[-1], nxt[0] if nxt else 10 ** 9) if ci else (None, None)
    said = ci and any('你哪一天' in str(e['v']) for e in mt2[ci[-1]:ci[-1] + 4])
    win = [a for a in adj2 if a['id'] == who and lo is not None and lo <= a['n'] < hi]
    R.note('%s 「也幫我印一張」選單在 __MT %s、下一個選單 %s；中間的 adjust %s（之後的是見面本身／故事線的）' % (tag, lo, hi, J(win)))
    R.check('%s 選了「也幫我印一張。」→ 她說「你哪一天？」' % tag, bool(said), J([e['v'] for e in mt2[lo:lo + 4]] if lo is not None else []))
    R.check('%s AN_BIRTHDAY_PAPER 有設' % tag, ml2.get('flag') is not None, J(ml2))
    R.check('%s 這部合計不超過 +2：MOVIE_LOVE.m2709b 仍 2、選了以後到下一個選單之間沒有加 npcRom' % tag, lo is not None and ((ml2['love'] or {}).get('m2709b')) == 2 and not any((a['d'].get('npcRom') or 0) > 0 for a in win), J({'ml2': ml2, 'win': win}))


async def case_pick(pg, cdp):
    tag = '[PICK 子晴 貓咪咖啡館]'
    await M.load(pg, cdp, M.base_state(['heroine_04']), day_key='2028-01-15', why='2028-01-15 08:00、子晴朋友＋聯絡方式')
    iv = await M.book(pg, cdp, tag, 'heroine_04', 0); mt, _ = await M.dump(pg, tag)
    says = [e['v'] for e in mt if e['k'] == 'say']
    R.check('%s 約好的是 m2801b' % tag, bool(iv) and iv['film'] == 'm2801b', J(iv))
    R.check('%s 答應時說「這部全片都有貓…」「另一部沒有。所以看這部。」' % tag, any('全片都有貓' in s for s in says) and any('另一部沒有' in s for s in says), J(says))
    R.check('%s 沒有出現「我只看動作片」' % tag, not any('只看動作片' in s for s in says), J(says))


async def case_kxch(pg, cdp, k):
    tag = '[KXCH%d 可昕 m2803b]' % k; who = 'kexin'
    await M.load(pg, cdp, M.base_state([who]), day_key='2028-03-15', why='2028-03-15 08:00、可昕朋友＋聯絡方式')
    iv = await M.book(pg, cdp, tag, who, 0)
    if not iv: return
    await setfilm(pg, iv, 'm2803b', tag)
    W = await pg.evaluate("(()=>MOVIES.withOf('m2803b','kexin'))()")
    ch = (W or {}).get('choice') or []
    if not R.check('%s with.choice 有兩個' % tag, len(ch) == 2, J(W)): return
    want_t = ch[k]['t'].strip('「」')
    ex0 = await M.expect_talk(pg, 'm2803b', who); want = [o['t'] for o in ((ex0['talk'] or {}).get('opts') or [])]
    r = await watch_pick(pg, cdp, tag, who, iv, want[0] if want else None, [want_t]); mt, adj = await M.dump(pg, tag)
    says = [e['v'] for e in mt if e['k'] == 'say']
    fl = await pg.evaluate("(GAME.G.flags||{}).KX_CHOSE_DEFENSE")
    picked = [c for c in (r or {}).get('choices', []) if any(want_t in t for t in c['opts'])]
    hit = [a for a in adj if a['id'] == who and picked and a['n'] >= picked[0]['n']]
    R.note('%s with 選「%s」：say %s；之後的 adjust %s；KX_CHOSE_DEFENSE＝%s' % (tag, ch[k]['t'], J(ch[k].get('say')), J(hit), fl))
    R.check('%s with 那段演了、選得到「%s」' % (tag, ch[k]['t']), bool(picked) and all(any(x[:8] in s for s in says) for x in (W.get('lines') or [])), J(says[-10:]))
    R.check('%s 選了以後她說的＝say' % tag, all(any(x[:8] in s for s in says) for x in (ch[k].get('say') or [])), J(says[-6:]))
    R.check('%s KX_CHOSE_DEFENSE %s' % (tag, '有設' if k == 0 else '沒有設'), (fl is not None) == (k == 0), J(fl))


async def case_later(pg, cdp):
    tag = '[LATER 以安 m2603b]'; who = 'heroine_01'
    await M.load(pg, cdp, M.base_state([who]), day_key='2026-03-15', why='2026-03-15 08:00、以安朋友')
    iv = await M.book(pg, cdp, tag, who, 0)
    if not iv: return
    await setfilm(pg, iv, 'm2603b', tag)
    r = await watch_pick(pg, cdp, tag, who, iv, None); await M.dump(pg, tag)
    lt = await pg.evaluate("(GAME.G.flags||{}).MOVIE_LATER||null"); R.note('%s 看完 MOVIE_LATER＝%s' % (tag, J(lt)))
    await next_day(pg, cdp, tag)
    iv2 = await book_place(pg, cdp, tag + '隔天', who, '喝咖啡', '2:30 AM')
    if not iv2: return
    iv2['nohall'] = True
    r2 = await watch_pick(pg, cdp, tag + '隔天咖啡', who, iv2, None); mt2, _ = await M.dump(pg, tag + '隔天咖啡')
    says = [e['v'] for e in mt2 if e['k'] == 'say']
    R.check('%s 下次見面演了筆記本那段（「看到他簽名」）' % tag, any('筆記本' in s or '看到他簽名' in s for s in says), J(says[-10:]))


async def case_second(pg, cdp):
    tag = '[SECOND]'
    await M.load(pg, cdp, M.base_state(['heroine_02', 'heroine_01']), why='day46 08:00、芷若、以安朋友')
    iv = await M.book(pg, cdp, tag + '芷若', 'heroine_02', 0)
    if not iv: return
    await watch_pick(pg, cdp, tag + '芷若', 'heroine_02', iv, None); await M.dump(pg, tag + '芷若')
    # 同一天第二個人：以安《聖誕快遞》沒有她的 talk → 改看 m2511b（也沒有她）→ 這一段只有芷若、沛珊有 talk；記遊戲行為就好
    iv2 = await M.book(pg, cdp, tag + '以安', 'heroine_01', 0)
    if not iv2: return
    tf = await pg.evaluate("((f)=>MOVIES.talkFor(GAME.G,'heroine_01',f))(%s)" % J(iv2['film']))
    r2 = await M.go_watch(pg, cdp, tag + '以安', 'heroine_01', iv2, 0, [o['t'] for o in ((tf or {}).get('opts') or [])]); await M.dump(pg, tag + '以安')
    R.note('%s 同一天第二個人（以安 %s）：talkFor %s；選單 %s' % (tag, iv2['film'], J(tf), J(r2 and r2['choices'])))
    R.check('%s 同一天第二個人：照 talkFor（有＝出選項、沒有＝不出），流程走完' % tag, bool(r2) and (bool(tf) == any(c['after'] for c in r2['choices'])), J(r2 and r2['choices']))
    iv3 = await M.book(pg, cdp, tag + '芷若再一次', 'heroine_02', 0)
    if not iv3: return
    other = 'm2511a' if iv['film'] != 'm2511a' else 'm2511b'; await setfilm(pg, iv3, other, tag + '芷若再一次')
    tf3 = await pg.evaluate("((f)=>MOVIES.talkFor(GAME.G,'heroine_02',f))(%s)" % J(other))
    r3 = await M.go_watch(pg, cdp, tag + '芷若再一次', 'heroine_02', iv3, 0, [o['t'] for o in ((tf3 or {}).get('opts') or [])]); await M.dump(pg, tag + '芷若再一次')
    R.check('%s 同一人同一天第二次（另一部 %s）：沒有散場三選項（一天一人一次）' % (tag, other), bool(r3) and not any(c['after'] for c in r3['choices']), J(r3 and r3['choices']))


async def case_skip(pg, cdp):
    tag = '[SKIP]'
    await M.load(pg, cdp, M.base_state(['heroine_04']), why='day46 08:00、子晴朋友')
    u = await pg.evaluate("""(()=>{ const out={}; for(const [key,film] of [['2025-11-15','m2511b'],['2030-07-15','m3007b']]){ const d=STORY.dayOfKey(key), p=MOVIES.billAt(GAME.G,d), f=p.bill.find(b=>b.id===film); const r=MOVIES.pickAdj(p.bill,'heroine_04',f,null); out[film]={bill:p.bill.map(b=>b.id), to:r.film.id, say:r.say}; } return out; })()""")
    R.note('%s 單元層級 MOVIES.pickAdj(子晴)：%s' % (tag, J(u)))
    for film, x in u.items():
        R.check('%s（單元層級）選到 %s → 換成同一段另一部、她說 skip 的句子' % (tag, film), x['to'] != film and bool(x['say']), J(x))
    c = await pg.evaluate("(()=>MOVIES.choose(GAME.G,'heroine_04'))()")
    R.note('%s 玩家流程那天（2025-11-01）MOVIES.choose(子晴)＝%s（沒挑到 m2511b＝玩家流程測不到換片）' % (tag, J(c)))


async def case_kxvb(pg, cdp):
    for key, film in (('2027-05-15', 'm2705a'), ('2028-11-15', 'm2811a')):
        tag = '[KXVB 可昕 %s]' % film
        await M.load(pg, cdp, M.base_state(['kexin']), day_key=key, why='%s 08:00、可昕朋友' % key)
        iv = await M.book(pg, cdp, tag, 'kexin', 0)
        if not iv: continue
        await setfilm(pg, iv, film, tag)
        r = await watch_pick(pg, cdp, tag, 'kexin', iv, None); mt, _ = await M.dump(pg, tag)
        vb = [e['v'] for e in mt if '排球' in e['v']]
        R.note('%s 選單 %s' % (tag, J(r and r['choices'])))
        R.check('%s 全程沒有「排球」的段落' % tag, not vb, J(vb))
    u = await pg.evaluate("(()=>({with:(MOVIE_PLOTS.films.m3007a.with||{}).kexin||null, later:Object.keys(MOVIE_PLOTS.later||{}).filter(k=>/m(2705a|2811a|3007a):kexin/.test(k)), need:Object.keys(MOVIE_PLOTS.need||{}).filter(k=>/排球|VOLLEY/.test(k))}))()")
    R.check('[KXVB] 單元層級：m3007a 沒有可昕的 with、三部沒有可昕的 later、need 沒有排球開關', not u['with'] and not u['later'] and not u['need'], J(u))


MARKS = r"""(()=>{ if(GAME.__arcMk) return; GAME.__arcMk=1; const P=v=>{ try{ (window.__MT=window.__MT||[]).push({k:'mark', v, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}); }catch(e){} };
  const W=(o,nm,tag)=>{ if(!o||typeof o[nm]!=='function') return; const f=o[nm]; o[nm]=function(){ P(tag+' 開始'); const r=f.apply(this,arguments); Promise.resolve(r).then(()=>P(tag+' 結束'),()=>P(tag+' 出錯')); return r; }; };
  if(typeof ARCS!=='undefined'){ W(ARCS,'run','ARCS.run'); W(ARCS,'rotRun','ARCS.rotRun'); }
  if(typeof STUDYN!=='undefined') W(STUDYN,'mid','STUDYN.mid');
  if(typeof MOVIES!=='undefined'){ W(MOVIES,'playMid','MOVIES.playMid'); W(MOVIES,'talk','MOVIES.talk'); W(MOVIES,'after','MOVIES.after'); W(MOVIES,'leaveHall','MOVIES.leaveHall'); W(MOVIES,'enterHall','MOVIES.enterHall'); W(MOVIES,'playWith','MOVIES.playWith'); } })()"""


async def case_arcafter(pg, cdp, who, day_key, film, axdone, tag):
    """MOVIE-ARC-AFTER-1110（BB 21:38；LAWWW 給 SHA 後跑）：故事線那一拍移到散場後。
    要看：放映中（進 1 廳到 leaveHall 之間）沒有要選的東西；看到一半演片子的那一幕（MOVIES.playMid）；散場 talk（MOVIES.talk）之後才演故事線（ARCS.run／rotRun／STUDYN.mid）。
    【前置／捷徑】讀檔到 day_key 08:00、她朋友＋聯絡方式；約好後片換成 film；axdone＝把 G.flags.ACTN.movie[她] 設成三場都演完（之後是輪換）。"""
    await M.load(pg, cdp, M.base_state([who]), day_key=day_key, why='%s 08:00、%s 朋友＋聯絡方式' % (day_key, who))
    await pg.evaluate(MARKS)
    if axdone:
        r = await pg.evaluate("(w=>{ const K=STUDYN.act('movie'), r=K.of(GAME.G,w), n=K.size?K.size(w):3; r.n=n; r.k=n+1; r.last=null; return {n, rec:r}; })(%s)" % J(who))
        R.setup('%s【捷徑】電影第 N 場三場都演完：G.flags.ACTN.movie.%s＝%s' % (tag, who, J(r)))
    iv = await M.book(pg, cdp, tag, who, 0)
    if not iv: return
    await setfilm(pg, iv, film, tag)
    pv = await pg.evaluate("(w=>{ let a=null, ax=null; try{ a=ARCS.pick(GAME.G,w,{kind:'movie'}); }catch(e){ a=String(e); } try{ ax=STUDYN.act('movie').pick(GAME.G,w); }catch(e){ ax=String(e); } return {arc:a&&(a.id||a.k||a), ax:ax&&(ax.k!=null?ax.k:(ax.generic?'generic':ax))}; })(%s)" % J(who))
    R.note('%s 預覽：ARCS.pick＝%s；STUDYN movie pick＝%s' % (tag, J(pv['arc']), J(pv['ax'])))
    r = await watch_pick(pg, cdp, tag, who, iv, None); mt, adj = await M.dump(pg, tag)
    if not r: return
    idx = lambda pred: next((i for i, e in enumerate(mt) if pred(e)), None)
    i_in = idx(lambda e: e['k'] == 'mark' and e['v'] == 'MOVIES.enterHall 開始')
    i_out = idx(lambda e: e['k'] == 'mark' and e['v'] == 'MOVIES.leaveHall 開始')
    i_mid = idx(lambda e: e['k'] == 'mark' and e['v'] == 'MOVIES.playMid 開始')
    i_talk = idx(lambda e: e['k'] == 'mark' and e['v'] == 'MOVIES.talk 開始')
    i_talk_end = idx(lambda e: e['k'] == 'mark' and e['v'] == 'MOVIES.talk 結束')
    arcs = [i for i, e in enumerate(mt) if e['k'] == 'mark' and e['v'].endswith('開始') and e['v'].split(' ')[0] in ('ARCS.run', 'ARCS.rotRun', 'STUDYN.mid')]
    marks = [(i, e['v'], e['z'], e['h']) for i, e in enumerate(mt) if e['k'] == 'mark']
    R.note('%s 標記順序：%s' % (tag, J(marks)))
    in_show = [e for e in mt[(i_in or 0):(i_out if i_out is not None else len(mt))] if e['k'] == 'choose'] if i_in is not None else None
    mid_lines = [e['v'] for e in mt[i_mid:i_mid + 6] if e['k'] == 'say'] if i_mid is not None else []
    R.note('%s 看到一半那幾句：%s' % (tag, J(mid_lines)))
    R.check('%s 放映中（進 1 廳到散場）沒有要選的東西' % tag, in_show is not None and not in_show, J({'in': i_in, 'out': i_out, 'choose': in_show}))
    R.check('%s 看到一半演了片子的那一幕（MOVIES.playMid）' % tag, i_mid is not None and (i_out is None or i_mid < i_out), J({'mid': i_mid, 'lines': mid_lines}))
    R.check('%s 故事線那一拍（ARCS.run／rotRun／STUDYN.mid）在散場 talk 之後' % tag, bool(arcs) and i_talk is not None and all(a > i_talk for a in arcs), J({'talk': i_talk, 'talk_end': i_talk_end, 'arcs': arcs}))
    # MT4（BB 21:53）A1：放映中她不講自己的事（她說出口的句子＝「名字｜」開頭、不是整句括號）；A3：走出 1 廳以後 talk → with.after → 最多一拍故事線 → 道別
    nm = await pg.evaluate("(w=>(CHARACTERS[w]||{}).name||'')(%s)" % J(who))
    # r2：「放映中」從燈暗那一句（「（燈暗下來，…」）起算——坐下、燈暗前她說的那一句不算（MT4 r1 TEST_BUG：「電影院的規則，我都會遵守。」在燈暗前）
    i_dark = next((i for i, e in enumerate(mt) if e['k'] == 'say' and '燈暗' in e['v'] and i_in is not None and i > i_in), None)
    talk_in = [e['v'] for e in (mt[i_dark:i_out] if i_dark is not None and i_out is not None else []) if e['k'] == 'say' and e['v'].startswith(nm) and not e['v'].split('｜', 1)[-1].startswith('（')]
    R.note('%s 燈暗那一句 __MT %s：%s' % (tag, i_dark, J(mt[i_dark]['v'] if i_dark is not None else None)))
    R.check('%s 放映中（燈暗到散場）她沒有講自己的事（沒有她說出口的句子）' % tag, i_dark is not None and not talk_in, J(talk_in))
    i_with = [i for i, e in enumerate(mt) if e['k'] == 'mark' and e['v'] == 'MOVIES.playWith 開始' and (i_out is None or i > i_out)]
    seq = [(i, e['v'], e['z']) for i, e in enumerate(mt) if e['k'] == 'mark' and i_out is not None and i > i_out]
    R.note('%s 散場以後的順序（含區域）：%s' % (tag, J(seq)))
    R.check('%s 散場以後：talk → with.after（有的話）→ 故事線最多一拍' % tag, i_talk is not None and all(w_ > i_talk for w_ in i_with) and len(arcs) <= 1 and all(a > max(i_with + [i_talk]) for a in arcs), J({'talk': i_talk, 'with': i_with, 'arcs': arcs}))


async def case_fb(pg, cdp, who, day_key, film, opt_text, kind, tag, second=None):
    """MT4 B：她沒有專屬回答的人×片×選項 → 回話＝MOVIE_PLOTS.fallback[她][kind] 的下一句；效果＝選項自己的 fx，沒有才用那一句的 fx；MOVIE_FB 加一。
    second＝(film2, opt2, day_key2 用隔天)：同一 kind 第二次 → 輪到下一句。【前置／捷徑】讀檔到 day_key、她朋友＋聯絡方式；約好後片換成 film。"""
    await M.load(pg, cdp, M.base_state([who]), day_key=day_key, why='%s 08:00、%s 朋友＋聯絡方式' % (day_key, who))
    await pg.evaluate(MARKS)
    rounds = [(film, opt_text)] + ([second] if second else [])
    got = []
    for ri, (f, ot) in enumerate(rounds):
        t2 = tag + ('' if ri == 0 else ' 第二次')
        if ri: await next_day(pg, cdp, t2)
        iv = await M.book(pg, cdp, t2, who, 0)
        if not iv: return
        await setfilm(pg, iv, f, t2)
        ex = await M.expect_talk(pg, f, who); T = ex['talk'] or {}
        o = next((x for x in T.get('opts') or [] if x['t'] == ot), None)
        fb_all = await pg.evaluate("((w,k)=>((MOVIE_PLOTS.fallback||{})[w]||{})[k]||null)(%s,%s)" % (J(who), J(kind)))
        n0 = await pg.evaluate("((w,k)=>MOVIES.fbN?MOVIES.fbN(GAME.G,w,k):null)(%s,%s)" % (J(who), J(kind)))
        R.note('%s talkFor：%s；fallback[%s]＝%s；MOVIE_FB 之前 %s' % (t2, J(T), kind, J(fb_all), n0))
        if not R.check('%s 選項「%s」走 fallback（kind %s）' % (t2, ot, kind), bool(o) and o.get('fb') == kind, J(o)): return
        fb_re = [x.get('re') for x in (fb_all or [])]
        er = fb_re[(n0 or 0) % len(fb_re)] if fb_re else None; el = [x for x in ([er] if isinstance(er, str) else (er or [])) if isinstance(x, str) and x.strip()]
        R.check('%s 預期的回答是她 %s 的第 %d 句' % (t2, kind, (n0 or 0) + 1), bool(el) and o['lines'] == el, J({'lines': o['lines'], 'fb': fb_re}))
        r = await watch_pick(pg, cdp, t2, who, iv, ot); mt, adj = await M.dump(pg, t2)
        if not r: return
        says = [e['v'] for e in mt if e['k'] == 'say']
        R.check('%s 選了以後她回 fallback 那一句' % t2, all(any(x[:10] in s_ for s_ in says) for x in o['lines']), J(says[-6:]))
        aft = [c for c in r['choices'] if c['after']]
        romok = await pg.evaluate("(w=>!!(SOCIAL.romOk&&SOCIAL.romOk(w)))(%s)" % J(who))
        exp = fxexp(o.get('fx'), romok); n_ = aft[0]['n'] if aft else 10 ** 9
        nxt = [i for i, e in enumerate(mt) if e['k'] == 'choose' and i > n_]; hi = nxt[0] if nxt else 10 ** 9
        hit = [a for a in adj if a['id'] == who and n_ <= a['n'] < hi]
        R.note('%s fx（選項自己的優先，沒有才用 fallback 那一句）＝%s；romOk %s；選了以後到下一個選單之間的 adjust %s' % (t2, J(o.get('fx')), romok, J(hit)))
        if exp: R.check('%s 效果＝%s' % (t2, J(exp)), any(all(a['d'].get(k) == v for k, v in exp.items()) for a in hit), J(hit))
        else: R.check('%s 這一句沒有效果：選了以後沒有 adjust' % t2, not hit, J(hit))
        n1 = await pg.evaluate("((w,k)=>MOVIES.fbN?MOVIES.fbN(GAME.G,w,k):null)(%s,%s)" % (J(who), J(kind)))
        R.check('%s MOVIE_FB.%s.%s %s → %s（加一）' % (t2, who, kind, n0, n1), n1 == (n0 or 0) + 1, J(await pg.evaluate("(GAME.G.flags||{}).MOVIE_FB||null")))
        got.append(o['lines'])
    if second: R.check('%s 同一 kind 第二次輪到下一句（兩次的回答不一樣）' % tag, len(got) == 2 and got[0] != got[1], J(got))


async def case_other(pg, cdp, who, day_key, film, tag, mode):
    """MT4 C／D：qOther（問句換成給其他人的）、optsOther（三個選項整組換）、noask（ask 選項不出）、nofb（整段不出）
    day_key 可以是清單：一天一天試，手機朋友頁有她（約得到）的第一天就用（r2：以安 2029-07-14 朋友頁沒有她）"""
    days = day_key if isinstance(day_key, (list, tuple)) else [day_key]
    for k_, dk in enumerate(days):
        await M.load(pg, cdp, M.base_state([who]), day_key=dk, why='%s 08:00、%s 朋友＋聯絡方式' % (dk, who))
        if k_ == len(days) - 1: break
        # r3：除了朋友頁有她，還要她的選單有「看電影、逛書店」、而且讀檔後時間沒有被劇情推過 09:50（2030-07-13 讀進來變成 27:00；2029-07-21 有她但沒有看電影）
        hr_ = await pg.evaluate("+GAME.G.hour"); await pe.phone(pg, cdp, 'friends')
        ok_ = await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who); o_ = []
        if ok_: await pg.wait_for_timeout(1500); o_ = [x['t'] for x in await pe.opts(pg)]
        mv_ = any('看電影' in t for t in o_)
        await pe.close_phone(pg, cdp); await pe.settle(pg, cdp, [], 10)
        R.note('%s %s：時間 %.2f、朋友頁有 %s：%s、選單 %s' % (tag, dk, hr_, who, ok_, J(o_)))
        if ok_ and mv_ and hr_ < 9.5: break
    iv = await M.book(pg, cdp, tag, who, 0)
    if not iv: return
    await setfilm(pg, iv, film, tag)
    ex = await M.expect_talk(pg, film, who); T = ex['talk']
    raw = await pg.evaluate("(id=>{ const t=(MOVIE_PLOTS.films[id]||{}).talk||{}; return {q:t.q||null, qOther:t.qOther||null, opts:(t.opts||[]).map(o=>o.t), other:((t.optsOther||{}).opts||[]).map(o=>o.t), nofb:!!t.nofb}; })(%s)" % J(film))
    R.note('%s talkFor＝%s；稿＝%s' % (tag, J(T), J(raw)))
    r = await watch_pick(pg, cdp, tag, who, iv, None); mt, adj = await M.dump(pg, tag)
    if not r: return
    says = [e['v'] for e in mt if e['k'] == 'say']; menus = [c['opts'] for c in r['choices']]
    R.note('%s 選單 %s' % (tag, J(menus)))
    if mode == 'qother':
        R.check('%s 問句是 qOther「%s」' % (tag, raw['qOther']), bool(T) and T.get('qOther') and any(raw['qOther'][-8:] in s_ for s_ in says), J(says[-8:]))
        R.check('%s 沒有出現原本的問句（「%s」）' % (tag, (raw['q'] or '')[:14]), not any((raw['q'] or 'XXXX')[:10] in s_ for s_ in says), J(says[-8:]))
    if mode == 'optsother':
        aft = [m_ for m_ in menus if sorted(m_) == sorted(raw['other'])]
        R.check('%s 散場三選項＝optsOther 那一組（%s）' % (tag, J(raw['other'])), bool(aft), J(menus))
        R.check('%s 原本那一組（%s）沒有出現' % (tag, J(raw['opts'])), not any(any(t in m_ for t in raw['opts']) for m_ in menus), J(menus))
    if mode == 'noask':
        aft = [m_ for m_ in menus if any(t in m_ for t in raw['opts'])]
        R.check('%s 散場選單剩兩個、沒有「（把面紙遞過去。）」' % tag, len(aft) == 1 and len(aft[0]) == 2 and '（把面紙遞過去。）' not in aft[0], J(menus))
    if mode == 'nofb':
        bad = [s_ for s_ in says if not s_.split('｜', 1)[-1].strip() or 'undefined' in s_]
        R.check('%s talkFor null、整段不出（沒有問句「%s」、沒有選單、沒有空白）' % (tag, (raw['q'] or '')[:12]), T is None and not any((raw['q'] or 'XXXX')[3:12] in s_ for s_ in says) and not any(any(t in m_ for t in raw['opts']) for m_ in menus) and not bad, J({'T': T, 'says': says[-6:], 'menus': menus, 'bad': bad}))


async def case_later_movie(pg, cdp):
    """MT4 A4：下次見面那一段（MOVIE_LATER）改在燈暗前演——以安 m2603b 看完、隔天再約一場電影"""
    tag = '[LATER2 以安 m2603b→隔天電影]'; who = 'heroine_01'
    await M.load(pg, cdp, M.base_state([who]), day_key='2026-03-15', why='2026-03-15 08:00、以安朋友')
    await pg.evaluate(MARKS)
    iv = await M.book(pg, cdp, tag, who, 0)
    if not iv: return
    await setfilm(pg, iv, 'm2603b', tag)
    await watch_pick(pg, cdp, tag, who, iv, None); await M.dump(pg, tag)
    lt = await pg.evaluate("(GAME.G.flags||{}).MOVIE_LATER||null"); R.note('%s 看完 MOVIE_LATER＝%s' % (tag, J(lt)))
    await next_day(pg, cdp, tag); await pg.evaluate("window.__MT=[]")
    iv2 = await M.book(pg, cdp, tag + '隔天', who, 0)
    if not iv2: return
    if iv2['film'] == 'm2603b': await setfilm(pg, iv2, 'm2603a', tag + '隔天')
    await watch_pick(pg, cdp, tag + '隔天', who, iv2, None); mt, _ = await M.dump(pg, tag + '隔天')
    li = next((i for i, e in enumerate(mt) if e['k'] == 'say' and ('筆記本' in e['v'] or '簽名' in e['v'])), None)
    im = next((i for i, e in enumerate(mt) if e['k'] == 'mark' and e['v'] == 'MOVIES.playMid 開始'), None)
    ie = next((i for i, e in enumerate(mt) if e['k'] == 'mark' and e['v'] == 'MOVIES.enterHall 結束'), None)
    idk = next((i for i, e in enumerate(mt) if e['k'] == 'say' and '燈暗' in e['v']), None)
    R.note('%s 筆記本那段 __MT %s、進 1 廳 %s、燈暗 %s、看到一半 %s' % (tag, li, ie, idk, im))
    # r2：舊版（c17a9919e）ON_SEATED 在燈暗那一句之後、沒有 playMid＝r1 的「在 playMid 之前」舊版也過（D34 對照不成立）→ 改成「在燈暗那一句之前」
    R.check('%s 隔天電影：筆記本那段（MOVIE_LATER）在燈暗那一句之前演' % tag, li is not None and idk is not None and li < idk, J([e['v'] for e in mt[max(0, (li or 0) - 2):(li or 0) + 4]] + ['燈暗@%s' % idk]))


async def main():
    print('CC MT3（MOVIE-TALK-1110 第二輪）：CASES %s；Playwright ≠ iPhone' % ','.join(CASES), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for c in CASES:
            try:
                if c in ('ZR0', 'ZR1', 'ZR2'): await case_zr(pg, cdp, int(c[2:]))
                elif c == 'ZRNOFX': await case_zr(pg, cdp, 0, '2027-03-13', 'm2703b', '「你要保重。」', '[ZRNOFX 芷若 m2703b]')
                elif c == 'SHUF':
                    u = await pg.evaluate("(()=>{ const out=[]; const T=MOVIES.talkFor({flags:{},day:46,hour:9},'heroine_02','m2511b'); for(let d=46;d<53;d++) out.push(MOVIES.shuffle(T.opts,MOVIES.seedOf(d,'m2511b','heroine_02')).map(o=>o.t)); return out; })()")
                    R.note('[SHUF] 單元層級 day 46～52 的順序：%s' % J(u))
                    R.check('[SHUF] 不同天的順序有不一樣的', len({tuple(x) for x in u}) >= 2, J(u))
                    same = ORD.get(('2025-11-01', 'm2511b')) or []
                    R.note('[SHUF] 同一天（2025-11-01）三次讀檔畫面上的順序：%s' % J(same))
                    if len(same) >= 2: R.check('[SHUF] 同一天同一部同一人讀檔重來順序一樣', all(x == same[0] for x in same), J(same))
                    if same: R.check('[SHUF] 畫面順序＝MOVIES.shuffle(day 46)', same[0] == u[0], J([same[0], u[0]]))
                elif c == 'NOQ': await case_noq(pg, cdp)
                elif c == 'LOVECAP': await case_lovecap(pg, cdp)
                elif c == 'PICK': await case_pick(pg, cdp)
                elif c in ('KXCH0', 'KXCH1'): await case_kxch(pg, cdp, int(c[4:]))
                elif c == 'LATER': await case_later(pg, cdp)
                elif c == 'SECOND': await case_second(pg, cdp)
                elif c == 'SKIP': await case_skip(pg, cdp)
                elif c == 'KXVB': await case_kxvb(pg, cdp)
                elif c == 'FB_FEEL': await case_fb(pg, cdp, 'heroine_03', '2025-11-15', 'm2511a', '會。我騎了一整晚的車耶。', 'feel', '[FB_FEEL 語彤 m2511a]', ('m2511b', '前半有一點。可是找到自己那一幕，我起雞皮疙瘩。'))
                elif c == 'FB_NOTICE': await case_fb(pg, cdp, 'heroine_05', '2026-05-16', 'm2605b', '他最後沒有擦掉那行字。', 'notice', '[FB_NOTICE 溫學姊 m2605b]')
                elif c == 'FB_WONDER': await case_fb(pg, cdp, 'heroine_04', '2025-11-15', 'm2511a', '包裹裡面到底是什麼？', 'wonder', '[FB_WONDER 子晴 m2511a]')
                elif c == 'FB_SELF': await case_fb(pg, cdp, 'heroine_02', '2026-10-17', 'm2609b', '還不知道。可是不想去看不到客戶臉的地方。', 'self', '[FB_SELF 芷若 m2609b]')   # r2：2026-07-11 手機朋友頁沒有芷若
                elif c == 'FB_JOKE': await case_fb(pg, cdp, 'kexin', '2027-03-20', 'm2703a', '我比較同情過敏的那個。', 'joke', '[FB_JOKE 可昕 m2703a]')   # r2：2027-01-16 寒假她在高雄（只有出去玩）
                elif c == 'FB_CRIT': await case_fb(pg, cdp, 'heroine_01', '2026-01-17', 'm2601b', '中間等極光那九個晚上，可以剪掉五個。', 'crit', '[FB_CRIT 以安 m2601b]')
                elif c == 'QOTHER': await case_other(pg, cdp, 'kexin', '2025-11-15', 'm2511b', '[QOTHER 可昕 m2511b]', 'qother')
                elif c == 'OO_3007': await case_other(pg, cdp, 'heroine_01', ['2030-07-06', '2030-07-20', '2030-08-03', '2030-08-17'], 'm3007b', '[OO 以安 m3007b]', 'optsother')
                elif c == 'OO_2805': await case_other(pg, cdp, 'heroine_01', ['2028-05-20', '2028-06-03', '2028-06-10', '2028-06-24'], 'm2805b', '[OO 以安 m2805b]', 'optsother')
                elif c == 'NOASK': await case_other(pg, cdp, 'heroine_01', '2026-11-14', 'm2611a', '[NOASK 以安 m2611a]', 'noask')
                elif c == 'NOFB': await case_other(pg, cdp, 'heroine_01', ['2029-07-07', '2029-07-28', '2029-08-04', '2029-08-18', '2029-08-29'], 'm2907a', '[NOFB 以安 m2907a]', 'nofb')
                elif c == 'LATER2': await case_later_movie(pg, cdp)
                elif c == 'ARC_AN': await case_arcafter(pg, cdp, 'heroine_01', '2027-09-15', 'm2709b', False, '[ARC_AN 以安 借據]')
                elif c == 'ARC_KX': await case_arcafter(pg, cdp, 'kexin', '2027-05-15', 'm2705a', False, '[ARC_KX 可昕 放學後的球場]')
                elif c == 'ARC_AXDONE': await case_arcafter(pg, cdp, 'heroine_01', '2027-09-15', 'm2709b', True, '[ARC_AXDONE 以安 借據、電影三場演完]')
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
            open(os.path.join(OUT, 'movie_talk_lines.txt'), 'w', encoding='utf-8').write('\n'.join(TXT))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'movie_talk_lines.txt'), 'w', encoding='utf-8').write('\n'.join(TXT))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
