"""BB-B 2026-11-07：一起念書第 6 次解鎖的「她那一格」（AA_722；LAWWW-B 19a06b1be＋3b8ebd13e，src/studyslot3d.js）瀏覽器驗收。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】DAYSHIFT 天（預設 -12＝2025-10-20 週一）下午 3 點、清邀約、錢 1000；【捷徑】她的關係到朋友；
  【前置／捷徑】直接設她第 6 次的旗標（AN_STUDY_SHOP／ZQ_STUDY_LUWEI…＝LAWWW-B 給的捷徑）。其他全部觸控。
SLOT=an_shop1（3D 店：以安・小路，一次性）：
  ① 解鎖前「吃飯」沒有那一格；設旗標以後有；② 選今天的時間 → 答應句（AA_722 acc）；③ 前往小路 → 那一場（first）照稿演；
  ④ 扣 200、記 AN_SHOP1_DONE、STUDYSLOT n=1；⑤ 演完以後選單不再列那一格（一次性）。
SLOT=zq_luwei（沒場景：子晴・公館滷味，可以重複）：
  ① 設旗標以後「吃飯」有「公館滷味」；② 選今天 19:00 → 答應句 → 變成排好的出遊（OUT 有 slot、邀約清單裡沒有這筆）、選單不再重複列；
  ③ 【捷徑】時間撥到出發前 → 「出發」→ first 照稿演（背景 gongguan_luwei）→ 第一次她請（不扣錢）→ 演完人在公館商圈；
  ④ 隔天再約一次 → 演 rot 第 0 組（不是 first）→ 扣 120。
用法：LW_TESTS=<測試樹>/tests SLOT=an_shop1 python3 pt1107j_studyslot_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt1107e_arcs_probe.py'))
pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SLOT = os.environ.get('SLOT', 'an_shop1')
SHIFT = int(os.environ.get('DAYSHIFT', '-12'))
NODATE = os.environ.get('NODATE', '1') == '1'
core = lambda t: (t or '').replace('（小聲）', '').strip('（）「」 ')[:9]


def base_state(who, flag):
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s); s['day'] = s['day'] + SHIFT; s['weekday'] = ((s.get('weekday') or 0) + SHIFT) % 7;   # 撥日子也要撥 G.weekday（invites3d wdOf 從它算；不撥＝週一被當成週六，BB-B 10:0x 自己的 TEST_BUG）
    s['hour'] = 15.0; s['invites'] = []; s['money'] = 1000
    f = dict(s.get('flags') or {}); f.pop('STUDYSLOT', None); f.pop('AN_SHOP1_DONE', None)
    if NODATE:   # 【捷徑】沒有交往對象（使用者存檔在和可昕交往、以安知道＝吃飯類被 partnerBlock 擋，照設計）
        for k in [k for k in f if k.startswith('dating_')]: f[k] = False
        rm = dict(f.get('romance') or {})
        for k, v in list(rm.items()): rm[k] = dict(v or {}, status='none', knows=[])
        f['romance'] = rm
    if flag: f[flag] = s['day'] - 1
    s['flags'] = f
    soc = dict(s.get('social') or {}); rel = dict(soc.get('rel') or {}); r = dict(rel.get(who) or {})
    r['fam'] = max(r.get('fam', 0), 50); r['trust'] = max(r.get('trust', 0), 35); r['comf'] = max(r.get('comf', 0), 30)
    rel[who] = r; soc['rel'] = rel; s['social'] = soc
    cs = dict(s.get('contacts') or {})
    if who not in cs:   # 【捷徑】使用者存檔還沒認識子晴（沒有 met、不在聯絡人）：手機約不到她
        cs[who] = 2; s['contacts'] = cs; f = dict(s['flags']); f['met_' + who] = True; s['flags'] = f
    return s


async def load(pg, cdp, s):
    await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 40)


async def back_out(pg, cdp):
    for _ in range(8):
        o = await pe.opts(pg)
        if not o: break
        b = next((x['t'] for x in o if x['t'] in ('返回', '算了', '不約了', '換一天', '取消', '先不要') or x['t'].startswith('返回')), None)
        if not b: break   # 找不到「返回」就不亂按（以前退回最後一個選項，會不小心約成：BB-B 10:5x 自己的 TEST_BUG）
        await pe.choose(pg, cdp, b, True)
    await pe.close_phone(pg, cdp); await pe.settle(pg, cdp, [], 10)


async def cat_list(pg, cdp, who, cat):
    await pe.phone(pg, cdp, 'friends')
    if not await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who): return None
    await pg.wait_for_timeout(1500)
    if not await pe.choose(pg, cdp, cat): return []
    return await pe.opts(pg)


async def invite(pg, cdp, run, sl, tag):
    """約那一格（選單 → 地點 → 今天的時間），回傳 (選到的時間字, 說過的話)"""
    lst = await cat_list(pg, cdp, sl['who'], sl['cat'])
    item = next((x for x in (lst or []) if sl['name'][:4] in x['t']), None)
    run.check('[%s] 「%s」有「%s」（沒灰掉）' % (tag, sl['cat'], sl['name']), bool(item) and not item['dim'], json.dumps([x['t'] for x in (lst or [])], ensure_ascii=False))
    if not item: await back_out(pg, cdp); return None, []
    await pe.choose(pg, cdp, sl['name'][:4])
    t = await pe.opts(pg)
    pick = next((x for x in t if x['t'].startswith('今天') and not x['dim']), None) or next((x for x in t if not x['dim'] and any(c.isdigit() for c in x['t'])), None)
    run.check('[%s] 有可以選的時間' % tag, bool(pick), json.dumps(t, ensure_ascii=False))
    if not pick: await back_out(pg, cdp); return None, []
    await pe.choose(pg, cdp, pick['t'], True)
    log = []; await pe.settle(pg, cdp, log, 30)
    msgs = await pg.evaluate("(w=>(GAME.G.msgs||[]).filter(m=>m.from===w).slice(-3).map(m=>m.text))(%s)" % json.dumps(sl['who']))
    return pick['t'], log + msgs


async def go_out(pg, cdp, run, sl, tag):
    """排好的出遊：時間撥到出發前 → 出發 → 收台詞"""
    q = await pg.evaluate("(id=>(OUT.rec(GAME.G)||[]).filter(x=>x.slot===id&&x.state==='planned').map(x=>({id:x.id,day:x.day,h:x.h,ev:x.ev})))(%s)" % json.dumps(SLOT))
    if not q: return None, None
    o = q[-1]
    run.setup('[%s]【捷徑】時間撥到出發前（第 %s 天 %.2f）' % (tag, o['day'], o['h'] - 0.2))
    await pg.evaluate("(()=>{ window.__money=[]; if(GAME.money&&!GAME.__mW){ const f=GAME.money; GAME.money=function(v,why){ try{ window.__money.push({v,why}); }catch(e){} return f.apply(this,arguments); }; GAME.__mW=1; } if(typeof ADV!=='undefined'&&Array.isArray(ADV.history)) ADV.history.length=0; })()")
    await pg.evaluate("((d,h)=>{ GAME.G.day=d; GAME.G.hour=h; })(%d,%f)" % (o['day'], o['h'] - 0.2))
    said, went = [], False
    for _ in range(240):
        st = await L.state(pg)
        if st['dtext'] and (not said or said[-1] != st['dtext']): said.append(st['dtext'])
        q2 = await pg.evaluate("(id=>(OUT.rec(GAME.G)||[]).filter(x=>x.id===id).map(x=>x.state)[0]||null)(%s)" % json.dumps(o['id']))
        if q2 and q2 != 'planned' and went and not st['dlg'] and not st['busy'] and not st['choices']: break
        if st['choices']:
            ops = await pe.opts(pg); ts = [x['t'] for x in ops]
            g = next((x for x in ts if x.startswith('出發')), None)
            if g: went = True; said.append('選項：' + '｜'.join(ts) + ' → ' + g); await pe.choose(pg, cdp, g, True); continue
            said.append('選項：' + '｜'.join(ts) + ' → ' + ts[0]); await pe.choose(pg, cdp, ts[0], True); continue
        if st['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.map(x=>(x.name||'')+'｜'+x.text):[]")
    run.check('[%s] 跳出「出發」而且按了' % tag, went, json.dumps(said[:6], ensure_ascii=False))
    return said + hist, o


async def run_an(pg, cdp, run):
    sl = {'who': 'heroine_01', 'cat': '吃飯', 'name': '小路（她手帳上的第一家）', 'flag': 'AN_STUDY_SHOP'}
    data = await pg.evaluate("STUDYSLOT.get('an_shop1')")
    s0 = base_state(sl['who'], None); await load(pg, cdp, s0)
    run.setup('【捷徑】沒設 AN_STUDY_SHOP（還沒念完第 6 次）')
    lst = await cat_list(pg, cdp, sl['who'], '吃飯')
    run.check('① 解鎖前「吃飯」沒有「小路（她手帳上的第一家）」', not any('手帳' in x['t'] for x in (lst or [])), json.dumps([x['t'] for x in (lst or [])], ensure_ascii=False))
    await back_out(pg, cdp)
    s1 = base_state(sl['who'], sl['flag']); await load(pg, cdp, s1)
    run.setup('【前置／捷徑】設 AN_STUDY_SHOP（念完第 6 次）')
    pe.WHO = sl['who']; pe.GO_EARLY = -0.01   # 小路 18:00 才開門：17:50 按「前往」會說還沒開（quickGo st.open），撥到 18:00 再按
    await pg.evaluate("(()=>{ window.__money=[]; if(GAME.money&&!GAME.__mW){ const f=GAME.money; GAME.money=function(v,why){ try{ window.__money.push({v,why}); }catch(e){} return f.apply(this,arguments); }; GAME.__mW=1; } })()")
    said, picked = await pe.meet_once(pg, cdp, run, '吃飯', '手帳', '小路')
    hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.map(x=>(x.name||'')+'｜'+x.text):[]")
    msgs = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.from==='heroine_01').slice(-3).map(m=>m.text)")
    allt = (said or []) + hist + msgs
    run.check('② 答應句「%s」' % data['acc'][0], any(core(data['acc'][0]) in x for x in allt), json.dumps({'said': (said or [])[:6], 'msgs': msgs}, ensure_ascii=False))
    miss = [t for t in data['first'] if not any(core(t) in x for x in allt)]
    run.check('③ 小路那一場 %d 句照稿演' % len(data['first']), said is not None and not miss, json.dumps({'miss': miss, 'hist': hist[-12:]}, ensure_ascii=False))
    st = await pg.evaluate("({money:GAME.G.money, log:window.__money||[], done:(GAME.G.flags||{}).AN_SHOP1_DONE, rec:(GAME.G.flags||{}).STUDYSLOT||null, zone:GAME.G.zone})")
    paid = [x for x in st['log'] if x['v'] == -200]
    run.check('④ 扣 200、記 AN_SHOP1_DONE、STUDYSLOT n=1', len(paid) == 1 and st['done'] is not None and ((st['rec'] or {}).get('an_shop1') or {}).get('n') == 1, json.dumps(st, ensure_ascii=False))
    await run.shot(pg, 'an_shop1_after')
    lst = await cat_list(pg, cdp, sl['who'], '吃飯')
    run.check('⑤ 演完以後不再列（一次性；選單要真的打開）', bool(lst) and not any('手帳' in x['t'] for x in (lst or [])), json.dumps([x['t'] for x in (lst or [])], ensure_ascii=False))
    await back_out(pg, cdp)


async def run_zq(pg, cdp, run):
    sl = {'who': 'heroine_04', 'cat': '吃飯', 'name': '公館滷味', 'flag': 'ZQ_STUDY_LUWEI'}
    data = await pg.evaluate("STUDYSLOT.get('zq_luwei')")
    s1 = base_state(sl['who'], sl['flag']); await load(pg, cdp, s1)
    run.setup('【前置／捷徑】設 ZQ_STUDY_LUWEI（念完第 6 次）')
    pe.WHO = sl['who']
    t, log = await invite(pg, cdp, run, sl, '第 1 次')
    if t is None: return
    allt = log
    run.check('② 答應句「%s」' % data['acc'][0], any(core(data['acc'][0]) in x for x in allt), json.dumps(allt[-6:], ensure_ascii=False))
    p = await pg.evaluate("(()=>({out:(OUT.rec(GAME.G)||[]).filter(x=>x.slot==='zq_luwei').map(x=>({id:x.id,day:x.day,h:x.h,state:x.state,ev:x.ev})), inv:(GAME.G.invites||[]).filter(v=>v.place==='slot_zq_luwei').map(v=>v.state)}))()")
    run.check('② 變成排好的出遊（OUT 有 slot、邀約清單沒有這筆）', bool(p['out']) and p['out'][-1]['state'] == 'planned' and not [x for x in p['inv'] if x in ('accepted', 'pending')], json.dumps(p, ensure_ascii=False))
    await pe.close_phone(pg, cdp)
    lst = await cat_list(pg, cdp, sl['who'], '吃飯')
    run.check('② 已經約好的不重複列', not any('公館滷味' in x['t'] for x in (lst or [])), json.dumps([x['t'] for x in (lst or [])], ensure_ascii=False))
    await back_out(pg, cdp)
    allt, o = await go_out(pg, cdp, run, sl, '第 1 次')
    if allt is None: run.check('③ 有排好的出遊可以出發', False); return
    miss = [x for x in data['first'] if not any(core(x) in y for y in allt)]
    run.check('③ 第一次那一場 %d 句照稿演' % len(data['first']), not miss, json.dumps({'miss': miss, 'tail': allt[-12:]}, ensure_ascii=False))
    st = await pg.evaluate("({money:GAME.G.money, log:window.__money||[], zone:GAME.G.zone, rec:((GAME.G.flags||{}).STUDYSLOT||{}).zq_luwei||null, bg:(typeof ADV!=='undefined'&&ADV.curBg)?String(ADV.curBg):null})")
    run.check('③ 第一次她請（沒有扣 120）', not [x for x in st['log'] if x['v'] == -120], json.dumps(st, ensure_ascii=False))
    run.check('③ 演完人在公館（%s）' % st['zone'], st['zone'] in ('gongguan',), json.dumps(st, ensure_ascii=False))
    await run.shot(pg, 'zq_luwei_after1')
    run.setup('【捷徑】隔天下午 3 點')
    await pg.evaluate("(()=>{ GAME.G.day+=1; GAME.G.hour=15; })()"); await pg.wait_for_timeout(1500); await pe.settle(pg, cdp, [], 30)
    t, log = await invite(pg, cdp, run, sl, '第 2 次')
    if t is None: return
    await pe.close_phone(pg, cdp)
    allt, o = await go_out(pg, cdp, run, sl, '第 2 次')
    if allt is None: run.check('④ 第 2 次有排好的出遊', False); return
    r0 = data['rot'][0]
    miss = [x for x in r0 if not any(core(x) in y for y in allt)]
    first_hit = any(core(data['first'][0]) in y for y in allt)
    run.check('④ 第 2 次演 rot 第 0 組（不是 first）', not miss and not first_hit, json.dumps({'miss': miss, 'first_hit': first_hit, 'tail': allt[-10:]}, ensure_ascii=False))
    st = await pg.evaluate("({money:GAME.G.money, log:window.__money||[], rec:((GAME.G.flags||{}).STUDYSLOT||{}).zq_luwei||null})")
    run.check('④ 第 2 次扣 120', len([x for x in st['log'] if x['v'] == -120]) == 1, json.dumps(st, ensure_ascii=False))
    await run.shot(pg, 'zq_luwei_after2')


async def run_an_alone(pg, cdp, run):
    """使用者存檔原樣：和可昕交往、以安知道（AA_722 897ddd17e partnerBlock，LAWWW-B b0c8fbf26）"""
    s1 = base_state('heroine_01', 'AN_STUDY_SHOP'); await load(pg, cdp, s1)
    run.setup('【前置／捷徑】設 AN_STUDY_SHOP；交往狀態照使用者存檔（和可昕交往、以安知道）')
    pe.WHO = 'heroine_01'
    kn = await pg.evaluate("(()=>({knows:(typeof ROM!=='undefined'&&ROM.knows)?ROM.knows(GAME.G,'heroine_01'):null, dk:(GAME.G.flags||{}).dating_kexin}))()")
    print('   交往狀態', json.dumps(kn, ensure_ascii=False), flush=True)
    seen = []
    for cat in ('吃飯', '念書', '喝咖啡'):
        lst = await cat_list(pg, cdp, 'heroine_01', cat)
        seen += [x['t'] for x in (lst or [])]
        await back_out(pg, cdp)
    run.check('① 交往中、她知道：選單裡沒有「小路（她手帳上的第一家）」', not any('手帳' in t for t in seen), json.dumps(seen, ensure_ascii=False)[:600])
    await pg.evaluate("(()=>{ if(typeof ADV!=='undefined'&&Array.isArray(ADV.history)) ADV.history.length=0; })()")
    said, _ = await pe.meet_once(pg, cdp, run, '念書', '總圖', '念書')
    hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.map(x=>(x.name||'')+'｜'+x.text):[]")
    allt = (said or []) + hist
    want = ['你有女朋友。……第一家，我就不約你了。', '我昨天自己去了。點了今天的定食。原來只要這樣說就好。']
    miss = [w for w in want if not any(core(w) in x for x in allt)]
    f = await pg.evaluate("((GAME.G.flags||{}).AN_SHOP1_DONE)")
    run.check('② 解鎖後第一次見面她說那兩句', said is not None and not miss, json.dumps({'miss': miss, 'hist': hist[-14:]}, ensure_ascii=False))
    run.check('② 記 AN_SHOP1_DONE＝alone（%s）' % f, f == 'alone', json.dumps(f))
    st = await pg.evaluate("(()=>{ const r=ARCS.rec(GAME.G,'heroine_01'); return {k:r.k}; })()")
    print('   以安故事線', json.dumps(st), flush=True)
    await run.shot(pg, 'an_alone_after')


async def main():
    run = L.Run('pt1107j_' + SLOT, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀使用者存檔 day46；【捷徑】day %+d 下午 3 點、清邀約、錢 1000、關係到朋友%s' % (SHIFT, '；【捷徑】沒有交往對象（存檔原本和可昕交往）' if NODATE else ''))
        has = await pg.evaluate("typeof STUDYSLOT!=='undefined'&&!!STUDYSLOT.get(%s)" % json.dumps('an_shop1' if SLOT == 'an_alone' else SLOT))
        run.check('這一版有 STUDYSLOT %s' % SLOT, has)
        if has:
            if SLOT == 'an_shop1': await run_an(pg, cdp, run)
            elif SLOT == 'zq_luwei': await run_zq(pg, cdp, run)
            elif SLOT == 'an_alone': await run_an_alone(pg, cdp, run)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
