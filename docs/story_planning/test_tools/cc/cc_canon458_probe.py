"""CC-C 11-14：BB_458 CANON-NO-ECON-1112 瀏覽器驗收（B～D 節，給 BB 判）。這一支先做 LAWWW 觸發表到之前就確定的：
  GIRAFFE_A／GIRAFFE_B  #6 長頸鹿鑰匙圈（src/data/events.js ev_kx_souvenir：trigger enter、linze／campus、Y1S2 第 1 週（carryTo 2）、
                        KX_Y1S1_END==='taipei'、KX_LINE_OK ACQUAINTANCE）→ 兩個選項各一輪（_A「為什麼我的最短？」、_B「謝謝。」）；記 KX_SOUVENIR、GIRAFFE_KEYCHAIN。
【前置】最小存檔（同 cc_vacgap_probe：GAME.defaults＋過了開場的旗標）讀到大一下第 1 週週一 10:00 宿舍；
【捷徑】可昕 FAMILIAR（SOCIAL.meet＋數值）、聯絡人、KX_MET、KX_Y1S1_END='taipei'（＝大一上期末那一場選「臺北。」），墊完 GAME.snapshot() 再讀一次、條件事件照開；
之後照玩家：手機「地點」→ 校園 → 快速前往（進區域＝onEnter）→ 演出來的每一句截圖、選項照 CASE。每一段最後跑 D158 字表（tools/cc_local/canon_codes.hits）。
CC_02 清單 2026-11-14：1✓（日子用 STORY.termDay('Y1S2',1,1) 在遊戲裡算；旗標照 events.js prereq） 2✓（事件 id、旗標從程式讀；地點按鈕用手機頁 data-place） 3n/a（一件） 4✓（點前 reveal 展開地區、按鈕在才點） 5✓（快速前往，不走路） 6✓（到了等事件開演最多 120 秒） 7✓（lint、node 驗 JS） 8n/a（字對不對歸 BB） 9✓（遊戲畫面原樣截圖） 10✓（別的對話照字點完並記下來） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：讀到 Y1S2 第 1 週、墊完可昕 ≥ ACQUAINTANCE、KX_Y1S1_END、真的到了校園） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=GIRAFFE_A,GIRAFFE_B] python3 cc_canon458_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', '..', 'tools', 'cc_local'))
import playlib as L
import bbplay as P
import cc_phone
from playwright.async_api import async_playwright
try:
    import canon_codes as CC
except Exception:
    CC = None

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'GIRAFFE_A,GIRAFFE_B').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('canon458', OUT)
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False, 'DORM_FOUR': True, 'MET_KAI': True}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
STV = {'ACQUAINTANCE': {'fam': 10}, 'FAMILIAR': {'fam': 25, 'trust': 10, 'comf': 10}, 'FRIEND': {'fam': 45, 'trust': 30, 'comf': 25}, 'DATING': {'fam': 60, 'trust': 50, 'comf': 45, 'rom': 60, 'npcRom': 50}}
SEED_JS = r"""(a=>{ const G=GAME.G, F=G.flags; G.contacts=G.contacts||{};
  for(const id in a.rel){ SOCIAL.meet(id,'cc_seed'); const r=SOCIAL.rel(id), V=a.V[a.rel[id]]; for(const k in V) r[k]=Math.max(r[k]|0,V[k]);
    if(G.contacts[id]==null) G.contacts[id]=Math.max(0,G.day-30); if(id==='kexin') F.KX_MET=true;
    if(a.rel[id]==='DATING'){ F['dating_'+id]=true; const RM=F.romance||(F.romance={}); RM[id]=Object.assign({},RM[id]||{},{status:'dating'}); } }
  Object.assign(F,a.flags||{});
  const out={}; for(const id in a.rel) out[id]={stage:SOCIAL.stage(id)}; out.flags={}; for(const k in (a.flags||{})) out.flags[k]=F[k];
  out.lineOk=typeof KX_LINE_OK==='function'?KX_LINE_OK(G,'ACQUAINTANCE'):null; return out; })"""
DONE_JS = "(ids=>{ const D=(GAME.G.events&&GAME.G.events.done)||{}, F=GAME.G.flags||{}; const o={}; for(const k of ids) o[k]=(k in D)?D[k]:(k in F?F[k]:null); return o; })"


async def fresh(pg, cdp, tag, when, hour, zone, rel=None, flags=None):
    d = await P.day_of(pg, when)
    s = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': [], 'flags': dict(BASEF)}
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: s['flags'][k] = dd
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    await P.load(pg, cdp, s, True)
    R.setup('[%s] 最小存檔讀到 %s %.2f %s（%s 第 %s 週）' % (tag, d['key'], hour, zone, d['term'], d['week']))
    seed = await P.prep(pg, cdp, R, SEED_JS, {'rel': rel or {}, 'flags': flags or {}, 'V': STV}, True, '[%s] 墊關係、旗標' % tag)
    await P.events_on(pg)
    return d, seed


async def travel(pg, cdp, tag, zone):
    """手機「地點」→ 那一區 → 快速前往（同 cc_zone_tour_probe.go）"""
    await P.phone_tab(pg, cdp, 'places'); await cc_phone.reveal(pg, cdp, zone)
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')||b.dataset.place===z); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", zone)
    await pg.screenshot(path=os.path.join(OUT, '%s_00_places.png' % tag))
    if not c: await L.close_panels(pg, cdp); return False
    await L.touch_tap(cdp, c[0], c[1]); return True


async def play(pg, cdp, tag, prefer=(), alt=0, start_s=120, max_s=240):
    """等對話開始 → 每一句截圖 → 選項：prefer 開頭優先，沒有就第 alt 個 → 到結束（同 cc_vacgap_probe.play）"""
    n0 = await P.say_hook(pg); t0 = time.time(); seen = []; opts = []; picked = []; k = 0; started = False; idle = None; run0 = None
    while time.time() - t0 < start_s + max_s:
        s = await P.ts(pg)
        if s['running'] and not run0: run0 = s['running']
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]):
            seen.append([s['name'], s['txt']])
            if len(seen) <= 40: await pg.wait_for_timeout(350); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (tag, k)))
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
        await pg.wait_for_timeout(700)
    k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d_end.png' % (tag, k)))
    said = await P.said(pg, n0)
    r = {'started': started, 'event': run0, 'lines': P.clean(seen), 'said': said, 'opts': opts, 'picked': picked}
    R.note('[%s] 對話（事件 %s）：選項 %s；選了 %s；GAME.say %s' % (tag, run0, J(opts), J(picked), J(said)))
    return r


def d158(tag, r):
    if CC is None: R.note('[%s] canon_codes 載入不了，D158 沒掃' % tag); return None
    txt = '\n'.join(t for _, t in (r.get('said') or []) + (r.get('lines') or [])) + '\n' + '\n'.join(sum(r.get('opts') or [], []))
    n = CC.hits(txt); R.check('[%s] D158 字表 0 處（台詞＋選項）' % tag, n == 0, str(n)); return n


async def c_giraffe(pg, cdp, tag, alt):
    d, seed = await fresh(pg, cdp, tag, ['Y1S2', 1, 1], 10.0, 'dorm', {'kexin': 'FAMILIAR'}, {'KX_Y1S1_END': 'taipei'})
    R.note('[%s] 墊完 %s' % (tag, J(seed)))
    if not R.check('FAIL_SETUP 檢查：[%s] Y1S2 第 1 週、可昕 ≥ ACQUAINTANCE（KX_LINE_OK）、KX_Y1S1_END taipei' % tag,
                   d['term'] == 'Y1S2' and d['week'] == 1 and seed.get('lineOk') is not False and seed['flags'].get('KX_Y1S1_END') == 'taipei', J({'d': d, 'seed': seed})): return {'case': tag, 'skip': 'setup'}
    ok = await travel(pg, cdp, tag, 'campus')
    r = await play(pg, cdp, tag, alt=alt, start_s=120)
    z = (await P.clock(pg))['zone']
    R.check('FAIL_SETUP 檢查：[%s] 手機快速前往到了校園' % tag, ok and z in ('campus', 'linze'), J({'tapped': ok, 'zone': z}))
    st = await pg.evaluate(DONE_JS, ['ev_kx_souvenir', 'KX_SOUVENIR', 'GIRAFFE_KEYCHAIN'])
    R.note('[%s] 之後 %s' % (tag, J(st)))
    R.check('[%s] ev_kx_souvenir 演了、GIRAFFE_KEYCHAIN 設了' % tag, bool(st.get('ev_kx_souvenir')) and st.get('GIRAFFE_KEYCHAIN') is True, J(st))
    d158(tag, r)
    return {'case': tag, 'day': d, 'seed': seed, 'r': r, 'after': st}


async def one(pg, cdp, c):
    if c in ('GIRAFFE_A', 'GIRAFFE_B'): return await c_giraffe(pg, cdp, c, 0 if c.endswith('A') else 1)
    R.check('[%s] 認得這個 CASE' % c, False, ''); return {'case': c, 'skip': 'unknown'}


async def main():
    print('CC CANON BB_458：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    res = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            await P.init(pg)
            try: res['cases'].append(await one(pg, cdp, c))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            open(os.path.join(OUT, 'canon458.json'), 'w', encoding='utf-8').write(J(res))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'canon458.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
