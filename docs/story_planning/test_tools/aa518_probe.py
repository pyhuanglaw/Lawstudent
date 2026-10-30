"""BB-B 10-30（v9.10.14 候選 92e9bca92；LAWWW-B 02:22 第 6 項）：AA_518（學姊在臺灣）朋友那一場、AA_516（學姊在美國）交往中那一場——照玩家走到她旁邊／手機響了按「接起來」、點對話、選選項（不是 Node）。
MODE（環境變數）：
  chishang  AA_518 1-4（C 有點熟）：2027-01-27（三，大二寒假）14:10 總圖閱覽區；【捷徑】認識學姊、有點熟（熟 30、不是交往中）→ 走到她旁邊（3 m）＝池上回來：
            「池上。……上禮拜去的。」「想看一個什麼都沒有的地方。看完了，回來讀書。」，選「那邊真的什麼都沒有？」＝「有風。還有一台腳踏車，是租的。」；A 才有的「你沒去過吧。」不出
  call      AA_516 2-1（A 交往中）：2028-08-03（四）21:50 宿舍；【捷徑】和學姊交往中、SIS_SENDOFF＝two（8/2 兩個人送機）→ 22:00 手機響了「接起來」＝
            「到了。說好的，打給你。」，選「累嗎？」＝「累。……可是睡不著。這邊才早上十點。」→「下週日開始，每個禮拜打。……這是第一通，不算。」；記 SIS14_CALL0803
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests MODE=<上面> python3 aa518_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'chishang')
J = lambda o: json.dumps(o, ensure_ascii=False)
SIS = 'heroine_05'
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
REL = """(([id,v,date])=>{ const G=GAME.G; for(const k in G.flags) if(k.indexOf('dating_')===0) G.flags[k]=false; if(G.flags.romance) for(const k in G.flags.romance) if(!date||k!==id) delete G.flags.romance[k];
  const r=SOCIAL.rel(id); Object.assign(r,v); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'lawlib'); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-200;
  if(date){ try{ ROM.start(G,id); }catch(e){} G.flags['dating_'+id]=true; }
  return {dating:!!G.flags['dating_'+id], partners:ROM.partners?ROM.partners(G):null, stage:DATE&&DATE.stageNum?DATE.stageNum(id):null}; })"""


async def play(pg, cdp, run, picks, stop_txt, max_s=600, day=None):
    t0 = time.time(); seen = []; picked = []; opts = []; n0s = await P.say_hook(pg)
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]): seen.append([s['name'], s['txt']])
        if s['ch']:
            opts.append([o['t'] for o in s['ch']]); k, pk = P.pick_of(s['ch'], picks, decline=False); picked.append(s['ch'][k]['t'])
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['phone']: await L.phone_away(pg, cdp); continue
        if (any(stop_txt in x[1] for x in seen) or await pg.evaluate("(([n,s])=>(window.__SAY||[]).slice(n).some(x=>x.t.indexOf(s)>=0))", [n0s, stop_txt])) and not s['busy']: break
        await pg.wait_for_timeout(1500)
    return [x[1] for x in P.clean(seen)] + [t for _, t in await P.said(pg, n0s)], opts, picked


async def main():
    run = L.Run('aa518_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await P.init(pg)
        key, h, zone = ('2027-01-27', 14.17, 'library') if MODE == 'chishang' else ('2028-08-03', 21.83, 'dorm')
        d = (await P.day_of(pg, key))['d']; fl = {}
        for k, kk in ROOMS:
            dd = (await P.day_of(pg, kk))['d']
            if dd <= d: fl[k] = dd
        if 'ROOM_Y3' in fl: fl.update({'ROOM_Y3_ITEMS': [], 'ROOM_Y3_DISCARD': None})
        if MODE == 'call': fl['SIS_SENDOFF'] = 'two'
        if not (SAVE.get('G', SAVE).get('flags') or {}).get('met_sis'): fl['met_sis'] = True   # 【捷徑】存檔還沒見過學姊（SISB15.y1Ok 看 met_sis）
        st, dd = await P.base(pg, SAVE, key, h, zone, flags=fl); await P.load(pg, cdp, st)
        run.setup('[前置] 使用者存檔 → %s %.2f %s；%s%s' % (key, h, zone, J(fl), '（SIS_SENDOFF＝【捷徑】8/2 兩個人送機）' if MODE == 'call' else ''))
        if MODE == 'chishang':
            r0 = await P.prep(pg, cdp, run, REL + "(%s)" % J([SIS, {'fam': 30, 'trust': 10, 'comf': 5, 'rom': 0, 'npcRom': 0}, False]), label='認識學姊、有點熟（不是交往中）')
            ok = await pg.evaluate("(()=>{ const X=typeof SISB15!=='undefined'?SISB15:null; return X&&X.y1Ok?!!X.y1Ok(GAME.G,'ev_sis15_chishang',GAME):null; })()")
            run.note('SISB15.y1Ok：%s' % J(ok))
            sw = await P.wait_present(pg, SIS, 60); run.note('學姊：%s' % J(sw))
            run.check('前置：寒假平日 14:00 學姊在總圖', bool(sw) and not sw['hidden'], J(sw))
            await P.events_on(pg)
            if sw:
                await L.go_to(pg, cdp, run, sw['x'], sw['z'] + 1.5, 1.2, '學姊旁邊', max_s=240, lv=sw['lv'], stop=lambda s: s['dlg'] or s['choices'] > 0)
            lines, opts, picked = await play(pg, cdp, run, ['「那邊真的什麼都沒有？」'], '有風。還有一台腳踏車', max_s=180)
            if not lines:   # 走到旁邊沒有自己開始＝照玩家按「和她說話」
                r = await P.talk_full(pg, cdp, run, SIS, 'chishang_talk', picks=['「那邊真的什麼都沒有？」'], max_s=240); lines = [t for _, t in (r or {}).get('lines', [])]; opts = (r or {}).get('opts', [])
            run.note('台詞 %s；選項 %s' % (J(lines), J(opts))); await run.shot(pg, 'chishang')
            for w in ('池上。……上禮拜去的。', '想看一個什麼都沒有的地方。看完了，回來讀書。', '有風。還有一台腳踏車，是租的。'):
                run.check('AA_518 1-4 有「%s」' % w, w in lines, J(lines))
            run.check('AA_518 1-4 不是交往中＝A 才有的「你沒去過吧。」不出', '你沒去過吧。' not in lines, J(lines))
        else:
            r0 = await P.prep(pg, cdp, run, REL + "(%s)" % J([SIS, {'fam': 70, 'trust': 55, 'comf': 50, 'npcRom': 70, 'rom': 60}, True]), label='只和學姊交往中')
            ok = await pg.evaluate("(()=>{ const X=typeof SISB14!=='undefined'?SISB14:null; return X&&X.callOk?!!X.callOk(GAME.G):null; })()")
            run.check('前置：SISB14.callOk（臺灣路線、交往中、兩個人送機）', ok is True, J(ok))
            await P.events_on(pg)
            lines, opts, picked = await play(pg, cdp, run, ['接起來', '「累嗎？」'], '這是第一通，不算', max_s=720)
            f = await pg.evaluate("GAME.G.flags.SIS14_CALL0803==null?null:GAME.G.flags.SIS14_CALL0803")
            run.note('台詞 %s；選項 %s；選了 %s；SIS14_CALL0803＝%s；%s' % (J(lines), J(opts), J(picked), J(f), J(await P.clock(pg)))); await run.shot(pg, 'call0803')
            run.check('AA_516 2-1 22:00 手機響了、有「接起來」', any(any(o.startswith('接起來') for o in os_) for os_ in opts), J(opts))
            for w in ('到了。說好的，打給你。', '累。……可是睡不著。這邊才早上十點。', '下週日開始，每個禮拜打。……這是第一通，不算。'):
                run.check('AA_516 2-1 有「%s」' % w, w in lines, J(lines))
            run.check('AA_516 2-1 記 SIS14_CALL0803', f is True, J(f))
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
