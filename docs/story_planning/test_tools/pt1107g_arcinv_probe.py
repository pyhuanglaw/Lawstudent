"""BB-B 2026-11-07：故事線的「下次帶你去」變成真的約（AA_716，LAWWW-B fd878c557 src/arcinv3d.js）瀏覽器驗收。
例：學姊第 3 拍（閉館以後騎車）：當天演完 → 21:30 她傳訊息「今天閉館以後，可以嗎。」→ 回「好，我騎車過去。」→ 排進行程 → 22:00 出發 → 演那一場（SIS_ARC_BIKE）。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】DAYSHIFT 天（預設 -14＝10/18）、清掉邀約、清掉 ARCINV／ARC_INVITE、WHO 的故事線從第 K 拍開始；
  【捷徑】時間撥到她傳訊息前、出發前。其他全部觸控：約念書 → 前往 → 演那一拍 → 手機「訊息」→ 她的對話串 → 按回覆 → 「出發」。
看：① 那一拍演了、ARC_INVITE 記那一拍；② 到時間她傳訊息（最後一則有三個回覆）；③ 回 PICK（預設 0＝this）→ ARCINV st planned、OUT 排了那一場；
  ④ 時間到跳「出發」→ 演那一場（第一句、她說的話出現）→ st done、set 旗標；⑤ 沒有 JS 例外。
用法：LW_TESTS=<測試樹>/tests WHO=heroine_05 K=3 PICK=0 python3 pt1107g_arcinv_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt1107e_arcs_probe.py'))
pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHO = os.environ.get('WHO', 'heroine_05'); pe.WHO = WHO
K = int(os.environ.get('K', '3'))
PICK = int(os.environ.get('PICK', '0'))
SHIFT = int(os.environ.get('DAYSHIFT', '-14'))
KEY = '%s:%d' % (WHO, K)


async def arc_state(pg):
    return await pg.evaluate("((w,k)=>{ const f=GAME.G.flags||{}; const r=(f.ARCINV||{})[k]||null; const outs=(typeof OUT!=='undefined'&&OUT.rec)?OUT.rec(GAME.G).filter(q=>q.arcinv===k).map(q=>({id:q.id,day:q.day,h:q.h,state:q.state})):null; return {rec:r, inv:(f.ARC_INVITE||{})[w]||null, beats:(f.BEATS||{})[w]||null, outs, day:GAME.G.day, hour:+GAME.G.hour.toFixed(2), zone:GAME.G.zone}; })(%s,%s)" % (json.dumps(WHO), json.dumps(KEY)))


async def main():
    run = L.Run('pt1107g', OUT)
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s); s['day'] = s['day'] + SHIFT; s['invites'] = []
    f = dict(s.get('flags') or {})
    for x in ('ARCINV', 'ARC_INVITE'): f.pop(x, None)
    B = dict(f.get('BEATS') or {}); B[WHO] = {'k': K, 'last': None, 'ans': {}, 'missed': []}; f['BEATS'] = B; s['flags'] = f
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀使用者存檔 day46；【捷徑】day %+d、清邀約、清 ARCINV／ARC_INVITE；【捷徑】%s 的故事線從第 %d 拍開始' % (SHIFT, WHO, K))
        await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3500); await pe.settle(pg, cdp, [], 60)
        e = await pg.evaluate("(k=>{ const e=(typeof ARCINV!=='undefined'&&ARCINV.get)?ARCINV.get(k):null; return e?{msgs:e.msgs, opts:e.opts.map(o=>({t:o.t,plan:o.plan,say:o.say})), lines:(e.scene||e.lines||[]).slice(), set:e.set, end:e.end||null, h:e.h, day:e.day, offer:e.offer, title:e.title}:null; })(%s)" % json.dumps(KEY))
        run.check('這一版有 ARCINV、%s（%s）' % (KEY, e and e['title']), bool(e), json.dumps(e, ensure_ascii=False)[:500])
        if not e: await b.close(); return run.finish()
        st0 = await pg.evaluate("(w=>({stageNum:DATE.stageNum(w), stage:INV.stageOf(GAME.G,w)}))(%s)" % json.dumps(WHO))
        print('   關係', st0, flush=True)
        # ① 約念書、演那一拍
        said, picked = await pe.meet_once(pg, cdp, run, '念書', '總圖', '第1天')
        a1 = await arc_state(pg)
        run.check('① 第 %d 拍演了（k %d→%s）、ARC_INVITE 記這一拍' % (K, K, (a1['beats'] or {}).get('k')), (a1['beats'] or {}).get('k') == K + 1 and bool(a1['inv']) and str(K) in json.dumps(a1['inv']), json.dumps({'a': a1, 'said': (said or [])[-10:]}, ensure_ascii=False))
        print('   演完', json.dumps(a1, ensure_ascii=False)[:400], flush=True)
        # ② 等她傳訊息
        # ARCINV 的紀錄是下一次 tick 才建（st wait→offer＝排進 PHONE 佇列，還沒送）；等紀錄有 sc.offer 再撥時間
        a2 = a1
        for _ in range(30):
            a2 = await arc_state(pg)
            if ((a2['rec'] or {}).get('sc') or {}).get('offer'): break
            await pg.wait_for_timeout(1000)
        off = ((a2['rec'] or {}).get('sc') or {}).get('offer') or {}
        run.check('② 演完排了她傳訊息的時間（ARCINV st %s、offer %s）' % ((a2['rec'] or {}).get('st'), off), bool(off), json.dumps(a2, ensure_ascii=False)[:500])
        if off and (a2['day'] * 24 + a2['hour']) < off['d'] * 24 + off['h'] - 0.08:
            run.setup('【捷徑】時間撥到她傳訊息的前 5 分鐘（第 %s 天 %.2f）' % (off.get('d'), off.get('h', 0) - 0.08))
            await pg.evaluate("((d,h)=>{ GAME.G.day=d; GAME.G.hour=h; })(%d,%f)" % (off['d'], off['h'] - 0.08))
        MSGJS = "(w=>(GAME.G.msgs||[]).filter(m=>m.from===w||(m.th===('p:'+w))).slice(-6).map(m=>({t:m.text,ask:!!m.ask,id:m.ask&&m.ask.id,day:m.day,h:m.h})))(%s)" % json.dumps(WHO)
        msgs = []
        for _ in range(90):
            msgs = await pg.evaluate(MSGJS)
            if any(m.get('id') == 'arcinv:' + KEY for m in msgs): break
            await pg.wait_for_timeout(1000)
        a2 = await arc_state(pg)
        run.check('② 她傳訊息了（ARCINV st offer、最後一則有回覆 arcinv:%s）' % KEY, (a2['rec'] or {}).get('st') == 'offer' and any(m.get('id') == 'arcinv:' + KEY for m in msgs) and any(e['msgs'][0][:6] in (m['t'] or '') for m in msgs), json.dumps({'rec': a2['rec'], 'msgs': msgs}, ensure_ascii=False)[:700])
        # ③ 手機回覆
        await pe.phone(pg, cdp, 'msg')
        ok_th = await pe.tap_sel(pg, cdp, '#phoneBody [data-th="p:%s"]' % WHO); await pg.wait_for_timeout(1200)
        await run.shot(pg, 'arcinv_msg')
        ok_ans = await pe.tap_sel(pg, cdp, '#phoneBody [data-ask="arcinv:%s|%d"]' % (KEY, PICK)); await pg.wait_for_timeout(1500)
        run.check('③ 手機對話串裡按「%s」' % e['opts'][PICK]['t'], bool(ok_th) and bool(ok_ans), json.dumps({'th': ok_th, 'ans': ok_ans}))
        if hasattr(pe, 'close_phone'): await pe.close_phone(pg, cdp)
        await pe.settle(pg, cdp, [], 20)
        a3 = await arc_state(pg)
        plan = e['opts'][PICK]['plan']
        if plan in ('this', 'next', 'late'):
            run.check('③ 排進行程（ARCINV st planned、OUT 有這一場）', (a3['rec'] or {}).get('st') == 'planned' and bool(a3['outs']), json.dumps(a3, ensure_ascii=False)[:600])
        else:
            run.check('③ 回「%s」＝不排（st none）' % e['opts'][PICK]['t'], (a3['rec'] or {}).get('st') == 'none', json.dumps(a3, ensure_ascii=False)[:600])
            run.check('⑤ 沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False)); await b.close(); return run.finish()
        # ④ 出發、演那一場
        o = (a3['outs'] or [{}])[0]
        if 'day' not in o:
            run.check('⑤ 沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False)); await b.close(); return run.finish()
        await pg.evaluate("(()=>{ window.__caps=[]; if(GAME.caption&&!GAME.__capW){ const f=GAME.caption; GAME.caption=function(w,t){ try{ window.__caps.push(String(t)); }catch(e){} return f.apply(this,arguments); }; GAME.__capW=1; } })()")   # 只記字幕，不改行為
        run.setup('【捷徑】時間撥到出發前（第 %s 天 %.2f）' % (o.get('day'), o.get('h', 0) - 0.2))
        await pg.evaluate("((d,h)=>{ GAME.G.day=d; GAME.G.hour=h; })(%d,%f)" % (o['day'], o['h'] - 0.2))
        said4, went = [], False
        for _ in range(240):
            q = await L.state(pg)
            if q['dtext'] and (not said4 or said4[-1] != q['dtext']): said4.append(q['dtext'])
            a4 = await arc_state(pg)
            if (a4['rec'] or {}).get('st') == 'done' and not q['dlg'] and not q['busy'] and not q['choices']: break
            if q['choices']:
                ops = await pe.opts(pg); ts = [x['t'] for x in ops]
                go = next((t for t in ts if t.startswith('出發')), None)
                if go: went = True; said4.append('選項：' + '｜'.join(ts) + ' → ' + go); await pe.choose(pg, cdp, go, True); continue
                said4.append('選項：' + '｜'.join(ts) + ' → ' + ts[0]); await pe.choose(pg, cdp, ts[0], True); continue
            if q['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.map(x=>(x.name||'')+'｜'+x.text):[]")
        allt = said4 + hist
        first = e['lines'][0].strip('（）「」')[:10] if e['lines'] else ''
        core = lambda t: t.strip('（）「」')[:9]
        miss = [t for t in e['lines'] if core(t) and not any(core(t) in x for x in allt)]
        run.check('④ 跳出「出發」而且按了', went, json.dumps(said4[:12], ensure_ascii=False))
        run.check('④ 那一場演了（第一句「%s」出現）' % first, bool(first) and any(first in t for t in allt), json.dumps({'said': said4[-12:], 'hist': hist[-10:]}, ensure_ascii=False))
        run.check('④ 那一場 %d 句全部出現（逐句對 arc_invites scene）' % len(e['lines']), bool(e['lines']) and not miss, json.dumps({'miss': miss}, ensure_ascii=False))
        a5 = await arc_state(pg)
        flag = await pg.evaluate("(k=>(GAME.G.flags||{})[k]!=null)(%s)" % json.dumps(e['set'])) if e.get('set') else True
        run.check('④ 演完 ARCINV st done、記 %s' % e.get('set'), (a5['rec'] or {}).get('st') == 'done' and flag, json.dumps(a5, ensure_ascii=False)[:500])
        # ④b 演完人在哪（LAWWW-B 285c05052：arc_invites end——zone＝那個座標、spot＝那個地點、home＝回宿舍／家）
        end = e.get('end')
        for _ in range(20):
            q = await L.state(pg)
            if not q['busy'] and not q['dlg']: break
            await pg.wait_for_timeout(700)
        pos = await pg.evaluate("(()=>{ const p=GAME.E.player&&GAME.E.player.obj; const H=(typeof PLACES!=='undefined'&&PLACES.hours)?PLACES.hours[GAME.G.zone]:null; return {zone:GAME.G.zone, x:p?+p.position.x.toFixed(2):null, z:p?+p.position.z.toFixed(2):null, lv:GAME.E.player?GAME.E.player.lv|0:null, hour:+GAME.G.hour.toFixed(2), closeAt:H&&typeof H.close==='number'?H.close:null}; })()")
        hist2 = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.slice(-6).map(x=>(x.name||'')+'｜'+x.text):[]")
        caps = ' ｜ '.join(await pg.evaluate("(window.__caps||[]).slice(-6)"))
        if end:
            if end.get('zone'):
                d = ((pos['x'] - end['x']) ** 2 + (pos['z'] - end['z']) ** 2) ** 0.5 if pos['x'] is not None else 99
                run.check('④b 演完人在 %s (%s,%s) 附近（實際 %s (%s,%s)，差 %.1f m）' % (end['zone'], end['x'], end['z'], pos['zone'], pos['x'], pos['z'], d), pos['zone'] == end['zone'] and d < 3, json.dumps({'pos': pos, 'end': end}, ensure_ascii=False))
            else:
                run.check('④b 演完人不在打烊的地方（end %s → %s）' % (json.dumps(end, ensure_ascii=False), pos['zone']), not (pos['closeAt'] is not None and pos['hour'] >= pos['closeAt']), json.dumps(pos, ensure_ascii=False))
            if end.get('back'):
                run.check('④b 回程字幕「%s」' % end['back'], any(end['back'].strip('。') in t for t in hist2 + [caps]) or any(end['back'].strip('。') in t for t in said4[-4:]), json.dumps({'hist': hist2, 'cap': caps, 'said': said4[-4:]}, ensure_ascii=False))
        else:
            run.check('④b （這一版沒有 end）演完的位置', True, json.dumps(pos, ensure_ascii=False))
        await run.shot(pg, 'arcinv_after')
        run.check('⑤ 沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
