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
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
            open(os.path.join(OUT, 'movie_talk_lines.txt'), 'w', encoding='utf-8').write('\n'.join(TXT))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'movie_talk_lines.txt'), 'w', encoding='utf-8').write('\n'.join(TXT))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
