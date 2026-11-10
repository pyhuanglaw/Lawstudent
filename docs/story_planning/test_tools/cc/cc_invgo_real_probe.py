"""CC（帳號 A）11-10：X290 一鍵前往（INV-GO-JUMP-1110，ed75c456a；BB 17:12 P0【下一版必須】，候選 70e23b32c）——真實玩家走一次。
【前置／捷徑】讀 day46 存檔（fixtures/user_saves_1107，已在 repo）→ 那一天 08:00、清邀約、WHO（預設 heroine_01）關係到朋友、錢 3000、去過 PLACES（G.visited）。
之後全部觸控：手機「朋友」→ 她 → 分類 → 一間 10:00 才開的店（從 INV.place 找：wz_books／wz_tea／bikeshop…，照 PLACES 的營業時間挑那一天 10:00 開的）→ 選「今天」最早的時間
→ 手機「今天」那一筆按「前往」（[data-invgo]）→ 一路點對話／選第一個選項，直到到了那家店、她出現或見面開始。
記：按「前往」前後的 GAME.G.hour、到達時 G.zone／hour、她在不在（GAME.npc[她]）、所有 toast（GAME.toast）、字幕（GAME.caption）、對話（GAME.say）原文；截圖（約好、按前往前、到達）。
要看到：時間先跳到出發時間；到的時候是她到的時間或店開門那一刻；全程不能出現「還沒開」「時間還沒到」。Playwright（PC GPU）≠ iPhone。
用法：LW_TESTS=<wt>/tests [WHO=heroine_01] python3 cc_invgo_real_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
WHO = os.environ.get('WHO') or 'heroine_01'; pe.WHO = WHO
R = L.Run('invgo_real', OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
CAND = ['bookstore', 'afar', 'aoki', 'slowread']   # 去過（visited 用 zone）：頁間書屋 hrs [10,22]＝10:00 才開
HOOK = r"""(()=>{ if(window.__IG) return; window.__IG=[]; const P=(k,v)=>{ try{ window.__IG.push({k, v:String(v||''), h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}); }catch(e){} };
  for(const [n,k] of [['toast','toast'],['caption','cap'],['say','say']]){ const f=GAME[n]; if(typeof f!=='function') continue; GAME[n]=function(a,b){ P(k, n==='toast'?a:(n==='caption'?((a?a+'｜':'')+b):(((a&&a.name)||'')+'｜'+b))); return f.apply(this,arguments); }; } })()"""


def state(day_wd):
    s = json.load(open(SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    s['hour'] = 8.0; s['invites'] = []; s['money'] = 3000
    soc = copy.deepcopy(s.get('social') or {}); r = soc.setdefault('rel', {}).setdefault(WHO, {})
    r['fam'] = max(r.get('fam', 0), 50); r['trust'] = max(r.get('trust', 0), 35); r['comf'] = max(r.get('comf', 0), 30); s['social'] = soc
    v = dict(s.get('visited') or {})
    for z in CAND: v[z] = v.get(z) or 1
    s['visited'] = v
    return s


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X290 一鍵前往（真實玩家）：worktree %s；WHO %s；Playwright ≠ iPhone' % (real or '?', WHO), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        await L.load_state(pg, state(None), quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30)
        R.setup('【前置／捷徑】day46 存檔 08:00、清邀約、%s 朋友（fam≥50 trust≥35 comf≥30）、錢 3000、去過 %s' % (WHO, J(CAND)))
        await pg.evaluate(HOOK)
        pl = await pg.evaluate("""(()=>{ const G=GAME.G; const ps=(typeof INVITE_DATA!=='undefined'&&INVITE_DATA.places)||[];   /* r2：邀約地點的營業時間在 INVITE_DATA.places[].hours（r3：欄位名是 hours，r2 寫成 hrs＝list 空；PLACES 查不到，r1 會一間都找不到） */
            return {day:G.day, list:ps.filter(p=>Array.isArray(p.hours)).map(p=>({id:p.id, name:p.name, zone:p.zone, open:p.hours[0], close:p.hours[1]}))}; })()""")
        R.note('候選店（那一天的開門時間）：%s' % J(pl))
        tgt = next((q for q in pl['list'] if q['name'] and q['open'] == 10), None) or next((q for q in pl['list'] if q['name'] and q['open'] and q['open'] >= 10), None)
        if not R.check('找到一間 10:00 才開、約得到的店', bool(tgt), J(pl)): await b.close(); return
        top = await (pe.phone(pg, cdp, 'friends'))
        if not await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % WHO): R.check('手機朋友頁有她', False, ''); await b.close(); return
        await pg.wait_for_timeout(1500)
        cats = await pe.opts(pg); R.note('邀約第一層：%s' % J(cats))
        cat = next((c for c in cats if tgt['name'] and tgt['name'][:3] in c['t'] and not c['dim']), None)
        if not R.check('有一個分類列了「%s」' % tgt['name'], bool(cat), J(cats)): await b.close(); return
        await pe.choose(pg, cdp, cat['t'][:4], True); o = await pe.opts(pg); R.note('分類「%s」：%s' % (cat['t'][:6], J(o)))
        pc = next((x for x in o if tgt['name'][:3] in x['t']), None)
        if not R.check('選得到「%s」' % tgt['name'], bool(pc) and not pc['dim'], J(o)): await b.close(); return
        await pe.choose(pg, cdp, pc['t'], True); o = await pe.opts(pg); R.note('時間選單：%s' % J(o))
        tm = next((x for x in o if x['t'].startswith('今天') and not x['dim']), None)
        if not R.check('今天有能選的時間', bool(tm), J(o)): await b.close(); return
        await pe.choose(pg, cdp, tm['t'], True)
        log = []; await pe.settle(pg, cdp, log, 30)
        iv = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day&&v.state!=='done').map(v=>({id:v.id,h:v.h,place:v.place,state:v.state})))(%s)" % J(WHO))
        await pg.screenshot(path=os.path.join(OUT, 'invgo_1_booked.png'))
        R.note('約好：%s；對話 %s' % (J(iv), J(log[-5:])))
        if not R.check('約成了（今天 %s）' % tm['t'], bool(iv), J(log[-5:])): await b.close(); return
        v = iv[-1]
        body = await pe.phone(pg, cdp, 'today'); h0 = await pg.evaluate("+(+GAME.G.hour).toFixed(3)")
        await pg.screenshot(path=os.path.join(OUT, 'invgo_2_today_tab.png'))
        R.note('手機「今天」：%s；現在 %.3f 時' % (body[:400], h0))
        if not R.check('手機「今天」那一筆有「前往」', await pe.tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % v['id']), body[:300]): await b.close(); return
        t0 = time.time(); arrived = None; met = None
        while time.time() - t0 < 300:
            q = await L.state(pg)
            if q['choices']:
                o = await pe.opts(pg); await pe.choose(pg, cdp, o[0]['t'], True); continue
            if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            st = await pg.evaluate("((w,id)=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); const P=INV.place(v&&v.place); const n=GAME.npc&&GAME.npc[w]; return {zone:GAME.G.zone, want:P&&P.zone, h:+(+GAME.G.hour).toFixed(3), st:v&&v.state, ph:v&&v.lead&&v.lead.ph, her:!!n, herHidden:!!(n&&n.obj&&!n.obj.visible)}; })(%s,%s)" % (J(WHO), J(v['id'])))
            if st['zone'] == st['want'] and not arrived: arrived = st; await pg.screenshot(path=os.path.join(OUT, 'invgo_3_arrived.png'))
            if arrived and st['st'] in ('met', 'done', 'over'): met = st; break
            if arrived and time.time() - t0 > 60 and not q['busy']: break
            await pg.wait_for_timeout(600)
        ev = await pg.evaluate("window.__IG||[]")
        json.dump(ev, open(os.path.join(OUT, 'invgo_log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        R.note('按「前往」以後 toast／字幕／對話（%d 筆）：%s' % (len(ev), J(ev[-30:])))
        R.note('到達：%s；見面：%s；約的時間 %.2f；按前往時 %.3f' % (J(arrived), J(met), v['h'], h0))
        R.check('到了那家店（區域＝%s）' % (arrived and arrived['want']), bool(arrived), J(arrived))
        R.check('到達時間不早於約的時間／開門時間（%.2f）' % max(v['h'], tgt['open'] or 0), bool(arrived) and arrived['h'] >= max(v['h'], tgt['open'] or 0) - 0.02, J(arrived))
        bad = [e for e in ev if any(w in e['v'] for w in ('還沒開', '時間還沒到', '還沒到'))]
        R.check('全程沒有「還沒開」「時間還沒到」', not bad, J(bad))
        R.check('她在（到達後 GAME.npc 有她）', bool(arrived) and (arrived['her'] or (met and met['her'])), J({'arrived': arrived, 'met': met}))
        R.check('walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
