"""CC-C 11-14：劇情場景探針共用（從 cc_vacgap_probe 抽出來；cc_canon458_probe 用）。
  setup(run, out)；fresh(最小存檔＋墊關係／旗標／群組，GAME.snapshot 再讀，條件事件照開)；jump(同一份進度跳日期)；wait_h(等遊戲時間)；
  play(等對話開始→每一句截圖→選項 prefer 開頭優先、沒有就第 alt 個)；go_out(等「出發／接起來」→ 演兩輪)；thread／answer(手機那一串、回覆鍵)；travel(手機地點快速前往)；d158(字表)。
  【前置】【捷徑】都寫進 run.setup。只記、截圖；判定歸 BB。
CC_02 清單 2026-11-14：1✓（共用：前置由呼叫的探針給，旗標照程式） 2✓（手機串 data-th、回覆 data-ask、地點 data-place 從畫面讀） 3n/a（共用） 4✓（按之前確認按鈕在） 5n/a（不走路；travel＝快速前往） 6✓（wait_h 等遊戲時間真的過、play 等開演有上限） 7✓（lint、node 驗 JS） 8n/a（只記） 9✓（每句、每個選項、手機畫面截圖） 10✓（別的對話照字點完並記） 11n/a（共用） 12✓（wait_h 的 FAIL_SETUP 檢查；其他由探針自己加） 13n/a（不走路）"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', '..', 'tools', 'cc_local'))
import playlib as L
import bbplay as P
import cc_phone
try:
    import canon_codes as CC
except Exception:
    CC = None

J = lambda o: json.dumps(o, ensure_ascii=False)
R = None; OUT = None
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False, 'DORM_FOUR': True, 'MET_KAI': True}   # GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
STV = {'ACQUAINTANCE': {'fam': 10}, 'FAMILIAR': {'fam': 25, 'trust': 10, 'comf': 10}, 'FRIEND': {'fam': 45, 'trust': 30, 'comf': 25},
       'CLOSE': {'fam': 65, 'trust': 50, 'comf': 45}, 'DATING': {'fam': 65, 'trust': 50, 'comf': 45, 'rom': 60, 'npcRom': 50}}
SEED_JS = r"""(a=>{ const G=GAME.G, F=G.flags; G.contacts=G.contacts||{};
  for(const id in a.rel){ SOCIAL.meet(id,'cc_seed'); const r=SOCIAL.rel(id), V=a.V[a.rel[id]]; for(const k in V) r[k]=Math.max(r[k]|0,V[k]);
    if(G.contacts[id]==null) G.contacts[id]=Math.max(0,G.day-30); if(id==='kexin') F.KX_MET=true;
    if(a.rel[id]==='DATING'){ try{ if(typeof ROM!=='undefined'&&ROM.start) ROM.start(G,id); }catch(e){} F['dating_'+id]=true; const RM=F.romance||(F.romance={}); RM[id]=Object.assign({},RM[id]||{},{status:'dating'}); } }
  for(const g of (a.groups||[])) PHONE.join(G,g[0],g[1]);
  Object.assign(F,a.flags||{});
  if(a.done){ const E=G.events||(G.events={done:{},last:{},count:0}); E.done=E.done||{}; for(const id of a.done) E.done[id]=1; }
  const out={}; for(const id in a.rel){ out[id]={stage:SOCIAL.stage(id), dating:!!F['dating_'+id]}; }
  out.flags={}; for(const k in (a.flags||{})) out.flags[k]=F[k]; return out; })"""
MSGS_JS = "(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({who:m.name||m.from||'', text:String(m.text||'').slice(0,80), d:m.day, h:m.h, tag:m.tag||null, ask:m.ask?(m.ask.opts||[]).map(o=>o.t):null, ans:m.ans!=null?m.ans:null})))"


def setup(run, out):
    global R, OUT
    R = run; OUT = out


async def fresh(pg, cdp, tag, when, hour, zone, rel=None, flags=None, groups=(), done=(), base=None, pos=None):
    d = await P.day_of(pg, when)
    s = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': [], 'flags': dict(base or BASEF)}
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: s['flags'][k] = dd
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    await P.init(pg); await P.load(pg, cdp, s, True)
    R.setup('[%s] 最小存檔讀到 %s %.2f %s（%s 第 %s 週）' % (tag, d['key'], hour, zone, d['term'], d['week']))
    seed = await P.prep(pg, cdp, R, SEED_JS, {'rel': rel or {}, 'flags': flags or {}, 'groups': list(groups), 'done': list(done), 'V': STV}, True, '[%s] 墊關係、旗標' % tag)
    await P.events_on(pg)
    return d, seed


async def jump(pg, cdp, tag, when, hour, zone=None, pos=None):
    d = await P.jump(pg, cdp, R, when, hour, zone, pos, True, note=tag)
    await P.events_on(pg)
    return d


async def wait_h(pg, cdp, h, tag, max_s=300):
    ok = await P.wait_play(pg, cdp, h, max_s=max_s, run=R, tag=tag)
    c = await P.clock(pg)
    R.check('FAIL_SETUP 檢查：[%s] 遊戲時間過了 %.2f（現在 %s %.2f）' % (tag, h, c['key'], c['h']), ok, '')
    return ok


async def play(pg, cdp, tag, alt=0, prefer=(), start_s=120, max_s=300):
    n0 = await P.say_hook(pg); t0 = time.time(); seen = []; opts = []; picked = []; k = 0; started = False; idle = None; run0 = None
    while time.time() - t0 < start_s + max_s:
        s = await P.ts(pg)
        if s['running'] and not run0: run0 = s['running']
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]):
            seen.append([s['name'], s['txt']])
            if len(seen) <= 50: await pg.wait_for_timeout(350); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (tag, k)))
        if s['ch']:
            started = True; idle = None; o = s['ch']; opts.append([x['t'] for x in o])
            i = next((n for p in prefer for n, x in enumerate(o) if x['t'].startswith(p) and not x['dim']), None)
            if i is None: i = min(alt, len(o) - 1)
            picked.append(o[i]['t']); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d_choice.png' % (tag, k)))
            await P.tap_choice(pg, cdp, i); await pg.wait_for_timeout(900); continue
        if s['dlg']: started = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['depth'] > 0: started = True; idle = None; await pg.wait_for_timeout(500); continue
        if s['busy']: idle = None; await pg.wait_for_timeout(500); continue
        if s['phone']: await L.phone_away(pg, cdp)
        if started:
            idle = idle or time.time()
            if time.time() - idle > 4: break
        elif time.time() - t0 > start_s: break
        await pg.wait_for_timeout(600)
    k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d_end.png' % (tag, k)))
    said = await P.said(pg, n0)
    r = {'started': started, 'event': run0, 'lines': P.clean(seen), 'said': said, 'opts': opts, 'picked': picked}
    R.note('[%s] 對話（事件 %s）：選項 %s；選了 %s；GAME.say %s' % (tag, run0, J(opts), J(picked), J(said)))
    return r


async def go_out(pg, cdp, tag, alt=0, start_s=420, verbs=('出發', '接起來')):
    a = await play(pg, cdp, tag + '_a', alt, prefer=verbs, start_s=start_s)
    b = await play(pg, cdp, tag + '_b', alt, prefer=verbs, start_s=20)
    return {'a': a, 'b': b}


async def thread(pg, cdp, tag, th):
    t = await P.phone_thread(pg, cdp, th)
    await pg.screenshot(path=os.path.join(OUT, '%s_phone_%s.png' % (tag, th.replace(':', '_'))))
    m = await pg.evaluate(MSGS_JS, th)
    R.note('[%s] 手機 %s 打得開=%s；這一串（G.msgs）%s' % (tag, th, t['ok'], J(m[-8:])))
    await L.close_panels(pg, cdp)
    return {'ok': t['ok'], 'msgs': m, 'asks': t['asks']}


async def answer(pg, cdp, tag, th, idx=0, label=None):
    t = await P.phone_thread(pg, cdp, th, open_folds=False)
    live = [a for a in t['asks'] if not a['dis']]
    R.note('[%s] 回覆鍵 %s' % (tag, J(t['asks'])))
    if not live: await L.close_panels(pg, cdp); return None
    lab = label if label and any(a['t'].startswith(label) for a in live) else live[min(idx, len(live) - 1)]['t']
    await P.phone_answer(pg, cdp, th, lab)
    await pg.wait_for_timeout(2500); await pg.screenshot(path=os.path.join(OUT, '%s_reply_%s.png' % (tag, th.replace(':', '_'))))
    m = await pg.evaluate(MSGS_JS, th); R.note('[%s] 按「%s」以後：%s' % (tag, lab, J(m[-4:])))
    await L.close_panels(pg, cdp)
    return lab


async def travel(pg, cdp, tag, zone):
    await P.phone_tab(pg, cdp, 'places'); await cc_phone.reveal(pg, cdp, zone)
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')||b.dataset.place===z); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", zone)
    await pg.screenshot(path=os.path.join(OUT, '%s_places_%s.png' % (tag, zone)))
    if not c: await L.close_panels(pg, cdp); R.note('[%s] 手機「地點」沒有 %s' % (tag, zone)); return False
    await L.touch_tap(cdp, c[0], c[1]); return True


def d158(tag, *rs):
    if CC is None: R.note('[%s] canon_codes 載入不了，D158 沒掃' % tag); return None
    parts = []
    for r in rs:
        if not r: continue
        if 'a' in r and 'b' in r: rs2 = [r['a'], r['b']]
        else: rs2 = [r]
        for x in rs2:
            parts += [t for _, t in (x.get('said') or []) + (x.get('lines') or [])] + sum(x.get('opts') or [], [])
        parts += [m.get('text', '') for m in (r.get('msgs') or [])] if isinstance(r, dict) else []
    n = CC.hits('\n'.join(parts)); R.check('[%s] D158 字表 0 處（台詞、選項、手機）' % tag, n == 0, str(n)); return n
