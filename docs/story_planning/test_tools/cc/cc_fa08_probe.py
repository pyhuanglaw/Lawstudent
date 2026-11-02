"""CC（帳號 A）11-02：FA-08 學期中快轉（SEMFF）會不會被法服值班打斷——社員 vs 非社員（BB_222 驗收計畫 B-2 FA-08；共同規則第 221–237 行）。
方法：瀏覽器 turbo＋【前置】最小存檔。Node 部分另外跑 baseline_1102/fafu_semff_stops.js（不在這支探針裡）。
不是 iPhone：Playwright 手機模擬（SwiftShader 1–4 fps）。URL 用 '<URL>/index.html?turbo'（turbo＝走到床邊瞬間到、淡入淡出縮短；快轉本身是 SEMFF.jump 的計算，不受影響）。

存檔【前置】：最小存檔（同 cc_dl04b_probe 的 state_at：GAME.defaults＋過了開場的旗標 BASEF），改到大二上第 4 週週五 21:00、宿舍（zone dorm，出生點），
  EXCHANGE_ROUTE:'TW'（不出國交換，和 Node 腳本同）。
  社員＝STORY.fafuMember(G)（story3d.js:681：法律系、F.lawclub||F.CLUB_lawclub_study、大二～大四學期中）→ 旗標 lawclub、CLUB_lawclub_study、SIS_CLUB_EXPO（和 Node 腳本同一組）；
  非社員＝不給這三個。讀檔後印 GAME 算出來的 STORY.fafuMember 當確認。
玩家操作（真的介面）：走到床（點地／搖桿，turbo 下瞬間到）→ 按互動「睡覺」→ 床的選單選「快轉」→ SEMFF 選單選「過一週」→
  快轉途中：手機自己打開（要回的訊息，D103）＝按「收起來」（SEMFF 接著跳）；對話點過去；別的選單照 pick_opt（婉拒那一類；出發提醒選「不去了」）。
  停下來以後記：日期字卡（GAME.titleCard：日期＋「該出發了」／停的原因／「宿舍」）、SEMFF.jump 的回傳（why、stop、OUT.due 的標題）、之後出的選單（例：「出發：法服值班」）。
  一輪結束（SEMFF.menu 回來、畫面空下來）→ 還在宿舍就再按一次床、再「過一週」；到 STOP_KEY（預設 2026-10-27，期中考那一週；Node 腳本在這裡卡考試）或 why=now（考試快開始）
  或人不在宿舍了（不瞬移回去）或 ROUNDS 輪（預設 6）就停。
記錄（只記不改）：HOOK（GAME.say／choose／caption／toast／titleCard／enter、EVENTS.run）＋ SEMFF.menu／SEMFF.jump 的包裝（只記回傳值，照原樣呼叫）。
  逐字稿存 <輸出>/transcript_<case>.json（rows＝全部紀錄、ff＝每一次 jump、stops＝整理過的停點）。
check（客觀記錄，判定由 BB 做）：每一輪能不能從床進到「過一週」；兩份各自的停點清單；社員停點裡有沒有「法服值班」；社員和非社員的停點清單是否相同。
  修改前（a3b1bd647）預期：社員停在「2026-10-24 08:30 該出發了：法服值班」→「停點相同」那一項 FAIL。
環境變數：CASES（預設 member,nonmember）、ROUNDS（預設 6）、STOP_KEY（預設 2026-10-27）、ROUND_MAX（一輪最多等幾秒，預設 600）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_fa08_probe.py '<URL>/index.html?turbo' <輸出資料夾>"""
import os, sys, json, asyncio, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in os.environ.get('CASES', 'member,nonmember').split(',') if c.strip()]
ROUNDS = int(os.environ.get('ROUNDS', '6'))
STOP_KEY = os.environ.get('STOP_KEY', '2026-10-27')
ROUND_MAX = int(os.environ.get('ROUND_MAX', '600'))
START = ['Y2S1', 4, 5]   # 大二上第 4 週週五
MEMBER_FLAGS = {'lawclub': True, 'CLUB_lawclub_study': True, 'SIS_CLUB_EXPO': True}   # 同 baseline_1102/fafu_semff_stops.js


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % ((m // 60) % 24, m % 60)


# ---------------------------------------------------------------- 存檔（複製自 cc_dl04b_probe.py 的 state_at；只留法律系、最小存檔）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather=weather, stage='law', money=money)
    st['visited'] = {z: True for z in VISITED}
    return st, d


# ---------------------------------------------------------------- 記錄（只記不改；HOOK 複製自 cc_dl04b_probe.py，拿掉 CLS 的部分，加 SEMFF）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  if(typeof SEMFF!=='undefined'){
    /* SEMFF.menu 呼叫 S.jump（S===SEMFF）：包 SEMFF.jump 就記得到每一次跳；照原樣呼叫、只記回傳 */
    const j0=SEMFF.jump; SEMFF.jump=async function(GM,to){ const a=at(); const r=await j0.apply(this,arguments); let q=null; try{ q=(typeof OUT!=='undefined'&&OUT.due)?OUT.due(GAME.G):null; }catch(e){}
      push({k:'ffjump',n:JSON.stringify({from:a,to:+(+to).toFixed(3)}),t:JSON.stringify({why:r&&r.why,stop:r&&r.stop?r.stop.why:null,auto:r?r.auto|0:0,msgs:r?r.msgs|0:0,out:q?(q.title||q.id):null,outId:q?q.id:null})}); return r; };
    const m0=SEMFF.menu; SEMFF.menu=async function(GM){ push({k:'ffmenu0',n:'',t:''}); let r; try{ r=await m0.apply(this,arguments); }
      finally{ push({k:'ffmenu1',n:'',t:JSON.stringify(r&&typeof r==='object'?{why:r.why,stop:r.stop?r.stop.why:null}:r)}); } return r; };
  }
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""
MEMBER_JS = "(()=>{ const G=GAME.G, F=G.flags||{}; return {fafuMember:!!(STORY.fafuMember&&STORY.fafuMember(G)),lawclub:!!F.lawclub,CLUB_lawclub_study:!!F.CLUB_lawclub_study,semffOn:!!(typeof SEMFF!=='undefined'&&SEMFF.on(G)),term:(CALENDAR.termOf(G.day)||{}).id||null,week:(CALENDAR.termOf(G.day)||{}).week||null,date:CALENDAR.dateOf(G.day).key,h:G.hour,zone:G.zone,room:(GAME.E.zone&&GAME.E.zone.dormSetKey)||null}; })()"


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


# ---------------------------------------------------------------- 照玩家操作（pick_opt、press_bed 複製自 cc_dl04b_probe.py）
DECL = ('不去了', '晚一點', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')


def pick_opt(ch, picks=()):
    """選哪一個：picks（開頭符合）→ 起床選單「先起床」→ 婉拒那一類（「不去了」優先於「晚一點」：同 Node 腳本把出遊記成 missed）→ 第一個不是「出發：」那一類的"""
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p): return i, 'pick'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def press_bed(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=150, stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        await L.phone_away(pg, cdp, tries=1)
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
        s = await P.ts(pg)
        if s['ch'] or s['dlg'] or s['busy']: return True
    return False


async def tap_text(pg, cdp, ch, prefix):
    k = next((i for i, o in enumerate(ch or []) if o['t'].startswith(prefix) and not o['dim']), None)
    if k is None: return None
    t = ch[k]['t']; await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); return t


async def wait_choice(pg, cdp, pred, max_s=60):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch'] and pred([o['t'] for o in s['ch']]): return s['ch']
        if s['dlg'] and not s['ch']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(700)
    return None


async def one_round(pg, cdp, run, case, r):
    """一輪：床 → 快轉 → 過一週 → 等到 SEMFF.menu 回來、之後的選單／對話處理完、畫面空下來。回傳這一輪的紀錄"""
    tag = '%s_r%d' % (case, r)
    out = {'round': r, 'start': await P.clock(pg), 'ok': False, 'shots': []}
    if not await press_bed(pg, cdp, run):
        out['err'] = '按不到床'; out['shots'].append(await run.shot(pg, tag + '_nobed')); return out
    ch = await wait_choice(pg, cdp, lambda T: any(t.startswith('快轉') for t in T), 30)
    if not ch:
        s = await P.ts(pg); out['err'] = '床的選單沒有「快轉」'; out['bedmenu'] = [o['t'] for o in s['ch']]
        out['shots'].append(await run.shot(pg, tag + '_nofastfwd')); return out
    out['bedmenu'] = [o['t'] for o in ch]
    await tap_text(pg, cdp, ch, '快轉')
    ch = await wait_choice(pg, cdp, lambda T: any(t.startswith('過一週') for t in T), 30)
    if not ch:
        out['err'] = 'SEMFF 選單沒有「過一週」'; out['shots'].append(await run.shot(pg, tag + '_noweek')); return out
    out['ffmenu'] = [o['t'] for o in ch]
    out['shots'].append(await run.shot(pg, tag + '_ffmenu'))
    n0 = await pl_len(pg); out['n0'] = n0
    await tap_text(pg, cdp, ch, '過一週')
    t0 = time.time(); ended = False; ncard = 0; free_since = None; out['after'] = []
    while time.time() - t0 < ROUND_MAX:
        R = await rows(pg, n0)
        cards = [x for x in R if x['k'] == 'card']
        if len(cards) > ncard:   # 日期字卡出來了：截圖（2.4 秒；低幀率可能截不到，紀錄以 HOOK 為準）
            ncard = len(cards); await pg.wait_for_timeout(300); out['shots'].append(await run.shot(pg, '%s_card%d' % (tag, ncard)))
        if not ended and any(x['k'] == 'ffmenu1' for x in R): ended = True; out['menu_end_clock'] = await P.clock(pg)
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            if ended:
                out['shots'].append(await run.shot(pg, '%s_after_choice%d' % (tag, len(out['after']) + 1)))
            k, why = pick_opt(s['ch'])
            if ended: out['after'].append({'clock': await P.clock(pg), 'opts': T, 'pick': T[k]})
            run.note('%s %s %s %s 選項 %s → %s（%s）' % (tag, s['day'], hm(s['h']), s['zone'], J([t[:30] for t in T]), T[k][:30], why))
            if why == 'first' and T[k].startswith(GO_PREFIX):   # 只剩「出發：」（must）＝不按，停在這裡由 BB 看
                out['must_go'] = T; break
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); free_since = None; continue
        if s['phone'] and not s['dlg']:
            run.note('%s %s %s 手機自己打開了（要回的訊息）→ 收起來' % (tag, s['day'], hm(s['h'])))
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(600); free_since = None; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); free_since = None; continue
        free = not s['busy'] and s['depth'] == 0
        if ended and free:
            free_since = free_since or time.time()
            if time.time() - free_since > 8: out['ok'] = True; break   # 空下來 8 秒（讓 STORY.tick／OUT.tick 有機會出出發提醒）
        else: free_since = None
        await pg.wait_for_timeout(800)
    R = await rows(pg, n0)
    out['jumps'] = [dict(json.loads(x['t']), **json.loads(x['n'])) for x in R if x['k'] == 'ffjump']
    out['cards'] = [[x['n'], x['t'], x.get('d'), x.get('h')] for x in R if x['k'] == 'card']
    out['toasts'] = [x['t'] for x in R if x['k'] == 'toast' and not x['n']]
    out['evs'] = [x['t'] for x in R if x['k'] == 'ev']
    out['end'] = await P.clock(pg)
    out['shots'].append(await run.shot(pg, tag + '_end'))
    return out


