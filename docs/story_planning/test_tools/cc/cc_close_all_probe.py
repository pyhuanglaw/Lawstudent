"""CC-C（帳號 C）11-05：CLOSE_ALL（BB-C 06:41，V21R；CLOSE-UNIFY-1105）——所有有營業時間、走得進去的店，打烊時人在店裡：
  期望（AA_700，claude/magical-albattani-bk7b4n 4f60052c8）：店員（只有老闆顧的店＝老闆）說「我們今天要打烊了。」→ 玩家走出店門、站到門口外面（不另外出旁白）。
    24 小時的店（大口、便利商店）沒有這一句。坐著轉暗的那一段不打斷（這支不測，山嵐坐地板那一項在 SHANLAN 探針）。
  店的清單照 PLACES 的營業時間自己列（BB-C 06:41）：PLACES.hours 裡有 rules、而且 Z3.ZONES 有這個區域的；營業時間一天有兩段的（例：林家午、晚）兩段都測。
  做法：每一間、每一段，讀檔進店（區域出生點）到收店前 2 分鐘，等到收店（最多 120 秒），記台詞（說話的人）、最後在哪一區、站不站得住、推不推得動。
    日子：2025-10-15（三）那天沒開的，往後找有開的那一天。
用法：LW_TESTS=<wt>/tests [ONLY=xs_shanlan,wz_lin] [STAFF=0＝不測打工那天] python3 cc_close_all_probe.py <url> <out>"""
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
R = L.Run('close_all', OUT); D.setup(R, OUT)
LINE = '我們今天要打烊了。'   # AA_700
OWNER = {'xs_haopai', 'xs_tongxian'}   # AA_700：只有老闆在顧的店（好拍運動、同弦樂器這種）＝老闆
# CC-B 11-07（CC_00 待做「打烊例外」）：說話的人照 AA-C 11-05 08:10＋AA_700——老闆娘顧的店＝老闆娘（118 巷滇香、家常菜）；一個人顧或老闆顧的＝老闆；其他＝店員
WHO = {'l118_dian': '老闆娘', 'l118_home': '老闆娘', 'xs_haopai': '老闆', 'xs_tongxian': '老闆', 'wz_print': '老闆', 'wz_lin': '老闆', 'wz_teishoku': '老闆',
       'bikeshop': '老闆', 'l118_pasta': '老闆', 'l118_korea': '老闆', 'l118_noodle2': '老闆', 'wz_mokuyobi': '老闆'}
STAFF = (os.environ.get('STAFF') or '1') != '0'   # 打工那天（JOBS.worked）＝不說那一句（AA-C 11-05 08:10；XSCLOSE.staffToday）
STAFF_ZONES = ['wz_brunch', 'wz_print', 'wz_teahouse', 'cafe', 'bookstore', 'cvs']   # JOBS.ZONE_KEY 的店（cvs 24 小時、不在表上會自動跳過）
LIST = r"""(()=>{ const H=PLACES.hours||{}, out=[]; const base=STORY.dayOfKey('2025-10-15');
  for(const [k,o] of Object.entries(H)){ if(!o||!o.rules||!o.rules.week||!Z3.ZONES[k]) continue;
    for(let dd=0; dd<7; dd++){ const day=base+dd, wd=CALENDAR.dateOf(day).wd, r=o.rules.week[wd]; if(!r) continue; const segs=Array.isArray(r[0])?r:[r];
      const ends=segs.map(s=>s[1]).filter(e=>e<24.001&&!(segs.some(s=>s[0]===0)&&e>=24)); if(!ends.length) break;
      out.push({k, name:(PLACES.names&&PLACES.names[k])||k, day, key:CALENDAR.dateOf(day).key, wd, segs, ends}); break; } }
  /* CC-B 11-07：118 巷（L118 自己的營業時間）、兩點半等 XSCLOSE.ZONES 管、但 PLACES.hours 沒有 rules 的店也列進來——照 XSCLOSE 自己的開店判斷，一天裡每 15 分鐘掃，最後一段打烊的時間 */
  if(typeof XSCLOSE!=='undefined'&&XSCLOSE.ZONES){ const have=new Set(out.map(o=>o.k));
    for(const [k,C] of Object.entries(XSCLOSE.ZONES)){ if(have.has(k)||!Z3.ZONES[k]) continue;
      for(let dd=0; dd<7; dd++){ const day=base+dd; const isO=h=>{ const G=Object.assign({},GAME.G,{day,hour:h,flags:GAME.G.flags}); try{ return C.open?!!C.open(G):XSCLOSE.placeOpen(C.place,G); }catch(e){ return false; } };
        let last=null, any=false; for(let h=6; h<24.01; h+=0.25){ const o=isO(h); if(o) any=true; if(o&&!isO(h+0.25)) last=h+0.25; }
        if(!any||last==null||last>=24) continue; out.push({k, name:(PLACES.names&&PLACES.names[k])||k, day, key:CALENDAR.dateOf(day).key, wd:CALENDAR.dateOf(day).wd, segs:'XSCLOSE', ends:[last]}); break; } } }
  return out; })()"""