async def run_case(p, run, case):
    member = case == 'member'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    res = {'case': case, 'rounds': [], 'stops': []}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % case, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); run.note('HOOK ' + await pg.evaluate(HOOK))
        flags = {'EXCHANGE_ROUTE': 'TW'}
        if member: flags.update(MEMBER_FLAGS)
        st, d = await state_at(pg, START, 21.0, 'dorm', flags)
        await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
        await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
        mem = await pg.evaluate(MEMBER_JS); res['member_state'] = mem
        run.setup('[前置] 最小存檔（GAME.defaults＋BASEF）→ %s（%s 第 %s 週，週五）21:00 宿舍；旗標 %s；讀檔後遊戲算出 %s' % (d['key'], d['term'], d['week'], J(flags), J(mem)))
        run.check('%s：讀檔後 STORY.fafuMember＝%s（前置正確）' % (case, member), mem['fafuMember'] == member, J(mem))
        run.check('%s：讀檔後 SEMFF.on（床有「快轉」的前提）' % case, mem['semffOn'], J(mem))
        res['shots'] = [await run.shot(pg, case + '_start')]
        for r in range(1, ROUNDS + 1):
            c = await P.clock(pg)
            if c['zone'] != 'dorm':
                run.note('%s：第 %d 輪前人在 %s（不在宿舍），不瞬移回去，停止' % (case, r, c['zone'])); res['left_dorm'] = c; break
            if c['key'] >= STOP_KEY:
                run.note('%s：已到 %s（≥ STOP_KEY %s），停止' % (case, c['key'], STOP_KEY)); break
            o = await one_round(pg, cdp, run, case, r); res['rounds'].append(o)
            run.note('%s 第 %d 輪：%s → %s；jumps %s；字卡 %s；之後的選單 %s；toast %s；事件 %s%s' % (case, r, J(o['start']), J(o.get('end')), J(o.get('jumps')), J(o.get('cards')),
                     J([a['opts'] for a in o.get('after', [])]), J(o.get('toasts')), J(o.get('evs')), ('；錯誤 ' + o['err']) if o.get('err') else ''))
            run.check('%s 第 %d 輪：床 → 快轉 → 過一週 → 跑完' % (case, r), o['ok'] and not o.get('err'), o.get('err', '') or ('逾時 %ds' % ROUND_MAX if not o['ok'] else ''))
            if not o['ok'] or o.get('err') or o.get('must_go'): break
            if any(j.get('why') == 'now' for j in o.get('jumps', [])): run.note('%s：why=now（有劇情的課／考試快開始），停止' % case); break
        # 停點：每一次 jump 回來的那一刻（d,h 是 push 當下）＋ why＋原因
        R = await rows(pg, 0)
        res['ff'] = [dict(json.loads(x['t']), at_d=x.get('d'), at_h=x.get('h'), at_z=x.get('z'), **json.loads(x['n'])) for x in R if x['k'] == 'ffjump']
        res['stops'] = []
        for j in res['ff']:
            if j['why'] == 'end': continue
            why = j['why'] + ((':' + j['stop']) if j.get('stop') else '') + (('｜OUT.due＝' + j['out']) if j.get('out') else '')
            res['stops'].append('%s %s %s' % (j['at_d'], hm(j['at_h']), why))
        res['cards'] = [[x['n'], x['t']] for x in R if x['k'] == 'card']
        res['rows'] = R
        run.check('%s：沒有 JS 例外' % case, not errs, J(errs[:3]))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % case, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, case + '_exception')
        except Exception: pass
        try: res['rows'] = await rows(pg, 0)
        except Exception: pass
    finally:
        with open(os.path.join(OUT, 'transcript_%s.json' % case), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    return res


async def main():
    run = L.Run('fa08_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    print('==== FA-08（SHA %s）URL %s ====' % (os.environ.get('SHA', '?'), URL), flush=True)
    if '?turbo' not in URL and '&turbo' not in URL: run.note('注意：URL 沒有 ?turbo（驗收計畫寫瀏覽器 turbo）')
    R = {}
    async with async_playwright() as p:
        for c in CASES:
            print('---- case %s ----' % c, flush=True)
            R[c] = await run_case(p, run, c)
    for c, r in R.items():
        run.note('%s 停點（%d）：%s' % (c, len(r.get('stops', [])), J(r.get('stops'))))
        run.note('%s 日期字卡：%s' % (c, J(r.get('cards'))))
    if 'member' in R:
        fafu = [s for s in R['member'].get('stops', []) if '法服' in s] + ['字卡 ' + J(x) for x in R['member'].get('cards', []) if '法服' in J(x)]
        for r0 in R['member'].get('rounds', []):
            for a in r0.get('after', []):
                if any('法服' in t for t in a['opts']): fafu.append('%s %s 選單 %s' % (a['clock']['key'], hm(a['clock']['h']), J(a['opts'])))
        run.check('社員：快轉停點／停下來後的選單沒有「法服值班」', not fafu, J(fafu))
    if 'member' in R and 'nonmember' in R:
        a, b = R['member'].get('stops', []), R['nonmember'].get('stops', [])
        diff = {'只有社員': [s for s in a if s not in b], '只有非社員': [s for s in b if s not in a]}
        run.check('社員和非社員的停點相同（FA-08 通過條件；AA 定稿的一次性事件可以停＝由 BB 看差異判）', a == b, J(diff))
    with open(os.path.join(OUT, 'fa08_summary.json'), 'w', encoding='utf-8') as f:
        json.dump({c: {'stops': r.get('stops'), 'cards': r.get('cards'), 'member_state': r.get('member_state'), 'left_dorm': r.get('left_dorm')} for c, r in R.items()}, f, ensure_ascii=False, indent=1)
    print('SHA', os.environ.get('SHA', '?'), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