SAYHOOK = r"""(()=>{ if(!window.__ccSayWrapped){ const s0=GAME.say; GAME.say=function(who,t){ try{ (window.__ccSay=window.__ccSay||[]).push({who:who?(who.name||String(who)):null, t:String(t)}); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayWrapped=true; }
  window.__ccSay=[]; return true; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC CLOSE_ALL（打烊統一一句 AA_700）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        shops = await pg.evaluate(LIST)
        if ONLY: shops = [s for s in shops if s['k'] in ONLY]
        R.note('有營業時間、走得進去的店 %d 間：%s' % (len(shops), J([[s['k'], s['name'], s['key'], s['segs']] for s in shops])))
        rows = []
        for sh in shops:
            for end in sh['ends']:
                tag = '[%s %s 收店 %05.2f]' % (sh['name'], sh['key'], end)
                h0 = end - 0.035
                try:
                    R.setup('%s 讀檔進店（出生點）%05.2f' % (tag, h0))
                    await pg.evaluate(SAYHOOK)   # CC-B 11-07：讀檔以前就掛好（PC GPU 快：讀檔等 4 秒時遊戲時間已經跑到打烊、那一句先說掉了＝PC CLOSE_EXC 17 項 lines []）
                    s = await D.load_zone(pg, cdp, sh['k'], sh['key'], h0, wait=4000)
                    if s['zone'] != sh['k']: R.check('%s 讀得進店裡' % tag, False, J(s)); continue
                    t0 = time.time(); e = None
                    while time.time() - t0 < 120:
                        q = await D.st(pg)
                        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
                        if q['zone'] != sh['k'] and not q['busy']: e = q; break
                        await pg.wait_for_timeout(500)
                    Ls = await pg.evaluate("window.__ccSay||[]")
                    wexp = WHO.get(sh['k'], '店員')
                    hit = [x for x in Ls if x['t'] == LINE]
                    okw = bool(hit) and hit[0]['who'] == wexp
                    mv = await D.pushable(pg, cdp) if e else 0
                    rows.append([sh['k'], end, bool(hit), hit[0]['who'] if hit else None, e and e['zone'], e and e['stand']])
                    R.check('%s %s「%s」（AA_700）、走出店門到 %s、站得住、推得動' % (tag, wexp, LINE, e and e['zone']), okw and bool(e) and e['stand'] and mv >= 0.3, J({'lines': Ls, 'end': e, 'moved': mv}))
                    if e: await D.shot(pg, 'close_%s_%02d' % (sh['k'], int(end)), judge_black=False)
                except Exception as ex:
                    R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
        R.note('總表（店、收店、有那一句、說話的人、出來到哪、站得住）：%s' % J(rows))
        if STAFF:   # 打工那天：【前置／捷徑】JOBS 的打工紀錄寫「今天上過班」（G.jobs[k].worked）→ 收店時不說那一句（沒有真的跑打工流程＝不判走不走出去，只判不說）
            keys = await pg.evaluate("(()=>typeof JOBS!=='undefined'&&JOBS.ZONE_KEY?JOBS.ZONE_KEY:{})()")
            for sh in shops:
                if sh['k'] not in STAFF_ZONES or sh['k'] not in keys: continue
                end = sh['ends'][-1]; tag = '[打工那天 %s %s 收店 %05.2f]' % (sh['name'], sh['key'], end)
                try:
                    R.setup('%s 讀檔進店 %05.2f；【前置／捷徑】G.jobs.%s.worked 加今天（JOBS.worked＝true）' % (tag, end - 0.035, keys[sh['k']]))
                    s = await D.load_zone(pg, cdp, sh['k'], sh['key'], end - 0.035, wait=4000)
                    if s['zone'] != sh['k']: R.check('%s 讀得進店裡' % tag, False, J(s)); continue
                    await pg.evaluate(SAYHOOK)
                    w = await pg.evaluate("((k)=>{ const G=GAME.G, J=JOBS.rec(G); const j=J[k]&&typeof J[k]==='object'?J[k]:(J[k]={}); j.worked=(j.worked||[]).concat([G.day]); return {worked:JOBS.worked(G,k,G.day), staff:typeof XSCLOSE!=='undefined'&&XSCLOSE.staffToday?XSCLOSE.staffToday(G,G.zone):null}; })", keys[sh['k']])
                    R.note('%s 打工紀錄：%s' % (tag, J(w)))
                    await pg.evaluate(SAYHOOK)
                    t0 = time.time()
                    while time.time() - t0 < 75:
                        q = await D.st(pg)
                        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
                        if q['hour'] > end + 0.5 / 60 * 30 or q['zone'] != sh['k']: break
                        await pg.wait_for_timeout(500)
                    q = await D.st(pg); Ls = await pg.evaluate("window.__ccSay||[]")
                    R.check('%s 打工那天收店：不說「%s」（XSCLOSE.staffToday）' % (tag, LINE), w['worked'] and not any(x['t'] == LINE for x in Ls), J({'lines': Ls, 'now': {k: q[k] for k in ('zone', 'hour', 'stand')}}))
                except Exception as ex:
                    R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
